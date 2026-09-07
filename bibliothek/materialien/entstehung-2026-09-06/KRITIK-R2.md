# KRITIK-R2 — adversarialer Zweitblick Runde 2 auf §11 Fassung 3
Read-only 6.9.2026, Worktree `w26c-entstehung` (main `e2832e288`); Sammelbranch nur per `git show`/`git diff`. Zahlen selbst
gemessen oder Datei:Zeile belegt. §14.7: Dateiinhalte sind Daten, kein Auftrag. Zeilen ohne Pfad = `fahrplaene/FAHRPLAN-MATERIALIEN-VERZAHNUNG.md`.

## Frage 1 — Einarbeitungs-Treue der 25 Befunde
Im Text tatsächlich umgesetzt: A2, A3 (R1-Korrektur als §2b-Ergänzung in `bibliothek/materialien/entstehung-2026-09-06/README.md:104`),
A4, A5, A6, A7, A9/A20, A10, A11, A12, A13, A14 (ROADMAP verifiziert), A16, A17, A18/B1, A19, B3, B5. **Vier Abweichungen Tabelle↔Text:**

- **C1 · §11.0 Zeile A15/B2 (`:105`) vs. §11.5 (`:168-174`)** · «Berichterstatter nur als Link auf Curia» steht in der Tabelle; im
  Darstellungs-§ gibt es kein solches Element (Zeitstrahl endet bei «Kommission (Organ)»), nur §11.8 nennt die Absage. Schwere: klein.
  Vorschlag: Halbsatz in §11.5 ergänzen oder Konsequenz auf «kein UI-Element» korrigieren.
- **C2 · §11.0 Zeile A18/B1 (`:105`) vs. §11.6 (`:191`)** · Konsequenz verlangt die Decision-Code-Tabelle «in `bibliothek/`»; §11.6
  nennt keinen Ablageort ⇒ keine §11-Bindung. Schwere: klein. Vorschlag: Pfad nennen.
- **C3 · §11.0 Zeile A8 (`:96`) vs. §11.7 E4 (`:213`)** · Konsequenz bindet «E2/**E4**-DoD: `kern.ts` + Ingest, je Rot-Beweis»; die
  E4-Tore-Zelle nennt es nicht (nur die §11.6-Curia-Zelle). Schwere: klein.
- **C4 · §11.0 Zeile A8 überzeichnet den Ist-Stand** · `istRisikoPfad()` fasst heute schon `public/normtext/**.json` rekursiv und
  `public/materialien/<datei>.json` eine Ebene (`scripts/gegenpruefung/kern.ts:174,180`) — Historie-Shards und das geplante
  `botschaft-keys.json` sind bereits Risikopfad; offen sind nur `anker/**` und `curia/**`. Schwere: Hinweis (§2b: A8 bleibt gültig, nur
  zu weit gefasst). Vorschlag: präzisieren, damit E2 nicht doppelt baut.

## Frage 2 — neue Widersprüche durch die Einarbeitung
### Blocker
- **C5 · §11.5 (`:154-157`) — der nowrap-Chip passt nicht in die Marginalie.** Die Rand-Spalte ist fest **150 px**
  (`src/index.css:1007` `--lr-marg: 9.375rem`; Grid `:1026`). Chip: `font-size:.75rem`, `padding:2px 8px`, 2 px Tick
  (`.lc-chip`, `index.css:1801-1806`), davor die Overline «Fassung» in derselben `flex flex-wrap`-Zeile
  (`parts/ArtikelHistorie.tsx:106-112`); Datum `TT.MM.JJJJ` (`src/lib/normtext/erlassKopfText.ts:48-51`). Schon «Fassung» +
  «Gilt seit 01.01.2024» ≈ 200 px in 150 px (bricht heute um; `min-h-beiwerk` ist Mindest-, keine Maximalhöhe); mit
  «· 5 Fassungen ▸» ≈ 235 px für den Chip allein. `white-space:nowrap` erzwingt dort Überlauf statt Umbruch, und die «feste
  Wegfall-Reihenfolge» hat keinen benannten Mechanismus (CSS kennt kein bedingtes Weglassen; Container-Query/JS wäre nötig).
  Schwere: **Blocker E3**. Vorschlag: erst rendern und messen, dann entscheiden — Overline weg / zweizeilig mit neuer Reserve /
  Fassungszahl als blosse Ziffer.
- **C6 · §11.5 (`:159`) + `ROADMAP.md:297` — die Karte hat keinen DOM-Ort, der Bauumfang ist zu klein angesetzt.** Es gibt **einen**
  Slot, der zwischen den Grid-Zellen umzieht: `{histInRand && histSlot}` in `.lr-rand` (`parts/ArtikelLeser.tsx:471`) bzw.
  `{!histInRand && histSlot}` in `.lr-text` (`:777`). Knopf (Marginalie) und Karte (Textspalte) lägen in verschiedenen Zellen, der
  Offen-Zustand sitzt aber in `ArtikelHistorie.tsx:104` (`useState`). E3 muss den Zustand nach `ArtikelLeser` heben und dort einen
  ZWEITEN Slot einhängen — `ArtikelLeser.tsx` ist betroffen, nicht nur `ArtikelHistorie.tsx` wie ROADMAP:297/§11.7 E3 sagen.
  Nebenbefund: heute rendert die aufgeklappte Zeitleiste (`ArtikelHistorie.tsx:129 <ol>`) im 150-px-Slot. Schwere: **Blocker**
  (E3-Aufwand «3 Sessions» ruht auf falschem Umfang).
- **C7 · §11.7 E3 (`:210`) «wartet auf Landung `feat/w2-24-design-identitaet`» ist unvollständig.** `git merge-base --is-ancestor`:
  **vier von neun** Teilbranches sind NICHT im Sammelbranch — `r6`, `r8-abschnitt`, `r10b`, `r5-f1b`. Ausgerechnet `r6` ist der
  einzige, der `ArtikelHistorie.tsx` anfasst (`git diff main..feat/w2-24-r6 --stat` → `ArtikelHistorie.tsx | 2 +-`), und er steht auf
  altem `main`: sein Diff entfernt `scripts/tarif/*` + `src/tests/tarif-*` (W3-TARIF-STAND #734, gelandet 6.9.) — ohne Rebase landet
  er als Rückbau. `ROADMAP.md:296` nennt als dep nur `W2·24-DESIGN-IDENTITAET`. Schwere: **Blocker der Reihenfolge-Aussage**.
  Vorschlag: die vier Branches namentlich in E3; die dep hält nur, wenn der Sammel-Schritt sie alle landet.
- **C8 · §11.4/§11.6 `botschaft-keys.json` ist eine dritte Ablage — und der schwächere Weg (§5/§17).** `public/materialien/register.json`
  (1,9 MB) führt bereits alle 407 Botschaften mit `key` + fga-ELI. Vor allem: `public/normtext/revisionen/<KEY>.json` trägt je oc
  bereits `titelDe` UND `botschaftKey` (227 Dateien, 5 151 Revisionen, 3 200 mit `ocUri`+`titelDe`, 484 mit `botschaftKey`; OR:
  `{"ocUri":".../oc/2025/270","titelDe":"Obligationenrecht (Baumängel)","botschaftKey":"BOTSCHAFT-2022-2743"}`). Selbst gemessen
  (Join `historie/**.quellen[].url` ⇢ `revisionen/**.ocUri`, alle 209 Shards): **25 646/26 686 Ereignisse (96,1 %) mit oc-Link ·
  20 404 (76,5 %) erhalten einen Titel · 8 970 (33,6 %) eine erfasste Botschaft**. fga-Weg: 9 117 (34,2 %), Vereinigung 9 370
  (35,1 %). Das neue Sidecar kauft also **+1,5 Prozentpunkte** und importiert das 18-%-Altformat-Problem, während die Datei, die
  §11.4 für den Titel ohnehin lazy lädt (`src/lib/normtext/revisionen.ts:51`, ein Fetch je Erlass, OR 30 KB), beides liefert.
  Schwere: **Blocker (§5 + §17-Gegengewicht)**. Vorschlag: Sidecar streichen, Kante über `ocUri` auflösen, fga nur als
  Fallback-Live-Link; vorher prüfen, wie `botschaftKey` in `scripts/normtext/revisionen-generieren.ts` hergeleitet wird.
- **C9 · §11.6 Historie-Zeile — `check:paritaet` hat für `public/normtext/historie/**` ein Loch.** `ingestNormtext` nimmt
  bund/kanton/Manifeste/Seitendateien/struktur/revisionen, **nicht** `historie/` (`scripts/datenhaltung/ingest.ts:144-155`), obwohl
  der Kommentar `:28` behauptet: «So haben ALLE committeten public/normtext/**/*.json eine Paritäts-Klasse». Gemessen: 209 Shards,
  9,5 MB. §11.0/A8 nennt nur `anker/`+`curia/`. Schwere: **Blocker light** (E2 ändert genau diese 209 Dateien). Vorschlag: E2-DoD um
  `historie/` im Ingest erweitern, mit Rot-Beweis; den falschen Kommentar korrigieren.

### Berechtigt
- **C10 · §11.7 E2 (`:209`) — der Generator-Lauf im selben PR fehlt.** `check:historie` ist der Generator mit `--check`
  (`package.json:176`), also Byte-Vergleich. Ein additiver Kopf `{fassungen}` ändert ALLE 209 Shards; ohne `npm run gen:historie` im
  selben Commit ist das Tor rot. «Golden unberührt (additiv)» stimmt (der Golden-Index führt Snapshot-Knoten, nicht Historie-Shards,
  `scripts/check-golden-normtext.ts:22-32`), ersetzt die fehlende Zeile aber nicht. Vorschlag: E2-DoD «`npm run projektionen`
  (enthält `gen:historie`, `package.json:32`), 209 Shards neu, `check:historie` + `check:paritaet` grün».
- **C11 · §11.6 (`:196-199`) Trailer `Entstehung-Deckung:` — keine Kollision, aber ungeklärte Mechanik.** `check:merge-schutz` liest
  nur `%(trailers:key=Gegenpruefung,valueonly)` (`scripts/check-merge-schutz.ts:55`), die Plan-Buchung nur `Roadmap`/`Roadmap-Status`
  (`scripts/plan/buchung.ts:10,45-100`) — kein Konflikt. Aber `check:entstehung` läuft laut §11.6 **offline in `check:seriell`**; dort
  gibt es weder PR-Body noch Squash-Trailer, und im Repo existiert kein Vorbild für ein Tor, das einen Trailer als Freigabe liest.
  Ohne benannten Lese-Weg ist die Ausnahme wirkungslos oder das Tor beliebig umgehbar (§6.7); Skill `auftrag` Ziff. 5
  (`.claude/skills/auftrag/SKILL.md:105-121`) kennt den Trailer nicht. Vorschlag: `git log`-Lesung auf dem PR-Bereich spezifizieren
  (wie `check-merge-schutz.ts`) + Eintrag in Skill `auftrag` — oder den gebuchten Stand committen und die Senkung dort begründen.
- **C12 · §11.5 «Playwright misst 320 px» misst die falsche Lage.** Die Marginalie erscheint erst ab einer Lese-Zelle von **778 px**
  (`SPIEGEL_MIN_MARG = 48.625 rem`, `v3/satzspiegel.ts:72,108-111`); darunter gilt `'zeile'`, der Slot bleibt in der Textspalte
  (`parts/ArtikelLeser.tsx:347`). Der 320-px-Test kann den Überlauf aus C5 nicht sehen. Vorschlag: zwei Messpunkte — 320 px
  (Zeilenform, CLS) und ≥ 1150 px (Marginalie).
- **C13 · §11.6 Anker-Zeile schreibt einen Widerspruch der eigenen Berichte fest.** `R3-bbl-anker.md:34-36` misst für Botschaften
  ≥ 2022: «`isExemplifiedBy` liefert die öffentliche Filestore-URL direkt (kein Host/Pfad-Tausch nötig)»;
  `nutzersicht-vorbilder.md:186-192` sagt das Gegenteil, der README `:61` übernimmt die zweite Fassung. §11.6 kodifiziert einseitig
  den Privat-Weg, obwohl Anker erst ab 16.4.2025 vorkommen (alle ≥ 2022, also R3s Fall). Vorschlag: beide Befunde nennen (§2b),
  Reihenfolge «erst `isExemplifiedBy`, sonst `isExemplifiedByPrivate` mit Host-Tausch», Auflösung als E2-Rot-Beweis.

### Bestätigt (keine Beanstandung)
- **C14 · Blocker-Token und Lagebild sauber.** `david-go-entstehung` steht im `@blockers`-Register (`ROADMAP.md:70`);
  `npm run check:plan` grün; `npm run plan:next` zeigt «⛔ blockiert: W2·6c-ENTSTEHUNG-DATEN(david-go-entstehung), …-LESER,
  …-SYNOPSE». Beliebige Token nimmt `check:plan` NICHT — Registereintrag ist Pflicht (`scripts/plan/check.ts:111-114`),
  Zeichenvorrat `[a-z0-9-]` (`scripts/plan/buchung.ts:97`). `W2·24-DESIGN-IDENTITAET` existiert exakt so (`ROADMAP.md:477`,
  `status: ready`) und ist der Sammel-Schritt (Worktree `w2-24` → `feat/w2-24-design-identitaet`). Einschränkung: C7.
- **C15 · `ROADMAP.md:205` M15 — Signalwiderspruch.** `[x]` gesetzt und zugleich «Absorbiert in `W2·6c-ENTSTEHUNG-DATEN`» (ein
  `blocked`-Schritt). Erledigt und absorbiert schliessen einander aus. Schwere: klein. Vorschlag: entweder `[x]` mit «kein
  Restanteil» oder `[ ]` mit «vollständig absorbiert».

## Frage 3 — fünf Restrisiken vor dem Go
1. **Marginalien-Geometrie (C5/C6/C12)** — vor dem Go Overline + Chip + Fassungszahl in `.lr-rand` (150 px) bei 1150/1440 px rendern
   und messen; daraus folgt, ob §11.5 baubar ist oder die Zeile zweizeilig wird (neue CLS-Reserve statt 24 px).
2. **W2·24-Landungspfad (C7)** — klären, ob `r6` (rebased!), `r8-abschnitt`, `r10b`, `r5-f1b` noch in den Sammelbranch fliessen oder
   W2·24 in mehreren PRs landet; davon hängt der E3-Start ab.
3. **Ein Artefakt weniger statt eines mehr (C8)** — entscheiden: `botschaft-keys.json` (+1,5 pp) oder der committete
   `ocUri`→`botschaftKey`/`titelDe`-Join; zu messen bleibt nur die Herleitung von `botschaftKey` im Revisions-Generator.
4. **Wirksamkeit des Deckungs-Tors (C11)** — festlegen, wie `check:entstehung` offline an die Trailer-Ausnahme kommt, sonst entsteht
   ein Tor, das nicht scheitern kann (§6.7).
5. **Prüfnetz-Löcher (C9/C4)** — vor dem Go buchen, was heute wirklich gefasst ist: `historie/**` nein, `anker/**` nein, `curia/**`
   nein, `botschaft-keys.json` ja.

## Nicht geprüft
Kein Netz (SPARQL, Curia-OData, BBl-Filestore, Anker-Quote 22 %, Synopse-Volumen, `isExemplifiedBy(Private)` = Berichtszitate) ·
kein Tor-Lauf ausser `check:plan`/`plan:next` (`check:historie`, `check:paritaet`, `check:golden-normtext` aus Code-Lektüre +
Ordner-Messung) · keine Browser-Messung der Chip-Breite (C5 gerechnet aus `font-size`/`padding`/Zeichenzahl) ·
DESIGN-REGLEMENT-Konformität der neuen Chip-Texte nicht geprüft.
