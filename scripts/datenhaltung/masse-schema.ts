// scripts/datenhaltung/masse-schema.ts
// QS-DATA E3: das Schema des Massen-Import-Artefakts `daten/masse.db` (server-only, gitignored,
// nie nach public/ projiziert — der VPS baut daraus die cold-FTS + Read-API). EINE Datei mit den
// drei §3-Tabellen (entscheide + zitat_kanten + norm_referenzen), wie im Auftrag festgelegt.
//
// Ausrichtung an §3 (schema.ts SCHEMA_ZIEL_RECHTSPRECHUNG/norm_referenzen), mit dokumentierten,
// Massen-/Staging-bedingten Erweiterungen:
//  - entscheide.full_text        — Rohtext (cold-FTS-Quelle; die kuratierte rechtsprechung.db
//                                   trägt stattdessen abschnitte_json; Long-Tail-Parsing = E3+/E4).
//  - entscheide.docket_key       — CH-Bundes-Resolve-Anker (Parquet hat KEIN ECLI; §3-`ecli_key`
//                                   bleibt als Spalte vorhanden, hier NULL).
//  - entscheide.publikation      — publication_date (nur für die OCL-Plausibilität pub≥datum).
//  - entscheide.rechtsgebiet     — legal_area (kostenlose Korpus-Metadaten).
//  - zitat_kanten.match_type     — voilaj-match_type (trägt den Quoten-Report je match_type + die
//                                   idempotente konfidenz-Ableitung, §3.2).
// entscheide.datum ist NULLABLE (bge: 194 Quell-Lücken, §8-ehrlich — nie fabriziert).

// Bulk-Ziel-Tabellen. Kanten/Referenzen zunächst OHNE UNIQUE-Index (Load-then-index, B2-POC):
// die Dedup nach UNIQUE-Semantik (§3.2) läuft als deterministischer GROUP-BY-MIN(id)-Set-Pass
// NACH dem Bulk (masse-ingest.ts), dann die Indizes.
export const SCHEMA_MASSE = `
CREATE TABLE entscheide (
  id            TEXT PRIMARY KEY,
  ecli          TEXT,
  ecli_key      TEXT,
  gericht       TEXT NOT NULL,
  kanton        TEXT,
  nummer        TEXT NOT NULL,
  bge_referenz  TEXT,
  bge_key       TEXT,
  docket_key    TEXT,
  datum         TEXT,
  publikation   TEXT,
  sprache       TEXT NOT NULL,
  rechtsgebiet  TEXT,
  leitcharakter INTEGER NOT NULL DEFAULT 0,
  kuratierung   TEXT NOT NULL,
  regeste_json  TEXT,
  full_text     TEXT NOT NULL,
  quelle        TEXT NOT NULL,
  quelle_url    TEXT,
  abgerufen     TEXT,
  sha           TEXT NOT NULL
);
CREATE TABLE zitat_kanten (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  von_id         TEXT NOT NULL,
  nach_id        TEXT,
  ziel_key       TEXT NOT NULL,
  nach_zitierung TEXT NOT NULL,
  match_type     TEXT,
  konfidenz      TEXT NOT NULL,
  quelle         TEXT NOT NULL
);
CREATE TABLE norm_referenzen (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  quelldok_typ TEXT NOT NULL,
  quelldok_id  TEXT NOT NULL,
  erlass_key   TEXT NOT NULL,
  artikel      TEXT,
  zitat_key    TEXT NOT NULL,
  roh_zitat    TEXT NOT NULL,
  konfidenz    TEXT NOT NULL,
  quelle       TEXT NOT NULL
);
`;

// Roh-Bulk-Tabellen (kein Index, keine Dedup) — maximaler Insert-Durchsatz.
export const SCHEMA_ROH = `
CREATE TABLE zitat_roh (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  von_id         TEXT NOT NULL,
  ziel_key       TEXT NOT NULL,
  nach_zitierung TEXT NOT NULL,
  match_type     TEXT
);
CREATE TABLE normref_roh (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  quelldok_id  TEXT NOT NULL,
  erlass_key   TEXT NOT NULL,
  artikel      TEXT,
  zitat_key    TEXT NOT NULL,
  roh_zitat    TEXT NOT NULL
);
`;

// UNIQUE-Dedup (§3.2) als deterministischer Set-Pass: pro UNIQUE-Gruppe die Zeile mit MIN(id).
// GROUP BY behandelt NULL als gleich (NULL-artikel/-ziel_key kollabieren korrekt; ein blosser
// UNIQUE-Index täte das NICHT — SQLite-NULLs sind darin distinct). konfidenz startet 'unresolved'
// (alle Kanten sind vor resolve-zitate.ts unaufgelöst); norm_referenzen sind direkt extrahiert.
export const DEDUP_MASSE = `
INSERT INTO zitat_kanten (von_id, nach_id, ziel_key, nach_zitierung, match_type, konfidenz, quelle)
  SELECT r.von_id, NULL, r.ziel_key, r.nach_zitierung, r.match_type, 'unresolved', 'maschinell'
  FROM zitat_roh r
  JOIN (SELECT MIN(id) AS mid FROM zitat_roh GROUP BY von_id, ziel_key) m ON r.id = m.mid;
INSERT INTO norm_referenzen (quelldok_typ, quelldok_id, erlass_key, artikel, zitat_key, roh_zitat, konfidenz, quelle)
  SELECT 'entscheid', r.quelldok_id, r.erlass_key, r.artikel, r.zitat_key, r.roh_zitat, 'regex-hoch', 'maschinell'
  FROM normref_roh r
  JOIN (SELECT MIN(id) AS mid FROM normref_roh GROUP BY quelldok_id, erlass_key, artikel, zitat_key) m ON r.id = m.mid;
DROP TABLE zitat_roh;
DROP TABLE normref_roh;
`;

// Indizes NACH Bulk + Dedup (§3-Indizes + Resolve-Arbeitsindex). Kein UNIQUE-Index nötig — die
// Dedup ist bereits per GROUP BY erzwungen; die Lookup-Indizes genügen für Resolve/Reads.
export const INDIZES_MASSE = `
CREATE INDEX ix_entscheide_bge    ON entscheide(bge_key);
CREATE INDEX ix_entscheide_docket ON entscheide(docket_key);
CREATE INDEX ix_entscheide_ecli   ON entscheide(ecli_key);
CREATE INDEX ix_zitat_von         ON zitat_kanten(von_id);
CREATE INDEX ix_zitat_nach        ON zitat_kanten(nach_id);
CREATE INDEX ix_zitat_unresolved  ON zitat_kanten(ziel_key) WHERE nach_id IS NULL;
CREATE INDEX ix_normref_norm      ON norm_referenzen(erlass_key, artikel);
CREATE INDEX ix_normref_dok       ON norm_referenzen(quelldok_typ, quelldok_id);
`;

export const MASSE_PRAGMAS = [
  'PRAGMA journal_mode = OFF',
  'PRAGMA synchronous = OFF',
  'PRAGMA temp_store = MEMORY',
  'PRAGMA cache_size = -524288', // ~512 MiB Page-Cache
];
