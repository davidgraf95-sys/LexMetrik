import { useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { Link } from 'react-router-dom';
import { FehlerBox, NormLink, Stepper } from './ui';
import { useLocale, fedlexLokalisiert } from '../locale';
import { dokumentAlsText } from '../../lib/vorlagen/vorlagenText';
import type { AssembleErgebnis } from '../../lib/vorlagen/engine';
import { AUSGABE_LABEL, MUSTER } from '../../lib/vorlagen/formatvorlagen';
import type { PdfBanner } from '../../lib/vorlagen/banner';

// ─── Generischer Vorlagen-Wizard-Rahmen ─────────────────────────────────────
//
// Der in allen Vorlagen identische Rahmen (CLAUDE.md §10): Kopf mit
// Rückweg/Normen/Badge, Stepper, zweispaltiges Layout (Formular-Karte mit
// Fehlerbox und Zurück/Weiter, Vorschau mobil einklappbar / Desktop klebend),
// dazu VorschauPanel («Papier» + Bausteinprotokoll) und ExportLeiste
// (PDF lazy, DOCX lazy, Text kopieren). Eine neue Vorlage liefert nur noch
// Schema, Schritte und Schritt-Inhalte – KEINE Fachlogik hier (§3).

export function VorlagenWizardRahmen({
  zurueckHref = '/', overline, titel, intro, norms, badge,
  fussnote, zuruecksetzen, schritte, schritt, setSchritt, fehler,
  weiterDeaktiviert, inhalt, vorschau, kopfSchalter,
}: {
  zurueckHref?: string;
  overline: string;
  titel: string;
  intro: ReactNode;
  norms: { label: string; url: string }[];
  badge: string;
  /** Eigener Speicher-Hinweis (z. B. «wird nicht gespeichert»); ersetzt den Standard-Hinweis. */
  fussnote?: ReactNode;
  /** Wenn gesetzt: sichtbarer «Eingaben zurücksetzen»-Button (mit Rückfrage) + Speicher-Hinweis. */
  zuruecksetzen?: () => void;
  schritte: readonly { id: string; label: string }[];
  schritt: number;
  setSchritt: Dispatch<SetStateAction<number>>;
  fehler?: string[];
  /** Default: fehler vorhanden. Überschreibbar (z. B. Stopp-Karten). */
  weiterDeaktiviert?: boolean;
  inhalt: ReactNode;
  vorschau: ReactNode;
  /** Optionaler Kopf-Schalter (Detailgrad/Untertyp, FAHRPLAN-VERTRAGS-VARIANTEN
   *  P0) – wird zwischen Kopf und Stepper gerendert. Reine Darstellung (§3). */
  kopfSchalter?: ReactNode;
}) {
  const { locale } = useLocale();
  const weiterAus = weiterDeaktiviert ?? (fehler != null && fehler.length > 0);
  // Grundsatz David (14.6.2026): im leeren Anfangszustand keine Eingabefehler
  // zeigen — die Fehlerbox erscheint erst, nachdem der Nutzer etwas eingegeben
  // hat («berührt»). Der «Weiter»-Button bleibt bei leeren Pflichtfeldern
  // weiterhin deaktiviert (weiterAus oben), nur die MELDUNG wird zurückgehalten.
  const [beruehrt, setBeruehrt] = useState(false);
  const merkeEingabe = () => { if (!beruehrt) setBeruehrt(true); };

  // Mobile Live-Vorschau (Redesign E6): sie ist das Kernversprechen, war aber
  // auf dem Telefon in allen Eingabe-Schritten zugeklappt. Jetzt steuerbar +
  // automatisch offen, sobald der Prüfen-Schritt erreicht ist (Render-Phasen-
  // Abgleich statt Effect — lint-konform).
  const [vorschauOffen, setVorschauOffen] = useState(false);
  const [letzterSchritt, setLetzterSchritt] = useState(schritt);
  if (schritt !== letzterSchritt) {
    setLetzterSchritt(schritt);
    if (schritt === schritte.length - 1 && !vorschauOffen) setVorschauOffen(true);
  }
  const zurVorschau = () => {
    setVorschauOffen(true);
    const rm = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    document.getElementById('wizard-vorschau')?.scrollIntoView({ behavior: rm ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-6">
      {/* Kopf */}
      <div className="space-y-3">
        <Link to={zurueckHref} className="inline-flex items-center gap-2 no-underline text-body-s font-medium text-brass-700 hover:text-brass-600">
          <span aria-hidden className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-line bg-surface">←</span>
          Zurück zum Katalog
        </Link>
        <p className="lc-overline">{overline}</p>
        <h1 className="text-h2 sm:text-h1 font-display font-semibold text-ink-900">{titel}</h1>
        <p className="text-body-l text-ink-600 max-w-reading">{intro}</p>
        <div className="flex flex-wrap items-center gap-1.5">
          {norms.map((n) => (
            <a key={n.label} href={fedlexLokalisiert(n.url, locale)} target="_blank" rel="noopener noreferrer" className="lc-chip no-underline hover:text-brass-700">{n.label}</a>
          ))}
          <span className="lc-badge lc-badge-warn">{badge}</span>
        </div>
        {(zuruecksetzen || fussnote) && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pt-1">
            {zuruecksetzen && (
              <button type="button"
                onClick={() => { if (window.confirm('Alle Eingaben dieser Vorlage zurücksetzen?')) { zuruecksetzen(); setBeruehrt(false); } }}
                className="lc-btn-outline lc-btn-sm">
                ↺ Eingaben zurücksetzen
              </button>
            )}
            <p className="text-xs text-ink-500">
              {fussnote ?? 'Ihre Eingaben verlassen den Browser nicht (lokale Zwischenspeicherung).'}
            </p>
          </div>
        )}
      </div>

      {/* Kopf-Schalter (Detailgrad/Untertyp) – optional, vor dem Stepper */}
      {kopfSchalter}

      {/* Stepper */}
      <Stepper schritte={schritte} aktiv={schritt} onWechsel={setSchritt} />

      {/* Zweispaltig: Formular links, klebende Vorschau rechts;
          mobil einspaltig mit einklappbarer Vorschau */}
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6 md:gap-8 items-start">
        <div className="bg-surface-raised rounded-2xl border border-line p-5 sm:p-6 space-y-5"
          onInput={merkeEingabe} onChange={merkeEingabe}>
          {/* key={schritt}: re-mountet den Schrittinhalt → dezenter Einblende-
              Fade beim Schrittwechsel (Redesign E8); Fehlerbox/Buttons bleiben ruhig. */}
          <div key={schritt} className="lc-route space-y-5">
            <h2 className="text-h3 font-display font-semibold text-ink-900">{schritte[schritt].label}</h2>
            {inhalt}
          </div>

          {/* FAHRPLAN-DESIGN 2.2: vierte Fehlerbox-Variante entfernt —
              EIN Baustein (FehlerBox, role="alert") wie in den Rechner-Forms.
              Grundsatz David: erst nach erster Eingabe zeigen (beruehrt). */}
          {beruehrt && fehler != null && <FehlerBox fehler={fehler} />}

          <div className="flex items-end justify-between gap-3 pt-2 border-t border-line">
            <button type="button" onClick={() => setSchritt((s) => Math.max(0, s - 1))}
              disabled={schritt === 0} className="lc-btn-ghost">← Zurück</button>
            {schritt < schritte.length - 1 && (
              <div className="flex flex-col items-end gap-1">
                {/* Erklärt den ausgegrauten Weiter-Button (sonst wirkt er wie
                    ein Defekt) — immer sichtbar, nicht fehler-rot. */}
                {weiterAus && (
                  <p id="weiter-hinweis" className="text-xs text-ink-500">Bitte Pflichtfelder ausfüllen</p>
                )}
                <button type="button" onClick={() => setSchritt((s) => s + 1)}
                  disabled={weiterAus} aria-describedby={weiterAus ? 'weiter-hinweis' : undefined}
                  className="lc-btn-primary">
                  Weiter →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Vorschau – mobil einklappbar, Desktop klebend; identischer Inhalt
            zweimal platziert (kein Remount, wie bisheriger Funktionsaufruf) */}
        <details id="wizard-vorschau" className="md:hidden bg-surface border border-line rounded-xl scroll-mt-24"
          open={vorschauOffen} onToggle={(e) => setVorschauOffen((e.currentTarget as HTMLDetailsElement).open)}>
          <summary className="cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden px-4 py-3 flex items-center justify-between text-body-s font-medium text-ink-700">
            <span>Vorschau & Bausteinprotokoll</span>
            <span aria-hidden className="text-ink-500">▾</span>
          </summary>
          <div className="px-4 pb-4">{vorschau}</div>
        </details>
        <div className="hidden md:block md:sticky md:top-28">
          {vorschau}
        </div>
      </div>

      {/* Mobile: Sprung zur Live-Vorschau — der Kernnutzen («was du siehst,
          kommt raus») soll auch beim Tippen erreichbar sein, nicht erst im
          letzten Schritt. */}
      <button type="button" onClick={zurVorschau}
        className="md:hidden fixed bottom-4 right-4 z-30 lc-btn-outline lc-btn-sm shadow-md bg-surface">
        Vorschau ↓
      </button>
    </div>
  );
}

// ── Werkgetreuer Absatz-Renderer der Vorschau ───────────────────────────────
// Interpretiert EXAKT dieselben Strukturen wie PDF und DOCX (MUSTER aus der
// Formatvorlagen-SSoT): hängende Einzüge für «1.»-Klauseln, doppelt
// eingezogene «–»-Unterpunkte, gezeichnete Unterschriftslinien, Betreff mit
// Haarlinie, Rubrum mit zentrierten Parteirollen und fettem «gegen».
// Reine Darstellung – keine Rechtslogik (§3).

function VorschauZeile({ zeile, dicht, striche }: { zeile: string; dicht?: boolean; striche?: boolean }) {
  // Strichzeilen-Lizenz wie PDF/DOCX (Ultra-Review MITTEL 7.6.2026):
  // nur rolle 'unterschrift' oder Schema-eigene Striche — nie Nutzertext.
  if (striche && MUSTER.STRICHE.test(zeile)) {
    // role="img": aria-label ist auf einem rollenlosen span unzulässig
    // (axe aria-prohibited-attr, 10.6.2026); als benanntes Grafik-Element
    // bleibt die Linie für Screenreader «Unterschriftslinie».
    return <span role="img" className="block w-52 max-w-full border-b border-ink-600 mt-4 mb-1" aria-label="Unterschriftslinie" />;
  }
  const num = zeile.match(MUSTER.NUMMER);
  if (num) {
    return (
      <span className="flex gap-0">
        <span className="w-7 shrink-0">{num[1]}.</span>
        <span className="flex-1">{zeile.slice(num[0].length)}</span>
      </span>
    );
  }
  if (MUSTER.SUB.test(zeile)) {
    return (
      <span className="flex gap-0 pl-7">
        <span className="w-5 shrink-0">–</span>
        <span className="flex-1">{zeile.slice(2)}</span>
      </span>
    );
  }
  return <span className={`block min-h-[1em] ${dicht ? 'leading-snug' : ''}`}>{zeile || '\u00a0'}</span>;
}

function VorschauAbsatz({ abs }: { abs: AssembleErgebnis['dokument']['absaetze'][number] }) {
  const zeilen = abs.text.split('\n');
  const striche = !!abs.stricheErlaubt; // Engine-Boolean (/simplify 7.6.2026)

  switch (abs.rolle) {
    case 'absender':
    case 'adressat':
      return (
        <div className={abs.rolle === 'adressat' ? 'mb-5' : 'mb-4'}>
          {zeilen.map((z, i) => <VorschauZeile key={i} zeile={z} dicht striche={striche} />)}
        </div>
      );
    case 'datumzeile':
      return <p className="text-right mt-2 mb-5">{abs.text}</p>;
    case 'betreff':
      return (
        <div className="mb-5">
          <p className="font-bold text-[1.1em] leading-snug">{abs.text}</p>
          <span className="block mt-1.5 border-t border-line" aria-hidden />
        </div>
      );
    case 'rubrum':
      return (
        <div className="mb-5 space-y-0.5">
          {zeilen.map((z, i) => {
            const t = z.trim();
            if (MUSTER.RUBRUM_ROLLE.test(t)) return <p key={i} className="text-center">{t}</p>;
            if (t === 'gegen') return <p key={i} className="text-center font-bold py-1">gegen</p>;
            if (z === 'in Sachen') return <p key={i} className="pb-1">{z}</p>;
            if (z.startsWith('betreffend ')) return <p key={i} className="pt-1">{z}</p>;
            return <VorschauZeile key={i} zeile={z} dicht={t !== ''} striche={striche} />;
          })}
        </div>
      );
    case 'parteien':
      return (
        <div className="text-center mb-5 space-y-0.5">
          {zeilen.map((z, i) => <VorschauZeile key={i} zeile={z} striche={striche} />)}
        </div>
      );
    case 'anrede':
      return <div className="mt-1 mb-4">{zeilen.map((z, i) => <VorschauZeile key={i} zeile={z} striche={striche} />)}</div>;
    case 'schlussformel':
      return <p className="mt-5 mb-1">{abs.text}</p>;
    case 'unterschrift':
      return (
        <div className="mt-4">
          {zeilen.map((z, i) => <VorschauZeile key={i} zeile={z} striche={striche} />)}
        </div>
      );
    default:
      return (
        <div className="mb-2.5">
          {abs.ueberschrift && <p className="font-bold mt-4 mb-1.5">{abs.ueberschrift}</p>}
          {zeilen.map((z, i) => <VorschauZeile key={i} zeile={z} striche={striche} />)}
        </div>
      );
  }
}

// ── Geteilte Export-Aktion (PDF/DOCX lazy, Fehler sichtbar statt stiller
//    Unhandled Rejection) — genutzt von ExportLeiste und DirektExportZeile ───

function useExportAktion() {
  const [fehler, setFehler] = useState<string | null>(null);
  const exportieren = async (aktion: () => Promise<void>, standardMeldung: string) => {
    setFehler(null);
    try {
      await aktion();
    } catch (e) {
      setFehler(e instanceof Error ? e.message : standardMeldung);
    }
  };
  return { fehler, exportieren };
}

const pdfExport = (ergebnis: AssembleErgebnis, ziel: ExportZiel) => async () =>
  (await import('../../lib/vorlagen/vorlagenPdf')).vorlagenPdfErzeugen(ergebnis, { banner: ziel.banner, dateiName: ziel.dateiName });
const docxExport = (ergebnis: AssembleErgebnis, ziel: ExportZiel) => async () =>
  (await import('../../lib/vorlagen/vorlagenDocx')).vorlagenDocxErzeugen(ergebnis, { banner: ziel.banner, dateiName: ziel.dateiName });

// ── Direkt-Export unter der Vorschau (Daueranweisung David 12.6.2026) ───────
//
// Jede Vorlage ist JEDERZEIT herunterladbar — auch unausgefüllt; leere
// Felder bleiben Ausfüll-Striche («________», Engine-Konvention). Nur
// FACHLICHE Blocker (das Dokument trüge eine falsche Rechtsaussage)
// sperren auch hier; fehlende Angaben sperren nie.

function DirektExportZeile({ ergebnis, pdf, docx, blocker }: {
  ergebnis: AssembleErgebnis; pdf: ExportZiel; docx?: ExportZiel; blocker?: string[];
}) {
  const { fehler, exportieren } = useExportAktion();
  const gesperrt = (blocker?.length ?? 0) > 0;
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-xs text-ink-500">
          Direkt herunterladen – auch unausgefüllt (leere Felder bleiben Ausfüll-Striche):
        </span>
        <button type="button" disabled={gesperrt}
          title={gesperrt ? blocker![0] : undefined}
          onClick={() => exportieren(pdfExport(ergebnis, pdf), 'Der PDF-Export ist fehlgeschlagen. Bitte erneut versuchen.')}
          className="lc-btn-outline lc-btn-sm">
          PDF
        </button>
        {docx && (
          <button type="button" disabled={gesperrt}
            title={gesperrt ? blocker![0] : undefined}
            onClick={() => exportieren(docxExport(ergebnis, docx), 'Der Word-Export ist fehlgeschlagen. Bitte erneut versuchen.')}
            className="lc-btn-outline lc-btn-sm">
            Word (DOCX)
          </button>
        )}
      </div>
      {fehler && <FehlerBox fehler={[fehler]} />}
    </div>
  );
}

// ── Vorschau-Spalte: Live-«Papier» + Bausteinprotokoll ──────────────────────

export function VorschauPanel({ ergebnis, kompakt, extra, nichtAufgenommen, direktExport }: {
  ergebnis: AssembleErgebnis;
  /** Etwas kleinere Papier-Schrift (Schlichtungsgesuch). */
  kompakt?: boolean;
  /** Vorlagenspezifische Panels zwischen Papier und Protokoll (z. B. Pflichtteile). */
  extra?: ReactNode;
  /** Wenn übergeben: Protokoll-Zusammenfassung «aufgenommen · nicht aufgenommen» + Liste. */
  nichtAufgenommen?: { label: string; grund: string }[];
  /** Blanko-/Direkt-Download (Daueranweisung David 12.6.2026) — nur
      FACHLICHE Blocker übergeben, nie blosse Vollständigkeits-Mängel. */
  direktExport?: { pdf: ExportZiel; docx?: ExportZiel; blocker?: string[] };
}) {
  return (
    <div className="space-y-4">
      {/* Live-Vorschau als «Papier» – interpretiert dieselben Formatvorlagen
          (format + Absatz-Rollen) wie PDF und DOCX */}
      <section aria-label="Vorschau" className="bg-paper-raised border border-line rounded-lg shadow-md p-5 sm:p-9">
        <p className="lc-overline mb-4">
          Vorschau · aktualisiert sich live
          {AUSGABE_LABEL[ergebnis.dokument.ausgabeArt] && (
            <span className="ml-2 lc-chip normal-case tracking-normal">{AUSGABE_LABEL[ergebnis.dokument.ausgabeArt]}</span>
          )}
        </p>
        <div className="font-sans text-ink-900" style={kompakt ? { fontSize: '0.88rem', lineHeight: 1.5 } : { fontSize: '0.92rem', lineHeight: 1.55 }}>
          {/* Eingaben tragen ihren Titel im fetten Betreff – kein Dokumenttitel;
              Verfügung/Vertrag: zentrierter Titel MIT Haarlinie (wie PDF/DOCX) */}
          {ergebnis.dokument.format !== 'eingabe' && (
            <div className="mb-5">
              <p className={`text-center font-bold ${kompakt ? 'text-[1.15rem]' : 'text-[1.25rem]'}`}>{ergebnis.dokument.titel}</p>
              <span className="block mt-2 border-t border-line" aria-hidden />
            </div>
          )}
          {ergebnis.dokument.absaetze.map((abs) => (
            <VorschauAbsatz key={abs.bausteinId + abs.text.slice(0, 12)} abs={abs} />
          ))}
        </div>
        <p className="text-micro text-ink-500 mt-6 pt-3 border-t border-line">{ergebnis.dokument.disclaimer}</p>
      </section>

      {direktExport && <DirektExportZeile ergebnis={ergebnis} {...direktExport} />}

      {extra}

      {/* Bausteinprotokoll */}
      <details className="lc-card p-4">
        <summary className="cursor-pointer text-body-s font-medium text-ink-700">
          Bausteinprotokoll ({nichtAufgenommen
            ? `${ergebnis.protokoll.length} aufgenommen · ${nichtAufgenommen.length} nicht aufgenommen`
            : `${ergebnis.protokoll.length} Bausteine`})
        </summary>
        <ul className="mt-3 space-y-2.5">
          {ergebnis.protokoll.map((p) => (
            <li key={p.bausteinId} className="text-body-s text-ink-600 space-y-1">
              <p><span className="num text-ink-500">{p.bausteinId}</span> – {p.begruendung}</p>
              {p.hinweis && <p className="text-xs text-warn-700">⚠ {p.hinweis}</p>}
              {p.norm && <p><NormLink artikel={p.norm} /></p>}
            </li>
          ))}
        </ul>
        {nichtAufgenommen && (
          <>
            <p className="lc-overline mt-4 mb-2">Nicht aufgenommen</p>
            <ul className="space-y-1">
              {nichtAufgenommen.map((n) => (
                <li key={n.label} className="text-xs text-ink-500">– {n.label}: {n.grund}</li>
              ))}
            </ul>
          </>
        )}
      </details>
    </div>
  );
}

// ── Export-Leiste: PDF (lazy) · optional DOCX (lazy) · Text kopieren ────────

export type ExportZiel = { label: string; banner: PdfBanner; dateiName: string };

export function ExportLeiste({ ergebnis, deaktiviert, kopiert, onKopieren, pdf, docx }: {
  ergebnis: AssembleErgebnis;
  deaktiviert: boolean;
  kopiert: boolean;
  onKopieren: (text: string) => void;
  pdf: ExportZiel;
  /** Nur übergeben, wo die Formvorschrift DOCX zulässt (Form-Gate hat Vorrang). */
  docx?: ExportZiel;
}) {
  // Async-Export mit try/catch (useExportAktion): scheitert das Nachladen der
  // Renderer oder die Dokument-Erzeugung – etwa der bewusste Sperr-Wurf des
  // Word-Exports bei eigenhändigkeitspflichtigen Geschäften (vorlagenDocx.ts)
  // –, erscheint die Meldung sichtbar statt als stille Unhandled Rejection.
  const { fehler, exportieren } = useExportAktion();
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={deaktiviert}
          onClick={() => exportieren(pdfExport(ergebnis, pdf), 'Der PDF-Export ist fehlgeschlagen. Bitte erneut versuchen.')}
          className="lc-btn-primary">
          {pdf.label}
        </button>
        {docx && (
          <button type="button" disabled={deaktiviert}
            onClick={() => exportieren(docxExport(ergebnis, docx), 'Der Word-Export ist fehlgeschlagen. Bitte erneut versuchen.')}
            className="lc-btn-outline">
            {docx.label}
          </button>
        )}
        <button type="button" disabled={deaktiviert} onClick={() => onKopieren(dokumentAlsText(ergebnis))}
          className="lc-btn-outline">
          {kopiert ? 'Kopiert ✓' : 'Text kopieren'}
        </button>
      </div>
      {fehler && <FehlerBox fehler={[fehler]} />}
    </div>
  );
}
