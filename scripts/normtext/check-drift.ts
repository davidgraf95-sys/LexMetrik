/**
 * Drift-Check für Norm-Snapshots (§7 Zitat-Ausnahme d — automatische Drift-Erkennung).
 *
 * Drei Prüfungen:
 *   1. Bund-Fassung (OFFLINE): fassungsToken jedes Snapshots vs. Konsolidierung aus fedlex-cache.sh.
 *   2. Bund-Vollständigkeit (OFFLINE): Pflicht-Anker aus fedlex-cache.sh müssen als Snapshot existieren.
 *   3. Kanton-Drift (NETZ, nur mit --netz): versionUid aus LexWork vs. fassungsToken im Snapshot.
 *
 * §2: kein Date.now/Math.random. §8: kein stilles Versagen (Exit 1 bei echten Problemen).
 *
 * Aufruf:
 *   vite-node scripts/normtext/check-drift.ts           # offline (1+2)
 *   vite-node scripts/normtext/check-drift.ts -- --netz # mit Netz (1+2+3)
 *
 * Reine Logik (testbar, ohne FS/Netz): scripts/normtext/drift-logik.ts
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { parseFedlexCacheEintraege } from './inventar-bund.ts';
import { sammleKantonInventar, sammleHtmInventar } from './inventar-kanton.ts';
import { holeLexWork } from './adapter-lexwork.ts';
import { holeHtm } from './adapter-htm.ts';
import { pruefeBundFassung, pruefeBundVollstaendigkeit } from './drift-logik.ts';
import type { NormSnapshot } from './drift-logik.ts';

// lawIdSafe für HTM-Quellen (kongruent zu normtext-snapshot.ts).
function htmLawIdSafe(url: string): string {
  const letzter = url.split('/').pop() ?? url;
  return letzter.replace(/\.html?$/i, '');
}

interface SnapshotDatei {
  erzeugt: string;
  eintraege: NormSnapshot[];
}

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

function ladeBundSnapshots(): { snapshots: NormSnapshot[]; snapshotIds: Set<string> } {
  const bundDir = 'public/normtext/bund';
  if (!existsSync(bundDir)) {
    return { snapshots: [], snapshotIds: new Set() };
  }

  const snapshots: NormSnapshot[] = [];
  const snapshotIds = new Set<string>();

  for (const datei of readdirSync(bundDir)) {
    if (!datei.endsWith('.json')) continue;
    const pfad = `${bundDir}/${datei}`;
    const inhalt = JSON.parse(readFileSync(pfad, 'utf8')) as SnapshotDatei;
    for (const e of inhalt.eintraege ?? []) {
      snapshots.push(e);
      snapshotIds.add(e.id);
    }
  }

  return { snapshots, snapshotIds };
}

function ladeKantonFassungsTokens(): Map<string, string> {
  // Map: "<KT>/<lawId>" → fassungsToken (erster Snapshot der Datei; alle Einträge teilen denselben)
  const kantonDir = 'public/normtext/kanton';
  const map = new Map<string, string>();
  if (!existsSync(kantonDir)) return map;

  for (const datei of readdirSync(kantonDir)) {
    if (!datei.endsWith('.json') || datei === 'index.json') continue;
    const pfad = `${kantonDir}/${datei}`;
    const inhalt = JSON.parse(readFileSync(pfad, 'utf8')) as SnapshotDatei;
    const eintraege = inhalt.eintraege ?? [];
    if (eintraege.length === 0) continue;

    // id-Format: "kanton/<KT>/<lawId>/art_xxx"
    const erster = eintraege[0];
    const teile = erster.id.split('/');
    if (teile.length < 4 || teile[0] !== 'kanton') continue;

    const kt = teile[1];
    const lawId = teile[2];
    map.set(`${kt}/${lawId}`, erster.fassungsToken);
  }

  return map;
}

// ─── Hauptprogramm ────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const mitNetz = process.argv.includes('--netz');

  const shellQuelle = readFileSync('scripts/fedlex-cache.sh', 'utf8');
  const cacheEintraege = parseFedlexCacheEintraege(shellQuelle);

  // cacheMap: name (lowercase) → konsolidierung
  const cacheMap = new Map<string, string>(
    cacheEintraege.map((e) => [e.name.toLowerCase(), e.konsolidierung]),
  );

  // ankerMap: name (lowercase) → Pflicht-Anker-Array
  const ankerMap = new Map<string, string[]>(
    cacheEintraege.map((e) => [e.name.toLowerCase(), e.anker]),
  );

  const { snapshots, snapshotIds } = ladeBundSnapshots();

  let exitCode = 0;

  // ─── Prüfung 1: Bund-Fassung (offline) ─────────────────────────────────────
  const mismatches = pruefeBundFassung(snapshots, cacheMap);
  if (mismatches.length > 0) {
    console.error('\nFEHLER Bund-Fassung: fassungsToken stimmt nicht mit Cache überein:');
    for (const m of mismatches) {
      console.error(
        `  ${m.id}: Snapshot "${m.snapshotToken}" ≠ Cache "${m.cacheToken}" — \`npm run normtext\` neu laufen`,
      );
    }
    exitCode = 1;
  }

  // ─── Prüfung 2: Bund-Vollständigkeit (offline) ─────────────────────────────
  const fehlend = pruefeBundVollstaendigkeit(snapshotIds, ankerMap);
  if (fehlend.length > 0) {
    console.error('\nFEHLER Bund-Vollständigkeit: Pflicht-Anker ohne Snapshot:');
    for (const id of fehlend) {
      console.error(`  ${id}`);
    }
    exitCode = 1;
  }

  // ─── Report Prüfung 1+2 ────────────────────────────────────────────────────
  const gepruefte = snapshots.filter((s) => s.id.startsWith('bund/')).length;
  const driftStatus = mismatches.length === 0 ? 'ok' : `${mismatches.length} Mismatch(es)`;
  const fehlendStatus = fehlend.length === 0 ? 'ok' : `${fehlend.length} fehlend`;
  console.log(
    `check:normtext (offline): ${gepruefte} Bund-Snapshots geprüft — Drift: ${driftStatus}, Fehlend: ${fehlendStatus}`,
  );

  // ─── Prüfung 3: Kanton-Drift (NETZ) ────────────────────────────────────────
  if (mitNetz) {
    console.log('\ncheck:normtext-netz: Kanton-Drift prüfen …');
    const gruppen = sammleKantonInventar();
    const kantonTokens = ladeKantonFassungsTokens();

    let kantonGeprüft = 0;
    let kantonDrift = 0;
    let kantonWarnungen = 0;

    for (const gruppe of gruppen) {
      const key = `${gruppe.kanton}/${gruppe.lawId}`;
      const snapshotToken = kantonTokens.get(key);

      if (snapshotToken === undefined) {
        // Kein Snapshot für diese Gruppe → überspringen
        continue;
      }

      try {
        // Nur Meta benötigt; leere Token-Liste reicht
        const ergebnis = await holeLexWork(gruppe.host, gruppe.lang, gruppe.lawId, []);

        if (ergebnis.meta.nurPdf) {
          // nurPdf-Erlass → überspringen
          continue;
        }

        kantonGeprüft++;
        const neueUid = ergebnis.meta.versionUid;

        if (neueUid && neueUid !== snapshotToken) {
          console.error(
            `FEHLER Kanton-Drift: ${gruppe.kanton} ${gruppe.lawId}: version_uid "${neueUid}" ≠ Snapshot "${snapshotToken}" — Snapshot neu erzeugen`,
          );
          kantonDrift++;
          exitCode = 1;
        }
      } catch (err) {
        // Netzfehler → Warnung, kein harter Fehler (§8: transparent machen)
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`WARNUNG Kanton-Netz: ${gruppe.kanton} ${gruppe.lawId}: ${msg}`);
        kantonWarnungen++;
      }
    }

    console.log(
      `check:normtext-netz: ${kantonGeprüft} Kanton-Gruppen geprüft — Drift: ${kantonDrift}, Netz-Warnungen: ${kantonWarnungen}`,
    );

    // ─── Prüfung 4: HTM-Drift (NETZ) — quelleHash statt version_uid ──────────
    // NE/GE-HTM-Quellen haben kein version_uid. Drift-Token ist der quelleHash
    // des extrahierten Volltexts (fassungsToken im Snapshot). Re-fetch +
    // quelleHash-Vergleich erkennt jede inhaltliche Quellen-Änderung (§7 d).
    console.log('\ncheck:normtext-netz: HTM-Drift (NE/GE) prüfen …');
    const htmGruppen = sammleHtmInventar();
    let htmGeprüft = 0;
    let htmDrift = 0;
    let htmWarnungen = 0;

    for (const g of htmGruppen) {
      const key = `${g.kanton}/${htmLawIdSafe(g.quelleUrl)}`;
      const snapshotToken = kantonTokens.get(key);
      if (snapshotToken === undefined) continue; // kein Snapshot → überspringen

      try {
        const ergebnis = await holeHtm(g.quelleUrl, g.profil, []);
        htmGeprüft++;
        const neuerHash = ergebnis.meta.quelleHash;
        if (neuerHash && neuerHash !== snapshotToken) {
          console.error(
            `FEHLER HTM-Drift: ${g.kanton} ${htmLawIdSafe(g.quelleUrl)}: quelleHash "${neuerHash.slice(0, 12)}…" ≠ Snapshot "${snapshotToken.slice(0, 12)}…" — Snapshot neu erzeugen`,
          );
          htmDrift++;
          exitCode = 1;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`WARNUNG HTM-Netz: ${g.kanton} ${g.quelleUrl}: ${msg}`);
        htmWarnungen++;
      }
    }

    console.log(
      `check:normtext-netz: ${htmGeprüft} HTM-Gruppen geprüft — Drift: ${htmDrift}, Netz-Warnungen: ${htmWarnungen}`,
    );
  }

  process.exit(exitCode);
}

main().catch((err) => {
  console.error('check-drift: unerwarteter Fehler:', err);
  process.exit(1);
});
