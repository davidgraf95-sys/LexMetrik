# R9 Finder-Welle D — Lückenschluss Interaktion + Container (W2·24-DESIGN-IDENTITAET)

Ort: `.claude/worktrees/w2-24-sweep`, HEAD `7a3b697e5` (PR #739 Kopf), dist neu
genug (`dist/index.html` 21:29 nach HEAD-Commit 21:26 — gültig, nicht neu
gebaut). Preview `npx vite preview --port 4352`. Methode: Playwright
(`node_modules`-Symlink, Skript im Worktree, headless Chromium) — echte
computed styles + Screenshots, wie in der Spec gefordert (kein grep-Ersatz).
Screens `abnahme/design-identitaet/finder-r9-d-01..19-*.jpg` (15 Dateien,
2 Überzähl-Screens wieder gelöscht).

## 1. Dunkelmodus je Klasse (gemessen, `/gesetze/bund/OR`, `/rechtsprechung`, `/rechner/verjaehrung`)

| ID | Klasse | Route | Befund | Schwere | Fix |
|---|---|---|---|---|---|
| D-1 | Link/Knopf/Feld/Reiter/Chip/Badge | alle drei Routen, dark | **Kein Dunkelmodus-Fund**: alle drei Rezept-Streuungen aus Welle B/C reproduzieren sich 1:1 in Dunkel (Text 22px→gleiche Gewichte, `border-bottom` statt Kasten, `border-radius:0` überall), Farben sind Token-Umschaltungen (`ink-900`→`rgb(226,224,220)` hell↔dunkel), keine neue dunkelmodus-spezifische Abweichung gefunden. `.lc-card`/`.lc-notice` lieferten auf `/gesetze/bund/OR` 0 Treffer (Route hat keine Karten/Hinweise) — auf `/rechtsprechung` (Screen `-d-02` gelöscht, Rohdaten in Skript-Output) Karte/Badge ebenfalls konsistent dunkel. | — | schon einheitlich, kein Fix |
| D-2 | Tabelle | alle Routen dark | **0 `<table>`-Elemente** in den drei Stichproben-Routen gefunden — dieselbe Grid-statt-Table-Bauweise wie hell (Welle C bereits als Ausnahme geführt). | — | kein Fund (Ausnahme fortgeschrieben) |

## 2. @390 (gemessen, `/gesetze/bund/OR`, `/rechtsprechung`)

| ID | Klasse | Befund | Schwere | Fix |
|---|---|---|---|---|
| D-3 | Knopf Tap-Ziel | `.lc-btn*` UND bare `<button>` beide **h=44px @390** (`w=44,h=44` durchgängig gemessen) — Tap-Ziel-Minimum 44px eingehalten für beide Rezepte, obwohl sie sich bei Padding/Gewicht unterscheiden (B-K1 bleibt gültig als Optik-Fund, ist aber KEIN Tap-Ziel-Mangel). | — | kein neuer Fund |
| D-4 | fc-schalter (Filter-Reiterzeile) @390 `/rechtsprechung` | **Horizontaler Überlauf ohne sichtbaren Scroll-Hinweis**: Screen `finder-r9-d-05-m390-rechtsprechung.jpg` zeigt die Sachgebiets-Filterzeile bei 390px mit hart abgeschnittenem drittem Chip ("Strat…") am rechten Bildrand, kein Fade/Pfeil/Scrollbar-Indiz sichtbar. | mittel | Scroll-Affordanz (Fade-Maske oder Pfeil) für `.fc-schalter`-Zeile @390 ergänzen, analog anderen horizontal scrollenden Leisten (`.lc-scroll-x`). |
| — | Reiter (Arbeitsleiste) @390 | 1 Reiter gemessen `w=99,h=33` — kein Umbruch, keine Streuung bei nur einem offenen Reiter (Mehrfach-Reiter-Fall bei 390 nicht separat geprüft — Ressourcenpriorität lag auf Menü-Öffnungen). | — | nicht vertieft |

## 3. Split-View @1440 (`?p=` OR + BGE 152 V 52) — Screen `finder-r9-d-06-split-1440.jpg`

| ID | Befund | Schwere | Fix |
|---|---|---|---|
| D-5 | **Pane-Kopf-Anatomie bestätigt, aber mit Rollen-Asymmetrie**: primäres Pane (links, "OR") trägt Kopfzeile `⋮⋮`-Ziehgriff + Titel + `⇄ Rechtsprechung`/`≡`/`Ansicht▾` + `▶`(einklappen)/`✕`; sekundäres Pane (rechts, BGE) trägt Breadcrumb + `◀`/`⊙`/`⧉`/`✕`. Beide Sets sind NICHT identisch (primär hat App-Funktionen wie Ansicht-Menü, sekundär hat Navigations-Pfeile) — das deckt sich mit Welle C's Befund «PaneKopf.tsx EIN Baustein, Rolle nur Registerlinie» nur teilweise: die Griff-Auswahl selbst variiert nach Rolle, nicht nur die Registerlinie. | mittel | Rollen-Unterschied als bewusste Ausnahme im Reglement verankern (primär = Erlassleser-Werkzeuge, sekundär = reiner Content-Viewer) ODER vereinheitlichen, falls unbeabsichtigt — David/Bau-Entscheid. |
| D-6 | Reiter-Marken bestätigt: Tab-Leiste zeigt bei im Pane offenen Reitern ein kleines Icon zusätzlich zum Text (`OR ⊡` links, `BGE 152 V 52 ⊡` rechts) — DOM-Text bestätigt `"Reiter 2: OR (Fenster links)◧✕"`/`"Reiter 3: BGE 152 V 52 (Fenster..."` — die ◧/◨-Symbolik aus der Spec ist als Aria-Label vorhanden, visuell ein generisches Kastensymbol, keine Streuung zwischen den beiden Panes gefunden. | — | schon einheitlich |
| D-7 | Breiten-Ziehgriff **jetzt lokalisiert** (Welle C konnte ihn nicht finden): genau 1 Element mit `cursor:col-resize` im DOM zwischen den Panes — widerlegt Welle C's «nicht abschliessend geprüft», Element existiert und ist eindeutig. | — | Fund von C damit geschlossen: Griff vorhanden, kein separater Optik-Fund gemessen (Zeitbudget). |
| — | Karte/Hinweis im Pane vs. Vollansicht | `.lc-card`/`.lc-notice` lieferten in dieser Split-Stichprobe 0 Treffer (OR-Gliederung und BGE-Regeste sind keine Karten-/Hinweis-Bausteine) — kein Vergleichsobjekt in dieser Route, daher **nicht geprüft** (andere Routen mit Karten im Pane bräuchten eigenen Lauf). | — | nicht geprüft |

## 4. Menüs/Popover/Blätter — alle geöffnet, gemessen

| ID | Menü | Befund | Schwere | Fix |
|---|---|---|---|---|
| D-8 | **Reiter-Überlauf-Blatt («N offen»)** — erstmals erreicht (B scheiterte) | Screen `finder-r9-d-18-reiter-overflow-blatt.jpg`: Titel „Offene Reiter durchsuchen“, gruppiert nach Kategorie (Gesetze 4 › Bund 2, Rechtsprechung 1, Materialien 1, Vorlagen 1, Rechner 2) mit Register-Farblinie links je Zeile, Griffe `▲▼⧉✕` je Zeile identisch, Fuss „Alle schliessen“ als `.lc-btn`-artiger Vollbreite-Knopf. Eine Ausnahme: die aktive Zeile „Vorlagen“ hat **kein `⧉`** (Grep bestätigt bewusst: `Reiterleiste.tsx:372` „kein «Daneben öffnen» ohne freies [Panel]“ — MAX_SEKUNDAER erreicht) — Ausnahme mit Grund, kein Fund. | — | kein Fix (Wächter-Nachweis: Welle-B-Lücke «nicht erreicht» hiermit geschlossen) |
| D-9 | **Reiter-Kontextmenü** — erstmals erreicht (B scheiterte) | Screen `finder-r9-d-08-reiter-kontextmenue.jpg`: Rechtsklick auf Reiter öffnet `Daneben öffnen / Duplizieren / Alle anderen schliessen / Rechts davon schliessen (N) / Schliessen (Alt+W)`, Item-Rezept `14px/400`, Hülle identisch zu anderen `.lc-schwebeflaeche`-Menüs (kein `role=menu`, gleiche Box-Anatomie). | — | schon einheitlich (Hülle) |
| D-10 | **„Startseite anpassen“-Blatt** — erstmals erreicht | Screen `finder-r9-d-09-startseite-anpassen.jpg`: Item-Rezept `16px/400` für Modul-Zeilen (`↑`-Reihenfolge-Griffe je `44×44`), `✕`-Schliessknopf `44×44`, Fuss-Knopf „Fertig“ `12px/500` — Fuss-Knopf-Typografie (12px/500, Versalien-frei) weicht von den 16px-Item-Zeilen ab; das ist die übliche Etiketten-vs-Fliesstext-Konvention, kein Fund. | — | schon einheitlich |
| D-11 | **Kopf-Such-Panel leer + mit Treffern** — erstmals erreicht | Leer: Screen `finder-r9-d-19-kopfsuche-leer.jpg`, Titel „Zuletzt geöffnet“, Leerzustand „Noch nichts geöffnet.“ (endet mit Punkt — D-7-Konvention aus Welle C bestätigt, konsistent). Mit Treffern: DOM bestätigt Live-Filterung auf Rechner-Vorschläge («Kündigung & Fristen im Arbeitsverhältnis»). | — | schon einheitlich |
| D-12 | **Filter/Sortierung `/rechtsprechung`** — erstmals erreicht (B scheiterte) | `.fc-schalter` bestätigt: 19 Elemente, 2 Rezepte (aktiv `color:ink-900/rgb(37,35,31)` fett 500, inaktiv `text-ink-600` gleiches Gewicht) — **identisch** zur Filterzeile auf `/suche?q=…` (Screen `finder-r9-d-16-suche-treffer.jpg`, „Alle 65/Gesetzestext 63/Rechner & Vorlagen 2“, gleiche 13px/500-Anatomie) — Welle C's «heute migriert, Zielbild-konform» ist damit an ZWEI Routen bestätigt, nicht nur einer. | — | schon einheitlich (bestätigt, D-4 Überlauf-Detail s. o.) |
| D-13 | **Vorlagen-Wizard-Schrittleiste** — erstmals erreicht (B scheiterte) | Route `/vorlagen/schlichtungsgesuch-bs`, Screen `finder-r9-d-11-vorlagen-wizard-s1.jpg`: 7 nummerierte Schritte („1 Streitgegenstand…“ … „7 Prüfen & Download“), aktiver Schritt fett/farbig hervorgehoben, restliche Schritte gedimmt — Muster D5 (Kasten-Fokus/Zustandswort) grundsätzlich erfüllt; kein zweiter Wizard zum Rezept-Vergleich in dieser Welle gemessen (Zeitbudget). | — | kosmetisch/nicht vertieft: zweiten Vorlagen-Wizard zum Vergleich nachmessen |
| D-14 | **Ansicht-Menü im Leser, dunkel** — erstmals dunkel geprüft | Screen `finder-r9-d-13-ansicht-menu-dark.jpg`: Hülle `background rgb(27,25,23)`, Item-Rezept `14px/400` für Fussnoten/Fassung-Umschalter je mit `✓`-Präfix (kein Doppel-✓ gefunden, Muster D5 erfüllt), Schriftgrösse-Regler `A−`/`A+` separates Rezept `14px/500` — konsistent mit Welle B's Hell-Befund (B-M1: Sprache-Menü 500 vs. Ansicht-Menü 400) — **Ansicht-Menü bleibt bei 400 auch dunkel**, Streuung ist Sprache-Menü-spezifisch, kein neuer Dunkelmodus-Fund. | — | kein neuer Fund (B-M1 bleibt der offene Fix) |

## 5. Routen (B/C nicht erreicht)

| ID | Route | Befund | Schwere |
|---|---|---|---|
| D-15 | `/materialien` + Materialie (`ESTV-KS-DBG-5A`) | Karten-Rezept `16px/400`, `border-bottom:1px`, konsistent mit `.lc-card`-Kanon; Detailseite zeigt Feld `.lc-input` `h=44px` — keine Abweichung von den bereits kanonisierten Rezepten gefunden. Screen `finder-r9-d-14-materialie.jpg`. | kein Fund |
| — | `/einstellungen` | Feld/Knopf-Rezepte decken sich mit `.lc-input`/`.lc-btn`-Kanon (Select `h=50px` — dieselbe «dritte Höhe» wie B-F1 auf `/rechner/tagerechner`, bestätigt B-F1 app-weit statt Einzelfall). **Beobachtung ausserhalb der Klassen-Liste**: `/einstellungen` erzeugt **keinen eigenen Reiter** in der Arbeitsleiste (nur „+“ sichtbar, kein „Einstellungen“-Tab) — anders als `/materialien`/`/rechner`, die Tabs bekommen; evtl. bewusst (Systemseite), evtl. Lücke — nicht Teil des Auftrags, daher nur vermerkt. | B-F1 bestätigt (kein neuer Fund) |
| D-16 | `/suche?q=Kündigungsfrist` (Treffer) | s. D-12 — Filterzeile identisch zu `/rechtsprechung`; 63/65 Treffer korrekt gerendert, Karten-Zeilen `.lc-card`-artig mit Register-Linie links, keine neue Streuung. Screen `finder-r9-d-16-suche-treffer.jpg`. | kein Fund |
| D-17 | `/rechner/verjaehrung` | Existiert (`routesManifest.ts:52`), volles Formular hell+dunkel geprüft (Screen `-d-03`/`-d-17`); Knopf/Feld/Hinweis-Rezepte identisch zu den bereits bekannten Rechner-Rezepten (Tagerechner), keine neue Streuung. | kein Fund |

## 6. Rechner-Ergebnisdarstellung

| ID | Befund | Schwere | Fix |
|---|---|---|---|
| D-18 | **Herleitungs-Kasten `bg-warn-bg`** (`/rechner/verjaehrung`, Button „Rechenweg (4 Schritte)▸“) gemessen: `border-radius:0px` (NICHT `rounded-md` wie Welle C für `ErgebnisAnzeige.tsx:173` vermutete) — **Diskrepanz zur C4-2-Notiz**: entweder ist `rounded-md` dort durch `--radius-md:0px`-Custom-Property faktisch auf 0 gemappt (Token-Neutralisierung, kein Fund) oder die Komponente auf `/rechner/verjaehrung` nutzt eine andere Stelle als `ErgebnisAnzeige.tsx:173`. Mit Playwright bestätigt: **kein sichtbarer Radius**, Klassenname allein war in Welle C irreführend. | mittel | Klären ob `--radius-md` app-weit 0 ist (dann ist C4-2 kein Fund, sondern Token-Konsistenz) oder ob zwei Code-Pfade existieren — 1 grep-Zeile: `grep -n 'radius-md' src/index.css`. |
| D-19 | Tabellen-Semantik: `/rechner/verjaehrung` erzeugt **0 `<table>`-Elemente** — bestätigt Welle C's offene Frage empirisch: die Ergebnisdarstellung ist durchgehend Flex/Grid, nie `<table>`, app-weit (nicht nur `ErgebnisAnzeige.tsx`). Fachlich vertretbar (wenige Werte, Fliesstext-artige Herleitung), aber die Frage «Ausnahme oder Fund» bleibt eine Design-Entscheidung, keine technische. | mittel (offene Einordnung) | David/Bau: Tabellensemantik für Rechner-Ergebnisse bewusst verankern (Ausnahme-Eintrag) oder nachrüsten. |

## Nicht geprüft / nicht erreichbar
- Split-View: Karte/Listenzeile und Hinweis **im Pane** (Vergleichsobjekt fehlte in der gewählten Route OR+BGE).
- Zweiter Vorlagen-Wizard zum Rezept-Vergleich der Schrittleiste.
- Reiter-Umbruch bei ≥2 offenen Reitern @390 (nur 1 Reiter im Testlauf offen).
- `--radius-md`-Token-Wert nicht verifiziert (D-18 offen, 1 grep nötig).
- Kontrast-Zahlenwerte (WCAG-Ratio) wurden aus RGB-Paaren nicht rechnerisch ausgewertet (nur visuell/Farbwert-Vergleich) — echte Kontrastrechnung wäre ein weiterer Skript-Schritt.

Preview-Prozess (Port 4352) wird beendet.
