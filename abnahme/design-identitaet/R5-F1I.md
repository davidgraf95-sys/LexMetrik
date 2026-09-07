# R5-F1I — Suche-Trefferzustand · Reiterleiste · Menü-Anatomie

**Auftrag:** Fixer 1i von W2·24-DESIGN-IDENTITAET, Vorlage ist der Prüfbefund
«Prüfer D23/R11 (6.9.2026)» (F1–F6, R1–R8) samt David-Auftrag vom 6.9.2026
(«dropdown menu nochmals optisch überarbeiten … in welcher ebene», «nicht
trist», «keine funktion verloren»).
**Ausgangsstand:** `c91541617` · **Branch:** `feat/w2-24-r5-f1i`
**Bilder:** `r5f1i-*.jpg` in diesem Verzeichnis (hell + dunkel, @1440 und @390).

---

## 1 · Was gebaut wurde, Befund für Befund

| Befund | Gemessener Vorher-Stand (`c91541617`) | Gebaut |
|---|---|---|
| **F1** Trefferzeile | Volltitel («OR · Bundesgesetz betreffend …»), gerahmtes Etikett `.lc-badge-soft` | Leerzustands-Anatomie: Registerstrich · Kurzform · Art rechts als Text, kein Kasten |
| **F2** Zeilenhöhe | 37–266 px in derselben Liste | konstant **37.00 px**, identisch mit der Leerzustands-Zeile (Messung §2) |
| **F3** Textstufen | vier (Zählzeile 14/500 · Overline 12 · Hinweis 14 · Fussnote 11 mit «→») | drei (Zeile 14 · Etikett 12 · Fussnote 11); «Was ist drin? →» → «Was ist drin?» |
| **F4** Leitentscheid | ★-Glyph im Badge | das Wort **«Leitentscheid»** als Art-Zusatz («Entscheid · Leitentscheid») |
| **F5** Naht dunkel | Feld-Unterstrich rgb(148,144,136) ≠ Panel-Rahmen rgb(226,224,220) | beide `--rule`, bewacht in beiden Themes |
| **F6** Lade-Sprung | 1 px → 729 px nach 2.7 s | Skelett reserviert die Höhe einer gekappten Gruppe; **zusätzlich** das 120-ms-Entprellungsfenster geschlossen (§4) |
| **R1** Leiste farblos | alle inaktiven Reiter `bg-ink-400 opacity-30` | jeder Reiter trägt seine Registerfarbe: inaktiv 60 %, aktiv voll + Tönung, Hover 100 % |
| **R2** leerer Streifen | 34 px leer mit durchgehendem `border-b` | ohne Reiter kein Unterstrich, «+» links am Inhaltsrand, Höhe reserviert (CLS 0) |
| **R3** Blatt-Beschriftung | Volltitel (eigene Ableitung aus `verlaufLabel`) | Kurzform aus `lib/tabs` + `title` mit Volltitel; auch jeder Gruppenkopf trägt `title` |
| **R4** Blatt-Icons | Wappen-`<img>` bzw. ⚖ ✎ ∑ in Spalte 1 | Registerstrich wie in Leiste und Such-Panel |
| **R5** zwei Instanzen | beide «OR» | Anker der duplizierten Instanz aus dem gespeicherten Pfad **plus** Instanz-Nummer am Kern («OR (2)») |
| **R8** `title` | Stand nur bei Gesetzen | Entscheide: Urteilsdatum (Manifest, nie bei `datumUnbekannt`, nie doppelt); Rechner/Vorlagen: `karte.description` aus dem Katalog |
| **R6/R7** Menü-Anatomie | `.lc-schwebeflaeche` = `bg-paper-raised` + `rounded-lg` + `shadow-lg` | Papier, 1 px `--rule`, Radius 0, **kein** Schatten (auch kein flacher — Entscheid); Icons in Menüzeilen gefallen |

Konsumenten der geänderten Schwebefläche, alle mitgezogen: Verlauf-Menü,
Reiter-Kontextmenü, Ansicht-Menü des Lesers, Überlauf-Blatt, Sprach-Umschalter,
Datumsfeld-Popover, Leser-Panels.

---

## 2 · Messungen

**Zeilenhöhen** (Preview 4370, @1440, hell, `/gesetze`, Query «OR 257»):

| Zustand | Höhen (px) |
|---|---|
| Leerzustand (Verlauf) | `[37]` |
| Trefferzustand (8 Optionen: Norm-Sprung + 6 Artikel + «alle 30») | `[37, 37, 37, 37, 37, 37, 37, 37]` |
| Panel gesamt | 504 px |

Vorher (Prüfer, derselbe Ort): 37–266 px.

**CLS** (Preview 4370, @1440, `layout-shift` ohne `hadRecentInput`, 4 s nach `load`):

| Route | CLS |
|---|---|
| `/` (Startseite, Leiste ohne Reiter) | **0.0004** |
| `/gesetze/bund/OR` (Leser) | **0.0389** (Budget 0.05) |

**Panel-Höhe während der Suche** (F6-Wächter, 12 Proben à 120 ms):
kleinste gemessene Höhe > 120 px. Vorher gemessen: `1/660/660/…`.

---

## 3 · Nichts verloren (§8) — wo die Auskunft geblieben ist

* **Volltitel und Snippet** der Trefferzeile: im `title` derselben Zeile
  (`trefferTitel`), Wortlaut unverändert.
* **Query-Hervorhebung**: wandert vom gefallenen Snippet auf die Kurzform,
  gleiche Quelle (`lib/suche/hervorhebung`).
* **Kanton / Fristen-Regime**: standen als Badge, stehen jetzt als Art-Zusatz
  («Gesetz · ZH», «Rechner · ZPO»).
* **«N Treffer, davon …»**: bleibt sichtbar, nur eine Stufe kleiner (Begründung
  §5).
* **Herkunft im Blatt**: ist die Untergruppe («Bund», «Kanton»,
  «International») und steht im `title`.
* **Lesestellung**: unverändert im `title` des Reiters und in der Reiter-Liste
  (F5-Regel unangetastet).
* **Menü-Zustände**: die ✓-Spalte der Schalter-Zeilen bleibt — ein Zustand ist
  kein Icon; die Marken-SPALTE bleibt leer stehen, damit die Beschriftungen
  fluchten.
* Alle 42 Reiter-Funktionen und die Such-Funktionen (Norm-Sprung, ↑↓ Enter Esc,
  `?q=`, Fokus-Rückgabe, Verlauf-Quelle, Kappung) sind über ihre bestehenden
  Wächter grün geblieben (§6).

---

## 4 · Was der eigene Wächter zusätzlich gefunden hat

Der neue F6-Fall zeigte beim ersten Lauf **rot**, und zwar nicht wegen des
Artikel-Index: das Panel stand weiterhin bei 1 px, jetzt im **120-ms-Entprellungs-
fenster** von `HeaderSuche` (getippt war schon, `q` noch leer, `SuchResultate`
gab bei leerem `q` null zurück). Gemessener Verlauf: `1/660/660/660/…`.
Das Panel kann diesen Fall nicht selbst kennen — es sieht nur `q`. Darum die
Auskunft als Prop `wartet`; Hero und `/suche` übergeben sie nicht, dort heisst
leeres `q` unverändert «keine Query».

---

## 5 · Abweichungen vom Auftrag, offengelegt (§7)

1. **Die Zählzeile bleibt.** Der Auftrag verlangt «Zählzeile in den Gruppenkopf».
   Der Zähler steht dort (jeder Gruppenkopf trägt ihn), die zusammenfassende
   Zeile ist aber **nicht** entfernt, sondern auf die Etikett-Stufe gesetzt.
   Grund: zwei Lade-Synchronisationen **ausserhalb** dieses Pakets warten auf
   genau dieses Element — `e2e/gesetze-ia-v2-walks.e2e.ts` («N Treffer, davon …»)
   und `e2e/norm-sprung.e2e.ts` («wird noch ergänzt»). Es ist dort die einzige
   Marke dafür, dass JEDE Suchgruppe fertig geladen ist; ersatzlos entfernt
   hätte es zwei fremde Wächter umgebaut. Das F3-Ziel «eine Etikett-Stufe» ist
   erreicht (Panel führt drei Textstufen statt vier).
2. **Das Snippet fällt ganz weg** statt `line-clamp-1`. Der Auftrag lässt beides
   zu; nur der Wegfall hält die 37 px des Leerzustands exakt. Der Wortlaut steht
   im `title`.
3. **Das ▾ der Gruppenköpfe im Blatt bleibt.** Der R4-Befund zählt es unter den
   zu entfernenden Icons auf. Es ist aber der einzige sichtbare Hinweis, ob eine
   Gruppe auf- oder zugeklappt ist (`aria-expanded` trägt das nur für
   Screenreader) — sein Wegfall nähme eine Funktion, und David hat «keine
   funktion verloren» verlangt. Wappen und Kategorie-Piktogramme sind gefallen,
   das Zustandszeichen nicht.
4. **`marke` in `ui/Menue.MenueZeile` bleibt im Typ.** Der letzte Aufrufer
   (`pages/gesetz-leser/v3/LeserAnsichtV3.tsx`, `marke="⚖"`) liegt im
   TABU-Bereich dieses Auftrags (Fixer R6c). Der Wert wird **nicht mehr
   gerendert**; der Slot fällt mit dem nächsten Schritt an jener Datei.

---

## 6 · Tore

| Tor | Ergebnis |
|---|---|
| `npm run lint` | exit 0 (1 Warnung in `useUniversalSuche.ts` — Bestand, Fixer 1h) |
| `npx tsc -b` | exit 0 |
| `npm run test` | 7353/7357 grün; 3 Dateien rissen unter Parallel-Last ihr `beforeAll`-Zeitbudget (`scripts/datenhaltung/suche.test.ts`, `…/suche-rang.test.ts`, `src/tests/suche/rankingTestset.test.ts`) — isoliert nachgemessen **3/3 Dateien, 41/41 Fälle grün**, kein `expect` gerissen |
| `npm run check:design-tokens` | grün |
| `npm run check:farbwelt` | grün (146 Pflichtpaare; 4 beratende Warnungen unverändert aus dem Bestand) |
| `npm run check:perf-budget` | grün — Entry **52.3 KB** / 60 KB, Menü und Blatt bleiben lazy |
| `npm run build` | 63 Routen prerendered, exit 0 |
| `npm run check:e2e-shards` | grün (120 Specs, Union deckungsgleich) |

**e2e** (`npx playwright test` über die Auftragsliste, 130 Fälle):
128 grün beim Sammellauf mit 5 Workern; 2 rot an Lade-Latten
(`verlauf-o1` «Topbar-Verlauf», `w224-reiterverhalten` (d) — 30-s-Timeout an
`page.evaluate`). **Messbedingung**: 5 Worker, parallel zu weiteren Worktree-
Builds auf demselben Host. Isoliert mit 2 Workern nachgemessen: **12/12 grün**;
`w224-plus-reiter` zusätzlich mit `--repeat-each=3`: **15/15 grün**. Kein
Assertion-Fehler, ausschliesslich Timeouts.
Die beiden bearbeiteten Dateien selbst: `w224-kopfsuche-d23` **13/13**,
`w224-r11-reiterleiste` **22/22**.

---

## 7 · Deklarierte Test-Änderungen (§6.3)

* `src/tests/design-r3b-chrome.test.ts` — A3-2 zählt die Glieder der **neuen**
  Schwebeflächen-Kette ab und prüft die drei gefallenen (`bg-paper-raised`,
  `rounded-lg`, `shadow-lg`) ausdrücklich negativ. Der Wächter selbst («EINE
  Anatomie, in EINER Klasse») ist unverändert.
* `src/tests/design-r2c-bausteine.test.ts` — C-4 prüft je Fläche die für sie
  kanonische Anatomie (Katalog: `ui/TrefferZeile`; Such-Panel: Registerstrich +
  Kurzform + Art) statt eine gemeinsame. Grund: D23/F1 trennt Karten-Zeile und
  Streifen-Zeile bewusst (§1 gegen die Abstraktion). Die Rot-Proben bleiben.
* `e2e/w224-kopfsuche-d23.e2e.ts` — sechs neue Fälle (F1–F6), je mit Rot-Probe.
* `e2e/w224-r11-reiterleiste.e2e.ts` — vier neue Fälle (R1, R2, R3/R4, R5).

---

## 8 · Offene Punkte (nicht in diesem Auftrag gebaut)

1. **`REG_HOVER_FLAECHE_REITER`** (`components/layout/bereiche.ts`) hat mit R1
   seinen letzten Konsumenten verloren. Die Datei liegt ausserhalb der
   Whitelist — Rückbau im nächsten Schritt, der sie ohnehin anfasst.
2. **`/gesetze` steht im Überlauf-Blatt unter «Weitere»**, nicht unter
   «Gesetze»: `reiterKategorie` verlangt `/gesetze/…`, die fünf
   Bereichs-Übersichten sind seit D7 aber Reiter. Derselbe Defekt, den M2 für
   Materialien behoben hat — jetzt für die Übersichten selbst.
   (`src/lib/tabGruppen.ts`, ausserhalb der Whitelist.)
3. **`src/lib/suche/hervorhebung.ts`** bleibt in Gebrauch (die Hervorhebung sitzt
   jetzt auf der Kurzform) — kein Rückbau nötig, hier nur festgehalten, weil der
   Snippet-Wegfall den Verdacht nahelegt.
4. **`marke`-Slot in `ui/Menue`** — s. §5 Ziff. 4.
