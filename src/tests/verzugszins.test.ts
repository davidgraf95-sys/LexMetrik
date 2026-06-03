import { describe, it, expect } from 'vitest';
import { berechneVerzugszins, formatCHF } from '../lib/verzugszins';
import type { VerzugszinsInput } from '../lib/verzugszins';

const base = (over: Partial<VerzugszinsInput>): VerzugszinsInput => ({
  kapital: 10000,
  verzugsbeginn: '2023-01-01',
  stichtag: '2024-01-01', // 365 Tage (2023 kein Schaltjahr)
  zinssatzProzent: 5,
  ...over,
});

describe('Verzugszins (Art. 104 OR) – Grundberechnung', () => {
  it('act/365: 5% auf 10\'000 für 365 Tage → 500.00', () => {
    const r = berechneVerzugszins(base({ methode: 'act365' }));
    expect(r.status).toBe('ok');
    expect(r.tageTotal).toBe(365);
    expect(r.zinsTotal).toBe(500);
    expect(r.totalOffenCHF).toBe("10'500.00");
  });

  it('act/360: 360 Tage → 500.00', () => {
    const r = berechneVerzugszins(base({ stichtag: '2023-12-27', methode: 'act360' }));
    expect(r.tageTotal).toBe(360);
    expect(r.zinsTotal).toBe(500);
  });

  it('30E/360: 10.1.–10.4. → 90 Tage → 125.00', () => {
    const r = berechneVerzugszins(base({ verzugsbeginn: '2023-01-10', stichtag: '2023-04-10', methode: '30E360' }));
    expect(r.tageTotal).toBe(90);
    expect(r.zinsTotal).toBe(125);
  });

  it('Rundung auf Rappen (act/360, 365 Tage → 506.94)', () => {
    const r = berechneVerzugszins(base({ methode: 'act360' }));
    expect(r.zinsTotal).toBe(506.94);
  });

  it('linear, kein Zinseszins über 2 Jahre (Art. 105 Abs. 3)', () => {
    const r = berechneVerzugszins(base({ stichtag: '2025-01-01', methode: 'act360' }));
    expect(r.kapitalOffen).toBe(10000); // Kapital wächst nicht
    expect(r.zinsTotal).toBe(Math.round(10000 * 0.05 * r.tageTotal / 360 * 100) / 100);
  });
});

describe('Verzugszins – Teilzahlungen (Art. 85 OR) & Staffelung', () => {
  it('Teilzahlung tilgt zuerst Zinsen, dann Kapital', () => {
    const r = berechneVerzugszins(base({
      stichtag: '2023-12-27', methode: 'act360',
      ereignisse: [{ typ: 'teilzahlung', datum: '2023-12-27', betrag: 1500 }],
    }));
    // 360 Tage → 500 Zins; Zahlung 1500: 500 auf Zins, 1000 auf Kapital
    expect(r.zinsTotal).toBe(500);
    expect(r.zinsGetilgt).toBe(500);
    expect(r.zinsOffen).toBe(0);
    expect(r.kapitalOffen).toBe(9000);
    expect(r.totalOffen).toBe(9000);
  });

  it('Teilzahlung < aufgelaufene Zinsen → Kapital unverändert', () => {
    const r = berechneVerzugszins(base({
      stichtag: '2023-12-27', methode: 'act360',
      ereignisse: [{ typ: 'teilzahlung', datum: '2023-12-27', betrag: 300 }],
    }));
    expect(r.zinsGetilgt).toBe(300);
    expect(r.zinsOffen).toBe(200);
    expect(r.kapitalOffen).toBe(10000);
    expect(r.totalOffen).toBe(10200);
  });

  it('Satzänderung erzeugt zwei Perioden mit unterschiedlichem Satz', () => {
    const r = berechneVerzugszins(base({
      verzugsbeginn: '2023-01-01', stichtag: '2024-06-27', methode: 'act360',
      ereignisse: [{ typ: 'satzaenderung', datum: '2023-12-27', satz: 10 }],
    }));
    expect(r.segmente.length).toBe(2);
    expect(r.segmente[0].satz).toBe(5);
    expect(r.segmente[0].zins).toBe(500); // 360 Tage @5%
    expect(r.segmente[1].satz).toBe(10);
    expect(r.zinsTotal).toBe(Math.round((r.segmente[0].zins + r.segmente[1].zins) * 100) / 100);
  });

  it('Ereignis ausserhalb des Zeitraums wird ignoriert (mit Warnung)', () => {
    const r = berechneVerzugszins(base({
      stichtag: '2023-06-30', methode: 'act360',
      ereignisse: [{ typ: 'teilzahlung', datum: '2024-01-01', betrag: 500 }],
    }));
    expect(r.warnungen.some((w) => w.includes('ausserhalb des Zeitraums'))).toBe(true);
    expect(r.kapitalOffen).toBe(10000);
  });
});

describe('Verzugszins – Verzugsbeginn & Validierung', () => {
  it('Verfalltag (Art. 102 Abs. 2): Zinslauf ab Folgetag', () => {
    const r = berechneVerzugszins(base({ verzugsbeginn: '2023-12-31', beginnTyp: 'verfalltag', stichtag: '2024-12-31' }));
    expect(r.ersterZinstag).toBe('01.01.2024');
  });

  it('Verfalltag-Hinweis nennt Art. 108 Ziff. 1 OR', () => {
    const r = berechneVerzugszins(base({ beginnTyp: 'verfalltag' }));
    const txt = r.rechenweg.flatMap((s) => s.normen.map((n) => n.artikel)).join(',');
    expect(txt).toContain('Art. 108 Ziff. 1 OR');
  });

  it('rückständige Zinsforderung (Art. 105 Abs. 1) → Hinweis', () => {
    const r = berechneVerzugszins(base({ rueckstaendigeZinsforderung: true }));
    expect(r.warnungen.some((w) => w.includes('Art. 105 Abs. 1 OR'))).toBe(true);
  });

  it('Kapital ≤ 0 → kein Anspruch', () => {
    expect(berechneVerzugszins(base({ kapital: 0 })).status).toBe('kein_anspruch');
  });

  it('Stichtag vor erstem Zinstag → unzulässig', () => {
    expect(berechneVerzugszins(base({ verzugsbeginn: '2024-01-01', stichtag: '2023-01-01' })).status).toBe('unzulaessig');
  });

  it('Schweizer Betragsformat', () => {
    expect(formatCHF(1234.5)).toBe("1'234.50");
    expect(formatCHF(1000000)).toBe("1'000'000.00");
    expect(formatCHF(0)).toBe('0.00');
  });
});
