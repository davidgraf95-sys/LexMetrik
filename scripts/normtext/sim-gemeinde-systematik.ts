/**
 * READ-ONLY-Simulation (kein Schreiben, kein Netz): belegt, dass nach der
 * Neugenerierung der kanton-systematik.json mit dem präfix-bewahrenden
 * Index-Schema alle 162 Basler Gemeinderechts-Erlasse (BaB/BeB/BeE/RiB/RiE) in
 * ihrer KORREKTEN Buchstaben-Wurzel landen statt in einem numerischen Sachgebiet.
 *
 * Vorgehen: aus dem on-disk-Baum (roots + kinder) den Index NEU im Speicher mit
 * systematikSchluessel() aufbauen (genau wie der Generator es täte) und dann
 * sachgruppe() gegen jeden BS-Erlass des register.json laufen lassen.
 *
 *   npx vite-node scripts/normtext/sim-gemeinde-systematik.ts
 */
import { readFileSync } from 'fs';
import {
  sachgruppe, systematikSchluessel,
  type KantonSystematik, type Sachgebiet,
} from '../../src/lib/normtext/systematik.ts';

type RootMitKindern = Sachgebiet & { kinder: Sachgebiet[] };

// 1) Baum aus der vorhandenen JSON lesen (nur roots/kinder — die sind korrekt).
const alle = JSON.parse(
  readFileSync('public/normtext/kanton-systematik.json', 'utf8'),
) as Record<string, { roots: RootMitKindern[]; index: Record<string, [string, string]> }>;
const bsRoots = alle.BS?.roots ?? [];

// 2) Index NEU mit präfix-bewahrendem Schlüssel aufbauen (Generator-Logik).
const indexNeu: Record<string, [string, string]> = {};
for (const r of bsRoots) {
  const kr = systematikSchluessel(r.nummer);
  if (kr) indexNeu[kr] = [r.nummer, ''];
  for (const kind of r.kinder) {
    const kk = systematikSchluessel(kind.nummer);
    if (kk && !(kk in indexNeu)) indexNeu[kk] = [r.nummer, kind.nummer];
  }
}
const sysNeu: KantonSystematik = { roots: bsRoots, index: indexNeu };

// 3) Alle BS-Erlasse aus dem Register holen.
const reg = JSON.parse(readFileSync('public/normtext/register.json', 'utf8')) as {
  erlasse?: Array<{ kanton?: string; sr?: string; titel?: string }>;
};
const bs = (reg.erlasse ?? []).filter((e) => e.kanton === 'BS');
const gemeindePraefixe = ['BaB', 'BeB', 'BeE', 'RiB', 'RiE'];
const istGemeinde = (sr: string) => gemeindePraefixe.some((p) => sr.startsWith(p));
const gemeinde = bs.filter((e) => istGemeinde(e.sr ?? ''));

// 4) Prüfen: jeder Gemeinde-Erlass muss in seiner Buchstaben-Wurzel landen.
let ok = 0;
const falsch: string[] = [];
const proRoot = new Map<string, number>();
for (const e of gemeinde) {
  const sr = e.sr ?? '';
  const erwarteterTop = gemeindePraefixe.find((p) => sr.startsWith(p))!;
  const { top, sub } = sachgruppe(sysNeu, sr);
  proRoot.set(top, (proRoot.get(top) ?? 0) + 1);
  if (top === erwarteterTop) ok++;
  else falsch.push(`${sr} → top=${top} sub=${sub} (erwartet ${erwarteterTop})`);
}

// 5) Gegenprobe: ein paar rein numerische BS-Erlasse bleiben numerisch.
const numerisch = bs.filter((e) => /^\d/.test(e.sr ?? '')).slice(0, 5);
const numProben = numerisch.map((e) => {
  const { top, sub } = sachgruppe(sysNeu, e.sr);
  return `${e.sr} → top=${top} sub=${sub}`;
});

// 6) Kontrast: was DAS ALTE Schema (nurZiffern, kein Namespace) getan hätte.
const indexAlt: Record<string, [string, string]> = {};
for (const r of bsRoots) {
  const d = r.nummer.replace(/\D/g, '');
  if (d) indexAlt[d] = [r.nummer, ''];
  for (const kind of r.kinder) {
    const dk = kind.nummer.replace(/\D/g, '');
    if (dk && !(dk in indexAlt)) indexAlt[dk] = [r.nummer, kind.nummer];
  }
}
const sysAlt: KantonSystematik = { roots: bsRoots, index: indexAlt };
let altFalsch = 0;
for (const e of gemeinde) {
  const sr = e.sr ?? '';
  const erwarteterTop = gemeindePraefixe.find((p) => sr.startsWith(p))!;
  // altes Lookup simulieren: nurZiffern + numerischer Längster-Präfix-Match
  const d = sr.replace(/\D/g, '');
  let top = d ? d[0] : '~';
  for (let l = d.length; l >= 1; l--) {
    const t = sysAlt.index[d.slice(0, l)];
    if (t) { top = t[0]; break; }
  }
  if (top !== erwarteterTop) altFalsch++;
}

console.log('=== Simulation BS-Gemeinderecht-Einsortierung (read-only) ===\n');
console.log(`BS-Erlasse gesamt:           ${bs.length}`);
console.log(`davon Gemeinderecht:         ${gemeinde.length}`);
console.log(`korrekt einsortiert (NEU):   ${ok}/${gemeinde.length}`);
console.log(`Verteilung auf Wurzeln:      ${[...proRoot].sort().map(([k, v]) => `${k}=${v}`).join('  ')}`);
console.log(`Fehleinsortierungen (NEU):   ${falsch.length}`);
for (const f of falsch.slice(0, 20)) console.log('   ✗ ' + f);
console.log(`\nKontrast ALTES Schema (nurZiffern): ${altFalsch}/${gemeinde.length} FALSCH einsortiert`);
console.log('\nGegenprobe rein numerisch (unverändert numerisch):');
for (const p of numProben) console.log('   ✓ ' + p);

if (ok === gemeinde.length && falsch.length === 0) {
  console.log('\nERGEBNIS: alle Gemeinde-Erlasse landen in der korrekten Buchstaben-Wurzel. ✅');
} else {
  console.log('\nERGEBNIS: FEHLER — nicht alle korrekt. ❌');
  process.exitCode = 1;
}
