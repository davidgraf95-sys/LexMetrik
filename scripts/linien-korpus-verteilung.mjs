// Erhebt die korpusweite Verteilung der Struktur-Sidecar-Tiefen + Artikel-Dichten
// (U-LINIEN / A8) — die EMPIRISCHE Grundlage der Linien-Schwellen in
// src/pages/gesetz-leser/linienAufbau.ts (LINIEN_SCHWELLEN). Rein lesend, kein Netz.
//
//   node scripts/linien-korpus-verteilung.mjs
//
// Der Algorithmus ist die JS-Spiegelung von `linienProfil` (dort die SSoT); das
// Tor `check:linien-kanon` importiert das echte TS-Modul und beweist die Gleichheit.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const wurzel = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TIEF_AB = 3;
const DICHTE_MIN = 2;

function median(v) {
  if (v.length === 0) return 0;
  const s = [...v].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

function profil(struktur) {
  let tiefe = 0;
  const aps = [];
  for (const k in struktur) {
    const g = struktur[k].gliederung ?? [];
    if (g.length > tiefe) tiefe = g.length;
    for (let L = 0; L < g.length; L++) {
      const m = (aps[L] ??= new Map());
      const pref = g.slice(0, L + 1).map((x) => x.label).join(' / ');
      m.set(pref, (m.get(pref) ?? 0) + 1);
    }
  }
  if (tiefe === 0) return { strukturTiefe: 0, guideEbene: null, dichteAmGuide: 0, autoGuide: false };
  const ge = Math.min(tiefe - 1, 1);
  const dg = median([...(aps[ge]?.values() ?? [])]);
  // V2·L-3 (Umkehr #161): Auto-Guide allein am Dichte-Boden, die Tiefe deckelt nicht mehr.
  return { strukturTiefe: tiefe, guideEbene: ge, dichteAmGuide: dg, autoGuide: dg >= DICHTE_MIN };
}

const rows = [];
for (const ebene of ['bund', 'kanton']) {
  const dir = resolve(wurzel, `public/normtext/struktur/${ebene}`);
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.json')) continue;
    let d;
    try { d = JSON.parse(readFileSync(resolve(dir, f), 'utf8')); } catch { continue; }
    rows.push({ ebene, key: f.slice(0, -5), ...profil(d.artikel ?? {}) });
  }
}

const distTiefe = {};
for (const r of rows) distTiefe[r.strukturTiefe] = (distTiefe[r.strukturTiefe] ?? 0) + 1;
const autoAn = rows.filter((r) => r.autoGuide).length;
const flach = rows.filter((r) => r.strukturTiefe === 0).length;
const tief = rows.filter((r) => r.strukturTiefe >= TIEF_AB).length;

console.log(`Korpus: ${rows.length} Sidecar-Erlasse`);
console.log('Gliederungstiefe-Verteilung:', JSON.stringify(distTiefe));
console.log(`  flach (Tiefe 0): ${flach}  ·  tiefe Kodifikation (Tiefe ≥ ${TIEF_AB}): ${tief}`);
console.log(`Auto-Guide AN: ${autoAn}  ·  AUS: ${rows.length - autoAn}`);
console.log(`Schwellen: DICHTE_MIN=${DICHTE_MIN} (Median Art./Sektion, EINZIGER Auto-Guide-Boden seit V2·L-3); TIEF_AB=${TIEF_AB} nur noch «tiefe Kodifikation»-Klassifikation`);
for (const k of ['ZGB', 'OR', 'ARG', 'VMWG']) {
  const r = rows.find((x) => x.key === k && x.ebene === 'bund');
  if (r) console.log(`  ${k.padEnd(5)} tiefe=${r.strukturTiefe} dichte@guide=${r.dichteAmGuide} → autoGuide=${r.autoGuide}`);
}
