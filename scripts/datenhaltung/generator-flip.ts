// scripts/datenhaltung/generator-flip.ts
// QS-DATA E1: der Generator-Flip als schlanker Adapter über erlass-rows.ts.
//
// normtext-snapshot.ts lädt dieses Modul NUR im echten CLI-Lauf (dynamischer Import
// in main()) — so zieht der vitest-Import von normtext-snapshot.ts nie node:sqlite.
// Der Flip schreibt jeden Bund-Erlass als Zeilen ins Zielschema und gibt die
// BYTE-GLEICHE public/*.json-Form aus DER PROJEKTION zurück (Spalten-Weg statt
// Blob-Weg). Der Aufrufer vergleicht sie gegen den alten Direktpfad (Doppellauf).
import { oeffneDb, frischesSchema } from './schema';
import { schreibeErlass, projiziereErlass, type ErlasseMeta } from './erlass-rows';
import type { DatabaseSync } from 'node:sqlite';
import type { NormSnapshot } from '../../src/lib/normtext/typen.ts';

export function erstelleFlipDb(): DatabaseSync {
  const db = oeffneDb(); // in-memory; verworfen nach dem Lauf (daten/*.db baut datenhaltung:build)
  frischesSchema(db, 'normtext');
  return db;
}

/**
 * Schreibt EINEN Bund-Erlass ins Zielschema und projiziert ihn zurück.
 * Rückgabe = public/*.json-Bytes AUS den Zeilen (die neue Wahrheit); der Aufrufer
 * prüft sie gegen den alten stabelesJson-Direktpfad (Doppellauf, §5 E1).
 */
export function flipBundErlass(
  db: DatabaseSync,
  eintrag: { key: string; sr: string | null; titel: string; rechtsgebiet: string; status: string },
  snapshots: NormSnapshot[],
): string {
  const meta: ErlasseMeta = {
    key: eintrag.key,
    ebene: 'bund',
    kanton: null,
    sr: eintrag.sr,
    abkuerzung: snapshots[0].erlass, // byte-tragend (= NormSnapshot.erlass)
    titel: eintrag.titel,
    rechtsgebiet: eintrag.rechtsgebiet,
    status: eintrag.status,
  };
  schreibeErlass(db, meta, snapshots);
  return projiziereErlass(db, meta.key, snapshots[0].fassungsToken);
}

/**
 * E1-Rest B (Kanton-Flip): schreibt EINEN Kanton-Erlass ins Zielschema und projiziert
 * ihn zurück. `key` = Dateiname-Stamm/Register-PK ('AG-291.150', mit Bindestrich);
 * `kanton` = Kantonskürzel ('AG') = snapshots[0].quelle (byte-tragend, 2. id-Segment).
 * Die Identitätsfelder (sr/titel/rechtsgebiet/status) sind für die Projektion irrelevant
 * (sie liest nur ebene/abkuerzung/kanton + Artikel-Zeilen) — die echte Kanton-Identität
 * pflegt der Reverse-Ingest aus dem Register (ingest.ts, Manifest-Grundlage).
 */
export function flipKantonErlass(
  db: DatabaseSync,
  eintrag: { key: string; kanton: string },
  snapshots: NormSnapshot[],
): string {
  const meta: ErlasseMeta = {
    key: eintrag.key,
    ebene: 'kanton',
    kanton: eintrag.kanton, // == snapshots[0].quelle (2. id-Segment)
    sr: null,
    abkuerzung: snapshots[0].erlass, // byte-tragend (= NormSnapshot.erlass)
    titel: snapshots[0].erlass,
    rechtsgebiet: '',
    status: 'snapshot',
  };
  schreibeErlass(db, meta, snapshots);
  return projiziereErlass(db, meta.key, snapshots[0].fassungsToken);
}
