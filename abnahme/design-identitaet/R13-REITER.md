# R13 · «Reiter nützlicher und intuitiver» — Bau-Protokoll

**Bau** 7.9.2026 · Worktree `w2-24-r13`, Branch `feat/w2-24-r13`, Basis `a60dd7f75`
**Grundlage** Prüfbefunde R13-1…R13-12 (7.9.2026) · Rahmen `fahrplaene/FAHRPLAN-DESIGN-IDENTITAET.md` §5a, `abnahme/design-identitaet/R11-REITER.md`
**Massstab** Chrome/Safari-Reiterband. Alle Zahlen GEMESSEN (Chromium headless, gebautes `dist/`, `vite preview :4401`).

## Was sich im Kern geändert hat

Die Leiste rechnete bis hierher mit einer **festen Zahl** (`SICHTBAR_MAX = 8`) und
**tauschte** den aktiven Reiter in den letzten Platz. Beides ist weg. Sie misst
jetzt, wie viele Reiter **ganz** nebeneinander stehen können (die Reiter dürfen
dabei bis an ihre Inhaltsgrenze schrumpfen), und zeigt ein zusammenhängendes
**Fenster** über die echte Speicherordnung, das sich um den aktiven Reiter herum
bewegt. Was nicht hineinpasst, steht im «+N»-Blatt — angeschnitten wird nichts.

## Befund → Fix → Sonde

| Befund | Fix (Datei:Zeile) | Sonde (Rot am Vorstand `a60dd7f75`) |
|---|---|---|
| **R13-1** aktiver Reiter @390 angeschnitten (`scrollLeft 785` statt 843, Kante 312 bei `clientW 253`); der «8 offen»-Knopf verschmälerte den Streifen NACH der Rechnung | `Reiterleiste.tsx:601–626` (Blatt-Knopf steht immer, feste Breite `w-[4.5rem]`) · `reiterleiste/useReiterFenster.ts:54–104` (ResizeObserver + Kantenmessung) | `e2e/w224-r13-reiter.e2e.ts:114` «@390 steht der aktive Reiter vollständig im Streifen» — rot: Kante 312 > 254 |
| **R13-2** 8 Reiter @1440 `scrollW 1476 > clientW 1355`, kein «+N», Scrollbalken per CSS aus → stummer Anschnitt; @1024 zwei Reiter unsichtbar | `reiterleiste/Reiter.tsx:129–138` (`shrink-0` entfällt) · `reiterleiste/ueberlauf.ts:56–70` (`ersterUeberlauf`) · `useReiterFenster.ts` | `w224-r13-reiter.e2e.ts:87` ×3 (@1440/@1024/@390) — rot: 1185 > 940 (@1024), 1045 > 254 (@390), `data-reiter-fenster` fehlt (@1440) · Einheitstest `src/tests/reiter-ueberlauf-r13.test.ts` |
| **R13-3** Slot-Tausch: 15 Reiter, #14 → #15 liess «ArG» aus dem Streifen fallen | `Reiterleiste.tsx:149–172` (Fenster statt Tausch) · `ueberlauf.ts:29–52` (`fensterStart`) | `w224-r13-reiter.e2e.ts:130` «zusammenhängende Teilfolge» · Einheitstest (Rot-Probe: alten Tausch einsetzen ⇒ 3 Fälle rot) |
| **R13-4** leerer 60-px-Platzhalter (`.rl-stelle` mit `textContent ""`); ZGB 137 px statt 93 px | `reiterleiste/Reiter.tsx:210–223` (`{stelle ? … : null}`) · `src/index.css` `.rl-stelle:empty{display:none}`; der `::before`-Kunstgriff für die leere Zeilenbox entfällt ersatzlos | `w224-r13-reiter.e2e.ts:163` — rot: Platzhalter 60 px, Reiter 137 px |
| **R13-5** nach dem letzten ✕: Rechtsklick auf den Leerraum ergab `[role=menu]` = 0 | `Reiterleiste.tsx:425–447` (`leerraumEintraege`) · `:566–573` (`onContextMenu` am Streifen) | `w224-r13-reiter.e2e.ts:184` — rot: 0 Menüs |
| **R13-6** «Alle schliessen» nur im Blatt, das am Desktop `md:hidden` war | `Reiterleiste.tsx:194–205` (`alleSchliessen`, eine Rechnung für Blatt + beide Menüs) · `:400–402` | `w224-r13-reiter.e2e.ts:211` — rot: Eintrag fehlt |
| **R13-7** 0 × `aria-keyshortcuts`, kein Alt-Weg im `title` | `reiterleiste/Reiter.tsx:49–58` (`kuerzel`), `:118`, `:161` · `reiterleiste/ReiterBlatt.tsx:83–108` (Kürzel-Liste im Blatt) | `w224-r13-reiter.e2e.ts:239` + `:271` — rot: Attribut fehlt / Blatt-Knopf fehlt |
| **R13-8** `Alt+9` = neunter statt letzter Reiter; kein Blättern | `Reiterleiste.tsx:223–252` (zyklisch), `:265–271` (Alt+9 = letzter) | `w224-r13-reiter.e2e.ts:249` — rot: Alt+9 landet auf dem neunten |
| **R13-9** «Adresse kopieren» fehlte im Reiter-Menü | `Reiterleiste.tsx:383–392` (über `useKopieren`, nicht von Hand — R4-D) | `w224-r13-reiter.e2e.ts:222` — rot: Eintrag fehlt |

**Rot-Beweis §6.7:** ein Lauf der ganzen Sonde gegen den Vorstand `a60dd7f75`
(Produktdateien zurückgesetzt, neu gebaut) — **12 von 12 rot**; danach mit dem
R13-Stand **12 von 12 grün**.

## Gemessene Werte nach dem Bau (8 Reiter: OR·BGE·ZPO-Fristen·Arbeitsvertrag·ZGB·ZPO·StGB·URG, aktiv = URG)

| Breite | `scrollW / clientW` | sichtbar | Blatt | aktive Kante |
|---|---|---|---|---|
| 1440 | 1275 / 1275 | 8 von 8 | «8 offen» | 1056 ≤ 1275 |
| 1024 | 859 / 859 | 7 von 8 | «+1» | 844 ≤ 859 |
| 390 | 241 / 241 | 2 von 8 | «+6» | 204 ≤ 241 |

15 Reiter @1440, aktiv #14 → #15: Fenster `5/10/15` → `6/10/15` — zusammenhängend,
um genau einen Platz gerückt («ArG» bleibt).

## Zwei Fallen, die der Bau selbst erzeugt hat (und ihr Wurzel-Fix)

1. **Rückkopplung Knopf ↔ Überlauf.** Der «+N»-Knopf erschien erst BEI Überlauf,
   verschmälerte damit den Streifen und änderte die Zahl, die ihn erzeugt hatte:
   GEMESSEN @1024 mit 8 Reitern React-Fehler #185 («Maximum update depth»), die
   Leiste verschwand ganz. Fix: der Knopf steht immer und mit **fester** Breite —
   auch der Aufschrift-Wechsel «8 offen» ↔ «+2» hielt den Kreis sonst am Leben.
2. **Schranke gegen nachgeladene Beschriftungen.** Die Hysterese, die das
   Schwingen verhindert, überlebte den Wechsel der Reiterbreiten: @390 passte mit
   den Platzhalter-Namen («Gesetz öffnen», 130 px) nur EIN Reiter, und als die
   echten Namen kamen (URG 74 px), blieb es dabei. Fix: ändert sich die gemessene
   Kante bei gleicher Reiterzahl, wird die Schranke verworfen
   (`useReiterFenster.ts`, Kommentar am Fundort).

## Deklarierte Test-Änderungen (§6.3)

- `e2e/w224-r11-reiterleiste.e2e.ts` M6 «@390 rollt das Rad die ÜBERLAUFENDE
  Leiste» — die Vorbedingung (Überlauf) ist mit R13-2 abgeschafft; geprüft wird
  an derselben Stelle die neue Zusage. Der `wheel`-Griff bleibt als Rückfall für
  «ein Reiter breiter als der ganze Streifen» und ist weiter vom Fall darunter
  bewacht.
- `e2e/w224-r11-reiterleiste.e2e.ts` M3 — schloss den Reiter «ZPO-Fristen» im
  Streifen; @390 steht er seit R13-2 im Blatt. Das Schliessen ist blosser Aufbau
  und geht jetzt über das Blatt; die geprüfte Zusage ist unverändert.
- `src/tests/design-r3b-chrome.test.ts` — zwei Pfad-Register (`komfort={false}`,
  `.lc-schwebeflaeche`) auf die §6.6-Split-Dateien nachgezogen.

## Screens

`r13-reiter-{1440,1024,390}-{8,15}-{hell,dunkel}.jpg` (12 Bilder, Kopfzone mit
Titelblatt- und Arbeitsleiste).

## Nicht gebaut — und warum

- **R13-10** («+» öffnet höchstens einen leeren Reiter) und **R13-12** (Klick auf
  den aktiven Reiter tut nichts): Entscheid des Orchestrators — heutiges
  Verhalten bleibt.
- **R13-11** (Label-Rückfall «Gesetz öffnen» statt Adress-Kern): Schwere
  «niedrig»; Fundort `src/lib/verlaufLabel.ts:87` liegt ausserhalb der
  Bau-Fläche. Auf den Screens sichtbar (StGB-Reiter).
- **Anheften (M5/R13-9 zweiter Teil)**: ausdrücklich zurückgestellt (W2·25).

## Zwei rote Tore, die NICHT von R13 stammen (Nullprobe gefahren)

- `npm run check:schlankheit` rot an `src/pages/gesetz-leser/parts/ArtikelLeser.tsx`
  (840 Z.) — die Datei misst auf der Basis `a60dd7f75` dieselben 840 Zeilen und
  ist von R13 nicht berührt.
- `e2e/w224-reiterverhalten.e2e.ts:239` (D27, «die Beschriftung folgt der
  Lesestellung») rot: der Leser schreibt keinen `#art-…`-Anker mehr in den
  Reiter-Speicher (gemessen `[{path:'/gesetze/bund/ZGB'}]` unverändert über 9 s).
  **Nullprobe:** derselbe Fall ist mit den Produktdateien der Basis `a60dd7f75`
  wortgleich rot. Ursache liegt auf der Leser-Seite (jüngster Anfasser der
  Spy-Kette: `06f5f32e0`, §6.6-Split `inhalt-hooks*`), nicht in der Leiste.
