# R6e — Erlass-Suche über dem Gesetz, eine Kopfzeile, Rechtsprechung als Blatt

**Auftrag:** W2·24-DESIGN-IDENTITAET, Befunde **D32 · D33 · N1 · N4**
(Finder-Befund 7.9.2026, Folge-PR nach #739). **Zweig:** `feat/w2-24-leser`,
abgezweigt von `a60dd7f75` (Stand nach dem D30/D31-Fix auf
`feat/w2-24-design-identitaet`).

Davids Wortlaut, 6./7.9.2026:

> «die suche erscheint in der gliederung»

> «rechtsprechung oben rechts funktioniert nicht richtig»

Vier Mängel derselben klebenden Kopf-Zone. Alle Zahlen unten sind **gemessen**,
im Preview-Build (`vite preview`, Chromium, hell und dunkel), Routen
`/gesetze/bund/OR` und `/gesetze/bund/ZGB`.

---

## 1 · D32 — die Erlass-Suche stand über der Gliederung

**Vorzustand, gemessen @1440 (OR, Gliederung offen):**

| Element | x | y | b × h |
|---|---|---|---|
| `[data-v3-such-zone] input` | **184** | 154 | 640 × 32 |
| `[data-v3-aside]` (Gliederung) | 184 | 198 | 288 × 678 |
| `[data-lr-spiegel]` (Gesetzesspalte) | **492** | — | 764 |

Δ zwischen Feld und Gesetzestext: **308 px**. Das Feld begann exakt an der
linken Kante der *Gliederungsspalte*. Beim Einklappen sprang die Textspalte
492 → 240 (−252), das Feld blieb bei 184 stehen — die Δx = 0 der Klapp-Sonde
hielt es dort fest. @1024 derselbe Mangel (Feld 24, Text 332). @390 und im
Split-Pane war schon alles richtig (Versatz 0).

D28 selbst hatte «oben am gesetz» verlangt; die Null war die Umsetzung eines
Teilsatzes («dann verschiebt sie sich auch nicht»), nicht des Auftrags.

**Gebaut.** `rahmenBild` gibt neu `spurVersatzRem` aus — die Breite der linken
Spur samt Abstand, also genau den Punkt, an dem die Lese-Zelle anfängt:

| Lage | Versatz |
|---|---|
| Gliederungsspalte (18 + 1.25 rem) | **308 px** |
| Schiene (2.25 + 1.25 rem) | **56 px** |
| ohne Spur (Pane, @390) | **0 px** |

Der Rahmen legt den Wert als `--leser-spur-versatz` aus (eine Geometrie-Quelle,
LM-003); die Kopfzeile stellt ihre linke Zone genau so breit. Damit gilt in
jeder Lage `Feld.x === Gesetzesspalte.x`, und beim Klappen wandert das Feld um
**exakt denselben Betrag** wie die Textspalte.

**Der Griff zieht mit.** «‹ Gliederung ausblenden» sass in einer eigenen 28-px-
Zeile über der Gliederungsspalte. Der linke Streifen der Kopfzeile hätte sonst
leer gestanden; der Griff steht jetzt dort, rechtsbündig über der Gliederung
(Polster `--leser-spur-abstand`). **Folge, gewollt:** die Gliederung beginnt
28 px höher. Beschriftung, Ä12-Herleitung und `aria-expanded` unverändert.

**Offengelegt (§7/§8).** Bei *eingeklappter* Gliederung ist der Streifen nur
56 px breit; ein langes Kantons-Kürzel (ZH-211.11) kürzt dort. Der volle Name
steht zwei Zeilen tiefer im Erlass-Kopf, und das Kürzel trägt einen `title`.

---

## 2 · N4 — Feld und Griffe stehen in EINER Kopfzeile

**Vorzustand.** Der klebende Kopf-BLOCK war 100 px hoch: Kopfzeile 56 px mit
den zwei Griffen rechts (⚖ · Ansicht ▾), darunter die Such-Zone 44 px mit dem
Feld links. Dazwischen rund 70 % Leerfläche.

**Gebaut.** Sobald links eine Spur steht, trägt die Kopf-ZEILE die Such-Zone.
Der Block misst dann `max(Kopfzeile, Zone)` statt ihrer Summe — neue Variable
`--leser-v3-kopf-block-h`, aus der `--nt-stick` rechnet:

| | vorher | nachher |
|---|---|---|
| klebender Block, Ruhe | 100 px | **56 px** (−44) |
| `--nt-stick` @1440 | 198 px | **154 px** |

Die Element-Zahl der Zeile bleibt bei vier (Kennung · Feld · ⚖ · Ansicht;
Design-Grundlage Kap. 6). Unter der Spalten-Schwelle (Pane, @390) bleiben es
zwei Reihen — dort gäbe es neben dem Feld keinen Platz für die Griffe.

---

## 3 · D33 — «Rechtsprechung» floh unter dem Cursor

**Vorzustand, gemessen @1440 (OR, hell und dunkel identisch):**

| | Ruhe | nach Klick | Δ |
|---|---|---|---|
| Zähler `[data-v3-panel-zaehler]` | x 1075, «⚖ Rechtsprechung» | x **1253**, «⚖ 3 Entscheide» | **+178** |
| Gesetzesspalte x / Breite | 492 / 764 | 404 / 640 | −88 / **−124** |
| Gliederung x | 184 | 96 | −88 |

Folge: an der geklickten Stelle lag danach `DIV OR` — Gesetzestext, kein Knopf;
ein zweiter Klick dorthin bewirkte **nichts**. Jede Zeile des gelesenen Artikels
brach neu um. @1024 löschte das Öffnen die ganze Gliederungsspalte aus dem DOM.
Das verstiess gegen D9 («nichts verschiebt sich») und gegen die Zusage von M3.

**Gebaut — Variante A (Blatt statt Spur).** Die dritte Rahmen-Spur (Ä60 (c),
17.8.2026) ist zurückgebaut: der Rahmen kennt zwei Spuren, seine Breite hängt an
keinem Panel-Zustand mehr, das Blatt überlagert. Gestrichen sind damit
`LESER_MAX_REM`, die Aufweitung, `blattSpur`, `schieneHoltPlatz`,
`lesemassMaxRem`, die Panel-Gestalt `'spalte'` und die Lage-Eingabe
`blattOffen` — «das Bild hängt nicht am Panel-Zustand» ist seither strukturell
wahr statt bewacht.

**Nachzug aus dem eigenen Sonden-Lauf.** Die erste Fassung liess das Blatt
`fixed` am Fensterrand mit `top: var(--nt-stick)`. Gemessen bei **nicht
gescrollter** Seite steht der klebende Kopf noch an seiner natürlichen Stelle
(y 145–201), `--nt-stick` (154 px) meint aber die Stelle, an der er *klebt* —
das Blatt begann 47 px zu hoch und lag über seinem eigenen Knopf
(`elementFromPoint` lieferte «Rechtsprechung & Kontext»). Wortgleich der
Ä52-Befund vom 17.8.2026, neue Ursache. Jetzt klebt das Blatt **in der
Lese-Zelle** (`sticky` in einer 0-Höhen-Hülle, derselbe Kniff wie die
Scroll-Blende): natürliche Lage unter dem Kopf, beim Scrollen bei `--nt-stick`
— «tiefer von beiden», ohne zu messen. Kein Platz im Fluss, Δ = 0.

**Preis, offengelegt (§8).** Das Blatt verdeckt im geöffneten Zustand die
rechten 352 px der Lesespalte; @1440 bleiben **412 px** Lesetext frei. Im
Ruhezustand verdeckt es nichts. Es schliesst auf ✕, Esc, einen zweiten Klick am
Zähler und «r» — **nicht** bei einem Klick in den Text: Textmarkieren bei
offenem Panel muss möglich bleiben (datierter Befund, Klick-Test 18.8.2026;
Wächter `leser-v3-rahmen` (f)). Die Gegenprobe dazu steht jetzt beim modalen
Blatt (@390 Bottom-Sheet, Scrim-Klick schliesst).

**Variante C bleibt offen** (der Zähler öffnet die Entscheide im zweiten
Fenster, wie die Randnotiz nach M3): sauberere Produktlogik, eigener
Fahrplan-Schritt — die Reiter Änderungen/Materialien/Anwendung brauchen dann
eine eigene Heimat.

---

## 4 · N1 — zwei Zahlen für denselben Artikel

**Vorzustand**, OR Art. 336c, ein Bildschirm: Bezüge-Zeile am Artikel «Bezüge ·
**11 Entscheide** · 1 Rechner ›» (Quelle: Zähl-Datei, ausdrücklich «ohne
UI-Filter, die Bezugsgrösse»), Kopf-Zähler «⚖ **3 Entscheide**» (Quelle:
gefilterte Kanten). Beide Zahlen richtig, beide über dieselbe Sache.

**Gebaut.** Der Kopf-Zähler liest dieselbe Zähl-Datei wie die Bezüge-Zeile
(`artikelZahl`); `trefferZahl` ist gestrichen. Gefiltert wird im Panel, wo die
Schalter stehen. Und die **Beschriftung bleibt «Rechtsprechung»** — bis hierher
wechselte sie beim ersten Öffnen dauerhaft auf «3 Entscheide» (105 → 87 px). Die
Zahl steht als Marke daneben, in einem 2.25 rem breiten Fach mit fester Breite:
sie folgt der Leseposition, und ein mitwachsender Kasten kostete beim blossen
Scrollen CLS (gemessen 8.1 × 10⁻⁷ gegen die zugesagte 0, `leser-v3-kopf` A9).

---

## 5 · Sonde und Rot-Beweis

`e2e/w224-leser-d32-d33.e2e.ts` (7 Fälle). **Gegen den Stand vor dem Bau
gefahren: 7/7 rot**, mit genau den Zahlen des Befunds:

| Fall | Meldung im Rot-Lauf |
|---|---|
| (a) @1440 Feldkante | `Feld x=184, Gesetzesspalte x=492` — Expected ≤ 1, Received **308** |
| (b) Klappen | `Δx Feld 0 ≠ Δx Spalte -252` |
| (c) @1024 / (d) @390 | `Feld x=24, Spalte x=332` — Received **308** |
| (e) eine Kopfzeile | `Feld y 185–217, Griffe y 145–169 — zwei Reihen statt einer` |
| (f) Δ am Text/Knopf | `Spalte vor {"x":492,…,"b":764} / nach {"x":404,…,"b":640}` |
| (i) @1024 Gliederung | `element(s) not found` (`[data-v3-aside]`) |
| (k) N1 | `Kopf-Zähler 0 ≠ Bezüge-Zeile 11` |

---

## 6 · Umdeklarierte Wächter (§6.3, fachliche Änderungen)

| Datei | Was galt | Was gilt |
|---|---|---|
| `e2e/leser-klapp-sonde.e2e.ts` | Δx = 0 auch für die Erlass-Suche | Δx(Suche) === Δx(Lesespalte); jedes andere Kopf-Element unverändert Δ = 0 |
| `e2e/leser-v3-rahmen.e2e.ts` (a)(b)(e2)(g) | eigene Blatt-Spur, Gliederung weicht, Schienen-Griff schliesst das Blatt | Rahmen 1072 px in beiden Zuständen, Gliederung bleibt, Lesespalte Δ = 0, Griff lässt das Blatt offen |
| `e2e/leser-v3-rahmen.e2e.ts` (f2) | Gegenprobe @1023 (Aussenklick schliesst) | Gegenprobe @390 (Scrim-Klick schliesst) — die 1024er-Grenze trennte die Spur, nicht die Regel |
| `e2e/leser-v3-panel-zaehler.e2e.ts` (a) | vor dem Öffnen keine Zahl | Zahl von Anfang an, und das Öffnen ändert sie nicht |
| `src/tests/leser-v3-rahmenspalten.test.ts` | Aufweitung auf 1320 px, drei Spuren | zwei Spuren, `spurVersatzRem` 308 / 56 / 0 |
| `src/tests/leser-v3-panel.test.tsx`, `…kopfstufen.test.ts` | `oeffnerLabel`, `trefferZahl` | `OEFFNER_WORT`, `oeffnerLabelKompakt`, `artikelZahl` |

---

## 7 · Bildbogen und Schluss-Messung

Screens im selben Verzeichnis (`r6e-*.jpg`), gemessen am gebauten `dist/`:

| Bild | Lage | Feld x | Gesetzesspalte x / b | Kopf-Block h | Zähler x | Blatt |
|---|---|---|---|---|---|---|
| `r6e-1440-hell-01` / `-dunkel-01` | @1440, Gliederung offen | **492** | **492** / 764 | 57 | 1035 | — |
| `r6e-1440-hell-02` / `-dunkel-02` | @1440, Panel offen | **492** | **492** / 764 | 57 | **1035** | 904 / 352 |
| `r6e-1440-hell-03` / `-dunkel-03` | @1440, Gliederung zu | **240** | **240** / 1016 | 57 | 1035 | — |
| `r6e-1024-hell-01` | @1024 ZGB, Gliederung offen | **332** | **332** / 668 | 57 | 779 | — |
| `r6e-1024-hell-02` | @1024 ZGB, Panel offen | **332** | **332** / 668 | 57 | 779 | 648 / 352 |
| `r6e-390-hell-01` | @390 ZGB | **20** | **20** / 350 | 93 (zwei Reihen) | 230 | — |
| `r6e-split-hell-01` | Split, Pane 718 px | **26** | **26** / 670 | 93 (zwei Reihen) | — | — |
| `r6e-split-hell-02-panel` | Split, Panel offen | — | — | — | — | `unten`, modal mit Scrim |

Ablesbar: Feld-Kante **=** Spaltenkante in **jeder** Lage; Öffnen und Schliessen
des Panels lassen Spalte, Gliederung und Zähler auf den Pixel stehen; der
klebende Block misst 57 statt 100 px, wo die Zone in der Zeile steht, und
unverändert 93 px, wo es bei zwei Reihen bleibt (Pane, @390). `--nt-stick` ist
`calc(calc(4rem + 2.125rem) + max(3.5rem, 2.75rem))`, `--leser-spur-versatz`
19.25 rem (Spalte) bzw. 3.5 rem (Schiene) bzw. 0 (Pane, @390).

---

## 8 · Tor-Stand

| Tor | Ergebnis |
|---|---|
| `npx tsc -b` | grün |
| `npm run lint` | grün (0 Fehler; 1 vorbestehende Warnung in `useUniversalSuche.ts`) |
| `npm run test` | 454 Dateien / 7405 Tests grün |
| `npm run golden:vergleich` | IDENTISCH — 256 Fälle byte-gleich |
| `npm run check:golden-normtext` | OK — 60257 Knoten, 0 Waisen |
| `npm run gen:e2e-shards` + `check:e2e-shards` | grün (126 Specs, Union deckungsgleich) |
| `npx playwright test e2e/leser-*.e2e.ts e2e/w224-leser-d32-d33.e2e.ts` | **318 passed, 3 failed** — alle drei auf der Bau-Basis schon rot (Nullprobe, s. u.) |
| `npm run check:schlankheit` | rot an `parts/ArtikelLeser.tsx` — auf der Bau-Basis schon rot (s. u.) |

---

## 9 · Nicht gebaut, gemeldet

- **Drei Fälle waren schon auf der Bau-Basis rot.** Nullprobe in einem eigenen
  Worktree auf `a60dd7f75` gefahren, mit demselben Fehlertext und (bei (b))
  denselben Zahlen:
  `leser-v3-kontext-cls` (a) «Artikel nach OBEN gerückt» und (b) «Artikel
  senkrecht verschoben: 1093,1385,1798,2461,2794 → 1093,1444,1915,2637,2970»,
  sowie `leser-links-p3` «die Links der Bezüge-Zeile stehen wieder ohne
  Unterstrich». Alle drei betreffen die Bezüge-Zeile aus D30 (das Aufklappen
  lädt Entscheide und Materialien nach, der Artikel wächst dabei), nicht diesen
  Bau. Der Wurzel-Fix gehört zu D30 und ist hier nur gemeldet, nicht gemacht.
- **`check:schlankheit` ist auf der Bau-Basis rot**: `parts/ArtikelLeser.tsx`
  840 Zeilen über der 800er-Schwelle, byte-identisch zur Basis — von diesem Bau
  nicht angefasst und nicht gewachsen.
