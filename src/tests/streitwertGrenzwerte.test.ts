// Grenzwert-Abgleich (ROADMAP Schritt 3 #2): ZPO-Verfahrensart (Art. 243 I)
// strikt getrennt von der BGG-Beschwerde-Schwelle (Art. 74 I lit. a/b).
import { describe, it, expect } from 'vitest';
import { streitwertGrenzwerte } from '../lib/streitwert';

const zpo = (sw: number | null, g: 'miete_arbeit' | 'uebrige' = 'uebrige') =>
  streitwertGrenzwerte(sw, g).find((x) => x.regime === 'zpo-verfahrensart')!;
const bgg = (sw: number | null, g: 'miete_arbeit' | 'uebrige') =>
  streitwertGrenzwerte(sw, g).find((x) => x.regime === 'bgg-beschwerde-zivil')!;

describe('ZPO-Verfahrensart (Art. 243 Abs. 1) — gebietsunabhängig 30 000', () => {
  it('Grenze exakt: 30 000 = vereinfacht (≤), 30 001 = ordentlich', () => {
    expect(zpo(30_000).erfuellt).toBe(true);
    expect(zpo(30_001).erfuellt).toBe(false);
  });
  it('Gebiet ändert die ZPO-Verfahrensgrenze NICHT', () => {
    expect(zpo(20_000, 'miete_arbeit').schwelleCHF).toBe(30_000);
    expect(zpo(20_000, 'uebrige').schwelleCHF).toBe(30_000);
  });
  it('Ermessen (null) → keine Schwellen-Aussage', () => {
    expect(zpo(null).erfuellt).toBeNull();
  });
});

describe('BGG-Beschwerde in Zivilsachen (Art. 74 Abs. 1)', () => {
  it('übrige: Schwelle 30 000, ≥ erreicht', () => {
    expect(bgg(30_000, 'uebrige').schwelleCHF).toBe(30_000);
    expect(bgg(30_000, 'uebrige').erfuellt).toBe(true);
    expect(bgg(29_999, 'uebrige').erfuellt).toBe(false);
  });
  it('Miete/Arbeit: Schwelle 15 000 (lit. a)', () => {
    expect(bgg(15_000, 'miete_arbeit').schwelleCHF).toBe(15_000);
    expect(bgg(15_000, 'miete_arbeit').erfuellt).toBe(true);
    expect(bgg(14_999, 'miete_arbeit').erfuellt).toBe(false);
  });
  it('unter Schwelle → «selbst prüfen» nennt Art. 74 II + Verfassungsbeschwerde', () => {
    const b = bgg(10_000, 'uebrige');
    expect(b.erfuellt).toBe(false);
    expect(b.selbstPruefen.join(' ')).toMatch(/grundsätzlicher Bedeutung/);
    expect(b.selbstPruefen.join(' ')).toMatch(/Art\. 113/);
  });
});

describe('Strikte Regime-Trennung (gleiche Zahl, zwei Regimes)', () => {
  it('Miete 20 000: ZPO vereinfacht (≤30k) UND BGG erreicht (≥15k) — getrennt ausgewiesen', () => {
    const z = zpo(20_000, 'miete_arbeit');
    const b = bgg(20_000, 'miete_arbeit');
    expect(z.erfuellt).toBe(true); // vereinfachtes Verfahren
    expect(b.erfuellt).toBe(true); // BGG-Streitwertgrenze erreicht
    expect(z.norm.artikel).toContain('243 ZPO');
    expect(b.norm.artikel).toContain('74 BGG');
  });
  it('immer beide Regimes, nie verschmolzen', () => {
    const r = streitwertGrenzwerte(50_000, 'uebrige');
    expect(r.map((x) => x.regime)).toEqual(['zpo-verfahrensart', 'bgg-beschwerde-zivil']);
  });
  it('BGG-Befund weist auf eigenständige Streitwert-Bestimmung Art. 51–53 BGG hin (§8)', () => {
    expect(bgg(50_000, 'uebrige').selbstPruefen.join(' ')).toMatch(/Art\. 51–53 BGG/);
  });
});
