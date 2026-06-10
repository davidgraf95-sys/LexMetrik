import type { PlzTreffer } from '../../data/plz/plzAufloesung';
import type { Kanton } from '../../types/legal';

// Helper der PlzGemeindeWahl (eigene Datei: react-refresh verlangt reine
// Komponenten-Module). Reine Darstellung (§3): nur Dedupe/Sortierung der
// amtlichen swisstopo-Treffer, keine Rechtslogik.

export interface GemeindeOption {
  gemeinde: string;
  kanton: Kanton;
  anteilProzent: number;
}

/** Wählbare Gemeinde-Optionen einer PLZ: Dedupe über Gemeinde+Kanton,
 *  absteigend nach amtlichem Adressenanteil (Hauptgemeinde zuerst). */
export function gemeindeOptionen(treffer: PlzTreffer[]): GemeindeOption[] {
  const je = new Map<string, GemeindeOption>();
  for (const t of treffer) {
    const key = `${t.gemeinde}|${t.kanton}`;
    const bisher = je.get(key);
    if (!bisher || t.anteilProzent > bisher.anteilProzent) {
      je.set(key, { gemeinde: t.gemeinde, kanton: t.kanton, anteilProzent: t.anteilProzent });
    }
  }
  return [...je.values()].sort((a, b) => b.anteilProzent - a.anteilProzent);
}
