// scripts/datenhaltung/turso-sync.ts
// QS-DATA E2: synchronisiert die HOT-Replika in die Turso-DB (FAHRPLAN-DATENHALTUNG §5 E2 + §6).
//
// VOLL-REBUILD-Semantik (Weiche C, §10(7)): jede Synchronisation baut die Ziel-Tabellen
// komplett neu (DROP → CREATE → Bulk-Load → FTS-Rebuild) — determinismus-beweisbar, kein
// Delta-Drift. Quelle sind die lokalen Doktyp-Artefakte (daten/normtext.db +
// daten/rechtsprechung.db, ihrerseits aus den committeten JSONs reproduzierbar) —
// die amtliche Quelle bleibt Arbiter, Turso ist reine Serving-Kopie (§0 selbst-gehostet-
// Prinzip: portabel, Anbieterwechsel = andere URL).
//
// HOT-Inhalt (§11.5): erlasse + erlass_fassungen + artikel + fts_artikel (external content,
// via 'rebuild' aus artikel — KEINE zweite Textkopie über den Draht) und
// fts_entscheide_schaufenster (standalone, 342 kuratierte Entscheide).
//
// Transport: Hrana-HTTP-Pipeline (/v2/pipeline), dependency-frei via fetch — derselbe
// Endpunkt, den api/suche.ts liest. Secrets: TURSO_AUTH_TOKEN aus Env oder
// daten/turso-token.txt (gitignored); NIE loggen.
//
// Aufruf: npm run datenhaltung:turso-sync   (vorher: npm run datenhaltung:build)
import { readFileSync, existsSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { bloeckeText } from './suche-kern';

const URL_STD = 'libsql://lexmetrik-ravedave.aws-eu-west-1.turso.io';
const TOKEN_DATEI = 'daten/turso-token.txt';

type Wert = string | number | null;
interface Stmt {
  sql: string;
  args?: Wert[];
}

function httpUrl(basis: string): string {
  return basis.replace(/^libsql:\/\//, 'https://').replace(/\/$/, '');
}

function ladeZugang(): { url: string; token: string } {
  const url = process.env.TURSO_DATABASE_URL ?? URL_STD;
  const token =
    process.env.TURSO_AUTH_TOKEN ??
    (existsSync(TOKEN_DATEI) ? readFileSync(TOKEN_DATEI, 'utf8').trim() : '');
  if (!token) {
    console.error(`turso-sync ROT: kein Token (Env TURSO_AUTH_TOKEN oder ${TOKEN_DATEI}).`);
    process.exit(1);
  }
  return { url: httpUrl(url), token };
}

/** fetch mit Retry (transienten Netz-/5xx-Fehlern gewachsen — der Lauf ist lang). */
async function fetchRetry(input: string, init: RequestInit, versuche = 4): Promise<Response> {
  let letzter: unknown;
  for (let i = 0; i < versuche; i++) {
    try {
      const res = await fetch(input, init);
      if (res.status >= 500) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (e) {
      letzter = e;
      const wartezeit = [1000, 4000, 10000][i] ?? 15000;
      process.stdout.write(`\n  retry ${i + 1}/${versuche - 1} in ${wartezeit / 1000}s (${e instanceof Error ? e.message : e})\n`);
      await new Promise((r) => setTimeout(r, wartezeit));
    }
  }
  throw letzter;
}

async function pipeline(url: string, token: string, stmts: Stmt[]): Promise<void> {
  const body = {
    requests: [
      ...stmts.map((s) => ({
        type: 'execute' as const,
        stmt: {
          sql: s.sql,
          args: (s.args ?? []).map((v) =>
            v === null
              ? { type: 'null' as const, value: null }
              : typeof v === 'number'
                ? { type: 'integer' as const, value: String(v) }
                : { type: 'text' as const, value: v },
          ),
        },
      })),
      { type: 'close' as const },
    ],
  };
  const res = await fetchRetry(`${url}/v2/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Turso HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const daten = (await res.json()) as { results: Array<{ type: string; error?: { message: string } }> };
  for (const r of daten.results) {
    if (r.type === 'error') throw new Error(`Turso stmt-Fehler: ${r.error?.message}`);
  }
}

async function abfrage(url: string, token: string, sql: string): Promise<string | null> {
  const res = await fetchRetry(`${url}/v2/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ requests: [{ type: 'execute', stmt: { sql } }, { type: 'close' }] }),
  });
  if (!res.ok) throw new Error(`Turso HTTP ${res.status}`);
  const daten = (await res.json()) as {
    results: Array<{ response?: { result?: { rows: Array<Array<{ value: string | null }>> } } }>;
  };
  return daten.results[0]?.response?.result?.rows[0]?.[0]?.value ?? null;
}

/** Bulk-Load einer Tabelle: Zeilen aus der lokalen DB lesen, batched pushen (~200/Request). */
async function ladeTabelle(
  url: string,
  token: string,
  lokal: DatabaseSync,
  tabelle: string,
  spalten: string[],
  batch = 200,
): Promise<number> {
  const rows = lokal
    .prepare(`SELECT ${spalten.join(', ')} FROM ${tabelle} ORDER BY rowid`)
    .all() as Array<Record<string, Wert>>;
  const platzhalter = `(${spalten.map(() => '?').join(', ')})`;
  const sql = `INSERT INTO ${tabelle} (${spalten.join(', ')}) VALUES ${platzhalter}`;
  for (let i = 0; i < rows.length; i += batch) {
    const stueck = rows.slice(i, i + batch);
    await pipeline(
      url,
      token,
      stueck.map((r) => ({ sql, args: spalten.map((s) => r[s] ?? null) })),
    );
    if ((i / batch) % 20 === 0) process.stdout.write(`  ${tabelle}: ${Math.min(i + batch, rows.length)}/${rows.length}\r`);
  }
  process.stdout.write(`  ${tabelle}: ${rows.length}/${rows.length}\n`);
  return rows.length;
}

const TOKENIZER = 'unicode61 remove_diacritics 2';

async function main(): Promise<void> {
  const { url, token } = ladeZugang();
  const normtext = new DatabaseSync('daten/normtext.db');
  const rspr = new DatabaseSync('daten/rechtsprechung.db');

  const nurFts = process.argv.includes('--nur-fts');
  console.log(nurFts ? 'turso-sync: NUR-FTS-Neubau (Basistabellen bleiben).' : 'turso-sync: VOLL-REBUILD der Hot-Replika beginnt (Weiche C).');

  let nErlasse = 0, nFassungen = 0, nArtikel = 0;
  if (!nurFts) {
  // 1) Alles fallen lassen (atomarer Neuaufbau; Reihenfolge: FTS vor Basistabellen).
  await pipeline(url, token, [
    { sql: 'DROP TABLE IF EXISTS fts_entscheide_schaufenster' },
    { sql: 'DROP TABLE IF EXISTS fts_artikel' },
    { sql: 'DROP TABLE IF EXISTS artikel' },
    { sql: 'DROP TABLE IF EXISTS erlass_fassungen' },
    { sql: 'DROP TABLE IF EXISTS erlasse' },
  ]);

  // 2) DDL (Teilmenge des §3-Zielschemas — exakt die Spalten, die SQL_ARTIKEL_TREFFER braucht).
  await pipeline(url, token, [
    {
      sql: `CREATE TABLE erlasse (key TEXT PRIMARY KEY, ebene TEXT NOT NULL, kanton TEXT, sr TEXT,
            abkuerzung TEXT NOT NULL, titel TEXT NOT NULL, rechtsgebiet TEXT, status TEXT)`,
    },
    {
      sql: `CREATE TABLE erlass_fassungen (erlass_key TEXT NOT NULL, fassungs_token TEXT NOT NULL,
            gueltig_von TEXT, gueltig_bis TEXT, stand TEXT, quelle_url TEXT NOT NULL,
            as_fundstelle TEXT, abgerufen TEXT, sha TEXT,
            PRIMARY KEY (erlass_key, fassungs_token))`,
    },
    {
      sql: `CREATE TABLE artikel (erlass_key TEXT NOT NULL, fassungs_token TEXT NOT NULL,
            art_id TEXT NOT NULL, ord INTEGER, artikel TEXT, artikel_label TEXT, marg TEXT,
            grundlage TEXT, quelle_url TEXT, bloecke_json TEXT NOT NULL, sha TEXT,
            PRIMARY KEY (erlass_key, fassungs_token, art_id))`,
    },
    { sql: 'CREATE INDEX ix_artikel_erlass ON artikel(erlass_key)' },
  ]);

  // 3) Daten (Spaltenlisten == lokale Zieltabellen; ladeTabelle liest sie 1:1).
  nErlasse = await ladeTabelle(url, token, normtext, 'erlasse', [
    'key', 'ebene', 'kanton', 'sr', 'abkuerzung', 'titel', 'rechtsgebiet', 'status',
  ]);
  nFassungen = await ladeTabelle(url, token, normtext, 'erlass_fassungen', [
    'erlass_key', 'fassungs_token', 'gueltig_von', 'gueltig_bis', 'stand', 'quelle_url',
    'as_fundstelle', 'abgerufen', 'sha',
  ]);
  nArtikel = await ladeTabelle(url, token, normtext, 'artikel', [
    'erlass_key', 'fassungs_token', 'art_id', 'ord', 'artikel', 'artikel_label', 'marg',
    'grundlage', 'quelle_url', 'bloecke_json', 'sha',
  ], 80);

  } else {
    await pipeline(url, token, [
      { sql: 'DROP TABLE IF EXISTS fts_entscheide_schaufenster' },
      { sql: 'DROP TABLE IF EXISTS fts_artikel' },
    ]);
  }

  // 4) FTS: artikel (remote contentless) + rebuild (kein zweiter Text über den Draht);
  //    Schaufenster-Entscheide standalone (Text physisch, 342 Zeilen — direkt laden).
  await pipeline(url, token, [
    {
      sql: `CREATE VIRTUAL TABLE fts_artikel USING fts5(text, content='', tokenize='${TOKENIZER}')`,
    },
  ]);
  // external content: der Index braucht die extrahierten Texte einmalig — lokal berechnet,
  // batched als (rowid, text) eingespielt (identisch zu fts.ts/baueFtsArtikel).
  // Text direkt aus bloecke_json berechnen (external-content-FTS liefert lokal keinen Text zurueck)
  const artikelTexte = (normtext
    .prepare('SELECT rowid AS rowid, bloecke_json AS bj FROM artikel ORDER BY rowid')
    .all() as Array<{ rowid: number; bj: string }>).map((r) => ({ rowid: r.rowid, text: bloeckeText(r.bj) }));
  for (let i = 0; i < artikelTexte.length; i += 150) {
    const stueck = artikelTexte.slice(i, i + 150);
    await pipeline(
      url,
      token,
      stueck.map((r) => ({ sql: 'INSERT INTO fts_artikel(rowid, text) VALUES (?, ?)', args: [r.rowid, r.text] })),
    );
    if ((i / 150) % 20 === 0) process.stdout.write(`  fts_artikel: ${Math.min(i + 150, artikelTexte.length)}/${artikelTexte.length}\r`);
  }
  process.stdout.write(`  fts_artikel: ${artikelTexte.length}/${artikelTexte.length}\n`);

  await pipeline(url, token, [
    {
      sql: `CREATE VIRTUAL TABLE fts_entscheide_schaufenster USING fts5(id UNINDEXED, titel,
            regeste, text, quelle_url UNINDEXED, tokenize='${TOKENIZER}')`,
    },
  ]);
  const entscheide = rspr
    .prepare('SELECT id, titel, regeste, text, quelle_url FROM fts_entscheide_schaufenster')
    .all() as Array<Record<string, Wert>>;
  for (let i = 0; i < entscheide.length; i += 50) {
    const stueck = entscheide.slice(i, i + 50);
    await pipeline(
      url,
      token,
      stueck.map((r) => ({
        sql: 'INSERT INTO fts_entscheide_schaufenster(id, titel, regeste, text, quelle_url) VALUES (?, ?, ?, ?, ?)',
        args: [r.id ?? null, r.titel ?? null, r.regeste ?? null, r.text ?? null, r.quelle_url ?? null],
      })),
    );
  }
  console.log(`  fts_entscheide_schaufenster: ${entscheide.length}/${entscheide.length}`);

  // 5) Verifikation (doppelt): Zeilenzahlen remote == lokal + MATCH-Smoke beider Indizes.
  const sollErlasse = nurFts ? Number(await abfrage(url, token, 'SELECT count(*) FROM erlasse')) : nErlasse;
  const sollFassungen = nurFts ? Number(await abfrage(url, token, 'SELECT count(*) FROM erlass_fassungen')) : nFassungen;
  const sollArtikel = nurFts ? Number(await abfrage(url, token, 'SELECT count(*) FROM artikel')) : nArtikel;
  const checks: Array<[string, string, number]> = [
    ['erlasse', 'SELECT count(*) FROM erlasse', sollErlasse],
    ['erlass_fassungen', 'SELECT count(*) FROM erlass_fassungen', sollFassungen],
    ['artikel', 'SELECT count(*) FROM artikel', sollArtikel],
    ['fts_artikel', "SELECT count(*) FROM fts_artikel WHERE fts_artikel MATCH '\"und\"'", -1],
    ['fts_entscheide', 'SELECT count(*) FROM fts_entscheide_schaufenster', entscheide.length],
  ];
  let rot = false;
  for (const [name, sql, soll] of checks) {
    const ist = Number(await abfrage(url, token, sql));
    const ok = soll === -1 ? ist > 0 : ist === soll;
    if (!ok) rot = true;
    console.log(`  verify ${name}: remote=${ist}${soll >= 0 ? ` soll=${soll}` : ''} ${ok ? 'OK' : 'ROT'}`);
  }
  const smoke = Number(await abfrage(url, token, `SELECT count(*) FROM fts_artikel WHERE fts_artikel MATCH '"verjahrung"'`));
  console.log(`  smoke MATCH "verjahrung" (diakritik-gefaltet): ${smoke} Treffer ${smoke > 0 ? 'OK' : 'ROT'}`);
  if (rot || smoke <= 0) {
    console.error('turso-sync ROT.');
    process.exit(1);
  }
  console.log('turso-sync grün: Hot-Replika vollständig + verifiziert.');
}

main().catch((e) => {
  console.error('turso-sync ROT:', e instanceof Error ? e.message : e);
  process.exit(1);
});
