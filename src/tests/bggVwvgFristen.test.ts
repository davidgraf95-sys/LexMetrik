import { describe, it, expect } from 'vitest';
import { berechneBggVwvgFrist, bvAusnahmenSatz } from '../lib/bggVwvgFristen';
import { berechneFrist } from '../lib/zpoFristen';

// Verwaltungs-Stillstand (Art. 22a VwVG) + BGG-Stillstand (Art. 46 BGG).
// Auftrag David 13.6.2026. Die Perioden sind identisch zur ZPO; geprüft wird
// hier das, was die Regimes UNTERSCHEIDET (§4): «nur nach Tagen bestimmt» und
// die je eigenen Abs.-2-Ausnahmen.

describe('bggVwvgFristen – Stillstand Art. 22a VwVG / Art. 46 BGG', () => {
  it('Tagesfrist ruht über die Sommerperiode (15.7.–15.8.)', () => {
    const r = berechneBggVwvgFrist({ regime: 'vwvg', ereignis: '2026-07-10', einheit: 'tage', laenge: 30, kanton: 'ZH' });
    expect(r.stillstandAktiv).toBe(true);
    // Ohne Stillstand wäre das Ende ~9.8.; durch die Pause 15.7.–15.8. liegt es
    // deutlich später (im September).
    expect(r.diesAdQuemISO > '2026-08-15').toBe(true);
    expect(r.normen).toContain('Art. 22a Abs. 1 VwVG');
  });

  it('Tagesfrist deckt sich periodengleich mit der ZPO-Gerichtsferien-Rechnung', () => {
    // Gleiche drei Perioden, gleicher Ruhen-Mechanismus → gleiches Tagesfrist-
    // Ende wie die ZPO bei gesetzlicher Frist im ordentlichen Verfahren.
    const bgg = berechneBggVwvgFrist({ regime: 'bgg', ereignis: '2026-12-15', einheit: 'tage', laenge: 10, kanton: 'ZH' });
    const zpo = berechneFrist({ ereignis: '2026-12-15', einheit: 'tage', laenge: 10, verfahren: 'ordentlich', kanton: 'ZH', fristnatur: 'gesetzlich' });
    expect(bgg.diesAdQuemISO).toBe(zpo.diesAdQuemISO);
  });

  it('Monats-/Jahresfristen stehen NICHT still (nur nach Tagen bestimmt)', () => {
    const monat = berechneBggVwvgFrist({ regime: 'vwvg', ereignis: '2026-07-10', einheit: 'monate', laenge: 1, kanton: 'ZH' });
    expect(monat.stillstandAktiv).toBe(false);
    // 10.7. + 1 Monat = 10.8.; KEIN Aufschub durch die Sommerperiode.
    expect(monat.diesAdQuemISO.startsWith('2026-08-1')).toBe(true);
    expect(monat.warnungen.join(' ')).toContain('nur für nach Tagen bestimmte Fristen');

    const jahr = berechneBggVwvgFrist({ regime: 'bgg', ereignis: '2026-07-20', einheit: 'jahre', laenge: 1, kanton: 'GE' });
    expect(jahr.stillstandAktiv).toBe(false);
  });

  it('Abs.-2-Ausnahmenkataloge sind je Regime verschieden (kein Kollaps)', () => {
    const vwvg = berechneBggVwvgFrist({ regime: 'vwvg', ereignis: '2026-03-02', einheit: 'tage', laenge: 10, kanton: 'BE' });
    const bgg = berechneBggVwvgFrist({ regime: 'bgg', ereignis: '2026-03-02', einheit: 'tage', laenge: 10, kanton: 'BE' });
    expect(vwvg.ausnahmen).toHaveLength(2);
    expect(bgg.ausnahmen).toHaveLength(5);
    expect(bgg.ausnahmen).toContain('die Wechselbetreibung');
    expect(vwvg.ausnahmen).not.toContain('die Wechselbetreibung');
    expect(bvAusnahmenSatz('vwvg')).toContain('Art. 22a Abs. 2 VwVG');
    expect(bvAusnahmenSatz('bgg')).toContain('Art. 46 Abs. 2 BGG');
  });

  it('verwirft ungültige Längen', () => {
    expect(() => berechneBggVwvgFrist({ regime: 'bgg', ereignis: '2026-03-02', einheit: 'tage', laenge: 0, kanton: 'ZH' })).toThrow();
  });
});
