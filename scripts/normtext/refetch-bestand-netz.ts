// ─── Erwägungs-Re-Fetch des BESTEHENDEN Korpus über OCL (#2, einmalig) ────────
//
// Die bestehenden Snapshots haben die OCL-e_number VERLOREN (alter, zu strenger
// markenPlausibel → 168 flach gerenderte BGE). Re-Fetch holt die Struktur über
// die rekonstruierte decision_id (= `${gericht}_${nummer}`, mit Leerzeichen) neu,
// normalisiert die Erwägungen mit der REPARIERTEN Funktion und GRAFTET NUR den
// Erwägungs-Abschnitt in den bestehenden Snapshot — alle übrigen Felder (datum,
// regeste, sachverhalt, dispositiv, zitierung, normKeys …) bleiben unangetastet
// (minimale Blast-Radius, register.json bleibt feldgleich gültig).
//
// HARTE TORE (§1):
//  · WORT-INVARIANTE je Entscheid: konkatenierter Erwägungstext vorher==nachher
//    (whitespace-normalisiert). Drift ⇒ Original behalten, NICHT graften.
//  · #1 ZUKUNFTS-DATUM: Entscheide mit datum > HEUTE sind unmögliche Quelldaten
//    (Crawl kann nichts aus der Zukunft holen) ⇒ aus dem Korpus geworfen.
//
// Schreibt am Ende KONSISTENT über schreibeKorpus (Snapshots + register.json +
// norm-index.json + erfasste-keys), also nie ein Feld doppelt (§5).
//
//   vite-node scripts/normtext/refetch-bestand-netz.ts -- --schreiben [--nur=<idPrefix>] [--limit=N] [--heute=YYYY-MM-DD]
//
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { holeEntscheidOCL, jget } from './adapter-entscheide';
import { schreibeKorpus } from './entscheide-schreiben';
import { sha256EntscheidBloecke } from './sha-entscheide';
import type {
  EntscheidBlock, EntscheidSnapshot, EntscheidSnapshotDatei,
} from '../../src/lib/rechtsprechung/typen';

const ROOT = process.cwd();
const PUB = join(ROOT, 'public', 'rechtsprechung');
const API = 'https://mcp.opencaselaw.ch/api'; // spiegelt adapter-entscheide (einmaliges Script)

/** Normalisiert ein Aktenzeichen für den Vergleich (OCL-Docket trägt teils ein
 *  «BGE/ATF/DTF »-Präfix; unsere nummer nicht). */
const normNr = (s: string | undefined) =>
  String(s ?? '').replace(/^(BGE|ATF|DTF)\s+/i, '').replace(/\s+/g, ' ').trim();

/** Robuste Auflösung Snapshot → OCL-decision_id über die Suche: zwei ID-Schemata
 *  existieren (neu «bge_152 III 92», alt «bge_BGE_150_III_137»), daher nicht
 *  rekonstruieren, sondern per ?q=<nummer> suchen und EXAKT auf court+docket matchen. */
type CompactRow = { decision_id?: string; court?: string; docket_number?: string };
async function loeseId(gericht: string, nummer: string): Promise<string | null> {
  const d = await jget<{ results?: CompactRow[]; decisions?: CompactRow[] }>(
    `${API}/decisions?q=${encodeURIComponent(nummer)}&fields=compact&limit=15`);
  const arr = d?.results ?? d?.decisions ?? [];
  const hit = arr.find((r) => r.court === gericht && normNr(r.docket_number) === normNr(nummer));
  return hit?.decision_id ?? null;
}

const args = process.argv.slice(2);
const schreiben = args.includes('--schreiben');
const nurPrefix = args.find((a) => a.startsWith('--nur='))?.split('=')[1] ?? null;
const limit = Number(args.find((a) => a.startsWith('--limit='))?.split('=')[1] ?? '0') || 0;
const HEUTE = args.find((a) => a.startsWith('--heute='))?.split('=')[1] ?? new Date().toISOString().slice(0, 10);

function alleSnapshotDateien(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...alleSnapshotDateien(p));
    else if (name.endsWith('.json') && name !== 'register.json' && name !== 'norm-index.json') out.push(p);
  }
  return out;
}
const erwBloecke = (s: EntscheidSnapshot): EntscheidBlock[] =>
  s.abschnitte.find((a) => a.typ === 'erwaegung')?.bloecke ?? [];
const worte = (bl: EntscheidBlock[]): string =>
  bl.map((b) => b.text).join('\n').replace(/\s+/g, ' ').trim();

async function mapLimit<T, R>(items: T[], n: number, fn: (t: T, i: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let idx = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (idx < items.length) { const my = idx++; out[my] = await fn(items[my], my); }
  }));
  return out;
}

interface Bericht { id: string; status: string; markeVor: number; markeNach: number; }

async function main() {
  // ALLE Snapshots laden (für einen vollständigen, nie trunkierten schreibeKorpus);
  // `ziel` ist die zu VERARBEITENDE Teilmenge (--nur/--limit), `alleSnaps` der Rest.
  const alleSnaps: EntscheidSnapshot[] = alleSnapshotDateien(PUB)
    .map((d) => (JSON.parse(readFileSync(d, 'utf8')) as EntscheidSnapshotDatei).eintraege[0])
    .filter(Boolean);
  const gefiltert = alleSnaps.filter((s) => !nurPrefix || s.id.startsWith(nurPrefix));
  const ziel = limit > 0 ? gefiltert.slice(0, limit) : gefiltert;
  console.log(`[refetch] ${ziel.length} Snapshots · HEUTE=${HEUTE} · ${schreiben ? 'SCHREIBEN' : 'DRY-RUN'}`);

  const berichte: Bericht[] = [];
  const fertig = await mapLimit(ziel, 4, async (snap) => {
    const markeVor = erwBloecke(snap).filter((b) => b.marke).length;
    // #1 Zukunfts-Datum: unmögliches Quelldatum → aus dem Korpus werfen.
    if (snap.datum && snap.datum > HEUTE) {
      berichte.push({ id: snap.id, status: 'ZUKUNFTSDATUM-VERWORFEN', markeVor, markeNach: 0 });
      process.stdout.write('!');
      return null;
    }
    let status = 'unverändert';
    let ergebnis = snap;
    try {
      const decisionId = await loeseId(snap.gericht, snap.nummer);
      const fresh = decisionId
        ? await holeEntscheidOCL(decisionId, snap.abgerufen, { sachgebietHint: snap.sachgebiet, sprache: null })
        : null;
      const freshErw = fresh?.abschnitte.find((a) => a.typ === 'erwaegung');
      if (freshErw && freshErw.bloecke.some((b) => b.marke)) {
        if (worte(erwBloecke(snap)) === worte(freshErw.bloecke)) {
          const abschnitte = snap.abschnitte.map((a) => (a.typ === 'erwaegung' ? freshErw : a));
          ergebnis = { ...snap, abschnitte, sha: sha256EntscheidBloecke(abschnitte) };
          status = 'neu-strukturiert';
        } else {
          status = 'WORTDRIFT-original-behalten';
        }
      } else if (!fresh) {
        status = 'kein-treffer';
      }
    } catch {
      status = 'fetch-fehler';
    }
    const markeNach = erwBloecke(ergebnis).filter((b) => b.marke).length;
    berichte.push({ id: snap.id, status, markeVor, markeNach });
    process.stdout.write(status === 'neu-strukturiert' ? '+' : status === 'unverändert' ? '.' : status.startsWith('WORT') ? 'D' : 'x');
    return ergebnis;
  });
  process.stdout.write('\n');

  const final = fertig.filter((s): s is EntscheidSnapshot => !!s);
  // Nicht verarbeitete Snapshots (ausserhalb --nur/--limit) unverändert mitnehmen,
  // damit schreibeKorpus den Korpus NIE trunkiert.
  const zielIds = new Set(ziel.map((s) => s.id));
  for (const s of alleSnaps) if (!zielIds.has(s.id)) final.push(s);

  const zaehl = (k: string) => berichte.filter((b) => b.status === k).length;
  const verbessert = berichte.filter((b) => b.markeNach > b.markeVor).length;
  console.log(`[refetch] neu-strukturiert: ${zaehl('neu-strukturiert')} · unverändert: ${zaehl('unverändert')} · Wortdrift: ${zaehl('WORTDRIFT-original-behalten')} · kein-Treffer: ${zaehl('kein-treffer')} · Fehler: ${zaehl('fetch-fehler')} · Zukunftsdatum verworfen: ${zaehl('ZUKUNFTSDATUM-VERWORFEN')}`);
  console.log(`[refetch] Entscheide mit mehr Marken nachher: ${verbessert}`);
  for (const b of berichte.filter((b) => b.status.startsWith('WORT') || b.status === 'ZUKUNFTSDATUM-VERWORFEN')) {
    console.log(`         ${b.status}: ${b.id}`);
  }

  if (schreiben) {
    // erzeugt-Datum des Bestands bewahren (Diff bleibt auf die Marken-Änderung
    // fokussiert statt jede Datei nur am Datum zu ändern).
    let erzeugt = HEUTE;
    try { erzeugt = JSON.parse(readFileSync(join(PUB, 'register.json'), 'utf8')).erzeugt ?? HEUTE; } catch { /* Fallback HEUTE */ }
    const res = schreibeKorpus(final, erzeugt);
    console.log(`[refetch] geschrieben: ${res.anzahl} Snapshots (erzeugt ${erzeugt}), ${res.normBuckets} Norm-Buckets.`);
  } else {
    console.log('[refetch] DRY-RUN — nichts geschrieben. Mit --schreiben anwenden.');
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
