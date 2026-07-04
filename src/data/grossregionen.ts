import type { KantonCode } from './tarif/typen';

// ─── BFS-Grossregionen (NUTS-2) der Schweiz ─────────────────────────────────
//
// Amtliche, deterministische Zuordnung jedes Kantons zu einer der sieben
// statistischen Grossregionen des Bundesamts für Statistik (BFS). Reine
// ANZEIGE-Ordnung für die Kantons-Übersicht (§3) — eine geografische Sortier-
// alternative neben Alphabet/Erlass-Zahl. KEIN Norminhalt, keine Rechtslogik.
//
// Quelle: BFS, «Grossregionen der Schweiz» (raumgliederungen / NUTS-2), amtlich
// und stabil. Verifiziert gegen die BFS-Standardgliederung; die Zuordnung ist
// deterministisch (§2) und vollständig (jeder der 26 Kantone genau einmal).
// Reihenfolge der Regionen = BFS-Standardreihenfolge (West → Ost).

export interface Grossregion {
  id: string;
  name: string;
  kantone: KantonCode[];
}

export const GROSSREGIONEN: Grossregion[] = [
  { id: 'genfersee', name: 'Genferseeregion', kantone: ['VD', 'VS', 'GE'] },
  { id: 'mittelland', name: 'Espace Mittelland', kantone: ['BE', 'FR', 'SO', 'NE', 'JU'] },
  { id: 'nordwest', name: 'Nordwestschweiz', kantone: ['BS', 'BL', 'AG'] },
  { id: 'zuerich', name: 'Zürich', kantone: ['ZH'] },
  { id: 'ostschweiz', name: 'Ostschweiz', kantone: ['GL', 'SH', 'AR', 'AI', 'SG', 'GR', 'TG'] },
  { id: 'zentral', name: 'Zentralschweiz', kantone: ['LU', 'UR', 'SZ', 'OW', 'NW', 'ZG'] },
  { id: 'tessin', name: 'Tessin', kantone: ['TI'] },
];

/** Kantonscode → Grossregion (id/name/Rang). Rang = Position in GROSSREGIONEN
 *  (BFS-Reihenfolge), für die Sortierung «nach Region». */
export const GROSSREGION_VON_KANTON: Record<string, { id: string; name: string; rang: number }> = (() => {
  const m: Record<string, { id: string; name: string; rang: number }> = {};
  GROSSREGIONEN.forEach((r, i) => {
    for (const k of r.kantone) m[k] = { id: r.id, name: r.name, rang: i };
  });
  return m;
})();
