// ─── Fachneutrale Formatter & Parser (Formatter-Heimat, H-9) ────────────────
//
// SSOT der fachneutralen Anzeige-/Parse-Helfer (Datum, CHF, Schweizer Zahl).
// KEINE materielle Rechtsregel (§2/§3): reine Darstellung/Normalisierung, kein
// Recht. Ausserhalb des Risikopfad-Namespaces `vorlagen/` angesiedelt, damit
// Engine-/Tarif-Module hier importieren statt lokal zu kopieren (Duplikat-
// Ursache war strukturell). `vorlagen/datum.ts` re-exportiert diese Symbole
// unverändert (Fassade, §6 Ziff. 6) — kein Konsument-Importpfad bricht.

// Langes Schweizer Datumsformat für Briefkopf/Unterschriften der Vorlagen
// («5. Juni 2026») – deterministisch aus ISO, kein Locale-API.
const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

export function fmtDatumLang(iso?: string): string {
  if (!iso?.includes('-')) return iso || '________';
  const [j, m, t] = iso.split('-').map(Number);
  if (!j || !m || !t || m < 1 || m > 12) return iso;
  return `${t}. ${MONATE[m - 1]} ${j}`;
}

/** ISO-Datum → dd.MM.yyyy; leer/unvollständig → Ausfüll-Strich. */
export const fmtDatum = (iso?: string): string =>
  (iso?.includes('-') ? iso.split('-').reverse().join('.') : iso || '________');

/** STRENGES ISO-Datum (genau yyyy-MM-dd) → dd.MM.yyyy; sonst Ausfüll-Strich.
 *  Bewusst strenger als fmtDatum (Regex statt includes; '________' statt Roh-ISO).
 *  Zuvor 6× wortgleich in den Vertrags-Schemas (Entdoppelung, golden-bewiesen). */
export const fmtIsoStrict = (iso: string): string =>
  /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.split('-').reverse().join('.') : '________';

/** CHF-Betrag mit Tausender-Apostroph und zwei Dezimalen. */
export function fmtCHF(roh: string): string {
  const n = Number(String(roh).replace(/['’\s]/g, '').replace(',', '.'));
  if (!Number.isFinite(n)) return roh;
  const [ganz, dez] = n.toFixed(2).split('.');
  return ganz.replace(/\B(?=(\d{3})+(?!\d))/g, "'") + '.' + dez;
}

/**
 * CHF-Betrag aus einer ZAHL: de-CH mit genau zwei Dezimalen
 * (Tausender-Trennung gemäss Locale). Zuvor wortgleich lokal definiert in
 * lib/teuerung.ts, lib/erbteilung.ts und components/forms/ErbteilungForm.tsx
 * (Entdoppelung 5.6.2026, golden-bewiesen). NICHT verwechseln mit `fmtCHF`
 * (oben, für Nutzer-STRINGS) oder verzugszins.formatCHF (spezialisiert).
 */
export const chf = (n: number): string =>
  n.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * CHF-Betrag GERUNDET auf GANZE Franken mit «CHF »-Präfix (de-CH-Trennung).
 * Reiner Anzeige-Helfer der Gebühren-/Kosten-Formulare. BEWUSST verschieden von
 * `chf` (zwei Dezimalen, kein Präfix): hier ganze Franken — daher eigener Name,
 * nicht zusammenführen (§1). Zuvor wortgleich in GrundbuchEintragForm/
 * BeurkundungForm/NotariatGrundbuchForm/ProzesskostenForm (Entdopplung, §6 Ziff. 6)
 * SOWIE 5× lokal in tarif/staffel · prozesskosten · notariatGrundbuch (H-9).
 */
export const chfGanz = (n: number): string => `CHF ${Math.round(n).toLocaleString('de-CH')}`;

/** Robuste Zahl aus Nutzereingabe (Apostroph/Komma toleriert) – sonst null. */
export const zahl = (roh?: string): number | null => {
  const n = Number(String(roh ?? '').replace(/['’\s]/g, '').replace(',', '.'));
  return Number.isFinite(n) && String(roh ?? '').trim() !== '' ? n : null;
};

/** Positive GANZE Zahl aus Nutzereingabe (Stückzahlen: Aktien, Stammanteile,
 *  Zeichnungen) – sonst null. /simplify 7.6.2026: das Muster
 *  «zahl(x) ≤ 0 ‖ !Number.isInteger» stand zuvor 5× wortgleich in den
 *  Mappen-Gates; die NORM-Fehlertexte bleiben bewusst beim Aufrufer (§3/§4). */
export const ganzePositive = (roh?: string): number | null => {
  const n = zahl(roh);
  return n !== null && n > 0 && Number.isInteger(n) ? n : null;
};
