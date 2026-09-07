# R5 — Fixer 1e «Kopf-Suche als EIN Objekt» (D23)

Branch `feat/w2-24-r5-f1e`, abgezweigt von `c0f2972ba` (Stand mit «+»-Reiter).
Anlass: David 6.9.2026 zum Bild des Leerzustands nach «+» — «schau mal wie das
aussieht mit der suche. sehr unästhetisch». Massgeblich ist die Soll-Anatomie
D23; Referenz ist `vorschlag-freigegeben.html`, Marke `.frage` (ein Feld mit
Unterstrich, kein Kissen).

Alle Messungen: eigener Preview aus dem gebauten `dist/` (Port 4363), Chromium,
hell **und** dunkel.

---

## 1 · Die Messung, auf die es ankommt

Kopf-Suche auf `/gesetze`, Leerzustand geöffnet:

| Breite | Feld x … r | Panel x … r | Δ links | Δ rechts | Spalt Feld→Panel |
|---|---|---|---|---|---|
| 1600 | 495 … 879 | 495 … 879 | **0** | **0** | **0** |
| 1440 | 495 … 879 | 495 … 879 | **0** | **0** | **0** |
| 1280 | 495 … 879 | 495 … 879 | **0** | **0** | **0** |
| 1024 | 495 … 815 | 495 … 815 | **0** | **0** | **0** |
| 390  |  16 … 374 |  16 … 374 | **0** | **0** | **0** |

Vorher (`c0f2972ba`): Panel mit eigenem Boden `min-w-[22rem]`, 6 px Spalt
(`mt-1.5`), `.lc-schwebeflaeche` (Radius + `shadow-lg`), unter 640 px am
Viewport verankert. @1024 lag die linke Panelkante **32 px** neben der
Feldkante; @390 mass das Feld 320 px in einem 390-px-Streifen.

Δ 0 ist hier kein Messglück, sondern Konstruktion: das Panel trägt `inset-x-0`
am `role="search"`-Anker und **keinen eigenen Breitenwert mehr** — es kann seine
Breite gar nicht mehr selbst wählen.

Platzhalter-Bedarf gegen freien Platz im Feld (Canvas-`measureText`, gebauter
Stand): @1440 247 / 348 px · @1024 247 / 284 px · @390 282 / 314 px — nirgends
abgeschnitten.

---

## 2 · Was gebaut ist, Punkt für Punkt

| D23-Punkt | Zustand | Kern |
|---|---|---|
| (1) Feld + Panel = ein Objekt | gebaut | `.lc-suchpanel-huelle`: Papier, 1 px `--rule` rundum ausser oben (die Feldkante IST die Oberkante), kein Schatten, kein Radius; `inset-x-0 top-full`; `z-dropdown` über der Reiterleiste; der mobile `fixed`-Zweig ist gefallen |
| (2) Leerzustand | gebaut | Etikett «Zuletzt geöffnet» ÜBER der Liste (`.lc-overline`, Archivo 12, ink-500) · 3-px-Registerstrich · Kurzform (`lib/tabs.reiterKurzform`) · Art rechts (Gesetz · Entscheid · Materialie · Rechner · Vorlage) · «Nur auf diesem Gerät» als Fussnote · **«Einstiege» ersatzlos gestrichen** |
| (3) Treffer-Zustand | gebaut | dieselbe Anatomie: Gruppen-Etiketten Archivo 12, Registerstrich je Zeile (`RegisterMarke`, §5), keine Icons, kein «→», Tastaturauswahl als Fläche `--well` + Kantenstrich (`.hs-aktiv`) statt Messing-Tönung, `role=status` unverändert |
| (4) Feld | gebaut | EIN kurzer Platzhalter «Suchen · «OR 257d» springt zum Artikel»; ⌘K-Marke rechts aussen, Archivo 11, ink-500, kein Mono; Norm-Sprung unverändert |
| (5) nichts verloren | belegt | s. §4 |

**Rückbau (§17-Gegengewicht):** mit «Einstiege» fällt die Konstante `EINSTIEGE`;
mit dem einen Platzhalter fällt die LM-124-Messmechanik (Canvas +
ResizeObserver + MutationObserver), die einen langen Satz gegen den Platz mass —
es gibt keinen langen Satz mehr. Wo eine Fläche doch enger wird als der Satz,
kürzt seit LM-067/068 die `text-overflow: ellipsis`-Regel in `.lc-input`.

---

## 3 · Zwei Nachzüge ausserhalb der Suche (je eine Zeile, mit Grund)

**`Topbar.tsx`, Deckel `max-w-xs` → `sm:max-w-xs`.** Seit D23 ist die
Panelbreite die Feldbreite — der Deckel entscheidet also beide. @390 war das
Feld 320 px in einem 390-px-Streifen (der mobile Fokusmodus S6 sagt «volle
Streifenbreite» zu und hielt sie nie), der Platzhalter brauchte 282 auf 276 px.
Ab 640 px unverändert; `min-w-0` bleibt der Überlauf-Schutz @320.

**`Topbar.tsx`, Header `z-leiste` → `z-dropdown`.** GEMESSEN: das Etikett
«Zuletzt geöffnet» war unsichtbar, die Reiterleiste malte über die obersten
~45 px des Panels. Ursache: Kopfzeile und `nav[aria-label="Offene Reiter"]`
tragen BEIDE `z-leiste` (20) und sind Geschwister — das spätere DOM-Element
gewinnt, und weil der Header mit seinem z-index einen eigenen Stapelkontext
aufmacht, kommt sein Kind (`z-dropdown` = 30) daran nicht vorbei. Geometrisch
folgenlos (der Header überlappt in Ruhe nichts); die Reiterleiste bleibt
unangetastet (sie gehört R11).

---

## 4 · Nichts verloren — die Gegenprobe

| Funktion | Beleg |
|---|---|
| Norm-Sprung | «OR 257d» + Enter → `/gesetze/bund/OR#art-257_d` (Screenshot `r5f1e-normsprung-ziel-1440-hell.jpg`) |
| Trefferpanel, Gruppen, «alle N» | `e2e/suche-seite.e2e.ts` grün |
| Tastatur ↑↓ Enter Esc, `/`, ⌘K | `e2e/tastatur.e2e.ts`, `e2e/suche-q-fokus-s1-s6.e2e.ts` grün |
| Verlauf-Quelle `useZuletzt` | `e2e/verlauf-o1.e2e.ts` grün |
| Fokus-Rückgabe, Aussenklick, mobiler Fokusmodus | `e2e/suche-q-fokus-s1-s6.e2e.ts` (S6) grün |
| Leerzustand-Kappung 5 | unverändert (`useZuletzt().slice(0, 5)`) |

---

## 5 · a11y — ein Wurzel-Fix statt eines zweiten Pflasters (§17)

axe `scrollable-region-focusable` (serious) an der Panel-Hülle. Der D18-Fix
`tabIndex={-1}` genügt der Regel **nicht**: ihr Check `focusable-element` prüft
`isInTabOrder`, und −1 ist gerade nicht in der Tab-Ordnung (axe-core 4.11,
`any: ['focusable-content', 'focusable-element']`). Grün war der Fall nur,
solange der Inhalt nicht wirklich überlief — die Regel greift erst dann
(`isNonEmptyElementOutsideViewableRect`). Im Parallel-Lauf vom 6.9.2026 lief er
über, und der Fall wurde rot.

Wurzel: nicht die Hülle scrollt, sondern die **Listbox** selbst (`panelKlasse`)
— und das Popup einer Combobox nimmt axe ausdrücklich von der Regel aus
(`isComboboxPopup`). Der Fall ist damit nicht mehr timing-abhängig grün, sondern
gar nicht mehr betroffen; ein Tab-Stopp im Widget (Cowork-Befund 38) entsteht
weiterhin nicht. `tabIndex={-1}` ist ersatzlos entfallen.

---

## 6 · Wächter und Rot-Beweis

`e2e/w224-kopfsuche-d23.e2e.ts` (6 Fälle, `@shard-gruppe: 2`):
Panelkante = Feldkante @1024 und @1440 · kein Spalt @1024 und @1440 · Panel über
der Reiterleiste (`elementFromPoint` in der Überlappung) · kein
«Einstiege»-Block.

**Rot gefahren (§6.7), 6.9.2026:**

```
Lauf 1 (Vorher-Hülle `right-0 mt-1.5 min-w-[22rem]` + Header `z-leiste`
        + Einstiege-Block):            5 failed · 1 passed
  rot: Kanten @1024 (Δ links −32) · Spalt @1024 und @1440 (je 6 px)
       · «Panel über der Reiterleiste» · «kein Einstiege-Block»
  grün blieb «Kanten @1440» — dort ist das Feld 384 px und damit ohnehin
  breiter als der Vorher-Boden 22 rem = 352 px.
Lauf 2 (`min-w-[26rem]` = 416 px):     «Kanten @1440» rot (Δ links −32)
Danach zurückgenommen; alle sechs grün.
```

**§6.3-Deklarationen** (zwei bestehende Sonden, Grund je am Fundort):
`e2e/verlauf-o1.e2e.ts` (Einstiege-Block und sein Klick gestrichen statt
umgeschrieben) · `e2e/suche-q-fokus-s1-s6.e2e.ts` (Listbox-Name;
Pfeiltasten-Fall legt sich seinen Verlauf selbst an).

---

## 7 · Zwei Befunde am Basis-Stand (Nullprobe, §3)

Der Nullprobe-Lauf auf `c0f2972ba` (identischer Misch-Lauf, 12 Specs,
`--workers=2`) lief **2 rot**:

1. `e2e/leser-suche-a35-a40-a41.e2e.ts` A41 «Trefferdropdown der Topbar-Suche
   verdeckt die sticky Gesetzes-Kopfzeile» — **rot auf der Basis, grün mit
   D23**. Das ist derselbe Stapelkontext-Defekt wie Davids unsichtbares
   Etikett; der z-Nachzug (§3) repariert ihn mit.
2. `e2e/verlauf-o1.e2e.ts` «Einstieg» (exact) — **rot auf der Basis**: D9 hatte
   das Etikett auf «Einstiege» umbenannt, die Sonde nicht nachgezogen. Mit dem
   Wegfall des Blocks ist die Zeile ohnehin gestrichen.

---

## 8 · Offener Punkt: drei last-abhängige Sonden (kein D23-Befund)

`suche-seite.e2e.ts` (2 Fälle) und `w224-plus-reiter.e2e.ts` («Suche füllt
DENSELBEN Reiter») hängen alle am lazy geladenen Artikel-Index (25 391 Artikel)
und haben dafür nur den 10-s-Standardtimeout von `expect`.

Messreihe auf diesem Stand:

| Bedingung | Ergebnis |
|---|---|
| `suche-seite` allein, `--workers=3 --repeat-each=4` (20 Läufe) | 20 grün |
| «Header-Dropdown …» allein, `--workers=3 --repeat-each=8` | 8 grün |
| Misch-Lauf 13 Specs, `--workers=5`, Last ~40 | 3 rot |
| Misch-Lauf 13 Specs, `--workers=2`, Last ~40 | 3 rot |
| Misch-Lauf 13 Specs, `--workers=2`, Last ~10 | **116 grün** |
| Basis `c0f2972ba`, `suche-seite` allein, 10 Läufe | 10 grün |

Die Messbedingung ist also die Maschinenlast (parallel laufende Bau-Agenten),
nicht der Stand. Der Wurzel-Fix gehört in diese drei Sonden (auf den geladenen
Index warten statt auf eine Uhr) — er gehört nicht zu D23 und ist als
Roadmap-Punkt zu führen.

---

## 9 · Tore

`npm run lint` (0 Fehler, 1 vorbestehende Warnung in `useUniversalSuche.ts`) ·
`npx tsc -b` · `npm run test` (446 Dateien, 7329 Tests) ·
`npm run check:design-tokens` · `npm run check:farbwelt` · `npm run build` ·
`npm run check:e2e-shards` (119 Specs) — alle grün, nackt gefahren.

## 10 · Bilder

`r5f1e-leer-{1440,1024,390}-{hell,dunkel}.jpg` ·
`r5f1e-treffer-{1440,1024,390}-{hell,dunkel}.jpg` ·
`r5f1e-tastatur-{1440,1024,390}-{hell,dunkel}.jpg` ·
`r5f1e-normsprung-panel-1440-hell.jpg` · `r5f1e-normsprung-ziel-1440-hell.jpg`
