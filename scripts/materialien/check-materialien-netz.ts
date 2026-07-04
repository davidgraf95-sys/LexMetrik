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

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ladeZustand, type DokZeile } from './soft-law-zustand.ts';
import { baueKorpusInfo, KANTEN_DIR } from './soft-law-projektion.ts';
import { crawleSeco, SECO_QUELLEN } from './adapter-seco.ts';
import { crawleEdoeb, EDOEB_ID_PREFIX } from './adapter-edoeb.ts';
import { crawleEstvKs, ESTV_KS_ID_PREFIXE } from './adapter-estv-ks.ts';
import { inventarEstvMwst, ladeSeite as ladeMwstSeite, pruefeKurzUrl, kurzUrl, type InventarEintrag } from './adapter-estv-mwst.ts';
import { ESTV_MWST_ID_PREFIX } from './estv-mwst-ids.ts';

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

// ── EDÖB (M3) ────────────────────────────────────────────────────────────────
function istEdoebId(id: string): boolean {
  return id.startsWith(EDOEB_ID_PREFIX);
}

const edoebArbiter: QuelleArbiter = {
  quelle: 'edoeb',
  async pruefe(gelistet) {
    const fehler: string[] = [];
    const heute = new Date().toISOString().slice(0, 10); // nur abgerufen-Etikett des Live-Laufs

    let ergebnis;
    try {
      ergebnis = await crawleEdoeb({ abgerufen: heute });
    } catch (e) {
      // Count-Gate rot ODER Soft-404 / fehlende Sektion ⇒ Drift-Signal (Snapshot neu ziehen).
      return [`EDÖB: Live-Crawl ROT — ${(e as Error).message}`];
    }

    const live = new Map(ergebnis.dokumente.map((d) => [d.id, d.drift_token]));
    const manifestEdoeb = new Map<string, DokZeile>();
    for (const [id, z] of gelistet) if (istEdoebId(id)) manifestEdoeb.set(id, z);

    for (const [id, z] of manifestEdoeb) {
      const lt = live.get(id);
      if (lt === undefined) {
        fehler.push(`EDÖB: Dokument '${id}' im Manifest, aber live nicht mehr auffindbar (entlistet/umbenannt?) — Snapshot neu ziehen.`);
      } else if (lt !== z.drift_token) {
        fehler.push(`EDÖB: drift_token '${id}' abweichend (Manifest ${z.drift_token} ≠ live ${lt}: Titel/Datum/DAM-URL geändert) — Snapshot neu ziehen.`);
      }
    }
    for (const id of live.keys()) {
      if (!manifestEdoeb.has(id)) fehler.push(`EDÖB: neues Dokument '${id}' live, fehlt im Manifest — Snapshot neu ziehen.`);
    }
    return fehler;
  },
};

// ── ESTV-KS (M4) ─────────────────────────────────────────────────────────────
function istEstvKsId(id: string): boolean {
  return ESTV_KS_ID_PREFIXE.some((p) => id.startsWith(p));
}

const estvKsArbiter: QuelleArbiter = {
  quelle: 'estv-ks',
  async pruefe(gelistet) {
    const fehler: string[] = [];
    const heute = new Date().toISOString().slice(0, 10); // nur abgerufen-Etikett des Live-Laufs

    let ergebnis;
    try {
      ergebnis = await crawleEstvKs({ abgerufen: heute });
    } catch (e) {
      // Count-Gate rot ODER Soft-404 / Struktur-Bruch ⇒ Drift-Signal (Snapshot neu ziehen).
      return [`ESTV-KS: Live-Crawl ROT — ${(e as Error).message}`];
    }

    const live = new Map(ergebnis.dokumente.map((d) => [d.id, d.drift_token]));
    const manifestEstv = new Map<string, DokZeile>();
    for (const [id, z] of gelistet) if (istEstvKsId(id)) manifestEstv.set(id, z);

    for (const [id, z] of manifestEstv) {
      const lt = live.get(id);
      if (lt === undefined) {
        fehler.push(`ESTV-KS: Dokument '${id}' im Manifest, aber live nicht mehr auffindbar (entlistet?) — Snapshot neu ziehen.`);
      } else if (lt !== z.drift_token) {
        fehler.push(`ESTV-KS: drift_token '${id}' abweichend (Manifest ${z.drift_token} ≠ live ${lt}: Titel/Datum/DAM-URL geändert) — Snapshot neu ziehen.`);
      }
    }
    for (const id of live.keys()) {
      if (!manifestEstv.has(id)) fehler.push(`ESTV-KS: neues Dokument '${id}' live, fehlt im Manifest — Snapshot neu ziehen.`);
    }
    return fehler;
  },
};

// ── ESTV-MWST (M1) ───────────────────────────────────────────────────────────
// Arbiter §3 Q1: ToC-Hash je Publikation (1 GET/Publikation, robots-höflich) gegen das Manifest;
// Kurz-URL-302-Ziel + Ziffer-Deep-Link-Stichprobe (Publiziert-am gegen den Kanten-stand) als
// Zweitsignal. robots-Freigabe David 4.7.2026 (§8).
function istEstvMwstId(id: string): boolean {
  return id.startsWith(ESTV_MWST_ID_PREFIX);
}

interface MwstShardKante { dok: string; stand: string; fundstellen?: { z: string; url?: string }[] }
interface MwstShard { erlass: string; dokumente?: Record<string, { urlBasis: string }>; kanten?: MwstShardKante[] }

/** Ziffer-Deep-Link-Stichprobe aus den committeten Shards (bis zu `n` distinkte Dokumente). */
export function zifferStichprobe(n: number): { dok: string; url: string; stand: string }[] {
  if (!existsSync(KANTEN_DIR)) return [];
  const basen = new Map<string, string>();
  const proben: { dok: string; url: string; stand: string }[] = [];
  const dateien: string[] = [];
  for (const e of readdirSync(KANTEN_DIR, { withFileTypes: true })) {
    if (e.isFile() && e.name.endsWith('.json')) dateien.push(join(KANTEN_DIR, e.name));
    else if (e.isDirectory()) {
      for (const f of readdirSync(join(KANTEN_DIR, e.name))) {
        if (f.endsWith('.json')) dateien.push(join(KANTEN_DIR, e.name, f));
      }
    }
  }
  dateien.sort();
  for (const p of dateien) {
    const obj = JSON.parse(readFileSync(p, 'utf8')) as MwstShard;
    for (const [id, meta] of Object.entries(obj.dokumente ?? {})) {
      if (istEstvMwstId(id)) basen.set(id, meta.urlBasis);
    }
  }
  const gesehen = new Set<string>();
  for (const p of dateien) {
    const obj = JSON.parse(readFileSync(p, 'utf8')) as MwstShard;
    for (const k of obj.kanten ?? []) {
      if (!istEstvMwstId(k.dok) || gesehen.has(k.dok)) continue;
      const suffix = k.fundstellen?.find((f) => f.url)?.url;
      const basis = basen.get(k.dok);
      if (!suffix || !basis) continue;
      gesehen.add(k.dok);
      proben.push({ dok: k.dok, url: basis + suffix, stand: k.stand });
      if (proben.length >= n) return proben;
    }
  }
  return proben;
}

const estvMwstArbiter: QuelleArbiter = {
  quelle: 'estv-mwst',
  async pruefe(gelistet) {
    const fehler: string[] = [];
    const heute = new Date().toISOString().slice(0, 10); // nur abgerufen-Etikett des Live-Laufs

    const manifestMwst = new Map<string, DokZeile>();
    for (const [id, z] of gelistet) if (istEstvMwstId(id)) manifestMwst.set(id, z);
    if (manifestMwst.size === 0) return []; // Quelle (noch) nicht gesnapshottet → nichts zu prüfen

    let live;
    try {
      live = await inventarEstvMwst({ abgerufen: heute });
    } catch (e) {
      // Count-Gate rot ODER Soft-404 / leerer Baum ⇒ Drift-Signal (Snapshot neu ziehen).
      return [`ESTV-MWST: Live-Inventar ROT — ${(e as Error).message}`];
    }

    for (const [id, z] of manifestMwst) {
      const lt = live.get(id);
      if (lt === undefined) {
        fehler.push(`ESTV-MWST: Dokument '${id}' im Manifest, aber live nicht mehr im Menü — Snapshot neu ziehen.`);
      } else if (lt.drift_token !== z.drift_token) {
        fehler.push(`ESTV-MWST: drift_token '${id}' abweichend (Manifest ${z.drift_token} ≠ live ${lt.drift_token}: ToC/Ziffern-Baum geändert) — Snapshot neu ziehen.`);
      }
    }
    for (const id of live.keys()) {
      if (!manifestMwst.has(id)) fehler.push(`ESTV-MWST: neues Dokument '${id}' live, fehlt im Manifest — Snapshot neu ziehen.`);
    }

    // Zweitsignal 1: Kurz-URL-302-Ziel (erste Publikation je Bereich).
    const proben = new Map<string, InventarEintrag>();
    for (const [id, e] of live) {
      if (![...proben.values()].some((p) => p.bereich.tag === e.bereich.tag)) proben.set(id, e);
      if (proben.size >= 2) break;
    }
    for (const [id, e] of proben) {
      try {
        await pruefeKurzUrl(kurzUrl(e.bereich, e.nummer), e.publicationId);
      } catch (err) {
        fehler.push(`ESTV-MWST: Kurz-URL-Stichprobe '${id}' — ${(err as Error).message}`);
      }
    }

    // Zweitsignal 2 (§0/A11 + A6): Ziffer-Deep-Links aus den committeten Shards — erreichbar
    // (url_effective/Content-Type) UND «Publiziert am» deckt den Kanten-stand.
    for (const probe of zifferStichprobe(3)) {
      try {
        const html = await ladeMwstSeite(probe.url);
        const m = /Publiziert am:[\s\S]{0,300}?(\d{2})\.(\d{2})\.(\d{4})/.exec(html);
        const liveStand = m ? `${m[3]}-${m[2]}-${m[1]}` : null;
        if (liveStand === null) {
          fehler.push(`ESTV-MWST: Ziffer-Stichprobe ${probe.dok} (${probe.url}) ohne «Publiziert am» — Struktur-Drift.`);
        } else if (liveStand !== probe.stand) {
          fehler.push(`ESTV-MWST: Ziffer-Stichprobe ${probe.dok} Publiziert-am ${liveStand} ≠ Kanten-Stand ${probe.stand} (In-place-Änderung) — Snapshot neu ziehen.`);
        }
      } catch (err) {
        fehler.push(`ESTV-MWST: Ziffer-Deep-Link ${probe.dok} tot (${(err as Error).message}) — Snapshot neu ziehen.`);
      }
    }
    return fehler;
  },
};

const ARBITER: QuelleArbiter[] = [secoArbiter, edoebArbiter, estvKsArbiter, estvMwstArbiter];

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
  const nSeco = [...gelistet.keys()].filter(istSecoId).length;
  const nEdoeb = [...gelistet.keys()].filter(istEdoebId).length;
  const nEstv = [...gelistet.keys()].filter(istEstvKsId).length;
  const nMwst = [...gelistet.keys()].filter(istEstvMwstId).length;
  console.log(`check:materialien-netz OK — ${nSeco} SECO- + ${nEdoeb} EDÖB- + ${nEstv} ESTV-KS- + ${nMwst} ESTV-MWST-Dokumente drift-frei gegen die Hub-/Index-/ToC-Seiten.`);
}

main().catch((e) => {
  console.error(`check:materialien-netz ROT: ${(e as Error).message}`);
  process.exit(1);
});
