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

  // Deklarierte fachliche Änderung 6.6.2026 (Audit): Verfalltag-Verzug folgt aus
  // Art. 102 Abs. 2 OR; Art. 108 OR betrifft die Nachfrist beim Rücktritt und war
  // hier dogmatisch unzutreffend zitiert.
  it('Verfalltag-Hinweis nennt Art. 102 Abs. 2 OR (nicht mehr Art. 108)', () => {
    const r = berechneVerzugszins(base({ beginnTyp: 'verfalltag' }));
    const txt = r.rechenweg.flatMap((s) => s.normen.map((n) => n.artikel)).join(',');
    expect(txt).toContain('Art. 102 OR');
    expect(txt).not.toContain('Art. 108');
    const schritt = r.rechenweg.find((s) => s.beschreibung.includes('Beginn des Zinsenlaufs'));
    expect(schritt?.zwischenergebnis).toContain('Art. 102 Abs. 2 OR');
    expect(schritt?.zwischenergebnis).not.toContain('Art. 108');
  });

  // B8-Fix 6.6.2026: tageTotal = Summe der verzinsten Segment-Tage, nicht die
  // volle Spanne — bei vollständiger Tilgung mid-period endet die Zählung dort.
  it('tageTotal endet bei vollständiger Tilgung mid-period (B8)', () => {
    const r = berechneVerzugszins(base({
      methode: 'act365',
      ereignisse: [{ typ: 'teilzahlung', datum: '2023-07-01', betrag: 50_000 }],
    }));
    expect(r.status).toBe('ok');
    // 01.01.–01.07.2023 = 181 Tage verzinst; danach Kapital 0 → keine weiteren Zinstage.
    expect(r.tageTotal).toBe(181);
    expect(r.warnungen.some((w) => w.includes('übersteigt die Restschuld'))).toBe(true);
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

// ─── Akzeptanzkriterien «Zeitstrahl-Überarbeitung» ───────────────────────────
// Beide Balken rendern ausschliesslich aus r.segmente (Single Source of Truth);
// diese Tests sichern die Segment-Engine, aus der die Visualisierung ableitet.

describe('Verzugszins – Akzeptanzkriterien Zeitstrahl (Segment-Engine)', () => {
  const akzeptanz = (over: Partial<VerzugszinsInput>): VerzugszinsInput => ({
    kapital: 10000, verzugsbeginn: '2024-01-01', stichtag: '2025-01-01',
    zinssatzProzent: 5, methode: 'act365', ...over,
  });

  it('1 – ereignislos: ein 5%-Segment über 366 Tage; Zins 501.37, Total 10\'501.37', () => {
    const r = berechneVerzugszins(akzeptanz({}));
    expect(r.tageTotal).toBe(366);
    expect(r.segmente).toHaveLength(1);
    expect(r.segmente[0]).toMatchObject({ tage: 366, satz: 5, kapital: 10000 });
    expect(r.zinsTotal).toBe(501.37);
    expect(r.kapitalOffen).toBe(10000);
    expect(r.totalOffen).toBe(10501.37);
  });

  it('2 – Teilzahlung 4\'000 am 01.07.2024: Segmente 182/184 Tage, Anrechnung nach Art. 85 OR', () => {
    const r = berechneVerzugszins(akzeptanz({
      ereignisse: [{ typ: 'teilzahlung', datum: '2024-07-01', betrag: 4000 }],
    }));
    expect(r.segmente).toHaveLength(2);
    expect(r.segmente[0]).toMatchObject({ tage: 182, satz: 5, kapital: 10000, zins: 249.32 });
    expect(r.segmente[1]).toMatchObject({ tage: 184, satz: 5, kapital: 6249.32, zins: 157.52 });
    // Summe der Segmenttage = Gesamttage
    expect(r.segmente[0].tage + r.segmente[1].tage).toBe(r.tageTotal);
    expect(r.zinsTotal).toBe(406.84);   // Verzugszins (gesamt)
    expect(r.zinsGetilgt).toBe(249.32); // Bezahlter Zins
    expect(r.zinsOffen).toBe(157.52);   // Offener Verzugszins
    expect(r.kapitalOffen).toBe(6249.32);
    expect(r.totalOffen).toBe(6406.84);
  });

  it('3 – Satzwechsel 5% → 8% ab 01.07.2024: zwei Segmente mit segmentweise korrektem Zins', () => {
    const r = berechneVerzugszins(akzeptanz({
      ereignisse: [{ typ: 'satzaenderung', datum: '2024-07-01', satz: 8 }],
    }));
    expect(r.segmente).toHaveLength(2);
    expect(r.segmente[0]).toMatchObject({ tage: 182, satz: 5, zins: 249.32 });
    expect(r.segmente[1]).toMatchObject({ tage: 184, satz: 8, zins: 403.29 });
    expect(r.zinsTotal).toBe(652.61);
  });
});

// ─── Coverage-Audit 6.6.2026: Warnpfade Art. 104 Abs. 2/3 OR ─────────────────

describe('Coverage-Fix – Warnungen vertraglich/kaufmännisch', () => {
  it('satzGrund vertraglich → Beweislast-Warnung (Art. 104 Abs. 2 OR)', () => {
    const r = berechneVerzugszins(base({ satzGrund: 'vertraglich', zinssatzProzent: 8 }));
    expect(r.warnungen.some((w) => w.includes('Art. 104 Abs. 2') && w.includes('Beweislast'))).toBe(true);
  });
  it('satzGrund kaufmännisch → Privatdiskontsatz-Warnung (Art. 104 Abs. 3 OR)', () => {
    const r = berechneVerzugszins(base({ satzGrund: 'kaufmaennisch', zinssatzProzent: 6 }));
    expect(r.warnungen.some((w) => w.includes('Art. 104 Abs. 3') && w.includes('Privatdiskontsatz'))).toBe(true);
  });
});

// ─── Präjudizien-Abgleich-Fixes 10.6.2026 (normen/verzugszins-praejudizien-abgleich.md) ──

describe('Präjudizien-Abgleich-Fixes – Warnungen und Normklammern', () => {
  it('kaufmännisch ≤ 5 % → Warnung, dass das Abs.-1-Minimum unterschritten wird (MITTEL)', () => {
    const r = berechneVerzugszins(base({ satzGrund: 'kaufmaennisch', zinssatzProzent: 4 }));
    expect(r.warnungen.some((w) => w.includes('unterschreitet das gesetzliche Minimum'))).toBe(true);
  });
  it('kaufmännisch > 5 % → keine Minimum-Warnung', () => {
    const r = berechneVerzugszins(base({ satzGrund: 'kaufmaennisch', zinssatzProzent: 6 }));
    expect(r.warnungen.some((w) => w.includes('unterschreitet das gesetzliche Minimum'))).toBe(false);
  });
  it('vertraglich < 5 % → Normklammer Dispositivität Abs. 1, NICHT Abs. 2 (NIEDRIG)', () => {
    const r = berechneVerzugszins(base({ satzGrund: 'vertraglich', zinssatzProzent: 3 }));
    const satzSchritt = r.rechenweg.find((s) => s.beschreibung.includes('Massgebender Zinssatz'))!;
    expect(satzSchritt.zwischenergebnis).toContain('Dispositivität von Art. 104 Abs. 1');
    expect(satzSchritt.normen?.some((n) => n.artikel === 'Art. 104 Abs. 2 OR')).toBe(false);
    // Rechnung selbst unverändert: 3 % auf 10'000 für 365 Tage = 300
    expect(r.zinsTotal).toBe(300);
  });
  it('vertraglich 8 % → weiterhin Abs. 2 (unverändert)', () => {
    const r = berechneVerzugszins(base({ satzGrund: 'vertraglich', zinssatzProzent: 8 }));
    const satzSchritt = r.rechenweg.find((s) => s.beschreibung.includes('Massgebender Zinssatz'))!;
    expect(satzSchritt.normen?.some((n) => n.artikel === 'Art. 104 Abs. 2 OR')).toBe(true);
  });
  it('Standard-Warnungen: Kumulationsverbot Schadens-/Verzugszins + Geltungsbereich öffentliches Recht', () => {
    const r = berechneVerzugszins(base({}));
    expect(r.warnungen.some((w) => w.includes('nicht kumulierbar') && w.includes('Schadenszins'))).toBe(true);
    expect(r.warnungen.some((w) => w.includes('öffentlich-rechtliche'))).toBe(true);
  });
});
