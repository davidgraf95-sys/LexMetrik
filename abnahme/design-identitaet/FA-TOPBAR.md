# FA — Integrations-Fix Topbar + Kopfsuche (eine Wurzel, vier rote Fälle)

**Runde** W2·24-DESIGN-IDENTITAET/FA · **Datum** 7.9.2026 · **Branch**
`feat/w2-24-fa` (ab `85daf2926`) · **Anlass** vier rote Fälle im Folge-Lauf
nach dem Merge der zwölf parallelen Fixer (Shard-Gruppen 2 und 6).

Alles Gemessene stammt aus `npx playwright test` gegen den gebauten `dist/`
(`vite preview --port 4418 --strictPort`, Chromium, headless, warm).

---

## 1 · Die vier roten Fälle hatten EINE Wurzel

`src/index.css` · `.lc-topbar-griff` (Baustein GB-15, Fixer GB, `0127d914c`)

Der Baustein steht im GB-Block **ungeschichtet am Dateiende** — mit Absicht:
er muss `bg-surface` und `border-line` an seinen Aufrufern schlagen, und die
Layer-Ordnung entscheidet vor der Spezifität. Mitgenommen wurde dabei aber
`display: inline-flex`, und ungeschichtet schlägt das auch die
**Display-Utilities**, mit denen jeder einzelne Griff seine Sichtbarkeit
steuert: `hidden`, `lg:hidden`, `max-[480px]:inline-flex`. Alle drei
versteckten Griffe des Streifens standen dadurch auf **jeder** Breite im Bild.

| Sonde | Erwartet | Gemessen am Merge-Stand `85daf2926` |
|---|---|---|
| `e2e/w224-kopfsuche-d23.e2e.ts:74` — «kein Spalt zwischen Feld und Panel» @1024 | 0 | **44** |
| dieselbe @1440 | 0 | **44** |
| `e2e/topbar-kein-ueberlauf-320.e2e.ts:162` — «@320 öffnet die Lupe das Feld über die volle Streifenbreite» | ≥ 240 px | **176 px** |
| `e2e/topbar-kein-ueberlauf-320.e2e.ts:219` — «@500 stehen Logo und Verlauf-Trigger wieder im Streifen» | Lupe `hidden` | **visible** |

Lauf: `4 failed · 15 passed`.

Die 44 sind kein Zufallswert, sondern exakt `--tap-ziel-komfort` (2.75 rem):
die erzwungene Lupe umbrach im `role="search"`-Anker auf eine zweite Zeile, und
das Panel misst mit `top-full` ab der Anker-Unterkante, nicht ab der Feldkante.
Die 176 px @320 fehlen dem Feld, weil der **Nur-Desktop-Griff**
(`hidden lg:inline-flex`, Seitenleiste ein-/ausblenden) dort mit im Streifen
stand — sichtbar im Vorher-Bild als vierter Knopf neben ☰, § und 🔍.

## 2 · Nullprobe (§0 Ziff. 3) — der Defekt liegt an GB, nicht auf main

Beide Sonden sind seit `018b41a37` **byte-gleich**; `git diff --stat 018b41a37
HEAD -- e2e/w224-kopfsuche-d23.e2e.ts e2e/topbar-kein-ueberlauf-320.e2e.ts`
gibt nichts aus. Es kann also keine Sonde «gealtert» sein.

Dieselben Sonden, derselbe Rechner, derselbe Port, gegen einen Build von
`018b41a37` (vor GA/GB/KF): **19/19 grün, Exit 0.**
Gegen `85daf2926`: **4 failed / 15 passed.** Damit ist der Defekt der
Integration von GB-15 zugeordnet und nicht dem Stand auf `main`.

## 3 · Der Fix ist ein Produkt-Fix (§6.3) — keine Sonde angefasst

Der **Grundriss** (`display` plus seine beiden Ausrichtungen) zieht nach
`@layer components` und verliert damit gegen jede Display-Utility — genau das,
was ein Baustein tun soll. Die **Aussage** von GB-15 (kein Rahmen, keine
Füllung, 44-px-Tap-Fläche, Zustand über Tinte und Unterstrich) bleibt
ungeschichtet und unverändert stark; dafür war die Ungeschichtetheit gedacht.
Für Tailwind 3 ist die textuelle Position von `@layer components` belanglos —
die Regel wandert an die Stelle von `@tailwind components` (Z. 2), also vor die
Utilities. Griffe **ohne** eigene Display-Utility (☰, `ThemaUmschalter`,
`SprachUmschalter`) beziehen `inline-flex` weiterhin aus dem Baustein.

Kein Zielbild wurde umdeklariert; keine Sonde galt als «absichtlich ersetzte
Anatomie». `Topbar.tsx`, `HeaderSuche.tsx`, `ThemaUmschalter.tsx` und
`SprachUmschalter.tsx` blieben unverändert — die Wurzel lag in einer einzigen
CSS-Deklaration, und vier Dateien nachzuziehen hätte sie nur verteilt.

## 4 · Kein neues Tor (Rückbau vor Bewachung)

Die beiden bestehenden Sonden haben diesen Regress von sich aus rot gemeldet.
Sie **sind** der Wächter; ein zusätzliches Tor über dieselbe Aussage wäre eine
zweite Stelle für dieselbe Sorge (§17 Gegengewicht).

## 5 · Tore

| Tor | Ergebnis |
|---|---|
| `npx playwright test` (D23 · Topbar@320 · Kopfsuche-Esc · GB-Register, `--repeat-each=2 --workers=2`) | **120 passed**, Exit 0 |
| `npm run test` | **460 Dateien · 7454 Tests grün** (2 skipped), Exit 0 |
| `npx tsc -b` | Exit 0 |
| `npm run lint` | Exit 0 (1 vorbestehende Warnung in `useUniversalSuche.ts`, nicht berührt) |
| `npm run check:design-tokens` | Exit 0 — «Token-Schranke ok» |
| `npm run golden:vergleich` | Exit 0 — «IDENTISCH — 256 Fälle byte-gleich» |

## 6 · Bilder

| Datei | Zeigt |
|---|---|
| `fa-320-ruhe.jpg` | @320 Ruhezustand: ☰ · § · 🔍 · ◐ · DE ▾ — der Nur-Desktop-Griff ist wieder weg |
| `fa-320-lupe-offen.jpg` | @320 nach dem Lupen-Tap: das Feld nimmt den Streifen, ✕ führt zurück |
| `fa-500-streifen.jpg` | @500: Feld steht selbst im Streifen, keine Lupe davor |
| `fa-1440-panel.jpg` | @1440: Panelkante = Feldkante, kein Spalt |

## 7 · Offen

Nichts aus diesem Zweig. Der Fix ist auf `feat/w2-24-fa` gepusht; **kein PR,
kein Merge** — Landung ist ein eigener Auftrag nach der Gegenprüfung.
