import { describe, it, expect } from 'vitest';
import {
  parseFussnoteHistorie,
  baueArtikelHistorie,
  type FnEingang,
} from '../lib/normtext/historie-parse';

// G-HIST · Parser-Grammatik der artikel-genauen In-Kraft-/Änderungshistorie aus
// der gespeicherten Fussnoten-Prosa (src/lib/normtext/historie-parse.ts).
// Deckt die Kern-Muster (Fassung/Eingefügt/Aufgehoben/Ausdruck/…), die belegten
// Korpus-Randfälle (Doppel-«seit seit», «seit.», fehlendes «in», volle
// Monatsnamen, Mehrfach-Ereignis je Fussnote) UND den ehrlichen unparsed-Pfad.

const fn = (text: string, extra: Partial<FnEingang> = {}): FnEingang => ({ text, links: [], absatz: null, item: null, ...extra });

describe('parseFussnoteHistorie — Kern-Ereignistypen', () => {
  it('«Fassung gemäss …, in Kraft seit …» → fassung + ISO-Datum', () => {
    const r = parseFussnoteHistorie(fn('Fassung gemäss Ziff. II Art. 1 Ziff. 1 des BG vom 25. Juni 1971, in Kraft seit 1. Jan. 1972 (AS 1971 1465; BBl 1967 II 241).'));
    expect(r.klasse).toBe('ereignis');
    expect(r.ereignisse).toHaveLength(1);
    expect(r.ereignisse[0].typ).toBe('fassung');
    expect(r.ereignisse[0].datum).toBe('1972-01-01');
    expect(r.ereignisse[0].wirkung).toBe(false);
  });

  it('«Eingefügt durch …, in Kraft seit 1. Juli 1991» → eingefuegt + Datum', () => {
    const r = parseFussnoteHistorie(fn('Eingefügt durch Ziff. I des BG vom 5. Okt. 1990, in Kraft seit 1. Juli 1991 (AS 1991 846).'));
    expect(r.ereignisse[0].typ).toBe('eingefuegt');
    expect(r.ereignisse[0].datum).toBe('1991-07-01');
  });

  it('«Aufgehoben durch …, mit Wirkung seit …» → aufgehoben + wirkung=true', () => {
    const r = parseFussnoteHistorie(fn('Aufgehoben durch Anhang Ziff. 2 des BG vom 19. Dez. 2003 über die elektronische Signatur, mit Wirkung seit 1. Jan. 2005 (AS 2004 5085; BBl 2001 5679).'));
    expect(r.ereignisse[0].typ).toBe('aufgehoben');
    expect(r.ereignisse[0].datum).toBe('2005-01-01');
    expect(r.ereignisse[0].wirkung).toBe(true);
  });

  it('«Ausdruck gemäss …» → ausdruck (Begriff im ganzen Text)', () => {
    const r = parseFussnoteHistorie(fn('Ausdruck gemäss Ziff. I 1 des BG vom 26. Juni 1998, in Kraft seit 1. Jan. 2000 (AS 1999 1118; BBl 1996 I 1). Diese Änd. ist im ganzen Erlass berücksichtigt.'));
    expect(r.ereignisse[0].typ).toBe('ausdruck');
    expect(r.ereignisse[0].datum).toBe('2000-01-01');
  });

  it('«Angenommen in der Volksabstimmung vom …» → angenommen (BV)', () => {
    const r = parseFussnoteHistorie(fn('Angenommen in der Volksabstimmung vom 9. Febr. 2014, in Kraft seit 1. Jan. 2021 (AS 2020 4231; BBl 2011 6269).'));
    expect(r.ereignisse[0].typ).toBe('angenommen');
    expect(r.ereignisse[0].datum).toBe('2021-01-01');
  });

  it('«Ursprünglich Art. 12» → urspruenglich, undatiert', () => {
    const r = parseFussnoteHistorie(fn('Ursprünglich Art. 12'));
    expect(r.ereignisse[0].typ).toBe('urspruenglich');
    expect(r.ereignisse[0].datum).toBeNull();
  });
});

describe('parseFussnoteHistorie — Randfälle des Korpus', () => {
  it('belegter Doppel-«seit seit»-Tippfehler (BVG 34a) trennt das Datum nicht ab', () => {
    const r = parseFussnoteHistorie(fn('Fassung gemäss Ziff. I des BG vom 17. Dez. 2010, in Kraft seit seit 1. Jan. 2017 (AS 2016 935).'));
    expect(r.ereignisse[0].datum).toBe('2017-01-01');
  });

  it('belegtes «seit.» (Punkt statt Leerzeichen, AVIV 99)', () => {
    const r = parseFussnoteHistorie(fn('Aufgehoben durch Ziff. I der V vom 28. Mai 2003, mit Wirkung seit. 1. Jan. 2001 (AS 2000 3097).'));
    expect(r.ereignisse[0].datum).toBe('2001-01-01');
  });

  it('fehlendes «in» vor «Kraft seit»', () => {
    const r = parseFussnoteHistorie(fn('Fassung gemäss Anhang Ziff. 3 des BG vom 22. Juni 2007, Kraft seit 1. Juli 2008 (AS 2008 2551; BBl 2006 1).'));
    expect(r.ereignisse[0].datum).toBe('2008-07-01');
  });

  it('voll ausgeschriebener Monatsname («1. Januar 1995»)', () => {
    const r = parseFussnoteHistorie(fn('Fassung gemäss Ziff. I des BG vom 6. Okt. 1994, in Kraft seit 1. Januar 1995 (AS 1994 2379).'));
    expect(r.ereignisse[0].datum).toBe('1995-01-01');
  });

  it('mehrere Ereignisse in EINER Fussnote (eingefügt undatiert + spätere Fassung) — Dokumentreihenfolge bleibt', () => {
    const r = parseFussnoteHistorie(fn('Eingefügt durch Anhang Ziff. 2 des BG vom 19. Dez. 2003 (AS 2004 5085; BBl 2001 5679). Fassung gemäss Anhang Ziff. II 4 des BG vom 18. März 2016, in Kraft seit 1. Jan. 2017 (AS 2016 4651; BBl 2014 1001).'));
    expect(r.ereignisse.map((e) => e.typ)).toEqual(['eingefuegt', 'fassung']);
    expect(r.ereignisse[0].datum).toBeNull();
    expect(r.ereignisse[1].datum).toBe('2017-01-01');
  });

  it('datierte In-Kraft-Klausel ohne Verb-Kopf → generisches inkraft-Ereignis', () => {
    const r = parseFussnoteHistorie(fn('Gemäss Ziff. II 13 des BG vom 20. März 2009 über die Bahnreform 2, in Kraft seit 1. Jan. 2010, wurden die Randtitel angepasst.'));
    expect(r.klasse).toBe('ereignis');
    expect(r.ereignisse[0].typ).toBe('inkraft');
    expect(r.ereignisse[0].datum).toBe('2010-01-01');
  });

  it('Quellen (AS/BBl) werden mit ihrem amtlichen Link aufgelöst', () => {
    const r = parseFussnoteHistorie(fn(
      'Fassung gemäss Anhang Ziff. II 4 des BG vom 18. März 2016, in Kraft seit 1. Jan. 2017 (AS <b>2016</b> 4651; BBl <b>2014</b> 1001).',
      { links: [
        { label: 'AS <b>2016</b> 4651', url: 'https://fedlex.data.admin.ch/eli/oc/2016/752' },
        { label: 'BBl <b>2014</b> 1001', url: 'https://fedlex.data.admin.ch/eli/fga/2014/171' },
      ] },
    ));
    expect(r.ereignisse[0].quellen).toEqual([
      { label: 'AS 2016 4651', url: 'https://fedlex.data.admin.ch/eli/oc/2016/752' },
      { label: 'BBl 2014 1001', url: 'https://fedlex.data.admin.ch/eli/fga/2014/171' },
    ]);
  });
});

describe('parseFussnoteHistorie — Nicht-Ereignisse & unparsed (§8)', () => {
  it('reiner SR-Verweis → referenz, kein Ereignis', () => {
    const r = parseFussnoteHistorie(fn('SR 943.03'));
    expect(r.klasse).toBe('referenz');
    expect(r.ereignisse).toHaveLength(0);
  });

  it('«Siehe auch …» → referenz', () => {
    expect(parseFussnoteHistorie(fn('Siehe auch die Schl- und UeB des X. Tit.')).klasse).toBe('referenz');
  });

  it('redaktionelle Notiz ohne Datum → referenz', () => {
    expect(parseFussnoteHistorie(fn('Die Änderungen können unter der genannten AS-Adresse konsultiert werden.')).klasse).toBe('referenz');
  });

  it('nicht sicher klassifizierbarer Text → unparsed mit Roh-Text (nie stilles Weglassen)', () => {
    const roh = 'Im französischen und italienischen Text besteht dieser Artikel aus einem einzigen Absatz.';
    const r = parseFussnoteHistorie(fn(roh));
    expect(r.klasse).toBe('unparsed');
    expect(r.roh).toBe(roh);
    expect(r.ereignisse).toHaveLength(0);
  });

  it('erfindet NIE ein Datum: unvollständige Klausel «in Kraft seit 1. Juli (AS …)» ohne Jahr → kein Datum', () => {
    const r = parseFussnoteHistorie(fn('Fassung gemäss Ziff. I des BG, in Kraft seit 1. Juli (AS 1981 538).'));
    // Verb-Kopf erkannt (Ereignis), aber Datum ehrlich null — kein geratenes Jahr.
    expect(r.ereignisse[0].typ).toBe('fassung');
    expect(r.ereignisse[0].datum).toBeNull();
  });
});

describe('baueArtikelHistorie — Per-Artikel-Projektion', () => {
  it('giltSeit = jüngstes datiertes Textänderungs-Ereignis', () => {
    const { historie } = baueArtikelHistorie([
      fn('Eingefügt durch BG vom 5. Okt. 1990, in Kraft seit 1. Juli 1991 (AS 1991 846).'),
      fn('Fassung gemäss BG vom 18. März 2016, in Kraft seit 1. Jan. 2017 (AS 2016 4651).'),
    ]);
    expect(historie?.giltSeit).toBe('2017-01-01');
  });

  it('Ganz-Artikel-Aufhebung (Artikelebene) → aufgehobenSeit; Absatz-Aufhebung NICHT', () => {
    const ganz = baueArtikelHistorie([fn('Aufgehoben durch BG vom 19. Dez. 2003, mit Wirkung seit 1. Jan. 2005 (AS 2004 5085).', { absatz: null })]);
    expect(ganz.historie?.aufgehobenSeit).toBe('2005-01-01');
    expect(ganz.historie?.giltSeit).toBeNull();
    const absatz = baueArtikelHistorie([fn('Aufgehoben durch BG vom 19. Dez. 2003, mit Wirkung seit 1. Jan. 2005 (AS 2004 5085).', { absatz: '2' })]);
    expect(absatz.historie?.aufgehobenSeit).toBeUndefined();
  });

  it('Artikel nur mit Verweis-Fussnoten → keine Historie (Fallback = Erlass-Ur-Datum)', () => {
    const { historie, refCount } = baueArtikelHistorie([fn('SR 943.03'), fn('Siehe auch Art. 5.')]);
    expect(historie).toBeNull();
    expect(refCount).toBe(2);
  });

  it('zählt unparsed-Residuen je Artikel (§8)', () => {
    const { unparsed } = baueArtikelHistorie([
      fn('Fassung gemäss BG vom 18. März 2016, in Kraft seit 1. Jan. 2017 (AS 2016 4651).'),
      fn('Ein völlig unerwarteter Satz ganz ohne Muster xyz.'),
    ]);
    expect(unparsed).toHaveLength(1);
  });
});
