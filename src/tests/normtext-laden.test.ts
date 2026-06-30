import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ladeSnapshot } from '../lib/normtext/laden';
import type { NormSnapshotDatei } from '../lib/normtext/typen';

// Client-Loader für Norm-Snapshots (lazy + Datei-Cache). Reine Ladelogik (§3):
// keine Rechtsregel, nur Datei holen + Eintrag suchen. TDD: Test zuerst (FAIL)
// → implementieren → grün. global.fetch wird gemockt; jeder Test setzt eine
// frische fetch-Spy, der Modul-Cache wird zwischen den Tests zurückgesetzt
// (resetModules + dynamischer Re-Import), damit der Datei-Cache nicht leckt.

const OR_DATEI: NormSnapshotDatei = {
  erzeugt: '2026-06-16',
  eintraege: [
    {
      id: 'bund/OR/art_335_c',
      ebene: 'bund',
      quelle: 'OR',
      erlass: 'OR',
      artikel: '335_c',
      artikelLabel: 'Art. 335c',
      bloecke: [{ absatz: '1', text: 'Das Arbeitsverhältnis kann …' }],
      stand: '2026-01-01',
      quelleUrl: 'https://www.fedlex.admin.ch/eli/cc/27/317_321_377/de#art_335_c',
      abgerufen: '2026-06-16',
      fassungsToken: '20260101',
      sha: 'abc',
    },
  ],
};

function fetchOk(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => body,
  } as Response;
}

function fetch404(): Response {
  return { ok: false, status: 404, json: async () => ({}) } as Response;
}

describe('ladeSnapshot (Client-Loader)', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('(a) Treffer: liefert den passenden Eintrag', async () => {
    const { ladeSnapshot } = await import('../lib/normtext/laden');
    global.fetch = vi.fn().mockResolvedValue(fetchOk(OR_DATEI));
    const snap = await ladeSnapshot('bund', 'OR', '335_c');
    expect(snap).not.toBeNull();
    expect(snap!.id).toBe('bund/OR/art_335_c');
    expect(snap!.artikelLabel).toBe('Art. 335c');
    expect(global.fetch).toHaveBeenCalledWith('/normtext/bund/OR.json');
  });

  it('(b) zweiter Aufruf gleiche Datei → fetch nur 1×', async () => {
    const { ladeSnapshot } = await import('../lib/normtext/laden');
    const spy = vi.fn().mockResolvedValue(fetchOk(OR_DATEI));
    global.fetch = spy;
    const a = await ladeSnapshot('bund', 'OR', '335_c');
    const b = await ladeSnapshot('bund', 'OR', '335_c');
    expect(a).not.toBeNull();
    expect(b).not.toBeNull();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('(c) 404 → null (kein throw)', async () => {
    const { ladeSnapshot } = await import('../lib/normtext/laden');
    global.fetch = vi.fn().mockResolvedValue(fetch404());
    const snap = await ladeSnapshot('bund', 'XYZ', '1');
    expect(snap).toBeNull();
  });

  it('(d) unbekannter Token in vorhandener Datei → null', async () => {
    const { ladeSnapshot } = await import('../lib/normtext/laden');
    global.fetch = vi.fn().mockResolvedValue(fetchOk(OR_DATEI));
    const snap = await ladeSnapshot('bund', 'OR', '999');
    expect(snap).toBeNull();
  });

  it('(e) M13: Schlusstitel-Token «disp_*» trifft den Eintrag (id ohne art_-Präfix)', async () => {
    // Regression F1 (30.6.2026): disp-Einträge werden als «bund/OR/disp_u2_art_1»
    // gespeichert. ladeSnapshot baute fix «…/art_<token>» → für jeden Schlusstitel-
    // Zugriff still null. Jetzt namespace-bewusst.
    const dispDatei: NormSnapshotDatei = {
      erzeugt: '2026-06-29',
      eintraege: [{
        id: 'bund/OR/disp_u2_art_1', ebene: 'bund', quelle: 'OR', erlass: 'OR',
        artikel: 'disp_u2_art_1', artikelLabel: 'Art. 1',
        bloecke: [{ absatz: '1', text: 'Schlussbestimmung …' }],
        stand: '2026-01-01', quelleUrl: 'https://www.fedlex.admin.ch/eli/cc/27/317_321_377/de#disp_u2/art_1',
        abgerufen: '2026-06-29', fassungsToken: '20260101', sha: 'def',
      }],
    };
    const { ladeSnapshot } = await import('../lib/normtext/laden');
    global.fetch = vi.fn().mockResolvedValue(fetchOk(dispDatei));
    const snap = await ladeSnapshot('bund', 'OR', 'disp_u2_art_1');
    expect(snap).not.toBeNull();
    expect(snap!.id).toBe('bund/OR/disp_u2_art_1');
    expect(snap!.artikelLabel).toBe('Art. 1');
  });

  it('Netzwerk-/Parse-Fehler → null (kein throw)', async () => {
    const { ladeSnapshot } = await import('../lib/normtext/laden');
    global.fetch = vi.fn().mockRejectedValue(new Error('Netzfehler'));
    const snap = await ladeSnapshot('bund', 'OR', '335_c');
    expect(snap).toBeNull();
  });
});

// Top-level-Import nur als Typ-/Vorhandensein-Anker (sonst „unused").
void ladeSnapshot;
