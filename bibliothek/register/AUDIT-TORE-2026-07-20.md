# Tor-Wirksamkeits-Audit — welchen Toren zu trauen ist (20.7.2026)

**Erstellt:** 20.7.2026, Auftrag David (R1 «Tor-Wirksamkeits-Audit», QS-BASIS (c)
CI/lokal-Tor-Parität). Read-only-Audit, **kein Umbau** — es wurde keine Tor-Logik
geändert und nichts gestrichen.
**Status:** ZWEIFACH GEPRÜFT (strukturelle Messung + empirische Sabotage-Probe je
Behauptung; jede Probe byte-gleich zurückgebaut, sha256-verifiziert).

**Methode.** Drei Ebenen, in dieser Reihenfolge:

1. **Strukturell messen** — welches Tor läuft in welchem Workflow (maschinell aus
   `package.json` + `.github/workflows/`), welcher Workflow lief je wann
   (`gh run list`).
2. **Empirisch falsifizieren** — für jede Allowlist-Begründung, die einen
   *Ersatz-Arbiter* behauptet, wurde ein künstlicher Defekt **genau der Klasse**
   eingepflanzt, die das Tor fangen soll, und gemessen, ob der behauptete Ersatz
   rot wird (CLAUDE.md §6 Ziff. 7: «Wer ein Tor baut, zeigt es einmal rot»).
3. **Zurückbauen und beweisen** — jede Probe per `git checkout` zurückgesetzt und
   die Byte-Identität mit `shasum -a 256 -c` gegen den vor der Probe genommenen
   Hash bestätigt. Der Arbeitsbaum war nach jeder Probe wieder `git status`-leer.

**Kein Beleg aus Nachbildung.** Alle Verdikte stammen aus echten Aufrufen der
echten Scripts (`npm run …`) im Worktree `lm-toraudit` auf `origin/main`
(`f6d1b368`), nie aus nachgebauten Prüf-Fragmenten.

---

## 1. Die Zahl vorweg

| Grösse | Wert | Quelle |
|---|---|---|
| `check:*`-Einträge in `package.json` | **58** | `package.json` |
| Tore in der `check:seriell`-Kette | **36** | `check:seriell` |
| davon im **PR-Pfad** (`ci.yml`) | **12** | maschinell ausgezählt |
| davon nur in **geplanten** Workflows | **4** | 3× `fedlex-frische.yml`, 1× `turso-sync.yml` |
| davon in **KEINEM** Workflow | **20** | = die Allowlist |
| Laufzeit **aller 20** Allowlist-Tore unter `CI=1` | **10 Sekunden gesamt**, alle grün | gemessen 20.7.2026 |

Die letzte Zeile ist der wichtigste Befund des Audits: **es gibt kein
Kostenargument für die Lücke.** Kein einziges der 20 Tore braucht eine Ressource,
die im CI-Checkout fehlt; zusammen kosten sie zehn Sekunden.

**Nebenbefund zum Paritäts-Tor selbst.** `check:tor-paritaet` meldet «16 laufen in
CI». Es zählt dabei *jeden* Workflow als CI — auch einen Wochen-Cron. Real im
PR-Pfad sind es **12**. Die vier Differenz-Tore hängen an geplanten Läufen (siehe
§2.2), von denen einer genau einmal lief und dabei fehlschlug. Das Tor ist damit
nicht falsch, aber sein Begriff von «läuft in CI» ist weicher als die Meldung
suggeriert.

---

## 2. Allowlist-Falsifikation — Verdikt je Eintrag

### 2.1 Die Sabotage-Proben im Überblick

Sechs Proben, je ein echter Defekt der Klasse, die das Tor fangen soll.
**In allen sechs Fällen wurde das zuständige Tor rot und der behauptete
Ersatz-Arbiter blieb grün.**

| # | Eingepflanzter Defekt | Zuständiges Tor | Behaupteter Ersatz | Ergebnis Ersatz |
|---|---|---|---|---|
| 1 | `text-sm` + `bg-brass-50` (nicht in Config) in `AktenzeichenFeld.tsx` | `check:design-tokens` **ROT** (2 Verstösse) | `npm run lint` | **GRÜN** — Ausgabe byte-identisch zur Baseline |
| 2 | `--ink-700` von `#3C3932` auf `#A8A5A0` (Kontrast bricht) | `check:farbwelt` **ROT** (2 harte Verstösse) | `npm run lint` | **GRÜN** — byte-identisch zur Baseline |
| 3 | Neuer Importzyklus `format.ts ↔ datumsUtils.ts` | `check:zyklen` **ROT** (2 Zyklen, Schranke 1) | `npm run lint` + `tsc -b` | **beide GRÜN** |
| 4 | Tabellen-Aritätsbruch in `public/normtext/bund/AHVG.json` (Zelle entfernt) | `check:tabellen` **ROT** (`art_34_bis`, 1 Zelle ≠ 2 Spalten) | die **5 Tore, die `fedlex-frische.yml` wirklich fährt** | **alle 5 GRÜN** |
| 5 | `meta description` in `index.html` verfälscht | `check:seo-index` **ROT** | `npm run build` (build-Job) | **GRÜN**, 63 Routen prerendered |
| 6 | Datum im generierten `verfallTermine.generated.ts` auf `2099-12-31` | `check:verfall-ui` **ROT** («VERALTET gegenüber dem Register») | `check:verfall` (läuft in CI) | **GRÜN** |

Probe 4 im Detail — die fünf Tore, die `fedlex-frische.yml` tatsächlich aufruft,
gegen den korrupten Tabellen-Snapshot:

```
check:normtext             GRÜN  — 25402 Bund-Snapshots, Drift: ok
check:struktur-konsistenz  GRÜN  — 227 Bund-Gesetze konsistent
check:verfall              GRÜN  — Kein Verfall
check:paritaet             GRÜN  — 8241 Dateien byte-gleich projiziert
golden:vergleich           GRÜN  — 249 Fälle byte-gleich
```

### 2.2 «Drift-Arbiter ist fedlex-frische.yml» (9 Einträge) — **HÄLT NICHT**

Betroffen: `check:tabellen` · `check:invarianten` · `check:p-klassen` ·
`check:bilder` · `check:vollstaendigkeit` · `check:artikel-revisionen` ·
`check:historie` · `check:grundart` · `check:revisionen`.

Die Behauptung scheitert **dreifach**, jede Stufe für sich genügt:

1. **Der Arbiter fährt diese Tore gar nicht.** `fedlex-frische.yml` ruft genau
   fünf Tore auf (`check:normtext`, `check:struktur-konsistenz`,
   `golden:vergleich`, `check:verfall`, `check:paritaet`). **Keines der neun**
   delegierten Tore kommt darin vor — maschinell geprüft: sie laufen in *keinem*
   Workflow des Repos.
2. **Der Arbiter fängt die Fehlerklasse nicht.** Probe 4: alle fünf tatsächlich
   gefahrenen Tore blieben auf einem korrupten Normtext-Snapshot grün.
3. **Der Arbiter lief praktisch nie.** `fedlex-frische.yml` hat **genau einen
   Lauf** in der gesamten Historie (20.7.2026) und der endete **failure** — an
   `golden:vergleich` (`kuendigung:dj1`, `kuendigung:dj10` abweichend), also
   *bevor* `check:verfall`/`check:paritaet` überhaupt starteten. Zusätzlich sind
   alle fünf Aufrufe an `if: steps.diff.outputs.geaendert == '1'` gebunden: ohne
   Frische-Diff läuft **kein** Tor.

Die Sammelbegründung ist damit nicht «etwas zu optimistisch», sondern
gegenstandslos. Das Tor `check:tor-paritaet` prüft heute nur, ob die *Datei*
`fedlex-frische.yml` existiert — nicht, ob sie die genannten Tore enthält oder je
erfolgreich lief. Genau diese Lücke hat den Satz neun Mal überleben lassen.

### 2.3 «vom lint-Job mitabgedeckt» (3 Einträge) — **HÄLT NICHT**

`check:design-tokens` · `check:farbwelt` · `check:zyklen`.

Proben 1–3: In allen drei Fällen war die Lint-Ausgabe nach der Sabotage
**byte-identisch zur Baseline** (unverändert 2 Warnungen, 0 Fehler). ESLint prüft
JS/TS-Syntax und React-Regeln; es kennt weder die hauseigene Typo-Skala, noch
WCAG-Kontraste (`src/index.css` wird von ESLint gar nicht gelesen), noch den
Importgraphen. Bei Probe 3 blieb zusätzlich `tsc -b` grün — TypeScript betrachtet
Zyklen nicht als Fehler.

### 2.4 Weitere prüfbare Begründungen

| Eintrag | Begründung | Verdikt | Beleg |
|---|---|---|---|
| `check:seo-index` | «liest gebautes `dist/` — im CI durch den build-Job implizit geprüft» | **HÄLT NICHT — beide Hälften falsch** | Das Script liest `index.html` im Repo-Wurzelverzeichnis, nicht `dist/` (`scripts/check-seo-index.ts:20`). Und Probe 5: der build-Job bleibt auf dem Defekt grün. |
| `check:verfall-ui` | «UI-Projektion; `check:verfall` läuft in CI» | **HÄLT NICHT** | Probe 6: `check:verfall` bleibt grün, während `check:verfall-ui` rot ist. Die beiden prüfen verschiedene Flächen (Register-Termine vs. Register↔Generat-Synchronität). |
| `check:materialien` | «braucht `daten/*.db` … (CI-Zweig prüft committete Shards)» | **HÄLT NICHT** | Es existiert **keine** CI-Verzweigung im Script (`grep process.env.CI` → 0 Treffer). Ausgabe mit und ohne `CI=1` identisch; läuft in 1 s grün, ohne DB. `daten/` enthält im Repo überhaupt keine `.db`. |
| `check:pdf`, `check:pdf-quellen` | «braucht die PDF-Quellen-Caches (nicht im CI-Checkout)» | **HÄLT NICHT für den Offline-Default** | Beide laufen in <1 s grün in einem frischen Worktree ohne jede untrackte Datei. Der Offline-Zweig liest committete Dateien (`public/normtext/pdf/`, `pdf-index.json`); die Caches braucht nur der `--netz`-Zweig — und der ist ein **eigener** Script-Eintrag (`check:pdf-netz`), der gar nicht in `check:seriell` steht. |
| `check:zaehler`, `check:linien-kanon` | «deterministisch, kein Netz» / «reine Statik» | **KEINE BEGRÜNDUNG** | Beides sind Gründe, warum das Tor in CI laufen **könnte**, nicht warum es das nicht tut. Beide laufen ≤1 s grün. |
| `check:gegenpruefung` | «liest den Working Tree … protokolliert unter `CI=1` ausdrücklich SKIP … Arbiter ist `check:merge-schutz` in `ci.yml`» | **HÄLT** ✅ | Empirisch bestätigt: unter `CI=1` gibt das Tor `check:gegenpruefung SKIP — CI-Selbstschutz … KEINE Aussage über den Stand` aus. `check:merge-schutz` läuft nachweislich in `ci.yml:82`. Das ist der **Musterfall** eines ehrlichen Allowlist-Eintrags nach §6 Ziff. 7 lit. b. |

### 2.5 Bilanz

| Klasse | Anzahl | Verdikt |
|---|---|---|
| Begründung **hält** | **1** | `check:gegenpruefung` |
| Begründung **hält nicht** (empirisch falsifiziert) | **17** | 9× fedlex-frische · 3× lint · seo-index · verfall-ui · materialien · pdf/pdf-quellen (2) |
| **Keine** Begründung (Nicht-Argument) | **2** | `check:zaehler`, `check:linien-kanon` |

Die im Auftrag als «hart, plausibel» erwartete 488-MB-DB-Begründung existiert auf
der heutigen Allowlist **nicht mehr** — sie wurde am 20.7.2026 bereits entfernt
(`check:entscheide`/`check:bs-entscheide`/`check:besetzung` laufen jetzt in
`ci.yml`). Es gibt derzeit **keinen** Allowlist-Eintrag, der auf eine fehlende
grosse Datei gestützt ist. Damit ist auch nichts «unantastbar Hartes» zu schonen.

---

## 3. Ein Tor, das sich gegen die eigene Ladung prüft: `check:paritaet`

Bei Probe 4 fiel auf: `check:paritaet` meldete «8241 Dateien byte-gleich aus der DB
projiziert» — während eine der geprüften Dateien nachweislich korrupt war.

Der Grund ist strukturell und nachgelesen, nicht vermutet
(`scripts/datenhaltung/check-paritaet.ts` + `scripts/datenhaltung/ingest.ts`):

- Es existiert **keine committete DB** (`git ls-files daten/` → nur zwei
  `bs-fiw/*.json`).
- Das Tor baut die DB **zur Laufzeit aus genau den JSON-Dateien**, die es danach
  prüft (`ingestNormtext` liest `public/normtext/**`), projiziert zurück und
  vergleicht das Ergebnis mit dem Original.

Das ist ein **Roundtrip-Test der Projektionsschicht** (JSON → DB → JSON) und als
solcher wertvoll: er beweist, dass Schema und Projektion **verlustfrei** sind.
Was er strukturell **nicht** kann, ist Inhalts-Korruption erkennen — der Defekt
wandert durch beide Richtungen und hebt sich auf.

Das kollidiert mit CLAUDE.md §6 Ziff. 7 lit. a («prüft gegen eine **unabhängige**
Referenz, nie gegen die eigene Ladung desselben Laufs») und mit dem Anspruch, den
der Skript-Kopf formuliert: «beweist, dass JEDE committete Datei byte-gleich aus
der DB rekonstruierbar ist». Gelesen wird dieser Satz als Inhalts-Zusicherung; er
ist aber eine Verlustfreiheits-Zusicherung des Codecs.

**Kein Streich-Kandidat** — der Roundtrip-Beweis wird gebraucht (§7 Regel 6). Aber
der Kopfkommentar und die Grün-Meldung müssen sagen, was das Tor beweist und was
nicht, sonst trägt es eine Sicherheit vor, die es nicht hat (§8).

---

## 4. Der Zustand der Ersatz-Arbiter (Lauf-Historie)

Eine Delegation kann nur so gut sein wie der Workflow, an den delegiert wird.
Gemessen am 20.7.2026 via `gh run list`:

| Workflow | Letzte Läufe | Befund |
|---|---|---|
| `fedlex-frische.yml` | **1 Lauf insgesamt** (20.7.2026) → **failure** | Der in 9 Allowlist-Einträgen genannte Arbiter. Scheiterte an `golden:vergleich`; die nachgelagerten Tore liefen nie. |
| `normen-monitor.yml` | 20.7. failure · 13.7. cancelled · 6.7. failure · 29.6. failure · **22.6. success** | Letzter Erfolg **vier Wochen** alt. Trägt die gesamte `check:netz`-Kette (10 Netz-Tore) + Live-Site-Smoke. |
| `waechter.yml` | **0 Läufe** | Der Wächter, der genau diese Ausfälle melden soll (`check:ci-laeufe`), ist selbst noch nie gelaufen. |
| `turso-sync.yml` | 20.7. success, davor 7× **cancelled** (13.–20.7.) | `cancelled` färbt GitHub grau, nicht rot — der Ausfall ist unsichtbar, solange `waechter.yml` schweigt. |
| `ci.yml`, `prod-smoke.yml`, `perf-kalibrierung.yml`, `ci-doku-noop.yml` | durchgehend success | gesund |

Das ergibt eine **Kette schweigender Tore**: neun Tore verweisen auf einen
Workflow, der einmal lief und scheiterte; der Wächter, der das melden würde, lief
nie; und `cancelled`-Läufe sehen im GitHub-UI aus wie kein Problem.

---

## 5. Doppelungs-Analyse

### 5.1 Die zwei Perf-Tore — **keine Doppelung**

`check:perf-budget` und `check:perf-lighthouse` messen verschiedene Fehlermoden:

| | `check:perf-budget` | `check:perf-lighthouse` |
|---|---|---|
| Prüffläche | **Bundle-Topologie**: gzip-Bytes je Chunk, Daten-Nutzlast (`register.json` 780 KB …) | **Lade-Metriken**: CLS/LCP/TBT/TTI/Score, Lighthouse-Mobil-Preset (4× CPU) |
| Fängt | Doppel-React-Instanz, Zurückrutschen von `react-dom` in den Entry, unbemerkt wachsende JSON-Achse | Layout-Sprünge, Long Tasks, Regression der realen Ladeerfahrung |
| Chrome nötig | nein (deterministisch) | ja |

Ein Bundle kann klein und trotzdem sprunghaft sein, und umgekehrt. **Beide
behalten**, Eigentümerschaft ist bereits sauber getrennt.

### 5.2 Die CLS-Zahl `0.05` — **echte SSoT-Doppelung (§5)**

Die Budget-Zahl steht als **erzwingendes** Literal an **10 Stellen** (gezählt nur
`toBeLessThan`/`clsMax`, ohne Kommentar-Erwähnungen):

- `scripts/perf/lighthouse-budget.ts:205` und `:210` (zwei Seiten-Profile,
  `clsMax: 0.05`)
- `e2e/verweis-u.e2e.ts:246` + `:247`, `e2e/gesetze-historie-badge.e2e.ts:98`,
  `e2e/rechtsprechung-besetzung-links.e2e.ts:125`,
  `e2e/leser-gliederung-a33.e2e.ts:212`, `e2e/leser-position-u.e2e.ts:181`,
  `e2e/norm-sprung.e2e.ts:232`, `e2e/verzahnung.e2e.ts:32`

Die **Prüfungen** sind dabei keine Doppelung — sie messen verschiedene
Fehlermoden: Lade-CLS (`gesetze-historie-badge`), Interaktions-CLS unter Drossel
(`a33`, `norm-sprung`), Popover-CLS (`verweis-u`), Labor-CLS (Lighthouse). Diese
Vielfalt ist berechtigt und war es, die den Font-Swap-Vorfall der CLS-Runden
(18.–19.7.) sichtbar machte.

Die **Zahl** dagegen ist zehnfach kopiert. Wird das Budget je bewusst verschärft
oder gelockert, müssen zehn Stellen synchron nachziehen — genau das Muster, das
§5 verbietet. `gesetze-historie-badge.e2e.ts:96` kommentiert bereits «Budget wie
der Lighthouse-perf-budget-Gate (0.05)», also eine Prosa-Kopplung statt einer
maschinellen.

**Empfehlung:** eine exportierte Konstante (z. B. `e2e/helpers/cls.ts` →
`export const CLS_BUDGET = 0.05`), die auch `lighthouse-budget.ts` importiert.
Nicht eindampfen, nur die Zahl entdoppeln.

### 5.3 Weitere Berührungen

`check:normtext` (Drift/sha über Snapshot-Text) und die neun Projektions-Tore
überlappen **nicht**: Probe 4 zeigte, dass `check:normtext` einen
Tabellen-Aritätsbruch nicht sieht — der sha deckt Text und `items`, nicht die
Tabellenstruktur. Das ist kein Mangel von `check:normtext`, sondern der Beleg,
dass die neun Tore eigene Prüfflächen haben und nicht redundant sind.

---

## 6. Empfehlung — was zuerst

Nach §1 (ein still schützendes Tor zu streichen ist teurer als eines zu viel)
enthält dieses Audit **keinen einzigen Streich-Vorschlag** für ein `check:*`-Tor:
keine der geprüften Delegationen hat ihre Sabotage-Probe bestanden, also ist für
kein Tor ein Ersatz nachgewiesen.

### R-1 — Die 20 Allowlist-Tore in `ci.yml` verdrahten *(höchste Priorität)*

Der Befund ist eindeutig: **17 von 20 Begründungen sind empirisch widerlegt, 2
sind gar keine Begründungen, 1 hält.** Die Gesamtkosten liegen bei **10 Sekunden**.
Vorschlag: alle 19 (ohne `check:gegenpruefung`, dessen SKIP-Verhalten korrekt ist)
als Block in `ci.yml` aufnehmen und die Allowlist auf den einen haltbaren Eintrag
zusammenschrumpfen.

Das ist zugleich der billigste Schritt des ganzen Audits — ein Block YAML gegen
zehn Sekunden Laufzeit — und der mit dem grössten Effekt: er schliesst die Lücke,
die `check:tor-paritaet` heute nur einfriert.

### R-2 — `check:tor-paritaet` schärfen: Delegation maschinell binden

Das Tor prüft heute nur die **Existenz** der genannten Workflow-Datei. Dass
`fedlex-frische.yml` die neun Tore gar nicht enthält, konnte es deshalb nicht
melden. Drei Verschärfungen, in dieser Reihenfolge:

1. Nennt ein Grund einen Workflow als Arbiter, muss dieser Workflow das Tor
   **tatsächlich aufrufen** (`npm run <tor>` in einer `run:`-Zeile) — nicht nur
   existieren.
2. «Läuft in CI» sollte den **PR-Pfad** meinen. Ein Tor, das nur in einem
   `schedule:`-Workflow steht, ist anders abgesichert als eines in `ci.yml`; die
   Meldung sollte beides getrennt ausweisen (heute: «16 in CI», real 12 im
   PR-Pfad).
3. Ein Arbiter, der bedingt läuft (`if:`), deckt nur bedingt ab — mindestens im
   Grund offenlegen.

### R-3 — `waechter.yml` zum Laufen bringen

Der Wächter (`check:ci-laeufe`) hat **null Läufe**. Solange das so ist, bleiben
`normen-monitor` (kein Erfolg seit 22.6.) und die `cancelled`-Serie von
`turso-sync` unsichtbar — und §6 Ziff. 7 lit. c («sein Nicht-Laufen ist sichtbar»)
ist für jeden geplanten Workflow unerfüllt. Erster Schritt: einmal
`workflow_dispatch` auslösen und prüfen, ob er die bekannten Ausfälle meldet
(er wäre damit zugleich seine eigene Sabotage-Probe, denn die Defekte liegen
bereits vor).

### Weitere Punkte (nachgeordnet)

- **`check:paritaet` ehrlich beschriften** (§3): Kopfkommentar und Grün-Meldung
  auf «Roundtrip/Verlustfreiheit der Projektion» umstellen, nicht «jede Datei
  byte-gleich» — die Aussage über Inhalts-Integrität leisten die Drift-Tore.
- **CLS-Budget entdoppeln** (§5.2): eine Konstante statt neun Literale.
- **`fedlex-frische.yml` hat einen Konstruktionsknoten.** Der einzige Lauf
  scheiterte an `golden:vergleich` (`kuendigung:dj1`, `kuendigung:dj10`).
  **Auf `main` ist golden sauber** (lokal nachgemessen: «IDENTISCH — 249 Fälle
  byte-gleich»); die Abweichung entstand **erst durch die Regenerierungs-Schritte
  des Workflows selbst**. Das heisst: sobald eine Frische-Reparatur einen
  Rechner-Output verschiebt, blockiert der Workflow seinen eigenen PR — genau die
  Fälle, die am dringendsten Aufmerksamkeit bräuchten, erzeugen weder PR noch
  Aufgaben-Zettel, sondern nur einen roten Lauf. Ein fachlich gewollter
  Golden-Shift braucht nach §6 ohnehin einen Menschen; der Workflow sollte ihn
  darum **als Zettel/PR-Entwurf sichtbar machen** statt still zu scheitern.
  (Welcher Regenerierungs-Schritt die Verschiebung verursacht, hat dieses Audit
  nicht ermittelt — offener Punkt.)
- **`bibliothek/betrieb/` ist von `bibliothek-check.sh` nicht erfasst** (weder in
  der S7-INDEX-Prüfung noch in der S1-Kopfprüfung). Kleiner blinder Fleck,
  hier nur vermerkt.

---

## 7. `check:tot` und die «toten» Scripts

### 7.1 `check:tot` ist strukturell blind für die Frage, die es beantworten soll

`check:tot` ist `knip --no-exit-code` — bewusst zahnlos, in `STRUKTUR.md` selbst
als «Beifang, KEIN Tor» geführt. Zwei gemessene Befunde:

1. **Ohne** `--no-exit-code` wäre knip **rot** (Exit 1): 2 unlisted dependencies
   (`playwright` in `scripts/screenshots.ts`, `react-router` in
   `src/entry-server.tsx`), 62 ungenutzte Exporte, 92 ungenutzte exportierte
   Typen.
2. **`knip.json` deklariert `scripts/**/*.{ts,tsx,mjs}` selbst als Entry-Glob.**
   knip behandelt damit *jede* Script-Datei als gültigen CLI-Einstieg und gibt
   für `scripts/` gar keinen «Unused files»-Abschnitt aus. Die Frage «welches
   Script ist unerreichbar?» kann knip **konstruktionsbedingt nicht
   beantworten** — und das ist so gewollt, denn Skripte *sollen* eigenständig
   lauffähig sein.

Die Formulierung «~99 Script-Dateien ohne package.json-Referenz» misst deshalb
nichts Belastbares.

### 7.2 Der Import-Graph: 2 statt ~99

Erhoben per Import-Graph über alle Repo-Textdateien (echte Kanten aus relativen
`import`/`require`/`import()`, `bash source`, `execSync`/`spawn` mit
`scripts/`-Pfad), BFS bis Fixpunkt ab den Wurzeln `package.json`,
`.github/workflows/`, `.claude/`-Hooks:

| Klasse | Anzahl |
|---|---|
| Dateien in `scripts/` gesamt | **211** |
| DIREKT-AUFRUFBAR (package.json / Workflow / Hook / vitest-Glob) | 111 |
| IMPORTIERT (transitiv erreichbar) | 80 |
| NUR-IN-DOKU-ERWÄHNT (bewusst archiviert / dokumentierte Ausnahme) | 18 |
| **UNERREICHBAR** | **2** |

Wichtige Korrektur im Verfahren: `npm test` läuft per vitest-Glob-Autodiscovery
(kein `include`-Filter), wodurch 5 `*.test.ts` unter `scripts/datenhaltung/`
real ausgeführt werden, obwohl sie in `package.json` nicht auftauchen. Eine reine
package.json-Zählung hätte sie fälschlich als tot geführt — genau die Falle, vor
der der Auftrag warnte.

Die **zwei** echten Kandidaten (je 0 externe Treffer, nur Selbstverweis im
Datei-Header, keine Doku-Erwähnung):

- `scripts/normtext/regeste-kurz-refresh.ts` (letzter Commit `33d1c340`)
- `scripts/normtext/sim-gemeinde-systematik.ts` (letzter Commit `2df228dd`)

Beide tragen die Signatur der H-5/B7-Archivierungsrunde: Einmal-/POC-Skripte, die
nach `scripts/archiv/` gehört hätten (dortige Konvention: verschieben statt
löschen, im `README.md` listen), aber übersehen wurden. **Empfehlung: nach
`scripts/archiv/` verschieben, nicht löschen** — und selbst das ist ein
Aufräum-Vorschlag ohne Dringlichkeit, keine Tor-Frage.

**Vorbehalt (§8):** Der Graph erfasst keine vollständig zur Laufzeit
konstruierten Modulpfade. Eine Stichprobe (`scripts/dispatch-cli.ts`) zeigte nur
statische Importe; ein erschöpfender Beweis wurde nicht geführt. Die 18
Doku-Erwähnungen belegen zudem *Erwähnung*, nicht *Lauffähigkeit* — einige
(`fedlex-manifest-audit.ts`, `fedlex-repin-kanonik.ts`) sind laut `STRUKTUR.md`
ausdrücklich «offene Bau-Einheit», also eher unfertig als tot.

---

## 8. Was offen blieb

Ehrlich benannt (§8):

- **Nicht sabotiert** wurden die Tore, die bereits in `ci.yml` laufen (12) sowie
  die 10 Netz-Tore (`check:netz`) — letztere brauchen echte Netz-Zugriffe auf
  amtliche Quellen; eine Sabotage-Probe hätte dort keine Aussage über die
  Allowlist erbracht, die Gegenstand dieses Auftrags war.
- **Nicht gemessen** wurde, ob die 19 Tore auch auf einem *GitHub-Runner* in
  10 s bleiben. Der Worktree enthielt ausser `node_modules/` **keine untrackte
  Datei** (`git status --ignored`), ist also strukturell ein CI-Checkout; die
  absolute Laufzeit kann auf 2-vCPU-Runnern höher liegen. An der Aussage «keine
  fehlende Ressource» ändert das nichts.
