// ─── Build-Extrakt: Struktur-Sidecar-Fussnoten → Artikel-Revisionen (V1c) ────
//
// FAHRPLAN-VERZAHNUNG-UI §V1c. Liest die Bund-Struktur-Sidecars
// (`public/normtext/struktur/bund/*.json`) und leitet je Artikel das Datum der
// letzten Textänderung + AS-Fundstelle ab (max «in Kraft seit»/«mit Wirkung
// seit», deterministisch — reine Parser-Logik in src/lib/verzahnung/
// revisionen-extrakt.ts, EIN Ort §5). Schreibt je Erlass MIT mindestens einem
// datierten Beleg einen Shard nach `public/verzahnung/artikel-revisionen/<KEY>.json`.
//
//   npm run gen:artikel-revisionen     erzeugt/aktualisiert die Shards
//   npm run check:artikel-revisionen   prüft Drift (Shards ≠ Sidecars) → exit 1
//
// Die Struktur-Snapshots (`public/normtext/**`) werden NICHT verändert (nur
// gelesen); der Extrakt ist eine zusätzliche deterministische Projektion. Vorbild:
// such-index-generieren.ts (Serialisierung + --check). Niemals von Hand editieren.

import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { baueRevisionProArtikel, type StrukturArtikel } from '../../src/lib/verzahnung/revisionen-extrakt.ts';

const wurzel = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const QUELLE = resolve(wurzel, 'public/normtext/struktur/bund');
const ZIEL = resolve(wurzel, 'public/verzahnung/artikel-revisionen');

interface Sidecar { artikel?: Record<string, StrukturArtikel> }

/** Deterministisch: Erlass-key → serialisierter Shard-String (Token sortiert). */
function baueShards(): Map<string, string> {
  const shards = new Map<string, string>();
  const dateien = readdirSync(QUELLE).filter((f) => f.endsWith('.json')).sort();
  for (const datei of dateien) {
    const erlass = datei.replace(/\.json$/, '');
    const doc = JSON.parse(readFileSync(resolve(QUELLE, datei), 'utf8')) as Sidecar;
    const proArtikelRoh = baueRevisionProArtikel(doc.artikel ?? {});
    const tokens = Object.keys(proArtikelRoh).sort();
    if (tokens.length === 0) continue; // Erlass ohne datierten Beleg → kein Shard
    // Sortierte Neu-Konstruktion → byte-stabile Ausgabe unabhängig von Objekt-
    // Einfügereihenfolge (Determinismus, §2).
    const proArtikel: Record<string, { iso: string; as: string }> = {};
    for (const t of tokens) proArtikel[t] = proArtikelRoh[t];
    shards.set(erlass, JSON.stringify({ erlass, proArtikel }));
  }
  return shards;
}

if (!process.env.VITEST) {
  const istCheck = process.argv.includes('--check');
  const shards = baueShards();
  let artikelSumme = 0;
  for (const s of shards.values()) artikelSumme += Object.keys(JSON.parse(s).proArtikel).length;

  if (istCheck) {
    if (!existsSync(ZIEL)) {
      console.error('check:artikel-revisionen: ' + ZIEL + ' fehlt — `npm run gen:artikel-revisionen` ausführen.');
      process.exit(1);
    }
    const vorhanden = new Set(readdirSync(ZIEL).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, '')));
    let drift = false;
    for (const [erlass, neu] of shards) {
      let alt: string;
      try { alt = readFileSync(resolve(ZIEL, `${erlass}.json`), 'utf8'); } catch { alt = ''; }
      if (alt !== neu) { console.error(`check:artikel-revisionen: ${erlass}.json VERALTET/fehlt.`); drift = true; }
      vorhanden.delete(erlass);
    }
    for (const uebrig of vorhanden) { console.error(`check:artikel-revisionen: ${uebrig}.json ist verwaist (keine Quelle).`); drift = true; }
    if (drift) { console.error('→ `npm run gen:artikel-revisionen` ausführen und committen.'); process.exit(1); }
    console.log(`check:artikel-revisionen: ${shards.size} Erlasse / ${artikelSumme} revidierte Artikel synchron mit den Sidecars.`);
  } else {
    rmSync(ZIEL, { recursive: true, force: true }); // verwaiste Shards entfernen (kein toter Rest)
    mkdirSync(ZIEL, { recursive: true });
    for (const [erlass, s] of shards) writeFileSync(resolve(ZIEL, `${erlass}.json`), s, 'utf8');
    console.log(`gen:artikel-revisionen: ${shards.size} Erlasse / ${artikelSumme} revidierte Artikel → public/verzahnung/artikel-revisionen/`);
  }
}
