// Langes Schweizer Datumsformat für Briefkopf/Unterschriften der Vorlagen
// («5. Juni 2026») — deterministisch aus ISO, kein Locale-API.
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

/** Robuste Zahl aus Nutzereingabe (Apostroph/Komma toleriert) — sonst null. */
export const zahl = (roh?: string): number | null => {
  const n = Number(String(roh ?? '').replace(/['\s]/g, '').replace(',', '.'));
  return Number.isFinite(n) && String(roh ?? '').trim() !== '' ? n : null;
};
