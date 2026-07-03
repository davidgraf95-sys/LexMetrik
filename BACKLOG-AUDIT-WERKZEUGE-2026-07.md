# BACKLOG — Werkzeuge & Instrumente (Audits 2.–3.7.2026)

> Konsolidierte, umsetzbare Funde aus zwei ultracode/Fable-Audits. **Kein `FAHRPLAN-`** (bewusst, damit QS-PH nicht triggert). Volltexte der Reports: Session-Scratchpad `audit-sprachen.md` / `audit-instrumente.md`. **Leitplanken:** Laufzeit + Byte-Paritäts-Serialisierung bleiben TS-fix; Offline-/Tooling frei; Solo-Kosten real; „richtiges Werkzeug vor neuer Sprache".

## OFFENER DAVID-AUFTRAG (nach diesem Block)
- [ ] **Gesamten Bauplan nochmals überarbeiten** (David 3.7.2026) — die Funde unten in ROADMAP/FAHRPLÄNE einarbeiten; via Fable planen, Opus umsetzen. **→ in Arbeit: dieser Bauplan-Einbau (Fable-Spec, Opus-Ausführung, 3.7.2026); abhaken nach Abschluss aller Commits (§A der Umbau-Spec).**

---

## Audit 2 — Instrumente/Dienste rund ums Coden

**JETZT (Code-seitig, dieser Branch `feat/betriebs-sofortgewinne`):**
- [x] **A2 · Normen-Monitor-Alarm** — bei Rot GitHub-Issue anlegen/aktualisieren + `check:normtext-netz` + `check:pdf-netz` mitlaufen (normen-monitor.yml). *(Kernfund: 15.6./29.6. real rot, unbemerkt.)* **(nachgetragen 3.7.2026: gemergt `c6f030f9`/`075574bb`, PR #83.)**
- [x] **A6 · CI-Playwright-Browser-Cache** (ci.yml) — Prüfläufe Minuten schneller. **(nachgetragen 3.7.2026: gemergt `c6f030f9`/`075574bb`, PR #83.)**
- [x] **A4 · Kontaktformular aktivieren** — Empfänger-Mail ist „leer" → stumm. **Braucht Davids Entscheid:** welche Adresse + möglichst via Env-Var (Personen-Mail nicht ins öffentliche Repo hardcoden). **✅ gemergt (`075574bb`, Env-Var-Empfänger).**
- [x] **A5 · „Fehler melden"-Link** auf der Absturz-Seite (`src/components/ErrorBoundary.tsx`) — vorausgefüllte Mail; UI → golden/Gate-sorgfältig, doppelt prüfen. **✅ gemergt (`075574bb`).**

**JETZT (David-Klicks, keine Code-Arbeit):**
- [ ] **A1 · Dependabot einschalten** + `npm audit fix` für den einen mittelschweren `dompurify`-Befund (indirekt über jspdf). → verortet: Freigabe-Paket T0b Punkt (viii), `FAHRPLAN-GESAMTAUFBAU.md` Phase 0.
- [x] **A3 · Vercel-Deploy-Gate** — **gelöst per Regel-Anpassung** (CLAUDE.md §9 «Merge = Deploy-Entscheid», David 3.7.2026 «Weg 1») — kein Vercel-Setting nötig. (Ursprungsbefund: Auto-Deploy widersprach §9.)

**SPÄTER:** Sentry (erst bei Traffic; A5 reicht jetzt) · CodeQL (jetzt v.a. Fehlalarme) · `npm audit` als Prüf-**Meldung** (nie Stopper) · Claude-Code-PR-Action (bewusster Entscheid — schickt jede Änderung an Anthropic).

**UNNÖTIG/Overkill:** Datadog/Grafana/PagerDuty · Renovate · Neon · Meilisearch · Vercel-Blob · Cloudflare-Zusatz-CDN · CodeRabbit/Qodo · **KI-Testgenerierung (gefährlich: friert Rechenfehler ein)** · TypeDoc/Mintlify · gitleaks (schon an) · LaunchDarkly · Statusseite · DB-Backup-Dienste · externe Cron.

---

## Audit 1 — Sprachen/Werkzeuge IM Code (Quintessenz: kein Sprachwechsel; alles in TS holbar)

**ADOPT (Null-Tarif-Paket, klarer Gewinn):**
- [ ] **`he`** statt handgepflegter HTML-Entity-Tabelle (`scripts/normtext/html-entities.ts`) — 2231 vs. ~90 Entities; `&ge;`/`&le;` haben real Tarif-Schwellen verfälscht. → verortet: ROADMAP W2·5b (N3; golden-Update-Verfahren dort)
- [ ] **`fast-check`** (Property-Tests) für die Staffel-Engines (`src/tests/tarifInvarianten.test.ts`) — fängt Bandgrenzen-Off-by-one; Dev-Dependency, seed-deterministisch (§2). → LERNPHASE-AB
- [ ] **Nebenläufigkeit** (`p-limit`, Concurrency 4–8) in den Fetch-Schleifen (`scripts/normtext-snapshot.ts`, `check-drift.ts --netz`) — I/O-bound, Faktor ~Concurrency; Merge bleibt `sort()` (deterministisch). → FAHRPLAN-DATENHALTUNG §6
- [ ] **Gate-Kette parallelisieren** (`package.json check` via `Promise.all`/spawn) — ~9,6 s → ~2–3 s; Bordmittel. → LERNPHASE-AB

**PILOT (erst messen — §7):**
- [ ] **B1 · Fedlex-DOM-Parser** (`linkedom`/`cheerio`) statt Regex-Tiefenzähler in `extrahiere-fedlex.ts` — buggigste Stelle des Repos; **fachlich wertvollster Umbau**; POC an einem komplexen Artikel gegen golden. → W2·5b + GESAMTAUFBAU Phase 1 (vor Freeze)
- [ ] **B2 · E3/E4-Datenpfad-Dreiarm-POC** — DuckDB vs. TS-Baseline (`hyparquet` + `better-sqlite3`-Transaktion) an echten voilaj-Parquet messen, BEVOR die Massenpipeline gebaut wird. → FAHRPLAN-DATENHALTUNG §5 E3
- [ ] **B4 · FlexSearch `export()`/`import()`** — Index build-time statt bei jedem Client (Perf-Rank 7). → QS-PERF c
- [ ] **B5 · LexWork-Adapter auf dieselbe DOM-Parser-Infra** (strikt NACH B1). → W3·12
- [ ] **B6 · Myers-Diff (`diff`)** für `golden:diff`-Diagnose (Gate bleibt Byte-Vergleich). → LERNPHASE-AB
- [ ] **B3 · pdfplumber (Python) NUR als Fallback**, wenn TS-PDF-Extraktion (pdfjs-Koordinaten) belegt versagt — einziger möglicher Python-Ort, nicht-lasttragendes Gegenprüf-Skript. → W3·12

**VERWORFEN (TS bleibt):** Python/Polars-Pipeline · Rust/Zig · Meilisearch/Typesense · Tantivy · decimal.js · DMN-Engine · oxlint/Biome · tsgo · CI-Parallelisierung (Solo) · DuckDB für Merkle/Index.

---

## DB-Strang (QS-DATA) — Ist-Stand
- [x] **E0** DB-Fundament + Byte-Paritäts-Tor (218 Bund-Normtext byte-gleich, doppelt verifiziert) — auf main.
- [x] **E0+ (E0-Ausdehnung)** ✅ 3.7.2026 (Branch `feat/qs-data-e0-plus`): kanton-Normtext (1231) + rechtsprechung (342) + Manifeste (`register.json`/`kanton-index.json`/rsp-`register.json`/`norm-index.json`, Trailing-Newline nachgebildet) + Materialien (1) — `check:paritaet` byte-gleich über **1796 Dateien**; Ziel-Schema §3 angelegt (leere Kanten-Tabellen), Partitionierung je Doktyp (`daten/{normtext,rechtsprechung,soft-law}.db`; `lexmetrik.db` entfällt), `normalisiere-zitat.ts` + Unit-Tests. Doppelt verifiziert (unabhängiger Zweitbeweis-Roundtrip), golden-neutral.
- [x] **E1** Generator→DB-Flip ✅ 3.7.2026 (Branch `feat/qs-data-e1-flip`): Bund-Normtext-Generator schreibt Zeilen ins Spalten-Zielschema (`erlasse`/`erlass_fassungen`/`artikel`), `public/*.json` kommt aus der Projektion (Wächter bricht bei alt≠neu ab); neues Tor **`check:datenhaltung`** (Dump-Manifest-Determinismus + Drift + Invarianten); Stabilitäts-Report; `check:gegenpruefung`-Globs um `scripts/datenhaltung/**`+`daten/**`+`normtext-snapshot.ts` erweitert. Byte-Beweis: 3 Doppelläufe alt==neu==committet über 218 Erlasse/24858 Artikel, `check:paritaet` unverändert 1796, golden byte-gleich. **VORBEHALT: alter Direktpfad bleibt als Wächter (Entfernen = eigener §6-Schritt); Kanton/Rechtsprechung/Materialien noch Blob-Weg.**
- [ ] **E1-Rest** alten Direkt-Schreibpfad entfernen (eigener §6-Schritt) · Flip auf Kanton-Normtext ausdehnen · `scripts/materialien/**` in die Risiko-Globs (mit E6b).
