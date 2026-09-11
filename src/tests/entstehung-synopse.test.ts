// ─── W2·6c-SYNOPSE · Generator-seitige Normalisierung (Profil `entstehung-norm/3`) ──
//
// Geprüft wird `scripts/entstehung/synopse.ts` — insbesondere `flachText`,
// `zerlegeBloecke`, `diffStaende` und `normalisiere` — sowie die EINE geteilte
// Vergleichsform in `src/lib/entstehung/normalisierung.ts`, die Generator UND
// Leser (`synopse-diff.ts`) importieren.
//
// BEFUND BAUER #796 (11.9.2026): der Generator verglich beim «geändert ja/nein»
// bis Profil `/2` den GANZEN Artikel-Innenraum (inkl. `<heading>`/`<subheading>`),
// während `zerlegeBloecke` — und damit alles, was gespeichert und vom Leser
// angezeigt wird — ausschliesslich `<paragraph>`-Inhalt kennt. Ein
// Randvermerk-Update ohne Textänderung im Artikelkörper liess den Generator
// «geändert» buchen und den Leser (mit seiner EIGENEN Vergleichsform)
// «kein Unterschied» zeigen: 70 gespeicherte Alt-Blöcke (36/3484 `belegt`,
// 34/999 `ohne_ereignis`, Messung 11.9.2026 über alle 186 Synopse-Shards).
//
// DIE FÄLLE SIND GEMESSEN, NICHT ERFUNDEN: die XML-Fragmente unten sind gekürzte,
// aber strukturell unveränderte Ausschnitte der amtlichen AKN-Konsolidierungen
// (Fedlex Filestore, abgerufen 11.9.2026) — AVIV Art. 109b (2021-04-01 und
// 2021-07-01), sowie die vier Fälle der Gegenprüfung zu PR #794 (ARG Art. 12,
// EMRK Art. 44, UNO_PAKT_II Art. 24, AHVG Art. 10 — Quellen und Funde:
// `bibliothek/materialien/entstehung-2026-09-06/E5-0-vormessung.md` §6b).
import { describe, it, expect } from 'vitest';
import {
  extrahiereArtikel, flachText, normalisiere, diffStaende, tokenAusEId,
} from '../../scripts/entstehung/synopse';
import { vergleichsform, vergleichsformLeerraumBlind } from '../lib/entstehung/normalisierung';
import { vergleichsform as vergleichsformAusLeser } from '../lib/entstehung/synopse-diff';

/** Umschliesst ein Artikel-Innenraum-Fragment wie ein Mini-AKN-Dokument (§2: rein). */
function dok(...artikelInnenraeume: string[]): string {
  return `<body>${artikelInnenraeume.join('')}</body>`;
}
function artikel(xml: string, eId: string) {
  const gefunden = extrahiereArtikel(xml).get(eId);
  if (!gefunden) throw new Error(`Fixture-Fehler: eId ${eId} nicht gefunden.`);
  return gefunden;
}

describe('flachText — Scope seit Profil /3: nur <paragraph>, nie <heading>/<subheading>', () => {
  // AVIV Art. 109b, 2021-04-01 -> 2021-07-01 (Fedlex Filestore, real, gekürzt um
  // Fussnoten-Text der authorialNote — reinerText entfernt sie ohnehin vollständig).
  const VOR = dok(
    '<article eId="art_109_b">'
    + '<num><b>Art. 109</b><i>b</i></num>'
    + '<heading>Prüfung der EDV-Anwendungen</heading>'
    + '<subheading fedlex:role="reference"> (Art. 83 Abs. 1 Bst. i und o AVIG)</subheading>'
    + '<paragraph eId="art_109_b/para"><content><p>Die Ausgleichsstelle prüft periodisch '
    + 'die EDV-Anwendungen sowie die technischen Vorkehren.</p></content></paragraph>'
    + '</article>',
  );
  const NACH = dok(
    '<article eId="art_109_b">'
    + '<num><b>Art. 109</b><i>b</i></num>'
    + '<heading>Prüfung der EDV-Anwendungen</heading>'
    + '<subheading fedlex:role="reference"> (Art. 83 Abs. 1bis AVIG)</subheading>'
    + '<paragraph eId="art_109_b/para"><content><p>Die Ausgleichsstelle prüft periodisch '
    + 'die EDV-Anwendungen sowie die technischen Vorkehren.</p></content></paragraph>'
    + '</article>',
  );

  it('lässt einen Randvermerk (<subheading>) ausserhalb des Vergleichs — der Artikelkörper entscheidet', () => {
    const a = artikel(VOR, 'art_109_b');
    const n = artikel(NACH, 'art_109_b');
    expect(a.roh).not.toBe(n.roh); // die Fixtures sind tatsächlich verschieden (Subheading)
    expect(normalisiere(flachText(a))).toBe(normalisiere(flachText(n)));
  });

  it('bezieht denselben Randvermerk NICHT in die gespeicherten Blöcke ein — Leser sieht dasselbe wie der Generator', () => {
    const a = artikel(VOR, 'art_109_b');
    const n = artikel(NACH, 'art_109_b');
    expect(a.bloecke).toEqual(n.bloecke); // bloecke sind identisch: kein Alt-Block wäre nötig
  });

  it('Rot-Beweis: VOR dem Fix (ganzer Artikel-Innenraum inkl. Subheading) hätte dasselbe Fixture eine Änderung gemeldet', () => {
    const a = artikel(VOR, 'art_109_b');
    const n = artikel(NACH, 'art_109_b');
    // Reinerdirekter Vergleich des GESAMTEN roh-Strings (das alte Verhalten von
    // flachText vor Profil /3) — zeigt, dass der Subheading-Unterschied real ist
    // und ohne die Scope-Einschränkung erkannt WORDEN WÄRE.
    // (kein re-import des alten Codes nötig: reinerText ist unveraendert exportiert.)
    expect(a.roh.includes('Bst. i und o AVIG')).toBe(true);
    expect(n.roh.includes('Abs. 1bis AVIG')).toBe(true);
    expect(normalisiere(a.roh) === normalisiere(n.roh)).toBe(false);
  });
});

describe('zerlegeBloecke — Fallback ohne <paragraph>: <subheading> fällt wie <num>/<heading> weg', () => {
  it('lässt einen Randvermerk bei einem Einzelsatz-Artikel (kein <paragraph>) aussen vor', () => {
    const xml = dok(
      '<article eId="art_1">'
      + '<num>Art. 1</num><heading>Zweck</heading>'
      + '<subheading> (Art. 2 AVIG)</subheading>'
      + '<content><p>Dieses Gesetz regelt die Arbeitslosenversicherung.</p></content>'
      + '</article>',
    );
    const a = artikel(xml, 'art_1');
    expect(a.bloecke).toEqual([['', '', 'Dieses Gesetz regelt die Arbeitslosenversicherung.']]);
  });
});

describe('vergleichsRoh — Fussnote vor der Satzzeichen-Regel weg (Befund #796, Nachtrag)', () => {
  // BGOE Art. 13, 2023-09-01 -> 2023-11-01 (Fedlex Filestore, real, gekürzt): eine
  // Berichtigungs-Fussnote sitzt in EINER Generation zwischen dem Doppelpunkt und
  // </listIntroduction>, in der anderen nicht — ohne den Fix griff die Regel (a) nur
  // in der fussnotenlosen Generation und liess das Fussnoten-Artefakt wie eine
  // Wortlaut-Änderung aussehen.
  it('lässt eine Fussnote VOR </listIntroduction> die Satzzeichen-Regel nicht blockieren', () => {
    const mitFussnote = dok(
      '<article eId="art_13">'
      + '<num><b>Art. 13</b></num><heading>Schlichtung</heading>'
      + '<paragraph eId="art_13/para_1"><num>1</num><content><blockList>'
      + '<listIntroduction eId="art_13/para_1/listintro"> Einen Schlichtungsantrag stellen '
      + 'kann eine Person:<authorialNote><p> Die Berichtigung vom 30. Sept. 2022.</p></authorialNote>'
      + '</listIntroduction>'
      + '<item eId="art_13/para_1/lbl_a"><num>a. </num><p>deren Zugang eingeschränkt wird.</p></item>'
      + '</blockList></content></paragraph></article>',
    );
    const ohneFussnote = dok(
      '<article eId="art_13">'
      + '<num><b>Art. 13</b></num><heading>Schlichtung</heading>'
      + '<paragraph eId="art_13/para_1"><num>1</num><content><blockList>'
      + '<listIntroduction eId="art_13/para_1/listintro"> Einen Schlichtungsantrag stellen '
      + 'kann eine Person:</listIntroduction>'
      + '<item eId="art_13/para_1/lbl_a"><num>a. </num><p>deren Zugang eingeschränkt wird.</p></item>'
      + '</blockList></content></paragraph></article>',
    );
    const a = artikel(mitFussnote, 'art_13');
    const b = artikel(ohneFussnote, 'art_13');
    expect(normalisiere(flachText(a))).toBe(normalisiere(flachText(b)));
  });

  // KLV Art. 12 Bst. e, 2021-11-04 -> 2022-01-01 (real, gekürzt): eine Tabellenzelle
  // trägt eine `<blockList>`, GEFOLGT von einem Fliesstext-Satz — `zerlegeBloecke`
  // speichert nach einer Liste nur `listIntroduction` + `item`, nie Text danach, in
  // KEINER Generation. Ohne Regel (c) sah `flachText` die Kantonsliste (Bern/Luzern
  // ergänzt), `bloecke` nie — ein Alt-Block wurde "geändert" gebucht, dessen Wortlaut
  // sich nie unterschied.
  it('ignoriert Fliesstext NACH einer Liste — er landet ohnehin nie in bloecke', () => {
    const bau = (kantone: string) => dok(
      '<article eId="art_12_e"><num><b>Art. 12</b><i>e</i></num>'
      + '<paragraph eId="art_12_e/para"><num>a.</num><content><table><tr><td>'
      + '<blockList><item eId="art_12_e/lbl_1"><num>– </num><p>Koloskopie, alle 10 Jahre.</p></item></blockList>'
      + `<p>Findet die Untersuchung im Rahmen der Früherkennungsprogramme in den Kantonen ${kantone} statt, `
      + 'wird auf der Leistung keine Franchise erhoben.</p>'
      + '</td></tr></table></content></paragraph></article>',
    );
    const ohneBernLuzern = bau('Basel-Stadt, Freiburg, Genf');
    const mitBernLuzern = bau('Basel-Stadt, Bern, Freiburg, Genf, Luzern');
    const a = artikel(ohneBernLuzern, 'art_12_e');
    const b = artikel(mitBernLuzern, 'art_12_e');
    expect(a.bloecke).toEqual(b.bloecke); // die Kantonsliste landet in KEINER Generation in bloecke
    expect(normalisiere(flachText(a))).toBe(normalisiere(flachText(b)));
  });
});

describe('Gegenprobe PR #794 — bleibt bestehen (Profil /3 darf keine echte Struktur-Klasse verlernen)', () => {
  it('ARG Art. 12: Satzzeichen tauscht an der Elementgrenze Satz→Listeneinleitung — KEINE Änderung', () => {
    const vor = dok(
      '<article eId="art_12">'
      + '<num><b>Art. 12</b></num>'
      + '<paragraph eId="art_12/para_1"><num>1</num><content>'
      + '<p> Die wöchentliche Höchstarbeitszeit darf ausnahmsweise überschritten werden</p>'
      + '<blockList><item eId="art_12/para_1/lbl_a"><num>a. </num><p>wegen Dringlichkeit.</p></item></blockList>'
      + '</content></paragraph></article>',
    );
    const nach = dok(
      '<article eId="art_12">'
      + '<num><b>Art. 12</b></num>'
      + '<paragraph eId="art_12/para_1"><num>1</num><content>'
      + '<blockList><listIntroduction eId="art_12/para_1/listintro"> Die wöchentliche '
      + 'Höchstarbeitszeit darf ausnahmsweise überschritten werden:</listIntroduction>'
      + '<item eId="art_12/para_1/lbl_a"><num>a. </num><p>wegen Dringlichkeit.</p></item></blockList>'
      + '</content></paragraph></article>',
    );
    const d = diffStaende(extrahiereArtikel(vor), extrahiereArtikel(nach));
    expect(d.geaendert).toEqual([]);
  });

  it('EMRK Art. 44: Komma vor <blockList> wird Doppelpunkt in <listIntroduction> — KEINE Änderung', () => {
    const vor = dok(
      '<article eId="art_44">'
      + '<num><b>Art. 44</b></num><heading>Endgültige Urteile</heading>'
      + '<paragraph eId="art_44/para_2"><num>(2)</num><content>'
      + '<p>Das Urteil einer Kammer wird endgültig,</p>'
      + '<blockList><item eId="art_44/para_2/lbl_a"><num>a) </num><p>wenn die Parteien erklären.</p></item></blockList>'
      + '</content></paragraph></article>',
    );
    const nach = dok(
      '<article eId="art_44">'
      + '<num><b>Art. 44</b></num><heading>Endgültige Urteile</heading>'
      + '<paragraph eId="art_44/para_2"><num>(2)</num><content>'
      + '<blockList><listIntroduction eId="art_44/para_2/listintro">Das Urteil einer Kammer '
      + 'wird endgültig:</listIntroduction>'
      + '<item eId="art_44/para_2/lbl_a"><num>a) </num><p>wenn die Parteien erklären.</p></item></blockList>'
      + '</content></paragraph></article>',
    );
    const d = diffStaende(extrahiereArtikel(vor), extrahiereArtikel(nach));
    expect(d.geaendert).toEqual([]);
  });

  it('UNO_PAKT_II Art. 24: Klammer-Etikett wandert vom Fliesstext in <num> — KEINE Änderung', () => {
    const vor = dok(
      '<article eId="art_24">'
      + '<num><b>Art. 24</b></num>'
      + '<paragraph eId="art_24/para_u1"><content>'
      + '<p>(l)  Jedes Kind hat das Recht auf Schutzmassnahmen.</p>'
      + '</content></paragraph></article>',
    );
    const nach = dok(
      '<article eId="art_24">'
      + '<num><b>Art. 24</b></num>'
      + '<paragraph eId="art_24/para_1"><num>(1)</num><content>'
      + '<p>Jedes Kind hat das Recht auf Schutzmassnahmen.</p>'
      + '</content></paragraph></article>',
    );
    const d = diffStaende(extrahiereArtikel(vor), extrahiereArtikel(nach));
    expect(d.geaendert).toEqual([]);
  });

  it('AHVG Art. 10 Abs. 2bis: Ordnungs-Suffix wandert durch die Elementgrenze — KEINE Änderung', () => {
    const vor = dok(
      '<article eId="art_10"><num><b>Art. 10</b></num>'
      + '<paragraph eId="art_10/para_2_bis"><num>2bis</num><content>'
      + '<p> Der Bundesrat kann den Mindestbeitrag für weitere Nichterwerbstätige vorsehen.</p>'
      + '</content></paragraph></article>',
    );
    const nach = dok(
      '<article eId="art_10"><num><b>Art. 10</b></num>'
      + '<paragraph eId="art_10/para_2b"><num>2b</num><content>'
      + '<p><sup>is</sup> Der Bundesrat kann den Mindestbeitrag für weitere Nichterwerbstätige vorsehen.</p>'
      + '</content></paragraph></article>',
    );
    const d = diffStaende(extrahiereArtikel(vor), extrahiereArtikel(nach));
    expect(d.geaendert).toEqual([]);
  });

  it('AHVG Art. 10 Abs. 1: Mindestbeitrag 413 -> 422 Franken bleibt ECHTE Änderung, auch NEBEN der 2bis-Elementgrenzen-Wanderung im selben Schritt', () => {
    const vor = dok(
      '<article eId="art_10"><num><b>Art. 10</b></num>'
      + '<paragraph eId="art_10/para_1"><num>1</num><content>'
      + '<p>Nichterwerbstätige bezahlen einen Beitrag nach ihren sozialen Verhältnissen. '
      + 'Der Mindestbeitrag beträgt 413 Franken, der Höchstbeitrag entspricht dem 50-fachen Mindestbeitrag.</p>'
      + '</content></paragraph>'
      + '<paragraph eId="art_10/para_2_bis"><num>2bis</num><content>'
      + '<p> Der Bundesrat kann den Mindestbeitrag für weitere Nichterwerbstätige vorsehen.</p>'
      + '</content></paragraph></article>',
    );
    const nach = dok(
      '<article eId="art_10"><num><b>Art. 10</b></num>'
      + '<paragraph eId="art_10/para_1"><num>1</num><content>'
      + '<p>Nichterwerbstätige bezahlen einen Beitrag nach ihren sozialen Verhältnissen. '
      + 'Der Mindestbeitrag beträgt 422 Franken, der Höchstbeitrag entspricht dem 50-fachen Mindestbeitrag.</p>'
      + '</content></paragraph>'
      + '<paragraph eId="art_10/para_2b"><num>2b</num><content>'
      + '<p><sup>is</sup> Der Bundesrat kann den Mindestbeitrag für weitere Nichterwerbstätige vorsehen.</p>'
      + '</content></paragraph></article>',
    );
    const d = diffStaende(extrahiereArtikel(vor), extrahiereArtikel(nach));
    expect(d.geaendert).toEqual(['art_10']);
    expect(tokenAusEId('art_10')).toBe('10');
  });
});

describe('normalisierung.ts — die EINE Vergleichsform für Generator UND Leser', () => {
  it('Generator (normalisiere/flachText-Pfad) und Leser (synopse-diff.ts) importieren denselben Zeichen-Kern', () => {
    // vergleichsform ist ab Profil /3 an genau einem Ort definiert (§5) — Leser-Re-Export
    // UND die generator-seitige Verschärfung bauen auf DEMSELBEN Objekt auf.
    expect(vergleichsformAusLeser).toBe(vergleichsform);
  });

  it('setzt den WORTVERBINDER U+2060 gleich einem Leerzeichen (Cf, kein \\s-Treffer in JS)', () => {
    expect(vergleichsform('Art.⁠83')).toBe(vergleichsform('Art. 83'));
  });

  it('setzt die NBSP-Familie (U+00A0/U+202F/U+2007/U+2009) einem Leerzeichen gleich', () => {
    expect(vergleichsform('Artikel 11')).toBe(vergleichsform('Artikel 11'));
    expect(vergleichsform('Art. 83')).toBe(vergleichsform('Art. 83'));
  });

  it('faltet Bindestrich-Varianten auf «-», lässt den Gedankenstrich U+2014 aber stehen', () => {
    expect(vergleichsform('2021–02022')).toBe(vergleichsform('2021-02022'));
    expect(vergleichsform('A — B')).not.toBe(vergleichsform('A - B'));
  });

  it('faltet «...» auf «…»', () => {
    expect(vergleichsform('usw...')).toBe(vergleichsform('usw…'));
  });

  it('vergleichsformLeerraumBlind trägt zusätzlich die Elementgrenzen-Klasse (AHVG 2bis), die die blosse Kollaps-Regel nicht trägt', () => {
    const a = vergleichsform('2bis Die Ausgleichsstelle');
    const b = vergleichsform('2b is Die Ausgleichsstelle');
    expect(a).not.toBe(b); // die Kollaps-Regel allein reicht NICHT
    expect(vergleichsformLeerraumBlind('2bis Die Ausgleichsstelle'))
      .toBe(vergleichsformLeerraumBlind('2b is Die Ausgleichsstelle'));
  });
});
