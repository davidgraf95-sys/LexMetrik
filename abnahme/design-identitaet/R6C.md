# R6c — Leser-Nachzug: Lesekomfort, Links, Adressen, Zähl-Datei

**Runde** W2·24-DESIGN-IDENTITAET/R6c · **Datum** 6.9.2026 · **Branch**
`feat/w2-24-r6c` (ab `2a18f97bb` = Stand nach dem R6b-Merge) · **Spec** die acht
Punkte des Nachzugs (R6-NACHZUG §7, Prüfer-R6 P3/P8/Zähl-Datei, D21-Nebenfund).

Alles Gemessene stammt aus dem `dist/`-Preview des Worktrees
(`vite preview --port 4364`), Chromium/Playwright, warm, ohne CPU-Drossel,
eigener Browser-Kontext je Fall.

---

## 1 · Was gebaut ist

| Punkt | Zusage | Stand |
|---|---|---|
| **(1)** | Lesetext 18 px, Schriftregler neu kalibriert | **gebaut** — `leser-text` 1.125 rem, Stufen 1.215 / 1.3275 / 1.4625 (Faktoren 1.08/1.18/1.30 unverändert, Anzeige 100·108·118·130 %) |
| **(2)** | `--leser-zeichen` 68 → 70, CPL 65–72 @1440/@1280 | **gebaut** — gemessen 67 · 67 · 68 · 68 · 68 ch |
| **(3)** | toter R4-Satzspiegel-Block raus | **gebaut** — 118 Zeilen + 4 print-Regeln ersatzlos |
| **(4)** | 11 basis-rote e2e-Fälle | **geklärt** — 6 Sonden anatomie-neutral, 4 per Wurzel-Fix, 3 als Last-Artefakt gemeldet |
| **(5)** | P3 Inline-Textlinks unterstrichen | **gebaut** — eine Regel in `index.css`, Kontrast gemessen |
| **(6)** | P8 Gliederung als `<a href="#art-…">` | **gebaut** — ⌘-Klick öffnet nachweislich einen neuen Reiter |
| **(7)** | Zähl-Datei je Erlass | **gebaut** — 312 Dateien, 88.2 KB gesamt, ø 289 B |
| **(8)** | D21 CLS der Gliederung | **gebaut** — 0.0746 → 0.0006 |

---

## 2 · Messreihen

### 2.1 Zeilenmass und Schriftstufe (Methode `e2e/leser-lesemass.e2e.ts`)

| Fenster | ZGB | OR | StGB | StPO | VMWG | BS-640.100 | Textkörper |
|---|---|---|---|---|---|---|---|
| **@1440** | 67 | 67 | 68 | 68 | 68 | 56 | 640 px |
| **@1280** | 67 | 67 | 68 | 68 | 68 | 56 | 641 px |
| @1024 | 58 | 59 | 58 | 58 | 51 | 49 | 548 px |
| @390 | 37 | 35 | 41 | 34 | 32 | 33 | 350 px |
| *R6b (17 px, Deckel 68)* | 66 | 64 | 66 | 64 | 63 | 56 | 591 px |

Fliesstext durchgehend **18.00 px / lh 29.16 px (= 1.62)**.

**BS-640.100 trägt keine Untergrenze** (offengelegt, §8): seine 56 ch sind keine
Aussage über die Spalte — sie ist bei allen sechs Erlassen gleich breit —,
sondern über die ABSATZFORM. Die Methode rechnet `Textlänge / Zeilenkästen`, und
kantonale §-Absätze enden häufig mit einer halb gefüllten Zeile. Eine Untergrenze
gegen ihn bewachte die Absatzform, nicht den Satzspiegel.

**Mobil-Boden 34 → 31 ch** — die rechnerische Folge der grösseren Type auf
physikalisch unveränderten 350 px, nicht eine Aufweichung. Schlechtfall der
Torliste ist VMWG 32; der Boden liegt 1 ch darunter (dieselbe Regel, nach der 34
entstanden ist).

### 2.2 Links im Leser (Methode: computed `text-decoration-line` an allen `a[href]` in `.lc-leser`, OR#art-336_c @1440)

| | vorher | nachher |
|---|---|---|
| Links gesamt | 6'291 | 6'275 |
| unterstrichen | 380 | 2'818 |
| ohne Strich **ohne** erklärte Ausnahme | 3'673 | **0** |

Kontrast der unterstrichenen Links, hell / dunkel: 14.68 · 13.90 · 5.35 : 1 /
13.30 · 11.91 · 5.32 : 1 — alle über 4.5.

### 2.3 D21 · CLS des Tieflinks (`OR#art-336_c` @1440, je 3 Läufe)

| Stand | CLS gesamt | davon im `[data-toc]` | nach dem ersten Bild (> 1 s) |
|---|---|---|---|
| vorher | **0.0746** | 0.0741 | 0.0741 |
| nachher | **0.0006** | 0.0000 | 0.0000 |

Ursache gemessen, nicht vermutet — Zustand des Baums über die Zeit:
t = 600 ms · 18 Zeilen / 1042 px · aktiv «Zweite Abteilung» ·
t = 1400 ms · 62 Zeilen / 2285 px · aktiv «a. durch den Arbeitgeber».
Der Verdacht aus dem Befund (`tocAutoZuklappen.ts`) trifft NICHT zu: es wird kein
Ast geschlossen, sondern einer geöffnet.

### 2.4 Zähl-Datei

| | Wert |
|---|---|
| Dateien | 312 (313 Erlasse geprüft; einer ohne jede Kante bekommt keine Datei) |
| Gesamt | **88.2 KB**, ø **289 B**, grösste **5.8 KB** (OR, 469 Artikel) |
| Ersparnis am OR | statt 2.2 MB roh / 300 KB gzip Bezugs-Shard |
| `check:perf-budget` | grün, entry 59.7 KB gzip (Budget 60.0) |

Netzwerk-Sonde an `OR#art-336_c` und `ARG#art-15_a`: über die Leitung geht **nur**
`bezuege-zaehler/<KEY>.json` — kein Bezugs- und kein Materialien-Shard.

---

## 3 · Deklarierte Test-Änderungen (§6.3)

| Datei | Was sich ändert | Grund |
|---|---|---|
| `leser-typo-tokens.test.ts` | `leser-text` 1.0625rem → 1.125rem | D20 (c); bindet weiter an EINEN Wert |
| `leser-schriftskala.test.ts` | `SCHRIFT_REM.normal` 1.0625 → 1.125 | dieselbe Entscheidung, zweite Klammer |
| `leser-v3-schriftskala.e2e.ts` | `STUFEN_PX` 17/18.36/20.06/22.1 → 18/19.44/21.24/23.4 | nur die Basis wandert, die Faktoren nicht |
| `leser-lesemass.e2e.ts` | 17 → 18 px, lh 27.54 → 29.16; T-1C von «≤ 70 ch @1440» auf «65–72 ch @1440 UND @1280» + erwartete Textkörperbreite; Mobil-Boden 34 → 31 | **strenger**: eine zweite Kante und ein zweites Fenster kommen hinzu |
| `leser-v3-kopfzeile.e2e.ts` | Bezugspunkt Topbar → Unterkante des CHROME-STAPELS; «Chrome bis zur Lesefläche» → EIGENHÖHE des Leser-Kopfs; ✕-Zähler ohne das ✕ der Reiter | die Anatomie hat sich geändert (Arbeitsleiste R2/D19, Ausgabe-Zeile R6/M10) — die Sonde wird anatomie-NEUTRAL statt blind |
| `leser-v3-kopf.e2e.ts` | ✕-Zähler ohne das ✕ der Reiter | dasselbe; die Zusage «genau EIN ✕, das des Blatts» bleibt wörtlich |
| `leser-v3-scrim-b7n1.e2e.ts` | PFAD OR → BGBM | **Wurzel-Fix**, s. §4 |
| `leser-toc-sprung` · `leser-ruecksprung-r5-r7` · `leser-spy-w25d` · `leser-gliederung-a33` · `toc-auto-zuklappen-w219.test.ts` | `button[title]` / `button[data-toc-aktiv]` → `:is(a, button)[…]` | P8: die Sprung-Zeile ist ein `<a>` |
| `leser-lesereihenfolge-k1a.test.tsx` | Modell-Doppel bekommt `bezuegeZaehler: () => undefined` | ohne den Eintrag stürzt der Renderer ab, statt die Reihenfolge zu messen |

Kein Fall gelöscht, keine Absicht aufgegeben.

## 3.1 · Neue Wächter, jeder einmal rot gezeigt (§6.7)

| Wächter | Rot-Beweis |
|---|---|
| `leser-lesemass` T-1C Untergrenze | `--leser-zeichen: 60` → «ZGB @1440: 58 ch (555px) muss ≥ 65 sein» |
| `e2e/leser-links-p3.e2e.ts` | Regel entfernt → «Amtliche Fassung ↗, ⬇ Amtliches PDF, SR 950.1, Verjährung …» |
| `e2e/leser-gliederung-p8.e2e.ts` | `href` entfernt → «nur 0 von 18 Zeilen sind Links» + Timeout am ⌘-Klick |
| `leser-kopf-cls-s3` D21-Fall | frühes `return` im Effekt → «Verschiebung im Gliederungsbaum: 0.0741» |
| `check:bezuege-zaehler` | eine Zahl verstellt → «OR: Zahlen abgewichen» |
| `e2e/leser-bezuege-zaehler.e2e.ts` | Prop `zaehler` entfernt → `[data-reg="m"]` nicht gefunden |
| `src/tests/bezuege-zaehler.test.ts` | 4 Fälle, je mit Leer-Treffer-Schutz |

**GEGENPROBE, die NICHT trägt** und darum im Fall dokumentiert ist: beim
D21-Wächter bleibt `useLayoutEffect` → `useEffect` grün. Der Gewinn liegt am
ZEITPUNKT der Ursache, nicht am Effekt-Typ.

---

## 4 · Die elf basis-roten Fälle (Punkt 4) — Nullprobe zuerst

Verfahren (§0 Ziff. 3): derselbe Worktree, `git checkout --detach 2a18f97bb`
(kein R6c-Byte), voller Build, derselbe Lauf. **Und: die Messbedingung
entscheidet, welche Fälle rot sind.**

| Lauf | rot |
|---|---|
| Basis, 5 Worker | 13 — a11y «Kopf-Suche», ruecksprung R5, spy H6-a, kopf (d), 5× kopfzeile, 4× scrim |
| Basis, seriell | 7 — dieselben ohne 3 der 4 scrim-Fälle |

Drei Befunde, drei Antworten:

**(A) Sechs deterministische — die Sonde misst gegen eine Anatomie, die es nicht
mehr gibt.** Gemessen: Topbar 0–64 · **Arbeitsleiste 64–98** (R2/D19) ·
**Ausgabe-Zeile 98–129** (R6/M10, D8) · Leser-Kopf 129–186. Die Lücke zum
Nachbarn ist **0 px** auf allen drei geprüften Seiten — der Kopf klebt weiterhin
bündig, die Sonde verglich nur mit der Topbar, die seit R2 nicht mehr sein
Nachbar ist. Nachgezogen wie in §3; Eigenhöhe 57 px @1440 / 93 px @390 gegen die
Schranken 59 / 95 (2 px Reserve bleiben).

**(B) Vier Scrim-Fälle — Wurzel-Fix (§17), keine Anpassung.** Sie rissen an
`leserBereit` («element(s) not found» nach 20 s), waren aber einzeln grün.
Gemessen: die Datei lief auf dem OR, dessen vorgerenderte Seite **8.75 MB** HTML
liefert gegen **144 KB** bei BGBM (Faktor 60). Der Scrim hängt am Menü, nicht am
Gesetzestext → PFAD BGBM (alle vier Haken der Datei dort je 1× vorhanden).
Ergebnis 7/7 grün seriell UND unter 5 Workern. Präzedenz: derselbe Erlass, dasselbe
Argument seit 4.7.2026 in `leser-lesemass.e2e.ts`.

**(C) Drei, die nur unter Last reissen — gemeldet, NICHT angefasst.**
`leser-ruecksprung-r5-r7` R5-Chip (154 statt < 140 px) und `leser-spy-w25d` H6-a
sind basis-rot. `leser-v3-kopf` A9 (5100 statt < 5000 ms, 3/3 grün seriell) und
`leser-kopf-cls-s3` @1280/@390 (CLS 0.064 / 0.055, 3/3 grün seriell) verletzen im
5-Worker-Lauf die Messbedingung, die die CLS-Datei selbst nennt («warm, ohne
CPU-Drossel, eigener Browser-Kontext je Fall»).

---

## 5 · Rückbau (§17-Gegengewicht)

Der R4-Block «SATZSPIEGEL: MARGINALIE · NORMTEXT · RANDNOTIZEN» in `index.css`
ist ersatzlos gestrichen — 118 Zeilen plus vier `@media print`-Regeln.
**Beweis, dass kein Selektor mehr greifen konnte:** `v3/satzspiegel.ts` kennt
seit R6b nur noch die Werte `'zeile'` und `'breit'`; `marg`/`voll` existieren
nirgends mehr, und die vier Variablen `--lr-marg` / `--lr-notiz` / `--lr-rinne` /
`--lr-textmass` wurden ausserhalb des Blocks nie gelesen. Stehen geblieben sind
`.lr-text` und `.lr-reg`, die auch die Zeilenform braucht. Der «erledige
das»-Hinweis im `.lr7-`-Block ist abgehakt.

Mitgezogen: `leserV3Modell.ts` war mit dem D21-Effekt auf 484 Zeilen gewachsen
(§6.6-Grenze 420). Der Effekt steht jetzt als `v3/tiefLinkZweig.ts` und wird von
`useSektionSprung` angeschlossen, wo er hingehört (er IST ein Sprung); das Modell
ist wieder bei 419 Zeilen.

---

## 6 · Nachweis-Aufnahmen

`r6c-1440-{hell,dunkel}-or336c.jpg` · `r6c-390-{hell,dunkel}-or336c.jpg`
(18-px-Lesetext, Bezüge-Zeile «11 Entscheide · 1 Rechner», unterstrichene
Inline-Verweise) · `r6c-1440-hell-arg-materialie.jpg` (die Rubrik «1 Materialie»,
die es vorher nicht gab) · `r6c-1440-hell-kanton.jpg`.

---

## 7 · Offene Punkte für den Fahrplan

1. **`istRisikoPfad()` kennt die neue Projektion nicht.** `scripts/gen-bezuege-
   zaehler.ts` und `public/verzahnung/bezuege-zaehler/` fallen nicht unter die
   Risiko-Zweige (die Liste nennt `scripts/verzahnung/` und
   `public/verzahnung/artikel-revisionen/`). Sachlich ist die Zähl-Datei eine
   committete Projektion derselben Extraktion. Vorschlag: beide Pfade in
   `scripts/gegenpruefung/kern.ts` ergänzen — NICHT hier gemacht, weil die Datei
   Prüflogik ist und mehrere Agenten parallel an derselben Runde bauen.
2. **`scripts/datenhaltung/suche-rang.test.ts`** reisst unter Parallel-Last das
   95-s-`beforeAll` (einzeln 18/18 grün in 12 s) — dieselbe Klasse wie der schon
   verzeichnete Fall an `suche.test.ts`. Wurzel-Fix (Hook-Timeout oder
   Index-Fixture) bleibt offen.
3. **Die drei Last-Artefakte aus §4 (C)** — kein Fix, aber ein Ort, an dem
   festgehalten ist, unter welcher Messbedingung sie gelten.
