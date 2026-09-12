/**
 * #679 — Lesesicht liest den amtlichen Trenner, statt die Marken-Art zu raten
 * (src/components/normtext/ArtikelBody.helfer.ts).
 *
 * Der Fallback OHNE Trenner-Feld (Kanton-Snapshots, PDF-/HTM-Adapter) bleibt
 * die Heuristik von PR #658 und ist hier mitgeprüft — er darf sich nicht
 * ändern (§6).
 */
import { describe, it, expect } from 'vitest';
import {
  markenArt,
  litZiff,
  markenZitat,
  markenAnzeige,
} from '../components/normtext/ArtikelBody.helfer';

describe('#679 markenArt — amtlicher Trenner schlägt die Heuristik', () => {
  it('":" ⇒ Label, auch bei KLEINgeschriebener Marke (UVG Art. 31)', () => {
    expect(markenArt('für Witwen und Witwer', ':')).toBe('label');
    // Ohne Trenner las die Heuristik dieselbe Marke als lit. — der Befund.
    expect(markenArt('für Witwen und Witwer')).toBe('lit');
  });

  it('")" ⇒ Ordinalmarke (lit./Ziff.), nicht Label', () => {
    expect(markenArt('a', ')')).toBe('lit');
    expect(markenArt('1', ')')).toBe('ziff');
  });

  it('"" und "." übersteuern nicht — Labels mit Punkt bleiben Labels', () => {
    // Gemessen 12.9.2026: ZStV-Anhang «EAZW + erm. St.», GFK Art. 1 «B. 1.»
    expect(markenArt('EAZW + erm. St', '.')).toBe('label');
    expect(markenArt('d. und e', '.')).toBe('lit');
    expect(markenArt('BAS', '')).toBe('label');
    expect(markenArt('i', '')).toBe('lit');
  });

  it('Gedankenstrich bleibt Gedankenstrich, unabhängig vom Trenner', () => {
    expect(markenArt('–', '')).toBe('strich');
    expect(markenArt('–')).toBe('strich');
  });
});

describe('#679 Zitat — Label-Marken ohne «lit.»', () => {
  it('VZV Art. 3 «BE:» zitiert «BE», nicht «lit. BE»', () => {
    expect(litZiff('BE', ':')).toBe('');
    expect(markenZitat('BE', ':')).toBe('BE');
  });

  it('kleingeschriebenes Label zitiert ohne Präfix', () => {
    expect(markenZitat('für Halbwaisen', ':')).toBe('für Halbwaisen');
  });

  it('Klammer-Aufzählung zitiert weiterhin «lit. a»', () => {
    expect(markenZitat('a', ')')).toBe('lit. a');
  });
});

describe('#679 Anzeige — amtlicher Trenner verbatim, nie erfunden', () => {
  it('«BE:» statt «BE.»', () => {
    expect(markenAnzeige('BE', ':')).toBe('BE:');
  });

  it('«a)» statt «a.» (Staatsverträge)', () => {
    expect(markenAnzeige('a', ')')).toBe('a)');
  });

  it('«BAS» ohne angehängten Doppelpunkt (kein Trenner in der Quelle)', () => {
    expect(markenAnzeige('BAS', '')).toBe('BAS');
    expect(markenAnzeige('Leq,i', '')).toBe('Leq,i');
  });

  it('Punkt-Marke unverändert «d. und e.»', () => {
    expect(markenAnzeige('d. und e', '.')).toBe('d. und e.');
  });

  it('OHNE Trenner-Feld unverändert zu PR #658 (Kanton-Fallback)', () => {
    expect(markenAnzeige('a')).toBe('a.');
    expect(markenAnzeige('1')).toBe('1.');
    expect(markenAnzeige('BE')).toBe('BE:');
    expect(markenAnzeige('–')).toBe('–');
  });
});
