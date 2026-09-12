// scripts/zustaendigkeit/check-be-sprengel.ts — Offline-Tor `check:be-sprengel`.
//
// Kommandozeilen-Hülle um `pruefeBeSprengel()`; dieselbe Prüfung läuft im
// PR-CI als src/tests/beSprengel.test.ts (dort ist sie merge-blockierend).
// Rot-Beweise: bibliothek/behoerden/be-sprengel-geodaten-2026-09-12.md §8.

import { pruefeBeSprengel } from './be-sprengel-pruefung';

const b = pruefeBeSprengel();
console.log('check:be-sprengel — BE-Sprengel-Tabelle (Gemeinde → Regionalgericht / regionale Staatsanwaltschaft):');
console.log(`  Stand ${b.stand} · abgerufen ${b.abgerufen} · ${b.gemeinden} Gemeinden`);
console.log(`  ${b.standorte} Gerichtsstandorte in ${b.regionen} Regionen · ${b.staatsanwaltschaften} Staatsanwaltschaften · ${b.kreise} Verwaltungskreise`);
console.log(`  Deckung gegen PLZ-Verzeichnis: ${b.gemeinden}/${b.deckungPlz} · Artefakt ${(b.bytes / 1024).toFixed(1)} KB (Deckel ${(b.deckelBytes / 1024).toFixed(0)} KB)`);
if (b.fehler.length > 0) {
  console.error(`\ncheck:be-sprengel ROT — ${b.fehler.length} Befund(e):`);
  for (const f of b.fehler) console.error(`  · ${f}`);
  process.exit(1);
}
console.log('\ncheck:be-sprengel grün — Form, Schlüssel, Deckung, Einklang und Deckel in Ordnung.');
