// ─── Bestands-Strukturierung des Sachverhalts (sicher, §1) ────────────────────
//
// Wendet teileSachverhalt (sachverhalt.ts, SSoT) auf den bestehenden Sachverhalt-
// Monolithen jedes Snapshots an → Buchstaben-Abschnitte (A.a/A.b …) + entferntes
// Seiten-Rauschen. Berührt NUR den Sachverhalt-Abschnitt; Erwägungen/Dispositiv/
// Rubrum/Regeste/Provenienz bleiben unangetastet. sha wird neu berechnet (der
// Sachverhalt ist Teil der Block-Folge), register.json/norm-index.json hängen
// nicht am sha → unverändert.
//
// HARTES TOR (§1): Wort-Invariante modulo Rauschen — die Rekonstruktion aus
// Markern+Text muss zeichengleich dem entrauschten Original sein, sonst wird der
// Entscheid übersprungen (kein stiller Textverlust).
//
// Flags:  --schreiben (sonst dry-run)  ·  --nur=<id-prefix>
//   vite-node scripts/normtext/sachverhalt-strukturieren.ts -- [--schreiben] [--nur=bund/bge]
//
import { readFileSync, readdirSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { teileSachverhalt, entrauscheSachverhalt } from '../../src/lib/rechtsprechung/sachverhalt';
import { sha256EntscheidBloecke } from './sha-entscheide';
import type { EntscheidBlock, EntscheidSnapshot, EntscheidSnapshotDatei } from '../../src/lib/rechtsprechung/typen';

const PUB = join(process.cwd(), 'public', 'rechtsprechung');
const args = process.argv.slice(2);
const schreiben = args.includes('--schreiben');
const nurPrefix = args.find((a) => a.startsWith('--nur='))?.split('=')[1] ?? null;

function alleSnapshotDateien(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...alleSnapshotDateien(p));
    else if (name.endsWith('.json') && name !== 'register.json' && name !== 'norm-index.json') out.push(p);
  }
  return out;
}

const W = (s: string) => s.replace(/\s+/g, ' ').trim();
/** Rekonstruktion aus Block-Folge (Marker + Text) — Basis der Invariante. */
function rekonstruiere(bloecke: EntscheidBlock[]): string {
  return W(bloecke.map((b) => (b.marke ? `${b.marke} ` : '') + b.text).join(' '));
}

let geprueft = 0, gesplittet = 0, geschrieben = 0, uebersprungen = 0;

for (const datei of alleSnapshotDateien(PUB)) {
  const wrap = JSON.parse(readFileSync(datei, 'utf8')) as EntscheidSnapshotDatei;
  const snap = wrap.eintraege[0] as EntscheidSnapshot | undefined;
  if (!snap) continue;
  if (nurPrefix && !snap.id.startsWith(nurPrefix)) continue;
  geprueft++;

  const sv = snap.abschnitte.find((a) => a.typ === 'sachverhalt');
  if (!sv) continue;
  const altText = sv.bloecke.map((b) => b.text).join(' ');
  const neuBloecke = teileSachverhalt(altText);

  // Tor: Wort-Invariante modulo Rauschen.
  if (rekonstruiere(neuBloecke) !== W(entrauscheSachverhalt(altText))) {
    uebersprungen++;
    console.warn(`[sv] WORTDRIFT übersprungen: ${snap.id}`);
    continue;
  }
  // Nur schreiben, wenn sich tatsächlich eine Gliederung ergab oder das Rauschen wegfiel.
  const altMarken = sv.bloecke.filter((b) => b.marke).length;
  const neuMarken = neuBloecke.filter((b) => b.marke).length;
  const altRoh = sv.bloecke.map((b) => b.text).join('');
  const neuRoh = neuBloecke.map((b) => b.text).join('');
  if (neuMarken === altMarken && altRoh === neuRoh) continue;
  if (neuMarken > 0) gesplittet++;

  const abschnitte = snap.abschnitte.map((a) => (a.typ === 'sachverhalt' ? { ...a, bloecke: neuBloecke } : a));
  const neuSnap: EntscheidSnapshot = { ...snap, abschnitte, sha: sha256EntscheidBloecke(abschnitte) };
  if (schreiben) {
    writeFileSync(datei, JSON.stringify({ erzeugt: wrap.erzeugt, eintraege: [neuSnap] } satisfies EntscheidSnapshotDatei, null, 2) + '\n', 'utf8');
    geschrieben++;
  }
}

console.log(`[sv] ${geprueft} Snapshots geprüft${nurPrefix ? ` (nur=${nurPrefix})` : ''} — ${schreiben ? 'SCHREIBEN' : 'DRY-RUN'}`);
console.log(`[sv] in Buchstaben-Abschnitte gegliedert: ${gesplittet} · veränderte Snapshots: ${geschrieben || '(dry)'} · Wortdrift-übersprungen: ${uebersprungen}`);
if (!schreiben) console.log('[sv] DRY-RUN — nichts geschrieben. Mit --schreiben anwenden.');
