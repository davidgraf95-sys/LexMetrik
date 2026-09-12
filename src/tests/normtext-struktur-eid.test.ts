import { describe, it, expect } from 'vitest';
import { extrahiereStruktur, extrahiereAnhangStruktur } from '../../scripts/normtext/struktur-extrahiere.ts';
import { anhangContainerEId } from '../../scripts/normtext/extrahiere-fedlex.ts';

// EID-1 (W2·5d §12, FAHRPLAN-GESETZES-UX.md): Fedlex-Container tragen kumulative
// AKN-Pfad-eIds als <section id="part_1/tit_1">. Der Extraktor schneidet sie
// ADDITIV ins Sidecar (`gliederung[i].eId`) mit — reine Outbound-Daten, bei jeder
// Regeneration neu erzeugt, NIE eigene Anker (§12.1/§12.4, K2/R8). Bestehende
// Felder (ebene/label/marginalie) bleiben byte-gleich.
//
// Fixture-Manier = reales Fedlex-Muster (verifiziert 24.7.2026 an /tmp/zgb.html,
// korpusweit 17'307 Sektionen): jede <section id="…"> wird UNMITTELBAR von ihrem
// Heading gefolgt (hN.heading für Gliederungsstufen, div.heading für Randtitel).
describe('extrahiereStruktur — Container-eIds im Sidecar (EID-1)', () => {
  const html =
    '<section id="part_1"><h1 class="heading" role="heading" aria-level="1">'
    + '<a href="#part_1">Erster Teil: Allgemeine Bestimmungen</a></h1><div class="collapseable">'
    + '<section id="part_1/tit_1"><h2 class="heading" role="heading" aria-level="2">'
    + '<a href="#part_1/tit_1">Erster Titel: Die Entstehung der Obligationen</a></h2><div class="collapseable">'
    + '<section id="part_1/tit_1/lvl_A"><div class="heading" role="heading" aria-level="3">'
    + '<a href="#part_1/tit_1/lvl_A">A. Abschluss des Vertrages</a></div><div class="collapseable">'
    + '<article id="art_1"><h6 class="heading"><a href="#art_1"><b>Art. 1</b></a></h6>'
    + '<div class="collapseable"><p class="absatz ">Text.</p></div></article>'
    + '</div></section></div></section></div></section>';

  it('trägt je Gliederungs-Ebene die Container-eId der umschliessenden <section>', () => {
    const s = extrahiereStruktur(html)['1'];
    expect(s.gliederung).toEqual([
      { ebene: 1, label: 'Erster Teil: Allgemeine Bestimmungen', eId: 'part_1' },
      { ebene: 2, label: 'Erster Titel: Die Entstehung der Obligationen', eId: 'part_1/tit_1' },
    ]);
  });

  it('lässt bestehende Felder unverändert (marginalie ohne eId, Labels byte-gleich)', () => {
    const s = extrahiereStruktur(html)['1'];
    expect(s.marginalie).toEqual(['A. Abschluss des Vertrages']);
  });

  it('setzt KEINE eId, wenn das Heading nicht von einer <section> umschlossen ist', () => {
    // Alt-Fixture-Manier (bestehende Tests): div.heading/hN ohne section-Wrapper.
    const ohneSektion =
      '<h2 class="heading"><a href="#x">Zweiter Titel</a></h2><div class="collapseable">'
      + '<article id="art_2"><h6 class="heading"><a href="#art_2"><b>Art. 2</b></a></h6>'
      + '<div class="collapseable"><p class="absatz ">Text.</p></div></article></div>';
    const s = extrahiereStruktur(ohneSektion)['2'];
    expect(s.gliederung).toEqual([{ ebene: 2, label: 'Zweiter Titel' }]);
    expect('eId' in s.gliederung[0]).toBe(false);
  });

  it('verwirft eine pending-eId, wenn zwischen <section> und Heading ein anderes Tag liegt (NHG-h7-Manier)', () => {
    // NHG-Befund (24.7.2026): <section id="lvl_u1/chap_1"><h7 class="heading">…
    // h7 ist vom TAG-Regex unsichtbar; das nächste gematchte Tag ist ein
    // Nicht-Heading-div → die eId darf NICHT auf das nächste Heading leaken.
    const leak =
      '<section id="lvl_u1/chap_1"><h7 class="heading"><a href="#lvl_u1/chap_1">1. Abschnitt</a></h7>'
      + '<div class="footnotes"><p>fn</p></div>'
      + '<h2 class="heading"><a href="#y">Fremder Titel</a></h2><div class="collapseable">'
      + '<article id="art_3"><h6 class="heading"><a href="#art_3"><b>Art. 3</b></a></h6>'
      + '<div class="collapseable"><p class="absatz ">Text.</p></div></article></div></section>';
    const s = extrahiereStruktur(leak)['3'];
    expect(s.gliederung).toEqual([{ ebene: 2, label: 'Fremder Titel' }]);
  });

  it('schneidet Schlusstitel-Container-eIds mit (disp-Schema)', () => {
    const disp =
      '<section id="disp_u1/chap_1"><h2 class="heading"><a href="#disp_u1/chap_1">Erster Abschnitt</a></h2>'
      + '<div class="collapseable"><article id="disp_u1/art_1"><h6 class="heading">'
      + '<a href="#disp_u1/art_1"><b>Art. 1</b></a></h6>'
      + '<div class="collapseable"><p class="absatz ">Text.</p></div></article></div></section>';
    const s = extrahiereStruktur(disp)['disp_u1_art_1'];
    expect(s).toBeDefined();
    expect(s.gliederung).toEqual([{ ebene: 2, label: 'Erster Abschnitt', eId: 'disp_u1/chap_1' }]);
  });
});

// W2·5d-ANNEX: die in §12.5 dokumentierte EID-1-Grenze — der separate Anhang-Pfad
// (extrahiereAnhangStruktur) warf die Container-eId weg. Fixture-Manier = reales
// Fedlex-Muster (verifiziert 3.8.2026 an /tmp/chemrrv.html bzw. /tmp/gschv.html):
// <div id="annex"> umschliesst flache <section id="annex_N">-Anhänge.
describe('extrahiereAnhangStruktur — Container-eId des Anhang-Blocks (W2·5d-ANNEX)', () => {
  const anhang = (inner: string) => `<div id="annex">${inner}</div>`;
  const sektion = (id: string, titel: string) =>
    `<section id="${id}"><h1 class="heading" role="heading" aria-level="1">`
    + `<span class="display-icon"></span><a href="#${id}">${titel}</a></h1>`
    + `<div class="collapseable"><p class="absatz">Inhalt ${titel}.</p></div></section>`;

  it('hängt die Container-eId «annex» an die Gliederungsstufe «Anhänge»', () => {
    const html = anhang(sektion('annex_1', 'Anhang 1') + sektion('annex_2', 'Anhang 2'));
    const s = extrahiereAnhangStruktur(html);
    expect(Object.keys(s).sort()).toEqual(['annex_1', 'annex_2']);
    // Reiner Zusatz: ebene/label/marginalie unverändert, nur eId kommt dazu.
    expect(s['annex_1']).toEqual({ gliederung: [{ ebene: 1, label: 'Anhänge', eId: 'annex' }], marginalie: [] });
    expect(s['annex_2'].gliederung[0].eId).toBe('annex');
  });

  it('vergibt die eId auch im unnummerierten Ein-Anhang-Fall (annex_uN, BVG/KVG-Manier)', () => {
    const html = anhang(sektion('annex_u1', 'Anhang'));
    const s = extrahiereAnhangStruktur(html);
    expect(s['annex_u1'].gliederung).toEqual([{ ebene: 1, label: 'Anhänge', eId: 'annex' }]);
  });

  it('nimmt NIE die eId eines einzelnen Anhangs an den Gruppen-Knoten', () => {
    // Sonst zeigte der Sektions-Link für Anhang 2..n auf Anhang 1 (§8).
    const html = anhang(sektion('annex_1', 'Anhang 1') + sektion('annex_2', 'Anhang 2'));
    const eIds = Object.values(extrahiereAnhangStruktur(html)).map((v) => v.gliederung[0].eId);
    expect(new Set(eIds)).toEqual(new Set(['annex']));
  });

  it('erfasst auch die Staatsvertrags-Sektionen NACH dem Container (offengelegte Unschärfe)', () => {
    // 14 Staatsverträge tragen scope_u*/decl_u* als GESCHWISTER nach </div>;
    // alleAnhangAnker sammelt sie mit, der Gruppen-Knoten trägt dieselbe eId.
    // Der Test hält das Verhalten fest, damit es sichtbar bleibt statt still.
    const html = anhang(sektion('annex_u1', 'Anhang')) + sektion('scope_u1', 'Geltungsbereich');
    const s = extrahiereAnhangStruktur(html);
    expect(Object.keys(s).sort()).toEqual(['annex_u1', 'scope_u1']);
    expect(s['scope_u1'].gliederung).toEqual([{ ebene: 1, label: 'Anhänge', eId: 'annex' }]);
  });

  it('fabriziert nichts ohne amtlichen Container (§7)', () => {
    expect(anhangContainerEId('<main><article id="art_1"><p>x</p></article></main>')).toBeUndefined();
    // Ohne <div id="annex"> findet alleAnhangAnker ohnehin keinen Anhang.
    expect(extrahiereAnhangStruktur(sektion('annex_1', 'Anhang 1'))).toEqual({});
  });

  it('liest die Container-eId aus dem HTML, statt sie zu konstruieren', () => {
    expect(anhangContainerEId(anhang(sektion('annex_1', 'Anhang 1')))).toBe('annex');
  });

  // ── QS-KORPUS-SCOPE (12.9.2026) ───────────────────────────────────────────
  // Ohne annex-Container ist der amtliche Knoten der scope-Container; der
  // Gruppen-Knoten heisst dann nach seinem Inhalt, nicht «Anhänge» (§8: ein
  // Erlass ohne einen einzigen Anhang darf keine Anhang-Stufe behaupten).
  const scopeDiv = (inner: string) => `<div id="scope">${inner}</div>`;

  it('ohne annex-Container ist die Container-eId der scope-Container', () => {
    expect(anhangContainerEId(scopeDiv(sektion('scope_u1', 'Geltungsbereich')))).toBe('scope');
  });

  it('annex gewinnt über scope, wenn BEIDE vorhanden sind (LUGUE-Klasse unverändert)', () => {
    const html = anhang(sektion('annex_u1', 'Anhang')) + scopeDiv(sektion('scope_u1', 'Geltungsbereich'));
    expect(anhangContainerEId(html)).toBe('annex');
  });

  it('nur scope: Gruppen-Knoten heisst «Geltungsbereich» und trägt die scope-eId', () => {
    const html = scopeDiv(sektion('scope_u1', 'Geltungsbereich am 22. Mai 2026'));
    const s = extrahiereAnhangStruktur(html);
    expect(Object.keys(s)).toEqual(['scope_u1']);
    expect(s['scope_u1'].gliederung).toEqual([
      { ebene: 1, label: 'Geltungsbereich', eId: 'scope' },
    ]);
  });

  it('nur scope MIT decl-Sektionen: Label nennt beide Bestandteile', () => {
    const html = scopeDiv(
      sektion('scope_u1', 'Geltungsbereich am 22. Mai 2026') + sektion('decl_u2', 'Erklärungen'),
    );
    const s = extrahiereAnhangStruktur(html);
    expect(Object.keys(s).sort()).toEqual(['decl_u2', 'scope_u1']);
    for (const k of Object.keys(s)) {
      expect(s[k].gliederung).toEqual([
        { ebene: 1, label: 'Geltungsbereich und Erklärungen', eId: 'scope' },
      ]);
    }
  });
});
