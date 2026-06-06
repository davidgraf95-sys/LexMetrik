import { describe, it, expect } from 'vitest';
import { berechneStreitwert, type StreitwertInput } from '../lib/streitwert';

// ─── Streitwert (Art. 91–94a ZPO) — Goldwerte handgerechnet ─────────────────
// Dossier: bibliothek/recherche/zpo-kosten-streitwert.md (Rechner 1).

const einmalig = (betragCHF: number) => ({ typ: 'einmalig' as const, betragCHF });

describe('Streitwert: Einzelbegehren (Art. 91/92 ZPO)', () => {
  it('einmalig beziffert: Betrag selbst; Verfahren == Kosten', () => {
    const e = berechneStreitwert({ begehren: [einmalig(50_000)] });
    expect(e.streitwertVerfahrenCHF).toBe(50_000);
    expect(e.kostenBasisCHF).toBe(50_000);
    expect(e.ergebnis).toContain("CHF 50'000");
  });

  it('wiederkehrend, ungewisse/unbeschränkte Dauer: Jahresbetrag × 20 (Art. 92 Abs. 2)', () => {
    const e = berechneStreitwert({ begehren: [{ typ: 'wiederkehrend', jahresbetragCHF: 12_000, dauer: 'unbestimmt' }] });
    expect(e.streitwertVerfahrenCHF).toBe(240_000);
  });

  it('wiederkehrend, bestimmte Dauer: Summe + offengelegter Diskontierungs-Vorbehalt', () => {
    const e = berechneStreitwert({ begehren: [{ typ: 'wiederkehrend', jahresbetragCHF: 12_000, dauer: 'bestimmt', jahre: 5 }] });
    expect(e.streitwertVerfahrenCHF).toBe(60_000);
    expect(e.warnungen.join(' ')).toContain('zu verifizieren');
  });

  it('Leibrente: ohne Barwert ERMESSEN (kein Schätzen, §2); mit Barwert dieser selbst', () => {
    const ohne = berechneStreitwert({ begehren: [{ typ: 'wiederkehrend', dauer: 'leibrente', jahresbetragCHF: 12_000 }] });
    expect(ohne.streitwertVerfahrenCHF).toBeNull();
    expect(ohne.ergebnis).toContain('Gericht setzt ihn fest');
    const mit = berechneStreitwert({ begehren: [{ typ: 'wiederkehrend', dauer: 'leibrente', barwertCHF: 100_000 }] });
    expect(mit.streitwertVerfahrenCHF).toBe(100_000);
  });

  it('nicht beziffert (inkl. Verbandsklage Art. 94a): Ermessens-Weiche statt Wert', () => {
    const e = berechneStreitwert({ begehren: [{ typ: 'unbeziffert' }] });
    expect(e.streitwertVerfahrenCHF).toBeNull();
    expect(e.kostenBasisCHF).toBeNull();
    expect(e.rechenweg[0].zwischenergebnis).toContain('Art. 94a');
  });
});

describe('Streitwert: Häufung und Widerklage (Art. 93/94 ZPO)', () => {
  it('Klagenhäufung: Zusammenrechnung (Art. 93 Abs. 1)', () => {
    const e = berechneStreitwert({ begehren: [einmalig(10_000), einmalig(20_000)] });
    expect(e.streitwertVerfahrenCHF).toBe(30_000);
  });

  it('sich ausschliessende Begehren: höchster Einzelwert statt Summe', () => {
    const e = berechneStreitwert({ begehren: [einmalig(10_000), einmalig(20_000)], begehrenSchliessenSichAus: true });
    expect(e.streitwertVerfahrenCHF).toBe(20_000);
  });

  it('Widerklage: Verfahren = max (Abs. 1); Kosten = Summe (Abs. 2) — zwei getrennte Grössen', () => {
    const e = berechneStreitwert({ begehren: [einmalig(30_000)], widerklage: { betragCHF: 50_000 } });
    expect(e.streitwertVerfahrenCHF).toBe(50_000);
    expect(e.kostenBasisCHF).toBe(80_000);
    expect(e.ergebnis).toContain("CHF 50'000");
    expect(e.ergebnis).toContain("CHF 80'000");
  });

  it('Widerklage, sich ausschliessend: Kosten = höherer Wert, Lesart offengelegt', () => {
    const e = berechneStreitwert({ begehren: [einmalig(30_000)], widerklage: { betragCHF: 50_000, schliesstAus: true } });
    expect(e.streitwertVerfahrenCHF).toBe(50_000);
    expect(e.kostenBasisCHF).toBe(50_000);
    expect(e.warnungen.join(' ')).toContain('zu verifizieren');
  });

  it('Teilklage (Art. 94 Abs. 3, Rev. 2025): Kosten NUR nach Hauptklage', () => {
    const e = berechneStreitwert({ begehren: [einmalig(30_000)], widerklage: { betragCHF: 50_000 }, hauptklageIstTeilklage: true });
    expect(e.streitwertVerfahrenCHF).toBe(50_000);  // Verfahren bleibt max
    expect(e.kostenBasisCHF).toBe(30_000);          // Kosten nur Hauptklage
  });

  it('Ermessens-Begehren in der Häufung: Gesamtwert null, Teilwerte nur Orientierung', () => {
    const e = berechneStreitwert({ begehren: [einmalig(30_000), { typ: 'unbeziffert' }] });
    expect(e.streitwertVerfahrenCHF).toBeNull();
    expect(e.warnungen.join(' ')).toContain('Orientierung');
  });
});

describe('Streitwert: Validierung + Determinismus (§2)', () => {
  it('wirft bei leerer Begehren-Liste und ungültiger Widerklage', () => {
    expect(() => berechneStreitwert({ begehren: [] })).toThrow();
    expect(() => berechneStreitwert({ begehren: [einmalig(1)], widerklage: { betragCHF: NaN } })).toThrow();
  });

  it('gleiche Eingabe → identisches Ergebnis', () => {
    const input: StreitwertInput = {
      begehren: [einmalig(30_000), { typ: 'wiederkehrend', jahresbetragCHF: 6_000, dauer: 'unbestimmt' }],
      widerklage: { betragCHF: 10_000 },
    };
    expect(berechneStreitwert(input)).toEqual(berechneStreitwert(input));
    // Handrechnung: 30k + 120k = 150k Verfahren=max(150k,10k)=150k; Kosten=160k
    const e = berechneStreitwert(input);
    expect(e.streitwertVerfahrenCHF).toBe(150_000);
    expect(e.kostenBasisCHF).toBe(160_000);
  });
});
