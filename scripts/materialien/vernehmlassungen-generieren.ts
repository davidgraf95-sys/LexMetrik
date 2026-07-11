/**
 * Paket 3 (FAHRPLAN-FEDLEX-PORTFOLIO §Paket 3, W3·11): generiert die «Gesetzgebung
 * in Arbeit»-Vernehmlassungen je Bund-Volltext-Erlass — automatisch über den Fedlex-
 * Gesetzgebungs-Graphen (SPARQL, §7). Ausgabe:
 * src/lib/materialien/vernehmlassungen.generated.ts (NICHT von Hand editieren, NICHT
 * aus src/ importieren — reine Build-Zeit-Quelle, §15 Bundle).
 *
 * Direkte Kante (POC 10.7.2026 live verifiziert; OR(220)→33, DSG(235.1)→3, MWSTG(641.20)→14
 * reproduziert; 822 Consultations über 173/218 Erlasse; Füllraten status/titel DE·FR·IT
 * 100 %, frist 96,6 %, projEli 100 %; Reichweite 2000–2026):
 *   ?tax skos:notation "<SR>"^^<…id-systematique>          # TYPISIERT (sonst Timeout)
 *   ?cc  jolux:classifiedByTaxonomyEntry ?tax .
 *   ?cons a jolux:Consultation ;
 *         jolux:foreseenImpactToLegalResource ?cc ;        # DIREKTE Norm-Kante (kein oc-Umweg)
 *         jolux:consultationStatus ?status .
 * §0c-Falle vermieden: kein UNION, VALUES-Batching; kein STRSTARTS. projEli steckt
 * in der cons-URI selbst (eli/dl/proj/{jahr}/{nr}/cons_N) — kein zusätzlicher Join.
 *
 * §2/§0b Regel 5: reine parse-Funktion (baueVernehmlassungen, injizierbar/testbar) getrennt
 * vom Fetch/Writer; --datum aus der Shell (= Abfrage-/Stand-Datum, Status ist mutabel),
 * kein Date.now.
 * Aufruf: npm run materialien:vernehmlassungen -- --datum=$(date +%F)
 *
 * Übergangslösung bis E1: schreibt heute in die Datei-Projektion (register.json über
 * ALLE_MATERIALIEN). Zukunfts-Senke E6b (FAHRPLAN-DATENHALTUNG §3): `materialien(…)` +
 * additive Spalten vern_status/frist_start/frist_ende/proj_eli.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { sparqlBatch, type SparqlBinding, type FetchImpl } from '../fedlex-sparql.ts';
import { grundmenge, type ErlassMeta } from './botschaften-generieren.ts';
import type { VernehmlassungStatus, MaterialRegistereintrag } from '../../src/lib/materialien/typen.ts';

export { grundmenge };

const NOTATION_TYPE = '<https://fedlex.data.admin.ch/vocabulary/notation-type/id-systematique>';
const STATUS_BASIS = 'https://fedlex.data.admin.ch/vocabulary/consultation-status/';

/** Status-Vokabular 0–6 (amtlich) → interner Enum-Wert (1:1, FAHRPLAN §Paket 3). */
const STATUS_MAP: Record<string, VernehmlassungStatus> = {
  '0': 'in-vorbereitung',
  '1': 'geplant',
  '2': 'laufend',
  '3': 'abgeschlossen-stellungnahmen',
  '4': 'abgeschlossen-bericht',
  '5': 'abgeschlossen',
  '6': 'zurueckgezogen',
};

/** Anzeige-/Sortier-Priorität: laufend zuerst, geplant/in-Vorbereitung (was kommt),
 *  dann abgeschlossen absteigend, zurückgezogen zuletzt (§Paket 3 «laufend>geplant>abgeschlossen»). */
const STATUS_RANG: Record<VernehmlassungStatus, number> = {
  laufend: 0,
  geplant: 1,
  'in-vorbereitung': 2,
  'abgeschlossen-stellungnahmen': 3,
  'abgeschlossen-bericht': 4,
  abgeschlossen: 5,
  zurueckgezogen: 6,
};

const PROVENIENZ = 'Automatisch über den Fedlex-Gesetzgebungs-Graphen zugeordnet; maschinell, fachlich nicht geprüft. Die Zuordnung zum Erlass kann grob sein (Mantelvorlagen betreffen mehrere Gesetze).';

/** cons-URI (eli/dl/proj/{jahr}/{nr}/cons_N) → stabiler, URL-sicherer Key. cons_1 = VERN-{jahr}-{nr};
 *  weitere Phasen (cons_2+) tragen den Suffix, damit kein Kollaps (Legacy VERN-6006-36 bleibt). */
export function keyAusCons(cons: string): string {
  const m = /\/eli\/dl\/proj\/(\d+)\/(\d+)\/cons_(\d+)$/.exec(cons);
  if (!m) throw new Error(`vernehmlassungen: unerwartete cons-URI ${cons}`);
  const basis = `VERN-${m[1]}-${m[2]}`;
  return (m[3] === '1' ? basis : `${basis}-${m[3]}`).replace(/[^A-Za-z0-9_-]/g, '_');
}

/** cons-URI → Projekt-Knoten-ELI (Gesetzgebungs-Graph-Anker; data.admin.ch-Host). */
export function projEliAusCons(cons: string): string | undefined {
  const m = /(https:\/\/fedlex\.data\.admin\.ch\/eli\/dl\/proj\/\d+\/\d+)\/cons_\d+$/.exec(cons);
  return m ? m[1] : undefined;
}

/** cons-URI → Fedlex-Live-Link (DE-Rendering des Vernehmlassungs-Portals, §7c). */
export function liveLink(cons: string): string {
  return cons.replace('https://fedlex.data.admin.ch', 'https://www.fedlex.admin.ch') + '/de';
}

/** Titel-Bereinigung: Fedlex-Titel können HTML tragen; die UI rendert Text. */
function titelText(s: string): string {
  return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * REINE parse-Funktion (§2, testbar): SPARQL-Bindings + Grundmengen-Meta + Abfragedatum →
 * deterministisch sortierte Vernehmlassungs-Einträge. Dedupe über die cons-URI (eine
 * Consultation = ein Eintrag, normKeys sammelt alle SR-Treffer = Mantel-Feature). Kein
 * Netz, kein Date.now.
 */
export function baueVernehmlassungen(
  bindings: SparqlBinding[],
  meta: ErlassMeta[],
  datum: string,
): MaterialRegistereintrag[] {
  const srNachErlass = new Map<string, ErlassMeta>();
  const metaNachKey = new Map<string, ErlassMeta>();
  for (const m of meta) { srNachErlass.set(m.sr, m); metaNachKey.set(m.key, m); }

  interface Roh {
    cons: string; status?: VernehmlassungStatus;
    de?: string; fr?: string; it?: string;
    start?: string; ende?: string;
    normKeys: Set<string>;
  }
  const proCons = new Map<string, Roh>();
  for (const b of bindings) {
    const cons = b.cons?.value;
    const sr = b.sr?.value;
    if (!cons || !sr) continue;
    const erlass = srNachErlass.get(sr);
    if (!erlass) continue; // SR ausserhalb der Grundmenge → ignorieren
    let r = proCons.get(cons);
    if (!r) { r = { cons, normKeys: new Set() }; proCons.set(cons, r); }
    r.normKeys.add(erlass.key);
    if (!r.status && b.status?.value?.startsWith(STATUS_BASIS)) {
      r.status = STATUS_MAP[b.status.value.slice(STATUS_BASIS.length)];
    }
    if (!r.de && b.titelDe?.value) r.de = b.titelDe.value;
    if (!r.fr && b.titelFr?.value) r.fr = b.titelFr.value;
    if (!r.it && b.titelIt?.value) r.it = b.titelIt.value;
    if (!r.start && b.start?.value) r.start = b.start.value;
    if (!r.ende && b.ende?.value) r.ende = b.ende.value;
  }

  const out: MaterialRegistereintrag[] = [];
  for (const r of proCons.values()) {
    if (!r.status) continue;               // ohne amtlichen Status kein ehrlicher Eintrag (Log via CLI)
    const titelDe = r.de ? titelText(r.de) : '';
    if (!titelDe) continue;                // ohne amtlichen Titel kein Eintrag (Log via CLI)
    const normKeys = [...r.normKeys].sort();
    const primaer = normKeys
      .map((k) => metaNachKey.get(k))
      .filter((m): m is ErlassMeta => !!m)
      .sort((a, b) => a.rang - b.rang || (a.key < b.key ? -1 : 1))[0];
    const fristStart = r.start ? r.start.slice(0, 10) : undefined;
    const fristEnde = r.ende ? r.ende.slice(0, 10) : undefined;
    const projEli = projEliAusCons(r.cons);
    // rang: Status-Priorität, dann Fristende absteigend (jüngste zuerst). fristEnde als
    // YYYYMMDD; ohne Frist → 0 (ans Ende der Statusgruppe). key-Tiebreak in vergleicheRegister.
    const endeNum = fristEnde ? Number(fristEnde.replace(/-/g, '')) : 0;
    const rang = STATUS_RANG[r.status] * 100000000 + (100000000 - endeNum);
    out.push({
      key: keyAusCons(r.cons),
      behoerde: 'BUND',
      doktyp: 'vernehmlassung',
      titel: titelDe,
      titelFr: r.fr ? titelText(r.fr) : undefined,
      titelIt: r.it ? titelText(r.it) : undefined,
      rechtsgebiet: primaer?.rechtsgebiet ?? 'oeffentlich',
      sprache: 'de',
      status: 'nur-live-link',
      quelleUrl: liveLink(r.cons),
      stand: datum,                         // Abfragedatum (Status ist mutabel, §Paket 3)
      rang,
      normKeys,
      hinweis: PROVENIENZ,
      vernehmlassung: { status: r.status, fristStart, fristEnde, projEli: projEli ?? '' },
    });
  }
  // Deterministische Gesamtsortierung: rang aufsteigend → key (byte-stabil).
  out.sort((a, b) => (a.rang - b.rang) || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  return out;
}

/** sha256 über die Identitäts-/Drift-Felder (Currency-Token, §7d): Status + Fristende + normKeys. */
export function shaVernehmlassung(e: MaterialRegistereintrag): string {
  const v = e.vernehmlassung;
  const norm = [
    e.key, e.behoerde, e.doktyp, e.titel, e.titelFr ?? '', e.titelIt ?? '',
    e.rechtsgebiet, e.status, e.quelleUrl, e.normKeys?.join(',') ?? '',
    v?.status ?? '', v?.fristStart ?? '', v?.fristEnde ?? '', v?.projEli ?? '',
  ].join('');
  return createHash('sha256').update(norm, 'utf8').digest('hex');
}

// ── SPARQL-Query (eine VALUES-Batch) ────────────────────────────────────────────
// Titel je Sprache über die SPARQL-LANG()-Funktion am eventTitle (kein Expression-Join
// nötig — der Consultation-Knoten trägt die drei Sprach-Literale direkt).
export function baueQuery(valuesInline: string): string {
  return `PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
SELECT DISTINCT ?sr ?cons ?status ?titelDe ?titelFr ?titelIt ?start ?ende WHERE {
  VALUES ?notation { ${valuesInline} }
  ?tax skos:notation ?notation . BIND(STR(?notation) AS ?sr)
  ?cc jolux:classifiedByTaxonomyEntry ?tax .
  ?cons a jolux:Consultation ;
        jolux:foreseenImpactToLegalResource ?cc ;
        jolux:consultationStatus ?status .
  OPTIONAL { ?cons jolux:eventTitle ?titelDe . FILTER(LANG(?titelDe)="de") }
  OPTIONAL { ?cons jolux:eventTitle ?titelFr . FILTER(LANG(?titelFr)="fr") }
  OPTIONAL { ?cons jolux:eventTitle ?titelIt . FILTER(LANG(?titelIt)="it") }
  OPTIONAL { ?cons jolux:hasSubTask ?phase . ?phase a jolux:ConsultationPhase ;
             jolux:eventStartDate ?start ; jolux:eventEndDate ?ende }
}`;
}

/** Holt die Bindings für die gesamte Grundmenge (VALUES-Batching, §0c; store-raw je SR). */
export async function holeBindings(
  meta: ErlassMeta[],
  fetchImpl: FetchImpl = fetch,
  rawDir?: string,
): Promise<SparqlBinding[]> {
  const werte = meta.map((m) => `"${m.sr}"^^${NOTATION_TYPE}`);
  const bindings = await sparqlBatch(werte, baueQuery, { batchGroesse: 55, fetchImpl });
  if (rawDir) {
    mkdirSync(rawDir, { recursive: true });
    const proSr = new Map<string, SparqlBinding[]>();
    for (const m of meta) proSr.set(m.sr, []);
    for (const b of bindings) {
      const sr = b.sr?.value;
      if (sr && proSr.has(sr)) proSr.get(sr)!.push(b);
    }
    for (const [sr, bs] of proSr) {
      const datei = `${rawDir}/${sr.replace(/[^0-9.]/g, '_')}.json`;
      writeFileSync(datei, JSON.stringify(bs, null, 2) + '\n', 'utf8');
    }
  }
  return bindings;
}

/** Serialisiert die Einträge als generiertes TS-Modul (byte-deterministisch). */
export function serialisiere(eintraege: MaterialRegistereintrag[]): string {
  const esc = (s: string) => JSON.stringify(s);
  const zeilen = eintraege.map((e) => {
    const v = e.vernehmlassung!;
    const felder: string[] = [
      `key: ${esc(e.key)}`,
      `behoerde: 'BUND'`,
      `doktyp: 'vernehmlassung'`,
      `titel: ${esc(e.titel)}`,
    ];
    if (e.titelFr) felder.push(`titelFr: ${esc(e.titelFr)}`);
    if (e.titelIt) felder.push(`titelIt: ${esc(e.titelIt)}`);
    felder.push(`rechtsgebiet: ${esc(e.rechtsgebiet)}`);
    felder.push(`sprache: 'de'`);
    felder.push(`status: 'nur-live-link'`);
    felder.push(`quelleUrl: ${esc(e.quelleUrl)}`);
    felder.push(`stand: ${esc(e.stand)}`);
    felder.push(`rang: ${e.rang}`);
    felder.push(`normKeys: [${(e.normKeys ?? []).map(esc).join(', ')}]`);
    if (e.hinweis) felder.push(`hinweis: ${esc(e.hinweis)}`);
    const vf: string[] = [`status: ${esc(v.status)}`];
    if (v.fristStart) vf.push(`fristStart: ${esc(v.fristStart)}`);
    if (v.fristEnde) vf.push(`fristEnde: ${esc(v.fristEnde)}`);
    vf.push(`projEli: ${esc(v.projEli)}`);
    felder.push(`vernehmlassung: { ${vf.join(', ')} }`);
    return `  { ${felder.join(', ')} },`;
  });
  return `// AUTO-GENERIERT von scripts/materialien/vernehmlassungen-generieren.ts — NICHT von Hand editieren.
// NICHT aus src/ importieren (Bundle §15) — reine Build-Zeit-Quelle für die register.json-Projektion.
// Vernehmlassungen («Gesetzgebung in Arbeit») je Bund-Volltext-Erlass (Fedlex-Graph, §7).
// Regenerieren: npm run materialien:vernehmlassungen -- --datum=$(date +%F)
import type { MaterialRegistereintrag } from './typen';

export const VERNEHMLASSUNGEN: MaterialRegistereintrag[] = [
${zeilen.join('\n')}
];
`;
}

// CLI-Runner: scripts/materialien/vernehmlassungen-generieren-run.ts (dünner Fetch/Write-Teil,
// getrennt vom seiteneffektfreien Modul — Repo-Muster botschaften-generieren(-run)).
