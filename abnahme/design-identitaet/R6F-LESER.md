# R6F · Leser-Fixer F — CLS-Wurzel und §6.6-Split — Bau-Protokoll

**Bau** 7.9.2026 · Worktree `w2-24-lf`, Branch `feat/w2-24-leser-f`, Basis `018b41a37`
**Auftrag** (1) CLS-Wurzel hinter `e2e/leser-r1-r2.e2e.ts` A9-DoD, belegt von CI-Fixer E · (2) `check:schlankheit` rot an `parts/ArtikelLeser.tsx`
**Massstab** Alle Zahlen GEMESSEN am gebauten `dist/`, `vite preview :4410`, Chromium headless.

---

## 1 · Die Such-Zone wuchs 200 ms nach dem Tastendruck

### Reproduktion auf DIESEM Stand (nicht übernommen, neu gemessen)

CI-Fixer E hatte den Defekt am 7.9.2026 auf einem Vorstand belegt. Weil seither
D32/N4 die Such-Zone in die Kopfzeile verlegt haben
(`--leser-v3-kopf-block-h = max(kopf, such)`), war die erste Frage, ob der Befund
überhaupt noch gilt. Er gilt — unverändert:

| | `--leser-v3-such-h` | klebender Kopf | CLS | Quelle |
|---|---|---|---|---|
| vor dem Tippen | `2.75rem` | 93 px | — | — |
| nach dem Tippen | `4.25rem` | 117 px | **0.019140** | `DIV.relative min-w-0` |

Bedingung: `/gesetze/bund/BV` @390, CPU-Drossel **20×**, Geste
`pressSequentially('Kanton', 60 ms)` — dieselbe Geste wie die A9-DoD-Sonde,
`hadRecentInput = false`, fremd 0. Der Wert ist bit-nah am CI-Befund
(Lauf 34066539241, Shard 7, Drossel 6×: CLS 0.019140, dieselbe Quelle) — also
derselbe Vorgang und kein Rauschen.

**N4 hat den Befund nicht verschoben:** @390 gibt es keine linke Spur
(`bild.spurVersatzRem === 0`), also kein `suchInZeile`; die Zone steht dort
weiterhin als ZWEITE Reihe, und der Block misst die Summe. Gegenprobe @1440 mit
stehender Gliederung: die Zone bleibt auf Ruhehöhe (`zoneHoch` trägt
`&& !zweiSpalten`, die Zähler-Zeile steht dann in der Spalte) — dort springt
nichts, weder vorher noch nachher.

### Wurzel

`sucheAktiv` hängt am ENTPRELLTEN Suchwert (`v3/leserV3Modell.ts` ←
`inhalt-zustand.tsx`, 200 ms), und erst er schaltete die Zonenhöhe. Auf schneller
CPU verfällt die Entprellung NACH dem letzten Tastendruck, der Sprung fällt ins
500-ms-Eingabefenster und ist per CLS-Definition ausgeschlossen. Auf langsamer CPU
dauert EIN Tastendruck länger als 200 ms — die Entprellung feuert mitten im
Tippen, in einer Lücke, in der das Fenster längst abgelaufen ist. Der Browser
verbucht den Sprung zu Recht als eingabefrei; ein Leser auf einem schwachen
Telefon sieht ihn.

### Fix (Weg (ii) des Delegationsmandats, nicht Weg (i))

| Datei | Zeile | Änderung |
|---|---|---|
| `src/pages/gesetz-leser/v3/leserGeometrie.ts` | 96–128 | `LeserGeometrieLage.sucheAktiv` heisst **`zoneHoch`** — eine Geometrie-Frage («ist die Zone hoch?»), keine Datenlage-Frage; Herleitung und Messreihe stehen dort |
| `src/pages/gesetz-leser/v3/leserGeometrie.ts` | 152, 162 | `--leser-v3-such-h` liest `zoneHoch` |
| `src/pages/gesetz-leser/v3/LeserRahmenV3.tsx` | 288–289 | `zoneHoch: m.suche.trim() !== '' && !zweiSpalten` — der ROHE Feldwert |

Die Höhe wächst damit in DERSELBEN Eingabe-Aufgabe wie der Tastendruck.
`.trim()` ist nicht kosmetisch: ohne ihn stellte ein reines Leerzeichen die Zone
dauerhaft hoch, ohne dass je eine Zähler-Zeile käme.

**Der INHALT der Zone bleibt am entprellten Wert** (`suchZoneAufbau`,
`sucheAktiv: m.sucheAktiv`). Preis, offengelegt (§8): zwischen erstem Zeichen und
Entprellung steht die Zone bis zu 200 ms hoch, aber ohne Zähler-Zeile —
reservierter Platz statt geratener Zahlen. Eine sofort mitgerenderte Zeile müsste
«0 Artikel · 0 Fundstellen» behaupten, solange die entprellten Treffer fehlen.
Weg (i) — 24 px dauerhaft reservieren — bleibt verworfen (kostet jedem Leser
@390 Lesehöhe; so schon am 18.8.2026 entschieden).

**Beleg nach dem Fix**, gleiche Geste, gleiche Drossel 20×: **CLS 0**, fremd 0.
**Rot zu bekommen (§6.7):** in `LeserRahmenV3.tsx` wieder `m.sucheAktiv`
einsetzen ⇒ CLS 0.01914.

### Nachzug: kein neues Modellfeld

Der erste Bau exportierte `sucheFeldLeer` im `LeserV3Modell`. Das ist am Deckel
gescheitert, und die Sonde hatte recht: `src/tests/leser-v3-fundament.test.ts`
hält zwei Zusagen, die zusammen **keine Zeile** freilassen — keine Datei in `v3/`
über 420 Zeilen (`leserV3Modell.ts` lag exakt auf 420) UND der Adapter ist der
GRÖSSTE Baustein (`LeserRahmenV3.tsx` lag auf 419, also eine Zeile Luft). Beide
sind rot geworden, in dieser Reihenfolge. Die 420 sind am 16.8.2026 mit
Begründung von 400 gehoben worden, «und keinen Schritt weiter» — eine Sonde
anzuheben, um Platz für ein Feld zu schaffen, wäre §6.3 gewesen. Der Rahmen liest
darum den Rohwert, den das Modell ohnehin führt; `leserV3Modell.ts` ist
byte-gleich zum Basisstand.

### Bilder (hell/dunkel, @1440 und @390, Ruhe und beim Tippen)

`r6f-kopf-{1440,390}-{hell,dunkel}-{ruhe,tippen}-{vorher,nachher}.jpg` (16 Stück).
Aufnahme: `/gesetze/bund/BV`, `[data-v3-kopf]`, Drossel 20×, ein Tastendruck,
80 ms Wartezeit.

**Alle acht vorher/nachher-Paare sind BYTE-GLEICH** (`cmp`), und das ist der
Befund, nicht ein Mangel der Aufnahme: der Fix ändert **keine Gestalt**, nur den
ZEITPUNKT, zu dem die vorhandene Höhe umschaltet. Ein Standbild kann diese
200-ms-Lücke nicht einfangen — gemessen: unter 20× Drossel dauert schon ein
einzelnes `press()` länger als das Fenster, der Kopf steht auf beiden Ständen
zum Auslösezeitpunkt bereits auf 117 px. Der Unterschied ist eine Messung
(0.019140 → 0), kein Bild. Was die Bilder zeigen und wofür sie da sind: dass die
Kopfzeile in beiden Themen und auf beiden Breiten unverändert aussieht — @1440
57 px (Ruhehöhe, Zone in der Zeile), @390 44 → 68 px (zwei Reihen).

---

## 2 · §6.6-Split `parts/ArtikelLeser.tsx` (866 → 739 Z.)

`check:schlankheit` war ROT: «NEU über der Schwelle — 866 Z. (Schwelle 800)».
Geteilt statt in die Baseline gehoben.

| Neue Datei | Z. | Inhalt | Warum ein Bauteil |
|---|---|---|---|
| `parts/ArtikelLeser.kopfteile.tsx` | 97 | `RandTitel`, `HistSlot` | Beide Satzspiegel-Formen zeigen DASSELBE Markup an ZWEI Orten (Zeilenform `lr-rand` / Beiwerk, Breitform `lr7-kopf-titel` / `lr7-fassung`) |
| `parts/ArtikelLeser.bezuegeZone.tsx` | 165 | `ArtikelBezuegeZone` (Marken-Rechnung + die vier Rubriken Entscheide · Materialien · Verweise · Rechnen) | Nur die Breitform zeigt ihn; eigener Aufhänger (`kopfForm`), eigene Quelle (`bezuegeImKopf`), eigene Zusage (`e2e/leser-bezuege-inhalt-d30.e2e.ts`) |

Die Rechtsprechungs-Zeile der ZEILENFORM bleibt bewusst in der Hauptdatei — nie
beide Orte zugleich (§5).

**Verhaltensneutralität, gemessen:**

| Tor | Ergebnis |
|---|---|
| `npm run golden:vergleich` | IDENTISCH — 256 Fälle byte-gleich |
| `npm run check:golden-normtext` | OK — 60257 Snapshot-Knoten, 0 Waisen |
| `npm run test` | 459 Dateien, 7443 Tests, 2 skipped — grün |
| `npx tsc -b` · `npm run lint` | grün (1 Bestands-Warnung in `useUniversalSuche.ts`) |
| `npm run check:schlankheit` | GRÜN — 1482 Dateien, **kein neuer Baseline-Eintrag** |
| `npm run check:zyklen` · `check:e2e-shards` | grün |

**Eine Stelle ist nicht rein mechanisch** und darum benannt: die Breitform fragte
`kopfForm && (randTitel || …)`, also «ist der Randtitel-Wert nicht null?». Als
Bauteil ist er immer ein Element — die Frage wäre still zu `true` geworden. Sie
läuft jetzt über `randInhalt`, das die Zeilenform für ihren Registerfarben-Strich
ohnehin bildet und das mit der Null-Bedingung von `RandTitel` wertgleich ist.
Das Prädikat bleibt in der Hauptdatei: neben Komponenten exportiert, brach es
`react-refresh/only-export-components` (einmal rot gesehen).

**Pfadregister nachgezogen** (eigener `test(`-Commit — ein `refactor(`-Commit
darf keine Testdatei anfassen, `check:testtreue`): ein Split, der Markup aus
einer bewachten Datei in eine unbewachte trägt, nimmt Torabdeckung mit, lautlos.
`leser-benennung.test.ts` (GETEILTE_BAUSTEINE, beide Dateien) und
`leser-typo-tokens.test.ts` (WORTLAUT_DATEIEN, nur `kopfteile` — die Bezüge-Zone
ist Referenzschicht, kein Wortlaut). Rot gesehen: mit « – Probe» hinter dem
Randtitel wird «Ä117: kein Halbgeviert mit Spatien» rot und nennt
`parts/ArtikelLeser.kopfteile.tsx`.

---

## 3 · `e2e/leser-links-p3.e2e.ts` war rot — Wurzel gefunden, Sonde gerichtet

Rot in 3 von 3 Wiederholungen, und rot schon vor dieser Bau-Einheit (gemeldet auf
`a60dd7f75`, hier auf `018b41a37` unverändert reproduziert). Fehlermeldung: «die
Links der Bezüge-Zeile stehen wieder ohne Unterstrich» (`:82`).

**Gemessen** (`/gesetze/bund/OR#art-336_c` @1440, Bezüge-Zeile aufgeklappt):
9 Links in `.lr7-bez`, davon 8 im Block `data-reg="r"` mit
`class="lc-chip lc-chip-entscheid num no-underline"` («BGE 152 III 23★» …),
`text-decoration-line: none`. Der Fall griff mit
`querySelector('#art-336_c .lr7-bez a[href]')` den ERSTEN Link — und das ist seit
D30 (Entscheide als Chips, Blockfolge r·m·g·w) ein **Chip**.

**Das Produkt ist in Ordnung.** Chips sind die im Kopf jener Datei ausdrücklich
erklärte Ausnahme: ihre Affordanz ist die Kante, nicht die Farbe (WCAG 1.4.1
verlangt ein nicht-farbliches Merkmal, keinen Unterstrich im Besonderen).
Hälfte (b) verlangte damit genau das, was Hälfte (a) im selben Atemzug erlässt —
der Fall widersprach sich selbst. Der einzige echte TEXTLINK der Zone, der
Rechnen-Eintrag «Kündigung & Fristen im Arbeitsverhältnis» (`data-reg="w"`),
trägt seinen Strich (`underline`).

**Fix:** (b) wendet jetzt denselben Ausschluss an wie (a) und misst den ersten
Textlink. Keine Lockerung — der Leer-Treffer-Schutz wird SCHÄRFER: bleibt die
Zone ganz ohne Textlink, ist `bezugDa` rot («nur Chips?»).
**Rot gesehen (§6.7):** `.lc-leser :where(a[href])` aus dem `index.css`-Block
«TEXTLINKS IM LESER» entfernt und neu gebaut — der Fall reisst mit 12 nackten
Links, darunter genau die Rechnen-Textlinks («Verzugszins», «Mahnung &
Inverzugsetzung», «Verjährung»), an denen (b) jetzt hängt. Danach zurückgenommen.

Der Befund vom 6.9.2026 im Kopf jener Datei bleibt wörtlich stehen — er
beschreibt den damaligen Stand richtig (§0 Ziff. 2b); der neue Absatz ergänzt
ihn, statt ihn nachzuführen.

---

## Schlusslauf

```
npx playwright test e2e/leser-r1-r2.e2e.ts e2e/w224-leser-d32-d33.e2e.ts \
  e2e/leser-v3-kontext-cls.e2e.ts e2e/leser-links-p3.e2e.ts \
  --repeat-each=3 --workers=2
→ 63 passed (4.6m)
```

Darin grün: A9-DoD (CLS 0 unter Drossel 6×), kontext-cls (a) @1440 und (b) @390,
D32 (a)–(d), N4 (e), D33 (f)/(i), N1 (k), P3.

## Offen

- Die Zone steht bis zu 200 ms hoch, ohne die Zähler-Zeile zu zeigen. Bewusst so
  (siehe oben); wollte David stattdessen sofort Zahlen sehen, bräuchte es eine
  nicht entprellte Trefferzählung — ein eigener Schritt mit Perf-Budget (§15).
- Die Screens belegen visuelle Neutralität, nicht die Zeitachse. Wer den Sprung
  SEHEN will, braucht eine Videoaufnahme unter Drossel — hier bewusst nicht
  gebaut, weil die Messung (CLS) die schärfere Zusage ist.
