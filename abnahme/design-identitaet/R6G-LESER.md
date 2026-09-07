# R6G · Leser-Nachzüge der Gesamtprüfung W2·24 (7.9.2026)

Vier Befunde aus der Gesamtprüfung — drei am Leser (G11 · G14 · D4), einer am
Prüfapparat selbst (G23). Alle vier sind **am Vorstand `72b39d50c` gemessen
worden, bevor gebaut wurde**; die Messwerte stehen unverändert als Erwartung in
den Sonden und werden nie nachgeführt (§0 Ziff. 2b).

Bau-Branch `feat/w2-24-leser-g`, Commits `be41d6aa5` (G11/G14/D4/G23) und
`bfb5956c5` (D4-Nachzug: Menü-Rolle innen, Schalter-Rolle in acht Specs).

| Befund | Gemessen am Vorstand `72b39d50c` | Fix (Datei) | Sonde |
|---|---|---|---|
| **G11** (hoch) Bezüge-Popover schneidet seine Reiterzeile an | @1440 **und** @1024: Blatt 336 px breit, Reiterzeile `scrollWidth 379 / clientWidth 334`; die vier Fächer enden bei 1006 · 1103 · 1192 · **1286**, die Zeile bei **1247** ⇒ «Anwendung» steht 39 px hinter der Kante, Scrollbalken per `[scrollbar-width:none]` unsichtbar. @390 (Sheet) passte sie ganz: 388/388 | `v3/LeserPanel.tsx` — `flex-wrap` an der Reiterzeile (3 + 1 statt Anschnitt); `overflow-x-auto` + `lc-scrollrand-x` bleiben für ein einzelnes übergrosses Fach | `e2e/leser-w224-g.e2e.ts` G11 ×3 (@1440/@1024/@390): `scrollWidth ≤ clientWidth` **und** rechte Kante jedes Fachs ≤ Kante der Zeile |
| **G14** (mittel) Kopf-Griffe @390 sind nackte Glyphen | @390 (STPO #art-429): «⚖ 163» 44 px · «☰» 44 px · «···» 44 px — drei Zellen, kein Wort. Der Fahrplan führte das seit 18.8.2026 selbst als offenen Punkt («≤ 2 reine Icons bleibt @390 mit ⚖ · ☰ · ··· gerissen … kein Fortschritt») | `v3/LeserPanelOeffner.tsx` (Wort statt Ikone auf `mini`) · `v3/LeserRahmenV3.tsx` (☰ → «Gliederung») · `v3/LeserAnsichtV3.tsx` («···» → «Ansicht ▾») | `e2e/leser-w224-g.e2e.ts` G14 ×2 (@320/@390): jeder Griff trägt ≥ 3 Buchstaben am Stück, Zeile ohne Überlauf, alle drei auf derselben Höhe |
| **D4** (klein, a11y) Ansicht-Menü ist `role="group"` | @1440 aufgezogen: `[role=menu]` **0**, `[role=menuitem*]` **0**; ↑/↓ bewegten den Fokus nicht — für assistive Technik eine namenlose Knopf-Sammlung | `v3/LeserAnsichtV3.tsx` (`role="menu"` am Eintrags-Block, `menuitemcheckbox`/`menuitem`) · neu `v3/menueTasten.ts` (↑/↓/Home/End, zeichengleich `layout/ReiterMenue.tsx` M4) | `e2e/leser-w224-g.e2e.ts` D4 ×2: Rollen + Fremdkinder-Sonde + ↓/↑/Esc-Bedienung, dazu axe auf der aufgezogenen Fläche |
| **G23** (Beleg) Seed der R13-Sonde nicht kanonisch | 15 Reiter @1440, aktiv KKG: **drei** der neun sichtbaren Reiter hiessen «Gesetz nicht gefunden» (ArG · StPO · VwVG; StGB und SchKG lagen ausserhalb des Fensters), `data-reiter-fenster` **5/9/15** | `e2e/w224-r13-reiter.e2e.ts` — `ACHT`/`FUENFZEHN` versal (`STGB SCHKG ARG STPO VWVG`), Selektor Zeile 263 mitgezogen | dieselbe Sonde, Assertions unberührt; Nachzug-Zeile in `R13-REITER.md` |

## Rot-Beweis §6.7

Alle drei Produkt-Fixes gemeinsam zurückgenommen (`flex-wrap` weg, die drei
Wörter wieder hinter ihre `kompakt`/`mini`-Bedingung, `role="menu"` → `"group"`),
neu gebaut, Sonde gefahren: **6 von 7 rot**, 1 grün.

```
@1024 Reiterzeile läuft über … Expected <= 335, Received 379
@1440 Reiterzeile läuft über … Expected <= 335, Received 379
Griff «⚖163» trägt kein Wort … Expected true, Received false      (@320)
Griff «⚖163» trägt kein Wort … Expected true, Received false      (@390)
toHaveAttribute('role') …      Expected "menu",  Received "group"
axe: aria-required-parent      (menuitemcheckbox ohne Menü-Vorfahr)
```

Der eine grüne Fall ist die **Positiv-Kontrolle**: G11 @390 ist auch am Vorstand
grün (das Bottom-Sheet ist 390 px breit, die Zeile passt dort). Eine Sonde, die
in JEDER Lage rot wird, misst die Lage nicht.

Zweite, im Bau selbst gefahrene Rot-Probe (D4): der erste Bau legte
`role="menu"` auf die ganze Schwebefläche — axe meldete **critical**
`aria-required-children`, «children which are not allowed: `span[aria-live]`».
Der Knoten ist die Prozent-Anzeige des Schriftreglers; eine Live-Region ist kein
Menü-Eintrag, und axe steigt dabei durch die `role="group"` des Reglers hindurch.
Die Rolle liegt seither auf dem inneren Eintrags-Block.

Dritte Rot-Probe (`SCHALTER_ROLLE` in `e2e/helpers/leserBeschriftung.ts`): auf
`'switch'` zurückgestellt ⇒ **12 Fälle in sechs Specs rot** (so wurde die
Folgewirkung überhaupt entdeckt).

## Gemessene Werte nach dem Bau

**Kopfzeile @390 (STPO #art-429), Archivo 11 px, Zeile innen 350 px**

| Griff | vorher | nachher | Breite |
|---|---|---|---|
| Rechtsprechung | «⚖ 163» | «Rechtsprechung 163» | 111 px |
| Gliederung | «☰» | «Gliederung» | 67 px |
| Ansicht | «···» | «Ansicht ▾» | 59 px |
| **Summe mit `gap`** | 132 px | **237 px** | Überlauf 0 |

@320 (Zeile innen 300 px): dieselben drei Griffe, rechte Kanten 166 · 237 · 300,
Überlauf 0, alle auf derselben Oberkante. Die Ort-Zone gibt den Platz her — sie
trägt `min-w-0 truncate`, das Kürzel kürzt dort notfalls, und genau deshalb kann
die Zeile auf keiner Breite überlaufen.

**Panel-Reiterzeile**

| Breite | `scrollW / clientW` | Reihen | letzte Kante / Zeilenkante |
|---|---|---|---|
| 1440 | 334 / 334 | 2 (3 + 1) | «Anwendung» 1010 ≤ 1247 |
| 1024 | 334 / 334 | 2 (3 + 1) | «Anwendung» 754 ≤ 991 |
| 390 | 388 / 388 | 1 | «Anwendung» 374 ≤ 389 |
| 320 | 318 / 318 | 2 (3 + 1) | «Anwendung» 98 ≤ 319 |

Preis des Umbruchs: rund 26 px Tafelhöhe von 389 (@1440). Die drei verworfenen
Alternativen (Blatt auf 25 rem verbreitern; Etiketten kürzen; beim Scroller
bleiben) stehen mit ihrer Begründung im Kommentar an der Fundstelle.

## §7-Abweichung vom Auftragswortlaut (G14)

Der Auftrag schlug für den Zähler-Griff «Entscheide 16» vor. Gebaut ist
**«Rechtsprechung 163»** — also `OEFFNER_WORT`, dasselbe Wort wie auf jeder
anderen Breite. Grund: «Entscheide» misst zwar nur 79 statt 105 px, gäbe aber
DEMSELBEN Knopf @390 einen anderen Namen als @1440. Genau diese Falle hat N1
(6./7.9.2026) an dieser Stelle einen Tag zuvor beseitigt («Zwei Namen für
denselben Knopf sind eine Falle, §8»). Das Budget trägt das lange Wort: 237 px
von 350 (@390) bzw. 300 (@320). Die Ikonen weichen dafür auf `mini` — sie messen
dort 20 px (`kopfGlypheKlassen`) und sagen neben dem ausgeschriebenen Wort
nichts, was das Wort nicht sagt. Auf `voll`/`kompakt` bleiben sie.

Zweite offengelegte Folge (D4): «Entscheide & Kontext …» steht im Menü seither
ÜBER dem Schriftregler statt darunter. Sie gehört ins Menü, der Steller nicht,
und die Reihenfolge lässt sich nicht halb einhalten. Der Eintrag erscheint
ohnehin nur, wenn kein Kopf-Zähler dasteht (Ä92) — im Ruhezustand also nie.

## Screens

`r6g-kopf-390-{hell,dunkel}.jpg` (Kopfblock @390, drei beschriftete Griffe) ·
`r6g-panel-1440-{hell,dunkel}.jpg` (Panel mit umgebrochener Reiterzeile) ·
`r6g-ansicht-menue-1440-hell.jpg` (Ansicht-Menü nach D4) ·
`r6g-reiter-1440-kanonisch.jpg` (15 Reiter mit kanonischem Seed, G23).

## Tore

`npx tsc -b` · `npm run lint` (0 Fehler, 1 Bestands-Warnung in
`useUniversalSuche.ts`) · `npm run test` 459/459 Dateien, 7445 Fälle ·
`check:schlankheit` · `check:e2e-shards` (131 Specs) · `check:golden-normtext`
(60 257 Knoten) · `golden:vergleich` **IDENTISCH, 256 Fälle byte-gleich** ·
`popover-lesbar-d31` + `w224-leser-d32-d33` + `w224-r13-reiter` + `a11y` +
`leser-w224-g` mit `--repeat-each=2 --workers=2`: **160 grün** ·
volle Leser-Familie + `hist-ansicht-w25i` + `a11y` + `w224-*` +
`popover-lesbar-d31`: 470 grün, 1 rot (siehe unten).

## Nicht von diesem Bau — Nullprobe

`e2e/w224-reiterverhalten.e2e.ts:247` «(e) die Beschriftung folgt der
Lesestellung — live beim Scrollen (D27)» ist rot: nach dem Neustart steht
`/gesetze/bund/ZGB#art-1` statt `#art-3`, die Reiter-Beschriftung entsprechend
«Art. 1 ZGB» statt «Art. 3 ZGB».

**Nullprobe (§0 Ziff. 3):** Vorstand `72b39d50c` ausgecheckt, neu gebaut,
derselbe Fall mit `--repeat-each=3` gefahren — **3 von 3 rot, mit identischer
Fehlermeldung**. Der Defekt liegt auf der Basis (Lesestellungs-Persistenz), nicht
an diesem Bau; auf dem Bau-Stand ist er ebenfalls 3/3 rot, also deterministisch
und kein Flake. Nicht gefixt: er liegt ausserhalb der Bau-Fläche dieses Auftrags
(Reiterleiste/`lesePosition`) und gehört in einen eigenen Schritt.
