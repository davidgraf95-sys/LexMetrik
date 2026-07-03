/**
 * Generischer HTML-Entity-Dekoder für Normtext-Snapshots.
 *
 * Dekodiert:
 *  - Numerische Entities: &#NNN; (dezimal) und &#xHH; (hex)
 *  - Benannte Entities: WHATWG-vollständig über `he.decode` (2231 Entities,
 *    Werkzeug-Audit Nulltarif-Paket 3.7.2026) statt der früheren handgepflegten
 *    ~90er-Tabelle — unbekannte benannte Entities konnten real Inhalt
 *    verfälschen (&ge;/&le; trugen Tarif-/Grenzwert-SCHWELLEN, BS-772.110
 *    «U &le; 0,15», BS-772.430 «Vorjahresverbrauch &ge;13 MWh»).
 *
 * Reihenfolge: EIN links-nach-rechts-Scan (C1-5), jede Entity genau einmal
 * ersetzt, das Ergebnis nicht erneut gescannt — literales `&amp;lt;` wird
 * also nie doppelt zu `<` dekodiert. Unbekannte Entities bleiben unverändert
 * (he.decode lässt sie durch; zusätzlich matcht ENTITY_RE nur benannte Tokens
 * mit Semikolon, nie die legacy-Formen ohne `;`).
 *
 * Dokumentierte SONDERFÄLLE (bewusste, korpus-begründete Abweichungen von der
 * reinen WHATWG-Tabelle — EXAKT beibehaltene Alt-Semantik, §6.3):
 *  - &nbsp; → normales Leerzeichen (U+0020), nicht U+00A0, da die
 *    Normtext-Anzeige normale Leerzeichen erwartet.
 *  - &mu;  → MICRO SIGN µ (U+00B5), nicht GREEK SMALL LETTER MU μ (U+03BC):
 *    im Korpus steht &mu; ausschliesslich als Einheiten-Präfix
 *    (BS-781.500 «µg/m²», Feinstaub-Grenzwert) — der Mikro-Buchstabe ist die
 *    gemeinte Semantik; ausserdem bleiben committete Snapshots/sha stabil.
 */
import he from 'he';

/** Korpus-begründete Sonderfälle (siehe Kopf-Kommentar). */
const SONDERFAELLE: Record<string, string> = {
  '&nbsp;': ' ',
  '&mu;': 'µ',
};

/**
 * Dekodiert alle HTML-Entities in einem String.
 *
 * Token-basierter EINMAL-Durchlauf (C1-5): jede Entity – numerisch (&#NNN; /
 * &#xHH;) wie benannt – wird in EINEM links-nach-rechts-Scan genau einmal
 * ersetzt, das Ergebnis NICHT erneut gescannt. Unbekannte Entities bleiben
 * unverändert.
 *
 * @param s - Eingabestring mit möglicherweise kodierten HTML-Entities
 * @returns  String mit dekodierten Zeichen
 */
const ENTITY_RE = /&#x([0-9a-fA-F]+);|&#(\d+);|&[a-zA-Z][a-zA-Z0-9]*;/g;
export function dekodiereEntities(s: string): string {
  return s.replace(ENTITY_RE, (m, hex, dec) => {
    if (hex !== undefined) return String.fromCodePoint(parseInt(hex, 16));
    if (dec !== undefined) return String.fromCodePoint(parseInt(dec, 10));
    if (Object.prototype.hasOwnProperty.call(SONDERFAELLE, m)) return SONDERFAELLE[m];
    // he.decode auf das EINZELNE Token (nie den Gesamtstring): erhält den
    // Einmal-Scan; unbekannte benannte Entities kommen unverändert zurück.
    return he.decode(m);
  });
}
