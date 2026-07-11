// ─── P1-a/b: cache.sh-Pins auf die kanonische html-Manifestation heben ───────
//
//   npx vite-node scripts/fedlex-repin-kanonik.ts          # Dry-Run (Report)
//   npx vite-node scripts/fedlex-repin-kanonik.ts -- --write # schreibt cache.sh
//
// Löst je Pin das kanonische html-N via isExemplifiedBy auf (fedlex-manifest.ts)
// und ersetzt im 4. Pipe-Feld das gepinnte n durch das kanonische N — NUR dieses
// Feld, alles andere (eli/kons/anker/sr/Kommentare) bleibt byte-genau. SSoT bleibt
// cache.sh. UNRESOLVED-Pins (keine html-Manifestation) bleiben unangetastet; ihre
// Verifikation trägt die Inhalts-Sonde in cache.sh.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lesePinsVoll } from './fedlex-pins';
import { loeseHtmlManifeste } from './fedlex-manifest';

const CACHE_SH = resolve(dirname(fileURLToPath(import.meta.url)), 'fedlex-cache.sh');
const schreiben = process.argv.includes('--write');

const pins = lesePinsVoll();
console.error(`Auflösen: ${pins.length} Pins…`);
const map = await loeseHtmlManifeste(pins);

let sh = readFileSync(CACHE_SH, 'utf8');
const aenderungen: string[] = [];
const unresolved: string[] = [];

for (const p of pins) {
  const b = map.get(p.name)!;
  if (b.n === null) {
    unresolved.push(p.name);
    continue;
  }
  if (b.n === p.n) continue;
  // Nur das 4. Feld dieser einen Datenzeile ersetzen. Anker (Feld 5) kann Kommas
  // enthalten → präzise über die ersten drei Felder + altes n ankern.
  const alt = new RegExp(
    `("${p.name}\\|${p.eli.replace(/[/]/g, '/')}\\|${p.konsKompakt}\\|)${p.n}(\\|)`,
  );
  const vorher = sh;
  sh = sh.replace(alt, `$1${b.n}$2`);
  if (sh === vorher) throw new Error(`Re-Pin FEHLGESCHLAGEN für ${p.name} (Zeile nicht gematcht)`);
  aenderungen.push(`${p.name}\t${p.n} → ${b.n}`);
}

console.log(`\n=== Re-Pin ${aenderungen.length} Pins (Alias-URL → kanonisch isExemplifiedBy) ===`);
for (const a of aenderungen) console.log('  ' + a);
if (unresolved.length) console.log(`\nUNRESOLVED (unverändert): ${unresolved.join(', ')}`);

if (schreiben) {
  writeFileSync(CACHE_SH, sh);
  console.log(`\n✓ cache.sh geschrieben (${aenderungen.length} Pins re-gepinnt).`);
} else {
  console.log(`\n(Dry-Run — mit --write anwenden.)`);
}
