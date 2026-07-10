// ─── Daten-Sonde `npm run zeige` — QS-TOK T6 (FAHRPLAN-TOKEN-OEKONOMIE §4) ────
//
// Zweck: eine daten-berührende Session schlägt einen EINZELNEN Normtext-Eintrag
// (Artikel) byte-treu nach — statt die ganze Erlass-JSON (OR ≈ 475k Token!) in
// den Kontext zu ziehen oder Grep-Runden zu fahren. ~200 Token je Nachschlag.
//
// PRINZIP (Risikopfad Norm-Zitate, §1/§7): Der Eintrag wird NIE re-serialisiert.
// Die Datei wird mit der Engine-Deserialisierung (typen.ts) gelesen, um den
// Ziel-Eintrag zu FINDEN; ausgegeben wird der ROHE Byte-Slice aus der Datei —
// exakt die Bytes, die dort stehen (Diff-Beweis: OR Art. 1 byte-identisch).
// read-only, live auf den Repo-Dateien (kein Staleness).
//
// Aufruf:
//   npm run zeige -- OR 1                 # Bund: public/normtext/bund/OR.json
//   npm run zeige -- OR 335c              # Marken/Suffixe egal (335c = 335_c)
//   npm run zeige -- --kanton AG-291.150 1
//   npm run zeige -- --struktur OR 1      # Struktur-Sidecar (Gliederung/Marginalie)
//   npm run zeige -- --struktur OR        # nur der Kopf des Erlasses
//   npm run zeige -- --register OR        # Register-Eintrag eines Erlasses
//   npm run zeige -- --sql daten/lexmetrik.db "SELECT ... LIMIT 20"
//
// TABU-konform abgelegt unter scripts/ (nicht scripts/normtext/**).
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NormSnapshotDatei } from '../src/lib/normtext/typen';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function fail(msg: string): never {
  console.error('zeige: ' + msg);
  process.exit(1);
}

// ── Byte-treue Roh-Extraktion (string-/escape-bewusst) ───────────────────────
// Findet das Ende eines JSON-Wertes ab Offset `vs` in `src`, ohne zu parsen.
function valueEnd(src: string, vs: number): number {
  const c = src[vs];
  if (c === '{' || c === '[') {
    let inStr = false;
    let esc = false;
    let depth = 0;
    for (let i = vs; i < src.length; i++) {
      const ch = src[i];
      if (inStr) {
        if (esc) esc = false;
        else if (ch === '\\') esc = true;
        else if (ch === '"') inStr = false;
        continue;
      }
      if (ch === '"') inStr = true;
      else if (ch === '{' || ch === '[') depth++;
      else if (ch === '}' || ch === ']') {
        depth--;
        if (depth === 0) return i + 1;
      }
    }
    return src.length;
  }
  if (c === '"') {
    let esc = false;
    for (let i = vs + 1; i < src.length; i++) {
      const ch = src[i];
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === '"') return i + 1;
    }
    return src.length;
  }
  let i = vs;
  while (i < src.length && !',}]\n'.includes(src[i])) i++;
  return i;
}

// Roh-Slice des Wertes des ersten Members `key` auf Objekt-Tiefe 1 von `src`.
// (`src` beginnt bei/vor dem `{` des betrachteten Objekts.)
function memberValueSpan(src: string, key: string): [number, number] | null {
  const keyTok = '"' + key + '"';
  let inStr = false;
  let esc = false;
  let depth = 0;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') {
      if (depth === 1 && src.startsWith(keyTok, i)) {
        let j = i + keyTok.length;
        while (j < src.length && /\s/.test(src[j])) j++;
        if (src[j] === ':') {
          j++;
          while (j < src.length && /\s/.test(src[j])) j++;
          return [j, valueEnd(src, j)];
        }
      }
      inStr = true;
      continue;
    }
    if (c === '{' || c === '[') depth++;
    else if (c === '}' || c === ']') depth--;
  }
  return null;
}

// Offsets der Top-Level-Objekt-Elemente eines Array-Roh-Slice (`arr` beginnt '[').
function arrayElementSpans(arr: string): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  let inStr = false;
  let esc = false;
  let depth = 0;
  let start = -1;
  const begin = arr.indexOf('[') + 1; // die eigene Öffnungsklammer überspringen
  for (let i = begin; i < arr.length; i++) {
    const c = arr[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') {
      inStr = true;
      continue;
    }
    if (c === '{' || c === '[') {
      if (depth === 0 && c === '{') start = i;
      depth++;
    } else if (c === '}' || c === ']') {
      if (depth === 0 && c === ']') break;
      depth--;
      if (depth === 0 && c === '}' && start >= 0) {
        out.push([start, i + 1]);
        start = -1;
      }
    }
  }
  return out;
}

// Roh-Slice eines Array-Elements, dessen Objekt `matcher(obj)` erfüllt.
// `parsed` (Engine-Deserialisierung) liefert die Reihenfolge; der SLICE ist roh.
function rohesElement(
  src: string,
  arrayKey: string,
  parsedArr: unknown[],
  index: number,
): string {
  const arrSpan = memberValueSpan(src, arrayKey);
  if (!arrSpan) fail(`Array «${arrayKey}» nicht in der Datei gefunden.`);
  const arr = src.slice(arrSpan[0], arrSpan[1]);
  const spans = arrayElementSpans(arr);
  if (spans.length !== parsedArr.length) {
    fail(
      `Roh-Extraktion inkonsistent (${spans.length} Roh-Elemente vs. ` +
        `${parsedArr.length} geparste) — Abbruch statt unsichere Ausgabe.`,
    );
  }
  const [s, e] = spans[index];
  const roh = arr.slice(s, e);
  // Sicherung: der Slice muss für sich gültiges JSON sein und dem geparsten
  // Ziel entsprechen (kein stiller Byte-Versatz auf dem Risikopfad).
  if (JSON.stringify(JSON.parse(roh)) !== JSON.stringify(parsedArr[index])) {
    fail('Roh-Slice ≠ geparster Eintrag — Byte-Treue nicht garantiert, Abbruch.');
  }
  return roh;
}

function normArt(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// ── Erlass-JSON (Bund/Kanton): Artikel byte-treu ─────────────────────────────
function zeigeArtikel(datei: string, artArg: string): void {
  if (!existsSync(datei)) fail(`Datei nicht gefunden: ${datei}`);
  const src = readFileSync(datei, 'utf8');
  const parsed = JSON.parse(src) as NormSnapshotDatei;
  const ziel = normArt(artArg);
  const idx = parsed.eintraege.findIndex(
    (e) =>
      normArt(e.artikel) === ziel ||
      normArt(e.artikelLabel) === ziel ||
      normArt(e.id.split('/').pop() ?? '') === ziel ||
      normArt(e.id.split('/').pop() ?? '').replace(/^art/, '') === ziel,
  );
  if (idx < 0) {
    const nahe = parsed.eintraege
      .slice(0, 12)
      .map((e) => e.artikel)
      .join(', ');
    fail(
      `Artikel «${artArg}» nicht in ${datei}. Vorhanden (Auszug): ${nahe} …\n` +
        `(insgesamt ${parsed.eintraege.length} Einträge)`,
    );
  }
  process.stdout.write(rohesElement(src, 'eintraege', parsed.eintraege, idx));
  process.stdout.write('\n');
}

// ── Struktur-Sidecar: Kopf oder ein Artikel-Knoten byte-treu ─────────────────
function zeigeStruktur(key: string, artArg: string | undefined): void {
  const datei = join(ROOT, 'public/normtext/struktur/bund', key + '.json');
  if (!existsSync(datei)) fail(`Struktur-Sidecar nicht gefunden: ${datei}`);
  const src = readFileSync(datei, 'utf8');
  if (!artArg) {
    const span = memberValueSpan(src, 'kopf');
    if (!span) fail('«kopf» nicht im Struktur-Sidecar gefunden.');
    process.stdout.write(src.slice(span[0], span[1]) + '\n');
    return;
  }
  // struktur.artikel ist eine Map token → Knoten; Wert byte-treu ausgeben.
  const artSpan = memberValueSpan(src, 'artikel');
  if (!artSpan) fail('«artikel»-Map nicht im Struktur-Sidecar gefunden.');
  const artObj = src.slice(artSpan[0], artSpan[1]);
  const parsedMap = JSON.parse(artObj) as Record<string, unknown>;
  const ziel = normArt(artArg);
  const treffer = Object.keys(parsedMap).find((k) => normArt(k) === ziel);
  if (!treffer) fail(`Struktur-Knoten «${artArg}» nicht gefunden.`);
  const valSpan = memberValueSpan(artObj, treffer);
  if (!valSpan) fail(`Roh-Extraktion für Knoten «${treffer}» fehlgeschlagen.`);
  const roh = artObj.slice(valSpan[0], valSpan[1]);
  if (JSON.stringify(JSON.parse(roh)) !== JSON.stringify(parsedMap[treffer])) {
    fail('Roh-Slice ≠ geparster Knoten — Byte-Treue nicht garantiert, Abbruch.');
  }
  process.stdout.write(roh + '\n');
}

// ── Register-Eintrag eines Erlasses byte-treu ────────────────────────────────
function zeigeRegister(key: string): void {
  const datei = join(ROOT, 'public/normtext/register.json');
  if (!existsSync(datei)) fail(`Register nicht gefunden: ${datei}`);
  const src = readFileSync(datei, 'utf8');
  const parsed = JSON.parse(src) as { erlasse: Array<{ key: string }> };
  const ziel = normArt(key);
  const idx = parsed.erlasse.findIndex((e) => normArt(e.key) === ziel);
  if (idx < 0) fail(`Erlass-Key «${key}» nicht im Register.`);
  process.stdout.write(rohesElement(src, 'erlasse', parsed.erlasse, idx) + '\n');
}

// ── SQL-Sonde: read-only auf daten/*.db ──────────────────────────────────────
async function zeigeSql(dbPfad: string, query: string): Promise<void> {
  if (!existsSync(dbPfad)) {
    fail(
      `DB nicht gefunden: ${dbPfad} (daten/ ist gitignored/generiert — ` +
        'zuerst "npm run datenhaltung:build").',
    );
  }
  if (!/^\s*(select|with|pragma|explain)\b/i.test(query)) {
    fail('SQL-Sonde ist read-only: nur SELECT/WITH/PRAGMA/EXPLAIN erlaubt.');
  }
  const { DatabaseSync } = await import('node:sqlite');
  const db = new DatabaseSync(dbPfad, { readOnly: true });
  try {
    const rows = db.prepare(query).all();
    process.stdout.write(JSON.stringify(rows, null, 2) + '\n');
  } finally {
    db.close();
  }
}

// ── CLI ──────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const argv = process.argv.slice(2).filter((a) => a !== '--');
  if (argv.length === 0 || argv[0] === '--help' || argv[0] === '-h') {
    console.error(
      'zeige — byte-treue Daten-Sonde (QS-TOK T6)\n' +
        '  npm run zeige -- <ERLASS> <ARTIKEL>            (Bund)\n' +
        '  npm run zeige -- --kanton <DATEI> <ARTIKEL>\n' +
        '  npm run zeige -- --struktur <ERLASS> [<ARTIKEL>]\n' +
        '  npm run zeige -- --register <KEY>\n' +
        '  npm run zeige -- --sql <DB> "<SELECT …>"',
    );
    process.exit(argv.length === 0 ? 1 : 0);
  }
  const modus = argv[0];
  if (modus === '--kanton') {
    if (argv.length < 3) fail('--kanton <DATEI> <ARTIKEL>');
    zeigeArtikel(join(ROOT, 'public/normtext/kanton', argv[1] + '.json'), argv[2]);
  } else if (modus === '--struktur') {
    if (argv.length < 2) fail('--struktur <ERLASS> [<ARTIKEL>]');
    zeigeStruktur(argv[1], argv[2]);
  } else if (modus === '--register') {
    if (argv.length < 2) fail('--register <KEY>');
    zeigeRegister(argv[1]);
  } else if (modus === '--sql') {
    if (argv.length < 3) fail('--sql <DB> "<SELECT …>"');
    await zeigeSql(argv[1], argv.slice(2).join(' '));
  } else {
    if (argv.length < 2) fail('<ERLASS> <ARTIKEL> — z. B. `npm run zeige -- OR 1`');
    zeigeArtikel(join(ROOT, 'public/normtext/bund', modus + '.json'), argv[1]);
  }
}

main().catch((e) => fail(String(e)));
