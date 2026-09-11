// scripts/entstehung/entstehung-projektion-run.ts — Generator der
// Entstehungs-Projektionen (`npm run gen:entstehung-projektion`).
//
// Reine Datei-Arbeit (§3): liest die vorhandenen Artefakte, ruft die Ableitung
// (`./entstehung-projektion.ts`) und schreibt `public/materialien/entstehung/
// <KEY>.json`. KEIN Netz — die Projektion ist eine Sicht auf Bestehendes, kein
// zweiter Abruf (§5).
//
//   npm run gen:entstehung-projektion            # schreibt
//   npm run gen:entstehung-projektion -- --check # nur prüfen (Tor-Modus)
//
// `--check` ist der Determinismus-Wächter dieser Klasse (§11.6 (5)): weicht auch
// nur ein Byte einer ausgelieferten Datei von der Neuberechnung ab, ist entweder
// das Artefakt von Hand geändert oder die Quelle hat sich bewegt, ohne dass der
// Generator lief — beides rot, nie stillschweigend nachgezogen.

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { BOTSCHAFTEN } from '../../src/lib/materialien/botschaften.generated.ts';
import { ANKER_DIR } from '../../src/lib/entstehung/anker.ts';
import {
  baueProjektion, serialisiereProjektion, PROJEKTION_DIR,
  type BotschaftQuelle, type HistorieQuelle, type RevisionsQuelle,
} from './entstehung-projektion.ts';

const HISTORIE_DIR = 'public/normtext/historie';
const REVISIONEN_DIR = 'public/normtext/revisionen';

const pruefe = process.argv.includes('--check');

function lies<T>(pfad: string): T | null {
  if (!existsSync(pfad)) return null;
  try {
    return JSON.parse(readFileSync(pfad, 'utf8')) as T;
  } catch (e) {
    throw new Error(`${pfad} ist kein lesbares JSON: ${(e as Error).message}`, { cause: e });
  }
}

const botschaften = new Map<string, BotschaftQuelle>();
for (const b of BOTSCHAFTEN) {
  if (b.doktyp !== 'botschaft') continue;
  botschaften.set(b.key, {
    key: b.key, titel: b.titel, nummer: b.nummer, quelleUrl: b.quelleUrl,
    stand: b.stand, ereignisse: b.ereignisse,
  });
}

const ankerKeys = new Set<string>(
  existsSync(ANKER_DIR)
    ? readdirSync(ANKER_DIR).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -'.json'.length))
    : [],
);

const dateien = existsSync(HISTORIE_DIR)
  ? readdirSync(HISTORIE_DIR).filter((f) => f.endsWith('.json')).sort()
  : [];

if (dateien.length === 0) {
  console.error(`${HISTORIE_DIR} ist leer — ohne Fassungshistorie gibt es nichts zu projizieren.`);
  process.exit(1);
}

const abweichungen: string[] = [];
const gebaut = new Map<string, string>(); // Dateiname → Inhalt
let mitBotschaft = 0;
let aenderungenGesamt = 0;
let botschaftenGesamt = 0;

for (const datei of dateien) {
  const erlass = decodeURIComponent(datei.slice(0, -'.json'.length));
  const historie = lies<HistorieQuelle>(join(HISTORIE_DIR, datei));
  if (!historie) continue;
  const revisionen = lies<RevisionsQuelle>(join(REVISIONEN_DIR, datei));
  const p = baueProjektion(erlass, historie, revisionen, botschaften, ankerKeys);
  if (!p) continue;
  gebaut.set(datei, serialisiereProjektion(p));
  aenderungenGesamt += Object.keys(p.aenderungen).length;
  botschaftenGesamt += Object.keys(p.botschaften).length;
  mitBotschaft += Object.values(p.aenderungen).filter((a) => a.botschaft).length;
}

if (!existsSync(PROJEKTION_DIR)) {
  if (pruefe) {
    console.error(`${PROJEKTION_DIR} fehlt — «npm run gen:entstehung-projektion» ausführen.`);
    process.exit(1);
  }
  mkdirSync(PROJEKTION_DIR, { recursive: true });
}

const vorhanden = new Set(
  existsSync(PROJEKTION_DIR) ? readdirSync(PROJEKTION_DIR).filter((f) => f.endsWith('.json')) : [],
);

for (const [datei, inhalt] of [...gebaut].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
  const ziel = join(PROJEKTION_DIR, datei);
  const alt = existsSync(ziel) ? readFileSync(ziel, 'utf8') : null;
  vorhanden.delete(datei);
  if (alt === inhalt) continue;
  if (pruefe) {
    abweichungen.push(alt === null
      ? `fehlt: ${ziel}`
      : `weicht ab: ${ziel} (${alt.length} → ${inhalt.length} Zeichen)`);
    continue;
  }
  writeFileSync(ziel, inhalt);
}

// Verwaiste Dateien: ein Erlass, dessen Historie oder Revisionsliste keine
// erfasste Änderung mehr trägt, darf keine alte Projektion zurücklassen — sie
// wäre eine Auskunft ohne Quelle (§8).
for (const datei of [...vorhanden].sort()) {
  if (pruefe) abweichungen.push(`verwaist: ${join(PROJEKTION_DIR, datei)}`);
  else rmSync(join(PROJEKTION_DIR, datei));
}

const bytes = [...gebaut.values()].reduce((s, t) => s + Buffer.byteLength(t), 0);
console.log(
  `Entstehungs-Projektion: ${gebaut.size} Erlasse · ${aenderungenGesamt} Änderungen `
  + `(${mitBotschaft} mit erfasster Botschaft) · ${botschaftenGesamt} Botschafts-Einträge · `
  + `${(bytes / 1024).toFixed(1)} KB gesamt, ø ${(bytes / Math.max(1, gebaut.size) / 1024).toFixed(1)} KB je Erlass`,
);

if (abweichungen.length > 0) {
  console.error('\ncheck: die ausgelieferte Projektion deckt sich NICHT mit der Neuberechnung:');
  for (const z of abweichungen.slice(0, 20)) console.error(`  · ${z}`);
  if (abweichungen.length > 20) console.error(`  … und ${abweichungen.length - 20} weitere`);
  console.error('\n«npm run gen:entstehung-projektion» ausführen und den Diff prüfen (§2/§11.6 (5)).');
  process.exit(1);
}
if (pruefe) console.log('check: alle Projektionen byte-gleich zur Neuberechnung.');
