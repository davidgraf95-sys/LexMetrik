// scripts/datenhaltung/erlass-rows.ts
// QS-DATA E1 (Generator-Flip): der Spalten-Weg für Erlass-Dateien.
//
// EINE Wahrheit für zwei Richtungen:
//   (1) schreibeErlass()  — NormSnapshot[] EINER Datei → Zeilen in erlasse +
//       erlass_fassungen + artikel (kein Blob, echte Spalten, §5 E1).
//   (2) projiziereErlass() — dieselben Zeilen → BYTE-GLEICHE public/*.json-Form
//       (Re-Serialisierung in exakter NormSnapshot-Feldreihenfolge; kein Feld-Remapping).
//
// Drei Aufrufer teilen sich diese Funktionen (Determinismus = derselbe Code):
//   - Reverse-Ingest (ingest.ts → daten/normtext.db, Dump-Manifest-Grundlage),
//   - Generator-Flip (generator-flip.ts ← normtext-snapshot.ts, public kommt aus der Projektion),
//   - Doppellauf + Unit-Test (Byte-Beweis alt==neu).
//
// Fassungs-Invariante (empirisch belegt 3.7.2026 über alle 218 Bund-Dateien): eine
// Snapshot-Datei = EINE Fassung — alle Einträge teilen ebene/quelle/erlass/stand/
// abgerufen/fassungsToken. Bruch wird hart geworfen (nie stille Zweitwahrheit, §5).
import { createHash } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import type { NormSnapshot } from '../../src/lib/normtext/typen.ts';

export interface ErlasseMeta {
  key: string; // = NormSnapshot.quelle (gesetzKey / Kantonskürzel)
  ebene: 'bund' | 'kanton';
  kanton: string | null;
  sr: string | null;
  abkuerzung: string; // MUSS exakt NormSnapshot.erlass sein (byte-tragend für die Projektion)
  titel: string;
  rechtsgebiet: string;
  status: string;
}

/** Deterministischer Fassungs-Digest (§7 sha der Fassung): über die Artikel-shas. */
function fassungsDigest(snapshots: NormSnapshot[]): string {
  const zeilen = snapshots.map((s) => `${s.id}\t${s.sha}`).sort();
  return createHash('sha256').update(zeilen.join('\n'), 'utf8').digest('hex');
}

/** Erlass-Basis-URL = quelleUrl ohne #Anker (für erlass_fassungen.quelle_url). */
function basisUrl(quelleUrl: string): string {
  const i = quelleUrl.indexOf('#');
  return i === -1 ? quelleUrl : quelleUrl.slice(0, i);
}

/** art_id aus der NormSnapshot.id: 'bund/OR/art_11' → 'art_11'. */
function artIdAusId(id: string, ebene: string, quelle: string): string {
  const praefix = `${ebene}/${quelle}/`;
  if (!id.startsWith(praefix)) throw new Error(`erlass-rows: id '${id}' passt nicht zu Präfix '${praefix}'`);
  return id.slice(praefix.length);
}

/** Schreibt EINEN Erlass (eine Fassung) als Zeilen in die Ziel-Tabellen. */
export function schreibeErlass(db: DatabaseSync, meta: ErlasseMeta, snapshots: NormSnapshot[]): void {
  if (snapshots.length === 0) throw new Error(`schreibeErlass: keine Snapshots für ${meta.key}`);
  const s0 = snapshots[0];
  const { fassungsToken, stand, abgerufen } = s0;
  for (const s of snapshots) {
    if (s.ebene !== meta.ebene || s.quelle !== meta.key)
      throw new Error(`schreibeErlass: ebene/quelle-Bruch in ${meta.key}: ${s.id}`);
    if (s.erlass !== meta.abkuerzung)
      throw new Error(`schreibeErlass: erlass-Label uneinheitlich in ${meta.key}: '${s.erlass}' ≠ '${meta.abkuerzung}'`);
    if (s.fassungsToken !== fassungsToken || s.stand !== stand || s.abgerufen !== abgerufen)
      throw new Error(`schreibeErlass: Fassungs-Bruch (eine Datei = eine Fassung) in ${meta.key}: ${s.id}`);
  }

  db.prepare(
    'INSERT INTO erlasse (key, ebene, kanton, sr, abkuerzung, titel, rechtsgebiet, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  ).run(meta.key, meta.ebene, meta.kanton, meta.sr, meta.abkuerzung, meta.titel, meta.rechtsgebiet, meta.status);

  db.prepare(
    'INSERT INTO erlass_fassungen (erlass_key, fassungs_token, gueltig_von, gueltig_bis, stand, quelle_url, as_fundstelle, abgerufen, sha) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
  ).run(meta.key, fassungsToken, stand, null, stand, basisUrl(s0.quelleUrl), null, abgerufen, fassungsDigest(snapshots));

  const artStmt = db.prepare(
    'INSERT INTO artikel (erlass_key, fassungs_token, art_id, ord, artikel, artikel_label, grundlage, marg, quelle_url, bloecke_json, sha) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  );
  snapshots.forEach((s, i) => {
    artStmt.run(
      meta.key,
      fassungsToken,
      artIdAusId(s.id, meta.ebene, meta.key),
      i,
      s.artikel,
      s.artikelLabel,
      s.grundlage ?? null,
      s.titel ?? null,
      s.quelleUrl,
      JSON.stringify(s.bloecke),
      s.sha,
    );
  });
}

interface ArtikelRow {
  art_id: string;
  artikel: string;
  artikel_label: string;
  grundlage: string | null;
  quelle_url: string;
  bloecke_json: string;
  sha: string;
}

/**
 * Projiziert EINEN Erlass (eine Fassung) byte-gleich in die NormSnapshotDatei-Form.
 * Feldreihenfolge exakt wie der Generator sie emittiert (id, ebene, quelle, erlass,
 * artikel, artikelLabel, [grundlage], bloecke, stand, quelleUrl, abgerufen,
 * fassungsToken, sha) — sonst kippt die Byte-Parität.
 */
export function projiziereErlass(db: DatabaseSync, key: string, fassungsToken: string): string {
  const erl = db.prepare('SELECT ebene, abkuerzung FROM erlasse WHERE key = ?').get(key) as
    | { ebene: string; abkuerzung: string }
    | undefined;
  if (!erl) throw new Error(`projiziereErlass: erlasse fehlt für ${key}`);
  const fass = db
    .prepare('SELECT stand, abgerufen FROM erlass_fassungen WHERE erlass_key = ? AND fassungs_token = ?')
    .get(key, fassungsToken) as { stand: string; abgerufen: string } | undefined;
  if (!fass) throw new Error(`projiziereErlass: erlass_fassungen fehlt für ${key}/${fassungsToken}`);
  const rows = db
    .prepare(
      'SELECT art_id, artikel, artikel_label, grundlage, quelle_url, bloecke_json, sha FROM artikel WHERE erlass_key = ? AND fassungs_token = ? ORDER BY ord',
    )
    .all(key, fassungsToken) as unknown as ArtikelRow[];

  const eintraege = rows.map((r) => {
    const o: Record<string, unknown> = {};
    o.id = `${erl.ebene}/${key}/${r.art_id}`;
    o.ebene = erl.ebene;
    o.quelle = key;
    o.erlass = erl.abkuerzung;
    o.artikel = r.artikel;
    o.artikelLabel = r.artikel_label;
    if (r.grundlage !== null) o.grundlage = r.grundlage;
    o.bloecke = JSON.parse(r.bloecke_json);
    o.stand = fass.stand;
    o.quelleUrl = r.quelle_url;
    o.abgerufen = fass.abgerufen;
    o.fassungsToken = fassungsToken;
    o.sha = r.sha;
    return o;
  });

  // erzeugt == abgerufen (empirisch invariant über alle Bund-Dateien).
  return JSON.stringify({ erzeugt: fass.abgerufen, eintraege }, null, 2);
}

/** Alle (erlass_key, fassungs_token)-Paare mit Ziel-Zeilen — für Doppellauf/Report. */
export function alleErlassFassungen(db: DatabaseSync): Array<{ key: string; fassungsToken: string }> {
  const rows = db
    .prepare('SELECT erlass_key AS key, fassungs_token AS ft FROM erlass_fassungen ORDER BY erlass_key, fassungs_token')
    .all() as unknown as Array<{ key: string; ft: string }>;
  return rows.map((r) => ({ key: r.key, fassungsToken: r.ft }));
}
