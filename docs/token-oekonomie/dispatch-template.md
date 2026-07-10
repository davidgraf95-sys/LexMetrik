# Standard-Dispatch-Template — Sub-Agenten kompakt beauftragen (QS-TOK P3)

> **Heimat:** Detailquelle zu `FAHRPLAN-TOKEN-OEKONOMIE.md` §5 (P3 Dispatch+Prozess),
> verankert über `CLAUDE.md` §14.6 (Kontext-Hygiene: *Delegieren > Persistieren > gezielt
> lesen > Handoff > `/compact`*). Umgesetzt: **T4** (dieses Template) · **T15** (Modell-/
> Effort-Routing) · **T18** (Screenshot-Diät) · **T11** (Gegenprüfungs-Beschaffung) · **T19**
> (Prompt-Cache-Hygiene).
>
> **Zweck:** Ein Sub-Agent-Auftrag verbraucht heute ~7–25k Tok, die sich vermeiden lassen —
> 5–15k Exploration (fremdes Suchen statt gezieltem Slice) + 2–9,5k Rückgabe (8k-Prosa statt
> 500-Tok-Return). Der Effekt ist **multiplikativ** über jede delegierte Einheit; laut T2-Baseline
> ist Typ **O** (orchestrierte Sessions) mit 99M Tok Mean / $113 pro Session der Pro-Session-
> Grossverbraucher — genau diese Sessions kappt sauberes Delegieren.
>
> **LEITPLANKE (nicht verhandelbar):** Dieses Template kürzt **keine** Qualitäts-Daueranweisung.
> Adversariale Gegenprüfung auf Risikopfaden, doppelte Verifikation, iterative Bug-Checks und
> golden-Byte-Gleichheit bleiben **unverändert IM Agenten** und werden nie „kompakter" gemacht.
> Die Ersparnis kommt aus **gezielterem Lesen und kompakterer Übergabe**, nie aus weniger Beweis.

---

## 1 · Der Dispatch-Kopf (T4)

Jeder `Agent`/Task-Aufruf trägt die folgenden Felder **explizit** im Prompt. Fehlt ein Feld,
sucht der Sub-Agent breit statt gezielt (Exploration-Kosten) oder liefert Prosa statt Fakten
(Rückgabe-Kosten).

```
Rolle/Ziel:   <ein Satz: was gebaut/geprüft/recherchiert wird>
Modell/Effort: <model=… effort=…>            ← Pflicht, siehe §2 (T15)
§-Slice:      npm run fahrplan -- <Datei> <§>  ← nur die zuständigen §§, nicht die Ganzdatei (T3)
              Orchestrator nennt ALLE zuständigen §§; Quer-Lektionen stehen in §0.
Whitelist:    <Arbeitsflächen, an denen der Agent schreiben darf>
              + Erweiterungs-Klausel: darüber hinaus nur mit kurzer Begründung in der Rückgabe.
TABU:         <Flächen, die NICHT berührt werden — je Auftragsklasse, siehe §1.2>
Daten-Sonde:  npm run zeige -- <Erlass> <Artikel>  (T6, statt Voll-Read der normtext-JSONs)
Navigation:   ast-grep / LSP bevorzugt, Grep/Read = Fallback (T9; Muster-Query-Satz in
              docs/token-oekonomie/ast-grep-queries.md); Beweis-Reads unangetastet.
Repo-Map:     npm run map [-- --dir <teilbaum>]  (T8, Modul→Pfad→Exporte→Tor statt Voll-Grep;
              NICHT committen, on-demand; auf Risikopfaden ersetzt sie nie die echte Datei)
Qualität:     Gegenprüfung/Bug-Checks/golden wie immer IM Agenten (Leitplanke — nie kürzen).
Rückgabe:     Pflicht-Schema §3 (Status/Pfade/Gates/offene Punkte/Architektur-Entscheide);
              Details in den PR-Body, nicht in die Rückgabe.
```

### 1.1 · Whitelist mit Erweiterungs-Klausel

Der Agent bekommt eine **positive** Liste der Dateien/Ordner, an denen er arbeiten darf. Muss
er darüber hinaus, ist das erlaubt — aber er **begründet die Erweiterung** in einer Zeile der
Rückgabe (welche Datei, warum nötig). So bleibt der Blast-Radius im PR-Review sichtbar, ohne den
Agenten künstlich zu blockieren.

### 1.2 · TABU je Auftragsklasse (K1)

TABU ist **klassenabhängig**, nicht global. Entscheidend: **kein Hand-Edit und kein Direkt-Read**
der geschützten Fläche — aber **Generator-/Tool-Läufe sind der legitime Weg** an dieselbe Fläche.

| Auftragsklasse | TABU (kein Hand-Edit/Direkt-Read) | Legitimer Weg dorthin |
|---|---|---|
| **UI / Darstellung** | die **Datenfläche** (`public/normtext/*.json`, `daten/*.db`, golden-Snapshots) | Daten-Sonde `npm run zeige` (T6); golden nur über `golden:vergleich`/`golden:diff` |
| **Extraktion / Daten** | die **Arbeitsfläche neben dem Auftrag** + generierte Artefakte von Hand | Generator-Lauf (`scripts/normtext/**`), dann golden byte-gleich prüfen |
| **Prozess / Infrastruktur** | Risikopfade (Rechnen/Norm-Tarif), fremde parallele Worktree-Flächen | gar nicht — reine Prozess-Arbeit fasst keine Inhaltsfläche an |

Parallel-Läufe halten zusätzlich `CLAUDE.md` §12 ein (Worktree-Isolation, Pathspec-Commits).

### 1.3 · §-Slice statt Ganzdatei (T3)

Statt eine 100-KB-`FAHRPLAN-*.md` komplett in den Sub-Agenten zu kippen, referenziert der
Dispatch die zuständigen §§ und lässt den Agenten `npm run fahrplan -- <Datei> <§>` fahren
(druckt Kopf + §0 + Ziel-§ + das komplette ##/###-Inventar als ToC). Der Orchestrator nennt
**alle** zuständigen §§; bei echter Unklarheit über den Querkontext bleibt die Ganzdatei erlaubt.

---

## 2 · Modell-/Effort-Routing (T15)

**`model` und `effort` sind in JEDEM Task-Call explizit gesetzt.** Ohne Angabe fällt der Harness
auf ein Default-Modell zurück (Davids Dauer-Direktive: Task klassifizieren → passendes Modell;
Risikopfade IMMER Opus/high). Wirkung: bis −48…−76 % Output auf effort-gesenkten Schritten;
Haiku ≈ 1/5 des Opus-Preises. Output ist laut T2-Baseline der eigentliche $-Hebel (Opus-Output
≈ 5× Input, in Typ-O-Sessions 494k Tok/Session) — hier wirkt Effort-Senkung direkt.

| Aufgaben-Charakter | Beispiele | Routing |
|---|---|---|
| **Risikopfad** (Rechnen / Extraktion / Norm-Tarif) **und jede Gegenprüfung** | Tarif-Engine, normtext-Extraktion, `check:gegenpruefung`-Zweitdurchgang | **Opus / high — fix, nicht senkbar** |
| **Bau** (Feature-Code, nicht-trivial) | UI-Komponente, Reader-Logik, Skript | **Opus** (Default-Bau), Effort nach Reasoning-Tiefe |
| **Synthese** (lenkt Folge-Sessions!) | Session-Karten, Handoffs, Vermerke, Register-Einträge, Zusammenfassungen | **mind. Sonnet** — oder der bauende Opus; **nie darunter** |
| **Mechanisch** (deterministische, maschinell prüfbare Transformation) | Verschieben, Formatieren, Log-Extrakt, Fertigtext einsetzen, Umbenennen | **Haiku / low** |
| **Sehr einfach + klar** | eng umrissener, eindeutiger Ein-Datei-Fix | Sonnet |

**Trennschärfe (K):** „mechanisch" = das Ergebnis ist eine **deterministische Transformation, die
sich maschinell nachprüfen lässt** (Byte-Diff, Test). Sobald Urteil, Auswahl oder Formulierung
im Spiel ist, ist es **Synthese** — und Synthese, die künftige Sessions steuert (Steuer-Doku!),
läuft nie unter Sonnet. Die Wirkung des Routings sitzt primär auf den Reasoning-Anteilen; die
konkreten Schwellen werden per T2-Baseline kalibriert.

---

## 3 · Pflicht-Rückgabe-Schema (T4)

Der Sub-Agent gibt an den Orchestrator **nur** die folgenden Felder zurück (Richtwert **≤ 2k
Tok**). Alle Details — Diffs, lange Begründungen, Datei-Dumps — gehören in den **PR-Body**, nicht
in die Rückgabe. Beleg: ein 500-Tok-Return statt 8k-Prosa spart pro Delegation, multiplikativ.

1. **Status** — fertig / blockiert / teilweise, in einem Satz.
2. **Pfade** — geänderte/angelegte Dateien (absolute Pfade), keine Inhalte.
3. **Gates** — welche Tore liefen, Ergebnis; PR-Nr. + Auto-Merge-Status falls vorhanden.
4. **Offene Punkte** — mit Grund (nicht nur „TODO").
5. **Architektur-Entscheide** — nur die, die der Orchestrator kennen muss.

**Zusätzlich Pflicht, NIE gekürzt (K2 — die Leitplanke schlägt den Richtwert):**

- **Gegenprüfungs-Verdikt** samt **Linsen** und **Befund-Kernen** (bei Risikopfad-Arbeit) —
  vollständig, auch wenn das die 2k sprengt. Fails und Befunde werden **nie** komprimiert.
- **Whitelist-Erweiterungen** — jede über die Whitelist hinaus berührte Datei + Grund (§1.1).

Der Richtwert ≤ 2k diszipliniert die *Prosa*, nicht den *Beweis*. Ein roter Test, ein
Gegenprüfungs-Befund, ein Fail-Log geht immer vollständig zurück.

---

## 4 · Screenshot-Diät bei Fakt-Checks (T18)

Ein PNG-Read kostet ~1–1,6k Tok. Für **Fakten**, die im DOM stehen, genügt
`get_page_text` / eine DOM-Assertion / ein `find` — kein Screenshot.

**Positivliste — DOM erlaubt (nur diese):**

- **Existenz** eines Elements / einer Sektion.
- **Textinhalt** (steht der Wert/Artikel/Titel da?).
- **Attribute / `aria-*`** (Rollen, Labels, `href`, `id`/Anker).
- **Klassen- / Style-FAKTEN** (Klasse gesetzt? Token-Wert im Stylesheet?).

**Screenshot-pflichtig (bleibt Bild, immer):**

- **Geometrie / Layout** — Position, Umbruch, Überlappung, Abschneiden (Clipping).
- **Sichtbarkeit / Überdeckung** — inkl. „wird angezeigt": ein Element kann DOM-korrekt da und
  trotzdem verdeckt/geclippt sein. Clipping- und Überdeckungs-Bugs sind **DOM-korrekt** — der
  DOM lügt hier nicht, er zeigt sie nur nicht.
- **Umbruch / Kontrast / Farbe** — WCAG-Kontrast, Zeilenumbruch, visuelle Dichte.
- **Reader-Flächen** grundsätzlich Screenshot-Default (Normtext-Darstellung ist visuell kritisch).

**Im Zweifel: Screenshot.** Die Positivliste ist eng gemeint — sie deckt Fakt-Existenz ab, nie
„sieht es richtig aus".

---

## 5 · Gegenprüfungs-Agent: Beschaffung übergeben (T11)

Wird der adversariale Zweitdurchgang (`check:gegenpruefung`, Skill »gegenpruefung«) als
Sub-Agent gefahren, spart der Orchestrator dem Prüf-Agenten die **Beschaffungs-Runde** (Fetch/
Suche nach der amtlichen Quelle, ~5–15k Tok): er übergibt

- den **gepinnten amtlichen Filestore-HTML-Pfad** (via `scripts/fedlex-cache.sh`), und
- den **Scope-Anker aus der roten Tor-Meldung** (welche Dateien/Artikel im Diff).

**Was NICHT übergeben wird (K — Common-Mode-Schutz):** Die eigentliche **Re-Derivation aus der
Norm bleibt vollständig beim Prüf-Agenten** (unabhängig rechnen/ableiten, Randfall, Beleg). Und:

- Der Prüf-Agent führt den **Currency-Check SELBST** (`check:fedlex-versionen` / `check:caches`).
  Er übernimmt den Pin **nur bei eigenem Grün** — sonst holt er die Fassung **live**.
- Er zeigt **nie** auf den Bau-Pfad-Grün, den Code oder eine zweite Ableitung (Skill-Regeln 2+5).

So kürzt die Übergabe nur die *Beschaffung*, nie die *Prüfung*. Volle Wirkung erst nach
Fedlex-P1a/b (bis dahin sind Pins z. T. überholt → der eigene Currency-Check fängt das ab).

> Dieser Abschnitt ist auch als **Zusatz im Skill »gegenpruefung«** hinterlegt (Abschnitt
> „Beschaffung als Sub-Agent — was übergeben werden darf"). Der Skill bleibt die operative
> Heimat des Protokolls; dieses Template referenziert ihn nur.

---

## 6 · Prompt-Cache-Hygiene (T19)

Der Cache-Read-Anteil dominiert das Token-Volumen (T2-Baseline: **95,8 %**). Cache-Read kostet
~10 %, Cache-Write ~125 % gegenüber frischem Input — der **byte-stabile Präfix** ist damit der
grösste Preisposten. Regeln:

1. **SessionStart-Injektion byte-stabil halten.** Wechselnder additionalContext bricht den
   Präfix-Cache jeder Session. *(Die Ablösung der Warn-Injektion durch stille Rotation kommt aus
   **T1**/`struktur-rotieren.py` — siehe §7 „Offen".)*
2. **`CLAUDE.md` nicht mitten in einer Kampagne editieren** — jede Änderung invalidiert den
   Präfix für alle Folge-Turns. Struktur-Edits an CLAUDE.md gebündelt an Schritt-Grenzen.
3. **Agenten-Läufe dicht bündeln** (Cache-TTL ~5 Min): mehrere Sub-Agenten desselben Präfixes
   zeitnah starten, nicht über Stunden verteilt.

Wirkung ist **dollar-seitig** (höhere cacheRead-Quote), das Token-*Volumen* bleibt gleich.

---

## 7 · Offen / abhängig

- **T19 Warn-Injektions-Entfernung** — hängt an **T1** (`struktur-rotieren.py`, PR #176 QS-TOK
  P1-Rest). Solange #176 nicht gemergt ist, bleibt `.claude/hooks/struktur-aktuell.py` die
  warnende SessionStart-Injektion. Sobald #176 auf main ist: die Warn-Injektion durch die stille
  Rotation ablösen (dann ist der SessionStart-Präfix byte-stabil). **Nicht auf ungemergtem Stand
  gebaut** (Vorgabe).
- **check:plan** ist auf `origin/main` bis zum Merge von #176 rot (`QS-TOK`-@meta verwaist);
  wird von #176 geheilt. P3 fixt das nicht selbst (P1b-Fläche).

---

## Anhang A · Probe-Dispatches (DoD T4/T15)

Zehn Muster-Dispatch-Köpfe über die realen Auftragsklassen. **Jeder** trägt `model`+`effort`
explizit (DoD T15: Stichprobe 10/10 = 100 % explizit) und hält das Schema aus §1/§3.

1. **UI-Bau** — Reader-Randtitel-Fix.
   `model=opus effort=high` · §-Slice `fahrplan -- FAHRPLAN-GESETZES-UX §10` ·
   Whitelist `src/components/gesetz-leser/**` · TABU Datenfläche (`public/normtext/*.json` nur via
   `npm run zeige`) · Rückgabe §3 · golden byte-gleich IM Agenten.
2. **Extraktion** — neuen Bund-Erlass generieren.
   `model=opus effort=high` (Risikopfad) · §-Slice `fahrplan -- FAHRPLAN-NORMTEXT-DARSTELLUNG §M13` ·
   Whitelist `scripts/normtext/**` + Generator-Output via Lauf · TABU Hand-Edit der JSONs ·
   Rückgabe §3 **inkl. Gegenprüfungs-Verdikt/Linsen/Befunde** (K2).
3. **Gegenprüfung** — Zweitdurchgang Tarif-Diff.
   `model=opus effort=high` (fix) · Beschaffung: gepinnter Filestore-HTML + Scope-Anker (T11) ·
   Prüf-Agent macht Currency-Check selbst · Re-Derivation aus der Norm vollständig · Rückgabe:
   Verdikt + Beleg (Norm/§/Link/Stand), Befunde ungekürzt.
4. **Recherche/Sweep** — „wo lebt Symbol X?".
   `model=sonnet effort=medium` · Navigation ast-grep/LSP zuerst · Whitelist keine (read-only) ·
   Rückgabe: Pfade + Fundstellen, keine Datei-Dumps.
5. **Mechanisch** — Erledigt-Prosa in `ROADMAP-CHRONIK.md` verschieben.
   `model=haiku effort=low` · deterministische Verschiebung, Byte-Diff prüfbar · Whitelist
   `ROADMAP.md`, `ROADMAP-CHRONIK.md` · Rückgabe: Pfade + Zeilenzahl-Delta.
6. **Synthese** — Session-Handoff schreiben.
   `model=sonnet effort=medium` (mind. Sonnet, steuert Folge-Sessions) · Whitelist `STRUKTUR.md` ·
   Rückgabe: Karte-Kern + Pointer, kein Detailspeicher (§14.6).
7. **Log-Diät** — roten CI-Run extrahieren.
   `model=haiku effort=low` · `npm run ci:log [-- <run-id>]` (T12 Stufe 1: ent-präfixt +
   gruppiert, Fails vollständig) · read-only · Rückgabe: Fail-Block + Job-Name.
8. **Perf-Bau** — CLS-Mindesthöhe an einer Komponente.
   `model=opus effort=medium` · §-Slice `fahrplan -- FAHRPLAN-PERFORMANCE §…` · Whitelist die
   eine Komponente · golden + `check:perf-budget` IM Agenten · Rückgabe §3.
9. **Fakt-Check UI** — „steht der Wert im DOM?".
   `model=sonnet effort=low` · **DOM-Assertion** (T18-Positivliste: Textinhalt), **kein
   Screenshot** · Rückgabe: gefunden ja/nein + Selektor.
10. **Visueller Check** — „ist der Randtitel abgeschnitten?".
    `model=opus effort=medium` · **Screenshot-pflichtig** (T18: Clipping/Geometrie) — DOM
    genügt hier nicht · Rückgabe: Befund + Bildverweis.

**DoD-Beweis:** 10/10 Köpfe tragen `model`+`effort` explizit; keiner routet eine Synthese
(#6) oder einen Risikopfad/Gegenprüfung (#2,#3,#8,#10) unter das jeweilige Minimum; #9 nutzt
DOM nur für einen Fakt (Positivliste), #10 bleibt Screenshot.
