/**
 * Kanton-Manifest: liest alle public/normtext/kanton/*.json (außer index.json)
 * und baut eine Map quelleUrl → Dateiname (z.B. 'BE-161.12.json').
 *
 * §2: kein Date.now()/Math.random() in Logik.
 * §5: Single Source of Truth — das Manifest ableitet aus den vorhandenen Dateien,
 *     nie redundant von Hand pflegen.
 *
 * Aufruf: npx vite-node scripts/normtext/kanton-manifest.ts
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { NormSnapshotDatei } from '../../src/lib/normtext/typen.ts';

/**
 * Liest alle *.json-Dateien im übergebenen Verzeichnis (außer index.json) und
 * erzeugt eine Map quelleUrl → Dateiname.
 *
 * Kollision: tritt eine quelleUrl in mehreren Dateien auf, wird der Wert mit
 * dem lexikographisch letzten Dateinamen überschrieben. In der Praxis teilen
 * alle Einträge einer Datei dieselbe quelleUrl (ein Erlass = eine URL), daher
 * ist Kollision ein Signal für ein Problem — im Manifest aber unkritisch, da
 * der Loader nur die Datei braucht.
 *
 * Mehrsprachige Erlasse (FR, VS) haben verschiedene quelleUrls (de vs. fr) und
 * landen in verschiedenen Dateien — korrekt zwei Manifest-Einträge.
 */
export function baueManifest(verzeichnis: string): Record<string, string> {
  const manifest: Record<string, string> = {};

  const dateien = readdirSync(verzeichnis)
    .filter((f) => f.endsWith('.json') && f !== 'index.json')
    .sort(); // deterministisch

  for (const dateiname of dateien) {
    const pfad = join(verzeichnis, dateiname);
    let inhalt: NormSnapshotDatei;
    try {
      inhalt = JSON.parse(readFileSync(pfad, 'utf8')) as NormSnapshotDatei;
    } catch {
      // Korrupte oder nicht-Snapshot-Dateien stillschweigend überspringen
      continue;
    }
    if (!Array.isArray(inhalt.eintraege)) continue;

    for (const eintrag of inhalt.eintraege) {
      if (eintrag.quelleUrl) {
        manifest[eintrag.quelleUrl] = dateiname;
      }
    }
  }

  return manifest;
}

// ── Ausführbarer Teil ─────────────────────────────────────────────────────────
const KANTON_DIR = 'public/normtext/kanton';
const INDEX_PFAD = `${KANTON_DIR}/index.json`;

const manifest = baueManifest(KANTON_DIR);

// Sortierte Schlüssel für stabiles, diff-freundliches JSON
const sortiert: Record<string, string> = {};
for (const k of Object.keys(manifest).sort()) {
  sortiert[k] = manifest[k];
}

mkdirSync(KANTON_DIR, { recursive: true });
writeFileSync(INDEX_PFAD, JSON.stringify(sortiert, null, 2), 'utf8');

const anzahl = Object.keys(sortiert).length;
console.log(`[kanton-manifest] ${anzahl} Einträge → ${INDEX_PFAD}`);

// Stichprobe-Ausgabe für schnelle manuelle Verifikation
const stichproben = [
  'https://www.belex.sites.be.ch/app/de/texts_of_law/161.12',
  'https://bgs.zg.ch/app/de/texts_of_law/161.7',
];
for (const url of stichproben) {
  const datei = sortiert[url];
  console.log(`  ${url} → ${datei ?? '(nicht gefunden!)'}`);
}
