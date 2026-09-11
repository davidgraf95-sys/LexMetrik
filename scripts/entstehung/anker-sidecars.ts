// scripts/entstehung/anker-sidecars.ts
// E2 «Entstehung am Artikel» (FAHRPLAN-MATERIALIEN-VERZAHNUNG §11.4/§11.6):
// Botschafts-Anker-Sidecars — `<article id="art_*">` aus dem amtlichen BBl-HTML.
//
// REGELN (§11.6, Kritik A2):
//  · BBl-Dateien tragen KEIN `-N` (das ist die cc-Konsolidierungs-Regel) und die URL
//    wird NIE konstruiert: sie kommt aus `jolux:isExemplifiedBy` der HTML-Manifestation
//    (Rückfall `isExemplifiedByPrivate` mit Host-Tausch, falls die öffentliche fehlt).
//  · Das HTML wird NIE gespeichert — nur sha256 + `Last-Modified`/`Content-Length` als
//    Drift-/Currency-Token (§7d) und die extrahierten Anker.
//  · Der Content-Type entscheidet über Erfolg, nie der Statuscode (Filestore antwortet
//    auf fehlende Objekte mit 200 + Angular-Shell — Skill `scraping-swiss-official-sources`).
//
// ABWEICHUNG von §11.4 «Mantel-Zuordnung nur bei eindeutigem Register-Treffer»,
// offengelegt nach §7: die artikelscharfe Mantel-Heuristik wird NICHT gebaut. Recherche
// R3 (6.9.2026) hat sie an 28 Erlass-Unterabschnitten gemessen: ~32 % Treffer, d. h. rund
// zwei Drittel falsch oder leer — eine solche Quote erzeugt am Artikel eine falsche
// Behauptung («diese Stelle erläutert Art. X»), und §1 verbietet, Korrektheit gegen
// Abdeckung zu tauschen. Stattdessen: bei Mantelvorlagen bleiben die Anker auf
// ERLASS-EBENE (`mantel: true`, alle `erlassKeys` amtlich aus dem SR-Join), womit der
// Fahrplan-Satz «sonst Erlass-Ebene» erfüllt ist — ohne die Heuristik.
//
// §2: reine Parse-Funktionen getrennt vom Fetch; kein Date.now (Abrufdatum via Argument).
import { createHash } from 'node:crypto';
import { sparqlBatch, type SparqlBinding, type FetchImpl } from '../fedlex-sparql.ts';
import { ankerNachToken } from '../materialien/fedlex-anker.ts';
import type { AnkerSidecar, BotschaftAnker } from '../../src/lib/entstehung/anker.ts';

const HTML_FORMAT = '<https://fedlex.data.admin.ch/vocabulary/user-format/html>';
const DEU = '<http://publications.europa.eu/resource/authority/language/DEU>';

/** SPARQL: HTML-Manifestation (DE) je Botschaft — `isExemplifiedBy` ist PRIMÄR. */
export function baueManifestQuery(valuesInline: string): string {
  return `PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>
SELECT ?b ?url ?priv WHERE {
  VALUES ?b { ${valuesInline} }
  ?b jolux:isRealizedBy ?expr .
  ?expr jolux:language ${DEU} ; jolux:isEmbodiedBy ?manif .
  ?manif jolux:userFormat ${HTML_FORMAT} .
  OPTIONAL { ?manif jolux:isExemplifiedBy ?url . }
  OPTIONAL { ?manif jolux:isExemplifiedByPrivate ?priv . }
}`;
}

/** Private Intranet-URL → öffentliche Filestore-URL (Host-Tausch, §11.6). */
export function oeffentlicheUrl(priv: string): string {
  return priv.replace('https://intranet.fedlex.admin.ch/casematesbo/', 'https://fedlex.data.admin.ch/');
}

/**
 * REIN: Manifest-Bindings → fga-URI → HTML-URL. `isExemplifiedBy` gewinnt; fehlt sie,
 * wird `isExemplifiedByPrivate` host-getauscht. Deterministisch (kleinste URL gewinnt,
 * falls mehrere Manifestationen binden).
 */
export function baueHtmlUrls(bindings: SparqlBinding[]): Map<string, string> {
  const kandidaten = new Map<string, Set<string>>();
  for (const b of bindings) {
    const fga = b.b?.value;
    if (!fga) continue;
    const url = b.url?.value ?? (b.priv?.value ? oeffentlicheUrl(b.priv.value) : undefined);
    if (!url) continue;
    if (!kandidaten.has(fga)) kandidaten.set(fga, new Set());
    kandidaten.get(fga)!.add(url);
  }
  const out = new Map<string, string>();
  for (const [fga, urls] of kandidaten) out.set(fga, [...urls].sort()[0]);
  return out;
}

/**
 * REIN: BBl-HTML → Artikel-Anker. Die Anker sitzen auf dem umschliessenden
 * `<article id="art_N">`, NICHT auf der Überschrift (R3-Fallenhinweis: eine reine
 * h1–h6-Suche liefert null Treffer). Die Überschrift wird aus dem ersten `<h1>`–`<h6>`
 * innerhalb des Artikels genommen und amtlich zitiert (nur Tags entfernt, Entities
 * aufgelöst, Leerraum normalisiert — §1: kein Umformulieren).
 * MEHRDEUTIGE eIds werden NICHT als Anker ausgeliefert (§1). Eine Botschaft mit
 * Mantel-Anteil führt dieselbe eId mehrfach (R3: `art_10` doppelt — einmal EOG, einmal
 * der per Mantel geänderte Erlass); gemessen 11.9.2026 trifft das bis zu 69 von 200 eIds
 * eines Dokuments. Der erste Treffer zu nehmen hiesse, den Leser mit wohldefinierter
 * Wahrscheinlichkeit an die falsche Erläuterung zu schicken — schlimmer als kein Sprung.
 * Sie gehen deshalb NUR nach `mehrdeutig` (der Befund geht nicht verloren, §8), und der
 * Artikel zeigt dann den blossen Live-Link auf die Botschaft.
 */
export function extrahiereAnker(html: string): { anker: BotschaftAnker[]; mehrdeutig: string[] } {
  const treffer = [...html.matchAll(/<article[^>]*\bid="(art_[^"]+)"[^>]*>([\s\S]{0,2000}?)<\/h[1-6]>/g)];
  const gesehen = new Map<string, BotschaftAnker>();
  const doppelt = new Set<string>();
  for (const t of treffer) {
    const eId = t[1];
    const token = ankerNachToken(eId);
    if (!token) continue; // kein Artikel-Anker (z. B. art_anhang) → nie raten
    if (gesehen.has(eId)) { doppelt.add(eId); continue; }
    gesehen.set(eId, { eId, token, ueberschrift: reinerText(t[2]), quelle: 'amtlich' });
  }
  for (const eId of doppelt) gesehen.delete(eId);
  const anker = [...gesehen.values()].sort((a, b) => (a.eId < b.eId ? -1 : a.eId > b.eId ? 1 : 0));
  return { anker, mehrdeutig: [...doppelt].sort() };
}

/**
 * Markup entfernen, Entities auflösen, Leerraum normalisieren — Zitat bleibt Zitat (§1).
 * TYPOGRAFIE-TREUE (Skill `scraping-swiss-official-sources`): `&nbsp;`/`&#160;` werden zu
 * U+00A0 aufgelöst und NICHT zu einem gewöhnlichen Leerzeichen gefaltet; die Kollabierung
 * fasst nur ASCII-Leerraum zusammen. In «Art. 16c` `Abs. 3» ist das geschützte Leerzeichen
 * Teil der amtlichen Schreibweise — ASCII-Faltung wäre eine stille Textänderung.
 */
export function reinerText(s: string): string {
  return s
    // INLINE-Auszeichnung verschwindet SPURLOS: «Art. 16<sup>c</sup>» muss «Art. 16c»
    // ergeben, nicht «Art. 16 c» — eine eingefügte Lücke wäre eine andere Artikelnummer.
    .replace(/<\/?(?:b|i|em|strong|sup|sub|span|a|abbr|small|u)\b[^>]*>/gi, '')
    // Block-Auszeichnung trennt Wörter und wird darum zu einem Leerzeichen.
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/[ \t\r\n]+/g, ' ')
    .trim();
}

/** sha256 über das abgerufene HTML (Quell-Hash, §7d). */
export function shaHtml(html: string): string {
  return createHash('sha256').update(html, 'utf8').digest('hex');
}

/** Kanonische Serialisierung eines Sidecars (byte-deterministisch, §2). */
export function serialisiereSidecar(s: AnkerSidecar): string {
  return JSON.stringify(s, null, 2) + '\n';
}

/** sha256 über den serialisierten Sidecar — Determinismus-Wächter (§11.6 (5)). */
export function shaSidecar(s: AnkerSidecar): string {
  return createHash('sha256').update(serialisiereSidecar(s), 'utf8').digest('hex');
}

/** Holt die HTML-Manifestations-URLs für eine Menge fga-URIs (VALUES-Batching). */
export async function holeHtmlUrls(
  fgaUris: readonly string[],
  fetchImpl: FetchImpl = fetch,
): Promise<Map<string, string>> {
  const werte = [...fgaUris].sort().map((u) => `<${u}>`);
  return baueHtmlUrls(await sparqlBatch(werte, baueManifestQuery, { batchGroesse: 40, fetchImpl }));
}

export interface HtmlAbruf { html: string; lastModified: string | null; contentLength: number | null; }

/**
 * Lädt EIN Filestore-HTML. Erfolg wird am Content-Type gemessen, nie am Statuscode
 * (Filestore antwortet auf fehlende Objekte mit HTTP 200 + Angular-Shell).
 */
export async function holeHtml(url: string, fetchImpl: FetchImpl = fetch): Promise<HtmlAbruf> {
  const res = await fetchImpl(url, { headers: { Accept: 'text/html' } });
  if (!res.ok) throw new Error(`Filestore antwortet ${res.status} für ${url}`);
  const typ = res.headers?.get?.('content-type') ?? null;
  if (typ !== null && !/html/i.test(typ)) {
    throw new Error(`Filestore liefert Content-Type «${typ}» statt HTML für ${url}`);
  }
  const html = await res.text();
  if (/<title>\s*Casemates\s*<\/title>/i.test(html)) {
    throw new Error(`Filestore liefert die Casemates-Shell statt des Dokuments (${url}) — Objekt fehlt.`);
  }
  const cl = res.headers?.get?.('content-length');
  return {
    html,
    lastModified: res.headers?.get?.('last-modified') ?? null,
    contentLength: cl ? Number(cl) : null,
  };
}
