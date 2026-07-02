# BACKLOG — Werkzeuge & Instrumente (Audits 2.–3.7.2026)

> Konsolidierte, umsetzbare Funde aus zwei ultracode/Fable-Audits. **Kein `FAHRPLAN-`** (bewusst, damit QS-PH nicht triggert). Volltexte der Reports: Session-Scratchpad `audit-sprachen.md` / `audit-instrumente.md`. **Leitplanken:** Laufzeit + Byte-Paritäts-Serialisierung bleiben TS-fix; Offline-/Tooling frei; Solo-Kosten real; „richtiges Werkzeug vor neuer Sprache".

## OFFENER DAVID-AUFTRAG (nach diesem Block)
- [ ] **Gesamten Bauplan nochmals überarbeiten** (David 3.7.2026) — die Funde unten in ROADMAP/FAHRPLÄNE einarbeiten; via Fable planen, Opus umsetzen.

---

## Audit 2 — Instrumente/Dienste rund ums Coden

**JETZT (Code-seitig, dieser Branch `feat/betriebs-sofortgewinne`):**
- [x] **A2 · Normen-Monitor-Alarm** — bei Rot GitHub-Issue anlegen/aktualisieren + `check:normtext-netz` + `check:pdf-netz` mitlaufen (normen-monitor.yml). *(Kernfund: 15.6./29.6. real rot, unbemerkt.)*
- [x] **A6 · CI-Playwright-Browser-Cache** (ci.yml) — Prüfläufe Minuten schneller.
- [ ] **A4 · Kontaktformular aktivieren** — Empfänger-Mail ist „leer" → stumm. **Braucht Davids Entscheid:** welche Adresse + möglichst via Env-Var (Personen-Mail nicht ins öffentliche Repo hardcoden).
- [ ] **A5 · „Fehler melden"-Link** auf der Absturz-Seite (`src/components/ErrorBoundary.tsx`) — vorausgefüllte Mail; UI → golden/Gate-sorgfältig, doppelt prüfen.

**JETZT (David-Klicks, keine Code-Arbeit):**
- [ ] **A1 · Dependabot einschalten** + `npm audit fix` für den einen mittelschweren `dompurify`-Befund (indirekt über jspdf).
- [ ] **A3 · Vercel-Deploy-Gate klären** — Vercel deployt heute jede Änderung automatisch live, widerspricht §9 „kein Live ohne Ja". Auto abschalten ODER Regel anpassen.

**SPÄTER:** Sentry (erst bei Traffic; A5 reicht jetzt) · CodeQL (jetzt v.a. Fehlalarme) · `npm audit` als Prüf-**Meldung** (nie Stopper) · Claude-Code-PR-Action (bewusster Entscheid — schickt jede Änderung an Anthropic).

**UNNÖTIG/Overkill:** Datadog/Grafana/PagerDuty · Renovate · Neon · Meilisearch · Vercel-Blob · Cloudflare-Zusatz-CDN · CodeRabbit/Qodo · **KI-Testgenerierung (gefährlich: friert Rechenfehler ein)** · TypeDoc/Mintlify · gitleaks (schon an) · LaunchDarkly · Statusseite · DB-Backup-Dienste · externe Cron.

---

## Audit 1 — Sprachen/Werkzeuge IM Code (Quintessenz: kein Sprachwechsel; alles in TS holbar)

**ADOPT (Null-Tarif-Paket, klarer Gewinn):**
- [ ] **`he`** statt handgepflegter HTML-Entity-Tabelle (`scripts/normtext/html-entities.ts`) — 2231 vs. ~90 Entities; `&ge;`/`&le;` haben real Tarif-Schwellen verfälscht.
- [ ] **`fast-check`** (Property-Tests) für die Staffel-Engines (`src/tests/tarifInvarianten.test.ts`) — fängt Bandgrenzen-Off-by-one; Dev-Dependency, seed-deterministisch (§2).
- [ ] **Nebenläufigkeit** (`p-limit`, Concurrency 4–8) in den Fetch-Schleifen (`scripts/normtext-snapshot.ts`, `check-drift.ts --netz`) — I/O-bound, Faktor ~Concurrency; Merge bleibt `sort()` (deterministisch).
- [ ] **Gate-Kette parallelisieren** (`package.json check` via `Promise.all`/spawn) — ~9,6 s → ~2–3 s; Bordmittel.

**PILOT (erst messen — §7):**
- [ ] **B1 · Fedlex-DOM-Parser** (`linkedom`/`cheerio`) statt Regex-Tiefenzähler in `extrahiere-fedlex.ts` — buggigste Stelle des Repos; **fachlich wertvollster Umbau**; POC an einem komplexen Artikel gegen golden.
- [ ] **B2 · E3/E4-Datenpfad-Dreiarm-POC** — DuckDB vs. TS-Baseline (`hyparquet` + `better-sqlite3`-Transaktion) an echten voilaj-Parquet messen, BEVOR die Massenpipeline gebaut wird.
- [ ] **B4 · FlexSearch `export()`/`import()`** — Index build-time statt bei jedem Client (Perf-Rank 7).
- [ ] **B5 · LexWork-Adapter auf dieselbe DOM-Parser-Infra** (strikt NACH B1).
- [ ] **B6 · Myers-Diff (`diff`)** für `golden:diff`-Diagnose (Gate bleibt Byte-Vergleich).
- [ ] **B3 · pdfplumber (Python) NUR als Fallback**, wenn TS-PDF-Extraktion (pdfjs-Koordinaten) belegt versagt — einziger möglicher Python-Ort, nicht-lasttragendes Gegenprüf-Skript.

**VERWORFEN (TS bleibt):** Python/Polars-Pipeline · Rust/Zig · Meilisearch/Typesense · Tantivy · decimal.js · DMN-Engine · oxlint/Biome · tsgo · CI-Parallelisierung (Solo) · DuckDB für Merkle/Index.

---

## DB-Strang (QS-DATA) — Ist-Stand
- [x] **E0** DB-Fundament + Byte-Paritäts-Tor (218 Bund-Normtext byte-gleich, doppelt verifiziert) — auf main.
- [ ] **E0-Ausdehnung:** kanton-Normtext (1231, gleiche Form) → rechtsprechung → `register.json`/`index.json` (Trailing-Newline). `ingest.ts` heute nur bund; `check:paritaet`-Allowlist erweitern.
- [ ] **E1** Generator→DB-Flip; dann `scripts/datenhaltung/**` in `check:gegenpruefung`-Globs.
