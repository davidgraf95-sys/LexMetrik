import { useState } from 'react';
import { Field, inputCls } from '../vorlagen/ui';
import { Tabs } from '../ui/Tabs';
import { Link, useNavigate } from 'react-router-dom';
import {
  allgemeineFristErgebnis, tageZwischen, ALLG_FRIST_HINWEIS,
  rueckwaertsErgebnis, zustellHinweis, icsFuerFrist, fristQueryKodieren, fristQueryLesen,
  type AllgFristInput, type Einheit, type RueckVerschiebung, type ZustellArt,
} from '../../lib/allgemeineFrist';
import type { Berechnungsergebnis, Kanton } from '../../types/legal';
import type { PdfDocConfig } from '../../lib/pdf/pdfModel';
import { ErgebnisAnzeige } from '../ErgebnisAnzeige';
import { DatumsFeld } from '../DatumsFeld';
import { PdfExportButton } from '../PdfExport';
import { PflichtDisclaimer } from '../PflichtDisclaimer';
import { KANTONE } from '../../lib/kantone';

// ─── Allgemeiner Fristenrechner (Free) – UI ─────────────────────────────────
// Reine Darstellung; sämtliche Rechtsregeln liegen in lib/allgemeineFrist.ts.
// Zwei Tabs: «Fristende berechnen» (Hauptmodus) und das rein informative
// Hilfsmittel «Tage zwischen zwei Daten» (ohne Rechtsbezug, Auftrag §4).

const DISCLAIMER =
  'Automatisierte Orientierungsberechnung nach Art. 77/78 OR – keine Rechtsberatung. ' +
  'Der Rechner ermittelt das Fristende ab dem eingegebenen Startdatum; den Fristbeginn ' +
  '(z. B. Zustellfiktionen) bestimmt er nicht. Verfahrensspezifische Stillstände ' +
  '(Gerichts-/Betreibungsferien) berücksichtigt er nicht.';

const EINHEITEN: { code: Einheit; label: string }[] = [
  { code: 'tage', label: 'Tage' },
  { code: 'wochen', label: 'Wochen' },
  { code: 'monate', label: 'Monate' },
  { code: 'jahre', label: 'Jahre' },
];

type State = Omit<AllgFristInput, 'kanton'> & { kanton: Kanton };

const DEFAULTS: State = {
  start: '2026-06-05', laenge: 30, einheit: 'tage',
  wochenendeVerschieben: true, feiertageVerschieben: true, kanton: 'ZH',
};

// Presets setzen nur Einheit/Toggles – keine vorgetäuschte Subsumtion.
const PRESETS: { label: string; patch: Partial<State>; info?: string }[] = [
  { label: 'Tagesfrist (Kalendertage)', patch: { einheit: 'tage', wochenendeVerschieben: true, feiertageVerschieben: true } },
  { label: 'Monatsfrist nach OR', patch: { einheit: 'monate', laenge: 1, wochenendeVerschieben: true, feiertageVerschieben: true },
    info: 'endet am gleichbezeichneten Tag (BGE 150 III 367)' },
  { label: 'Kalendertage ohne Verschiebung', patch: { einheit: 'tage', wochenendeVerschieben: false, feiertageVerschieben: false } },
];

export function AllgemeineFristForm() {
  const [tab, setTab] = useState<'frist' | 'rueckwaerts' | 'zwischen'>('frist');
  // Permalink (P1.4): Eingaben werden beim ersten Render deterministisch
  // aus der URL rekonstruiert (Lazy-Initializer statt Effekt).
  const [form, setForm] = useState<State>(() => {
    try {
      const aus = fristQueryLesen(window.location.search);
      return aus ? { ...DEFAULTS, ...aus } : DEFAULTS;
    } catch { return DEFAULTS; }
  });
  const [von, setVon] = useState('2026-06-05');
  const [bis, setBis] = useState('2026-07-05');
  // P1.1 Rückwärtsmodus
  const [rueck, setRueck] = useState<{ stichtag: string; laenge: number; einheit: Einheit; verschiebung: RueckVerschiebung }>({
    stichtag: '2026-06-30', laenge: 20, einheit: 'tage', verschiebung: 'keine',
  });
  // P1.2 Zustell-Helfer (rein informativ)
  const [zustellArt, setZustellArt] = useState<ZustellArt | ''>('');
  const [zustellDatum, setZustellDatum] = useState('');
  const [kopiertLink, setKopiertLink] = useState(false);
  const navigate = useNavigate();

  const set = <K extends keyof State>(k: K, v: State[K]) => setForm((f) => ({ ...f, [k]: v }));

  // P1.3 Validierung (sichtbare Meldungen statt stillem Verhalten)
  const fehler: string[] = [];
  if (tab === 'frist') {
    if (!form.start) fehler.push('Startdatum angeben.');
    if (!Number.isInteger(form.laenge) || form.laenge <= 0) fehler.push('Fristlänge muss eine ganze Zahl grösser 0 sein.');
  }
  if (tab === 'rueckwaerts') {
    if (!rueck.stichtag) fehler.push('Stichtag angeben.');
    if (!Number.isInteger(rueck.laenge) || rueck.laenge <= 0) fehler.push('Fristlänge muss eine ganze Zahl grösser 0 sein.');
  }
  const bisVorVon = tab === 'zwischen' && von && bis && bis < von;

  // Live-Berechnung (rein; Fehler → keine Anzeige)
  const ergebnis: (Berechnungsergebnis & { resultat: { endDatum: string; endDatumISO: string; endWochentag: string } }) | null =
    (() => { try { return allgemeineFristErgebnis(form); } catch { return null; } })();

  const rueckErgebnis: (Berechnungsergebnis & { resultat: { endDatum: string; endDatumISO: string; endWochentag: string } }) | null =
    (() => {
      try {
        return rueckwaertsErgebnis({ ...rueck, feiertageBeruecksichtigen: rueck.verschiebung === 'vorverlegen', kanton: form.kanton });
      } catch { return null; }
    })();

  const zustell = (() => {
    if (!zustellArt || !zustellDatum) return null;
    try { return zustellHinweis(zustellArt, zustellDatum, form.kanton); } catch { return null; }
  })();

  const zwischen: { kalendertage: number; werktageMoFr: number } | null =
    (() => { try { return tageZwischen(von, bis); } catch { return null; } })();

  // P1.4 Exporte (clientseitig, deterministisch)
  const icsLaden = (endISO: string, titel: string) => {
    const blob = new Blob([icsFuerFrist({ titel, endISO, beschreibung: 'Berechnet mit LexMetrik (Art. 77/78 OR) – Orientierung, keine Rechtsberatung.', vorfristTage: 3 })], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'Fristende.ics'; a.click();
    URL.revokeObjectURL(url);
  };
  const linkKopieren = () => {
    const q = fristQueryKodieren(form);
    navigate({ search: q }, { replace: true });
    try {
      void navigator.clipboard.writeText(`${location.origin}/rechner/tagerechner?${q}`);
      setKopiertLink(true); setTimeout(() => setKopiertLink(false), 1600);
    } catch { /* Clipboard nicht verfügbar */ }
  };

  const pdfConfig: PdfDocConfig = {
    title: 'Allgemeine Frist',
    rechtsgrundlage: 'Berechnung nach Art. 77/78 OR',
    domain: 'allgemeine-frist',
    fileBase: 'Fristenrechner',
    inputs: {
      'Startdatum (Ereignis)': form.start.split('-').reverse().join('.'),
      'Fristlänge': `${form.laenge} ${EINHEITEN.find((e) => e.code === form.einheit)?.label}`,
      'Wochenenden verschieben': form.wochenendeVerschieben ? 'ja' : 'nein',
      'Feiertage verschieben': form.feiertageVerschieben ? `ja (${form.kanton})` : 'nein',
    },
    hero: ergebnis ? {
      hauptlabel: 'Fristende (24.00 Uhr)',
      hauptwert: ergebnis.resultat.endDatum,
      nebenwerte: [{ label: 'Wochentag', wert: ergebnis.resultat.endWochentag }],
      kontext: `${form.laenge} ${EINHEITEN.find((e) => e.code === form.einheit)?.label} ab ${form.start.split('-').reverse().join('.')}`,
    } : undefined,
    sections: ergebnis ? [{ titel: 'Allgemeine Frist (Art. 77/78 OR)', ergebnis }] : [],
    disclaimer: DISCLAIMER,
  };

  return (
    <div className="space-y-6">
      <PflichtDisclaimer text={DISCLAIMER} />

      {/* Tabs: Hauptmodus + informatives Hilfsmittel */}
      <Tabs
        items={[
          { code: 'frist', label: 'Fristende berechnen' },
          { code: 'rueckwaerts', label: 'Rückwärts (spätester Tag)' },
          { code: 'zwischen', label: 'Tage zwischen zwei Daten' },
        ] as const}
        value={tab}
        onChange={setTab}
      />

      {fehler.length > 0 && (
        <div role="alert" className="lc-notice-danger text-body-s space-y-0.5">
          {fehler.map((f, i) => <p key={i}>{f}</p>)}
        </div>
      )}

      {tab === 'frist' ? (
        <>
          {/* P1.2 Zustell-/Zugangs-Helfer – REIN INFORMATIV, keine Subsumtion */}
          <details className="lc-card p-4">
            <summary className="cursor-pointer text-body-s font-medium text-ink-700">
              Wie wurde die Frist ausgelöst? <span className="text-ink-500 font-normal">(optionaler Hinweis-Helfer – keine verbindliche Zustellberechnung)</span>
            </summary>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
              <Field label="Zustellart">
                <select className={inputCls} value={zustellArt} onChange={(e) => setZustellArt(e.target.value as ZustellArt | '')}>
                  <option value="">– wählen –</option>
                  <option value="uebergabe">Persönliche Übergabe / Empfang</option>
                  <option value="einschreiben">Einschreiben – erfolgloser Zustellversuch</option>
                  <option value="apostplus">Gewöhnliche Post / A-Post Plus</option>
                </select>
              </Field>
              <Field label={zustellArt === 'einschreiben' ? 'Datum des Zustellversuchs' : 'Zustell-/Empfangsdatum'}>
                <DatumsFeld value={zustellDatum} onChange={setZustellDatum} className={inputCls} />
              </Field>
              {zustell && (
                <button type="button" className="lc-btn-outline lc-btn-sm mb-0.5"
                  onClick={() => set('start', zustell.vorschlagISO)}>
                  Vorschlag übernehmen: {zustell.vorschlagFmt}
                </button>
              )}
            </div>
            {zustell && (
              <div className="mt-3 space-y-1.5">
                {zustell.hinweise.map((h, i) => <p key={i} className="text-body-s text-ink-600">{h}</p>)}
              </div>
            )}
          </details>

          {/* Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="lc-overline text-ink-500 normal-case">Voreinstellung:</span>
            {PRESETS.map((p) => (
              <button type="button" key={p.label} onClick={() => setForm((f) => ({ ...f, ...p.patch }))}
                title={p.info} className="lc-chip hover:bg-brass-200 transition-colors">{p.label}</button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Startdatum (auslösendes Ereignis)" hint="zählt nicht mit – dies a quo non computatur (Art. 77 OR)">
              <DatumsFeld value={form.start} onChange={(v) => set('start', v)} className={inputCls} />
            </Field>
            <div className="grid grid-cols-[7rem_1fr] gap-3">
              <Field label="Länge">
                <input type="number" min={1} step={1} className={inputCls + ' num'} value={form.laenge}
                  onChange={(e) => set('laenge', Math.max(1, Math.round(Number(e.target.value) || 1)))} />
              </Field>
              <Field label="Einheit">
                <select className={inputCls} value={form.einheit} onChange={(e) => set('einheit', e.target.value as Einheit)}>
                  {EINHEITEN.map((e) => <option key={e.code} value={e.code}>{e.label}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Fristende verschieben">
              <div className="space-y-1.5 pt-1">
                {/* Rechtlich EINE Operation «nächster Werktag»: Feiertage
                    implizieren die Wochenend-Verschiebung (gekoppelt) */}
                <label className="flex items-center gap-2 text-body-s cursor-pointer text-ink-700">
                  <input type="checkbox" checked={form.wochenendeVerschieben || form.feiertageVerschieben}
                    onChange={(e) => setForm((f) => ({ ...f, wochenendeVerschieben: e.target.checked, feiertageVerschieben: e.target.checked && f.feiertageVerschieben }))} />
                  Samstag/Sonntag → nächster Werktag (Art. 78 OR; SR 173.110.3)
                </label>
                <label className="flex items-center gap-2 text-body-s cursor-pointer text-ink-700">
                  <input type="checkbox" checked={form.feiertageVerschieben}
                    onChange={(e) => setForm((f) => ({ ...f, feiertageVerschieben: e.target.checked, wochenendeVerschieben: f.wochenendeVerschieben || e.target.checked }))} />
                  zusätzlich gesetzliche Feiertage (kantonal)
                </label>
              </div>
            </Field>
            {form.feiertageVerschieben && (
              <Field label="Kanton (Erfüllungsort)" hint="Feiertage nach EJPD-Verzeichnis, Stand 2011; regionale Besonderheiten im Einzelfall prüfen">
                <select className={inputCls + ' sm:max-w-[9rem]'} value={form.kanton} onChange={(e) => set('kanton', e.target.value as Kanton)}>
                  {KANTONE.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </Field>
            )}
          </div>

          {ergebnis && (
            <div className="lc-reveal space-y-4" aria-live="polite">
              <ErgebnisAnzeige titel="Allgemeine Frist (Art. 77/78 OR)" ergebnis={ergebnis} />
              <div className="flex flex-wrap items-center gap-3">
                <PdfExportButton config={pdfConfig} />
                <button type="button" className="lc-btn-outline"
                  onClick={() => icsLaden(ergebnis.resultat.endDatumISO, `Fristende (${form.laenge} ${EINHEITEN.find((e) => e.code === form.einheit)?.label})`)}>
                  In Kalender (.ics)
                </button>
                <button type="button" className="lc-btn-ghost lc-btn-sm" onClick={linkKopieren}>
                  {kopiertLink ? 'Link kopiert ✓' : 'Link teilen'}
                </button>
                <p className="text-body-s text-ink-500">
                  {ALLG_FRIST_HINWEIS.replace(' den ZPO-Fristenrechner, für betreibungsrechtliche den SchKG-Fristenrechner verwenden.', ':')}{' '}
                  <Link to="/rechner/zpo-fristen" className="text-brass-700 no-underline hover:text-brass-600">ZPO-Fristen →</Link>{' · '}
                  <Link to="/rechner/schkg-fristen" className="text-brass-700 no-underline hover:text-brass-600">SchKG-Fristen →</Link>
                </p>
              </div>
            </div>
          )}
        </>
      ) : tab === 'rueckwaerts' ? (
        <div className="space-y-4">
          <p className="lc-notice text-body-s">
            Rückwärtsfrist: ermittelt den SPÄTESTEN Handlungstag, damit zwischen Handlung und Stichtag
            die volle Frist liegt (z. B. «Einberufung mindestens 20 Tage vor der Generalversammlung»,
            Art. 700 Abs. 1 OR). Keine automatische Verschiebung – die Verschiebungsrichtung bei
            Wochenend-/Feiertagskollision ist höchstrichterlich ungeklärt.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Stichtag / Termin" hint="bis zu dem die Frist gewahrt sein muss">
              <DatumsFeld value={rueck.stichtag} onChange={(v) => setRueck((r) => ({ ...r, stichtag: v }))} className={inputCls} />
            </Field>
            <div className="grid grid-cols-[7rem_1fr] gap-3">
              <Field label="Länge">
                <input type="number" min={1} step={1} className={inputCls + ' num'} value={rueck.laenge}
                  aria-invalid={!Number.isInteger(rueck.laenge) || rueck.laenge <= 0}
                  onChange={(e) => setRueck((r) => ({ ...r, laenge: Number(e.target.value) }))} />
              </Field>
              <Field label="Einheit">
                <select className={inputCls} value={rueck.einheit} onChange={(e) => setRueck((r) => ({ ...r, einheit: e.target.value as Einheit }))}>
                  {EINHEITEN.map((e) => <option key={e.code} value={e.code}>{e.label}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Bei Wochenende/Feiertag" hint="Vorverlegung ist in der Schweiz höchstrichterlich ungeklärt – zu verifizieren">
              <select className={inputCls} value={rueck.verschiebung}
                onChange={(e) => setRueck((r) => ({ ...r, verschiebung: e.target.value as RueckVerschiebung }))}>
                <option value="keine">Keine Verschiebung (Standard – im Zweifel früher handeln)</option>
                <option value="vorverlegen">Vorverlegen auf den vorangehenden Werktag (Option, mit Vorbehalt)</option>
              </select>
            </Field>
            {rueck.verschiebung === 'vorverlegen' && (
              <Field label="Kanton (Feiertage)">
                <select className={inputCls + ' sm:max-w-[9rem]'} value={form.kanton} onChange={(e) => set('kanton', e.target.value as Kanton)}>
                  {KANTONE.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </Field>
            )}
          </div>
          {rueckErgebnis && (
            <div className="lc-reveal space-y-4" aria-live="polite">
              <ErgebnisAnzeige titel="Rückwärtsfrist – spätester Handlungstag" ergebnis={rueckErgebnis} />
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" className="lc-btn-outline"
                  onClick={() => icsLaden(rueckErgebnis.resultat.endDatumISO, 'Spätester Handlungstag')}>
                  In Kalender (.ics)
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="lc-notice text-body-s">
            Reines Zählwerkzeug ohne Rechtsbezug – für Fristen den Tab «Fristende berechnen» verwenden.
          </p>
          {bisVorVon && (
            <p className="lc-notice-warn text-body-s" role="alert">
              «Bis» liegt vor «Von» – angezeigt wird der Abstand als Betrag.
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Von"><DatumsFeld value={von} onChange={setVon} className={inputCls} /></Field>
            <Field label="Bis"><DatumsFeld value={bis} onChange={setBis} className={inputCls} /></Field>
          </div>
          {zwischen && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lc-reveal">
              <div className="lc-tile">
                <p className="lc-overline mb-1">Kalendertage</p>
                <p className="num text-h2 leading-none font-medium text-ink-900">{zwischen.kalendertage}</p>
              </div>
              <div className="lc-tile">
                <p className="lc-overline mb-1">Werktage (Mo–Fr, informativ)</p>
                <p className="num text-h2 leading-none font-medium text-ink-900">{zwischen.werktageMoFr}</p>
                <p className="text-xs text-ink-500 mt-1">ohne Feiertagsbezug – kein rechtlicher Fristbegriff</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
