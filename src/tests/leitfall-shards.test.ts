import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { baueArtikelIndex, baueShards, schreibeKorpus } from '../../scripts/normtext/entscheide-schreiben';
import {
  ladeLeitfallShard, leitfaelleFuerArtikel, rechtsprechungFuerArtikel, _leereShardCache,
  type LeitfallRef, type LeitfallShard, type NormEntscheidIndex,
} from '../lib/rechtsprechung/norm-index';
import type { EntscheidSnapshot } from '../lib/rechtsprechung/typen';

// ── Schaufenster-Shards (Weiche B, FAHRPLAN-DATENHALTUNG §11.2/§10(6)) ──────────
// Getestet: (1) der Generator splittet proNormArtikel byte-korrekt je Erlass;
// (2) die erlass-lokale Lade-Funktion liefert dieselben Refs wie das Gesamt-JSON
// (Zweitbeweis) und teilt EINEN fetch je Erlass (Promise-Cache); (3) die committeten
// Shards auf der Platte == rechtsprechungFuerArtikel() für 3 Beispiel-Artikel.

function snap(o: Partial<EntscheidSnapshot> & Pick<EntscheidSnapshot, 'id'>): EntscheidSnapshot {
  return {
    gericht: 'bge', gerichtName: 'Bundesgericht', gerichtstyp: 'bundesgericht',
    kanton: 'CH', abteilung: null, nummer: '', bgeReferenz: null,
    zitierung: o.id, datum: '2026-01-01', sprache: 'de', leitcharakter: 'leitentscheid',
    sachgebiet: 'privat', legalArea: null, rubrum: null, regeste: null, regesteAmtlich: true,
    abschnitte: [{ typ: 'erwaegung', bloecke: [{ marke: null, text: 'x' }] }],
    dispositivOrders: [], zitierteNormen: [], normKeys: [], zitierteEntscheide: [],
    bestand: 'snapshot', kuratierung: 'maschinell', quelle: 'opencaselaw',
    quelleUrl: 'https://www.bger.ch', abgerufen: '2026-01-01', fassungsToken: 'h', sha: 's',
    ...o,
  };
}
function bge(fundstelle: string, over: Partial<EntscheidSnapshot> = {}): EntscheidSnapshot {
  const slug = fundstelle.replace(/\s+/g, '_');
  return snap({ id: `bund/bge/${slug}`, gericht: 'bge', bgeReferenz: fundstelle, nummer: fundstelle, zitierung: `BGE ${fundstelle}`, ...over });
}

describe('baueShards — proNormArtikel je Erlass splitten (deterministisch)', () => {
  const A = bge('150 III 1', { zitierteNormen: ['Art. 41 OR'], zitierteEntscheide: ['BGE 150 III 3'] });
  const C = bge('150 III 3', { zitierteNormen: ['Art. 41 OR', 'Art. 12 StGB'] });
  const proNormArtikel = baueArtikelIndex([A, C]);
  const shards = baueShards(proNormArtikel, '2026-07-02');

  it('EIN Shard je Erlass mit Artikel-Treffern', () => {
    expect([...shards.keys()].sort()).toEqual(['OR', 'STGB']);
    expect(shards.get('OR')!.erlass).toBe('OR');
    expect(shards.get('OR')!.erzeugt).toBe('2026-07-02');
  });

  it('Shard-Schlüssel = blosses Artikel-Token (Präfix im Dateinamen), Refs unverändert', () => {
    expect(Object.keys(shards.get('OR')!.proArtikel)).toEqual(['41']);
    expect(shards.get('OR')!.proArtikel['41']).toEqual(proNormArtikel['OR/41']);
    expect(shards.get('STGB')!.proArtikel['12']).toEqual(proNormArtikel['STGB/12']);
  });

  it('Vereinigung aller Shards == proNormArtikel (kein Datenverlust/-drift)', () => {
    const union: Record<string, LeitfallRef[]> = {};
    for (const [erlass, s] of shards) for (const [tok, refs] of Object.entries(s.proArtikel)) union[`${erlass}/${tok}`] = refs;
    expect(union).toEqual(proNormArtikel);
  });
});

describe('schreibeKorpus — Shards als committete Dateien', () => {
  it('schreibt public/rechtsprechung/norm-index/<ERLASS>.json (Trailing-Newline, 2-Space)', () => {
    const root = mkdtempSync(join(tmpdir(), 'lexm-shard-'));
    mkdirSync(join(root, 'src', 'lib', 'rechtsprechung'), { recursive: true });
    try {
      const A = bge('150 III 1', { normKeys: ['OR'], zitierteNormen: ['Art. 41 OR'], zitierteEntscheide: ['BGE 150 III 3'] });
      const C = bge('150 III 3', { normKeys: ['OR'], zitierteNormen: ['Art. 41 OR'] });
      const res = schreibeKorpus([A, C], '2026-07-02', root);
      expect(res.shards).toBe(1);

      const shardPfad = join(root, 'public', 'rechtsprechung', 'norm-index', 'OR.json');
      expect(existsSync(shardPfad)).toBe(true);
      const roh = readFileSync(shardPfad, 'utf8');
      expect(roh.endsWith('}\n')).toBe(true);                       // Trailing-Newline
      expect(roh).toBe(JSON.stringify(JSON.parse(roh), null, 2) + '\n'); // 2-Space kanonisch

      // Shard == Artikel-Ebene des Gesamt-JSON.
      const shard = JSON.parse(roh) as LeitfallShard;
      const gesamt = JSON.parse(readFileSync(join(root, 'public', 'rechtsprechung', 'norm-index.json'), 'utf8')) as NormEntscheidIndex;
      expect(shard.proArtikel['41']).toEqual(gesamt.proNormArtikel!['OR/41']);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe('leitfaelleFuerArtikel — erlass-lokale Lade-Funktion (Promise-Cache)', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  const shard: LeitfallShard = {
    erzeugt: '2026-07-02', erlass: 'OR',
    proArtikel: {
      '41': [{ key: 'bge_150_III_3', zitierung: 'BGE 150 III 3', regesteKurz: null, datum: '2026-01-01', leitcharakter: 'leitentscheid', gericht: 'bge', kanton: 'CH', gewicht: 1 }],
    },
  };

  beforeEach(() => {
    _leereShardCache();
    fetchMock = vi.fn(async (url: string) => {
      if (url === '/rechtsprechung/norm-index/OR.json') return { ok: true, json: async () => shard } as Response;
      return { ok: false, json: async () => ({}) } as Response;
    });
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => { vi.unstubAllGlobals(); _leereShardCache(); });

  it('lädt den Shard des Erlasses und liefert die Refs zum Token', async () => {
    expect(await leitfaelleFuerArtikel('OR', '41')).toEqual(shard.proArtikel['41']);
    expect(fetchMock).toHaveBeenCalledWith('/rechtsprechung/norm-index/OR.json');
  });

  it('normalisiert das Artikel-Token wie der Build (whitespace-frei, klein)', async () => {
    // normArtikelToken: nur lower + whitespace-frei (identisch zu rechtsprechungFuerArtikel).
    expect(await leitfaelleFuerArtikel('OR', ' 41 ')).toEqual(shard.proArtikel['41']);
  });

  it('EIN fetch je Erlass — alle Artikel desselben Erlasses teilen den Promise', async () => {
    await Promise.all([leitfaelleFuerArtikel('OR', '41'), leitfaelleFuerArtikel('OR', '99'), ladeLeitfallShard('OR')]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('unbekannter Artikel im Shard → []', async () => {
    expect(await leitfaelleFuerArtikel('OR', '9999')).toEqual([]);
  });

  it('kein Shard (Erlass ohne Treffer) → [] (kein Wurf)', async () => {
    expect(await leitfaelleFuerArtikel('ZGB', '1')).toEqual([]);
  });
});

describe('Zweitbeweis — committete Shards == rechtsprechungFuerArtikel() (3 Artikel)', () => {
  // Unabhängiger Pfad: das GESAMT-JSON via rechtsprechungFuerArtikel() (fetch gemockt
  // auf norm-index.json von der Platte) gegen den erlass-lokalen Shard von der Platte.
  const PUB = 'public/rechtsprechung';
  const gesamt = JSON.parse(readFileSync(join(PUB, 'norm-index.json'), 'utf8')) as NormEntscheidIndex;

  function shardRefs(erlass: string, token: string): LeitfallRef[] {
    const p = join(PUB, 'norm-index', `${erlass}.json`);
    if (!existsSync(p)) return [];
    return (JSON.parse(readFileSync(p, 'utf8')) as LeitfallShard).proArtikel[token] ?? [];
  }

  beforeEach(() => {
    _leereShardCache();
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      if (url === '/rechtsprechung/norm-index.json') return { ok: true, json: async () => gesamt } as Response;
      const m = /\/rechtsprechung\/norm-index\/([^/]+)\.json$/.exec(url);
      if (m) {
        const p = join(PUB, 'norm-index', `${decodeURIComponent(m[1])}.json`);
        if (existsSync(p)) return { ok: true, json: async () => JSON.parse(readFileSync(p, 'utf8')) } as Response;
      }
      return { ok: false, json: async () => ({}) } as Response;
    }));
  });
  afterEach(() => { vi.unstubAllGlobals(); _leereShardCache(); });

  // (a) OR/41 — vorhanden (privatrechtlicher Kern). (b) ZGB/1 — vorhanden (mit BGE).
  // (c) OR/9999 — ohne Leitfälle.
  for (const [erlass, artikel] of [['OR', '41'], ['ZGB', '1'], ['OR', '9999']] as const) {
    it(`${erlass}/${artikel}: Shard == Gesamt-JSON == Lade-Funktion`, async () => {
      const sollGesamt = gesamt.proNormArtikel![`${erlass}/${artikel}`] ?? [];
      expect(shardRefs(erlass, artikel)).toEqual(sollGesamt);                 // Platte: Shard == Gesamt
      expect(await rechtsprechungFuerArtikel(erlass, artikel)).toEqual(sollGesamt);
      expect(await leitfaelleFuerArtikel(erlass, artikel)).toEqual(sollGesamt); // Lade-Funktion == Gesamt
    });
  }
});
