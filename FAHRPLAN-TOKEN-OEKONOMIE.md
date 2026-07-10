# FAHRPLAN — Token-Ökonomie des Agenten-Baus (Detailquelle)

> **Heimat:** `ROADMAP.md` → **oberster offener Schritt** der «Geordneten Abarbeitung» (`QS-TOK`);
> nur Detailquelle (§14); einziger Repo-Eingriff; selbst §-sliceable.
>
> **Auftrag David 10.7.2026** (ultracode: 7 Berichte, 3 adversariale Lenses, Nachmessungen):
> Bau verbraucht **weniger Tokens** — nur über Effizienz (gezielter lesen, kompakter übergeben,
> deterministisch statt modellgetrieben, cachen, indizieren); Einmal-Investitionen ok.
> 19 Massnahmen adoptiert (10 korrigiert), 8 verworfen.
>
> **LEITPLANKE (nicht verhandelbar):** Qualitäts-Daueranweisungen unangetastet — adversariale
> Gegenprüfung auf Risikopfaden, doppelt verifizieren, iterative Bug-Checks, golden byte-gleich,
> Treue vor Tempo. Keine Massnahme kürzt Beweis, Tor oder Prüfung.

## Stand

**GO + OBERSTE PRIORITÄT erteilt (David, Chat 10.7.2026): «oberster schritt soll sein den
token verbrauch zu minimieren.»** Damit P0–P5 freigegeben; Start = **P0/T2 Token-Baseline
(Messung zuerst)**, dann Pakete in Plan-Reihenfolge; die Reader-Kette W2·5d
(U-POSITION → U-PDF) läuft erst danach bzw. dahinter.
Tok ≈ Bytes÷4; Zahlen = Schätzung bis T2 misst; Umsetzung Opus, gate-grün, je PR.
Notation: M Mechanik · E Ersparnis+Herleitung · R Risiko→Gegenmittel · **K adversariale Korrektur (Spec-Pflicht)** · DoD messbar.

## §1 Ist-Befund

| Posten | Befund |
|---|---|
| STRUKTUR.md | 136,5 KB nach Teilrotation (trotz Warn-Hook 452 KB erreicht; Archiv 347,5 KB); jede Session + Subagent liest sie |
| ROADMAP.md | 104,9 KB ≈ 26k Tok; nur 14 offene / 10 erledigte Checkboxen, Rest Erledigt-Chronik |
| CLAUDE.md | 25,6 KB / 367 Z. ≈ 7k Tok, Pflichtlektüre jedes Agenten |
| FAHRPLÄNE | 38 / 1,05 MB; GESETZES-UX 105 · FEDLEX 102 · DATENHALTUNG 73 KB; Anker da |
| Daten | normtext 116 MB/2590 JSON (OR ≈ 475k Tok) · golden 6 MB (snapshot 1,31M) · daten/ 7 GB |
| src/ | 704 TS / 12 MB; Hotspots inhalt.tsx 76 KB × 35 Commits/400, zustaendigkeit.ts 71 KB |
| Schutz | kein .gitattributes/.rgignore/Read-Guard; engine-map 8 KB (11.6.). Schon gehärtet: gate.sh grün=1 Zeile · check-parallel fails-only · golden:diff gedeckelt · Hooks grün=0 Tok · Tool-Schemas deferred. CI: Monolith-Job «Tore (…)», 16 Schritte; Required+No-op-Zwilling namensgleich |

## §2 P0 Messung zuerst

**T2 Token-Baseline + Regressionswächter (S).** M: `npx ccusage` liest lokale JSONL-Logs
read-only + rückwirkend (Baseline existiert schon): Tok/USD je Session inkl. Cache-Split;
optional OTEL (`claude_code.token.usage`); Fenster 26.6.–10.7. E: 0 direkt; macht alle Zahlen
belegbar, fängt stille Regressionen (Caching-Bug 3/2026: 10–20×). R: keines (read-only).
**K:** Deltas über Session-TYPEN, nicht Wochen (Aufgaben-Mix konfundiert); Wächter, kein
Kausalbeweis. DoD: Baseline je Session-Typ hier vermerkt; Report-Befehl.

## §3 P1 Steuer-Doku-Diät

**T1 STRUKTUR-Rotation: Hook rotiert statt warnt (hoch/S).** M: SessionStart-Skript verschiebt
`## Session`-Karten älter ~2 Arbeitstage byte-genau ins Archiv (Kopf/offene Abnahmen nie);
neue Karte = 4-Zeilen-Prepend am Anker `<!-- KARTEN -->`; Read via offset/limit; Rest-Rotation
Alt-Karten (35). E: ~15–20k je Voll-Lesung (136,5→~55 KB; Pflicht-Read <2k) + verhinderter
Wiederanstieg ~20–25k/Woche (Beleg §1: 452 KB). R: verschieben, nie zusammenfassen (40 %
Retrieval-Verlust); idempotent, nie blockieren. **K (Worktrees):** nur Haupt-Checkout
(git-dir==git-common-dir, sonst exit 0), nur git-clean, sofort `docs(STRUKTUR…)`-Commit statt
WIP (§12.1). DoD: ≤60 KB; Testlauf rotiert byte-gleich; Worktree = No-op.

**T3 FAHRPLAN-§-Slice statt Ganzdatei (hoch/S).** M: CLI `npm run fahrplan -- <Datei> <§>`
druckt deterministisch Kopf+§0+Ziel-§; Prompts referenzieren §§; CLAUDE.md-Zeile «Ganzdatei bei
Unklarheit». E (korrigiert): ~15k statt 17,5k je Bau-Agent, Kopf+§0 (8,7 KB) immer dabei
(GESETZES-UX §10: 35,5+8,7 vs. 105,4 KB).
**K (Sichtfeld, deckt R):** CLI liefert zwingend das komplette ##/###-Inventar mit (ToC ~0,3k), gegen Querkontext-Blindheit; Orchestrator referenziert ALLE zuständigen §§; Quer-Lektionen gehören in §0.
DoD: CLI + Testfall (§10 ≤~45 KB inkl. ToC); Konvention in CLAUDE.md + T4.

**T7 ROADMAP-Chronik-Split (hoch/M).** M: Erledigt-Prosa («gebaut/PR#») nach
`ROADMAP-CHRONIK.md` verschieben (nie zusammenfassen); bleiben: Protokoll, @meta, BEIDE Zonen,
je Einzeiler+Pointer. E: ~9–11k je Session (Welle 2 = 48,7 KB mit 26 Chronik-Absätzen;
Datei −35–45 KB); ROADMAP = Session-Einstieg. R: Beide-Zonen-Daueranweisung + oberster
offener Schritt intakt; Beweis: Checkbox-Zählung identisch (14/10).
**K (Ursache):** nur mit Nachhalte-Mechanik: Abschluss-Prosa künftig DIREKT in CHRONIK
(Protokoll-Konvention) + Wächter im T1-Skript, sonst Re-Akkumulation (STRUKTUR-Beleg). DoD:
ROADMAP ≤~65 KB; Checkboxen identisch; Konvention im Protokoll.

**T16 CLAUDE.md: §7-Detail in paths-Rule (niedrig/M, 2× geschwächt).** M: NUR §7-Elaboration (~4,7 KB) in
projektseitige `.claude/rules/` (`paths` = Extraktions-Flächen); normativer Einzeiler+Tor-Verweis bleiben im Kern. **K1 (Bugs):** Rules
laden nur beim READ passender Dateien, nicht bei Write/Create (#23478); User-Ebene ignoriert
`paths` (#22170) → projektseitig, nur wo ein Read garantiert ist. **K2:** §13/§15 bleiben im
Kern; Entscheidungs-Regeln wirken VOR der Pfad-Berührung, breite paths ⇒ Ersparnis ~0 oder
teurer Rework. E: ~1k je Agent ohne Extraktions-Berührung. DoD: Probelauf belegt Rule-Ladung
vor Extraktions-Aktion; keine Befolgungs-Regression.

## §4 P2 Daten-Guards+Sonde

**T5 Guards gegen Katastrophen-Reads (hoch/S).** M: (a) PreToolUse-Guard (Muster
tor-schutz.py): Read/cat >~200 KB ohne offset/limit → Soft-Block (Verweis T6/golden:diff),
Override möglich; (b) AUTOGENERATED-Banner aus den Generatoren; (c)
`.gitattributes`. E: killt Ausreisser-Reads (§1; fontData 99k); 1 Fehlgriff/Monat > Investition. R: Guard nie hart (kein Beweis-Read blockieren). **K (Beweis-Blindheit):**
`linguist-generated` OHNE `-diff` für normtext-JSONs (Extraktions-PRs/Gegenprüfung jagen
Drop/Leak via git-Diff); `-diff` nur fontData/grundart.generated; golden NICHT still per
.rgignore leeren (0-Treffer = False-Negative), sondern Guard-Meldung (→ golden:diff, §6.5).
DoD: Guard blockt Snapshot-Test-Read, Override ok; normtext-git-diff bleibt textuell; Banner
überlebt Generator-Lauf.

**T6 Daten-Sonde: artikel-genaue CLI (hoch/M).** M: `npm run zeige -- <Erlass> <Artikel>`
liest normtext-JSONs mit der Engine-Deserialisierung (typen.ts), druckt NUR
den Eintrag byte-treu/roh (nie re-serialisieren); Varianten struktur/register/kanton; analog
SQL-Sonde read-only für `daten/*.db`. E: ~10–40k je daten-berührender Session (3–8 Nachschläge
à ~200 Tok statt Grep-Runden/Voll-Reads); U-Kette/Extraktor-Backlog = dieser Typ. R:
Byte-Treue Pflicht (Risikopfad Norm-Zitate) → gleiche Deserialisierung, read-only, live auf
Repo-Dateien (kein Staleness). DoD: OR Art. 1 byte-identisch zum JSON-Eintrag
(Diff-Beweis); in T4 + CLAUDE.md verankert.

## §5 P3 Dispatch+Prozess

**T4 Standard-Dispatch-Template (hoch/S).** M: je Agent Whitelist mit Erweiterungs-Klausel
(begründen), TABU-Flächen, §-Slice (T3), Pflicht-Rückgabe (Status/Pfade/Gates/offene
Punkte/Architektur-Entscheide; Details in PR-Body); Gegenprüfung/
Bug-Checks unverändert IM Agenten. E: ~7–25k je Bau-Agent = 5–15k Exploration + 2–9,5k
Rückgabe (Beleg: 500-Tok-Return statt 8k-Prosa); multiplikativ. **K1 (TABU):** kein
Hand-Edit/Direkt-Read; Generator-/Tool-Läufe (golden, Generator, T6) = legitimer Weg;
TABU je Auftragsklasse (UI: Datenfläche tabu; Extraktion: Arbeitsfläche via Tools).
**K2:** Pflichtfelder zusätzlich Gegenprüfungs-Verdikt/Linsen/Befund-Kerne +
Whitelist-Erweiterungen; ≤2k = Richtwert, Fails/Befunde NIE kürzen. DoD: Template existiert +
referenziert; 3 Probe-Dispatches halten das Schema.

**T15 Modell-/Effort-Routing (mittel/S).** M: model+effort in JEDEM Task-Call explizit;
Checkliste im T4; Risikopfade + Gegenprüfung fix Opus/high. E: bis −48…−76 % Output
auf effort-gesenkten Schritten (Opus-4.5); Haiku = 1/5 Opus-Preis. **K:** mechanisch =
deterministische Transformation, maschinell prüfbar (verschieben, formatieren, Log-Extrakt,
Fertigtext) → Haiku/low; jede SYNTHESE (Session-Karten/Vermerke/Handoffs:
Steuer-Doku lenkt Folge-Sessions!) mind. Sonnet bzw. beim bauenden Opus; Wirkung primär auf
Reasoning-Anteile, per T2 kalibrieren. DoD: Stichprobe 10 Dispatches 100 % explizit; keine
Synthese unter Sonnet.

**T11 Gegenprüfung: gepinnter Snapshot + Scope-Anker (mittel/S).** M: Prüf-Agent erhält
gepinnten amtlichen Filestore-HTML-Pfad (fedlex-cache.sh) + Scope-Anker aus der roten
Tor-Meldung; Re-Derivation aus der Norm bleibt vollständig; übergeben wird nur Beschaffung
(Skill-Zusatz). E: ~5–15k je Gegenprüfung (Fetch-/Such-Runde entfällt); häufig.
**K (Common-Mode):** Prüf-Agent führt Currency-Check SELBST (check:fedlex-versionen/caches),
Pin nur bei EIGENEM Grün, sonst Live-Beschaffung; nie Bau-Pfad-Grün übernehmen, nie auf
Code/zweite Ableitung zeigen (Skill-Regeln 2+5); volle Wirkung nach Fedlex-P1a/b (18 Pins
überholt). DoD: Skill-Zusatz; Probe dokumentiert eigenen Grün-Check.

**T18 Screenshot-Diät bei Fakt-Checks (niedrig/S).** M: Fakt-Prüfungen via
DOM/get_page_text/Assertion statt PNG-Read (~1–1,6k Tok/Bild). **K (enge Positivliste):** DOM
NUR für Existenz, Textinhalt, Attribute/aria, Klassen-/Style-FAKTEN; Geometrie/
Sichtbarkeit/Überdeckung/Umbruch/Kontrast — inkl. «wird angezeigt» — bleibt
Screenshot-pflichtig (Clipping-/Überdeckungs-Bugs sind DOM-korrekt!); Reader-Flächen
Screenshot-Default; Zweifel ⇒ Screenshot. DoD: Positivliste im Template; Stichprobe: kein
visueller Check per DOM.

**T19 Prompt-Cache-Hygiene (niedrig/S).** M: byte-stabile Präfixe: SessionStart-Injektion
stabil (T1 entfernt Warn-Injektion), CLAUDE.md nicht mid-Kampagne editieren, Agenten-Läufe dicht bündeln (TTL 5 Min). E: dollar-seitig (Cache-Read 10 %, Write
125 %; Präfix = grösster Preisposten); Tok-Volumen unverändert. DoD:
cacheRead-Quote steigt (T2-Split) nach T1.

## §6 P4 Werkzeuge+Output

**T9 ast-grep als Navigations-Standard (mittel/S).** M: installieren, allow-Permission, im
T4-Template bevorzugt (AST-Pattern statt Breit-Grep + Voll-Reads); Harness-LSP wo verfügbar;
Grep/Read = Fallback, Beweis-Reads unangetastet; CLI statt MCP (0 Fixkosten). E (korrigiert):
~5–15k je navigations-lastiger Session (10–30k-Oberkante ignorierte Folge-Reads).
DoD: allow-Liste, Template, Muster-Query-Satz.

**T8 engine-map → generierte Repo-/Symbol-Map (mittel/M).** M: Skript generiert aus
ts-Exports/tree-sitter Modul→Pfad→Exports→FAHRPLAN-§→Tore + Einstiegs-Index (Unterbau ggf.
repomix --compress); Kopf hand-kuratiert, Rest skript-generiert (LLM-generierte Maps schaden:
−3 %/+20 %). E: ~15–40k Orientierung je frischem Agenten (heute ≈ 20–60k Grep/Read); Map
kostet ~2–5k. **K (Staleness/Konflikt):** Map NICHT committen; on-demand `npm run map` ODER
nur post-merge auf main (CI-Commit docs(map)); Gate höchstens warnend, NIE Required (sonst
Map-Konflikt je Parallel-PR, DIRTY-Kaskade #164/#165); auf Risikopfaden ersetzt die Map nie
die echte Datei. DoD: `npm run map` deckt src/+scripts/; kein Map-Artefakt in Feature-PRs.

**T12 CI-Rot-Log-Diät, zweistufig (mittel/S+M).** M (Stufe 1, sofort, Risiko 0): Wrapper um
`gh run view --log-failed`: nur Fehlerblock+Kontext, Fails vollständig. E: ~10–40k je
CI-Rot-Vorfall (Log 500–2000 Z.; Frequenz durch gate:schnell gedämpft).
**K (Risiko-Asymmetrie):** Job-Split NUR als Stufe 2, falls T2 materielle Rest-Kosten zeigt;
Fehler am Required-Gefüge blockiert JEDEN PR: Aggregat-Job EXAKT namensgleich, No-op-Zwilling
synchron, needs in Treue-Reihenfolge, Beweis an Wegwerf-PR VOR Merge. DoD: Extraktor an rotem Beispiel-Run belegt; Stufe 2 nur mit Wegwerf-PR-Beweis.

**T17 test:kurz + Playwright dot (niedrig/S).** M: `test:kurz` (Vitest-dot) für grüne
Vorab-Läufe, Playwright lokal list→dot; `npm test` + CI unverändert (volle Rot-Diagnose, §6).
E: ~2–3k je Direktlauf (Restloch). DoD: Scripts da; Fails vollständig sichtbar.

**T10 Fixkosten-Audit Konnektoren/Skills (niedrig [korrigiert]/S).** M: ~250 deferred
Tool-NAMEN + Skill-Liste = Fixkosten je Agent; nicht Gebrauchtes für Bau-Profile deaktivieren.
**K:** Schemas bereits deferred, «−85 %/55–134k» trifft dieses Setup NICHT: real ~4–7k, primär
Fensterplatz (Präfix gecacht); ZUERST 10-Min-Verifikation, ob selektive Deaktivierung je Kontext
ohne Davids claude.ai-Alltag geht; Ausnahmen: context7 (§16),
claude-in-chrome/Playwright, vercel-Deploy; Referenz-Plugins nie löschen.
DoD: Verifikations-Notiz; falls machbar: Namensliste messbar kleiner.

## §7 P5 Code-Struktur

**T13 §-Anker in grosse Logik-Dateien (mittel/S).** M: grep-bare Abschnitts-Kommentare in
gesetz-leser/inhalt.tsx (35 Commits/400), src/lib/zustaendigkeit.ts (Risikopfad),
ZustaendigkeitForm.tsx, src/lib/startseiteVorlagen.ts,
startseiteKarten.ts, src/lib/normtext/register.ts (SSoT); Grep landet präzis, Teil-Read via
offset/limit. E: ~10–25k je Session an diesen Dateien (Vollread 10–18k, oft mehrfach). R:
keines; Kommentare verhaltensneutral (golden + e2e beweisen). DoD: Anker in 6 Dateien; golden
+ e2e grün; Stichproben-Grep trifft.

**T14 Churn-Hotspots splitten, gestuft (mittel/L).** M: Stufe 1 inhalt.tsx (1199 Z.)
+ parts.tsx (660 Z., 23 Commits/400) in Module ≤200–300 Z. (UI; Netz: golden byte-gleich +
89 e2e; §6.6 deckt Splits >~800 Z.); Stufe 2 optional extrahiere-fedlex.ts (Churn 7/400
[korrigiert]) / ingest.ts: Risikopfad, volle adversariale Gegenprüfung. E: ~10–20k je Session, bedingt
durch KÜNFTIGE Edit-Frequenz (Churn = Vergangenheit). **K (Timing):** T13
sofort; Stufe 1 erst NACH der U-Kette (Worktree feat/u-verweis läuft JETZT dort;
Split jetzt = Konflikt-Kaskade); Vorbedingung T2-Frequenz-Beleg; Stufe 2 nur bei
nachgewiesener Frequenz, sonst dauerhaft T13-Anker. DoD: golden byte-gleich + e2e + §6-Beweis;
Stufe 2 mit check:gegenpruefung bestanden.

## §8 Reihenfolge/Abhängigkeiten

1. **Sofort nach Go (parallel, alle S):** T2 · T1 · T5 · T9 · T12-Stufe-1 · T17.
2. **Danach:** T7 (nutzt T1-Wächter) → T3 → T4 (bündelt die Konventionen) → T6 → T15.
3. **Bedingt:** T11 nach Fedlex-P1a/b · T19 nach T1 · T8 nach T4 · T16 nach T1/T3/T7 + Probelauf ·
   T10 nach Machbarkeits-Verifikation · T13 ausserhalb aktiver Worktree-Flächen ·
   T14-Stufe-1 nach U-Kette + T2-Frequenz-Beleg.
4. **Nicht ohne separates Go David:** T12-Stufe-2 (Required-Gefüge) · T14 (L) · T16 (CLAUDE.md) ·
   T10 (Account-Ebene).
5. Kein Punkt ändert Gate-Semantik/Prüfpflichten; Auto-Merge gilt je PR.

## §9 Verworfen

| Kandidat | Grund |
|---|---|
| Serena MCP | 20–30 Tool-Defs + Betrieb; T9+T8 decken es; 40-%-Claim = Anbieter; Overlap wie Graphify; Re-Test falls T8/T9 per T2 nicht reichen |
| claude-context/CodeGraphContext | externe Vektor-/Graph-Infra (Kosten/Wartung/Datenschutz) für Anbieter-Claims («120×»); T8/T9 decken es |
| Statusline-Kontextmonitor | headless Agenten sehen keine Statusline/kein /compact; Hebel in T1–T8 |
| Tool Search «einführen» | bereits aktiv (Schemas deferred, 0 projektseitige MCPs); ehrlicher Rest = T10 |
| Golden-Hash-Manifest/diff-first | Kapselung existiert (golden:diff/vergleich); Restrisiko deckt T5 billiger; Umbau am härtesten Gate = Risiko |
| CLAUDE.md-Radikaldiät (−91,9 %) | Sicherheits-Wirbelsäule der Daueranweisungen; Zahl anekdotisch; vertretbarer Kern = T16 |
| Generelle Fails-only-Filter | Kern umgesetzt (§1 «Schutz»); PostToolUse-Filter birgt Verschluck-Risiko (§6); Rest = T12/T17 |
| FAHRPLÄNE → Agent-Skills | Doppelstruktur+Dauerpflege für denselben Lade-Effekt; T3 leistet es zu S; Skills nur für Prozeduren |

## §10 Quellen

code.claude.com/docs/en/monitoring-usage · docs.claude.com/…/claude-code-analytics-api ·
docs.claude.com/…/prompt-caching · anthropic.com/news/claude-opus-4-5 ·
anthropic.com/engineering/multi-agent-research-system · github.com: ryoppippi/ccusage ·
ast-grep/ast-grep · yamadashy/repomix · aider.chat · arXiv 2602.11988 AGENTS.md (korr. aus
2605.10039) · 2602.13170 Hotspots (korr. aus 2602.20478) · 2602.20478 Codified Context (→T8) · tembo.io/blog/claude-code-subagents · GitHub-Docs linguist-generated ·
claude-code #23478/#22170 (rules-paths) · intern: 7 Berichte + 3 Lenses, Nachmessungen §1.
