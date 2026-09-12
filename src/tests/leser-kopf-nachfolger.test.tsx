/**
 * G-AUFH-NACHFOLGER · Der Nachfolge-Link im Aufhebungs-Banner führt INS KORPUS,
 * sobald der Nachfolge-Erlass dort liegt (Gegenprüfungs-Auflage PR #823).
 *
 * ANLASS (gemessen 12.9.2026). Mit der BMV-Totalrevision liegt die geltende
 * Fassung erstmals selbst im Korpus (`BMV_2025`). Das Banner des historischen
 * `BMV` zeigte trotzdem weiter nur auf fedlex.admin.ch — wer zuerst den
 * aufgehobenen Eintrag traf, wurde aus dem Korpus geschickt, obwohl die
 * geltende Fassung einen Klick entfernt lag.
 *
 * REGEL. Löst die Nachfolge-ELI auf einen Register-Key auf, führt der Link
 * INTERN dorthin («Nachfolge-Erlass im Korpus»); die amtliche Fassung bleibt
 * als eigener, zusätzlicher Link daneben (§7 — massgeblich ist nie unser
 * Artefakt). Ohne Register-Key bleibt alles wie bisher: ein einziger,
 * externer Link auf die amtliche Quelle (§8 — nie ein Sprung ins Leere).
 */
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { ErlassLeserKopf } from '../pages/gesetz-leser/parts/ErlassLeserKopf';
import { erlassKeyVonEli } from '../lib/normtext/erlassAdresse';
import type { BrowseErlass } from '../lib/normtext/browse-typen';

const basis: BrowseErlass = {
  key: 'BMV', ebene: 'bund', kanton: null, kuerzel: 'BMV',
  titel: 'Verordnung über die Berufsmaturität (Berufsmaturitätsverordnung)',
  sr: '412.103.1', rechtsgebiet: 'oeffentlich', sprache: 'de', rang: 126, status: 'snapshot',
  datei: 'bund/BMV.json', artikelAnzahl: 37, stand: '2016-08-23',
  quelleUrl: 'https://www.fedlex.admin.ch/eli/cc/2009/423/de', fassungsToken: '20160823', pdfPfad: null,
  aufgehoben: {
    seit: '2026-03-01',
    nachfolger: {
      sr: '412.103.1',
      titel: 'Verordnung vom 13. Juni 2025 über die eidgenössische Berufsmaturität (Berufsmaturitätsverordnung, BMV)',
      eli: 'cc/2025/408',
    },
  },
};

/** Nachfolger, den das Register NICHT kennt (Rückfall-Ast). */
const ohneKorpus: BrowseErlass = {
  ...basis,
  aufgehoben: { seit: '2026-03-01', nachfolger: { sr: '999.999', titel: 'Irgendein Nachfolger', eli: 'cc/2099/1' } },
};

const html = (e: BrowseErlass) =>
  renderToString(
    <MemoryRouter>
      <ErlassLeserKopf erlass={e} overline="Bund" artikelAnzahl={e.artikelAnzahl} hinweis="H" />
    </MemoryRouter>,
  );

describe('ELI → Register-Key (eine Ableitung, §5)', () => {
  it('löst die Nachfolge-ELI der BMV-Totalrevision auf den Korpus-Key auf', () => {
    expect(erlassKeyVonEli('cc/2025/408')).toBe('BMV_2025');
    expect(erlassKeyVonEli('cc/2009/423')).toBe('BMV');
  });
  it('unbekannte ELI → null (kein geratener Sprung, §8)', () => {
    expect(erlassKeyVonEli('cc/2099/1')).toBeNull();
    expect(erlassKeyVonEli('')).toBeNull();
  });
});

describe('Aufhebungs-Banner — Nachfolge-Link', () => {
  it('führt intern in den Korpus, wenn der Nachfolger dort liegt', () => {
    const h = html(basis);
    expect(h).toContain('href="/gesetze/bund/BMV_2025"');
    expect(h).toContain('Nachfolge-Erlass im Korpus');
  });

  it('bietet die amtliche Fassung des Nachfolgers weiterhin an (§7)', () => {
    expect(html(basis)).toContain('https://www.fedlex.admin.ch/eli/cc/2025/408/de');
  });

  it('lässt den Link auf die amtliche (aufgehobene) Fassung unberührt', () => {
    expect(html(basis)).toContain('https://www.fedlex.admin.ch/eli/cc/2009/423/de');
  });

  it('Rückfall ohne Korpus-Key: nur der externe amtliche Link, kein interner Sprung', () => {
    const h = html(ohneKorpus);
    expect(h).toContain('https://www.fedlex.admin.ch/eli/cc/2099/1/de');
    expect(h).not.toContain('Nachfolge-Erlass im Korpus');
    expect(h).not.toContain('href="/gesetze/');
  });
});
