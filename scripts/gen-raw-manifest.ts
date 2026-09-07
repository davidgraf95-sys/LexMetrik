// ─── Raw-Store: Fedlex-Rohfassungen einsammeln + Manifest (sha256 + Pin-Stand) ─
//
// QS-VERWENDEN V3 (2.9.2026). scripts/fedlex-cache.sh (UNVERÄNDERT — kein
// Risiko-Pfad-Diff nötig, §5) lädt die konsolidierten Fedlex-Fassungen nach
// SRC_DIR (Default /tmp). Dieses Skript kopiert danach genau die Dateien, die
// scripts/fedlex-pins.ts als Pins führt, nach DEST_DIR und schreibt
// `DEST_DIR/MANIFEST.txt` mit sha256 + Pin-eli/-kons je Datei — die Ablage,
// die als GitHub-Release überlebt (fedlex-cache.sh selbst schreibt weiterhin
// nach /tmp, «Caches überleben Neustarts nicht»).
//
//   vite-node scripts/gen-raw-manifest.ts -- /tmp raw
//   (schreibt raw/<name>.html je Pin + raw/MANIFEST.txt; SRC_DIR=DEST_DIR
//    ist für lokale Tests erlaubt — dann wird nur manifestiert, nicht kopiert)
//
// Exit 1, wenn auch nur EIN Pin in SRC_DIR fehlt (unvollständiger Raw-Store
// wäre eine zweite, stille Fehlerform neben dem roten fedlex-cache.sh-Lauf,
// §8) — läuft im Workflow NACH einem bereits grünen fedlex-cache.sh, ein
// Fehlschlag hier zeigt also eine Diskrepanz zwischen den beiden Läufen.

import { readFileSync, statSync, mkdirSync, copyFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { lesePins } from './fedlex-pins.ts';

const srcDir = process.argv[2] ?? '/tmp';
const destDir = process.argv[3] ?? 'raw';

mkdirSync(destDir, { recursive: true });

const pins = lesePins();
const zeilen: string[] = [];
const fehlend: string[] = [];

for (const pin of pins) {
  const quelle = resolve(srcDir, `${pin.name}.html`);
  const ziel = resolve(destDir, `${pin.name}.html`);
  try {
    if (quelle !== ziel) copyFileSync(quelle, ziel);
  } catch {
    fehlend.push(pin.name);
    continue;
  }
  const buf = readFileSync(ziel);
  const hash = createHash('sha256').update(buf).digest('hex');
  const groesse = statSync(ziel).size;
  zeilen.push(`${hash}  ${groesse}  ${pin.name}.html  ${pin.eli}  ${pin.kons}`);
}

if (fehlend.length > 0) {
  console.error(`FEHLER  ${fehlend.length} Pin(s) ohne Rohdatei in ${srcDir}: ${fehlend.join(', ')}`);
  console.error('        (fedlex-cache.sh lief vermutlich nicht oder nicht vollständig davor.)');
  process.exit(1);
}

// Pin-Stand statt Bauzeit-Stempel (§2 — kein Date.now in deterministischen
// Artefakten): das jüngste kons-Datum unter den aktuellen Pins, aus den
// Daten selbst, nicht aus der Laufzeit.
const pinStand = pins.reduce((max, p) => (p.kons > max ? p.kons : max), pins[0]?.kons ?? '');

const kopf = [
  '# Fedlex Raw-Store Manifest',
  `# Pin-Stand: ${pinStand}`,
  `# Pins/Dateien: ${pins.length}`,
  '#',
  '# sha256  groesse_bytes  dateiname  eli  kons',
];

console.log([...kopf, ...zeilen].join('\n'));
