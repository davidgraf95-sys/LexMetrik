# R5 — Fixer 1c «Rahmen nach Davids Entscheiden 6.9.2026»

Branch `feat/w2-24-r5-f1c`, abgezweigt von `bafbd7886` (Stand nach Fixer 1b +
R10-Nachzug). Auftrag: D17 · D18 · D16/D15 · Reiterleisten-Hydration ·
Reiter-Kurzform. Parallel baute R6 (Leser, Übersichts-Köpfe) — nicht berührt.

## Davids Worte, und was daraus wurde

| Wortlaut 6.9.2026 | Umsetzung |
|---|---|
| «ich mochte die seitenleiste. können wir die behalten. und das oben entfernen?» (D17) | Bereichs-Reiter im Titelblatt ersatzlos gestrichen; Seitenleiste steht auf **jeder** Route, auch «/» |
| «insgesamt braucht es auf der startseite keine suche. nur oben reicht» (D18) | Hero-Suche auf «/» entfernt, Kopf-Suche auf jeder Route; `/?q=` leitet auf `/suche?q=` |
| «per drag and drop soll man register verschieben können … in der reiter liste, analog browser» (D15) | Zieh-Affordanz: `cursor: grab/grabbing`, Drag-Ghost mit Griffpunkt, Einfügemarke links/rechts aus dem Zeiger-X, Alt+Shift+←/→ |
| «es geht nur wenn nur gesetze offen sind — bug» (D16) | Wurzel-Fix: Arbeitsleiste zeigt die reine Speicherreihenfolge |
| «keine funktion darf verloren gehen» | `?q=`-Permalink, Kürzel «/»/⌘K, Bereichs-Navigation, Aktivmarke, Reiter-Gruppierung — je an einen Ort verschoben, nirgends gestrichen (Tabelle unten) |

## 1 · D17 — das Titelblatt trägt keine Navigationsliste mehr

`layout/Topbar.tsx`: der `<nav aria-label="Bereiche">` mit «Sammlung · Gesetze ·
Rechtsprechung · Materialien · Rechner · Vorlagen» ist weg. Es bleiben Marke
(Startseiten-Link) · Suche · Werkzeuge. `layout/Shell.tsx`: `ohneSeitenleiste`
(= `pathname === '/'`) samt Prop entfernt — die Leiste steht überall.

**Rückbau statt Bewachung** (§17-Gegengewicht): mit den Reitern fallen
`START_REITER`, `REG_RAND` und `REG_RAND_HOVER` aus `layout/bereiche.ts`.
`BEREICHE`/`registerVonPfad` bleiben — sie speisen Seitenleiste, Reiterstrich
und Siegel.

**Was nicht verloren geht:** die Bereichs-Navigation und die Aktivmarke der
Domäne trägt die Seitenleiste (Registerfarbe am Gruppenkopf, Fixer 1); die
mobile Schublade ist unverändert; der Weg zur Startseite ist die Marke.

## 2 · D18 — eine Suche, und zwar die im Kopf

`Topbar`: der `!aufStartseite`-Guard um `HeaderSuche` ist weg.
`start/SuchBlock.tsx`: `UniversalSuche` und die Beispiel-Zeile («Die Taste /
springt hierher. Beispiele: Art. 336c OR · …») entfernt; die Begrüssung bleibt
gross (D14). `start/UniversalSuche.tsx` gelöscht.

**Rückbau:** `useSuchKuerzelUmleitung` (rund 90 Zeilen in `Topbar.tsx`) hatte
genau einen Fall zu bedienen — «der Kopf trägt kein Feld» — und den gibt es
nicht mehr.

**Was nicht verloren geht:** `?q=` war eine echte Funktion (teilbarer Permalink
auf eine Suche). Die Kopf-Suche ist bewusst ein Dropdown ohne Adress-Kopplung
(«kein ?q=-Umweg», `HeaderSuche.tsx`), also zieht der Permalink dorthin, wo er
hingehört: `/?q=…` → `/suche?q=…`. Die Volltext-Suche liest `?q=` seit jeher und
führt denselben Hook (`useUniversalSuche`, §5). Bewacht von
`e2e/suche-q-fokus-s1-s6.e2e.ts`.

**Nebenfund, behoben:** axe `scrollable-region-focusable` (serious) an der
Panel-Hülle der Kopf-Suche. Sie scrollt, enthält aber keinen fokussierbaren
Knoten (Treffer sind `role="option"` und bewusst keine Tab-Stationen,
Cowork-Befund 38). Der Fall war unentdeckt, weil axe die offene Suche nur auf
«/» prüfte — und dort stand bis heute die Hero-Suche. `tabIndex={-1}`: axe
zufrieden, keine neue Tab-Station (dasselbe Muster wie das Reiter-Blatt).

## 3 · D16/D15 — Reiter umordnen, über alle Arten hinweg

### Rot-Beweis (§6.7), gefahren am 6.9.2026 gegen `f4ea09ff1`

Neuer Wächter `e2e/w224-reiter-umordnen-d16.e2e.ts`, acht Kombinationen aus dem
Repro-Skript plus zwei Affordanz-Fälle:

```
1 passed  ·  9 failed
grün:  G→G (nur Gesetze — genau Davids «es geht nur wenn nur gesetze offen sind»)
rot:   E→G · G→E · R→G · G→R · R→E · V→G · gemischt G/E/R/V ans Ende
rot:   D15 cursor/Einfügemarke · D15 Alt+Shift+←/→
```

Nach dem Fix: **10 passed**.

### Ursache und Fix

`Reiterleiste.tsx:170–180` baute die sichtbare `ordnung` aus dem Speicher NEU
auf — gebündelt nach `KAT_ORDER`, innerhalb «gesetze» nach `HERKUNFT_ORDER`.
`lib/tabs.ordneTabsUm` verschiebt aber den FLACHEN Speicher; jede Verschiebung
über eine Kategoriegrenze sammelte das Bucketing sofort wieder ein. Innerhalb
einer Kategorie fiel das nie auf — daher Davids Beobachtung.

Fix: `const ordnung = tabs` — die Arbeitsleiste zeigt die Speicherreihenfolge.
Man ordnet, was man sieht (analog Browser). **Die Gruppierung nach Art ist nicht
verloren:** sie bleibt im Überlauf-Blatt (`TabPanel`), wo sie eine Liste ordnet
und niemand zieht. Dass Leiste und Blatt verschieden sortieren, ist die
Aufgabenteilung: Arbeitsfläche gegen Verzeichnis.

### Affordanz (D15 — «die Funktion war da, nur nicht erkennbar»)

* `cursor: grab` an der Reiter-Hülle, `grabbing` beim Ziehen.
* Expliziter Drag-Ghost mit Griffpunkt (`setDragImage` + Zeiger-Offset); der
  gezogene Reiter nimmt sich am alten Platz zurück (`opacity-40`).
* Einfügemarke: 2 px in der Registerfarbe des GEZOGENEN Reiters, volle
  Reiterhöhe, links oder rechts je nach Zeiger-X über der Ziel-Hälfte. Vorher
  war es ein immer linker `border-l-2` — der konnte nicht sagen, ob davor oder
  dahinter eingerastet wird, und ans Ende der Leiste kam man mit ihm gar nicht.
  Beleg: `r5f1c-ziehen-zoom.jpg`.
* Ziel-Hervorhebung beim Ziehen in die zweite Hälfte: `usePaneDnd` unverändert;
  die Marke trug noch `border-l-brass-700` (das letzte Gold auf diesem Pfad) →
  Tinte.
* Tastatur (WCAG 2.1.1): **Alt+Shift+←/→** verschiebt den aktiven Reiter. Kein
  Umlauf am Rand — ein Reiter, der links gedrückt plötzlich rechts steht, ist
  verloren statt verschoben. Alt+Ziffer und Alt+W bleiben; Alt+←/→ ohne Shift
  gehört dem Browser.
* `lib/tabs.ordneTabsUm` bekommt einen optionalen dritten Parameter `davor`.
  Der Default reproduziert die frühere richtungsabhängige Regel **bit-gleich** —
  die ▲/▼-Knöpfe der Reiter-Liste haben kein Zeiger-X und bleiben unangetastet
  (§6.3, die bestehenden Unit-Fälle laufen unverändert).
* Startseiten-Module ausdrücklich NICHT per Ziehen (D15: Pfeile bleiben).

## 4 · Reiterleiste-Hydration — CLS

**Vorher/Nachher, gemessen 6.9.2026** (Preview 4352, Chromium 1440×900,
`PerformanceObserver` auf `layout-shift`, `buffered: true`, 2.5 s nach `load`;
der Vorher-Wert durch Rückbau genau dieses Hunks und vollen Neubau erzeugt):

| Route | Reiter | vorher | nachher |
|---|---|---|---|
| `/rechner/tagerechner` | 0 (kalt) | **0.02333** ← `main#inhalt` | **0.00028** |
| `/rechner/tagerechner` | 2 geseedet | 0.00078 | 0.00078 |
| `/` | 0 (kalt) | 0.00012 | 0.00012 |
| `/` | 3 geseedet | 0.00095 | 0.00095 |

Der Vorher-Wert reproduziert den R10-Nullproben-Befund (0.025) samt Quelle:
`main#inhalt` rutschte um 34 px = `--app-reiter-h`, weil der Prerender keinen
`localStorage` kennt und die Leiste erst nach der Hydration erschien.

**Wurzel-Fix:** die Zeile ist immer da und immer gleich hoch. Ohne offene
Reiter ein stummer, `aria-hidden` Platzhalter in derselben Geometrie — kein
Text (ein «keine Reiter offen» stünde auf jeder Kaltstart-Seite und wäre eine
Auskunft über nichts) und keine Navigations-Landmark ohne Ziele.

Der Rest (0.0003–0.001) ist WAAGRECHT und liegt innerhalb des Streifens: die
Reiter-Beschriftung wird schmaler, sobald die lazy geladenen Manifeste die
Kurzform liefern. `main` bewegt sich nicht mehr. `e2e/ics-export-z1.e2e.ts` A9
(Schwelle ≤ 0.01) ist grün.

## 5 · Reiter-Kurzform (V4/F5-Rest)

Gemessen: der Rechner-Reiter hiess «Fristenrechner (Tage · ZPO · SchKG)» — 34
Zeichen für eine Zeile, die «Fristenrechner» sagen soll, und der breiteste im
Streifen. Die Klammer ist der Katalog-UNTERTITEL, nicht der Name.
`ohneUntertitel()` streicht deterministisch **nur** eine Klammer am Ende, und
nur, wenn davor etwas steht; Gesetze und Entscheide gehen diesen Weg NICHT
(dort ist eine Klammer Teil der Zitierung, §1). Die volle Bezeichnung bleibt im
`title` und in der Reiter-Liste (§8).

H1 und Brotkrume bleiben unangetastet — der Entscheid vom 17.8.2026 («keine
Doppelkrume») gilt dem Pane-Kopf, nicht dem Reiter.

**L6 bleibt offen** (PaneKopf: primäres Pane ohne Namen, Platzhalter «(aktuelle
Adresse)»): Davids Entscheid steht aus. Kompromiss bis dahin unverändert — im
Split trägt der Pane-Kopf rechts den Namen, links den Platzhalter
(`r5f1c-split-hell-1440.jpg`).

## 6 · Optik nach dem Umbau (gemessen)

* Titelblatt-Höhe @1440: **64 px** (= `--app-krone-h`, unverändert; die
  Leser-Sprungoffsets rechnen damit).
* Arbeitsleiste: **34 px** (= `--app-reiter-h`), auch leer.
* Werkzeuge rechts: Farbschema-Knopf bei x = 1315 von 1440 — bündig, und auf
  «/» wie auf `/gesetze` an derselben Kante (±2 px, bewacht).
* @390: Marke sichtbar (§-Siegel), Kopf-Suche als Lupe.
* Seitenleiste auf «/»: Registerfarben-Gruppenköpfe (Gesetze blau,
  Rechtsprechung rot, Materialien grün, Rechner/Vorlagen ocker), Aktivmarke
  «Start» oben.
* Reiter-Ordnung im DOM = Speicherordnung (`OR · BEZ.2022.42 · Fristenrechner ·
  Arbeitsvertrag · Gesetze`), Split-Marken ◧/◨ vorhanden.

### Belege

`r5f1c-start-hell-1440.jpg` · `r5f1c-start-dunkel-1440.jpg` ·
`r5f1c-start-hell-390.jpg` · `r5f1c-start-dunkel-390.jpg` ·
`r5f1c-gesetze-hell-1440.jpg` · `r5f1c-gesetze-dunkel-390.jpg` ·
`r5f1c-leser-hell-1440.jpg` · `r5f1c-leser-dunkel-1440.jpg` ·
`r5f1c-leser-hell-390.jpg` · `r5f1c-split-hell-1440.jpg` (4 gemischte Reiter) ·
`r5f1c-ziehen-einfuegemarke.jpg` + `r5f1c-ziehen-zoom.jpg` ·
`r5f1c-reiterblatt-hell-1440.jpg`

## 7 · Deklarierte Test-Änderungen (§6.3)

Jede trägt ihre Begründung am Fundort; keine wird schwächer.

| Datei | Änderung |
|---|---|
| `e2e/suche-q-fokus-s1-s6.e2e.ts` | D10-Wächter gedreht: Zusage «auf «/» genau EIN Suchfeld, Fokus/Kürzel/Panel folgen ihm» unverändert, nur ist es jetzt das Kopf-Feld. Neu: `/?q=`-Permalink-Fall |
| `e2e/w223b-kopf-seitenleiste.e2e.ts` | §6.1 gedreht (Kopf-Feld auf jeder Route); neuer D17-Fall (Seitenleiste auf «/», kein Bereichs-Nav im Titelblatt) |
| `e2e/a11y.e2e.ts` | axe-Zustand «offene Suche auf /» misst das Kopf-Feld statt der entfallenen Hero-Section |
| `e2e/w224-reiterverhalten.e2e.ts` | 5× Rückweg-Klick vom Bereichs-Reiter auf denselben Link in der Seitenleiste; Testaufbau setzt die Seitenleisten-Wahl vorab. Fall (b) benennt den Reiter statt ihn per `.first()` aus der DOM-Ordnung zu greifen (die war das Bucketing, das D16 als Bug entlarvt hat) |
| `e2e/startseite-pult-r10.e2e.ts` | «nicht abschaltbar»-Sonde greift die Titelzeile statt der entfallenen Pult-Suche |
| `src/tests/tabsSsr.test.tsx` | «rendert NICHTS bei 0 Reitern» → «reserviert nur die Höhe»; schärfer: keine Landmark, kein Reiter, aber die Höhe steht |
| `src/tests/katalog.test.tsx` | Startseite trägt kein `role="search"` mehr — Erwartung umgedreht statt gestrichen |
| `src/tests/design-r3b-chrome.test.ts` | ✕-Ausnahme für die gelöschte `UniversalSuche.tsx` entfällt; der R6-C-Messwert bleibt als datierter Beleg stehen (§0 Ziff. 2b) |
| `src/tests/tabs.test.ts` | NEU: `ordneTabsUm` mit ausdrücklicher Seite (davor/dahinter). Die bestehenden Fälle unverändert grün — der Default ist bit-gleich |
| `e2e/w224-reiter-umordnen-d16.e2e.ts` | NEU (Shard-Gruppe 2) |

## 8 · Tore

```
npm run lint             0 errors (1 Alt-Warnung useUniversalSuche.ts:176)
npx tsc -b               grün
npm run test             445 Dateien, 7319 Tests, 2 übersprungen
npm run check:design-tokens   grün
npm run check:farbwelt        grün (146 Pflichtpaare; 4 beratende Alt-Warnungen)
npm run check:seo-index       grün
npm run golden:vergleich      IDENTISCH — 256 Fälle byte-gleich
npm run build                 grün, 63 Routen prerendered
npm run check:e2e-shards      grün, 117 Specs
Playwright (10 Specs des Auftrags)  118 grün
```

## 9 · Offen

* **L6** (PaneKopf-Platzhalter «(aktuelle Adresse)») — wartet auf David.
* Der leere Reiter-Streifen ist auf Kaltstart-Seiten ein 34-px-Band ohne
  Inhalt. Das ist der bewusste Preis für CLS 0; wenn er David optisch stört,
  wäre die Alternative eine Höhen-Reservierung ohne sichtbare Unterlinie.
* Der waagrechte Rest-CLS (0.001) käme erst weg, wenn die Reiter-Beschriftung
  ohne Manifest-Nachladen feststünde — eigener Schritt, ausserhalb dieses
  Auftrags.
