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
import {
  extrahiereArtikel,
  alleArtikelTokens,
  alleSchlussteilAnker,
  extrahiereArtikelAusAnker,
  ankerZuToken,
  schlussteilLabelSuffix,
  alleAnhangAnker,
  extrahiereAnhang,
  anhangLabelVonAnker,
} from './normtext/extrahiere-fedlex.ts';
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
import pLimit from 'p-limit';
import { holeLexWork } from './normtext/adapter-lexwork.ts';
import { holeHtm } from './normtext/adapter-htm.ts';
import { holeZhPdf } from './normtext/adapter-zh-pdf.ts';
import { holePdf, PDF_PROFILE } from './normtext/adapter-pdf.ts';

// Höfliche Nebenläufigkeit gegen Amtsserver (Werkzeug-Audit §Audit-1): die
// Kantons-/HTM-/ZH-/PDF-Fetch-Schleifen holen bis zu FETCH_CONCURRENCY Quellen
// gleichzeitig. DETERMINISMUS: nur die (reinen, seiteneffektfreien) FETCHES
// laufen parallel; die Ergebnisse werden danach in UNVERÄNDERTER Inventar-
// Reihenfolge verarbeitet (Reports, Dateinamen, goldenIndex, §8-Fehlerpfade
// byte-identisch). Der Bund-Loop bleibt seriell (DB-Flip). */
const FETCH_CONCURRENCY = 4;
import { pdfLawIdSafe } from './normtext/lawid-safe.ts';
import { baueManifest } from './normtext/kanton-manifest.ts';
import { baueBrowseManifest } from './normtext/browse-manifest.ts';
import type { NormSnapshot, NormSnapshotDatei } from '../src/lib/normtext/typen.ts';
import type { BildRef } from './normtext/extrahiere-fedlex.ts';

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
  // ── Punkt 12 Batch 2 (24.6.2026, Bund-VERORDNUNGEN Volltext) ──
  ahvv: 'AHVV',
  ivv: 'IVV',
  elv: 'ELV',
  bvv_2: 'BVV 2',
  uvv: 'UVV',
  aviv: 'AVIV',
  atsv: 'ATSV',
  klv: 'KLV',
  mwstv: 'MWSTV',
  vstv: 'VStV',
  vzae: 'VZAE',
  vrv: 'VRV',
  vzv: 'VZV',
  ssv: 'SSV',
  dsv: 'DSV',
  argv1: 'ArGV 1',
  bewv: 'BewV',
  buev: 'BüV',
  fzv: 'FZV',
  kov: 'KOV',
  rpv: 'RPV',
  vbb: 'VFRR',
  voeb: 'VöB',
  vzg: 'VZG',
  bvv3: 'BVV 3',
  mvv: 'MVV',
  eov: 'EOV',
  famzv: 'FamZV',
  argv2: 'ArGV 2',
  argv3: 'ArGV 3',
  argv4: 'ArGV 4',
  vev: 'VEV',
  vinta: 'VIntA',
  asylv1: 'AsylV 1',
  asylv2: 'AsylV 2',
  asylv3: 'AsylV 3',
  gschv: 'GSchV',
  lrv: 'LRV',
  lsv: 'LSV',
  vvea: 'VVEA',
  chemv: 'ChemV',
  nhv: 'NHV',
  wav: 'WaV',
  vts: 'VTS',
  bankv: 'BankV',
  kkv: 'KKV',
  erv: 'ERV',
  finiv: 'FINIV',
  finfrav: 'FinfraV',
  fidlev: 'FIDLEV',
  avo: 'AVO',
  gwv_finma: 'GwV-FINMA',
  vam: 'VAM',
  ambv: 'AMBV',
  mepv: 'MepV',
  epv: 'EpV',
  bpv: 'BPV',
  rvov: 'RVOV',
  vgke: 'VGKE',
  betmkv: 'BetmKV',
  qstv: 'QStV',
  // ── Punkt 12 Batch 3 (25.6.2026): Promotion nur-live-link-Stub → Volltext ──
  sortg: 'SortG',
  prg: 'PRG',
  beg: 'BEG',
  mstg: 'MStG',
  mstp: 'MStP',
  irsg: 'IRSG',
  mvg: 'MVG',
  eng: 'EnG',
  co2_gesetz: 'CO2-Gesetz',
  epg: 'EpG',
  txg: 'TxG',
  lmg: 'LMG',
  lfg: 'LFG',
  ebg: 'EBG',
  fmg: 'FMG',
  mg: 'MG',
  zstv: 'ZStV',
  thg: 'THG',
  bgbm: 'BGBM',
  // ── Punkt 12 Batch 3 (25.6.2026): kuratierte zentrale Bundes-VERORDNUNGEN ──
  mschv: 'MSchV',
  patv: 'PatV',
  desv: 'DesV',
  urv: 'URV',
  tgbv: 'TGBV',
  bkv: 'BKV',
  zentv: 'ZentV',
  vkkg: 'VKKG',
  argv5: 'ArGV 5',
  vvk: 'VVK',
  vkl: 'VKL',
  vfv: 'VFV',
  bbv: 'BBV',
  bmv: 'BMV',
  zemis_v: 'ZEMIS-V',
  adov: 'AdoV',
  rdv: 'RDV',
  zavv: 'ZAV',
  akkbv: 'AkkBV',
  finfrav_finma: 'FinfraV-FINMA',
  finma_gebv: 'FINMA-GebV',
  kkv_finma: 'KKV-FINMA',
  nbv: 'NBV',
  pavo: 'PAVO',
  vgr: 'VGR',
  skv: 'SKV',
  vvv: 'VVV',
  vil: 'VIL',
  fdv: 'FDV',
  fav: 'FAV',
  uvpv: 'UVPV',
  chemrrv: 'ChemRRV',
  veva: 'VeVA',
  vgvp: 'VGV',
};

// ── Konsolidierungsdatum YYYYMMDD → ISO YYYY-MM-DD ───────────────────────────
function konsZuIso(kons: string): string {
  return `${kons.slice(0, 4)}-${kons.slice(4, 6)}-${kons.slice(6, 8)}`;
}

// ── Artikel-Label: token → 'Art. 335c' ───────────────────────────────────────
function artikelLabel(token: string): string {
  // Sammel-/Bereichs-Artikel (Fedlex fasst aufgehobene Artikel zusammen, Token
  // «26_28», «28_d_28_f») korrekt mit Trennstrich darstellen (Befund 25.6.2026:
  // vorher «Art. 2628»). Regel: «_» VOR einer Ziffer = Bereichsgrenze → «–»;
  // «_» vor einem Buchstaben = Sub-Artikel («335_c» → «335c») → entfernen.
  // Reine Label-Ableitung; fliesst nicht in den sha (kein Drift-Token).
  return 'Art. ' + token.replace(/_(?=\d)/g, '–').replace(/_/g, '');
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
// ─── Bilder herunterladen + selbst hosten (Bilder&Formeln 1.7.2026) ─────────
// Der Extraktor hat je Bild die RELATIVE Quell-src («image/imageN.png») erfasst.
// Hier: → absolute Filestore-URL (gleiche Basis wie fedlex-cache.sh), herunterladen
// nach public/normtext/bilder/<erlass>/, sha über die Bytes, `datei` auf den lokalen
// Pfad setzen. IDEMPOTENT (Datei existiert → nur sha aus den Bytes; kein Re-Fetch).
// ESCAPE-HATCH: Nicht-200 / Content-Type ≠ image/* → Build-Fehler (nie stilles Loch).
const BILDER_BASIS = 'https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli';

async function ladeBilder(
  bloecke: Array<{ bild?: BildRef; bildKacheln?: Array<{ bild?: BildRef }> }>,
  name: string,
  eli: string,
  konsolidierung: string,
): Promise<void> {
  const nameLc = name.toLowerCase();
  const dir = `public/normtext/bilder/${nameLc}`;
  const base = `${BILDER_BASIS}/${eli}/${konsolidierung}/de/html/`;
  const refs: BildRef[] = [];
  for (const b of bloecke) {
    if (b.bild) refs.push(b.bild);
    for (const k of b.bildKacheln ?? []) if (k.bild) refs.push(k.bild);
  }
  for (const ref of refs) {
    if (ref.sha) continue; // im selben Lauf bereits verarbeitet
    const relName = ref.datei.split('/').pop() ?? ref.datei; // imageN.png
    const lokal = `${dir}/${relName}`;
    let bytes: Buffer;
    if (existsSync(lokal)) {
      bytes = readFileSync(lokal);
    } else {
      const url = `${base}${ref.datei}`; // base + «image/imageN.png»
      const res = await fetch(url);
      const ct = res.headers.get('content-type') ?? '';
      if (!res.ok || !ct.startsWith('image/')) {
        throw new Error(
          `[Bilder] Download fehlgeschlagen: ${name} ${url} → http=${res.status}, type=${ct}. ` +
            `(Filestore-URL instabil? Escape-Hatch: Erlass ausnehmen statt stilles Bild-Loch.)`,
        );
      }
      bytes = Buffer.from(await res.arrayBuffer());
      mkdirSync(dir, { recursive: true });
      writeFileSync(lokal, bytes);
    }
    ref.sha = createHash('sha256').update(bytes).digest('hex');
    ref.datei = `bilder/${nameLc}/${relName}`;
  }
}

function sha256Bloecke(
  bloecke: Array<{
    absatz: string | null;
    text: string;
    items?: Array<{ marke: string; text: string; tiefe?: number }>;
    tabelle?: Array<{ beschreibung: string; betrag: string }>;
    mehrspaltig?: {
      kopf?: string[];
      spalten?: Array<{ typ: string; titel: string }>;
      zeilen: string[][];
    };
    bild?: { datei: string; alt: string; sha?: string };
    bildKacheln?: Array<{ bild?: { datei: string; sha?: string }; nummer?: string; name?: string }>;
  }>,
): string {
  const zusammen = bloecke
    .map((b) => {
      // tiefe fliesst in den sha NUR wenn > 0 → nicht verschachtelte Listen
      // bleiben byte-gleich (kein spuriöser Drift); echte Verschachtelung
      // (geänderte Fundstelle) wird vom Drift-Check erfasst (§1/§7, M6).
      const itemTeil = (b.items ?? [])
        .map((i) => `${i.marke}\t${i.text}${i.tiefe ? `\t${i.tiefe}` : ''}`)
        .join('\n');
      const tabTeil = (b.tabelle ?? []).map((z) => `${z.beschreibung}\t${z.betrag}`).join('\n');
      // Spalten-Vektor (Bund, kanonisches M10-Modell) trägt die Kopf-TITEL + -Typen —
      // ohne ihn deckte der sha nur die Zeilen ab, nicht die Tabellen-Überschriften
      // (Blindstelle: eine Kopf-Drift bliebe unentdeckt). `kopf` bleibt als Kanton-
      // Legacy-Fallback erhalten (dort ohne `spalten`).
      const mTeil = b.mehrspaltig
        ? [
            ...(b.mehrspaltig.spalten ?? []).map((s) => `${s.typ}\t${s.titel}`),
            ...(b.mehrspaltig.kopf ? [b.mehrspaltig.kopf.join('\t')] : []),
            ...b.mehrspaltig.zeilen.map((z) => z.join('\t')),
          ].join('\n')
        : '';
      // Bilder fliessen über die STABILE Prüfsumme der Bytes in den Daten-Index
      // (nicht über die evtl. gehashte lokale Datei-Adresse) — so bleibt der sha
      // reproduzierbar unabhängig vom Speicherpfad (§7).
      const bildTeil = b.bild?.sha ? `bild:${b.bild.sha}` : '';
      const kachelTeil = (b.bildKacheln ?? [])
        .map((k) => `${k.nummer ?? ''}\t${k.name ?? ''}\t${k.bild?.sha ?? ''}`)
        .join('\n');
      return [b.text, itemTeil, tabTeil, mTeil, bildTeil, kachelTeil].filter(Boolean).join('\n');
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

// ── Erlass-Bezeichnung lesbar ────────────────────────────────────────────────
// Format: 'Volltitel, Kürzel (SR-Nr.)'. Das nachgelagerte browse-manifest
// (identitaetAusErlass) splittet am LETZTEN Komma: davor der Titel, danach das
// Kürzel; die Klammer ist die SR-Nr. So zeigen Liste UND Reader den echten
// Volltitel, das Kürzel separat.
//
// S9 (BS-Audit 23.6.2026) — VOR dem Fix war «basis = abkuerzung || erlassName»:
// sobald eine Abkürzung vorlag, fiel der Volltitel komplett weg → 129 Erlasse
// zeigten nur «KÜRZEL (SR)», ~406 trugen den Langtitel fälschlich im Kürzel-Feld.
// Jetzt wird der Volltitel (tol.title via meta.titel, sonst erlassName) als Titel
// geführt und die Abkürzung NUR dann separat als Kürzel angehängt, wenn sie
// existiert UND sich vom Titel unterscheidet (keine zweite Wahrheit, §5).
export function erlassBezeichnung(titel: string, abkuerzung: string, erlassNr: string): string {
  const t = titel.trim();
  const abk = abkuerzung.trim();
  const nr = erlassNr.trim();
  // Basis-Anzeige: Titel; fehlt der Titel, das Kürzel als Notbehelf.
  let basis: string;
  if (t && abk && abk !== t) {
    basis = `${t}, ${abk}`;
  } else {
    basis = t || abk;
  }
  return nr ? `${basis} (${nr})` : basis;
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

  // Fetch-Phase (parallel, Concurrency 4) — nur die reinen Abrufe; die
  // Verarbeitung unten bleibt seriell in Inventar-Reihenfolge (Determinismus).
  const limit = pLimit(FETCH_CONCURRENCY);
  const abrufe = await Promise.all(
    inventar.map((g) =>
      limit(async (): Promise<{ ok: true; ergebnis: Awaited<ReturnType<typeof holeLexWork>> } | { ok: false; fehler: string }> => {
        try {
          return { ok: true, ergebnis: await holeLexWork(g.host, g.lang, g.lawId) };
        } catch (e) {
          return { ok: false, fehler: e instanceof Error ? e.message : String(e) };
        }
      }),
    ),
  );

  for (let idx = 0; idx < inventar.length; idx++) {
    const g = inventar[idx];
    const abruf = abrufe[idx];
    if (!abruf.ok) {
      // §8: Netzfehler pro Gruppe abfangen, nicht crashen, weiter zur nächsten.
      cov.fetchFehler.push({ kanton: g.kanton, lawId: g.lawId, fehler: abruf.fehler });
      continue;
    }
    const ergebnis = abruf.ergebnis;

    if (ergebnis.meta.nurPdf) {
      cov.nurPdf.push({
        kanton: g.kanton,
        erlass: erlassBezeichnung(ergebnis.meta.titel || g.erlassName, ergebnis.meta.abkuerzung, g.erlassNr),
        lawId: g.lawId,
      });
      continue;
    }

    // S9: Volltitel (tol.title) als Titel, Abkürzung separat als Kürzel.
    const erlass = erlassBezeichnung(ergebnis.meta.titel || g.erlassName, ergebnis.meta.abkuerzung, g.erlassNr);
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
        // N1: amtlicher Randtitel (article_title) aus der LexWork-Extraktion,
        // falls vorhanden (aufgehobene «…»-Titel liefert der Adapter als undefined).
        ...(treffer.titel ? { titel: treffer.titel } : {}),
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

  const limit = pLimit(FETCH_CONCURRENCY);
  const abrufe = await Promise.all(
    inventar.map((g) =>
      limit(async (): Promise<{ ok: true; ergebnis: Awaited<ReturnType<typeof holeHtm>> } | { ok: false; fehler: string }> => {
        try {
          return { ok: true, ergebnis: await holeHtm(g.quelleUrl, g.profil) };
        } catch (e) {
          return { ok: false, fehler: e instanceof Error ? e.message : String(e) };
        }
      }),
    ),
  );

  for (let idx = 0; idx < inventar.length; idx++) {
    const g = inventar[idx];
    const safe = htmLawIdSafe(g.quelleUrl);
    const abruf = abrufe[idx];
    if (!abruf.ok) {
      cov.fetchFehler.push({ kanton: g.kanton, url: g.quelleUrl, fehler: abruf.fehler });
      continue;
    }
    const ergebnis = abruf.ergebnis;

    const erlass = erlassBezeichnung(g.erlassName, '', g.erlassNr);
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

  const limit = pLimit(FETCH_CONCURRENCY);
  const abrufe = await Promise.all(
    inventar.map((g) =>
      limit(async (): Promise<{ ok: true; ergebnis: Awaited<ReturnType<typeof holeZhPdf>> } | { ok: false; fehler: string }> => {
        try {
          return { ok: true, ergebnis: await holeZhPdf(g.quelleUrl) };
        } catch (e) {
          return { ok: false, fehler: e instanceof Error ? e.message : String(e) };
        }
      }),
    ),
  );

  for (let idx = 0; idx < inventar.length; idx++) {
    const g = inventar[idx];
    const safe = zhLawIdSafe(g.quelleUrl);
    const abruf = abrufe[idx];
    if (!abruf.ok) {
      cov.fetchFehler.push({ kanton: g.kanton, url: g.quelleUrl, fehler: abruf.fehler });
      continue;
    }
    const ergebnis = abruf.ergebnis;

    const erlass = erlassBezeichnung(g.erlassName, '', g.erlassNr);
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

// pdfLawIdSafe liegt zentral in ./normtext/lawid-safe.ts (§5, C1-1) — importiert oben.

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

  // Fetch-Phase (parallel, Concurrency 4) über ALLE Gruppen; die verschachtelte
  // Verarbeitung unten bleibt in unveränderter (nachDatei × gruppen)-Reihenfolge.
  // Schlüssel = Gruppen-Objektreferenz (jede Gruppe kommt genau einmal vor).
  const alleGruppen = [...nachDatei.values()].flat();
  type PdfAbruf = { ok: true; ergebnis: Awaited<ReturnType<typeof holePdf>> } | { ok: false; fehler: string };
  const pdfLimit = pLimit(FETCH_CONCURRENCY);
  const pdfAbrufe = new Map<(typeof alleGruppen)[number], PdfAbruf>();
  await Promise.all(
    alleGruppen.map((g) =>
      pdfLimit(async () => {
        try {
          pdfAbrufe.set(g, { ok: true, ergebnis: await holePdf(g.quelleUrl, PDF_PROFILE[g.profil]) });
        } catch (e) {
          pdfAbrufe.set(g, { ok: false, fehler: e instanceof Error ? e.message : String(e) });
        }
      }),
    ),
  );

  for (const [dateiBasis, gruppen] of nachDatei) {
    const safe = dateiBasis.replace(/^[A-Z]{2}-/, '');
    const kanton = gruppen[0].kanton;
    const snapshotListe: NormSnapshot[] = [];
    const gesehenTokens = new Set<string>();

    for (const g of gruppen) {
      const abruf = pdfAbrufe.get(g)!;
      if (!abruf.ok) {
        cov.fetchFehler.push({ kanton: g.kanton, url: g.quelleUrl, fehler: abruf.fehler });
        continue;
      }
      const ergebnis = abruf.ergebnis;
      const erlass = erlassBezeichnung(g.erlassName, '', g.erlassNr);
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
  const alleEintraege = parseFedlexCacheEintraege(shellQuelle);

  // --erlass=KEY,KEY: Bund-Lauf auf einzelne Erlasse eingrenzen (M10: nur die
  // mehrspaltig-Erlasse regenerieren → minimaler, prüfbarer git-Diff). Setzt
  // --nur=bund-Semantik voraus; Golden wird gemerged (nicht ersetzt), s. unten.
  const erlassArg = process.argv.find((a) => a.startsWith('--erlass='));
  const erlassFilter = erlassArg
    ? new Set(erlassArg.slice('--erlass='.length).toLowerCase().split(',').map((s) => s.trim()).filter(Boolean))
    : null;
  const eintraege = erlassFilter
    ? alleEintraege.filter((e) => erlassFilter.has(e.name.toLowerCase()))
    : alleEintraege;
  if (erlassFilter && eintraege.length !== erlassFilter.size) {
    const gefunden = new Set(eintraege.map((e) => e.name.toLowerCase()));
    const fehlt = [...erlassFilter].filter((k) => !gefunden.has(k));
    throw new Error(`--erlass: unbekannte Erlass-Keys (nicht in fedlex-cache.sh): ${fehlt.join(', ')}`);
  }

  console.log(`\n[Normtext-Snapshot] datum=${abgerufen}, ${eintraege.length} Gesetze${erlassFilter ? ' (--erlass-Filter)' : ''}`);

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

  // ── E1-Flip (QS-DATA, FAHRPLAN-DATENHALTUNG §5): public/*.json entsteht ab hier
  // aus der DB-PROJEKTION (Spalten-Weg: Zeilen in erlasse/erlass_fassungen/artikel →
  // byte-gleiche Projektion), nicht mehr direkt aus dem Blob. Der alte stabelesJson-
  // Direktpfad für die Bund-Dateien ist ENTFERNT (E1-Rest, eigener §6-Schritt 3.7.2026);
  // der stehende Byte-Beweis läuft über `npm run datenhaltung:doppellauf`.
  // Dynamischer Import, damit der vitest-Import dieser Datei nie node:sqlite lädt.
  const { erstelleFlipDb, flipBundErlass } = await import('./datenhaltung/generator-flip.ts');
  const flipDb = erstelleFlipDb();

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
      await ladeBilder(extrakt.bloecke, name, eli, konsolidierung);

      const id = `bund/${gesetzKey}/${ankerVoll}`;
      const snapshot: NormSnapshot = {
        id,
        ebene: 'bund',
        quelle: gesetzKey,
        erlass,
        artikel: token,
        // M9/G7: Synthese-Suffix «__2» (doppelte art_id) NICHT ins Label ziehen —
        // beide Artikel zeigen ihre echte Basis-Bezeichnung («Art. 126z»); der
        // Inhalt unterscheidet sie. Anker/id behalten den Suffix (eindeutig).
        artikelLabel: artikelLabel(token.replace(/__\d+$/, '')),
        // G23 (M8): Delegationsnorm-Grundlage «(Art. N ArG)», falls vorhanden.
        // Artikel-level wie titel → NICHT im Block-sha (golden-neutral).
        ...(extrakt.grundlage ? { grundlage: extrakt.grundlage } : {}),
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

    // ── M13: Schlussteil (Schlusstitel/UeB/Schlussbestimmungen) ───────────────
    // Neu-nummerierte Schluss-Divisionen liegen unter eigenem Anker-Schema
    // (`<article id="disp_uN/art_*">`) und fielen vom digit-only-Enumerator weg.
    // ADDITIV an die HAUPTTEXT-Einträge angehängt (HTML-Reihenfolge: nach
    // art_977), mit kollisionsfreiem Token-Namespace («disp_u1_art_1») — der
    // Haupttext bleibt byte-gleich. Die Lese-/Gliederungs-Maschinerie gruppiert
    // sie über das Struktur-Sidecar (gliederung-Label «Schlusstitel: …») von
    // selbst zur eigenen Top-Sektion. quelleUrl trägt den ECHTEN Anker (mit «/»).
    for (const anker of alleSchlussteilAnker(html)) {
      const extrakt = extrahiereArtikelAusAnker(html, anker);
      if (extrakt === null || extrakt.bloecke.length === 0) {
        uebersprungen.push({ gesetz: gesetzKey, token: anker });
        continue;
      }
      await ladeBilder(extrakt.bloecke, name, eli, konsolidierung);
      const token = ankerZuToken(anker);
      const id = `bund/${gesetzKey}/${token}`;
      const snapshot: NormSnapshot = {
        id,
        ebene: 'bund',
        quelle: gesetzKey,
        erlass,
        artikel: token,
        artikelLabel: artikelLabel(schlussteilLabelSuffix(anker)),
        ...(extrakt.grundlage ? { grundlage: extrakt.grundlage } : {}),
        bloecke: extrakt.bloecke,
        stand,
        // Roher Anker (mit «/», ohne Synthese-Suffix) als Live-Sprungziel.
        quelleUrl: `https://www.fedlex.admin.ch/eli/${eli}/de#${anker.replace(/__\d+$/, '')}`,
        abgerufen,
        fassungsToken: konsolidierung,
        sha: sha256Bloecke(extrakt.bloecke),
      };
      snapshotListe.push(snapshot);
      goldenIndex[id] = snapshot.sha;
    }

    // ── M13-Annex: Anhänge (annex_N | annex_N_N | annex_N_a) ──────────────────
    // Die Anhänge liegen in einem eigenen Container <div id="annex"> (Geschwister
    // von <main>, nach <div id="dispositions">) als FLACHE <section id="annex_*">
    // — KEINE <article>, KEINE art_-Nummerierung. ADDITIV an Haupttext+Schlussteil
    // angehängt, mit eigenem Token-Namespace («annex_1», «annex_1_1»), der nicht
    // mit dem Haupttext kollidiert. Reine Gruppen-Überschriften ohne eigenen Body
    // (extrahiereAnhang === null) werden übersprungen. Das Struktur-Sidecar
    // (extrahiereAnhangStruktur) gruppiert sie über die Gliederung «Anhänge» zur
    // eigenen Top-Sektion (0 Renderer-Umbau, wie M13-disp).
    for (const anker of alleAnhangAnker(html)) {
      const extrakt = extrahiereAnhang(html, anker);
      if (extrakt === null || extrakt.bloecke.length === 0) {
        uebersprungen.push({ gesetz: gesetzKey, token: anker });
        continue;
      }
      await ladeBilder(extrakt.bloecke, name, eli, konsolidierung);
      const token = ankerZuToken(anker); // annex_1 / annex_1_1 — kein «art_», kein «/» → unverändert
      const id = `bund/${gesetzKey}/${token}`;
      const snapshot: NormSnapshot = {
        id,
        ebene: 'bund',
        quelle: gesetzKey,
        erlass,
        artikel: token,
        artikelLabel: extrakt.titel || anhangLabelVonAnker(anker),
        bloecke: extrakt.bloecke,
        stand,
        // Roher Anker als Live-Sprungziel (Anhänge tragen kein «/», ggf. Synthese-Suffix entfernen).
        quelleUrl: `https://www.fedlex.admin.ch/eli/${eli}/de#${anker.replace(/__\d+$/, '')}`,
        abgerufen,
        fassungsToken: konsolidierung,
        sha: sha256Bloecke(extrakt.bloecke),
      };
      snapshotListe.push(snapshot);
      goldenIndex[id] = snapshot.sha;
    }

    // JSON schreiben — E1-Rest (§6-Schritt, FAHRPLAN-DATENHALTUNG §5): die
    // Bund-Dateien public/normtext/bund/*.json entstehen AUSSCHLIESSLICH aus der
    // DB-Projektion (Spalten-Weg: Zeilen in erlasse/erlass_fassungen/artikel →
    // byte-gleiche Projektion). Der frühere stabelesJson-Direktschreibweg für diese
    // Dateien ist ENTFERNT — die DB ist die EINE Wahrheit (§5, §7 Build-Regel 6);
    // ≥3 grüne Doppelläufe haben die Byte-Gleichheit vorher belegt. Der stehende
    // Byte-Beweis (Projektion == committet) läuft ohne public-Diff über
    // `npm run datenhaltung:doppellauf`.
    const ausgabePfad = `${ausgangsDir}/${gesetzKey}.json`;
    if (snapshotListe.length > 0) {
      const projJson = flipBundErlass(
        flipDb,
        { key: gesetzKey, sr: null, titel: erlass, rechtsgebiet: '', status: 'snapshot' },
        snapshotListe,
      );
      writeFileSync(ausgabePfad, projJson, 'utf8');
    } else {
      // Degenerierter Fall: Erlass ohne einen einzigen extrahierbaren Artikel →
      // keine DB-Zeilen, also nicht projizierbar. Dann eine leere
      // {erzeugt, eintraege:[]}-Datei direkt serialisieren. Kommt im gepinnten
      // Bund-Korpus nicht vor (alle 218 Dateien tragen Einträge; ein leeres Bund-
      // File risse ohnehin den Doppellauf); der Zweig ist reiner §8-Schutz gegen
      // ein stilles Loch, kein konkurrierender Schreibweg zur Projektion.
      const datei: NormSnapshotDatei = { erzeugt: abgerufen, eintraege: snapshotListe };
      writeFileSync(ausgabePfad, stabelesJson(datei), 'utf8');
    }

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
    // Bei --erlass-Filter: ALLE bestehenden Keys behalten (nur die regenerierten
    // Erlasse werden überschrieben) — sonst gingen die nicht-regenerierten bund/*
    // verloren. Ohne Filter (Voll-Bund): alle bund/* verwerfen + frisch ersetzen
    // (fängt gelöschte Artikel).
    for (const k of Object.keys(bestand)) {
      if (erlassFilter ? true : !k.startsWith('bund/')) gemischt[k] = bestand[k];
    }
    // frische bund/*-Einträge ergänzen/überschreiben
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

// Nur als CLI-Skript ausführen, NICHT beim Import aus einem Unit-Test (der nur
// erlassBezeichnung u.ä. prüft). Unter vite-node steht der Skriptpfad NICHT in
// process.argv (das ist nur ['node','vite-node', …flags]) — ein Pfad-Regex
// schlägt darum fehl und main() liefe nie (Bug 23.6.). Der einzige Importer ist
// der vitest-Test; vitest setzt process.env.VITEST. Daran erkennen wir den Import
// und überspringen main(); jeder echte CLI-Lauf (vite-node) hat VITEST nicht.
const direktAufruf = typeof process !== 'undefined' && !process.env.VITEST;
if (direktAufruf) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
