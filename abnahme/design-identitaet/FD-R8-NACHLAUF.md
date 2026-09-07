# FD-R8-NACHLAUF — R8-Nachlauf nach dem Merge, Vorlagen-Hierarchie (7.9.2026)

Folge-Runde zu `R8-ABSCHNITT.md` (Fixer-Lauf) und zur Schranken-Nachziehung in
`e2e/qsui-hierarchie.e2e.ts`. Anlass: nach dem Merge der parallelen Fixer
(GA Köpfe, GB Leben, D5 PruefBefund, D6, Leser-F/G/H, Kleinfunde) standen im
vollen Lauf zwei Fälle rot.

**Messbedingung (§0 Ziff. 3):** lokal, Chromium, `vite preview` aus einem
frischen `npm run build` desselben Arbeitsbaums, Port 4421 (`--strictPort`,
Port vorher leer), `--workers=2`, Basis `85daf2926`. Reine Testzeit des
Haupt-Tors 5.3 min (drei Dateien, `--repeat-each=2`, 276 Fälle).

---

## 1 Fall 2 · `qsui-hierarchie` I8 — Vorlagen, Desktop, `/vorlagen/arbeitsvertrag`

### 1.1 Rot reproduziert (vor jedem Eingriff)

```
✘ e2e/qsui-hierarchie.e2e.ts:566 › Verdikt zuerst · Vorlagen — Desktop › /vorlagen/arbeitsvertrag
Error: §13.2 · Die Stelle des Dokuments liegt auf /vorlagen/arbeitsvertrag bei
1.25 Bildschirmhöhen — über der Regressions-Schranke 1.25.
1 failed · 13 passed · Exit 1
```

Roher Messwert **1.25326** gegen die Schranke **1.25**.

### 1.2 Wurzel — gemessen, nicht vermutet

DOM-Sonde @1280×800 gegen `dist`: die Formvorschrift-Zeile aus dem Kopf-Stapel
genommen, sonst nichts angefasst.

| Zustand | Stelle des Dokuments | Bildschirmhöhen |
|---|---|---|
| Ist-Stand | 1002.6 px | **1.25326** |
| ohne die Badge-Zeile | 964.4 px | **1.20553** |
| **Differenz** | **38.19 px** | **0.0477** |

Die Zeile stammt aus **GB-21** (`0127d914c`): das Formvorschrift-Badge wurde zu
Recht aus der Norm-Chip-Reihe geholt — ein gefüllter Warn-Kasten unter
unterstrichenen Normlinks sind zwei Grammatiken in einer Zeile —, bekam dabei
aber eine **eigene Zeile im `space-y-3`-Stapel** des Wizard-Kopfs.

Der Datei-Kommentar der Schranke beziffert die Luft über dem gemessenen Maximum
mit **0.038** Bildschirmhöhen (1.212 → 1.25, Messung 6.9.2026). GB-21 hat
**0.048** verbraucht. Das Tor hat also genau gemeldet, wofür es gebaut ist:
über dem Dokument ist etwas Neues eingeschoben worden.

Die beiden anderen Verdächtigen sind **ausgeschlossen**, nicht bloss unerwähnt:

- **PruefBefund (D5)** rendert nur im letzten Schritt (`imPruefSchritt`); der
  Fall misst den ERSTEN Schritt. Kein Beitrag zur Höhe über dem Dokument.
- **Schrittnummern ohne Kästchen (GB-21, `Stepper`)** — die Leiste misst am
  Ist-Stand 31 px (`nav` bei y=948, sieben Knöpfe je 31 px hoch). Selbst wenn
  GB die Leiste um die volle Höhe der alten 20-px-Marke verändert hätte, blieben
  die 38.19 px der Badge-Zeile unerklärt; die Sonde in der Tabelle oben weist
  die Differenz ausserdem der Badge-Zeile ALLEIN zu (sie war der einzige
  Eingriff). Nicht gemessen wurde der Vor-GB-Stand der Leiste — dafür gibt es
  in dieser Runde keinen Anlass.

### 1.3 Fix an der Wurzel — die Schranke bleibt unberührt

`src/components/vorlagen/wizard.tsx`: Overline und Formvorschrift stehen in
**einer Etiketten-Zeile**. Beide sind Etiketten der Vorlage (Einordnung
«Arbeit · Vorlage» / Formvorschrift «Beidseitig zu unterzeichnen»), und die
Overline-Zeile hatte @1280 rund 1'100 px leer neben sich.

GB-21 bleibt vollständig gewahrt: das Badge steht jetzt **noch weiter** von der
Chip-Reihe weg, die warn-Füllung bleibt (sie trägt Bedeutung, nicht Dekor), und
die §8-Lage im ersten Viewport samt Tor-Griff `data-formgate` ist unberührt —
gemessen steht das Badge jetzt bei **0.317** Bildschirmhöhen (Desktop) bzw.
**0.245** (mobil), das Tor verlangt < 1.

### 1.4 Nachher — die ganze Familie, nicht der eine rote Fall

Gebauter Stand, dieselbe Sonde:

| Fläche | Desktop 1280×800 | Mobil 390×844 |
|---|---|---|
| `/vorlagen/arbeitsvertrag` | 1002.6 px / 1.2533 → **971 px / 1.2135** | 2198 → **2166 px / 2.5667** |
| `/vorlagen/nda` | 843 → **811 px / 1.0143** | 1645 → **1613 px / 1.9116** |
| `/vorlagen/mietvertrag` | 905 → **873 px / 1.0915** | 2089 → **2058 px / 2.4378** |
| `/vorlagen/testament` | — / **655 px / 0.8190** | — / **1453 px / 1.7215** |

−34 px auf **jeder** Wizard-Vorlage und auf **beiden** Breiten, nicht nur auf der
roten (§0 Ziff. 3: Verteilung statt Einzelwert). Der rote Fall liegt mit 1.2135
wieder dicht am Wert 1.212, auf dem die Schranke 1.25 aufsetzt; die Luft über dem
Maximum ist mit **0.0365** praktisch die dokumentierte 0.038.

**Die Schranke wurde NICHT angefasst** — kein `§6.3`-Eingriff, keine Lockerung.
`DOKUMENT_BH_REGRESSION` steht unverändert auf `{ desktop: 1.25, mobil: 2.8 }`.
Der Rot-Beweis für sie ist die Reproduktion in §1.1 (Exit 1 vor dem Fix,
Exit 0 danach), nicht eine nachträglich gebaute Probe.

---

## 2 Fall 1 · `kein-abschnitt` R8 — 50 neue Funde, EINE Wurzel, und die liegt bei FA

### 2.1 Messung

Voller R8-Lauf gegen den Merge-Stand `85daf2926`:

```
gesamtFunde 62 · werkzeugFehler 0
Error: 50 nicht erlaubte Funde · 1 failed · Exit 1
```

12 der 62 sind die begründeten Allowlist-Einträge aus `R8-ABSCHNITT.md` §4
(F6-Reiterkurzform, `input.lc-input`, `summary.cursor-pointer`). Die **50 neuen**
sind **ein einziger Sachverhalt**, wortgleich auf allen 25 Routen × beide Themen
@320:

```
/ @320 hell [a-ueberlauf-ohne-scroller] div.flex-1 «⌘K» — scrollWidth=44 clientWidth=19
```

### 2.2 Wurzel

`div.flex-1 min-w-0 min-[481px]:min-w-[9rem] …` ist der Suchfeld-Platz im
Streifen (`src/components/layout/Topbar.tsx:207`). Er schrumpft @320 auf 19 px,
während ein 44 px breiter Griff darin `shrink-0` stehen bleibt — 44 px ist exakt
`--tap-ziel-komfort`.

Live-Sonde @320 auf `/`, computed styles der fünf `.lc-topbar-griff`:

| Griff | Klassen | `display` @320 | erwartet |
|---|---|---|---|
| Navigation | `lg:hidden shrink-0` | `flex` | sichtbar ✓ |
| **Desktop-Griff** | `hidden lg:inline-flex shrink-0` | **`flex`** | **`none`** ✗ |
| Lupe (schmal) | `hidden max-[480px]:inline-flex shrink-0` | `inline-flex` | sichtbar ✓ |

Der **nur-Desktop**-Griff steht @320 mit im Streifen. Das ist **GB-15**: der
ungeschichtete `.lc-topbar-griff`-Grundriss nahm `display` mit und schlug damit
die Display-Utilities (`hidden`, `lg:hidden`, `max-[480px]:inline-flex`), mit
denen jeder Griff seine Sichtbarkeit steuert.

### 2.3 Warum hier kein Fix und kein Allowlist-Eintrag steht

`Topbar.tsx` / `HeaderSuche.tsx` sind in dieser Runde die Baufläche des
**parallelen Fixers FA** — TABU für FD, und §0 Ziff. 5 sagt: Treffer melden,
nicht doppelt bauen. Die Kollisionssonden bestätigen es:
`origin/feat/w2-24-fa` steht auf **`c90134bb8`**, hat dieselbe Basis
`85daf2926` und trägt genau diesen Fix — `33436a915` «GB-15 — der Griff-Grundriss
schlägt keine Display-Utility mehr» (der Grundriss zieht nach
`@layer components` und verliert damit gegen jede Display-Utility).

Ein Allowlist-Eintrag wäre hier **falsch**: er müsste 50 Zeilen für einen Fund
tragen, den die Nachbar-Baustelle bereits behoben hat, und die Liste ist
ausdrücklich «kein Sammelbecken für unbearbeitete Funde» (`R8-ABSCHNITT.md` §4).
`e2e/kein-abschnitt.allow.json` bleibt darum bei **12 Einträgen, unverändert**.

### 2.4 Integrationsprobe — belegt, dass FA die 50 räumt

FA's `33436a915` wurde **nur in den Arbeitsbaum** gespielt (`cherry-pick -n`,
nicht committet, danach `git reset --hard` — der Branch `feat/w2-24-fd` trägt
ihn NICHT), dann gebaut und das volle Tor gefahren:

| | vor FA (Basis 85daf2926) | mit FA `33436a915` |
|---|---|---|
| `gesamtFunde` | **62** | **12** |
| nicht erlaubt | **50** | **0** |
| Werkzeug-Fehler | 0 | 0 |

Die 12 verbleibenden sind Zeile für Zeile die alten Allowlist-Einträge. Der
FD-Fix an `wizard.tsx` erzeugt **keinen** neuen R8-Fund.

**Folge für die Landung:** das R8-Tor auf `feat/w2-24-fd` allein bleibt rot,
solange FA nicht gelandet ist — der Grund ist ausschliesslich GB-15 und liegt
nicht in FD's Fläche. Sobald FA und FD beide in `feat/w2-24-folge` stehen, ist
es grün; das ist oben gemessen, nicht behauptet.

---

## 3 Tore (gefahren auf FD + der Integrationsprobe aus §2.4)

| Tor | Ergebnis |
|---|---|
| `npx playwright test e2e/kein-abschnitt.e2e.ts e2e/qsui-hierarchie.e2e.ts e2e/vorlagen-pruefschritt-d5.e2e.ts --repeat-each=2 --workers=2` | **276 passed (5.3m), Exit 0** |
| `npm run test` (vitest) | **460 Dateien, 7454 Tests grün** (2 skipped), Exit 0 |
| `npx tsc -b` | sauber, Exit 0 |
| `npm run lint` | **0 Fehler**, 1 Warnung (`useUniversalSuche.ts`, unberührter Bestand), Exit 0 |
| `npm run golden:vergleich` | **IDENTISCH — 256 Fälle byte-gleich**, Exit 0 |

**Kein Test geändert** (§6.3): weder das R8-Werkzeug noch seine Allowlist noch
`qsui-hierarchie.e2e.ts`. Der einzige Produktivcode-Eingriff dieser Runde ist
`src/components/vorlagen/wizard.tsx`.

## 4 Was diese Runde NICHT geprüft hat

Die Einschränkungen aus `R8-REPORT-0.md` und `R8-ABSCHNITT.md` §8 gelten
unverändert (Stichproben in d/e, je 2 Vertreter pro dynamischer Familie).
Neu hinzu: die Aussage «R8 grün» in §2.4 gilt für den Stand FD **plus** FA's
`33436a915`; sie ist nach dem Merge beider Zweige erneut zu fahren.
