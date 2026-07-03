// scripts/datenhaltung/doppellauf.ts
// QS-DATA E1: der Byte-Beweis des Generator-Flips OHNE Netz und OHNE public/**-Änderung.
//
// Leitplanke (David): «Gesetze-Update RUHT» — der Flip wird bewiesen, nicht ausgeführt.
// Darum der vom Fahrplan freigegebene Reverse-Ingest-Weg (committete JSONs → DB-Zeilen →
// Projektion = DERSELBE Codepfad wie die Generator-Projektion):
//   ALT = committete Bund-Datei re-serialisiert (JSON.parse → JSON.stringify(…,2)) = alter Direktpfad.
//   NEU = dieselbe Datei über schreibeErlass() → projiziereErlass() (Spalten-Weg).
// Verglichen wird ALT == NEU byte-gleich, zusätzlich NEU == committete Bytes.
//
// Läuft ≥3× in Sandbox-Verzeichnisse (/tmp/e1-doppellauf/{alt,neu}); die sha der
// Gesamtausgabe MUSS über alle Läufe identisch sein (Determinismus §2).
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { oeffneDb, frischesSchema } from './schema';
import { ingestNormtextZiel } from './ingest';
import { projiziereErlass, alleErlassFassungen } from './erlass-rows';

const BUND_DIR = 'public/normtext/bund';
const SANDBOX = '/tmp/e1-doppellauf';
const LAEUFE = 3;

interface LaufErgebnis {
  dateien: number;
  artikel: number;
  neuGesamtSha: string;
  altUngleichNeu: string[];
  neuUngleichCommittet: string[];
}

function einLauf(schreibeSandbox: boolean): LaufErgebnis {
  const db = oeffneDb();
  frischesSchema(db, 'normtext');
  const z = ingestNormtextZiel(db);
  const artikel = z['Ziel-Artikel (Bund)'];

  if (schreibeSandbox) {
    rmSync(SANDBOX, { recursive: true, force: true });
    mkdirSync(join(SANDBOX, 'alt'), { recursive: true });
    mkdirSync(join(SANDBOX, 'neu'), { recursive: true });
  }

  const altUngleichNeu: string[] = [];
  const neuUngleichCommittet: string[] = [];
  const gesamt = createHash('sha256');
  let dateien = 0;

  for (const { key, fassungsToken } of alleErlassFassungen(db)) {
    const committetPfad = join(BUND_DIR, `${key}.json`);
    const committet = readFileSync(committetPfad, 'utf8');
    const alt = JSON.stringify(JSON.parse(committet), null, 2); // alter Direktpfad (Re-Serialisierung)
    const neu = projiziereErlass(db, key, fassungsToken);

    if (alt !== neu) altUngleichNeu.push(key);
    if (neu !== committet) neuUngleichCommittet.push(key);
    gesamt.update(`${key}\u0000`).update(neu).update('\u0000');
    dateien += 1;

    if (schreibeSandbox) {
      writeFileSync(join(SANDBOX, 'alt', `${key}.json`), alt, 'utf8');
      writeFileSync(join(SANDBOX, 'neu', `${key}.json`), neu, 'utf8');
    }
  }
  db.close();

  return { dateien, artikel, neuGesamtSha: gesamt.digest('hex'), altUngleichNeu, neuUngleichCommittet };
}

const committeteDateien = readdirSync(BUND_DIR).filter((f) => f.endsWith('.json')).length;
const ergebnisse: LaufErgebnis[] = [];
for (let i = 0; i < LAEUFE; i++) ergebnisse.push(einLauf(i === 0));

console.log('── E1-Doppellauf (alt=Direktpfad vs. neu=DB→Projektion) ─────────────');
console.log(`Committete Bund-Dateien: ${committeteDateien}`);
let hartRot = false;
for (let i = 0; i < ergebnisse.length; i++) {
  const e = ergebnisse[i];
  const diff = e.altUngleichNeu.length + e.neuUngleichCommittet.length;
  console.log(
    `Lauf ${i + 1}: ${e.dateien} Dateien · ${e.artikel} Artikel · sha=${e.neuGesamtSha.slice(0, 16)}… · ` +
      `alt≠neu ${e.altUngleichNeu.length} · neu≠committet ${e.neuUngleichCommittet.length}`,
  );
  if (diff > 0) {
    hartRot = true;
    if (e.altUngleichNeu.length) console.error(`  alt≠neu: ${e.altUngleichNeu.slice(0, 10).join(', ')}`);
    if (e.neuUngleichCommittet.length) console.error(`  neu≠committet: ${e.neuUngleichCommittet.slice(0, 10).join(', ')}`);
  }
}

const shaMenge = new Set(ergebnisse.map((e) => e.neuGesamtSha));
const dateiMenge = new Set(ergebnisse.map((e) => e.dateien));
if (shaMenge.size !== 1) {
  hartRot = true;
  console.error(`NICHT deterministisch: ${shaMenge.size} verschiedene Gesamt-shas über ${LAEUFE} Läufe.`);
}
if (dateiMenge.size !== 1 || ergebnisse[0].dateien !== committeteDateien) {
  hartRot = true;
  console.error(`Datei-Abdeckung inkonsistent: ${[...dateiMenge].join('/')} vs. committet ${committeteDateien}.`);
}

if (hartRot) {
  console.error('\nE1-Doppellauf ROT.');
  process.exit(1);
}
console.log(
  `\nE1-Doppellauf GRÜN: ${LAEUFE} Läufe byte-gleich (alt==neu==committet), Gesamt-sha stabil ` +
    `${ergebnisse[0].neuGesamtSha}. Sandbox: ${SANDBOX}/{alt,neu}.`,
);
