# LexMetrik — Struktur & aktueller Stand

**Verbindliche Grundprinzipien: `CLAUDE.md`** (§1 Logik vor allem; §6
Refactoring-Protokoll) — dieses Dokument hier beschreibt den Zustand.

**Dokument-Ordnung im Root (Aufräumung 10.6.2026, Auftrag David):** Im Root
liegen nur AKTIVE Steuerungsdokumente — CLAUDE/README/STRUKTUR/ROADMAP,
Projekt- und Strategie-Papiere (PROJEKTBESCHRIEB, STRATEGIE-PLATTFORM,
WACHSTUM-REGLEMENT, BETRIEB, KATALOG-ROADMAP). Die AG-Bausteinliste ist seit
dem 14.8.2026 (Entscheid David) **kein Bestand mehr**, sondern ein Erzeugnis:
`npm run abnahme:ag` schreibt sie bei Bedarf in <1 s ins Root, gitignoriert. Die
laufenden Fahrpläne liegen seit AP-8 der QS-TOK-Aufräumwelle (31.7.2026) NICHT
mehr im Root, sondern in **`fahrplaene/`** (Stand 3.8.2026: 27 Dateien —
NOTEBOOKLM-EINSATZ und OPENCASELAW-QUELLEN sind mit der Aufräumung 3.8.2026 nach
`archiv/` gewandert; Dateinamen unverändert, geführt über `ROADMAP.md` /
`npm run plan:next`; das Link-Tor `check:plan` scannt genau diesen Ordner). Aus der früheren Aufzählung
ist nur noch VORLAGEN-AUSBAU aktiv; GRUNDLAGEN, GMBH-GRUENDUNG, BGER-RECHTSWEG,
VERTRAGS-VARIANTEN und FUNDAMENT-UMBAU sind mit der Archiv-Welle 31.7.2026
nach `archiv/` gewandert, AG-GRUENDUNG schon am 7.6.2026. Abgeschlossene
Fahrpläne (DESIGN, RECHNER-DESIGN, VEREINHEITLICHUNG, TOKEN-DISZIPLIN — ins
Archiv 13.6.2026; die 11 verwaisten Fahrpläne der QS-TOK-Aufräumwelle —
31.7.2026) und historische Dokumente liegen in
**`archiv/`** (Index: `archiv/README.md`; Dateinamen unverändert, damit
Verweise in Code-Kommentaren per grep auffindbar bleiben). Wissens-Quellen
(PDF/DOCX, gitignored) in `bibliothek/quellen/` (`SICHTUNG.md`).

**Pflegeregel Session-Karten (Token-Disziplin 11.6.2026; mechanisiert 10.7.2026,
QS-TOK/T1):** Dieses Dokument ist Nachschlagewerk, keine Pflichtlektüre (T19;
die frühere Kopfzeile «wird in jeder Session gelesen» war seit der Entkopplung
falsch — korrigiert 30.8.2026). Karten abgeschlossener Sessions (älter als
~2 Arbeitstage) wandern BYTE-GENAU nach `archiv/STRUKTUR-SESSIONKARTEN.md`
(neue Blöcke oben anhängen); hier bleibt der Verweis-Abschnitt. Neue Karten
werden direkt unter dem KARTEN-Anker eingefügt (jüngste zuoberst).

<!-- KARTEN -->
## Session 6.9.2026 (Tag) — W2·24 Design-Identität «Sammlung»: Landung 1 (PR #739), Übergabe der Sweeps an Session «W2·24 Design-Identität Sweeps»
**Auftrag David (wörtlich, Chat 5./6.9.):** «home seite nochmals komplett überarbeiten» · «ich öffne alles» (Council-Schalter V3) · «was können wir machen um designtechnisch nicht so auszusehen» (legaldeadline.ch) · «ja bau das, run till dry … recherchiere was du dafür alles ändern musst … lass zwischen den runden einen ästhetikprüfer darüber schauen … split screen» · «alles angleichen», «nicht trist», «keine schwer erarbeitete Funktion darf verloren gehen», «analog Browser», «spare Tokens», «schnell und effizient». Fable orchestrierte ausschliesslich; Bau Opus/Sonnet in ~30 Worktrees, Prüfer Opus, Recherche Sonnet + Gemini (Messzeilen im Fremdagenten-Fahrplan).
**Gelandet (eine PR):** R1 Grundschicht (Literata opsz 450 + Archivo, Papier/Tinte D12 14.7:1, vier Registerfarben, Radien 0, Overlines ohne Versalien, 146 Kontrastpaare) · R2 Rahmen (Titelblatt ohne Bereichs-Reiter, Arbeitsleiste = Reiterleiste: frei ziehbar, «+», Alt-Kürzel, Rechtsklick-Menü, Reiter für beide Panes, Materialien reiterfähig, Kurzform folgt der Lesestellung, Höhe reserviert; Seitenleiste überall, Standard eingeklappt, Inhalt als direkte Ziele) · R10 Startseite «Pult» (Begrüssung, fünf Bereiche, Zuletzt, schaltbare Module, keine eigene Suche) · Kopf-Suche als ein Objekt · R6 Leser (Satzspiegel ohne Randspalten, Randtitel im Kopf, Bezüge-Zeile mit Zähl-Datei je Erlass, Erlass-Suche im Kopf, Brotkrume weg, Gliederung als Links, CLS-Fix Tieflink 1.17→0.04) · R12 (Übersichts-Köpfe, ein Filter, Kernerlasse mit einem Klick, Listen als Tabelle, Facetten als Text-Schalter) · R5 (Wizard ohne Leerflächen, Menü-Baustein, Karten auf Linien) · Perf-Fix fedlex/spannen (Gegenprüfung Opus bestanden; «14.8 s LCP» war Messfehler neben Builds) · Bibliothek «design-identitaet-2026-09» (drei Recherchen) · Übergabe `abnahme/design-identitaet/uebergabe/`.
**Prüfer-Verdikte:** R1/R2/R3/R6/D23+R11 je «bestanden mit Auflagen», Auflagen eingebaut; Funktions-Inventare (42 Reiter-Funktionen, 13 Leser-Handgriffe, Startseite) per Browser ausgeführt: nichts verloren.
**Übergeben (Session 2, eigenständig):** R9 Einheitlichkeit, R7 Beschriftungen, R8 Abschneide-Lauf (Tor-Zweig `feat/w2-24-r8-abschnitt`), Gesamtprüfung, Reglement-Nachzug, Folgeschritte (Anheften/Arbeitsmappe, Entscheide+Materialien am Rand, Perf-Rest fremdRoutingFormB/artikelnPluralVerweise, Kürzel-Links im Zähler-Generator, istRisikoPfad für bezuege-zaehler, Jules-Tickets Datei-Splits). Offene David-Entscheide: L6 Pane-Name vs. «keine Doppelkrume», leerer Reiterstreifen.
**Lehren (verankert per Skill `lehren`):** L-O1 Worktree vor dem Dispatch als eigener Schritt (nie hinter Tore ketten) · L-O2 `git worktree add` nur mit absolutem Pfad (verschachtelte Worktrees f1b/f1c) · L-O3 Shards nach jedem Merge regenerieren · L-O4 im «run till dry» nie mit leerer Antwort enden (Nacht 5./6.9.: Session archiviert, Bau stand) · L-O5 keine Perf-Messung neben Builds · L-O6 Prüfer-Modell = Bauer-Modell (Opus/Opus) war unvermeidbar (Fable gesperrt, Sonnet unter Mindeststufe) — offengelegt.

## Session 6.9.2026 (Nachmittag/Abend) — «Entstehung am Artikel»: Zielbild, 7 Erst-Recherchen, klickbarer Entwurf, 5 Tiefen-Runden, 2 Kritik-Runden, Spec §11 Fassung 4 — NUR PLAN, kein Code (David: «anfangen erst auf mein Go»)
**Auftrag David:** «Materialien und Wegleitungen maximal sinnvoll verzahnen … Gesetzgebungsprozesse … suche mit mehreren Agenten und Gemini», «Vorbilder auf GitHub, verschiedene Länder, bspw. Deutschland», buzer.de analysieren, «jetzt der Plan … auch wie die Verzahnung optisch dargestellt wird», Design-Freigabe zum Entwurf («passt so grundsätzlich; nicht überladen, nur auf Wunsch sichtbar»), dann «noch keinen Code, nur planen, tief recherchieren, mehrere Runden», «zuerst Bundesebene».
**Recherche (Bibliothek `materialien/entstehung-2026-09-06/`, 18 Dateien, alle ERSTRECHERCHE, Abnahme David offen):** Curia Vista OData ohne Schlüssel (`Objective` = Join Botschaft→Schlussabstimmung→AS→Referendumsfrist; Lizenz-Auflage Quellenangabe) · Fedlex-Graph trägt die Verfahrenskette `type-projet` (7299 Botschaften/4931 Beschlüsse/1868 Referendumsfristen/629 Abstimmungstermine) · BBl-HTML mit `art_`-Ankern nur 22 % der Botschaften und erst ab 16.4.2025 · historische Konsolidierungen als HTML erst ab 1.1.2021 (Synopse = Fenster) · kein `<mod>` im AS-XML · BS data.bs.ch CC BY 4.0 reif, ZH nur CMI-Rohfeed, VS lex.vs.ch REST (Neufund via `gemeinde-bister/openmun-lex`) · Top-8 Wegleitungen (BSV zuerst, FINMA ohne ID-Schema) · kein Portal in DE/AT/UK/EU/FR/US/NL/CH verknüpft Artikel mit ganzer Entstehung + Praxis (Lücke) · buzer.de = Vorbild Änderungshistorie je Paragraph + satzgenaue Synopse · **Repo-Fund: G-HIST existiert** (`public/normtext/historie/`, 26 686 Ereignisse mit AS/BBl-Links, `ArtikelHistorie.tsx`, `W2·5i-HIST-ANSICHT` 26.7.2026) — M15 damit erledigt.
**Gemini-Messung (FAHRPLAN-FREMDAGENTEN §5, 2 Zeilen):** Curia-Frage: Sonnet empirisch belastbar, Gemini «unklar» ohne eigene Abfrage; Synopse-Frage: beide Gemini-Kernaussagen («Fedlex-Fassungsvergleich», «`<mod>` im AS-XML») von Opus R2 widerlegt. Werkzeug-Falle: `timeout` fehlt auf macOS (zwei leere agy-Läufe).
**Spec:** `FAHRPLAN-MATERIALIEN-VERZAHNUNG.md` §11 in vier Fassungen (Kritik A Opus 20 Befunde, B Sonnet 5, Runde 2 Opus 14; Einarbeitungs-Tabelle §11.0). Ergebnis: zugeklappt bleibt der bestehende «Gilt seit»-Chip unverändert; Karte in der Textspalte (Fassungsleiste, Änderungskarte mit drei Begründungs-Zuständen, Synopse ab 2021, Praxis erst nach Aufklappen); Historie-Generator/-Shard unangetastet; kein drittes Sidecar (Revisions-Sidecar trägt `titelDe`+`botschaftKey`); Curia nur aggregiert, keine Personendaten, Monatslauf; Synopse nur Alt-Block, Deckel 8/2 MB, E5.0 Vor-Messung; Diagnose-Register statt Teilmengen-Tor. ROADMAP: `W2·6c-ENTSTEHUNG-DATEN/-LESER/-SYNOPSE` (`blocked · david-go-entstehung`), M15 absorbiert, M16-Datenanteil → SYNOPSE. Entwurf-Artefakt «Entstehung am Artikel» (claude.ai, echte Daten Art. 336c OR + DSG-Zeitstrahl).
**Konflikte/§17:** E3 wartet auf alle neun Slot-verlagernden W2·24-Branches (4 nicht im Sammelbranch; `r6` stale, würde #734 zurückbauen — Hinweis an die W2·24-Session) · Nebenbefund C9: `check:paritaet` ingestiert `public/normtext/historie/**` nicht (Kommentar behauptet Vollabdeckung) — Roadmap-Eingang beim Go · `scripts/fedlex-sparql.ts` Z. 31 verweist auf nicht existierenden Skill `scraping-swiss-official-sources` (R2).
**Wartet auf David (Fahrplan §11.9):** Go E1+E2 · Personendaten-Regel · Ständerat ohne Zahl · Botschafts-Anker als Bonus (22 %) · Abstimmungsresultate nur Link · Curia-Auflagen · Abnahme Stufe-1-Dossiers.

## Session 5./6.9.2026 — Rules-as-Code-Sichtung, drei Fremdnutzen-Recherchen, Roadmap-Rotation (#733), W3-TARIF-STAND gelandet (#734)
**Auftrag David:** openfisca-aotearoa und Catala analysieren («kein code anfassen»), «können wir etwas direkt verwenden?», Tarif-Ist sichten, Bibliothek + Roadmap anlegen, «suche auch nach sinnvollen ideen die bereits bestehen … verwende gemini», «leg alles in roadmap ab was sinnvoll ist», dann «bau den tarif-schritt».
**Recherchen (Bibliothek, alle ERSTRECHERCHE):** `recherche/rules-as-code-sichtung-2026-09-05.md` (OpenFisca AGPL/nur Muster · Catala Apache/`dates-calc` als Vorbild, kein JS-Backend · Tarif-Ist: Anker/Quelle/Stand je Eintrag vorhanden, keine Zeitachse, `stand` Anzeigetext in ≥4 Formaten, kein Tarif-Drift-Tor · §8 Repo-Suche Gemini ∥ Sonnet: Gemini 2/15 Repos erfunden, 3 Lizenzen falsch — Messzeile FAHRPLAN-FREMDAGENTEN §5; einziger Direktfund legalize-ch als Test-Orakel) und `recherche/fremdnutzen-suchrunde-2-2026-09-06.md` (amtliche Gebührenrechner: **Negativbefund**, nur VS-Excel/SG-Tabelle/BGer-Tarif als Golden · TERMDAT via LINDAS, Lizenz offen · Fedlex-eId DE/FR/IT unbelegt · MIT-Stemmer · 12 Portal-Bedienmuster, 3 neu · BEKJ ohne Formatvorgabe · kein Zotero-Translator fedlex/bger). Sichtung 2.9. trägt Nachtrag-Tabelle «wo integriert».
**Roadmap:** ~35 neue Unterzeilen unter bestehenden Dächern (QS-CODE-PROP 3 Invarianten, W3-TARIF-STAND + Folgeschritte A/B + Golden-Quellen + 4 Nachträge, QS-KORPUS legalize-ch/Zitat-Dreistufigkeit/rcds-Testdaten/LexWork-Vollzug/void-main-Tor, K-15/K-16, M15/M16, W2·8 Zitierstil GTR + Zotero, W3-AUSBAU APIs/BSV/Existenzminimum/FR-IT, W2·5m 3 Leser-Muster, QS-VERWENDEN V9–V12, Suche-Idee, Geparkt RaC-Sprachen + Produktentscheide). Neuer Schritt nur **W3-TARIF-STAND** (feld werkzeuge).
**#733 Roadmap-Rotation (4da9588fb):** `check:steuerdeckel` war auf main rot (ROADMAP 113 KB > 100 KB, verursacht auch durch die Zeilen dieser Session); 40 `[x]`-Zeilen wörtlich in die Chronik, 94 KB; Zweifelsfall W2·23 (`done`, einziger Link auf FAHRPLAN-STARTSEITE-V4) bewusst belassen — Fahrplan-Archivierung offen.
**#734 W3-TARIF-STAND (922275527, Risikopfad):** Bau Opus (lex-daten): kein neues Datenfeld — `stand` steht 68× in Golden, ISO ist Projektion (`scripts/tarif/stand.ts`, konservativ, mehrdeutig ⇒ unbekannt), Verdikt `drift-logik.ts`, Runner `tarif-drift.ts` (`check:tarif-drift`, 84 Abfragen ~1:20 min, bestehende LexWork-/ZH-Adapter; `lexworkApiUrl` nach `lexwork-url.ts` ausgelagert — Import-Nebenwirkung `void main()` behoben). **Erstlauf: aktuell 557 · DRIFT 93 (34 Erlasse) · unklar 304 · unerreichbar 0**, inkl. SG sGS 941.12 (2808→3863). `src/data/tarif/**`, `src/lib/**`, Golden byte-gleich. Rot-Beweise GR/SG (Bau), ZG (Prüfer), abrogated-Test (M2). Gegenprüfung Opus, frischer Kontext: 75 Erlasse selbst geöffnet, kein falsches Grün, Befunde M1 (Zwei-Daten-Regel ⇒ latentes Grün) und M2 (`abrogated` ohne Verdikt) im Nachzug behoben; die in dieser PR neuen Tests 3/4/5 wurden auf die konservative Regel korrigiert (kein main-Bestandstest). Code-Lupe Sonnet: Timeout-Option statt totem Signal, `enactment` nur strikt ISO. **Modellregel-Abweichung:** Bau und Prüfung beide Opus (Fable-Verbot 1.9. + Minimum «stark» lassen kein anderes Paar zu); Unabhängigkeit über getrennte Agenten.
**Lehren/§17:** (1) Gemini-Repo-Listen nur nach `gh api`-Siebung (Fahrplan §5, Regelzeile dort). (2) `scripts/tarif/**` liegt ausserhalb `istRisikoPfad()` — Roadmap-Zeile unter W3-TARIF-STAND, mit Rot-Beweis-Auflage. (3) Parallel laufende Tore im selben Worktree erzeugen CPU-Kontention: `suche.test.ts` Hook-Timeout 95 s (isoliert 39 s), e2e-CLS-Ausfälle disjunkt zwischen Läufen — Klasse bekannt (Fehlerbuch/QS-DATA-INGEST-DRIFT), keine neue Regel. (4) Ein Bau-Agent hielt bei einem Hintergrundlauf an, ohne Bericht — Fortsetzung durch Orchestrator-Handarbeit; bekannte 9-min-Regel, kein neuer Anlass.
**Wartet auf David:** Drift-Nachverifikation der 34 Erlasse (Risikopfad, eigener Schritt, dann `check:tarif-drift` in die Netz-Kette) · Verjährungsrevision 2020 als echte Weiche · TERMDAT-Lizenzanfrage · FR/IT-Reihenfolge · Browser-Erweiterung/MCP-Server (Geparkt) · Prototype Fund (Portal 6.9. Mitternacht).

## Session 5.9.2026 (Abend) — W2·23 Startseite V4 «Werkbank» gelandet (#730, #732), W2·24 Design-Identität angelegt (#731)
**Auftrag David:** «home seite nochmals komplett überarbeiten», Council-Schalter V3 ausdrücklich geöffnet («ich öffne alles»), Begrüssungen zurück, Kopf-/Seitenleiste frei, Endziel «Taschenmesser für Juristen, Schwerpunkt verzahnte Gesetze und alle staatlichen Infos an einem Ort»; «run till dry», «spare Tokens». Fable orchestrierte (Spec als Datei-Zeiger `fahrplaene/FAHRPLAN-STARTSEITE-V4.md`), Bau zwei Opus-Agenten in getrennten Worktrees (A Startseite, B Shell), Rebase Sonnet; Koordination mit der W2·19-Session per Session-Nachricht (Fläche abgegrenzt, index.css nur additiv).
**Gelandet:** #732 (A) Hero mit Begrüssungs-Pool (Tageszeit, kuratiert aus dem V2-Pool, `lib/begruessungen.ts`), H1 «Schweizer Recht an einem Ort», Beispiel-Chips, Gesetze-Block Bund + 26 Kantone mit Erfassungszahlen, Ein-Zeilen-Frist (Vollrechner trägt den Kalender), vier Kacheln, «Jüngste Entscheide im Korpus» + `ui/KorpusStand`; #730 (B) Topbar ohne Zweitsuche auf «/», Schriftregler nach `/einstellungen` (Baustein von W2·19 gewinnt), Seitenleisten-Fuss Korpus-Stand; #731 Schritt W2·24 + Deckel-Rotation (SEO-BASIS, QS-AUTOPILOT-STUFE1 → Chronik).
**Design-Identität (W2·24):** Anlass legaldeadline.ch (dieselben drei Signaturen Creme+Gold, Gold-Versal-Etiketten, weiche Karten); Gemini-Recherche (Paletten, OFL-Schriften, Amts-Vorbilder) im Scratchpad, Überführung nach `bibliothek/` beim Varianten-Bau; Auszugs-Artefakt mit drei Handschriften (Petrol/Plex · Behördenblau/Public Sans+Merriweather · Bundesrot/Plex+Source Serif) an David — Wahl offen.
**Lehren:** ein gemeinsamer Fahrplan-Commit in zwei parallelen Bau-Branches erzeugt beim zweiten Rebase einen Skip-Konflikt (hier nur Kommentare) — künftig Fahrplan zuerst als eigenen Doku-PR landen, dann beide Pakete von main abzweigen; `check:steuerdeckel` vor dem Anlegen neuer Schritte messen (zwei Schritte à ~1 KB rissen den ROADMAP-Deckel).

## Session 5.9.2026 (Nachmittag/Abend) — Dauerauftrag «Token sparen» + «alles Sinnvolle» + UI-Konsistenz Runde 6: PRs #718–#721, #728
**Auftrag David:** Runde 2 Token-Sparen, dann «bau auch sonst an sinnvollen Dingen bis stop», «UI-Verbesserung grösser machen», «alle Entscheide nach deinen Empfehlungen», Jules einsetzen; Abschluss «bring alles zu Ende». Fable orchestrierte; Bau Sonnet, Prüfer Sonnet/Opus.
**Gelandet:** #718 QS-EFFIZIENZ Runde 2 (Gate-Rot-Kondensat 800→17 Zeilen, check-parallel leise, Fahrplan-Kopie −9 KB, Landungs-Skill −3.5 KB) · #719 QS-UI (Marken-Präfix-Tests, Wächter-Globs ArtikelBody.*) · #720 QS-UI Nebenfunde (Konventions-Wächter UI-Strings, Checkbox-Grösse, /einstellungen SEO) · #721 W2·18 Fix-Batch (istHuelle weg, design-tokens Kommentar-Strip, Erlass-Titel ohne Kürzel-Dopplung — Gegenprüfung fand Teilwort-Falle ZEMIS-V/Staatenlose, gefixt) · #728 W2·19 Runde 6 (6 Finder, 14 Befunde, R6-A…D) + Entscheide-Batch (Baum-Namen, R8 Hover/⧉-Quittung, check:feed in CI, Näfelser Fahrt 2027 = 1.4. amtlich, Lizenz-Ausnahmen behalten).
**Jules:** Tickets #722–#724 (Checkbox-Baustein, 15 Dateien) → PRs #725–#727, Opus-Prüfung + Cherry-Pick-Landung (Sammel-PR, Ergebnis siehe Fahrplan FREMDAGENTEN §5). Prototype Fund gestrichen (David; Lizenz ohnehin nicht Open Source).
**Lehren:** Setup-Timeouts der Datenhaltungs-Suchtests (95 s) und E2E-Viewport/CLS-Latten werden bei ≥ 4 parallelen Bauern + Stop-Hook regelmässig rot, isoliert grün — Klasse «Kontention», in Fehlerbuch §4 vermerkt; Steuerdeckel `check-*.ts` zweimal per Prosa-Diät gehalten (−24 KB gesamt), Hook-Deckel vom Klassifizierer gesperrt (Memory). Startseiten-Neubau läuft in Parallel-Session (Worktree, Fläche abgegrenzt).

## Session 5.9.2026 (Mittag) — QS-EFFIZIENZ: sechs Checklisten-Positionen, PR #717 (a647b7a62)
**Gebaut (Sonnet-Bauer, Opus-Gegenprüfung «bestanden mit Auflagen», Auflagen im PR behoben):** `npm run projektionen` (Zähler/Feed/Historie/E2E-Shards; Manifest bewusst draussen — Pin vor Drift-Prüfung) + Landungs-Skill Nachkontrolle 8/9 · `schlankheit:update` gezielt (unbekannte Pfade Exit 1, Rot-Beweis, #699) · Paritäts-Tor Gegenrichtung ci.yml→lokal inkl. npx-Pfadform, `ALLOWLIST_NUR_CI` (Rot-Beweis, #712) · Messung Klasse `entwurf-antwort` (Label auf #707, Schema 5, Zeitreihe migriert) · `src/lib/suche/` bleibt ausserhalb des Risiko-Prädikats (§17-Gegengewicht, Recherche #681) · ZhStueckFixture per #715 gebucht. Steuerdeckel `check-*.ts` gerissen (+10 KB) ⇒ Prosa-Diät in vier Toren (−14.8 KB, Code byte-gleich) statt Deckel-Hebung; Hook-Edit vom Auto-Mode-Klassifizierer geblockt (Memory-Eintrag). Jules nicht einsetzbar (alle Positionen ausserhalb `src/**`). Offen: Steuerdeckel-Streichentscheid (David). Kontingent-Lauf ohne Alarm.


## Session 4./5.9.2026 (Nacht) — Nachtmandat «UI wirksam bis stop»: 12 UI-Befund-Batches, Design-Konsistenz R4–R7, Monitor-Rot behoben, 27 PRs

**Auftrag David (4.9. abends):** «los» (rote Issues #597/#600), dann «ui wirksam arbeiten bis ich stop sage», «mindestens 10 Stunden», «spare Tokens», «effizient». Fable orchestrierte nur; Bau/Prüfung bei Opus/Sonnet (Weisung 1.9.2026).

**Gelandet (Squash, Reihenfolge = Landung):** #668 BE 154.21 Snapshot (KDSG-Anpassung, Gegenprüfung 49/49 · Kanton-Filter `gen:pdf-quellen`) · #670 B14+B16 Kopfzeilen/Seitengerüst · #671 B9 Textsatz · #672 B19+B6+B7 Felder/Zustände · #673 B15 Tabs · #669 B11 Karten · #675 B12 Eingabefelder · #678 B18 Listen · #679 QS-UI Marken-Präfix (Label-Marken ohne «lit.», 550 Marken) · #680 D0 Deckkraft-Wächter (Bug war seit 8.8. behoben) · #688 §17 Hook prüft Merge-Schutz am **PR-Head** (Altfassung liess Risiko-Merges bei sauberem Checkout durch) · #674 B10+B17 Knöpfe · #681 B18-Logik LM-187 Treffer-Hervorhebung (Sonnet-Gegenprüfung) · #682 ⌘K ab erstem Paint (Shard-3-Flake, 0/20→20/20) · #687 Vernehmlassung VERN-2026-7 (Finding 7 heilt regulär; Opus 11/11) · #684 Daten-URL-Regel Sonderzeichen-Keys (Prod war nie kaputt, decode-once-Server; Opus 2 Durchgänge) · #694 GL-Dublette III B/7/1 dedupliziert + Dubletten-Tor je Kanton (Opus + Sonnet-Nach-Verdikt) · #695 Fedlex-Re-Pin DBG 2026-09-02 (nur IT-Berichtigung) + Reparatur-Arm-Fix (Register-Reihenfolge, `gen:feed`) · #691 Rubrum-Besetzung 309 BS-Entscheide ohne Leerzeichen vor Komma (Opus, Portal 3/3) · #676 B13 Formate · #686/#690/#692 Design-Konsistenz Runden 5–7 (Runde 7: 0 Neufunde; Dry nach §2 mit Runde 8) · #683 axe 7→62 Routen + aria-Zustandsnamen-Tor + Farbwelt 80→102 Paare · #685 konstante aria-Namen Topbar/Artikel · #689 Baum-Knopfnamen (falls gelandet, s. PR). Dazu #677 Runde 4 früh in der Nacht.

**Befundliste W2·17:** von 105 offenen LM-Befunden alle 12 Batches abgearbeitet (gebaut/überholt/zurückgestellt je Batch im Fahrplan §7–§20); Rest = David-Entscheide (A3-Abnahme LM-032/066/083, LM-133 Ingress-Stand, LM-036 Listenhöhe) und Daten-Folgeschritte (Roadmap QS-KORPUS).

**Issues:** #597 geschlossen (Monitor grün für BE); #600 offen — Monitor-Lauf 33936281247 zeigte 4 weitere Netz-Drifts (Vern → #687, Fedlex → #695, DBG-Revisionen + ESTV-MWST Branchen-Info 26 → Agent bei Session-Ende noch am Bauen, Worktree `LexMetrik-wt/monitor-estv-dbg`).

**§17-Lehren verankert:** Hook-Prüffläche (#688) · CI apt-Stall mit timeout+Retry (#683) · Reparatur-Arm-Kette (#695) · Batch-Spec-Regeln (Scratchpad `ui-befunde-batch-spec.md`, Muster für künftige Batch-Nächte: Worktree je Agent, Vintage-Regel, keine Pipes auf Toren). Als Roadmap-Zeilen (QS-KORPUS/QS-MONITOR-ROT/W2·18/QS-UI/QS-EFFIZIENZ): Cache ohne Fassungsschlüssel, Konsistenz-Tor blind für Stand, stumme Löschung im Offline-Refresh, Finding 7 ohne Reparaturweg, OR-Leser-e2e-Timeouts, Projektionskette nach main-Merge (4 CI-Läufe verloren), `src/lib/suche` nicht im Risiko-Prädikat.

**Wartet auf David:** Prototype Fund (6.9. Mitternacht!) · Steuerdeckel (Hooks 221 B, check-*.ts ~180 B Luft) · Design: ☰-Anatomie, Hover-Stufe, ⧉-Quittung · Baum-Namen-Fallback «1./2. Vorkommen» · A3-Abnahme · LM-133 · Lizenz-Ausnahmen, Näfelser Fahrt (aus 2.9.).

**Morgen 5.9. (David wach, Auftrag «leg die drei Jules-Tickets an»):** #696–#698 → PRs #699–#701 in 33/40/52 min, alle landbar (Test-Split, Komponenten-Split mit expliziter Partition, Fixture-Split); Landungsquote seit 3.9. 9/10. §17: Grüne-Spur-Weiche jetzt im Dispatch-Generator (`npm run dispatch -- bau`), weil die Skill-Prosa in der Nacht kein einziges Mal feuerte. Claude-Nachzug offen: Wächter-Listen um Split-Geschwister, toter Re-Export, dupliziertes Fixture-Interface. `schlankheit:update` setzt alle Baseline-Zahlen still neu — nur gezielt nutzen (QS-EFFIZIENZ-Zeile).

**Vormittag 5.9. (Jules 11–13b, David: «leg noch drei an»):** #710 Wizard-Split landbar (47 min), #709 Test-Split inhaltlich sauber, aber Betreff «refactor» ⇒ `check:testtreue` rot ⇒ Landung als #711 + Wurzelfix #712 (Testtreue im lokalen gate, Betreffregel in AGENTS.md/Vorlage), #707 gültige Entwurf-Antwort ⇒ Jules 13b (#708). Nachzug #702 (Wächter-Listen, Re-Export, Fixture-Typ). Monitor grün, #600 zu. Neue §17-Zeilen: Paritäts-Tor kennt nur die check:seriell-Kette; `schlankheit:update` nur gezielt.

**Messung:** ~27 PRs in ~11 h, 0 Rollbacks; CI-Rot fast ausschliesslich Nachzug-Klassen (Projektionen, Test-Helfer, Runner-Stall), 1 echter Regressionsfang durch e2e (#674 aria-label).

## Session lexmetrik-a1, 2.9.2026 — «Verwenden statt bauen»: Sichtung 19 Quellen (PR #617)

Gelandet: #622 Lizenz-Tor `check:lizenzen` (`9e8ca343a`), #621 Turso-DB-Cache
(`8c4084775`), #626 Diff-Klassierung `.claude/agents`=Werkzeug + Doku-Tore
(`50d5c6ed0`), #628 Erlass-Verweise ohne Artikelnummer +1 097 Links, GP bestanden
n=24, `src/lib/fedlex` jetzt Risikopfad (`905fbb4c4`), #627 Fedlex-Zitatgraph
227 Erlasse/5 581 Kanten + Warn-Bericht, GP bestanden mit 2 Auflagen (`4d4433744`).
**Offen:** QS-VERWENDEN V1b, V3–V8; W2·22 Z4; Neufund 824 ausgeschriebene
Artikelverweise («Artikel 29 Absatz 1 ATSG») unterdrückt → Kandidat Z5, nicht
begonnen. **Wartet auf David:** Prototype-Fund 6.9., AGPL-Ausnahmen
apca-w3/colorparsley, MCP-Server-Entscheid.

**Nachtrag:** Weiterbau 2.9. nachmittags: QS-VERWENDEN V1b+V4 (#630), V3 Raw-Store
(#631), V5 Feed + V6 valibot (#632, GP), V7 Feiertags-Gegenprobe (#633, 1 Skip GL
2027 wartet auf David), V8 Spike (Notiz). Dossier #617 gelandet 442376f89.

## Session 7.–8.8.2026 (Nacht) — W2·10-UI-NAV -S/-V/-O/-J gelandet + QS-GP-BEREICH + 3 Sicherheits-Patches (#463–#467)

**Fable-Orchestrator, entschleunigter Zyklus je Einheit: Opus-Bau → adversariale Gegenprüfung (anderes Modell, read-only) → Auflagen-Fix → nächste; adversarialer Schlussdurchgang vor der Landung; serielle Landekette #464→#463→#465→#466→#467, alle gemergt.**

- **W2·10-UI-NAV (PR #464, Squash `d919d9d03`):** vier Teilschritte — **-S** `?q=`-Durchreichung + mobiler Such-Fokusmodus (≥16 px, kein iOS-Zoom) · **-V** Hover-Vorschau am NormPopover (nicht-modal, ohne Klick-Fänger) + interner NormChip-href + Vorlage↔Rechner-Kreuzlinks über bestehendes `related` (§5) · **-O** Sidebar-Konsistenz (Label navigiert, Auto-Expand; tote Sprunganker angeschlossen) + Kantons-Intro §8-ehrlich + Scope-Labels + `lc-input-sm`-Zoom-Fix · **-J** Jahrgangs-Sprungleiste mit Sichtfenster-Deckel (kein Klick rendert > eine Batch-Breite; Restoration inkl. Reload) + Mobil-Filter-Bottom-Sheet + News-Karten-Politur. Vom Dach offen nur noch **-J3** (Risikopfad, eigene Session). Gegenprüfungen fanden u. a.: Back-Rücknahme des `?q=`-Spiegels (ERNST, gefixt + F7-Lehre), Hover-Backdrop-Flacker-Blocker (gefixt mit Ursachen-Rotbeweis), Jahr-Sprung sprengte den DOM-Deckel (Fenster-Umbau), Zähl-Paritäten. Risiko-Quittung startseiteKartenFristen im Register (Hash unabhängig nachgerechnet).
- **QS-GP-BEREICH (PR #466, done):** `gegenpruefung:ok --bereich` + Tor prüft `origin/main..HEAD` — beendet die Hand-Hash-Ära (4 Präzedenzfälle); Gegenprüfung mit Live-Sabotagen bestanden (Auflagen umgesetzt: Range-Semantik ehrlich inkl. Voll-Bereich-Warnung, getracktes Pending enttrackt, Diagnose-Ehrlichkeit, Gitlink wirft). `QS-GP-PREPUSH` damit baubar.
- **Sicherheit:** #463 react-router/dompurify (beide Pfade nicht erreichbar, Patch-Bumps) · #467 nanoid 5.1.16 (Alert #22, chirurgischer 6-Zeilen-Lock-Patch gegen die Coverage-Peer-Dep-Falle) — **0 offene Alerts**.
- **Negativ-Ergebnis verankert (PR #465):** r1-r2-CI-Wurzel «rendert alle Treffer» durch Messung WIDERLEGT; echte Signatur: zweiter schwerer OR-Reader je Chromium-Worker wird nie betreten, Retry = frischer Worker; nächster Schritt CI-Forensik (QS-E2E-STABIL nachgeführt).
- **§17-Ernte:** Lehre F7 (URL-Spiegel rückwärts testen) · aufraeumen-Verify grept jetzt bibliothek/docs/Root + check:bibliothek vor Doku-Push (toter-Link-Vorfall heilte `57ebeca56`) · QS-GP-COMMITDIFF-Duplikat in QS-GP-BEREICH fusioniert · QS-KORPUS-RSPR-DATUM neu (bge_151_II_475 trägt Datum 1999) · merge-schutz-Diff-Härtung als QS-GP-NACHBEFUNDE (d) · Landungs-Lektion: API-`update-branch` löst kein Vercel-Deployment aus (Required-Kontext fehlt dann) — echter Push nötig.

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
(Skill `landung`).

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

**Spät-Session 7.6.2026 (Kurzspiegel; Details ROADMAP.md A.0):**
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
