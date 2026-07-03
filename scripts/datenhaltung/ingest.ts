// scripts/datenhaltung/ingest.ts
// QS-DATA E0+: Reverse-Befüllung der Blob-Tabellen aus den bestehenden committeten JSONs.
// Zwei Ingest-Wege (§5 E0+ 3):
//   - Eintrag-Dateien ({erzeugt, eintraege}-Form): Bund-/Kanton-Normtext + Rechtsprechung.
//     Der `blob` je Eintrag speichert die exakte Struktur → byte-gleiche Rekonstruktion.
//   - Dokument-Manifeste (Nicht-eintraege-Form): register/index/norm-index als reiner
//     Byte-Roundtrip (Pfad → exakter Inhalt), ohne Struktur-Zerlegung.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { DatabaseSync } from 'node:sqlite';

// ── Datei-Klassen (Quell-Pfade) ────────────────────────────────────────────────
export const BUND_DIR = 'public/normtext/bund';
export const KANTON_DIR = 'public/normtext/kanton';
export const RECHTSPRECHUNG_DIRS = ['public/rechtsprechung/bund', 'public/rechtsprechung/kanton'];

// Manifeste je Doktyp-DB (Byte-Roundtrip, §5 E0+ 3). register.json trägt Trailing-Newline —
// der Dokument-Ingest speichert den EXAKTEN Inhalt, bildet sie also automatisch nach.
export const NORMTEXT_MANIFESTE = ['public/normtext/register.json', 'public/normtext/kanton/index.json'];
export const RECHTSPRECHUNG_MANIFESTE = [
  'public/rechtsprechung/register.json',
  'public/rechtsprechung/norm-index.json',
];
export const MATERIALIEN_MANIFESTE = ['public/materialien/register.json'];

export interface Eintrag {
  id?: string;
  erlass?: string;
  artikel?: string;
  artikelLabel?: string;
  [k: string]: unknown;
}
export interface EintragDatei {
  erzeugt?: string;
  eintraege: Eintrag[];
}

/** Zähler je Datei-Klasse für die Grün-Meldung des Paritäts-Tors. */
export type Zaehler = Record<string, number>;

// ── Pfad-Sammler ────────────────────────────────────────────────────────────────
function jsonFlach(dir: string, ausschluss = new Set<string>()): string[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json') && !ausschluss.has(f))
    .sort()
    .map((f) => join(dir, f));
}
function jsonRekursiv(dir: string): string[] {
  const treffer: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) treffer.push(...jsonRekursiv(p));
    else if (e.name.endsWith('.json')) treffer.push(p);
  }
  return treffer.sort();
}

// ── Ingest-Bausteine ─────────────────────────────────────────────────────────────
function ingestEintragDateien(
  db: DatabaseSync,
  pfade: string[],
  typ: string,
  trailingNl: boolean,
): void {
  const dateiStmt = db.prepare('INSERT INTO datei (pfad, typ, erzeugt, trailing_nl) VALUES (?, ?, ?, ?)');
  const eintragStmt = db.prepare(
    'INSERT INTO eintrag (pfad, idx, id, erlass, artikel, artikel_label, blob) VALUES (?, ?, ?, ?, ?, ?, ?)',
  );
  for (const pfad of pfade) {
    const obj = JSON.parse(readFileSync(pfad, 'utf8')) as EintragDatei;
    dateiStmt.run(pfad, typ, obj.erzeugt ?? null, trailingNl ? 1 : 0);
    obj.eintraege.forEach((e, i) => {
      eintragStmt.run(
        pfad,
        i,
        e.id ?? null,
        e.erlass ?? null,
        e.artikel ?? null,
        e.artikelLabel ?? null,
        JSON.stringify(e),
      );
    });
  }
}

function ingestDokumente(db: DatabaseSync, pfade: string[], typ: string): void {
  const stmt = db.prepare('INSERT INTO dokument (pfad, typ, inhalt) VALUES (?, ?, ?)');
  for (const pfad of pfade) stmt.run(pfad, typ, readFileSync(pfad, 'utf8'));
}

// ── Doktyp-Ingest (→ die drei partitionierten DBs) ──────────────────────────────
/** Normtext-DB: Bund + Kanton (beide {erzeugt, eintraege}, KEIN Trailing-Newline) + Manifeste. */
export function ingestNormtext(db: DatabaseSync): Zaehler {
  const bund = jsonFlach(BUND_DIR);
  const kanton = jsonFlach(KANTON_DIR, new Set(['index.json']));
  ingestEintragDateien(db, bund, 'normtext-bund', false);
  ingestEintragDateien(db, kanton, 'normtext-kanton', false);
  ingestDokumente(db, NORMTEXT_MANIFESTE, 'normtext-manifest');
  return {
    'Bund-Normtext': bund.length,
    'Kanton-Normtext': kanton.length,
    'Normtext-Manifeste': NORMTEXT_MANIFESTE.length,
  };
}

/** Rechtsprechungs-DB: Bund + Kanton ({erzeugt, eintraege} MIT Trailing-Newline) + Manifeste. */
export function ingestRechtsprechung(db: DatabaseSync): Zaehler {
  const dateien = RECHTSPRECHUNG_DIRS.flatMap(jsonRekursiv).sort();
  ingestEintragDateien(db, dateien, 'rechtsprechung', true);
  ingestDokumente(db, RECHTSPRECHUNG_MANIFESTE, 'rechtsprechung-manifest');
  return {
    Rechtsprechung: dateien.length,
    'Rechtsprechung-Manifeste': RECHTSPRECHUNG_MANIFESTE.length,
  };
}

/** Soft-Law-DB: Materialien-Manifest (Byte-Roundtrip). */
export function ingestSoftLaw(db: DatabaseSync): Zaehler {
  ingestDokumente(db, MATERIALIEN_MANIFESTE, 'materialien-manifest');
  return { Materialien: MATERIALIEN_MANIFESTE.length };
}
