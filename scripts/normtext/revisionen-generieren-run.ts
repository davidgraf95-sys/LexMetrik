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
  ermittleBelegteOcs, type ErlassMeta,
} from './revisionen-generieren.ts';
import type { SparqlBinding } from '../fedlex-sparql.ts';

const datumArg = process.argv.find((a) => a.startsWith('--datum='));
const heute = datumArg ? datumArg.slice('--datum='.length) : '';
if (!/^\d{4}-\d{2}-\d{2}$/.test(heute)) { console.error('--datum=YYYY-MM-DD nötig (§2)'); process.exit(1); }
const nurArg = process.argv.find((a) => a.startsWith('--nur='));
const nur = nurArg ? new Set(nurArg.slice('--nur='.length).split(',').map((s) => s.trim())) : null;

const SIDECAR_DIR = 'public/normtext/revisionen';
const RAW_DIR = 'bibliothek/normtext/revisionen-raw';

// ── cache.sh-Pins: Register-key UND SR → { abstractEli (cc/…), kons (Korpus-Stand ISO) } ──
// SSoT §5: die Pins leben EINMAL in scripts/fedlex-cache.sh (name|eli|YYYYMMDD|N|anker|sr).
//
// WARUM ZWEI SCHLÜSSEL (W2·18-FEHLERBUCH, 12.9.2026). Die SR-Nummer ist KEIN
// eindeutiger Pin-Schlüssel: eine Totalrevision behält den SR-Slot und bekommt
// eine neue ELI — SR 412.103.1 trägt seit 1.3.2026 zwei Pins (`bmv` =
// cc/2009/423, aufgehoben; `bmv_2025` = cc/2025/408, geltend). Eine reine
// SR-Map behält den ZULETZT gelesenen Pin und hätte dem historischen Erlass
// still die ELI und den Korpus-Stand seiner Nachfolgerin untergeschoben
// (gemessener Rot-Beweis 12.9.2026: SR 412.103.1 → cc/2025/408 / 2026-03-01
// statt cc/2009/423 / 2016-08-23 — die Pfad-(a)-Stände wären von 6 auf 1
// gefallen, der Sammelerlass-Marker 2013-01-01 verschwunden und jedes
// `nichtKonsolidiert` falsch berechnet worden).
//
// Der eindeutige Schlüssel ist der PIN-NAME: der Snapshot-Generator leitet den
// Register-key als `name.toUpperCase()` ab (`gesetzKey` in
// scripts/normtext-snapshot.ts), also gilt für jeden Bund-Volltext-Erlass
// `pinName === key.toLowerCase()`. Die SR-Map bleibt als Rückfall bestehen
// (Altbestand/Sonderfälle), wird aber nur noch befragt, wenn der key-Treffer
// fehlt — und sie trägt bei Mehrdeutigkeit bewusst den ERSTEN Pin, statt den
// letzten gewinnen zu lassen.
interface PinBefund { abstractEli: string; kons: string; konsKompakt: string }
function lesePinsMitSr(): { nachKey: Map<string, PinBefund>; nachSr: Map<string, PinBefund> } {
  const CACHE_SH = resolve(dirname(fileURLToPath(import.meta.url)), '../fedlex-cache.sh');
  const sh = readFileSync(CACHE_SH, 'utf8');
  const nachKey = new Map<string, PinBefund>();
  const nachSr = new Map<string, PinBefund>();
  for (const m of sh.matchAll(/^\s*"([a-z0-9_]+)\|([a-z0-9/_]+)\|(\d{8})\|[^|]*\|[^|]*\|([0-9.]+)"/gm)) {
    const kons = `${m[3].slice(0, 4)}-${m[3].slice(4, 6)}-${m[3].slice(6, 8)}`;
    const befund: PinBefund = { abstractEli: m[2], kons, konsKompakt: m[3] };
    nachKey.set(m[1].toUpperCase(), befund);
    if (!nachSr.has(m[4])) nachSr.set(m[4], befund);
  }
  return { nachKey, nachSr };
}

let meta = grundmenge();
if (nur) meta = meta.filter((m) => nur.has(m.key));
if (!meta.length) { console.error('normtext:revisionen: leere Grundmenge (--nur ohne Treffer?)'); process.exit(1); }

const pins = lesePinsMitSr();
/** Pin eines Erlasses: eindeutig über den Register-key, Rückfall SR (s. lesePinsMitSr). */
const pinFuer = (key: string, sr: string): PinBefund | undefined => pins.nachKey.get(key) ?? pins.nachSr.get(sr);
const ocZuBotschaft = botschaftIndex();
console.log(`revisionen: Grundmenge ${meta.length} Erlasse · Botschafts-oc-Index ${ocZuBotschaft.size} · SPARQL Pfad (b) …`);

// SR-Dedupe vor der Abfrage (W2·18-FEHLERBUCH, 12.9.2026): seit der BMV-
// Totalrevision tragen ZWEI Register-Erlasse dieselbe SR (412.103.1). Ohne
// Dedupe steht die SR zweimal im VALUES-Block, der Endpunkt liefert jede Zeile
// doppelt, und `bNachSr` legt 62 statt 31 Bindings in BEIDE store-raw-Dateien —
// ein aufgeblähtes, nicht mehr reproduzierbares Roh-Artefakt (gemessen: raw
// BMV.json 31 → 62 Bindings, Sidecar-Inhalt unverändert, weil baueRevisionen
// über die oc-URI dedupliziert). Die Timeline selbst ist bewusst SR-weit —
// beide Erlasse teilen sie sich, jeder mit seinem eigenen Korpus-Stand.
const metaAbfrage = meta.filter((m, i, a) => a.findIndex((x) => x.sr === m.sr) === i);
const bindings = await holeBindingsB(metaAbfrage, fetch);

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
let belegtTrotzDatum = 0;
// dateDocument (Beschluss-/Erlassdatum) darf NICHT in der Zukunft liegen — das wäre
// ein Datenfehler. dateEntryInForce hingegen DARF künftig sein (Fedlex publiziert
// bereits erlassene, künftig in Kraft tretende Amendments): die werden als
// nichtKonsolidiert markiert und ehrlich angezeigt (Finding 4), nicht verworfen.
const datumsfehler: string[] = [];

for (const m of meta as ErlassMeta[]) {
  const pin = pinFuer(m.key, m.sr);
  if (!pin) { ohnePin++; console.warn(`  ⚠ kein cache.sh-Pin für SR ${m.sr} (${m.key}) — Pfad-(a)-Cross-Check entfällt.`); }
  const bBindings = bNachSr.get(m.sr) ?? [];
  const aStaende = pin ? await holeStaendeA(pin.abstractEli, fetch) : [];
  const korpusStand = pin?.kons ?? heute;

  // Finding 4b (W2·18-FEHLERBUCH #19): Kandidaten für den Text-Beleg sind alle oc, deren
  // dateForce > korpusStand WÄRE (over-inclusive — baueRevisionen prüft die Bedingung
  // erneut). Nur mit Pin auflösbar (Konsolidierungs-ELI = abstractEli + Korpus-Stand-Datum).
  const kandidatOcs = [...new Set(
    bBindings.filter((b) => (b.dateForce?.value ?? '') > korpusStand).map((b) => b.oc?.value).filter((v): v is string => !!v),
  )];
  const konsEli = pin ? `${pin.abstractEli}/${pin.konsKompakt}` : null;
  const belegteOcs = konsEli && kandidatOcs.length ? await ermittleBelegteOcs(konsEli, kandidatOcs, fetch) : new Set<string>();
  belegtTrotzDatum += belegteOcs.size;

  // store-raw (deterministisch, sortiert): Bindings byte-stabil ablegen.
  const rawBindings = [...bBindings].sort((a, b) =>
    (a.oc?.value ?? '') < (b.oc?.value ?? '') ? -1 : (a.oc?.value ?? '') > (b.oc?.value ?? '') ? 1
    : (a.dateForce?.value ?? '') < (b.dateForce?.value ?? '') ? -1 : 1);
  writeFileSync(`${RAW_DIR}/${m.key}.json`,
    JSON.stringify({
      sr: m.sr, korpusStand, bBindings: rawBindings, aStaende: [...aStaende].sort(),
      belegteOcs: [...belegteOcs].sort(),
    }, null, 2) + '\n', 'utf8');

  const sidecar = baueRevisionen(m, bBindings, aStaende, korpusStand, ocZuBotschaft, heute, belegteOcs);
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
console.log(`  Erlasse mit ≥1 Änderung ${mitAenderung}/${meta.length} · Änderungs-Einträge ${gesamtEintraege} · Botschafts-Join ${mitBotschaft} · Sammelerlass-Marker ${sammelMarker} · künftig-in-Kraft ${kuenftig} · Finding-4b-Text-Beleg trotz Datum ${belegtTrotzDatum}${ohnePin ? ` · ohne Pin ${ohnePin}` : ''}`);
