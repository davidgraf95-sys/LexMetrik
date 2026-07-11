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
import pLimit from 'p-limit';
import { parseFedlexCacheEintraege } from './inventar-bund.ts';
import {
  sammleKantonInventar,
  sammleHtmInventar,
  sammleZhPdfInventar,
  sammlePdfInventar,
} from './inventar-kanton.ts';
import { holeLexWork, LexWorkShellError } from './adapter-lexwork.ts';
import { holeHtm } from './adapter-htm.ts';
import { holeZhPdf } from './adapter-zh-pdf.ts';
import { holePdf, PDF_PROFILE } from './adapter-pdf.ts';
import { pdfLawIdSafe } from './lawid-safe.ts';
import { pruefeBundFassung, pruefeBundVollstaendigkeit, pruefeCoverage } from './drift-logik.ts';
import type { NormSnapshot, RegisterEintragLite } from './drift-logik.ts';
import { PDF_EMBED_QUELLEN } from '../../src/lib/normtext/pdf-embed.ts';

// lawIdSafe für HTM-Quellen (kongruent zu normtext-snapshot.ts).
function htmLawIdSafe(url: string): string {
  const ti = url.match(/\/pdfatto\/atto\/(\d+)$/i);
  if (ti) return `ti-${ti[1]}`;
  const letzter = url.split('/').pop() ?? url;
  return letzter.replace(/\.html?$/i, '');
}

// lawIdSafe für ZH (kongruent zu normtext-snapshot.ts): …/erlass-211_11-… → «211.11».
function zhLawIdSafe(url: string): string {
  const m = url.match(/\/erlass-([^-]+)-/);
  return m ? m[1].replace(/_/g, '.') : url.replace(/[^a-z0-9.]+/gi, '_');
}

// pdfLawIdSafe (inkl. olexAt/olexPar) liegt zentral in ./lawid-safe.ts (§5, C1-1)
// — importiert oben; die frühere Handkopie kannte die olex-Profile nicht.

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

// Höfliche Nebenläufigkeit (Werkzeug-Audit §Audit-1): die Netz-Drift-Schleifen
// holen bis zu FETCH_CONCURRENCY Quellen gleichzeitig. DETERMINISMUS: nur die
// (reinen) Re-Fetches laufen parallel; die Verarbeitung (Console-Ausgabe,
// Zähler, exitCode) bleibt danach seriell in unveränderter Inventar-Reihenfolge.
const FETCH_CONCURRENCY = 4;

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

  // ─── Prüfung 2b: Coverage-Assertion (offline, P1-b) ────────────────────────
  // Kein gehosteter Bund-Volltext ohne Currency-Überwachung. Register-SSoT.
  let coverageStatus = 'ok';
  const registerPfad = 'public/normtext/register.json';
  if (existsSync(registerPfad)) {
    const register = JSON.parse(readFileSync(registerPfad, 'utf8')) as {
      erlasse: RegisterEintragLite[];
    };
    const pinEliSet = new Set(cacheEintraege.map((e) => e.eli));
    const pdfEmbedKeys = new Set(PDF_EMBED_QUELLEN.map((q) => q.key));
    const luecken = pruefeCoverage(register.erlasse ?? [], pinEliSet, pdfEmbedKeys);
    if (luecken.length > 0) {
      console.error('\nFEHLER Coverage: gehosteter Bund-Volltext ohne Currency-Pin:');
      for (const l of luecken) console.error(`  ${l.key}: ${l.grund}`);
      coverageStatus = `${luecken.length} ungepinnt`;
      exitCode = 1;
    }
  } else {
    coverageStatus = 'übersprungen (register.json fehlt)';
  }

  // ─── Report Prüfung 1+2 ────────────────────────────────────────────────────
  const gepruefte = snapshots.filter((s) => s.id.startsWith('bund/')).length;
  const driftStatus = mismatches.length === 0 ? 'ok' : `${mismatches.length} Mismatch(es)`;
  const fehlendStatus = fehlend.length === 0 ? 'ok' : `${fehlend.length} fehlend`;
  console.log(
    `check:normtext (offline): ${gepruefte} Bund-Snapshots geprüft — Drift: ${driftStatus}, Fehlend: ${fehlendStatus}, Coverage: ${coverageStatus}`,
  );

  // ─── Prüfung 3: Kanton-Drift (NETZ) ────────────────────────────────────────
  if (mitNetz) {
    console.log('\ncheck:normtext-netz: Kanton-Drift prüfen …');
    const gruppen = sammleKantonInventar();
    const kantonTokens = ladeKantonFassungsTokens();

    let kantonGeprüft = 0;
    let kantonDrift = 0;
    let kantonWarnungen = 0;
    let kantonShell = 0;

    const kantonLimit = pLimit(FETCH_CONCURRENCY);
    const kantonAbrufe = await Promise.all(
      gruppen.map((gruppe) =>
        kantonLimit(async (): Promise<{ skip: true } | { ok: true; ergebnis: Awaited<ReturnType<typeof holeLexWork>> } | { ok: false; msg: string; shell: boolean }> => {
          // Gruppen ohne Snapshot NICHT über das Netz holen (wie seriell).
          if (kantonTokens.get(`${gruppe.kanton}/${gruppe.lawId}`) === undefined) return { skip: true };
          try {
            return { ok: true, ergebnis: await holeLexWork(gruppe.host, gruppe.lang, gruppe.lawId) };
          } catch (err) {
            // Soft-404-Shell (Endpunkt migriert/tot) ist ein HARTER Fehler, kein
            // transienter Netz-Blip: sonst veraltet der Snapshot still (GL-Klasse).
            return { ok: false, msg: err instanceof Error ? err.message : String(err), shell: err instanceof LexWorkShellError };
          }
        }),
      ),
    );

    for (let i = 0; i < gruppen.length; i++) {
      const gruppe = gruppen[i];
      const abruf = kantonAbrufe[i];
      if ('skip' in abruf) continue; // kein Snapshot → überspringen
      const key = `${gruppe.kanton}/${gruppe.lawId}`;
      const snapshotToken = kantonTokens.get(key)!;

      if (!abruf.ok) {
        if (abruf.shell) {
          // Soft-404-Shell = HARTER Fehler: der strukturierte Endpunkt liefert
          // keine Daten mehr, der Snapshot würde still veralten (die GL-Klasse,
          // 11.7.2026). Exit 1, damit die Klasse nie wieder unbemerkt driftet.
          console.error(
            `FEHLER Kanton-Soft-404: ${gruppe.kanton} ${gruppe.lawId}: ${abruf.msg}`,
          );
          kantonShell++;
          exitCode = 1;
          continue;
        }
        // Transienter Netzfehler → Warnung, kein harter Fehler (§8: transparent).
        console.warn(`WARNUNG Kanton-Netz: ${gruppe.kanton} ${gruppe.lawId}: ${abruf.msg}`);
        kantonWarnungen++;
        continue;
      }
      const ergebnis = abruf.ergebnis;

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
    }

    console.log(
      `check:normtext-netz: ${kantonGeprüft} Kanton-Gruppen geprüft — Drift: ${kantonDrift}, Soft-404-Shells: ${kantonShell}, Netz-Warnungen: ${kantonWarnungen}`,
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

    const htmLimit = pLimit(FETCH_CONCURRENCY);
    const htmAbrufe = await Promise.all(
      htmGruppen.map((g) =>
        htmLimit(async (): Promise<{ skip: true } | { ok: true; ergebnis: Awaited<ReturnType<typeof holeHtm>> } | { ok: false; msg: string }> => {
          if (kantonTokens.get(`${g.kanton}/${htmLawIdSafe(g.quelleUrl)}`) === undefined) return { skip: true };
          try {
            return { ok: true, ergebnis: await holeHtm(g.quelleUrl, g.profil) };
          } catch (err) {
            return { ok: false, msg: err instanceof Error ? err.message : String(err) };
          }
        }),
      ),
    );

    for (let i = 0; i < htmGruppen.length; i++) {
      const g = htmGruppen[i];
      const abruf = htmAbrufe[i];
      if ('skip' in abruf) continue; // kein Snapshot → überspringen
      const snapshotToken = kantonTokens.get(`${g.kanton}/${htmLawIdSafe(g.quelleUrl)}`)!;

      if (!abruf.ok) {
        console.warn(`WARNUNG HTM-Netz: ${g.kanton} ${g.quelleUrl}: ${abruf.msg}`);
        htmWarnungen++;
        continue;
      }
      const ergebnis = abruf.ergebnis;
      htmGeprüft++;
      const neuerHash = ergebnis.meta.quelleHash;
      if (neuerHash && neuerHash !== snapshotToken) {
        console.error(
          `FEHLER HTM-Drift: ${g.kanton} ${htmLawIdSafe(g.quelleUrl)}: quelleHash "${neuerHash.slice(0, 12)}…" ≠ Snapshot "${snapshotToken.slice(0, 12)}…" — Snapshot neu erzeugen`,
        );
        htmDrift++;
        exitCode = 1;
      }
    }

    console.log(
      `check:normtext-netz: ${htmGeprüft} HTM-Gruppen geprüft — Drift: ${htmDrift}, Netz-Warnungen: ${htmWarnungen}`,
    );

    // ─── Prüfung 5: ZH-Drift (NETZ) — quelleHash (zhlex Text-PDF) ────────────
    // ZH-PDF-Quellen haben kein version_uid → quelleHash des extrahierten
    // Volltexts als Drift-Token (§7 d). Re-fetch + Vergleich.
    console.log('\ncheck:normtext-netz: ZH-Drift (zhlex PDF) prüfen …');
    const zhGruppen = sammleZhPdfInventar();
    let zhGeprüft = 0;
    let zhDrift = 0;
    let zhWarnungen = 0;

    const zhLimit = pLimit(FETCH_CONCURRENCY);
    const zhAbrufe = await Promise.all(
      zhGruppen.map((g) =>
        zhLimit(async (): Promise<{ skip: true } | { ok: true; ergebnis: Awaited<ReturnType<typeof holeZhPdf>> } | { ok: false; msg: string }> => {
          if (kantonTokens.get(`${g.kanton}/${zhLawIdSafe(g.quelleUrl)}`) === undefined) return { skip: true };
          try {
            return { ok: true, ergebnis: await holeZhPdf(g.quelleUrl) };
          } catch (err) {
            return { ok: false, msg: err instanceof Error ? err.message : String(err) };
          }
        }),
      ),
    );

    for (let i = 0; i < zhGruppen.length; i++) {
      const g = zhGruppen[i];
      const abruf = zhAbrufe[i];
      if ('skip' in abruf) continue;
      const snapshotToken = kantonTokens.get(`${g.kanton}/${zhLawIdSafe(g.quelleUrl)}`)!;
      if (!abruf.ok) {
        console.warn(`WARNUNG ZH-Netz: ${g.kanton} ${g.quelleUrl}: ${abruf.msg}`);
        zhWarnungen++;
        continue;
      }
      const ergebnis = abruf.ergebnis;
      zhGeprüft++;
      const neuerHash = ergebnis.meta.quelleHash;
      if (neuerHash && neuerHash !== snapshotToken) {
        console.error(
          `FEHLER ZH-Drift: ${g.kanton} ${zhLawIdSafe(g.quelleUrl)}: quelleHash "${neuerHash.slice(0, 12)}…" ≠ Snapshot "${snapshotToken.slice(0, 12)}…" — Snapshot neu erzeugen`,
        );
        zhDrift++;
        exitCode = 1;
      }
    }

    console.log(
      `check:normtext-netz: ${zhGeprüft} ZH-Gruppen geprüft — Drift: ${zhDrift}, Netz-Warnungen: ${zhWarnungen}`,
    );

    // ─── Prüfung 6: PDF-Drift (NETZ) — quelleHash (SZ/TI/VD/JU Text-PDF) ──────
    // Generische PDF-Quellen haben kein version_uid → quelleHash des extrahierten
    // Volltexts als Drift-Token (§7 d). Re-fetch + Vergleich.
    console.log('\ncheck:normtext-netz: PDF-Drift (SZ/TI/VD/JU) prüfen …');
    const pdfGruppen = sammlePdfInventar();
    let pdfGeprüft = 0;
    let pdfDrift = 0;
    let pdfWarnungen = 0;
    // C1-1: Gruppen ohne Snapshot-Treffer NICHT mehr still überspringen, sondern
    // sammeln und sichtbar machen. Ein Teil davon ist legitim (PDF-Quelle ohne
    // Snapshot = Live-Link-Fallback) → kein harter Tor-Fehler; aber ein erneuter
    // Schlüssel-Drift (wie der olex-Bug) fällt so sofort in der Gate-Ausgabe auf.
    const pdfOhneSnapshot: string[] = [];

    const pdfLimit = pLimit(FETCH_CONCURRENCY);
    const pdfAbrufe = await Promise.all(
      pdfGruppen.map((g) =>
        pdfLimit(async (): Promise<{ skip: true } | { ok: true; ergebnis: Awaited<ReturnType<typeof holePdf>> } | { ok: false; msg: string }> => {
          if (kantonTokens.get(`${g.kanton}/${pdfLawIdSafe(g.profil, g.quelleUrl)}`) === undefined) return { skip: true };
          try {
            return { ok: true, ergebnis: await holePdf(g.quelleUrl, PDF_PROFILE[g.profil]) };
          } catch (err) {
            return { ok: false, msg: err instanceof Error ? err.message : String(err) };
          }
        }),
      ),
    );

    for (let i = 0; i < pdfGruppen.length; i++) {
      const g = pdfGruppen[i];
      const abruf = pdfAbrufe[i];
      const key = `${g.kanton}/${pdfLawIdSafe(g.profil, g.quelleUrl)}`;
      const snapshotToken = kantonTokens.get(key);
      if ('skip' in abruf || snapshotToken === undefined) { pdfOhneSnapshot.push(`${g.kanton}/${g.profil} ${key}`); continue; }
      if (!abruf.ok) {
        console.warn(`WARNUNG PDF-Netz: ${g.kanton} ${g.quelleUrl}: ${abruf.msg}`);
        pdfWarnungen++;
        continue;
      }
      const ergebnis = abruf.ergebnis;
      pdfGeprüft++;
      const neuerHash = ergebnis.meta.quelleHash;
      if (neuerHash && neuerHash !== snapshotToken) {
        console.error(
          `FEHLER PDF-Drift: ${g.kanton} ${pdfLawIdSafe(g.profil, g.quelleUrl)}: quelleHash "${neuerHash.slice(0, 12)}…" ≠ Snapshot "${snapshotToken.slice(0, 12)}…" — Snapshot neu erzeugen`,
        );
        pdfDrift++;
        exitCode = 1;
      }
    }

    console.log(
      `check:normtext-netz: ${pdfGeprüft} PDF-Gruppen geprüft — Drift: ${pdfDrift}, Netz-Warnungen: ${pdfWarnungen}, ohne Snapshot (Live-Link/ungeprüft): ${pdfOhneSnapshot.length}`,
    );
    if (pdfOhneSnapshot.length) {
      console.log('  PDF-Gruppen ohne Snapshot-Treffer (Drift NICHT geprüft):');
      for (const z of pdfOhneSnapshot) console.log(`    – ${z}`);
    }
  }

  process.exit(exitCode);
}

main().catch((err) => {
  console.error('check-drift: unerwarteter Fehler:', err);
  process.exit(1);
});
