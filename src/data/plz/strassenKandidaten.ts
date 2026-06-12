// ─── Deterministische Strassen-Eingabe-Kandidaten (Adress-Ausbau 12.6.2026) ─
// Fachneutrale Infrastruktur (§4), geteilt von der Stadt-Zürich- und der
// CH-Strassenauflösung: exakt · normalisierter Leerraum · die feste
// «…str.»/«…str»→«…strasse»-Abbildung. KEIN Fuzzy-Matching (§2) — die
// case-insensitive Zweitsuche bauen die Aufrufer über ihre Indizes.

export function strassenKandidaten(roh: string): string[] {
  const s = roh.trim().replace(/\s+/g, ' ');
  if (s === '') return [];
  const out = new Set<string>();
  // Apostroph beidseitig normalisieren (U+2019 ↔ U+0027, feste Abbildung —
  // macOS setzt typografische Apostrophe automatisch; der amtliche Bestand
  // ist durchgehend ASCII; Bug-Check 12.6.2026: ~1'300 Romandie-Strassen
  // «l'…/d'…» scheiterten sonst handgetippt). Muster: namensKandidaten.
  for (const basis of new Set([s, s.replace(/’/g, "'"), s.replace(/'/g, '’')])) {
    out.add(basis);
    // «…str.»/«…Str»/«…STR.» → «…strasse» (fest, case-insensitiv — die
    // Kleinform genügt, der case-insensitive Zweitindex der Aufrufer
    // matcht den Rest; Bug-Check 12.6.2026: ALL-CAPS fiel sonst durch).
    out.add(basis.replace(/str\.?$/i, 'strasse'));
  }
  return [...out];
}
