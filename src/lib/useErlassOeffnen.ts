import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ladeTabs, merkeTab, naechsteInstanz } from './tabs';
import { pfadTeil } from './verlaufLabel';

// Öffnen eines Erlasses aus der Übersicht /gesetze (Punkt G, Auftrag David).
// Reines Navigations-/Reiter-Werkzeug, KEINE Rechtslogik (§3): nur der Pfad
// entscheidet, NICHT was im Erlass steht. Ziel: ein erneuter Klick auf ein
// bereits offenes Gesetz öffnet eine NEUE Instanz (?r=<n>) statt nur den
// bestehenden Reiter zu aktivieren (merkeTab dedupliziert sonst per
// tabSchluessel). Der nackte Basispfad bleibt der <Link to=…> (SEO,
// Mittelklick, Cmd-Klick, Copy-Link) — abgefangen wird nur der einfache
// Linksklick, und auch nur, wenn das Gesetz schon offen ist.

/** Pfad-Vergleich robust gegen Encoding-Unterschiede: der Basispfad trägt
 *  encodeURIComponent(key), gespeicherte Reiter-Pfade kommen aus location.pathname
 *  (ggf. anders kodiert). Für heutige Keys identisch, für Sonderzeichen-Keys nicht
 *  → beide Seiten decodiert vergleichen, damit «schon offen?» sicher greift. */
function dekod(p: string): string {
  try { return decodeURIComponent(pfadTeil(p)); } catch { return pfadTeil(p); }
}

/** Zielpfad beim Öffnen von `basePath`: ist DERSELBE Erlass bereits in (mind.)
 *  einem Reiter offen (pfadTeil == basePath), die nächste freie Instanz
 *  (?r=<n>), sonst der nackte Basispfad (erste, ?r-lose Instanz). naechsteInstanz
 *  wird bewusst nur bei ≥1 offener Instanz aufgerufen, da es sonst ?r=1 lieferte. */
export function zielPfadFuerOeffnen(basePath: string, offeneTabPfade: string[]): string {
  const ziel = dekod(basePath);
  const schonOffen = offeneTabPfade.some((p) => dekod(p) === ziel);
  return schonOffen ? naechsteInstanz(basePath) : basePath;
}

/** Ist (mind.) eine Instanz dieses Basispfads offen? Entscheidet im Klick-
 *  Handler, ob der einfache Linksklick abgefangen wird (preventDefault + Hook). */
export function istErlassOffen(basePath: string): boolean {
  const ziel = dekod(basePath);
  return ladeTabs().some((t) => dekod(t.path) === ziel);
}

/** Hook: liefert eine Öffnen-Funktion (ebene, key, kuerzel) → baut den Basispfad
 *  ('/gesetze/<ebene>/<encodeURIComponent(key)>'), wählt über zielPfadFuerOeffnen
 *  Basispfad oder neue Instanz, merkt den Reiter und navigiert dorthin. */
export function useErlassOeffnen(): (ebene: string, key: string, kuerzel?: string) => void {
  const navigate = useNavigate();
  return useCallback((ebene: string, key: string, kuerzel?: string) => {
    const basePath = `/gesetze/${ebene}/${encodeURIComponent(key)}`;
    const ziel = zielPfadFuerOeffnen(basePath, ladeTabs().map((t) => t.path));
    merkeTab(ziel, kuerzel);
    navigate(ziel);
  }, [navigate]);
}
