import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  ladeHistorieShard,
  historieFuerArtikel,
  _leereHistorieCache,
  type HistorieShard,
} from '../lib/normtext/historie-laden';

// G-HIST-UI · Client-Loader der Per-Artikel-Historie-Shards. Reine Ladeschicht (§3):
// EIN Fetch je Erlass (gecacht), 404 = still null, transienter Fehler NICHT
// dauerhaft gecacht (Neuversuch), direkter Roh-Token-Lookup. Kein Parsen hier.

const SHARD: HistorieShard = {
  erlass: 'BGBM',
  abdeckung: { fussnoten: 3, ereignis: 2, referenz: 1, unparsed: 0 },
  artikel: {
    '2': {
      giltSeit: '2025-01-01',
      ereignisse: [
        { typ: 'eingefuegt', datum: null, wirkung: false, quellen: [{ label: 'AS 2024 1', url: 'https://x/1' }], absatz: '1', item: null },
        { typ: 'fassung', datum: '2025-01-01', wirkung: false, quellen: [], absatz: null, item: null },
      ],
    },
    '9': {
      giltSeit: '2010-06-01',
      aufgehobenSeit: '2020-01-01',
      ereignisse: [{ typ: 'aufgehoben', datum: '2020-01-01', wirkung: true, quellen: [], absatz: null, item: null }],
    },
  },
  residuum: [],
};

function mockFetch(status: number, body?: unknown, opts: { wirft?: boolean } = {}) {
  return vi.fn(async () => {
    if (opts.wirft) throw new Error('Netz-Blip');
    return {
      status,
      ok: status >= 200 && status < 300,
      json: async () => body,
    } as Response;
  });
}

beforeEach(() => { _leereHistorieCache(); });
afterEach(() => { vi.restoreAllMocks(); });

describe('ladeHistorieShard', () => {
  it('lädt den Shard und cacht (nur EIN Fetch je Key)', async () => {
    const f = mockFetch(200, SHARD);
    vi.stubGlobal('fetch', f);
    const a = await ladeHistorieShard('BGBM');
    const b = await ladeHistorieShard('BGBM');
    expect(a).toEqual(SHARD);
    expect(b).toBe(a);
    expect(f).toHaveBeenCalledTimes(1);
    expect(f).toHaveBeenCalledWith('/normtext/historie/BGBM.json');
  });

  it('404 (kein Shard) → null, still (kein throw)', async () => {
    vi.stubGlobal('fetch', mockFetch(404));
    expect(await ladeHistorieShard('OHNE')).toBeNull();
  });

  it('transienter Fehler wird NICHT dauerhaft gecacht (Neuversuch möglich)', async () => {
    const wirft = mockFetch(200, undefined, { wirft: true });
    vi.stubGlobal('fetch', wirft);
    expect(await ladeHistorieShard('OR')).toBeNull();
    // Zweiter Versuch: jetzt erfolgreich → kein toter Cache-Eintrag.
    vi.stubGlobal('fetch', mockFetch(200, SHARD));
    expect(await ladeHistorieShard('OR')).toEqual(SHARD);
  });

  it('5xx → null (kein throw), Cache-Eintrag verworfen', async () => {
    vi.stubGlobal('fetch', mockFetch(503));
    expect(await ladeHistorieShard('OR')).toBeNull();
    vi.stubGlobal('fetch', mockFetch(200, SHARD));
    expect(await ladeHistorieShard('OR')).toEqual(SHARD);
  });
});

describe('historieFuerArtikel', () => {
  it('direkter Roh-Token-Lookup', () => {
    expect(historieFuerArtikel(SHARD, '2')?.giltSeit).toBe('2025-01-01');
    expect(historieFuerArtikel(SHARD, '9')?.aufgehobenSeit).toBe('2020-01-01');
  });
  it('Artikel ohne Eintrag → undefined (kein Badge)', () => {
    expect(historieFuerArtikel(SHARD, '1')).toBeUndefined();
  });
  it('null/undefined Shard → undefined', () => {
    expect(historieFuerArtikel(null, '2')).toBeUndefined();
    expect(historieFuerArtikel(undefined, '2')).toBeUndefined();
  });
});
