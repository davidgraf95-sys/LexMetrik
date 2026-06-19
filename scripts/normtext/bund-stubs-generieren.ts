/**
 * Generiert verifizierte «nur-live-link»-Stubs für wichtige Bundesgesetze, die
 * (noch) keinen Volltext-Snapshot haben — Kürzel/Titel/SR/ELI direkt aus dem
 * Fedlex-SPARQL-Endpoint (verifiziert, §7). Ausgabe: src/lib/normtext/
 * bund-stubs.generated.ts (nicht von Hand editieren).
 *
 * Wartungsarm: kuratierte (SR, Kürzel, Gebiet)-Liste hier; Titel + ELI + Stand
 * (neueste Konsolidierung ≤ heute) holt der Generator. §2: --datum aus Shell.
 * Aufruf: npm run normtext:bund-stubs -- --datum=$(date +%F)
 */
import { writeFileSync } from 'node:fs';
import type { Rechtsgebiet } from '../../src/lib/normtext/register.ts';

const datumArg = process.argv.find((a) => a.startsWith('--datum='));
const heute = datumArg ? datumArg.slice('--datum='.length) : '';
if (!/^\d{4}-\d{2}-\d{2}$/.test(heute)) { console.error('--datum=YYYY-MM-DD nötig (§2)'); process.exit(1); }

// Kuratierte wichtige Bundesgesetze OHNE Volltext-Snapshot (die 27 Volltext-
// Erlasse stehen separat im ERLASS_REGISTER). [SR, Kürzel, Gebiet].
const LISTE: Array<[string, string, Rechtsgebiet]> = [
  ['142.20', 'AIG', 'oeffentlich'],
  ['142.31', 'AsylG', 'oeffentlich'],
  ['151.1', 'GlG', 'oeffentlich'],
  ['211.231', 'PartG', 'privat'],
  ['211.412.11', 'BGBB', 'privat'],
  ['311.1', 'JStG', 'straf'],
  ['642.14', 'StHG', 'sozial-abgaben'],
  ['831.10', 'AHVG', 'sozial-abgaben'],
  ['831.20', 'IVG', 'sozial-abgaben'],
  ['831.40', 'BVG', 'sozial-abgaben'],
  ['832.20', 'UVG', 'sozial-abgaben'],
  ['837.0', 'AVIG', 'sozial-abgaben'],
  ['700', 'RPG', 'oeffentlich'],
  ['814.01', 'USG', 'oeffentlich'],
  ['814.20', 'GSchG', 'oeffentlich'],
  ['451', 'NHG', 'oeffentlich'],
  ['935.61', 'BGFA', 'prozess'],
  ['955.0', 'GwG', 'oeffentlich'],
  ['952.0', 'BankG', 'oeffentlich'],
  ['951.31', 'KAG', 'oeffentlich'],
  ['510.10', 'MG', 'oeffentlich'],
  ['0.101', 'EMRK', 'oeffentlich'],
];

const ENDPOINT = 'https://fedlex.data.admin.ch/sparqlendpoint';
const DEU = '<http://publications.europa.eu/resource/authority/language/DEU>';

async function frage(sr: string): Promise<{ eli: string; titel: string; stand: string } | null> {
  const q = `PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
SELECT ?abstract ?title ?date WHERE {
  ?abstract a jolux:ConsolidationAbstract ; jolux:classifiedByTaxonomyEntry ?tax .
  ?tax skos:notation ?sr . FILTER(str(?sr) = "${sr}")
  ?abstract jolux:isRealizedBy ?expr . ?expr jolux:language ${DEU} ; jolux:title ?title .
  OPTIONAL { ?c jolux:isMemberOf ?abstract ; jolux:dateApplicability ?date . FILTER(?date <= "${heute}"^^xsd:date) }
} ORDER BY DESC(?date) LIMIT 1`;
  try {
    const res = await fetch(`${ENDPOINT}?query=${encodeURIComponent(q)}`, { headers: { Accept: 'application/sparql-results+json' }, signal: AbortSignal.timeout(25000) });
    if (!res.ok) return null;
    const b = (await res.json() as { results: { bindings: Array<Record<string, { value: string }>> } }).results.bindings[0];
    if (!b?.abstract) return null;
    const eli = b.abstract.value.replace('https://fedlex.data.admin.ch', 'https://www.fedlex.admin.ch') + '/de';
    return { eli, titel: b.title?.value ?? '', stand: b.date?.value ?? '' };
  } catch { return null; }
}

const eintraege: string[] = [];
const fehler: string[] = [];
for (const [sr, kuerzel, gebiet] of LISTE) {
  const r = await frage(sr);
  if (!r || !r.titel) { fehler.push(`${kuerzel} (SR ${sr})`); continue; }
  if (!r.stand) console.log(`  ⚠ ${kuerzel}: keine Konsolidierung ≤ heute gefunden — Stand=${heute} (prüfen)`);
  const key = kuerzel.toUpperCase().replace(/[^A-Z0-9]/g, '_');
  const esc = (s: string) => s.replace(/'/g, "\\'");
  eintraege.push(`  { key: '${key}', ebene: 'bund', kuerzel: '${esc(kuerzel)}', titel: '${esc(r.titel)}', sr: '${sr}', rechtsgebiet: '${gebiet}', sprache: 'de', rang: 90, status: 'nur-live-link', quelleUrl: '${r.eli}', stand: '${r.stand || heute}' },`);
  console.log(`  ok ${kuerzel.padEnd(8)} SR ${sr.padEnd(12)} ${r.titel.slice(0, 50)}`);
}

const datei = `// AUTO-GENERIERT von scripts/normtext/bund-stubs-generieren.ts — NICHT von Hand editieren.
// Verifizierte «nur-live-link»-Stubs wichtiger Bundesgesetze (Titel/ELI/Stand aus
// Fedlex-SPARQL, §7). Regenerieren: npm run normtext:bund-stubs -- --datum=$(date +%F)
import type { ErlassRegistereintrag } from './register';

export const BUND_STUBS: ErlassRegistereintrag[] = [
${eintraege.join('\n')}
];
`;
writeFileSync('src/lib/normtext/bund-stubs.generated.ts', datei, 'utf8');
console.log(`\nBund-Stubs: ${eintraege.length}/${LISTE.length} → src/lib/normtext/bund-stubs.generated.ts`);
if (fehler.length) console.log(`Nicht aufgelöst: ${fehler.join(', ')}`);
