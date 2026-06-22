import { describe, it, expect } from 'vitest';
import { extrahiereStruktur } from '../../scripts/normtext/struktur-extrahiere.ts';

// Artikel-eigene h6-Überschrift („Art. N <Sachtitel>") wie bei BV/ZPO/StPO usw.,
// wo der Randtitel IM Artikel-h6 steht (statt als separater div.heading wie OR/ZGB).
// Fedlex setzt die Nummer in <b>/<i>, Fussnoten in <sup>; der Rest ist der Sachtitel.
function artikel(id: string, h6Inner: string): string {
  return `<article id="${id}"><h6 class="heading">${h6Inner}</h6>`
    + `<div class="collapseable"><p class="absatz ">Text.</p></div></article>`;
}

describe('extrahiereStruktur — Artikel-h6-Sachtitel (BV-Manier)', () => {
  it('zieht den Sachtitel aus „Art. N <Titel>"', () => {
    const html = artikel('art_5', '<a href="#art_5"><b>Art. 5</b><b></b> <b></b>Grundsätze rechtsstaatlichen Handelns</a>');
    expect(extrahiereStruktur(html)['5'].marginalie).toEqual(['Grundsätze rechtsstaatlichen Handelns']);
  });

  it('behandelt Nummern-Suffix <i> und Fussnoten-<sup> korrekt', () => {
    const html = artikel('art_5_a', '<a href="#art_5_a"><b>Art. 5</b><i>a</i></a><sup><a href="#fn-x" id="fnbck-x">2</a></sup><a href="#art_5_a"> Subsidiarität</a>');
    expect(extrahiereStruktur(html)['5_a'].marginalie).toEqual(['Subsidiarität']);
  });

  it('lässt kombinierte Artikel ohne Sachtitel leer („Art. 370 und 371")', () => {
    const html = artikel('art_370_371', '<a href="#art_370_371"><b>Art. 370</b> und <b>371</b></a><sup><a href="#fn-y" id="fnbck-y">586</a></sup>');
    expect(extrahiereStruktur(html)['370_371'].marginalie).toEqual([]);
  });

  it('behält Enumerator-Titel („b. Bei- und Austritt")', () => {
    const html = artikel('art_94', '<a href="#art_94"><b>Art. 94</b> <b> </b>b. Bei- und Austritt, Wechsel der Franchise</a>');
    expect(extrahiereStruktur(html)['94'].marginalie).toEqual(['b. Bei- und Austritt, Wechsel der Franchise']);
  });

  it('liefert keinen Sachtitel bei reiner Nummer („Art. 3", OR-Manier)', () => {
    const html = artikel('art_3', '<a href="#art_3"><b>Art. 3</b></a>');
    expect(extrahiereStruktur(html)['3'].marginalie).toEqual([]);
  });
});
