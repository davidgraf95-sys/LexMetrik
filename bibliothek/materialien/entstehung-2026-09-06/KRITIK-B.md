# Kritik B — adversarialer Zweitblick, §11 „Entstehung am Artikel" Fassung 2

Rolle: unabhängiger Zweitkritiker (read-only, ohne Kenntnis Kritik A). Prüfobjekt:
`fahrplaene/FAHRPLAN-MATERIALIEN-VERZAHNUNG.md` §11, gegen Code + Berichte R1–R5
+ `nutzersicht-vorbilder.md` (F1–F10) + `curia-vista.md` gegengeprüft.

## B1 — Blocker: Speicherung von Parlamentarier-Namen ungeklärt
**Spec-Stelle:** §11.4 Kantentypen-Zeile „Vorlage → Parlament: … Vote+Voting für
NR-Schlussabstimmung (2 Requests je Geschäft)"; §11.7 E4 „Nutzer sieht: NR/SR-Kästen,
NR-Stimmen".
**Befund:** Die OData-Entität `Voting` (die für „NR-Stimmen" angezapft wird) führt laut
Recherche selbst **`PersonNumber`, `FirstName/LastName`, Canton, ParlGroupCode** je
Einzelstimme — 4,8 Mio. Sätze. §11.6 sagt nur „extrahiert ~2 KB je Geschäft", nennt aber
nirgends, ob Namen extrahiert/gespeichert oder verworfen werden (nur Aggregat Ja/Nein/
Enthaltung). Damit bleibt offen, ob LexMetrik erstmals Personendaten von Amtsträgern
vorhält — ein Politikfeld mit Persönlichkeitsrechts-Implikationen, den kein anderes Modul
im Repo kennt.
**Beleg:** `bibliothek/materialien/entstehung-2026-09-06/curia-vista.md:112-118`
(`Voting`: `FirstName/LastName`); Fahrplan §11.4/§11.6 nennt keine Namens-Policy.
**Schwere:** Blocker (fehlender Entscheid vor Bau von E4, betrifft Datenschutz).
**Änderungsvorschlag:** §11.4/§11.6 explizit ergänzen: „Voting wird nur aggregiert
(Ja/Nein/Enthaltung-Summen), FirstName/LastName/PersonNumber werden nie extrahiert
noch gespeichert" — und als eigenen David-Entscheid in §11.9 aufnehmen.

## B2 — berechtigt: Nutzerfrage F5 (Kommission/Berichterstatter) komplett unbehandelt
**Spec-Stelle:** §11.4 (Kantentypen), §11.7 (Etappen), §11.8 (Abgesagt-Liste).
**Befund:** `nutzersicht-vorbilder.md` §1 listet zehn Praktikerfragen; F5 „Welche
Kommission hat den Absatz eingefügt, wer war Berichterstatter?" kommt in der gesamten
Bau-Spec **kein einziges Mal** vor — weder als geplante Kante, noch als Etappe, noch in
§11.8 „Abgesagt nach Prüfung" (die Liste zählt explizit andere Absagen auf, F5 fehlt dort
auch). Der Vorbild-Bericht selbst nennt `Preconsultation`/`Rapporteur`/`Committee` als
existierende Entitäten (curia-vista.md §5), die Spec ignoriert sie stillschweigend.
**Beleg:** `grep -c "Kommission\|Rapporteur\|Committee\|Preconsultation"
fahrplaene/FAHRPLAN-MATERIALIEN-VERZAHNUNG.md` = 0; `nutzersicht-vorbilder.md:8`.
**Schwere:** berechtigt (Vollständigkeitsanspruch der Spec — «zehn Fragen» — wird nicht
eingelöst, ohne dass die Lücke benannt wird; §8-Ehrlichkeit gilt auch für die Planung).
**Änderungsvorschlag:** F5 ausdrücklich in §11.8 als „abgesagt" mit Begründung
aufnehmen oder als „später"-Zeile in §11.7 nachtragen.

## B3 — berechtigt: Kosten/Request-Volumen des Curia-Vollabgleichs nicht beziffert
**Spec-Stelle:** §11.6 Zeile „Parlament (385 Geschäfte) … Vollabgleich je Lauf, kein
Inkrement"; §11.4 „2 Requests je Geschäft" für NR.
**Befund:** 385 Geschäfte × mehrere Entitäten (Resolution, Vote, Voting, Objective,
Business) ⇒ mindestens ~1000+ Requests pro Lauf, dazu die im README selbst belegte
„1000er-Paging"-Falle (`ws.parlament.ch` kappt `$top` serverseitig bei 1000 unabhängig
vom Parameter). Zum Vergleich: das bestehende `check:botschaften-netz` braucht für die
GESAMTE Erlass-Grundmenge nur 5 Batch-Requests/~2 s (Kommentar in
`scripts/materialien/check-botschaften-netz.ts:14-15`). §11.6 nennt für Curia weder
Request-Zahl noch Laufzeit noch welcher Kette (`check:netz` vs. `check:netz:kette`,
beide separat in `package.json:34-35`) das neue Tor angehängt wird.
**Beleg:** `curia-vista.md:144` (Pagination-Frage selbst als offen markiert: „4835
Requests à 1000" bei Voting); `package.json:34-35,38`.
**Schwere:** berechtigt (Betriebskosten/CI-Laufzeit-Risiko, §17-Wurzel-Fix-Pflicht bei
erkanntem Prozessproblem — hier vorab nicht gemessen).
**Änderungsvorschlag:** vor E4-Bau eine Kostenschätzung (Requests/Laufzeit) im Fahrplan
ergänzen und die Ziel-Kette (`check:netz` oder eigener Cron wie `normen-monitor.yml`)
festlegen.

## B4 — berechtigt: E3-Blocker gegen W2·24 ungenau beziffert
**Spec-Stelle:** §11.7 E3 „wartet auf Landung von `feat/w2-24-r4-leser` … und
`feat/w2-24-r6`".
**Befund:** Keiner der zehn `feat/w2-24-*`-Branches ist auf `main` gemerged
(`git branch --merged main` liefert keinen Treffer); `r4-leser` ist nur in den
Sammelbranch `feat/w2-24-design-identitaet` gemerged, nicht in `main`. `r6` selbst ändert
`ArtikelHistorie.tsx` nur um **eine Zeile** (`git diff main origin/feat/w2-24-r6 --stat`
= „1 file changed, 1 insertion, 1 deletion"). Die Spec suggeriert einen grösseren
Umbau-Konflikt, ohne die tatsächliche Diff-Grösse oder den realen Landungs-Horizont
(9 offene Branches, keiner auf main) zu nennen — E3 könnte real länger blockiert bleiben
als die Etappen-Tabelle andeutet.
**Beleg:** `git branch --merged main | grep w2-24` (leer); `git diff main
origin/feat/w2-24-r6 --stat -- src/pages/gesetz-leser/parts/ArtikelHistorie.tsx`.
**Schwere:** berechtigt (Planungsrisiko, Reihenfolge-Aussage nicht mit Ist-Stand belegt).
**Änderungsvorschlag:** in §11.7 den tatsächlichen Landungsstand (main vs.
Sammelbranch) und die Diff-Grösse von r6 nennen, statt pauschal „wartet auf Landung".

## B5 — Hinweis: „heute"-Marke auf Fassungsleiste bei künftigen Ständen unklar
**Spec-Stelle:** §11.5 Fassungsleiste „ein Punkt je datiertem Ereignis … «heute» sage";
§11.7 „57 angekündigte künftige Konsolidierungen bis 2032 liegen als HTML vor —
Zeitreise vorwärts ist derselbe Mechanismus."
**Befund:** Die Spec regelt nicht, wie ein Ereignis **nach** dem „heute"-Punkt
beschriftet wird (z. B. „tritt in Kraft am …" statt „gilt seit"), obwohl 57 solche Fälle
bereits vorliegen — Verwechslungsgefahr mit bereits geltendem Recht (§8-Ehrlichkeit).
**Beleg:** §11.7 Zeile „später"/M16-Absorption; keine Formulierungsregel in §11.5.
**Schwere:** Hinweis.
**Änderungsvorschlag:** in §11.5 einen Satz zur Beschriftung künftiger Punkte ergänzen.

## Nicht geprüft
- Playwright-CLS-Messung für E3 (kein Code vorhanden, nur Testabsicht in Etappe genannt).
- Tatsächliche Byte-Zahlen der Synopse-Schätzung (3,8–9,7 MB) — nicht nachgerechnet,
  nur Plausibilität gegen R2 anhand der Spec-Zitate geprüft, keine eigene Fedlex-Abfrage.
- DESIGN-REGLEMENT-Konformität der drei neuen Chip-Texte im Detail (Farbklassen,
  Kontrastwerte) — nur Chip-Vokabular-Stellen gegengelesen, keine Kontrastmessung.
- ROADMAP.md-Eintrag für `W2·6c-*` existiert noch nicht (`grep` leer) — konsistent mit
  „Bau erst auf Go", nicht als Mangel gewertet.
