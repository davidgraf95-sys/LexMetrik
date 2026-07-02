# FAHRPLAN — OpenCaseLaw als Quellen-Steinbruch (Analyse 2.7.2026)

**Anlass:** David hat `github.com/jonashertner/caselaw-repo-1` (= Code hinter **opencaselaw.ch** / HF-Dataset `voilaj/swiss-caselaw`) gefunden und gefragt, *was wir daraus für Lexmetrik verwenden können*. Fünf parallele Explore-Agents haben je ein Subsystem im geklonten Repo (143k LOC Python) durchleuchtet. Dieses Dokument = konsolidierter Befund. **Noch kein Code umgesetzt.**

**Lizenz-Lage:** Daten **CC0-1.0** (keine Attributionspflicht, kommerziell frei, redistribuierbar), Code **MIT** (bei Code-Kopie Notice behalten), gehostete API ohne Keys/Paywall (Fair-Use). Gerichtsentscheide/Gesetze sind in CH ohnehin URG-frei (Art. 5 URG).

**Leit-Doktrin für alles hier:** Bei *load-bearing* Rechtsanzeige (Normtext, den wir als amtlich darstellen) darf OCL **nicht** zum Mittelsmann werden → Endpunkt-Wissen selbst gegen die amtliche Quelle nachbauen, OCL-Daten nur als Seed + Diff-Orakel. Konsumieren nur für *Anreicherung* (Entscheid-Suche, „Fälle zu Art. X"), wo OCL sichtbar als externe Sekundärquelle firmiert. (`[[extraktion-amtliche-quellen-beste-option]]`, `[[immer-doppelt-verifizieren]]`)

---

## Verwertungs-Matrix

| # | Asset | Beste Nutzung | Wert | Aufwand | Quelle amtlich? |
|---|-------|---------------|------|---------|-----------------|
| 1 | LexWork-Kantons-API (19 Kt., 2 GET-Endpunkte, sauberes JSON) | Endpunkt-Wissen → TS nachbauen | ★★★★★ | Niedrig | ✅ |
| 2 | Fedlex SPARQL-Queries A–D + Eigenheiten | Technik → TS portieren | ★★★★★ | Niedrig | ✅ |
| 3 | Zitat-Regexes + `_INVALID_LAW_CODES` + Instanzenzug | Technik → TS portieren | ★★★★★ | Niedrig-Mittel | ✅ |
| 4 | ECLI-Minting + ECLI als Interop-ID | Technik portieren + Standard | ★★★★ | Sehr niedrig | ✅ |
| 5 | Verifikations-Rails + „mechanical rewrite" | Design → Gegenprüfung | ★★★★ | Mittel | ✅ |
| 6 | Zitationsgraph als Daten (8,6M+11,8M Kanten) | konsumieren (Seed/Diff-Orakel) | ★★★★ | Niedrig | ⚠️ OCL-abgeleitet |
| 7 | REST-API `mcp.opencaselaw.ch/api` | konsumieren (nur Nicht-Load-Bearing) | ★★★ | Sehr niedrig | ❌ Mittelsmann |
| 8 | HF-Parquet / SQLite-Snapshot (Entscheid-Korpus) | konsumieren (Bulk-Seed) | ★★★ | Mittel | ⚠️ OCL-abgeleitet |

---

## ① LexWork-Kantons-API — grösster Einzelhebel (Klasse A: TS nachbauen)

Löst direkt `[[lexfind-clex-quelle-strategie]]`-Schmerz (~25–40 % Pflicht-Review, PDF-embed). 19 Kantone über **zwei identische Endpunkte**:
- Liste: `GET https://{host}/api/{lang}/texts_of_law/lightweight_index`
- Volltext: `GET https://{host}/api/{lang}/texts_of_law/{sr}/show_as_json` → Baum `text_of_law.selected_version.json_content.document.content` mit `title`/`article`/`paragraph`/`enumeration`-Knoten. **Kein PDF, kein OCR.**
- Human-URL für Zitat: `https://{host}/app/{lang}/texts_of_law/{sr}`
- Kanton-Erkennung: `GET /api/manifest.json` existiert → LexWork-SPA.

**Host-Tabelle** (aus `scrapers/cantonal_laws/__init__.py:47-67`):

| Kt | Host | Lang | | Kt | Host | Lang |
|----|------|------|-|----|------|------|
| AG | gesetzessammlungen.ag.ch | de | | NW | nw.clex.ch | de |
| AI | ai.clex.ch | de | | OW | ow.clex.ch | de |
| AR | ar.clex.ch | de | | SG | www.gesetzessammlung.sg.ch | de |
| BE | www.belex.sites.be.ch | de | | SH | sh.clex.ch | de |
| BL | bl.clex.ch | de | | SO | bgs.so.ch | de |
| BS | www.gesetzessammlung.bs.ch | de | | TG | www.rechtsbuch.tg.ch | de |
| FR | fr.clex.ch | fr | | UR | rechtsbuch.ur.ch | de |
| GL | gl.clex.ch | de | | VS | vs.clex.ch | de |
| GR | www.gr-lex.gr.ch | de | | ZG | zg.clex.ch | de |
| LU | srl.lu.ch | de | | | | |

**Parsing (LexWork, hohe Qualität):** `_walk_tree` rekursiv nach Knoten-`type`; `title`→Section-Heading (mit Nummer), `article`→sammelt `paragraph`/`enumeration`; `_html_to_text` behandelt `span.number/.text_content/.article_symbol`, dann unescape + Whitespace-Collapse mit Newline-Erhalt. Artikelnummern-Regex bis `septies`.

**README-Korrekturen (im Code verifiziert):**
- **ZH ist PDF-extrahiert** (PyMuPDF), nicht „clean HTML". Nützlich ist nur die ZH-Liste: `https://www.zh.ch/de/politik-staat/gesetze-beschluesse/gesetzessammlung/_jcr_content/main/lawcollectionsearch_312548694.zhweb-zhlex-ls.zhweb-cache.json?page=N`.
- **JU/VD/SZ** hängen an LexFind-PDF (nicht SIL). Für die: LexFind-Stopword-Seed-Enumerationstrick nachbauen (`POST lexfind.ch/api/fe/{lang}/fulltext-search` mit Stopwort-Seeds + `entity_filter:[id]` + Pagination). **VD evtl. als XML auf opendata.swiss** — vor dem Scrapen prüfen. Echte Portale: JU=`rsju.jura.ch`, VD=BLV unter `vd.ch`, SZ=`sz.ch/.../systematische-gesetzsammlung.html`.
- **GE/NE** via SIL (server-gerendertes Word-HTML, windows-1252): `silgeneve.ch/legis/program/books/rsg`, `rsn.ne.ch/DATA/program/books/rsne`. **TI**: `www3.ti.ch/CAN/RLeggi/public/index.php/raccolta-leggi/...`.

**Caveats:** Fussnoten werden bei LexWork gedroppt; Tabellen verlieren Struktur (alle Scraper); nur Primärsprache pro Kanton (API kann `{lang}`, Scraper zieht nur eine); kein Per-Artikel-Aufhebungs-Flag (aufgehobene Erlasse werden ganz übersprungen). → Bei TS-Nachbau echten DOM-Parser (cheerio/linkedom) statt Regex-Tag-Strip; Tabellen/Fussnoten bewusst besser lösen als sie.

**POC-Plan:** 2–3 LexWork-Kantone in TS extrahieren, gegen jetzige LexFind-Extraktion messen (Treue/Review-Quote), dann über Ausrollen entscheiden. Andockpunkt: `src/data/register.ts` `ErlassStatus→render_mode` (aus `[[lexfind-clex-quelle-strategie]]`).

---

## ② Fedlex SPARQL — füttert direkt `feat/normtext-phase1-fundament` (Klasse B: portieren)

**SOFORT relevant** — der aktive Branch berührt `scripts/normtext/extrahiere-fedlex.ts`. Bestätigt zudem `[[lexmetrik-akn-xml-architektur-entscheid]]`.

**Endpoint:** `https://fedlex.data.admin.ch/sparqlendpoint`, **POST form-encoded** (`Content-Type: application/x-www-form-urlencoded`, `Accept: application/sparql-results+json`) — GET 400t bei > ~4–6 KB. VALUES-Batches ~40 URIs.

**Query A (Erlasse entdecken) — die load-bearing Query:**
```sparql
PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
SELECT ?work ?srNumber (MAX(?date) AS ?latestDate) WHERE {
  ?work a jolux:ConsolidationAbstract .
  ?consolidation jolux:isMemberOf ?work .
  ?consolidation jolux:dateApplicability ?date .
  FILTER(?date <= NOW())
  { ?work jolux:historicalLegalId ?srNumber . }
  UNION
  { ?work jolux:classifiedByTaxonomyEntry ?tax . ?tax skos:notation ?srNumber .
    FILTER NOT EXISTS { ?work jolux:historicalLegalId ?any . } }
} GROUP BY ?work ?srNumber ORDER BY ?srNumber
```
**Die teure Falle:** ohne die `historicalLegalId` UNION `classifiedByTaxonomyEntry/skos:notation`-Klausel verlierst du still **~700 totalrevidierte Erlasse seit 2020, inkl. revDSG (SR 235.1)**.

- **Query B** (Konsolidierungs-URI je Work): zweite Query nötig, weil Fedlex-Datumstypen inkonsistent sind (xsd:date vs. string) → `MAX(?date)` string-sortiert unzuverlässig; stattdessen 8-stelliges Datum aus Konsolidierungs-URI (`/(\d{8})$`) vertrauen.
- **Query C** (Titel/Kürzel): FRBR-Kette `?work jolux:isRealizedBy ?expr`; `?expr jolux:language <.../authority/language/DEU|FRA|ITA>` (EU-Publications-Office-URIs, **nicht** ISO); `jolux:titleShort`=Kürzel (OR/ZGB), `jolux:title`=Titel.
- **Query D** (XML-URLs): `?expr jolux:isEmbodiedBy ?manif`; `?manif jolux:userFormat <.../user-format/xml>`; `?manif jolux:isExemplifiedBy ?url` → direkter AKN-XML-Link.
- **Query E** (Fussnoten-Auflösung BBl/AS→ELI): Seitenzahl-Prädikat ist **nicht** jolux, sondern `http://cogni.internal.system/model#historicalId` (per Prädikat-Dump gefunden, kann sich ändern).

**ELI-Muster:** Work-URI `…/eli/cc/{year}/{seq}`; 2-stelliges Jahr `eli/cc/54/…`→1954; SR-Kollisionen (BV 1874 vs. 1999 = beide SR 101) → höheres Enactment-Jahr gewinnt. Freshness via sidecar `meta.json` mit `consolidation_uri` (nur neu laden, wenn SPARQL neue URI zeigt — naives `dest.exists()` fror Erlasse auf Erstfassung ein).

**AKN→Artikel-Parsing (`build_statutes_db.py`):** NS `http://docs.oasis-open.org/legaldocml/ns/akn/3.0`; jedes `find` doppelt (Prefix + `{ns}`-Fallback, weil manche Fedlex-Files ohne Default-NS-Bindung kommen). Mapping `article`/`num`(skip `authorialNote`)/`heading`(=Randtitel)/`paragraph`. **Zwei Fedlex-spezifische Repairs (wertvoll, per Test gepinnt):**
- Split-Digit-Bug (Issue #32): `<b>Art. 16</b><b>8</b>`→„16 8"; Fix: wenn geparster Wert reine Ziffern + strikter Präfix der `eId`-Nummer → autoritative `eId` vertrauen (`art_168`→„168").
- `eId`-Fallback wenn `<num>` leer (`art_38_a`→„38a"); bis/ter-Normalisierung.

**Ihr eigener Befund = unser Council bestätigt:** flaches `text` ist verlustbehaftet (Tabellen zerstört, Whitespace collapsed, Fussnoten-Anker weg). Ihr „Fix": verbatim `<article>`-AKN-Subtree in `xml`-Spalte behalten (`ET.tostring` mit `register_namespace("", AKN_NS)`); **strukturierter JSON-Parse aufgeschoben/ungebaut**. → Wir folgen der Konsolidierung *und gehen weiter* (sauberer strukturierter Parse = unsere Phase 1). **DE/FR/IT haben KEINE Positions-Alignment** — je Sprache unabhängig geparst, Join nur über `article_num` → Nummern-Repair ist alignment-kritisch.

---

## ③ Zitations-Extraktion + Instanzenzug — Moat-Gold (Klasse B: portieren)

Reine, DB-freie Regex-Logik in `search_stack/reference_extraction.py`, 1:1 nach TS (`(?![a-z])`-Lookahead in modernem JS ok). Grundstein für `[[lexmetrik-rechtsprechung-fahrplan]]` (Norm↔Entscheid-Verzahnung).

- **`STATUTE_PATTERN`**: `Art.` + Artikel-Token (`\d+(bis|ter|…|[a-z])?`) + optional `Abs./al./cpv.` + optional `ff./ss./segg.` + optional `Ziff./lit./Bst.` + Gesetzescode `[A-Z][A-Z0-9]{1,11}(/[A-Z0-9]{2,6})?`. Normalisiert → `ART.34.ABS.2.BV`, `ART.8.EMRK`.
- **`_INVALID_LAW_CODES`** (~150 Tokens): Struktur-Marker (ABS/ZIFF/LIT/BIS/TER) + DE/FR/IT-Artikel/Präpositionen (DER/DIE/DU/LA/DELLA…). **Das teuerste Stück** (jahrelanges FP-Tuning). Plus Filter: Code mit 0 Grossbuchstaben verwerfen; 1 Gross + len>3 verwerfen.
- **`BGE_PATTERN`** `BGE (\d{1,3}) ([IVX]{1,4}) (\d{1,4})`; **`DOCKET_PATTERNS`**: `[A-Z0-9]{1,4}[._-]\d{1,6}[/_]\d{4}` (4A_123/2020), `[A-Z]{1,6}\.\d{4}\.\d{1,6}` (VB.2018.00411), bare `\d{1,3} [IVX]{1,4} \d{1,4}` (mit 8-Zeichen-Kontext-Dedup gegen explizites BGE).
- **`extract_prior_instance` (Instanzenzug):** trilingual „(Beschwerde|Berufung|recours|appel|ricorso) (gegen|contre|contro) …court…date… (Docket)" → Entscheid→Entscheid-Kanten direkt aus Rohtext. Sauber portierbar.
- **Resolution/Konfidenz:** Docket-Normalisierung (`- . / ` → `_`), Docket→Gericht-Inferenz (`^[1-9][A-Z]_\d`→bger etc.), zeitliche Plausibilität (zitierter Fall muss vorausgehen), Ambiguitäts-Penalty, Pin-Cite (`BGE 125 V 352` → Fall mit Erstseite ≤352 in nächster Nähe). Alles Heuristik, kein LLM.
- **Leading-Case-Ranking:** in-degree (`COUNT(DISTINCT source)`), aber **topisch** gescoped für Statut-Queries (nur Zitate von Entscheiden, die denselben Artikel anwenden) — vermeidet Prozess-Megafälle. Nicht PageRank.

## ④ ECLI übernehmen (Klasse B, sehr niedriger Aufwand)

`ecli.py` = reine Funktion: `ECLI:CH:BGE:{jahr}:{vol}.{div}.{page}`, Bundesgerichte feste Tokens, kantonal = Kanton+Kammer-Akronym. Docket sanitized auf `[A-Za-z0-9._-]`, `/`→`.`. **Als Interop-Join-Key übernehmen** (EU-Standard, deterministisch, mit OCL & europäischen Resolvern verknüpfbar). OCL-eigenes `cli:ch` nur zum *Lesen* von OCL, nicht als unser PK.

## ⑤ Verifikations-Rails → Gegenprüfung (Klasse B, Design)

Passt eng auf `[[immer-doppelt-verifizieren]]` + Skill `gegenpruefung`. Vier **deterministische** Rails (kein LLM, produktionsreif, gut getestet):
1. **Statut-Auflösung** (Priorität 1): jedes `Art. X LAW` das wir ausgeben → in Norm-DB auflösen, `law_unknown`/`article_not_in_law` flaggen. DE/FR/IT-Subdivisions-Regex + Invalid-Law-Denylist direkt transliterierbar.
2. **Verbatim-Zitat**: normalisierte Substring-Prüfung gegen amtliche Quelle; **Authority-Radius (250 Zeichen um Zitat) + 60-Zeichen-Minimum** = die Fixes gegen FP-Flut.
3. **Datums-Match**: adjazentes `vom DD.MM.YYYY` muss gespeichertem Datum entsprechen.
4. **Fall-Existenz**: exact-match-only Resolver (kein Fuzzy — DoS-Schutz).
- **„mechanical rewrite"** (stärkster Trick): Verifizierer liefert kanonisierten `linked_text`, den man verbatim ausliefert — kein Re-Paraphrasieren, das die Verifikation aushebelt. = unser „quittiert".
- Optionale LLM-Grounding-Rail nur zuletzt, **mit echtem Fremd-Anbieter** als Adversär (OCL nimmt Haiku vs. Sonnet = gleiche Familie → schwächer).

## ⑥⑦⑧ Daten/API konsumieren (Klasse C)

- **REST-API** `https://mcp.opencaselaw.ch/api`, **No-Auth, CORS `*`** → direkt aus Next aufrufbar. Kern-Read-Endpunkte unquotiert (nur LLM-Endpunkte haben Tageskontingente), nginx ~10–30 req/s/IP → auf Vercel aggressiv cachen. Nützlichste Endpunkte: `GET /api/laws/{abbr}?sr_number=&article=&format=json|xml`, `GET /api/laws/search`, **`GET /api/leading-cases?law_code=OR&article=41`** (Fast-Drop-in „Entscheide zu diesem Artikel"), `GET /api/decisions?query=…`, `GET /api/lookup?q=<docket>`, `GET /api/citations/{id}`, `GET /api/appeal-chain/{id}`.
- **Bulk:** HF `voilaj/swiss-caselaw`, per-Court-Parquet, 34-Feld-Schema (`export_parquet.py:31-78`, `cited_decisions`=JSON-Array = Graph in Bulk), ~7 GB, täglich. **Statuten NICHT im Parquet** (nur via API oder Repo-Build).
- **SQLite-Snapshot+Delta:** `artifacts/manifest.json` (sha256-verifiziert), Basis-Snapshot wöchentlich + tägliche Deltas → niedrigste Bandbreite für eigene Kopie. Overkill für stateless Vercel-App.
- **Empfehlung Nicht-Load-Bearing:** REST-API direkt (Rang 1, kein Storage, immer frisch), erst bei Latenz/Volumen auf Bulk/Snapshot graduieren, Remote-MCP nur für spätere KI-Assistent-Fläche.

---

## Ehrliche Vorbehalte (gelten für ALLE Übernahmen)

- Alle Zahlen **selbstberichtet** (README = Eigenwerbung). Benchmark marketing-dünn: „100 % Korrektheit" = n=10. **Ihr eigener Negativbefund: RAG verschlechterte die Korrektheit** (86,7 %→63,3 %, McNemar p=0,065). „Different model family" übertrieben.
- AKN-Flattening + kantonales Regex-Strip sind verlustbehaftet → Technik/Endpunkt übernehmen, aber **Rendering-Treue selbst besser lösen** (unser L0 „strukturerhaltend").
- Kein Per-Artikel-Aufhebungs-Tracking, nur aktuelle Konsolidierung (keine historischen Versionen).
- `[[extraktion-amtliche-quellen-beste-option]]`: POC messen vor Migration, nicht reflexhaft übernehmen.

## Empfohlene Reihenfolge

1. **① LexWork-POC (TS)** — höchster Wert/niedrigster Aufwand, amtlich, trifft grössten Schmerz. 2–3 Kantone, gegen LexFind messen.
2. **② Fedlex-SPARQL-Eigenheiten** in `extrahiere-fedlex.ts` einarbeiten (UNION-Falle + POST/Batch) — läuft am aktiven Branch mit.
3. **③/④ Zitat-Regexes + ECLI** — Rechtsprechungs-Moat-Grundstein.
4. **⑤ Verifikations-Rails** in Gegenprüfungs-Tor.
5. **⑦ `/api/leading-cases`-Widget** als schnelle sichtbare Anreicherung (Nicht-Load-Bearing).

---

## POC-Befund LexWork-API (2.7.2026, live gegen amtliche Portale)

**David wählte Strang ① — LexWork-POC.** Empirische Endpunkt-Menü-Erhebung (read-only GETs), *bevor* irgendwas migriert wird. **Verdikt: GO.** LexWork ist eine echte Tier-A-Strukturquelle und sollte LexFind-PDF für die ~18–19 LexWork-Kantone ersetzen.

**Liveness (alle 200 JSON):** SO `bgs.so.ch` · **ZG umgezogen `zg.clex.ch`→`bgs.zg.ch`** (301, Redirect fängt es) · BL `bl.clex.ch` · **FR `fr.clex.ch` (813 Erlasse, französisch)** · GR `www.gr-lex.gr.ch` · LU `srl.lu.ch` · BE `www.belex.sites.be.ch`. → **Hosts nicht hardcoden, Redirects folgen / periodisch neu entdecken.**

**Endpunkte bestätigt:**
- Index: `GET https://{host}/api/{lang}/texts_of_law/lightweight_index` → Dict `{kategorie_id: [{id, systematic_number, systematic_category_id, title, abrogated, structured_document_id}]}` (SO: 539 Erlasse/174 Kat.).
- Volltext: `GET https://{host}/api/{lang}/texts_of_law/{sr}/show_as_json`.

**Struktur (SO 614.81 tief inspiziert) — exzellent:**
- Typisierter Baum unter `text_of_law.selected_version.json_content.document.content`: `title`/`article`/`paragraph`/`enumeration`.
- **Stabile hierarchische `uid` = eId-Äquivalent** (`t-0--a-1--p-2--l-a`) → direkt auf unser Token-Muster (`art_X`) abbildbar.
- `article.number.de` (`§&nbsp;1`), `article.text.de` = Randtitel; `paragraph`→`<span class='number'>`+`<span class='text_content'>`; `enumeration`→`<td class='number'>a)</td>` (**Labels explizit, kein Fabrizieren**).
- **Fidelity quellseitig korrekt** (die exakten LexFind-PDF-Mängel aus `[[lexmetrik-gesetze-rendering-lektionen]]` entfallen): **NBSP + narrow-NBSP** (`&nbsp;`), **Tausender-Apostroph** (`1'000`), **En-Dash-Null** (`CHF &ndash;.28018` = CHF 0.28018/kg) — an BL 341 Art. 7 (Motorfahrzeugsteuer-Sätze) verifiziert.
- **Fussnoten SEPARAT** (`json_content.footnotes`-Dict, nicht im Absatztext) — OCL *droppt* sie; wir behalten Marker+Body getrennt.
- **Versionierung vorhanden:** `old_versions`/`future_versions`/`current_version`/`modification_table`/`change_documents` + `available_languages` + `canonical_link` + `pdf_link_tol` (Cross-Check-Gate) + `materials`. → **Currency + Historie möglich** (Fedlex-`dateApplicability`-Analog), OCL behält nur die aktuelle Fassung.

**Fazit: reicher als OCL selbst extrahiert** (OCL flacht auf Text ab + droppt Fussnoten) → wir walken mehr vom Baum.

**Offene POC-Caveats (vor Voll-Ausrollen klären):**
1. **Echte 2D-Matrix-Tabellen noch NICHT beobachtet** — SO/BL rendern Tarife als `enumeration_item`-Einzeiler-`<table>`. Braucht ein Gesetz mit echter Gewicht×Satz-Matrix (colspan/rowspan) zur Bestätigung; bis dahin: `enumeration_item` an der CSS-Klasse erkennen, **nicht** als Datentabelle behandeln.
2. **Nur DE tief geprüft** + FR-Index; FR/IT-Artikelbaum + bilinguale Alignment noch offen.
3. Per-Kanton-Kategorien-Taxonomie unterschiedlich; `abrogated`-Erlasse überspringen, aber Per-Artikel-Aufhebung („Aufgehoben"-eId) prüfen.
4. **Lizenz-konform** (`[[lizenz-gescrapte-amtsdaten-aggregatoren]]`): wir holen direkt vom **amtlichen Kantonsportal**, kein Aggregator-Rohdaten-Einbacken.

**Nächster konkreter Schritt (wartet auf Go):** kleiner TS-Extraktor 1 Kanton end-to-end in unsere Normtext-Struktur (`public/normtext/*`, Token=`uid`) + Doppel-Generator + `check:struktur-konsistenz` + Gegenprüfung, Review-Quote gegen jetzige LexFind-Extraktion messen. Andockpunkt `register.ts` `ErlassStatus→render_mode` (`[[lexfind-clex-quelle-strategie]]`). Isoliert auf eigenem Branch/Worktree (nicht auf `feat/normtext-phase1-fundament`).

Geklontes OCL-Repo lag unter `scratchpad/ocl` (ephemer). POC-Probe-Artefakte im Scratchpad (ephemer).

---

## Einbau-Gap-Analyse GESETZE (2.7.2026) — REFRAMING

**Wichtige Korrektur:** *kein* Greenfield. Die **kantonale Pipeline existiert schon und zieht bereits von LexWork** (Tier A, `scripts/normtext/adapter-lexwork.ts`; 1'232 Kantons-Snapshots live in `public/normtext/kanton/`; Discovery+Tier-Klassifikation `scripts/normtext/lexfind-discovery.ts`; geteilter, level-agnostischer Render-Pfad `src/pages/gesetz-leser/inhalt.tsx` + `src/components/normtext/ArtikelBody.tsx`). „Nützlichmachung" = **Upgrade INNERHALB des bestehenden Adapters**, kein neuer Tier, keine Parallel-Pipeline.

**Der Umbau konkret:** heute liest `holeLexWork()` das Feld `xhtml_tol` (HTML-String, regex-geparst, **Fussnoten gestrippt, NBSP/Whitespace kollabiert** — `adapter-lexwork.ts:71-87`). Der reichere `json_content`-Baum (mein POC) ist **bekannt aber ungenutzt** (nur im Kommentar `lexfind-discovery.ts:20` benannt: „*erschliessbar mit dem BESTEHENDEN adapter-lexwork.ts, kein neuer Parser*"). Live verifiziert 2.7.: `GET …/show_as_json` liefert `json_content` (typisierter Baum) — **aber kein `xhtml_tol`** (das kommt vom anderen Endpunkt); `version_uid` (Drift-Token) sitzt auf `text_of_law`-Ebene und bleibt verfügbar. → Umbau = Endpunkt-/Feld-Wechsel im Adapter, Signatur `LexWorkErgebnis` unverändert, alles downstream (`erzeugeKantonsSnapshots` etc.) unberührt.

**Ziel-Schema** (`src/lib/normtext/typen.ts:3-93`): `NormSnapshot` = 1 Artikel; `bloecke[]` = `{absatz, text, items?[{marke,text,tiefe}], tabelle?, mehrspaltig?}`; Datei `public/normtext/kanton/{KT}-{sysNr}.json`; id `kanton/{KT}/{sysNr}/art_{token}`. Golden = flache Map `id→sha256` (`golden/normtext-snapshot.json`), sha über text+items+tabelle+mehrspaltig. Kantonale Erlasse werden **NICHT** von Hand registriert (Generator leitet Identität aus Snapshot+Dateiname ab, `register.ts:358-373`) — anders als Bund (`ERLASS_MAP` ist bund-only). Pipeline: `npm run normtext -- --nur=kanton --kanton=XX [--discovery] --datum=$(date +%F)` → `normtext:struktur-kanton` → `check:confidence` (0.95, = die ~25-40% Review-Quote) → `check:vollstaendigkeit` → `normtext:register` → `gate`.

**Zwei verbleibende Lücken:**
1. **`json_content`-Feldmap** (Knoten article/paragraph/enumeration/title, `uid`-eIds, footnotes-Dict) — **grösstenteils vom POC schon geliefert**; im Adapter noch nicht gepinnt. eId→flacher `artikel`-Token/`items[].marke`+`tiefe` deterministisch abbilden (kollisionsfrei).
2. **SCHEMA-ENTSCHEID (David):** `bloecke` hat **kein** Fussnoten-Feld und normalisiert NBSP weg. Reicherer `json_content` HAT Fussnoten + NBSP. Optionen: **(a) in-place upgraden** (reicher, aber **Golden-Churn auf allen 1'232 Snapshots + Pflicht-`gegenpruefung`**), **(b) `json_content` nur für NEUE Kantone** (Schema-Divergenz), **(c) json_content nur für saubereres Parsing, in dasselbe `bloecke` mappen** (Fussnoten/NBSP wie heute verwerfen → minimaler Churn, moderater Fidelity-Gewinn). Nebenbei: `check:confidence`-Kalibrierung für die sauberere Quelle prüfen; `version_uid`/`version_dates_str` im json_content-Pfad bestätigen (für `stand`/Drift, `check-drift.ts:191`).

**Verdikt Gesetze: Senke gebaut + bewährt, Quelle bewährt. Offen nur (1) [~erledigt] + (2) = dein Trade-off Fidelity vs. Golden-Churn.**

---

## Einbau-Gap-Analyse RECHTSPRECHUNG (2.7.2026)

**Senke existiert + OCL ist schon DIE Quelle.** `scripts/normtext/adapter-entscheide.ts` (`API=mcp.opencaselaw.ch/api`), nur **keyed** `/decisions/{id}`+`/structure`+`/erwaegung` (Listing/leading-cases bewusst gemieden: „unzuverlässig, R1/R9"). 344 Snapshots `public/rechtsprechung/{bund,kanton}/`. Schema `src/lib/rechtsprechung/typen.ts:59` `EntscheidSnapshot` (regeste + abschnitte/erwaegung + BGE-Auszug/Volltext-Switch + bgeReferenz + zitierteNormen/zitierteEntscheide + rubrum.vorinstanz). Reader `EntscheidLeser.tsx`/`Rechtsprechung.tsx`. **Live-Suche nutzt entscheidsuche.ch direkt** (`LiveSuche.tsx`→`_search.php`), nicht OCL = doktrin-korrekt. Gate `check:entscheide` + §8-Invarianten + Pflicht-Gegenprüfung.

**Reichere OCL-Assets — Hebel-Ranking (Produktwert):**
1. **Pro-Artikel-Leitfälle** (höchster Wert). Verzahnung existiert, aber nur **gesetz-eben** (21 Codes, `norm-index.json.proNorm`); `statutesZuNormKeys` (`entscheide-mapping.ts:28`) wirft Art./Abs. weg. FAHRPLAN-RECHTSPRECHUNG:410 spezifizierte `proNorm['BGG/32']` + `rechtsprechungFuer(idx,key,art)` — **nie gebaut**, Impl. auf Gesetz-Ebene regrediert. Umbau: Art. behalten → `LAW/ART`-Index → Andock pro `<article>` in `gesetz-leser/inhalt.tsx`. Unbekannt: Index-Grösse/`BUDGET_MB`-Impact des Fan-outs.
2. **Zitationsgraph-UI** (cites/cited-by). Daten halb da (`zitierteEntscheide` gespeichert, aber nur als Crawl-BFS), **kein UI**; `/citations/{id}` ungenutzt. Umbau: inbound-Kanten build-time invertieren + Panel im Reader + id→interne `ERFASST`-Keys vs. externe bger.ch-Links.
3. **Instanzenzug** — ganz fehlt; nur `rubrum.vorinstanz` Freitext. OCL `extract_prior_instance` portieren ODER `/appeal-chain`. Neues Feld + Render + eigene Gegenprüfung.
4. **ECLI** — absent (grep leer). `EntscheidSnapshot.ecli` + reine Mint-Fn (aus `ecli.py`). Sehr billig, rein additiv.
5. **OCL /materialien** — Materialien-Gerüst existiert (Schema+Render+`check:materialien`) aber **hand-kuratiert**, nicht OCL-gespeist. Adapter fehlt. Dedup/Botschaft-Lizenz klären.

**Verbatim Erwägung/regeste = schon verdrahtet (reifer Teil), keine Lücke.**

## SCRAPER-VERDIKT (Davids Frage „58 Scraper übernehmen?") — NEIN, Hybrid

**Wir scrapen heute keine Gerichte selbst** → „Übernehmen" hiesse, funktionierenden Consume-Pfad durch wartungsintensiven Build-Pfad ersetzen. OCLs Flotte = **67 Scraper**, aber sie **kollabieren auf ~15 echte Ziele**:
- **entscheidsuche.ch deckt ~24/26 Kantone bei Near-Parity** (OCLs eigene Side-by-Side-Overlap-Daten `entscheidsuche_ingest.py:103-182`: TI 58'116/59'273, OW 2'205/2'205 voll, GR/FR/NE/SO/LU/SZ/JU ~parität) + historische Bundesgerichte (Tier D). **Ein Kanal statt ~24 Scraper.** Wir nutzen entscheidsuche schon für Live-Suche.
- **Direkt-only (irreduzibel ~15):** BGer-frisch (aber **PoW + Incapsula-JS-Challenge + SSH-SOCKS-Tunnel** weil IP geblockt; Frische = *gleicher Werktag*, stündlicher Poller — NICHT ~15 Min wie README behauptet), ~13 Regulatoren (WEKO/ElCom/PostCom/ESBK/RAB/Preisüberw./BAZG/UBI/FINMA/EDÖB/TA-SST — off-entscheidsuche, CMS-Regex-brüchig, winziges Volumen), ECHR/HUDOC.
- **Wartungsrealität:** Incapsula-Arms-Race (Cookies 20-30 Min), Tunnel-Babysitting, Weblaw-Portal-Churn (BStGer schon einmal migriert), 61-GB-DB, Health/Alert-Subsystem. Voll-Port ≈ **3-5 Eng-Monate + 0,5-1 FTE Dauerbetrieb** → für Solo-Projekt Non-Starter.

**Empfohlener Hybrid (>95% Korpus, Bruchteil des Aufwands):**
| Familie | Strategie | Warum |
|---|---|---|
| 26 Kantone | **entscheidsuche 1 Kanal** | Near-Parity bewiesen; nutzen wir schon |
| Regulatoren (~13) + hist. Bund/BGE | **OCL CC0-Parquet konsumieren** | off-es, brüchig, winziges Volumen; schlechtester Port-ROI |
| BStGer/BVGer | **portieren (billig)** | saubere JSON-APIs (Weblaw-Churn beachten) |
| HUDOC/ECHR | **portieren** | einzigartige JSON-API, trivial |
| BGer/BGE frisch | **Endpunkt-Wissen portieren (optional)** | einzige Gleichtags-Quelle, aber teuerste Wartung (PoW/Incapsula/Tunnel) |

**Uniformes Schema** (Pydantic `Decision`, 29 Felder + derived → 34; Dedup `decision_id={court}_{docket_norm}`) — Consume- und Port-Pfad erzeugen identische Records.

## GESAMT-VERDIKT beide Achsen

Der grösste ungenutzte Hebel ist **NICHT Scraper**, sondern **Technik-Ports build-time**: pro-Artikel-Leitfälle (#1) + Zitationsgraph + Instanzenzug + ECLI — deterministisches JSON im Produktpfad, keine Laufzeit-OCL-API (FAHRPLAN §8). Scraper: Hybrid statt Flotte. Nächste Entscheidung Davids: (Gesetze) Schema-Trade-off (a/b/c) · (Rechtsprechung) welcher Hebel zuerst — pro-Artikel-Leitfälle ist der Produkt-Nordstern.
