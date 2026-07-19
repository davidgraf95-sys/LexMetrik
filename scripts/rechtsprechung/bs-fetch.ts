// ─── BS-Dokument-Fetch: golden store, Checkpoint, Fehlerliste (Bauplan §5.1) ─
//
// Idempotent + resumierbar: pro Inventar-Zeile wird nur gefetcht, wenn die
// Rohdatei daten/bs-fiw/raw/<nF30_KEY>.html fehlt ODER das Portal-Aktualisierungs-
// datum neuer ist als der Checkpoint-Stand. Rohbytes werden UNVERÄNDERT gespeichert
// (golden — Parser-Fixes brauchen nie einen Re-Crawl). Fehler nach 3 Backoff-
// Versuchen wandern in die Fehlerliste; der Lauf geht weiter (Exit ≠0 am Ende).

import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { holeBs, dokumentUrl } from './bs-client';
import type { Inventar, InventarZeile } from './bs-inventar';

export const BS_DATEN = join(process.cwd(), 'daten', 'bs-fiw');
export const RAW_DIR = join(BS_DATEN, 'raw');
const CHECKPOINT = join(BS_DATEN, 'checkpoint.json');
export const FEHLERLISTE = join(BS_DATEN, 'fehlerliste.json');

interface Checkpoint {
  /** key → Portal-Aktualisierungsdatum (ISO|null) zum Zeitpunkt des Fetches. */
  [key: string]: { aktualisiert: string | null; abgerufen: string };
}

function ladeCheckpoint(): Checkpoint {
  if (!existsSync(CHECKPOINT)) return {};
  return JSON.parse(readFileSync(CHECKPOINT, 'utf8')) as Checkpoint;
}

export function rawPfad(key: number): string {
  return join(RAW_DIR, `${key}.html`);
}

/** Dokument-Marker: die erwartete GN muss im (latin1-dekodierten) Body stehen. */
function gnMarker(z: InventarZeile): (text: string) => boolean {
  // GN erscheint im Metadaten-Kopf; Umlaute kommen in GNs nicht vor (ASCII-safe).
  return (text) => text.includes(z.gn);
}

export interface FetchBericht {
  geholt: number;
  uebersprungen: number;
  fehler: Array<{ key: number; gn: string; grund: string }>;
}

export async function fetcheAlle(inventar: Inventar, datum: string, limit = 0): Promise<FetchBericht> {
  mkdirSync(RAW_DIR, { recursive: true });
  const cp = ladeCheckpoint();
  const bericht: FetchBericht = { geholt: 0, uebersprungen: 0, fehler: [] };
  let n = 0;
  for (const z of inventar.eintraege) {
    if (limit > 0 && bericht.geholt >= limit) break;
    n++;
    const pfad = rawPfad(z.key);
    const alt = cp[String(z.key)];
    // Idempotenz: vorhandene Rohdatei + Portal nicht neuer als Checkpoint → skip.
    if (existsSync(pfad) && alt && !(z.aktualisiert && (!alt.aktualisiert || z.aktualisiert > alt.aktualisiert))) {
      bericht.uebersprungen++;
      continue;
    }
    try {
      const r = await holeBs(dokumentUrl(z.key), gnMarker(z));
      writeFileSync(pfad, r.bytes);
      cp[String(z.key)] = { aktualisiert: z.aktualisiert, abgerufen: datum };
      bericht.geholt++;
      if (bericht.geholt % 25 === 0) {
        // Checkpoint fortlaufend (resumierbar, §5.1) + Fortschritt.
        writeFileSync(CHECKPOINT, JSON.stringify(cp, null, 1) + '\n', 'utf8');
        console.log(`[bs-fetch] ${bericht.geholt} geholt / ${bericht.uebersprungen} übersprungen / ${bericht.fehler.length} Fehler (${n}/${inventar.eintraege.length})`);
      }
    } catch (e) {
      bericht.fehler.push({ key: z.key, gn: z.gn, grund: e instanceof Error ? e.message : String(e) });
    }
  }
  writeFileSync(CHECKPOINT, JSON.stringify(cp, null, 1) + '\n', 'utf8');
  writeFileSync(FEHLERLISTE, JSON.stringify(bericht.fehler, null, 1) + '\n', 'utf8');
  console.log(`[bs-fetch] FERTIG: ${bericht.geholt} geholt, ${bericht.uebersprungen} übersprungen, ${bericht.fehler.length} Fehler.`);
  return bericht;
}
