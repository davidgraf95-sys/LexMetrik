# R9 Finder-Welle A' — Typografie-Klassen, echte Browser-Messung (6.9.2026)

Methode: Playwright (`playwright@1.60.0` aus dem Worktree-`node_modules`),
Skript ausgeführt aus `.claude/worktrees/w2-24-sweep` gegen `vite preview
--port 4351` (HEAD 7a3b697e5, dist Sep 6 21:29 > HEAD-Zeit 21:26:44 → dist
gültig, nicht neu gebaut). 62 Route×Viewport×Scheme-Kombinationen geladen
(0 Fehler), computed styles per `getComputedStyle` extrahiert, 10 Screens
`abnahme/design-identitaet/finder-r9-a2-01..10-*.jpg` (nicht committet).
Rohdaten: `<scratchpad>/r9-a2-results.json`, Skript `r9-a2-mess.mjs` (Kopie
im Worktree gelaufen, da ESM-`import 'playwright'` node_modules im cwd
braucht).

## 1. Seitenkopf (H1 + Ausgabe-Zeile)
**Schon einheitlich — bestätigt per DOM.** H1 32px/25.6px (1440/390),
`font-weight:600`, Display-Sans (Archivo) auf Übersichten/Listen/Rechner/
Suche/Einstellungen, Literata-Serif auf Gesetzes-Leser (Bund+Kanton) und
Vorlagen-Wizard — identisch hell/dunkel, identisch im Split-View
(Artikel+Entscheid). `.ub-ausgabe` byte-gleiche computed styles auf allen
5 Zähler-Routen, hell+dunkel, 1440+390.
Ausnahme (kein Fund): Startseite `/` hat als EINZIGE `<h1>` das
Titelblatt-Wort «Sammlung» (12px, `font-sans text-xs text-ink-500`,
`src/components/start/SuchBlock.tsx:74`) — dokumentierte A11y-Entscheidung
(Kommentar Z. 46/50: «eine `<h1>` bleibt es trotzdem … semantisch»,
`Startseite.tsx:51`), nicht die SeitenTitel-Kaskade. Kein Widerspruch zu
Welle A, nur Präzisierung: die 32-px-Kaskade gilt für 14 von 15 geprüften
Routen, die Startseite hat bewusst eine andere H1-Rolle.

## 2. Sektions-Etikett
**Schon einheitlich, 2 Rezepte statt 1 (beide zentral, kein Fund).** Basis
`.lc-overline` (letter-spacing normal) + Modifier `.lc-overline-soft`
(letter-spacing 0.48px/.04em, `index.css:1308`) — Kommentar dort: ersetzt
«zuvor 3× kopierte `lc-overline normal-case` + Inline letterSpacing».
2 Konsumenten des Soft-Rezepts gemessen: `AllgemeineFristForm.tsx` (Live-
Berechnung-Hinweis) und `vorlagen/ui.tsx:411` (Beispiel-laden-Label) —
identisch hell/dunkel. Kein Fund, weil bereits konsolidiert.

## 3. Datum
Nicht neu am DOM gemessen (Welle-A-Befund methodisch bereits tragfähig:
sichtbarer Output ist byte-gleich, da `.num` seit R1 keine Mono-Familie
trägt). **1 Fund unverändert** (mittel, Code-Hygiene): `EntscheideListe.tsx:41-44`
lokales `deDatum()` statt `datumCh()`/`<Datum>` (`components/ui/Datum.tsx`).

## 4. Zahl/Zähler
**Schon einheitlich — bestätigt per CSS-Quelle + DOM.** Eine Regel:
`.num, .lc-ziffern { font-variant-numeric: lining-nums tabular-nums; }`
(`index.css:1272`, Kommentar Z. 1273f: seit R1-Nachzug keine Mono-Familie
mehr). In allen 62 Kombinationen inkl. Leser-Detailseiten, Split-View,
dunkel greift dieselbe Regel — keine Drift.

## 5. Erlass-Kürzel/Norm-Zitat
**Präzisierung zu Welle A (1 Fund, mittel).** Es gibt NICHT «den EINEN»
`vorlagen/NormChip.tsx` — ein zweites, eigenständiges
`src/components/rechtsprechung/NormChip.tsx` (32 Zeilen, `span
role="button"`, eigene Klick-Filter-Logik, dokumentierte Begründung: im
`<a>`-Karten-Kontext ist weder `<a>` noch `<button>` valide) existiert
daneben. Beide konsumieren aber dieselbe visuelle Basis `.lc-chip`
(`index.css:1790`) — visuell also weiterhin eine Quelle, nur zwei
Interaktions-Wrapper für zwei Strukturkontexte (Leser-Chip = Link,
Karten-Chip = Button). Kein Fund an der Typografie, aber Welle-A-Satz
«läuft durch den EINEN … NormChip.tsx» ist als Datei-Aussage falsifiziert
(2 Dateien) und wird hier korrigiert, nicht stillschweigend übernommen.
Zusätzlich gemessen, NICHT auf Quelle zurückgeführt (offen, mittel):
`.lc-chip` trägt `font-weight:400` auf Leser-Detailseiten (OR/ZH/Entscheid/
Materialie) vs. `font-weight:500` auf Listen-/Übersichtsseiten
(`/rechtsprechung`, `/materialien`, `/rechner`, `/vorlagen`, Wizard-Schritt 1)
— Ursache (Kontext-Selektor vs. `font-medium`-Zusatzklasse) nicht mehr im
Budget dieser Welle ermittelt.

## 6. Entscheid-Zitierung
**NICHT einheitlich — 3 Rezepte gemessen, Welle-A-Hypothese («vermutlich
gleich») widerlegt.**
- Leser-Kopf: `h1.num` (SeitenTitel), 32px/25.6px, `font-weight:600`, Sans,
  `pages/EntscheidLeser.tsx` (Zitierung «BGE 146 III 1»).
- Liste (`/rechtsprechung`, EntscheidKarte): `<span className="num
  font-medium text-brass-700">` bzw. `<span className="num text-ink-500">`
  — gedämpfte Metazeile, `EntscheidKarte.tsx:128,141`.
- Start-Modul (`EntscheideListe.tsx:155-156`): Zitierung im Link-Text OHNE
  `.num`-Klasse (`font-sans font-medium text-body-s text-ink-900`) — trägt
  darum KEIN `tabular-nums`/`lining-nums`, im Unterschied zu den beiden
  anderen Stellen.
- Kopf-Such-Panel: keine Zitierungs-Darstellung im DOM gefunden (Suchfeld
  liefert in dieser Session keine Entscheid-Ergebniszeile mit Zitat-Format)
  — nicht geprüft/nicht erreichbar in dieser Welle.
Schwere: mittel (§5 — dieselbe Fachgrösse «Aktenzeichen/Zitierung», 2 von 3
Stellen mit `.num`, eine ohne). Fix in einem Satz: `EntscheideListe.tsx:156`
`ohneDatumsSuffix(e.zitierung)` in `<span className="num">` wrappen.

## 7. Fussnote
**Schon einheitlich — bestätigt per DOM.** `[data-fn-marker]` 18px Literata,
`font-weight:450`, `font-style:normal`, identische Werte hell/dunkel,
1440/390, Split-View — nur die Farbe invertiert (ink-700↔ink-300-Äquivalent).
Bestätigt Welle A (dort nur Quellcode), kein Fund.

## 8. Randtitel/Marginalie
**Ein Ort, zwei Rezepte nach Breitform/Zeilenform — Ausnahme mit Grund,
kein Fund.** `.lr-blatt` (`ArtikelLeser.tsx`) rendert bei @1440 (Breitform)
kursiv Literata-Serif 13px `font-weight:600` `font-style:italic`
(dokumentierter Auftrag David 6.9.2026, Kommentar Z. 379); bei @390
(Zeilenform, schmale Spalte) Archivo-Sans 13px `font-weight:600`
`font-style:normal` — bestätigt in OR-Leser UND ZH-Leser identisch, hell
+ dunkel, Split-View folgt der Breitform. Bestätigt Welle A («ein Ort»),
präzisiert: die zwei sichtbaren Formen sind CSS-/Breakpoint-gesteuert am
selben Markup, keine zweite Implementierung — kein Fund.
«Modul-Marginalien» (KontextPanel/PanelMaterialien u. ä.): kein zweiter
`.lr-blatt`-Konsument im Quellcode gefunden (grep app-weit) — es existiert
schlicht keine zweite Marginalien-Implementierung zu vergleichen; als
bestätigt (nicht als "nicht geprüft") geführt.

## Nicht geprüft / nicht erreichbar
- Menüs/Popover (Ansicht, Verlauf, Thema, Sprache, Reiter-Blatt, Filter)
  wurden in dieser Welle NICHT geöffnet — Budget ging in die von Welle A
  ungedeckten Flächen (Dark Mode, 390px, Leser-Detailseiten, Split-View).
  Klassen 6/7/8 könnten dort weitere Vorkommen haben (offen).
- Kopf-Such-Panel-Trefferzeile mit Entscheid-Zitierung (Klasse 6) nicht im
  DOM gefunden/erreicht.
- `.lc-chip`-Gewichtsunterschied (Klasse 5, 400 vs. 500) nicht auf
  Datei:Zeile zurückgeführt.
- Vorlagen-Wizard: nur Schritt 1 vermessen (arbeitsvertrag), kein späterer
  Schritt (Zeitbudget).

## Rückgabe siehe Chat.
