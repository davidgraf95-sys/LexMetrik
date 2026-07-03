// ─── «Zuletzt verwendet»-Tracker (Startseite V3, Modul #5) ──────────────────
//
// SSoT des localStorage-Keys 'lexmetrik-zuletzt' (§5). Reines Speicher-Werkzeug
// (§3), KEINE Rechtslogik: die zuletzt besuchten Inhalts-Routen (Rechner/Vorlage;
// Gesetze/Entscheide folgen als eigenes Arbeitspaket, FAHRPLAN §3 #5) als
// Chip-Quelle der Startseite. Gespeichert wird NUR der Navigationspfad + ein
// aufgelöstes Anzeige-Label + ein Zeitstempel — NIE Formularinhalte
// (Berufsgeheimnis; navigationsbasiert wie lib/tabs.ts).
//
// Reihenfolge = neueste zuerst über die Array-Position (dedupe je route: alten
// Eintrag entfernen, neuen vorne einreihen) — das ist deterministisch und braucht
// KEIN Date.now(). Der `zeit`-Wert ist reine Anzeige-/Ordnungs-Metadaten (kein
// §2-Rechenwert) und wird darum von der Aufrufer-Schicht (ZuletztTracker in
// components/, wo Date.now() erlaubt ist) hereingereicht — die ESLint-§2-Sperre
// verbietet Date.now() in src/lib.
//
// SSR-sicher + defensiv: kein localStorage im Prerender-Node (Guard + try/catch);
// ein Tracker ist Komfort und darf nie eine Seite zerlegen.

export interface ZuletztEintrag {
  route: string;
  titel: string;
  /** Anzeige-/Ordnungs-Metadaten (ms seit Epoch); 0 wenn nicht mitgegeben. */
  zeit: number;
}

const KEY = 'lexmetrik-zuletzt';
const MAX = 6;

/** localStorage vorhanden? (Prerender-Node hat keins → SSR-sicherer No-op.) */
function hatSpeicher(): boolean {
  return typeof localStorage !== 'undefined';
}

/** Die zuletzt besuchten Einträge, neueste zuerst, gekappt auf MAX. */
export function holeZuletzt(): ZuletztEintrag[] {
  if (!hatSpeicher()) return [];
  try {
    const roh = localStorage.getItem(KEY);
    const arr = roh ? JSON.parse(roh) : [];
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((e): e is ZuletztEintrag =>
        !!e && typeof e.route === 'string' && typeof e.titel === 'string' && typeof e.zeit === 'number')
      .slice(0, MAX);
  } catch {
    return [];
  }
}

/** Merkt einen Besuch: dedupe je route (alter Eintrag raus), neuester nach vorn,
 *  auf MAX gekappt. `zeit` ist optionale Metadaten (Default 0) — s. Kopfkommentar. */
export function merkeBesuch({ route, titel, zeit }: { route: string; titel: string; zeit?: number }): void {
  if (!hatSpeicher()) return;
  if (!route || !titel) return; // ohne auflösbaren Titel kein Chip (§8: kein Rohpfad)
  try {
    const ohne = holeZuletzt().filter((e) => e.route !== route);
    const neu: ZuletztEintrag = { route, titel, zeit: zeit ?? 0 };
    localStorage.setItem(KEY, JSON.stringify([neu, ...ohne].slice(0, MAX)));
  } catch {
    /* privater Modus / Quota — «Zuletzt» ist reiner Komfort */
  }
}
