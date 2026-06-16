// Client-Loader für Norm-Snapshots. Reine Ladeschicht (CLAUDE.md §3): holt die
// statische JSON-Datei eines Erlasses und sucht den Artikel-Eintrag heraus —
// KEINE Rechtsregel, kein Normtext wird hier erzeugt (der liegt im Snapshot).
//
// - Lazy: eine Datei wird erst beim ersten Bedarf geholt.
// - Datei-Cache: jede Datei wird nur EINMAL gefetcht. Gecacht wird die laufende
//   Promise (nicht erst das Ergebnis), damit zwei gleichzeitige Aufrufe für
//   dieselbe Datei keinen doppelten fetch auslösen. Fehlschläge (404/Netz/Parse)
//   werden als gecachte null abgelegt — kein erneuter Versuch im selben Leben
//   des Moduls (clientseitig genügend; ein Reload setzt den Cache zurück).
// - Fehlertolerant: jeder Fehler → null (kein throw), damit die UI ruhig auf
//   den Fallback (direkter Live-Link) zurückfallen kann.

import type { NormSnapshot, NormSnapshotDatei } from './typen';

const dateiCache = new Map<string, Promise<NormSnapshotDatei | null>>();

function pfad(ebene: 'bund' | 'kanton', quelle: string, erlassRef?: string): string {
  return ebene === 'kanton'
    ? `/normtext/kanton/${quelle}-${erlassRef ?? ''}.json`
    : `/normtext/bund/${quelle}.json`;
}

async function holeDatei(url: string): Promise<NormSnapshotDatei | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return (await res.json()) as NormSnapshotDatei;
  } catch {
    return null;
  }
}

function ladeDatei(url: string): Promise<NormSnapshotDatei | null> {
  let p = dateiCache.get(url);
  if (!p) {
    p = holeDatei(url);
    dateiCache.set(url, p);
  }
  return p;
}

// Separater Cache für das Kanton-Manifest (quelleUrl → Dateiname).
// Gecacht als laufende Promise (gleisches Muster wie dateiCache), damit
// gleichzeitige Aufrufe keinen Doppelfetch auslösen.
const KANTON_MANIFEST_URL = '/normtext/kanton/index.json';
let kantonManifestPromise: Promise<Record<string, string> | null> | null = null;

async function ladeKantonManifest(): Promise<Record<string, string> | null> {
  if (!kantonManifestPromise) {
    kantonManifestPromise = (async () => {
      try {
        const res = await fetch(KANTON_MANIFEST_URL);
        if (!res.ok) return null;
        return (await res.json()) as Record<string, string>;
      } catch {
        return null;
      }
    })();
  }
  return kantonManifestPromise;
}

/**
 * Lädt einen Kantons-Snapshot via quelleUrl + artikelToken (Manifest-basiert).
 * Intern: holt /normtext/kanton/index.json einmalig (gecacht), leitet den
 * Dateinamen daraus ab, holt die Snapshot-Datei (gecacht via dateiCache) und
 * gibt den passenden Eintrag zurück.
 *
 * Liefert null bei: unbekannter quelleUrl, Token nicht in Datei, 404,
 * Netz-/Parse-Fehler. Kein throw.
 */
export async function ladeKantonSnapshotViaUrl(
  quelleUrl: string,
  artikelToken: string,
): Promise<NormSnapshot | null> {
  const manifest = await ladeKantonManifest();
  if (!manifest) return null;
  const dateiname = manifest[quelleUrl];
  if (!dateiname) return null;

  const dateiUrl = `/normtext/kanton/${dateiname}`;
  const datei = await ladeDatei(dateiUrl);
  if (!datei || !Array.isArray(datei.eintraege)) return null;

  return datei.eintraege.find((e) => e.artikel === artikelToken) ?? null;
}

/**
 * Lädt den Snapshot eines Artikels (lazy, gecacht). Liefert null bei 404,
 * Netz-/Parse-Fehler oder wenn der Eintrag in der Datei fehlt.
 *
 * @param artikelToken Anker-Token wie im Fedlex-Anker ('335_c', '4').
 * @param erlassRef    nur Kanton: Erlass-Nummer für den Dateinamen.
 */
export async function ladeSnapshot(
  ebene: 'bund' | 'kanton',
  quelle: string,
  artikelToken: string,
  erlassRef?: string,
): Promise<NormSnapshot | null> {
  const datei = await ladeDatei(pfad(ebene, quelle, erlassRef));
  if (!datei || !Array.isArray(datei.eintraege)) return null;
  const id = `${ebene}/${quelle}/art_${artikelToken}`;
  return datei.eintraege.find((e) => e.id === id) ?? null;
}
