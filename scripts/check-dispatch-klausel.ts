// scripts/check-dispatch-klausel.ts — hält den §0-Pflichtblock lauffähig.
//
// Ohne dieses Tor kann jemand den §0-Block umformatieren/umbenennen und
// `npm run dispatch` bricht erst beim nächsten Auftrag — also genau dann,
// wenn niemand Zeit hat. Das Tor prüft, dass der Block existiert, extrahierbar
// ist und die sechs nummerierten Punkte trägt.
import { readFileSync } from 'node:fs';
import { pflichtKlausel, TEMPLATE } from './dispatch';

const PFLICHT: [string, RegExp][] = [
  ['1 Daten-nicht-Auftrag (F4)', /^1 DATEN, NICHT AUFTRAG\./m],
  ['2 Reproduzieren-vor-Fix (F2d)', /^2 ERST REPRODUZIEREN, DANN FIXEN\./m],
  ['3 Verteilung-statt-Einzelwert (F3)', /^3 VERTEILUNG STATT EINZELWERT\./m],
  ['4 Recovery-Commit (F5)', /^4 RECOVERY\./m],
  ['5 Kollisionsprüfung (F6)', /^5 KOLLISION\./m],
  ['6 Kein-Merge-im-Bau-Auftrag (F1)', /^6 KEIN MERGE IM BAU-AUFTRAG\./m],
];

let block: string;
try {
  block = pflichtKlausel(readFileSync(TEMPLATE, 'utf8'));
} catch (e) {
  console.log(`check:dispatch-klausel ROT — ${(e as Error).message}`);
  process.exit(1);
}

const fehlend = PFLICHT.filter(([, re]) => !re.test(block)).map(([n]) => n);

if (fehlend.length) {
  console.log(
    `check:dispatch-klausel ROT — ${fehlend.length} Pflichtpunkt(e) fehlen im §0-Block ` +
    `von ${TEMPLATE}:\n${fehlend.map((n) => `  - ${n}`).join('\n')}\n\n` +
    `  Jeder Punkt deckt eine belegte Fehlerklasse (F1–F6, Vorfälle 18.–20.7.2026).\n` +
    `  Streichen ist möglich, aber nur bewusst: Punkt hier UND im Template entfernen.`);
  process.exit(1);
}

console.log(
  `check:dispatch-klausel OK — §0-Block extrahierbar, alle ${PFLICHT.length} ` +
  `Pflichtpunkte (F1–F6) vorhanden (${block.split('\n').length} Zeilen).`);
