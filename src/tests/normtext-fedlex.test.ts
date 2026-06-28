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
import { extrahiereArtikel, alleArtikelTokens, entferneFussnotenSups } from '../../scripts/normtext/extrahiere-fedlex';

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

  it('dedupliziert Tokens (nur erster Vorkommen)', () => {
    const tokens = alleArtikelTokens(HTML_MIT_DUPLIKATEN);
    expect(tokens).toEqual(['1', '2']);
    expect(tokens).toHaveLength(2);
  });

  it('liefert leeres Array bei leerem HTML', () => {
    expect(alleArtikelTokens('')).toEqual([]);
  });

  it('liefert leeres Array wenn keine art_-Anker vorhanden', () => {
    expect(alleArtikelTokens('<html><body><p>kein Artikel</p></body></html>')).toEqual([]);
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
