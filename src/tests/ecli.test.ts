import { describe, it, expect } from 'vitest';
import { minteEcli, minteEcliFuerSnapshot } from '../lib/rechtsprechung/ecli';
import type { EntscheidSnapshot } from '../lib/rechtsprechung/typen';

describe('minteEcli — Bundesebene', () => {
  it('BGE aus Fundstelle ohne «BGE»-Präfix (unsere reale Datenform)', () => {
    // bgeReferenz/nummer tragen «150 I 17» ohne Präfix → kanonische BGE-Form.
    expect(minteEcli({ gericht: 'bge', bgeReferenz: '150 I 17', nummer: '150 I 17', datum: '2024-01-15' }))
      .toBe('ECLI:CH:BGE:2024:150.I.17');
  });

  it('BGE mit römischer Abteilung wird gross geschrieben', () => {
    expect(minteEcli({ gericht: 'bge', bgeReferenz: 'BGE 140 iii 86', datum: '2014-05-02' }))
      .toBe('ECLI:CH:BGE:2014:140.III.86');
  });

  it('BGer-Docket: «/»→«.», Rest unverändert', () => {
    expect(minteEcli({ gericht: 'bger', nummer: '5A_1100/2025', datum: '2025-03-10' }))
      .toBe('ECLI:CH:BGER:2025:5A_1100.2025');
  });

  it('BVGer-Docket mit Bindestrich bleibt erhalten', () => {
    expect(minteEcli({ gericht: 'bvger', nummer: 'A-1234/2024', datum: '2024-06-01' }))
      .toBe('ECLI:CH:BVGER:2024:A-1234.2024');
  });

  it('BPatGer-Docket ohne «/» und ohne Leerraum', () => {
    expect(minteEcli({ gericht: 'bpatger', nummer: 'O2024_001', datum: '2024-09-09' }))
      .toBe('ECLI:CH:BPATGER:2024:O2024_001');
  });

  it('BStGer', () => {
    expect(minteEcli({ gericht: 'bstger', nummer: 'SK.2023.44', datum: '2023-11-02' }))
      .toBe('ECLI:CH:BSTGER:2023:SK.2023.44');
  });
});

describe('minteEcli — Kanton (Akronym-Regel)', () => {
  it('zh_obergericht → ZHO', () => {
    expect(minteEcli({ gericht: 'zh_obergericht', nummer: 'VB.2018.00411', datum: '2018-05-05' }))
      .toBe('ECLI:CH:ZHO:2018:VB.2018.00411');
  });

  it('ag_gerichte → AGG', () => {
    expect(minteEcli({ gericht: 'ag_gerichte', nummer: 'WBE.2022.100', datum: '2022-02-02' }))
      .toBe('ECLI:CH:AGG:2022:WBE.2022.100');
  });

  it('be_verwaltungsgericht → BEV', () => {
    expect(minteEcli({ gericht: 'be_verwaltungsgericht', nummer: '100.2021.55', datum: '2021-07-01' }))
      .toBe('ECLI:CH:BEV:2021:100.2021.55');
  });

  it('mehrere Unterstrich-Wörter → mehrbuchstabiges Akronym', () => {
    expect(minteEcli({ gericht: 'be_zivil_straf', nummer: 'ZK.2020.1', datum: '2020-01-01' }))
      .toBe('ECLI:CH:BEZS:2020:ZK.2020.1');
  });
});

describe('minteEcli — Jahr-Ableitung & Robustheit', () => {
  it('Jahr aus «/YYYY» im Docket, wenn Datum fehlt', () => {
    expect(minteEcli({ gericht: 'bger', nummer: '6B_1234/2025', datum: null }))
      .toBe('ECLI:CH:BGER:2025:6B_1234.2025');
  });

  it('kein Jahr ableitbar → null', () => {
    expect(minteEcli({ gericht: 'bger', nummer: 'ohne-jahr', datum: null })).toBeNull();
  });

  it('kein Gericht → null', () => {
    expect(minteEcli({ gericht: '', nummer: '5A_1/2025', datum: '2025-01-01' })).toBeNull();
  });

  it('kein Docket, aber id-Fallback (Gerichts-Präfix gestrippt)', () => {
    expect(minteEcli({ gericht: 'bger', nummer: null, id: 'bger_5A_9/2025', datum: '2025-04-04' }))
      .toBe('ECLI:CH:BGER:2025:5A_9.2025');
  });

  it('weder Docket noch id → null', () => {
    expect(minteEcli({ gericht: 'bger', nummer: null, id: null, datum: '2025-01-01' })).toBeNull();
  });
});

describe('minteEcliFuerSnapshot', () => {
  const basis: EntscheidSnapshot = {
    id: 'bund/bger/5A_1100_2025',
    gericht: 'bger',
    gerichtName: 'Bundesgericht',
    gerichtstyp: 'bundesgericht',
    kanton: 'CH',
    abteilung: null,
    nummer: '5A_1100/2025',
    bgeReferenz: null,
    zitierung: 'Urteil 5A_1100/2025',
    datum: '2025-03-10',
    sprache: 'de',
    leitcharakter: 'routine',
    sachgebiet: 'zivilrecht' as EntscheidSnapshot['sachgebiet'],
    legalArea: null,
    rubrum: null,
    regeste: null,
    regesteAmtlich: false,
    abschnitte: [],
    dispositivOrders: [],
    zitierteNormen: [],
    normKeys: [],
    zitierteEntscheide: [],
    bestand: 'snapshot',
    kuratierung: 'maschinell',
    quelle: 'opencaselaw',
    quelleUrl: 'https://www.bger.ch/',
    abgerufen: '2026-07-02T00:00:00.000Z',
    fassungsToken: 'abc',
    sha: 'def',
  };

  it('mintet aus dem Snapshot', () => {
    expect(minteEcliFuerSnapshot(basis)).toBe('ECLI:CH:BGER:2025:5A_1100.2025');
  });

  it('BGE-Leitentscheid über bgeReferenz', () => {
    expect(minteEcliFuerSnapshot({ ...basis, gericht: 'bge', bgeReferenz: '150 I 17', nummer: '150 I 17', datum: '2024-01-15' }))
      .toBe('ECLI:CH:BGE:2024:150.I.17');
  });
});
