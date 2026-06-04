import { describe, it, expect } from 'vitest';
import { berechneVerjaehrung } from '../lib/verjaehrung';
import type { VerjaehrungInput } from '../lib/verjaehrung';

const base = (over: Partial<VerjaehrungInput>): VerjaehrungInput => ({
  regime: 'ordentlich',
  beginnRelativ: '2020-01-15',
  stichtag: '2026-06-04',
  kanton: 'ZH',
  ...over,
});

describe('Verjährung – Grundregime (Art. 127/128/60/67 OR)', () => {
  it('ordentlich: 10 Jahre ab Fälligkeit, Ende am zahlengleichen Tag (Art. 132)', () => {
    const r = berechneVerjaehrung(base({}));
    expect(r.status).toBe('ok');
    expect(r.verjaehrungISO).toBe('2030-01-15'); // Di, kein Feiertag
    expect(r.verjaehrtAmStichtag).toBe(false);
  });

  it('ordentlich: verjährt, sobald der letzte Tag unbenützt verstrichen ist', () => {
    expect(berechneVerjaehrung(base({ stichtag: '2030-01-15' })).verjaehrtAmStichtag).toBe(false);
    expect(berechneVerjaehrung(base({ stichtag: '2030-01-16' })).verjaehrtAmStichtag).toBe(true);
  });

  it('kurz (Art. 128): 5 Jahre', () => {
    const r = berechneVerjaehrung(base({ regime: 'kurz', beginnRelativ: '2022-03-10' }));
    expect(r.verjaehrungISO).toBe('2027-03-10'); // Mi
  });

  it('Schaltjahr: 29.02. + 10 Jahre → 28.02. (letzter Tag des Monats)', () => {
    const r = berechneVerjaehrung(base({ beginnRelativ: '2020-02-29' }));
    expect(r.verjaehrungISO).toBe('2030-02-28'); // Do
  });

  it('Delikt: massgeblich ist das frühere Ende (absolute vor relativer Frist)', () => {
    const r = berechneVerjaehrung(base({
      regime: 'delikt', beginnRelativ: '2024-03-01', beginnAbsolut: '2016-05-10',
    }));
    expect(r.relativEndeISO).toBe('2027-03-01');  // Mo
    expect(r.absolutEndeISO).toBe('2026-05-11');  // 10.05.2026 = So → Mo (Art. 78)
    expect(r.verjaehrungISO).toBe('2026-05-11');
  });

  it('Delikt Personenschaden: absolute Frist 20 Jahre (Art. 60 Abs. 1bis)', () => {
    const r = berechneVerjaehrung(base({
      regime: 'delikt_person', beginnRelativ: '2029-01-10', beginnAbsolut: '2010-06-15',
    }));
    expect(r.absolutEndeISO).toBe('2030-06-17'); // 15.06.2030 = Sa → Mo
    expect(r.verjaehrungISO).toBe('2030-06-17');
  });

  it('Delikt ohne Datum des schädigenden Verhaltens → unzulässig', () => {
    const r = berechneVerjaehrung(base({ regime: 'delikt', beginnAbsolut: undefined }));
    expect(r.status).toBe('unzulaessig');
  });

  it('Bereicherung: 3 / 10 Jahre, Kenntnis-Annahme offengelegt', () => {
    const r = berechneVerjaehrung(base({
      regime: 'bereicherung', beginnRelativ: '2024-04-08', beginnAbsolut: '2023-02-01',
    }));
    expect(r.relativEndeISO).toBe('2027-04-08'); // Do
    expect(r.annahmen.some((a) => a.includes('Kenntniszeitpunkt'))).toBe(true);
  });
});

describe('Verjährung – Modifikatoren (Art. 134/135/137/138/141 OR)', () => {
  it('Stillstand (Art. 134): 30 gehemmte Tage werden angehängt', () => {
    const r = berechneVerjaehrung(base({
      stillstaende: [{ von: '2025-01-01', bis: '2025-01-30' }],
    }));
    expect(r.gehemmtTage).toBe(30);
    expect(r.verjaehrungISO).toBe('2030-02-14'); // 15.01. + 30 Tage, Do
  });

  it('Stillstand ausserhalb der Frist zählt nicht', () => {
    const r = berechneVerjaehrung(base({
      stillstaende: [{ von: '2031-01-01', bis: '2031-03-01' }],
    }));
    expect(r.gehemmtTage).toBeUndefined();
    expect(r.verjaehrungISO).toBe('2030-01-15');
  });

  it('Anerkennung (Art. 135 Ziff. 1): neue Frist mit Ursprungsdauer', () => {
    const r = berechneVerjaehrung(base({
      regime: 'kurz', beginnRelativ: '2022-03-10',
      unterbrechungen: [{ typ: 'anerkennung', datum: '2024-06-05' }],
    }));
    expect(r.verjaehrungISO).toBe('2029-06-05'); // 5 Jahre ab Anerkennung, Di
  });

  it('Urkunde/Urteil (Art. 137 Abs. 2): neue Frist stets 10 Jahre', () => {
    const r = berechneVerjaehrung(base({
      regime: 'kurz', beginnRelativ: '2022-03-10',
      unterbrechungen: [{ typ: 'urkunde_urteil', datum: '2024-06-05' }],
    }));
    expect(r.verjaehrungISO).toBe('2034-06-05'); // 10 statt 5 Jahre, Mo
  });

  it('Unterbrechung nach Verjährungseintritt bleibt wirkungslos (Warnung)', () => {
    const r = berechneVerjaehrung(base({
      unterbrechungen: [{ typ: 'anerkennung', datum: '2031-05-01' }],
    }));
    expect(r.verjaehrungISO).toBe('2030-01-15');
    expect(r.warnungen.some((w) => w.includes('wirkungslos'))).toBe(true);
  });

  it('Klage (Art. 138 Abs. 1): Hemmung bis Abschluss, danach 10 Jahre bei Urteil', () => {
    const r = berechneVerjaehrung(base({
      unterbrechungen: [{ typ: 'klage_schlichtung', datum: '2024-02-01', prozessEnde: '2025-09-01', mitUrteil: true }],
    }));
    expect(r.verjaehrungISO).toBe('2035-09-03'); // 01.09.2035 = Sa → Mo 03.09.2035
  });

  it('Klage ohne Abschluss: Verjährung steht still, kein Fristende der relativen Frist', () => {
    const r = berechneVerjaehrung(base({
      unterbrechungen: [{ typ: 'klage_schlichtung', datum: '2024-02-01' }],
    }));
    expect(r.relativEndeISO).toBeUndefined();
    expect(r.verjaehrtAmStichtag).toBe(false);
    expect(r.ergebnis).toContain('still');
  });

  it('Verzicht (Art. 141): wirkt max. 10 Jahre ab Verjährungseintritt', () => {
    const r = berechneVerjaehrung(base({
      verzicht: { datum: '2029-12-01', jahre: 12 },
    }));
    expect(r.verzichtBisISO).toBe('2040-01-15');
    expect(r.warnungen.some((w) => w.includes('gekürzt'))).toBe(true);
  });

  it('Vorausverzicht vor Verjährungsbeginn ist unzulässig (Warnung, unberücksichtigt)', () => {
    const r = berechneVerjaehrung(base({
      verzicht: { datum: '2019-06-01' },
    }));
    expect(r.verzichtBisISO).toBeUndefined();
    expect(r.warnungen.some((w) => w.includes('Vorausverzicht'))).toBe(true);
  });
});

describe('Verjährung – Hinweise und Grenzen', () => {
  it('strafbare Handlung (Art. 60 Abs. 2): externe StGB-Frist als Warnung', () => {
    const r = berechneVerjaehrung(base({
      regime: 'delikt', beginnRelativ: '2024-03-01', beginnAbsolut: '2020-05-10', strafbareHandlung: true,
    }));
    expect(r.warnungen.some((w) => w.includes('Verfolgungsverjährung'))).toBe(true);
  });

  it('Altfall vor 1.1.2020: Übergangsrechts-Warnung (Art. 49 SchlT ZGB)', () => {
    const r = berechneVerjaehrung(base({ beginnRelativ: '2019-06-01' }));
    expect(r.warnungen.some((w) => w.includes('SchlT'))).toBe(true);
  });
});
