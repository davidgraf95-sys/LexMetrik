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
  // Staat & Verfassung
  ['171.10', 'ParlG', 'oeffentlich'],
  ['172.010', 'RVOG', 'oeffentlich'],
  ['161.1', 'BPR', 'oeffentlich'],
  // Privatrecht & Nebenerlasse
  // (PartG 211.231, IPRG 291 → Volltext-Snapshot 23.6.2026, im ERLASS_REGISTER)
  ['232.12', 'DesG', 'privat'],
  ['232.16', 'SortG', 'privat'],
  ['221.112.944', 'PrHG', 'privat'],
  ['944.3', 'PRG', 'privat'],
  ['957.1', 'BEG', 'privat'],
  // Strafrecht & Strafverfahren
  // (JStG 311.1, BetmG 812.121, VStrR 313.0 → Volltext-Snapshot 23.6.2026, im ERLASS_REGISTER)
  ['321.0', 'MStG', 'straf'],
  ['322.1', 'MStP', 'straf'],
  ['351.1', 'IRSG', 'straf'],
  // Verwaltung: Verfahren & Rechtspflege
  ['170.32', 'VG', 'prozess'],
  ['152.3', 'BGÖ', 'oeffentlich'],
  // Sozialversicherung
  ['831.30', 'ELG', 'sozial-abgaben'],
  ['833.1', 'MVG', 'sozial-abgaben'],
  // Migration & Gleichstellung
  ['141.0', 'BüG', 'oeffentlich'],
  // Raumplanung, Bau & Umwelt
  ['814.20', 'GSchG', 'oeffentlich'],
  ['451', 'NHG', 'oeffentlich'],
  ['921.0', 'WaG', 'oeffentlich'],
  ['730.0', 'EnG', 'oeffentlich'],
  ['641.71', 'CO2-Gesetz', 'oeffentlich'],
  // Wirtschaft & Finanzmarkt
  ['951.31', 'KAG', 'oeffentlich'],
  ['954.1', 'FINIG', 'oeffentlich'],
  ['961.01', 'VAG', 'oeffentlich'],
  ['950.1', 'FIDLEG', 'oeffentlich'],
  // Gesundheit, Sicherheit & Infrastruktur
  ['818.101', 'EpG', 'oeffentlich'],
  ['810.21', 'TxG', 'oeffentlich'],
  ['817.0', 'LMG', 'oeffentlich'],
  ['172.056.1', 'BöB', 'oeffentlich'],
  ['748.0', 'LFG', 'oeffentlich'],
  ['742.101', 'EBG', 'oeffentlich'],
  ['784.10', 'FMG', 'oeffentlich'],
  ['510.10', 'MG', 'oeffentlich'],
  // ── Wichtige Verordnungen (Ausführungsrecht zu den Leitgesetzen) ──
  ['831.101', 'AHVV', 'sozial-abgaben'],
  ['831.201', 'IVV', 'sozial-abgaben'],
  ['831.301', 'ELV', 'sozial-abgaben'],
  ['831.441.1', 'BVV 2', 'sozial-abgaben'],
  ['832.202', 'UVV', 'sozial-abgaben'],
  ['837.02', 'AVIV', 'sozial-abgaben'],
  ['830.11', 'ATSV', 'sozial-abgaben'],
  ['832.112.31', 'KLV', 'sozial-abgaben'],
  ['641.201', 'MWSTV', 'sozial-abgaben'],
  ['642.211', 'VStV', 'sozial-abgaben'],
  ['142.201', 'VZAE', 'oeffentlich'],
  ['741.11', 'VRV', 'oeffentlich'],
  ['741.51', 'VZV', 'oeffentlich'],
  ['741.21', 'SSV', 'oeffentlich'],
  ['211.112.2', 'ZStV', 'privat'],
  ['235.11', 'DSV', 'oeffentlich'],
  // Völker- & Europarecht → Rubrik «International» (rechtsgebiet 'international').
  // Staatsverträge SR 0.* — Titel/ELI/Stand verifiziert via Fedlex-SPARQL (§7).
  ['0.101', 'EMRK', 'international'],            // Europäische Menschenrechtskonvention
  ['0.221.211.1', 'CISG', 'international'],      // UN-/Wiener Kaufrecht
  ['0.275.12', 'LugÜ', 'international'],         // Lugano-Übereinkommen
  ['0.274.131', 'HZÜ', 'international'],         // Haager Zustellungsübereinkommen
  ['0.274.132', 'HBewÜ', 'international'],       // Haager Beweisaufnahmeübereinkommen
  ['0.211.230.02', 'HKÜ', 'international'],      // Haager Kindesentführungsübereinkommen
  ['0.142.112.681', 'FZA', 'international'],     // Freizügigkeitsabkommen CH–EU
  ['0.111', 'VRK', 'international'],             // Wiener Übereinkommen über das Recht der Verträge
  ['0.103.2', 'UNO-Pakt II', 'international'],   // UNO-Pakt II (bürgerliche/politische Rechte)
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
    // Fedlex-Titel können HTML-Markup tragen (z. B. CO<sub>2</sub>); die UI
    // rendert reinen Text → Tags entfernen, Whitespace normalisieren.
    const titel = (b.title?.value ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    return { eli, titel, stand: b.date?.value ?? '' };
  } catch { return null; }
}

const eintraege: string[] = [];
const fehler: string[] = [];
for (const [sr, kuerzel, gebiet] of LISTE) {
  const r = await frage(sr);
  if (!r || !r.titel) { fehler.push(`${kuerzel} (SR ${sr})`); continue; }
  if (!r.stand) console.log(`  ⚠ ${kuerzel}: keine Konsolidierung ≤ heute gefunden — Stand=${heute} (prüfen)`);
  const key = kuerzel.toUpperCase()
    .replace(/Ä/g, 'AE').replace(/Ö/g, 'OE').replace(/Ü/g, 'UE')
    .replace(/[^A-Z0-9]/g, '_');
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
