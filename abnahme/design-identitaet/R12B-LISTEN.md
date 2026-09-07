# R12B · Listen-Tabelle + Filterzeilen (D24) — Bau-Protokoll

**Auftrag** David 6.9.2026 zum Bild der Kantons-Erlassliste BS «Relevanz»: «das hier soll
tabellarisch aufgebaut sein sodass beide spalten jeweils zeile auf selber höhe haben».
Bindend: Zeile **D24** der Prüfbefunde, dazu der offene D22-Punkt (Filterzeile auf
/rechtsprechung und /vorlagen). Basis: `e1dff388d` (Stand nach D22-Merge). Parallel bauten
Fixer 1e (`layout/HeaderSuche`, `suche/**`), R6c (`gesetz-leser/**`) und R11
(`layout/Reiterleiste`, Shell, Pane) — alles unberührt.

---

## 1 · Der Befund, gemessen

Preview auf `dist`, `/gesetze?ebene=kanton&kt=BS&gliederung=relevanz`, 859 Erlasse.
Die beiden Spalten waren zwei unabhängige CSS-`columns`-Fragmente; jeder Titel brach
verschieden viele Zeilen um, also verrutschten die Zeilen gegeneinander:

| Breite | Zeilenpaar | y links | y rechts | Versatz |
|---|---|---|---|---|
| 1440 | 3 | 1090 | 1195 | **−105 px** |
| 1440 | 4–7 | — | — | −84 … −105 px |
| 1280 | 3 | 1132 | 1258 | **−126 px** |
| 1280 | 7 | 1364 | 1490 | −126 px |

Dieselbe Ursache stand seit dem 29.8.2026 als offener Punkt in
`RechtsgebietUebersicht.tsx` (L6): «die Metazeilen fluchten weiterhin nicht auf einer
Linie — Ursache sind ein- vs. zweizeilige Titel, das löst kein Gap, sondern nur eine
feste Titelhöhe». Mit D24 ist er erledigt.

## 2 · Der Bau

`src/components/ui/ListenTabelle.tsx` — EIN Listen-Baustein. Die Zeile ist eine
GRID-Zeile über beide Spalten: Zeile i links und Zeile i rechts sind dieselbe Zeile und
damit gleich hoch **by construction**, nicht by tuning. Gefüllt wird spaltenweise
(`grid-auto-flow: column` + `grid-template-rows: repeat(var(--tb-zeilen), auto)` mit
`--tb-zeilen = ceil(n/2)`), damit die Leserichtung aus LM-141 bleibt: erst links ganz
hinunter, dann rechts. Spalten: **Nummer/Kürzel · Titel · Meta**; Nummer und Meta in
Tabellenziffern (`.num`), Meta rechtsbündig; Haarlinien nur waagrecht; der Listenblock
trägt den Registerstrich der Domäne als linke Kante.

**Ein- oder zweispaltig — der Entscheid.** Einspaltig in voller Breite ist der Standard;
zwei Spalten erst ab **60 rem Container-Breite**. Gemessen: bei Fensterbreite 1280 ist der
Listen-Container 888–936 px, bei 1440 sind es 984–1032 px. Eine zweite Spalte bei 1280
liesse der Titelspalte noch ~230 px — das ist die Unruhe, die D24 abstellen will («wenn
zweispaltig unruhig bleibt, einspaltig»). Also: **zwei Spalten ab 1440-Klasse, eine bei
1280 und darunter.** Die Schwelle hängt an einer CONTAINER-Abfrage, nicht am Fenster —
dieselbe Liste steht auch in der halben Pane-Breite, und dort ist die Fensterbreite die
falsche Auskunft.

**Warum `<ul>`/Grid statt `<table>`:** eine echte Tabelle mit vier Spaltenpaaren müsste
die Einträge im DOM paaren; bei schmaler Breite (eine Spalte) wäre diese Paarung falsch
und verlangte entweder Umsortieren im DOM oder `display:block`-Overrides, die die
Tabellensemantik ohnehin wieder aufheben. Das Grid trägt EINE flache, leserichtige
DOM-Ordnung für jede Breite. Die Spaltenbedeutung steht als `aria-label` an der Liste
(«Erlasse nach Relevanz — Nummer, Titel, Umfang»).

**Warum nicht `ui/TrefferZeile` erweitert:** der Baustein dort STAPELT (Titel über
Untertitel über Meta) und kennt keine Nummern-Spalte; er hält gerade keine gemeinsamen
Spaltenspuren über die Zeilen hinweg — was hier die ganze Zusage ist.

## 3 · Nachher, gemessen

Zeilenpaare je Tabelle (nicht seitenweit — mehrere Tabellen je Seite), Preview `dist`:

| Sicht | @1440 | Raster | zweispaltig | geprüfte Paare | **max. Versatz** |
|---|---|---|---|---|---|
| BS Relevanz | ja | 1 | 1 | 429 | **0 px** |
| BS Systematisch | ja | 76 | 67 | 409 | **0 px** |
| BS Rechtsgebiet | ja | 1 | 1 | 429 | **0 px** |
| Bund Systematik | ja | 16 | 16 | 48 | **0 px** |
| Bund Rechtsgebiet | ja | 7 | 7 | 98 | **0 px** |

Summe 1'413 geprüfte Zeilenpaare, Versatz durchweg 0 px (vorher bis 126 px). Die
Zeilenhöhen eines Paares sind gemessen identisch (z. B. BS Relevanz: hL = hR = 54 px in
allen zehn ersten Paaren). @1280, @1024 und @390 ist die Liste einspaltig.
**Kein H-Overflow**: `scrollWidth == clientWidth` auf allen sechs geprüften Routen bei
1440/1280/390; 0 seitlich klippende Zellen.

## 4 · Was umgestellt ist (6 Listen), was gelöscht (2 Kopien)

| # | Liste | vorher |
|---|---|---|
| 1 | Kanton **Relevanz** (`GesetzeGliederung.KantonRelevanzListe`) | `columns` + `SysZeile` |
| 2 | Kanton **Rechtsgebiet** (`GesetzeGliederung.KantonGebietGruppen`) | `columns` + `SysZeile` |
| 3 | Kanton **Systematisch** (`gesetze-teile/KantonSystematik`) | `columns` + `SysZeile` |
| 4 | Bund **Rechtsgebiet-Grundgerüst** (`normtext/RechtsgebietSicht`) | 2-Spalten-Grid + `ErlassZeile` |
| 5 | Bund **Verordnungen/Ausführungsrecht** (`gesetze-teile/geteilt`) | 2-Spalten-Grid + `ErlassZeile` |
| 6 | Bund **Rechtsgebiets-Übersicht** (`gesetze-teile/RechtsgebietUebersicht`) | 3-Spalten-Grid + `ErlassZeile` Variante `leitgesetz` |

Gelöscht (§5/§10, Kopien statt Angleichung): **`ErlassZeile`** samt ihrer Variante
`leitgesetz` — deren Umkehrung «Titel führt, Kürzel sekundär» IST die Spaltenordnung der
Tabelle, sie braucht keinen Schalter mehr — und **`SysZeile`**.
Rückbau (§17): **`.lc-listenspalten`** in `index.css` gelöscht statt bewacht; kein
Aufrufer mehr, und der LM-141-Befund lebt zitiert im neuen `.tb-`-Block weiter.

**Nicht umgestellt, mit Grund:** die Entscheid-Zeilen (`rechtsprechung/EntscheidZeile`),
die Material-Karten und die Katalog-/Vorlagen-Zeilen. Sie stehen einspaltig gestapelt bzw.
in einem Grid — ihre Zeilen fluchten schon heute, der D24-Defekt existiert dort nicht
(gemessen: 0 `columns`-Vorkommen ausserhalb der drei Kanton-Listen). Und ihre
Inhaltsklasse ist eine andere: die Entscheid-Zeile trägt eine zweite Textzeile mit
klickbaren Norm-Chips, Leitentscheid-Marke und Sprach-Kürzel — in drei Tabellenspalten
gepresst ginge davon etwas verloren (§1/§8). Ein Zusammenzug ohne Defekt und mit
Verlustrisiko ist kein §5-Gewinn.

## 5 · Sprach-Diät und Anzeige-Dedupe (D24)

* Der Erklärabsatz «Die Kern-Erlasse zuerst — …» über der Kanton-Relevanz-Liste ist
  **entfallen**; sein Inhalt steht als `title` am Reiter «Relevanz»
  (`GLIEDERUNG_HINWEIS`). Die §8-Vorbehalte der beiden anderen Sichten (kantonale
  Sach-Achse meist Default; EU-Recht ohne SR-Nummer) bleiben sichtbarer Text: sie
  berichten eine Lücke, das ist keine Erklärung, die man wegkürzt.
* Die **Klammer-Nummer im Titel** entfällt in der Anzeige. GEMESSEN im Register am
  6.9.2026: 587 Titel enden auf eine Klammer-Zahl, und in **allen 587** Fällen sind deren
  Ziffern zeichengleich mit den Ziffern der Nummern-Spalte derselben Zeile (0
  Abweichungen). Entfernt wird ausschliesslich dieser bewiesene Identitätsfall — kein
  Heuristik-Schnitt auf «sieht aus wie eine Nummer». Das Datenfeld `titel` bleibt
  unangetastet (die Doppelung dort ist §5-Fläche der Korpus-Werkstatt).

## 6 · Filterzeile auf /rechtsprechung und /vorlagen (offener D22-Punkt)

R12A §4 hatte beide ausdrücklich offengelassen. Beide tragen jetzt die D22-Anatomie:
sichtbares Label «Filtern» über dem Feld (`.ub-filter`), Feld über die volle
Inhaltsbreite, Umfang in der Fuss-Zeile (`.ub-filter-fuss`, per `aria-describedby`
verknüpft).

* **/rechtsprechung**: das Feld sass in einer `flex-wrap`-Toolbar zwischen Sortierung und
  Ansichts-Umschalter. Die Ansichts-Wahl (Liste/Karten) ist von der Kasten-Gruppe auf
  Text-Schalter (`.ub-schalter`) umgestellt. Die **Sortierung bleibt `<select>`**: fünf
  Optionen — fünf Text-Schalter wären genau die Kasten-Wand, die D22 abräumt (dieselbe
  Begründung wie bei den Materialien-Facetten in R12A).
* **/vorlagen**: das Rechtsgebiet-Dropdown bekommt die Hülle und die volle Feldbreite; es
  bleibt ein `<select>` (~14 Rechtsgebiete). Die Reset-Option heisst jetzt «Alle
  Rechtsgebiete» statt «Alle» — mit dem Label «Filtern» stünde die Achse sonst nirgends
  mehr im Bedienelement.

**Nicht gebaut (offen):** die drei Facetten-Achsen auf /rechtsprechung (Gemeinwesen ·
Instanz · Sprache) stehen weiter als `.lc-chip`-Kästen. Sie kommen aus dem geteilten
`ui/FacettenGruppe`, das auch `/suche` bedient — dort baut in dieser Runde Fixer 1e. Eine
Umstellung gehört in einen Schritt, der beide Flächen zugleich verantwortet.

## 7 · Tore und Nachweise

`npm run lint` (0 Fehler, 1 Bestands-Warnung in `useUniversalSuche.ts`) · `npx tsc -b` ·
`npm run test` **447 Dateien, 7'331 Fälle grün** · `check:design-tokens` ·
`check:zaehler` · `golden:vergleich` **IDENTISCH, 256 Fälle byte-gleich** ·
`npm run build` · `check:e2e-shards` (118 Specs, Union deckungsgleich).

Playwright (Preview `dist`): `a11y`, `gesetze`, `gesetze-kanton-g5`,
`gesetze-ia-v2-walks`, `gesetze-ia4-scope`, `gesetze-ia5-rechtsgebiet-kanon`,
`gesetze-ia7-sidebar-badges`, `gesetze-az-register`, `uinav-j-rechtsprechung`,
`gesetze-rechtsgebiet-g6`, `gesetze-uebersicht-u`, `gesetze-rechtsgebiet-uebersicht-j3`,
`rechtsprechung`, `rechtsprechung-richter`, `rechtsprechung-besetzung-links`,
`suche-q-fokus-s1-s6`, `norm-sprung`, `gesetze-footer-cls`.

Screens (hell + dunkel, 1440/1280/390): `r12b-{bs-relevanz,bs-systematisch,
bund-systematik,rechtsprechung,materialien,vorlagen}-{1440,1280,390}-{hell,dunkel}.jpg`.

### Deklarierte Test-Anpassungen

| Datei | Was | Warum |
|---|---|---|
| `e2e/gesetze-uebersicht-u.e2e.ts` | Latte «Kern-Erlasse zuerst» → `getByRole('list', {name:/Erlasse nach Relevanz/})`; Titel-Fall zusätzlich auf `title`-Vollständigkeit geprüft | der Erklärabsatz ist auf Weisung entfallen (D24); A14s ABSICHT — der volle amtliche Titel muss erreichbar bleiben — wird schärfer geprüft statt fallengelassen |
| `e2e/{rechtsprechung-richter,suche-q-fokus-s1-s6,uinav-j-rechtsprechung}.e2e.ts` | Feld-Locator «Rechtsprechung durchsuchen» → «Filtern» | der sichtbare Text IST der zugängliche Name (WCAG 2.5.3) — dieselbe Umstellung wie in R12A |
| `src/tests/katalog.test.tsx` | «Alle» → «Alle Rechtsgebiete» | die Achse steht nach der D22-Hülle nur noch in der Option; Zusicherung (Reset-Option existiert) unverändert |

## 8 · Vorgefundener Rot-Stand (Nullproben, nicht von diesem Bau)

* `e2e/gesetze-az-register.e2e.ts` → «Register nur auf dem Landeplatz (G4)»: rot mit
  derselben Meldung wie in R12A §5 dokumentiert (`getByText(/Systematische Sammlung|
  Erlasse/).first()` löst auf eine H3 in einer zugeklappten `<details>` auf, «hidden»).
  Nicht angepasst — einen fremden roten Test grün zu locatorn hiesse, einen Befund zu
  verstecken (§6.3/§8). Gehört zum Rahmen-Fixer.
* `e2e/rechtsprechung.e2e.ts` → V5 «im Lesemodus verschwindet der Rail — keine Zahlen
  neben toten Sprungzielen (§8)»: **Nullprobe auf `e1dff388d`** (eigener Worktree, eigener
  Bau, Fall einzeln gelaufen): dort ebenfalls ROT, mit derselben Meldung (der Klick auf
  «schliessen» wird vom `role=dialog`-Lesemodus-Overlay abgefangen, 30 s Timeout).
* `e2e/rechtsprechung.e2e.ts` → V5 «A9: Rail-Sprung + Suche flüssig unter CPU-Throttle,
  CLS 0»: **flakig, und zwar auf der Basis stärker als auf diesem Stand.** Gemessen je
  `--repeat-each=4 --workers=1`, warme Preview: Basis `e1dff388d` **3 von 4 rot**, dieser
  Stand **1 von 4 rot**. Der gerissene Wert ist in JEDEM roten Lauf zeichengleich
  derselbe — `0.000631275720164609` gegen eine Latte von exakt 0 —, also eine feste,
  intermittierend ins Messfenster fallende Verschiebung, keine Grössenordnung, die dieser
  Bau erzeugt hätte.
Beide betreffen `EntscheidLeser`/`LesemodusOverlay`/`ErwaegungsRail` — Dateien, die dieser
Bau nicht berührt. Nicht angepasst: einen fremden roten Fall grün zu locatorn hiesse,
einen Befund zu verstecken (§6.3/§8). Zur Weitergabe an den zuständigen Fixer; die
CLS-Latte «exakt 0» ist zudem ein Kandidat für einen Wurzel-Fix (§17): eine Schwelle, die
in drei von vier Läufen an 0.0006 scheitert, misst die Messung, nicht die Seite.
