// scripts/datenhaltung/masse-ingest.ts
// QS-DATA E3 — produktiver BGer-Massen-Import (Auftrag §5 E3). Liest die gepinnten voilaj-Parquete
// (Revision e2a0b95bfc1e8755db20311220787fb2516c8d70) und baut das server-only Artefakt
// `daten/masse.db`: entscheide (§7-vollständig, kuratierung='maschinell') + zitat_kanten (roh) +
// norm_referenzen (roh). Die Kanten-Auflösung (nach_id) macht der separate Pass resolve-zitate.ts.
//
// Bewährte B2-POC-Mechanik (bibliothek/register/B2-POC-2026-07-03.md): Row-Group-Streaming
// (hyparquet), 1 Transaktion je Row-Group, PRAGMAs (OFF/OFF/MEMORY/512 MiB), Load-then-index.
// EINE Kanonisierung via masse-mapping.ts (nie zweitimplementiert). Kein cold-FTS (VPS-Schritt).
//
// Pfade (im Haupt-Baum wie im Worktree lauffähig): MASSE_POC_DIR (Default 'daten/poc') READ-ONLY,
// MASSE_DB (Default 'daten/masse.db'). Der Worktree hat kein daten/poc → Absolut-Pfad übergeben.
import { rmSync, mkdirSync, statSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { asyncBufferFromFile, parquetMetadataAsync, parquetReadObjects } from 'hyparquet';
import { compressors } from 'hyparquet-compressors';
import {
  entscheidRow,
  zitatRow,
  normRefRow,
  type EntscheidParquet,
  type ZitatParquet,
  type NormRefParquet,
} from './masse-mapping';
import { SCHEMA_MASSE, SCHEMA_ROH, DEDUP_MASSE, INDIZES_MASSE, MASSE_PRAGMAS } from './masse-schema';

const POC_DIR = process.env.MASSE_POC_DIR ?? 'daten/poc';
const OUT_DB = process.env.MASSE_DB ?? 'daten/masse.db';
const LIMIT = process.env.MASSE_LIMIT ? Number(process.env.MASSE_LIMIT) : Infinity;

function jetzt(): number {
  return Number(process.hrtime.bigint() / 1_000_000n);
}
function mib(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1) + ' MiB';
}

/** Row-Group-Streaming: hält immer nur EINE Row-Group im RAM (B2-POC-Muster). */
async function jeRowGroup<T>(
  datei: string,
  columns: string[],
  aufBatch: (rows: T[]) => void,
): Promise<number> {
  const file = await asyncBufferFromFile(datei);
  const meta = await parquetMetadataAsync(file);
  let start = 0;
  let gesehen = 0;
  for (const rg of meta.row_groups) {
    const anzahl = Number(rg.num_rows);
    let rows = (await parquetReadObjects({
      file,
      metadata: meta,
      columns,
      rowStart: start,
      rowEnd: start + anzahl,
      compressors,
    })) as T[];
    if (gesehen + rows.length > LIMIT) rows = rows.slice(0, LIMIT - gesehen);
    aufBatch(rows);
    gesehen += rows.length;
    start += anzahl;
    if (gesehen >= LIMIT) break;
  }
  return gesehen;
}

async function main(): Promise<void> {
  mkdirSync(dirname(OUT_DB), { recursive: true });
  rmSync(OUT_DB, { force: true });
  const db = new DatabaseSync(OUT_DB);
  for (const p of MASSE_PRAGMAS) db.exec(p);
  db.exec(SCHEMA_MASSE);
  db.exec(SCHEMA_ROH);

  // ── (1) Entscheide (INSERT OR IGNORE → Dedup über den kanonischen id-PK) ────────────────────
  const tEnt = jetzt();
  const insEnt = db.prepare(
    `INSERT OR IGNORE INTO entscheide
       (id,ecli,ecli_key,gericht,kanton,nummer,bge_referenz,bge_key,docket_key,datum,publikation,
        sprache,rechtsgebiet,leitcharakter,kuratierung,regeste_json,full_text,quelle,quelle_url,abgerufen,sha)
     VALUES
       (@id,@ecli,@ecli_key,@gericht,@kanton,@nummer,@bge_referenz,@bge_key,@docket_key,@datum,@publikation,
        @sprache,@rechtsgebiet,@leitcharakter,@kuratierung,@regeste_json,@full_text,@quelle,@quelle_url,@abgerufen,@sha)`,
  );
  const entCols = [
    'decision_id', 'court', 'canton', 'docket_number', 'bge_reference', 'decision_date',
    'publication_date', 'language', 'legal_area', 'regeste', 'full_text', 'source_url', 'scraped_at',
  ];
  let entGelesen = 0;
  for (const datei of ['bger.parquet', 'bge.parquet']) {
    const n = await jeRowGroup<EntscheidParquet>(`${POC_DIR}/${datei}`, entCols, (rows) => {
      db.exec('BEGIN');
      for (const r of rows) insEnt.run(entscheidRow(r) as unknown as Record<string, unknown>);
      db.exec('COMMIT');
    });
    entGelesen += n;
    console.log(`  ${datei}: ${n} Zeilen gelesen`);
  }
  const entEingefuegt = (db.prepare('SELECT COUNT(*) AS n FROM entscheide').get() as { n: number }).n;
  const entMs = jetzt() - tEnt;

  // ── (2) Zitat-Kanten (roh → citations.parquet) ──────────────────────────────────────────────
  const tZit = jetzt();
  const insZit = db.prepare(
    `INSERT INTO zitat_roh (von_id,ziel_key,nach_zitierung,match_type)
     VALUES (@von_id,@ziel_key,@nach_zitierung,@match_type)`,
  );
  const zitGelesen = await jeRowGroup<ZitatParquet>(
    `${POC_DIR}/citations.parquet`,
    ['source_decision_id', 'target_ref', 'match_type', 'confidence_score'],
    (rows) => {
      db.exec('BEGIN');
      for (const r of rows) insZit.run(zitatRow(r) as unknown as Record<string, unknown>);
      db.exec('COMMIT');
    },
  );
  const zitMs = jetzt() - tZit;
  console.log(`  citations.parquet: ${zitGelesen} Zeilen gelesen`);

  // ── (3) Norm-Referenzen (roh → statute_references.parquet) ──────────────────────────────────
  const tRef = jetzt();
  const insRef = db.prepare(
    `INSERT INTO normref_roh (quelldok_id,erlass_key,artikel,zitat_key,roh_zitat)
     VALUES (@quelldok_id,@erlass_key,@artikel,@zitat_key,@roh_zitat)`,
  );
  const refGelesen = await jeRowGroup<NormRefParquet>(
    `${POC_DIR}/statute_references.parquet`,
    ['decision_id', 'law_code', 'article'],
    (rows) => {
      db.exec('BEGIN');
      for (const r of rows) insRef.run(normRefRow(r) as unknown as Record<string, unknown>);
      db.exec('COMMIT');
    },
  );
  const refMs = jetzt() - tRef;
  console.log(`  statute_references.parquet: ${refGelesen} Zeilen gelesen`);

  // ── (4) UNIQUE-Dedup (§3.2, deterministischer GROUP-BY-MIN(id)-Set-Pass) + Indizes ──────────
  const tDedup = jetzt();
  db.exec(DEDUP_MASSE);
  const dedupMs = jetzt() - tDedup;
  const zitDedup = (db.prepare('SELECT COUNT(*) AS n FROM zitat_kanten').get() as { n: number }).n;
  const refDedup = (db.prepare('SELECT COUNT(*) AS n FROM norm_referenzen').get() as { n: number }).n;

  const tIdx = jetzt();
  db.exec(INDIZES_MASSE);
  const idxMs = jetzt() - tIdx;
  db.close();

  const bytes = statSync(OUT_DB).size;
  console.log('\nmasse-ingest FERTIG:');
  console.log(`  entscheide:      ${entGelesen} gelesen → ${entEingefuegt} eingefügt (Dedup Δ ${entGelesen - entEingefuegt})  [${entMs} ms]`);
  console.log(`  zitat_kanten:    ${zitGelesen} gelesen → ${zitDedup} nach UNIQUE(von_id,ziel_key)  (Dedup Δ ${zitGelesen - zitDedup})  [${zitMs} ms]`);
  console.log(`  norm_referenzen: ${refGelesen} gelesen → ${refDedup} nach UNIQUE(quelldok,erlass,artikel,zitat_key)  (Dedup Δ ${refGelesen - refDedup})  [${refMs} ms]`);
  console.log(`  dedup ${dedupMs} ms · indizes ${idxMs} ms · masse.db ${mib(bytes)}`);
  console.log(`  → resolve mit: MASSE_DB=${OUT_DB} npm run datenhaltung:resolve-zitate`);
}

main().catch((e) => {
  console.error('masse-ingest FEHLER:', e);
  process.exit(1);
});
