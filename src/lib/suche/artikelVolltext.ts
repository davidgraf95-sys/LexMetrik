import type { SuchTreffer } from '../universalSuche';

// ─── Artikel-Volltextsuche (ROADMAP Schritt 5, FlexSearch) ──────────────────
//
// LAZY: FlexSearch-Lib UND der ~4 MB (gzip) Bund-Index werden erst beim ERSTEN
// Aufruf dynamisch geladen und client-seitig zu einem Index gebaut — nie im
// Haupt-Bundle (§3/§6.4: eigener Chunk, nur Ladezeitpunkt). Danach gecacht.
// Term-/Zitat-Suche (z. B. «243 ZPO», «Notwehr»), KEINE semantische Suche —
// deklinationsabhängige Phrasen treffen unscharf (§8, ehrlich kommuniziert).

interface IndexEintrag { k: string; ku: string; a: string; l: string; t: string }

let suchFn: ((q: string, limit?: number) => SuchTreffer[]) | null = null;
let ladePromise: Promise<(q: string, limit?: number) => SuchTreffer[]> | null = null;

/** Liefert (lazy, gecacht) die synchrone Artikel-Suchfunktion. */
export function ladeArtikelSuche(): Promise<(q: string, limit?: number) => SuchTreffer[]> {
  if (suchFn) return Promise.resolve(suchFn);
  if (!ladePromise) ladePromise = baue();
  return ladePromise;
}

function snippet(text: string, q: string): string {
  const lower = text.toLowerCase();
  const term = q.toLowerCase().split(/\s+/).find((w) => w.length > 2 && lower.includes(w));
  if (!term) return text.length > 120 ? text.slice(0, 120).trimEnd() + ' …' : text;
  const i = lower.indexOf(term);
  const start = Math.max(0, i - 45);
  const ende = Math.min(text.length, start + 130);
  return (start > 0 ? '… ' : '') + text.slice(start, ende).trim() + (ende < text.length ? ' …' : '');
}

async function baue(): Promise<(q: string, limit?: number) => SuchTreffer[]> {
  const [flex, daten] = await Promise.all([
    import('flexsearch'),
    fetch(import.meta.env.BASE_URL + 'such-index/artikel-bund.json').then((r) => {
      if (!r.ok) throw new Error('Index ' + r.status);
      return r.json() as Promise<{ eintraege: IndexEintrag[] }>;
    }),
  ]);
  const FlexSearch = (flex as unknown as { default?: unknown }).default ?? flex;
  const Document = (FlexSearch as { Document: new (cfg: unknown) => DocLike }).Document;
  const Charset = (FlexSearch as { Charset?: { LatinBalance?: unknown } }).Charset;

  const eintraege = daten.eintraege;
  const idx = new Document({
    document: { id: 'id', index: [{ field: 't', tokenize: 'forward' }, { field: 'l', tokenize: 'forward' }] },
    encoder: Charset?.LatinBalance,
  });
  eintraege.forEach((e, i) => idx.add({
    id: i,
    // Kürzel UND Routen-Key mitindexieren (z. B. «StGB» und «STGB», «ArGV 1»/«ARGV_1»).
    t: (e.l + ' ' + e.ku + ' ' + e.k + ' ' + e.t).toLowerCase(),
    l: (e.l + ' ' + e.ku + ' ' + e.k).toLowerCase(),
  }));

  suchFn = (q: string, limit = 40): SuchTreffer[] => {
    const roh = idx.search(q.toLowerCase(), { limit, suggest: true });
    const ids = [...new Set(roh.flatMap((r) => r.result))].slice(0, limit);
    return ids.map((i) => {
      const e = eintraege[i as number];
      return {
        id: `art:${e.k}:${e.a}`,
        // Label: Anzeige-Kürzel (e.ku, «StGB»); href: ROUTEN-Key (e.k, «STGB»).
        label: `${e.l} ${e.ku}`,
        untertitel: snippet(e.t, q),
        marke: { text: 'Gesetzestext', ton: 'soft' as const },
        href: `/gesetze/bund/${encodeURIComponent(e.k)}#art-${e.a}`,
      };
    });
  };
  return suchFn;
}

// Minimal-Typen für die FlexSearch-Document-Oberfläche (die Lib bringt keine
// passenden ESM-Typen für diese Nutzung mit).
interface DocLike {
  add(doc: { id: number; t: string; l: string }): void;
  search(q: string, opt: { limit: number; suggest: boolean }): { field: string; result: (number | string)[] }[];
}
