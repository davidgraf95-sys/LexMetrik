// ─── U-PDF / A12 · Amtliche-PDF-Quellen (Netz-Generator) ─────────────────────
//
// Die Download-Aktion im Gesetzes-Reader lädt das AMTLICHE PDF der gepinnten
// Fassung (David 5.7.2026: «das herunterladen soll amtliches pdf herunterladen»).
// Dieser Generator ermittelt je Snapshot-Erlass die URL des amtlichen PDF und
// schreibt sie als Sidecar public/normtext/pdf-quellen.json ({key:{url,stand,
// quelle}}). browse-manifest.ts projiziert sie offline in register.json →
// BrowseErlass.pdfUrl/pdfStand (synchron beim Header-Render ⇒ CLS 0, §15/2).
//
//   npm run gen:pdf-quellen -- --datum=$(date +%F)            (Netz, manuell)
//   npm run gen:pdf-quellen -- --nur=bund --datum=…           (nur Bund)
//
// Quellen (ausschliesslich amtlich, §7):
//   · Bund   — Fedlex-SPARQL `jolux:isExemplifiedBy` der pdf-a-Manifestation der
//              GEPINNTEN Konsolidierung. Die EXAKTE Filestore-URL wird gelesen
//              (kein Suffix-Raten): der Revisions-Suffix variiert real ((none)/
//              -1/-2/-3/-4/-5/-12) — eine deterministisch konstruierte suffixlose
//              URL lädt bei Re-Issues die ÄLTERE Datei (HTTP 200, kein 404;
//              Suffix-Falle aus Fedlex-Portfolio P1-a/b). isExemplifiedBy nennt
//              die kanonische Datei ⇒ Falle gegenstandslos.
//   · Kanton — LexWork `selected_version.pdf_link_tol`. Nur wenn das
//              Versionsdatum der LexWork-Current-Version == snapshot.stand ist
//              (sonst Drift ⇒ ehrlich weglassen statt fremde Fassung anbieten, §8).
//
// §8-Ehrlichkeit: Wo kein amtliches PDF ermittelbar ist, KEIN Eintrag → die
// Aktion entfällt (nie Schein-Amtlichkeit, nie render-eigenes PDF, §10.5).
// §2/§0b: reine erhebe-Funktionen (deterministisch, injizierbare fetchImpl),
// getrennt vom Schreiben; kein Date.now() in der Erhebung.
//
// Drift-Überwachung: check:pdf-quellen (offline) bindet die Bund-URLs an die
// fedlex-cache.sh-Pins (kons-Match) — so ist die PDF-URL Teil der Pin-Überwachung
// (check:fedlex-versionen ist Currency-Arbiter der Pins selbst).
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sparqlBatch, type FetchImpl } from '../fedlex-sparql.ts';
import { inKraftSeit } from './adapter-lexwork.ts';

// Triviale, seiteneffektfreie Helfer lokal (der Bezug fedlex-wiedervorlage-
// generieren.ts läuft beim Import als CLI mit — darum NICHT von dort importieren).
/** Abstract-ELI aus register.quelleUrl (…/eli/cc/…/de → cc/…). null = kein cc-ELI. */
function abstraktEli(quelleUrl: string): string | null {
  const m = quelleUrl.match(/\/eli\/(cc\/[^?#]+?)(?:\/(?:de|fr|it))?$/);
  return m ? m[1] : null;
}
/** «20260701» → «2026-07-01». */
function isoAusToken(t: string): string {
  return `${t.slice(0, 4)}-${t.slice(4, 6)}-${t.slice(6, 8)}`;
}

const wurzel = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const REGISTER_JSON = resolve(wurzel, 'public/normtext/register.json');
const PDF_QUELLEN_JSON = resolve(wurzel, 'public/normtext/pdf-quellen.json');

const SPRACHE_DEU = 'http://publications.europa.eu/resource/authority/language/DEU';
const FORMAT_PDF_A = 'https://fedlex.data.admin.ch/vocabulary/user-format/pdf-a';

export type PdfQuelle = { url: string; stand: string; quelle: 'fedlex' | 'lexwork' };
export type PdfQuellenMap = Record<string, PdfQuelle>;

export type ErlassBasis = {
  key: string; sr: string | null; kuerzel: string; ebene: string; status: string;
  quelleUrl: string; fassungsToken: string; stand: string; kanton: string | null;
};

// ─── Bund: Fedlex-pdf-a via isExemplifiedBy ──────────────────────────────────

/** SPARQL: je abstract-ELI die pdf-a-Filestore-URL(s) samt dateApplicability. */
function baueBundQuery(valuesInline: string): string {
  return `
PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>
SELECT ?abstract ?date ?url WHERE {
  VALUES ?abstract { ${valuesInline} }
  ?c jolux:isMemberOf ?abstract ; jolux:dateApplicability ?date ; jolux:isRealizedBy ?e .
  ?e jolux:language <${SPRACHE_DEU}> ; jolux:isEmbodiedBy ?m .
  ?m jolux:userFormat <${FORMAT_PDF_A}> ; jolux:isExemplifiedBy ?url .
}`;
}

/**
 * Reine Erhebung der Bund-pdf-a-URLs (deterministisch, testbar). Je Erlass wird
 * die pdf-a-URL genommen, deren dateApplicability == gepinnte Fassung
 * (fassungsToken) ist — damit das PDF exakt die ausgelieferte Fassung zeigt.
 * `ohne` sammelt Keys ohne pdf-a-Treffer (§8: keine Aktion).
 */
export async function bundPdfQuellen(
  bund: ErlassBasis[], fetchImpl: FetchImpl,
): Promise<{ map: PdfQuellenMap; ohne: string[] }> {
  const perEli = new Map<string, ErlassBasis>();
  const werte: string[] = [];
  for (const e of bund) {
    const eli = abstraktEli(e.quelleUrl);
    if (!eli) continue;
    perEli.set(eli, e);
    werte.push(`<https://fedlex.data.admin.ch/eli/${eli}>`);
  }
  const bindings = werte.length
    ? await sparqlBatch(werte, baueBundQuery, { fetchImpl })
    : [];

  // eli → (date → sortierte URL-Liste); deterministische Wahl bei Mehrdeutigkeit.
  const proEli = new Map<string, Map<string, string[]>>();
  for (const b of bindings) {
    if (!b.abstract || !b.date || !b.url) continue;
    const eli = b.abstract.value.replace('https://fedlex.data.admin.ch/eli/', '');
    const datum = b.date.value.slice(0, 10);
    const perDatum = proEli.get(eli) ?? new Map<string, string[]>();
    const liste = perDatum.get(datum) ?? [];
    liste.push(b.url.value);
    perDatum.set(datum, liste);
    proEli.set(eli, perDatum);
  }

  const map: PdfQuellenMap = {};
  const ohne: string[] = [];
  for (const [eli, e] of perEli) {
    const gepinnt = isoAusToken(e.fassungsToken);
    const urls = [...(proEli.get(eli)?.get(gepinnt) ?? [])].sort();
    if (urls.length === 0) { ohne.push(e.key); continue; }
    map[e.key] = { url: urls[0], stand: gepinnt, quelle: 'fedlex' };
  }
  return { map, ohne };
}

// ─── Kanton: LexWork pdf_link_tol (nur bei Versions-Gleichstand) ─────────────

/** '…/app/de/texts_of_law/291.150' → '…/api/de/texts_of_law/291.150'. null = kein LexWork-Muster. */
export function lexworkApiUrl(quelleUrl: string): string | null {
  const m = quelleUrl.match(/^(https:\/\/[^/]+)\/app\/(de|fr|it)\/texts_of_law\/(.+)$/);
  return m ? `${m[1]}/api/${m[2]}/texts_of_law/${m[3]}` : null;
}

type LexworkText = {
  text_of_law?: {
    enactment?: string;
    selected_version?: { pdf_link_tol?: string | null; version_dates_str?: string };
  };
  enactment?: string;
  selected_version?: { pdf_link_tol?: string | null; version_dates_str?: string };
};

/**
 * Reine Ableitung EINES Kanton-Eintrags aus der LexWork-Antwort (testbar, ohne
 * Netz). Liefert die pdf_link_tol-URL NUR, wenn das In-Kraft-Datum der
 * LexWork-Current-Version == snapshot.stand ist (sonst Drift → null, §8).
 */
export function kantonAusLexwork(e: ErlassBasis, json: LexworkText): PdfQuelle | null {
  const t = json.text_of_law ?? json;
  const sel = t.selected_version;
  const url = sel?.pdf_link_tol;
  if (!url) return null;
  const stand = inKraftSeit(sel?.version_dates_str, t.enactment);
  if (!stand || stand !== e.stand) return null; // Drift oder unklar → weglassen
  return { url, stand, quelle: 'lexwork' };
}

/** Netz-Erhebung der Kanton-URLs, höflich (Concurrency) + tolerant (Fehler = weglassen). */
export async function kantonPdfQuellen(
  kanton: ErlassBasis[], fetchImpl: FetchImpl,
  opts: { concurrency?: number } = {},
): Promise<{ map: PdfQuellenMap; ohne: string[]; fehler: string[] }> {
  const { concurrency = 6 } = opts;
  const map: PdfQuellenMap = {};
  const ohne: string[] = [];
  const fehler: string[] = [];
  let i = 0;
  async function arbeiter() {
    while (i < kanton.length) {
      const e = kanton[i++];
      const api = lexworkApiUrl(e.quelleUrl);
      if (!api) { ohne.push(e.key); continue; }
      try {
        const res = await fetchImpl(api);
        if (!res.ok) { fehler.push(`${e.key}: HTTP ${res.status}`); continue; }
        const json = (await res.json()) as LexworkText;
        const q = kantonAusLexwork(e, json);
        if (q) map[e.key] = q; else ohne.push(e.key);
      } catch (err) {
        fehler.push(`${e.key}: ${err instanceof Error ? err.message : err}`);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, kanton.length || 1) }, arbeiter));
  return { map, ohne, fehler };
}

// ─── Schreiben ───────────────────────────────────────────────────────────────

/** pdf-quellen.json: Schlüssel sortiert, deterministisch (kein Trailing-Newline-Drift). */
export function pdfQuellenJson(map: PdfQuellenMap): string {
  const sortiert: PdfQuellenMap = {};
  for (const key of Object.keys(map).sort()) sortiert[key] = map[key];
  return JSON.stringify(sortiert, null, 2) + '\n';
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

function heute(): string {
  const j = new Date();
  return `${j.getFullYear()}-${String(j.getMonth() + 1).padStart(2, '0')}-${String(j.getDate()).padStart(2, '0')}`;
}

async function main() {
  const nurArg = process.argv.find((a) => a.startsWith('--nur='));
  const nur = nurArg ? nurArg.slice('--nur='.length) : 'beide';
  const erlasse = (JSON.parse(readFileSync(REGISTER_JSON, 'utf8')) as { erlasse: ErlassBasis[] }).erlasse;
  const snap = erlasse.filter((e) => e.status === 'snapshot' && e.quelleUrl);
  const bund = snap.filter((e) => e.ebene === 'bund' && e.sr);
  const kanton = snap.filter((e) => e.ebene === 'kanton');

  // Bestehende Sidecar-Einträge erhalten, wenn nur ein Teil neu erhoben wird.
  let map: PdfQuellenMap = {};
  try { map = JSON.parse(readFileSync(PDF_QUELLEN_JSON, 'utf8')) as PdfQuellenMap; } catch { /* neu */ }

  if (nur === 'bund' || nur === 'beide') {
    const { map: bm, ohne } = await bundPdfQuellen(bund, fetch);
    for (const e of bund) delete map[e.key]; // frisch, kein Alt-Rest
    Object.assign(map, bm);
    console.log(`Bund: ${Object.keys(bm).length}/${bund.length} amtliche PDF-URLs; ${ohne.length} ohne pdf-a: ${ohne.join(', ') || '—'}`);
  }
  if (nur === 'kanton' || nur === 'beide') {
    const { map: km, ohne, fehler } = await kantonPdfQuellen(kanton, fetch);
    for (const e of kanton) delete map[e.key];
    Object.assign(map, km);
    console.log(`Kanton: ${Object.keys(km).length}/${kanton.length} amtliche PDF-URLs; ${ohne.length} ohne/Drift; ${fehler.length} Netz-Fehler`);
    if (fehler.length) console.log(`  Fehler (Auszug): ${fehler.slice(0, 10).join(' · ')}${fehler.length > 10 ? ' …' : ''}`);
  }

  writeFileSync(PDF_QUELLEN_JSON, pdfQuellenJson(map), 'utf8');
  console.log(`\n${Object.keys(map).length} Einträge → public/normtext/pdf-quellen.json (Lauf ${heute()}).`);
  console.log('Nachlauf: `npm run normtext:register` (Projektion → register.json), `npm run datenhaltung:manifest`.');
}

// Als CLI ausführen; beim Import aus dem Unit-Test (VITEST gesetzt) NICHT laufen.
if (!process.env.VITEST) void main();
