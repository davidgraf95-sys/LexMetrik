// scripts/materialien/check-materialien-netz.ts
// E6a Stufe 1 (FAHRPLAN-MATERIALIEN-VERZAHNUNG §4 «check:materialien-netz»): Live-Drift-Arbiter
// der Materialien-Quellen gegen das committete Zustands-Manifest. Verdrahtet in `check:netz` UND
// als eigener Step in normen-monitor.yml (§0/B8, sonst läuft Drift nie automatisch).
//
// Struktur: pro Quelle ein Arbiter (M1 ESTV-MWST / M3 EDÖB / M4 ESTV-KS docken hier an). M2 = SECO.
// Drift ⇒ ROT = «Snapshot neu ziehen» (npm run materialien:snapshot …), NIE Auto-Fix (§7 Build-Regel).
//
// SECO-Arbiter: Menge (id → drift_token/quelle_url) aus beiden Hub-Seiten (live) vs. Manifest.
//   · Count-Gate ≥ 60 je Quelle (im Adapter erzwungen — crawleSeco wirft bei Unterschreitung).
//   · Soft-404 (Content-Type statt HTTP-Status) — ladeHub prüft das.
//   · Drift = neue/verschwundene id ODER drift_token-Abweichung (Datumslabel/URL/Dateiname geändert).

import { ladeZustand, type DokZeile } from './soft-law-zustand.ts';
import { baueKorpusInfo } from './soft-law-projektion.ts';
import { crawleSeco, SECO_QUELLEN } from './adapter-seco.ts';

interface QuelleArbiter {
  quelle: string;
  pruefe(gelistet: Map<string, DokZeile>): Promise<string[]>;
}

// ── SECO (M2) ────────────────────────────────────────────────────────────────
const SECO_PREFIXE = SECO_QUELLEN.map((q) => q.idPrefix);
function istSecoId(id: string): boolean {
  return SECO_PREFIXE.some((p) => id.startsWith(p));
}

const secoArbiter: QuelleArbiter = {
  quelle: 'seco',
  async pruefe(gelistet) {
    const fehler: string[] = [];
    const heute = new Date().toISOString().slice(0, 10); // nur als abgerufen-Etikett des Live-Laufs
    const korpus = baueKorpusInfo();
    const korpusFuer = (erlassKey: string): Iterable<string> => korpus.artikelSet(erlassKey) ?? [];

    let ergebnis;
    try {
      ergebnis = await crawleSeco(korpusFuer, { abgerufen: heute });
    } catch (e) {
      // Count-/Vollständigkeits-Gate rot ODER Soft-404 ⇒ Drift-Signal (Snapshot neu ziehen).
      return [`SECO: Live-Crawl ROT — ${(e as Error).message}`];
    }

    const live = new Map(ergebnis.dokumente.map((d) => [d.id, d.drift_token]));
    const manifestSeco = new Map<string, DokZeile>();
    for (const [id, z] of gelistet) if (istSecoId(id)) manifestSeco.set(id, z);

    for (const [id, z] of manifestSeco) {
      const lt = live.get(id);
      if (lt === undefined) {
        fehler.push(`SECO: Dokument '${id}' im Manifest, aber live nicht mehr auffindbar (entlistet?) — Snapshot neu ziehen.`);
      } else if (lt !== z.drift_token) {
        fehler.push(`SECO: drift_token '${id}' abweichend (Manifest ${z.drift_token} ≠ live ${lt}: Datum/URL/Dateiname geändert) — Snapshot neu ziehen.`);
      }
    }
    for (const id of live.keys()) {
      if (!manifestSeco.has(id)) fehler.push(`SECO: neues Dokument '${id}' live, fehlt im Manifest — Snapshot neu ziehen.`);
    }
    return fehler;
  },
};

const ARBITER: QuelleArbiter[] = [secoArbiter];

async function main(): Promise<void> {
  const zustand = ladeZustand();
  const gelistet = new Map<string, DokZeile>();
  for (const [id, z] of zustand.letzterZustand) if (z.status === 'gelistet') gelistet.set(id, z);

  const fehler: string[] = [];
  for (const a of ARBITER) {
    try {
      fehler.push(...(await a.pruefe(gelistet)));
    } catch (e) {
      fehler.push(`${a.quelle}: Arbiter-Fehler — ${(e as Error).message}`);
    }
  }

  if (fehler.length) {
    for (const f of fehler) console.error(`ROT   materialien-netz: ${f}`);
    console.error(`\ncheck:materialien-netz — ${fehler.length} Drift-Befund(e). Snapshot neu ziehen (nie Auto-Fix).`);
    process.exit(1);
  }
  const n = [...gelistet.keys()].filter(istSecoId).length;
  console.log(`check:materialien-netz OK — ${n} SECO-Dokumente drift-frei gegen die Hub-Seiten.`);
}

main().catch((e) => {
  console.error(`check:materialien-netz ROT: ${(e as Error).message}`);
  process.exit(1);
});
