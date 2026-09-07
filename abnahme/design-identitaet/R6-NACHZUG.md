# R6-Nachzug — Leser-Satzspiegel ohne Randspalten

**Runde** W2·24-DESIGN-IDENTITAET/R6b · **Datum** 6.9.2026 · **Branch**
`feat/w2-24-r6b` (ab `84eea666e` = Stand nach dem R6-Merge) · **Spec** D20 aus
der R2-Prüfung, (a)–(e).

**Auftrag David 6.9.2026 (wörtlich):** «der platz rechts und links neben dem
gesetz für bspw. rechner oder fassung nimmt viel platz vom gesetzestext weg.
kannst du das besser gestalten.»

Alles Gemessene stammt aus dem `dist/`-Preview des Worktrees
(`vite preview --port 4354`), Chromium/Playwright, warm, ohne CPU-Drossel,
eigener Browser-Kontext je Fall.

---

## 1 · Was gebaut ist

| Teil | Zusage der Spec | Stand |
|---|---|---|
| **(a)** | Marginalie links entfällt; Randtitel als kursive Literata-Zeile im Artikelkopf über der Artikelnummer, Fassungsdatum klein daneben | **gebaut** — `.lr7-kopf` / `.lr7-kopf-titel` / `.lr7-fassung`; Bild `r6b-1440-hell-randtitel.jpg` (ZPO 52: «*Handeln nach Treu und Glauben*» über «Art. 52», rechts «Fassung · Gilt seit 01.01.2025») |
| **(b)** | Bezüge-Randnotiz entfällt als Spalte; EINE Bezüge-Zeile unter dem Artikelkopf, Registerfarben-Marken, Zähler aus vorhandenen Daten, aufklappbar, Zustand gemerkt | **gebaut** — `parts/BezuegeKopf.tsx`, `<details>/<summary>`, `localStorage`-Schlüssel `lm.leser.bezuege-offen`; Bilder `…-or336c-zu.jpg` / `…-or336c-auf.jpg` |
| **(c)** | Lesespalte bekommt die Breite; 65–72 CPL; Lesetext 18 px; Zeilenhöhe 1.6 | **teilweise** — Breite ja (432 px Randspuren weg), CPL gemessen 63–66 @1440; **18 px und lh 1.6 NICHT gebaut**, Begründung in §4 |
| **(d)** | Split: dieselbe Form in beiden Panes | **gebaut** — beide Panes `data-lr-spiegel="zeile"`, gemessen in Leser+Leser und Leser+Entscheid, hell und dunkel |
| **(e)** | Druck: Randtitel im Kopf, Bezüge-Zeile ausgeblendet | **gebaut** — im Druckbild 403 sichtbare Randtitel im Kopf, **0** sichtbare Bezüge-Zeilen (92 im DOM), Gliederung 0 |

**Rückbau (§17-Gegengewicht).** Mit den Randspuren sind gestrichen: die Stufe
`'marg'`, die Schwellen `SPIEGEL_MIN_MARG`/`SPIEGEL_MIN_VOLL`, die Funktion
`spiegelMitAufweitung` und die R6/M1-Rahmenaufweitung FÜR die Randnotiz
(`randHoltPlatz`). Aufgeweitet wird wieder nur fürs Beiwerk-Blatt, wie vor R6.
`satzspiegel.ts` 151 → 99 Zeilen, `ArtikelLeser.tsx` 901 → 870.

---

## 2 · Messreihen

### 2.1 Satzspiegel und Zeilenmass (Methode `e2e/leser-lesemass.e2e.ts`)

| Fenster | Randspuren | Textspalte | Zeilenmass (ZGB · OR · VMWG · StPO · StGB) |
|---|---|---|---|
| 1440 vorher (R6, `voll`) | `150px 580px 210px`, `.lr-notiz` 137× | 580 px | 66 ch (R6-Protokoll §9) |
| **1440 nachher** | **keine** (`grid: none`, `.lr-notiz` 0×, `.lr-rand` 0×) | **591 px** | **66 · 64 · 63 · 64 · 66 ch** |
| 1280 nachher | keine | 591 px | 66 · 64 · 63 · 64 · 66 ch |
| 1024 nachher | keine | 548 px | 61 · 61 · 55 · 58 · 62 ch |

Kein waagrechter Überlauf in irgendeinem Fall (`scrollWidth − clientWidth = 0`).
Schriftstufe unverändert 17.00 px / lh 27.54 px (= 1.62) auf allen drei Breiten.

**Die 548 px @1024 sind NICHT der Randspalten-Rest**, sondern die statische
Blatt-Spur-Reserve aus `rahmenBild.lesemassMaxRem` (34.25 rem) — sie stand vor
R6b genauso. Wer sie schliessen will, entscheidet über `LESEMASS_MAX` bzw. die
Reserve, nicht über die Artikelform.

### 2.2 CLS des Tieflinks @390 (`/gesetze/bund/OR#art-336_c`, je 3 Läufe)

| Stand | Messwert |
|---|---|
| R6 (Protokoll §6.1) | 0.0431 · 0.0076 · 0.0431 |
| **R6b** | **0.0431 · 0.0431 · 0.0431** |

Unverändert im Streubereich — die Anker-Mechanik (`html[data-lr6-anker-warten]`)
ist nicht angefasst.

### 2.3 Split-View (@1440, hell und dunkel)

| Fall | `data-lr-spiegel` | Randspalten | Kopf-Form | Überlauf |
|---|---|---|---|---|
| Leser + Leser | `zeile` · `zeile` | 0 | 0 | 0 |
| Leser + Entscheid | `zeile` | 0 | 0 | 0 |

Beide Hälften tragen dieselbe Form — die Zusage (d) ist damit strukturell erfüllt
und nicht bloss beobachtet.

---

## 3 · Deklarierte Test-Änderungen (§6.3)

| Datei | Fall | Was sich ändert | Grund |
|---|---|---|---|
| `src/tests/leser-v3-rahmenspalten.test.ts` | «geschlossenes Blatt» | prüft wieder «keine Blatt-Spur, keine Aufweitung» | mit der Randnotiz fällt ihr Aufweitungs-Grund |
| `src/tests/leser-v3-rahmenspalten.test.ts` | «zu schmal für die Randnotiz» → «die Artikelform kippt an SPIEGEL_MIN_BREIT» | ersetzt: die alte Schwelle gibt es nicht mehr, die neue wird in BEIDEN Richtungen plus Handy und Pane geprüft | §6.7 |
| `e2e/leser-marken-geometrie.e2e.ts` | Ä61, OR 336c | Sonde überspringt `li` innerhalb `[data-such-meta]` | die «Rechnen»-Liste ist jetzt in der Bezüge-Zeile und damit innerhalb `.lr-text`; sie ist Bedienung, kein Wortlaut (§4.4) — derselbe Grund wie beim R6-Anker, neuer Ort |
| `e2e/gesetze-marginalie.e2e.ts` | Ä7-Blatt | `BLATT_FARBE` `rgb(43,41,36)` → `rgb(50,48,44)` | **Basis-rot mitgeheilt**, s. §5 |

Kein Fall wurde gelöscht, keine Absicht aufgegeben.

---

## 4 · Offengelegte Abweichungen von der Spec (§7)

**(c) «Lesetext 18 px» — nicht gebaut.** Die Grundgrösse des Lesetexts ist die
Typo-Stufe `leser-text` (`tailwind.config.js`, 1.0625 rem). Sie ist über den
Schriftregler an DREI Werte in `src/index.css` gekoppelt (`html[data-leserschrift=
"mittel"|"gross"|"sehr-gross"]`, Zeilen 904–906) und über `SCHRIFT_REM`
(`pages/gesetz-leser/leserSchrift.ts`) an deren Anzeige-Prozente 100 · 108 · 118 ·
130. Hebt man allein die Basis auf 1.125 rem, fällt die Stufe «mittel» (18.36 px)
praktisch mit der Vorgabe zusammen — aus 108 % werden 102 %, der Regler ist
kaputt. `src/index.css`-**Bestand** war in diesem Auftrag TABU (Fixer 1c baut
parallel darin), und ein zweiter, additiver Satz Stufenwerte am Dateiende wäre
genau die zweite Wahrheit, die §5 verbietet.

**Der Handgriff, der es einlöst** (vier Zeilen, alle in einem Commit):
`tailwind.config.js:195` `'leser-text': ['1.125rem', …]` · `src/index.css:904–906`
`1.215rem` / `1.3275rem` / `1.4625rem` (dieselben Faktoren 1.08 / 1.18 / 1.30) ·
`leserSchrift.ts` `SCHRIFT_REM` auf dieselben Zahlen. Danach rechnet
`--leser-zeilenmass` mit 18 px (Deckel 624 statt 591 px), das Zeilenmass in
Zeichen bleibt konstant — genau das leistet der zeichenbasierte Deckel.

**(c) «Zeilenhöhe 1.6» — belassen bei 1.62.** Massgeblich ist das freigegebene
Referenzbild (`vorschlag-freigegeben.html`, `.norm { line-height: 1.62 }`, §5
bindend). Der Unterschied ist 1.2 % (27.54 gegen 27.20 px); ihn zu ändern hiesse,
gegen den Massstab zu bauen und zwei Wächter ohne Gewinn nachzuziehen.

**(c) «65–72 CPL» — gemessen 63–66 @1440, 55–62 @1024.** Der bindende Deckel ist
`--leser-zeichen: 68` (`src/index.css`, ZEILENMASS-DECKEL): er RECHNET mit 68
Zeichen, die Tor-Methode MISST 63–66. Die Differenz steckt in der Konstante
`--leser-zeichenbreite: 0.4805` (mittlere Prosa-Zeichenbreite), die am dichtesten
Absatz kalibriert ist. Für die Untergrenze 65 müsste `--leser-zeichen` auf rund
70 nachkalibriert werden — eine Zahl im `index.css`-Bestand und ein
Haus-Entscheid, kein Nebeneffekt dieser Runde. @1024 ist die Spanne ohnehin
physikalisch nicht erreichbar: dort deckelt die Zelle (548 px), nicht die Zahl.

**Toter Bestand, den dieser Auftrag nicht räumen durfte.** Der Block
«W2·24-R4 · SATZSPIEGEL» in `src/index.css` (Regeln auf
`[data-lr-spiegel="marg"|"voll"]`, die zugehörigen `@media print`-Regeln und alle
`.lr-notiz*`) ist seit diesem Nachzug **tot** — `rahmenSpalten.ts` kennt die Werte
`marg`/`voll` nicht mehr, kein Selektor kann je greifen. Er steht nur deshalb
noch da, weil `index.css`-Bestand TABU war. Ein Hinweis darauf steht im
`.lr7-`-Block am Dateiende. Ersatzloser Rückbau = §17-Gegengewicht, eigener
Schritt.

---

## 5 · Rote Tore, die NICHT aus R6b stammen (Nullprobe, §0 Ziff. 3)

Verfahren: derselbe Worktree, `git checkout --detach 84eea666e` (kein R6b-Byte),
voller `npm run build`, derselbe Playwright-Lauf.

| Datei / Fall | auf R6b | auf `84eea666e` | Zuordnung |
|---|---|---|---|
| `leser-v3-kopfzeile` — 6 Fälle (Kopf bündig, Krume, Leerzone) | rot, «Kopf 64 → 129» | **rot, byte-gleich dieselben Meldungen** | die Ausgabe-Zeile aus R6/M10 schiebt den Leser-Kopf; Kopf-Hülle ist TABU (Fixer 1) |
| `leser-v3-kopf` — (d) Ä87 «genau EIN ✕» | rot | **rot** | dieselbe Fläche |
| `leser-v3-scrim-b7n1` — 4 Fälle | rot (`[data-leser-v3="rahmen"]` nicht gefunden) | **rot, 5 Fälle** (Obermenge) | Ansicht-Menü / Lade-Helfer der Datei; Menü-Hülle ist TABU (L2) |
| `gesetze-marginalie` — Ä7-Blatt | zuerst rot («Gewicht 500») | **rot, dieselbe Meldung** | R4/R6: der Randtitel lief im Satzspiegel auf `font-weight:500` |

Der letzte Fall ist in R6b **geheilt**, nicht nur gemeldet: die Breitform setzt
kein eigenes Gewicht mehr (Familie und Schnitt ja, Gewicht bleibt die Ä7-Stufe).
Dabei kam die zweite, jahrelang verdeckte Hälfte ans Licht — das Farb-Literal
`rgb(43,41,36)` war der `--ink-800`-Wert VOR der Farbrunde D12 (`f1cef1042`,
6.9.2026); seither steht das Token auf `#32302C = rgb(50,48,44)`. Sichtbar wurde
das erst, als die Gewichts-Zusicherung davor wieder grün war. Beide Hälften sind
im Test dokumentiert.

---

## 6 · Nachweis-Aufnahmen

`r6b-{1440,1024,390}-{hell,dunkel}-or336c-zu.jpg` ·
`r6b-{1440,1024}-{hell,dunkel}-or336c-auf.jpg` (Bezüge-Zeile aufgeklappt) ·
`r6b-{1440,1024,390}-{hell,dunkel}-kanton.jpg` (BS-640.100) ·
`r6b-1440-{hell,dunkel}-randtitel.jpg` (ZPO 52 — der (a)-Fall) ·
`r6b-1440-{hell,dunkel}-split-{leser-leser,leser-entscheid}.jpg` ·
`r6b-1440-druck.jpg`.

---

## 7 · Offene Punkte für den Fahrplan

1. **Lesetext 18 px** — der Vier-Zeilen-Handgriff aus §4, sobald
   `index.css`-Bestand wieder frei ist.
2. **`--leser-zeichen` nachkalibrieren** (68 → ~70), damit die gemessene
   Untergrenze wieder in der 65–72-Spanne liegt; mit Messreihe über dieselben
   sechs Erlasse.
3. **Toten R4-Satzspiegel-Block aus `index.css` räumen** (§4, letzter Absatz).
4. **`leser-v3-kopfzeile` / `leser-v3-kopf` / `leser-v3-scrim-b7n1`** — elf
   Basis-rote Fälle, Ursache in der Kopf- bzw. Menü-Hülle (TABU hier).
5. **«Materialien» in der Bezüge-Zeile** — unverändert offen, §15-Entscheid mit
   Messung (R6-Protokoll §2 Ziff. 5); der billige Weg bleibt eine ZÄHL-Datei je
   Erlass statt des vollen Shards.
