/**
 * scripts/normtext/zh-schriftmasse.ts — die Schrift- und Lückenmasse des
 * ZH-PDF-Wegs, an denen MEHR ALS EINE Schicht hängt.
 *
 * Herausgelöst aus `zh-seitenmontage.ts` (§6.6/§5, R1-Runde 2.9.2026): seit die
 * Randspalte eigenständig gelesen wird (`zh-randspalte.ts`), brauchen ZWEI
 * Module dieselben Grenzen — was eine Hochstellung ist, wo der Fussnoten-
 * Apparat anfängt, ab wann eine Fragment-Lücke ein Leerzeichen ist. Stünden sie
 * zweimal im Code, könnten Body- und Randspalten-Lesung auseinanderlaufen und
 * ein Randtitel gleichzeitig fehlen und falsch stehen.
 *
 * Die Messungen selbst stehen unverändert bei den Konstanten.
 *
 * §2: reine Daten, kein Verhalten.
 */

/** Ein extrahiertes Text-Fragment mit Koordinaten (für die Layout-Analyse). */
export interface PdfStueck {
  x: number;
  y: number;
  h: number;
  s: string;
  /** Fragment-Breite (pt) — für die Spalten-Lücken-Erkennung. */
  w: number;
  /** pdfjs-Schriftkennung (`fontName`, dokument-lokal wie «g_d10_f2»). Trägt
   *  den Gliederungstitel-Diskriminator, s. TITEL_MARKER. Optional, damit die
   *  bestehenden Geometrie-Unit-Tests ohne Schrift-Angabe gültig bleiben. */
  f?: string;
}

// ── Geometrie-Schwellen (empirisch erhoben, Fix-Runde 31.8.2026) ─────────────
// Messgrundlage: Roh-Stücke aller 24 ZH-PDF (pdfjs, y∈[60,530], h<11), Lücke =
// x(nächstes) − (x+width)(voriges) innerhalb EINER Textzeile.
//
// WORT_LUECKE_PT — ab wann eine Fragment-Lücke ein echtes Leerzeichen ist.
// Gemessene Verteilung (Body-Schrift h≈9.18, nach Hochstellungs-Zuordnung):
//   −0.7 … +0.4  Silbentrennstrich, direkt anschliessende Interpunktion  (kein Space)
//    1.3 … 20    jede Lücke ist ein echtes Leerzeichen («Art.»|«1», «§»|«73»,
//                «400»|«000» = schmaler Tausenderabstand, lit.-Marke|Text,
//                Blocksatz-Spatien, Tabellenspalten)
// Zwischen 0.4 und 1.3 liegt im ganzen Bestand KEIN Body-Fragmentpaar → 0.8 pt
// trennt beide Klassen mit Sicherheitsabstand nach beiden Seiten.
//
// VORHER (Bug B-4, Gegenprüfung 31.8.2026): nur Lücken > 18 pt bekamen ein
// Leerzeichen. Alles darunter klebte zusammen — «§34», «Abs.1», «Art.68»,
// «ZPOvor», und über die entfernte Fussnoten-Hochzahl hinweg «BGFAnicht»,
// «Kantonsverfassungund». Eingefügt wird weiterhin NUR Whitespace, nie ein
// Zeichen geändert/entfernt/umgestellt (§1).
export const WORT_LUECKE_PT = 0.8;

/** Grenzhöhe (pt): darunter ist ein Stück hochgestellt (Absatzzahl, Fussnoten-
 *  Verweis, lat. Suffix «bis»/«ter»). Body ist h≈9.18, Hochstellung h≈5.70. */
export const HOCH_MAX_H = 7.0;

/** Grenzhöhe (pt) der Fussnoten-DEFINITIONS-Ziffer am Seitenfuss. Gemessene
 *  Höhen im Gesamtbestand: 4.32/4.62/4.92/5.04 (Fussnoten-Apparat, Grundschrift
 *  7.98) gegen 5.70 (Body-Hochstellung, Grundschrift 9.18) — die beiden Klassen
 *  berühren sich nicht; 5.2 pt trennt sie. */
export const APPARAT_ZIFFER_MAX_H = 5.2;

/** Maximaler y-Abstand (pt) zwischen einer Hochstellung und ihrer Trägerzeile.
 *  Gemessen: durchgängig 2.76 pt (Hochstellung liegt über der Grundlinie);
 *  der Zeilenabstand beträgt ≈10.2 pt, eine Verwechslung ist ausgeschlossen. */
export const HOCH_TRAEGER_ABSTAND = 5;

