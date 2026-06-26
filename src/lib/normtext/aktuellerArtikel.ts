// Reine Auswahl-Funktion für den geteilten «aktueller-Artikel»-Beobachter
// (Auftrag David 26.6.2026). Aus den Bildschirm-Rechtecken der sichtbaren
// Artikel und der Viewport-Mitte den Artikel-Token bestimmen, der gerade «dran»
// ist. EINE Quelle für zwei Konsumenten: das Live-Label des aktiven Reiters
// (P2) und die Gliederungs-Markierung/-Navigation (P9).
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
 * Wählt den Artikel im Mittelpunkt des Viewports.
 *  1. Enthält ein Artikel-Intervall die Mitte → dieser (der zentrierte).
 *  2. Sonst der mit der KLEINSTEN Distanz seines Intervalls zur Mitte.
 * Bei Gleichstand gewinnt der erste in Dokument-Reihenfolge (Eingabe-Reihenfolge),
 * damit das Ergebnis deterministisch ist. Leere Eingabe → null.
 */
export function aktiverArtikel(eintraege: ArtikelRect[], mitte: number): string | null {
  let beste: string | null = null;
  let besteDist = Infinity;
  for (const e of eintraege) {
    // Distanz des Intervalls [top, bottom] zur Mitte: 0, wenn die Mitte drin liegt.
    const dist = mitte < e.top ? e.top - mitte : mitte > e.bottom ? mitte - e.bottom : 0;
    if (dist === 0) return e.token;
    if (dist < besteDist) { besteDist = dist; beste = e.token; }
  }
  return beste;
}
