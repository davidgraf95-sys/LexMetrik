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
 * Netz-Enumerator ist eine dünne Hülle (wie holeLexWork) — fetch ist über
 * `opt.netz` (fetchMitWiederholung) injizierbar, das Pagination-/Retry-Verhalten
 * ist damit ohne echtes Netz regressionsgetestet (Crash GR-ETIMEDOUT 23.6.2026).
 */

import { fetchMitWiederholung, type WiederholOptionen } from './netz-retry.ts';

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

/**
 * Tier A wird PRIMÄR an der PFAD-Signatur der LexWork/clex/OrdoLex-Plattform
 * erkannt, NICHT an einer Host-Whitelist (Bug K2/K3: ~10 reale LexWork-Hosts wie
 * bgs.so.ch/gesetze.nw.ch/www.belex.sites.be.ch fielen sonst durchs Raster). Nur
 * diese Plattform-Familie erzeugt die Pfade `/data/{sn}/{lang}` (LexFind-
 * original_url, Phase-0 ar.clex.ch) bzw. `/app/{lang}/texts_of_law/{lawId}` (im
 * Repo durchgängig genutzte Form) — beide werden unterstützt (Bug K1).
 */
const STRUKTUR_DATA = /^\/data\/(.+?)\/(de|fr|it)\/?$/i;
const STRUKTUR_APP = /^\/app\/(de|fr|it)\/texts_of_law\/(.+?)\/?$/i;

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
 * Beide LexWork/clex-Pfadformen liefern die Bausteine für
 * holeLexWork(host, lang, lawId) (clex nutzt die Systematiknummer als lawId):
 *   - `https://{host}/data/{sn}/{lang}`              (LexFind-original_url)
 *   - `https://{host}/app/{lang}/texts_of_law/{id}`  (Repo-übliche Form)
 * Der lawId-Teil wird URL-dekodiert (Bug M1: Systematiknummern mit %2F/%20).
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
  const dekodiere = (s: string): string => {
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  };
  // Vertrauensgrenze: Tier A nur für .ch-Hosts. Alle realen kantonalen LexWork/
  // clex-Plattformen sind .ch (ar.clex.ch, bgs.so.ch, srl.lu.ch, lex.vs.ch, …);
  // so bleibt die Pfad-Signatur host-agnostisch (Bug K2/K3), ohne dass ein
  // fremder Host (evil.com/data/1/de) als Strukturquelle durchrutscht.
  if (/\.ch$/i.test(host)) {
    const mData = pfad.match(STRUKTUR_DATA);
    if (mData) {
      return {
        tier: 'A-struktur',
        struktur: { host, lawId: dekodiere(mData[1]), lang: mData[2].toLowerCase() as 'de' | 'fr' | 'it' },
      };
    }
    const mApp = pfad.match(STRUKTUR_APP);
    if (mApp) {
      return {
        tier: 'A-struktur',
        struktur: { host, lang: mApp[1].toLowerCase() as 'de' | 'fr' | 'it', lawId: dekodiere(mApp[2]) },
      };
    }
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
  opt: {
    lang?: 'de' | 'fr' | 'it';
    suchbegriff?: string;
    nurInKraft?: boolean;
    proSeite?: number;
    /** Retry-/Timeout-Härtung; injizierbar für Tests (sonst echtes Netz). */
    netz?: WiederholOptionen;
  } = {},
): Promise<EntdeckterErlass[]> {
  const lang = opt.lang ?? 'de';
  const entity = LEXFIND_ENTITY[kanton];
  if (entity == null) throw new Error(`enumeriereKanton: unbekannter Kanton ${kanton}`);
  const basis = `https://www.lexfind.ch/api/fe/${lang}`;
  const start = await fetchMitWiederholung(`${basis}/fulltext-search`, {
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
  }, opt.netz);
  if (!start.ok) throw new Error(`LexFind fulltext-search ${kanton}: HTTP ${start.status}`);
  const { id, session_id } = (await start.json()) as { id?: number; session_id?: string };
  if (id == null || !session_id) {
    throw new Error(`LexFind fulltext-search ${kanton}: unerwartete Antwort (id/session_id fehlt)`);
  }

  const proSeite = opt.proSeite ?? 50;
  const HARD_CAP = 500; // Sicherung gegen Endlos-/Fehlerschleife (§8: nie still)
  const erlasse: EntdeckterErlass[] = [];
  const gesehen = new Set<string>();
  let seite = 1;
  for (;;) {
    const url = `${basis}/fulltext-search/${id}?session_id=${session_id}&page_no=${seite}&results_per_page=${proSeite}`;
    const res = await fetchMitWiederholung(url, undefined, opt.netz);
    if (!res.ok) throw new Error(`LexFind Seite ${seite} ${kanton}: HTTP ${res.status}`);
    const data = (await res.json()) as {
      number_of_pages?: number;
      texts_of_law_with_matches?: LexFindTreffer[];
    };
    const treffer = data.texts_of_law_with_matches ?? [];
    // KL1: number_of_pages kann fehlen → NICHT vorschnell nach Seite 1 abbrechen.
    // Fehlt es, blättern wir weiter, bis eine Seite leer ist (Hard-Cap als Schutz).
    const seitenTotal = data.number_of_pages ?? HARD_CAP;
    for (const t of treffer) {
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
    // Abbruch: Seite ohne Treffer (Ende erreicht), bekannte Seitenzahl erreicht,
    // oder Hard-Cap (Schutz). So keine stille Kürzung bei fehlendem number_of_pages.
    if (treffer.length === 0 || seite >= seitenTotal || seite >= HARD_CAP) break;
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
