/**
 * LexFind-Discovery — kantonsweiter Erlass-Index als Entdeckungs-Schicht.
 *
 * LexFind (lexfind.ch, Sitrox) aggregiert alle Kantone + Bund. Seine offene API
 * (keine Auth) dient hier NUR der Entdeckung: «welche Erlasse gibt es pro Kanton,
 * und über welche Quelle sind sie strukturiert erschliessbar?». LexFind ist nie
 * die massgebende Quelle (§7/§8) — der Normtext kommt aus der amtlichen kantonalen
 * Plattform, LexFind liefert die Liste + die `original_url` dorthin.
 *
 * Verifizierter Vertrag (23.6.2026):
 *   POST /api/fe/de/fulltext-search  → { id, session_id }
 *   GET  /api/fe/de/fulltext-search/{id}?session_id=..&page_no=N&results_per_page=M
 *        → { number_of_pages, texts_of_law_with_matches: [ { systematic_number,
 *            entity, is_active, dta_urls:[{ original_url }], matches:[{ title }] } ] }
 *
 * Routing-Befund (Phase 0, 23.6.2026): Die clex/OrdoLex/LexWork-Familie (AR/GR/SG/
 * LU/FR/VS/BE/TG/… auf *.clex.ch, gr-lex, gesetzessammlung.sg.ch, srl.lu.ch,
 * bdlf.fr.ch, lex.vs.ch, belex.sites.be.ch, rechtsbuch.tg.ch) liefert pro Erlass
 * unter `/api/{lang}/texts_of_law/{lawId}` einen getypten Body (xhtml_tol bzw.
 * json_content) → Tier A, erschliessbar mit dem BESTEHENDEN adapter-lexwork.ts
 * (kein neuer Parser). Andere Quellen (zh.ch-zhlex, m3.ti.ch, silgeneve.ch,
 * rsn.ne.ch, rsju.jura.ch) sind PDF/HTM → Tier B/C.
 *
 * §2: Klassifikation + URL-Ableitung sind rein/deterministisch (getestet). Der
 * Netz-Enumerator ist eine dünne Hülle (wie holeLexWork), nicht unit-getestet.
 */

/** Erschliessungsgrad einer Quelle (bestimmt den Render-/Import-Pfad). */
export type Tier =
  | 'A-struktur' // getypter Body via LexWork-API → adapter-lexwork
  | 'B-pdf' // amtliches PDF, layout-extrahierbar → adapter-pdf
  | 'C-pdf-embed' // PDF/HTM ohne verlässliche Extraktion → Original einbetten
  | 'unbekannt';

/** Kantonskürzel → LexFind-entity-id (verifiziert 22.6.2026). */
export const LEXFIND_ENTITY: Readonly<Record<string, number>> = {
  CH: 27, ZH: 26, BE: 4, LU: 12, UR: 22, SZ: 19, OW: 15, NW: 14, GL: 9,
  ZG: 25, FR: 7, SO: 18, BS: 6, BL: 5, SH: 17, AR: 3, AI: 2, SG: 16,
  GR: 10, AG: 1, TG: 20, TI: 21, VD: 23, VS: 24, NE: 13, GE: 8, JU: 11,
};

/** LexWork/clex-Strukturhosts (Tier A): Host → API-Sprache. Aus inventar-kanton
 *  (olexHosts/LEXWORK) + Phase-0-Verifikation (ar.clex.ch). Generisch *.clex.ch. */
const STRUKTUR_HOST = /(?:^|\.)clex\.ch$|^www\.gr-lex\.gr\.ch$|^www\.gesetzessammlung\.sg\.ch$|^srl\.lu\.ch$|^bdlf\.fr\.ch$|^lex\.vs\.ch$|^belex\.sites\.be\.ch$|^www\.rechtsbuch\.tg\.ch$/i;

/** PDF/HTM-Hosts ohne strukturierte API (Tier C, eingebettetes Original). */
const PDF_EMBED_HOST = /(?:^|\.)zh\.ch$|^m3\.ti\.ch$|(?:^|\.)silgeneve\.ch$|^rsn\.ne\.ch$|(?:^|\.)rsju\.jura\.ch$|^www\.sz\.ch$/i;

export interface QuellKlassifikation {
  tier: Tier;
  /** Bei Tier A: die Bausteine für holeLexWork(host, lang, lawId). */
  struktur?: { host: string; lang: 'de' | 'fr' | 'it'; lawId: string };
}

/**
 * Leitet aus einer LexFind-`original_url` die Quell-Klassifikation ab. Rein.
 *
 * clex/LexWork-`original_url` hat die Form `https://{host}/data/{sn}/{lang}`
 * (z.B. https://ar.clex.ch/data/146.1/de). Daraus wird der Strukturzugriff
 * holeLexWork(host, lang, sn) (clex nutzt die Systematiknummer als lawId).
 */
export function klassifiziereQuelle(originalUrl: string): QuellKlassifikation {
  let host: string;
  let pfad: string;
  try {
    const u = new URL(originalUrl);
    host = u.hostname;
    pfad = u.pathname;
  } catch {
    return { tier: 'unbekannt' };
  }
  if (STRUKTUR_HOST.test(host)) {
    // /data/{sn}/{lang}  → lawId = sn, lang aus dem Pfad (Fallback 'de').
    const m = pfad.match(/\/data\/(.+)\/(de|fr|it)\/?$/i);
    if (m) {
      return {
        tier: 'A-struktur',
        struktur: { host, lawId: m[1], lang: m[2].toLowerCase() as 'de' | 'fr' | 'it' },
      };
    }
    // Strukturhost, aber unerwarteter Pfad → trotzdem Tier A, ohne Bausteine
    // (der Aufrufer muss lawId anders bestimmen). Sichtbar statt still (§8).
    return { tier: 'A-struktur' };
  }
  if (PDF_EMBED_HOST.test(host)) return { tier: 'C-pdf-embed' };
  return { tier: 'unbekannt' };
}

/** Ein entdeckter Erlass (eine Zeile im kantonsweiten Index). */
export interface EntdeckterErlass {
  systematischeNummer: string;
  titel: string;
  inKraft: boolean;
  originalUrl: string;
  klassifikation: QuellKlassifikation;
}

interface LexFindTreffer {
  systematic_number?: string;
  is_active?: boolean;
  dta_urls?: Array<{ original_url?: string }>;
  matches?: Array<{ title?: string }>;
}

/**
 * Enumeriert die Erlasse eines Kantons über die LexFind-Volltext-Suche. Reine
 * Netz-Hülle; die Klassifikation jedes Treffers bleibt in klassifiziereQuelle
 * testbar. `suchbegriff` ist ein häufiger Stamm (Default 'e'), der praktisch
 * jeden Titel/Volltext trifft — LexFind verlangt einen Suchtext (kein Leer-Listing).
 *
 * §8: keine stillen Caps — paginiert über ALLE Seiten.
 */
export async function enumeriereKanton(
  kanton: string,
  opt: { lang?: 'de' | 'fr' | 'it'; suchbegriff?: string; nurInKraft?: boolean; proSeite?: number } = {},
): Promise<EntdeckterErlass[]> {
  const lang = opt.lang ?? 'de';
  const entity = LEXFIND_ENTITY[kanton];
  if (entity == null) throw new Error(`enumeriereKanton: unbekannter Kanton ${kanton}`);
  const basis = `https://www.lexfind.ch/api/fe/${lang}`;
  const start = await fetch(`${basis}/fulltext-search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      search_text: opt.suchbegriff ?? 'e',
      active_only: opt.nurInKraft ?? true,
      search_in_title: true,
      search_in_content: true,
      search_in_keywords: true,
      search_in_systematic_number: true,
      entity_filter: [entity],
      category_filter: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      systematic_filter: [],
      use_global_systematics: true,
      direct_search: false,
    }),
  });
  if (!start.ok) throw new Error(`LexFind fulltext-search ${kanton}: HTTP ${start.status}`);
  const { id, session_id } = (await start.json()) as { id: number; session_id: string };

  const proSeite = opt.proSeite ?? 50;
  const erlasse: EntdeckterErlass[] = [];
  const gesehen = new Set<string>();
  let seite = 1;
  for (;;) {
    const url = `${basis}/fulltext-search/${id}?session_id=${session_id}&page_no=${seite}&results_per_page=${proSeite}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`LexFind Seite ${seite} ${kanton}: HTTP ${res.status}`);
    const data = (await res.json()) as {
      number_of_pages?: number;
      texts_of_law_with_matches?: LexFindTreffer[];
    };
    const seitenTotal = data.number_of_pages ?? 1;
    for (const t of data.texts_of_law_with_matches ?? []) {
      const sn = t.systematic_number ?? '';
      const originalUrl = t.dta_urls?.find((d) => d.original_url)?.original_url ?? '';
      const schluessel = `${sn}|${originalUrl}`;
      if (sn === '' || gesehen.has(schluessel)) continue;
      gesehen.add(schluessel);
      erlasse.push({
        systematischeNummer: sn,
        titel: t.matches?.[0]?.title ?? '',
        inKraft: t.is_active ?? false,
        originalUrl,
        klassifikation: klassifiziereQuelle(originalUrl),
      });
    }
    if (seite >= seitenTotal) break;
    seite++;
  }

  return erlasse;
}

/** Aggregiert eine Erlass-Liste zu einer Tier-Verteilung (für den Discovery-Report). */
export function tierVerteilung(erlasse: EntdeckterErlass[]): Record<Tier, number> {
  const v: Record<Tier, number> = { 'A-struktur': 0, 'B-pdf': 0, 'C-pdf-embed': 0, unbekannt: 0 };
  for (const e of erlasse) v[e.klassifikation.tier]++;
  return v;
}
