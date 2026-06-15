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

## Umsetzungs-Stand

- **E1 ✓** (572f7aa) Fundament: Form-Primitive (`.lc-select`/`.lc-textarea`/
  `.lc-input-sm`), `.lc-akzent-*`, `.lc-fineprint`, accent-color Messing,
  Fraunces-Serif-Fallbacks weg, totes `.lc-reveal-panel` weg, 4 Timing-Tokens.
- **E2 ✓** (3c3b8c0) Skip-Link + `<main id>`-Landmark; `<Card>`-Primitive ersetzt
  17× Inline-Wrapper auf 16 Rechner-Seiten (byte-neutral).
- **E3 ✓** (1431f18) Persistente Kategorie-Navigation (Desktop) + Off-Canvas-
  Mobile-Menü; redundante Disclaimer-Utility-Bar ersetzt.
- **E4 ✓** (42e29c3) Katalog-Filter: Rechtsgebiet-Pillen + Status-Schnitt für die
  Vorlagen-Wand (tote kartePasst-Logik verdrahtet, URL `?rg=`/`?status=`).
- **E5 ✓** (e8d2a99) Rechner-Konsistenz: Prozesskosten-Dialekt → Haus-Anatomie;
  Input-Inseln (EinfacheFrist/Tagerechner) → `lc-input`; EckdatenKachel-Akzent-Token.
- **E6 ✓** (80c2c1f) Wizard: kompakter Mobile-Stepper-Fortschritt, „Weiter"-
  Erklärung, mobiler Vorschau-Sprung + Auto-Öffnen.
- **E7 ✓** (7e38dee) Mobile/Touch: responsive H1, grössere Checkbox/Radio/Tabs,
  Tabellen `min-w`, Footer-Tap-Flächen + `.lc-fineprint`.
- **E8 ✓** (36e0d4f) Animation: Live-Wert-Puls, Schritt-/Routen-Fade,
  `transition-all` bereinigt, totes View-Transition-CSS entfernt.
- **E9 ✓** (a951a9c) A11y: Tabs-Tastaturmuster, FristenKalender sr-only + Kontrast,
  Logo-ARIA, verschachtelte Live-Region.
- **E10 ✓** (90878a8) Sekundärseiten: `<SeitenKopf>`-Primitive, ErrorBoundary in
  der Familie, 404-Wegweiser.

### Fortsetzung (E11–E14, nur lokal — kein Push)
- **E11 ✓** (4c951e2) Such-A11y: `aria-live`-Region kündigt die Trefferzahl an
  (letzter hoch-A11y-Befund).
- **E12 ✓** (5c2db95) `<Checkbox>`-Primitiv (gebrandet, ≥44px-Zeile, Fokus) +
  StreitwertForm als erste Migration.
- **E13 ✓** (8e85a25) SprachUmschalter: `role=menu` → ehrliche Disclosure
  (role=group, Fokus-Management); totes `.lc-disclosure`-CSS weg; Raster-Kommentar.
- **E14 ✓** (5215560 · 71c36b1 · 97bdfb4) Checkbox-Migration in **3 Wellen**:
  **44 Stellen** über 12 `forms/`-Dateien aufs Primitiv (einfache + komplexe Handler).

Checkbox-Rest: ~25 Sondermuster in `forms/` (v.a. ZustaendigkeitForm) + ~150 in den
`Vorlage*`-Seiten — letztere bewusst **nicht während der aktiven Parallel-Session**.

### Folge-Umbau #1–#4 (nur lokal — kein Push)
- **#1 ✓** (470c446) ListenZeile: WerkzeugZeile + FristenRegimeZeile → eine
  `<ListenZeile>`; TrefferZeile auf dieselbe lc-card-Anatomie + Hover-Lift
  (zweiter Hover-Dialekt weg).
- **#2 — geprüft, kein Eingriff nötig:** Davids Leerzustand-Regel ist bereits
  flächig durchgesetzt — JEDE `FehlerBox` liegt in einem `BeruehrtRahmen`, und die
  einzige inline-`role=alert` (SchkgZustaendigkeitTeil) feuert im Leerzustand nicht
  (`forderung=null`). Der Audit-Befund war veraltet. (Ehrlichkeit statt Schein-Fix.)
- **#3 ✓** (cb7959d) Wizard zweispaltig schon ab `md` (768px) statt erst `lg` —
  iPad-Hochformat bekommt Eingabe + klebende Live-Vorschau nebeneinander.
- **#4 ✓** (a1e3232) 166 Checkbox-Tap-Zeilen in 28 Vorlage-Seiten vergrössert
  (gap-2.5 + py-1.5). Bewusst KEINE Umstellung der reich-formatierten JSX-Labels
  aufs Primitiv (212 Stellen, marginaler Nutzen) — die Seiten waren bereits EIN
  konsistentes, gebrandetes Muster.

### Weiterer Feinschliff (nur lokal — kein Push)
- **lc-select-Rollout ✓** (6af7c45) — Messing-Chevron auf ALLEN Selects über den
  Element-Selektor `select.lc-input`, ohne ~150 Call-Sites anzufassen.
- **forms/-Tap-Zeilen ✓** (b5ff766) — 28 restliche inline-Checkbox/Radio-Labels
  (v.a. ZustaendigkeitForm 14) auf gap-2.5 + py-1.5; Touch-Konsistenz mit #4.

### Weiterer Feinschliff (Forts.)
- **Fokus-Ring ✓** (8fe33aa) — `.lc-input` jetzt abgesetzter Doppelring (`--ring`).
- **Wizard-Sub-Gruppen ✓** (76f4692) — `<GruppenTitel>` (Messing-Overline + Haarlinie,
  **Entscheid David Variante A**); 86 Untertitel in 20 Vorlagen → Haarlinien-Sektionen
  wie in den Rechnern.

### Bewusst zurückgestellt (für David / spätere Runde)
- **Wizard-Schalter-Stapelung** (Vertragstyp + Detailgrad) — per-Seite.
- **Rich-JSX-Checkboxen → Primitiv** (Pages + ZustaendigkeitForm) — nur Tap-Sweep,
  kein Voll-Restructure (Nutzen/Risiko).
- **Title-Suffix/Meta-Descriptions** in `src/lib/seo.ts` (ausserhalb der UI-Schranke).
- **Cremes-Token-Dedup** (paper/surface/paper-raised) · Vertikale Rhythmik — niedrig.

### Korrektur Phase-0-Befund
Die «leere RECHTLICHER HINWEIS»-Box ist **kein Bug**: `PflichtDisclaimer` ist ein
zugeklapptes `<details>` (nur die Summary-Zeile sichtbar). Funktioniert wie
vorgesehen — keine Reparatur nötig; bleibt nur Teil der Disclaimer-Entdoppelung.

**Stand:** Phase 0 + E1–E10 abgeschlossen (alle Tore `npm run gate` + `npm run build`
grün vor jedem Commit; je eigener, deklarierter Commit; kein Push/Deploy).
