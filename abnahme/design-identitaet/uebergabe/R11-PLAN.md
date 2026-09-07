# R11 — Reiterleiste: Bedienbarkeit und Nützlichkeit

Prüfer-Runde 6.9.2026 · Worktree `w2-24-r11` · HEAD `c0f2972ba` (Fixer 1c + «+»-Reiter)
Messstand: `npm run build` grün (63 Routen prerendered), `npx vite preview --port 4362`,
Playwright/Chromium 1440x900 (Desktop) und 390x844 (Mobil).
Skripte: `<scratchpad>/r11/{lib,a,b,c,d,e,f,g,h,i,j}.mjs` · Screens `abnahme/design-identitaet/pruef-r11-01…11.jpg`

Kanzlei-Szenario aller Messungen: **Art. 336c OR · BGE 146 III 1 · OGer AG HOR.2024.19 ·
Rechner ZPO-Fristen · Vorlage Arbeitsvertrag** gleichzeitig offen, Recherche über ~30 Minuten.

---

## 1 · Funktions-Inventar (ausgeführt, nicht angesehen)

Legende Urteil: **+** trägt die Praxis · **o** da, aber schwach · **−** fehlt/schadet.

| # | Funktion | Zustand | Beleg (Messung) | Nützlichkeits-Urteil (Kanzlei) |
|---|---|---|---|---|
| 1 | Öffnen: Navigation ersetzt aktiven Reiter (§5a Ziff. 3) | geht | I3: 5 Reiter vor/nach, `/gesetze/bund/OR#art-336c` → `/gesetze` an Position 1 | **o** — richtig gegen Wildwuchs, aber der Anwalt verliert seinen Artikel-Reiter samt Lesestellung ohne Undo (→ M3) |
| 2 | Browser-Zurück stellt den ersetzten Reiter wieder her | geht | J2: nachBack = `/gesetze/bund/OR#art-336c` an Position 1 | **+** stilles Sicherheitsnetz — aber unbeschriftet, niemand weiss davon |
| 3 | Öffnen: ⌘/Ctrl+Enter im Suchfeld = neuer Reiter (Ziff. 7) | geht | A4: aus 1 Reiter werden 2, Reiter 2 = «BGE 146 III 1» | **+** der schnellste Weg zum zweiten Dokument |
| 4 | Öffnen: Ctrl/⌘-Klick auf einen Inhalts-Link (Ziff. 3) | **anders** | J1: `main a[href^="/gesetze"]` + Control → `browserTabs 1`, App-Reiter 5→5, URL unverändert. Weder App-Reiter noch Browser-Tab | **−** die Spec nennt Ctrl-Klick als Weg zum neuen Reiter; gemessen passiert nichts. *(Einschränkung: headless Chromium; im echten Browser evtl. Browser-Tab)* |
| 5 | Öffnen: «+»-Knopf (D19) | geht | B9: n=4, genau 1 `leer`-Reiter, Route `/` | **+** |
| 6 | Öffnen: Alt+T | geht | B5: Reiter 6 «Neuer Reiter», Fokus landet in `INPUT[type=search]` «Suchen oder Norm springen …»; B5b: zweimal Alt+T ⇒ weiterhin 1 leerer | **+** vorbildlich (Fokus wandert mit) |
| 7 | Schliessen: ✕ | geht | B8: 5 → 4 | **+** |
| 8 | Schliessen: Mittelklick auf den Reiter | geht | B7: `/vorlagen/arbeitsvertrag` weg, 6 → 5 | **+** Browser-Idiom erfüllt |
| 9 | Schliessen: Alt+W | geht, **mit Loch** | C1: 5 → 4, Nachbar wird aktiv. **C1b: mit Fokus im Suchfeld tut Alt+W nichts (5 → 5)**; C1c: Alt+3 im Suchfeld ebenso wirkungslos | **o** — die Sperre für Eingabefelder ist richtig, trifft aber genau die Sekunde nach Alt+T/«+», wo der Fokus dort steht |
| 10 | Wechseln: Klick auf den Reiter | geht | B2: Klick auf Rechner-Reiter → URL `/rechner/zpo-fristen`, Aktiv-Marke wandert | **+** |
| 11 | Wechseln: Alt+1…9 | geht | B3: Alt+1 → OR#art-336c, Alt+3 → HOR.2024.19, Alt+5 → Arbeitsvertrag, Alt+7 (nur 5 Reiter) → keine Wirkung, kein Umlauf | **+** — aber die Ziffer ist **nirgends sichtbar** (nur `sr-only` «Reiter 3: »); wer sie nicht kennt, findet sie nie |
| 12 | Umordnen: Ziehen mit Zeiger, davor/dahinter | geht | E1: `[OR, BGE, HOR, Rechner, Vorlage]` → Ziehen OR auf rechte Hälfte von HOR ⇒ `[BGE, HOR, OR, Rechner, Vorlage]` | **+** genau das Browser-Verhalten |
| 13 | Umordnen ohne Maus: Alt+Shift+←/→ | geht | B4/B4b: OR wandert eins nach rechts und exakt zurück, kein Umlauf am Rand | **+** |
| 14 | Ziehen in die zweite Hälfte ⇒ Fenster auf (Ziff. 4) | geht | F2: Drop bei x = 85 % von `main#inhalt` ⇒ `lexmetrik-panes: ["/rechner/zpo-fristen"]`, Marken ◧ und ◨ erscheinen | **+** starke Funktion |
| 15 | «Daneben öffnen» (⧉) als Klick-Weg | geht | E3: nach ⧉ Panes `["/rechtsprechung/bge_146_III_1"]`, Marken «Fenster links:◧» + «Fenster rechts:◨» | **+** |
| 16 | **Aktiv-/Pane-Marken ◧◨ bei einem Fenster ohne Reiter (P4)** | **fehlt** | G1: `panes = ["/rechtsprechung/bge_146_III_1"]`, `tabs = [OR, Rechner]` ⇒ Leiste zeigt 2 Reiter, **nur EINE Marke** «Fenster links:◧»; rechte Hälfte zeigt nachweislich BGE 146 III 1 (`[data-pane=sekundaer]`-Kopf «Bundesgericht · III · Privatrecht \| BGE 146 III 1»). Screen `pruef-r11-05` | **−** hoch: der Anwalt sieht rechts einen Entscheid, den die Leiste verschweigt — er kann ihn von dort weder wechseln noch schliessen. §5a Ziff. 4 verlangt zwei Marken |
| 17 | Überlauf «+N» (Ziff. 5), nie stilles Schliessen | geht | E0/D2b: 12 Reiter ⇒ 8 sichtbar, Knopf «+4», `aria-label="Alle 12 offenen Reiter"`. D2c: aktiver 12. Reiter rückt auf Platz 8 und ist im Bild | **+** die Kappungs-Regel ist sauber |
| 18 | Blatt mit Suche | geht | D3: «zgb» filtert auf Gruppe «Gesetze 1 / Bund 1 / ZGB» + ▲▼⧉✕, «Alle schliessen» am Fuss; Leerzustand mit «Filter leeren» vorhanden | **+** |
| 19 | Kurzform Gesetz mit/ohne Artikel (Ziff. 2) | geht | I1: `Art. 336c OR` (124 px) · `ZGB` (93 px); nach 4000 px Scrollen unverändert (D1b — F5-Fix hält) | **+** |
| 20 | Kurzform Entscheid BGE / kantonal | geht | I1: `BGE 146 III 1` (145 px) · `OGer AG HOR.2024.19` (211 px), Geschäftsnummer ungekürzt (F6) | **+** |
| 21 | Kurzform Rechner | **anders** | I1: `Verfahrens- & Rechtsmittelfristen`, **268 px = breitester Reiter der Leiste** (19 % von 1440) | **o** — frisst den Platz von zwei Gesetzes-Reitern; der Katalog-Name ist keine Kurzform |
| 22 | Kurzform Vorlage / Bereichs-Übersicht | geht | I1: `Arbeitsvertrag` (151 px) · `Gesetze` (115 px) | **+** |
| 23 | **Reiter für eine Materialie** | **fehlt** | J3: Aufruf `/materialien/BJ-EHRA-PM-2025-01` (H1 «Praxismitteilung EHRA 1/25») ⇒ Leiste bleibt bei 5 Reitern, kein sechster. Ursache: `src/lib/tabs.ts:istReiterPfad` — Regex `^\/(rechner\|vorlagen\|gesetze\|rechtsprechung)\/.+` **ohne `materialien`** | **−** hoch: 1'561 prerenderte Material-Detailseiten sind reiterlos. Wer eine Botschaft nachschlägt, verliert sie beim nächsten Klick |
| 24 | Beschriftung einer Materialie, wenn doch im Speicher | **defekt** | I1: Reiter heisst **«Material öffnen»** (Aufforderung statt Name). Ursache: `Reiterleiste.tsx:185–198` lädt nur Gesetz- und Entscheid-Manifest, `verlaufLabel.ts:91` fällt auf `'Material öffnen'` zurück | **−** |
| 25 | Beschriftung bei nicht-kanonischem Erlass-Pfad | **defekt** | D2: `/gesetze/bund/StGB` (kanonisch `STGB`) ⇒ Reiter «Gesetz öffnen» (`verlaufLabel.ts:79`). Mit `STGB` korrekt «StGB» (E0). `kanonisierePfad` läuft in `usePaneLayout`, aber nicht im Reiter-Speicher | **o** niedrig — trifft alte Lesezeichen/geteilte Links |
| 26 | Registerfarben-Strich je Domäne | **anders** | I1/J5: **nur der aktive Reiter** trägt Registerfarbe (Gesetz `rgb(29,78,137)`, Entscheid `rgb(122,31,43)`) plus 10 %-Tönung. Alle inaktiven: `rgb(141,136,126)` @ `opacity 0.3` — identisch für Gesetz, Entscheid, Rechner, Vorlage, Übersicht. Screen `pruef-r11-10` | **o** — bewusster F9-Entscheid, kostet aber genau die Wiedererkennung, für die §5a Ziff. 2 die Farbe vorsieht |
| 27 | Zwei Instanzen desselben Erlasses | geht | H1/H2: `[…/OR#art-336c, …/OR?r=2#art-266g]` ⇒ zwei Reiter «Art. 336c OR» und «Art. 266g OR», Klick auf den zweiten führt auf `/gesetze/bund/OR?r=2#art-266g` | **+** — aber bei **gleichem** Artikel (H3) heissen beide identisch «Art. 336c OR», auch der `title` |
| 28 | «⧉ In neuem Fenster» im Leser-Kopf | **Wort ≠ Wirkung** | H3: Klick ⇒ `panes: []`, `[data-pane]`-Spalten: **keine**; stattdessen zweiter Reiter `/gesetze/bund/OR?r=2`. `ReiterAktion.tsx:51–53` ruft `naechsteInstanz` + `merkeTab` + `navigate`, nie `oeffneDaneben`. Tooltip behauptet «in einem zweiten Fenster öffnen» | **−** mittel: seit R2 heissen die Panes messbar «Fenster links/rechts» (`title`-Attribut) — dasselbe Wort für zwei Sachen. Screen `pruef-r11-09` |
| 29 | Persistenz der Reiter über Neustart | geht | D1c: nach `reload` alle 5 Reiter mit Beschriftung da | **+** |
| 30 | Lesestellung (Ziff. 6) | geht, **teilweise** | D1: Speicher trägt `/gesetze/bund/OR#art-9` neben `wahl: "#art-336c"`. D1c: nach `reload` `scrollY = 0`, URL ohne Hash — die Stellung wirkt nur beim **Klick auf den Reiter**, nicht beim Neuladen derselben Adresse | **o** |
| 31 | Rechner-Eingaben beim Schliessen | geht (kein Verlust) | G3: URL wird `?e=2025-01-15&u=tage&l=30&v=ordentlich&k=ZH&…`, und genau dieser volle Pfad steht im Reiter-Speicher. G3b: ✕ ohne Warndialog (`role=alertdialog`: 0) | **+** Zustand liegt in der Adresse ⇒ **keine Schliess-Warnung nötig**, aber eine Wiederherstellung (M3) ist der richtige Ersatz |
| 32 | Mobil @390: Streifen + Blatt (Ziff. 8) | geht | F3: `scrollWidth 818 / clientWidth 253`, alle 5 Reiter im Streifen, Knopf «5 offen» sichtbar, «+» 36 px sichtbar, Blatt 352 px breit. Screens `pruef-r11-06/07` | **o** — 253 px nutzbarer Streifen; «+» und «5 offen» nehmen ~25 % der Zeile |
| 33 | Mausrad über der Leiste | **fehlt** | F3b @390 (echter Überlauf): vertikales Rad `wheel(0,300)` ⇒ `scrollLeft` bleibt **0**; nur waagrechtes `wheel(300,0)` ⇒ 300. E0c @760: vertikales Rad scrollt stattdessen die Seite (`scrollY 400`) | **−** eine Maus ohne Querrad erreicht die hinteren Reiter nie durch Rollen |
| 34 | Doppelklick auf den freien Leistenbereich | **fehlt** | C3: 457 px Leerraum rechts des letzten Reiters gemessen; Doppelklick dort ⇒ Reiterzahl 5 → 5 | **−** klein, aber das ist die Fläche, auf die man im Browser doppelklickt |
| 35 | Kontextmenü auf einem Reiter | **fehlt** | C2: Rechtsklick ⇒ `[role=menu]` 0 vorher und nachher, kein `oncontextmenu` am Reiter | **−** hoch für 30-Minuten-Recherche: kein «alle anderen schliessen», kein «duplizieren», kein «rechts schliessen» |
| 36 | Anheften (Kürzel-Reiter links, Ziff. 5) | **fehlt** | Kein `fest`/`pin`-Feld in `src/lib/tabs.ts:TabEintrag` (Felder: `path`, `label`, `wahl`, `leer`) | **−** OR/ZGB/ZPO wandern bei jedem Umordnen mit |
| 37 | «Zuletzt geschlossen» | **fehlt** | G4: Alt+Shift+T ⇒ Reiterliste unverändert. G4c: `localStorage`-Schlüssel = `lexmetrik-seitenleiste-breite`, `lexmetrik-zuletzt` (2 Einträge), `lexmetrik-tabs`, `lexmetrik-panes`, `lexmetrik.locale` — ein Schliess-Ring existiert nicht | **−** hoch, weil §5a Ziff. 3 (Ersetzen) das Verlieren zum Alltag macht |
| 38 | Arbeitsmappe speichern/öffnen/teilen (Ziff. 9) | **fehlt** | Kein Speicher-Schlüssel, kein UI-Element; nur der Fenster-Permalink `?p=` existiert (`usePaneLayout.layoutPermalink`) | **−** eigener Schritt (L), nicht R11 |
| 39 | Tastatur-Reihenfolge | geht, **teuer** | C5/D0: erster Tab = «Zum Inhalt springen» (Skip-Link intakt). D0b: 6 Kopf-Elemente, dann die Reiter; **je Reiter 3 Halte** (Knopf, ⧉, ✕) ⇒ 5 Reiter = 15 Halte, 12 Reiter = bis 36, bevor die Seitenleiste kommt | **o** — WCAG erfüllt, praktisch zäh; ein Browser macht die Leiste zu **einem** Halt mit Pfeiltasten |
| 40 | Screenreader-Namen | geht | `nav aria-label="Offene Reiter"`; je Reiter `sr-only` «Reiter N: », `aria-current="page"`, «(Fenster links)»; ✕ «Reiter «Art. 336c OR» schliessen»; Blatt `role=dialog aria-label="Alle geöffneten Reiter"`, Trigger `aria-haspopup/aria-expanded` | **+** |
| 41 | Tooltip-Inhalt | **anders** | I4: `title` = «OR — gelesen bis Art. 336c» · «Obergericht AG HOR.2024.19 vom 12.12.2025» · «Verfahrens- & Rechtsmittelfristen» — **nirgends ein Stand**, obwohl die Ausgabe-Zeile direkt darunter «Gesetze Stand 02.09.2026 · Entscheide 08.07.2026» zeigt (Screen `pruef-r11-10`) | **o** — §7/D1 wollen den Stand am Rechtswert; der Reiter ist die Stelle, an der man ihn sucht |
| 42 | Trefferflächen / Geometrie | geht | I5: Leiste 34 px, ✕ 24×24 (WCAG 2.5.8 AA-Untergrenze exakt, begründete Ausnahme im Code), «+» 36×33 | **o** |

**Zählung:** 42 geprüfte Funktionen — **21 geht** · **10 fehlt/defekt** (⌘-Klick, P4-Marke, Materialien-Reiter, Materialien-Name, Mausrad, Doppelklick, Kontextmenü, Anheften, Zuletzt-geschlossen, Arbeitsmappe) · **11 anders/schwach**.

### Nicht geprüft (offen deklariert, §14.7)
- Echter Screenreader (VoiceOver/NVDA) — nur Accessible Names im DOM gemessen.
- Touch-Wischen auf dem Streifen (@390 nur mit Maus-Rad-Ereignissen gemessen).
- Ziehen mit **echtem** Zeiger: die Drag-Messungen (E1/F2) lösen `DragEvent` synthetisch aus; Chromium-DnD über `mouse.down/move` liess sich in dieser Runde nicht stabil fahren.
- Firefox/Safari (nur Chromium).
- Ctrl-Klick im **echten** Browser (headless-Verhalten kann abweichen) — Befund #4 ist insoweit unvollständig.
- Zusammenspiel mit dem Druck (`print:hidden` steht an der `<nav>`, nicht ausgeführt).

---

## 2 · Optimierungsplan — 8 Massnahmen

Reihenfolge = Bauempfehlung. Aufwand S = < 60 Zeilen an ≤ 2 Dateien, M = mehrere Dateien
oder neuer Speicher-Zustand, L = eigener Schritt.

### M1 — Das zweite Fenster bekommt seinen Reiter und seine Marke (P4)
- **Ziel:** Jeder Pfad, der in einem Fenster steht, hat einen Reiter in der Leiste; beide Marken ◧◨ sind immer sichtbar. Aus der Leiste heraus wechseln und schliessen wie beim linken.
- **Anker:** §5a Ziff. 4 («die Leiste zeigt, welcher Reiter links/rechts steht, zwei Aktiv-Marken») · Prüfbefund P4 (R6) · Inventar #16, Screen `pruef-r11-05`.
- **Dateien:** `src/components/layout/Shell.tsx` (`paneSteuerung.oeffneDaneben` / `usePaneDnd`-Pfad ⇒ zusätzlich `merkeTab(pfad)`), ggf. `src/components/layout/usePaneLayout.ts` (`oeffneDaneben`), `src/lib/tabs.ts` (nur lesend). **Nicht** in `Reiterleiste.tsx` lösen — die Leiste zeichnet nur, was der Speicher trägt (D16).
- **Aufwand:** S–M.
- **Wächter:** `e2e/w224-r11-pane-reiter.e2e.ts` — `localStorage` mit `tabs=[OR]`, `panes=[bge_146_III_1]` seeden, Seite laden, erwarten: 2 Reiter, 2 Elemente `span[title^="Fenster"]` mit ◧ und ◨. **Rot-Probe:** Wächter gegen HEAD `c0f2972ba` laufen lassen — er misst dort 1 Marke.
- **Risiko:** Reiter-Wildwuchs, wenn `merkeTab` bei jedem Pane-Re-Render feuert (`merkeTab` ist idempotent per `gleich()` — belegen, nicht annehmen). Ein aus dem Fenster geschlossener Reiter darf das Fenster nicht verwaisen lassen: Schliessen des Reiters muss das Pane mitschliessen, sonst entsteht genau P4 rückwärts.

### M2 — Materialien werden reiterfähig und tragen ihren Namen
- **Ziel:** `/materialien/<key>` erzeugt einen Reiter mit dem echten Titel («Praxismitteilung EHRA 1/25»), nie «Material öffnen».
- **Anker:** §5a Ziff. 2 · D7-Regel («die fünf Bereichs-Übersichten sind Reiter wie jedes andere Dokument» — ihre Detailseiten erst recht) · Inventar #23/#24.
- **Dateien:** `src/lib/tabs.ts:istReiterPfad` (Regex um `materialien` ergänzen), `src/components/layout/Reiterleiste.tsx:185–198` (drittes Manifest `lib/materialien/browse` lazy laden, gleiche `brauchtX`-Bedingung), `src/lib/tabGruppen.ts` **muss nachziehen** — gemessen: die Datei enthält null Treffer für «materialien», `KAT_ORDER` ist `['gesetze','rechtsprechung','vorlagen','rechner','sonstiges']` (`tabGruppen.ts:31`); ohne eine eigene Kategorie landen Materialien im Blatt unter «Sonstiges».
- **Aufwand:** S.
- **Wächter:** `e2e` — `/materialien/BJ-EHRA-PM-2025-01` aufrufen, erwarten: Reiter existiert **und** Beschriftung ≠ `Material öffnen`. **Rot-Probe:** heute misst der Test 0 Reiter (J3).
- **Risiko:** Das Materialien-Manifest ist ein weiterer Lazy-Download in der Kopfzone — nur laden, wenn ein Material-Reiter offen ist (Muster der bestehenden zwei), und `check:perf-budget` messen (§15).

### M3 — «Zuletzt geschlossen» wiederherstellen (Alt+Shift+T + Zeile im Blatt)
- **Ziel:** Der letzte geschlossene **oder ersetzte** Reiter kommt an seiner alten Position zurück; Ring über die letzten ~10, ohne Zeitstempel.
- **Anker:** §5a Ziff. 6 («zuletzt geschlossen aus dem Verlauf») · Inventar #1/#31/#37. Praxis-Begründung: weil eine gewöhnliche Navigation den Reiter **ersetzt** (I3), ist der Verlust hier häufiger als im Browser; Rechner-Eingaben liegen zwar in der Adresse (G3) und sind damit wiederherstellbar — genau deshalb braucht es die Wiederherstellung statt einer Schliess-Warnung.
- **Dateien:** `src/lib/tabs.ts` (Ring `lexmetrik-tabs-zu`, gefüllt in `schliesseTab`/`leereTabs`/`ersetzeTab`, Funktion `stelleLetztenWiederHer()` mit Index), `src/components/layout/Reiterleiste.tsx` (Alt+Shift+T im bestehenden `onKey`; Zeile «Zuletzt geschlossen: …» im Blatt über «Alle schliessen»).
- **Aufwand:** M.
- **Wächter:** Unit auf `lib/tabs` (schliessen an Position 2 ⇒ Wiederherstellung an Position 2, nicht am Ende) + `e2e` (✕, Alt+Shift+T, Reiter zurück). **Rot-Probe:** heute unverändert (G4).
- **Risiko:** §5 — kein zweiter Reiter-Speicher, der auseinanderdriftet; der Ring hält nur Pfade und wird beim Wiederherstellen geleert. Berufsgeheimnis: nur Pfade, nie Formularinhalte — Rechner-Adressen tragen aber Falldaten (`?e=2025-01-15&k=ZH`), also **dieselbe Grenze wie `lexmetrik-tabs` heute** ausdrücklich prüfen und im Kommentar festhalten.

### M4 — Reiter-Kontextmenü (Rechtsklick)
- **Ziel:** Rechtsklick auf einen Reiter öffnet ein Menü: *Daneben öffnen · Duplizieren · Schliessen · Alle anderen schliessen · Rechts davon schliessen* (Anheften erst mit M5).
- **Anker:** §5a Ziff. 4 + Praxis-Liste R11 · Inventar #35. Kanzlei-Fall: nach 30 Minuten stehen 9 Reiter, davon 6 Sackgassen — heute nur 9 Einzelklicks oder «Alle schliessen».
- **Dateien:** neu `src/components/layout/ReiterMenue.tsx` (Portal + `useDialogFokus`, Muster des Überlauf-Blatts), `src/components/layout/Reiterleiste.tsx` (`onContextMenu` am Reiter), `src/lib/tabs.ts` (`schliesseAndere(path)`, `schliesseRechtsVon(path)` — reine Array-Filter, deterministisch).
- **Aufwand:** M.
- **Wächter:** Unit auf die zwei neuen `lib/tabs`-Funktionen (Reihenfolge und Verbleib exakt) + `e2e` (Rechtsklick ⇒ `role=menu`, «Alle anderen schliessen» ⇒ 1 Reiter). **Rot-Probe:** heute `[role=menu]` = 0 (C2).
- **Risiko:** Das Browser-Kontextmenü wird unterdrückt — nur über dem Reiter, nie über der Leiste insgesamt; Escape und Klick-ausserhalb müssen schliessen (Fokusfalle vermeiden, `useDialogFokus` besteht schon). §3: die Menü-Aktionen dürfen keine Rechtslogik berühren.

### M5 — Anheften als Kürzel-Reiter links
- **Ziel:** OR/ZGB/ZPO lassen sich anheften: schmaler Reiter nur mit Kürzel, ganz links, ohne ✕, überlebt «Alle schliessen».
- **Anker:** §5a Ziff. 5 (bisher unerfüllt) · Inventar #36.
- **Dateien:** `src/lib/tabs.ts` (`TabEintrag.fest?: boolean`, `hefteAn`/`loeseAb` **verschieben den Eintrag im flachen Speicher nach vorn**), `src/components/layout/Reiterleiste.tsx` (schmale Darstellung, kein ✕, ✕ nur im Kontextmenü), `src/components/layout/TabPanel.tsx` (Zustand anzeigen).
- **Aufwand:** M.
- **Wächter:** Unit (Anheften ⇒ Position 0; `leereTabs` lässt feste stehen) + `e2e`. **Rot-Probe:** kein `fest`-Feld auf HEAD.
- **Risiko: der D16-Konflikt.** Fixer 1c hat gerade jede Anzeige-Gruppierung entfernt, weil sie das Ziehen einsammelte («es geht nur wenn nur gesetze offen sind — bug», `e2e/w224-reiter-umordnen-d16`). Anheften darf deshalb **keine zweite Anzeige-Ordnung** sein, sondern muss den Speicher umsortieren; das Ziehen eines freien Reiters vor einen festen muss dann verhindert (nicht stillschweigend korrigiert) werden. Ohne diese Auflage ist M5 ein D16-Rückfall — im Zweifel zurückstellen.

### M6 — Mausrad rollt die Leiste, Doppelklick auf den Leerraum öffnet einen Reiter
- **Ziel:** Vertikales Mausrad über der Leiste scrollt sie waagrecht (nur wenn sie überläuft); Doppelklick auf die leere Fläche des Streifens = «+».
- **Anker:** §5a Ziff. 8 (waagrecht scrollbar) + Praxis-Liste · Inventar #33/#34 (gemessen: 457 px ungenutzte Fläche; `scrollLeft` bleibt 0 bei `wheel(0,300)`).
- **Dateien:** `src/components/layout/Reiterleiste.tsx` (ein `onWheel` und ein `onDoubleClick` am `[data-reiter-streifen]`-Container).
- **Aufwand:** S (beide zusammen).
- **Wächter:** `e2e` @390 mit 5 Reitern: `wheel(0,300)` ⇒ `scrollLeft > 0`; Doppelklick rechts des letzten Reiters ⇒ Reiterzahl +1. **Rot-Probe:** heute 0 bzw. ±0 (F3b/C3).
- **Risiko:** `preventDefault` nur bei echtem Überlauf, sonst kann man die Seite mit dem Zeiger über der klebenden Leiste nicht mehr scrollen (heute scrollt sie, gemessen `scrollY 400`). Doppelklick darf nicht feuern, wenn das Ereignis von einem Reiter aufsteigt (`e.target === e.currentTarget`).

### M7 — Der Reiter sagt Titel **und** Stand; Rechner bekommen eine Kurzform
- **Ziel:** (a) `title` = voller Titel + Stand, z. B. «Obligationenrecht (OR) — Stand 02.09.2026 — gelesen bis Art. 336c»; (b) Rechner-Reiter tragen eine Kurzform aus dem Katalog («ZPO-Fristen» statt «Verfahrens- & Rechtsmittelfristen», 268 → ~110 px).
- **Anker:** §5a Ziff. 2 · §7/D1 (jeder Rechtswert mit Norm, Link, **Stand**) · Inventar #21/#41.
- **Dateien:** `src/components/layout/Reiterleiste.tsx` (`kurzform`/`titel`), `src/lib/startseiteConfig.ts` bzw. die Katalog-Quelle des Rechners für ein Feld `kurz` (§5: **eine** Quelle, keine zweite Tabelle in der Leiste), Stand aus derselben Quelle wie `ui/KorpusStand`/`AusgabeZeile`.
- **Aufwand:** S–M.
- **Wächter:** Unit auf die Kurzform-Funktion (Rechner mit langem Namen ⇒ Kurzform; unbekannter Rechner ⇒ voller Name, **nie geraten**, §7) + `check:design-tokens`-nahe Sonde auf die maximale Reiterbreite. **Rot-Probe:** heute 268 px / kein Stand im `title`.
- **Risiko:** §7 — der Stand darf nur aus dem Manifest kommen, das ihn führt; fehlt er, bleibt der `title` ohne Stand (kein Platzhalter, keine Schätzung). Eine zweite Kurzform-Tabelle in der Darstellungsschicht wäre ein §5-Verstoss.

### M8 — «⧉ In neuem Fenster» in Deckung mit seiner Wirkung bringen
- **Ziel:** Entweder der Knopf öffnet wirklich das zweite Fenster (`oeffneDaneben`, dann heisst er richtig), oder er heisst nach dem, was er tut («Zweite Ansicht als Reiter»). Empfehlung: **Fenster öffnen, wenn `kannOeffnen`; sonst zweiter Reiter mit passendem Wort.** Zusätzlich: zwei Reiter derselben Norm auf demselben Artikel müssen unterscheidbar sein (H3: beide «Art. 336c OR», gleicher `title`).
- **Anker:** Inventar #28/#27 · Design-Glossar Ä118 (18.8.2026) — der Beleg bleibt gültig für seinen Stand: damals gab es keine Reiterleiste und «Fenster» war frei. **Seit R2/§5a Ziff. 4 trägt die Leiste messbar `title="Fenster links"`/`"Fenster rechts"` für die Panes** — das Wort ist seither belegt, der Knopf öffnet aber gemessen kein Pane (`panes: []`, `[data-pane]`: keine Spalten).
- **Dateien:** `src/pages/gesetz-leser/v3/ReiterAktion.tsx:50–57`, `src/tests/leser-benennung.test.ts:181–182` (verbietet heute ausdrücklich «In neuem Reiter» und **zementiert damit das falsche Wort**), ggf. `Reiterleiste.tsx` (Instanz-Ziffer «(2)» in Kurzform oder `title`).
- **Aufwand:** S.
- **Wächter:** Der bestehende Benennungs-Test wird angepasst — **deklarierte fachliche Änderung, kein Refactoring** (§6.3): eigener Commit mit Begründung. Neu: `e2e` — Klick auf den Knopf ⇒ entweder `[data-pane]`-Spalten = 2, oder Knopfwort enthält «Reiter».
- **Risiko:** gering technisch, aber es ist ein **Sprach-Entscheid** — «Fenster» vs. «Reiter» gehört ins Design-Glossar und damit vor Davids Auge, bevor gebaut wird.

---

## 3 · Bewusst NICHT im Plan (Begründung)
- **Registerfarbe auch für inaktive Reiter** (#26): F9 hat die heutige Regel am 6.9.2026 gemessen entschieden («aktiv `paper-raised` gegen `paper` = 4 Einheiten»); eine Rücknahme schwächt die Aktiv-Marke und ist ein Ästhetik-Entscheid für David, kein Prüfer-Auftrag.
- **Arbeitsmappe (§5a Ziff. 9)** (#38): eigener Schritt, Aufwand L (Speichern/Öffnen/Teilen + Namensgebung + `?p=`-Erweiterung).
- **Roving-Tabindex für die Leiste** (#39): würde 3 Halte je Reiter auf 1 senken, ändert aber das Fokus-Modell der ganzen Kopfzone — eigener a11y-Schritt mit `e2e/a11y.e2e.ts`-Nachzug, nicht neben sieben anderen Massnahmen.
- **Schliess-Warnung bei Rechner-Eingaben:** gemessen unnötig — der Zustand liegt vollständig in der Adresse (G3), M3 deckt den Fall.
- **Domänen-Gruppierung in der Leiste:** Fixer 1c hat sie eben aus gemessenem Grund entfernt (D16).
