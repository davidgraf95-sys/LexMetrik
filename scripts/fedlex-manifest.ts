// ─── Fedlex-HTML-Manifestations-Kanonik (P1-a/b Querschnitts-Wurzel) ─────────
//
// Die eine Wahrheit über das kanonische html-N eines gepinnten Erlass-Standes.
//
// PROBLEM (FAHRPLAN-GESETZESDARSTELLUNG-V2 §Querschnitts-Wurzel):
// `fedlex-cache.sh` konstruiert für n=0-Pins die ALIAS-URL `…-de-html.html`
// (ohne -N-Suffix). Diese Alias-URL ist NICHT die registrierte Manifestation:
// Fedlex registriert die HTML-Fassung mit einem Revisions-Suffix `…-de-html-N.html`
// (N inkrementiert bei Neuausgabe). Die Alias-URL liefert je nach Erlass
//   • content-äquivalentes HTML (harmlos), ODER
//   • einen Alt-Generations-Dump (überholter Inhalt, sieht gültig aus), ODER
//   • eine Soft-404-«Casemates»-Angular-Shell (HTTP 200, ~9 kB, kein Inhalt).
// Genau wie U-PDF (#189) und Paket 4 die kanonische URL via `isExemplifiedBy`
// LESEN statt sie zu konstruieren, gehört dieselbe Kanonik in die HTML-Pins.
//
// LÖSUNG: die kanonische html-Manifestation je (eli, kons) EINMAL amtlich
// auflösen — SPARQL `isRealizedBy(DEU) → isEmbodiedBy(userFormat=html) →
// isExemplifiedBy` — und das reale -N (bzw. echt-suffixloses n=0) daraus lesen.
//
// Deterministisch (§2): injizierbare fetchImpl, VALUES-Batching (keine UNION-
// Falle), Reihenfolge = Eingabereihenfolge.

import { sparqlBatch, type FetchImpl, type SparqlBinding } from './fedlex-sparql';

const HTML_FORMAT = 'https://fedlex.data.admin.ch/vocabulary/user-format/html';
const DEU = 'http://publications.europa.eu/resource/authority/language/DEU';

export type ManifestBefund = {
  /** Kanonisches html-N (0 = registrierte Datei ist echt suffixlos). */
  n: number | null; // null = keine html-Manifestation via isExemplifiedBy auflösbar
  /** Volle Filestore-URL der kanonischen html-Manifestation (oder null). */
  file: string | null;
};

/** Liest das html-N aus einer Filestore-URL: `…-de-html-3.html`→3, `…-de-html.html`→0. */
export function nAusUrl(file: string): number | null {
  const m = file.match(/-de-html(?:-(\d+))?\.html$/);
  if (!m) return null;
  return m[1] === undefined ? 0 : Number(m[1]);
}

/**
 * Löst je (name, eli, konsKompakt) das kanonische html-N auf.
 * konsKompakt = "YYYYMMDD" (wie in cache.sh gepinnt).
 * Rückgabe: Map name → ManifestBefund. n=null ⇒ Erlass hat keine über
 * isExemplifiedBy verknüpfte html-Manifestation (Alias-URL bleibt einzige Route,
 * dann trägt die Inhalts-Sonde in cache.sh die Verifikation).
 */
export async function loeseHtmlManifeste(
  pins: { name: string; eli: string; konsKompakt: string }[],
  fetchImpl: FetchImpl = fetch,
): Promise<Map<string, ManifestBefund>> {
  const ergebnis = new Map<string, ManifestBefund>();
  // Ein SPARQL-Ergebnis liefert ALLE html-Stände je Abstract; danach je Pin auf
  // das gepinnte Datum gefiltert. VALUES über die Abstracts, Batch à 60.
  const abstracts = [...new Set(pins.map((p) => p.eli))];
  const bindings: SparqlBinding[] = await sparqlBatch(
    abstracts.map((e) => `<https://fedlex.data.admin.ch/eli/${e}>`),
    (valuesInline) => `
PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>
SELECT ?abstract ?date ?file WHERE {
  VALUES ?abstract { ${valuesInline} }
  ?c jolux:isMemberOf ?abstract ;
     jolux:dateApplicability ?date ;
     jolux:isRealizedBy ?expr .
  ?expr jolux:language <${DEU}> ;
        jolux:isEmbodiedBy ?manif .
  ?manif jolux:userFormat <${HTML_FORMAT}> ;
         jolux:isExemplifiedBy ?file .
}`,
    { fetchImpl },
  );

  // Index: eli|YYYYMMDD → file-URL (kanonische html-Manifestation).
  const index = new Map<string, string>();
  for (const b of bindings) {
    const eli = b.abstract.value.replace('https://fedlex.data.admin.ch/eli/', '');
    const datum = b.date.value.slice(0, 10).replace(/-/g, '');
    index.set(`${eli}|${datum}`, b.file.value);
  }

  for (const p of pins) {
    const file = index.get(`${p.eli}|${p.konsKompakt}`) ?? null;
    ergebnis.set(p.name, { n: file ? nAusUrl(file) : null, file });
  }
  return ergebnis;
}
