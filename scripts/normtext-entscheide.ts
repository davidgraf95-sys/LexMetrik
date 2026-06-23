// ─── Build-Orchestrator: Rechtsprechungs-Snapshots erzeugen ──────────────────
//
// Resilient (Fahrplan R1/R9), Detail via OCL keyed-Lookups. Zwei Quellen-Zweige:
//  · Bund (bger): Citation-Graph-BFS (listing-unabhängig) → tief, regeste-reich.
//  · Kantone: Listing je kantonalem Gericht (kein BFS — deren Zitiergraph führt
//    nicht zu bger). /structure ist Bund-only → kantonal greift der ehrliche
//    Fliesstext-Fallback (§8, EntscheidBody).
// Schreibt NIE von Hand editierte Dateien — alles aus diesem Generator (§7).
//
//   vite-node scripts/normtext-entscheide.ts -- --datum=2026-06-23 --limit=45 \
//     --courts=zh_obergericht,be_verwaltungsgericht --kanton-pro=8
//
import { holeEntscheidOCL, enumeriereNeueste, citedRefZuId } from './normtext/adapter-entscheide';
import { schreibeKorpus } from './normtext/entscheide-schreiben';
import type { EntscheidSnapshot } from '../src/lib/rechtsprechung/typen';

const arg = (name: string): string | null => {
  const p = process.argv.find((a) => a.startsWith(name + '='));
  return p ? p.slice(name.length + 1) : null;
};
const datum = arg('--datum') ?? new Date().toISOString().slice(0, 10);
const bundLimit = Number(arg('--limit') ?? '45');
const kantonPro = Number(arg('--kanton-pro') ?? '8');
const kantCourts = (arg('--courts') ?? '').split(',').map((s) => s.trim()).filter(Boolean);

async function mapLimit<T, R>(items: T[], n: number, fn: (t: T, i: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let idx = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (idx < items.length) { const my = idx++; out[my] = await fn(items[my], my); }
  }));
  return out;
}

// Auswahl-Rang: Regeste zuerst, dann Leitentscheid, dann mit Norm-Verknüpfung.
const rang = (s: EntscheidSnapshot) =>
  (s.regeste ? 0 : 2) + (s.leitcharakter === 'leitentscheid' ? 0 : 1) + (s.normKeys.length ? 0 : 0.5);
const sortAuswahl = (xs: EntscheidSnapshot[]) =>
  [...xs].sort((a, b) => rang(a) - rang(b) || (a.datum < b.datum ? 1 : -1));

/** Bund: Citation-Graph-BFS ab Seeds (+ Listing-Bonus-Seeds), de-Pool, gewählt nach Rang. */
async function bundKorpus(): Promise<EntscheidSnapshot[]> {
  const SEEDS = (arg('--seeds') ?? 'bger_5A_1100_2025').split(',').filter(Boolean);
  let startIds = [...SEEDS];
  const bonus = await enumeriereNeueste('bger', bundLimit * 2);
  if (bonus.length) { startIds.push(...bonus); console.log(`[bund] Listing bger: +${bonus.length} Bonus-Seeds`); }
  startIds = [...new Set(startIds)];

  const maxFetch = Math.max(150, bundLimit * 6);
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
      const s = await holeEntscheidOCL(id, datum, { sprache: null });
      process.stdout.write(s ? (s.sprache === 'de' ? '.' : '·') : 'x');
      return s;
    });
    for (const s of snaps) {
      if (!s) continue;
      if (s.sprache === 'de') pool.push(s);
      for (const ref of s.zitierteEntscheide) {
        const cid = citedRefZuId(ref);
        if (cid && !visited.has(cid)) queue.push(cid);
      }
    }
  }
  process.stdout.write('\n');
  const seen = new Set<string>();
  const uniq = pool.filter((s) => { if (seen.has(s.id)) return false; seen.add(s.id); return true; });
  const gewaehlt = sortAuswahl(uniq).slice(0, bundLimit);
  console.log(`[bund] BFS ${fetched} geholt, ${uniq.length} unique de → ${gewaehlt.length} gewählt (Regeste: ${gewaehlt.filter((s) => s.regeste).length})`);
  return gewaehlt;
}

/** Kantone: je Gericht Listing → keyed Detail (de), gewählt nach Rang (kantonPro). */
async function kantonKorpus(): Promise<EntscheidSnapshot[]> {
  const out: EntscheidSnapshot[] = [];
  for (const court of kantCourts) {
    const ids = await enumeriereNeueste(court, kantonPro * 4);
    if (!ids.length) { console.log(`[kanton] ${court}: 0 IDs (Listing nicht erreichbar)`); continue; }
    const snaps = await mapLimit(ids.slice(0, kantonPro * 4), 4, async (id) => {
      const s = await holeEntscheidOCL(id, datum, { sprache: 'de' });
      process.stdout.write(s ? '.' : 'x');
      return s;
    });
    process.stdout.write('\n');
    const ok = snaps.filter((s): s is EntscheidSnapshot => !!s);
    const gewaehlt = sortAuswahl(ok).slice(0, kantonPro);
    out.push(...gewaehlt);
    console.log(`[kanton] ${court}: ${ok.length} de → ${gewaehlt.length} gewählt (Regeste: ${gewaehlt.filter((s) => s.regeste).length})`);
  }
  return out;
}

async function main() {
  console.log(`[entscheide] Build ${datum} · Bund-Limit ${bundLimit} · Kantone [${kantCourts.join(',') || '–'}] je ${kantonPro}`);
  const bund = await bundKorpus();
  const kanton = kantCourts.length ? await kantonKorpus() : [];

  // Vereinen + global dedupen (id stabil).
  const seen = new Set<string>();
  const auswahl = [...bund, ...kanton].filter((s) => { if (seen.has(s.id)) return false; seen.add(s.id); return true; });

  // Leer-Guard: nie einen bestehenden Korpus durch einen fehlgeschlagenen Lauf überschreiben.
  if (auswahl.length === 0) {
    console.log('[entscheide] 0 Treffer (Quelle nicht erreichbar?) — bestehender Korpus bleibt unberührt.');
    return;
  }
  const res = schreibeKorpus(auswahl, datum);
  const kantN = auswahl.filter((s) => s.kanton !== 'CH').length;
  console.log(`[entscheide] geschrieben: ${res.anzahl} Snapshots (Bund ${res.anzahl - kantN}, Kanton ${kantN}), ${res.normBuckets} Norm-Buckets.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
