import { describe, it, expect } from 'vitest';
import { parsePassus, textFragment } from '../lib/normtext/passus';

describe('parsePassus', () => {
  it('liest Artikel-Token und Absatz aus einem OR-Zitat', () => {
    expect(parsePassus('Art. 335c Abs. 1 OR')).toEqual({ artikelToken: '335_c', absatz: '1' });
  });
  it('liest Paragraf + Absatz (kantonal)', () => {
    expect(parsePassus('§ 4 Abs. 1')).toEqual({ artikelToken: '4', absatz: '1' });
  });
  it('ohne Absatz → absatz null', () => {
    expect(parsePassus('Art. 96 ZPO')).toEqual({ artikelToken: '96', absatz: null });
  });
  it('lit.-Angabe wird als eigene Verfeinerung (lit) erkannt', () => {
    expect(parsePassus('Art. 6 Abs. 1 lit. h StG')).toEqual({ artikelToken: '6', absatz: '1', lit: 'h' });
  });
  it('Bst.-Angabe (Synonym für lit.) wird als lit erkannt', () => {
    expect(parsePassus('§ 3 Abs. 1 Bst. a')).toEqual({ artikelToken: '3', absatz: '1', lit: 'a' });
  });
  it('Ziff.-Angabe wird als ziff erkannt', () => {
    expect(parsePassus('§ 11 Ziff. 17')).toEqual({ artikelToken: '11', absatz: null, ziff: '17' });
  });
  // B2: lateinische Absatz-Suffixe (bis/ter/…) dürfen nicht verstümmelt werden
  // («Abs. 1bis» wurde früher zu «1b»).
  it('Absatz mit lat. Suffix «1bis» bleibt vollständig (B2 — kein «1b»)', () => {
    expect(parsePassus('Art. 5 Abs. 1bis OR')).toEqual({ artikelToken: '5', absatz: '1bis' });
  });
  it('Absatz mit lat. Suffix «2ter» bleibt vollständig', () => {
    expect(parsePassus('Art. 5 Abs. 2ter OR')).toEqual({ artikelToken: '5', absatz: '2ter' });
  });
  // B3: «litera a» darf nicht als lit «e» (Match mitten im Wort «litera»)
  // fehlinterpretiert werden — Schlüsselwort braucht Wortgrenze/Punkt.
  it('«litera a» liefert KEIN fälschliches lit «e» (B3 — Wortgrenze)', () => {
    const p = parsePassus('Art. 6 litera a OR')!;
    expect(p.lit).not.toBe('e');
  });
  it('echtes «lit. a» wird weiterhin erkannt (B3 — kein Regress)', () => {
    expect(parsePassus('Art. 6 Abs. 1 lit. a OR')).toEqual({ artikelToken: '6', absatz: '1', lit: 'a' });
  });
  it('lit ohne Angabe bleibt weggelassen (Bestandskompat. — keine leeren Felder)', () => {
    const p = parsePassus('Art. 336 OR')!;
    expect(p).toEqual({ artikelToken: '336', absatz: null });
    expect('lit' in p).toBe(false);
    expect('ziff' in p).toBe(false);
  });
  it('kein Artikel im Text → null', () => {
    expect(parsePassus('siehe oben')).toBeNull();
  });
});

describe('textFragment', () => {
  it('baut ein gekürztes #:~:text=-Fragment aus den ersten Wörtern', () => {
    expect(textFragment('Der Arbeitgeber kann das Arbeitsverhältnis nicht kündigen, solange …'))
      .toBe('#:~:text=Der%20Arbeitgeber%20kann%20das%20Arbeitsverh%C3%A4ltnis%20nicht');
  });
});
