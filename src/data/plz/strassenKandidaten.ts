// ─── Deterministische Strassen-Eingabe-Kandidaten (Adress-Ausbau 12.6.2026) ─
// Fachneutrale Infrastruktur (§4), geteilt von der Stadt-Zürich- und der
// CH-Strassenauflösung: exakt · normalisierter Leerraum · die feste
// «…str.»/«…str»→«…strasse»-Abbildung. KEIN Fuzzy-Matching (§2) — die
// case-insensitive Zweitsuche bauen die Aufrufer über ihre Indizes.

export function strassenKandidaten(roh: string): string[] {
  const s = roh.trim().replace(/\s+/g, ' ');
  if (s === '') return [];
  const out = new Set([s]);
  out.add(s.replace(/[Ss]tr\.?$/, (m) => (m.startsWith('S') ? 'Strasse' : 'strasse')));
  return [...out];
}
