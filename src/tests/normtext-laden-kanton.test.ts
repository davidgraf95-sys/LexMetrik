import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NormSnapshotDatei } from '../lib/normtext/typen';

// Tests für ladeKantonSnapshotViaUrl (Client-Loader, Manifest-basiert).
// §3: reine Ladelogik, keine Rechtsregel.
// TDD: Tests definieren das Verhalten — Implementierung folgt.
// Modul-Cache wird zwischen Tests via resetModules zurückgesetzt, damit der
// Datei-/Manifest-Cache nicht zwischen Tests leckt (gleiches Muster wie
// normtext-laden.test.ts).

// ── Test-Fixtures ─────────────────────────────────────────────────────────────

const MANIFEST = {
  'https://www.belex.sites.be.ch/app/de/texts_of_law/161.12': 'BE-161.12.json',
  'https://bgs.zg.ch/app/de/texts_of_law/161.7': 'ZG-161.7.json',
};

const BE_DATEI: NormSnapshotDatei = {
  erzeugt: '2026-06-16',
  eintraege: [
    {
      id: 'kanton/BE/161.12/art_36',
      ebene: 'kanton',
      quelle: 'BE',
      erlass: 'Verfahrenskostendekret, VKD (BSG 161.12)',
      artikel: '36',
      artikelLabel: 'Art. 36',
      bloecke: [{ absatz: '1', text: 'Im ordentlichen Verfahren …' }],
      stand: '2011-01-01',
      quelleUrl: 'https://www.belex.sites.be.ch/app/de/texts_of_law/161.12',
      abgerufen: '2026-06-16',
      fassungsToken: 'abc123',
      sha: 'deadbeef',
    },
  ],
};

function fetchOk(body: unknown): Response {
  return { ok: true, status: 200, json: async () => body } as Response;
}

function fetch404(): Response {
  return { ok: false, status: 404, json: async () => ({}) } as Response;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ladeKantonSnapshotViaUrl', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('(a) Treffer: manifest liefert Datei, Datei enthält Token → Eintrag zurück', async () => {
    const { ladeKantonSnapshotViaUrl } = await import('../lib/normtext/laden');
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(fetchOk(MANIFEST))   // index.json
      .mockResolvedValueOnce(fetchOk(BE_DATEI));   // BE-161.12.json

    const snap = await ladeKantonSnapshotViaUrl(
      'https://www.belex.sites.be.ch/app/de/texts_of_law/161.12',
      '36',
    );
    expect(snap).not.toBeNull();
    expect(snap!.id).toBe('kanton/BE/161.12/art_36');
    expect(snap!.artikel).toBe('36');
  });

  it('(b) Manifest wird nur 1× gefetcht bei zwei Aufrufen', async () => {
    const { ladeKantonSnapshotViaUrl } = await import('../lib/normtext/laden');
    const spy = vi
      .fn()
      .mockResolvedValueOnce(fetchOk(MANIFEST))   // index.json — nur einmal
      .mockResolvedValue(fetchOk(BE_DATEI));       // Datei-Aufrufe

    global.fetch = spy;

    await ladeKantonSnapshotViaUrl(
      'https://www.belex.sites.be.ch/app/de/texts_of_law/161.12',
      '36',
    );
    await ladeKantonSnapshotViaUrl(
      'https://www.belex.sites.be.ch/app/de/texts_of_law/161.12',
      '36',
    );

    // index.json + BE-161.12.json = 2 Aufrufe (nicht 3 oder mehr)
    const manifestAufrufe = spy.mock.calls.filter((c) =>
      (c[0] as string).includes('index.json'),
    ).length;
    expect(manifestAufrufe).toBe(1);
  });

  it('(c) quelleUrl nicht im Manifest → null', async () => {
    const { ladeKantonSnapshotViaUrl } = await import('../lib/normtext/laden');
    global.fetch = vi.fn().mockResolvedValueOnce(fetchOk(MANIFEST));

    const snap = await ladeKantonSnapshotViaUrl(
      'https://unbekannt.example.ch/app/de/texts_of_law/999',
      '1',
    );
    expect(snap).toBeNull();
  });

  it('(d) Token nicht in Datei → null', async () => {
    const { ladeKantonSnapshotViaUrl } = await import('../lib/normtext/laden');
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(fetchOk(MANIFEST))
      .mockResolvedValueOnce(fetchOk(BE_DATEI));

    const snap = await ladeKantonSnapshotViaUrl(
      'https://www.belex.sites.be.ch/app/de/texts_of_law/161.12',
      '999', // nicht vorhanden
    );
    expect(snap).toBeNull();
  });

  it('(e) 404 auf Manifest → null (kein throw)', async () => {
    const { ladeKantonSnapshotViaUrl } = await import('../lib/normtext/laden');
    global.fetch = vi.fn().mockResolvedValueOnce(fetch404());

    const snap = await ladeKantonSnapshotViaUrl(
      'https://www.belex.sites.be.ch/app/de/texts_of_law/161.12',
      '36',
    );
    expect(snap).toBeNull();
  });
});
