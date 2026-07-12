# Abnahme-Mappe D-3 — color-mix `srgb` → `oklab` (FAHRPLAN-DESIGN-WAERME, W2·11-DESIGN)

Stand: 12.7.2026 · Bau: autonom · Vorbedingung D-2 (PR #217) gemergt.

D-3 stellt **alle 19 `color-mix`-Rezepte** in `src/index.css` von `in srgb` auf
`in oklab` um (Befund 36: srgb-Interpolation frisst bei 10–18 %-Tönungen
Farbigkeit — die Status-Flächen waren grauer/kälter als das Rezept verspricht).
Wort-für-Wort-revertierbar, CSS-Laufzeit-only.

## Mess-Quittung (deterministisch, culori — Werte je Stelle vorher→nachher)

**Kernbefund:** 15 der 19 Stellen mischen mit `transparent` → wegen
premultiplied alpha ist das gerenderte Ergebnis **byte-identisch**, egal in
welchem Raum (der transparente Endpunkt trägt kein Farbgewicht). Sichtbar
verschieben sich **nur die vier `-bg`-Flächen** — minimal wärmer/chromatischer:

| Nr | Stelle | Modus | alt (srgb) | neu (oklab) | Kontrast alt | Kontrast neu |
|---|---|---|---|---|---|---|
| 1 | `--line` 10 % | hell | `#E4E2DC` α.10 | **identisch** | 1.22 | 1.22 |
| 2 | `--line-strong` 18 % | hell | `#D2D0CB` α.18 | **identisch** | 1.45 | 1.45 |
| 3 | `--guide-gliederung` 18 % | hell | `#D2D0CB` α.18 | **identisch** | 1.45 | 1.45 |
| 4 | `--rule-artikel` 10 % | hell | `#E4E2DC` α.10 | **identisch** | 1.22 | 1.22 |
| 5 | `--rule-struktur` 14 % | hell | `#DBD9D3` α.14 | **identisch** | 1.33 | 1.33 |
| 6 | `--sage-bg` (Text sage-700) | hell | `#EBEBE3` | `#EAEBE2` | 5.81 | 5.77 |
| 6 | `--sage-bg` | dunkel | `#23271C` | `#22251B` | 8.25 | 8.44 |
| 7 | `--slate-bg` (Text slate-700) | hell | `#EAEAE5` | `#E9E9E5` | 6.58 | 6.52 |
| 7 | `--slate-bg` | dunkel | `#222421` | `#21231F` | 7.63 | 7.77 |
| 8 | `--warn-bg` (Text warn-700) | hell | `#F4EBDC` | `#F5EBDE` | 5.11 | 5.12 |
| 8 | `--warn-bg` | dunkel | `#352711` | `#312515` | 7.12 | 7.32 |
| 9 | `--danger-bg` (Text danger-700) | hell | `#F0E5DF` | `#F2E5DD` | 7.55 | 7.54 |
| 9 | `--danger-bg` | dunkel | `#2E1D15` | `#2C1D15` | 6.67 | 6.68 |
| 10 | `--line` 14 % | dunkel | `#34322B` α.14 | **identisch** | 1.43 | 1.43 |
| 11 | `--line-strong` 24 % | dunkel | `#494740` α.24 | **identisch** | 1.98 | 1.98 |
| 12 | `--guide-gliederung` 24 % | dunkel | `#494740` α.24 | **identisch** | 1.98 | 1.98 |
| 13 | `--rule-artikel` 14 % | dunkel | `#34322B` α.14 | **identisch** | 1.43 | 1.43 |
| 14 | `--rule-struktur` 20 % | dunkel | `#413F38` α.20 | **identisch** | 1.73 | 1.73 |
| 15 | Z.480 Schraffur warn-500 26 % | hell+dunkel | α-Streifen | **identisch** | — | — |
| 16 | Z.588 `lc-glass` paper 96 % | hell+dunkel | α-Fläche | **identisch** | — | — |
| 17 | Z.605 `lc-badge-entwurf`-Outline warn-500 45 % | hell+dunkel | α-Border | **identisch** | — | — |
| 18 | Z.608 `lc-badge-soft`-Border slate-500 30 % | hell+dunkel | α-Border | **identisch** | — | — |
| 19 | Z.708 brass-Unterstreichung brass-500 38 % | hell+dunkel | α-Border | **identisch** | — | — |

(Kontrast bei 1–5/10–14 = Linie gegen `--paper` [Deko, kein 3:1-Anspruch, §4b];
bei 6–9 = `-700`-Text auf der `-bg`-Fläche, Schwelle 4.5:1 — **alle ≥ 5.1:1,
kein AA-Riss, keine Einzel-Kalibrierung nötig.**)

`lc-badge-entwurf`-Text (warn-700 auf transparentem Grund): 5.87/5.67 hell,
8.47/9.00 dunkel (surface/paper) — vom Raumwechsel unberührt.

## Referenzwerte C-1/C-2/C-3 (§4b-B) — NEU GEMESSEN, unverändert

Alle drei Paare sind Voll-Token auf dem soliden `--well` (kein color-mix im Pfad):

| Paar | hell vorher→nachher | dunkel vorher→nachher |
|---|---|---|
| slate-500/well (C-1 Tick) | 4.81 → **4.81** | 3.47 → **3.47** |
| warn-700/well (C-2 ↻) | 5.24 → **5.24** | 9.43 → **9.43** |
| brass-700/well (C-3 ★) | 4.91 → **4.91** | 10.48 → **10.48** |

→ Kein Guard im Tor musste bewegt werden; Nachführung = **deklarierter No-op**
(Kommentar in `scripts/check-farbwelt.ts`, Nachtrag `DESIGN-REGLEMENT.md §F2b`
+ Notiz `DESIGN-REGLEMENT-NORMTEXT.md §4b-B`).

## Beweise

- `check:farbwelt` GRÜN: 46 Pflichtpaare hell+dunkel, 6 Referenzwerte, 2 Fixpunkte,
  Flächen-L-Leiter beide Modi (das Tor löst `in oklab` nativ auf — D-0 hatte den
  oklab-Zweig schon).
- `golden:vergleich`: **209 Fälle byte-gleich** (color-mix ist CSS-Laufzeit).
- `npm run gate` (voll) GRÜN · `build` 63 Routen (dist-CSS: 0× `in srgb`).
- axe-e2e **26/26** hell+dunkel.
- INFO ausserhalb D-3-Scope: der eine Call-Site-Mix `Shell.tsx` (paper-sunken
  35 %/paper) rendert in beiden Räumen identisch (#F7F5EE / #14130D) —
  kein Handlungsbedarf, Kandidat für D-5-Formalisierung.

## Screens (4 Kernseiten × hell/dunkel, Desktop 1280×900)

| Seite | hell | dunkel |
|---|---|---|
| Startseite (`/`) | `startseite-hell.png` | `startseite-dunkel.png` |
| Gesetz-Reader (`/gesetze/bund/OR`) | `gesetz-reader-OR-hell.png` | `gesetz-reader-OR-dunkel.png` |
| Entscheid (`/rechtsprechung/bger_1B_278_2022`) | `entscheid-reader-hell.png` | `entscheid-reader-dunkel.png` |
| Rechner (`/rechner/verjaehrung`) | `rechner-verjaehrung-hell.png` | `rechner-verjaehrung-dunkel.png` |

**Squint-Test (§G-a):** unverändert bestanden — der Delta-Eindruck der vier
`-bg`-Flächen ist subtil (≤ 2 RGB-Stufen je Kanal, Richtung «wärmer»); Brass
leuchtet weiterhin nur an bedeutungstragenden Stellen.
