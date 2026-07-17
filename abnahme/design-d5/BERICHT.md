# Abnahme D-5 · Flächen-Wärme «Papier-Treppe» — HELLER + WEISSER (David-Direktive A38)

**Stand:** 16.7.2026 · **Bau:** Opus · **PR:** `feat/design-d5-papier` ·
**Roadmap:** W2·11-DESIGN · **Gegenprüfung:** n/a — reine Darstellung (Token-Fläche).

## Was & Warum

FAHRPLAN-DESIGN-WAERME **D-5** (Papier-Treppe im OKLCH-Raum), gebaut mit der
**deklarierten Übersteuerung durch David-Direktive A38** (16.7.2026, wörtlich
«ausserdem mache die ganze lexmetrik webseite heller uns weisser», Quelle
`docs/ux-audit-2026-07/ANMERKUNGEN-DAVID-2026-07-16.md` Nachtrag).

A38 übersteuert die Flächen-Ton-Zielwerte der D-5-Spec — **inklusive** des
Spec-Fixpunkts §0.1 (`--paper #FAF8F2` war «unantastbar»). Die **Treppen-MECHANIK**
der Spec bleibt wörtlich: gestufte Flächen-Rollen, EINE Papier-Achse (Hue ~90°,
brass-/ink-konsistent wie D-4), L strikt steigend `well < paper < surface < raised`
(Erhebungs-Logik), Flexoki-Nuance (tiefere Fläche = eine Spur mehr Chroma).
**Geändert** sind nur die Zielwerte: **Chroma site-weit ~30 % gesenkt** (Wärme
bleibt nur noch feine Nuance, keine sichtbar getönte Fläche mehr) und **L angehoben**.

**Nur `:root` (HELL) — DUNKEL bleibt unberührt** (A38 betrifft die helle Fläche;
D-6 kommt separat).

## Token-Delta (hell, culori/OKLCH-gemessen)

| Rolle | alt → neu | L alt→neu | C alt→neu |
|---|---|---|---|
| `--paper` (Seitengrund) | `#FAF8F2`→`#FCFAF6` | 0.979→0.986 | 0.0082→0.0057 |
| `--paper-raised` (klein erhaben) | `#FEFDFA`→`#FFFEFC` | 0.994→0.997 | 0.0041→0.0028 |
| `--paper-sunken` / `--well` (Eingabe) | `#F2EFE6`→`#F6F4EE` | 0.952→0.967 | 0.0124→0.0082 |
| `--surface` (Karten/Panels) | `#FDFCF7`→`#FEFCFA` | 0.991→0.992 | 0.0067→0.0034 |

`--paper-raised` ist nun nahezu weiss, aber **nicht `#FFFFFF`** (Reinweiss-Invariante d).
`--surface`-Hue-Ausreisser (97°) auf die Papier-Achse (~90°) angeglichen. `--well` war
der sichtbarste Cream-/Grau-Ton → grösster A38-Gewinn (Eingabefelder lesen sich jetzt
als helles Papier statt graue Mulde).

## Kontrast-Messwerte (Minima, hell — sichere Richtung: hellerer Grund = mehr Kontrast)

| Paar | alt → neu | Schwelle |
|---|---|---|
| `ink-500`/well | 4.62 → **4.83** | ≥4.5 Text |
| `--placeholder`/well | 4.76 → **4.98** | ≥4.5 Text |
| `ink-600`/well | 6.67 → **6.98** | ≥4.5 Text |
| C-1 `slate-500`/well | 4.81 → **5.03** | ≥4.5 Text |
| C-2 `warn-700`/well | 5.24 → **5.48** | ≥4.5 Text |
| C-3 `brass-700`/well | 4.91 → **5.13** | ≥4.5 Text (u. Fokus ≥3 Nicht-Text) |

Alle 48 WCAG-Pflichtpaare (hell+dunkel) grün; kein Paar sinkt (Backgrounds nur heller).
DUNKEL unverändert (dunkle Flächen nicht angefasst). Flächen-L-Leiter beide Modi grün.

## Tore / Beweise

- **`check:farbwelt`**: GRÜN — Fixpunkt-Hell auf `#FCFAF6` + Referenz-Hell-Werte
  deklariert nachgezogen (scharf, nicht entkernt). 48 WCAG-Pflichtpaare, 6 Referenzwerte,
  2 Fixpunkte, L-Leiter beide Modi. Die 8 beratenden Warnungen (brass-Chroma, danger-Riss)
  sind Bestand, unverändert.
- **golden `golden:vergleich`**: byte-gleich (reine CSS-Token-Fläche).
- **Gate** (`npm run gate`): tsc · vitest · golden · lint · check-parallel (30 Sub-Checks)
  — alle grün ausser `check:materialien` (2 Vernehmlassungen `fristEnde 2026-07-15 <
  heute 2026-07-16` — reine Daten-Staleness, **pre-existing**, mit gestashtem D-5-Diff
  identisch rot, **nicht in ci.yml**, ausserhalb der D-5-Fläche).
- **Reglement-Nachträge**: `DESIGN-REGLEMENT.md §F2b-Nachtrag D-5`, `-NORMTEXT §4b-B`,
  `FAHRPLAN-DESIGN-WAERME.md` D-5-Ausführungsvermerk (Übersteuerung deklariert).

## Screenshot-Serie (PNGs gitignored, via `node scratch-shots.mjs` gegen `npm run dev`)

30 PNGs: 5 Kernseiten (Startseite · /gesetze · Gesetz-Reader ZGB · Rechtsprechung ·
Rechner Verjährung) × Desktop(1280)+Mobil(390). NACHHER hell+dunkel; VORHER hell (dunkel
unverändert durch A38 → vorher==nachher). Dateimuster:
`<seite>__<desktop|mobil390>__<hell|dunkel>__<vorher|nachher>.png`.

Sichtprüfung: Seite/Karten/Wells sichtbar heller+weisser; brass-Hero (brass-100, kein
Surface-Token) korrekt unverändert; kein Layout-Bruch, CLS 0 (reine Ton-Token).
