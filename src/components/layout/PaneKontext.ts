import { createContext, useContext } from 'react';

// ─── Pane-Kontext (Split-View B-1) ─────────────────────────────────────────
//
// Reine Darstellungsschicht (§3). Trägt die Information, OB der gerade
// gerenderte Teilbaum in einem Split-View-Pane läuft (`imPane`) und in welcher
// Rolle. Dient genau einem Zweck: pane-fähige Layouts schalten ihre
// layoutbestimmenden Breakpoints zwischen VIEWPORT-Breakpoints (Default, 1 Pane
// = exakt heute) und CONTAINER-Query-Breakpoints (im Pane → reagiert auf die
// PANE-Breite, nicht den Viewport) um.
//
// VERHALTENSNEUTRAL by construction: Ohne montierten Provider liefert der
// Kontext `{ imPane: false }`, `paneKlasse` gibt dann die UNVERÄNDERTE
// Viewport-Klasse zurück → Default-/Prerender-Pfad byte-gleich. Die
// Container-Query-Klassen werden also schon in B-1 *geschrieben*, sind aber erst
// erreichbar, wenn ein Pane (B-2) sie mit `imPane: true` montiert.

export type PaneRolle = 'primaer' | 'sekundaer';

export interface PaneKontextWert {
  /** true ⇔ dieser Teilbaum läuft in einem Split-View-Pane (Container-Query-Modus). */
  imPane: boolean;
  rolle: PaneRolle;
}

const PaneKontext = createContext<PaneKontextWert>({ imPane: false, rolle: 'primaer' });

/** Provider — nur der Pane-Wrapper (Pane.tsx) setzt `imPane: true`. */
export const PaneProvider = PaneKontext.Provider;

export function usePaneKontext(): PaneKontextWert {
  return useContext(PaneKontext);
}

/**
 * Wählt die Layout-Klasse je nach Kontext — PURE Funktion (testbar):
 * - `imPane === false` → die heutige **Viewport**-Klasse (z. B. `xl:grid-cols-…`).
 *   Damit ist der Default-/Prerender-Pfad zeichengleich zu heute.
 * - `imPane === true`  → die **Container-Query**-Klasse (z. B. `@5xl/pane:grid-cols-…`),
 *   die auf die Pane-Breite reagiert statt auf den Viewport.
 */
export function paneKlasse(imPane: boolean, viewportKlasse: string, containerKlasse: string): string {
  return imPane ? containerKlasse : viewportKlasse;
}

/** Bequemer Hook: bindet `imPane` aus dem Kontext an `paneKlasse`. */
export function usePaneKlasse(): (viewportKlasse: string, containerKlasse: string) => string {
  const { imPane } = usePaneKontext();
  return (viewportKlasse, containerKlasse) => paneKlasse(imPane, viewportKlasse, containerKlasse);
}
