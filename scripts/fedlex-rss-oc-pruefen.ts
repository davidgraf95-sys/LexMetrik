// ─── G-RSS · STALE-PENDING-Wächter via amtlichem RSS-OC-Feed ─────────────────
//
// Das Problem (Ökosystem-Prüfung, live verifiziert): die Fedlex-KONSOLIDIERUNG
// (cc/SR) hinkt der AMTLICHEN SAMMLUNG (AS = eli/oc/…) um Tage–Wochen nach. In
// diesem Fenster ist eine AS-Änderung IN KRAFT, aber unser Konsolidierungs-Poll
// (check:fedlex-versionen, nur dateApplicability der gepinnten cc-Erlasse) SIEHT
// sie noch nicht → wir servieren still veraltetes Recht ohne Flag.
//
// Dieses Skript schliesst die Lücke mit dem amtlichen Signal, das die
// Konsolidierung selbst NICHT liefert: dem RSS-OC-Feed (neue AS-Akte).
//
//   (a) RSS-OC-Feed holen (amtlich) und je AS-Akt (eli/oc/JAHR/NR) auflesen;
//   (b) je AS-Akt per SPARQL auflösen  · sein dateEntryInForce
//                                       · WELCHE cc-Erlasse er ändert;
//   (c) Abgleich gegen UNSERE gepinnten Erlasse (scripts/fedlex-pins.ts SSoT):
//       AS in Kraft (≤ heute) · trifft gepinnten cc · Pin-Konsolidierung ÄLTER
//       als das AS-Inkraft-Datum · UND noch KEINE Konsolidierung ≥ AS-Datum im
//       Triplestore  → STALE-PENDING-WARN («SR X: AS YYYY/NR in Kraft seit D,
//       Konsolidierung folgt»).
//
//   npm run check:rss-oc            (Netz; advisory)
//   npm run check:rss-oc -- --datum=2026-07-18   (fixes „heute“, Determinismus)
//
// Exit 0 → advisory: nur WARN (oder nichts). Nachlauf der Konsolidierung ist der
//          NORMALFALL, kein Gate-Brecher — die WARN ist ein Hinweis zum Nachlesen
//          der geänderten Artikel aus dem AS-Akt, kein Fehler.
// Exit 1 → NUR bei Fetch-/Parse-Fehler (Feed nicht erreichbar / Angular-Shell /
//          SPARQL tot) — dann ist keine Aussage möglich.
//
// ── Amtlicher-Host-Falle (Skill scraping-swiss-official-sources, Fakt 3) ──────
// Der Feed wird vom DATEN-Host bezogen: fedlex.DATA.admin.ch/api/rss-oc-de.xml
// liefert echtes application/xml. Der www-Host (www.fedlex.admin.ch/api/…) liefert
// content-verhandlungs-BLIND die Angular-Casemates-SHELL (text/html, HTTP 200) —
// live verifiziert am 18.7.2026. Darum harter Content-Type-/Shell-Riegel unten:
// niemals nach Statuscode urteilen (200 lügt), immer nach Body/Content-Type.
//
// ── AS→cc-Relation (empirisch am amtlichen Endpunkt ermittelt, Beleg im PR) ───
// jolux verlinkt einen AS-Akt NICHT direkt auf den cc-Erlass. Der belastbare
// Pfad ist die jolux:PublicationTask: eine Konsolidierungs-Aufgabe je (cc, Datum),
// die per jolux:actToTakeIntoAccount die einzurechnenden AS-Akte sammelt. Rückwärts
//   ?task jolux:actToTakeIntoAccount <asAkt> ; a jolux:PublicationTask .
// liefert die Task-URIs; die Task-URI kodiert den cc-Erlass + das Ziel-Datum:
//   …/eli/pudocc/{ccEli}/{YYYYMMDD}/{seq}/task
// (Gegenprobe: jolux:legalResourceGenerator lieferte 0 Zeilen — falsche Property.)
//
// §0b Regel 5 / §2: reine Entscheidlogik (bewerteStalePending) deterministisch und
// vom Netz getrennt; injizierbare fetchImpl; kein Date.now() in der Logik — „heute“
// kommt als Parameter/aus --datum.

import { sparqlBatch, type FetchImpl } from './fedlex-sparql.ts';
import { lesePinsVoll, type PinVoll } from './fedlex-pins.ts';

export const RSS_OC_FEED = 'https://fedlex.data.admin.ch/api/rss-oc-de.xml';
const FEDLEX_ELI = 'https://fedlex.data.admin.ch/eli/';

// ─── Reine Helfer (netzfrei, testbar) ────────────────────────────────────────

/** Ein AS-Akt aus dem Feed: kurz-ELI (oc/JAHR/NR) + Titel (für „betroffene Artikel“). */
export type AsFeedPosten = { eli: string; titel: string };

/**
 * RSS-OC-Feed-XML → AS-Posten. Liest je <item> die kurze ELI aus <guid>/<link>
 * (Host abgestreift → „oc/2026/394“) und den <title>. Regex über die Item-Blöcke
 * genügt (flaches, stabiles RSS-2.0-Schema); keine XML-Lib-Abhängigkeit.
 */
export function parseRssItems(xml: string): AsFeedPosten[] {
  const posten: AsFeedPosten[] = [];
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const block = m[1];
    const link =
      (block.match(/<guid[^>]*>\s*([^<]+?)\s*<\/guid>/) ?? block.match(/<link>\s*([^<]+?)\s*<\/link>/))?.[1] ?? '';
    const eli = kurzEli(link.trim());
    if (!eli || !eli.startsWith('oc/')) continue;
    const titelRoh = block.match(/<title>\s*([\s\S]*?)\s*<\/title>/)?.[1] ?? '';
    posten.push({ eli, titel: entschaerfeXml(titelRoh.trim()) });
  }
  return posten;
}

/** Fedlex-ELI-URL → kurze ELI („https://…/eli/oc/2026/394“ → „oc/2026/394“). */
export function kurzEli(url: string): string | null {
  const i = url.indexOf('/eli/');
  if (i === -1) return null;
  return url.slice(i + '/eli/'.length).replace(/\/$/, '');
}

const XML_ENT: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'" };
function entschaerfeXml(s: string): string {
  return s.replace(/&(amp|lt|gt|quot|apos);/g, (m) => XML_ENT[m] ?? m);
}

/**
 * PublicationTask-URI → geänderter cc-Erlass (kurz-ELI) oder null.
 *   …/eli/pudocc/cc/2005/478/20260716/1/task  →  „cc/2005/478“
 * Der cc-Teil ist alles zwischen „pudocc/“ und dem 8-stelligen Ziel-Datum.
 */
export function ccAusTaskUri(taskUri: string): string | null {
  const m = taskUri.match(/\/pudocc\/(cc\/.+?)\/(\d{8})\/\d+\/task\b/);
  return m ? m[1] : null;
}

/** Der befund-relevante AS-Akt, nach der Netz-Auflösung. */
export type AsPosten = {
  eli: string;
  titel: string;
  inkraft: string | null; // frühestes dateEntryInForce (ISO „YYYY-MM-DD“) ≤ heute, sonst frühestes; null=keins
  ccs: string[]; // geänderte cc-Erlasse (kurz-ELI), dedupliziert
};

export type StaleBefund = {
  sr: string;
  name: string;
  asEli: string;
  asTitel: string;
  inkraft: string;
  pinKons: string;
  ccEli: string;
};

/**
 * REINE Entscheidlogik (deterministisch). STALE-PENDING gdw. ALLE gelten:
 *   (1) der AS-Akt ist in Kraft:                     inkraft != null && inkraft ≤ heute
 *   (2) er ändert einen von uns GEPINNTEN cc-Erlass
 *   (3) die gepinnte Konsolidierung ist ÄLTER als das AS-Inkraft-Datum:
 *                                                    pin.kons < inkraft
 *   (4) es liegt noch KEINE Konsolidierung ≥ inkraft im Triplestore
 *       (sonst nur Pin-Rückstand = ÜBERHOLT, Sache von check:fedlex-versionen).
 * Ausgabe stabil sortiert (sr, dann asEli) → Determinismus.
 */
export function bewerteStalePending(
  posten: AsPosten[],
  pins: PinVoll[],
  konsProCc: Map<string, string[]>,
  heute: string,
): StaleBefund[] {
  const pinProCc = new Map<string, PinVoll>();
  for (const p of pins) if (p.eli.startsWith('cc/')) pinProCc.set(p.eli, p);

  const befunde: StaleBefund[] = [];
  for (const a of posten) {
    const inkraft = a.inkraft;
    if (!inkraft || inkraft > heute) continue; // (1)
    for (const cc of a.ccs) {
      const pin = pinProCc.get(cc); // (2)
      if (!pin) continue;
      if (!(pin.kons < inkraft)) continue; // (3)
      const kons = konsProCc.get(cc) ?? [];
      const hatDeckende = kons.some((d) => d >= inkraft); // (4)
      if (hatDeckende) continue;
      befunde.push({
        sr: pin.sr || '(ohne SR)',
        name: pin.name,
        asEli: a.eli,
        asTitel: a.titel,
        inkraft,
        pinKons: pin.kons,
        ccEli: cc,
      });
    }
  }
  befunde.sort((x, y) => x.sr.localeCompare(y.sr) || x.asEli.localeCompare(y.asEli));
  return befunde;
}

// ─── Netz-Beschaffung (injizierbare fetchImpl) ───────────────────────────────

/**
 * RSS-OC-Feed holen — mit hartem Content-Type-/Shell-Riegel (§Fakt 3): der
 * www-Host liefert die Angular-Shell (text/html, HTTP 200). Wir beziehen vom
 * DATEN-Host; wenn dennoch HTML/kein XML zurückkommt → Fehler (nicht als Feed
 * durchgehen lassen).
 */
export async function holeFeed(fetchImpl: FetchImpl = fetch): Promise<string> {
  const res = await fetchImpl(RSS_OC_FEED, { headers: { Accept: 'application/xml' } });
  if (!res.ok) throw new Error(`RSS-OC-Feed antwortet ${res.status}`);
  const ct = res.headers.get('content-type') ?? '';
  const body = await res.text();
  const kopf = body.slice(0, 200).toLowerCase();
  if (/text\/html/.test(ct) || kopf.includes('<!doctype html') || kopf.includes('<html')) {
    throw new Error(
      `RSS-OC-Feed lieferte HTML/Angular-Shell statt XML (Content-Type „${ct}“) — falscher Host? Erwartet: ${RSS_OC_FEED}`,
    );
  }
  if (!body.includes('<rss') && !body.includes('<item>')) {
    throw new Error(`RSS-OC-Feed ohne <rss>/<item> (Content-Type „${ct}“, ${body.length} B) — Format geändert?`);
  }
  return body;
}

const P_JOLUX = 'PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>';
const asUri = (eli: string) => `<${FEDLEX_ELI}${eli}>`;

/** je AS-Akt → Liste seiner dateEntryInForce (ISO). VALUES-Batching (kein UNION). */
export async function holeInkraft(elis: string[], fetchImpl: FetchImpl = fetch): Promise<Map<string, string[]>> {
  const bindings = await sparqlBatch(
    elis.map(asUri),
    (v) => `${P_JOLUX}\nSELECT ?oc ?date WHERE { VALUES ?oc { ${v} } ?oc jolux:dateEntryInForce ?date . }`,
    { fetchImpl },
  );
  const map = new Map<string, string[]>();
  for (const b of bindings) {
    const eli = kurzEli(b.oc.value);
    if (!eli) continue;
    const liste = map.get(eli) ?? [];
    liste.push(b.date.value.slice(0, 10));
    map.set(eli, liste);
  }
  return map;
}

/** je AS-Akt → geänderte cc-Erlasse (via PublicationTask/actToTakeIntoAccount). */
export async function holeGeaenderteCc(elis: string[], fetchImpl: FetchImpl = fetch): Promise<Map<string, string[]>> {
  const bindings = await sparqlBatch(
    elis.map(asUri),
    (v) =>
      `${P_JOLUX}\nSELECT ?oc ?task WHERE { VALUES ?oc { ${v} } ?task jolux:actToTakeIntoAccount ?oc ; a jolux:PublicationTask . }`,
    { fetchImpl },
  );
  const map = new Map<string, Set<string>>();
  for (const b of bindings) {
    const eli = kurzEli(b.oc.value);
    const cc = ccAusTaskUri(b.task.value);
    if (!eli || !cc) continue;
    const set = map.get(eli) ?? new Set<string>();
    set.add(cc);
    map.set(eli, set);
  }
  const out = new Map<string, string[]>();
  for (const [eli, set] of map) out.set(eli, [...set].sort());
  return out;
}

/** je cc-Erlass → alle Konsolidierungs-dateApplicability (ISO). */
export async function holeKonsolidierungen(ccElis: string[], fetchImpl: FetchImpl = fetch): Promise<Map<string, string[]>> {
  if (ccElis.length === 0) return new Map();
  const bindings = await sparqlBatch(
    ccElis.map(asUri),
    (v) =>
      `${P_JOLUX}\nSELECT ?cc ?date WHERE { VALUES ?cc { ${v} } ?c jolux:isMemberOf ?cc ; jolux:dateApplicability ?date . }`,
    { fetchImpl },
  );
  const map = new Map<string, string[]>();
  for (const b of bindings) {
    const cc = kurzEli(b.cc.value);
    if (!cc) continue;
    const liste = map.get(cc) ?? [];
    liste.push(b.date.value.slice(0, 10));
    map.set(cc, liste);
  }
  for (const liste of map.values()) liste.sort();
  return map;
}

/**
 * Das für den STALE-PENDING-Test massgebliche Inkraft-Datum eines AS-Akts:
 * das JÜNGSTE dateEntryInForce ≤ heute. Bei gestaffeltem Inkrafttreten ist die
 * NEUESTE bereits geltende Stufe die, die am ehesten noch nicht konsolidiert ist
 * (die Konsolidierung läuft dem AS nach). Gibt es keine Stufe ≤ heute (Akt noch
 * ganz künftig), das früheste künftige Datum — Bedingung (1) verwirft es dann.
 * Für Ein-Datum-Akte (der Normalfall) identisch mit dem einzigen Datum.
 */
export function inkraftDatum(daten: string[] | undefined, heute: string): string | null {
  if (!daten || daten.length === 0) return null;
  const sortiert = [...daten].sort();
  const gueltig = sortiert.filter((d) => d <= heute);
  return gueltig.length > 0 ? gueltig[gueltig.length - 1] : sortiert[0];
}

// ─── Orchestrierung (Netz) ───────────────────────────────────────────────────

export async function erhebe(
  heute: string,
  fetchImpl: FetchImpl = fetch,
): Promise<{ posten: AsPosten[]; befunde: StaleBefund[]; getroffenePins: number }> {
  const feed = await holeFeed(fetchImpl);
  const feedPosten = parseRssItems(feed);
  const elis = feedPosten.map((p) => p.eli);

  const [inkraftMap, ccMap] = await Promise.all([holeInkraft(elis, fetchImpl), holeGeaenderteCc(elis, fetchImpl)]);

  const posten: AsPosten[] = feedPosten.map((p) => ({
    eli: p.eli,
    titel: p.titel,
    inkraft: inkraftDatum(inkraftMap.get(p.eli), heute),
    ccs: ccMap.get(p.eli) ?? [],
  }));

  const pins = lesePinsVoll();
  const gepinnteCc = new Set(pins.filter((p) => p.eli.startsWith('cc/')).map((p) => p.eli));

  // Nur Konsolidierungen der cc-Erlasse abfragen, die (a) von einem in Kraft
  // stehenden AS-Akt getroffen werden UND (b) überhaupt gepinnt sind.
  const relevanteCc = new Set<string>();
  for (const a of posten) {
    if (!a.inkraft || a.inkraft > heute) continue;
    for (const cc of a.ccs) if (gepinnteCc.has(cc)) relevanteCc.add(cc);
  }
  const getroffenePins = relevanteCc.size;

  const konsProCc = await holeKonsolidierungen([...relevanteCc], fetchImpl);
  const befunde = bewerteStalePending(posten, pins, konsProCc, heute);
  return { posten, befunde, getroffenePins };
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

function heuteAusArgv(): string {
  const arg = process.argv.find((a) => a.startsWith('--datum='))?.slice('--datum='.length);
  if (arg && /^\d{4}-\d{2}-\d{2}$/.test(arg)) return arg;
  const j = new Date();
  return `${j.getFullYear()}-${String(j.getMonth() + 1).padStart(2, '0')}-${String(j.getDate()).padStart(2, '0')}`;
}

async function main(): Promise<void> {
  const heute = heuteAusArgv();
  let ergebnis: Awaited<ReturnType<typeof erhebe>>;
  try {
    ergebnis = await erhebe(heute);
  } catch (e) {
    console.error(`FEHLER: RSS-OC-Prüfung nicht möglich (${e instanceof Error ? e.message : e}).`);
    process.exit(1);
  }

  const { posten, befunde, getroffenePins } = ergebnis;
  const inKraft = posten.filter((p) => p.inkraft && p.inkraft <= heute).length;
  console.log(
    `RSS-OC-Wächter (STALE-PENDING): ${posten.length} AS-Akte im Feed, ${inKraft} in Kraft (≤ ${heute}); ` +
      `${getroffenePins} gepinnte cc-Erlass(e) getroffen.\n`,
  );

  if (befunde.length === 0) {
    console.log('Keine STALE-PENDING-Lage: kein in Kraft stehender AS-Akt trifft einen gepinnten Erlass');
    console.log('ohne bereits vorliegende deckende Konsolidierung. (Nachlauf der Konsolidierung ist normal.)');
    process.exit(0);
  }

  console.log(`${befunde.length} STALE-PENDING-WARNUNG(EN) — geltendes Recht evtl. noch nicht konsolidiert:\n`);
  for (const b of befunde) {
    console.log(
      `STALE-PENDING  SR ${b.sr} (${b.name}): AS ${b.asEli} in Kraft seit ${b.inkraft}, ` +
        `Pin-Konsolidierung ${b.pinKons} ÄLTER — Konsolidierung folgt.`,
    );
    console.log(`               betroffen laut AS-Titel: „${b.asTitel}“ → geänderte Artikel im AS-Akt nachlesen.`);
  }
  console.log('\nAdvisory (Exit 0): Nachlauf ist der Normalfall. Bei Bedarf betroffene Artikel aus dem AS-Akt lesen');
  console.log('und in die Wiedervorlage aufnehmen (scripts/fedlex-wiedervorlage-generieren.ts, Folgeschritt).');
  process.exit(0);
}

// Als CLI ausführen; beim Import aus dem Unit-Test (VITEST gesetzt) NICHT laufen
// (sonst würde jeder Testlauf das Netz anfassen).
if (!process.env.VITEST) void main();
