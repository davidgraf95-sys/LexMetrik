# R5 · Fixer 1b — Lesekomfort und zentrale Reste

**Stand:** 6.9.2026 · Zweig `feat/w2-24-r5-f1b`, abgezweigt von `0c83e094e`
(Stand nach Fixer 1 + Fixer 2) · Runde W2·24-DESIGN-IDENTITAET.

Die Farb- und Schriftmessung steht vollständig in `KONTRAST-R1.md`, Nachtrag
**«D12 — Lesekomfort»**. Dieses Protokoll hält fest, was ausserhalb der
Token-Schicht gebaut wurde, und — genauso wichtig — was **nicht** gebaut wurde
und warum.

---

## 1 · D12 «Lesekomfort» → `KONTRAST-R1.md` §D12

Kurzfassung: warm getöntes Papier, Tinte von 17.65:1 auf 14.68:1 gedämpft
(Halation), Sekundärton von 8.56:1 auf 6.81:1, Ink- und Brass-Rampe auf EINEN
Hue (84.6°, Drift-Span 0.0°), Literata aufrecht mit `opsz`-Achse (+56.2 KB),
Lesetext-Gewicht 450. Alle 146 Pflichtpaare grün, kein AA-Verstoss, Registerfarben
auf dem neuen Papier neu gemessen (alle 16 Paare ≥ 4.65:1).

---

## 2 · Zentrale Reste — gebaut

### L3 · Der Griff spricht Grotesk

`.lc-leiste-griff` lief auf `var(--font-mono)`. Das war der **letzte
CSS-Konsument der Monospace-Familie ausserhalb des Rechenwegs** — und damit im
direkten Widerspruch zur Definition des Tokens zwölf Zeilen weiter oben
(«`--font-mono` trägt NUR noch, was fachlich Monospace braucht»). Eine
Griff-Beschriftung («Ansicht», «8 Entscheide») ist Bedienung, keine
Zahlenkolonne. → `var(--font-sans)`.

### L5 · Die Badge-Anatomie ist EINE, und sie ist eine Linie

Vorher zwei Anatomien für dieselbe Sache: `-ok`, `-massgeblich`, `-soft` mit
**Füllung**, `-entwurf` und `-geplant` mit **Umriss**. Die Umriss-Form war also
schon die Hausform; sie steht jetzt genau einmal, an `.lc-badge` selbst, und die
Varianten setzen nur noch die Farbe (`--badge-linie` + `color`).

**Grössenneutral, nicht «etwa gleich»:** die 1-px-Kante kommt hinzu, das
Innenmass geht um genau 1 px zurück (`padding: 2px 10px` → `1px 9px`). Die
äussere Box misst unverändert; es verschiebt sich keine Zeile.

**Was seine Füllung behält:** `-warn` und `-danger`. Dafür gilt dieselbe
datierte Regel wie für `.lc-notice` (U2): dort trägt die Farbe eine
**Bedeutung** (§13/F2 — Warnung/Gefahr), nicht eine Kante. Ein Sachvorbehalt,
der so leise wird wie ein Etikett, verliert genau das, was §8 von ihm verlangt.
Ebenso behält die **gesperrte** Auswahlkachel ihre `--well`-Fläche: dort IST die
Fläche der Zustand (LM-093, 4.9.2026).

Weiter verlieren ihre **Ruhe**-Füllung: `.lc-btn-mini` (`bg-surface`) und
`.lc-chip` (`bg-well`), samt der «erhabenen Fläche im Ruhezustand» der
Chip-Zeile (`--surface`). Alle drei lagen 2–5/255 gegen das Papier — keine
Fläche, sondern eine Behauptung; dasselbe Argument, mit dem U2 die
`.lc-notice`-Füllung gestrichen hat. **Hover- und Auswahl-Flächen bleiben:**
dort ist die Fläche eine Zustandsauskunft, keine Dauer-Anatomie (§G-j).

Kontrolle: `ink-700` auf `--paper` misst 10.93:1 hell / 9.07:1 dunkel gegen
10.27/9.68 auf dem weggefallenen `--well` — der Wegfall senkt den Kontrast an
keiner Stelle unter AA.

### Auswahl-Kacheln (`ui/SelectionGrid.tsx`, `.lc-wahl-kachel`/`.lc-wahl-pille`)

Kantig statt abgerundet (`border-radius: 0`; die Pille auf das Chip-Mass
`.125rem` — «Kanten statt Pille» ist seit R1-3 die Hausform). Haarlinie statt
Vollrahmen **plus** Füllung. Der gewählte Zustand ist neu ein **3-px-Strich in
der Registerfarbe «Werkzeuge»** plus ein **Häkchen** oben rechts.

* `--reg-w` ist nicht geraten: alle 36 Konsumenten des Bausteins sind Rechner
  oder Vorlagen-Assistenten (nachgezählt 6.9.2026).
* **Als Innenschatten gebaut, nicht als breitere Kante:** eine 3-px-Kante links
  verschöbe den Kachelinhalt beim Wählen um 2 px. Der Zustandswechsel darf den
  Satz nicht bewegen.
* **Platz für das Häkchen steht immer** (`pr-6`), nicht erst im gewählten
  Zustand — aus demselben Grund. Gemessen am ersten Bild lief das Zeichen sonst
  in die Titelzeile schmaler Kacheln («Einzelarbeitsvertrag»).
* **Häkchen als Pseudo-Element** (Vorbild `.lc-chip-selected::before`): es steht
  im Bild, nicht im Accessible Name; den Zustand trägt weiterhin `aria-pressed`.
* Kontrast `reg-w`: 5.21:1 hell / 9.56:1 dunkel auf `--paper`, 4.89/10.20 auf
  `--well` — als Nicht-Text-Strich (≥3) und als Häkchen-Text (≥4.5) überall
  erfüllt.
* Die **Bedeutungs-Töne** der Patientenverfügung (`zustimmung`/`ablehnung`/
  `vorbehalt`) behalten ihre Füllung (§1/§8) — dieselbe Grenze wie bei den
  Badges.

### R-1 · Unter 400 px wird umgebrochen, nicht geschoben

Die Scroll-Affordanz `lc-scrollrand-x` **war bereits vorhanden** (der Befund
ging insoweit ins Leere). Gemessen wurde trotzdem, und das ergab den echten
Fund — Playwright gegen den gebauten Stand, 6.9.2026:

| Route | Viewport | sichtbar | Inhalt | verborgen | Knöpfe |
|---|---|---:|---:|---:|---:|
| `/rechner/schkg-fristen` | 390 | 300 px | 1157 px | **857 px (74 %)** | 9 |
| `/rechner/kuendigung` | 390 | 348 px | 415 px | 67 px (16 %) | 3 |
| `/rechner/kuendigung` | 1440 | 415 px | 415 px | 0 | 3 |

Acht von neun Verfahrensphasen lagen ausserhalb des Bildes. Ein Schieber, der
drei Viertel seines Inhalts versteckt, ist keine Affordanz-Frage mehr, sondern
eine Auffindbarkeits-Frage. Unter 400 px bricht die Leiste darum um
(`max-[400px]:flex-wrap`, `h-auto`); `min-h-11` an den Knöpfen hält das
44-px-Fingermass, das die feste Container-Höhe im umgebrochenen Zustand nicht
mehr geben kann.

Nachgemessen: **0 px verborgen** auf beiden Routen @390, **unverändert** @1440.
Bildbeleg `r5f1b-schkg-390-hell.jpg`.

### Wurzel-Fix `scripts/datenhaltung/suche.test.ts` (§17)

Der 95-s-`beforeAll`-Deckel riss dreimal, ohne dass an der Datei etwas geändert
worden wäre. Vor der Zuschreibung steht die Messung (§0 Ziff. 3) — neu erhoben,
n=3, gleiche Bedingung «isoliert» wie die Reihe im Datei-Kommentar:
**16.10 · 16.18 · 14.50 s** (mittel 15.59, sd 0.94) gegen damals **10.85**.

**Die Ursache ist nicht die Parallel-Last, sondern der Korpus.** Die isolierte
Strecke ist seit der Deckel-Festlegung um **+44 %** gewachsen, ganz ohne fremde
Last; die Reserve war also längst aufgebraucht, bevor die erste Fremdlast den
Deckel riss. Ein absoluter Millisekunden-Deckel auf einer mitwachsenden
Ingest-Strecke veraltet von selbst.

Neue Höhe aus den vorhandenen Reihen fortgeschrieben: Lastfaktor 4.66×,
relative Streuung 18.7 %, QS-PERF Ziff. 5 → 113.4 s, plus Aufschlag für die
sechs parallelen Arbeitsbäume dieser Runde → **240 000 ms**. Im Kommentar steht
ausdrücklich, dass dieser Deckel eine **Robustheits**-Grenze ist und keine
Perf-Schranke: eine Wanduhr-Messung unter unbekannter Fremdlast misst die
Maschine, nicht die Ingest-Strecke. Keine Assertion, kein Prüfschritt berührt.

---

## 3 · Zentrale Reste — NICHT gebaut, mit Grund

### L6 · PaneKopf, Kurzform im primären Pane — **offen gelassen**

Der Auftrag sagt: «Entscheid David 17.8. ‹keine Doppelkrume› beachten …
begründen, wenn du es baust, sonst offenlassen.» Der Code trägt diesen Entscheid
wörtlich (`PaneKopf.tsx`, Regel A-2):

> «Trägt die Seite ihre Kopfzeile selbst, zeigt diese Leiste NICHTS von der
> Identität — sonst stünde derselbe Ort zweimal in zwei Zentimetern (§5, Ä45
> ‹Doppelkrume›).»

Das primäre Pane ist genau dieser Fall: `zeigeIdentitaet = !nurSteuerung`. Eine
Kurzform im Pane-Kopf stünde **30 px über** der Brotkrume der Seite selbst — das
ist buchstäblich «derselbe Ort zweimal in zwei Zentimetern». Der Gegenbefund
(F12) ist als **kosmetisch** eingestuft. Ein datierter Entscheid wird nicht von
einem kosmetischen Befund überstimmt; das gehört David vorgelegt.

**Was der Vorlage wert wäre:** im **Split** stehen zwei Panes nebeneinander und
nur eines trägt einen Namen. Die A-2-Begründung («derselbe Ort zweimal») greift
für das einzelne Pane, aber im Nebeneinander entsteht eine Asymmetrie, die A-2
nicht bedacht hat. Möglicher Kompromiss: die Kurzform **nur im Split** und
**nur**, wenn ein zweites Pane offen ist.

### V4 · Seitentitel mehrfach @390 — **gemessen, nicht gebaut**

Gemessen (Playwright, Blattknoten mit dem H1-Kern, `/rechner/kuendigung`):

| Viewport | Ort | y | Text |
|---|---|---:|---|
| 390 | Reiter der Arbeitsleiste | 70 | «Kündigung & Fristen im Arbeitsverhältnis» |
| 390 | Brotkrume | 108 | «Kündigung & Fristen im Arbeitsverhältnis» |
| 390 | H1 | 192 | «Kündigung & Fristen im Arbeitsverhältnis» |
| 1440 | dieselben drei | 70 / 138 / … | identisch |

**Der Befund ist bestätigt — dreifach, innerhalb von 122 px.** Zwei Korrekturen
am Auftragstext (§7):

1. Die dritte Ausprägung ist die **H1**, nicht die Seitenleiste. Die
   Seitenleiste ist @390 eingeklappt und trägt den Titel dort gar nicht.
2. Auf `/gesetze/bund/OR` @390 steht der Titel **einmal** (nur H1) — die
   Dreifachung ist ein Rechner-/Vorlagen-Muster, kein app-weites.

**Nicht gebaut, weil die eine richtige Änderung ausserhalb liegt.** Die H1 muss
bleiben (Dokumentstruktur, SEO). Die Brotkrume kann ihren letzten Krumen nicht
global verlieren — im Pane ist er die einzige Identität (A-2, s. o.). Bleibt der
**Reiter**, der die **Kurzform** statt des vollen Titels tragen müsste — und das
ist `src/lib/tabs.ts`, ausserhalb dieser Whitelist und ausdrücklich als **EIN**
Schritt zusammen mit F5/D7/R3-F7/§5a Ziff. 3 vergeben. Die Hälfte davon hier zu
bauen erzeugte genau die Kollision, die der Auftrag vermeiden will.

### `.lc-card` — bewusst ausgelassen

Der Finder nennt sie unter L5; der Bauauftrag zählt `.lc-btn-mini`, `.lc-badge`
und `.lc-chip` auf. Die Karte ist zugleich Fläche von R6 (Leser) und R10
(Startseite). Nicht angefasst.

---

## 4 · Tore

| Tor | Ergebnis |
|---|---|
| `npm run lint` | 0 Fehler, 1 Bestands-Warnung (`useUniversalSuche`, unberührt) |
| `npx tsc -b` | grün |
| `npm run test` | 444 Dateien, 7292 Tests, 2 skipped — grün |
| `npm run check:design-tokens` | grün |
| `npm run check:farbwelt` | grün — **146** Pflichtpaare (vorher 126), 6 Referenzwerte, 2 Fixpunkte |
| `npm run check:perf-budget` | grün — entry 59.7 KB / 60.0 KB |
| `npm run golden:vergleich` | **IDENTISCH — 256 Fälle byte-gleich** |
| `npm run build` | 63 Routen prerendered |
| `npm run check:e2e-shards` | grün — 115 Specs, Union deckungsgleich |
| Playwright (4 Specs, 69 Tests) | grün |

### Rot gesehen (§6.7)

Beide neuen Zusicherungen des erweiterten `leser-typo-tokens`-Tors:

* `--lese-gewicht:400` → «expected '400' to be '450'»
* `:where`-Regel gelöscht → «die :where-Regel … fehlt in src/index.css»

### Deklarierte Wächter-Änderungen (§6.3)

1. `src/tests/leser-typo-tokens.test.ts` — **neuer Fall**: bindet das
   Lesetext-Gewicht (Token 450 **und** die anwendende Regel). Bisher waren nur
   Grösse und Zeilenhöhe gebunden; das Gewicht konnte still auf 400 zurückfallen.
2. `src/tests/design-r2c-bausteine.test.ts` — der `PILLE`-Ausdruck folgt der
   neuen kantigen Form. Absicht unberührt (Anatomie steht genau einmal, im
   Baustein). Die Negativ-Kontrolle prüft neu **beide** Richtungen: heutige Form
   matcht, alte Form matcht **nicht** mehr — vorher konnte der Ausdruck
   stillschweigend ins Leere zeigen (§6.7).
3. `scripts/farbwelt-tabellen.ts` — `FIXPUNKT` (beide `--paper`-Anker) und die
   drei `REFERENZ`-Zeilen **neu gemessen**, R1-Zahlen als Herkunft in der
   Quelle-Spalte belassen (§2b); **10 neue Nicht-Text-Pflichtpaare** für die
   Badge-Umrisse auf `paper`/`well`/`paper-raised`.
4. `scripts/datenhaltung/suche.test.ts` — Hook-Deckel 95 000 → 240 000 ms
   (s. §2). Nur der Deckel.

### Eine Flake-Beobachtung, die nicht mir gehört

`e2e/w224-reiterverhalten.e2e.ts` Fall (d) «⌘/Ctrl+Enter in der Kopfsuche»
scheiterte im ersten Lauf mit Timeout 30 s; der Wiederholungslauf lief **10/10
grün**, der Fall dort in **20.5 s**. Dazwischen starb einmal der Playwright-
Webserver (`ERR_CONNECTION_REFUSED`). Also Infrastruktur unter Flotten-Last,
nicht der Bau — aber 20.5 s gegen einen 30-s-Deckel ist dieselbe zu knappe
Reserve wie beim Ingest-Hook oben. Die Datei gehört der Reiter-Runde; hier nur
gemeldet, nicht angefasst.

---

## 5 · Bilder

| Datei | Was |
|---|---|
| `r5f1b-vorher-lesekomfort-hell.jpg` / `…-dunkel.jpg` | Leser `/gesetze/bund/OR#art-336_c` @1440, Stand `0c83e094e` |
| `r5f1b-nachher-lesekomfort-hell.jpg` / `…-dunkel.jpg` | derselbe Artikel, dieser Stand |
| `r5f1b-start-1440-hell.jpg` / `…-dunkel.jpg` | «/» |
| `r5f1b-rechtsprechung-1440-hell.jpg` / `…-dunkel.jpg` | `/rechtsprechung` |
| `r5f1b-split-1440-hell.jpg` / `…-dunkel.jpg` | Split OR + Tagerechner |
| `r5f1b-kuendigung-390-hell.jpg` | Tabs @390 (3 Knöpfe) |
| `r5f1b-schkg-390-hell.jpg` | Tabs @390 umgebrochen (9 Knöpfe, R-1) |
| `r5f1b-arbeitsvertrag-1440-hell.jpg` / `…-dunkel.jpg` | Auswahl-Kacheln mit Registerstrich + Häkchen |
