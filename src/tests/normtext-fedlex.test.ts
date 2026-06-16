/**
 * Test-Fixture: echte Ausschnitte aus /tmp/or.html und /tmp/zpo.html
 * (Fedlex-Filestore, konsolidierte Fassungen 20260101/20250101).
 *
 * Struktur aus SPIKE (16.6.2026) belegt:
 *   - Artikel: <article id="art_TOKEN">...</article>
 *   - Absatz-Container: <p class="absatz ..."> (class enthält "absatz" als Teilstring)
 *   - Absatznummer: erstes <sup> im <p>, das NUR Ziffern/Buchstaben enthält (kein <a>-Kind)
 *   - Fussnoten-<sup> enthalten <a href="...">-Kinder → werden NICHT als Absatznummer erkannt
 *   - Absätze ohne führendes <sup> (Unterparagraphen) erhalten absatz: null
 */
import { describe, it, expect } from 'vitest';
import { extrahiereArtikel } from '../../scripts/normtext/extrahiere-fedlex';

// ── Fixture 1: OR Art. 77 (3 nummerierte Absätze + 1 Unterabsatz ohne Nummer) ──
// Echter Ausschnitt aus /tmp/or.html (Konsolidierung 20260101)
const OR_ART_77 = `<article id="art_77"><a name="a77"></a><h6 class="heading " role="heading"><span class="display-icon"></span><span class="external-link-icon"></span><a href="#art_77"><b>Art. 77</b></a></h6><div class="collapseable"><p class="absatz man-space-before-4 "><sup>1</sup>&nbsp;Soll die Erfüllung einer Verbindlichkeit oder eine andere Rechtshandlung mit dem Ablaufe einer bestimmten Frist nach Abschluss des Vertrages erfolgen, so fällt ihr Zeitpunkt:</p><dl class="man-space-after-0 "><dt class="man-space-before-4  ">1. </dt><dd class="man-space-before-4  ">wenn die Frist nach Tagen bestimmt ist, auf den letzten Tag der Frist, wobei der Tag, an dem der Vertrag geschlossen wurde, nicht mitgerechnet und, wenn die Frist auf acht oder 15&nbsp;Tage lautet, nicht die Zeit von einer oder zwei Wochen verstanden wird, sondern volle acht oder 15 Tage;</dd><dt class="man-space-before-4  ">2. </dt><dd class="man-space-before-4  ">wenn die Frist nach Wochen bestimmt ist, auf denjenigen Tag der letzten Woche, der durch seinen Namen dem Tage des Vertragsabschlusses entspricht;</dd><dt class="man-space-before-4  ">3. </dt><dd class="man-space-before-4  ">wenn die Frist nach Monaten oder einem mehrere Monate umfassenden Zeitraume (Jahr, halbes Jahr, Vierteljahr) bestimmt ist, auf denjenigen Tag des letzten Monates, der durch seine Zahl dem Tage des Vertragsabschlusses entspricht, und, wenn dieser Tag in dem letzten Monate fehlt, auf den letzten Tag dieses Monates.</dd></dl><p class="absatz man-space-before-4 ">Der Ausdruck «halber Monat» wird einem Zeitraume von 15 Tagen gleichgeachtet, die, wenn eine Frist auf einen oder mehrere Monate und einen halben Monat lautet, zuletzt zu zählen sind.</p><p class="absatz man-space-before-4 "><sup>2</sup>&nbsp;In gleicher Weise wird die Frist auch dann berechnet, wenn sie nicht von dem Tage des Vertragsabschlusses, sondern von einem andern Zeitpunkte an zu laufen hat.</p><p class="absatz man-space-before-4 "><sup>3</sup>&nbsp;Soll die Erfüllung innerhalb einer bestimmten Frist geschehen, so muss sie vor deren Ablauf erfolgen.</p></div></article>`;

// ── Fixture 2: OR Art. 335c (3 nummerierte Absätze, Abs. 3 mit Fussnoten-<sup>) ──
// Echter Ausschnitt aus /tmp/or.html (Konsolidierung 20260101)
const OR_ART_335_C = `<article id="art_335_c"><a name="a335c"></a><h6 class="heading " role="heading"><span class="display-icon"></span><span class="external-link-icon"></span><a href="#art_335_c"><b>Art. 335</b><i>c</i></a><sup><a href="#fn-d7e11575" id="fnbck-d7e11575">187</a></sup></h6><div class="collapseable"><p class="absatz man-space-before-4 "><sup>1</sup>&nbsp;Das Arbeitsverhältnis kann im ersten Dienstjahr mit einer Kündigungsfrist von einem Monat, im zweiten bis und mit dem neunten Dienstjahr mit einer Frist von zwei Monaten und nachher mit einer Frist von drei Monaten je auf das Ende eines Monats gekündigt werden.</p><p class="absatz man-space-before-4 "><sup>2</sup>&nbsp;Diese Fristen dürfen durch schriftliche Abrede, Normalarbeitsvertrag oder Gesamtarbeitsvertrag abgeändert werden; unter einen Monat dürfen sie jedoch nur durch Gesamtarbeitsvertrag und nur für das erste Dienstjahr herabgesetzt werden.</p><p class="absatz man-space-before-4 "><sup>3</sup>&nbsp;Kündigt der Arbeitgeber das Arbeitsverhältnis und hat die Arbeitnehmerin oder der Arbeitnehmer vor Ende des Arbeitsverhältnisses Anspruch auf den Urlaub des andern Elternteils nach Artikel 329<i>g</i>, so wird die Kündigungsfrist um die noch nicht bezogenen Urlaubstage verlängert.<sup><a href="#fn-d7e11606" id="fnbck-d7e11606">188</a></sup></p><div class="footnotes"><p id="fn-d7e11575"><sup><a href="#fnbck-d7e11575">187</a></sup><sup></sup><sup> </sup>Eingefügt durch Ziff. I des BG vom 18. März 1988, in Kraft seit 1. Jan. 1989.</p><p id="fn-d7e11606"><sup><a href="#fnbck-d7e11606">188</a></sup><sup></sup> Eingefügt durch Anhang Ziff. 1 des BG vom 27. Sept. 2019.</p></div></div></article>`;

// ── Fixture 3: ZPO Art. 96 (2 nummerierte Absätze, Überschrift mit Fussnoten-<sup>) ──
// Echter Ausschnitt aus /tmp/zpo.html (Konsolidierung 20250101)
const ZPO_ART_96 = `<article id="art_96"><a name="a96"></a><h6 class="heading" role="heading"><span class="display-icon"></span><span class="external-link-icon"></span><a href="#art_96"><b>Art.&nbsp;96</b></a><sup><a href="#fn-d8e2374" id="fnbck-d8e2374">59</a></sup><a href="#art_96"> Tarife und Anspruch der Vertretung auf Parteientschädigung</a></h6><div class="collapseable"> <p class="absatz "><sup>1</sup>&nbsp;Die Kantone setzen die Tarife für die Prozesskosten fest. Vorbehalten bleibt die Gebührenregelung nach Artikel 16 Absatz 1 SchKG<sup><a href="#fn-d8e2396" id="fnbck-d8e2396">60</a></sup>. </p><p class="absatz "><sup>2</sup>&nbsp;Die Kantone können vorsehen, dass die Anwältin oder der Anwalt einen ausschliesslichen Anspruch auf die Honorare und Auslagen hat, die als Parteientschädigung gewährt werden.</p><div class="footnotes"><p id="fn-d8e2374"><sup><a href="#fnbck-d8e2374">59</a></sup><sup></sup> Fassung gemäss Ziff. I des BG vom 17. März 2023.</p><p id="fn-d8e2396"><sup><a href="#fnbck-d8e2396">60</a></sup><sup></sup> SR 281.1</p></div></div></article>`;

// ── HTML-Dokumente für die Tests (Artikel eingebettet in umgebende Struktur) ──
const HTML_OR = `<html><body>${OR_ART_77}${OR_ART_335_C}</body></html>`;
const HTML_ZPO = `<html><body>${ZPO_ART_96}</body></html>`;

describe('extrahiereArtikel', () => {
  describe('OR Art. 77 — 3 nummerierte Absätze + 1 Unterabsatz ohne Nummer', () => {
    it('liefert 4 Blöcke in korrekter Reihenfolge', () => {
      const result = extrahiereArtikel(HTML_OR, '77');
      expect(result).not.toBeNull();
      expect(result!.bloecke).toHaveLength(4);
    });

    it('Abs. 1 hat absatz "1" und Text beginnt korrekt', () => {
      const result = extrahiereArtikel(HTML_OR, '77');
      expect(result!.bloecke[0].absatz).toBe('1');
      expect(result!.bloecke[0].text).toMatch(/^Soll die Erfüllung/);
    });

    it('Unterabsatz (kein sup) hat absatz null und Text beginnt korrekt', () => {
      const result = extrahiereArtikel(HTML_OR, '77');
      expect(result!.bloecke[1].absatz).toBeNull();
      expect(result!.bloecke[1].text).toMatch(/^Der Ausdruck «halber Monat»/);
    });

    it('Abs. 2 hat absatz "2"', () => {
      const result = extrahiereArtikel(HTML_OR, '77');
      expect(result!.bloecke[2].absatz).toBe('2');
      expect(result!.bloecke[2].text).toMatch(/^In gleicher Weise/);
    });

    it('Abs. 3 hat absatz "3"', () => {
      const result = extrahiereArtikel(HTML_OR, '77');
      expect(result!.bloecke[3].absatz).toBe('3');
      expect(result!.bloecke[3].text).toMatch(/^Soll die Erfüllung innerhalb/);
    });
  });

  describe('OR Art. 335_c — Buchstaben-Artikel mit Fussnoten-<sup> in Abs. 3', () => {
    it('liefert 3 nummerierte Blöcke', () => {
      const result = extrahiereArtikel(HTML_OR, '335_c');
      expect(result).not.toBeNull();
      expect(result!.bloecke).toHaveLength(3);
    });

    it('Abs. 1 hat absatz "1" und Text über Kündigungsfristen', () => {
      const result = extrahiereArtikel(HTML_OR, '335_c');
      expect(result!.bloecke[0].absatz).toBe('1');
      expect(result!.bloecke[0].text).toMatch(/Arbeitsverhältnis/);
    });

    it('Abs. 3 hat absatz "3" — Fussnoten-<sup> wird NICHT als Absatznummer erkannt', () => {
      const result = extrahiereArtikel(HTML_OR, '335_c');
      expect(result!.bloecke[2].absatz).toBe('3');
      expect(result!.bloecke[2].text).toMatch(/Kündigt der Arbeitgeber/);
      // Fussnoten-Nummern (188) dürfen nicht im Text erscheinen
      expect(result!.bloecke[2].text).not.toMatch(/\b188\b/);
    });

    it('Text von Abs. 3 endet NICHT mit Fussnoten-Referenz-Zahl', () => {
      const result = extrahiereArtikel(HTML_OR, '335_c');
      const text = result!.bloecke[2].text;
      expect(text.trim()).not.toMatch(/\d{3}$/);
    });
  });

  describe('ZPO Art. 96 — Überschrift mit Fussnoten-<sup>, 2 Absätze', () => {
    it('liefert 2 Blöcke', () => {
      const result = extrahiereArtikel(HTML_ZPO, '96');
      expect(result).not.toBeNull();
      expect(result!.bloecke).toHaveLength(2);
    });

    it('Abs. 1 beginnt mit "Die Kantone setzen"', () => {
      const result = extrahiereArtikel(HTML_ZPO, '96');
      expect(result!.bloecke[0].absatz).toBe('1');
      expect(result!.bloecke[0].text).toMatch(/^Die Kantone setzen/);
    });

    it('Abs. 2 beginnt mit "Die Kantone können"', () => {
      const result = extrahiereArtikel(HTML_ZPO, '96');
      expect(result!.bloecke[1].absatz).toBe('2');
      expect(result!.bloecke[1].text).toMatch(/^Die Kantone können/);
    });
  });

  describe('Fehlerfälle', () => {
    it('fehlender Anker → null', () => {
      expect(extrahiereArtikel(HTML_OR, '999')).toBeNull();
    });

    it('leeres HTML → null', () => {
      expect(extrahiereArtikel('', '77')).toBeNull();
    });

    it('HTML ohne article-Tag → null', () => {
      expect(extrahiereArtikel('<html><body><p>kein Artikel</p></body></html>', '77')).toBeNull();
    });
  });
});
