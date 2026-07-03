// scripts/datenhaltung/check-datenhaltung.ts
// QS-DATA E1-Tor `check:datenhaltung` (offline, in der check-Kette).
//
// Beweist DREI Dinge:
//   (A) Determinismus — das Manifest ist über zwei frische Berechnungen bitgleich.
//   (B) Drift — das frisch berechnete Dump-Manifest == committetes `daten-manifest.json`.
//   (C) Invarianten — keine Orphan-Kanten, §7-Pflichtspalten non-null wo befüllt,
//       «ATTACH nur im Läufer» (kein Cross-DB-ATTACH im künftigen API-/Edge-Code).
//
// Erst-Erzeugung / Neu-Pinnen des Manifests:  vite-node scripts/datenhaltung/check-datenhaltung.ts --schreibe
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { oeffneDb, frischesSchema } from './schema';
import { ingestNormtext, ingestNormtextZiel, ingestRechtsprechung, ingestSoftLaw } from './ingest';
import { berechneManifest, serialisiereManifest } from './manifest';
import type { DatabaseSync } from 'node:sqlite';

const MANIFEST_PFAD = 'daten-manifest.json';
const fehler: string[] = [];

// ─── (A) Determinismus ────────────────────────────────────────────────────────
const m1 = serialisiereManifest(berechneManifest());
const m2 = serialisiereManifest(berechneManifest());
if (m1 !== m2) fehler.push('Determinismus: zwei Manifest-Berechnungen weichen ab (Nichtdeterminismus im Ingest).');

// ─── --schreibe: Manifest (neu) committen ─────────────────────────────────────
if (process.argv.includes('--schreibe')) {
  writeFileSync(MANIFEST_PFAD, m1, 'utf8');
  console.log(`check:datenhaltung --schreibe: ${MANIFEST_PFAD} geschrieben.`);
  process.exit(0);
}

// ─── (B) Drift gegen committetes Manifest ─────────────────────────────────────
if (!existsSync(MANIFEST_PFAD)) {
  fehler.push(`${MANIFEST_PFAD} fehlt — mit "--schreibe" erstmalig erzeugen und committen.`);
} else {
  const committet = readFileSync(MANIFEST_PFAD, 'utf8');
  if (committet !== m1) {
    fehler.push(`Dump-Manifest weicht vom committeten ${MANIFEST_PFAD} ab (DB-Zustand driftet).`);
    // erste abweichende Tabelle benennen
    const a = JSON.parse(committet) as Record<string, Record<string, unknown>>;
    const b = JSON.parse(m1) as Record<string, Record<string, unknown>>;
    for (const db of Object.keys(b)) {
      for (const t of Object.keys(b[db])) {
        const av = JSON.stringify(a[db]?.[t]);
        const bv = JSON.stringify(b[db][t]);
        if (av !== bv) fehler.push(`  ${db} · ${t}: committet ${av ?? '(fehlt)'} ≠ frisch ${bv}`);
      }
    }
  }
}

// ─── (C) Invarianten auf frischen In-Memory-DBs ───────────────────────────────
const dbN = oeffneDb();
frischesSchema(dbN, 'normtext');
ingestNormtext(dbN);
ingestNormtextZiel(dbN);

const dbR = oeffneDb();
frischesSchema(dbR, 'rechtsprechung');
ingestRechtsprechung(dbR);

const dbS = oeffneDb();
frischesSchema(dbS, 'soft-law');
ingestSoftLaw(dbS);

function anzahl(db: DatabaseSync, sql: string): number {
  return (db.prepare(sql).get() as { n: number }).n;
}

// (C1) Orphans — leere Kanten sind ok, gesetzte müssen ihr Ziel treffen.
const orphanFassung = anzahl(
  dbN,
  'SELECT COUNT(*) AS n FROM erlass_fassungen f WHERE NOT EXISTS (SELECT 1 FROM erlasse e WHERE e.key = f.erlass_key)',
);
if (orphanFassung) fehler.push(`Orphan: ${orphanFassung} erlass_fassungen ohne erlasse-Zeile.`);

const orphanArtikel = anzahl(
  dbN,
  'SELECT COUNT(*) AS n FROM artikel a WHERE NOT EXISTS (SELECT 1 FROM erlass_fassungen f WHERE f.erlass_key = a.erlass_key AND f.fassungs_token = a.fassungs_token)',
);
if (orphanArtikel) fehler.push(`Orphan: ${orphanArtikel} artikel ohne erlass_fassungen-Zeile.`);

const orphanNormref = anzahl(
  dbN,
  'SELECT COUNT(*) AS n FROM norm_referenzen r WHERE NOT EXISTS (SELECT 1 FROM erlasse e WHERE e.key = r.erlass_key)',
);
if (orphanNormref) fehler.push(`Orphan: ${orphanNormref} norm_referenzen ohne erlasse-Ziel.`);

const orphanKanteVon = anzahl(
  dbR,
  'SELECT COUNT(*) AS n FROM zitat_kanten k WHERE NOT EXISTS (SELECT 1 FROM entscheide e WHERE e.id = k.von_id)',
);
if (orphanKanteVon) fehler.push(`Orphan: ${orphanKanteVon} zitat_kanten.von_id ohne Entscheid.`);

const orphanKanteNach = anzahl(
  dbR,
  'SELECT COUNT(*) AS n FROM zitat_kanten k WHERE k.nach_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM entscheide e WHERE e.id = k.nach_id)',
);
if (orphanKanteNach) fehler.push(`Orphan: ${orphanKanteNach} zitat_kanten.nach_id (aufgelöst) ohne Entscheid.`);

// (C2) §7-Pflichtspalten non-null wo befüllt.
function nichtNull(db: DatabaseSync, tabelle: string, spalten: string[]): void {
  for (const s of spalten) {
    const n = anzahl(db, `SELECT COUNT(*) AS n FROM ${tabelle} WHERE ${s} IS NULL`);
    if (n) fehler.push(`§7-Pflichtspalte: ${tabelle}.${s} ist in ${n} Zeile(n) NULL.`);
  }
}
nichtNull(dbN, 'erlass_fassungen', ['fassungs_token', 'gueltig_von', 'stand', 'quelle_url', 'abgerufen', 'sha']);
nichtNull(dbN, 'artikel', ['art_id', 'artikel', 'artikel_label', 'quelle_url', 'bloecke_json', 'sha']);
if (anzahl(dbR, 'SELECT COUNT(*) AS n FROM entscheide')) {
  nichtNull(dbR, 'entscheide', ['gericht', 'nummer', 'datum', 'quelle_url', 'abgerufen', 'sha']);
}

// (C3) «ATTACH nur im Läufer» — kein Cross-DB-ATTACH im Lesepfad (api/**). Heute leer = grün.
function greppeAttach(dir: string): string[] {
  const treffer: string[] = [];
  if (!existsSync(dir)) return treffer;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) treffer.push(...greppeAttach(p));
    else if (/\.(ts|js|mjs|cjs)$/.test(e.name)) {
      if (/\bATTACH\b/i.test(readFileSync(p, 'utf8'))) treffer.push(p);
    }
  }
  return treffer;
}
const attachTreffer = greppeAttach('api');
if (attachTreffer.length) fehler.push(`ATTACH im Lesepfad (verboten, §1 Partitionierung): ${attachTreffer.join(', ')}`);

// Kennzahlen für die Grün-Meldung.
const nErlasse = anzahl(dbN, 'SELECT COUNT(*) AS n FROM erlasse');
const nFassungen = anzahl(dbN, 'SELECT COUNT(*) AS n FROM erlass_fassungen');
const nArtikel = anzahl(dbN, 'SELECT COUNT(*) AS n FROM artikel');

dbN.close();
dbR.close();
dbS.close();

if (fehler.length) {
  console.error(`check:datenhaltung ROT (${fehler.length}):`);
  for (const f of fehler) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(
  `check:datenhaltung grün: Manifest deterministisch + == ${MANIFEST_PFAD}; ` +
    `Ziel-Tabellen ${nErlasse} Erlasse · ${nFassungen} Fassungen · ${nArtikel} Artikel; ` +
    `0 Orphans · §7-Spalten non-null · kein ATTACH im Lesepfad.`,
);
