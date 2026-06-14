import { useMemo, type ReactNode } from 'react';
import { DatumsFeld } from '../DatumsFeld';
import { Field, inputCls } from './ui';
import { useWizardState } from './useWizardState';
import { VorlagenWizardRahmen, VorschauPanel, ExportLeiste } from './wizard';
import { karte } from '../../lib/startseiteConfig';
import { docxAktiv, istIsoDatum } from './seiteHelfer';
import type { AssembleErgebnis } from '../../lib/vorlagen/engine';
import type { PdfBanner } from '../../lib/vorlagen/banner';

// ─── Generische Vorlagen-Seite (FUNDAMENT-UMBAU Thema A, opt-in) ────────────
//
// Übernimmt die in allen linearen Vorlagen IDENTISCHE, kopier-fehleranfällige
// Orchestrierung — und NUR diese (§3, reine Darstellung):
//   • useWizardState + die zwei useMemo (zusammenstellen / pruefeGates),
//   • das fehlerImSchritt-Gerüst (letzter Schritt: Ort + ISO-Datum + Blocker),
//   • den «pruefen»-Schritt (gates.hinweise · Ort/Datum-Raster · Bestätigungs-
//     Sektion · ExportLeiste mit dem DOCX-Form-Gate),
//   • VorlagenWizardRahmen + VorschauPanel (Direkt-Export mit demselben Gate).
//
// Das seiten-SPEZIFISCHE JSX (Eingabe-Schritte, Bestätigungs-Bullets) bleibt in
// der Config-Datei der Seite — eine generische Abstraktion über fachlich
// verschiedene Felder wäre §1-widrig. KEINE Rechtslogik hier: zusammenstellen/
// pruefeGates/Normtexte kommen als fertige Funktionsreferenzen aus src/lib.
// Opt-in nur für LINEARE Standard-Briefe; Seiten mit Toggles, dynamischen
// Labels, berechneten Live-Hinweisen oder Sonder-Props bleiben handgeschrieben.

/** Einheitliche Gate-Form aller Vorlagen-Engines. */
export type VorlagenGates = { blocker: string[]; warnungen: string[]; hinweise: string[] };

/** Kontext für die Eingabe-Schritt-Renderer der Seite. */
export interface SeiteCtx<T> {
  a: T;
  set: <K extends keyof T>(k: K, v: T[K]) => void;
}

export interface VorlagenSeitenConfig<T extends { ort: string; datum: string }> {
  /** Katalog-Id (startseiteConfig) — liefert rechtsgebiet, norms, modus/output. */
  cardId: string;
  defaults: T;
  speicherKey: string;
  /** Reine Engine-Referenzen (src/lib) — keine Logik in dieser Schicht. */
  zusammenstellen: (a: T) => { ergebnis: AssembleErgebnis };
  pruefeGates: (a: T) => VorlagenGates;
  schritte: readonly { id: string; label: string }[];
  // Rahmen-Kopf
  overlineFallback: string;       // Rechtsgebiet-Fallback, falls Karte fehlt
  titel: string;
  intro: ReactNode;
  badge: string;
  // Eingabe-Schritte (alle ausser dem letzten «pruefen»-Schritt)
  eingabeInhalt: (ctx: SeiteCtx<T>, schritt: number) => ReactNode;
  /** Pflichtfeld-Fehler je Eingabe-Schritt (NICHT für den letzten Schritt).
   *  `gates` für Seiten, die schon in einem Eingabe-Schritt einen fachlichen
   *  Blocker spiegeln (z. B. Nichtbekanntgabe: Rechtsvorschlag-Voraussetzung). */
  fehlerEingabe: (a: T, schritt: number, gates: VorlagenGates) => string[];
  // «pruefen»-Schritt
  /** Im pruefen-Schritt zusätzlich gates.warnungen (lc-notice-warn) VOR den
   *  Hinweisen rendern (nur Seiten, die das tun — z. B. Nichtbekanntgabe). */
  zeigeWarnungen?: boolean;
  /** Ob der letzte-Schritt-Fehler die gates.blocker enthält (Default true).
   *  false z. B. bei Mahnung, deren Navigations-Fehler nur Ort/Datum prüft
   *  (Blocker sperren dort nur den Export, nicht die Fehlerbox). */
  blockerImLetztenSchritt?: boolean;
  ortDatumLabel: string;
  ortPlaceholder: string;
  ortFehler: string;
  datumFehler: string;
  /** Inhalt der lc-highlight-Sektion ÜBER der Bestätigungs-Checkbox. */
  bestaetigung: ReactNode;
  bestaetigungLabel: ReactNode;
  // Export
  banner: PdfBanner;
  dateiBasis: string;             // z. B. 'Abtretungserklaerung' → .pdf/.docx
  pdfLabel: string;
  docxLabel: string;
}

export function VorlagenSeite<T extends { ort: string; datum: string }>(
  { config }: { config: VorlagenSeitenConfig<T> },
) {
  const card = karte(config.cardId);
  const { a, set, schritt, setSchritt, bestaetigt, setBestaetigt, kopiert, kopieren, zuruecksetzen } =
    useWizardState<T>({ defaults: config.defaults, speicherKey: config.speicherKey });

  const { ergebnis } = useMemo(() => config.zusammenstellen(a), [a, config]);
  const gates = useMemo(() => config.pruefeGates(a), [a, config]);

  const letzter = config.schritte.length - 1;

  const fehlerImSchritt = (i: number): string[] => {
    if (i !== letzter) return config.fehlerEingabe(a, i, gates);
    const f: string[] = [];
    if (!a.ort.trim()) f.push(config.ortFehler);
    if (!istIsoDatum(a.datum)) f.push(config.datumFehler);
    if (config.blockerImLetztenSchritt !== false) f.push(...gates.blocker);
    return f;
  };
  const fehler = fehlerImSchritt(schritt);

  const docxZiel = (label: string) =>
    docxAktiv(card) ? { label, banner: config.banner, dateiName: `${config.dateiBasis}.docx` } : undefined;

  const pruefenInhalt = (
    <div className="space-y-5">
      {config.zeigeWarnungen && gates.warnungen.map((w, i) => (
        <div key={`w${i}`} className="lc-notice-warn text-body-s">{w}</div>
      ))}
      {gates.hinweise.map((h, i) => (
        <div key={i} className="lc-notice text-body-s">{h}</div>
      ))}

      <Field label={config.ortDatumLabel}>
        <div className="grid grid-cols-[1fr_11rem] gap-3">
          <input className={inputCls} value={a.ort} onChange={(e) => set('ort', e.target.value as T['ort'])} placeholder={config.ortPlaceholder} />
          <DatumsFeld value={a.datum} onChange={(v) => set('datum', v as T['datum'])} className={inputCls} />
        </div>
      </Field>

      <section className="lc-highlight space-y-3">
        {config.bestaetigung}
        <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-900 font-medium pt-1">
          <input type="checkbox" className="mt-0.5" checked={bestaetigt} onChange={(e) => setBestaetigt(e.target.checked)} />
          {config.bestaetigungLabel}
        </label>
      </section>

      <ExportLeiste ergebnis={ergebnis} deaktiviert={!bestaetigt || gates.blocker.length > 0}
        kopiert={kopiert} onKopieren={kopieren}
        pdf={{ label: config.pdfLabel, banner: config.banner, dateiName: `${config.dateiBasis}.pdf` }}
        docx={docxZiel(config.docxLabel)} />
    </div>
  );

  const inhalt = schritt === letzter ? pruefenInhalt : config.eingabeInhalt({ a, set }, schritt);

  return (
    <VorlagenWizardRahmen
      overline={`${card?.rechtsgebiet ?? config.overlineFallback} · Vorlage`}
      titel={config.titel}
      intro={config.intro}
      norms={card?.norms ?? []}
      badge={config.badge}
      zuruecksetzen={zuruecksetzen}
      schritte={config.schritte} schritt={schritt} setSchritt={setSchritt}
      fehler={fehler}
      inhalt={inhalt}
      vorschau={<VorschauPanel ergebnis={ergebnis} direktExport={{
        pdf: { label: 'PDF', banner: config.banner, dateiName: `${config.dateiBasis}.pdf` },
        docx: docxZiel('DOCX'),
        blocker: gates.blocker,
      }} />}
    />
  );
}
