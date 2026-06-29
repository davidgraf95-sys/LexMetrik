# FAHRPLAN — Multi-Pane / Split-View (+ Breiten-Umschalter)

> **Stand 29.6.2026 · Strang A FERTIG + B-0 FERTIG (Branch `feat/split-view-strang-a`,
> nicht deployt — Batch-Fenster).** Detail-„Wie" zum ROADMAP-Strang
> *„Multi-Pane / Split-View"*. Steuerung (Reihenfolge/Park) bleibt in `ROADMAP.md`;
> Ist-Zustand/Deploy in `STRUKTUR.md`. Auftrag David 29.6.2026: zwei oder drei
> „Engines" nebeneinander **wie im Browser** — Gesetz | Rechner | Begründungs-Absatz.
>
> **Erledigt (gegated, golden byte-gleich, 57 Routen prerendern):**
> - **Strang A** — Inhaltsbreite-Umschalter `[Kompakt|Breit]` (Commit `fc5dbb3c`);
>   ultracode-6-Linsen-Review, 4 Befunde behoben (toter `/70`-Alpha-Fill, a11y-Label,
>   localStorage-try/catch, expliziter Setter).
> - **B-0** — `<Routes>` nach `src/RouteSwitch.tsx` ausgelagert (Commit `2ed15aa7`),
>   verhaltensneutral; Runtime-Smoke (/, /rechner, /gesetze, /pro→/, NotFound) sauber.
>
> **Nächstes = B-0b (Container-Query-Fundament) — wartet auf zwei Entscheide Davids**
> (unten „Offene Entscheide"). B-0b ist der Hauptaufwand → eigene fokussierte Session.
> Bau weiter in **eigenem Worktree** (`Shell.tsx`/`Topbar.tsx`/`App.tsx`/
> `tailwind.config.js` = §12-Kollisionsdateien), nie parallel auf denselben Dateien.

---

## Warum (Produkt)

Split-View macht den **Verzahnungs-Burggraben** sichtbar: „Norm → Werkzeug →
Schriftsatz" buchstäblich nebeneinander. Das kann weder Fedlex noch entscheidsuche.
Strikt zustandslos: Panes speichern **nur Pfade**, nie Formular-/Falldaten
(Berufsgeheimnis — wie `lib/tabs.ts` heute).

## Reihenfolge (Davids Entscheide 29.6.2026, FIXIERT)

1. **Erst Strang A** (Breiten-Umschalter, klein, eigenständig live), **dann Strang B** (Split-View).
2. **Layout-Modus B3**: Primär-Pane treibt die URL wie heute; Sekundär-Panes additiv;
   „Layout teilen" kodiert auf Klick in einen Permalink.
3. **Bis 3 Panes, responsiv**: 1 mobil · 2 ab ~1440px · 3 ab ~1920px.

---

## Architektur-Befund (29.6.2026 gelesen, nichts geändert)

| Baustein | Ist | Folge |
|---|---|---|
| Versionen | React **19.2** · react-router-dom **7.16** · react-dom **19.2** | MemoryRouter + `<Routes location>` + React-19-Suspense pro Pane verfügbar |
| Routing | `BrowserRouter`/`StaticRouter`, **eine** Route in **einem** `<main>` (`App.tsx <Routes>`) | für N Panes: Routen-Schalter standalone mountbar machen |
| Routen-Register | datengetrieben `ROUTEN_MANIFEST`, katalog-gegatet | Routentabelle ist Daten → pro Pane wiederverwendbar (§5) |
| Shell | `Shell.tsx`: verstellbare/einklappbare Sidebar + Inhalt in **einem** `max-w-content`-Wrapper (70rem) | die eine Stelle für A; B erweitert Single-`children` → N Panes |
| Lesespalte | `max-w-reading` (40rem), 47× im Gesetzestext | bleibt in A **und** B unangetastet → Normtext-Lesbarkeit geschützt |
| **Reiter-System** | `lib/tabs.ts` (localStorage `lexmetrik-tabs`), `useTabs`, `TabTracker`, `ReiterUebersicht`, Drag-Sort, **`?r=<n>` Mehrfachinstanz**, navigationsbasiert | **Fundament von B**: offene Reiter sind schon eine Pfad-Datenliste → Panes = 2–3 davon sichtbar |
| Scroll | global `window` + per-Reiter `ScrollWiederherstellung` (Schlüssel `tabSchluessel`) | in B pro Pane (eigene Scrollachse) statt global |
| Persistenz-Muster | `useSeitenleiste.ts`: typeof-window-Guard, localStorage, SSR/prerender-sicher (render-then-replace, kein Hydrate) | Blaupause für `useInhaltsbreite` (A) + `usePaneLayout` (B) |
| SSR/Prerender | zwei-Pass (`react-dom/static`→`renderToString`); Drift-Tore: kein `<script`, kein Fallback-Text | Default-Zustand = heutiges Verhalten ⇒ Golden bleibt byte-gleich |
| Tore | `npm run gate` · Golden byte-gleich · `routenManifest.test.ts` · axe-Tor | jede Phase: Default unverändert |

### ⚠ Kernbefund — Viewport-Breakpoints brechen in schmalen Panes
- Code reagiert auf **Bildschirm**breite: **450 Vorkommen** `sm:/md:/lg:/xl:` in
  **89 Dateien**; Container-Queries **nicht installiert, 0× genutzt**.
- Ein 600px-Pane auf 2560px rendert weiter `xl:`-Layouts (Gesetzesleser-TOC
  `xl:grid-cols-[16rem_…]`, Schnellrechner `lg:grid-cols-[18rem_…]`) → **sieht kaputt aus**.
- **Optimale Lösung = CSS Container-Queries:** jedes Pane `container-type: inline-size`;
  Layout reagiert auf **Pane**-Breite. Tailwind 3.4 braucht dafür
  `@tailwindcss/container-queries` (Plugin) **oder** handgeschriebene `@container`-Regeln.
- **Migration gestuft — Empfehlung CQ-1:** nur **layoutbestimmende** Breakpoints der
  **pane-fähigen** Seiten umstellen (Gesetzesleser-TOC, Schnellrechner, Rechtsprechung-Split,
  EntscheidLeser-`dl`; ~10–15 Stellen). Kosmetik (`sm:px-`, `sm:text-`) bleibt am Viewport.
  CQ-2 (alle Grids) / CQ-3 (alle 450) bewusst **nicht** — Risiko/Nutzen.
- **Dieser Container-Query-Schritt ist der eigentliche Hauptaufwand von B, nicht das Routing.**

---

## STRANG A — Inhaltsbreite-Umschalter „kompakt / breit"  *(✅ FERTIG, Commit `fc5dbb3c`)*

1. **`src/components/layout/useInhaltsbreite.ts`** (Vorlage `useSeitenleiste`): Zustand
   `'kompakt'|'breit'`, localStorage `lexmetrik-inhaltsbreite`, typeof-window-Guard,
   **Default `'kompakt'`** (= heute).
2. **`Shell.tsx`**: Wrapper `breit ? 'max-w-screen-2xl' : 'max-w-content'`
   (`mx-auto px-5 …` unverändert; `max-w-reading` NICHT anfassen).
3. **`Topbar.tsx`**: segmentierter Schalter `[kompakt|breit]` neben dem Sidebar-Schalter;
   `aria-pressed`, Tastatur, sichtbarer Fokus; ab `lg`, mobil aus.
4. **Tore:** Default kompakt ⇒ Golden byte-gleich · `npm run gate` grün · visuell 2560px + mobil.

---

## STRANG B — Split-View (2–3 Panes)  *(Fundament, mehrphasig)*

Jede Phase: Default = heutiges 1-Pane-Verhalten ⇒ Golden grün.

- **B-0 `RouteSwitch`-Extraktion** *(✅ FERTIG, Commit `2ed15aa7`)*: `<Routes>…</Routes>` aus
  `App.tsx` in `src/RouteSwitch.tsx` gezogen; App.tsx rendert `<RouteSwitch />` an gleicher
  Stelle. Verhaltensneutral bewiesen (golden byte-gleich, 57 Routen prerendern, Runtime-Smoke
  sauber). Risikoarmes Fundament gelegt.
- **B-0b Container-Query-Fundament** (siehe Kernbefund): Plugin **oder** `index.css`-Basis +
  **CQ-1**-Migration der pane-fähigen Layouts. **Der Hauptaufwand.**
- **B-1 Pane-Container in `Shell.tsx`**: `usePaneLayout` (sichtbare Pane-Pfade; Vorlage
  `useSeitenleiste`/`tabs.ts`). Shell rendert `panes.map(p => <Pane path=p/>)` mit Flex +
  Ziehgriffen (Ziehgriff-Code aus Shell.tsx wiederverwendbar). **Default 1 Pane = exakt heute.**
  - Primär-Pane: bestehender `BrowserRouter` (treibt URL — B3).
  - Sekundär-Pane: `<MemoryRouter initialEntries={[panePfad]}><RouteSwitch/></MemoryRouter>` —
    eigene History/Scroll, interne Links/Anker bleiben im Pane.
  - **Pro Pane eigene `<Suspense>` + `<ErrorBoundary>`** — ein ladendes/fehlerndes Pane
    leert die anderen nicht.
  - Jedes Pane `container-type: inline-size` + eigener Scroll-Container (`overflow-y-auto`).
- **B-2 Pane-Steuerung**: „nebeneinander öffnen" aus `ReiterUebersicht` + Reader/Rechner-
  Kontextpanel („Werkzeug rechts daneben" → Verzahnung). Schließen; max 3; responsiv 1/2/3.
  „Fokussiertes Pane" treibt URL/`document.title`/Tab-Write (sonst konkurrieren Panes).
- **B-3 Scroll & Fokus pro Pane**: `ScrollWiederherstellung`/`ScrollZuHash` von window auf
  Pane-Container umstellen; A11y (jedes Pane `<section aria-label>`, Tastatur-Wechsel).
- **B-4 Mobil-Faltung**: < `lg` → 1 Pane + Reiter-Umschaltung (kein 3-Spalten-Quetschen);
  bestehende Schubladen-Logik nutzen.
- **B-5 (optional) Layout teilen**: aktueller Pane-Satz → `?p=…`-Permalink (B3→B2-Brücke);
  eigener Schritt, erst nach B-0..4. `/split` noindex/SPA-only, nicht im Prerender-Satz.

### Querschnitt-Regeln (B)
- **Zustandslos:** nur Pfade speichern, nie Formularinhalt (wie `tabs.ts`). Harte Grenze.
- **§5:** keine zweite Routenquelle (`RouteSwitch` = eine), kein zweiter Tab-Speicher —
  Pane-Layout referenziert die Reiter-Identität (`tabSchluessel`).
- **Performance:** lazy-Chunks bleiben; FlexSearch-Index ist Modul-Singleton (1×, nicht pro Pane);
  in B-3 messen.
- **SEO/Prerender:** Split ist Client-Laufzeitsicht; prerenderte Einzelrouten unverändert
  (Default 1 Pane).

---

## Reihenfolge & Tore (Zusammenfassung)
A → B-0 → B-0b → B-1 → B-2 → B-3 → B-4 → (B-5 optional). Eigener Worktree;
jede Phase `npm run gate` grün + Default Golden byte-gleich; visuell breit/2-/3-Pane + mobil.

## Entscheide (alle getroffen 29.6.2026)
- ✅ **A: Breit-Wert** — `max-w-screen-2xl` (1536px) gewählt + umgesetzt (Strang A).
- ✅ **B-0b: Container-Query-Tiefe = CQ-1** (David 29.6.): nur die ~10–15 layoutbestimmenden
  Breakpoints der pane-fähigen Seiten; Kosmetik bleibt am Viewport.
- ✅ **B-0b: Technik = Plugin** `@tailwindcss/container-queries` (David 29.6.), nicht handgeschrieben.

> **⚠ Vor B-0b zu klären (Befund dieser Session):** B-0b liegt im Plan VOR B-1 (Panes). Setzt man
> `container-type: inline-size` schon am heutigen Einzel-Wrapper, feuern die `@xl:`-Utilities künftig
> auf die **Container**breite (Inhaltsfläche, schmaler als der Viewport um Sidebar + Padding) statt auf
> die **Viewport**breite — d. h. der Default ist NICHT mehr exakt das heutige Verhalten (Golden bleibt
> grün, weil es nur Engines prüft; die Verschiebung ist rein visuell). Entweder `container-type` erst in
> B-1 mit dem Pane-Container einführen, oder den Schwellenwert je Stelle so nachziehen, dass das
> Einzel-Pane optisch unverändert bleibt (Visualdiff-Tor). Darum ist B-0b eine **eigene fokussierte
> Session** wert.

> **Bekanntes Merkmal aus dem Review (kein Bug):** Der A-Umschalter erscheint ab `lg`,
> wirkt sich aber erst aus, wenn die verfügbare Inhaltsbreite 1120px übersteigt (abhängig
> von der ziehbaren Sidebar). In einem schmalen Band (Laptop + offene Sidebar) ist „Breit"
> sichtbar, aber ohne Effekt. Inhärent bei einem max-width-Umschalter; ein sauberer
> statischer Breakpoint existiert wegen der ziehbaren Sidebar nicht. Belassen bei `lg`.
