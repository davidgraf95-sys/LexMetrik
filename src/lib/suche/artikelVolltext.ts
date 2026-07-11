import type { SuchTreffer } from '../universalSuche';
import { sucherTerme, rangiere, type RankEintrag } from './artikelRanking';

// ─── Artikel-Volltextsuche (ROADMAP Schritt 5, FlexSearch) ──────────────────
//
// LAZY: FlexSearch-Lib UND der Bund-Index werden erst beim ERSTEN Aufruf dynamisch
// geladen und client-seitig zu einem Index gebaut — nie im Haupt-Bundle (§3/§6.4:
// eigener Chunk, nur Ladezeitpunkt). Danach gecacht. Term-/Zitat-Suche (z. B.
// «243 ZPO», «Notwehr»), KEINE semantische Suche — deklinationsabhängige Phrasen
// treffen unscharf (§8, ehrlich kommuniziert).
//
// UI-NAV S4: FlexSearch liefert nur noch den RECALL (Kandidatenmenge); die
// Reihenfolge bestimmt die deterministische Relevanz-Schicht artikelRanking.ts
// (Sachüberschrift-Boost + Termfrequenz + Kernerlass-Priorität + Synonyme). Feld
// `m` (Marginalie/Gliederung) macht Alltagsbegriffe wie «Miete» auffindbar, die
// im Artikeltext nie vorkommen (K10: dasselbe Daten-Sidecar, das der Reader nutzt).

interface IndexEintrag extends RankEintrag { k: string; ku: string; a: string; l: string; m: string; n: string; g: string; t: string }

// Kandidaten-Pool: deutlich grösser als das Anzeige-Limit, damit die Re-Rangierung
// die wirklich relevanten Treffer aus einer breiten Recall-Menge heben kann.
const POOL = 300;

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

function treffer(e: IndexEintrag, q: string): SuchTreffer {
  return {
    id: `art:${e.k}:${e.a}`,
    // Label: Anzeige-Kürzel (e.ku, «StGB»); href: ROUTEN-Key (e.k, «STGB»).
    label: `${e.l} ${e.ku}`,
    untertitel: snippet(e.t, q),
    marke: { text: 'Gesetzestext', ton: 'soft' as const, redundant: true },
    href: `/gesetze/bund/${encodeURIComponent(e.k)}#art-${e.a}`,
  };
}

// Minimal-Typen für die FlexSearch-Document-Oberfläche (die Lib bringt keine
// passenden ESM-Typen für diese Nutzung mit).
interface DocLike {
  add(doc: { id: number; t: string; l: string; m: string; n: string; g: string }): void;
  search(q: string, opt: { limit: number; suggest: boolean }): { field: string; result: (number | string)[] }[];
}
type FlexLike = {
  Document: new (cfg: unknown) => DocLike;
  Charset?: { LatinBalance?: unknown };
};

/**
 * Baut die synchrone Suchfunktion aus den Index-Einträgen + der FlexSearch-Lib.
 * Herausgezogen (§5), damit der Query-Testset-Test (src/tests/suche/…) exakt
 * dieselbe Pipeline (Recall + Re-Rangierung) gegen den echten Korpus fahren kann.
 */
export function baueSuchFn(eintraege: IndexEintrag[], FlexSearch: FlexLike): (q: string, limit?: number) => SuchTreffer[] {
  const Document = FlexSearch.Document;
  const Charset = FlexSearch.Charset;
  const idx = new Document({
    document: {
      id: 'id',
      index: [
        { field: 't', tokenize: 'forward' },
        { field: 'l', tokenize: 'forward' },
        // S4: Marginalie (primär + nachrangig) + Gliederung als eigene Recall-
        // Felder — «Miete» findet so «Achter Titel: Die Miete», auch wo der
        // Artikeltext das Wort nie führt.
        { field: 'm', tokenize: 'forward' },
        { field: 'n', tokenize: 'forward' },
        { field: 'g', tokenize: 'forward' },
      ],
    },
    encoder: Charset?.LatinBalance,
  });
  eintraege.forEach((e, i) => idx.add({
    id: i,
    // Kürzel UND Routen-Key mitindexieren (z. B. «StGB» und «STGB», «ArGV 1»/«ARGV_1»).
    t: (e.l + ' ' + e.ku + ' ' + e.k + ' ' + e.t).toLowerCase(),
    l: (e.l + ' ' + e.ku + ' ' + e.k).toLowerCase(),
    m: e.m.toLowerCase(),
    n: e.n.toLowerCase(),
    g: e.g.toLowerCase(),
  }));

  // Feld-Priorität im Recall: Marginalie/Gliederung ZUERST einsammeln, damit
  // topische Treffer nicht von der (oft grösseren) Textmenge aus dem Pool
  // gedrängt werden. Kritisch für Fälle wie OR 253, dessen Artikeltext das Wort
  // «Miete» nie führt — er ist NUR über die Gliederung «Die Miete» auffindbar.
  const FELD_PRIO: Record<string, number> = { m: 0, n: 1, g: 2, l: 3, t: 4 };

  return (q: string, limit = 40): SuchTreffer[] => {
    // RECALL: Original-Query + Vokabular-Synonyme (OCL-portiert, §2-deterministisch)
    // über alle Felder sammeln — grosser Pool, damit die Re-Rangierung die besten
    // Treffer heben kann (z. B. «vaterschaftsurlaub» → «Urlaub … Geburt»).
    const { orig, syn } = sucherTerme(q);
    const terme = [q.toLowerCase(), ...orig, ...syn];
    const gesehen = new Set<number>();
    const kandidaten: IndexEintrag[] = [];
    for (const term of terme) {
      if (kandidaten.length >= POOL) break;
      const buckets = idx.search(term, { limit: POOL, suggest: true })
        .slice()
        .sort((a, b) => (FELD_PRIO[a.field] ?? 9) - (FELD_PRIO[b.field] ?? 9));
      for (const bucket of buckets) {
        for (const id of bucket.result) {
          const n = id as number;
          if (!gesehen.has(n)) { gesehen.add(n); kandidaten.push(eintraege[n]); }
        }
      }
    }
    // RE-RANGIERUNG (S4): deterministische Relevanz statt FlexSearch-Roh-Ordnung.
    return rangiere(kandidaten, q, limit).map((e) => treffer(e, q));
  };
}

async function baue(): Promise<(q: string, limit?: number) => SuchTreffer[]> {
  const [flex, daten] = await Promise.all([
    import('flexsearch'),
    fetch(import.meta.env.BASE_URL + 'such-index/artikel-bund.json').then((r) => {
      if (!r.ok) throw new Error('Index ' + r.status);
      return r.json() as Promise<{ eintraege: IndexEintrag[] }>;
    }),
  ]);
  const FlexSearch = ((flex as unknown as { default?: unknown }).default ?? flex) as FlexLike;
  suchFn = baueSuchFn(daten.eintraege, FlexSearch);
  return suchFn;
}
