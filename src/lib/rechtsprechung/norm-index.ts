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

/**
 * Per-Artikel-Leitfall (W3): EntscheidRef + `gewicht` = TOPISCH gebundene In-degree
 * — die Anzahl ANDERER Entscheide, die DENSELBEN Artikel zitieren UND diesen
 * Entscheid nennen. Kein globaler Zitationszähler, kein PageRank (das würde
 * prozessuale Megafälle nach oben spülen); die Zahl misst nur die Zentralität
 * INNERHALB der Rechtsprechung zu genau diesem Artikel. Build-time, deterministisch.
 */
export interface LeitfallRef extends EntscheidRef {
  gewicht: number;
}

export interface NormEntscheidIndex {
  erzeugt: string;
  /** Erlass-Ebene: Register-key ('OR', 'ZPO') → Bundesgerichtsentscheide (unverändert). */
  proNorm: Record<string, EntscheidRef[]>;
  /**
   * Artikel-Ebene (W3): Schlüssel 'REGISTERKEY/ARTIKEL' (z.B. 'OR/41', 'STGB/12a'),
   * ARTIKEL = whitespace-freies Kleinschrift-Token wie in `zitat-extraktion.ts`
   * ('41', '52bis', '8a'). Absteigend nach `gewicht` (topische In-degree) sortiert.
   * Optional/additiv — ein Alt-Index ohne dieses Feld bricht die Erlass-Ebene nicht.
   */
  proNormArtikel?: Record<string, LeitfallRef[]>;
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

/** Artikel-Token normalisieren wie im Build (`zitat-extraktion.ts`): klein, whitespace-frei. */
export function normArtikelToken(artikel: string): string {
  return String(artikel).toLowerCase().replace(/\s+/g, '');
}

/**
 * Leitfälle zu genau EINEM Artikel: Register-key + Artikel-Token ('OR', '41').
 * Absteigend nach topischer In-degree (`gewicht`) vorsortiert. [] wenn unbekannt
 * oder wenn der Index (Alt-Fassung) keine Artikel-Ebene trägt.
 */
export async function rechtsprechungFuerArtikel(registerKey: string, artikel: string): Promise<LeitfallRef[]> {
  const idx = await ladeNormIndex();
  if (!idx?.proNormArtikel) return [];
  return idx.proNormArtikel[`${registerKey}/${normArtikelToken(artikel)}`] ?? [];
}
