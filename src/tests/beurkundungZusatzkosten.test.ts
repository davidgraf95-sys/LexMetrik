// ─── Weitere Transaktionskosten (MwSt · HReg · Emissionsabgabe) ─────────────
import { describe, expect, it } from 'vitest';
import { emissionsabgabe, mwstAufschlag, weitereKosten, FREIES_NOTARIAT } from '../lib/beurkundungZusatzkosten';

// Bug-Audit 19.6.2026 (H6): Art. 6 Abs. 1 lit. h StG normiert einen FREIBETRAG
// (kein Freigrenze): die Beteiligungsrechte sind befreit, «soweit die Leistungen
// … 1 Million Franken nicht übersteigen» — nur der ÜBERSTEIGENDE Teil ist mit 1 %
// steuerbar (gefestigte ESTV-Praxis; deckungsgleich mit gruendungsunterlagen.ts).
// Zuvor zementierte dieser Test fälschlich eine Freigrenze (ganzer Betrag).
describe('Emissionsabgabe (StG Art. 6/8) — Freibetrag CHF 1 Mio', () => {
  it('bis und mit CHF 1 Mio abgabefrei; darüber nur der ÜBERSTEIGENDE Teil × 1 %', () => {
    expect(emissionsabgabe(1_000_000)).toBe(0);        // Freibetrag exakt ausgeschöpft
    expect(emissionsabgabe(999_999)).toBe(0);
    expect(emissionsabgabe(1_000_001)).toBe(0);        // Überschuss 1 → gerundet 0
    expect(emissionsabgabe(1_500_000)).toBe(5_000);    // 500'000 × 1 %
    expect(emissionsabgabe(2_000_000)).toBe(10_000);   // 1'000'000 × 1 %
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
    expect(r.posten.find((p) => p.label.includes('Emissionsabgabe'))?.von).toBe(10_000);
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

describe('Pfandrechtssteuer (Schuldbrief) — kantonale Sätze und Freigrenze', () => {
  const pfand = (k: 'VD' | 'FR', wert: number) =>
    weitereKosten('schuldbrief', k, wert, null).posten.find((p) => p.label.startsWith('Pfandrechtssteuer'));

  it('VD: Freigrenze ≤ CHF 5 000 steuerbefreit (LTim Art. 3 al. 3), darüber 2 ‰', () => {
    expect(pfand('VD', 3_000)?.von).toBe(0);     // unter Freigrenze
    expect(pfand('VD', 5_000)?.von).toBe(0);     // exakt Freigrenze: bis UND mit → befreit
    expect(pfand('VD', 5_001)?.von).toBe(10);    // knapp darüber: 5001 × 0,2 % = 10
    expect(pfand('VD', 500_000)?.von).toBe(1_000);
  });

  it('FR: keine Freigrenze — Satz greift ab dem ersten Franken', () => {
    expect(pfand('FR', 3_000)?.von).toBe(23);    // 3000 × 0,75 % = 22,5 → 23
  });
});
