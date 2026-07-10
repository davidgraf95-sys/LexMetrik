import { describe, it, expect } from 'vitest';
import { schaetzeArtikelHoehe, A2_HOEHE_FALLBACK } from '../pages/gesetz-leser/berechnungen';
import type { NormSnapshot } from '../lib/normtext/typen';

// W2·5d U-POSITION/A2: die per-Artikel-Höhenschätzung speist die inhalts-
// proportionale content-visibility-Platzhalterhöhe (Scrollbalken-Proportionalität).
// Deterministisch (§2) + monoton (mehr Inhalt ⇒ nie kleiner) — DAS ist die für
// einen proportionalen Balken nötige Eigenschaft; Pixel-Genauigkeit ist nicht Ziel.

function art(bloecke: NormSnapshot['bloecke'], titel?: string): NormSnapshot {
  return {
    id: 'bund/OR/art_x', ebene: 'bund', quelle: 'OR', erlass: 'OR',
    artikel: 'x', artikelLabel: 'Art. x', titel,
    bloecke, stand: '2024-01-01', quelleUrl: 'https://example', abgerufen: '2024-01-01',
  } as NormSnapshot;
}

describe('schaetzeArtikelHoehe (A2)', () => {
  it('ist deterministisch (gleiche Eingabe ⇒ gleiche Ausgabe)', () => {
    const e = art([{ absatz: '1', text: 'Ein Absatz mit etwas Text.' }]);
    expect(schaetzeArtikelHoehe(e)).toBe(schaetzeArtikelHoehe(e));
  });

  it('respektiert eine sinnvolle Mindesthöhe', () => {
    expect(schaetzeArtikelHoehe(art([]))).toBeGreaterThanOrEqual(120);
    // Aufgehobener Einzeiler bleibt klein — deutlich unter dem alten Flach-Default.
    expect(schaetzeArtikelHoehe(art([{ absatz: null, text: '…' }]))).toBeLessThan(A2_HOEHE_FALLBACK);
  });

  it('wächst monoton mit dem Inhalt (mehr Absätze/Items/Zeilen ⇒ nie kleiner)', () => {
    const klein = art([{ absatz: '1', text: 'Kurz.' }]);
    const mittel = art([
      { absatz: '1', text: 'Kurz.' },
      { absatz: '2', text: 'Ein zweiter, deutlich längerer Absatz mit mehr Fliesstext, der über mehrere Lesezeilen läuft und darum mehr Höhe braucht.' },
    ]);
    const gross = art([
      ...mittel.bloecke,
      { absatz: '3', text: 'Aufzählung:', items: [
        { marke: 'a', text: 'erster Punkt' }, { marke: 'b', text: 'zweiter Punkt' }, { marke: 'c', text: 'dritter Punkt' },
      ] },
    ]);
    expect(schaetzeArtikelHoehe(mittel)).toBeGreaterThan(schaetzeArtikelHoehe(klein));
    expect(schaetzeArtikelHoehe(gross)).toBeGreaterThan(schaetzeArtikelHoehe(mittel));
  });

  it('unterscheidet einen 40-Absatz-Artikel klar von einem Einzeiler (Proportionalität)', () => {
    const einzeiler = art([{ absatz: '1', text: 'Ein einzelner kurzer Absatz.' }]);
    const langBloecke: NormSnapshot['bloecke'] = Array.from({ length: 40 }, (_, i) => ({
      absatz: String(i + 1),
      text: 'Ein Absatz mit substanziellem Fliesstext, der über mehr als eine Lesezeile reicht und typischen Normtext abbildet.',
    }));
    expect(schaetzeArtikelHoehe(art(langBloecke))).toBeGreaterThan(schaetzeArtikelHoehe(einzeiler) * 10);
  });

  it('zählt Tabellenzeilen (Tarif/Mehrspalten) in die Höhe', () => {
    const ohne = art([{ absatz: '1', text: 'Grundtext.' }]);
    const mitTarif = art([
      { absatz: '1', text: 'Grundtext.', tabelle: Array.from({ length: 12 }, () => ({ beschreibung: 'Pos', betrag: '10' })) },
    ]);
    const mitMehr = art([
      { absatz: '1', text: 'Grundtext.', mehrspaltig: { kopf: ['A', 'B'], zeilen: Array.from({ length: 12 }, () => ['x', 'y']) } },
    ]);
    expect(schaetzeArtikelHoehe(mitTarif)).toBeGreaterThan(schaetzeArtikelHoehe(ohne));
    expect(schaetzeArtikelHoehe(mitMehr)).toBeGreaterThan(schaetzeArtikelHoehe(ohne));
  });
});
