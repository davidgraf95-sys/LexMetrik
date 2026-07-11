// ─── Lese-Brücke «Gesetzgebung in Arbeit» (Vernehmlassungen) ────────────────────
//
// Paket 3 (W3·11): projiziert die generierten Vernehmlassungen aus der lazy geladenen
// register.json (Browse-Manifest) auf eine Norm. Reine Ladeschicht (§3) — kein Inhalt
// erzeugt, keine Rechtslogik. Die Verfahren liegen NICHT im App-Bundle (§15): sie kommen
// aus derselben register.json, die das Kontext-Panel ohnehin lädt (ladeMaterialManifest,
// gecachte Promise) — kein zweiter Fetch.
//
// Payload/§15 (Finding 11): vernehmlassungenFuer iteriert die volle Liste NICHT je Aufruf,
// sondern baut EINMAL einen erlassKey→Verfahren-Index (memoisiert auf die Manifest-Referenz).
// §5: keine zweite Wahrheit — In-Memory-Projektion des Manifests, keine committete Parallel-Datei.

import { ladeMaterialManifest } from './browse';
import type { BrowseMaterial, MaterialManifest, VernehmlassungStatus } from './typen';

/** Anzeige-Form eines Vernehmlassungsverfahrens (Gesetzgebung-in-Arbeit-Eintrag). */
export interface VernehmlassungBezug {
  key: string;
  /** Amtlicher Titel je Sprache (DE Pflicht, FR/IT wo vorhanden). */
  titel: string;
  titelFr?: string;
  titelIt?: string;
  /** Verfahrens-Zustand (amtliches Vokabular 0–6). */
  status: VernehmlassungStatus;
  /** Anhörungs-Frist (ISO); fehlt bei Status in-vorbereitung/geplant. */
  fristStart?: string;
  fristEnde?: string;
  /** Fedlex-Live-Link zum Vernehmlassungs-Portal (amtliche Quelle, §7c). */
  quelleUrl: string;
}

/** Priorität für die Anzeige-Sortierung: laufend zuerst (was jetzt offen ist), dann geplant/
 *  in Vorbereitung (was kommt), dann abgeschlossen, zurückgezogen zuletzt. */
const STATUS_RANG: Record<VernehmlassungStatus, number> = {
  laufend: 0,
  geplant: 1,
  'in-vorbereitung': 2,
  'abgeschlossen-stellungnahmen': 3,
  'abgeschlossen-bericht': 4,
  abgeschlossen: 5,
  zurueckgezogen: 6,
};

// Index memoisiert auf die Manifest-Referenz (eine Manifest-Instanz je Session).
let indexCache: { manifest: MaterialManifest; index: Map<string, VernehmlassungBezug[]> } | null = null;

function browseNachVernehmlassung(m: BrowseMaterial): VernehmlassungBezug | null {
  const v = m.vernehmlassung;
  if (!v) return null;
  return {
    key: m.key,
    titel: m.titel,
    titelFr: m.titelFr,
    titelIt: m.titelIt,
    status: v.status,
    fristStart: v.fristStart,
    fristEnde: v.fristEnde,
    quelleUrl: m.quelleUrl,
  };
}

/** Deterministische Anzeige-Sortierung: Status-Priorität → Fristende absteigend → key. */
function vergleiche(a: VernehmlassungBezug, b: VernehmlassungBezug): number {
  return (STATUS_RANG[a.status] - STATUS_RANG[b.status])
    || (a.fristEnde && b.fristEnde ? (a.fristEnde < b.fristEnde ? 1 : a.fristEnde > b.fristEnde ? -1 : 0) : (a.fristEnde ? -1 : b.fristEnde ? 1 : 0))
    || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0);
}

/** Baut (einmal je Manifest) den erlassKey→Verfahren-Index. */
function baueIndex(manifest: MaterialManifest): Map<string, VernehmlassungBezug[]> {
  const index = new Map<string, VernehmlassungBezug[]>();
  for (const m of manifest.materialien) {
    if (m.doktyp !== 'vernehmlassung') continue;
    const bezug = browseNachVernehmlassung(m);
    if (!bezug) continue;
    for (const nk of m.normKeys) {
      const liste = index.get(nk) ?? [];
      liste.push(bezug);
      index.set(nk, liste);
    }
  }
  for (const liste of index.values()) liste.sort(vergleiche);
  return index;
}

/**
 * Vernehmlassungen über mehrere normKeys vereinigt + dedupliziert (Status-Priorität, laufend
 * zuerst). Leeres Array = keine Verknüpfung im Graphen (Reichweite ~ab 2006). `null` = Manifest-
 * Ladefehler (Fetch-Fehler ≠ leer, §8).
 */
export async function vernehmlassungenFuer(normKeys: readonly string[]): Promise<VernehmlassungBezug[] | null> {
  const manifest = await ladeMaterialManifest();
  if (!manifest) return null;
  if (!indexCache || indexCache.manifest !== manifest) {
    indexCache = { manifest, index: baueIndex(manifest) };
  }
  const seen = new Set<string>();
  const out: VernehmlassungBezug[] = [];
  for (const k of normKeys) {
    for (const v of indexCache.index.get(k) ?? []) {
      if (!seen.has(v.key)) { seen.add(v.key); out.push(v); }
    }
  }
  out.sort(vergleiche);
  return out;
}

/** Deutsche Anzeige-Labels der Status (UI, keine Rechtslogik). */
export const VERNEHMLASSUNG_STATUS_LABEL: Record<VernehmlassungStatus, string> = {
  'in-vorbereitung': 'in Vorbereitung',
  geplant: 'geplant',
  laufend: 'läuft',
  'abgeschlossen-stellungnahmen': 'abgeschlossen (Stellungnahmen)',
  'abgeschlossen-bericht': 'abgeschlossen (Ergebnisbericht)',
  abgeschlossen: 'abgeschlossen',
  zurueckgezogen: 'zurückgezogen',
};
