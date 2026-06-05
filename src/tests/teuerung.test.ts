import { describe, it, expect } from 'vitest';
import { berechneTeuerung, basisAuto, indexWert, LIK_LETZTER_MONAT } from '../lib/teuerung';
import { LIK_REIHEN } from '../data/likReihe';

// Akzeptanztests LIK-Teuerungsrechner (Konzept-Bericht 5.6.2026).
// Spotchecks = im Bericht amtlich belegte Indexstände (Basis Dez 2020 = 100).

describe('LIK-Datenreihe (amtliche Spotchecks)', () => {
  it('Reihen-Werte decken sich mit den BFS-Medienmitteilungen', () => {
    const r = LIK_REIHEN['2020-12'];
    expect(r['2022-12']).toBe(104.4);
    expect(r['2023-12']).toBe(106.2);
    expect(r['2024-12']).toBe(106.9);
    expect(r['2025-04']).toBe(107.5);
    expect(r['2025-11']).toBe(107.0);
    expect(r['2025-12']).toBe(106.9);
    expect(r['2026-04']).toBe(108.1); // = 101.1 auf Basis Dez 2025
    expect(LIK_REIHEN['2025-12']['2026-04']).toBe(101.1);
    expect(LIK_LETZTER_MONAT >= '2026-05').toBe(true);
  });

  it('jede Basis startet mit 100.0 am Basismonat; Reihen lückenlos monoton im Schlüssel', () => {
    for (const [basis, reihe] of Object.entries(LIK_REIHEN)) {
      expect(reihe[basis], basis).toBe(100.0);
      const monate = Object.keys(reihe).sort();
      expect(monate[0]).toBe(basis);
      // lückenlos: Anzahl = Monatsdifferenz + 1
      const [j0, m0] = monate[0].split('-').map(Number);
      const [j1, m1] = monate[monate.length - 1].split('-').map(Number);
      expect(monate.length, basis).toBe((j1 - j0) * 12 + (m1 - m0) + 1);
    }
  });
});

describe('Teuerungsrechner — Berechnung', () => {
  it('Basis-AUTO wählt die jüngste gemeinsame Originalbasis (wie der BFS-Rechner)', () => {
    expect(basisAuto('2022-12', '2026-04')).toBe('2020-12');
    expect(basisAuto('2007-10', '2012-03')).toBe('2005-12');
    expect(basisAuto('1995-01', '2026-01')).toBe('1993-05');
  });

  it('Praxisbeispiel des Berichts: Okt 2007 → März 2012 ergibt +2.0 % (Basis Dez 2005)', () => {
    expect(indexWert('2005-12', '2007-10')).toBe(101.9);
    expect(indexWert('2005-12', '2012-03')).toBe(103.9);
    const r = berechneTeuerung({ modus: 'indexmiete', betrag: 2500, vonMonat: '2007-10', bisMonat: '2012-03' });
    expect(r.prozent).toBe(2.0);
    expect(r.basis).toBe('2005-12');
    // 2500 × 103.9/101.9 = 2549.0677… → 5-Rappen-Rundung
    expect(r.betragNeu).toBe(2549.05);
  });

  it('generisch: Rappen-Rundung; Senkung erzeugt Mietsenkungs-Warnung (Art. 17 Abs. 2 VMWG)', () => {
    const g = berechneTeuerung({ modus: 'generisch', betrag: 548, vonMonat: '2022-12', bisMonat: '2024-12' });
    expect(g.betragNeu).toBe(Math.round(548 * (106.9 / 104.4) * 100) / 100);
    const senkung = berechneTeuerung({ modus: 'indexmiete', betrag: 2000, vonMonat: '2025-04', bisMonat: '2025-12' });
    expect(senkung.prozent).toBeLessThan(0);
    expect(senkung.warnungen.join()).toMatch(/Senkungspflicht/);
  });

  it('Unterhalt: Normverweise 286/128 ZGB + November-Praxis-Hinweis', () => {
    const u = berechneTeuerung({ modus: 'unterhalt', betrag: 1200, vonMonat: '2023-11', bisMonat: '2025-11' });
    expect(u.normverweise.map((n) => n.artikel)).toContain('Art. 286 ZGB');
    expect(u.warnungen.join()).toMatch(/NOVEMBER des Vorjahres/);
    expect(u.betragNeu).toBe(Math.round(1200 * (107.0 / indexWert('2020-12', '2023-11')!) * 20) / 20);
  });

  it('Validierung: Zukunftsmonat, vertauschte Monate, Betrag 0', () => {
    expect(() => berechneTeuerung({ modus: 'generisch', betrag: 100, vonMonat: '2025-01', bisMonat: '2099-01' })).toThrow(/noch nicht publiziert/);
    expect(() => berechneTeuerung({ modus: 'generisch', betrag: 100, vonMonat: '2025-01', bisMonat: '2024-01' })).toThrow(/vor dem Zielmonat/);
    expect(() => berechneTeuerung({ modus: 'generisch', betrag: 0, vonMonat: '2024-01', bisMonat: '2025-01' })).toThrow(/grösser als 0/);
    expect(() => berechneTeuerung({ modus: 'generisch', betrag: 100, vonMonat: '1950-01', bisMonat: '2025-01' })).toThrow(/ab September 1966/);
  });

  it('deterministisch + basisinvariant: Verhältnis 2020er-Basis ≈ 2005er-Basis (±Rundung)', () => {
    const a = berechneTeuerung({ modus: 'generisch', betrag: 1000, vonMonat: '2021-06', bisMonat: '2024-06' });
    const b = berechneTeuerung({ modus: 'generisch', betrag: 1000, vonMonat: '2021-06', bisMonat: '2024-06' });
    expect(a).toEqual(b);
    const r2020 = indexWert('2020-12', '2024-06')! / indexWert('2020-12', '2021-06')!;
    const r2005 = indexWert('2005-12', '2024-06')! / indexWert('2005-12', '2021-06')!;
    expect(Math.abs(r2020 - r2005)).toBeLessThan(0.002); // gerundete Reihen: ±0.1-Punkt-Effekt
  });
});
