// ─── Build-Orchestrator: Rechtsprechungs-Snapshots erzeugen ──────────────────
//
// Dual-Quelle, resilient (Fahrplan R1/R9): Enumeration via Atom-Feed (Frische),
// Detail via OCL keyed-Lookups (schnell/verlässlich). Schreibt NIE von Hand
// editierte Dateien — alles aus diesem Generator (§7). Mengen-klein (P0).
//
//   vite-node scripts/normtext-entscheide.ts -- --datum=2026-06-23 --limit=15
//
import { holeEntscheidOCL, enumeriereNeueste, citedRefZuId } from './normtext/adapter-entscheide';
import { schreibeKorpus } from './normtext/entscheide-schreiben';
import type { EntscheidSnapshot } from '../src/lib/rechtsprechung/typen';

const arg = (name: string): string | null => {
  const p = process.argv.find((a) => a.startsWith(name + '='));
  return p ? p.slice(name.length + 1) : null;
};
const datum = arg('--datum') ?? new Date().toISOString().slice(0, 10);
const limit = Number(arg('--limit') ?? '15');
const gerichte = (arg('--gericht') ?? 'bger').split(',').filter(Boolean);

async function mapLimit<T, R>(items: T[], n: number, fn: (t: T, i: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let idx = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (idx < items.length) {
      const my = idx++;
      out[my] = await fn(items[my], my);
    }
  }));
  return out;
}

async function main() {
  console.log(`[entscheide] Build ${datum}, limit=${limit}, gerichte=${gerichte.join(',')}`);

  // 1) Korpus via Citation-Graph-BFS (nur keyed-Lookups → listing-unabhängig, R1/R9).
  const SEEDS = (arg('--seeds') ?? 'bger_5A_1100_2025').split(',').filter(Boolean);
  let startIds = [...SEEDS];
  for (const g of gerichte) {                       // launische Listing-Endpoints als Bonus-Seeds
    const ids = await enumeriereNeueste(g, limit * 2);
    if (ids.length) { startIds.push(...ids); console.log(`[entscheide]   Listing ${g}: +${ids.length} Bonus-Seeds`); }
  }
  startIds = [...new Set(startIds)];
  console.log(`[entscheide] Seeds: ${startIds.length} → BFS (de, concurrency 3)`);

  // Tief genug graben, damit die älteren zitierten Leitentscheide (amtliche
  // Sammlung, MIT Regeste) in den Pool kommen — nicht beim Erreichen von `limit`
  // stoppen, sondern bis maxFetch (einmaliger Anreicherungslauf).
  const maxFetch = Math.max(150, limit * 6);
  const visited = new Set<string>();
  const pool: EntscheidSnapshot[] = [];
  let queue = [...startIds];
  let fetched = 0;
  while (queue.length && fetched < maxFetch) {
    const layer = queue.filter((id) => !visited.has(id)).slice(0, 16);
    layer.forEach((id) => visited.add(id));
    queue = queue.filter((id) => !layer.includes(id));
    fetched += layer.length;
    const snaps = await mapLimit(layer, 4, async (id) => {
      const s = await holeEntscheidOCL(id, datum, { sprache: null });  // sprach-agnostisch traversieren
      process.stdout.write(s ? (s.sprache === 'de' ? '.' : '·') : 'x');
      return s;
    });
    for (const s of snaps) {
      if (!s) continue;
      if (s.sprache === 'de') pool.push(s);          // P0: nur Deutsch in den Korpus
      for (const ref of s.zitierteEntscheide) {       // aber GRAPH sprach-agnostisch ausbauen
        const cid = citedRefZuId(ref);
        if (cid && !visited.has(cid)) queue.push(cid);
      }
    }
  }
  process.stdout.write('\n');
  const seen = new Set<string>();
  const treffer = pool.filter((s) => { if (seen.has(s.id)) return false; seen.add(s.id); return true; });
  console.log(`[entscheide] BFS: ${fetched} geholt, ${treffer.length} unique de-Snapshots`);

  // 3) Auswahl: Leitentscheide + Regeste bevorzugen, dann Rest; auf limit kappen
  const rang = (s: EntscheidSnapshot) =>
    (s.regeste ? 0 : 2) + (s.leitcharakter === 'leitentscheid' ? 0 : 1) + (s.normKeys.length ? 0 : 0.5);
  const auswahl = [...treffer].sort((a, b) => rang(a) - rang(b) || (a.datum < b.datum ? 1 : -1)).slice(0, limit);
  console.log(`[entscheide] Treffer ${treffer.length}, gewählt ${auswahl.length} (mit Regeste: ${auswahl.filter((s) => s.regeste).length}, mit normKeys: ${auswahl.filter((s) => s.normKeys.length).length})`);

  // 4) Schreiben (geteiltes Modul) — Leer-Guard: nie einen bestehenden Korpus
  //    durch einen fehlgeschlagenen Lauf (OCL down) überschreiben.
  if (auswahl.length === 0) {
    console.log('[entscheide] 0 Treffer (Quelle nicht erreichbar?) — bestehender Korpus bleibt unberührt.');
    return;
  }
  const res = schreibeKorpus(auswahl, datum);
  console.log(`[entscheide] geschrieben: ${res.anzahl} Snapshots, ${res.normBuckets} Norm-Buckets, register.json, norm-index.json, erfasste-keys.generated.ts`);
}

main().catch((e) => { console.error(e); process.exit(1); });
