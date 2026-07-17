// Client-Loader für Norm-Snapshots. Reine Ladeschicht (CLAUDE.md §3): holt die
// statische JSON-Datei eines Erlasses und sucht den Artikel-Eintrag heraus —
// KEINE Rechtsregel, kein Normtext wird hier erzeugt (der liegt im Snapshot).
//
// - Lazy: eine Datei wird erst beim ersten Bedarf geholt.
// - Datei-Cache: jede Datei wird nur EINMAL gefetcht. Gecacht wird die laufende
//   Promise (nicht erst das Ergebnis), damit zwei gleichzeitige Aufrufe für
//   dieselbe Datei keinen doppelten fetch auslösen. Gecacht bleibt nur ein
//   ECHTES Ergebnis: eine echte 404 (Datei existiert nicht → dauerhaft null)
//   ODER der geladene Snapshot. **Transiente Fehler (Netz-Blip, 5xx, Parse)
//   werden NICHT gecacht** (O-1.7): der Cache-Eintrag wird nach dem Fehlschlag
//   entfernt, sodass der nächste Zugriff neu versucht — sonst degradierte ein
//   einzelner Netz-Blip die Artikel-Popups bis zum Reload.
// - Fehlertolerant: jeder Fehler → null gegenüber dem Aufrufer (kein throw),
//   damit die UI ruhig auf den Fallback (direkter Live-Link) zurückfallen kann.

import type { NormSnapshot, NormSnapshotDatei } from './typen';

const dateiCache = new Map<string, Promise<NormSnapshotDatei | null>>();

function pfad(ebene: 'bund' | 'kanton', quelle: string, erlassRef?: string): string {
  return ebene === 'kanton'
    ? `/normtext/kanton/${quelle}-${erlassRef ?? ''}.json`
    : `/normtext/bund/${quelle}.json`;
}

// Holt eine JSON-Datei. Rückgabe null NUR bei echter 404 (Datei existiert
// nicht — cachebar). Transiente Fehler (5xx, Netz, Parse) WERFEN, damit der
// Aufrufer (ladeDatei) den Cache-Eintrag verwerfen und später neu versuchen
// kann. Der 404-Fall ist das einzige gecachte «null».
async function holeDatei(url: string): Promise<NormSnapshotDatei | null> {
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status} für ${url}`);
  return (await res.json()) as NormSnapshotDatei;
}

// Cacht die laufende Promise. Verwirft den Eintrag, wenn die Promise
// verwirft (transienter Fehler) — der nächste Zugriff fetcht neu. Gegenüber
// dem Aufrufer wird jeder Fehler zu null geglättet (kein throw, UI-Fallback).
function ladeDatei(url: string): Promise<NormSnapshotDatei | null> {
  let p = dateiCache.get(url);
  if (!p) {
    p = holeDatei(url);
    // Bei transientem Fehler den Cache-Eintrag räumen (nur wenn noch DIESE
    // Promise hinterlegt ist — ein zwischenzeitlicher Neuversuch bleibt intakt).
    p.catch(() => {
      if (dateiCache.get(url) === p) dateiCache.delete(url);
    });
    dateiCache.set(url, p);
  }
  return p.then((x) => x, () => null);
}

// Separater Cache für das Kanton-Manifest (quelleUrl → Dateiname).
// Gecacht als laufende Promise (gleiches Muster wie dateiCache), damit
// gleichzeitige Aufrufe keinen Doppelfetch auslösen. Transiente Fehler werden
// NICHT dauerhaft gecacht (O-1.7): bei Fehlschlag wird die gecachte Promise
// zurückgesetzt, sodass der nächste Zugriff neu versucht.
const KANTON_MANIFEST_URL = '/normtext/kanton/index.json';
let kantonManifestPromise: Promise<Record<string, string> | null> | null = null;

async function ladeKantonManifest(): Promise<Record<string, string> | null> {
  if (!kantonManifestPromise) {
    const p = (async () => {
      const res = await fetch(KANTON_MANIFEST_URL);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status} für ${KANTON_MANIFEST_URL}`);
      return (await res.json()) as Record<string, string>;
    })();
    // Bei transientem Fehler den Cache zurücksetzen (nächster Zugriff neu).
    p.catch(() => {
      if (kantonManifestPromise === p) kantonManifestPromise = null;
    });
    kantonManifestPromise = p;
  }
  return kantonManifestPromise.then((x) => x, () => null);
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
  // M13: Schlusstitel-/UeB-Token tragen den eigenen Namespace («disp_u1_art_1»)
  // und werden OHNE «art_»-Präfix als id gespeichert (bund/OR/disp_u1_art_1).
  // Haupttext-Token bleiben «art_<token>». Sonst läge der Lookup für jeden
  // Schlusstitel-Zugriff still daneben (§8: kein stilles «Artikel nicht gefunden»).
  const id = artikelToken.startsWith('disp_')
    ? `${ebene}/${quelle}/${artikelToken}`
    : `${ebene}/${quelle}/art_${artikelToken}`;
  return datei.eintraege.find((e) => e.id === id) ?? null;
}
