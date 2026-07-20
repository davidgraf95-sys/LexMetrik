// scripts/datenhaltung/fts.ts
// QS-DATA E2-Vorarbeiten (W2·6-DATA): baut die HOT-FTS5-Tabellen build-time
// (FAHRPLAN-DATENHALTUNG §3 DDL + §11.5 hot/cold-Grenze).
//
// HOT (edge-replika-fähig, < 1 GB, das IST der E2-POC-Zuschnitt):
//   - fts_artikel                    (external content über `artikel`, ALLE Erlasse Bund+Kanton)
//   - fts_entscheide_schaufenster    (standalone, ALLE Einträge der rechtsprechung.db)
//
// ZAHLEN-KORREKTUR 20.7.2026 (§5/§8): hier standen bis dahin „218 Bund-Erlasse" und „342
// kuratierte Schaufenster-Entscheide". Beides beschrieb den E2-Erstzuschnitt und war zur
// laufenden Korpus-Erweiterung nie nachgeführt worden — der Code filtert an KEINER Stelle,
// er nimmt schlicht alle Zeilen. Ist-Stand 20.7.2026: 1458 Erlasse / 55'822 Artikel und
// 5093 Entscheide (BS-Import #300 u. a.). Konkrete Zahlen stehen darum bewusst NICHT mehr
// in diesen Kommentaren — sie veralten still und erzeugen genau die irreführende Doku, die
// §8 verbietet. Massgeblich ist der jeweils gemessene Stand aus `npm run datenhaltung:build`
// bzw. `daten-manifest.json`.
//
// COLD (server-only, NIE embedded): fts_entscheide_masse — der 58-GB-Vollkorpus-Index
// entsteht erst mit E3 auf dem Self-Host-VPS (§11.5). Wird hier BEWUSST NICHT gebaut,
// nur als Schema-Kommentar dokumentiert (siehe MASSE_SCHEMA_DOKU unten).
//
// Tokenizer exakt `unicode61 remove_diacritics 2` (§3): diakritik-insensitiv für DE/FR/IT
// (empirisch verifiziert: «verjahrung» trifft «Verjährung», «rechtsoffnung» → «Rechtsöffnung»).
//
// Die FTS-Tabellen werden NUR im on-disk-Build (build.ts) angelegt — NICHT in
// frischesSchema()/berechneManifest(). Grund: das Dump-Manifest (check:datenhaltung)
// beweist Determinismus über die QUELL-Tabellen; der FTS-Index ist eine reine Ableitung
// daraus (rebuildbar) und wird aus dem Manifest ausgeklammert (manifest.ts → tabellen()).
import type { DatabaseSync } from 'node:sqlite';
import { bloeckeText } from './suche-kern';

// Vercel-Fix 3.7.2026: `bloeckeText` (+ Doku) ist in das IMPORT-FREIE ./suche-kern.ts
// gewandert — api/suche.ts braucht es (Snippet-Bau) und darf keine node:sqlite-Kette
// ziehen (Vercels Function-Compile). Re-Export für bestehende Konsumenten:
export { bloeckeText };

/** Tokenizer-Spezifikation (§3, nicht verhandelbar): diakritik-insensitiv DE/FR/IT. */
export const TOKENIZER = 'unicode61 remove_diacritics 2';

/** Durchsuchbarer Plaintext der Entscheid-Abschnitte: alle `bloecke[].text`, normalisiert. */
interface Abschnitt {
  bloecke?: Array<{ text?: string }>;
}
export function abschnitteText(abschnitte: Abschnitt[] | undefined): string {
  const teile: string[] = [];
  for (const a of abschnitte ?? []) for (const b of a.bloecke ?? []) if (b.text) teile.push(b.text);
  return teile.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * fts_artikel — external content über `artikel` (§3 DDL). Der FTS-Index speichert
 * KEINE zweite Textkopie (Grösse!); der indexierte `text` wird beim Bau aus
 * `bloecke_json` extrahiert. MATCH + bm25 laufen rein über den Index; das Listen-
 * Snippet baut das Such-Modul deterministisch aus `bloecke_json` der Trefferzeile
 * (native FTS-`snippet()` ist bei external content ohne physische `text`-Spalte
 * nicht verfügbar — `artikel` trägt strukturiertes `bloecke_json`, keinen Plaintext).
 * Insert-Reihenfolge = artikel.rowid → deterministischer Segment-Aufbau.
 * @returns Zeilenzahl (== artikel-Zeilen).
 */
export function baueFtsArtikel(db: DatabaseSync): number {
  db.exec(
    `CREATE VIRTUAL TABLE fts_artikel USING fts5(text, content='artikel', content_rowid='rowid', tokenize='${TOKENIZER}');`,
  );
  const rows = db.prepare('SELECT rowid AS rowid, bloecke_json FROM artikel ORDER BY rowid').all() as Array<{
    rowid: number;
    bloecke_json: string;
  }>;
  const ins = db.prepare('INSERT INTO fts_artikel(rowid, text) VALUES (?, ?)');
  for (const r of rows) ins.run(r.rowid, bloeckeText(r.bloecke_json));
  return rows.length;
}

/**
 * fts_entscheide_schaufenster — STANDALONE (self-contained) FTS5. Die Ziel-Tabelle
 * `entscheide` ist in E0+/E1/E2-Vorarbeiten LEER (befüllt erst E3), darum external
 * content unmöglich → gespeist wird aus den Blob-Einträgen (`eintrag`-Tabelle der
 * rechtsprechung.db). Spalten: id/quelle_url UNINDEXED (Rückgabe/Join ohne Index),
 * titel/regeste/text indexiert. Native `snippet()` ist hier verfügbar (Text physisch
 * gespeichert). Insert-Reihenfolge = (pfad, idx) → deterministisch.
 *
 * UMFANG (klargestellt 20.7.2026): ALLE `eintrag`-Zeilen, ohne jeden Filter. Der Kommentar
 * sprach früher von „den 342 kuratierten Schaufenster-Entscheiden" — das war der Stand der
 * E2-Erstfassung und beschrieb den Code schon länger falsch. Der Name „Schaufenster" trennt
 * hier HOT von COLD (`fts_entscheide_masse`, E3/VPS), er bezeichnet keine Auswahl innerhalb
 * der HOT-Daten. Wichtig fürs Produkt (§8): die Suche kennt damit denselben Entscheid-Korpus,
 * den der Reader zeigt — es gibt keine stille Teilmenge, über die Nutzer getäuscht würden.
 * @returns Zeilenzahl (== Anzahl `eintrag`-Zeilen der rechtsprechung.db).
 */
export function baueFtsEntscheideSchaufenster(db: DatabaseSync): number {
  db.exec(
    `CREATE VIRTUAL TABLE fts_entscheide_schaufenster USING fts5(id UNINDEXED, titel, regeste, text, quelle_url UNINDEXED, tokenize='${TOKENIZER}');`,
  );
  const rows = db.prepare('SELECT blob FROM eintrag ORDER BY pfad, idx').all() as Array<{ blob: string }>;
  const ins = db.prepare(
    'INSERT INTO fts_entscheide_schaufenster(id, titel, regeste, text, quelle_url) VALUES (?, ?, ?, ?, ?)',
  );
  for (const r of rows) {
    const e = JSON.parse(r.blob) as {
      id: string;
      zitierung?: string;
      nummer?: string;
      regeste?: { text?: string };
      abschnitte?: Abschnitt[];
      quelleUrl?: string;
    };
    ins.run(
      e.id,
      e.zitierung ?? e.nummer ?? '',
      e.regeste?.text ?? '',
      abschnitteText(e.abschnitte),
      e.quelleUrl ?? '',
    );
  }
  return rows.length;
}

// ── COLD (E3, NICHT hier bauen) — nur Schema-Dokumentation (§11.5) ────────────────
// fts_entscheide_masse entsteht mit dem BGer-Massen-Import (E3) auf dem Self-Host-VPS,
// als STANDALONE FTS5 über den 191k+-Vollkorpus. Bleibt server-only, nie in die
// Edge-Replika eingebettet (58-GB-Index sprengt jedes Edge-Budget). Ziel-DDL:
//   CREATE VIRTUAL TABLE fts_entscheide_masse USING fts5(
//     id UNINDEXED, titel, regeste, text, quelle_url UNINDEXED,
//     tokenize='unicode61 remove_diacritics 2');
export const MASSE_SCHEMA_DOKU =
  "fts_entscheide_masse: cold, server-only, entsteht mit E3 (nicht build-time gebaut, §11.5).";
