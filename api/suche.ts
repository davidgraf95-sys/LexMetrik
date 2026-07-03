// api/suche.ts — QS-DATA E2 Edge-Suche über die HOT-FTS (read-only).
//
// AKTIVIERUNG = David-Handschritt: Turso provisionieren + 2 Env-Vars in Vercel setzen
// (TURSO_DATABASE_URL, TURSO_AUTH_TOKEN). Detail: FAHRPLAN-DATENHALTUNG §5 E2 + §10.3.
// Solange die Vars FEHLEN, liefert die Funktion einen ehrlichen 503 (§8) — der statische
// Client-Suchindex (src/lib/suche) bleibt der Fallback, es wird nichts vorgetäuscht.
//
// Read-only + dependency-frei: KEIN @libsql/client, sondern der Turso-HTTP-Endpunkt
// (/v2/pipeline) über das globale fetch. KEIN Import aus src/ (Client bleibt unberührt);
// KEIN Cross-DB-Zugriff (die check:datenhaltung-Invariante über api/** bleibt grün). Die
// Query-Logik (Match-Bau, Pagination by design, SQL, Zeilen-Formung) ist mit dem Build-Zeit-
// Modul scripts/datenhaltung/suche.ts GETEILT (§5) — dort laufen die Unit-Tests dagegen.
import {
  baueFtsMatch,
  klemmeFenster,
  naechsterOffset,
  formeArtikelTreffer,
  formeEntscheidTreffer,
  SQL_ARTIKEL_COUNT,
  SQL_ARTIKEL_TREFFER,
  SQL_ENTSCHEIDE_COUNT,
  SQL_ENTSCHEIDE_TREFFER,
  type ArtikelRohzeile,
  type EntscheidRohzeile,
  type ArtikelTreffer,
  type EntscheidTreffer,
  type SucheAntwort,
} from '../scripts/datenhaltung/suche.ts';

export const config = { runtime: 'edge' };

type Wert = string | number | null;

/** Minimaler Turso-HTTP-Client (Hrana /v2/pipeline) — dependency-frei über fetch. */
async function tursoAbfrage(
  basisUrl: string,
  token: string,
  anfragen: Array<{ sql: string; args: Wert[] }>,
): Promise<Array<Array<Record<string, string | null>>>> {
  const httpUrl = basisUrl.replace(/^libsql:\/\//, 'https://').replace(/\/$/, '');
  const body = {
    requests: [
      ...anfragen.map((a) => ({
        type: 'execute' as const,
        stmt: {
          sql: a.sql,
          args: a.args.map((v) =>
            v === null
              ? { type: 'null' as const, value: null }
              : typeof v === 'number'
                ? { type: 'integer' as const, value: String(v) }
                : { type: 'text' as const, value: v },
          ),
        },
      })),
      { type: 'close' as const },
    ],
  };
  const res = await fetch(`${httpUrl}/v2/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Turso HTTP ${res.status}`);
  const daten = (await res.json()) as {
    results: Array<{
      type: string;
      response?: { result?: { cols: Array<{ name: string }>; rows: Array<Array<{ value: string | null }>> } };
    }>;
  };
  return anfragen.map((_, i) => {
    const result = daten.results[i]?.response?.result;
    if (!result) return [];
    const namen = result.cols.map((c) => c.name);
    return result.rows.map((zeile) => {
      const obj: Record<string, string | null> = {};
      namen.forEach((n, j) => (obj[n] = zeile[j]?.value ?? null));
      return obj;
    });
  });
}

async function sucheArtikelEdge(
  url: string,
  token: string,
  query: string,
  match: string,
  limit: number,
  offset: number,
): Promise<SucheAntwort<ArtikelTreffer>> {
  const [countRows, treffRows] = await tursoAbfrage(url, token, [
    { sql: SQL_ARTIKEL_COUNT, args: [match] },
    { sql: SQL_ARTIKEL_TREFFER, args: [match, limit, offset] },
  ]);
  const gesamt = Number(countRows[0]?.n ?? 0);
  // Snippet-Bau braucht den ORIGINAL-Query (nicht den FTS-Match) — explizit durchgereicht.
  const treffer = (treffRows as unknown as ArtikelRohzeile[]).map((r) => formeArtikelTreffer(r, query));
  return { treffer, gesamt, naechsteSeite: naechsterOffset(gesamt, offset, limit) };
}

async function sucheEntscheideEdge(
  url: string,
  token: string,
  match: string,
  limit: number,
  offset: number,
): Promise<SucheAntwort<EntscheidTreffer>> {
  const [countRows, treffRows] = await tursoAbfrage(url, token, [
    { sql: SQL_ENTSCHEIDE_COUNT, args: [match] },
    { sql: SQL_ENTSCHEIDE_TREFFER, args: [match, limit, offset] },
  ]);
  const gesamt = Number(countRows[0]?.n ?? 0);
  const treffer = (treffRows as unknown as EntscheidRohzeile[]).map(formeEntscheidTreffer);
  return { treffer, gesamt, naechsteSeite: naechsterOffset(gesamt, offset, limit) };
}

const LEER: SucheAntwort<never> = { treffer: [], gesamt: 0, naechsteSeite: null };

export default async function handler(req: Request): Promise<Response> {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;
  // §8: ohne provisioniertes Turso NICHT vortäuschen — ehrlicher 503, Client-Index bleibt Fallback.
  if (!url || !token) {
    return new Response(JSON.stringify({ fehler: 'Suche über die Masse noch nicht aktiviert' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  const params = new URL(req.url).searchParams;
  const q = params.get('q') ?? '';
  const typ = params.get('typ') ?? 'alle'; // 'artikel' | 'entscheide' | 'alle'
  const { limit, offset } = klemmeFenster({
    limit: params.has('limit') ? Number(params.get('limit')) : undefined,
    offset: params.has('offset') ? Number(params.get('offset')) : undefined,
  });
  const match = baueFtsMatch(q);

  const antwort: {
    artikel?: SucheAntwort<ArtikelTreffer>;
    entscheide?: SucheAntwort<EntscheidTreffer>;
  } = {};
  try {
    if (!match) {
      if (typ !== 'entscheide') antwort.artikel = LEER;
      if (typ !== 'artikel') antwort.entscheide = LEER;
    } else {
      if (typ !== 'entscheide') antwort.artikel = await sucheArtikelEdge(url, token, q, match, limit, offset);
      if (typ !== 'artikel') antwort.entscheide = await sucheEntscheideEdge(url, token, match, limit, offset);
    }
  } catch (e) {
    return new Response(JSON.stringify({ fehler: 'Suche vorübergehend nicht verfügbar', detail: String(e) }), {
      status: 502,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  return new Response(JSON.stringify(antwort), {
    status: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
