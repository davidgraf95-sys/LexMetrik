import type { CatalogItem } from '../../lib/startseiteConfig';

// ─── Geteilte Darstellungs-Helfer der Vorlagen-Seiten ───────────────────────
// Reine UI-Prädikate (§3) — zuvor je Seite kopiert (ISO-Regex 14×, DOCX-Gate
// 2× pro Seite). Eigene Datei, damit VorlagenSeite.tsx nur die Komponente
// exportiert (react-refresh).

const ISO_DATUM = /^\d{4}-\d{2}-\d{2}$/;
/** ISO-Datum (yyyy-mm-dd) vollständig erfasst? */
export const istIsoDatum = (wert: string): boolean => ISO_DATUM.test(wert);

/** Form-Gate: bietet diese Karte DOCX als Ausgabeformat an? (§8: die
 *  Formvorschrift bestimmt die angebotenen Exportformate.) */
export const docxAktiv = (card: CatalogItem | undefined): boolean =>
  card?.modus === 'vorlage' && !!card.output?.includes('docx');

// ─── D5 (W2·24) · Prüf-Befund des letzten Wizard-Schritts ───────────────────

export type SchrittBefund = { index: number; label: string; fehler: string[] };

/** Sammelt die Fehler ALLER Schritte zu einer Liste der unvollständigen
 *  Schritte — die Auskunft, die dem Schritt «Prüfen & Download» bis D5
 *  fehlte (er kannte nur die Fehler des gerade sichtbaren Schritts).
 *  Rein und deterministisch (§2): gleiche Eingabe, gleiche Liste. */
export function sammleBefunde(
  schritte: readonly { id: string; label: string }[],
  fehlerJeSchritt: (i: number) => string[],
): SchrittBefund[] {
  const out: SchrittBefund[] = [];
  for (let i = 0; i < schritte.length; i++) {
    const fehler = fehlerJeSchritt(i);
    if (fehler.length > 0) out.push({ index: i, label: schritte[i].label, fehler });
  }
  return out;
}

export const befundZahl = (befunde: SchrittBefund[]): number =>
  befunde.reduce((n, b) => n + b.fehler.length, 0);
