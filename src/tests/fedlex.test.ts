import { describe, it, expect } from 'vitest';
import { FEDLEX, fedlexUrl, fedlexLinkFuerArtikel, erkenneFedlexGesetz, fremdgesetzNachArtikel, normVerweiseImText, artikelToken, fremdRoutingFormB, erkenneGenitivGesetz, artikelnPluralVerweise } from '../lib/fedlex';

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
    expect(fedlexLinkFuerArtikel('Art. 8 ZZG')).toBeNull();
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
    expect(erkenneFedlexGesetz('Art. 8 ZZG')).toBeNull();
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

// artikelToken (EINE Token-Ableitung, §5): Buchstabe+lat. Suffix ohne die bekannte
// \b-Backtracking-Falle («[a-z]? frisst das b von bis» → art_49_abis statt _a_bis).
describe('artikelToken — Nummer → Fedlex-Anker-Token', () => {
  it('Zahl / Buchstabe / lat. Suffix', () => {
    expect(artikelToken('104')).toBe('104');
    expect(artikelToken('335c')).toBe('335_c');
    expect(artikelToken('334bis')).toBe('334_bis');
    expect(artikelToken('4ter')).toBe('4_ter');
  });
  it('Buchstabe + lat. Suffix (49abis → 49_a_bis, NICHT 49_abis)', () => {
    expect(artikelToken('49abis')).toBe('49_a_bis');
    expect(artikelToken('66abis')).toBe('66_a_bis');
    expect(artikelToken('329gbis')).toBe('329_g_bis');
    expect(artikelToken('66a')).toBe('66_a');
    expect(artikelToken('49a')).toBe('49_a');
  });
});

// N2b (Bug David 4.7.2026, AIG Art. 5): ausgeschriebener Fremdgesetz-Name mit
// Klammer-Kürzel. Eingabe = Text NACH «Artikel N», plus die erste Nummer.
describe('fremdRoutingFormB — ausgeschriebener Name + Klammer-Kürzel', () => {
  it('AIG-Fall StGB: «Artikel 66a oder 66abis des Strafgesetzbuchs (StGB)»', () => {
    const r = fremdRoutingFormB(' oder 66abis des Strafgesetzbuchs (StGB) betroffen', '66a');
    expect(r).not.toBeNull();
    expect(r!.gesetz).toBe('StGB');
    // erstes Glied (66a) + Aufzählungs-Glied (66abis), beide auf StGB.
    expect(r!.glieder.map((g) => [g.erst, g.roh, g.artikel])).toEqual([
      [true, '66a', 'Art. 66a StGB'],
      [false, '66abis', 'Art. 66abis StGB'],
    ]);
    // Ziel-Anker: 66a → #art_66_a, 66abis → #art_66_a_bis (beide StGB).
    expect(fedlexLinkFuerArtikel(r!.glieder[0].artikel)).toBe(`${FEDLEX.StGB}#art_66_a`);
    expect(fedlexLinkFuerArtikel(r!.glieder[1].artikel)).toBe(`${FEDLEX.StGB}#art_66_a_bis`);
    // regionEnd zeigt hinter «(StGB)» (der Rest « betroffen» bleibt aussen vor).
    expect(' oder 66abis des Strafgesetzbuchs (StGB) betroffen'.slice(0, r!.regionEnd))
      .toBe(' oder 66abis des Strafgesetzbuchs (StGB)');
  });

  it('AIG-Fall MStG mit Datums-Einschub «vom 13. Juni 1927 (MStG)»', () => {
    const r = fremdRoutingFormB(' oder 49abis des Militärstrafgesetzes vom 13. Juni 1927 (MStG) betroffen sein.', '49a');
    expect(r!.gesetz).toBe('MStG');
    expect(fedlexLinkFuerArtikel(r!.glieder[0].artikel)).toBe(`${FEDLEX.MStG}#art_49_a`);
    expect(fedlexLinkFuerArtikel(r!.glieder[1].artikel)).toBe(`${FEDLEX.MStG}#art_49_a_bis`);
  });

  it('Einzel-Nummer unmittelbar vor «des …(OR)»: «Artikel 63 des Obligationenrechts (OR)»', () => {
    const r = fremdRoutingFormB(' des Obligationenrechts (OR)', '63');
    expect(r!.gesetz).toBe('OR');
    expect(r!.glieder).toHaveLength(1);
    expect(fedlexLinkFuerArtikel(r!.glieder[0].artikel)).toBe(`${FEDLEX.OR}#art_63`);
  });

  it('Passus-Kette vor dem Namen: «Artikel 323 Absatz 1 des Zivilgesetzbuches (ZGB)»', () => {
    const r = fremdRoutingFormB(' Absatz 1 des Zivilgesetzbuches (ZGB)', '323');
    expect(r!.gesetz).toBe('ZGB');
    expect(fedlexLinkFuerArtikel(r!.glieder[0].artikel)).toBe(`${FEDLEX.ZGB}#art_323`);
  });

  it('Negativ: unbekanntes Klammer-Kürzel «(Code civil)» / «(EU)» → kein Routing', () => {
    expect(fremdRoutingFormB(' und 15 des Zivilgesetzbuches (Code civil)', '14')).toBeNull();
    expect(fremdRoutingFormB(' der Verordnung (EU) 2016/679', '5')).toBeNull();
  });

  it('Negativ: ausgeschriebener Name OHNE Klammer-Kürzel → kein Routing (§1)', () => {
    expect(fremdRoutingFormB(' Absatz 2 und die Bestimmungen des OR', '6')).toBeNull();
    expect(fremdRoutingFormB(' Absatz 1 Buchstabe c AHVG', '1a')).toBeNull();
  });

  it('Ziel-Token-Prädikat: fehlt das Token im Fremd-Erlass → Glied nicht linkbar (§1, nie raten)', () => {
    // Prädikat verneint art_66_a_bis (existiert angeblich nicht) → nur 66a linkbar.
    const nurGrundform = (_g: unknown, token: string) => token === '66_a';
    const r = fremdRoutingFormB(' oder 66abis des Strafgesetzbuchs (StGB)', '66a', nurGrundform);
    expect(r!.glieder.map((g) => [g.roh, g.linkbar])).toEqual([
      ['66a', true],
      ['66abis', false],
    ]);
    // Verneint das Prädikat ALLES → kein Glied linkbar (reiner Text).
    const keins = fremdRoutingFormB(' des Strafgesetzbuchs (StGB)', '999', () => false);
    expect(keins!.glieder.every((g) => !g.linkbar)).toBe(true);
  });
});

// N2 (Bündel N): erkennt, ob nach einem bare «Artikel N» ein FREMDES Bundesgesetz
// genannt ist (aus- ODER abgeschrieben). Eingabe ist der Text NACH «Artikel N».
describe('fremdgesetzNachArtikel (N2 — Fremdgesetz-Verweis-Erkennung)', () => {
  it('erkennt die ausgeschriebene Passus-Form «Absatz X Buchstabe Y … GESETZ»', () => {
    expect(fremdgesetzNachArtikel(' Absatz 1 Buchstabe c Ziffer 2 AHVG')).toBe('AHVG');
    expect(fremdgesetzNachArtikel(' Absatz 2 ATSG')).toBe('ATSG');
  });
  it('erkennt die Präpositions-Form «Absatz X des IVG»', () => {
    expect(fremdgesetzNachArtikel(' Absatz 2 des IVG')).toBe('IVG');
    expect(fremdgesetzNachArtikel(' der ZPO')).toBe('ZPO');
  });
  it('erkennt Artikel-Listen «oder 2 AHVG» / «25–31 … GESETZ»', () => {
    expect(fremdgesetzNachArtikel(' oder 2 AHVG')).toBe('AHVG');
  });
  it('erkennt das unmittelbar folgende Kürzel', () => {
    expect(fremdgesetzNachArtikel(' OR')).toBe('OR');
    expect(fremdgesetzNachArtikel(' Abs. 1 SchKG')).toBe('SchKG');
  });
  it('§1-Präzision: KEIN Fremdgesetz bei Fliesstext oder entferntem Namen', () => {
    // «und die Bestimmungen des OR» ist ein SEPARATER Verweis, nicht Teil des
    // «Artikel N»-Zitats → kein Treffer (der Self-Link bleibt zulässig).
    expect(fremdgesetzNachArtikel(' Absatz 2 und die Bestimmungen des OR')).toBeNull();
    expect(fremdgesetzNachArtikel(' Absatz 2 hier')).toBeNull();
    expect(fremdgesetzNachArtikel(' gilt sinngemäss für die OR-Berechnung')).toBeNull();
  });
});

// ─── normVerweiseImText — i.V.m.-Ketten-Propagation (Referenz BGE 151 III 377) ──
//
// Kompakte Sicht auf die reine Span-Liste: `anzeige` = Quelltext (zeichenidentisch),
// `artikel` = Auflösungsziel (mit propagiertem Kürzel), `propagiert` = Ketten-Glied.
describe('normVerweiseImText — Ketten-Propagation', () => {
  // Handliche Projektion: «Anzeige → Auflösungsziel» je Span, in Textreihenfolge.
  const spanZiele = (t: string) =>
    normVerweiseImText(t).map((s) => ({ anzeige: s.anzeige, artikel: s.artikel, propagiert: s.propagiert }));
  // Nur die aufgelösten Ziel-URLs (Artikel-Anker) — für Gleichheits-Prüfungen.
  const zielUrls = (t: string) => normVerweiseImText(t).map((s) => fedlexLinkFuerArtikel(s.artikel));

  it('Referenzfall E. 2.3.1: «Art. 684 i.V.m. Art. 679 ZGB» — beide Glieder ZGB', () => {
    expect(spanZiele('klagen (Art. 684 i.V.m. Art. 679 ZGB; BGE 132 III 9 E. 3.6)')).toEqual([
      { anzeige: 'Art. 684', artikel: 'Art. 684 ZGB', propagiert: true },
      { anzeige: 'Art. 679 ZGB', artikel: 'Art. 679 ZGB', propagiert: false },
    ]);
    // Ziel-Anker: 684 → #art_684, 679 → #art_679 (beide ZGB).
    expect(zielUrls('Art. 684 i.V.m. Art. 679 ZGB')).toEqual([`${FEDLEX.ZGB}#art_684`, `${FEDLEX.ZGB}#art_679`]);
  });

  it('Referenzfall E. 2.4: «Art. 679 i.V.m. Art. 684 ZGB» (umgekehrte Richtung) — 679 wird verlinkt', () => {
    expect(spanZiele('nach Art. 679 i.V.m. Art. 684 ZGB vorzugehen')).toEqual([
      { anzeige: 'Art. 679', artikel: 'Art. 679 ZGB', propagiert: true },
      { anzeige: 'Art. 684 ZGB', artikel: 'Art. 684 ZGB', propagiert: false },
    ]);
  });

  it('«in Verbindung mit» als ausgeschriebener Konnektor', () => {
    expect(spanZiele('Art. 90 in Verbindung mit Art. 100 BGG')).toEqual([
      { anzeige: 'Art. 90', artikel: 'Art. 90 BGG', propagiert: true },
      { anzeige: 'Art. 100 BGG', artikel: 'Art. 100 BGG', propagiert: false },
    ]);
  });

  it('«und»-Aufzählung mit mehreren bare Gliedern', () => {
    expect(spanZiele('Art. 5, Art. 6 und Art. 7 ZGB')).toEqual([
      { anzeige: 'Art. 5', artikel: 'Art. 5 ZGB', propagiert: true },
      { anzeige: 'Art. 6', artikel: 'Art. 6 ZGB', propagiert: true },
      { anzeige: 'Art. 7 ZGB', artikel: 'Art. 7 ZGB', propagiert: false },
    ]);
  });

  it('Abs./lit.-Zwischenstücke brechen die Kette nicht', () => {
    // BGE 151 III 377 E. 1: «Art. 100 Abs. 1 i.V.m. Art. 46 Abs. 1 Bst. c BGG».
    expect(spanZiele('(Art. 100 Abs. 1 i.V.m. Art. 46 Abs. 1 Bst. c BGG)')).toEqual([
      { anzeige: 'Art. 100 Abs. 1', artikel: 'Art. 100 Abs. 1 BGG', propagiert: true },
      { anzeige: 'Art. 46 Abs. 1 Bst. c BGG', artikel: 'Art. 46 Abs. 1 Bst. c BGG', propagiert: false },
    ]);
  });

  it('«f./ff.» bricht die Kette nicht (Folge-Marker im Glied)', () => {
    expect(spanZiele('Art. 46 ff. i.V.m. Art. 90 BGG')).toEqual([
      { anzeige: 'Art. 46 ff.', artikel: 'Art. 46 ff. BGG', propagiert: true },
      { anzeige: 'Art. 90 BGG', artikel: 'Art. 90 BGG', propagiert: false },
    ]);
    // Folge-Marker ändert den Auflösungs-Anker nicht (führender Artikel 46).
    expect(fedlexLinkFuerArtikel('Art. 46 ff. BGG')).toBe(`${FEDLEX.BGG}#art_46`);
  });

  // ── Negativfälle (§1: lieber kein Link als ein falscher) ───────────────────
  it('Negativ: «Art. 5 der Verordnung» — kein Kürzel, kein Link', () => {
    expect(normVerweiseImText('Art. 5 der Verordnung gilt')).toEqual([]);
  });

  it('Negativ: Semikolon bricht die Kette — Glied davor bleibt fremd', () => {
    // «Art. 3 StGB; Art. 5 i.V.m. Art. 6 ZGB»: Art. 3 gehört zu StGB (eigener
    // Anker), NICHT zur ZGB-Kette; Art. 5 propagiert ZGB, Art. 3 bleibt StGB.
    expect(spanZiele('Art. 3 StGB; Art. 5 i.V.m. Art. 6 ZGB')).toEqual([
      { anzeige: 'Art. 3 StGB', artikel: 'Art. 3 StGB', propagiert: false },
      { anzeige: 'Art. 5', artikel: 'Art. 5 ZGB', propagiert: true },
      { anzeige: 'Art. 6 ZGB', artikel: 'Art. 6 ZGB', propagiert: false },
    ]);
  });

  it('Negativ: fremdes Kürzel dazwischen — «Art. 5 OR und Art. 6 ZGB» bleibt getrennt', () => {
    // Art. 5 trägt EIGENES Kürzel (OR) → kein bare Glied, wird NICHT auf ZGB umgehängt.
    expect(spanZiele('Art. 5 OR und Art. 6 ZGB')).toEqual([
      { anzeige: 'Art. 5 OR', artikel: 'Art. 5 OR', propagiert: false },
      { anzeige: 'Art. 6 ZGB', artikel: 'Art. 6 ZGB', propagiert: false },
    ]);
    expect(zielUrls('Art. 5 OR und Art. 6 ZGB')).toEqual([`${FEDLEX.OR}#art_5`, `${FEDLEX.ZGB}#art_6`]);
  });

  it('Negativ: BGE-Zitat nach dem Anker zieht kein Glied nach', () => {
    // Kein bare «Art.» vor dem Anker → keine Propagation; BGE-Zitat unberührt.
    expect(spanZiele('vgl. Art. 679 ZGB; BGE 132 III 9')).toEqual([
      { anzeige: 'Art. 679 ZGB', artikel: 'Art. 679 ZGB', propagiert: false },
    ]);
  });

  it('Nicht-Ketten-Text: Anker-Menge identisch zu NORM_IM_TEXT (additiv)', () => {
    // Einzelverweis + zweiter Verweis, keine Kette → nur die zwei Anker, kein Glied.
    expect(spanZiele('Art. 335c OR und die Regel; separat Art. 131 ZPO')).toEqual([
      { anzeige: 'Art. 335c OR', artikel: 'Art. 335c OR', propagiert: false },
      { anzeige: 'Art. 131 ZPO', artikel: 'Art. 131 ZPO', propagiert: false },
    ]);
  });
});

// ─── A10/A11 (U-VERWEIS, David 5.7.2026): Plural-Aufzählungen + Genitiv-Map ───

describe('erkenneGenitivGesetz — kuratierte ausgeschriebene Kurztitel (A11)', () => {
  it('löst die Kern-Genitive deterministisch auf', () => {
    expect(erkenneGenitivGesetz('Bundesverfassung')).toBe('BV');
    expect(erkenneGenitivGesetz('Strafgesetzbuches')).toBe('StGB');
    expect(erkenneGenitivGesetz('Strafgesetzbuchs')).toBe('StGB');
    expect(erkenneGenitivGesetz('Zivilgesetzbuches')).toBe('ZGB');
    expect(erkenneGenitivGesetz('Obligationenrechts')).toBe('OR');
    expect(erkenneGenitivGesetz('Militärstrafgesetzes')).toBe('MStG');
  });

  it('generische Wendungen bleiben BEWUSST ohne Eintrag (§1: kein Raten)', () => {
    expect(erkenneGenitivGesetz('Bundesgesetzes')).toBeNull();
    expect(erkenneGenitivGesetz('Verordnung')).toBeNull();
    expect(erkenneGenitivGesetz('Abkommens')).toBeNull();
    expect(erkenneGenitivGesetz('Übereinkommens')).toBeNull();
  });
});

describe('artikelnPluralVerweise — Plural-Aufzählungs-Regionen (A10)', () => {
  // P2-Beweispunkt: MWSTG Art. 5 VERBATIM (Snapshot bund/MWSTG/art_5) — genau
  // 5 Glieder 31/35/37/38/45, Self-Modus (kein Gesetz-Signal am Ende).
  const MWSTG5 = 'Der Bundesrat beschliesst die Anpassung der in den Artikeln 31 Absatz 2 Buchstabe c, 35 Absatz 1bis Buchstabe b, 37 Absatz 1, 38 Absatz 1 und 45 Absatz 2 Buchstabe b genannten Frankenbeträge, sobald sich der Landesindex der Konsumentenpreise seit der letzten Festlegung um mehr als 30 Prozent erhöht hat.';

  it('MWSTG Art. 5 verbatim: genau 5 Glieder (31/35/37/38/45), Self, nicht unterdrückt', () => {
    const rs = artikelnPluralVerweise(MWSTG5);
    expect(rs).toHaveLength(1);
    const r = rs[0];
    expect(r.glieder.map((g) => g.roh)).toEqual(['31', '35', '37', '38', '45']);
    expect(r.fremd).toBeNull();
    expect(r.unterdruecken).toBe(false);
    // Anzeige = exakter Quelltext-Ausschnitt (zeichenidentisch, §1).
    for (const g of r.glieder) expect(MWSTG5.slice(g.start, g.end)).toBe(g.roh);
  });

  it('bounded: die Region endet VOR dem Fliesstext («genannten Frankenbeträge»)', () => {
    const r = artikelnPluralVerweise(MWSTG5)[0];
    expect(MWSTG5.slice(r.end)).toMatch(/^ genannten Frankenbeträge/);
  });

  it('Fremdgesetz-Signal am Ende (§10.2): «…Artikeln 4 und 5 des StGB» → StGB', () => {
    const rs = artikelnPluralVerweise('Massnahmen nach den Artikeln 4 und 5 des StGB bleiben vorbehalten.');
    expect(rs).toHaveLength(1);
    expect(rs[0].fremd).toBe('StGB');
    expect(rs[0].glieder.map((g) => g.roh)).toEqual(['4', '5']);
  });

  it('Genitiv-Kurztitel als Signal: «die Artikel 26, 31 Absatz 2, 34 und 114 der Bundesverfassung» → BV, 4 Glieder', () => {
    const rs = artikelnPluralVerweise('gestützt auf die Artikel 26, 31 Absatz 2, 34 und 114 der Bundesverfassung, nach Einsicht');
    expect(rs).toHaveLength(1);
    expect(rs[0].fremd).toBe('BV');
    expect(rs[0].glieder.map((g) => g.roh)).toEqual(['26', '31', '34', '114']);
  });

  it('Klammer-Kürzel nach ausgeschriebenem Namen: «des Zivilgesetzbuchs (ZGB)» → ZGB', () => {
    const rs = artikelnPluralVerweise('gestützt auf die Artikel 269c Absatz 3 und 316 Absatz 2 des Zivilgesetzbuchs (ZGB) und weitere');
    expect(rs).toHaveLength(1);
    expect(rs[0].fremd).toBe('ZGB');
    expect(rs[0].glieder.map((g) => g.roh)).toEqual(['269c', '316']);
  });

  it('Singular-Passus nimmt genau EINEN Wert («Absatz 2, 34 …» ⇒ 34 ist Glied, nicht Absatz)', () => {
    const rs = artikelnPluralVerweise('nach den Artikeln 31 Absatz 2, 34 und 114 der Bundesverfassung');
    expect(rs[0].glieder.map((g) => g.roh)).toEqual(['31', '34', '114']);
  });

  it('Plural-Passus «Absätze 1 und 2» nimmt die Wertliste (kein Glied daraus)', () => {
    // «… sowie 7 …» ist echt ambig (Absatz 7 oder Artikel 7?). Deterministisch
    // wird die Zahl der Wertliste zugeschlagen — die §1-SICHERE Seite: ein als
    // Absatz gelesener Artikel bleibt bloss unverlinkt, ein als Artikel gelesener
    // Absatz wäre ein FALSCHER Link. Das erste Glied bleibt korrekt geroutet.
    const rs = artikelnPluralVerweise('nach den Artikeln 5 Absätze 1 und 2 sowie 7 des StGB');
    expect(rs[0].glieder.map((g) => g.roh)).toEqual(['5']);
    expect(rs[0].fremd).toBe('StGB');
  });

  it('Negativ (§1): unauflösbarer ausgeschriebener Fremdname ⇒ unterdrückt (nie geratener Self-Link)', () => {
    const rs = artikelnPluralVerweise('nach den Artikeln 91, 163 und 222 des Bundesgesetzes vom 11. April 1889 über Schuldbetreibung und Konkurs');
    expect(rs).toHaveLength(1);
    expect(rs[0].unterdruecken).toBe(true);
  });

  it('Negativ (§1): unbekanntes lat. Suffix («42octies») bricht sauber ab ⇒ unterdrückt', () => {
    const rs = artikelnPluralVerweise('gemäss den Artikeln 42quater–42octies IVG sinngemäss');
    expect(rs).toHaveLength(1);
    expect(rs[0].unterdruecken).toBe(true);
  });

  it('Negativ: Singular «Artikel 6 Absatz 2 und die Bestimmungen des OR» erzeugt KEINE Region', () => {
    expect(artikelnPluralVerweise('Artikel 6 Absatz 2 und die Bestimmungen des OR')).toEqual([]);
  });

  it('Negativ: einzelnes «der Artikel N» ohne Aufzählung/Signal bleibt dem Singular-Pfad', () => {
    expect(artikelnPluralVerweise('Die Anwendung der Artikel 5 bleibt vorbehalten')).toEqual([]);
  });

  it('«der Artikel 32 und 33» (AHVG-Muster): 2 Glieder, Self', () => {
    const rs = artikelnPluralVerweise('unter Vorbehalt der Artikel 32 und 33, nicht anwendbar auf');
    expect(rs).toHaveLength(1);
    expect(rs[0].glieder.map((g) => g.roh)).toEqual(['32', '33']);
    expect(rs[0].fremd).toBeNull();
  });

  it('Bereichs-Aufzählung «Artikeln 34–37»: beide Grenzen als Glieder, Self', () => {
    const rs = artikelnPluralVerweise('der gemäss den Artikeln 34–37 zu ermittelnden Vollrente');
    expect(rs[0].glieder.map((g) => g.roh)).toEqual(['34', '37']);
  });

  it('bare Kürzel als Signal: «den Artikeln 39 Absatz 2 und 40 Absatz 3 des IVG» → IVG', () => {
    const rs = artikelnPluralVerweise('den gemäss den Artikeln 39 Absatz 2 und 40 Absatz 3 des IVG bemessenen Renten');
    expect(rs[0].fremd).toBe('IVG');
    expect(rs[0].glieder.map((g) => g.roh)).toEqual(['39', '40']);
  });
});

describe('fremdRoutingFormB — Genitiv-Kurztitel OHNE Klammer (A11-Erweiterung)', () => {
  it('«Artikel 130 der Bundesverfassung» → BV (Singular-Ingress-Fall)', () => {
    const r = fremdRoutingFormB(' der Bundesverfassung, nach Einsicht in die Botschaft', '130');
    expect(r).not.toBeNull();
    expect(r!.gesetz).toBe('BV');
    expect(r!.glieder).toHaveLength(1);
    expect(r!.glieder[0].artikel).toBe('Art. 130 BV');
  });

  it('Klammer-Kürzel hat Vorrang: «des Zivilgesetzbuches (Code civil)» matcht NICHT über die Genitiv-Map', () => {
    // Die Klammer ist das autoritative Signal; ein unbekanntes Klammer-Kürzel
    // unterdrückt jeden Link — die Genitiv-Map darf das nicht überstimmen (§1).
    expect(fremdRoutingFormB(' des Zivilgesetzbuches (Code civil) gilt', '14')).toBeNull();
  });

  it('generischer Genitiv bleibt ohne Routing: «des Bundesgesetzes über …» → null', () => {
    expect(fremdRoutingFormB(' des Bundesgesetzes über die Alters- und Hinterlassenenversicherung gilt', '5')).toBeNull();
  });
});

// Korpus-Funde 10.7.2026 (U-VERWEIS-Gegenprüfungsvorbereitung): zwei §1-Härtungen.
describe('artikelnPluralVerweise — Korpus-Härtungen (§1)', () => {
  it('unbekanntes bare KÜRZEL nach der Aufzählung ⇒ unterdrückt («Artikeln 2 und 3 BGSA», AHVV-Fund)', () => {
    const rs = artikelnPluralVerweise('im vereinfachten Verfahren nach den Artikeln 2 und 3 BGSA haben die Arbeitgeber');
    expect(rs).toHaveLength(1);
    expect(rs[0].unterdruecken).toBe(true); // BGSA ∉ FEDLEX → nie ein falscher Self-Link
  });

  it('gewöhnliches grossgeschriebenes Substantiv unterdrückt NICHT («… Artikeln 5 und 6 Beiträge …» bleibt Self)', () => {
    const rs = artikelnPluralVerweise('erheben nach den Artikeln 5 und 6 Beiträge auf dem Einkommen');
    expect(rs).toHaveLength(1);
    expect(rs[0].unterdruecken).toBe(false);
    expect(rs[0].fremd).toBeNull();
  });

  it('Soft-Hyphens (U+00AD) im Genitiv-Namen werden toleriert («des Zivilgesetz­bu­ches» → ZGB)', () => {
    const rs = artikelnPluralVerweise('im Sinne der Artikel 60–79 des Zivilgesetz­bu­ches aufweisen');
    expect(rs).toHaveLength(1);
    expect(rs[0].fremd).toBe('ZGB');
    expect(erkenneGenitivGesetz('Zivilgesetz­bu­ches')).toBe('ZGB');
  });
});
