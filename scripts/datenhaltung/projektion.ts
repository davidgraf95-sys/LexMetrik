// scripts/datenhaltung/projektion.ts
// QS-DATA E0+: die Projektion — aus der DB die `public/*.json`-Byte-Form rekonstruieren.
// Muss byte-gleich zum bisherigen Generator-Output sein.
//   - Eintrag-Dateien: { erzeugt?, eintraege } via JSON.stringify(obj, null, 2), plus
//     abschliessendes "\n" nur wo die Klasse es trägt (trailing_nl; Rechtsprechung = ja,
//     Bund/Kanton-Normtext = nein — Serialisierung wie scripts/normtext-snapshot.ts bzw.
//     scripts/normtext-entscheide.ts).
//   - Dokument-Manifeste: exakter gespeicherter Inhalt (reiner Byte-Roundtrip).
import type { DatabaseSync } from 'node:sqlite';

export function projiziereEintragDatei(db: DatabaseSync, pfad: string): string {
  const datei = db.prepare('SELECT erzeugt, trailing_nl FROM datei WHERE pfad = ?').get(pfad) as
    | { erzeugt: string | null; trailing_nl: number }
    | undefined;
  if (!datei) throw new Error(`Datei nicht in DB: ${pfad}`);
  const rows = db
    .prepare('SELECT blob FROM eintrag WHERE pfad = ? ORDER BY idx')
    .all(pfad) as { blob: string }[];
  // Objekt in exakter Feld-Reihenfolge des Originals rekonstruieren: { erzeugt, eintraege }.
  const obj: Record<string, unknown> = {};
  if (datei.erzeugt !== null) obj.erzeugt = datei.erzeugt;
  obj.eintraege = rows.map((r) => JSON.parse(r.blob));
  return JSON.stringify(obj, null, 2) + (datei.trailing_nl ? '\n' : '');
}

export function projiziereDokument(db: DatabaseSync, pfad: string): string {
  const row = db.prepare('SELECT inhalt FROM dokument WHERE pfad = ?').get(pfad) as
    | { inhalt: string }
    | undefined;
  if (!row) throw new Error(`Dokument nicht in DB: ${pfad}`);
  return row.inhalt;
}

export function alleEintragPfade(db: DatabaseSync): string[] {
  return (db.prepare('SELECT pfad FROM datei ORDER BY pfad').all() as { pfad: string }[]).map(
    (r) => r.pfad,
  );
}

export function alleDokumentPfade(db: DatabaseSync): string[] {
  return (db.prepare('SELECT pfad FROM dokument ORDER BY pfad').all() as { pfad: string }[]).map(
    (r) => r.pfad,
  );
}
