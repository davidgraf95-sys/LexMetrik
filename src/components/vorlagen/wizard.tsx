import { useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { Link } from 'react-router-dom';
import { FehlerBox, NormChip, NormLink, Stepper } from './ui';
import { NormText } from '../NormText';
import { useLocale, fedlexLokalisiert } from '../locale';
import { dokumentAlsText } from '../../lib/vorlagen/vorlagenText';
import type { AssembleErgebnis } from '../../lib/vorlagen/engine';
import { AUSGABE_LABEL, MUSTER, rolleLabel, type AusgabeStil } from '../../lib/vorlagen/formatvorlagen';
import { VORSCHAU } from './vorschauStil';
import { useAusgabeStil, getAusgabeStil, setAusgabeStil } from './ausgabeStil';
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
    // pb-20 mobil (Auftrag David 25.6.2026): der schwebende «Vorschau ↓»-FAB
    // (fixed bottom-4 right-4) deckte sonst die letzten Felder / den Weiter-
    // Knopf zu — die Boden-Polsterung lässt sie frei darüber scrollen.
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Kopf */}
      <div className="space-y-3">
        <Link to={zurueckHref} className="inline-flex items-center gap-2 no-underline text-body-s font-medium text-brass-700 hover:text-brass-600">
          <span aria-hidden className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-line bg-surface">←</span>
          Zurück zum Katalog
        </Link>
        <p className="lc-overline">{overline}</p>
        {/* overflow-wrap/hyphens: lange Komposita (z.B. «Geheimhaltungsvereinbarung»)
            sprengten den Titel bei 360px → 12px horizontaler Seiten-Overflow
            (Befund David 25.6.2026, nda). Brechen statt überlaufen. */}
        <h1 className="text-h2 sm:text-h1 font-display font-semibold text-ink-900 [overflow-wrap:anywhere] hyphens-auto">{titel}</h1>
        <p className="text-body-l text-ink-600 max-w-reading">{intro}</p>
        <div className="flex flex-wrap items-center gap-1.5">
          {norms.map((n) => (
            <NormChip key={n.label} artikel={n.label} hrefOverride={fedlexLokalisiert(n.url, locale)} />
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
              {fussnote ?? 'Ihre Eingaben verlassen den Browser nicht, werden aber lokal auf diesem Gerät zwischengespeichert und bleiben nach dem Schliessen erhalten — auf geteilten oder fremden Rechnern bitte «Eingaben zurücksetzen».'}
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
    return <span role="img" style={VORSCHAU.sigLinie} aria-label="Unterschriftslinie" />;
  }
  const num = zeile.match(MUSTER.NUMMER);
  if (num) {
    // Nummerierte Klausel/Begehren: scanbarer hängender Einzug (SSoT vorschauStil).
    return (
      <span style={VORSCHAU.pos}>
        <span style={VORSCHAU.posNr}>{num[1]}.</span>
        <span>{zeile.slice(num[0].length)}</span>
      </span>
    );
  }
  if (MUSTER.SUB.test(zeile)) {
    return (
      <span style={VORSCHAU.sub}>
        <span style={VORSCHAU.subDash}>–</span>
        <span>{zeile.slice(2)}</span>
      </span>
    );
  }
  return <span className={`block min-h-[1em] ${dicht ? 'leading-snug' : ''}`}>{zeile || '\u00a0'}</span>;
}

function VorschauAbsatz({ abs, stil }: { abs: AssembleErgebnis['dokument']['absaetze'][number]; stil: AusgabeStil }) {
  const zeilen = abs.text.split('\n');
  const striche = !!abs.stricheErlaubt; // Engine-Boolean (/simplify 7.6.2026)

  // Alle Masse/Stile aus der SSoT (vorschauStil.ts) – keine hartkodierten
  // Tailwind-Abstände mehr; Variante A «Dokument-Handwerk».
  switch (abs.rolle) {
    case 'absender':
    case 'adressat':
      return (
        <div style={abs.rolle === 'adressat' ? VORSCHAU.adressat : VORSCHAU.absender}>
          {zeilen.map((z, i) => <VorschauZeile key={i} zeile={z} dicht striche={striche} />)}
        </div>
      );
    case 'datumzeile':
      return <p style={VORSCHAU.datum}>{abs.text}</p>;
    case 'betreff':
      return (
        <div>
          <p style={{ ...VORSCHAU.betreff, lineHeight: 1.3, whiteSpace: 'pre-line' }}>{abs.text}</p>
          <span style={VORSCHAU.betreffLinie} aria-hidden />
        </div>
      );
    case 'rubrum':
      return (
        <div style={VORSCHAU.rubrum}>
          {zeilen.map((z, i) => {
            const t = z.trim();
            if (MUSTER.RUBRUM_ROLLE.test(t)) return stil === 'modern'
              ? <p key={i} style={VORSCHAU.rubrumRolle}>{rolleLabel(t)}</p>
              : <p key={i} style={VORSCHAU.rubrumRolleKlassisch}>{t}</p>;
            if (t === 'gegen') return <p key={i} style={stil === 'modern' ? VORSCHAU.rubrumGegen : VORSCHAU.rubrumGegenKlassisch}>gegen</p>;
            if (z === 'in Sachen') return <p key={i} style={VORSCHAU.insachen}>{z}</p>;
            if (z.startsWith('betreffend ')) return <p key={i} style={VORSCHAU.betreffend}>{z}</p>;
            return <p key={i} style={VORSCHAU.rubrumZeile}><VorschauZeile zeile={z} dicht={t !== ''} striche={striche} /></p>;
          })}
        </div>
      );
    case 'parteien':
      return (
        <div style={VORSCHAU.parteien}>
          {zeilen.map((z, i) => <VorschauZeile key={i} zeile={z} striche={striche} />)}
        </div>
      );
    case 'anrede':
      return <div style={VORSCHAU.anrede}>{zeilen.map((z, i) => <VorschauZeile key={i} zeile={z} striche={striche} />)}</div>;
    case 'schlussformel':
      return <p style={VORSCHAU.schlussformel}>{abs.text}</p>;
    case 'unterschrift':
      return (
        <div style={VORSCHAU.unterschrift}>
          {zeilen.map((z, i) => <VorschauZeile key={i} zeile={z} striche={striche} />)}
        </div>
      );
    default:
      return (
        <div style={VORSCHAU.block}>
          {abs.ueberschrift && <p style={VORSCHAU.blockTitel}>{abs.ueberschrift}</p>}
          {zeilen.map((z, i) => <VorschauZeile key={i} zeile={z} striche={striche} />)}
        </div>
      );
  }
}

// ── Geteilte Export-Aktion (PDF/DOCX lazy, Fehler sichtbar statt stiller
//    Unhandled Rejection) — genutzt von ExportLeiste und DirektExportZeile ───

function useExportAktion() {
  const [fehler, setFehler] = useState<string | null>(null);
  const [laeuft, setLaeuft] = useState(false);
  // Während des Nachladens/Erzeugens (lazy jsPDF/docx + Dokumentbau) hält
  // `laeuft` die Knöpfe disabled und verhindert Mehrfachklicks/-downloads
  // (§13/F4) — analog PdfExportButton.
  const exportieren = async (aktion: () => Promise<void>, standardMeldung: string) => {
    if (laeuft) return;
    setFehler(null);
    setLaeuft(true);
    try {
      await aktion();
    } catch (e) {
      setFehler(e instanceof Error ? e.message : standardMeldung);
    } finally {
      setLaeuft(false);
    }
  };
  return { fehler, laeuft, exportieren };
}

// Der Ausgabe-Stil wird beim Klick aus dem geteilten Store gelesen (getAusgabeStil),
// damit Vorschau und beide Export-Knöpfe ohne Props-Plumbing denselben Stil nutzen.
const pdfExport = (ergebnis: AssembleErgebnis, ziel: ExportZiel) => async () =>
  (await import('../../lib/vorlagen/vorlagenPdf')).vorlagenPdfErzeugen(ergebnis, { banner: ziel.banner, dateiName: ziel.dateiName, stil: getAusgabeStil() });
const docxExport = (ergebnis: AssembleErgebnis, ziel: ExportZiel) => async () =>
  (await import('../../lib/vorlagen/vorlagenDocx')).vorlagenDocxErzeugen(ergebnis, { banner: ziel.banner, dateiName: ziel.dateiName, stil: getAusgabeStil() });

// ── Direkt-Export unter der Vorschau (Daueranweisung David 12.6.2026) ───────
//
// Jede Vorlage ist JEDERZEIT herunterladbar — auch unausgefüllt; leere
// Felder bleiben Ausfüll-Striche («________», Engine-Konvention). Nur
// FACHLICHE Blocker (das Dokument trüge eine falsche Rechtsaussage)
// sperren auch hier; fehlende Angaben sperren nie.

function DirektExportZeile({ ergebnis, pdf, docx, blocker }: {
  ergebnis: AssembleErgebnis; pdf: ExportZiel; docx?: ExportZiel; blocker?: string[];
}) {
  const { fehler, laeuft, exportieren } = useExportAktion();
  const gesperrt = (blocker?.length ?? 0) > 0;
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-xs text-ink-500">
          Direkt herunterladen – auch unausgefüllt (leere Felder bleiben Ausfüll-Striche):
        </span>
        <button type="button" disabled={gesperrt || laeuft} aria-busy={laeuft}
          title={gesperrt ? blocker![0] : undefined}
          onClick={() => exportieren(pdfExport(ergebnis, pdf), 'Der PDF-Export ist fehlgeschlagen. Bitte erneut versuchen.')}
          className="lc-btn-outline lc-btn-sm">
          PDF
        </button>
        {docx && (
          <button type="button" disabled={gesperrt || laeuft} aria-busy={laeuft}
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

// ── Ausgabe-Stil-Umschalter (nüchtern ⇄ modern) ─────────────────────────────
// Wirkt zugleich auf Vorschau UND Export (geteilter Store, ausgabeStil.ts).
function StilUmschalter({ stil }: { stil: AusgabeStil }) {
  return (
    <div className="inline-flex shrink-0 overflow-hidden rounded-md border border-line text-xs" role="group" aria-label="Ausgabe-Stil">
      {(['nuechtern', 'modern'] as const).map((s) => (
        <button key={s} type="button"
          aria-pressed={stil === s}
          title={s === 'nuechtern' ? 'Klassisch-gerichtstauglich (traditionelles Rubrum mit Gedankenstrichen)' : 'Variante A «Dokument-Handwerk» (ruhige Versal-Labels)'}
          onClick={() => setAusgabeStil(s)}
          className={stil === s
            ? 'bg-brass-100 px-2.5 py-1 font-medium text-brass-800'
            : 'bg-surface px-2.5 py-1 text-ink-600 hover:text-ink-900'}>
          {s === 'nuechtern' ? 'Nüchtern' : 'Modern'}
        </button>
      ))}
    </div>
  );
}

// ── Vorschau-Spalte: Live-«Papier» + Bausteinprotokoll ──────────────────────

export function VorschauPanel({ ergebnis, kompakt, extra, nichtAufgenommen, direktExport, stil: stilOverride }: {
  ergebnis: AssembleErgebnis;
  /** Etwas kleinere Papier-Schrift (Schlichtungsgesuch). */
  kompakt?: boolean;
  /** Erzwingt einen Ausgabe-Stil (Tests/Snapshots); sonst aus dem geteilten Store. */
  stil?: AusgabeStil;
  /** Vorlagenspezifische Panels zwischen Papier und Protokoll (z. B. Pflichtteile). */
  extra?: ReactNode;
  /** Wenn übergeben: Protokoll-Zusammenfassung «aufgenommen · nicht aufgenommen» + Liste. */
  nichtAufgenommen?: { label: string; grund: string }[];
  /** Blanko-/Direkt-Download (Daueranweisung David 12.6.2026) — nur
      FACHLICHE Blocker übergeben, nie blosse Vollständigkeits-Mängel. */
  direktExport?: { pdf: ExportZiel; docx?: ExportZiel; blocker?: string[] };
}) {
  const stilStore = useAusgabeStil();
  const stil = stilOverride ?? stilStore;
  return (
    <div className="space-y-4">
      {/* Live-Vorschau als «Papier» – interpretiert dieselben Formatvorlagen
          (format + Absatz-Rollen) wie PDF und DOCX; der Stil-Umschalter wirkt
          identisch auf Vorschau und Export. */}
      <section aria-label="Vorschau" className="bg-paper-raised border border-line rounded-lg shadow-md p-5 sm:p-9">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <p className="lc-overline">
            Vorschau · aktualisiert sich live
            {AUSGABE_LABEL[ergebnis.dokument.ausgabeArt] && (
              <span className="ml-2 lc-chip normal-case tracking-normal">{AUSGABE_LABEL[ergebnis.dokument.ausgabeArt]}</span>
            )}
          </p>
          <StilUmschalter stil={stil} />
        </div>
        <div className="font-sans text-ink-900" style={{ ...VORSCHAU.papier, ...(kompakt ? { fontSize: 'var(--vorschau-fs-kompakt)', lineHeight: 1.55 } : { fontSize: 'var(--vorschau-fs)', lineHeight: 1.6 }) }}>
          {/* Eingaben tragen ihren Titel im fetten Betreff – kein Dokumenttitel;
              Verfügung/Vertrag: zentrierter Titel MIT Haarlinie (wie PDF/DOCX) */}
          {ergebnis.dokument.format !== 'eingabe' && (
            <div>
              <p style={VORSCHAU.titel}>{ergebnis.dokument.titel}</p>
              <span style={VORSCHAU.titelLinie} aria-hidden />
            </div>
          )}
          {ergebnis.dokument.absaetze.map((abs) => (
            <VorschauAbsatz key={abs.bausteinId + abs.text.slice(0, 12)} abs={abs} stil={stil} />
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
              <p><span className="num text-ink-500">{p.bausteinId}</span> – <NormText text={p.begruendung} /></p>
              {p.hinweis && <p className="text-xs text-warn-700">⚠ <NormText text={p.hinweis} /></p>}
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
  const { fehler, laeuft, exportieren } = useExportAktion();
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={deaktiviert || laeuft} aria-busy={laeuft}
          onClick={() => exportieren(pdfExport(ergebnis, pdf), 'Der PDF-Export ist fehlgeschlagen. Bitte erneut versuchen.')}
          className="lc-btn-primary">
          {pdf.label}
        </button>
        {docx && (
          <button type="button" disabled={deaktiviert || laeuft} aria-busy={laeuft}
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
