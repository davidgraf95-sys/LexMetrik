// scripts/datenhaltung/baue-rangliste.ts
// QS-DATA E4 — materialisiert `norm_rangliste` (§3.2) aus norm_referenzen × zitat_kanten.
// PORTIERT die norm-index-Semantik 1:1 (scripts/normtext/entscheide-schreiben.ts::baueArtikelIndex):
//
//   Für einen Artikel A ist die topische Menge  S_A = { Bundesgerichtsentscheide, die A zitieren }.
//   gewicht(d) für d ∈ S_A = Anzahl ANDERER Entscheide d' ∈ S_A, die d zitieren
//   (topische In-degree INNERHALB S_A). KEIN globaler Zähler, KEIN PageRank
//   (norm-index.ts: «das würde prozessuale Megafälle nach oben spülen»). Build-time, deterministisch.
//
// Unterschiede zur JS-Referenz — bewusst, dokumentiert:
//   (a) Korpus = 195 342 Bundes-Entscheide (bger+bge) statt 342 kuratierte. Der bundesgericht-Filter
//       der JS-Referenz ist hier durch den JOIN auf `entscheide` erfüllt (alle Zeilen sind bger/bge).
//   (b) Artikel-Zugehörigkeit kommt aus norm_referenzen (voilaj statute_references), Entscheid-Kanten
//       aus zitat_kanten (voilaj citations, nach_id via resolve-zitate) — statt der Regex über
//       kuratierten Snapshot-Text. Grösserer Korpus ⇒ gewicht kann nur STEIGEN (mehr zitierende
//       Entscheide desselben Artikels); die Monotonie ist der ganze Sinn (Oracle-Tor prüft sie).
//   (c) erlass_key wird via erlass-kanon.ts kanonisiert (OR≡CO, IVG≡LAI …); unmappbare (kantonale/
//       aufgehobene) law_codes fallen aus der Rangliste (unresolved, §8). Ohne Q4 zerfiele die
//       In-degree in Sprach-Silos.
//   (d) KEIN Deckel (LEITFAELLE_PRO_ARTIKEL=8): die Rangliste ist die MATERIALISIERTE Vollmenge;
//       Deckelung/Sortierung ist Sache der Projektion in die UI (die Rangliste ist die Quelle).
//   Selbstzitat (von=nach) wird nie gezählt; gewicht zählt DISTINCT zitierende Entscheide.
//
// Idempotent: DROP+Rebuild (Weiche C) — zwei Läufe → identische Tabelle. Rein deterministisch.
import { DatabaseSync } from 'node:sqlite';
import { kanonErlassKey } from './erlass-kanon';

export interface RanglisteReport {
  kanonMapEintraege: number;   // distinct roh-law_codes, die mappen
  topicMember: number;         // (erlass_key, artikel, entscheid_id)-Tripel (Rangliste-Zeilen)
  ranglisteZeilen: number;     // == topicMember (jedes Mitglied trägt genau eine Zeile)
  mitGewicht: number;          // Zeilen mit gewicht > 0
  maxGewicht: number;
  artikelBuckets: number;      // distinct (erlass_key, artikel)
  bauMs: number;
}

/** Materialisiert norm_rangliste auf einer geöffneten masse.db. Gibt den Bau-Report zurück. */
export function baueRangliste(db: DatabaseSync): RanglisteReport {
  const t0 = Number(process.hrtime.bigint() / 1_000_000n);

  // ── (1) Kanon-Map als Temp-Tabelle (JS-Funktion → Zeilen; EINE Kanonisierung, §3.1) ──────────
  db.exec(`
    DROP TABLE IF EXISTS kanon_map;
    CREATE TEMP TABLE kanon_map (roh TEXT PRIMARY KEY, key TEXT NOT NULL);
  `);
  const distinct = db.prepare('SELECT DISTINCT erlass_key FROM norm_referenzen').all() as Array<{ erlass_key: string }>;
  const insKanon = db.prepare('INSERT INTO kanon_map (roh, key) VALUES (?, ?)');
  db.exec('BEGIN');
  let kanonMapEintraege = 0;
  for (const r of distinct) {
    const k = kanonErlassKey(r.erlass_key);
    if (k) { insKanon.run(r.erlass_key, k); kanonMapEintraege++; }
  }
  db.exec('COMMIT');

  // ── (2) topische Zugehörigkeit S_A: DISTINCT (kanon-key, artikel, entscheid) ─────────────────
  // NUR Entscheide, die als quelldok im Korpus stehen (JOIN entscheide = bundesgericht-Filter der
  // JS-Referenz; alle masse-Entscheide sind bger/bge). artikel NULL (nur-Erlass-Ebene) fällt raus —
  // die gewicht-Semantik ist per-Artikel (norm-index proNormArtikel). DISTINCT kollabiert die
  // Mehrfach-Zugehörigkeit, die durch die Kanon-Vereinigung (z.B. OR 41 + CO 41) entstehen kann.
  db.exec(`
    DROP TABLE IF EXISTS topic_member;
    CREATE TEMP TABLE topic_member (erlass_key TEXT NOT NULL, artikel TEXT NOT NULL, entscheid_id TEXT NOT NULL);
    INSERT INTO topic_member (erlass_key, artikel, entscheid_id)
      SELECT DISTINCT km.key, nr.artikel, nr.quelldok_id
      FROM norm_referenzen nr
      JOIN kanon_map km ON km.roh = nr.erlass_key
      JOIN entscheide e ON e.id = nr.quelldok_id
      WHERE nr.quelldok_typ = 'entscheid' AND nr.artikel IS NOT NULL;
    CREATE INDEX ix_tm_ent   ON topic_member(entscheid_id, erlass_key, artikel);
    CREATE INDEX ix_tm_topic ON topic_member(erlass_key, artikel, entscheid_id);
  `);
  const topicMember = (db.prepare('SELECT COUNT(*) AS n FROM topic_member').get() as { n: number }).n;

  // ── (3) norm_rangliste neu (idempotent DROP+Rebuild, Weiche C) ───────────────────────────────
  db.exec(`
    DROP TABLE IF EXISTS norm_rangliste;
    CREATE TABLE norm_rangliste (
      erlass_key   TEXT NOT NULL,
      artikel      TEXT,
      entscheid_id TEXT NOT NULL,
      gewicht      INTEGER NOT NULL,
      PRIMARY KEY (erlass_key, artikel, entscheid_id)
    );
    -- (3a) jedes Mitglied mit gewicht 0 (die Vollmenge; Leitfälle OHNE In-degree gehören dazu,
    --      norm-index listet sie ebenfalls, gewicht 0).
    INSERT INTO norm_rangliste (erlass_key, artikel, entscheid_id, gewicht)
      SELECT erlass_key, artikel, entscheid_id, 0 FROM topic_member;
  `);

  // ── (4) topische In-degree je (topic, d): DISTINCT zitierende Mitglieder desselben Artikels ──
  // Kanten-getrieben: für jede aufgelöste Kante von→nach zähle sie unter allen Artikeln, in denen
  // BEIDE (von UND nach) Mitglied sind. COUNT(DISTINCT von) = «wie viele ANDERE Fälle aus S_A
  // zitieren d» (Doppelkanten von→d über verschiedene ziel_key kollabieren korrekt).
  db.exec(`
    DROP TABLE IF EXISTS deg;
    CREATE TEMP TABLE deg (erlass_key TEXT NOT NULL, artikel TEXT NOT NULL, entscheid_id TEXT NOT NULL,
                           gewicht INTEGER NOT NULL, PRIMARY KEY (erlass_key, artikel, entscheid_id));
    INSERT INTO deg (erlass_key, artikel, entscheid_id, gewicht)
      SELECT tv.erlass_key, tv.artikel, k.nach_id, COUNT(DISTINCT k.von_id)
      FROM zitat_kanten k
      JOIN topic_member tv ON tv.entscheid_id = k.von_id
      JOIN topic_member tn ON tn.entscheid_id = k.nach_id
                          AND tn.erlass_key = tv.erlass_key AND tn.artikel = tv.artikel
      WHERE k.nach_id IS NOT NULL AND k.von_id <> k.nach_id
      GROUP BY tv.erlass_key, tv.artikel, k.nach_id;
    -- (5) gewicht in die Rangliste übernehmen (nur die Hot-Tripel; Rest bleibt 0).
    UPDATE norm_rangliste
       SET gewicht = (SELECT d.gewicht FROM deg d
                       WHERE d.erlass_key = norm_rangliste.erlass_key
                         AND d.artikel = norm_rangliste.artikel
                         AND d.entscheid_id = norm_rangliste.entscheid_id)
     WHERE EXISTS (SELECT 1 FROM deg d
                    WHERE d.erlass_key = norm_rangliste.erlass_key
                      AND d.artikel = norm_rangliste.artikel
                      AND d.entscheid_id = norm_rangliste.entscheid_id);
    DROP TABLE deg;
    DROP TABLE topic_member;
    DROP TABLE kanon_map;
    CREATE INDEX ix_rangliste_norm ON norm_rangliste(erlass_key, artikel, gewicht DESC);
  `);

  const ranglisteZeilen = (db.prepare('SELECT COUNT(*) AS n FROM norm_rangliste').get() as { n: number }).n;
  const mitGewicht = (db.prepare('SELECT COUNT(*) AS n FROM norm_rangliste WHERE gewicht > 0').get() as { n: number }).n;
  const maxGewicht = (db.prepare('SELECT COALESCE(MAX(gewicht),0) AS n FROM norm_rangliste').get() as { n: number }).n;
  const artikelBuckets = (db.prepare('SELECT COUNT(*) AS n FROM (SELECT 1 FROM norm_rangliste GROUP BY erlass_key, artikel)').get() as { n: number }).n;

  const bauMs = Number(process.hrtime.bigint() / 1_000_000n) - t0;
  return { kanonMapEintraege, topicMember, ranglisteZeilen, mitGewicht, maxGewicht, artikelBuckets, bauMs };
}

// ── CLI ────────────────────────────────────────────────────────────────────────────────────────
if (!process.env.VITEST) {
  const MASSE_DB = process.env.MASSE_DB ?? 'daten/masse.db';
  const db = new DatabaseSync(MASSE_DB);
  db.exec('PRAGMA journal_mode = OFF');
  db.exec('PRAGMA synchronous = OFF');
  db.exec('PRAGMA temp_store = MEMORY');
  db.exec('PRAGMA cache_size = -524288');
  const r = baueRangliste(db);

  console.log(`\nbaue-rangliste (${MASSE_DB}) — ${r.bauMs} ms`);
  console.log(`  kanon-map:        ${r.kanonMapEintraege} roh-law_codes → Register-key`);
  console.log(`  topic_member:     ${r.topicMember} (erlass_key, artikel, entscheid)-Tripel`);
  console.log(`  norm_rangliste:   ${r.ranglisteZeilen} Zeilen · ${r.artikelBuckets} Artikel-Buckets`);
  console.log(`  gewicht > 0:      ${r.mitGewicht}  · max ${r.maxGewicht}`);

  console.log('\n  Top-10 Artikel-Leitfälle (Plausibilität):');
  const top = db.prepare(`
    SELECT erlass_key, artikel, entscheid_id, gewicht FROM norm_rangliste
    ORDER BY gewicht DESC, erlass_key, artikel, entscheid_id LIMIT 10`).all() as Array<{ erlass_key: string; artikel: string; entscheid_id: string; gewicht: number }>;
  for (const t of top) console.log(`    ${(`${t.erlass_key}/${t.artikel}`).padEnd(14)} ${t.entscheid_id.padEnd(28)} gewicht ${t.gewicht}`);
  db.close();
}
