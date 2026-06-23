/**
 * Tests für fetchMitWiederholung — die Retry-/Timeout-Hülle (kein echtes Netz,
 * keine echte Zeit: fetchImpl + warte sind injiziert, §2). Deckt die Regression
 * ab, an der ein einzelner LexFind-ETIMEDOUT den GR-Discovery-Lauf killte.
 */

import { describe, it, expect } from 'vitest';
import {
  fetchMitWiederholung,
  istWiederholbarerStatus,
} from '../../scripts/normtext/netz-retry.ts';

/** Minimal-Response mit nur den vom Code genutzten Feldern. */
function antwort(status: number): Response {
  return { ok: status >= 200 && status < 300, status, json: async () => ({}) } as unknown as Response;
}

/**
 * Baut ein fetch, das die übergebene Skript-Liste der Reihe nach abarbeitet:
 * eine Zahl → Response mit diesem Status; ein Error → wird geworfen.
 * Zählt die Aufrufe in `n`.
 */
function fakeFetch(skript: Array<number | Error>): { fetch: typeof fetch; n: () => number } {
  let i = 0;
  const impl = async (): Promise<Response> => {
    const schritt = skript[Math.min(i, skript.length - 1)];
    i++;
    if (schritt instanceof Error) throw schritt;
    return antwort(schritt);
  };
  return { fetch: impl as unknown as typeof fetch, n: () => i };
}

const keineWarte = async (): Promise<void> => {};

describe('istWiederholbarerStatus', () => {
  it('429 und 5xx sind transient, 2xx/4xx nicht', () => {
    expect(istWiederholbarerStatus(429)).toBe(true);
    expect(istWiederholbarerStatus(500)).toBe(true);
    expect(istWiederholbarerStatus(503)).toBe(true);
    expect(istWiederholbarerStatus(200)).toBe(false);
    expect(istWiederholbarerStatus(404)).toBe(false);
  });
});

describe('fetchMitWiederholung', () => {
  it('gibt beim ersten Erfolg sofort zurück (kein Retry)', async () => {
    const { fetch, n } = fakeFetch([200]);
    const res = await fetchMitWiederholung('u', undefined, { fetchImpl: fetch, warte: keineWarte });
    expect(res.status).toBe(200);
    expect(n()).toBe(1);
  });

  it('wiederholt nach geworfenem Netz-Fehler und liefert dann den Erfolg', async () => {
    const { fetch, n } = fakeFetch([new Error('ETIMEDOUT'), 200]);
    const res = await fetchMitWiederholung('u', undefined, { fetchImpl: fetch, warte: keineWarte });
    expect(res.status).toBe(200);
    expect(n()).toBe(2);
  });

  it('wiederholt bei 503, gibt 404 aber unverändert zurück (4xx ist nicht transient)', async () => {
    const t = fakeFetch([503, 200]);
    expect((await fetchMitWiederholung('u', undefined, { fetchImpl: t.fetch, warte: keineWarte })).status).toBe(200);
    expect(t.n()).toBe(2);

    const v = fakeFetch([404]);
    const res = await fetchMitWiederholung('u', undefined, { fetchImpl: v.fetch, warte: keineWarte });
    expect(res.status).toBe(404);
    expect(v.n()).toBe(1); // kein Retry auf 4xx
  });

  it('wirft nach erschöpften Versuchen mit dem letzten Fehler', async () => {
    const { fetch, n } = fakeFetch([new Error('ETIMEDOUT')]);
    await expect(
      fetchMitWiederholung('u', undefined, { fetchImpl: fetch, warte: keineWarte, versuche: 3 }),
    ).rejects.toThrow(/3 Versuche erschöpft.*ETIMEDOUT/);
    expect(n()).toBe(3);
  });

  it('wartet mit deterministischem exponentiellem Backoff (basisMs · 2^(n-1))', async () => {
    const gewartet: number[] = [];
    const { fetch } = fakeFetch([new Error('x'), new Error('x'), 200]);
    await fetchMitWiederholung('u', undefined, {
      fetchImpl: fetch,
      warte: async (ms) => { gewartet.push(ms); },
      basisMs: 100,
    });
    expect(gewartet).toEqual([100, 200]); // Versuch 1→100, Versuch 2→200, Versuch 3 ok
  });
});
