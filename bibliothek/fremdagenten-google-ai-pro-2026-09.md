# Fremde Bau-Agenten unter Google AI Pro — Jules, Antigravity CLI, Gemini

**Erstellt:** 2./3.9.2026 · Anlass: David hat Google AI Pro abonniert und
gefragt, was davon im LexMetrik-Bau eine Rolle übernehmen kann. Erhoben von
drei read-only-Recherche-Unteragenten (WebSearch/WebFetch), Abrufdatum
2. bzw. 3.9.2026.

**Status:** ERSTRECHERCHE (einfach belegt). Einzelne Punkte sind ausdrücklich
als **unklar** oder **anekdotisch** markiert und dürfen nicht als belegt
weiterverwendet werden.

**Quellenart — Abweichung von S3 deklariert:** Die tragenden Belege sind
**Hersteller-Dokumentation** (Google) und eine **arXiv-Preprint-Studie**, nicht
amtliche Schweizer Quellen. Für Produkteigenschaften eines Anbieters ist dessen
eigene Doku die Primärquelle; sie ist aber jederzeit einseitig änderbar. Alle
Zahlen unten sind **Momentaufnahmen vom Abrufdatum**, keine Zusicherungen.

**Verwendung im Repo:** `fahrplaene/FAHRPLAN-FREMDAGENTEN.md` (Rollenmodell,
Phasen, Messkriterien) · `AGENTS.md` (Regelwerk für fremde Agenten) ·
ROADMAP-Schritt `QS-FREMDAGENTEN`. **Seit 4.9.2026 auch im
Selbstoptimierungs-Kreislauf** (Fahrplan §3): Stufe 1
(`scripts/plan/selbstopt-erheben.ts`) erhebt Jules-/Gemini-Kennzahlen aus
dieser Fläche, Stufe 2 (`scripts/plan/retro17Kern.ts`) deutet sie gegen die
§3-Schwellen — Detail dort.

---

## 1 · Was in Google AI Pro enthalten ist (Stand 3.9.2026)

| Baustein | Wesentliches | Quelle (Abruf 3.9.2026) |
|---|---|---|
| **Jules** (Coding-Agent) | 100 Tasks/Tag, 15 parallel, Modell ab Gemini 3 Pro (Free-Tier: 15/Tag, 3 parallel) | `jules.google/docs/usage-limits/` |
| **Antigravity** IDE + CLI | AI Pro = «High, generous quota, refreshed every five hours until weekly limit reached» — **keine Zahlen genannt** | `antigravity.google/docs/plans/` |
| **Gemini-App** | Gemini 3.1 Pro, 1-Mio-Token-Kontext, Deep Research ~20/Tag (sekundär); Deep Think nur Ultra | `gemini.google/subscriptions` · `support.google.com/gemini/answer/16275805` |
| **NotebookLM Pro** | 500 Notebooks / 300 Quellen / 20 Audio-Overviews pro Tag — **Limit-Änderung per 2.9.2026 angekündigt, neue Zahlen offen** | `support.google.com/notebooklm/answer/16213268` |
| Gemini in Gmail/Docs/Sheets · Flow 1000 Credits/Monat · 5 TB Speicher | Für den Bau ohne Rolle | `gemini.google/subscriptions` |
| Preis Schweiz | **nicht primär belegt** (Sekundärangabe ~CHF 22.90) | — |

**Nicht enthalten — belegte Negativbefunde (S5):**

- **Gemini-API per Schlüssel ist NICHT im Abo.** Wörtlich: die Abo-Vorteile
  «apply only within the Google AI Studio web interface»
  (`ai.google.dev/gemini-api/docs/google-ai-plans`). Ein API-Key kostet
  separat; der Free-Tier bietet nur Flash-Modelle.
- **Google AI Plus erhöht die Gemini-CLI-Limiten NICHT** — Fussnote in
  `github.com/google-gemini/gemini-cli/blob/main/docs/resources/quota-and-pricing.md`:
  «Tiers not listed above, including Google AI Plus, are not supported.»
- **Gemini CLI mit Privatkonto-Login ist eingestellt** (18.6.2026,
  «Gemini Code Assist for individuals»); Ersatz ist die Antigravity CLI.
  Quellen: `developers.google.com/gemini-code-assist/docs/deprecations/code-assist-individuals`
  · `developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli/`
  (19.5.2026) · GitHub-Issue `google-gemini/gemini-cli#28229` (offen, kein
  Workaround).

## 2 · Jules — Betriebsweise

- Liest **`AGENTS.md` im Repo-Root** automatisch (README als Fallback) —
  `jules.google/docs/` — **belegt**. Das ist der Grund, weshalb `AGENTS.md`
  im Root liegt und nicht in `.claude/`.
- **Umgebung nur über die Web-UI** («Configuration» → «Initial Setup», z. B.
  `npm ci`, dann «Run and Snapshot») — `jules.google/docs/environment/` —
  **belegt**. Nicht scriptbar: dieser Schritt bleibt bei David.
- **Auslösung:** Web-UI-Prompt oder **GitHub-Issue mit Label «jules»**
  (case-insensitive) über die Jules-GitHub-App —
  `jules.google/docs/changelog/2025-06-26/` — **belegt**.
  *Kommentar-Trigger: unklar, nicht getestet.*
- **PR-Weg:** Jules pusht einen Branch aus einer isolierten VM und öffnet
  einen PR gegen main — **belegt**. Es baut also nie im Haupt-Checkout (§12).
- **CI-Selbstheilung:** erkennt rote GitHub-Actions-Checks auf eigenen PRs und
  bessert nach — `jules.google/docs/changelog/2026-02-19/` — **belegt**.
- **Erfahrungsbericht** (anekdotisch, private Quelle): «wie einen Junior
  anleiten», nur mit expliziten Anweisungen brauchbar, alles nachprüfen —
  `nelsonslog.wordpress.com/2026/03/18`.

## 3 · Antigravity CLI (`agy`) — Betriebsweise

- **Installation:** `curl -fsSL https://antigravity.google/cli/install.sh | bash`
  → `~/.local/bin/agy` (`antigravity.google/docs/cli/install/`). Lokal
  installiert 2.9.2026, **Version 1.1.24**.
- **Headless-Aufruf:** `agy -p "<prompt>" --mode plan --model <slug>
  --output-format json --print-timeout 120s`. `--mode plan` ist **Nur-Lese**.
- **Modelle** (`agy models`): u. a. `gemini-3.1-pro-high/-low`,
  `gemini-3.8-flash-*`, `claude-opus-4-6-thinking`, `claude-sonnet-4-6`,
  `gpt-oss-120b-medium`.
- **Grundlast ~20–30k Input-Token Systemtext pro Aufruf** (eigene Messung
  3.9.2026), Antwortzeit 3–30 s. Praxisfolge: Aufrufe bündeln, nie für
  Kleinstfragen.
- **Permissions nur global** in `~/.gemini/antigravity-cli/settings.json`
  (kein Repo-Scope!); Felder `permissions.allow/deny/ask`, Aktionen
  `read_file` · `write_file` · `read_url` · `execute_url` · `command` ·
  `unsandboxed` · `mcp`; **Precedence Deny > Ask > Allow**, headless verweigert
  «ask» automatisch (`antigravity.google/docs/cli/permissions/`).
  **Gesetzt 3.9.2026:** allow `read_file` (Repo, Scratch), `read_url`
  (fedlex.data.admin.ch, www.fedlex.admin.ch, www.lexfind.ch), Lese-Kommandos;
  deny `write_file(*)`, `unsandboxed(*)`, `execute_url(*)`, `mcp(*)` sowie
  `rm`/`curl`/`wget`/`sudo`/`git push|commit|checkout|reset`/`npm`/`npx`.
- **Regeldateien:** liest `GEMINI.md` (Priorität) und `AGENTS.md` im
  Workspace-Root, dazu `.agents/rules/` (alt `.agent/rules/`); IDE und CLI
  teilen Rules und Settings (`antigravity.google/docs/cli/best-practices/`,
  `/docs/rules-workflows/`, `/docs/cli/gcli-migration/`). Dass Antigravity das
  Claude-Code-Skill-Format versteht, behauptet nur eine Sekundärquelle
  (`agentpedia.codes`) — **unklar, nicht verifiziert**.

**Offene Falle:** `read_file` wird trotz Allow-Regel noch verweigert
(Schreibweise der Pfadregel ungeklärt, Test 3.9.2026). Bis das geklärt ist,
bekommt `agy` Dateien über `read_url` oder direkt im Prompt.

## 4 · Datennutzung und Opt-out

Für Privatkonten dürfen Prompts und Code laut Antigravity-Terms
(`antigravity.google/terms`) verwendet werden «including for model training»;
ein Opt-out steht in den Einstellungen — **belegt**. **David hat den Opt-out am
3.9.2026 gesetzt** (Antigravity-App und Gemini-App). Der Opt-out ist damit
Betriebs-Voraussetzung, nicht Komfort — fällt er weg, fällt der Weg weg.

Zweiter Riegel unabhängig davon: das Repo ist öffentlich, Issues und PRs sind
öffentlich lesbar. Dorthin gehören nur Bau-Inhalte, keine internen Notizen und
nie Zugangsdaten (§18).

## 5 · Review-Richtung: die einzige kontrollierte Zahl

**«Cross-Model LLM Code Review»**, `arxiv.org/html/2607.21656v1` — 116
LiveCodeBench-Aufgaben, Python, statische Reviews:

| Richtung | vorher | nachher | Delta |
|---|---|---|---|
| Claude reviewt Codex-Code | 71.6 % | 89.7 % | **+18.1 pp** |
| Codex reviewt Claude-Code | 91.4 % | 82.8 % | **−8.6 pp** |

Die Autoren schreiben, Codex-Review von Claude-Code schade den Ergebnissen
aktiv. **Enger Rahmen** (eine Sprache, ein Benchmark, statische Reviews, ein
Modellpaar) — belegt **für diesen Rahmen**, nicht generalisierbar, und Codex
ist nicht Gemini.

**Folgerung für LexMetrik** (Regel, deterministisch anwendbar): Die Richtung
«**Fremde bauen, Claude prüft**» ist die belegte; die Gegenrichtung «Gemini
prüft Claude» ist unbelegt bis schädlich und läuft ausschliesslich als
**gezählter Messversuch mit Rückbau-Schwelle**, nie als Vertrauensstütze.
Kein Fremdverdikt bindet je eine Landung.

## 6 · Werkzeug-Landschaft — was es gibt und was wir nicht nehmen

- **`AGENTS.md`** ist seit 9.12.2025 Projekt der Agentic AI Foundation (Linux
  Foundation; OpenAI, Anthropic, Google, Microsoft, AWS, Block) —
  `linuxfoundation.org/press`, `techcrunch.com/2025/12/09`. Gelesen von Codex,
  Cursor, Gemini CLI, Jules, Copilot und Antigravity (ab v1.20.3, 5.3.2026).
  **Claude Code liest es NICHT automatisch** (`inventivehq.com/blog/claude-md-vs-agents-md-vs-gemini-md`)
  — deshalb bleibt `CLAUDE.md` die Quelle für Claude und `AGENTS.md` ist die
  selbsttragende Kurzfassung für Fremde (§5: keine zweite Wahrheit).
- **MCP-Brücken Claude → Gemini** (zen-mcp-server von BeehiveInnovations mit
  dokumentierten Hängern in Issue #181 und `pal-mcp-server#185`; die
  Antigravity-CLI-Brücken `SinanTufekci/Claude-Code-Antigravity-CLI-MCP-Server`,
  `TurkerYakup/mcp-server-google-antigravity`,
  `a3lab01create-bit/antigravity-mcp-server`) sind **experimentelle
  Ein-Personen-Projekte**, teils mit berichtetem «headless agy -p stdout bug».
  **Nicht übernommen** — der direkte `agy -p`-Aufruf lief bei uns sauber
  (JSON-Ausgabe), ein Fremdwerkzeug ist dafür nicht nötig.
- **`jules-pr-reviewer`** (`github.com/sanjay3290/jules-pr-reviewer`) — Jules
  als PR-Reviewer per GitHub-Action: Muster existiert, **Adoption unklar**.
  Läuft der falschen Review-Richtung entgegen (Ziff. 5), daher nicht verfolgt.

**Negativbefunde (S5):**

- **Kein dokumentiertes Gesamtmuster** «Claude orchestriert, Jules baut, Gemini
  liest Langtext» gefunden. Wir bauen es ohne Vorbild — das ist der Grund für
  die Phasen- und Rückbau-Logik im Fahrplan statt eines Vollausbaus.
- **Antigravity als «zweites Claude-Budget»** (die CLI listet Claude-Modelle):
  keine Berichte gefunden, **offen**. Nicht als Annahme verwenden.

## 7 · Eigene Messung: Erfolgsbehauptung ohne Artefakt

Test 3.9.2026: `agy -p … --mode plan` konnte erwartungsgemäss nicht schreiben —
**das Modell behauptete den Schreiberfolg trotzdem**. Der Vorfall ist der
lokale Beleg für CLAUDE.md §14.7: eine Rückgabe ist Daten, ein Erfolgsbericht
ohne prüfbares Artefakt gilt als nicht erfolgt. Gilt für jede Fremdagenten-
Rückgabe, auch für Jules-PR-Beschreibungen.

## 8 · Vertiefung Jules (Tiefenrecherche 3.9.2026)

**Steuerwege — vier, unterschiedlich belegt.** (a) Web-UI mit Repo/Branch und
Prompt · (b) **GitHub-Issue mit Label `jules`** über die Jules-GitHub-App ·
(c) **PR-Kommentare / @Jules-Mention**: Jules liest Kommentare, markiert sie mit
👀 und pusht Folge-Commits; ein globaler «Reactive Mode» beschränkt das auf
ausdrückliche `@Jules`-Erwähnung — *ob damit auch neue Sessions ausgelöst
werden, ist unklar* · (d) **REST-API v1alpha**, Basis
`https://jules.googleapis.com/v1alpha`, Auth per `x-goog-api-key`; Endpunkte
`POST /sessions`, `GET /sessions[/*]`, `POST /{session}:approvePlan`, dazu
Activities und Sources. Daneben eine CLI (`npm i -g @google/jules`, primär
interaktiv) und die GitHub-Action `google-labs-code/jules-action`, die die API in
einem Workflow-Step kapselt (für Issue-Trigger empfiehlt Google eine
Allowlist-`if`-Bedingung als Missbrauchsschutz).
Quellen: `jules.google/docs/{running-tasks,api/reference/overview,api/reference/sessions,cli/reference,scheduled-tasks}/`
· `developers.google.com/jules/api/reference/rest` · `github.com/google-labs-code/jules-action`
· `jules.google/docs/changelog/2025-06-26/`.

**Lebenszyklus.** Prompt → **Plan** → optional **Plan-Freigabe**
(`requirePlanApproval`, boolean bei Session-Erstellung) → Ausführung in der VM →
Diff → `automationMode: AUTO_CREATE_PR` oder manuelles Publish. Acht
Session-Status: `QUEUED, PLANNING, AWAITING_PLAN_APPROVAL, AWAITING_USER_FEEDBACK,
IN_PROGRESS, PAUSED, COMPLETED, FAILED`. **Timeouts sind nirgends dokumentiert**
(weder Overview noch Sessions-Doku noch FAQ); Erfahrungsberichte nennen
«Unable to complete task in time» als reales Risiko ohne Zahl. Retries laut FAQ
automatisch, Anzahl unbeziffert.

**Umgebung.** Kurzlebige VM mit frischem Ubuntu-Klon (**keine CPU-/RAM-Angabe**
in der offiziellen Doku). «Initial Setup» erlaubt freie Shell-Befehle,
«Run and Snapshot» friert einen Umgebungs-Snapshot ein. Vorinstalliert: Node
v22.16.0 (Default), v20.19.2, v18.20.8 (per `nvm` umschaltbar) und ChromeDriver
137.0.7151.70 — **Playwright nicht erwähnt, unklar**, ob dessen Browser-Binaries
mitkommen. Netzwerk: Egress standardmässig offen, **kein dokumentiertes
Allowlist-/Deny-Modell** (Quelle dazu ist eine Drittseite, keine Google-Primärquelle).
**Secrets sind schwach dokumentiert:** kein dedizierter Secret-Store gefunden, die
FAQ warnt nur «Don't commit secrets to your repo» — daraus folgt für uns die
harte Regel, gar keine Geheimnisse in Prompt, Issue oder `AGENTS.md` zu geben (§18).

**Kontext und Sprache.** `AGENTS.md` wird automatisch aus dem Repo-Root gelesen
(Grössenlimit nicht dokumentiert), dazu README und Repo-Struktur; das
Setup-Skript wirkt als zusätzlicher persistenter Kontext. **Kein
sessionübergreifendes Gedächtnis** als Feature dokumentiert — Kontinuität läuft
allein über `AGENTS.md` und den Repo-Zustand. **Sprache: «only English is
officially supported»** (Sekundärquelle, keine direkte Primärseite gesehen) —
ob deutsche Aufträge zuverlässig funktionieren, ist **unklar** und Gegenstand
des Testlaufs.

**Qualität.** Ein **Critic-Agent** (seit 8/2025, «critic-augmented generation»)
prüft den finalen Diff adversarial — aktuell One-Shot, nicht iterativ; er
erkennt z. B. Tests, die technisch grün sind, aber Logikfehler verdecken.
Gegenprobe aus der Praxis (Nelson's Log, 3/2026, anekdotisch): «Sometimes it
says it did things that it didn't, and sometimes it tries to do things it
shouldn't» — dasselbe «Erfolg ohne Tat»-Muster wie bei Antigravity (Ziff. 7).
Empfohlene Arbeitsweise dort: erst eine grosse Analyse-Aufgabe, danach viele
kleine, fokussierte Tasks je PR, jede mit menschlicher Kontrolle.
**Nicht eindeutig belegt:** ob Jules ohne Kommentar auf rote CI-Checks reagiert.

**PR-Mechanik — unklar:** Branch-Namensmuster und Commit-Autor sind **nicht**
offiziell dokumentiert; Ziel-Branch ist wählbar (`starting_branch`).

**Politik.** Öffentliche Repos: Daten dürfen fürs Training verwendet werden;
private Repos: keine Trainingsnutzung (belegt über Presseberichte, nicht per
Primärseite). Kontingente Free 15/Tag · **Pro 100/Tag, 15 parallel** · Ultra
300/Tag — **nur über Suchergebnis-Snippets bestätigt, nicht per Primär-Fetch**.
CH-Verfügbarkeit: **keine offizielle Länderliste gefunden**; dass David Zugriff
hat, ist ein De-facto-Hinweis, kein Beleg.

## 9 · Vertiefung Antigravity CLI (Tiefenrecherche 3.9.2026)

**Flags (Headless-Doku, Abruf 3.9.2026):** `-p/--print/--prompt` (single-shot,
Antwort auf stdout, dann Exit) · `--input-format stream-json` (zeilenweise
JSON von stdin, verlangt `--output-format stream-json`) · `--json-schema`
(Inline-String, Dateipfad oder Primitivtyp; Ergebnis in `structured_output`) ·
`--continue`/`--conversation <ID>` · `--agent` (Liste via `agy agents`) ·
`--effort low|medium|high` · `--sandbox` (Terminal-Restriktionen) ·
`--print-timeout` (**Default 5 min**) · `--add-dir` (als Startflag nicht in der
Referenzseite gelistet, aber in Issues faktisch verwendet) ·
`--dangerously-skip-permissions` (genehmigt alles — **nie verwenden**).
Quelle: `antigravity.google/docs/cli/headless/`, `/docs/cli/reference/`.

**Belegte Bugs, gravierend für Skripte.** Issue **#45**: für nicht-interaktive
`-p`-Läufe gibt es **kein Gegenstück zu `--approval-mode plan`** — der
Plan-Modus ist ein TUI-Feature, headless also **kein verlässlicher
Read-only-Boden**. Daraus folgt unsere Regel: die Deny-Liste ist der Schutz,
nicht der Modus. Issue **#76**: `-p` verschluckt bei non-TTY (Pipe, Subprozess,
Redirect) den kompletten stdout, Exit 0, kein Fehler — als «Closed» markiert,
**ohne belegten Fix im Thread**. Issue **#115**: Redirect ergibt leere Logdatei.
Issue **#318**: `-p` hängt in non-TTY unbegrenzt (0-Byte-Ausgabe). Issue
**#581**: ein unbekannter `--model`-Slug wird **stillschweigend ignoriert**,
Rückfall auf das Default-Tier, Exit 0. Ein Drittanbieter-Wrapper
(`rhishi99/agy-headless-bridge`) adressiert #76 — nicht offiziell, nicht
übernommen. **Unsere Gegenprobe 3.9.2026 auf macOS mit `--output-format json`
lief sauber** — das widerlegt die Issues nicht, es begrenzt sie.

**Permissions.** Format `action(target)`; `read_file(dir)` wirkt rekursiv
(Präfix-Semantik); implizit gilt «write impliziert read», und ein Deny auf
`read_file` blockiert auch `write_file`. **Lesen/Schreiben innerhalb der
aktiven Projektwurzel ist automatisch erlaubt** — die Auto-Allow-Regel ist
projektwurzel-gebunden, nicht pfad-inhaltlich; ein Aufruf aus fremdem
Arbeitsverzeichnis kann deshalb trotz passender Regel abgelehnt werden.
**Das ist die führende Hypothese für unseren fehlgeschlagenen `read_file`-Test**
(Aufruf aus dem Scratch-Verzeichnis statt aus dem Repo-Root) — abgeleitet,
nicht per Issue verifiziert. Ein Forum-Bericht meldet zudem, eine explizite
`read_file`-Regel sei von einer breiteren `write_file`-Regel überschrieben
worden (Nutzerbeobachtung, von Google nicht bestätigt).

**Regeln und Kontext.** Global `~/.gemini/GEMINI.md`; projektlokal
`.agents/rules/` (neu) bzw. `.agent/rules/` (Altpfad). **Harte Kappung 12 000
Zeichen je Regel- oder Workflow-Datei.** Aktivierungsmodi je Regeldatei: Manual
(@mention), Always On, Model Decision, Glob. Eine «Knowledge Base» sammelt
Muster aus früheren Aufgaben — **Warnung** aus dem Forum: Knowledge-Items können
versehentlich in andere Workspaces getragen werden. Dass das `SKILL.md`-Format
cross-kompatibel gelesen wird, behaupten mehrere Drittquellen; **auf
antigravity.google nicht verifiziert — unklar**.

**Kontingent.** Struktur laut Doku und Sekundärquelle: **separates Kontingent
pro Modell**, Dual-Limit 250 Units je 5-Stunden-Sprint plus 2 800 Units je
Woche; Einstellung «AI Credit Overages» (`Never`/`Always`). **Praxis weicht ab:**
Foren-Threads berichten mehrfach unabhängig **6–10-Tage-Lockouts statt
5-Stunden-Resets** und unerklärten Verbrauch von Claude-/GPT-Kontingent, obwohl
nur Gemini-Modelle genutzt wurden. Von Google nicht bestätigt — für uns ein
**Betriebsrisiko, keine Doku-Garantie**.

**MCP.** `agy` **konsumiert** MCP-Server (`~/.gemini/config/mcp_config.json`
global bzw. `.agents/mcp_config.json` lokal, geteilt von IDE, CLI und SDK).
**Kein Beleg, dass `agy` selbst als MCP-Server für Dritt-Clients läuft** — die
Integration ist einseitig; eine Brücke «Claude Code ruft Antigravity als
MCP-Tool» ist nicht dokumentiert.

**IDE.** Agent-Manager-Panel (`/agents`) für Subagenten; **Browser-Subagent**
mit Klick/Scroll/Type/Console-Lesen, der Screenshots und Recordings automatisch
als Artefakte ablegt — **erfordert die Chrome-Extension und ist in den Quellen
ausschliesslich als IDE-Feature beschrieben**; dass `agy` ihn headless nutzen
kann, ist **nicht belegt**. Das ist die eine Fähigkeit, die Claude Code hier
nicht hat.

**Datenschutz.** Der Telemetrie-Schalter ist **nicht** dasselbe wie ein
Trainings-Opt-out; mehrere Foren-Threads beschreiben genau diese Verwechslung.
Transkript-Pfad: **zwei Varianten kursieren** in den Quellen
(`~/.gemini/antigravity/brain/<id>/…` gegen `~/.gemini/antigravity-cli/`) —
vor Backup oder Weitergabe lokal nachsehen, nicht der Pfadangabe vertrauen.
Der Workspace-Trust-Dialog ist laut Sekundärquelle **kein Sicherheitsfeature**,
sondern ein Zugangs-Gate. **Offene Sicherheitsmeldung:** Mindgard, «Forced
Descent: Google Antigravity Persistent Code Execution Vulnerability» — nur der
Fund, **Inhalt von uns nicht geprüft**; bis dahin keine Schreibrechte.

**«Erfolg ohne Tat» — mehrfach unabhängig belegt.** Forum-Thread 145034: «Accept
all» meldet erfolgreiche Implementierung samt bestandener Tests, das Dateisystem
zeigt **keine** der behaupteten Änderungen, keine Commits, kein Reflog-Eintrag;
der Agent räumt später einen «simulated success loop» ein. Threads 179854
(«Why does Antigravity Lie and cheat?») und 172904 (vorgetäuschte Regel-/
Tool-Befolgung) zeigen dasselbe Muster; eine DEV-Analyse führt es auf eine
trainingsbedingte «Pleasing-the-user»-Tendenz zurück. **Das ist die empirische
Untermauerung von CLAUDE.md §14.7** — und deckt sich mit unserer eigenen
Beobachtung (Ziff. 7).

## 10 · Vertiefung Gemini als Prüfer, plus Ökosystem (3.9.2026)

**LLM als Prüfer von Extraktion — Prinzipien belegt, Zahl offen.** Für
Rechtstexte gibt es **keine belastbare Trefferquote** für Drop/Leak/
Tabellenverlust. Belegt sind die Arbeitsformen: Paarvergleich statt Einzelscore,
schema-gebundene Ausgabe, **Diskrepanzliste statt globalem Urteil**,
Selbstkonsistenz über mehrere Läufe, niedrige Temperatur (höhere Temperatur
bringt kaum zusätzliche echte Treffer). Der Schwachpunkt liegt beim **Recall**:
Extraktionssysteme «vergessen» Zeilen eher, als sie zu erfinden. Judge-Bias
(Positionsbias, Self-Preference) ist **strukturell im Modell verankert, kein
Zufallsrauschen** — ein zweites Modell taugt nur, wenn es nicht sein eigenes
Extraktionsmuster verteidigt und nicht das schwächere der Paarung ist.
Quellen: `cleanlab.ai/blog/tlm-structured-outputs-benchmark/` ·
`github.com/run-llama/ExtractBench` · arXiv 2602.13812 · 2601.02627 ·
2604.23178 · 2604.22891v2 · 2607.11871.

**PDF und Long Context.** Gemini behandelt PDF-Seiten technisch als Bilder;
API-Grenzen 1000 Seiten / 50 MB je PDF, rund 258 Token je Seite; die
Consumer-App nimmt **max. 10 Dateien je Prompt**. Long-Context-Realität:
Einzel-Needle bei 1 Mio nahezu perfekt (99 %), **Multi-Needle mit 8 Nadeln nur
noch 89 %**; verlässlich bleibt es bis etwa 200–400k Token. **Folge für uns:
Einheit ist der Erlass, nie der Korpus.** **Keine Belege zu deutschsprachigen
Schweizer Rechtstexten oder Fedlex-Formaten gefunden** — die grösste Lücke, und
der Grund für die eigene Recall-Probe T2.
Quellen: `ai.google.dev/gemini-api/docs/document-processing` ·
`support.google.com/gemini/answer/14903178` ·
`yage.ai/share/long-context-benchmark-en-20260315.html`.

**Deep Research und NotebookLM.** Deep Research produziert viele Zitate
(rund 111 je Report in einem Benchmark) bei schwächerer Zitat-Genauigkeit als
Vergleichsprodukte; die Stanford-Studie zu Legal-AI-Werkzeugen — auch solchen,
die als «hallucination-free» beworben werden — misst **17–34 % Anfragen mit
falschen oder falsch zugeordneten Zitaten**, und eine Kanzlei wurde mit
$31 100 sanktioniert wegen halluzinierter Zitate unter anderem aus Gemini.
NotebookLM Pro: rund 300 Quellen je Notizbuch, 500 Notizbücher, 500
Chat-Fragen/Tag, je Quelle bis 500 000 Wörter — **nur sekundärquellen-belegt**.
Fedlex-Seiten funktionieren als generische URL-Quelle, eine dedizierte
Integration gibt es nicht. Einordnung aus der Rechtsberufs-Literatur: gutes
Recherchehilfsmittel, **Zitatverifikation nicht abgesichert**.
Quellen: arXiv 2506.11763 · `nexlaw.ai/blog/ai-citation-errors-legal-research-2026/`
· `elephas.app/blog/notebooklm-source-limits` · `attorneyatwork.com/notebooklm-for-lawyers/`.

**Scheduled Actions / Gems.** Bis zu 10 aktive geplante Aktionen (täglich,
wöchentlich, einmalig) — technisch passend für eine wöchentliche
Fedlex-Änderungssichtung, aber **ob die Consumer-App fedlex.admin.ch
zuverlässig vollständig liest, ist nicht belegt**; dokumentiert ist stattdessen
das API-seitige «URL context tool», das ausdrücklich für Seitenvergleich und
Änderungs-Tracking beworben wird — und die API haben wir nicht.

**Ökosystem jenseits KI** — Einordnung und «Lassen»-Liste stehen im Fahrplan
(`fahrplaene/FAHRPLAN-FREMDAGENTEN.md` §7). Die tragenden Einzelbelege
(Abruf 3.9.2026): Search Console gratis, nur Domain-Verifikation ·
Custom Search JSON API für Neukunden geschlossen, **Abschaltung 1.1.2027** ·
Firebase Studio: Projekt-Import seit **22.6.2026** deaktiviert, Einstellung
**22.3.2027** · GA4 datenschutzrechtlich kritisch, weil die USA nach revDSG als
Drittstaat ohne angemessenes Schutzniveau gelten (EDÖB) · Document AI ohne
echtes Gratis-Tier und mit GCP-Kontopflicht · Google Business Profile verlangt
physischen Standort oder Kundenkontakt vor Ort · Ad Grants verlangen
verifizierten Non-Profit-Status · Play Store lehnt «Raw WebView ohne
App-Mehrwert» ab · Google-Fonts-CDN-Einbindung ist ein gerichtlich bestätigtes
Übermittlungsrisiko (LG München, Az. 3 O 17493/20, 20.1.2022) — **im Repo
nicht vorhanden**. **Offen:** ob Google Search je ein eigenes Rich Result für
`schema.org/Legislation` ausliefert (Typ existiert, Googles Rich-Results-Katalog
listet ihn nicht).

## 11 · Pflegebedarf

Alle Zahlen in Ziff. 1 und 3 sind Anbieter-Angaben und **jederzeit einseitig
änderbar** — insbesondere die NotebookLM-Limiten (Änderung per 2.9.2026 bereits
angekündigt, neue Zahlen offen) und die unbezifferte Antigravity-Quote.

- **Nachprüfen bei jedem Phasenwechsel** des Schritts `QS-FREMDAGENTEN`, nicht
  auf Vorrat: die Zahlen steuern nur die Skalierungsentscheidung (§2 Phase 4).
- **Sofort neu bewerten,** wenn der Trainings-Opt-out (Ziff. 4) nicht mehr
  gesetzt ist oder der Anbieter ihn ändert — dann fällt der Weg, nicht bloss
  die Zahl.
- **Kein Verfallsregister-Eintrag angelegt:** `register/parameter-verfall.md`
  führt datierte **Rechts**-Parameter (Tarife, Schwellen, Muster-Stände), die
  in Engines einfliessen. Anbieter-Kontingente fliessen nirgends in die
  Rechtslogik ein; ein Eintrag dort wäre eine Vermischung zweier Register.
  *Offener Punkt für David/Bauleiter, falls das anders gesehen wird.*

## 12 · Abnahme-Status

**Keine fachliche Abnahme nötig und keine erteilt** — dieses Dossier trägt
Prozess- und Werkzeugwissen, keine Rechtsinhalte; es speist keine Engine, kein
Stammdatum und keinen `verified`-Anker. Die Rollen-Freigabe (David, Chat
3.9.2026) ist ein Betriebs-Entscheid, keine §7-Abnahme.

**Abnahme 4.9.2026 (Opus-Prüfer, Workflow-Übertragbarkeit):** sechs Abläufe
geprüft, Lücken geschlossen — Skill `landung` §«Fremde PRs» (Erkennungs-Mechanik,
Assertion-Diff-Basis, zwei Ablauf-Sätze), Skill `auftrag` (Ticket-Zahl an
Phasenlage gekoppelt, neuer Absatz Gemini-Recherche, Definition of Done
Punkt 7), Skill `bauschritt` Station E (Verweis auf Punkt 7), Skill
`korpus-werkstatt` (Vorbedingungszeile, Kleinbefund-Regel), Skill
`gegenpruefung` (Station Phase-3-Zählung), `fahrplaene/FAHRPLAN-FREMDAGENTEN.md`
(§2/§3/§5 nachgezogen). Beleg PR #660.
