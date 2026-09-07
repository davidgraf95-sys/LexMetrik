# R4 «Gesetzesleser» — Bau-Protokoll (W2·24-DESIGN-IDENTITAET)

**Erhoben:** 6.9.2026, aus dem Worktree-Preview (`vite preview --port 4334`,
gebautes `dist/`), Chromium, Viewport 1400 bzw. 390 px. Alle Zahlen gemessen,
nicht geschätzt (§7). Zweig `feat/w2-24-r4-leser`, abgezweigt von `0aa7e3244`.

---

## 1 · Was gebaut ist

| Punkt (Auftrag / Referenzbild) | Stand |
|---|---|
| Satzspiegel: Marginalie links (150 px), Normtext, Randnotizen rechts (210 px), Rinnen 36 px | gebaut |
| Marginalie: Randtitel kursiv in der Lese-Serife, Registerfarben-Strich, Fassungsdatum | gebaut |
| Randnotizen rechts mit Registerfarben-Köpfen, aus `useBezuege` | gebaut, **zwei Rubriken fehlen datenbedingt** (§4) |
| Normtext Literata 17 px / **1.62** / ≤ 62–66 ch | gebaut |
| Fällt im Pane und schmal in die Zeilen-/Panel-Form zurück | gebaut, gemessen (§3) |
| Druck fällt in die Zeilenform | gebaut (nach einem Bug-Check, §5) |
| `--app-kopf-h` als geteiltes Token, Arbeitsleiste klebt | gebaut, gemessen 64 + 34 px |
| Gliederung, Sprungziele, Verlauf, Fussnoten, Historie, Panels, Schriftskala, Pane-Verhalten | unverändert (Golden byte-gleich, 442/443 Testdateien grün) |

---

## 2 · Die drei Ausbaustufen und woran ihre Schwelle hängt

Die Stufe steht als `data-lr-spiegel` an der **Lese-Zelle**
(`v3/LeserLeseZeile.tsx`) und wird in `v3/satzspiegel.ts` aus deren Breite
gerechnet:

| Stufe | ab Lese-Zelle | was steht |
|---|---|---|
| `zeile` | — | Ist-Form: Randtitel als Zeile über dem Artikel, Bezüge darunter |
| `marg` | 45.625 rem = 730 px | Marginalie links |
| `voll` | 61 rem = 976 px | zusätzlich Randnotizen rechts |

**Abweichung vom Fahrplan §6 (c), offengelegt (§7).** Der Fahrplan nennt
`@3xl/pane` (48 rem) als Schwelle. Das ist die Breite des Pane-Scrollers; die
Lese-Zelle ist um die Gliederungsspur (18 rem als Spalte, 2.25 rem als Schiene)
und die Blatt-Spur (22 rem) schmaler. Eine Schwelle auf die Pane-Breite wäre bei
offener Gliederung um 19.25 rem zu grosszügig — der Spiegel spränge auf, wo dem
Text keine 30 ch blieben. Absicht des Fahrplans unverändert, Massstab präziser.

**Die Textbreite, die die Schwelle einfordert, kommt aus dem Referenzbild, nicht
aus dem Ist-Deckel.** Erster Ansatz waren 37 rem = die 591 px, die der
Zeilenmass-Deckel dem Text heute gibt. Gemessen ist die Lese-Zelle des OR @1400
bei offener Gliederung aber **764 px** — mit Marginalie und Rinne (186 px)
hätte diese Schwelle 777 px gebraucht und den Spiegel in der Vorgabelage des
häufigsten Fensters um 13 px verfehlt: gebaut, aber nie zu sehen. Massgeblich
ist darum `.norm { max-width: 62ch }` des freigegebenen Referenzbildes; 62
Zeichen sind in den Einheiten von `--leser-zeilenmass` 33.9 rem, aufgerundet
`TEXT_SOLL = 34`. Der Text WIRD dabei nicht verengt — sein Deckel bleibt der
unveränderte `min(--leser-lesemass-max, --leser-zeilenmass)`.

---

## 3 · Messreihe

### Satzspiegel (OR bzw. SchKG, Chromium, warm)

| Lage | Lese-Zelle | `grid-template-columns` | Stufe |
|---|---|---|---|
| @1400, Gliederung als Spalte | 764 px | `150px 578px` | `marg` |
| @1400, Gliederung als Schiene | 1016 px | `150px 584px 210px` | `voll` |
| @1400 Split-View, zwei Panes | — | kein Grid | `zeile` |
| @390 | — | kein Grid | `zeile` |

### Zeilenmass (Methode `e2e/leser-lesemass.e2e.ts`: längster mehrzeiliger Absatz, Textlänge / Zeilenkästen)

| Erlass | @390 | @720 | @1400 `marg` | @1400 `voll` |
|---|---|---|---|---|
| OR | 37 | 67 | **64** | 64 |
| StPO | 36 | 64 | **64** | 64 |
| ZGB | 37 | 66 | **64** | 66 |
| SchKG | 36 | 66 | **63** | 63 |
| ZPO | 37 | 66 | **62** | 66 |
| BS-640.100 | 33 | 56 | **56** | 56 |

Auftragsgrenze ≤ 75 ch in allen 24 Fällen eingehalten; WCAG-Decke 80 ch
ebenfalls. Fliesstext gemessen 17.00 px / 27.54 px Zeilenhöhe = **1.62**
(≥ 1.5, SC 1.4.8).

### Waagrechter Überlauf

`scrollWidth === clientWidth` in allen 13 Nachweis-Aufnahmen, hell und dunkel,
@1400 und @390 — auch in den beiden Split-View-Fällen.

### App-Krone

| Messung | Wert |
|---|---|
| Titelblatt-Zeile (`--app-krone-h`) | 64 px |
| Arbeitsleiste (`--app-reiter-h`) | **34 px**, exakt der gesetzte Token-Wert |
| Oberkante der klebenden Arbeitsleiste nach dem Anker-Sprung | 64 px (klebt) |
| `#art-336_c` nach dem Sprung | y = 154 px, Leser-Kopf-Unterkante 155 px |

### Füllgrad der Marginalie (warum das Fassungsdatum dorthin gehört)

Von den Artikeln eines Erlasses tragen einen **Randtitel** / eine **Fassungs-Zeile**:

| Erlass | Artikel | Randtitel | mit Fassungs-Zeile in der Marginalie |
|---|---|---|---|
| OR | 1686 | 10 | **550** |
| ZGB | 1277 | 11 | **517** |
| SchKG | 404 | 2 | **293** |
| ZPO | 430 | 403 | 415 |

Ohne die Verlagerung stünde die Marginalie im Referenz-Erlass des Bildes (OR)
in 99 % der Artikel leer. Verlagert wird der Slot samt `data-hist-slot`; der
Schalter «Änderungsvermerke» und die 24-px-Reserve (`min-h-beiwerk`) bleiben.
In der Marginalie kann die Reserve zudem nichts mehr schieben — die Artikelhöhe
kommt aus der Textspalte.

---

## 4 · Nicht gebaut, mit Grund (§8 statt stiller Lücke)

* **«Materialien» und «Rechnen» in der Randnotiz.** Das Referenzbild zeigt vier
  Rubriken. Der ARTIKEL führt nur zwei davon: Entscheide (`useBezuege`) und
  Verweise (aus dem Wortlaut aufgelöst). Materialien und Rechnen sind
  Panel-Daten (`v3/PanelMaterialien`, `v3/PanelAnwendung`); sie in die Randspalte
  zu holen hiesse, am Artikel einen zweiten Ladepfad zu eröffnen — genau das
  verbietet der Auftrag («keine neue Bezüge-Logik», Fahrplan §6 (e)). Ein leerer
  Rubrik-Kopf wäre eine Zusage ohne Deckung. Beide bleiben im Beiwerk-Blatt
  erreichbar; ihre Aufnahme ist ein eigener, deklarierter Schritt.

* **Absatznummern als hochgestellte `sup`** (Referenzbild `.norm sup`). Bei uns
  ist die Absatznummer kein Satzzeichen, sondern ein **Kopier-Knopf** mit
  Mindest-Trefferfläche (WCAG 2.2 SC 2.5.8, 24 px). Sie auf 11 px hochzustellen
  nähme ihr diese Fläche. Die geprüfte Zusage schlägt die Referenz-Optik (§1);
  typografisch ist sie bereits auf die leise Stimme gebracht
  (`text-body-s`, `font-medium`, `ink-500`).

* **Fassungs-Zeile rechtsbündig.** Die Randtitel fluchten rechts, die
  Fassungs-Zeile nicht. `text-align: right` erreicht sie nicht — der Chip liegt
  in einem Flex-Container zwei Ebenen tiefer im Slot. Zwei CSS-Versuche liessen
  die gemessene linke Kante unverändert bei 472 px (Rand-Spalte 472–622 px,
  SchKG 57a @1400) und sind **entfernt statt stehengelassen**
  (§17-Gegengewicht); der Weg führt über `parts/ArtikelHistorie.tsx` und damit
  aus der R4-Fläche heraus. Kosmetisch, kein Funktionsverlust — **Punkt für R5**.

---

## 5 · Zwei Defekte, die der Bau selbst gefunden hat

* **Der Druck zeigte den Satzspiegel weiter.** Die `@media print`-Regel nannte
  nur `[data-leser-v3="rahmen"]`, die Grid-Regel daneben zusätzlich
  `[data-lr-spiegel=…]` — eine Attribut-Bedingung mehr, also höhere Spezifität.
  Gesehen am eigenen Druckbild (OR 418b–418d). Behoben, indem der Selektor
  dieselben Attribute nennt. Der zweite, frühere print-Block hat dabei
  `src/tests/druck-fundstellen.test.ts` drei Zusagen verdeckt (der Test liest den
  ERSTEN print-Block der Datei) — die Regeln stehen jetzt im **einen**
  print-Block, mit Rückverweis an der Fundstelle.

* **Der Registerstrich stand über leeren Marginalien.** Ein Balken ohne
  Gliederungswirkung. Er wird jetzt nur gerendert, wenn die Marginalie etwas
  trägt — entschieden in React, nicht per `:has()`: eine `:has()`-Regel über
  1686 Artikel ist die Bauart, die W2·19-GLIEDERUNG/F1 als Scroll-Bremse
  nachgewiesen hat.

---

## 6 · Ein rotes Tor, das NICHT aus R4 stammt (Nullprobe, §3)

`e2e/leser-kopf-cls-s3.e2e.ts` **@390** reisst die Schwelle 0.05 mit
**0.05038879540658284** — um 0.8 %.

**Nullprobe auf dem unveränderten Basis-Commit `0aa7e3244`** (R1+R2+Nachzug,
kein R4-Byte): derselbe Test schlägt dort mit **byte-identischem Wert** fehl.

| Stand | Läufe | rot (0.050389) | grün (0.014925) |
|---|---|---|---|
| `feat/w2-24-r4-leser` | 5 | 3 | 2 |
| `0aa7e3244` (Nullprobe) | 3 | 2 | 1 |

Messbedingung: warm, ohne CPU-Drossel, lokaler Playwright-`webServer`, macOS,
eigener Browser-Kontext je Fall. Die Werte sind in beiden Ständen auf die
letzte Nachkommastelle gleich — es ist derselbe deterministische Sprung, kein
Rauschen und keine Wirkung der Zeilenhöhen-Änderung (@390 gilt ohnehin die
Zeilenform, der Satzspiegel greift dort nicht). **Der Defekt liegt auf dem
Basis-Stand und gehört nicht in diese Runde.**

Ebenfalls schon auf `0aa7e3244` rot und hier unverändert gelassen:
`src/tests/design-r5-konsistenz.test.ts` («`.num` bleibt Rolle + Familie») —
R1 hat `.num` von Mono auf Grotesk umgestellt, der Wächter ist nicht
nachgezogen. R1/R5-Fläche.

---

## 7 · Deklarierte Test-Anpassung

`src/tests/leser-typo-tokens.test.ts`: die Tabellenzeile
`['leser-text', '1.0625rem', '1.55']` → `'1.62'`, samt Kommentar-Nachzug. Die
**Absicht** des Tors bleibt unberührt: es prüft weiterhin, dass Grösse UND
Zeilenhöhe aus der Typo-Stufe kommen und nicht aus einem rohen Override im
Markup. Die Zahl selbst kommt aus dem freigegebenen Referenzbild.

Ausserhalb der Whitelist berührt: `tailwind.config.js` (eine Stufe) —
Begründung: die Zeilenhöhe ist ein Typo-Token, und genau dieses Tor verlangt,
dass sie dort und nirgends sonst steht.

---

## 8 · Nachweis-Aufnahmen

`r4-1440-{hell,dunkel}-leser.jpg` (OR 336c, `marg`) ·
`r4-1440-{hell,dunkel}-voll.jpg` (SchKG 39, `voll`) ·
`r4-1440-hell-marginalie.jpg` (ZPO 3–5: kursive Randtitel, Registerstrich) ·
`r4-1440-{hell,dunkel}-randnotiz.jpg` (SchKG 57a: Marginalie + Rubrik «Verweise») ·
`r4-1440-{hell,dunkel}-kanton.jpg` (BS-640.100) ·
`r4-1440-{hell,dunkel}-split.jpg` (zwei Panes, Leser + Rechtsprechung) ·
`r4-1440-{hell,dunkel}-split-leser.jpg` (zwei Leser nebeneinander) ·
`r4-390-{hell,dunkel}-leser.jpg` · `r4-1440-druck.jpg` (`emulateMedia print`).
