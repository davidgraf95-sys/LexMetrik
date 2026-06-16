// Reiner Fokus-Falle-Helfer für die Norm-Vorschau-Dialoge. Ausgelagert aus der
// Komponente, damit (a) die Index-Logik der Tab-Falle ohne DOM testbar bleibt
// (node-Test-Env ohne jsdom) und (b) die Komponenten-Datei nur Komponenten
// exportiert (eslint react-refresh/only-export-components). Die DOM-Verdrahtung
// (keydown-Tab, fokussierbare Elemente einsammeln) bleibt im Overlay-useEffect.

/**
 * Nächster Fokus-Index innerhalb einer zyklischen Fokus-Falle.
 *
 * @param anzahl   Zahl der fokussierbaren Elemente im Dialog.
 * @param aktiv    Index des aktuell fokussierten Elements (oder -1, wenn der
 *                 Fokus nicht in der Liste liegt — z. B. auf dem Dialog selbst).
 * @param rueckwaerts true bei Shift+Tab.
 * @returns Ziel-Index; -1, wenn die Liste leer ist (dann nichts zu fokussieren).
 *
 * Vorwärts: letztes → erstes (Wrap). Rückwärts: erstes → letztes (Wrap).
 * Liegt der Fokus ausserhalb der Liste (aktiv = -1), landet vorwärts auf dem
 * ersten, rückwärts auf dem letzten Element.
 */
export function naechsterFokus(anzahl: number, aktiv: number, rueckwaerts: boolean): number {
  if (anzahl <= 0) return -1;
  if (rueckwaerts) {
    // Shift+Tab: erstes (oder kein Treffer) wrappt auf das letzte.
    return aktiv <= 0 ? anzahl - 1 : aktiv - 1;
  }
  // Tab: letztes (oder kein Treffer) wrappt auf das erste.
  return aktiv === -1 || aktiv >= anzahl - 1 ? 0 : aktiv + 1;
}
