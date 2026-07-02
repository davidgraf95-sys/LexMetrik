// scripts/datenhaltung/ingest.ts
// QS-DATA E0: bestehende Bund-Normtext-Snapshots in die DB einlesen (Reverse-Befüllung).
// Der `blob` speichert die exakte Eintrags-Struktur → garantiert byte-gleiche Rekonstruktion.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { DatabaseSync } from 'node:sqlite';

export const BUND_DIR = 'public/normtext/bund';

export interface Eintrag {
  id?: string;
  erlass?: string;
  artikel?: string;
  artikelLabel?: string;
  [k: string]: unknown;
}
export interface NormtextDatei {
  erzeugt?: string;
  eintraege: Eintrag[];
}

/** Liest alle Bund-Normtext-JSONs und schreibt sie in die DB. Gibt die Anzahl Dateien zurück. */
export function ingestBundNormtext(db: DatabaseSync, dir = BUND_DIR): number {
  const dateiStmt = db.prepare('INSERT INTO datei (pfad, typ, erzeugt) VALUES (?, ?, ?)');
  const eintragStmt = db.prepare(
    'INSERT INTO eintrag (pfad, idx, id, erlass, artikel, artikel_label, blob) VALUES (?, ?, ?, ?, ?, ?, ?)',
  );
  const dateien = readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  for (const f of dateien) {
    const pfad = join(dir, f);
    const obj = JSON.parse(readFileSync(pfad, 'utf8')) as NormtextDatei;
    dateiStmt.run(pfad, 'normtext-bund', obj.erzeugt ?? null);
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
  return dateien.length;
}
