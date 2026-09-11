// scripts/materialien/adapter-bs-grossrat.ts
// K-16 (W2·13-KANTONE-DATEN): browserloser Adapter für die Geschäfts- und Dokumenten-
// Datensätze des Grossen Rates Basel-Stadt auf data.bs.ch (OpenDataSoft Explore v2.1).
//
// §2 Determinismus: reiner Fetch + Feldauswahl, keine Heuristik, kein Date.now — das
// Abrufdatum kommt als Argument von der Shell. §7: jede Zeile trägt ihre amtliche URL;
// der Stand ist das amtliche Dokument-/Geschäftsdatum, nie ein konstruiertes.
//
// PERSONENDATEN (Auflage des Auftrags, Vormessung §4): 100311 führt Namen, Vornamen,
// Parteien und Mitglieder-Nummern der Urheberinnen und Urheber von Vorstössen. Diese
// Felder werden NICHT geholt — die Abfrage wählt die erlaubten Felder EINZELN an
// (`select=`), statt alle zu holen und danach zu filtern. Ein Positivlisten-Ansatz:
// ein neues Personenfeld im Datensatz landet so gar nicht erst im Prozess.
// Gegenprobe: `FELDER_GESCHAEFT` / `FELDER_DOKUMENT` sind die einzigen Feldlisten,
// `check:bs-materialien` prüft die erzeugten Artefakte zusätzlich gegen eine
// Verbotsliste (Defence in depth — die Feldliste ist die Wurzel, das Tor der Zaun).
//
// Lizenz der Quelle: CC BY 4.0 (Datensatz-Metadatum `license`), Belegstelle und
// Messung in bibliothek/materialien/2026-09-12-k16-bs-vormessung.md.

/** Fetch-Implementierung injizierbar (Tests fahren ohne Netz, §2/§0b Regel 5). */
export type FetchImpl = typeof fetch;

export const BS_API = 'https://data.bs.ch/api/explore/v2.1/catalog/datasets';

/** Die drei genutzten amtlichen Datensätze (Vormessung §1). */
export const BS_DATENSATZ = {
  /** Grosser Rat: Geschäfte (21 164 Records, Stand 12.9.2026). */
  geschaefte: '100311',
  /** Grosser Rat: Dokumente (56 675 Records). */
  dokumente: '100313',
  /** Gesetzessammlung: Gesetzestexte (11 007 Records, davon 937 aktiv). */
  erlasse: '100354',
} as const;

/**
 * Erlaubte Felder des Geschäfts-Datensatzes — Positivliste (s. Kopf).
 * Bewusst NICHT enthalten: name_urheber, vorname_urheber, name_vorname_urheber,
 * anrede_urheber, partei_kname_urheber, nr_urheber, url_urheber,
 * url_urheber_ratsmitgl, gremientyp_urheber und alle *_miturheber-Entsprechungen.
 */
export const FELDER_GESCHAEFT = [
  'signatur_ges', 'titel_ges', 'ga_rr_gr', 'beginn_ges', 'ende_ges',
  'status_ges', 'url_ges', 'departement_ges',
] as const;

/** Erlaubte Felder des Dokumenten-Datensatzes (keine Personenfelder vorhanden). */
export const FELDER_DOKUMENT = [
  'signatur_ges', 'signatur_dok', 'titel_dok', 'dokudatum', 'url_dok',
] as const;

/** Erlaubte Felder der Gesetzestexte (nur Metadaten — kein `text_of_law`/`gesetzestext_html`:
 *  der Volltext liegt bereits im Korpus, ein zweiter Abzug wäre eine zweite Wahrheit, §5). */
export const FELDER_ERLASS = [
  'systematic_number', 'title_de', 'keywords_de', 'category_name',
  'original_url_de', 'version_active_since',
] as const;

/** Eine Geschäfts-Zeile (genau die Felder aus FELDER_GESCHAEFT). */
export interface BsGeschaeft {
  signatur_ges: string;
  titel_ges: string | null;
  ga_rr_gr: string | null;
  beginn_ges: string | null;
  ende_ges: string | null;
  status_ges: string | null;
  url_ges: string | null;
  departement_ges: string | null;
}

/** Eine Dokument-Zeile (genau die Felder aus FELDER_DOKUMENT). */
export interface BsDokument {
  signatur_ges: string | null;
  signatur_dok: string | null;
  titel_dok: string | null;
  dokudatum: string | null;
  url_dok: string | null;
}

/** Eine Erlass-Metadatenzeile der amtlichen Gesetzessammlung. */
export interface BsErlassMeta {
  systematic_number: string;
  title_de: string | null;
  keywords_de: string[] | null;
  category_name: string | null;
  original_url_de: string | null;
  version_active_since: string | null;
}

/** Baut die Export-URL (deterministisch: feste Feldreihenfolge, feste Parameterfolge). */
export function exportUrl(datensatz: string, felder: readonly string[], where?: string): string {
  const p = new URLSearchParams();
  p.set('select', felder.join(','));
  if (where) p.set('where', where);
  return `${BS_API}/${datensatz}/exports/json?${p.toString()}`;
}

/**
 * Holt einen Vollexport. Wirft bei allem ausser HTTP 200 mit JSON-Array — ein
 * halber Abzug darf nie als «keine Treffer» durchgehen (§8: nie still weniger).
 */
export async function holeExport<T>(
  datensatz: string,
  felder: readonly string[],
  fetchImpl: FetchImpl = fetch,
  where?: string,
): Promise<T[]> {
  const url = exportUrl(datensatz, felder, where);
  const antwort = await fetchImpl(url, { headers: { accept: 'application/json' } });
  if (!antwort.ok) {
    throw new Error(`bs-grossrat: ${url} → HTTP ${antwort.status} (${antwort.statusText}).`);
  }
  const daten: unknown = await antwort.json();
  if (!Array.isArray(daten)) {
    throw new Error(`bs-grossrat: ${url} → kein JSON-Array (${typeof daten}).`);
  }
  if (daten.length === 0) {
    throw new Error(`bs-grossrat: ${url} → 0 Records; ein leerer Abzug ist ein Fehler, keine Aussage (§8).`);
  }
  return daten as T[];
}

/** Live-Link eines Geschäfts (§7c) — amtlich, nie konstruiert, wenn `url_ges` da ist. */
export function geschaeftUrl(g: BsGeschaeft): string {
  return g.url_ges ?? `https://grosserrat.bs.ch/?gnr=${g.signatur_ges}`;
}

/** Live-Link eines Dokuments (§7c). */
export function dokumentUrl(d: BsDokument): string | null {
  return d.url_dok ?? (d.signatur_dok ? `https://grosserrat.bs.ch/?dnr=${d.signatur_dok}` : null);
}
