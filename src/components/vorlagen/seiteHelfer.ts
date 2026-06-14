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
