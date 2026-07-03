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

/**
 * Schaufenster-Shard je Erlass (Weiche B, FAHRPLAN-DATENHALTUNG §10(6)/§11.2):
 * `public/rechtsprechung/norm-index/<REGISTERKEY>.json`. Enthält NUR die Artikel-
 * Ebene DIESES Erlasses (Schlüssel = blosses Artikel-Token, der 'REGISTERKEY/'-
 * Präfix ist in den Dateinamen gewandert). Zusätzliche Projektion aus derselben
 * Quelle (proNormArtikel) — das grosse norm-index.json bleibt unverändert. Der
 * ArtikelLeser lädt so nur den Shard SEINES Erlasses, nie das Gesamt-JSON (§15.3).
 */
export interface LeitfallShard {
  erzeugt: string;
  /** Register-key des Erlasses (= Dateiname ohne .json). */
  erlass: string;
  /** Artikel-Token ('41', '52bis') → Leitfälle, absteigend nach `gewicht`. */
  proArtikel: Record<string, LeitfallRef[]>;
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
 *
 * Liest das GESAMT-JSON (536 KB) — bewusst nur für Tests / server-seitige
 * Gegenprüfung. Die UI nimmt den erlass-lokalen Shard (`leitfaelleFuerArtikel`).
 */
export async function rechtsprechungFuerArtikel(registerKey: string, artikel: string): Promise<LeitfallRef[]> {
  const idx = await ladeNormIndex();
  if (!idx?.proNormArtikel) return [];
  return idx.proNormArtikel[`${registerKey}/${normArtikelToken(artikel)}`] ?? [];
}

// ─── Schaufenster-Shards (Weiche B) — erlass-lokal, für den ArtikelLeser ──────
//
// Promise-Cache je Erlass (Repo-Muster wie `indexPromise` oben): der erste Artikel
// eines Erlasses stösst EINEN fetch an, alle weiteren Artikel desselben Erlasses
// teilen ihn. So lädt der Reader nie das Gesamt-JSON eager (§15.3), sondern nur den
// Shard des gerade offenen Erlasses.
const shardPromises = new Map<string, Promise<LeitfallShard | null>>();

export async function ladeLeitfallShard(registerKey: string): Promise<LeitfallShard | null> {
  let p = shardPromises.get(registerKey);
  if (!p) {
    p = (async () => {
      try {
        const res = await fetch(`/rechtsprechung/norm-index/${encodeURIComponent(registerKey)}.json`);
        if (res.status === 404) return null; // kein Shard = Erlass ohne Artikel-Treffer (kein Fehler)
        if (!res.ok) { shardPromises.delete(registerKey); return null; }
        return (await res.json()) as LeitfallShard;
      } catch {
        // Transienter Netz-/Parse-Fehler (W2·7-VZUI-Härtung): NICHT dauerhaft als
        // null cachen — sonst bleiben die Leitfall-Chips bis zum Reload tot, ein
        // späterer Aufrufer (nächster Artikel) darf es erneut versuchen (§8).
        shardPromises.delete(registerKey);
        return null;
      }
    })();
    shardPromises.set(registerKey, p);
  }
  return p;
}

/**
 * Leitfälle zu EINEM Artikel aus dem erlass-lokalen Shard. Ergebnis MUSS zeichen-
 * gleich zu `rechtsprechungFuerArtikel(registerKey, artikel)` sein (dieselbe Quelle
 * proNormArtikel, nur je Erlass gesplittet — Zweitbeweis in artikel-index.test.ts).
 */
export async function leitfaelleFuerArtikel(registerKey: string, artikel: string): Promise<LeitfallRef[]> {
  const shard = await ladeLeitfallShard(registerKey);
  return shard?.proArtikel[normArtikelToken(artikel)] ?? [];
}

/**
 * Shard-Inversion (V1.2, W2·7-VZUI): Entscheid-key → Artikel-Token des Artikels,
 * für den der Entscheid in DIESEM Erlass das höchste topische Gewicht trägt.
 * Speist die «via Art. N»-Sublabels der KontextPanel-Entscheid-Chips (Magic
 * Moment 5: Top-Entscheide am Erlass-Ende MIT Artikelbezug) — aus dem ohnehin
 * geladenen Shard, keine neuen Daten. Rein/deterministisch (§2): bei Gewichts-
 * Gleichstand gewinnt das zuerst gesehene Artikel-Token (stabile Shard-Ordnung).
 */
export function artikelProEntscheid(shard: LeitfallShard): Map<string, string> {
  const best = new Map<string, { artikel: string; gewicht: number }>();
  for (const [artikel, refs] of Object.entries(shard.proArtikel)) {
    for (const r of refs) {
      const b = best.get(r.key);
      if (!b || r.gewicht > b.gewicht) best.set(r.key, { artikel, gewicht: r.gewicht });
    }
  }
  return new Map([...best].map(([key, v]) => [key, v.artikel]));
}

/** Nur für Tests: den Shard-Promise-Cache leeren (sonst leckt er über Testfälle). */
export function _leereShardCache(): void {
  shardPromises.clear();
}
