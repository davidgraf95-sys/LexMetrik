/**
 * Tests für den generischen HTML-Entity-Dekoder (scripts/normtext/html-entities.ts).
 *
 * Prüft alle in der Aufgabe geforderten Fälle sowie die in den Snapshots
 * empirisch aufgetretenen Entities (hellip, permil, ocirc, rsquo u.a.).
 */
import { describe, it, expect } from 'vitest';
import { dekodiereEntities } from '../../scripts/normtext/html-entities';

describe('dekodiereEntities', () => {
  // ── Pflichtfälle aus Aufgabe ──────────────────────────────────────────────

  it('dekodiert &hellip; → …', () => {
    expect(dekodiereEntities('2&hellip;')).toBe('2…');
  });

  it('dekodiert &#167; (dezimal) → §', () => {
    expect(dekodiereEntities('&#167;')).toBe('§');
  });

  it('dekodiert &#xA7; (hex) → §', () => {
    expect(dekodiereEntities('&#xA7;')).toBe('§');
  });

  it('dekodiert &uuml; → ü', () => {
    expect(dekodiereEntities('&uuml;')).toBe('ü');
  });

  it('dekodiert &amp; → &', () => {
    expect(dekodiereEntities('&amp;')).toBe('&');
  });

  it('dekodiert &nbsp; → normales Leerzeichen', () => {
    expect(dekodiereEntities('&nbsp;')).toBe(' ');
  });

  // ── Basis-Entities ────────────────────────────────────────────────────────

  it('dekodiert &lt; und &gt;', () => {
    expect(dekodiereEntities('&lt;b&gt;')).toBe('<b>');
  });

  it('dekodiert &quot;', () => {
    expect(dekodiereEntities('&quot;')).toBe('"');
  });

  it('dekodiert &apos;', () => {
    expect(dekodiereEntities('&apos;')).toBe("'");
  });

  // ── Interpunktion / Sonderzeichen ─────────────────────────────────────────

  it('dekodiert &sect; → §', () => {
    expect(dekodiereEntities('&sect;')).toBe('§');
  });

  it('dekodiert &ndash; → –', () => {
    expect(dekodiereEntities('&ndash;')).toBe('–');
  });

  it('dekodiert &mdash; → —', () => {
    expect(dekodiereEntities('&mdash;')).toBe('—');
  });

  it('dekodiert &laquo; und &raquo;', () => {
    expect(dekodiereEntities('&laquo;Test&raquo;')).toBe('«Test»');
  });

  it('dekodiert &bdquo; und &ldquo; und &rdquo;', () => {
    expect(dekodiereEntities('&bdquo;Hallo&rdquo;')).toBe('„Hallo"');
    expect(dekodiereEntities('&ldquo;Welt&rdquo;')).toBe('"Welt"');
  });

  it('dekodiert &lsquo; und &rsquo;', () => {
    expect(dekodiereEntities("&lsquo;Don&rsquo;t")).toBe('‘Don’t');
  });

  it('dekodiert &middot;', () => {
    expect(dekodiereEntities('a&middot;b')).toBe('a·b');
  });

  // ── Mathematik ────────────────────────────────────────────────────────────

  it('dekodiert &times;', () => {
    expect(dekodiereEntities('3&times;4')).toBe('3×4');
  });

  it('dekodiert &deg;', () => {
    expect(dekodiereEntities('180&deg;')).toBe('180°');
  });

  it('dekodiert &euro;', () => {
    expect(dekodiereEntities('100&euro;')).toBe('100€');
  });

  it('dekodiert &permil; → ‰', () => {
    expect(dekodiereEntities('1&permil;')).toBe('1‰');
  });

  it('dekodiert &frac12; → ½', () => {
    expect(dekodiereEntities('&frac12;&permil;')).toBe('½‰');
  });

  it('dekodiert &radic; → √', () => {
    expect(dekodiereEntities('&radic;')).toBe('√');
  });

  // ── BS-Audit 23.6.2026 (T1/S1) — empirisch im Korpus gefundene Entities ────

  it('dekodiert Hochzahlen &sup1; &sup2; &sup3; → ¹ ² ³', () => {
    expect(dekodiereEntities('&sup1;&sup2;&sup3;')).toBe('¹²³');
  });

  it('dekodiert &ge; → ≥ und &le; → ≤ (Tarif-/Grenzwert-SCHWELLEN, inhaltlich)', () => {
    // BS-772.110 «U &le; 0,15», BS-772.430 «Vorjahresverbrauch &ge;13 MWh».
    expect(dekodiereEntities('U &le; 0,15')).toBe('U ≤ 0,15');
    expect(dekodiereEntities('Vorjahresverbrauch &ge;13 MWh')).toBe('Vorjahresverbrauch ≥13 MWh');
  });

  it('dekodiert &mu; → µ (BS-781.500 «&mu;g/m&sup2;»)', () => {
    expect(dekodiereEntities('75 &mu;g/m&sup2;')).toBe('75 µg/m²');
  });

  it('dekodiert &eta; → η (AR-750.11 Nutzungsgrad)', () => {
    expect(dekodiereEntities('Nutzungsgraden &eta; der')).toBe('Nutzungsgraden η der');
  });

  it('dekodiert &plusmn; → ± (BS-563.210 Toleranz «&plusmn;10»)', () => {
    expect(dekodiereEntities('550 cm&sup2; &plusmn;10')).toBe('550 cm² ±10');
  });

  it('dekodiert &divide; → ÷ (BS-650.510 Formel)', () => {
    expect(dekodiereEntities('H = L &divide; 0')).toBe('H = L ÷ 0');
  });

  it('dekodiert &not; → ¬ (RiE 162.110, Quell-Eigenheit)', () => {
    expect(dekodiereEntities('Mitarbei&not;ter')).toBe('Mitarbei¬ter');
  });

  it('dekodiert &reg; → ® (BS-772.110 «MINERGIE&reg;»)', () => {
    expect(dekodiereEntities('MINERGIE&reg;-Zertifikat')).toBe('MINERGIE®-Zertifikat');
  });

  it('dekodiert &frasl; → ⁄ (ZG-641.1 Bruchstrich «1&frasl;2»)', () => {
    expect(dekodiereEntities('über 1&frasl;2 Stunde')).toBe('über 1⁄2 Stunde');
  });

  it('dekodiert &acirc; → â und &Acirc; → Â (Bâle, FR-Korpus)', () => {
    expect(dekodiereEntities('B&acirc;le-Ville')).toBe('Bâle-Ville');
    expect(dekodiereEntities('&Acirc;')).toBe('Â');
  });

  // ── Deutsche Umlaute ──────────────────────────────────────────────────────

  it('dekodiert &auml; &ouml; &uuml; &szlig;', () => {
    expect(dekodiereEntities('&auml;&ouml;&uuml;&szlig;')).toBe('äöüß');
  });

  it('dekodiert &Auml; &Ouml; &Uuml;', () => {
    expect(dekodiereEntities('&Auml;&Ouml;&Uuml;')).toBe('ÄÖÜ');
  });

  // ── Französische Zeichen ─────────────────────────────────────────────────

  it('dekodiert &eacute; &egrave; &ecirc; &agrave; &ccedil;', () => {
    expect(dekodiereEntities('&eacute;&egrave;&ecirc;&agrave;&ccedil;')).toBe('éèêàç');
  });

  it('dekodiert &ocirc; &ucirc; &ugrave; (empirisch aus Snapshots)', () => {
    expect(dekodiereEntities('&ocirc;&ucirc;&ugrave;')).toBe('ôûù');
  });

  // ── Numerische Entities ──────────────────────────────────────────────────

  it('dekodiert &#x2026; (hex für …)', () => {
    expect(dekodiereEntities('&#x2026;')).toBe('…');
  });

  it('dekodiert &#8230; (dezimal für …)', () => {
    expect(dekodiereEntities('&#8230;')).toBe('…');
  });

  it('dekodiert gemischte numerische hex/dezimal', () => {
    expect(dekodiereEntities('&#xE9;&#233;')).toBe('éé');
  });

  // ── Kein Doppel-Dekodieren ───────────────────────────────────────────────

  it('dekodiert &amp;amp; NICHT doppelt → &amp; (ampersand bleibt)', () => {
    // &amp;amp; → erst &amp; → dann & → NEIN: die benannte Phase läuft linear
    // und &amp;amp; → in Schritt 2 wird &amp; → & gemacht, der Rest "amp;" bleibt
    // Resultat: &amp;amp; → &amp; → "&" + "amp;" → "& amp;"? Nein:
    // Da wir split/join verwenden: "&amp;amp;" enthält "&amp;" als Substring →
    // wird zu "&" + "amp;" → "&amp;" — also korrekt: kein Doppel-Dekodieren.
    expect(dekodiereEntities('&amp;amp;')).toBe('&amp;');
  });

  it('lässt unbekannte Entities unberührt', () => {
    expect(dekodiereEntities('&foo;')).toBe('&foo;');
  });

  // ── Reale Normtext-Fälle ─────────────────────────────────────────────────

  it('dekodiert aufgehobener Absatz «² &hellip;»', () => {
    expect(dekodiereEntities('² &hellip;')).toBe('² …');
  });

  it('dekodiert gemischten Text (Praxisfall SH-211.433)', () => {
    const input = '1&permil; der Vertragssumme, mindestens Fr. 50.00 &frac12;&permil;';
    expect(dekodiereEntities(input)).toBe('1‰ der Vertragssumme, mindestens Fr. 50.00 ½‰');
  });

  it('lässt reinen Text ohne Entities unverändert', () => {
    const s = 'Das Arbeitsverhältnis kann im ersten Dienstjahr…';
    expect(dekodiereEntities(s)).toBe(s);
  });
});
