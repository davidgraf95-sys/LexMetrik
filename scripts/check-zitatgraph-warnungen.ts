// ─── Z3 · Tor-Hülle des Zitatgraph-Warn-Berichts ────────────────────────────
//
// BEWUSST KEIN TOR: Exit stets 0, nicht Teil von `npm run gate`. Der Bericht
// zeigt eine Differenz zwischen dem amtlichen Fedlex-Zitatgraphen und
// LexMetriks Verweis-Erkennung; ein erheblicher Teil davon ist bauartbedingtes
// Rauschen (Fussnoten-Citations, Erlass-Verweise ohne Artikelnummer). Ein Tor
// darauf wäre eines, das aus richtigem Verhalten Rot macht.
//
// Diese Datei bleibt bewusst dünn: Messung, Klassenbildung und Bericht-Satz
// stehen in `scripts/zitatgraph-vergleich.ts` (Steuerungs-Flächendeckel
// `scripts/check-*.ts`, aufraeumen.md §3 — dieselbe Trennlinie wie
// check-verweis-inventar.ts ↔ verweis-inventar-messung.ts).
//
// Lauf: `npm run check:zitatgraph` (setzt `npm run zitatgraph:generieren` voraus).

import { writeFileSync } from 'node:fs';
import { berichte, BERICHT_PFAD } from './zitatgraph-vergleich';

const ergebnis = berichte();
if (!ergebnis) {
  console.log('messwerte/fedlex-zitatgraph.json fehlt — zuerst `npm run zitatgraph:generieren`.');
} else {
  writeFileSync(BERICHT_PFAD, ergebnis.inhalt);
  for (const zeile of ergebnis.log) console.log(zeile);
}
