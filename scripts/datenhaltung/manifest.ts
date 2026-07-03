// scripts/datenhaltung/manifest.ts
// QS-DATA E1: das kanonische Dump-Manifest der drei partitionierten DBs.
//
// Je DB → je Tabelle: Zeilenzahl + sha256 über die KANONISCH serialisierten Zeilen
// (Spalten alphabetisch, Zeilen-Strings sortiert). Damit ist das Manifest unabhängig
// von Einfüge-Reihenfolge, PRAGMA und Plattform reproduzierbar (Determinismus §2).
//
// Der Wert wird gegen ein committetes `daten-manifest.json` verglichen (Drift-Tor,
// check:datenhaltung) und beim Bau der gitignorten daten/*.db mitgeschrieben. Zwei
// datenhaltung:build-Läufe MÜSSEN dasselbe Manifest liefern (Determinismus-Beweis).
import { createHash } from 'node:crypto';
import { oeffneDb, frischesSchema } from './schema';
import { ingestNormtext, ingestNormtextZiel, ingestRechtsprechung, ingestSoftLaw } from './ingest';
import type { DatabaseSync } from 'node:sqlite';

export interface TabellenManifest {
  zeilen: number;
  sha: string;
}
export type DbManifest = Record<string, TabellenManifest>;
export type Manifest = Record<string, DbManifest>;

/**
 * Benutzer-/Quell-Tabellen (alphabetisch) — OHNE FTS5-Virtual-Tables und deren Schatten.
 *
 * FTS-Ausklammerung (E2-Vorarbeiten, bewusst): Der Determinismus-Beweis (§2) liegt auf den
 * QUELL-Tabellen (artikel/eintrag/…); die FTS5-Indizes (fts_artikel, fts_entscheide_schaufenster
 * + ihre Schatten *_data/_idx/_docsize/_config/_content) sind reine Ableitungen daraus und aus
 * denselben Zeilen jederzeit rebuildbar. Ihr interner Segment-Blob ist SQLite-Versions-/
 * plattformabhängig (das Manifest ist explizit plattform-unabhängig gedacht, s. Kopf) — er
 * gehört nicht in den portablen Byte-Beweis. Empirisch sind die Schatten bei fixer Insert-
 * Reihenfolge zwar bit-stabil (zwei Builds → identische sha), doch der Manifest-Contract bleibt:
 * NUR Quell-Tabellen tragen ihn. berechneManifest() baut die FTS ohnehin nicht (nur build.ts) —
 * dieser Filter ist die zusätzliche, dokumentierte Absicherung.
 */
function tabellen(db: DatabaseSync): string[] {
  const alle = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
    .all() as Array<{ name: string }>;
  const virtuelle = (
    db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND sql LIKE 'CREATE VIRTUAL TABLE%'")
      .all() as Array<{ name: string }>
  ).map((r) => r.name);
  const istFts = (name: string): boolean =>
    virtuelle.some((vt) => name === vt || name.startsWith(vt + '_'));
  return alle.map((r) => r.name).filter((n) => !istFts(n));
}

function spalten(db: DatabaseSync, tabelle: string): string[] {
  const rows = db.prepare(`PRAGMA table_info(${tabelle})`).all() as Array<{ name: string }>;
  return rows.map((r) => r.name).sort();
}

/** Kanonisches Manifest EINER Datenbank (alle Tabellen). */
export function manifestDb(db: DatabaseSync): DbManifest {
  const out: DbManifest = {};
  for (const t of tabellen(db)) {
    const cols = spalten(db, t);
    const rows = db.prepare(`SELECT * FROM ${t}`).all() as Array<Record<string, unknown>>;
    const zeilenStrings = rows.map((r) => {
      const kanon: Record<string, unknown> = {};
      for (const c of cols) kanon[c] = r[c] ?? null;
      return JSON.stringify(kanon);
    });
    zeilenStrings.sort();
    const sha = createHash('sha256').update(zeilenStrings.join('\n'), 'utf8').digest('hex');
    out[t] = { zeilen: rows.length, sha };
  }
  return out;
}

/** Baut die drei DBs frisch in-memory (Blob + Ziel) und berechnet das Gesamt-Manifest. */
export function berechneManifest(): Manifest {
  const dbN = oeffneDb();
  frischesSchema(dbN, 'normtext');
  ingestNormtext(dbN);
  ingestNormtextZiel(dbN);
  const mN = manifestDb(dbN);
  dbN.close();

  const dbR = oeffneDb();
  frischesSchema(dbR, 'rechtsprechung');
  ingestRechtsprechung(dbR);
  const mR = manifestDb(dbR);
  dbR.close();

  const dbS = oeffneDb();
  frischesSchema(dbS, 'soft-law');
  ingestSoftLaw(dbS);
  const mS = manifestDb(dbS);
  dbS.close();

  return { 'normtext.db': mN, 'rechtsprechung.db': mR, 'soft-law.db': mS };
}

/** Stabile Serialisierung (Schlüssel sortiert) — committetes Manifest ist byte-stabil. */
export function serialisiereManifest(m: Manifest): string {
  const dbNamen = Object.keys(m).sort();
  const geordnet: Manifest = {};
  for (const db of dbNamen) {
    const tab: DbManifest = {};
    for (const t of Object.keys(m[db]).sort()) tab[t] = m[db][t];
    geordnet[db] = tab;
  }
  return JSON.stringify(geordnet, null, 2) + '\n';
}
