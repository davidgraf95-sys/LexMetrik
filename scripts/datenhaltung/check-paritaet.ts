// scripts/datenhaltung/check-paritaet.ts
// QS-DATA E0+-Tor: beweist, dass JEDE committete Datei byte-gleich aus der DB rekonstruierbar
// ist (JSON → DB → JSON-Roundtrip), über ALLE Dateiklassen und die drei partitionierten DBs
// (§2.2: normtext · rechtsprechung · soft-law). Rot bei jeder Byte-Abweichung, mit Klassen-
// Zählern in der Grün-Meldung.
import { readFileSync } from 'node:fs';
import { oeffneDb, frischesSchema } from './schema';
import {
  ingestNormtext, ingestRechtsprechung, ingestSoftLaw, ungedeckteTopLevelJson, type Zaehler,
} from './ingest';
import {
  projiziereEintragDatei,
  projiziereDokument,
  alleEintragPfade,
  alleDokumentPfade,
} from './projektion';
import type { DatabaseSync } from 'node:sqlite';

const diffs: { pfad: string; grund: string }[] = [];
let geprueft = 0;

function vergleiche(pfad: string, projektionFn: (p: string) => string): void {
  const original = readFileSync(pfad, 'utf8');
  let projektion: string;
  try {
    projektion = projektionFn(pfad);
  } catch (e) {
    diffs.push({ pfad, grund: 'Projektion-Fehler: ' + (e as Error).message });
    return;
  }
  geprueft++;
  if (projektion !== original) {
    let i = 0;
    while (i < original.length && i < projektion.length && original[i] === projektion[i]) i++;
    diffs.push({
      pfad,
      grund: `Byte-Diff @${i}: orig ${JSON.stringify(original.slice(i, i + 40))} ≠ proj ${JSON.stringify(projektion.slice(i, i + 40))}`,
    });
  }
}

function pruefeDb(db: DatabaseSync): void {
  for (const pfad of alleEintragPfade(db)) vergleiche(pfad, (p) => projiziereEintragDatei(db, p));
  for (const pfad of alleDokumentPfade(db)) vergleiche(pfad, (p) => projiziereDokument(db, p));
}

// Drei partitionierte In-Memory-DBs (je Doktyp), befüllen, projizieren, byte-vergleichen.
const dbN = oeffneDb();
frischesSchema(dbN, 'normtext');
const zN = ingestNormtext(dbN);
pruefeDb(dbN);
dbN.close();

const dbR = oeffneDb();
frischesSchema(dbR, 'rechtsprechung');
const zR = ingestRechtsprechung(dbR);
pruefeDb(dbR);
dbR.close();

const dbS = oeffneDb();
frischesSchema(dbS, 'soft-law');
const zS = ingestSoftLaw(dbS);
pruefeDb(dbS);
dbS.close();

const zaehler: Zaehler = { ...zN, ...zR, ...zS };

// ── §17 · VOLLSTÄNDIGKEIT DER FESTEN LISTEN (12.9.2026) ──────────────────────
// Der Byte-Roundtrip oben beweist nur etwas über Dateien, die überhaupt in die
// DB kamen. Eine committete Datei, die in keiner Ingest-Liste steht, ist für ihn
// unsichtbar — dreimal in Folge fiel genau das erst bei der Gegenprüfung auf
// (norm-index-erlasse, normkeys-kanton, Register-Aufteilung), beim vierten Mal
// (Deckungs-Sicht) wurde daraus dieser Wächter. Herleitung: ./ingest.ts.
const ungedeckt = ungedeckteTopLevelJson();
if (ungedeckt.length) {
  console.error(
    `check:paritaet ROT: ${ungedeckt.length} committete Datei(en) stehen in keiner Ingest-Liste `
    + 'und laufen damit still an Parität und Datenhaltung vorbei:',
  );
  for (const u of ungedeckt) console.error(`  - ${u.pfad} → gehört in ${u.liste} (scripts/datenhaltung/ingest.ts)`);
  console.error(
    '  Eintragen, nicht globben: die Liste sagt, in WELCHE Doktyp-DB die Datei gehört (§5).',
  );
  process.exit(1);
}

if (diffs.length) {
  console.error(`check:paritaet ROT: ${diffs.length} Datei(en) weichen ab:`);
  for (const d of diffs.slice(0, 20)) console.error(`  - ${d.pfad}: ${d.grund}`);
  if (diffs.length > 20) console.error(`  … und ${diffs.length - 20} weitere`);
  process.exit(1);
}

const teile = Object.entries(zaehler).map(([k, v]) => `${k} ${v}`).join(' · ');
console.log(
  `check:paritaet grün: ${geprueft} Dateien byte-gleich aus der DB projiziert (${teile}); `
  + 'keine committete Top-Level-JSON ohne Ingest-Eintrag.',
);
