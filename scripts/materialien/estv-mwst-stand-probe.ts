// scripts/materialien/estv-mwst-stand-probe.ts
// Stand-Probe je ESTV-MWST-Dokument für check:materialien-netz (§17-Wurzel-Fix 1.9.2026,
// QS-MONITOR-ROT, Spec FAHRPLAN-OFFENE-BEFUNDE §2: «Detektor zusätzlich auf stand-Wechsel»).
//
// WARUM: Der Drift-Token hängt an den cipherDisplay-Ankern des ToC (adapter-estv-mwst.ts,
// tocDriftToken). Das ToC trägt live KEINE Publikationsdaten (Sonde 1.9.2026, 0 Treffer) —
// eine In-place-Änderung einer Ziffer, die ihr «Publiziert am» hebt, ohne dass ein
// componentId oder Label wechselt, ist für den Token unsichtbar. Bis 31.8.2026 deckte das
// eine Stichprobe von DREI Dokumenten (zifferStichprobe(3)); für die übrigen ~45 wurde der
// Stand nie gegen die Quelle gehalten. Jetzt: JE Dokument genau eine Probe — die Ziffer, die
// den Dokument-Stand (jüngstes «Publiziert am») trägt. Kosten: ~48 GETs, sequentiell mit
// Delay (Netz-Disziplin ~1 req/s, robots-Freigabe David 4.7.2026).
//
// Rein: keine I/O in den Planungs-/Prüffunktionen; das Lesen der Shards liegt separat.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export interface MwstShardKante { dok: string; stand: string; fundstellen?: { z: string; url?: string }[] }
export interface MwstShard {
  erlass: string;
  dokumente?: Record<string, { urlBasis: string; stand?: string }>;
  kanten?: MwstShardKante[];
}

export interface StandProbe {
  dok: string;
  /** Volle Ziffer-URL (urlBasis + `&componentId=…`). */
  url: string;
  /** Erwartetes «Publiziert am» (ISO) dieser Ziffer laut committetem Shard. */
  stand: string;
  /** true, wenn diese Ziffer den Dokument-Stand trägt (jüngste belegte Ziffer). */
  traegtDokStand: boolean;
}

/**
 * Plant je ESTV-MWST-Dokument (nach `istZielId`) genau EINE Probe: die erste Kante, deren
 * Stand dem Dokument-Stand entspricht; fehlt eine solche (Dokument-Stand stammt von einer
 * Ziffer ohne Fedlex-Anker), die Kante mit dem jüngsten Stand. Dokumente ohne belegte
 * Kante oder ohne urlBasis bekommen keine Probe (kein Fehl-Alarm, kein Blindflug: Anzahl
 * wird vom Aufrufer geloggt). Deterministisch: Shards in der übergebenen Reihenfolge,
 * Kanten in Dateireihenfolge, Ergebnis nach Dokument-ID sortiert.
 */
export function planeStandProben(shards: MwstShard[], istZielId: (id: string) => boolean): StandProbe[] {
  const basen = new Map<string, { urlBasis: string; stand?: string }>();
  for (const s of shards) {
    for (const [id, meta] of Object.entries(s.dokumente ?? {})) {
      if (istZielId(id) && !basen.has(id)) basen.set(id, meta);
    }
  }
  const beste = new Map<string, StandProbe>();
  for (const s of shards) {
    for (const k of s.kanten ?? []) {
      if (!istZielId(k.dok)) continue;
      const basis = basen.get(k.dok);
      const suffix = k.fundstellen?.find((f) => f.url)?.url;
      if (!basis || !suffix) continue;
      const traegt = basis.stand !== undefined && k.stand === basis.stand;
      const bisher = beste.get(k.dok);
      if (bisher === undefined || (!bisher.traegtDokStand && (traegt || k.stand > bisher.stand))) {
        beste.set(k.dok, { dok: k.dok, url: basis.urlBasis + suffix, stand: k.stand, traegtDokStand: traegt });
      }
    }
  }
  return [...beste.values()].sort((a, b) => (a.dok < b.dok ? -1 : a.dok > b.dok ? 1 : 0));
}

/** «Publiziert am: DD.MM.YYYY» einer Ziffer-Seite als ISO oder null (dieselbe Regex wie der Adapter). */
export function publiziertAm(html: string): string | null {
  const m = /Publiziert am:[\s\S]{0,300}?(\d{2})\.(\d{2})\.(\d{4})/.exec(html);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
}

/** Fehlertext, wenn der Live-Stand der Probe vom committeten abweicht oder fehlt; sonst null. Rein. */
export function pruefeStandProbe(probe: StandProbe, html: string): string | null {
  const live = publiziertAm(html);
  if (live === null) {
    return `ESTV-MWST: Stand-Probe ${probe.dok} (${probe.url}) ohne «Publiziert am» — Struktur-Drift.`;
  }
  if (live !== probe.stand) {
    return `ESTV-MWST: Stand-Probe ${probe.dok} Publiziert-am ${live} ≠ committeter Stand ${probe.stand}` +
      `${probe.traegtDokStand ? ' (Dokument-Stand)' : ''} — In-place-Änderung ohne ToC-Wechsel; Snapshot neu ziehen.`;
  }
  return null;
}

/** Liest alle Kanten-Shards (flach + ein Verzeichnis tief) deterministisch sortiert. */
export function leseShards(kantenDir: string): MwstShard[] {
  if (!existsSync(kantenDir)) return [];
  const dateien: string[] = [];
  for (const e of readdirSync(kantenDir, { withFileTypes: true })) {
    if (e.isFile() && e.name.endsWith('.json')) dateien.push(join(kantenDir, e.name));
    else if (e.isDirectory()) {
      for (const f of readdirSync(join(kantenDir, e.name))) {
        if (f.endsWith('.json')) dateien.push(join(kantenDir, e.name, f));
      }
    }
  }
  dateien.sort();
  return dateien.map((p) => JSON.parse(readFileSync(p, 'utf8')) as MwstShard);
}
