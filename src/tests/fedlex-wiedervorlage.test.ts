import { describe, it, expect } from 'vitest';
import {
  erhebe, abstraktEli, isoAusToken, deDatum,
  baueAutoBlock, schreibeVerfallMd, currencyJson,
  type ErlassBasis,
} from '../../scripts/fedlex-wiedervorlage-generieren';
import { sammleTermine } from '../../scripts/verfall-parse';
import { istRisikoPfad } from '../../scripts/gegenpruefung/kern';

// Fedlex-SPARQL-Antwort nachbilden (nur die genutzten Felder).
function fakeFetch(bindings: Array<{ eli: string; date: string }>): typeof fetch {
  return (async () => ({
    ok: true,
    json: async () => ({
      results: {
        bindings: bindings.map((b) => ({
          abstract: { value: `https://fedlex.data.admin.ch/eli/${b.eli}` },
          date: { value: `${b.date}T00:00:00` },
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
