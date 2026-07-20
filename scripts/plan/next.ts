// scripts/plan/next.ts
import { readFileSync } from 'node:fs';
import { parseRoadmap, type Einheit } from './parse';

export interface Buckets {
  readyNow: string[];
  lanes: string[][];
  wartetDep: { id: string; offen: string[] }[];
  wartetFachzeit: string[];
  blockiert: { id: string; blocker: string }[];
  geparkt: string[];
  inArbeit: string[];
  wartet26xSlot: string[];
  slot26xBelegtVon: string | null;
}

function kollBasis(p: string): string { return p.replace(/[*?{[].*$/, ''); }
function pfadUeberlappt(x: string, y: string): boolean {
  const a = kollBasis(x), b = kollBasis(y);
  if (a === '' || b === '' || a === b) return true;
  const [k, l] = a.length <= b.length ? [a, b] : [b, a];
  return l.startsWith(k) && (k.endsWith('/') || l[k.length] === '/');
}
function kollidiert(a: string[], b: string[]): boolean {
  if (a.length === 0 || b.length === 0) return true;
  for (const x of a) for (const y of b) if (pfadUeberlappt(x, y)) return true;
  return false;
}

export function resolve(einheiten: Einheit[]): Buckets {
  // Dokumentreihenfolge = Bau-Reihenfolge. Vorher wurde lexikografisch nach ID
  // sortiert; damit waren alle ready-Einheiten gleichrangig und die Frage nach
  // dem «obersten offenen Schritt» (Ausführungs-Protokoll) nicht beantwortbar.
  const sortiert = [...einheiten].sort((a, b) => a.pos - b.pos);
  const done = new Set(sortiert.filter((e) => e.etikett.status === 'done').map((e) => e.id));
  const slot = sortiert.find((e) => e.etikett.asset26x && e.etikett.status === 'wip');
  const slot26xBelegtVon = slot ? slot.id : null;

  const readyNow: string[] = [];
  const wartetDep: { id: string; offen: string[] }[] = [];
  const wartetFachzeit: string[] = [];
  const blockiert: { id: string; blocker: string }[] = [];
  const geparkt: string[] = [];
  const inArbeit: string[] = [];
  const wartet26xSlot: string[] = [];
  let ready26xAdmitted = false;

  for (const e of sortiert) {
    const t = e.etikett;
    if (t.status === 'done') continue;
    if (t.status === 'wip') { inArbeit.push(e.id); continue; }
    if (t.status === 'parked') { geparkt.push(e.id); continue; }
    if (t.status === 'blocked') { blockiert.push({ id: e.id, blocker: t.blocker ?? '?' }); continue; }
    // status === 'ready'
    if (!t.of) { wartetFachzeit.push(e.id); continue; }
    const offen = t.dep.filter((d) => !done.has(d));
    if (offen.length) { wartetDep.push({ id: e.id, offen }); continue; }
    if (t.asset26x && (slot26xBelegtVon || ready26xAdmitted)) { wartet26xSlot.push(e.id); continue; }
    if (t.asset26x) ready26xAdmitted = true;
    readyNow.push(e.id);
  }

  // Lanes: greedy lexikografisch. Konservativ: leere kollision = undeklariert =
  // kollidiert mit allem (eigene Lane); Globs/Verzeichnis-Präfixe zählen als Überlappung.
  const kollOf = new Map(sortiert.map((e) => [e.id, e.etikett.kollision]));
  const lanes: string[][] = [];
  for (const id of readyNow) {
    const meins = kollOf.get(id)!;
    let platziert = false;
    for (const lane of lanes) {
      if (!lane.some((other) => kollidiert(meins, kollOf.get(other)!))) { lane.push(id); platziert = true; break; }
    }
    if (!platziert) lanes.push([id]);
  }
  return { readyNow, lanes, wartetDep, wartetFachzeit, blockiert, geparkt, inArbeit, wartet26xSlot, slot26xBelegtVon };
}

// CLI
if (!process.env.VITEST) {
  const { einheiten } = parseRoadmap(readFileSync('ROADMAP.md', 'utf8'));
  const b = resolve(einheiten);
  const z = (s: string) => console.log(s);
  z(`▶ OBERSTER offener Schritt: ${b.readyNow[0] ?? '—'}`);
  z(`▶ JETZT baubar (ready-now): ${b.readyNow.join(', ') || '—'}`);
  z(`  Parallel-Lanes: ${b.lanes.map((l) => `[${l.join(' + ')}]`).join('  ') || '—'}`);
  if (b.wartetDep.length) z(`⏳ wartet auf dep: ${b.wartetDep.map((x) => `${x.id}→${x.offen.join(',')}`).join(' · ')}`);
  if (b.wartetFachzeit.length) z(`👤 wartet auf Davids Fachzeit: ${b.wartetFachzeit.join(', ')}`);
  if (b.blockiert.length) z(`⛔ blockiert: ${b.blockiert.map((x) => `${x.id}(${x.blocker})`).join(', ')}`);
  if (b.geparkt.length) z(`🅿️  geparkt: ${b.geparkt.join(', ')}`);
  if (b.inArbeit.length) z(`🔨 in Arbeit (wip): ${b.inArbeit.join(', ')}`);
  if (b.wartet26xSlot.length) z(`⏸️  wartet auf 26×-Slot: ${b.wartet26xSlot.join(', ')}`);
  if (b.slot26xBelegtVon) z(`📦 26×-Slot belegt von: ${b.slot26xBelegtVon}`);
}
