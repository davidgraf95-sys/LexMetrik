// scripts/gegenpruefung-ok.ts
//
// Baustein c — Quittier-Helfer `npm run gegenpruefung:ok` (kein Hand-Hashing).
// Berechnet den aktuellen Risiko-Diff-Hash über DIESELBE Kernfunktion wie das
// Tor (eine Quelle der Wahrheit), übernimmt Verdikt + Quelle-Pin + Datum,
// schreibt bibliothek/.gegenpruefung-pending (gitignored) und hängt einen
// Eintrag ans Register bibliothek/register/gegenpruefung-register.md.
//
// Aufruf (vom Skill »gegenpruefung« bei Verdikt bestanden):
//   npm run gegenpruefung:ok -- --verdikt=bestanden \
//     --engine="OR.json" --quelle="fedlex or 20260701" --notiz="15/15 Werte nachgerechnet"
//
// --verdikt  Default «bestanden» (Tor akzeptiert nur «bestanden»).
// --engine   frei, Default = die geänderten Risiko-Dateien.
// --quelle   Quelle-Pin, Form «fedlex <name> <YYYYMMDD>» (für den WARN-Burn-down).
// --notiz    Beleg/Notiz fürs Register.

import { readFileSync, writeFileSync, appendFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { risikoDiffHash } from './gegenpruefung/kern';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PENDING = resolve(ROOT, 'bibliothek/.gegenpruefung-pending');
const REGISTER = resolve(ROOT, 'bibliothek/register/gegenpruefung-register.md');

function arg(name: string): string | undefined {
  const pre = `--${name}=`;
  const treffer = process.argv.find((a) => a.startsWith(pre));
  return treffer?.slice(pre.length);
}

function heute(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Markdown-Tabellenzelle: Pipes/Zeilenumbrüche entschärfen. */
function zelle(s: string): string {
  return s.replace(/\r?\n/g, ' ').replace(/\|/g, '\\|').trim() || '—';
}

const r = risikoDiffHash();
if (!r.kontext) {
  console.error('gegenpruefung:ok: kein Git/HEAD (oder CI) — nichts zu quittieren.');
  process.exit(1);
}
if (r.hash === null) {
  console.error('gegenpruefung:ok: keine Risiko-Datei im Working-Tree geändert — nichts zu quittieren.');
  process.exit(1);
}

const verdikt = arg('verdikt') ?? 'bestanden';
const engine = arg('engine') ?? r.dateien.join(', ');
const quelle = arg('quelle') ?? '';
const notiz = arg('notiz') ?? '';
const datum = heute();

// (1) Pending-Türsteher schreiben (vom Tor gelesen).
const pending = { hash: r.hash, verdikt, quellePin: quelle, datum, dateien: r.dateien };
writeFileSync(PENDING, JSON.stringify(pending, null, 2) + '\n', 'utf8');

// (2) Register-Zeile anhängen (dauerhafter Historien-Vermerk).
if (!existsSync(REGISTER)) {
  console.error(`gegenpruefung:ok: Register fehlt (${REGISTER}).`);
  process.exit(1);
}
const zeile = `| ${datum} | ${zelle(engine)} | ${r.hash} | ${zelle(verdikt)} | ${zelle(quelle)} | ${zelle(notiz)} |\n`;
// Sicherstellen, dass die Tabelle auf einer neuen Zeile beginnt.
const bestand = readFileSync(REGISTER, 'utf8');
appendFileSync(REGISTER, (bestand.endsWith('\n') ? '' : '\n') + zeile, 'utf8');

console.log(
  `gegenpruefung:ok — quittiert: Verdikt «${verdikt}», Hash ${r.hash.slice(0, 12)}…, ${r.dateien.length} Datei(en).`,
);
console.log(`  Pending: ${PENDING}`);
console.log(`  Register-Zeile angehängt (${datum} · ${engine}).`);
if (verdikt !== 'bestanden') {
  console.log('  Hinweis: Das Tor akzeptiert nur Verdikt «bestanden» als grün.');
}
