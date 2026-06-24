// ─── Bestands-Reinigung: implausible Rubrum-Felder nullen (§1/§8) ─────────────
//
// Der frühere best-effort-Extraktor hat vereinzelt Erwägungs-/Satzmitten-Fragmente
// als Gegenstand/Parteien/Vorinstanz/Besetzung gespeichert (Falsch-Positive). Diese
// Reinigung wendet DENSELBEN reinen Test wie Anzeige + Live-Import (rubrumFeldPlausibel,
// §5) auf die bestehenden Snapshots an und setzt erkennbar fragmentarische Felder auf
// null — fail-safe: der Reader fällt dann auf die ehrliche Thema-Leitzeile zurück.
//
// Berührt NUR `rubrum` (nicht abschnitte/sha/Provenienz) → Wort-Invariante trivial
// gewahrt, register.json/norm-index.json hängen nicht am Rubrum.
//
// Flags:  --schreiben (sonst dry-run)  ·  --nur=<id-prefix>
//   vite-node scripts/normtext/rubrum-bereinigen.ts -- [--schreiben] [--nur=bund/bge]
//
import { readFileSync, readdirSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { rubrumFeldPlausibel, type RubrumFeld } from '../../src/lib/rechtsprechung/rubrum';
import type { EntscheidSnapshot, EntscheidSnapshotDatei } from '../../src/lib/rechtsprechung/typen';

const PUB = join(process.cwd(), 'public', 'rechtsprechung');
const args = process.argv.slice(2);
const schreiben = args.includes('--schreiben');
const nurPrefix = args.find((a) => a.startsWith('--nur='))?.split('=')[1] ?? null;
const FELDER: RubrumFeld[] = ['gegenstand', 'parteien', 'vorinstanz', 'besetzung'];

function alleSnapshotDateien(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...alleSnapshotDateien(p));
    else if (name.endsWith('.json') && name !== 'register.json' && name !== 'norm-index.json') out.push(p);
  }
  return out;
}

let geprueft = 0, geschrieben = 0;
const entfernt: { id: string; feld: RubrumFeld; wert: string }[] = [];

for (const datei of alleSnapshotDateien(PUB)) {
  const wrap = JSON.parse(readFileSync(datei, 'utf8')) as EntscheidSnapshotDatei;
  const snap = wrap.eintraege[0] as EntscheidSnapshot | undefined;
  if (!snap) continue;
  if (nurPrefix && !snap.id.startsWith(nurPrefix)) continue;
  geprueft++;
  if (!snap.rubrum) continue;

  const neuRubrum = { ...snap.rubrum };
  let veraendert = false;
  for (const feld of FELDER) {
    const wert = neuRubrum[feld];
    if (wert && !rubrumFeldPlausibel(feld, wert)) {
      entfernt.push({ id: snap.id, feld, wert: wert.slice(0, 90) });
      neuRubrum[feld] = null;
      veraendert = true;
    }
  }
  if (!veraendert) continue;

  // Rubrum ganz auf null, wenn nun alle Felder leer (konsistent mit Extraktor).
  const leer = FELDER.every((f) => !neuRubrum[f]);
  const neuSnap: EntscheidSnapshot = { ...snap, rubrum: leer ? null : neuRubrum };
  if (schreiben) {
    const out: EntscheidSnapshotDatei = { erzeugt: wrap.erzeugt, eintraege: [neuSnap] };
    writeFileSync(datei, JSON.stringify(out, null, 2) + '\n', 'utf8');
    geschrieben++;
  }
}

console.log(`[rubrum-rein] ${geprueft} Snapshots geprüft${nurPrefix ? ` (nur=${nurPrefix})` : ''} — ${schreiben ? 'SCHREIBEN' : 'DRY-RUN'}`);
console.log(`[rubrum-rein] verworfene Felder: ${entfernt.length}`);
for (const e of entfernt) console.log(`  ${e.id.padEnd(26)} ${e.feld.padEnd(11)} « ${e.wert} …`);
if (schreiben) console.log(`[rubrum-rein] ${geschrieben} Datei(en) neu geschrieben.`);
else console.log('[rubrum-rein] DRY-RUN — nichts geschrieben. Mit --schreiben anwenden.');
