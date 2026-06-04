import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { Link } from 'react-router-dom';
import { NormLink, Stepper } from './ui';
import { useLocale, fedlexLokalisiert } from '../locale';
import { dokumentAlsText } from '../../lib/vorlagen/vorlagenText';
import type { AssembleErgebnis } from '../../lib/vorlagen/engine';
import type { PdfBanner } from '../../lib/vorlagen/banner';

// ─── Generischer Vorlagen-Wizard-Rahmen ─────────────────────────────────────
//
// Der in allen Vorlagen identische Rahmen (CLAUDE.md §10): Kopf mit
// Rückweg/Normen/Badge, Stepper, zweispaltiges Layout (Formular-Karte mit
// Fehlerbox und Zurück/Weiter, Vorschau mobil einklappbar / Desktop klebend),
// dazu VorschauPanel («Papier» + Bausteinprotokoll) und ExportLeiste
// (PDF lazy, DOCX lazy, Text kopieren). Eine neue Vorlage liefert nur noch
// Schema, Schritte und Schritt-Inhalte — KEINE Fachlogik hier (§3).

export function VorlagenWizardRahmen({
  zurueckHref = '/?modus=vorlagen', overline, titel, intro, norms, badge,
  fussnote, zuruecksetzen, schritte, schritt, setSchritt, fehler,
  weiterDeaktiviert, inhalt, vorschau,
}: {
  zurueckHref?: string;
  overline: string;
  titel: string;
  intro: ReactNode;
  norms: { label: string; url: string }[];
  badge: string;
  /** Eigener Speicher-Hinweis (z. B. «wird nicht gespeichert»); Alternative zu zuruecksetzen. */
  fussnote?: ReactNode;
  /** Wenn gesetzt: Standard-Hinweis «verlassen den Browser nicht» + Löschen-Button. */
  zuruecksetzen?: () => void;
  schritte: readonly { id: string; label: string }[];
  schritt: number;
  setSchritt: Dispatch<SetStateAction<number>>;
  fehler?: string[];
  /** Default: fehler vorhanden. Überschreibbar (z. B. Stopp-Karten). */
  weiterDeaktiviert?: boolean;
  inhalt: ReactNode;
  vorschau: ReactNode;
}) {
  const { locale } = useLocale();
  const weiterAus = weiterDeaktiviert ?? (fehler != null && fehler.length > 0);

  return (
    <div className="space-y-6">
      {/* Kopf */}
      <div className="space-y-3">
        <Link to={zurueckHref} className="inline-flex items-center gap-2 no-underline text-body-s font-medium text-brass-700 hover:text-brass-600">
          <span aria-hidden className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-line bg-surface">←</span>
          Zurück zu den Vorlagen
        </Link>
        <p className="lc-overline">{overline}</p>
        <h1 className="text-h1 font-display font-semibold text-ink-900">{titel}</h1>
        <p className="text-body-l text-ink-600 max-w-reading">{intro}</p>
        <div className="flex flex-wrap items-center gap-1.5">
          {norms.map((n) => (
            <a key={n.label} href={fedlexLokalisiert(n.url, locale)} target="_blank" rel="noopener noreferrer" className="lc-chip no-underline hover:text-brass-700">{n.label}</a>
          ))}
          <span className="lc-badge lc-badge-warn">{badge}</span>
        </div>
        {zuruecksetzen ? (
          <p className="text-xs text-ink-500">
            Ihre Eingaben verlassen den Browser nicht (lokale Zwischenspeicherung).{' '}
            <button type="button" onClick={zuruecksetzen} className="text-brass-700 hover:text-brass-600 underline-offset-2 hover:underline">Eingaben löschen</button>
          </p>
        ) : fussnote ? (
          <p className="text-xs text-ink-500">{fussnote}</p>
        ) : null}
      </div>

      {/* Stepper */}
      <Stepper schritte={schritte} aktiv={schritt} onWechsel={setSchritt} />

      {/* Zweispaltig: Formular links, klebende Vorschau rechts;
          mobil einspaltig mit einklappbarer Vorschau */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6 lg:gap-8 items-start">
        <div className="bg-surface-raised rounded-2xl border border-line p-5 sm:p-6 space-y-5">
          <h2 className="text-h3 font-display font-semibold text-ink-900">{schritte[schritt].label}</h2>
          {inhalt}

          {fehler != null && fehler.length > 0 && (
            <div className="rounded-md bg-danger-bg p-3 space-y-0.5">
              {fehler.map((f, i) => <p key={i} className="text-body-s text-danger-700">• {f}</p>)}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-line">
            <button type="button" onClick={() => setSchritt((s) => Math.max(0, s - 1))}
              disabled={schritt === 0} className="lc-btn-ghost disabled:opacity-40">← Zurück</button>
            {schritt < schritte.length - 1 && (
              <button type="button" onClick={() => setSchritt((s) => s + 1)}
                disabled={weiterAus} className="lc-btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                Weiter →
              </button>
            )}
          </div>
        </div>

        {/* Vorschau — mobil einklappbar, Desktop klebend; identischer Inhalt
            zweimal platziert (kein Remount, wie bisheriger Funktionsaufruf) */}
        <details className="lg:hidden bg-surface border border-line rounded-xl" open={schritt === schritte.length - 1}>
          <summary className="cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden px-4 py-3 flex items-center justify-between text-body-s font-medium text-ink-700">
            <span>Vorschau & Bausteinprotokoll</span>
            <span aria-hidden className="text-ink-500">▾</span>
          </summary>
          <div className="px-4 pb-4">{vorschau}</div>
        </details>
        <div className="hidden lg:block lg:sticky lg:top-28">
          {vorschau}
        </div>
      </div>
    </div>
  );
}

// ── Vorschau-Spalte: Live-«Papier» + Bausteinprotokoll ──────────────────────

export function VorschauPanel({ ergebnis, kompakt, extra, nichtAufgenommen }: {
  ergebnis: AssembleErgebnis;
  /** Etwas kleinere Papier-Schrift (Schlichtungsgesuch). */
  kompakt?: boolean;
  /** Vorlagenspezifische Panels zwischen Papier und Protokoll (z. B. Pflichtteile). */
  extra?: ReactNode;
  /** Wenn übergeben: Protokoll-Zusammenfassung «aufgenommen · nicht aufgenommen» + Liste. */
  nichtAufgenommen?: { label: string; grund: string }[];
}) {
  return (
    <div className="space-y-4">
      {/* Live-Vorschau als «Papier» */}
      <section aria-label="Vorschau" className="bg-paper-raised border border-line rounded-lg shadow-md p-5 sm:p-9">
        <p className="lc-overline mb-4">Vorschau · aktualisiert sich live</p>
        <div className="font-display text-ink-900 space-y-3" style={kompakt ? { fontSize: '0.92rem', lineHeight: 1.7 } : { fontSize: '0.95rem', lineHeight: 1.75 }}>
          <p className={`text-center font-semibold ${kompakt ? 'text-[1.1rem]' : 'text-[1.15rem]'}`}>{ergebnis.dokument.titel}</p>
          {ergebnis.dokument.absaetze.map((abs) => (
            <div key={abs.bausteinId + abs.text.slice(0, 12)}>
              {abs.ueberschrift && <p className="font-semibold mt-2">{abs.ueberschrift}</p>}
              <p className="whitespace-pre-line">{abs.text}</p>
            </div>
          ))}
        </div>
        <p className="text-[0.65rem] text-ink-500 mt-6 pt-3 border-t border-line">{ergebnis.dokument.disclaimer}</p>
      </section>

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
              <p><span className="num text-ink-500">{p.bausteinId}</span> — {p.begruendung}</p>
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
  return (
    <div className="flex flex-wrap gap-3">
      <button type="button" disabled={deaktiviert}
        onClick={async () => (await import('../../lib/vorlagen/vorlagenPdf')).vorlagenPdfErzeugen(ergebnis, { banner: pdf.banner, dateiName: pdf.dateiName })}
        className="lc-btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
        {pdf.label}
      </button>
      {docx && (
        <button type="button" disabled={deaktiviert}
          onClick={async () => (await import('../../lib/vorlagen/vorlagenDocx')).vorlagenDocxErzeugen(ergebnis, { banner: docx.banner, dateiName: docx.dateiName })}
          className="lc-btn-outline disabled:opacity-50 disabled:cursor-not-allowed">
          {docx.label}
        </button>
      )}
      <button type="button" disabled={deaktiviert} onClick={() => onKopieren(dokumentAlsText(ergebnis))}
        className="lc-btn-outline disabled:opacity-50 disabled:cursor-not-allowed">
        {kopiert ? 'Kopiert ✓' : 'Text kopieren'}
      </button>
    </div>
  );
}
