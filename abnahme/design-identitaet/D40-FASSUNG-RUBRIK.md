# D40 — Fassung als Rubrik der Funktionszeile am Artikelende

Vollzugsvermerk zu W2·24-DESIGN-IDENTITAET, Bau-Einheit D40.
Auftrag David 7.9.2026, wörtlich: **«und wieso ist fassung nicht auch unten am
artikel?»**

Grundlage: `feat/w2-24-d40-fassung-rubrik` auf dem F2-Zweig `7db4880d5`
(PR #758, enthält F1 Funktionszeile · F3 Dreier-Wahl · F2 Rubriken-Wahl).
Alle Messungen 7.9.2026, Vorschau `:4440` aus eigenem `dist/`, Chromium,
`deviceScaleFactor 2`, ZPO `#art-198` (sieben Fassungs-Ereignisse) und BGBM.

---

## Klartext (für David)

1. **Die Fassung steht jetzt unten am Artikel**, genau wie alles andere. Sie
   heisst dort «7 Fassungen ›» und sagt damit gleich, wie oft dieser Artikel
   geändert worden ist. Ein Klick klappt dieselbe Zeitleiste auf, die vorher
   oben im Kopf steckte — dieselbe Liste, derselbe Text, nichts verloren.
2. **Oben ist sie ersatzlos verschwunden.** Kein zweiter Ort, keine
   Restlücke. Der Artikelkopf trägt jetzt nur noch die Sachüberschrift.
3. **Die Zahl ist echt gezählt**, nicht geschätzt: sie ist die Zahl der
   amtlichen Änderungsstände, die die Zeitleiste darunter auflistet. Hat ein
   Artikel keinen einzigen, steht die Rubrik gar nicht da.
4. **Abwählbar wie die anderen.** Im Ansicht-Menü unter «An diesem Artikel
   zeigen» steht «Fassung» neu als erstes Häkchen — sechs statt fünf.
5. **Die Wahl «Fassung / Fussnoten / aus» bleibt die obere Instanz.** Steht
   sie auf «Fussnoten» oder «aus», gibt es unten gar keine Fassungs-Rubrik.
   Zwei verschiedene Fragen, zwei Schalter: die eine sagt, *ob* es die
   Auskunft gibt, die andere, *ob sie am Artikel steht*.
6. **Der Ausdruck bleibt, wie er war.** Auf dem Papier steht weiterhin
   «Fassung · Gilt seit …» am Artikel; die Bedien-Zeile wird nicht gedruckt.
7. **Nichts springt beim Laden.** Gemessen an fünf Erlassen: kein Artikel
   verschiebt sich, wenn die Fassungs-Zahl nachträglich eintrifft.

**Wartet auf dich (Kleinigkeit):** das Wort «Bezüge» steht jetzt *zwischen*
der Fassung und den vier übrigen Rubriken («7 Fassungen · Bezüge · 11
Entscheide · 6 Verweise»). Das ist Absicht — die Fassung ist kein Bezug auf
etwas anderes, sondern eine Auskunft über den Artikel selbst, und das Wort
soll nicht behaupten, was es nicht benennt. Wenn Dir das Wort dort mitten in
der Zeile stört, kann es genauso gut ganz weg; sag Bescheid.

---

## Was gebaut wurde

| Vorher (bis D40) | Nachher |
|---|---|
| Kopf-Slot `[data-hist-slot]` mit «Gilt seit … ▸» neben dem Randtitel bzw. im Beiwerk | Rubrik `reg: 'f'` in der Funktionszeile am Artikelende |
| Eigener Klapp-Knopf **in** der Zeile (`aria-expanded` am Chip) | Der Rubrik-Griff klappt auf; der innere Knopf ist gefallen |
| 24-px-Reserve `mt-4 min-h-beiwerk` + `.lr7-fassung [data-hist-slot]:empty::before` | ersatzlos — es gibt nichts mehr zu reservieren |
| Fünf Rubriken-Schalter im Ansicht-Menü | Sechs, «Fassung» zuerst |
| `html[data-fuss-aus="rmgwa"]` versteckt die Zeile | `…="frmgwa"` |
| Fassung im Druck aus dem Kopf-Slot | Fassung im Druck aus `[data-hist-druck]` (`hidden print:block`) |

**Registerstrich:** die Marke trägt `--reg-g` (Gesetze) — die Fassungshistorie
ist Auskunft über den Erlass selbst; eine sechste Farbe für dieselbe
Vierer-Leiter wäre eine zweite Legende (§5). Der **Buchstabe** bleibt eigen
(`f`), sonst nähme «Verweise abwählen» die Fassung mit.

**Zahl:** `historie.ereignisse.length`. Korpus-Messung 7.9.2026 über alle 209
Shards: 13 093 Artikel mit Eintrag, davon **0** ohne Ereignis (Verteilung:
7532× 1 · 2786× 2 · 1115× 3 · 622× 4 · 346× 5 · Rest darüber). «0 ⇒ keine
Rubrik» heisst darum exakt «kein Historie-Eintrag», nie «Eintrag ohne
Ereignis».

---

## Rückbau (§17-Gegengewicht)

Ersatzlos gestrichen, nicht zusätzlich bewacht:

- `HistSlot` in `src/pages/gesetz-leser/parts/ArtikelLeser.kopfteile.tsx`
- die Werte `histImKopf` / `histSlot` und der Kopf-Zweig
  `kopfForm && (randInhalt || fussAnzeige.length > 0 || historie)` in
  `parts/ArtikelLeser.tsx` (die Bedingung ist wieder die eine Frage
  «trägt der Randtitel etwas?»)
- `useState`/`aria-expanded`/`aria-controls`/`panelId` in
  `parts/ArtikelHistorie.tsx` — der Klapp-Knopf hat keinen Gegenstand mehr
- CSS `.lr7-fassung` samt der W2·24-CI-Zeilenbox `:empty::before`
- `justify-content` und `gap` an `.lr7-kopf` (verteilten zwei Kinder)
- das Ä26-Tor `e2e/leser-lesemass` («Reserve nur, wo eine Fassungs-Zeile
  eintreffen kann») — sein Gegenstand ist weg, beide Fälle wären still grün
  gewesen (§6.7)

Die datierten Belege dieser Stellen (Messreihen 20.7. · 17.8. · 6.9.2026)
bleiben im Repo stehen und werden **ergänzt, nicht nachgeführt** (§0 Ziff. 2b).

---

## Migration des gespeicherten Zustands

`fussRubriken` trägt die **gewählten** Buchstaben. Ein neu hinzukommender
Buchstabe fehlt darum in jedem Bestands-Speicher — und «fehlt» hiesse dort
«abgewählt». Ohne Gegenmassnahme wäre die Fassungs-Auskunft bei jedem Leser
still verschwunden, der die Rubriken je angefasst hat (§8).

Neuer Schlüssel `stand: 2` im selben Speicher-Objekt. Er beantwortet genau
eine Frage — «konnte dieser Speicher `f` überhaupt kennen?» — und sonst
keine; er wird nie zum Options-Feld (Wächter im Migrations-Test).

| Bestands-Speicher | Ergebnis |
|---|---|
| kein `fussRubriken` | alle sechs (Grundzustand) |
| `['r','a']`, kein `stand` | `['f','r','a']` |
| `[]`, kein `stand` | `['f']` — «Alles ausblenden» hiess bis D40 «die FÜNF aus»; die Fassung stand danach weiter am Kopf |
| `[…]` mit `stand: 2` | unverändert übernommen, auch «f abgewählt» |
| `stand` mit Unfug-Wert (1, 3, '2', null) | wie ohne `stand` |

Idempotent und ohne Uhr (§2). Vier neue Fälle in
`src/tests/leser-optionen-migration.test.ts`.

---

## Abweichungen, offengelegt (§7)

1. **Screenshots an ZPO Art. 198 statt Art. 271.** Der Auftrag nannte
   Art. 271 (den D35-Referenzartikel). Dieser Artikel hat im Historie-Shard
   `ZPO.json` **keinen Eintrag** — dort gibt es folgerichtig keine
   Fassungs-Rubrik zu zeigen. Art. 198 trägt sieben Ereignisse **und**
   daneben Entscheide und Verweise, zeigt die neue Rubrik also im
   Zusammenspiel mit den alten. Art. 271 bleibt Prüfling der D35-F2-Sonde
   (dort unverändert grün).
2. **`--nt-stick` ist unverändert.** Der Auftrag nannte ihn zur Anpassung.
   Gegengeprüft: `--nt-stick` ist die Höhe der **klebenden Kopf-Zone der
   Seite** (`v3/leserGeometrie.ts` → `LeserRahmenV3`), nicht die des
   Artikelkopfs. Der gefallene Slot sass im ARTIKEL, nicht in der Kopf-Zone —
   eine Änderung dort wäre eine Anpassung ohne Anlass gewesen. Ankersprung
   und Leselinie sind unberührt: `e2e/leser-ruecksprung-r5-r7` und
   `e2e/leser-history-hash` laufen grün (20/20, ×2).
3. **`HIST_SLOT = 40` in `schaetzeArtikelHoehe` bleibt stehen.** Die Zusage
   der Schätzung lautet «echte Höhe ≤ Schätzung»; zu hoch ist die tolerierte
   Richtung (Platzhalter schrumpft beim Rendern, statt zu wachsen). Der Wert
   deckt seit D40 den Zuwachs der Funktionszeile. Nur der Kommentar zieht
   nach.

---

## Befund, benannt statt versteckt (§8)

**@390 bricht die Funktionszeile beim Nachladen um — aber nicht wegen D40.**

Messung mit angehaltenem Historie-Shard, danach freigegeben:

| Erlass | @1440 | @390 |
|---|---|---|
| BGBM | 0 verschobene Artikel, CLS 0.00000 | art-2 2041→2073, Seite +64 px, CLS 0.00000 |
| ZPO | 0, CLS 0.00000 | 0 |
| OR | 0, CLS 0.00000 | 0 |
| StPO | 0, CLS 0.00000 | 0 |
| ZGB | 0, CLS 0.00000 | 0 |

Gegenprobe auf **demselben Stand**, diesmal mit angehaltener **Zähl-Datei**
statt Historie-Shard — also ohne jede D40-Beteiligung:

| Erlass @390 | Verschiebung |
|---|---|
| BGBM | art-2 2041→2073, Seite +64 px |
| ZPO | art-2 1495→1529, Seite +70 px |
| StPO | art-4 2605→2707, Seite +102 px |

Der Umbruch ist also die Bauart der Funktionszeile seit D35-F1 (die Marken
«Entscheide»/«Materialien» kommen aus derselben Leerlauf-Runde) und ein
eigener, älterer Befund — D40 fügt ihm nichts hinzu. CLS bleibt in allen
Fällen 0.00000, weil die betroffenen Stellen below-fold liegen; das
Lighthouse-Tor misst OR-CLS 0.000067 (Schranke 0.05).

---

## Rot-Probe (§6.7)

Neue Sonde `e2e/w224-d40-fassung.e2e.ts` (Shard-Gruppe 5), fünf Zusagen.
Sechs Mutationen, je einzeln gefahren, jede über einen eigenen Build:

| # | Mutation | Wirkung |
|---|---|---|
| M1 | `anzahl: 0` in `bezuegeFuss` (Rubrik fällt weg) | (a)(b)(c)(d)(e) rot — «element(s) not found» |
| M2 | `anzahl: historie ? 1 : 0` | (a) rot: `ol > li` erwartet 1, gefunden 7 |
| M3 | `useState({ f: true })` (offen beim Laden) | (a)–(e) rot |
| M4 | die vier `data-fuss-aus*="f"`-Zeilen gelöscht | (c) rot |
| M5 | die `data-vermerke`-Zeilen für `[data-reg="f"]`/`[data-hist-druck]` gelöscht | (d) rot + `hist-ansicht-w25i` (3 Fälle) + `leser-optionen` rot |
| M6 | `flex-basis: 100%` an der f-Marke (Zeile bricht um) | (e) rot «art-6 verschoben: 3514 → 3548» + `gesetze-historie-badge` «Artikel 2 verschoben: 1540 → 1574» |

Verworfene Mutation, protokolliert: `max-width: 300px` an `.lr7-bez-zeile`
liess (e) **grün** — bei 300 px wickelt die Zeile schon vor dem Einwuchs, und
die Marke fand Platz in einer bestehenden Zeile. Die Mutation traf den
Prüfgegenstand nicht; M6 ersetzt sie.

---

## Deklarierte Sonden-Änderungen (§6.3)

Neu: `e2e/w224-d40-fassung.e2e.ts` · `e2e/helpers/fassungsRubrik.ts` (EIN Ort
weiss, wo die Auskunft steht — sonst stünde derselbe Griff in sechs Specs).

Nachgezogen, jede mit Begründung an der Stelle: `gesetze-historie-badge`
(Badge/Timeline/Einwuchs am neuen Ort; Einwuchs-Fall misst jetzt die Marke) ·
`hist-ansicht-w25i` (Fassungs-Spur = Marke; DOM-Vollständigkeit an der
Druck-Projektion) · `w224-d35-f3-vermerke` · `leser-optionen` (Wirkung an der
Marke, sechs Schalter) · `leser-v3-umschalten` (sechs Schalter) ·
`leser-lesemass` (`beiwerkSichtbar` zählt die Marke) ·
`src/tests/leser-optionen-migration.test.ts` und
`src/tests/leser-schriftskala.test.ts` (sechste Rubrik + vier neue
Migrations-Fälle).

---

## Tore

| Tor | Ergebnis |
|---|---|
| `npm run golden:vergleich` | IDENTISCH — 256 Fälle byte-gleich |
| `npm run check:golden-normtext` | OK — 60 257 Knoten, 0 Waisen |
| `npm run test` | 461/461 Dateien, 7470 Tests grün |
| `npx tsc -b` | grün |
| `npm run lint` | 0 Fehler (1 Bestands-Warnung `useUniversalSuche`) |
| `npm run check:schlankheit` | GRÜN — 1492 Dateien, keine Neuzugänge |
| `npm run check:e2e-shards` | grün — 152 Specs, 8 Gruppen deckungsgleich |
| `PERF_RUNS=1 npm run check:perf-lighthouse` | GRÜN — OR CLS 0.000 (0.000067), Score 40, Startseite CLS 0.000 |
| Playwright, 14 betroffene Specs, `--repeat-each=2 --workers=2` | 194/194 grün (5.2 min) |

---

## Bilder

| Datei | Was |
|---|---|
| `d40-1440-hell-zu.jpg` | @1440 hell, ZPO Art. 198 — Rubrik zu: «7 Fassungen › · Bezüge · 11 Entscheide › · 6 Verweise ›» |
| `d40-1440-hell-auf.jpg` | @1440 hell — Rubrik auf, «● Fassung │ Gilt seit 01.01.2025» + sieben Ereignisse mit AS-/BBl-Fundstellen |
| `d40-1440-dunkel-auf.jpg` | @1440 dunkel, gleiche Stelle |
| `d40-390-hell.jpg` | @390 hell — Rubrik auf; die Zeile bleibt einzeilig |
