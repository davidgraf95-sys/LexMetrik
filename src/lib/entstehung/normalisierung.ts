// ─── Die EINE Vergleichsform der Synopse (Profil `entstehung-norm/3`) ────────
//
// Befund Bauer #796 (11.9.2026, FAHRPLAN-MATERIALIEN-VERZAHNUNG §11.6): der
// Generator (`scripts/entstehung/synopse.ts`) und der Leser
// (`src/lib/entstehung/synopse-diff.ts`) trugen bis Profil `/2` je eine EIGENE
// Normalisierungsfunktion — `normalisiere()` beim Generator, `vergleichsform()`
// beim Leser. Zwei Normalisierungen sind zwei Wahrheiten (§5): gemessen wurden
// 70 gespeicherte Alt-Blöcke (36/3484 `belegt`, 34/999 `ohne_ereignis`), die der
// Generator als «geändert» ablegte, während der Leser mit seiner eigenen
// Vergleichsform «kein Unterschied erkennbar» zeigte.
//
// URSACHE (empirisch, nicht die Zeichen-Tabellen): in ALLEN 70 Fällen war der
// Artikel-BODY (die gespeicherten `bloecke`) bereits nach der alten
// Generator-Normalisierung `/2` identisch — der Unterschied, der «geändert»
// auslöste, lag im `<heading>`/`<subheading>`-Randvermerk des AKN-Baums, den
// der Generator in seinen Ganzer-Artikel-Vergleich einbezog, den die
// STRUKTURELLE Extraktion (`zerlegeBloecke`, nur `<paragraph>`) aber NIE in
// die gespeicherten Blöcke übernimmt und den der Leser folglich nie sieht.
// Beleg: AVIV Art. 109b, 2021-04-01 → 2021-07-01 — der Artikeltext blieb
// byte-gleich, der `<subheading>`-Querverweis wanderte von
// «(Art. 83 Abs. 1 Bst. i und o AVIG)» zu «(Art. 83 Abs. 1bis AVIG)» (eine
// Umnummerierung an ANDERER Stelle des Erlasses). Der Fix dafür sitzt im
// Generator (`flachText` vergleicht nur noch `<paragraph>`-Inhalt, siehe
// `scripts/entstehung/synopse.ts`); diese Datei liefert dazu die EINE
// Zeichen-Vergleichsform, die beide Seiten importieren, damit kein künftiger
// Zeichen-Fall wieder auseinanderlaufen kann.
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
