// scripts/datenhaltung/resolve-zitate.ts
// QS-DATA E3/E4 — der idempotente Enrichment-Pass (§3.1). Löst zitat_kanten.nach_id über einen
// indexierten Equi-Join gegen die Entscheid-Match-Keys (bge_key/docket_key/ecli_key) auf, führt
// die konfidenz nach und meldet die Auflösungsquote (gesamt + je match_type). Läuft nach JEDEM
// Ingest-Zyklus; der Graph heilt sich selbst (nie-Big-Bang, §3.2). KEIN norm_rangliste (= E4).
//
// Idempotenz-Anker: `UPDATE … WHERE nach_id IS NULL` (nur Unaufgelöste), konfidenz aus (nach_id,
// match_type) neu abgeleitet (Spiegel von masse-mapping.ts kanteKonfidenz). Zwei Läufe → gleicher
// Zustand → gleiches Dump-Manifest.
import { DatabaseSync } from 'node:sqlite';

export interface TypQuote {
  match_type: string;
  total: number;
  aufgeloest: number;
}
export interface ResolveReport {
  gesamt: number;
  aufgeloest: number;
  quote: number;
  jeTyp: TypQuote[];
  vonImKorpus: number;
  nachOrphan: number;
  normReferenzen: number;
  normReferenzenAufgeloest: number;
  resolveMs: number;
}

function anz(db: DatabaseSync, sql: string): number {
  return (db.prepare(sql).get() as { n: number }).n;
}

/** Idempotenter Resolve-Pass auf einer geöffneten masse.db. Gibt den Quoten-Report zurück. */
export function resolveZitate(db: DatabaseSync): ResolveReport {
  const t0 = Number(process.hrtime.bigint() / 1_000_000n);

  // key_map: jeder Match-Key → MIN(id) (Kollisions-deterministisch). bge_key + docket_key + ecli_key.
  db.exec(`
    DROP TABLE IF EXISTS key_map;
    CREATE TEMP TABLE key_map (k TEXT PRIMARY KEY, id TEXT NOT NULL);
    INSERT INTO key_map (k, id)
      SELECT k, MIN(id) FROM (
        SELECT bge_key    AS k, id FROM entscheide WHERE bge_key    IS NOT NULL
        UNION ALL
        SELECT docket_key AS k, id FROM entscheide WHERE docket_key IS NOT NULL
        UNION ALL
        SELECT ecli_key   AS k, id FROM entscheide WHERE ecli_key   IS NOT NULL
      ) GROUP BY k;
  `);
  // Auflösung (indexierter Equi-Join, getragen von ix_zitat_unresolved) — nur Unaufgelöste.
  db.exec(`
    UPDATE zitat_kanten
       SET nach_id = (SELECT id FROM key_map WHERE k = zitat_kanten.ziel_key)
     WHERE nach_id IS NULL;
  `);
  // konfidenz idempotent nachführen (Spiegel kanteKonfidenz): unresolved / regex-niedrig (pincite) / regex-hoch.
  db.exec(`
    UPDATE zitat_kanten SET konfidenz = CASE
      WHEN nach_id IS NULL            THEN 'unresolved'
      WHEN match_type = 'bge_pincite' THEN 'regex-niedrig'
      ELSE 'regex-hoch' END;
  `);
  db.exec('DROP TABLE IF EXISTS key_map;');
  const resolveMs = Number(process.hrtime.bigint() / 1_000_000n) - t0;

  const gesamt = anz(db, 'SELECT COUNT(*) AS n FROM zitat_kanten');
  const aufgeloest = anz(db, 'SELECT COUNT(*) AS n FROM zitat_kanten WHERE nach_id IS NOT NULL');
  const jeTyp = (
    db
      .prepare(
        `SELECT COALESCE(match_type,'(null)') AS match_type,
                COUNT(*) AS total,
                SUM(CASE WHEN nach_id IS NOT NULL THEN 1 ELSE 0 END) AS aufgeloest
           FROM zitat_kanten GROUP BY match_type ORDER BY total DESC`,
      )
      .all() as Array<{ match_type: string; total: number; aufgeloest: number }>
  );
  const vonImKorpus = anz(
    db,
    'SELECT COUNT(*) AS n FROM zitat_kanten k WHERE EXISTS (SELECT 1 FROM entscheide e WHERE e.id = k.von_id)',
  );
  const nachOrphan = anz(
    db,
    'SELECT COUNT(*) AS n FROM zitat_kanten k WHERE k.nach_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM entscheide e WHERE e.id = k.nach_id)',
  );
  const normReferenzen = anz(db, 'SELECT COUNT(*) AS n FROM norm_referenzen');
  const normReferenzenAufgeloest = anz(db, "SELECT COUNT(*) AS n FROM norm_referenzen WHERE konfidenz != 'unresolved'");

  return {
    gesamt,
    aufgeloest,
    quote: gesamt ? aufgeloest / gesamt : 0,
    jeTyp,
    vonImKorpus,
    nachOrphan,
    normReferenzen,
    normReferenzenAufgeloest,
    resolveMs,
  };
}

// ── CLI ──────────────────────────────────────────────────────────────────────────────────────
if (!process.env.VITEST) {
  const MASSE_DB = process.env.MASSE_DB ?? 'daten/masse.db';
  const db = new DatabaseSync(MASSE_DB);
  db.exec('PRAGMA journal_mode = OFF');
  db.exec('PRAGMA synchronous = OFF');
  db.exec('PRAGMA temp_store = MEMORY');
  db.exec('PRAGMA cache_size = -524288');
  const r = resolveZitate(db);
  db.close();

  console.log(`resolve-zitate (${MASSE_DB}) — ${r.resolveMs} ms`);
  console.log(`  zitat_kanten gesamt:  ${r.gesamt}`);
  console.log(`  aufgelöst (nach_id):  ${r.aufgeloest}  → Quote ${r.quote.toFixed(4)}`);
  console.log(`  je match_type:`);
  for (const t of r.jeTyp) {
    console.log(`    ${t.match_type.padEnd(12)} ${String(t.aufgeloest).padStart(9)}/${String(t.total).padStart(9)} = ${(t.total ? t.aufgeloest / t.total : 0).toFixed(4)}`);
  }
  console.log(`  von_id im Korpus:     ${r.vonImKorpus}/${r.gesamt} = ${(r.gesamt ? r.vonImKorpus / r.gesamt : 0).toFixed(4)}  (Rest = Kantons-Quellen, heilt mit E5)`);
  console.log(`  nach_id-Orphans (Bug-Invariante, 0 erwartet): ${r.nachOrphan}`);
  console.log(`  norm_referenzen: ${r.normReferenzen} · konfidenz!=unresolved ${r.normReferenzenAufgeloest} (Quote ${(r.normReferenzen ? r.normReferenzenAufgeloest / r.normReferenzen : 0).toFixed(4)})`);

  if (r.nachOrphan > 0) {
    console.error(`FEHLER: ${r.nachOrphan} aufgelöste Kanten zeigen auf einen nicht existierenden Entscheid.`);
    process.exit(1);
  }
}
