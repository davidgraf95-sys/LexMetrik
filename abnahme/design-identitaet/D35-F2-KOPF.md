# D35-F2 — Kopf ohne Artikel-Zahl, Erlass-Blatt, Rubriken abwählbar

Vollzugsvermerk zu W2·24-DESIGN-IDENTITAET, Bau-Einheit D35-F2.
Entscheid David 7.9.2026: **Variante A** des D35-Vorschlags, mit dem Nachtrag
«man soll mittels ansicht alles einzelne abwählen können» und dem Entscheid
«beides» zur Frage aufklappen ODER im Blatt öffnen.

Grundlage: `feat/w2-24-d35-f2-kopf` auf dem F1-Zweig `c6e1d63bf` (enthält main
`593111a04` inkl. F3/F4). Alle Messungen 7.9.2026, Preview `:4437`, Chromium,
`deviceScaleFactor 2`, ZPO `#art-271` bzw. OR `#art-336_c`.

---

## Klartext (für David)

1. **Oben steht keine Zahl mehr.** Der Knopf im Erlass-Kopf hiess «⚖ Rechtsprechung 24»
   und nannte damit dieselbe Zahl wie die Zeile am Artikelende zwei Zentimeter darunter.
   Er heisst jetzt **«Erlass ▾»** und öffnet dasselbe Blatt wie vorher — nur ohne Zahl.
   Die Zahl steht ab jetzt an genau einem Ort: unten am Artikel.
2. **Der Schalter «Rechtsprechung im Kopf» ist weg**, ersatzlos. Er versteckte eine Zahl,
   die es nicht mehr gibt. Nebenbei behoben: mit ihm auf «aus» versprach die Zeile am
   Artikel weiter «11 Entscheide» und zeigte beim Aufklappen nichts.
3. **Neu im Ansicht-Menü: «An diesem Artikel zeigen».** Fünf Häkchen — Entscheide,
   Materialien, Verweise, Rechner, Aktionen. Was Du abwählst, verschwindet unten am
   Artikel ganz: Zahl und Inhalt. Wählst Du alles ab, verschwindet die Zeile samt Linie.
   Darunter eine Zeile «Alles ausblenden», die im abgewählten Zustand «Alles zeigen»
   heisst — der Weg hin und zurück ist derselbe Klick. Die Wahl bleibt gespeichert.
4. **In der aufgeklappten Rubrik «Entscheide» steht neu «im Blatt öffnen ›»** — sie
   klappt weiterhin auf wie bisher, und wer die Liste lieber neben dem Text hat, bekommt
   sie mit einem Klick dorthin.
5. **Wartet auf dich:** die Menü-Zeile heisst «Alles ausblenden» und nicht «Nur
   Gesetzestext», und sie lässt die Änderungs-Wahl («Fassung / Fussnoten / aus») in Ruhe.
   Grund unten unter «Abweichungen». Wenn Du «Nur Gesetzestext» willst, muss der
   Schriftregler im selben Menü einen anderen Namen bekommen — das ist Dein Entscheid,
   weil «Nur Gesetzestext» dort auf Deinen eigenen Entscheid 5B zurückgeht.

---

## Was gebaut wurde

### (a) Kopf-Entlastung

| Vorher | Nachher |
|---|---|
| «⚖ Rechtsprechung 24» (`voll`) / «⚖ 24» (`mini`) | «Erlass ▾», auf jeder Breite gleich |
| `data-v3-panel-anzahl` am Kopf-Griff | kein Attribut, keine Ziffer im Accessible Name |
| Accessible Name «Rechtsprechung und Kontext zu Art. 271 öffnen — 24 Entscheide» | «Erlass-Blatt öffnen — Entscheide, Änderungen, Materialien und Anwendung» |
| Schalter «Rechtsprechung im Kopf» im Ansicht-Menü | ersatzlos gestrichen |
| Menü-Eintrag «Entscheide & Kontext …» (Ä92, nur ohne Chip) | ersatzlos gestrichen |

**Rückbau (§17-Gegengewicht), alles ersatzlos, keine Leiche:**
`panelModell.oeffnerLabelKompakt` · `zaehlerAttribut` · `oeffnerName(anzahl, artikel)` ·
`artikelZahl` · `PanelZustand.oeffnerSichtbar` · `kopfElemente(...).panel` ·
`KopfElemente['panel']` · Store-Feld `leitfaelle` samt `OptFeld`/`OptWert`/`FELDER`/
`setzeOption` · Attribut `data-leitfaelle` am `<html>` · Props `onPanelOeffnen`
(`LeserRahmenV3` → `LeserKopf` → `LeserAnsichtV3`) · Alias `V3Switch` ·
zweiter `useBezuegeZaehler`-Konsument im Rahmen · e2e-Helfer `schalterAus`.

Der Bestands-Wert `leitfaelle` wird weiter **gelesen** — für die eine
Bestands-Migration, die an ihm hängt (Bezugs-Facetten in `lade()`); er wird nicht
mehr geschrieben und fällt beim nächsten `speichere()` weg.

Der Reiter «Entscheide» des Blattes bleibt unverändert erreichbar; die
Reiter-Ordnung ist **nicht** angefasst (Begründung unter «Abweichungen»).

### (b) Sekundär-Griff «im Blatt öffnen ›»

`parts/BezuegeKopf.tsx` bekommt einen Slot `nebenGriff` am Fuss des aufgeklappten
Blocks; `parts/ArtikelLeser.bezuegeFuss.tsx` füllt ihn **nur** an der Rubrik
«Entscheide» — sie ist die einzige, die im Blatt eine eigene, artikelscharfe Fläche
hat («Materialien»/«Anwendung» sind dort erlassweit; ein Griff, der woandershin führt
als er verspricht, wäre die Scope-Verwechslung D-3/D-4).
Der Griff ruft `panel.oeffneEntscheide` — einen **referenz-stabilen** `useCallback`
aus `usePanelZustand`. Ohne ihn wäre die `memo`-Schranke von `parts/ArtikelLeser`
über 1686 Artikel aufgehoben (§15).

### (c) Rubriken-Wahl im Ansicht-Menü

Neue Datei `v3/LeserRubrikenWahl.tsx` (Muster: `v3/LeserAenderungsWahl.tsx`) —
`LeserAnsichtV3.tsx` stand bei 399 der 420 zulässigen Zeilen (§6.6).

* Gruppenkopf **«An diesem Artikel zeigen»** — Zähl-Substantiv aus der EINEN
  Ableitung (`erlassAnsicht.bestimmungDativ`), an einem §-Erlass also «An diesem
  Paragraphen zeigen». `bestimmungsWort` wird durchgereicht
  (`LeserRahmenV3` → `LeserKopf` → `LeserAnsichtV3` → `LeserRubrikenWahl`).
* Fünf `menuitemcheckbox` mit Kasten-Marke: Entscheide · Materialien · Verweise ·
  Rechner · Aktionen (`data-v3-fussrubrik="r|m|g|w|a"`).
* Eine `menuitem`-Zeile «Alles ausblenden» ⇄ «Alles zeigen»
  (`data-v3-fussrubriken-alle`).
* Zustand im geteilten Store: **ein** Feld `fussRubriken: readonly FussRubrik[]`
  (`leserOptionen.ts`) mit Whitelist-Migration; fehlender Schlüssel ⇒ Grundzustand,
  leeres Array ⇒ bewusste Nutzerwahl (§8, wie `bezugKlassen`).

**Die Schaltung ist CSS, nicht React (§15).** Der Store schreibt EIN Attribut ans
`<html>`; `src/index.css` blendet danach aus. Ein Abo je Artikel wären im OR 1686
Neu-Renderings je Klick — dieselbe Rechnung, an der schon der gemerkte
Aufklapp-Zustand der Zeile gefallen ist (D35-F1).

**Das Attribut trägt die ABGEWÄHLTEN, nicht die gewählten** (`data-fuss-aus`).
Mit den Gewählten hätte die Regel `html:not([data-fuss-an*="r"])` lauten müssen — und
die greift auch, solange es das Attribut noch gar nicht gibt, also am prerenderten
HTML **vor** dem Bündel: der Leser sähe für einen Moment einen Artikel ganz ohne
Funktionszeile. So ist der Grundzustand die leere Zeichenkette, keine Regel greift,
und das ausgelieferte Markup bleibt byte-gleich (R6/§6, gemessen: `data-fuss-aus=""`).

**Nachfix aus der Bild-Kontrolle (§8):** ZPO Art. 272 führt genau EINE Rubrik. Mit
abgewählter Rubrik stand dort «Bezüge» allein neben den Aktionen — eine Überschrift
über nichts (gesehen am ersten Stand von `d35-f2-c`). `parts/BezuegeKopf.tsx` schreibt
seither `data-bez-marken` (die Buchstaben, die dieser Artikel wirklich führt), und die
CSS-Regel ist eine **Anschalt-Liste** aus vier Zeilen statt der sechzehn Teilmengen,
die die Umkehrung gekostet hätte — `:has()` bleibt aussen vor (§15).

---

## Wächter und Rot-Proben (§6.7)

Neu: **`e2e/w224-d35-f2-kopf.e2e.ts`** (Shard-Gruppe 5), 9 Fälle.

| Zusage | Rot-Probe | Beobachtetes Rot |
|---|---|---|
| (a) genau EIN Ort nennt die Entscheid-Zahl je Artikel (`[data-v3-panel-anzahl]` + sichtbare `.lr7-bez-marke[data-reg=r]` = 1) | `v3/LeserPanelOeffner.tsx`: `data-v3-panel-anzahl={11}` am Griff | «Entscheid-Zahl an 2 Orten (Kopf 1, Zeile 1) — genau einer ist die Zusage» |
| (b) eine abgewählte Rubrik verliert Zähler UND Inhalt | `src/index.css`: den Regelblock `html[data-fuss-aus*="…"]` löschen | «locator `#art-271 .lr7-bez-marke[data-reg="r"]` Expected hidden, Received visible» |
| (b) Grundzustand emittiert kein Attribut mit Inhalt | `leserOptionen.ts`: `fussAusWert` gibt `gewaehlt.join('')` zurück (Polarität vertauscht) | «Expected `""`, Received `"rmgwa"`» |
| (b) «Bezüge» steht nur, solange es etwas benennt | `src/index.css`: die vier Anschalt-Zeilen durch eine pauschale `display:block`-Regel ersetzen | «‹Bezüge› steht über einer leeren Rubrik-Liste» |

Weitere Fälle ohne eigene Rot-Probe (sie hängen an denselben vier Stellen): der Griff
öffnet weiterhin das Blatt mit allen vier Reitern · «im Blatt öffnen ›» wählt den
Reiter «entscheide» · die Aktionsgruppe ist eine Rubrik · alles abgewählt ⇒ die Zeile
verschwindet, «Alles zeigen» holt sie zurück · die Wahl überlebt den Reload
(`data-fuss-aus="g"`, Menü zeigt denselben Stand).

### Deklarierte Sonden-Umstellungen (§6.3)

Alle mit dem Grund «das Steuerelement bzw. die Zahl, die der Fall prüfte, gibt es
ersatzlos nicht mehr»; die datierten Belege (F8-Regel 16.8.2026, A2/Ä92 17./18.8.2026,
N1 7.9.2026, H4-II NM-2) bleiben **unverändert** am Ort stehen und werden nur ergänzt
(§0 Ziff. 2b).

* `e2e/w224-leser-d32-d33.e2e.ts` (k): N1-Gleichheit «Kopfzähler = Bezüge-Zeile» →
  «die Funktionszeile trägt die Zahl, der Kopf-Griff keine».
* `e2e/leser-v3-panel-zaehler.e2e.ts`: (a) ohne Zahl-Attribut, Beschriftung wechselt
  beim Öffnen nicht; (b) gestrichen; (d) ohne Schalter-Vorbedingung.
* `e2e/leser-v3-panel-nachzug.e2e.ts`: (b) gestrichen, Helfer `schalterAus` gestrichen.
* `e2e/leser-v3-kopf.e2e.ts`: (a3) «@390 steht der Weg zum Blatt unbedingt in der
  Kopfzeile» (ein Tap statt zwei); (g) Ä92 ohne Fallunterscheidung, dazu neu der
  Sammel-Marker `[data-v3-panel-oeffner]` = 1.
* `e2e/leser-optionen.e2e.ts`: fünf Rubriken-Checkboxen statt einer, Negativ-Sonde
  auf `data-leitfaelle`, Positiv-Sonde auf `data-fuss-aus=""`.
* `e2e/leser-v3-umschalten.e2e.ts`: Nachbarzahl 1 → 5 (Literal, nicht aus
  `FUSS_RUBRIKEN` abgeleitet — ein Wächter, der seine Erwartung aus dem Prüfling
  zieht, prüft nichts).
* `src/tests/`: `leser-v3-panel.test.tsx` (vier `describe` gestrichen, einer neu:
  Wort «Erlass», Name nennt die vier Reiter, keine Ziffer) · `leser-v3-kopfstufen`
  · `leser-optionen-migration` (zwei neue Fälle zur `fussRubriken`-Migration) ·
  `leser-schriftskala` · `leser-v3-bauteile`.

---

## Tore

| Tor | Ergebnis |
|---|---|
| `npx tsc -b` | grün (Exit 0) |
| `npm run lint` | grün — 0 Fehler, 1 Bestands-Warnung (`useUniversalSuche.ts`, unberührt) |
| `npm run test` | 461 Dateien, **7467 grün**, 2 skipped |
| `npm run golden:vergleich` | IDENTISCH — 256 Fälle byte-gleich |
| `npm run check:golden-normtext` | OK — 60257 Knoten, 0 Waisen, 0 Ausnahmen |
| `npm run check:schlankheit` | GRÜN — 1492 Dateien, keine Neuzugänge über der Schwelle |
| `npm run check:e2e-shards` (nach `gen:e2e-shards`) | grün — 150 Specs, Union deckungsgleich |
| `PERF_RUNS=1 npm run check:perf-lighthouse` | GRÜN — CLS 0.000 an allen vier Messpunkten (Schranke 0.05); OR Score 40, LCP 9.66 s, TBT 1989 ms normiert |
| Playwright, betroffene Specs, `--repeat-each=2 --workers=2` | **168/168 grün** (7.7 min) |
| Playwright, Nachlauf nach dem «Bezüge»-Nachfix | 27/27 grün |

Breitere Regression (ohne `repeat-each`): 93/93 grün über `leser-v3-panel-*`,
`leser-v3-rahmen`, `leser-v3-uebersicht`, `leser-v3-kontext-cls`,
`leser-v3-prerender-bezuege`, `leser-v3-scrim-b7n1`, `leser-bezuege-inhalt-d30`,
`leitfaelle-chips`, `leser-lesemass`.

---

## Abweichungen vom Auftrag (§7, offengelegt)

1. **«Nur Gesetzestext» ist nicht der Name der neuen Zeile.** Der Auftrag verlangte,
   die Semantik eines *bestehenden* Menü-Eintrags «Nur Gesetzestext» zu erweitern
   (alle Rubriken aus **und** Vermerke aus). Einen solchen Eintrag gibt es nicht:
   «Nur Gesetzestext» ist im selben Menü die sichtbare **Scope-Angabe des
   Schriftreglers** (`MenueRegler label="Nur Gesetzestext"`, Entscheid David 5B vom
   29.8.2026 — «‹Nur› ist kein Füllwort, es ist die Abgrenzung zu ‹Ganze Seite›»).
   Ein zweites Element mit demselben Wortlaut wäre Ä114 eine Ebene tiefer.
   Gebaut ist darum **«Alles ausblenden» / «Alles zeigen»**.
2. **Diese Zeile rührt die Änderungs-Wahl nicht an.** Eine Zeile innerhalb der Gruppe
   «An diesem Artikel zeigen», die still eine Radiogruppe eine Gruppe weiter oben
   umlegt, wäre genau die versteckte Nebenwirkung, gegen die der Gruppenkopf steht
   (§8). Die Änderungs-Wahl trägt ihre eigene Stellung «aus»; «nur der Gesetzestext»
   kostet damit zwei Klicks statt einem. **Entscheid David**, ob (1) und (2) so
   bleiben oder der Schriftregler umbenannt wird.
3. **Die Reiter-Ordnung des Blattes ist unverändert** (Entscheide · Änderungen ·
   Materialien · Anwendung), und der Griff öffnet weiterhin auf dem zuletzt gewählten
   Reiter. Teil 5 Schritt 2 (c) verlangte «erlassweite Reiter … ‹Entscheide› bleibt als
   Ziel». Das Umsortieren verschöbe den Pfeiltasten-Weg, den
   `leser-v3-panel-facetten` (b) als Zusage misst (Home ⇒ entscheide, End ⇒ anwendung),
   und den Landepunkt von rund zwölf Sonden — ohne Gewinn für die Entdopplung, die
   allein die **Zahl** betraf. Offengelegt statt still gelassen.
4. **`e2e/leser-kopf-paritaet.e2e.ts` existiert nicht.** Der Auftrag nennt die Datei;
   im Repo gibt es sie nicht mehr (nur noch Verweise in Kommentaren von
   `leser-v3-kopf`, `leser-v3-panel-facetten`, `leser-v3-panel-zaehler`). Statt ihrer
   sind die drei nennenden Specs mitgelaufen.
5. **Der Kopf-Marker heisst weiter `data-v3-panel-zaehler`**, obwohl der Knopf nicht
   mehr zählt. Er ist der Vertrag zu rund fünfzehn Sonden (`helpers/panelOeffnen.ts`,
   `leser-v3-panel-*`); ihn umzubenennen kostete Spec-Dateien, die dieser Schritt
   sonst nicht anfasst (§6.3), und brächte keine Zusage dazu. Im Dateikopf von
   `v3/LeserPanelOeffner.tsx` steht der Grund.

---

## Bilder (nicht committet, regenerierbar)

`abnahme/design-identitaet/` — @1440 `dsf 2`, ZPO `#art-271`:

* `d35-f2-a-kopf-blatt-1440-hell.jpg` — Kopf ohne Zahl, Blatt offen
* `d35-f2-b-menue-1440-hell.jpg` — Ansicht-Menü mit der Rubriken-Gruppe
* `d35-f2-c-rubrik-ab-1440-dunkel.jpg` — «Entscheide» abgewählt, Blick auf die
  Funktionszeile (Art. 271 «Bezüge · 6 Verweise», Art. 272 nur noch Aktionen)
* `d35-f2-d-kopf-blatt-1440-dunkel.jpg` — Gegenstück zu (a) im Dunkelmodus
* `d35-f2-e-kopf-menue-390-hell.jpg` — @390: «Erlass ▾ · Gliederung · Ansicht ▾»,
  Menü im Fenster

---

## Offene Punkte

* Entscheid David zu den Abweichungen 1–3 (Name der Zeile, Kopplung an die
  Änderungs-Wahl, Reiter-Ordnung).
* Gegenprüfung durch einen Prüf-Agenten steht aus — dieser Vermerk ist der Bericht
  des Bauenden, kein Verdikt (F10).
