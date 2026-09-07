import { describe, it, expect } from 'vitest';
import {
  extrahiereArtikel,
  alleArtikelTokens,
} from '../../scripts/normtext/extrahiere-fedlex';
import {
  OR_ART_77,
  HTML_OR,
  HTML_ZPO,
} from './normtext-fedlex.helfer';

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

  // ── Formel-/Bild-Adjazenz (Härtung 5.7.2026) ────────────────────────────────
  // Drei Adjazenz-Klassen, in denen der Haupttext-Pfad Normtext NEBEN einem <img>
  // oder in einem markenlosen Folge-<dd> stumm verlor. Fixtures = reale Fedlex-
  // Ausschnitte (VTS art_123, SSV art_24, Konsolidierung 20260701).
  describe('Formel-/Bild-Adjazenz — Text neben <img> / markenloses Folge-<dd> (§1)', () => {
    // Klasse A: <p class="bild"> mit <img> GEFOLGT von echtem Normtext. Vor dem Fix
    // erfasste der match[6]-Zweig NUR das Bild → der Nach-Text fiel weg (VTS 123/3).
    const VTS_ART_123 = `<article id="art_123"><a name="a123"></a><h6 class="heading" role="heading"><a href="#art_123"><b>Art. 123</b> Türen, Notausstiege</a></h6><div class="collapseable"><p class="absatz man-space-before-4"><sup>3</sup>&nbsp;Gesellschaftswagen und Kleinbusse benötigen Notausstiege mit einer lichten Weite von mindestens 0,60&nbsp;m auf 0,43&nbsp;m. Die Anzahl (n) richtet sich nach folgender Formel:</p><p class="bild"><img data-scaled-width="108" data-scaled-height="8" src="image/image1.png">Türen zählen ebenfalls als Notausstiege. Die Notausstiege sind deutlich zu kennzeichnen und möglichst gleichmässig auf beiden Fahrzeugseiten anzuordnen.<sup><a href="#fn-x" id="fnbck-x">593</a></sup></p></div></article>`;

    it('Klasse A: Text NACH einer Formel(-als-Bild) bleibt als eigener Block erhalten', () => {
      const r = extrahiereArtikel(VTS_ART_123, '123')!;
      const idxBild = r.bloecke.findIndex((b) => b.bild);
      expect(idxBild).toBeGreaterThan(-1);
      // Der Nach-Text steht als eigener Block DIREKT nach dem Bild (Dokumentreihenfolge).
      const nach = r.bloecke[idxBild + 1];
      expect(nach.text).toMatch(/^Türen zählen ebenfalls als Notausstiege\./);
      expect(nach.text).toMatch(/gleichmässig auf beiden Fahrzeugseiten anzuordnen\.$/);
      // Fussnoten-Ziffer «593» leakt NICHT in den Text (§ Footnote-Leak).
      expect(nach.text).not.toMatch(/593/);
      // Abs. 3 (der Formel-Einleitungssatz) bleibt unverändert VOR dem Bild.
      expect(r.bloecke[idxBild - 1].text).toMatch(/richtet sich nach folgender Formel:$/);
    });

    it('Klasse B: Text VOR dem <img> im selben <p class="bild"> bleibt erhalten', () => {
      // Reale VTS-Anhang-Variante «<p class="bild"><sup>N = A +</sup><img></p>»:
      // der Formel-Präfixtext steht VOR dem Bild.
      const HTML = `<article id="art_x"><div class="collapseable"><p class="bild">N = A + <img src="image/image27.png"></p></div></article>`;
      const r = extrahiereArtikel(HTML, 'x')!;
      const idxBild = r.bloecke.findIndex((b) => b.bild);
      expect(idxBild).toBeGreaterThan(0);
      expect(r.bloecke[idxBild - 1].text).toBe('N = A +');
    });

    it('Regel-Fall byte-gleich: reines <p class="bild"> mit nur <img> erzeugt NUR den Bild-Block', () => {
      const HTML = `<article id="art_x"><div class="collapseable"><p class="bild"><img src="image/image9.png"></p></div></article>`;
      const r = extrahiereArtikel(HTML, 'x')!;
      const nichtLeer = r.bloecke.filter((b) => b.bild || b.text);
      expect(nichtLeer).toHaveLength(1);
      expect(nichtLeer[0].bild?.datei).toBe('image/image9.png');
      expect(nichtLeer[0].text).toBe('');
    });

    // Klasse C: markenloses Folge-<dd> als Fortsetzung des vorausgehenden lit.-Items.
    // Reale SSV art_24-Struktur: «<dt>a.</dt><dd>Signalnamen:</dd><dt></dt><dd>Beschreibung</dd>».
    const SSV_ART_24 = `<article id="art_24"><a name="a24"></a><h6 class="heading" role="heading"><a href="#art_24"><b>Art. 24</b> Vorgeschriebene Fahrtrichtung</a></h6><div class="collapseable"><p class="absatz man-space-before-4"><sup>1</sup>&nbsp;Um dem Führer die vorgeschriebene Fahrtrichtung anzuzeigen, werden folgende Signale verwendet:</p><dl class="man-space-after-0"><dt class="man-space-before-4">a. </dt><dd class="man-space-before-4">«Fahrtrichtung rechts» (2.32), «Fahrtrichtung links» (2.33):</dd><dt class="man-space-before-4"></dt><dd class="man-space-before-4">Der Führer muss vor dem Signal nach rechts bzw. links abbiegen;</dd><dt class="man-space-before-4">b. </dt><dd class="man-space-before-4">«Hindernis rechts umfahren» (2.34):</dd><dt class="man-space-before-4"></dt><dd class="man-space-before-4">Der Führer muss das Hindernis rechts umfahren.</dd></dl></div></article>`;

    it('Klasse C: markenloses Folge-<dd> wird an das vorausgehende lit.-Item angehängt (keine leere Marke)', () => {
      const b = extrahiereArtikel(SSV_ART_24, '24')!.bloecke[0];
      // Genau zwei Items a/b — KEINE markenlose («») Kachel.
      expect(b.items!.map((i) => i.marke)).toEqual(['a', 'b']);
      // Signalname UND verbindliche Beschreibung stehen im selben Item, mit Space getrennt.
      expect(b.items![0].text).toBe(
        '«Fahrtrichtung rechts» (2.32), «Fahrtrichtung links» (2.33): Der Führer muss vor dem Signal nach rechts bzw. links abbiegen;',
      );
      expect(b.items![1].text).toBe(
        '«Hindernis rechts umfahren» (2.34): Der Führer muss das Hindernis rechts umfahren.',
      );
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
