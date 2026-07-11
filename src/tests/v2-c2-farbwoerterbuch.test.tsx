/**
 * V2·C-2 (Farb-Wörterbuch Teil 2, §4b-B) — Referenzschicht-Farbtöne.
 *
 * Belegt die zwei C-2-Bausteine als reine Tick-/Punkt-Farbwahl (Anatomie
 * unverändert, CLS 0):
 *   (1) Overline-Farbpunkte: «Leitfälle» trägt den slate-Punkt (Rechtsprechung),
 *       «Verweise» den brass-Default — redundant zum Wortlabel (aria-hidden).
 *   (2) Currency-Chip-Tonung: «geltend geprüft … (maschinell)» = sage-Tick,
 *       «nächste Fassung ab …» = warn-Tick. Das «(maschinell)»-Wortfeld bleibt
 *       tragend (§7/§8: keine fachliche-Abnahme-Suggestion).
 */
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { ArtikelLeser } from '../pages/gesetz-leser/parts';
import { ErlassLeserKopf } from '../pages/gesetz-leser/parts/ErlassLeserKopf';
import type { NormSnapshot } from '../lib/normtext/typen';
import type { BrowseErlass } from '../lib/normtext/browse-typen';
import type { CurrencyEintrag } from '../lib/normtext/browse';
import type { LeitfallRef } from '../lib/rechtsprechung/norm-index';

const erlass: BrowseErlass = {
  key: 'OR', ebene: 'bund', kanton: null, kuerzel: 'OR', titel: 'Obligationenrecht', sr: '220',
  rechtsgebiet: 'privat', sprache: 'de', rang: 0, status: 'snapshot',
  datei: 'bund/OR.json', artikelAnzahl: 1, stand: '2026-01-01', quelleUrl: 'https://x', fassungsToken: '20260101',
  pdfPfad: null,
};

const artMitLeitfall: NormSnapshot = {
  id: 'bund/OR/art_41', ebene: 'bund', quelle: 'OR', erlass: 'OR', artikel: '41', artikelLabel: 'Art. 41',
  bloecke: [{ absatz: '1', text: 'Wer einem andern widerrechtlich Schaden zufügt, wird ersatzpflichtig.' }],
  stand: '2026-01-01', quelleUrl: 'https://x', abgerufen: '2026-06-29', fassungsToken: '20260101', sha: 'x',
};
const leitfaelle: LeitfallRef[] = [
  { key: 'bge_152_III_7', zitierung: 'BGE 152 III 7', regesteKurz: null, datum: '2025-03-07',
    leitcharakter: 'leitentscheid', gericht: 'BGer', kanton: 'CH', gewicht: 3 },
];

const ssrArtikel = () => renderToString(
  <MemoryRouter>
    <ArtikelLeser e={artMitLeitfall} erlass={erlass} basisPfad="/gesetze/bund/OR" leitfaelle={leitfaelle} />
  </MemoryRouter>,
);

// Partial: die Real-Sidecars führen `geprueftAm` immer, aber der Renderer gated
// jeden Chip einzeln (`currency?.geprueftAm && …`) — die Test-Matrix deckt darum
// auch die Einzelfälle (nur künftige Fassung / leer) ab.
const ssrKopf = (currency: Partial<CurrencyEintrag>) => renderToString(
  <ErlassLeserKopf erlass={erlass} overline="Bund" artikelAnzahl={1} hinweis="" currency={currency as CurrencyEintrag} />,
);

describe('C-2 (1) — Overline-Farbpunkt', () => {
  it('«Leitfälle»-Overline trägt den slate-Punkt (aria-hidden, Rechtsprechung)', () => {
    const out = ssrArtikel();
    expect(out).toContain('Leitfälle');
    expect(out).toContain('lc-punkt lc-punkt-entscheid');
    expect(out).toContain('aria-hidden');
  });
});

describe('C-2 (2) — Currency-Chip-Tonung', () => {
  it('«geltend geprüft»-Chip trägt den sage-Tick + «(maschinell)»-Wortfeld', () => {
    const out = ssrKopf({ geprueftAm: '2026-01-15' });
    expect(out).toContain('lc-chip-geltend');
    expect(out).toContain('(maschinell)');
    // §7/§8: kein «gegengeprüft/verifiziert» — Freshness ist maschinell, keine Abnahme.
    expect(out).not.toMatch(/gegengeprüft|verifiziert/);
  });

  it('«nächste Fassung ab»-Chip trägt den warn-Tick (Fassungsvorbehalt)', () => {
    const out = ssrKopf({ naechsteFassungAb: '2027-01-01' });
    expect(out).toContain('lc-chip-vorbehalt');
    expect(out).toContain('nächste Fassung ab');
  });

  it('ohne Currency-Daten kein Tonungs-Tick (kein toter Marker)', () => {
    const out = ssrKopf({});
    expect(out).not.toContain('lc-chip-geltend');
    expect(out).not.toContain('lc-chip-vorbehalt');
  });
});
