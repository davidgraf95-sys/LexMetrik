import { describe, it, expect } from 'vitest';
import {
  erhebe, abstraktEli, isoAusToken, deDatum,
  baueAutoBlock, schreibeVerfallMd, currencyJson,
  type ErlassBasis,
} from '../../scripts/fedlex-wiedervorlage-generieren';
import { sammleTermine } from '../../scripts/verfall-parse';
import { istRisikoPfad } from '../../scripts/gegenpruefung/kern';

// Fedlex-SPARQL-Antwort nachbilden (nur die genutzten Felder). `noLonger`
// (jolux:dateNoLongerInForce, Ganz-Aufhebung) optional je Zeile.
function fakeFetch(bindings: Array<{ eli: string; date: string; noLonger?: string }>): typeof fetch {
  return (async () => ({
    ok: true,
    json: async () => ({
      results: {
        bindings: bindings.map((b) => ({
          abstract: { value: `https://fedlex.data.admin.ch/eli/${b.eli}` },
          date: { value: `${b.date}T00:00:00` },
          ...(b.noLonger ? { noLonger: { value: `${b.noLonger}T00:00:00` } } : {}),
        })),
      },
    }),
  })) as unknown as typeof fetch;
}

const erlass = (p: Partial<ErlassBasis>): ErlassBasis => ({
  key: 'X', sr: '1', kuerzel: 'X', ebene: 'bund', status: 'snapshot',
  quelleUrl: 'https://www.fedlex.admin.ch/eli/cc/1/1/de', fassungsToken: '20260101', ...p,
});

describe('reine Helfer', () => {
  it('abstraktEli strippt Domain + /de', () => {
    expect(abstraktEli('https://www.fedlex.admin.ch/eli/cc/24/233_245_233/de')).toBe('cc/24/233_245_233');
    expect(abstraktEli('https://www.fedlex.admin.ch/eli/cc/1999/359/fr')).toBe('cc/1999/359');
    expect(abstraktEli('https://example.org/foo')).toBeNull();
  });
  it('isoAusToken + deDatum', () => {
    expect(isoAusToken('20260701')).toBe('2026-07-01');
    expect(deDatum('2026-10-01')).toBe('1.10.2026');
    expect(deDatum('2026-07-04')).toBe('4.7.2026');
  });
});

describe('erhebe()', () => {
  const erlasse: ErlassBasis[] = [
    erlass({ key: 'AAA', sr: '1', kuerzel: 'AAA', quelleUrl: 'https://www.fedlex.admin.ch/eli/cc/1/1/de', fassungsToken: '20260101' }),
    erlass({ key: 'BBB', sr: '2', kuerzel: 'BBB', quelleUrl: 'https://www.fedlex.admin.ch/eli/cc/2/2/de', fassungsToken: '20240101' }),
    erlass({ key: 'CCC', sr: '3', kuerzel: 'CCC', quelleUrl: 'https://www.fedlex.admin.ch/eli/cc/3/3/de', fassungsToken: '20250101' }),
    erlass({ key: 'KAN', ebene: 'kanton', quelleUrl: 'https://www.fedlex.admin.ch/eli/cc/9/9/de' }),
  ];
  const fetchImpl = fakeFetch([
    { eli: 'cc/1/1', date: '2026-01-01' }, { eli: 'cc/1/1', date: '2026-10-01' }, // AAA: aktuell + künftig
    { eli: 'cc/2/2', date: '2026-07-01' },                                        // BBB: überholt (pin 2024)
    { eli: 'cc/3/3', date: '2025-01-01' },                                        // CCC: aktuell, keine künftige
  ]);

  it('leitet Wiedervorlage/Currency/Überholt korrekt ab', async () => {
    const r = await erhebe(erlasse, '2026-07-04', fetchImpl);
    // AAA: aktuell + künftig 2026-10-01
    expect(r.currency.AAA).toEqual({ geprueftAm: '2026-07-04', naechsteFassungAb: '2026-10-01' });
    expect(r.wiedervorlage.find((w) => w.key === 'AAA')?.naechste).toBe('2026-10-01');
    // BBB: überholt → KEIN geprüft-Chip (§8-Ehrlichkeit), in ueberholt gelistet
    expect(r.currency.BBB).toBeUndefined();
    expect(r.ueberholt).toContainEqual({ key: 'BBB', gepinnt: '2024-01-01', geltend: '2026-07-01' });
    // CCC: aktuell, keine künftige → geprüft ohne naechsteFassungAb, nicht in Wiedervorlage
    expect(r.currency.CCC).toEqual({ geprueftAm: '2026-07-04' });
    expect(r.wiedervorlage.find((w) => w.key === 'CCC')).toBeUndefined();
    // Kanton wird ignoriert (nur bund/snapshot)
    expect(r.currency.KAN).toBeUndefined();
  });

  it('G-AUFH (#259): ganz aufgehobener Erlass wird Aufhebungs-Posten, kein geprüft-Chip', async () => {
    // BMV-Fall: latzte Konsolidierung == Pin (nicht überholt), aber ganz
    // aufgehoben (dateNoLongerInForce ≤ Laufdatum). Darf NIE als geprüft gelten.
    const erl: ErlassBasis[] = [
      erlass({ key: 'BMV', sr: '412.103.1', kuerzel: 'BMV', quelleUrl: 'https://www.fedlex.admin.ch/eli/cc/2009/423/de', fassungsToken: '20160823' }),
      erlass({ key: 'AAA', sr: '1', kuerzel: 'AAA', quelleUrl: 'https://www.fedlex.admin.ch/eli/cc/1/1/de', fassungsToken: '20260101' }),
    ];
    const f = fakeFetch([
      { eli: 'cc/2009/423', date: '2016-08-23', noLonger: '2026-03-01' }, // BMV aufgehoben
      { eli: 'cc/1/1', date: '2026-01-01' },                              // AAA lebt
    ]);
    const r = await erhebe(erl, '2026-07-18', f);
    expect(r.aufhebungen).toEqual([
      { key: 'BMV', sr: '412.103.1', kuerzel: 'BMV', gepinnt: '2016-08-23', aufgehobenSeit: '2026-03-01', kuenftig: false },
    ]);
    // §8: kein geprüft-Chip, nicht in Frische-Wiedervorlage, nicht als «überholt».
    expect(r.currency.BMV).toBeUndefined();
    expect(r.wiedervorlage.find((w) => w.key === 'BMV')).toBeUndefined();
    expect(r.ueberholt.find((u) => u.key === 'BMV')).toBeUndefined();
    // Nicht-aufgehobener Erlass bleibt unberührt.
    expect(r.currency.AAA).toEqual({ geprueftAm: '2026-07-18' });

    // AUTO-Block: Aufhebungs-Posten sichtbar; erfolgte Aufhebung landet in
    // verfall-parse NICHT als «verfallen» (letzte Spalte ohne Datum → manuell).
    const block = baueAutoBlock(r.wiedervorlage, '2026-07-18', r.aufhebungen);
    expect(block).toContain('Aufgehoben: BMV (SR 412.103.1)');
    expect(block).toContain('aufgehoben seit 1.3.2026');
    const { termine, manuell } = sammleTermine(block);
    expect(termine.some((t) => t.label.includes('BMV'))).toBe(false); // kein Termin
    expect(manuell.some((m) => m.includes('BMV'))).toBe(true);        // manueller Eintrag
  });

  it('G-AUFH: künftig angekündigte Aufhebung trägt terminiertes Datum (Vorwarnung)', async () => {
    const erl: ErlassBasis[] = [
      erlass({ key: 'FUT', sr: '9', kuerzel: 'FUT', quelleUrl: 'https://www.fedlex.admin.ch/eli/cc/5/5/de', fassungsToken: '20260101' }),
    ];
    const f = fakeFetch([{ eli: 'cc/5/5', date: '2026-01-01', noLonger: '2027-09-01' }]);
    const r = await erhebe(erl, '2026-07-18', f);
    expect(r.aufhebungen[0]).toMatchObject({ key: 'FUT', kuenftig: true, aufgehobenSeit: '2027-09-01' });
    expect(r.currency.FUT).toBeUndefined(); // §8: kein Chip trotz künftigem Repeal
    const block = baueAutoBlock(r.wiedervorlage, '2026-07-18', r.aufhebungen);
    const { termine } = sammleTermine(block);
    expect(termine.find((t) => t.label.includes('FUT'))?.datum).toBe('2027-09-01');
  });

  it('sortiert Wiedervorlage nach Datum, dann SR', async () => {
    const zwei: ErlassBasis[] = [
      erlass({ key: 'SPÄT', sr: '9', quelleUrl: 'https://www.fedlex.admin.ch/eli/cc/1/1/de' }),
      erlass({ key: 'FRÜH', sr: '1', quelleUrl: 'https://www.fedlex.admin.ch/eli/cc/2/2/de' }),
    ];
    const f = fakeFetch([
      { eli: 'cc/1/1', date: '2027-01-01' },
      { eli: 'cc/2/2', date: '2026-08-01' },
    ]);
    const r = await erhebe(zwei, '2026-07-04', f);
    expect(r.wiedervorlage.map((w) => w.key)).toEqual(['FRÜH', 'SPÄT']);
  });
});

describe('AUTO-Block ist Verfall-grammatik-konform', () => {
  it('erzeugt parsbare Termine (letzte Spalte = künftiges Datum)', () => {
    const block = baueAutoBlock(
      [{ key: 'OR', sr: '220', kuerzel: 'OR', gepinnt: '2026-01-01', naechste: '2026-10-01' }],
      '2026-07-04',
    );
    const { termine } = sammleTermine(block);
    const t = termine.find((x) => x.label.includes('OR'));
    expect(t?.datum).toBe('2026-10-01'); // aus der letzten Spalte «1.10.2026»
    // Header-Zeile («Nächste Prüfung») darf NICHT als Termin auftauchen
    expect(termine.some((x) => x.label.includes('Nächste Prüfung'))).toBe(false);
  });
});

describe('schreibeVerfallMd idempotent', () => {
  const md = 'Kopf\n\n## Konventionen\n1. x\n';
  it('fügt vor «## Konventionen» ein und ersetzt beim zweiten Lauf (nie appenden)', () => {
    const b1 = baueAutoBlock([{ key: 'A', sr: '1', kuerzel: 'A', gepinnt: '2026-01-01', naechste: '2026-09-01' }], '2026-07-04');
    const eins = schreibeVerfallMd(md, b1);
    const b2 = baueAutoBlock([{ key: 'A', sr: '1', kuerzel: 'A', gepinnt: '2026-01-01', naechste: '2026-12-01' }], '2026-07-05');
    const zwei = schreibeVerfallMd(eins, b2);
    expect((zwei.match(/AUTO fedlex-wiedervorlage -->/g) ?? []).length).toBe(2); // genau EIN Block (Start+Ende)
    expect(zwei).toContain('1.12.2026');
    expect(zwei).not.toContain('1.9.2026'); // alter Block ersetzt, nicht dupliziert
    expect(zwei).toContain('## Konventionen');
  });
});

describe('currencyJson ist deterministisch sortiert', () => {
  it('sortiert Schlüssel + endet mit Newline', () => {
    const j = currencyJson({ ZGB: { geprueftAm: '2026-07-04' }, OR: { geprueftAm: '2026-07-04', naechsteFassungAb: '2026-10-01' } });
    expect(j.endsWith('\n')).toBe(true);
    expect(j.indexOf('"OR"')).toBeLessThan(j.indexOf('"ZGB"'));
  });
});

describe('istRisikoPfad deckt scripts/fedlex-* (Gegenprüfungs-Glob)', () => {
  it('triggert für die Wurzel-Fedlex-Skripte', () => {
    expect(istRisikoPfad('scripts/fedlex-cache.sh')).toBe(true);
    expect(istRisikoPfad('scripts/fedlex-wiedervorlage-generieren.ts')).toBe(true);
    expect(istRisikoPfad('scripts/fedlex-sparql.ts')).toBe(true);
    expect(istRisikoPfad('scripts/fedlex-pins.ts')).toBe(true);
    // currency.json ist über die public/normtext-Regel bereits Risiko-Pfad
    expect(istRisikoPfad('public/normtext/currency.json')).toBe(true);
    // Gegenprobe: fremdes Skript bleibt aussen vor
    expect(istRisikoPfad('scripts/plz-generieren.ts')).toBe(false);
  });
});
