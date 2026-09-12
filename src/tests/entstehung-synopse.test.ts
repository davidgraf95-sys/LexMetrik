// ─── W2·6c-SYNOPSE · Generator-seitige Normalisierung (Profil `entstehung-norm/4`) ──
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
  extrahiereArtikel, flachText, normalisiere, diffStaende, tokenAusEId, titelGeaendert,
  standProfil, findeQuellLuecken, QUELLLUECKE_STAENDE_MAX,
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

// §6.3-BEGRÜNDUNG: der Scope dieses describe hat sich mit Profil `/4` fachlich
// geändert (Gegenprüfung PR #798, Auflage A2) — die SACHÜBERSCHRIFT (`<heading>`)
// gehört wieder in den Vergleich, weil ihre Änderung eine echte, dem Leser
// geschuldete Änderung ist. UNVERÄNDERT bleibt der Befund dieses Fixtures: der
// `<subheading>`-RANDVERMERK in Klammerform ist ein Querverweis auf die
// Delegationsnorm und bleibt draussen. Die drei Erwartungen unten gelten darum
// unverändert weiter.
describe('flachText — Scope seit Profil /4: <paragraph> + Sachüberschrift, nie der Klammer-Randvermerk', () => {
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

  // §6.3-BEGRÜNDUNG FÜR DIE UMKEHR DIESES TESTS: bis Profil `/3` stand hier die
  // Erwartung, `flachText` möge den Fliesstext NACH einer Liste ignorieren, weil
  // `zerlegeBloecke` ihn ohnehin nie speichere. Die Gegenprüfung zu PR #798 (Auflage A1)
  // hat belegt, dass damit VIER echte Wortlautänderungen von KLV Art. 12 Bst. e gelöscht
  // wurden (Kantonsliste der Früherkennungsprogramme: 2021-11-04 → 2022-01-01 «+ Bern,
  // Luzern», 2022-10-01 → 2023-01-01 «+ Basel-Landschaft», 2024-07-01 → 2025-01-01
  // «+ Solothurn», 2026-05-11 → 2026-07-01 «+ Glarus»; amtliche Konsolidierungen, Fedlex
  // Filestore ELI cc/1995/4964_4964_4964, abgerufen 12.9.2026). Die Wurzel sass in der
  // STORAGE-Lücke, nicht im Vergleich — sie ist jetzt dort geschlossen, und die Erwartung
  // ist fachlich umgedreht.
  it('speichert Fliesstext NACH einer Liste als Block und sieht die Änderung darin (Auflage A1)', () => {
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
    const nachlauf = (x: typeof a) => x.bloecke.filter((bl) => bl[2].startsWith('Findet die Untersuchung'));
    expect(nachlauf(a)).toHaveLength(1); // der Satz IST jetzt ein gespeicherter Block …
    expect(nachlauf(a)[0][0]).toBe('a.'); // … und trägt das Absatz-Etikett des Absatzes
    expect(nachlauf(a)[0][2]).not.toBe(nachlauf(b)[0][2]); // … und unterscheidet sich wirklich
    expect(normalisiere(flachText(a))).not.toBe(normalisiere(flachText(b)));
    const d = diffStaende(extrahiereArtikel(ohneBernLuzern), extrahiereArtikel(mitBernLuzern));
    expect(d.geaendert).toEqual(['art_12_e']);
  });

  it('erfasst auch den Fliesstext VOR und ZWISCHEN zwei Aufzählungen (nichts geht mehr verloren, §8)', () => {
    const xml = dok(
      '<article eId="art_9"><num>Art. 9</num>'
      + '<paragraph eId="art_9/para_2"><num>2</num><content>'
      + '<p>Vorlaufsatz vor der ersten Liste.</p>'
      + '<blockList><item><num>a. </num><p>erstens;</p></item></blockList>'
      + '<p>Zwischentext zwischen den Listen.</p>'
      + '<blockList><item><num>b. </num><p>zweitens.</p></item></blockList>'
      + '<p>Nachlaufsatz nach der letzten Liste.</p>'
      + '</content></paragraph></article>',
    );
    expect(artikel(xml, 'art_9').bloecke).toEqual([
      ['2', '', 'Vorlaufsatz vor der ersten Liste.'],
      ['2', 'a.', 'erstens;'],
      ['2', '', 'Zwischentext zwischen den Listen.'],
      ['2', 'b.', 'zweitens.'],
      ['2', '', 'Nachlaufsatz nach der letzten Liste.'],
    ]);
  });

  it('schneidet eine VERSCHACHTELTE Aufzählung nicht auf (4476 Absätze im Korpus, 12.9.2026)', () => {
    // Ein nicht-gieriges `<blockList>…</blockList>` hätte am ERSTEN inneren Schluss-Tag
    // geschnitten und den Rest der äusseren Liste zu «Fliesstext nach der Liste» erklärt —
    // die Unterpunkte wären doppelt erschienen (einmal als Item, einmal im Fliesstext).
    const xml = dok(
      '<article eId="art_3"><num>Art. 3</num>'
      + '<paragraph eId="art_3/para_1"><num>1</num><content>'
      + '<blockList><listIntroduction>Es gelten:</listIntroduction>'
      + '<item><num>a. </num><p>erstens, nämlich:</p>'
      + '<blockList><item><num>1. </num><p>Unterpunkt eins;</p></item></blockList></item>'
      + '<item><num>b. </num><p>zweitens.</p></item>'
      + '</blockList></content></paragraph></article>',
    );
    const bloecke = artikel(xml, 'art_3').bloecke;
    expect(bloecke[0]).toEqual(['1', '', 'Es gelten:']);
    expect(bloecke.filter((b) => b[2].includes('Unterpunkt eins'))).toHaveLength(1);
    expect(bloecke.some((b) => b[1] === 'b.' && b[2] === 'zweitens.')).toBe(true);
  });
});

describe('vergleichsFolge — ein aufgeteilter Block ist keine Änderung (SSV Art. 24, Profil /4)', () => {
  // SSV Art. 24 Abs. 1 Bst. a, 2024-04-08 → 2025-01-01 (amtliche Konsolidierungen, Fedlex
  // Filestore ELI cc/1979/1961_1961_1961, abgerufen 12.9.2026): die Konversion trennt den
  // Buchstaben an der Interpunktion in ZWEI Blöcke. Der Wortlaut ist Zeichen für Zeichen
  // derselbe; nur die Blockgrenze wandert. Würde das Absatz-Etikett je Block wiederholt,
  // stünde im Vergleich ein zusätzliches «1» — eine Änderung, die der Leser nicht zeigen
  // kann (der Leer-Diff-Wächter hat genau das gemeldet, bevor `vergleichsFolge` das
  // Etikett nur noch beim Wechsel setzt).
  const ungeteilt = dok(
    '<article eId="art_24"><num>Art. 24</num><heading>Vorgeschriebene Fahrtrichtung</heading>'
    + '<paragraph eId="art_24/para_1"><num>1</num><content><blockList>'
    + '<listIntroduction>Es werden folgende Signale verwendet:</listIntroduction>'
    + '<item><num>a. </num><p>«Fahrtrichtung rechts» (2.32): Der Führer muss abbiegen;</p></item>'
    + '</blockList></content></paragraph></article>',
  );
  const geteilt = dok(
    '<article eId="art_24"><num>Art. 24</num><heading>Vorgeschriebene Fahrtrichtung</heading>'
    + '<paragraph eId="art_24/para_1"><num>1</num><content><blockList>'
    + '<listIntroduction>Es werden folgende Signale verwendet:</listIntroduction>'
    + '<item><num>a. </num><p>«Fahrtrichtung rechts» (2.32):</p></item>'
    + '</blockList><p>Der Führer muss abbiegen;</p></content></paragraph></article>',
  );
  it('bucht die Aufteilung nicht als Wortlaut-Änderung', () => {
    expect(normalisiere(flachText(artikel(ungeteilt, 'art_24'))))
      .toBe(normalisiere(flachText(artikel(geteilt, 'art_24'))));
    expect(diffStaende(extrahiereArtikel(ungeteilt), extrahiereArtikel(geteilt)).geaendert).toEqual([]);
  });

  it('hält dabei die Etiketten im Vergleich — die Grenze <num>/<content> wandert (AVIV Art. 120a Bst. b)', () => {
    // Gegenprobe zum Test oben: WEIL das Etikett im Vergleich steht, ist «b.» im `<num>`
    // dasselbe wie «b.» am Textanfang (E5.0, gemessen). Ohne Etikett wären beide
    // Fassungen verschieden — die Sparsamkeit beim ABSATZ-Etikett darf nicht zur
    // Etikettlosigkeit werden.
    const imNum = dok(
      '<article eId="art_120_a"><num>Art. 120a</num><paragraph eId="art_120_a/para"><content><blockList>'
      + '<item><num>b. </num><p>AHV-Nummer der versicherten Person;</p></item>'
      + '</blockList></content></paragraph></article>',
    );
    const imText = dok(
      '<article eId="art_120_a"><num>Art. 120a</num><paragraph eId="art_120_a/para"><content><blockList>'
      + '<item><num> </num><p>b. AHV-Nummer der versicherten Person;</p></item>'
      + '</blockList></content></paragraph></article>',
    );
    expect(normalisiere(flachText(artikel(imNum, 'art_120_a'))))
      .toBe(normalisiere(flachText(artikel(imText, 'art_120_a'))));
  });
});

describe('Phantom-Änderungen: wandernde Elementgrenzen sind keine Gesetzesänderung (Auflage A5)', () => {
  // Alle vier Fixtures sind gekürzte, strukturell unveränderte Ausschnitte der amtlichen
  // AKN-Konsolidierungen (Fedlex Filestore, abgerufen 12.9.2026). Profil `/4` hat sie vor
  // dieser Auflage als Änderung gebucht, obwohl der Wortlaut Zeichen für Zeichen derselbe
  // ist — der Leser sah eine Gesetzesänderung, die es nie gab (§1/§8).

  it('Ordnungs-Suffix wandert aus dem Text in das <num> (GEBV_SchKG Art. 9 Abs. 1bis)', () => {
    // 2022-01-01: `<num>1</num><p><sup>bis</sup> Erfordert …` — das Etikett «1» ist
    // dasselbe wie beim Absatz davor, das «bis» klebt am Textanfang.
    // 2026-01-01: `<num>1<sup>bis</sup></num><p> Erfordert …`.
    const bau = (absatzBis: string, textBis: string) => dok(
      '<article eId="art_9"><num>Art. 9</num><heading>Schriftstücke</heading>'
      + '<paragraph eId="art_9/para_1"><num>1</num><content><blockList>'
      + '<listIntroduction>Die Gebühr beträgt:</listIntroduction>'
      + '<item><num>a. </num><p>8 Franken je Seite;</p></item>'
      + '</blockList></content></paragraph>'
      + `<paragraph eId="art_9/para_1_bis"><num>1${absatzBis}</num><content><p>${textBis} Erfordert die `
      + 'Erstellung mehr als eine Stunde, so erhöht sich die Gebühr.</p></content></paragraph></article>',
    );
    const alt = bau('', '<sup>bis</sup>');
    const neu = bau('<sup>bis</sup>', '');
    expect(normalisiere(flachText(artikel(alt, 'art_9')))).toBe(normalisiere(flachText(artikel(neu, 'art_9'))));
    expect(diffStaende(extrahiereArtikel(alt), extrahiereArtikel(neu)).geaendert).toEqual([]);
  });

  it('dasselbe in der Listeneinleitung (KLV Art. 7 Abs. 2bis) und im Fliesstext (VRV Art. 67 Abs. 1quater)', () => {
    // Der VORANGEHENDE Absatz trägt dasselbe Etikett «2» bzw. «1» — genau daran ist die
    // Regel «Etikett nur beim Wechsel» gescheitert (Auflage A5).
    const klv = (absatzBis: string, introBis: string) => dok(
      '<article eId="art_7"><num>Art. 7</num>'
      + '<paragraph eId="art_7/para_2"><num>2</num><content><p>Die Bedarfsabklärung erfolgt.</p></content></paragraph>'
      + `<paragraph eId="art_7/para_2_bis"><num>2${absatzBis}</num><content>`
      + `<blockList><listIntroduction>${introBis} Die folgenden Voraussetzungen müssen erfüllt sein:</listIntroduction>`
      + '<item><num>a. </num><p>Die Leistungen sind nötig.</p></item></blockList></content></paragraph></article>',
    );
    expect(diffStaende(
      extrahiereArtikel(klv('', '<sup>bis</sup>')),
      extrahiereArtikel(klv('<sup>bis</sup>', '')),
    ).geaendert).toEqual([]);
    const vrv = (absatzQ: string, textQ: string) => dok(
      '<article eId="art_67"><num>Art. 67</num>'
      + '<paragraph eId="art_67/para_1"><num>1</num><content><p>Das Betriebsgewicht darf höchstens betragen: 40,00 t.</p></content></paragraph>'
      + `<paragraph eId="art_67/para_1_quater"><num>1${absatzQ}</num><content>`
      + `<p>${textQ} Das Betriebsgewicht darf um das Mehrgewicht höher sein.</p></content></paragraph></article>`,
    );
    expect(diffStaende(
      extrahiereArtikel(vrv('', '<sup>quater</sup>')),
      extrahiereArtikel(vrv('<sup>quater</sup>', '')),
    ).geaendert).toEqual([]);
  });

  it('Absatz-Etikett wandert aus dem Text in ein eigenes <num>, ein Absatz wird zu zweien (MWSTG Art. 97)', () => {
    // 2023-09-01: der GANZE Artikel ist EIN `<paragraph eId="art_97/para">`, die
    // Absatz-Ziffern stehen im Text. 2024-01-01: zwei Absätze mit eigenem `<num>`.
    const alt = dok(
      '<article eId="art_97"><num>Art. 97</num><heading>Strafzumessung</heading>'
      + '<paragraph eId="art_97/para"><content><p>1 Die Busse wird bemessen.</p>'
      + '<blockList><listIntroduction eId="art_97/para/listintro">2 Als erschwerende Umstände gelten:</listIntroduction>'
      + '<item eId="art_97/para/lbl_a"><num>a. </num><p>das Anwerben einer Person;</p></item>'
      + '</blockList></content></paragraph></article>',
    );
    const neu = dok(
      '<article eId="art_97"><num>Art. 97</num><heading>Strafzumessung</heading>'
      + '<paragraph eId="art_97/para_1"><num>1</num><content><p> Die Busse wird bemessen.</p></content></paragraph>'
      + '<paragraph eId="art_97/para_2"><num>2</num><content><blockList>'
      + '<listIntroduction eId="art_97/para_2/listintro"> Als erschwerende Umstände gelten:</listIntroduction>'
      + '<item eId="art_97/para_2/lbl_a"><num>a. </num><p>das Anwerben einer Person;</p></item>'
      + '</blockList></content></paragraph></article>',
    );
    expect(diffStaende(extrahiereArtikel(alt), extrahiereArtikel(neu)).geaendert).toEqual([]);
    // UND: der Listenpunkt behält sein amtliches Etikett «a.» — die alte, ungezielte
    // `<num>`-Entfernung hatte es dem Absatz zugeschlagen und aus dem Block gelöscht.
    const bloecke = artikel(alt, 'art_97').bloecke;
    expect(bloecke.some((b) => b[1] === 'a.' && b[2] === 'das Anwerben einer Person;')).toBe(true);
    expect(bloecke.every((b) => b[0] === '')).toBe(true); // dieser Absatz führt kein eigenes <num>
  });

  it('Aufzählung einmal als <blockList>, einmal als <p>-Folge mit Buchstaben im Text (BVV 2 Art. 55)', () => {
    // 2024-01-01 → 2025-01-01 (real, gekürzt): die Konversion macht aus einer Folge
    // gewöhnlicher `<p>` eine `<blockList>`. Die Satzzeichen-Regel (a) nahm den
    // Doppelpunkt nur auf der Listen-Seite weg — der Vergleich sah einen Unterschied, den
    // die amtliche Fassung nicht kennt. Das Satzzeichen ZWISCHEN den Punkten («…
    // behandelt;») muss dabei auf beiden Seiten stehen bleiben.
    const alsAbsaetze = dok(
      '<article eId="art_55"><num>Art. 55</num><heading>Kategoriebegrenzungen</heading>'
      + '<paragraph eId="art_55/para"><content>'
      + '<p>Für die einzelnen Anlagekategorien gelten folgende Begrenzungen:</p>'
      + '<p>a. 50 Prozent: für schweizerische Grundpfandtitel;</p>'
      + '<p>b. 50 Prozent: für Anlagen in Aktien;</p>'
      + '</content></paragraph></article>',
    );
    const alsListe = dok(
      '<article eId="art_55"><num>Art. 55</num><heading>Kategoriebegrenzungen</heading>'
      + '<paragraph eId="art_55/para"><content><blockList>'
      + '<listIntroduction eId="art_55/para/listintro">Für die einzelnen Anlagekategorien gelten folgende Begrenzungen:</listIntroduction>'
      + '<item eId="art_55/para/lbl_a"><num>a. </num><p>50 Prozent: für schweizerische Grundpfandtitel;</p></item>'
      + '<item eId="art_55/para/lbl_b"><num>b. </num><p>50 Prozent: für Anlagen in Aktien;</p></item>'
      + '</blockList></content></paragraph></article>',
    );
    expect(diffStaende(extrahiereArtikel(alsAbsaetze), extrahiereArtikel(alsListe)).geaendert).toEqual([]);
  });

  it('lässt eine ECHTE Absatz-Umbenennung weiterhin durch (Abs. 2 → Abs. 1, gleicher Wortlaut)', () => {
    const mit = (nummer: string) => dok(
      `<article eId="art_5"><num>Art. 5</num><paragraph eId="art_5/para"><num>${nummer}</num><content>`
      + '<p>Unveränderter Wortlaut.</p></content></paragraph></article>',
    );
    expect(diffStaende(extrahiereArtikel(mit('2')), extrahiereArtikel(mit('1'))).geaendert).toEqual(['art_5']);
  });
});

describe('Sachüberschrift: eine Randtitel-Änderung ist eine Änderung (Auflage A2, Profil /4)', () => {
  // BVG Art. 33b, 2023-01-01 → 2024-01-01 (amtliche Konsolidierungen, Fedlex Filestore
  // ELI cc/1983/797_797_797, abgerufen 12.9.2026, real und ungekürzt): der Randtitel
  // «Erwerbstätigkeit nach dem ordentlichen Rentenalter» wird mit der AHV-Reform zu
  // «Erwerbstätigkeit nach dem Referenzalter»; der Absatzwortlaut bleibt Zeichen für
  // Zeichen derselbe. Mit Profil `/3` verschwand dieser Schritt vollständig — der Leser
  // bekam «kein Unterschied erkennbar» (§8: falsche Auskunft über eine echte Änderung).
  // Korpusweit 35 solche Schritte (Messung 12.9.2026).
  const bvg = (titel: string) => dok(
    '<article eId="art_33_b"><num><b>Art. 33</b><i>b</i></num>'
    + `<heading>${titel}</heading>`
    + '<paragraph eId="art_33_b/para"><content><p>Die Vorsorgeeinrichtung kann in ihrem '
    + 'Reglement vorsehen, dass auf Verlangen der versicherten Person deren Vorsorge bis zum '
    + 'Ende der Erwerbstätigkeit, höchstens jedoch bis zur Vollendung des 70. Altersjahres, '
    + 'weitergeführt wird.</p></content></paragraph></article>',
  );
  const VOR = bvg('Erwerbstätigkeit nach dem ordentlichen Rentenalter');
  const NACH = bvg('Erwerbstätigkeit nach dem Referenzalter');

  it('bucht den Schritt, obwohl der Absatzwortlaut byte-gleich bleibt', () => {
    const a = artikel(VOR, 'art_33_b');
    const n = artikel(NACH, 'art_33_b');
    expect(a.bloecke).toEqual(n.bloecke);
    expect(diffStaende(extrahiereArtikel(VOR), extrahiereArtikel(NACH)).geaendert).toEqual(['art_33_b']);
    expect(titelGeaendert(a, n)).toBe(true);
    expect(n.ueberschrift).toBe('Erwerbstätigkeit nach dem Referenzalter');
  });

  it('hält den Klammer-Randvermerk weiterhin draussen (AVIV Art. 109b, 8 Fälle im Korpus)', () => {
    const mit = (sub: string) => dok(
      '<article eId="art_109_b"><num><b>Art. 109</b><i>b</i></num>'
      + '<heading>Prüfung der EDV-Anwendungen</heading>'
      + `<subheading fedlex:role="reference"> ${sub}</subheading>`
      + '<paragraph eId="art_109_b/para"><content><p>Die Ausgleichsstelle prüft periodisch '
      + 'die EDV-Anwendungen.</p></content></paragraph></article>',
    );
    const a = artikel(mit('(Art. 83 Abs. 1 Bst. i und o AVIG)'), 'art_109_b');
    const n = artikel(mit('(Art. 83 Abs. 1bis AVIG)'), 'art_109_b');
    expect(titelGeaendert(a, n)).toBe(false);
    expect(diffStaende(
      extrahiereArtikel(mit('(Art. 83 Abs. 1 Bst. i und o AVIG)')),
      extrahiereArtikel(mit('(Art. 83 Abs. 1bis AVIG)')),
    ).geaendert).toEqual([]);
  });

  it('nimmt einen <subheading>, der KEIN Klammer-Querverweis ist, in den Titel auf (§8: enge Regel)', () => {
    const mit = (sub: string) => dok(
      `<article eId="art_2"><num>Art. 2</num><heading>Zweck</heading><subheading>${sub}</subheading>`
      + '<paragraph eId="art_2/para"><content><p>Unveränderter Satz.</p></content></paragraph></article>',
    );
    const a = artikel(mit('Erster Abschnitt: Allgemeines'), 'art_2');
    const n = artikel(mit('Zweiter Abschnitt: Besonderes'), 'art_2');
    expect(a.ueberschrift).toBe('Zweck Erster Abschnitt: Allgemeines');
    expect(titelGeaendert(a, n)).toBe(true);
  });

  it('bucht keine Änderung, wenn nur das Ordnungs-Suffix über die Grenze <num>/<heading> wandert (RPV Art. 32bis)', () => {
    // RPV Art. 32bis, 2026-05-11 → 2026-05-20 (real): einmal steht das «bis» im
    // `<heading>`, einmal im `<num>`. Etikett und Titel zusammen sind identisch — es
    // gibt nichts zu zeigen, und ein Alt-Block ohne sichtbaren Unterschied wäre genau
    // der Fehler, den der Leer-Diff-Wächter verbietet (§5).
    const VOR_R = dok(
      '<article eId="art_32_bis"><num>Art. 32</num>'
      + '<heading><sup>bis</sup> Bündelung von Infrastrukturanlagen</heading>'
      + '<paragraph eId="art_32_bis/para"><content><p>Unveränderter Satz.</p></content></paragraph></article>',
    );
    const NACH_R = dok(
      '<article eId="art_32_bis"><num>Art. 32<sup>bis</sup></num>'
      + '<heading>Bündelung von Infrastrukturanlagen</heading>'
      + '<paragraph eId="art_32_bis/para"><content><p>Unveränderter Satz.</p></content></paragraph></article>',
    );
    expect(titelGeaendert(artikel(VOR_R, 'art_32_bis'), artikel(NACH_R, 'art_32_bis'))).toBe(false);
    expect(diffStaende(extrahiereArtikel(VOR_R), extrahiereArtikel(NACH_R)).geaendert).toEqual([]);
  });
});

describe('vergleichsRoh — Inline-Auszeichnung vor der Satzzeichen-Regel weg (Auftrag Koordinator, Nachtrag)', () => {
  // ZSTV Art. 17, 2025-01-01 -> 2025-06-01 (Fedlex Filestore, real, gekürzt): ein
  // <span> um den ganzen listIntroduction-Text sitzt in EINER Generation zwischen dem
  // Doppelpunkt und </listIntroduction> — derselbe Mechanismus wie bei <authorialNote>
  // (Klasse a0), nur mit einer INLINE-Auszeichnung statt eines Fussnoten-Elements.
  it('lässt ein <span> um den Listeneinleitungs-Satz die Satzzeichen-Regel nicht blockieren', () => {
    const mitSpan = dok(
      '<article eId="art_17"><num><b>Art. 17</b></num>'
      + '<paragraph eId="art_17/para_1"><num>1</num><content><blockList>'
      + '<listIntroduction eId="art_17/para_1/listintro"> <span>Die Aufsichtsbehörde '
      + 'bewilligen:</span></listIntroduction>'
      + '<item eId="art_17/para_1/lbl_a"><num>a. </num><p>Voraussetzung a.</p></item>'
      + '</blockList></content></paragraph></article>',
    );
    const ohneSpan = dok(
      '<article eId="art_17"><num><b>Art. 17</b></num>'
      + '<paragraph eId="art_17/para_1"><num>1</num><content><blockList>'
      + '<listIntroduction eId="art_17/para_1/listintro"> Die Aufsichtsbehörde '
      + 'bewilligen:</listIntroduction>'
      + '<item eId="art_17/para_1/lbl_a"><num>a. </num><p>Voraussetzung a.</p></item>'
      + '</blockList></content></paragraph></article>',
    );
    const a = artikel(mitSpan, 'art_17');
    const b = artikel(ohneSpan, 'art_17');
    expect(a.bloecke).toEqual(b.bloecke); // <span> ist ohnehin nie Teil des gespeicherten Wortlauts
    expect(normalisiere(flachText(a))).toBe(normalisiere(flachText(b)));
  });
});

describe('vergleichsRoh Regel (c) — zwei sibling <blockList> bleiben BEIDE erhalten (Rot-Beweis OR Art. 652d)', () => {
  // OR Art. 652d, 2023-09-01 -> 2024-01-01 (Fedlex Filestore, real, gekürzt): ein Absatz
  // trägt ZWEI <blockList>-Geschwister (AKN teilt eine durchlaufende Aufzählung manchmal
  // so auf). Die ERSTE Fassung von Regel (c) («alles bis zum Absatzende ist Text nach
  // einer Liste») verschluckte die ZWEITE Liste mitsamt ihrem <item>-Inhalt — ein echter
  // Ziffer-2-Punkt («… Zwischenabschluss, sofern der Bilanzstichtag …») verschwand aus
  // dem Vergleich, obwohl er in bloecke stand. Dieser Test haelt das Rot fest, das die
  // erste Fassung erzeugt hätte.
  it('ignoriert eine ZWEITE <blockList> nicht als "Text nach einer Liste"', () => {
    const xml = dok(
      '<article eId="art_652_d"><num><b>Art. 652</b><i>d</i></num>'
      + '<paragraph eId="art_652_d/para_2"><num>2</num><content>'
      + '<blockList eId="art_652_d/para_2/list_u1">'
      + '<listIntroduction eId="art_652_d/para_2/list_u1/listintro"> Die Deckung wird nachgewiesen:</listIntroduction>'
      + '<item eId="art_652_d/para_2/list_u1/lbl_1"><num>1. </num><p>mit der Jahresrechnung.</p></item>'
      + '</blockList>'
      + '<blockList eId="art_652_d/para_2/list_u2">'
      + '<item eId="art_652_d/para_2/list_u2/lbl_2"><num>2. </num><p>mit einem Zwischenabschluss, '
      + 'sofern der Bilanzstichtag mehr als sechs Monate zurückliegt.</p></item>'
      + '</blockList></content></paragraph></article>',
    );
    const a = artikel(xml, 'art_652_d');
    expect(flachText(a)).toContain('Zwischenabschluss');
    expect(a.bloecke.some((b) => b[2].includes('Zwischenabschluss'))).toBe(true);
  });
});

describe('diffStaende — Alt hat Text, Neu wird leer ⇒ entfallen, nicht geändert (Rot-Beweis AVIV Art. 57b)', () => {
  // AVIV Art. 57b, 2021-04-01 -> 2021-07-01 (Fedlex Filestore, real, gekürzt): die
  // COVID-Übergangsbestimmung hatte am 2021-04-01 Wortlaut, wurde am 2021-07-01 zur
  // TEXTLOSEN Hülse (die eId bleibt im Baum, `zerlegeBloecke` findet keinen Inhalt mehr).
  // Vorher wurde das als 'geändert' gebucht statt als 'entfallen' — der Leser suchte via
  // neuNach() über den leeren Punkt hinweg weiter und fand Jahre später (2025-11-01)
  // zufällig denselben Wortlaut wieder ("sechs Abrechnungsperioden") — ein Leer-Diff,
  // dessen Ursache eine falsche STORAGE-Klassifikation war.
  it('bucht eine textlos gewordene Bestimmung als entfallen, nicht als geändert', () => {
    const vor = dok(
      '<article eId="art_57_b"><num><b>Art. 57</b><i>b</i></num>'
      + '<heading>Höchstdauer der Kurzarbeitsentschädigung</heading>'
      + '<paragraph eId="art_57_b/para"><content>'
      + '<p>Die Höchstdauer der Kurzarbeitsentschädigung wird um sechs Abrechnungsperioden verlängert.</p>'
      + '</content></paragraph></article>',
    );
    const nach = dok(
      '<article eId="art_57_b"><num><b>Art. 57</b><i>b</i></num>'
      + '<heading>Höchstdauer der Kurzarbeitsentschädigung</heading>'
      + '</article>',
    );
    const d = diffStaende(extrahiereArtikel(vor), extrahiereArtikel(nach));
    expect(d.geaendert).toEqual([]);
    expect(d.nurAlt).toEqual(['art_57_b']);
    expect(tokenAusEId('art_57_b')).toBe('57_b');
  });

  it('bleibt symmetrisch: Alt leer, Neu hat Text ⇒ weiterhin nurNeu (erstBefuellt), unverändert', () => {
    const vor = dok('<article eId="art_222_q"><num>Art. 222q</num></article>');
    const nach = dok(
      '<article eId="art_222_q"><num>Art. 222q</num>'
      + '<paragraph eId="art_222_q/para"><content><p>Neu eingefügter Wortlaut.</p></content></paragraph>'
      + '</article>',
    );
    const d = diffStaende(extrahiereArtikel(vor), extrahiereArtikel(nach));
    expect(d.geaendert).toEqual([]);
    expect(d.nurAlt).toEqual([]);
    expect(d.nurNeu).toEqual(['art_222_q']);
  });
});

describe('findeQuellLuecken — eine Lücke der Quelle ist keine Aufhebung (W2·6c-QUELLLUECKE)', () => {
  // Der Fall ist gemessen, nicht erfunden: CHEMRRV (`cc/2005/478`) führt in den Ständen
  // vom 1.5.2022 und 1.10.2022 nur noch `art_1`…`art_3` als `<article>`; die Artikel
  // 4–24 stehen in derselben Datei als `<mod eId="annex_1_a/mod_uN">` mit
  // `<quotedStructure>` — ab dem 6.10.2022 wieder normal und Wort für Wort gleich
  // (nachgerechnet 12.9.2026 gegen die drei Filestore-XML, 700 027 / 708 599 / 711 735 B).
  const ART = (eId: string, num: string, text: string): string =>
    `<article eId="${eId}"><num>${num}</num>`
    + `<paragraph eId="${eId}/para"><content><p>${text}</p></content></paragraph></article>`;
  // Der Änderungsanhang trägt das Etikett im `<ref …role="modification-reference">`,
  // die Blöcke darunter aber `annex_1_a/mod_uN/...` — NIE `art_9`. Genau deshalb wird
  // der Wortlaut von dort nicht übernommen (kein eId-Match, §5).
  const MOD = (label: string, text: string): string =>
    `<mod eId="annex_1_a/mod_u1"><ref href="" fedlex:role="modification-reference">${label}</ref>`
    + `<quotedStructure><paragraph eId="annex_1_a/mod_u1/para"><content><p>${text}</p></content>`
    + '</paragraph></quotedStructure></mod>';
  const profil = (xml: string) => standProfil(extrahiereArtikel(xml), xml);

  const VOLL = dok(ART('art_3', 'Art. 3', 'Dritter.'), ART('art_9', 'Art. 9', 'Örtlicher Geltungsbereich: Neuntens.'));
  const LUECKE = dok(ART('art_3', 'Art. 3', 'Dritter.')) + MOD('<b>Art. 9</b> Örtlicher Geltungsbereich', 'Örtlicher Geltungsbereich: Neuntens.');

  it('bucht die Lücke, wenn die eId unverändert zurückkehrt — mit Beleg im Änderungsanhang', () => {
    const { luecken, ohneBeleg } = findeQuellLuecken([profil(VOLL), profil(LUECKE), profil(LUECKE), profil(VOLL)]);
    expect(luecken).toEqual([{ eId: 'art_9', vonIdx: 1, zurueckIdx: 3, imAnhang: true }]);
    expect(ohneBeleg).toEqual([]);
  });

  it('Rot-Beweis: kehrt ein GEÄNDERTER Wortlaut zurück, bleibt es bei «entfallen»', () => {
    // Sonst versteckte die Buchung eine echte Aufhebung mit Neuerlass (§1) — die
    // gefährlichere Falschaussage von beiden.
    const ANDERS = dok(ART('art_3', 'Art. 3', 'Dritter.'), ART('art_9', 'Art. 9', 'Örtlicher Geltungsbereich: Zehntens.'));
    expect(findeQuellLuecken([profil(VOLL), profil(LUECKE), profil(ANDERS)]).luecken).toEqual([]);
  });

  it('kehrt die eId gar nicht zurück, ist sie entfallen — hier wird nichts vermutet', () => {
    expect(findeQuellLuecken([profil(VOLL), profil(LUECKE), profil(LUECKE)]).luecken).toEqual([]);
  });

  it(`eine Lücke über mehr als ${QUELLLUECKE_STAENDE_MAX} Stände bleibt «entfallen» (Sicherheitsgurt)`, () => {
    const kette = [profil(VOLL), ...Array.from({ length: QUELLLUECKE_STAENDE_MAX + 1 }, () => profil(LUECKE)), profil(VOLL)];
    expect(findeQuellLuecken(kette).luecken).toEqual([]);
  });

  // AUFLAGE DER GEGENPRÜFUNG ZU PR #801 (12.9.2026): der Anhang-Beleg ist BEDINGUNG,
  // nicht Vermerk. Ohne ihn ist eine wortgleiche Rückkehr innerhalb des Deckels von
  // einer echten Aufhebung mit späterer, wortgleicher Wiedereinführung nicht zu
  // unterscheiden — und die als «Quelle unvollständig» zu tarnen wäre die schwerere
  // Falschaussage (§1). Der Fall bleibt «entfallen» + «neu» und wird gemeldet.
  it('ohne Beleg im Änderungsanhang wird NICHT gebucht — der Fall wird nur gemeldet', () => {
    const OHNE = dok(ART('art_3', 'Art. 3', 'Dritter.'));
    const { luecken, ohneBeleg } = findeQuellLuecken([profil(VOLL), profil(OHNE), profil(VOLL)]);
    expect(luecken).toEqual([]);
    expect(ohneBeleg).toEqual([{ eId: 'art_9', vonIdx: 1, zurueckIdx: 2, imAnhang: false }]);
  });

  it('der Beleg muss in JEDEM Lücken-Stand liegen, nicht nur im ersten', () => {
    const OHNE = dok(ART('art_3', 'Art. 3', 'Dritter.'));
    const { luecken, ohneBeleg } = findeQuellLuecken([profil(VOLL), profil(LUECKE), profil(OHNE), profil(VOLL)]);
    expect(luecken).toEqual([]);
    expect(ohneBeleg).toHaveLength(1);
  });

  it('standProfil liest das Anhang-Etikett über die Inline-Auszeichnung hinweg («Art. 4a», nie «Art. 4 a»)', () => {
    const p = profil(dok(ART('art_1', 'Art. 1', 'Erster.')) + MOD('<b>Art. 4</b><i>a</i> Bewilligungsfreie Anwendungen', 'Text.'));
    expect([...p.anhangTokens]).toEqual(['4_a']);
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
