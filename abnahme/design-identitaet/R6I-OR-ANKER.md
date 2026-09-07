# R6I — «OR-Ankersprung ohne Layout-Sprung»: der Perf-Deckel war ein Schrift-Sprung

Nachzug zu W2·24-DESIGN-IDENTITAET, 7.9.2026. Anlass: `check:perf-lighthouse`
lief auf `main` rot (CI-Lauf 34086372353, Job «Perf-Budget»):

```
✗ /gesetze/bund/OR (≈930 KB HTML): CLS 0.057 > 0.05
```

**Antwort in einem Satz: der Sprung kam nicht vom Ankersprung und nicht vom
Erlass, sondern zweimal von den neuen Schriften — einmal, weil die prerenderte
Vorschau beim Swap neu umbrach, und einmal, weil ein seit R1 toter Bau-Schutz
den Lesetext-Webfont wieder auf `swap` liess.** Beides ist an der Wurzel
behoben, der Deckel ist grün (CLS 0.057 → 0.002), und der tote Schutz bricht
künftig den Bau, statt still zu verschwinden.

---

## 1 Messaufbau

- Zweig `fix/w2-24-or-cls-anker`, Basis `origin/main` @ `66721d325`
  (= W2·24 komplett), Worktree `.claude/worktrees/w2-24-cls`.
- **Produktions-Build** (`npm run build`) + `vite preview`, nie Dev-Server.
- **Tor-Messung** = `npm run check:perf-lighthouse` mit `PERF_RUNS=3`
  (Lighthouse-Mobil 412×823, Drossel 4× CPU + langsames 4G, frische
  Chrome-Instanz je Lauf, Median je Metrik) — dasselbe Script wie in CI.
- **Sonden-Messung** = Playwright/Chromium, Viewport 412×823 bzw. 1440×900,
  CDP `Emulation.setCPUThrottlingRate(4)`; die Netz-Drossel (langsames 4G,
  150 ms / 1.6 Mbit) ist je Messung ausdrücklich genannt, weil sie das
  Ergebnis bestimmt. `PerformanceObserver` auf `layout-shift`, `buffered: true`,
  nur `hadRecentInput === false`, mit Quellen-Knoten.
- Kadenz: **reines Laden, kein Scrollen** (Mess-Hygiene Ziff. 1, Skill `perf`).
- Es lief nichts daneben — kein zweiter Build, keine e2e-Suite (Bauregel 7).

---

## 2 Der Befund: EIN Ereignis trägt 97 % des Deckels

Aus dem Lighthouse-**Trace** (nicht aus der Summe geschlossen — die
`LayoutShift`-Ereignisse selbst, `PERF_RUNS=3`, drei Läufe byte-gleich
`CLS 0.0567`):

| t | score | Knoten | von → nach |
|---|---|---|---|
| 105 ms | **0.05502** | `<section>` der prerenderten Insel | `[0,179,412,644]` → `[0,154,412,669]` |
| 207 ms | 0.00136 | `div[data-reiter-streifen]` | `[52,64,344,16]` → `[16,64,264,33]` |

Der Rest ist < 0.0005. **Der Ankersprung kommt in dieser Liste nicht vor**, und
die drei anderen Tor-Routen sind unauffällig (Startseite 0.000, `/gesetze`
0.001, schwerste Kanton-Leserseite 0.002). Der Defekt sass also nicht im Leser
und nicht in der Grösse des OR, sondern in den 25 px, um die die prerenderte
Vorschau nach oben rutschte.

### 2.1 Woher die 25 px kamen

`#root > main` ist die **prerenderte Vorschau-Insel** (`src/lib/seo-detail.ts`),
die React beim Übernehmen komplett ersetzt. Sie ist nacktes HTML ohne
Designtokens und erbt darum `--font-sans` — seit W2·24-R1 **Archivo**.

Verfolgt man ihren Kopf über den Schrift-Swap (Playwright 412×823, Drossel 4×
+ langsames 4G):

| t | `document.fonts` | `<header>` | Provenienz-`<p>` |
|---|---|---|---|
| 1107 ms | `loading` | **179 px** | 102 px = **4 Zeilen** |
| 2280 ms | `loaded` | **154 px** | 77 px = **3 Zeilen** |

Die Provenienz-Zeile («OR · SR 220 · Stand 2026-01-01 · amtliche Fassung
(geltend) · gegen Fedlex-Konsolidierung geprüft am 05.09.2026 (maschinell) ·
nächste Fassung ab 01.10.2026») steht @412 dicht an einer Umbruchgrenze und
fällt beim Swap von vier auf drei Zeilen. Die metrik-angepasste
`'Archivo Fallback'` verhindert das **nicht**: `size-adjust` hält den
Zeilenkasten gleich, nicht die Laufweite je Glyphe — genau die Einschränkung,
die der Kopf von `vite.config.ts` seit 19.7.2026 für den Serif beschreibt.
Unter dem Kopf hängen 930 KB Normtext; die 25 px verschieben sie alle.

**Gegenprobe (dieselbe Lage, nur die Schriften abgebrochen):**

| Lauf | CLS | Ereignisse |
|---|---|---|
| mit woff2 | 0.1224 | 0.05502 @2292 ms · 0.00136 @3961 ms · 0.06572 @10019 ms |
| woff2 abgebrochen | 0.0674 | 0.00136 @3799 ms · 0.06572 @9920 ms |

Das 0.05502-Ereignis fehlt ohne Webfont vollständig. Der Swap **war** der
Sprung.

### 2.2 Die zweite, grössere Wurzel: ein Schutz, der seit R1 nichts mehr traf

`vite.config.ts` trug seit der A9-Forensik vom 19.7.2026 die Umschreibung
`serif-font-display-optional`: sie stellt `font-display: swap` des
**Lesetext**-Webfonts auf `optional`, weil ein 84-Zeichen-Ingress-Absatz auf dem
Linux-CI-Runner (kein Georgia/Charter) beim Swap deterministisch zweizeilig
umbrach — +30 px, CLS ~0.10 gegen ein Budget von 0.05, lokal auf macOS **nicht
reproduzierbar**.

Sie suchte dafür `@fontsource-variable/source-serif-4`. **W2·24-R1 hat den
Lesetext am 6.9.2026 auf Literata gestellt und `source-serif-4` aus
`package.json` entfernt** — seither traf die Bedingung keine einzige Datei mehr,
und der Serif lief wieder auf `swap`. Im gebauten CSS des `main`-Standes ist
Literata unter den `swap`-Fällen; der dokumentierte Schutz war ersatzlos weg,
ohne dass irgendetwas rot wurde.

Das ist die eigentliche Lehre dieses Nachzugs: **ein Schutz, der beim nächsten
Umbenennen still verschwinden kann, ist keiner** (§6.7/§17).

---

## 3 Was gebaut wurde

**(a) Die Vorschau-Insel schwenkt nicht mehr um** (`src/index.css`,
`@layer base`):

```css
#root > main, #root > main * {
  font-family: Arial, 'Liberation Sans', Arimo, system-ui, sans-serif;
}
```

Nur lokal auflösbare Familien — was nicht nachgeladen wird, kann nicht
umbrechen. CLS 0 ist damit eine Eigenschaft der Regel, keine Messglück-Frage.
Der Selektor ist exakt: nach der React-Übernahme ist das einzige Kind von
`#root` ein `div.min-h-screen` (gemessen auf `/`, `/gesetze`, `/rechtsprechung`,
`/gesetze/bund/OR`), die Regel kann also nichts treffen, was der Leser danach
sieht. Der `*`-Nachsatz ist nötig, weil `h1, h2, h3` eine eigene `font-family`
setzen und Vererbung gegen eine direkte Regel verliert.

*Verworfen: **Preload** der woff2.* Es verkleinert das Fenster, schliesst es
aber nicht — auf einem langsamen Netz bleibt der Swap möglich (§6.7).

**(b) Der Serif-Schutz zielt richtig und bricht laut** (`vite.config.ts`): das
Paket kommt aus einer Konstante `SERIF_PAKET`, und `buildEnd` wirft, wenn die
Umschreibung nie gegriffen hat.

---

## 4 Messwerte vorher / nachher

`npm run check:perf-lighthouse`, `PERF_RUNS=3`, identischer Aufbau:

| Route | vorher | nachher |
|---|---|---|
| **/gesetze/bund/OR** | **CLS 0.057** · LCP 9.54 s · TTI 9.54 s · Score 38 | **CLS 0.002** · LCP 5.11 s · TTI 8.74 s · Score 46 |
| Startseite | CLS 0.000 · LCP 9.03 s · Score 66 | CLS 0.000 · LCP 9.03 s · Score 66 |
| /gesetze | CLS 0.001 · LCP 5.41 s · Score 74 | CLS 0.001 · LCP 5.41 s · Score 74 |
| /gesetze/kanton/SO-614.11 | CLS 0.002 · LCP 7.02 s · Score 51 | CLS 0.002 · LCP 6.84 s · Score 53 |
| **Tor-Ausgang** | **Exit 1 — ROT** | **Exit 0 — GRÜN** |

Roh: `or.cls` 0.056656 → **0.002359**. Der LCP-Gewinn von 4.4 s auf der
OR-Seite ist eine Nebenwirkung von (b): ohne Swap-Phase blockiert der Lesetext
den grössten Textblock nicht mehr.

Im Bau nachgewiesen: `dist/assets/index-*.css` trägt jetzt 14× `font-display:
optional` (Literata) neben 6× `swap` (Archivo).

### 4.1 Der Ankersprung — der gemeldete Befund reproduziert nicht

Der Auftrag nannte eine Live-Beobachtung (Prod, 7.9.): `OR#art-336_c` lande bei
`top 433 px` statt an der Leselinie. **Auf diesem Stand gemessen trifft das
nicht zu** — gemessen wurde die Oberkante des Ziels nach dem Einschwingen:

| Lage | Netz | `#art-336_c` top | erwartet (`--nt-stick`) |
|---|---|---|---|
| @1440×900, Drossel 4× | ungedrosselt | **154 px** | 154 px |
| @1440×900, Drossel 4× | langsames 4G | **154 px** | 154 px |
| @412×823, Drossel 4× | ungedrosselt | **190 px** | 190 px |
| `ZGB#art-3` @1440 | ungedrosselt | 154 px | 154 px |

Der Sprung landet also auf beiden Breiten und unter beiden Netz-Lagen korrekt.
Die naheliegende Erklärung für die Live-Beobachtung ist der Stand, gegen den sie
lief: der W2·24-Deploy wurde erst mit PR #741 nachgeholt. **Ohne gesehenen
Fehlschlag wird hier nichts «repariert»** (§0 Ziff. 2) — der Fall bleibt als
Sonde bewacht (Abschnitt 5, Fall 2), damit ein echter Rückfall auffällt.

---

## 5 Wächter — und beide einmal rot gesehen (§6.7)

`e2e/w224-r6i-vorschau-schrift.e2e.ts`:

**Fall (1) — die Insel behält ihre Höhe über den Swap @412.** Die Spec blockt
die App-Bündel (sonst ersetzt React die Insel binnen Millisekunden, und der
Vergleich misst zweimal verschiedene Flächen) und hält jede Schrift-Antwort
1200 ms zurück (sonst ist die woff2 gegen einen lokalen Preview vor dem ersten
Paint da und der Defekt wäre unsichtbar). Gemessen wird die **Kopfhöhe**, nicht
ein CLS-Summenwert: eine Höhe ist an einer Stelle ablesbar und streut nicht.

> **Rot gesehen** (gebautes CSS auf `var(--font-sans)` zurückgestellt):
> `Vorschau-Insel bricht beim Schrift-Swap um: <header> 179 → 154 px`
> — dieselben Zahlen wie die Handmessung in 2.1.

**Fall (2) — der Tieflink landet nicht hinter der Kopf-Zone @1440.** Der erste
Bauversuch verglich die Ziel-Oberkante mit dem `scroll-margin-top` desselben
Elements. Das ist ein **Zirkel**: `scrollIntoView` richtet sich nach genau
diesem Wert, beide Seiten kommen aus derselben Variablen. Nachgewiesen — mit
verstellten Platzhalterhöhen (`contain-intrinsic-size: auto 1400px`) und mit
einer nach dem Sprung nachwachsenden Fläche oberhalb des Ziels blieb die Spec
grün. Sie vergleicht jetzt die Ziel-Oberkante mit der **gemessenen Unterkante
des klebenden Kopfes**; diese beiden Zahlen entstehen unabhängig voneinander,
und ihr Auseinanderlaufen (Risiko R1: der Kopf wächst, `--nt-stick` weiss nichts
davon) fällt damit auf.

> **Rot gesehen** (`[data-v3-kopf]{padding-bottom:80px}` im gebauten CSS):
> `Tieflink landet 154 px, der Kopf endet bei 235 px — 81 px des Artikels
> liegen hinter der Kopf-Zone`

**Der Bau-Schutz aus 2.2 — rot gesehen.** `SERIF_PAKET` auf den alten,
nicht mehr installierten Paketnamen gestellt (= exakt der Zustand, in dem
`main` steht):

> `npm run build` bricht mit Exit 1:
> `serif-font-display-optional hat nie gegriffen: unter
> '@fontsource-variable/source-serif-4' wurde keine CSS mit font-display: swap
> gefunden.`

Mit diesem Schutz hätte W2·24-R1 den Ausfall nicht still landen können.

---

## 6 Logikverlust-Bewertung (§15) — **keiner**

| Prüfpunkt | Befund |
|---|---|
| Inhalts-Treue (Normtext, Tabellen, Fussnoten) | unberührt — **kein Markup geändert**, weder in der Insel noch im Leser |
| Rechtsregel-Treue | unberührt — keine Engine, kein Wert, keine Frist berührt |
| Ctrl+F über das ganze Gesetz | unberührt — dasselbe DOM |
| `#art-…`-Anker und Deep-Links | unberührt, zusätzlich neu bewacht (Fall 2) |
| Print/PDF-Vollständigkeit | unberührt |
| Scroll-Spy, TOC, Split-View-Zustand | unberührt |
| Golden-Byte-Gleichheit | `golden:vergleich` und `check:golden-normtext` grün |

Geändert ist ausschliesslich **Ladeverhalten und Schriftwahl zweier Flächen**:

1. Die Vorschau-Insel erscheint in den ~1–4 s bis zur React-Übernahme in einer
   System-Sans statt in Archivo. Sie rendert ohnehin ohne Designtokens
   (nacktes `<header>/<h1>/<p>`, volle Breite) und wird danach vollständig
   ersetzt; Crawler und Screenreader lesen dasselbe DOM wie zuvor.
2. Der Lesetext zeigt auf dem **ersten** Aufruf den metrik-angepassten Fallback
   und ab dem gecachten Folgeaufruf Literata. Das ist exakt das Verhalten, das
   der Serif vor W2·24 hatte (dort mit Source Serif 4), und der offengelegte
   Preis von `font-display: optional`. Es ist damit eine **Wiederherstellung**,
   keine neue Abwägung — sollte W2·24 die Identität auch auf dem Erstaufruf
   wollen, ist das ein David-Entscheid mit dem hier gemessenen CLS-Preis.

---

## 7 Zwischenfall, der Arbeitszeit gekostet hat (§17)

Der erste Fix-Commit kam **nie im Bundle an**. Sein CSS-Kommentar enthielt ein
Glob-Muster mit der Zeichenfolge `*` `/`, das den CSS-Kommentar vorzeitig
schloss; `vite build` brach mit «Unknown word Sans», `dist/` blieb auf dem alten
Stand, und die Nachmessung ergab **byte-gleich** dieselbe Zahl wie die
Vormessung (`0.056656` beide Male).

Zwei Lehren, beide hier verankert:

1. **Byte-gleiche Nachmessung ist kein Ergebnis, sondern ein Verdacht auf einen
   nicht neu gebauten Stand.** Eine Messung, die auf die Nachkommastelle
   identisch ist, wird zuerst gegen das Artefakt geprüft (`grep` auf die neue
   Regel in `dist/assets/*.css`), nicht interpretiert.
2. **Der Exit-Code des Baus wird gelesen, nicht die letzten Log-Zeilen.** Der
   Fehlschlag stand im Log; abgefragt wurde er erst, als die Messung nicht
   passte.

---

## 8 Offene Punkte (nicht in diesem Zweig gebaut)

**(1) 68-px-Sprung beim Leser-Mount, nur auf langsamem Netz.** Gemessen
412×823, Drossel 4× + langsames 4G: ein Ereignis **0.06572** bei t ≈ 10 s.
`.lc-route` springt von `top 166` auf `98` px, sobald der V3-Leser mountet.
Die 68 px sind exakt `--leser-v3-kopf-luecke` (2rem = 32 px) +
`--leser-v3-app-band` (2.25rem = 36 px) — die beiden Masse, die `LeserKopf.tsx`
per negativem `margin-top` verschluckt. In den ~5.5 s davor steht dort die
`LadeAnzeige` (`inhalt-ansichten.tsx`), die `min-h-screen` reserviert, aber
diesen Vorgriff **nicht** kennt. Der Tor-Deckel sieht das nicht: Lighthouse
drosselt das Netz nur simuliert, gegen den lokalen Preview mountet der Leser
ohne Lücke (ungedrosselt gemessen: das Ereignis tritt gar nicht auf). Es ist
**kein W2·24-Rückschritt** — die Konstruktion stammt aus A-2 vom 17.8.2026.
Ein sauberer Fix müsste `--leser-v3-kopf-luecke` aus einer Quelle setzen, die
auch im Ladezustand gilt (heute hängt sie an `[data-leser-v3="rahmen"]`), sonst
entsteht ein zweiter Ort für dieselbe Zahl (§5). Gehört in einen eigenen
Schritt.

**(2) Reiter-Streifen, 0.00136.** Beim ersten Reiter fällt das führende «+» weg
(`leer`-Zustand, `Reiterleiste.tsx`), der Streifen rückt von x 52 auf 16 und
wächst 16 → 33 px hoch. Klein, aber vermeidbar, indem der Ruhezustand die
Endgeometrie schon reserviert. Berührt R11/R13-Bestandssonden — eigener Schritt.

**(3) Die Live-Beobachtung «433 px».** Siehe 4.1: reproduziert auf diesem Stand
nicht. Wenn sie auf dem nachgeholten Prod-Deploy erneut auftritt, ist Fall (2)
der Wächter, der sie fängt.

---

## 9 Tore

| Tor | Ergebnis |
|---|---|
| `npm run check:perf-lighthouse` (PERF_RUNS=3) | **GRÜN, Exit 0** — OR CLS 0.002 |
| `npm run build` | Exit 0 |
| `npx tsc -b` | Exit 0 |
| `npm run lint` | Exit 0 (1 Bestands-Warnung in `useUniversalSuche.ts`, unberührt) |
| `npm run test` | GRÜN — 460 Dateien, 7454 Tests, 2 übersprungen |
| `npm run golden:vergleich` | **IDENTISCH — 256 Fälle byte-gleich** |
| `npm run check:golden-normtext` | GRÜN — 60257 Knoten vollständig, 0 Waisen, 0 Ausnahmen |
| `npm run check:schlankheit` | GRÜN — 1486 Dateien, keine Neuzugänge |
| `npm run check:e2e-shards` | GRÜN — 138 Specs, Union deckungsgleich, JSON aktuell |
| `npm run check:design-tokens` | GRÜN — Typo-Skala sauber |
| `npm run check:farbwelt` | GRÜN — 146 WCAG-Paare (4 beratende Bestands-Warnungen) |
| e2e `leser-v3-kontext-cls` · `leser-r1-r2` · `gesetze-footer-cls` · `w224-leser-d32-d33` · `w224-reiterverhalten` · `leser-kopf-cls-s3` · **neu `w224-r6i-vorschau-schrift`**, `--repeat-each=2 --workers=2` | **78 passed** |

Der Bestands-Wächter `leser-kopf-cls-s3` misst denselben Tieflink
(`CLS Tieflink @390 (OR#art-336_c)`) und bleibt grün; die Kopf-Messung meldet
unverändert `cls@1280=0.00972` / `cls@390=0.00273`.
