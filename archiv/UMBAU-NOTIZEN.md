# Umbau-Notizen: «Berechnen und Erstellen» (Phase 0 — Bestandsaufnahme)

**Stand:** 4. Juni 2026 · Ergebnis der Repo-Inspektion vor dem Umbau.

## Stack

- **Build:** Vite 8 + React 19 + TypeScript ~6.0 (`tsc -b && vite build`), SPA mit
  `react-router-dom` v7 (`BrowserRouter`, Routen in `src/App.tsx`, Vercel-Rewrite auf
  `index.html`).
- **Tests:** Vitest (16 Dateien, Referenztests pro Engine). **Lint:** ESLint 10.
- **Styling:** Tailwind 3 + CSS-Custom-Properties (`src/index.css`, `@layer base/components`).
- **PDF:** jsPDF, clientseitig (`src/lib/pdf/`, `PdfExportButton` mit `PdfDocConfig`).
- **Icons:** KEIN lucide-react — eigene Minimal-Linien-Icons (`src/components/Icon.tsx`,
  SVG-Pfade nach Schlüssel). Neue Teile nutzen dieselbe Komponente.
- **i18n:** KEIN i18n-Gerüst vorhanden. Alle Texte liegen inline auf Deutsch (Schweizer
  Hochdeutsch, Guillemets «…»). → Abweichung zur Anweisung: Texte werden weiterhin inline
  deutsch geführt (kein zweiter Ansatz, keine neue Abhängigkeit); ein i18n-Layer kann
  später extrahiert werden.

## Designsystem (Tokens in `src/index.css`)

- **Farben:** Papier `--paper #F7F4EC` (+ raised/sunken), Tinte `--ink-900…300`,
  Akzent Messing `--brass-700…100` («der eine Akzent»), Status sage/slate/warn/danger.
- **Typografie:** Display-Serif **Fraunces** (`--font-display`, h1–h3), Sans **Geist**
  (`--font-sans`), Mono **Geist Mono** (`--font-mono`; `.num`, `.lc-overline` =
  Mono-Caps-Labels). `&` in Display-Titeln via `sansAmp()` (`typografie.tsx`).
- **Signatur:** `.scale-rule` — gravierte Messskala (Tick-Marken-Divider), auch als
  Aktiv-Unterstrich im Header; wiederverwendbar als Wizard-Fortschritt (gefüllte/leere Ticks).
- **Bausteine:** `.lc-card` (Goldrand oben = «geprüft»), `.lc-chip` (Mono-Pill mit
  Messing-Tick), `.lc-badge*`, `.lc-btn-primary/-brass/-outline/-ghost`, `.lc-input`,
  `.lc-notice*`; Segmented-Toggles (Status-Filter, `StufenSchalter`), `DatumsFeld`
  (eigener Datepicker), `ErgebnisAnzeige`, `RechnerKopf`, `Katalog` (Filter + Sektionen).

## Zentrale Config (Single Source of Truth)

- `src/lib/startseiteConfig.ts`: `CalculatorCard`-Interface + `KARTEN`-Record +
  `SEKTIONEN` (4 Output-Typen) + `RECHTSGEBIETE` (Filterwerte) + `ALLE_KARTEN`.
  Rendering 100 % datengetrieben über `Katalog` → `RechnerKarte`.
- Felder heute: `id, art, tier ('frei'|'experte'), rechtsgebiet, title, description,
  status ('geprüft'|'geplant'), norms (NormRef[]), href, keywords, related, note, icon`.
- **Stufe ist bereits Route:** `/` (tier `frei`) und `/fachpersonen` (tier `experte`),
  Umschalter `StufenSchalter` im Header. → passt zur empfohlenen Variante
  «Stufe = Route, Modus = In-Page-Toggle».
- Fedlex-Verlinkung zentral in `src/lib/fedlex.ts` (verifizierte Anker, Unterstrich-
  Format `art_335_c`); Verifikations-Register für Rechtsprechung in
  `src/data/verifikation.ts` (BGE standardmässig `verifiziert: false`).
- Detailseiten-Registry: `src/lib/calculators.ts` (Slug → `/rechner/<slug>`).

## Entscheidungen für den Umbau

1. **IA gemäss Empfehlung:** Stufe bleibt Route (Gating-Wrapper anschliessbar),
   Modus `[ Rechner | Vorlagen ]` als In-Page-Segmented-Control; Zustand über
   URL-Query `?modus=vorlagen` (teilbar, Back-Button-tauglich).
2. **Datenmodell:** `CalculatorCard` → diskriminierter Union `CatalogItem`
   (`RechnerCard | VorlageCard`); Bestand erhält `modus: 'rechner'`.
3. **Filterwert neu:** `Gesellschaftsrecht (OR)` (von der Anweisung als bestehend
   vorausgesetzt; war bisher auf «Vertrag / OR» gemappt — die Kachel
   `gesellschaftsrecht-fristen` zieht mit um).
4. **Tier der Start-Vorlagen:** Vorsorge & Nachlass + Verträge → `frei`;
   Eingaben + Gesellschaftsdokumente → `experte` (anwaltsnah).
5. **Kein LLM, keine Text-API** im Produkt: `assemble()` (Phase 3) wird eine reine
   Funktion über deklarativen Schemata (`Condition`-Algebra, feste Bausteine).
