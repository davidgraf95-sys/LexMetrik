// ─── Korpus schreiben (geteilt: Live-Generator, Offline-Seed, Tests) ─────────
//
// Schreibt aus einer Auswahl EntscheidSnapshots die public/rechtsprechung-Dateien:
// je Entscheid eine Datei + register.json (Manifest) + norm-index.json +
// erfasste-keys.generated.ts (interne Verlinkung). Eine Stelle, kein Duplikat (§5).

import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { kuerzeRegeste, normalisiereRegeste } from '../../src/lib/rechtsprechung/register';
import type { EntscheidSnapshot, EntscheidSnapshotDatei } from '../../src/lib/rechtsprechung/typen';
import type { BrowseEntscheid, EntscheidManifest } from '../../src/lib/rechtsprechung/register';
import type { EntscheidRef } from '../../src/lib/rechtsprechung/norm-index';

export function keyVon(snap: EntscheidSnapshot): { key: string; datei: string } {
  const docketSafe = snap.id.split('/').pop()!;
  return { key: `${snap.gericht}_${docketSafe}`, datei: `${snap.id}.json` };
}

export function schreibeKorpus(auswahl: EntscheidSnapshot[], datum: string, root = process.cwd()): { anzahl: number; normBuckets: number } {
  const PUB = join(root, 'public', 'rechtsprechung');
  const GENKEYS = join(root, 'src', 'lib', 'rechtsprechung', 'erfasste-keys.generated.ts');

  if (existsSync(PUB)) rmSync(PUB, { recursive: true, force: true });
  mkdirSync(PUB, { recursive: true });

  const manifest: BrowseEntscheid[] = [];
  const proNorm: Record<string, EntscheidRef[]> = {};

  for (const snap of auswahl) {
    const { key, datei } = keyVon(snap);
    const ziel = join(PUB, datei);
    mkdirSync(join(ziel, '..'), { recursive: true });
    // §7-Provenienz / additiver Build (Batch 3): jede Datei trägt das Abrufdatum
    // IHRES Inhalts (snap.abgerufen), nicht das globale Build-Datum. So bleibt ein
    // additiver Lauf (neue Gerichte ergänzen) für unveränderte Bestands-Snapshots
    // byte-gleich (kein Drift der 272 BGE, §6), während neue Einträge ihr echtes
    // Abrufdatum behalten. Für einen Vollbau (alle abgerufen==datum) verhaltensneutral.
    const wrap: EntscheidSnapshotDatei = { erzeugt: snap.abgerufen || datum, eintraege: [snap] };
    writeFileSync(ziel, JSON.stringify(wrap, null, 2) + '\n', 'utf8');

    // regesteKurz aus dem GEGLÄTTETEN Text (normalisiereRegeste strippt u.a. die
    // führende „Regeste"-Überschrift) — sonst stünde „Regeste" doppelt bzw. als Präfix.
    const regesteKurz = snap.regeste ? kuerzeRegeste(normalisiereRegeste(snap.regeste.text)) : null;
    manifest.push({
      key, gericht: snap.gericht, gerichtName: snap.gerichtName, gerichtstyp: snap.gerichtstyp,
      kanton: snap.kanton, nummer: snap.nummer, bgeReferenz: snap.bgeReferenz, datum: snap.datum,
      zitierung: snap.zitierung, leitcharakter: snap.leitcharakter,
      regesteVorhanden: !!snap.regeste, regesteKurz, sachgebiet: snap.sachgebiet, sprache: snap.sprache,
      normKeys: snap.normKeys, bestand: snap.bestand, kuratierung: snap.kuratierung,
      datei, quelle: snap.quelle, quelleUrl: snap.quelleUrl, fassungsToken: snap.fassungsToken,
    });

    // Getrennter Übersichts-Eintrag (Auftrag David 26.6.): das vollständige Urteil zu
    // einem BGE als EIGENE Karte, per Deep-Link auf die BGE-Detailseite mit Voll-Ansicht
    // — KEIN Daten-/Datei-Duplikat (datei:null), keine BGE-/Norm-Doppelzählung.
    if (snap.gericht === 'bge' && snap.azaUrteil && snap.auszugAbschnitte?.length) {
      manifest.push({
        key: `${key}__voll`, gericht: 'bger', gerichtName: snap.gerichtName, gerichtstyp: 'bundesgericht',
        kanton: 'CH', nummer: snap.azaUrteil.aktenzeichen, bgeReferenz: null, datum: snap.datum,
        zitierung: `BGer ${snap.azaUrteil.aktenzeichen}`, leitcharakter: 'routine',
        regesteVorhanden: false, regesteKurz: null, sachgebiet: snap.sachgebiet, sprache: snap.sprache,
        normKeys: [], bestand: snap.bestand, kuratierung: snap.kuratierung,
        datei: null, quelle: snap.quelle, quelleUrl: snap.azaUrteil.quelleUrl ?? snap.quelleUrl,
        fassungsToken: snap.fassungsToken,
        verweis: { zielKey: key, ansicht: 'voll', bgeReferenz: snap.bgeReferenz! },
      });
    }

    // C2-4 (präzisiert Batch 3): Der Norm→Entscheid-Index speist im UI die Liste
    // «Bundesgerichtsentscheide zu diesem Erlass» (norm-index.ts → GesetzLeser).
    // Darum NUR echte Bundesgerichts-Entscheide (gerichtstyp 'bundesgericht' =
    // bge/bger). Die neuen eidg. Gerichte (BVGer/BStGer/BPatGer) sind zwar canton
    // 'CH', aber NICHT das Bundesgericht → sie würden sonst fälschlich unter dieser
    // Überschrift erscheinen (§8). Für den Bestand identisch (alle CH-Einträge sind
    // bundesgericht). Kantonale/eidg. Entscheide bleiben über die Rubrik auffindbar.
    if (snap.gerichtstyp === 'bundesgericht') {
      for (const nk of snap.normKeys) {
        (proNorm[nk] ??= []).push({
          key, zitierung: snap.zitierung, regesteKurz, datum: snap.datum,
          leitcharakter: snap.leitcharakter, gericht: snap.gericht, kanton: snap.kanton,
        });
      }
    }
  }

  for (const nk of Object.keys(proNorm)) {
    // §2-Determinismus: `key` als TOTALER Tiebreaker — sonst hängt die Reihenfolge bei
    // Gleichstand (gleicher leitcharakter + gleiches Datum) von der Build-Eingabe-
    // reihenfolge ab (Vollbau [bge,bund,kanton] vs. additiver Lauf [Register-Reihen-
    // folge] erzeugten sonst denselben Inhalt in anderer Folge). So ist die norm-index
    // build-pfad-unabhängig stabil.
    proNorm[nk].sort((a, b) =>
      (a.leitcharakter === 'leitentscheid' ? 0 : 1) - (b.leitcharakter === 'leitentscheid' ? 0 : 1)
      || (a.datum < b.datum ? 1 : -1)
      || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
    proNorm[nk] = proNorm[nk].slice(0, 12);
  }

  // Stabil (V8 TimSort): bei Datums-Gleichstand bleibt die Eingangsreihenfolge —
  // im additiven Lauf die committete Register-Folge, also kein Reorder des Bestands.
  manifest.sort((a, b) => (a.datum < b.datum ? 1 : a.datum > b.datum ? -1 : 0));
  const manifestObj: EntscheidManifest = { erzeugt: datum, entscheide: manifest };
  writeFileSync(join(PUB, 'register.json'), JSON.stringify(manifestObj, null, 2) + '\n', 'utf8');
  writeFileSync(join(PUB, 'norm-index.json'), JSON.stringify({ erzeugt: datum, proNorm }, null, 2) + '\n', 'utf8');

  const keys = manifest.map((m) => m.key).sort();
  writeFileSync(
    GENKEYS,
    `// AUTO-GENERIERT von scripts/normtext-entscheide.ts — nicht von Hand editieren.\n`
    + `// Erfasste Rechtsprechungs-Keys (interne Verlinkung, synchron konsultiert, Fahrplan 8.5).\n`
    + `export const ERFASST: ReadonlySet<string> = new Set([\n`
    + keys.map((k) => `  ${JSON.stringify(k)},`).join('\n')
    + (keys.length ? '\n' : '')
    + `]);\n`,
    'utf8',
  );

  return { anzahl: manifest.length, normBuckets: Object.keys(proNorm).length };
}

/**
 * Bestehenden Korpus von der Platte laden (additiver Build, Batch 3): liest das
 * committete register.json + jede zugehörige Snapshot-Datei (nicht-Verweis) IN
 * REGISTER-REIHENFOLGE. Damit kann ein Lauf neue Gerichte ergänzen, ohne den
 * Bestand über die Live-API neu zu ziehen — die 272 BGE + 4 FR bleiben byte-gleich
 * (§2/§6, kein Drift). Verweis-Einträge werden NICHT geladen (kein File; sie werden
 * in schreibeKorpus aus azaUrteil rekonstruiert). Die Reihenfolge wird bewahrt, damit
 * schreibeKorpus den stabil sortierten Manifest unverändert reproduziert.
 */
export function ladeBestandSnapshots(root = process.cwd()): EntscheidSnapshot[] {
  const PUB = join(root, 'public', 'rechtsprechung');
  const regPfad = join(PUB, 'register.json');
  if (!existsSync(regPfad)) return [];
  const manifest = JSON.parse(readFileSync(regPfad, 'utf8')) as EntscheidManifest;
  const out: EntscheidSnapshot[] = [];
  const gesehen = new Set<string>();
  for (const e of manifest.entscheide) {
    if (e.verweis || !e.datei) continue;
    const fp = join(PUB, e.datei);
    if (!existsSync(fp)) continue;
    const d = JSON.parse(readFileSync(fp, 'utf8')) as EntscheidSnapshotDatei;
    const snap = d.eintraege?.[0];
    if (snap && !gesehen.has(snap.id)) { gesehen.add(snap.id); out.push(snap); }
  }
  return out;
}
