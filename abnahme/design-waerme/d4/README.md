# Abnahme-Mappe D-4 — Ink-Wärme: EINE Hue-Normalisierung der Grau-Achse (FAHRPLAN-DESIGN-WAERME, W2·11-DESIGN)

Stand: 13.7.2026 · Bau: autonom · Vorbedingung D-3 (PR #230) gemergt.

D-4 normalisiert die **ink-Rampe (900…300) + `--placeholder`, hell UND dunkel
(16 Werte)**, in OKLCH auf **EINEN Ziel-Hue 88°** (brass-verwandt; Radix-Regel
«saturated gray closest to accent», Befunde 3+34). Hell lag die Achse zuvor bei
~107° (grün-gelb, brass-fremd), dunkel bei 84–90° gestreut. **L gehalten**
(WCAG-Näherung, trotzdem F2-Messung je Wert), Chroma als flache Glocke
(C≈0.008 an den Enden, ~0.012–0.015 in den Mitten 600–400 — dort sitzt
Sekundär-/Metatext, die sichtbarste Wärme-Fläche). Haarlinien (`--line`,
`--rule-*`, `--guide-gliederung`) erben via color-mix-Rezepte automatisch.
Flip-reversibel (reine `:root`-/`html.dark`-Hex-Werte).

## Mess-Quittung (deterministisch, culori — je Stufe vorher→nachher)

### Hell (Kontraste auf paper · surface · well)

| Stufe | alt→neu | Hue alt→neu | paper | surface | well |
|---|---|---|---|---|---|
| ink-900 | `#1A1A17`→`#1C1A15` | 106.9°→88.8° | 16.42→16.37 | 16.98→16.92 | 15.17→15.12 |
| ink-800 | `#2A2A25`→`#2B2924` | 107.0°→88.8° | 13.58→13.68 | 14.04→14.14 | 12.54→12.64 |
| ink-700 | `#3A3A33`→`#3C3932` | 107.0°→87.6° | 10.79→10.84 | 11.15→11.21 | 9.96→10.02 |
| ink-600 | `#54544B`→`#56534C` | 107.0°→87.5° | 7.20→7.22 | 7.44→7.47 | 6.65→6.67 |
| ink-500 | `#6E6E64`→`#6F6B61` | 106.9°→88.8° | 4.85→**5.00** | 5.01→**5.17** | **4.48→4.62** |
| `--placeholder` | `#6A6A60`→`#6D695F` | 106.9°→88.8° | 5.14→5.15 | 5.32→5.33 | **4.75→4.76** |
| ink-400 | `#8B8B81`→`#8D8A83` | 106.8°→87.5° | 3.24→3.24 | 3.35→3.35 | 2.99→3.00 |
| ink-300 | `#A9A99F`→`#AAA8A3` | 106.7°→88.7° | 2.23→2.24 | 2.31→2.31 | 2.06→2.07 |

### Dunkel

| Stufe | alt→neu | Hue alt→neu | paper | surface | well |
|---|---|---|---|---|---|
| ink-900 | `#ECE7DA`→`#E9E7E2` | 89.4°→88.6° | 14.81→14.80 | 13.95→13.94 | 15.54→15.52 |
| ink-800 | `#DFD9CB`→`#DCD9D2` | 87.5°→87.5° | 13.00→12.97 | 12.24→12.22 | 13.63→13.61 |
| ink-700 | `#D2CCBD`→`#CFCCC5` | 88.7°→87.5° | 11.42→11.41 | 10.76→10.74 | 11.98→11.96 |
| ink-600 | `#B4AE9F`→`#B2AEA4` | 88.8°→88.7° | 8.27→8.26 | 7.79→7.78 | 8.67→8.66 |
| ink-500 | `#928D80`→`#918D83` | 89.4°→88.7° | 5.52→5.52 | 5.20→5.20 | 5.79→5.79 |
| `--placeholder` | `#8A857A`→`#89857B` | 86.5°→88.7° | 4.98→4.97 | 4.69→4.68 | 5.22→5.21 |
| ink-400 | `#736F64`→`#726F68` | 90.3°→87.5° | 3.65→3.65 | 3.43→3.44 | 3.82→3.83 |
| ink-300 | `#56524A`→`#54524D` | 84.6°→88.7° | 2.35→2.34 | 2.22→2.21 | 2.47→2.46 |

(ink-400/ink-300 sind Haarlinien-/Deko-Töne ohne Text-Anspruch, §4b. Hue-Span
der ink-Familie neu: **1.3° hell / 1.2° dunkel** — vorher hell einheitlich um
107° [falscher, grün-gelber Hue], dunkel **5.7°** gestreut.)

### Mess-Pflichten der Spec (alle erfüllt)

- **ink-500 ≥4.5:1 auf paper/surface/well:** hell 5.00/5.17/**4.62** ·
  dunkel 5.52/5.20/5.79. Der bekannte Riss ink-500/well hell (4.48) ist
  **geheilt** — einzige bewusste L-Abweichung der Einheit: ink-500 hell
  −0.007 L (0.535→0.528), sonst überall L gehalten.
- **`--placeholder` ≥4.5:1 auf well:** hell **4.76** (vorher 4.75, knapp) ·
  dunkel 5.21.
- **`--ink-fixed-dark`-Solitär** (speist helles ink-900 UND `--auf-gold`)
  wanderte mit EINEM Wert `#1A1A17`→`#1C1A15`; `--auf-gold` auf brass-300
  bleibt **10.71:1** (vorher 10.73).
- **D-0 für ink SCHARF geschaltet:** Hue-Drift ≤8° + L-Monotonie sind für die
  ink-Familie jetzt harter FAIL (`scripts/check-farbwelt.ts`; brass bleibt
  beratend bis D-9/Stripe-L-Anker). ink-500/well hell aus der RISSE-Baseline
  in die WCAG-Pflichtpaare verschoben → Tor prüft **48 Pflichtpaare**.

## Beweise

- `check:farbwelt` GRÜN: 48 Pflichtpaare hell+dunkel, 6 Referenzwerte (C-1/C-2/
  C-3 unverändert — Voll-Token auf `--well`, ink nicht im Pfad), 2 Fixpunkte,
  Flächen-L-Leiter beide Modi, ink-Hue-Drift/L-Monotonie HART grün.
- `golden:vergleich` byte-gleich (CSS-only, kein Dokument-Output berührt).
- `npm run gate` (voll) GRÜN · build alle 63 Routen.
- axe-e2e hell+dunkel grün (siehe PR-Quittung).

## Screens (Referenzfälle der Spec: Startseiten-Untertitel/Meta-Zeilen,
Rechner-Hilfetexte, Footer — 4 Kernseiten × hell/dunkel, Desktop 1280×900)

| Seite | hell | dunkel |
|---|---|---|
| Startseite (`/`) | `startseite-hell.png` | `startseite-dunkel.png` |
| Startseite Footer | `startseite-footer-hell.png` | `startseite-footer-dunkel.png` |
| Gesetz-Reader (`/gesetze/bund/OR`) | `gesetz-reader-OR-hell.png` | `gesetz-reader-OR-dunkel.png` |
| Entscheid (`/rechtsprechung/bger_1B_278_2022`) | `entscheid-reader-hell.png` | `entscheid-reader-dunkel.png` |
| Rechner (`/rechner/verjaehrung`) | `rechner-verjaehrung-hell.png` | `rechner-verjaehrung-dunkel.png` |

**Squint-Test (§G-a):** bestanden — die Grau-Achse liest sich jetzt als EINE
warme Tinte auf EINEM Papier (kein grünlicher Unterton mehr in Untertiteln/
Meta-Zeilen/Hilfetexten/Footer); Brass bleibt das einzige laute Signal. Der
Delta-Eindruck ist subtil (≤3 RGB-Stufen je Kanal), Richtung «brass-verwandt
warm» — kein zweiter Wärme-Kanal entstanden (E1).
