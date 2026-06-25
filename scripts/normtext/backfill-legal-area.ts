// ─── Backfill: OCL legal_area in die bestehenden Snapshots persistieren (§2/§7) ─
//
// Die Sachgebiet-Klassierung der mehrdeutigen II. öffentlich-rechtlichen BGer-
// Abteilung (2A/2C/2D) fällt ohne eindeutiges Norm-Signal auf das OCL-Feld
// `legal_area` zurück. Dieses war bisher NICHT im Snapshot gespeichert, sondern
// wurde im Re-Map live nachgeladen → die Klassierung war nicht offline
// reproduzierbar. Dieser Backfill holt `legal_area` EINMALIG (keyed OCL-Lookup,
// dieselbe Mechanik wie der Live-Generator) und schreibt es als `legalArea` in
// jeden Snapshot — provenienz-treu (roh, nicht verifiziert). Danach klassiert der
// Re-Map deterministisch aus dem Snapshot, ohne Netz.
//
// Bund (bger): decisionId == `bger_<docketSafe>` (deckungsgleich mit OCL).
// Kanton: der Snapshot-id-Tail ist das Aktenzeichen, nicht die OCL-decision_id →
//   der keyed-Lookup trifft i.d.R. nicht; legalArea bleibt dann ehrlich null
//   (die kantonale Klassierung nutzt legal_area ohnehin nicht im Re-Map).
//
// Netz-resilient über jget (Timeout + Retry); Fehlschlag ⇒ null, kein Raten.
// In-Place-Schreiben (kein rmSync): nur das Feld legalArea kommt hinzu, alle
// übrigen Felder + sha bleiben byte-gleich. legalArea wird kanonisch direkt nach
// `sachgebiet` eingefügt (Idempotenz: ein bestehendes legalArea wird ersetzt).
//
//   vite-node scripts/normtext/backfill-legal-area.ts -- --schreiben [--nur=<id-prefix>]
//
import { readFileSync, readdirSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { jget } from './adapter-entscheide';
import type { EntscheidSnapshot, EntscheidSnapshotDatei } from '../../src/lib/rechtsprechung/typen';

const ROOT = process.cwd();
const PUB = join(ROOT, 'public', 'rechtsprechung');
const API = 'https://mcp.opencaselaw.ch/api';

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

/** decisionId aus dem Snapshot rekonstruieren — identisch zu keyVon (§5). */
function decisionId(snap: EntscheidSnapshot): string {
  const docketSafe = snap.id.split('/').pop()!;
  return `${snap.gericht}_${docketSafe}`;
}

/** OCL legal_area (keyed Lookup; null bei 404/Fehlschlag/leer). */
async function holeLegalArea(id: string): Promise<string | null> {
  const d = await jget<{ decision_id?: string | null; legal_area?: string | null }>(`${API}/decisions/${id}?fields=full`);
  // decision_id null ⇒ Treffer existiert nicht (kantonale Aktenzeichen ≠ OCL-id).
  if (!d || !d.decision_id) return null;
  return d.legal_area ?? null;
}

/** legalArea kanonisch nach `sachgebiet` einsetzen; vorhandenes Feld ersetzen. */
function mitLegalArea(snap: EntscheidSnapshot, legalArea: string | null): EntscheidSnapshot {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(snap)) {
    if (k === 'legalArea') continue;       // altes Feld verwerfen, kanonisch neu setzen
    out[k] = v;
    if (k === 'sachgebiet') out.legalArea = legalArea;
  }
  if (!('legalArea' in out)) out.legalArea = legalArea;   // Defensive (sachgebiet fehlte)
  return out as unknown as EntscheidSnapshot;
}

async function main() {
  const dateien = alleSnapshotDateien(PUB)
    .map((datei) => {
      const wrap = JSON.parse(readFileSync(datei, 'utf8')) as EntscheidSnapshotDatei;
      return { datei, wrap, snap: wrap.eintraege[0] };
    })
    .filter((x) => x.snap && (!nurPrefix || x.snap.id.startsWith(nurPrefix)));

  let bundOk = 0, bundNull = 0, kantOk = 0, kantNull = 0, geschrieben = 0;
  const fehlten: string[] = [];

  // Begrenzte Parallelität (OCL-Latenz sprunghaft; Tor-treu, deterministisch
  // im Ergebnis, da je id genau ein Wert geholt wird).
  const N = 6;
  let idx = 0;
  const verarbeitet = new Array<{ datei: string; wrap: EntscheidSnapshotDatei; snap: EntscheidSnapshot; legalArea: string | null }>(dateien.length);
  await Promise.all(Array.from({ length: Math.min(N, dateien.length) }, async () => {
    while (idx < dateien.length) {
      const my = idx++;
      const { datei, wrap, snap } = dateien[my];
      const legalArea = await holeLegalArea(decisionId(snap));
      verarbeitet[my] = { datei, wrap, snap, legalArea };
      const bund = snap.kanton === 'CH';
      if (legalArea) { if (bund) bundOk++; else kantOk++; }
      else { if (bund) bundNull++; else kantNull++; if (bund) fehlten.push(snap.id); }
      process.stdout.write(legalArea ? '.' : (bund ? 'o' : '·'));
    }
  }));
  process.stdout.write('\n');

  for (const { datei, wrap, snap, legalArea } of verarbeitet) {
    const neu = mitLegalArea(snap, legalArea);
    if (schreiben) {
      const aus: EntscheidSnapshotDatei = { erzeugt: wrap.erzeugt, eintraege: [neu] };
      writeFileSync(datei, JSON.stringify(aus, null, 2) + '\n', 'utf8');
      geschrieben++;
    }
  }

  console.log(`[backfill] ${verarbeitet.length} Snapshots — ${schreiben ? 'SCHREIBEN' : 'DRY-RUN'}`);
  console.log(`[backfill] Bund (bger): legal_area gesetzt ${bundOk}, null ${bundNull}`);
  console.log(`[backfill] Kanton: legal_area gesetzt ${kantOk}, null ${kantNull}`);
  if (fehlten.length) {
    console.log(`[backfill] BGer ohne legal_area (${fehlten.length}):`);
    for (const id of fehlten) console.log(`           ${id}`);
  }
  if (schreiben) console.log(`[backfill] ${geschrieben} Datei(en) neu geschrieben.`);
  else console.log('[backfill] DRY-RUN — nichts geschrieben. Mit --schreiben anwenden.');
}

main().catch((e) => { console.error(e); process.exit(1); });
