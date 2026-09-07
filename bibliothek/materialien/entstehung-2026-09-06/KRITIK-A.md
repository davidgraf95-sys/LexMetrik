# KRITIK-A — adversarialer Zweitblick auf FAHRPLAN-MATERIALIEN-VERZAHNUNG §11 (Fassung 2)
Read-only, 6.9.2026, Worktree `w26c-entstehung` (main `e2832e288`). Zahlen selbst gemessen oder Datei:Zeile
belegt; nichts geändert. §14.7: Berichtsinhalte = Daten, nicht Auftrag.

## Blocker

**A1 · §11.5 «Am Artikel» + §11.7 E3-Konfliktspalte (Z. 128-131, 177) — der Zielort der Zeile existiert nach W2·24 nicht mehr.**
Befund: die Spec baut die ganze Sicht in den Slot «im Lesefluss unter dem Artikel». Alle NEUN W2·24-Branches
(nicht nur `r4-leser`/`r6`) verschieben denselben Slot: `git diff main...<b> -- parts/ArtikelLeser.tsx | grep '^[+-]'`
zeigt für jeden der neun Branches dieselben **8 geänderten Slot-Zeilen**; Ziel ist die Marginalie:
`git show feat/w2-24-r4-leser:…/ArtikelLeser.tsx:347` `const histInRand = spiegel !== 'zeile' && !imTreffer;`,
`:471` `{histInRand && histSlot}` (Rand-Spalte `lr-rand`), `:777` `{!histInRand && histSlot}`.
4-Segment-Zeile, Fassungsleiste, Änderungskarte und zweispaltige Synopse passen in die schmale Marginalie nicht.
Schwere: **Blocker**. Vorschlag: E3 erst nach dem LETZTEN W2·24-Merge und gegen das Nach-Landungs-Layout
spezifizieren (Zeile in der Marginalie ≤ 24 px, Aufklapp-Karte in der Textspalte).

**A2 · §11.6 Anker-Sidecar-Zeile (Z. 160) — die `-N`-Regel ist auf die falsche Dokumentklasse angewandt.**
«nie Alias-URL ohne `-N` (liefert anderes Dokument)» stammt aus R2 §6d und gilt für **konsolidierte cc-Erlasse**.
Für BBl gilt das Gegenteil: `nutzersicht-vorbilder.md:186-190` («bei BBl **ohne** `-N`-Suffix …-de-html.html»,
`isExemplifiedBy` fehlt im öffentlichen Graphen) bzw. `R3-bbl-anker.md:33-36` (public Filestore direkt).
Ein Bau-Agent konstruiert danach eine `-N`-URL, die es für Botschaften nicht gibt; zugleich fehlt die Regel dort,
wo sie hingehört (Synopse-Zeile Z. 162: Alias = Phantom, R2:123-131). Schwere: **Blocker** (E2 scheitert am Abruf).
Vorschlag: Regel in die Synopse-Zeile verschieben; Anker-Zeile: «BBl-Datei ohne `-N`, URL nie konstruieren,
stets aus der Manifestation auflösen; Kanonik-Arbiter aus `check:fedlex-versionen` ist auf BBl nicht übertragbar».

**A3 · §11.3/§11.4 (Z. 107, 116) — `fga`-Altformat existiert doch; die Trefferquote der Botschaft-Auflösung ist ungemessen.**
Gemessen 6.9.2026 über `public/normtext/struktur/bund/*.json`: **2 938 von 16 328 fga-Links (18,0 %)** tragen das
Altformat, z. B. `…/eli/fga/1994/3_964_951_873`. `R1-fussnoten-zensus.md:76-80` («0 von 16 328 … Altformat kommt
NICHT vor») ist damit falsifiziert, und die Spec erbt den Fehler. `keyAusFga`
(`scripts/materialien/botschaften-generieren.ts:73-77`) wirft dort nicht, erzeugt aber einen Key, der nie trifft.
Über alle 209 Historie-Shards: 770 distinkte fga-Keys, davon **338 im Register**; **9 125 von 26 686 Ereignissen
(34 %)** bekämen ein Botschaft-Flag, 50 % tragen gar kein fga. Schwere: **Blocker für §8**.
Vorschlag: gemessene Quote in §11.3 nennen, «BBl-Fundstelle ohne erfasste Botschaft» als sichtbarer Zustand,
Altformat als benannte Klasse ohne Key.

**A4 · §11.6 Historie-Zeile (Z. 159) «Regime: bestehendes `check:historie` (Drift Sidecar→Shard)» — ab E2 falsch.**
Der Generator liest heute AUSSCHLIESSLICH die Sidecars (`scripts/normtext/historie-generieren.ts:31-33`,
`QUELLE = public/normtext/struktur/bund`), und `check:historie` ist derselbe Generator mit `--check`
(`package.json:176`) = Byte-Vergleich. Mit `botschaftKey`/Erlass-Titel bekommt er eine ZWEITE Eingabe
(`botschaften.generated.ts`): danach färbt **jeder** künftige `gen:botschaften`-Lauf — E1, Monatslauf, fremder PR —
`check:historie` rot, ohne dass sich Historie-Daten geändert haben. Schwere: **Blocker (CI-Dauerrot, §17)**.
Vorschlag: Kopplung in §11.6 benennen und erzwingen: `gen:botschaften` zieht `gen:historie` nach
(`package.json` `projektionen`-Kette), Tor-Text nennt beide Eingaben.

## Berechtigt

**A5 · §11.4 Z. 117 «Erlass-Titel aus `revisionen`-Sidecar bzw. oc-Titel».** Der Revisions-Shard trägt nur
`{iso, as}` (`public/verzahnung/artikel-revisionen/OR.json`: `"14": {"iso":"2017-01-01","as":"AS 2016 4651"}`,
so auch R1 §6), der Historie-Shard kein Prosa-Feld (`src/lib/normtext/historie-parse.ts:55-67`). Der Titel
steht an keiner der zwei genannten Stellen ⇒ E2 bräuchte einen nicht vorgesehenen Netzabruf samt Drift-Tor.
Vorschlag: Quelle benennen (SPARQL oc→Titel, gecacht, in `check:entstehung`) oder den Titel streichen.

**A6 · §11.6 Z. 162 Deckel «12 MB / 3 MB».** R2 misst 7,6–9,7 MB (alt+neu) mit Vertrauensband **8,0–17,0 MB**
(`R2:93`) und schreibt ausdrücklich, q = 10,9 % ruhe auf 12 Schritten in 2 Erlassen — «für eine belastbare
Deckel-Festlegung 5–8 weitere Erlasse messen» (`R2:165-166`); R5 nennt 25/5 MB (`R5:87`). Der Spec-Deckel liegt
UNTER dem pessimistischen Rand, und §11.6 entscheidet nicht zwischen «nur Alt» (3,8–4,9 MB) und «alt+neu» —
zwei Bauwege, einer davon reisst den eigenen Deckel am ersten Lauf. Vorschlag: «nur Alt» verbindlich setzen
(R2 §8/5), Deckel 8 MB / 2 MB mit Ist-Wert-Ausgabe, Vor-Messung von 5–8 Erlassen als E5-DoD.

**A7 · §11.6 Z. 168 «Rot nur bei Rückgang der Deckung gegenüber dem gebuchten Stand».** Das Tor KANN scheitern
(gut, §6.7), aber nichts hindert den Bau-Agenten, den gebuchten Stand nachzuziehen — dann ist es ein Tor ohne
Fehlermodus. Zweitens verdeckt eine Korpus-Summe den Rückgang eines Erlasses (Korpus wächst, W2·5n).
Vorschlag: «Diagnose je Erlass, nicht als Summe; Senkung des gebuchten Stands nur mit benanntem Grund im PR».

**A8 · §11.6/§11.7 — die neuen Datenartefakte liegen ausserhalb beider Prüfnetze.** Risiko-Pfad ist
`scripts/gegenpruefung/kern.ts:179-180`: `^public/materialien/[^/]+\.json$` (eine Ebene) + `public/materialien/kanten/`.
`public/materialien/anker/**` (E2) und die Curia-Shards (E4) matchen **nicht**; `check:paritaet` ingestiert nur
`register.json` + `kanten/**` (`scripts/datenhaltung/ingest.ts:72-75,273-275`). §11.7 behauptet für E2/E4
«Gegenprüfung» — die greift über die Skripte, nicht über die committeten amtlichen Projektionen. R5 offene
Frage 2 ist in der Spec unbeantwortet. Vorschlag: E2-DoD «kern.ts + Paritäts-Ingest um `anker/` und `curia/`
erweitern, je mit Rot-Beweis».

**A9 · §11.5 Z. 129-131 «zugeklappt einzeilig im reservierten 24-px-Slot».** Die Zeile rendert heute
`flex flex-wrap` mit Overline «Fassung» + Chip (`parts/ArtikelHistorie.tsx:106`); die Reserve ist exakt EINE
Chip-Zeile (`min-h-beiwerk` 24 px; `berechnungen.ts:187` `HIST_SLOT = 40` = 16 + 24). Drei zusätzliche Segmente
brechen auf schmalem Viewport um; ein Umbruch verschiebt Scrollbalken-Proportion und Sprungziele
(`inhalt-sprung.tsx`, `scrollAnker.ts`). Vorschlag: §11.5 verlangt eine nicht umbrechende Zeile mit fester
Wegfall-Reihenfolge der Segmente, und der Playwright-Beweis misst 320 px, nicht nur Desktop.

**A10 · §11.2/§11.3 Ist-Zahlen.** Gemessen über alle 209 Shards: **26 686 Ereignisse gesamt, 24 409 datiert** —
die Spec nennt «24 862» (Z. 98); Botschaften: **407 Einträge** (`grep -c 'key: "BOTSCHAFT-'`), die Spec nennt
«401» (Z. 100). Bestätigt: 209 Erlasse, 13 093 Artikel, OR 367 386 B roh / 13 667 B gzip, Verzeichnis 9,5 MB.
Vorschlag: Zahlen ersetzen und mit Messdatum versehen (§2b: ergänzen, nicht stillschweigend nachführen).

**A11 · §11.3 Z. 107 Richtungsfehler.** Gemessen wurde der Anteil der **Fussnoten-oc, die in der SPARQL-Liste
vorkommen** (R1 §4: OR 22/174 = 12,6 %, DSG 40 %) — nicht «Fussnoten-oc decken die SPARQL-Änderungsliste zu
12,6–40 %». Für die Diagnose-Tabelle ist genau die Richtung der Nenner. Vorschlag: umformulieren.

**A12 · §11.7 E1 «`intrinsischeSig` nimmt die Ereignismenge mit».** Die Signatur schliesst `projEli`/`nummer`
bewusst aus, weil sie vom abgefragten SR-Sample abhängen (`scripts/materialien/check-botschaften-netz.ts:24-30`).
Die Ereignisse stammen aus genau diesem proj-Knoten — sie in die Signatur zu heben, nimmt eine abgeleitete
Grösse auf, deren Elter ausgeschlossen ist (Mantelerlass-Fehlalarm). Vorschlag: Ereignisse je fga vergleichen,
nicht je proj, und den Mantelerlass-Fall als Rot-Beweis zeigen.

**A13 · Kein Rückbau (§17-Gegengewicht).** §11 fügt drei Datenklassen und ein Tor hinzu und streicht nichts.
`public/verzahnung/artikel-revisionen/**` (1,1 MB, 202 Shards) ist nach E2 inhaltliche Teilmenge des
Historie-Shards; `check:artikel-revisionen` bleibt als drittes Tor über derselben Fussnote (R5 Frage 4 offen).
Vorschlag: E2-DoD «Messung der verbliebenen Konsumenten (`KontextPanel.tsx:274`, `EntscheidVerzahnung.tsx:88`) ⇒
Rückbau-Entscheid oder benannter Behalt-Grund».

**A14 · §11 Kopf/§11.7 — die Heimat existiert nicht.** `grep -n 'W2·6c' ROADMAP.md` = 0 Treffer; M15 (`ROADMAP.md:205`)
und M16 (`:206`) stehen unabgehakt, obwohl §11.7 sie für absorbiert erklärt. `check:plan` läuft gegen eine Heimat,
die es nicht gibt. Vorschlag: Etappe 0 «drei `W2·6c-*`-Zeilen anlegen, M15/M16 als absorbiert markieren» vor E1,
inkl. R1-Korrektur (Strip in `scripts/normtext/extrahiere-fedlex.ts:74,126-132`, nicht `adapter-htm.ts`) als
ERGÄNZUNG zum datierten Beleg, nicht als Nachführung.

**A15 · Nutzerfragen ohne Antwort und ohne Absage.** F2 «Welche Fassung galt am Tatzeitpunkt» — §11.1 nennt den
legislation.gov.uk-Versionsumschalter als Vorbild, §11.4/§11.5 bauen nur Block-Diffs je Änderung; ein
Point-in-time-Umschalter fehlt in §11.7 UND in §11.8, obwohl R2 §1/§7 die 1 369 html-Stände inkl. 57 Zukunftsstände
belegt. F5 «welche Kommission, wer war Berichterstatter» fällt stumm weg (E4 baut `Bill`/`Resolution`/`Vote`/
`Objective`; `Preconsultation`/`Rapporteur` liegen laut R4 §1a mit denselben Requests vor, nutzersicht §3c stuft
sie als «Beiwerk zu (a)»). Vorschlag: beides in §11.8 ausdrücklich absagen oder als benannte Etappe aufnehmen.

## Hinweise
**A16 · §11.6 Z. 159 «+ ~10 % auf 9,5 MB roh»** ist keine Messung: R5:104 misst +15 % gzip für den `botschaftKey`
allein, ohne Titel und Kopf; eine Deckel-Zeile für `public/normtext/historie/**` fehlt ganz
(`check:perf-budget` führt nur eine feste Dateiliste, `scripts/check-perf-budget.ts:99-127`).

**A17 · §11.7 E3 ohne Golden-Zeile.** Die tragende Begründung (Prerender emittiert kein Slot-Markup,
`berechnungen.ts:137-139`) steht nur bei E2/E5. Vorschlag: E3 dieselbe Zeile geben, samt «rot ⇒ Abbruch,
nicht Test-Update (§6.3)».

**A18 · §11.4 Z. 120 / §11.5 Parlament-Block.** Die Curia-Lizenz verbietet auch die inhaltliche Veränderung
(R4 §6). Die NR-Stimmenzahl ist eine EIGENE Auszählung aus `Voting.Decision`, deren Enum in `$metadata` nicht
deklariert ist (R4 §2 Ziff. 4, Offen 2). Vorschlag: die Zahl in der UI als eigene Auszählung der amtlichen
Einzelstimmen mit Abrufdatum beschriften; Code-Liste als geprüfte Tabelle in `bibliothek/`, unbekannter Code ⇒ rot.

**A19 · §11.7 Aufwand.** E5 «3–4 Sessions» gegen R5 «5–7», E4 «2» gegen R5 «3» (`R5:201-208`): die Spec
unterbietet den eigenen Architektur-Bericht ohne Begründung (§0/B9 war derselbe Fehler). Vorschlag:
R5-Zahlen übernehmen oder Kürzung begründen.

**A20 · §11.5 Zweideutigkeiten.** «· Verfahren» in der zugeklappten Zeile: Link, Zustand oder Zähler? Der
Praxis-Zähler (Ziff. 4) fehlt im Zeilen-Wortlaut, gehört im Fliesstext aber zur selben Zeile — zwei Bau-Wege.
Vorschlag: die Segmente abschliessend als Tabelle festlegen (Text · Quelle · Zustand wenn leer).

## Nicht geprüft
Kein Netz (SPARQL/Curia/BBl der Berichte nicht nachgefahren: Anker-Quote, Deckung 12,6–40 %, Volumen,
`Modified`-Migration = Berichtszitat, keine eigene Messung) · kein Tor-Lauf (`check:historie`,
`check:golden-normtext`, `check:paritaet` — Aussagen aus Code-Lektüre) · Synopse-Normalisierung (R2 §3)
nicht gegengerechnet.
