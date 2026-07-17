import { describe, it, expect } from 'vitest';
import { extrahiereStrukturLexWork } from '../../scripts/normtext/struktur-lexwork.ts';
import { extrahiereAlleLexWorkArtikel } from '../../scripts/normtext/adapter-lexwork.ts';
import { normalisiereArtikelToken } from '../../scripts/normtext/lexwork-token.ts';

// Regression F-2 (16.7.2026): Der Struktur-Extraktor bildete Buchstaben-Suffix-
// Artikel als «2a», die Snapshot-`artikel`-Schlüssel (Adapter) aber als «2_a».
// Der Runner-Filter (struktur-kanton-run.ts, a.tokens.has) verwarf daher jeden
// Suffix-Artikel → Gliederung/Marginalie fehlten korpusweit. Fix = beide Seiten
// nutzen normalisiereArtikelToken (SSoT §5).

// Minimales LexWork-xhtml_tol, live-getreu (BS 131.100): ein Gliederungstitel +
// ein Suffix-Artikel «§ 2a», dessen Nummer — wie bei Novellen-/geänderten
// Artikeln real — den Änderungsmarker «&nbsp;<strong>*</strong>» trägt. Genau
// dieser Marker liess den alten `clean`-Pfad «2a *» statt «2a» bilden (F-2-Wurzel).
const XHTML =
  "<div class='title level_1'><span class='number'>1</span>" +
  "<span class='title_text'>Grundzüge</span></div>" +
  "<div class='article'><div class='article_number'>" +
  "<span class='article_symbol'>§</span><span class='number'>2a&nbsp;<strong>*</strong></span></div>" +
  "<div class='article_title'><span class='title_text'>Volksinitiativen</span></div></div>";

describe('LexWork Struktur ↔ Adapter — Suffix-Token-Kongruenz (F-2)', () => {
  it('bildet den Suffix-Artikel als «2_a», nicht «2a»', () => {
    const struktur = extrahiereStrukturLexWork(XHTML);
    expect(Object.keys(struktur)).toContain('2_a');
    expect(Object.keys(struktur)).not.toContain('2a');
    expect(struktur['2_a'].marginalie).toEqual(['Volksinitiativen']);
    expect(struktur['2_a'].gliederung.at(-1)?.label).toBe('1 Grundzüge');
  });

  it('Struktur-Token == Adapter-Snapshot-Token (Runner-Filter greift)', () => {
    const strukturKeys = Object.keys(extrahiereStrukturLexWork(XHTML));
    const adapterKeys = Object.keys(extrahiereAlleLexWorkArtikel(XHTML).artikel);
    expect(adapterKeys).toContain('2_a');
    // Jeder Struktur-Token muss im Adapter-Token-Set vorkommen (a.tokens.has).
    for (const k of strukturKeys) expect(adapterKeys).toContain(k);
  });

  it('extrahiert Gliederung reihenfolge-unabhängig (Befund B1: «level_N title»)', () => {
    // LexWork liefert die Titel-Klasse in beiden Reihenfolgen. BS-131.100 nutzt
    // «level_1 title» (level zuerst) — der frühere Ausdruck «title level_N» hätte
    // die Gliederung still verworfen.
    const xhtmlRev =
      "<div class='level_1 title'><span class='number'>I.</span>" +
      "<span class='title_text'>Initiative</span></div>" +
      "<div class='level_2 title'><span class='number'>I.A.</span>" +
      "<span class='title_text'>Arten der Initiative</span></div>" +
      "<div class='article'><div class='article_number'>" +
      "<span class='article_symbol'>§</span><span class='number'>2a&nbsp;<strong>*</strong></span></div>" +
      "<div class='article_title'><span class='title_text'>Volksinitiativen</span></div></div>";
    const s = extrahiereStrukturLexWork(xhtmlRev);
    expect(s['2_a'].gliederung.map((g) => g.label)).toEqual([
      'I. Initiative',
      'I.A. Arten der Initiative',
    ]);
  });

  it('Gliederungs-Label: sup-Exponent ohne Leerzeichen, kein Fussnoten-/Marker-Leak (B3/B4)', () => {
    // number «I.A.<sup>bis</sup>» → «I.A.bis» (nicht «I.A. bis»); title_text mit
    // Fussnoten-Anker «[2]» + Änderungsmarker «*» → beide gestrippt.
    const xhtml =
      "<div class='level_1 title'><span class='number'>I.A.<sup>bis</sup></span>" +
      "<span class='title_text'>Volksinitiative und Gemeindeinitiative&nbsp;<strong>*</strong></span></div>" +
      "<div class='level_2 title'><span class='number'>I.A.</span>" +
      "<span class='title_text'>Arten der Initiative<a class=\"footnote\" href=\"#x\" id=\"x\">[2]</a></span></div>" +
      "<div class='article'><div class='article_number'>" +
      "<span class='article_symbol'>§</span><span class='number'>3</span></div>" +
      "<div class='article_title'><span class='title_text'>Test</span></div></div>";
    const s = extrahiereStrukturLexWork(xhtml);
    expect(s['3'].gliederung.map((g) => g.label)).toEqual([
      'I.A.bis Volksinitiative und Gemeindeinitiative',
      'I.A. Arten der Initiative',
    ]);
  });

  it('Gliederungs-Label: aufgehobener Titel (abrogation_ellip) nicht dupliziert (B5)', () => {
    const xhtml =
      "<div class='level_3 title'><span class='number'>4.C.II.I.<sup>bis</sup></span>" +
      "<span class='abrogation_ellip'>&hellip;&nbsp;<strong>*</strong></span></div>" +
      "<div class='article'><div class='article_number'>" +
      "<span class='article_symbol'>§</span><span class='number'>76a</span></div>" +
      "<div class='article_title'><span class='title_text'>X</span></div></div>";
    const s = extrahiereStrukturLexWork(xhtml);
    // «4.C.II.I.bis …» — NICHT «4.C.II.I.bis 4.C.II.I.bis … *».
    expect(s['76_a'].gliederung.at(-1)?.label).toBe('4.C.II.I.bis …');
  });

  it('normalisiereArtikelToken: geteilte SSoT-Transformation', () => {
    expect(normalisiereArtikelToken('2a')).toBe('2_a');
    expect(normalisiereArtikelToken('335bis')).toBe('335_bis');
    expect(normalisiereArtikelToken('17a')).toBe('17_a');
    expect(normalisiereArtikelToken('3')).toBe('3'); // reine Nummer unverändert
  });
});
