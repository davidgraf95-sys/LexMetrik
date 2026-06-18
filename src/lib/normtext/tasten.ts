// Reiner Tastatur-Helfer für die Norm-Vorschau-Dialoge. Ausgelagert aus der
// Komponente, damit (a) die Schliesslogik ohne DOM testbar bleibt (node-Test-
// Env ohne jsdom) und (b) die Komponenten-Datei nur Komponenten exportiert
// (eslint react-refresh/only-export-components).

/** true für die Schliess-Taste (Esc). */
export function istSchliessTaste(e: { key: string }): boolean {
  return e.key === 'Escape' || e.key === 'Esc';
}
