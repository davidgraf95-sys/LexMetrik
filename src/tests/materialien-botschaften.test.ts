import { describe, it, expect } from 'vitest';
import {
  baueBotschaften, keyAusFga, liveLink, type ErlassMeta,
} from '../../scripts/materialien/botschaften-generieren';
import { parlamentUrlAusCuria } from '../lib/materialien/botschaften';
import type { SparqlBinding } from '../../scripts/fedlex-sparql';
import { BOTSCHAFTEN } from '../lib/materialien/botschaften.generated';
import { ERLASS_REGISTER } from '../lib/normtext/register';

// Paket 2 (W2·6): reine Generator-Logik (dedupe/Sortierung/Determinismus/Join-Felder) +
// die Curia→parlament.ch-Transformation. Netz-Kette prüft die Live-Daten separat.

const META: ErlassMeta[] = [
  { key: 'DSG', sr: '235.1', rechtsgebiet: 'oeffentlich', rang: 10 },
  { key: 'OR', sr: '220', rechtsgebiet: 'privat', rang: 1 },
];

function bind(o: Record<string, string | undefined>): SparqlBinding {
  const b: SparqlBinding = {};
  for (const [k, v] of Object.entries(o)) if (v !== undefined) b[k] = { value: v };
  return b;
}

const FGA_A = 'https://fedlex.data.admin.ch/eli/fga/2017/2057';
const PROJ_A = 'https://fedlex.data.admin.ch/eli/proj/2017/1085';

describe('baueBotschaften — Kern-Logik', () => {
  it('dedupliziert eine Botschaft unter zwei SR (Mantelerlass → normKeys beide)', () => {
    const bindings = [
      bind({ sr: '235.1', botschaft: FGA_A, proj: PROJ_A, oc: 'oc/x', dateDoc: '2017-09-15', curia: '17.059', titleDe: 'Titel DE', titleFr: 'Titre FR', titleIt: 'Titolo IT' }),
      bind({ sr: '220', botschaft: FGA_A, proj: PROJ_A, oc: 'oc/y', dateDoc: '2017-09-15', curia: '17.059', titleDe: 'Titel DE', titleFr: 'Titre FR', titleIt: 'Titolo IT' }),
    ];
    const out = baueBotschaften(bindings, META);
    expect(out).toHaveLength(1);
    expect(out[0].normKeys).toEqual(['DSG', 'OR']); // sortiert
    expect(out[0].ocUris).toEqual(['oc/x', 'oc/y']);
    expect(out[0].titel).toBe('Titel DE');
    expect(out[0].titelFr).toBe('Titre FR');
    expect(out[0].titelIt).toBe('Titolo IT');
    expect(out[0].botschaftDate).toBe(out[0].stand);
  });

  it('erbt rechtsgebiet vom prominentesten normKey (kleinster rang), nicht geraten', () => {
    // OR (rang 1) prominenter als DSG (rang 10) → rechtsgebiet 'privat'.
    const bindings = [
      bind({ sr: '235.1', botschaft: FGA_A, proj: PROJ_A, dateDoc: '2017-09-15', titleDe: 'X' }),
      bind({ sr: '220', botschaft: FGA_A, proj: PROJ_A, dateDoc: '2017-09-15', titleDe: 'X' }),
    ];
    expect(baueBotschaften(bindings, META)[0].rechtsgebiet).toBe('privat');
  });

  it('wählt projEli + Curia deterministisch aus dem KLEINSTEN proj (mehrere projs)', () => {
    const bindings = [
      bind({ sr: '235.1', botschaft: FGA_A, proj: 'https://fedlex.data.admin.ch/eli/proj/2016/0066', dateDoc: '2016-01-01', curia: '16.066', titleDe: 'X' }),
      bind({ sr: '235.1', botschaft: FGA_A, proj: 'https://fedlex.data.admin.ch/eli/proj/2016/0065', dateDoc: '2016-01-01', curia: '16.065', titleDe: 'X' }),
    ];
    const out = baueBotschaften(bindings, META);
    expect(out[0].projEli).toBe('https://fedlex.data.admin.ch/eli/proj/2016/0065');
    expect(out[0].nummer).toBe('16.065'); // Curia des gewählten proj (konsistent)
  });

  it('sortiert Datum absteigend (jüngste zuerst), Tiebreak key', () => {
    const bindings = [
      bind({ sr: '220', botschaft: 'https://fedlex.data.admin.ch/eli/fga/2010/1', proj: 'p1', dateDoc: '2010-01-01', titleDe: 'Alt' }),
      bind({ sr: '220', botschaft: 'https://fedlex.data.admin.ch/eli/fga/2020/1', proj: 'p2', dateDoc: '2020-01-01', titleDe: 'Neu' }),
    ];
    const out = baueBotschaften(bindings, META);
    expect(out.map((e) => e.stand)).toEqual(['2020-01-01', '2010-01-01']);
  });

  it('lässt Einträge ohne Datum oder ohne DE-Titel aus (§8-Ehrlichkeit)', () => {
    const bindings = [
      bind({ sr: '220', botschaft: 'https://fedlex.data.admin.ch/eli/fga/2020/9', proj: 'p', titleDe: 'Ohne Datum' }),
      bind({ sr: '220', botschaft: 'https://fedlex.data.admin.ch/eli/fga/2020/8', proj: 'p', dateDoc: '2020-01-01' }),
    ];
    expect(baueBotschaften(bindings, META)).toHaveLength(0);
  });

  it('ist deterministisch bei umgekehrter Bindungs-Reihenfolge', () => {
    const bindings = [
      bind({ sr: '235.1', botschaft: FGA_A, proj: 'https://fedlex.data.admin.ch/eli/proj/2016/0066', dateDoc: '2016-01-01', curia: '16.066', titleDe: 'X' }),
      bind({ sr: '235.1', botschaft: FGA_A, proj: 'https://fedlex.data.admin.ch/eli/proj/2016/0065', dateDoc: '2016-01-01', curia: '16.065', titleDe: 'X' }),
    ];
    const vor = JSON.stringify(baueBotschaften(bindings, META));
    const zurueck = JSON.stringify(baueBotschaften([...bindings].reverse(), META));
    expect(vor).toBe(zurueck);
  });
});

describe('keyAusFga / liveLink', () => {
  it('baut stabile, URL-sichere Keys aus der fga-URI', () => {
    expect(keyAusFga(FGA_A)).toBe('BOTSCHAFT-2017-2057');
    expect(keyAusFga('https://fedlex.data.admin.ch/eli/fga/1999/1_5149_4753_4457')).toBe('BOTSCHAFT-1999-1_5149_4753_4457');
  });
  it('liveLink hängt /de an und zeigt auf www.fedlex.admin.ch', () => {
    expect(liveLink(FGA_A)).toBe('https://www.fedlex.admin.ch/eli/fga/2017/2057/de');
  });
});

describe('parlamentUrlAusCuria', () => {
  it('2-stelliges Jahr → Jahrhundert korrekt', () => {
    expect(parlamentUrlAusCuria('17.059')).toBe('https://www.parlament.ch/de/ratsbetrieb/suche-curia-vista/geschaeft?AffairId=20170059');
    expect(parlamentUrlAusCuria('99.093')).toBe('https://www.parlament.ch/de/ratsbetrieb/suche-curia-vista/geschaeft?AffairId=19990093');
  });
  it('4-stelliges Jahr wird übernommen', () => {
    expect(parlamentUrlAusCuria('2000.025')).toBe('https://www.parlament.ch/de/ratsbetrieb/suche-curia-vista/geschaeft?AffairId=20000025');
  });
  it('ungültige Nummer → null', () => {
    expect(parlamentUrlAusCuria('abc')).toBeNull();
    expect(parlamentUrlAusCuria('')).toBeNull();
  });
});

describe('BOTSCHAFTEN (committet) — Struktur-Invarianten', () => {
  const erlassKeys = new Set(ERLASS_REGISTER.map((e) => e.key));
  it('jede Botschaft: BR/botschaft, projEli, botschaftDate==stand, normKeys⊆Register, Fedlex-Link', () => {
    for (const b of BOTSCHAFTEN) {
      expect(b.behoerde).toBe('BR');
      expect(b.doktyp).toBe('botschaft');
      expect(b.status).toBe('nur-live-link');
      expect(b.projEli, `${b.key} ohne projEli`).toBeTruthy();
      expect(b.botschaftDate).toBe(b.stand);
      expect(b.quelleUrl).toMatch(/^https:\/\/www\.fedlex\.admin\.ch\/eli\/fga\//);
      expect((b.normKeys ?? []).length).toBeGreaterThan(0);
      for (const nk of b.normKeys ?? []) expect(erlassKeys.has(nk), `${b.key} → unbekannter Erlass ${nk}`).toBe(true);
    }
  });
  it('Referenzfall DSG: genau 2 Botschaften (17.059 + 03.016)', () => {
    const dsg = BOTSCHAFTEN.filter((b) => (b.normKeys ?? []).includes('DSG'));
    expect(dsg).toHaveLength(2);
    expect(new Set(dsg.map((b) => b.nummer))).toEqual(new Set(['17.059', '03.016']));
  });
  it('Keys sind eindeutig', () => {
    const keys = BOTSCHAFTEN.map((b) => b.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
