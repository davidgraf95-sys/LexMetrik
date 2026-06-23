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
import { extrahiereArtikel, alleArtikelTokens } from './normtext/extrahiere-fedlex.ts';
import {
  sammleKantonInventar,
  sammleFallback,
  sammleHtmInventar,
  sammleZhPdfInventar,
  sammlePdfInventar,
  type KantonInventarGruppe,
} from './normtext/inventar-kanton.ts';
import { enumeriereKanton } from './normtext/lexfind-discovery.ts';
import { discoveryZuInventar } from './normtext/kanton-discovery-quellen.ts';
import { holeLexWork } from './normtext/adapter-lexwork.ts';
import { holeHtm } from './normtext/adapter-htm.ts';
import { holeZhPdf } from './normtext/adapter-zh-pdf.ts';
import { holePdf, PDF_PROFILE, type PdfProfilName } from './normtext/adapter-pdf.ts';
import { baueManifest } from './normtext/kanton-manifest.ts';
import { baueBrowseManifest } from './normtext/browse-manifest.ts';
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
  // Erweiterung 17.6.2026 (jedes zitierte Bundesgesetz mit Volltext-Snapshot).
  mwstg: 'MWSTG',
  urg: 'URG',
  bewg: 'BewG',
  eog: 'EOG',
  svg: 'SVG',
  dsg: 'DSG',
  bbg: 'BBG',
  gbv: 'GBV',
  jstpo: 'JStPO',
  // Volltext-Ausbau Bund 23.6.2026 (Promotion aus nur-live-link-Stubs)
  partg: 'PartG',
  jstg: 'JStG',
  iprg: 'IPRG',
  betmg: 'BetmG',
  vstrr: 'VStrR',
  // Batch 2 (23.6.2026)
  atsg: 'ATSG',
  bvg: 'BVG',
  uvg: 'UVG',
  avig: 'AVIG',
  rpg: 'RPG',
  usg: 'USG',
  vgg: 'VGG',
  bgfa: 'BGFA',
  kkg: 'KKG',
  gwg: 'GwG',
  // Batch 3 (23.6.2026)
  ivg: 'IVG',
  famzg: 'FamZG',
  sthg: 'StHG',
  aig: 'AIG',
  asylg: 'AsylG',
  glg: 'GlG',
  finmag: 'FINMAG',
  bgbb: 'BGBB',
  // Batch 4 (23.6.2026)
  ahvg: 'AHVG',
  bankg: 'BankG',
  hmg: 'HMG',
};

// ── Konsolidierungsdatum YYYYMMDD → ISO YYYY-MM-DD ───────────────────────────
function konsZuIso(kons: string): string {
  return `${kons.slice(0, 4)}-${kons.slice(4, 6)}-${kons.slice(6, 8)}`;
}

// ── Artikel-Label: token → 'Art. 335c' ───────────────────────────────────────
function artikelLabel(token: string): string {
  return 'Art. ' + token.replace(/_/g, '');
}

// ── Token-Sortierung: numerisch nach Artikel-Nr., dann Suffix ─────────────────
// '2' < '10' < '27' < '27_a' < '335' < '335_bis'. Deterministische, diff-stabile
// Reihenfolge der Snapshot-Einträge je Datei.
function sortiereTokens(tokens: string[]): string[] {
  const num = (t: string): number => {
    const m = t.match(/^(\d+)/);
    return m ? parseInt(m[1], 10) : Number.MAX_SAFE_INTEGER;
  };
  return [...tokens].sort((a, b) => {
    const d = num(a) - num(b);
    return d !== 0 ? d : a.localeCompare(b);
  });
}

// ── SHA256 des Block-Texts INKL. Aufzählungs-Items ───────────────────────────
// Der sha muss auch die items abdecken, sonst erkennt der Drift-Check
// Inhaltsänderungen in den lit./Ziff.-Punkten nicht. marke + text je item
// fliessen ein (Reihenfolge stabil).
function sha256Bloecke(
  bloecke: Array<{
    absatz: string | null;
    text: string;
    items?: Array<{ marke: string; text: string }>;
    tabelle?: Array<{ beschreibung: string; betrag: string }>;
    mehrspaltig?: { kopf?: string[]; zeilen: string[][] };
  }>,
): string {
  const zusammen = bloecke
    .map((b) => {
      const itemTeil = (b.items ?? []).map((i) => `${i.marke}\t${i.text}`).join('\n');
      const tabTeil = (b.tabelle ?? []).map((z) => `${z.beschreibung}\t${z.betrag}`).join('\n');
      const mTeil = b.mehrspaltig
        ? [(b.mehrspaltig.kopf ?? []).join('\t'), ...b.mehrspaltig.zeilen.map((z) => z.join('\t'))].join('\n')
        : '';
      return [b.text, itemTeil, tabTeil, mTeil].filter(Boolean).join('\n');
    })
    .join('\n');
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
  kantonFilter?: Set<string>,
  inventarOverride?: KantonInventarGruppe[],
): Promise<KantonCoverage> {
  // Phase-1 (FAHRPLAN-GESETZE-IMPORT-3TIER): mit --discovery liefert der Aufrufer
  // den Vollkorpus eines Kantons (alle Tier-A-Erlasse via LexFind) als Override
  // statt nur der tarif-zitierten Erlasse aus sammleKantonInventar().
  const inventar = (inventarOverride ?? sammleKantonInventar()).filter(
    (g) => !kantonFilter || kantonFilter.has(g.kanton),
  );
  const ausgangsDir = 'public/normtext/kanton';
  mkdirSync(ausgangsDir, { recursive: true });

  const cov: KantonCoverage = {
    totalSnapshots: 0,
    reportZeilen: [],
    nurPdf: [],
    tokenFehlt: [],
    fetchFehler: [],
  };

  // §8 (kein stilles Überschreiben): zweisprachige Kantone zitieren denselben
  // Erlass über die de- UND die fr-LexWork-URL — verschiedene Sprachfassungen,
  // also verschiedene Gruppen. Damit ihre Dateinamen/ids nicht kollidieren,
  // wird der Sprach-Suffix '-<lang>' angehängt, sobald eine (kanton,lawId)-
  // Kombination in mehr als einer Sprache vorkommt. Einsprachige Erlasse
  // bleiben unverändert (stabile ids).
  const sprachen = new Map<string, Set<string>>();
  for (const g of inventar) {
    const k = `${g.kanton}|${g.lawId}`;
    if (!sprachen.has(k)) sprachen.set(k, new Set());
    sprachen.get(k)!.add(g.lang);
  }
  const mehrsprachig = (g: { kanton: string; lawId: string }): boolean =>
    (sprachen.get(`${g.kanton}|${g.lawId}`)?.size ?? 0) > 1;
  const lawSchluessel = (g: { kanton: string; lawId: string; lang: 'de' | 'fr' }): string =>
    mehrsprachig(g) ? `${lawIdSafe(g.lawId)}-${g.lang}` : lawIdSafe(g.lawId);

  for (const g of inventar) {
    let ergebnis;
    try {
      ergebnis = await holeLexWork(g.host, g.lang, g.lawId);
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
    const schluessel = lawSchluessel(g); // filesafe, mit '-de'/'-fr' nur wenn zweisprachig

    // Vollabdeckung (§7, Auftrag David 16.6.2026): ALLE Artikel des Erlasses
    // speichern, nicht nur die zitierten Tokens. artikelLabel einheitlich aus dem
    // Quell-Designator (ergebnis.labels: «§ N»/«Art. N»), NICHT aus dem rohen
    // Tarif-Zitat. Token-Reihenfolge stabil sortiert (Artikel-Nr.).
    for (const token of sortiereTokens(Object.keys(ergebnis.artikel))) {
      const treffer = ergebnis.artikel[token];
      if (!treffer || treffer.bloecke.length === 0) continue;
      const id = `kanton/${g.kanton}/${schluessel}/art_${token}`;
      const snapshot: NormSnapshot = {
        id,
        ebene: 'kanton',
        quelle: g.kanton,
        erlass,
        artikel: token,
        artikelLabel: ergebnis.labels[token] ?? artikelLabel(token),
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

    // §8-Sichtbarkeit: zitierte Tokens, die im extrahierten Erlass FEHLEN
    // (echte Lücke — der zitierte Artikel wurde nicht gefunden), weiterhin melden.
    for (const art of g.artikel) {
      if (!(art.token in ergebnis.artikel)) {
        cov.tokenFehlt.push({
          kanton: g.kanton,
          lawId: g.lawId,
          token: art.token,
          label: art.label,
        });
      }
    }

    // Gruppe ohne einen einzigen extrahierten Artikel (alle Tokens nicht im
    // LexWork-Erlass gefunden) → KEINE Datei schreiben. Sonst entstünde eine
    // leere Snapshot-Datei ohne quelleUrl, die nicht ins Manifest aufgenommen
    // wird (baueManifest überspringt eintragslose Dateien) → Manifest-
    // Inkonsistenz. Der token-nicht-gefunden-Fall ist bereits über cov.tokenFehlt
    // (und die BEKANNTE_LUECKEN-Liste) sichtbar gemacht (§8).
    if (snapshotListe.length === 0) {
      cov.reportZeilen.push(
        `  ${g.kanton}-${schluessel.padEnd(14)} 0 Snapshots → keine Datei (alle Tokens nicht im Erlass)`,
      );
      continue;
    }

    const datei: NormSnapshotDatei = { erzeugt: abgerufen, eintraege: snapshotListe };
    const ausgabePfad = `${ausgangsDir}/${g.kanton}-${schluessel}.json`;
    writeFileSync(ausgabePfad, stabelesJson(datei), 'utf8');

    cov.totalSnapshots += snapshotListe.length;
    cov.reportZeilen.push(
      `  ${g.kanton}-${schluessel.padEnd(14)} ${snapshotListe.length} Snapshots → ${ausgabePfad}`,
    );
  }

  return cov;
}

// ── lawIdSafe für HTM-Quellen: letzter Pfadteil ohne .htm ────────────────────
// 'https://silgeneve.ch/legis/data/rsg_e1_05p10.htm' → 'rsg_e1_05p10'
// 'https://rsn.ne.ch/DATA/.../htm/164.1.htm'          → '164.1'
// 'https://m3.ti.ch/.../pdfatto/atto/137'             → 'ti-137' (eindeutiger,
//   nicht-numerischer Dateiname; kongruent zum früheren TI-PDF-Schema)
function htmLawIdSafe(url: string): string {
  const ti = url.match(/\/pdfatto\/atto\/(\d+)$/i);
  if (ti) return `ti-${ti[1]}`;
  const letzter = url.split('/').pop() ?? url;
  return letzter.replace(/\.html?$/i, '');
}

// ── HTM-Befunde (NE/GE) ──────────────────────────────────────────────────────
interface HtmCoverage {
  totalSnapshots: number;
  reportZeilen: string[];
  tokenFehlt: Array<{ kanton: string; lawIdSafe: string; token: string; label: string }>;
  fetchFehler: Array<{ kanton: string; url: string; fehler: string }>;
}

// ── HTM-Snapshots (NE/GE, Word-Export-HTM) erzeugen ──────────────────────────
async function erzeugeHtmSnapshots(
  abgerufen: string,
  goldenIndex: Record<string, string>,
  kantonFilter?: Set<string>,
): Promise<HtmCoverage> {
  const inventar = sammleHtmInventar().filter(
    (g) => !kantonFilter || kantonFilter.has(g.kanton),
  );
  const ausgangsDir = 'public/normtext/kanton';
  mkdirSync(ausgangsDir, { recursive: true });

  const cov: HtmCoverage = {
    totalSnapshots: 0,
    reportZeilen: [],
    tokenFehlt: [],
    fetchFehler: [],
  };

  for (const g of inventar) {
    const safe = htmLawIdSafe(g.quelleUrl);
    let ergebnis;
    try {
      ergebnis = await holeHtm(g.quelleUrl, g.profil);
    } catch (e) {
      const fehler = e instanceof Error ? e.message : String(e);
      cov.fetchFehler.push({ kanton: g.kanton, url: g.quelleUrl, fehler });
      continue;
    }

    const erlass = erlassBezeichnung('', g.erlassName, g.erlassNr);
    const snapshotListe: NormSnapshot[] = [];

    // Vollabdeckung (§7): ALLE Artikel des Erlasses speichern; Label einheitlich
    // aus dem Adapter (ergebnis.labels: «Art. N» für NE/GE/TI).
    for (const token of sortiereTokens(Object.keys(ergebnis.artikel))) {
      const treffer = ergebnis.artikel[token];
      if (!treffer || treffer.bloecke.length === 0) continue;
      const id = `kanton/${g.kanton}/${safe}/art_${token}`;
      const snapshot: NormSnapshot = {
        id,
        ebene: 'kanton',
        quelle: g.kanton,
        erlass,
        artikel: token,
        artikelLabel: ergebnis.labels[token] ?? artikelLabel(token),
        bloecke: treffer.bloecke,
        stand: ergebnis.meta.stand,
        // HTM-Quelle: die exakte Quell-URL (= Manifest-Key, wie im Tarif-Eintrag;
        // TI: die pdfatto/atto-URL — die HTML-Seite wird im Adapter abgeleitet).
        quelleUrl: g.quelleUrl,
        abgerufen,
        // Drift-Token (§7 d): kein version_uid → quelleHash des Volltexts.
        fassungsToken: ergebnis.meta.quelleHash,
        sha: sha256Bloecke(treffer.bloecke),
      };
      snapshotListe.push(snapshot);
      goldenIndex[id] = snapshot.sha;
    }

    // §8-Sichtbarkeit: zitierte Tokens, die im Erlass nicht gefunden wurden.
    for (const art of g.artikel) {
      if (!(art.token in ergebnis.artikel)) {
        cov.tokenFehlt.push({
          kanton: g.kanton,
          lawIdSafe: safe,
          token: art.token,
          label: art.label,
        });
      }
    }

    if (snapshotListe.length === 0) {
      cov.reportZeilen.push(
        `  ${g.kanton}-${safe.padEnd(16)} 0 Snapshots → keine Datei (alle Tokens nicht im Erlass)`,
      );
      continue;
    }

    const datei: NormSnapshotDatei = { erzeugt: abgerufen, eintraege: snapshotListe };
    const ausgabePfad = `${ausgangsDir}/${g.kanton}-${safe}.json`;
    writeFileSync(ausgabePfad, stabelesJson(datei), 'utf8');

    cov.totalSnapshots += snapshotListe.length;
    cov.reportZeilen.push(
      `  ${g.kanton}-${safe.padEnd(16)} ${snapshotListe.length} Snapshots → ${ausgabePfad}`,
    );
  }

  return cov;
}

// lawIdSafe für ZH aus der zhlex-Registry-URL: …/erlass-211_11-… → «211.11».
function zhLawIdSafe(url: string): string {
  const m = url.match(/\/erlass-([^-]+)-/);
  return m ? m[1].replace(/_/g, '.') : url.replace(/[^a-z0-9.]+/gi, '_');
}

// ── ZH-Snapshots (zhlex Text-PDF via pdfjs) erzeugen ─────────────────────────
// Spiegelt die HTM-Phase: Inventar → holeZhPdf (Registry→notes.zh.ch-PDF) →
// NormSnapshot. quelleUrl = zhlex-Registry-URL (= Manifest-Key). Drift via
// quelleHash (kein version_uid), §7 d.
async function erzeugeZhPdfSnapshots(
  abgerufen: string,
  goldenIndex: Record<string, string>,
  kantonFilter?: Set<string>,
): Promise<HtmCoverage> {
  const inventar = sammleZhPdfInventar().filter(
    (g) => !kantonFilter || kantonFilter.has(g.kanton),
  );
  const ausgangsDir = 'public/normtext/kanton';
  mkdirSync(ausgangsDir, { recursive: true });

  const cov: HtmCoverage = { totalSnapshots: 0, reportZeilen: [], tokenFehlt: [], fetchFehler: [] };

  for (const g of inventar) {
    const safe = zhLawIdSafe(g.quelleUrl);
    let ergebnis;
    try {
      ergebnis = await holeZhPdf(g.quelleUrl);
    } catch (e) {
      const fehler = e instanceof Error ? e.message : String(e);
      cov.fetchFehler.push({ kanton: g.kanton, url: g.quelleUrl, fehler });
      continue;
    }

    const erlass = erlassBezeichnung('', g.erlassName, g.erlassNr);
    const snapshotListe: NormSnapshot[] = [];

    // Vollabdeckung (§7): ALLE Artikel; Label einheitlich «§ N» (ergebnis.labels).
    for (const token of sortiereTokens(Object.keys(ergebnis.artikel))) {
      const treffer = ergebnis.artikel[token];
      if (!treffer || treffer.bloecke.length === 0) continue;
      const id = `kanton/${g.kanton}/${safe}/art_${token}`;
      const snapshot: NormSnapshot = {
        id,
        ebene: 'kanton',
        quelle: g.kanton,
        erlass,
        artikel: token,
        artikelLabel: ergebnis.labels[token] ?? artikelLabel(token),
        bloecke: treffer.bloecke,
        stand: ergebnis.meta.stand,
        quelleUrl: g.quelleUrl,
        abgerufen,
        fassungsToken: ergebnis.meta.quelleHash,
        sha: sha256Bloecke(treffer.bloecke),
      };
      snapshotListe.push(snapshot);
      goldenIndex[id] = snapshot.sha;
    }

    // §8-Sichtbarkeit: zitierte Tokens, die im Erlass nicht gefunden wurden.
    for (const art of g.artikel) {
      if (!(art.token in ergebnis.artikel)) {
        cov.tokenFehlt.push({ kanton: g.kanton, lawIdSafe: safe, token: art.token, label: art.label });
      }
    }

    if (snapshotListe.length === 0) {
      cov.reportZeilen.push(`  ${g.kanton}-${safe.padEnd(16)} 0 Snapshots → keine Datei (alle Tokens nicht im Erlass)`);
      continue;
    }

    const datei: NormSnapshotDatei = { erzeugt: abgerufen, eintraege: snapshotListe };
    const ausgabePfad = `${ausgangsDir}/${g.kanton}-${safe}.json`;
    writeFileSync(ausgabePfad, stabelesJson(datei), 'utf8');
    cov.totalSnapshots += snapshotListe.length;
    cov.reportZeilen.push(`  ${g.kanton}-${safe.padEnd(16)} ${snapshotListe.length} Snapshots → ${ausgabePfad}`);
  }

  return cov;
}

// lawIdSafe für die generischen PDF-Quellen (SZ/TI/VD/JU): ein stabiler,
// dateisicherer Schlüssel je quelleUrl.
//   SZ  …/assets/<n>/173_111.pdf          → «173.111»
//   TI  …/pdfatto/atto/137                → «ti-137»
//   VD  …/tolv/105539/fr                  → «vd-105539»
//   JU  …viewdocument.html?idn=20021&id=34172… → «ju-20021-34172»
function pdfLawIdSafe(profil: PdfProfilName, url: string): string {
  if (profil === 'sz') {
    const m = url.match(/\/(\d+_\d+)\.pdf$/i);
    if (m) return m[1].replace(/_/g, '.');
    const t = url.match(/\/tolv\/(\d+)\//i); // SZ-lexfind (82040/de)
    if (t) return t[1];
  }
  if (profil === 'ti') {
    const a = url.match(/\/pdfatto\/atto\/(\d+)/i);
    if (a) return `ti-${a[1]}`;
    const t = url.match(/\/tolv\/(\d+)\//i); // TI-lexfind (125101/it)
    if (t) return `ti-${t[1]}`;
  }
  if (profil === 'vd') {
    const m = url.match(/\/tolv\/(\d+)\//i);
    if (m) return `vd-${m[1]}`;
  }
  // Generische OrdoLex-Familie: /api/<lang>/versions/<N>/pdf_file → «<N>»
  // (kanton-präfix wird vom Aufrufer angehängt → eindeutig je Kanton);
  // lexfind /tolv/<id>/<lang> → «<id>».
  if (profil === 'olexAt' || profil === 'olexPar') {
    const v = url.match(/\/versions\/(\d+)\/pdf_file/i);
    if (v) return v[1];
    const t = url.match(/\/tolv\/(\d+)\//i);
    if (t) return t[1];
  }
  if (profil === 'ju') {
    const idn = url.match(/[?&]idn=(\d+)/i);
    const id = url.match(/[?&]id=(\d+)/i);
    // Die Download-Variante (…&download=1) ist eine EIGENE Tarif-quelleUrl (=
    // eigener Manifest-Key) — sie bekommt einen eigenen safe-Dateinamen, damit
    // sie die Nicht-Download-Variante NICHT überschreibt (beide Keys müssen ins
    // Manifest; identischer Inhalt, aber distinct quelleUrl).
    const dl = /[?&]download=1/i.test(url) ? '-dl' : '';
    if (idn && id) return `ju-${idn[1]}-${id[1]}${dl}`;
  }
  return url.replace(/[^a-z0-9.]+/gi, '_');
}

// ── PDF-Snapshots (SZ/TI/VD/JU, generischer Einzelspalten-PDF-Adapter) ────────
// Spiegelt die ZH-Phase: Inventar → holePdf (quelleUrl je Profil → PDF) →
// NormSnapshot. quelleUrl = Tarif-quelleUrl (= Manifest-Key). Drift via
// quelleHash (kein version_uid), §7 d.
async function erzeugePdfSnapshots(
  abgerufen: string,
  goldenIndex: Record<string, string>,
  kantonFilter?: Set<string>,
): Promise<HtmCoverage> {
  const inventar = sammlePdfInventar().filter(
    (g) => !kantonFilter || kantonFilter.has(g.kanton),
  );
  const ausgangsDir = 'public/normtext/kanton';
  mkdirSync(ausgangsDir, { recursive: true });

  const cov: HtmCoverage = { totalSnapshots: 0, reportZeilen: [], tokenFehlt: [], fetchFehler: [] };

  // §8 (kein stilles Überschreiben): mehrere Tarif-quelleUrls können DENSELBEN
  // Erlass meinen (JU: «…&download=1» vs. ohne) → gleicher pdfLawIdSafe → gleiche
  // Datei. Statt der zweiten Gruppe die erste zu überschreiben (und ihre Artikel
  // + Manifest-Key zu verlieren), gruppieren wir nach safe-Dateinamen und führen
  // die Gruppen zusammen: ein Fetch je quelleUrl, je Artikel ein Snapshot, dessen
  // quelleUrl die ORIGINALE Tarif-quelleUrl trägt (→ baueManifest legt für jede
  // distinct quelleUrl einen Manifest-Eintrag auf dieselbe Datei an).
  const nachDatei = new Map<string, typeof inventar>();
  for (const g of inventar) {
    const safe = `${g.kanton}-${pdfLawIdSafe(g.profil, g.quelleUrl)}`;
    let liste = nachDatei.get(safe);
    if (!liste) {
      liste = [];
      nachDatei.set(safe, liste);
    }
    liste.push(g);
  }

  for (const [dateiBasis, gruppen] of nachDatei) {
    const safe = dateiBasis.replace(/^[A-Z]{2}-/, '');
    const kanton = gruppen[0].kanton;
    const snapshotListe: NormSnapshot[] = [];
    const gesehenTokens = new Set<string>();

    for (const g of gruppen) {
      let ergebnis;
      try {
        ergebnis = await holePdf(g.quelleUrl, PDF_PROFILE[g.profil]);
      } catch (e) {
        const fehler = e instanceof Error ? e.message : String(e);
        cov.fetchFehler.push({ kanton: g.kanton, url: g.quelleUrl, fehler });
        continue;
      }
      const erlass = erlassBezeichnung('', g.erlassName, g.erlassNr);
      // Vollabdeckung: ALLE Artikel der Quelle; Label einheitlich aus dem Profil-
      // Marker (ergebnis.labels). Pro (Datei, token, quelleUrl) genau ein Eintrag:
      // verschiedene quelleUrls zum selben token (JU-Download-Variante) erzeugen je
      // einen Manifest-fähigen Eintrag; identische werden entdoppelt.
      for (const token of sortiereTokens(Object.keys(ergebnis.artikel))) {
        const treffer = ergebnis.artikel[token];
        if (!treffer || treffer.bloecke.length === 0) continue;
        const dedupeKey = `${g.quelleUrl} ${token}`;
        if (gesehenTokens.has(dedupeKey)) continue;
        gesehenTokens.add(dedupeKey);
        const id = `kanton/${g.kanton}/${safe}/art_${token}`;
        const snapshot: NormSnapshot = {
          id,
          ebene: 'kanton',
          quelle: g.kanton,
          erlass,
          artikel: token,
          artikelLabel: ergebnis.labels[token] ?? artikelLabel(token),
          bloecke: treffer.bloecke,
          stand: ergebnis.meta.stand,
          quelleUrl: g.quelleUrl,
          abgerufen,
          fassungsToken: ergebnis.meta.quelleHash,
          sha: sha256Bloecke(treffer.bloecke),
        };
        snapshotListe.push(snapshot);
        goldenIndex[id] = snapshot.sha;
      }

      // Sichtbarkeit: zitierte Tokens, die im Erlass nicht gefunden wurden.
      for (const art of g.artikel) {
        if (!(art.token in ergebnis.artikel)) {
          cov.tokenFehlt.push({ kanton: g.kanton, lawIdSafe: safe, token: art.token, label: art.label });
        }
      }
    }

    if (snapshotListe.length === 0) {
      cov.reportZeilen.push(`  ${kanton}-${safe.padEnd(16)} 0 Snapshots → keine Datei (alle Tokens nicht im Erlass / Fetch-Fehler)`);
      continue;
    }

    const datei: NormSnapshotDatei = { erzeugt: abgerufen, eintraege: snapshotListe };
    const ausgabePfad = `${ausgangsDir}/${kanton}-${safe}.json`;
    writeFileSync(ausgabePfad, stabelesJson(datei), 'utf8');
    cov.totalSnapshots += snapshotListe.length;
    cov.reportZeilen.push(`  ${kanton}-${safe.padEnd(16)} ${snapshotListe.length} Snapshots → ${ausgabePfad}`);
  }

  return cov;
}

// ── Hauptprogramm ─────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const abgerufen = leseDatum();

  // ── Nur-ZH-Modus (--nur=zh) ─────────────────────────────────────────────────
  // Regeneriert NUR die ZH-PDF-Snapshots (z. B. nach einer Extraktions-
  // Verbesserung wie der Spalten-Lücken-Erkennung 20.6.2026), ohne Bund/übrige
  // Kantone erneut über das Netz zu ziehen — so bleibt der Diff auf ZH
  // beschränkt (kein stiller Upstream-Drift, §8). Manifest/Register werden aus
  // der Platte neu gebaut (alle Dateien, nur ZH verändert); der Golden-Index
  // wird GEMISCHT: alle Nicht-ZH-Einträge bleiben, kanton/ZH/* werden ersetzt.
  if (process.argv.includes('--nur=zh')) {
    const goldenIndex: Record<string, string> = {};
    console.log(`\n[Normtext-Snapshot] --nur=zh, datum=${abgerufen}`);
    const zhCov = await erzeugeZhPdfSnapshots(abgerufen, goldenIndex);
    for (const z of zhCov.reportZeilen) console.log(z);
    console.log(`\nGesamt ZH: ${zhCov.totalSnapshots} Snapshots; fetch-Fehler: ${zhCov.fetchFehler.length}`);
    for (const f of zhCov.fetchFehler) console.log(`  ${f.kanton} ${f.url}: ${f.fehler}`);

    // Manifest + Register aus der Platte neu (alle Snapshots; nur ZH verändert).
    const kantonManifest = baueManifest('public/normtext/kanton');
    const kantonManifestSortiert: Record<string, string> = {};
    for (const k of Object.keys(kantonManifest).sort()) kantonManifestSortiert[k] = kantonManifest[k];
    writeFileSync('public/normtext/kanton/index.json', stabelesJson(kantonManifestSortiert), 'utf8');

    const browse = baueBrowseManifest(abgerufen);
    writeFileSync('public/normtext/register.json', JSON.stringify(browse, null, 2) + '\n', 'utf8');

    // Golden mischen: Nicht-ZH bewahren, kanton/ZH/* ersetzen.
    let bestand: Record<string, string>;
    try {
      bestand = JSON.parse(readFileSync('golden/normtext-snapshot.json', 'utf8')) as Record<string, string>;
    } catch {
      throw new Error('--nur=zh: golden/normtext-snapshot.json fehlt — ein Voll-Lauf muss zuerst gelaufen sein.');
    }
    const gemischt: Record<string, string> = {};
    for (const k of Object.keys(bestand)) if (!k.startsWith('kanton/ZH/')) gemischt[k] = bestand[k];
    for (const k of Object.keys(goldenIndex)) gemischt[k] = goldenIndex[k];
    const sortiert: Record<string, string> = {};
    for (const k of Object.keys(gemischt).sort()) sortiert[k] = gemischt[k];
    mkdirSync('golden', { recursive: true });
    writeFileSync('golden/normtext-snapshot.json', stabelesJson(sortiert), 'utf8');
    console.log(`\n[--nur=zh] Fertig. Register ${browse.erlasse.length} Erlasse; Golden ${Object.keys(sortiert).length} Einträge (${Object.keys(goldenIndex).length} ZH ersetzt).`);
    return;
  }

  // ── Gezielter Kantons-Modus (--nur=kanton --kanton=AR,NW) ───────────────────
  // Regeneriert NUR die Snapshots der genannten Kantone (über ALLE kantonalen
  // Phasen: LexWork/HTM/ZH/PDF, je nach dem, wo der Kanton geführt wird), ohne
  // Bund oder die übrigen Kantone erneut über das Netz zu ziehen — so bleibt der
  // Diff auf die gewünschten Kantone beschränkt (kein stiller Upstream-Drift, §8;
  // z. B. nach einem Adapter-Fix wie AR-Anhang-Ziffern / NW-§18-Sub-Staffel
  // 22.6.2026). Golden wird GEMISCHT: alle Einträge ausser kanton/<K>/* bleiben,
  // die der genannten Kantone werden ersetzt. Manifest/Register aus der Platte neu.
  if (process.argv.includes('--nur=kanton')) {
    const kantonArg = process.argv.find((a) => a.startsWith('--kanton='));
    if (!kantonArg) {
      throw new Error('--nur=kanton verlangt --kanton=XX[,YY] (z. B. --kanton=AR,NW)');
    }
    const kantone = new Set(
      kantonArg.slice('--kanton='.length).split(',').map((s) => s.trim().toUpperCase()).filter(Boolean),
    );
    const goldenIndex: Record<string, string> = {};
    // Phase-1 (FAHRPLAN-GESETZE-IMPORT-3TIER): mit --discovery wird der Kanton-
    // Vollkorpus via LexFind enumeriert (Tier A) statt nur tarif-zitierte Erlasse.
    // Dann läuft NUR die LexWork-Phase (Discovery liefert ausschliesslich Tier-A-
    // LexWork-Quellen); HTM/ZH/PDF entfallen.
    const discovery = process.argv.includes('--discovery');
    console.log(`\n[Normtext-Snapshot] --nur=kanton ${[...kantone].join(',')}${discovery ? ' --discovery' : ''}, datum=${abgerufen}`);

    let cov: KantonCoverage;
    if (discovery) {
      const FR_KANTONE = new Set(['FR', 'VS', 'GE', 'NE', 'JU', 'VD']);
      const gruppen: KantonInventarGruppe[] = [];
      for (const k of kantone) {
        const lang = FR_KANTONE.has(k) ? 'fr' : 'de';
        const erlasse = await enumeriereKanton(k, { lang, nurInKraft: true });
        const routing = discoveryZuInventar(erlasse, k);
        console.log(
          `  Discovery ${k}: ${erlasse.length} Erlasse → ${routing.gruppen.length} Tier-A-Gruppen ` +
            `(${routing.uebersprungen.length} übersprungen)`,
        );
        gruppen.push(...routing.gruppen);
      }
      cov = await erzeugeKantonsSnapshots(abgerufen, goldenIndex, kantone, gruppen);
    } else {
      cov = await erzeugeKantonsSnapshots(abgerufen, goldenIndex, kantone);
    }
    for (const z of cov.reportZeilen) console.log(z);
    const htmCov = discovery ? null : await erzeugeHtmSnapshots(abgerufen, goldenIndex, kantone);
    if (htmCov) for (const z of htmCov.reportZeilen) console.log(z);
    const zhCov = discovery ? null : await erzeugeZhPdfSnapshots(abgerufen, goldenIndex, kantone);
    if (zhCov) for (const z of zhCov.reportZeilen) console.log(z);
    const pdfCov = discovery ? null : await erzeugePdfSnapshots(abgerufen, goldenIndex, kantone);
    if (pdfCov) for (const z of pdfCov.reportZeilen) console.log(z);

    const alleFetchFehler = [
      ...cov.fetchFehler.map((f) => `LexWork ${f.kanton} ${f.lawId}: ${f.fehler}`),
      ...(htmCov?.fetchFehler ?? []).map((f) => `HTM ${f.kanton} ${f.url}: ${f.fehler}`),
      ...(zhCov?.fetchFehler ?? []).map((f) => `ZH ${f.kanton} ${f.url}: ${f.fehler}`),
      ...(pdfCov?.fetchFehler ?? []).map((f) => `PDF ${f.kanton} ${f.url}: ${f.fehler}`),
    ];
    console.log(`\nfetch-Fehler: ${alleFetchFehler.length}`);
    for (const f of alleFetchFehler) console.log(`  ${f}`);

    // Manifest + Register aus der Platte neu (alle Dateien; nur die Ziel-Kantone verändert).
    const kantonManifest = baueManifest('public/normtext/kanton');
    const kantonManifestSortiert: Record<string, string> = {};
    for (const k of Object.keys(kantonManifest).sort()) kantonManifestSortiert[k] = kantonManifest[k];
    writeFileSync('public/normtext/kanton/index.json', stabelesJson(kantonManifestSortiert), 'utf8');

    const browse = baueBrowseManifest(abgerufen);
    writeFileSync('public/normtext/register.json', JSON.stringify(browse, null, 2) + '\n', 'utf8');

    // Golden mischen: Nicht-Ziel-Kantone bewahren, kanton/<K>/* ersetzen.
    let bestand: Record<string, string>;
    try {
      bestand = JSON.parse(readFileSync('golden/normtext-snapshot.json', 'utf8')) as Record<string, string>;
    } catch {
      throw new Error('--nur=kanton: golden/normtext-snapshot.json fehlt — ein Voll-Lauf muss zuerst gelaufen sein.');
    }
    // §8 (kein stiller Datenverlust): Ein Ziel-Kanton, der in DIESEM Lauf 0
    // Snapshots lieferte (Fetch-Fehler, alle Tokens fehlend), darf seine
    // bestehenden Golden-Einträge NICHT verlieren. Darum nur Ziel-Kantone
    // ersetzen, die tatsächlich frische Einträge erzeugt haben; fehlgeschlagene
    // behalten den Altbestand und werden laut gewarnt.
    const erfolgKantone = new Set(Object.keys(goldenIndex).map((k) => k.split('/')[1]));
    const fehlgeschlagen = [...kantone].filter((k) => !erfolgKantone.has(k));
    if (fehlgeschlagen.length > 0) {
      console.log(
        `\n⚠️  WARN (§8): Ziel-Kantone OHNE neue Snapshots (Fetch-Fehler?): ${fehlgeschlagen.join(', ')} — ` +
          'ihr Golden-Altbestand bleibt UNVERÄNDERT (kein stiller Verlust).',
      );
    }
    const istErsetzbar = (key: string): boolean => {
      const k = key.split('/')[1];
      return kantone.has(k) && erfolgKantone.has(k);
    };
    const gemischt: Record<string, string> = {};
    for (const k of Object.keys(bestand)) if (!istErsetzbar(k)) gemischt[k] = bestand[k];
    for (const k of Object.keys(goldenIndex)) gemischt[k] = goldenIndex[k];
    const sortiert: Record<string, string> = {};
    for (const k of Object.keys(gemischt).sort()) sortiert[k] = gemischt[k];
    mkdirSync('golden', { recursive: true });
    writeFileSync('golden/normtext-snapshot.json', stabelesJson(sortiert), 'utf8');
    const zielN = Object.keys(goldenIndex).length;
    console.log(
      `\n[--nur=kanton] Fertig. ${zielN} Snapshots der Kantone ${[...kantone].join(',')} regeneriert; ` +
        `Golden ${Object.keys(sortiert).length} Einträge gesamt. Register ${browse.erlasse.length} Erlasse.`,
    );
    return;
  }

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

  // Übersprungene Token (gesetz → token)
  const uebersprungen: Array<{ gesetz: string; token: string }> = [];

  // Report-Zeilen
  const reportZeilen: string[] = [];
  let totalSnapshots = 0;

  for (const eintrag of eintraege) {
    const { name, eli, konsolidierung } = eintrag;
    const gesetzKey = name.toUpperCase();
    const erlass = ERLASS_MAP[name] ?? gesetzKey;
    const stand = konsZuIso(konsolidierung);
    const htmlPfad = `/tmp/${name}.html`;

    let html: string;
    try {
      html = readFileSync(htmlPfad, 'utf8');
    } catch {
      console.error(`[FEHLER] Kann ${htmlPfad} nicht lesen — überspringe ${gesetzKey}`);
      // Überspringe alle Tokens für dieses Gesetz
      uebersprungen.push({ gesetz: gesetzKey, token: '(alle — HTML fehlt)' });
      continue;
    }

    // Alle Artikel-Token aus dem HTML extrahieren (führende Ziffer = Pflicht)
    const tokens = alleArtikelTokens(html);
    const snapshotListe: NormSnapshot[] = [];

    for (const token of tokens) {
      const ankerVoll = `art_${token}`;
      const extrakt = extrahiereArtikel(html, token);

      if (extrakt === null || extrakt.bloecke.length === 0) {
        // Kein extrahierbarer Inhalt → überspringen (kein leerer Snapshot)
        uebersprungen.push({ gesetz: gesetzKey, token: ankerVoll });
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
    console.log('\n── Übersprungene Token (kein extrahierbarer Inhalt) ──────────');
    for (const u of uebersprungen) {
      console.log(`  ${u.gesetz.padEnd(12)} ${u.token}`);
    }
    console.log(`\nTotal übersprungen: ${uebersprungen.length}`);
  } else {
    console.log('\nKeine Token übersprungen.');
  }

  // ── Nur-Bund-Modus (--nur=bund) ─────────────────────────────────────────────
  // Erlaubt das Nachführen NUR der Bund-Snapshots, ohne die kantonalen Quellen
  // (LexWork/ZH/HTM/PDF) erneut über das Netz zu ziehen — so können neue
  // Bundesgesetze ergänzt werden, ohne verifizierte Kantons-Snapshots zu
  // riskieren. Der Golden-Index wird GEMISCHT: die kantonalen Einträge des
  // bestehenden golden/normtext-snapshot.json bleiben unangetastet, nur die
  // bund/*-Schlüssel werden ersetzt. Kanton-Manifest bleibt unverändert.
  if (process.argv.includes('--nur=bund')) {
    const goldenPfad = 'golden/normtext-snapshot.json';
    let bestand: Record<string, string>;
    try {
      bestand = JSON.parse(readFileSync(goldenPfad, 'utf8')) as Record<string, string>;
    } catch {
      throw new Error(
        `--nur=bund: ${goldenPfad} fehlt — ein Voll-Lauf (npm run normtext) muss zuerst die kantonalen Einträge erzeugt haben.`,
      );
    }
    const gemischt: Record<string, string> = {};
    // kantonale (und sonstige Nicht-bund-) Einträge unverändert übernehmen
    for (const k of Object.keys(bestand)) {
      if (!k.startsWith('bund/')) gemischt[k] = bestand[k];
    }
    // frische bund/*-Einträge ergänzen
    for (const k of Object.keys(goldenIndex)) gemischt[k] = goldenIndex[k];
    const sortiert: Record<string, string> = {};
    for (const k of Object.keys(gemischt).sort()) sortiert[k] = gemischt[k];
    mkdirSync('golden', { recursive: true });
    writeFileSync(goldenPfad, stabelesJson(sortiert), 'utf8');
    const bundN = Object.keys(goldenIndex).length;
    console.log(
      `\n[--nur=bund] Kantons-/HTM-/ZH-/PDF-Phasen ÜBERSPRUNGEN. Golden gemischt: ` +
        `${bundN} bund/* aktualisiert, ${Object.keys(sortiert).length - bundN} kantonale Einträge bewahrt.`,
    );
    return;
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
  console.log(`Fallback-Quellen (Nicht-LexWork/Nicht-HTM, kein Snapshot): ${fallback.length} in ${fallbackKantone.length} Kantonen`);
  console.log(`  Kantone: ${fallbackKantone.join(', ')}`);

  // ── HTM-Phase (NE/GE, Word-Export-HTM) ───────────────────────────────────
  console.log('\n[Normtext-Snapshot] HTM-Phase (NE/GE, Word-Export) …');
  const htmCov = await erzeugeHtmSnapshots(abgerufen, goldenIndex);

  console.log('\n── HTM-Snapshots (NE/GE) ─────────────────────────────────────');
  for (const z of htmCov.reportZeilen) console.log(z);
  console.log(`\nGesamt HTM: ${htmCov.totalSnapshots} Snapshots in ${htmCov.reportZeilen.length} Zeile(n)`);
  console.log(`Token nicht im Erlass (HTM): ${htmCov.tokenFehlt.length}`);
  for (const t of htmCov.tokenFehlt) console.log(`  ${t.kanton} ${t.lawIdSafe} art_${t.token} (${t.label})`);
  console.log(`fetch-Fehler (HTM): ${htmCov.fetchFehler.length}`);
  for (const f of htmCov.fetchFehler) console.log(`  ${f.kanton} ${f.url}: ${f.fehler}`);

  // ── ZH-Phase (zhlex Text-PDF via pdfjs) ──────────────────────────────────
  console.log('\n[Normtext-Snapshot] ZH-Phase (zhlex Text-PDF) …');
  const zhCov = await erzeugeZhPdfSnapshots(abgerufen, goldenIndex);
  console.log('\n── ZH-Snapshots (zhlex PDF) ──────────────────────────────────');
  for (const z of zhCov.reportZeilen) console.log(z);
  console.log(`\nGesamt ZH: ${zhCov.totalSnapshots} Snapshots in ${zhCov.reportZeilen.length} Zeile(n)`);
  console.log(`Token nicht im Erlass (ZH): ${zhCov.tokenFehlt.length}`);
  for (const t of zhCov.tokenFehlt) console.log(`  ${t.kanton} ${t.lawIdSafe} art_${t.token} (${t.label})`);
  console.log(`fetch-Fehler (ZH): ${zhCov.fetchFehler.length}`);
  for (const f of zhCov.fetchFehler) console.log(`  ${f.kanton} ${f.url}: ${f.fehler}`);

  // ── PDF-Phase (SZ/TI/VD/JU, generischer Einzelspalten-PDF-Adapter) ───────
  console.log('\n[Normtext-Snapshot] PDF-Phase (SZ/TI/VD/JU Text-PDF) …');
  const pdfCov = await erzeugePdfSnapshots(abgerufen, goldenIndex);
  console.log('\n── PDF-Snapshots (SZ/TI/VD/JU) ───────────────────────────────');
  for (const z of pdfCov.reportZeilen) console.log(z);
  console.log(`\nGesamt PDF: ${pdfCov.totalSnapshots} Snapshots in ${pdfCov.reportZeilen.length} Zeile(n)`);
  console.log(`Token nicht im Erlass (PDF): ${pdfCov.tokenFehlt.length}`);
  for (const t of pdfCov.tokenFehlt) console.log(`  ${t.kanton} ${t.lawIdSafe} art_${t.token} (${t.label})`);
  console.log(`fetch-Fehler (PDF): ${pdfCov.fetchFehler.length}`);
  for (const f of pdfCov.fetchFehler) console.log(`  ${f.kanton} ${f.url}: ${f.fehler}`);

  // ── Kanton-Manifest (quelleUrl → Dateiname) aktualisieren ────────────────
  const kantonManifest = baueManifest('public/normtext/kanton');
  const kantonManifestSortiert: Record<string, string> = {};
  for (const k of Object.keys(kantonManifest).sort()) {
    kantonManifestSortiert[k] = kantonManifest[k];
  }
  writeFileSync(
    'public/normtext/kanton/index.json',
    stabelesJson(kantonManifestSortiert),
    'utf8',
  );
  console.log(
    `\nKanton-Manifest: public/normtext/kanton/index.json (${Object.keys(kantonManifestSortiert).length} Einträge)`,
  );

  // ── Browse-Manifest (Rubrik V «Gesetze»): Register × Snapshots ───────────
  const browse = baueBrowseManifest(abgerufen);
  writeFileSync(
    'public/normtext/register.json',
    JSON.stringify(browse, null, 2) + '\n',
    'utf8',
  );
  console.log(
    `\nBrowse-Manifest: public/normtext/register.json (${browse.erlasse.length} Erlasse)`,
  );

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
