# entscheidsuche-Live-Suche (B2) + Sachverhalt-Gliederung

**Erstellt:** 24.6.2026, Auftrag David: entscheidsuche-mcp in LexMetrik nutzbar
machen (Teil B des Rechtsprechungs-Fahrplans) + Sachverhalt der BGE „richtig
aufteilen". **Status:** zweifach geprüft (empirische API-Verifikation +
adversarialer Bug-Check); Code im Branch `entscheidsuche-livesuche`, noch nicht
deployt, Abnahme David offen.

## 1. Quelle + Stand (entscheidsuche.ch, empirisch 24.6.2026)

- **MCP** `https://mcp.entscheidsuche.ch/mcp` (stateless JSON-RPC, Tools
  search/search_by_case_number/fetch_document/list_hierarchy/list_facets/server_info).
  **Browser-untauglich:** Preflight CORS `*`, aber POST mit `Origin` → **403**
  (MCP-Origin-Schutz). Nur serverseitig nutzbar (war unser Cross-Check-Werkzeug).
- **`https://entscheidsuche.ch/_search.php`** — die öffentliche Such-API, die der
  MCP wrappt. **Browser-tauglich:** OPTIONS→200, `access-control-allow-origin: *`,
  POST/GET, `allow-headers: *`. ES-Backend: `entscheidsuche.pansoft.de:9200`.
  Korpus >10'000 (gte), Bund + alle Kantone, de/fr/it.
- **Response-Vertrag** (`hits.hits[]._source`): `date` (echtes Urteilsdatum),
  `title{de,fr,it}`, `abstract{de,fr,it}` (Kurz-Sachzeile), `reference[]`
  (Aktenzeichen), `hierarchy[]` ([0]=Kanton/„CH"), `canton`,
  `attachment.content_url` (amtliches PDF/HTML), `attachment.content` (Volltext —
  riesig, wird NICHT geladen), `id`.

## 2. Regel B2 — Live-Suche (deterministische Helfer + dünner Fetch)

- `baueAnfrage(q,{size,from,sortNach})`: ES-DSL `query_string` (AND-Default),
  `_source.includes` ohne `attachment.content`, size∈[1,50], Datum-Sort optional.
- `mappeTreffer(json)`: defensiv → `{treffer[],total,totalIstMindestens}`; Sprache
  de bevorzugt; Fallback Titel = Aktenzeichen.
- `sucheLive(q,opts)`: POST `_search.php`, AbortSignal, wirft bei HTTP/Netz-Fehler.
- **Geltungsbereich/Schranken (§2/§8):** KEINE Engine — externe, nicht kuratierte
  Treffer, im UI klar markiert; massgeblich bleibt die amtliche Fassung (Link je
  Treffer). Opt-in, eingeklappt; der Suchbegriff verlässt die App erst auf Klick
  (Berufsgeheimnis) — Datenschutz-Hinweis im UI. Kein gespeicherter Snapshot.

## 3. Regel Sachverhalt-Gliederung (sicher, §1)

- **Befund:** BGE-Sachverhalt ist im Bestand ein Monolith mit inline-Markern
  (A./B./C., A.a/B.b) + Seiten-Rauschen („BGE 152 III 92 S. 93", „ab Seite 93").
- **§1-Schranke:** Voll-Top-Marker-Erkennung (A./B./C.) ist UNSICHER — kollidiert
  mit Partei-/Firmennamen; Gegenbeispiel BGE 150 III 89: „B. Pte Ltd" würde als
  Abschnitt „B." fehlinterpretiert (Sachverhalt verfälscht).
- **Sichere Regel** (`teileSachverhalt`, `sachverhalt.ts`): nur an **Sub-Markern**
  `Grossbuchstabe.Kleinbuchstabe` (A.a/B.b) trennen, je Top-Letter Sequenz a,b,c…;
  diese kollidieren mit Namen praktisch nie (Namen = A.A. Gross.Gross oder A.
  einzeln). Ohne ≥2 valide Sub-Marker bleibt EIN bereinigter Block (Fallback).
  Empirisch über 258 BGE: **0 Fehl-Splits**, **130 gegliedert**.
- **Nachlaufender Top-Marker** (z.B. „… B." vor „B.a"): wird NUR abgetrennt, wenn
  sein Buchstabe dem Top des FOLGENDEN Abschnitts entspricht (≠ aktueller Top) —
  sonst bleibt er Text (Bug-Check-MAJOR-Fix: schützt Schluss-Namen wie „…im E.").
- **Wort-Invariante modulo Rauschen** als hartes Tor beim Offline-Re-Derive
  (`sachverhalt-strukturieren.ts`); berührt nur den Sachverhalt-Abschnitt + sha.
- **Anzeige** (`EntscheidBody`): Buchstaben-Label je Absatz; leere Top-Köpfe
  ausgeblendet (das Sub-Label trägt den Top-Buchstaben). Künftige Importe gliedern
  automatisch (Adapter wired).

## 4. Pflegebedarf / Abnahme-Status

- **Pflegebedarf:** API-Vertrag `_search.php` ist Dritt-Infrastruktur (kein SLA) —
  bei Ausfall zeigt das UI einen ehrlichen Fehlerzustand; die kuratierte Auswahl
  funktioniert unabhängig. Sachverhalt-Schwellen/Marker zentral in `sachverhalt.ts`.
- **Verfallsregister:** keine datierten Parameter.
- **Abnahme-Status:** zweifach geprüft (Gate grün, golden byte-gleich, Unit-Tests,
  Playwright inkl. echtem Live-Call, adversarialer Bug-Check mit MAJOR-Fix).
  Fachliche Abnahme durch David offen; kein Deploy ohne sein Ja (§9). B3–B5
  (Breiten-Ingestion / Norm-Verzahnung live / News) bleiben dokumentiert, ungebaut.
