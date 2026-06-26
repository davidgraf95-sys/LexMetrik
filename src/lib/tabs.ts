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
const MAX = 50;

/** Identität eines Reiters: pathname + optionaler Instanz-Diskriminator `?r=<n>`.
 *  Erlaubt DASSELBE Gesetz mehrfach offen (Auftrag David): zwei Reiter mit
 *  gleichem Pfad, aber verschiedenem `?r` sind verschiedene Reiter. Andere
 *  Query-Parameter (z.B. ?preset=) und der #Artikel-Anker gehören NICHT zur
 *  Identität — eine Engine mit ?preset=a/b bleibt EIN Reiter, der Artikel ändert
 *  nur Label/Scrollziel. */
export function tabSchluessel(path: string): string {
  const vorHash = path.split('#')[0];
  const [pfad, qs] = vorHash.split('?');
  const r = new URLSearchParams(qs ?? '').get('r');
  return r ? `${pfad}?r=${r}` : pfad;
}
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
  const teil = tabSchluessel(path);
  const bisher = ladeTabs();
  const idx = bisher.findIndex((t) => tabSchluessel(t.path) === teil);
  if (idx !== -1) {
    const alt = bisher[idx];
    // Ein Update OHNE Artikel-Anker (z.B. vom TabTracker mit pathname+?r) darf den
    // vom Reader gepflegten Anker NICHT löschen — sonst verlöre die zweite Instanz
    // ihr Live-Label «Kürzel – Art. X» (Auftrag David).
    const neuPath = (!path.includes('#') && alt.path.includes('#'))
      ? `${path}#${alt.path.split('#')[1]}`
      : path;
    const neuLabel = label ?? alt.label;
    const neu: TabEintrag = { path: neuPath, ...(neuLabel ? { label: neuLabel } : {}) };
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
  const von = bisher.findIndex((t) => tabSchluessel(t.path) === tabSchluessel(vonPath));
  const nach = bisher.findIndex((t) => tabSchluessel(t.path) === tabSchluessel(nachPath));
  if (von === -1 || nach === -1 || von === nach) return;
  const naechste = [...bisher];
  const [bewegt] = naechste.splice(von, 1);
  naechste.splice(nach, 0, bewegt);
  schreibe(naechste);
}

export function schliesseTab(path: string): void {
  const teil = tabSchluessel(path);
  const bisher = ladeTabs();
  const naechste = bisher.filter((t) => tabSchluessel(t.path) !== teil);
  if (naechste.length !== bisher.length) schreibe(naechste);
}

export function leereTabs(): void {
  schreibe([]);
}

/** Pfad für eine NEUE Instanz desselben Erlasses/Items (Auftrag David: dasselbe
 *  Gesetz mehrfach offen). Hängt den nächsten freien `?r=<n>` an den aktuellen
 *  Pfad (Artikel-Anker bleibt erhalten). Die erste Instanz trägt kein `?r`
 *  (implizit r=1), die nächste `?r=2` usw. */
export function naechsteInstanz(path: string): string {
  const pfad = pfadTeil(path);
  const hash = path.includes('#') ? `#${path.split('#')[1]}` : '';
  const rs = ladeTabs()
    .filter((t) => pfadTeil(t.path) === pfad)
    .map((t) => Number(new URLSearchParams(t.path.split('#')[0].split('?')[1] ?? '').get('r')) || 1);
  const next = (rs.length ? Math.max(...rs) : 0) + 1;
  return `${pfad}?r=${next}${hash}`;
}

/** Aktualisiert NUR den Artikel-Anker (#) eines bereits offenen Reiters mit
 *  dieser Identität — für das Live-Label «Kürzel – Art. X» (Auftrag David).
 *  Legt KEINEN neuen Reiter an und ändert die Reihenfolge nicht. */
export function aktualisiereTabArtikel(path: string): void {
  const teil = tabSchluessel(path);
  const bisher = ladeTabs();
  const idx = bisher.findIndex((t) => tabSchluessel(t.path) === teil);
  if (idx === -1 || bisher[idx].path === path) return;
  const naechste = [...bisher];
  naechste[idx] = { ...bisher[idx], path };
  schreibe(naechste);
}
