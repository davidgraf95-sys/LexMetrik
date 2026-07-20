// scripts/datenhaltung/turso-sync.ts
// QS-DATA E2: synchronisiert die HOT-Replika in die Turso-DB (FAHRPLAN-DATENHALTUNG §5 E2 + §6).
//
// VOLL-REBUILD-Semantik (Weiche C, §10(7)): jede Synchronisation baut die Ziel-Tabellen
// komplett neu — determinismus-beweisbar, kein Delta-Drift. Quelle sind die lokalen
// Doktyp-Artefakte (daten/normtext.db + daten/rechtsprechung.db, ihrerseits aus den
// committeten JSONs reproduzierbar) — die amtliche Quelle bleibt Arbiter, Turso ist reine
// Serving-Kopie (§0 selbst-gehostet-Prinzip: portabel, Anbieterwechsel = andere URL).
//
// SCHATTEN-TABELLEN statt DROP-zuerst (Reparatur 20.7.2026). Der frühere Ablauf war
// DROP → CREATE → Bulk-Load: jeder Abbruch mittendrin (CI-Timeout!) liess die Prod-Replika
// HALB LEER zurück — genau das ist am 19./20.7.2026 passiert (remote artikel 16'400 von
// 55'822, fts_entscheide_schaufenster gar nicht vorhanden), und api/suche hat tagelang
// einen verstümmelten Index serviert, ohne rot zu werden. Jetzt wird in `<tabelle>_neu`
// geladen, VOR dem Tausch verifiziert und erst dann getauscht — der Tausch selbst läuft als
// echte Transaktion über zwei Requests (`transaktion()`, BEGIN und COMMIT getrennt über den
// Hrana-`baton`). Ein Abbruch während des Ladens lässt den alten, vollständigen Stand
// unangetastet; ein Fehler im Tausch rollt zurück, statt einen Teilzustand festzuschreiben.
//
// TRANSPORT-ÖKONOMIE (Reparatur 20.7.2026, gemessen). Der frühere Weg schickte je Zeile ein
// eigenes `execute` in die Pipeline. Jedes `execute` ist bei Hrana eine EIGENE implizite
// Transaktion → ein durabler Commit samt Replikation PRO ZEILE. Gemessen (aws-eu-west-1):
//   400 Einzel-Statements ohne Transaktion ....  12'131 ms →    33 Zeilen/s
//   400 Einzel-Statements mit BEGIN/COMMIT ....     525 ms →   762 Zeilen/s
//   400 Zeilen als Mehrzeilen-INSERT ..........     280 ms →  1429 Zeilen/s
// Bei 61k Zeilen sind das 46 min gegen ~1 min — der 20-min-Job-Timeout war die Folge, nicht
// die Ursache. Darum: Mehrzeilen-`INSERT ... VALUES (…),(…),…`, mehrere Statements je
// Request, das Ganze in BEGIN/COMMIT geklammert. Die Schranken (Bind-Parameter, Statement-
// und Request-Grösse) rechnen Argument-Nutzlast UND SQL-Gerüst in der Hrana-Kodierung —
// `zeilenBytes()` erklärt, warum eine pauschale Schätzung hier zweimal danebenlag, und
// `ladeWerte()`, warum das SQL mitgezählt werden muss. Kompression wurde geprüft und
// VERWORFEN: der Endpunkt lehnt `Content-Encoding: gzip` mit HTTP 400 ab (empirisch).
//
// VERBLEIBENDER ENGPASS (gemessen 20.7.2026, CI-Lauf 29757068566): die Entscheid-Phase
// braucht 22,3 der 32,8 Minuten — 5093 Zeilen / 165 MiB bei 4 Zeilen/s. Dieselbe Rate lokal
// über eine Heim-Leitung, also KEIN Bandbreiten-Problem, sondern der Schreibpfad der
// Gegenseite für grosse FTS5-Mehrzeilen-Inserts (~2,9 MiB je Request in ~22 s ≈ 128 KiB/s).
// Ein schnellerer Runner hilft nicht. Wächst der Entscheid-Korpus deutlich, ist das der
// Punkt, der als Nächstes reisst — dann greift eine der Weichen, die hier bewusst NICHT
// gezogen wurden (inkrementeller Sync mit stabilen rowids, oder Entscheide in einen
// eigenen, seltener laufenden Job). `timeout-minutes: 90` trägt ~3,7x den heutigen Korpus.
//
// HOT-Inhalt (§11.5): erlasse + erlass_fassungen + artikel + fts_artikel (contentless FTS5,
// Text einmalig lokal aus bloecke_json extrahiert) und fts_entscheide_schaufenster
// (standalone, ALLE Schaufenster-Entscheide der rechtsprechung.db — Stand 20.7.2026 sind
// das 5093, nicht mehr die 342 der E2-Erstfassung; der Bau filtert bewusst nicht, siehe
// fts.ts/baueFtsEntscheideSchaufenster).
//
// Transport: Hrana-HTTP-Pipeline (/v2/pipeline), dependency-frei via fetch — derselbe
// Endpunkt, den api/suche.ts liest. Secrets: TURSO_AUTH_TOKEN aus Env oder
// daten/turso-token.txt (gitignored); NIE loggen.
//
// Aufruf: npm run datenhaltung:turso-sync   (vorher: npm run datenhaltung:build)
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { bloeckeText } from './suche-kern';
import { manifestDb } from './manifest';
import {
  zeilenBytes,
  MAX_PARAM_JE_STMT,
  MAX_BYTES_JE_STMT,
  MAX_BYTES_JE_REQUEST,
  STMT_OVERHEAD,
  TUPEL_TRENNER,
  REQUEST_OVERHEAD,
} from './turso-transport';

const URL_STD = 'libsql://lexmetrik-ravedave.aws-eu-west-1.turso.io';
const TOKEN_DATEI = 'daten/turso-token.txt';
/** Committete Projektions-Signatur — Grundlage der Frische-Marke (§8-Wächter) UND des
 *  Quell-Riegels. Über `LEXMETRIK_MANIFEST` überschreibbar, damit der Riegel (positiv wie
 *  negativ) prüfbar ist, ohne die committete Datei anzufassen. */
export const MANIFEST_DATEI = process.env.LEXMETRIK_MANIFEST ?? 'daten-manifest.json';

/** Live-Tabellen der HOT-Replika, in Abhängigkeits-Reihenfolge (Basis zuerst).
 *  Der Tausch läuft sie vorwärts (RENAME) und rückwärts (DROP) ab. */
const SCHATTEN = ['erlasse', 'erlass_fassungen', 'artikel', 'fts_artikel', 'fts_entscheide_schaufenster'] as const;
/** Teilmenge für `--nur-fts` (Basistabellen bleiben stehen). */
const FTS_TABELLEN = ['fts_artikel', 'fts_entscheide_schaufenster'] as const;

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
      // Nach dem LETZTEN Versuch nicht mehr schlafen — der Fehler fliegt ohnehin
      // (Gegenprüfungs-Befund B10: bis zu 15 s sinnlose Wartezeit vor dem Werfen).
      if (i === versuche - 1) break;
      const wartezeit = [1000, 4000, 10000][i] ?? 15000;
      process.stdout.write(`\n  retry ${i + 1}/${versuche - 1} in ${wartezeit / 1000}s (${e instanceof Error ? e.message : e})\n`);
      await new Promise((r) => setTimeout(r, wartezeit));
    }
  }
  throw letzter;
}

function kodiereArg(v: Wert) {
  return v === null
    ? { type: 'null' as const, value: null }
    : typeof v === 'number'
      ? { type: 'integer' as const, value: String(v) }
      : { type: 'text' as const, value: v };
}

/** Ein Hrana-Request. `close: false` hält den Stream offen und liefert einen `baton`,
 *  mit dem ein Folge-Request auf DERSELBEN Verbindung (und damit in derselben
 *  Transaktion) weitermacht. Fehler werden zurückgegeben, nicht geworfen — der Aufrufer
 *  entscheidet, ob er COMMIT oder ROLLBACK schickt. */
async function pipelineRoh(
  url: string,
  token: string,
  stmts: Stmt[],
  opt: { baton?: string | null; close: boolean },
): Promise<{ baton: string | null; fehler: string[] }> {
  const body: Record<string, unknown> = {
    requests: [
      ...stmts.map((s) => ({
        type: 'execute' as const,
        stmt: { sql: s.sql, args: (s.args ?? []).map(kodiereArg) },
      })),
      ...(opt.close ? [{ type: 'close' as const }] : []),
    ],
  };
  if (opt.baton) body.baton = opt.baton;
  const res = await fetchRetry(`${url}/v2/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Turso HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const daten = (await res.json()) as {
    baton?: string | null;
    results: Array<{ type: string; error?: { message: string } }>;
  };
  const fehler = daten.results
    .map((r, i) => (r.type === 'error' ? `«${stmts[i]?.sql.slice(0, 60)}…» → ${r.error?.message}` : null))
    .filter((x): x is string => x !== null);
  return { baton: daten.baton ?? null, fehler };
}

async function pipeline(url: string, token: string, stmts: Stmt[]): Promise<void> {
  const { fehler } = await pipelineRoh(url, token, stmts, { close: true });
  if (fehler.length > 0) throw new Error(`Turso stmt-Fehler: ${fehler.join(' · ')}`);
}

/**
 * Führt `stmts` als ECHTE Transaktion aus: BEGIN + Statements in Request 1 (Stream bleibt
 * offen), Ergebnisse prüfen, dann COMMIT — oder bei jedem Fehler ROLLBACK.
 *
 * Warum nicht einfach BEGIN/…/COMMIT in EINEM Request: die Hrana-Pipeline bricht bei einem
 * fehlgeschlagenen Statement NICHT ab. Die Folge-Statements laufen weiter und das
 * mitgeschickte COMMIT gelingt — der Teilzustand wird also festgeschrieben. Empirisch
 * belegt (Gegenprüfung Runde 2): `BEGIN · DROP a · DROP b · RENAME a_neu→a ·
 * RENAME b_neu→b (Fehler) · COMMIT` liess Tabelle `b` DAUERHAFT verschwinden — exakt der
 * Zustand des Vorfalls vom 19.7. Mit getrenntem COMMIT über den `baton` überlebt der alte
 * Stand denselben Fehler unversehrt (ebenfalls empirisch belegt).
 *
 * Stirbt der Prozess zwischen den beiden Requests, wird nie committet — Turso verwirft den
 * offenen Stream, der alte Stand bleibt stehen. Genau das ist hier die gewünschte Semantik.
 */
async function transaktion(url: string, token: string, stmts: Stmt[]): Promise<void> {
  const phase1 = await pipelineRoh(url, token, [{ sql: 'BEGIN' }, ...stmts], { close: false });
  if (phase1.fehler.length > 0) {
    await pipelineRoh(url, token, [{ sql: 'ROLLBACK' }], { baton: phase1.baton, close: true }).catch(() => undefined);
    throw new Error(`Transaktion zurückgerollt (Live-Stand unverändert): ${phase1.fehler.join(' · ')}`);
  }
  const phase2 = await pipelineRoh(url, token, [{ sql: 'COMMIT' }], { baton: phase1.baton, close: true });
  if (phase2.fehler.length > 0) throw new Error(`COMMIT fehlgeschlagen: ${phase2.fehler.join(' · ')}`);
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

// Schranken + Nutzlast-Schätzung leben in einem seiteneffekt-freien Nachbarmodul, damit
// Unit-Tests sie prüfen können, ohne dieses Skript (und damit den Sync) zu starten.
export { zeilenBytes, MAX_PARAM_JE_STMT, MAX_BYTES_JE_STMT, MAX_BYTES_JE_REQUEST };

/**
 * Bulk-Load einer Tabelle über Mehrzeilen-INSERTs.
 *
 * Zwei Ebenen der Bündelung, beide daten-getrieben gedeckelt:
 *   1. Zeilen → Statement: `INSERT … VALUES (…),(…),…` bis MAX_PARAM_JE_STMT oder
 *      MAX_BYTES_JE_STMT erreicht ist (mindestens eine Zeile, auch wenn sie allein
 *      übergross ist — sonst käme sie nie durch).
 *   2. Statements → Request: bis MAX_BYTES_JE_REQUEST, geklammert in BEGIN/COMMIT, damit
 *      der Request EINEN durablen Commit auslöst statt einen je Zeile (43× schneller, s. o.).
 *
 * Reihenfolge bleibt `ORDER BY rowid` — der Ziel-rowid-Lauf ist damit identisch zur lokalen
 * DB, was `fts_artikel` (contentless, rowid == artikel.rowid) überhaupt erst tragfähig macht.
 */
async function ladeTabelle(
  url: string,
  token: string,
  lokal: DatabaseSync,
  quellTabelle: string,
  zielTabelle: string,
  spalten: string[],
): Promise<number> {
  const rows = lokal
    .prepare(`SELECT ${spalten.join(', ')} FROM ${quellTabelle} ORDER BY rowid`)
    .all() as Array<Record<string, Wert>>;
  const werteJeZeile = rows.map((r) => spalten.map((s) => r[s] ?? null));
  return ladeWerte(url, token, zielTabelle, spalten, werteJeZeile);
}

/** Kern des Mehrzeilen-Transports — nimmt fertige Wert-Tupel (auch berechnete wie fts_artikel). */
async function ladeWerte(
  url: string,
  token: string,
  zielTabelle: string,
  spalten: string[],
  werteJeZeile: Wert[][],
): Promise<number> {
  const kopf = `INSERT INTO ${zielTabelle} (${spalten.join(', ')}) VALUES `;
  const tupel = `(${spalten.map(() => '?').join(', ')})`;
  const tupelBytes = Buffer.byteLength(tupel, 'utf8') + TUPEL_TRENNER;
  const beginn = Date.now();

  let stmts: Stmt[] = [];
  // Startwert = Rahmen des Requests selbst (`{"requests":[…]}` + BEGIN/COMMIT/close). Die
  // Statement-Summe allein liess ihn aussen vor; real lag der Body dadurch konstant ~107 B
  // über der Schätzung (Gegenprüfung Runde 4, B5 — heute unerreichbar, aber die Schranke
  // soll eine Schranke sein und nicht knapp danebenliegen).
  let requestBytes = REQUEST_OVERHEAD;
  let gesendet = 0;

  const absenden = async (): Promise<void> => {
    if (stmts.length === 0) return;
    // BEGIN/COMMIT klammert den ganzen Request zu EINER Transaktion (der eigentliche Hebel).
    await pipeline(url, token, [{ sql: 'BEGIN' }, ...stmts, { sql: 'COMMIT' }]);
    stmts = [];
    requestBytes = REQUEST_OVERHEAD;
    const sek = (Date.now() - beginn) / 1000;
    process.stdout.write(
      `  ${zielTabelle}: ${gesendet}/${werteJeZeile.length} (${(gesendet / Math.max(sek, 0.001)).toFixed(0)} Zeilen/s)\r`,
    );
  };

  let i = 0;
  while (i < werteJeZeile.length) {
    // Ebene 1: so viele Zeilen in EIN Statement, wie Parameter- und Byte-Schranke zulassen.
    // Mitgezählt wird nicht nur die Argument-Nutzlast, sondern auch das SQL-GERÜST: der
    // Statement-Kopf, je Zeile das `(?, ?, …)`-Tupel und der `execute`-Rahmen. Ohne das
    // unterschätzte die Schranke schmale Tabellen massiv — `fts_artikel` hat nur zwei
    // Spalten und packte bis zu 4000 Tupel in ein Statement, deren SQL-Text allein die
    // Reserve auffrass: real 3,023 MiB gegen eine 3,00-MiB-Schranke (Gegenprüfung Runde 3).
    const gruppe: Wert[][] = [];
    let stmtBytes = STMT_OVERHEAD + Buffer.byteLength(kopf, 'utf8');
    while (i < werteJeZeile.length) {
      const b = zeilenBytes(werteJeZeile[i]) + tupelBytes;
      const passt =
        gruppe.length === 0 ||
        ((gruppe.length + 1) * spalten.length <= MAX_PARAM_JE_STMT && stmtBytes + b <= MAX_BYTES_JE_STMT);
      if (!passt) break;
      gruppe.push(werteJeZeile[i]);
      stmtBytes += b;
      i++;
    }
    // Ebene 2: Passt das Statement NICHT mehr in den laufenden Request, wird ZUERST
    // abgesendet. (Vorher wurde erst angehängt und danach geprüft — eine übergrosse
    // Einzelzeile konnte so auf einen bereits fast vollen Request draufsatteln;
    // Gegenprüfungs-Befund B7, real: BS-Entscheid SB.2018.46 mit 777 KiB.)
    if (stmts.length > 0 && requestBytes + stmtBytes > MAX_BYTES_JE_REQUEST) await absenden();
    stmts.push({ sql: kopf + gruppe.map(() => tupel).join(', '), args: gruppe.flat() });
    gesendet += gruppe.length;
    requestBytes += stmtBytes;
  }
  await absenden();

  const sek = (Date.now() - beginn) / 1000;
  process.stdout.write(
    `  ${zielTabelle}: ${werteJeZeile.length}/${werteJeZeile.length} in ${sek.toFixed(1)}s (${(werteJeZeile.length / Math.max(sek, 0.001)).toFixed(0)} Zeilen/s)\n`,
  );
  return werteJeZeile.length;
}

const TOKENIZER = 'unicode61 remove_diacritics 2';

async function main(): Promise<void> {
  const { url, token } = ladeZugang();
  const normtext = new DatabaseSync('daten/normtext.db');
  const rspr = new DatabaseSync('daten/rechtsprechung.db');

  const nurFts = process.argv.includes('--nur-fts');
  console.log(nurFts ? 'turso-sync: NUR-FTS-Neubau (Basistabellen bleiben).' : 'turso-sync: VOLL-REBUILD der Hot-Replika beginnt (Weiche C).');

  // 0a) QUELL-RIEGEL gegen das committete Manifest — die einzige UNABHÄNGIGE Zahl.
  //
  //     Ohne diesen Riegel validiert sich die ganze Kette gegen sich selbst: der Sync zählt,
  //     was er geladen hat, verifiziert diese Zahl gegen sich selbst, schreibt sie als Soll
  //     in `sync_meta`, und der Wächter vergleicht später Ist gegen genau dieses Soll. Ein
  //     verstümmelter lokaler Build (etwa `daten/normtext.db` mit 100 statt 55'822 Artikeln)
  //     liefe damit sauber durch, ginge live und wäre in ALLEN Toren grün — exakt der stille
  //     Fehlmodus, dessentwegen dieser Sync überhaupt repariert wurde (Gegenprüfung Runde 4).
  //     `daten-manifest.json` ist committet, wird vom Tor `check:datenhaltung` gegen den
  //     Generator gehalten und ist damit unabhängig von dem, was hier gerade geladen wird.
  //     Verglichen werden Zeilenzahl UND Inhalts-`sha` je Tabelle. Die Zeilenzahl allein
  //     genügt nicht: ein Build mit richtiger Anzahl und falschem Inhalt liefe durch
  //     (Gegenprüfung Runde 5, M1) — dieselbe Lücke, die im Wächter schon als «‹nicht leer›
  //     reicht nicht» erkannt worden war. Der sha kommt aus `manifestDb()`, also aus exakt
  //     derselben Kanonisierung, die `daten-manifest.json` erzeugt hat.
  const manifest = JSON.parse(readFileSync(MANIFEST_DATEI, 'utf8')) as Record<
    string,
    Record<string, { zeilen: number; sha: string }>
  >;
  const istNormtext = manifestDb(normtext);
  const istRspr = manifestDb(rspr);
  const zuPruefen: Array<[string, { zeilen: number; sha: string } | undefined, { zeilen: number; sha: string } | undefined]> = [
    ['erlasse', istNormtext['erlasse'], manifest['normtext.db']?.erlasse],
    ['erlass_fassungen', istNormtext['erlass_fassungen'], manifest['normtext.db']?.erlass_fassungen],
    ['artikel', istNormtext['artikel'], manifest['normtext.db']?.artikel],
    ['eintrag (Entscheide)', istRspr['eintrag'], manifest['rechtsprechung.db']?.eintrag],
  ];
  const quellFehler = zuPruefen.filter(
    ([, ist, soll]) => !ist || !soll || ist.zeilen !== soll.zeilen || ist.sha !== soll.sha,
  );
  if (quellFehler.length > 0) {
    console.error('turso-sync ROT: lokaler Build weicht vom committeten daten-manifest.json ab —');
    for (const [name, ist, soll] of quellFehler) {
      console.error(
        `  ${name}: lokal ${ist ? `${ist.zeilen} Zeilen / sha ${ist.sha.slice(0, 12)}…` : '(Tabelle fehlt)'}` +
          ` · Manifest ${soll ? `${soll.zeilen} Zeilen / sha ${soll.sha.slice(0, 12)}…` : '(Eintrag fehlt)'}`,
      );
    }
    console.error('Es wird NICHTS an die Live-Replika geschickt. Zuerst `npm run datenhaltung:build`');
    console.error('neu fahren (und `npm run check:datenhaltung` grün bekommen).');
    process.exit(1);
  }
  console.log(
    `  Quell-Riegel: lokaler Build == daten-manifest.json in Zeilenzahl UND sha (${zuPruefen
      .map(([n, ist]) => `${n} ${ist?.zeilen}`)
      .join(' · ')}).`,
  );

  // 0) Schatten-Reste eines abgebrochenen Vorlaufs wegräumen (idempotenter Start).
  await pipeline(url, token, SCHATTEN.map((t) => ({ sql: `DROP TABLE IF EXISTS ${t}_neu` })));

  // 0b) `--nur-fts` KORRESPONDENZ-RIEGEL (Gegenprüfungs-Befund B1, schwerster Befund).
  //     Dieser Modus baut `fts_artikel` aus den LOKALEN Zeilen, tauscht ihn aber gegen die
  //     LIVE `artikel`-Tabelle. Hinkt die live hinterher, zeigt die Suche systematisch den
  //     FALSCHEN Artikel — und weil Schritt 7 trotzdem die volle Frische-Marke schrieb, wäre
  //     der Wächter dazu auch noch grün geworden. Darum: Basistabellen müssen Zeile für Zeile
  //     UND stichprobenweise inhaltlich zur lokalen DB passen, sonst Abbruch.
  if (nurFts) {
    // Alle drei Basistabellen prüfen, nicht nur `artikel`: Schritt 8 stempelt am Ende einen
    // manifest_sha, der auch für `erlasse`/`erlass_fassungen` gilt (Runde 2, Befund 7).
    for (const t of ['erlasse', 'erlass_fassungen', 'artikel'] as const) {
      const lokal = (normtext.prepare(`SELECT count(*) AS n FROM ${t}`).get() as { n: number }).n;
      const remote = Number(await abfrage(url, token, `SELECT count(*) FROM ${t}`));
      if (lokal !== remote) {
        console.error(
          `turso-sync ROT: --nur-fts unzulässig — live ${t}=${remote}, lokal=${lokal}. ` +
            'Der FTS-Index würde auf einen fremden Zeilenbestand zeigen (falsche Treffer). ' +
            'Voll-Rebuild fahren: npm run datenhaltung:turso-sync (ohne --nur-fts).',
        );
        process.exit(1);
      }
    }
    // Zeilenzahl allein schliesst eine Verschiebung nicht aus (gleich viele, andere
    // Reihenfolge). Die Proben werden darum ÜBER DIE GANZE SPANNWEITE gestreut — fünf
    // aufeinanderfolgende rowids aus einer Region hätten eine Verschiebung, die erst weiter
    // hinten beginnt, glatt verpasst (Runde 2, Befund 7).
    const nArt = (normtext.prepare('SELECT count(*) AS n FROM artikel').get() as { n: number }).n;
    const stelle = normtext.prepare('SELECT rowid AS rid, erlass_key, art_id FROM artikel ORDER BY rowid LIMIT 1 OFFSET ?');
    // Der letzte Anteil ist bewusst 1.0 (= letzte Zeile): eine Umsortierung, die erst ganz
    // am Ende beginnt, entginge einer Streuung, die bei 0,99 aufhört (Runde 3).
    for (const anteil of [0, 0.17, 0.37, 0.53, 0.71, 0.89, 1]) {
      const p = stelle.get(Math.min(nArt - 1, Math.floor(nArt * anteil))) as
        | { rid: number; erlass_key: string; art_id: string }
        | undefined;
      if (!p) continue;
      const ist = await abfrage(url, token, `SELECT erlass_key || '|' || art_id FROM artikel WHERE rowid = ${p.rid}`);
      const soll = `${p.erlass_key}|${p.art_id}`;
      if (ist !== soll) {
        console.error(
          `turso-sync ROT: --nur-fts unzulässig — rowid ${p.rid} zeigt live auf «${ist}», lokal auf «${soll}». ` +
            'Die rowid-Kopplung ist verschoben; Voll-Rebuild fahren.',
        );
        process.exit(1);
      }
    }
    console.log('  --nur-fts Korrespondenz-Riegel: Basistabellen zeilengleich, 7 gestreute rowid-Proben deckungsgleich.');
  }

  let nErlasse = 0, nFassungen = 0, nArtikel = 0;
  if (!nurFts) {
  // 1) DDL auf den SCHATTEN-Tabellen (Teilmenge des §3-Zielschemas — exakt die Spalten,
  //    die SQL_ARTIKEL_TREFFER braucht). Die LIVE-Tabellen bleiben unangetastet, bis der
  //    Tausch in Schritt 6 gelingt. Index erst NACH dem Laden (schneller + kein Pflegeaufwand
  //    je Insert); der Name `ix_artikel_erlass` entsteht dort auf der getauschten Tabelle.
  await pipeline(url, token, [
    {
      sql: `CREATE TABLE erlasse_neu (key TEXT PRIMARY KEY, ebene TEXT NOT NULL, kanton TEXT, sr TEXT,
            abkuerzung TEXT NOT NULL, titel TEXT NOT NULL, rechtsgebiet TEXT, status TEXT)`,
    },
    {
      sql: `CREATE TABLE erlass_fassungen_neu (erlass_key TEXT NOT NULL, fassungs_token TEXT NOT NULL,
            gueltig_von TEXT, gueltig_bis TEXT, stand TEXT, quelle_url TEXT NOT NULL,
            as_fundstelle TEXT, abgerufen TEXT, sha TEXT,
            PRIMARY KEY (erlass_key, fassungs_token))`,
    },
    {
      sql: `CREATE TABLE artikel_neu (erlass_key TEXT NOT NULL, fassungs_token TEXT NOT NULL,
            art_id TEXT NOT NULL, ord INTEGER, artikel TEXT, artikel_label TEXT, marg TEXT,
            grundlage TEXT, quelle_url TEXT, bloecke_json TEXT NOT NULL, sha TEXT,
            PRIMARY KEY (erlass_key, fassungs_token, art_id))`,
    },
  ]);

  // 2) Daten (Spaltenlisten == lokale Zieltabellen; ladeTabelle liest sie 1:1).
  nErlasse = await ladeTabelle(url, token, normtext, 'erlasse', 'erlasse_neu', [
    'key', 'ebene', 'kanton', 'sr', 'abkuerzung', 'titel', 'rechtsgebiet', 'status',
  ]);
  nFassungen = await ladeTabelle(url, token, normtext, 'erlass_fassungen', 'erlass_fassungen_neu', [
    'erlass_key', 'fassungs_token', 'gueltig_von', 'gueltig_bis', 'stand', 'quelle_url',
    'as_fundstelle', 'abgerufen', 'sha',
  ]);
  // `rowid` wird EXPLIZIT mitgeladen — nicht kosmetisch, sondern tragend: api/suche.ts
  // joint `fts_artikel` (contentless) über `a.rowid = fts_artikel.rowid` auf `artikel`.
  // Würde die Ziel-rowid implizit vergeben, hinge die Korrektheit daran, dass die lokalen
  // artikel-rowids lückenlos 1..N sind. Das gilt heute zufällig (frisch gebaute DB ohne
  // DELETE), ist aber nirgends garantiert — eine einzige Lücke in der Quelle verschiebt
  // alle folgenden Zeilen und liefert im Betrieb den FALSCHEN Artikel als Suchtreffer
  // (Gegenprüfungs-Befund B2, am Minimalbeispiel reproduziert). Mit expliziter rowid ist
  // die Kopplung unabhängig von der Lückenlosigkeit korrekt.
  nArtikel = await ladeTabelle(url, token, normtext, 'artikel', 'artikel_neu', [
    'rowid', 'erlass_key', 'fassungs_token', 'art_id', 'ord', 'artikel', 'artikel_label', 'marg',
    'grundlage', 'quelle_url', 'bloecke_json', 'sha',
  ]);
  }

  // 3) FTS artikel: remote CONTENTLESS (content=''), rowid == artikel.rowid. Der indexierte
  //    Text wird lokal aus bloecke_json extrahiert (identisch zu fts.ts/baueFtsArtikel) und
  //    einmalig übertragen — es geht KEINE zweite strukturierte Textkopie über den Draht.
  await pipeline(url, token, [
    { sql: `CREATE VIRTUAL TABLE fts_artikel_neu USING fts5(text, content='', tokenize='${TOKENIZER}')` },
  ]);
  const artikelTexte = (normtext
    .prepare('SELECT rowid AS rowid, bloecke_json AS bj FROM artikel ORDER BY rowid')
    .all() as Array<{ rowid: number; bj: string }>).map((r) => [r.rowid, bloeckeText(r.bj)] as Wert[]);
  await ladeWerte(url, token, 'fts_artikel_neu', ['rowid', 'text'], artikelTexte);

  // 4) FTS Schaufenster-Entscheide: standalone (Text physisch gespeichert, native snippet()).
  //    Umfang = ALLE Einträge der rechtsprechung.db (Stand 20.7.2026: 5093) — kein Filter,
  //    damit die Suche denselben Korpus kennt, den der Reader zeigt (§8: keine stille Teilmenge).
  await pipeline(url, token, [
    {
      sql: `CREATE VIRTUAL TABLE fts_entscheide_schaufenster_neu USING fts5(id UNINDEXED, titel,
            regeste, text, quelle_url UNINDEXED, tokenize='${TOKENIZER}')`,
    },
  ]);
  // `ORDER BY rowid` ausdrücklich: ohne ihn ist die Reihenfolge formal unbestimmt, obwohl
  // sie faktisch stimmte. Determinismus soll aus der Abfrage folgen, nicht aus Glück
  // (Gegenprüfungs-Befund B8).
  const entscheide = rspr
    .prepare('SELECT id, titel, regeste, text, quelle_url FROM fts_entscheide_schaufenster ORDER BY rowid')
    .all() as Array<Record<string, Wert>>;
  await ladeWerte(
    url,
    token,
    'fts_entscheide_schaufenster_neu',
    ['id', 'titel', 'regeste', 'text', 'quelle_url'],
    entscheide.map((r) => [r.id ?? null, r.titel ?? null, r.regeste ?? null, r.text ?? null, r.quelle_url ?? null]),
  );

  // 5) Verifikation VOR dem Tausch — auf den Schatten-Tabellen. Was hier rot ist, geht nie
  //    live; die alte, vollständige Replika bleibt in dem Fall unverändert stehen.
  console.log('  — Verifikation der Schatten-Tabellen (vor dem Tausch) —');
  const vorChecks: Array<[string, string, number]> = [];
  if (!nurFts) {
    vorChecks.push(
      ['erlasse_neu', 'SELECT count(*) FROM erlasse_neu', nErlasse],
      ['erlass_fassungen_neu', 'SELECT count(*) FROM erlass_fassungen_neu', nFassungen],
      ['artikel_neu', 'SELECT count(*) FROM artikel_neu', nArtikel],
    );
  }
  vorChecks.push(
    // ZEILENGLEICHHEIT fts_artikel == artikel ist die Invariante, an der der Such-Join
    // hängt — sie war bisher als einzige nirgends geprüft (Gegenprüfungs-Befund B5);
    // getestet wurde nur „MATCH liefert irgendwas". Jetzt hart gegen die Artikel-Zahl.
    ['fts_artikel_neu (zeilengleich artikel)', 'SELECT count(*) FROM fts_artikel_neu', artikelTexte.length],
    ['fts_artikel_neu MATCH "und"', "SELECT count(*) FROM fts_artikel_neu WHERE fts_artikel_neu MATCH '\"und\"'", -1],
    ['fts_entscheide_schaufenster_neu', 'SELECT count(*) FROM fts_entscheide_schaufenster_neu', entscheide.length],
    [
      'smoke "verjahrung" (diakritik-gefaltet)',
      `SELECT count(*) FROM fts_artikel_neu WHERE fts_artikel_neu MATCH '"verjahrung"'`,
      -1,
    ],
    // Inhaltliche Probe der Entscheide MUSS hier stehen, nicht erst nach dem Tausch.
    // Vorher gab es für `fts_entscheide_schaufenster` nur die (selbstbezügliche) Zeilenzahl;
    // die einzige MATCH-Probe lief in der Nachkontrolle — also erst, NACHDEM der DROP die
    // intakte Live-Tabelle schon vernichtet hatte. Ein degenerierter Entscheid-Build hätte
    // den guten Stand zerstört und wäre erst danach rot geworden (Gegenprüfung Runde 4, B2).
    [
      'smoke Entscheide MATCH "beschwerde"',
      `SELECT count(*) FROM fts_entscheide_schaufenster_neu WHERE fts_entscheide_schaufenster_neu MATCH '"beschwerde"'`,
      -1,
    ],
  );
  let rot = false;
  for (const [name, sql, soll] of vorChecks) {
    const ist = Number(await abfrage(url, token, sql));
    const ok = soll === -1 ? ist > 0 : ist === soll;
    if (!ok) rot = true;
    console.log(`  verify ${name}: remote=${ist}${soll >= 0 ? ` soll=${soll}` : ''} ${ok ? 'OK' : 'ROT'}`);
  }
  if (rot) {
    console.error('turso-sync ROT: Schatten-Tabellen unvollständig — KEIN Tausch, Live-Stand bleibt unverändert.');
    process.exit(1);
  }

  // 6) TAUSCH in EINER TRANSAKTION: alte Tabellen fallen lassen, Schatten umbenennen,
  //    Index neu. `ALTER TABLE … RENAME TO` trägt auf Turso für normale, standalone- UND
  //    contentless-FTS5-Tabellen (empirisch geprüft 20.7.2026, inkl. rowid-Erhalt).
  //
  //    Der Tausch läuft über `transaktion()` — BEGIN und COMMIT in GETRENNTEN Requests über
  //    den Hrana-`baton`. Ein einzelner Request mit BEGIN/…/COMMIT wäre NICHT atomar: die
  //    Pipeline bricht bei einem fehlgeschlagenen Statement nicht ab, das COMMIT gelingt
  //    trotzdem und schreibt den Teilzustand fest (Gegenprüfung Runde 2 hat genau damit eine
  //    Live-Tabelle dauerhaft verschwinden lassen). Siehe `transaktion()`.
  const tausch: Stmt[] = [];
  const zuTauschen = nurFts ? FTS_TABELLEN : SCHATTEN;
  for (const t of [...zuTauschen].reverse()) tausch.push({ sql: `DROP TABLE IF EXISTS ${t}` });
  for (const t of zuTauschen) tausch.push({ sql: `ALTER TABLE ${t}_neu RENAME TO ${t}` });
  if (!nurFts) tausch.push({ sql: 'CREATE INDEX ix_artikel_erlass ON artikel(erlass_key)' });
  await transaktion(url, token, tausch);
  console.log(`  Tausch vollzogen (${zuTauschen.length} Tabellen, atomar über baton-Transaktion).`);

  // 7) Nachkontrolle auf den LIVE-Namen (doppelt verifiziert): der Tausch selbst könnte
  //    schiefgegangen sein, ohne dass ein Statement gefehlt hätte.
  console.log('  — Nachkontrolle auf den Live-Tabellen —');
  let nachRot = false;
  const nachChecks: Array<[string, string, number]> = [
    ['artikel', 'SELECT count(*) FROM artikel', nurFts ? -1 : nArtikel],
    ['fts_artikel (zeilengleich artikel)', 'SELECT count(*) FROM fts_artikel', artikelTexte.length],
    ['fts_entscheide_schaufenster', 'SELECT count(*) FROM fts_entscheide_schaufenster', entscheide.length],
    ['fts_artikel MATCH "verjahrung"', `SELECT count(*) FROM fts_artikel WHERE fts_artikel MATCH '"verjahrung"'`, -1],
    [
      'fts_entscheide MATCH "beschwerde"',
      `SELECT count(*) FROM fts_entscheide_schaufenster WHERE fts_entscheide_schaufenster MATCH '"beschwerde"'`,
      -1,
    ],
  ];
  for (const [name, sql, soll] of nachChecks) {
    const ist = Number(await abfrage(url, token, sql));
    const ok = soll === -1 ? ist > 0 : ist === soll;
    if (!ok) nachRot = true;
    console.log(`  verify ${name}: remote=${ist}${soll >= 0 ? ` soll=${soll}` : ''} ${ok ? 'OK' : 'ROT'}`);
  }
  // Kopplungs-Nachweis über die rowid-Spannweite (billige Aggregate statt LEFT JOIN — der
  // Join über 55'822 Zeilen braucht auf der Replika Minuten). Beweist zusammen mit der
  // Zeilengleichheit oben, dass fts_artikel.rowid und artikel.rowid denselben Bereich decken.
  const spanneArtikel = await abfrage(url, token, "SELECT min(rowid) || '-' || max(rowid) FROM artikel");
  const spanneFts = await abfrage(url, token, "SELECT min(rowid) || '-' || max(rowid) FROM fts_artikel");
  // `null` heisst «nicht ermittelbar», nicht «gleich». Ohne diese Prüfung wären zwei
  // fehlgeschlagene Abfragen beide null, damit gleich — und der Vergleich meldete grün.
  // (Dieselbe Falle wurde im Wächter gehärtet; hier stand sie noch offen, Runde 3.)
  if (spanneArtikel === null || spanneFts === null) {
    nachRot = true;
    console.log(`  verify rowid-Spannweite: nicht ermittelbar (artikel=${spanneArtikel} fts_artikel=${spanneFts}) ROT`);
  } else if (spanneArtikel !== spanneFts) {
    nachRot = true;
    console.log(`  verify rowid-Spannweite: artikel=${spanneArtikel} fts_artikel=${spanneFts} ROT`);
  } else {
    console.log(`  verify rowid-Spannweite artikel == fts_artikel (${spanneArtikel}) OK`);
  }
  if (nachRot) {
    console.error('turso-sync ROT: Live-Nachkontrolle fehlgeschlagen — Frische-Marke wird NICHT gesetzt.');
    process.exit(1);
  }

  // 8) Frische-Marke schreiben (§8) — ERST JETZT, nach bestandener Nachkontrolle.
  //    Reihenfolge ist tragend: stünde die Marke vor Schritt 7, würde ein Sync, der die
  //    Nachkontrolle NICHT besteht, eine kaputte Replika mit selbst-bestätigenden Soll-Zahlen
  //    und korrektem manifest_sha hinterlassen — `check:turso-frische` wäre danach DAUERHAFT
  //    grün auf kaputten Daten (Gegenprüfung Runde 2, Befund 3). Die Marke ist eine Quittung
  //    über einen verifizierten Stand, keine Absichtserklärung.
  //    Die Zahlen kommen aus der Live-DB, nicht aus den Lade-Zählern: festgehalten wird, was
  //    TATSÄCHLICH liegt, damit der Wächter die Ist-Zahlen später dagegen prüfen kann.
  const manifestSha = createHash('sha256').update(readFileSync(MANIFEST_DATEI)).digest('hex');
  const istZahlen: Record<string, string> = {};
  for (const t of SCHATTEN) istZahlen[`zeilen_${t}`] = String(Number(await abfrage(url, token, `SELECT count(*) FROM ${t}`)));
  const marken: Array<[string, string]> = [
    ['manifest_sha', manifestSha],
    ['stand', new Date().toISOString()],
    ...Object.entries(istZahlen),
  ];
  await pipeline(url, token, [
    { sql: 'CREATE TABLE IF NOT EXISTS sync_meta (schluessel TEXT PRIMARY KEY, wert TEXT NOT NULL)' },
    { sql: 'DELETE FROM sync_meta' },
    {
      sql: `INSERT INTO sync_meta (schluessel, wert) VALUES ${marken.map(() => '(?, ?)').join(', ')}`,
      args: marken.flat(),
    },
  ]);
  console.log(`turso-sync grün: Hot-Replika vollständig + verifiziert (manifest_sha ${manifestSha.slice(0, 12)}…).`);
}

main().catch((e) => {
  console.error('turso-sync ROT:', e instanceof Error ? e.message : e);
  process.exit(1);
});
