import { describe, it, expect } from 'vitest';
import {
  alleArtikelTokens,
  alleSchlussteilAnker,
  ankerZuToken,
  schlussteilLabelSuffix,
  extrahiereArtikelAusAnker,
  extrahiereArtikel,
  entferneFussnotenSups,
} from '../../scripts/normtext/extrahiere-fedlex';

describe('alleArtikelTokens', () => {
  // Mini-HTML mit 3 Artikeln: numerisch, Buchstaben-Suffix, 2-stufig
  const MINI_HTML = `
    <html><body>
      <article id="art_1"><p class="absatz "><sup>1</sup>&nbsp;Erster Artikel.</p></article>
      <article id="art_2_a"><p class="absatz "><sup>1</sup>&nbsp;Zweiter Artikel (Buchstaben-Token).</p></article>
      <article id="art_335_c"><p class="absatz "><sup>1</sup>&nbsp;Dritter Artikel.</p></article>
    </body></html>
  `;

  // Struktureller Nicht-Artikel-Anker (keine führende Ziffer) — muss AUSGESCHLOSSEN werden
  const HTML_MIT_NICHTARTIKEL = `
    <html><body>
      <article id="art_1"><p class="absatz ">Text.</p></article>
      <div id="art_SchlusstitelUebergang">Nicht ein Artikel</div>
      <article id="art_2"><p class="absatz ">Text.</p></article>
    </body></html>
  `;

  // Duplikate im HTML (sollte dedupliziert werden)
  const HTML_MIT_DUPLIKATEN = `
    <html><body>
      <article id="art_1"><p class="absatz ">Erster Vorkommen.</p></article>
      <article id="art_1"><p class="absatz ">Zweites Vorkommen (Duplikat).</p></article>
      <article id="art_2"><p class="absatz ">Text.</p></article>
    </body></html>
  `;

  it('extrahiert 3 Tokens in HTML-Reihenfolge', () => {
    const tokens = alleArtikelTokens(MINI_HTML);
    expect(tokens).toEqual(['1', '2_a', '335_c']);
  });

  it('schliesst Tokens ohne führende Ziffer aus', () => {
    const tokens = alleArtikelTokens(HTML_MIT_NICHTARTIKEL);
    expect(tokens).toEqual(['1', '2']);
    expect(tokens).not.toContain('SchlusstitelUebergang');
  });

  it('M9/G7: doppeltes Token wird nicht verworfen, sondern __2-suffixiert', () => {
    // Geändert mit M9 (§6 fachliche Änderung): das zweite Vorkommen eines Tokens
    // ging zuvor stumm verloren («erster gewinnt») — jetzt als «__2» erhalten,
    // damit der zweite Artikel (z.B. KKV 126z tredecies) nicht fehlt (§8).
    const tokens = alleArtikelTokens(HTML_MIT_DUPLIKATEN);
    expect(tokens).toEqual(['1', '1__2', '2']);
  });

  it('liefert leeres Array bei leerem HTML', () => {
    expect(alleArtikelTokens('')).toEqual([]);
  });

  it('liefert leeres Array wenn keine art_-Anker vorhanden', () => {
    expect(alleArtikelTokens('<html><body><p>kein Artikel</p></body></html>')).toEqual([]);
  });

  it('M13: erfasst die disp-Schlusstitel-Anker NICHT (eigener Pfad)', () => {
    const html = `<article id="art_1"><p class="absatz ">A.</p></article>
      <article id="disp_u1/art_1"><p class="absatz ">Schlusstitel A.</p></article>`;
    // alleArtikelTokens bleibt digit-only — der Schlusstitel kommt über alleSchlussteilAnker.
    expect(alleArtikelTokens(html)).toEqual(['1']);
  });
});

// ── M13: Schlusstitel-/UeB-/Schlussbestimmungs-Pfad (disp_uN/art_*) ───────────
describe('alleSchlussteilAnker (M13)', () => {
  const SCHLUSS_HTML = `
    <div id="dispositions">
      <section id="disp_u1"><h1 class="heading">Schlusstitel</h1>
        <article id="disp_u1/art_1"><p class="absatz "><sup>1</sup>&nbsp;Erster Schlusstitel-Artikel.</p></article>
        <article id="disp_u1/art_6_b_bis"><p class="absatz ">Mit lat. Suffix.</p></article>
        <article id="disp_u1/art_31_32"><p class="absatz ">…</p></article>
      </section>
      <section id="disp_u2"><h1 class="heading">Wortlaut der früheren Bestimmungen</h1>
        <article id="disp_u2/art_178"><p class="absatz ">Andere Division, gleiche Nr. wie Haupttext.</p></article>
      </section>
    </div>`;

  it('liefert die vollen disp-Anker in HTML-Reihenfolge', () => {
    expect(alleSchlussteilAnker(SCHLUSS_HTML)).toEqual([
      'disp_u1/art_1',
      'disp_u1/art_6_b_bis',
      'disp_u1/art_31_32',
      'disp_u2/art_178',
    ]);
  });

  it('ignoriert strukturelle disp-Anker (chap/lvl) und Haupttext-Artikel', () => {
    const html = `<article id="art_5"><p class="absatz ">Haupttext.</p></article>
      <section id="disp_u1/chap_1"><div class="heading" id="disp_u1/chap_1/lvl_A">A.</div>
      <article id="disp_u1/art_1"><p class="absatz ">S.</p></article></section>`;
    expect(alleSchlussteilAnker(html)).toEqual(['disp_u1/art_1']);
  });

  it('dedupliziert doppelte disp-Anker mit __N-Suffix', () => {
    const html = `<article id="disp_u1/art_1"><p class="absatz ">Erst.</p></article>
      <article id="disp_u1/art_1"><p class="absatz ">Zweit.</p></article>`;
    expect(alleSchlussteilAnker(html)).toEqual(['disp_u1/art_1', 'disp_u1/art_1__2']);
  });

  it('liefert leeres Array, wenn das Gesetz keinen Schlussteil hat', () => {
    expect(alleSchlussteilAnker('<article id="art_1"><p>x</p></article>')).toEqual([]);
  });

  it('erfasst auch die «disp_N»-Variante OHNE «u» (z.B. VZG-Schlussbestimmungen)', () => {
    const html = `<article id="art_134"><p class="absatz ">Haupttext.</p></article>
      <article id="disp_1/art_135"><p class="absatz ">Schlussbestimmung.</p></article>
      <article id="disp_1/art_136"><p class="absatz ">…</p></article>`;
    expect(alleSchlussteilAnker(html)).toEqual(['disp_1/art_135', 'disp_1/art_136']);
    expect(ankerZuToken('disp_1/art_135')).toBe('disp_1_art_135');
  });
});

describe('ankerZuToken / schlussteilLabelSuffix (M13)', () => {
  it('Haupttext-Anker bleiben byte-gleich (slice art_)', () => {
    expect(ankerZuToken('art_335_c')).toBe('335_c');
    expect(ankerZuToken('art_977')).toBe('977');
  });
  it('disp-Anker werden kollisionsfrei (/ → _)', () => {
    expect(ankerZuToken('disp_u1/art_1')).toBe('disp_u1_art_1');
    expect(ankerZuToken('disp_u2/art_178')).toBe('disp_u2_art_178');
    expect(ankerZuToken('disp_u1/art_1__2')).toBe('disp_u1_art_1__2');
  });
  it('Token kollidiert NICHT mit gleicher Haupttext-Nummer', () => {
    expect(ankerZuToken('disp_u2/art_178')).not.toBe(ankerZuToken('art_178'));
  });
  it('Label-Suffix = reine Artikel-Nummer (für artikelLabel)', () => {
    expect(schlussteilLabelSuffix('disp_u1/art_1')).toBe('1');
    expect(schlussteilLabelSuffix('disp_u1/art_6_b_bis')).toBe('6_b_bis');
    expect(schlussteilLabelSuffix('disp_u1/art_31_32__2')).toBe('31_32');
  });
});

describe('extrahiereArtikelAusAnker (M13)', () => {
  it('extrahiert einen disp-Schlusstitel-Artikel wie einen Haupttext-Artikel', () => {
    const html = `<article id="disp_u1/art_1"><h6 class="heading"><a href="#disp_u1/art_1"><b>Art. 1</b></a></h6><div class="collapseable"><p class="absatz "><sup>1</sup>&nbsp;Erster Absatz.</p><p class="absatz "><sup>2</sup>&nbsp;Zweiter Absatz.</p></div></article>`;
    const e = extrahiereArtikelAusAnker(html, 'disp_u1/art_1');
    expect(e?.bloecke.map((b) => b.absatz)).toEqual(['1', '2']);
    expect(e?.bloecke[0].text).toBe('Erster Absatz.');
  });

  it('löst den __N-Suffix auf das N-te Vorkommen auf', () => {
    const html = `<article id="disp_u1/art_1"><div class="collapseable"><p class="absatz ">Erst.</p></div></article><article id="disp_u1/art_1"><div class="collapseable"><p class="absatz ">Zweit.</p></div></article>`;
    expect(extrahiereArtikelAusAnker(html, 'disp_u1/art_1')?.bloecke[0].text).toBe('Erst.');
    expect(extrahiereArtikelAusAnker(html, 'disp_u1/art_1__2')?.bloecke[0].text).toBe('Zweit.');
  });

  it('extrahiereArtikel(token) ist die anker-Variante mit art_-Präfix (byte-gleich)', () => {
    const html = `<article id="art_77"><div class="collapseable"><p class="absatz "><sup>1</sup>&nbsp;Text.</p></div></article>`;
    expect(extrahiereArtikel(html, '77')).toEqual(extrahiereArtikelAusAnker(html, 'art_77'));
  });
});

// Regression (Bug-Befund 25.6.2026): Fussnoten-Ziffern-Leak im Fallback-Zweig.
// Artikel, deren einziger Inhalt ein <p> mit Nicht-«absatz»-Klasse ist
// (z.B. class="inkrafttreten"), trafen keinen Block-Zweig → Fallback. Der
// Fallback strippte die <sup><a>NNN</a></sup>-Fussnote NICHT → die Ziffer
// leakte in den Normtext (DBG art_222 «…1995 337», VwVG art_17).
describe('Fussnoten-Marker werden auch im Fallback-Zweig entfernt', () => {
  const HTML_DBG_222 = `
    <html><body>
    <article id="art_222"><a name="a222"></a><h6 class="heading"><a href="#art_222"><b>Art.&nbsp;222</b></a><sup><a href="#fn-336">336</a></sup></h6><div class="collapseable"><p class="inkrafttreten man-space-before-20">Datum des Inkrafttretens: 1. Januar 1995<sup><a href="#fn-337" id="fnbck-337">337</a></sup></p><div class="footnotes"><p id="fn-337"><sup><a href="#fnbck-337">337</a></sup> BRB vom 3. Juni 1991</p></div></div></article>
    </body></html>
  `;
  it('lässt KEINE Fussnoten-Ziffer im Text stehen', () => {
    const r = extrahiereArtikel(HTML_DBG_222, '222');
    expect(r).not.toBeNull();
    expect(r!.bloecke).toHaveLength(1);
    expect(r!.bloecke[0].text).toBe('Datum des Inkrafttretens: 1. Januar 1995');
    expect(r!.bloecke[0].text).not.toMatch(/33[67]/);
  });

  it('entferneFussnotenSups entfernt Marker samt Ziffer, robust gegen <inl>/Whitespace', () => {
    expect(entferneFussnotenSups('Text<sup><a href="#x">12</a></sup>.')).toBe('Text.');
    expect(entferneFussnotenSups('Text<sup> <inl><a href="#x">12</a></inl> </sup>.')).toBe('Text.');
    // Absatznummer-<sup> OHNE <a> bleibt unberührt
    expect(entferneFussnotenSups('<sup>2</sup>Absatztext')).toBe('<sup>2</sup>Absatztext');
  });
});
