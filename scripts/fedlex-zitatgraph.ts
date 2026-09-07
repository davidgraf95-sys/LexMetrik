// ─── Z2 · Fedlex-Zitatgraph (W2·22-VERWEIS-FEDLEX) ───────────────────────────
//
// ZWECK. Fedlex führt zu jedem konsolidierten Erlass einen AMTLICHEN Zitatgraphen
// (`jolux:Citation`). Dieses Skript zieht ihn EINMAL zur Build-Zeit für die
// gepinnten Bundeserlasse und legt ihn als deterministisches Artefakt ab
// (`messwerte/fedlex-zitatgraph.json`). Der Graph ist die AMTLICHE Aussage
// «Erlass A verweist an Stelle eId auf Erlass B» — er ersetzt LexMetriks
// Verweis-Erkennung NICHT (§1/§5: die Erkennung bleibt die eine Wahrheit des
// Lesers), sondern gibt ihr eine unabhängige Vergleichsgrösse. Der Vergleich
// ist Z3 (`scripts/check-zitatgraph-warnungen.ts`), Bericht ohne Tor.
//
// ─── Live verifiziertes Datenmodell (2.9.2026, Sonden gegen den Endpunkt) ────
//
//   ?c a jolux:Citation ;
//      jolux:citationFromLegalResource ?fromExpr ;   # ZITIERENDE Fassung
//      jolux:citationFromReference    ?eId ;         # Literal, z. B. «art_331_e»
//      jolux:citationToLegalResource  ?toWork ;      # ZIEL, nur Erlass-Ebene
//      jolux:citationToRs             ?sr ;          # Literal, z. B. «220»
//      jolux:language                 ?lang .
//
// Fünf gemessene Eigenheiten, die den Bau bestimmen:
//
//  (1) URI-FORM. `?fromExpr` ist `…/eli/<eli>/text/<YYYYMMDD>` — das Segment
//      `text` steht VOR dem Konsolidierungsdatum, `?toWork` endet auf `/text`
//      OHNE Datum. (Der Auftrag nannte die umgekehrte Reihenfolge
//      `…/<datum>/text`; die Sonde widerlegt das, §7 «verifizieren, nicht
//      vertrauen» — abweichend umgesetzt und hier offengelegt.)
//  (2) SPRACHE IST PFLICHT. Ohne `jolux:language`-Filter liefert der Endpunkt
//      jede Kante fünffach (DEU/FRA/ITA/ROH/ENG). Wir binden DEU fest.
//  (3) `citationToRs` IST NUR BEI ~14 % GEBUNDEN. Die übrigen Citations sind
//      AS-/BBl-Fussnoten ohne SR-Ziel; sie interessieren den Leser nicht und
//      werden über das Pflicht-Pattern (kein OPTIONAL) ausgefiltert. Gemessen
//      am OR (Konsolidierung 20260101, DEU): 2 312 Citations, davon 79 mit
//      gebundenem `citationToRs`.
//  (4) KEIN JOIN AUF DAS ZITIERENDE WERK. Ein Join `citationToRs → skos:notation`
//      des zitierenden Erlasses läuft >120 s ins Timeout. Die SR-Nummer des
//      ZITIERENDEN Erlasses kommt darum lokal aus den Pins (`fedlex-pins.ts`,
//      SSoT `fedlex-cache.sh`), nie aus dem Endpunkt.
//  (5) 200 MIT HTML. Der Endpunkt beantwortet manche Abfrageformen mit HTTP 200
//      und einer HTML-Fehlerseite. Die Content-Type-Prüfung sitzt in
//      `fedlex-sparql.ts` (`sparqlSelect`) und wirft — nie am Statuscode messen.
//
// ─── Bau-Regeln ─────────────────────────────────────────────────────────────
//
//  · DETERMINISMUS (§2). Keine Zeitstempel im Artefakt, keine Zufälligkeit,
//    stabile Sortierung, 2-Space-JSON. Zwei Läufe müssen BYTE-GLEICH sein; das
//    Skript druckt am Ende beide SHA-256 zum Abgleich.
//  · COUNT-GATE (Skill `scraping-swiss-official-sources`, Falle 4: ein
//    Bulk-SPARQL-Ergebnis kann still unvollständig sein). Je Batch läuft ZUERST
//    eine `COUNT(*) GROUP BY ?fromExpr`-Abfrage; die gelieferte Zeilenzahl je
//    Erlass muss exakt der gezählten entsprechen, sonst Abbruch.
//  · KEIN TEIL-ARTEFAKT. Erst wenn alle Batches und alle Count-Gates
//    durchgelaufen sind, wird geschrieben. HTML-Antwort, Timeout oder
//    Count-Abweichung ⇒ Abbruch mit Klartext-Meldung, Datei bleibt unberührt.
//  · EINGEHENDAUSKORPUS = INVERSION DER AUSGEHENDEN KANTEN, NUR KORPUSINTERN.
//    Der Auftrag verlangt die eingehenden Kanten «auf die gepinnte Consolidation
//    des ZITIERENDEN Erlasses gefiltert». Eine Consolidation ist nur für einen
//    GEPINNTEN Erlass definiert — die Menge der so gefilterten eingehenden
//    Kanten ist deshalb GENAU die Umkehrung der über alle Pins erhobenen
//    ausgehenden Kanten. Wir invertieren lokal statt 227 weitere Abfragen zu
//    stellen: identisches Ergebnis, halbe Netzlast, und der Graph ist per
//    Konstruktion in sich konsistent (keine eingehende Kante ohne ihre
//    ausgehende) — ABER das Feld heisst bewusst `eingehendAusKorpus`, nicht
//    `eingehend`: es zeigt nur Zitate AUS DEN GEPINNTEN 227 ERLASSEN. Ein
//    NICHT gepinnter Erlass, der einen Pin zitiert (z. B. RAG SR 221.302
//    zitiert das OR [SR 220] an 7 Stellen), taucht hier NICHT auf — der
//    Endpunkt würde die eingehenden Kanten nur über eine 228. Abfrage pro
//    Zielerlass gegen den gesamten Fedlex-Bestand liefern, was der Auftrag
//    ausdrücklich nicht verlangt («keine Zusatzabfragen»).
//
// Regenerieren: `npm run zitatgraph:generieren`.

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { lesePinsVoll, type PinVoll } from './fedlex-pins';
import { sparqlSelect, type FetchImpl, type SparqlBinding } from './fedlex-sparql';

export const ARTEFAKT_PFAD = join(process.cwd(), 'messwerte', 'fedlex-zitatgraph.json');

const ELI_BASIS = 'https://fedlex.data.admin.ch/eli/';
const DEU = '<http://publications.europa.eu/resource/authority/language/DEU>';
/** VALUES-Batch statt UNION (bekannte ~700-statt-alle-Falle, fedlex-sparql.ts). */
const BATCH = 40;

// ─── 1 · Reine Normalisierung (netzfrei testbar) ────────────────────────────

export interface AusKante {
  /** eId der zitierenden Stelle, z. B. «art_331_e» oder «annex_2/lvl_u1/…». */
  eId: string;
  /** SR-Nummer des Zielerlasses (amtliches `citationToRs`-Literal). */
  zielSr: string;
  /** ELI-Pfad des Ziels OHNE Basis und OHNE `/text`, z. B. «cc/27/317_321_377». */
  zielEli: string;
}
export interface EinKante {
  /** SR-Nummer des zitierenden Erlasses (lokal aus dem Pin, nie vom Endpunkt). */
  vonSr: string;
  /** eId der zitierenden Stelle im zitierenden Erlass. */
  vonEId: string;
}
export interface ErlassKnoten {
  sr: string;
  /** Gepinnte Konsolidierung als ISO-Datum. */
  stand: string;
  ausgehend: AusKante[];
  eingehendAusKorpus: EinKante[];
}
export interface Zitatgraph {
  _zweck: string;
  _regenerieren: string;
  _grenzen: string[];
  korpus: { erlasse: number; ausgehend: number; eingehendAusKorpus: number; ohneKanten: number };
  erlasse: ErlassKnoten[];
}

/** Die Expression-URI eines Pins — Form (1) oben, live verifiziert. */
export function exprUri(pin: Pick<PinVoll, 'eli' | 'konsKompakt'>): string {
  return `${ELI_BASIS}${pin.eli}/text/${pin.konsKompakt}`;
}

/** `…/eli/cc/27/317_321_377/text` → `cc/27/317_321_377`. */
export function eliAusWork(workUri: string): string {
  return workUri.startsWith(ELI_BASIS)
    ? workUri.slice(ELI_BASIS.length).replace(/\/text\/?$/, '')
    : workUri;
}

const cmp = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

/**
 * Bindings → ausgehende Kanten je Expression-URI. Dedupliziert auf
 * `eId|zielSr|zielEli`: Fedlex führt dieselbe Zitatstelle mehrfach, wenn ein
 * Artikel dasselbe Ziel in mehreren Absätzen nennt — für die Graph-Aussage
 * «Stelle X zitiert Erlass Y» ist das EINE Kante. Die ROHE Zeilenzahl bleibt
 * daneben stehen, weil das Count-Gate gegen sie prüft (nicht gegen die
 * deduplizierte Menge).
 */
export function normalisiereKanten(bindings: SparqlBinding[]): {
  kanten: Map<string, AusKante[]>;
  rohZeilen: Map<string, number>;
} {
  const kanten = new Map<string, AusKante[]>();
  const rohZeilen = new Map<string, number>();
  const gesehen = new Map<string, Set<string>>();
  for (const b of bindings) {
    const expr = b.fromExpr?.value;
    const eId = b.eId?.value;
    const zielSr = b.rs?.value;
    const toWork = b.toWork?.value;
    if (!expr || !eId || !zielSr || !toWork) continue;
    rohZeilen.set(expr, (rohZeilen.get(expr) ?? 0) + 1);
    if (!kanten.has(expr)) { kanten.set(expr, []); gesehen.set(expr, new Set()); }
    const schluessel = `${eId}|${zielSr}|${toWork}`;
    if (gesehen.get(expr)!.has(schluessel)) continue;
    gesehen.get(expr)!.add(schluessel);
    kanten.get(expr)!.push({ eId, zielSr, zielEli: eliAusWork(toWork) });
  }
  return { kanten, rohZeilen };
}

/**
 * Pins + ausgehende Kanten → das fertige, sortierte Artefakt. Rein (§2): keine
 * Uhr, kein Netz, kein Dateisystem. Die eingehenden Kanten entstehen hier durch
 * Inversion (Begründung im Kopf).
 */
export function baueGraph(pins: PinVoll[], kantenJeExpr: Map<string, AusKante[]>): Zitatgraph {
  // SR → Knoten. Mehrere Pins auf dieselbe SR wären ein Pin-Defekt; wir
  // verschmelzen sie deterministisch und melden das im Count-Gate nicht (der
  // Fall ist im Bestand nicht belegt — die Sortierung bliebe stabil).
  const knoten = new Map<string, ErlassKnoten>();
  for (const p of pins) {
    if (!p.sr) continue;
    if (!knoten.has(p.sr)) knoten.set(p.sr, { sr: p.sr, stand: p.kons, ausgehend: [], eingehendAusKorpus: [] });
    const k = knoten.get(p.sr)!;
    for (const kante of kantenJeExpr.get(exprUri(p)) ?? []) k.ausgehend.push(kante);
  }
  // Inversion: jede ausgehende Kante auf eine GEPINNTE SR wird dort eingehend.
  const einGesehen = new Map<string, Set<string>>();
  for (const k of knoten.values()) {
    for (const a of k.ausgehend) {
      const ziel = knoten.get(a.zielSr);
      if (!ziel || ziel.sr === k.sr) continue; // Selbstzitat ist keine Kante zwischen Erlassen
      if (!einGesehen.has(ziel.sr)) einGesehen.set(ziel.sr, new Set());
      const schluessel = `${k.sr}|${a.eId}`;
      if (einGesehen.get(ziel.sr)!.has(schluessel)) continue;
      einGesehen.get(ziel.sr)!.add(schluessel);
      ziel.eingehendAusKorpus.push({ vonSr: k.sr, vonEId: a.eId });
    }
  }
  const erlasse = [...knoten.values()].sort((a, b) => cmp(a.sr, b.sr) || cmp(a.stand, b.stand));
  for (const k of erlasse) {
    k.ausgehend.sort((a, b) => cmp(a.eId, b.eId) || cmp(a.zielSr, b.zielSr) || cmp(a.zielEli, b.zielEli));
    k.eingehendAusKorpus.sort((a, b) => cmp(a.vonSr, b.vonSr) || cmp(a.vonEId, b.vonEId));
  }
  return {
    _zweck:
      'Amtlicher Fedlex-Zitatgraph (jolux:Citation, DEU) der gepinnten Bundeserlasse — '
      + 'Vergleichsgrösse für LexMetriks Verweis-Erkennung, NICHT deren Ersatz (§1/§5). '
      + 'Datenmodell, Fallen und Bau-Regeln: scripts/fedlex-zitatgraph.ts (Kopf).',
    _regenerieren: 'npm run zitatgraph:generieren',
    _grenzen: [
      'Nur Citations mit gebundenem jolux:citationToRs (~14 %); der Rest sind AS-/BBl-Fussnoten ohne SR-Ziel.',
      'Fedlex unterscheidet nicht, ob eine Citation im Normtext oder in einer FUSSNOTE steht — beides erscheint hier als Kante.',
      'Ziel ist stets nur die Erlass-Ebene: Fedlex führt kein citationToReference, die zitierte Bestimmung des ZIELS ist unbekannt.',
      'Sprache DEU fest gebunden (ohne den Filter liefert der Endpunkt jede Kante fünffach).',
      'eingehendAusKorpus = Inversion der ausgehenden Kanten über die gepinnte Consolidation — NUR korpusintern: ein NICHT gepinnter Erlass, der einen Pin zitiert (z. B. RAG SR 221.302 zitiert das OR SR 220 an 7 Stellen), erscheint hier NICHT.',
    ],
    korpus: {
      erlasse: erlasse.length,
      ausgehend: erlasse.reduce((n, k) => n + k.ausgehend.length, 0),
      eingehendAusKorpus: erlasse.reduce((n, k) => n + k.eingehendAusKorpus.length, 0),
      ohneKanten: erlasse.filter((k) => k.ausgehend.length === 0 && k.eingehendAusKorpus.length === 0).length,
    },
    erlasse,
  };
}

/** Die eine Serialisierung — 2-Space-JSON mit Schluss-Newline (Byte-Gleichheit). */
export function serialisiere(graph: Zitatgraph): string {
  return `${JSON.stringify(graph, null, 2)}\n`;
}

// ─── 2 · Erhebung (Netz) ────────────────────────────────────────────────────

function datenAbfrage(valuesInline: string): string {
  return `PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>
SELECT ?fromExpr ?eId ?toWork ?rs WHERE {
  VALUES ?fromExpr { ${valuesInline} }
  ?c a jolux:Citation ;
     jolux:citationFromLegalResource ?fromExpr ;
     jolux:citationFromReference ?eId ;
     jolux:citationToLegalResource ?toWork ;
     jolux:citationToRs ?rs ;
     jolux:language ${DEU} .
}`;
}

/**
 * OPTIONAL statt Pflicht-Pattern: nur so liefert die Gruppierung für JEDEN
 * `?fromExpr`-Wert aus VALUES eine Zeile — auch mit COUNT 0. Mit einem
 * Pflicht-Pattern (wie in `datenAbfrage`) fehlt ein Pin ohne Treffer in der
 * Antwort ganz; genau das machte das Count-Gate vakuant: eine gültige LEERE
 * `{results:{bindings:[]}}`-Antwort (0 Treffer über den ganzen Batch, z. B.
 * bei einem Endpunkt-Defekt) lief unbemerkt durch, weil die Schleife unten
 * nur über vorhandene Zeilen iterierte, nie über die VALUES-Soll-Menge.
 * COUNT(?c) statt COUNT(*): bei einer OPTIONAL-Nichtübereinstimmung bleibt
 * ?c ungebunden — COUNT(*) zählte die eine (leere) Lösungszeile trotzdem als
 * 1, COUNT(?c) zählt nur gebundene Vorkommen und liefert korrekt 0.
 */
function zaehlAbfrage(valuesInline: string): string {
  return `PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>
SELECT ?fromExpr (COUNT(?c) AS ?n) WHERE {
  VALUES ?fromExpr { ${valuesInline} }
  OPTIONAL {
    ?c a jolux:Citation ;
       jolux:citationFromLegalResource ?fromExpr ;
       jolux:citationFromReference ?eId ;
       jolux:citationToLegalResource ?toWork ;
       jolux:citationToRs ?rs ;
       jolux:language ${DEU} .
  }
} GROUP BY ?fromExpr`;
}

/**
 * Alle ausgehenden Kanten der gepinnten Erlasse, batchweise erhoben und je
 * Batch gegen die COUNT-Abfrage geprüft. Wirft bei jeder Abweichung — lieber
 * kein Artefakt als ein still unvollständiges (Skill-Falle 4). Das Gate prüft
 * ZWEI Richtungen, nicht nur eine: (a) für jede von der COUNT-Abfrage
 * gemeldete `?fromExpr`-Zeile muss die Daten-Abfrage exakt so viele rohe
 * Zeilen geliefert haben (wie zuvor); (b) JEDER Pin des Batches (die
 * VALUES-Soll-Menge) muss überhaupt als Zeile in der COUNT-Antwort
 * erscheinen — mit OPTIONAL oben ist das immer der Fall, ausser der
 * Endpunkt liefert eine unvollständige oder leere Antwort. Ohne (b) lässt
 * eine gültige leere `{results:{bindings:[]}}`-Antwort die Schleife (a) mit
 * null Iterationen glatt durchlaufen und ein Teil-Artefakt mit 0 Kanten
 * entsteht — genau das verbietet der Kopf-Kommentar («KEIN TEIL-ARTEFAKT»).
 */
export async function erhebe(
  pins: PinVoll[],
  fetchImpl: FetchImpl = fetch,
): Promise<Map<string, AusKante[]>> {
  const alle = new Map<string, AusKante[]>();
  for (let i = 0; i < pins.length; i += BATCH) {
    const teil = pins.slice(i, i + BATCH);
    const sollExprs = teil.map((p) => exprUri(p));
    const inline = sollExprs.map((e) => `<${e}>`).join(' ');
    const zaehl = await sparqlSelect(zaehlAbfrage(inline), fetchImpl);
    const daten = await sparqlSelect(datenAbfrage(inline), fetchImpl);
    const { kanten, rohZeilen } = normalisiereKanten(daten);
    const gesehen = new Set<string>();
    for (const b of zaehl) {
      const expr = b.fromExpr?.value;
      const soll = Number(b.n?.value ?? 'NaN');
      if (!expr) continue;
      gesehen.add(expr);
      const ist = rohZeilen.get(expr) ?? 0;
      if (soll !== ist) {
        throw new Error(
          `Count-Gate gerissen: ${expr} — COUNT sagt ${soll}, geliefert ${ist} Zeilen. `
          + 'Ergebnis still unvollständig (Batch verkleinern), kein Artefakt geschrieben.',
        );
      }
    }
    const fehlend = sollExprs.filter((e) => !gesehen.has(e));
    if (fehlend.length > 0) {
      throw new Error(
        `Count-Gate gerissen (vakuant): ${fehlend.length} von ${sollExprs.length} Pin(s) fehlen `
        + `ganz in der COUNT-Antwort — ${fehlend.join(', ')}. Endpunkt lieferte eine unvollständige `
        + 'oder leere Antwort, kein Artefakt geschrieben.',
      );
    }
    for (const [expr, k] of kanten) alle.set(expr, k);
  }
  return alle;
}

// ─── 3 · CLI ────────────────────────────────────────────────────────────────

const sha = (s: string): string => createHash('sha256').update(s).digest('hex');

async function main(): Promise<void> {
  const pins = lesePinsVoll();
  const ohneSr = pins.filter((p) => !p.sr).map((p) => p.name);
  console.log(`Fedlex-Zitatgraph — ${pins.length} Pins (${ohneSr.length} ohne SR-Feld).`);

  const vorher = existsSync(ARTEFAKT_PFAD) ? sha(readFileSync(ARTEFAKT_PFAD, 'utf8')) : '(neu)';
  const t0 = Date.now();
  let kanten: Map<string, AusKante[]>;
  try {
    kanten = await erhebe(pins);
  } catch (e) {
    console.error(`\n✗ ABBRUCH — ${(e as Error).message}`);
    console.error('  Artefakt NICHT geschrieben (kein Teil-Stand, §1).');
    process.exit(1);
    return;
  }
  const dauer = ((Date.now() - t0) / 1000).toFixed(1);

  const graph = baueGraph(pins, kanten);
  const inhalt = serialisiere(graph);
  writeFileSync(ARTEFAKT_PFAD, inhalt);
  const nachher = sha(inhalt);

  const ohneExpr = pins.filter((p) => !kanten.has(exprUri(p)));
  console.log(
    `  ${graph.korpus.erlasse} Erlasse · ${graph.korpus.ausgehend} ausgehende · `
    + `${graph.korpus.eingehendAusKorpus} eingehende Kanten (nur korpusintern) · ${graph.korpus.ohneKanten} ohne Kante`,
  );
  console.log(`  ${Buffer.byteLength(inhalt)} Bytes · ${dauer} s Erhebung`);
  console.log(`  SHA-256 vorher  ${vorher}`);
  console.log(`  SHA-256 nachher ${nachher}`);
  console.log(vorher === nachher ? '  ⇒ byte-gleich (deterministisch bestätigt)' : '  ⇒ Inhalt geändert');
  if (ohneExpr.length > 0) {
    console.log(
      `  ⚠ ${ohneExpr.length} Pin(s) ohne SR-Kante in dieser Consolidation: `
      + ohneExpr.map((p) => `${p.name}@${p.konsKompakt}`).join(', '),
    );
  }
  console.log('\nNachlauf: `npm run check:zitatgraph` (Warn-Bericht Z3).');
}

if (!process.env.VITEST && !process.env.FEDLEX_NUR_IMPORT) void main();
