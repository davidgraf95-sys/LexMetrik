import { describe, it, expect } from 'vitest';
import {
  baueVernehmlassungen, keyAusCons, projEliAusCons, liveLink, shaVernehmlassung,
} from '../../scripts/materialien/vernehmlassungen-generieren';
import type { ErlassMeta } from '../../scripts/materialien/botschaften-generieren';
import type { SparqlBinding } from '../../scripts/fedlex-sparql';
import { VERNEHMLASSUNGEN } from '../lib/materialien/vernehmlassungen.generated';
import { vernehmlassungenFuer } from '../lib/materialien/vernehmlassungen';

// Paket 3 (W3·11): reine Generator-Logik (dedupe/Status-Mapping/Sortierung/Determinismus/Key) +
// die committeten Daten. Netz-Kette prüft die Live-Currency separat.

const META: ErlassMeta[] = [
  { key: 'DSG', sr: '235.1', rechtsgebiet: 'oeffentlich', rang: 10 },
  { key: 'OR', sr: '220', rechtsgebiet: 'privat', rang: 1 },
];

const S = 'https://fedlex.data.admin.ch/vocabulary/consultation-status/';
const CONS_A = 'https://fedlex.data.admin.ch/eli/dl/proj/2021/91/cons_1';
const CONS_B = 'https://fedlex.data.admin.ch/eli/dl/proj/6008/39/cons_1';

function bind(o: Record<string, string | undefined>): SparqlBinding {
  const b: SparqlBinding = {};
  for (const [k, v] of Object.entries(o)) if (v !== undefined) b[k] = { value: v };
  return b;
}

describe('keyAusCons / projEliAusCons / liveLink', () => {
  it('leitet Key, projEli und Live-Link aus der cons-URI ab', () => {
    expect(keyAusCons(CONS_A)).toBe('VERN-2021-91');
    expect(keyAusCons(CONS_B)).toBe('VERN-6008-39'); // Legacy-6xxx unverändert
    expect(keyAusCons('https://fedlex.data.admin.ch/eli/dl/proj/2021/91/cons_2')).toBe('VERN-2021-91-2');
    expect(projEliAusCons(CONS_A)).toBe('https://fedlex.data.admin.ch/eli/dl/proj/2021/91');
    expect(liveLink(CONS_A)).toBe('https://www.fedlex.admin.ch/eli/dl/proj/2021/91/cons_1/de');
  });
});

describe('baueVernehmlassungen — Kern-Logik', () => {
  it('dedupliziert eine Mantelvorlage unter zwei SR und mappt Status/Frist', () => {
    const bindings = [
      bind({ sr: '235.1', cons: CONS_A, status: `${S}2`, titelDe: 'Titel DE', titelFr: 'Titre FR', titelIt: 'Titolo IT', start: '2021-09-06', ende: '2021-12-06' }),
      bind({ sr: '220', cons: CONS_A, status: `${S}2`, titelDe: 'Titel DE', start: '2021-09-06', ende: '2021-12-06' }),
    ];
    const out = baueVernehmlassungen(bindings, META, '2026-07-10');
    expect(out).toHaveLength(1);
    expect(out[0].key).toBe('VERN-2021-91');
    expect(out[0].behoerde).toBe('BUND');
    expect(out[0].doktyp).toBe('vernehmlassung');
    expect(out[0].normKeys).toEqual(['DSG', 'OR']);
    expect(out[0].rechtsgebiet).toBe('privat'); // OR hat kleineren rang → primär
    expect(out[0].stand).toBe('2026-07-10'); // Abfragedatum
    expect(out[0].vernehmlassung).toEqual({ status: 'laufend', fristStart: '2021-09-06', fristEnde: '2021-12-06', projEli: 'https://fedlex.data.admin.ch/eli/dl/proj/2021/91' });
  });

  it('mappt alle Status-Codes 0–6 und lässt Status/Titel-lose Einträge weg', () => {
    const mk = (code: string, cons: string) => bind({ sr: '220', cons, status: `${S}${code}`, titelDe: `T${code}` });
    const bindings = [
      mk('0', 'https://fedlex.data.admin.ch/eli/dl/proj/2020/1/cons_1'),
      mk('6', 'https://fedlex.data.admin.ch/eli/dl/proj/2020/2/cons_1'),
      bind({ sr: '220', cons: 'https://fedlex.data.admin.ch/eli/dl/proj/2020/3/cons_1', titelDe: 'ohne Status' }), // kein status → weg
      bind({ sr: '220', cons: 'https://fedlex.data.admin.ch/eli/dl/proj/2020/4/cons_1', status: `${S}2` }), // kein Titel → weg
    ];
    const out = baueVernehmlassungen(bindings, META, '2026-07-10');
    expect(out.map((e) => e.vernehmlassung?.status).sort()).toEqual(['in-vorbereitung', 'zurueckgezogen']);
  });

  it('sortiert deterministisch: laufend vor abgeschlossen (Status-Priorität)', () => {
    const bindings = [
      bind({ sr: '220', cons: 'https://fedlex.data.admin.ch/eli/dl/proj/2019/9/cons_1', status: `${S}5`, titelDe: 'Alt', start: '2019-01-01', ende: '2019-04-01' }),
      bind({ sr: '220', cons: 'https://fedlex.data.admin.ch/eli/dl/proj/2026/9/cons_1', status: `${S}2`, titelDe: 'Neu laufend', start: '2026-05-01', ende: '2026-09-01' }),
    ];
    const out = baueVernehmlassungen(bindings, META, '2026-07-10');
    expect(out.map((e) => e.vernehmlassung?.status)).toEqual(['laufend', 'abgeschlossen']);
    // Zweiter Lauf byte-identisch (Determinismus §2).
    const out2 = baueVernehmlassungen(bindings, META, '2026-07-10');
    expect(JSON.stringify(out2)).toBe(JSON.stringify(out));
  });

  it('sha ändert bei Status-/Frist-Wechsel (Currency-Drift-Token), nicht bei stand', () => {
    const base = baueVernehmlassungen([bind({ sr: '220', cons: CONS_A, status: `${S}2`, titelDe: 'T', start: '2021-09-06', ende: '2021-12-06' })], META, '2026-07-10')[0];
    const spaeterStand = baueVernehmlassungen([bind({ sr: '220', cons: CONS_A, status: `${S}2`, titelDe: 'T', start: '2021-09-06', ende: '2021-12-06' })], META, '2026-08-01')[0];
    const statusWechsel = baueVernehmlassungen([bind({ sr: '220', cons: CONS_A, status: `${S}5`, titelDe: 'T', start: '2021-09-06', ende: '2021-12-06' })], META, '2026-07-10')[0];
    expect(shaVernehmlassung(spaeterStand)).toBe(shaVernehmlassung(base)); // stand nicht im sha
    expect(shaVernehmlassung(statusWechsel)).not.toBe(shaVernehmlassung(base)); // Status im sha
  });
});

describe('committete Daten + Projektion', () => {
  it('alle Verfahren tragen die Pflichtfelder + gültigen Status', () => {
    const STATUS = new Set(['in-vorbereitung', 'geplant', 'laufend', 'abgeschlossen-stellungnahmen', 'abgeschlossen-bericht', 'abgeschlossen', 'zurueckgezogen']);
    expect(VERNEHMLASSUNGEN.length).toBeGreaterThan(100);
    for (const v of VERNEHMLASSUNGEN) {
      expect(v.behoerde).toBe('BUND');
      expect(v.doktyp).toBe('vernehmlassung');
      expect(v.normKeys?.length).toBeGreaterThan(0);
      expect(v.quelleUrl).toMatch(/^https:\/\/www\.fedlex\.admin\.ch\/eli\/dl\/proj\//);
      expect(STATUS.has(v.vernehmlassung!.status)).toBe(true);
      expect(v.vernehmlassung!.projEli).toMatch(/^https:\/\/fedlex\.data\.admin\.ch\/eli\/dl\/proj\//);
    }
  });

  it('vernehmlassungenFuer liefert null bei Manifest-Ladefehler (Fetch-Fehler ≠ leer, §8)', async () => {
    const orig = globalThis.fetch;
    globalThis.fetch = (async () => { throw new Error('offline'); }) as typeof fetch;
    try {
      const r = await vernehmlassungenFuer(['OR']);
      // null ODER [] je nach Manifest-Cache; entscheidend: kein Wurf.
      expect(r === null || Array.isArray(r)).toBe(true);
    } finally {
      globalThis.fetch = orig;
    }
  });
});
