// scripts/check-dispatch-klausel.ts — hält den §0-Pflichtblock lauffähig.
//
// Ohne dieses Tor kann jemand den §0-Block umformatieren/umbenennen und
// `npm run dispatch` bricht erst beim nächsten Auftrag — also genau dann,
// wenn niemand Zeit hat.
//
// SELBSTVALIDIERUNGS-LEKTION (20.7.2026, adversariale Prüfung PR #315):
// Die erste Fassung prüfte NUR die Markdown-Vorlage. Sie meldete GRÜN
// («alle 6 Pflichtpunkte vorhanden»), während `npm run dispatch -- pruefung`
// gleichzeitig ein stiller No-op war (exit 0, null Ausgabe — der Einstiegs-
// Guard testete process.argv[1] auf 'dispatch.ts', unter vite-node ist argv[1]
// aber der vite-node-Bin). Das Tor validierte gegen die eigene Ladung: es prüfte
// das Dokument, nicht das Werkzeug. Genau die Fehlerklasse F2(a), die dieser PR
// bekämpft — reproduziert in seinem Inneren (§6 Ziff. 7 lit. a).
//
// Darum prüft dieses Tor jetzt ZWEI Ebenen:
//   (A) STRUKTUR — der Block existiert in der Vorlage und trägt die 6 Punkte.
//   (B) WIRKUNG  — `npm run dispatch -- <klasse>` liefert diesen Block für
//                  JEDE Auftragsklasse wirklich auf stdout.
// (B) läuft als echter Subprozess über `npm run` — nicht als Import. Ein Import
// würde genau die Verpackung überspringen (package.json-Verdrahtung, Einstieg,
// Argument-Durchreichung), in der der Defekt sass.
import { execFileSync } from 'node:child_process';
import { pflichtKlausel, templateLesen, KLASSEN, TEMPLATE } from './dispatch';

const PFLICHT: [string, RegExp][] = [
  ['1 Daten-nicht-Auftrag (F4)', /^1 DATEN, NICHT AUFTRAG\./m],
  ['2 Reproduzieren-vor-Fix (F2d)', /^2 ERST REPRODUZIEREN, DANN FIXEN\./m],
  ['3 Verteilung-statt-Einzelwert (F3)', /^3 VERTEILUNG STATT EINZELWERT\./m],
  ['4 Recovery-Commit (F5)', /^4 RECOVERY\./m],
  ['5 Kollisionsprüfung (F6)', /^5 KOLLISION\./m],
  ['6 Kein-Merge-im-Bau-Auftrag (F1)', /^6 KEIN MERGE IM BAU-AUFTRAG\./m],
];

function rot(text: string): never {
  console.log(`check:dispatch-klausel ROT — ${text}`);
  process.exit(1);
}

// ── (A) Struktur der Vorlage ──────────────────────────────────────────
let block: string;
try {
  block = pflichtKlausel(templateLesen());
} catch (e) {
  rot((e as Error).message);
}

const fehlend = PFLICHT.filter(([, re]) => !re.test(block)).map(([n]) => n);
if (fehlend.length) {
  rot(
    `${fehlend.length} Pflichtpunkt(e) fehlen im §0-Block von ${TEMPLATE}:\n` +
    `${fehlend.map((n) => `  - ${n}`).join('\n')}\n\n` +
    `  Jeder Punkt deckt eine belegte Fehlerklasse (F1–F6, Vorfälle 18.–20.7.2026).\n` +
    `  Streichen ist möglich, aber nur bewusst: Punkt hier UND im Template entfernen.`);
}

// ── (B) Wirkung: der vorgeschriebene Aufrufweg liefert den Block wirklich ──
for (const klasse of Object.keys(KLASSEN)) {
  let ausgabe = '';
  try {
    ausgabe = execFileSync('npm', ['run', '--silent', 'dispatch', '--', klasse], {
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf8',
      timeout: 120_000,
    });
  } catch (e) {
    rot(
      `\`npm run dispatch -- ${klasse}\` ist nicht lauffähig: ${(e as Error).message}\n` +
      `  Der Generator ist der einzige Weg, auf dem Sub-Agenten den §0-Block je sehen.`);
  }

  if (!ausgabe.trim()) {
    rot(
      `\`npm run dispatch -- ${klasse}\` gibt NICHTS aus (stiller No-op, exit 0).\n\n` +
      `  Genau dieser Defekt bestand am 20.7.2026 unbemerkt, während dieses Tor\n` +
      `  grün meldete. Ein Tor, das nur die Vorlage liest, sieht ihn nie.\n` +
      `  → scripts/dispatch-cli.ts und die 'dispatch'-Zeile in package.json prüfen.`);
  }

  const fehlendB = PFLICHT.filter(([, re]) => !re.test(ausgabe)).map(([n]) => n);
  if (fehlendB.length) {
    rot(
      `\`npm run dispatch -- ${klasse}\` liefert ${fehlendB.length} Pflichtpunkt(e) NICHT:\n` +
      `${fehlendB.map((n) => `  - ${n}`).join('\n')}\n` +
      `  (Die Vorlage trägt sie — der Generator gibt sie nicht weiter.)`);
  }
}

console.log(
  `check:dispatch-klausel OK — §0-Block extrahierbar, alle ${PFLICHT.length} ` +
  `Pflichtpunkte (F1–F6) in der Vorlage (${block.split('\n').length} Zeilen) UND ` +
  `im Generator-Output aller ${Object.keys(KLASSEN).length} Auftragsklassen ` +
  `(${Object.keys(KLASSEN).join(', ')}).`);
