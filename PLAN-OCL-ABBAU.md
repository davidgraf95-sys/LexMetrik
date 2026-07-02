# PLAN-OCL-ABBAU — Ausführungsplan «alles Nützliche aus OpenCaseLaw» (Planner Fable, 2.7.2026)

**Was das ist.** Der *eine* autoritative Extraktions- + Integrationsplan, den Opus abarbeitet, um aus
`github.com/jonashertner/caselaw-repo-1` (Code hinter opencaselaw.ch, ~143k LOC Python, Daten CC0 / Code MIT)
**alles** für Lexmetrik Nützliche zu heben — nicht nur Rechtsprechung. Baut auf
[`FAHRPLAN-OPENCASELAW-QUELLEN.md`](FAHRPLAN-OPENCASELAW-QUELLEN.md) auf (8 Vor-Agenten + LexWork-POC; deren
Verdikte gelten hier als *gesetzt*) und ergänzt einen **systematischen Repo-Sweep** (3 neue Agenten:
OCL-search_stack-Kandidaten · OCL-Peripherie · Lexmetrik-Senke). Dieser Plan **ersetzt keine** Verdikte des
FAHRPLAN, er **sequenziert** sie und fügt die neu gefundenen Assets ein.

**Kein Code hier umgesetzt.** Opus implementiert; Fable plant nur.

---

## Doktrin-Leitplanken (gelten über JEDEM Arbeitspaket — nicht wiederholt, sondern vorausgesetzt)

0. **OCL-FIRST — für ALLES, was gebaut wird (Daueranweisung David 2.7.2026).** Vor/bei jedem
   Schritt UND jedem Bugfix zuerst das **OCL-Repo** (`caselaw-repo-1`) nach einer vorhandenen,
   getunten Lösung durchsuchen; falls vorhanden, sie **in den Lexmetrik-Code übernehmen/portieren**,
   statt neu zu erfinden. Nur wenn OCL nichts Passendes hat (oder es der Doktrin widerspricht), selbst
   bauen — und das begründen. Beispiel W3-Fix: OCLs kuratierte Bund-Whitelist `_SR_NUMBER_MAP`
   (`mcp_server.py:3810`) lässt das mehrdeutige «StG» bewusst weg → dieselbe Entscheidung übernommen.
   **Jeder Umsetzungs-Agent erhält diesen Auftrag explizit** (OCL-Repo-Pfad + „suche dort zuerst").


1. **Load-bearing = nie über OCL zur Laufzeit.** Amtlich dargestellter Normtext/jeder Rechtswert läuft
   **build-time deterministisch** (kein `Date.now`, kein Laufzeit-LLM im Produktpfad, §8 FAHRPLAN-RECHTSPRECHUNG).
   OCL ist **Seed + Diff-Orakel + Technik-Vorlage**, nie Mittelsmann. Sichtbare amtliche-Quelle-Links Pflicht.
2. **Nur amtliche/URG-freie Quellen** (Art. 5 URG: Fedlex, BGer/BGE, Kantonsportale, parlament.ch, admin.ch).
   **Keine Sekundärliteratur** (Kommentare/Doktrin/OpenAlex/SAV-Kompilate) — siehe Exklusionen.
3. **Jeder Wert mit Norm + Link + Stand hinterlegt** ([[immer-doppelt-verifizieren]]). Extrahierte Werte doppelt:
   Recherche + unabhängige adversariale Gegenprüfung.
4. **Golden-Disziplin (§6).** Verhaltensändernde Änderung ⇒ Golden byte-gleich geprüft; reine Prüf-/Format-Logik
   bleibt byte-gleich. Snapshot-Regenerierung ohne Logikänderung öffnet **keinen** 26×-Slot.
5. **Risiko-Pfad ⇒ `check:gegenpruefung` + Pflicht-Gegenprüfung** (Skill »gegenpruefung«, adversarialer Zweit-Opus
   gegen die amtliche Quelle, `Gegenpruefung:`-Trailer). Risiko-Pfade: `scripts/normtext/**`,
   `src/lib/normtext/**`, `public/normtext/*.json`, Rechen-Engines, `src/lib/vorlagen/**`, `src/data/tarif/**`.
6. **Fidelity gewinnt immer** (L0 «strukturerhaltend» + [[lexmetrik-performance-grundsatz]]): OCL flacht ab
   (Text-Kollaps, Fussnoten-Drop, Tabellen-Struktur weg) → wir lösen die Darstellung **besser** als OCL, nicht gleich.
7. **POC vor Migration** ([[extraktion-amtliche-quellen-beste-option]]): reichere Quelle erst messen (Review-Quote,
   Treue), dann ausrollen — nicht reflexhaft migrieren.
8. **Werkzeug/Senke zuerst prüfen** ([[werkzeuge-zuerst-pruefen]]): die Pipeline existiert bereits (LexWork-Adapter,
   Entscheide-Adapter, Fedlex-Cache, Gates). Jedes Paket ist **Upgrade im bestehenden Pfad**, kein Greenfield.

**Provenienz-Klasse je OCL-Schicht** (entscheidet consume vs. port): OCLs **Statut-/Materialien-/Amendment-Schicht
ist fast vollständig aus dem amtlichen Fedlex** (SPARQL + Filestore) gebaut → Technik direkt reuse-bar & URG-sauber.
Die **Fallrechts-Graph-Schicht ist OCL-abgeleitet** (gescrapte Entscheide) → andere Provenienzklasse, nur als
Anreicherung mit sichtbarem OCL-Verweis. Die **Such-Vokabulare + Rerank-Gewichte sind handkuratierte Code-Konstanten**
(konsumierbar, kein LLM). LLM tritt bei OCL **nur zur Query-Zeit** im Such-Server auf — nie in den Statut-/Materialien-Artefakten.

---

## Vollständiges Inventar — jedes nützliche OCL-Asset

Legende Strategie: **C**=consume-data · **P**=port-technique (nach TS nachbauen) · **R**=reimplement-endpoint ·
**Ref**=nur Referenz/Idee · **X**=ausgeschlossen. Risiko: **RP**=Risiko-Pfad (Gate+Gegenprüfung) · **GC**=Golden-Churn ·
**–**=risikoarm. Wert ★1–5.

### A. Gesetze / Normtext (amtlich, direkt reuse-bar)

| # | OCL-Asset (Quelle:Zeile) | Strat. | Lexmetrik-Andockpunkt (Datei:Zeile) | Risiko | Wert |
|---|---|---|---|---|---|
| A1 | **LexWork `json_content`-Baum** (POC; reicher als OCLs eigener `xhtml_tol`-Strip) | P/C | `scripts/normtext/adapter-lexwork.ts:587-656` (`holeLexWork` liest heute `xhtml_tol`; auf `show_as_json`→`json_content` umstellen); Schema `src/lib/normtext/typen.ts:3-87` | RP·GC | ★★★★★ |
| A2 | **Fedlex SPARQL Query A–E** (`scrapers/fedlex.py`, `build_statutes_db.py`; UNION `historicalLegalId`/`skos:notation`; POST-form; VALUES-Batch) | P | `scripts/normtext/extrahiere-fedlex.ts` + `scripts/fedlex-cache.sh` (heute Filestore-HTML, Pins in `EINTRAEGE=()`); `check:fedlex-versionen`=`scripts/fedlex-versionen-pruefen.ts` nutzt SPARQL schon | RP | ★★★★★ |
| A3 | **AKN→Artikel-Repairs** (`build_statutes_db.py`: Split-Digit-Bug #32; `eId`-Fallback leeres `<num>`; bis/ter-Norm.; NS-Doppel-`find`) | P | `scripts/normtext/extrahiere-fedlex.ts:118-124` (Parser-Härtung; DE/FR/IT je Sprache, Join nur über `article_num` ⇒ Nummern-Repair alignment-kritisch) | RP·GC | ★★★★ |
| A4 | **`unicode61 remove_diacritics 2` FTS-Design** (`db_schema.py:53`, `build_fts5.py`) — diakritik-insensitive DE/FR/IT-Matching, external-content, BM25 | Ref/P | `scripts/such-index-generieren.ts` (FlexSearch, Bund-only, `public/such-index/`); Kanton/Rechtsprechung noch nicht indexiert | – | ★★★ |
| A5 | **Cantonal-Sourcing-Karte** (`docs/canonical_numbers.md:58`; 26 Kt. = LexWork 18 + SIL GE/NE + ZH-PDF + TI + LexFind-PDF 4) | Ref | `scripts/normtext/lexfind-discovery.ts` (Tier-Klassifikation); pairt mit Skill `scraping-swiss-official-sources` | – | ★★★ |
| A6 | **`law_widget.py` Statut-Karte** — Fedlex(rot)/LexFind(teal) Quell-Konvention, CSP-safe, trilingual | Ref | `src/components/normtext/ArtikelBody.tsx`, `MaterialKarte.tsx` (Quell-Link-Konvention) | – | ★★ |
| A7 | **`build_cantonal_laws_db.py`** — direkt-Portal schlägt LexFind-PDF | Ref (nil-neu) | schon abgedeckt durch bestehende Tier-Logik; **keine** Kt↔Bund-SR-Ausrichtung vorhanden | – | ★ |

### B. Materialien / Botschaft / Amendment (amtlich Fedlex — der grösste NEU-Fund)

| # | OCL-Asset | Strat. | Lexmetrik-Andockpunkt | Risiko | Wert |
|---|---|---|---|---|---|
| B1 | **Verbatim per-Artikel Botschaft-Korpus** (`build_botschaft_corpus.py`, 1026 Z., **KEIN LLM**, `$0`): AKN-`<article eId>` bevorzugt / pdfplumber-Fallback; `ARTICLE_HEADER_RE` «Zu Art. N / Ad art. N / All'art. N» (:391-401); Join-Tabelle `article_botschaft_links(sr,article,relation∈{enacted,amended,considered})` | P/C | **NEU**: OCL-Adapter für `src/lib/materialien/` (heute hand-kuratiert `register.ts`, `MaterialStatus`); Gate `check:materialien`=`scripts/materialien/check-materialien.ts`; Andock pro `<article>` in `gesetz-leser/parts.tsx:199` | RP | ★★★★★ |
| B2 | **`build_amendment_refs.py`** — AS/BBl «AS 2016 1249»→ELI `eli/oc/2016/249` via `jolux:memorialPage` (Seite ≠ ELI-Seq!) | P/C | Zitat-Verifikation: neben `check:zitate`=`scripts/norm-zitate-pruefen.ts`; füttert B1 + Verweis-Chips (N2) | RP | ★★★★★ |
| B3 | **`build_fedlex_first_pages_index.py`** — Innenseiten-Pinpoint «BBl 2019 6697» → enthaltendes Werk via `max(first_page≤cited)`; nutzt Nicht-jolux-Prädikat `cogni:historicalId` (load-bearing, nicht-offensichtlich) | P/C | ergänzt B2 (Exakt-Seite) um Pinpoint-Auflösung; kleiner Index (~150 KB) | RP | ★★★★ |
| B4 | **`fedlex_materialien.py` FRBR-Resolver** — Work→Expression→Manifestation→Item → echte mehrsprachige PDF/XML-URLs; `discover_fga_botschaften` (typeDocument=23, ~2000 DE-Botschaften) | P | Discovery-Schicht für B1; Andock `W3·11` (Rechtsetzungs-Tracking, `fedlex.ts`/Drift) | RP | ★★★★ |
| B5 | **Statut-Fussnoten-Amendment-Regex** (`build_materialien_db.py:174-262`: `\b(AS\|BBl\|FF\|RO\|RU)\s+\d{4}\s+\d+` auf Artikel+Fussnote) | P | `scripts/normtext/fussnoten-extrahiere.ts` (Fussnoten-Sidecar existiert schon!) → Amendment-Refs daraus ableiten | RP | ★★★★ |
| B6 | **Parlamentsdebatten (AmtlBull)** `ingest_debate_transcripts` (:265-315) — **kein Live-Scraper im Repo**, AB-Texte müssen selbst beschafft werden | Ref | `W3·11`; nur wenn parlament.ch/curia-Beschaffung separat gebaut wird | – | ★★ |

### C. Rechtsprechung — Technik-Ports build-time (grösster ungenutzter Hebel)

| # | OCL-Asset | Strat. | Lexmetrik-Andockpunkt | Risiko | Wert |
|---|---|---|---|---|---|
| C1 | **Zitat-Regexes + `_INVALID_LAW_CODES`** (`reference_extraction.py:23-63`; ~150 FP-getunte Tokens; `STATUTE_PATTERN`→`ART.34.ABS.2.BV`; `BGE_PATTERN`; `DOCKET_PATTERNS`) | P | `scripts/normtext/entscheide-mapping.ts:28` (`statutesZuNormKeys` wirft heute Art./Abs. weg) | RP | ★★★★★ |
| C2 | **Pro-Artikel-Leitfälle** (decision→statute `decision_statutes`; NICHT statute→statute — «11.8M» = decision→statute) | C/P | **DER Produkt-Nordstern**: `norm-index.ts:20-23` `proNorm` heute nur erlass-eben; Art. behalten → `LAW/ART`-Index in `entscheide-schreiben.ts:76-96`; Panel an `gesetz-leser/parts.tsx:111/199` (`KontextPanel`) | RP·GC | ★★★★★ |
| C3 | **`extract_decision_structure.py`** — deterministischer Regeste/Sachverhalt/Erwägung/Dispositiv-Split, DE/FR/IT, `*_method`-Provenienz, per-Erwägung `ERW_PARA_RE` 1./1.1/2.3.1 + Monotonie-Validator | P | `scripts/normtext/adapter-entscheide.ts` (heute OCL `/structure`-keyed); `EntscheidSnapshot.abschnitte` `typen.ts:97` | RP | ★★★★ |
| C4 | **Instanzenzug** `extract_prior_instance` (trilingual «Beschwerde\|recours\|ricorso gegen…Docket») + `/appeal-chain` + `_find_appeal_chain` | P/R | fehlt ganz; nur `rubrum.vorinstanz` Freitext `typen.ts:55`; neues Feld `EntscheidSnapshot` + Render `EntscheidLeser.tsx:49-52`; eigene Gegenprüfung | RP | ★★★★ |
| C5 | **Zitationsgraph-UI** cites/cited-by (`/citations`, `find_citations`; 4-Pass-Resolver + Pin-Cite + `_citation_confidence`) | C/P | `zitierteEntscheide` gespeichert `typen.ts:110` aber nur Crawl-BFS, kein UI; inbound build-time invertieren in `entscheide-schreiben.ts`; Panel `EntscheidLeser.tsx:421` | RP·GC | ★★★★ |
| C6 | **ECLI-Minting** (`ecli.py`: `ECLI:CH:BGE:{jahr}:{vol}.{div}.{page}`; Court-Token-Tabellen fed+kantonal-Akronym) | P | fehlt ganz (grep leer); additiv `EntscheidSnapshot.ecli` `typen.ts:59-122` + reine Mint-Fn | – | ★★★★ |
| C7 | **`derive_from_text.py`** — autoritative Felder aus dem Entscheid-EIGENTEXT (Docket/Datum aus Rubrum), Jahr≥Docket-Jahr-Plausibilität, synthetische `YYYY-01-01` demuxen | P | Verifikations-Disziplin für `adapter-entscheide.ts:168-172` (Vorinstanz/Datum best-effort); passt zu Gegenprüfung | RP | ★★★★ |
| C8 | **`models.py` Verifikations-Bausteine** — `make_canonical_key` (Dedup: BGE/ATF/DTF-Präfix + Nicht-Alnum strippen); `parse_date` 7 CH-Formate + **1700–2100 Poison-Guard** | P | Dedup BGer↔BGE (§6.4 FAHRPLAN-RECHTSPRECHUNG); `adapter-entscheide.ts` id/Datum | RP | ★★★★ |
| C9 | **`branch_map.py`** — deterministischer Rechtszweig-Klassifikator (zivil/straf/öffentlich/SV; NULL statt Raten; Court+Docket-Serie) | P | `src/lib/rechtsprechung/` `legalArea`/`sachgebiet` (heute `backfill-legal-area.ts`) | – | ★★★ |

### D. Verifikations-Rails & QA-Technik (Design → Gegenprüfung/Gates)

| # | OCL-Asset | Strat. | Lexmetrik-Andockpunkt | Risiko | Wert |
|---|---|---|---|---|---|
| D1 | **4 deterministische Verifikations-Rails** (Statut-Auflösung · Verbatim-Zitat mit **Authority-Radius 250 Z. + 60-Z-Minimum** · Datums-Match · Fall-Existenz exact-only) + **«mechanical rewrite»** (kanonisierter `linked_text` verbatim ausliefern) | P/Ref | Skill »gegenpruefung« + `check:gegenpruefung`; `check:zitate` heute Engine-Zitate gegen Fedlex-Cache | RP | ★★★★ |
| D2 | **`quality/checks/` ~65 deterministische Checks** (Datum: `docket_year_plausibility`, `publication_before_decision`; Dedup: `court_docket_collisions`, `bge_egmr_count_range`; Text: `control_chars`, `excessive_whitespace`; Graph: `resolution_rate`, `top_cited_known_leader`-Plausibilitätsorakel) | P/Ref | erweitert `check:entscheide`=`scripts/normtext/check-entscheide.ts`, `check:invarianten`, `check:vollstaendigkeit` | – | ★★★★ |
| D3 | **Precision-Proxy-Idee** (Millionen Kanten billig via Datums-Sanity + Self-Cite-Rate + Confidence-Verteilung statt Handlabeling) | Ref | Verifikations-Idee für C2/C5-Kanten im Massstab | – | ★★★ |
| D4 | **`coverage_report.py` / `coverage_targets`** — Vollständigkeit = erwartete-Menge minus tatsächliche | Ref | `check:vollstaendigkeit`=`scripts/normtext/check-vollstaendigkeit.ts` | – | ★★ |
| D5 | **`docs/decision_rules.md` + `docs/db_contract.md`** — «kein stiller Rollback nach Emission»; atomarer Swap + `user_version`-Bump; Risiko-Änderung=Zweitpass | Ref | Disziplin-Vorbild für Gate/Deploy-Ritual (`deploy-check`); §9 | – | ★★ |
| D6 | **`publish_dag.py` Pipeline-Form** — ein kanonischer Index → enrich → **QC-Gate vor jeder Emission** → export | Ref | Vorbild `scripts/gate.sh`-Kettenform; nichts zu porten | – | ★ |

### E. Suche / Vokabular (handkuratierte Daten, kein LLM)

| # | OCL-Asset | Strat. | Lexmetrik-Andockpunkt | Risiko | Wert |
|---|---|---|---|---|---|
| E1 | **`LEGAL_QUERY_EXPANSIONS`** (~120 Einträge, DE/FR/IT-Synonym-Cluster + umgangssprachlich→Doktrin: «hundebiss»→Tierhalterhaftung; `mcp_server.py:779-906`) | C | als statisches JSON in `universalSuche`/`scripts/such-index-generieren.ts` (build-time Query-Expansion, deterministisch) | – | ★★★★ |
| E2 | **`LAW_SEARCH_EXPANSIONS`** (umgangssprachlich→Statut-Text-Wort: «vaterschaftsurlaub»→urlaub/geburt; `:920-1000+`) | C | dito; trifft Wörter, die real im Fedlex-Text stehen | – | ★★★★ |
| E3 | **`SCORING_CONFIG`** (Rerank-Gewichte als Konstanten: Docket-exact 6.0, RRF 32.0, BM25-Spalten; `:447-517`) | Ref | Start-Gewichtssatz für eine spätere gewichtete Suche | – | ★★ |

### F. Konsumierbare Daten / Endpunkte (Nicht-Load-Bearing, Anreicherung)

| # | OCL-Asset | Strat. | Lexmetrik-Andockpunkt | Risiko | Wert |
|---|---|---|---|---|---|
| F1 | **REST-API `mcp.opencaselaw.ch/api`** (No-Auth, CORS `*`; pure-DB-Kern; `/leading-cases?law_code=&article=`, `/citations/{id}`, `/appeal-chain/{id}`, `/lookup`, `/laws`) | C | schon genutzt: `adapter-entscheide.ts:26` (keyed only); auf Vercel aggressiv cachen; nur Nicht-Load-Bearing | – | ★★★ |
| F2 | **HF-Parquet `voilaj/swiss-caselaw`** (per-Court, 34-Feld, `cited_decisions`=JSON = Graph in Bulk; Statuten NICHT im Parquet) + SQLite-Delta+Merkle-Manifest | C | Bulk-Seed für Regulatoren/hist. Bund (Hybrid-Verdikt); `BUDGET_MB=35` heute nur Rechtsprechung | – | ★★★ |
| F3 | **`mcp_server.py` Route-Form** (`/lookup` deterministisch vs. `/decisions` FTS; pure-DB-vs-LLM-Split) | Ref | Vorbild, falls Lexmetrik je eine API exponiert | – | ★★ |

---

## Exklusionen — bewusst NICHT übernommen (mit Grund)

- **Sekundärliteratur/Kommentar** — `onlinekommentar.py` (CC-BY), `openlegalcommentary.py` (CC-BY-SA), `scrapers/scholarship/`,
  `build_legal_scholarship.py`, `build_ok_commentaries_db.py`, `enrich_abstracts_openalex.py`,
  `scholarship_citation_extractor.py`, sowie **OCLs LLM-Digests** (`build_materialien_db.py` Layer 2, `legislative_intent`
  etc.). **Grund:** Art. 5 URG-Linie + korpus-werkstatt «keine Fremd-/Sekundärliteratur». OCLs eigene Lizenz-Tabelle
  (`scholarship/sources.py:722`) bestätigt sogar, dass CC-BY-ND/NC-ND Paraphrase/LLM-Summaries verbieten und Uni-IR-Inhalte
  in-copyright sind — starkes Argument, auf Primärquellen zu bleiben. *Nur als Exklusions-Begründung zitieren.*
- **SAV-Kompilate** — `build_anwaltsrecht_tags.py`, `sav_kantone.py`, `sav_international.py`. **Grund:** über sav-fsa.ch
  (Berufsverband, **kein** amtliches Gesetzblatt) bezogene redaktionelle Zusammenstellungen → näher an Sekundärmaterial.
- **Word-Add-in** (`tools/word-addin/`) — **Grund:** Office-Fläche out-of-scope für die Web-App; die «deterministische
  Zitat-Audit schreibt Word-Kommentare»-UX ist nur Referenz.
- **58/67-Scraper-Flotte** — **Grund:** FAHRPLAN-Verdikt HYBRID: entscheidsuche.ch deckt ~24/26 Kt. bei Near-Parity
  (nutzen wir schon für Live-Suche), Regulatoren+hist.Bund via CC0-Parquet konsumieren, nur BStGer/BVGer/HUDOC billig
  portieren. Voll-Port ≈ 3–5 Eng-Monate + 0,5–1 FTE Dauerbetrieb (Incapsula-Arms-Race, Tunnel) → Non-Starter.
- **Massen-Entscheid-Korpus (jetzt)** — **Grund:** aufgeschoben (FAHRPLAN); pro-Artikel-Leitfälle sind der Hebel, nicht Volumen.
- **Laufzeit-LLM-Schichten** — Haiku-Query-Expansion/Rerank (`mcp_server.py:520,1440`), `/mock-decision`, `/exam-question`,
  `/verify-claim`, `llm_spot_check.regeste_vs_text`. **Grund:** nicht deterministisch/build-time → verletzt Produktpfad-Doktrin.
- **Merkle/OpenTimestamps** (`integrity.py`, RFC-6962 + Bitcoin-Anchor) — **Grund:** over-engineered für Lexmetriks Massstab.
  *Idee (build-Provenienz per content-hash) ist bereits durch Golden-`sha256`-Maps erfüllt.* Nur Referenz.
- **Studien-/Curriculum-/Socratic-Schicht** (`study/**`) — **Grund:** Exam-Tutor-Content ausserhalb Rechner/Norm-Tarif-Scope;
  die Q&A sind **LLM-generiert** (`enrich_curriculum.py`, Sonnet). **ABER:** die kuratierte JSON-Map
  *Rechtsgebiet→Modul→Statut-Liste→Leitentscheid→Schlüssel-Erwägungen* (14 Gebiete/45 Module/100 Fälle, `study/curriculum/*.json`)
  ist ein wertvoller **Seed** für C2 (Norm↔Leitentscheid) — als *reine Referenz/Seed* nutzbar, nicht als Content übernehmen.
- **Billing/Stripe, `web_api/`-Provider-Bridges, `web_ui/`, `fts5_server.py`-Server** — out-of-scope (Lexmetrik hat eigenes
  Frontend/Design-Skill). `fts5_server.py` nur als minimale Referenz; Schema-Wahl (A4) ist der übernehmbare Teil.
- **Statut→Statut-Kreuzverweis-Graph** — **existiert im Repo NICHT** (die «11.8M» sind decision→statute). Falls je nötig:
  selbst aus Fedlex-Artikel-XML (`<ref>`/Fussnoten) extrahieren, OCL hilft hier nicht.
- **Kt↔Bund-SR-Ausrichtung / Cross-Kanton-Taxonomie** — im Repo NICHT vorhanden (`build_cantonal_laws_db.py` speichert
  Kanton-SR als opaken String). Keine Erwartung.
- **`build_recent_overlay.py`** (24h-Publish-Lag-Hack) — nur relevant bei Live-Polling, das wir nicht tun.

---

## Sequenzierter Ausführungsplan (Order = Wert × Sicherheit; «erst das Sichere»)

**Mapping zur ROADMAP:** Es gibt **keine** OCL-`#1–#10`-Taskliste; der OCL-Master ist `FAHRPLAN-OPENCASELAW-QUELLEN.md`
(**Plan-Hygiene-Befund: aus ROADMAP.md nicht verlinkt → `check:plan`/`QS-PH` würde rot; W0 unten schliesst das**). Die
Arbeitspakete hängen an bestehenden ROADMAP-Schritten: **W2·5b** (Reader/Fedlex-Extraktor), **W2·6** (Konsultieren:
Rechtsprechungs-Übersicht + Mehrsprach-Vergleich), **W3·11** (Rechtsetzungs-/Materialien-Tracking), **W3·12** (kantonaler
Breitenimport, 26×). Jedes Paket **isoliert auf eigenem Branch/Worktree**, nicht auf `feat/normtext-phase1-fundament`.

Nummerierung W0–W13. Reihenfolge ist die empfohlene Abarbeitung.

---

## AUSFÜHRUNGS-STAND (2.7.2026, Zweig `feat/ocl-abbau`, 7 Commits, kein Push)

**Fertig + committet:** W0 ECLI (Mint + Befüllung aller 342 Snapshots, gegengeprüft) · W2 Zitat-Extraktion (+ Bug-Fixe hist. BGE/Cost.) · **W3 Pro-Artikel-Leitfälle** (gegengeprüft; Gegenprüfung fing StG-Kollision → OCL-orientiert gefixt, `_SR_NUMBER_MAP`-aligned) · #12 StG auch erlass-eben proNorm · W9 OCL-Such-Vokabular · Verweis-Audit + R1 (ECLI-Befüllung).

**R2 (FR/IT-Gesetzescode-Aliase) — WIDERLEGT + REVERTIERT:** Gegenprüfung fand 4/26 Falsch-Positive durch Abkürzungs-Kollisionen: **CO₂-Gesetz→OR** (BGE 150 II 390, ₂-Trennung) + **ital. CP/I «600quater»→StGB** (BGE 152 I 105, Rechtsvergleich, Ausland-Marker schon in OCL-Rohdaten weg). §1 → nicht geshippt, revertiert. **Korrekter Nachbau = Aufgabe #16** mit 3 Wächtern: CO₂-Kontext-Guard · Ausland-Marker-Guard · **Artikel-Plausibilitäts-Tor** (Artikel muss im echten Artikelraum des Ziel-Erlasses existieren, aus `public/normtext/bund/*.json` — fängt 600quater UND das vorbestehende STHG/157-Phantom).

**HF-Datensatz `voilaj/swiss-caselaw` untersucht (Fable, ergebnisoffen):** =OCL-Output (Zirkelschluss: Match=Port-Treue, NICHT Korrektheit). 995k Zeilen/7,5 GB, **Kronjuwelen = Graph-Dateien ~90 MB** (8,7M Zitat-Kanten, 11,9M Norm→Entscheid, structure). Null-lastig (~15/36 Felder real). POC: unsere `zitat-extraktion.ts` = byte-genau OCLs Graph (Treue). **USABLE:** Port-Regressions-Oracle (bester Nutzen, „Treue-Tor" nicht „Korrektheit", = QS-GP d) · structure-Oracle für abschnitte · norm-index-Eval. **CONDITIONAL:** FR/IT-Normalisierung (bestätigt R2-Wert: 45% FR-Entscheide blind — via #16-Wächter) · Regesten (nur amtl. BGE) · additive Felder (publication_date/outcome/text_length). **DAVID-ENTSCHEID (grösser, nicht in-branch):** Zitations-Graph-Feature (Leitfall-Gewichte aus 8,7M statt 342, eigener ROADMAP-Schritt) · Parquet als Volltext-Bezugsquelle · Breiten-Korpus 1M (kollidiert mit static-public/*.json).

**Offen im Plan:** #16 (R2-neu) · W4 Materialien/Botschaft · W1 Fedlex-SPARQL · W5–W7 · W10–W13. **Wartet auf Davids Priorisierung** (Frage gestellt 2.7.).

---

### W0 · Plan-Hygiene + Interop-Grundstein (SICHER, ZUERST)
- **Ziel:** FAHRPLAN + diesen Plan aus ROADMAP.md verlinken (`QS-PH`/`check:plan` grün) und die zwei billigsten,
  rein-additiven Assets landen: **ECLI (C6)** und **Zweit-Klassifikator branch_map (C9)**.
- **Dateien:** `ROADMAP.md` (Verweis in W2·6/W3·11 auf `FAHRPLAN-OPENCASELAW-QUELLEN.md` + `PLAN-OCL-ABBAU.md`);
  neu `src/lib/rechtsprechung/ecli.ts` (reine Mint-Fn aus `ecli.py`); `EntscheidSnapshot.ecli?` `typen.ts:59-122`
  (optional, additiv); `entscheide-schreiben.ts` befüllt beim Schreiben.
- **Extract-how:** `ecli.py` Court-Token-Tabellen + BGE-Sonderform 1:1 nach TS; `branch_map.py`-Regeln als Referenz.
- **Integrate-how:** ECLI additiv (kein bestehendes Feld ändert sich); im Reader als Zeile.
- **Verifikation:** `check:plan` + `check:entscheide` (neue Invariante: ECLI-Form-Regex). **Golden-Churn:** ja
  (ECLI-Feld im Snapshot ⇒ `sha256EntscheidBloecke` unberührt, aber Snapshot-JSON ändert sich → `check:entscheide` + Manifest).
  Da rein additiv + deterministisch mintbar: **Gegenprüfung leicht** (Mint-Fn gegen ~10 amtliche BGE/BGer-Beispiele).
- **Risiko/Gate:** `adapter-entscheide`/`entscheide-schreiben` sind Risiko-Pfad ⇒ **`check:gegenpruefung` + Gegenprüfung** (Mint-Korrektheit).
- **Deps:** keine.

### W1 · Fedlex-SPARQL-Eigenheiten in den Bund-Extraktor (A2 + A3) — läuft am aktiven Branch mit
- **Ziel:** Die teure UNION-Falle + POST/Batch + AKN-Repairs in den bestehenden Fedlex-Pfad einarbeiten (verhindert stillen
  Verlust von ~700 totalrevidierten Erlassen inkl. revDSG; härtet Split-Digit/`eId`-Fallback).
- **Dateien:** `scripts/fedlex-versionen-pruefen.ts` (nutzt SPARQL schon — Query A mit `historicalLegalId` UNION
  `classifiedByTaxonomyEntry/skos:notation` ergänzen); `scripts/fedlex-pins.ts` / `fedlex-cache.sh` (Discovery statt
  Handpflege der `EINTRAEGE`-Liste, mittelfristig); `scripts/normtext/extrahiere-fedlex.ts:118-124` (AKN-Repairs A3:
  Split-Digit #32 via strikter `eId`-Präfix-Vertrauen, leeres `<num>`→`eId`, bis/ter, NS-Doppel-`find`).
- **Extract-how:** SPARQL POST form-encoded (`Accept: application/sparql-results+json`), VALUES-Batch ~40 URIs;
  8-stelliges Datum aus Konsolidierungs-URI vertrauen (nicht `MAX(?date)`-String-Sort).
- **Integrate-how:** `LexWorkErgebnis`/Snapshot-Signaturen unverändert; nur Discovery/Repair robuster.
- **Verifikation:** `check:fedlex-versionen`, `check:normtext`, `golden/normtext-snapshot.json` byte-gleich (Repairs dürfen
  bestehende Bund-Snapshots NUR dort ändern, wo real ein Nummern-Bug war → jede Änderung erklärbar).
- **Risiko/Gate:** **RP** ⇒ `check:gegenpruefung` + **Gegenprüfung Pflicht** (adversarial: geänderte Artikelnummern gegen
  Fedlex-HTML widerlegen; DE/FR/IT-Alignment prüfen — Join nur über `article_num`).
- **Deps:** koordinieren mit `W2·5b`-Worktree (Kollision `extrahiere-fedlex.ts`); nie parallel zu Batch A dort.

### W2 · Zitat-Extraktion nach TS: Artikel behalten (C1 + C2-Vorbereitung)
- **Ziel:** Die FP-getunte Zitat-Logik portieren und **den Artikel-Token bewahren**, statt ihn wie heute zu verwerfen —
  Grundstein für pro-Artikel-Leitfälle.
- **Dateien:** neu `src/lib/rechtsprechung/zitat-extraktion.ts` (Port `reference_extraction.py`: `STATUTE_PATTERN`,
  `_INVALID_LAW_CODES` ~150 Tokens, `BGE_PATTERN`, `DOCKET_PATTERNS`, `(?![a-z])`-Lookahead ok in JS);
  `scripts/normtext/entscheide-mapping.ts:28` (`statutesZuNormKeys` so ändern, dass `LAW/ART`-Schlüssel entsteht statt nur `LAW`).
- **Extract-how:** Regexe 1:1; `_INVALID_LAW_CODES` verbatim (das teuerste Stück — jahrelanges FP-Tuning); Filter «Code mit
  0 Grossbuchstaben verwerfen; 1 Gross + len>3 verwerfen».
- **Integrate-how:** Normalisierte Form `ART.34.ABS.2.BV`; Mapping abbrev→register-key via `normKeyFuerAbk`.
- **Verifikation:** neuer Unit-Test (Golden-Fixtures aus echten BGE-Regesten); `check:entscheide`.
- **Risiko/Gate:** **RP** ⇒ **Gegenprüfung** (Stichprobe: extrahierte `Art.X LAW` gegen Entscheid-Volltext + Norm-DB
  auflösen; FP/FN messen).
- **Deps:** W0 (Interop-IDs hilfreich, nicht zwingend).

### W3 · Pro-Artikel-Leitfälle (C2) — **DER Produkt-Nordstern**
- **Ziel:** «Rechtsprechung zu Art. X»-Sektion pro Artikel im Gesetzleser (bisher nur erlass-eben; `FAHRPLAN-RECHTSPRECHUNG.md:412`
  `rechtsprechungFuer(idx,key,art)` nie gebaut).
- **Dateien:** `src/lib/rechtsprechung/norm-index.ts:20-23` (`proNorm` um `LAW/ART`-Dimension erweitern);
  `scripts/normtext/entscheide-schreiben.ts:76-96` (Index-Build mit Artikel-Bucket; heute nur `gerichtstyp==='bundesgericht'`);
  Panel-Andock `src/pages/gesetz-leser/parts.tsx:111/199` (`<article id="art-…">` → `KontextPanel`).
- **Extract-how:** aus W2-Kanten `decision_statutes`-Äquivalent; **topisch gescoptes in-degree-Ranking** (nur Zitate von
  Entscheiden, die denselben Artikel anwenden — vermeidet Prozess-Megafälle; **nicht** PageRank).
- **Integrate-how:** build-time JSON, deterministisch; sichtbarer amtlicher Link + «maschinell»-Marker; kein Laufzeit-OCL.
- **Verifikation:** `check:entscheide` + **NEU `BUDGET_MB` für `norm-index.json`/`public/normtext/`** (heute existiert NUR
  `BUDGET_MB=35` für `public/rechtsprechung/` in `check-entscheide.ts:25` — Fan-out-Grösse ist unbekannt/unenforced ⇒ neues Budget-Tor).
- **Risiko/Gate:** **RP·GC** ⇒ **Gegenprüfung Pflicht** (Stichprobe Artikel: gelistete Leitfälle wenden den Artikel
  wirklich an? Ranking plausibel? `top_cited_known_leader`-Orakel aus D2 als Plausibilitäts-Check).
- **Deps:** W2 (Artikel-Token). **Höchster Wert** — nach W0/W1 (sicher) das erste grosse Feature.

### W4 · Materialien: OCL-Botschaft-Adapter per Artikel (B1 + B2 + B5) — amtlich, KEIN LLM
- **Ziel:** Die hand-kuratierte Materialien-Schicht durch **verbatim, per-Artikel-verankerte** Botschaft-Auszüge aus Fedlex
  ergänzen (nicht ersetzen) — «Zu Art. N»-Anker.
- **Dateien:** neu `scripts/materialien/adapter-botschaft.ts` (Port `build_botschaft_corpus.py`-Kern: AKN-`<article eId>`
  bevorzugt, `ARTICLE_HEADER_RE` DE/FR/IT, `article_botschaft_links(sr,article,relation)`); `src/lib/materialien/typen.ts`
  (neuer Status/Feld für per-Artikel-Verbatim); Gate `scripts/materialien/check-materialien.ts`; Fussnoten-Amendment via
  `scripts/normtext/fussnoten-extrahiere.ts` (B5-Regex — Sidecar existiert schon); B2/B3 Resolver neu
  `scripts/materialien/amendment-ref-resolver.ts` (AS/BBl→ELI, Innenseiten-Pinpoint via `cogni:historicalId`).
- **Extract-how:** deterministisch (AKN/pdfplumber), **kein LLM** — OCLs Layer-2-LLM-Digests bewusst weglassen.
- **Integrate-how:** Andock pro `<article>` in `parts.tsx:199` (neben C2-Leitfällen); sichtbarer Fedlex-Link + Stand.
- **Verifikation:** `check:materialien` (URL-safe, http(s), ISO-Stand, `normKeys ⊆ ERLASS_REGISTER`, Manifest==Frisch-Build);
  eingebauter Assert «AS 2016 1249 → eli/oc/2016/249».
- **Risiko/Gate:** **RP** ⇒ **Gegenprüfung** (Verbatim-Auszug gegen Fedlex-Botschaft-PDF; Artikel-Anker korrekt?).
- **Deps:** W1 (SPARQL-Technik), W3 (gleicher `parts.tsx`-Andock — nacheinander, nicht parallel wegen §12-Kollision).

### W5 · Entscheid-Struktur-Splitter härten (C3 + C7 + C8) — Verifikation im Bestand
- **Ziel:** Regeste/Sachverhalt/Erwägung/Dispositiv-Split deterministisch absichern (mit gespeicherter Methoden-Provenienz),
  Felder aus Eigentext ableiten, Dedup härten.
- **Dateien:** `scripts/normtext/adapter-entscheide.ts:168-172` (C7: Docket/Datum aus Rubrum, Jahr≥Docket-Jahr,
  `YYYY-01-01`-Demux; C8: `make_canonical_key`-Dedup + `parse_date` 1700–2100-Guard); optional Marker-Tabellen aus
  `extract_decision_structure.py` als Fallback, falls OCL `/structure` mal fehlt.
- **Extract-how:** Marker-Tabellen `DISPOSITIV/ERWAEGUNGEN/SACHVERHALT_PATTERNS` DE/FR/IT; `ERW_PARA_RE` + Monotonie-Validator.
- **Verifikation:** `check:entscheide` (U+2026-Kappungs-Schutz existiert schon `:119`); Datums-Plausibilität als neue Invariante.
- **Risiko/Gate:** **RP** ⇒ **Gegenprüfung** (Struktur-Split gegen amtlichen Entscheid).
- **Deps:** unabhängig; kann parallel zu W4 (andere Dateien).

### W6 · Instanzenzug (C4) — neues Feld
- **Ziel:** Strukturierten Rechtsmittelzug (Entscheid→Vorinstanz-Entscheid) statt nur `rubrum.vorinstanz`-Freitext.
- **Dateien:** `EntscheidSnapshot` neues Feld `typen.ts:59-122`; Port `extract_prior_instance` (trilingual) ODER OCL
  `/appeal-chain` konsumieren (build-time, Ergebnis eingefroren); Render `EntscheidLeser.tsx:49-52`.
- **Verifikation:** `check:entscheide` + eigene Struktur-Invariante.
- **Risiko/Gate:** **RP·GC** (neues Snapshot-Feld) ⇒ **Gegenprüfung Pflicht** (Zug gegen amtliche Rubrums-Kette).
- **Deps:** W0 (ECLI als Ziel-Key sauberer).

### W7 · Zitationsgraph-UI cites/cited-by (C5)
- **Ziel:** «zitiert / wird zitiert von»-Panel im Entscheid-Reader.
- **Dateien:** inbound-Kanten build-time invertieren in `entscheide-schreiben.ts`; Panel `EntscheidLeser.tsx:421`
  (`KontextPanel typ="entscheid"`); interne `ERFASST`-Keys vs. externe bger.ch-Links unterscheiden.
- **Extract-how:** `zitierteEntscheide` (schon gespeichert `typen.ts:110`) invertieren; optional `/citations/{id}` als Diff-Orakel.
- **Verifikation:** `check:entscheide` (refs ⊆ Manifest existiert schon `:141-142`).
- **Risiko/Gate:** **RP·GC** ⇒ **Gegenprüfung** (Kanten-Stichprobe gegen Entscheid-Volltext; Confidence-Schwelle).
- **Deps:** W5 (saubere Struktur/IDs).

### W8 · Verifikations-Rails formalisieren (D1 + D2) — Querschnitt QS-GP
- **Ziel:** OCLs 4 deterministische Rails + «mechanical rewrite» + relevante `quality/checks` als wiederverwendbare
  Gegenprüfungs-/Gate-Bausteine.
- **Dateien:** Skill/Doku `gegenpruefung` + `scripts/gegenpruefung/kern.ts`; `check:zitate`=`scripts/norm-zitate-pruefen.ts`
  (Authority-Radius 250 Z. + 60-Z-Minimum als FP-Schutz übernehmen); neue Checks in `check:entscheide`/`check:invarianten`
  (`docket_year_plausibility`, `publication_before_decision`, `court_docket_collisions`, `top_cited_known_leader`-Orakel).
- **Extract-how:** reine deterministische Logik; **«mechanical rewrite»** = kanonisierten `linked_text` verbatim ausliefern
  (= unser «quittiert»), verhindert Re-Paraphrasieren das die Verifikation aushebelt.
- **Verifikation:** die Tore selbst sind reine Prüflogik ⇒ Golden byte-gleich (§6); Trailer `Gegenpruefung: n/a — reine Prüflogik`.
- **Risiko/Gate:** Tor-Logik selbst risikoarm; wirkt aber auf alle RP-Pakete.
- **Deps:** parallelisierbar; stützt W1–W7.

### W9 · Handkuratiertes Such-Vokabular konsumieren (E1 + E2)
- **Ziel:** DE/FR/IT-Synonym- + umgangssprachlich→Statut-Text-Lexikon als statische build-time-Query-Expansion (kein LLM).
- **Dateien:** neu `src/data/such-vokabular.json` (aus `LEGAL_QUERY_EXPANSIONS` + `LAW_SEARCH_EXPANSIONS`);
  `scripts/such-index-generieren.ts` / `universalSuche` (Expansion vor FTS); optional A4-Diakritik-Normalisierung.
- **Extract-how:** Python-Dict-Literale → JSON; FTS-normalisiert (ü→u).
- **Verifikation:** `check:suchindex` (`scripts/such-index-generieren.ts -- --check`).
- **Risiko/Gate:** risikoarm (Suche ist Nicht-Load-Bearing; keine Rechtsaussage) ⇒ kein Gegenprüfungs-Zwang.
- **Deps:** unabhängig; billig, hoher UX-Wert.

### W10 · Bund-Materialien-/Rechtsetzungs-Tracking (B4 + B6) → ROADMAP W3·11
- **Ziel:** «Was kommt» + Materialien-Discovery über Fedlex-FRBR + Botschaften; AB-Debatten nur falls Beschaffung separat gebaut.
- **Dateien:** `src/lib/normtext/*` Drift-System / `fedlex.ts`-Analog; `fedlex_materialien.py`-FRBR-Resolver portieren.
- **Verifikation:** `check:fedlex-versionen`, `check:materialien`.
- **Risiko/Gate:** **RP** ⇒ Gegenprüfung bei publizierten Werten.
- **Deps:** W1, W4.

### W11 · LexWork `json_content`-Upgrade — Schema-Trade-off (A1 + A6) → ROADMAP W3·12 / W2·5b
- **Ziel:** Der reichere `json_content`-Baum statt `xhtml_tol` (Fussnoten getrennt, NBSP/Tausender-Apostroph/En-Dash erhalten,
  stabile `uid`=eId, Versionierung/Historie). **Davids Schema-Entscheid nötig** (a/b/c):
  - **(a) in-place upgraden** — reicher, aber **Golden-Churn auf ALLEN 1'232 Kantons-Snapshots + Pflicht-`gegenpruefung`**.
  - **(b) `json_content` nur für NEUE Kantone** — Schema-Divergenz.
  - **(c) `json_content` nur für saubereres Parsing, in dasselbe `bloecke` mappen** — minimaler Churn, moderater Fidelity-Gewinn
    (Fussnoten/NBSP wie heute verwerfen).
- **Dateien:** `scripts/normtext/adapter-lexwork.ts:587-656` (Endpunkt `…/texts_of_law/{id}`→`…/show_as_json`, Feld
  `xhtml_tol`→`json_content`; Signatur `LexWorkErgebnis:53-67` unverändert bei (c)); `src/lib/normtext/typen.ts:3-87`
  (bei (a) neues `fussnoten`-Feld in `bloecke`); `check:confidence`-Kalibrierung für die sauberere Quelle;
  `version_uid`/`version_dates_str` im json_content-Pfad bestätigen (`check-drift.ts:191`).
- **Extract-how:** typisierter Baum `text_of_law.selected_version.json_content.document.content`
  (title/article/paragraph/enumeration); eId `uid`→flacher `artikel`-Token/`items[].marke`+`tiefe` kollisionsfrei;
  `enumeration_item` an CSS-Klasse erkennen, **nicht** als Datentabelle behandeln (POC-Caveat 1).
- **Integrate-how:** Downstream (`erzeugeKantonsSnapshots`) unberührt; echten DOM-Parser (cheerio/linkedom) statt Regex.
- **Verifikation:** `normtext:struktur-kanton` → `check:confidence` (0.95) → `check:vollstaendigkeit` →
  `check:struktur-konsistenz` → `normtext:register` → `gate`; **Review-Quote gegen jetzige LexFind/`xhtml_tol`-Extraktion messen**.
- **Risiko/Gate:** **RP·GC (bei (a) massiv)** ⇒ **Gegenprüfung Pflicht**; POC 1 Kanton end-to-end zuerst (Fidelity gegen amtliches
  Portal), dann Ausrollen. Isoliert im eigenen Worktree.
- **Deps:** eigenständig; **Davids Entscheid a/b/c ist der Blocker** — Empfehlung Planner: **(c) zuerst** (sicher, Churn
  gering), (a) später als bewusste QS-GP-Kampagne mit vollem Golden-Rebuild.

### W12 · Bulk-Konsum für Hybrid-Randfälle (F2) — optional, nachgelagert
- **Ziel:** Regulatoren (~13) + hist. Bund/BGE via CC0-Parquet konsumieren (schlechtester Port-ROI, off-entscheidsuche).
- **Dateien:** `adapter-entscheide.ts` (zweiter Consume-Pfad neben OCL-REST/entscheidsuche); uniformes Schema.
- **Verifikation:** `check:entscheide` + `BUDGET_MB`.
- **Risiko/Gate:** **RP** ⇒ Gegenprüfung; nur bei freiem 26×-Slot (Massenkorpus = 26×-Asset).
- **Deps:** nach W3/W5/W7; nur wenn Korpus-Breite priorisiert wird.

### W13 · A4/A5-Suchindex-Härtung + Kanton-Volltext-Index (nachziehen)
- **Ziel:** Diakritik-insensitive Bund+Kanton+Rechtsprechung-Suche (heute nur Bund `public/such-index/artikel-bund.json`).
- **Dateien:** `scripts/such-index-generieren.ts` (Kanton aus `public/normtext/kanton/*` + Rechtsprechung nachziehen;
  `remove_diacritics`-Äquivalent).
- **Verifikation:** `check:suchindex`.
- **Risiko/Gate:** risikoarm (Nicht-Load-Bearing).
- **Deps:** W9 (Vokabular), W11 (Kanton-Snapshots).

---

## Risiko-Pfad-Übersicht (Gate + Gegenprüfung obligatorisch)

| Paket | Gate | Gegenprüfung Pflicht? | Golden-Churn |
|---|---|---|---|
| W0 (ECLI) | `check:gegenpruefung`, `check:entscheide`, `check:plan` | Ja (Mint-Korrektheit) | ja (additiv) |
| W1 (Fedlex-SPARQL/AKN) | `check:gegenpruefung`, `check:fedlex-versionen`, `check:normtext` | **Ja** (Artikelnummern, DE/FR/IT-Align) | nur an echten Bugstellen |
| W2 (Zitat-TS) | `check:gegenpruefung`, `check:entscheide` | Ja (FP/FN-Stichprobe) | nein (Logik/Index) |
| W3 (Pro-Artikel-Leitfälle) | `check:gegenpruefung`, `check:entscheide`, **neues BUDGET-Tor** | **Ja** (Anwendbarkeit+Ranking) | ja |
| W4 (Botschaft-Adapter) | `check:gegenpruefung`, `check:materialien` | **Ja** (Verbatim+Anker) | ja (Materialien) |
| W5 (Struktur/Dedup) | `check:gegenpruefung`, `check:entscheide` | Ja (Split+Datum) | evtl. |
| W6 (Instanzenzug) | `check:gegenpruefung`, `check:entscheide` | **Ja** (Zug-Kette) | ja (neues Feld) |
| W7 (Zitationsgraph) | `check:gegenpruefung`, `check:entscheide` | Ja (Kanten-Stichprobe) | ja |
| W10 (Rechtsetzungs-Tracking) | `check:gegenpruefung`, `check:fedlex-versionen` | Ja (publizierte Werte) | evtl. |
| W11 (LexWork json_content) | `check:gegenpruefung`, `check:confidence`, `check:struktur-konsistenz` | **Ja** (Fidelity 1 Kanton POC → Ausrollen) | **massiv bei (a)** |
| W12 (Bulk-Parquet) | `check:gegenpruefung`, `check:entscheide` | Ja | ja |
| W8/W9/W13 | reine Prüf-/Suchlogik | nein (Nicht-Load-Bearing) | byte-gleich |

---

## Empfehlung: Womit Opus startet (Top-3)

1. **W0 — Plan-Hygiene + ECLI + branch_map.** Sicher, additiv, deterministisch mintbar, macht `check:plan`/`QS-PH` grün und
   legt den Interop-Key für alle Rechtsprechungs-Pakete. Billigster Wert.
2. **W1 — Fedlex-SPARQL-Eigenheiten in den Bund-Extraktor.** Läuft am aktiven `feat/normtext-phase1-fundament`-Thema mit,
   schliesst die **teure UNION-Falle** (~700 Erlasse inkl. revDSG) und härtet die AKN-Nummern-Repairs — bevor mehr Snapshots
   generiert werden. Risiko-Pfad, aber eng umrissen + gut gegenprüfbar.
3. **W2 → W3 — Zitat-Artikel behalten → Pro-Artikel-Leitfälle.** Der **Produkt-Nordstern** (Norm↔Entscheid-Burggraben);
   W2 (reine Logik/Index, sicher) ist die Vorbedingung, W3 liefert das erste sichtbare grosse Feature. Vor W3 das neue
   `BUDGET_MB`-Tor für `norm-index.json` ziehen (Fan-out-Grösse heute unenforced).

*Danach:* W4 (Botschaft, amtlich, hoher Materialien-Wert) und W8 (Rails formalisieren) parallelisierbar; W11 (LexWork-Upgrade)
erst nach **Davids Schema-Entscheid a/b/c** — Planner-Empfehlung (c) zuerst.
