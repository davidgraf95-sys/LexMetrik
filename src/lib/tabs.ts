import { pfadTeil } from './verlaufLabel';

// ─── Offene In-App-Reiter (Tab-Streifen, Auftrag David) ─────────────────────
//
// SSoT des localStorage-Keys 'lexmetrik-tabs' (§5). Reines Speicher-Werkzeug,
// KEINE Rechtslogik (§3): die Liste der zugleich offenen Reiter (Engines,
// Gesetze, Vorlagen, Entscheide), damit man ohne Browser-Tab zwischen mehreren
// hin- und herwechseln kann. Gespeichert wird NUR der Navigationspfad (+ optio-
// nales Anzeige-Label), NIE Formularinhalte (Berufsgeheimnis; das v1 erhält die
// Reiter-LISTE über Reloads, nicht den flüchtigen Formular-State — bewusste
// Grenze, navigationsbasiert). Reihenfolge = Array-Position, NEUE Reiter HINTEN
// angehängt (stabil, anders als der neueste-vorn-Ring in verlauf.ts) — kein
// Zeitstempel, also kein Date.now() in src/lib (§2 Determinismus).

export interface TabEintrag {
  path: string;
  label?: string;
}

const KEY = 'lexmetrik-tabs';
const MAX = 8;
/** Event, mit dem Schreiber (TabTracker, Schliess-Buttons) die Leser
 *  (useTabs → TabStreifen) im selben Browser-Tab synchron halten. */
export const TABS_EVENT = 'lexmetrik:tabs';

export function ladeTabs(): TabEintrag[] {
  try {
    const roh = localStorage.getItem(KEY);
    const arr = roh ? JSON.parse(roh) : [];
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((e): e is TabEintrag =>
        e && typeof e.path === 'string' &&
        (e.label === undefined || typeof e.label === 'string'))
      .slice(0, MAX);
  } catch {
    return [];
  }
}

function schreibe(tabs: TabEintrag[]): void {
  try { localStorage.setItem(KEY, JSON.stringify(tabs)); } catch { /* privater Modus — Reiter sind Komfort */ }
  try { window.dispatchEvent(new Event(TABS_EVENT)); } catch { /* SSR/kein window */ }
}

/** Öffnet/aktualisiert einen Reiter. Dublette (per pathname) behält ihre
 *  Position (stabile Reihenfolge) und übernimmt nur ein neu aufgelöstes Label;
 *  ein neuer Reiter wird HINTEN angehängt, gekappt auf die jüngsten MAX. */
export function merkeTab(path: string, label?: string): void {
  const teil = pfadTeil(path);
  const bisher = ladeTabs();
  const idx = bisher.findIndex((t) => pfadTeil(t.path) === teil);
  if (idx !== -1) {
    const alt = bisher[idx];
    const neu: TabEintrag = { path, ...(label ?? alt.label ? { label: label ?? alt.label } : {}) };
    // nur schreiben, wenn sich etwas ändert (idempotent gegen Mehrfach-Aufruf)
    if (alt.path === neu.path && alt.label === neu.label) return;
    const naechste = [...bisher];
    naechste[idx] = neu;
    schreibe(naechste);
    return;
  }
  schreibe([...bisher, { path, ...(label ? { label } : {}) }].slice(-MAX));
}

/** #12: Reiter per Drag-and-Drop umsortieren — verschiebt den gezogenen Reiter
 *  (vonPath) an die Position des Ziel-Reiters (nachPath). Identifikation über
 *  pfadTeil (stabile Reiter-Identität); deterministisch, kein Zeitstempel. */
export function ordneTabsUm(vonPath: string, nachPath: string): void {
  const bisher = ladeTabs();
  const von = bisher.findIndex((t) => pfadTeil(t.path) === pfadTeil(vonPath));
  const nach = bisher.findIndex((t) => pfadTeil(t.path) === pfadTeil(nachPath));
  if (von === -1 || nach === -1 || von === nach) return;
  const naechste = [...bisher];
  const [bewegt] = naechste.splice(von, 1);
  naechste.splice(nach, 0, bewegt);
  schreibe(naechste);
}

export function schliesseTab(path: string): void {
  const teil = pfadTeil(path);
  const bisher = ladeTabs();
  const naechste = bisher.filter((t) => pfadTeil(t.path) !== teil);
  if (naechste.length !== bisher.length) schreibe(naechste);
}

export function leereTabs(): void {
  schreibe([]);
}
