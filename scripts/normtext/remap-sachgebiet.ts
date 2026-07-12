// ─── C2-Daten-Regen: Sachgebiet des BESTEHENDEN Korpus neu mappen ───────────
//
// Re-Mappt NUR das `sachgebiet` jedes bestehenden Snapshots mit der REPARIERTEN
// reinen Logik (entscheide-mapping.ts: 2A/2C/2D-Disambiguierung via Norm-Signal
// vor Abteilungs-Default) und schreibt den Korpus KONSISTENT über schreibeKorpus
// (Snapshots + register.json + norm-index.json + erfasste-keys; proNorm nur Bund,
// C2-4). Kein Re-Fetch des Korpus, keine Neuauswahl — die 370 Entscheide bleiben
// dieselben; nur die Klassifikation/der Index ziehen die Logik nach.
//
// legal_area-Bedarf (§7-treu): die mehrdeutige II. öff.-rechtl. Abteilung (2A/2C/
// 2D) ohne eindeutiges Norm-Signal fällt in der reparierten Logik auf die OCL-
// legal_area zurück. Diese ist seit dem Backfill (scripts/archiv/backfill-legal-area.ts) als
// `legalArea` IM Snapshot gespeichert → der Re-Map liest sie OFFLINE aus dem Feld
// (kein Live-Fetch mehr). Damit ist die Klassierung deterministisch (§2) und ohne
// Netz reproduzierbar.
//
// HARTE INVARIANTEN (§1): nur `sachgebiet` ändert sich; alle übrigen Felder und
// der Erwägungs-/Inhalts-sha bleiben byte-gleich (sha basiert nur auf Abschnitts-
// text). Anzahl Entscheide vorher==nachher.
//
//   vite-node scripts/normtext/remap-sachgebiet.ts -- --schreiben [--datum=YYYY-MM-DD]
//
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
  istMehrdeutigeOerAbteilung, normSignalSachgebiet, abteilungZuSachgebiet,
  kantonalSachgebiet, legalAreaZuSachgebiet,
} from './entscheide-mapping';
import { schreibeKorpus } from './entscheide-schreiben';
import type { Rechtsgebiet } from '../../src/lib/normtext/register';
import type { EntscheidSnapshot, EntscheidSnapshotDatei } from '../../src/lib/rechtsprechung/typen';

const ROOT = process.cwd();
const PUB = join(ROOT, 'public', 'rechtsprechung');

const args = process.argv.slice(2);
const schreiben = args.includes('--schreiben');
const datumArg = args.find((a) => a.startsWith('--datum='))?.split('=')[1] ?? null;

function alleSnapshotDateien(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...alleSnapshotDateien(p));
    else if (name.endsWith('.json') && name !== 'register.json' && name !== 'norm-index.json') out.push(p);
  }
  return out;
}

/** Reparierte Sachgebiets-Präzedenz — IDENTISCH zu mappeEntscheidOCL (ohne Hint). */
function leiteSachgebiet(
  docket: string, normKeys: string[], legalArea: string | null,
): Rechtsgebiet {
  return (
    (istMehrdeutigeOerAbteilung(docket)
      ? (normSignalSachgebiet(normKeys) ?? legalAreaZuSachgebiet(legalArea))
      : null)
    ?? abteilungZuSachgebiet(docket)
    ?? kantonalSachgebiet(docket)
    ?? legalAreaZuSachgebiet(legalArea)
    ?? 'oeffentlich'
  );
}

function main() {
  const dateien = alleSnapshotDateien(PUB);
  const snaps: EntscheidSnapshot[] = [];
  const wechsel: Array<{ nr: string; gericht: string; kanton: string; alt: Rechtsgebiet; neu: Rechtsgebiet; signal: string }> = [];
  let oerLegalArea = 0;

  for (const datei of dateien) {
    const wrap = JSON.parse(readFileSync(datei, 'utf8')) as EntscheidSnapshotDatei;
    const snap = wrap.eintraege[0];
    if (!snap) continue;

    const docket = snap.nummer;
    const normKeys = snap.normKeys ?? [];
    const ambig = snap.kanton === 'CH' && istMehrdeutigeOerAbteilung(docket);

    // C2-1 berührt AUSSCHLIESSLICH die mehrdeutige II. öff.-rechtl. Abteilung
    // (2A/2C/2D, Bund). Für alle übrigen Entscheide ist die deployte Logik
    // unverändert → der gespeicherte sachgebiet wurde von IDENTISCHER Logik
    // erzeugt und wird unangetastet übernommen (kein Re-Derive ohne legal_area,
    // das sonst spurious Wechsel erzeugte). So bleibt die Regen minimal & treu.
    let neu: Rechtsgebiet = snap.sachgebiet;
    let quelleSignal = 'unveraendert';

    if (ambig) {
      const signal = normSignalSachgebiet(normKeys);
      // legal_area kommt OFFLINE aus dem persistierten Snapshot-Feld (Backfill);
      // kein Live-Fetch → deterministisch (§2). null, wenn OCL keine lieferte.
      const legalArea = snap.legalArea ?? null;
      if (signal) {
        quelleSignal = 'norm-signal';
      } else {
        oerLegalArea++;
        quelleSignal = legalAreaZuSachgebiet(legalArea) ? `legal_area=${legalArea}` : 'abteilung-default(sozial-abgaben)';
      }
      neu = leiteSachgebiet(docket, normKeys, legalArea);
    }

    if (neu !== snap.sachgebiet) {
      wechsel.push({ nr: docket, gericht: snap.gericht, kanton: snap.kanton, alt: snap.sachgebiet, neu, signal: quelleSignal });
    }
    snaps.push({ ...snap, sachgebiet: neu });
  }

  // Determinismus (§2): Schreib-Reihenfolge nach id stabilisieren.
  snaps.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  const datum = datumArg
    ?? (JSON.parse(readFileSync(join(PUB, 'register.json'), 'utf8')).erzeugt as string)
    ?? new Date().toISOString().slice(0, 10);

  console.log(`[remap] ${snaps.length} Snapshots geprüft — ${schreiben ? 'SCHREIBEN' : 'DRY-RUN'}`);
  console.log(`[remap] OeR-legal_area aus Snapshot (offline): ${oerLegalArea}`);
  console.log(`[remap] Sachgebiet-Wechsel: ${wechsel.length}`);
  const proGeb: Record<string, number> = {};
  for (const w of wechsel) { const k = `${w.alt} → ${w.neu}`; proGeb[k] = (proGeb[k] ?? 0) + 1; }
  for (const [k, n] of Object.entries(proGeb).sort()) console.log(`         ${k}: ${n}`);
  console.log('[remap] Beispiele:');
  for (const w of wechsel.slice(0, 40)) console.log(`         ${w.kanton}/${w.gericht} ${w.nr}: ${w.alt} → ${w.neu}  [${w.signal}]`);

  if (schreiben) {
    const res = schreibeKorpus(snaps, datum, ROOT);
    console.log(`[remap] geschrieben: ${res.anzahl} Entscheide, ${res.normBuckets} Norm-Buckets.`);
  } else {
    console.log('[remap] DRY-RUN — nichts geschrieben. Mit --schreiben anwenden.');
  }
}

try { main(); } catch (e) { console.error(e); process.exit(1); }
