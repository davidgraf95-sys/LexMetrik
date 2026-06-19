import { describe, it, expect } from 'vitest';
import { zahl, fmtCHF } from '../lib/vorlagen/datum';

// Bug-Audit 19.6.2026 (H3): Der typografische Apostroph U+2019 ist der
// typografisch korrekte Schweizer Tausendertrenner und kommt bei Copy-Paste
// (Word/Web) sowie macOS-Smartquotes. Wird er nicht erkannt, liefert zahl()
// null → in kapitalKern.ts wird daraus Kapital 0 im Gründungsdokument.
describe('datum.zahl/fmtCHF – Tausendertrenner', () => {
  it('parst den GERADEN Apostroph (U+0027)', () => {
    expect(zahl("20'000")).toBe(20000);
  });

  it('parst den TYPOGRAFISCHEN Apostroph (U+2019)', () => {
    expect(zahl('20’000')).toBe(20000);
    expect(zahl('1’000')).toBe(1000);
  });

  it('fmtCHF formatiert auch bei typografischem Apostroph in der Eingabe', () => {
    expect(fmtCHF('1’234.50')).toBe("1'234.50");
  });
});
