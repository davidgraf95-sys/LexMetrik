// scripts/normtext/revisionen-generieren-run.ts
// Dünner CLI-Runner des Revisionen-Generators (Paket 5, W2·6-REV). Getrennt vom reinen
// Modul revisionen-generieren.ts, damit dieses seiteneffektfrei importierbar bleibt
// (Test + check:revisionen(-netz)) — Repo-Muster botschaften-generieren(-run).
//
// §2: --datum aus der Shell (kein Date.now). Netz-Lauf.
// Aufruf: npm run normtext:revisionen -- --datum=$(date +%F) [--nur=DSG,OR]
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import {
  grundmenge, holeBindingsB, holeStaendeA, baueRevisionen, serialisiere, botschaftIndex,
  type ErlassMeta,
} from './revisionen-generieren.ts';
import type { SparqlBinding } from '../fedlex-sparql.ts';

const datumArg = process.argv.find((a) => a.startsWith('--datum='));
const heute = datumArg ? datumArg.slice('--datum='.length) : '';
if (!/^\d{4}-\d{2}-\d{2}$/.test(heute)) { console.error('--datum=YYYY-MM-DD nötig (§2)'); process.exit(1); }
const nurArg = process.argv.find((a) => a.startsWith('--nur='));
const nur = nurArg ? new Set(nurArg.slice('--nur='.length).split(',').map((s) => s.trim())) : null;

const SIDECAR_DIR = 'public/normtext/revisionen';
const RAW_DIR = 'bibliothek/normtext/revisionen-raw';

// ── cache.sh-Pins: SR → { abstractEli (cc/…), kons (Korpus-Stand ISO) } ─────────
// SSoT §5: die Pins leben EINMAL in scripts/fedlex-cache.sh (name|eli|YYYYMMDD|N|anker|sr).
function lesePinsMitSr(): Map<string, { abstractEli: string; kons: string }> {
  const CACHE_SH = resolve(dirname(fileURLToPath(import.meta.url)), '../fedlex-cache.sh');
  const sh = readFileSync(CACHE_SH, 'utf8');
  const map = new Map<string, { abstractEli: string; kons: string }>();
  for (const m of sh.matchAll(/^\s*"([a-z0-9_]+)\|([a-z0-9/_]+)\|(\d{8})\|[^|]*\|[^|]*\|([0-9.]+)"/gm)) {
    const kons = `${m[3].slice(0, 4)}-${m[3].slice(4, 6)}-${m[3].slice(6, 8)}`;
    map.set(m[4], { abstractEli: m[2], kons });
  }
  return map;
}

let meta = grundmenge();
if (nur) meta = meta.filter((m) => nur.has(m.key));
if (!meta.length) { console.error('normtext:revisionen: leere Grundmenge (--nur ohne Treffer?)'); process.exit(1); }

const pins = lesePinsMitSr();
const ocZuBotschaft = botschaftIndex();
console.log(`revisionen: Grundmenge ${meta.length} Erlasse · Botschafts-oc-Index ${ocZuBotschaft.size} · SPARQL Pfad (b) …`);

const bindings = await holeBindingsB(meta, fetch);

// store-raw (§11): je Erlass { sr, bBindings, aStaende } → Re-Parse ohne Re-Crawl.
mkdirSync(RAW_DIR, { recursive: true });
mkdirSync(SIDECAR_DIR, { recursive: true });

const bNachSr = new Map<string, SparqlBinding[]>();
for (const m of meta) bNachSr.set(m.sr, []);
for (const b of bindings) {
  const sr = b.sr?.value;
  if (sr && bNachSr.has(sr)) bNachSr.get(sr)!.push(b);
}

let mitAenderung = 0, gesamtEintraege = 0, mitBotschaft = 0, sammelMarker = 0, ohnePin = 0, kuenftig = 0;
// dateDocument (Beschluss-/Erlassdatum) darf NICHT in der Zukunft liegen — das wäre
// ein Datenfehler. dateEntryInForce hingegen DARF künftig sein (Fedlex publiziert
// bereits erlassene, künftig in Kraft tretende Amendments): die werden als
// nichtKonsolidiert markiert und ehrlich angezeigt (Finding 4), nicht verworfen.
const datumsfehler: string[] = [];

for (const m of meta as ErlassMeta[]) {
  const pin = pins.get(m.sr);
  if (!pin) { ohnePin++; console.warn(`  ⚠ kein cache.sh-Pin für SR ${m.sr} (${m.key}) — Pfad-(a)-Cross-Check entfällt.`); }
  const bBindings = bNachSr.get(m.sr) ?? [];
  const aStaende = pin ? await holeStaendeA(pin.abstractEli, fetch) : [];
  const korpusStand = pin?.kons ?? heute;

  // store-raw (deterministisch, sortiert): Bindings byte-stabil ablegen.
  const rawBindings = [...bBindings].sort((a, b) =>
    (a.oc?.value ?? '') < (b.oc?.value ?? '') ? -1 : (a.oc?.value ?? '') > (b.oc?.value ?? '') ? 1
    : (a.dateForce?.value ?? '') < (b.dateForce?.value ?? '') ? -1 : 1);
  writeFileSync(`${RAW_DIR}/${m.key}.json`,
    JSON.stringify({ sr: m.sr, korpusStand, bBindings: rawBindings, aStaende: [...aStaende].sort() }, null, 2) + '\n', 'utf8');

  const sidecar = baueRevisionen(m, bBindings, aStaende, korpusStand, ocZuBotschaft, heute);
  writeFileSync(`${SIDECAR_DIR}/${m.key}.json`, serialisiere(sidecar), 'utf8');

  const ae = sidecar.revisionen.filter((r) => r.art === 'aenderung');
  if (ae.length) mitAenderung++;
  gesamtEintraege += ae.length;
  mitBotschaft += ae.filter((r) => r.botschaftKey).length;
  sammelMarker += sidecar.revisionen.filter((r) => r.art === 'sammelerlass-marker').length;
  for (const r of sidecar.revisionen) {
    if (r.dateEntryInForce > heute) kuenftig++;
    if (r.dateDocument && r.dateDocument > heute) datumsfehler.push(`${m.key}:${r.dateDocument}`);
  }
}

if (datumsfehler.length) { console.error(`revisionen: ${datumsfehler.length} Eintrag(e) mit Beschluss-Datum > ${heute} (Datenfehler): ${datumsfehler.slice(0, 5).join(', ')} …`); process.exit(1); }

console.log(`revisionen: ${meta.length} Sidecars → ${SIDECAR_DIR}/`);
console.log(`  Erlasse mit ≥1 Änderung ${mitAenderung}/${meta.length} · Änderungs-Einträge ${gesamtEintraege} · Botschafts-Join ${mitBotschaft} · Sammelerlass-Marker ${sammelMarker} · künftig-in-Kraft ${kuenftig}${ohnePin ? ` · ohne Pin ${ohnePin}` : ''}`);
