// ─── Generator: Verzahnungs-Shards → Bezüge-Zähler IM Struktur-Sidecar ───────
//
// W2·24-R6c, Prüfer-Befund R6 «ZÄHL-DATEI». Die Funktionszeile am Artikelende
// (`src/pages/gesetz-leser/parts/Funktionszeile.tsx`, bis D35-F1 `BezuegeKopf`)
// zeigt «3 Entscheide · 1 Materialie · Rechner ›». Die Zahl der ENTSCHEIDE stand
// bis dahin nur zur Verfügung, wenn der Leser den vollen Bezugs-Shard geladen
// hatte (OR: 2.2 MB roh); die Zahl der MATERIALIEN gar nicht — die Rubrik fehlte
// deshalb ganz, statt eine Zusage ohne Deckung zu machen (§8).
//
// Dieses Skript zieht beide Zahlen ZUR BUILDZEIT aus denselben Shards.
//
//   npm run gen:bezuege-zaehler     schreibt die Zahlen in die Sidecars
//   npm run check:bezuege-zaehler   prüft Drift (Sidecar ≠ Shards) → exit 1
//
// ── W2·26-FUNKTIONSZEILE-ZAEHLER (11.9.2026) · WO DIE ZAHLEN LIEGEN ────────
// Bis hierher schrieb das Skript eine EIGENE Datei je Erlass
// (`public/verzahnung/bezuege-zaehler/<KEY>.json`, ø 289 B), und der Leser holte
// sie mit einem eigenen Fetch IM LEERLAUF — also erst, nachdem die Artikelliste
// schon stand. Im OR wuchsen dadurch Funktionszeilen in einer ZWEITEN
// Render-Runde in den fertigen Lesekörper hinein (D34-Nachfix, ROADMAP.md, dort
// «145»; nachgemessen am Bestand 11.9.2026 tragen 469 OR-Artikel Zahlen — die
// Roadmap-Zahl bleibt für ihren Stand stehen, §0 Ziff. 2b).
//
// Die Zahlen reisen seither IM STRUKTUR-SIDECAR des Erlasses
// (`public/normtext/struktur/<ebene>/<KEY>.json`, neuer Top-Level-Schlüssel
// `zaehler`). Das ist die Datei, die der Leser für Gliederung, Marginalien und
// Erlass-Kopf ohnehin holt — und zwar VOR den Einträgen (`inhalt-hooks.tsx`
// startet `ladeStruktur` im selben Takt, während `ladeErlass` erst das Register
// auflösen muss). Ergebnis: kein zusätzlicher Fetch, keine zweite Runde.
// Der eigene Ordner ist ersatzlos gelöscht, nicht zusätzlich bewacht
// (§17-Gegengewicht).
//
// WARUM NICHT IN DEN SNAPSHOT (`public/normtext/bund/<KEY>.json`)? Das wäre die
// Datei, die den ersten Render GARANTIERT bestimmt (Lade-Riegel
// `!erlass || !eintraege`). Sie ist aber die Eintrag-Datei der
// Datenhaltungs-Parität: `scripts/datenhaltung/ingest.ts` zerlegt sie in
// Eintrags-Blobs + `ErlasseMeta` und rekonstruiert sie daraus byte-gleich. Ein
// NEUER Top-Level-Schlüssel ginge in diesem Roundtrip verloren ⇒
// `check:paritaet`/`check:datenhaltung` rot, und der Fix läge im DB-Schema
// (`daten/**`). Das Struktur-Sidecar dagegen führt `ingest.ts` als reinen
// Dokument-Byte-Roundtrip (`NORMTEXT_STRUKTUR_DIR`, Pfad → exakter Inhalt) —
// ein neuer Schlüssel ist dort byte-transparent. Zahlen: der `zaehler`-Block
// wiegt im OR 5'786 B gegen 1'427'341 B Sidecar (+0.41 % roh, +1.6 % gzip).
//
// SCHONENDE EINFÜGUNG (§6, Byte-Treue). Die Sidecars kommen aus ZWEI Schreibern
// mit verschiedener Einrückung (`struktur-run.ts` 1 Space, die 111 ZH-Sidecars
// 2 Spaces). Ein Parse-und-neu-Serialisieren würde 111 Dateien vollständig
// umformatieren. Darum wird der Block als GENAU EINE ZEILE hinter die
// öffnende Klammer gesetzt und beim Neulauf genau diese Zeile ersetzt — der
// Rest der Datei bleibt Byte für Byte, wie ihr Schreiber sie hinterlassen hat,
// und der git-Diff je Erlass ist eine Zeile.
//
// KEINE ZWEITE WAHRHEIT (§5). Gezählt wird NICHT neu, sondern aus den
// vorhandenen Projektionen abgeschrieben:
//   · Entscheide  = `gesamtProArtikel[art]` aus `public/rechtsprechung/bezuege/
//     <KEY>.json` — im Shard ausdrücklich als «Kanten je Status OHNE UI-Filter,
//     die Bezugsgrösse» geführt (bezuegeLaden.ts). Die Summe über die Status ist
//     genau die Zahl, die die Zeile im ungefilterten Zustand nennt.
//   · Materialien = die Zahl der VERSCHIEDENEN Dokumente, die an einem Artikel
//     hängen (`kanten[].dok` aus `public/materialien/kanten/<KEY>.json`, nach
//     `dok` entdoppelt). Nicht die Kantenzahl: zwei Fundstellen desselben
//     Kreisschreibens sind EINE Materialie, und die Zeile sagt «1 Materialie».
//
// ARTIKEL-SCHLÜSSEL — DIE EINE FALLE DIESER DATEI. Die beiden Quellen führen den
// Artikel VERSCHIEDEN: der Bezugs-Shard normalisiert (`336c`, aus dem Zitat-Text
// extrahiert), der Materialien-Shard trägt die eId-nahe Unterstrich-Form
// (`15_a`), und der Leser reicht wiederum `e.artikel` = `336_c` durch. Geschlüsselt
// wird darum durchgehend auf die NORMALISIERTE Form — mit `normArtikelToken`,
// also mit genau der Funktion, die schon heute beide Query-Pfade zusammenführt
// (§5: eine Normalisierung, nicht drei). Der Konsument normalisiert mit
// derselben Funktion; `src/tests/bezuege-zaehler.test.ts` hält beide Seiten
// gegeneinander.
import { readFileSync, writeFileSync, readdirSync, existsSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normArtikelToken } from '../src/lib/rechtsprechung/norm-index.ts';

const wurzel = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BEZUEGE_DIR = resolve(wurzel, 'public/rechtsprechung/bezuege');
const MATERIAL_DIR = resolve(wurzel, 'public/materialien/kanten');
const STRUKTUR_DIR = resolve(wurzel, 'public/normtext/struktur');
const REGISTER = resolve(wurzel, 'public/normtext/register.json');
/** Der bis W2·26 benutzte eigene Ordner — wird beim Lauf entfernt, falls er
 *  aus einem älteren Stand noch herumliegt (§17-Gegengewicht: kein Rest, den
 *  ein späterer Leser für eine zweite Quelle halten könnte). */
const ALT_DIR = resolve(wurzel, 'public/verzahnung/bezuege-zaehler');

interface BezugsShardRoh {
  erlass?: string;
  gesamtProArtikel?: Record<string, Record<string, number>>;
}
interface MaterialShardRoh {
  erlass?: string;
  kanten?: Array<{ dok?: string; artikel?: string }>;
}

/** Der `zaehler`-Block eines Sidecars: Artikel-Token → `[Entscheide,
 *  Materialien]`. Paar-Form statt Objekt, weil sie in 1'686 Einträgen je Erlass
 *  rund ein Drittel der Bytes spart und die Bedeutung an genau EINER Stelle
 *  steht (hier). Nullen fallen weg: was nicht dasteht, ist 0. */
export type ZaehlBlock = Record<string, [entscheide: number, materialien: number]>;

function lies<T>(pfad: string): T {
  return JSON.parse(readFileSync(pfad, 'utf8')) as T;
}

/** Alle Erlass-Schlüssel, für die irgendeine Quelle etwas hergibt. */
function schluessel(): string[] {
  const s = new Set<string>();
  for (const dir of [BEZUEGE_DIR, MATERIAL_DIR]) {
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) if (f.endsWith('.json')) s.add(f.slice(0, -5));
  }
  return [...s].sort();
}

/** Der Zähl-Block EINES Erlasses — rein aus den Shards, ohne Zwischenspeicher. */
export function baueZaehler(key: string): ZaehlBlock | null {
  const a: ZaehlBlock = {};

  const bezPfad = resolve(BEZUEGE_DIR, `${key}.json`);
  if (existsSync(bezPfad)) {
    const shard = lies<BezugsShardRoh>(bezPfad);
    for (const [rohArt, proStatus] of Object.entries(shard.gesamtProArtikel ?? {})) {
      const n = Object.values(proStatus).reduce((s, v) => s + (typeof v === 'number' ? v : 0), 0);
      if (n <= 0) continue;
      const art = normArtikelToken(rohArt);
      const paar = a[art] ?? [0, 0];
      // Zwei Roh-Schreibweisen desselben Artikels fallen beim Normalisieren
      // zusammen — dann ist die Zahl die SUMME, nicht die letzte.
      paar[0] += n;
      a[art] = paar;
    }
  }

  const matPfad = resolve(MATERIAL_DIR, `${key}.json`);
  if (existsSync(matPfad)) {
    const shard = lies<MaterialShardRoh>(matPfad);
    // Entdoppeln nach Dokument: zwei Fundstellen desselben Kreisschreibens sind
    // EINE Materialie (s. Kopfkommentar).
    const proArtikel = new Map<string, Set<string>>();
    for (const k of shard.kanten ?? []) {
      if (!k.artikel || !k.dok) continue;
      const art = normArtikelToken(k.artikel);
      const menge = proArtikel.get(art) ?? new Set<string>();
      menge.add(k.dok);
      proArtikel.set(art, menge);
    }
    for (const [art, dok] of proArtikel) {
      const paar = a[art] ?? [0, 0];
      paar[1] = dok.size;
      a[art] = paar;
    }
  }

  if (Object.keys(a).length === 0) return null; // kein Eintrag ⇒ kein Block (§8)
  // Schlüssel sortiert schreiben, damit die Zeile byte-stabil ist (Drift-Tor).
  const sortiert: ZaehlBlock = {};
  for (const art of Object.keys(a).sort()) sortiert[art] = a[art];
  return sortiert;
}

// ── Sidecar-Zeile: einfügen, ersetzen, entfernen ───────────────────────────
//
// Der Block steht als genau EINE Zeile direkt hinter der öffnenden Klammer.
// `zeileWeg` schneidet eine vorhandene wieder heraus; beide Funktionen fassen
// den Rest der Datei nicht an (s. «SCHONENDE EINFÜGUNG» oben).
const ZAEHLER_ZEILE = /^([ \t]*)"zaehler":.*\n/;

function kopfUndRest(text: string): [kopf: string, rest: string] {
  const nl = text.indexOf('\n');
  if (nl < 0 || text.slice(0, nl + 1) !== '{\n')
    throw new Error('Sidecar beginnt nicht mit "{\\n" — Einfügepunkt unklar');
  return [text.slice(0, nl + 1), text.slice(nl + 1)];
}

/** Die Datei ohne Zähl-Zeile — also so, wie ihr Extraktions-Schreiber sie
 *  hinterlassen hat. Grundlage jeder Rechnung (idempotent). */
export function zeileWeg(text: string): string {
  const [kopf, rest] = kopfUndRest(text);
  return kopf + rest.replace(ZAEHLER_ZEILE, '');
}

/** Die Datei MIT Zähl-Zeile (oder ohne, wenn der Block leer ist). */
export function zeileSetzen(text: string, block: ZaehlBlock | null): string {
  const blank = zeileWeg(text);
  if (!block) return blank;
  const [kopf, rest] = kopfUndRest(blank);
  const einzug = /^([ \t]*)"/.exec(rest)?.[1] ?? ' ';
  return `${kopf}${einzug}"zaehler":${JSON.stringify(block)},\n${rest}`;
}

// ── Zuordnung Erlass-Schlüssel → Sidecar ───────────────────────────────────
interface RegisterErlass { key: string; ebene: 'bund' | 'kanton'; status: string }

/** Erlasse, die gar keine Artikelliste rendern, haben kein Struktur-Sidecar —
 *  und damit keinen Ort für Zahlen. Das ist kein Verlust: ohne Artikelliste
 *  gibt es keine Funktionszeile, die sie zeigen könnte (§8). Jeder ANDERE
 *  Schlüssel ohne Sidecar ist ein Fehler und bricht den Lauf ab. */
const OHNE_ARTIKELLISTE = new Set(['pdf-embed', 'nur-live-link']);

function registerIndex(): Map<string, RegisterErlass> {
  const reg = lies<{ erlasse: RegisterErlass[] }>(REGISTER);
  return new Map(reg.erlasse.map((e) => [e.key, e]));
}

function sidecarPfad(key: string, reg: Map<string, RegisterErlass>): string | null {
  const e = reg.get(key);
  const kandidaten = e ? [e.ebene] : ['bund', 'kanton'];
  for (const eb of kandidaten) {
    const p = resolve(STRUKTUR_DIR, eb, `${key}.json`);
    if (existsSync(p)) return p;
  }
  return null;
}

/** Alle vorhandenen Sidecars (bund + kanton) als key → Pfad. */
function alleSidecars(): Map<string, string> {
  const m = new Map<string, string>();
  for (const eb of ['bund', 'kanton']) {
    const dir = resolve(STRUKTUR_DIR, eb);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) if (f.endsWith('.json')) m.set(f.slice(0, -5), resolve(dir, f));
  }
  return m;
}

function main(): void {
  const pruefen = process.argv.includes('--check');
  const reg = registerIndex();
  const keys = schluessel();
  const sidecars = alleSidecars();

  // Schlüssel mit Zahlen, aber ohne Sidecar: nur erlaubt, wenn der Erlass gar
  // keine Artikelliste hat. Sonst wären die Zahlen still verschwunden.
  const heimatlos: string[] = [];
  const bloecke = new Map<string, ZaehlBlock>();
  for (const key of keys) {
    const block = baueZaehler(key);
    if (!block) continue;
    const pfad = sidecarPfad(key, reg);
    if (!pfad) {
      if (!OHNE_ARTIKELLISTE.has(reg.get(key)?.status ?? '')) heimatlos.push(key);
      continue;
    }
    bloecke.set(key, block);
  }
  if (heimatlos.length > 0) {
    console.error(
      `✗ Bezüge-Zähler ROT — ${heimatlos.length} Erlass(e) mit Zahlen, aber ohne Struktur-Sidecar ` +
      `und ohne Grund (Status weder pdf-embed noch nur-live-link): ${heimatlos.join(', ')}`,
    );
    process.exit(1);
  }

  const abweichungen: string[] = [];
  let geschrieben = 0;
  let bytes = 0;
  // Über ALLE Sidecars laufen, nicht nur über die mit Zahlen: eine Zähl-Zeile,
  // deren Shard-Kanten weggefallen sind, ist ebenfalls Drift.
  for (const [key, pfad] of [...sidecars].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
    const ist = readFileSync(pfad, 'utf8');
    const soll = zeileSetzen(ist, bloecke.get(key) ?? null);
    if (pruefen) {
      if (ist !== soll) {
        const hatte = ZAEHLER_ZEILE.test(ist.slice(ist.indexOf('\n') + 1));
        const will = bloecke.has(key);
        abweichungen.push(
          `${key}: Zähl-Zeile ${hatte ? (will ? 'weicht ab' : 'übrig (keine Kanten mehr)') : 'fehlt'}`,
        );
      }
      continue;
    }
    if (ist !== soll) { writeFileSync(pfad, soll); geschrieben++; }
    if (bloecke.has(key)) bytes += Buffer.byteLength(JSON.stringify(bloecke.get(key)));
  }

  if (pruefen) {
    if (existsSync(ALT_DIR)) abweichungen.push(`${ALT_DIR}: alter Zähl-Ordner noch da (W2·26: ersatzlos)`);
    if (abweichungen.length > 0) {
      console.error(`✗ Bezüge-Zähler ROT — ${abweichungen.length} Abweichung(en):`);
      for (const z of abweichungen.slice(0, 20)) console.error(`   ${z}`);
      process.exit(1);
    }
    console.log(`✓ Bezüge-Zähler grün — ${sidecars.size} Sidecars geprüft, keine Drift.`);
    return;
  }
  if (existsSync(ALT_DIR)) rmSync(ALT_DIR, { recursive: true });
  console.log(
    `✓ ${bloecke.size} Zähl-Blöcke in Sidecars (${geschrieben} Datei(en) geändert, ` +
    `${(bytes / 1024).toFixed(1)} KB Zahlen gesamt, ø ${(bytes / bloecke.size).toFixed(0)} B).`,
  );
}

main();
