/**
 * Orchestrator: erzeugt public/normtext/bund/<GESETZ>.json für alle Gesetze
 * aus scripts/fedlex-cache.sh.
 *
 * Aufruf: npm run normtext -- --datum=YYYY-MM-DD
 * (Das datum kommt aus der Shell: --datum=$(date +%F), NIEMALS new Date() im Skript)
 *
 * §2: kein Date.now()/Math.random() in Logik.
 * §8: keine stillen Fehler — übersprungene Anker werden am Ende aufgelistet.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { parseFedlexCacheEintraege } from './normtext/inventar-bund.ts';
import { extrahiereArtikel } from './normtext/extrahiere-fedlex.ts';
import {
  sammleKantonInventar,
  sammleFallback,
} from './normtext/inventar-kanton.ts';
import { holeLexWork } from './normtext/adapter-lexwork.ts';
import type { NormSnapshot, NormSnapshotDatei } from '../src/lib/normtext/typen.ts';

// ── Argument --datum= auslesen ────────────────────────────────────────────────
function leseDatum(): string {
  const arg = process.argv.find((a) => a.startsWith('--datum='));
  if (!arg) {
    throw new Error(
      'Pflicht-Argument fehlt: --datum=YYYY-MM-DD\n' +
        'Aufruf: npm run normtext -- --datum=$(date +%F)',
    );
  }
  const datum = arg.slice('--datum='.length);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) {
    throw new Error(`Ungültiges Datumsformat: "${datum}" — erwartet YYYY-MM-DD`);
  }
  return datum;
}

// ── Erlass-Abkürzungs-Map ─────────────────────────────────────────────────────
const ERLASS_MAP: Record<string, string> = {
  or: 'OR',
  zgb: 'ZGB',
  zpo: 'ZPO',
  schkg: 'SchKG',
  arg: 'ArG',
  vmwg: 'VMWG',
  stpo: 'StPO',
  vwvg: 'VwVG',
  bgg: 'BGG',
  bgerr: 'BGerR',
  vvg: 'VVG',
  hregv: 'HRegV',
  gebv_hreg: 'GebV-HReg',
  gebv_schkg: 'GebV SchKG',
  stgb: 'StGB',
  stg: 'StG',
  kvg: 'KVG',
  kvv: 'KVV',
};

// ── Konsolidierungsdatum YYYYMMDD → ISO YYYY-MM-DD ───────────────────────────
function konsZuIso(kons: string): string {
  return `${kons.slice(0, 4)}-${kons.slice(4, 6)}-${kons.slice(6, 8)}`;
}

// ── Artikel-Label: token → 'Art. 335c' ───────────────────────────────────────
function artikelLabel(token: string): string {
  return 'Art. ' + token.replace(/_/g, '');
}

// ── SHA256 des Block-Texts ────────────────────────────────────────────────────
function sha256Bloecke(bloecke: Array<{ absatz: string | null; text: string }>): string {
  const zusammen = bloecke.map((b) => b.text).join('\n');
  return createHash('sha256').update(zusammen, 'utf8').digest('hex');
}

// ── Stabile JSON-Ausgabe (sortierte Schlüssel) ────────────────────────────────
function stabelesJson(obj: unknown): string {
  return JSON.stringify(obj, null, 2);
}

// ── Caches sicherstellen ──────────────────────────────────────────────────────
function sicherstelleCaches(eintraege: Array<{ name: string }>): void {
  const fehlende = eintraege.filter((e) => !existsSync(`/tmp/${e.name}.html`));
  if (fehlende.length === 0) return;

  console.log(
    `\n[Cache] ${fehlende.length} HTML-Cache(s) fehlen — lade via bash scripts/fedlex-cache.sh …`,
  );
  try {
    execSync('bash scripts/fedlex-cache.sh', { stdio: 'inherit' });
  } catch {
    const nochFehlend = fehlende.filter((e) => !existsSync(`/tmp/${e.name}.html`));
    if (nochFehlend.length > 0) {
      const liste = nochFehlend.map((e) => `/tmp/${e.name}.html`).join(', ');
      throw new Error(
        `BLOCKED: fedlex-cache.sh konnte folgende HTMLs nicht laden: ${liste}\n` +
          'Netzwerkzugang prüfen.',
      );
    }
  }
}

// ── lawId → dateisicher ('III B/7/1' → 'III B_7_1') ──────────────────────────
function lawIdSafe(lawId: string): string {
  return lawId.replace(/\//g, '_');
}

// ── Erlass-Bezeichnung lesbar: 'GebV OG (LS 211.11)' ─────────────────────────
function erlassBezeichnung(abkuerzung: string, erlassName: string, erlassNr: string): string {
  const basis = abkuerzung.trim() || erlassName.trim();
  return erlassNr.trim() ? `${basis} (${erlassNr.trim()})` : basis;
}

// ── Coverage-Befunde der Kantons-Phase ───────────────────────────────────────
interface KantonCoverage {
  totalSnapshots: number;
  reportZeilen: string[];
  nurPdf: Array<{ kanton: string; erlass: string; lawId: string }>;
  tokenFehlt: Array<{ kanton: string; lawId: string; token: string; label: string }>;
  fetchFehler: Array<{ kanton: string; lawId: string; fehler: string }>;
}

// ── Kantons-Snapshots (LexWork) erzeugen ─────────────────────────────────────
async function erzeugeKantonsSnapshots(
  abgerufen: string,
  goldenIndex: Record<string, string>,
): Promise<KantonCoverage> {
  const inventar = sammleKantonInventar();
  const ausgangsDir = 'public/normtext/kanton';
  mkdirSync(ausgangsDir, { recursive: true });

  const cov: KantonCoverage = {
    totalSnapshots: 0,
    reportZeilen: [],
    nurPdf: [],
    tokenFehlt: [],
    fetchFehler: [],
  };

  for (const g of inventar) {
    const tokens = g.artikel.map((a) => a.token);
    let ergebnis;
    try {
      ergebnis = await holeLexWork(g.host, g.lang, g.lawId, tokens);
    } catch (e) {
      // §8: Netzfehler pro Gruppe abfangen, nicht crashen, weiter zur nächsten.
      const fehler = e instanceof Error ? e.message : String(e);
      cov.fetchFehler.push({ kanton: g.kanton, lawId: g.lawId, fehler });
      continue;
    }

    if (ergebnis.meta.nurPdf) {
      cov.nurPdf.push({
        kanton: g.kanton,
        erlass: erlassBezeichnung(ergebnis.meta.abkuerzung, g.erlassName, g.erlassNr),
        lawId: g.lawId,
      });
      continue;
    }

    const erlass = erlassBezeichnung(ergebnis.meta.abkuerzung, g.erlassName, g.erlassNr);
    const snapshotListe: NormSnapshot[] = [];

    for (const art of g.artikel) {
      const treffer = ergebnis.artikel[art.token];
      if (!treffer || treffer.bloecke.length === 0) {
        cov.tokenFehlt.push({
          kanton: g.kanton,
          lawId: g.lawId,
          token: art.token,
          label: art.label,
        });
        continue;
      }
      const id = `kanton/${g.kanton}/${g.lawId}/art_${art.token}`;
      const snapshot: NormSnapshot = {
        id,
        ebene: 'kanton',
        quelle: g.kanton,
        erlass,
        artikel: art.token,
        artikelLabel: art.label,
        bloecke: treffer.bloecke,
        stand: ergebnis.meta.stand,
        // LexWork hat keinen Artikel-Anker → Gesetzes-Seite (originale /app/-URL).
        quelleUrl: g.quelleUrl,
        abgerufen,
        fassungsToken: ergebnis.meta.versionUid,
        sha: sha256Bloecke(treffer.bloecke),
      };
      snapshotListe.push(snapshot);
      goldenIndex[id] = snapshot.sha;
    }

    const datei: NormSnapshotDatei = { erzeugt: abgerufen, eintraege: snapshotListe };
    const ausgabePfad = `${ausgangsDir}/${g.kanton}-${lawIdSafe(g.lawId)}.json`;
    writeFileSync(ausgabePfad, stabelesJson(datei), 'utf8');

    cov.totalSnapshots += snapshotListe.length;
    cov.reportZeilen.push(
      `  ${g.kanton}-${lawIdSafe(g.lawId).padEnd(14)} ${snapshotListe.length} Snapshots → ${ausgabePfad}`,
    );
  }

  return cov;
}

// ── Hauptprogramm ─────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const abgerufen = leseDatum();
  const shellQuelle = readFileSync('scripts/fedlex-cache.sh', 'utf8');
  const eintraege = parseFedlexCacheEintraege(shellQuelle);

  console.log(`\n[Normtext-Snapshot] datum=${abgerufen}, ${eintraege.length} Gesetze`);

  // Caches sicherstellen
  sicherstelleCaches(eintraege);

  // Ausgabeverzeichnis
  const ausgangsDir = 'public/normtext/bund';
  mkdirSync(ausgangsDir, { recursive: true });

  // Golden-Index
  const goldenIndex: Record<string, string> = {};

  // Übersprungene Anker (gesetz → anker[])
  const uebersprungen: Array<{ gesetz: string; anker: string }> = [];

  // Report-Zeilen
  const reportZeilen: string[] = [];
  let totalSnapshots = 0;

  for (const eintrag of eintraege) {
    const { name, eli, konsolidierung, anker } = eintrag;
    const gesetzKey = name.toUpperCase();
    const erlass = ERLASS_MAP[name] ?? gesetzKey;
    const stand = konsZuIso(konsolidierung);
    const htmlPfad = `/tmp/${name}.html`;

    let html: string;
    try {
      html = readFileSync(htmlPfad, 'utf8');
    } catch {
      console.error(`[FEHLER] Kann ${htmlPfad} nicht lesen — überspringe ${gesetzKey}`);
      uebersprungen.push(...anker.map((a) => ({ gesetz: gesetzKey, anker: a })));
      continue;
    }

    const snapshotListe: NormSnapshot[] = [];

    for (const ankerVoll of anker) {
      // ankerVoll = 'art_335_c', token = '335_c'
      if (!ankerVoll.startsWith('art_')) {
        console.warn(`[WARN] Unbekanntes Anker-Format: ${ankerVoll} (${gesetzKey}) — überspringe`);
        uebersprungen.push({ gesetz: gesetzKey, anker: ankerVoll });
        continue;
      }
      const token = ankerVoll.slice('art_'.length);
      const extrakt = extrahiereArtikel(html, token);

      if (extrakt === null || extrakt.bloecke.length === 0) {
        uebersprungen.push({ gesetz: gesetzKey, anker: ankerVoll });
        continue;
      }

      const id = `bund/${gesetzKey}/${ankerVoll}`;
      const snapshot: NormSnapshot = {
        id,
        ebene: 'bund',
        quelle: gesetzKey,
        erlass,
        artikel: token,
        artikelLabel: artikelLabel(token),
        bloecke: extrakt.bloecke,
        stand,
        quelleUrl: `https://www.fedlex.admin.ch/eli/${eli}/de#${ankerVoll}`,
        abgerufen,
        fassungsToken: konsolidierung,
        sha: sha256Bloecke(extrakt.bloecke),
      };

      snapshotListe.push(snapshot);
      goldenIndex[id] = snapshot.sha;
    }

    // JSON schreiben
    const datei: NormSnapshotDatei = {
      erzeugt: abgerufen,
      eintraege: snapshotListe,
    };
    const ausgabePfad = `${ausgangsDir}/${gesetzKey}.json`;
    writeFileSync(ausgabePfad, stabelesJson(datei), 'utf8');

    totalSnapshots += snapshotListe.length;
    reportZeilen.push(`  ${gesetzKey.padEnd(12)} ${snapshotListe.length} Snapshots → ${ausgabePfad}`);
  }

  // Report ausgeben
  console.log('\n── Ergebnis ──────────────────────────────────────────────────');
  for (const z of reportZeilen) console.log(z);
  console.log(`\nGesamt: ${eintraege.length} Gesetze, ${totalSnapshots} Snapshots`);

  if (uebersprungen.length > 0) {
    console.log('\n── Übersprungene Anker (Anker im HTML nicht gefunden) ────────');
    for (const u of uebersprungen) {
      console.log(`  ${u.gesetz.padEnd(12)} ${u.anker}`);
    }
    console.log(`\nTotal übersprungen: ${uebersprungen.length}`);
  } else {
    console.log('\nKeine Anker übersprungen.');
  }

  // ── Kantons-Phase (LexWork) ────────────────────────────────────────────────
  console.log('\n[Normtext-Snapshot] Kantons-Phase (LexWork) …');
  const cov = await erzeugeKantonsSnapshots(abgerufen, goldenIndex);
  const fallback = sammleFallback();
  const fallbackKantone = [...new Set(fallback.map((f) => f.kanton))].sort();

  console.log('\n── Kantons-Snapshots ─────────────────────────────────────────');
  for (const z of cov.reportZeilen) console.log(z);
  console.log(`\nGesamt Kantone: ${cov.totalSnapshots} Snapshots in ${cov.reportZeilen.length} Datei(en)`);

  console.log('\n── Coverage-Report (Kantone) ─────────────────────────────────');
  console.log(`nurPdf (kein Snapshot): ${cov.nurPdf.length}`);
  for (const p of cov.nurPdf) console.log(`  ${p.kanton} ${p.erlass} [${p.lawId}]`);
  console.log(`Token nicht gefunden: ${cov.tokenFehlt.length}`);
  for (const t of cov.tokenFehlt) console.log(`  ${t.kanton} ${t.lawId} art_${t.token} (${t.label})`);
  console.log(`fetch-Fehler: ${cov.fetchFehler.length}`);
  for (const f of cov.fetchFehler) console.log(`  ${f.kanton} ${f.lawId}: ${f.fehler}`);
  console.log(`Fallback-Quellen (Nicht-LexWork, kein Snapshot): ${fallback.length} in ${fallbackKantone.length} Kantonen`);
  console.log(`  Kantone: ${fallbackKantone.join(', ')}`);

  // Golden-Index schreiben (sortiert)
  const goldenSortiert: Record<string, string> = {};
  for (const k of Object.keys(goldenIndex).sort()) {
    goldenSortiert[k] = goldenIndex[k];
  }
  mkdirSync('golden', { recursive: true });
  writeFileSync('golden/normtext-snapshot.json', stabelesJson(goldenSortiert), 'utf8');
  console.log(`\nGolden-Index: golden/normtext-snapshot.json (${Object.keys(goldenSortiert).length} Einträge)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
