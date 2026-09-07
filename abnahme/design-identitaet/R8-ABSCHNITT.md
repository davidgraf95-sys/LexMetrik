# R8-ABSCHNITT — «Nichts abgeschnitten», Fixer-Lauf (7.9.2026)

Folge-Runde zu `R8-REPORT-0.md`. Jener Bericht war die **Messung** (Auftrag:
nicht fixen); diese Runde ist der **Fix an den Wurzeln**. Werkzeug unverändert
in Betrieb: `e2e/kein-abschnitt.e2e.ts` (Shard-Gruppe 8), 25 Routen × 6
Viewports (320/390/768/1024/1280/1440) × hell/dunkel, Split-Ansicht und die
Stichproben-Kategorien d/e wie dort beschrieben.

**Messbedingung (§0 Ziff. 3):** lokal, Chromium, `vite preview` aus einem
frischen `npm run build` desselben Arbeitsbaums, Port 4409 (`--strictPort`),
`--workers=2`. Reine Testzeit je Lauf 2.8–3.7 min bei wechselnder
Maschinenlast — die Streuung ist Last, nicht Inhalt (identische Testmenge,
Lauf 0 2.8 min vs. Lauf 3 3.7 min).

---

## 1 Messreihe

| # | Stand | Funde | Δ |
|---|---|---|---|
| 0 | Ist-Stand (Basis `e2e1cc053`, Werkzeug wie geliefert) | **2268** | — |
| 1 | Werkzeug: Kategorie a entdoppelt (benannte Kappung) | **322** | −1946 |
| 2 | `lc-wortumbruch` an drei Bausteinen | **170** | −152 |
| 3 | Tabellen-Affordanz, `title` an den Krumen, Blutungsregel (1. Fassung) | **142** | −28 |
| 4 | Blutungsregel auf den Teilbaum ausgeweitet | **70** | −72 |
| 5 | `overflow-wrap` als Hausregel + TrefferZeile/Sprungleiste/Kennung | **38** | −32 |
| 6 | Reiter: `min-w-0` an den Beschriftungs-Spans; Chevron quadratisch | **38** | ±0 |
| 7 | Reiter: `min-w-0` am **Kasten**; Chevron `size-5` + `leading-none` | **14** | −24 |
| 8 | Entscheid-Kennung mit Anteil-Deckel + `title` | **12** | −2 |
| 9 | Allowlist (12 Einträge, begründet) ⇒ **Tor grün, Exit 0** | **0 nicht erlaubt** | −12 |

Lauf 6 ist bewusst mit ±0 protokolliert: `min-w-0` nur an den Spans genügte
**nicht**, weil der Reiterkasten selbst als Flex-Kind seine `min-content`-Sperre
behielt. Erst Lauf 7 (Sperre auch am Kasten) löste sie. Dasselbe beim Chevron:
`size-4` senkte den Überschuss von 10 auf 5 px, erst das grössere, zeilenhöhen-
neutrale Feld räumte ihn ganz. Beides ist die Messung, nicht die Absicht — ein
Zwischenschritt, der nichts bewirkt hat, wird nicht weggeschrieben (§0 Ziff. 2b).

Kategorien im Ausgangsbestand: **a** 2254 · **b** 12 · **f** 2 · c/d/e/g/h je 0.

---

## 2 Zwei Werkzeug-Korrekturen — und warum sie keine Verblendung sind

Der Erstlauf mass 2268 Funde. **1946 davon waren keine Defekte**, sondern zwei
Messfehler des Werkzeugs. Beide sind belegt, nicht behauptet.

### 2.1 Benannte Kappung ist das Rezept, nicht der Defekt (−1946)

Kategorie **a** («Überlauf ohne Scroller») zählte JEDE ellipsierte Stelle mit —
auch die, die den vollen Text per `title` erreichbar hält. Der Auftrag
definiert den Fund aber ausdrücklich als «scrollWidth > clientWidth an
Textknoten **ohne title / ohne Ellipsen-Absicht**».

**Beleg (Live-Sonde, /rechtsprechung @1440, hell):** die 1914 `span.min-w-0`-
Funde sind durchweg
`min-w-0 flex-1 truncate …` mit `textOverflow: ellipsis`, `overflow: hidden`
und `title` **auf sich selbst** — also exakt die Fassung, die Kategorie b in
R5-U3 eingefordert hatte. Das Werkzeug quittierte damit jeden b-Fix mit einem
unauflösbaren a-Fund: `title` setzen räumt b, nie a. Grün wäre nur erreichbar
gewesen, indem man jede Kappung entfernt.

**Nicht verblendet:** eine Kappung OHNE `title` schlägt unverändert an — in b
(der zuständigen Kategorie) UND weiterhin in a. Ausgenommen ist allein die
benannte, wiederherstellbare Kappung.

### 2.2 Gewollte volle Breite ist kein Abschnitt (−72)

Sticky-Köpfe ziehen sich per negativem Rand bewusst in das Polster ihres
Elternteils, damit ihre Fläche bis an dessen Kante reicht: `-mx-1` im
Gesetzesleser, `-mx-5 sm:-mx-6` am Entscheid. Jeder Vorfahre meldete daraufhin
`scrollWidth > clientWidth` — 72 Funde `div.lc-route` auf sechs Routen über
ALLE Viewports —, obwohl keiner von ihnen klippt (`overflow: visible`): der
Inhalt wird vollständig gezeichnet, nur ausserhalb der eigenen Kastenkante.

Kategorie a nimmt jetzt einen Überschuss aus, der die grösste Blutung **im
Teilbaum** nicht übersteigt. Die erste Fassung sah nur direkte Kinder und traf
deshalb keinen einzigen der 72 — der blutende Kopf sitzt zwei Ebenen tiefer
(Lauf 3 → 4 ist genau diese Korrektur).

**Nicht verblendet:** Kategorie **c** (verlässt den Viewport, 8-px-Toleranz)
bleibt unberührt der Wächter. Ragte eine Blutung wirklich aus dem Fenster,
meldet c sie weiterhin — c stand über alle sechs Läufe auf 0, was die
Einordnung stützt: nichts verliess je das Fenster.

---

## 3 Produkt-Wurzeln (kein Einzelstellen-Pflaster)

### W1 · Ein langes Kompositum sprengt seine Spalte — 3 Bausteine, 1 Rezept (−152)

Deutsch-schweizerisches Rechtsvokabular besteht aus Komposita
(«Datenschutzerklärung», «Generalversammlungsbeschlüssen», «Rechtsprechung»).
Ein solches Wort ist EIN Token — der normale Wortumbruch hat darin keine Fuge.

| Fläche | Gemessen | Datei |
|---|---|---|
| Fuss-Navigation, **alle 25 Routen** × 1024/1280/1440 × hell/dunkel (150 Funde) | «Datenschutzerklärung» 137 px in 124 px | `src/components/layout/Footer.tsx:98` |
| Bereichs-Kacheln der Startseite @320 | +9 px | `src/components/start/BereichsReihe.tsx:95` |
| Sektions-Titel im Gesetzesleser @320 | +20 px | `src/pages/gesetz-leser/parts/SektionKopf.tsx:109` |

Rezept `.lc-wortumbruch` (`src/index.css`, bei den übrigen «nichts geht
verloren»-Affordanzen): `hyphens: auto` trennt an der Silbengrenze
(`html lang="de-CH"`), `overflow-wrap: break-word` garantiert den Bruch auch
ohne Wörterbuch und bei silbenlosen Ketten (Aktenzeichen, URLs).

Keine Rücknahme von LM-139/B16 (zwei Fuss-Kolonnen zum Höhenausgleich) und
keine von D2 (44 px Tap-Ziel, WCAG 2.5.8): `min-h-11` ist ein Minimum, kein
Deckel. Eine Magic-Number-Spaltenbreite wurde bewusst verworfen — sie risse
beim nächsten längeren Label und bei jeder Stufe des Schriftgrössen-Reglers.

### W2 · Derselbe Defekt in einem Dutzend weiterer Komponenten → Hausregel (−32 zusammen mit W4–W6)

Der Sweep fand W1 @320 auch an Kartentiteln, Beschreibungsabsätzen, Etiketten
und Vorschau-Kästen. Einzeln geflickt wäre er beim nächsten neuen Baustein
wieder da (§10), darum als Hausregel in `@layer base`:

```
body { overflow-wrap: break-word }
```

Die Eigenschaft greift **ausschliesslich**, wenn ein Wort sonst überliefe —
Text, der passt, bricht keinen Deut anders. Sie kann also kein bestehendes
Satzbild ändern, nur einen Überlauf verhindern; genau deshalb darf sie global
stehen. `hyphens: auto` bleibt bewusst opt-in in `.lc-wortumbruch`: das
verändert das Satzbild sehr wohl und gehört nicht pauschal über den Normtext
(§1/§7).

### W3 · Scroller ohne Affordanz (−20)

Zwei Scroller waren seit je `overflow-x-auto`, trugen aber die B8-Klasse
`lc-scrollrand-x` nicht — der Leser sah nicht, dass seitlich mehr steht.

- `src/components/normtext/ArtikelTabellen.tsx:93,141` — mehrspaltige
  Normtext-Tabellen, 428 px Inhalt in 242 px (/gesetze/kanton/ZH-211.11).
- `src/pages/EntscheidLeser.tsx:178,179` — Sprungleiste
  («Zusammenfassung · Sachverhalt · Erwägungen · Dispositiv»), 417 px in
  280 px @320.

### W4 · Kappung ohne Rückweg zum vollen Wortlaut (−20)

- `src/components/layout/OrtsAngabe.tsx` — die Brotkrumen kappen per
  `truncate`, hielten den vollen Wortlaut aber nirgends bereit. Gemessen:
  Blatt-Krume /materialien/ESTV-KS-DBG-49 @320 242 von 351 px,
  /gesetze/kanton/ZH-211.11 132 von 276 px. `title={krume.label}` an allen
  drei Krumen-Zweigen **und** an der Artikel-Krume. Quelle ist der String
  `krume.label`, nicht `inhalt` — das kann ein ReactNode sein.
- `src/pages/gesetz-leser/v3/LeserKopf.tsx:234` — der `title` hing an
  `suchInZeile`, die Kennung kappt aber in JEDEM `min-w-0 truncate`-Zweig.
  Jetzt trägt ihn jeder Zweig, der kappen kann; der `shrink-0`-Zweig (voller
  Name steht daneben) braucht ihn nicht.

### W5 · `truncate` ohne `min-w-0` — der Reiter konnte nicht schrumpfen

`src/components/layout/reiterleiste/Reiter.tsx:219,246`. Ein `truncate`-Span
setzt `white-space: nowrap`; als Flex-Kind ist seine `min-content`-Breite damit
der GANZE Text, nicht die Ellipse. Der Reiterkasten kam deshalb nicht unter
diese Breite — gemessen /gesetze/kanton/ZH-211.11 @320: Kasten 171 px, Inhalt
283 px. `min-w-0` hebt genau diese Sperre auf und stellt her, was der
bestehende Kommentar bereits beschreibt («der Kopf kürzt sich weg, die
Geschäftsnummer bleibt»). Die `max-w`-Deckel bleiben — sie begrenzen nach oben.

### W6 · Ein gedrehter Pfeil ist nicht drehneutral

`src/pages/gesetze-teile/AzRegister.tsx:148`. `rotate-90` ändert die
Layout-Breite nicht, wohl aber den gezeichneten Kasten: das hohe, schmale
Glyphenfeld wurde gedreht zum breiten und ragte 10 px über die Karte
(/gesetze @768–1440, h2 690/680 px). Ein quadratisches Feld (`size-4
inline-flex`) misst gedreht dieselben Kanten wie ungedreht.

---

## 4 Allowlist

**12 Einträge, drei Sachverhalte** (`e2e/kein-abschnitt.allow.json`, je 6 hell /
6 dunkel — die Symmetrie ist beabsichtigt: beide Themen messen dieselbe
Geometrie). Jeder Eintrag trägt Begründung, Datum und, wo ein Bau-Schritt folgt,
das Ziel.

| # | Fund | Route/Viewport | Warum kein R8-Fix |
|---|---|---|---|
| 6 | Reiter `div.relative` (a), `div.group/reiter` (f), `button.flex` (a) | `/rechtsprechung/bger_1B_278_2022` @320/390 | **F6/R11.** Die Geschäftsnummer bleibt im Reiter bewusst ungekürzt («OGer AGHOR.2024.19» war der Gegen-Defekt). «BGer 1B_278/2022 vom 20. Juni 2022» passt darum nicht (217 px in 171 bzw. 212 px). Die Lösung ist eine **Kürzungsregel für Entscheid-Kurzformen** — eine Entscheidung über die Zitierform, keine Geometrie-Korrektur. R8 hat den Reiter bereits schrumpffähig gemacht (22 der 28 Reiter-Funde weg); dieser Rest **ist** F6. → eigener Nachzug «F6 Reiter-Kurzform», ROADMAP `W2·24-DESIGN-IDENTITAET` |
| 4 | `input.lc-input` (a + b) | `/rechner/tagerechner` @320 | Natives Eingabefeld; die Ellipse stammt aus der gemeinsamen Feld-Regel. Der Inhalt ist **nicht unerreichbar** — Caret, Pfeiltasten und Auswahl fahren im Feld weiter. Ein `title` wäre hier sogar falsch: er trüge den Wert zum Render-Zeitpunkt und liefe bei jeder Eingabe aus dem Tritt (§8, zweite Wahrheit). **Kein Bau-Schritt** — bewusster Dauerzustand |
| 2 | `summary.cursor-pointer` (a) | `/rechner/tagerechner` @320 | Gemessen 214/200 px, `overflow-x: visible`, **kein Kind ragt heraus** — der Überschuss ist der `::marker` des `display: list-item`, der links ausserhalb des Inhaltskastens sitzt. Der Text bricht seit der Hausregel normal um. → mit der nächsten Überarbeitung der Aufklapp-Bausteine auf einen eigenen Marker umstellen, dann fällt der Eintrag weg |

Was **nicht** in die Allowlist ging: jeder Fund, der eine Wurzel hatte. Die
Liste ist ausdrücklich kein Sammelbecken — sie ist erst nach 2268 → 12
entstanden, nicht davor.

---

## 5 Rot-Probe (§6.7)

Vier Proben, alle am gebauten Stand gefahren.

**A · Die vom Auftrag verlangte: Allowlist-Eintrag entfernen ⇒ rot.**
Entfernt wurde `/rechner/tagerechner @320 hell a-ueberlauf-ohne-scroller`
(11 statt 12 Einträge), danach der volle Lauf:

```
Error: 1 nicht erlaubte Funde (voller Report: test-results/kein-abschnitt.json)
1 failed · 71 passed (3.3m) · Exit 1
```

Genau **ein** Fund wurde unerlaubt — das Tor zählt einzeln und rundet nichts weg.
Eintrag danach wiederhergestellt (12, Symmetrie hell/dunkel geprüft).

**B–D · Die beiden Werkzeug-Ausnahmen sind keine Verblendung.** Temporäre Spec
gegen den echten `geometrieScan` (nicht committet):

| Probe | Aufbau | Erwartet | Gemessen |
|---|---|---|---|
| **B** | Ellipse **ohne** `title`, 523 px Text in 60 px | schlägt in a **und** b an | `a-ueberlauf-ohne-scroller` + `b-ellipsis-ohne-title`, beide 523/60 ✓ |
| **C** | Blutung 8 px, Überlauf ~200 px (400 px Kind in 200 px Hülle) | schlägt an | Funde 0 → **2** ✓ |
| **D** | Reine Blutung (Überschuss **=** Blutung, 8 px) | schlägt **nicht** an | Funde 0 → **0** ✓ |

B beweist, dass §2.1 nur die *benannte* Kappung ausnimmt; C und D zusammen, dass
§2.2 an der Grenze «Überschuss > Blutung» trennt und nicht pauschal schweigt.

---

## 6 Tore

| Tor | Ergebnis |
|---|---|
| `npx playwright test e2e/kein-abschnitt.e2e.ts --repeat-each=2` | **144 passed (4.0m), Exit 0** |
| `npm run golden:vergleich` | **IDENTISCH — 256 Fälle byte-gleich** |
| `npm run test` (vitest) | **459 Dateien, 7443 Tests grün** (2 skipped) |
| `npx tsc -b` | sauber, keine Ausgabe |
| `npm run lint` | **0 Fehler**, 1 Warnung (`useUniversalSuche.ts`, unberührt, Bestand) |
| `npm run check:e2e-shards` | **grün** — 130 Specs, Union der 8 Gruppen deckungsgleich; `kein-abschnitt.e2e.ts` in Gruppe 8 (Annotation im Dateikopf) |

Bestehende Sonden blieben unangetastet: kein Test einer anderen Runde wurde
geändert (§6.3). Die einzige Test-Datei, die diese Runde anfasst, ist das
R8-Werkzeug selbst — beide Eingriffe sind oben in §2 begründet und mit der
Rot-Probe belegt.

---

## 7 Belege

`r8-01-fuss-1440-hell.jpg` (Fuss-Navigation: «Datenschutzerklä-rung» trennt an
der Silbengrenze, zwei Kolonnen erhalten) · `r8-02-start-320-dunkel.jpg` ·
`r8-03-leser-sektion-320-hell.jpg` · `r8-04-gesetze-az-768-hell.jpg` ·
`r8-05-tabelle-zh-390-dunkel.jpg` (Tabelle mit Scroll-Affordanz) ·
`r8-06-reiter-320-hell.jpg` · `r8-07-rechtsprechung-320-hell.jpg` ·
`r8-08-krumen-materialien-320-dunkel.jpg`.

## 8 Was diese Runde NICHT geprüft hat

Die Einschränkungen aus `R8-REPORT-0.md` §«Einschränkung» gelten unverändert
weiter: d/e nur auf Stichproben, je 2 Vertreter pro dynamischer Familie
(nicht alle ~19 Rechner, ~29 Vorlagen, 1'576 Kantonserlasse). Null Funde in
c/d/e/g/h heisst «in dieser Stichprobe sauber», nicht «app-weit bewiesen».
Neu hinzu kommt: die beiden Werkzeug-Ausnahmen (§2) verengen den Blick von
Kategorie a bewusst — was sie ausnehmen, ist in B–D belegt und wird von
Kategorie c weiterhin bewacht.
