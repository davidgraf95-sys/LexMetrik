# R5-F1K — D30 «Bezüge-Zeile zeigt ihre Inhalte» · D31 «Popover lesbar»

**Runde** W2·24-DESIGN-IDENTITAET/R5-F1K · **Datum** 6./7.9.2026 · **Branch**
`feat/w2-24-e2e-ed` (Basis `8cfbc521e`) · **Spec** die zwei David-Bugs D30/D31.

Alles Gemessene stammt aus dem `dist/`-Preview DIESES Worktrees
(`vite preview`, Port 4429), Chromium/Playwright, hell und dunkel @1440.

---

## 1 · D30 — die Wurzel war nicht die Darstellung, sondern die Frage

Davids Befund, wörtlich: die Zeile «Bezüge · 11 Entscheide · 1 Rechner ›» klappt
auf und zeigt «NUR ‹Rechnen › Kündigung & Fristen …› (57 px)».

**Drei Ursachen übereinander**, jede einzeln gemessen:

| # | Fundstelle | Was falsch war |
|---|---|---|
| **U1** | `v3/leserV3Modell.ts:206` + `v3/LeserLesespalte.tsx` | Seit H3 lädt der Leser den Bezugs-Shard erst beim Öffnen des **Panels**, und die Lesespalte liess die `bezuege`-Prop des Kerns bewusst weg (Pos. 12). Die Zeile hatte damit **keinen Weg**, nach dem Apparat zu fragen: die ZAHL kam aus der Zähl-Datei (R6c), die LISTE konnte nie kommen. |
| **U2** | im Leser gar nicht vorhanden | Die Rubrik «Materialien» hatte **nie** eine Liste — nur die gezählte Zahl. |
| **U3** | `bezuegeLaden.ts`, `bezuegeFuer` | Nach dem Fix von U1 zeigte die Zeile **3 von 11** Entscheiden: sie erbte stillschweigend die Panel-Facetten. Die übrigen acht fehlten samt ihrer Gruppe, also ohne jeden Hinweis auf eine Auswahl — das versteckte Filter, das Ä54 am Panel verbietet (§8). |

**Gemessen an OR 336c @1440**, Zustand vor / nach dem Aufklappen:

| Stand | Kopfzahl | gerenderte Entscheid-Zeilen | Materialien |
|---|---|---|---|
| `8cfbc521e` (Befund) | 11 · 11 | **0** · **0** | keine Liste |
| nach U1-Fix | 11 · **3** | 0 · 3 | Liste da |
| nach U3-Fix (Ist) | 11 · 11 | 0 · 8 sichtbar, **11 nach «weitere 3»** | Liste da |

### Der Bau

* `v3/panelModell.ts` — `weckeDaten()` setzt **dasselbe** `jeGeoeffnet`-Flag wie
  das Panel, ohne es aufzuziehen. **Eine** Stelle entscheidet das Nachladen (§5);
  wer erst die Zeile aufklappt und dann das Panel öffnet, löst keinen zweiten
  Fetch aus.
* `parts/BezuegeKopf.tsx` — `onOeffnen` beim Aufklappen **und** beim gemerkten
  Anfangszustand (`onToggle` feuert dafür nicht); Skelett-Zeile «lädt …»
  **neben** dem, was schon steht (Verweise und Rechner brauchen keinen Shard).
* `parts/ArtikelLeser.tsx` — neue Prop **`bezuegeImKopf`**, Entscheide als
  `BezuegeZeile form="rand"`, Materialien in der Zeilenform des Rechnen-Blocks.
* `bezuegeLaden.ts` — `alleFuer(artikel)`: `bezuegeFuer` **ohne** den einen
  `waehleBezuege`-Schritt. Dieselbe Quelle, dieselbe Ordnung, keine neue Rechnung.
* `artikelMaterialienLaden.ts` (neu) + `lib/kontext.ts` — die Materialien-Liste
  aus **derselben** Quelle, aus der die Zahl gezählt wurde
  (`materialien/kanten/<KEY>.json`); projiziert mit `projiziereMaterialien`, das
  aus `materialienFuerArtikel` herausgezogen ist (die async-Fassung ist jetzt ihr
  Wrapper — zwei Aufrufer, eine Rechnung).
* `parts/BezuegeZeile.tsx` + `index.css` — in der `rand`-Form steht die amtliche
  Kurzregeste **sichtbar** unter dem Zitat (bis hierher nur im `title` und im
  Hover-Kasten, für Tastatur und Touch also unsichtbar); Registerstrich je Rubrik
  aus denselben `--reg-*`-Token wie die Marke in der Zeile.

### Zwei Abweichungen vom Auftrag, offengelegt (§7)

**(1) «≥ 11 Entscheid-Zeilen sichtbar» — die Portionierung bleibt.**
Der Auftrag verlangt, dass das Aufklappen alle gezählten Zeilen zeigt. Gemessen
über alle 312 Zähl-Dateien:

| Artikel mit Zahl | Median | p90 | p99 | max |
|---|---|---|---|---|
| 6467 | 2 | 15 | 198 | **4140** (BGG 42) |

224 Artikel führen über 50 Entscheide. «Alles auf einmal» hiesse dort eine Wand
von tausenden Zeilen im Lesekörper. `PRO_SCHRITT = 5` bleibt darum unverändert;
statt die Zahl zu heben, weist der Wächter nach, dass «weitere N» die Kopfzahl
**vollständig einlöst** (11 = 11 nach dem letzten Klick). Der Gruppenkopf nennt
die Bezugsgrösse, es ist nichts verborgen.

**(2) `--z-popover` — die Ebene heisst schon anders.**
Der Auftrag nennt ein Token `--z-popover`. Die Schichtungs-Skala führt die Ebene
bereits als `--z-dropdown` («Popover/Tooltips/Menüs», `index.css:366`). Ein
zweiter Name für dieselbe Ebene wäre eine zweite Wahrheit (§5); das Rezept setzt
`--z-dropdown`.

---

## 2 · D31 — eine Karte im Fluss ist keine Fläche über dem Text

Befund: das Hover-Popover «hebt sich nicht vom Hintergrund ab, überlappt mit dem
Text dahinter».

**Wurzel, gemessen:** alle sieben Vorschau-Flächen des Hauses trugen `.lc-card` —
und die steht seit dem «Kästen zu Linien»-Umbau auf
`background: transparent; border: 0` (`index.css:1399`). Für eine Karte **im
Fluss** der Seite ist das richtig; für eine Fläche **über** laufendem Text heisst
es: der Artikel steht durch die Vorschau hindurch.

**Ein Rezept, alle Konsumenten darauf** — `.lc-popover`: `--paper-raised`,
1 px `--rule`, Radius 0, kein Schatten, `isolation: isolate`, `--z-dropdown`,
`max-width: min(36rem, 100vw − 1rem)`. Position, Breite und Innenabstand bleiben
beim Aufrufer (dieselbe Trennung wie bei `.lc-schwebeflaeche`).

| Konsument | Datei |
|---|---|
| Norm-Vorschau (V2-Hover + Klick-Dialog) | `components/NormPopover.tsx` |
| Norm-Vorschau, Lade-/Fehl-Hülle | `components/vorlagen/NormChip.tsx` |
| Entscheid-Vorschau am Bezugs-Chip | `components/verzahnung/RegestePopover.tsx` |
| Begriffs-Tooltip | `components/verzahnung/Begriff.tsx` |
| Zeichen-Legende | `components/verzahnung/ZeichenLegende.tsx` |
| Entwurfs-Legende | `components/EntwurfLegende.tsx` |
| Fussnoten-Popover im Lesetext | `components/normtext/ArtikelBody.tsx` |

**Warum nicht `.lc-schwebeflaeche`:** zwei Rollen mit verschiedenem Grund
DAHINTER. Die Schwebefläche hängt an einer Kante und liegt über der Papierfläche
der Seite — `--paper` plus Haarlinie trennt sie dort. Das Popover liegt über
laufendem Text; dieselbe Tönung liesse die Zeilen dahinter mitlesen. Es bekommt
darum die Stufe darüber (`--paper-raised`), wie im Auftrag verlangt.

### Messreihe (computed, WCAG-Kontrastformel)

| Fläche | Theme | Hintergrund | Text | Kontrast | Rahmen | Grösse |
|---|---|---|---|---|---|---|
| Fussnoten-Popover | hell | rgb(255,255,255) | rgb(37,35,31) | **15.68** | 1 px | 288×72 |
| Fussnoten-Popover | dunkel | rgb(40,37,33) | rgb(226,224,220) | **11.57** | 1 px | 288×72 |
| Entscheid-Vorschau | hell | rgb(255,255,255) | rgb(106,102,94) | **5.71** | 1 px | 320×250 |
| Entscheid-Vorschau | dunkel | rgb(40,37,33) | rgb(147,141,129) | **4.62** | 1 px | 320×250 |
| Norm-Vorschau | hell | rgb(255,255,255) | — | — | 1 px | 576×552 |
| Norm-Vorschau | dunkel | rgb(40,37,33) | — | — | 1 px | 576×552 |

Alle vier gemessenen Kontraste über 4.5 : 1. Vorher: `rgba(0, 0, 0, 0)` — nicht
messbar, weil keine Fläche da war.

---

## 3 · Die Nullprobe, die einen Rückbau verhindert hat (§0 Ziff. 3)

`leser-v3-kontext-cls` (b) wurde nach dem ersten Bau rot:
`Artikel senkrecht verschoben: 1093,1385,1798,2461,2794 → 1093,1493,2013,2783,3116`.

Verfahren: **derselbe Worktree, `git checkout --detach 8cfbc521e`, voller Build,
derselbe Lauf** → **grün**. Der Defekt lag also am Bau, nicht auf der Basis.

**Ursache:** die Prop `bezuege` speist im Kern **zwei** Orte — die aufgeklappte
Zeile am Artikelkopf (`kopfForm`) **und** den Artikelfuss der schmalen Form und
der Suchsicht (`!kopfForm`). @390 ist `kopfForm` falsch; das Öffnen des Panels lud
den Shard, und die Fuss-Zeile wuchs an **jedem** Artikel in den Lesekörper — Pos.
12 war zurück, ohne dass es jemand wollte.

**Fix:** zwei Props, weil es zwei ORTE sind — `bezuegeImKopf` landet
ausschliesslich innerhalb des `<details>`, das der Leser selbst geöffnet hat.
Nebeneffekt: die H3-Sonde «die Lesespalte setzt `bezuege` NICHT» bleibt damit
**wörtlich unverändert** bestehen (keine §6.3-Änderung nötig) und bekommt eine
zweite Sonde daneben, die die D30-Zusagen hält.

---

## 4 · Wächter, jeder einmal rot gezeigt (§6.7)

| Wächter | Rot-Beweis | Ergebnis |
|---|---|---|
| `e2e/leser-bezuege-inhalt-d30.e2e.ts` (a)(c) | `onBezuegeOeffnen` in `LeserLesespalte` weggelassen | «kein Entscheid-Block in der aufgeklappten Zeile» · «Materialien-Rubrik zählt, zeigt aber nichts» — 2 von 3 rot; (d) bleibt grün, richtig: sie misst den geschlossenen Zustand |
| `e2e/leser-bezuege-inhalt-d30.e2e.ts` (b) | `alleFuer` → `bezuegeFuer` | «Kopfzahl 11 gegen Gruppen-Summe 3 (3)» |
| `e2e/popover-lesbar-d31.e2e.ts` | `.lc-popover { background: transparent }` | **6 von 6 rot**, je «Popover-Hintergrund rgba(0, 0, 0, 0)» |
| `src/tests/leser-v3-fundament.test.ts` (D30-Sonde) | `bezuegeImKopf` weglassen bzw. auf `bezuegeFuer` stellen | die Sonde bindet den Ausdruck wörtlich |

**Messbedingung, offengelegt (§0 Ziff. 3):** der Fall «Entscheid-Vorschau am
Bezugs-Chip» braucht den vollen OR-Bezugs-Shard (2.2 MB roh) — kein anderer
geprüfter Erlass führt am Artikel eine Entscheid-Kante mit Regeste (ARG 15a:
null, gemessen 7.9.2026). Unter `--repeat-each=2` mit zwei Workern riss er das
30-s-Budget, seriell nicht; er trägt darum `test.slow()` und eine Hover-Schleife
(die Vorschau öffnet erst, wenn der Zeiger 450 ms **ruht**, und die Liste wächst
beim Eintreffen des Shards noch unter dem Zeiger weg).

---

## 5 · Tor-Ergebnisse

| Tor | Ausgabe |
|---|---|
| `npx tsc -b` | Exit 0 |
| `npm run lint` | Exit 0 (1 vorbestehende Warnung in `useUniversalSuche.ts`) |
| `npm run test` | Exit 0 — 454 Dateien, **7412 Tests**, 2 übersprungen |
| `npm run golden:vergleich` | Exit 0 — **IDENTISCH, 256 Fälle byte-gleich** |
| `npm run check:golden-normtext` | Exit 0 — 60257 Knoten, keine Waisen |
| `npm run check:e2e-shards` | Exit 0 — 127 Specs, Union deckungsgleich |
| Playwright `verweis-u` · `uinav-v2-v4-normchip` · `leser-bezuege-zaehler` · `a11y` · `leser-bezuege-inhalt-d30` · `popover-lesbar-d31` · `leser-v3-kontext-cls`, `--repeat-each=2 --workers=2` | Exit 0 — **158 passed** |

## 6 · Screens

| Bild | Inhalt |
|---|---|
| `r5f1k-bezuege-hell.jpg` | OR 336c @1440 hell — Zeile aufgeklappt: «11 Entscheide», Leitentscheide 3 mit Regesten, Kantonal 5 von 8, «weitere 3», Rechnen |
| `r5f1k-bezuege-dunkel.jpg` | dasselbe dunkel |
| `r5f1k-popover-hell.jpg` | Fussnoten-Popover über dem Gesetzestext, hell |
| `r5f1k-popover-dunkel.jpg` | dasselbe dunkel — die Fläche deckt den Text darunter |

## 7 · Offen

* Der Panel-Öffner in der Kopfzeile nennt die **gefilterte** Zahl («3
  Entscheide»), die Bezüge-Zeile die **ungefilterte** («11 Entscheide»). Beide
  sind für sich wahr — das Panel zeigt seine Facetten, die Zeile ihre
  Bezugsgrösse —, aber sie stehen nebeneinander auf einem Bildschirm. Vorschlag
  für einen eigenen Schritt: der Öffner sagt «3 von 11» oder trägt die
  Bezugsgrösse wie die Gruppenköpfe. **Nicht** in dieser Runde gebaut — er
  gehört zum Panel, nicht zu den zwei Bugs.
