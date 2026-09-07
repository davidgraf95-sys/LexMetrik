# GB · «Leben»: Registerfarbe, Serifen-Akzent, Linien statt Kästen

**Auftrag** Fixer GB der W2·24-Gesamtprüfung «Ästhetik + Kopf-/Ortsprüfung».
Zugeteilte Befunde: **G1 · G2 · G12 · G13 · G15 · G20 · G21**.
**Massstab** `DESIGN-REGLEMENT.md` §F0 (F0.6 Linien statt Flächen, F0.7 keine
Versalien, F0.9 Anatomien) · `fahrplaene/FAHRPLAN-DESIGN-IDENTITAET.md` §5
(Registerfarbe als Marke der Domäne; Etikett «fett **oder kursiv**», Ziff. 2;
Literata kursiv an Begrüssung und Randtiteln).
**Davids Leitsatz** 6.9.2026: «achte darauf, dass es nicht zu trist wirkt» ·
«alles angleichen» · «Linien statt Flächen».

**Branch** `feat/w2-24-gb`, Basis `018b41a37`. Kein PR, kein Merge (Bau-Auftrag).

---

## 1 · Was gebaut wurde, je Befund

| Befund | Fix | Datei:Zeile |
|---|---|---|
| **G1** Registerfarbe nur im Reiter | Die Route SAGT ihr Register an (`data-reg` aus der SSoT `layout/bereiche.registerVonPfad`), fünf Rezepte in `index.css` lesen es: Registerstrich am Seitenkopf · Ausklang der Ablesekante (`.scale-rule::after`) · Tick des Chips (`.lc-chip`, Zustands-Ticks bleiben) · Kopf-Etikett des Lesers · Zähler-Marke der Rubrik-Kacheln. Keine Einzelstelle, kein Farb-Prop. | `src/components/layout/RouteHuelle.tsx:80` · `src/index.css` §GB-1/§GB-1b · `src/components/ui/RubrikKachel.tsx:75` |
| **G2** Literata kursiv fehlt auf 8 von 9 Routen | Ein Rezept `.lc-randtitel` (Literata kursiv + Registerfarbe), getragen von drei Anatomien, die einen Abschnitt BENENNEN: Gruppenkopf, Leser-Kopf-Etikett (`header .lc-overline`), Feldsatz-`legend`. Im Erlass-Leser nur die Klassenzeile der Randtitel-VORFAHREN. | `src/components/ui/GruppenKopf.tsx:151/162` · `src/index.css` §GB-2 · `src/pages/gesetz-leser/helpers.tsx:640–641` |
| **G12** 847 gerahmte Norm-Chips | `.lc-normzeile` als Trefferlisten-Variante der Chip-Grammatik: Klartext in `--ink-500`, kein Rahmen, Affordanz über Unterstrich bei Hover/Fokus; Tap-Fläche unverändert. Die KOPF-Metazeile behält ihre Form (dort trennt sie drei Element-Arten, LM-044). | `src/index.css` §GB-12 · `EntscheidZeile.tsx:90` · `EntscheidKarte.tsx:105` |
| **G13** 54 Versal-Badges «fr»/«it» | Regel EINMAL an der Klasse: `.lc-badge { text-transform: none }`. Zusätzlich die Utility im Markup gestrichen (4 Dateien); die fünfte (`pages/EntscheidLeser`) liegt bei Fixer GA und steht als befristete, begründete Ausnahme. | `src/index.css` §GB-13 · `EntscheidZeile:70` · `EntscheidKarte:143` · `MaterialKarte:27` · `ErlassKarte:53` |
| **G15** drei Knopf-Formen @390 | Ein Baustein `.lc-topbar-griff` für alle fünf Griffe des Titelblatts: 44-px-Tap-Fläche unverändert, kein Rahmen, keine Füllung, Zustand über Tinte und Unterstrich. Das Siegel (§) bleibt ausgenommen — es ist die Marke, kein Knopf. | `src/index.css` §GB-15 · `Topbar.tsx:123/141` · `HeaderSuche.tsx:353` · `ThemaUmschalter.tsx:56` · `SprachUmschalter.tsx:42` |
| **G20** 6 gerahmte Ferien-/Stillstand-Kästen | Eine Spalte, sechs Radio-ZEILEN mit 1-px-Trennlinie; gewählt = 3-px-Strich in `--reg-w` statt 2-px-Ring. Titel, Untertext, `name`, `checked`, `onChange`, Reihenfolge Wort für Wort unverändert — **Rechenlogik unberührt** (§3). | `src/components/forms/EinfacheFristForm.tsx:334–336` · `src/index.css` §GB-20 |
| **G21** Kästchen-Nummern, Kachel-Raster, Warn-Kasten in der Linkreihe | Schrittnummern blank in der Zeile (der Zustand hängt seit R5-F2 am Unterstrich, das Kästchen war das zweite Signal) · `lc-wahl-kachel` von `border` auf `border-t` (Zeilenliste statt Raster, 60 Aufrufer ohne Edit) · «Zu unterzeichnen» als eigene Zeile UNTER der Linkreihe (`data-formgate` und die Lage im ersten Viewport unverändert). | `vorlagen/ui.tsx:321` · `ui/SelectionGrid.tsx:150` · `vorlagen/wizard.tsx:145` |

---

## 2 · Messung: Registerfarb-Träger je Route, vorher/nachher

**Methode.** Playwright/Chromium gegen `vite preview :4412` aus dem jeweils
eigenen `dist/`. Gezählt werden SICHTBARE Elemente im ersten Bild, deren
berechnete Farbe (Tinte, Fläche, Kante, Umriss, Unterstreichung — auch an
`::before`/`::after`) exakt einer der vier Registerfarben entspricht.
**Arbeitsleiste, Seitenleiste und Reiter-Streifen sind ausgeschlossen** — sonst
wäre die Auflage schon durch das erfüllt, was G1 gerade rügt. Die Zahlen sind
darum NICHT deckungsgleich mit der Gesamtprüfung (die zählte die Leiste mit);
die Richtung ist dieselbe.

**Schranke der Vorher-Messung (§7):** «vorher» ist der Stand `e2e1cc053`, auf
dem die Befunde gemessen wurden (Worktree `w2-24-pruef`, `dist/` unverändert).
Er ist NICHT byte-gleich zur Bau-Basis `018b41a37` — dazwischen liegen andere
Fixer. Für die Registerfarb- und Versal-Spalten ist das unschädlich (beides
Nullwerte); die Kasten-Spalte des Entscheid-Lesers ist aus diesem Grund **nicht
vergleichbar** und wird unten ausdrücklich nicht als Wirkung von GB geführt.

`T` = Registerfarb-Träger · `K` = `Literata italic` im ersten Bild ·
`V` = `.lc-badge` mit `text-transform: uppercase` · `B` = gerahmte Chips/Badges/
Kacheln im ersten Bild (≥ 3 Kanten).

| Route | 1440 hell | 390 hell | 1440 dunkel | 390 dunkel |
|---|---|---|---|---|
| `/` (Referenz) | T 14→14 · K 2→2 | T 6→6 · K 2→2 | T 14→14 · K 2→2 | T 6→6 · K 2→2 |
| `/gesetze` | T **2→7** · K 0→1 | T **1→4** | T **2→7** · K 0→1 | T **1→4** |
| `/gesetze/bund/OR` (Erlass-Leser) | T **0→8** · K **0→6** | T **0→7** · K **0→6** | T **0→8** · K **0→6** | T **0→7** · K **0→6** |
| `/rechtsprechung` | T **4→16** · K 0→1 · **V 53→0** · **B 12→2** | T **0→18** · **V 53→0** · **B 17→3** | T **4→16** · **V 53→0** · **B 12→2** | T **0→18** · **V 53→0** · **B 17→3** |
| Entscheid-Leser | T **0→8** · K **0→6** · B 0→2 † | T **0→9** · K **0→6** | T **0→8** · K **0→6** | T **0→9** · K **0→6** |
| `/rechner/tagerechner` | T **0→7** · K 0→1 | T **0→5** | T **0→7** · K 0→1 | T **0→5** |
| `/vorlagen/kuendigung-arbeitgeber` | T **0→5** | T **0→5** | T **0→5** | T **0→5** |
| `/materialien` | T **0→11** · K 0→1 | T **0→4** · K 0→1 | T **0→11** · K 0→1 | T **0→4** · K 0→1 |
| `/suche` (ohne Register) | T 8→8 | T 2→2 | T 8→8 | T 2→2 |
| `/einstellungen` (ohne Register) | T 0→0 | T 0→0 | T 0→0 | T 0→0 |

† Die zwei Kästen des Entscheid-Kopfs («de», «maschinell») stehen auf BEIDEN
Ständen im Bild — belegt in `gb-vorher-entscheid-1440-dunkel.jpg`, dort noch
versal («DE»). Der Sprung 0→2 ist ein Artefakt der abweichenden Vorher-Basis,
keine Wirkung von GB; beide sind `.lc-badge` in der L5-Umriss-Anatomie, die
ausdrücklich beibehalten wird (Zustandsaussage, kein Dekor).

**Kein Überlauf** auf keiner der 40 Messungen (`scrollWidth == clientWidth`).

**Kontrast, nachgerechnet (sRGB-Formel, 7.9.2026)** — die Registerfarben als
TEXT (Randtitel, Zähler, Kopf-Etikett) auf `--paper` hell `#FAF7F2` / dunkel
`#1B1917`, in Klammern auf `--well`:
g 7.85 (7.38) / 8.58 (9.16) · r 9.55 (8.97) / 7.88 (8.41) ·
m 4.94 (4.65) / 10.14 (10.83) · w 5.21 (4.89) / 9.56 (10.20).
Alle ≥ 4.5 : 1 in beiden Modi — AA für Fliesstext, nicht nur für Grosstext.

---

## 3 · Wächter und Rot-Proben (§6.7)

**① `e2e/w224-gb-register.e2e.ts`** — 40 Fälle: je Route MIT Register ≥ 3
Registerfarb-Träger im ersten Bild ausserhalb der Leisten (hell + dunkel,
1440 + 390); zweiseitig, dass eine Route OHNE Register keine geratene Farbe
trägt; kein `.lc-badge` mit berechnetem `uppercase`.

*Rot-Probe 7.9.2026* — die vier `--reg-marke`-Zuordnungen in `src/index.css`
auf `var(--ink-500)` gesetzt und neu gebaut:
```
26 failed · 13 passed (45.3s) · Exit 1
  /gesetze/bund/OR trägt im ersten Bild nur 0 Registerfarb-Träger:
  /vorlagen/kuendigung-arbeitgeber trägt im ersten Bild nur 0 Registerfarb-Träger:
  /rechtsprechung/ag_gerichte_HOR_2024_19 trägt im ersten Bild nur 0 …
  /rechner/tagerechner trägt im ersten Bild nur 1 …: label.lc-wahl-zeile[borderTopColor]
  /gesetze trägt im ersten Bild nur 2 …: button.ub-schalter[…] · ul.tb-raster[…]
```

*Rot-Probe 7.9.2026, Versal-Zweig* — `.lc-badge { text-transform: none; }`
gestrichen:
```
1 failed · 3 passed (3.2s) · Exit 1
  /rechtsprechung/ag_gerichte_HOR_2024_19: 1 Versal-Etikett(en): de
```
Der Entscheid-Leser steht BEWUSST in dieser Liste: er ist die einzige Route, an
der die Utility «uppercase» im Markup noch steht — nur dort kann die Sonde die
WIRKUNG der Regel beweisen. An den übrigen Routen ist das Wort schon aus der
Quelle verschwunden; dort könnte der Test auch ohne die Regel nicht rot werden.

**② `scripts/check-design-tokens.ts`** — neue Quellen-Schranke: keine Utility
`uppercase` an einer `lc-badge`. Rot-Probe: vor dem Fix 3 Fundstellen
(MaterialKarte:27 · ErlassKarte:53 · EntscheidLeser:783); nach Leerung der
Ausnahme-Liste 1 Fundstelle, Exit 1.

---

## 4 · Tore

| Tor | Ergebnis |
|---|---|
| `golden:vergleich` | **IDENTISCH — 256 Fälle byte-gleich** |
| `npx tsc -b` | grün (keine Ausgabe) |
| `npm run test` | **459 Dateien · 7443 Tests grün**, 2 übersprungen |
| `npm run lint` | 0 Fehler, 1 Bestands-Warnung (`useUniversalSuche.ts:176`, fremd) |
| `check:design-tokens` | grün — 75 gültige Stufen, 17 wirksame Deckkraft-Klassen |
| `check:farbwelt` | grün — 146 WCAG-Pflichtpaare, 4 beratende Bestands-Warnungen |
| `check:e2e-shards` | grün — 130 Specs, Union der 8 Gruppen deckungsgleich |
| `e2e/w224-gb-register` | **40 passed (29.7 s)** — Schlusslauf auf dem sauberen Baum |
| `check:schlankheit` | **ROT auf `ArtikelLeser.tsx` (866 Z.) — NICHT von GB.** Nullprobe (§0.3): die Datei ist byte-gleich zur Basis `018b41a37` und liegt dort ebenso über der Schwelle; der Lauf im fremden Worktree `w2-24-folge` (ohne GB-Änderung) ist mit derselben Meldung rot. |

---

## 5 · Zwei deklarierte Test-Änderungen (§6.3)

Beide in einem `test(`-Commit, beide fachlich begründet, keine im Zuge eines
Refactorings:

1. `src/tests/design-r9-knopf-baustein.test.ts` — `lc-topbar-griff` in die
   BAUSTEIN-Marke aufgenommen. Er IST ein Baustein (ein Rezept, vier
   Konsumenten); vorher trugen dieselben Knöpfe drei Anatomien in einer Zeile,
   also genau die Rezept-Familie, die B-K1 abräumt.
2. `src/tests/routeHuelle.test.tsx` — die Zusicherung prüft weiterhin BEIDE
   Schlüssel an `schluessel`; erweitert ist allein das `data-reg`-Attribut.

---

## 6 · Abweichungen und offene Punkte

1. **`pages/EntscheidLeser.tsx:783` trägt weiter das Wort `uppercase`.** Die
   Datei ist für GB TABU (Fixer GA, Befunde G3/G4). Die WIRKUNG ist gekappt
   (`.lc-badge{text-transform:none}`, e2e misst genau das); offen ist nur die
   Quellen-Hygiene. Eintrag in `BADGE_VERSAL_AUSNAHMEN` mit Fälligkeit «sobald
   GA gelandet ist» — dann ein Wort streichen und den Eintrag mit ihm.
2. **Vier Dateien ausserhalb der Whitelist**, je mit Begründung:
   `layout/RouteHuelle.tsx` (der eine Ort, an dem eine Route ihr Register
   ansagen kann, ohne GAs Kopf-Baustein zu berühren) · `forms/EinfacheFristForm.tsx`
   (dort LEBT die von G20 benannte Ferien-/Stillstand-Wahl; die Whitelist nannte
   `pages/Rechner*.tsx`, das Markup steht aber in `forms/`) ·
   `materialien/MaterialKarte.tsx` + `normtext/ErlassKarte.tsx` (je EIN Wort,
   sonst bliebe die neue Token-Schranke von Anfang an rot).
   `gesetz-leser/helpers.tsx` blieb auf die Klassenzeile der Randtitel begrenzt,
   wie beauftragt (`Marginalie*.tsx` existiert nicht; die Randtitel-Klassen
   entstehen in `margStufeStil`).
3. **Das Randtitel-BLATT bleibt Sans** (~83 % aller 1792 Randtitel). Davids
   Bildbogen-Wahl vom 17.8.2026 nennt für die Marginalie ausdrücklich «Sans»,
   und der Auftrag vom 26.6.2026 verlangt, dass die Sachüberschrift nicht «zu
   einem blassen Abschnittslabel verkümmert». Der kursive Akzent kommt auf den
   Vorfahren-Stufen zurück, ohne die datierte Entscheidung zu überschreiben
   (§7/§2b — ein Beleg altert nicht).
4. **`.lc-overline` selbst bleibt Archivo** (F0.7 im Wortlaut). Die kursive
   Literata gilt nur den drei Randtitel-Anatomien. Wer F0.7 künftig lockern
   will, ändert das Reglement, nicht still den Code.
5. **Der Vorlagen-Assistent zeigt im ersten Bild weiterhin K 0.** Sein Kopf
   trägt Literata AUFRECHT (`SeitenTitel stimme="serif"` + Serifen-Lead); die
   kursive Zeile erscheint erst am ersten `GruppenTitel` unterhalb der
   Bildkante. Nicht erzwungen — eine kursive Zeile ohne Randtitel-Rolle wäre
   Dekor.
6. **Beobachtet, nicht beauftragt:** auf `/rechtsprechung` ist der
   `StatusBadge` «maschinell» nach GB-12 der EINZIGE Kasten je Trefferzeile und
   damit relativ lauter als vorher (B 12→2 bzw. 17→3 — absolut deutlich ruhiger,
   relativ auffälliger). `components/verzahnung/StatusBadge` liegt ausserhalb
   der Whitelist; ob die Umriss-Anatomie dort bleibt, ist ein Folgeentscheid.

---

## 7 · Bildbeleg (12 Dateien, ≤ 1200 px, q58)

`gb-vorher-*` / `gb-nachher-*`, je Paar dieselbe Route, Breite und Modus:
`erlassleser-1440-hell` · `rechtsprechung-1440-hell` · `entscheid-1440-dunkel` ·
`rechner-1440-hell` · `vorlage-1440-hell` · `gesetze-390-hell`.
