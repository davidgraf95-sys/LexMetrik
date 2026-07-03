// scripts/datenhaltung/masse-invarianten.ts
// QS-DATA E3 — OCL-Plausibilitäts-Invarianten + kanonisches Dump-Manifest der masse.db (Auftrag §5
// Punkt 3). masse.db ist KEIN committetes Artefakt → das Manifest wandert in den Bericht, nicht in
// den Baum. Zweck: (a) Determinismus-Beweis (zwei Voll-Läufe → identisches Manifest, Weiche C
// Voll-Rebuild) und (b) OCL-Plausibilität + §7-Vollständigkeit vor dem VPS-Upload.
//
// Harte Invarianten (Exit 1): §7-Pflichtspalten non-null; jede Entscheid-Zeile hat ≥1 Match-Key;
// aufgelöste Kanten treffen einen Entscheid. Diagnostisch (nur Report, mit Erklärung): OCL-
// Jahres-Plausibilität, publication_before_decision (voilaj-BGE-Platzhalter), unresolved-Anteil.
import { writeFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { manifestMasse, serialisiereMasseManifest } from './masse-mapping';

const MASSE_DB = process.env.MASSE_DB ?? 'daten/masse.db';
const MANIFEST_OUT = process.env.MASSE_MANIFEST ?? 'daten/masse-manifest.json';
const JAHR_MAX = 2027; // Plausibilitäts-Decke (Abrufjahr + 1)
const JAHR_MIN = 1875; // erste BGE-Sammlung

function anz(db: DatabaseSync, sql: string): number {
  return (db.prepare(sql).get() as { n: number }).n;
}

const db = new DatabaseSync(MASSE_DB, { readOnly: true });
const hart: string[] = [];
const diag: string[] = [];

// ── (A) §7-Pflichtspalten non-null (garantierte Provenienz) ─────────────────────────────────
const p7 = ['gericht', 'nummer', 'quelle', 'quelle_url', 'abgerufen', 'sha', 'kuratierung'];
for (const s of p7) {
  const n = anz(db, `SELECT COUNT(*) AS n FROM entscheide WHERE ${s} IS NULL`);
  if (n) hart.push(`§7-NULL: entscheide.${s} in ${n} Zeile(n) NULL`);
}
// kuratierung MUSS 'maschinell' sein (E3-Marker).
const nichtMasch = anz(db, "SELECT COUNT(*) AS n FROM entscheide WHERE kuratierung != 'maschinell'");
if (nichtMasch) hart.push(`kuratierung != 'maschinell' in ${nichtMasch} Zeile(n)`);

// ── (B) Match-Key-Befüllung: jede Entscheid-Zeile hat ≥1 Match-Key (sonst unauflösbar/Bug) ──
const ohneKey = anz(
  db,
  'SELECT COUNT(*) AS n FROM entscheide WHERE bge_key IS NULL AND docket_key IS NULL AND ecli_key IS NULL',
);
if (ohneKey) hart.push(`Match-Key: ${ohneKey} Entscheide ohne bge_key/docket_key/ecli_key`);

// Kanten-/Referenz-Pflichtfelder (ziel_key/zitat_key non-null; Bug-Invariante).
const zielLeer = anz(db, "SELECT COUNT(*) AS n FROM zitat_kanten WHERE ziel_key IS NULL");
if (zielLeer) hart.push(`zitat_kanten.ziel_key NULL in ${zielLeer} Zeile(n)`);
const zitatLeer = anz(db, "SELECT COUNT(*) AS n FROM norm_referenzen WHERE zitat_key IS NULL");
if (zitatLeer) hart.push(`norm_referenzen.zitat_key NULL in ${zitatLeer} Zeile(n)`);

// ── (C) ECLI-Form: wo ecli gesetzt ist, muss es 'ECLI:'-präfigiert sein ─────────────────────
const ecliGesetzt = anz(db, 'SELECT COUNT(*) AS n FROM entscheide WHERE ecli IS NOT NULL');
const ecliUnform = anz(db, "SELECT COUNT(*) AS n FROM entscheide WHERE ecli IS NOT NULL AND ecli NOT LIKE 'ECLI:%'");
if (ecliUnform) hart.push(`ECLI-Form: ${ecliUnform} entscheide.ecli ohne 'ECLI:'-Präfix`);
diag.push(`ECLI-Form: ${ecliGesetzt} entscheide mit ecli (Parquet führt kein ECLI-Feld → erwartet 0), davon ${ecliUnform} malformt`);
// bge_key-Form (Band-Abteilung-Seite) — wo gesetzt.
const bgeUnform = anz(
  db,
  "SELECT COUNT(*) AS n FROM entscheide WHERE bge_key IS NOT NULL AND bge_key NOT GLOB '[0-9]*-[IVXAB]*-[0-9]*'",
);
if (bgeUnform) hart.push(`bge_key-Form: ${bgeUnform} malformte bge_key`);

// ── (D) docket_year_plausibility (diagnostisch) ─────────────────────────────────────────────
const datumGesetzt = anz(db, 'SELECT COUNT(*) AS n FROM entscheide WHERE datum IS NOT NULL');
const datumNull = anz(db, 'SELECT COUNT(*) AS n FROM entscheide WHERE datum IS NULL');
const jahrUnplausibel = anz(
  db,
  `SELECT COUNT(*) AS n FROM entscheide
    WHERE datum IS NOT NULL
      AND (CAST(substr(datum,1,4) AS INTEGER) < ${JAHR_MIN} OR CAST(substr(datum,1,4) AS INTEGER) > ${JAHR_MAX})`,
);
diag.push(`docket_year_plausibility: ${jahrUnplausibel} Zeile(n) mit datum-Jahr ausserhalb [${JAHR_MIN},${JAHR_MAX}] (0 erwartet); ${datumNull} Zeilen ohne datum (bge-Quell-Lücke, §8)`);
if (jahrUnplausibel) hart.push(`docket_year_plausibility: ${jahrUnplausibel} Zeile(n) mit unplausiblem datum-Jahr`);

// Q1 (Gegenprüfungs-Befund 3.7.2026): viele bge-Zeilen tragen den Bandjahr-Platzhalter
// 'JJJJ-01-01' statt des echten Verkündungsdatums — quelltreu übernommen, §8-relevant.
const bgeJan1 = anz(db, "SELECT COUNT(*) AS n FROM entscheide WHERE gericht = 'bge' AND datum LIKE '%-01-01'");
const bgeAlle = anz(db, "SELECT COUNT(*) AS n FROM entscheide WHERE gericht = 'bge'");
diag.push(`datum-Platzhalter (Q1): ${bgeJan1}/${bgeAlle} bge-Zeilen mit datum 'JJJJ-01-01' (voilaj-Bandjahr-Platzhalter, KEIN Urteilsdatum — die UI darf das nie als Verkündungsdatum zeigen)`);

// ── (E) publication_before_decision (diagnostisch — voilaj-BGE-Platzhalter) ─────────────────
const pubVorEntsch = anz(
  db,
  'SELECT COUNT(*) AS n FROM entscheide WHERE publikation IS NOT NULL AND datum IS NOT NULL AND publikation < datum',
);
const pubGesetzt = anz(db, 'SELECT COUNT(*) AS n FROM entscheide WHERE publikation IS NOT NULL');
diag.push(
  `publication_before_decision: ${pubVorEntsch}/${pubGesetzt} Zeilen mit publikation < datum — erwartet, weil voilaj für BGE die Publikation auf den Bandjahr-Platzhalter 'YYYY-01-01' setzt (Datenartefakt, keine Korruption; §8-ehrlich).`,
);

// ── (F) unresolved-Anteil (diagnostisch, Quoten-Baseline) ───────────────────────────────────
const kanten = anz(db, 'SELECT COUNT(*) AS n FROM zitat_kanten');
const kUnres = anz(db, "SELECT COUNT(*) AS n FROM zitat_kanten WHERE nach_id IS NULL");
diag.push(`zitat_kanten unresolved: ${kUnres}/${kanten} = ${(kanten ? kUnres / kanten : 0).toFixed(4)} (legitim, §3.2; heilt mit E5)`);

// ── (G) Manifest ─────────────────────────────────────────────────────────────────────────────
const manifest = manifestMasse(db as unknown as { prepare(sql: string): { all(): Array<Record<string, unknown>>; iterate(): IterableIterator<Record<string, unknown>> } });
const serial = serialisiereMasseManifest(manifest);
db.close();
writeFileSync(MANIFEST_OUT, serial, 'utf8');

console.log(`masse-invarianten (${MASSE_DB}):`);
console.log(`  entscheide mit datum: ${datumGesetzt} · ohne datum: ${datumNull}`);
for (const d of diag) console.log(`  · ${d}`);
console.log(`\nDump-Manifest (→ ${MANIFEST_OUT}, gitignored):`);
for (const [t, v] of Object.entries(manifest)) console.log(`  ${t.padEnd(16)} zeilen=${v.zeilen}  sha=${v.sha}`);

if (hart.length) {
  console.error(`\nHARTE INVARIANTEN ROT (${hart.length}):`);
  for (const f of hart) console.error(`  - ${f}`);
  process.exit(1);
}
console.log('\nHarte Invarianten grün (§7-Spalten non-null · Match-Keys befüllt · ECLI/bge_key-Form · Jahres-Plausibilität).');
