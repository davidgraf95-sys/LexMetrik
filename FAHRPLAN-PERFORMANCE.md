# FAHRPLAN — Geräte-Last / Performance (Detailquelle)

> **Heimat:** Verlinkt aus `ROADMAP.md` → Querschnitt-Band **`QS-PERF`**. Diese Datei ist
> **nur Detailquelle**, nie zweiter Einstieg (CLAUDE.md §14). Der Bau-Grundsatz steht
> verbindlich in **CLAUDE.md §15** und als **Leitprinzip 7** in `ROADMAP.md`.
>
> **Provenienz:** ultracode-Performance-Audit 30.6.2026 (Multi-Agent, Opus, adversarial
> verifiziert: 6 Dimensionen kartiert → jeder Befund unabhängig auf *reale Kosten* **und**
> *Logikverlust-Risiko* geprüft → Synthese). **25 verifizierte, logik-sichere Befunde aus 31
> roh; 38 Agenten.** Keiner der adoptierten Punkte erzwingt einen Treue-Kompromiss.

---

## Stand (Bau-Fortschritt)

**30.6.2026 — Quick-Win-Batch 1 gebaut** (Commit `9e914242`, golden 201 byte-identisch,
2870 Tests + 86 e2e grün, doppelter §9-Bug-Check):

- ✅ **Rank 1** — `React.memo` um `ArtikelLeser` (`parts.tsx`).
- ✅ **Rank 5** — `vendor-react`-manualChunks (`vite.config.ts`). Entry **323 → 101 KB roh**
  (30 KB gzip), `vendor-react` 73 KB gzip stabil benannt.
- ✅ **Rank 2 (CLS-Teil)** — `min-h-screen` am Reader-Ladezustand + Suspense-Fallback.
  **Messung (Preview, 4× CPU): CLS 0,64 → 0,002**, Score 42 → 60. Der Reader-Chunk-Vorlade-
  Teil von Rank 2 ist noch offen.
- ⏸️ **Rank 4 zurückgestellt** — `SektionBaumTOC`-memo + Handler-`useCallback` brauchen
  einen Hook-Reorder über die early-returns; laut Synthese marginal nach den Memos → eigener
  Schritt, nicht Quick Win.
- ⏸️ **NewsHeader-CLS (Rank 3) zurückgestellt** — saubere Reservierung bräuchte ein Magic-Number
  (§13-Konflikt); korrekt nur via Build-time-News-Prerender (M) → bleibt als nächster CLS-Schritt.

**30.6.2026 — Tor `check:perf-budget` (Item 0, Bundle-Teil) gebaut** (`scripts/check-perf-budget.ts`,
in `package.json` + deploy-check-Ritual nach dem Build, Chrome-frei/CI-tauglich): sichert die
vendor-react-Topologie (ein stabiler Chunk), die gzip-Budgets (Entry ≤ 60 KB, vendor-react ≤ 90 KB)
und den Doppel-React-Schutz (react-dom darf nur im vendor-Chunk liegen). Negativtests grün→rot→grün.
Offen am Tor: die **Lighthouse-Metrik-Schranken** (CLS/LCP/TBT unter 4× CPU) — bleiben vorerst
manueller Mess-Schritt im Deploy-Ritual (CI-Chrome noch nicht verdrahtet).

**5.7.2026 — Lighthouse-Metrik-Schranken verdrahtet** (Branch `feat/qs-perf-a-b`, Gate grün +
163 e2e grün): neues `check:perf-lighthouse` (`scripts/perf/lighthouse-budget.ts`) misst
CLS/LCP/TBT/TTI/Score auf `/gesetze/bund/OR` + Startseite im **Lighthouse-Mobil-Preset
(4× CPU + langsames 4G)** — startet `vite preview` selbst, nutzt Playwright-Chromium (in CI
ohnehin installiert; `CHROME_PATH`-Override). **Verdrahtung:** als **letzte CI-Stufe** in
`.github/workflows/ci.yml` nach Build + allen Treue-Toren (golden/smoke/struktur-konsistenz/e2e)
→ die §15-Gegenkopplung ist über die Schritt-Reihenfolge erzwungen (Treue rot ⇒ Job bricht vor der
Messung). Bewusst **nicht** im schnellen `gate` (der nicht baut). **Median aus 3 Läufen** je Seite
(CI; lokal 1, `PERF_RUNS`-Override) — der Lighthouse-Standard gegen Ausreisser-Flake auf dem geteilten
Runner. **Schwellen an der CI-Baseline kalibriert** (dort läuft das Tor): der erste CI-Lauf zeigte
OR CLS ~0,098 / TBT ~2,3 s / Score ~38 (lokal war OR CLS 0,005 / TBT 0,5 s / Score 56 — der langsame
2-Kern-Runner legt unter 4×-CPU echten Spät-Shift + Blocking-Time offen). Schwellen = beobachtetes CI-Ist +
Kopffreiheit: **CLS OR ≤ 0,15** (fängt die alte 0,64 mit Marge; FAHRPLAN-Eintritt war 0,25 → Ziel 0,10 →
0,15 = erster ehrlicher Staffel-Schritt), **Start CLS ≤ 0,10** (dort stabil 0,000); LCP/TBT/TTI/Score
grosszügige Deckel (OR LCP ≤ 12 s / TBT ≤ 4 s / TTI ≤ 14 s / Score ≥ 25; Start LCP ≤ 11 s / TBT ≤ 1,5 s /
Score ≥ 40). CI-Impact ~2 Min. **Verschärfung** der Deckel = dokumentierter Folgeschritt nach breiterer
CI-Baseline. Logikverlust: KEINER (reines Mess-Tooling, kein Produkt-Code/Output). Damit ist **QS-PERF a+b
komplett** (b lag schon in `main`, hier nur verifiziert + durch das Tor abgesichert).

**1.7.2026 — Quick-Win-Batch 2 gebaut** (Branch `feat/perf-batch2-render-cls-fonts`,
Gate grün: 2870 Tests + golden 201 byte-gleich + `check:struktur-konsistenz` + `check:perf-budget`,
plus 49 Reader/Startseiten/Rechtsprechungs-e2e grün; §9-Bug-Check + gemessen):

- ✅ **Rank 4** — Render-Hotpath. `SektionBaumTOC` (`parts.tsx`) `React.memo`; `tocToggle`/
  `springeZuSektion` als `useCallback` (Letzteres über den early-return gehoben — der in Batch 1
  zurückgestellte Hook-Reorder); Sektions-Bereichslabel + Einzelartikel-Flag in **einem** Bottom-up-
  `useMemo` `sektionMeta` `[sektionen,artIndex]` statt 2× O(Subtree) je Sektion je Scroll-Render.
  Labels byte-identisch (golden + struktur-konsistenz grün). Reine Laufzeit, kein Output.
- ✅ **Rank 3** — Startseiten-CLS. `NewsHeader` reserviert während des async-Ladens (`news===null`)
  **und** am geladenen Streifen dieselbe Mindesthöhe (`min-h-[12.5rem]`). **Gemessen** (Playwright,
  Preview): Streifen 11,61 rem Desktop / 11,17 rem mobil < 12,5 rem → `min-h` dominiert in beiden
  Zuständen → **CLS von NewsHeader = 0** (statt Voll-Höhe-Einwachsen). Echter Leerfall (leeres
  Register) kollabiert bewusst auf `null` (§8, in Prod nie — 272 BGE).
**1.7.2026 — Rank 11 (Fonts) gebaut** (Branch `feat/perf-fonts-fallback-metrics`, Gate grün + gemessen):

- ✅ **Rank 11** — metrik-angepasste Fallback-Fonts. `@font-face 'Geist Fallback'` (Arial) /
  `'Source Serif 4 Fallback'` (Georgia) in `src/index.css`, `size-adjust`/`ascent-`/`descent-`/
  `line-gap-override` **GEMESSEN** aus den echten fontsource-woff2 via `scripts/gen-font-fallbacks.ts`
  (`@capsizecss`, reproduzierbar über `npm run gen:font-fallbacks`) — nicht geraten. Fallback-Family
  direkt hinter dem Webfont in `--font-display`/`-sans`/`-serif`. **Verifikation:** Playwright-Messung
  Zeilenkasten Webfont↔Fallback **Δ 0,0 px** (Sans UND Serif) → font-display:swap erzeugt keinen
  Reflow mehr. CSS-only, reine Darstellung.

**1.7.2026 — Rank 2-Rest gebaut** (Branch `feat/perf-batch3-reader-preload`, Gate grün + gemessen):

- ✅ **Rank 2 (Reader-Chunk-Vorladen)** — die schweren Leser-Chunks (`GesetzLeser`/`EntscheidLeser`)
  werden nach dem Erstpaint **idle** vorgewärmt (`prefetchLeser` in neuem `src/leserPrefetch.ts`,
  gerufen via `requestIdleCallback`+setTimeout-Fallback aus `App.tsx`; Thunks = EINE Quelle §5, von
  RouteSwitch geteilt). **Gemessen** (Playwright): beide Chunks laden auf der Startseite OHNE
  Navigation → erstes Gesetz öffnet ohne Chunk-Parse-Warten/Spinner-Frame. Rein additiver Cache-Warm,
  off-critical-path (§6.4/§15/3). Der CLS-Teil von Rank 2 war schon in Batch 1 (min-h) gelöst.

**1.7.2026 — Rank 9 (Teil: In-Gesetz-Suche entprellt) gebaut** (Branch `feat/perf-batch4-suche-debounce`,
Gate grün + 15 Reader-e2e grün):

- ✅ **Rank 9 (Such-Debounce)** — die In-Gesetz-Suche filterte bei JEDEM Tastendruck ~1000 Artikel neu
  UND baute den IntersectionObserver neu auf (Jank auf schwacher CPU). Neu: `sucheDebounced` (200 ms,
  Leeren 0 ms/sofort für den Treffer→Artikel-Sprung) speist Treffer-Filter + Observer-Dep + Scroll-Rettung;
  das Eingabefeld bleibt an `suche` sofort responsiv. Reine Timing-Optimierung (§6.4): dieselbe
  `passtAufSuche`-Menge, dieselbe Ansicht — nur WANN gefiltert wird. Gilt auch im Einzel-Reader (nicht nur
  Split-View). **Verifikation:** Gate grün, `gesetze.e2e.ts:54` (In-Gesetz-Suche) + 14 weitere Reader-e2e grün.
- ⏸️ **Rank 9 (Pane-Open-Guard) offen** — «höchstens 1 schweres OR-Klasse-Pane gleichzeitig» braucht eine
  deterministische Heavy-Klassifikation aus dem Register + disabled-Zustand in der Split-View-Pane-Öffnung
  (eigener, split-view-spezifischer Schritt).

**Offen / nächste:** Lighthouse-Schranken am Tor (CI-Chrome) · News-Prerender (3-optional) ·
**M-Daten-Pfad → LCP** (6 idle-Defer *braucht Architektur-Entscheid*, 7 Web-Worker-Suche (QS-DATA-Vorbehalt, s. Rank 7),
8 Register-Sharding, 10 Snapshot-Format — **7/8/10 sind Risiko-Pfad → `check:gegenpruefung`**) ·
Split-View-Feinschliff (9 Pane-Guard, 12/13 marginal, 14) · optionaler build-time-Preload
der 2 latin-woff2 (LCP-sekundär, braucht hashfeste Injektion).

> **«Dry»-Grenze der sicheren Autonom-Arbeit (1.7.2026):** CLS (2/3), Render-CPU (1/4), Fonts (11),
> Bundle-Split (5) und Chunk-Preload (2-Rest) sind **erledigt + deployt**. Der grösste verbleibende
> Hebel ist die **OR-LCP** (6,2 s @ 4×-CPU) im M-Daten-Pfad — der braucht entweder einen
> Architektur-Entscheid (Rank 6, render-then-replace, ggf. Council) oder Risiko-Pfad-Zyklen mit
> Gegenprüfung + Snapshot-/Register-Regen (7/8/10). Das ist bewusst **kein** mechanischer Autonom-Edit.

---

## Der Anlass (gemessen, Produktion `lexmetrik.vercel.app`)

Lexmetrik ist eine **client-gerenderte Vite-SPA**. Lange Gesetze werden als HTML prerendert
(`dist/gesetze/bund/*.html`) und im Browser von React **neu aufgebaut** (render-then-replace,
**kein** `hydrateRoot`). Messung mit 4×-CPU-Drosselung (= schwaches/altes Gerät):

| Seite | Gerät | Score | LCP | TTI | TBT | CLS |
|---|---|---|---|---|---|---|
| `/gesetze/bund/OR` (≈930 KB HTML, ≈12 658 Tags) | schwach (4× CPU) | **42** | 6,2 s | 6,2 s | 330 ms | **0,64** |
| Startseite | schwach (4× CPU) | **64** | 4,0 s | 4,0 s | 40 ms | **0,57** |
| `/gesetze/bund/OR` (Vergleich) | schnell (kein Throttle) | 82 | 1,2 s | 1,2 s | 40 ms | 0,31 |

**Diagnose:** Geräte-Abhängigkeit bestätigt (Score 82 → 42). Der **Worst-Wert ist CLS 0,64**
(sichtbares Layout-Springen, trifft *alle* Geräte). Auf schwacher CPU kommt die Hydration des
12 658-Knoten-DOM + der synchron geladene 1,9-MB-Snapshot + 1,2-MB-Struktur-Sidecar hinzu.
React Compiler ist **aus** → Memoisierung ist manuell (Scroll-Spy re-rendert ~1000 Artikel).

---

## Bau-Grundsatz (verbindlich — Kurzfassung, voll in CLAUDE.md §15)

**Lexmetrik wird so gebaut, dass es den Computer nicht merklich langsamer macht — SOLANGE
daraus kein Logikverlust entsteht. Bei Konflikt gewinnt IMMER die Treue.** «Logikverlust» =
Verlust an Inhalts-Treue (vollständiger Normtext/Tabellen/Fussnoten), Rechtsregel-Treue
(Rechner-Werte), Funktions-Treue (Ctrl+F über das ganze Gesetz, `#art_`-Deep-Links,
Print/PDF-Vollständigkeit, Scroll-Spy/TOC, Split-View-Pane-Zustand) oder golden-Byte-Gleichheit.
Jede Optimierung trägt eine **explizite Logikverlust-Bewertung**; ohne sie wird sie nicht gemerged.

**Bewusst verworfen** (würden Treue kosten): DOM-entfernende Virtualisierung von Normtext ·
`hydrateRoot` gegen den String-Builder-Prerender · Visible-Band-Teilparse der Struktur ·
prerenderter Text *statt* React-Baum · global-token-gekeyte Reader-Caches (Erlass-Kollision).

---

## Das Tor «perf-budget» (operationalisiert die Garantie)

Neues npm-Script **`check:perf-budget`**, eingehängt in die `npm run gate`-Kette (nach Vorbild
`check:gegenpruefung`/golden). Lighthouse-CI gegen den lokalen Production-Build
(`npm run build && npm run preview`), **mobil + 4× CPU + 3G** (das gemessene Worst-Case-Profil).
Assertions als **harte** CI-Fehler. Schwellen gestaffelt — Eintritt «nicht schlechter als heute»,
dann verschärfen:

**`/gesetze/bund/OR` (mobil, 4× CPU):** CLS ≤ 0,25 → Ziel **0,10** (heute 0,64, höchste Prio) ·
LCP ≤ 4,0 s → 2,5 s · TBT ≤ 250 ms → 200 ms · TTI ≤ 5,0 s · Score ≥ 55 → 75.
**Startseite:** CLS ≤ 0,10 (heute 0,57) · Score ≥ 75 (heute 64).
**Bundle:** Entry-Chunk gzip ≤ 110 KB nach `vendor-react`-Split · kein OR-Sync-Chunk > 170 KB gzip ·
`vendor-react` als stabil benannter Chunk vorhanden · OR-Sync-JSON ≤ 2,1 MB roh (kein
Kanton-Register, kein 16-MiB-Suchindex im kritischen Pfad).

**Treue-Gegenkopplung (das Tor zählt NUR, wenn diese grün sind):** `golden:vergleich`,
`check:normtext`, `check:struktur-konsistenz`, `check:suchindex` byte-sauber **+** ein
Reader-Smoke (Playwright via Bash) auf `/gesetze/bund/OR`: Ctrl+F findet einen Artikel der
*letzten* Sektion · `#art_X`-Deep-Link springt korrekt · Print-to-PDF enthält den vollständigen
Normtext · Fussnoten-Popover öffnet. Schlägt ein Treue-Check fehl, ist der Perf-Gewinn **ungültig**. **`check:perf-budget` ist zugleich Abnahme-Kriterium für jede QS-DATA-Etappe mit UI-Anteil** (Edge-Suche/Long-Tail-Route dürfen den kritischen Pfad nicht belasten; `FAHRPLAN-DATENHALTUNG.md` §4).

---

## Die priorisierte Abarbeitung (nach ROI; Treue-Vorbehalt je Punkt)

**Empfohlene Reihenfolge:** zuerst Tor (0) bauen → billige Memoisierung (1) + CLS-Reservierungen
(2, 3) → Bundle-Split (5) → M-Daten-Pfad (6–8, 10) → Render-Hotpath-Rest (4, 12) → Split-View
(9, 14) → Fonts (11) → Low-Prio (13). `4`/`12` und `9`/`14` bringen nach den Memos nur noch
marginalen Zusatzgewinn — entsprechend spät.

> **Pfad-Hinweis:** bloße Dateinamen unten beziehen sich auf den Reader-Ordner
> **`src/pages/gesetz-leser/`** — d. h. `parts.tsx`, `inhalt.tsx` liegen dort
> (verifiziert 30.6.: `parts.tsx:16` `ArtikelLeser`, `parts.tsx:342` `SektionBaumTOC`,
> noch kein `React.memo` im Leser). `main.tsx`/`App.tsx` liegen unter `src/`,
> `seo-detail.ts`/`artikelVolltext.ts` unter `src/lib/`.

| # | Wirkung/Aufwand | Logikrisiko | Maßnahme |
|---|---|---|---|
| 0 | — | — | **Tor `check:perf-budget`** bauen (siehe oben) — macht alle folgenden Schritte prüfbar |
| 1 | **hoch/S** | keins | **`React.memo` um `ArtikelLeser`** (`parts.tsx:16`, Default-Komparator). Kappt die Scroll-Spy-Re-Render-Kaskade über ~1000 OR-Artikel. Props sind über Scroll-Renders bereits referenzstabil → memo bricht bei `setAktArtikel`/`setAktivIds`/`setTocBaum` ab. `ArtikelBody` **nicht** memoisieren (No-op). Kein golden-Lauf nötig (reine Laufzeit). *Beste ROI.* |
| 2 | **hoch/M** | niedrig | **CLS-Collapse der Lese-Seiten** verlustfrei beheben: token-basierte **Mindesthöhe** für Suspense-Fallback (`App.tsx:151`) + Reader-Ladezustand (`inhalt.tsx:639`), Erlass-Kopf sofort aus `ladeErlassKopf`; **Reader-Chunk der Detailrouten vorladen** (eager-Import/modulepreload) → kein Spinner-Frame. `createRoot`/render-then-replace **bleibt**. Größter Hebel auf CLS 0,64. |
| 3 | mittel/S | keins | **Startseiten-CLS:** `NewsHeader`-Container (`Startseite.tsx:51`) reservierte Mindesthöhe (Mass-Token, §13). Optional größer: News build-time aus dem Register ins HTML prerendern (0 Shift + LCP). |
| 4 | mittel/S | niedrig | **Render-Hotpath:** Sektions-Bereichslabel/Artikelzahl in **einem** Bottom-up-`useMemo` `[sektionen,artIndex]` vorberechnen (statt 2× O(Subtree) je Sektion je Render, `inhalt.tsx:762`); `tocToggle`/`springeZuSektion` `useCallback` (**`sektionen` in Deps**, sonst stale Sprung), `SektionBaumTOC` (`parts.tsx:342`) `React.memo`. Labels byte-identisch → `check:struktur-konsistenz`+golden grün halten. |
| 5 | niedrig/S | keins | **`vendor-react` manualChunks** in `vite.config.ts` — nur `react`/`react-dom`/`react-router`(+`scheduler`) aus dem 323-KB-Entry isolieren, Default sonst unberührt. Hilft Repeat-Visits nach Deploy (stabiler Cache-Chunk), nicht den Cold-LCP. Verlustfrei (golden pinnt Outputs, nicht Asset-Hashes). |
| 6 | **hoch/M** | mittel | **OR-Reader von der kritischen Last entlasten:** Fetch+Parse+Reconcile und die zwei Struktur-Loads (`inhalt.tsx:178`) hinter `requestIdleCallback` (+`setTimeout`-Fallback, **immer feuernd**, nie an Sichtbarkeit gaten). **Vollen Parse behalten** (kein Visible-Band-Teilparse → verlöre G11-Sektions-Fussnoten/Kopf). `content-visibility:auto` behalten (alle Knoten im DOM für Cmd+F/Anker/Print). **Kein** naives `hydrateRoot`. Mobile-CLS gegen 0,64 nachmessen. |
| 7 | mittel/M | niedrig | **Volltext-Suche in Web-Worker:** 16-MiB-JSON-Parse + FlexSearch-Build + Query in einen Module-Worker (`artikelVolltext.ts:33`), **byte-identische** Index-Config. `useUniversalSuche.ts:52` sync→async. Generator + `artikel-bund.json` unangetastet; Treffer (IDs/Reihenfolge/Snippets) für Query-Set vorher/nachher = identisch. §8-Fallback erhalten. **QS-DATA-Vorbehalt:** evtl. hinfällig, wenn die Edge-Suche (`FAHRPLAN-DATENHALTUNG.md` E2) den 16-MiB-Client-Index ablöst — vor Bau QS-DATA-Stand prüfen. |
| 8 | mittel/M | niedrig | **`register.json` (900 KB, 1460 Erlasse) generator-seitig sharden:** `register-bund.json` (~93 KB) + `register-kanton.json` (~623 KB), Union datengleich. Inhaltsseite lädt Shard nach Route-Ebene; Shell/Reiter laden bedarfsgesteuert (graceful Fallback). `ladeBrowseManifest()` merged lazy für Suche/Übersicht/SEO. `normtext-register.test` (Union==Original byte-gleich) mitziehen. Spart ~623-KB-Kanton-Parse auf jeder Bund-Seite. |
| 9 | mittel/M | niedrig | **Split-View:** Suchfeld ~250 ms **entprellen** (speist Treffer + Observer-Dep, `inhalt.tsx:545/773`), Effekt-Dep auf getrimmt/entprellt; **Pane-Open-Guard:** höchstens 1 schweres (OR-Klasse) Gesetz-Pane gleichzeitig, deterministische Heavy-Klassifikation aus Register, ehrlicher disabled-Grund. **Kein** Artikel-Windowing/naives Pane-Unmount (Ctrl-F/Pane-State-Verlust). Sekundär-Pane-Mount auf idle defern. |
| 10 | mittel/M | niedrig | **Snapshot-Format verschlanken:** konstante Provenienz (`ebene/quelle/erlass/stand/abgerufen/fassungsToken/quelleUrlBasis`) in den **Datei-Header hoisten**, pro-Artikel-`sha` entfernen (bleibt in golden + neu berechenbar). `laden.ts`/`browse.ts` **rehydrieren** je Eintrag → NormPopover/§7-Zitat/SEO sehen unveränderte Form. Alle 218 Bund- + Kanton-Dateien neu generieren; `check:normtext`+golden grün. Spart ~18 % OR.json-Bytes. |
| 11 | mittel/M | keins | **Metrik-angepasste Fallback-Fonts:** `Geist-fallback`/`SourceSerif-fallback` mit gemessenen `size-adjust`/`ascent`/`descent`/`line-gap-override` vor den Webfont setzen (`font-display:swap` behalten); crossorigin-**Preload** nur der zwei latin-woff2, build-time injiziert. CSS-only. *Hinweis:* dominanter OR-CLS ist der prerender(class-los)→hydration(serif)-Reshuffle (Punkt 2/6), Fonts sind Sekundärfix. |
| 12 | mittel/M | niedrig | **`aktArtikel`-Tracker auslagern:** Single-Observer bleibt im Parent; `useState(aktArtikel)` → externer Store (`useRef`+notify / `useSyncExternalStore`), `meldeInhaltsKopf`-Effect in immer-gemountete `<KopfMelder>`-Kindkomponente. **Nach 1/4 priorisieren** — wenn `ArtikelLeser` memoisiert ist, ist der Zusatzgewinn marginal. |
| 13 | niedrig/S | keins | **localStorage-divergente Startblöcke** (Favoriten/Zeiterfassung) gegen CLS pinnen: Client-Initialstate auf Server-Zustand (STANDARD/`[]`), persistierten Stand per `useEffect` nach Mount; variable Region min-height. *Niedrige Prio:* below-fold, 0 Anteil an gemessener CLS (leeres localStorage). |
| 14 | niedrig/S | niedrig | **Split-View-Feinschliff:** Popover-Reposition (`ArtikelBody.tsx:70`) rAF-entprellen, Scroll-Listener `{passive,capture}`; erlass-reine Reader-Indizes via **WeakMap** auf die `eintraege`-Referenz teilen (kein global-token-Key → keine Erlass-Kollision). Nicht standalone shippen — Rider auf Punkt 9. |

---

## Constraints & Hygiene

- **§6/§9/§14:** jede Maßnahme verhaltensneutral beweisen (golden byte-gleich, wo Output entsteht);
  Risiko-Pfade (Punkt 7/8/10 berühren Snapshot/Suchindex-Generatoren) durch `check:gegenpruefung`;
  Commit-Trailer `Roadmap: QS-PERF`. **Push/Deploy nur auf Davids Ja (§9).**
- **Worktree-Isolation (§12):** Punkt 5 (`vite.config.ts`), 8/10 (Generatoren + `public/normtext/**`)
  und 2/6 (Reader-Kern) sind Kollisionsflächen → bei Parallelarbeit eigener Worktree.
- **Kein 26×-Slot:** Punkt 10 regeneriert alle Snapshots — das ist **kein** Daten-Bulklauf neuer
  Inhalte (nur Format-Reserialisierung, Union byte-gleich), öffnet also keinen 26×-Slot.
- **Zeitsperre (`[OF]`):** alle Punkte sind ohne Davids Fachzeit baubar (reine Darstellungs-/Lade-/
  Build-Schicht, Treue durch Tore gesichert).

---

## Architektur-Befunde aus dem Bau (30.6.2026 — präziser als der Roh-Audit)

Beim Umsetzen zeigten sich zwei Subtilitäten, die der High-Level-Audit überging — **vor dem Bau
der jeweiligen Items beachten:**

1. **Das Register IST der Inhalts-Index — nicht defer-bar, nur shard-bar (betrifft Rank 8 + 6).**
   `ladeBrowseManifest()` (`browse.ts:32`) ist gecacht, und **`ladeErlass(key)` ruft es intern auf**,
   um `e.datei` (die Snapshot-Datei) zu finden. Das 920-KB-`register.json` liegt damit ZWINGEND im
   kritischen Ladepfad — ein `requestIdleCallback`-Defer würde den Inhalt selbst verzögern. Korrekt
   ist nur **Sharding** (`register-bund.json` ~93 KB / `register-kanton.json` ~623 KB): der Reader
   einer Bund-Seite findet `e.datei` im 93-KB-Bund-Shard. **Achtung Kopplung:** `Shell.tsx:212` lädt
   dasselbe Manifest (gecacht, für Breadcrumb/Pane-Titel) — schert man nur den Reader auf den Shard
   aus, laden **beide** (Shard + volles Register) → schlimmer. Sharding muss **koordiniert** über
   Generator + `browse.ts` + `inhalt.tsx` + `Shell.tsx` (+ `normtext-register.test`) erfolgen; ein
   zusammenhängender M/L-Umbau am Inhalts-Ladepfad, eigener Zyklus mit golden + Doppel-Bug-Check.
2. **render-then-replace vereitelt naives idle-Defer für LCP (betrifft Rank 6).** Der Reader nutzt
   `createRoot` (`main.tsx:39`) — React **verwirft** das prerenderte 930-KB-HTML beim Mount. Der
   Audit nimmt an «das prerenderte HTML trägt LCP, während der React-Baum nachmountet» — das gilt
   NUR, wenn man das HTML nicht sofort verwirft. Naives `requestIdleCallback` um den Fetch könnte LCP
   **verschlechtern** (Inhalt malt später). Der LCP-Hebel braucht einen echten Architektur-Entscheid
   (prerendertes HTML als First-Paint stehenlassen, bis die Daten da sind — oder Snapshot verkleinern,
   Rank 10) → eigener Design-Schritt (ggf. Council/Brainstorming), kein mechanischer Edit.
   **Zusatz-Risiko:** `ladeStruktur` (1,2 MB, Marginalien/Fussnoten/TOC) zu defern droht den gerade
   erreichten CLS=0 zu zerstören (späte Marginalien-/TOC-Insertion) — vor jedem Struktur-Defer Mobile-
   CLS gegenmessen.

## Audit-Rohdaten

Vollständige 25 verifizierten Befunde (je mit `costEvidence`, `logicLossAssessment`, `recommendedFix`,
`verdict`) im Workflow-Ergebnis vom 30.6.2026 (Task `wotwblspd`). Bei Bau eines Punktes die dortige
`logicLossAssessment` lesen — sie nennt je Befund die **verlustfreie Variante** und die verworfene
riskante Variante.

---

## Nachlese aus #312/#314 + echter CLS-Defekt (§14-Intake 20.7.2026)

### A · Der Tag in einem Satz
#312 hat den TBT-Deckel auf `/gesetze/bund/OR` gegen die gemessene Runner-Verteilung kalibriert,
#314 hat das CI-Falsch-Rot von 39 % auf ~2 % gedrückt. Beides war richtig — aber der Zustand, den sie
hinterlassen, ist **ein Übergangszustand**, und zwei neue blinde Flecken sind dabei entstanden.

### B · Fünf offene Posten, nach Hebel geordnet (`QS-PERF` Teil e)

**1. LCP-Element-Attribution — die dringendste Einzeländerung.**
`largest-contentful-paint-element` aus dem LHR ins Log **und** nach `dist/_perf/lighthouse.json`.
~5 Zeilen, reine Diagnose, kein Verhaltensrisiko. Sie beantwortet die derzeit teuerste offene Frage:
Die **OR-LCP-Bimodalität** (8 Läufe ~3,5 s, 8 Läufe ~11,4 s) ist entweder ein Messartefakt — oder der
**Replace-Repaint ist das LCP-Element**. Im zweiten Fall ist der 11,4-s-Modus **reales Nutzererleben**
und der 3,5-s-Modus misst das falsche Ereignis. **Jede weitere Messreihe ohne diese Angabe ist
verschenkt**, darum steht sie vor allem anderen.

**2. TBT auf OR wieder scharf stellen.** Aktuell **6500 — bewusst stumpf**. Damit trägt **CLS (0,05)
derzeit allein die Regressions-Last**. Erst nach Posten 1 und nach neu erhobener Verteilung nachziehen.

**3. Zwei blinde Flecken, die #314 selbst erzeugt hat.** Ehrlich mitführen, nicht verschweigen:
- **(a) Warm-/kumulative Regressionen.** Die Chrome-Isolation macht jeden Lauf **kalt**. Die dabei
  entfernte «Drift» war zugleich ein **akzidenteller Detektor für aufschaukelnde Degradation**
  (Speicherlecks, nicht abgeräumte Listener, Cache-Bloat). Defekte, die **ab der 2. Navigation**
  auftreten, werden jetzt **nie** gemessen. Antwort: eine bewusste, getrennte Warm-Messreihe — nicht
  die Isolation zurücknehmen (die war richtig).
- **(b) Interaktions-Spätshifts.** `nurAbInstall` verbannt **Layout-Sprünge >500 ms nach Interaktion**
  aus **jedem** Budget. Auf langsamen Geräten sind genau die real sichtbar. Antwort: eigene
  Interaktions-Messung, oder ausdrücklich dokumentierter Verzicht — aber keine stille Lücke.

**4. Versions-Pinning der Deckel dokumentieren.** Die Schwellen sind implizit an eine
**Lighthouse-Version gepinnt**; das steht bisher **nirgends**. Ein Lighthouse-Upgrade verschiebt sie
still und macht jeden Vorher-/Nachher-Vergleich ungültig. Version im Tor festhalten und beim Upgrade
neu kalibrieren.

**5. Revisions-Politik für legitimes Wachstum.** Ohne Politik wird jeder Deckel irgendwann «mal eben»
hochgesetzt und misst danach nichts mehr. **Vorschlag: Deckel = Ist + max(3 sd, ~25 %)**, und
**Anhebung nur mit Mess-Beleg** (Verteilung, nicht Einzelwert). Das ist die verallgemeinerte Form der
Lektion aus #312: `sd ≈ 687 ms` bedeutete, dass der alte Deckel 4000 bei z ≈ +0,65 lag — also ~26 %
Rot allein aus Rauschen.

### C · Serif-Preload (`QS-PERF` Teil f)
`font-display:optional` hat die CLS-Ursache (Serif-Font-Swap unter Linux) beseitigt — **um den Preis**,
dass die Serif-Schrift bei langsamer Verbindung im ersten Paint gar nicht erscheint und der Wechsel
erst beim nächsten Besuch sichtbar wird. Ein gezielter `preload` **nur** der im ersten Viewport
benutzten Schnitte holt den Trade-off zurück. **Auflage: CLS vorher/nachher messen** — ein Preload, der
CLS wieder anhebt, ist keine Verbesserung, sondern ein Rückschritt mit Extra-Bytes.

### D · Der echte CLS-Defekt auf `/gesetze` — eigener Schritt `W2·15-CLS`
**Nicht Teil von `QS-PERF`, sondern Produktfehler mit eigener Einheit (§14.2).** `QS-PERF` ist Arbeit am
**Tor**; dies ist ein Defekt, den Nutzer:innen sehen. Werden beide vermischt, verdeckt die
Tor-Kalibrierung den Defekt — exakt das ist am 20.7. passiert.

- **Befund:** `/gesetze` misst **CLS 0.109 unter 8× CPU**; Ursache sind **zwei unreservierte
  Platzhalter**, die asynchron einwachsen.
- **Warum kein Tor es fing:** der CLS-Deckel läuft auf `/gesetze/bund/OR` und der Startseite —
  **nicht** auf der Übersicht `/gesetze`. Der Defekt lief an allen Budgets vorbei.
- **Fix nach §15.2:** Platz **reservieren** (token-basierte Mindesthöhe am **prerenderten** Element),
  Client-Initialstate auf den Server-Zustand pinnen. Niemals durch weniger Inhalt lösen.
- **Zweiter, gleich wichtiger Teil: `/gesetze` in die gemessenen Routen aufnehmen.** Ohne das fällt
  dieselbe Klasse beim nächsten Mal wieder durch — ein Defekt, den kein Tor beobachtet, ist ein Defekt,
  der wiederkommt.
