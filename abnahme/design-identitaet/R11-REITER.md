# R11 «Reiterleiste: Bedienbarkeit und Nützlichkeit» — Bau-Protokoll (W2·24-DESIGN-IDENTITAET)

**Gebaut:** 6.9.2026, Worktree `w2-24-r11`, Branch `feat/w2-24-r11`, Vorstand
`2a18f97bb`. Alle Zahlen aus dem gebauten `dist/` gemessen
(`vite preview --port 4362`, Chromium 1440×900 und 390×844), keine geschätzt (§7).
**Grundlage:** die R11-Prüfrunde vom 6.9.2026 — 42 Funktionen der Arbeitsleiste
AUSGEFÜHRT und im Kanzlei-Szenario «Art. 336c OR · BGE 146 III 1 ·
OGer AG HOR.2024.19 · ZPO-Fristen · Vorlage Arbeitsvertrag, 30 Minuten Recherche»
bewertet; Screens `pruef-r11-01…11.jpg` in diesem Ordner.

## 1 · Was gebaut ist

| Mass | Inventar-Befund | Zusage | Stand |
|---|---|---|---|
| M1 | #16 P4 | Jeder Pfad in einem Fenster hat seinen Reiter; beide Marken ◧◨ | gebaut |
| M2 | #23/#24 | Materialien reiterfähig, mit echtem Namen aus dem Manifest | gebaut |
| M3 | #37 | «Wieder öffnen»: Ring, Alt+Shift+T, Menü, Blatt | gebaut |
| M4 | #35 | Reiter-Kontextmenü mit fünf Aktionen, Maus und Tastatur | gebaut |
| M5 | #36 | Anheften | **zurückgestellt** (Entscheid Orchestrator, D16-Konflikt) |
| M6 | #33/#34 | Mausrad rollt die Leiste; Doppelklick auf den Leerraum | gebaut |
| M7 | #21/#41 | Katalog-Kurzform für Rechner; Stand im `title` | gebaut |
| M8 | #28 | «Daneben öffnen» heisst und tut dasselbe | gebaut |

**Nichts verloren.** Die 21 als «geht» inventarisierten Funktionen sind
unberührt; ihre Wächter (`w224-reiterverhalten`, `w224-reiter-umordnen-d16`,
`w224-plus-reiter`, `tastatur`, `w223b-kopf-seitenleiste`, `a11y`) laufen grün.
Die einzige Funktion, die ihren Ort wechselt, ist die **zweite Instanz**
(`?r=<n>`): sie sass im Erlass-Kopf und sitzt seit M4 zusätzlich als
«Duplizieren» am Kontextmenü **jedes** Reiters — also breiter, nicht schmaler.

## 2 · Die vier Entscheide, die im Bau gefallen sind

**(a) M1 gehört in `Shell.tsx`, nicht in die Leiste.** Fixer 1c hat 6.9.2026 aus
gemessenem Grund festgelegt: die Arbeitsleiste zeigt die reine
Speicherreihenfolge, sie rechnet nichts nach (D16). Ein Reiter, den die Leiste
für ein Fenster selbst erfände, wäre genau die zweite Ordnung, die gerade
entfernt wurde. Der Reiter entsteht darum dort, wo das Fenster gefüllt wird.
Und weil ein Fenster **weiternavigiert**, ruft der Effekt `ersetzeTab` statt
`merkeTab` — dieselbe Regel wie im Hauptfenster (§5a Ziff. 3). Gemessen: nach
Seed und Reload bleiben es zwei Reiter, nicht drei.

**(b) M1 rückwärts ist Teil von M1.** Sobald jedes Fenster einen Reiter hat,
muss das ✕ dieses Reiters das Fenster mitnehmen — sonst entsteht P4 von der
anderen Seite: rechts ein Dokument, das die Leiste nicht mehr führt. Dafür
trägt `PaneSteuerung` neu `schliessePane`.

**(c) M8 öffnet die zweite INSTANZ, nicht die eigene Adresse.** Zwei Gründe,
beide zwingend: fachlich hiess der Knopf immer «denselben Erlass noch einmal»
(Art. 336c neben Art. 335c lesen), und technisch weist
`paneSteuerung.oeffneDaneben` einen bereits offenen Pfad ab — die eigene
Adresse ist immer offen. `oeffneDaneben(naechsteInstanz(pfad))` löst beides.

**(d) M7 kürzt nur, wo der Katalog es sagt.** Das neue Feld `kurz` steht im
Katalog (§5), nicht in der Leiste, und ist gesetzt für genau drei Karten —
ZPO-, SchKG- und BGG-Fristen —, deren Kurzform aus dem eigenen Routen-Slug und
dem Kürzel des massgeblichen Erlasses folgt. Alles andere behält den vollen
Titel: eine heuristische Kürzung wäre geraten (§7).

## 3 · Messreihe vorher / nachher

| Grösse | Vorstand `2a18f97bb` | nach R11 |
|---|---|---|
| Reiter für `/materialien/BJ-EHRA-PM-2025-01` | 0 (J3) | 1, beschriftet «Praxismitteilung EHRA 1/25» |
| Marken bei `panes=[BGE]`, `tabs=[OR,Rechner]` | 1 (`pruef-r11-05`) | 2 (◧ links, ◨ rechts) |
| Breite des Reiters `zpo-fristen` @1440 | 268 px (breitester der Leiste) | «ZPO-Fristen» |
| `[role=menu]` nach Rechtsklick auf einen Reiter | 0 (C2) | 1, mit 5–6 `menuitem` |
| `scrollLeft` nach `wheel(0,300)` @390 mit Überlauf | 0 (F3b) | > 0 |
| Reiterzahl nach Doppelklick auf 457 px Leerraum | ±0 (C3) | +1 |
| `panes` nach Klick auf den Erlass-Kopf-Knopf | `[]` (H3) | `['/gesetze/bund/OR?r=2']` |
| Stand im `title` eines Gesetzes-Reiters | fehlte (I4) | «… — Stand TT.MM.JJJJ — gelesen bis Art. …» |

## 4 · Rot-Probe (§6.7)

Die 18 neuen e2e-Fälle (`e2e/w224-r11-reiterleiste.e2e.ts`) wurden **gegen den
Vorstand `2a18f97bb` gefahren** (`git checkout 2a18f97bb -- src/`, voller Build,
63 Routen prerendered): **16 rot, 2 grün.** Die zwei grünen sind die beiden
Nicht-Regressions-Kontrollen — «ohne Überlauf bleibt das Rad beim Dokument» und
«Doppelklick AUF einem Reiter erzeugt keinen zweiten»: sie sollen auf beiden
Ständen grün sein, sonst bewachten sie nichts. Auf dem R11-Stand: 18/18 grün.
Die Rot-Wege der Unit-Wächter stehen je Block im Testkopf
(`src/tests/tabs.test.ts`, `src/tests/reiterKurzformKatalog.test.ts`).

## 5 · Deklarierte fachliche Teständerung (§6.3)

`src/tests/leser-benennung.test.ts`, Eintrag Ä118: gewählt ist neu
**«Daneben öffnen»** statt «In neuem Fenster». Das Wortverbot «In neuem Reiter»
bleibt unverändert; neu verboten ist zusätzlich «In neuem Fenster». Begründung
im Test und im Commit: der Ä118-Beleg vom 18.8.2026 bleibt für seinen Stand
richtig (damals gab es weder Reiterleiste noch Pane-Marken) — er wird **ergänzt,
nicht nachgeführt**. Seit R2 trägt die Leiste messbar `title="Fenster links"` /
`"Fenster rechts"`, und der so beschriftete Knopf öffnete gemessen kein Fenster.

## 6 · Screens

| Datei | Was |
|---|---|
| `r11-leiste-6-reiter-1440-{hell,dunkel}.jpg` | Leiste mit 6 gemischten Reitern inkl. Materialie |
| `r11-kontextmenue-1440-{hell,dunkel}.jpg` | Kontextmenü offen |
| `r11-mobil-390-{hell,dunkel}.jpg` | Streifen @390 |
| `r11-blatt-390-{hell,dunkel}.jpg` | Überlauf-Blatt @390 mit der Gruppe «Materialien» |
| `pruef-r11-01…11.jpg` | die Messbilder der Prüfrunde (Vorstand) |

## 7 · Offen — nicht gebaut, ausdrücklich benannt

- **M5 Anheften (#36)** — zurückgestellt. Grund unverändert: es dürfte keine
  zweite Anzeige-Ordnung werden (D16), sondern müsste den flachen Speicher
  umsortieren, und das Ziehen eines freien Reiters vor einen festen wäre dann
  zu **verhindern**, nicht stillschweigend zu korrigieren. Gehört mit der
  **Arbeitsmappe (#38)** in einen eigenen Schritt nach W2·24.
- **#4 Ctrl-Klick auf einen Inhalts-Link** — der Prüfbefund ist ausdrücklich
  unvollständig (headless Chromium); nicht angefasst.
- **Roving-Tabindex (#39)** — 3 Halte je Reiter bleiben; das ändert das
  Fokus-Modell der ganzen Kopfzone und ist ein eigener a11y-Schritt.
- **Registerfarbe für inaktive Reiter (#26)** — Ästhetik-Entscheid für David,
  kein Prüfer-Auftrag (F9 hat die heutige Regel gemessen entschieden).
- **Aufgefallen, nicht beauftragt:** im Überlauf-Blatt trägt der Rechner
  weiterhin den vollen Katalog-Titel und wird dort auf «Verfahrens- &
  Rechtsmittelfris…» abgeschnitten (Screen `r11-blatt-390-hell`). Das Blatt ist
  ein Verzeichnis und soll den langen Namen zeigen — nur nutzt der abgeschnittene
  niemandem. Kandidat: Kurzform in der Zeile, voller Titel im `title`. Nicht
  gebaut, weil ausserhalb des R11-Auftrags.
