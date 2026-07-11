import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  bundInkrafttreten, inkrafttretenJson, type ErlassBasis,
} from '../../scripts/normtext/inkrafttreten-generieren.ts';

// Fake-fetch, das eine SPARQL-Antwort mit den gegebenen Bindings liefert.
function sparqlFetch(bindings: Record<string, { value: string }>[]) {
  return (async () =>
    ({ ok: true, json: async () => ({ results: { bindings } }) }) as unknown as Response) as typeof fetch;
}

const bundE = (over: Partial<ErlassBasis> = {}): ErlassBasis => ({
  key: 'ZGB', sr: '210', ebene: 'bund', status: 'snapshot',
  quelleUrl: 'https://www.fedlex.admin.ch/eli/cc/24/233_245_233/de', ...over,
});

const ELI = 'https://fedlex.data.admin.ch/eli/cc/24/233_245_233';

describe('bundInkrafttreten — Ur-Inkrafttreten am Abstract-ELI', () => {
  it('nimmt das eindeutige dateEntryInForce des Abstracts', async () => {
    const bindings = [{ abstract: { value: ELI }, dateForce: { value: '1912-01-01' } }];
    const { map, ohne } = await bundInkrafttreten([bundE()], sparqlFetch(bindings));
    expect(ohne).toEqual([]);
    expect(map.ZGB).toEqual({ datum: '1912-01-01', quelle: 'fedlex' });
  });

  it('lässt Erlasse ohne Treffer weg (§8, kein geratenes Datum)', async () => {
    const { map, ohne } = await bundInkrafttreten([bundE()], sparqlFetch([]));
    expect(map.ZGB).toBeUndefined();
    expect(ohne).toEqual(['ZGB']);
  });

  it('lässt mehrdeutige Abstracts weg (Teil-Inkrafttreten, konservativ §7)', async () => {
    const bindings = [
      { abstract: { value: ELI }, dateForce: { value: '2022-09-01' } },
      { abstract: { value: ELI }, dateForce: { value: '2023-09-01' } },
    ];
    const { map, ohne } = await bundInkrafttreten([bundE()], sparqlFetch(bindings));
    expect(map.ZGB).toBeUndefined();
    expect(ohne).toEqual(['ZGB']);
  });

  it('kollabiert duplizierte identische Bindings (Sprach-Realisierungen) auf EIN Datum', async () => {
    const bindings = [
      { abstract: { value: ELI }, dateForce: { value: '1912-01-01' } },
      { abstract: { value: ELI }, dateForce: { value: '1912-01-01' } },
    ];
    const { map } = await bundInkrafttreten([bundE()], sparqlFetch(bindings));
    expect(map.ZGB).toEqual({ datum: '1912-01-01', quelle: 'fedlex' });
  });
});

describe('inkrafttretenJson — deterministisch, sortiert', () => {
  it('sortiert Schlüssel + Trailing-Newline', () => {
    const s = inkrafttretenJson({ OR: { datum: '1912-01-01', quelle: 'fedlex' }, BV: { datum: '2000-01-01', quelle: 'fedlex' } });
    expect(s).toBe('{\n  "BV": {\n    "datum": "2000-01-01",\n    "quelle": "fedlex"\n  },\n  "OR": {\n    "datum": "1912-01-01",\n    "quelle": "fedlex"\n  }\n}\n');
  });
});

describe('inkrafttreten.json Sidecar — Integrität + Register-Projektion', () => {
  const sidecar = JSON.parse(readFileSync('public/normtext/inkrafttreten.json', 'utf8')) as Record<string, { datum: string; quelle: string }>;
  const register = JSON.parse(readFileSync('public/normtext/register.json', 'utf8')) as { erlasse: { key: string; ebene: string; status: string; inkraftSeit?: string }[] };

  it('alle Einträge: quelle=fedlex, ISO-Datum', () => {
    for (const [key, v] of Object.entries(sidecar)) {
      expect(v.quelle, key).toBe('fedlex');
      expect(v.datum, key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('Coverage-Boden: alle Bund-Snapshots getragen (SPARQL liefert eindeutig)', () => {
    const bundSnaps = register.erlasse.filter((e) => e.ebene === 'bund' && e.status === 'snapshot');
    const getragen = bundSnaps.filter((e) => sidecar[e.key]);
    expect(getragen.length).toBe(bundSnaps.length);
    expect(bundSnaps.length).toBeGreaterThanOrEqual(227);
  });

  it('Projektion register.inkraftSeit == Sidecar-Datum; Kanton ohne Feld (§8)', () => {
    for (const e of register.erlasse) {
      if (sidecar[e.key]) expect(e.inkraftSeit, e.key).toBe(sidecar[e.key].datum);
      if (e.ebene === 'kanton') expect(e.inkraftSeit, e.key).toBeUndefined();
    }
  });

  it('bekannte Ur-Inkrafttreten (amtlich belegt)', () => {
    expect(sidecar.OR?.datum).toBe('1912-01-01');
    expect(sidecar.ZGB?.datum).toBe('1912-01-01');
    expect(sidecar.BV?.datum).toBe('2000-01-01');
    expect(sidecar.DSG?.datum).toBe('2023-09-01');
  });
});
