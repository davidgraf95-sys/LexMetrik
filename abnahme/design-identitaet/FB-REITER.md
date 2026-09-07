# FB · «Reiterleiste Überlauf @390» — Integrations-Fix

**Bau** 7.9.2026 · Worktree `w2-24-fb`, Branch `feat/w2-24-fb`, Basis `85daf2926`
**Anlass** zwei rote Fälle im vollen e2e-Lauf des Folge-Zweigs:
`w224-r13-reiter.e2e.ts:105` «R13-2 @390» (`scrollWidth 256 > 242`) und
`w224-r11-reiterleiste.e2e.ts:264` «M6 @390» (`248 > 242`). Beide waren nach
R13 (`4b8daa6ff`) grün.
**Massstab** alle Zahlen GEMESSEN (Chromium headless, gebautes `dist/`,
`vite preview :4419`).

## Der brechende Commit

`ce321f202` — «fix(ui): Reiter schrumpft wirklich (`min-w-0`)» (R8, 7.9.2026).
Er setzte `min-w-0` an drei Stellen in `Reiter.tsx`: an die beiden
`truncate`-Spans **und** an die Reiter-Hülle. Die Spans brauchten es (R8s
eigener Befund: /gesetze/kanton/ZH-211.11 @320, Kasten 171 px, Inhalt 283 px).
Die Hülle war der Schaden.

## Die Wurzel

`src/components/layout/reiterleiste/Reiter.tsx:150` (Stand `85daf2926`) gegen
`src/components/layout/reiterleiste/useReiterFenster.ts:88–104`.

R13-2 leitet die Zahl der nebeneinander stehenden Reiter aus **gemessenen
Kanten** ab — `ersterUeberlauf(kinder.map(k => k.offsetLeft + k.offsetWidth), w)`.
Das ist die Kante des **Kastens**. Sie ist nur dann zugleich die Kante des
**Inhalts**, wenn der Reiter einen Boden hat. `min-width: 0` sagt «dieser Reiter
darf 0 px breit sein»; damit passt der Kasten per Definition immer, und die
Rechnung wird nicht falsch, sondern **blind**.

**Rot-Beweis am Vorstand `85daf2926`** (@390, die acht Reiter der R13-Sonde):

| Grösse | Wert |
|---|---|
| Kante des letzten Kastens | 241 px = `clientWidth` → `ersterUeberlauf` = −1 |
| `data-reiter-fenster` | `0/8/8` — «+N» erschien nie |
| `scrollWidth` des Streifens | **256** (letzter Kasten 22 px, Inhalt 38 px: 218 + 38) |
| Breite jeder Beschriftung | **0 px** (alle acht) |
| je Reiter `scrollWidth − clientWidth` | 16 px Überstand |

Der Reihe nach: R8 nahm der Hülle den Boden → die Reiter wurden auf 22 px
gequetscht → ihr Inhalt stand daneben → der Streifen lief über, ohne dass die
Fensterrechnung etwas davon sah. Leser-G (versaler Seed) und die
D27-Lesestellung haben den Effekt nur sichtbar gemacht, nicht verursacht:
gemessen ist er auch ohne sie.

## Der Fix

`min-width` **statt** `min-w-0` an derselben Stelle — beide Sorgen mit einer Zahl.

| Datei | Änderung |
|---|---|
| `src/components/layout/reiterleiste/Reiter.tsx:165` | `min-w-0` → `rl-reiter` an der Hülle (die `min-w-0` der beiden `truncate`-Spans bleiben — das war R8s echter Fix) |
| `src/index.css` | Token `--app-reiter-min-b: 5rem` + Klasse `.rl-reiter { min-width: var(--app-reiter-min-b) }` |
| `src/components/layout/reiterleiste/useReiterFenster.ts` | Kommentar: worauf die Kantenmessung baut (kein Verhalten) |

**Warum 5rem = 80 px** (Messreihe 5 · 5.5 · 6 · 6.5 · 7 rem über zehn Fälle):
er trägt den Inhalt — ✕ 24 + Abstand 4 + Knopf-Polster 14 = 42 unkürzbare
Pixel, dazu 38 px, in denen ein Erlass-Kürzel ganz steht — und bleibt **unter**
jeder natürlichen Kürzel-Breite (ZGB 93 px), drängt also keinem kurzen Reiter
Leerraum auf. Ab 6rem wuchs der ZGB-Reiter auf 96/104/112 px (gegen R13-4) und
@390 standen nur noch zwei statt drei Reiter im Bild.

## Nachher (gemessen, gebautes `dist/`)

| Fall | `data-reiter-fenster` | Streifen | Reiter |
|---|---|---|---|
| 8 Reiter @390 | `5/3/8`, «+5» | 241/241 | 3 × 80 px, «ZPO» · «StGB» · «URG» ganz, 0 Überstand |
| 8 Reiter @320 | `6/2/8` | 171/171 | 2 × 80 px, 0 Überstand |
| 8 Reiter @1024 | `1/7/8` | 859/859 | natürliche Breiten |
| 8 Reiter @1440 | `0/8/8` | 1275/1275 | natürliche Breiten (OR 148 · ZGB 93) |
| 15 Reiter @390 / @320 | `11/3/15` / `12/2/15` | 241/241 · 171/171 | — |
| ZGB + BGE @1440 (R13-4) | `0/2/2` | — | ZGB **93 px** (< 110) |
| ZH-211.11 · ESTV-KS-DBG-49 · /vorlagen/nda · /rechner/zustaendigkeit, je 1 Reiter @320 | `0/1/1` | 171/171 | vorher 283 / 283 / 231 / 208 px Überlauf — **weg** |

Screens: `fb-reiter-390-8.jpg` · `fb-reiter-320-8.jpg` · `fb-reiter-390-15.jpg` ·
`fb-reiter-320-15.jpg`.

## Neue Sonde (§6.7 mit Rot-Probe)

`e2e/w224-r13-reiter.e2e.ts` — «FB — kein Reiter trägt mehr Inhalt, als sein
Kasten fasst» (@390 und @320). Sie bewacht genau das, was R13-2 stillschweigend
voraussetzt und was zwischen R13 und der Gesamtprüfung verlorenging: Überstand
je Reiter ≤ 1 px, Streifen ohne Überlauf, **und jede Beschriftung > 0 px**.
Die bestehenden Sonden sind unverändert (§6.3).

**Rot-Probe 7.9.2026** — der Hülle wieder `min-w-0` geben, neu bauen: 2/2 rot,
@390 `256 > 242`, @320 `193 > 172`.

## Nullprobe `kein-abschnitt.e2e.ts`

Das Tor ist auf `main` bereits rot (R8-REPORT-0, «NICHT FIXEN in dieser Runde»).
Isoliert gemessen, beide Seiten mit eigenem `dist/`:

| Stand | `gesamtFunde` | nicht erlaubt | davon Reiter |
|---|---|---|---|
| Vorstand `85daf2926` | 62 | 50 | 6 |
| mit diesem Fix | 62 | 50 | 6 |

**Identisch** — die Reiter-Einträge sind nicht gewachsen. Die verbleibenden
sechs sind alle derselbe Fall: `/rechtsprechung/bger_1B_278_2022` @320/@390,
`scrollWidth 217` gegen `clientWidth 171/212`. Das ist die **F6-Spannung** (die
Geschäftsnummer wird nie gekürzt), nicht die des Bodens: gemessen über alle fünf
Werte der Messreihe unverändert 217/171. Offen, ausserhalb dieses Fixes.

## Tore

| Tor | Ergebnis |
|---|---|
| `playwright w224-r13 + w224-r11 + w224-reiterverhalten + kein-abschnitt --repeat-each=2 --workers=2` | 238 passed, 2 failed = `kein-abschnitt` R8-REPORT-0 (auf `main` gleich rot, s. Nullprobe) |
| `npm run test` | 460 Dateien, 7454 Tests grün (exit 0) |
| `npx tsc -b` | exit 0 |
| `npm run lint` | exit 0 (1 Bestands-Warnung `useUniversalSuche.ts`) |
| `npm run check:schlankheit` | GRÜN, exit 0 |
