// ─── Geteilter Fedlex-SPARQL-Helfer (Portfolio §0c) ──────────────────────────
//
// EIN Ort für Endpoint + VALUES-Batching, wiederverwendet von den Fedlex-
// Portfolio-Generatoren (P1-c Wiedervorlage/Currency; später Paket 2/5). Modelliert
// auf die verifizierte Mechanik in scripts/fedlex-versionen-pruefen.ts (POST,
// application/x-www-form-urlencoded, sparql-results+json).
//
// Deterministisch (§2/§0b Regel 5): injizierbare fetchImpl (testbar, kein Netz im
// Unit-Test), keine Zufälligkeit, kein Date.now(). Batch-Reihenfolge = Eingabe-
// reihenfolge. VALUES-Batching statt UNION (bekannte ~700-statt-alle-Falle, §0c).

export const FEDLEX_SPARQL = 'https://fedlex.data.admin.ch/sparqlendpoint';

export type SparqlBinding = Record<string, { value: string }>;
export type FetchImpl = typeof fetch;

/** Eine SELECT-Abfrage gegen den amtlichen Endpunkt; gibt die Bindings zurück. */
export async function sparqlSelect(query: string, fetchImpl: FetchImpl = fetch): Promise<SparqlBinding[]> {
  const res = await fetchImpl(FEDLEX_SPARQL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/sparql-results+json',
    },
    body: `query=${encodeURIComponent(query)}`,
  });
  if (!res.ok) throw new Error(`Fedlex-SPARQL antwortet ${res.status}`);
  // W2·22 (gemessen 2.9.2026): der Endpunkt beantwortet manche Abfrageformen mit
  // HTTP 200 UND einer HTML-Fehlerseite — `res.ok` ist dann true und `.json()`
  // wirft bloss einen nichtssagenden Parser-Fehler. Der Statuscode taugt nicht
  // als Erfolgsmass (Skill `scraping-swiss-official-sources`, Falle 3: dieselbe
  // Mechanik am Filestore). Massgeblich ist der Content-Type.
  // Bewusst NUR ablehnend, wenn der Header DA ist und nicht nach JSON aussieht:
  // die bestehenden Unit-Tests reichen Attrappen ohne `headers` durch (kein Netz),
  // und eine HTML-Fehlerseite trägt IMMER `text/html`. So greift die Prüfung
  // gegen die reale Falle, ohne netzfreie Tests zu brechen.
  const typ = res.headers?.get?.('content-type') ?? null;
  if (typ !== null && !typ.includes('json')) {
    const anfang = (await res.text()).slice(0, 200).replace(/\s+/g, ' ');
    throw new Error(
      `Fedlex-SPARQL antwortet ${res.status}, aber Content-Type «${typ}» statt JSON `
      + `(HTML-Fehlerseite trotz 200). Beginn: ${anfang}`,
    );
  }
  const json = (await res.json()) as { results?: { bindings?: SparqlBinding[] } };
  return json.results?.bindings ?? [];
}

/**
 * SELECT über eine grosse VALUES-Liste, in höflichen Teil-Batches (Default 60,
 * wie der Gap-Report). `baueQuery(valuesInline)` erhält den fertigen, leerzeichen-
 * getrennten Inline-Block der VALUES-Zeile. Bindings aller Batches zusammengeführt,
 * Reihenfolge = Eingabereihenfolge (deterministisch).
 */
export async function sparqlBatch(
  werte: string[],
  baueQuery: (valuesInline: string) => string,
  opts: { batchGroesse?: number; fetchImpl?: FetchImpl } = {},
): Promise<SparqlBinding[]> {
  const { batchGroesse = 60, fetchImpl = fetch } = opts;
  const alle: SparqlBinding[] = [];
  for (let i = 0; i < werte.length; i += batchGroesse) {
    const teil = werte.slice(i, i + batchGroesse);
    const bindings = await sparqlSelect(baueQuery(teil.join(' ')), fetchImpl);
    for (const b of bindings) alle.push(b);
  }
  return alle;
}
