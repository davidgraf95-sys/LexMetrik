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
