import { describe, it, expect } from 'vitest';
import { FEDLEX, fedlexUrl, fedlexLinkFuerArtikel, erkenneFedlexGesetz } from '../lib/fedlex';

describe('fedlexUrl', () => {
  it('Zahl-Artikel', () => {
    expect(fedlexUrl('OR', '104')).toBe(`${FEDLEX.OR}#art_104`);
    expect(fedlexUrl('ZPO', 142)).toBe(`${FEDLEX.ZPO}#art_142`);
  });

  it('Buchstaben-Artikel im Fedlex-Unterstrich-Format', () => {
    expect(fedlexUrl('OR', '335c')).toBe(`${FEDLEX.OR}#art_335_c`);
    expect(fedlexUrl('OR', '266a')).toBe(`${FEDLEX.OR}#art_266_a`);
  });

  it('bis/ter-Suffixe im Fedlex-Unterstrich-Format (z. B. Art. 334bis ZGB)', () => {
    expect(fedlexUrl('ZGB', '334bis')).toBe(`${FEDLEX.ZGB}#art_334_bis`);
    expect(fedlexUrl('OR', '4ter')).toBe(`${FEDLEX.OR}#art_4_ter`);
  });
});

describe('fedlexLinkFuerArtikel', () => {
  it('einfacher Verweis', () => {
    expect(fedlexLinkFuerArtikel('Art. 104 OR')).toBe(`${FEDLEX.OR}#art_104`);
    expect(fedlexLinkFuerArtikel('Art. 63 SchKG')).toBe(`${FEDLEX.SchKG}#art_63`);
  });

  it('Absatz/Ziffer ändern den Anker nicht', () => {
    expect(fedlexLinkFuerArtikel('Art. 335c Abs. 1 OR')).toBe(`${FEDLEX.OR}#art_335_c`);
    expect(fedlexLinkFuerArtikel('Art. 108 Ziff. 1 OR')).toBe(`${FEDLEX.OR}#art_108`);
    expect(fedlexLinkFuerArtikel('Art. 142 Abs. 1bis ZPO')).toBe(`${FEDLEX.ZPO}#art_142`);
  });

  it('Artikel mit bis/ter-Suffix → korrekter Anker', () => {
    expect(fedlexLinkFuerArtikel('Art. 334bis ZGB')).toBe(`${FEDLEX.ZGB}#art_334_bis`);
  });

  it('Spannen und Folgeverweise → führender Artikel', () => {
    expect(fedlexLinkFuerArtikel('Art. 142–147 ZPO')).toBe(`${FEDLEX.ZPO}#art_142`);
    expect(fedlexLinkFuerArtikel('Art. 457 ff. ZGB')).toBe(`${FEDLEX.ZGB}#art_457`);
    expect(fedlexLinkFuerArtikel('Art. 266a–o OR')).toBe(`${FEDLEX.OR}#art_266_a`);
  });

  it('Schlusstitel: Gesetzes-Seite ohne Anker (nie geratene Anker)', () => {
    expect(fedlexLinkFuerArtikel('Art. 15 SchlT ZGB')).toBe(FEDLEX.ZGB);
  });

  it('unbekanntes Gesetz → kein Link', () => {
    expect(fedlexLinkFuerArtikel('Art. 8 ATSG')).toBeNull();
    expect(fedlexLinkFuerArtikel('§ 12 GebV')).toBeNull();
  });

  // Code-Review-Befund #1 (7.6.2026): Mehrwort-Name «GebV SchKG» endete auf
  // das Token «SchKG» und verlinkte Art. 16 der HAUPT-SchKG (SR 281.1) statt
  // der Gebührenverordnung (SR 281.35) — Alias-Tabelle greift jetzt VOR dem
  // generischen Token-Match.
  it('Mehrwort-Gesetz «GebV SchKG» → Gebührenverordnung, nicht Haupt-SchKG', () => {
    expect(fedlexLinkFuerArtikel('Art. 16 Abs. 1 GebV SchKG')).toBe(`${FEDLEX.GebVSchKG}#art_16`);
    expect(fedlexLinkFuerArtikel('Art. 48 GebV SchKG')).toBe(`${FEDLEX.GebVSchKG}#art_48`);
    // Haupt-SchKG bleibt unberührt
    expect(fedlexLinkFuerArtikel('Art. 16 SchKG')).toBe(`${FEDLEX.SchKG}#art_16`);
  });
});

describe('erkenneFedlexGesetz (wiederverwendbarer Helfer)', () => {
  it('erkennt das Gesetz am letzten Token', () => {
    expect(erkenneFedlexGesetz('Art. 335c Abs. 1 OR')).toBe('OR');
    expect(erkenneFedlexGesetz('Art. 96 ZPO')).toBe('ZPO');
  });
  it('Mehrwort-Alias hat Vorrang vor dem Token-Match', () => {
    expect(erkenneFedlexGesetz('Art. 16 GebV SchKG')).toBe('GebVSchKG');
    expect(erkenneFedlexGesetz('Art. 16 SchKG')).toBe('SchKG');
  });
  it('unbekanntes Gesetz → null', () => {
    expect(erkenneFedlexGesetz('Art. 8 ATSG')).toBeNull();
    expect(erkenneFedlexGesetz('siehe oben')).toBeNull();
  });
  // StGB/StG erschlossen (16.6.2026): die Snapshots STGB.json/STG.json waren
  // vorhanden, aber unerreichbar, weil die Gesetze nicht in FEDLEX standen.
  // Kollisionscheck: «StGB» endet nicht auf « StG» (Regex `(^|\s)KEY$`), darum
  // löst «Art. 97 StGB» auf 'StGB' und «Art. 8 StG» auf 'StG' auf.
  it('StGB/StG kollisionsfrei (StGB ≠ StG trotz gemeinsamem Präfix)', () => {
    expect(erkenneFedlexGesetz('Art. 97 StGB')).toBe('StGB');
    expect(erkenneFedlexGesetz('Art. 30 StGB')).toBe('StGB');
    expect(erkenneFedlexGesetz('Art. 8 StG')).toBe('StG');
    expect(erkenneFedlexGesetz('Art. 8 GebVHReg')).toBe('GebVHReg');
  });
});

describe('StGB/StG-Links (Screen-Pfad; PDF unberührt, eigene ERLASSE-Liste)', () => {
  it('Art. 97 StGB → StGB-Basis + #art_97 (nicht StG)', () => {
    expect(fedlexLinkFuerArtikel('Art. 97 StGB')).toBe(`${FEDLEX.StGB}#art_97`);
    expect(fedlexLinkFuerArtikel('Art. 30 Abs. 1 StGB')).toBe(`${FEDLEX.StGB}#art_30`);
  });
  it('Art. 8 StG → StG-Basis (Stempelabgaben, nicht StGB)', () => {
    expect(fedlexLinkFuerArtikel('Art. 8 StG')).toBe(`${FEDLEX.StG}#art_8`);
  });
});

describe('Audit 5.6.2026 – Kombi-Anker Buchstabe+Suffix', () => {
  it('329gbis → art_329_g_bis (Form n_b_suffix, empirisch am OR-HTML verifiziert)', () => {
    expect(fedlexUrl('OR', '329gbis')).toContain('#art_329_g_bis');
    expect(fedlexUrl('OR', '663bbis')).toContain('#art_663_b_bis');
    // Bestand bleibt unverändert
    expect(fedlexUrl('OR', '335c')).toContain('#art_335_c');
    expect(fedlexUrl('ZGB', '334bis')).toContain('#art_334_bis');
    expect(fedlexUrl('OR', '77')).toContain('#art_77');
  });
});
