import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Field, inputCls } from '../vorlagen/ui';
import { SelectionGrid } from '../ui/SelectionGrid';
import { BetragsFeld } from '../BetragsFeld';
import { ErgebnisAnzeige } from '../ErgebnisAnzeige';
import { PdfExportButton } from '../PdfExport';
import { PflichtDisclaimer } from '../PflichtDisclaimer';
import { KANTONE } from '../../lib/kantone';
import type { Kanton } from '../../types/legal';
import type { PdfDocConfig } from '../../lib/pdf/pdfModel';
import {
  zustaendigkeitErgebnis, ZPO_SCHWELLEN,
  type ZustaendigkeitInput, type Streitsache, type MieteUnterfall, type Rechtsweg,
} from '../../lib/zustaendigkeit';
import { stelleFuer, kantonErfasst, kantonZustaendigkeit, gemeindeImKanton } from '../../data/zustaendigkeitKantone';
import { behoerdeAlsBlock } from '../../lib/vorlagen/behoerden';
import { sgPrefillKodieren } from '../../lib/vorlagen/schlichtungsgesuchBs';

// ─── Zuständigkeitsrechner – UI (Umbau 5.6.2026, Entscheid David) ───────────
// Vier-Stufen-Führung: 1) RECHTSWEG (Zivil aktiv; SchKG/Straf/Verwaltung als
// ehrliche «in Vorbereitung»-Kacheln — eigene künftige Engines, §4) →
// 2) STREITSACHE (daraus folgt die Zuständigkeitslogik) → 3) ORT/STREITWERT/
// INSTANZ → 4) konkrete Behörde MIT Adresse + ART der Eingabe + Vorlagen-Sprung.
// Reine Darstellung (§3): Bundesrecht in lib/zustaendigkeit.ts, Kantonsdaten
// in data/zustaendigkeitKantone.ts.

const DISCLAIMER =
  'Automatisierte Orientierung zur Zuständigkeit nach ZPO (Fassung seit 1.1.2025) – keine Rechtsberatung. ' +
  'Binnenverhältnis Schweiz; internationale Sachverhalte (IPRG/LugÜ), Schiedsklauseln und die ' +
  'Streitwertberechnung selbst sind nicht abgebildet. Ermessensfragen (z. B. Handelsgericht) werden ' +
  'als offene Weichen ausgewiesen; der konkrete Fall ist fachlich zu prüfen.';

const RECHTSWEGE: { code: Rechtsweg; label: string; sub: string; aktiv: boolean }[] = [
  { code: 'zivil', label: 'Zivil', sub: 'Forderungen, Miete, Arbeit, Familie (ZPO)', aktiv: true },
  { code: 'schkg', label: 'Betreibung (SchKG)', sub: 'Rechtsöffnung, Aberkennung u. a.', aktiv: false },
  { code: 'straf', label: 'Straf', sub: 'Gerichtsstand im Strafverfahren (StPO)', aktiv: false },
  { code: 'verwaltung', label: 'Verwaltung', sub: 'Beschwerdeinstanzen (VwVG/kantonal)', aktiv: false },
];

const STREITSACHEN: { code: Streitsache; label: string; sub: string }[] = [
  { code: 'geldforderung', label: 'Vertrag / Geldforderung', sub: 'Rechnung, Darlehen, Kauf u. a.' },
  { code: 'miete_wohn_geschaeft', label: 'Miete & Pacht', sub: 'Wohn-/Geschäftsräume inkl. Kündigungsschutz' },
  { code: 'arbeit', label: 'Arbeitsrecht', sub: 'Forderungen aus dem Arbeitsverhältnis' },
  { code: 'scheidung', label: 'Scheidung', sub: 'Gemeinsames Begehren oder Klage (Art. 274 ff. ZPO)' },
  { code: 'erbrecht', label: 'Erbrecht', sub: 'Erbrechtliche Klagen (Herabsetzung, Ungültigkeit, Teilung)' },
];

const MIETE_UNTERFAELLE: { code: MieteUnterfall; label: string }[] = [
  { code: 'kuendigungsschutz', label: 'Kündigungsschutz (Anfechtung der Kündigung)' },
  { code: 'erstreckung', label: 'Erstreckung des Mietverhältnisses' },
  { code: 'mietzins_anfechtung', label: 'Schutz vor missbräuchlichem Mietzins' },
  { code: 'hinterlegung', label: 'Hinterlegung des Mietzinses' },
  { code: 'sonstige', label: 'Übrige Miet-/Pachtstreitigkeit (z. B. Forderung)' },
];

// Welcher Ort ist je Streitsache örtlich massgeblich? (reine Beschriftung —
// die Regel selbst lebt in der Engine, Art. 10/23/32/33/34 ZPO)
const ORT_LABEL: Record<Streitsache, string> = {
  geldforderung: 'Wohnsitz/Sitz der beklagten Partei',
  miete_wohn_geschaeft: 'Ort der Miet-/Pachtsache',
  arbeit: 'Wohnsitz/Sitz der beklagten Partei oder gewöhnlicher Arbeitsort',
  scheidung: 'Wohnsitz einer der Parteien',
  erbrecht: 'letzter Wohnsitz der Erblasserin/des Erblassers',
};

type Instanz = 'einleitung' | 'rechtsmittel';

type State = {
  streitsache: Streitsache;
  vermoegensrechtlich: boolean;
  streitwertRoh: string;
  mieteUnterfall: MieteUnterfall;
  glgBetroffen: boolean;
  konsumentenvertrag: boolean;
  klaegeristGeschuetzt: boolean;
  geschaeftlicheTaetigkeit: boolean;
  beklagteImHR: boolean;
  klaegerImHR: boolean;
  beklagteAuslandOderUnbekannt: boolean;
  widerklageOderGerichtlicheFrist: boolean;
  gemeinde: string;
  kanton: Kanton | '';
  instanz: Instanz;
};

const DEFAULTS: State = {
  streitsache: 'geldforderung',
  vermoegensrechtlich: true,
  streitwertRoh: '',
  mieteUnterfall: 'sonstige',
  glgBetroffen: false,
  konsumentenvertrag: false,
  klaegeristGeschuetzt: true,
  geschaeftlicheTaetigkeit: false,
  beklagteImHR: false,
  klaegerImHR: false,
  beklagteAuslandOderUnbekannt: false,
  widerklageOderGerichtlicheFrist: false,
  gemeinde: '',
  kanton: '',
  instanz: 'einleitung',
};

export function ZustaendigkeitForm() {
  const [f, setF] = useState<State>(DEFAULTS);
  const set = <K extends keyof State>(k: K, v: State[K]) => setF((alt) => ({ ...alt, [k]: v }));

  const istMiete = f.streitsache === 'miete_wohn_geschaeft';
  const istArbeit = f.streitsache === 'arbeit';
  const istGeld = f.streitsache === 'geldforderung';
  const istScheidung = f.streitsache === 'scheidung';

  // Scheidung: nicht vermögensrechtlich, kein Streitwert (UI blendet aus).
  const vermoegensrechtlich = istScheidung ? false : f.vermoegensrechtlich;
  const streitwert = f.streitwertRoh.trim() === '' ? null : Number(f.streitwertRoh);
  const fehler: string[] = [];
  if (vermoegensrechtlich && streitwert === null) fehler.push('Streitwert angeben (oder «nicht vermögensrechtlich» wählen).');
  if (vermoegensrechtlich && streitwert !== null && (!Number.isFinite(streitwert) || streitwert < 0)) fehler.push('Streitwert muss eine Zahl ≥ 0 sein.');

  const input: ZustaendigkeitInput | null = fehler.length > 0 ? null : {
    streitsache: f.streitsache,
    vermoegensrechtlich,
    streitwertCHF: vermoegensrechtlich ? streitwert : null,
    mieteUnterfall: istMiete ? f.mieteUnterfall : undefined,
    glgBetroffen: istArbeit ? f.glgBetroffen : undefined,
    konsumentenvertrag: istGeld ? f.konsumentenvertrag : undefined,
    klaegeristGeschuetzt: f.klaegeristGeschuetzt,
    geschaeftlicheTaetigkeit: istGeld ? f.geschaeftlicheTaetigkeit : undefined,
    beklagteImHR: istGeld ? f.beklagteImHR : undefined,
    klaegerImHR: istGeld ? f.klaegerImHR : undefined,
    beklagteAuslandOderUnbekannt: istScheidung ? undefined : f.beklagteAuslandOderUnbekannt,
    widerklageOderGerichtlicheFrist: istScheidung ? undefined : f.widerklageOderGerichtlicheFrist,
  };

  const ergebnis = (() => {
    if (!input) return null;
    try { return zustaendigkeitErgebnis(input); } catch { return null; }
  })();
  const r = ergebnis?.resultat ?? null;

  // Stellen-Auflösung (Kantonsschicht): Schlichtungsstellen — nur Einleitung.
  const stelle = r && f.kanton && f.instanz === 'einleitung' && r.schlichtung.obligatorisch
    ? stelleFuer(f.kanton, r.schlichtung.behoerdeTyp)
    : null;
  const kantonOffen = f.kanton !== '' && !kantonErfasst(f.kanton);
  const kantonDaten = f.kanton ? kantonZustaendigkeit(f.kanton) : null;
  const gemeindeFremd = f.kanton !== '' && kantonErfasst(f.kanton)
    && f.gemeinde.trim() !== '' && !gemeindeImKanton(f.kanton, f.gemeinde);

  // CTA «Weiter zur Vorlage» (Auftrag §8): nur wenn die Ziel-Vorlage den Fall
  // trägt UND die Stelle erfasst ist; sonst ehrlich ausgeblendet.
  const sgTyp = istGeld ? 'geldforderung' as const : istArbeit ? 'arbeitsrecht' as const
    : f.streitsache === 'erbrecht' ? 'uebrige_zivilsache' as const : null;
  const sgPrefill = r && stelle && f.kanton === 'BS' && r.eingabeArt === 'schlichtungsgesuch'
    && r.schlichtung.behoerdeTyp === 'ordentlich' && sgTyp
    ? sgPrefillKodieren({ typ: sgTyp, betragCHF: vermoegensrechtlich ? streitwert : null, kanton: 'BS' })
    : null;

  const eingabeText = r === null ? '' : r.eingabeArt === 'scheidungsbegehren_oder_klage'
    ? 'Gemeinsames Scheidungsbegehren (bei Einigung) oder Scheidungsklage'
    : r.eingabeArt === 'schlichtungsgesuch' ? 'Schlichtungsgesuch (Art. 202 ZPO)' : 'Klage direkt beim Gericht';

  const pdfConfig: PdfDocConfig = {
    title: 'Zuständigkeit (ZPO)',
    rechtsgrundlage: 'Bestimmung nach Art. 4 ff., 197 ff., 243 ZPO (Fassung 1.1.2025)',
    domain: 'zustaendigkeit',
    fileBase: 'Zustaendigkeit',
    inputs: {
      'Rechtsweg': 'Zivil (ZPO)',
      'Streitsache': STREITSACHEN.find((s) => s.code === f.streitsache)?.label ?? f.streitsache,
      ...(istScheidung ? {} : { 'Streitwert': vermoegensrechtlich && streitwert !== null ? `CHF ${streitwert.toLocaleString('de-CH')}` : 'nicht vermögensrechtlich' }),
      ...(istMiete ? { 'Miet-Unterfall': MIETE_UNTERFAELLE.find((m) => m.code === f.mieteUnterfall)?.label ?? '' } : {}),
      ...(f.gemeinde.trim() ? { 'Massgeblicher Ort': f.gemeinde.trim() } : {}),
      ...(f.kanton ? { 'Kanton (Forum)': f.kanton } : {}),
    },
    hero: r ? {
      hauptlabel: 'Einleitende Eingabe',
      hauptwert: eingabeText,
      nebenwerte: [
        { label: 'Verfahrensart', wert: r.verfahrensart === 'vereinfacht' ? 'vereinfacht' : r.verfahrensart === 'scheidungsverfahren' ? 'Scheidungsverfahren' : 'ordentlich' },
        ...(stelle ? [{ label: 'Zuständige Stelle', wert: stelle.name }] : []),
      ],
      kontext: r.oertlich.gerichtsstand,
    } : undefined,
    sections: ergebnis ? [{ titel: 'Zuständigkeit nach ZPO', ergebnis }] : [],
    disclaimer: DISCLAIMER,
  };

  return (
    <div className="space-y-6">
      <PflichtDisclaimer text={DISCLAIMER} />

      {/* 1 · Rechtsweg */}
      <div className="space-y-2">
        <p className="lc-overline">1 · Rechtsweg</p>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          {RECHTSWEGE.map((w) => (
            <button key={w.code} type="button" disabled={!w.aktiv}
              aria-pressed={w.aktiv}
              title={w.aktiv ? undefined : 'In Vorbereitung — eigene Engine folgt'}
              className={`text-left p-3 rounded-lg border transition-colors ${
                w.aktiv ? 'border-brass-500 bg-brass-100/60' : 'border-line bg-surface opacity-55 cursor-not-allowed'
              }`}>
              <span className="block text-body-s font-medium text-ink-900">
                {w.label}{!w.aktiv && <span className="lc-badge lc-badge-soft ml-2">in Vorbereitung</span>}
              </span>
              <span className="block text-xs text-ink-500 mt-0.5">{w.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2 · Streitsache */}
      <div className="space-y-2">
        <p className="lc-overline">2 · Art des Streits</p>
        <SelectionGrid
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2"
          items={STREITSACHEN.map((s) => ({ code: s.code, label: s.label, sub: s.sub }))}
          value={f.streitsache}
          onSelect={(code) => set('streitsache', code)}
        />
        {istMiete && (
          <Field label="Miet-Unterfall" hint="Schutzmaterien sind streitwertunabhängig vereinfacht (Art. 243 Abs. 2 lit. c ZPO)">
            <select className={inputCls} value={f.mieteUnterfall} onChange={(e) => set('mieteUnterfall', e.target.value as MieteUnterfall)}>
              {MIETE_UNTERFAELLE.map((m) => <option key={m.code} value={m.code}>{m.label}</option>)}
            </select>
          </Field>
        )}
      </div>

      {/* 3 · Ort, Streitwert, Instanz */}
      <div className="space-y-3">
        <p className="lc-overline">3 · Ort, Streitwert, Instanz</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={`Massgeblicher Ort: ${ORT_LABEL[f.streitsache]}`} optional hint="Gemeinde (für die Auflösung der konkreten Stelle)">
            <input className={inputCls} value={f.gemeinde} onChange={(e) => set('gemeinde', e.target.value)} placeholder="z. B. Basel" />
          </Field>
          <Field label="Kanton (Forum)" hint="erfasst ist derzeit BS; übrige Kantone: bundesrechtliche Einordnung ohne Adresse">
            <select className={inputCls + ' sm:max-w-[9rem]'} value={f.kanton} onChange={(e) => set('kanton', e.target.value as Kanton | '')}>
              <option value="">– wählen –</option>
              {KANTONE.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </Field>
          {!istScheidung && (
            <Field label="Streitwert (CHF)" hint="massgeblich ist das Rechtsbegehren; die Engine berechnet den Streitwert nicht">
              <div className="space-y-1.5">
                <BetragsFeld value={f.streitwertRoh} onChange={(v) => set('streitwertRoh', v)} className={inputCls}
                  placeholder="z. B. 12'000" aria-label="Streitwert in Franken" />
                <label className="flex items-center gap-2 text-body-s cursor-pointer text-ink-700">
                  <input type="checkbox" checked={!f.vermoegensrechtlich}
                    onChange={(e) => set('vermoegensrechtlich', !e.target.checked)} />
                  nicht vermögensrechtliche Streitigkeit
                </label>
              </div>
            </Field>
          )}
          <Field label="Instanz">
            <SelectionGrid
              className="grid grid-cols-2 gap-2"
              items={[
                { code: 'einleitung' as Instanz, label: 'Einleitung', sub: 'Schlichtung bzw. erste Instanz' },
                { code: 'rechtsmittel' as Instanz, label: 'Rechtsmittel', sub: 'Berufung/Beschwerde (obere Instanz)' },
              ]}
              value={f.instanz}
              onSelect={(code) => set('instanz', code)}
            />
          </Field>
        </div>
        {gemeindeFremd && (
          <p className="lc-notice-warn text-body-s">
            «{f.gemeinde.trim()}» ist keine Gemeinde des Kantons {f.kanton} (erfasst: {kantonDaten?.gemeinden.join(', ')}) —
            Kanton oder Ort prüfen.
          </p>
        )}
      </div>

      {/* Konstellation (nur wo rechtlich relevant) */}
      {!istScheidung && (
        <div className="space-y-2">
          <p className="lc-overline">Konstellation</p>
          {istGeld && (
            <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
              <input type="checkbox" className="mt-0.5" checked={f.konsumentenvertrag} onChange={(e) => set('konsumentenvertrag', e.target.checked)} />
              <span>Konsumentenvertrag <span className="text-ink-500">(Leistung des üblichen Verbrauchs für persönliche/familiäre Bedürfnisse, Art. 32 ZPO)</span></span>
            </label>
          )}
          {istGeld && f.konsumentenvertrag && (
            <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700 pl-6">
              <input type="checkbox" className="mt-0.5" checked={f.klaegeristGeschuetzt} onChange={(e) => set('klaegeristGeschuetzt', e.target.checked)} />
              Die Konsumentin / der Konsument klagt
            </label>
          )}
          {istArbeit && (
            <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
              <input type="checkbox" className="mt-0.5" checked={f.glgBetroffen} onChange={(e) => set('glgBetroffen', e.target.checked)} />
              <span>Streit nach Gleichstellungsgesetz <span className="text-ink-500">(paritätische Behörde, vereinfacht streitwertunabhängig)</span></span>
            </label>
          )}
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={f.beklagteAuslandOderUnbekannt} onChange={(e) => set('beklagteAuslandOderUnbekannt', e.target.checked)} />
            <span>Beklagte Partei mit Sitz/Wohnsitz im Ausland oder Aufenthalt unbekannt <span className="text-ink-500">(einseitiger Schlichtungsverzicht, Art. 199 Abs. 2 ZPO)</span></span>
          </label>
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={f.widerklageOderGerichtlicheFrist} onChange={(e) => set('widerklageOderGerichtlicheFrist', e.target.checked)} />
            <span>Widerklage/Hauptintervention oder gerichtlich angesetzte Klagefrist <span className="text-ink-500">(Schlichtung entfällt, Art. 198 lit. g/h ZPO)</span></span>
          </label>
          {istGeld && (
            <details className="lc-card p-4">
              <summary className="cursor-pointer text-body-s font-medium text-ink-700">
                Handelsgerichts-Konstellation <span className="text-ink-500 font-normal">(nur Kantone mit Handelsgericht: ZH/BE/AG/SG; Art. 6 ZPO)</span>
              </summary>
              <div className="mt-3 space-y-2">
                <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
                  <input type="checkbox" className="mt-0.5" checked={f.geschaeftlicheTaetigkeit} onChange={(e) => set('geschaeftlicheTaetigkeit', e.target.checked)} />
                  Geschäftliche Tätigkeit mindestens einer Partei betroffen
                </label>
                <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
                  <input type="checkbox" className="mt-0.5" checked={f.beklagteImHR} onChange={(e) => set('beklagteImHR', e.target.checked)} />
                  Beklagte Partei im Handelsregister eingetragen
                </label>
                <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
                  <input type="checkbox" className="mt-0.5" checked={f.klaegerImHR} onChange={(e) => set('klaegerImHR', e.target.checked)} />
                  Klagende Partei im Handelsregister eingetragen
                </label>
              </div>
            </details>
          )}
        </div>
      )}

      {fehler.length > 0 && (
        <div role="alert" className="lc-notice-warn text-body-s space-y-0.5">
          {fehler.map((x, i) => <p key={i}>{x}</p>)}
        </div>
      )}

      {/* Rechtsmittel: ehrlich noch nicht aufgelöst */}
      {f.instanz === 'rechtsmittel' && (
        <p className="lc-notice text-body-s">
          Rechtsmittel-Zuständigkeit (Berufung/Beschwerde an die obere kantonale Instanz, Art. 308 ff. ZPO)
          ist noch nicht erfasst — unten gilt die Einordnung für die <strong>Einleitung</strong> des Verfahrens;
          die zuständige Rechtsmittelinstanz richtet sich nach kantonalem Recht (Art. 4 ZPO).
        </p>
      )}

      {/* 4 · Ergebnis */}
      {ergebnis && r && (
        <div className="lc-reveal space-y-4" aria-live="polite">
          <p className="lc-live lc-overline text-ink-500 normal-case" style={{ letterSpacing: '0.04em' }}>Live-Berechnung – aktualisiert sich automatisch</p>

          {/* Reihenfolge wie die Prüfung: örtlich → Verfahren → Eingabe */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'Örtlich (Grundsatz)', val: r.oertlich.gerichtsstand },
              { label: 'Verfahrensart', val: r.verfahrensart === 'vereinfacht' ? 'Vereinfacht' : r.verfahrensart === 'scheidungsverfahren' ? 'Scheidungsverfahren' : 'Ordentlich' },
              { label: 'Einleitende Eingabe', val: eingabeText },
            ].map((c) => (
              <div key={c.label} className="lc-tile">
                <p className="text-xs text-ink-500 mb-1">{c.label}</p>
                <p className="text-body-l font-semibold text-ink-900">{c.val}</p>
              </div>
            ))}
          </div>

          {/* Konkrete Stelle (Kantonsschicht) + Vorlagen-Sprung */}
          {stelle && (
            <div className="lc-card p-4 space-y-3">
              <div>
                <p className="lc-overline mb-2">Zuständige Schlichtungsstelle ({f.kanton})</p>
                <p className="text-body-s text-ink-900 whitespace-pre-line">{behoerdeAlsBlock(stelle)}</p>
                <p className="text-xs text-ink-500 mt-2">Quelle: {stelle.quelle} (Stand {stelle.stand}).</p>
              </div>
              {sgPrefill && (
                <div className="pt-3 border-t border-line">
                  <Link to={{ pathname: '/vorlagen/schlichtungsgesuch-bs', search: sgPrefill }}
                    className="lc-btn-primary no-underline">
                    Weiter zum Schlichtungsgesuch (BS) →
                  </Link>
                  <p className="text-xs text-ink-500 mt-2">Streitsache und Streitwert werden vorbefüllt — alles bleibt editierbar.</p>
                </div>
              )}
            </div>
          )}
          {r.eingabeArt === 'scheidungsbegehren_oder_klage' && f.instanz === 'einleitung' && (
            <p className="lc-notice text-body-s">
              Vorlage für das gemeinsame Scheidungsbegehren bzw. die Scheidungsklage ist in Vorbereitung —
              örtlich zuständig ist das Gericht am Wohnsitz einer der Parteien (zwingend, Art. 23 ZPO);
              das konkrete Gericht richtet sich nach kantonalem Recht (Art. 4 ZPO).
            </p>
          )}
          {r.eingabeArt === 'klage_direkt' && f.instanz === 'einleitung' && (
            <p className="lc-notice text-body-s">
              Die Klage geht direkt an das erstinstanzliche Gericht{kantonDaten?.erstinstanzName ? ` (${f.kanton}: ${kantonDaten.erstinstanzName})` : ''} —
              eine Klage-Vorlage ist in Vorbereitung.
            </p>
          )}
          {kantonOffen && (
            <p className="lc-notice text-body-s">
              Kanton {f.kanton}: Die konkreten Stellen sind noch nicht hinterlegt — die bundesrechtliche
              Einordnung oben gilt; Behörde und Adresse bitte über das kantonale Justizportal ermitteln.
            </p>
          )}
          {kantonDaten && r.schlichtung.obligatorisch && f.instanz === 'einleitung' && !stelle && !kantonOffen && (
            <p className="lc-notice text-body-s">
              Für diese Behörden-Art ist im Kanton {f.kanton} noch keine Adresse hinterlegt.
            </p>
          )}

          {r.weichen.length > 0 && (
            <div className="space-y-1.5">
              {r.weichen.map((w, i) => <p key={i} className="lc-notice text-body-s">{w}</p>)}
            </div>
          )}

          <ErgebnisAnzeige titel="Zuständigkeit nach ZPO" ergebnis={ergebnis} />
          <div className="flex flex-wrap items-center gap-3">
            <PdfExportButton config={pdfConfig} />
            <p className="text-body-s text-ink-500">
              Schwellen: vereinfacht ≤ CHF {ZPO_SCHWELLEN.VEREINFACHT.toLocaleString('de-CH')} ·
              Entscheidvorschlag ≤ {ZPO_SCHWELLEN.ENTSCHEIDVORSCHLAG.toLocaleString('de-CH')} ·
              Entscheid ≤ {ZPO_SCHWELLEN.ENTSCHEID_AUF_ANTRAG.toLocaleString('de-CH')} (ZPO-Fassung 1.1.2025).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
