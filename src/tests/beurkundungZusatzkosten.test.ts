// ─── Weitere Transaktionskosten (MwSt · HReg · Emissionsabgabe) ─────────────
import { describe, expect, it } from 'vitest';
import { emissionsabgabe, mwstAufschlag, weitereKosten, FREIES_NOTARIAT } from '../lib/beurkundungZusatzkosten';

describe('Emissionsabgabe (StG Art. 6/8) — Freigrenze, kein Freibetrag', () => {
  it('bis und mit CHF 1 Mio abgabefrei; darüber der GANZE Betrag × 1 %', () => {
    expect(emissionsabgabe(1_000_000)).toBe(0);        // Freigrenze exakt erreicht
    expect(emissionsabgabe(999_999)).toBe(0);
    expect(emissionsabgabe(1_000_001)).toBe(10_000);   // ganzer Betrag, nicht nur Überschuss
    expect(emissionsabgabe(1_500_000)).toBe(15_000);
    expect(emissionsabgabe(0)).toBe(0);
  });
});

describe('MwSt-Aufschlag', () => {
  it('8,1 % der Gebühr', () => {
    expect(mwstAufschlag(1_000)).toBe(81);
    expect(mwstAufschlag(10_000)).toBe(810);
  });
});

describe('weitereKosten — Zusammensetzung je Geschäftsart/Kanton', () => {
  it('AG-Gründung im Amtsnotariat (ZH): HReg + Emissionsabgabe, KEINE MwSt', () => {
    const r = weitereKosten('ag_gruendung', 'ZH', 2_000_000, { vonChf: 1000, bisChf: 1000 });
    expect(r.freiesNotariat).toBe(false);
    const labels = r.posten.map((p) => p.label);
    expect(labels.some((l) => l.startsWith('MwSt'))).toBe(false);
    expect(r.posten.find((p) => p.label.includes('Handelsregister'))?.von).toBe(420);
    expect(r.posten.find((p) => p.label.includes('Emissionsabgabe'))?.von).toBe(20_000);
  });

  it('AG-Gründung im freien Notariat (GE): MwSt + HReg + Emissionsabgabe', () => {
    const r = weitereKosten('ag_gruendung', 'GE', 500_000, { vonChf: 2000, bisChf: 2000 });
    expect(r.freiesNotariat).toBe(true);
    expect(r.posten.find((p) => p.label.startsWith('MwSt'))?.von).toBe(162); // 8,1 % von 2000
    expect(r.posten.find((p) => p.label.includes('Handelsregister'))?.von).toBe(420);
    expect(r.posten.find((p) => p.label.includes('Emissionsabgabe'))?.von).toBe(0); // 500k < Freigrenze
  });

  it('Testament (keine Gesellschaft): keine HReg/Emissionsabgabe; MwSt nur im freien Notariat', () => {
    const ow = weitereKosten('testament', 'OW', undefined, { vonChf: 500, bisChf: 1000 }); // OW freies
    expect(ow.posten.map((p) => p.label)).toEqual(['MwSt 8.1 % (freies Notariat)']);
    expect(ow.posten[0].von).toBe(41); // 8,1 % von 500 (gerundet)
    const zh = weitereKosten('testament', 'ZH', undefined, { vonChf: 200, bisChf: 5000 }); // ZH Amts
    expect(zh.posten).toHaveLength(0);
  });

  it('FREIES_NOTARIAT: 14 Kantone, ZH/LU/SG nicht enthalten', () => {
    expect(FREIES_NOTARIAT.size).toBe(14);
    expect(FREIES_NOTARIAT.has('ZH')).toBe(false);
    expect(FREIES_NOTARIAT.has('GE')).toBe(true);
  });
});
