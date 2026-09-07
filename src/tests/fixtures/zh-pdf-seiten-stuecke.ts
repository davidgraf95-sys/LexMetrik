/**
 * Echte pdfjs-Roh-Stücke ZWEIER ZH-PDF-Seiten (Koordinaten unverändert,
 * abgerufen 31.8.2026) — Prüfmaterial für die Geometrie-Entscheide in
 * `montiereZhSeite()`.
 *
 * Bereits angewandt wie im Adapter: Kopf-/Fussband (y ausserhalb 60…530) und
 * Erlasstitel (h ≥ 11) sind entfernt; sonst nichts verändert.
 *
 * ZH_212812_SEITE2 — Gebührenverordnung SVGer (LS 212.812), Seite 2.
 *   Trägt die drei am Bestand belegten Fehlerbilder:
 *   · Fussnoten-Verweis «³» am Zeilenende (x 330.48, y 500.66) über der Zeile
 *     y 497.90 — wurde als Absatznummer gelesen und riss § 4 Abs. 2 im Wort
 *     «Entschädigungsver-|ordnung» auf (B-2).
 *   · Zwei Fussnoten-Verweise «⁴»/«⁶» (y 468.08) über der Zeile y 465.32.
 *   · Echte Absatz-Hochzahlen bei x 102.06 (linksbündig vor dem Text) und
 *     x 124.98 (zwischen «§ 5.» und dem Text) — sie müssen bleiben.
 *   · Marginalien im Aussenrand (x 28.32, h 7.50).
 *
 * ZH_1752_SEITE1 — Verwaltungsrechtspflegegesetz (LS 175.2), Seite 1.
 *   Trägt die Falle, die in der Fix-Runde selbst erzeugt wurde: die Randnoten
 *   «Grundsatz⁵²» (x 371.46, y 442.58, h 4.62) und «Prüfung der
 *   Zuständigkeit³⁴» (x 382.68, y 129.86, h 4.62) tragen Fussnoten-Ziffern in
 *   Apparat-Schriftgrösse MITTEN auf der Seite. Wird die Apparat-Kante vor dem
 *   Marginalien-Filter bestimmt, kappt sie den halben Erlass.
 *   Ausserdem: «§ 4 a.» als drei Fragmente («§» | «4» | «a.») — die Zürcher
 *   Sammlung setzt den Buchstaben-Suffix mit Abstand (am Druckbild verifiziert).
 *
 * ZH_2111_SEITE24 — Gerichts- und Behördenorganisation (LS 211.1), Seite 24.
 *   Widerlegt, dass sich Fussnoten-Ziffern und Absatz-Hochzahlen über die
 *   Schriftgrösse trennen liessen: die Absatzzahl von § 105 Abs. 2 steht hier
 *   mit h = 5.04 (y 170.36) — mitten in der Höhenklasse der Fussnoten-Ziffern
 *   (4.32/4.62/4.92). Eine Apparat-Kante allein aus der Ziffernhöhe kappte die
 *   Seite ab y 170 und verschluckte § 105 Abs. 2 samt dem ganzen § 106.
 */
export type { ZhStueckFixture } from './zh-pdf-seiten-stuecke.typen';

export { ZH_212812_SEITE2 } from './zh-pdf-seiten-stuecke.212812';
export { ZH_1752_SEITE1 } from './zh-pdf-seiten-stuecke.1752';
export { ZH_2111_SEITE24 } from './zh-pdf-seiten-stuecke.2111';
