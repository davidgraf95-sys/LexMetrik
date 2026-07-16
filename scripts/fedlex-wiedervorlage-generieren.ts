// ─── P1-c/P1-d · Fedlex-Wiedervorlage + Currency-Sidecar (Netz-Generator) ────
//
// Fedlex publiziert ZUKUNFTS-datierte Konsolidierungen (dateApplicability > heute)
// bereits im Triplestore. Dieser Generator erntet je Bund-Volltext-Erlass die
// NÄCHSTE künftige Fassung und schreibt sie
//   (a) als datierte Wiedervorlage in das Verfallsregister (markierter AUTO-Block,
//       bibliothek/register/parameter-verfall.md, bestehende 5-Spalten-Grammatik) —
//       check:verfall liest sie offline mit, fällige Einträge werden automatisch rot;
//   (b) als Sidecar public/normtext/currency.json ({erlassKey:{geprueftAm,
//       naechsteFassungAb?}}) für die Reader-Chips (P1-d, «geltend geprüft am …»).
//
//   npm run gen:fedlex-wiedervorlage -- --datum=$(date +%F)   (Netz, manuell)
//
// Quelle: ausschliesslich der amtliche Fedlex-SPARQL-Endpunkt (§0c). Grundmenge =
// register.json, ebene='bund' & status='snapshot' (die kanonische 218er-Menge,
// §0c) — nicht die lesePins()-Basis, deren Namens-Regex 11 Ziffern-Pins verfehlt.
//
// §8-Ehrlichkeit: «geltend geprüft am» wird NUR für Erlasse geschrieben, deren
// gepinnte Fassung == der geltenden Fedlex-Konsolidierung ist. Erlasse, die der
// Lauf als ÜBERHOLT erkennt (P1-a-Rückstand), erhalten KEINEN geprüft-Chip —
// eine falsche Freshness-Aussage wäre §8-widrig. Sie bleiben durch
// check:fedlex-versionen (rot) sichtbar.
//
// §0b Regel 5: reine erhebe()-Funktion (deterministisch, injizierbare fetchImpl)
// getrennt vom Schreiben. §2: kein Date.now() in der Erhebung — --datum aus der Shell.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sparqlBatch, type FetchImpl } from './fedlex-sparql.ts';

const wurzel = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REGISTER_JSON = resolve(wurzel, 'public/normtext/register.json');
const CURRENCY_JSON = resolve(wurzel, 'public/normtext/currency.json');
const VERFALL_MD = resolve(wurzel, 'bibliothek/register/parameter-verfall.md');

const MARKE_START = '<!-- AUTO fedlex-wiedervorlage -->';
const MARKE_ENDE = '<!-- /AUTO fedlex-wiedervorlage -->';

export type ErlassBasis = {
  key: string; sr: string | null; kuerzel: string;
  ebene: string; status: string; quelleUrl: string; fassungsToken: string;
};
export type WiedervorlageEintrag = {
  key: string; sr: string; kuerzel: string; gepinnt: string; naechste: string; // ISO
};
export type CurrencyEintrag = { geprueftAm: string; naechsteFassungAb?: string };
export type UeberholtEintrag = { key: string; gepinnt: string; geltend: string };
export type Erhebung = {
  wiedervorlage: WiedervorlageEintrag[];
  currency: Record<string, CurrencyEintrag>;
  ueberholt: UeberholtEintrag[];
  ohneDaten: string[];
};

/** Abstract-ELI aus register.quelleUrl (…/eli/cc/…/de → cc/…). null = kein cc-ELI. */
export function abstraktEli(quelleUrl: string): string | null {
  const m = quelleUrl.match(/\/eli\/(cc\/[^?#]+?)(?:\/(?:de|fr|it))?$/);
  return m ? m[1] : null;
}

/** «20260701» → «2026-07-01» (ISO, als String vergleichbar). */
export function isoAusToken(t: string): string {
  return `${t.slice(0, 4)}-${t.slice(4, 6)}-${t.slice(6, 8)}`;
}

/** «2026-10-01» → «1.10.2026» (Verfall-Grammatik-parsbar, ohne führende Nullen). */
export function deDatum(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${Number(d)}.${Number(m)}.${y}`;
}

/**
 * Reine Erhebung (deterministisch, testbar): fragt je Erlass die
 * Konsolidierungs-Daten und leitet Wiedervorlage + Currency + Überholt-Befund ab.
 * `datum` = Laufdatum (ISO); geltend = max(date ≤ datum), künftig = min(date > datum).
 */
export async function erhebe(
  erlasse: ErlassBasis[], datum: string, fetchImpl: FetchImpl,
): Promise<Erhebung> {
  const bund = erlasse.filter((e) => e.ebene === 'bund' && e.status === 'snapshot' && e.quelleUrl && e.sr);
  const perEli = new Map<string, ErlassBasis>();
  const werte: string[] = [];
  for (const e of bund) {
    const eli = abstraktEli(e.quelleUrl);
    if (!eli) continue;
    perEli.set(eli, e);
    werte.push(`<https://fedlex.data.admin.ch/eli/${eli}>`);
  }

  const baueQuery = (values: string) => `
PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>
SELECT ?abstract ?date WHERE {
  VALUES ?abstract { ${values} }
  ?c jolux:isMemberOf ?abstract ; jolux:dateApplicability ?date .
}`;
  const bindings = await sparqlBatch(werte, baueQuery, { fetchImpl });

  const datenProEli = new Map<string, string[]>();
  for (const b of bindings) {
    if (!b.abstract || !b.date) continue;
    const eli = b.abstract.value.replace('https://fedlex.data.admin.ch/eli/', '');
    const liste = datenProEli.get(eli) ?? [];
    liste.push(b.date.value.slice(0, 10));
    datenProEli.set(eli, liste);
  }

  const wiedervorlage: WiedervorlageEintrag[] = [];
  const currency: Record<string, CurrencyEintrag> = {};
  const ueberholt: UeberholtEintrag[] = [];
  const ohneDaten: string[] = [];

  for (const [eli, e] of perEli) {
    const daten = [...(datenProEli.get(eli) ?? [])].sort();
    if (daten.length === 0) { ohneDaten.push(e.key); continue; }
    const gepinnt = isoAusToken(e.fassungsToken);
    const geltendListe = daten.filter((d) => d <= datum);
    const geltend = geltendListe[geltendListe.length - 1];
    const naechste = daten.find((d) => d > datum); // sortiert asc → früheste künftige
    const istUeberholt = !!geltend && geltend > gepinnt;

    if (istUeberholt) ueberholt.push({ key: e.key, gepinnt, geltend: geltend! });
    if (naechste) wiedervorlage.push({ key: e.key, sr: e.sr!, kuerzel: e.kuerzel, gepinnt, naechste });
    // §8: geprüft-Chip nur für aktuelle (nicht überholte) Erlasse.
    if (!istUeberholt) {
      currency[e.key] = { geprueftAm: datum, ...(naechste ? { naechsteFassungAb: naechste } : {}) };
    }
  }

  wiedervorlage.sort((a, b) => a.naechste.localeCompare(b.naechste) || a.sr.localeCompare(b.sr));
  return { wiedervorlage, currency, ueberholt, ohneDaten };
}

// ─── Schreiben ───────────────────────────────────────────────────────────────

/** Baut den markierten AUTO-Block (inkl. Marken) aus den Wiedervorlage-Einträgen. */
export function baueAutoBlock(eintraege: WiedervorlageEintrag[], datum: string): string {
  const zeilen = eintraege.map((e) =>
    `| Künftige Fassung ${e.kuerzel} (SR ${e.sr}) | \`scripts/fedlex-cache.sh\` (${e.key}) | gepinnt ${deDatum(e.gepinnt)} | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | ${deDatum(e.naechste)} |`,
  );
  return [
    MARKE_START,
    '',
    '## Künftige Fedlex-Konsolidierungen (datierte Wiedervorlage, P1-c)',
    '',
    'Maschinell aus dem amtlichen Fedlex-SPARQL-Graphen (`dateApplicability` >',
    'Laufdatum) je Bund-Volltext-Erlass geerntet — Fedlex führt künftige Fassungen',
    'bereits im Triplestore. Jede Zeile ist eine angekündigte künftige Fassung; am',
    'genannten Tag `scripts/fedlex-cache.sh` neu pinnen + §7-Verifikation. Massgeblich',
    'bleibt stets die amtliche Quelle. NICHT von Hand editieren — Block wird von',
    '`npm run gen:fedlex-wiedervorlage` regeneriert. Stand des Laufs: ' + datum + '.',
    '',
    '| Erlass (künftige Fassung) | Fundstelle | Aktuell gepinnt | Rhythmus | Nächste Prüfung |',
    '|---|---|---|---|---|',
    ...zeilen,
    '',
    MARKE_ENDE,
  ].join('\n');
}

/** Ersetzt den AUTO-Block idempotent (nie appenden), sonst vor «## Konventionen». */
export function schreibeVerfallMd(md: string, block: string): string {
  const start = md.indexOf(MARKE_START);
  const ende = md.indexOf(MARKE_ENDE);
  if (start !== -1 && ende !== -1 && ende > start) {
    const vor = md.slice(0, start);
    const nach = md.slice(ende + MARKE_ENDE.length);
    return vor + block + nach;
  }
  const anker = md.indexOf('## Konventionen');
  if (anker !== -1) return md.slice(0, anker) + block + '\n\n' + md.slice(anker);
  return md.trimEnd() + '\n\n' + block + '\n';
}

/** currency.json: Schlüssel sortiert, deterministisch. */
export function currencyJson(currency: Record<string, CurrencyEintrag>): string {
  const sortiert: Record<string, CurrencyEintrag> = {};
  for (const key of Object.keys(currency).sort()) sortiert[key] = currency[key];
  return JSON.stringify(sortiert, null, 2) + '\n';
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

function heute(): string {
  const j = new Date();
  return `${j.getFullYear()}-${String(j.getMonth() + 1).padStart(2, '0')}-${String(j.getDate()).padStart(2, '0')}`;
}

async function main() {
  const arg = process.argv.find((a) => a.startsWith('--datum='));
  const datum = arg ? arg.slice('--datum='.length) : heute();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) {
    console.error(`FEHLER: --datum=${datum} ist kein ISO-Datum (YYYY-MM-DD).`);
    process.exit(2);
  }
  const erlasse = (JSON.parse(readFileSync(REGISTER_JSON, 'utf8')) as { erlasse: ErlassBasis[] }).erlasse;

  let erhebung: Erhebung;
  try {
    erhebung = await erhebe(erlasse, datum, fetch);
  } catch (e) {
    console.error(`FEHLER: Fedlex-SPARQL nicht erreichbar (${e instanceof Error ? e.message : e}).`);
    process.exit(2);
    return;
  }

  const { wiedervorlage, currency, ueberholt, ohneDaten } = erhebung;

  const md = readFileSync(VERFALL_MD, 'utf8');
  writeFileSync(VERFALL_MD, schreibeVerfallMd(md, baueAutoBlock(wiedervorlage, datum)), 'utf8');
  writeFileSync(CURRENCY_JSON, currencyJson(currency), 'utf8');

  console.log(`gen:fedlex-wiedervorlage (Laufdatum ${datum}):`);
  console.log(`  ${wiedervorlage.length} künftige Fassungen → AUTO-Block in parameter-verfall.md`);
  console.log(`  ${Object.keys(currency).length} Erlasse mit geprüft-Chip → public/normtext/currency.json`);
  console.log(`  davon ${Object.values(currency).filter((c) => c.naechsteFassungAb).length} mit naechsteFassungAb`);
  if (ueberholt.length > 0) {
    console.log(`  ⚠ ${ueberholt.length} ÜBERHOLT (kein geprüft-Chip; P1-a-Rückstand, check:fedlex-versionen rot):`);
    for (const u of ueberholt) console.log(`      ${u.key}: gepinnt ${u.gepinnt} < geltend ${u.geltend}`);
  }
  if (ohneDaten.length > 0) console.log(`  ⚠ ${ohneDaten.length} ohne SPARQL-Daten: ${ohneDaten.join(', ')}`);
  console.log('\nNachlauf: `npm run gen:verfall` (UI-Datenmodul), `npm run datenhaltung:manifest` (Paritäts-Dump).');
}

// Als CLI ausführen; beim Import aus dem Unit-Test (VITEST gesetzt) NICHT laufen —
// ebenso wenig, wenn ein anderes Skript nur die reinen Funktionen (`erhebe`,
// `abstraktEli`) importiert und dazu FEDLEX_NUR_IMPORT setzt (fedlex-repin-batch),
// sonst schriebe der Import ungewollt parameter-verfall.md + currency.json.
if (!process.env.VITEST && !process.env.FEDLEX_NUR_IMPORT) void main();
