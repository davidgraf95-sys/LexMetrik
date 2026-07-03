// scripts/datenhaltung/build.ts
// QS-DATA E0+: baut die drei persistenten, gitignorten DB-Artefakte je Doktyp (§1/§2.2):
//   daten/normtext.db · daten/rechtsprechung.db · daten/soft-law.db.
// Das E0-Einzelartefakt daten/lexmetrik.db entfällt ersatzlos (Neuerzeugung billig). Die
// Artefakte sind Werk-Zwischenprodukt; massgeblich bleibt die amtliche Quelle (CLAUDE.md §7/6).
import { mkdirSync, rmSync, existsSync } from 'node:fs';
import { oeffneDb, frischesSchema, type Doktyp } from './schema';
import { ingestNormtext, ingestRechtsprechung, ingestSoftLaw, type Zaehler } from './ingest';
import type { DatabaseSync } from 'node:sqlite';

const ALT_ARTEFAKT = 'daten/lexmetrik.db';
const ARTEFAKTE: { pfad: string; doktyp: Doktyp; ingest: (db: DatabaseSync) => Zaehler }[] = [
  { pfad: 'daten/normtext.db', doktyp: 'normtext', ingest: ingestNormtext },
  { pfad: 'daten/rechtsprechung.db', doktyp: 'rechtsprechung', ingest: ingestRechtsprechung },
  { pfad: 'daten/soft-law.db', doktyp: 'soft-law', ingest: ingestSoftLaw },
];

mkdirSync('daten', { recursive: true });
if (existsSync(ALT_ARTEFAKT)) rmSync(ALT_ARTEFAKT); // E0-Monolith ersatzlos entfernt

for (const { pfad, doktyp, ingest } of ARTEFAKTE) {
  if (existsSync(pfad)) rmSync(pfad);
  const db = oeffneDb(pfad);
  frischesSchema(db, doktyp);
  const z = ingest(db);
  db.close();
  const teile = Object.entries(z).map(([k, v]) => `${k} ${v}`).join(' · ');
  console.log(`datenhaltung:build — ${pfad} (${teile})`);
}
