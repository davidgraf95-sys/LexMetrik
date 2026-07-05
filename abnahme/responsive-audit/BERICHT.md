# W3·14 · Bildschirm-/Responsive-Audit

**Gefahren:** 5.7.2026 · **Basis:** `origin/main` @ `4fe71a8a` (Worktree
`chore/responsive-audit`, eigener dist-Build, Preview-Port 4399) ·
**Werkzeug:** Playwright-bash (`abnahme/responsive-audit/sweep.ts`, kein MCP) ·
**Charakter:** REIN LESEND — dieser Schritt **flaggt nur**, fixt nichts
(Fixes gehören in spätere Schritt-14-Einheiten, dieselben §12-Kollisionsdateien).

Das Skript setzt auf dem Muster von `scripts/screenshots.ts` auf (Motiv→Route,
`reducedMotion`, fullPage, ehrliches FEHLT-Logging §8), erweitert um die fünf
W3·14-Breiten, das volle Rubriken-Inventar und maschinelle Defekt-Sensoren.
Eigene Datei unter `abnahme/` statt Eingriff in `scripts/screenshots.ts` —
der Audit-Schritt bleibt am Code rein lesend.

## Matrix

**30 Motive × 5 Breiten (390 · 768 · 1280 · 1536 · 2560) = 150 Aufnahmen**,
alle erfolgreich (0 harte Fehler, 0 Konsolenfehler, 0 Seiten-Overflow).

| Rubrik | Motive |
|---|---|
| Startseite | `startseite`, `startseite-register-offen` |
| Gesetze-Landeplatz/Sichten | `gesetze-landeplatz`, `gesetze-ebene-kanton`, `gesetze-kanton-ZH` (`?ebene=kanton&kt=ZH`), `gesetze-rechtsgebiet` (`?ansicht=rechtsgebiet`) |
| Reader Bund gross/klein | `reader-bund-gross-OR` (1686 Art.), `reader-bund-gross-ZGB`, `reader-bund-klein-VMWG` |
| Reader Kanton / pdf-embed / Anhänge | `reader-kanton-AG` (AG-291.150), `reader-pdf-embed-EMRK`, `reader-lugue-anhaenge` (LugÜ, Protokolle/Tabellen) |
| International | `international-uebersicht` |
| Rechtsprechung | `rechtsprechung-uebersicht`, `entscheidleser-bge`, `entscheidleser-bger` |
| Materialien | `materialien-uebersicht`, `materialleser` |
| Rechner (Übersicht + Wizards) | `rechner-uebersicht`, `rechner-tagerechner`, `rechner-verzugszins`, `rechner-kuendigung`, `rechner-erbteilung`, `rechner-streitwert`, `rechner-zustaendigkeit` |
| Vorlagen | `vorlagen-uebersicht`, `vorlage-ag-gruendung`, `vorlage-arbeitsvertrag` |
| Statisch | `methodik`, `einstellungen` |

*«Kalender» hat keine eigene Route — der Fristenkalender lebt im
`rechner-tagerechner` (ICS-Export) und ist dort mit-fotografiert.*

## Gesamtbefund

**Die App ist responsiv sehr solide.** Über alle 150 Aufnahmen:

- **0× echter horizontaler Seiten-Overflow** (`documentElement.scrollWidth >
  innerWidth`) — auf keiner Seite, keiner Breite. Wichtigster Einzelbefund,
  durchweg grün (inkl. der historisch heiklen LugÜ-Anhang-/Tabellen-Seite @390,
  hier unabhängig bestätigt: docSW == innerWidth == 390; Ratifikations-Tabelle
  scrollt im eigenen `lc-scroll-x`-Container).
- **0 Konsolenfehler / pageerror** auf allen Seiten und Breiten.
- Mobile Layouts (@390) stapeln sauber (`grid-cols-1`-Basis greift),
  Chip-Reihen/Tab-Streifen scrollen als bewusste `overflow-x-auto`-Rails,
  Formulare/Wizards fallen sauber einspaltig.
- Ultrawide (@2560) nutzt durchgängig eine **zentrierte max-width-Spalte**
  (Sidebar links, toter Rand rechts) — bewusste Lesbreite (§13.2), **kein**
  Content-an-den-linken-Rand-geklebt-Problem.

Kein Blocker; die Befunde sind Feinschliff für spätere Schritt-14-Fix-Einheiten.

**Methode Doppel-Verifikation (Anweisung David).** Jede Aufnahme wurde
(a) maschinell gesensort (`befunde.json`), (b) vom Sweep-Autor über eine
repräsentative Auswahl (jede Rubrik @390/@2560 + alle geflaggten Seiten) und
(c) von einem unabhängigen Visual-Validator-Agenten über den vollen Satz
gesichtet. Zwei Befunde tragen ein ausdrückliches **«manuell verifizieren»**-
Caveat, weil sie ein Headless-/Stitching-Artefakt sein könnten (D6, D9).

## Defektliste (nach Schwere)

| # | Schwere | Seite(n) | Breite | Symptom | Vermutete Wurzel | Beleg |
|---|---|---|---|---|---|---|
| **D1** | **hoch** | `vorlage-arbeitsvertrag` (Vorlagen mit mehreren Untertypen) | 390 | Der gold-umrandete **«Vorschau ↓»-Sprungknopf** liegt IM zweispaltigen Vertragstyp-Karten-Raster (rechte Zelle zwischen «Kader/Manager» und «Handelsreisender») → wirkt wie eine defekte Untertyp-Kachel. Bei ≥768 sauber. **Von Sensor-Autor und Visual-Agent pixel-bestätigt.** | «Vorschau ↓»-Jump-Button ist Kind desselben `grid`-Containers wie die Untertyp-Kacheln → fliesst auf @390 in eine Rasterzelle statt abgesetzt darüber zu stehen. | `vorlage-arbeitsvertrag--390.png`, Vertragstyp-Block |
| **D2** | **mittel** | alle Seiten (Shell-Kopfzeile) | 390 | Header-Bedienelemente unter dem 44px-Komfort-Tap-Ziel: «Navigation öffnen» 38×36, Logo-Link 30×30, «Farbschema» 36×36, «Befehle/Sprung» 42×36 px. Systematisch (~13 geteilte Kopf-/Fusszeilen-Controls). | Kopfleisten-Icon-Buttons mit fixer `h-9`-Höhe. **WCAG 2.2 AA (2.5.8, ≥24px) ist erfüllt**; unter dem 44px-Apple-HIG/AAA-Komfortziel. | `*--390.png`, Kopfzeile |
| **D3** | **mittel** | `methodik` | 2560 | Inhalts-/Pflege-Listen bleiben eine schmale (~500px) Einzelspalte → Seite wird ~10 470px hoch, viel toter Rechtsraum. | Info-Seite ohne Mehrspalten-Layout bei viel Breite (bewusste max-width, aber hier besonders spürbar bei langer Liste). | `methodik--2560.png` |
| D4 | niedrig | `reader-pdf-embed-EMRK` | 390 (alle) | Inline-PDF-Embed rendert als **leerer Kasten** (Footer im Voll-Shot sichtbar → kein Scroll-Artefakt). | **⚠ Caveat: wahrscheinlich Headless-Chromium (kein PDF-Plugin).** Fallbacks «PDF herunterladen» + «Amtliches PDF in neuem Tab öffnen» vorhanden/korrekt. **Vor «bestätigt» im echten Browser prüfen.** | `reader-pdf-embed-EMRK--390.png` |
| D5 | niedrig | `entscheidleser-bge/-bger` | 390 | Schriftgrössen-Steller «A− A+» im Entscheid-Kopf minimal beschnitten (scrollW 62 > clientW 38, Δ24px, `overflow-hidden`); zudem Such-Placeholder auf «Suc» gequetscht (Zähler-Badge drängt). | Segment-Control + Suchfeld etwas breiter als der reservierte Platz bei sehr schmaler Spalte. | `entscheidleser-*--390.png` |
| D6 | niedrig | `reader-kanton-AG` | 390/1280/2560 | Gliederungs-Liste erscheint als isolierte Überschriften mit grossen Lücken. | **⚠ Caveat: vermutlich Sticky-Sidebar-Screenshot-Artefakt** (Viewport-Cap-Aufnahme). **Manuell im Browser gegenprüfen.** | `reader-kanton-AG--*.png` |
| D7 | niedrig | `gesetze-rechtsgebiet` | 2560 | Content-Container **breiter** als bei den Schwesterseiten (2-spaltiges Querschnitt-Grid + Grundgerüst-Liste ~1940px statt ~1350px Deckel wie `gesetze-landeplatz`); Gesetzestitel in den Karten trotz Platz ellipsis-trunkiert. | Andere `max-w-*`-Token als die übrigen Gesetze-Sichten → Design-System-Inkonsistenz der Lesbreite. | `gesetze-rechtsgebiet--2560.png` |
| D8 | niedrig | Reader Bund gross (`OR`/`ZGB`) | ≥1280 | Präambel/Erlassformel-Fliesstext läuft im Kopfbereich über die volle Content-Breite (~1350px @2560), bevor die Artikel unten in die schmalere TOC+Spalte-Sicht wechseln. | Ingress-Block ohne `max-w-reading`-Deckel; die Artikel selbst sind korrekt schmal. | `reader-bund-gross-OR--2560.png` |
| D9 | niedrig | `gesetze-landeplatz` | 390/2560 | Such-Kürzel-Button («Suchen — Bund, Kantone …») hart ohne Ellipsis abgeschnitten. | Feste Button-Breite / fehlendes `truncate` am Label. | `gesetze-landeplatz--*.png` |
| D10 | niedrig | `rechtsprechung-uebersicht` | 390 | Sachgebiet-Chip-Zeile mitten im Wort abgeschnitten («Strafr…») ohne sichtbare Scroll-Affordance (Verlauf/Schatten). | Bewusste `overflow-x-auto`-Rail (kein Overflow-Bug), aber ohne visuellen Hinweis, dass seitlich scrollbar. | `rechtsprechung-uebersicht--390.png` |
| D11 | niedrig | `startseite` | 2560 | 4. «Neues vom Bundesgericht»-Karte am Container-Rand abgeschnitten. | **Bewusstes Karussell** (‹ ›-Pfeile) — die angeschnittene Karte ist die Scroll-Affordance, kein Bruch. | `startseite--2560.png` |
| D12 | niedrig | `vorlagen-uebersicht` | 768 | Einspaltig, obwohl zweispaltig möglich wäre. | Evtl. gewollt (Lesbarkeit); nur als Kandidat notiert. | `vorlagen-uebersicht--768.png` |

## Systematik-Befunde (wiederkehrende Wurzeln)

- **S-A · Header-Tap-Ziele (D2).** Eine Wurzel, ~13 Kopf-/Fusszeilen-Controls,
  wirkt auf ALLEN Seiten @390. Ein einziger Shell-Kopfzeilen-Fix (Trefferflächen
  ≥44px) räumt den Befund site-weit ab. **Höchster ROI.**
- **S-B · Bewusste `overflow-x-auto`-Scroll-Rails sind KEIN Defekt** (D10/D11).
  Chip-Reihen (Direktzugriff, Sachgebiet-Filter), Tab-Streifen, Karussells und
  breite Tarif-/Ratifikations-Tabellen scrollen absichtlich seitlich im eigenen
  Container. Restpunkt = teils fehlende **visuelle Scroll-Affordance**
  (Verlauf/Schatten) — Politur, kein Bruch.
- **S-C · Grid-Fremdkinder auf Mobil (D1).** Ein Nicht-Kachel-Control als Kind
  eines Karten-`grid` fliesst @390 in eine Rasterzelle. Beim Fix weitere
  Untertyp-Raster-Vorlagen mit abklopfen.
- **S-D · Ultrawide-Lesbreite (D3/D7/D8).** Der zentrierte max-width-Deckel
  (~24–41 % toter Rechtsrand @2560) ist über ~20 Seiten **bewusst und konsistent
  — NICHT 20 Einzelbugs.** Ausnahmen: `gesetze-rechtsgebiet` (breiterer Container
  = Design-System-Inkonsistenz, D7), `methodik` (Einzelspalte wird sehr hoch,
  D3), Reader-Ingress ohne `max-w-reading` (D8).

## 0-Befund-Bereiche (ehrlich, von mind. zwei Durchgängen bestätigt)

Kein maschineller UND kein visueller Defekt: `startseite` (390),
`startseite-register-offen` (390), `gesetze-landeplatz` (2560),
`gesetze-ebene-kanton` (390), `gesetze-kanton-ZH` (390/2560),
`gesetze-rechtsgebiet` (390), `reader-bund-gross-OR/ZGB` (390),
`reader-bund-klein-VMWG` (390/2560), **`reader-lugue-anhaenge` (390 — Anhänge/
Protokolle sauber: nested Listen indentieren, Ratifikations-Tabelle + Formular-
Strips scrollen in bordierten `lc-scroll-x`-Boxen, 0 Seiten-Overflow)**,
`international-uebersicht` (390/2560), `rechtsprechung-uebersicht` (2560),
`entscheidleser-bge` (768–2560), `materialien-uebersicht` (390/2560),
`materialleser` (390/2560), alle `rechner-*` (390 — Wizards einspaltig;
`erbteilung`-Erbteile-Tabelle scrollt im `overflow-x-auto`-Card),
`vorlagen-uebersicht` (390/1280), `vorlage-ag-gruendung` (390/768/1280),
`vorlage-arbeitsvertrag` (768), `methodik` (390), `einstellungen` (390).

## Grenzen des Sweeps (Ehrlichkeit, §8)

1. **Default-Zustand ohne Nutzereingaben.** Wizards/Formulare im leeren
   Ausgangszustand fotografiert (kein ausgefülltes Ergebnis-/Timeline-Layout
   unter Last). Brüche, die erst mit langen Ergebnistabellen/Timelines
   auftreten, sind nur teilweise sichtbar.
2. **Tap-Ziel-Metrik überzählt auf Inhaltsseiten.** Der `<44px`-Zähler erfasst
   auch **Inline-Verweis-Links im Fliesstext** (15 854 auf `reader-OR`, 11 973
   auf `ZGB`, 862 auf `rechtsprechung`). Diese fallen unter die
   **WCAG-2.5.8-Inline-Ausnahme** und sind **kein Defekt** — belastbar ist nur
   der ~13er-Shell-Sockel (D2). Eine spätere Sensor-Verfeinerung sollte
   Prosa-Inline-Links ausklammern.
3. **Headless ≠ echtes Gerät.** Inline-PDF (D4) und Sticky-Sidebar-Layouts (D6)
   können auf realen Browsern abweichen — beide tragen ein «manuell
   verifizieren»-Caveat.
4. **Sehr hohe Reader auf 16 000px begrenzt** (Viewport-Cap statt fullPage;
   Chromium-Textur-Limit ~32k, fullPage crasht sonst — LugÜ 38 955px, OR
   663 000px). **Die maschinellen Checks liefen über den GANZEN DOM** (vor dem
   Screenshot); nur die visuelle Belegaufnahme ist auf die ersten ~16 000px
   begrenzt. LugÜ-Anhänge jenseits davon separat gezielt gegengeprüft (0
   Overflow, 4 `lc-scroll-x`-Container inkl. Ratifikations-Tabelle sw 3828).
5. **Interaktions-Tiefe minimal.** Nur `startseite-register-offen` öffnet ein
   Panel; Drawer/Split-View-Panes/offene Popover-Overflows nicht gesweept.

## Regenerieren / Screenshot-Anleitung

Die **150 PNGs (~90 MB)** liegen UNVERSIONIERT in
`abnahme/responsive-audit/shots-<sha7>/` (gitignored — Repo-Gewicht +
Deploy-Upload-Risiko; §6). Nur dieser Bericht wird committet. Die maschinellen
Rohbefunde stehen je Lauf in `shots-<sha7>/befunde.json`.

Exakt reproduzierbar (kontextlos lauffähig):

```bash
git worktree add /tmp/lm-respaudit -b <branch> origin/main
cd /tmp/lm-respaudit && npm ci && npm run build
npm run preview -- --port 4399 --strictPort        # eigener Port, nie 4317/4321/4471
# in zweitem Terminal:
npx vite-node abnahme/responsive-audit/sweep.ts -- \
  --base-url http://localhost:4399 \
  --out abnahme/responsive-audit/shots-$(git rev-parse --short HEAD)
```

Der Sensor (`sweep.ts`) prüft deterministisch je Seite×Breite: Seiten-Overflow,
Element-Overflow ausserhalb von `overflow-x`-Containern (Element-eigenes
`overflow-x` zählt als erlaubt), Text-Clipping-Heuristik (ohne `ellipsis`/
`line-clamp`/sr-only), Tap-Ziele < 44px @≤430, Konsolenfehler — und schreibt
`befunde.json` + je Aufnahme ein fullPage-PNG (Überlänge auf 16 000px viewport-
gecappt, nicht `clip` — `clip` allein bliebe auf die Viewporthöhe geklemmt).
