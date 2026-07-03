// scripts/datenhaltung/build.ts
// QS-DATA E0+/E2-Vorarbeiten: baut die drei persistenten, gitignorten DB-Artefakte je Doktyp (§1/§2.2):
//   daten/normtext.db · daten/rechtsprechung.db · daten/soft-law.db.
// Das E0-Einzelartefakt daten/lexmetrik.db entfällt ersatzlos (Neuerzeugung billig). Die
// Artefakte sind Werk-Zwischenprodukt; massgeblich bleibt die amtliche Quelle (CLAUDE.md §7/6).
//
// E2-Vorarbeiten (W2·6-DATA): zusätzlich die HOT-FTS5-Tabellen (fts.ts, §3/§11.5) —
// fts_artikel (normtext.db) + fts_entscheide_schaufenster (rechtsprechung.db). Die COLD-
// Masse (fts_entscheide_masse) entsteht erst mit E3 auf dem Self-Host (nicht hier).
import { mkdirSync, rmSync, existsSync, statSync } from 'node:fs';
import { oeffneDb, frischesSchema, type Doktyp } from './schema';
import {
  ingestNormtext,
  ingestNormtextZiel,
  ingestRechtsprechung,
  ingestSoftLaw,
  type Zaehler,
} from './ingest';
import { baueFtsArtikel, baueFtsEntscheideSchaufenster } from './fts';
import type { DatabaseSync } from 'node:sqlite';

// Normtext: Blob-Tabellen (Paritäts-Beweis) + ab E1 die ECHTEN Ziel-Tabellen (Spalten-Weg).
function ingestNormtextVoll(db: DatabaseSync): Zaehler {
  return { ...ingestNormtext(db), ...ingestNormtextZiel(db) };
}

const ALT_ARTEFAKT = 'daten/lexmetrik.db';
const ARTEFAKTE: {
  pfad: string;
  doktyp: Doktyp;
  ingest: (db: DatabaseSync) => Zaehler;
  fts?: (db: DatabaseSync) => Zaehler;
}[] = [
  { pfad: 'daten/normtext.db', doktyp: 'normtext', ingest: ingestNormtextVoll, fts: (db) => ({ 'fts_artikel': baueFtsArtikel(db) }) },
  { pfad: 'daten/rechtsprechung.db', doktyp: 'rechtsprechung', ingest: ingestRechtsprechung, fts: (db) => ({ 'fts_entscheide_schaufenster': baueFtsEntscheideSchaufenster(db) }) },
  { pfad: 'daten/soft-law.db', doktyp: 'soft-law', ingest: ingestSoftLaw },
];

function mib(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(2) + ' MiB';
}

mkdirSync('daten', { recursive: true });
if (existsSync(ALT_ARTEFAKT)) rmSync(ALT_ARTEFAKT); // E0-Monolith ersatzlos entfernt

let hotBytes = 0; // Summe der FTS-tragenden HOT-Repliken (Budget < 1 GB, §11.5).
for (const { pfad, doktyp, ingest, fts } of ARTEFAKTE) {
  if (existsSync(pfad)) rmSync(pfad);
  const db = oeffneDb(pfad);
  frischesSchema(db, doktyp);
  const z = ingest(db);
  const zFts = fts ? fts(db) : {};
  db.close();
  const bytes = statSync(pfad).size;
  if (fts) hotBytes += bytes;
  const teile = Object.entries({ ...z, ...zFts }).map(([k, v]) => `${k} ${v}`).join(' · ');
  console.log(`datenhaltung:build — ${pfad} (${teile}) [${mib(bytes)}]`);
}
// Grössen-Messung (§11.5): HOT-Replika (fts_artikel + fts_entscheide_schaufenster) gegen das < 1-GB-Budget.
console.log(
  `datenhaltung:build — HOT-Replika (FTS-tragend) = ${mib(hotBytes)} / Budget 1024 MiB → ${
    hotBytes < 1024 * 1024 * 1024 ? 'OK' : 'ÜBERSCHRITTEN'
  }.`,
);
