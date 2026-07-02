// scripts/datenhaltung/check-paritaet.ts
// QS-DATA E0-Tor: beweist, dass jede Bund-Normtext-Datei byte-gleich aus der DB
// rekonstruierbar ist (JSON → DB → JSON-Roundtrip). Rot bei jeder Byte-Abweichung.
import { readFileSync } from 'node:fs';
import { oeffneDb, frischesSchema } from './schema';
import { ingestBundNormtext } from './ingest';
import { projiziereBundDatei, alleBundPfade } from './projektion';

const db = oeffneDb(':memory:');
frischesSchema(db);
const n = ingestBundNormtext(db);
const pfade = alleBundPfade(db);

const diffs: { pfad: string; grund: string }[] = [];
for (const pfad of pfade) {
  const original = readFileSync(pfad, 'utf8');
  let projektion: string;
  try {
    projektion = projiziereBundDatei(db, pfad);
  } catch (e) {
    diffs.push({ pfad, grund: 'Projektion-Fehler: ' + (e as Error).message });
    continue;
  }
  if (projektion !== original) {
    let i = 0;
    while (i < original.length && i < projektion.length && original[i] === projektion[i]) i++;
    diffs.push({
      pfad,
      grund: `Byte-Diff @${i}: orig ${JSON.stringify(original.slice(i, i + 40))} ≠ proj ${JSON.stringify(projektion.slice(i, i + 40))}`,
    });
  }
}
db.close();

if (diffs.length) {
  console.error(`check:paritaet ROT: ${diffs.length}/${pfade.length} Bund-Normtext-Dateien weichen ab:`);
  for (const d of diffs.slice(0, 20)) console.error(`  - ${d.pfad}: ${d.grund}`);
  if (diffs.length > 20) console.error(`  … und ${diffs.length - 20} weitere`);
  process.exit(1);
}
console.log(`check:paritaet grün: ${n} Bund-Normtext-Dateien byte-gleich aus der DB projiziert.`);
