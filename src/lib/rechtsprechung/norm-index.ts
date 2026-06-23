// ─── Norm → Entscheid-Index (Verzahnung, Burggraben) ────────────────────────
//
// Lazy geladener Index public/rechtsprechung/norm-index.json: zu einem Erlass-
// Register-key die einschlägig GENANNTEN Bundesgerichtsentscheide. Quelle = die
// (maschinell extrahierten) statutes[] der Entscheide → Status 'maschinell', nie
// als geprüftes Präjudiz verkaufen (§7/§8). Reine Ladeschicht (§3).

import type { Leitcharakter } from './typen';

export interface EntscheidRef {
  key: string;
  zitierung: string;
  regesteKurz: string | null;
  datum: string;
  leitcharakter: Leitcharakter;
  gericht: string;
  kanton: string;
}

export interface NormEntscheidIndex {
  erzeugt: string;
  proNorm: Record<string, EntscheidRef[]>;
}

let indexPromise: Promise<NormEntscheidIndex | null> | null = null;

export async function ladeNormIndex(): Promise<NormEntscheidIndex | null> {
  if (!indexPromise) {
    indexPromise = (async () => {
      try {
        const res = await fetch('/rechtsprechung/norm-index.json');
        if (!res.ok) return null;
        return (await res.json()) as NormEntscheidIndex;
      } catch {
        return null;
      }
    })();
  }
  return indexPromise;
}

/** Bundesgerichtsentscheide zu einem Erlass-Register-key ('OR', 'ZPO' …) oder []. */
export async function rechtsprechungFuerErlass(registerKey: string): Promise<EntscheidRef[]> {
  const idx = await ladeNormIndex();
  return idx?.proNorm[registerKey] ?? [];
}
