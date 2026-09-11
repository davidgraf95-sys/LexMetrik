// scripts/materialien/verfahrens-ereignisse.ts
// E1 «Entstehung am Artikel» (FAHRPLAN-MATERIALIEN-VERZAHNUNG §11.7): holt die
// Verfahrenskette je Projekt-Knoten aus dem Fedlex-Gesetzgebungs-Projektgraphen und
// baut daraus die deterministische Ereignisliste je Botschaft (je fga, Kritik A12).
//
// ABWEICHUNG von §11.6 («eine Erweiterung der Query»), offengelegt nach §7:
// die Ereignisse werden in einem ZWEITEN Durchgang gegen DENSELBEN Endpunkt geholt,
// nicht als OPTIONAL in die Botschaften-Query gehängt. Grund (gemessen 11.9.2026):
// die Botschaften-Query bindet ?sr × ?oc × ?proj × ?botschaft; ein zusätzliches
// ?event multipliziert JEDE dieser Zeilen mit der Ereigniszahl der Vorlage (Median 5,
// Max > 12) — dieselbe §0c-Falle (Ergebnis-Explosion → Timeout), gegen die der
// Generator schon UNION und STRSTARTS vermeidet. Kein zweiter Endpunkt, keine zweite
// Datei, kein zweiter Parser: nur eine zweite VALUES-Batch über die bereits
// bekannten proj-URIs.
//
// §2: reine Parse-Funktion (baueEreignisse) getrennt vom Fetch; kein Date.now,
// keine Zufälligkeit, Ausgabe byte-deterministisch sortiert.
import { sparqlBatch, type SparqlBinding, type FetchImpl } from '../fedlex-sparql.ts';
import { verfahrensTypVonCode, type VerfahrensEreignis } from '../../src/lib/materialien/verfahren.ts';

const ELI_PRAEFIX = 'https://fedlex.data.admin.ch/eli/';

/** SPARQL-Query über eine VALUES-Batch von Projekt-Knoten. */
export function baueEreignisQuery(valuesInline: string): string {
  return `PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>
SELECT ?proj ?ev ?evType ?evDate ?evRes WHERE {
  VALUES ?proj { ${valuesInline} }
  ?proj jolux:draftHasLegislativeTask ?ev .
  ?ev jolux:legislativeTaskType ?evType .
  OPTIONAL { ?ev jolux:decisionDate ?evDate . }
  OPTIONAL { ?ev jolux:legislativeTaskHasResultingLegalResource ?evRes . }
}`;
}

/** `…/vocabulary/type-projet/200` → 200. Unbekannte Form ⇒ Fehler (§2). */
export function codeAusTypUri(uri: string): number {
  const m = /\/type-projet\/(\d+)$/.exec(uri);
  if (!m) throw new Error(`verfahrens-ereignisse: unerwartete type-projet-URI ${uri}`);
  return Number(m[1]);
}

/** Voller ELI → Kurzform ohne Host («fga/2017/2057»); Fremd-URI bleibt unverändert. */
export function eliKurz(uri: string): string {
  return uri.startsWith(ELI_PRAEFIX) ? uri.slice(ELI_PRAEFIX.length) : uri;
}

/** Kanonische Schreibweise eines Ereignisses — Dedupe-Schlüssel UND Sortierschlüssel. */
export function ereignisSchluessel(e: VerfahrensEreignis): string {
  return [e.datum ?? '', String(e.code).padStart(4, '0'), e.res ?? ''].join('|');
}

/**
 * REINE Parse-Funktion (§2): Ereignis-Bindings → Map proj-URI → sortierte Ereignisse.
 * Dedupe über den Ereignis-Schlüssel (ein Event-Knoten kann über mehrere OPTIONAL-
 * Zweige mehrfach binden). Sortierung: Datum aufsteigend (undatiert zuletzt), dann
 * Code, dann Publikations-ELI — vollständig, also byte-stabil.
 */
export function baueEreignisse(bindings: SparqlBinding[]): Map<string, VerfahrensEreignis[]> {
  const proProj = new Map<string, Map<string, VerfahrensEreignis>>();
  for (const b of bindings) {
    const proj = b.proj?.value;
    const typUri = b.evType?.value;
    if (!proj || !typUri) continue;
    const code = codeAusTypUri(typUri);
    // Der Aufruf validiert den Code gegen die feste Tabelle (unbekannt ⇒ rot, §2);
    // gespeichert wird nur der Code (§5, der Schlüssel ist daraus ableitbar).
    verfahrensTypVonCode(code);
    const e: VerfahrensEreignis = { code };
    const datum = b.evDate?.value?.slice(0, 10);
    if (datum) e.datum = datum;
    if (b.evRes?.value) e.res = eliKurz(b.evRes.value);
    let m = proProj.get(proj);
    if (!m) { m = new Map(); proProj.set(proj, m); }
    const k = ereignisSchluessel(e);
    if (!m.has(k)) m.set(k, e);
  }
  const out = new Map<string, VerfahrensEreignis[]>();
  for (const [proj, m] of proProj) {
    const liste = [...m.values()].sort((a, c) => {
      // Undatierte Schritte ans Ende (leerer Datums-String sortierte sonst nach vorn).
      const da = a.datum ?? '9999-12-31';
      const dc = c.datum ?? '9999-12-31';
      if (da !== dc) return da < dc ? -1 : 1;
      if (a.code !== c.code) return a.code - c.code;
      return (a.res ?? '') < (c.res ?? '') ? -1 : (a.res ?? '') > (c.res ?? '') ? 1 : 0;
    });
    out.set(proj, liste);
  }
  return out;
}

/**
 * Ereignisse EINER Botschaft = Vereinigung über ALLE Projekt-Knoten dieser fga
 * (Kritik A12: je fga, nicht je proj — ein Mantelerlass hängt an mehreren proj und
 * erzeugte sonst Fehlalarm im Netz-Tor). Dedupe + dieselbe Sortierung.
 */
export function ereignisseJeBotschaft(
  projUris: readonly string[],
  proProj: Map<string, VerfahrensEreignis[]>,
): VerfahrensEreignis[] {
  const m = new Map<string, VerfahrensEreignis>();
  for (const p of [...projUris].sort()) {
    for (const e of proProj.get(p) ?? []) {
      const k = ereignisSchluessel(e);
      if (!m.has(k)) m.set(k, e);
    }
  }
  return [...m.values()].sort((a, c) => {
    const da = a.datum ?? '9999-12-31';
    const dc = c.datum ?? '9999-12-31';
    if (da !== dc) return da < dc ? -1 : 1;
    if (a.code !== c.code) return a.code - c.code;
    return (a.res ?? '') < (c.res ?? '') ? -1 : (a.res ?? '') > (c.res ?? '') ? 1 : 0;
  });
}

/** Holt die Ereignis-Bindings für eine Menge Projekt-Knoten (VALUES-Batching, §0c). */
export async function holeEreignisBindings(
  projUris: readonly string[],
  fetchImpl: FetchImpl = fetch,
): Promise<SparqlBinding[]> {
  const werte = [...projUris].sort().map((p) => `<${p}>`);
  return sparqlBatch(werte, baueEreignisQuery, { batchGroesse: 40, fetchImpl });
}
