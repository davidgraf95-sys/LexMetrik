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
import {
  pruefeInvarianten,
  ARTEFAKT_ERWARTET,
  type InvariantenEintrag,
  type InvariantenVerstoss,
} from './check-invarianten-logik.ts';

const SNAP_DIR = 'public/normtext/bund';

const verstoesse: InvariantenVerstoss[] = [];
let gesetze = 0;
for (const f of readdirSync(SNAP_DIR).filter((f) => f.endsWith('.json'))) {
  const datei = JSON.parse(readFileSync(join(SNAP_DIR, f), 'utf8')) as { eintraege?: InvariantenEintrag[] };
  if (!datei.eintraege) continue;
  gesetze++;
  verstoesse.push(...pruefeInvarianten(f.replace(/\.json$/, ''), datei.eintraege));
}

// Artefakt-Verstösse («[tab]») gegen das Bestands-Register triagieren: pro Artikel
// die Trefferzahl mit ARTEFAKT_ERWARTET vergleichen. Bekannt & nicht mehr als
// erwartet ⇒ Expected-Fail (nicht blockierend, sichtbar). Neuer Artikel ODER
// Zunahme ⇒ harter Fehler. Alle Nicht-Artefakt-Verstösse sind immer hart.
const artefaktProArtikel = new Map<string, InvariantenVerstoss[]>();
const harte: InvariantenVerstoss[] = [];
for (const v of verstoesse) {
  if (v.art !== 'artefakt') {
    harte.push(v);
    continue;
  }
  const key = `${v.gesetz}|${v.id}`;
  (artefaktProArtikel.get(key) ?? artefaktProArtikel.set(key, []).get(key)!).push(v);
}
let bekannteArtefakte = 0;
for (const [key, treffer] of artefaktProArtikel) {
  const erwartet = ARTEFAKT_ERWARTET.get(key) ?? 0;
  if (treffer.length <= erwartet) {
    bekannteArtefakte += treffer.length;
  } else {
    // Zunahme in einem bekannten Artikel ODER ganz neuer Artikel → die überzähligen
    // (bzw. alle bei erwartet=0) sind harte Verstösse.
    harte.push(...treffer.slice(erwartet));
    bekannteArtefakte += Math.min(treffer.length, erwartet);
  }
}
// Register-Drift nach unten (Bestand saniert, Eintrag nicht entfernt) transparent melden.
const registerSumme = [...ARTEFAKT_ERWARTET.values()].reduce((a, b) => a + b, 0);

console.log('\n── Tor: Struktur-Invarianten (Bund-Normtext) ─────────────────────────────');
if (bekannteArtefakte > 0) {
  console.log(
    `  Hinweis: ${bekannteArtefakte}/${registerSumme} bekannte «[tab]»-Artefakt-Stellen (Expected-Fail-Register, HTML-Bestand) — Sanierung = eigener Batch.`,
  );
}
if (harte.length === 0) {
  console.log(
    `  ok: ${gesetze} Bund-Gesetze — kein Markup-/Entity-Leak, kein geleaktes Zähl-Suffix, kein NEUES «[tab]»-Artefakt.`,
  );
  process.exit(0);
}
console.error(`  FEHLER: ${harte.length} Invarianten-Verstoss/-Verstösse:`);
for (const v of harte.slice(0, 40)) {
  console.error(`    [${v.art}] ${v.gesetz} ${v.id} · ${v.stelle}: ${JSON.stringify(v.ausschnitt)}`);
}
if (harte.length > 40) console.error(`    … und ${harte.length - 40} weitere.`);
process.exit(1);
