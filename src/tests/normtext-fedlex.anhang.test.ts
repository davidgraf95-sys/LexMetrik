import { describe, it, expect } from 'vitest';
import {
  alleAnhangAnker,
  extrahiereAnhang,
  anhangLabelVonAnker,
} from '../../scripts/normtext/extrahiere-fedlex';

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

  // Adjazenz-Härtung 5.7.2026 (§6-Regressionsschutz): der Anhang-Pfad erfasst
  // markenlose <dd>-Chapeaus SCHON via markeloseNotizen() als Prosa-Block. Die
  // Haupttext-Fortsetzungslogik (parseDefinitionsListe, !anhang) darf hier NICHT
  // zusätzlich greifen — sonst DOPPELT sich der Chapeau (VTS-Anhang-Mess-Tabellen).
  it('markenloser <dd>-Chapeau im Anhang erscheint GENAU EINMAL (keine Dublette)', () => {
    const html = wrap(
      sektion('annex_6',
        '<h1 class="heading"><a href="#annex_6">Anhang 6</a></h1><div class="collapseable">' +
        '<dl><dt></dt><dd>Alle Fahrzeuge müssen folgende Bedingungen erfüllen:</dd>' +
        '<dt>151 </dt><dd>Erste Bedingung.</dd><dt>152 </dt><dd>Zweite Bedingung.</dd></dl></div>'),
    );
    const ex = extrahiereAnhang(html, 'annex_6')!;
    // Chapeau als Prosa-Block, danach die nummerierten Items — Chapeau NICHT als Item.
    const chapeauBloecke = ex.bloecke.filter((b) => /Alle Fahrzeuge müssen/.test(b.text));
    expect(chapeauBloecke).toHaveLength(1);
    const mitItems = ex.bloecke.find((b) => b.items);
    expect(mitItems!.items!.map((i) => i.marke)).toEqual(['151', '152']);
    expect(mitItems!.items!.some((i) => i.marke === '')).toBe(false);
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

// ── F-f (QS-OPT, 28.7.2026): lat. Ordinal-<sup> in Anhang-Überschriften ───────
//
// DEKLARIERTE fachliche Änderung (§6.3, Golden-Update begründet): Der frühere
// pauschale <sup>-Strip in `anhangUeberschrift` warf das Ordinal-Suffix weg, das
// TEIL DER NUMMER ist. Zwei rechtlich verschiedene Ziffern trugen dieselbe Nummer.
// Fixtures sind ECHTE Ausschnitte aus den Fedlex-Filestore-Caches
// (/tmp/chemrrv.html, Kons. 20260716, SR 814.81 · /tmp/vzv.html, SR 741.51).
describe('anhangUeberschrift — lat. Ordinal-Suffix bleibt Teil der Nummer (F-f)', () => {
  const wrapF = (inner: string) => `<div id="annex">${inner}</div>`;

  // ChemRRV Anhang 2.15 Ziff. 6.6 vs. 6.6bis — die beiden Bestimmungen sind
  // rechtlich verschieden («Zahlungen an Dritte» vs. «Rückerstattung der Gebühr»).
  const CHEMRRV_2_15_6_6 =
    '<h4 class="heading" role="heading" aria-level="4"><span class="display-icon"></span>' +
    '<span class="external-link-icon"></span>' +
    '<a href="#annex_2_15/lvl_u1/lvl_6/lvl_6_6">6.6 Zahlungen an Dritte</a></h4>';
  const CHEMRRV_2_15_6_6_BIS =
    '<h4 class="heading" role="heading" aria-level="4"><span class="display-icon"></span>' +
    '<span class="external-link-icon"></span>' +
    '<a href="#annex_2_15/lvl_u1/lvl_6/lvl_6_6_bis">6.6<span class="man-font-weight-normal">' +
    '<sup>bis</sup></span> Rückerstattung der Gebühr</a></h4>';

  it('ChemRRV Anh. 2.15: 6.6 und 6.6bis bleiben zwei verschiedene Nummern', () => {
    const html = wrapF(
      '<section id="annex_2_15"><h1 class="heading"><a href="#annex_2_15">Anhang 2.15</a></h1>' +
        '<div class="collapseable">' +
        CHEMRRV_2_15_6_6 +
        '<p class="absatz">Die Organisation leistet Zahlungen an Dritte.</p>' +
        CHEMRRV_2_15_6_6_BIS +
        '<p class="absatz">Die Gebühr wird auf Gesuch hin zurückerstattet.</p>' +
        '</div></section>',
    );
    const ex = extrahiereAnhang(html, 'annex_2_15')!;
    const titel = ex.bloecke.filter((b) => b.titel !== undefined).map((b) => b.text);
    expect(titel).toEqual(['6.6 Zahlungen an Dritte', '6.6bis Rückerstattung der Gebühr']);
    // Kernaussage: KEINE zwei Überschriften mit derselben Nummer.
    const nummern = titel.map((t) => t.split(' ')[0]);
    expect(new Set(nummern).size).toBe(nummern.length);
  });

  // ChemRRV Anhang 2.4: die 4bis-/4ter-Serie. Der 4bis-Kopf trägt ZUSÄTZLICH
  // einen redaktionellen Fussnoten-<sup><a>175</a></sup> — der muss weiterhin
  // samt Ziffer verschwinden, während «bis» bleibt (die beiden <sup>-Rollen
  // sind nach Eltern-Kontext zu unterscheiden).
  it('ChemRRV Anh. 2.4: 4bis-/4ter-Serie vollständig, Fussnoten-Ziffer bleibt getilgt', () => {
    const html = wrapF(
      '<section id="annex_2_4"><h1 class="heading"><a href="#annex_2_4">Anhang 2.4</a></h1>' +
        '<div class="collapseable">' +
        '<h4 class="heading"><a href="#a">4.1 Begriff</a></h4>' +
        '<h4 class="heading"><a href="#b">4.2 Verbot</a></h4>' +
        '<h3 class="heading" role="heading" aria-level="3"><span class="display-icon"></span>' +
        '<span class="external-link-icon"></span>' +
        '<a href="#annex_2_4/lvl_u1/lvl_4_bis">4<sup>bis </sup></a>' +
        '<span class="man-font-weight-normal"><sup><a href="#fn-d278902e14472" ' +
        'id="fnbck-d278902e14472">175</a></sup></span>' +
        '<a href="#annex_2_4/lvl_u1/lvl_4_bis"><span class="man-font-weight-normal"></span> ' +
        '<span class="man-font-weight-normal"></span>Biozidprodukte gegen Algen und Moose</a></h3>' +
        '<h4 class="heading"><a href="#c">4<sup>bis</sup>.1 Begriffe</a></h4>' +
        '<h4 class="heading"><a href="#d">4<sup>bis</sup>.2 Verbote</a></h4>' +
        '<h4 class="heading"><a href="#e">4<sup>ter</sup>.1 Begriffe</a></h4>' +
        '<h4 class="heading"><a href="#f">4<sup>ter</sup>.2 Bewilligung für die Anwendung im Wald</a></h4>' +
        '</div></section>',
    );
    const ex = extrahiereAnhang(html, 'annex_2_4')!;
    const titel = ex.bloecke.filter((b) => b.titel !== undefined).map((b) => b.text);
    expect(titel).toEqual([
      '4.1 Begriff',
      '4.2 Verbot',
      '4bis Biozidprodukte gegen Algen und Moose',
      '4bis.1 Begriffe',
      '4bis.2 Verbote',
      '4ter.1 Begriffe',
      '4ter.2 Bewilligung für die Anwendung im Wald',
    ]);
    // Die Fussnoten-Ziffer 175 darf NIRGENDS in den Normtext leaken (§1/§8).
    expect(titel.some((t) => /175/.test(t))).toBe(false);
  });

  // VZV: annex_1 und annex_1_bis sind ZWEI Anhänge. Vor dem Fix trugen beide
  // den Titel «Anhang 1» — ein Zitat traf den falschen Anhang.
  it('VZV: «Anhang 1» und «Anhang 1bis» tragen verschiedene Titel', () => {
    const html = wrapF(
      '<section id="annex_1"><h1 class="heading" role="heading" aria-level="1">' +
        '<span class="display-icon"></span><span class="external-link-icon"></span>' +
        '<a href="#annex_1">Anhang 1</a><span class="man-font-style-normal"><sup>' +
        '<a href="#fn-d367056e13718" id="fnbck-d367056e13718">480</a></sup></span></h1>' +
        '<div class="collapseable"><p class="absatz">Kategorien und Unterkategorien.</p></div></section>' +
        '<section id="annex_1_bis"><h1 class="heading" role="heading" aria-level="1">' +
        '<span class="display-icon"></span><span class="external-link-icon"></span>' +
        '<a href="#annex_1_bis">Anhang 1<sup>bis</sup><sup> </sup></a>' +
        '<span class="man-font-style-normal"><sup>' +
        '<a href="#fn-d367056e14294" id="fnbck-d367056e14294">481</a></sup></span></h1>' +
        '<div class="collapseable"><p class="absatz">Ausbildung der Fahrlehrer.</p></div></section>',
    );
    expect(alleAnhangAnker(html)).toEqual(['annex_1', 'annex_1_bis']);
    const a1 = extrahiereAnhang(html, 'annex_1')!;
    const a1bis = extrahiereAnhang(html, 'annex_1_bis')!;
    expect(a1.titel).toBe('Anhang 1');
    expect(a1bis.titel).toBe('Anhang 1bis');
    expect(a1.titel).not.toBe(a1bis.titel);
  });

  // Gegenprobe (unbetroffener Fall): Überschriften OHNE lat. Ordinal bleiben
  // zeichengleich zum Verhalten vor dem Fix — insbesondere werden reine
  // Fussnoten-<sup><a>N</a></sup> weiterhin samt Ziffer getilgt.
  it('unbetroffene Überschriften bleiben unverändert (kein Fussnoten-Leak)', () => {
    const html = wrapF(
      '<section id="annex_3"><h1 class="heading"><span class="display-icon"></span>' +
        '<a href="#annex_3">Anhang 3</a><sup><a href="#fn-x" id="fnbck-x">99</a></sup></h1>' +
        '<div class="collapseable">' +
        '<h2 class="heading"><a href="#y">1 Oberirdische Gewässer</a></h2>' +
        '<h3 class="heading"><a href="#z">1.1 Begriffe<sup><a href="#fn-q" id="fnbck-q">100</a></sup></a></h3>' +
        '</div></section>',
    );
    const ex = extrahiereAnhang(html, 'annex_3')!;
    expect(ex.titel).toBe('Anhang 3');
    expect(ex.bloecke.filter((b) => b.titel !== undefined).map((b) => b.text)).toEqual([
      '1 Oberirdische Gewässer',
      '1.1 Begriffe',
    ]);
  });
});
