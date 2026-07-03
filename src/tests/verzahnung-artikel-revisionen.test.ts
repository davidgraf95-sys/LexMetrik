import { describe, it, expect } from 'vitest';
import {
  kanonArtikelToken, parseDeutschesRevisionsdatum, extrahiereArtikelRevision,
  baueRevisionProArtikel,
} from '../lib/verzahnung/revisionen-extrakt';
import {
  klassifiziereFassungsBezug, entscheidPraezision, entscheidDatum,
  revisionFuerToken, revisionDetailText, type RevisionShard,
} from '../lib/verzahnung/artikel-revisionen';

// ─── V1c Normrevisions-Ehrlichkeit: Parser + Klassifikation (§V1c) ───────────
// Reine, deterministische Datenschicht (§2). Deckt die Bau-Extraktion
// (Struktur-Sidecar-Fussnoten → Revisionsdatum) UND die Kanten-Klassifikation ab.

describe('kanonArtikelToken — Unterstrich-/kompakt-Form auf EINEN Schlüssel', () => {
  it('bringt Sidecar- und Zitat-Konvention zusammen', () => {
    expect(kanonArtikelToken('216_c')).toBe('216c');   // Sidecar/Reader
    expect(kanonArtikelToken('216c')).toBe('216c');    // Zitat/passus
    expect(kanonArtikelToken('663_b_bis')).toBe('663bbis');
    expect(kanonArtikelToken('226_a_226_d')).toBe('226a226d');
    expect(kanonArtikelToken(' 41 ')).toBe('41');
    expect(kanonArtikelToken('Disp_u2_Art_1')).toBe('dispu2art1');
  });
});

describe('parseDeutschesRevisionsdatum — deterministisch, kein new Date', () => {
  it('parst amtliche Abkürzungen', () => {
    expect(parseDeutschesRevisionsdatum('1', 'Jan.', '2017')).toBe('2017-01-01');
    expect(parseDeutschesRevisionsdatum('15', 'Jan.', '2017')).toBe('2017-01-15');
    expect(parseDeutschesRevisionsdatum('1', 'Juli', '2008')).toBe('2008-07-01');
    expect(parseDeutschesRevisionsdatum('1', 'Sept.', '2023')).toBe('2023-09-01');
    expect(parseDeutschesRevisionsdatum('1', 'Febr.', '2019')).toBe('2019-02-01');
    expect(parseDeutschesRevisionsdatum('1', 'März', '2019')).toBe('2019-03-01');
    expect(parseDeutschesRevisionsdatum('1', 'Aug.', '2021')).toBe('2021-08-01');
  });
  it('parst auch ausgeschriebene Monate', () => {
    expect(parseDeutschesRevisionsdatum('1', 'Januar', '2017')).toBe('2017-01-01');
    expect(parseDeutschesRevisionsdatum('3', 'Dezember', '1999')).toBe('1999-12-03');
  });
  it('lehnt ungültige Eingaben ab (null, kein Rateversuch)', () => {
    expect(parseDeutschesRevisionsdatum('1', 'Foo', '2017')).toBeNull();
    expect(parseDeutschesRevisionsdatum('32', 'Jan.', '2017')).toBeNull();
    expect(parseDeutschesRevisionsdatum('1', 'Jan.', '1700')).toBeNull();
  });
});

describe('extrahiereArtikelRevision — max-Datum + AS-Fundstelle', () => {
  it('nimmt bei mehreren Fussnoten das SPÄTESTE In-Kraft-Datum', () => {
    const rev = extrahiereArtikelRevision([
      { text: 'Eingefügt durch … in Kraft seit 1. Jan. 2005 (AS <b>2004</b> 5085).' },
      { text: 'Fassung gemäss …, in Kraft seit 1. Jan. 2017 (AS <b>2016</b> 4651; BBl 2014 1001).' },
    ]);
    expect(rev).toEqual({ iso: '2017-01-01', as: 'AS 2016 4651' });
  });
  it('nimmt bei zwei Daten IN EINER Fussnote das spätere + zugehörige AS', () => {
    const rev = extrahiereArtikelRevision([
      { text: 'Eingefügt durch … (AS 2004 5085). Fassung gemäss …, in Kraft seit 1. Jan. 2017 (AS <b>2016</b> 4651).' },
    ]);
    expect(rev).toEqual({ iso: '2017-01-01', as: 'AS 2016 4651' });
  });
  it('erkennt Absatz-Aufhebung («mit Wirkung seit») als datierte Textänderung', () => {
    const rev = extrahiereArtikelRevision([
      { text: 'Aufgehoben durch Ziff. I der V des BGer vom 5. Juni 1996, mit Wirkung seit 1. Jan. 1997 (AS <b>1996</b> 2884).' },
    ]);
    expect(rev).toEqual({ iso: '1997-01-01', as: 'AS 1996 2884' });
  });
  it('parst AS auch mit Italic-Umschliessung', () => {
    const rev = extrahiereArtikelRevision([
      { text: 'Aufgehoben …, mit Wirkung seit 1. Aug. 2021 (<i>AS <b>2021</b> 400</i>).' },
    ]);
    expect(rev).toEqual({ iso: '2021-08-01', as: 'AS 2021 400' });
  });
  it('Negativ: reine SR-Verweis-Fussnote (kein Datum) → null (Urfassung)', () => {
    expect(extrahiereArtikelRevision([{ text: 'SR <b>943.03</b>' }])).toBeNull();
    expect(extrahiereArtikelRevision([])).toBeNull();
    expect(extrahiereArtikelRevision(undefined)).toBeNull();
  });

  // ── Gegenprüfung-Funde 4.7.2026 (amtliche Fedlex-Tippfehler + AS-Varianten) ──
  it('toleriert Fedlex-Tippfehler «in Kraft seit seit …» (BVG Art. 34a)', () => {
    expect(extrahiereArtikelRevision([
      { text: 'Eingefügt …, in Kraft seit 1. Jan. 2003 (AS 2002 3371).' },
      { text: 'Fassung gemäss …, in Kraft seit seit 1. Jan. 2017 (AS <b>2016</b> 4375; BBl 2008 5395).' },
    ])).toEqual({ iso: '2017-01-01', as: 'AS 2016 4375' });
  });
  it('toleriert «mit Wirkung seit. 1. Jan. 2001» (Punkt-Tippfehler, AVIV Art. 99)', () => {
    expect(extrahiereArtikelRevision([
      { text: 'Aufgehoben durch Ziff. I der V vom 15. Nov. 2000, mit Wirkung seit. 1. Jan. 2001 (AS <b>2000</b> 3097).' },
    ])).toEqual({ iso: '2001-01-01', as: 'AS 2000 3097' });
  });
  it('parst AS ohne Leerzeichen nach «AS» — «AS<b> 2007</b> 5259» (AHVG Art. 92a)', () => {
    expect(extrahiereArtikelRevision([
      { text: 'Aufgehoben …, mit Wirkung seit 1. Dez. 2007 (AS<b> 2007</b> 5259; BBl <b>2006</b> 501).' },
    ])).toEqual({ iso: '2007-12-01', as: 'AS 2007 5259' });
  });
  it('gestaffelte In-Kraft-Daten in EINER Fussnote: max-Datum trägt die gemeinsame Enactment-AS (BVG Art. 64)', () => {
    expect(extrahiereArtikelRevision([
      { text: 'Fassung gemäss …, in Kraft seit 1. Jan. 2012, mit Ausnahme von Abs. 1 in Kraft seit 1. Aug. 2011 (AS <b>2011</b> 3393; BBl 2007 5669).' },
    ])).toEqual({ iso: '2012-01-01', as: 'AS 2011 3393' });
  });
});

describe('baueRevisionProArtikel — kanonische Token, Kollision → max', () => {
  it('kanonisiert Keys und behält nur belegte Artikel', () => {
    const map = baueRevisionProArtikel({
      '14': { fussnoten: [{ text: 'Fassung gemäss …, in Kraft seit 1. Jan. 2017 (AS 2016 4651).' }] },
      '1': { fussnoten: [{ text: 'SR 943.03' }] },   // kein Datum → nicht aufgenommen
      '216_c': { fussnoten: [{ text: 'Eingefügt …, in Kraft seit 1. Jan. 2013 (AS 2011 725).' }] },
    });
    expect(Object.keys(map).sort()).toEqual(['14', '216c']);
    expect(map['216c']).toEqual({ iso: '2013-01-01', as: 'AS 2011 725' });
  });
});

describe('entscheidPraezision — Q1: BGE-Bandjahr-Platzhalter erkennen', () => {
  it('YYYY-01-01 bei BGE ⇒ bandjahr, echtes Urteilsdatum ⇒ tag', () => {
    expect(entscheidPraezision('1995-01-01', 'bge')).toBe('bandjahr');
    expect(entscheidPraezision('1995-06-14', 'bge')).toBe('tag');
    expect(entscheidPraezision('1995-01-01', 'bger')).toBe('tag'); // nur BGE-Platzhalter zählt
    expect(entscheidPraezision('krumm', 'bge')).toBe('unbekannt');
  });
});

describe('klassifiziereFassungsBezug — die vier Zweige (§V1c)', () => {
  const tag = (iso: string) => entscheidDatum(iso, 'bger'); // 'tag'-Präzision

  it('d < r(a) ⇒ revidiert (beweisbar)', () => {
    expect(klassifiziereFassungsBezug(tag('2010-05-05'), { iso: '2017-01-01', as: 'AS 2016 4651' })).toBe('revidiert');
  });
  it('d ≥ r(a) ⇒ gleich (UI-still, kein Aktualitäts-Siegel)', () => {
    expect(klassifiziereFassungsBezug(tag('2017-01-01'), { iso: '2017-01-01', as: '' })).toBe('gleich');
    expect(klassifiziereFassungsBezug(tag('2020-01-01'), { iso: '2017-01-01', as: '' })).toBe('gleich');
  });
  it('Urfassung (revision null) ⇒ gleich', () => {
    expect(klassifiziereFassungsBezug(tag('1990-01-01'), null)).toBe('gleich');
  });
  it('nicht abgedeckt (revision undefined / kein Entscheiddatum) ⇒ unbekannt', () => {
    expect(klassifiziereFassungsBezug(tag('1990-01-01'), undefined)).toBe('unbekannt');
    expect(klassifiziereFassungsBezug(undefined, { iso: '2017-01-01', as: '' })).toBe('unbekannt');
    expect(klassifiziereFassungsBezug(entscheidDatum('krumm', 'bge'), { iso: '2017-01-01', as: '' })).toBe('unbekannt');
  });

  it('Bandjahr STRIKT: nur revidiert, wenn Revisions-Jahr > Bandjahr', () => {
    const band1995 = entscheidDatum('1995-01-01', 'bge');   // bandjahr
    // Revision 2017 > 1995 ⇒ revidiert
    expect(klassifiziereFassungsBezug(band1995, { iso: '2017-01-01', as: '' })).toBe('revidiert');
    // Revision im SELBEN Jahr ⇒ Reihenfolge unbekannt ⇒ unbekannt (nicht gleich!)
    expect(klassifiziereFassungsBezug(band1995, { iso: '1995-11-01', as: '' })).toBe('unbekannt');
    // Revision VOR dem Bandjahr ⇒ unbekannt (nicht revidiert, aber auch nie fälschlich)
    expect(klassifiziereFassungsBezug(band1995, { iso: '1990-01-01', as: '' })).toBe('unbekannt');
  });
});

describe('revisionFuerToken / revisionDetailText', () => {
  const shard: RevisionShard = { erlass: 'OR', proArtikel: { '727a': { iso: '2025-01-01', as: 'AS 2023 628' } } };
  it('trifft über kanonische Token; fehlt = Urfassung (null); kein Shard = undefined', () => {
    expect(revisionFuerToken(shard, '727_a')).toEqual({ iso: '2025-01-01', as: 'AS 2023 628' });
    expect(revisionFuerToken(shard, '727a')).toEqual({ iso: '2025-01-01', as: 'AS 2023 628' });
    expect(revisionFuerToken(shard, '41')).toBeNull();        // abgedeckt, aber Urfassung
    expect(revisionFuerToken(null, '727a')).toBeUndefined();  // Shard fehlt/lädt
  });
  it('formatiert Datum + AS für Tooltip/aria (§7-Provenienz)', () => {
    expect(revisionDetailText({ iso: '2025-01-01', as: 'AS 2023 628' })).toBe('in Kraft seit 01.01.2025 · AS 2023 628');
    expect(revisionDetailText({ iso: '2017-06-15', as: '' })).toBe('in Kraft seit 15.06.2017');
  });
});
