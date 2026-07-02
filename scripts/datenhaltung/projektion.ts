// scripts/datenhaltung/projektion.ts
// QS-DATA E0: die Projektion — aus der DB die `public/*.json`-Byte-Form rekonstruieren.
// Muss byte-gleich zum bisherigen Generator-Output sein (Serialisierung: stabelesJson =
// JSON.stringify(obj, null, 2) OHNE Trailing-Newline, scripts/normtext-snapshot.ts:372/561).
import type { DatabaseSync } from 'node:sqlite';

export function projiziereBundDatei(db: DatabaseSync, pfad: string): string {
  const datei = db.prepare('SELECT erzeugt FROM datei WHERE pfad = ?').get(pfad) as
    | { erzeugt: string | null }
    | undefined;
  if (!datei) throw new Error(`Datei nicht in DB: ${pfad}`);
  const rows = db
    .prepare('SELECT blob FROM eintrag WHERE pfad = ? ORDER BY idx')
    .all(pfad) as { blob: string }[];
  // Objekt in exakter Feld-Reihenfolge des Originals rekonstruieren: { erzeugt, eintraege }.
  const obj: Record<string, unknown> = {};
  if (datei.erzeugt !== null) obj.erzeugt = datei.erzeugt;
  obj.eintraege = rows.map((r) => JSON.parse(r.blob));
  return JSON.stringify(obj, null, 2);
}

export function alleBundPfade(db: DatabaseSync): string[] {
  return (db.prepare("SELECT pfad FROM datei WHERE typ = 'normtext-bund' ORDER BY pfad").all() as {
    pfad: string;
  }[]).map((r) => r.pfad);
}
