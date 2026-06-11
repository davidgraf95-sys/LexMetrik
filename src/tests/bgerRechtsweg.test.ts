import { describe, it, expect } from 'vitest';
import {
  berechneBgerRechtsweg, bgerAbteilungZivil, bgerKapitalwert20x, BGER_SCHWELLEN,
  type BgerInput, type BgerZivilgebiet,
} from '../lib/bgerRechtsweg';

// Akzeptanztests BGer-Rechtsweg (FAHRPLAN-BGER-RECHTSWEG.md R-1).
// Normgrundlage: bibliothek/recherche/bgg-beschwerde-engine.md (BGG-Wortlaute
// am Cache 20260401 nachverifiziert 11.6.2026) + rechtsmittel-spruchkoerper-
// kantone.md §3 (BGerR 20260201, Art. 33/34/35/35a/36 zeichengenau).

const zivil = (over: Partial<BgerInput> = {}): BgerInput => ({
  weg: 'zivil', zivilGebiet: 'schuldrecht', vermoegensrechtlich: true, streitwertCHF: 50_000, ...over,
});

describe('BGer-Rechtsweg (BGG) — Zulässigkeit', () => {
  it('Schwellen Art. 74 Abs. 1: 15 000 (arbeit/miete) · 30 000 (übrige) — Grenzwerte exakt', () => {
    expect(BGER_SCHWELLEN.MIETE_ARBEIT).toBe(15_000);
    expect(BGER_SCHWELLEN.UEBRIGE).toBe(30_000);
    expect(berechneBgerRechtsweg(zivil({ zivilGebiet: 'arbeit', streitwertCHF: 15_000 })).zulaessigkeit).toBe('zulaessig');
    expect(berechneBgerRechtsweg(zivil({ zivilGebiet: 'arbeit', streitwertCHF: 14_999 })).zulaessigkeit).toBe('schwelle_verfehlt');
    expect(berechneBgerRechtsweg(zivil({ streitwertCHF: 30_000 })).zulaessigkeit).toBe('zulaessig');
    expect(berechneBgerRechtsweg(zivil({ streitwertCHF: 29_999 })).zulaessigkeit).toBe('schwelle_verfehlt');
  });

  it('nicht vermögensrechtlich / einzige kantonale Instanz / Konkursrichter: streitwertunabhängig', () => {
    expect(berechneBgerRechtsweg(zivil({ vermoegensrechtlich: false, streitwertCHF: null })).zulaessigkeit).toBe('zulaessig');
    expect(berechneBgerRechtsweg(zivil({ streitwertCHF: 5_000, einzigeKantonaleInstanz: true })).zulaessigkeit).toBe('zulaessig_ausnahme');
    expect(berechneBgerRechtsweg(zivil({ streitwertCHF: 1_000, konkursNachlassrichter: true })).zulaessigkeit).toBe('zulaessig_ausnahme');
  });

  it('schwelle_verfehlt: subsidiäre Verfassungsbeschwerde inkl. gleiche-Rechtsschrift-Pflicht (Art. 119)', () => {
    const r = berechneBgerRechtsweg(zivil({ streitwertCHF: 10_000 }));
    const sub = r.rechenweg.find((s) => s.beschreibung.includes('Verfassungsbeschwerde'));
    expect(sub?.zwischenergebnis).toContain('Art. 116');
    expect(sub?.zwischenergebnis).toContain('GLEICHEN Rechtsschrift einreichen (Art. 119 Abs. 1)');
    expect(sub?.zwischenergebnis).toContain('Art. 103 Abs. 1 und 3');
  });

  it('Markenwiderspruch = Hard-Stop (Art. 73 BGG)', () => {
    const r = berechneBgerRechtsweg(zivil({ markenwiderspruch: true }));
    expect(r.zulaessigkeit).toBe('unzulaessig');
    expect(r.status).toBe('unzulaessig');
    expect(r.ergebnis).toContain('Art. 73 BGG');
  });

  it('Schiedsgericht (Art. 77): streitwertunabhängig, Sonderregime-Hinweis (Art. 90–98 nicht anwendbar)', () => {
    const r = berechneBgerRechtsweg(zivil({ schiedsgericht: true, streitwertCHF: 1_000 }));
    expect(r.zulaessigkeit).toBe('zulaessig_ausnahme');
    const schritt = r.rechenweg.find((s) => s.beschreibung.includes('Schieds'));
    expect(schritt?.zwischenergebnis).toContain('UNGEACHTET DES STREITWERTS');
    expect(schritt?.zwischenergebnis).toContain('Art. 90–98 BGG sind NICHT anwendbar');
  });

  it('SchKG-Aufsicht: streitwertunabhängig (Art. 74 Abs. 2 lit. c) + II. zivilrechtliche Abteilung', () => {
    const r = berechneBgerRechtsweg({ weg: 'schkg_aufsicht' });
    expect(r.zulaessigkeit).toBe('zulaessig_ausnahme');
    expect(r.abteilung).toContain('II. zivilrechtliche');
    expect(r.fristTage).toBe(10);
    expect(r.fristNorm).toBe('Art. 100 Abs. 2 lit. a BGG');
    expect(r.stillstand).toBe(true); // Aufsicht ist NICHT in Art. 46 Abs. 2
  });
});

describe('BGer-Rechtsweg — Abteilungen (Art. 33/34 BGerR)', () => {
  it('Rechtsöffnungs-Falle: Rechtsöffnung → I. Abteilung (Art. 33 lit. i), übriges SchKG → II.', () => {
    expect(bgerAbteilungZivil('rechtsoeffnung').name).toBe('I. zivilrechtliche Abteilung');
    expect(bgerAbteilungZivil('schkg_uebrig').name).toBe('II. zivilrechtliche Abteilung');
    const r = berechneBgerRechtsweg(zivil({ zivilGebiet: 'rechtsoeffnung', streitwertCHF: 50_000 }));
    expect(r.abteilung).toContain('I. zivilrechtliche');
    expect(r.rechenweg.some((s) => s.zwischenergebnis.includes('einzige Ausnahme'))).toBe(true);
  });

  it('Miete/Arbeit laufen als Schuldrecht zur I. Abteilung; ZGB-Materien zur II.', () => {
    const erste: BgerZivilgebiet[] = ['schuldrecht', 'arbeit', 'miete', 'versicherungsvertrag', 'haftpflicht', 'uwg', 'immaterialgueter'];
    const zweite: BgerZivilgebiet[] = ['personenrecht', 'familienrecht', 'erbrecht', 'sachenrecht', 'baeuerliches_bodenrecht'];
    for (const g of erste) expect(bgerAbteilungZivil(g).name, g).toBe('I. zivilrechtliche Abteilung');
    for (const g of zweite) expect(bgerAbteilungZivil(g).name, g).toBe('II. zivilrechtliche Abteilung');
  });

  it('Straf: beide Abteilungen informativ (Art. 35/35a, Schwergewicht Art. 36) — keine falsche Bestimmtheit', () => {
    const r = berechneBgerRechtsweg({ weg: 'straf' });
    expect(r.abteilung).toContain('Art. 35/35a BGerR');
    expect(r.abteilung).toContain('Art. 36');
  });
});

describe('BGer-Rechtsweg — Fristen (Art. 100) und Stillstand (Art. 46)', () => {
  it('Grundsatz 30 Tage mit Stillstand; Sonderfristen 10/5/3 Tage je Materie', () => {
    expect(berechneBgerRechtsweg(zivil()).fristTage).toBe(30);
    expect(berechneBgerRechtsweg(zivil()).stillstand).toBe(true);
    expect(berechneBgerRechtsweg({ weg: 'schkg_aufsicht', wechselbetreibung: true }).fristTage).toBe(5);
    expect(berechneBgerRechtsweg(zivil({ zivilGebiet: 'familienrecht', hkueKindesrueckgabe: true, vermoegensrechtlich: false, streitwertCHF: null })).fristTage).toBe(10);
    expect(berechneBgerRechtsweg({ weg: 'verwaltung', verwaltungSonderfall: 'rechtshilfe_amtshilfe' }).fristTage).toBe(10);
    expect(berechneBgerRechtsweg({ weg: 'verwaltung', verwaltungSonderfall: 'abstimmung' }).fristTage).toBe(5);
    expect(berechneBgerRechtsweg({ weg: 'verwaltung', verwaltungSonderfall: 'nationalratswahl' }).fristTage).toBe(3);
  });

  it('Stillstands-Ausnahmen Art. 46 Abs. 2: vorsorglich · Wechselbetreibung · Stimmrecht · Rechtshilfe · Beschaffung', () => {
    expect(berechneBgerRechtsweg(zivil({ vorsorglicheMassnahme: true })).stillstand).toBe(false);
    expect(berechneBgerRechtsweg({ weg: 'schkg_aufsicht', wechselbetreibung: true }).stillstand).toBe(false);
    expect(berechneBgerRechtsweg({ weg: 'verwaltung', verwaltungSonderfall: 'abstimmung' }).stillstand).toBe(false);
    expect(berechneBgerRechtsweg({ weg: 'verwaltung', verwaltungSonderfall: 'rechtshilfe_amtshilfe' }).stillstand).toBe(false);
    expect(berechneBgerRechtsweg({ weg: 'verwaltung', verwaltungSonderfall: 'beschaffung' }).stillstand).toBe(false);
    expect(berechneBgerRechtsweg({ weg: 'verwaltung' }).stillstand).toBe(true);
  });

  it('Rechtsverweigerung: jederzeit (Art. 100 Abs. 7)', () => {
    const r = berechneBgerRechtsweg(zivil({ rechtsverweigerung: true }));
    expect(r.fristTage).toBeNull();
    expect(r.fristNorm).toBe('Art. 100 Abs. 7 BGG');
    expect(r.ergebnis).toContain('jederzeit');
  });

  it('Fristende konkret: 30 Tage ab Eröffnung 1.7.2026 ruhen über den Sommerstillstand (15.7.–15.8.)', () => {
    // Handrechnung: Beginn 2.7.; bis 14.7. laufen 13 Tage; 15.7.–15.8. ruht;
    // ab 16.8. weitere 17 Tage → 1.9.2026 (Dienstag, kein Feiertag).
    const r = berechneBgerRechtsweg(zivil({ eroeffnung: '2026-07-01', kanton: 'ZH' }));
    expect(r.fristende?.endeISO).toBe('2026-09-01');
    // OHNE Stillstand (vorsorgliche Massnahme): 31.7.2026 (Freitag).
    const v = berechneBgerRechtsweg(zivil({ eroeffnung: '2026-07-01', kanton: 'ZH', vorsorglicheMassnahme: true }));
    expect(v.fristende?.endeISO).toBe('2026-07-31');
  });

  it('Fristende auf Sa/So → nächster Werktag (Art. 45 Abs. 1)', () => {
    // 10 Tage ab Eröffnung Mi 4.2.2026 (kein Stillstand im Februar): Ende Sa 14.2. → Mo 16.2.2026.
    const r = berechneBgerRechtsweg({ weg: 'schkg_aufsicht', eroeffnung: '2026-02-04', kanton: 'ZH' });
    expect(r.fristende?.endeISO).toBe('2026-02-16');
    expect(r.fristende?.verschoben).toBe(true);
  });
});

describe('BGer-Rechtsweg — Objekt, Kognition, Eheschutz', () => {
  it('Zwischenentscheid Zuständigkeit/Ausstand: Verwirkungs-Warnung (Art. 92 Abs. 2)', () => {
    const r = berechneBgerRechtsweg(zivil({ objekt: 'zwischen_zustaendigkeit_ausstand' }));
    expect(r.warnungen.some((w) => w.includes('SPÄTER NICHT MEHR'))).toBe(true);
  });

  it('anderer Zwischenentscheid: Art.-93-Weiche als offene Rechtsfrage', () => {
    const r = berechneBgerRechtsweg(zivil({ objekt: 'zwischen_anderer' }));
    expect(r.warnungen.some((w) => w.includes('Art. 93 Abs. 1'))).toBe(true);
  });

  it('vorsorgliche Massnahme: Art.-98-Kognitionswarnung; Eheschutz zusätzlich als Rechtsprechungs-Weiche (V-1)', () => {
    const vm = berechneBgerRechtsweg(zivil({ vorsorglicheMassnahme: true }));
    expect(vm.warnungen.some((w) => w.includes('Art. 98 BGG'))).toBe(true);
    const ehe = berechneBgerRechtsweg(zivil({ zivilGebiet: 'familienrecht', vermoegensrechtlich: false, streitwertCHF: null, eheschutz: true }));
    expect(ehe.stillstand).toBe(false);
    expect(ehe.warnungen.some((w) => w.includes('BGE 133 III 393') && w.includes('Rechtsprechung'))).toBe(true);
  });

  it('Straf: Art.-79- und Art.-81-Hinweise (Privatkläger Ziff. 5, StA-Haft Ziff. 3)', () => {
    const r = berechneBgerRechtsweg({ weg: 'straf' });
    expect(r.warnungen.some((w) => w.includes('Art. 79 BGG'))).toBe(true);
    expect(r.annahmen.some((a) => a.includes('ZIVILANSPRÜCHE') && a.includes('Ziff. 5'))).toBe(true);
  });

  it('Verwaltung: ehrlicher Art.-83-Vorbehalt', () => {
    const r = berechneBgerRechtsweg({ weg: 'verwaltung' });
    expect(r.warnungen.some((w) => w.includes('Art. 83 BGG') && w.includes('NICHT abgebildet'))).toBe(true);
  });

  it('Streitwert-Annahme nennt Art. 51–53 (Nebenrechte, 20×, Widerklage); Kapitalwert-Helfer rechnet 20×', () => {
    const r = berechneBgerRechtsweg(zivil());
    expect(r.annahmen.some((a) => a.includes('20-fachen') && a.includes('Art. 53 Abs. 1'))).toBe(true);
    expect(bgerKapitalwert20x(12_000)).toBe(240_000);
  });

  it('ungültiger Streitwert wirft (Symmetrie zu bestimmeRechtsmittel)', () => {
    expect(() => berechneBgerRechtsweg(zivil({ streitwertCHF: -1 }))).toThrow();
  });
});
