// scripts/datenhaltung/build.ts
// QS-DATA E0: baut das persistente DB-Artefakt `daten/lexmetrik.db` (gitignored) aus den
// bestehenden Bund-Normtext-Snapshots. Das Artefakt ist Werk-Zwischenprodukt; massgeblich
// bleibt die amtliche Quelle (CLAUDE.md §7 Build-Regel 6).
import { mkdirSync, rmSync, existsSync } from 'node:fs';
import { oeffneDb, frischesSchema } from './schema';
import { ingestBundNormtext } from './ingest';

const ARTEFAKT = 'daten/lexmetrik.db';

mkdirSync('daten', { recursive: true });
if (existsSync(ARTEFAKT)) rmSync(ARTEFAKT);
const db = oeffneDb(ARTEFAKT);
frischesSchema(db);
const n = ingestBundNormtext(db);
db.close();
console.log(`datenhaltung:build — ${n} Bund-Normtext-Dateien → ${ARTEFAKT}`);
