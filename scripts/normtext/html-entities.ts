/**
 * Generischer HTML-Entity-Dekoder für Normtext-Snapshots.
 *
 * Dekodiert:
 *  - Numerische Entities: &#NNN; (dezimal) und &#xHH; (hex)
 *  - Benannte Entities: vollständige Liste aller in LexWork- und Fedlex-Quellen
 *    auftretenden Entities inkl. Sonderzeichen (ü/ö/ä/é/è/à/ç/… u.v.m.)
 *
 * Reihenfolge: numerisch zuerst, dann benannt; &amp; wird so behandelt, dass
 * kein Doppel-Dekodieren entsteht (keine Ausnahmebehandlung nötig, da die
 * benannte Ersetzung linear und nicht rekursiv läuft).
 *
 * nbsp → normales Leerzeichen (U+0020), nicht U+00A0, da Normtext-Anzeige
 * normale Leerzeichen erwartet.
 */

/** Vollständige Tabelle benannter HTML-Entities (für Normtext-Quellen). */
const NAMED_ENTITIES: Record<string, string> = {
  // Pflicht-Basis
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
  // Leerzeichen / Interpunktion
  '&nbsp;': ' ',
  '&hellip;': '…',
  '&sect;': '§',
  '&para;': '¶',
  '&middot;': '·',
  '&ndash;': '–',
  '&mdash;': '—',
  '&laquo;': '«',
  '&raquo;': '»',
  '&bdquo;': '„',
  '&ldquo;': '"',
  '&rdquo;': '"',
  '&sbquo;': '‚',
  '&lsquo;': '‘',
  '&rsquo;': '’',
  // Mathematik / Sonderzeichen
  '&times;': '×',
  '&deg;': '°',
  '&euro;': '€',
  '&percnt;': '%',
  '&plus;': '+',
  '&minus;': '−',
  '&permil;': '‰',
  '&frac12;': '½',
  '&frac14;': '¼',
  '&frac34;': '¾',
  '&radic;': '√',
  // BS-Audit 23.6.2026 (T1/S1) — empirisch im Korpus gefundene, bislang
  // unaufgelöste Entities. ACHTUNG: &ge;/&le; tragen Tarif-/Grenzwert-SCHWELLEN
  // (BS-772.110 «U &le; 0,15», BS-772.430 «Vorjahresverbrauch &ge;13 MWh») —
  // unaufgelöst verfälschen sie den Inhalt, nicht nur die Optik.
  '&sup1;': '¹',
  '&sup2;': '²',
  '&sup3;': '³',
  '&ge;': '≥',
  '&le;': '≤',
  '&mu;': 'µ', // BS-781.500 «µg/m²» (Feinstaub-Grenzwert)
  '&eta;': 'η', // AR-750.11 Nutzungsgrad-Symbol
  '&plusmn;': '±', // BS-563.210 Toleranzangabe «±10»
  '&divide;': '÷', // BS-650.510 Formel «H = L ÷ 0…»
  '&not;': '¬', // RiE 162.110 (Quell-Eigenheit: weiches Trennzeichen als ¬ kodiert)
  '&reg;': '®', // BS-772.110 «MINERGIE®»
  '&frasl;': '⁄', // ZG-641.1 Bruchstrich «1⁄2»
  // Romanische Akzentbuchstaben (FR/IT-Korpus): «Bâle» = Basel auf Französisch.
  '&acirc;': 'â',
  '&Acirc;': 'Â',
  // Deutsche Umlaute
  '&auml;': 'ä',
  '&ouml;': 'ö',
  '&uuml;': 'ü',
  '&Auml;': 'Ä',
  '&Ouml;': 'Ö',
  '&Uuml;': 'Ü',
  '&szlig;': 'ß',
  // Französische / romanische Zeichen
  '&agrave;': 'à',
  '&egrave;': 'è',
  '&eacute;': 'é',
  '&ecirc;': 'ê',
  '&ccedil;': 'ç',
  '&ocirc;': 'ô',
  '&ucirc;': 'û',
  '&ugrave;': 'ù',
  '&Agrave;': 'À',
  '&Egrave;': 'È',
  '&Eacute;': 'É',
  '&Ecirc;': 'Ê',
  '&Ccedil;': 'Ç',
  '&Ocirc;': 'Ô',
  '&Ucirc;': 'Û',
  '&Ugrave;': 'Ù',
  '&iuml;': 'ï',
  '&icirc;': 'î',
  '&iacute;': 'í',
  '&igrave;': 'ì',
  '&ntilde;': 'ñ',
  '&aelig;': 'æ',
  '&oelig;': 'œ',
};

/**
 * Dekodiert alle HTML-Entities in einem String.
 *
 * Token-basierter EINMAL-Durchlauf (C1-5): jede Entity – numerisch (&#NNN; /
 * &#xHH;) wie benannt – wird in EINEM links-nach-rechts-Scan genau einmal
 * ersetzt, das Ergebnis NICHT erneut gescannt. So kann z. B. literales `&amp;lt;`
 * nicht über `&` doppelt zu `<` dekodiert werden (vorher lief `&amp;` als erster
 * Eintrag von NAMED_ENTITIES vor `&lt;` → Doppel-Dekodierung). Unbekannte
 * Entities bleiben unverändert.
 *
 * @param s - Eingabestring mit möglicherweise kodierten HTML-Entities
 * @returns  String mit dekodierten Zeichen
 */
const ENTITY_RE = /&#x([0-9a-fA-F]+);|&#(\d+);|&[a-zA-Z][a-zA-Z0-9]*;/g;
export function dekodiereEntities(s: string): string {
  return s.replace(ENTITY_RE, (m, hex, dec) => {
    if (hex !== undefined) return String.fromCodePoint(parseInt(hex, 16));
    if (dec !== undefined) return String.fromCodePoint(parseInt(dec, 10));
    return Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, m) ? NAMED_ENTITIES[m] : m;
  });
}
