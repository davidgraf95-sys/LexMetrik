import { describe, it, expect } from 'vitest';
import { parseISO, format } from 'date-fns';
import { berechneDienstjahr, sperrfristEnde, letzterTagLohnfortzahlung } from '../lib/datumsUtils';

const ds = (d: Date) => format(d, 'yyyy-MM-dd');

describe('Querschnitt – Dienstjahr & Zählkonventionen (§4)', () => {
  // §7.21 – Schaltjahr-Stichtag 29.02.
  it('§7.21: Schaltjahr-Stichtag 29.02. → Dienstjahr korrekt', () => {
    const vb = parseISO('2020-02-29');
    expect(berechneDienstjahr(vb, parseISO('2024-02-29'))).toBe(5); // 4 vollendete Jahre + 1
    expect(berechneDienstjahr(vb, parseISO('2021-02-28'))).toBe(1); // Jahr noch nicht vollendet
  });

  // §7.22 – Unterschiedliche Zählkonventionen A (Art. 324a) vs. C (Art. 336c / Art. 77) bleiben getrennt
  it('§7.22: Sperrfrist (Art. 77) und Lohnfortzahlung zählen Anfangstag unterschiedlich', () => {
    const start = parseISO('2025-01-01');
    // Sperrfrist: Anfangstag zählt NICHT → 01.01. + 30 = 31.01.
    expect(ds(sperrfristEnde(start, 30))).toBe('2025-01-31');
    // Lohnfortzahlung: Anfangstag zählt MIT → 01.01. + 30 Tage − 1 = 30.01.
    expect(ds(letzterTagLohnfortzahlung(start, { typ: 'tage', anzahl: 30 }))).toBe('2025-01-30');
  });
});
