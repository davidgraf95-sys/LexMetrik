# LexMetrik — Grundprinzipien (verbindlich für jede Änderung)

**Erster Anlaufpunkt für den aktuellen Stand: `STRUKTUR.md`.** Dieses Dokument
hier ändert sich selten; es hält fest, *wie* gearbeitet wird — nicht *was*
gerade gebaut ist.

**Was als Nächstes zu bauen ist: `ROADMAP.md`** (DER eine Handlungsplan, 28.6.2026).
Eine Bau-Session liest oben das **Ausführungs-Protokoll** und nimmt den **obersten
offenen Schritt** der Bau-Reihenfolge (S0 + Wellen 1–13), dessen Abhängigkeiten
erfüllt sind. Leitbild: «Schweizer Taschenmesser für Juristen» — DIE EINE
Anlaufplattform für alle Rechtsanwender (Kanzlei, Gericht, Behörden/Ämter,
Steuerbehörden, Notariate, Treuhänder, Studierende; Wortlaut-SSoT = ROADMAP-Produktvision,
Nordstern David 3.7.2026), **nur amtliche/urheberrechtsfreie Quellen** (Art. 5 URG, keine
Kommentare), Dossier geparkt, Werkzeuge zustandslos. Detail je Schritt in der
jeweiligen `FAHRPLAN-*.md`.

**STRUKTUR.md aktuell halten (Pflicht, Auftrag David 22.6.2026).** Wer in einer
Session substanzielle Arbeit auf `main` landet (Feature/Fix/Refactor, ein PR),
zieht in derselben Session oben eine ehrliche Session-Karte in `STRUKTUR.md`
nach — STRUKTUR.md soll jederzeit den aktuellen Stand repräsentieren. Auch eine
Parallel-/Autonom-Session (§12) erfüllt diese Pflicht; sieht sie fremde,
undokumentierte Commits, trägt sie nur die fehlende Karte nach (nicht erneut
umsetzen). Absicherung: der SessionStart-Hook `struktur-rotieren.py` hält
STRUKTUR.md mechanisch schlank (rotiert erledigte Karten byte-genau ins Archiv +
Re-Akkumulations-Wächter); das On-Demand-Audit `npm run struktur:aktuell` meldet
auf Abruf, wenn substanzielle Commits seit der letzten Karten-Pflege NICHT in
STRUKTUR.md dokumentiert sind — diese Lücke wird dann zuerst geschlossen. (Die
früher bei jedem Sitzungsstart injizierte, git-zustandsabhängige Warnung ist
zwecks Prompt-Cache-Stabilität aus der SessionStart-Kette entfernt, QS-TOK/T19.)

## §1 Oberstes Ziel: fachliche Korrektheit (Logik vor allem)

Jede andere Zielgrösse — weniger Code, kleinere Bundles, elegantere
Abstraktionen, schnellere Umsetzung — ist der **Korrektheit der Rechtslogik
untergeordnet**. Im Zweifel gilt: lieber 50 Zeilen Duplikat behalten als eine
Abstraktion, die zwei rechtlich verschiedene Fälle stillschweigend gleich
behandelt. Ein Refactoring, das auch nur eine Frist, Quote oder Warnung
verändert, ist kein Refactoring, sondern ein Bug.

## §2 Determinismus ohne Ausnahme

Alle Engines sind **rein und deterministisch**: gleiche Eingabe → gleiche
Ausgabe. Kein LLM, keine Heuristik, keine Schätzung, kein `Date.now()` in der
Rechenlogik. Neue Rechner/Vorlagen werden nur aufgenommen, wenn der Umfang
klar regelbasiert ist (sonst Backlog, siehe STRUKTUR.md) — «feste
Rechenregeln, keine Schätzung» ist das Produktversprechen.

## §3 Schichtentrennung: Logik ≠ Darstellung

- **`src/lib/` (Engines, Schemas):** enthält die gesamte Rechtslogik und
  KEINE UI. Jede Rechtsregel lebt an genau **einer** Stelle.
- **`src/pages/`, `src/components/`:** Darstellung, Navigation, Speicherung —
  und KEINE Rechtslogik (keine Fristberechnung, keine Schwellenwerte, keine
  Normtexte, die nicht aus einem Schema/einer Engine kommen).
- **Folge für Verkleinerungen:** Entdoppelung, Hooks, generische Rahmen
  (Wizard, Vorschau, Gates-Anzeige) finden in der Darstellungsschicht statt.
  Die Logikschicht wird dadurch nie berührt.

## §4 Eine Engine pro Rechtsgebiet — Verschmelzung nur Golden-gegated

Die Trennung der Engines (verjaehrung, sperrfristen, mietrecht, …) ist kein
Ballast, sondern ein Sicherheitsmerkmal: einzeln testbar, keine Querwirkungen
zwischen Rechtsgebieten. Geteilt wird fachneutrale Infrastruktur
(Datums-Arithmetik, Feiertage/Computus, Bruchrechnung, Fristen-Grundmuster) —
nie materielle Rechtsregeln.

**Code-Verschmelzung ist erlaubt (Entscheid David 8.6.2026), aber nur unter
zwei Bedingungen:** (1) strikt nach dem §6-Golden-Protokoll — committete
Basis vorher aktuell, nachher `npm run golden:vergleich` byte-gleich; (2)
**regime-treu**: verschiedene Rechtsregimes bleiben im verschmolzenen Code
als **interne Verzweigung** erkennbar, sie werden nie zu einer gemeinsamen
Regel kollabiert (§1: lieber Duplikat als eine Abstraktion, die zwei
rechtlich verschiedene Fälle gleich behandelt). §1 und §3 bleiben
unangetastet. Risikoärmste Merges zuerst (geteilte Infrastruktur hinter den
Regime-Engines).

## §5 Single Source of Truth

Katalog = `startseiteConfig.ts` · Vorlagen-Inhalt = die Schemas in
`src/lib/vorlagen/` · PDF und DOCX rendern aus **demselben**
Assemble-Ergebnis · Behörden-/Schwellen-Stammdaten genau einmal definiert.
Niemals denselben Fachinhalt an zwei Stellen pflegen.

Für die Korpus-Inhalte (Normtext, Rechtsprechung, Materialien) ist — sobald der
QS-DATA-Flip (E1, `FAHRPLAN-DATENHALTUNG.md`) vollzogen ist — das generator-erzeugte
DB-Artefakt die EINE Quelle; `public/*.json` und die prerenderten Seiten sind
deterministische Projektionen daraus (§7 Build-Regel 6) und werden nie an der DB
vorbei gepflegt.

## §6 Refactorings sind verhaltensneutral — und beweisen das

Vor jedem Struktur-Umbau gilt das Protokoll:

1. Tests vorher grün (`npx tsc -b` · `npm test` · `npm run lint` mit
   **voller Ausgabe**, nie `tail -1` · `npm run build`).
   Für den grünen Routine-Check `npm run gate` (bzw. `gate:schnell` pro
   Iteration); die fünf Einzelbefehle mit voller Ausgabe nur zur Diagnose
   eines roten Gates. Der Wrapper kürzt nur die grüne Ausgabe — ein Fehler
   erhält weiterhin die volle Ausgabe (§6-Sinn: kein verstecktes Versagen).
2. Wo Texte/Dokumente entstehen (assemble, PDF-Modell, Warnungen): vorher
   **Golden-Outputs** festhalten (Snapshot/Vergleichslauf) — nachher müssen
   sie identisch sein.
3. Tests werden bei Refactorings **nicht angepasst**. Muss ein Test geändert
   werden, ist es eine fachliche Änderung → gehört in einen eigenen,
   deklarierten Schritt mit Begründung.
4. Performance-Massnahmen (Lazy Loading, Code-Splitting) ändern nur den
   **Ladezeitpunkt**, nie Inhalt oder Reihenfolge der Logik.
5. Diagnose sparsam (Token-Disziplin, 11.6.2026): Bei rotem vitest zuerst
   nur die rote Datei nachfahren (`npx vitest run src/tests/<datei>`), nicht
   die Suite. Golden-Abweichungen je Fall über `npm run golden:diff -- <id>`
   ansehen — `golden/lexmetrik-golden.json`, `dist/` und `package-lock.json`
   werden nie direkt gelesen (auch nicht von Review-Agents). Das kürzt nur
   den Diagnoseweg, nie ein Tor.
6. **Datei-Schlankheit (Token-Disziplin, übernommen 19.6.2026):** Eine Datei
   der **Darstellungs-/Datenschicht** (`src/pages/`, `src/components/`,
   Vorlagen-Schemas, Config-/Daten-Tabellen) über **~800 Zeilen** wird in
   Geschwister-Dateien + schlankes Barrel gesplittet (verhaltensneutral nach
   diesem §6, golden byte-gleich). Aufteilen ist erlaubt und erwünscht — es ist
   das Gegenteil der nach §4 verbotenen Engine-**Verschmelzung**. Robuste Zahl-/
   CHF-Parser und Altersberechnung kommen aus der geteilten Infrastruktur
   (`vorlagen/datum.ts`, `datumsUtils.ts`), nicht als lokale Kopie — es sei
   denn, die Semantik weicht fachlich bewusst ab (dann am Fundort begründen,
   §1). So lädt eine Session weniger Kontext pro Aufgabe (weniger Tokens, ohne
   Qualitätsverlust).

## §7 Normen: verifizieren, nicht vertrauen

Jeder Norm-Anker wird empirisch gegen Fedlex geprüft (Filestore-HTML,
Anker-Format `art_335_c`, sprachunabhängig). Aufträge — auch sorgfältig
formulierte — können faktische Fehler enthalten oder neueren Entscheiden
widersprechen: dann **abweichend umsetzen und die Abweichung offenlegen**.
`verified: true` und der Status «geprüft» setzen die fachliche Abnahme durch
David (fachkundige Person) voraus — nie automatisch setzen.

**Zitat-Ausnahme (Norm-Snapshot, Entscheid David 16.6.2026):** Gespeicherter
Gesetzestext (Norm-Snapshot für die Volltext-Vorschau) ist zulässig, wenn er
trägt: (a) **Stand** (Konsolidierungs-/Abrufdatum), (b) **amtliche Quelle-URL**,
(c) im UI **sichtbaren Live-Link** zur geltenden Fassung, (d) **automatische
Drift-Erkennung** gegen die Quelle (kein stilles Veralten). Fehlt eines davon,
ist der Snapshot kein Zitat, sondern eine zweite Wahrheit (§5) — dann nicht
speichern. Der Snapshot ist nie die massgebliche Fassung; das ist die amtliche
Quelle (in der UI offengelegt, §8).

**Quell-Wahl zuerst (Anweisung David 30.6.2026):** Vor jeder Datenextraktion
aus einer amtlichen Quelle wird **empirisch erhoben, welches Format/welcher
Endpunkt das Ziel technisch am besten erreicht** (strukturiertes Schema >
gerendertes HTML > PDF; an die **höchste verfügbare Struktur** andocken) — nicht
reflexhaft die naheliegende Quelle. Probe-Fetch je Kandidat, Inhalt prüfen
(Soft-404-Shells erkennen). **Aber:** ein Quell-/Format-Wechsel wird per Messung
(POC/Differenz) belegt, nie angenommen — Fehler sitzen oft in der eigenen
Transformation, nicht in der Quelle; Wechsel inkrementell, nie Big-Bang.
Beispiel/Detail: Memory `extraktion-amtliche-quellen-beste-option`,
`FAHRPLAN-NORMTEXT-DARSTELLUNG.md §Quell-Architektur-Entscheid` (Fedlex-HTML vs.
Akoma-Ntoso-XML).

**Build-Regel Norm-Snapshots (verbindlich, Auftrag David 16.6.2026):** Die
Volltext-Snapshots (`public/normtext/`) werden AUSSCHLIESSLICH vom Generator
`npm run normtext -- --datum=$(date +%F)` erzeugt, nie von Hand editiert. Jeder
künftige Build/jede neue Norm-Quelle folgt zwingend diesem Muster:
1. **Vollabdeckung** — ALLE Artikel je Erlass extrahieren (Bund: jedes
   `<article id="art_*">` der gepinnten Fedlex-Konsolidierung; Kanton: jeder
   Artikel des LexWork-Erlasses), nicht nur die zitierten.
2. **Aufzählungen vollständig** — lit./Ziff. als `items` je Absatz; nichts
   abschneiden (sonst wirkt die Bestimmung unvollständig).
3. **Immer die GELTENDE Fassung** — Bund über die gepinnte, als aktuell
   verifizierte Konsolidierung (`scripts/fedlex-cache.sh` +
   `check:fedlex-versionen`); Kanton über `current_version` der LexWork-API
   (`version_uid` als Drift-Token). Künftige, noch nicht in Kraft stehende
   Fassungen werden NICHT verlinkt.
4. **Provenienz je Eintrag** — `stand` = In-Kraft-Datum, `quelleUrl`,
   `fassungsToken`, `sha` (über Text + items); §7-Zitat-Ausnahme (a)–(d).
5. **Drift-Tor** — `check:normtext` (offline) + `check:normtext-netz` (live
   version_uid/Konsolidierung) müssen grün sein; im `gate`/`check:netz`
   verdrahtet. Neue Quellen ergänzen einen browserlosen Adapter (Fetch +
   strukturierte Extraktion + Drift-Token), kein Headless-Browser, kein
   Scraping pro Kanton. Detail-Referenz: `FAHRPLAN-GESETZESTEXT-POPUP.md`.
   **Kantonales Gesetz nur als PDF** (Quellen-Priorität LexWork → HTM → HTML →
   PDF → Live-Link-Fallback): verbindliche Extraktions-/Speicher-Regel (Profil
   im `adapter-pdf.ts`, pdfjs Build-Zeit, Body-Spalten-x, Stand/Drift-Token,
   Qualitäts-Tor → sonst ehrlicher Fallback) in
   `bibliothek/normen/norm-vorschau-snapshot-system.md` (§11).
6. **DB-Artefakt als kanonische Zwischenschicht (Entscheid David/Council 2.7.2026,
   QS-DATA):** Der Generator DARF die extrahierten Inhalte zuerst in EIN
   generator-erzeugtes Datenbank-Artefakt (libSQL/SQLite, `daten/lexmetrik.db`)
   materialisieren; `public/*.json` und die prerenderten Seiten sind dann eine
   **deterministische Projektion** aus diesem Artefakt. Bedingungen: (i) jede
   Zeile trägt die Zitat-Ausnahme (a)–(d) als Spalten (Stand, amtliche quelleUrl,
   Drift-Token/sha; der sichtbare Live-Link kommt aus der Projektion in die UI);
   (ii) das Paritäts-Tor **`check:paritaet`** beweist die Projektion byte-gleich
   gegen den bisherigen Generator-Output, solange beide Pfade existieren, danach
   gegen die committete Projektion; (iii) die Drift-Tore aus Regel 5 bleiben
   Arbiter gegen die amtliche Quelle; (iv) massgeblich bleibt immer die amtliche
   Fassung — das DB-Artefakt ist Werk-Zwischenprodukt, nie zweite Wahrheit (§5).
   Detail: `FAHRPLAN-DATENHALTUNG.md`.

## §8 Ehrlichkeit gegenüber Nutzern

Das Status-Modell (entwurf / geprüft / geplant) zeigt den echten
Prüfungsstand. Unsicherheiten, offene kantonale Verifikationen und
methodische Annahmen werden in der UI offengelegt, nicht weggeglättet.
Keine Rechtsberatung; Formvorschriften (Eigenhändigkeit, Beurkundung)
bestimmen, welche Exportformate überhaupt angeboten werden.

## §9 Deploy-Disziplin

Vor jedem Deploy: Bug-Check (unabhängige Review-Agents + empirische Repros +
Regressionstests). Prod: `npx vercel --prod` (Projekt `lexmetrik`, lexmetrik.vercel.app).

**Merge = Deploy-Entscheid (David 3.7.2026, «Weg 1»):** Vercel liefert `main`
automatisch auf Prod aus — damit IST die Freigabe zum **Merge nach `main`** die
Live-Gang-Entscheidung; ein separater `vercel --prod`-Handschritt ist nicht nötig.
Die §9-Sorgfalt (Bug-Check, grüne Tore, Golden byte-gleich) gilt weiterhin **vor**
dem Merge. **Push** ist stehend freigegeben («immer ja zum push», 2.7.2026: `git push`
+ PR + Auto-Merge ohne Einzel-Nachfrage). Bewusste Grenze bleibt: nichts mergen, was
die Tore rot lässt oder nicht doppelt verifiziert ist.

## §10 Wachstum folgt dem Rahmen

Neue Vorlagen/Rechner nutzen die bestehenden geteilten Bausteine (Engine-
Muster, Wizard-Rahmen, `ui.tsx`, Renderer) statt Kopien anzulegen. Wenn ein
Rahmen fehlt, wird **erst der Rahmen** gebaut (als verhaltensneutraler
Schritt nach §6), dann das neue Feature darauf.

## §11 Erforschtes Wissen wird geordnet abgelegt (Anweisung David 6.6.2026)

Jede Recherche (Normen, kantonale Erlasse, Behördendaten, Parameter,
Rechtsprechung) mündet in eine **geordnete Übersichtsliste** in der
`bibliothek/` mit Eintrag in deren `INDEX.md` — nie nur in Chat-Antworten
oder Commit-Messages. Struktur engine-orientiert, damit beim Bau direkt
daraus gearbeitet werden kann:

1. **Quelle + Stand** (amtliche URL, Konsolidierungs-/Abrufdatum),
2. **Regel deterministisch formuliert** (decision-tree-fähig: Eingabe →
   Ausgabe, keine Prosa-Reste),
3. **Geltungsbereich und Ausnahmen** (Kantone, Fussnoten, Bedingungen,
   Teilgebiete),
4. **Pflegebedarf** (datierte Parameter → Verfallsregister-Kandidat),
5. **Abnahme-Status** (Erstrecherche / zweifach geprüft / durch David
   abgenommen).

Erkenntnisse, die bestehenden Code korrigieren, werden zusätzlich am
Fundort als Kommentar mit Quellenverweis verankert (§7).

## §12 Parallel-Sessions nur isoliert (Anweisung David 10.6.2026)

Gleichzeitige Sessions im selben Arbeitsverzeichnis haben wiederholt
Arbeit zerstört (Dateien stumm überschrieben, gestagte Inhalte über den
geteilten Index in fremde Commits gewandert, ein fremder Commit per
`--amend` umgeschrieben). Darum:

1. **Zweite und jede weitere Session arbeitet in einem eigenen
   git-Worktree** (`git worktree add …` bzw. die native
   Worktree-Isolation von Claude Code) und bringt Ergebnisse als Commits
   zurück. Wer beim Start fremden WIP in `git status` sieht, der nicht
   zum eigenen Auftrag gehört, wechselt vor Struktur-Arbeiten in einen
   Worktree.
2. Im geteilten Verzeichnis gelten zwingend: Commits nur mit explizitem
   Pathspec (`git commit -m … -- <dateien>`) · kein `git stash` bei
   fremdem WIP · kein `git commit --amend` (Hook blockiert) · nach jedem
   Commit die `--stat`-Dateizahl gegen die eigene add-Liste prüfen.
3. Deploys nie aus dem Arbeitsverzeichnis, immer aus einem sauberen
   HEAD-Worktree (Details: Skill `deploy-check`).

## §13 Design folgt dem Dach-Reglement (Anweisung David 25.6.2026)

Jede sichtbare Änderung — Seite, Komponente, generierter Text, Output — folgt
`DESIGN-REGLEMENT.md`. Das ist die **site-weite Dach-Schicht**, aus der
Legal-Design-Recherche abgeleitet (Hagan/Stanford, MIT-TedLab,
WorldCC-Patterns; doppelt verifiziert). Darunter konkretisieren die drei
Domänen-Reglemente (`DESIGN-REGLEMENT-RECHNER.md`,
`-RECHTSPRECHUNG.md`, `-VORLAGEN.md`) ihren Bereich; bei Konflikt gewinnt das
speziellere *innerhalb seiner Domäne*, sonst das Dach.

Operativ heisst das für jede UI-/Text-Arbeit:

1. **Tokens, keine Magic-Numbers** — Grössen/Farben/Abstände nur aus
   `tailwind.config.js` + `src/index.css`. Verboten: Tailwind-Default-Grössen
   `text-sm`/`text-lg`, Arbitrary-Sizes `text-[…px]`, Ad-hoc-Status-Farben
   (`text-red-…`, `bg-green-…`), Hex/`rgb()` in Komponenten (§13/D2, B2, B3).
2. **Verdikt zuerst, Warum auf Abruf**; Fliesstext in der Lesespalte
   (`max-w-reading`), nie volle Fensterbreite (B1, B2).
3. **Sprache:** Aktiv, kurze Sätze, keine Schachtelsätze, kein ALL-CAPS-
   Fliesstext, Fachjargon erklärt; klar für Fach **und** Laie (A1–A3).
   **Kein** Lesbarkeits-Score als Gütesiegel (A4).
4. **Leeres Formular zeigt keine Fehler** vor der ersten Eingabe (C2).
5. **Jeder Rechtswert mit Norm + Link + Stand** (D1, verzahnt mit §7).
6. Maschinell prüfbare Regeln gehören in ESLint/Tests, nicht nur ins .md
   (E1). Empirie ist überwiegend US-basiert — CH/DE-Detailentscheide an
   echtem Verständnis prüfen, nicht aus US-Daten ableiten (E2).
7. **UI-Design (Block F, gegründet auf `docs/recherche-ui-design-2026-06-25.md`):**
   Kontrast WCAG 2.2 — Text ≥ 4.5:1, Nicht-Text/Fokus/Borders ≥ 3:1, in Hell
   UND Dunkel (F2). Sichtbarer Fokus über **Outline, nicht Farbe allein** (F3).
   Interaktive Komponenten bedienen die **volle Zustands-Matrix** inkl.
   disabled/loading/selected/empty/error (F4). Jede `bg-*`/`border-*`/`text-*`-
   **Farbe muss in `tailwind.config.js` existieren** (sonst stiller No-op), keine
   toten Tokens/Klassen, kein Ad-hoc-Inline-Style wo ein Token existiert (F7).
   Abstand aus der Mass-Skala, Dichte als bewusster Hebel (F1). Politur/
   Fehlerfreiheit = Trust, nicht Kosmetik (F6).

## §14 Aufnahme & Einordnung neuer Aufträge (Anweisung David 29.6.2026)

Jeder neue Auftrag wird über **einen** Eingang aufgenommen, gebündelt und verortet — nie als loses Dokument danebengelegt:

1. **Eingang ist `ROADMAP.md`** — die «Geordnete Abarbeitung» (Wellen/Schritte), bei begleitenden Aufgaben das «Querschnitt-Band». Eine neue `FAHRPLAN-*.md` entsteht **nur** als Detailquelle, verlinkt aus einem ROADMAP-Schritt; sie ist **nie** zweiter Einstieg, immer nur Detailquelle. Klein → inline im Schritt, gross → in die verlinkte Detaildatei. Der Querschnitt-Wächter **`QS-PH`** (geführt im Querschnitt-Band der `ROADMAP.md`) meldet jede neu hinzugefügte, aus keinem ROADMAP-Schritt verlinkte `FAHRPLAN-*.md` **rot**.
2. **Abgleich → Bündeln → Einordnen.** Vor dem Einsortieren prüfen, ob ein verwandter/überlappender Schritt existiert oder dieselben Dateien / dasselbe Subsystem / dasselbe Datenasset / dieselbe Prüf-Fläche berührt sind → zu **einer** Bau-Einheit bündeln (einmal bauen, prüfen, deployen). **Nicht über-bündeln:** keine Risiko-Klassen mischen (Rechtsinhalt ≠ reines UI in einer Einheit, §1/§3), die Einheit klein genug für ein sauberes Gate und golden byte-gleich (§6). Kohärent mit «nie zwei 26×-Assets parallel» (ROADMAP-Leitprinzip 4) und §12 (Worktree-Isolation bei Datei-Kollision).
3. **Verortung nach Thema + Abhängigkeit + Risiko** in die passende Welle / den passenden Schritt. Bei Überschneidung **zusammenführen statt daneben** — kein Parallel-Schritt für dieselbe Bau-Fläche.
4. **Definition of Done:** §6-/§9-Tore grün **und** — bei Risiko-Pfaden (Extraktion / Rechnen / Norm-Tarif) — lief die adversariale Gegenprüfung (Tor **`check:gegenpruefung`**, geführt als Querschnitt **`QS-GP`** im Querschnitt-Band der `ROADMAP.md`; **das Tor steht (1.7.2026, Bausteine a+b+c)** und blockiert `npm run gate` lokal, bis für den Diff ein `bestanden`-Nachweis vorliegt — Protokoll: Skill **»gegenpruefung«** fahren, dann `npm run gegenpruefung:ok`; Detailquelle `docs/superpowers/specs/2026-07-01-gegenpruefung-gate-design.md`). Verhaltensändernd ⇒ golden byte-gleich (§6). Status-Marker (§8) gesetzt und die STRUKTUR-Pflege (Kopf-Abschnitt »STRUKTUR.md aktuell halten«) erfüllt: Session-Karte in `STRUKTUR.md` nachgezogen.
5. **Trailer-Konvention.** Ein Commit, der einen ROADMAP-Schritt erfüllt, trägt `Roadmap: <ID>` (stabile Schritt-ID = Wellen-Schritt-Nummer bzw. Querschnitt-Tag aus `ROADMAP.md`, z. B. `W2·6` für «Welle 2 · 6», `QS-GP`). Risiko-Pfad-Commits zusätzlich `Gegenpruefung: <Verdikt> (<Modell>, <Linsen>) — <Befunde>` (oder `Gegenpruefung: n/a — reine Prüflogik` bei Tor-/Test-Code ohne Inhaltsänderung). So bleibt Schritt → Commit → Prüfung rückverfolgbar.
6. **Kontext-Hygiene.** Hebel-Reihenfolge: **Delegieren > Persistieren > gezielt lesen > Handoff > `/compact`.** Schwere Lese-/Prüfarbeit an Sub-Agenten/Workflows geben (hält Tool-Output aus dem Hauptkontext). Wahrheit ist der laufend auf Platte geschriebene Zustand (`ROADMAP.md`, `STRUKTUR.md`, Register, Commits). Komprimieren/Handoff **nur an einer Bauschritt-Grenze**, nie mitten im Schritt; bei persistiertem Zustand einen frischen Session-Handoff vor `/compact` bevorzugen. Eine `/compact`-Zusammenfassung ist **Zeiger auf die Platte, kein Detailspeicher**. Für das
Delegieren gilt das **Standard-Dispatch-Template** (`docs/token-oekonomie/dispatch-template.md`,
QS-TOK/T4): je Sub-Agent Whitelist + TABU je Auftragsklasse + §-Slice (`npm run fahrplan`) +
kompaktes Pflicht-Rückgabe-Schema, `model`+`effort` in **jedem** Task-Call explizit (Risikopfade/
Gegenprüfung fix Opus/high) — Beweis, Tore und Gegenprüfung bleiben davon **unberührt IM Agenten**.

## §15 Geräte-Last: nicht merklich langsamer — ausser bei Logikverlust (Anweisung David 30.6.2026)

**Lexmetrik wird so gebaut, dass es den Computer des Nutzers nicht merklich langsamer
macht — SOLANGE daraus kein Logikverlust entsteht.** Diese Regel ist der **Korrektheit
(§1) untergeordnet**: bei Konflikt gewinnt **immer die Treue**, nie das Tempo.

«**Logikverlust**» = jeder Verlust an **Inhalts-Treue** (vollständiger Normtext, Tabellen,
Fussnoten), **Rechtsregel-Treue** (Rechner/Werte), **Funktions-Treue** (Ctrl+F über das
*ganze* Gesetz, `#art_`-Anker/Deep-Links, Print/PDF-Vollständigkeit, Scroll-Spy/TOC,
Split-View-Pane-Zustand) oder **golden-Byte-Gleichheit**. Jede Performance-Maßnahme trägt
eine **explizite Logikverlust-Bewertung**; ohne sie wird sie nicht gemerged.

Prüfbare Bau-Regeln (jede mit Treue-Vorbehalt):

1. **Keine DOM-entfernende Virtualisierung von Normtext.** Off-screen-Kosten nur über CSS
   `content-visibility:auto` + `contain-intrinsic-size` senken — jeder Artikel-Knoten bleibt
   im DOM. Verboten ist Windowing/Unmount, das Ctrl+F, Anker-Sprung, Kopieren, Screenreader
   oder SEO über das vollständige Gesetz bricht. *(Lieber langsamer als unvollständig durchsuchbar.)*
2. **CLS = 0 durch reservierten Platz, nie durch weniger Inhalt.** Jeder asynchron einwachsende
   oder localStorage-/fetch-divergente Block bekommt am **prerenderten** Element eine
   token-basierte Mindesthöhe (Mass-Token, kein Magic-Number §13). Client-Initialstate auf den
   Server-Zustand pinnen; abweichender Stand erst per `useEffect` nach Mount. *(Reservierung darf
   keinen Inhalt verstecken/kürzen.)*
3. **Schwere Features lazy + off-critical-path, nie eager-Korpus.** Grosse Parses
   (Snapshot, Struktur-Sidecar, Suchindex) erst bei Bedarf/Interaktion bzw. per
   `requestIdleCallback` (+`setTimeout`-Fallback, garantiert feuernd) oder im Web-Worker — nie
   synchron im ersten Paint. Der **volle** Parse bleibt (kein Teilparse, der Fussnoten/Kopf droppt).
   *(Defer ändert nur das WANN, nie das WAS — das prerenderte HTML trägt LCP/TTI content-vollständig.)*
4. **Memoisierung ist Pflicht, weil der React Compiler AUS ist.** Wiederkehrend gemountete
   Listen-Komponenten mit `React.memo` (Default-Komparator), Handler mit `useCallback`
   (vollständige Deps!), teure Ableitungen in `useMemo`, geteilt via WeakMap auf die
   Datenreferenz (nie global-token-Key → Erlass-Kollision). *(Nur Default-Shallow-memo, kein
   Custom-Komparator, der `fussnotenAuf`/`marg`/`intern`/`suche` unterschlägt — Output byte-identisch.)*
5. **Render-then-replace bleibt; kein naives `hydrateRoot`.** Der Prerender stammt aus einem
   separaten String-Builder (`erlassVolltextHtml`) und der Reader fetcht async — Hydration würde
   Markup-Mismatch (stiller Normtext-Verlust) und §5-Mismatches reaktivieren. Bundle-Splitting
   (`manualChunks`) und Datei-Sharding sind erlaubt, solange die Union datengleich/byte-identisch
   bleibt und golden + `check:normtext`/`check:struktur-konsistenz` grün bleiben.
6. **Long-Tail on demand bleibt inhaltsvollständig.** Wird ein Inhalt jenseits des
   prerenderten Schaufensters erst on-demand (aus dem QS-DATA-Artefakt / einer
   Edge-Query) geladen, gelten dieselben Treue-Pflichten wie prerendert: der
   vollständige Text steht im DOM (Ctrl+F), Anker/Deep-Links und Print/PDF-
   Vollständigkeit funktionieren, Provenienz (§7 a–d) ist sichtbar, Lade-/Fehler-
   zustand ist ehrlich (§8) mit amtlichem Live-Link als Fallback. Ein on-demand-
   Pfad, der kürzt oder nur Ausschnitte lädt, ist Logikverlust.

**Operationalisierung (die «Garantie»):** das Tor **`check:perf-budget`** (Lighthouse-CI auf
`/gesetze/bund/OR` + Startseite unter 4× CPU, gestaffelte CLS/LCP/TBT/Bundle-Schwellen) in der
`gate`-Kette, **gegengekoppelt** an `golden:vergleich`/`check:normtext`/`check:struktur-konsistenz`/
`check:suchindex` + einen Reader-Smoke (Ctrl+F/Anker/Print/Fussnote) — **Tempo zählt nur, wenn
die Treue grün bleibt.** Was zu bauen ist: `ROADMAP.md` → Querschnitt **`QS-PERF`** →
**`FAHRPLAN-PERFORMANCE.md`** (priorisierter Plan, ultracode-Audit 30.6.2026).

## §16 Framework-APIs live nachschlagen, nicht aus Modellwissen (Anweisung David 1.7.2026)

Bei Fragen zu **Framework-/Library-APIs** (Next.js, React, Vite u. a.) zuerst den
**Context7-MCP** für die aktuelle, **versions-genaue** Doku konsultieren — nicht aus
(potenziell veraltetem) Modellwissen antworten. Gilt besonders bei API-Brüchen zwischen
Versionen (z. B. Next.js Cache Components / `use cache`, `cacheLife`). Betrifft nur
Fremd-Bibliotheken; Rechtslogik/Normtext bleiben Domänenwissen (§1/§7), eigener Code wird
direkt gelesen (§5).
