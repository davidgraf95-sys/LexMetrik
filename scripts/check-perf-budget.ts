// scripts/check-perf-budget.ts — Performance-Budget-Tor (QS-PERF, CLAUDE.md §15).
//
// Operationalisiert die Garantie «nicht merklich langsamer»: sichert die durch
// den vendor-react-Split (FAHRPLAN-PERFORMANCE Rank 5) erreichte Bundle-Topologie
// gegen Regression und schützt automatisiert vor der Doppel-React-Instanz, die
// der §9-Bug-Check sonst von Hand prüfen müsste.
//
// Bewusst Chrome-frei und deterministisch (CI-tauglich). Es liest ein bereits
// gebautes `dist/` — wie der e2e-Lauf gehört es in den DEPLOY-Pfad (nach
// `npm run build`), NICHT in den schnellen `gate` (der nicht baut). Die
// Lighthouse-Metrik-Schranken (CLS/LCP/TBT auf /gesetze/bund/OR unter 4× CPU)
// bleiben der manuelle Mess-Schritt im Deploy-Ritual (deploy-check), bis ein
// CI-Chrome verdrahtet ist.
//
// Budgets als gzip-Bytes (Auslieferungsgröße). Headroom bewusst eng genug, dass
// ein Zurückrutschen von react-dom/react-router in den Entry rot wird.

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

const DIST = join(process.cwd(), 'dist', 'assets');

// gzip-Budgets. Stand 30.6.2026: entry 30 KB, vendor-react 73 KB.
const ENTRY_MAX = 60 * 1024;          // ~2× Headroom; fängt react-dom-Rückfall in den Entry
const VENDOR_REACT_MAX = 90 * 1024;   // react/-dom/-router(+scheduler) zusammen

const gz = (p: string): number => gzipSync(readFileSync(p)).length;
const kb = (n: number): string => `${(n / 1024).toFixed(1)} KB`;

if (!existsSync(DIST)) {
  console.error('check:perf-budget — dist/assets/ fehlt. Zuerst `npm run build` (das Tor prüft das gebaute Bundle).');
  process.exit(1);
}

const files = readdirSync(DIST);
const entry = files.filter((f) => /^index-.*\.js$/.test(f));
const vendor = files.filter((f) => /^vendor-react-.*\.js$/.test(f));
const fehler: string[] = [];

console.log('check:perf-budget — Bundle-Topologie & -Budget:');

// 1) Genau EIN Entry-Chunk und EIN vendor-react-Chunk (stabile Cache-Topologie).
if (entry.length !== 1) fehler.push(`Entry-Chunk: erwartet genau 1 (index-*.js), gefunden ${entry.length}.`);
if (vendor.length !== 1) {
  fehler.push(`vendor-react-Chunk: erwartet genau 1 (vendor-react-*.js), gefunden ${vendor.length} — `
    + 'die React-Familie muss nach Rank 5 in EINEM stabil benannten Chunk liegen (vite.config manualChunks).');
}

// 2) gzip-Budgets.
if (entry.length === 1) {
  const g = gz(join(DIST, entry[0]));
  console.log(`  entry         ${entry[0]}  gzip ${kb(g)}  (Budget ${kb(ENTRY_MAX)})`);
  if (g > ENTRY_MAX) {
    fehler.push(`Entry-Chunk ${kb(g)} > Budget ${kb(ENTRY_MAX)} — meist react-dom/react-router zurück im Entry `
      + '(manualChunks-Regex prüfen) oder eine schwere, nicht lazy geladene Abhängigkeit.');
  }
}
if (vendor.length === 1) {
  const g = gz(join(DIST, vendor[0]));
  console.log(`  vendor-react  ${vendor[0]}  gzip ${kb(g)}  (Budget ${kb(VENDOR_REACT_MAX)})`);
  if (g > VENDOR_REACT_MAX) fehler.push(`vendor-react ${kb(g)} > Budget ${kb(VENDOR_REACT_MAX)}.`);
}

// 3) Doppel-React-Schutz: die react-dom-Client-Implementierung darf NUR im
//    vendor-react-Chunk liegen, nie zusätzlich im Entry (sonst zwei React-
//    Instanzen → «Invalid hook call»). Marker sind react-dom-interne Symbole.
if (entry.length === 1) {
  const src = readFileSync(join(DIST, entry[0]), 'utf8');
  if (/listenToAllSupportedEvents|onCommitFiberRoot/.test(src)) {
    fehler.push('react-dom-Implementierung im Entry-Chunk gefunden — Doppel-Instanz-Risiko '
      + '(manualChunks greift nicht; der Entry darf react-dom nur IMPORTIEREN, nicht enthalten).');
  }
}

// 4) DATEN-Nutzlast auf dem kritischen Pfad (Befund Gegenprüfung 20.7.2026).
//    Das Tor prüfte ausschliesslich dist/assets/*.js und fasste public/**/*.json
//    nie an — der grösste Einzelposten von /rechtsprechung lag damit vollständig
//    ausserhalb des Budgets. «check:perf-budget grün» war für den Datenzuwachs
//    des Richter-Fundaments (+118 KB gzip auf register.json) eine leere
//    Zusicherung. register.json lädt zudem NICHT nur auf /rechtsprechung: die
//    Shell zieht es für jeden Inhaltspfad (Breadcrumb-Label), also faktisch auf
//    jeder Gesetzes-Leserseite. Ohne Schranke wächst die Achse mit jedem weiteren
//    Kanton unbemerkt weiter (§15).
const DATEN_BUDGET: readonly (readonly [string, number])[] = [
  ['public/rechtsprechung/register.json', 780 * 1024],
  ['public/rechtsprechung/richter.json', 24 * 1024],
  ['public/rechtsprechung/norm-index.json', 260 * 1024],
];
console.log('check:perf-budget — Daten-Nutzlast (gzip):');
for (const [rel, max] of DATEN_BUDGET) {
  const p = join(process.cwd(), rel);
  if (!existsSync(p)) { fehler.push(`${rel} fehlt — Budget nicht prüfbar.`); continue; }
  const g = gz(p);
  console.log(`  ${rel.replace('public/', '')}  gzip ${kb(g)}  (Budget ${kb(max)})`);
  if (g > max) {
    fehler.push(`${rel} ${kb(g)} > Budget ${kb(max)} — Daten-Nutzlast auf dem kritischen Pfad. `
      + 'Entweder die Projektion verschlanken (Felder/Rollen auslagern) oder das Budget bewusst anheben.');
  }
}

if (fehler.length) {
  console.error('\ncheck:perf-budget ROT:');
  for (const f of fehler) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log('check:perf-budget GRÜN — Bundle-Budget eingehalten, Single-React-Topologie stabil.');
