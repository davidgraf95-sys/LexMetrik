import { describe, it, expect } from 'vitest';
import { berechneSchkgFrist } from '../lib/schkgFristen';
import { berechneFrist } from '../lib/zpoFristen';
import type { SchkgInput } from '../types/schkg';
import type { ZpoInput } from '../types/zpo';

const base = (over: Partial<SchkgInput>): SchkgInput => ({
  ereignis: '2025-03-10',
  einheit: 'tage',
  laenge: 10,
  modus: 'schkg_betreibungsferien',
  fristnatur: 'frist',
  kanton: 'ZH',
  ...over,
});

describe('SchKG-Fristenrechner', () => {
  // Betreibungsferien-Verlängerung (Art. 63): Rechtsvorschlag 10 Tage, Ende in Sommerferien.
  it('Rechtsvorschlag 10 Tage, Ende in Betreibungsferien → 3. Werktag nach 31.7.', () => {
    const r = berechneSchkgFrist(base({ ereignis: '2025-07-10', laenge: 10 }));
    expect(r.diesAQuo).toBe('11.07.2025');
    expect(r.diesAdQuem).toBe('06.08.2025');
    expect(r.modusAktiv).toBe('schkg_betreibungsferien');
  });

  // Ohne geschlossene Zeit: 10 Tage ab 10.3. → 20.3. (Do), keine Verschiebung.
  it('Rechtsvorschlag 10 Tage ausserhalb der Ferien → 20.3.2025', () => {
    expect(berechneSchkgFrist(base({ ereignis: '2025-03-10', laenge: 10 })).diesAdQuem).toBe('20.03.2025');
  });

  // Gerichtliche Klage: ZPO-Stillstand muss dieselbe Arithmetik wie der ZPO-Rechner liefern.
  it('Aberkennungsklage (zpo_stillstand) == ZPO-Tagesfrist (Ruhen-Äquivalenz)', () => {
    const ereignis = '2025-07-10';
    const schkg = berechneSchkgFrist(base({ ereignis, laenge: 20, modus: 'zpo_stillstand', fristnatur: 'verwirkung' }));
    const zpo = berechneFrist({
      ereignis, einheit: 'tage', laenge: 20, verfahren: 'ordentlich', kanton: 'ZH', fristnatur: 'gesetzlich',
    } as ZpoInput);
    expect(schkg.diesAdQuemISO).toBe(zpo.diesAdQuemISO);
    expect(schkg.ruhenAnzeige).toBe(true);
  });

  // Hemmung der Verwirkungsfrist (Art. 166 Abs. 2): Fenster verlängert das Ende.
  it('Konkursbegehren 15 Monate mit Hemmung läuft später ab als ohne', () => {
    const ohne = berechneSchkgFrist(base({ ereignis: '2025-01-15', einheit: 'monate', laenge: 15, fristnatur: 'verwirkung' }));
    const mit = berechneSchkgFrist(base({
      ereignis: '2025-01-15', einheit: 'monate', laenge: 15, fristnatur: 'verwirkung',
      hemmungVon: '2025-03-01', hemmungBis: '2025-03-31',
    }));
    expect(mit.diesAdQuemISO > ohne.diesAdQuemISO).toBe(true);
    expect(mit.rechenweg.some((s) => /Hemmung|Stillstand der Verwirkungsfrist/.test(s.beschreibung))).toBe(true);
  });

  // Wartefrist: Ergebnistext nennt das früheste zulässige Datum.
  it('Wartefrist nennt das früheste zulässige Datum', () => {
    const r = berechneSchkgFrist(base({ ereignis: '2025-03-10', laenge: 20, fristnatur: 'wartefrist' }));
    expect(r.ergebnis).toMatch(/[Ff]rühestes zulässiges Datum/);
    expect(r.warnungen.some((w) => /Wartefrist/.test(w))).toBe(true);
  });

  // Override für umstrittene Summarsachen (Art. 251 ZPO).
  it('modusOverride überschreibt das Default-Regime', () => {
    const r = berechneSchkgFrist(base({ modus: 'schkg_betreibungsferien', modusOverride: 'zpo_stillstand' }));
    expect(r.modusAktiv).toBe('zpo_stillstand');
  });

  // Verwirkungsfrist trägt den Erstreckbarkeits-Warnhinweis.
  it('Verwirkungsfrist warnt vor Nicht-Erstreckbarkeit (Art. 33 Abs. 4)', () => {
    const r = berechneSchkgFrist(base({ fristnatur: 'verwirkung' }));
    expect(r.warnungen.some((w) => /Verwirkungsfrist/.test(w))).toBe(true);
    expect(r.normverweise.some((n) => n.artikel.includes('33 Abs. 4'))).toBe(true);
  });
});
