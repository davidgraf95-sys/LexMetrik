// ─── Offline-Seed: Korpus aus gecachten OCL-Fixtures bauen ──────────────────
//
// Resilienz-Pfad (Fahrplan R1): wenn die OCL-Live-API gerade down ist, baut der
// Generator nichts. Dieser Seed mappt die im Repo gesicherten ECHTEN OCL-
// Antworten (src/tests/fixtures/ocl-decision-*.json + ocl-structure-*.json) zu
// Snapshots — damit die App immer echte Daten zeigt. Der Live-Generator
// überschreibt diesen Seed, sobald OCL wieder antwortet.
//
//   vite-node scripts/normtext/seed-aus-cache.ts -- --datum=2026-06-23
//
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { mappeEntscheidOCL, type OclDecision, type OclStructure } from './adapter-entscheide';
import { schreibeKorpus } from './entscheide-schreiben';
import type { EntscheidSnapshot } from '../../src/lib/rechtsprechung/typen';

const datum = process.argv.find((a) => a.startsWith('--datum='))?.split('=')[1]
  ?? new Date().toISOString().slice(0, 10);

const FIX = join(process.cwd(), 'src', 'tests', 'fixtures');
const decs = readdirSync(FIX).filter((f) => /^ocl-decision-.*\.json$/.test(f));

const snaps: EntscheidSnapshot[] = [];
for (const f of decs) {
  const id = f.replace(/^ocl-decision-/, '').replace(/\.json$/, '');
  const det = JSON.parse(readFileSync(join(FIX, f), 'utf8')) as OclDecision;
  let str: OclStructure | null = null;
  try { str = JSON.parse(readFileSync(join(FIX, `ocl-structure-${id}.json`), 'utf8')); } catch { /* optional */ }
  const s = mappeEntscheidOCL(det, str, datum);
  if (s) snaps.push(s);
}

const res = schreibeKorpus(snaps, datum);
console.log(`[seed] ${res.anzahl} Snapshots aus ${decs.length} Fixtures, ${res.normBuckets} Norm-Buckets`);
