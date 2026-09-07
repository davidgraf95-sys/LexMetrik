# R6 — Gesetzesleser: Befunde, Ort, Verzahnung, Split-View

**Runde** W2·24-DESIGN-IDENTITAET/R6 · **Datum** 6.9.2026 · **Branch** `feat/w2-24-r6`
(ab `0834cbd7b`) · **Massstab** `abnahme/design-identitaet/vorschlag-freigegeben.html`
(Seite «Gesetzesleser») und FAHRPLAN-DESIGN-IDENTITAET §5.

**Auftrag David 6.9.2026 (wörtlich):** «nochmals separat über den gesetzesdarsteller gehen …
wo was dargestellt wird und wie die verzahnung dargestellt ist und optimieren» · «auch split
view» · «keine Funktion verloren» · «nicht trist».

Alles unten Gemessene stammt aus dem `dist/`-Preview des Worktrees (`vite preview --port 4347`),
Chromium/Playwright, warm, ohne CPU-Drossel, eigener Browser-Kontext je Fall. Skripte:
`/private/tmp/…/scratchpad/r6/` bzw. `.r6mess/` im Worktree (nicht committet).

---

## 1 · Inventar: was steht wo

Gemessen an `/gesetze/bund/OR#art-336_c`, je Spalte die x-Position bzw. der Ort im
Satzspiegel. «Pane» = sekundäre Hälfte im Split-View (@1440, 718 px breit).

| Element | Ort @1440 (voll) | Zweck | Datenquelle | Dopplung | @390 | Pane |
|---|---|---|---|---|---|---|
| Titelblatt-Zeile | y 0–64, klebend | Marke · Bereiche · Suche | `startseiteConfig`, `seo` | — | gleich | entfällt (Pane-Kopf) |
| Arbeitsleiste (Reiter) | y 64–98, `sticky top:64` | offene Dokumente | `useTabs` | — | scrollbar | entfällt |
| Ausgabe-Zeile | y 98–129 | Register-Erzeugung | `startseiteZaehler` | — | gleich | entfällt |
| Leser-Kopf (klebend) | y 98–155, x 180–1260 | Ort + Griffe | `erlassAnsicht.brotkrume` | **behoben (L10)** | y 98–191 | je Pane eigen |
| Brotkrume | im Leser-Kopf | Gesetze › Ebene › Kürzel › Art. | `brotkrume` + Scroll-Spy | Volltitel entfernt | Kurzform | gleich |
| h1 Erlasstitel | Dokumentanfang | Volltitel + Kürzel | `ErlassKopfBlock` | — | gleich | gleich |
| Gliederung (Spalte) | x 184–472, 288 px | Inhaltsverzeichnis | `gliederungsModell` | — | Blatt (Sheet) | Sheet |
| Erlass-Suchfeld | in der Gliederung | Suche im Erlass | `leserSuche` | — | im Sheet | im Sheet |
| **Marginalie (links)** | **x 492, 150 px** | Randtitel · Fassung | `struktur.marg`, Historie-Shard | — | Zeile über dem Artikel | Zeilenform |
| Randtitel | in der Marginalie | Sachüberschrift | `marg` / `article_title` | — | Zeile | Zeile |
| Fassungs-Zeile | in der Marginalie | «Gilt seit …» | `normtext/historie/<Erlass>` | — | Zeile im Beiwerk | Beiwerk |
| **Textkörper** | **x 678, 580 px** | Wortlaut | Snapshot | — | volle Breite | volle Breite |
| Absatz-/Buchstabennummern | hängend, `pl-9 -indent-9` | amtliche Auszeichnung | Snapshot | — | gleich | gleich |
| Fussnoten-Marker | im Wortlaut | Verweis auf den Apparat | Struktur-Sidecar | — | gleich | gleich |
| Fussnoten-Apparat | Artikelfuss, max 26 rem | Änderungs-/Quellenhistorie | Struktur-Sidecar | — | gleich | gleich |
| Zitat/Permalink | Artikelkopf rechts | Kopieren | lokal | — | gleich | gleich |
| **Randnotiz (rechts)** | **x 1288, 210 px** | Bezüge am Artikel | s. §2 | **entschieden (§2)** | entfällt | entfällt |
| · Rubrik «Entscheide» | Randnotiz, Register `r` | Leitfälle | `norm-index`-Shard — **heute ungeladen** | — | — | — |
| · Rubrik «Verweise» | Randnotiz, Register `g` | Normverweise | `struktur` (lokal) | Beiwerk in `zeile` | Beiwerk | Beiwerk |
| · Rubrik «Rechnen» | Randnotiz, Register `w` | Werkzeug am Artikel | `ARTIKEL_WERKZEUGE` (Bundle) | — | — | — |
| Inline-Verweise | im Wortlaut | Norm-Popover | `NORM_IM_TEXT` | — | gleich | gleich |
| Rechtsprechungs-Panel | schwebend rechts, 352 px | Entscheide · Änderungen · Materialien · Anwendung | Bezugs-Shard (on demand) | s. §2 | Bottom-Sheet | Bottom-Sheet |
| Ansicht-Menü | schwebend am Kopf | Fussnoten · Fassung · Leitfälle · Schriftgrad | `leserOptionen` | — | gleich | gleich |
| Druck | — | — | — | — | — | Gliederung + Suchfeld **entfernt (L16)** |

---

## 2 · Verzahnungs-Urteil aus Juristensicht

**Die Lage vor R6, in einem Satz:** Das Referenzbild verspricht vier Rubriken neben dem
Artikel — und der Leser zeigte **keine einzige**, weil die Spalte, in der sie stehen sollen,
auf keiner Bildschirmbreite existierte.

Belegt: `grid-template-columns` des Artikels war @1440, @1700 **und** @1920 immer
`150px 578px`; `.lr-notiz` kam 0× im DOM vor. Ursache ist keine Design-Frage, sondern eine
Zahl: der Leser-Rahmen ruht auf **1072 px auf jeder Desktop-Breite**, der Lese-Zelle bleiben
nach der Gliederungsspur 764 px, und `SPIEGEL_MIN_VOLL` verlangt 976. Der Zweig war seit R4
gebaut und unerreichbar (§6.7).

**Was die Verzahnung aus Juristensicht leisten muss** — und wie sie heute dasteht:

1. **Neben dem Artikel, in Leserichtung.** Ein Bezug wird geprüft, nicht besucht. Erfüllt:
   die Randnotiz steht rechts auf Höhe des Artikels (ab 1440 px).
2. **Art erkennbar.** Registerfarbe je Rubrik (`data-reg` r/m/g/w) — die einzige Farbe im
   Satzspiegel. Erfüllt für Verweise (Gesetze) und Rechnen (Werkzeuge).
3. **Gewicht sichtbar.** Leitentscheide zuerst: die `LeitfallZeile` sortiert nach `gewicht`
   und trennt die Statusklassen strukturell (`BezuegeZeile`, Herleitung dort). **Noch ohne
   Daten** — s. Ziff. 5.
4. **Kein Doppel Panel + Randnotiz.** Entschieden: **eine** Datenquelle je Rubrik, und die
   Randnotiz zeigt nur, was der ARTIKEL führt. Die Panel-Reiter «Entscheide · Änderungen ·
   Materialien · Anwendung» bleiben, was sie sind — ein Apparat über den ganzen Erlass mit
   Filtern, Zeitraum und Kanton. Beides nebeneinander ist keine Dopplung, sondern zwei
   Auflösungen derselben Sache: am Artikel die vier Zeilen, im Panel der Filterapparat.
5. **Die ehrliche Lücke.** «Entscheide» und «Materialien» kann die Randnotiz heute nicht
   füllen, und das ist ein §15-Entscheid, kein Versehen: beide kämen aus Shards, die der
   Leser nicht lädt (`norm-index/<Erlass>.json`, für das OR allein **419 KB**, gemessen an
   `public/rechtsprechung/norm-index/OR.json`). Ein Idle-Fetch dieser Grösse auf jedem
   Seitenaufruf ist eine Geräte-Last-Entscheidung mit Logikverlust-Bewertung und Messung —
   ein eigener Schritt, nicht ein Nebeneffekt einer Darstellungsrunde. **Kein leerer Kopf
   ohne Deckung** (§8): die Rubriken erscheinen nur, wenn sie Inhalt haben.
   *Nebenbefund für den Fahrplan:* `useArtikelKontext` (`artikelKontext.ts`) lädt beide
   Shards bereits und hat **keinen Konsumenten** — der billige Weg zu Ziff. 5 ist eine
   ZÄHL-Datei je Erlass (Artikel → Anzahl), nicht der volle Shard.

---

## 3 · Optimierungsplan (10 Massnahmen)

| # | Massnahme | Anker | Datei | Stand |
|---|---|---|---|---|
| M1 | Voller Satzspiegel erreichbar machen: die Randnotiz-Spalte rechtfertigt dieselbe Rahmen-Aufweitung wie das Treffer-Blatt | §5 «Bezüge im Leser als Randnotizen rechts» | `v3/satzspiegel.ts`, `v3/rahmenSpalten.ts` | **gebaut** |
| M2 | Vierte Rubrik «Rechnen» in der Randnotiz, aus der statischen Norm↔Werkzeug-Tabelle (kein Fetch) | Referenzbild `.bezuege` | `randNotizWerkzeuge.ts`, `parts/ArtikelLeser.tsx` | **gebaut** |
| M3 | Split-Regel: ein Bezug aus der Randnotiz öffnet in der ANDEREN Hälfte, der Artikel bleibt | R6-Zusatz David | `randNotizOeffnen.ts`, `v3/LeserLesespalte.tsx` | **gebaut** |
| M4 | Tieflink-CLS: der Sprung wird nicht gemalt, bevor er steht | L1 (blockierend) | `inhalt-hooks.tsx`, `index.css` | **gebaut** |
| M5 | Wächter sieht den Tieflink-Fall (bisher nur ankerlose Routen) | §6.7 | `e2e/leser-kopf-cls-s3.e2e.ts` | **gebaut, rot bewiesen** |
| M6 | Der Volltitel steht einmal — in der h1, nicht zusätzlich in der Krume | L10, §5 «der Name steht einmal» | `v3/LeserKopf.tsx` | **gebaut** |
| M7 | Links im Leser sind unterstrichen (kein `hover:underline`) | L12, §5 «Links unterstrichen» | 4 Dateien | **gebaut** |
| M8 | Der Ausdruck trägt kein Inhaltsverzeichnis und kein Suchfeld | L16 | `v3/LeserLeseZeile.tsx` | **gebaut** |
| M9 | Toter Versal-Zweig der Randtitel gestrichen; Registerstrich ohne Rundung | L17, L18, §17-Gegengewicht | `helpers.tsx`, `SektionBaumTOC`, `ArtikelIndex` | **gebaut** |
| M10 | Übersichts-Köpfe: H1 = Bereichsname, Ausgabe-Zeile mit Registerzahlen, §8-Satz in den Fuss | D11 | 5 Übersichts-Seiten | **gebaut** |

**Bewusst NICHT gebaut** (mit Grund, nicht vergessen):
* «Entscheide»/«Materialien» in der Randnotiz — §15-Entscheid, s. §2 Ziff. 5.
* Die Fassungs-Zeile bleibt **links** in der Marginalie. Der R4-Nachtrag notierte sie als
  offenen Punkt und der R6-Auftrag verlangte sie rechts; das **Referenzbild sagt links**
  (`vorschlag-freigegeben.html`, `.rand`: Randtitel, darunter «Fassung seit / 1. Januar
  1989»). §5 ist bindend, also bleibt sie links — offengelegte Abweichung vom Auftrag (§7).

---

## 4 · Split-View: die drei Regeln

1. **Ein Bezug aus der Randnotiz öffnet in der anderen Hälfte, der Artikel bleibt stehen.**
   Ein Randapparat wird geprüft, nicht besucht; ein Klick, der den Artikel ersetzt, macht aus
   der Prüfung einen Sprung. Gilt nur am Rand und nur ohne Modifikator — ⌘/Strg, Umschalt,
   Alt und Mittelklick gehören dem Browser, externe Live-Links ebenso, und ein bereits
   offenes Ziel wird nicht verdoppelt (`randNotizOeffnen.ts`, Unit-Wächter).
2. **Im Pane fällt der Satzspiegel in die Zeilenform.** Gemessen in allen vier Fällen
   (Leser+Leser, Leser+Entscheid, Leser+Rechner, «/»+Leser) @1440 und @1024: `satzspiegel`
   = `zeile`, keine Marginalie, keine Randnotiz, keine Gliederungsspalte (Sheet), kein
   waagrechter Überlauf. Das ist die harte Regel «nie drei vertikale Flächen im Split-View»
   — die Aufweitung aus M1 ist ausdrücklich auf `ruheForm === 'rechts'` beschränkt.
3. **Nichts geht verloren, es wechselt die Form.** Was im vollen Satzspiegel am Rand steht,
   steht im Pane in der Beiwerk-Zone unter dem Artikel — dieselben Komponenten, dieselben
   Daten (`ArtikelLeser`, `randNotiz` schaltet den Ort, nie den Inhalt). Folge, die man
   kennen muss: wer aus der Randnotiz eine zweite Hälfte öffnet, sieht die Randspalte danach
   nicht mehr — ihr Inhalt rutscht in denselben Artikel unter den Text.

Funktionsprobe (Playwright, @1440): Klick auf «Kündigung & Fristen im Arbeitsverhältnis» in
der Randnotiz von Art. 336c ⇒ Panes 0 → 2, `#art-336_c` weiterhin im DOM der linken Hälfte,
`location.pathname` unverändert `/gesetze/bund/OR`.

---

## 5 · L-Befunde des Finders R5 — was R6 damit gemacht hat

| ID | Schwere | Stand nach R6 |
|---|---|---|
| L1 CLS bei jedem Tieflink | blockierend | **gebaut** (M4/M5), 1.1664 → 0.0431 |
| L2 Ansicht-Menü | hoch | **nicht R6** — Menü-Hülle gehört Fixer 1 (TABU) |
| L3 `.lc-leiste-griff` Mono | hoch | **für Fixer 1b** (zentrale Klasse, `index.css`-Bestand) |
| L4 `.lc-highlight` Regeste-Kasten | hoch | **für Fixer 1b** (zentrale Klasse) |
| L5 `.lc-btn-mini`/`-badge`/`-card`/`-chip` | hoch | **für Fixer 1b** (zentrale Klassen) |
| L6 Pane-Kopf ohne Namen | hoch | **für Fixer 1b** (`layout/PaneKopf.tsx`, TABU) |
| L7 Reiterleiste-CLS beim Erstbesuch | hoch | **für Fixer 1b** (`layout/Reiterleiste.tsx`, TABU) — trägt 0.0355 zum Restpegel bei |
| L8 Satzspiegel nicht eingelöst | hoch | **gebaut** (M1/M2) — Ursache war die unerreichbare Schwelle |
| L9 h1 in Archivo statt Literata | mittel | **nicht R6** — Entscheid-/Materialien-Leser liegen ausserhalb der Whitelist |
| L10 Titel doppelt in der Krume | mittel | **gebaut** (M6) |
| L11 Kopfhöhen springen je Routentyp | mittel | **offen** — betrifft `layout/SeitenKopf` und die Leser-Kopfzone gemeinsam |
| L12 `hover:underline` | mittel | **gebaut** (M7), 5 Fundstellen in 4 Dateien |
| L13 Panel ohne `role`/`aria-label` | mittel | **widerlegt**: die Rolle sitzt am WRAPPER (`LeserPanelZone.tsx:318` — `role={modal ? 'dialog' : 'region'}` + `aria-labelledby={titelId}`), R5 hat den inneren Knoten `[data-v3-panel]` gemessen. Offen bleibt allein die ✕-Grösse (24 vs. 44 px) → **für Fixer 1b** (`ui/SchliessKnopf`) |
| L14 Reiter-Kontextmenü fehlt | mittel | **für Fixer 1b** (`layout/Reiterleiste.tsx`, TABU) |
| L15 Split @390 ohne Hinweis | mittel | **für Fixer 1b** (`layout/Shell.tsx`, TABU) |
| L16 Gliederung druckt mit | mittel | **gebaut** (M8), im Druck gegengemessen: `display:none`, 0 sichtbare Suchfelder |
| L17 toter Versal-Zweig | kosmetisch | **gebaut** (M9) |
| L18 `rounded-full` am 2-px-Strich | kosmetisch | **gebaut** (M9), 2 Fundstellen |
| L19 gefüllte Knöpfe in schwebenden Flächen | kosmetisch | **für Fixer 1b** (`.lc-btn-outline`, `index.css`-Bestand) |

---

## 6 · Messreihen

### 6.1 CLS des Tieflinks (@390×844, `dist`-Preview, je 3 Läufe)

| Route | vorher | nachher |
|---|---|---|
| `/gesetze/bund/OR#art-336_c` | 1.1664 · 1.1664 · 1.1664 | 0.0431 · 0.0076 · 0.0431 |
| `/gesetze/bund/OR#art-1` | 0.9307 · 0.9307 · 0.9307 | 0.0432 · 0.0432 · 0.0432 |
| `/gesetze/bund/ZGB#art-457` | 0.5749 · 0.5749 · 0.5749 | 0.0921 · 0.0355 · 0.0921 |
| `/gesetze/bund/ZPO` (ohne Anker) | 0.0362 | 0.0539 (unverändert im Streubereich; L7) |

Frame-Trace vorher: Artikel im DOM bei scrollY 219'766 → 221'226 → 221'403 (drei gemalte
Lagen). Quelle der grössten Einzelverschiebung: `section[data-normtext-linie]`, previousRect
y 0 / h 844 → currentRect y 325 / h 519; auf `#art-1` der `footer`, y 95 / h 749 → y 0 / h 0.

**Zwei Wege, die NICHT geholfen haben** (beide gemessen, beide byte-gleich 1.1664, im Code
dokumentiert): (a) den Sprung in den Layout-Effekt ziehen; (b) die Korrektur in denselben
Tick schleifen. Die Relevanz eines `content-visibility`-Teilbaums entscheidet der Browser
erst im nächsten Rendering-Lifecycle.

**Rot-Probe des neuen Wächters** (§6.7): CSS-Regel `html[data-lr6-anker-warten]` auf einen
Selektor umgeschrieben, der nie greift, neu gebaut — `CLS Tieflink @390` rot mit exakt
**1.1664385673801876** in allen drei Versuchen; Regel zurück, Fall grün.

### 6.2 Satzspiegel

| Fenster | vorher | nachher |
|---|---|---|
| 1440 | `150px 578px` (`marg`), `.lr-notiz` 0× | `150px 580px 210px` (`voll`), `.lr-notiz` 137× |
| 1920 | `150px 578px` | `150px 580px 210px` |
| 1024 | `zeile` | `zeile` (unverändert) |
| Pane @1440/@1024 | `zeile` | `zeile` (unverändert) |

Kein waagrechter Überlauf in irgendeinem der Fälle (`scrollWidth − clientWidth = 0`).

---

## 7 · Nachweis-Aufnahmen

`r6-{1440,1024,390}-{hell,dunkel}-leser-bund.jpg` · `…-leser-kanton.jpg` ·
`r6-{1440,1024}-{hell,dunkel}-split-leser-leser.jpg` ·
`r6-1440-{hell,dunkel}-split-leser-entscheid.jpg` · `…-split-leser-rechner.jpg` ·
`…-split-start-leser.jpg` · `r6-{1440,390}-{hell,dunkel}-uebersicht-gesetze.jpg` ·
`r6-1440-{hell,dunkel}-uebersicht-{rechtsprechung,materialien}.jpg` · `r6-1440-druck.jpg`.

---

## 8 · Drei rote Tore, die NICHT aus R6 stammen (Nullprobe, §0 Ziff. 3)

Nullprobe-Verfahren: eigener Worktree auf dem **unveränderten Basis-Commit `0834cbd7b`**
(kein R6-Byte), voller `npm run build`, derselbe Playwright-Lauf. Ergebnis in allen drei
Fällen: **byte-identisch rot**.

| Tor | Messwert auf R6 | Messwert auf `0834cbd7b` | Zuordnung |
|---|---|---|---|
| `e2e/leser-ruecksprung-r5-r7` «TOC-Sprung ⇒ Chip …» | 154 (Schwelle < 140) | **154** | R4 |
| `e2e/leser-spy-w25d` «H6-a — 400 % Zoom (320×200)» | «40a» statt «40_b», −14 px | **byte-gleich dieselbe Meldung** | R4 |
| `e2e/leser-kopf-cls-s3` «CLS Erlass-Kopf @390 (STPO)» | 0.05038879540658284 | R4-Protokoll §6 dokumentiert denselben Wert auf `0aa7e3244`; im R6-Lauf 3× rot / 2× grün (0.0363) | Basis-Stand, Ursache L7 |

**Gemeinsame Ursache der ersten beiden:** R4 hat die Typo-Stufe `leser-text` von lh 1.55 auf
**1.62** gehoben (`tailwind.config.js:195` — auf dem Basis-Commit gegengelesen). 17 px × 1.62
= 27.54 px statt 26.35: jede Zeile ist 1.19 px höher, und über einen Artikel summiert sich das
zu den gemessenen 14 px. Beide Fälle prüfen POSITIONEN mit einer Schwelle, die an der alten
Zeilenhöhe kalibriert ist. Der Wurzel-Fix ist eine Neukalibrierung MIT Herleitung — sie
gehört in die R4-Fläche und nicht in eine Darstellungsrunde, die die Zahl nicht gesetzt hat;
eine Schwelle um 14 % zu lockern, ohne den Grund zu benennen, wäre das Aufweichen eines
Wächters (§6.7). **Konkreter Schritt für den Fahrplan:** «R4-Nachzug Zeilenhöhe 1.62 — die
drei positionsbasierten Wächter neu kalibrieren, Herleitung aus dem Referenzbild.»

Zwei weitere Fälle DERSELBEN Ursache hat R6 nachgeführt, weil sie ohne Kalibrierungs-Frage
auskommen (Deklaration jeweils im Test):
* `e2e/leser-lesemass` «StPO @1440 … 26.35 px» → 27.54 px (die Zahl KOMMT aus der Stufe).
* `e2e/leser-lesemass` «Schalter-Rundlauf» — die Wirkungs-Sonde misst nicht mehr Höhen,
  sondern sichtbare Beiwerk-Knoten: R4 hat den Fassungs-Slot in die Marginalie verlegt, wo er
  die Artikelhöhe nicht mehr bestimmt. Auf `0834cbd7b` gegengelesen (`ArtikelLeser.tsx:347`,
  `SPIEGEL_MIN_MARG` = 45.625 rem = 730 px gegen 764 px Lese-Zelle @1280).

---

## 9 · Deklarierte Test-Anpassungen (§6.3)

Alle sieben sind **fachliche Änderungen**, keine Refactorings; die Begründung steht jeweils
im Test selbst, hier nur die Übersicht. Kein Fall wurde gelöscht, keine Absicht aufgegeben.

| Datei | Fall | Was sich ändert | Grund |
|---|---|---|---|
| `e2e/leser-kopf-cls-s3` | **neu**: «CLS Tieflink @390» | Fall kommt hinzu | §6.7 — der Wächter konnte den Tieflink-Pfad nie sehen |
| `e2e/leser-v3-bauteile` | «Stufe voll» | Volltitel steht nicht mehr in der Krume | L10/M6 |
| `e2e/leser-v3-rahmenspalten` | «geschlossenes Blatt» + 1 neuer Fall | aufgeweitet wird auch für die Randnotiz; Gegenrichtung (Pane, zu schmal) neu bewacht | M1 |
| `e2e/a11y`, `e2e/gesetze` | H1 «Schweizer Gesetzessammlung» | heisst «Gesetze» | D11/M10 |
| `e2e/leser-marken-geometrie` | Marken-Sonde | Anker enger: nur der Wortlaut (`.lr-text`), nicht jede Liste im Artikel | M2 (die «Rechnen»-Liste ist keine Ordnungsmarke) |
| `e2e/leser-v3-kontext-cls` | «(a) @1440» | «breite» misst den Wortlaut statt den Satzspiegel-Kasten; bei offenem Panel darf die Randnotiz zurückklappen (einseitig, verlustfrei, Rundlauf byte-genau) | M1 — Randnotiz und Panel-Spur passen @1440 nicht nebeneinander |
| `e2e/leser-v3-rahmen` | «(a)», «(e)» | Rahmenbreite: `≤ LESER_MAX_REM` statt `=1072`, Rundlauf gegen den Ausgangswert statt gegen eine feste Zahl; 12 px Toleranz auf der Textbreite | M1 — der Rahmen ist @1440 dauerhaft aufgeweitet |
| `e2e/leser-lesemass` | 2 Fälle | Zeilenhöhe 27.54 px; Schalter-Wirkung an sichtbaren Knoten statt an Höhen | **R4-Nachzug**, Nullprobe s. §8 |

**Die eine Zahl, die in zwei Fällen auftaucht — 11 px:** im vollen Satzspiegel schuldet die
Lese-Zelle 591 (Textmass) + 150 (Marginalie) + 210 (Randnotiz) + 72 (zwei Rinnen) = **1'023 px**,
sie hat @1440 aber **1'012** (`LESER_MAX_REM` 1'320 − Gliederung 308). Der Wortlaut misst
darum mit Randnotiz 580 statt 591 px — 66 statt 67 Zeichen. **Offener Punkt für den
Fahrplan:** wer die 11 px schliessen will, hat genau drei Stellschrauben, und alle drei sind
David-Entscheide — `LESER_MAX_REM` (82.5 rem, Ä60 (c)), `--lr-notiz` (13.125 rem) oder
`--lr-rinne` (2.25 rem). R6 hat keine davon angefasst.
