// ─── V2 / K-1 · «in Kraft seit» — Ur-Inkrafttreten (Netz-Generator) ──────────
//
// Die Meta-Zeile im Gesetzes-Reader nennt neben «Stand» (Konsolidierungsdatum)
// künftig auch «in Kraft seit» — das URSPRÜNGLICHE Inkrafttreten des Erlasses
// (David 10.7.2026: «der kopf des gesetzes nützlicher»). Dieser Generator
// ermittelt je Bund-Snapshot-Erlass das Ur-Inkrafttreten und schreibt es als
// Sidecar public/normtext/inkrafttreten.json ({key:{datum,quelle}}).
// browse-manifest.ts projiziert es offline in register.json →
// BrowseErlass.inkraftSeit (synchron beim Header-Render ⇒ CLS 0, §15/2).
//
//   npm run gen:inkrafttreten -- --datum=$(date +%F)         (Netz, manuell)
//
// Quelle (ausschliesslich amtlich, §7 — POC 12.7.2026 live an OR/ZGB/BV/DSG/AHVG
// verifiziert, alle famos-belegten Ur-Daten getroffen: OR/ZGB 1912-01-01,
// BV 2000-01-01, nDSG 2023-09-01, AHVG 1948-01-01):
//   · Bund — Fedlex-SPARQL `jolux:dateEntryInForce` am ABSTRACT-ELI (cc) selbst.
//     Das Abstract trägt EIN kanonisches Ur-Inkrafttreten des Erlasses (nicht der
//     Konsolidierung; `dateApplicability` ist der Konsolidierungs-Stand = «Stand»).
//     Bewusst NICHT die früheste `dateEntryInForce` aus den Paket-5-Revisionen:
//     die listet über die SR-Taxonomie auch VORGÄNGER-Erlasse (z. B. ADOV → 1973er
//     «Verordnung über die Adoptionsvermittlung»), deren frühestes Datum ≠ dem
//     Ur-Inkrafttreten des HEUTIGEN Erlasses ist (Warnung Auftrag; empirisch belegt).
//
//   · Kanton — LexWork trägt strukturell KEIN vom Beschluss-/Versionsdatum
//     unterscheidbares Ur-Inkrafttreten (`enactment` = Beschlussdatum wie «vom …»;
//     `version_dates_str` = In-Kraft der aktuellen VERSION = unser «Stand»). Ein
//     davon abgeleitetes «in Kraft seit» wäre entweder falsch (Beschluss ≠ Kraft)
//     oder eine Dublette zu «Stand». Darum §8: Kanton ehrlich WEGLASSEN, kein Feld.
//
// §8-Ehrlichkeit: Wo kein eindeutiges amtliches Ur-Inkrafttreten (genau EIN Datum)
// ermittelbar ist, KEIN Eintrag → die Meta-Zeile zeigt nichts (nie ein geratenes
// oder mehrdeutiges Datum, §7 «konservativ bei Teil-Inkrafttreten»).
// §2/§0b: reine Erhebe-Funktion (deterministisch, injizierbare fetchImpl), getrennt
// vom Schreiben; kein Date.now() in der Erhebung.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sparqlBatch, type FetchImpl } from '../fedlex-sparql.ts';

/** Abstract-ELI aus register.quelleUrl (…/eli/cc/…/de → cc/…). null = kein cc-ELI. */
function abstraktEli(quelleUrl: string): string | null {
  const m = quelleUrl.match(/\/eli\/(cc\/[^?#]+?)(?:\/(?:de|fr|it))?$/);
  return m ? m[1] : null;
}

const wurzel = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const REGISTER_JSON = resolve(wurzel, 'public/normtext/register.json');
const INKRAFT_JSON = resolve(wurzel, 'public/normtext/inkrafttreten.json');

export type Inkrafttreten = { datum: string; quelle: 'fedlex' };
export type InkrafttretenMap = Record<string, Inkrafttreten>;

export type ErlassBasis = {
  key: string; sr: string | null; ebene: string; status: string; quelleUrl: string;
};

/** SPARQL: je abstract-ELI das Ur-Inkrafttreten (`dateEntryInForce`) des Erlasses. */
function baueBundQuery(valuesInline: string): string {
  return `
PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>
SELECT ?abstract ?dateForce WHERE {
  VALUES ?abstract { ${valuesInline} }
  ?abstract jolux:dateEntryInForce ?dateForce .
}`;
}

/**
 * Reine Erhebung der Bund-Ur-Inkrafttreten (deterministisch, testbar). Je Erlass
 * das Datum, wenn das Abstract GENAU EIN `dateEntryInForce` trägt; bei null oder
 * mehreren (Teil-Inkrafttreten) → `ohne` (§8, keine Anzeige, konservativ §7).
 */
export async function bundInkrafttreten(
  bund: ErlassBasis[], fetchImpl: FetchImpl,
): Promise<{ map: InkrafttretenMap; ohne: string[] }> {
  const perEli = new Map<string, ErlassBasis>();
  const werte: string[] = [];
  for (const e of bund) {
    const eli = abstraktEli(e.quelleUrl);
    if (!eli) continue;
    perEli.set(eli, e);
    werte.push(`<https://fedlex.data.admin.ch/eli/${eli}>`);
  }
  const bindings = werte.length ? await sparqlBatch(werte, baueBundQuery, { fetchImpl }) : [];

  // eli → Menge distinkter Ur-Inkrafttreten-Daten (Mehrdeutigkeit = Teil-Inkrafttreten).
  const proEli = new Map<string, Set<string>>();
  for (const b of bindings) {
    if (!b.abstract || !b.dateForce) continue;
    const eli = b.abstract.value.replace('https://fedlex.data.admin.ch/eli/', '');
    const datum = b.dateForce.value.slice(0, 10);
    const menge = proEli.get(eli) ?? new Set<string>();
    menge.add(datum);
    proEli.set(eli, menge);
  }

  const map: InkrafttretenMap = {};
  const ohne: string[] = [];
  for (const [eli, e] of perEli) {
    const daten = proEli.get(eli);
    if (!daten || daten.size !== 1) { ohne.push(e.key); continue; }
    map[e.key] = { datum: [...daten][0], quelle: 'fedlex' };
  }
  return { map, ohne };
}

/** inkrafttreten.json: Schlüssel sortiert, deterministisch (2-Space + Trailing-Newline). */
export function inkrafttretenJson(map: InkrafttretenMap): string {
  const sortiert: InkrafttretenMap = {};
  for (const key of Object.keys(map).sort()) sortiert[key] = map[key];
  return JSON.stringify(sortiert, null, 2) + '\n';
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

function heute(): string {
  const j = new Date();
  return `${j.getFullYear()}-${String(j.getMonth() + 1).padStart(2, '0')}-${String(j.getDate()).padStart(2, '0')}`;
}

async function main() {
  const erlasse = (JSON.parse(readFileSync(REGISTER_JSON, 'utf8')) as { erlasse: ErlassBasis[] }).erlasse;
  const bund = erlasse.filter((e) => e.status === 'snapshot' && e.quelleUrl && e.ebene === 'bund' && e.sr);

  const { map, ohne } = await bundInkrafttreten(bund, fetch);
  writeFileSync(INKRAFT_JSON, inkrafttretenJson(map), 'utf8');
  console.log(`Bund: ${Object.keys(map).length}/${bund.length} Ur-Inkrafttreten; ${ohne.length} ohne/mehrdeutig: ${ohne.join(', ') || '—'}`);
  console.log(`Kanton: bewusst 0 (LexWork trägt kein strukturelles Ur-Inkrafttreten, §8).`);
  console.log(`\n${Object.keys(map).length} Einträge → public/normtext/inkrafttreten.json (Lauf ${heute()}).`);
  console.log('Nachlauf: `npm run normtext:register` (Projektion → register.json), `npm run datenhaltung:manifest`.');
}

// Als CLI ausführen; beim Import aus dem Unit-Test (VITEST gesetzt) NICHT laufen.
if (!process.env.VITEST) void main();
