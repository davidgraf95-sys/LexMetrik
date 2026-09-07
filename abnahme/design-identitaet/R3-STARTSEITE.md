# R3 «Startseite als Inhaltsverzeichnis + Sprach-Diät» — Bau-Protokoll

**Erhoben:** 6.9.2026, aus dem Worktree-Preview (`vite preview --port 4333`,
gebautes `dist/`), Chromium. Alle Zahlen gemessen, nicht geschätzt (§7).
**Massstab:** `abnahme/design-identitaet/vorschlag-freigegeben.html`, Seite
«Startseite». **Vorlauf:** R1 (Tokens), R2 (Rahmen) unverändert.

## 1 · Was gebaut ist

| Referenzbild | Umsetzung |
|---|---|
| Satzspiegel, Marginalienspalte 150 px + 36 px Rinne | `components/start/Satzspiegel.tsx` (`StartZeile`) — je Modul zwei Grid-Kinder; `pages/Startseite.tsx` trägt nur noch das Raster |
| Marginalie fällt im Pane in eine Zeile | `@3xl/pane` (48 rem) im Pane · `lg` im Vollfenster, über `usePaneKlasse` (FAHRPLAN §6 (c)) |
| Begrüssung kursiv + eine grosse Suchzeile mit Unterstrich | `start/Hero.tsx` + `.st-frage` (src/index.css, additiv) — Kasten und Brass-Wash weg |
| Systematische Ordnung, zweispaltig, mit Nummern und Zählern | `start/SystematikListe.tsx` — **echte Daten**, s. §3 |
| Kantone als Register-Raster mit Zahlen | `start/KantoneRaster.tsx` (`kantonErlassZahlen`) |
| Jüngste Entscheide als Liste Datum · Zitierung · Regeste | `start/EntscheideListe.tsx` (vormals `NewsHeader`) |
| Materialien nach Behörde als Liste | `start/MaterialienListe.tsx` — Zahlen aus dem Zähler-Generat |
| Frist als Ein-Zeilen-Formular | `start/Werkzeuge.tsx` mit `EinfacheFristForm variante="zeile"` (echte Engine) |
| Schluss mit den zwei Sätzen | `start/VertrauensFuss.tsx`, spannt beide Spalten |
| Kacheln entfallen | `RubrikKacheln.tsx`, `GesetzeBlock.tsx`, `GesetzeChips.tsx`, `NewsHeader.tsx` gelöscht |

**Nichts Erarbeitetes ist verloren** (Auflage David 6.9.2026): Begrüssungs-Pool,
Beispiel-Verweise, Suche mit Treffer-Panel (`role=search` + `input[type=search]`,
a11y-E2E grün), «Zuletzt geöffnet», Ein-Zeilen-Frist mit echter Engine,
Entscheid-Daten, Zähler und KorpusStand stehen alle noch — in anderer Form.

## 2 · Registerfarben, damit es nicht trist wirkt (David 6.9.2026)

Randstrich je Zeile in `--reg-g/-r/-m/-w`, Zähler-Akzent am Zeilenende in
derselben Farbe, Hover jedes Eintrags in seiner Domänenfarbe, Begrüssung in
kursiver Literata. Kontrast: die Register-auf-Papier-Paare sind in
`KONTRAST-R1.md` gemessen (hell 4.88–11.10:1); `reg-w` auf `well` (4.43:1, unter
AA) kommt hier nicht vor.

## 3 · Datenquelle der Systematik — echt, nicht Fallback

Das Referenzbild sagt in seiner eigenen Fussnote, seine Systematik-Zahlen seien
**Beispielwerte**. Ausgeliefert wird so etwas nie (§8). Gebaut ist der Verschnitt
der vorhandenen Anzeige-Ordnung `lib/normtext/systematik.ts` (dieselben
Kategorien und Anker `#sys-<id>`, die `/gesetze?ebene=bund` gliedern) mit dem
Erlass-Register — buildseitig in `gen:zaehler`, Drift-Tor `check:zaehler`.
Gemessen 6.9.2026:

| Nr | Kategorie | Volltext |
|---|---|---|
| 01 | Staats- und Verfassungsrecht | 9 |
| 02 | Privatrecht | 32 |
| 03 | Zivilprozess- und Zwangsvollstreckungsrecht | 6 |
| 04 | Strafrecht und Strafverfahren | 14 |
| 05 | Verwaltungsrecht | 139 |
| — | Internationales Recht (eigene Säule seit IA-6) | 27 |
| | **Summe** | **227 = `gesetzeBundVolltext`** |

Kein Rest, keine erfundene Zahl. Ebenso neu im Generat: `materialienBehoerden`
(je Behörde, Reihenfolge `BEHOERDEN`-rang, Behörden ohne Eintrag fehlen).
Weder `systematik.ts` noch `materialien/register.ts` landen im Startseiten-Chunk
(§15) — `check:perf-budget` entry gzip **58.5 KB** (Budget 60.0 KB).

**Rot-Beweis `check:zaehler`** (§6.7, neue Felder): `"anzahl": 32` → `33`
gefälscht ⇒ Exit 1 («… ist VERALTET gegenüber den Registern»); zurückgesetzt ⇒ grün.

## 4 · Sprach-Diät (§6 (h))

Getilgt, weil Nutzenversprechen statt Bezeichnung: **`HERO_TITEL`** («Schweizer
Recht an einem Ort») und **`HERO_SUBLINE`** («… miteinander verzahnt …»). An
ihrer Stelle `SAMMLUNG_TITEL` = «Sammlung» (die eine H1) und `SAMMLUNG_BESTAND`
= «Gesetze, Entscheide, Materialien, Rechner, Vorlagen.». SEO-Träger nur
**gekürzt**, nicht getilgt, und `index.html` gespiegelt (`check:seo-index` grün):

* `SITE_TITEL` → «LexMetrik — Schweizer Gesetze, Rechtsprechung, Materialien, Rechner»
* `SITE_DESCRIPTION`/`SITE_OG_DESCRIPTION` ohne «an einem Ort» / «miteinander verzahnt»

Unverändert **wörtlich** (§8, Ehrlichkeitstexte werden nie gestrafft):
`VERTRAUENS_SATZ`, `STATUS_SATZ`, der Pflichthinweis «keine Rechtsberatung», der
Zähler-Scope («im Volltext» / «erfasst») und der Titel «Jüngste Entscheide im
Korpus» (das Referenzbild schreibt «in der Sammlung» — «im Korpus» trägt die
Scope-Aussage und bleibt).

Die zwölf `STATISCHE_SEITEN`-Beschreibungen sind **nicht** angefasst: sie sind
reine SEO-Träger und nirgends sichtbar; die Diät gilt dem sichtbaren Text.

## 5 · H1 — was der Wächter verlangt

`e2e/a11y.e2e.ts` prüft `h1` auf **Sichtbarkeit**; eine `sr-only`-H1 wäre dort
rot. Die H1 steht darum sichtbar als Titelblatt-Wort «Sammlung» in der
Marginalie der ersten Zeile. `src/tests/seitenTitel.test.tsx` führt
`components/start/Hero.tsx` weiterhin als die eine begründete Ausnahme.
Gemessen: **genau eine** `<h1>` auf «/» (im Pane je eine pro Fenster — das ist
die Pane-Eigenschaft, nicht die Seite).

## 6 · Messreihe (Preview, gebautes dist/)

| Messung | Wert |
|---|---|
| `scrollWidth` @390 hell **und** dunkel, «/» | **390 = clientWidth** (keine waagrechte Achse) |
| `scrollWidth` @1440 hell/dunkel, «/» und «/» als rechtes Pane | **1440 = clientWidth** in allen vier Fällen |
| `<h1>` auf «/» | 1 («Sammlung»), sichtbar |
| `<section aria-labelledby>` auf «/» | 5 (Systematik · Kantone · Entscheide · Materialien · Frist) |
| Satzspiegel im Pane `/gesetze/bund/OR?p=/` @1440 | einspaltig, Marginalie als Zeile über dem Inhalt (Pane ~700 px < 48 rem) |
| Suchzeile: 32 px Literata füllen die Textspalte bei ~890 px nicht | Stufe gestaffelt `text-h3 → lg:text-h2 → xl:text-h1` (im Pane `@3xl/@5xl`) |
| Entscheid-Zitierung «BGer 1C_733/2025 vom 17. Juni 2026» | ~250 px ⇒ Spalte 16 rem statt 9.5 rem; die Zitierung wird NICHT gekürzt (§8) |
| `check:perf-budget` entry | 58.5 KB gzip (Budget 60.0) |

## 7 · Nachweis-Aufnahmen

`r3-1440-{hell,dunkel}-start.jpg` · `r3-1440-{hell,dunkel}-start-fuss.jpg`
(Werkzeuge + Schluss) · `r3-1440-{hell,dunkel}-pane.jpg` (`/gesetze/bund/OR?p=/`)
· `r3-390-{hell,dunkel}-start.jpg`. Alle ≤ 1400 px, JPEG q70.

## 8 · Nicht gebaut, mit Grund (§8 statt stiller Lücke)

* **Unterstrich-Felder im Fristen-Formular.** Das Referenzbild zeichnet
  «Ereignis / Frist in Tagen / Kanton» als Felder mit blosser Grundlinie. Gebaut
  ist die ECHTE `EinfacheFristForm variante="zeile"` mit ihren `lc-input`-Kästen:
  sie liegt in `src/components/forms/**` (ausserhalb der R3-Whitelist) und wird
  vom Voll-Rechner `/rechner/tagerechner` mitbenutzt — ihre Feld-Anatomie zu
  ändern ist ein app-weiter Eingriff und gehört in den R5-Sweep (Karten/Chips/
  Felder), nicht in die Startseite.
* **Titel «Jüngste Entscheide in der Sammlung».** Siehe §4 — der §8-Wortlaut
  «im Korpus» bleibt.
* **Systematik-Nummern 1…9/0 wie in der SR.** Gezeigt werden die Nummern der
  App-eigenen Ordnung (01…05); eine zweite Nummerierung wäre eine zweite
  Wahrheit neben `/gesetze` (§5).

## 9 · Zwei rote Wächter, die dieser Lauf gefunden und behoben hat (§17)

Beide waren **vor** R3 rot und stammen aus R1 bzw. R2 — sie sind hier
mitgezogen, nicht umschifft:

* **`src/tests/design-r5-konsistenz.test.ts` (R1-Rest).** Der Fall verlangte
  `.num { font-family: var(--font-mono) … }`; der R1-Nachzug-Commit `0aa7e3244`
  hat die Mono-Familie aus `.num` genommen (Wörter in `.num`-Zeilen liefen als
  Schreibmaschine) und den Wächter rot zurückgelassen. Der Fall prüft jetzt
  dieselbe Sache — `.num` und `.lc-ziffern` getrennt geführt — ohne die Familie.
* **`e2e/topbar-kein-ueberlauf-320.e2e.ts` (R2-Rest).** Die Wärme-Vorbedingung
  hing am ☰-Trigger «Alle geöffneten Reiter» IN `header.sticky`; R2 hat ihn
  dort ersatzlos durch die sichtbare Arbeitsleiste ersetzt. Der Ausdruck fand ab
  R2 nie mehr etwas → drei Fälle rot, ohne dass am gemessenen Streifen etwas
  fehlte. Neu wird die Wärme an der Arbeitsleiste nachgewiesen
  (`nav[aria-label="Offene Reiter"] [data-reiter-streifen] button`); die Messung
  selbst ist unverändert. Gemessen dabei: `aria-current="page"` taugt als Sonde
  NICHT — Übersichts- und Startseite legen keinen eigenen Reiter an.

## 10 · Deklarierte Test-Anpassungen (§6.3)

`katalog.test.tsx` (Startseiten-Anatomie + Sprach-Diät) · `design-r2c-bausteine`
(C-5 hat nur noch EINE Kachel-Fläche; §8-Zähler-Wortlaut an seinem neuen Ort) ·
`scroll-rand-b8` (beide Startseiten-Streifen sind fort — ein Wächter für einen
Scrollstand, den es nicht gibt, prüft nichts) · `zuletztVerwendetChips`
(Textzeile statt Chip-Streifen; dieselbe @390-Invariante) · `design-r5-konsistenz`
und `e2e/topbar-kein-ueberlauf-320` (§9) · `e2e/uinav-j-rechtsprechung` J4
(Kartenstreifen → Liste; Datum-Dedupe unverändert geprüft, Gebiet über
`data-gebiet`).

## 11 · Whitelist-Überschreitungen (je eine Zeile Begründung)

* `src/components/layout/Footer.tsx` — konsumierte `HERO_TITEL`; ohne Nachzug
  bricht der Bau, und der Slogan stünde weiter auf jeder Seite.
* `scripts/og-bild.ts` — konsumierte `HERO_SUBLINE`; Tagline läuft jetzt auf
  `SITE_DESCRIPTION` (die Card ist eine reine Spiegelung von seo.ts).
* `src/tests/design-r5-konsistenz.test.ts` · `e2e/topbar-kein-ueberlauf-320.e2e.ts`
  — rote Fremd-Wächter aus R1/R2 (§9, §17: an der Wurzel statt umschifft).

## 12 · Offene Punkte für R5

1. `.lc-input` trägt in der Fristen-Zeile noch die gefüllte Kasten-Optik —
   Unterstrich-Felder app-weit (§8 oben).
2. Der `ErgebnisBlock` der Frist-Zeile ist noch eine `lc-notice`-Fläche mit
   Balken; im Satzspiegel wäre eine reine Ergebniszeile stimmiger.
3. `rounded-full` und `shadow-*` an nicht-schwebenden Flächen (R5-Auftrag)
   berühren die Startseite nicht mehr — die Restbestände liegen in den
   Übersichten.
4. `min-h-modul-news` (12.5 rem) ist für den alten KARTEN-Streifen bemessen;
   die Liste ist ähnlich hoch, der Token gehört aber neu vermessen
   (`tailwind.config.js` war in R3 TABU).
