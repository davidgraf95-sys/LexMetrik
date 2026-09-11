// ─── Die EINE Vergleichsform der Synopse (Profil `entstehung-norm/4`) ────────
//
// Befund Bauer #796 (11.9.2026, FAHRPLAN-MATERIALIEN-VERZAHNUNG §11.6): der
// Generator (`scripts/entstehung/synopse.ts`) und der Leser
// (`src/lib/entstehung/synopse-diff.ts`) trugen bis Profil `/2` je eine EIGENE
// Normalisierungsfunktion — `normalisiere()` beim Generator, `vergleichsform()`
// beim Leser. Zwei Normalisierungen sind zwei Wahrheiten (§5). Diese Datei hält
// seither die EINE Zeichen-Vergleichsform, die beide Seiten importieren.
//
// STAND 12.9.2026 (Profil `/4`, Gegenprüfung PR #798 — die Zahlen des Profils `/3`
// standen hier vorher und sind mit der Regenerierung überholt):
//  · 186 Synopse-Shards, 945 Konsolidierungs-Schritte, 4651 gespeicherte Alt-Blöcke,
//    davon 1176 `ohne_ereignis`.
//  · Leer-Diff-Verletzungen (gespeicherter Block, den der Leser nicht zeigen kann):
//    0 offen. 11 befristete, benannte Ausnahmen in
//    `bibliothek/register/entstehung-leerdiff-ausnahmen.json` (10× CHEMRRV @2022-05-01 —
//    die amtliche Konsolidierung führt dort nur 3 statt 25 `<article>`; AVIV 57b —
//    Token-Kontinuität in `neuNach`). Die fünf Ausnahmen des Profils `/3` sind
//    erledigt: ihre Ursache war die Storage-Lücke, nicht die Lineage.
//  · 522 Alt-Blöcke tragen eine geänderte Sachüberschrift (`ueberschriftNeu`),
//    31 davon OHNE Wortlaut-Unterschied — das ist der Leser-Zustand «nur die
//    Sachüberschrift wurde geändert» (`nurTitelGeaendert`), der mit Profil `/3`
//    fälschlich «kein Unterschied erkennbar» hiess.
//  · Deckel: Synopse-Shards 6716,1 KB / 8192,0 KB (82 %).
//
// WO DER SCOPE SITZT — und warum er nicht hier sitzt: die STRUKTURELLEN Regeln
// (was überhaupt verglichen und gespeichert wird: `<paragraph>`-Inhalt samt
// Fliesstext vor/zwischen/nach einer `<blockList>`, plus die Sachüberschrift ohne
// den Klammer-Randvermerk) stehen im Generator — `zerlegeBloecke`, `flachText`,
// `titelFuerVergleich` in `scripts/entstehung/synopse.ts`. Diese Datei trägt
// ausschliesslich die ZEICHEN-Ebene. Beleg dafür, dass beides nicht vermischt
// werden darf: Profil `/3` hatte einen Speicherverlust (Fliesstext nach einer
// Liste) mit einer Vergleichs-Regel zugedeckt und dabei vier echte
// Wortlautänderungen von KLV Art. 12 Bst. e gelöscht.
//
// NORMALISIERT WIRD NUR FÜRS MATCHING, NIE FÜR SPEICHERUNG ODER ANZEIGE
// (Muster law.soufien.lu, `soufien-lex.md`) — der gespeicherte und angezeigte
// Wortlaut bleibt in jedem Aufrufer der amtliche. §3 Schichtentrennung: reine
// Funktionen, kein DOM, kein Fetch, kein Zustand, kein `Date.now` (§2).

/**
 * Vergleichsform eines Wortlauts — DIE EINE Zeichen-Normalisierung für Generator
 * UND Leser. Löst vier Rausch-Klassen auf, alle empirisch belegt (R2 §3,
 * Gegenprüfung PR #794, Befund #796):
 *
 *  1. Unsichtbare Trenn-/Verbindungs-/Byte-Order-Codepunkte — Soft-Hyphen,
 *     Zero-Width-Space, ZWNJ/ZWJ, BOM. Sie tragen keinen Wortlaut und wandern
 *     zwischen Fedlex-Artefakt-Generationen (R2 §3).
 *  2. Der WORTVERBINDER U+2060 (Word Joiner) UND die ganze Familie der
 *     Leerraum-artigen Sonderzeichen (geschütztes Leerzeichen U+00A0,
 *     schmales geschütztes Leerzeichen U+202F, Ziffernbreite U+2007,
 *     Schmalraum U+2009) werden zu einem gewöhnlichen Leerzeichen — anders als
 *     Klasse 1 TRENNEN diese tatsächlich Wörter, nur eben mit einem anderen
 *     Codepunkt als die Fedlex-Konsolidierung der Vergleichsseite (BGÖ 13,
 *     gemessen 11.9.2026). U+2060 ist als Format-Zeichen (Cf) KEIN
 *     `\s`-Treffer in JS — ohne die explizite Aufnahme bliebe es ein
 *     unsichtbarer, aber ungleicher Codepunkt.
 *  3. Bindestrich-Varianten (U+2010–U+2013) auf den gewöhnlichen Bindestrich.
 *     Der GEDANKENSTRICH U+2014 bleibt ABSICHTLICH unangetastet — er ist
 *     Interpunktion, kein Trennzeichen (Gegenprüfung PR #794).
 *  4. Auslassungspunkte: «...» und «…» sind derselbe amtliche Text (ZGB
 *     Art. 107 Ziff. 4, R2 §3).
 *
 * Dazu NFC-Kanonisierung (zusammengesetzte vs. zerlegte Umlaut-Folgen sind
 * reine Kodierung) und die Kollaps-Regel: LAUFENDER Leerraum wird auf EIN
 * Leerzeichen verdichtet, nie ganz entfernt — anders als das verworfene
 * Generator-Profil `/2` bleibt die Wortgrenze erhalten (§1: ein Leerzeichen
 * kann den einzigen Unterschied zwischen zwei Wörtern markieren).
 *
 * NICHT normalisiert: Gross-/Kleinschreibung, Satzzeichen (ausser Bindestrich/
 * Ellipse oben) — eine Redaktionskorrektur «hiebei»→«hierbei» IST eine
 * Textänderung (§1).
 */
export function vergleichsform(text: string): string {
  return text
    .normalize('NFC')
    // Klasse 1: unsichtbare Trenn-/Verbindungs-/Byte-Order-Codepunkte -- spurlos weg.
    // Einzeln, nicht als Zeichenklasse (ZWJ/ZWNJ in einer Klasse waeren irrefuehrend,
    // no-misleading-character-class -- Muster wie `normalisiere()` in `synopse.ts`).
    .replace(/\u00AD/g, '')  // Soft-Hyphen
    .replace(/\u200B/g, '')  // Zero-Width-Space
    .replace(/\u200C/g, '')  // ZWNJ
    .replace(/\u200D/g, '')  // ZWJ
    .replace(/\uFEFF/g, '')  // BOM
    // Klasse 2: Leerraum-artige Sonderzeichen inkl. Wortverbinder U+2060 -> EIN Leerzeichen.
    .replace(/[\u00a0\u202f\u2007\u2009\u2060]/g, ' ')
    // Klasse 3: Bindestrich-Varianten -> gewoehnlicher Bindestrich. U+2014 (Gedankenstrich)
    // bleibt ABSICHTLICH unangetastet -- Interpunktion, kein Trennzeichen.
    .replace(/[\u2010\u2011\u2012\u2013]/g, '-')
    // Klasse 4: Auslassungspunkte-Varianten.
    .replace(/\.\.\./g, '\u2026')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * NUR für den generator-seitigen GANZER-ARTIKEL-Vergleich («geändert ja/nein»,
 * `scripts/entstehung/synopse.ts`) — baut auf `vergleichsform` auf und ist
 * ZUSÄTZLICH leerraum-blind. Grund: der Vergleich läuft über den flachen
 * XML-Text (`flachText`), und die AKN-Elementgrenze zwischen `<num>` und
 * `<content>` wandert durch das Ordnungs-Suffix von Absatz-Etiketten — AHVG
 * Art. 10 Abs. 2bis steht im Stand 2021-01-01 als `<num>2bis</num><content>Die…`,
 * im Stand 2022-01-01 als `<num>2b</num><content><sup>is</sup> Die…` (R2 §6b).
 * Beide Male lautet der Wortlaut «2bis Die…», aber die Tag-Entfernung fügt an
 * der gewanderten Grenze ein zusätzliches Leerzeichen ein («2b is Die…») — eine
 * blosse Kollaps-Regel (ein-oder-mehr-Leerzeichen → EIN Leerzeichen) würde das
 * NICHT auflösen, weil «2bis» und «2b is» verschieden viele Wörter sind. Nur
 * das GANZ-ENTFERNEN von Leerraum trägt diese Klasse (§2: eine Grammatik für
 * «bis/ter/quater/…» wäre offen und trüge nur den einen Fall).
 *
 * Der LESER braucht diese Verschärfung nie: er sieht nie XML-Elementgrenzen,
 * nur die bereits sauber extrahierten Blöcke (`SynopseBlock`). Sie lebt trotzdem
 * hier — «genau ein Ort» (§5) — statt als zweite, eigene Funktion im Generator.
 */
export function vergleichsformLeerraumBlind(text: string): string {
  return vergleichsform(text).replace(/\s+/g, '');
}
