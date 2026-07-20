// Client-Loader für die Per-Artikel-Historie-Shards (G-HIST-UI). Reine Ladeschicht
// (CLAUDE.md §3): holt den erlass-lokalen Shard `public/normtext/historie/<KEY>.json`
// (aus G-HIST #286, 209 Shards) und reicht die schon STRUKTURIERTEN Ereignisse an
// den Reader durch — KEINE Datums-/Rechtslogik hier, kein Parsen (das lief zur
// Bauzeit in `historie-generieren.ts` + `historie-parse.ts`). Die Komponente
// rendert nur, was der Shard liefert.
//
// Lade-/Cache-Muster byte-gleich zu `ladeLeitfallShard` (norm-index.ts, §5): EIN
// Fetch je Erlass, gecachte laufende Promise, 404 = kein Shard (Erlass ohne
// Historie-Fussnoten bzw. Kanton — kein Fehler, still), transiente Fehler NICHT
// dauerhaft als null gecacht (ein späterer Zugriff darf neu versuchen, §8).

import type { ArtikelHistorie } from './historie-parse';

// Der Per-Artikel-Eintrag ist exakt die Generator-Projektion `ArtikelHistorie`
// ({ giltSeit, aufgehobenSeit?, ereignisse }). Re-Export als Typ (zur Bauzeit
// erased ⇒ der Regex-Parser landet NICHT im Client-Bundle).
export type { ArtikelHistorie, HistorieEreignis, HistorieTyp } from './historie-parse';

/** Erlass-lokaler Historie-Shard, wie ihn `historie-generieren.ts` schreibt. */
export interface HistorieShard {
  erlass: string;
  abdeckung: { fussnoten: number; ereignis: number; referenz: number; unparsed: number };
  /** Artikel-Token (roh, «40_a») → strukturierte Historie. */
  artikel: Record<string, ArtikelHistorie>;
  residuum: Array<{ token: string; nr: string; roh: string }>;
}

const shardPromises = new Map<string, Promise<HistorieShard | null>>();

/**
 * Lädt den Historie-Shard eines Erlasses (lazy, gecacht). `key` = der kanonische
 * Erlass-Key (= Struktur-/Snapshot-Dateiname, «OR», «BGBM»). Liefert null bei
 * 404 (kein Shard — Erlass ohne Änderungs-Fussnoten oder Kanton), Netz-/Parse-
 * Fehler. Kein throw (UI fällt still auf «kein Badge» zurück, §8).
 */
export async function ladeHistorieShard(key: string): Promise<HistorieShard | null> {
  let p = shardPromises.get(key);
  if (!p) {
    p = (async () => {
      try {
        const res = await fetch(`/normtext/historie/${encodeURIComponent(key)}.json`);
        if (res.status === 404) return null; // kein Shard = kein Fehler (still)
        if (!res.ok) { shardPromises.delete(key); return null; }
        return (await res.json()) as HistorieShard;
      } catch {
        // Transienter Netz-/Parse-Fehler NICHT dauerhaft cachen (wie Leitfall-Shard):
        // ein späterer Artikel-Zugriff darf neu versuchen.
        shardPromises.delete(key);
        return null;
      }
    })();
    shardPromises.set(key, p);
  }
  return p;
}

/**
 * Historie EINES Artikels aus dem Shard. Der Shard-Schlüssel ist der ROHE Artikel-
 * Token, wie ihn Snapshot (`e.artikel`) und Struktur-Sidecar führen («40_a») — ein
 * DIREKTER Lookup, keine Token-Normalisierung (beide Seiten stammen aus derselben
 * Extraktion). undefined = Artikel ohne Historie-Fussnote (Ur-Bestand) ⇒ kein Badge.
 */
export function historieFuerArtikel(
  shard: HistorieShard | null | undefined,
  artikel: string,
): ArtikelHistorie | undefined {
  return shard?.artikel[artikel];
}

/** Nur für Tests: Shard-Cache leeren (isolierte Fälle). */
export function _leereHistorieCache(): void {
  shardPromises.clear();
}
