// scripts/datenhaltung/schema.ts
// QS-DATA E0: DB-Artefakt als kanonische Zwischenschicht (CLAUDE.md §7 Build-Regel 6).
// In E0 ist die DB eine *Projektion* der bestehenden JSON-Snapshots — Ziel ist der Beweis,
// dass `public/*.json` byte-gleich aus der DB rekonstruierbar ist (check:paritaet).
import { DatabaseSync } from 'node:sqlite';

export const SCHEMA = `
CREATE TABLE datei (
  pfad     TEXT PRIMARY KEY,
  typ      TEXT NOT NULL,   -- 'normtext-bund' | (spätere: 'normtext-kanton' | 'rechtsprechung' | ...)
  erzeugt  TEXT             -- top-level "erzeugt"-Feld (falls vorhanden)
);
CREATE TABLE eintrag (
  pfad          TEXT NOT NULL,
  idx           INTEGER NOT NULL,   -- Position in "eintraege" (Reihenfolge = Byte-Parität)
  id            TEXT,               -- indexierte Abfragefelder (Query, später FTS)
  erlass        TEXT,
  artikel       TEXT,
  artikel_label TEXT,
  blob          TEXT NOT NULL,      -- exakte Eintrags-Struktur (garantiert identische Rekonstruktion)
  PRIMARY KEY (pfad, idx)
);
CREATE INDEX idx_eintrag_erlass ON eintrag(erlass);
`;

export function oeffneDb(pfad = ':memory:'): DatabaseSync {
  const db = new DatabaseSync(pfad);
  db.exec('PRAGMA journal_mode = MEMORY;');
  return db;
}

export function frischesSchema(db: DatabaseSync): void {
  db.exec(SCHEMA);
}
