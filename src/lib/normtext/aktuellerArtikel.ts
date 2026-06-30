// Reine Auswahl-Funktion für den geteilten «aktueller-Artikel»-Beobachter
// (Auftrag David 26.6.2026). Aus den Bildschirm-Rechtecken der sichtbaren
// Artikel und einer Bezugslinie im Viewport den Artikel-Token bestimmen, der
// gerade «dran» ist. EINE Quelle für zwei Konsumenten: das Live-Label des aktiven
// Reiters (P2) und die Gliederungs-Markierung/-Navigation (P9).
//
// R1 (Auftrag David 30.6.2026): Die Bezugslinie ist generisch (nicht zwingend die
// Mitte). Der Aufrufer setzt sie heute nahe den oberen Lese-Rand, damit der
// ZUOBERST angeschnittene Artikel gewählt wird; die Funktion selbst bleibt
// unverändert «Artikel an der Bezugslinie, sonst der mit kleinster Distanz».
//
// Determinismus (§2): gleiche Eingabe → gleiche Ausgabe; keine DOM-/Zeitzugriffe
// hier (die holt der Hook in GesetzLeser und reicht sie als Zahlen herein),
// darum unit-testbar ohne Browser.

export interface ArtikelRect {
  /** Artikel-Token (id ohne «art-»-Präfix), z. B. «66» oder «335_c». */
  token: string;
  /** Abstand der Artikel-Oberkante vom Viewport-Oberrand (px, wie getBoundingClientRect().top). */
  top: number;
  /** Abstand der Artikel-Unterkante vom Viewport-Oberrand (px). */
  bottom: number;
}

/**
 * Wählt den Artikel an der Bezugslinie `bezug` (px ab Viewport-Oberrand).
 *  1. Enthält ein Artikel-Intervall die Bezugslinie → dieser.
 *  2. Sonst der mit der KLEINSTEN Distanz seines Intervalls zur Bezugslinie.
 * Bei Gleichstand gewinnt der erste in Dokument-Reihenfolge (Eingabe-Reihenfolge),
 * damit das Ergebnis deterministisch ist. Leere Eingabe → null.
 */
export function aktiverArtikel(eintraege: ArtikelRect[], bezug: number): string | null {
  let beste: string | null = null;
  let besteDist = Infinity;
  for (const e of eintraege) {
    // Distanz des Intervalls [top, bottom] zur Bezugslinie: 0, wenn sie drin liegt.
    const dist = bezug < e.top ? e.top - bezug : bezug > e.bottom ? bezug - e.bottom : 0;
    if (dist === 0) return e.token;
    if (dist < besteDist) { besteDist = dist; beste = e.token; }
  }
  return beste;
}
