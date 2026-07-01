// ─── Tor: Bilder & Formeln (Bündel Bilder&Formeln, 1.7.2026) ────────────────
//
// Offline, deterministisch (§2). Sichert die selbst gehosteten amtlichen Bilder ab:
//   1. Jede in einem Snapshot referenzierte `datei` existiert unter public/normtext/.
//   2. sha stimmt mit den Bytes der Datei überein (§7-Drift / keine stille Änderung).
//   3. Keine verwaisten Bild-Dateien (jede Datei unter bilder/ wird referenziert).
// So kann kein Bild-Loch (fehlende Datei) und keine unbemerkte Bild-Änderung durch.
//
// Aufruf: vite-node scripts/normtext/check-bilder.ts
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const NORMTEXT = 'public/normtext';
const BUND = join(NORMTEXT, 'bund');
const BILDER = join(NORMTEXT, 'bilder');

interface Ref { datei: string; sha?: string }
function sammleRefs(bloecke: unknown[]): Ref[] {
  const out: Ref[] = [];
  for (const b of bloecke as Array<{ bild?: Ref; bildKacheln?: Array<{ bild?: Ref }> }>) {
    if (b.bild) out.push(b.bild);
    for (const k of b.bildKacheln ?? []) if (k.bild) out.push(k.bild);
  }
  return out;
}

const fehler: string[] = [];
const referenziert = new Set<string>();
let refN = 0;

for (const f of readdirSync(BUND).filter((f) => f.endsWith('.json'))) {
  const datei = JSON.parse(readFileSync(join(BUND, f), 'utf8')) as { eintraege?: Array<{ id: string; bloecke: unknown[] }> };
  for (const e of datei.eintraege ?? []) {
    for (const ref of sammleRefs(e.bloecke)) {
      refN++;
      const pfad = join(NORMTEXT, ref.datei);
      referenziert.add(ref.datei);
      if (!existsSync(pfad)) {
        fehler.push(`${e.id}: Bild-Datei fehlt → ${ref.datei}`);
        continue;
      }
      if (!ref.sha) {
        fehler.push(`${e.id}: Bild ohne sha → ${ref.datei}`);
        continue;
      }
      const ist = createHash('sha256').update(readFileSync(pfad)).digest('hex');
      if (ist !== ref.sha) fehler.push(`${e.id}: sha-Drift ${ref.datei} (Snapshot ${ref.sha.slice(0, 12)}… ≠ Datei ${ist.slice(0, 12)}…)`);
    }
  }
}

// Verwaiste Dateien: jede Datei unter bilder/<erlass>/ muss referenziert sein.
let dateiN = 0;
if (existsSync(BILDER)) {
  for (const erlass of readdirSync(BILDER)) {
    const dir = join(BILDER, erlass);
    if (!statSync(dir).isDirectory()) continue;
    for (const bild of readdirSync(dir)) {
      dateiN++;
      const rel = `bilder/${erlass}/${bild}`;
      if (!referenziert.has(rel)) fehler.push(`verwaiste Bild-Datei (nicht referenziert) → ${rel}`);
    }
  }
}

console.log('\n── Tor: Bilder & Formeln (Bund) ──────────────────────────────────────────');
if (fehler.length === 0) {
  console.log(`  ok: ${refN} Bild-Referenzen, ${dateiN} Dateien — alle vorhanden, sha stimmt, keine verwaisten.`);
  process.exit(0);
}
console.error(`  FEHLER: ${fehler.length} Bild-Problem(e):`);
for (const m of fehler.slice(0, 40)) console.error(`    ${m}`);
if (fehler.length > 40) console.error(`    … und ${fehler.length - 40} weitere.`);
process.exit(1);
