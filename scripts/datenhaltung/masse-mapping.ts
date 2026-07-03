// scripts/datenhaltung/masse-mapping.ts
// QS-DATA E3 (BGer-Massen-Import): die REINEN Mapping-/Schema-/Manifest-Bausteine des
// Massen-Imports — DB-frei und parquet-frei importierbar (Unit-Tests laden dieses Modul ohne
// hyparquet und ohne die grossen Parquete). Der Orchestrator `masse-ingest.ts` streamt die
// Parquete und ruft nur diese Funktionen.
//
// EINE Kanonisierung (§3.1): alle Match-Keys kommen aus `normalisiere-zitat.ts` — nie
// zweitimplementiert (B2-POC-Lektion: NBSP-Divergenz bei SQL-Nachbau). CLAUDE.md §2: rein,
// deterministisch, kein I/O, keine Heuristik.
import { createHash } from 'node:crypto';
import { bgeMatchKey, grundreinigung, normalisiereZitat } from './normalisiere-zitat';

// ── Match-Key-Ableitungen (E3-spezifisch, aufgesetzt auf die EINE Kanonisierung) ──────────────

/**
 * Docket-/Dossier-Match-Key auf Basis der Repo-Grundreinigung (NFC/lowercase/trim), Trenner → '_'.
 * bger 'B.126/2003' → 'b_126_2003'; voilaj target_ref '2A_126_2003' → '2a_126_2003' (deckungsgleich).
 * Im CH-Bundeskorpus trägt die Dossiernummer die Resolve-Rolle (das Parquet führt KEIN ECLI-Feld,
 * empirisch belegt 3.7.2026) — sie ist der operative Anker statt des in §3 idealisierten ecli_key.
 */
export function docketKey(roh: string | null | undefined): string | null {
  if (!roh) return null;
  const k = grundreinigung(roh)
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return k || null;
}

/** Zitat-Ziel (Rohstring `target_ref`) → ziel_key: erst BGE-Form, sonst Docket-Form. */
export function zielKey(target_ref: string | null | undefined): string {
  return bgeMatchKey(target_ref ?? '') ?? docketKey(target_ref) ?? '';
}

/** Norm-Referenz-Match-Key (decision→norm): law_code + Artikel via Repo-Kanonisierung. */
export function normKey(law_code: string | null | undefined, article: string | null | undefined): string {
  return normalisiereZitat(`${law_code ?? ''} ${article ?? ''}`.trim());
}

// ── Roh-Parquet-Zeilentypen (nur die konsumierten Spalten) ────────────────────────────────────
export interface EntscheidParquet {
  decision_id: string;
  court: string | null;
  canton: string | null;
  docket_number: string | null;
  bge_reference: string | null;
  decision_date: string | null;
  publication_date: string | null;
  language: string | null;
  legal_area: string | null;
  regeste: string | null;
  full_text: string | null;
  source_url: string | null;
  scraped_at: string | null;
}
export interface ZitatParquet {
  source_decision_id: string;
  target_ref: string | null;
  match_type: string | null;
  confidence_score: number | null;
}
export interface NormRefParquet {
  decision_id: string;
  law_code: string | null;
  article: string | null;
}

// ── Ziel-Zeilentypen (masse.db) ───────────────────────────────────────────────────────────────
export interface EntscheidRow {
  id: string;
  ecli: string | null;
  ecli_key: string | null;
  gericht: string;
  kanton: string | null;
  nummer: string;
  bge_referenz: string | null;
  bge_key: string | null;
  docket_key: string | null;
  datum: string | null;
  publikation: string | null;
  sprache: string;
  rechtsgebiet: string | null;
  leitcharakter: number;
  kuratierung: string;
  regeste_json: string | null;
  full_text: string;
  quelle: string;
  quelle_url: string | null;
  abgerufen: string | null;
  sha: string;
}

/** Deterministischer Inhalts-Fingerabdruck (§7 sha / Drift). content_hash fehlt im Parquet zu
 *  ~47 % → sha kommt konsistent aus dem Volltext, nie aus dem lückenhaften Quellfeld. */
export function inhaltsSha(full_text: string | null): string {
  return createHash('sha256').update(full_text ?? '', 'utf8').digest('hex');
}

/**
 * Entscheid-Zeile aus einer Parquet-Zeile. `kuratierung='maschinell'` (§8-Marker, task-pinned).
 *
 * §7-Provenienz (verifiziert 3.7.2026, 0 NULL über 195 342 Zeilen):
 *  - `quelle_url` = das Parquet-Feld `source_url` VERBATIM — 100 % amtliche bger.ch-Domains
 *    (bger: relevancy.bger.ch/JumpCGI · bge: search.bger.ch/clir · vereinzelt www.bger.ch).
 *    Keine Rekonstruktion, kein Raten (§7 Quell-Wahl: höchste vorhandene Struktur direkt nehmen).
 *  - `abgerufen` = `scraped_at` (0 NULL).  `sha` = sha256(full_text) (full_text 0 NULL).
 *  - `datum` = `decision_date` QUELLTREU (bge: 194 NULL; zusätzlich tragen ~61 % der bge-Zeilen
 *    einen Bandjahr-Platzhalter 'JJJJ-01-01' statt des echten Verkündungsdatums, und einzelne
 *    ältere bger führen dort das Publikations- statt Urteilsdatum — voilaj-Quell-Semantik,
 *    Gegenprüfungs-Befund Q1. Nie fabriziert, nie «repariert»; §8-Darstellung muss das kennen).
 *  - bge-Zeilen: die BGE-Fundstelle steht in `docket_number` ('151 III 481'), `bge_reference`
 *    ist zu 100 % NULL → bge_referenz/bge_key aus `docket_number`. leitcharakter=1 (amtl. BGE).
 */
export function entscheidRow(p: EntscheidParquet): EntscheidRow {
  const istBge = p.court === 'bge';
  // BGE-Anzeige-/Match-Form: bei bge trägt docket_number die Fundstelle, bei bger u. U. bge_reference.
  const bgeKey = bgeMatchKey(p.docket_number ?? '') ?? bgeMatchKey(p.bge_reference ?? '');
  // bge_referenz = kanonische Anzeige 'BGE <Band> <Abt> <Seite>'. Das bge-Parquet mischt die
  // docket_number-Form: ~98 % tragen bereits einen 'BGE '-Präfix ('BGE 87 III 100'), ~2 % nicht
  // ('151 III 481'). Darum vorhandenen BGE/ATF/DTF-Präfix strippen und EINMAL 'BGE ' voranstellen
  // (sonst doppeltes 'BGE BGE …' — von der amtlichen Stichprobe gefunden, 3.7.2026). NUR wenn
  // die Fundstelle wirklich als BGE-Form parst (bgeKey): 474 bge-Zeilen tragen Docket-Müll wie
  // '19791204_7710_76' — daraus wird KEINE Zitierform fabriziert (§8; Gegenprüfungs-Befund Q2).
  // bge_referenz bleibt dann NULL, `nummer` trägt den Rohwert, die Auflösung läuft über docket_key.
  const bgeRef = istBge && p.docket_number && bgeKey
    ? `BGE ${p.docket_number.replace(/^\s*(?:BGE|ATF|DTF)\s+/i, '')}`
    : (p.bge_reference ?? null);
  // Docket-Key nur für NICHT-BGE-Zeilen (BGE resolven über bge_key).
  const dk = bgeKey ? null : docketKey(p.docket_number);
  return {
    id: p.decision_id,
    ecli: null,
    ecli_key: null,
    gericht: p.court ?? '',
    kanton: p.canton ?? null,
    nummer: p.docket_number ?? '',
    bge_referenz: bgeRef,
    bge_key: bgeKey,
    docket_key: dk,
    datum: p.decision_date ?? null,
    publikation: p.publication_date ?? null,
    sprache: p.language ?? '',
    rechtsgebiet: p.legal_area ?? null,
    leitcharakter: istBge ? 1 : 0,
    kuratierung: 'maschinell',
    regeste_json: p.regeste ? JSON.stringify(p.regeste) : null,
    full_text: p.full_text ?? '',
    quelle: 'voilaj-parquet',
    quelle_url: p.source_url ?? null,
    abgerufen: p.scraped_at ?? null,
    sha: inhaltsSha(p.full_text),
  };
}

export interface ZitatRow {
  von_id: string;
  ziel_key: string;
  nach_zitierung: string;
  match_type: string | null;
}
/** Zitat-Kante (Entscheid→Entscheid). von = zitierender Entscheid, nach = zitierter (E4-Resolve). */
export function zitatRow(p: ZitatParquet): ZitatRow {
  return {
    von_id: p.source_decision_id,
    ziel_key: zielKey(p.target_ref),
    nach_zitierung: p.target_ref ?? '',
    match_type: p.match_type ?? null,
  };
}

export interface NormRefRow {
  quelldok_id: string;
  erlass_key: string;
  artikel: string | null;
  zitat_key: string;
  roh_zitat: string;
}
/** Norm-Referenz (Entscheid→Norm). erlass_key = law_code (roh), artikel = article. */
export function normRefRow(p: NormRefParquet): NormRefRow {
  const artikel = p.article ?? null;
  return {
    quelldok_id: p.decision_id,
    erlass_key: p.law_code ?? '',
    artikel,
    zitat_key: normKey(p.law_code, artikel),
    roh_zitat: `${p.law_code ?? ''} ${artikel ?? ''}`.trim(),
  };
}

/**
 * konfidenz einer Zitat-Kante (idempotent aus persistiertem Zustand ableitbar, §3.2):
 *  - nicht aufgelöst (nach_id NULL) → 'unresolved' (legitimer Zustand, nie wegglätten).
 *  - aufgelöst, match_type 'bge_pincite' → 'regex-niedrig' (Binnenseiten-Zitat, unsicherer).
 *  - aufgelöst sonst → 'regex-hoch'.
 */
export function kanteKonfidenz(nachIdVorhanden: boolean, matchType: string | null): string {
  if (!nachIdVorhanden) return 'unresolved';
  return matchType === 'bge_pincite' ? 'regex-niedrig' : 'regex-hoch';
}

// ── Kanonisches Dump-Manifest (streaming; Muster manifest.ts + B2-POC lib.mjs) ─────────────────
// Je Tabelle: Zeilenzahl + sha256 über die KANONISCH serialisierten Zeilen (Spalten alphabetisch,
// je Zeile ein sha256, Digests sortiert zusammengehasht → reihenfolge-/PRAGMA-/plattform-unabhängig).
// STREAMING (.iterate + Per-Zeilen-Digest), weil der 2,4-GB-full_text den V8-String beim Joinen
// sprengt (B2-POC-Lektion). Surrogat-Autoincrement-`id` ausgenommen (Einfüge-Artefakt, keine Daten).
export interface TabellenManifest {
  zeilen: number;
  sha: string;
}
export type DbManifest = Record<string, TabellenManifest>;

const SURROGAT: Record<string, string> = { zitat_kanten: 'id', norm_referenzen: 'id' };

interface MinStmt {
  all(): Array<Record<string, unknown>>;
  iterate(): IterableIterator<Record<string, unknown>>;
}
interface MinDb {
  prepare(sql: string): MinStmt;
}

export function manifestMasse(db: MinDb): DbManifest {
  const tabellen = (db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all() as Array<{ name: string }>)
    .map((r) => r.name);
  const out: DbManifest = {};
  for (const t of tabellen) {
    const cols = (db.prepare(`PRAGMA table_info(${t})`).all() as Array<{ name: string }>)
      .map((r) => r.name)
      .filter((c) => c !== SURROGAT[t])
      .sort();
    const digests: string[] = [];
    const stmt = db.prepare(`SELECT ${cols.map((c) => `"${c}"`).join(',')} FROM ${t}`);
    for (const r of stmt.iterate()) {
      const kanon: Record<string, unknown> = {};
      for (const c of cols) kanon[c] = r[c] ?? null;
      digests.push(createHash('sha256').update(JSON.stringify(kanon), 'utf8').digest('hex'));
    }
    digests.sort();
    const h = createHash('sha256');
    for (const d of digests) h.update(d);
    out[t] = { zeilen: digests.length, sha: h.digest('hex') };
  }
  return out;
}

export function serialisiereMasseManifest(m: DbManifest): string {
  const geordnet: DbManifest = {};
  for (const t of Object.keys(m).sort()) geordnet[t] = m[t];
  return JSON.stringify(geordnet, null, 2) + '\n';
}
