import { describe, it, expect } from 'vitest';
import {
  themaText, regesteLeitsatz, synthThema, istSynth, normLabel, istBge, hauptIdentitaet,
  nachRelevanz, nachDatum, nachGericht, sortiere, gruppiereNachLeit,
  zaehleSachgebiete, normHaeufigkeit, filterEntscheide, filterNachNorm,
} from '../lib/rechtsprechung/browse';
import type { BrowseEntscheid } from '../lib/rechtsprechung/register';

function be(p: Partial<BrowseEntscheid>): BrowseEntscheid {
  return {
    key: 'bund/bger/x', gericht: 'bger', gerichtName: 'Bundesgericht', gerichtstyp: 'bundesgericht',
    kanton: 'CH', nummer: '1C_1/2025', bgeReferenz: null, datum: '2025-01-01',
    zitierung: 'BGer 1C_1/2025 vom 1. Januar 2025', leitcharakter: 'routine',
    regesteVorhanden: false, regesteKurz: null, sachgebiet: 'oeffentlich', sprache: 'de',
    normKeys: [], bestand: 'snapshot', kuratierung: 'maschinell', datei: 'bund/bger/x.json',
    quelle: 'opencaselaw', quelleUrl: 'https://x', fassungsToken: 't',
    ...p,
  };
}

describe('normLabel', () => {
  it('lässt Erlass-Kürzel unverändert', () => {
    expect(normLabel('OR')).toBe('OR');
    expect(normLabel('ZPO')).toBe('ZPO');
  });
  it('zerlegt Artikel-Keys in lesbare Form', () => {
    expect(normLabel('OR-336')).toBe('OR Art. 336');
    expect(normLabel('BGG_90')).toBe('BGG Art. 90');
  });
});

describe('themaText / synthThema / istSynth', () => {
  it('nimmt die amtliche Regeste, wenn vorhanden', () => {
    const e = be({ regesteKurz: 'Bauhandwerkerpfandrecht', normKeys: ['ZGB'] });
    expect(themaText(e)).toBe('Bauhandwerkerpfandrecht');
    expect(istSynth(e)).toBe(false);
  });
  it('regesteLeitsatz strippt den vorangestellten Artikel-Block', () => {
    expect(regesteLeitsatz('Art. 88 Abs. 2, Art. 265a Abs. 1 und 4 SchKG; Verfahren betreffend Feststellung neuen Vermögens. Während des Verfahrens steht die Frist still.'))
      .toBe('Verfahren betreffend Feststellung neuen Vermögens.');
  });
  it('regesteLeitsatz überspringt mehrere Artikel-Gruppen', () => {
    expect(regesteLeitsatz('Art. 16 DBG; Art. 34b BPG; Art. 337c OR; steuerliche Behandlung einer Entschädigung. Die Entschädigung ist steuerbar.'))
      .toBe('Steuerliche Behandlung einer Entschädigung.');
  });
  it('regesteLeitsatz lässt einen reinen Schlagwort-Leitsatz unverändert', () => {
    expect(regesteLeitsatz('Bauhandwerkerpfandrecht')).toBe('Bauhandwerkerpfandrecht');
  });
  it('themaText führt mit dem Leitsatz, nicht mit dem Artikel-Block', () => {
    const e = be({ regesteKurz: 'Art. 8 ZGB; Beweislast bei der Vaterschaft. Der Kläger trägt die Beweislast.', normKeys: ['ZGB'] });
    expect(themaText(e)).toBe('Beweislast bei der Vaterschaft.');
  });
  it('regesteLeitsatz trennt auch am Punkt nach dem Gesetzeskürzel (statt Semikolon)', () => {
    expect(regesteLeitsatz('Art. 6 Abs. 4 lit. b ZPO; Art. 105 FusG. Die fusionsrechtliche Überprüfungsklage ist zulässig.'))
      .toBe('Die fusionsrechtliche Überprüfungsklage ist zulässig.');
  });
  it('regesteLeitsatz bricht NICHT an einem Abkürzungspunkt (ff./Abs.) ab', () => {
    expect(regesteLeitsatz('Art. 25a Abs. 2 ELV; keine Anwendung gemäss Art. 9 ff. dieser Regel.'))
      .toBe('Keine Anwendung gemäss Art. 9 ff. dieser Regel.');
  });
  it('regesteLeitsatz gibt bei reinem (abgeschnittenem) Artikel-Block ehrlich die volle Regeste zurück — nie ein Fragment', () => {
    const rk = 'Art. 44 SchKG; Art. 184 Abs. 3 BV; Art. 2 des Embargogesetzes; Art. 15 der Ukraine-Verordnung …';
    expect(regesteLeitsatz(rk)).toBe(rk);
  });
  it('baut ohne Regeste eine Synth-Zeile aus Gebiet + Gericht + Normen', () => {
    const e = be({ sachgebiet: 'sozial-abgaben', gerichtName: 'Kantonsgericht GR', normKeys: ['ATSG', 'BGG'] });
    expect(istSynth(e)).toBe(true);
    expect(synthThema(e)).toBe('Steuern, Sozialversicherung & Abgaben — Kantonsgericht GR · angewandt: ATSG, BGG');
  });
  it('fällt ohne Normen auf Gebiet + Gericht + Jahr zurück (kein gefakter Text)', () => {
    const e = be({ sachgebiet: 'privat', gerichtName: 'Obergericht ZH', normKeys: [], datum: '2024-06-30' });
    expect(synthThema(e)).toBe('Privatrecht — Obergericht ZH, 2024');
  });
  it('kappt die Normen-Liste deterministisch auf 3', () => {
    const e = be({ normKeys: ['BV', 'ZGB', 'OR', 'ZPO'], sachgebiet: 'privat', gerichtName: 'G' });
    expect(synthThema(e)).toBe('Privatrecht — G · angewandt: BV, ZGB, OR');
  });
});

describe('istBge / hauptIdentitaet', () => {
  it('führt mit der BGE-Referenz, wenn vorhanden (zitierbarer Anker)', () => {
    const e = be({ bgeReferenz: '150 III 137', nummer: '5A_242/2025' });
    expect(istBge(e)).toBe(true);
    expect(hauptIdentitaet(e)).toBe('BGE 150 III 137');
  });
  it('fällt ohne BGE-Referenz auf das Aktenzeichen zurück', () => {
    const e = be({ bgeReferenz: null, nummer: '5A_242/2025' });
    expect(istBge(e)).toBe(false);
    expect(hauptIdentitaet(e)).toBe('5A_242/2025');
  });
});

describe('Sortierung — deterministisch, key-stabil', () => {
  const a = be({ key: 'a', leitcharakter: 'routine', datum: '2025-05-01' });
  const b = be({ key: 'b', leitcharakter: 'leitentscheid', datum: '2020-01-01' });
  const c = be({ key: 'c', leitcharakter: 'leitentscheid', datum: '2026-01-01' });
  const d = be({ key: 'd', leitcharakter: 'routine', datum: '2025-05-01', kanton: 'ZH' });

  it('nachRelevanz: Leitentscheide zuerst, dann neueste, dann key', () => {
    expect(nachRelevanz([a, b, c]).map((e) => e.key)).toEqual(['c', 'b', 'a']);
  });
  it('nachRelevanz: unter Leitentscheiden amtlich publizierte (BGE) zuerst — auch wenn älter', () => {
    const bge = be({ key: 'bge', leitcharakter: 'leitentscheid', datum: '2019-01-01', bgeReferenz: '150 III 1' });
    const neu = be({ key: 'neu', leitcharakter: 'leitentscheid', datum: '2026-01-01', bgeReferenz: null });
    expect(nachRelevanz([neu, bge]).map((e) => e.key)).toEqual(['bge', 'neu']);
  });
  it('Tiebreak auf key bei gleichem leit+datum', () => {
    expect(nachRelevanz([d, a]).map((e) => e.key)).toEqual(['a', 'd']);
  });
  it('nachDatum desc/asc mit key-Tiebreak', () => {
    expect(nachDatum([b, c, a], 'desc').map((e) => e.key)).toEqual(['c', 'a', 'b']);
    expect(nachDatum([b, c, a], 'asc').map((e) => e.key)).toEqual(['b', 'a', 'c']);
  });
  it('nachGericht: Bund vor Kantonen, dann neueste, dann key', () => {
    expect(nachGericht([d, a, c]).map((e) => e.key)).toEqual(['c', 'a', 'd']);
  });
  it('sortiere dispatcht und mutiert die Eingabe nicht', () => {
    const eingabe = [a, b, c];
    const kopie = [...eingabe];
    sortiere(eingabe, 'relevanz');
    expect(eingabe).toEqual(kopie);
    expect(sortiere([a, b, c], 'neu').map((e) => e.key)).toEqual(['c', 'a', 'b']);
  });
});

describe('gruppiereNachLeit', () => {
  it('trennt Leitentscheide von Weiteren ohne Reihenfolge zu verlieren', () => {
    const g = gruppiereNachLeit([
      be({ key: 'l1', leitcharakter: 'leitentscheid' }),
      be({ key: 'r1', leitcharakter: 'routine' }),
      be({ key: 'l2', leitcharakter: 'leitentscheid' }),
    ]);
    expect(g.leitentscheide.map((e) => e.key)).toEqual(['l1', 'l2']);
    expect(g.weitere.map((e) => e.key)).toEqual(['r1']);
  });
});

describe('zaehleSachgebiete', () => {
  it('zählt in GEBIETE-Reihenfolge, nur belegte Gebiete', () => {
    const z = zaehleSachgebiete([
      be({ sachgebiet: 'sozial-abgaben' }),
      be({ sachgebiet: 'privat' }),
      be({ sachgebiet: 'sozial-abgaben' }),
    ]);
    expect(z.map((g) => g.sachgebiet)).toEqual(['privat', 'sozial-abgaben']);
    expect(z.find((g) => g.sachgebiet === 'sozial-abgaben')?.count).toBe(2);
  });
});

describe('normHaeufigkeit', () => {
  it('zählt Erlasse absteigend, key-stabil bei Gleichstand', () => {
    const n = normHaeufigkeit([
      be({ normKeys: ['ZPO', 'BV'] }),
      be({ normKeys: ['ZPO'] }),
      be({ normKeys: ['OR'] }),
    ]);
    expect(n[0]).toEqual({ normKey: 'ZPO', count: 2 });
    expect(n.slice(1)).toEqual([{ normKey: 'BV', count: 1 }, { normKey: 'OR', count: 1 }]);
  });
});

describe('filterEntscheide', () => {
  const liste = [
    be({ key: 'p1', sachgebiet: 'privat', kanton: 'CH', normKeys: ['OR', 'ZGB'], regesteKurz: 'Mietzins', leitcharakter: 'leitentscheid', datum: '2025-03-01' }),
    be({ key: 'o1', sachgebiet: 'oeffentlich', kanton: 'ZH', normKeys: ['BV'], gerichtName: 'Obergericht ZH', datum: '2024-01-01' }),
    be({ key: 's1', sachgebiet: 'sozial-abgaben', kanton: 'CH', normKeys: ['ATSG'], regesteKurz: 'Invalidenrente', datum: '2026-02-02' }),
  ];
  it('filtert nach Sachgebiet', () => {
    expect(filterEntscheide(liste, { sachgebiet: 'privat' }).map((e) => e.key)).toEqual(['p1']);
  });
  it('filtert nach angewandter Norm (zweite Achse)', () => {
    expect(filterEntscheide(liste, { norm: 'OR' }).map((e) => e.key)).toEqual(['p1']);
    expect(filterNachNorm(liste, 'BV').map((e) => e.key)).toEqual(['o1']);
  });
  it('Suche trifft das Thema inkl. Synth-Zeile und das Gericht', () => {
    expect(filterEntscheide(liste, { q: 'mietzins' }).map((e) => e.key)).toEqual(['p1']);
    expect(filterEntscheide(liste, { q: 'obergericht' }).map((e) => e.key)).toEqual(['o1']);
    // Synth-Zeile von o1 enthält 'Öffentliches Recht'
    expect(filterEntscheide(liste, { q: 'öffentliches recht' }).map((e) => e.key)).toEqual(['o1']);
  });
  it('kombiniert Filter (UND) und respektiert nurLeitentscheide + Datum', () => {
    expect(filterEntscheide(liste, { kanton: 'CH', nurLeitentscheide: true }).map((e) => e.key)).toEqual(['p1']);
    expect(filterEntscheide(liste, { datumVon: '2025-01-01' }).map((e) => e.key).sort()).toEqual(['p1', 's1']);
  });
  it('filtert nurBge auf amtlich publizierte Entscheide', () => {
    const mitBge = [...liste, be({ key: 'bge1', bgeReferenz: '150 III 1' })];
    expect(filterEntscheide(mitBge, { nurBge: true }).map((e) => e.key)).toEqual(['bge1']);
  });
  it('trennt Ebene Bund vs. Kantone', () => {
    expect(filterEntscheide(liste, { ebene: 'bund' }).map((e) => e.key).sort()).toEqual(['p1', 's1']);
    expect(filterEntscheide(liste, { ebene: 'kanton' }).map((e) => e.key)).toEqual(['o1']);
  });
  it('leere Werte filtern nicht', () => {
    expect(filterEntscheide(liste, {}).length).toBe(3);
  });
});
