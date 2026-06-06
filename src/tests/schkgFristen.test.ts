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

  // Regression (Sanity-Check): Hemmung über das rechnerische Fristende hinaus –
  // echtes Ruhen: das GANZE Fenster ab Hemmungsbeginn zählt, kein Clamp am naiven Ende.
  it('Hemmung über das naive Fristende hinaus wird voll angerechnet', () => {
    // 30 Tage ab 15.1. (dies a quo 16.1., naives Ende 14.2.); Hemmung 1.2.–30.4. (89 Tage)
    const r = berechneSchkgFrist(base({
      ereignis: '2025-01-15', laenge: 30, modus: 'kein', fristnatur: 'verwirkung',
      hemmungVon: '2025-02-01', hemmungBis: '2025-04-30',
    }));
    expect(r.diesAdQuem).toBe('14.05.2025'); // 14.2. + 89 Tage (Mittwoch, keine Verschiebung)
  });

  it('Hemmungsfenster, das erst NACH dem Fristende beginnt, wirkt nicht', () => {
    const r = berechneSchkgFrist(base({
      ereignis: '2025-01-15', laenge: 30, modus: 'kein', fristnatur: 'verwirkung',
      hemmungVon: '2025-06-01', hemmungBis: '2025-08-01',
    }));
    expect(r.diesAdQuem).toBe('14.02.2025');
  });

  // Regression (Sanity-Check): Überlappen Rechtsstillstand und Betreibungsferien,
  // ankert Art. 63 am Ende der GESAMTEN geschlossenen Zeit (Verbund-Hülle).
  it('Rechtsstillstand über die Betreibungsferien hinaus verschiebt den Art.-63-Anker', () => {
    // Ende rechnerisch 25.7. (in Sommer-BF 15.–31.7.); RS 20.7.–10.8. → 3. Werktag nach 10.8. (So) = 13.8.
    const r = berechneSchkgFrist(base({
      ereignis: '2025-07-15', laenge: 10,
      rechtsstillstandVon: '2025-07-20', rechtsstillstandBis: '2025-08-10',
    }));
    expect(r.diesAdQuem).toBe('13.08.2025');
  });

  it('Rechtsstillstand-Eingabe ausserhalb des Betreibungsferien-Regimes erzeugt eine Warnung', () => {
    const r = berechneSchkgFrist(base({
      modus: 'zpo_stillstand', rechtsstillstandVon: '2025-07-20', rechtsstillstandBis: '2025-08-10',
    }));
    expect(r.warnungen.some((w) => w.includes('unberücksichtigt'))).toBe(true);
  });
});

// ─── B2-Fix 6.6.2026 (deklarierte fachliche Änderung) ────────────────────────
// Art. 56 Ziff. 2 SchKG: «in der Wechselbetreibung gibt es keine Betreibungs-
// ferien» — die drei Wechsel-Presets liefen vorher fälschlich mit Ferien-Modus.
import { PRESETS_SCHKG } from '../lib/schkgPresets';

describe('Audit-Fix B2 – Wechselbetreibung ohne Betreibungsferien', () => {
  it('alle drei Wechsel-Presets stehen auf modus \'kein\'', () => {
    const wechsel = PRESETS_SCHKG.filter((p) => p.key.includes('wechsel'));
    expect(wechsel.map((p) => p.key).sort()).toEqual(
      ['beschwerde_wechsel', 'konkursbegehren_wechsel', 'rechtsvorschlag_wechsel'],
    );
    for (const p of wechsel) expect(p.modus, p.key).toBe('kein');
    for (const p of wechsel) expect(p.hinweis).toContain('Art. 56 Ziff. 2');
  });

  it('Repro des Audit-Befunds: 5 Tage ab 25.07.2025 enden am 30.07. (nicht 06.08.)', () => {
    // Mit Betreibungsferien-Modus verschob die Sommerferien-Logik (15.–31.7.)
    // das Ende via Art. 63 auf den 06.08.2025 — für die Wechselbetreibung falsch.
    const r = berechneSchkgFrist(base({ ereignis: '2025-07-25', laenge: 5, modus: 'kein' }));
    expect(r.diesAdQuem).toBe('30.07.2025');
    const falsch = berechneSchkgFrist(base({ ereignis: '2025-07-25', laenge: 5, modus: 'schkg_betreibungsferien' }));
    expect(falsch.diesAdQuem).not.toBe('30.07.2025'); // belegt die Differenz
  });
});
