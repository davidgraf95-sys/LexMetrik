# R13B · «Reiterstreifen ohne Layout-Sprung» — Bau-Protokoll

**Bau** 7.9.2026 · Worktree `w2-24-rcls`, Branch `fix/w2-24-reiter-cls`, Basis `cfa8a9f81`
**Grundlage** W2·24 §8 Nr. 8 (Nachzug) · Befund PR #743 §8 b · Befund Fixer D34 (7.9.2026)
**Rahmen** `fahrplaene/FAHRPLAN-DESIGN-IDENTITAET.md` §5a · `abnahme/design-identitaet/R13-REITER.md` · `R11-REITER.md`
**Messbedingung** Chromium headless, **gebautes `dist/`**, `vite preview :4429 --strictPort`, Viewport 1280×900, `PerformanceObserver({type:'layout-shift'})`, nur **input-freie** Einträge, Quellen auf `nav[aria-label="Offene Reiter"]` gescopt. Ohne CPU-Drossel, sofern nicht anders vermerkt.

## Der Befund, in zwei unabhängigen Messungen

1. **PR #743 §8 b:** «Reiterstreifen CLS 0.00136 — das führende «+» fällt beim ersten Reiter weg.»
2. **Fixer D34 (7.9.2026):** `e2e/leser-r1-r2.e2e.ts` «Suche, Fundstellen-Sprung und Gliederungs-Sheet ohne Layout-Shift (CLS 0)» rot mit **0.000307**, Quellen `DIV.flex shrink-0 …` und `lc-schliessknopf`; Nullprobe auf `cfa8a9f81` identisch; **1–2 von 3 Läufen rot**.

## Was gemessen wurde

Ein frischer ZGB-Reiter durchlief am Vorstand **vier** Zustände statt einem:

| t | Zustand | Streifen `x\|b\|h` | Reiter `x\|b` | Aufschrift | «+» |
|---|---|---|---|---|---|
| 207 ms | leer | `60\|1196\|16` | — | — | x 24 (links) |
| 243 ms | 1 Reiter | `24\|1116\|33` | `25\|131` | «Gesetz öffnen» | x 1140 (rechts) |
| 260 ms | Manifest da | `24\|1116\|33` | `25\|80` | «ZGB» | x 1140 |
| beim 1. Scrollen | Stellung da | `24\|1116\|33` | `25\|137` | «Art. 5 ZGB» | x 1140 |

Vier Ursachen, jede mit eigener Shift-Zeile:

| # | Ursache | Fundort | Gemessener Shift (input-frei) |
|---|---|---|---|
| **W1** | Das «+» hatte **zwei** Aufrufstellen — `{leer && …}` vor dem Streifen, `{!leer && …}` dahinter. Der erste Reiter liess es die Seite wechseln. | `Reiterleiste.tsx:553` / `:595` (Vorstand) | **0.000944** · `DIV.relative.flex.min-w-0` `60,64 1196×16 → 24,64 1116×33` |
| **W2** | Streifenhöhe kam aus dem Inhalt (16 px leer, 33 px voll); Trennkanten (`border-b`/`border-l`) hingen am Reiterstand; das «N offen»-Blatt war mount/unmount und nahm dem `flex-1`-Streifen 4.5 rem + `ml-2` weg. | `Reiterleiste.tsx:547`, `:548`, `:575`, `:616` | in W1s Zeile enthalten (dieselbe Kaskade) |
| **W3** | Vor dem lazy Browse-Manifest trug ein Gesetzes-Reiter die Aufforderung «Gesetz öffnen» (131 px) und sprang auf sein Kürzel (80 px). | `lib/tabs.ts:213` (`erlassVonPfad(...)?.kuerzel`) | **0.000046** (ein Reiter) / **0.000521** (zweiter Reiter) · `BUTTON.lc-schliessknopf 127,69 → 69,69` bzw. `DIV.rl-reiter 175,64 131×33 → 118,64 80×33` |
| **W4** | `.rl-stelle` mountete **erst beim ersten Scrollen** (der Spy meldet nur dann: `inhalt-hooks.tsx:382` `if (gescrollt.current)`, entprellt 200 ms) und weitete den Reiter 80 → 137 px. | `reiterleiste/Reiter.tsx:270` · `index.css` `.rl-stelle:empty` | Reiter **80 → 137 px**, ✕ **x 69 → 133** |

**Warum W4 flakte.** Scrollen ist keine *diskrete* Eingabe — der Folge-Shift fällt nicht unter die `hadRecentInput`-Ausnahme der CLS-Definition. Unter der 6×-Drossel des D34-Falls landet die 200-ms-Entprellung mal **innerhalb**, mal **ausserhalb** des 500-ms-Fensters eines vorangegangenen Klicks. Das ist die 1–2-von-3-Quote, keine Umgebungsstreuung.

**Was der Bestandskommentar falsch behauptete** (§0 Ziff. 2b — der Befund von R13-4 bleibt gültig, seine *Folgerung* ist widerlegt): «Der einmalige Übergang «keine Stelle → Art. 1» verschiebt seit R13-2 nichts mehr: die Reiter schrumpfen gemeinsam, die Gesamtbreite des Streifens ist gedeckelt.» Das gilt nur bei **vollem** Streifen. Ein Reiter in 1116 px wächst frei — gemessen 80 → 137 px.

## Fix

| # | Massnahme | Fundort |
|---|---|---|
| **W1** | Das «+» hat **eine** Aufrufstelle, und zwar die **linke** — derselbe Platz mit und ohne Reiter. | `Reiterleiste.tsx` `plusKnopf()` + die eine Einbaustelle vor dem Streifen |
| **W2** | Zeile mit `h-full` an der festen Leistenhöhe; der Unterstrich ist keine `border-b` mehr, sondern eine absolut liegende 1-px-Linie (kein box-border-Abzug von der Innenhöhe); Streifen-Trennkante als `border-transparent` im Fluss; das «N offen»-Blatt steht **immer** im Fluss und wird leer per `visibility` + `aria-hidden` + `disabled` + `tabIndex={-1}` aus Bild und Bedienung genommen. | `Reiterleiste.tsx` |
| **W3** | Solange das Manifest **fehlt**, ist die vorläufige Aufschrift der **Schlüssel der Adresse** — keine Schätzung (§2/§7), sondern die Zeichenkette aus der Adresszeile. Ist das Manifest da und kennt den Erlass nicht, bleibt «Gesetz nicht gefunden» stehen (G23, §8). | `lib/tabs.ts` `basisKurzform`, `vorlaeufig` |
| **W4** | Die Reserve gilt genau dort, wo eine Stellung **entstehen** kann: am Reiter, der gelesen wird (aktiv **oder** in einem Pane). Eigene Klasse `.rl-stelle-frei` mit `::before`-Schutzleerzeichen (ein leerer inline-block hat keine Zeilenbox und schöbe die `items-baseline`-Zeile auseinander — Befund 6.9.2026, 39 px statt 33 px). | `reiterleiste/Reiter.tsx` (`liest`) · `index.css` `.rl-stelle-frei` |

### Warum die Reserve nicht an *jedem* Gesetzes-Reiter hängt

R13-4 hat den leeren Platzhalter gestrichen, weil er an jedem Gesetzes-Reiter ein 60-px-Loch war (ZGB 137 px statt 77 px), und die Sonde `w224-r13-reiter.e2e.ts:233` hält das fest: **`.rl-stelle` Breite 0, Reiter < 110 px**. Ein Reiter mit Reserve misst 137 px — beide Zusagen zugleich sind für *denselben* Reiter unerfüllbar. Sie betreffen aber **verschiedene** Reiter: R13-4 seedet nach `/kontakt`, ZGB ist dort **Hintergrund**-Reiter und bekommt nie eine Stellung. Der gelesene Reiter dagegen bekommt sie beim ersten Scrollen — und nur er hält den Platz frei. Die Sonde R13-4 bleibt unverändert (§6.3) und grün.

### Warum das «+» links steht und nicht am Ende

Der erste Anlauf setzte es ans **Ende** des Streifens (D19, «analog zum browser») und machte die Kanten `border-transparent`. Beides riss `w224-r11-reiterleiste.e2e.ts:345` (R2), **3 von 3 Läufen**: `borderBottomWidth` 1px statt 0px, «+»-Abstand vom Leistenrand ~1380 statt < 40. Die Sonde bleibt unverändert; geändert ist der Bau. Verworfen wurde auch ein zweiter, unsichtbarer Platzhalter links — er hätte den Reitern dauerhaft 36 px Leerraum vorgeschoben.

> **Offen für Davids Entscheid.** D19 setzt das «+» hinter den letzten Reiter; jetzt steht es davor. Seine **Funktion** ist unberührt (Klick und Alt+T legen weiter einen Reiter an), nur seine Seite ist links statt rechts. Wer das umdreht, muss zugleich R2s Zusage («+ am linken Inhaltsrand») neu fassen — beides zusammen geht nicht.

## Gemessen nach dem Bau (gleiche Bedingung, gleiche Sonde)

| Szenario | Leisten-Shift vorher | nachher |
|---|---|---|
| frischer ZGB-Reiter (ohne Geste) | 0.001253 | **0.000000** |
| von 0 auf 1 Reiter (`/` → ZGB) | 0.002100 | **0.000000** |
| zweiter Reiter (OR) dazu | 0.000521 | **0.000000** |
| Hover + Tastatur-Fokus auf dem ✕ | 0 | **0.000000** |
| Verkleinern auf 700 (R13-Fenster rechnet neu) | 0 | **0.000000** |

Die Zeitspur hat nur noch **zwei** Zustände statt vier — und beide tragen dieselbe Geometrie:

| t | Zustand | Streifen `x\|b\|h` | Reiter `x\|b` | ✕ | «+» |
|---|---|---|---|---|---|
| 279 ms | leer | `60\|1116\|34` | — | — | x 24 |
| 325 ms | 1 Reiter, «ZGB» | `60\|1116\|34` | `61\|137` | x 133 | x 24 |
| nach «Art. 5» | Stellung da | `60\|1116\|34` | `61\|137` | x 133 | x 24 |

## Sonde

**Neu:** `e2e/w224-r13b-reiter-cls.e2e.ts` — «R13B — Reiterleiste: CLS 0 über Öffnen, Schliessen, Hover und Lesestellung», fünf Fälle, Beobachter auf die Leiste gescopt (fremde Shifts werden mitprotokolliert, aber nicht zugerechnet — §0 Ziff. 3, dieselbe Trennung wie in `leser-r1-r2.e2e.ts`). Neben dem Shift-Wert prüft jeder Fall die **Geometrie**, an der der Befund hing: «+», Blatt, Streifen, Reiterbreite, ✕-Position.

**Bestandssonden unverändert** (§6.3): `w224-r13-reiter`, `w224-r11-reiterleiste`, `w224-reiterverhalten`, `kein-abschnitt`, `leser-r1-r2`.

### Rot-Probe (§6.7)

Jede Massnahme **einzeln** zurückgenommen, neu gebaut, Sonde gefahren, danach zurückgesetzt (7.9.2026, Stand `2c103c559`, Preview 4429, `--workers=2`):

| Rücknahme | Fälle rot | Gemessen |
|---|---|---|
| **W1** — das «+» wieder mit zwei Aufrufstellen (`{leer && …}` links, `{!leer && …}` rechts) | 1 von 5 · «der erste Reiter entsteht» | **0.0009562500000000001** · `DIV.relative flex min-w-0 flex-1 items-stretch` `60,64 1116×34 → 24,64 1116×34` |
| **W2** — das «N offen»-Blatt wieder in `{!leer && (…)}` (Mount/Unmount) | 2 von 5 · «der erste Reiter entsteht» + «der letzte Reiter wird geschlossen» | Geometrie-Zusage bricht: «der Streifen hält Platz, Breite und Höhe» |
| **W3** — `vorlaeufig` in `lib/tabs.ts` gestrichen (zurück auf `?.kuerzel`) | 2 von 5 · «der erste Reiter entsteht» + «ein zweiter Reiter kommt dazu» | **0.00011510416666666667** · `SPAN.min-w-0 truncate max-w-[15rem]` `71,71 88×21 → 135,71 30×21` und `lc-schliessknopf 163 → 169` · sowie **0.000259413825141059** · `DIV.rl-reiter` `211,64 131×34 → 154,64 128×34` |
| **W4** — den `.rl-stelle-frei`-Zweig in `Reiter.tsx` gestrichen | 1 von 5 · «die Lesestellung erscheint» | Reiter **80 px** statt 137 — «der Reiter hielt den Platz seiner Stellung schon vorher frei» bricht |

W3s Wert liegt hier niedriger als am Vorstand (0.000046 / 0.000521), weil die drei übrigen Massnahmen dabei **eingebaut** bleiben: gemessen wird der isolierte Beitrag, nicht die Kaskade.

## Offen — nicht in dieser Bau-Einheit

`e2e/leser-r1-r2.e2e.ts:673` ist damit **nicht** vollständig grün. Nach dem Fix ist die Reiterleiste aus den Quellen verschwunden; übrig bleibt **0.0003067543680049576** aus `DIV.flex shrink-0 items-center gap-1 sm:gap-1.5` — das ist `src/pages/gesetz-leser/v3/LeserKopf.tsx:289` (`data-v3-kopf-griffe`), dessen Klassen zwischen `… gap-1 pl-2 sm:gap-1.5 sm:pl-3` und `… gap-1 sm:gap-1.5` wechseln, sobald `suchInZeile` umschlägt: der Griff-Cluster verschiebt sich um die Polsterung. Das ist der **gesetz-leser** und damit TABU für diese Bau-Einheit (D38/L6). Der Wert **0.000307** ist zugleich exakt die Zahl aus dem D34-Bericht — die Reiterleiste war dort **Mit**-Quelle, nicht die einzige.
