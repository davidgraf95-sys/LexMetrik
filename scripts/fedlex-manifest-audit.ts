// ─── P1-a/b Audit: gepinntes html-N vs. kanonische isExemplifiedBy-Manifestation
//
//   npx vite-node scripts/fedlex-manifest-audit.ts
//
// Report-only (kein Schreiben). Klassifiziert jeden cache.sh-Pin:
//   MISMATCH   gepinntes n ≠ kanonisches N  → cache.sh re-pinnen + regenerieren
//   OK         gepinntes n = kanonisches N
//   UNRESOLVED keine html-Manifestation via isExemplifiedBy (Alias-URL bleibt
//              einzige Route; Inhalts-Sonde in cache.sh trägt die Verifikation)
// Exit 0 immer (Audit informiert; das harte Tor ist check:fedlex-versionen).
import { lesePinsVoll } from './fedlex-pins';
import { loeseHtmlManifeste } from './fedlex-manifest';

const pins = lesePinsVoll();
console.error(`Auflösen: ${pins.length} Pins (html-Manifestation via isExemplifiedBy)…`);
const map = await loeseHtmlManifeste(pins);

const mismatch: string[] = [];
const unresolved: string[] = [];
let ok = 0;
for (const p of pins) {
  const b = map.get(p.name)!;
  if (b.n === null) {
    unresolved.push(`${p.name}  gepinnt=${p.n}  (eli ${p.eli} @ ${p.konsKompakt})`);
  } else if (b.n !== p.n) {
    mismatch.push(`${p.name}\t${p.n} → ${b.n}\t${p.eli} @ ${p.konsKompakt}`);
  } else {
    ok++;
  }
}

console.log(`\n=== MISMATCH (${mismatch.length}) — cache.sh n falsch, kanonisch ist rechts ===`);
for (const m of mismatch) console.log('  ' + m);
console.log(`\n=== UNRESOLVED (${unresolved.length}) — keine html-Manifestation, Alias-URL + Sonde ===`);
for (const u of unresolved) console.log('  ' + u);
console.log(`\n=== OK (${ok}) — gepinntes n = kanonisch ===`);
console.log(`\nSumme: ${pins.length} Pins · ${mismatch.length} MISMATCH · ${unresolved.length} UNRESOLVED · ${ok} OK`);
