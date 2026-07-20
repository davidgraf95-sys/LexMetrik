// scripts/dispatch-cli.ts — CLI-Einstieg für `npm run dispatch -- <klasse>`.
//
// WARUM eine eigene Datei: der frühere Einstiegs-Guard in dispatch.ts lautete
//   /(^|\/)dispatch\.ts$/.test(process.argv[1])
// und sollte verhindern, dass der CLI-Block beim Import durch
// check-dispatch-klausel.ts feuert. Unter `vite-node` ist argv[1] aber der
// vite-node-Bin (gemessen 20.7.2026:
//   ["…/node","…/node_modules/.bin/vite-node","pruefung"]),
// nie `dispatch.ts`. Der Guard war damit IMMER falsch: `npm run dispatch --
// pruefung` gab NICHTS aus und beendete mit 0 — ein stiller No-op auf genau dem
// Weg, den das Template vorschreibt. Vier Fehlerklassen (F3–F6) sassen in einem
// Generator, der auf dem dokumentierten Aufrufweg nichts lieferte.
//
// Die Trennung Bibliothek (dispatch.ts) / Einstieg (diese Datei) macht den
// Guard überflüssig statt ihn zu reparieren: eine Datei, die nur der CLI ist,
// braucht nicht zu raten, ob sie der Einstieg ist. `check:dispatch-generator`
// beweist den Weg End-to-End über `npm run`, nicht über einen Import.
import { dispatchText, templateLesen, KLASSEN } from './dispatch';

const klasse = process.argv[2];

if (!klasse) {
  console.error(`Aufruf: npm run dispatch -- <${Object.keys(KLASSEN).join(' | ')}>`);
  process.exit(1);
}

try {
  console.log(dispatchText(klasse, templateLesen()));
} catch (e) {
  console.error((e as Error).message);
  process.exit(1);
}
