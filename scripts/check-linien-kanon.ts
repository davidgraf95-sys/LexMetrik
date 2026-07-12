// R1/R4-Nachfolger (W2·5d G1 + U-LINIEN/A8) — «EINE Linien-Sprache» UND das
// AUFBAU-basierte Regelwerk «wann welche Linie» maschinell gegated.
//
// Zwei Beweislasten, beide positiv GRÜN / negativ ROT:
//
//  A) LINIEN-KANON (unverändert seit G1): die strukturellen Normtext-Container
//     (`data-normtext-linie`) nutzen ausschliesslich die drei benannten Linien-
//     Rollen (`border-rule-artikel`/`-struktur`/`border-guide`), kein Ad-hoc
//     `border-line`; die Token-Kette lebt end-to-end (:root + html.dark + tailwind
//     + reale Verwendung im Reader). Chrome-/Brass-Borders sind ausgenommen.
//
//  B) AUFBAU-REGELWERK (neu, A8): der Auto-Default des Gliederungs-Guides folgt dem
//     TATSÄCHLICHEN Aufbau (Struktur-Sidecar: Gliederungstiefe + Artikel-Dichte je
//     Ebene, SSoT src/pages/gesetz-leser/linienAufbau.ts), NICHT der grundart-Schublade.
//     Gegated wird: (1) korpusweite Invarianten über ALLE Sidecars; (2) die
//     Referenz-Verdikte (ZGB/OR zeigen ihren EINEN Guide, ArG/Kurzerlass/Staats-
//     vertrag sichtbar, VMWG flach) — dieselbe `linienProfil`-Funktion, die der
//     Reader nutzt (kein Drift); (3) die Verdrahtung im Reader + CSS (data-guide-auto,
//     guideEbene).
//
//  V2·A28 (Auto-Default-RÜCKZUG, David 12.7.2026): die L-3-Einheit (#207, 11.7.)
//  hatte den Auto-Guide für dichte Erlasse AN geschaltet (inkl. ZGB/OR). David hat
//  das LIVE verworfen — «das mit den linien funktioniert überhaupt nicht» / «also
//  ist überhaupt nicht fördernd für die übersicht». Der Auto-Default wird darum
//  KORPUSWEIT zurückgezogen: autoGuide=false für JEDEN Erlass. Deklarierte Regel-
//  werk-Änderung (Quelle = Davids Verdikt): B1-Invariante auf `!autoGuide` für den
//  ganzen Korpus, B2-Verdikte ZGB/OR/ArG/Kurzerlass/Staatsvertrag von AN auf AUS
//  (SSoT linienAufbau.ts). Das FEATURE bleibt (K11-Tri-State-Schalter); nur das
//  Aufdrängen endet. guideEbene/strukturTiefe bleiben gegated (Nutzer-«an» trifft
//  denselben Ort).
//
// Ein wieder eingeschalteter Auto-Guide, ein toter Guide-Token, ein entferntes
// data-guide-auto oder ein `border-line/70` an einem markierten Element färbt das
// Tor ROT.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { linienProfil, type LinienProfil } from '../src/pages/gesetz-leser/linienAufbau';
import type { StrukturMap } from '../src/lib/normtext/browse';

const wurzel = resolve(import.meta.dirname ?? '.', '..');
const lies = (p: string) => readFileSync(resolve(wurzel, p), 'utf8');
const fehler: string[] = [];

// ─── Teil A · Linien-Kanon (marker-scoped) ───────────────────────────────────
// QS-TOK/P5: parts.tsx ist ein Barrel — die markierten Struktur-Elemente
// (data-normtext-linie) leben in den Geschwister-Dateien unter parts/. Alle
// Marker-Träger müssen gescannt werden, sonst prüft das Tor sie nicht mehr.
const READER = [
  'src/pages/gesetz-leser/parts.tsx',
  'src/pages/gesetz-leser/parts/ArtikelLeser.tsx',
  'src/pages/gesetz-leser/parts/ErlassKopfBlock.tsx',
  'src/pages/gesetz-leser/parts/ErlassLeserKopf.tsx',
  'src/pages/gesetz-leser/parts/SektionKontextKopf.tsx',
  'src/pages/gesetz-leser/parts/SektionKopf.tsx',
  'src/pages/gesetz-leser/parts/SektionBaumTOC.tsx',
  'src/pages/gesetz-leser/inhalt.tsx',
];
const MARKER = 'data-normtext-linie';
const VERBOTEN = /border-line(\/\d+)?\b/;
const KANON = ['border-rule-artikel', 'border-rule-struktur', 'border-guide'];

function oeffnendesTag(src: string, at: number): string {
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
const kanonVerwendet = new Set<string>();
for (const datei of READER) {
  const src = lies(datei);
  let idx = src.indexOf(MARKER);
  while (idx !== -1) {
    markierteGesamt++;
    const tag = oeffnendesTag(src, idx);
    if (VERBOTEN.test(tag)) {
      const zeile = src.slice(0, idx).split('\n').length;
      fehler.push(`${datei}:${zeile} — markiertes Struktur-Element nutzt verbotenes \`border-line\`; erlaubt sind nur ${KANON.join(' / ')}.`);
    }
    for (const k of KANON) if (tag.includes(k)) kanonVerwendet.add(k);
    idx = src.indexOf(MARKER, idx + MARKER.length);
  }
}
if (markierteGesamt === 0) fehler.push(`Kein einziges \`${MARKER}\`-Element gefunden — der Linien-Kanon ist nicht verdrahtet.`);

const reaederQuell = READER.map(lies).join('\n') + '\n' + lies('src/components/normtext/ArtikelBody.tsx');
for (const k of KANON) {
  if (!kanonVerwendet.has(k) && !reaederQuell.includes(k)) {
    fehler.push(`Kanon-Klasse \`${k}\` wird im Normtext-Reader nirgends verwendet (toter Token, §13/F7).`);
  }
}

const css = lies('src/index.css');
const rootBlock = css.slice(css.indexOf(':root'), css.indexOf('html.dark'));
const darkBlock = css.slice(css.indexOf('html.dark'));
for (const v of ['--guide-gliederung', '--rule-artikel', '--rule-struktur']) {
  if (!rootBlock.includes(v)) fehler.push(`CSS-Variable \`${v}\` fehlt im :root (hell).`);
  if (!darkBlock.includes(v)) fehler.push(`CSS-Variable \`${v}\` fehlt in html.dark.`);
}
const tw = lies('tailwind.config.js');
for (const map of ['var(--guide-gliederung)', 'var(--rule-artikel)', 'var(--rule-struktur)']) {
  if (!tw.includes(map)) fehler.push(`tailwind.config.js bildet \`${map}\` nicht ab.`);
}

// ─── Teil B · Aufbau-Regelwerk (A8) ──────────────────────────────────────────

// B0 · Verdrahtung: der Reader muss das aufbau-basierte Regelwerk tatsächlich
// nutzen (guideEbene in renderSektion, data-guide-auto am Root) und das CSS es
// auswerten. Entfernt jemand die Kopplung, ist der Kategorie-Default zurück.
const inhalt = lies('src/pages/gesetz-leser/inhalt.tsx');
if (!/linienProfil\s*\(/.test(inhalt)) fehler.push('inhalt.tsx ruft `linienProfil()` nicht auf — der Aufbau-Default ist abgeklemmt.');
if (!inhalt.includes('linien.guideEbene')) fehler.push('renderSektion nutzt `linien.guideEbene` nicht — der Guide sitzt wieder auf tiefe===1 statt aufbau-basiert.');
if (!inhalt.includes('data-guide-auto')) fehler.push('inhalt.tsx setzt `data-guide-auto` nicht am .lc-leser-Root — der Auto-Default ist nicht verdrahtet.');
if (!css.includes('[data-guide-auto="aus"]')) fehler.push('index.css wertet `[data-guide-auto="aus"]` nicht aus — Erlasse ohne tragende Dichte werden nicht ruhig gestellt.');
// Negativ-Sicherung: der frühere grundart-Kategorie-Default darf NICHT zurückkehren.
if (css.includes(':not([data-grundart="KODIFIKATION"]) [data-normtext-linie]')) {
  fehler.push('index.css enthält noch den grundart-Kategorie-Default (`:not([data-grundart="KODIFIKATION"])`) — U-LINIEN/A8 hat ihn abgelöst.');
}

// B1 · Korpusweite Invarianten über ALLE Struktur-Sidecars.
function ladeSidecars(): Array<{ ebene: string; key: string; profil: LinienProfil }> {
  const rows: Array<{ ebene: string; key: string; profil: LinienProfil }> = [];
  for (const ebene of ['bund', 'kanton']) {
    const dir = resolve(wurzel, `public/normtext/struktur/${ebene}`);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      if (!f.endsWith('.json')) continue;
      let d: { artikel?: StrukturMap };
      try { d = JSON.parse(readFileSync(resolve(dir, f), 'utf8')); } catch { continue; }
      rows.push({ ebene, key: f.slice(0, -5), profil: linienProfil(d.artikel ?? null) });
    }
  }
  return rows;
}
const korpus = ladeSidecars();
if (korpus.length < 500) fehler.push(`Nur ${korpus.length} Struktur-Sidecars gefunden (<500) — Korpus unvollständig, Schwellen-Gegenprobe nicht aussagekräftig.`);

let invariantenVerletzt = 0;
for (const { key, profil: p } of korpus) {
  // V2·A28 (Auto-Default-Rückzug, Davids Live-Verdikt): der Auto-Guide ist KORPUSWEIT
  // aus — autoGuide MUSS für jeden Erlass false sein. guideEbene bleibt strukturell
  // (0/1/null), damit der Nutzer-Override «an» denselben Ort trifft; flache Erlasse
  // (Tiefe 0) haben keine Sektion (guideEbene null).
  const ok =
    (p.guideEbene === null || p.guideEbene === 0 || p.guideEbene === 1) &&
    (p.strukturTiefe !== 0 || p.guideEbene === null) &&
    p.autoGuide === false;
  if (!ok) {
    invariantenVerletzt++;
    if (invariantenVerletzt <= 3) fehler.push(`Invarianten-Bruch bei ${key}: ${JSON.stringify(p)}`);
  }
}
if (invariantenVerletzt > 0) fehler.push(`${invariantenVerletzt} Erlass(e) verletzen die Linien-Aufbau-Invarianten.`);

// B2 · Referenz-Verdikte (positiv+negativ): das Herz von Davids A8-Befund.
type Erwartung = Partial<LinienProfil> & { hinweis: string };
const REFERENZ: Record<string, Erwartung> = {
  ZGB: { strukturTiefe: 5, guideEbene: 1, autoGuide: false, hinweis: 'V2·A28: Auto-Guide korpusweit aus (guideEbene bleibt für Nutzer-«an»)' },
  OR: { strukturTiefe: 4, guideEbene: 1, autoGuide: false, hinweis: 'V2·A28: Auto-Guide korpusweit aus (guideEbene bleibt für Nutzer-«an»)' },
  ARG: { strukturTiefe: 2, guideEbene: 1, autoGuide: false, hinweis: 'V2·A28: kein Auto-Guide; Nutzer-«an» trifft Ebene 1' },
  VMWG: { strukturTiefe: 0, guideEbene: null, autoGuide: false, hinweis: 'flache Artikelliste — kein Guide möglich' },
  BVV3: { guideEbene: 0, autoGuide: false, hinweis: 'V2·A28: Kurzerlass, Auto-Guide aus (guideEbene 0 für Nutzer-«an»)' },
  HKUE: { guideEbene: 0, autoGuide: false, hinweis: 'V2·A28: Staatsvertrag, Auto-Guide aus (guideEbene 0 für Nutzer-«an»)' },
};
for (const [key, erw] of Object.entries(REFERENZ)) {
  const row = korpus.find((r) => r.key === key);
  if (!row) { fehler.push(`Referenzfall ${key} nicht im Korpus gefunden (Sidecar fehlt).`); continue; }
  const p = row.profil;
  for (const feld of ['strukturTiefe', 'guideEbene', 'autoGuide'] as const) {
    if (erw[feld] !== undefined && p[feld] !== erw[feld]) {
      fehler.push(`Referenz ${key} (${erw.hinweis}): ${feld}=${JSON.stringify(p[feld])}, erwartet ${JSON.stringify(erw[feld])}.`);
    }
  }
}

// ─── Verdikt ─────────────────────────────────────────────────────────────────
if (fehler.length > 0) {
  console.error('check:linien-kanon ROT — Linien-Sprache ODER Aufbau-Regelwerk verletzt:\n');
  for (const f of fehler) console.error('  • ' + f);
  process.exit(1);
}
const autoAn = korpus.filter((r) => r.profil.autoGuide).length;
console.log(
  `check:linien-kanon GRÜN — ${markierteGesamt} markierte Container / 3 Rollen-Tokens (hell+dunkel); ` +
  `Aufbau-Regelwerk über ${korpus.length} Sidecars invariant (Auto-Guide korpusweit AUS, V2·A28: ${autoAn}), ` +
  `Referenz-Verdikte ZGB/OR/ArG/Kurzerlass/Staatsvertrag autoGuide=false (guideEbene bleibt für Nutzer-«an») · VMWG flach — bestätigt.`,
);
