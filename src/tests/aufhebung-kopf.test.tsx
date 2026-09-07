/**
 * G-AUFH · Reader-Kopf zeigt aufgehobene Erlasse §8-ehrlich:
 *   • Status-Banner «Aufgehoben per …» (Design-Token danger, kein Ad-hoc-Rot),
 *   • Nachfolger-Link + amtlicher (aufgehobener) Link,
 *   • KEIN irreführender Standausweis/«geltende Fassung» mehr.
 * Geltende Erlasse bleiben unverändert (kein Banner).
 *
 * NEU GEFASST W2·5m-LESER-V3/S3 (Entscheid F5, David 16.8.2026): der
 * Standausweis heisst nicht mehr «geltend geprüft am …», sondern «gegen
 * Fedlex-Konsolidierung geprüft am … (maschinell)». Das ist eine deklarierte
 * FACHLICHE Änderung, kein Refactoring (§6.3) — die Erwartung wird darum
 * angepasst, nicht der Code gebogen. Der erwartete String wird aus der EINEN
 * Quelle geholt (`standausweisSatz`), damit der Test die Kopplung prüft statt
 * eine zweite Kopie des Wortlauts zu werden (§5).
 */
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { ErlassLeserKopf } from '../pages/gesetz-leser/parts/ErlassLeserKopf';
import type { BrowseErlass } from '../lib/normtext/browse-typen';
import type { CurrencyEintrag } from '../lib/normtext/browse';
import { standausweisSatz } from '../lib/normtext/erlassKopfText';

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
    // ── B-2 (Design-Konsistenz 31.8.2026) · NACHGEFÜHRTE ZUSICHERUNG ────────
    // Bis hierher stand «amtliche (aufgehobene) Fassung» — klein beginnend,
    // Pfeil VORNE («↗ amtliche …»). Das brach Ä110, das seit 18.8.2026 für
    // denselben Link im Kopf darüber gilt. Die Beschriftung ist eine DEKLARIERTE
    // fachliche Änderung (§6.3), keine stille Test-Anpassung: geprüft wird
    // weiterhin, DASS das Banner den amtlichen Link mit dem Zusatz
    // «(aufgehobene)» ausweist (§8) — nur in der Kanon-Schreibung.
    expect(out).toContain('Amtliche (aufgehobene) Fassung ↗');
    // Der Nachfolge-Link trägt dieselbe Anatomie: Pfeil HINTEN.
    expect(out).not.toContain('↗ Nachfolge-Erlass');
  });

  it('unterdrückt Standausweis und «geltende Fassung» bei aufgehobenem Erlass (§8)', () => {
    const out = html(aufgehoben, currency);
    expect(out).not.toContain('Fedlex-Konsolidierung geprüft');
    // Ä110 (18.8.2026): der Link heisst «Amtliche Fassung ↗». Geprüft bleibt,
    // dass der Kopf am aufgehobenen Erlass KEINEN Link auf die (aufgehobene)
    // Konsolidierung anbietet — nur das Wort hat gewechselt.
    expect(out).not.toContain('Amtliche Fassung ↗');
    // Der alte Wortlaut darf auch nicht als Rest zurückkommen.
    expect(out).not.toContain('geltend geprüft');
  });

  it('geltender Erlass: kein Banner, Standausweis bleibt sichtbar (F5-Wortlaut)', () => {
    const out = html(basis, currency);
    expect(out).not.toContain('lc-notice-danger');
    expect(out).not.toContain('Aufgehoben per');
    expect(out).toContain(standausweisSatz('2026-07-10'));
    expect(out).toContain('Amtliche Fassung ↗');
    // §7/§8: «(maschinell)» bleibt tragend, kein Verifikations-Wortfeld.
    expect(out).toContain('(maschinell)');
    expect(out).not.toContain('verifiziert');
    expect(out).not.toContain('gegengeprüft');
  });
});
