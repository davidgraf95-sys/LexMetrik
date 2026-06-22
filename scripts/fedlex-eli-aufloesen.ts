/**
 * Resolver: SR-Nummer → Fedlex-ELI + GELTENDE Konsolidierung (§7), für das
 * Nachladen weiterer Bund-Volltexte. Fragt den amtlichen Fedlex-SPARQL-Endpoint
 * (gleicher wie check:fedlex-versionen) und gibt fertige `fedlex-cache.sh`-
 * Zeilen aus:  name|eli|YYYYMMDD|0|art_1
 *
 * Geltend = grösste dateApplicability ≤ heute (künftige Fassungen werden NICHT
 * gepinnt, §7). html-N=0 + pflicht-anker art_1 sind Startwerte; der Cache-Lauf
 * (scripts/fedlex-cache.sh) probiert -N-Varianten automatisch durch.
 *
 * Aufruf:
 *   npx vite-node scripts/fedlex-eli-aufloesen.ts -- 830.1 831.10 …   (SR-Liste)
 *   npx vite-node scripts/fedlex-eli-aufloesen.ts -- --register=GRUPPE (aus Register)
 */
import { ERLASS_REGISTER } from '../src/lib/normtext/register.ts';

const ENDPOINT = 'https://fedlex.data.admin.ch/sparqlendpoint';
const heute = new Date().toISOString().slice(0, 10);

const args = process.argv.slice(2).filter((a) => a !== '--');
// SR-Liste: entweder direkt als Argumente, oder alle nur-live-link-Erlasse.
let ziele: { sr: string; key: string }[];
if (args.length && !args[0].startsWith('--')) {
  ziele = args.map((sr) => ({ sr, key: sr }));
} else {
  ziele = (ERLASS_REGISTER as Array<{ ebene: string; status: string; sr: string; key: string }>)
    .filter((r) => r.ebene === 'bund' && r.status === 'nur-live-link')
    .map((r) => ({ sr: String(r.sr), key: r.key }));
}

async function sparql(query: string): Promise<Array<Record<string, { value: string }>>> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/sparql-results+json' },
    body: `query=${encodeURIComponent(query)}`,
  });
  if (!res.ok) throw new Error(`SPARQL ${res.status}`);
  return ((await res.json()) as { results: { bindings: Array<Record<string, { value: string }>> } }).results.bindings;
}

// Pro SR-Nummer: ELI + alle Konsolidierungsdaten.
async function loese(sr: string): Promise<{ eli: string; geltend: string | null; anzahl: number } | null> {
  const bindings = await sparql(`
PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
SELECT ?cc ?date WHERE {
  ?cc a jolux:ConsolidationAbstract ; jolux:classifiedByTaxonomyEntry ?e .
  ?e skos:notation ?sr . FILTER(str(?sr) = "${sr}")
  OPTIONAL { ?c jolux:isMemberOf ?cc ; jolux:dateApplicability ?date . }
} LIMIT 200`);
  if (!bindings.length) return null;
  const eli = bindings[0].cc.value.replace('https://fedlex.data.admin.ch/eli/', '');
  const daten = [...new Set(bindings.filter((b) => b.date).map((b) => b.date.value.slice(0, 10)))].sort();
  const geltend = daten.filter((d) => d <= heute).pop() ?? null; // grösste ≤ heute
  return { eli, geltend, anzahl: daten.length };
}

const ok: string[] = [];
const fehler: string[] = [];
for (const z of ziele) {
  try {
    const r = await loese(z.sr);
    if (!r) { fehler.push(`${z.key} (SR ${z.sr}): keine ConsolidationAbstract`); continue; }
    if (!r.geltend) { fehler.push(`${z.key} (SR ${z.sr}): ELI ${r.eli}, aber keine geltende Konsolidierung ≤ ${heute}`); continue; }
    ok.push(`  "${z.key.toLowerCase()}|${r.eli}|${r.geltend.replace(/-/g, '')}|0|art_1"`);
  } catch (e) {
    fehler.push(`${z.key} (SR ${z.sr}): ${e instanceof Error ? e.message : e}`);
  }
}

console.log(`\n# ${ok.length}/${ziele.length} aufgelöst (Stand ${heute}). Zeilen für scripts/fedlex-cache.sh:\n`);
console.log(ok.join('\n'));
if (fehler.length) {
  console.log(`\n# ${fehler.length} OFFEN (manuell prüfen):`);
  for (const f of fehler) console.log(`#   ${f}`);
}
