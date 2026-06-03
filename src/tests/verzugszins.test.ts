import { describe, it, expect } from 'vitest';
import { berechneVerzugszins, formatCHF } from '../lib/verzugszins';
import type { VerzugszinsInput } from '../lib/verzugszins';

const base = (over: Partial<VerzugszinsInput>): VerzugszinsInput => ({
  kapital: 10000,
  verzugsbeginn: '2023-01-01',
  verzugsende: '2024-01-01', // 365 Tage (2023 kein Schaltjahr)
  ...over,
});

describe('Verzugszins (Art. 104 OR)', () => {
  it('act/365: 5% auf 10\'000 für 365 Tage → 500.00', () => {
    const r = berechneVerzugszins(base({ methode: 'act365' }));
    expect(r.status).toBe('ok');
    expect(r.tage).toBe(365);
    expect(r.zinsbetrag).toBe(500);
    expect(r.zinsbetragCHF).toBe('500.00');
  });

  it('act/360: 5% auf 10\'000 für 360 Tage → 500.00', () => {
    const r = berechneVerzugszins(base({ verzugsbeginn: '2023-01-01', verzugsende: '2023-12-27', methode: 'act360' }));
    expect(r.tage).toBe(360);
    expect(r.zinsbetrag).toBe(500);
  });

  it('act/360: 5% auf 10\'000 für 180 Tage → 250.00', () => {
    const r = berechneVerzugszins(base({ verzugsbeginn: '2023-01-01', verzugsende: '2023-06-30', methode: 'act360' }));
    expect(r.tage).toBe(180);
    expect(r.zinsbetrag).toBe(250);
  });

  it('Default-Satz ist 5% (Art. 104 Abs. 1)', () => {
    const r = berechneVerzugszins(base({}));
    expect(r.zinssatz).toBe(5);
  });

  it('Vertraglicher Satz (Abs. 2) 8%: 360 Tage act/360 → 800.00 + Beweislast-Warnung', () => {
    const r = berechneVerzugszins(base({ verzugsbeginn: '2023-01-01', verzugsende: '2023-12-27', zinssatzProzent: 8, satzGrund: 'vertraglich', methode: 'act360' }));
    expect(r.zinsbetrag).toBe(800);
    expect(r.warnungen.some((w) => w.includes('Beweislast'))).toBe(true);
  });

  it('30E/360: 10.1. bis 10.4. → 90 Tage', () => {
    const r = berechneVerzugszins(base({ verzugsbeginn: '2023-01-10', verzugsende: '2023-04-10', methode: '30E360' }));
    expect(r.tage).toBe(90);
    expect(r.zinsbetrag).toBe(125); // 10000 * 5% * 90/360
  });

  it('Rundung auf Rappen', () => {
    const r = berechneVerzugszins(base({ methode: 'act360' })); // 365/360
    // 10000 * 0.05 * 365/360 = 506.9444... → 506.94
    expect(r.zinsbetrag).toBe(506.94);
  });

  it('Kapital ≤ 0 → kein Anspruch', () => {
    expect(berechneVerzugszins(base({ kapital: 0 })).status).toBe('kein_anspruch');
  });

  it('Ende vor Beginn → unzulässig', () => {
    expect(berechneVerzugszins(base({ verzugsbeginn: '2024-01-01', verzugsende: '2023-01-01' })).status).toBe('unzulaessig');
  });

  it('Verfalltag (ohne Mahnung) → Art. 108 Ziff. 1 im Rechenweg', () => {
    const r = berechneVerzugszins(base({ verzugsgrund: 'verfalltag' }));
    const txt = r.rechenweg.map((s) => s.zwischenergebnis + ' ' + s.normen.map((n) => n.artikel).join(',')).join('\n');
    expect(txt).toContain('Art. 108 Ziff. 1 OR');
  });

  it('Schweizer Betragsformat', () => {
    expect(formatCHF(1234.5)).toBe("1'234.50");
    expect(formatCHF(1000000)).toBe("1'000'000.00");
    expect(formatCHF(0)).toBe('0.00');
  });
});
