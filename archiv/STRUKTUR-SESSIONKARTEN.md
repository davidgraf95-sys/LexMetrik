# STRUKTUR-Session-Karten — Archiv

Seit 14.8.2026 (QS-PLAN-EINFACH, Halden-Abbau) liegen die Karten **monatsweise**
unter `struktur-sessionkarten/` — die frühere 791-KB-Einzeldatei wuchs um
~12 KB/Tag und hatte keinen Leser mehr. Der Rotations-Hook
(`.claude/hooks/struktur-rotieren.py`) sortiert jede Karte nach dem Datum ihrer
Überschrift in die Monatsdatei ein; Zähler stehen bewusst NICHT hier (sie
würden veralten — `ls -la archiv/struktur-sessionkarten/` misst live).

## Session 13./14.8.2026 — Plan-System vereinfachen: §17-Gegengewicht, offener Auftrag QS-PLAN-EINFACH, Doku-Kurzpfad für main (#488)

**Opus-Orchestrator, ein 11-Agenten-Audit, fünf Commits im Zweig `feat/roadmap-diaet`** (PR #488). Ausgangspunkt war eine Frage Davids zur Gesetzes-Oberfläche; sie legte einen veralteten `seq-hart`-Vermerk frei, und daraus wurde die Sitzung über das Steuerungssystem selbst.

- **§17 bekommt sein Gegengewicht (`c1c242cc4`):** §17 erzeugte bisher nur Zuwachs — nichts verlangte je das Entfernen. Vier Sätze als Bremse (ersetzen statt ergänzen · streichen statt bewachen · Regel ohne datierten Anlass ist Rückbau-Kandidat · Plan bildet Kapazität ab, nicht Absicht). Der erste Entwurf drückte CLAUDE.md auf 13.9 von 14 KB und wurde auf ein Drittel gekürzt — **die Regel gilt für sich selbst**, und ihr eigener Commit riss den ROADMAP-Deckel (+1532 B), was das Audit später als schärfsten Beleg zitierte.
- **Mehr-Agenten-Audit (11 Agenten, 5 Mess-Linsen, adversariale Gegenprüfung je Linse):** 40 Befunde überlebten, **7 wurden widerlegt**. Kernzahlen: 39 % aller Commits der letzten 7 Wochen fassen nur Steuer-Doku an · 50 von 79 Etiketten nie in einer Commit-Nachricht · 32 von 80 offenen Schritten betreffen das System selbst (0 → 32 in sechs Wochen) · `of: ja` 20 686-mal, `of: nein` nie · zwei Tore mit null Abbruchpfaden (`check:inventur`, `check:zitate`) · drei Halden über 1,1 MB · Rotation räumte auf **49 Byte** unter die Marke. Gegen-Befund, ebenfalls belegt: die Prüfstrasse ist NICHT das Problem (43 Tore parallel 15,5 s; 78 % der CI-Zeit sind 8 Browser-Prüfungen).
- **`QS-PLAN-EINFACH` (`ed824526c`):** Ein bewusst OFFENER Auftrag (Davids Vorgabe: neue Sessions sollen selbst entscheiden). Eintrag nennt nur das Ziel, 1017 statt 1532 Byte — erstes Muster der offeneren Form; Befundlage im Fahrplan-§, nicht im Plan. Löst `QS-PLAN-SEQ-FRISCHE` **ersatzlos** ab: jener wollte ein neues Tor für die Veralterung genau der toten Felder bauen, die zur Streichung stehen.
- **Davids drei Entscheide (`a15538748`):** Doku-Kurzpfad freigegeben · Chronik behält ihren Wortlaut (als verbindlicher Entscheid hinterlegt) · `ABNAHME-AG-BAUSTEINE.md` (123 KB) aus dem Bestand, gitignoriert. Zwei tote Register-Einträge geräumt (`QS-ENTREG-KONFIG`, `QS-DISPATCH-P0-PRUEF`, seit 7.8. erledigt) — Davids Warteliste 12 → 7, keiner mehr entscheidungsreif. **Eigener Befund korrigiert:** die vermutete Drift der Bausteinliste existiert nicht, der Generator erzeugt sie byte-gleich.
- **Rücknahme (`44e4b02c4`):** `check:gegenpruefung` rot wegen zweier Kommentarzeilen in `gruendungAgDokumente.ts` — das Tor klassiert nach Datei, nicht nach Diff-Art. Richtig so; Änderung fiel ersatzlos weg statt eine Gegenprüfung dafür zu fahren.
- **Doku-Kurzpfad für main-Pushes (`987e7ed63`):** **Prämisse des Schritts war überholt** — `paths-ignore` verhinderte seit der CI-Härtung jeden Lauf für reine `.md`-Pushes. Messung über 419 main-Commits/30 Tage fand den wahren Treiber: 42 Commits «`.md` + NUR `scripts/plan/inventar.ts`» (der Rotations-Zweitschritt) zogen das volle Programm ≈ **10 h CI/Monat**. Zugleich war der Filter ein Loch: 158 reine `.md`-Pushes liefen **ganz ohne** Merge-Schutz und check:plan. Gebaut: `diff`-Job klassiert jetzt auch push, Doku-Menge = `.md` + Inventarliste; `perf`/Lighthouse auf `art == code` gestellt.

**Messbare Wirkung:** ROADMAP.md 103 891 → 102 301 Byte (erstmals wieder im Budget) · Root-Textdateien 22 → 21 · Davids Warteliste 12 → 7.

**Offen (§8):** Der push-Zweig der Klassierung lässt sich vor dem Merge nicht rot zeigen (`on.push.branches: [main]`) — der §6.7-Beweis fällt erst nach der Landung an: erster gemischter main-Push = Volllauf, erster reiner Doku-Push = Kurzpfad. Bis dahin ist `QS-BASIS-DOKU-CI` **nicht** fertig.

## Session 13.8.2026 — Fünf-PR-Landewelle: check:materialien-Heilung, W2·19B-KORPUS, W2·5k-LINIEN-KONZEPT, Fedlex-Frische-Reparatur, W2·18-Artikel-Ebene (#482, #484–#487)

**Fable-Orchestrator, ~10 Unteragenten-Läufe, alle auf main gelandet** (Beleg: `git log 01f2a4651..121957a2a`, HEAD `121957a2a`, Arbeitsbaum sauber). Gegenprüfungen liefen mit Davids Freigabe auf **sonnet statt fable/opus-Minimum** (Token-Sparauftrag 13.8.) — in allen Quittungen deklariert.

- **PR #487 (Merge `6e873ca46`):** `check:materialien`-Heilung — VERN-2025-100-Frist abgelaufen, Status gegen Fedlex-SPARQL nachgeführt (16 Änderungen, 3 Neueinträge, 825 statt 822 Materialien); Defekt hatte repo-weit alle PRs blockiert. Gegenprüfung sonnet **bestanden**, 0 Befunde.
- **PR #484 (Merge `2dd822f5e`):** `W2·19B-KORPUS` done — 4 neue Gliederungs-Sidecars (LU-3870, GR-3348, VS-1413, FR-8428; der Generator hatte sie fälschlich als PDF-only übersprungen), 38 von 42 Kantonserlassen amtlich nicht strukturiert verfügbar (Negativbefund dokumentiert: `bibliothek/normen/kanton-gliederung-sidecar-luecke-2026-08-13.md`), SG-3849-Verdacht widerlegt (Gebührentarif ohne Artikel; 17 «Art. N»-Treffer waren Fehlextraktionen aus Fremdverweisen — §8-Hinweis korrigiert). **Gegenprüfung sonnet, 2 Runden:** Runde 1 nicht bestanden (§6.7-Überclaim «beide Tore rot gezeigt»), Nachbesserung `811b93f64` (Logik-Extraktion `struktur-kanton-logik.ts`, Rangfolge-Fix ok>leer>fassung>shell), Runde 2 **bestanden**.
- **PR #485 (Merge `508513669`):** `W2·5k-LINIEN-KONZEPT` done — Konzept §9.3 in `FAHRPLAN-GESETZESDARSTELLUNG-V2`; Davids Entscheid 13.8. wörtlich protokolliert (Linie ganz entfernen, Variante V1); Folge-Schritt `W2·5k-LINIEN-RUECKBAU` (ready) angelegt.
- **PR #482 (Merge `ee5e22f56`):** Fedlex-Frische-Automatik vom 10.8. repariert — **Gegenprüfung sonnet Runde 1 nicht bestanden:** der Automatik-Lauf hatte 23'473 Golden-Einträge gelöscht (AR/BS; Wiederholung der Fehlerklasse vom 27.7., ~400×). Reparatur: Golden-Heilung sha-identisch, Wurzel-Fix `mischeGoldenVollLauf` + `check:golden-normtext` im Workflow (Rot-Beweis 9/10), AI-640.000-Aufhebungen amtlich belegt, BE-154.21-PDF-Link nachgezogen (Snapshot 1.8., Link zeigte auf Mai-Fassung — kein 404 hätte das je gemeldet). 3 Befunde, 3 behoben, Runde 3 **bestanden**.
- **PR #486 (Merge `b16d4e2ff`, durch David selbst gemergt):** `W2·18`-Gliederungspaket — Artikel-Ebene als unterste Klapp-Ebene in ALLEN Erlassen (Davids Vorgabe 13.8. «ganze Gliederung bis zum einzelnen Artikel»; 841+20 B1-Erlasse, 68 Ex-Leer-Erlasse → Artikel-Index, korpusweit 0 unerreichbare Artikel ausser der deklarierten ZGB-A36–74-Ausnahme, jetzt `@david-frage`), B8-Fokus-Rettung (WCAG 2.4.3), `gliederungsModell` nach §6.6 dreigeteilt. **§9-Bug-Check (2 Prüfer, opus+sonnet) fand 4 Verhaltensfehler VOR dem Merge** (Start-Sichtbarkeits-Verlust bei 58 Erlassen; Positionsmarke erreichte Artikel-Zeilen nie; Fokus-Rettung verschachtelt/Scroll; Kommentar-Overclaims) — alle gefixt und nachverifiziert. CI fand danach deterministischen CLS 0.075 (Scroll-Spy riss die Artikel-Ebene auf, Auto-Zuklapp entfernte ~500px-Blöcke) — Fix `dd13a3160`: Artikel-Ebene öffnet nur noch per Chevron-Klick (`art@id`-Schlüssel).
- **§17-Wurzel-Fix auf main (`7f8c9485a`):** Diff-Klassierung starb per SIGPIPE (`grep|head` unter `pipefail`) bei PRs mit >20 Nicht-md-Dateien (PR #482, 581 Dateien) — awk statt Pipe.
- **Plan/Lehren (`121957a2a`):** 4 neue QS-CURRENCY-KANON-Fehlerbuchzeilen (`--nur=bund`-Wurzel, `gen:pdf-quellen` im Workflow, `pdf-quellen.json` ohne Paritäts-Klasse, Aufgehoben-Flag golden-neutral), Trailer-Hook-Zeile, ZGB-A36-`@david-frage`.

**Offen an David:** ZGB-A36–74-Ausnahme (`@david-frage` in ROADMAP.md); die vier neuen `QS-CURRENCY-KANON`-Zeilen warten auf reguläre Einplanung.

## Monatliche Archive

- [2026-09](struktur-sessionkarten/2026-09.md)
- [2026-08](struktur-sessionkarten/2026-08.md)
- [2026-07](struktur-sessionkarten/2026-07.md)
- [2026-06](struktur-sessionkarten/2026-06.md)

## Karten ohne Datum

(keine)

<!-- Rotation 8.9.2026 (manuell, byte-genau, Session-Abschluss) -->

## Session 7.–8.8.2026 (Nacht) — W2·10-UI-NAV -S/-V/-O/-J gelandet + QS-GP-BEREICH + 3 Sicherheits-Patches (#463–#467)

**Fable-Orchestrator, entschleunigter Zyklus je Einheit: Opus-Bau → adversariale Gegenprüfung (anderes Modell, read-only) → Auflagen-Fix → nächste; adversarialer Schlussdurchgang vor der Landung; serielle Landekette #464→#463→#465→#466→#467, alle gemergt.**

- **W2·10-UI-NAV (PR #464, Squash `d919d9d03`):** vier Teilschritte — **-S** `?q=`-Durchreichung + mobiler Such-Fokusmodus (≥16 px, kein iOS-Zoom) · **-V** Hover-Vorschau am NormPopover (nicht-modal, ohne Klick-Fänger) + interner NormChip-href + Vorlage↔Rechner-Kreuzlinks über bestehendes `related` (§5) · **-O** Sidebar-Konsistenz (Label navigiert, Auto-Expand; tote Sprunganker angeschlossen) + Kantons-Intro §8-ehrlich + Scope-Labels + `lc-input-sm`-Zoom-Fix · **-J** Jahrgangs-Sprungleiste mit Sichtfenster-Deckel (kein Klick rendert > eine Batch-Breite; Restoration inkl. Reload) + Mobil-Filter-Bottom-Sheet + News-Karten-Politur. Vom Dach offen nur noch **-J3** (Risikopfad, eigene Session). Gegenprüfungen fanden u. a.: Back-Rücknahme des `?q=`-Spiegels (ERNST, gefixt + F7-Lehre), Hover-Backdrop-Flacker-Blocker (gefixt mit Ursachen-Rotbeweis), Jahr-Sprung sprengte den DOM-Deckel (Fenster-Umbau), Zähl-Paritäten. Risiko-Quittung startseiteKartenFristen im Register (Hash unabhängig nachgerechnet).
- **QS-GP-BEREICH (PR #466, done):** `gegenpruefung:ok --bereich` + Tor prüft `origin/main..HEAD` — beendet die Hand-Hash-Ära (4 Präzedenzfälle); Gegenprüfung mit Live-Sabotagen bestanden (Auflagen umgesetzt: Range-Semantik ehrlich inkl. Voll-Bereich-Warnung, getracktes Pending enttrackt, Diagnose-Ehrlichkeit, Gitlink wirft). `QS-GP-PREPUSH` damit baubar.
- **Sicherheit:** #463 react-router/dompurify (beide Pfade nicht erreichbar, Patch-Bumps) · #467 nanoid 5.1.16 (Alert #22, chirurgischer 6-Zeilen-Lock-Patch gegen die Coverage-Peer-Dep-Falle) — **0 offene Alerts**.
- **Negativ-Ergebnis verankert (PR #465):** r1-r2-CI-Wurzel «rendert alle Treffer» durch Messung WIDERLEGT; echte Signatur: zweiter schwerer OR-Reader je Chromium-Worker wird nie betreten, Retry = frischer Worker; nächster Schritt CI-Forensik (QS-E2E-STABIL nachgeführt).
- **§17-Ernte:** Lehre F7 (URL-Spiegel rückwärts testen) · aufraeumen-Verify grept jetzt bibliothek/docs/Root + check:bibliothek vor Doku-Push (toter-Link-Vorfall heilte `57ebeca56`) · QS-GP-COMMITDIFF-Duplikat in QS-GP-BEREICH fusioniert · QS-KORPUS-RSPR-DATUM neu (bge_151_II_475 trägt Datum 1999) · merge-schutz-Diff-Härtung als QS-GP-NACHBEFUNDE (d) · Landungs-Lektion: API-`update-branch` löst kein Vercel-Deployment aus (Required-Kontext fehlt dann) — echter Push nötig.

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

<!-- Rotation 8.9.2026 (abends, manuell, byte-genau) -->

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
