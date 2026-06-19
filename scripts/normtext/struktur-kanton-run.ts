/**
 * Runner: kantonale Struktur-Sidecars (Gliederung + Marginalien) aus LexWork.
 * Holt je LexWork-Kantonserlass das xhtml_tol über die JSON-API und extrahiert
 * Gliederung + Sachüberschriften. Nicht-LexWork-Quellen (PDF/lexfind/zhlex)
 * werden übersprungen (Reader fällt dort auf flache Darstellung zurück).
 *
 * §2: --datum aus der Shell. Reine Präsentations-Anreicherung (§3) — Snapshots
 * unberührt. Aufruf: npm run normtext:struktur-kanton -- --datum=$(date +%F)
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { NormSnapshotDatei } from '../../src/lib/normtext/typen.ts';
import { extrahiereStrukturLexWork } from './struktur-lexwork.ts';

const datumArg = process.argv.find((a) => a.startsWith('--datum='));
const erzeugt = datumArg ? datumArg.slice('--datum='.length) : '';
if (!/^\d{4}-\d{2}-\d{2}$/.test(erzeugt)) {
  console.error('struktur-kanton-run: --datum=YYYY-MM-DD erforderlich (§2).');
  process.exit(1);
}

const KANTON_DIR = 'public/normtext/kanton';
const ZIEL = 'public/normtext/struktur/kanton';
mkdirSync(ZIEL, { recursive: true });

const LEXWORK = /\/app\/(de|fr|it)\/texts_of_law\//;

interface Aufgabe { key: string; api: string; tokens: Set<string> }

const aufgaben: Aufgabe[] = [];
let nichtLexwork = 0;
for (const f of readdirSync(KANTON_DIR).filter((x) => x.endsWith('.json') && x !== 'index.json')) {
  const datei = JSON.parse(readFileSync(join(KANTON_DIR, f), 'utf8')) as NormSnapshotDatei;
  const url = datei.eintraege?.[0]?.quelleUrl ?? '';
  if (!LEXWORK.test(url)) { nichtLexwork++; continue; }
  aufgaben.push({
    key: f.replace(/\.json$/, ''),
    api: url.replace('/app/', '/api/').replace(/#.*$/, ''),
    tokens: new Set(datei.eintraege.map((e) => e.artikel)),
  });
}

async function hole(a: Aufgabe): Promise<'ok' | 'leer' | 'fehler'> {
  try {
    const res = await fetch(a.api, { signal: AbortSignal.timeout(25000) });
    if (!res.ok) return 'fehler';
    const json = await res.json() as { text_of_law?: { selected_version?: { xhtml_tol?: string | null } } };
    const xhtml = json.text_of_law?.selected_version?.xhtml_tol;
    if (!xhtml) return 'leer';
    const alle = extrahiereStrukturLexWork(xhtml);
    // Nur Tokens behalten, die der Snapshot auch führt (Konsistenz).
    const gefiltert: Record<string, unknown> = {};
    for (const tok of Object.keys(alle).sort()) if (a.tokens.has(tok)) gefiltert[tok] = alle[tok];
    if (Object.keys(gefiltert).length === 0) return 'leer';
    writeFileSync(`${ZIEL}/${a.key}.json`, JSON.stringify({ erzeugt, artikel: gefiltert }, null, 1) + '\n', 'utf8');
    return 'ok';
  } catch {
    return 'fehler';
  }
}

// Begrenzte Parallelität (höflich gegenüber den Kantons-APIs).
const GRENZE = 6;
let ok = 0, leer = 0, fehler = 0, i = 0;
async function worker() {
  while (i < aufgaben.length) {
    const a = aufgaben[i++];
    const r = await hole(a);
    if (r === 'ok') ok++; else if (r === 'leer') leer++; else { fehler++; console.log(`  fehler/leer: ${a.key} (${a.api})`); }
  }
}
await Promise.all(Array.from({ length: GRENZE }, () => worker()));

console.log(`Kanton-Struktur: ${ok} ok, ${leer} ohne XHTML, ${fehler} Fehler · ${nichtLexwork} Nicht-LexWork übersprungen → ${ZIEL}/`);
