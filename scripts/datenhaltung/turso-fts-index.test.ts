// scripts/datenhaltung/turso-fts-index.test.ts
// Hält die zwei Annahmen fest, auf denen der Shadow-Transport des Syncs steht
// (QS-CODE-TURSO). Beide sind empirisch, nicht dogmatisch — und beide würden, wenn sie
// kippen, einen FALSCHEN Suchindex live stellen, ohne dass eine Zeilenzahl auffiele.
//
// Der Test läuft VOLLSTÄNDIG LOKAL (node:sqlite, in-memory). Er braucht kein Turso, kein
// Netz und kein Token — genau darum kann er im normalen Test-Lauf mitfahren.
//
// ── F5 (Gegenprüfung 31.8.2026): keine Zweitkopien mehr in diesem Test ──────────────
// Tokenizer, DDLs, Spaltenliste und bm25-Gewichte standen hier als eigene Literale.
// Das machte den Test ZAHNLOS für genau die Drift, die er bewachen soll: wer
// FTS_ARTIKEL_SPALTEN umsortiert oder BM25_GEWICHTE verschiebt, prüfte danach
// weiterhin die ALTE Form — grün, während der Produktionspfad die neue fährt. Alles
// kommt jetzt aus der Produktionsquelle (fts.ts / suche-kern.ts, §5).
import { describe, it, expect } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { leseFtsSchatten } from './turso-fts-index';
import { TOKENIZER, ddlFtsArtikel, ddlFtsEntscheide } from './fts';
import { BM25_GEWICHTE, FTS_ARTIKEL_SPALTEN } from './suche-kern';

const STANDALONE = (t: string) => ddlFtsEntscheide(t);

/** Genug Zeilen, dass FTS5 mehrere Segmente anlegt und mergt — mit einem einzigen Segment
 *  wäre der Test blind für genau den Fall, der den Index kompliziert macht. */
function zeilen(n: number): Array<[string, string, string, string, string]> {
  const aus: Array<[string, string, string, string, string]> = [];
  for (let i = 1; i <= n; i++) {
    aus.push([
      `bund/bge/${140 + (i % 9)}_III_${i}`,
      `BGE ${140 + (i % 9)} III ${i}`,
      `Regeste ${i}: Verjährung und Kündigung, Art. ${i} OR.`,
      `Die Beschwerde ist ${i % 3 === 0 ? 'gutzuheissen' : 'abzuweisen'}. ` +
        `Rechtsöffnung, Verjährung, Kündigung — «Zitat» mit "Anführung" und \\ Backslash. ` +
        `Füllwort${i % 41} `.repeat(30),
      `https://example.invalid/${i}`,
    ]);
  }
  return aus;
}

/** Baut die Tabelle so, wie der Sync sie HEUTE auf der Gegenseite baut: Zeile für Zeile. */
function ueberZeilen(n: number): DatabaseSync {
  const db = new DatabaseSync(':memory:');
  db.exec(STANDALONE('f'));
  const ins = db.prepare('INSERT INTO f(id, titel, regeste, text, quelle_url) VALUES (?, ?, ?, ?, ?)');
  for (const z of zeilen(n)) ins.run(...z);
  return db;
}

/** Spielt eine Shadow-Ladung in eine FRISCHE FTS5-Tabelle ein — exakt die Schritte, die
 *  `ladeFtsIndex()` in turso-sync.ts gegen Turso fährt. */
function ueberSchatten(quelle: DatabaseSync, mitContent: boolean, ddl: string): DatabaseSync {
  const db = new DatabaseSync(':memory:');
  db.exec(ddl);
  // `node:sqlite` schaltet SQLITE_DBCONFIG_DEFENSIVE standardmässig EIN und verbietet damit
  // Schreibzugriffe auf Shadow-Tabellen («table f_data may not be modified»). Der
  // libsql-Server hinter Turso tut das nicht — dort laufen die Inserts (empirisch geprüft
  // 4.8.2026). Für diesen Test wird der Riegel darum lokal gelöst, damit er DENSELBEN
  // Ablauf nachstellt, den der Sync remote fährt.
  // Feature-Guard (CI-Rot 4.8.2026): `enableDefensive()` existiert erst ab Node ≥23 —
  // dort ist DEFENSIVE auch erst standardmässig EIN. Auf Node 22 (CI) fehlt beides:
  // kein Riegel zu lösen, die Shadow-Inserts laufen direkt. Derselbe Test deckt so
  // beide Runtimes, ohne den nachgestellten Sync-Ablauf zu verändern.
  if (typeof db.enableDefensive === 'function') db.enableDefensive(false);
  // Eine frisch angelegte FTS5-Tabelle trägt bereits Zeilen in `_data` (averages + structure)
  // und `_config` (version). Ohne dieses Leeren kollidierten die PRIMARY KEYs beim Laden.
  db.exec('DELETE FROM f_data');
  db.exec('DELETE FROM f_config');
  for (const l of leseFtsSchatten(quelle, 'f', mitContent)) {
    const ins = db.prepare(
      `INSERT INTO f${l.suffix} (${l.spalten.join(', ')}) VALUES (${l.spalten.map(() => '?').join(', ')})`,
    );
    // BLOBs vor dem Re-Insert KOPIEREN (Gegenprüfung 4./5.8.2026, Probe 9): auf Node
    // 22.23.x bindet ein aus node:sqlite GELESENES Uint8Array(0) als SQL NULL
    // («NOT NULL constraint failed: f_idx.term»), eine frische Kopie bindet korrekt —
    // auf 22.23.1/22.23.2/24.16 verifiziert. Der Produktionspfad re-bindet nie via
    // node:sqlite (Hrana-base64 über Buffer.from, sauber auf 22.23.1) — betroffen war
    // ausschliesslich diese Test-Rekonstruktion.
    for (const w of l.werte) {
      const kopiert = w.map((v) => (v instanceof Uint8Array ? new Uint8Array(v) : v));
      ins.run(...(kopiert as Array<string | number | null | Uint8Array>));
    }
  }
  return db;
}

/** Die Abfragen, die api/suche.ts real fährt (SQL_ENTSCHEIDE_COUNT/_TREFFER in suche-kern.ts). */
function befund(db: DatabaseSync) {
  const zaehle = (w: string) =>
    (db.prepare(`SELECT count(*) AS n FROM f WHERE f MATCH '"${w}"'`).get() as { n: number }).n;
  return {
    gesamt: (db.prepare('SELECT count(*) AS n FROM f').get() as { n: number }).n,
    treffer: ['beschwerde', 'verjahrung', 'kundigung', 'rechtsoffnung', 'gutzuheissen'].map(zaehle),
    // Rangfolge UND Snippet — nicht nur «findet irgendwas»: eine kaputte Segment-Struktur
    // kann dieselbe Treffermenge bei anderer bm25-Ordnung liefern.
    top: db
      .prepare(
        `SELECT id, snippet(f, -1, '[', ']', '…', 8) AS snip FROM f WHERE f MATCH '"verjahrung"'
         ORDER BY bm25(f), rowid LIMIT 10`,
      )
      .all(),
  };
}

describe('FTS5-Shadow-Transport (turso-sync überträgt den fertigen Index statt der Zeilen)', () => {
  it('Shadow-Ladung reproduziert den Index verhaltensgleich — Treffer, bm25-Rang und Snippet', () => {
    const original = ueberZeilen(400);
    const kopie = ueberSchatten(original, true, STANDALONE('f'));
    const a = befund(original);
    const b = befund(kopie);
    expect(b.gesamt).toBe(a.gesamt);
    expect(b.treffer).toEqual(a.treffer);
    expect(b.top).toEqual(a.top);
    // Der Test wäre wertlos, wenn die Proben gar nichts fänden (§6.7).
    expect(a.gesamt).toBe(400);
    expect(a.treffer.every((n) => n > 0)).toBe(true);
    expect(a.top.length).toBeGreaterThan(0);
  });

  it('FTS5 meldet den übertragenen Index als integer (integrity-check)', () => {
    const kopie = ueberSchatten(ueberZeilen(400), true, STANDALONE('f'));
    expect(() => kopie.exec("INSERT INTO f(f) VALUES('integrity-check')")).not.toThrow();
  });

  it('integrity-check schlägt an, wenn eine Shadow-Zeile fehlt (das Tor kann scheitern, §6.7)', () => {
    const kopie = ueberSchatten(ueberZeilen(400), true, STANDALONE('f'));
    // Eine einzige Index-Seite entfernen — die Zeilenzahl bleibt unverändert, nur der Index
    // ist unvollständig. Genau der stille Fehlmodus, gegen den der integrity-check steht.
    kopie.exec('DELETE FROM f_data WHERE id = (SELECT max(id) FROM f_data)');
    expect(() => kopie.exec("INSERT INTO f(f) VALUES('integrity-check')")).toThrow();
  });

  it('contentless (fts_artikel) überträgt sich gleich — Treffer, rowid-Spanne, integrity-check', () => {
    // Eigener Fall, weil `fts_artikel` remote CONTENTLESS liegt: dort gibt es keine
    // `_content`-Tabelle, gegen die der integrity-check rechnen könnte. Die Prüfung wäre
    // also denkbar blind — sie ist es nicht (letzte Zusicherung unten), und die
    // rowid-Spannweite, an der die Nachkontrolle des Syncs hängt, überlebt den Transport.
    const contentless = `CREATE VIRTUAL TABLE f USING fts5(text, content='', tokenize='${TOKENIZER}')`;
    const original = new DatabaseSync(':memory:');
    original.exec(contentless);
    const ins = original.prepare('INSERT INTO f(rowid, text) VALUES (?, ?)');
    // rowids mit Lücken — genau wie `artikel.rowid` sie haben darf (Gegenprüfungs-Befund B2).
    for (let i = 1; i <= 400; i++) ins.run(i * 3, `Verjährung Beschwerde Kündigung ${i} ${`fuell${i % 29} `.repeat(25)}`);

    const kopie = ueberSchatten(original, false, contentless);
    const spanne = (db: DatabaseSync) => JSON.stringify(db.prepare('SELECT min(rowid) AS a, max(rowid) AS b FROM f').get());
    const treffer = (db: DatabaseSync) =>
      (db.prepare(`SELECT count(*) AS n FROM f WHERE f MATCH '"verjahrung"'`).get() as { n: number }).n;
    expect(kopie.prepare('SELECT count(*) AS n FROM f').get()).toEqual({ n: 400 });
    expect(treffer(kopie)).toBe(treffer(original));
    expect(treffer(kopie)).toBe(400);
    expect(spanne(kopie)).toBe(spanne(original));
    expect(spanne(kopie)).toBe('{"a":3,"b":1200}');
    expect(() => kopie.exec("INSERT INTO f(f) VALUES('integrity-check')")).not.toThrow();
    // Und er ist auch ohne `_content` nicht blind:
    kopie.exec('DELETE FROM f_data WHERE id = (SELECT max(id) FROM f_data)');
    expect(() => kopie.exec("INSERT INTO f(f) VALUES('integrity-check')")).toThrow();
  });

  it('sechsspaltiger contentless Index überträgt sich verhaltensgleich (fts_artikel seit K1)', () => {
    // Die REALE heutige Form von `fts_artikel` (QS-BASIS (d) K1, 31.8.2026): sechs
    // Spalten, contentless, rowid == artikel.rowid. Der Shadow-Transport war bis dahin
    // nur für EINE Spalte belegt — und die Spaltenzahl geht in die `_docsize`-Kodierung
    // ein. Ohne diesen Fall wäre die tragende Annahme des Syncs für die Form, die er
    // heute wirklich überträgt, ungeprüft.
    //
    // Geprüft wird nicht nur «findet etwas», sondern die bm25-RANGFOLGE UNTER
    // FELDGEWICHTEN: genau daran hängt seit K1 die Trefferqualität, und genau das
    // würde eine verschobene Spaltenzuordnung still verfälschen.
    // Spalten und DDL kommen aus der PRODUKTIONSQUELLE (F5): stünden sie hier als
    // eigenes Literal, prüfte der Test nach einer Umsortierung von
    // FTS_ARTIKEL_SPALTEN weiterhin die alte Reihenfolge — und bliebe grün, während
    // der Sync die neue überträgt. Die Reihenfolge ist tragend (bm25-Gewichte).
    const spalten = [...FTS_ARTIKEL_SPALTEN];
    const ddl = ddlFtsArtikel('f');
    const original = new DatabaseSync(':memory:');
    original.exec(ddl);
    const ins = original.prepare(
      `INSERT INTO f(rowid, ${spalten.join(', ')}) VALUES (${['?', ...spalten.map(() => '?')].join(', ')})`,
    );
    for (let i = 1; i <= 400; i++) {
      ins.run(
        i * 3,
        `Artikeltext ${i} ${`fuell${i % 31} `.repeat(20)}`,
        i % 5 === 0 ? 'Verjährung' : `Randtitel ${i}`,
        i % 7 === 0 ? 'Bei Bürgschaft' : '',
        i % 3 === 0 ? 'Achter Titel: Die Miete' : `Titel ${i % 11}`,
        i % 4 === 0 ? 'Gebühr 120 Franken' : '',
        i % 6 === 0 ? 'AS 1990 802; BBl 1985 I 1389' : '',
      );
    }

    const kopie = ueberSchatten(original, false, ddl);
    const rang = (db: DatabaseSync, wort: string) =>
      JSON.stringify(
        db
          .prepare(
            // Gewichte ebenfalls aus der Produktionsquelle (F5) — eine Zweitkopie
            // hätte die Rangfolge gegen eine Gewichtung geprüft, die nirgends mehr gilt.
            `SELECT rowid FROM f WHERE f MATCH '"${wort}"'
             ORDER BY bm25(f, ${BM25_GEWICHTE.join(', ')}), rowid LIMIT 15`,
          )
          .all(),
      );
    for (const wort of ['verjahrung', 'miete', 'burgschaft', 'gebuhr', 'bbl', 'artikeltext']) {
      expect(rang(kopie, wort), `Rangfolge für «${wort}»`).toBe(rang(original, wort));
    }
    // Der Test wäre wertlos, wenn die Proben nichts fänden (§6.7).
    expect(rang(original, 'verjahrung')).not.toBe('[]');
    expect(rang(original, 'miete')).not.toBe('[]');
    expect(() => kopie.exec("INSERT INTO f(f) VALUES('integrity-check')")).not.toThrow();
  });

  it('contentless und external content tragen BYTE-GLEICHE Index-Shadowtabellen', () => {
    // Trug bis 31.8.2026 die Annahme, mit der `fts_artikel` übertragen wurde: lokal
    // external content über `artikel`, remote contentless. NACHTRAG QS-BASIS (d) K1:
    // `fts_artikel` liegt seit dem 31.8.2026 auf BEIDEN Seiten contentless — der
    // Produktionspfad setzt diese Gleichheit also nicht mehr voraus. Der Fall bleibt
    // trotzdem stehen: er ist die einzige Stelle, an der die Gleichheit der beiden
    // FTS5-Bauarten überhaupt belegt ist, und `fts_entscheide_schaufenster` sowie jede
    // künftige external-content-Tabelle stützen sich weiterhin darauf. Kippt sie in
    // einer künftigen SQLite-Fassung, will man es hier erfahren und nicht im Betrieb.
    const text = (i: number) => `Verjährung Beschwerde Kündigung Nr ${i} ${`wort${i % 37} `.repeat(20)}`;

    const contentless = new DatabaseSync(':memory:');
    contentless.exec(`CREATE VIRTUAL TABLE f USING fts5(text, content='', tokenize='${TOKENIZER}')`);
    const iC = contentless.prepare('INSERT INTO f(rowid, text) VALUES (?, ?)');

    const extern = new DatabaseSync(':memory:');
    extern.exec('CREATE TABLE artikel (text TEXT)');
    extern.exec(`CREATE VIRTUAL TABLE f USING fts5(text, content='artikel', content_rowid='rowid', tokenize='${TOKENIZER}')`);
    const iE = extern.prepare('INSERT INTO f(rowid, text) VALUES (?, ?)');

    // Nicht lückenlos ab 1: die rowid-Lücken sind real (artikel.rowid), und sie gehen in die
    // Doclist-Kodierung ein.
    for (let i = 1; i <= 300; i++) {
      iC.run(i * 3, text(i));
      iE.run(i * 3, text(i));
    }
    const roh = (db: DatabaseSync) => JSON.stringify([...leseFtsSchatten(db, 'f', false)]);
    expect(roh(extern)).toBe(roh(contentless));
  });
});
