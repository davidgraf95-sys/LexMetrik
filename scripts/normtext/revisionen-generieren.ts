/**
 * Paket 5 (FAHRPLAN-FEDLEX-PORTFOLIO §Paket 5, W2·6-REV): generiert je Bund-Volltext-
 * Erlass eine «Änderungen / Revisionen»-Timeline — welche AS/RO-Änderungserlasse
 * (`eli/oc`) haben das Gesetz wann geändert. Ausgabe: ein Sidecar je Erlass unter
 * public/normtext/revisionen/<KEY>.json (lazy vom Reader geladen, kein Monolith).
 *
 * ── ÜBERGANGSLÖSUNG (Fundament-Plan §4.4/§7, David 3.7.2026, VERBINDLICH) ──
 * Der File-Sidecar ist eine Übergangslösung. Zielsenke ist ab E1 die Tabelle
 * `erlass_fassungen` (FAHRPLAN-DATENHALTUNG §3; §5 «nie zwei Wahrheiten»). Wird
 * Paket 5 VOR E1 gebaut, bleibt der Sidecar zulässig; ab E1 schreibt der Writer in
 * `erlass_fassungen`, der Sidecar wird dann Projektion. Fundstellen-Rohstoff
 * (`jolux:dateEntryInForce`, AS-Fundstelle) ist deckungsgleich.
 *
 * ── Quelle (POC 10.7.2026 live an DSG SR 235.1 + korpusweit verifiziert) ──
 * Pfad (b) — Änderungs-Erlasse über die SR-Taxonomie (der verlässliche, dubletten-
 * freie Lieferant der «wann wurde was geändert»-Liste):
 *   ?tax skos:notation "<SR>"^^<…id-systematique>              # TYPISIERT (sonst Timeout)
 *   ?oc  jolux:classifiedByTaxonomyEntry ?tax ;
 *        jolux:legalResourceFamilyType <…resource-family/oc> ; # NICHT cc (consolidated)
 *        jolux:dateEntryInForce ?dateForce .
 * §0c-Fallen vermieden: kein UNION (700-statt-alle), VALUES-Batching; `resource-family/oc`
 * filtert die cc-Abstract-Dubletten heraus; Sprach-Realisierungen (isRealizedBy) kollabieren
 * über die Gruppierung nach ?oc.
 *
 * POC-Befund (Finding 6): die Spec-OPTIONALs `jolux:historicalId`/`jolux:botschaftDate`
 * (jolux-Namespace) liefern am oc-Knoten NICHTS. Die massgebliche AS-Fundstelle steht aber
 * unter dem FEDLEX-INTERNEN Prädikat `<http://cogni.internal.system/model#historicalId>`
 * («RO <jahr> <seite>»; live belegt: `oc/2005/566` → «RO 2005 4395»). Deshalb:
 *   - AS-Fundstelle = `historicalId` bei Einzel-Segment-ELI (digitale AS); sonst aus der
 *     oc-URI abgeleitet (Multi-Segment-Alt-AS = DE-Seite im ersten Segment; Einzel-Segment
 *     seit der AS-Reform 2019, wo Sequenz == Seite). Warum je Fall in `fundstelle()`.
 *     Die reine ELI-Ableitung WAR für Einzel-Segment vor 2019 falsch (Sequenz ≠ Seite) —
 *     durch `historicalId` geheilt (Gegenprüfung 11.7.2026).
 *   - Der Botschafts-Join läuft über die von Paket 2 persistierten `ocUris`
 *     (revision.ocUri ∈ botschaft.ocUris → botschaftKey), NICHT über botschaftDate.
 *
 * ── Mantel-/Sammelerlass-Lücke (strukturell, §8-Ehrlichkeit) ──
 * Pfad (b) listet nur Erlasse, die PRIMÄR unter dieser SR klassifiziert sind.
 * Änderungen über Mantel-/Sammelerlasse anderer SR erzeugen einen Geltungsstand,
 * den nur Pfad (a) (Konsolidierungs-`dateApplicability` am gepinnten Abstract) als
 * Datum sieht. Cross-Check: wo (a) einen Stand ohne passenden (b)-Erlass zeigt →
 * synthetischer «sammelerlass-marker» statt stiller Lücke.
 *
 * §2/§0b Regel 5: reine parse-Funktionen (baueRevisionen, injizierbar/testbar) getrennt
 * vom Fetch/Writer (revisionen-generieren-run.ts); --datum aus der Shell, kein Date.now.
 * Aufruf: npm run normtext:revisionen -- --datum=$(date +%F) [--nur=DSG,OR]
 */
import { createHash } from 'node:crypto';
import { sparqlBatch, sparqlSelect, type SparqlBinding, type FetchImpl } from '../fedlex-sparql.ts';
import { ERLASS_REGISTER } from '../../src/lib/normtext/register.ts';
import { BOTSCHAFTEN } from '../../src/lib/materialien/botschaften.generated.ts';

const NOTATION_TYPE = '<https://fedlex.data.admin.ch/vocabulary/notation-type/id-systematique>';
const LANG = {
  de: '<http://publications.europa.eu/resource/authority/language/DEU>',
  fr: '<http://publications.europa.eu/resource/authority/language/FRA>',
  it: '<http://publications.europa.eu/resource/authority/language/ITA>',
};

/** Grundmenge: Bund-Volltext-Erlasse (register.json, ebene=bund & status=snapshot). */
export interface ErlassMeta { key: string; sr: string; }

export function grundmenge(): ErlassMeta[] {
  return ERLASS_REGISTER
    .filter((e) => e.ebene === 'bund' && e.status === 'snapshot' && e.sr)
    .map((e) => ({ key: e.key, sr: e.sr as string }))
    .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
}

/** Ein Timeline-Eintrag (JSON-Feld-Namen = geplante erlass_fassungen-Spalten, camelCase). */
export interface RevisionEintrag {
  /** 'aenderung' = realer AS/oc-Änderungserlass · 'sammelerlass-marker' = Pfad-(a)-
   *  Geltungsstand ohne passenden (b)-Erlass (Mantelerlass-Lücke, §8). */
  art: 'aenderung' | 'sammelerlass-marker';
  /** In-Kraft-Datum ISO (Sortier-/Anzeige-Schlüssel). */
  dateEntryInForce: string;
  /** oc-URI (nur bei art='aenderung'); der synthetische Marker trägt keinen. */
  ocUri?: string;
  /** Erlass-/Beschluss-Datum ISO (nur art='aenderung'). */
  dateDocument?: string;
  /** AS/RO-Fundstelle «AS 2019 625», aus der oc-URI abgeleitet (art='aenderung'). */
  roFundstelle?: string;
  titelDe?: string;
  titelFr?: string;
  titelIt?: string;
  /** Verknüpfte Paket-2-Botschaft (nur bei belegtem ocUri-Match; sonst weg — kein toter Link). */
  botschaftKey?: string;
  /** true, wenn das Amendment nach dem Korpus-Stand in Kraft trat → noch nicht in den
   *  geltenden (gepinnten) Normtext konsolidiert (Finding 4, user-sichtbar). */
  nichtKonsolidiert?: boolean;
  /** Fedlex-Live-Link auf den AS-Text (art='aenderung') bzw. die amtliche Sammlung. */
  quelleUrl: string;
  /** sha-256 über die Identitätsfelder (Drift-Token, §7d). */
  sha: string;
}

/** Sidecar-Objekt je Erlass (public/normtext/revisionen/<KEY>.json). */
export interface RevisionSidecar {
  erlassKey: string;
  sr: string;
  /** Abrufdatum (§7 Stand). */
  abgerufen: string;
  /** Ehrlichkeits-/Reichweiten-Hinweis (§8). */
  reichweite: string;
  revisionen: RevisionEintrag[];
  /** sha-256 über alle Eintrags-shas + Identität (Sidecar-Drift-Token). */
  sha: string;
}

const REICHWEITE =
  'Maschinell aus dem amtlichen Fedlex-Graphen (SR-Taxonomie) zusammengestellt; massgeblich ' +
  'bleibt die amtliche Sammlung (AS/RO). Verlässlich ab ~2000; Änderungen über Sammelerlasse ' +
  'anderer SR sind als Marker gekennzeichnet.';

// Sammelerlass-Marker (Pfad-(a)-Geltungsstände ohne primären oc-Erlass) NUR ab dieser
// Grenze — sie ist die dokumentierte Verlässlichkeits-Schwelle (§8 «ab ~2000»). Frühere
// Konsolidierungsstände tragen keine Erlass-Identität und wären reines Rauschen unterhalb
// der Reichweite; die primäre (b)-Timeline reicht dagegen weiter zurück. Die primären
// Änderungs-Erlasse (art='aenderung') werden NIE beschnitten (Vollständigkeit vor Kürze).
export const MARKER_CUTOFF = '2000-01-01';

/** oc-URI → «AS <jahr/band> <num>» aus dem ELI-Pfad. NUR korrekt, wenn die ELI-Nummer
 *  die AS-Seite IST: (1) Multi-Segment-ELI (Alt-AS, `DE_FR_IT`-Seiten) → erstes Segment =
 *  DE-Seite, z. B. `eli/oc/1973/348_347_349` → «AS 1973 348»; (2) Einzel-Segment SEIT der
 *  AS-Reform 1.1.2019, wo `sequenceInTheYearOfPublication` == Seite, z. B. `eli/oc/2022/491`
 *  → «AS 2022 491». Für Einzel-Segment-ELI VOR 2019 ist die ELI-Nummer die laufende
 *  Sequenz, NICHT die Seite (→ `fundstelle()` nimmt dort `historicalId`, sonst wäre die
 *  Fundstelle fabriziert und falsch — belegt: `oc/2005/566` ⇒ real AS 2005 4395). */
export function roFundstelleAusOc(ocUri: string): string | undefined {
  const m = /\/eli\/oc\/(\d+)\/(\d+)/.exec(ocUri);
  return m ? `AS ${m[1]} ${m[2]}` : undefined;
}

/** Massgebliche AS-Fundstelle eines oc-Erlasses (§7-Treue: gelesen, nie fabriziert).
 *  - Einzel-Segment-ELI mit `historicalId` (cogni-Prädikat, digitale AS vor 2019):
 *    `historicalId` («RO 2005 4395») trägt die echte AS-Seite → normalisiert auf die
 *    DE-Etikette «AS 2005 4395» (AS=RO=RU dieselbe Sammlung; die digitale AS ist
 *    sprach-einheitlich paginiert, Nummer == DE-Seite, live gegen die amtliche Seite belegt).
 *  - Multi-Segment-ELI (Alt-AS): `historicalId` nennt die FR-Seite, das erste ELI-Segment
 *    die DE-Seite → Ableitung bevorzugen (DE-treu).
 *  - Einzel-Segment ohne `historicalId` (seit 2019): Ableitung (Sequenz == Seite). */
export function fundstelle(ocUri: string, historicalId?: string): string | undefined {
  const seg = /\/eli\/oc\/\d+\/([^/?#]+)/.exec(ocUri)?.[1] ?? '';
  const multiSegment = seg.includes('_');
  if (!multiSegment && historicalId) {
    const m = /(\d{4})\s+(\d+)\s*$/.exec(historicalId.trim());
    return m ? `AS ${m[1]} ${m[2]}` : historicalId.trim(); // unerwartetes Format: verbatim, nie fabrizieren
  }
  return roFundstelleAusOc(ocUri);
}

/**
 * Grenzen des `<authorialNote>`, das die Position `index` umschliesst — `null`, wenn
 * `index` in keiner Fussnote liegt (z. B. Fliesstext) oder die Note nicht sauber
 * schliesst. Ein einfacher `lastIndexOf`/`indexOf` genügt hier bewusst NICHT (könnte in
 * eine FREMDE, spätere Note hineingreifen) — deshalb die Sanity-Prüfung: schliesst
 * zwischen `noteStart` und `index` bereits eine ANDERE Note, liegt `index` gar nicht in
 * dieser.
 */
function findeAuthorialNote(xmlText: string, index: number): { start: number; end: number } | null {
  const start = xmlText.lastIndexOf('<authorialNote', index);
  if (start === -1) return null;
  const end = xmlText.indexOf('</authorialNote>', index);
  if (end === -1) return null;
  const fremdesEndeDazwischen = xmlText.indexOf('</authorialNote>', start);
  if (fremdesEndeDazwischen !== -1 && fremdesEndeDazwischen < index) return null;
  return { start, end: end + '</authorialNote>'.length };
}

/**
 * Finding 4b (Gegenprüfung 16.8.2026, W2·18-FEHLERBUCH #19, live an FZA/SR 0.142.112.681
 * verifiziert; §6.7-Auflage Gegenprüfung PR #820, 12.9.2026: Element-Bindung statt
 * Zeichenfenster). Fedlex modelliert `jolux:dateEntryInForce` bei gewissen Staatsvertrags-
 * Beschlüssen (Gemischter-Ausschuss-Entscheide) als «angewendet ab»-Datum, NICHT als
 * «in Kraft für die Schweiz seit»-Datum. Beleg live (`eli/cc/2002/243/20201215`,
 * DE-XML, Art. 1 des Beschlusses Nr. 1/2020, abgerufen 12.9.2026): der Konsolidierungs-
 * text vom 15.12.2020 zitiert bereits die oc-URI `eli/oc/2021/12` per `<ref href>`, DIREKT
 * neben der Wendung «in Kraft für die Schweiz seit 15. Dez. 2020 und **angewendet ab**
 * 1. Jan. 2021» — obwohl deren `dateEntryInForce` erst 2021-01-01 ist.
 *
 * Eine BLOSSE href-Präsenz reicht NICHT (Gegenprobe live an KLV/SR 832.112.31, 12.9.2026):
 * dieselbe oc-URI kann in einer reinen Änderungs-HISTORIE auftauchen (Aufzählung aller
 * früheren Fassungen einer Bestimmung) oder ein Amendment kann NUR TEILWEISE in Kraft sein
 * («Abs. 1 Bst. a und c in Kraft seit 1. Aug. 2026 … Die anderen Bestimmungen treten zu
 * einem späteren Zeitpunkt in Kraft.») — in beiden Fällen ist der Marker weiterhin
 * KORREKT `nichtKonsolidiert`, obwohl die href vorkommt.
 *
 * Ein blosses Zeichenfenster reicht ABER AUCH NICHT (§6.7-Auflage): eine Fedlex-
 * Sammelnote listet oft MEHRERE Änderungserlasse in EINER `<authorialNote>` auf
 * («… vom X (ref A) … und angewendet ab Y (ref B) …») — ein Fenster um `ref A` kann dann
 * das «angewendet ab» erfassen, das eigentlich zu `ref B` gehört, und `ref A` fälschlich
 * entwarnen. Massgeblich ist deshalb NUR das Segment INNERHALB derselben Fussnote
 * zwischen dem vorhergehenden `</ref>` (oder Notenanfang) und der gesuchten href — das
 * ist exakt die Wortfolge, die sich strukturell auf DIESEN Erlass bezieht, live
 * verifiziert an FZA (Segment endet unmittelbar vor der href, «angewendet ab» direkt
 * davor) und an KLV (Segment enthält «angewendet ab» in KEINEM der beiden Fälle).
 */
export function belegtImXml(xmlText: string, ocUri: string): boolean {
  const href = `href="${ocUri}"`;
  const i = xmlText.indexOf(href);
  if (i === -1) return false;
  const note = findeAuthorialNote(xmlText, i);
  if (!note) return false; // kein Fussnoten-Kontext auffindbar — kein Beleg (konservativ)
  const noteText = xmlText.slice(note.start, note.end);
  const relIndex = i - note.start;
  const vorherigerRefEnde = noteText.lastIndexOf('</ref>', relIndex);
  const segmentStart = vorherigerRefEnde === -1 ? 0 : vorherigerRefEnde + '</ref>'.length;
  return noteText.slice(segmentStart, relIndex).includes('angewendet ab');
}

/** oc-URI → Fedlex-Live-Link (DE-Rendering des AS-Textes). */
export function liveLink(ocUri: string): string {
  return ocUri.replace('https://fedlex.data.admin.ch', 'https://www.fedlex.admin.ch') + '/de';
}

/** Titel-Bereinigung: Fedlex-Titel können HTML tragen; die UI rendert Text. */
function titelText(s: string): string {
  return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

/** Baut EINMAL den ocUri→botschaftKey-Index aus den Paket-2-Botschaften (Finding 1). */
export function botschaftIndex(): Map<string, string> {
  const idx = new Map<string, string>();
  for (const b of BOTSCHAFTEN) {
    for (const oc of b.ocUris ?? []) {
      // Deterministisch: kleinster Key gewinnt, falls mehrere Botschaften denselben oc nennen.
      const vorhanden = idx.get(oc);
      if (!vorhanden || b.key < vorhanden) idx.set(oc, b.key);
    }
  }
  return idx;
}

function shaEintrag(e: Omit<RevisionEintrag, 'sha'>): string {
  const norm = [
    e.art, e.dateEntryInForce, e.ocUri ?? '', e.dateDocument ?? '', e.roFundstelle ?? '',
    e.titelDe ?? '', e.titelFr ?? '', e.titelIt ?? '', e.botschaftKey ?? '',
    e.nichtKonsolidiert ? '1' : '', e.quelleUrl,
  ].join('|');
  return createHash('sha256').update(norm, 'utf8').digest('hex');
}

/**
 * REINE parse-Funktion (§2, testbar): Pfad-(b)-Bindings + Pfad-(a)-Geltungsstände (des
 * gepinnten Abstracts) + Korpus-Stand → deterministisch sortierte Timeline EINES Erlasses.
 * - dedupe je oc (min dateEntryInForce = erstes Inkrafttreten; Sprachen kollabieren);
 * - RO-Fundstelle aus oc-URI; Botschafts-Join über ocUri-Index;
 * - nichtKonsolidiert wenn dateEntryInForce > korpusStand UND die oc-URI NICHT bereits im
 *   Konsolidierungstext zitiert ist (Finding 4, verfeinert um Finding 4b: `belegteOcs`,
 *   ausserhalb ermittelt via `belegtImXml` — s. dort);
 * - Pfad-(a)-Cross-Check: Geltungsstände ohne (b)-Erlass → sammelerlass-marker (§8).
 * Kein Netz, kein Date.now — `belegteOcs` wird injiziert (Netz-Schritt lebt im Runner).
 */
export function baueRevisionen(
  erlass: ErlassMeta,
  bBindings: SparqlBinding[],
  aStaende: string[],
  korpusStand: string,
  ocZuBotschaft: Map<string, string>,
  abgerufen: string,
  belegteOcs: ReadonlySet<string> = new Set(),
): RevisionSidecar {
  interface Roh { oc: string; dateForce: string; dateDoc?: string; roId?: string; de?: string; fr?: string; it?: string; }
  const proOc = new Map<string, Roh>();
  for (const b of bBindings) {
    const oc = b.oc?.value;
    const dateForce = b.dateForce?.value;
    if (!oc || !dateForce) continue;
    let r = proOc.get(oc);
    if (!r) { r = { oc, dateForce }; proOc.set(oc, r); }
    // min dateEntryInForce (erstes Inkrafttreten) — deterministisch, unabhängig der Bindungsreihenfolge.
    if (dateForce < r.dateForce) r.dateForce = dateForce;
    if (!r.dateDoc && b.dateDoc?.value) r.dateDoc = b.dateDoc.value;
    if (!r.roId && b.roId?.value) r.roId = b.roId.value;
    if (!r.de && b.titleDe?.value) r.de = b.titleDe.value;
    if (!r.fr && b.titleFr?.value) r.fr = b.titleFr.value;
    if (!r.it && b.titleIt?.value) r.it = b.titleIt.value;
  }

  const eintraege: RevisionEintrag[] = [];
  const bStaende = new Set<string>();
  for (const r of proOc.values()) {
    bStaende.add(r.dateForce);
    const botschaftKey = ocZuBotschaft.get(r.oc);
    const roh: Omit<RevisionEintrag, 'sha'> = {
      art: 'aenderung',
      dateEntryInForce: r.dateForce,
      ocUri: r.oc,
      dateDocument: r.dateDoc?.slice(0, 10),
      roFundstelle: fundstelle(r.oc, r.roId),
      titelDe: r.de ? titelText(r.de) : undefined,
      titelFr: r.fr ? titelText(r.fr) : undefined,
      titelIt: r.it ? titelText(r.it) : undefined,
      botschaftKey,
      nichtKonsolidiert: (r.dateForce > korpusStand && !belegteOcs.has(r.oc)) ? true : undefined,
      quelleUrl: liveLink(r.oc),
    };
    eintraege.push({ ...roh, sha: shaEintrag(roh) });
  }

  // Pfad-(a)-Cross-Check: Geltungsstände des gepinnten Abstracts ohne passenden (b)-Erlass
  // → Mantel-/Sammelerlass-Änderung (§8-Marker, nie stille Lücke). Nur Stände, die NACH dem
  // ältesten (b)-Erlass liegen (frühere Stände = Erstpublikation, kein «weiterer» Erlass).
  const aeltesterB = [...bStaende].sort()[0];
  for (const stand of new Set(aStaende)) {
    if (bStaende.has(stand)) continue;
    if (aeltesterB && stand < aeltesterB) continue;
    if (stand < MARKER_CUTOFF) continue; // unterhalb der Verlässlichkeits-Schwelle (§8)
    const roh: Omit<RevisionEintrag, 'sha'> = {
      art: 'sammelerlass-marker',
      dateEntryInForce: stand,
      nichtKonsolidiert: stand > korpusStand ? true : undefined,
      quelleUrl: `https://www.fedlex.admin.ch/eli/cc/${erlass.sr}`,
    };
    eintraege.push({ ...roh, sha: shaEintrag(roh) });
  }

  // Deterministische Sortierung: Datum absteigend → art (aenderung vor marker) → ocUri.
  eintraege.sort((a, b) =>
    a.dateEntryInForce < b.dateEntryInForce ? 1
    : a.dateEntryInForce > b.dateEntryInForce ? -1
    : a.art < b.art ? -1 : a.art > b.art ? 1
    : (a.ocUri ?? '') < (b.ocUri ?? '') ? -1 : (a.ocUri ?? '') > (b.ocUri ?? '') ? 1 : 0);

  const sidecarSha = createHash('sha256')
    .update([erlass.key, erlass.sr, ...eintraege.map((e) => e.sha)].join('|'), 'utf8')
    .digest('hex');

  return {
    erlassKey: erlass.key,
    sr: erlass.sr,
    abgerufen,
    reichweite: REICHWEITE,
    revisionen: eintraege,
    sha: sidecarSha,
  };
}

// ── SPARQL Pfad (b): eine VALUES-Batch über die Grundmenge ───────────────────────
export function baueQueryB(valuesInline: string): string {
  return `PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
SELECT ?sr ?oc ?dateForce ?dateDoc ?roId ?titleDe ?titleFr ?titleIt WHERE {
  VALUES ?notation { ${valuesInline} }
  ?tax skos:notation ?notation . BIND(STR(?notation) AS ?sr)
  ?oc jolux:classifiedByTaxonomyEntry ?tax ; jolux:legalResourceFamilyType <https://fedlex.data.admin.ch/vocabulary/resource-family/oc> ; jolux:dateEntryInForce ?dateForce .
  OPTIONAL { ?oc jolux:dateDocument ?dateDoc . }
  OPTIONAL { ?oc <http://cogni.internal.system/model#historicalId> ?roId . }
  OPTIONAL { ?oc jolux:isRealizedBy ?ede . ?ede jolux:language ${LANG.de} ; jolux:title ?titleDe . }
  OPTIONAL { ?oc jolux:isRealizedBy ?efr . ?efr jolux:language ${LANG.fr} ; jolux:title ?titleFr . }
  OPTIONAL { ?oc jolux:isRealizedBy ?eit . ?eit jolux:language ${LANG.it} ; jolux:title ?titleIt . }
}`;
}

/** Holt die Pfad-(b)-Bindings für die gesamte Grundmenge (VALUES-Batching, §0c). */
export async function holeBindingsB(
  meta: ErlassMeta[],
  fetchImpl: FetchImpl = fetch,
): Promise<SparqlBinding[]> {
  const werte = meta.map((m) => `"${m.sr}"^^${NOTATION_TYPE}`);
  return sparqlBatch(werte, baueQueryB, { batchGroesse: 40, fetchImpl });
}

/**
 * Löst die DE-XML-Manifestation EINER Konsolidierung über die amtliche
 * `isRealizedBy → isEmbodiedBy → isExemplifiedBy`-Kette auf (Skill
 * `scraping-swiss-official-sources`, Rezept 2 — `isExemplifiedBy` ist PRIMÄR, kein
 * String-Template). `consEli` = `cc/<jahr>/<nr>/<YYYYMMDD>` (Konsolidierungs-ELI,
 * NICHT das blosse Abstract). `null`, wenn keine XML-Manifestation existiert (selten).
 */
export async function loeseKonsolidierungsXmlUrl(
  consEli: string, fetchImpl: FetchImpl = fetch,
): Promise<string | null> {
  const query = `PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>
SELECT ?file WHERE {
  <https://fedlex.data.admin.ch/eli/${consEli}> jolux:isRealizedBy ?expr .
  ?expr jolux:language ${LANG.de} ; jolux:isEmbodiedBy ?manif .
  ?manif jolux:isExemplifiedBy ?file ;
         jolux:userFormat <https://fedlex.data.admin.ch/vocabulary/user-format/xml> .
}`;
  const bindings = await sparqlSelect(query, fetchImpl);
  return bindings[0]?.file?.value ?? null;
}

/**
 * Finding 4b (Netz-Schritt zu `belegtImXml`, s. dort für die Begründung): holt EINMAL den
 * Konsolidierungstext und gibt die Teilmenge von `kandidatOcs` zurück, die darin bereits
 * als `<ref href>` zitiert ist. `kandidatOcs` = oc-URIs, deren `dateForce > korpusStand`
 * WÄRE (over-inclusive ist harmlos — `baueRevisionen` prüft die Bedingung ohnehin erneut).
 * Wirft bei Netz-/Format-Fehler (nie eine falsch-positive Warnung stumm bestehen lassen,
 * indem ein Fehler als «nicht belegt» durchgeht — Soft-404-Falle, Skill-Rezept 3).
 */
export async function ermittleBelegteOcs(
  consEli: string, kandidatOcs: readonly string[], fetchImpl: FetchImpl = fetch,
): Promise<Set<string>> {
  if (!kandidatOcs.length) return new Set();
  const url = await loeseKonsolidierungsXmlUrl(consEli, fetchImpl);
  if (!url) return new Set(); // keine XML-Manifestation → kein Text-Beleg möglich, Marker bleibt stehen
  const res = await fetchImpl(url);
  const typ = res.headers?.get?.('content-type') ?? null;
  const text = await res.text();
  const istAngularShell = text.startsWith('<!DOCTYPE html') || text.includes('<title>Casemates</title>');
  if (!res.ok || (typ !== null && !typ.includes('xml')) || istAngularShell) {
    throw new Error(`Konsolidierungs-XML ${url} nicht abrufbar (Status ${res.status}, Content-Type «${typ}»).`);
  }
  return new Set(kandidatOcs.filter((oc) => belegtImXml(text, oc)));
}

/** Pfad (a): Geltungsstände (dateApplicability) des gepinnten Abstracts eines Erlasses. */
export async function holeStaendeA(abstractEli: string, fetchImpl: FetchImpl = fetch): Promise<string[]> {
  const query = `PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>
SELECT ?date WHERE { ?c jolux:isMemberOf <https://fedlex.data.admin.ch/eli/${abstractEli}> ; jolux:dateApplicability ?date . } ORDER BY ?date`;
  const bindings = await sparqlSelect(query, fetchImpl);
  return bindings.map((b) => b.date?.value).filter((d): d is string => !!d);
}

/** Byte-deterministische Serialisierung eines Sidecars (2-Space + Trailing-Newline). */
export function serialisiere(sidecar: RevisionSidecar): string {
  return JSON.stringify(sidecar, null, 2) + '\n';
}
