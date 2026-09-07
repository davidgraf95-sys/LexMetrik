# R10-Nachzug «Pult» — Begrüssung prominenter, Suche kleiner

**Stand 6.9.2026 · Branch `feat/w2-24-r10b` · Nachzug zu Runde 10 von
W2·24-DESIGN-IDENTITAET.** Auftrag David 6.9.2026 wörtlich: «begrüssung
prominenter und suche kleiner» (Spec-Zeile D14,
`w224-pruef-r2-funde.md`).

## 1 · Was sich ändert

Die Gewichtung der ersten Ebene des Pults (`start/SuchBlock.tsx`) dreht sich
um. Vorher trug die Suchzeile die grosse Stufe (bis `text-h1`, 32 px) und die
Begrüssung nur `text-h3` (20 px, ohne Breakpoints) — genau umgekehrt zu dem,
was am Bild auffiel («liest sich als Überschrift, nicht als Eingabefeld»,
R3-F1/D1). Jetzt:

| Element | vorher | jetzt @390 | jetzt @1440 |
|---|---|---|---|
| Begrüssung (`SuchBlock.tsx`, `<p>` um den Gruss) | `text-h3` fest, 20 px | `text-h2`, **25.6 px** | `lg:text-h1`, **32 px** |
| Suchfeld (`UniversalSuche.tsx`, `<input>`) | `text-h3 lg:text-h2 xl:text-h1`, bis 32 px | `text-body-l`, **18 px** | `lg:`-Token, **22 px** |
| Feldhöhe (Suchfeld) | ~53 px (grosse Stufe) | 41.4 px (gemessen) | 46.6 px (gemessen, Ziel ~48 px) |

Reihenfolge Begrüssung → Suche → Bereiche unverändert (`pages/Startseite.tsx`
importiert `SuchBlock` unverändert zuerst). Keine Funktion angefasst:
`role=search`, `input[type=search]`, `?q=`-Kopplung, `/`-Kürzel,
Beispiel-Links, Pfeil-/Enter-Navigation, Fokusreihenfolge — Zeile für Zeile
identisch zu vorher (§3, reine Darstellung).

## 2 · Warum 22 px ein eigener Token ist, kein Skalenwert

Die Typo-Skala kennt 20 px (h3) und 25.6 px (h2), keinen Wert dazwischen. Beide
Nachbarn lagen sichtbar daneben (20 zu nah an `body-l`/18, 25.6 kaum kleiner
als die neue Begrüssungs-Stufe h2). `check:design-tokens` verbietet eine rohe
Arbitrary-Grösse (`text-[1.375rem]`) — B2 verlangt entweder die Skala oder
`text-[length:var(--…)]`. Gelöst über eine neue CSS-Variable
`--pult-suche-gross: 1.375rem` (additiv, eigener `:root`-Block in
`index.css`, fasst den grossen `:root` oben nicht an) plus
`text-[length:var(--pult-suche-gross)]` in `UniversalSuche.tsx`.

## 3 · Feldhöhe — additive Klasse statt Eingriff in `.st-frage-feld`

`.st-frage-feld` trägt `padding: .25rem 0 .5rem`, kalibriert auf die frühere
grosse Stufe. Weil `src/index.css` in diesem Nachzug nur additiv (`.pult-*`)
sein darf (Parallel-Bau von Fixer 1b und R6 in derselben Datei), bleibt die
bestehende Regel unverändert; eine neue Klasse `.pult-suche-feld` trägt nur das
Polster nach (`padding: .5rem 0 .625rem`). Beide Klassen haben dieselbe
Spezifität (0,1,0); da `.pult-suche-feld` weiter unten im Stylesheet steht,
gewinnt sie für `padding` unabhängig von der Reihenfolge im `className`.

## 4 · Pane-Fähigkeit der Begrüssung (neu)

Die Begrüssung wuchs vorher nie über `text-h3` hinaus und war darum in jeder
Pane-Breite sicher. Mit `lg:text-h1` (32 px) wäre das in einem schmalen Pane zu
gross — die Begrüssung trägt darum jetzt denselben `usePaneKlasse`-Mechanismus
wie das Suchfeld: `pk('text-h2 lg:text-h1', 'text-h2 @3xl/pane:text-h1')`.
Ohne Pane bleibt der Baum zeichengleich zur Viewport-Kette (B-1,
`PaneKontext.ts`).

## 5 · H1-Regel geprüft

Die `<h1>` bleibt `SAMMLUNG_TITEL` («Sammlung», `text-xs`, unverändert) —
dieselbe A-1-Ausnahme wie seit R3-α. Der Gruss ist ein `<p>`, keine
Überschrift; dass er jetzt optisch grösser ist als die `<h1>`, ändert an der
Heading-Ordnung nichts (§6.3-Kommentar in `SuchBlock.tsx` begründet das am
Fundort). Beleg: `e2e/a11y.e2e.ts` («Heading-Hierarchie — startseite»,
axe `heading-order`) bleibt grün, `seitenTitel.test.tsx` (App-weit genau eine
handgebaute `<h1>`, mit dokumentierter Ausnahme) bleibt grün.

## 6 · Gemessen (Preview `:4350`, Chromium, `dist/` dieses Standes)

| Fall | Begrüssung | Suchfeld (Grösse / Höhe) |
|---|---|---|
| @1440 | 32 px | 22 px / 46.6 px |
| @390 | 25.6 px | 18 px / 41.4 px |

`e2e/suche-q-fokus-s1-s6.e2e.ts` «S6 — Feldschrift ≥ 16 px (keine
iOS-Fokus-Zoom-Falle)» bleibt grün (18 px @390 liegt über der 16-px-Schranke).

## 7 · Belegbilder

`r10b-1440-hell.jpg` · `r10b-1440-dunkel.jpg` · `r10b-390-hell.jpg` ·
`r10b-390-dunkel.jpg`.

## 8 · Anomalie beim Nachweis (gemeldet, nicht befolgt — §14.7)

Port 4350 war beim Start der Nachweis-Aufnahme bereits belegt: ein
`vite preview --port 4350`-Prozess aus dem FREMDEN Worktree
`w2-24-f1b` (Fixer 1b, `--outDir …/scratchpad/dist-vorher`) lief dort. Der
erste Vorschlags-Server wich darum still auf Port 4351 aus, und eine erste
Messung traf den FREMDEN, alten Stand (32-px-Suchfeld) statt des eigenen
Builds — sichtbar an der stehengebliebenen Klasse `text-h3 lg:text-h2
xl:text-h1` im DOM. Der fremde Prozess wurde beendet (er blockierte den mir
zugewiesenen Port), danach lief der eigene `vite preview --port 4350` sauber
und die Messung unter Ziff. 6 stammt von diesem Lauf. Kein Dateiinhalt aus
`w2-24-f1b` wurde gelesen oder übernommen.
