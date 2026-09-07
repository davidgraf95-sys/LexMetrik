# KONTRAST-PROTOKOLL R1 — W2·24-DESIGN-IDENTITAET

**Erhoben:** 6.9.2026, deterministisch aus `src/index.css` (`:root` + `html.dark`)
über `scripts/farbwelt-messung.ts` (culori, WCAG-2.x-Kontrastformel, sRGB).
Alle Werte sind **gemessen, nicht geschätzt** (§7); reproduzierbar durch das Tor
`npm run check:farbwelt`, das dieselbe Messfunktion benutzt.

**Anlass:** Runde R1 «Grundschicht» tauscht Papier, Tinte, die ganze
Messing-Skala, die Radien, die Schatten und beide Schriftfamilien. Damit ändert
sich **jede** Kontrastzahl der App — die Zahlen aus
`abnahme/startseite-v3/KONTRAST-PROTOKOLL.md` sind ab hier Herkunft, nicht
Ist-Stand (§2b: ein datierter Beleg wird ergänzt, nicht nachgeführt).

## 1 · Was verbindlich geprüft wird

`scripts/farbwelt-tabellen.ts` führt nach R1 **126 WCAG-Pflichtpaare**
(hell + dunkel), **6 Referenzwerte**, **2 Fixpunkte** und die Flächen-L-Leiter
in beiden Modi. Neu darunter: die vier Registerfarben als **Text**-Paare
(4.5:1) auf `--paper`, `--surface` und `--paper-raised`.
Tor-Ausgabe nach dem Bau:

```
Farbwelt-Tor ok — 126 WCAG-Pflichtpaare (hell+dunkel), 6 Referenzwerte (§4b-B),
2 Fixpunkte, Flächen-L-Leiter beide Modi. 1 beratende Warnung(en) offen.
```

## 2 · Ergebnis in einem Satz

**Kein AA-Verstoss.** Das knappste geprüfte **Text**-Paar ist
`ink-500`/`well` hell mit **4.82:1** (Schwelle 4.5) — der Tertiärton auf dem
versenkten Eingabefeld. Das knappste geprüfte **Nicht-Text**-Paar ist
`warn-line`/`warn-bg` hell mit **3.29:1** (Schwelle 3.0), unverändert aus
QS-UI-WARNLINE; neu dazu kommt `karte-kante`/`karte-voll` hell mit **3.66:1**
(vorher gold, jetzt Register «Gesetze» — die Reserve ist **grösser** als zuvor).

## 3 · Bewusst NICHT als Pflichtpaar aufgenommen (§8 statt stiller Lücke)

* **`reg-w`/`well` hell = 4.43:1** — unter AA. Die Registerfarbe «Werkzeuge»
  steht als Strich, Reiter-Unterkante, Randmarke und Kopfzeile auf Papier,
  Karte und schwebender Ebene; sie steht **nicht** in einem Eingabefeld. Ein
  Pflichtpaar ohne Konsumenten wäre ein erfundener Befund (§7) — die Zahl steht
  darum hier, gemessen, statt im Tor. Wer in R2–R5 einen Registerton in ein
  `.lc-input` setzt, muss ihn vorher abdunkeln.
* **`--rule-soft` (#DADADA hell / #333333 dunkel)** — die 1-px-Zeilentrennung
  ist rein dekorativ (WCAG 1.4.11 nimmt rein dekorative Grafik aus; die
  Trennung trägt keine Information, die nicht auch aus Abstand und Satz folgt).
  Die informationstragende 2-px-Kante `--rule` ist die Tinte selbst
  (17.65:1 hell / 15.60:1 dunkel).
* **`danger-500`/`paper` dunkel = 2.72:1** — unveränderter Altbestand mit
  Baseline-Guard (`RISSE`), alle Call-Sites sind auf `--danger-line` aliassiert.

## 4 · Abweichungen vom Referenzbild, mit Grund

| Referenzbild | Umgesetzt | Grund |
|---|---|---|
| `--paper` hell `#FFFFFF` | `#FBFBFB` | `check-farbwelt.ts` erzwingt die Flächen-Leiter `well < paper < surface < paper-raised` (FAIL, nicht Warnung). Über dem Papier braucht es zwei hellere Flächen — `#FFFFFF` ist jetzt `--paper-raised`, die schwebende Ebene. Sichtbarer Unterschied zu Reinweiss: ΔL ≈ 0.006. |
| `--ink-3` hell `#767676` | `--ink-500` `#696969` | `#767676` liegt auf `--well` bei 3.99:1 (Prüfer R1-8 nachgerechnet, culori wcagContrast; die frühere Angabe 4.44 war falsch) — unter AA. Der dunklere Ton hält 4.82:1 und bleibt tonal derselbe Tier. |
| Ink-Rampe warm (Referenz `#ECEAE4` dunkel) | chromafrei (`#EDEDED`) | Die Wärme WAR die halbe Creme-Signatur (Fahrplan §1). C = 0 in beiden Modi; der harte Hue-Drift-Wächter für `ink` greift bei C = 0 nicht mehr, die L-Monotonie bleibt geprüft. |
| Archivo `wdth` 87.5 | Breite normal (`wght`-Achse) | Die `wdth`-Achse kostet im latin-Subset **90.1 KB statt 34.9 KB** (+158 % Erstlast) für eine Breitenstufe (§15). Rückkehr = Import auf `wdth.css` + `font-stretch: 87.5%`; Entscheid offen für R2/R5. |

## 5 · Schrift-Nutzlast (gemessen, latin-Subset «normal» — was deutscher Text zieht)

| | Datei | roh | gzip |
|---|---|---:|---:|
| vorher | `geist-latin-wght-normal.woff2` | 29 400 B | 29 458 B |
| vorher | `geist-mono-latin-wght-normal.woff2` | 23 128 B | 23 191 B |
| vorher | `source-serif-4-latin-wght-normal.woff2` | 50 824 B | 50 901 B |
| **vorher, Summe** | | **103 352 B (100.9 KB)** | **103 550 B (101.1 KB)** |
| nachher | `archivo-latin-wght-normal.woff2` | 34 928 B | 35 002 B |
| nachher | `literata-latin-wght-normal.woff2` | 52 496 B | 52 486 B |
| **nachher, Summe** | | **87 424 B (85.4 KB)** | **87 488 B (85.4 KB)** |

**−15.5 %** — trotz zweier neuer Familien, weil `--font-mono` seit R1 eine
System-Kette ohne eigenes Paket ist. (woff2 ist bereits Brotli-komprimiert;
gzip darüber ist wirkungslos und im Zweifel minim grösser — die Spalte steht
nur, weil das Budget-Tor in gzip rechnet.)
`check:perf-budget` grün: entry 56.5 KB / Budget 60.0 KB.
Beide Familien OFL-1.1 (`check:lizenzen` grün, 0 rote Pakete).

## 6 · CLS-Sicherung

Die metrik-angepassten Fallbacks sind neu aus den **echten** woff2 gemessen
(`npx vite-node scripts/gen-font-fallbacks.ts`, @capsizecss), nicht geraten:

* `Archivo Fallback` (Arial/Arimo/Liberation Sans): ascent 85.8362 %,
  descent 20.5303 %, line-gap 0 %, size-adjust 102.2878 %
* `Literata Fallback` (Georgia): ascent 109.3141 %, descent 28.6056 %,
  size-adjust 107.6714 %
* `Literata Times Fallback` (Liberation Serif/Tinos/Times, Linux-CI):
  ascent 99.6159 %, descent 26.0677 %, line-gap 0 %, size-adjust 118.1538 %

## 7 · Vollständige Messreihe

### Fliesstext und Tiers

| Vordergrund | Fläche | hell | dunkel |
|---|---|---:|---:|
| `ink-900` | `paper` | 17.65 | 15.60 |
| `ink-900` | `surface` | 17.95 | 14.87 |
| `ink-900` | `well` | 16.02 | 16.49 |
| `ink-900` | `paper-raised` | 18.26 | 13.75 |
| `ink-600` | `paper` | 8.56 | 8.42 |
| `ink-600` | `surface` | 8.71 | 8.03 |
| `ink-600` | `well` | 7.78 | 8.90 |
| `ink-600` | `paper-raised` | 8.86 | 7.42 |
| `ink-500` | `paper` | 5.31 | 5.72 |
| `ink-500` | `surface` | 5.40 | 5.45 |
| `ink-500` | `well` | 4.82 | 6.05 |
| `ink-500` | `paper-raised` | 5.49 | 5.04 |
| `placeholder` | `well` | 4.96 | 5.59 |

### Akzent (ehem. Messing, jetzt Tinte) und Fokus

| Vordergrund | Fläche | hell | dunkel |
|---|---|---:|---:|
| `brass-700` | `paper` | 17.65 | 15.60 |
| `brass-700` | `surface` | 17.95 | 14.87 |
| `brass-700` | `well` | 16.02 | 16.49 |
| `brass-700` | `paper-raised` | 18.26 | 13.75 |
| `brass-700` | `brass-100` | 16.17 | 13.42 |
| `brass-800` | `brass-100` | 17.21 | 14.42 |
| `ink-900` | `brass-100` | 16.17 | 13.42 |
| `ink-600` | `brass-100` | 7.85 | 7.25 |
| `brass-line` | `surface` | 4.47 | 5.45 |
| `focus` | `paper` | 17.65 | 5.72 |
| `focus` | `surface` | 17.95 | 5.45 |
| `focus` | `well` | 16.02 | 6.05 |
| `focus` | `paper-raised` | 18.26 | 5.04 |

### Registerfarben

| Vordergrund | Fläche | hell | dunkel |
|---|---|---:|---:|
| `reg-g` | `paper` | 11.10 | 8.18 |
| `reg-g` | `surface` | 11.29 | 7.80 |
| `reg-g` | `paper-raised` | 11.48 | 7.22 |
| `reg-r` | `paper` | 9.86 | 8.21 |
| `reg-r` | `surface` | 10.03 | 7.82 |
| `reg-r` | `paper-raised` | 10.20 | 7.24 |
| `reg-m` | `paper` | 5.82 | 9.44 |
| `reg-m` | `surface` | 5.92 | 8.99 |
| `reg-m` | `paper-raised` | 6.02 | 8.32 |
| `reg-w` | `paper` | 4.88 | 9.11 |
| `reg-w` | `surface` | 4.96 | 8.68 |
| `reg-w` | `paper-raised` | 5.05 | 8.03 |
| `reg-w` | `well` | 4.43 | 9.63 |

### Status (unverändert, auf neuem Papier neu gemessen)

| Vordergrund | Fläche | hell | dunkel |
|---|---|---:|---:|
| `sage-700` | `sage-bg` | 5.91 | 8.43 |
| `slate-700` | `slate-bg` | 6.68 | 7.76 |
| `warn-700` | `warn-bg` | 5.25 | 7.31 |
| `danger-700` | `danger-bg` | 7.72 | 6.67 |
| `ink-900` | `warn-bg` | 15.91 | 12.69 |
| `ink-900` | `danger-bg` | 15.17 | 13.82 |
| `ink-900` | `sage-bg` | 15.54 | 13.26 |
| `ink-900` | `slate-bg` | 15.37 | 13.51 |
| `ink-600` | `warn-bg` | 7.72 | 6.85 |
| `ink-600` | `danger-bg` | 7.36 | 7.46 |
| `ink-600` | `sage-bg` | 7.54 | 7.16 |
| `ink-600` | `slate-bg` | 7.46 | 7.29 |
| `warn-line` | `warn-bg` | 3.29 | 3.94 |
| `danger-line` | `danger-bg` | 5.58 | 6.67 |
| `sage-line` | `sage-bg` | 4.05 | 8.43 |
| `slate-line` | `slate-bg` | 4.66 | 7.76 |
| `sage-line` | `surface` | 4.68 | 9.45 |
| `slate-line` | `surface` | 5.44 | 8.53 |
| `danger-line` | `paper` | 6.49 | 7.53 |

### Kantonskarte (Füllungen neu: Register «Gesetze»)

| Vordergrund | Fläche | hell | dunkel |
|---|---|---:|---:|
| `karte-kante` | `karte-voll` | 3.66 | 4.88 |
| `karte-kante` | `karte-auswahl` | 5.83 | 6.27 |
| `karte-kante` | `karte-duenn` | 8.71 | 7.99 |
| `karte-kante` | `karte-leer` | 10.29 | 11.66 |

### Aufgelöste Token-Werte

| Token | hell | dunkel |
|---|---|---|
| `--paper` | #FBFBFB | #151515 |
| `--paper-raised` | #FFFFFF | #212121 |
| `--paper-sunken` | #F0F0F0 | #0E0E0E |
| `--surface` | #FDFDFD | #1A1A1A |
| `--well` | #F0F0F0 | #0E0E0E |
| `--ink-900` | #151515 | #EDEDED |
| `--ink-800` | #262626 | #DCDCDC |
| `--ink-700` | #383838 | #C9C9C9 |
| `--ink-600` | #4A4A4A | #B0B0B0 |
| `--ink-500` | #696969 | #909090 |
| `--ink-400` | #8C8C8C | #6E6E6E |
| `--ink-300` | #B0B0B0 | #4F4F4F |
| `--placeholder` | #676767 | #8A8A8A |
| `--brass-800` | #0D0D0D | #F5F5F5 |
| `--brass-700` | #151515 | #EDEDED |
| `--brass-600` | #4A4A4A | #C9C9C9 |
| `--brass-500` | #767676 | #909090 |
| `--brass-400` | #A3A3A3 | #6E6E6E |
| `--brass-300` | #C7C7C7 | #4F4F4F |
| `--brass-200` | #E4E4E4 | #2E2E2E |
| `--brass-100` | #F1F1F1 | #232323 |
| `--reg-g` | #1F3A5F | #8FB0DC |
| `--reg-r` | #7A1F2B | #E39AA6 |
| `--reg-m` | #4E6B3A | #A4C48C |
| `--reg-w` | #8A6A1F | #D2B46A |
| `--rule` | #151515 | #EDEDED |
| `--rule-soft` | #DADADA | #333333 |
| `--focus` | #151515 | #909090 |

---

# NACHTRAG «D12 — Lesekomfort» (6.9.2026)

**Erhoben:** 6.9.2026, deterministisch aus `src/index.css` (`:root` + `html.dark`)
über `scripts/farbwelt-messung.ts` (culori, WCAG-2.x, sRGB) — dieselbe
Messfunktion, die das Tor `npm run check:farbwelt` benutzt.

**§2b-Vermerk:** Die Zahlen der Abschnitte 1–7 oben sind **R1-Werte vom
6.9.2026 (Vormittag)** und bleiben unverändert stehen. Sie sind nicht falsch
geworden; D12 hat die Token verschoben, die sie messen. Dieser Nachtrag
ergänzt, er führt nicht nach.

## D12.1 · Anlass

David, 6.9.2026: «in der alten version besser lesen … angenehmer fürs auge
aufgrund der kontraste», «nicht trist», «keine Funktion verloren». R1 hatte
Papier und Tinte auf **chromafreien Maximalkontrast** gestellt (`ink-900`/`paper`
hell 17.65:1). Der Befund dahinter ist messbar und nicht Geschmack:

* Maximalkontrast erzeugt am Bildschirm **Halation** — der helle Grund blutet
  optisch in die Buchstabenkanten und lässt den Text flimmern. Zielband für
  Langlese-Fliesstext ≈ **12–15:1** (APCA/Somers; Butterick, «dark gray statt
  black»).
* Leicht **getöntes Papier** senkt die Blendung, ohne die positive Polarität
  (dunkler Text auf hellem Grund) aufzugeben (Piepenbrock/Buchner 2013).
* Serifen am Bildschirm brauchen **optische Grösse** (`opsz`) und etwas mehr
  **Gewicht** (450–500).
* Dunkelmodus nie Reinschwarz/Reinweiss.

## D12.2 · Ergebnis in einem Satz

**Kein AA-Verstoss, und die Reserve ist an keiner Stelle kleiner geworden, wo
sie knapp war.** Das knappste geprüfte **Text**-Paar ist neu
`ink-500`/`paper-raised` **dunkel mit 4.62:1** (Schwelle 4.5); hell ist es
`reg-m`/`well` mit **4.65:1**. Das knappste **Nicht-Text**-Paar ist
`warn-line`/`warn-bg` hell mit 3.29:1 (unverändert aus QS-UI-WARNLINE).
Der bekannte Riss `danger-500`/`paper` dunkel ist von 2.72:1 auf **2.80:1
gestiegen** (D12.6).

## D12.3 · Die neuen Werte

| Rolle | hell | dunkel |
|---|---|---|
| `--paper` | `#FAF7F2` (war `#FBFBFB`) | `#1B1917` (war `#151515`) |
| `--paper-raised` | `#FFFFFF` | `#282521` (war `#212121`) |
| `--surface` | `#FCFAF6` (war `#FDFDFD`) | `#201E1B` (war `#1A1A1A`) |
| `--well` / `--paper-sunken` | `#F3F0EA` (war `#F0F0F0`) | `#131211` (war `#0E0E0E`) |
| `--ink-900` (Tinte) | `#25231F` (war `#151515`) | `#E2E0DC` (war `#EDEDED`) |
| `--ink-800` | `#32302C` | `#D2CEC6` |
| `--ink-700` | `#3B3832` | `#BFBAB0` |
| `--ink-600` (Sekundär) | `#5C564A` (war `#4A4A4A`) | `#A59E90` (war `#B0B0B0`) |
| `--ink-500` | `#6A665E` | `#938D81` |
| `--ink-400` | `#8D887E` | `#6F6B63` |
| `--ink-300` | `#B0ADA7` | `#534F47` |
| `--placeholder` | `#69655D` | `#8A857B` |
| `--rule-soft` | `#DDDAD4` (war `#DADADA`) | `#35332F` (war `#333333`) |
| `--brass-800` | `#1D1B17` | `#F6F4F0` |
| `--brass-700` (= Tinte) | `var(--ink-fixed-dark)` | `var(--ink-900)` |
| `--brass-600` | `#4D4A44` | `#CDC9C1` |
| `--brass-500` (= `--focus` dunkel) | `#7A766E` | `#949088` |
| `--brass-400` | `#A6A39D` | `#716E68` |
| `--brass-300` | `#CAC7C1` | `#514F4B` |
| `--brass-200` | `#E6E4E0` | `#302E2A` |
| `--brass-100` | `#F3F1ED` | `#242321` |
| `--danger-500` | `#9A3F30` (unverändert) | `#9F4434` (neu, D12.6) |

**Registerfarben unverändert** (`--reg-g/r/m/w`) — Auftragsgrenze «Registerfarben
bleiben, auf neuem Papier neu messen». Neu gemessen: D12.4.

**Die ganze Ink- UND Brass-Rampe liegt auf EINEM Hue (84.6°)**, Chroma als
flache Glocke (Enden ~0.006–0.008, Mitten 600–500 ~0.014–0.023). Der harte
Hue-Drift-Wächter (`check:farbwelt` (b), FAIL für `ink`) misst einen Span von
**0.0°** in beiden Modi — nicht 0, weil chromafrei wie in R1, sondern weil alle
Stufen tatsächlich auf demselben Ton sitzen. Die L-Monotonie ist in beiden Modi
erfüllt, die Flächen-L-Leiter `well < paper < surface < paper-raised` ebenso
(hell 0.956 < 0.977 < 0.986 < 1.000).

## D12.4 · Vollständige Messreihe

### Fliesstext und Tiers

| Vordergrund | Fläche | hell | dunkel |
|---|---|---:|---:|
| `ink-900` | `paper` | 14.68 | 13.30 |
| `ink-900` | `surface` | 15.05 | 12.61 |
| `ink-900` | `well` | 13.79 | 14.19 |
| `ink-900` | `paper-raised` | 15.68 | 11.57 |
| `ink-800` | `paper` | 12.32 | 11.17 |
| `ink-800` | `surface` | 12.63 | 10.60 |
| `ink-800` | `well` | 11.58 | 11.93 |
| `ink-800` | `paper-raised` | 13.17 | 9.72 |
| `ink-700` | `paper` | 10.93 | 9.07 |
| `ink-700` | `surface` | 11.21 | 8.60 |
| `ink-700` | `well` | 10.27 | 9.68 |
| `ink-700` | `paper-raised` | 11.68 | 7.89 |
| `ink-600` | `paper` | 6.81 | 6.59 |
| `ink-600` | `surface` | 6.98 | 6.25 |
| `ink-600` | `well` | 6.40 | 7.03 |
| `ink-600` | `paper-raised` | 7.28 | 5.73 |
| `ink-500` | `paper` | 5.35 | 5.32 |
| `ink-500` | `surface` | 5.48 | 5.04 |
| `ink-500` | `well` | 5.02 | 5.67 |
| `ink-500` | `paper-raised` | 5.71 | **4.62** |
| `placeholder` | `paper` | 5.43 | 4.78 |
| `placeholder` | `surface` | 5.56 | 4.53 |
| `placeholder` | `well` | 5.10 | 5.10 |
| `placeholder` | `paper-raised` | 5.80 | 4.16 |

`placeholder`/`paper-raised` dunkel (4.16) ist **kein Pflichtpaar**: der
Platzhalter steht ausschliesslich im versenkten Eingabefeld (`--well`, dort
5.10), nie auf der schwebenden Ebene. Die Zahl steht hier gemessen statt im Tor
— ein Pflichtpaar ohne Konsumenten wäre ein erfundener Befund (§7), dieselbe
Begründung wie bei `reg-w`/`well` in Abschnitt 3.

### Akzent (= Tinte) und Fokus

| Vordergrund | Fläche | hell | dunkel |
|---|---|---:|---:|
| `brass-700` | `paper` | 14.68 | 13.30 |
| `brass-700` | `surface` | 15.05 | 12.61 |
| `brass-700` | `well` | 13.79 | 14.19 |
| `brass-700` | `brass-100` | 13.90 | 11.91 |
| `brass-800` | `paper` | 16.09 | 15.96 |
| `brass-800` | `brass-100` | 15.24 | 14.29 |
| `brass-800` | `surface` | 16.49 | 15.14 |
| `brass-800` | `well` | 15.12 | 17.03 |
| `brass-line` | `paper` | 4.23 | 5.51 |
| `brass-line` | `surface` | 4.34 | 5.23 |
| `brass-line` | `well` | 3.98 | 5.88 |
| `focus` | `paper` | 14.68 | 5.51 |
| `focus` | `surface` | 15.05 | 5.23 |
| `focus` | `well` | 13.79 | 5.88 |

### Registerfarben auf dem neuen Papier

| Vordergrund | Fläche | hell | dunkel |
|---|---|---:|---:|
| `reg-g` | `paper` | 7.85 | 8.58 |
| `reg-g` | `surface` | 8.05 | 8.14 |
| `reg-g` | `well` | 7.38 | 9.16 |
| `reg-g` | `paper-raised` | 8.39 | 7.47 |
| `reg-r` | `paper` | 9.55 | 7.88 |
| `reg-r` | `surface` | 9.79 | 7.47 |
| `reg-r` | `well` | 8.97 | 8.41 |
| `reg-r` | `paper-raised` | 10.20 | 6.86 |
| `reg-m` | `paper` | 4.94 | 10.14 |
| `reg-m` | `surface` | 5.07 | 9.62 |
| `reg-m` | `well` | **4.65** | 10.83 |
| `reg-m` | `paper-raised` | 5.28 | 8.83 |
| `reg-w` | `paper` | 5.21 | 9.56 |
| `reg-w` | `surface` | 5.34 | 9.07 |
| `reg-w` | `well` | 4.89 | 10.20 |
| `reg-w` | `paper-raised` | 5.56 | 8.32 |

**Alle vier Registerfarben halten ≥ 4.5:1 auf allen vier Flächen in beiden
Modi.** Bemerkenswert: `reg-w`/`well` hell stand in R1 als bewusst NICHT
aufgenommenes Paar bei 4.43:1 (Abschnitt 3 oben) — auf dem warmen Papier misst
es **4.89:1** und ist damit von selbst geheilt. Das gilt jetzt für alle 16
Register-Paare; sie sind darum sämtlich Pflichtpaare im Tor.

## D12.5 · Schrift

| | Datei (latin-Subset) | roh |
|---|---|---:|
| vorher | `archivo-latin-wght-normal.woff2` | 34 928 B |
| vorher | `archivo-latin-wght-italic.woff2` | 39 156 B |
| vorher | `literata-latin-wght-normal.woff2` | 52 496 B |
| vorher | `literata-latin-wght-italic.woff2` | 53 728 B |
| **vorher, Summe** | | **180 308 B (176.1 KB)** |
| nachher | `archivo-latin-wght-normal.woff2` | 34 928 B |
| nachher | `archivo-latin-wght-italic.woff2` | 39 156 B |
| nachher | **`literata-latin-opsz-normal.woff2`** | **110 080 B** |
| nachher | `literata-latin-wght-italic.woff2` | 53 728 B |
| **nachher, Summe** | | **237 892 B (232.3 KB)** |

**+57 584 B (+56.2 KB, +31.9 %)** — genau der im Auftrag budgetierte Betrag
(«+~58 KB akzeptiert»). Gemessen an den gebauten `dist/assets/*.woff2`, nicht
am Paket.

**Die Kursive bleibt bewusst auf `wght`.** Die opsz-Kursive kostete noch einmal
+59 452 B; sie trägt Randtitel und Begrüssung, nie Langlese-Fliesstext — Budget
für eine Achse, die an keiner Lesestelle wirkt (§15). Der Preis: `font-optical-
sizing` wirkt auf die Kursive nicht. Sichtbar wäre das nur bei kursivem
Fliesstext über mehrere Absätze; den gibt es nicht.

`check:perf-budget` grün: entry gzip **59.7 KB / Budget 60.0 KB**. Die
Schrift-Nutzlast zählt dort NICHT hinein (das Tor misst JS-Chunks und
Daten-JSON) — sie ist darum oben eigens gemessen.

Weiter: `font-optical-sizing: auto` am `body`; Lesetext-Gewicht **450** als
Token `--lese-gewicht`, angewandt über eine `:where([class~="font-serif"])`-Regel
mit Spezifität null (jede Tailwind-Gewichts-Utility gewinnt weiterhin). Grösse
17 px (`leser-text`) und Zeilenhöhe 1.62 **unverändert** — der Auftrag verlangte
«1.6 bleibt», und 1.62 ist der in R4 aus dem Referenzbild gesetzte Wert.

## D12.6 · Der einzige Riss, der sich bewegt hat — nach oben

Das hellere dunkle Papier (`#151515` → `#1B1917`) senkte das bekannte Riss-Paar
`danger-500`/`paper` dunkel von 2.72:1 auf **2.61:1**. Der Baseline-Guard in
`check-farbwelt.ts` schlug an — richtig, ein bekannter Riss darf nicht tiefer
sinken.

**Statt die Baseline nachzuziehen (§17: Wurzel, nicht umschiffen) ist der Ton im
Dunkelmodus um dieselbe Stufe mitgehoben**: `--danger-500` dunkel `#9F4434`
(L 0.488 → 0.504, Hue und Chroma unverändert), gemessen **2.80:1** — besser als
vor D12. Hell bleibt `#9A3F30` unangetastet. Alle `danger-bg`-Pflichtpaare
bleiben grün.

## D12.7 · Bildnachweis

Gleicher Artikel, gleiche Adresse (`/gesetze/bund/OR#art-336_c`), @1440,
Vorher = Stand `0c83e094e` (nach Fixer 1+2), Nachher = dieser Stand:

* `r5f1b-vorher-lesekomfort-hell.jpg` → `r5f1b-nachher-lesekomfort-hell.jpg`
* `r5f1b-vorher-lesekomfort-dunkel.jpg` → `r5f1b-nachher-lesekomfort-dunkel.jpg`

## D12.8 · Was das Tor jetzt sagt

```
Farbwelt-Tor ok — 146 WCAG-Pflichtpaare (hell+dunkel), 6 Referenzwerte (§4b-B),
2 Fixpunkte, Flächen-L-Leiter beide Modi, kein Hex in data-URIs.
4 beratende Warnung(en) offen (D-1/D-4/D-5).
```

126 → 146 Pflichtpaare: die 10 neuen Nicht-Text-Kanten der Badge-Umrisse (L5,
s. `R5-F1B.md`). Die vier beratenden Warnungen sind der geheilte
`danger-500`-Riss und drei Chroma-Dämpfungs-Hinweise der Brass-Mitten, die mit
der Wärme wieder auftauchen (dunkel C ≈ hell C statt −10 %) — beratend seit
D-4/D-5, kein Tor.

**Eine APCA-Beobachtung, die kein Fehler ist:** `ink-600`/`paper` dunkel fällt
von Lc −60.9 auf **−48.9** (Ziel ≥ 60) und `focus`/`paper` dunkel auf −41.5
(Ziel ≥ 45). Beide sind WCAG-konform (6.59:1 bzw. 5.51:1) und beide sind
GEWOLLT: der Sekundärton soll leiser werden, das ist der Inhalt von D12. APCA
ist in diesem Haus ausdrücklich beratend, nie Tor — festgehalten, damit die
Verschiebung nicht später als unbemerkter Verfall gilt.
