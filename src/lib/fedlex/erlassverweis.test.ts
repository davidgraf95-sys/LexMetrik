// ─── Z1 (W2·22-VERWEIS-FEDLEX): Erlass-Verweise OHNE Artikelnummer ───────────
//
// Belegte Lücke (Abgleich gegen die Fedlex-jolux:Citation-Kanten des OR, Stand
// 2026-01-01, Dossier `bibliothek/recherche/fremdquellen-sichtung-2026-09-02.md`):
// Der Verweis-Erkenner verlinkt einen Bundeserlass bisher NUR, wenn eine
// Artikelnummer davorsteht («Art. N KÜRZEL», «Artikel N … des <Erlassname>»).
// Der BLOSSE Erlass-Verweis blieb Text, obwohl die Positivliste den Namen kennt.
//
// Alle vier Positiv-Belege sind WÖRTLICH aus den committeten Snapshots
// (`public/normtext/bund/OR.json`, stand 2026-01-01, quelleUrl fedlex.admin.ch)
// entnommen — nicht aus dem Gedächtnis zitiert (§7).

import { describe, it, expect } from 'vitest';
import { FEDLEX } from './tabelle';
import { erlassVerweiseImText, normVerweiseImText } from '../fedlex';

/** Kurzform: (anzeige, gesetz) je erkannter Erlass-Spanne. */
const treffer = (t: string) =>
  erlassVerweiseImText(t).map((s) => [s.anzeige, s.artikel] as const);

// ─── Positiv: die vier amtlich belegten OR-Stellen ───────────────────────────

describe('erlassVerweiseImText — belegte OR-Stellen (Fedlex-Citation-Kanten)', () => {
  it('OR 328b: «Bestimmungen des Datenschutzgesetzes vom 25. September 2020» → DSG', () => {
    const t = 'Im Übrigen gelten die Bestimmungen des Datenschutzgesetzes vom 25. September 2020.';
    expect(treffer(t)).toEqual([['Datenschutzgesetzes', 'DSG']]);
  });

  it('OR 193 Abs. 1: «richten sich nach der ZPO» → ZPO (bare Kürzel mit Kontext-Wort)', () => {
    const t = 'Die Voraussetzungen und Wirkungen der Streitverkündung richten sich nach der ZPO.';
    expect(treffer(t)).toEqual([['ZPO', 'ZPO']]);
  });

  it('OR 97 Abs. 2: amtlicher Volltitel → SchKG, Kurztitel mit Klammer-Kürzel → ZPO', () => {
    const t = 'Für die Vollstreckung gelten die Bestimmungen des Bundesgesetzes vom 11. April 1889 '
      + 'über Schuldbetreibung und Konkurs sowie der Zivilprozessordnung vom 19. Dezember 2008 (ZPO).';
    expect(treffer(t)).toEqual([
      ['Bundesgesetzes vom 11. April 1889 über Schuldbetreibung und Konkurs', 'SchKG'],
      ['Zivilprozessordnung', 'ZPO'],
    ]);
  });

  it('OR 622 Abs. 1: «im Sinne des Bucheffektengesetzes vom 3. Oktober 2008 (BEG)» → BEG', () => {
    const t = 'Die Statuten können bestimmen, dass sie als Wertrechte nach Artikel 973c oder 973d '
      + 'oder als Bucheffekten im Sinne des Bucheffektengesetzes vom 3. Oktober 2008 (BEG) ausgegeben werden.';
    expect(treffer(t)).toEqual([['Bucheffektengesetzes', 'BEG']]);
  });

  it('OR 622 Abs. 1bis: «als Bucheffekten im Sinne des BEG» → BEG (bare Kürzel)', () => {
    const t = 'wenn die Inhaberaktien als Bucheffekten im Sinne des BEG ausgestaltet sind';
    expect(treffer(t)).toEqual([['BEG', 'BEG']]);
  });

  it('die Spanne löst auf die ERLASS-Seite auf (kein Artikel-Anker)', () => {
    const [s] = erlassVerweiseImText('Es gelten die Bestimmungen des Bucheffektengesetzes.');
    expect(s.artikel).toBe('BEG');
    expect(FEDLEX.BEG).toMatch(/^https:\/\/www\.fedlex\.admin\.ch\//);
  });
});

// ─── Negativ: jede Stelle, an der NICHT verlinkt werden darf (§1) ────────────

describe('erlassVerweiseImText — kein Link (§1: lieber keiner als ein falscher)', () => {
  it('nacktes Kürzel im Fliesstext OHNE Kontext-Wort bleibt Text', () => {
    expect(treffer('Die Parteien haben OR und ZGB im Vertrag genannt.')).toEqual([]);
    expect(treffer('Das Vorgehen ist OR-konform.')).toEqual([]);
  });

  it('Selbstmarker «dieses Gesetzes» ist kein Erlass-Verweis', () => {
    expect(treffer('Im Übrigen gelten die Bestimmungen dieses Gesetzes.')).toEqual([]);
    expect(treffer('nach Massgabe des vorliegenden Gesetzes')).toEqual([]);
  });

  it('falsches Erlassdatum ⇒ kein Link (Zeit-Kante, Fix-Runde 1 zu W2·20)', () => {
    expect(treffer('nach den Bestimmungen des Bankengesetzes vom 1. Januar 2000 (BankG)')).toEqual([]);
    expect(treffer('richtiges Datum: des Bankengesetzes vom 8. November 1934 (BankG)'))
      .toEqual([['Bankengesetzes', 'BANKG']]);
  });

  it('Kürzel als Wortbestandteil ⇒ kein Link (Identität mit Wortgrenze, §7)', () => {
    expect(treffer('im Sinne des BEGleitschreibens der Behörde')).toEqual([]);
    expect(treffer('gemäss dem ORganigramm der Verwaltung')).toEqual([]);
  });

  it('gleichnamiger kantonaler Erlass möglich ⇒ Kurztitel nur MIT bestätigendem Erlassdatum', () => {
    // «Datenschutzgesetz» trägt auch ein Kanton (AR-146.1, BE KDSG) — ohne
    // Datum ist der Erlass nicht identifiziert (gemessener Falschlink BE-154.21).
    expect(treffer('Es gelten die Bestimmungen des Datenschutzgesetzes.')).toEqual([]);
    expect(treffer('Artikel 21 des Datenschutzgesetzes vom 19. Februar 1986 (KDSG) sind gebührenfrei')).toEqual([]);
  });

  it('Erlass ausserhalb der FEDLEX-Tabelle ⇒ kein Link', () => {
    expect(treffer('Es gelten die Bestimmungen des Nachrichtendienstgesetzes.')).toEqual([]);
    expect(treffer('nach dem Zollgesetz des Bundes')).toEqual([]);
  });

  it('vorangehendes Artikel-Zitat ⇒ die Form-B-Kette ist zuständig, keine Erlass-Spanne', () => {
    expect(treffer('Artikel 5 des Datenschutzgesetzes vom 25. September 2020 gilt.')).toEqual([]);
    expect(treffer('Art. 5 Absatz 2 des Bundesgesetzes vom 11. April 1889 über Schuldbetreibung und Konkurs')).toEqual([]);
    expect(treffer('§ 12 des Bucheffektengesetzes vom 3. Oktober 2008 (BEG)')).toEqual([]);
  });

  it('Plural-Aufzählung ⇒ die A10-Region ist zuständig, keine Erlass-Spanne', () => {
    expect(treffer('nach den Artikeln 91, 163 und 222 des Bundesgesetzes vom 11. April 1889 über Schuldbetreibung und Konkurs')).toEqual([]);
    expect(treffer('gestützt auf die Artikel 26, 31 Absatz 2, 34 und 114 der Bundesverfassung')).toEqual([]);
  });

  it('längerer amtlicher Titel ⇒ keine Präfix-Bindung auf den kürzeren Erlass', () => {
    // BS-132.100 art_4: gemeint ist das BPRAS (SR 161.5), nicht das BPR (SR 161.1).
    expect(treffer('nach den Bestimmungen des Bundesgesetzes über die politischen Rechte der Auslandschweizer vom 19. Dezember 1975')).toEqual([]);
  });

  it('Kopfwort «Verordnung» ist generisch ⇒ kein Erlass-Link ohne Artikelnummer', () => {
    expect(treffer('Es gelten die Bestimmungen der Verordnung über die Krankenversicherung.')).toEqual([]);
  });

  it('fremdes Klammer-Kürzel hinter dem Namen ⇒ kein Link', () => {
    expect(treffer('die Bestimmungen des Zivilgesetzbuches (Code civil)')).toEqual([]);
  });
});

// ─── Rot-Runde 1 (Stichprobe 2.9.2026): zwei Falschlink-Klassen an der Klammer ──
//
// Beide wurden an der Handprüfung der ersten 15 neuen Links sichtbar und sind
// hier wörtlich aus den committeten Snapshots belegt.

describe('erlassVerweiseImText — Klammer-Kanten (Rot-Runde 1)', () => {
  it('Erlassdatum HINTER dem Klammer-Kürzel wird gelesen: aDSG 1992 ⇒ kein Link auf das DSG 2020', () => {
    // kanton/BS/215.700/art_8 und kanton/BS/952.820/art_6, Stand 2026-01-01.
    expect(treffer('Es gelten überdies die Bestimmungen des Bundesgesetzes über den Datenschutz (DSG) vom 19. Juni 1992.')).toEqual([]);
    // Gegenprobe mit dem RICHTIGEN Erlassdatum (kanton/BS/165.100/art_2).
    expect(treffer('Es gelten die Bestimmungen des Bundesgesetzes über die Unfallversicherung (UVG) vom 20. März 1981.'))
      .toEqual([['Bundesgesetzes über die Unfallversicherung', 'UVG']]);
  });

  it('«(EG StPO)» nennt das kantonale Einführungsgesetz ⇒ kein Link auf die Bundes-StPO', () => {
    // kanton/BS/154.125/art_5, Stand 2026-01-01 — der Bundesname ist bloss das
    // Ende des kantonalen Titels «Gesetz über die Einführung der …».
    const t = 'Der Gerichtsrat beauftragt gemäss § 44 des Gesetzes über die Einführung der '
      + 'Schweizerischen Strafprozessordnung (EG StPO) vom 13. Oktober 2010 die Inkassostelle';
    expect(treffer(t)).toEqual([]);
    expect(treffer('nach § 5 des Einführungsgesetzes zum Schweizerischen Zivilgesetzbuches (EG zum ZGB)')).toEqual([]);
  });

  it('amtlicher Appositiv «Titel, KÜRZEL» bleibt gültig', () => {
    expect(treffer('nach den Bestimmungen des Bundesgesetzes über das Schweizer Bürgerrecht (Bürgerrechtsgesetz, BüG) vom 20. Juni 2014'))
      .toEqual([['Bundesgesetzes über das Schweizer Bürgerrecht', 'BUEG']]);
  });

  it('ein ARTIKEL-Zitat in der Klammer bestätigt den Erlass (bund/SchKG/art_92, bund/KAG/art_110)', () => {
    expect(treffer('Vorbehalten bleiben die Bestimmungen des Bundesgesetzes vom 2. April 1908 über den Versicherungsvertrag (Art. 79 Abs. 2 und 80 VVG).'))
      .toEqual([['Bundesgesetzes vom 2. April 1908 über den Versicherungsvertrag', 'VVG']]);
    expect(treffer('nach den Vorschriften des Obligationenrechts (Art. 620 ff. OR)'))
      .toEqual([['Obligationenrechts', 'OR']]);
  });
});

// ─── Self-Ausschluss: der Erlass verweist auf sich selbst ───────────────────

describe('erlassVerweiseImText — Self-Ausschluss (gelesener Erlass)', () => {
  it('BV art_192: «Die Bundesverfassung kann jederzeit … revidiert werden» ⇒ kein Chip in der BV', () => {
    const t = 'Die Bundesverfassung kann jederzeit ganz oder teilweise revidiert werden.';
    expect(treffer(t)).toEqual([['Bundesverfassung', 'BV']]); // ohne Lese-Kontext: fremd
    expect(erlassVerweiseImText(t, 'BV')).toEqual([]);        // in der BV gelesen: kein Link
  });

  it('Umlaut-Kürzel bleiben unterscheidbar: die BüV darf auf die BV verlinken', () => {
    const t = 'Als Werte der Bundesverfassung gelten namentlich folgende Grundprinzipien.';
    expect(erlassVerweiseImText(t, 'BUEV').map((s) => s.artikel)).toEqual(['BV']);
  });

  it('Trennzeichen zählen nicht: Register-Schlüssel «FINFRAV_FINMA» = FEDLEX-Key «FinfraV-FINMA»', () => {
    const t = 'Es gelten die Bestimmungen der FinfraV-FINMA.';
    expect(erlassVerweiseImText(t).map((s) => s.artikel)).toEqual(['FinfraV-FINMA']);
    expect(erlassVerweiseImText(t, 'FINFRAV_FINMA')).toEqual([]);
  });

  it('normVerweiseImText reicht den Lese-Kontext durch', () => {
    const t = 'Im Übrigen gelten die Bestimmungen des Datenschutzgesetzes vom 25. September 2020.';
    expect(normVerweiseImText(t, 'DSG')).toEqual([]);
    expect(normVerweiseImText(t, 'OR').map((s) => s.artikel)).toEqual(['DSG']);
  });
});

// ─── Einhängung: normVerweiseImText bleibt für Artikel-Verweise unverändert ──

describe('normVerweiseImText — additiv, Artikel-Anker unverändert (§6)', () => {
  it('bestehende Anker- und Ketten-Spannen bleiben zeichengleich', () => {
    const t = 'Nach Art. 684 i.V.m. Art. 679 ZGB haftet der Grundeigentümer.';
    expect(normVerweiseImText(t).map((s) => [s.anzeige, s.artikel, s.propagiert])).toEqual([
      ['Art. 684', 'Art. 684 ZGB', true],
      ['Art. 679 ZGB', 'Art. 679 ZGB', false],
    ]);
  });

  it('Erlass-Spannen kommen HINZU und tragen den Quelltext als Anzeige', () => {
    const t = 'Im Übrigen gelten die Bestimmungen des Datenschutzgesetzes vom 25. September 2020.';
    expect(normVerweiseImText(t).map((s) => [s.anzeige, s.artikel])).toEqual([
      ['Datenschutzgesetzes', 'DSG'],
    ]);
  });

  it('ein Artikel-Anker verdrängt eine überlappende Erlass-Spanne', () => {
    const t = 'Art. 5 ZPO und die Bestimmungen des Bucheffektengesetzes gelten.';
    const spans = normVerweiseImText(t);
    expect(spans.map((s) => s.artikel)).toEqual(['Art. 5 ZPO', 'BEG']);
    // überschneidungsfrei und aufsteigend sortiert
    for (let i = 1; i < spans.length; i += 1) expect(spans[i].start).toBeGreaterThanOrEqual(spans[i - 1].end);
  });
});
