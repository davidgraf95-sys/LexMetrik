// scripts/datenhaltung/masse-korpus-bruecke.ts
// QS-DATA E4 — geteilte Brücke Register-Korpus ↔ masse.db (§5, EINE Quelle).
// Bildet einen kuratierten Register-key (`bge_150_IV_188`, `bger_1C_641_2022`) auf
// die masse.db-`entscheide.id` ab UND belegt, ob ein Register-Entscheid NEUER ist als
// der gepinnte voilaj-Snapshot (Band-/Seiten-/Datums-Frontier). Wird identisch vom
// Oracle-Tor (check-rangliste-oracle.ts) UND von der V1b-Shard-Regeneration
// (backe-rangliste-shards.ts) genutzt — sonst driftete die «e4»-Provenienz-Entscheidung
// von der Oracle-Klassifikation ab (ein «e4»-Shard, den das Oracle als UNERKLÄRT sähe).
import type { DatabaseSync } from 'node:sqlite';
import { bgeMatchKey } from './normalisiere-zitat';
import { docketKey } from './masse-mapping';

export interface RegisterEntscheid {
  nummer: string;
  bgeReferenz: string | null;
  datum: string;
}

export interface MasseKorpusBruecke {
  /** Register-key → masse.db entscheide.id, oder null (nicht im Snapshot). */
  masseId(corpusKey: string): string | null;
  /** Ist der Register-Entscheid NEUER als der gepinnte voilaj-Snapshot? (Beweis, nicht Behauptung.) */
  istNeuerAlsSnapshot(corpusKey: string): boolean;
  maxVol: number;
  maxDatum: string;
}

/**
 * Baut die Brücke aus der geöffneten masse.db + der Register-Zuordnung. Deterministisch:
 * je Match-Key gewinnt die ZUERST gesehene id (Iterations-Reihenfolge der entscheide-Tabelle
 * ist stabil), identisch zum bisherigen Oracle-Aufbau.
 */
export function baueMasseKorpusBruecke(
  db: DatabaseSync,
  regByKey: ReadonlyMap<string, RegisterEntscheid>,
): MasseKorpusBruecke {
  const idByBge = new Map<string, string>();
  const idByDocket = new Map<string, string>();
  const maxSeiteByVolAbt = new Map<string, number>(); // '151-III' → 521 (Snapshot-Frontier je Band/Abteilung)
  let maxVol = 0;
  let maxDatum = '';
  for (const r of db.prepare('SELECT id, bge_key, docket_key, datum FROM entscheide').iterate() as Iterable<{ id: string; bge_key: string | null; docket_key: string | null; datum: string | null }>) {
    if (r.bge_key && !idByBge.has(r.bge_key)) idByBge.set(r.bge_key, r.id);
    if (r.docket_key && !idByDocket.has(r.docket_key)) idByDocket.set(r.docket_key, r.id);
    const mb = /^(\d+)-([IVXAB]+)-(\d+)$/.exec(r.bge_key ?? '');
    if (mb) {
      maxVol = Math.max(maxVol, +mb[1]);
      const va = `${mb[1]}-${mb[2]}`;
      maxSeiteByVolAbt.set(va, Math.max(maxSeiteByVolAbt.get(va) ?? 0, +mb[3]));
    }
    if (r.datum && r.datum > maxDatum && /^\d{4}-/.test(r.datum)) maxDatum = r.datum;
  }

  function masseId(corpusKey: string): string | null {
    const reg = regByKey.get(corpusKey);
    if (!reg) return null;
    const bge = bgeMatchKey(reg.bgeReferenz ?? '') ?? bgeMatchKey(reg.nummer);
    if (bge && idByBge.has(bge)) return idByBge.get(bge)!;
    const dk = docketKey(reg.nummer);
    if (dk && idByDocket.has(dk)) return idByDocket.get(dk)!;
    return null;
  }

  function istNeuerAlsSnapshot(corpusKey: string): boolean {
    const reg = regByKey.get(corpusKey);
    if (!reg) return false;
    const bge = bgeMatchKey(reg.bgeReferenz ?? '') ?? bgeMatchKey(reg.nummer);
    const mb = bge ? /^(\d+)-([IVXAB]+)-(\d+)$/.exec(bge) : null;
    if (mb) {
      const vol = +mb[1];
      if (vol > maxVol) return true;
      const front = maxSeiteByVolAbt.get(`${mb[1]}-${mb[2]}`);
      if (front !== undefined && +mb[3] > front) return true; // Band-Schwanz nach Scrape
    }
    return !!reg.datum && reg.datum > maxDatum;
  }

  return { masseId, istNeuerAlsSnapshot, maxVol, maxDatum };
}
