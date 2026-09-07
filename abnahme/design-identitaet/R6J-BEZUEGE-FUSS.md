# R6J — «Bezüge unten an den Artikel» (D34)

Nachzug zu W2·24-DESIGN-IDENTITAET, 7.9.2026. Auftrag David, wörtlich:

> «das mit den bezügen soll unten an den artikel und nicht direkt nach der
> artikel nummer»

**Antwort in einem Satz: die Bezüge-Zeile steht jetzt am Artikelende — unter dem
letzten Absatz und dem Fussnoten-Apparat, vor dem nächsten Artikel — und dabei
sind aus ZWEI Artikelfüssen (Breitform-Kopfzeile und schmaler Zeilenform-Fuss)
EIN Baustein geworden.**

---

## 1 Messaufbau

- Zweig `feat/w2-24-d34-bezuege-fuss`, Basis `origin/main` @ `cfa8a9f81`,
  Worktree `.claude/worktrees/w2-24-d34`.
- **Produktions-Build** (`npm run build`) + `vite preview --port 4424
  --strictPort`, nie Dev-Server. Playwright `--workers=2`.
- Referenz-Artikel: **OR Art. 336c** (11 Entscheide · 1 Rechner) — derselbe,
  an dem D30/R6c gemessen haben.

## 2 Ist-Zustand (D33) und Befund

Die Zeile «Bezüge · 11 Entscheide · 1 Rechner ›» sass in der **Breitform**
direkt unter der Artikelnummer und trennte damit die Überschrift von ihrem
eigenen Wortlaut. Gemessen am Stand `cfa8a9f81`, OR 336c @1440:
Zeile bei **y = 223.75**, während der Artikel-Wortlaut erst bei **y = 1726**
endet — die Zeile lag also 1502 px ÜBER dem, wozu sie gehört.

Daneben stand ein **zweiter** Artikelfuss: die **Zeilenform** (@390, Pane,
Trefferliste) zeigte im Beiwerk eine offene Verweis-Chip-Reihe und die
unbedingte `BezuegeZeile`/`LeitfallZeile`. Derselbe Fachinhalt, andere Gestalt,
anderer Ort, andere Prop — zwei Wahrheiten am selben Artikel (§5).

## 3 Der Bau

| Was | Wo |
|---|---|
| Zeile ans Artikelende, ausserhalb `artOffen` | `src/pages/gesetz-leser/parts/ArtikelLeser.tsx` |
| Kopf-Variante entfernt (`{kopfForm && …}`) | ebd. |
| Zeilenform-Fuss (Chips + `BezuegeZeile`) **ersatzlos** entfernt | ebd. |
| `werkzeuge` nicht mehr an `kopfForm` gebunden; `LEERE_WERKZEUGE` entfällt | ebd. |
| Baustein umbenannt: `ArtikelBezuegeZone` → `ArtikelBezuegeFuss` | `parts/ArtikelLeser.bezuegeFuss.tsx` (vorher `…bezuegeZone.tsx`) |
| Prop `bezuegeImKopf` → `bezuegeImFuss` (Name folgt dem Ort) | ebd. · `ArtikelLeser.tsx` · `v3/LeserLesespalte.tsx` |
| Feine Trennlinie oben (`--rule-soft`), grösserer Abstand davor | `src/index.css`, `.lr7-bez` |

**Unverändert:** Inhalt, Zähler, Registerstriche, Aufklapp-Inhalt, das
Lazy-Laden (`onOeffnen` → `weckeDaten`), die Skelett-Zeile («lädt …») und
`print:hidden`. Klassenpräfix `.lr7-bez*`, Dateiname `BezuegeKopf.tsx` und
Komponentenname `BezuegeKopf` bleiben: sie sind der Vertrag zu den bestehenden
Sonden und zu datierten Belegen, die auf sie zeigen (§0.2b — Belege werden
ergänzt, nicht nachgeführt).

### Nebenwirkung, ausdrücklich erwünscht (Pos. 12)

Die gelöschte Zeilenform-Zeile war die Stelle, an der der eintreffende
Bezugs-Shard @390 in den Lesekörper hineinwuchs (gemessen an der StPO,
Artikel-y 1385→1493→…, `e2e/leser-v3-kontext-cls` (b)). Beide Props landen jetzt
im geschlossenen `<details>`, und das legt seinen Inhalt nicht ins Layout —
die Zusage hängt damit an der **Bauart**, nicht mehr an der Disziplin, eine
Prop wegzulassen.

## 4 Die neue Sonde und ihre Rot-Probe (§6.7)

`e2e/leser-bezuege-fuss-d34.e2e.ts`, vier Zusagen:
(a) Ort unter dem letzten Absatz und noch vor dem nächsten Artikel ·
(b) genau EINE Zeile, und nicht direkt nach der Artikelnummer (> 48 px) ·
(c) @390 dieselbe EINE Zeile am selben Ort · (d) die Trennlinie oben.

**Rot-Probe 1 — Kopf-Position wiederhergestellt** (`<ArtikelBezuegeFuss>` zurück
vor den `{artOffen && …}`-Block):

```
✘ (a)+(b)+(d) @1440 — Bezüge-Zeile bei y=223.75, Wortlaut endet bei y=1726.09375
✘ (c) @390     — Bezüge-Zeile bei y=233.5625, Wortlaut endet bei y=2971.3125
2 failed
```

**Rot-Probe 2 — `border-top` an `.lr7-bez` gelöscht** (Position korrekt):

```
✘ (a)+(b)+(d) @1440 — die Bezüge-Zeile trägt keine Trennlinie nach oben
   Expected: not "0px"
1 failed, 1 passed
```

Beide Male grün nach Rücknahme der Rot-Probe.

## 5 Tore

| Tor | Ergebnis |
|---|---|
| `npx tsc -b` | grün (Exit 0) |
| `npx eslint .` | Exit 0 — 0 errors, 1 Bestands-Warnung (`useUniversalSuche.ts`, unberührt) |
| `npm run test` | **460 Dateien / 7454 Tests grün**, 2 skipped |
| `npm run golden:vergleich` | `IDENTISCH — 256 Fälle byte-gleich` |
| `npm run check:golden-normtext` | `OK — 60257 Snapshot-Knoten vollständig, keine Waisen` |
| `npm run check:schlankheit` | `GRÜN — 1486 Dateien, keine Überschreitung` |
| `npm run check:e2e-shards` | `grün — 139 Specs, Union deckungsgleich` |
| `npm run check:perf-lighthouse` (`PERF_RUNS=1`) | **GRÜN — OR CLS 0.002 ≤ 0.05**, LCP 10.98 s, TBT 2438 ms normiert, Score 36 |
| e2e `leser-bezuege-fuss-d34` · `-inhalt-d30` · `-zaehler` · `leser-links-p3` · `popover-lesbar-d31` | 14 passed |
| e2e `leser-v3-kontext-cls` · `verweis-u` | grün |
| e2e `leser-r1-r2` | **1 Fall rot — Defekt liegt auf `main`, siehe §6** |

## 6 Nullprobe (§0.3): der rote CLS-Fall gehört nicht zu D34

`e2e/leser-r1-r2.e2e.ts` › «Suche, Fundstellen-Sprung und Gliederungs-Sheet ohne
Layout-Shift (CLS 0)» wird rot mit

```
Input-freier Layout-Shift der R1/R2-Flächen — Quellen:
DIV.flex shrink-0 items-center gap-1 sm:gap-1.5
Expected: 0   Received: 0.0003067543680049576
```

**Nullprobe auf dem unveränderten Basis-Stand `cfa8a9f81`** (Produktions-Build,
gleicher Preview-Port, `--workers=2`, `--repeat-each=3`): 1 von 3 rot, mit dem
**identischen** Wert `0.0003067543680049576` und derselben Quelle. Auf dem
D34-Zweig: 2 von 3 rot, gleicher Wert. Die Streuung ist die der Messbedingung
(zwei Worker parallel), der Wert selbst ist deterministisch und liegt auf `main`.

Die genannte Quelle (`DIV.flex shrink-0 …`, daneben `BUTTON.lc-schliessknopf`
und `SPAN.min-w-0 truncate max-w-[15rem]`) ist die **Reiterleiste**, nicht die
Bezüge-Zeile; `.lr7-bez` kommt in keiner Shift-Quelle vor. D34 hat die
Reiterleiste nicht angefasst (TABU dieses Auftrags) — der Fall gehört zum
Reiterstreifen-Bau und ist dort zu beheben (§17: Wurzel-Fix, nicht umschiffen).

## 7 Bilder

| Datei | Ansicht |
|---|---|
| `r6j-1440-hell-or336c-fuss.jpg` | @1440 hell — OR 336c, Bezüge aufgeklappt |
| `r6j-1440-dunkel-or336c-fuss.jpg` | @1440 dunkel |
| `r6j-390-hell-or336c-fuss.jpg` | @390 hell (Zeilenform — dieselbe EINE Zeile) |
| `r6j-390-dunkel-or336c-fuss.jpg` | @390 dunkel |

Zu sehen ist in allen vieren dieselbe Reihenfolge: Wortlaut → Fussnoten-Apparat
→ feine Trennlinie → «Bezüge · 11 Entscheide · 1 Rechner ›» → nächster Artikel.

## 8 §6.3-Deklarationen (Sonden-Änderungen)

Beide sind **Namens-Nachzüge**, keine Zusagen-Änderung; die Herleitungen tragen
die Deklaration am Fundort:

1. `src/tests/leser-v3-fundament.test.ts` — die D30-Quellensonde sucht
   `bezuegeImFuss=` statt `bezuegeImKopf=`. Die drei Zusagen (genau EINE
   Setzung · `alleFuer`, also ungefiltert · kein zweiter Ladepfad) stehen
   unverändert; der datierte Beleg darüber bleibt, wie er ist.
2. `src/tests/leser-benennung.test.ts` — der Wächter-Pfad heisst
   `parts/ArtikelLeser.bezuegeFuss.tsx` statt `…bezuegeZone.tsx`. Gleiche
   Datei, gleicher Geltungsbereich, gleiche Wörter.

## 9 Nachzug 7.9.2026 — CI-Rot 34111127560 (Shard 5) und sein Wurzel-Fix

Der PR-Lauf war an **einer** Sonde rot:
`e2e/leser-ruecksprung-r5-r7.e2e.ts:225` (R7, «Einsprung über `#art-…`»),
Meldung `Ziel steht 203 px statt am Landepunkt 154 px` (Toleranz 24). Lokal
byte-gleich nachgestellt: `dist/`-Preview, Chromium 1440×900, 6× CPU-Drossel,
`/gesetze/bund/BV#art-8`, Abweichung exakt **49 px**.

**Wurzel (gemessen, rAF-Sampler je Frame):**

| t | Ziel-`top` | `.lr7-bez` im Dokument | davon über dem Ziel | `docH` |
|---|---|---|---|---|
| 6046 ms | 154 px (Landepunkt) | 0 | 0 | 118 314 |
| 7099 ms | **203 px** | 145 | 7 (à 33 px + 16 px Abstand) | 119 000 |

Die Zähl-Datei (`src/pages/gesetz-leser/bezuegeZaehler.ts`) entscheidet, **ob**
ein Artikel überhaupt eine Bezüge-Zeile bekommt — ohne echte Zahl steht dort
nichts (§8). Bei der BV führt vor ihrem Eintreffen kein einziger Artikel eine
Zahl aus statischer Quelle (weder «Verweise» noch «Rechner»). Seit D34 ist diese
Zeile der Artikel**fuss** und 49 px hoch; ihr Zuwachs liegt damit **zwischen**
dem Scroll-Anker des Browsers und dem Ziel. Was oberhalb des Ankers wächst,
fängt die Scroll-Verankerung auf — dieses Stück nicht. Vor D34 stand dieselbe
Zeile am Artikel**kopf**, also oberhalb des Ankers: derselbe Zuwachs, aber
kompensiert. Das ist der ganze Unterschied zwischen grün auf `main` und rot hier.

**Verworfener Weg (probiert, gemessen):** die Zähl-Datei früher laden
(`beiLeerlauf` heraus). Netz-Zeitleiste: die Datei ist bei **t 1116 ms** fertig,
also 5 s vor dem Einschwing-Ende. Es fehlt nicht das Byte, sondern die **zweite
Render-Runde** — ein Fetch-Ergebnis kann frühestens im Folge-Render stehen, und
der lag unter Last hinter dem Sprung. Die Messung nach der Änderung war
unverändert 203 px; die Änderung ist darum zurückgenommen (§17-Gegengewicht:
kein Zusatz, der den gemessenen Defekt nicht bewegt).

**Gebauter Fix** — `src/pages/gesetz-leser/inhalt-hooks-tieflink.tsx`, keine
zweite Mechanik: dieselbe rAF-Schleife, die den Sprung einschwingen lässt, endet
nicht mehr beim Aufdecken, sondern läuft als **Nachzug** weiter. Verdeckt zieht
sie wie bisher jeden Frame nach; aufgedeckt fasst sie nichts an, ausser das Ziel
ist von seiner eingeschwungenen Lage weggelaufen — dann stellt sie es einmal
zurück. Gemessen wird weiterhin der Abstand zur **letzten Lage**, nicht zum
Landepunkt: `scroll-margin-top` gilt gegen den Scroll-Container, im sekundären
Pane wäre der absolute Vergleich falsch. Auch `scrollIntoView` steht jetzt an
genau einer Stelle für Erstsprung, Einschwingen und Nachzug (§5).

Zwei Klammern: `NACHZUG_MS = 4000` (gemessener Verzug 1053 bzw. 1665 ms; rund
das Doppelte des schlechteren, für den 2-vCPU-Runner) und die **Übernahme** —
`wheel`/`touchstart`/`keydown`/`pointerdown` beenden den Nachzug sofort, dieselben
vier Ereignisse, mit denen auch die Zielansage aufhört
(`components/layout/DeepLinkSkeleton.tsx`). Ein Nachzug, der gegen den Leser
scrollt, wäre schlimmer als der Versatz, den er heilt.

**Wirkung, gemessen nach dem Fix** (gleiche Bedingung): t 3969 ms Ziel 203 px →
t 3986 ms (Folge-Frame) Ziel wieder **154 px**; Endstand `top = 154`,
`scroll-margin-top = 154`. Sichtbar ist das ein Scroll, der einen Zuwachs
oberhalb ausgleicht, also kein zweites Bild.

**Sonde unverändert** (§6.3): an `e2e/leser-ruecksprung-r5-r7.e2e.ts` ist keine
Zeile angefasst.

**Tore nach dem Fix:** die vier Specs
(`leser-ruecksprung-r5-r7`, `leser-bezuege-fuss-d34`, `leser-v3-kontext-cls`,
`leser-r1-r2`) mit `--repeat-each=3 --workers=2` **75 passed** · `npm run test`
7454 grün · `npx tsc -b` 0 · lint 0 Fehler (1 Bestands-Warnung) ·
`golden:vergleich` 256 Fälle byte-gleich · `check:golden-normtext` 60 257 Knoten
· `check:perf-lighthouse` (PERF_RUNS=1) grün, OR-CLS **0.002** (≤ 0.05).

## 10 Nachfix 7.9.2026 — CI-Rot 34117385177 (Shard 1): der Nachzug riss zurück

Der Nachzug aus §9 hat einen zweiten Fehler ausgelöst. CI-Rot **34117385177**,
Shard 1, `e2e/leser-history-hash.e2e.ts:21` (LM-199 «Zurück mit stehendem
#hash: Leseposition, nicht Einstiegs-Anker»): `toBeInViewport` fehlgeschlagen.

**Reproduktion, 3/3 byte-gleich** (`dist/`-Preview auf Stand c79e8e067,
Chromium 1440×900, `E2E_PORT=4424`, `--repeat-each=3 --workers=2`): rot **nicht**
beim Browser-Zurück, sondern schon in Zeile 37 — direkt nach dem organischen
Wegscrollen zu Art. 5, lange vor der Rückkehr aus dem StGB. Die Anfangsvermutung
(«die Leseposition-Wiederherstellung und der Nachzug rennen beim Zurück
gegeneinander») ist damit **falsifiziert**: beim Zurück läuft der Effekt gar
nicht erst an, `istHashVerbraucht()` bricht ihn in Zeile 95 ab.

**Wurzel, direkt gemessen** (`scroll`-Ereignis-Sonde auf `/gesetze/bund/AIG#art-90`,
danach `scrollIntoViewIfNeeded()` auf Art. 5) — zwei Ereignisse, 10 ms auseinander:

| t | `scrollY` | Lage Art. 90 |
|---|---|---|
| 1458 ms | 3'280 | 92'403 px (weit unterhalb des Bildes) |
| 1468 ms | 95'529 | **154 px** (zurück am Landepunkt) |

Die zweite Zeile ist der Nachzug. Er kannte nur die Frage «hat sich die Lage
geändert?», nicht die Frage «**von wem?**» — Zuwachs oberhalb (der D34-Fall aus
§9) und ein fremder Scroll erzeugen dasselbe Signal. Die vier Übernahme-Ereignisse
(`wheel`/`touchstart`/`keydown`/`pointerdown`) fangen den Menschen, aber keinen
Scroll aus Code: Playwrights `scrollIntoViewIfNeeded`, die A16-Konvergenzschleife,
jedes `scrollTo` aus einem anderen Baustein. Folge in der Sonde: der Anker-Spy sah
nie Art. 5, die A16-Leseposition blieb Art. 90, und die ganze LM-199-Kette fiel.

**Fix** (`src/pages/gesetz-leser/inhalt-hooks-tieflink.tsx`, keine zweite
Mechanik): dieselbe Schleife bekommt **einen Eigentümer-Begriff** (§5). Ist das
Ziel nach dem Einschwingen aus dem Bild gelaufen, gibt sie ab (`beende()`) statt
zurückzureissen. Der Massstab ist hergeleitet, nicht gewählt: unkompensiert kann
das Ziel nur verschieben, was **zwischen dem oberen Bildrand** (dem Scroll-Anker
des Browsers) **und dem Ziel** wächst — und das Ziel steht per Konstruktion am
Landepunkt, also im ersten Bild. Ein Nachzug bewegt es darum höchstens um eine
Bildhöhe; alles darüber ist ein fremder Scroll. Gemessen wird die Bildhöhe am
Fenster, auch im Pane: `getBoundingClientRect().top` ist immer fenster-relativ.

Der Schalter ist bewusst **`eingeschwungen`**, nicht `aufgedeckt`: deckt der
Zeitdeckel (`AUFDECK_MS`) auf, während die Lage noch wandert, steht das Ziel u. U.
gar nicht im Bild — eine Abgabe in diesem Moment liesse den Leser irgendwo stehen.
Erst nach zwei ruhigen Frames ist «ausserhalb des Bildes» aussagekräftig.

**Nicht nochmal gebaut** (§17-Gegengewicht): «nur beim echten Tieflink-Einsprung»
steht bereits zweimal in derselben Datei — `istHashVerbraucht()` sperrt
Zurück/Vorwärts aus einer anderen Route, `hashSeedGetan` den Pane-Wechsel. Ein
dritter Wächter für dieselbe Sorge wäre eine zweite Wahrheit (§5).

### 10.1 Zwei neue Sonden und ihre Rot-Proben (§6.7)

Angehängt an `e2e/leser-bezuege-fuss-d34.e2e.ts` (Gruppe 2) — der Nachzug ist die
Kehrseite derselben Design-Entscheidung, er gehört nicht in eine eigene Datei.
Beide Zusagen sind **gegenläufig**; jede einzeln ist wertlos.

| | Zusage | rot gemacht durch | Ergebnis |
|---|---|---|---|
| (e) | fremder Scroll gewinnt: nach dem Wegscrollen bleibt man weg | Abgabe-Zeile löschen (= Stand c79e8e067) | **3/3 rot** — Art. 5 mit `viewport ratio 0` |
| (f) | der Nachzug greift weiterhin: frischer Tieflink steht nach dem Nachrendern am Landepunkt | `if (aufgedeckt) { beende(); return; }` an den Kopf von `nachziehen` (= Stand VOR c79e8e067) | **3/3 rot** — Art. 8 bei y=**203** statt **154**, also die 49 px der Bezüge-Zeile aus §9 |

Jede Probe färbt **genau eine** der beiden Sonden: bei (e) blieb (f) grün, bei (f)
blieb (e) grün. Die bestehenden Sonden sind unverändert (§6.3) — an
`e2e/leser-history-hash.e2e.ts` und `e2e/leser-ruecksprung-r5-r7.e2e.ts` ist keine
Zeile angefasst. Der Rückweg per Browser-Zurück braucht keine eigene neue Sonde:
`leser-history-hash.e2e.ts` misst genau diesen Fall und ist der Anlass des Nachfixes.

### 10.2 Tore nach dem Nachfix

Fünf Specs (`leser-history-hash`, `leser-ruecksprung-r5-r7`, `leser-bezuege-fuss-d34`,
`w224-reiterverhalten`, `leser-v3-kontext-cls`) mit `--repeat-each=3 --workers=2`:
**93 passed** (7.9 min) · `npm run test` **460 Dateien / 7454 Tests grün**, 2 skipped ·
`npx tsc -b` **0** · `npm run lint` **0 Fehler** (1 Bestands-Warnung in
`useUniversalSuche.ts`, unberührt) · `golden:vergleich` **256 Fälle byte-gleich** ·
`check:golden-normtext` **60 257 Knoten**, 0 Waisen · `check:schlankheit` grün
(1487 Dateien) · `check:e2e-shards` grün (142 Specs).
