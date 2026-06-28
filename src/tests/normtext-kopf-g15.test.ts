/**
 * M5 (Erlass-Kopf) + G15 (Hervorhebungen im Fussnotentext) + G11 (Sektions-
 * Fussnoten-Assoziation). Fixtures = echte preface/preamble-/footnote-Ausschnitte
 * aus Fedlex-Filestore-HTML (ZGB, BV, OR; konsolidierte Fassungen 2024–2026).
 */
import { describe, it, expect } from 'vitest';
import { extrahiereKopf } from '../../scripts/normtext/kopf-extrahiere';
import { fnDefinitionen } from '../../scripts/normtext/fussnoten-extrahiere';
import { extrahiereStruktur } from '../../scripts/normtext/struktur-extrahiere';

// ── ZGB-Kopf: Gesetz mit Ingress (Erlassformel) ──────────────────────────────
const ZGB_KOPF = `<div id="preface"><!--210 --><p class="srnummer">210 </p><h1 class="erlasstitel botschafttitel">Schweizerisches Zivilgesetzbuch</h1><p class="erlassdatum man-space-before-3">vom 10. Dezember 1907 (Stand am 1. Januar 2026)</p></div><div id="preamble"><div><p class="man-template-autor man-space-before-10">Die Bundesversammlung der Schweizerischen Eidgenossenschaft,</p><p class="ingress man-space-before-3">gestützt auf Artikel 64 der Bundesverfassung<sup><a href="#fn-d1706615e18" id="fnbck-d1706615e18">1</a></sup>,<sup><a href="#fn-d1706615e36" id="fnbck-d1706615e36">2</a></sup> <br>nach Einsicht in eine Botschaft des Bundesrates vom 28. Mai 1904<sup><a href="#fn-d1706615e58" id="fnbck-d1706615e58">3</a></sup>,</p><p class="man-template-verb man-space-before-3 man-space-after-18">beschliesst:</p><div class="footnotes"><p id="fn-d1706615e18"><sup><a href="#fnbck-d1706615e18">1</a></sup><sup></sup><sup> </sup>[BS <b>1</b> 3]. Dieser Bestimmung entspricht Artikel 122 der Bundesverfassung (<a href="https://fedlex.data.admin.ch/eli/cc/1999/404" target="_blank">SR <b>101</b></a>).</p><p id="fn-d1706615e36"><sup><a href="#fnbck-d1706615e36">2</a></sup><sup></sup> Fassung gemäss Anhang Ziff. 2 des Gerichtsstandsgesetzes (<a href="https://fedlex.data.admin.ch/eli/oc/2000/374" target="_blank">AS <b>2000</b> 2355</a>; <i>BBl <b>1999</b> 2829</i>).</p></div></div></div>`;

// ── BV-Kopf: materielle Präambel (G6, kein Ingress, eigene <h5>-Überschrift) ──
const BV_KOPF = `<div id="preface"><p class="srnummer ">101</p><h1 class="erlasstitel botschafttitel ">Bundesverfassung <br>der Schweizerischen Eidgenossenschaft</h1><p class="erlassdatum ">vom 18. April 1999 (Stand am 3. März 2024)</p></div><div id="preamble"><h5><heading-info level="9"><tmp:heading xmlns:tmp="urn:x"><b>Präambel</b></tmp:heading></heading-info></h5><p class="absatz ">Im Namen Gottes des Allmächtigen!</p><p class="man-template-autor ">Das Schweizervolk und die Kantone,</p><p class="absatz ">in der Verantwortung gegenüber der Schöpfung,</p><p class="man-template-verb ">geben sich folgende Verfassung<span class="man-font-style-normal"><sup><a href="#fn-d7e37" id="fnbck-d7e37">1</a></sup></span>:</p><div class="footnotes"><p id="fn-d7e37"><sup><a href="#fnbck-d7e37">1</a></sup> Angenommen in der Volksabstimmung (<a href="https://fedlex.data.admin.ch/eli/oc/1999/404" target="_blank">AS <b>1999</b> 2556</a>).</p></div></div>`;

describe('M5 · extrahiereKopf — Erlass-Kopf (preface/preamble)', () => {
  it('ZGB: SR-Nr, Titel, Erlassdatum + Erlassformel (autor/ingress/verb) in Reihenfolge', () => {
    const k = extrahiereKopf(ZGB_KOPF);
    expect(k).not.toBeNull();
    expect(k!.srNummer).toBe('210');
    expect(k!.titel).toBe('Schweizerisches Zivilgesetzbuch');
    expect(k!.erlassdatum).toBe('vom 10. Dezember 1907 (Stand am 1. Januar 2026)');
    expect(k!.praeambel!.map((z) => z.rolle)).toEqual(['autor', 'ingress', 'verb']);
    // Ingress = Rechtsgrundlage, Fussnoten-Marker entfernt, <br> → Leerzeichen
    expect(k!.praeambel![1].text).toBe(
      'gestützt auf Artikel 64 der Bundesverfassung, nach Einsicht in eine Botschaft des Bundesrates vom 28. Mai 1904,',
    );
    expect(k!.praeambel![2].text).toBe('beschliesst:');
    // Kopf-Fussnoten über fnDefinitionen aufgelöst
    expect(k!.fussnoten!.length).toBe(2);
    expect(k!.fussnoten![0].nr).toBe('1');
  });

  it('BV: materielle Präambel mit eigener Überschrift (G6), kein Ingress', () => {
    const k = extrahiereKopf(BV_KOPF);
    expect(k!.praeambelTitel).toBe('Präambel');
    expect(k!.titel).toBe('Bundesverfassung der Schweizerischen Eidgenossenschaft');
    const rollen = k!.praeambel!.map((z) => z.rolle);
    expect(rollen).toContain('praeambel');
    expect(rollen).toContain('verb');
    expect(rollen).not.toContain('ingress'); // BV hat keine Delegationsnorm
    expect(k!.praeambel![0].text).toBe('Im Namen Gottes des Allmächtigen!');
    expect(k!.praeambel!.at(-1)!.text).toBe('geben sich folgende Verfassung:');
  });

  it('gibt null zurück, wenn weder Titel noch Präambel vorhanden sind', () => {
    expect(extrahiereKopf('<main><article id="art_1">x</article></main>')).toBeNull();
  });

  // Ältere Erlasse (VRV/VStG/VwVG) + Staatsverträge setzen die Erlassformel in
  // KLASSENLOSE <p> — ohne Heuristik ginge der ganze Ingress still verloren (§2/§8).
  it('klassenlose Präambel: Rolle heuristisch (autor/ingress/verb), kein Inhalt verloren', () => {
    const KLASSENLOS = `<div id="preface"><p class="srnummer">741.11</p><h1 class="erlasstitel">Verkehrsregelnverordnung</h1></div><div id="preamble"><div><p>Der Schweizerische Bundesrat,</p><p>gestützt auf die Artikel 2 und 103 des Strassenverkehrsgesetzes,</p><p>verordnet:</p><div class="footnotes"><p id="fn-x2">2 SR 741.01</p></div></div></div>`;
    const k = extrahiereKopf(KLASSENLOS)!;
    expect(k.praeambel!.map((z) => [z.rolle, z.text])).toEqual([
      ['autor', 'Der Schweizerische Bundesrat,'],
      ['ingress', 'gestützt auf die Artikel 2 und 103 des Strassenverkehrsgesetzes,'],
      ['verb', 'verordnet:'],
    ]);
    // Der Fussnoten-<p> («2 SR 741.01») ist über den koerper-Cut ausgeschlossen.
    expect(k.praeambel!.some((z) => z.text.includes('SR 741.01'))).toBe(false);
  });

  it('Staatsvertrag (klassenlos): erste Zeile autor, Erwägungen praeambel', () => {
    const TREATY = `<div id="preface"><p class="srnummer">0.103.2</p><h1 class="erlasstitel">Pakt</h1></div><div id="preamble"><p>Die Vertragsstaaten dieses Paktes,</p><p>in der Erwägung, dass nach den Grundsätzen der Charta,</p><p>vereinbaren folgende Artikel:</p><div class="footnotes"><p id="fn-x">AS 1993 747</p></div></div>`;
    const k = extrahiereKopf(TREATY)!;
    const rollen = k.praeambel!.map((z) => z.rolle);
    expect(rollen[0]).toBe('autor');
    expect(rollen[1]).toBe('praeambel'); // «in der Erwägung …» ist KEIN CH-Ingress
    expect(rollen[2]).toBe('verb');      // «vereinbaren … Artikel:»
  });
});

describe('G15 · fnDefinitionen — Hervorhebungen (fett/kursiv) erhalten', () => {
  it('behält <b>/<i> im Fussnotentext (statt sie zu strippen)', () => {
    const defs = fnDefinitionen(ZGB_KOPF);
    const fn2 = defs.get('fn-d1706615e36')!;
    // AS-/BBl-Nummern bleiben fett/kursiv → Rich-Text in fnTextMitLinks
    expect(fn2.text).toContain('AS <b>2000</b> 2355');
    expect(fn2.text).toContain('<i>BBl <b>1999</b> 2829</i>');
    // Link-Label trägt die Hervorhebung konsistent zum Text (split bleibt robust)
    expect(fn2.links.some((l) => l.label === 'AS <b>2000</b> 2355')).toBe(true);
  });

  it('strippt alle ANDEREN Tags (kein Tag-Leak ausser b/i)', () => {
    const defs = fnDefinitionen(ZGB_KOPF);
    const fn1 = defs.get('fn-d1706615e18')!;
    expect(fn1.text).not.toContain('<a');
    expect(fn1.text).not.toContain('<sup');
    expect(fn1.text).toContain('SR <b>101</b>'); // b bleibt
  });
});

describe('G11 · extrahiereStruktur — Section-heading-Fussnoten behalten ihre Überschrift', () => {
  // OR-Ausschnitt (faithful): Randtitel «G. Verjährung» = <div class="heading">
  // (kind='m'), mit Fussnote 34 am Titel; danach der erste Artikel darunter.
  const OR_SEKTION = `<div class="collapseable"><div class="heading" role="heading"><a href="#lvl_G">G. Verjährung</a><sup><sup><a href="#fn-x34" id="fnbck-x34">34</a></sup></sup></div><div class="collapseable"><article id="art_60"><h6 class="heading"><a href="#art_60"><b>Art. 60</b></a></h6><div class="collapseable"><p class="absatz">Der Anspruch verjährt …</p></div></article></div></div><div class="footnotes"><p id="fn-x34"><sup><a href="#fnbck-x34">34</a></sup> Fassung gemäss Ziff. I des BG.</p></div>`;
  it('randtitelFn trägt {fnId, label, kind} der Quell-Überschrift', () => {
    const st = extrahiereStruktur(OR_SEKTION);
    const a60 = st['60'];
    expect(a60.randtitelFn).toBeDefined();
    const rf = a60.randtitelFn![0];
    expect(rf.fnId).toBe('fn-x34');
    expect(rf.label).toBe('G. Verjährung');
    expect(rf.kind).toBe('m'); // Randtitel (Marginalie), kein amtlicher Gliederungs-Knoten
  });
});
