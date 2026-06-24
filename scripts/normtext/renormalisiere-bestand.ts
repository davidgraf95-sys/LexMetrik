// ─── Bestands-Renormalisierung der Erwägungs-Blöcke (idempotent, §2/§5) ───────
//
// Vereinheitlicht die Erwägungs-Gliederung des bestehenden Korpus mit DERSELBEN
// reinen Funktion wie der Live-Import (`normalisiereErwaegung`). Schreibt jede
// public/rechtsprechung/**/*.json-Snapshot-Datei IN PLACE neu (kein rmSync der
// Bäume — register.json/norm-index.json hängen nicht am Erwägungs-sha, nur am
// fassungsToken, der unverändert bleibt).
//
// Zwei Eingangsquellen, klare Priorität:
//   1. Cache-Replay (PRIMÄR): liegt ein gecachtes OCL-decision+structure-Paar
//      (src/tests/fixtures/ocl-decision-*.json + ocl-structure-*.json) für die
//      decision_id vor, wird der Entscheid neu gemappt — identisch zu
//      seed-aus-cache.ts. Einziger Weg, der verlorene e_number zurückbringt.
//   2. Bestands-Veredelung ohne Cache (SEKUNDÄR, NUR Monolithe): ruft
//      normalisiereErwaegung([], bloecke) — paras=[] ⇒ nur der Monolith-Split
//      greift. Multi-Block-Flach-Entscheide bleiben unverändert (kein Text-
//      Parsing über bestehende Mehrblock-Erwägungen → keine Zitat-Fabrikation).
//
// WORT-INVARIANTE als hartes Tor (§1): die konkatenierte, whitespace-normalisierte
// Erwägungs-Wortfolge vorher/nachher muss zeichengleich sein; sonst Abbruch.
//
// Flags:
//   --dry-run            nur Report, kein Schreiben (Default-EMPFEHLUNG)
//   --schreiben          tatsächlich schreiben (sonst dry-run)
//   --nur=<id-prefix>    nur Snapshots, deren id mit dem Prefix beginnt
//
//   vite-node scripts/normtext/renormalisiere-bestand.ts -- --schreiben
//
import { readFileSync, readdirSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
  mappeEntscheidOCL, type OclDecision, type OclStructure,
} from './adapter-entscheide';
import { normalisiereErwaegung } from './erwaegung-normalisieren';
import { sha256EntscheidBloecke } from './sha-entscheide';
import type {
  EntscheidBlock, EntscheidSnapshot, EntscheidSnapshotDatei,
} from '../../src/lib/rechtsprechung/typen';

const ROOT = process.cwd();
const PUB = join(ROOT, 'public', 'rechtsprechung');
const FIX = join(ROOT, 'src', 'tests', 'fixtures');

const args = process.argv.slice(2);
const schreiben = args.includes('--schreiben');
const nurPrefix = args.find((a) => a.startsWith('--nur='))?.split('=')[1] ?? null;

/** Alle Snapshot-Dateien (sortiert für Determinismus, §2). */
function alleSnapshotDateien(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...alleSnapshotDateien(p));
    else if (name.endsWith('.json') && name !== 'register.json' && name !== 'norm-index.json') out.push(p);
  }
  return out;
}

/** Erwägungs-Block-Liste eines Snapshots (oder []). */
function erwBloecke(snap: EntscheidSnapshot): EntscheidBlock[] {
  return snap.abschnitte.find((a) => a.typ === 'erwaegung')?.bloecke ?? [];
}

/** Konkatenierte, whitespace-normalisierte Wortfolge — Basis der Invariante. */
function worte(bloecke: EntscheidBlock[]): string {
  return bloecke.map((b) => b.text).join('\n').replace(/\s+/g, ' ').trim();
}

/** Gecachtes OCL-decision+structure-Paar für eine Snapshot-id, falls vorhanden. */
function ladeOclCache(snap: EntscheidSnapshot): { det: OclDecision; str: OclStructure | null } | null {
  // Fixture-Dateiname folgt der docket-id (z.B. 5A_1100_2025).
  const idTail = snap.id.split('/').pop()!;
  const detPfad = join(FIX, `ocl-decision-${idTail}.json`);
  if (!existsSync(detPfad)) return null;
  const det = JSON.parse(readFileSync(detPfad, 'utf8')) as OclDecision;
  let str: OclStructure | null = null;
  const strPfad = join(FIX, `ocl-structure-${idTail}.json`);
  if (existsSync(strPfad)) str = JSON.parse(readFileSync(strPfad, 'utf8')) as OclStructure;
  return { det, str };
}

interface Bericht {
  id: string;
  quelle: 'cache-replay' | 'monolith' | 'unveraendert';
  vorherMarke: number;
  nachherMarke: number;
  bloeckeVorher: number;
  bloeckeNachher: number;
  veraendert: boolean;
}

const berichte: Bericht[] = [];
let geschrieben = 0;

for (const datei of alleSnapshotDateien(PUB)) {
  const wrap = JSON.parse(readFileSync(datei, 'utf8')) as EntscheidSnapshotDatei;
  const snap = wrap.eintraege[0];
  if (!snap) continue;
  if (nurPrefix && !snap.id.startsWith(nurPrefix)) continue;

  const altErw = erwBloecke(snap);
  const vorherMarke = altErw.filter((b) => b.marke).length;

  // ── Quelle 1: Cache-Replay (bringt verlorene e_number zurück) ──
  const cache = ladeOclCache(snap);
  let neuSnap: EntscheidSnapshot = snap;
  let quelle: Bericht['quelle'] = 'unveraendert';
  if (cache) {
    const gemappt = mappeEntscheidOCL(cache.det, cache.str, snap.abgerufen, { sachgebietHint: snap.sachgebiet });
    if (gemappt) { neuSnap = gemappt; quelle = 'cache-replay'; }
  } else {
    // ── Quelle 2: Veredelung ohne Cache — nur Monolith-Split (paras=[]) ──
    const neuErw = normalisiereErwaegung([], altErw);
    if (neuErw !== altErw && neuErw.some((b) => b.marke)) {
      const abschnitte = snap.abschnitte.map((a) => (a.typ === 'erwaegung' ? { ...a, bloecke: neuErw } : a));
      neuSnap = { ...snap, abschnitte, sha: sha256EntscheidBloecke(abschnitte) };
      quelle = 'monolith';
    }
  }

  const neuErw = erwBloecke(neuSnap);
  // ── WORT-INVARIANTE (§1): hartes Tor gegen stillen Textverlust/Umstellung ──
  if (worte(altErw) !== worte(neuErw)) {
    throw new Error(`WORTDRIFT in ${snap.id} — Re-Chunking hat den Erwägungstext verändert (Abbruch §1).`);
  }

  const nachherMarke = neuErw.filter((b) => b.marke).length;
  const veraendert = neuSnap.sha !== snap.sha;
  berichte.push({
    id: snap.id, quelle, vorherMarke, nachherMarke,
    bloeckeVorher: altErw.length, bloeckeNachher: neuErw.length, veraendert,
  });

  if (veraendert && schreiben) {
    const out: EntscheidSnapshotDatei = { erzeugt: wrap.erzeugt, eintraege: [neuSnap] };
    writeFileSync(datei, JSON.stringify(out, null, 2) + '\n', 'utf8');
    geschrieben++;
  }
}

// ── Report ──
const mitErw = berichte.length;
const entVorher = berichte.filter((b) => b.vorherMarke > 0).length;
const entNachher = berichte.filter((b) => b.nachherMarke > 0).length;
const blkVorher = berichte.reduce((s, b) => s + b.vorherMarke, 0);
const blkNachher = berichte.reduce((s, b) => s + b.nachherMarke, 0);
const replays = berichte.filter((b) => b.quelle === 'cache-replay').length;
const monolithe = berichte.filter((b) => b.quelle === 'monolith').length;
const veraendert = berichte.filter((b) => b.veraendert);

console.log(`[renorm] ${mitErw} Snapshots geprüft${nurPrefix ? ` (nur=${nurPrefix})` : ''} — ${schreiben ? 'SCHREIBEN' : 'DRY-RUN'}`);
console.log(`[renorm] Entscheide mit ≥1 marke : ${entVorher} → ${entNachher}`);
console.log(`[renorm] Erwägungs-Blöcke mit marke: ${blkVorher} → ${blkNachher}`);
console.log(`[renorm] Cache-Replay: ${replays} · Monolith-Split: ${monolithe} · veränderte Snapshots: ${veraendert.length}`);
if (veraendert.length) {
  console.log('[renorm] veränderte Entscheide:');
  for (const b of veraendert) console.log(`         ${b.id}  (${b.quelle}, marke ${b.vorherMarke}→${b.nachherMarke}, Blöcke ${b.bloeckeVorher}→${b.bloeckeNachher})`);
}
if (schreiben) console.log(`[renorm] ${geschrieben} Datei(en) neu geschrieben.`);
else console.log('[renorm] DRY-RUN — nichts geschrieben. Mit --schreiben anwenden.');
