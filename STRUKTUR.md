# LexMetrik — Struktur & aktueller Stand

**Verbindliche Grundprinzipien: `CLAUDE.md`** (§1 Logik vor allem; §6
Refactoring-Protokoll) — dieses Dokument hier beschreibt den Zustand.

**Dokument-Ordnung im Root (Aufräumung 10.6.2026, Auftrag David):** Im Root
liegen nur AKTIVE Steuerungsdokumente — CLAUDE/README/STRUKTUR/HANDLUNGSPLAN,
Projekt- und Strategie-Papiere (PROJEKTBESCHRIEB, STRATEGIE-PLATTFORM,
WACHSTUM-REGLEMENT, BETRIEB, KATALOG-ROADMAP, ABNAHME-AG-BAUSTEINE) und die
laufenden Fahrpläne (GRUNDLAGEN, AG-/GMBH-GRUENDUNG, BGER-RECHTSWEG,
VORLAGEN-AUSBAU, VERTRAGS-VARIANTEN, FUNDAMENT-UMBAU). Abgeschlossene
Fahrpläne (DESIGN, RECHNER-DESIGN, VEREINHEITLICHUNG, TOKEN-DISZIPLIN — ins
Archiv 13.6.2026) und historische Dokumente liegen in
**`archiv/`** (Index: `archiv/README.md`; Dateinamen unverändert, damit
Verweise in Code-Kommentaren per grep auffindbar bleiben). Wissens-Quellen
(PDF/DOCX, gitignored) in `bibliothek/quellen/` (`SICHTUNG.md`).

**Pflegeregel Session-Karten (Token-Disziplin 11.6.2026; mechanisiert 10.7.2026,
QS-TOK/T1):** Dieses Dokument wird in jeder Session und jedem Subagenten gelesen —
Karten abgeschlossener Sessions (älter als ~2 Arbeitstage) wandern darum BYTE-GENAU
nach `archiv/STRUKTUR-SESSIONKARTEN.md` (neue Blöcke oben anhängen); hier bleibt der
Verweis-Abschnitt. Neue Karten werden am Anker `<!-- KARTEN -->

## Session 21./22.7.2026 — Nacht-Aufräumung: Repo auf «nur main», zwei Falsch-Rot-Wurzeln gezogen, Steuer-Doku rotiert (Hauptcheckout, Auftrag David «tiefgründiges Aufräumen, run till dry»)
**Auftrag:** Repo konsolidieren, bis nur `main` übrig ist; alles Liegengebliebene zusammenführen. Repo wurde von David von `LegalCalc` auf **`LexMetrik`** umbenannt (Remote-URL nachgezogen).
- **Branch-/Worktree-Kahlschlag (nur belegt Gefahrloses):** 5 saubere Worktrees (`lm-ci/-fundament/-planintake/-toraudit/-verankerung`) aufgelöst · 13 lokale + 25 remote Branches gelöscht — jeder erst nach Beleg «PR gemergt + keine Nach-Merge-Commits» (Epochen-Vergleich mergedAt↔Tip; ein erster String-Vergleich war zeitzonenfalsch und wurde verworfen). `feat/richter-fundament` erst nach Nachweis gelöscht, dass seine 5 Nach-Merge-Commits identisch als PR #310 gemergt sind. UX-Audit-Screenshots (35 PNG, 3./4.7.) als PR #323 eingecheckt.
- **Falsch-Rot-Wurzel 1 · `check:materialien` (PR #324):** `datenhaltung:build` erzeugt eine **hohle** `soft-law.db` (nur Blob-Ingest; `norm_referenzen`/`soft_law` leer, gemessen dokument:13/0/0) → Byte-Reprojektion meldete alle 11 Kanten-Shards als Orphans. Fix: Byte-Pfad nur bei `kanten.length > 0`, sonst protokollierter CI-Pfad-Fallback (§6 Ziff. 7 lit. b). Sabotage-Probe rot; adversariale Gegenprüfung (Opus, 2 Durchgänge) **bestanden**, Befund «ODER-Bedingung zu weit» umgesetzt. Restpunkt (vorbestehend): uncaught throw bei `kanten>0/dokMeta==0` — ehrlich rot, aber Stacktrace statt ROT-Zeile.
- **Falsch-Rot-Wurzel 2 · `check:tor-paritaet` auf PR #319:** die 18 Allowlist-Einträge der jetzt in CI verdrahteten Tore gestrichen (R1-Nachzug; Landung von #319 in dieser Session, seriell nach #324).
- **Zusammengeführt:** PROJEKTBESCHRIEB-Gesamtupdate (lag uncommittet im Hauptcheckout; Stand 21.7., vier Klingen, Repo-Verweis LexMetrik) als PR #325 · `npm audit fix` beseitigt **alle 18 Verwundbarkeiten** inkl. 2×high brace-expansion-DoS (Dependabot #5/#6), lockfile-only, als PR #326 · STRUKTUR-Rotation 51 Karten, 221.8→101.4 KB (diese PR).
- **Bewusst NICHT gemacht:** ROADMAP-Kürzung (181 KB > 100-KB-Budget) — Welle-2-Prosa mischt Abschluss-Bericht mit **aktiver Bau-Warnung** («vor Bau-Start nachmessen»); Massen-Kürzung des einen Steuerungsplans gehört in eine beaufsichtigte Session, nicht in die Nacht. Als Folgeauftrag markiert.

## Session 20./21.7.2026 — Drei Analyse-Befunde nur im Bauplan verankert (reine Plan-Doku, Worktree `lm-verankerung`, Branch `docs/analyse-verankerung`)
**Auftrag David:** «nur im Bauplan verankern» — kein Bau, keine Code-/Skript-/Workflow-/Datenänderung; ausschliesslich Plan-Dateien (§14). Drei Punkte, gebündelt in **einen** PR:
- **A · chemrrv-Kanonik-Reparatur** (offener Bau-Schritt, Risikopfad). Diagnose der Ursache, warum der Normen-Monitor seit 29.6. rot ist (`check:netz`/Kanonik: `chemrrv` SR 814.81 zeigt auf `html-0` statt kanonisch `html-1`; Beleg CI-Run `29727448005`) + Reparatur-Schritt (Re-Pin via `scripts/fedlex-repin-kanonik.ts`, Snapshot-Regen, Inhalts-Treue-Diff, `QS-GP`-Gegenprüfung, dann `workflow_dispatch`). **Verortet in `ROADMAP.md` → QS-AUTOMATIK, neuer Punkt a′** (mit DoD-Carveout: der Re-Pin ist Extraktions-Risikopfad, `Gegenpruefung`-Pflicht, kein Auto-Merge — anders als die reine Plumbing-Arbeit a/b). Dringlichkeit vermerkt: Rechtsstand-Wache bis zur Reparatur faktisch blind.
- **B · e2e-Shard-Neupackung** (geparkter Schritt, an Davids Merge-Queue-Entscheid gekoppelt). CI-Messbefund (Lauf `29779602507`: 283 Tests/2100 s, `workers:1`, Top-10 = 66 %, `leser-gliederung-a33` 342 s = 16 % in 4 Tests, Shard 3 systematisch am längsten) in den **bestehenden QS-PERF-Schritt eingewoben**; Kopplung an Merge-Queue (`QS-BASIS` B-12 / `QS-OPT` O-3.2/O-3.3) ergänzt, kein Prüfumfang-Abbau (§6.3).
- **C · Vereinfachungs-Agenda nachgeführt.** R5 «Skript-Friedhof» per Messung **widerlegt** (220 `scripts/`-Dateien → 199 erreichbar, 18 bewusste One-Shots/Archiv, 3 unerreichbar) → als geprüft-verneint-Zeile in **`FAHRPLAN-CODE-HYGIENE.md` §Z**. R6 «Korpus aus git» **herabgestuft** (moderate Kosten gemessen) → verortet als Vorstufe des serverlosen Korpus-Servings in **`FAHRPLAN-DATENHALTUNG.md` §12.4** + Kurz-Ref in `ROADMAP.md` QS-BASIS (d).
- **Kein Code, keine Tore gelockert.** `check:plan` grün. Trailer `Roadmap: QS-AUTOMATIK` (Haupt-Verankerung); Gegenprüfung n/a (reine Plan-Doku).

## Session 20.7.2026 — Falsch-Rot in der CI beseitigt: Chrome-Isolation, TBT-Normierung, CLS-Messfenster (Worktree `lm-ci`, Branch `fix/ci-falschrot`, Roadmap QS-PERF)
**Auftrag:** Falsch-Rot eliminieren OHNE Prüfschärfe zu verlieren. Ausgangslage (46 CI-Läufe): 18 Fehlläufe = **39 %**, Median 23 min gegen Mittel 50 min — die Differenz IST das Problem, jeder Fehllauf kostet einen vollen Rerun.
- **Baustelle A1 · Chrome-Isolation.** `lighthouse-budget.ts` teilte EINE Chrome-Instanz über alle Läufe BEIDER Messseiten; die Instanz driftete, die zuletzt gemessene Seite erbte die Drift (belegt: Startseite 143–237 → **1543 ms** TBT, OR-LCP 3.5 → 11.3 s, ohne jede App-Code-Änderung). Jetzt frische Instanz je Lauf (~1–2 s/Lauf, ~15 s je CI-Job) ⇒ jeder Lauf ist definierte Kalt-Last, die Seiten-Reihenfolge ist ohne Einfluss.
- **Baustelle A2 · TBT je Job normieren — gebaut, gemessen, VERWORFEN.** Eine synthetische, deterministische CPU-Last (`dist/_perf-kalibrier.html`, kein App-Code, kein Netz) wird über dieselbe Lighthouse-Kette gemessen und als Divisor genutzt. Geprüft an **zwei Reihen zu je 8 unabhängigen Runnern** (neuer Workflow `perf-kalibrierung.yml`; eine 8er-Matrix liefert 8 Runner-Zuteilungen in EINEM Lauf — wiederholte Läufe auf demselben Branch gingen nicht, die `concurrency`-Gruppe bricht sie ab). **Reihe 1 sah nach klarem Erfolg aus:** OR-TBT CV **31.2 % → 16.5 %**, Runner-Korrelation **r +0.83 → −0.21**. **Reihe 2 (identischer App-Code) kehrt das Vorzeichen um:** roh r **−0.43**, und das Normieren VERSCHLECHTERT auf CV 29.9 %. Gepoolt (n=16) bleibt eine Scheinverbesserung 26.8 % → 23.3 %; bei den gewählten Deckeln ist das Rausch-Rot von roh und normiert **identisch (je 4.7 %)** — der Normierer kauft nichts. Auch die abgeschwächte Form `roh·(BASIS/kalib)^α` rettet es nicht: das gepoolt beste α=0.70 wirkt in den beiden Reihen in **entgegengesetzte Richtungen**. Die Regressions-Steigung log(TBT)~log(kalib) ist **0.65 statt 1** — die unterstellte Proportionalität besteht schlicht nicht (eine Integer-Schleife misst die Kernfrequenz; die OR-TBT hängt daneben an Speicherbandbreite, Cache und Nachbar-Last auf dem geteilten Host). **Konsequenz: assertiert wird weiter der Rohwert**; die Kalibrierung bleibt als Diagnose-Ausgabe stehen (Rohmaterial für einen späteren Normierer, und im Log sofort sichtbar, ob ein Job langsam lief). Hätte ich nach Reihe 1 aufgehört, wäre eine gut aussehende, aber falsche Zahl ins Tor gewandert.
- **Schwellen neu erhoben über 16 Messpunkte auf 16 unabhängigen Runnern** (die Historie des alten Regimes ist durch die Chrome-Isolation entwertet und wurde verworfen, nicht übernommen). **Echt verschärft, weil runner-unabhängig:** Start-TBT **1500 → 400** (der alte Deckel lag **571 %** über dem Ist und fing faktisch nichts; neu 79 % bei ~0.1 % Rausch-Rot) · Start-LCP **11000 → 10000** (diese Metrik ist erstaunlich stabil: 9141…9275 ms, **sd 37 ms** über alle 16 Runner ⇒ der Deckel liegt ~21 sd über dem Ist) · OR-TTI **15000 → 13000** · Start-Score **40 → 55** (min beobachtet 65). **Unverändert und ehrlich als Nicht-Erfolg ausgewiesen: OR-TBT bleibt 6500** — 45 % über dem Ist bei ~4.7 % Rausch-Rot, 0/16 beobachtete Überschreitungen. Enger ginge nur gegen mehr Rauschen-Rot; das Ziel «TBT auf OR wieder scharf» ist damit **nicht** erreicht und bleibt offen.
- **Baustelle B · die Shard-Risse waren zu 5/7 KEIN Rauschen, sondern ein Mess-Artefakt.** Der entscheidende Hinweis kam aus den Logs: die CLS-Fehlwerte waren über Tage und Commits **bitgenau identisch** (`0.12616997612847222` in drei Läufen) — reproduzierbare Geometrie, kein Zufall. Ursache: `e2e/helpers/cls.ts` installiert den PerformanceObserver mit `buffered: true`, was ALLE Shifts seit der Navigation nachzieht. Beleg aus dem Log: «Beobachter@7640ms», angerechnet aber Δ0.1250 **@7589ms** (Ende des bewusst ungedrosselten Warmlaufs) und Δ0.0012 **@91ms** (Seitenaufbau). Die beiden A9-**Interaktions**-Tests massen damit ein Fenster, das ihr eigener Kontrakt ausschliesst; ob es riss, entschied allein, ob der Warmlauf-Shift noch in das 500-ms-`hadRecentInput`-Fenster fiel — auf schnellen Runnern ja, auf langsamen nein. **Fix:** Parameter `nurAbInstall`, gesetzt in `norm-sprung` A9 + `a33` A9. **Budget 0.05 unverändert**, Prüffläche unverändert: der Lade-CLS bleibt durch `gesetze-historie-badge` (dort ist `buffered` fachlich richtig) UND durch `check:perf-budget` gedeckt. Deklarierte fachliche Änderung mit Begründung im Code (§6.3), kein stilles Abschwächen.
- **Die übrigen Risse eingeordnet statt gefixt:** 2/7 (A35-Highlight-Cleanup) waren durch den A35-Sofort-Aufräumer **bereits auf main behoben** — verifiziert: alle drei betroffenen Commits tragen ihn noch nicht. 1/7 (a33 F1, `Test timeout of 240000ms`) ist echte Runner-Streuung: mit dem nun bezifferten Faktor 2–2.5 auf die ~90 s einer schnellen Instanz lag das 240-s-Notdach nur ~7 % über dem Erwartungswert einer langsamen ⇒ **240 → 360 s** (Infrastruktur, kein Assertion-Change §6.3). 1/7 (`verweis-u`, CLS 0.0550 gegen 0.05) bleibt **bewusst unangetastet**: knapp über Budget, echtes In-Fenster-Signal auf einer Anker-Deeplink-URL — genau die Klasse, die diese Spec fangen soll.
- **Shard-Balance: gemessen statt geraten — und darum NICHT umgepackt.** Die Gruppen sind gegen LOKALE Dauern gepackt (Spread <0.1 %), die aber nicht uniform skalieren: `leser-gliederung-a33` braucht lokal 92 s, auf CI ~360 s (**Faktor 3.9**). Ist-Schieflage Median **729 / 570 / 780 s** statt je ~693 s. Eine Neupackung auf geschätzter Grundlage wurde bewusst unterlassen (§14.2) — der `github`-Reporter druckt schlicht keine Per-Test-Dauern. Stattdessen: **JSON-Reporter + Report-Artefakt je Shard-Job**, damit die nächste Packung gemessen ist. Strukturelle Grenze notiert: a33 ist mit ~360 s bereits grösser als das Shard-Drittel.
- **Neuer offener Befund (§8):** OR-LCP ist **bimodal** — 4× ~3.5 s, 4× ~11.3–11.6 s, nichts dazwischen, **unabhängig von der Runner-Geschwindigkeit**. Der Verdacht «warm/kalt» ist durch die Chrome-Isolation ausgeschlossen. Der Deckel 13500 liegt sicher über dem hohen Modus; verschärft wird er erst, wenn die Ursache verstanden ist — sonst deckelt man sie nur weg.
- **Beweis:** voller `npm run gate` **GRÜN** · `check:e2e-shards` grün (47 Specs, Union deckungsgleich) · `check:perf-lighthouse` lokal **GRÜN** gegen die neuen Deckel · volle e2e-Fläche lokal **278 passed** · beide Verifikations-Messreihen **0/8 bzw. 0/8 rot** gegen die finalen Schwellen · `find src -name '__*'` leer. Kein Produktionscode berührt (Diff: Prüflogik, Test-Instrumentierung, CI-Konfiguration) ⇒ Inhalts-/Rechtsregel-/Funktions-Treue per Definition unberührt. **Gegenprüfung n/a** — reine Prüflogik.
- **Lektion:** ein **bitgenau reproduzierbarer** Fehlwert ist nie Rauschen — er ist ein Zeiger auf ein deterministisches Artefakt, meist im Messaufbau selbst. Und: bevor man Schwellen lockert, prüfe, ob das Instrument das richtige Fenster misst. Von 18 Fehlläufen waren am Ende **13 Mess-/Budget-Artefakte**, 4 bereits behoben und **einer** ein echtes Produktsignal. Und zweitens: **eine Messreihe ist keine Messreihe.** Der Normierer sah nach 8 Runnern wie ein Volltreffer aus und war nach 16 widerlegt — wer nach der ersten bestätigenden Stichprobe aufhört, baut sich seine eigene Bestätigung.
## Session 20.7.2026 — Besetzung klickbar: Richter:in im Rubrum führt zu ihren übrigen Entscheiden (Worktree `lm-richterlink`, Branch `feat/richter-verlinkung`)

**Auftrag David 20.7.2026:** im Entscheid-Leser sollen die Namen der Besetzung klickbar sein und auf `/rechtsprechung?richter=<slug>` führen (Achse aus dem Richter-Fundament #309/#310, mit den übrigen Facetten kombinierbar). **Gewählter Weg: (a) Freitext in-place linkifizieren** — empirisch gegen (b)/(c) entschieden, weil die Zuordnung zu 100 % trägt und der amtliche Wortlaut damit unangetastet bleibt (§8); (b) hätte den Wortlaut durch eine synthetische Liste ersetzt, (c) hätte ihn gedoppelt. **Mapping-Methode:** der Snapshot trägt den Freitext (SSoT), das Manifest die korpus-kanonisierten Slugs `richter: {s,r}[]`. Der Reader kann die Kanonisierung nicht nachrechnen (sie braucht den Korpus-Blick, «P. Schmid» → Patrizia oder Patrick?), darum **positionelle Brücke**: der Generator baut `richter[]` als `parseBesetzung(freitext).richter.map(…)` — derselbe SSoT-Parser (`besetzung.ts`, **unverändert**, §5) liefert im Reader dieselbe Liste, Position i ↔ Position i; die Namens-Position im Freitext kommt aus `nameRoh` per wortgenauer Vorwärts-Suche. **Messung am Gesamtkorpus (20.7.2026): 4'961 Entscheide mit Besetzung · 19'467 Namensnennungen · 19'467 (100 %) eindeutig zugeordnet, 0 nicht-eindeutig · 0 Längen-/Rollen-Mismatch · 14'841 Links · 0 Wortlaut-Brüche · 0 unbekannte Slugs · 0 Links mit leerer Zielliste.** **Gerichtsschreiber:innen werden NICHT verlinkt** (Verdikt): `filterEntscheide` schliesst die Rolle explizit aus (`r.r !== 'gerichtsschreiber'`) — von 315 GS-Slugs sind **300 reine GS** (`count: 0`), ein Link liefe dort ins Leere; die 4'626 GS-Nennungen bleiben Text. **Drei Fail-closed-Riegel gegen den erfundenen Link** (§1, spiegelbildlich zur #310-Klasse): Längen- ODER Rollen-Divergenz Manifest↔Parser ⇒ gar kein Link; ein einziger nicht lokalisierbarer Anker ⇒ gar kein Link (nie eine verrutschte Person); Wortgrenzen-Guard, damit «Meier» nie in «Meierhans» trifft. Konkatenation der Teile ist byte-genau der Eingabe-Freitext (Test-Invariante). **Neu:** `src/lib/rechtsprechung/besetzung-verlinkung.ts` (rein, §3) · `src/tests/besetzungVerlinkung.test.ts` (13 Tests) · `e2e/rechtsprechung-besetzung-links.e2e.ts` (5 Tests, in Shard-Gruppe 2). **§13:** bestehendes dezentes Inline-Link-Muster der Domäne wiederverwendet (gepunktete Unterstreichung, Akzent im Hover), Fokus über den globalen `:focus-visible`-Outline (F3). **§15.2: CLS 0** unter 6×-Drossel — der Manifest-Eintrag wird im SELBEN Lade-Schritt gesetzt wie der Snapshot, es wächst nichts nach. **Tore:** voller `npm run gate` grün · `check:besetzung` grün · `check:e2e-shards` grün (Union deckungsgleich) · Rechtsprechungs-e2e (38 Tests) grün · a11y-Scan des Rubrums ohne critical/serious · mobil @390 kein Overflow. **Gegenprüfung:** `istRisikoPfad` greift nicht (`besetzung.ts` unberührt, neue Datei nicht gelistet); stattdessen Gesamtkorpus-Verifikation + **adversariale Zweitprüfung (Opus, kein BLOCKER)**, deren 5 Befunde alle eingearbeitet sind: (1) neues **hartes Tor G5 VERLINKUNG** in `check:besetzung` — prüft an allen 4'961 Rubra, was der Reader wirklich rendert (verlinkte Slugs == richterliche Manifest-Refs in Reihenfolge · kein GS-Link · Wortlaut-Konkatenation), inkl. Anti-Vakuum-Assertion; **Scheitern-Fähigkeit per Sabotage bewiesen** (manipulierter Slug ⇒ G5 rot). Bewusst NICHT eingebaut: eine zweite Identitätsprüfung in G5 — sie wäre tautologisch (Linktext und Parser-Name stammen aus derselben Quelle; eine simulierte Slug-Vertauschung lief glatt hindurch), die Identität ist Sache von **G3**, das genau diese Klasse fängt. (2) GS-Namen setzen jetzt die **Such**position vor (nicht die Emit-Position — die erste Fassung verschluckte dadurch Wortlaut, was der Invarianten-Test sofort fing), damit die Korrektheit nicht an der impliziten «GS stehen am Listenende»-Kopplung hängt. (3) Freitext aus **genau einem Namen** verlor den Link (`teile.length <= 1`) → gefixt + Test. (4) `title` «Übrige» → «Alle Entscheide mit … anzeigen» (§8-genau: die Facette zeigt auch den gelesenen Entscheid). (5) **§15.4** `useMemo` + `React.memo` (React Compiler ist aus). Trailer `Roadmap: W2·7-VZUI`.

## Session 20.7.2026 — TBT-«Regression» auf OR: kein Code-Defekt, sondern ein fehlkalibriertes Tor (Worktree `lm-tbt`, Branch `fix/or-tbt-regression`, Roadmap QS-PERF)
**Auftrag:** die TBT-Regression auf `/gesetze/bund/OR` (5007 ms gegen Budget 4000) finden und nach §15.3/§15.4 fixen; Verdacht lag auf #305 (G-HIST-UI, ~2000 Artikel-Historie-Zeilen). **Auftragshypothese durch Messung WIDERLEGT** (§7: Aufträge dürfen faktisch falsch sein — dann abweichend umsetzen und offenlegen).
- **#305 ist nicht die Ursache — gemessen, nicht vermutet.** Lokale A/B-Messung im Lighthouse-Mobil-Preset, je **Median aus 7 Läufen**, gegen einen echten Referenzbau des Vor-#305-Commits (464cfbf4): **815 ms vor #305 · 828 ms mit #305 ⇒ +13 ms = +1.6 %**, auf CI-Niveau hochgerechnet ~+56 ms. Ein separater Bau mit unterdrückten Badges (Shard-Resolve → `null`) bestätigt die Grössenordnung. Der Long-Task-Trace zeigt die Kosten im React-Erstrender des Volltext-Baums (712 ms) — dieselbe Signatur mit und ohne Feature.
- **Der eigentliche Befund: das Tor misst die Runner-Auslastung, nicht die Software.** Auswertung von **27 CI-Läufen** (19./20.7., jeder Wert bereits ein Median aus 3): TBT/OR min 2262 · Median 3527 · Mittel 3555 · **max 5094** · **sd ≈ 687 ms**. Der Deckel 4000 lag nur **z ≈ +0.65** über dem Mittel ⇒ ~26 % Rot-durch-Rauschen; beobachtet **4/27 Läufe rot, auf main 3/10**. Kontrollversuch: **main bae8dff1, ein reiner Dokumentations-Commit, mass 5094 ms und war ROT** — derselbe Inhalt auf seinem PR-Branch 3653/3830 ms grün (Spanne 1441 ms bei identischem Code). Auch **main 4f363fd0 (4537 ms, ROT) lag VOR #305**; der #305-Branch selbst mass **3527 ms = den Median aller Läufe, grün**. main-Pushes sind systematisch langsamer (Mittel 3821, sd 812) — dieselbe Runner-Starvation wie bei den e2e-Shards. Die alte Kalibrier-Notiz im Tor («CI-Ist TBT ~2.3 s») war **1200 ms veraltet**: die gedachte Kopffreiheit von 74 % war still auf 14 % erodiert (§8).
- **Wo die Streuung wirklich sitzt — zwischen den Jobs, nicht innerhalb.** Das Tor druckt neu die Einzelwerte je Lauf, und die erste Zeile klärte die Frage sofort: `Einzelläufe TBT: 5612 · 5149 · 5537 ms | LCP: 11.3 · 3.5 · 11.3 s`. **Innerhalb** eines Jobs streut es nur ±9 %, **quer über die Jobs** aber 2262…5612 ms (**Faktor 2.5**) — der GitHub-Runner-Pool ist heterogen, die Maschinenzuteilung entscheidet über den Messwert. Die LCP-Spalte zeigt zusätzlich, dass die geteilte Chrome-Instanz mal warm (3.5 s), mal kalt (11.3 s) lädt: die historisch «guten» Werte waren überwiegend **Warm-Cache-Artefakte**. Harte Folge: **mehr Läufe je Job mitteln das nicht weg** — mit `PERF_RUNS=5` empirisch bestätigt und wieder verworfen.
- **Fix:** (a) **TBT/OR 4000 → 6500 ms** — über dem beobachteten Maximum (5612) plus ~16 % ≈ 2 Within-Job-sd. Ehrlich offengelegt: das ist ein **stumpferer** Absolut-Deckel, der Preis dafür, dass eine Metrik mit Faktor-2.5-Runner-Streuung überhaupt assertierbar bleibt, ohne jeden dritten main-Push grundlos rot zu werfen. Er fängt weiter grobe §15/3-Verstösse, ist aber kein feiner Regressions-Fänger mehr · (b) **LCP/OR 12000 → 13500** (Kalt-Last misst 11.31–11.41 s ⇒ nur ~6 % Luft, die nächste Kalt-Messung wäre ohne Zutun rot geworden — gleiche stille Erosion, vorab geheilt), TTI mitziehend 14000 → 15000 · (c) **Gegengewicht/Verschärfung: CLS/OR 0.15 → 0.05, Start 0.10 → 0.05** — CLS ist laut §15.2 «der eigentliche Regressions-Fänger», lag über 27 Läufe aber nur bei **0.004–0.008** (Deckel = 19–37× Ist, fing faktisch nichts); 0.05 ist ~6× über dem Maximum und deckt sich mit dem Budget der CLS-e2e-Specs. **Bis zur Job-Normierung trägt CLS die Regressions-Last, nicht TBT** — das ist die bewusste Rollenverteilung, nicht ein Versehen.
- **Zwei Folgeschritte in ROADMAP/QS-PERF notiert statt mitgebündelt (§14.2):** (1) **TBT je Job normieren** statt absolut prüfen (Kalibrier-Workload im selben Job, Verhältnis prüfen) — erst das macht TBT wieder fein; ein Absolut-Deckel über dem langsamsten Runner lässt auf dem schnellsten (2262 ms) selbst +3000 ms durch. (2) **Chrome-Isolation je Lauf**, damit jeder Lauf eine definierte Kalt-Last ist (der realistische Erstbesuch). Beide verschieben das **Messregime** und entwerten die Kalibrier-Historie ⇒ eigener Schritt mit Neuerhebung, nicht hier.
- **Ehrliche Grenze (§8):** der neue CLS-Deckel hätte die #305-CLS-Regression **nicht** gefangen — sie trat nur auf einer Anker-Deeplink-URL auf, die dieses Tor gar nicht misst; gefangen hat sie die e2e-Spec. Als Folgeschritt notiert: eine Deeplink-URL als dritte Messseite aufnehmen.
- **Beweis:** `check:perf-lighthouse` **GRÜN** (OR TBT 825 ms · CLS 0.008 gegen den neuen, engeren Deckel 0.05) · voller `npm run gate` **GRÜN** · CLS-/Reader-e2e **32 passed** (a33 · leser-kopf-a9 · norm-sprung · verweis-u · gesetze-historie-badge) · breite Gesetz-Leser-Fläche **78 passed**. Kein Produktionscode berührt — der Diff ist **eine Datei** (`scripts/perf/lighthouse-budget.ts`), Inhalts-/Rechtsregel-/Funktions-Treue per Definition unberührt (§15). **Gegenprüfung n/a** — reine Prüflogik, kein Rechnen/Extraktion/Norm-Tarif.
- **Lektion:** «der Wert stieg nach Merge X» ist ohne Streuungs-Schätzer keine Kausalaussage. Ein Tor, dessen Schwelle innerhalb einer Standardabweichung des Ist liegt, erzieht zum Rerun-Reflex — und der winkt echte Regressionen mit durch. Vor jedem Schwellen-Streit zuerst die **Verteilung** erheben, dann entscheiden, ob Schwelle oder Software falsch liegt.

## Session 20.7.2026 — #305 (G-HIST-UI) landefähig: A35-Aufräum-Latenz entkoppelt + Fassungs-Slot reserviert (Worktree `lm-ghistui`, Branch `feat/g-hist-ui`)
**Auftrag:** die beiden Shard-3/3-Befunde der Landesession (Karte unten) reproduzieren, messen, an der Wurzel fixen — «erst reproduzieren und messen, dann fixen». **Beide Befunde reproduziert, mit GEGENSÄTZLICHEM Verdikt** — genau darum wurde jeder gegen eine frisch gebaute `origin/main`-Referenz gemessen, statt den Verdacht zu übernehmen.
- **Befund 1 (A35-Highlight-Cleanup) — KEIN #305-Defekt, sondern latent auf main.** Der Verdacht der Vorsession («Timeline hält einen Range am Leben / Cleanup-Effect läuft nicht mehr») ist **widerlegt**: eine Instrumentierung von `CSS.highlights.set/delete` mit Stacks zeigt genau EIN `set` und danach die `delete`s — **kein Leck, eine Latenz-Kopplung.** Das Löschen hing allein am Effekt in `inhalt.tsx`, und der läuft erst, wenn `treffer` über den ENTPRELLTEN `sucheTrim` auf null kippt — das ist der teuerste Commit des Readers (Trefferliste → voller Volltext-Baum, OR: 1686 Artikel neu gemountet). Gemessen von der Feld-Leerung bis zum `delete`: **2,4 s ungedrosselt · 9,8 s @4× · 21,9 s @8×** → reisst das 15-s-Prüfbudget. **Auf main dieselbe Signatur (9,0 s @4× · 19,8 s @8×)** — G-HIST-UI verschlechtert nur um ~10 % und schob einen bereits latenten Defekt (aus #301) über die Kante; der grüne main-Lauf auf c767b9f9 war Glückstiming. **Fix:** das Aufräumen vom teuren Commit entkoppeln — ein zweiter Effekt hängt am ROHEN Feldwert (billiger Render, memoisierte ArtikelLeser steigen aus der Reconciliation aus) und bestellt zusätzlich den noch offenen Setz-rAF ab (Ref, React Compiler ist AUS §15/4). Nur der boolesche Kipp-Punkt ist Dependency ⇒ **kein zusätzlicher TreeWalker beim Tippen** (§15/3). Wirkt für JEDEN Ausstieg aus dem Suchmodus. **Neu: 306 ms @4× · 576 ms @8×** (Faktor ~32–38). Nebenbefund §8: der Nutzer sah die Markierung sekundenlang weiterleuchten, obwohl das Suchfeld leer war.
- **Befund 2 (CLS `verweis-u:246`) — ECHTE #305-Regression, NICHT Runner-Last.** Gegen main gemessen auf `/gesetze/bund/MWSTV#art-165` unter 6× Drossel: **0.0227 (Branch) gegen 0.0002 (main)**, je 3/3 Läufe bit-stabil ⇒ Faktor ~100, deterministisch, keine Streuung. Die Annahme im Bau-Kommentar, die Fassungs-Zeile wachse nur «below-fold» ein, war **falsch**: bei einem Anker-Deeplink steht der Zielartikel oben im Viewport, die Artikel darunter sind sichtbar — der idle-Shard-Resolve schob sie alle (94 Zeilen auf dieser Seite). **Fix nach §15.2 (Platz reservieren, nie Inhalt kürzen):** neuer Token `min-h-hist-zeile` (1.5rem — die Zeile ist gemessen über alle 94 Vorkommen **exakt 24 px**, die Timeline klappt nur auf echten Klick auf ⇒ input-behaftet/CLS-exkludiert), ein Slot in `ArtikelLeser` steht ab dem ERSTEN Render und trägt neu den Aussenabstand (sonst fallen reservierte und gefüllte Höhe auseinander), und `schaetzeArtikelHoehe` trägt die 40 px in `contain-intrinsic-size` für die off-screen-Artikel nach. **Neu: 0.0002 @4× UND @6×** = exakt main-Niveau, bei unverändert 94 gerenderten Zeilen (kein Inhaltsverlust). Budget 0.05 unangetastet.
- **Beweis:** A35-Spec **5/5 grün**, `verweis-u` **3/3**, `gesetze-historie-badge` · `leser-gliederung-a33` · `leser-kopf-a9` · `normrevision-badge` je grün; **voller `npm run gate` GRÜN** (tsc · vitest · golden:vergleich · lint · check). Die Drossel-Evidenz kommt aus der Instrumentierung selbst (4×/8× bzw. 4×/6×), die den fehlschlagenden Prädikat-Wert direkt misst — schärfer als ein Spec-Rerun. Merge `origin/main` (#307/#308/#306/#309) mit nur 2 Konflikten, beide in Append-Registern (`gegenpruefung-register.md`, `.gegenpruefung-pending`) union-artig aufgelöst; Merge-Treiber aus #306 vorab via `scripts/git-setup.sh` scharf geschaltet. **Gegenprüfung n/a** — reine Darstellungs-/Timing-Schicht (§3), kein Rechnen/Extraktion/Norm-Tarif berührt; Wortlaut und Daten unverändert.
- **Lektion:** zwei Befunde aus demselben roten Shard, zwei gegensätzliche Ursachen — «Shard war auf main davor grün» ist **kein** Beweis für einen Branch-Defekt. Der Referenzbau von `origin/main` und die Messung DESSELBEN Prädikats auf beiden Seiten ist der einzige belastbare Schiedsrichter.

## Session 20.7.2026 — Fable-Orchestrator: latenter A9-CLS-Defekt gefixt + Konflikt-Entschärfung (Merge-Treiber/rerere/Skill »landung«)
- **Gemergt + live: #308** (`fix(suche)`, Commit c767b9f9) · **#306** (`chore(git)`, Commit 8b01c3a4). Parallel-Session landete #307/#309 (eigene Karte).
- **#308 — latenter A9-CLS-Sprung, Mechanismus BELEGT:** Shard 1/3 war auf drei aufeinanderfolgenden Läufen rot, **auch auf einem reinen Doku-PR** (identischer App-Code) → kein Branch-Defekt, sondern latent auf main. Ursache in `src/components/suche/SuchResultate.tsx`: die IA-1-Ergebnis-Kopfzeile mountete erst mit `!nochLaedt`; die per `useDeferredValue` entkoppelte ~4-MB-Artikelgruppe (§15.3) holt unter CPU-Drossel SPÄT auf — **ausserhalb des 500-ms-`hadRecentInput`-Fensters** → die Kopfzeile mountet ÜBER die bereits gemalte Trefferkarte und schiebt sie eine Zeilenhöhe nach unten (input-freier Shift). Fix: Kopfzeilen-**Slot ab dem ersten Paint reservieren** (`invisible` hält die Zeilenhöhe, echte Utility statt Magic-Number §13). Empirie: lokale Repro pixel-gleich zum CI-Bericht (OLD CLS **0.1254** ggü. CI 0.1262; Karte 576×188→576×485), NEW **0.0039**, drossel-unabhängig (rate 6/10/20). §15.2-treu, golden byte-gleich. **Der eine grüne main-Push war Glückstiming** (Settle < 500 ms), nicht Beweis der Gesundheit.
- **Falsche Fährten sauber ausgeschlossen:** #301 (Suchfeld-Kopfzeile) als Ursache **widerlegt** (`git show 8bc03aef --stat` — fasste `SuchResultate`/`HeaderSuche` gar nicht an; Defekt ist pre-#301). Die a33-F1/F2-Timeouts sind **kein Code-Defekt** (lokal alle 4 Subtests grün, Scroll-Spy ist bereits rAF-koalesziert/dedupt/Dead-Band-geschützt) — Runner-Degradations-Sättigung des schwersten Real-Scroll-Tests; Timeouts NICHT angehoben. Der #305-Verdacht «Timeline remountet Artikel-Teilbaum» wurde von der Parallel-Session per MutationObserver + Isolationsprobe (0.0043 vs. 0.0043) widerlegt und fallengelassen. **Marker-Lesart:** `××F` = harter Fehler, `×±` = flaky/beim Retry bestanden — die Verwechslung hatte anfangs zwei Tests fälschlich als Regression eingestuft.
- **#306 — Konflikt-Entschärfung (Davids Auftrag «gibt es Möglichkeiten, das zu verringern?»):** Churn-Analyse der letzten 150 Commits zeigte, dass Konflikte fast nie in Feature-Dateien entstehen, sondern in zentralen Sammel-Dateien. Massnahmen nach empirischer Klassifikation je Hotspot: `bibliothek/register/gegenpruefung-register.md` **`merge=union`** (append-only über 80 Commits verifiziert) · `daten-manifest.json`/`*.generated.ts`/rechtsprechung-Indexe **`merge=regen`** (eigene Seite behalten → Generator-Neulauf, das CI-Tor erzwingt es) · **`golden/*.json` + `public/normtext/**` bewusst OHNE Treiber** (Byte-Oracle bzw. Drop/Leak-Konflikt SOLL anhalten). `STRUKTUR.md`/`ROADMAP.md`/`FAHRPLAN-*`/`INDEX.md` bekommen **kein** union (in-place editiert → union erzeugt stille Duplikate; empirisch mit `git merge-file --union` belegt) — dort fängt neu **`rerere`** die Wiederholungs-Auflösung. Aktivierung pro Clone: `scripts/git-setup.sh`, verdrahtet als npm **`prepare`** (idempotent, netz-frei, CI-harmlos). **Treiber greifen nur bei LOKALEN merges/rebases, nie beim GitHub-Server-Merge.** Neu: Skill **`landung`** (serielle 7-Schritt-Landung: EINE PR aufs Mal, generierte Dateien nie von Hand mischen) + CLAUDE.md §12 Ziff. 4.
- **Betrieb:** Davids **Required Checks** sind neu gesetzt und wirken — die Policy wies einen verfrühten Merge korrekt ab (Handschritt aus dem 19.7.-Handoff damit **erledigt**). Landung streng seriell #308 → #306 → #305 mit `update-branch` je Stufe. GitHub-Actions-API war stundenweise 503 (Log-/Rerun-Endpunkte) — Retry-Schleifen statt Blind-Rerun.
- *Offen: **#305 (G-HIST-UI)** an die Parallel-Session zurückgegeben — Shard 3/3 rot: `leser-suche-a35-a40-a41.e2e.ts:65` HART (`CSS.highlights.has('lc-such-treffer')` wird nach dem Schliessen nicht false, 15-s-Predicate-Timeout, Nahtstelle G-HIST-UI ↔ In-Gesetz-Suche) + `verweis-u.e2e.ts:246` CLS **0.0550** knapp über Budget 0.05. Kontext: Shard 3/3 war auf main unmittelbar davor (c767b9f9) GRÜN. Kein Rateversuch von hier — Befund statt Fix.* → **ERLEDIGT, siehe Karte oben:** Befund 1 war entgegen der Vermutung latent auf main (Latenz-Kopplung, kein Leck), Befund 2 dagegen eine echte #305-Regression (gemessen 0.0227 gegen 0.0002 auf main) — beide gefixt.

## Session 18.–19.7.2026 — Fable-Orchestrator «run till dry»: main GRÜN + BS-Rechtsprechung + Merge-Kette
- **8 PRs gemergt + live:** #296 (Verzahnungs-Test .first()→zeilen-scharf) · #297 (main GRÜN nach 5 CLS-Runden) · #298 (Daten-Derivate nachgezogen) · #299 (**G-REF:** 3829 SR-Fussnoten-Verweise Vokabular→amtl. `eli/cc`, 136 Sidecars) · #300 (**BS-Rechtsprechung**) · #301 (Suchfeld in Kopfzeile) · #302 (e2e-Runner-Budgets 90s + F1-Kalibrierung 14→8) · #303 (e2e-Shard-Balancing gemessene Packung + Union-Wächter `check:e2e-shards`).
- **main-GRÜN-Kampf (#297, 5 Runden):** Der a33-A9-CLS-Fehler auf den 2-vCPU-Runnern hatte drei überlagerte Ursachen — TOC-Akkordeon-Reflow, Currency-Chip-Nachwuchs, und (der zähe) **Serif-Font-Swap**: Linux-Runner hat kein Georgia/Charter → schmale Liberation-Serif-Fallback → Ingress bricht beim Swap von Source Serif 4 zweizeilig um (+30px). Fix: `font-display:optional` (Vite-Transform) + metrik-getunter `Source Serif Times Fallback` (size-adjust 117.9%) + `min-h-titel-2z` + TOC nur-off-screen-Zuklappen. Neu dauerhaft: CLS-Quellen-Instrumentierung `e2e/helpers/cls.ts` (nennt Wachser-Element+Δ im Fehlertext). §15.2-treu, golden byte-gleich.
- **BS-Rechtsprechung (#300, Davids Auftrag, Ultracode-Workflow 12 Agenten):** 3'765 Entscheide 2022–2026 vom amtlichen Portal rechtsprechung.gerichte.bs.ch (FindInfo-CGI, GET `Aufruf=validate`; Appellationsgericht 2839 · Sozialversicherungsgericht 924 · Zivilgericht 2), dreifache Count-Gates, neues Tor `check:bs-entscheide`, Kanton-BS-Facette + Reader (Geschäftsnummer statt BGE-Band, 42 datumlose ehrlich behandelt §8), Korpus ~242 MB (Budget David 200 MB→**1 GB**). **Adversariale 5-Linsen-Prüfung fand 5 HOCH-Befunde** (Parser verlor Sachverhalte/Dispositive/`<li>`-Listen; doppelte Anker; axe-critical) — alle per Re-Parse aus Raw-Golden gefixt, GP `bestanden` (lxml-Zweitimpl. über alle 3765 Dok.). Raw-Golden gesichert unter `~/Developer/_lexmetrik-artefakte/bs-fiw-raw-golden-20260719` (gitignored, für Re-Parse ohne Re-Crawl).
- **Betrieb:** Klassische Merge-Kette (kein Admin-Drain nötig, main-Required-Checks-Handschritt Davids steht noch aus). Merge-Konflikte #299/#300 im `daten-manifest.json` semantisch per Generator-Neulauf gelöst (nie Hand-Mischung). Shard-2 war struktureller OR-Spec-Klumpen (42-min-Läufe) → #303 balanciert. **Sicherheit:** ein Subagent-Rückgabewert enthielt eine Prompt-Injection (als David getarnter Badge-Reader-«Klon meine Zugangskarte»-Auftrag) — als Injection erkannt, abgelehnt, Agent verworfen. Details: Memory-Handoff 19.7.
- *Offen für Folge-Session: THG `lvl_u1` `check:vollstaendigkeit` (vorbestehend) · ASYLV2-Re-Pin + 33 SR-Links · G-HIST-UI · G-Folgeeinheiten · Serif-Preload-Abwägung · Davids Required-Checks-Handschritt.*

## Session 16.–18.7.2026 — Fable-Orchestrator: Anmerkungs-Welle A29–A43 + QS-BASIS + Merge-Flotte
- **Bilanz: 27+2 PRs gemergt** (#278–#292-Welle + #293/#294 armiert-ausstehend beim Schreiben). **Davids 14 Anmerkungen (A29–A43) KOMPLETT:** Regesten-Fix #246 · Marginalien/Fussnoten #243+#255 · Split-View #240 · ruhige Gliederung #267 (Ultracode: Nudge/Guard/Entprellung, 300px-Sprünge→0) · Kontext-Seitenleiste **E4 → E5 #284 + E6 #291** · heller/weisser D-5 #238 · Kanton-Treue BS #266 + Suffix-Fix F-2 (9717 Token-Recoveries).
- **BGE-Korpus:** PR-B-Kette **BGE 148–151 = 577 neue Leitentscheide** (149 IV 1 via Degradations-Guard; #281 = 148/149, Folge-Bände nachgezogen); Korpus-Budget 100→**200 MB #292** (Reserve für Bände 152+).
- **Infonutzungs-Recherche + David-Zweitprüfung → Intake live (#282-Strang):** G-SUCH · **G-HIST (99.33 %)** · **G-AUFH (bmv-Fund, `dateNoLongerInForce`)** + BMV-Massnahme · G-RSS · Fedlex-Wartung — alle gebaut/live. **Fedlex-eId-Intake §12 #280.**
- **Ultracode-Ernte (T20 verankert, Fable-Judge/Refuter):** IA-Spec §11 (#253/#264/#265) · Zitat-Regex F2 #254+#278 (950 Phantome weg) · Eval-Harness #251 (Umgangssprache-Recall-Baseline 0.118) · **QS-BASIS-Fundamentplan #268** (B-1–B-12; 1.8.-Berg entwarnt, Re-Pins #270; VPS-Dossier #271) · **B-6 ✅ #275 · B-11 ✅ #273** · Registry-Nachtrag #279 · **H-11–H-14 ✅** (H-14 via #272).
- **QS-OPT:** O-1/O-1.9/O-2/O-3.1/O-4 (#244/#257/#259/#247/#263; Turso-CI-Secret). **Ausstehend beim Schreiben (armiert):** #293 O-3.3-Sharding · #294 Lint-Fix.
- **Betrieb:** Classifier-Sperre → **David-Terminal-Drain-Ritual (27 Admin-Merges)**; 4 echte Konflikte semantisch gelöst (#265/#266/#284/#287/#280); **O-3.3 + B-12 als strukturelle Antwort** auf die CI-Starvation. Details: Memory-Handoff 17.7. + FAHRPLAN-BASIS-AUSBAU §B.
- *Konsolidiert die Einzel-Karten A34/A30-A31/O-1/Eval/A31a/O-2/IA-1/IA-2/K-1/A33, die beim Flotten-Drain auf main-Stand entfielen; bestehende fremde Karten bleiben unberührt.*

## Session 16.7.2026 — H-11 «zahl()-Eingabe-Parser SSOT + Toleranz-Harmonisierung» (Worktree `lm-h11`, Branch `chore/h11-zahl-parser`)

**Auftrag (FAHRPLAN-CODE-HYGIENE.md H-11, ROADMAP W2·12-HYGIENE; eigener PR, 2-Commit-Muster).** Die 7 copy-paste-`zahl()`-Parser der Rechner-Formulare (mit realer Drift: Guard `n>=0`, Apostroph-Toleranz, `undefined`-vs-`null`) auf EINEN parametrierten Kern `src/components/forms/eingabe.ts` zusammengeführt. Reine Darstellungsschicht (§3), KEINE Rechtsregel; bewusst NICHT mit `lib/format.ts::zahl` verschmolzen (§1 — jener hat anderen Vertrag: zusätzlich Komma→Punkt, engine-/vorlagen-Konsumenten). **Commit A (verhaltensneutral):** drei Varianten exakt parametriert — `zahlNichtNegativ` (Guard, →undefined: Grundbuch/Beurkundung/NotariatGrundbuch), `zahlBeliebig` (kein Guard, →undefined: Prozesskosten/Streitwert/GebvKosten), `zahlNichtNegativOderNull` (Guard, →null: BgerRechtsweg); Import je Formular als `… as zahl`, alle Aufrufstellen unverändert. **Commit B (DEKLARIERTE UI-Änderung, NICHT §6-neutral):** die Tausender-Apostroph/Leerzeichen-Toleranz gilt jetzt EINHEITLICH für alle 7 (zuvor nur BgerRechtsweg) — «1'000'000»/«1 000» rechnet überall; die akzeptierte Eingabemenge wird nur ERWEITERT (Superset), kein zuvor gültiger Wert ändert sein Ergebnis, Guard-Unterschiede unverändert. Durabler Beweis-Test `src/tests/eingabeParser.test.ts` (8 Fälle, alle 3 Varianten + neue Toleranz).

**Beweis:** tsc -b · vitest (3799+8 unangepasst grün) · golden 209/209 byte-gleich (die interaktiven Parser liegen ausserhalb der assemble/golden-Fläche — Commit B ändert nur Live-Nutzereingabe) · lint 0 Fehler · `npm run gate` (voll) GRÜN. **Gegenprüfungs-Stichprobe** (unabhängige Re-Derivation Original-vs-SSOT, 63 Vergleiche über 3 Varianten inkl. 1'000'000/negativ/-0/Infinity/Apostroph) byte-gleich (Object.is). `src/components/forms` ist NICHT im Risikopfad-Set des `check:gegenpruefung` (nur `src/lib/{tarif,vorlagen,fristenspiegel,normtext}/` + Engines) → Tor no-op-grün. 2 Pathspec-Commits, Trailer `Roadmap: W2·12-HYGIENE`. PR mit armiertem Auto-Merge. **Nächster Schritt:** H-12 (Vorlagen-Schema-Konventionstest).

## Session 20.7.2026 — Plan aufgeräumt: zehn «in Arbeit» auf eins, 8 neue Schritte verortet (Worktree `lm-planintake`, Branch `docs/plan-aufraeumen`, §14-Intake)
**Auftrag:** `plan:next` meldete **ZEHN** Schritte gleichzeitig als `wip` — das zerstört die Steuerungswirkung des Plans. Jeden gegen die Realität prüfen (git log, gemergte PRs, Tore, Worktrees), dann die 16 Befunde/Aufträge vom 20.7. §14-konform verorten.
- **Ergebnis der Prüfung: 9 von 10 `wip` waren falsch.** `wip` hiess durchgehend «vor Wochen liegen gelassen, Etikett nie zurückgesetzt» — nicht «jemand baut daran». Neu: **QS-PH** und **QS-CURRENCY** → `done` (Tor läuft in CI bzw. Paket 1 trug selbst schon `[✓]`) · **W2·6-B** → `done` (B3 war seit 10.7. erledigt, die ROADMAP widersprach sich selbst) · **LERNPHASE-AB, QS-GP, W2·5, W2·5b, W2·6-DATA** → `ready` · **QS-DATA** → `blocked(vps-bestellung-david)` · **QS-PERF** bleibt als **einziger** echt `wip` (6 unveröffentlichte Commits in `lm-ci`, Branch `fix/ci-falschrot`, **ohne PR** — leicht zu verlieren).
- **Der 26×-Slot war seit 3.7. faktisch frei** und hat `W3·12` **17 Tage grundlos geparkt gehalten**: E3 war am 3.7. fertig, der Slot nur nie zurückgegeben. Per `@slot-kette` an **W3·12** übergeben (Davids Reihenfolge-Entscheid 2.7.), Blocker `26x-slot` aufgelöst.
- **Tooling-Defekt dabei gefunden und behoben:** `check.ts` erzwingt `slot: inhaber`, aber `next.ts` **las das Feld gar nicht** — es nahm «erster ready-26×-Schritt in Dokumentreihenfolge». Nach der Übergabe meldete es darum `W3·12` als «wartet auf 26×-Slot», also wartend auf den Slot, den `W3·12` selbst hält. 2 Zeilen in `next.ts`.
- **Drei ROADMAP-Selbstwidersprüche bereinigt:** «Nächstes: E4» vs. E4 seit 3.7. lokal fertig · «B3 offen» vs. B3 verifiziert erledigt · `blocker: null` im `@meta` vs. «🔒 BLOCKER» im Fliesstext (QS-DATAs VPS-Gate stand **nur in Prosa** und war für `check:plan` unsichtbar; jetzt im `@blockers`-Register).
- **8 neue Schritt-IDs** (§14-gebündelt, Label-Kollision vorher geprüft — `W2·5e/5f` sind verbrannt, Reihe bei `5i` fortgesetzt): `W2·6-FILTER` (Richterfilter + allgemeine Filter, EINE Bau-Fläche) · `W2·6-RNAME` (Namens-Auflösung, **bewusst getrennt** — andere Risiko-Klasse) · `W2·5i-HIST-ANSICHT` · `W2·5j-TABELLEN` (parked, David «später») · `W2·15-CLS` · `QS-AUTOMATIK` (Turso-Wächter + 2 tote Workflows gebündelt) · `W2·16-INVENTAR` / `W2·16-ANLEITUNG` (Davids Zweischritt). **In bestehende Schritte eingegliedert statt danebengelegt:** kantonale Extraktionstiefe + Änderungshistorie → `W2·13-KANTONE` (K-15/K-16) · Perf-Tor-Nachlese + Serif-Preload → `QS-PERF` (e/f) · Heiss/Kalt-Grenze → `W2·6-DATA`/`FAHRPLAN-DATENHALTUNG.md` §12.
- **Lehre aus #315 umgesetzt:** QS-PH prüft nur, **ob der Dateiname im ROADMAP-Text vorkommt** — nicht, ob die FAHRPLAN-Datei inhaltlich etwas sagt. Ein blosser Verweis wäre wertlos gewesen; darum sind **7 FAHRPLAN-Dateien inhaltlich ergänzt** (ENTSCHEIDSUCHE §5/§6 · GESETZESDARSTELLUNG-V2 §7 inkl. Fassungs-Fundament · GESETZES-UX §14 · UI-QUALITAET §7 · PERFORMANCE «Nachlese» · KANTONE §1-C · DATENHALTUNG §12), jede Slice mit `npm run fahrplan` gegengeprüft.
- **Ehrliche Feasibility statt «aus Bestand baubar» (§8):** `normKeys` ist **nur zu 18 % befüllt** ⇒ als Filter ausdrücklich 🔴, weil er stille Falsch-Negative erzeugt · die Verfahrensart aus dem Geschäftsnummer-Präfix ist eine **Rechtsaussage** und muss gegen die amtliche Geschäftsordnung verifiziert werden · die 778/77-Fussnoten-Zahl belegt **dass** es zwei Klassen gibt, nicht **dass** sie trennbar sind ⇒ zwingende Mess-Vorstufe H0 mit Abbruch-Option.
- **CLAUDE.md §14 Ziff. 2** um den Plan-Stand-Abgleich erweitert (in den bestehenden Absatz eingewoben, **0 neue Zeilen**, ~430 Zeichen — CLAUDE.md wird bei jedem Dispatch geladen).
- **Beweis:** `check:plan` **grün** (= QS-PH) · `npx tsc -b` grün · **262 Testdateien / 4204 Tests grün** · `npm run lint` 0 Fehler / 2 Warnungen (**vorbestehend**, per stash-Gegenprobe belegt) · alle 7 neuen FAHRPLAN-Slices drucken sauber · `plan:next` meldet statt zehn nur noch **einen** `wip`. Kein `src/`, kein Produktionscode. **Gegenprüfung n/a** — reine Planungs-/Doku-Arbeit, kein Extraktions-, Rechnen- oder Norm-Tarif-Pfad.
- **Lektion:** Ein Status-Etikett altert still. Kein Tor prüfte je, ob ein `wip` noch stimmt — `check:plan` prüft Konsistenz, nicht Wahrheit. Zehn gleichzeitige Baustellen sahen aus wie viel Arbeit und waren in Wahrheit **ein einziger** laufender Bau plus neun vergessene Marker.

## Session 20.7.2026 — Bau-Fundament: die Gegenmittel aus #315 waren selbst defekt (Worktree `lm-fundament`, Branch `docs/bau-fundament`)

**Auftrag:** die 16 Befunde der adversarialen Prüfung von PR #315 beheben; Leitplanke «bei Wirksamkeits-Befunden lieber einen MASCHINELLEN Mechanismus nachrüsten als mehr Prosa». **Kernbefund der Prüfung, bestätigt:** #315 hat sechs Fehlerklassen *beschrieben* und dabei mehrere seiner eigenen Regeln verletzt — die Gegenmittel validierten gegen sich selbst (F2a), genau die Klasse, die der PR bekämpfte.
- **`npm run dispatch` war ein stiller No-op** (exit 0, null Ausgabe), während `check:dispatch-klausel` GRÜN meldete. Ursache: Einstiegs-Guard prüfte `process.argv[1]` auf `dispatch.ts`, unter `vite-node` ist argv[1] der vite-node-Bin (gemessen). **Vier Fehlerklassen (F3–F6) sassen in einem Generator, der auf dem vorgeschriebenen Weg nichts lieferte.** Fix: eigener CLI-Einstieg `scripts/dispatch-cli.ts` (Guard entfällt, statt repariert zu werden); das Tor prüft jetzt **(A)** die Vorlage **und (B)** den echten `npm run`-Subprozess für alle 4 Auftragsklassen — ein Import hätte genau die Verpackung übersprungen, in der der Defekt sass. **Sabotage-Probe:** alte package.json-Zeile zurückgedreht ⇒ Tor ROT.
- **F3–F6 hatten keinen erzwungenen Träger** — nur Prosa im Template; `npm run dispatch` war ein freiwilliger Drucker. Empirischer Gegenbeweis: der erste Dispatch nach dem Einbau (die Prüfung dieses PR selbst) trug **keinen** §0-Block. Neu `.claude/hooks/dispatch-schutz.py` (PreToolUse/Task): blockiert Aufträge ohne oder mit unvollständigem §0-Block. **Probe:** ohne Block ⇒ exit 2 · Punkt 5 entfernt ⇒ exit 2 mit Nennung · vollständig ⇒ 0 · Nicht-Task-Tool ⇒ 0. **Ehrliche Grenze (§8):** greift nur, wo diese `settings.json` gilt — verschiebt die Klasse von «niemand prüft» zu «der übliche Weg prüft», schliesst sie nicht.
- **F1 war selbst-attestiert.** Der Trailer-Filter prüfte nur `!/^n\/a\b/` — ein leerer Commit mit `Gegenpruefung: x` machte `check:merge-schutz` grün (in der Prüfung reproduziert, hier nachgestellt). Jetzt **prüfbare Form** (Verdikt-Wort aus geschlossener Menge + Zuschreibung `(Modell, Linsen)` + Befundtext ≥15 Zeichen) **plus Bindung an ein unabhängiges Artefakt**: das committete `gegenpruefung-register.md` muss im Merge-Bereich gewachsen sein. Ein Trailer ist eine *Behauptung über* eine Prüfung, kein Nachweis. **4 Proben:** ohne Trailer ROT · `x` ROT · formal perfekt ohne Register-Zuwachs ROT · mit Zuwachs GRÜN.
- **F1/F2b hingen an EINEM lokalen Hook.** `check:merge-schutz` stand in keinem Workflow; `check:tor-paritaet` stand auf seiner **eigenen** Allowlist (Begründung «steht nicht in ihr» war sachlich falsch) — der Melder unsichtbarer Tore war selbst unsichtbar. Alle in `ci.yml` verdrahtet (`fetch-depth: 0` für die merge-base). **Grösster Einzelfund:** `check:besetzung`, `check:entscheide`, `check:bs-entscheide` standen mit «braucht rechtsprechung.db (488 MB)» auf der Allowlist — **nachweislich falsch**, sie lesen die committeten Projektionen unter `public/rechtsprechung/` (je ~1 s grün unter `CI=1`). Ausgerechnet das Tor, das die 11 erfundenen Amtsträger:innen aus #309 fängt, war in CI unsichtbar. **Parität 11/36 → 16/36.** Hook zusätzlich gegen `gh api …/pulls/N/merge` (belegte Umgehung) und gegen `--auto` auf Risikopfaden (Zeitlücke: Auto-Merge prüft nur den Stand beim Aktivieren).
- **F2c war von Maschine auf Prosa herabgestuft worden** (Plan sah CI-Wächter vor, gebaut wurde ein Satz im Skill `landung`), während CLAUDE.md §6 Ziff. 7 lit. c eine Erzwingung behauptete. Der Auslöser war falsch gewählt: **Landung statt Zeitablauf.** Neu `check:ci-laeufe` + `waechter.yml` (täglich): jüngster Lauf jedes `schedule:`-Workflows muss `success` sein und im Zeitfenster liegen; `cancelled`/`skipped` zählen als ROT. **Beim ersten Lauf sofort zwei echte, vorbestehende Ausfälle gefunden:** `normen-monitor.yml` letzter Erfolg **22.6.2026** (~4 Wochen still tot) und `fedlex-frische.yml` failure — letzterer ist der benannte Ersatz-Arbiter für **neun** nur-lokale Tore, deren Allowlist-Begründung damit leerläuft. Beide als #36/#37 erfasst, **nicht** hier gefixt; das Tor läuft darum bewusst nicht in `check:seriell`.
- **`check:gegenpruefung` war unter `CI=1` still grün** — direkter Widerspruch zur in #315 neu eingeführten Regel §6 Ziff. 7 lit. b, und zwei verschiedene Ursachen in einem Text vermischt. Jetzt ausdrücklicher **SKIP** mit benannter Ursache (`ci-selbstschutz` | `kein-git`) und benanntem Arbiter.
- **Kosten-Korrektur (Vorzeichen, nicht nur Grösse).** #315 wies «≈ −511 Token je Dispatch» aus. Die Messung stimmt, die **Bezugsgrösse nicht**: `CLAUDE.md` liegt im zu ~95,8 % gecachten Präfix (~10 % Preis) und wird **1× je Session** geladen — **Sub-Agenten erhalten sie gar nicht**, ein Dispatch spart also **0**. Der §0-Block ist dagegen **frischer Vollpreis-Input je Dispatch**: gemessen 20 Z./1 397 Z. ≈ **425–470 Token**, gegen «~13 Zeilen ≈ 150 Token» geplant (**2,8-fach**). Reale Bilanz bei 20 Dispatches ≈ **+8 500 frische Token je Session** statt −1 020. Kein Argument gegen den Block — er ist eine bewusst gekaufte Versicherung, ein verhinderter #309 kostet ein Vielfaches — wohl aber gegen die Begründung. Umrechnungsbasis `Zeichen/3,6` für deutschen Markdown zu optimistisch, künftig **3,0–3,3**. Festgehalten in `docs/token-oekonomie/dispatch-template.md`.
- **Verlorener David-Auftrag wiedergefunden:** «Datenhaltungs-Optimierung» (inkrementeller Sync · contentless-FTS · Index-Strategie · Heiss/Kalt-Gate) war aus dem §14-Intake vom 20.7. gefallen und existierte **nirgends** mehr — in ROADMAP W2·6-DATA nachgetragen.
- **Diese Karte selbst** behebt Befund 14: #315 verletzte die eigene Definition of Done (§14 Ziff. 4) — keiner seiner sieben Commits berührte `STRUKTUR.md`. Kein Tor deckt diese Pflicht ab (`struktur-aktuell.py` ist On-Demand und blockiert nie).
- **Offen / DAVID-GATE:** **Required Checks** in den Branch-Regeln setzen — erst das macht `check:merge-schutz` zur harten Schranke gegen Web-UI-Merge und fremde Sessions; ohne den Handschritt bleibt der CI-Lauf ein *sichtbarer*, kein *bindender* Nachweis. Ausserdem: echte **Autor≠Prüfer**-Trennung ist lokal nicht herstellbar (bräuchte Required Reviewers).
- **Beweis:** `gate` · `check:plan` · QS-PH grün (Ausgaben im PR). **Gegenprüfung n/a** — reine Prüf-/Werkzeuglogik, kein Rechnen/Extraktion/Norm-Tarif berührt.

## Session 20.7.2026 — Turso-Sync: Timeout-Wurzel behoben, Suchindex wieder aktuell (RISIKOPFAD `scripts/datenhaltung/**`, Worktree `lm-turso`, Branch `fix/turso-sync-timeout`, Roadmap QS-DATA)

- **Symptom:** `turso-sync.yml` seit 18.7. sechsmal in Folge `cancelled`, jeder Lauf ~20 min 18 s bei `timeout-minutes: 20`. Weil GitHub abgebrochene Läufe **grau statt rot** färbt, blieb es tagelang unbemerkt — BS-Import #300 (3765 Entscheide), G-REF #299, ASYLV2 #304, Richter #309/#310 erreichten die Suche nie.
- **Schlimmer als «veraltet»: die Prod-Replika war VERSTÜMMELT.** Der Ablauf war DROP → CREATE → Load; jeder Timeout traf mitten im Laden. Messung am Ist-Zustand: remote `artikel` **16'400 von 55'822**, `fts_entscheide_schaufenster` **existierte gar nicht** (`no such table`). `api/suche` servierte also einen halben Artikel-Index und **null Entscheide** — ohne je rot zu werden.
- **Ursache — NICHT der Timeout, sondern der Transport.** Der Sync schickte je Zeile ein eigenes Hrana-`execute`; jedes `execute` ist eine eigene implizite Transaktion ⇒ **ein durabler Commit pro Zeile**. Gemessen (aws-eu-west-1): 400 Einzel-Statements **12'131 ms (33 Zeilen/s)** · dieselben 400 mit `BEGIN/COMMIT` **525 ms (762 Zeilen/s)** · als Mehrzeilen-INSERT **280 ms (1429 Zeilen/s)**. Bei 61k Zeilen: ~46 min gegen ~1 min. Der 20-min-Timeout war die **Folge**, nicht die Ursache — ihn bloss zu erhöhen hätte das Problem in ~3 Monaten wiederholt.
- **Gewählter Weg (b) Transport, nicht (a) Inkrementell.** Mehrzeilen-`INSERT … VALUES (…),(…)` in `BEGIN/COMMIT`, drei daten-getriebene Schranken (Bind-Parameter ≤ 8000 gegen SQLITE_MAX_VARIABLE_NUMBER 32766 · ≤ 512 KiB/Statement · ≤ 3 MiB/Request), die Argument-Nutzlast **und** SQL-Gerüst mitrechnen; gegen den realen Korpus nachgemessen bleibt jeder Request darunter (grösster real 2,976 MiB). **Inkrementell bewusst NICHT**: `fts_artikel` ist contentless und über `rowid == artikel.rowid` an die Basistabelle gekoppelt — jede eingefügte Zeile verschiebt die rowids und würde den Index still invalidieren; der Voll-Rebuild ist hier ein echtes Sicherheitsmerkmal (determinismus-beweisbar, kein Delta-Drift). **Kompression geprüft und verworfen:** der Endpunkt lehnt `Content-Encoding: gzip` mit HTTP 400 ab.
- **Schatten-Tabellen statt DROP-zuerst.** Geladen wird in `<tabelle>_neu`, Verifikation läuft **vor** dem Tausch, dann DROP+RENAME (`ALTER TABLE … RENAME TO` trägt auf Turso für normale, standalone- und contentless-FTS5-Tabellen inkl. rowid-Erhalt — empirisch geprüft). Ein Abbruch während des Ladens lässt den alten, vollständigen Stand stehen.
- **Der Tausch ist echt atomar — aber erst nach dem zweiten Gegenprüfungs-Durchgang.** Die erste Fassung klammerte ihn in ein `BEGIN/COMMIT` INNERHALB EINES Hrana-Requests. Die Gegenprüfung hat empirisch widerlegt, dass das trägt: **die Pipeline bricht bei einem fehlgeschlagenen Statement nicht ab**, die Folge-Statements laufen weiter und das mitgeschickte COMMIT gelingt — der Teilzustand wird festgeschrieben. Im Wegwerf-Test verschwand so eine Live-Tabelle dauerhaft, exakt der Zustand des Vorfalls vom 19.7. Jetzt läuft der Tausch über den Hrana-**`baton`**: BEGIN + DDL in Request 1 (Stream offen), Ergebnisse prüfen, dann COMMIT — oder bei jedem Fehler ROLLBACK. Empirisch belegt: derselbe Fehlerfall lässt jetzt beide alten Tabellen unversehrt stehen. Stirbt der Prozess zwischen den Requests, wird nie committet.
- **Gemessenes Zeitprofil (lokaler Volllauf):** erlasse 1458 in **0.9 s** (1680 Z/s) · erlass_fassungen 1458 in **0.4 s** (3463 Z/s) · artikel 55'822 in **81.9 s** (681 Z/s, **66.3 MiB** real gesendet) · fts_artikel 55'822 in **47.4 s** (1178 Z/s, **32.6 MiB**) · **fts_entscheide_schaufenster 5093 in 816.2 s** (6 Z/s, **165.3 MiB — 86 % der Übertragungszeit**, 816.2 von 946.8 s). Die Entscheid-Phase ist nicht mehr commit-gebunden; lokale Vollläufe derselben Daten brauchten **16:17 / 19:18 / 32:18**, je nach Rate 4–8 Zeilen/s.
- **CI-Messung korrigiert eine falsche Annahme (Lauf 29757068566, `workflow_dispatch`):** **32,8 min** gesamt, davon **22,3 min** allein die Entscheide — **bei 4 Zeilen/s, also genau derselben Rate wie über die Heim-Leitung.** Die Phase ist damit **nicht bandbreiten**gebunden (das stand hier zuerst und war falsch), sondern durch den **Schreibpfad der Gegenseite** begrenzt: ~2,9 MiB je Request in ~22 s ≈ 128 KiB/s effektiv. Ein schnellerer Runner hilft nicht. **Folge fürs Budget:** `timeout-minutes` 20 → **90** (≈ 2,7× der Messung). Bei den zunächst gesetzten 45 min wären es nur 1,37× gewesen — der Entscheid-Korpus hätte um ~65 % wachsen können, bevor derselbe Timeout wieder zuschlägt; genau dieser Wiederholungsfall ist der Grund für diese Reparatur. Der Timeout bleibt die Notbremse, die echte Grenze ist der Durchsatz.
- **Wächter (der eigentliche Schaden war das Schweigen, §8):** neu `check:turso-frische` — prüft **vierfach**: (1) Struktur: existieren alle 5 HOT-Tabellen und sind sie nicht leer, (2) **Vollständigkeit**: Ist-Zeilenzahl je Tabelle gegen die vom letzten erfolgreichen Sync in `sync_meta` protokollierten Soll-Zahlen — *das* ist der Riegel gegen den historischen Schaden, denn `artikel` mit 16'400 von 55'822 Zeilen hätte eine reine «nicht leer»-Prüfung anstandslos passiert —, dazu Kopplung `fts_artikel` == `artikel` und gleiche rowid-Spannweite, (3) Frische: `sync_meta.manifest_sha` gegen das committete `daten-manifest.json`, (4) Alter ≤ 7 Tage (fängt einen toten Auslöser). Verdrahtet als **harter Schritt** im Sync-Job und als **täglicher cron-Job** (dort mit eigenem harten Token-Riegel, sonst wäre der Wachhund bei verfallenem Secret für immer grün). **Bewusst NICHT in `check:netz`:** der einzige Job, der das fährt, hat kein Token — der Tor täuschte dort Abdeckung vor und ginge lokal auf jedem Branch falsch-rot, der `daten-manifest.json` legitim neu generiert — ein abgebrochener Sync wird spätestens am Folgetag rot. Die Live-Paritäts-Stichprobe warnte bisher nur bei Nicht-200 (konnte also dauerhaft nichts prüfen, ohne je rot zu werden); jetzt 5 Versuche mit Pause, danach ROT, und zusätzlich eine **Entscheid**-Probe — der Pfad, der komplett gefehlt hatte.
- **Doku-Korrektur (§5/§8):** `fts.ts`/`turso-sync.ts` sprachen von «218 Bund-Erlassen» und «342 kuratierten Schaufenster-Entscheiden». Der Code filtert an keiner Stelle — es sind alle `eintrag`-Zeilen (Ist 1458 Erlasse / 55'822 Artikel / 5093 Entscheide). Konkrete Zahlen stehen darum jetzt bewusst nicht mehr in den Kommentaren, dafür die Klarstellung, dass «Schaufenster» HOT von COLD trennt und **keine Auswahl innerhalb der HOT-Daten** bezeichnet.
- *Bewusst offen gelassen (Runde 6, nicht blockierend), **mit Auslöser**: der Quell-Riegel ruft `manifestDb()` auf die ganze DB und hasht damit auch sechs Tabellen, die er nie vergleicht — 1.7 s und ~1.9 GiB Spitzen-Heap gegen das Node-Limit von 4288 MiB, also **Reserve 2.3×**. Heute unkritisch. **Fällig wird die Einschränkung auf die vier geprüften Tabellen, sobald EINES eintritt:** (a) der Entscheid-Korpus verdoppelt sich (5093 → ~10'000 Einträge), oder (b) die Heap-Reserve fällt unter **1.5×** (≈ 2.9 GiB maxRSS), oder (c) die HOT-Artefakte reissen das **1-GB-Budget aus §11.5** (heute 651.99 MiB / 63.7 %) — denn beide Grössen haben denselben Treiber, die `eintrag`-Tabelle der rechtsprechung.db (465.93 MiB von 651.99 MiB). Wer (c) anfasst, prüft (a)/(b) mit.*
- **Budget (§11.5):** HOT-Artefakte **651.99 MiB / 1024 MiB = 63.7 %** — das ist die Summe der **lokal gebauten** FTS-tragenden `.db`-Dateien (normtext.db 186.07 + rechtsprechung.db 465.93), die `build.ts` gegen das Budget misst, nicht die Grösse der Turso-Replika. Reserve 372 MiB. Hält — aber die Entscheid-DB ist der Treiber; eine Verdoppelung des Entscheid-Korpus führt an die Grenze. **Nicht still gekappt, hiermit gemeldet.**
- **Live-Beleg (vorher → nachher):** vorher `fts_entscheide_schaufenster` = *no such table* ⇒ 0 Entscheid-Treffer. Nachher über Prod `/api/suche`: «Appellationsgericht» **2878** Treffer (BS-Entscheide oben), «Aufsichtskommission Anwälte» **21**, «BGE 151» **595**; Artikel-Pfad ungebrochen (OR 319 / ZGB 1 / StGB 111). Lokal: `check:turso-frische` grün, alle 5 Tabellen voll, `manifest_sha` == committeter Stand.
- **Gegenprüfung: FÜNF Runden, jede zuerst `widerlegt` — 34 Befunde, alle behoben.** Die Einheit ist erst durch wiederholtes Widerlegen tragfähig geworden; die Befunde lagen fast durchweg in derselben Klasse wie der ursprüngliche Vorfall: *etwas ist kaputt und trotzdem grün*.
  - **Runde 1 (10):** `--nur-fts` koppelte frischen FTS an eine womöglich stale Live-`artikel` und stempelte trotzdem die volle Frische-Marke (stille Falsch-Treffer bei grünem Wächter) · `artikel` wurde ohne explizite rowid geladen, die Kopplung hing an der zufälligen Lückenlosigkeit der lokalen rowids (am Minimalbeispiel reproduziert: eine Lücke ⇒ falscher Artikel als Treffer) · Zeilengleichheit `fts_artikel == artikel` war die **einzige** Invariante ohne Prüfung, obwohl der Such-Join daran hängt · `zeilenBytes` lag um Faktor 1,34 daneben.
  - **Runde 2 (6):** die Atomarität trug nicht (s. o.) · der pauschale Escape-Faktor 1,25 war eine **statistische** Annahme, die bei Escape-Dichte > 25 % kippt — reale Korpuszeilen erreichen 44,88 % · die Frische-Marke wurde **vor** der Nachkontrolle geschrieben ⇒ kaputte Replika mit selbst-bestätigendem Soll, Wächter dauerhaft grün · fehlende Soll-Zahlen degradierten still auf «nicht leer» · der tägliche Wächter hatte keinen Token-Riegel und wäre bei verfallenem Secret für immer grün gewesen.
  - **Runde 3 (8):** `zeilenBytes` unterschätzte **Zahlen** (pauschal 32 B, real 34 B für `55822` — ausgerechnet die rowid-Spalte) · das **SQL-Gerüst** wurde nirgends mitgezählt, wodurch `fts_artikel` real 3,023 MiB gegen eine 3,00-MiB-Schranke sendete · fehlender `stand`-Schlüssel übersprang die Alters-Prüfung still · dazu vier Doku-Behauptungen, die der Code nicht hielt. Nutzlast wird seither **exakt** über `JSON.stringify` in UTF-8 gerechnet, Gerüst inklusive; gegen den realen Korpus 0 Verletzungen.
  - **Runde 4 (7):** **der schwerste Befund der ganzen Einheit** — die komplette Kette Sync → Marke → Wächter validierte sich **gegen ihre eigene Ladung**. Alle Soll-Zahlen waren die eigenen Ladezähler; `daten-manifest.json`, die einzige unabhängige Zahl im Repo, wurde nur *gehasht*, nie inhaltlich verglichen. Ein verstümmelter lokaler Build (100 statt 55'822 Artikel) wäre sauber durchgelaufen, live gegangen und in **allen** Toren grün gewesen — derselbe stille Fehlmodus, dessentwegen dieser PR existiert. Neu: **Quell-Riegel** gegen das committete Manifest, vor dem ersten Netz-Zugriff; beide Pfade empirisch belegt (Negativ-Probe bricht mit «Es wird NICHTS an die Live-Replika geschickt» ab). Zusätzlich läuft jetzt **`check:datenhaltung` im Sync-Workflow** — es hält den soeben gebauten Stand über die Inhalts-SHAs gegen das Manifest und lief bisher nur im PR-Gate, also nicht auf diesem Pfad. Ausserdem: die inhaltliche Entscheid-Probe lief **nach** dem Tausch, hätte also den intakten Live-Stand erst zerstört und danach gemeldet — jetzt vor dem Tausch.
  - **Runde 5 (3):** der Quell-Riegel verglich nur **Zeilenzahlen**, obwohl das Manifest je Tabelle einen Inhalts-`sha` trägt — ein Build mit richtiger Anzahl und falschem Inhalt wäre durchgelaufen (dieselbe Klasse, die Runde 2 im Wächter als «‹nicht leer› reicht nicht» benannt hatte). Jetzt Zeilenzahl **und** sha, über dieselbe Kanonisierung wie `daten-manifest.json`; empirisch belegt: manipulierter sha bei korrekter Zeilenzahl bricht ab, ohne das Netz zu berühren · die Alters-Prüfung des Wächters testete nur `tage > 7`, nie `tage < 0` — eine **zukunfts-datierte** Marke machte sie dauerhaft grün (gegen Mock-Endpunkt belegt, jetzt rot) · eine Kommentar-Begründung war unbelegt (die übergrosse Zeile fährt *nicht* allein in ihrem Request; die Schranke hält aus einem anderen Grund).
- **Selbst gefunden bei der Verifikation:** die erste Test-Weiche (`process.argv[1]`-Sniffing, um `main()` beim Test-Import zu unterdrücken) machte den Sync unter `vite-node` zum **stillen No-op** — Exit 0, keine Ausgabe, argv[1] ist dort die vite-node-Binary. Aufgefallen, weil die Frische-Marke nach dem «erfolgreichen» Lauf unverändert war. Ersetzt durch das seiteneffektfreie Modul `turso-transport.ts`, das der Test importiert.
- **Tore:** `npm run gate` grün ausser **`check:materialien`** — 11 Orphan-Shards unter `public/materialien/kanten/` (ARG · ARGV1 · BGOE · DBG · DSG · MWSTG+2 Buckets · MWSTV · STG · VSTG). **Nicht aus dieser Einheit** (der Diff fasst `public/materialien/**` nicht an) und **auf sauberem `origin/main` byte-identisch reproduziert**.
- ⚠️ *Dabei aufgefallen (eigener Befund, NICHT in dieser Einheit behoben): dieser Red ist **DB-gated und für CI unsichtbar**.* `check-materialien.ts` macht die Shard-Byte-Reprojektion samt Orphan-Erkennung nur `if (dbExists)`; ohne `daten/soft-law.db` läuft der schwächere Pfad `pruefeCommittedShards()`. CI baut die DB-Artefakte nicht → dort ist das Tor **grün**, lokal nach einem `datenhaltung:build` **rot**. Auf sauberem main ohne DB grün, mit DB dieselben 11 Verstösse — der Defekt liegt also seit Längerem auf main und wird von der einzigen Stelle, die ihn sieht, nur lokal gemeldet. Gehört als eigene Einheit adressiert (Shards neu projizieren oder die Orphans streichen); hier bewusst **nicht** mitgefixt, um Risiko-Klassen nicht zu mischen (§14/2).
- Trailer `Roadmap: QS-DATA`.

## Session 16.7.2026 — F2 Zitat-Regex-Ausbau «Verweis-Erkennung speist die Verzahnung» (RISIKOPFAD Extraktion, Worktree `lm-regex`, Branch `feat/zitat-regex-f2`, Roadmap W2·7-VZUI)

**Auftrag (Bau-Agent F2, David-Go + ultracode; Steinbruch = Omnilex-AI-Starter-Repo Apache-2.0, Dossier `bibliothek/werkzeuge/omnilex-ai-und-kaggle-legal-ir-2026-07-16.md`).** 10 adversarial-bestätigte Zitat-Muster-Varianten in die EINE zuständige Erkennungs-Stelle `src/lib/rechtsprechung/zitat-extraktion.ts` gebaut (§5): **V1** BGE-Pinpoint «E./Erw./consid.» (dezimal/slash/range, `\b` nach Seite gegen Trunkierung) → `BGE_PATTERN`+`extrahiereEntscheidRefs`; **V2** verkettete Sub-Marker «lit. b Ziff. 5» ({0,3}, Token-Abschluss `(?![A-Za-z0-9])`); **V3** «Nr.» als Sub-Marker; **V4** klein «art.»+FR-Kürzel — **bereits erfasst** (§7-Abweichung: Vorschlag zielte auf falsches Modul `norm-zitate-pruefen.ts` das UNSERE dt. Vorlagen validiert; nur Regressions-Schloss, kein 40-Zeichen-Gap-Linker); **V5** Umlaut-Endung «LugÜ/EPÜ/SDÜ» (Umlaut nur als GROSS-End-Buchstabe, `anzahlGross`+Umlaut, `CODE_ENDE` statt `\b`); **V6** ff.-Aufzählungsliste; **V7** ECLI inkl. EU-Gerichtshof (neues `ECLI_PATTERN`+Span-Dedup); **V8** Mehrfach-Zitat de/fr/it «e» (Ketten-Grammatik); **V9** SR-/RS-Locator (neue `extrahiereFundstellenRefs`, Ständerat-Lookbehind); **V10** Bereich «Art. 641-654a» (`artikelBis`+Monotonie-Guard, `bis` NICHT im Norm-Key). Pflicht-Anker aus der FP-Linse verbaut: `NR`+`BGE`+CHF/EUR/USD/GBP/FR/FRS/SFR in `INVALID_LAW_CODES` (151→160). Apache-2.0-Attribution als Quellen-Kommentar am Fundort.

**Adversariale Gegenprüfung (bestanden, Opus, Extraktions-Linse):** unabhängiger OLD-vs-NEW-Lauf über **752 reale Korpus-Einträge** (`public/rechtsprechung`, bger/entscheidsuche) — **0 Phantom-Normen** (jeder Gain-Code literal im Text), **0 Entscheid-Ref verloren**, **+2931** Statut-Refs; 140 Alt-Wegfälle = 97 Trunkierungs-Fixes (EP→EPÜ, LUG→LugÜ, BG→BGÖ, HU→HUÜ) + 43 Drops davon ~17 Fixes (BGE-Phantom-Norm nach Artikel geblockt, Wort-Trunk «Brüssel»/«Zus») + ~26 dokumentierte Residue IVöB/aVöB (mixed-case-medial-Umlaut, Alt-Key «IV» war trunkierter Fehl-Key → sichere Entfernung, §1). Real-Spot-Checks: «art. 398 CO» (147_III_463), ECLI:EU (151_II_494). `check:gegenpruefung` grün (zitat-extraktion.ts NICHT in der Tor-Risikoliste, Gegenprüfung dennoch als §14-Sorgfalt gefahren). **48 neue+angepasste Unit-Tests** (`src/tests/zitat-extraktion.test.ts`, je Variante Positiv-Maximalkombi + FP-Konstruktionen); 2 deklarierte Behavior-Changes (BGE-Pinpoint jetzt bewahrt; INVALID-Size 160).

**Beweis:** `npm run gate` (voll) grün BIS AUF `check:materialien` (**pre-existing Date-Flake**: VERN-2025-124/58 fristEnde 2026-07-15 < heute 2026-07-16, committete Daten — NICHT von F2 berührt, braucht `materialien:vernehmlassungen`-Regen). tsc · vitest 3818 · golden byte-gleich (kein Korpus regeneriert) · lint 0 Fehler · 29/30 checks grün. **Drive-by-Hygiene:** `scripts/bibliothek-check.sh` S7.3 Base-Dir-Liste um `werkzeuge/seo/materialien/normtext/quellen` ergänzt (heilte pre-existing toten Sibling-Link aus #245). **Offen:** Kanten-Regeneration (`norm-index.json`/Shards) verschoben — `fix/a29-regesten` (#246) bei Bauzeit noch OFFEN; nach dessen Merge additiv nachziehen + erneute Gegenprüfung. Trailer `Roadmap: W2·7-VZUI`. PR mit armiertem Auto-Merge (blockiert bis materialien-Flake extern geheilt).

## Session 16.7.2026 — A29 «Mehrteilige BGE-Regeste (Regeste a/b/c) vollständig extrahieren» (RISIKOPFAD Extraktion, Worktree `lm-a29`, Branch `fix/a29-regesten`)

**Auftrag (David 16.7., ANMERKUNGEN Ziff.1 / FAHRPLAN-GESETZES-UX §10.10 E1):** BGE 147 III 121 zeigte nur «Regeste a», die Quelle hat a UND b. **Root-Cause:** die amtliche clir-Seite legt jeden Regeste-Teil als EIGENEN aufeinanderfolgenden `<div id="regeste">`-Block ab; der alte Parser (`schneideRegesteDiv`, `.exec()`) nahm nur den ersten → Teil b/c gingen still verloren. **Fix** (`clir-regeste.ts`): `schneideAlleRegesteDivs` (div-balanciert, iteriert) + `parseRegesteBlockInner`/`parseRegesteLabel`; additives Feld `weitereRegesten:[{label,kopf,absaetze}]` je Sprachfassung (alle Teile inkl. a, nur bei >1 Block — Einfach-Regesten byte-identisch); UI `RegesteBlock.tsx` rendert «Regeste a/b»; `check:entscheide` Anti-Regression (Quelle «Regeste b» ⇒ DE-Fassung MUSS weitereRegesten) + Projektions-Konsistenz. **Sweep** (deterministisch aus dem flachen OCL-Regestetext, alle 682 BGE): **52 betroffen** (39×2, 11×3, 1×4 [151 I 137], 1×5 [147 II 164]), alle über den Generator (schreibeKorpus, Datum-gepinnt) regeneriert — Diff rein additiv (register/norm-index/shards byte-identisch, Round-Trip-Probe 0 Änderungen). **Beweise:** 147 III 121 a+b in DE/FR/IT byte-treu (Teil b = Art. 52f bis AHVV); 4 Stichproben byte-gleich zu unabhängiger Re-Derivation der live-gefetchten clir-Seiten; Trilingual-Drift (147 II 164 FR=4 vs DE/IT=5; 146 II 150 IT=1 vs DE/FR=2) quell-echt belegt (§1 treu, keine erfundenen Sprach-Teile); Einfach-Regesten unverändert (golden 209 byte-gleich, Kontrolle 152 V 2 ohne weitereRegesten). **Gegenprüfung: bestanden** (unabh. Opus-Durchgang mit eigenem lxml-DOM-Parser gegen live bger.ch, 90 Blöcke zeichenweise identisch, kein LEAK/Mojibake). **Tore:** voller `npm run gate` grün ausser dem bekannten deterministischen main-Blocker `check:materialien` (VERN datums-getriggert, nicht in CI); datenhaltung-Manifest (rechtsprechung.db) nachgezogen, check:paritaet grün. Trailer `Roadmap: W2·5d`. PR #246 mit armiertem Auto-Merge.

## Session 16.7.2026 — DESIGN D-5 «Flächen-Wärme: Papier-Treppe HELLER + WEISSER» + David-Direktive A38 (Worktree `lm-d5`, Branch `feat/design-d5-papier`)

**Auftrag (FAHRPLAN-DESIGN-WAERME.md D-5, ROADMAP W2·11-DESIGN) mit DEKLARIERTER ÜBERSTEUERUNG durch DAVID-DIREKTIVE A38** (16.7., wörtlich «ausserdem mache die ganze lexmetrik webseite heller uns weisser», Quelle `docs/ux-audit-2026-07/ANMERKUNGEN-DAVID-2026-07-16.md` Nachtrag). A38 übersteuert die Flächen-Ton-Zielwerte der D-5-Spec **inkl.** Spec-Fixpunkt §0.1 (`--paper #FAF8F2` war «unantastbar»): die helle Papier-Treppe wird **heller + weisser**. **Treppen-MECHANIK der Spec wörtlich erhalten:** gestufte Flächen-Rollen, EINE Papier-Achse (Hue ~90°, brass-/ink-konsistent wie D-4), L strikt steigend `well<paper<surface<raised` (Erhebungs-Logik), Flexoki-Nuance (tiefere Fläche = eine Spur mehr Chroma). **Abweichung:** Chroma site-weit **~30 % gesenkt** (Wärme nur noch feine Nuance, keine sichtbar getönte Fläche mehr) + L angehoben. **Nur `:root` (HELL) — DUNKEL unberührt** (A38 = helle Fläche; D-6 separat). **Token-Delta (hell, culori/OKLCH-gemessen):** `--paper #FAF8F2→#FCFAF6` · `--paper-raised #FEFDFA→#FFFEFC` (~weiss, NICHT #FFFFFF — Reinweiss-Invariante) · `--paper-sunken/well #F2EFE6→#F6F4EE` (grösster A38-Gewinn — Wells lasen sich als graue Mulde) · `--surface #FDFCF7→#FEFCFA` (Hue-Ausreisser 97°→Papier-Achse). **Kontrast (sichere Richtung — hellerer Grund = mehr Kontrast, kein Paar sinkt):** ink-500/well 4.62→**4.83**, `--placeholder`/well 4.76→**4.98**, Referenz C-1/C-2/C-3 hell 4.81/5.24/4.91→**5.03/5.48/5.13** (dunkel unverändert). **Tor `check:farbwelt` deklariert nachgezogen (scharf, nicht entkernt):** Fixpunkt-Hell `#FCFAF6` + Referenz-Hell-Werte; 48 WCAG-Pflichtpaare hell+dunkel, L-Leiter beide Modi GRÜN. **Beweise:** golden byte-gleich (CSS-only); `npm run gate` tsc·vitest·golden·lint grün, check-parallel grün **ausser** `check:materialien` (2 Vernehmlassungen `fristEnde 2026-07-15 < heute 2026-07-16` = pre-existing Daten-Staleness, mit gestashtem Diff identisch rot, **nicht in ci.yml**, ausserhalb D-5-Fläche). 30 Vorher/Nachher-Screens (5 Kernseiten × Desktop+Mobil390 × hell/dunkel, PNGs gitignored) + `abnahme/design-d5/BERICHT.md`. Reglement-Nachträge `DESIGN-REGLEMENT.md §F2b-Nachtrag D-5` + `-NORMTEXT §4b-B`, Fahrplan-Ausführungsvermerk D-5 ✅. Gegenprüfung n/a (reine Darstellung/Token). Trailer `Roadmap: W2·11-DESIGN`. PR mit armiertem Auto-Merge. **Nächster Schritt:** D-6 (Dunkel-Paket: Elevation/Schatten/Scrims).

## Session 16.7.2026 (abends) — QS-OPT-Fortsetzung O-2/O-1.9 (+ Forks O-4-Alias/O-3.2) — Worktrees `lm-o2`, `lm-o19`, `lm-ostatus`

**Auftrag (FAHRPLAN-OPTIMIERUNG-2026-07, Fortsetzungskette nach David-Gate-Freigaben 16.7.).** Freigaben wörtlich protokolliert (Fahrplan-Bau-Status + PR-Bodies): O-2-Rahmen «Ja, voll freigeben» · O-4-klein «Ja, FR/IT aufnehmen» · O-1.9 «Bauen, Wortlaut schlägt Agent vor». **Turso-Schreib-Token** als CI-Secret `TURSO_AUTH_TOKEN` gesetzt. **O-2 Frische-Automatik (PR #259, Gegenprüfung bestanden):** `scripts/fedlex-repin-batch.ts` (O-2.1) hebt überholte Bund-Pins in EINEM Lauf auf die geltende Fedlex-Konsolidierung (neues kons-Datum + kanonisches html-N via isExemplifiedBy, byte-präzise cache.sh-Feld-3/4-Ersetzung) — **§7-treu: künftige Fassungen (1.8.-Berg) werden NIE re-pinnt**; reine Erhebung (erhebeRepin, injizierbare fetchImpl) getrennt vom Schreiben; 5 Unit-Tests. Zwei EIGENE Workflows (`fedlex-frische.yml` Reparatur-Arm mit Auto-Merge-PR + Handschritt-Zettel · `turso-sync.yml` O-2.6 an Daten-Diff + Live-Parität) statt Eingriff in `normen-monitor.yml` (Kollision mit O-1-Umbau #244 vermieden). Guard `FEDLEX_NUR_IMPORT` im Wiedervorlage-Generator (Import ohne Datei-Nebeneffekt, CLI verhaltensneutral). **Live-Befund + adversarial gegen Fedlex-SPARQL/Filestore bestätigt:** asylv2 fällig (2026-06-12→2026-07-14/html-1), chemrrv überholt aber html-N noch nicht publiziert (Handschritt), §7-Berg (USG/KVV/AVIV/BVV2/KLV) echt künftig → korrekt ausgeschlossen; der PR mutiert den Korpus NICHT (§14.2). **O-1.9 /api/fehler (PR #257):** Edge-Fehlerkanal ('self', POST-only, ratenbegrenzt, sanitisiert, 3 längenbegrenzte Felder, keine PII/Fingerprinting) + Client (gesampelt 0.25, fire-and-forget, nur pathname, wirft nie) + ErrorBoundary/window.onerror-Verdrahtung + VITE_BUILD_ID + Datenschutz-§8-**Entwurf**; kein Risikopfad → Gegenprüfung n/a. **Tore je PR:** tsc -b · golden byte-gleich (209) · Unit-Tests · eslint · YAML valide grün; O-2 `Gegenpruefung: bestanden` quittiert. **CI-Abhängigkeit:** grünes CI setzt Hotfix #248 (bibliothek-check S7.3) auf main voraus (vorbestehendes `check:bibliothek`-Rot, nicht dieser Diff) → Auto-Merge greift nach #248-Landung. **Dispatcht (Forks):** O-4-Alias-Tabelle FR/IT (normQuery, Risikopfad), O-3.2 Flake-Wurzel separat fortgesetzt. **Offen:** O-4 DE-Filter-Heben+Korpus-Re-Lauf (heavy Netz, eigene Einheit), O-4-Chips (Ketten-Ende), O-3.3 Sharding (nach #248), O-3.4 e2e-Masse, O-2-Reste (#2.3–2.5/2.7). Trailer `Roadmap: QS-OPT`.
## Session 16.7.2026 — QS-OPT-Kette (Optimierungs-Research O-1/O-3.1) — 2 PRs, Auto-Merge armiert (Worktrees `lm-opt`, `lm-o31`)

**Auftrag (FAHRPLAN-OPTIMIERUNG-2026-07.md, ROADMAP-Querschnitt QS-OPT; Bau-Agent Opus, ungegatete Einheiten sequenziell).** Zwei Einheiten gebaut, gegatete/geparkte übersprungen.

**O-1 Betrieb & Wachhund — PR #244** (§0a-konform, kein Rechtsinhalt, alles empirisch belegt): **#1 CSP-Fix** `entscheidsuche.ch` in `connect-src` (vercel.json) + Offline-Invariant-Tor `src/tests/csp-connect-src.test.ts` (koppelt jede externe Netz-Quelle an die Allowlist; entscheidsuche-Host aus `LIVE_ENDPOINT` abgeleitet §5) — «CSP frisst Feature» dauerhaft gefangen. **#4 Soft-404** negatives Rewrite-Muster in vercel.json (Daten-/Asset-Pfade mit Dateiendung vom Catch-all ausgenommen) → echte 404; **extensions-basiert**, damit SPA-Deep-Routes `/rechtsprechung/:key` + `/materialien/:key` (endungslos, client-lazy) unangetastet bleiben (§15 kein Deep-Link-Verlust; 1426+1549 Reader-Keys dot-frei verifiziert, Regex über 12 Fälle bewiesen). **#2/#3/#6/#8 Monitor** (`normen-monitor.yml` + `.github/scripts/prod-smoke.sh`/`api-vertragstests.sh`): Prod-Smoke der Live-Site (Startseite, `/api/suche` JSON-nicht-HTML, Korpus-JSON, Soft-404-Signal), Zefix/geo-Vertragstests, LIK-Frische-Tor (`scripts/check-lik-frische.ts`, wanduhr-abhängig → nur Monitor), Rechtsstände über die EINE Kette `check:netz` (6→10 Tore). **#7 Loader-Fehler-Cache** (`laden.ts`/`browse.ts`): nur echte 404 dauerhaft `null`; transiente Fehler (5xx/Netz/Parse) verworfen → Neuversuch, Erfolgspfad byte-identisch (golden+normtext grün), 4 Randfälle empirisch grün (`normtext-laden-cache.test.ts`). **Gegenprüfung bestanden** (Loader-Fehler-Cache, kein Norm-Inhalt). Übersprungen: **#5 Case-Redirect** (fragil in vercel.json), **#9 /api/fehler** (Mini-Gate: Datenschutz-Wortlaut David).

**O-3.1 Golden-Matrix Rechen-Blindspot — PR #247**: prozesskosten/beurkundung/grundbuchgebuehren/notariatGrundbuch trugen 0 Golden-Keys → 40 neue Fälle (209→249), verhaltensneutral (deklarierter `npm run golden`, Diff **strikt additiv 1936/0** → alle 209 Bestandskeys byte-identisch), 40 Fälle throw-frei. Adversarialer Spot-Check: ZH/BS Beurkundung 1‰/0.25% + Grundbuch 1‰ + Randfall Kostenlos Art. 114 lit. c ZPO (25k<30k) norm-konsistent; per-Zelle-Kantonstaffel deferiert (O-3-Gate-Note). `check:gegenpruefung` feuert nicht (golden-outputs.ts/golden.json keine Risiko-Pfade).

**Tore:** beide voller `npm run gate` grün ausser dem **bekannten deterministischen main-Blocker `check:materialien`** (2 Vernehmlassungen VERN-2025-124/58 endeten 2026-07-15, datums-getriggert, **nicht in CI**, Zuständigkeit paralleler `materialien-refresh`). CI-rot zusätzlich durch `check:bibliothek` (PR #242 `bibliothek/werkzeuge/` fehlt in `bibliothek-check.sh` — Hotfix `fix/bibliothek-check-werkzeuge` unterwegs) + a11y-Starvation-Flake `a11y.e2e.ts:192` (lokal grün bewiesen, 12.9s). **Reruns beider PRs erst NACH Hotfix-Merge** (gestaffelt), dann Auto-Merge auf grün. **Übersprungen (Gates, als Fragen an David):** O-2-Rahmen-Gate (unbeaufsichtigte Repair-PRs + Turso-Secret), O-4-klein-Gate (DE-Filter BGer heben). **Offen (nächste Kette):** O-3.2/3.3/3.4, O-4-sofort (Alias/Chips). O-5 geparkt, O-6 §0a/Katalog-Gate.

## Ältere Session-Karten und Chroniken — rotiert ins Archiv

Verbatim verschoben nach `archiv/STRUKTUR-SESSIONKARTEN.md`
(FAHRPLAN-TOKEN-DISZIPLIN.md T-4): **13.6.2026** alle sieben 11.6.-Karten
(früher Abend · später Nachmittag · abends · nachmittags · vormittags ·
über Nacht · Tag «Schlichtung fertig + Vollerhebungen») · **11.6.2026**
Sessions 10.6. abends (STRUKTUR-UMBAU S-1–S-6) und nachmittags
(Fristen-Einheit FE-1–FE-6) · 7.6. abends (Betreibungsamt-Finder) und
nachts (Plan 9b Volldokumente) · 6.6. abends und nachmittags ·
Verschlankung 5.6.2026 · Session-Abschluss 6.6.2026 · **10.7.2026** alle
139 Session-Karten datiert 12.6.2026–3.7.2026 (Rotations-Auftrag «Karten
≤3.7.2026 ins Archiv»; neuester Block liegt jetzt zuoberst im Archiv,
Reihenfolge unverändert). · **10.7.2026 (QS-TOK/T1, mechanisiert):** 34 Karten
≤6.7.2026 byte-genau ins Archiv rotiert (nur die drei 10.7.-Karten bleiben);
Byte-Bilanz bestätigt (kein Inhaltsverlust), Rotation läuft künftig automatisch.

## Verifikationsstand (eine Zeile)

Stand 11.6.2026: Build + 38 Prerender-Routen ✓ · Lint 0/0 ✓ · Suite 1404
grün + 2 skipped (78 Dateien) ✓ · tsc STRICT · Golden 104/104 byte-gleich ✓
· Logik-Sweep 14'448 Kombinationen ✓ — Workflow: **`npm run gate`** (bzw.
`gate:schnell` pro Iteration; leise bei Grün, volle Ausgabe nur für rote
Tore, CLAUDE.md §6 Ziff. 1/5); `npm run check` für die Offline-Checks,
`npm run check:netz` für Fedlex; vor Deploys unabhängige Review-Agents
(Skill `deploy-check`).

**Informationsbibliothek: `bibliothek/INDEX.md`** — Quellen-Register
(verifizierte Fedlex-Stände inkl. ZPO-Revision 2025), Parameter-
Verfallsregister, Recherche-Dossiers (Schlichtungsbehörden 26 Kantone),
ZPO-Normtexte für die Zuständigkeitsengine.

**Zuständigkeitsengine (`src/lib/zustaendigkeit.ts`, Phase 1 — entwurf):**
Bundesrechtsschicht nach ZUSTAENDIGKEIT-AUFTRAG.md (Spezifikation im
Repo-Root): Verfahrensart (Art. 243 inkl. Abs.-3-Vorbehalt), Schlichtung
(197–200), Entscheidkompetenz (210/212, Revision 2025: 10'000),
Gerichtsstände (10/32–35), HG-/Direktklage-Weichen (6/8). 30 Tests mit
beidseitigen Schwellen-Grenzwerten. **Phase 2 erledigt:** Kantonsschicht
`data/zustaendigkeitKantone.ts` (BS-Pilot, Stellen-Auflösung über
behoerden.ts, GOG-Schwelle bewusst null/offen) + SG_SCHWELLEN beziehen
die Zuständigkeits-Schwellen aus ZPO_SCHWELLEN (SSoT §5, golden-bewiesen
byte-gleich). **Phase 3 erledigt:** /rechner/zustaendigkeit (Form §3-rein,
Eckdaten-Tiles, Stelle mit Adresse/Quelle, Weichen offen, PDF-Bericht);
Katalogkarte `zustaendigkeit` (pro/entwurf) ersetzt die drei geplanten
Karten gerichtsstand/verfahrensart/schlichtung. **Phase 4 erledigt:**
Prefill-CTA → Schlichtungsgesuch BS (sgPrefillKodieren/Lesen; nur bei
ordentlicher Behörde + erfasster Stelle; Golden byte-gleich) — MVP
end-to-end. OFFEN: weitere Kantone (nach Dossier-Abnahme), weitere
Ziel-Vorlagen. Davids fachliche Abnahme steht aus.

## Informationsarchitektur (Stand EINE Hauptseite 7.6.2026)

**EINE Hauptseite (FAHRPLAN-EINE-HAUPTSEITE.md, Auftrag David 7.6.2026 —
hebt die Free/Pro-Zweiteilung vom 5.6. wieder auf):** `/` trägt den
VOLLSTÄNDIGEN Katalog (Gebiets-Kacheln, Suche `?q=`, Panel `?gebiet=`,
Anliegen-Zeile, «Zuletzt verwendet») hinter einem kompakten Hero
(Free-Nutzen-Headline in h2-Höhe; Kennzahlen OHNE Preisaussage bis
Monetarisierungs-Entscheid G1). Davor eine kuratierte Chip-Zeile
**«Häufig gebraucht»** (`lib/haeufigGebraucht.ts`, Nachfolger der
Free-Kachelwand-Kuratierung; nur Verfügbare erscheinen). `tier`-Feld,
`PAYWALL_ACTIVE`, `lib/proSession.ts` (Pseudo-Login) und der
Header-Pro-Button sind ENTFERNT (D-3; Stand vor dem Rückbau: Git-Historie
bis `2e80daf`). `/pro`, `/fachpersonen`, `/rechner` → DAUERHAFTE Redirects
auf `/` mit erhaltenem Suchstring (Permalink-/.ics-Link-Erbe). Mobil erbt
die Hauptseite den vorbestehenden 390px-Overflow des Katalogs
(FAHRPLAN-DESIGN Etappe 4, offener Strang).

**Katalog-Gliederung: primär nach RECHTSGEBIET** (17 kanonische Sektionen
in fester Auftrags-Reihenfolge, `RECHTSGEBIET_SEKTIONEN`), darunter je die
Untergruppen **Rechner** und **Vorlagen** (nur nicht-leere). Output-Typ
(Rechner) und Dokument-Typ (Vorlagen) sind FILTER; Rechtsbereich-Filter und
Suche bleiben. **Der frühere Modus-Umschalter (Primärweiche Rechner |
Vorlagen) ist damit abgelöst und entfernt**; `?modus=`-Links bleiben
harmlos; die Alt-Gliederungen ('art'/'bereich') sind aus dem Code
entfernt. Header = Zwei-Zonen (Logo links, Aktionscluster rechts:
Sprache · Methodik — Pro-Button entfernt 7.6.2026, Methodik seither auch
mobil), Mitte leer; Utility-Bar nur Pflichthinweis rechts, mobil
ausgeblendet.

**Design-Tokens (Feinschliff 5.6.2026, single source tailwind.config +
index.css):** Typo-Skala GESCHLOSSEN — micro 11 · overline 11 · xs 12 ·
body-s 14 · base 16 · body-l 18 · h3 20 · h2 25.6 (auch Ergebnis-Hauptwerte
mit `leading-none`) · h1 32 · display 36/44 (Heroes). **`text-sm`/`text-lg`
sind verboten** (Tailwind-lh weicht ab; body-s/body-l verwenden). Radien
komplett tokenisiert (--radius-sm…2xl). Status-Hintergründe nach EINEM
Rezept (`color-mix --status-tint 10%` auf Papier; AA geprüft). Motion:
--dur-fast/base/slow + --ease, Default-Easing global. Komponenten-Anatomie:
`lc-tile` (Ergebnis-Kachel) · `lc-notice[-warn|-danger]` eigenständig (kein
Inline-Padding!) · `lc-btn-sm` (36px) · disabled steckt in den
lc-btn-Klassen (keine disabled:-Utilities) · ein Aktions-Akzent
(lc-btn-primary; lc-btn-brass entfernt).

**Layout:** Inhaltsspalte einheitlich `max-w-content` = **70rem (~1120px)**
(Token in tailwind.config); 8-px-Skala `--space-1…24`, `--control-h` 44px,
`--pill-h` 36px. Hero text-geführt einspaltig (keine Deko-Grafik, bewusst
nicht animiert), Untertext ≤ 58ch; Determinismus-Claim genau EINMAL (Hero).
Kartenraster `repeat(auto-fill, minmax(340px, 1fr))`; Titel ohne Silben-
trennung (`text-balance`); Pills im Inhaltsblock, nur CTA per `mt-auto`
unten. Keine Ziffern in Sektionsköpfen/Sidebar (konsistent nirgends).

**Pro-Katalog = KACHEL-KATALOG (Umbau 6.6.2026 nachts, Live-Auftrag David;
Roadmap + Entscheide: FAHRPLAN-KATALOG-UI.md):** Die 17 Rechtsgebiete sind
kompakte Kacheln unter den 5 Obergruppen (Name · Zähler «X verfügbar · Y in
Vorbereitung» · verfügbare Werkzeug-Titel, geklemmt). Klick öffnet das
Gebiet als Panel in voller Breite unter der Kachel-Zeile (`?gebiet=` in der
URL, teilbar; nur ein Panel zugleich); die Disclosure-Sektionen samt
Scrollspy sind entfernt. Darüber: Anliegen-Zeile (lib/anliegen.ts, 8
situative Einstiege — ENTWURF, Abnahme David offen) + «Zuletzt verwendet».

**Suche:** EIN kompaktes Suchfeld in der Katalog-Seitenleiste (Desktop)
bzw. im Filter-Drawer (mobil) — filtert den Katalog live. Die frühere
⌘K-Befehlspalette ist entfernt (Entscheid David 5.6.2026). Seit 6.6.2026:
Suche/Filter aktiv → flache, gerankte Trefferliste statt Kacheln (Rang:
Titel > Keyword exakt > Keyword > Norm > Gebiet; lib/katalogSuche.ts —
dieselbe Logik testet die Suchbegriff-Goldliste katalogSuche.test.ts,
48 Paare Laie/Fach/Norm); `?q=` in der URL; «/» fokussiert das Feld;
Keywords kompakt verglichen wie Normen («Art.311» = «311 ZPO»).
Metadaten-Inventur: `npx vite-node scripts/katalog-inventur.ts`.

**Sprachen:** Umschalter sichtbar (Header); EN/FR/IT «in Bearbeitung» mit
DE-Fallback + persistentem Banner; KEINE maschinelle Übersetzung (fachkundige
Person später). `<html lang>` folgt der Locale; Fedlex-Links ebenfalls
(fr/it amtlich — Anker stichprobenverifiziert sprachunabhängig; en → de).

## Status-Modell (ehrlich, drei Zustände)

`entwurf` (oranger Top-Rand `--warn-500` + Outline-Badge «Entwurf»
(`.lc-badge-entwurf`), Tooltip «erstellt, fachlich noch nicht geprüft»;
dazu EINE Status-Legende über der Startseiten-Kachelwand statt lauter
Einzel-Badges — Design-Review 6.6.2026, Freigabe David) = gebaut, ungeprüft ·
`geprüft` (Goldrand, KEIN Wort-Badge) = fachlich geprüft — **aktuell
nirgends vergeben** · `geplant` (gedämpft, AA-konform ohne Opacity) =
«In Vorbereitung», ohne Norm-Pills/Artikel-/Tagesangaben.
**Alle NormRefs tragen `verified: false`**, bis David sie fachkundig gegen
Fedlex prüft (Anker selbst sind build-verifiziert, Format `art_335_c`).
Form-Gates der Vorlagen bleiben im Entwurf-Status voll funktional.
Status-Filter heisst «Nur verfügbare» (= nicht geplant).

## Katalog (Quelle: src/lib/startseiteConfig.ts — Single Source of Truth)

**111 Einträge: 64 Rechner + 47 Vorlagen** (Katalog-Ausbau 5.6.2026: +59
geplante Karten gemäss KATALOG-ROADMAP.md; Soll-Inventar dort gepflegt).
Felder: modus, art, rechtsgebiet (kanonisch, 17 Werte),
**rechtsbereich** (privat/oeffentlich/straf/uebergreifend), status, norms
(NormRef mit verified), href, schemaId/formvorschrift/output (Vorlagen),
szenarien (konsolidierte Rechner), related (modusübergreifend), keywords
(**tier entfernt 7.6.2026**, FAHRPLAN-EINE-HAUPTSEITE). VorlageArt um
**korrespondenz** («Schreiben & Erklärungen») erweitert. Neue geplante
Karten: norms [], kein href, neutrale Beschreibungen (Normentreue);
Roadmap-«[Gerüst]» als «Strukturiertes Gerüst …» im Text.

**Konsolidierung (43→34):** 9 Einzelkarten absorbiert — Klagebewilligung +
Fristwiederherstellung → ZPO-Fristen; Rechtsöffnung/Aberkennung/Kollokation
+ Arrest → SchKG-Phasen; missbräuchl. Kündigung + Massenentlassung →
«Arbeitsrecht — Fristen»; Miet-Anfechtung → «Mietrecht — Fristen»;
Verzugszins-vertieft → Verzugszins; SV-Leistungsverwirkung → ATSG-Karte.
`RechnerCard.szenarien` zeigt abgedeckte/geplante Szenarien auf der Karte.

**Spät-Session 7.6.2026 (Kurzspiegel; Details HANDLUNGSPLAN.md A.0):**
Daueranweisungen §0 Mehrwert-Test + §0a Perfektion-vor-Neubau · Roadmap
−7 geplante Karten (verifiziert) · AG-Programm fertig inkl. Notariats-
tarif-Korrekturen (ZH-Rahmen 123! SG floor!) · Startseite: leere Gebiete
als «In Vorbereitung»-Zeile, Rubrik einzeilig · Vereinheitlichung Runde 1
(Tagerechner-Hash/geteilter Teilen-Button, 7 Titel-Paare + Invariante) ·
Dossiers neu: gmbh-deltas-g0, gmbh-qualifizierte-gruendung,
ag-kapitalkategorien (Bau gesperrt), BGerR-Verifikation (35/35a-Split).

**Konsolidierung Runde 2 (7.6.2026, FAHRPLAN-KATALOG-KONSOLIDIERUNG,
Auftrag David «simplifizieren — ein Einstieg pro Rechtsfrage»):** Katalog
gesamt 115→112, verfügbar 35→32 gebaut, davon **28 sichtbar**. (a) GELÖSCHT
die 3 reinen Hash-Deep-Link-Karten: untermietvertrag → Karte «Mietvertrag
(Wohnen · Geschäft · Untermiete)»; schkg-/straf-zustaendigkeit → EINE Karte
«Zuständigkeit (Zivilprozess · Betreibung · Strafverfahren)» mit szenarien
(kehrt den Katalog-Split vom 6.6. um — Davids Delegation 7.6.). (b) NEU
`imKatalog:false` (BaseItem) + `KATALOG_KARTEN`: die 4 Kündigungs-Masken
(AN/AG/Mieter/Vermieter-Checkliste) behalten ihre Karten als SSoT der
Masken-Seiten (`karte(id)`!), erscheinen aber nicht mehr im Register/Suche —
ihre Auffindbarkeit tragen die Themen-Einstiege «Kündigung & Fristen im
Arbeitsverhältnis» (ex «Arbeitsrecht – Fristen») und «… im Mietverhältnis»
(ex «Mietrecht – Fristen»), deren Rechner-Seiten die Masken direkt verlinken.
(c) Kachel-Overline zeigt jetzt `Gebiet · Rechner/Vorlage` (Funktions-
Kennzeichen, EIN Template-Literal wegen SSR-Marker). Ausdrücklich NICHT
gemergt: GmbH-/AG-Gründung (zwei Werkzeuge, echte Rechtsform-Entscheidung),
Tagerechner↔ZPO/SchKG (gewollter Laien-/Fach-Doppeleinstieg), Rechner↔
Vorlage-Paare (§5: eine Engine, zwei Ausgabeformen). Goldliste deklariert
nachgezogen (misst jetzt KATALOG_KARTEN); Davids Abnahme der neuen
Titel-Wortlaute offen.

**Gliederung (seit Katalog-Ausbau):** beide Seiten = Rechtsgebiet-Sektionen
(GebietSektion, feste §4-Reihenfolge OHNE Relevanz-Sortierung) mit
Untergruppen Rechner/Vorlagen; innerhalb der Gruppen verfügbare vor
geplanten (sortiereKarten). Filter: Status («Nur verfügbare») · auf /pro
zusätzlich Rechtsbereich · Output-Typ (Rechner) · Dokument-Typ (Vorlagen);
Suche in der Seitenleiste. Grenzfall Vorlage «Einsprache»: straf
(Strafbefehl häufiger), Verwaltungsbefehl via Keywords.

## Rechner (Engines in src/lib/, alle rein/deterministisch, kein LLM)

Gebaut (entwurf): zpo-fristen, schkg-fristen, kuendigung-sperrfristen
(inkl. **Sperrtage-Zähler**: Kontingent 30/90/180 je DJ, beansprucht nach
Art.-77-Zählung, verbleibend, Rückfall-Zeilen — Komponente
SperrtageZaehler, auch in der kombinierten Ansicht), mietrecht,
verjaehrung (Zwei-Fristen, Stillstand-Union), gewaehrleistung (Zwei-Regime
1.1.2026), verzugszins (Segmente, Art. 85-Anrechnung), lohnfortzahlung
(Skalen; Engine-Guard AUF 1–100 %), erbteilung, **allgemeineFrist**
(Free-Tagerechner, Auftrag 5.6.2026: dünne Engine auf fristenEngine/
zpoFeiertage — dies a quo IDENTISCH zu zpoFristen, Systemtest AF-14;
getrennte Wochenend-/Feiertags-Toggles, Tage-zwischen-Hilfsmittel;
SR 173.110.3 als Gesetzes-Seiten-Pill, ELI SPARQL-verifiziert).
Feiertage algorithmisch (Computus) — keine Jahres-Klippe.

## Vorlagen-Plattform (src/lib/vorlagen/)

Generische Engine: `assemble(schema, antworten)` rein/deterministisch
(Bedingungs-Algebra eq/in/nichtLeer/and/or/not; wiederholeUeber; nummeriert
mit Leerlisten-Guard; Interpolation; Bausteinprotokoll). Renderer aus EINER
Quelle: vorlagenPdf (jsPDF, Banner-API, WinAnsi-Sicherung) + vorlagenDocx
(docx-Lib, lazy geladen, Word-Formatvorlagen; XLSX architektonisch
vorbereitet, nirgends ausgeliefert). Geteilte Wizard-UI:
components/vorlagen/ui.tsx (Field, NormLink locale-bewusst, Stepper).

**8 gebaute Vorlagen (alle entwurf):**
1. **Testament** (/vorlagen/testament) — eigenhändig: Abschreib-Mustertext,
   Pflichtteils-Panel, Gates 467/505/481/472. KEIN DOCX (Eigenhändigkeit).
2. **Patientenverfügung** (/vorlagen/patientenverfuegung) — Schriftform;
   Konsistenz-Engine R1/R2, harter Sterbehilfe-Block R6 (Art. 114/115 StGB);
   PDF + DOCX (Pilot Mehrformat).
3. **Vorsorgeauftrag** (/vorlagen/vorsorgeauftrag) — formMode-Weiche
   eigenhändig (Mustertext) / beurkundet (Entwurf, DOCX nur hier);
   Eligibility-Gate Art. 13; Grundstück-Sondervollmacht erzwungen.
4. **Schlichtungsgesuch Basel-Stadt** (/vorlagen/schlichtungsgesuch-bs,
   tier experte) — Routing mit Stopp-Karten (Miete/GlG → eigene Stellen,
   Art. 198), Mängelliste mit Schritt-Sprung, SG_SCHWELLEN hart codiert,
   Behörden-Stammdaten BS, Form-Gate (Exemplare = 1+Beklagte), PDF+DOCX,
   BEWUSST ohne localStorage (Anweisung); 12 Akzeptanztests.
5. **Einzelarbeitsvertrag** (/vorlagen/arbeitsvertrag) — ERSTE Vorlage auf
   dem generischen Wizard-Rahmen. Grundlage: normverifiziertes Gutachten
   Art. 319 ff. OR (5.6.2026); Validierungskern = Matrix absolut/relativ
   zwingend (Art. 361/362) + Schriftform-Klauseln (durch beidseitige
   Unterschrift erfüllt) + Disclosure (BGE 145 III 365, 149 III 202,
   129 III 276). Harte Gates: Probezeit ≤ 3 Mte, Frist ≥ 1 Mt (bei
   Befristung neutralisiert), Ferien ≥ 4/5 Wochen, Ferienabgeltung bei
   Vollzeit gesperrt, KV nur mit Ort/Zeit/Gegenstand + Einblicks-
   Bestätigung. Kantonale Mindestlöhne als DATIERTE Parameter
   (AV_MINDESTLOEHNE, jährlich verifikationspflichtig!). ArG in fedlex.ts
   ergänzt (Anker art_9/12/13/46 empirisch verifiziert). PDF+DOCX;
   16 Akzeptanztests. Deklarierte Gutachten-Abweichung: einheitliche
   Frist < Staffel zulässig per Art. 335c Abs. 2 (Hinweis statt Verbot).
6. **Mietvertrag Wohn-/Geschäftsräume** (/vorlagen/mietvertrag, Karte
   mietvertrag-wohnen) — Gutachten Art. 253 ff. OR/VMWG (5.6.2026).
   Zentrale Weiche objektTyp + Kanton. Gates: Kaution ≤ 3 Monatszinse
   (nur Wohnraum), Fristen 3/6 Mte, Index ≥ 5 J/LIK + Staffel ≥ 3 J
   (beide am Fedlex-WORTLAUT verifiziert), NK-Einzelausweis, MWST nur
   Geschäftsraum. DATIERTE Parameter: Referenzzins 1.25 % (1.6.2026,
   quartalsweise!), MWST 8.1 %, Formularpflicht-Kantone (BWO 4.2.2026,
   BE-Diskrepanz offengelegt, dynamisch per 1.11.). PDF+DOCX; 14 Tests.
7. **Vollmacht** (/vorlagen/vollmacht, Karte `vollmacht`) — EINE Maske mit
   Typ-Schalter Anwalts-/General-/Spezialvollmacht (Entscheid David
   5.6.2026 statt zweier Vorlagen; Grundlagen-Bericht «Vollmachten»,
   Downloads). Formfrei (Art. 11 OR) → ausgabeArt `fertig`, PDF+DOCX.
   Gemeinsamer OR-AT-Kern (Parteien natürlich/juristisch, mehrere
   Bevollmächtigte einzeln/gemeinsam, Substitution, Widerruf Art. 34,
   Befristung, transmortale Klausel Art. 35); besondere Ermächtigungen
   als Katalog wortlautnah zu Art. 396 Abs. 3 OR. Deterministische
   Form-Gates: Bürgschaft = SPERRE (Art. 493 Abs. 6 OR), Grundstück =
   Warnung (Art. 216 OR / Art. 86 GBV / Formfrage offen BGE 112 II 330),
   Bank = bankeigene Formulare, Prozess-Bereich = Art. 68 ZPO-Warnung,
   Vorsorgefall = Weiche zu Vorsorgeauftrag/PV (Gesundheits-Bereich
   bewusst NICHT wählbar). Ersetzt die geplanten Karten generalvollmacht/
   bankvollmacht. StPO/VwVG in fedlex.ts ergänzt (Anker art_129/art_11
   empirisch verifiziert). 20 Akzeptanztests.
8. **Klage im vereinfachten Verfahren – BS** (/vorlagen/klage-vereinfacht,
   Karte `klage-vereinfacht`) — zweite BS-Eingabe der SG-Familie
   (normverifizierter Auftrag 5.6.2026). Deterministisches BS-Routing:
   Arbeit ≤30k → Arbeitsgericht (§§ 73 f. GOG), GlG/Mitwirkung →
   Dreiergericht, Gewaltschutz/DSG/Miete-Kern → Einzelgericht (§ 71 GOG);
   ehrliche Stopps (>30k ohne Abs.-2-Materie → ordentlich; Arbeit >30k →
   § 73 Abs. 2-Hinweis; KVG-Zusatz → Sozialversicherungsgericht).
   Schwellen aus ZPO_SCHWELLEN (SSoT); Klagefrist Art. 209 Abs. 3/4 über
   die zpoFristen-Engine ('klagefrist_klagebewilligung', Gerichtsferien).
   ABWEICHUNG vom Auftrag offengelegt: Art. 114 ZPO kennt KEINE Miete-
   Position (lit. d = Mitwirkungsgesetz) → Miete im Entscheidverfahren
   nicht kostenfrei. Begründung = freiwilliger strukturierter Platzhalter
   (Behauptungs-Liste + Beweismittel) mit Verzichts-Baustein (Art. 245
   Abs. 1); Begehren beziffert/unbeziffert (Art. 84/85), Rechtsöffnungs-
   Antrag, Beilagen-Automatik (KB/Ausnahme/Vollmacht/Urkunden), Doppel-
   Hinweis Art. 131. SG-Parteitypen wiederverwendet (parteiZeilen & Co.
   exportiert). PDF+DOCX, ohne localStorage (wie SG). 20 Akzeptanztests.

Wizards 1–3 und 7 mit localStorage (`lexmetrik.vorlage.*.v1`, Hydration
array-gesichert); Vorschau als Funktionsaufruf (kein Remount). Eingaben
(4, 8) bewusst OHNE localStorage.

## PDF-Rechenbericht (src/lib/pdf/)

**Abend-Paket (5.6.2026):** Formulierungskonventionen (lib/konventionen.ts
SSoT + Linter-Test über echte Textausgabe; — → – plattformweit, «5 %»,
SG-Floskeln, Golden-Diff programmatisch als rein konventionell bewiesen).
Free-KACHELWAND (flach, FREE_REIHENFOLGE, Hero neu «Schweizer Recht,
berechenbar.»; Katalog.tsx pro-only). Versimplung: ui/Tabs + ui/
SelectionGrid (14+3 Stellen entdoppelt, SSR-byte-identisch), chf()
kanonisch, tote Katalog-Props raus (netto −175 Z.). Pro: Sektionen
starten EINGEKLAPPT, Zivilprozess & Vollstreckung zuerst. KOMBINIERTER
FRISTENRECHNER free (/rechner/tagerechner: Verfahrens-Tabs Allgemein/
ZPO/SchKG → bestehende Forms; §4 unangetastet; Trennungs-Querschnitt-
Test). Mobile-Check: Tabs-Overflow gefixt (overflow-x-auto), Grids
mobil-Basis. PROJEKTBESCHRIEB.md neu geschrieben.

**Pro-Katalog-Umbau (5.6.2026, Auftrag):** Tabs Verfügbar(17)/Gesamt(111)
(?ansicht=, Default Verfügbar), juristische Obergruppen als Super-Trenner
(lib/rechtsbereichGruppen.ts, 5er-Modell, 4er-Fallback per GRUPPEN_MODELL),
gruppierte Scrollspy-Seitenleiste (Rechtsbereich-Filter+Direkteinstieg
entfernt), Schnellzugriff ★Favoriten+Zuletzt (lib/schnellzugriff.ts,
localStorage, Stern nie auf geplant), istVerfuegbar()-Prädikat, Hero «17
sofort verfügbar». Free unverändert. BetragsFeld: Tausender-Apostroph in
22 CHF-Feldern. Visual-Checks (2 Agenten) GRÜN; P1–P3 gefixt.

**Teuerungsrechner (5.6.2026, /rechner/teuerung, Free):** LIK-Indexierung
mit amtlicher BFS-Reihe (src/data/likReihe.ts, generiert via scripts/
lik-reihe-generieren.py aus cc-d-05.02.08; 10 Originalbasen 1966–Mai 2026;
OPEN-BY). Basis-AUTO wie BFS-Rechner; Modi Indexmiete (Art. 17 VMWG
wortlaut-verifiziert, Senkungspflicht)/Unterhalt (286/128 ZGB)/generisch.
VMWG neu in fedlex.ts. MONATLICHE PFLEGE: Reihe nach BFS-Publikation
regenerieren. Eingaben: Behörden-Registry +Miete/Diskriminierung BS
(Staatskalender 5.6.2026); SG-Forum-Häkchen entfernt (Kantonswahl).

**Logik-Nachrechnung + Versimplung (5.6.2026):** 4 Cluster unabhängig vom
Code aus dem Gesetz nachgerechnet (100+ Handfälle, 6912er-Erbrecht-Gitter,
576er-ZPO≡Allgemein-Gitter): KEINE Berechnungsfehler. Offen für Davids
Entscheid: Sperrtage-ANZEIGE-Konvention (beansprucht Art.-77 vs.
Kalendertage; Endtermine identisch). Versimplung golden-bewiesen
(scripts/golden-outputs.ts, 53 Fälle byte-gleich): naechsterWerktag/
dauerTageInklusiv kanonisch, fmt/iso ×7 dedupliziert, Vorlagen-Helfer
zentral, Rückwärts-Spiegelung direkt.

**Tagerechner-P1 (5.6.2026, Auftrag «Verbesserung Fristenrechner»):**
Rückwärtsmodus (spätester Handlungstag; Verschiebung defensiv «keine»,
Vorverlegung nur mit Ungeklärt-Vorbehalt), Zustell-Helfer (rein informativ:
7-Tage-Fiktion, A-Post Plus Art. 142 Abs. 1bis ZPO), .ics-Export (RFC-5545
inkl. Folding, deterministisch) + Permalink (validiert), Validierung/A11y;
BGE 150 III 367 nachgeführt. AV/MV-Schemas: v1.1.0 (Vertiefungs-Gutachten).
Golden-Output-Protokoll: scripts/golden-outputs.ts (53 Fälle, vergleich-Modus).

**Formatvorlagen-SSoT (5.6.2026, `formatvorlagen.ts` — drei Grundlagen-
Berichte):** Typografie je Format + AUSGABE_REGELN je AusgabeArt
(abschrift = DOCX hart gesperrt · entwurf = PDF-Wasserzeichen «ENTWURF»
[VA beurkundet] · fertig). Eingaben mit Korrekturrand 3.5 cm rechts,
Anrede/Schlussformel/«im Doppel» (Rollen anrede/schlussformel);
Verträge mit Ausfertigungs-Vermerk + QES-Hinweis (Art. 14 Abs. 2bis OR).
Pro-SITZUNG (lib/proSession.ts): Pro betreten = eingeloggt (localStorage,
Reload-fest, «/»→/pro), Header «Ausloggen»; Andockpunkt Zahlungs-Gate (System offen).
Einzeilen-Heros Free+Pro; Gebiets-Titel in Sans.

**Formatvorlagen der Vorlagen-Renderer (5.6.2026, Referenz-Layouts):**
Schemas deklarieren `format` (verfuegung·vertrag·eingabe) + Absatz-`rolle`n
(absender/adressat/datumzeile/betreff/rubrum/parteien/unterschrift); PDF,
DOCX UND Live-Vorschau interpretieren beide aus EINER Quelle. Arial/
Helvetica 11, Haarlinien unter Titel/Betreff, hängende Einzüge (1./–),
gezeichnete Unterschriftslinien, Fusszeile je Seite, Disclaimer 8pt am
Ende; Eingaben OHNE Dokumenttitel (Betreff trägt ihn), langes Datum.
Engine-Konvention: Platzhalter auf …Satz/…Zeile verschwinden leer
ersatzlos (sonst «________»-Vorschau-Strich). Visuell verifiziert via
`.scratch/pdf-beispiele.ts` + qlmanage-Thumbnails.

pdfModel (reines Block-Modell: kopf/hero/tabelle/schritt/hinweisbox/norm)
+ pdfRender mit **eingebetteten Markenschriften** (Fraunces/Geist/GeistMono
als Base64-TTF, ~0.4 MB NUR im lazy Klick-Chunk). Hero-Hauptkennzahl,
Eingaben-Tabelle (Mono rechtsbündig), unzerreissbare Schritte mit
klickbaren Norm-Pills (Vormessung inkl. Pill-Umbrüchen), sichtbare URLs,
Status «Berechnung vollständig». Verzugszins + Kündigung liefern hero.
Visuelle Prüfung: qlmanage-Thumbnails + Swift-PDFKit-Split.

## Oberste Ebene: vier Output-Typen

| Sektion (`art`) | Inhalt |
|---|---|
| Fristen (`frist`) | Prozessuale und materielle Fristen |
| Beträge & Quoten (`betrag`) | Geldansprüche, Zinsen, Kosten, Quoten |
| Zuständigkeit & Einordnung (`zuordnung`) | Gericht, Recht, Verfahrensart |
| Werkzeuge (`werkzeug`) | Rechtsgebietsübergreifende Hilfsrechner |

## Grossausbau 5./6.6.2026 — Zuständigkeits-Plattform (Kurzkarte)

**Drei Rechtswege live** im Zuständigkeitsrechner (je EIGENE Engine, §4):
- **Zivil** (`lib/zustaendigkeit.ts`): 9 Streitsachen · Fahrplan + kantonale
  Kosten-Rahmen (alle 26, `data/zustaendigkeitKosten.ts`) · Art.-113-Kosten-
  freiheit · konkrete Schlichtungsstelle aller 26 Kantone
  (`data/schlichtungsstellen.ts`) mit **PLZ→Gemeinde→Amt** gemeindescharf in
  ZH/AG/SG/TG/FR/ZG/AI (`data/schlichtung/*`, amtliches swisstopo/BFS-Register,
  Generator `scripts/plz-generieren.ts`) · **Handelsgerichte** ZH/BE/AG/SG ·
  **Rechtsmittel-Modus**: Berufung/Beschwerde-Weiche (308/319 ZPO) + obere
  Instanz aller 26 Kantone (`data/obereInstanzen.ts`) + BGer-Schwellen
  (Art. 74 BGG, BGG-Cache verifiziert).
- **SchKG** (`lib/schkgZustaendigkeit.ts`): Betreibungsort-Kaskade 46–55,
  11 Anliegen (Rechtsöffnung/Aberkennung/Widerspruch/Kollokation/Arrest/
  Konkurs/Aufsichtsbeschwerde) mit Verwirkungsfristen-Badges; Gebühr
  Zahlungsbefehl nach Art. 16 GebV SchKG (Stand 1.1.2022, 2026-Vorbehalt
  im Verfallsregister); BJ-Betreibungsämter-Verzeichnis verlinkt.
- **Straf** (`lib/strafZustaendigkeit.ts`): StPO-Decision-Tree (Spezialforen
  35–37 → Tatort 31 → Kaskade 32; Weichen 33/34/38/40/41/42); Anzeige-
  Fahrplan (301; Strafantrag 3 Mt., Art. 31 StGB); zentrale StA aller
  26 Kantone + Bundesanwaltschaft (`data/staatsanwaltschaften.ts`).

**Vorlage Schlichtungsgesuch kantonsübergreifend:** Behörden-Auflösung für
alle 26 Kantone (`components/vorlagen/SgBehoerdenWahl.tsx`; Adressat-Kette
Hand > BS-Registry > Recherche > Platzhalter). **UX-Programm** (9 Etappen-
Commits) + Design-Konsistenz-Sweep abgeschlossen. **Bibliothek:** 21 Dossiers
(4 Regelwerke ZPO/SchKG/StPO/Erbrecht; Behörden Zivil/Straf/Erbgang; Kosten)
— Status je Dossier in bibliothek/INDEX.md (SSoT-Karte dort).

## Offene Punkte (nächste Session)

1. **Fachliche Abnahme durch David** (er ist die «fachkundige Person»):
   **Erste Sichtung aller 4 Vorlagen am 5.6.2026 erfolgt** (Bausteine,
   Gates, Schwellen vorläufig für gut befunden). SEIN ENTSCHEID: **alles
   bleibt `entwurf` / `verified: false`** bis zur Wort-für-Wort-
   Detailüberarbeitung («wir überarbeiten alles später»). Erst danach
   NormRefs auf verified:true und Einträge einzeln auf «geprüft» (Goldrand).
2. **Seine Antworten ausstehend:** redundante Tageszählungs-Hinweise im
   Verzugszins-Bericht kürzen? · DOCX-Standardannahmen ok (Testament ohne,
   VA nur beurkundet)? · Bausteinprotokoll in PDF/DOCX-Exporte aufnehmen?
3. ~~Phase 4: Experten-Gating als Wrapper um /fachpersonen~~ → **entfällt
   ersatzlos** (Aufhebung der Free/Pro-Zweiteilung, Auftrag David
   7.6.2026); eine spätere Monetarisierung bekäme einen neuen,
   funktionsbezogenen Zuschnitt (STRATEGIE-PLATTFORM, Gate G1).
4. **Schlichtungsgesuch:** offene Verifikationen (kantonale §§ GOG/EG ZPO/
   GGR, PLZ 4001/4051, Art.-135-Randtitel) — in der UI offengelegt.
5. Kleineres: Detailseiten-Titel (calculators.ts) an neue Katalog-Titel
   angleichen? · Datepicker-Pfeiltasten (A11y-Kür) · Markenschriften auch
   für Vorlagen-PDFs · ggf. sichtbare Rechtsgebiet-Zwischentitel in den
   Untergruppen.
6. ~~Verschlankung Stufe 2~~ → **erledigt 5.6.2026** (generischer Rahmen
   in components/vorlagen/wizard.tsx, s. oben). Optional verbleibend:
   Form-Gate-Sektion (brass-Box mit Checkliste) als vierte geteilte
   Komponente — Texte sind je Vorlage fachlich verschieden, daher bewusst
   zurückgestellt.

## Backlog (bewusst NICHT gerendert)

Aufnahme nur bei klar regelbasiertem, deterministischem Umfang — sonst
Widerspruch zu «feste Rechenregeln, keine Schätzung»: Konsumkredit-Widerruf
(Anwendungsbereich klären) · Schadenersatz/Genugtuung · Unterhalt ·
Tagessatz · Mietzinsherabsetzung · Konkurrenzverbot (alle wertend/Ermessen).
