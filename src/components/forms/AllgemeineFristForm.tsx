import { useState } from 'react';
import { Field, inputCls } from '../vorlagen/ui';
import { Link } from 'react-router-dom';
import {
  allgemeineFristErgebnis, tageZwischen, ALLG_FRIST_HINWEIS,
  type AllgFristInput, type Einheit,
} from '../../lib/allgemeineFrist';
import type { Berechnungsergebnis, Kanton } from '../../types/legal';
import type { PdfDocConfig } from '../../lib/pdf/pdfModel';
import { ErgebnisAnzeige } from '../ErgebnisAnzeige';
import { DatumsFeld } from '../DatumsFeld';
import { PdfExportButton } from '../PdfExport';
import { PflichtDisclaimer } from '../PflichtDisclaimer';
import { KANTONE } from '../../lib/kantone';

// ─── Allgemeiner Fristenrechner (Free) — UI ─────────────────────────────────
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

// Presets setzen nur Einheit/Toggles — keine vorgetäuschte Subsumtion.
const PRESETS: { label: string; patch: Partial<State>; info?: string }[] = [
  { label: 'Tagesfrist (Kalendertage)', patch: { einheit: 'tage', wochenendeVerschieben: true, feiertageVerschieben: true } },
  { label: 'Monatsfrist nach OR', patch: { einheit: 'monate', laenge: 1, wochenendeVerschieben: true, feiertageVerschieben: true },
    info: 'endet am gleichbezeichneten Tag (BGer 5A_691/2023)' },
  { label: 'Kalendertage ohne Verschiebung', patch: { einheit: 'tage', wochenendeVerschieben: false, feiertageVerschieben: false } },
];

export function AllgemeineFristForm() {
  const [tab, setTab] = useState<'frist' | 'zwischen'>('frist');
  const [form, setForm] = useState<State>(DEFAULTS);
  const [von, setVon] = useState('2026-06-05');
  const [bis, setBis] = useState('2026-07-05');

  const set = <K extends keyof State>(k: K, v: State[K]) => setForm((f) => ({ ...f, [k]: v }));

  // Live-Berechnung (rein; Fehler → keine Anzeige)
  let ergebnis: (Berechnungsergebnis & { resultat: { endDatum: string; endWochentag: string } }) | null = null;
  try { ergebnis = allgemeineFristErgebnis(form); } catch { ergebnis = null; }

  let zwischen: { kalendertage: number; werktageMoFr: number } | null = null;
  try { zwischen = tageZwischen(von, bis); } catch { zwischen = null; }

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
      <div className="flex h-9 items-stretch gap-1 p-0.5 bg-surface border border-line rounded-lg w-fit" role="tablist">
        {([['frist', 'Fristende berechnen'], ['zwischen', 'Tage zwischen zwei Daten']] as const).map(([code, label]) => (
          <button key={code} type="button" role="tab" aria-selected={tab === code} onClick={() => setTab(code)}
            className={`px-3 rounded-md text-body-s font-medium transition-all ${
              tab === code ? 'bg-surface-raised text-brass-700 shadow-sm border border-line' : 'text-ink-600 hover:text-ink-900'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'frist' ? (
        <>
          {/* Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="lc-overline text-ink-500 normal-case">Voreinstellung:</span>
            {PRESETS.map((p) => (
              <button key={p.label} onClick={() => setForm((f) => ({ ...f, ...p.patch }))}
                title={p.info} className="lc-chip hover:bg-brass-200 transition-colors">{p.label}</button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Startdatum (auslösendes Ereignis)" hint="zählt nicht mit — dies a quo non computatur (Art. 77 OR)">
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
                <label className="flex items-center gap-2 text-body-s cursor-pointer text-ink-700">
                  <input type="checkbox" checked={form.wochenendeVerschieben} onChange={(e) => set('wochenendeVerschieben', e.target.checked)} />
                  Samstag/Sonntag → nächster Werktag (Art. 78 OR; SR 173.110.3)
                </label>
                <label className="flex items-center gap-2 text-body-s cursor-pointer text-ink-700">
                  <input type="checkbox" checked={form.feiertageVerschieben} onChange={(e) => set('feiertageVerschieben', e.target.checked)} />
                  Gesetzliche Feiertage → nächster Werktag
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
            <div className="lc-reveal space-y-4">
              <ErgebnisAnzeige titel="Allgemeine Frist (Art. 77/78 OR)" ergebnis={ergebnis} />
              <div className="flex flex-wrap items-center gap-3">
                <PdfExportButton config={pdfConfig} />
                <p className="text-body-s text-ink-500">
                  {ALLG_FRIST_HINWEIS.replace(' den ZPO-Fristenrechner, für betreibungsrechtliche den SchKG-Fristenrechner verwenden.', ':')}{' '}
                  <Link to="/rechner/zpo-fristen" className="text-brass-700 no-underline hover:text-brass-600">ZPO-Fristen →</Link>{' · '}
                  <Link to="/rechner/schkg-fristen" className="text-brass-700 no-underline hover:text-brass-600">SchKG-Fristen →</Link>
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <p className="lc-notice text-body-s">
            Reines Zählwerkzeug ohne Rechtsbezug — für Fristen den Tab «Fristende berechnen» verwenden.
          </p>
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
                <p className="text-xs text-ink-500 mt-1">ohne Feiertagsbezug — kein rechtlicher Fristbegriff</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
