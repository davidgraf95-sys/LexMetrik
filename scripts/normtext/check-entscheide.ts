// ─── Tor: Integrität des Rechtsprechungs-Korpus (offline) ───────────────────
//
// Pendant zu check-drift.ts (Gesetze), eigener Namespace → berührt die Gesetzes-
// Tore nie. Prüft: Manifest ⊇ Snapshots, Provenienz vollständig (§7), sha
// konsistent, Norm-Index-Refs ⊆ Manifest, ERFASST == Manifest-Keys, Mengen-
// Budget, Anonymisierungs-Heuristik (Warnung). Harte Verstösse → exit 1.

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { sha256EntscheidBloecke } from './sha-entscheide';
import type { EntscheidSnapshotDatei } from '../../src/lib/rechtsprechung/typen';
import type { EntscheidManifest } from '../../src/lib/rechtsprechung/register';
import type { NormEntscheidIndex } from '../../src/lib/rechtsprechung/norm-index';

const ROOT = process.cwd();
const PUB = join(ROOT, 'public', 'rechtsprechung');
const BUDGET_MB = 8;            // P0-Mengen-Budget (empirisch nachziehen, Fahrplan 6.5)
const AHV = /\b756\.\d{4}\.\d{4}\.\d{2}\b/;   // CH-Sozialversicherungsnummer (darf nicht vorkommen)

const fehler: string[] = [];
const warn: string[] = [];

function dirGroesseMB(dir: string): number {
  let total = 0;
  const stack = [dir];
  while (stack.length) {
    const d = stack.pop()!;
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) stack.push(p);
      else total += statSync(p).size;
    }
  }
  return total / (1024 * 1024);
}

function main() {
  if (!existsSync(PUB) || !existsSync(join(PUB, 'register.json'))) {
    console.error('[check:entscheide] public/rechtsprechung/register.json fehlt — Korpus nicht gebaut.');
    process.exit(1);
  }
  const manifest = JSON.parse(readFileSync(join(PUB, 'register.json'), 'utf8')) as EntscheidManifest;
  const keys = new Set(manifest.entscheide.map((e) => e.key));

  for (const e of manifest.entscheide) {
    // Provenienz (§7)
    for (const f of ['datum', 'quelleUrl', 'quelle', 'fassungsToken'] as const) {
      if (!e[f]) fehler.push(`${e.key}: Provenienz-Feld '${f}' fehlt`);
    }
    if (e.kuratierung === 'geprueft') warn.push(`${e.key}: kuratierung 'geprueft' ohne Abnahme? (P0 erwartet 'maschinell')`);
    // Datei + sha + Anonymisierung
    if (!e.datei) { if (e.bestand === 'snapshot') fehler.push(`${e.key}: bestand 'snapshot' ohne datei`); continue; }
    const fp = join(PUB, e.datei);
    if (!existsSync(fp)) { fehler.push(`${e.key}: Datei ${e.datei} fehlt`); continue; }
    const d = JSON.parse(readFileSync(fp, 'utf8')) as EntscheidSnapshotDatei;
    const snap = d.eintraege?.[0];
    if (!snap) { fehler.push(`${e.key}: keine eintraege in ${e.datei}`); continue; }
    const erwartet = sha256EntscheidBloecke(snap.abschnitte);
    if (snap.sha !== erwartet) fehler.push(`${e.key}: sha-Drift (Datei ${snap.sha?.slice(0, 8)} ≠ erwartet ${erwartet.slice(0, 8)})`);
    const volltext = snap.abschnitte.flatMap((a) => a.bloecke.map((b) => b.text)).join('\n');
    if (AHV.test(volltext) || AHV.test(snap.regeste?.text ?? '')) warn.push(`${e.key}: mögliche AHV-Nummer im Text (Anonymisierung prüfen)`);
  }

  // Norm-Index: jede referenzierte key ⊆ Manifest
  if (existsSync(join(PUB, 'norm-index.json'))) {
    const idx = JSON.parse(readFileSync(join(PUB, 'norm-index.json'), 'utf8')) as NormEntscheidIndex;
    for (const [nk, refs] of Object.entries(idx.proNorm)) {
      for (const r of refs) if (!keys.has(r.key)) fehler.push(`norm-index[${nk}]: unbekannter key ${r.key}`);
    }
  }

  // ERFASST == Manifest-Keys
  const genPfad = join(ROOT, 'src', 'lib', 'rechtsprechung', 'erfasste-keys.generated.ts');
  if (existsSync(genPfad)) {
    const gen = readFileSync(genPfad, 'utf8');
    const inSet = new Set([...gen.matchAll(/"([^"]+)"/g)].map((m) => m[1]));
    for (const k of keys) if (!inSet.has(k)) fehler.push(`ERFASST fehlt key ${k}`);
    for (const k of inSet) if (!keys.has(k)) fehler.push(`ERFASST hat verwaisten key ${k}`);
  }

  // Mengen-Budget
  const mb = dirGroesseMB(PUB);
  if (mb > BUDGET_MB) fehler.push(`Mengen-Budget überschritten: ${mb.toFixed(1)} MB > ${BUDGET_MB} MB`);

  for (const w of warn) console.warn(`[check:entscheide] WARN ${w}`);
  if (fehler.length) {
    for (const f of fehler) console.error(`[check:entscheide] FEHLER ${f}`);
    process.exit(1);
  }
  console.log(`[check:entscheide] OK — ${manifest.entscheide.length} Entscheide, ${mb.toFixed(2)} MB, ${warn.length} Warnung(en).`);
}

main();
