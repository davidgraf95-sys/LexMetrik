import { describe, it, expect, vi, afterEach } from 'vitest';
import { ladeErlassDatei } from '../lib/normtext/browse';

// ─── O-1.7: transiente Ladefehler werden NICHT dauerhaft gecacht ─────────────
//
// Empirischer Beweis (Gegenprüfungs-Randfall) zur Fehler-Cache-Härtung in
// browse.ts/laden.ts: der ERFOLGSPFAD ist byte-identisch (Datei wird geliefert),
// eine ECHTE 404 bleibt als null gecacht (kein Neuversuch), aber ein transienter
// Fehler (5xx/Netz) wird verworfen, sodass der nächste Zugriff neu versucht.
// Vor dem Fix degradierte ein einzelner Netz-Blip die Artikel-Popups bis zum
// Reload. Jede Datei-URL ist eindeutig, damit der Modul-Cache nicht überlappt.

afterEach(() => vi.unstubAllGlobals());

function jsonOk(body: unknown): Response {
  return { ok: true, status: 200, json: async () => body } as unknown as Response;
}
function status(code: number): Response {
  return { ok: false, status: code, json: async () => ({}) } as unknown as Response;
}

describe('ladeErlassDatei — Fehler-Cache (O-1.7)', () => {
  it('Erfolgsfall: liefert die Datei (unverändert)', async () => {
    const datei = { eintraege: [] };
    vi.stubGlobal('fetch', vi.fn(async () => jsonOk(datei)));
    await expect(ladeErlassDatei('bund/CACHE_OK.json')).resolves.toEqual(datei);
  });

  it('echte 404: null, und wird gecacht (kein zweiter fetch)', async () => {
    const fetchMock = vi.fn(async () => status(404));
    vi.stubGlobal('fetch', fetchMock);
    expect(await ladeErlassDatei('bund/CACHE_404.json')).toBeNull();
    expect(await ladeErlassDatei('bund/CACHE_404.json')).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1); // 404 bleibt gecacht
  });

  it('transienter 500: null, aber NICHT gecacht — nächster Zugriff versucht neu', async () => {
    const datei = { eintraege: [] };
    let ruf = 0;
    const fetchMock = vi.fn(async () => {
      ruf += 1;
      return ruf === 1 ? status(500) : jsonOk(datei);
    });
    vi.stubGlobal('fetch', fetchMock);
    expect(await ladeErlassDatei('bund/CACHE_500.json')).toBeNull(); // Blip → null
    expect(await ladeErlassDatei('bund/CACHE_500.json')).toEqual(datei); // Neuversuch erfolgreich
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('transienter Netzfehler (reject): null, aber NICHT gecacht', async () => {
    const datei = { eintraege: [] };
    let ruf = 0;
    const fetchMock = vi.fn(async () => {
      ruf += 1;
      if (ruf === 1) throw new Error('Netz-Blip');
      return jsonOk(datei);
    });
    vi.stubGlobal('fetch', fetchMock);
    expect(await ladeErlassDatei('bund/CACHE_NETZ.json')).toBeNull();
    expect(await ladeErlassDatei('bund/CACHE_NETZ.json')).toEqual(datei);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
