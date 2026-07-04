// R1 (W2·5d G1) — «EINE Linien-Sprache» maschinell gegated.
// DESIGN-REGLEMENT-NORMTEXT §Linien-Kanon: die STRUKTURELLEN Normtext-Container
// (Artikel-Trenner, Sektions-Struktur-Trenner, vertikaler Gliederungs-Guide),
// markiert per `data-normtext-linie`, dürfen ausschliesslich die drei benannten
// Linien-Rollen nutzen (`border-rule-artikel`, `border-rule-struktur`,
// `border-guide`) — KEIN Ad-hoc `border-line`/`border-line/<opazität>`.
//
// MARKER-SCOPED (Kritik K7): geprüft werden NUR die markierten strukturellen
// Container. Chrome-Borders (Such-Boxen, Buttons, Drawer, Nav, Fussnoten-Popover,
// Tabellen-AUSSENbox) und die Brass-Sprache sind ausdrücklich AUSGENOMMEN — sie
// tragen keinen Marker und werden nicht angefasst.
//
// Zusätzlich wird die Token-Kette end-to-end belegt (kein toter Token, §13/F7):
// die drei CSS-Variablen existieren in :root UND html.dark, tailwind.config.js
// bildet sie ab, und jede der drei Kanon-Klassen wird im Reader real verwendet.
//
// Positiv grün / negativ rot beweisbar: ein `border-line/70` an einem markierten
// Element ODER eine entfernte Kanon-Klasse färbt das Tor ROT.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const wurzel = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const lies = (p) => readFileSync(resolve(wurzel, p), 'utf8');

const READER = [
  'src/pages/gesetz-leser/parts.tsx',
  'src/pages/gesetz-leser/inhalt.tsx',
];
const MARKER = 'data-normtext-linie';
const VERBOTEN = /border-line(\/\d+)?\b/;
const KANON = ['border-rule-artikel', 'border-rule-struktur', 'border-guide'];

const fehler = [];

// Öffnendes JSX-Tag um eine Marker-Position extrahieren (Brace-Tiefe-Scan:
// Template-Literale `${…}` im className sind balanciert, classNames tragen kein
// nacktes «>» → der erste «>» bei Tiefe 0 schliesst das öffnende Tag).
function oeffnendesTag(src, at) {
  const start = src.lastIndexOf('<', at);
  let tiefe = 0;
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (c === '{') tiefe++;
    else if (c === '}') tiefe--;
    else if (c === '>' && tiefe === 0) return src.slice(start, i + 1);
  }
  return src.slice(start);
}

let markierteGesamt = 0;
const kanonVerwendet = new Set();

for (const datei of READER) {
  const src = lies(datei);
  let idx = src.indexOf(MARKER);
  while (idx !== -1) {
    markierteGesamt++;
    const tag = oeffnendesTag(src, idx);
    if (VERBOTEN.test(tag)) {
      const zeile = src.slice(0, idx).split('\n').length;
      fehler.push(`${datei}:${zeile} — markiertes Struktur-Element nutzt verbotenes \`border-line\`; erlaubt sind nur ${KANON.join(' / ')}.\n    ${tag.replace(/\s+/g, ' ').slice(0, 160)}`);
    }
    for (const k of KANON) if (tag.includes(k)) kanonVerwendet.add(k);
    idx = src.indexOf(MARKER, idx + MARKER.length);
  }
}

if (markierteGesamt === 0) {
  fehler.push(`Kein einziges \`${MARKER}\`-Element gefunden — der Linien-Kanon ist nicht verdrahtet.`);
}

// Kanon-Klassen müssen im Reader tatsächlich verwendet werden (Kette lebt).
// `border-rule-struktur` sitzt in einer `regel`-Konstante ausserhalb des Tags →
// zusätzlich Datei-weit im Reader-Quelltext belegen.
const reaederQuell = READER.map(lies).join('\n') + '\n' + lies('src/components/normtext/ArtikelBody.tsx');
for (const k of KANON) {
  if (!kanonVerwendet.has(k) && !reaederQuell.includes(k)) {
    fehler.push(`Kanon-Klasse \`${k}\` wird im Normtext-Reader nirgends verwendet (toter Token, §13/F7).`);
  }
}

// Token-Kette: CSS-Variablen (hell + dunkel) + Tailwind-Mapping.
const css = lies('src/index.css');
const rootBlock = css.slice(css.indexOf(':root'), css.indexOf('html.dark'));
const darkBlock = css.slice(css.indexOf('html.dark'));
const VARS = ['--guide-gliederung', '--rule-artikel', '--rule-struktur'];
for (const v of VARS) {
  if (!rootBlock.includes(v)) fehler.push(`CSS-Variable \`${v}\` fehlt im :root (hell).`);
  if (!darkBlock.includes(v)) fehler.push(`CSS-Variable \`${v}\` fehlt in html.dark.`);
}
const tw = lies('tailwind.config.js');
for (const map of ['var(--guide-gliederung)', 'var(--rule-artikel)', 'var(--rule-struktur)']) {
  if (!tw.includes(map)) fehler.push(`tailwind.config.js bildet \`${map}\` nicht ab.`);
}

if (fehler.length > 0) {
  console.error('check:linien-kanon ROT — der Normtext-Reader verletzt die EINE Linien-Sprache:\n');
  for (const f of fehler) console.error('  • ' + f);
  console.error(`\n${fehler.length} Verstoss/Verstösse. Fix: nur ${KANON.join(' / ')} an \`${MARKER}\`-Containern; Chrome-Borders bleiben \`border-line\`.`);
  process.exit(1);
}

console.log(`check:linien-kanon GRÜN — ${markierteGesamt} markierte Struktur-Container, 3 Rollen-Tokens verdrahtet (hell+dunkel), keine Ad-hoc-Opazität.`);
