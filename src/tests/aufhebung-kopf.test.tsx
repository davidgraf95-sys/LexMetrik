/**
 * G-AUFH · Reader-Kopf zeigt aufgehobene Erlasse §8-ehrlich:
 *   • Status-Banner «Aufgehoben per …» (Design-Token danger, kein Ad-hoc-Rot),
 *   • Nachfolger-Link + amtlicher (aufgehobener) Link,
 *   • KEIN irreführendes «geltend geprüft»/«geltende Fassung» mehr.
 * Geltende Erlasse bleiben unverändert (kein Banner).
 */
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { ErlassLeserKopf } from '../pages/gesetz-leser/parts/ErlassLeserKopf';
import type { BrowseErlass } from '../lib/normtext/browse-typen';
import type { CurrencyEintrag } from '../lib/normtext/browse';

const basis: BrowseErlass = {
  key: 'BMV', ebene: 'bund', kanton: null, kuerzel: 'BMV',
  titel: 'Verordnung über die Berufsmaturität (Berufsmaturitätsverordnung)',
  sr: '412.103.1', rechtsgebiet: 'oeffentlich', sprache: 'de', rang: 102, status: 'snapshot',
  datei: 'bund/BMV.json', artikelAnzahl: 30, stand: '2016-08-23',
  quelleUrl: 'https://www.fedlex.admin.ch/eli/cc/2009/423/de', fassungsToken: '20160823', pdfPfad: null,
};

const aufgehoben: BrowseErlass = {
  ...basis,
  aufgehoben: {
    seit: '2026-03-01',
    nachfolger: {
      sr: '412.103.1',
      titel: 'Verordnung vom 13. Juni 2025 über die eidgenössische Berufsmaturität (Berufsmaturitätsverordnung, BMV)',
      eli: 'cc/2025/408',
    },
  },
};

const currency: CurrencyEintrag = { geprueftAm: '2026-07-10' };

const html = (e: BrowseErlass, c?: CurrencyEintrag) =>
  renderToString(
    <ErlassLeserKopf erlass={e} overline="Bund" artikelAnzahl={e.artikelAnzahl} hinweis="H" currency={c} />,
  );

describe('ErlassLeserKopf — Aufhebungs-Banner', () => {
  it('zeigt Banner mit Datum, Nachfolger-Link und amtlichem Link bei aufgehobenem Erlass', () => {
    const out = html(aufgehoben, currency);
    expect(out).toContain('lc-notice-danger');
    // renderToString setzt <!-- --> zwischen Textknoten → Teilstücke prüfen.
    expect(out).toContain('Aufgehoben per');
    expect(out).toContain('01.03.2026');
    expect(out).toContain('https://www.fedlex.admin.ch/eli/cc/2025/408/de'); // Nachfolger
    expect(out).toContain('Nachfolge-Erlass');
    expect(out).toContain('https://www.fedlex.admin.ch/eli/cc/2009/423/de'); // amtlich (aufgehoben)
    expect(out).toContain('amtliche (aufgehobene) Fassung');
  });

  it('unterdrückt «geltend geprüft» und «geltende Fassung» bei aufgehobenem Erlass (§8)', () => {
    const out = html(aufgehoben, currency);
    expect(out).not.toContain('geltend geprüft');
    expect(out).not.toContain('geltende Fassung');
  });

  it('geltender Erlass: kein Banner, «geltend geprüft» bleibt sichtbar', () => {
    const out = html(basis, currency);
    expect(out).not.toContain('lc-notice-danger');
    expect(out).not.toContain('Aufgehoben per');
    expect(out).toContain('geltend geprüft');
    expect(out).toContain('geltende Fassung');
  });
});
