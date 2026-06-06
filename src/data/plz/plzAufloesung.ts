import type { Kanton } from '../../types/legal';

// ─── Amtliche PLZ→Gemeinde/Kanton-Auflösung ─────────────────────────────────
// Quelle: swisstopo «Amtliches Ortschaftenverzeichnis mit PLZ» (Abruf
// 5.6.2026); generiert via scripts/plz-generieren.ts (deterministisch,
// sortiert nach Adressenanteil). Lazy geladen (eigener Chunk) — nur wenn der
// Nutzer eine PLZ eingibt. KEINE Heuristik: eine PLZ kann mehrere Gemeinden
// und in Randlagen mehrere Kantone umfassen; das Ergebnis listet ALLE Treffer.
// PLZ-Audit-Fix 6.6.2026 (Befund David, Beispiel 4052 Basel/Münchenstein):
// Der amtliche ADRESSENANTEIL wird mitgeführt — damit ist die Hauptgemeinde
// (eindeutig, wenn genau EIN Treffer ≥ 50 % hält) von blossen Randgebiets-
// Überlappungen unterscheidbar, ohne Heuristik.

export interface PlzTreffer {
  gemeinde: string;
  kanton: Kanton;
  /** Amtlicher Adressenanteil der Gemeinde an dieser PLZ in Prozent (swisstopo). */
  anteilProzent: number;
}

let cache: Record<string, [string, string, number][]> | null = null;

export async function plzAufloesen(plz: string): Promise<PlzTreffer[] | null> {
  if (!/^\d{4}$/.test(plz)) return null;
  if (!cache) {
    cache = (await import('./plzVerzeichnis.json')).default as unknown as Record<string, [string, string, number][]>;
  }
  const treffer = cache[plz];
  if (!treffer) return null;
  return treffer.map(([gemeinde, kanton, anteilProzent]) => ({ gemeinde, kanton: kanton as Kanton, anteilProzent }));
}

/** Eindeutige Hauptgemeinde einer PLZ: genau EIN Treffer mit Adressenanteil
 *  ≥ 50 % (z. B. 4052: Basel 97.7 % vs. Münchenstein 2.3 %). null, wenn die
 *  PLZ echt mehrdeutig ist (mehrere namensgebende 100 %-Ortschaften). */
export function hauptTreffer(treffer: PlzTreffer[]): PlzTreffer | null {
  const dominant = treffer.filter((t) => t.anteilProzent >= 50);
  return dominant.length === 1 ? dominant[0] : null;
}
