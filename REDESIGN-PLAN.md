# REDESIGN-PLAN — UI mit frischem Blick (Phase 0)

**Auftrag:** `~/Downloads/AUFTRAG-UI-Redesign.md` (14.6.2026). Freie Hand an der
gesamten Darstellungsschicht; **Schranke:** Rechtslogik (`src/lib/`, `src/data/`)
und Export-Inhalte (PDF/DOCX) bleiben **byte-identisch**. Status-Ehrlichkeit:
nichts wird als «geprüft» dargestellt. Permalink-Schema (`?q=`, `?kategorie=`,
Rechner-Permalinks, .ics-Erbe) bleibt erhalten. Kein Push/Deploy ohne Davids Ja.

## Methode der Bestandsaufnahme

10-Agent-Audit (read-only, je eine Dimension/Bereich) + empirische Screenshots
(Playwright, Desktop 1280 / Mobile 390). Ergebnis: **97 Befunde (22 hoch · 40
mittel · 35 niedrig)**. Das Fundament ist **überraschend reif** (disziplinierte
Tokens, geteilte Bausteine, ehrliche Status-Logik, axe-Tests, ARIA-Grid-Kalender)
— es geht um **Schärfen und Vollenden**, nicht um Reset.

### Korrektur am Auftrag (§7-Pflicht zur Offenlegung)
Der Auftrag nennt **Fraunces** als Marken-Serife. `src/index.css` zeigt: Fraunces
wurde am 6.6.2026 auf Davids Wunsch aus der UI entfernt (Display = Geist). Ich
folge dem **Code**, nicht dem Briefing — und räume die Fraunces-Altlasten
(serif-Fallbacks in `.lc-seal`/`.lc-word`) ehrlich auf.

## Die fünf systemischen Wurzeln (worauf fast alle 22 hoch-Befunde zurückgehen)

1. **Fehlende grosse Layout-Primitive.** Der Karten-Wrapper
   `bg-surface-raised rounded-2xl border p-6 sm:p-8` steht **17× wortgleich**;
   der Seitenkopf ist **3× reimplementiert**; Checkbox/Radio **66× von Hand** in
   20 Dateien; Select/Checkbox/Textarea sind **ungestylt** (Browser-Default).
2. **Token-Lecks.** Zweites Input-Rezept (EinfacheFrist/Tagerechner), Fokus
   dreifach uneinheitlich, undefiniertes `text-caption`, Inline-`fontSize:10px`,
   «8px-Raster» faktisch durch 6px-Halbstufen unterlaufen, totes Motion-CSS
   (View-Transitions, `lc-reveal-panel`), nur 2 von 4 Timing-Tokens in Tailwind.
3. **Navigation trägt ~50 Werkzeuge nicht.** Header hat **einen** Link; die vier
   Oberkategorien existieren nur auf «/»; **kein Mobile-Menü**, **kein Skip-Link**.
4. **Katalog skaliert nicht.** Vorlagen = 72/148 als endlose Wand; die
   **Filterlogik existiert, ist aber tot** (mit leeren Sets aufgerufen); Suche
   ohne Tastatur-Navigation/`aria-live`; 3 fast gleiche Zeilen-Komponenten.
5. **Zwei Design-Dialekte + Wizard-Enge.** Prozesskosten bricht als einziger die
   Ergebnis-Anatomie (eigene `PostenKarte`, `text-overline/-caption/-h4`, keine
   `ErgebnisAnzeige`); Wizard stapelt 3 Schalter-Ebenen, Stepper als Chip-Wolke
   ohne Fortschritt, **Live-Vorschau auf Mobile beim Tippen unsichtbar**,
   deaktivierter «Weiter» ohne Begründung; Animation der Live-Berechnung fehlt.

### Empirisch bestätigt (Screenshots)
- Prozesskosten: Hinweis-Box **«RECHTLICHER HINWEIS»** rendert **leer**; der
  «keine Rechtsberatung»-Disclaimer erscheint **3–4×** auf einer Seite.
- Mobile-Wizard: Stepper + Varianten-Chips brechen in eine unruhige Block-Wolke.

## Handlungsplan (nach Hebelwirkung geordnet; jede Etappe = eigene Commits)

Jede Etappe ist nach CLAUDE.md §6 verhaltensneutral bzw. rein darstellend; volle
Tore (`npm run gate`) vor **jedem** Commit. UI-Struktur-Tests, die altes Layout
festschreiben, werden bei Bedarf **deklariert** angepasst (Schutzabsicht bleibt).

- **E1 — Fundament schliessen** (`index.css`, `tailwind.config.js`): Form-Primitive
  (`.lc-select` mit Messing-Chevron, globales `accent-color`, `.lc-textarea`,
  `.lc-input-sm`), eine Fokus-Sprache (`--ring`), 4 Timing-Tokens in Tailwind,
  6px-Raster ehrlich, Serif-Fallbacks weg, totes Motion-CSS entfernt, `.lc-akzent-*`
  Oberkanten-Primitive, `.lc-fineprint`.
- **E2 — Layout-Primitive** (React): `<Card>`, `<SeitenKopf>` (+ `<ZurueckLink>`),
  `<Checkbox>/<RadioGroup>`, `<Titel level>`; Skip-Link + `<main id>` in der Shell.
- **E3 — Navigation**: persistente Kategorie-Navigation (Desktop) + Mobile-Menü aus
  `OBERKATEGORIEN` → `/?kategorie=`; Sprachumschalter zurücknehmen; doppelten
  Disclaimer (Utility-Bar) entfernen.
- **E4 — Katalog skaliert**: vorhandene Filterlogik verdrahten (Rechtsgebiet-Pills +
  Status-Schnitt, URL-gespiegelt `?gebiet=`/`?status=`); 3 Zeilen→`<ListenZeile>`;
  Suche als Listbox + `aria-live`; Rubriken einheitlich mit Zählern.
- **E5 — Rechner-Konsistenz**: Prozesskosten auf gemeinsame Anatomie; EinfacheFrist/
  Tagerechner/KombinierteAnsicht auf `lc-input`/`Field`; Streitwert-EckdatenKachel;
  `BeruehrtRahmen` durchgängig; leere Hinweis-Box reparieren.
- **E6 — Vorlagen-Wizard**: kompakter Stepper mit Fortschritt + Mobile-Modus;
  Live-Vorschau mobil sichtbar; deaktivierter «Weiter» erklärt sich; Schalter-Ebenen
  zusammenfassen; Export-Wege staffeln; Sub-Gruppen in langen Schritten.
- **E7 — Mobile/Touch-Sweep**: Checkbox/Radio-Trefferflächen, `text-h2 sm:text-h1`,
  Tabs `h-11 sm:h-9`, Tabellen `min-w`, dichte Grids, `md:`-Tablet-Stufe.
- **E8 — Animation**: dezenter Live-Berechnung-Puls; Wizard-Schritt-Übergang;
  Routen-Cross-Fade (View-Transitions korrekt verdrahten **oder** totes CSS war
  schon in E1 weg); `transition-all` → konkrete Eigenschaften.
- **E9 — A11y-Politur**: ARIA-Tabs vervollständigen/ehrlich herabstufen;
  FristenKalender sr-only-Klartext; ink-400-Kontraste; verschachtelte Live-Regionen.
- **E10 — Sekundärseiten/IA**: `<SeitenKopf>` auf statische Seiten; ErrorBoundary in
  die Familie; «Über» in die Nav; Title-Suffix/Meta-Descriptions; 404-Wegweiser.

## Offene Punkte für David (nicht blockierend)
- Status-Kommunikation: Da **0** Werkzeuge «geprüft» sind, ist das Entwurf-Badge
  faktisch überall. Vorschlag: ein ruhiger Gesamt-Hinweis je Kategorie statt 62
  leiser Einzel-Badges (zur Diskussion, nichts wird auf «geprüft» gehoben).
- Sprachen en/fr/it sind «in Bearbeitung» → Umschalter wird optisch zurückgenommen.

**Stand:** Phase 0 abgeschlossen. Umsetzung beginnt mit E1.
