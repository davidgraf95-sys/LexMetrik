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

// ── Geteilte Vorlagen-Helfer (Versimplung 5.6.2026, golden-bewiesen) ────────
// Zuvor wortgleich in schlichtungsgesuchBs, arbeitsvertrag und mietvertrag.

/** ISO-Datum → dd.MM.yyyy; leer/unvollständig → Ausfüll-Strich. */
export const fmtDatum = (iso?: string): string =>
  (iso?.includes('-') ? iso.split('-').reverse().join('.') : iso || '________');

/** CHF-Betrag mit Tausender-Apostroph und zwei Dezimalen. */
export function fmtCHF(roh: string): string {
  const n = Number(String(roh).replace(/['\s]/g, '').replace(',', '.'));
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

/** Robuste Zahl aus Nutzereingabe (Apostroph/Komma toleriert) – sonst null. */
export const zahl = (roh?: string): number | null => {
  const n = Number(String(roh ?? '').replace(/['\s]/g, '').replace(',', '.'));
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
