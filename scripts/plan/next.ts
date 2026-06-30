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
  wartet26xSlot: string[];
  slot26xBelegtVon: string | null;
}

export function resolve(einheiten: Einheit[]): Buckets {
  const sortiert = [...einheiten].sort((a, b) => a.id.localeCompare(b.id));
  const done = new Set(sortiert.filter((e) => e.etikett.status === 'done').map((e) => e.id));
  const slot = sortiert.find((e) => e.etikett.asset26x && e.etikett.status === 'wip');
  const slot26xBelegtVon = slot ? slot.id : null;

  const readyNow: string[] = [];
  const wartetDep: { id: string; offen: string[] }[] = [];
  const wartetFachzeit: string[] = [];
  const blockiert: { id: string; blocker: string }[] = [];
  const geparkt: string[] = [];
  const wartet26xSlot: string[] = [];
  let ready26xAdmitted = false;

  for (const e of sortiert) {
    const t = e.etikett;
    if (t.status === 'done' || t.status === 'wip') continue;
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

  // Lanes: greedy lexikografisch, disjunkte kollision-Mengen
  const kollOf = new Map(sortiert.map((e) => [e.id, new Set(e.etikett.kollision)]));
  const lanes: string[][] = [];
  for (const id of readyNow) {
    const meins = kollOf.get(id)!;
    let platziert = false;
    for (const lane of lanes) {
      const ueberlappt = lane.some((other) => {
        const o = kollOf.get(other)!;
        for (const k of meins) if (o.has(k)) return true;
        return false;
      });
      if (!ueberlappt) { lane.push(id); platziert = true; break; }
    }
    if (!platziert) lanes.push([id]);
  }
  return { readyNow, lanes, wartetDep, wartetFachzeit, blockiert, geparkt, wartet26xSlot, slot26xBelegtVon };
}

// CLI
if (process.argv[1] && process.argv[1].endsWith('next.ts')) {
  const { einheiten } = parseRoadmap(readFileSync('ROADMAP.md', 'utf8'));
  const b = resolve(einheiten);
  const z = (s: string) => console.log(s);
  z(`▶ JETZT baubar (ready-now): ${b.readyNow.join(', ') || '—'}`);
  z(`  Parallel-Lanes: ${b.lanes.map((l) => `[${l.join(' + ')}]`).join('  ') || '—'}`);
  if (b.wartetDep.length) z(`⏳ wartet auf dep: ${b.wartetDep.map((x) => `${x.id}→${x.offen.join(',')}`).join(' · ')}`);
  if (b.wartetFachzeit.length) z(`👤 wartet auf Davids Fachzeit: ${b.wartetFachzeit.join(', ')}`);
  if (b.blockiert.length) z(`⛔ blockiert: ${b.blockiert.map((x) => `${x.id}(${x.blocker})`).join(', ')}`);
  if (b.geparkt.length) z(`🅿️  geparkt: ${b.geparkt.join(', ')}`);
  if (b.wartet26xSlot.length) z(`⏸️  wartet auf 26×-Slot: ${b.wartet26xSlot.join(', ')}`);
  if (b.slot26xBelegtVon) z(`📦 26×-Slot belegt von: ${b.slot26xBelegtVon}`);
}
