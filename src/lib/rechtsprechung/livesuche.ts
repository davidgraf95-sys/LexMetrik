// ─── Live-Volltextsuche im gesamten CH-Korpus (entscheidsuche.ch) ────────────
//
// DISCOVERY, NICHT ENGINE: Dies ist KEINE deterministische Rechtslogik (§2) — es
// ist eine externe Live-Recherche über die öffentliche Such-API von
// entscheidsuche.ch (Verein, CC-Daten). Ergebnisse sind NICHT von LexMetrik
// kuratiert/geprüft (§8) und werden im UI klar als extern markiert; massgeblich
// ist stets die amtliche Fassung (Link je Treffer).
//
// Architektur (§7 empirisch verifiziert 24.6.2026): direkter Browser-Fetch gegen
// `_search.php` (CORS `*`, POST/GET). Der entscheidsuche-MCP ist agentenseitig und
// blockt Browser-Origin (403), darum die darunterliegende Such-API. Kein Backend,
// kein gespeicherter Snapshot (kein Zitat-Anspruch, §7).
//
// Reine, getestete Helfer (baueAnfrage/mappeTreffer); `sucheLive` ist der dünne
// Netz-Wrapper. Der Suchbegriff verlässt die App Richtung entscheidsuche.ch —
// darum opt-in + offengelegt in der Komponente (Berufsgeheimnis).

export const LIVE_ENDPOINT = 'https://entscheidsuche.ch/_search.php';
export const LIVE_QUELLE = 'entscheidsuche.ch';

export type LiveSortierung = 'relevanz' | 'datum';

export interface LiveTreffer {
  id: string;
  titel: string;            // z.B. „Schwyz Kantonsgericht 1. Zivilkammer 04.11.2025 ZK1 2025 11"
  thema: string | null;     // abstract (Kurz-Sachzeile), wenn vorhanden
  kanton: string;           // hierarchy[0] (z.B. „CH", „SZ")
  datum: string;            // ISO „YYYY-MM-DD"
  aktenzeichen: string;     // reference.join
  quelleUrl: string | null; // amtliches Dokument (PDF/HTML) bei entscheidsuche.ch
}

export interface LiveSuchErgebnis {
  treffer: LiveTreffer[];
  total: number;            // Gesamtzahl (ES „gte" wird als Mindestzahl geführt)
  totalIstMindestens: boolean;
}

/** Erstes vorhandenes Sprachfeld (de bevorzugt — UI ist deutsch). */
function waehleSprache(feld: Record<string, string> | null | undefined): string | null {
  if (!feld || typeof feld !== 'object') return null;
  return feld.de || feld.fr || feld.it || Object.values(feld)[0] || null;
}

/** ES-Query-Body (das, was an `_search.php` geht). */
export interface EsAnfrage {
  query: { query_string: { query: string; default_operator: 'AND' } };
  size: number;
  from: number;
  _source: { includes: string[] };
  sort?: { date: { order: 'desc' } }[];
}

/**
 * ES-Query-DSL für `_search.php` bauen (rein). `query_string` mit AND-Default;
 * `_source` auf die angezeigten Felder beschränkt (Volltext `attachment.content`
 * NICHT laden — Payload + Bandbreite). Paginierung via from/size.
 */
export function baueAnfrage(
  q: string,
  opts: { size?: number; from?: number; sortNach?: LiveSortierung } = {},
): EsAnfrage {
  const size = Math.min(Math.max(opts.size ?? 20, 1), 50);
  const from = Math.max(opts.from ?? 0, 0);
  const body: EsAnfrage = {
    query: { query_string: { query: q.trim(), default_operator: 'AND' } },
    size,
    from,
    _source: { includes: ['date', 'title', 'abstract', 'reference', 'hierarchy', 'canton', 'attachment.content_url', 'id'] },
  };
  // Relevanz = ES-Default (kein sort); Datum = neueste zuerst.
  if (opts.sortNach === 'datum') body.sort = [{ date: { order: 'desc' } }];
  return body;
}

/** ES-Antwort → typisierte Treffer (rein, defensiv gegen fehlende Felder). */
export function mappeTreffer(json: unknown): LiveSuchErgebnis {
  const hits = (json as { hits?: { hits?: unknown[]; total?: { value?: number; relation?: string } } })?.hits;
  const roh = Array.isArray(hits?.hits) ? hits!.hits! : [];
  const treffer: LiveTreffer[] = roh.map((h) => {
    const s = (h as { _source?: Record<string, unknown>; _id?: string })._source ?? {};
    const hierarchy = Array.isArray(s.hierarchy) ? (s.hierarchy as string[]) : [];
    const reference = Array.isArray(s.reference) ? (s.reference as string[]) : [];
    const attachment = (s.attachment as { content_url?: string } | undefined) ?? {};
    const titel = waehleSprache(s.title as Record<string, string>) ?? (reference.join(', ') || 'Entscheid');
    return {
      id: String(s.id ?? (h as { _id?: string })._id ?? ''),
      titel,
      thema: waehleSprache(s.abstract as Record<string, string>),
      kanton: hierarchy[0] ?? String(s.canton ?? ''),
      datum: typeof s.date === 'string' ? s.date : '',
      aktenzeichen: reference.join(', '),
      quelleUrl: typeof attachment.content_url === 'string' ? attachment.content_url : null,
    };
  });
  const total = hits?.total?.value ?? treffer.length;
  return { treffer, total, totalIstMindestens: hits?.total?.relation === 'gte' };
}

/**
 * Live-Suche ausführen (dünner Netz-Wrapper). Wirft bei Netz-/HTTP-Fehler —
 * die Komponente fängt das und zeigt einen ehrlichen Fehlerzustand (§8).
 * `signal` erlaubt Abbruch (Tippen/Unmount).
 */
export async function sucheLive(
  q: string,
  opts: { size?: number; from?: number; sortNach?: LiveSortierung; signal?: AbortSignal } = {},
): Promise<LiveSuchErgebnis> {
  const res = await fetch(LIVE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(baueAnfrage(q, opts)),
    signal: opts.signal,
  });
  if (!res.ok) throw new Error(`entscheidsuche HTTP ${res.status}`);
  return mappeTreffer(await res.json());
}
