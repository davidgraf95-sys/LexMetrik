// ─── Tor: Struktur-Invarianten Bund-Normtext (Bündel N, Phase 0) ─────────────
//
// Offline, deterministisch (§2). Fängt stille Text-Inhalts-Defekte je Block, die
// die Token-/Sidecar-Tore nicht sehen: HTML-Markup-Leak, unaufgelöste Entities,
// geleaktes lat. Zähl-Suffix (N1-Regressionswächter). Reine Logik in
// invarianten-logik.ts. Scope «zuerst nur Bund» (wie check:tabellen).
//
// Aufruf: vite-node scripts/normtext/check-invarianten.ts
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pruefeInvarianten, type InvariantenEintrag, type InvariantenVerstoss } from './check-invarianten-logik.ts';

const SNAP_DIR = 'public/normtext/bund';

const verstoesse: InvariantenVerstoss[] = [];
let gesetze = 0;
for (const f of readdirSync(SNAP_DIR).filter((f) => f.endsWith('.json'))) {
  const datei = JSON.parse(readFileSync(join(SNAP_DIR, f), 'utf8')) as { eintraege?: InvariantenEintrag[] };
  if (!datei.eintraege) continue;
  gesetze++;
  verstoesse.push(...pruefeInvarianten(f.replace(/\.json$/, ''), datei.eintraege));
}

console.log('\n── Tor: Struktur-Invarianten (Bund-Normtext) ─────────────────────────────');
if (verstoesse.length === 0) {
  console.log(`  ok: ${gesetze} Bund-Gesetze — kein Markup-/Entity-Leak, kein geleaktes Zähl-Suffix im Body.`);
  process.exit(0);
}
console.error(`  FEHLER: ${verstoesse.length} Invarianten-Verstoss/-Verstösse:`);
for (const v of verstoesse.slice(0, 40)) {
  console.error(`    [${v.art}] ${v.gesetz} ${v.id} · ${v.stelle}: ${JSON.stringify(v.ausschnitt)}`);
}
if (verstoesse.length > 40) console.error(`    … und ${verstoesse.length - 40} weitere.`);
process.exit(1);
