/**
 * M2 (David 29.6.2026) — Aufhebungs-Zitatzeile «Aufgehoben durch … (AS …)» wird
 * wie jede Fussnote erst auf Klick gezeigt (hinter dem Fussnoten-Schalter
 * `fussnotenAuf`); die Statuszeile «· aufgehoben» (Artikelzustand) bleibt
 * unabhängig davon IMMER sichtbar.
 */
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { ArtikelLeser } from '../pages/gesetz-leser/parts';
import type { NormSnapshot } from '../lib/normtext/typen';
import type { BrowseErlass } from '../lib/normtext/browse-typen';
import type { Fussnote } from '../lib/normtext/browse';

const erlass: BrowseErlass = {
  key: 'ZGB', ebene: 'bund', kanton: null, kuerzel: 'ZGB', titel: 'Zivilgesetzbuch', sr: '210',
  rechtsgebiet: 'privat', sprache: 'de', rang: 0, status: 'snapshot',
  datei: 'bund/ZGB.json', artikelAnzahl: 1, stand: '2026-01-01', quelleUrl: 'https://x', fassungsToken: '20260101',
  pdfPfad: null,
};

// Voll aufgehobener Artikel (leerer Körper «…») + amtliche Aufhebungs-Fussnote
// auf Artikelebene (absatz/item null).
const aufgehoben: NormSnapshot = {
  id: 'bund/ZGB/art_349', ebene: 'bund', quelle: 'ZGB', erlass: 'ZGB', artikel: '349', artikelLabel: 'Art. 349',
  bloecke: [{ absatz: null, text: '…' }],
  stand: '2026-01-01', quelleUrl: 'https://x', abgerufen: '2026-06-29', fassungsToken: '20260101', sha: 'x',
};
const aufhebung: Fussnote[] = [
  { nr: '1', text: 'Aufgehoben durch Ziff. I des BG vom 1. Jan. 2013 (AS 2012 1234).', links: [] },
];

const render = (fussnotenAuf: boolean) =>
  renderToString(
    <ArtikelLeser e={aufgehoben} erlass={erlass} basisPfad="/gesetze/ZGB" fussnoten={aufhebung} fussnotenAuf={fussnotenAuf} />,
  );

describe('M2 — Aufhebungs-Zitatzeile click-to-reveal, Status bleibt', () => {
  it('Status «· aufgehoben» ist IMMER sichtbar (auch ohne Fussnoten-Schalter)', () => {
    expect(render(false)).toContain('· aufgehoben');
    expect(render(true)).toContain('· aufgehoben');
  });

  it('«Aufgehoben durch …» ist OHNE Fussnoten-Schalter verborgen', () => {
    expect(render(false)).not.toContain('Aufgehoben durch');
  });

  it('«Aufgehoben durch …» erscheint MIT Fussnoten-Schalter', () => {
    expect(render(true)).toContain('Aufgehoben durch Ziff. I des BG');
  });
});

// ── M9: aufgehobene Artikel bündig auf gleicher Ebene ─────────────────────────
const aktiv: NormSnapshot = {
  id: 'bund/ZGB/art_348', ebene: 'bund', quelle: 'ZGB', erlass: 'ZGB', artikel: '348', artikelLabel: 'Art. 348',
  bloecke: [{ absatz: '1', text: 'Der Erblasser kann durch Verfügung etwas anordnen.' }],
  stand: '2026-01-01', quelleUrl: 'https://x', abgerufen: '2026-06-29', fassungsToken: '20260101', sha: 'y',
};

describe('M9 — aufgehobene und aktive Artikel fluchten bündig (gleiche w-4-Leitspalte)', () => {
  const renderArt = (e: NormSnapshot) =>
    renderToString(<ArtikelLeser e={e} erlass={erlass} basisPfad="/gesetze/ZGB" fussnotenAuf={false} />);
  it('aktiver Artikel: Chevron-Knopf trägt die feste w-4-Leitspalte', () => {
    const out = renderArt(aktiv);
    expect(out).toMatch(/class="[^"]*\binline-flex\b[^"]*\bw-4\b[^"]*justify-center/);
  });
  it('aufgehobener Artikel: Platzhalter trägt dieselbe feste w-4-Leitspalte', () => {
    const out = renderArt(aufgehoben);
    expect(out).toMatch(/class="[^"]*\binline-flex\b[^"]*\bw-4\b/);
    expect(out).not.toContain('▾'); // kein Chevron
  });
});
