# R2 «Rahmen» — Bau-Protokoll (W2·24-DESIGN-IDENTITAET)

**Erhoben:** 6.9.2026, aus dem Worktree-Preview (`vite preview --port 4332`,
gebautes `dist/`), Chromium. Alle Zahlen gemessen, nicht geschätzt (§7).

## 1 · Was gebaut ist

| §5a | Punkt | Stand |
|---|---|---|
| 1 | Zwei Zeilen, zwei Bedeutungen (Titelblatt = Bereiche · Arbeitsleiste = Dokumente), optisch verschieden | gebaut |
| 2 | Kanonische Kurzform («Art. 336c OR», «BGE …», Vorlagen-Name), voller Titel als `title`, Registerfarben-Strich | gebaut |
| 3 | Klick ersetzt den aktiven Reiter | **nicht gebaut** — s. §3 |
| 4 | Split aus der Leiste: ziehen (`usePaneDnd`) **oder** «daneben öffnen»; zwei Aktiv-Marken ◧/◨ | gebaut |
| 5 | Überlauf ab 8 Reitern → «+N» mit Liste **und Suche**, nie stilles Schliessen | gebaut · **Anheften nicht** (§3) |
| 6 | Reiter überleben Neustart, Lesestellung inbegriffen; «zuletzt geschlossen» aus dem Verlauf | war schon da (`lib/tabs.ts` speichert den Pfad inkl. `#art-…`; `VerlaufUebersicht` bleibt im Kopf) |
| 7 | Alt+1…9 springt · Reiter schliessen · Ctrl/⌘+Enter im Suchfeld | gebaut, mit zwei offengelegten Abweichungen (§3) |
| 8 | Mobil waagrecht scrollbar, aktiver Reiter im Bild, «N offen»-Blatt ab 3 Reitern | gebaut |
| 9 | Arbeitsmappe | ausserhalb R2 (Auftrag) |

Dazu aus §6 des Fahrplans: Seitenleiste entfällt ab `lg` auf «/» (mobile
Schublade bleibt überall die Bereichs-Navigation); Sidebar-, Pane-, PaneKopf-
und Footer-Optik auf Linien/Registerfarben; `Logo.tsx` trägt die Schrift nicht
mehr hart im SVG; `ReiterUebersicht.tsx` gelöscht.

## 2 · Die eine Struktur-Entscheidung, die begründet werden muss

**Nur die Titelblatt-Zeile klebt; Ausgabe-Zeile und Arbeitsleiste laufen im
Fluss mit.** `pages/gesetz-leser/v3/leserGeometrie.ts` führt die Kopfhöhe als
Konstante `APP_TOPBAR_H = '4rem'` und rechnet daraus `--leser-v3-kopf-top` und
`--nt-stick` — die Datei gehört R4 und ist in R2 TABU. Eine ~7 rem hohe klebende
Krone hiesse: der Leser-Kopf klebt weiter auf 4 rem, also unter der
Arbeitsleiste, und jeder `#art-…`-Anker landet um die Differenz zu hoch.

Gemessen und eingehalten: **Kopfhöhe exakt 64 px** (die 2-px-Kante sitzt am
inneren Träger, mit `border-box` also innerhalb der `h-16`; mit der Kante am
`<header>` waren es 66 px). Preis: die Arbeitsleiste scrollt weg. **R4-Punkt:**
aus `APP_TOPBAR_H` ein geteiltes Token machen, dann kann sie kleben.

## 3 · Nicht gebaut, mit Grund (§8 statt stiller Lücke)

* **§5a Ziff. 3 «Klick ersetzt den aktiven Reiter».** Ist-Stand gemessen:
  `components/TabTracker.tsx` ruft bei JEDER Navigation `lib/tabs.merkeTab()`,
  das einen neuen Reiter anhängt. «Ersetzen» umzubauen heisst, `lib/tabs.ts`
  und `TabTracker.tsx` zu ändern — beide ausserhalb der R2-Whitelist
  (`src/components/layout/**`), und es ist eine Verhaltensänderung mit breiter
  Testfläche, kein Darstellungsschritt. Gehört in einen eigenen, deklarierten
  Schritt.
* **§5a Ziff. 5, Hälfte «angeheftete Reiter».** Braucht einen neuen persistierten
  Speicher und eine auffindbare Anheft-Geste; in einer 28-px-Reiterzeile ist
  dafür kein Platz, ohne die ✕-/⧉-Griffe zu verdrängen. Sachlich beim selben
  Thema wie Ziff. 9 (Arbeitsmappe), darum dort. Der Überlauf selbst — der Teil,
  der «nie stilles Schliessen» sichert — ist gebaut.
* **§5a Ziff. 7, Ctrl/⌘+W.** Der Browser fängt die Taste selbst ab und schliesst
  sein Fenster. Belegt ist die Ziffer mit ihrem eigenen Rückfall **Alt+W**.
* **§5a Ziff. 7, Ctrl/⌘+Enter «in neuem Reiter».** Wäre heute wortgleich mit dem
  blossen Enter (jede Navigation legt ohnehin einen Reiter an, s. Ziff. 3) —
  also eine Zusage ohne Wirkung (§8). Die Taste öffnet stattdessen **daneben**
  (Split-View), solange ein Fenster aufgehen kann. Sobald Ziff. 3 gebaut ist,
  bekommt sie ihre wörtliche Bedeutung zurück.

## 4 · Messreihe (Preview, gebautes dist/)

| Messung | Wert |
|---|---|
| Höhe der klebenden Titelblatt-Zeile @1440 und @390 | **64 px** (Soll `APP_TOPBAR_H` = 4 rem) |
| Split-View `/gesetze/bund/OR?p=/rechtsprechung#art-336_c` | **2** Panes, 3 offene Reiter, Aktiv-Marke ◧ am Reiter des Hauptfensters |
| 10 offene Reiter @1440 | **8** sichtbar, Überlauf-Knopf «**+2**», Blatt zeigt alle 10 gruppiert + Suchfeld |
| `scrollWidth` @390, hell **und** dunkel, «/» · `/gesetze` · `/gesetze/bund/OR#art-336_c` · `/rechtsprechung` | **390 = clientWidth** in allen 8 Fällen (keine waagrechte Achse) |
| Registerfarben am Reiter-Strich (`getComputedStyle`) | `rgb(31,58,95)` = `--reg-g` · `rgb(122,31,43)` = `--reg-r` · `rgb(138,106,31)` = `--reg-w` |
| Kopf-Sprung «/» ↔ `/gesetze` (x des Farbschema-Knopfes) | vor `ml-auto` **93 px**, danach **0** (`e2e/w223b` §6.1) |

## 5 · Nachweis-Aufnahmen

`r2-{1440,390}-{hell,dunkel}-{start,gesetze,leser,rechtsprechung}.jpg` ·
`r2-1440-{hell,dunkel}-split.jpg` (zwei Panes) ·
`r2-1440-{hell,dunkel}-reiter10.jpg` + `-reiter10-blatt.jpg` (Überlauf) ·
`r2-390-{hell,dunkel}-schublade.jpg` (mobile Schublade) ·
`r2-1440-hell-reiterstreifen.jpg` (Ausschnitt der beiden Zeilen).

## 6 · Zwei Defekte, die der Bau selbst gefunden hat

* **Skip-Link verlor den ersten Tab-Druck.** `scrollIntoView` auf dem aktiven
  Reiter setzte in Chromium den Startpunkt der Tab-Reihenfolge; der erste
  Tab-Druck landete auf dem Reiter statt auf «Zum Inhalt springen»
  (`e2e/a11y.e2e.ts` E4 wurde rot). Ersetzt durch direktes Setzen von
  `scrollLeft` am Streifen — kein Dokument-Scroll, gleiche Wirkung.
* **Der Kopf sprang beim Routenwechsel.** Mit dem engeren `max-w-xs`-Deckel des
  Suchfeldes sammelte sich der Restplatz hinter den Werkzeugen; auf «/» (ohne
  Feld und ohne Seitenleisten-Schalter) standen sie 93 px weiter links.
  Behoben mit `ml-auto`, bewacht von `e2e/w223b-kopf-seitenleiste.e2e.ts`.
