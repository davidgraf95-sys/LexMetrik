import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Bug-Audit 19.6.2026 (H3/H3b, permanente Invariante): Zahl-/CHF-Parser müssen den
// typografischen Apostroph U+2019 (’) als Tausendertrenner erkennen (Copy-Paste/
// macOS). Sonst wird «20’000» zu null/NaN → z.B. Stammkapital 0 im Dokument.
// Diese Invariante verhindert die Rückkehr der alten Bereinigungs-Regex ohne ’.
describe('Invariante: Zahl-Parser erkennen U+2019 (alte Apostroph-Regex verboten)', () => {
  it('keine Quelldatei nutzt die alte Apostroph-Regex ohne U+2019', () => {
    const quelldateien = (readdirSync('src', { recursive: true }) as string[])
      .map(String)
      .filter((f) => /\.(ts|tsx)$/.test(f));
    // alte Regex-Signatur: Zeichenklasse-Beginn, gerader Apostroph, dann \s] —
    // OHNE den typografischen Apostroph U+2019 dazwischen.
    const apostrophKlasse = String.fromCharCode(91, 39); // [ '
    const typografisch = String.fromCharCode(8217);      // ’
    const treffer = quelldateien.filter((rel) => {
      const inhalt = readFileSync(join('src', rel), 'utf8');
      let i = inhalt.indexOf(apostrophKlasse);
      while (i !== -1) {
        const next = inhalt[i + apostrophKlasse.length];
        if (next === '\\') return true;        // [' \s]  → alte Signatur (ohne ’)
        i = inhalt.indexOf(apostrophKlasse, i + 1);
      }
      return false;
    });
    void typografisch;
    expect(treffer, `Dateien mit alter Apostroph-Regex: ${treffer.join(', ')}`).toEqual([]);
  });
});
