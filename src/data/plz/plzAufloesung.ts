import type { Kanton } from '../../types/legal';

// ─── Amtliche PLZ→Gemeinde/Kanton-Auflösung ─────────────────────────────────
// Quelle: swisstopo «Amtliches Ortschaftenverzeichnis mit PLZ» (Abruf
// 5.6.2026); generiert via scripts/plz-generieren.ts (deterministisch,
// sortiert). Lazy geladen (eigener Chunk, ~30 kB gzip) — nur wenn der Nutzer
// eine PLZ eingibt. KEINE Heuristik: eine PLZ kann mehrere Gemeinden und
// in Randlagen mehrere Kantone umfassen; das Ergebnis listet ALLE Treffer.

export interface PlzTreffer { gemeinde: string; kanton: Kanton }

let cache: Record<string, [string, string][]> | null = null;

export async function plzAufloesen(plz: string): Promise<PlzTreffer[] | null> {
  if (!/^\d{4}$/.test(plz)) return null;
  if (!cache) {
    cache = (await import('./plzVerzeichnis.json')).default as unknown as Record<string, [string, string][]>;
  }
  const treffer = cache[plz];
  if (!treffer) return null;
  return treffer.map(([gemeinde, kanton]) => ({ gemeinde, kanton: kanton as Kanton }));
}
