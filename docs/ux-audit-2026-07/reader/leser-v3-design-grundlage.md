# Design-Grundlage «Gesetz-Leser V3»

Stand 16.8.2026 · Branch `feat/leser-v3-konzept` · Konzeptpapier, **kein Produkt-Code**. Fundament für V-0
(Klick-Prototyp), D0 (Farb-Vorarbeit), S2 (Typografie) und H1 (Rahmen) des `fahrplaene/FAHRPLAN-LESER-V3.md`.
Anspruch David 16.8.2026: «bestes und schönstes Produkt am Markt, minimalistisches Apple-Design», Massstab die
acht HIG-Prinzipien (Fassung 8.6.2026). **Beleg-Status je Zahl: P** = Primär (amtliche Quelle/Repo-Datei direkt
gelesen oder gemessen) · **S** = Sekundär (Drittquelle mit Hersteller-Bezug) · **A** = eigene Ableitung. Keine
**S**-Zahl gilt als amtlich verifiziert (§7).

---

## 0 · Für David — in Alltagssprache

**Wie es sich anfühlen soll.** Man öffnet ein Gesetz und sieht zuerst den Gesetzestext — gross, ruhig, in einer
schmalen Spalte wie in einem gut gesetzten Buch. Alles Werkzeug (Suche, Gliederung, Entscheide) steht am Rand,
leise, und tritt erst hervor, wenn man es anfasst. Nichts blinkt, nichts springt, nichts ist bunt ausser dort, wo
Farbe Bedeutung trägt.

**Die fünf Grundregeln.** (1) Der Text ist der Held — Werkzeug nimmt nur den Platz, den es braucht. (2) Weniger
Regler, klarer benannt — jeder neue Schalter ersetzt zuerst einen alten. (3) Farbe ist Signal, nie Dekoration —
Warnungen tragen immer Zeichen *und* Wort. (4) Nichts springt — der Platz für Zusatzzeilen ist immer schon
reserviert. (5) Alles ist umkehrbar — man verliert nie die Lesestelle.

**Was sich sichtbar ändert.** *Schrift:* grösser (19 statt 18 px), mehr Luft zwischen den Zeilen, Absatzziffern
hängen am linken Rand statt im Text. *Ruhe:* die Kopfzeile verliert Such- und Rechtsprechungs-Menü; unter den
Artikeln steht statt einer scrollbaren Entscheid-Zeile nur noch «⚖ 14 Entscheide →». *Farbe:* aus über 60
Farb-Variablen werden 14 benannte Rollen — das Bild wird nicht farbiger, die Pflege billiger. *Abstände:* ein
Raster (Vielfache von 4 px) statt Einzelfälle. *Bewegung:* alles unter einer Fünftelsekunde; wer «Bewegung
reduzieren» eingestellt hat, sieht gar keine.

**Drei Fragen an dich (mit Empfehlung).**
| # | Frage | Empfehlung |
|---|---|---|
| **D-A** | Soll der Gesetz-Leser einen **Schriftgrössen-Regler** bekommen? Der Entscheid-Leser hat einen (4 Stufen), der Gesetz-Leser bis heute **keinen** — die Schrift ist dort fest. | **Ja** — denselben 4-Stufen-Regler übernehmen. Zwei fast gleiche Lesemasken derselben App dürfen sich hier nicht unterscheiden, und Lesegrösse ist genau die Einstellung, die Apple dem Nutzer überlässt. |
| **D-B** | **Dunkelmodus** weiterpflegen? Jede Farbrolle kostet doppelte Arbeit und doppelte Prüfung. | **Ja, behalten** — aber die Zahl der Rollen von über 60 auf 14 senken. Dann ist der Dunkelmodus 28 Werte statt über 120 und bleibt bezahlbar. |
| **D-C** | **Serifenschrift** (Source Serif 4) für den Gesetzestext behalten oder auf die normale Schrift wechseln? | **Behalten.** Die Serife sagt dem Auge «das hier ist der amtliche Wortlaut»; Apple macht es in Büchern genauso. Die Forschung zeigt am Bildschirm keinen Lesenachteil mehr. |

---

## 1 · Designprinzipien konkret — die acht HIG-Prinzipien als prüfbare Regel

Quelle: `developer.apple.com/design/human-interface-guidelines/design-principles`, Fassung «June 8, 2026», per
Browser abgerufen 16.8.2026 (**P**). Die alten iOS-7-Motive (Deference, Clarity, …) werden nicht verwendet.

| # | Prinzip | Regel für den Leser (prüfbar formuliert) | So prüfen wir es |
|---|---|---|---|
| 1 | **Purpose** | Im Ruhezustand gehören ≥ 60 % der Fläche @1440 px dem Normtext; kein Element im Lesekörper, das nicht Wortlaut, Ziffer, Marginalie oder Fussnote ist. | e2e misst Bounding-Box `[data-normtext]` gegen Viewport; Selektor-Verbotsliste im Lesekörper. |
| 2 | **Agency** | Jeder Zustand (Panel, Suche, Sheet) ist mit **einem** `Esc` verlassbar **ohne** Scroll-Sprung; die Lesestelle überlebt jeden Wechsel, auch V1↔V3. | Muster `leser-position-u.e2e.ts`: `scrollY` vor/nach ≤ 2 px. |
| 3 | **Responsibility** | Stand, Quelle, Prüfdatum und der Warnsatz bei nicht konsolidierter Änderung stehen an **genau einem** Ort (Erlass-Kopf), in Klartext, nie nur als Farbe. | `check:verfall-ui` + N-Test auf den Wortlaut der Standzeile. |
| 4 | **Familiarity** | Ein Anker-Schema (`#art-`), ein Such-/Sprungfeld, ein Options-Ort — in H, D und S identisch benannt und identisch positioniert. | `split-view-a34.e2e.ts` + Positionsvergleich der Controls über drei Breiten. |
| 5 | **Flexibility** | Layout hält Textvergrösserung bis 200 % ohne Clipping und ohne Verlust eines Bedienelements; die Tastatur erreicht jede Funktion. | axe + e2e mit `zoom`/`font-size`-Override (WCAG 1.4.12, **P**). |
| 6 | **Simplicity** | Höchstens **3** zweiwertige Schalter, **1** Menü-Ort, **≤ 4** Elemente in der Kopfzeile. | Zählprüfung im e2e; die Regel steht als Zahl im Tor, nicht als Prosa. |
| 7 | **Craft** | Keine Ad-hoc-Werte: jede Grösse, Farbe, jeder Abstand kommt aus einem Token; `leading-[1.65]` (heute 4×, **P**) wird Token. | `check:design-tokens` (Arbitrary-Verbot) + neuer Leading-Sweep (W-1). |
| 8 | **Delight** | Die Emotion des Produkts ist **Ruhe**: keine Dekoration ohne Funktion, keine Animation ohne Zustandswechsel. | «Was wir NICHT tun»-Liste (Kap. 8) als Review-Checkliste im PR. |

---

## 2 · Schriftsystem

### 2.1 Familien — drei, keine vierte
| Rolle | Stack | Entscheid | Beleg |
|---|---|---|---|
| Normtext (Lesetext) | `Source Serif 4 Variable` → metrik-getunte Fallbacks → Charter/Georgia | **behalten** (D-C) | **P** `src/index.css:290`; HIG: New York ist Apples bewusste Serif-Ausnahme für Lese-Kontexte (**P**) |
| Chrome/UI | `Geist Variable` → `Geist Fallback` → Hanken Grotesk | behalten | **P** `src/index.css:286-287`; §G-e Zwei-Stimmen-Regel |
| Zahlen/Aktenzeichen | `Geist Mono Variable` → IBM Plex Mono | behalten, Gebrauch auf SR-Nr./Aktenzeichen begrenzt | **P** `src/index.css:288` |

Web-Font-Ladung **unverändert übernehmen**: alle drei self-hosted (`@fontsource-variable/*`), kein CDN;
`vite.config.ts:29-33` erzwingt für die Serif-CSS `font-display: optional` statt `swap` (kein Sprung nach der
Blockphase) plus capsize-gemessene Metrik-Fallbacks (**P**). Ein Wechsel auf Systemserife brächte keinen
Perf-Gewinn, kostete aber OS-Konsistenz (**A**). Gewichte nur 400/500/600/700 (**P** «Avoid light font weights»).

### 2.2 Typo-Skala des Lesers — 7 Stufen (heute 10)
| Token | px / rem | Zeilenhöhe | Gewicht | Verwendung |
|---|---|---|---|---|
| `leser-titel` | 32 / 2 | 1.15 | 600 | Erlasstitel im Kopf (bleibt `h1`) |
| `leser-h` | 24 / 1.5 | 1.25 | 600 | Sektions-/Titel-Überschrift |
| `leser-art` | 20 / 1.25 | 1.3 | 600 | Artikelnummer + Randtitel |
| `leser-text` | **V1: 19 / 1.1875** | **1.7** | 400 (Serif) | Normtext-Fliesstext |
| `leser-chrome` | 14 / 0.875 | 1.5 | 400/500 | Sidebar, Panel, Kopfzeile |
| `leser-meta` | 12 / 0.75 | 1.45 | 400 | Fussnoten-Body, Marginalien-Meta |
| `leser-mikro` | 11 / 0.6875 | 1.4 (+0.12 em) | 500 | Overline/Kapitälchen-Zeile |

Gestrichen: `base` (16, im Leser ungenutzt), `body-l` (18 → geht in `leser-text` auf), `h2` (25.6 → 24),
`display`/`display-l` (36/44, im Leser ohne Verwendung). Skala-Ist **P** `tailwind.config.js:56-73`, Stufenzahl
**A**. Jede Stufe tritt als Token ein — `check:design-tokens` verbietet rohe Grössen (**P** Z. 22-26).

### 2.3 Satzregeln
| Regel | Wert | Beleg |
|---|---|---|
| Lesemass | 40–42 rem ≈ 64–72 Zeichen; nie volle Fensterbreite; Blocksatz verboten, Flatterrand | **P** WCAG 1.4.8 (≤ 80 ch, kein Blocksatz); Butterick 45–90; NN/g 50–75 |
| Absatz | Abstand **oder** Einzug, nie beides — V3 nimmt den Abstand (1 em) | **P** Butterick, `summary-of-key-rules` |
| Absatzziffern (¹²³) | **hängend** in der Marge, Rolle `label-3`, tabular | **A**; Fedlex-Konvention **P** §4b |
| Marginalien | Hänge-Einzug-Schutz (`text-indent:-1em` + `pl-[1em]`) unverändert | **P** §4b, Fedlex-AVOID-Fall |
| Fussnotenmarke | **ein** Token `--fn-marke: 0.72em`, hochgestellt, ohne Klammer — ersetzt 6× `text-[0.62em]` | Duplikat-Fund **P**; Wert **A** |
| Titel-Hierarchie | max. **3** sichtbare Stufen im Lesekörper | **P** §4b Randtitel-Hierarchie |
| Ziffern | `tabular-nums` für Beträge/Daten/Artikelnummern; `onum` (Mediävalziffern) **nicht** aktivieren — Ziffernlesbarkeit vor Schriftbild | **A**; `onum`-Verfügbarkeit **S** (Fontsource, Source Serif 4) |
| Dynamic-Type-Analog | Basis `rem`, alle Stufen relativ; Nutzer-Regler = **Entscheid D-A** (4 Stufen `[1.0, 1.08, 1.18, 1.3]` wie `EntscheidLeser.tsx:204`) | Ist-Wert Entscheid-Leser **P**; Übernahme **A** |
| Textabstand-Toleranz | Layout hält lh 1.5×, Absatz 2×, Buchstabe 0.12×, Wort 0.16× ohne Bruch | **P** WCAG 2.2 SC 1.4.12 |

### 2.4 Zwei Varianten für den Bild-Vergleich (entscheidet F3, Fahrplan Kap. 8)
| Kennwert | Ist | **V1 «ruhiger Satzspiegel»** | **V2 «amtsnah kompakt»** |
|---|---|---|---|
| Fliesstext | 18 px / lh 1.6 (+ Override `leading-[1.65]`) | **19 px / lh 1.7** | 17 px / lh 1.55 |
| Lesemass | 42 rem ≈ 70–72 ch | 40 rem ≈ 64–66 ch | 42 rem ≈ 76 ch |
| Randtitel/Marginalie | `gesetze-marginalie` | 14 px, Serif, `label-2` | 13 px, Sans, `label-2` |
| Titelstufen | 20 / 25.6 / 32 | **20 / 24 / 32**, Overline in Kapitälchen | unverändert |
| Absatzziffern | inline | **hängend**, `label-3` | inline, halbfett |
| Fussnoten (Marke / Body) | 6× `text-[0.62em]` / 11 px, lh 1.2 | 0.72 em ohne Klammer / 12 px, lh 1.45 | 0.8 em in Klammern / 11 px, lh 1.3 |
| Einzug je Stufe | 20 px, max 5 Stufen | AUFGEHOBEN 29.8.2026 (§4b-C, eine Kante) | unverändert |
| WCAG 1.4.8 | erfüllt | erfüllt (≤ 66 ch, lh 1.7) | erfüllt (76 ch, lh 1.55) |

Empfehlung **V1** — verbindlich aber erst nach dem 18-Bilder-Bogen (StPO Art. 429 · OR Art. 336c × 3 Breiten × 3 Zustände): der Entscheid fällt am Bild, nicht am Text.

---

## 3 · Abstandsraster & Layout

Basis **4 px**, praktisch **8 px** ab Bauteil-Ebene (**P** `--space-*`, `src/index.css:239-240`).

| Stufe | Wert | Verwendung | | Grösse | **H** ≤ 640 | **D** ≥ 1024 | **S** Pane ≈ 620–760 |
|---|---|---|---|---|---|---|---|
| `s1` | 4 px | Icon↔Label, Chip-Innenraum | | Seitenrand horizontal | 16 px | 32 px | 24 px |
| `s2` | 8 px | Zeilen innerhalb einer Gruppe | | Lesespalte | 100 % − 2×16 | 40–42 rem, zentriert | 40 rem, zentriert |
| `s3` | 12 px | Gruppen innerhalb eines Blocks | | Sidebar | Sheet (kein Steg) | **18 rem** | **15 rem** |
| `s4` | 16 px | Blockabstand, Panel-Innenrand H | | Kontext-Panel | Bottom-Sheet | 22 rem rechts | Sheet über dem Pane |
| `s6` | 24 px | Panel-/Sidebar-Innenrand D | | Sticky-Höhe Kopf | 48 px | 56 px | 48 px |
| `s8` | 32 px | Artikel↔Artikel (heute `pt-7 mt-7` = 28 px) | | Sticky-Beginn Sidebar | — | ab Gliederungs-Kopf | ab Gliederungs-Kopf |
| `s12` | 48 px | Sektionswechsel, Anhang (heute 36 px) | | Beiwerk-Zone Mindesthöhe | **2.5 rem** | 2.5 rem | 2.5 rem |
| `s16` | 64 px | Seitenrand oben/unten D | | Regel S | \- | \- | **nie drei vertikale Flächen** |

`--space-24` (96 px) im Leser **gestrichen** — 8 Stufen statt 9 (**A**). Sidebar-/Panel-Breiten **P**
(`FAHRPLAN-LESER-V3.md` Kap. 4b/4d), Ränder und Sticky-Höhen **A**. **Beiwerk-Zone:** heute reserviert
`min-h-hist-zeile` **1.5 rem** genau eine Zeile und drückt CLS von 0.0227 auf 0.0002 (**P**
`tailwind.config.js`-Kommentar, `ArtikelLeser.tsx:595-602`); V3 hebt die Reservierung von der Zeile auf die
**ganze Zone** (Fassung + Entscheid-Zähler + Fussnotenzeile) — der Artikelabstand bleibt gleich, egal was
eingeblendet ist (Position 13). Artikel-Raster: Titelzeile (Höhe reserviert) → Absätze → Trennlinie `separator` →
Beiwerk-Zone; **eine** Linienrolle pro Ebene, keine zweite Linie im Lesekörper (**P** `check:linien-kanon` Teil A).

---

## 4 · Farbrollen

**Modell:** Rollen statt Stufen. Eine Rolle ist semantisch definiert («by its purpose, rather than its
appearance», **P** HIG Color) und existiert in drei Fassungen: hell · dunkel · erhöhter Kontrast. Die Grau-Achse
wird im Leser auf **vier** Textrollen begrenzt (heute 7 ink-Stufen + `--placeholder`, **P**).

| Rolle | Zweck | Hell | Dunkel | Erhöhter Kontrast |
|---|---|---|---|---|
| `label-1` | Normtext, Titel | `#2B2924` (ink-800) | `#DCD9D2` | `#1C1A15` / `#E9E7E2` |
| `label-2` | Marginalie, Sidebar, Meta | `#56534C` (ink-600) | `#B2AEA4` | → `label-1` |
| `label-3` | Absatzziffern, Platzhalter, Fussnoten-Meta | `#6F6B61` (ink-500) | `#918D83` | → `label-2` |
| `label-4` | **nur Nicht-Text** (Icon-Ruhezustand) | `#8D8A83` (ink-400) | `#726F68` | → `label-3` |
| `separator` | Artikeltrenner | `ink-900 @10 %` | `ink-900 @14 %` | @18 % / @24 % |
| `separator-strong` | Sektionstrenner, Panel-Kante | `ink-900 @14 %` | `ink-900 @20 %` | @22 % / @30 % |
| `bg-plain` | Lesefläche | `#FCFAF6` (paper) | `#16150F` | unverändert |
| `bg-grouped` | Sidebar-/Panel-Grund | `#F6F4EE` (sunken) | `#100F0A` | unverändert |
| `bg-raised` | Karte, Popover, Sheet | `#FFFEFC` (raised) | `#201E16` | unverändert |
| `fill` | Eingabefeld, ruhende Fläche | `#F6F4EE` | `#100F0A` | + `separator`-Kante |
| `accent` | Links, aktive Gliederungszeile, Marke | `#826225` (brass-700) | `#D8BD78` | `#654C1E` / `#EAD6A4` |
| `accent-bg` | Trefferhervorhebung, aktive Zeile | `#F1E8D6` (brass-100) | `#2C2616` | + `accent`-Kante |
| `warn` | «noch nicht konsolidiert» | `#8C570F` (warn-700) | `#E3AC5E` | dito, Text ≥ 7:1 |
| `focus` | Tastatur-Fokusring | `#826225` | `#B89653` | + 1 px Aussenkontur |

**Mapping alter Token → neue Rolle.** `ink-800`→`label-1` · `ink-600`→`label-2` · `ink-500`/`--placeholder`→
`label-3` · `ink-400`→`label-4` · `ink-900` bleibt **nur** Mischbasis der Linien (`color-mix`), nie Textfarbe ·
`ink-700`/`ink-300` entfallen im Leser · `--rule-artikel`→`separator` · `--rule-struktur`→`separator-strong` ·
`--paper`→`bg-plain` · `--paper-sunken`/`--well`→`bg-grouped`/`fill` · `--paper-raised`/`--surface`→`bg-raised`
(eine Fläche statt zwei) · `brass-700`→`accent` · `brass-100`→`accent-bg` · `warn-700`→`warn` · `--focus`→`focus`.

**Streichliste** (gemessen 16.8.2026, `grep -rl` über `src/`, **P**):
| Token | Befund | Vorschlag |
|---|---|---|
| `--accent-text`, `--accent-bg`, `--accent-bg-hover`, `--accent-line`, `--accent-line-decor`, `--accent-solid`, `--accent-text-strong`, `--accent-hover` | **kein einziger Komponenten-Treffer** — die D-2-Rollen-Alias-Schicht lebt nur in `index.css` | in die Rollen oben **umbenennen** und dann tatsächlich benutzen, sonst streichen (§F7 «keine toten Tokens») |
| `--ok-solid`, `--ok-text`, `--ok-bg`, `--ok-line` | ebenfalls nur `index.css`, 0 Komponenten | streichen; `sage-*` trägt die Rolle bereits |
| `brass-200/300/400/500/600/800` | 6 Zwischenstufen für **eine** Akzentrolle | im Leser auf `accent` + `accent-bg` reduzieren |
| `--space-24` (96 px) · `--radius-2xl` (24 px) | im Leser ohne Bedarf | streichen (Kap. 3 / 5) |

Erwartung: von über 60 aktiven Farb-Variablen (**P**) auf **14 Rollen × 2 Modi = 28 Werte** im Leser-Scope; die
Zwischenstufen bleiben als *private* Basis in `:root`, werden aber von keiner Komponente mehr direkt gegriffen
(§G «Rollen vor Stufen»). **Kontrast-Nachweis** (WCAG-2.x-Formel, aus den Ist-Tokens berechnet 16.8.2026, **A** —
die Gegenprobe gehört ins Tor `check:farbwelt`, das deterministisch misst, **P**):

| Rolle auf `bg-plain` | hell | dunkel | Soll |
|---|---|---|---|
| `label-1` | **13.94:1** | **12.97:1** | AA 4.5 · AAA 7 — beide **AAA** |
| `label-2` | **7.36:1** | **8.26:1** | **AAA** |
| `label-3` | **5.10:1** | **5.52:1** | AA (bewusst kein AAA — Nebentext) |
| `label-4` | 3.30:1 | 3.65:1 | **nur Nicht-Text** (≥ 3:1, SC 1.4.11) |
| `accent` (Link) | **5.41:1** | **9.99:1** | AA |
| `warn` (Text) | **5.78:1** | **9.00:1** | AA |
| `accent`-Kontur auf `accent-bg` | 6.62:1 | 10.50:1 | ≥ 3:1 |

`label-3` ist der einzige Wert nahe der Grenze — bei V1 stehen die Absatzziffern hängend in der Marge und sind
damit Struktur, nicht Fliesstext; wer AAA über die ganze Fläche will, hebt sie auf `label-2` (7.36:1). Entscheid → D0.

---

## 5 · Kanten, Radien, Ebenen

| Radius | Wert | Verwendung | | Ebene | Erhebung | Schatten | Regel |
|---|---|---|---|---|---|---|---|
| `r-s` | 4 px | Chips, Eingabefeld, Trefferzeile | | **0 Ruhe** | `bg-plain`/`bg-grouped` + 1 px `separator` | **keiner** | Lesefläche, Sidebar, Artikelraster sind flach |
| `r-m` | 12 px | Panel, Karte, Menü | | **1 Panel/Karte** | `bg-raised` + `separator` | `--shadow-sm` | Ton trägt, Schatten ist Zugabe (§G-b «Ton vor Schatten») |
| `r-l` | 16 px | Sheet, Vollbild-Overlay H | | **2 Sheet** | `bg-raised` | `--shadow-md` | mobil/S; Rückwand abdunkeln statt zweitem Schatten |
| — | — | — | | **3 Popover** | `bg-raised` | `--shadow-lg` | Fussnote/Verweis — liegt sichtbar über dem Text |

Drei Radien statt fünf (Ist 4/8/12/16/24, **P** `src/index.css:248-249`); 8 und 24 werden gestrichen. Primer und
Geist nutzen beide exakt drei Werte — 6/12/16 px — und lassen den Radius mit der Ebene wachsen (**P**
primer.style, vercel.com/geist); wir behalten 4 statt 6 als kleinsten Wert, weil er Ist-Bestand ist. Ebenso drei
schwebende Ebenen (dort 4 inkl. Tooltip). Keine transluzenten Flächen übereinander (**S**, HIG-Materials), kein
Schatten ohne Schweben — «flach im Ruhezustand» ist die Regel, nicht die Ausnahme.

---

## 6 · Ikonen & Glyphen

| Regel | Wert | Beleg |
|---|---|---|
| **Eine** Bibliothek | `src/components/Icon.tsx` (eigenes Set, 24×24-Grid, 8 Glyphen) — keine Fremdpakete | **P**; §B3 «genau ein Icon-Set» |
| Unicode-Glyphen (✕ ☰ ▾) | in Icon-Glyphen überführen — heute eine zweite, unbewachte Bibliothek | Fund **P** (Reglement-Audit); Massnahme **A** |
| Strichstärke | 1.5 px neben Sans 400/500; 1.75 px neben 600er Labels | Ist 1.5 **P**; Gewicht-Matching **P** («SF Symbols in denselben Gewichten wie der Text») |
| Grössen | 16 px (inline/Meta) · 20 px (Chrome) · 24 px (Sheet-Kopf, Touch) | **A**, auf dem 4er-Raster |
| Trefferfläche | ≥ 24 px in beiden Achsen aus `--tap-ziel`, Komfortziel 44 px | **P** §F9, WCAG 2.5.8/2.5.5 |
| **Icon + Label Pflicht** | Warnung «nicht konsolidiert», jede Kopf-/Toolbar-Aktion, jeder Schalter | **P** HIG Color («nie allein Farbe») und HIG Icons (Icon ohne eindeutige Bedeutung braucht ein Text-Label) |
| Icon-Flut-Verbot | Kopfzeile im Ruhezustand ≤ 4 Elemente, davon ≤ 2 reine Icons; im Lesekörper **null** Icons ausser dem Entscheid-Zähler | **A**, gestützt auf Apple Books (Lesemodus reduziert auf **einen** Knopf, **S**) |

---

## 7 · Bewegung

Bestandstokens (**P** `src/index.css:256-257`): `--dur-fast 120ms` · `--dur-base 160ms` · `--dur-slow 220ms` ·
`--dur-stage 420ms` · `--ease cubic-bezier(.2,.6,.2,1)`.

| Vorgang | Dauer | Kurve | Bemerkung |
|---|---|---|---|
| Sheet auf/zu (H, S) | 220 ms (`slow`) | `--ease` | 200–350 ms plausibel, amtlich **nicht** belegt (**S**, offen markiert) |
| Panel rechts auf/zu (D) | 160 ms (`base`) | `--ease` | Breite + Opazität, kein Bounce |
| Sidebar-Collapse | 160 ms | `--ease` | Baum-Knoten nur Opazität, keine Höhen-Animation über 300 ms |
| Trefferliste | 120 ms (`fast`) | linear | **nur Opazität** — Listen dürfen nicht wandern |
| Scroll-Sprung zum Artikel | ohne Animation | — | Sprung mit Sticky-Offset, sofort |

Kein Overshoot (**P** §F8) — Apples Federn mit Überschwingen gelten dem gestengetriebenen UI, nicht einem
Dokumentleser (**S**). `prefers-reduced-motion` ersetzt jede Bewegung durch ein Opazitäts-Crossfade ≤ 120 ms oder
gar nichts (**S**; **P** §F8 Base-Reset); Oszillationen um 0.2 Hz sind ausdrücklich zu vermeiden (**S**). Keine
Animation verschiebt Layout: alle Übergänge auf `opacity`/`transform`, nie auf `height`/`margin` bereits
sichtbaren Inhalts — sonst zählt es als CLS (Präzedenz 0.0227 gegen 0.0002, **P**).

---

## 8 · Zurückhaltung & Chrome-Regeln

**Im Ruhezustand sichtbar:** Erlasstitel + Artikelnummer (Kopf) · Such-/Sprungfeld · Gliederungsbaum · Normtext ·
Trennlinie · Beiwerk-Zone (leer, aber reserviert) · Entscheid-Zähler · Erlass-Kopf mit Stand/Quelle. Sonst nichts.
**Erst bei Hover/Fokus:** Zeilenaktionen der Gliederung · «Zitat kopieren»/Teilen · Verweis-Unterstreichung ·
Sekundäraktionen des Panels (Vorbild Arc «smart hover», iA Writer, **S**). **Nie** hover-only: alles bleibt per
Tastatur und Touch erreichbar — Hover verbirgt Zierde, nie Funktion.

**Was wir NICHT tun.**
1. Keine Rahmen/Boxen um jedes Element — Trennung über Weissraum, dann Linie (**S**; **P** §F1).
2. Keine Icon-Flut in der Leseansicht (**S**: Books reduziert auf einen Knopf).
3. Keine Farbfläche ohne Bedeutung; Brass ist Signal, nicht Tapete — Squint-Test (**P** §G-a).
4. Kein fixer Tracking-/Leading-Wert über alle Grössen; keine gestapelten transluzenten Flächen (**S**).
5. Keine harten Slide-Transitions bei Reduced Motion (**S**).
6. Kein Reinweiss `#FFFFFF`/`bg-white` als Lesefläche (**P** §G-d, im Tor).
7. Keine volle Fensterbreite für Fliesstext (**P** §B2); kein Blocksatz, keine Silbentrennung (**P** WCAG 1.4.8).
8. Keine drei vertikalen Flächen nebeneinander im Split-View (**P** Fahrplan Kap. 4d).
9. Keine dauerhaft sichtbaren Sekundäraktionen (**S**, Fehler Nr. 4 der Referenz-Recherche).
10. Kein Radius/Abstand pro Komponente frei gewählt (**S**, Fehler Nr. 5).

**Das WERKZEUG darf breiter sein als eine Textseite — der TEXT nicht** (Ä60 (c),
Entscheid David 17.8.2026, gebaut 18.8.2026). Nr. 7 verbietet volle Fensterbreite
für **Fliesstext**, nicht für den Rahmen um ihn herum: der Gesetz-Leser ist ein
Arbeitsplatz aus drei Spuren — Gliederung 18 rem · Lesespalte 40 rem · Beiwerk
22 rem —, und die brauchen samt Abständen 84 rem. Sein Rahmen wächst darum bei
offenem Beiwerk-Blatt auf **höchstens** diese 84 rem (`v3/rahmenSpalten.ts`),
nie darüber hinaus; die Lesespalte bleibt in jeder Lage auf ihrem Lesemass, und
reicht der Platz nicht, weicht die **Gliederung** auf ihre Schiene, nie das
Lesemass. Für jede andere Seite gilt `max-w-content` (70 rem) unverändert — die
Aufweitung ist eine Eigenschaft dieses einen Werkzeugs, kein neuer Seitenrahmen.

---

## 9 · Ist → Soll: Änderungen am Reglement

| §-Anker | Regel heute | Soll V3 | Art | Etappe |
|---|---|---|---|---|
| `DESIGN-REGLEMENT §B2` | 10-stufige Skala, `max-w-reading` 40 rem | Leser-Skala **7 Stufen** (Kap. 2.2); Lesemass V1/V2 | geändert | **S2** |
| `§B3` | ein Icon-Set, vier Statusfamilien | zusätzlich: Unicode-Glyphen verboten, Grössen 16/20/24, Strichstärke gewichtsgebunden | geändert | H1 |
| `§F1` | Spacing aus `--space-*` (9 Stufen) | Leser-Skala **8 Stufen**, `--space-24` raus | geändert | H1 |
| `§F2/F2b` | 72 WCAG-Pflichtpaare hell+dunkel | Paarliste auf die **14 Rollen** umgestellt; dritte Fassung «erhöhter Kontrast» neu | geändert + neu | **D0** |
| `§F5` · `§F9` | zwei Typo-Register · Trefferfläche aus Token | unverändert, ausdrücklich bestätigt | bleibt | — |
| `§F7` | keine toten Tokens | Streichliste Kap. 4 vollziehen (12 Alias-Token ohne Komponenten-Treffer) | geändert | **D0** |
| `§F8` | Motion zurückhaltend | Zuordnung Vorgang→Dauer (Kap. 7) verbindlich | neu | H1 |
| `§G-a…e` | Rollen vor Stufen, Ton vor Schatten, Zwei-Stimmen | `accent-*`/`ok-*` durch das Rollenmodell **ersetzt**; drei Ebenen, drei Radien | geändert | **D0** |
| `NORMTEXT §4b` | Linien-Kanon, Lese-Typografie | Absatzziffern hängend, `--fn-marke`-Token, Beiwerk-Zone | geändert | **S2** |
| `NORMTEXT §4b-B` | Farb-Wörterbuch der Referenzschicht | auf Rollennamen umgeschrieben, Referenzwerte neu gemessen | geändert | **D0** |
| `NORMTEXT §4c` | vier Leser-Darstellungsoptionen | drei zweiwertige Schalter (setzt F1/F2 voraus) | geändert | S1 |
| `§13`-Konkordanz | — | neuer Abschnitt «Leser-Rollen» mit Mapping-Tabelle; Lesegrössen-Regler nach **D-A** | neu | D0/S2 |

**In D0:** Rollenmodell samt Werten hell/dunkel/erhöht · Mapping · Streichliste vollziehen ·
`check:farbwelt`-Paarliste umstellen · drei Radien, drei Ebenen — dazu der bereits geplante Sweep der stillen
Deckkraft-Klassen (`bg-brass-100/70`, DESIGN-D0) und DESIGN-D8a (Entscheid-Leser als Split-Partner). **In S2:**
7-Stufen-Skala als Tokens · V1/V2-Bildbogen und F3 · `leading-[1.65]` und `text-[0.62em]` in Tokens auflösen ·
Absatzziffern hängend · Beiwerk-Zone auf 2.5 rem · Lesegrössen-Regler (D-A). **In H1:** Spacing-8 · Breiten
H/D/S · Sticky-Höhen · Kopf ≤ 4 Elemente · Icon-Regeln · Motion-Zuordnung · Ruhezustands-/Hover-Vertrag.

---

## 10 · Prüfbarkeit

| Regel | Bewachendes Tor | Status |
|---|---|---|
| Typo nur aus der Skala; jede Farb-Utility existiert (No-op-Wächter); Reinweiss-Verbot | `check:design-tokens` (**P** `scripts/check-design-tokens.ts`) | deckt Kap. 2.2, das Kap.-4-Mapping und §G-d |
| Kontrast hell + dunkel | `check:farbwelt` (**P** `scripts/check-farbwelt.ts`) | deckt Kap. 4 — die Paarliste muss in D0 auf die Rollen umgestellt werden, sonst misst das Tor die alten Namen |
| Eine Linien-Sprache im Normtext | `check:linien-kanon` Teil A (**P**; Teil B am 16.8.2026 gestrichen, §6.7) | deckt `separator`/`separator-strong` |
| Barrierefreiheit, Trefferflächen hell+dunkel | `e2e/a11y.e2e.ts` (axe + Hitbox-Messung) | deckt Kap. 1 Nr. 5 und Kap. 6 |
| Kein Layout-Sprung | `e2e/gesetze-footer-cls.e2e.ts` (`layout-shift`-Observer) | deckt Kap. 7 nur für den Footer — **Lücke** bei der Beiwerk-Zone |
| Lesemass | `e2e/leser-lesemass.e2e.ts`, `leser-breite-a37.e2e.ts` | deckt Kap. 2.3 |
| **Pixelvergleich** | **existiert nicht** — `toHaveScreenshot` kommt im ganzen Repo nicht vor (**P**, `grep -rl` über `e2e/` und `src/`) | Lücke, siehe W-3 |

**Drei neue Wächter — nur, weil die Regel sonst nicht scheitern kann.**
| # | Wächter | Bewacht | Rot-Beweis |
|---|---|---|---|
| **W-1** | `check:leser-skala` — Grep-Tor: im Leser-Scope (`components/gesetz-leser/**`, `components/normtext/**`) sind nur die 7 Skalenstufen, 8 Spacing-Stufen, 3 Radien und die 14 Rollennamen zulässig; jede andere Grössen-/Farb-/Radius-Utility ist ein Fehler | Kap. 2.2, 3, 4, 5 — heute durch **kein** Tor gedeckt: `check:design-tokens` prüft nur die *Existenz* eines Tokens, nicht die *Zugehörigkeit zum Leser-Satz* | `text-h2` bzw. `rounded-2xl` im Leser einsetzen ⇒ muss rot werden |
| **W-2** | Erweiterung von `e2e/gesetze-footer-cls.e2e.ts` um einen **Beiwerk-Block**: CLS beim Umschalten Fussnoten/Änderungsvermerke/Rechtsprechung an↔aus ≤ 0.01 unter 6× CPU-Drossel | Kap. 3 (Beiwerk-Zone) und Position 13 — die Regel «der Abstand bleibt gleich» ist sonst reine Prosa | Reservierung entfernen ⇒ muss rot werden (Präzedenz 0.0227) |
| **W-3** | Playwright-**Pixelvergleich** auf 6 Referenzbilder (StPO Art. 429 × H/D/S × hell/dunkel), Toleranz 0.2 % | Kap. 5, 7, 8 — «flach im Ruhezustand», Icon-Zahl und Chrome-Sparsamkeit fängt kein Selektor-Test | Schatten auf die Lesefläche legen ⇒ muss rot werden |

W-1 und W-2 sind unstrittig — beide bewachen Regeln, die sonst nur im Text stehen. **W-3 ist ein Vorschlag mit
Kostenwarnung:** Pixelvergleiche sind auf CI-Linux die häufigste Flake-Quelle, und das Repo hat bewusst bis heute
keinen. Empfehlung: erst nach H1 bauen, die Basisrate der Fehlschläge messen (kalt und warm getrennt) und nur
behalten, wenn sie unter 1 von 40 Läufen liegt — sonst ersatzlos streichen statt tolerieren (§17-Gegengewicht).

---

## 11 · Benennung (Glossar, 18.8.2026)

**Anlass, gemessen.** Die Live-Ästhetik- und Benennungs-Prüfung vom 18.8.2026
(`leser-v3-h4/aesthetik-live-2026-08-18.md`, Note 8/10) hat den grössten
Einzelabzug nicht für Layout oder Farbe vergeben, sondern für **Benennungs-
Streuung**: dieselbe Sache hiess je nach Ort verschieden — im sichtbaren Text,
im `aria-label`, im `title` und im Platzhalter oft alle vier Mal anders. Das ist
kein Geschmacksfehler. Wer «Ansicht» sucht und «Darstellung» liest, hält es für
ein zweites Menü; und wenn der Screenreader etwas anderes sagt als das Auge
liest, sprechen ein blinder und ein sehender Nutzer über verschiedene Flächen
(§8).

**Diese Tabelle ist ab jetzt die eine Wahrheit.** Wer eine Beschriftung setzt,
schlägt hier nach — und wer ein Wort ändern will, ändert es hier zuerst und dann
im Code. Der Wächter dazu ist `src/tests/leser-benennung.test.ts` (Quellensonde
über `src/pages/gesetz-leser/v3/**` plus die vier geteilten Bausteine, die V3
sichtbar rendert): er prüft je Eintrag, dass das gewählte Wort vorkommt **und**
die verworfenen nicht. Kommentare zählen nicht mit — die Herleitungen dürfen die
alten Wörter zitieren.

| Sache | Begriff (verbindlich) | verworfen | Ä |
|---|---|---|---|
| Menü der Darstellungsschalter | **Ansicht** | Darstellung · Darstellungsoptionen · DARSTELLUNG | Ä114 |
| Steckbrief-Box der Seitenleiste | **Übersicht** | Steckbrief (nur Doku/Tests) | Ä119 |
| Fussnav-Link auf `/gesetze` | **Alle Gesetze** | Übersicht | Ä119 |
| Fedlex-Link am Erlass/Artikel/Sektionskopf | **Amtliche Fassung ↗** | geltende Fassung · ↗ geltende Fassung · amtliche Fassung ↗ (klein) | Ä110 |
| Quell-Link in einer Panel-Liste | **Fedlex ↗** (bzw. der Name der Sammlung) | amtlich ↗ | Ä121 |
| Amtliches PDF | **Amtliches PDF** | amtliches PDF (klein) | Ä110 |
| Zweite Lesefläche (Split) | **Fenster** («In neuem Fenster») | Reiter · Pane · Split-View · Layout-Link | Ä118 |
| Reiter des Kontext-Panels | **Reiter** (Entscheide · Änderungen · Materialien) | — | Ä118 |
| Rechtsprechungs-Fläche | **Rechtsprechung** (Chip konstant) | — | Ä115/Ä123 |
| Schalter für die Fassungs-Zeile | **Fassung** | Änderungsvermerke | Ä116 |
| Gliederungs-Griff (☰ des Lesers) | **Gliederung öffnen / ausblenden** | Gliederung (nacktes Substantiv) | Ä111 |
| Suchfeld — Platzhalter | **Im Erlass suchen oder «Art. 1» …** (Beispiel erlassgerecht, «§ 1» am §-Erlass) | Suchen oder «Art. 1» … · Im ‹Kürzel› suchen … | Ä112/Ä126 |
| Suchfeld — zugänglicher Name | **Im Erlass ‹Kürzel› suchen oder zu einer Bestimmung springen** | Im ‹Kürzel› suchen … | Ä126 |
| Suchbereich | Alles · **Überschriften** · Text · Fussnoten | Titel | Ä120 |
| Trefferzähler — laufende Stelle | **Fundstelle n von m** · vor dem ersten Sprung **keine gewählt · m Fundstellen** | –/88 · «Fundstelle 0 von m» | Ä103/P1-2 |
| Externer Link, der auswärts öffnet (aria) | **(neuer Tab)** | (neues Fenster) · (öffnet in neuem Tab) | Ä127 |
| Schalter für die Rechtsprechungs-Zone | **Rechtsprechung im Kopf** | Rechtsprechung in der Kopfzeile · Rechtsprechung anzeigen | Ä115/Ä128 |
| Kopf-Standausweis | **Kopie vom …** | Snapshot | — |
| Erlassart im Steckbrief | **Erlassart** (nur mit bekannter Grundart) | Art · «Art: Kanton FR» | Ä108 |

**Schreibung.** Beschriftungen von Aktionen und Links beginnen gross
(«Amtliche Fassung ↗», «In neuem Fenster», «Amtliches PDF»); das gilt auch für
die Inline-Aktion am Artikel und am Sektionskopf — sie tragen denselben Namen
wie der Kopf, sonst wäre «ein Name» wieder zwei.

**Zeichen.** Gedankenstrich ist **«—»** (Geviert), ohne Ausnahme. Der
Halbgeviertstrich «–» bleibt dem **Bis-Strich** vorbehalten und steht dort
**ohne Spatien**: «Art. 1–10», «01.01.2019–31.12.2021». Guillemets «…» wie im
DESIGN-REGLEMENT; Schweizer «ss» statt «ß».

**Geltungsbereich und was bewusst offen bleibt.** Der Wächter deckt die
V3-Fläche. Ausdrücklich **nicht** erfasst und darum weiter mit den alten Wörtern
unterwegs:

- die eingefrorene Ist-Hülle (`inhalt-*.tsx`, `LeserAnsichtMenu.tsx`,
  `parts/ErlassUebersicht.tsx`) — sie blieb bis **H5** unangetastet (FL-4).
  **Nachtrag 21.8.2026:** mit H5 (PR #560) ist die Ist-Hülle gelöscht, die
  Ausnahme damit gegenstandslos; `parts/ErlassUebersicht.tsx` besteht fort,
  gehört aber seither zu V3 (einzige verbliebene Hülle).
  **Eine deklarierte Ausnahme (P1-4, 18.8.2026):** der Fedlex-Link der
  V1-Übersicht hiess weiter «↗ geltende Fassung», während der V3-Kopf
  drei Zentimeter daneben «Amtliche Fassung ↗» sagte — derselbe Link auf
  dieselbe URL unter zwei Namen. FL-4 schützt die *Mechanik* der Ist-Hülle,
  nicht eine Beschriftung, die falsch orientiert; geändert ist genau dieses
  eine Wort, aus der geteilten Quelle `src/lib/benennung.ts`
  (dort stehen die Wörter, die über die Hüllen-Grenze laufen — und nur die);
- die App-Rahmen (`components/layout/**` Topbar/Pane-Griffleiste,
  `components/NormPopover.tsx`, `components/vorlagen/NormChip.tsx`) — dort
  stehen «Reiter & Split-View», «Suchen oder Norm springen …» und «↗ geltende
  Fassung». Das ist die **App-Hälfte von Ä112/Ä118/Ä110** und eine Entscheidung
  über die ganze Anwendung, nicht über den Leser; sie steht als S-Zeile im
  Fahrplan.

Wer den Geltungsbereich später ausweitet, ändert die Dateiliste im Wächter — und
sieht an der Zahl der roten Fälle sofort, wie viel noch offen ist.
