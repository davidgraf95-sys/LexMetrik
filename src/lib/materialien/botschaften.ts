// ─── Lese-Brücke «Entstehungsgeschichte» (Botschaften des Bundesrates) ──────────
//
// Paket 2 (W2·6): projiziert die generierten Botschaften aus der lazy geladenen
// register.json (Browse-Manifest) auf eine Norm. Reine Ladeschicht (§3) — kein
// Inhalt erzeugt, keine Rechtslogik. Die Botschaften liegen NICHT im App-Bundle
// (§15): sie kommen aus derselben register.json, die das Kontext-Panel ohnehin
// lädt (ladeMaterialManifest, gecachte Promise) — deshalb kein zweiter Fetch.
//
// Finding 11 (Payload/§15): botschaftenFuerNorm iteriert die volle Liste NICHT je
// Aufruf, sondern baut EINMAL einen erlassKey→Botschaften-Index (memoisiert auf die
// Manifest-Referenz). §5: keine zweite Wahrheit — der Index ist eine In-Memory-
// Projektion des Manifests, keine committete Parallel-Datei.

import { ladeMaterialManifest } from './browse';
import type { BrowseMaterial, MaterialManifest } from './typen';

/** Anzeige-Form einer Botschaft (Entstehungsgeschichte-Eintrag). */
export interface BotschaftBezug {
  key: string;
  /** Amtlicher Titel je Sprache (DE Pflicht, FR/IT wo vorhanden). */
  titel: string;
  titelFr?: string;
  titelIt?: string;
  /** Curia-/Geschäftsnummer «17.059» (null, wenn keine — Pa.Iv./Alt-Erlass). */
  nummer: string | null;
  /** Fedlex-Live-Link (amtliche Quelle, §7c). */
  quelleUrl: string;
  /** Botschafts-Datum ISO (= stand). */
  stand: string;
  /** Deep-Link parlament.ch (Curia Vista) — null, wenn keine Curia-Nr. */
  parlamentUrl: string | null;
}

// Index memoisiert auf die Manifest-Referenz (eine Manifest-Instanz je Session).
let indexCache: { manifest: MaterialManifest; index: Map<string, BotschaftBezug[]> } | null = null;

/** Curia «17.059» / «1999.093» → parlament.ch-AffairId (8-stellig: 4-Jahr + 4-Nummer). */
export function parlamentUrlAusCuria(nummer: string): string | null {
  const m = /^(\d{2}|\d{4})\.(\d{1,4})$/.exec(nummer.trim());
  if (!m) return null;
  let jahr = m[1];
  if (jahr.length === 2) jahr = (Number(jahr) <= 30 ? '20' : '19') + jahr; // «17»→2017, «99»→1999
  const affairId = `${jahr}${m[2].padStart(4, '0')}`;
  return `https://www.parlament.ch/de/ratsbetrieb/suche-curia-vista/geschaeft?AffairId=${affairId}`;
}

function browseNachBotschaft(m: BrowseMaterial): BotschaftBezug {
  return {
    key: m.key,
    titel: m.titel,
    titelFr: m.titelFr,
    titelIt: m.titelIt,
    nummer: m.nummer,
    quelleUrl: m.quelleUrl,
    stand: m.stand,
    parlamentUrl: m.nummer ? parlamentUrlAusCuria(m.nummer) : null,
  };
}

/** Baut (einmal je Manifest) den erlassKey→Botschaften-Index; Botschaften Datum absteigend. */
function baueIndex(manifest: MaterialManifest): Map<string, BotschaftBezug[]> {
  const index = new Map<string, BotschaftBezug[]>();
  for (const m of manifest.materialien) {
    if (m.doktyp !== 'botschaft') continue;
    const bezug = browseNachBotschaft(m);
    for (const nk of m.normKeys) {
      const liste = index.get(nk) ?? [];
      liste.push(bezug);
      index.set(nk, liste);
    }
  }
  // Innerhalb eines Erlasses: Datum absteigend → key (deterministisch, jüngste zuerst).
  for (const liste of index.values()) {
    liste.sort((a, b) => (a.stand < b.stand ? 1 : a.stand > b.stand ? -1 : (a.key < b.key ? -1 : a.key > b.key ? 1 : 0)));
  }
  return index;
}

/**
 * Botschaften zu EINEM Erlass-Key (lazy). Leeres Array = keine Verknüpfung im Graphen
 * (z. B. Verordnung ohne Botschaft, Pa.Iv.-Ursprung, Pre-2000, frischer Erlass) — die
 * Ursache differenziert das UI (§8). `null` = Manifest-Ladefehler (Fetch-Fehler ≠ leer).
 */
export async function botschaftenFuerNorm(normKey: string): Promise<BotschaftBezug[] | null> {
  const manifest = await ladeMaterialManifest();
  if (!manifest) return null;
  if (!indexCache || indexCache.manifest !== manifest) {
    indexCache = { manifest, index: baueIndex(manifest) };
  }
  return indexCache.index.get(normKey) ?? [];
}

/**
 * Botschaften über mehrere normKeys vereinigt + dedupliziert (Datum absteigend). `null`
 * nur, wenn das Manifest gar nicht geladen werden konnte (Fetch-Fehler, §8).
 */
export async function botschaftenFuer(normKeys: readonly string[]): Promise<BotschaftBezug[] | null> {
  const manifest = await ladeMaterialManifest();
  if (!manifest) return null;
  if (!indexCache || indexCache.manifest !== manifest) {
    indexCache = { manifest, index: baueIndex(manifest) };
  }
  const seen = new Set<string>();
  const out: BotschaftBezug[] = [];
  for (const k of normKeys) {
    for (const b of indexCache.index.get(k) ?? []) {
      if (!seen.has(b.key)) { seen.add(b.key); out.push(b); }
    }
  }
  out.sort((a, b) => (a.stand < b.stand ? 1 : a.stand > b.stand ? -1 : (a.key < b.key ? -1 : a.key > b.key ? 1 : 0)));
  return out;
}
