// E1 «Entstehung am Artikel» (FAHRPLAN-MATERIALIEN-VERZAHNUNG §11.4/§11.7):
// die Verfahrenskette einer Vorlage aus dem Fedlex-Projektgraphen.
//
// Geprüft wird das, was fachlich falsch werden KANN (§6.7): die feste amtliche
// Code-Tabelle (unbekannter Code ⇒ rot, nie stillschweigend «sonstiges»), die
// Vereinigung JE FGA statt je proj (Kritik A12, Mantelerlass-Fehlalarm) und die
// byte-stabile Sortierung (§2 Determinismus).
import { describe, it, expect } from 'vitest';
import {
  TYPE_PROJET, verfahrensTypVonCode, verfahrensLabel, verfahrensQuelleUrl,
  type VerfahrensEreignis,
} from '../lib/materialien/verfahren';
import {
  baueEreignisse, ereignisseJeBotschaft, codeAusTypUri, eliKurz, baueEreignisQuery,
} from '../../scripts/materialien/verfahrens-ereignisse';
import type { SparqlBinding } from '../../scripts/fedlex-sparql';
import { BOTSCHAFTEN } from '../lib/materialien/botschaften.generated';

const V = 'https://fedlex.data.admin.ch/vocabulary/type-projet/';
const P = 'https://fedlex.data.admin.ch/eli/dl/proj/';
const b = (proj: string, code: number, datum?: string, res?: string): SparqlBinding => ({
  proj: { value: P + proj },
  ev: { value: `${P}${proj}/event/${code}` },
  evType: { value: V + code },
  ...(datum ? { evDate: { value: datum } } : {}),
  ...(res ? { evRes: { value: 'https://fedlex.data.admin.ch/eli/' + res } } : {}),
});

describe('type-projet — feste amtliche Tabelle', () => {
  it('deckt das vollständige Vokabular ab (26 Codes, Abruf 11.9.2026)', () => {
    expect(Object.keys(TYPE_PROJET)).toHaveLength(26);
    expect(verfahrensTypVonCode(200)).toBe('botschaft');
    expect(verfahrensTypVonCode(300)).toBe('beschluss-parlament');
    expect(verfahrensTypVonCode(400)).toBe('referendumsfrist');
  });

  it('macht einen unbekannten Code ROT statt ihn zu raten (§2)', () => {
    expect(() => verfahrensTypVonCode(999)).toThrow(/unbekannter type-projet-Code 999/);
  });

  it('zitiert das amtliche Etikett unverändert (§1) und baut den Live-Link (§7c)', () => {
    const e: VerfahrensEreignis = { code: 200, datum: '2017-09-15', res: 'fga/2017/2057' };
    expect(verfahrensLabel(e)).toBe('Botschaft des Bundesrats');
    expect(verfahrensQuelleUrl(e)).toBe('https://www.fedlex.admin.ch/eli/fga/2017/2057/de');
    expect(verfahrensQuelleUrl({ code: 400, datum: '2021-01-14' })).toBeNull();
  });

  it('codeAusTypUri / eliKurz sind streng', () => {
    expect(codeAusTypUri(V + '650')).toBe(650);
    expect(() => codeAusTypUri('https://example.org/foo/1')).toThrow(/unerwartete type-projet-URI/);
    expect(eliKurz('https://fedlex.data.admin.ch/eli/fga/2020/1998')).toBe('fga/2020/1998');
    expect(eliKurz('https://example.org/x')).toBe('https://example.org/x');
  });

  it('die Query nennt weder UNION noch STRSTARTS (§0c-Falle)', () => {
    const q = baueEreignisQuery('<a> <b>');
    expect(q).toContain('jolux:draftHasLegislativeTask');
    expect(q).not.toMatch(/UNION|STRSTARTS/);
  });
});

describe('baueEreignisse — Determinismus (§2)', () => {
  it('sortiert nach Datum, dann Code, dann Publikation; undatiert zuletzt', () => {
    const ev = baueEreignisse([
      b('8022/0491', 400, '2021-01-14'),
      b('8022/0491', 1),
      b('8022/0491', 200, '2017-09-15', 'fga/2017/2057'),
      b('8022/0491', 300, '2020-09-25', 'fga/2020/1998'),
    ]).get(P + '8022/0491')!;
    expect(ev.map((e) => e.code)).toEqual([200, 300, 400, 1]);
    expect(ev[0]).toEqual({ code: 200, datum: '2017-09-15', res: 'fga/2017/2057' });
  });

  it('ist reihenfolge-unabhängig (Endpunkt liefert ohne ORDER BY)', () => {
    const roh = [b('1/1', 300, '2020-09-25'), b('1/1', 200, '2017-09-15'), b('1/1', 8, '2016-12-28')];
    const a = baueEreignisse(roh).get(P + '1/1')!;
    const c = baueEreignisse([...roh].reverse()).get(P + '1/1')!;
    expect(JSON.stringify(a)).toBe(JSON.stringify(c));
  });

  it('dedupliziert mehrfach gebundene Event-Knoten', () => {
    const ev = baueEreignisse([b('1/1', 200, '2017-09-15', 'fga/2017/2057'), b('1/1', 200, '2017-09-15', 'fga/2017/2057')]);
    expect(ev.get(P + '1/1')).toHaveLength(1);
  });

  it('speichert KEINEN abgeleiteten Schlüssel (§5) — nur code/datum/res', () => {
    const ev = baueEreignisse([b('1/1', 200, '2017-09-15')]).get(P + '1/1')!;
    expect(Object.keys(ev[0]).sort()).toEqual(['code', 'datum']);
  });
});

describe('ereignisseJeBotschaft — Vereinigung JE FGA (Kritik A12)', () => {
  it('vereinigt die Ereignisse aller Projekt-Knoten einer Botschaft, ohne Duplikate', () => {
    const proProj = baueEreignisse([
      b('2016/0065', 200, '2016-06-01', 'fga/2016/467'),
      b('2016/0065', 300, '2017-03-17'),
      b('2016/0066', 200, '2016-06-01', 'fga/2016/467'),
      b('2016/0066', 400, '2017-07-06'),
    ]);
    const ev = ereignisseJeBotschaft([P + '2016/0066', P + '2016/0065'], proProj);
    expect(ev.map((e) => e.code)).toEqual([200, 300, 400]);
    expect(JSON.stringify(ereignisseJeBotschaft([P + '2016/0065', P + '2016/0066'], proProj)))
      .toBe(JSON.stringify(ev));
  });
});

describe('botschaften.generated — Ist-Stand der Verfahrensketten', () => {
  it('jede Botschaft trägt ≥1 Ereignis, jedes mit gültigem Code und ISO-Datum', () => {
    expect(BOTSCHAFTEN.length).toBeGreaterThan(300);
    for (const bo of BOTSCHAFTEN) {
      expect(bo.ereignisse?.length ?? 0).toBeGreaterThan(0);
      for (const e of bo.ereignisse ?? []) {
        expect(() => verfahrensTypVonCode(e.code)).not.toThrow();
        if (e.datum) expect(e.datum).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        if (e.res) expect(e.res).not.toMatch(/^https?:/);
      }
    }
  });

  it('trägt für jede Botschaft den Schritt «Botschaft des Bundesrats» (Code 200)', () => {
    const ohne = BOTSCHAFTEN.filter((bo) => !(bo.ereignisse ?? []).some((e) => e.code === 200));
    expect(ohne.map((bo) => bo.key)).toEqual([]);
  });
});
