// src/tests/gemini-diskrepanz-text.test.ts — deterministische Klartext-Reduktion
// für den Gemini-Diskrepanz-Finder (scripts/analyse/gemini-diskrepanz-text.ts).
// Kein agy-Aufruf hier (extern, keine Testpflicht — Auftrag QS-FREMDAGENTEN/
// Phase 2) — nur die REDUKTION: Quelle (Fedlex-HTML) und Snapshot (NormSnapshot[])
// müssen bei gleicher Eingabe byte-gleich dieselbe Ausgabe liefern (Determinismus,
// §2), Absatzmarker stehen INLINE im Text (T2-Lehre, scratchpad t2-recall/
// ERGEBNIS.md), und der Fussnoten-Apparat der Quelle bleibt vom Artikeltext
// GETRENNT statt hineinvermischt zu werden.

import { describe, it, expect } from 'vitest';
import {
  artikelLabelAusId,
  schaeleJson,
  reduziereQuelleHtml,
  reduziereSnapshot,
  formatiereArtikel,
} from '../../scripts/analyse/gemini-diskrepanz-text.ts';
import type { NormSnapshot } from '../lib/normtext/typen.ts';

const BEISPIEL_HTML = `<html><body><main><article id="art_5">
  <h6 class="heading"><a href="#art_5"><b>Art.&nbsp;5</b> Randtitel</a><sup><a href="#fn-x" id="fnbck-x">1</a></sup></h6>
  <div class="collapseable">
    <p class="absatz"><sup>1</sup>&nbsp;Einleitungssatz:</p>
    <dl>
      <dt>a.</dt><dd>erster Punkt<sup><a href="#fn-y" id="fnbck-y">2</a></sup>;</dd>
      <dt>b.</dt><dd>zweiter Punkt mit Unterliste:
        <dl><dt>1.</dt><dd>Unterpunkt eins,</dd><dt>2.</dt><dd>Unterpunkt zwei.</dd></dl>
      </dd>
    </dl>
    <p class="absatz"><sup>2</sup>&nbsp;Zweiter Absatz ohne Aufzählung.</p>
    <div class="footnotes">
      <p id="fn-x"><sup><a href="#fnbck-x">1</a></sup> Randtitel-Fussnote.</p>
      <p id="fn-y"><sup><a href="#fnbck-y">2</a></sup> Fussnote zu lit. a.</p>
    </div>
  </div>
</article></body></html>`;

function snapshotEintrag(overrides: Partial<NormSnapshot> = {}): NormSnapshot {
  return {
    id: 'bund/TEST/art_5',
    ebene: 'bund',
    quelle: 'TEST',
    erlass: 'TEST',
    artikel: '5',
    artikelLabel: 'Art. 5',
    bloecke: [
      { absatz: '1', text: 'Einleitungssatz:', items: [
        { marke: 'a', text: 'erster Punkt;' },
        { marke: 'b', text: 'zweiter Punkt mit Unterliste:' },
        { marke: '1', text: 'Unterpunkt eins,', tiefe: 1 },
        { marke: '2', text: 'Unterpunkt zwei.', tiefe: 1 },
      ] },
      { absatz: '2', text: 'Zweiter Absatz ohne Aufzählung.' },
    ],
    stand: '2026-01-01',
    quelleUrl: 'https://example.test/art_5',
    abgerufen: '2026-01-01',
    fassungsToken: '20260101',
    sha: 'x'.repeat(64),
    ...overrides,
  };
}

describe('reduziereQuelleHtml', () => {
  it('ist deterministisch: gleiche Eingabe -> gleiche Ausgabe', () => {
    const a = reduziereQuelleHtml(BEISPIEL_HTML);
    const b = reduziereQuelleHtml(BEISPIEL_HTML);
    expect(formatiereArtikel(a.get('5')!)).toBe(formatiereArtikel(b.get('5')!));
  });

  it('setzt Absatzmarker inline in den Text (keine separate Kodierung)', () => {
    const map = reduziereQuelleHtml(BEISPIEL_HTML);
    const art = map.get('5')!;
    expect(art.text).toContain('1 Einleitungssatz:');
    expect(art.text).toContain('2 Zweiter Absatz ohne Aufzählung.');
  });

  it('rendert verschachtelte Aufzählungen (dl/dt/dd) inkl. Unterlisten', () => {
    const map = reduziereQuelleHtml(BEISPIEL_HTML);
    const art = map.get('5')!;
    expect(art.text).toContain('a. erster Punkt;');
    expect(art.text).toContain('b. zweiter Punkt mit Unterliste:');
    expect(art.text).toContain('1. Unterpunkt eins,');
    expect(art.text).toContain('2. Unterpunkt zwei.');
  });

  it('entfernt Fussnoten-Referenzmarker aus dem Artikeltext (reines Verweis-Rauschen)', () => {
    const map = reduziereQuelleHtml(BEISPIEL_HTML);
    const art = map.get('5')!;
    expect(art.text).not.toMatch(/erster Punkt2;/);
  });

  it('hält den Fussnoten-Apparat GETRENNT vom Artikeltext', () => {
    const map = reduziereQuelleHtml(BEISPIEL_HTML);
    const art = map.get('5')!;
    expect(art.text).not.toContain('Randtitel-Fussnote');
    expect(art.text).not.toContain('Fussnote zu lit. a');
    expect(art.fussnoten).toContain('Randtitel-Fussnote');
    expect(art.fussnoten).toContain('Fussnote zu lit. a');
  });

  it('filtert nach Artikel-Spanne (von/bis)', () => {
    const nurAndere = reduziereQuelleHtml(BEISPIEL_HTML, 10, 20);
    expect(nurAndere.has('5')).toBe(false);
    const nurFuenf = reduziereQuelleHtml(BEISPIEL_HTML, 1, 5);
    expect(nurFuenf.has('5')).toBe(true);
  });
});

describe('reduziereSnapshot', () => {
  it('ist deterministisch: gleiche Eingabe -> gleiche Ausgabe', () => {
    const e = snapshotEintrag();
    const a = reduziereSnapshot([e]);
    const b = reduziereSnapshot([e]);
    expect(formatiereArtikel(a.get('5')!)).toBe(formatiereArtikel(b.get('5')!));
  });

  it('setzt Absatzmarker inline, wie bei der Quelle', () => {
    const map = reduziereSnapshot([snapshotEintrag()]);
    const art = map.get('5')!;
    expect(art.text).toContain('1 Einleitungssatz:');
    expect(art.text).toContain('2 Zweiter Absatz ohne Aufzählung.');
  });

  it('führt keinen separaten Fussnoten-Text (Snapshot-Schema kennt das Feld nicht)', () => {
    const map = reduziereSnapshot([snapshotEintrag()]);
    expect(map.get('5')!.fussnoten).toBe('');
  });
});

describe('Quelle und Snapshot erzeugen dasselbe Format', () => {
  it('Art. 5 aus Quelle und Snapshot sind textlich identisch (Positiv-Kontrolle ohne Abweichung)', () => {
    const quelle = reduziereQuelleHtml(BEISPIEL_HTML).get('5')!;
    const snap = reduziereSnapshot([snapshotEintrag()]).get('5')!;
    expect(quelle.text).toBe(snap.text);
  });

  it('deckt einen eingebauten drop auf (Snapshot fehlt lit. b)', () => {
    const luecke = snapshotEintrag({
      bloecke: [
        { absatz: '1', text: 'Einleitungssatz:', items: [{ marke: 'a', text: 'erster Punkt;' }] },
        { absatz: '2', text: 'Zweiter Absatz ohne Aufzählung.' },
      ],
    });
    const quelle = reduziereQuelleHtml(BEISPIEL_HTML).get('5')!;
    const snap = reduziereSnapshot([luecke]).get('5')!;
    expect(quelle.text).not.toBe(snap.text);
    expect(quelle.text).toContain('b. zweiter Punkt');
    expect(snap.text).not.toContain('zweiter Punkt');
  });
});

// ─── Nachbesserung 4.9.2026 (Opus-Prüfer-Befunde zu PR #650) ─────────────
//
// Alle Fixtures unten sind ECHTE Ausschnitte, nicht Kunst-HTML:
//   - Quelle:   /tmp/gebv_schkg.html bzw. /tmp/ambv.html (gepinnter Fedlex-
//               Filestore-Cache, scripts/fedlex-cache.sh), Whitespace zwischen
//               den Tags entfernt, lange Tabellen nach der 2. Datenzeile gekappt.
//   - Snapshot: 1:1 aus public/normtext/bund/{GEBV_SCHKG,AMBV,DBG,AKKBV}.json.
// Jeder dieser fünf Fälle wurde am ungefixten Stand als DIFFERENZ gemessen
// (Scratch-Diff über GEBV_SCHKG/AMBV/DBG, 4.9.2026) — es sind reproduzierte
// Harness-Scheinfunde, keine hypothetischen.

/** GebV SchKG Art. 10bis — Fedlex-ID `art_10_bis`, Snapshot-Label «Art. 10bis». */
const Q_ART_10BIS = `<html><body><main><article id="art_10_bis"><a name="a10bis"></a><h6 class="heading" role="heading"><a href="#art_10_bis"><b>Art. 10</b><sup>bis</sup><sup> </sup></a><sup><a href="#fn-d43723e253" id="fnbck-d43723e253">4</a></sup></h6><div class="collapseable"><p class="absatz man-space-before-4">Wurde mindestens einmal erfolglos versucht, dem Schuldner einen Zahlungsbefehl zuzustellen, so beträgt die Gebühr für dieses Schreiben 8 Franken. </p></div></article></main></body></html>`;

/** GebV SchKG Art. 12a — Fedlex-ID `art_12_a`, Snapshot-Label «Art. 12a». */
const Q_ART_12A = `<html><body><main><article id="art_12_a"><a name="a12a"></a><h6 class="heading" role="heading"><a href="#art_12_a"><b>Art. 12</b><i>a</i></a><sup><a href="#fn-d43723e307" id="fnbck-d43723e307">5</a></sup><a href="#art_12_a"><b></b> <b></b>Schriftliche Betreibungsregisterauskünfte</a></h6><div class="collapseable"><p class="absatz man-space-before-4"><sup>1</sup>&nbsp;Die Gebühr für einen schriftlichen Auszug aus dem Betreibungsregister beträgt unabhängig von der Seitenzahl pauschal 17 Franken.</p></div></article></main></body></html>`;

/** GebV SchKG Art. 9 — Absatz 1bis kommt als ZWEI aufeinanderfolgende <sup> (1 + bis). */
const Q_ART_9 = `<html><body><main><article id="art_9"><a name="a9"></a><h6 class="heading" role="heading"><a href="#art_9"><b>Art. 9</b><b></b> <b></b>Schriftstücke</a></h6><div class="collapseable"><p class="absatz man-space-before-4"><sup>1</sup>&nbsp;Die Gebühr für die Erstellung eines nicht besonders tarifierten Schriftstücks beträgt:</p><dl class="man-space-after-0"><dt class="man-space-before-4">a. </dt><dd class="man-space-before-4">8 Franken je Seite bis zu einer Anzahl von 20 Ausfertigungen;</dd><dt class="man-space-before-4">b. </dt><dd class="man-space-before-4">4 Franken je Seite für jede weitere Ausfertigung.</dd></dl><p class="absatz man-space-before-4"><sup>1</sup><sup>bis</sup>&nbsp;Erfordert die Erstellung eines Schriftstücks mehr als eine Stunde, so erhöht sich die Gebühr um 40 Franken für jede weitere halbe Stunde.<sup><a href="#fn-d43723e191" id="fnbck-d43723e191">2</a></sup></p><p class="absatz man-space-before-4"><sup>2</sup>&nbsp;Schriftstücke im Geldverkehr und Aktenexemplare sind gebührenfrei.</p></div></article></main></body></html>`;

/** GebV SchKG Art. 16 — amtliche <table> mit 2 <th> (colspan 3) und 6 <td> je Zeile, davon Leerzellen. */
const Q_ART_16 = `<html><body><main><article id="art_16"><a name="a16"></a><h6 class="heading" role="heading"><a href="#art_16"><b>Art. 16</b><b></b> <b></b>Zahlungsbefehl</a></h6><div class="collapseable"><p class="absatz man-space-before-4"><sup>1</sup>&nbsp;Die Gebühr für den Erlass, die doppelte Ausfertigung, die Eintragung und die Zustellung des Zahlungsbefehls bemisst sich nach der Forderung und beträgt:</p><p><div class="table"><table border="1"><tr><th class="man-text-align-left" colspan="3"><p class="man-template-tab-kpf">Forderung/Franken</p></th><th class="man-text-align-left" colspan="3"><p class="man-template-tab-kpf-r">Gebühr/Franken</p></th></tr><tr><td><p class="man-template-tab-krpr"></p></td><td><p class="man-template-tab-krpr-r"></p></td><td><p class="man-template-tab-krpr"></p></td><td><p class="man-template-tab-krpr">bis</p></td><td><p class="man-template-tab-krpr">100</p></td><td><p class="man-template-tab-krpr">7.&#8211;</p></td></tr><tr><td><p class="man-template-tab-krpr">über</p></td><td><p class="man-template-tab-krpr-r">100</p></td><td><p class="man-template-tab-krpr"></p></td><td><p class="man-template-tab-krpr">bis</p></td><td><p class="man-template-tab-krpr-r">500</p></td><td><p class="man-template-tab-krpr-r">20.&#8211;</p></td></tr></table></div></p></div></article></main></body></html>`;

/** AMBV Art. 47 — aufgehoben: die Quelle führt NUR noch den Fussnoten-Apparat, keinen Body. */
const Q_ART_47_AUFGEHOBEN = `<html><body><main><article id="art_47"><a name="a47"></a><h6 class="heading " role="heading"><a href="#art_47"><b>Art.&nbsp;47</b></a><sup><a href="#fn-d7e1570" id="fnbck-d7e1570">13</a></sup></h6><div class="collapseable"><div class="footnotes"><p id="fn-d7e1570"><sup><a href="#fnbck-d7e1570">13</a></sup><sup></sup> Aufgehoben durch Anhang Ziff. 1 der V vom 23. Nov. 2022, mit Wirkung seit 1. Jan. 2023.</p></div></div></article></main></body></html>`;

function snapshotRoh(over: Partial<NormSnapshot>): NormSnapshot {
  return {
    id: 'bund/X/art', ebene: 'bund', quelle: 'X', erlass: 'X',
    artikel: '1', artikelLabel: 'Art. 1', bloecke: [],
    stand: '2026-01-01', quelleUrl: 'https://example.test/', abgerufen: '2026-01-01',
    fassungsToken: '20260101', sha: 'x'.repeat(64), ...over,
  };
}

describe('(1) Artikel-Label aus der Fedlex-ID', () => {
  it('bildet «Art. 10bis» und «Art. 12a» statt «Art. 10_bis»/«Art. 12_a» (Snapshot-Label ist massgeblich)', () => {
    // Gemessen am ungefixten Stand (GEBV_SCHKG-Diff 4.9.2026): Quelle sagte
    // «Art. 10_bis», der Snapshot «Art. 10bis» — ein Label-Scheinfund über
    // JEDEN bis/ter/a-Artikel hinweg.
    expect(reduziereQuelleHtml(Q_ART_10BIS).get('10_bis')!.label).toBe('Art. 10bis');
    expect(reduziereQuelleHtml(Q_ART_12A).get('12_a')!.label).toBe('Art. 12a');
  });

  it('liest ein rein numerisches Folgesegment als SPANNE («Art. 49–50», nicht «Art. 4950»)', () => {
    // Realer Bestand: public/normtext/bund/DBG.json führt art_43_48,
    // art_73_78, art_86_87, art_208_220; GEBV_SCHKG.json art_49_50, art_58_60
    // — jeweils mit Snapshot-Label «Art. 43–48» usw. (Gedankenstrich U+2013).
    expect(artikelLabelAusId('49_50')).toBe('Art. 49\u201350');
    expect(artikelLabelAusId('208_220')).toBe('Art. 208\u2013220');
    // Abgrenzung: Buchstaben- und Ordinal-Suffixe bleiben angehängt.
    expect(artikelLabelAusId('220_a')).toBe('Art. 220a');
    expect(artikelLabelAusId('335_c')).toBe('Art. 335c');
    expect(artikelLabelAusId('1_bis')).toBe('Art. 1bis');
  });

  it('stimmt mit dem Snapshot-Label überein (Quelle == Snapshot, kein Fund)', () => {
    const q = reduziereQuelleHtml(Q_ART_10BIS).get('10_bis')!;
    const s = reduziereSnapshot([snapshotRoh({ artikel: '10_bis', artikelLabel: 'Art. 10bis' })]).get('10_bis')!;
    expect(q.label).toBe(s.label);
  });
});

describe('(2) Tabellen: <table> der Quelle und mehrspaltig des Snapshots', () => {
  // Snapshot GebV SchKG Art. 16 (public/normtext/bund/GEBV_SCHKG.json, 1:1):
  // die Quelle streut die Staffel über 6 Zellen inkl. Leerzellen, der Snapshot
  // verdichtet sie auf 2 Spalten. Beide Reduktionen müssen daraus DENSELBEN
  // Klartext machen, sonst schlägt jede Tarif-Tabelle als Scheinfund an.
  const snapArt16 = snapshotRoh({
    artikel: '16', artikelLabel: 'Art. 16',
    bloecke: [
      { absatz: '1', text: 'Die Gebühr für den Erlass, die doppelte Ausfertigung, die Eintragung und die Zustellung des Zahlungsbefehls bemisst sich nach der Forderung und beträgt:' },
      { absatz: null, text: '', mehrspaltig: {
        spalten: [
          { typ: 'bereich', titel: 'Forderung/Franken' },
          { typ: 'betrag', titel: 'Gebühr/Franken' },
        ],
        zeilen: [['bis 100', '7.–'], ['über 100 bis 500', '20.–']],
      } },
    ],
  });

  it('erzeugt aus derselben amtlichen Tabelle byte-gleichen Klartext auf beiden Seiten', () => {
    const q = reduziereQuelleHtml(Q_ART_16).get('16')!;
    const s = reduziereSnapshot([snapArt16]).get('16')!;
    expect(q.text).toBe(s.text);
  });

  it('rendert Kopf- und Datenzeilen mit demselben Einzug', () => {
    const q = reduziereQuelleHtml(Q_ART_16).get('16')!;
    const s = reduziereSnapshot([snapArt16]).get('16')!;
    for (const t of [q.text, s.text]) {
      expect(t).toContain('\n  Forderung/Franken Gebühr/Franken');
      expect(t).toContain('\n  bis 100 7.–');
    }
  });

  it('setzt KEINE Phantom-Kopfzeile, wenn alle Spaltentitel leer sind', () => {
    // Realer Fall: public/normtext/bund/ELG.json Art. 14, SSV Art. 1/66,
    // VZV Art. 84 tragen `spalten` mit durchgehend leerem `titel`.
    const ohneTitel = snapshotRoh({
      artikel: '14', artikelLabel: 'Art. 14',
      bloecke: [{ absatz: null, text: '', mehrspaltig: {
        spalten: [{ typ: 'text', titel: '' }, { typ: 'betrag', titel: '' }],
        zeilen: [['Alleinstehende Personen', '20 670'], ['Ehepaare', '31 005']],
      } }],
    });
    const text = reduziereSnapshot([ohneTitel]).get('14')!.text;
    expect(text.split('\n')[0]).toBe('  Alleinstehende Personen 20 670');
    expect(text).not.toMatch(/^\s*\|/m);
  });
});

describe('(3) Aufhebungs-Artikel', () => {
  it('normalisiert leere Quelle und Snapshot-«…» beide auf «(aufgehoben)» (kein Fund)', () => {
    // Gemessen am ungefixten Stand (AMBV-Diff 4.9.2026): Q = "" gegen S = "…".
    const q = reduziereQuelleHtml(Q_ART_47_AUFGEHOBEN).get('47')!;
    const s = reduziereSnapshot([snapshotRoh({
      artikel: '47', artikelLabel: 'Art. 47',
      bloecke: [{ absatz: null, text: '…' }],
    })]).get('47')!;
    expect(q.text).toBe('(aufgehoben)');
    expect(s.text).toBe('(aufgehoben)');
    expect(q.text).toBe(s.text);
  });

  it('behält den Fussnoten-Apparat der Quelle auch beim aufgehobenen Artikel', () => {
    const q = reduziereQuelleHtml(Q_ART_47_AUFGEHOBEN).get('47')!;
    expect(q.fussnoten).toContain('Aufgehoben durch Anhang Ziff. 1');
  });
});

describe('(4) Snapshot-Block mit `titel` (Anhang-Zwischenüberschrift)', () => {
  // Reale Struktur: public/normtext/bund/AKKBV.json, Eintrag annex_1.
  it('gibt den Zwischentitel als eigene Zeile aus, in Blockreihenfolge', () => {
    const annex = snapshotRoh({
      artikel: 'annex_1', artikelLabel: 'Anhang 1',
      bloecke: [
        { absatz: null, text: '(Art. 5 Abs. 2 und Art. 9)' },
        { absatz: null, text: 'International massgebende Anforderungen, welche die Schweizerische Akkreditierungsstelle zu erfüllen hat', titel: 2 },
        { absatz: null, text: 'SN EN ISO/IEC 17011, Konformitätsbewertung – Allgemeine Anforderungen an Akkreditierungsstellen, die Konformitätsbewertungsstellen akkreditieren.' },
      ],
    });
    const zeilen = reduziereSnapshot([annex]).get('annex_1')!.text.split('\n');
    expect(zeilen[0]).toBe('(Art. 5 Abs. 2 und Art. 9)');
    expect(zeilen[1]).toBe('International massgebende Anforderungen, welche die Schweizerische Akkreditierungsstelle zu erfüllen hat');
    expect(zeilen[2]).toContain('SN EN ISO/IEC 17011');
  });

  it('verwirft die Geschwister-Felder desselben Blocks NICHT (items/mehrspaltig)', () => {
    // Der bisherige Code kehrte bei `titel` sofort zurück und liess alles
    // Weitere im selben Block fallen — ein stiller drop, sobald ein Anhang
    // Zwischentitel und Tabelle in EINEM Block führt.
    const annex = snapshotRoh({
      artikel: 'annex_1', artikelLabel: 'Anhang 1',
      bloecke: [{ absatz: null, text: 'Gebührenansätze', titel: 2, mehrspaltig: {
        spalten: [{ typ: 'bereich', titel: 'Forderung/Franken' }, { typ: 'betrag', titel: 'Gebühr/Franken' }],
        zeilen: [['bis 100', '7.–']],
      } }],
    });
    const text = reduziereSnapshot([annex]).get('annex_1')!.text;
    expect(text).toContain('Gebührenansätze');
    expect(text).toContain('bis 100 7.–');
  });
});

describe('(5) Absatzmarker auf beiden Pfaden gleich', () => {
  it('zieht ein zweiteiliges <sup>1</sup><sup>bis</sup> der Quelle zu «1bis» zusammen', () => {
    // Gemessen am ungefixten Stand (GEBV_SCHKG-Diff 4.9.2026): Q = "1 bis
    // Erfordert …" gegen S = "1bis Erfordert …".
    const q = reduziereQuelleHtml(Q_ART_9).get('9')!;
    expect(q.text).toContain('1bis Erfordert die Erstellung');
    expect(q.text).not.toContain('1 bis Erfordert');
  });

  it('entdoppelt eine im Snapshot-Text bereits enthaltene Absatznummer', () => {
    // Gemessen am ungefixten Stand (DBG-Diff 4.9.2026): S = "4 4 Schüttet …"
    // gegen Q = "4 Schüttet …" — public/normtext/bund/DBG.json Art. 20 führt
    // die Nummer sowohl im Feld `absatz` als auch am Anfang von `text`.
    const s = reduziereSnapshot([snapshotRoh({
      artikel: '20', artikelLabel: 'Art. 20',
      bloecke: [{ absatz: '4', text: '4 Schüttet eine Kapitalgesellschaft oder Genossenschaft Reserven aus, so ist die Rückzahlung steuerbar.' }],
    })]).get('20')!;
    expect(s.text).toBe('4 Schüttet eine Kapitalgesellschaft oder Genossenschaft Reserven aus, so ist die Rückzahlung steuerbar.');
  });

  it('Quelle und Snapshot stimmen bei Absatz 1bis überein (kein Fund)', () => {
    const q = reduziereQuelleHtml(Q_ART_9).get('9')!;
    const s = reduziereSnapshot([snapshotRoh({
      artikel: '9', artikelLabel: 'Art. 9',
      bloecke: [
        { absatz: '1', text: 'Die Gebühr für die Erstellung eines nicht besonders tarifierten Schriftstücks beträgt:', items: [
          { marke: 'a', text: '8 Franken je Seite bis zu einer Anzahl von 20 Ausfertigungen;' },
          { marke: 'b', text: '4 Franken je Seite für jede weitere Ausfertigung.' },
        ] },
        { absatz: '1bis', text: 'Erfordert die Erstellung eines Schriftstücks mehr als eine Stunde, so erhöht sich die Gebühr um 40 Franken für jede weitere halbe Stunde.' },
        { absatz: '2', text: 'Schriftstücke im Geldverkehr und Aktenexemplare sind gebührenfrei.' },
      ],
    })]).get('9')!;
    expect(q.text).toBe(s.text);
  });
});

describe('(6) schaeleJson — Verpackung der Modellantwort', () => {
  // REALE Antworten aus den Pilotläufen vom 4.9.2026 (tempDir-Artefakt
  // `gruppe0-lauf0-antwort-roh.txt`), nicht konstruiert.
  it('nimmt bei ZWEI aneinandergehängten Objekten das letzte (schema-erzwungene)', () => {
    // Mit --json-schema liefert agy erst das vom Modell formulierte Objekt,
    // dann das erzwungene mit toolAction/toolSummary. Aneinandergehängt ist
    // das kein gültiges JSON — genau daran scheiterte der DBG-Lauf.
    const roh = `{
  "modell": "Gemini 3.1 Pro",
  "abweichungen": [
    {
      "artikel": "Art. 22",
      "absatz": "3 a.",
      "quelle": "",
      "snapshot": "2. Ist dieser Zinssatz negativ oder null, so beträgt der Ertragsanteil null Prozent.",
      "klasse": "leak"
    }
  ]
}
{"abweichungen":[{"absatz":"3 a.","artikel":"Art. 22","klasse":"leak","quelle":"","snapshot":"2. Ist dieser Zinssatz negativ oder null, so beträgt der Ertragsanteil null Prozent."}],"modell":"Gemini 3.1 Pro","toolAction":"Finishing task","toolSummary":"Finish task"}`;
    const kern = schaeleJson(roh);
    expect(kern).not.toBeNull();
    const payload = JSON.parse(kern!) as { modell: string; abweichungen: unknown[]; toolAction?: string };
    expect(payload.toolAction).toBe('Finishing task');
    expect(payload.abweichungen).toHaveLength(1);
  });

  it('entfernt einen ```json-Zaun', () => {
    expect(schaeleJson('```json\n{"modell":"x","abweichungen":[]}\n```')).toBe('{"modell":"x","abweichungen":[]}');
  });

  it('lässt sich von geschweiften Klammern IM Text nicht täuschen', () => {
    const kern = schaeleJson('{"modell":"x","abweichungen":[{"quelle":"ein } im Text","klasse":"sonst"}]}');
    expect(kern).not.toBeNull();
    expect(JSON.parse(kern!).abweichungen[0].quelle).toBe('ein } im Text');
  });

  it('meldet kaputtes JSON als Fehlschlag statt es zu reparieren', () => {
    expect(schaeleJson('Hier ist die Antwort: {"modell": "x", "abweichungen": [')).toBeNull();
    expect(schaeleJson('gar kein JSON')).toBeNull();
  });
});
