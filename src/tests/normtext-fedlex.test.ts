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
import {
  extrahiereArtikel,
  alleArtikelTokens,
  entferneFussnotenSups,
  alleSchlussteilAnker,
  extrahiereArtikelAusAnker,
  ankerZuToken,
  schlussteilLabelSuffix,
  alleAnhangAnker,
  extrahiereAnhang,
  anhangLabelVonAnker,
} from '../../scripts/normtext/extrahiere-fedlex';

// ── Fixture 1: OR Art. 77 (3 nummerierte Absätze + 1 Unterabsatz ohne Nummer) ──
// Echter Ausschnitt aus /tmp/or.html (Konsolidierung 20260101)
const OR_ART_77 = `<article id="art_77"><a name="a77"></a><h6 class="heading " role="heading"><span class="display-icon"></span><span class="external-link-icon"></span><a href="#art_77"><b>Art. 77</b></a></h6><div class="collapseable"><p class="absatz man-space-before-4 "><sup>1</sup>&nbsp;Soll die Erfüllung einer Verbindlichkeit oder eine andere Rechtshandlung mit dem Ablaufe einer bestimmten Frist nach Abschluss des Vertrages erfolgen, so fällt ihr Zeitpunkt:</p><dl class="man-space-after-0 "><dt class="man-space-before-4  ">1. </dt><dd class="man-space-before-4  ">wenn die Frist nach Tagen bestimmt ist, auf den letzten Tag der Frist, wobei der Tag, an dem der Vertrag geschlossen wurde, nicht mitgerechnet und, wenn die Frist auf acht oder 15&nbsp;Tage lautet, nicht die Zeit von einer oder zwei Wochen verstanden wird, sondern volle acht oder 15 Tage;</dd><dt class="man-space-before-4  ">2. </dt><dd class="man-space-before-4  ">wenn die Frist nach Wochen bestimmt ist, auf denjenigen Tag der letzten Woche, der durch seinen Namen dem Tage des Vertragsabschlusses entspricht;</dd><dt class="man-space-before-4  ">3. </dt><dd class="man-space-before-4  ">wenn die Frist nach Monaten oder einem mehrere Monate umfassenden Zeitraume (Jahr, halbes Jahr, Vierteljahr) bestimmt ist, auf denjenigen Tag des letzten Monates, der durch seine Zahl dem Tage des Vertragsabschlusses entspricht, und, wenn dieser Tag in dem letzten Monate fehlt, auf den letzten Tag dieses Monates.</dd></dl><p class="absatz man-space-before-4 ">Der Ausdruck «halber Monat» wird einem Zeitraume von 15 Tagen gleichgeachtet, die, wenn eine Frist auf einen oder mehrere Monate und einen halben Monat lautet, zuletzt zu zählen sind.</p><p class="absatz man-space-before-4 "><sup>2</sup>&nbsp;In gleicher Weise wird die Frist auch dann berechnet, wenn sie nicht von dem Tage des Vertragsabschlusses, sondern von einem andern Zeitpunkte an zu laufen hat.</p><p class="absatz man-space-before-4 "><sup>3</sup>&nbsp;Soll die Erfüllung innerhalb einer bestimmten Frist geschehen, so muss sie vor deren Ablauf erfolgen.</p></div></article>`;

// ── Fixture 2: OR Art. 335c (3 nummerierte Absätze, Abs. 3 mit Fussnoten-<sup>) ──
// Echter Ausschnitt aus /tmp/or.html (Konsolidierung 20260101)
const OR_ART_335_C = `<article id="art_335_c"><a name="a335c"></a><h6 class="heading " role="heading"><span class="display-icon"></span><span class="external-link-icon"></span><a href="#art_335_c"><b>Art. 335</b><i>c</i></a><sup><a href="#fn-d7e11575" id="fnbck-d7e11575">187</a></sup></h6><div class="collapseable"><p class="absatz man-space-before-4 "><sup>1</sup>&nbsp;Das Arbeitsverhältnis kann im ersten Dienstjahr mit einer Kündigungsfrist von einem Monat, im zweiten bis und mit dem neunten Dienstjahr mit einer Frist von zwei Monaten und nachher mit einer Frist von drei Monaten je auf das Ende eines Monats gekündigt werden.</p><p class="absatz man-space-before-4 "><sup>2</sup>&nbsp;Diese Fristen dürfen durch schriftliche Abrede, Normalarbeitsvertrag oder Gesamtarbeitsvertrag abgeändert werden; unter einen Monat dürfen sie jedoch nur durch Gesamtarbeitsvertrag und nur für das erste Dienstjahr herabgesetzt werden.</p><p class="absatz man-space-before-4 "><sup>3</sup>&nbsp;Kündigt der Arbeitgeber das Arbeitsverhältnis und hat die Arbeitnehmerin oder der Arbeitnehmer vor Ende des Arbeitsverhältnisses Anspruch auf den Urlaub des andern Elternteils nach Artikel 329<i>g</i>, so wird die Kündigungsfrist um die noch nicht bezogenen Urlaubstage verlängert.<sup><a href="#fn-d7e11606" id="fnbck-d7e11606">188</a></sup></p><div class="footnotes"><p id="fn-d7e11575"><sup><a href="#fnbck-d7e11575">187</a></sup><sup></sup><sup> </sup>Eingefügt durch Ziff. I des BG vom 18. März 1988, in Kraft seit 1. Jan. 1989.</p><p id="fn-d7e11606"><sup><a href="#fnbck-d7e11606">188</a></sup><sup></sup> Eingefügt durch Anhang Ziff. 1 des BG vom 27. Sept. 2019.</p></div></div></article>`;

// ── Fixture 3: ZPO Art. 96 (2 nummerierte Absätze, Überschrift mit Fussnoten-<sup>) ──
// Echter Ausschnitt aus /tmp/zpo.html (Konsolidierung 20250101)
const ZPO_ART_96 = `<article id="art_96"><a name="a96"></a><h6 class="heading" role="heading"><span class="display-icon"></span><span class="external-link-icon"></span><a href="#art_96"><b>Art.&nbsp;96</b></a><sup><a href="#fn-d8e2374" id="fnbck-d8e2374">59</a></sup><a href="#art_96"> Tarife und Anspruch der Vertretung auf Parteientschädigung</a></h6><div class="collapseable"> <p class="absatz "><sup>1</sup>&nbsp;Die Kantone setzen die Tarife für die Prozesskosten fest. Vorbehalten bleibt die Gebührenregelung nach Artikel 16 Absatz 1 SchKG<sup><a href="#fn-d8e2396" id="fnbck-d8e2396">60</a></sup>. </p><p class="absatz "><sup>2</sup>&nbsp;Die Kantone können vorsehen, dass die Anwältin oder der Anwalt einen ausschliesslichen Anspruch auf die Honorare und Auslagen hat, die als Parteientschädigung gewährt werden.</p><div class="footnotes"><p id="fn-d8e2374"><sup><a href="#fnbck-d8e2374">59</a></sup><sup></sup> Fassung gemäss Ziff. I des BG vom 17. März 2023.</p><p id="fn-d8e2396"><sup><a href="#fnbck-d8e2396">60</a></sup><sup></sup> SR 281.1</p></div></div></article>`;

// ── Fixture 4: OR Art. 336 (lit.-Aufzählungen a–e in Abs. 1, a–c in Abs. 2) ──
// Echter Ausschnitt aus /tmp/or.html (Konsolidierung 20260101). Belegt die
// reale <dl><dt>a. </dt><dd>…</dd>-Struktur, mit Fussnoten-<sup> in einzelnen
// <dt> (e.<sup><a>199</a></sup>) und <dd> (Abs. 2 lit. c).
const OR_ART_336 = `<article id="art_336"><a name="a336"></a><h6 class="heading " role="heading"><span class="display-icon"></span><span class="external-link-icon"></span><a href="#art_336"><b>Art. 336</b></a><sup><a href="#fn-d7e12013" id="fnbck-d7e12013">198</a></sup></h6><div class="collapseable"><p class="absatz man-space-before-4 "><sup>1</sup>&nbsp;Die Kündigung eines Arbeitsverhältnisses ist missbräuchlich, wenn eine Partei sie ausspricht:</p><dl class="man-space-after-0 "><dt class="man-space-before-4  ">a. </dt><dd class="man-space-before-4  ">wegen einer Eigenschaft, die der anderen Partei kraft ihrer Persönlichkeit zusteht, es sei denn, diese Eigenschaft stehe in einem Zusammenhang mit dem Arbeitsverhältnis oder beeinträchtige wesentlich die Zusammenarbeit im Betrieb;</dd><dt class="man-space-before-4  ">b. </dt><dd class="man-space-before-4  ">weil die andere Partei ein verfassungsmässiges Recht ausübt, es sei denn, die Rechtsausübung verletze eine Pflicht aus dem Arbeitsverhältnis oder beeinträchtige wesentlich die Zusammenarbeit im Betrieb;</dd><dt class="man-space-before-4  ">c. </dt><dd class="man-space-before-4  ">ausschliesslich um die Entstehung von Ansprüchen der anderen Partei aus dem Arbeitsverhältnis zu vereiteln;</dd><dt class="man-space-before-4  ">d. </dt><dd class="man-space-before-4  ">weil die andere Partei nach Treu und Glauben Ansprüche aus dem Arbeitsverhältnis geltend macht;</dd><dt class="man-space-before-4  ">e.<sup><a href="#fn-d7e12060" id="fnbck-d7e12060">199</a></sup> </dt><dd class="man-space-before-4  ">weil die andere Partei schweizerischen obligatorischen Militär- oder Schutzdienst oder schweizerischen Zivildienst leistet oder eine nicht freiwillig übernommene gesetzliche Pflicht erfüllt.</dd></dl><p class="absatz man-space-before-4 "><sup>2</sup>&nbsp;Die Kündigung des Arbeitsverhältnisses durch den Arbeitgeber ist im Weiteren missbräuchlich, wenn sie ausgesprochen wird:</p><dl class="man-space-after-0 "><dt class="man-space-before-4  ">a. </dt><dd class="man-space-before-4  ">weil der Arbeitnehmer einem Arbeitnehmerverband angehört oder nicht angehört oder weil er eine gewerkschaftliche Tätigkeit rechtmässig ausübt;</dd><dt class="man-space-before-4  ">b. </dt><dd class="man-space-before-4  ">während der Arbeitnehmer gewählter Arbeitnehmervertreter in einer betrieblichen oder in einer dem Unternehmen angeschlossenen Einrichtung ist, und der Arbeitgeber nicht beweisen kann, dass er einen begründeten Anlass zur Kündigung hatte;</dd><dt class="man-space-before-4  ">c.<sup><a href="#fn-d7e12098" id="fnbck-d7e12098">200</a></sup> </dt><dd class="man-space-before-4  ">im Rahmen einer Massenentlassung, ohne dass die Arbeitnehmervertretung oder, falls es keine solche gibt, die Arbeitnehmer, konsultiert worden sind (Art. 335<i>f</i>).</dd></dl><p class="absatz man-space-before-4 "><sup>3</sup>&nbsp;Der Schutz eines Arbeitnehmervertreters nach Absatz&nbsp;2 Buchstabe&nbsp;b, dessen Mandat infolge Übergangs des Arbeitsverhältnisses endet (Art.&nbsp;333), besteht so lange weiter, als das Mandat gedauert hätte, falls das Arbeitsverhältnis nicht übertragen worden wäre.<sup><a href="#fn-d7e12124" id="fnbck-d7e12124">201</a></sup></p></div></article>`;

// ── HTML-Dokumente für die Tests (Artikel eingebettet in umgebende Struktur) ──
const HTML_OR = `<html><body>${OR_ART_77}${OR_ART_335_C}${OR_ART_336}</body></html>`;
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

    it('Abs. 1 erfasst die Ziffern-Aufzählung 1.–3. als items', () => {
      const result = extrahiereArtikel(HTML_OR, '77');
      const items = result!.bloecke[0].items;
      expect(items).toBeDefined();
      expect(items!.map((i) => i.marke)).toEqual(['1', '2', '3']);
      expect(items![0].text).toMatch(/^wenn die Frist nach Tagen/);
      expect(items![2].text).toMatch(/letzten Tag dieses Monates\.$/);
    });

    // Bug-Audit 19.6.2026: lat. Suffix der lit.-Marke (cbis/cter/…) darf nicht zu
    // «c» verstümmelt werden (sonst trifft das Zitat «lit. cbis» die falsche Marke).
    it('lit. cbis behält das lateinische Suffix (nicht «c»)', () => {
      const html = '<article id="art_x"><a name="ax"></a><h6 class="heading " role="heading"><a href="#art_x"><b>Art. X</b></a></h6>'
        + '<div class="collapseable"><p class="absatz man-space-before-4 "><sup>1</sup>&nbsp;Einleitung:</p>'
        + '<dl class="man-space-after-0 "><dt class="man-space-before-4  ">c<sup>bis</sup>. </dt>'
        + '<dd class="man-space-before-4  ">Sondertatbestand bis.</dd></dl></div></article>';
      const r = extrahiereArtikel(html, 'x');
      expect(r!.bloecke[0].items!.map((i) => i.marke)).toContain('cbis');
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

  describe('OR Art. 336 — lit.-Aufzählungen (a–e / a–c) als items', () => {
    it('Abs. 1 hat lit. a–e vollständig als items', () => {
      const result = extrahiereArtikel(HTML_OR, '336');
      expect(result).not.toBeNull();
      const abs1 = result!.bloecke[0];
      expect(abs1.absatz).toBe('1');
      expect(abs1.text).toMatch(/missbräuchlich, wenn eine Partei sie ausspricht:$/);
      expect(abs1.items).toBeDefined();
      expect(abs1.items!.map((i) => i.marke)).toEqual(['a', 'b', 'c', 'd', 'e']);
      expect(abs1.items![0].text).toMatch(/^wegen einer Eigenschaft/);
      // lit. e trägt einen Fussnoten-<sup> in der <dt>-Marke → Marke bleibt 'e',
      // die Fussnoten-Zahl (199) erscheint NICHT im Text.
      expect(abs1.items![4].text).toMatch(/^weil die andere Partei schweizerischen/);
      expect(abs1.items![4].text).not.toMatch(/\b199\b/);
    });

    it('Abs. 2 hat lit. a–c, lit. c ohne Fussnoten-Zahl', () => {
      const result = extrahiereArtikel(HTML_OR, '336');
      const abs2 = result!.bloecke[1];
      expect(abs2.absatz).toBe('2');
      expect(abs2.items!.map((i) => i.marke)).toEqual(['a', 'b', 'c']);
      expect(abs2.items![2].text).toMatch(/^im Rahmen einer Massenentlassung/);
      expect(abs2.items![2].text).not.toMatch(/\b200\b/);
    });

    it('Abs. 3 (ohne Aufzählung) hat keine items', () => {
      const result = extrahiereArtikel(HTML_OR, '336');
      const abs3 = result!.bloecke[2];
      expect(abs3.absatz).toBe('3');
      expect(abs3.items).toBeUndefined();
    });
  });

  // N1 (Bündel N, 1.7.2026): Quelle setzt den Artikelnummer-Buchstaben inline
  // OHNE Leerzeichen («329<i>g</i>», «335<i>f</i>»). entferneTags fügte das
  // Leerzeichen beim Strippen der Inline-Tags selbst ein → «329 g». Fix: Inline-
  // Formatierungs-Tags werden ohne Leerzeichen entfernt (HTML rendert sie inline).
  // Die Fixtures OR_ART_335_C (Abs. 3: «Artikel 329<i>g</i>») und OR_ART_336
  // (Abs. 2 lit. c: «(Art. 335<i>f</i>)») tragen das Muster real.
  describe('N1 — Artikelnummer-Buchstabe nicht durch Leerzeichen getrennt', () => {
    it('Abs. 3 nennt «Artikel 329g» (nicht «329 g»)', () => {
      const result = extrahiereArtikel(HTML_OR, '335_c');
      const text = result!.bloecke[2].text;
      expect(text).toMatch(/Artikel 329g\b/);
      expect(text).not.toMatch(/329 g\b/);
    });

    it('lit. c nennt «Art. 335f» (nicht «335 f»)', () => {
      const result = extrahiereArtikel(HTML_OR, '336');
      const text = result!.bloecke[1].items![2].text;
      expect(text).toMatch(/335f\b/);
      expect(text).not.toMatch(/335 f\b/);
    });

    it('«1 bis» als Latein-Suffix am Absatzverweis bleibt geklebt («1bis»)', () => {
      const html = '<article id="art_x"><div class="collapseable">'
        + '<p class="absatz "><sup>1</sup>&nbsp;Verweis auf Absatz 1<sup>bis</sup> des Gesetzes.</p>'
        + '</div></article>';
      const r = extrahiereArtikel(html, 'x');
      expect(r!.bloecke[0].text).toMatch(/Absatz 1bis\b/);
      expect(r!.bloecke[0].text).not.toMatch(/1 bis\b/);
    });

    it('§1-Schutz: typografischer Bruch «133¹⁄₃» wird NICHT zu «1331/3» verklebt', () => {
      // Reine Ziffern-<sup>/<sub> sind Exponent/Bruch/Absatz-Hochzahl — an die
      // Nachbarziffer geklebt entstünde eine irreführende Zahl. Sie behalten den
      // trennenden Abstand (nur Buchstaben-Suffixe werden verklebt).
      const html = '<article id="art_x"><div class="collapseable">'
        + '<p class="absatz ">mindestens 133<sup>1</sup>/<sub>3</sub>&nbsp;Prozent der Ansätze.</p>'
        + '</div></article>';
      const r = extrahiereArtikel(html, 'x');
      expect(r!.bloecke[0].text).not.toMatch(/1331/);
    });

    it('§1/§2-Schutz: echte «1 a)»-Aufzählung (Leerzeichen in der QUELLE) bleibt getrennt', () => {
      // Quelle hat ein ECHTES Leerzeichen zwischen Ziffer und Buchstabe — das
      // darf der Fix NICHT verschlucken (keine blinde Zahl-Leer-Buchstabe-Regex).
      const html = '<article id="art_x"><div class="collapseable">'
        + '<p class="absatz ">Die Frist von 1 a) beträgt zehn Tage.</p>'
        + '</div></article>';
      const r = extrahiereArtikel(html, 'x');
      expect(r!.bloecke[0].text).toMatch(/1 a\)/);
    });
  });

  // Bilder&Formeln (1.7.2026): Piktogramm-Katalog-Tabelle → bildKacheln; eine Zelle
  // mit EINEM Bild + MEHREREN Signalen (6.10/6.11/6.12) darf keinen Text verlieren.
  describe('Bilder — Piktogramm-Katalog (bildKacheln)', () => {
    const KATALOG = '<article id="art_x"><div class="collapseable"><table>'
      + '<tr><td><p class="bild "><img src="image/image1.png"></p>'
      + '<dl class="man-template-tab-struktur-1"><dt><b>1.01</b> </dt><dd>Rechtskurve (Art. 4)</dd></dl></td>'
      + '<td><p class="bild "><img src="image/image2.png"></p>'
      + '<dl><dt><b>6.10</b> </dt><dd>Haltelinie</dd><dt><b>6.11</b> </dt><dd>Stop</dd><dt><b>6.12</b> </dt><dd>Längslinie</dd></dl></td>'
      + '<td><p class="bild "><img src="image/image3.png"></p>'
      + '<dl><dt><b>1.02</b> </dt><dd>Linkskurve (Art. 4)</dd></dl></td>'
      + '</tr></table></div></article>';

    it('erzeugt bildKacheln mit Nummer/Name/Bild je Signal', () => {
      const r = extrahiereArtikel(KATALOG, 'x');
      const k = r!.bloecke.find((b) => b.bildKacheln)?.bildKacheln;
      expect(k).toBeDefined();
      expect(k![0]).toMatchObject({ nummer: '1.01', name: 'Rechtskurve (Art. 4)' });
      expect(k![0].bild?.datei).toBe('image/image1.png');
      expect(k![0].bild?.alt).toBe('Signal: Rechtskurve (Art. 4)');
    });

    it('Zelle mit einem Bild + MEHREREN Signalen verliert keinen Text (§1)', () => {
      const r = extrahiereArtikel(KATALOG, 'x');
      const k = r!.bloecke.find((b) => b.bildKacheln)!.bildKacheln!;
      const namen = k.map((x) => x.name);
      expect(namen).toContain('Haltelinie');
      expect(namen).toContain('Stop');
      expect(namen).toContain('Längslinie');
      // das Bild hängt an der ersten Marke der Zelle, die übrigen sind Text-Kacheln
      expect(k.find((x) => x.nummer === '6.10')?.bild?.datei).toBe('image/image2.png');
    });
  });

  describe('Verschachtelte <dl> — lit. → nummerierte Unterpunkte (Bug 25.6.2026)', () => {
    // Reale Fedlex-Struktur MStG art_42 (verkürzt): ein lit-<dd> enthält eine
    // verschachtelte <dl> mit nummerierten Unterpunkten; danach folgen weitere
    // lit-Geschwister. Vor dem Fix verlor der non-greedy <dl>-Match die lit-Ebene
    // (nur die innere Liste überlebte) und klebte Unterpunkte als falsche Marken.
    const MSTG_ART_42 = `<article id="art_42"><a name="a42"></a><div class="collapseable"><p class="absatz man-space-before-4">Das Gericht mildert die Strafe, wenn:</p><dl class="man-space-after-0"><dt class="man-space-before-4 man-space-before-2">a. </dt><dd class="man-space-before-4 man-space-before-2">der Täter gehandelt hat:<dl class="man-space-after-0"><dt class="man-space-before-2">1. </dt><dd class="man-space-before-2">aus achtenswerten Beweggründen,</dd><dt class="man-space-before-2">2. </dt><dd class="man-space-before-2">in schwerer Bedrängnis,</dd><dt class="man-space-before-2">3. </dt><dd class="man-space-before-2">unter dem Eindruck einer schweren Drohung,</dd><dt class="man-space-before-2">4. </dt><dd class="man-space-before-2">auf Veranlassung einer Person, der er Gehorsam schuldet oder von der er abhängig ist;</dd></dl></dd><dt class="man-space-before-4">b. </dt><dd class="man-space-before-4">der Täter durch das Verhalten der verletzten Person ernsthaft in Versuchung geführt worden ist;</dd><dt class="man-space-before-4">c. </dt><dd class="man-space-before-4">der Täter in einer nach den Umständen entschuldbaren heftigen Gemütsbewegung gehandelt hat;</dd><dt class="man-space-before-4">d. </dt><dd class="man-space-before-4">der Täter aufrichtige Reue betätigt;</dd><dt class="man-space-before-4">e. </dt><dd class="man-space-before-4">das Strafbedürfnis deutlich vermindert ist.</dd></dl></div></article>`;

    it('lit. a–e bleiben erhalten; nummerierte Unterpunkte 1–4 folgen flach NACH lit. a', () => {
      const result = extrahiereArtikel(MSTG_ART_42, '42');
      expect(result).not.toBeNull();
      const b = result!.bloecke[0];
      expect(b.text).toBe('Das Gericht mildert die Strafe, wenn:');
      // Flaches Modell in Dokumentreihenfolge: a, 1, 2, 3, 4, b, c, d, e.
      expect(b.items!.map((i) => i.marke)).toEqual(['a', '1', '2', '3', '4', 'b', 'c', 'd', 'e']);
      // Eltern-lit. trägt NUR seinen Einleitungstext (nicht den ersten Unterpunkt).
      expect(b.items![0].text).toBe('der Täter gehandelt hat:');
      expect(b.items![1].text).toMatch(/^aus achtenswerten Beweggründen/);
      expect(b.items![5].text).toMatch(/^der Täter durch das Verhalten/);
    });

    it('M6: explizite tiefe — lit. a/b…e = Stufe 0 (kein Schlüssel), Unterpunkte 1–4 = Stufe 1', () => {
      const b = extrahiereArtikel(MSTG_ART_42, '42')!.bloecke[0];
      // Top-Level-lit. tragen KEIN tiefe-Feld (byte-gleich zum Alt-Modell, §7).
      expect(b.items![0].tiefe).toBeUndefined(); // a
      expect(b.items!.filter((i) => /^[a-z]$/.test(i.marke)).every((i) => i.tiefe === undefined)).toBe(true);
      // Verschachtelte Ziff. 1–4 tragen tiefe = 1.
      expect(b.items!.filter((i) => /^\d$/.test(i.marke)).map((i) => i.tiefe)).toEqual([1, 1, 1, 1]);
    });
  });

  describe('M6 §1-KRITISCH: invertierte Verschachtelung Ziff. → lit. (BankG Art. 16, real)', () => {
    // Reale Fedlex-Struktur BankG art_16: Ziff. 1, 1bis (mit verschachtelten
    // lit. a/b), 2, 3. Die FRÜHERE Render-Heuristik (Stufe aus Markentyp raten)
    // entnestete lit. a/b fälschlich auf Stufe 0 UND schob die folgenden Ziff. 2/3
    // fälschlich auf Stufe 1 (weil sie nach dem ersten Buchstaben «sahLit» annahm)
    // → falsche Fundstellen für >=4 Items. Die explizite tiefe behebt das (§1).
    const BANKG_ART_16 = `<article id="art_16"><a name="a16"></a><h6 class="heading" role="heading"><span class="display-icon"></span><span class="external-link-icon"></span><a href="#art_16"><b>Art. 16</b></a><sup><a href="#fn-d6e2283" id="fnbck-d6e2283">83</a></sup></h6><div class="collapseable"><p>Als Depotwerte im Sinne von Artikel 37<i>d</i> des Gesetzes gelten:<sup><a href="#fn-d6e2304" id="fnbck-d6e2304">84</a></sup></p><dl><dt>1. </dt><dd>bewegliche Sachen und Effekten der Depotkunden;</dd><dt>1<sup>bis</sup>.<sup><a href="#fn-d6e2327" id="fnbck-d6e2327">85</a></sup><sup> </sup></dt><dd><sup></sup>kryptobasierte Vermögenswerte, wenn sich die Bank verpflichtet hat, diese für den Depotkunden jederzeit bereitzuhalten, und diese:<dl><dt>a. </dt><dd>dem Depotkunden individuell zugeordnet sind, oder</dd><dt>b. </dt><dd>einer Gemeinschaft zugeordnet sind und ersichtlich ist, welcher Anteil am Gemeinschaftsvermögen dem Depotkunden zusteht;</dd></dl></dd><dt>2. </dt><dd>bewegliche Sachen, Effekten und Forderungen, welche die Bank für Rechnung der Depotkunden fiduziarisch innehat;</dd><dt>3. </dt><dd>frei verfügbare Lieferansprüche der Bank gegenüber Dritten aus Kassageschäften, abgelaufenen Termingeschäften, Deckungsgeschäften oder Emissionen für Rechnung der Depotkunden.</dd></dl></div></article>`;

    it('Marken in Dokumentreihenfolge: 1, 1bis, a, b, 2, 3', () => {
      const b = extrahiereArtikel(BANKG_ART_16, '16')!.bloecke[0];
      expect(b.items!.map((i) => i.marke)).toEqual(['1', '1bis', 'a', 'b', '2', '3']);
    });

    it('tiefe korrekt: 1/1bis/2/3 = Stufe 0; lit. a/b unter 1bis = Stufe 1', () => {
      const items = extrahiereArtikel(BANKG_ART_16, '16')!.bloecke[0].items!;
      const byMarke = Object.fromEntries(items.map((i) => [i.marke, i.tiefe]));
      expect(byMarke['1']).toBeUndefined();
      expect(byMarke['1bis']).toBeUndefined();
      expect(byMarke['2']).toBeUndefined(); // NICHT fälschlich Stufe 1
      expect(byMarke['3']).toBeUndefined();
      expect(byMarke['a']).toBe(1);
      expect(byMarke['b']).toBe(1);
    });
  });

  describe('M10 T-F5(ii) kpf-als-<td> colspan 4/2 → kanonisches spalten-Modell (GebV SchKG art_30)', () => {
    // Reale Fedlex-Struktur: KEIN <th>; der Kopf steht als <td colspan="4">…
    // <p class="man-template-tab-kpf">…</p></td>. SOLL (M10): rechteckiges, typisiertes
    // spalten-Modell — die Forderungs-Spanne zu EINER bereich-Zelle verdichtet (T-A6),
    // Spacer-Spalte gestrichen (T-A7), kopf == Zellzahl (T-B2). Ersetzt die alte
    // Erwartung (leer-gepaddetes 6-Spalten-Roh-Raster = Defektklasse 2 zementiert).
    const GEBV_ART_30 = `<article id="art_30"><div class="collapseable"><table border="1"><tr><td colspan="4"><p class="man-template-tab-kpf man-space-before-3 man-space-after-3">Zuschlagspreis, Kaufpreis oder Erlös/Franken</p></td><td colspan="2"><p class="man-template-tab-kpf-r man-space-before-3 man-space-after-3">Gebühr/Franken</p></td></tr><tr><td><p class="man-template-tab-krpr"></p></td><td><p class="man-template-tab-krpr-r"></p></td><td><p class="man-template-tab-krpr"></p></td><td><p class="man-template-tab-krpr man-space-before-2">bis</p></td><td><p class="man-template-tab-krpr man-space-before-2 man-text-align-right">500</p></td><td><p class="man-template-tab-krpr man-space-before-2 man-text-align-right">10.–</p></td></tr><tr><td><p class="man-template-tab-krpr">über</p></td><td><p class="man-template-tab-krpr-r">500</p></td><td><p class="man-template-tab-krpr"></p></td><td><p class="man-template-tab-krpr">bis</p></td><td><p class="man-template-tab-krpr-r">1&nbsp;000</p></td><td><p class="man-template-tab-krpr-r">50.–</p></td></tr></table></div></article>`;

    it('liefert 2 typisierte Spalten (bereich | betrag), kopf == Zellzahl', () => {
      const b = extrahiereArtikel(GEBV_ART_30, '30')!.bloecke.find((x) => x.mehrspaltig)!;
      expect(b.mehrspaltig!.spalten).toEqual([
        { typ: 'bereich', titel: 'Zuschlagspreis, Kaufpreis oder Erlös/Franken' },
        { typ: 'betrag', titel: 'Gebühr/Franken' },
      ]);
      expect(b.mehrspaltig!.kopf).toBeUndefined(); // kein Legacy-Feld mehr
    });

    it('verdichtet die Spanne wortlauttreu zu EINER bereich-Zelle', () => {
      const b = extrahiereArtikel(GEBV_ART_30, '30')!.bloecke.find((x) => x.mehrspaltig)!;
      expect(b.mehrspaltig!.zeilen).toEqual([
        ['bis 500', '10.–'],
        ['über 500 bis 1 000', '50.–'],
      ]);
    });
  });

  describe('M9 G7: doppelte art_id — zweiter Artikel bleibt erhalten (__2-Suffix)', () => {
    // Reale Fedlex-Quirk (KKV): zwei <article id="art_126_z"> — der zweite (126z
    // tredecies) trägt dasselbe Token. Bisher «erster gewinnt» → zweiter verloren.
    const DOPPEL = `<article id="art_126_z"><a name="a126z"></a><h6 class="heading"><a href="#art_126_z"><b>Art. 126z</b></a></h6><div class="collapseable"><p class="absatz">Erster Artikel zum L-QIF.</p></div></article><article id="art_126_z"><a name="ta126z"></a><h6 class="heading"><a href="#art_126_z"><b>Art. 126z</b></a> tredecies</h6><div class="collapseable"><p class="absatz">Zweiter Artikel: Wesentliche Mängel.</p></div></article>`;

    it('alleArtikelTokens vergibt dem zweiten Vorkommen __2', () => {
      expect(alleArtikelTokens(DOPPEL)).toEqual(['126_z', '126_z__2']);
    });

    it('beide Artikel extrahieren distinkten Inhalt', () => {
      expect(extrahiereArtikel(DOPPEL, '126_z')!.bloecke[0].text).toBe('Erster Artikel zum L-QIF.');
      expect(extrahiereArtikel(DOPPEL, '126_z__2')!.bloecke[0].text).toBe('Zweiter Artikel: Wesentliche Mängel.');
    });

    it('einfaches Token (kein Suffix) = erstes/einziges Vorkommen, unverändert', () => {
      const r = extrahiereArtikel(OR_ART_77, '77');
      expect(r!.bloecke).toHaveLength(4);
    });
  });

  describe('M8 G23: Delegationsnorm-Verweis (man-template-referenz) wird erhalten', () => {
    // Reale Fedlex-Struktur (ArGV1 art_1): <p class="man-template-referenz">
    // (Art. 1 ArG)</p> direkt nach der Überschrift, vor Abs. 1 — bisher gedroppt.
    const ARGV1_ART_1 = `<article id="art_1"><a name="a1"></a><h6 class="heading " role="heading"><span class="display-icon"></span><a href="#art_1"><b>Art. 1</b> Arbeitnehmer</a></h6><div class="collapseable"><p class="man-template-referenz"> (Art. 1 ArG)</p><p class="absatz "><sup>1</sup>&nbsp;Arbeitnehmer ist jede Person, die in einem Betrieb beschäftigt wird.</p></div></article>`;

    it('grundlage = «(Art. 1 ArG)»; bleibt nicht im Absatztext', () => {
      const r = extrahiereArtikel(ARGV1_ART_1, '1')!;
      expect(r.grundlage).toBe('(Art. 1 ArG)');
      expect(r.bloecke[0].absatz).toBe('1');
      expect(r.bloecke[0].text).toMatch(/^Arbeitnehmer ist jede Person/);
      expect(r.bloecke.map((b) => b.text).join(' ')).not.toContain('ArG)'); // nicht geleakt
    });

    it('Artikel ohne Verweis → grundlage undefined (nichts fabriziert, §7)', () => {
      const r = extrahiereArtikel(HTML_ZPO, '96')!;
      expect(r.grundlage).toBeUndefined();
    });
  });

  describe('M10 T-F5(iii) <th>-Tabelle Kopf+Daten gleiche colspan → Werte byte-gleich', () => {
    // <th>-Tabellen tragen colspan auf Kopf UND Daten (BVG-Stil). M10 expandiert
    // beide konsistent, streicht die geteilte Spacer-Spalte und liefert das
    // kanonische 2-Spalten-Modell — die ZellWERTE bleiben byte-identisch
    // ('Altersjahr','Ansatz' / '25–34','7'), nur die Form ist jetzt typisiert.
    const TH_TAB = `<article id="art_x"><div class="collapseable"><table border="1"><tr><th colspan="2"><p>Altersjahr</p></th><th><p>Ansatz</p></th></tr><tr><td colspan="2"><p>25–34</p></td><td><p>7</p></td></tr></table></div></article>`;

    it('2 typisierte Spalten, Werte unverändert', () => {
      const b = extrahiereArtikel(TH_TAB, 'x')!.bloecke.find((x) => x.mehrspaltig)!;
      expect(b.mehrspaltig!.spalten).toEqual([
        { typ: 'text', titel: 'Altersjahr' },
        { typ: 'zahl', titel: 'Ansatz' },
      ]);
      expect(b.mehrspaltig!.zeilen).toEqual([['25–34', '7']]);
    });
  });

  describe('<dt>-eingebetteter Text + leeres <dd> (Fedlex-Sonderform, ZPO art_250 Ziff. 15)', () => {
    // Reale Fedlex-Sonderform: der Punkttext steht IM <dt> hinter Marke+Fussnote,
    // das zugehörige <dd> ist leer. Ohne Fallback ginge der Punkt verloren.
    const SONDERFORM = `<article id="art_x"><div class="collapseable"><dl><dt>14.<sup><a href="#fn1">184</a></sup> </dt><dd>Eintragung im Handelsregister (Art. 935 OR),</dd><dt>15.<sup><a href="#fn2">185</a></sup><sup><inl> </inl></sup>Anordnung zur Auflösung der Gesellschaft nach den Vorschriften über den Konkurs (Art. 731b OR),</dt><dd class="clearfix"></dd><dt>16.<sup><a href="#fn3">186</a></sup> </dt><dd>Löschung einer Gesellschaft (Art. 938a Abs. 2 OR);</dd></dl></div></article>`;

    it('Ziff. 15 (Text im <dt>) bleibt erhalten, ohne Fussnoten-Zahl', () => {
      const result = extrahiereArtikel(SONDERFORM, 'x');
      const items = result!.bloecke[0].items!;
      expect(items.map((i) => i.marke)).toEqual(['14', '15', '16']);
      expect(items[1].text).toMatch(/^Anordnung zur Auflösung der Gesellschaft/);
      expect(items[1].text).not.toMatch(/\b185\b/);
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

// ── M13-Annex: Anhänge (annex_*) ────────────────────────────────────────────
// Fixtures = vereinfachte, aber strukturtreue Ausschnitte der realen Fedlex-
// Anhang-Container (verifiziert an chemrrv/fidlev/gschv/bvg/kag/lrv/vts).

describe('alleAnhangAnker (M13-Annex)', () => {
  it('nummerierte Anhänge: Deckblatt «Anhänge» (annex_uN) wird ausgeschlossen', () => {
    const html =
      '<div id="annex">' +
      '<section id="annex_u1"><h1 class="heading"><a href="#annex_u1">Anhänge</a></h1></section>' +
      '<section id="annex_1"><h1 class="heading"><a href="#annex_1">Anhang 1</a></h1></section>' +
      '<section id="annex_1_1"><h1 class="heading"><a href="#annex_1_1">Anhang 1.1</a></h1></section>' +
      '</div>';
    expect(alleAnhangAnker(html)).toEqual(['annex_1', 'annex_1_1']);
  });

  it('EINZELNER unnummerierter Anhang (annex_uN, BVG-Manier) bleibt erhalten', () => {
    const html =
      '<div id="annex"><section id="annex_u1"><h1 class="heading"><a href="#annex_u1">Anhang</a></h1>' +
      '<div class="collapseable"><section id="annex_u1/lvl_u1"><p>Inhalt</p></section></div></section></div>';
    expect(alleAnhangAnker(html)).toEqual(['annex_u1']);
  });

  it('Sonderfall ohne annex-Präfix (lvl_uN, KAG/FIDLEG)', () => {
    const html =
      '<div id="annex"><section id="lvl_u1"><h1 class="heading"><a href="#lvl_u1">Anhang</a></h1>' +
      '<div class="collapseable"><section id="lvl_u1/lvl_1"><p>X</p></section></div></section></div>';
    expect(alleAnhangAnker(html)).toEqual(['lvl_u1']);
  });

  it('liefert leeres Array, wenn das Gesetz keinen <div id="annex"> hat', () => {
    expect(alleAnhangAnker('<main><article id="art_1"></article></main>')).toEqual([]);
  });
});

describe('extrahiereAnhang (M13-Annex)', () => {
  const sektion = (id: string, inner: string) => `<section id="${id}">${inner}</section>`;
  const wrap = (inner: string) => `<div id="annex">${inner}</div>`;

  it('Titel + Unter-Überschrift (Ziffer) als titel-Block, Prosa als Absatz', () => {
    const html = wrap(
      sektion('annex_1',
        '<h1 class="heading"><a href="#annex_1">Anhang 1</a></h1><div class="collapseable">' +
        '<p>(Art. 5)</p>' +
        '<section id="annex_1/lvl_1"><h2 class="heading"><a href="#x">1 Oberirdische Gewässer</a></h2>' +
        '<div class="collapseable"><p class="absatz">Die Gewässer sollen naturnah sein.</p></div></section>' +
        '</div>'),
    );
    const ex = extrahiereAnhang(html, 'annex_1')!;
    expect(ex.titel).toBe('Anhang 1');
    expect(ex.bloecke).toEqual([
      { absatz: null, text: '(Art. 5)' },
      { absatz: null, text: '1 Oberirdische Gewässer', titel: 2 },
      { absatz: null, text: 'Die Gewässer sollen naturnah sein.' },
    ]);
  });

  it('marke-lose <dd>-Notiz (leeres <dt>) bleibt als Prosa, VOR ihrer Unterliste', () => {
    const html = wrap(
      sektion('annex_1',
        '<h1 class="heading"><a href="#annex_1">Anhang 1</a></h1><div class="collapseable">' +
        '<dl><dt></dt><dd>Wie folgt gekennzeichnet:<dl><dt>a. </dt><dd>erstens</dd><dt>b. </dt><dd>zweitens</dd></dl></dd></dl>' +
        '</div>'),
    );
    const ex = extrahiereAnhang(html, 'annex_1')!;
    // Notiz steht VOR den Items und trägt sie als Lead-in.
    expect(ex.bloecke[0].text).toBe('Wie folgt gekennzeichnet:');
    expect(ex.bloecke[0].items?.map((i) => `${i.marke}:${i.text}`)).toEqual(['a:erstens', 'b:zweitens']);
  });

  it('mehrteilige gepunktete Ziffer-Marke «1.1.1» bleibt vollständig (nicht «1»)', () => {
    const html = wrap(
      sektion('annex_2',
        '<h1 class="heading"><a href="#annex_2">Anhang 2</a></h1><div class="collapseable">' +
        '<dl><dt>1.1.1 </dt><dd>alpha</dd><dt>1.1.2 </dt><dd>beta</dd></dl></div>'),
    );
    const ex = extrahiereAnhang(html, 'annex_2')!;
    expect(ex.bloecke[0].items?.map((i) => i.marke)).toEqual(['1.1.1', '1.1.2']);
  });

  it('beschreibende <dt>-Marke («Flupo:») wird NICHT auf den ersten Buchstaben gekürzt', () => {
    const html = wrap(
      sektion('annex_3',
        '<h1 class="heading"><a href="#annex_3">Anhang 3</a></h1><div class="collapseable">' +
        '<dl><dt>Flupo: </dt><dd>Flughafenpolizei</dd><dt>SEM: </dt><dd>Staatssekretariat</dd></dl></div>'),
    );
    const ex = extrahiereAnhang(html, 'annex_3')!;
    // Beschreibende Legenden-Schlüssel behalten ihre Original-Schreibung (Abkürzung
    // «SEM» bleibt gross) — nur einteilige lit./Ziff.-Marken werden kleingeschrieben.
    expect(ex.bloecke[0].items?.map((i) => i.marke)).toEqual(['Flupo', 'SEM']);
  });

  it('Apparat-Variante «footnotes section-heading-footnote» leckt nicht in den Body', () => {
    const html = wrap(
      sektion('annex_4',
        '<h1 class="heading"><a href="#annex_4">Anhang 4</a>' +
        '<span><sup><a href="#fn1">5</a></sup></span></h1>' +
        '<div class="footnotes section-heading-footnote"><p id="fn1">Bereinigt gemäss Ziff. II der V vom …</p></div>' +
        '<div class="collapseable"><p class="absatz">Echter Anhang-Inhalt.</p></div>'),
    );
    const ex = extrahiereAnhang(html, 'annex_4')!;
    expect(ex.bloecke.some((b) => /Bereinigt gemäss/.test(b.text))).toBe(false);
    expect(ex.bloecke).toEqual([{ absatz: null, text: 'Echter Anhang-Inhalt.' }]);
  });

  it('aufgehobener Anhang (nur Titel + Aufhebungs-Fussnote) → «…»-Block', () => {
    const html = wrap(
      sektion('annex_5',
        '<h1 class="heading"><a href="#annex_5">Anhang 5</a></h1>' +
        '<div class="footnotes"><p>Aufgehoben durch Ziff. I der V …</p></div>'),
    );
    const ex = extrahiereAnhang(html, 'annex_5')!;
    expect(ex.bloecke).toEqual([{ absatz: null, text: '…' }]);
  });

  it('fehlende Sektion → null', () => {
    expect(extrahiereAnhang(wrap(''), 'annex_99')).toBeNull();
  });
});

describe('anhangLabelVonAnker (M13-Annex)', () => {
  it('leitet ein Fallback-Label aus dem Anker ab', () => {
    expect(anhangLabelVonAnker('annex_1')).toBe('Anhang 1');
    expect(anhangLabelVonAnker('annex_1_1')).toBe('Anhang 1.1');
    expect(anhangLabelVonAnker('annex_4_a')).toBe('Anhang 4a');
  });
});
