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
