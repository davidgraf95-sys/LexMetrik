import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  holeOnlineTreffer,
  artikelTrefferHref,
  entscheidTrefferHref,
  zuruecksetzenOnlineSperre,
  MIN_ZEICHEN,
  SPERRE_MS,
} from '../lib/suche/onlineVolltext';

// QS-DATA E2 (W2·6-DATA): die Online-Volltextsuche als zusätzliche Treffergruppe.
// Kern dieser Tests ist die reine Fetch-/Degradations-Logik (holeOnlineTreffer):
// 200 → Gruppe, 503/Netz/Timeout → GAR keine Gruppe (null), <3 Zeichen → kein Fetch,
// Feature-Detection-Cache (nach Ausfall ~5 min nicht erneut hämmern, dann wieder).

const BASIS = '/';

function jsonRes(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => body,
  } as unknown as Response;
}

const ARTIKEL_ANTWORT = {
  artikel: {
    treffer: [
      {
        id: 'art:OR:art_330_a',
        titel: 'Art. 330a OR',
        snippet: '… Der Arbeitgeber stellt … Zeugnis …',
        fundstelle: { erlass: 'OR', artikel: '330_a', quelleUrl: 'https://www.fedlex.admin.ch/eli/cc/27/317_321_377/de#art_330_a' },
      },
    ],
    gesamt: 3,
    naechsteSeite: null,
  },
  entscheide: {
    treffer: [
      {
        id: 'bge-150-III-1',
        titel: 'BGE 150 III 1',
        snippet: '… [Verjährung] …',
        fundstelle: { quelleUrl: 'https://www.bger.ch/...' },
      },
    ],
    gesamt: 1,
    naechsteSeite: null,
  },
};

beforeEach(() => {
  zuruecksetzenOnlineSperre();
});

describe('onlineVolltext: URL-Bildung (aus bestehenden Helfern abgeleitet)', () => {
  it('Artikel → Gesetzes-Anker-Route (Bund, #art-<artikel>, key kodiert, Anker roh)', () => {
    expect(artikelTrefferHref({ erlass: 'OR', artikel: '330_a', quelleUrl: 'x' })).toBe('/gesetze/bund/OR#art-330_a');
    // Routen-Key wird kodiert (wie universalSuche/artikelVolltext), der Anker-Token nicht.
    expect(artikelTrefferHref({ erlass: 'ArGV_1', artikel: '13', quelleUrl: 'x' })).toBe('/gesetze/bund/ArGV_1#art-13');
  });

  it('Entscheid → Entscheid-Route über die kanonische id (kodiert)', () => {
    expect(entscheidTrefferHref('bge-150-III-1')).toBe('/rechtsprechung/bge-150-III-1');
    expect(entscheidTrefferHref('BGer 4A_1/2020')).toBe('/rechtsprechung/BGer%204A_1%2F2020');
  });
});

describe('onlineVolltext: 200-Fall', () => {
  it('baut die §8-markierte Gruppe mit Artikel- + Entscheid-Treffern', async () => {
    let gerufeneUrl = '';
    const mock = vi.fn(async (url: string) => { gerufeneUrl = url; return jsonRes(ARTIKEL_ANTWORT); });
    const g = await holeOnlineTreffer('verjaehrung', { fetchImpl: mock as unknown as typeof fetch, basisUrl: BASIS });
    expect(mock).toHaveBeenCalledOnce();
    expect(gerufeneUrl).toBe('/api/suche?q=verjaehrung&limit=10');
    expect(g).not.toBeNull();
    expect(g!.id).toBe('online');
    expect(g!.hinweis).toMatch(/verlassen dafür den Browser/);
    // Artikel zuerst, dann Entscheide; gesamt = Summe der Edge-Zählungen.
    expect(g!.treffer.map((t) => t.href)).toEqual(['/gesetze/bund/OR#art-330_a', '/rechtsprechung/bge-150-III-1']);
    expect(g!.gesamt).toBe(4);
    // Kein Volltext im Treffer — nur Snippet als Untertitel (§15).
    expect(g!.treffer[0].untertitel).toContain('Zeugnis');
  });

  it('200 mit leerer Antwort → GAR keine Gruppe (null)', async () => {
    const fetchImpl = vi.fn(async () => jsonRes({ artikel: { treffer: [], gesamt: 0, naechsteSeite: null } }));
    const g = await holeOnlineTreffer('xyznichttreffer', { fetchImpl, basisUrl: BASIS });
    expect(g).toBeNull();
  });
});

describe('onlineVolltext: ehrliches Degradieren', () => {
  it('503 (Turso nicht aktiviert) → null, danach ~5 min NICHT erneut fetchen', async () => {
    const fetchImpl = vi.fn(async () => jsonRes({ fehler: 'nicht aktiviert' }, false, 503));
    const jetzt = () => 1_000;
    const g1 = await holeOnlineTreffer('verjaehrung', { fetchImpl, basisUrl: BASIS, jetzt });
    expect(g1).toBeNull();
    expect(fetchImpl).toHaveBeenCalledOnce();

    // Neue Query innerhalb des Sperr-Fensters: KEIN weiterer Fetch.
    const g2 = await holeOnlineTreffer('kuendigung', { fetchImpl, basisUrl: BASIS, jetzt: () => 1_000 + SPERRE_MS - 1 });
    expect(g2).toBeNull();
    expect(fetchImpl).toHaveBeenCalledOnce();

    // Nach Ablauf des Fensters (>5 min): wieder probieren.
    const fetchOk = vi.fn(async () => jsonRes(ARTIKEL_ANTWORT));
    const g3 = await holeOnlineTreffer('verjaehrung', { fetchImpl: fetchOk, basisUrl: BASIS, jetzt: () => 1_000 + SPERRE_MS + 1 });
    expect(fetchOk).toHaveBeenCalledOnce();
    expect(g3).not.toBeNull();
  });

  it('Netzwerkfehler → null + Sperre gesetzt', async () => {
    const fetchImpl = vi.fn(async () => { throw new Error('network down'); });
    const g = await holeOnlineTreffer('verjaehrung', { fetchImpl, basisUrl: BASIS, jetzt: () => 5_000 });
    expect(g).toBeNull();
    // Sperre aktiv → nächster Aufruf im Fenster fetcht nicht.
    const g2 = await holeOnlineTreffer('mietrecht', { fetchImpl, basisUrl: BASIS, jetzt: () => 5_100 });
    expect(g2).toBeNull();
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it('Timeout → AbortController bricht ab → null', async () => {
    // fetch, das den Abort-Signal respektiert (rejectet, wenn abgebrochen).
    const fetchImpl = vi.fn((_url: string, init?: { signal?: AbortSignal }) =>
      new Promise<Response>((_res, rej) => {
        init?.signal?.addEventListener('abort', () => rej(new DOMException('Aborted', 'AbortError')));
      }),
    ) as unknown as typeof fetch;
    const g = await holeOnlineTreffer('verjaehrung', { fetchImpl, basisUrl: BASIS, timeoutMs: 10, jetzt: () => 9_000 });
    expect(g).toBeNull();
  });
});

describe('onlineVolltext: <3-Zeichen-Fall', () => {
  it('unter MIN_ZEICHEN → kein Fetch, null', async () => {
    const fetchImpl = vi.fn(async () => jsonRes(ARTIKEL_ANTWORT));
    const kurz = 'ab'.slice(0, MIN_ZEICHEN - 1);
    const g = await holeOnlineTreffer(kurz, { fetchImpl, basisUrl: BASIS });
    expect(g).toBeNull();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('Leerraum-Padding zählt nicht (getrimmt) → kein Fetch', async () => {
    const fetchImpl = vi.fn(async () => jsonRes(ARTIKEL_ANTWORT));
    const g = await holeOnlineTreffer('  a  ', { fetchImpl, basisUrl: BASIS });
    expect(g).toBeNull();
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
