# LexMetrik — Struktur & aktueller Stand

**Verbindliche Grundprinzipien: `CLAUDE.md`** (§1 Logik vor allem; §6
Refactoring-Protokoll) — dieses Dokument hier beschreibt den Zustand.

**Dokument-Ordnung im Root (Aufräumung 10.6.2026, Auftrag David):** Im Root
liegen nur AKTIVE Steuerungsdokumente — CLAUDE/README/STRUKTUR/HANDLUNGSPLAN,
Projekt- und Strategie-Papiere (PROJEKTBESCHRIEB, STRATEGIE-PLATTFORM,
WACHSTUM-REGLEMENT, BETRIEB, KATALOG-ROADMAP, ABNAHME-AG-BAUSTEINE) und die
laufenden Fahrpläne (GRUNDLAGEN, AG-/GMBH-GRUENDUNG, BGER-RECHTSWEG,
VORLAGEN-AUSBAU, VERTRAGS-VARIANTEN, FUNDAMENT-UMBAU). Abgeschlossene
Fahrpläne (DESIGN, RECHNER-DESIGN, VEREINHEITLICHUNG, TOKEN-DISZIPLIN — ins
Archiv 13.6.2026) und historische Dokumente liegen in
**`archiv/`** (Index: `archiv/README.md`; Dateinamen unverändert, damit
Verweise in Code-Kommentaren per grep auffindbar bleiben). Wissens-Quellen
(PDF/DOCX, gitignored) in `bibliothek/quellen/` (`SICHTUNG.md`).

**Pflegeregel Session-Karten (Token-Disziplin 11.6.2026):** Dieses Dokument
wird in jeder Session und jedem Subagenten gelesen — Karten abgeschlossener
Sessions (älter als ~2 Arbeitstage) wandern darum BYTE-GENAU nach
`archiv/STRUKTUR-SESSIONKARTEN.md` (neue Blöcke oben anhängen); hier bleibt
der Verweis-Abschnitt. Offene Abnahmen sind davon unberührt (Spiegel:
`ROADMAP.md` → «Abnahme-Warteschlange»; das frühere `HANDLUNGSPLAN.md` ist
in `ROADMAP.md` eingefaltet und nach `archiv/` verschoben).

## Session 2.7.2026 — OCL-Abbau (Rechtsprechung/Suche) + Konsolidierung auf EIN `main` — gepusht, NICHT deployed

**Auftrag David:** aus OpenCaseLaw (`caselaw-repo-1`, CC0/MIT) alles für Lexmetrik Nützliche heben + einbauen. Regeln: **OCL-first** (zuerst OCL-Code nach Lösung durchsuchen, dann portieren), **Fable plant / Opus baut**, Bug-Check + Gegenprüfung zwischen JEDEM Schritt.

**Gebaut + gegengeprüft (ex `feat/ocl-abbau`, jetzt in `main`):** W0 ECLI (Mint + alle 342 Snapshots) · W2 Zitat-Extraktion (`_INVALID_LAW_CODES` 151 verbatim; `[ab]?`-BGE-Fix besser als OCL) · **W3 Pro-Artikel-Leitfälle** (`proNormArtikel`, topisches In-degree) — Gegenprüfung fing echten Bug **StG föderal/kantonal-Kollision** → OCL-`_SR_NUMBER_MAP`-aligned gefixt, auch erlass-eben proNorm (#12) · W9 OCL-Such-Vokabular (232 Einträge) · R1 Verweis-Audit (Lexmetrik VORAUS bei Chips/Norm↔Entscheid). **R2 FR/IT-Aliase von Gegenprüfung widerlegt (CO₂→OR, ital. CP/I→StGB) → revertiert (§1).**

**Konsolidierung (Auftrag «nur ein main»):** PR#78 Normtext + PR#79 QS-GP-Engines + OCL-Arbeit + S7-INDEX-Fix zu **einem `main` vereint**, alle Seiten-Branches + Worktrees entfernt, Register-Union aufgelöst. Gepusht, **CI GRÜN**. **DEPLOYED 2.7. auf PROD `lexmetrik.vercel.app`** (Commit `a3769d72`, asset `index-zaijVI8Z`; §9-Ritual komplett: alle Tore + 2 unabh. Bug-Checks grün; Nachkontrolle: 8 Kernrouten HTTP 200 inkl. `/gesetze/bund/OR` + `/rechtsprechung`, Asset-Hash live=lokal ✓).

**Verifikation:** `gate` GRÜN (tsc · 3013 Tests · lint · build · **golden byte-gleich 201** · check inkl. gegenprüfung/plan · e2e 86 · perf-budget); 2 unabhängige §9-Bug-Checks (Code-Lupe + empirische Repros) grün.

**Offen → Bauplan `PLAN-OCL-ABBAU.md §OFFENE PUNKTE`:** #16 R2-neu-MIT-Wächtern (CO₂/Ausland/Artikel-Plausibilität) · #17 norm-index `proNormArtikel`-Split (~380KB von keiner UI gelesen, non-blocking) · OCL W1/W4–W13 · HF-Datensatz `voilaj/swiss-caselaw`-Entscheide (Port-Oracle/Graph-Feature) · Fedlex-Portfolio (Parallel-Session). **Bauplan-REWORK = andere Session.**

## Session 2.7.2026 — Normtext Phase-1-Fundament (rein HTML, 4 von 5 Punkten) + verlässliche-Umwandlung-Spec (Fable-Ultracode) — Branch `feat/normtext-phase1-fundament`

**Auftrag David:** Fable/Ultracode-Untersuchung «verlässliche Umwandlungsstruktur HTML/AKN-XML → Normtext (nur Bund), Tabellen + Links besser als Fedlex», dann **ersten Bau-Schritt bauen (rein HTML, Opus)**.

**Spec (Fable-Ultracode, 30+15 Agenten):** `docs/superpowers/specs/2026-07-02-verlaessliche-normtext-umwandlung-bund.md` — Verdikt **Hybrid «XML-Träger, HTML-Arbiter»** (pro Erlass eine Quelle `source=akn|html`), neues Tor `check:akn-containment`, Nordstern = einwandfreie Tabellen + zielgenaue Links. Verlinkt aus `FAHRPLAN-NORMTEXT-DARSTELLUNG.md §Quell-Architektur`.

**Batch (§7 der Spec), je eigener §6-Schnitt, golden-gegated, Opus:**
- **P2 Split-sup-Merge** (`extrahiere-fedlex.ts`): gespaltene Absatznummer `<sup>N</sup><sup>bis</sup>` → «Nbis» verklebt, «bis»-Leak weg. **6 Blöcke / 5 Erlasse** (GEBV_SCHKG 1bis · HMG 1bis+2bis · KLV 2bis · CO2_GESETZ 2bis · VRV 1ter). Exponenten-Schutz (72³/m² nie verklebt); AVIG art_13 (aufgehobener Bereich «2bis und 2ter …») bewusst per Guard ausgeschlossen (R7-Follow-up).
- **P4 Kachel-Fussnoten-Leak** (`parseBildKacheln`): SSV annex_2 «4.77.1 …(Art. 59)379» → «379»-Fussnote entfernt (+ `<dt>/<dd>`-Konsistenz, 0 Kollateral).
- **P1 sha-Blindstelle** (`sha256Bloecke`): sha deckt jetzt `mehrspaltig.spalten` (Bund-Tabellen-Überschriften+Typen) mit ab — **72 Snapshots re-baselined, nur sha, 0 Content-Drift**.
- **P5 [tab]-Negativ-Lexikon** (`check:invarianten`): Artefakt-Prüfung `[tab]`/`data-message` über alle Textfelder mit Artikel-Zähl-Register (23 Bestandsstellen/13 Art. als Expected-Fail; neue/zusätzliche `[tab]` → hart). Fail-Pfad getestet.
- **P3 Drop-Klasse laut (OR 361/362) — DEFERIERT:** braucht korpusweite Kalibrierung der nicht-erfassten `<p>`-Klassen (`man-template-tab-krpr`/`-kpf` u.a.), Keim der §4-Quell-Containment-Arbeit → eigener Schritt, nicht ins Tor gerusht (§1/§6).

**Verifikation:** `npm run gate` GRÜN (tsc/vitest/**golden byte-gleich**/lint/check); 6 Normtext-Tore grün. **Adversariale Gegenprüfung (unabh. Opus, frischer Kontext) BESTANDEN** — 6 Blöcke + SSV-Kachel zeichenweise gegen amtl. Fedlex-HTML, Exponentenschutz korpusweit 0 Fehlklebung, sha-Only 66 Dateien 0 Waisen; `npm run gegenpruefung:ok` quittiert (Hash da837c78). **Nebenbei §14.1:** verwaisten `FAHRPLAN-OPENCASELAW-QUELLEN.md` (Parallel-Session-Analyse) in ROADMAP W2·6 als `[D]` verankert (QS-PH grün).

## Session 1.7.2026 — Split-View-Breadcrumb klickbar (pane-lokal) — Branch `fix/split-view-breadcrumb-klickbar`, PR + Auto-Merge, Deploy §9 offen

**Bug David:** «Breadcrumbs nicht mehr klickbar.» **Root Cause (systematisch, Browser-verifiziert):** kein Perf-Regressions-Bug —
in der Einzelansicht war die Breadcrumb immer klickbar (`InhaltsKopf` → `<Link>`). David war im **Split-View** (persistiert
`localStorage["lexmetrik-panes"]`); dort rendert die `PaneKopf`-Titelleiste die Breadcrumb, die **per Design statisch** war
(`PaneKopf.tsx`: „keine Navigation im Pane", alle Labels `<span>`, `to` ignoriert). Der `PaneKopf` liegt zudem AUSSERHALB des
Pane-`UNSAFE_NavigationContext`, ein `<Link>` hätte das ganze Fenster wegnavigiert.

**Fix (Auftrag David 1.7.: klickbar, PANE-LOKAL navigieren):** neuer Prop `PaneKopf.onBreadcrumb(to)` → Krümel mit `to` werden
`<button>` (Blatt bleibt `<span>`), kein globaler `<Link>`, kein `<nav>`-Landmark. **Sekundär-Pane** (`Pane.tsx`): Klick über
den Pane-eigenen Navigator (`setHist`-push). **Primär-Pane** (`Shell.tsx`): Klick über den Haupt-Router (`navigate`).

**Verifiziert:** Browser live — Sekundär-Krümel navigiert NUR das Pane (Top-Level-URL + Primär-Pane unverändert), Primär-Krümel
bewegt den Haupt-Router. Neuer SSR-Unit-Test `paneKopfBreadcrumb.test.tsx` (TDD rot→grün). **`npm run gate` GRÜN**
(tsc/vitest/**golden byte-identisch**/lint/check — reine Darstellung §3/§6.4, kein Logik-/Prerender-Drift; kein Risiko-Pfad →
`check:gegenpruefung` n/a). **Push/Deploy §9: PR + Auto-Merge bei grüner CI; Prod-Deploy wartet auf Davids Ja.**

## Session 1.7.2026 — Bilder & Formeln + SSV-Signal-Tabellen (Worktree `normtext-bilder-formeln`, gegated, Push/Deploy §9 offen)

**Auftrag David: amtliche Bilder/Formeln erfassen + die «schrecklich formatierten» SSV-Tabellen fixen (dieselbe Ursache), nachhaltig/einfach.** 3 Commits (§14.2 Daten/Render/Doku getrennt).
- **Daten** (`68b75d18`): Fedlex-`<img>` (Piktogramme SSV/VTS/chem., Formeln-als-Bild KKG/DBG/FZV/LSV) wurden von `entferneTags` gedroppt → jetzt **`bild`** (Standalone) / **`bildKacheln`** (flaches Karten-Raster NUR bei reinen Piktogramm-Katalogen; gemischte Datentabellen bleiben `mehrspaltig`, §1). Generator `ladeBilder`: rel. src → amtl. Filestore-URL, **selbst gehostet** unter `public/normtext/bilder/<erlass>/` (445 Dateien), **sha**/idempotent/Escape-Hatch. Fedlex-`[tab]`-Spacer gestrippt. Catch-all `ergaenzeFehlendeBilder` → **Containment 455/455 distinct**. Neues Tor **`check:bilder`**. Alle Bund neu generiert, **Engine-Golden byte-gleich**, Daten-Index re-gesegnet.
- **Render** (`5556abc5`): `BildElemente.tsx` (`BildFigur` + `BildKacheln`, §13-Tokens, CLS-fest, ehrlicher alt §8), 2 Block-Zweige in `ArtikelBody.tsx`. **SSV-Signal-Anhänge → bebilderter Kachel-Katalog** (Bild+Nr+Name) statt Text-Wirrwarr. Browser-verifiziert (SSV-Signale + KKG-Formel).
- **Bug-Check** (Opus-Gegenprüfung + korpusweite Wort-Multiset/Dubletten-Checks): **WIDERLEGTE** zunächst — Text-Dublette (VTS/VZV/VVV: `[tab]`-Marke uneins zwischen `markeloseNotizen` und `parseDefinitionsListe`) + SSV-Mehrfach-`<dt>/<dd>`-Zelle (Textverlust). **Beide gefixt** (konsistente Marke-Bestimmung; alle Zell-Paare/Bilder erfasst), korpusweit re-verifiziert: **0 Dublette, 0 verlorene Wörter**. Gate voll grün.
- **Offen (cosmetic):** `formel`-Flag nie gesetzt → Formeln als «Amtliche Abbildung» statt «Formel». Detail `FAHRPLAN-NORMTEXT-DARSTELLUNG.md §M13-Rest`, Spec `docs/superpowers/specs/2026-07-01-bilder-formeln-design.md`.

## Session 1.7.2026 — Bündel N: Normtext-Fidelity + Verweise (Worktree `buendel-n-normtext-fidelity`, gegated, Push/Deploy §9 offen)

**Phase 0 der AKN-XML-Quell-Architektur (Council 30.6.), 4 Teile, je eigener Commit (Risiko-Klassen getrennt §14.2):**
- **N1 — zerrissene Artikelnummer «329 g»→«329g»** (`3b1db26e`). Ursache: `entferneTags` (`scripts/normtext/extrahiere-fedlex.ts`)
  ersetzte JEDES Tag durch ' '; Quelle setzt Buchstabe/lat. Suffix inline OHNE Abstand («329<i>g</i>», «1<sup>bis</sup>»).
  Fix: Inline-Formatierungs-Tags leerzeichenlos strippen, Block-/Umbruch-Tags weiter mit ' '; **reine Ziffern-`<sup>`/`<sub>`
  behalten den Abstand** (Exponent/Bruch «133 1/3» nicht «1331/3», §1). Zweiter Sitz (dt-eingebetteter Text) mitgefixt →
  räumt zugleich geleakten «bis .»-Marke-Rest ab. **194 Bund-Snapshots regeneriert** (datum unverändert 2026-06-30), golden
  byte-gleich; Verifikation: 0 Drop/Leak/Strukturdrift, 9 bis/ter-Marke-Dedup, sonst Zeichenfolge identisch. **Opus-Gegenprüfung
  BESTANDEN** gegen amtl. Fedlex-HTML.
- **N2 — falscher Self-Link auf benanntes Fremdgesetz** (`e55caed5`, render-only). Bare «Artikel N» wurde interner Sprung-Link
  auf den AKTUELLEN Erlass, auch wenn ein anderes Gesetz genannt war («Artikel 1a Absatz 1 … AHVG» in der AHVV). Alte Regel
  fing nur UNMITTELBAR folgendes Kürzel; ausgeschriebene Passus-Form (~1195 Fälle) entging ihr. Neu `fremdgesetzNachArtikel`
  (`src/lib/fedlex.ts`) erkennt deterministisch (FEDLEX-Kürzelliste §5) Fremd-Zitate (Passus aus-/abgeschrieben + Artikel-Listen
  + «des/der»); `restMitIntern` (`NormText.tsx`) unterdrückt Self-Link bei fremdem Kürzel (kein Fremd-Link erzeugt).
  **§7-Abweichung:** Roadmap-Premisse «ELI-Ziel im HTML» trifft NICHT zu (0/225 Body-Verweise verlinkt; ELI nur Fussnoten/XML=Phase 1)
  → erlass-genaue Verweis-Chips = Phase-1-Folge. **Opus-Gegenprüfung fand+fixte** FinfraV-FINMA-Regression (Register-«_» vs FEDLEX-«-»
  → Kürzelvergleich normalisiert); über alle 6 getrennt-benannten Kind-Erlasse re-verifiziert.
- **Verifikations-Tor `check:invarianten`** (`3b865c3f`, in `check`-Kette). Drei robuste, FP-freie Invarianten (Bund-Korpus = 0):
  kein HTML-Markup im Body, keine unaufgelöste Entity, kein geleaktes lat. Zähl-Suffix am Textanfang (N1-Regressionswächter).
  Bewusst NICHT: Absatz-Lückenlosigkeit (echte Teil-Aufhebungen = legitime Lücken) / Marken-Format (Anhang-Legenden) / naives
  Wort-Containment (28-58 % Rauschen, Council-Befund).
- **Status-Marker — §7 empirisch schon erfüllt, kein Neubau** (Mehrwert-Test §0): aufgehoben = «· aufgehoben»-Statuszeile
  (`parts.tsx:167`) + Default-Einklappen + amtl. Aufhebungsnotiz; in Kraft = Default; noch-nicht-in-Kraft kommt bei
  current-consolidation-Pinning nicht vor (die 6 Quellstellen sind Sachtext über EU-Verordnungen).

**Gate voll GRÜN** (tsc/vitest 2954/golden/lint/check inkl. neuem Tor + gegenpruefung). Offen: Davids §9-Ja für Push/Deploy,
danach Worktree/Branch aufräumen. Detail `FAHRPLAN-NORMTEXT-DARSTELLUNG.md §Quell-Architektur` / ROADMAP W2·5b/W2·6.

## Session 1.7.2026 — QS-PERF Bug-Check-Nachzug: tocToggle-memo + prefetch-.catch (Branch `fix/perf-toctoggle-memo-prefetch-catch`)

**Fundierter Bug-Check (3 unabhängige adversariale Opus-Reviewer) über alle 5 QS-PERF-Änderungen der Session.**
Zwei echte, geringfügige Befunde (kein Korrektheits-/Logik-/Treue-Verlust), beide gefixt: (1) `tocToggle`
war doch **kein** `useCallback` (Linter-Revert-Falle wie zuvor bei parts.tsx) → `SektionBaumTOC`-`React.memo`
lief bei jeder Scroll-Spy-Aktualisierung leer; jetzt `useCallback([])`. (2) `prefetchLeser` (Rank 2) hängte
kein `.catch` an die Prefetch-Promises → unbehandelte Rejection bei Chunk-404 (offline/veralteter Hash);
jetzt `.catch(() => {})` (best-effort, Route-Load fängt via lazyRetry). Reviewer bestätigten sauber:
sektionMeta byte-identisch, Rules-of-Hooks/Deps korrekt, Debounce race-frei (Sprung 0ms≪110ms), Scroll-Rettung
kohärent, NewsHeader/Fonts/Kalender ohne Bug (Font-Generator neu ausgeführt → CSS byte-identisch). **Verifikation:**
`npm run gate` grün, 9 TOC-e2e grün. Trailer `Roadmap: QS-PERF` · `Gegenpruefung: n/a`.

## Session 1.7.2026 — QS-PERF Rank 9 (Teil): In-Gesetz-Suche entprellt (Branch `feat/perf-batch4-suche-debounce`)

**Geräte-Last / Performance (Querschnitt QS-PERF, `[OF]`).** Die In-Gesetz-Suche im Reader filterte bei
JEDEM Tastendruck ~1000 Artikel neu und baute den IntersectionObserver neu auf → Jank auf schwacher CPU.
Neu `sucheDebounced` (200 ms; Leeren 0 ms/sofort, damit Treffer→Artikel-Sprung nicht laggt) speist
Treffer-Filter (`inhalt.tsx` treffer-useMemo), Observer-Dep und Scroll-Rettung; das Eingabefeld bleibt an
`suche` sofort responsiv. Muster wie `UniversalSuche` (setTimeout, kein synchrones set-state-in-effect).
Reine Timing-Optimierung (§6.4): identische `passtAufSuche`-Menge/Ansicht, nur WANN gefiltert wird — gilt
auch im Einzel-Reader. **Verifikation:** `npm run gate` grün (golden byte-gleich), 15 Reader-e2e grün inkl.
`gesetze.e2e.ts:54` (In-Gesetz-Suche funktioniert). Trailer `Roadmap: QS-PERF` · `Gegenpruefung: n/a`. **Offen
bleibt** der Pane-Open-Guard-Teil von Rank 9 (split-view-spezifisch). Detail: `FAHRPLAN-PERFORMANCE.md` §Stand.

## Session 1.7.2026 — Fix: Kompakt-Kalender Einzelmonat füllt die Karte (Branch `fix/kalender-einzelmonat-fuellt-karte`)

**UI-Bugfix (im Zuge QS-PERF entdeckt).** Die e2e `schnellrechner-kalender.e2e.ts:38` («füllt seine
Karte», Füllgrad >0,55) war **seit ihrem Einführungs-Commit `8719d336` deterministisch rot** (0,516 =
16/31, macOS + CI identisch, nie grün — main ist nicht branch-protected, daher unbemerkt durchgelaufen).
**Root Cause** (systematisches Debugging, gemessen): der Default-Startseiten-Kalender rendert **1 Monat**,
gekappt auf `max-w-[17rem]` (272px) in einer 527px-Karte → max. 51,6 % Füllung, unter der 0,55-Schwelle.
**Fix** (Entscheid David 1.7.: «Einzelmonat darf breiter»): die 17rem-Kappe gilt in `FristenKalender.tsx`
(kompakt) nur noch bei **mehreren** Monaten; ein einzelner Monat wächst per `flex-1` und füllt die Karte
(gemessen 1,0, zentriert; Mehrmonats-Layout unverändert). **Der Test wurde NICHT aufgeweicht** (§6.3) —
das Layout wurde gefixt, sodass die bestehende Assertion ehrlich grün wird. **Verifikation:** `npm run gate`
grün (golden byte-gleich — Kalender nicht in golden), beide Kalender-e2e grün, Screenshot geprüft (sauber,
nicht luftig). Reine Darstellung (§3). `Gegenpruefung: n/a`.

## Session 1.7.2026 — QS-PERF Rank 2-Rest: Reader-Chunk idle-Vorladen (Branch `feat/perf-batch3-reader-preload`)

**Geräte-Last / Performance (Querschnitt QS-PERF, `[OF]`).** Die schweren Leser-Route-Chunks
(`GesetzLeser`/`EntscheidLeser`) werden nach dem Erstpaint **idle** vorgewärmt → erstes Gesetz/Entscheid
öffnet ohne Chunk-Parse-Warten/Spinner-Frame auf schwacher CPU. Neu `src/leserPrefetch.ts` (Import-Thunks
als EINE Quelle §5 + `prefetchLeser()`; eigene Datei wegen react-refresh/only-export-components),
`RouteSwitch` teilt die Thunks, `App.tsx` ruft `prefetchLeser` via `requestIdleCallback`(+setTimeout-Fallback)
aus einem Client-`useEffect` (kein SSR/Prerender-Effekt, golden byte-gleich). **Verifikation:** `npm run gate`
grün, Playwright: beide Chunks laden auf `/` OHNE Navigation. Rein additiver Cache-Warm, off-critical-path
(§6.4/§15/3). Trailer `Roadmap: QS-PERF` · `Gegenpruefung: n/a`. **Damit ist die sichere Autonom-«Dry»-Grenze
erreicht:** CLS, Render-CPU, Fonts, Bundle-Split, Chunk-Preload sind erledigt+deployt; der Rest (OR-LCP im
M-Daten-Pfad, Rank 6/7/8/10) braucht Architektur-Entscheid bzw. Risiko-Pfad-Gegenprüfung. Detail: `FAHRPLAN-PERFORMANCE.md` §Stand.

## Session 1.7.2026 — QS-PERF Rank 11 Fallback-Fonts (Branch `feat/perf-fonts-fallback-metrics`)

**Geräte-Last / Performance (Querschnitt QS-PERF, `[OF]`).** Metrik-angepasste Fallback-Fonts
gegen den font-display:swap-Reflow (CLS-Sekundärfix). `@font-face 'Geist Fallback'` (Arial) /
`'Source Serif 4 Fallback'` (Georgia) in `src/index.css` mit `size-adjust`/`ascent-`/`descent-`/
`line-gap-override` **gemessen** aus den echten fontsource-woff2 via neuem `scripts/gen-font-fallbacks.ts`
(`@capsizecss` devDeps, reproduzierbar `npm run gen:font-fallbacks`) — nicht geraten (§7). Fallback-Family
direkt hinter dem Webfont in `--font-display`/`-sans`/`-serif`. **Verifikation:** `npm run gate` grün,
gebautes CSS enthält beide `@font-face`, Playwright-Messung Zeilenkasten Webfont↔Fallback **Δ 0,0 px**
(Sans + Serif) → Swap-Reflow eliminiert. CSS-only, reine Darstellung. Trailer `Roadmap: QS-PERF` ·
`Gegenpruefung: n/a`. **Nebenbefund (nicht meine Arbeit):** die e2e `schnellrechner-kalender.e2e.ts:38`
(Füllgrad >0,55) ist **seit ihrem Einführungs-Commit `8719d336` rot** (deterministisch 0,516 = 16/31,
macOS + CI identisch) — main ist nicht branch-protected, daher nicht-blockierend; separat zu klären
(Kalender-Layout füllt real nur 51,6 % ODER Test-Schwelle zu eng). Detail: `FAHRPLAN-PERFORMANCE.md` §Stand.

## Session 1.7.2026 — QS-PERF Quick-Win-Batch 2 (Rank 4 + Rank 3; deployt)

**Geräte-Last / Performance (Querschnitt QS-PERF, `[OF]`, Branch `feat/perf-batch2-render-cls-fonts`).**
Zweiter Quick-Win-Batch aus `FAHRPLAN-PERFORMANCE.md`, rein Darstellungs-/Build-Schicht (kein
Risiko-Pfad → `check:gegenpruefung` n/a). **Rank 4 (Render-Hotpath):** `SektionBaumTOC` `React.memo`;
`tocToggle`/`springeZuSektion` `useCallback` (Letzteres über den early-return gehoben = der in Batch 1
zurückgestellte Hook-Reorder); Sektions-Bereichslabel + Einzelartikel-Flag in **einem** Bottom-up-
`useMemo` (`sektionMeta`, `[sektionen,artIndex]`) statt 2× O(Subtree) je Sektion je Scroll-Render —
kappt die Scroll-Spy-Re-Render-Kaskade über ~1000 OR-Artikel. Labels byte-identisch. **Rank 3
(Startseiten-CLS):** `NewsHeader` reserviert beim async-Laden **und** am geladenen Streifen dieselbe
`min-h-[12.5rem]`; **gemessen** (Playwright/Preview) Streifen 11,61 rem Desktop / 11,17 rem mobil <
12,5 rem → CLS des Streifens = 0. **Rank 11 (Fonts) bewusst verschoben** — braucht gemessene
Metrik-Overrides (fontkit/Fontaine), geraten würde CLS verschlechtern. **Verifikation:** `npm run gate`
grün (2870 Tests + golden 201 byte-gleich + lint + alle checks), `check:perf-budget` grün (Entry 30,3 KB /
vendor-react 71,7 KB gzip), 49 e2e grün (16 Reader inkl. TOC-Sprung/Scroll-Spy + 33 a11y/Rechtsprechung).
Commit-Trailer `Roadmap: QS-PERF` · `Gegenpruefung: n/a — reine Darstellungsschicht`. **Push/Deploy §9
offen (Davids Ja).** Detail-Stand: `FAHRPLAN-PERFORMANCE.md` §Stand.

## Session 1.7.2026 — QS-GP Gegenprüfungs-Gate gebaut (Bausteine a+b+c) — gemergt PR #67 + PROD-LIVE

**Grundlagenarbeit (Querschnitt QS-GP, `[OF]`, ultracode).** Das adversariale Gegenprüfungs-Protokoll
ist von Session-Disziplin zu einem **mechanischen Tor** geworden. **Baustein a:** `check:gegenpruefung`
(`scripts/check-gegenpruefung.ts` + geteilte Kernfunktion `scripts/gegenpruefung/kern.ts`) — schneidet
den Working-Tree-Diff ∩ Risiko-Pfade (Rechnen/Extraktion/Norm-Tarif) ∖ Auto-Ausnahme (reine Prüflogik)
und verlangt einen **an genau diesen Diff gebundenen sha256-Nachweis**; fehlt/Mismatch/Verdikt≠bestanden
⇒ ROT. CI-Selbstschutz (grün no-op), in `npm run check` (nur lokales `gate`), **nicht** in CI.
**Baustein b:** Skill `~/.claude/skills/gegenpruefung/SKILL.md` (unabhängig, Opus, frischer Kontext,
widerlegen; Modus Extraktion zeichenweise / Modus Rechnen unabhängig aus der Norm). **Baustein c:**
Register `bibliothek/register/gegenpruefung-register.md` + Helfer `npm run gegenpruefung:ok`
(schreibt gitignoredes `.gegenpruefung-pending` + Register-Zeile) + WARN-Kopplung an überholte Quelle-Pins
(`scripts/fedlex-pins.ts`, aus `fedlex-versionen-pruefen.ts` extrahiert). Baustein d (rückwirkende
Kampagne) bewusst später. **Verifikation:** ultracode-Workflow (3-Linsen-Härtung fing 4 Blocker: `-uall`,
verschachtelte `public/normtext/**`, kaputte Glob-Alternation → hand-gerolltes Prädikat; Bau; 3 Skeptiker
ohne Bypass) + unabhängiger Live-E2E; Gate grün, **golden 201 Fälle byte-gleich**, 21 Tests grün.
Golden-neutral (reine Prüflogik), keine Davids-Fachzeit. Design + Befunde:
`docs/superpowers/specs/2026-07-01-gegenpruefung-gate-design.md`. CLAUDE.md §14.4 auf «Tor steht» aktualisiert.
**Gemergt PR #67 (`252731bd`) + Prod-live** (Git-Integration `dpl_Go2D1D3…`, target production READY; App-Output byte-identisch — reines Tooling, kein User-sichtbarer Change). Branch aufgeräumt.

## Session 1.7.2026 — I4 Bemessungskriterien + I9-Rest → W1·4 geparkt, 26×-Slot frei (NICHT gemergt/deployt)

**W1·4-Abschluss (Prozesskosten-Cockpit).** **I4 `kriterien`-Feld:** neues Anzeigefeld
`kriterien`/`kriterienNorm` auf `KantonalerTarif` (`src/data/tarif/typen.ts`) + Durchreichung über
`TarifQuelle`/`quelle()` in `lib/prozesskosten.ts`; die **Bemessungskriterien** (wonach die Behörde
die Gebühr im Rahmen festsetzt) je Kanton für Gerichtskosten (25, GR gk hat keine Kriteriennorm →
generischer Fallback) und Parteientschädigung (26) — **frisch am amtlichen Erlass extrahiert**
(7 parallele Opus-Agenten, meist `…/api/…/texts_of_law/…`; Strukturbefund: zitierte Norm = meist nur
Streitwert-Staffel, Kriterien in einer allgemeinen Bestimmung). Anzeige im per-Posten
Ermessensrahmen-Block **nur bei Spanne** (§8), `ProzesskostenForm.tsx`. **§11-Register:**
`bibliothek/register/bemessungskriterien-tarife-kantone.md` (Wortlaut + confidence je Eintrag).
**Adversariale Gegenprüfung (QS-GP, 2 unabhängige Opus-Agenten):** 1 Fund korrigiert (OW pe:
Art. 4a→**Art. 32 GebOR**), 4 Titel-Korrekturen an Altdaten bestätigt (AR/ZG pe = «Verordnung über den
Anwaltstarif», JU gk «Décret … émoluments judiciaires», JU pe «Ordonnance … honoraires d'avocat»),
TG-pe-Abkürzung «HonTV» als offene erlassName-Frage geflaggt. **I9-Rest:** Notariats-/
Grundbuch-Querverweis im Cockpit (Art. 55 SchlT ZGB / Art. 954 ZGB → `/rechner/notariat-grundbuch`).
**Engine unberührt → golden byte-gleich (201 Fälle).** Gate grün (tsc·vitest·golden·lint 0 Fehler·
check). Visuell verifiziert (Playwright: BE-Spanne zeigt Kriterien + Norm, GR gk leer/pe gefüllt,
Querverweis). **Alles auf `recherche`/vor-Abnahme (§7); nichts `geprüft`.** **W1·4 → `parked`,
26×-Slot FREI** (Voraussetzung Welle 3 · Schritt 12); I2 bleibt blockiert (`wbqdyap3x`).
**Deploy/Push offen — wartet auf Davids Ja (§9).**

## Session 1.7.2026 — Plan-Steuerung «ein Etikett pro Schritt» (QS-PH, Branch `feat/plan-steuerung`, NICHT gemergt/deployt)

Maschinenlesbares `<!-- @meta … -->`-Etikett je ROADMAP-Schritt
(status/of/blocker/dep/kollision/worktree/26x/fahrplan) + Werkzeuge unter
`scripts/plan/`: **`plan:next`** (Resolver → Buckets ready-now/wartet-dep/
wartet-Fachzeit/blockiert/geparkt/wartet-26x-Slot + deterministische Lanes),
**`plan:set`** (Feld + gekoppelte Checkbox), **`check:plan`** (Wächter, in der
`check`-Gate-Kette: Schema · Checkbox-Kopplung · `@blockers`-Register ·
dep-Existenz+Azyklie · max-1-26x-wip · kollision-Existenz · FAHRPLAN-Link der
referenzierten Dateien · verwaiste/fehlende `@meta`). Behebt die §5-Drift
(Checkbox ↔ Prosa-Fortschrittsblock): `npm run plan:next` ist ab jetzt die
deterministische Antwort auf «was darf ich bauen?». ROADMAP einmalig etikettiert:
25 Einheiten (S0, Schritte 1–14, 5 Querschnitt, 4 nested Bündel), `@blockers`-
Register, Fortschritts-Block aufgelöst. **W1·4 = blocked** (`wbqdyap3x`, 26×-Slot
bleibt; `plan:set W1·4 status=parked` gäbe ihn frei für Welle 3); **W3·12 geparkt**.
Subagent-getrieben (8 Tasks TDD, je Task-Review + Fix-Loops), doppelt verifiziert
(Repo-Faktencheck + adversariale Opus-Audits inkl. 16-Befund-Spec-Audit).
**golden byte-gleich** (kein Produkt-Code), kein Deploy (§9). Detail:
`FAHRPLAN-PLAN-STEUERUNG.md`; Plan: `docs/superpowers/plans/2026-07-01-plan-steuerung.md`.
**Gate-Hinweis:** `check:plan` + tsc/vitest/golden/lint grün; das Voll-Gate ist heute
(1.7.) durch einen **unverwandten, fälligen Daten-Pflege-Backlog** rot (`check:verfall`:
SG-GKV verfallen 30.6. · ZGB+ZPO Fedlex-Re-Pin fällig · Streitwert-Miete) — separater
Posten «Pflege & Termine», nicht aus diesem Branch.

## Session 30.6.2026 — Performance-Grundsatz + ultracode-Audit + Quick-Win-Batch 1 (DEPLOYT)

**Stand:** Auf Davids Frage «macht Lexmetrik alte Computer langsamer?» gemessen (Lighthouse 4× CPU): ja — `/gesetze/bund/OR` Score **42**, **CLS 0,64**. ultracode-Audit (38 Opus-Agenten, adversarial gegen Logikverlust): 25 verifizierte logik-sichere Optimierungen. **Grundsatz festgeschrieben** (CLAUDE.md **§15** + ROADMAP **Leitprinzip 7**/Querschnitt **QS-PERF** + **FAHRPLAN-PERFORMANCE.md** + Memory): *Lexmetrik nicht merklich langsamer, ausser bei Logikverlust — Treue gewinnt immer.*

**Gebaut + DEPLOYT (Commits `9e914242`+`d9d4d0a0`, golden 201 byte-identisch, 2870 Tests + 86 e2e, doppelter §9-Bug-Check kein Blocker):** Rank 1 `React.memo`(ArtikelLeser) · Rank 5 `vendor-react`-manualChunks (Entry **323→101 KB roh**) · Rank 2-CLS `min-h-screen` (Reader-Ladezustand + Suspense-Fallback). **Prod-Messung 4× CPU before→after:** OR Score 42→**70**, CLS 0,64→**0**, TBT 330→**60 ms**; Startseite Score 64→**86**, CLS 0,57→**0**. LCP unverändert 6,2 s (= M-Daten-Pfad, offen).

**Offen (FAHRPLAN-PERFORMANCE):** Tor `check:perf-budget` · M-Daten-Pfad (idle-Defer/Web-Worker/Sharding/Snapshot-Format → LCP) · zurückgestellt: Rank 4 TOC-memo (Hook-Reorder), NewsHeader-CLS (Prerender statt Magic-Number).

## Session 30.6.2026 — Analyse + Architektur-Entscheid «Quell-Architektur Bund-Normtext (AKN-XML)», kein Code

**Stand:** Reine **Analyse-Session** (David: «kein Code, nur Analyse»). Council-Entscheid (DMAD, 5 Opus-Advisor + Devil's-Advocate + Chairman) zur Frage «wie ein Bundesgesetz am besten darstellen / Fehleranfälligkeit grundsätzlich senken». Festgehalten in **ROADMAP** (Bündel N), **FAHRPLAN-NORMTEXT-DARSTELLUNG §Quell-Architektur-Entscheid**, **CLAUDE.md §7** (neue Regel «Quell-Wahl zuerst») + 2 Memorys. **Keine Produktiv-Code-Änderung, golden unberührt.**

**Befunde (empirisch gemessen):** Fedlex liefert jede Norm als **Akoma-Ntoso-XML** (strukturiert) am selben Filestore wie das HTML — wir bauen auf HTML. **N1** («Art. 7 b») = unser Whitespace beim Inline-Tag-Strip (`7<i>b</i>`), XML löst es NICHT. **N2** = explizites ELI-Verweisziel steht schon im HTML, Resolver liest es nicht (Geschwister **M12**). golden (HTML) auf jedem geprüften Artikel korrekt inkl. DBG-Tabellen → Anzeige ist nicht das Problem. Naiver XML-vs-golden-Diff = 28–58 % Rauschen (Orakel nur so gut wie schwächerer Zeuge).

**eId-Stabilitäts-Probe (entscheidend):** StGB 2,5 J. = **99,7 %** eIds stabil; Einschübe als Suffix, Nachbarn unverschoben; DE/FR/IT ~95–99 % ausgerichtet; einzige Instabilität = aufgehobene Bereiche. → Fundament für Phase 1 belegt.

**Verdikt:** B («XML direkt rendern») verworfen. **Phase 0 jetzt** = Verifikations-Tor (Containment + Invarianten) + Status-Marker (in Kraft/aufgehoben/noch-nicht) + N1/N2-Fix via vorhandenem ELI → Verweis-Chips (erweitert M12). **Phase 1 inkrementell** HTML→AKN-XML über den Drift-Zyklus → `#art`-Chips, ELI-Zitations-Graph, M15 (DE/FR/IT), M16 (Point-in-Time). **Heimat:** ROADMAP Bündel N → FAHRPLAN-NORMTEXT §Quell-Architektur-Entscheid; Memorys `lexmetrik-akn-xml-architektur-entscheid` + Daueranweisung `extraktion-amtliche-quellen-beste-option` (Schwester `werkzeuge-zuerst-prüfen`).

## Session 30.6.2026 — Bündel R (Reader-Lese-Steuerung) gebaut + gegated + GEMERGT (PR #59) + AUF PROD (mit Perf-Deploy)

**Stand:** **PR #59 (`feat/buendel-r-reader-ux`) auf `main` gemergt (`0560fd87`)**; 4 Feature-Commits. **Voll-Gate grün** (tsc/vitest/golden/lint/check) · **golden byte-gleich** (reine Darstellung, §3) · **67 e2e lokal grün** (gesetze/9-Punkte/a11y/tastatur/smoke). Visuell verifiziert (Playwright, ZGB). **Auslöser David:** Auftrags-Eingang 30.6. **Bündel R** (3 Reader-UI-Aufträge), «run till dry». **AUF PROD:** Da R vor der Perf-Quick-Win-Arbeit gemergt wurde, trug der Perf-Deploy (Commits `9e914242`+`d9d4d0a0`, oben als DEPLOYT vermerkt) das ganze PR-#59-Merge-Tree mit auf `lexmetrik.vercel.app` — **prod-verifiziert 30.6.** (R3-Marker `lexmetrik-schriftskala` im Live-Bundle `index-D3GipDX5.js` vorhanden; R1/R2 sind Vorfahren desselben deployten `main`-HEAD).

**R1 — Scroll-Spy markiert den ZUOBERST angeschnittenen Artikel** (statt des mittigen). Bezugslinie von Viewport-Mitte auf ≈12 % unter dem oberen Lese-Rand verschoben; IntersectionObserver-Band `-45%/-45%`→`-6%/-82%`; Klick-/Anker-Sprünge `block:'center'`→`block:'start'` (Artikel trägt `nt-anker`-scroll-margin), damit der Spy nach dem Sprung nicht auf den Vorgänger zurückspringt. Pure Funktion `aktiverArtikel` unverändert (Param `mitte`→`bezug`, Bezugslinie generisch). Verifiziert: Kopf folgt Art. 13/14 (oben) statt Art. 16/17 (Mitte).

**R2 — linke Gliederung schon ab 1024 px** (statt 1280). Viewport-`matchMedia`-Schwelle in `gesetz-leser/inhalt.tsx` auf 1024 px (Tailwind lg) gesenkt — deckt sich mit `PANE_BREIT_PX` (Pane-Pfad) und der lg-Schwelle der App-Seitenleiste (unter lg sind beide Drawer). Lesespalte bleibt nutzbar (Inhalt ≤ `max-w-content` 70rem, abzgl. 16rem TOC + gap-8 ≥ ~26rem; bei 1100 px visuell komfortabel). Drawer-CSS-Guard `xl:hidden`→`lg:hidden`. Verifiziert: 2-Spalten bei 1280/1100/1024, Drawer bei 1000/900.

**R3 — globaler A−/A+ Schriftgrössen-Steller** statt Kompakt/Breit-Umschalter. Neuer Hook `useSchriftskala` skaliert die Wurzel-`font-size` in % (Stufen 0.9–1.4, Default 1.0), wodurch alle rem-Tokens proportional wachsen (Schrift UND Lesespaltenbreite → Zeichen/Zeile konstant). Prozent statt px erhält die Browser-Basis (WCAG 1.4.4); Default 1.0 entfernt den inline-Stil → **byte-gleich**. Pre-Paint in `main.tsx` (analog `wendeThemaAn`, kein Flash, kein CSP-Inline-Script). Zustandsmatrix bedient (disabled an Anschlägen, §13/F4), Live-Wertansage (4.1.3). Zentrale Inhaltsspalte fix `max-w-content` (frühere Default «kompakt»); «breit»-Option (max-w-screen-2xl) entfällt mit dem Umschalter. **`useInhaltsbreite.ts` entfernt** (regelmässig-aufräumen). Verifiziert: 90↔140 %, persistent über Reload, proportionale UI-Skalierung ohne Clipping.

**Gegenprüfung (adversarialer Opus-Pass über den ganzen Diff):** fand **1 echten R1×R3-Bug, gefixt+verifiziert:** Die Spy-Bezugslinie war als 12 %-der-Höhe (px) gesetzt, der Klick-/Anker-Landepunkt aber als `nt-anker` 5rem (rem) — beide deckten sich nur bei ~667 px Höhe. Auf 1366×768 bzw. bei A+ (R3 skaliert die rem-margin, nicht das %) markierte der Spy nach einem Klick den **Vorgänger**. **Fix:** Bezugslinie auf denselben fixen rem-Offset (5rem + ε) gezogen → deckungsgleich mit dem Landepunkt bei jeder Höhe/Zoom; IO-Band auf obere ~45 % verbreitert. Verifiziert (Playwright): aktiver TOC-Pfad nach Klick = Ziel-Artikel (nicht Vorgänger) bei 1366×768, 1920×1080, je default + 140 %. Rest des Reviews: sauber (keine toten Refs, R3 byte-gleich, R2-Schwelle JS-getrieben, Stepper-a11y korrekt); stale `xl`-Kommentare → `lg` nachgezogen. Reine Darstellung, kein Risiko-Pfad (`QS-GP` n/a). **Heimat:** ROADMAP Schritt **5b**. **Offen aus Eingang 30.6.:** Bündel N (Extraktor-Härtung, NÄCHSTER) · B (Rechtsprechungs-Leser) · S (Split-View) · I1/I2.

## Session 30.6.2026 — M13-Annex (Anhänge) Bund FERTIG + GEMERGT (PR #57) + AUF PROD DEPLOYT

**Stand:** **PR #57 GEMERGT auf main@`e8c3b0e0`** + **AUF PROD DEPLOYT** (`lexmetrik.vercel.app`, `dpl_e3ktVMd3S8ef…`, Davids Ja «mergen + deployen»; Prod-verifiziert: Asset-Hash live=lokal, LRV-Anhang-3-Emissionstabelle mit «Hellstrahler/Dunkelstrahler» live gerendert, Kernrouten 200, e2e 86 grün). Branch+Worktree aufgeräumt. Auslöser David: «mach weiter mit Anhängen / run till dry» — der M13-Rest «Anhänge» (B2).

**Befund:** Fedlex legt die Anhänge in einen EIGENEN Container `<div id="annex">` (Geschwister von `<main>`, NACH `<div id="dispositions">`) als **`<section>`** ab — KEINE `<article>`, KEINE `art_`-Nummer → vom `art_`-/`disp_`-Enumerator gar nicht erfasst, **komplett gefehlt** (390 Einträge / 134 Bund-Gesetze, vorher 0).

**Lösung (additiv, eigene Risiko-Klasse):** dedizierter Pfad `alleAnhangAnker` + `extrahiereAnhang` (Anhänge sind heterogen: Unter-Überschriften h2–h6, klassenlose `<p>`, `<dl>`, `<table>` — eigener Parser statt des Artikel-Parsers). Token-Namespace `annex_*`/`lvl_*` (kollisionsfrei), Struktur-Sidecar-Gliederung «Anhänge» → gliederungsgetriebener Reader bildet die Top-Sektion, **0 Renderer-Umbau** ausser EINEM neuen Block-Feld `titel?` (Ziffer-Zwischentitel; ArtikelBody rendert es als Zwischenüberschrift). `alleAnhangAnker` löst alle Varianten: nummeriert (`annex_1`/`annex_1_1`/`annex_4_a`), EINZELNER «Anhang» (`annex_uN` — BVG/KVG/IPRG/VAG/AHVG), ohne annex-Präfix (`lvl_uN` — KAG/FIDLEG; `lvl_dNeN` DTD-opak — GFK); Deckblatt «Anhänge» (Inhaltsübersicht) per Blatt-Regel + Nummerierungs-Test ausgeschlossen.

**Bewusste Abweichung (§7/§1):** wie M13-disp KEINE `anhaenge[]`-Schema-Dimension — Token-Namespace + Sidecar; einziges neues Feld `titel?` (render-only, golden-neutral). Korrektur zur Vorab-Quantifizierung: «53 `<article>`-gewickelt» traf NICHT zu (alle Anhänge sind `<section>`); die 2221 Anker zählten genestete `lvl_*`-Stufen mit (Extraktionseinheit = top-level Anhang).

**§6-Beweis:** Engine-Golden `lexmetrik-golden.json` byte-gleich (201 Fälle). `normtext-snapshot.json` **+370 annex-Keys, 0 Artikel/disp-sha geändert** (zusätzlich 2 verwaiste OR-Golden-Orphans `226_a`/`226_f` aufgeräumt — `OR.json` trug längst die Range-Form `226_a_226_d`; reine Index-Konsistenz, kein Inhalt). Voll-Gate (tsc/vitest/golden/lint/build/check) **grün**; `check:vollstaendigkeit` + `check:struktur-konsistenz` um Anhang-Anker erweitert; Playwright-Sicht GSchV/ChemRRV/BVG/KAG.

**Gegenprüfung (2 adversariale Opus-Pässe, Code + Fidelity):** fanden **6 §1-Befunde, alle gefixt+verifiziert:** **(C1)** Apparat-Variant-Klasse `footnotes section-heading-footnote` (69 Stellen/14 Erlasse, VTS) leckte Änderungs-/Aufhebungs-Historie als Normtext → Klasse-enthält-`footnotes` strippen (heilt auch repealte Anhänge → «…»); **(C2)** geschachtelte Layout-Tabellen (`<table>` in Zelle, SSV) zerschnitten non-greedy → `findeTableEnde` balanciert (Signal-Legenden 4.78–4.95 zurück); **(C3)** marke-lose `<dd>`-Notiz nach statt vor ihrer Liste → reorder; **(D1)** Marken-Kürzung «1.1.1»→«1» / «Flupo»→«f»; **(D2)** all-`<th>`-Datentabellen als reiner Kopf gelesen (LRV Grenzwerte, VTS Sitzmasse); **(D3)** VERSCHACHTELTE marke-lose `<dd>` verloren (VTS Anhang 7 «2,9 m/s²») → `markeloseNotizen` rekursiv. **§6-kritisch:** D1/D2 sitzen in den GETEILTEN Parsern (`parseDefinitionsListe`/`parseRohTabelle`/`parseFedlexTabelle`) → über ein **`anhang`-Flag NUR im Anhang-Pfad** aktiviert, der Haupttext-Pfad bleibt **byte-gleich (empirisch: 0 geänderte Artikel-sha)**. Dieselbe Garbling-Klasse im Haupttext (Staatsverträge `i`→`ii`) = eigener, deklarierter Folgeschritt (Artikel-Re-Bless). Wort-Coverage 99.65 % über 44 479 Anhang-Wörter, 0 realer Verlust. 12 neue Anhang-Unit-Tests.

**Heimat:** `FAHRPLAN-NORMTEXT-DARSTELLUNG.md` §M13 (Status nachgezogen), Detail `bibliothek/normen/norm-vorschau-snapshot-system.md` §M13-Annex. **OFFEN (M13-Rest):** Bilder/Formeln-`<img>`-Pass; danach LugÜ-Protokolle; Haupttext-Marken-Garbling (Folgeschritt, Artikel-Re-Bless).

## Session 30.6.2026 — M13 Schlussteil (Schlusstitel/UeB) Bund FERTIG + AUF PROD DEPLOYT (PR #56)

**Stand:** Commit `d1af7252`, **deployt auf lexmetrik.vercel.app** (`dpl_8WSPr3Yf…`, Prod-verifiziert: ZGB 1277 Art. live, OR-`219a`-Gliederung live behoben), Branch `feat/normtext-schlusstitel-m13` gepusht, **PR #56** offen für main (David mergt).


**Auslöser David:** «im ZGB fehlt der Schlussteil — muss bei allen Gesetzen enthalten sein, sofern vorhanden.» Das ist der geplante **B2-Schritt M13** (Normtext-Darstellung).

**Befund:** Fedlex legt neu-nummerierte Schluss-Divisionen (ZGB-Schlusstitel, «Schluss-/Übergangsbestimmungen der Änderung vom …») unter eigenem Anker-Schema `<article id="disp_uN/art_*">` ab (in `<div id="dispositions">`, ausserhalb `<main>`). Sie nummerieren neu ab Art. 1 → kollidieren mit dem Haupttext. Der digit-only-Enumerator erfasste sie nicht → **275 Artikel fehlten komplett** (ZGB 178, OR 83, PatG 9, SchKG 4, SVG 1).

**Lösung (additiv, niedriger Blast):** `alleSchlussteilAnker` + `extrahiereArtikelAusAnker` (geteilte Block-Parserei mit Haupttext) + kollisionsfreies Token `disp_uN_art_*` via `ankerZuToken` (geteilt Generator↔Struktur-Extraktor). Schlussteil-Einträge an `eintraege[]` angehängt; Struktur-Sidecar (ID-Regex um `disp_uN/art_` geöffnet) liefert die Gliederung → der gliederungsgetriebene Reader bildet daraus von selbst eine neue **Top-Sektion** («Schlusstitel: Anwendungs- und Einführungsbestimmungen» usw.). **Null Renderer-Umbau**; nur zwei Kopf-/Tab-Label-Stellen mussten disp-Token korrekt als «Art. 3» statt «Art. dispu1art3» formatieren.

**Bewusste Abweichung vom B2-Plan (§7/§1, dokumentiert):** KEINE neue Schema-Dimension `NormSnapshotDatei.anhaenge[]` — Schlussteil-Artikel SIND Artikel, daher Token-Namespace statt Schema-Strahlung in 6 Dateien.

**§6-Beweis:** Golden `normtext-snapshot.json` rein **additiv +275 disp-Keys, 0 geändert, 0 entfernt** (Haupttext byte-gleich, Extraktor-Refactor verhaltensneutral); Engine-Golden `lexmetrik-golden.json` unberührt. Voll-Gate (tsc/vitest/golden/lint/check) **grün**; `check:vollstaendigkeit` erweitert (Schlussteil mitgeprüft); neue Unit-Tests; Playwright-Sicht ZGB (2 Div.) + OR (13 Div.).

**Gegenprüfung + Härtung (David: «grosser Fehler, darf nicht vorkommen»):** Die adversariale Gegenprüfung fand zwei stille Datenrisiken: **F1** — `ladeSnapshot` baute die Lookup-id fix als `…/art_<token>`, hätte für jeden Schlusstitel-Zugriff still `null` geliefert → **gefixt** (namespace-bewusst) + Test. **F2** — der OR-**Struktur-Sidecar war auf `main`/Produktion veraltet** (Snapshot trug schon die 1.1.2026-Konsolidierung mit `219_a`/`226_a_226_d`, die Struktur noch `226_a`/`226_f` → einige OR-Artikel rendern in Prod OHNE Gliederung/Randtitel); Ursache: Snapshot und Struktur werden von zwei getrennten Generatoren gebaut, Drift blieb ungeprüft. Meine Regeneration korrigiert OR; **zusätzlich neues Offline-Tor `check:struktur-konsistenz`** (Snapshot-Token ↔ Struktur-Schlüssel je Bund-Gesetz, im `check` verdrahtet) — beweisbar: es hätte den OR-Drift auf `main` ROT gefangen. So kann diese Klasse stillen Drifts nie wieder verschifft werden (§7/§8). Diff: 5 Snapshot + 5 Struktur + golden + register + 11 Code-Dateien (inkl. neues Tor).

**Heimat:** `FAHRPLAN-NORMTEXT-DARSTELLUNG.md` §M13 (Status nachgezogen), Detail `bibliothek/normen/norm-vorschau-snapshot-system.md` §M13. **OFFEN:** M13-Rest = Anhänge (`annex_*`, G18/G13) — eigener Pass. **Deploy = Davids Ja (§9).**

## Session 30.6.2026 — W2·5b Batch A fertig (M1 + M6-Datenteil) + 2 Live-Feedback-Fixes

Nach dem Prod-Deploy: **Batch A** (Extraktor/Pipeline) zu Ende geführt + zwei Reader-Feedbacks von David.

**M1 (Präambel-Fussnoten):** Recon ergab — die Daten-Zuordnung ist bereits korrekt (BV-Präambel-Fussnote
auf `kopf.fussnoten`, nicht Art. 1; war durch M5 behoben). `extrahiereFussnoten` scopt strikt per `<article>`.
Mit Tests **fest verankert** (`normtext-kopf-g15.test.ts`). Offen nur optionale Inline-«¹»-Marker-Politur.

**M6-Datenteil (Verweis-Auflösung):** Recon ergab — Auflösung ist RENDER-seitig (`NormText`), die bloßen
Item-Verweise tragen kein `href`/`data-rs`. ZGB 89a Abs. 6/7 zitieren BVG-Artikel bloß («Art. 52»), das
Fremdgesetz steht nur im Chapeau → bisher falscher interner ZGB-Self-Link. **Fix (`ArtikelBody`):**
`etabliertFremdgesetz()` erkennt den «… Bestimmungen des … (BVG) … über:»-Chapeau; seine Items rendern ohne
`intern` → kein falscher bare-Self-Link (§1/M12-Philosophie; Kürzel-Verweise bleiben über `NORM_IM_TEXT`).
**Korpus-Sweep (218 Bund-Dateien): 14 Treffer, kein legitimer Self-Link fälschlich unterdrückt.** Batch-D-Teil
(Item tatsächlich auf BVG auflösen/Popup) bleibt offen.

**2 Live-Feedback-Fixes:** (1) Gruppierungslinien-Umschalter aus der Suchleiste in die **Kopf-Aktionszeile**
(oben am Gesetz) verschoben. (2) Einzelartikel-Sektion zeigt das «Art. N»-Bereich-Badge nur noch eingeklappt
(offen ist es redundant zum Artikelkopf darunter); echte Spannen («Art. 252–359») bleiben. Beide visuell
verifiziert. **AUF PROD DEPLOYT 30.6.2026** (Davids Ja «yes deploy»): `lexmetrik.vercel.app`, Deployment
`dpl_J56rFqQ2cU2Svj8z8K6GYXSQK8WC`, Asset `index-D-Nrda6H.js`, aus sauberem `/tmp`-Worktree @ Branch-HEAD
`02136603`. §9-Tore grün (tsc/vitest/golden/lint/check + build + e2e 86); §9-Bug-Check (unabh. Opus über das
Delta `3c4b3ab0..HEAD`): 0 Blocker. Kernrouten + `/gesetze/bund/ZGB` 200. **PR #55** weiterhin offen für `main`
(Selbst-Merge in Auto-Modus geblockt → Davids Review/Merge; danach STRUKTUR auf `main` spiegeln + Branch/Worktree
entfernen).

## Session 30.6.2026 — W2·5b PROD-DEPLOY (Tabellen + Reader-Batch-B + OR-Currency live)

**Auf Prod deployt 30.6.2026** (Davids Ja «bug check und push und deploy»): `lexmetrik.vercel.app`,
Deployment `dpl_3n53z3tJs6CgT2vqCAtHMnRpq8RF`, Asset `index-DgTsq1vu.js`. Quelle = Branch-HEAD
**`feat/normtext-tabellen-kanonisch` @ 3c4b3ab0** (deployt aus sauberem `/tmp`-Worktree, §12.3). Enthält
M10 (Tabellen `spalten`-Modell), OR-Currency (Baumängel), Reader-Batch-B M2/M9/M3, Bug-Check-Härtung.
**§9-Tore alle grün** (tsc/vitest/golden/lint/check + build + e2e 86); **§9-Bug-Check** = 2 unabhängige
Opus-Agenten (Code-Lupe + 300k-Fuzzer) ohne Blocker, 2 latente Funde gefixt; **Adversarial M10 8/8 +
OR 15/15 FAITHFUL**. Live verifiziert: Art.20 kanonisches `spalten` + OR art_219a vorhanden, Kernrouten 200.
**PR #55 für `main` offen** (Selbst-Merge in Auto-Modus geblockt → Davids Review/Merge); `main` bis Merge
auf 033a1783. Nach Merge: STRUKTUR auf `main` spiegeln + Branch/Worktree entfernen.

## Session 30.6.2026 — W2·5b Batch B (M2/M9/M3): aufgehobene Artikel + Gruppierungslinien (gebaut + gegated)

**M3 (Gruppierungslinien je Gesetz + Umschalter):** Root-Cause war NICHT die Datenlage (209/218 Bund-Erlasse
tragen `gliederung`) sondern eine Render-Bedingung — `inhalt.tsx` zog die vertikale Schachtelungslinie nur für
`randtitel`-Knoten, nie für die offizielle Teil/Titel/Abschnitt-Gliederung. **Fix:** `renderSektion` tiefen-bewusst
→ Linie + Einzug für JEDE geschachtelte Sektion (`tiefe > 0`, offiziell + Randtitel), Wurzel bündig. **Umschalter**
`gruppierungslinienAn` (zustandslos `useState(true)` wie `fussnotenAuf`, je Pane eigen; Knopf «✓ Linien» neben
«Fussnoten», nur bei geschachteltem Gesetz). Visuell verifiziert (Playwright/Bash: ZGB/OR/VMWG × 1280/390 ×
an/aus — Parität, kein Über-Einzug). Reine Darstellung (§3). **Damit Batch B (M2/M9/M3) komplett.**

## Session 30.6.2026 — W2·5b Batch B (M2/M9): aufgehobene Artikel (gebaut + gegated, nicht deployt)

Nach M10 die ersten Render-Punkte von **Batch B** (selber Branch/Worktree `feat/normtext-tabellen-kanonisch`).
**M2** (David 29.6.): die amtliche Aufhebungs-Zitatzeile «Aufgehoben durch … (AS …)» in `gesetz-leser/parts.tsx`
wandert hinter den Fussnoten-Schalter (`fussnotenAuf`) — erst auf Klick, einheitlich wie jede Fussnote; die
Statuszeile **«· aufgehoben» bleibt unabhängig immer sichtbar** (Artikelzustand). Kehrt den 28.6.-«inline immer»-
Zwischenstand um. **M9**: Chevron-Knopf (aktiv) und `…`-Platzhalter (aufgehoben) tragen jetzt dieselbe feste
`inline-flex w-4`-Leitspalte → die «Art. N» fluchten **bündig auf einer Ebene** (vorher Glyphenbreite vs. fixe
w-4 → Versatz). Render-Tests `gesetz-leser-m2.test.tsx` (5 Fälle); tsc/lint/vitest grün. Visuelle Schluss-Abnahme
bei David. **OFFEN Batch B: M3** (Gruppierungslinien je Gesetz + Umschalter — grösserer Strukturpunkt, eigene
Bau-Einheit), dann Batch C (M4/M5/M7/M8) + D (M11/M6) + Batch-A-Rest (M1, M6-Datenteil).

## Session 30.6.2026 — OR-Currency nachgezogen (separat von M10, gegated, nicht deployt)

Beim M10-Cache-Refresh (`fedlex-cache.sh`) zeigte sich ein **vorbestehender** OR-Currency-Drift: die
committete `OR.json` war veraltet gegen die aktuelle gepinnte Konsolidierung (Stand 2026-01-01). Ursache =
**OR-Baumängel-Revision** (BG 20.12.2024, in Kraft 1.1.2026): `OR.json` deterministisch regeneriert
(`--erlass=or`, §7 kein Hand-Edit). Diff: **3 neu** (art_219a + 2 zusammengeführte aufgehobene Bereiche
art_226a–d / art_226f–k), **2 alte Einzelartikel** ersetzt (offiziell verschmolzen), **12 geänderte**
(art_201/219/269d/327b/361/362/367/368/370/371/725b/960b — neue Abs/lit der Baumängel-Reform, gender-neutral
362). **Adversariale Opus-Gegenprüfung gegen Fedlex-HTML: 15/15 FAITHFUL, 0 REFUTED** — legitime Currency,
keine Korruption. **check:vollstaendigkeit jetzt GRÜN.** Ohne Tabellen-Bezug → bewusst NICHT in M10 gefaltet
(§14.2). OR ist der einzige driftende Bund-Erlass (check:vollstaendigkeit flaggte nur OR).

**BACKLOG (vorbestehende OR-Extraktions-Lücken, von der Gegenprüfung gefunden, NICHT von dieser Regen verursacht,
in alt+neu identisch):** (a) **Aufzählungs-Tabellen in art_361/362 fehlen** — die `<p class="man-template-tab-krpr">`-
Zeilen (Katalog der (zweiseitig) zwingenden Bestimmungen, 89 Zeilen OR-weit) werden vom Extraktor nicht erfasst
(nur `<table>` + absatz/dl), substanzieller Listeninhalt fehlt; (b) **Farbspan-Wortfugen** — Fedlex splittet
geänderte Wörter über `<span style="color…">`, der Extraktor fügt eine Spurious-Space ein («Aus sicht»), 38/40
Artikel betroffen, rein whitespace (kein Rechtstext verloren). Beides eigenes Extraktor-Härtungspaket (nicht M10).

## Session 30.6.2026 — W2·5b M10: Bund-Tabellen kanonisches `spalten`-Modell (gebaut + gegated, nicht deployt)

ROADMAP-Schritt **Welle 2 · 5b**, Milestone **M10** (Tabellendarstellung Bund) aus
`FAHRPLAN-GESETZESDARSTELLUNG-BUND.md`. Worktree `feat/normtext-tabellen-kanonisch` (isoliert, §12),
Split-View-Konflikt entschärft (PR #51 längst auf main, kein Live-Agent auf `ArtikelBody.tsx`).

**Was:** Defekte Fedlex-Tabellen (colspan-Verlust → Kopf≠Zellzahl, empty-padded Köpfe, Spacer-Spalten,
zerrissene Staffel-Spannen; ~60 Defekt-Blöcke/28 Erlasse) auf ein rechteckiges, typisiertes `spalten`-Modell
(T-B1) umgestellt. Kern = reiner, DOM-freier Normalisierer `scripts/normtext/tabelle-normalisieren.ts`:
(1) **Staffel-Verdichtung** datengetrieben (`über 100 bis 500` aus 5 Zellen → 1 `bereich`-Zelle, verlustfreie
Konkatenation amtlicher Token) — folgt dem Daten-Muster, NICHT der irreführenden Kopf-colspan 3/3 (K3-Leitfall
GebV SchKG Art. 20); (2) **Zwei-Zeilen-Kopf-Merge** (T-A5) rettet zuvor verlorene Captions (AHVV Art. 21
«Beitragssatz in Prozent» war weg); (3) **logischer Pfad** über Daten-Zellgrenzen mit Ambiguitäts-Guard
(verwirft Fedlex-colspan-Misalignment → Legacy, z.B. AHVV Art. 52); (4) **ehrlicher Legacy-Fallback** bei
ragged/Prosa (T-E4, byte-gleich zu heute). Schema additiv (Kanton-`{kopf,zeilen}` unberührt, L0-Abwärtskompat);
Renderer = dumme typgesteuerte Projektion + unveränderter Legacy-Pfad. Neuer Generator-Filter `--erlass=`.

**Verifikation:** 53 Normalisierer-TDD-Tests + 17 Render-Tests + umgeschriebene M7-Tests (zementierten die
Defektklasse). 28 Snapshots EINMAL regeneriert → **Byte-Diff: 25 Dateien/59 Tabellen, 0 Nicht-Tabellen-Änderung,
0 verlorene Token, 0 Nicht-Bund-Dateien** (§6.3). Neuer blockierender Validator `check:tabellen` (Bund scharf:
**69 kanonisch / 0 Aritäts-/Leerspalten-/Staffel-Brüche**; 9 Legacy-Fallbacks transparent gelistet; Kanton Report).
**Adversariale Gegenprüfung** (unabhängiger Opus, frischer Kontext, gegen echtes Fedlex-Filestore-HTML): **8/8
FAITHFUL, 0 REFUTED**. Gate grün (tsc/vitest/golden/lint/check) **ausser** orthogonalem **OR-Currency-Drift**
(3 neu + 2 umstrukturiert + 12 geänderte Mietrecht/Gewährleistungs-Artikel in der aktuellen Konsolidierung; OR hat
KEINE Tabellen → kein M10-Bezug; vorbestehend auch auf main, separat zu ziehen — NICHT in M10 gefaltet).

**Offen:** Push/Deploy (Batch-Fenster, Davids Ja §9). Residuen: AHVV Art. 52 Legacy-Caption-Lücke (kein Datenwert);
BV.196/DBG.36/FZA.10/VGKE.4/VTS.94/GEBV Art. 37 bleiben Legacy (ragged/Prosa). Nächste M10-Batches: B-Render-Rest
(M2/M9/M3), C (Suche/Layout M4/M5/M7/M8), D (Popover M11/M6), sowie M1/M6-Datenteil (Batch A Rest).

## Session 30.6.2026 — Dev-Werkzeug: Skill `korpus-werkstatt` (Content-Produktion + Verifikation)

Auftrag David: einen evaluierten Fremd-Skill (Lexplorer/`swiss-legal-research`) als Basis für einen
EIGENEN Lexmetrik-Skill nehmen. Fremd-Skill als Produktfeature **verworfen** (statische SPA,
«deterministisch statt KI» §2, CSP-Sperre, fremde MCP-Server) — nur die Methodik übernommen.
- **Neu:** repo-scoped Claude-Code-Skill `.claude/skills/korpus-werkstatt/` (7 Dateien) — Orchestrierungs-/
  Verifikations-Schicht VOR Abnahme/Deploy für die Korpora **Normtext + Rechtsprechung**. Muster
  `methodology/` (was+warum) ↔ `tools/` (Mechanik) ↔ `review.md` (adversarialer Pass). Verweist auf
  CLAUDE.md §§/STANDARDS statt zu duplizieren (§5); übergibt Release an `deploy-check`, fachliche
  Abnahme an `abnahme`. Zuschnitt bewusst Normtext+Rechtsprechung (Tarife/Vorlagen späterer Ausbau).
- **Bau via 3 ultracode-Workflows** (Plan-Härtung 21 Befunde · Bau+Verifikation · Härtung): grounded
  gegen die echten Pipelines (`fedlex:eli`/`normtext`/`entscheide`), drift-feste Symbolverweise
  (0 nackte Datei:Zeile-Anker), Cross-File-Konsistenz. Alle referenzierten npm-Befehle real.
- **Trockentest bestanden:** `review.md` gegen die «Tabelle-verloren»-Bugklasse — DBG Art. 36 (Tarif)
  verifiziert (2 `mehrspaltig`-Tabellen, Zeilen quelltreu gg. Fedlex); 3 Heuristik-Verdachtsfälle per
  Quell-Gegenprobe als Prosa entlarvt (KVV/ASYLV2/VINTA: 0 `<table>` in der Quelle).
- Reine Doku/Dev-Tooling, kein App-Code/Norm-Tarif → **kein Risiko-Pfad** (`Gegenpruefung: n/a`),
  CI/Golden unberührt, nicht user-facing/nicht deployt. → committet `c9f80041` (lokal, nicht gepusht).

## Session 30.6.2026 — W2·6-BGE Rest geschlossen: OCL-id-Kollision gelöst (34/34) + Prod-Deploy

Fortsetzung W2·6-BGE: die 2 zuvor quarantänten BGE (`151_V_1`, `151_V_30`) gefixt. Ursache war eine
OCL-Keyed-Lookup-**Präfixkollision**: `/decisions/151_V_1` matcht fälschlich `151_V_194`.
- **Fix** (`adapter-entscheide.ts`): `holeBgeLeitentscheid` probiert mehrere Id-Formen
  (`151_V_1` · `151 V 1` · `bge_BGE_151_V_1`), nimmt nur die idNorm-exakt passende Entscheidung;
  Struktur/Erwägungs-Nachladen über die kanonische `decision_id`. Snapshot-Id bleibt `bund/bge/151_V_1`
  (`mappeEntscheidOCL` leitet sie aus `docket_number` ab, nicht aus `decision_id`).
- `--bge-refresh` → 2/2 neu gezogen; **0 Kappungen im ganzen Korpus** (34/34 BGE voll).
- WARN-Quarantäne (`BGE_KAPPUNG_QUARANTAENE`) wieder **entfernt** (aufgeräumt) — Schutz-Tor reines FEHLER.
- **Adversariale Gegenprüfung** (Opus, amtliche Quelle): beide tragen die RICHTIGE Entscheidung
  (151 V 1 = KVG-Pflegebeiträge/IV-HE-Praxisänderung; 151 V 30 = Wirtschaftlichkeitskontrolle) —
  KEINE Spur von 151 V 194/306, Naht lückenlos + wortgetreu. gate/golden byte-gleich.
- Offen (klein, OCL-Datenasymmetrie, separat): `aktenzeichen`/`abteilung`/`titel` null; 151_V_30 ohne
  `rubrum`/`dispositivOrders`.
- → **deployt `0b921d03`, live** `lexmetrik.vercel.app` (151_V_1/151_V_30 = bgeRef korrekt, 0 Kappungen,
  Seiten 200). **W2·6-BGE damit vollständig erledigt + live.**

## Session 29.6.2026 — W2·6-BGE: BGE-Auszug-Kappung gefixt (32/34) + Prod-Deploy

Auftrag David: `W2·6-BGE` fixen. BGE-Leitentscheide schnitten ihren amtlichen Sammlungs-Auszug
(bzw. Volltext) bei >5000 Z. **still mitten im Wort** ab (OCL-`/structure`-Excerpt-Cap, nicht voll
nachgeladen). Risiko-Pfad (Extraktion) → §14-DoD inkl. adversariale Gegenprüfung.
- **Fix** (`scripts/normtext/adapter-entscheide.ts`): geteilter Helfer `fuelleGekappteErwaegungen`
  lädt gekappte Erwägungen (`holeErwaegung`) in BEIDEN Pfaden voll nach; **Exakt-Id-Guard**
  (`idNorm` strippt `bge`-Präfix/Separatoren) gegen die präfixunscharfe OCL-Keyed-Lookup.
- **Regenerierung** ohne Vollbau: neuer Flag `npm run entscheide -- --additiv --bge-refresh` (zieht
  nur aktuell gekappte BGE neu, by-id-Überschreib; Bund/Kanton/eidg unberührt, §7 kein Hand-Edit).
- **Schutz-Tor** `check:entscheide`: Block-Ende auf U+2026 (`(?<!\()…\s*$`, ausser amtl. «(…)») →
  FEHLER. **Zwei adversariale Gegenprüfungen** (Opus, amtliche Quelle): die 1. fand einen Regex-
  Blindfleck (verlangte Buchstabe vor U+2026 → 5 Kappungen rutschten durch); Regex geweitet, 5
  nachgezogen; die 2. bestätigte die 5 (amtlich wortgetreu, richtige Entscheidung) + Endzustand.
- **Ergebnis: 32 BGE regeneriert + voll.** **2 Reste** (`151_V_1` 3 Blöcke inkl. E.8.2, `151_V_30`)
  = echte OCL-id-Kollision (`151_V_1`→`151_V_194`) → WARN-Quarantäne (`BGE_KAPPUNG_QUARANTAENE`),
  in ROADMAP W2·6-BGE gequeued. gate/golden byte-gleich, 86 e2e, check:entscheide grün.
  → **deployt `62fb12ed`, live** `lexmetrik.vercel.app` (E.4.1 von 152 III 137 = 8592 Z. statt
  4991; Asset-Hash live=lokal — Fix ist Daten, nicht Bundle; Kernrouten + BGE-Seite 200).

## Session 29.6.2026 — Governance: §14 Aufnahme/Einordnung + Querschnitt-Gegenprüfung strukturiert

Auftrag David: den weiteren Aufbau so **dokumentieren**, dass künftige Sessions ihn autonom
durchführen — Hybrid bestätigt (`ROADMAP.md` = ein Eingang/Backlog, FAHRPLANs = Detailquellen),
neue Aufträge **abgleichen → bündeln → einordnen**, Qualität rückwirkend sichern. Reine
Doku/Governance (`**.md`), kein Code → CI/Golden unberührt, kein Risiko-Pfad (`Gegenpruefung: n/a`).
- **`CLAUDE.md` §14** neu: Aufnahme & Einordnung neuer Aufträge — Eingang ROADMAP, keine ungebundene
  `FAHRPLAN-*.md`, Abgleich→Bündeln→Einordnen (nicht über Risiko-Klassen bündeln), DoD inkl.
  adversariale Gegenprüfung, Trailer-Konvention `Roadmap:`/`Gegenpruefung:`, Kontext-Hygiene
  (Delegieren > Persistieren > Handoff > `/compact`).
- **`ROADMAP.md` Querschnitt-Band** neu: **QS-GP** (adversariale Gegenprüfung systematisiert — Gate
  `check:gegenpruefung`, Protokoll-Skill, Register mit Stand, rückwirkende Kampagne) + **QS-PH**
  (Plan-Hygiene-Wächter). Alles `[OF]`, **noch zu bauen**.
- **`ROADMAP.md` Welle 2 · 6** neu: **W2·6-BGE** — P0-Fix BGE-Auszug abgeschnitten (30 BGE; OCL
  `paragraph_excerpt_chars=5000`, Daten- nicht CSS-Fehler; Fix = Voll-Nachladen + §7-Regenerierung +
  Schutz-Tor in `check:entscheide`). Diagnose via ultracode (Opus-Agent).
- **`ROADMAP.md` Welle 14** ergänzt: Bildschirm-/Responsive-Audit (ultracode) **gebündelt** mit
  Split-View. **Archiv-Hygiene** ergänzt: verify-then-archive-Methode für obsolete FAHRPLANs.
- Strukturierungs-Texte via **ultracode-Workflow** (Entwurf → adversarialer Kritiker → Final, 10
  Opus-Agenten); der Kritiker fing einen Self-Sufficiency-Defekt (§14 verwies auf das noch nicht
  gebaute Tor → als «im Aufbau» markiert).
- **Prod-Deploy main (Auftrag David: «push und deploy auch ja»).** Beim Push divergierte `main`:
  Remote trug die ganze **Split-View-Strecke (PRs #51–#54)**, lokal 2 ungepushte Doku-Commits →
  **gemergt** (§12, einziger Konflikt STRUKTUR.md additiv gelöst). **§9-Ritual** über das
  46-Commit/59-Datei-Delta: Tore grün (gate · build · 86 e2e); **Bug-Check** als ultracode (6 Opus-
  Finder × adversariale Verifikation, 15 Agenten) → **7 von 9 bestätigt**, kein HOCH, **keine Logik-/
  Golden-Verletzung**. **4 gefixt** vor Deploy: #1 MITTEL Gutter-ARIA (WCAG 4.1.2), #2 MITTEL
  Pane-Befördern-Fokus, #3 NIEDRIG Popover-Mobil-Klemmung, #5 NIEDRIG Rail-Abstand; **#4/#6/#7
  NIEDRIG** in ROADMAP Welle 14 gequeued. Deploy aus sauberem `/tmp`-Worktree → **live**
  `lexmetrik.vercel.app` (Commit `0d7ee7f7`, Asset `index-Bg7D2XiA.js` = lokal, Kernrouten 200).
  Split-View damit prod-freigegeben. **Offen/live:** BGE-Auszug-Bug `W2·6-BGE` (separat gequeued).
## Session 29.6.2026 (Forts. 7) — Re-Render-Entprellung + Bug-Check über heutigen Code

- **Perf:** Kopf-Artikel-Meldung 150ms entprellt → weniger Pane-Re-Renders beim Scrollen.
- **Fundierter Bug-Check** über das heutige 70-Datei-Delta (6 unabhängige Lupen: Effekte,
  Layout/byte-gleich, Kopf-Kontextfluss, Pane-Mechanik, Popover/Drawer, Technik-A). 7 Befunde
  behoben: **MEDIUM** EntscheidLeser-Sticky-Leiste verdeckte den Inhalts-Kopf (top/--rsp-stick
  imPane-abhängig); **MITTEL** Promote/⇱ doppelter React-Key (Dedup); data-such-bar-Pane-Offset;
  Gutter-Klemmung summenerhaltend; liveLocs-Cleanup; ziehGutter-Teardown; 2× Technik-A-col-span.
  DEFERRED: onNavigiert-useCallback, Drawer-Tab-Trap/F6, Popover-Überhang (Body-Portal inhärent),
  Entscheid-Breadcrumb-Parität. gate grün (golden byte-gleich), 86 e2e grün.

## Session 29.6.2026 (Forts. 6) — Pane-Kopf-Ausrichtung + Technik A (Form-Grids container-responsiv) · auf main (PR #52)

- **Pane-Kopf links bündig:** PaneKopf-Breadcrumb (Identitätsblock pl-0 + gap-1) fluchtet
  jetzt mit dem Inhalts-Gutter (☰-Knopf/Artikeltext) statt vom ⠿-Griff weggeschoben.
- **Technik A (ultracode, 36 Dateien):** mehrspaltige Viewport-Grids in Formularen/Vorlagen/
  Katalogen via `usePaneKlasse` auf `@container/pane` → schmales Pane = weniger Spalten,
  breites = volle Spaltenzahl; ausserhalb Panes byte-gleich. 38 Migrations-/Verifikations-
  Agenten (2 bewusst übersprungen). Verifiziert: gleiches Formular Pane~620px→2 Spalten,
  ~1180px→4 Spalten. gate grün (golden byte-gleich), 86 e2e grün.
- **PR #52 → main gemergt** (08c5e011): bündelt die ganze Split-View-Session (A–D, E, F, alle
  Bug-Checks, Pane-Fix, Technik A). **Prod-Deploy von main noch offen** (wartet auf Davids Ja).

## Session 29.6.2026 (Forts. 5) — E container-responsive Panes + F PaneKopf=InhaltsKopf · Prod-Deploy

Branch `feat/split-view-strang-a`, von Branch-HEAD auf Prod (PR #52 offen für main).
- **E (Container-responsiv, ultracode-Analyse):** jedes Pane wählt sein Layout nach SEINER
  Breite. Technik B (Gesetz-Leser): ResizeObserver auf der Pane-Wurzel (1024px) → `istXl =
  imPane ? istBreit : istXlVp`; die früher viewport-`xl:`-Layoutklassen (2-Spalten-Grid, TOC-
  Sidebar, Lesespalte) jetzt `istXl`-getrieben → **breites Pane = voller Einzelbildschirm-Aufbau
  (zweispaltig + Gliederung), schmales = einspaltig + Drawer**. Technik A: Wizard-Split via
  usePaneKlasse (md→@3xl/pane). Identitäts-`imPane`-Gates unberührt.
- **F:** Gesetz-Leser meldet Kopfdaten unconditionally; der nächste InhaltsKopfMeldeProvider
  fängt sie (Einzelansicht→InhaltsKopf, Pane→eigener PaneKopf). **PaneKopf zeigt bei Gesetzen
  Breadcrumb «Gesetze › Bund › OR» + laufenden Artikel** (Parität zur Einzelansicht).
- **Kürzel** hinter dem laufenden Artikel («Art. 7 OR»).
- **Fundierter Session-Bug-Check** (6 Lupen × adversarial, 11 bestätigt) → gefixt: Cross-Pane-
  TOC-Scroll (paneRoot-Scope), Aside-Höhe/interner Scroll, F-Breadcrumb-Dopplung (Inline
  entfernt), <nav>-Landmark-Flut, ResizeObserver-Flackern (border-box), Wizard-Klassenordnung.
  DEFERRED: Sekundär-Pane-Re-Render-Churn (Memo-Refactor, reine Perf).
- gate grün · 86 e2e grün · golden byte-gleich · Prod verifiziert (Pane 1070px→2-spaltig,
  PaneKopf «Gesetze›Bund›OR · Art.9 OR»). OFFEN: Technik-A-Rest (Formular-Grids P2–P5).

## Session 29.6.2026 (Forts. 4) — Inhalts-Kopf (Einzelansicht) + Verweis-Popup-Fix · Prod-Deploy

Auftrag David (A–D, nach «go» + «ja zu deploy»). Branch `feat/split-view-strang-a`,
**von Branch-HEAD auf Prod deployt** (PR #52 offen für main, Self-Merge geblockt — David merged).
- **A/A2/A3 Inhalts-Kopf:** jede geöffnete Inhaltsseite (Gesetz/Rechner/Vorlage/Entscheid/
  Material) trägt oben — analog zur Split-View-Pane-Leiste, aber OHNE Verschiebe-Steuerung —
  einen sticky Kopf: klickbare Breadcrumb «Gesetze › Bund › OR» (jede Ebene navigierbar,
  Ebene → gefilterte Übersicht ?ebene=/?kt=), bei Gesetzen mittig der **live mitlaufende
  Artikel** (IntersectionObserver), rechts Stand + ✕ → Startseite. Neue `InhaltsKopf.tsx` +
  `InhaltsKopfKontext.ts`; Seiten melden Kopfdaten (Gesetz/Material voll), sonst Pfad-Fallback.
  Kein Kopf auf Katalog/Meta; im Split-View bleibt der PaneKopf (In-Content-Breadcrumb der
  Leser jetzt imPane-gegated → keine Dopplung).
- **B/C Drawer kompakt:** Gliederung/Suche begrenzte Höhe (60vh/75%), fixer Such-Kopf, nur
  der Baum scrollt → verdeckt die Trefferliste nicht mehr; unter dem Kopf.
- **D Verweis-Popup am Klickort (überall):** `NormPopoverOverlay` verankert am Trigger
  (getBoundingClientRect, Portal an body → korrekt auch im Pane trotz container-type) statt
  viewport-zentriert.
- 2 ultracode-Bugchecks (Code-Lupe + empirische Repros): 4 Befunde gefixt (Sticky-Offsets
  unter dem Kopf, Rechtsprechung-Doppel-Breadcrumb, Materialien «Zuletzt geöffnet»-Label).
  gate grün · 86 e2e grün · golden byte-gleich · Prod live verifiziert (Breadcrumb + Live-Art.7).
- OFFEN/separat: **E** (Panes container-responsiv nach Pane-Breite) — eigener Task, mit ultracode.

## Session 29.6.2026 (Forts. 3) — Split-View «Browser-Fenster»-Redesign (ultracode, NICHT deployt)

Auftrag David: Split-View intuitiv + state-of-the-art; je Pane Titelleiste (was ist offen + ✕),
Drag-Drop-Umsortierung, Drawer-Bleed beheben, Logik prüfen, Code aufräumen. Branch gleich.
- **ultracode-Design** (3 Entwürfe→bewertet→synthese): «Browser-Fenster»-Modell, Pane-Liste als
  Render-Projektion (kein zweiter State), 1-Pane-Default byte-gleich.
- **PaneKopf.tsx** je Pane: Label · «Stand TT.MM.JJJJ» · ⠿ · ◂▸ · ⇱ Hauptfenster · ⧉ · ✕.
- **Drag-Drop** sekundärer Panes (usePaneDnd-Hook) + ◂▸ Tastatur/Touch + F6-Wechsel (sichtbarer Fokus).
- **Drawer-Bleed behoben:** Gesetz-TOC/Suche portaliert in eine Pane-Overlay-Schicht (absolute) →
  bleibt im Pane (container-type fängt fixed nicht). Empirisch bestätigt.
- **Logik:** Live-Location-Sync (Titel/teilen/promote/Dedup nutzen den GEZEIGTEN Pfad); Dedup gegen
  ALLE offenen Panes inkl. Primär; promote = Swap; primär ✕ → nächstes Pane/Startseite; #hash erhalten.
- **3. ultracode-Bugcheck** (18 Befunde) behoben (Live-Location-Major, F6-Fokus, Kontrast brass-700,
  aria-modal, teilen-catch). Aufräumen: DnD in usePaneDnd extrahiert; kein toter Code (lint-grün).
- Sweep: Gesetz/Entscheid/Rechner/Vorlage/Materialien rendern sauber im Pane; gate grün, 86 e2e grün,
  golden byte-gleich. Deploy ausstehend.

## Session 29.6.2026 (Forts.) — Split-View B-1 + B-2 (ultracode, NICHT deployt)

Fortsetzung gleicher Branch `feat/split-view-strang-a`. Auftrag David: B-1 + B-2 mit ultracode,
fundierter Bug-Check nach B-1. **Auf Prod deployt (`bec0ecb7`, dpl_5m8am2Mj, lexmetrik.vercel.app).**
Danach Auftrag «weitermachen im plan / run till dry» → B-2.5 → B-4 → B-5 autonom.
- **B-1 Pane-Container** (`e3795776`): ultracode-Architektur-Design (3 Vorschläge→bewertet→
  synthetisiert) löste 2 harte Fragen (container-vs-viewport, Scroll-Treue). Default 1 Pane
  byte-gleich; Multipane ab lg. Sekundär-Pane via `<RouteSwitch location>` (NICHT MemoryRouter —
  react-router v7 verbietet Nesting, im Smoke gefangen). `PaneKontext`/`paneKlasse` (CQ nur im Pane),
  `usePaneLayout` (Pfade only), `Pane.tsx`. Smoke: Gesetz | Rechner nebeneinander, 0 Fehler.
- **B-1-Bugcheck** (ultracode, 6 Linsen, 23→13 bestätigt, alle LATENT): Kernbefund — gesetz-leser
  an window/document-Globals gekoppelt → als Sekundär-Pane fehlerhaft (URL/Scroll/Tab); Rechner sauber.
- **B-2 «Rechner daneben»** (`ec4bb1d8`, SICHERE Scope, Davids Entscheid): KontextPanel-Werkzeuge
  bekommen ⧉ → Rechner als Sekundär-Pane neben dem Gesetz (Verzahnung Norm→Werkzeug, smoke-bestätigt).
  `PaneSteuerung`-Kontext, Fokus-Rückgabe. 86 e2e grün.
- **B-2.5** (`9170ee59`): gesetz-leser pane-fähig (window/DOM-Globals via Modulhelfer paneRoot/findeArt
  entkoppelt; Sekundär unterdrückt URL/Titel/Reiter); ⧉ «daneben» auch für Erlasse; EntscheidLeser-
  Lesemodus per Portal. Zwei Gesetze nebeneinander verifiziert.
- **B-4** (`3587d1fd`): Mobil-Faltung — Snap-Wischen unter lg, `h-dvh`. **B-5** (`860d914b`): teilbarer
  `?p=`-Permalink (Round-trip verifiziert).
- **2. ultracode-Bugcheck (B-2.5/B-4/B-5, 13 bestätigt)** fing einen **Re-Render-Loop-BLOCKER** vor
  Deploy: React-Compiler ist NICHT aktiv → instabile in-Komponente-Helfer churnten Effekte/Observer
  im Default-Leser. Fix `c9a8cca9` (Modul-Ebene-Helfer) + Honesty-Fixes (Clipboard, ?p=, title).
- **Split-View KOMPLETT + auf Prod** (A→B-5, `61dfa598`, lexmetrik.vercel.app; Live-Smoke: ⧉ öffnet
  Pane, 0 Fehler).
- **Optimierung + autonome Panes** (`5d696c16`, Auftrag David, noch nicht deployt): 3. ultracode-
  Bugcheck (21→20 bestätigt, keine Blocker) fand u. a. **useNavigate-Hijack** (Navigation in einem
  Sekundär-Pane kaperte die Haupt-URL) → Fix: **jedes Pane hat eigene In-Memory-History + Navigator**
  (UNSAFE_NavigationContext) → Links/Breadcrumbs/zurück wirken nur im Pane (beide Seiten autonom).
  **Tracker-Öffnen** (ReiterUebersicht ⧉ → jede Engine/Gesetz ins Split). **#hash erhalten** (Werkzeug-
  Unter-Tabs). **Kein Remount** beim Öffnen/Schliessen (stabile Element-Kette + Scroll-Übergabe).
  Breadcrumb-Kopf im Pane wieder bedienbar (pointer-events). + Polish (Kontrast, Schalter im Split aus,
  exhaustive-deps). Detail `FAHRPLAN-SPLIT-VIEW.md`.

## Session 29.6.2026 — Split-View Strang A + B-0/B-0b · Prod-Deploy (ultracode)

Auftrag David: Split-View (ROADMAP-Strang 14) mit ultracode bauen; «push und deploy»; Bug-Checks
zwischen jeden Schritt. Worktree `feat/split-view-strang-a`, Detail in `FAHRPLAN-SPLIT-VIEW.md`.
**Deployt auf Prod (lexmetrik.vercel.app), Commit `d20f2337`, Branch nicht auf main gemergt
(Direkt-Push geblockt → PR offen).**
- **Strang A — Inhaltsbreite-Umschalter** `[Kompakt|Breit]` im Top-Streifen (ab `lg`): zentrale
  Inhaltsspalte `max-w-content ↔ max-w-screen-2xl`; Lesespalte `max-w-reading` unberührt (§13.2).
  Default kompakt = heutiges Verhalten (Golden byte-gleich). Neuer Hook `useInhaltsbreite`
  (localStorage, SSR-sicher, Lesen+Schreiben in try/catch). **ultracode-6-Linsen-Review (24 Agenten)**
  → 4 Befunde behoben: toter `bg-brass-100/70`-Fill (Alpha kompiliert mit var()-Tokens zu nichts, F7)
  → solides `bg-brass-100`; je Knopf `aria-label="Inhaltsbreite: …"`; localStorage-Lesepfad gehärtet;
  expliziter Setter statt Toggle-mit-Guard.
- **B-0 — `<Routes>` → `src/RouteSwitch.tsx`** (verhaltensneutral, golden byte-gleich, 57 Routen
  prerendern, Runtime-Smoke sauber): Routen-Baum standalone mountbar für künftige MemoryRouter-Panes.
- **B-0b 1/2 — `@tailwindcss/container-queries`** installiert + verdrahtet (Davids Entscheid: CQ-1 +
  Plugin); verhaltensneutral (gebautes CSS 0× `@container`). Breakpoint-Migration (CQ-1) folgt
  gekoppelt an B-1 (Pane-Container) — sonst Container-vs-Viewport-Default-Verschiebung.
- **e2e-Fix (§6.3):** 3 Gesetze-Reader-Tests waren vorbestehend rot auf main (aus PR #50 B1, NICHT
  von Split-View) — sie prüften das alte Randtitel-DOM. B1-Verhalten empirisch verifiziert korrekt
  (kein Code-Fix), Tests aufs B1-Modell nachgezogen (`[data-sek]`-Sektionsköpfe). Voller e2e: 86 grün.
- **§9-Deploy:** alle Tore grün (tsc/vitest/golden/lint/check/build/e2e) · Bug-Check 2 unabh. Agenten
  (Code-Lupe + empirischer Browser-Repro) sauber · Nachkontrolle: 8 Kernrouten 200, Live-Asset-Hash =
  lokal (`index-COXIlfSD.js`), Schalter live in prerenderter `/rechner`.
- **Nächster Schritt:** B-1 (Pane-Container, 2–3 Panes) inkl. CQ-1-Migration — eigene fokussierte Session.

## Session 29.6.2026 — Normtext-Darstellung Bund/DE: B1 komplett (Worktree-Merge) · Deploy

Auftrag David: Gesetzesdarstellung Bund/DE auf Fedlex-Niveau (Worktree `feat/normtext-bund-de`,
`FAHRPLAN-NORMTEXT-DARSTELLUNG.md`). Diese Session schloss B1 ab und brachte es nach main + Prod.
- **BGERR-Follow-up:** die 28.6.-«Casemates-Shell» war ein TRANSIENTER Filestore-Fehler (URL via
  SPARQL als korrekt bestätigt); BGerR durch den neuen Extraktor mit-regeneriert (69 Einträge, 3
  M6-Tiefe-shas). Nur BGERR.json + golden/normtext-snapshot.json.
- **M5 Erlass-Kopf (§2-Floor):** neue `extrahiereKopf` liest preface/preamble (SR-Nr, Titel,
  Erlassdatum, Ingress/Erlassformel bzw. materielle BV-Präambel G6, Kopf-Fussnoten) → **Sidecar**
  im Struktur-Doc (Snapshot-Index byte-gleich), `ErlassKopfBlock` in beiden Header-Pfaden. 218/218
  Erlasse mit Kopf, 161 mit Ingress. Bisher zu 100 % verworfen.
- **G11 Sektions-Fussnotenmarker** (Marker am Sektions-/Randtitel-Kopf), **G15 Hervorhebungen**
  (fett/kursiv im Fussnotentext als Rich-Text, SR-Resolver-robust), **#9** Apparat-Abstand uniform
  + render-seitige Interpunktions-Glättung (verwaiste Spaces vor `.,`).
- **Golden-Disziplin:** Engine `lexmetrik-golden.json` über den GANZEN B1-Batch byte-gleich;
  Daten-Index nur bewusst (BGERR + die frühere `--nur=bund`-Re-Segnung). Sidecar-Cluster golden-neutral.
- **Verifikation:** `npm run gate` (voll) grün (+8 neue Tests); 2 adversariale Opus-Reviews; Playwright
  Hell/Dunkel/Mobil (ZGB/BV/OR). **B2 offen** (M13 Schlusstitel/Anhänge, M14 wortgenaue Fussnoten G14).

## Session 28.6.2026 — Abschluss: Aufräumen · ROADMAP · finaler Bug-Check (sauber) · Session-Ende

Auftrag David zum Schluss: aufräumen, Handlungsplan aktualisieren, finaler Bug-Check über alle
Änderungen, dann Session schliessen.
- **Aufräumen:** sauber — keine Debug-Reste im App-Code (nur CLI-`console.log`), keine ungenutzten
  Exports, Tree clean, Index gitignored. Session war gegated-as-you-go.
- **ROADMAP:** Fortschrittsblock 28.6. gesetzt (S0 + Welle 1·1–3 + Welle 2·5 erledigt/live; 3 Deploys).
- **Finaler Bug-Check** (2 Opus-Agents über `359d52b2..HEAD`, 22 Commits): **keine Session-Bugs**
  (101/101 Tests grün; alle §1-Zahlen empirisch gegen Snapshots; B1-1 wert-identisch; Determinismus
  sauber; Integration konsistent). **Live-Prod grün** (10/10 Routen, Such-Index 24'183 Artikel,
  HOCH-Fix StGB→STGB verifiziert, 15/15 vormals-kaputte Routen 200). **1 NIEDRIG vorbestehend**
  (ZPO-Monatsfrist-Begründungssatz zitiert Abs. 2 für den Beginn — Engine-BGer-Konvention, kein
  Regress) → in `FAHRPLAN-BEGRUENDUNGS-ABSATZ.md` für Davids Abnahme geflaggt.
- **Stand:** S0 + Welle 1·1–3 + Welle 2·5 LIVE; Prozesskosten-Moat (W1·4) ~90 % (I2 research-blockiert,
  I4 per-Kanton). Offene Entscheide: PDF-Absatz=AUS (entschieden) · FlexSearch=ja (entschieden) ·
  Kanton in Suchindex (offen) · Rechtsprechung-P0 SG-Regeste (§4-sensibel) · Mehrsprach DE/FR/IT
  (braucht Netz-Generator). Tree sauber, alles gepusht.

## Session 28.6.2026 — §9-DEPLOY #3: globale Volltextsuche → PROD live (HOCH-Bug im Bug-Check gefangen)

David «bug check und deploy». **Der Bug-Check fing einen HOCH-Bug** (2 Opus-Agents über das Suche-
Delta): der Treffer-href baute auf dem internen `erlass`-Kürzel («StGB») statt dem /gesetze-Routen-
Key (Dateiname-Stamm «STGB») → **71/218 Erlasse tote Links** (StGB/StPO/SchKG/VwVG …). **Fix:**
Generator `k` = Dateiname-Stamm (Routen-Key), `ku` = Kürzel (Anzeige); href nutzt k, Label nutzt ku;
beide volltext-indexiert. **Dead-Link-Tor** `src/tests/suchIndex.test.ts` (jeder Index-Key ein echter
Bund-Routen-Key). NIEDRIG: Limit 25→40. Tore grün (gate · build mit `gen:suchindex` · e2e 86);
StGB-Link end-to-end bestätigt (`/gesetze/bund/STGB`). Push + Worktree-Deploy.
**DEPLOYT: `dpl_EP7XZEdQt247YZzDbXQv2Ct8fsJv` (READY), commit `aebd72fb`, lexmetrik.vercel.app.**
Nachkontrolle: Routen 200 inkl. `/gesetze/bund/STGB`; **Such-Index in Prod HTTP 200, 24'183 Artikel,
StGB k=STGB** (Vercel-Build generierte den Index); Asset-Hash live=HEAD. Worktree entfernt.

## Session 28.6.2026 — ROADMAP Schritt 5: globale Artikel-Volltextsuche (FlexSearch) → mit Batch deployt `aebd72fb`

David «FlexSearch ja». Volltextsuche über **24'183 Bund-Artikel** (`bloecke`-Text), integriert in
**die** bestehende Suche (§5, ein Such-Workstream): neue Gruppe «Gesetzestext» in
`universalSuche.ts` (`artikelGruppe`) + `useUniversalSuche` lädt sie lazy wie die Presets.
- **Index:** `scripts/such-index-generieren.ts` → `public/such-index/artikel-bund.json` (15 MB roh /
  3.9 MB gz); **gitignored** + im `build` (`gen:suchindex`) frisch generiert (kein Git-Bloat,
  Drift strukturell unmöglich da Build immer neu baut). `check:suchindex` für manuelle Prüfung.
- **Lazy/Bundle (Task 4.4):** `src/lib/suche/artikelVolltext.ts` importiert FlexSearch + Index
  dynamisch → eigene Chunks (`flexsearch` 17 kB gz, `artikelVolltext` 0.86 kB gz), **nicht** im
  Haupt-Bundle; Daten = Laufzeit-Fetch. Index-Bau client-seitig ~2 s einmalig auf erste Suche.
- **Qualität (ehrlich §8):** Zitat-/Term-Suche stark («243 ZPO»→Art. 243 ZPO zuerst; Notwehr→
  Art. 16 StGB; Sperrfrist→Art. 336c OR). Deklinations-Phrasen («vereinfachtes Verfahren») unscharf
  — Term-, keine semantische Suche. Snippet um den Treffer + Sprung `/gesetze/bund/<k>#art-<n>`.
- Encoder `Charset.LatinBalance` + lowercase + `suggest`. Test (`artikelGruppe` + Reihenfolge),
  visuell im Browser bestätigt. `npm run gate` grün, golden byte-gleich. **Offen:** Kanton-Artikel
  in den Index; FUNDAMENT-UMBAU-Startseiten-Rahmen. Kein Deploy.

## Session 28.6.2026 — §9-DEPLOY #2: Streitwert-Grenzwert + zweiachsiger Einstieg → PROD live

David-Ja «deploy». Volles Ritual: Tore grün (gate · build 57 Routen · e2e 86); **2 Opus-Bug-Check-
Agents** über `b7273ae0..HEAD` (Code-Lupe + 110 empirische Checks) → **keine HOCH/MITTEL**, 3 NIEDRIG
gefixt (Art. 91 II ZPO-Wording: setzt Streitwert, nicht Verfahrensart · `einstieg.anzahl` aus
gelisteten Zellen = Badge≙Liste §8 · `einstiegMatrix` memoisiert). Push + Worktree-Deploy.
**DEPLOYT: `dpl_5Mj2fTkmfxZKywVCpQELyRsBNJZf` (READY), commit `88895088`, lexmetrik.vercel.app.**
Nachkontrolle: 7 Routen 200; `/rechner` trägt live «Einstieg nach Rechtsgebiet»; Asset-Hash
live = frischer HEAD-Build (`index-CeyJ216u.js`). Worktree entfernt.

## Session 28.6.2026 — ROADMAP Welle 2 · Schritt 5: zweiachsiger Einstieg (Rechtsgebiet × Aufgabe) → mit Batch deployt `88895088`

Auffindbarkeits-Schicht, [OF]-Kern: **`einstiegMatrix()`** (`src/lib/einstieg.ts`) projiziert
den Katalog (§5, EINE Quelle — kein zweiter Pfad) auf **Rechtsgebiet × Aufgabe**; nur verfügbare
Karten (§8). Komponente **`ZweiachsigerEinstieg`** als ZWEITE Achse oben auf `/rechner` (bisher nur
nach Aufgabe gegliedert): aufklappbare Gebiets-Kacheln (12), je Gebiet die Werkzeuge nach Aufgabe
(Zuständigkeiten/Fristen/Gebühren/Vorlagen) als Direktlinks. Konsistenz-Tor `einstieg.test.ts`
(7 Fälle: kein verwaistes Gebiet, kein still verschwundenes Werkzeug, keine Dubletten/toten Links).
Visuell (1000 px) bestätigt. **Bug-Check:** Gate fing einen positionsbasierten `katalog.test`-Bruch
(neue Sektion oberhalb) → faithful auf den Fristen-Register-Abschnitt eingegrenzt (Intent erhalten,
§6.3-deklariert). `npm run gate` grün, golden byte-gleich. **Offen (Schritt 5-Rest):** globale Suche
(FlexSearch = Davids Entscheid) + Startseiten-Modul-Rahmen (FUNDAMENT-UMBAU, Worktree/Visualdiff).
Kein Deploy.

## Session 28.6.2026 — ROADMAP Schritt 3 abgearbeitet (#2 neu gebaut, #3/#4 bestanden, #1 zurückgestellt; NICHT deployt)

Nach dem Deploy Schritt 3 «Alltags-Rechner als Cockpits» durchgegangen. Befund: der Grossteil war
in diesem reifen Repo **schon gebaut** — sauber statt Make-Work:
- **#2 Streitwert + Grenzwert-Abgleich — NEU gebaut** (`streitwertGrenzwerte()` in `streitwert.ts`):
  ordnet den Verfahrens-Streitwert STRIKT getrennt der ZPO-Verfahrensart (Art. 243 I, 30k) und der
  BGG-Beschwerde-Schwelle (Art. 74 I, 30k/15k Miete-Arbeit) zu; nicht-rechenbare Tore als «selbst
  prüfen» (§8); Schwellen am Snapshot verifiziert (§7); `StreitwertForm` mit Gebiets-Toggle; 9 Tests
  + §11-Dossier-Nachtrag; golden byte-gleich; visuell bestätigt.
- **#3 Zuständigkeitsnavigator** — bestand vollständig (Zivil/SchKG/Straf, 6 Test-Dateien) → nichts gebaut.
- **#4 Rechtsmittel-/Eintretensprüfung** — Logik bestand (`bestimmeRechtsmittel` + `berechneBgerRechtsweg`,
  im Navigator integriert); separate `rechtsmittel.ts` wäre §5-Duplikat → **bewusst nicht gebaut**.
- **#1 Fristen-Cockpit** — **zurückgestellt:** kollidiert mit S-5c (10.6.: eigenständiger Fristenspiegel
  bewusst aufgelöst). David will den Einstieg nicht wiederbeleben.
`npm run gate` grün. Kein Deploy (sammelt fürs nächste Fenster).

## Session 28.6.2026 — §9-DEPLOY des Batches (S0 + Welle 1·1 + Schritt 2) → PROD live

David-Ja «deploy». Volles deploy-check-Ritual: Tore grün (tsc·vitest·golden·lint·check ·
build 57 Routen · **e2e 86 passed**); **Bug-Check** = 2 unabhängige Opus-Agents über das Delta
`359d52b2..HEAD` (Code-Lupe + 219 empirische vite-node-Repros) → **keine HOCH/MITTEL-Befunde**,
3 NIEDRIG (2 kommentar-only gefixt: §13-Dash-Rest + VORLAUF-Spiegelung markiert; 1 theoretisch
belassen). Push `→origin/main` + Worktree-Deploy aus sauberem HEAD.
**DEPLOYT: `dpl_AdTukcPUe22svYRfe73pRkStWTKR` (READY), commit `b7273ae0`, lexmetrik.vercel.app.**
Nachkontrolle: 9 Kernrouten HTTP 200 (inkl. neuer `/gesetze`-Hinweis + `/methodik`-Verfallsfläche);
Asset-Hash live=lokal (`index-BNn6dsfH.js`); `/methodik` trägt live den S0-Abschnitt. Worktree
entfernt.

## Session 28.6.2026 — ROADMAP Schritt 2 «Norm↔Werkzeug-Brücke» (Index-Teil, gegated → mit Batch deployt b7273ae0)

Nach Welle 1·1 den nächsten ROADMAP-Schritt genommen. Befund (Explore-Agent): die Brücke
**existierte schon** — `kontext.ts`/`werkzeugeFuerEntscheid` löst Norm→Werkzeug auf, `KontextPanel`
zeigt sie in allen 3 Readern. Gebaut wurde die **Härtung + Sichtbarkeit**:
- `werkzeugeFuer` → **`werkzeugeFuerNorm`** umbenannt (ROADMAP-Name; erlass-granular, 17 Erlasse),
  `ERLASS_WERKZEUGE`-Map exportiert.
- **Konsistenz-Tor** `src/tests/werkzeuge.test.ts` (6 Fälle): jede Karten-ID existiert im Katalog
  (sonst verschluckt `werkzeugeFuerNorm` einen Tippfehler still → heimlich fehlendes Werkzeug, §8),
  kein verwaister Erlass-Key, keine Duplikate, Symmetrie zu `massgebendeErlasse`. **Bug-Check:
  Daten sauber** (kein toter Verweis) — das Tor schützt künftig.
- **Erlass-Karte** (`ErlassKarte.tsx`, `/gesetze`): dezenter brass-Hinweis «N passende Werkzeuge»
  in der Meta-Zeile (Task 4.3 «auf der Erlass-Karte»); Singular/Plural korrekt, fehlt sauber bei
  nicht abgedeckten Erlassen; visuell (1000 px) bestätigt. SSoT = Katalog (§5).
- **Der zweiachsige Startseiten-Einstieg (Rechtsgebiet × Aufgabe) gehört zu Schritt 5** (Welle 2),
  nutzt denselben Index — bewusst NICHT hier. `npm run gate` grün. Kein Deploy.

## Session 28.6.2026 — ROADMAP Welle 1·1 Begründungs-Absatz: **alle [OF]-Teile (Phasen 0–5) gebaut + gegated → mit Batch deployt `b7273ae0`**

Nach S0 den nächsten ROADMAP-Schritt (Welle 1·1) bis an die David-Entscheid-Grenze abgearbeitet
(autonom, Bug-Check je Schritt, ein Pathspec-Commit je Phase, kein Deploy). Reihenfolge nach
`FAHRPLAN-BEGRUENDUNGS-ABSATZ.md`. **8 Commits** (`f8a3dc24`-Folge … `6843e441`).

- **Phase 0** — Golden-Erst-Baseline (`absatz:<id>`, §5-faithful: zpo/schkg byte-exakter
  `zusatz`-Ausdruck, übrige Roh-Ergebnis) + Linter `begruendungLinter.test.ts`.
- **Phase 1 (B1-1)** — benanntes Engine-Feld `fristbeginnNorm` (Zpo/SchkgErgebnis) statt
  Magic-Index `normverweise[0]/[1]`; `ZpoErgebnis`/`SchkgErgebnis`, Forms ziehen das Feld;
  Engine-Wächter `fristbeginnNorm.test.ts`. Golden-Re-Baseline 18 Fälle; `absatz:zpo/schkg`
  blieben byte-gleich = Beweis der Index-Gleichheit.
- **Phase 2** — `BegruendungSlot` (eine Aufrufstelle/Form) + `useKopieren`-Hook +
  `BEGRUENDUNG_VORBEHALT`-Konstante (§5); **alle 16 Forms migriert** (verhaltensneutral, golden
  byte-gleich, visuell auf `/rechner/zpo-fristen` bestätigt); Render-Test.
- **Phase 3 (B3-1)** — `PdfDocConfig.begruendung` + «Für die Rechtsschrift»-PDF-Block (Vorbehalt
  aus der Konstante, VOR Disclaimer); **Default AUS** → PDFs byte-identisch; Test.
- **Phase 4 (B4-0)** — Prozesskosten- + Notariat/Grundbuch-Seite in den Smoke.
- **Phase 5 (B5-1)** — Linter-Goldlist deckt **14 Engines**.
- **B0-2-Rest** — 4 weitere Engines (streitwert/teuerung/gebvKosten/erbFristen) nachgezogen.

**Bug-Check-Funde (alle behoben, je Schritt):** (1) doppelter Schlusspunkt «… u. a..» in
`normenSatz()` — sichtbar in allen 16 Forms (§13/F6); (2) `zust`/`rm` UI-gewickelt (kein rohes
`Berechnungsergebnis`) → korrekt deferred; (3) `begruendungsAbsatz('')` gab ein blosses «.» →
Leer-Schranke; (4) `erbFristen.ts` durchgängig Geviertstrich «—» statt Halbgeviert «–» (§13,
vom neuen Linter aufgedeckt, von `konventionen.test` nie erfasst) → global korrigiert.

**Offen — alles decision-gated (warten auf David):** PDF-Rollout B3-2/3 (#3), Kosten-Rechner
B4-2 (#1), B4-1 (Zuständigkeits-Teil-Slots — prosa-Tauglichkeit prüfen), B5-2 (UI↔PDF-Wächter,
erst mit Rollout), B0-2-Rest `allg/zust/rm` (UI-gewickelt). 4 David-Entscheide mit
konservativem Default-und-Flag im FAHRPLAN dokumentiert. `npm run gate` durchgehend grün.

## Session 28.6.2026 — ROADMAP S0 «Verfallsregister sichtbar» (gebaut + gegated → mit Batch deployt `b7273ae0`)

Obersten offenen ROADMAP-Schritt genommen: **S0** (fristgetrieben, FRIST 30.6.). Mechanische
Erfassung lief bereits (`check:verfall` fängt den am 30.6. ablaufenden SG-GKV-Tarif + GR-HV/BE-EAV
31.12. + Referenzzins Sept. + BE-Formularpflicht 1.11.). Offen war die **benannte UI-Fläche**.

- **Geteilte Parse-Quelle (§5):** Datums-Grammatik aus `scripts/verfall-pruefen.ts` in
  `scripts/verfall-parse.ts` extrahiert (verhaltensneutral — `check:verfall`-Ausgabe byte-gleich;
  Freitext-Label-Kürzung auf 70 wanderte in die CLI, der Parser hält das volle Label für die UI).
  Unit-Test `src/tests/verfallParse.test.ts` (11 Fälle).
- **Generator + Drift-Tor:** `gen:verfall` (`scripts/verfall-generieren.ts`) schreibt
  `src/data/verfallTermine.generated.ts` aus dem Register; `check:verfall-ui` (in der `check`-Kette)
  schlägt bei Drift fehl. Register bleibt SSoT.
- **Benannte UI-Fläche:** Abschnitt **«Aktualität & Pflege der Parameter»** auf `/methodik`
  (`src/components/VerfallUebersicht.tsx`) — 15 datierte Parameter, nächster Prüftermin, Stand/
  Rhythmus, Status-Badge (verfallen/bald fällig/aktuell) **client-seitig** berechnet (prerender-
  /hydration-sicher; `/methodik` ist prerendert). §13-tokenisiert (lc-tile/lc-chip/lc-badge-*),
  mobil 360 px geprüft (Playwright). Keine neue Route (kein SEO-A11Y-Kollisionsset).
- `npm run gate` grün (tsc · vitest · golden byte-gleich · lint · check). **Kein Push/Deploy** —
  S0 sammelt fürs Batch-Deploy-Fenster (§9; ROADMAP-Protokoll Ziff. 5).

## Session 28.6.2026 — Konsolidierter Webseiten-Handlungsplan (`ROADMAP.md`) + Bugfix Startseiten-News-Ticker (BGE-Doppel)

Auftrag David: LexMetrik als **«Schweizer Taschenmesser für Juristen»** — Webseite
und **Anlaufpunkt für ALLE Juristen** (Kanzlei/Gericht/Inhouse/Studierende), um
Gesetze/Rechtsprechung zu konsultieren + deterministische Werkzeuge; **nur amtliche,
urheberrechtlich freie Quellen** (Art. 5 URG, keine Kommentare); Dossier/Mandat
GEPARKT; Werkzeuge strikt zustandslos. **Ergebnis: `ROADMAP.md` ist jetzt DER eine
Handlungsplan** — konsolidiert alle 26 `FAHRPLAN-*.md` + Strategie-Doks; das frühere
`HANDLUNGSPLAN.md` ist eingefaltet und nach `archiv/` verschoben (Verweis in dieser
Datei umgebogen). Aufbau: Ausführungs-Protokoll · Produktvision (4 Klingen
Konsultieren/Rechnen/Verzahnen/Finden) · Leitprinzipien (amtliche Quellen zuoberst) ·
nummerierte, abhakbare Bau-Reihenfolge S0+Wellen 1–13 (autonom durch künftige Sessions
abarbeitbar) · Funktions-Katalog mit Aufbau+§-Auflagen (18 Werkzeuge) · Geparkt/Abnahme-
Warteschlange · Pflege & Termine. Vorarbeit: mehrere ultracode-Workflows (modulare
Architektur · Überblicks-/Funktions-Ideation · Plan-Straffen · Personas+Studierende,
amtliche Quellen), alle read-only. Nur Doku — kein Code.

Im Zuge der Recherche **ein echter bestehender Bug** gefunden, verifiziert, gefixt
und deployt: **`NewsHeader.tsx`** zog die neuesten BGer-Entscheide ohne
`!e.verweis`-Filter — Volltext-Verweis-Stubs (Redirect auf `zielKey`, z. B.
`bge_152_V_52__voll`) erschienen als eigene Karten und **doppelten** echte BGE im
Ticker. Hauptansicht (`Rechtsprechung.tsx`) filtert sie durchgängig `!e.verweis`;
der Ticker zieht jetzt gleich. §3-reine Anzeige-Korrektur, `npm run gate` grün
(golden byte-gleich). Weitere Recherche-Befunde (Verjährungs-/Referenzwert-Board,
hartkodierte Zahlen/`TOP_ERLASSE`) betreffen noch nicht gebaute Funktionen → separat.

## Session 28.6.2026 — Aufräumung + Roadmap-Konsolidierung + §9-Deploy (auf `main` `a58ee276`, DEPLOYT `dpl_AXWbUpKqycDEZWXKNpa1e3aqcx75`, prod verifiziert lexmetrik.vercel.app)

Auftrag David: «räum auf · tiefer · setze alle Befunde um · mach den Weiterbau
sinnvoller · run till dry · push + deploy». Isolierter Worktree (§12), abgebrancht
von `a1fdd1bd`, am Ende per Fast-Forward in `main` integriert + deployt.

- **Doc/Memory-Aufräumung** (`a1fdd1bd`): 5 abgeschlossene Pläne → `archiv/`
  (JETZT-MACHEN, HANDOFF-NACHT-MATERIALIEN, GESETZE-REVIEW [3 davon konvergent mit
  der Parallel-Session], LEITENTSCHEID-BGE-VOLLTEXT, GESETZE-UX-9PUNKTE — beide
  letzteren Code-verifiziert voll abgeschlossen); `archiv/README`-Index ergänzt;
  3 verbrauchte Memory-Trigger («jetzt machen/weiter/los») gelöscht; stale STAND-
  Blöcke gefixt (RECHTSSAMMLUNG «ungepusht»→gemergt+prod-live; INTERNATIONAL P3-
  Selbstwiderspruch→erledigt `0f9a9043`).
- **§12-Artefakt-Fix** (`5eb37f43`): Beim Doc-Commit ging die Lösch-Seite zweier
  `git mv` verloren, als HEAD durch die Parallel-Session wechselte (Root+archiv-
  Duplikat). Root-Duplikate entfernt — mit dem FF nach `main` geheilt.
- **Audit der Parallel-Aufräumung statt Redo** (Batch A–E waren schon erledigt):
  ein test-abgeschirmtes totes Residuum gefunden + §6-verifiziert entfernt
  (`72d174a0`, `randtitelTeile`/`randtitelEintraege`; tsc grün, golden 187 byte-
  gleich, vitest 2682 grün).
- **ROADMAP.md** (`d07b79cf`): 26 aktive Fahrpläne via ultracode (26 Extrakte +
  Rahmen-Synthese) zu EINEM priorisierten Steuerungsblick konsolidiert. Sortier-
  Hebel = Abnahme-Zeitsperre bis 1.12. ([OF] vor [D]). JETZT-Block P0 ohne Fachzeit.
- **e2e-Fix** (`a58ee276`): 2 stale rechtsprechung-Locator an die deployte UI
  nachgezogen (Gemeinwesen-aria-label + B3-Panel-Titel) — waren seit dem 27.6.-
  Redesign blind rot, da e2e nicht im schnellen Gate läuft. UI unverändert.
- **§9-Deploy:** Tore voll grün (gate + build + golden byte-gleich + e2e 86);
  unabhängiger ultracode-Bug-Check über das Delta `4906e537..HEAD` (5 Stränge,
  adversarial) = **0 Verhaltensänderungen, verhaltensneutral bestätigt**. Push +
  Prod-Deploy (`dpl_AXWbUpKqycDEZWXKNpa1e3aqcx75`), 8 Kernrouten HTTP 200,
  Asset-Hash live = lokal. **Deployt = Parallel-Ultracode-Code-Aufräumung
  (Batch A–E) + diese Doc/Roadmap/Aufräum-Arbeit gebündelt.**
- **Hinweis:** GitHub-Actions-CI ist wegen **Billing** dunkel (Job startet nicht,
  4 s; trifft alle letzten Pushes inkl. des zuvor live deployten Commits) — kein
  Code-Problem; lokale §9-Tore sind der massgebliche Gate. David: Billing prüfen.

## Session 27.6.2026 — Ultracode-Versimpelung/Verbesserung UI·CI·Logik·Sicherheit (BRANCH `verbesserung-ultracode-2026-06-27`, NICHT gemergt, NICHT deployt — wartet auf Davids Freigabe §9)

Autonome «run till dry»-Session (ultracode). Mehrstufiger Multi-Agent-Workflow:
Runde 1 Discovery über 4 Dimensionen (UI/CI-Design/Logik/Sicherheit), jeder Befund
adversarial verifiziert + sicherheitsklassifiziert → 20 real bestätigte Befunde.
Runde 2 adversariale Regressions-Prüfung des eigenen Diffs (3 Linsen: Splits /
Dedup+Tokens / Logik-Check — **keine Regression**) + Completeness-Sweep → 4 weitere
sichere Befunde. Runde 3 Abschluss-Critic → DRY. Jede Etappe gegen das §6-Gate
(`npm run gate` voll: tsc · vitest · golden **byte-gleich** · lint · check).

Umgesetzt (5 Commits `1a605f7b`→`a6c71267`, alle gate-grün):
- **A11y/§13-F3/F4:** Shell-Ziehgriff-Fokus sichtbar (Outline statt nur Farbe);
  ZefixSuche-Fehlerfarbe `text-warn-700`; Gemeinde-Input `aria-label`; PdfExport +
  Wizard-Export-Buttons (PDF/DOCX) mit `laedt`/`disabled`/`aria-busy` (Mehrfachklick-Schutz).
- **Design-Tokens:** `check:design-tokens` gehärtet (Default-Paletten-Farben,
  Arbitrary-#/rgb/hsl, rohe Inline-fontSize); Tokens `--timer-fs`/`--vorschau-fs`,
  `.lc-overline-soft` (5 Call-sites entzweckentfremdet); EntscheidBody-Fallback angeglichen.
- **Entdopplung §6 Ziff.6:** `fmtIsoStrict` (6 Vertrags-Schemas), `chfGanz` (4 Formulare)
  in `vorlagen/datum.ts` zentralisiert — §1-treu (semantisch abweichende CHF-Varianten NICHT zusammengeführt).
- **Toter Code:** `formGateText`, `hatInAppInhalt`, `kantonsfremd`-Zweige entfernt.
- **Sicherheit:** `encodeURIComponent` in geo.admin-Detail-URL; Wizard-localStorage-Fussnote
  ehrlicher (§8, On-Device-Persistenz + Fremdgeräte-Hinweis).
- **Datei-Splits §6 Ziff.6:** `GesetzLeser.tsx` 1132→8 Z. (gesetz-leser/), `VorlageAgGruendung.tsx`
  1294→533 Z. (vorlage-ag-gruendung/) — verhaltensneutral, golden byte-gleich, Regressions-geprüft.

OFFEN für David: (1) fachliche Abnahme + Merge/Deploy-Freigabe (§9). (2) **Geflaggt, NICHT
umgesetzt (§1, braucht Fachabnahme):** `gewaehrleistung.ts` SIA-Werkvertrag bei beweglichem
Objekt — Rechenwert 5 Jahre korrekt, aber zugehörige Normbemerkung sagt «2 Jahre» (Anzeige-
Widerspruch; Fix ändert golden + verlangt SIA-Norm-Zitier-Entscheid). (3) `internerRechtsprechungLink`
(bge.ts) ist tot, aber dokumentierte Fahrplan-8.5-Brücke → bewusst belassen.
Hinweis §12: Commit `1a605f7b` zog versehentlich fremde Archiv-Moves (JETZT-MACHEN.md u.a.)
mit (git commit ohne Pathspec bei vorab gestagtem Fremd-WIP); fremde Arbeit intakt, nur mitcommittet.

## Session 27.6.2026 — SEO/A11y Welle-1-Restlücken: og:image + CWV-Messung (gemergt main `4906e537`, DEPLOYT `dpl_HprP3VaYQ…`, prod verifiziert)

Isolierte Worktree-Session (§12), abgebrancht von main `ca2e46e3`. Auftrag David:
`FAHRPLAN-SEO-A11Y-GOVERNANCE.md` Punkt 2 «run till dry». **Befund beim IST-Audit:
Welle 1 + grosse Teile Welle 2 waren bereits gebaut** (W1.1 Detail-Prerender +
Sitemap-Index = 1876 URLs, W1.2/W1.3 seo-detail, W1.5 Thin-Content, W1.6 Karten-
Fokus, W1.7 axe-Tor 15, W1.9 Cache-Header, W2.2 Tabellen-`role`, W2.4 `lang`,
W2.6 44px). Echte autonome Restlücken nur zwei — beide hier geschlossen:

- **W1.10 og:image (war ganz offen):** statische Social-Card `public/og.png`
  (1200×630, Marken-Tokens) + Generator `scripts/og-bild.ts` (`npm run og:bild`,
  reproduzierbar statt Hand-Artefakt). `index.html` um `og:image`(+width/height/
  type/alt), `twitter:image` und `twitter:card=summary_large_image` ergänzt — das
  Prerender-Template reicht die Tags in ALLE 1876 Detailseiten durch (verifiziert
  in `dist/gesetze/bund/OR.html`).
- **W1.11 CWV-Messung (war offen):** `scripts/messung-cwv.ts` (`npm run messung:cwv`)
  misst LCP/Transfer/Requests am Indexierungs-Hebel über `vite preview`. **Bewusst
  KEIN harter Gate** (Timing umgebungsabhängig → §2-Determinismus); Mess-Infra
  Strang B. Baseline in `bibliothek/seo/cwv-baseline.md`. **Befund:** schwerste
  Seite OR (1.7 MB) LCP 616 ms lokal — render-then-replace trägt den ersten Paint
  über das statische HTML, das grosse JSON belastet nur Transfer, nicht LCP →
  **W2.8-Splitting für LCP nicht dringlich.**
- **W1.8 Heading-Hierarchie (war offen):** Diagnose über 11 Rubriken = 0
  Verstösse (`heading-order`/`page-has-heading-one`/`empty-heading` — axe-best-
  practice-Regeln, die das wcag-Tag-Tor nicht fährt). Als Regressionsschutz in
  `e2e/a11y.e2e.ts` festgenagelt (10 Tests, eigener `withRules`-Lauf, damit das
  Haupt-`axePruefen` nicht das ganze best-practice-Set einzieht). 10/10 grün.

Offen (brauchen David / ausserhalb autonom): W1.12 GSC-Property + Sitemap-Submit,
W3.x (FAQ/Themen-Hubs/Keywords/Domain/Use-of-Color). Gate vorher + nachher grün
(tsc · vitest · golden byte-gleich · lint · check). **Deployt 27.6. auf Davids Ja**
(`dpl_HprP3VaYQ…`, prod verifiziert: og:image live, /gesetze/bund/OR ohne noindex,
og.png HTTP 200, Sitemap-Index 4 Teile). **`origin/main` noch nicht gepusht** (35+
Commits — Davids «push» ausstehend).

## Session 27.6.2026 — B3 Kontext-Panel: Norm ↔ Entscheid ↔ Material ↔ Werkzeug (Worktree `agent-a5f29b82045f2c063`, NICHT deployt)

Isolierte Worktree-Session (§12), abgebrancht von main `6f62cdd5` (Lane G 6b +
Lane R Batch 1–3 + Materialien). Gate vorher/nachher grün, `golden:vergleich`
byte-gleich, `check:entscheide` OK (603 Entscheide, 12 Vorbestand-Warnungen).
Reine Verknüpfungs-Darstellung über vorhandene `normKeys` (§3) — keine neue
materielle Zuordnung, keine Rechtslogik.

- **Rahmen zuerst (§10):** eine zentrale Auflöse-Schicht `src/lib/kontext.ts`
  (`kontextSync` synchron für Normen/Materialien/Werkzeuge + `kontextEntscheide`
  async über den Norm→Entscheid-Index) und EINE wiederverwendbare Komponente
  `src/components/kontext/KontextPanel.tsx`. Jede Zuordnung lebt weiter an genau
  einer Stelle (§5): Werkzeuge/Materialien in `normtext/werkzeuge.ts`, Entscheide
  im build-time `rechtsprechung/norm-index.json`; kontext.ts projiziert sie nur.
- **Selbst-Korpus ausgelassen:** Norm-Reader zeigt keine Normen-Gruppe,
  Material-Reader keine Materialien-Gruppe, Entscheid-Reader keine Entscheid-
  Gruppe → keine Selbstverweise.
- **Drei Reader gleich eingebunden (§13 konsistent):** `GesetzLeser` (Norm —
  ersetzt die zwei alten Top-`<details>`-Blöcke Werkzeuge+BGer durch das Panel am
  Leseende, ergänzt Materialien; `rspr`-State + `rechtsprechungFuerErlass`-Import
  entfernt, das Panel lädt selbst), `EntscheidLeser` (Panel nach dem Provenienz-
  Footer), `MaterialLeser` (ersetzt die alte Verzahnungs-Sektion, ergänzt
  Entscheide). Tokens-only, Lesespalte (`max-w-reading`), ruhiger Leerzustand,
  WCAG-Kontrast hell+dunkel, mobil ohne Overflow (Playwright via Bash verifiziert).
- **Bidirektionalität + Drift-Tor:** `src/tests/kontext.test.ts` — Selbst-Korpus-
  Auslassung, keine toten Norm-Links, und Tor 4: jeder über `proNorm[K]`
  erreichte Entscheid nennt `K` in seinen `normKeys` zurück (Norm↔Entscheid
  konsistent). Im Gate (vitest).
- **Performance (§6.4):** synchrone Gruppen pro Render aus kleinen Registern
  (Key→Erlass-Map, kein O(n²)); Entscheide lazy, Ladezustand aus dem Ergebnis-Key
  abgeleitet (kein synchrones setState im Effect, react-hooks-konform).
- **Offen / `TODO(David)`:** fachliche Abnahme der Verknüpfungen steht aus
  (Abnahme-Zeitsperre, §8 — nichts «geprüft» markiert); Materialien-`normKeys`
  decken bisher v. a. Bundessteuer-Kreisschreiben ab (Korpus wächst); Entscheide
  bleiben «maschinell, keine geprüfte Präjudizienliste».

## Session 27.6.2026 — Lane R Batch 3 / Auftrag 9: eidg. Gerichte BVGer · BStGer · BPatGer (Worktree `agent-ae3c294dc4634009d`, NICHT deployt)

Isolierte Worktree-Session (§12), abgebrancht von main (Batch 1+2 + Materialien +
A9-Dossier). Gate vorher/nachher grün, `golden:vergleich` byte-gleich, Bestand
(272 BGE + 4 FR) byte-identisch (0 Snapshot-Dateien geändert).

- **Befund:** OpenCaseLaw führt alle drei Gerichte als eigene `court`-Codes
  (`bvger`/`bstger`/`bpatger`) — NICHT die entscheidsuche-Codes aus dem Dossier. →
  kein eigener Scraper; der bestehende OCL-Adapter trägt sie über denselben
  keyed-Lookup-Pfad wie Bund/Kanton.
- **Pipeline additiv (kein Bestand-Drift, §6):** `normtext-entscheide.ts` +
  `--additiv --eidg=bvger,bstger,bpatger --eidg-pro=5`. `ladeBestandSnapshots` lädt
  den committeten Korpus byte-treu von der Platte und ergänzt nur die neuen Gerichte
  (kein Live-Neuzug der 272 BGE). Je-Datei `erzeugt` aus `snap.abgerufen` hält den
  Bestand byte-gleich; `enumeriereNeuesteAlle` (ohne Sprachfilter) holt die wahren
  neuesten (FR/IT statt nur DE); proNorm deterministisch (key-Tiebreaker, §2).
- **15 Urteile** (5 je Gericht), de 10 / fr 3 / it 2 (erste IT-Einträge im Korpus).
  Alle `routine` (keine amtliche Sammlung aufgelöst → Invariante bgeReferenz⟺
  leitentscheid gewahrt, kein «Leitentscheid»-Badge), `kuratierung:'maschinell'`,
  `verifiziert:false`. OCL-Regeste → `regesteAmtlich:false` → Reader zeigt
  «Zusammenfassung» (kein Regeste-Kasten, §8). Norm→Entscheid-Index auf
  `gerichtstyp==='bundesgericht'` geschärft (neue Gerichte NICHT unter
  «Bundesgerichtsentscheide», Bestand identisch).
- **Darstellung:** Voll-Urteil-Struktur wie BGer (Kopf/Sachverhalt/Erwägungen/
  Dispositiv), FR/IT-Bodies mit Kopf + Gliederung (A2). **Instanz-Achse** als eigene
  Facette aktiviert (`gerichtstyp`: BGer/BVGer/BStGer/BPatGer/Kantone, cross-gefiltert,
  Null-Prune R15, Abk.-Chips + volle a11y-Bezeichnung). Übersicht gruppiert via
  `gruppiereNachInstanz`. B2-Golden +8 (Gericht×Sprache)-Zellen.
- **Verdrahtung:** Prerender 342 Detailseiten (+15, 0 übersprungen), Sitemap +15,
  Universal-Suche/SEO automatisch übers Register. Visuell hell/dunkel/mobil geprüft
  (Playwright via Bash) — keine Console-Fehler, neutrale Identität bestätigt.
- **Doku:** `bibliothek/rechtsprechung/eidg-gerichte-aufnahme-2026-06-27.md` (+ INDEX).
- **Offen / TODO(David):** Leitentscheid-Welle je Gericht (BVGE/TPF/BPatGer-Rubrik,
  Dossier §A–C); Sachgebiet-Feinschliff BStGer RR/CR (maschinell 'oeffentlich');
  fachliche Abnahme. **Commits, KEIN Push/Deploy** (§9, Abnahme-Zeitsperre).

## Session 27.6.2026 — Nacht-Session «jetzt los»: Materialien-Rubrik (Auftrag 5) + Gerichts-Dossier (Auftrag 9) (Worktree `nacht-materialien-2026-06-27`, NICHT deployt)

Parallele, isolierte Nacht-Session (HANDOFF-NACHT-MATERIALIEN.md, §12). Beide
Pakete erschöpft, Gate vorher und nachher grün, Golden byte-gleich, keine
verbotene Datei berührt.

- **Paket A — Auftrag 5 «Materialien» (Vollbau):** neue Top-Rubrik für amtliche
  Ressourcen / Soft-Law (Verwaltungsverordnungen, kein Gesetzesrang, §8). Eigener
  Namespace `src/lib/materialien/{typen,register,browse}.ts` (klont das normtext-Trio,
  berührt es nie), Generator `scripts/materialien/material-manifest*.ts` +
  `public/materialien/register.json` (deterministisch §2, sha-Provenienz) + Offline-Tor
  `check:materialien` (im `check` verdrahtet). **28 Einträge, alle `nur-live-link`**, von
  7 Bundesbehörden (ESTV·EDÖB·SECO·BSV·EHRA·FINMA·IGE), Fan-out-Recherche doppelt
  verifiziert (URLs alle 200 geprüft). Seiten `/materialien` (Filter Behörde/Doktyp/Suche)
  + `/materialien/:key` (Metadaten + Live-Link + normKeys-Verzahnung, KEIN Normtext §7).
  Additiv verdrahtet: App-Route, Navigation, SEO + SEO-Detail (28 prerenderte Detailseiten
  + Sitemap), vercel.json, Universal-Suche, `werkzeuge.ts` (`materialienFuerNorm` —
  Burggraben Norm↔Behördenpraxis). Tests `materialien-register.test.ts`. Visuell geprüft
  (Playwright hell/dunkel/mobil). Grundlage: `bibliothek/materialien/amtliche-ressourcen-2026-06-27.md`.
- **Paket B — Auftrag 9 (read-only):** Recherche-Dossier BVGer/BStGer/BPatGer in
  `bibliothek/rechtsprechung/neue-gerichte-dossier-2026-06-27.md` (Publikationsart,
  Leitentscheid-Kriterium, entscheidsuche-Spider, Geschäftsnummer-Regex, Sprachen FR/IT,
  Regel-Synthese am BGer-Muster, Kandidaten). Kein Code; steuert den Bau nach A2.
- Maschinell kuratiert, **fachliche Abnahme David offen** (Zeitsperre bis 1.12.2026).
  Deploy gesperrt — gebündelte §9-Freigabe am Ende.

## Session 27.6.2026 — JETZT-MACHEN Lane R · Batch 2: Achsen-UX (4) + Sprachfilter (8) + Leit/BGE-Merge (F4) (Worktree, NICHT deployt)

«jetzt machen» Batch 2, §12-isoliert im Worktree (abgebrancht vom main mit Batch 1
A1/A2/A3 + B2/B1-Tor + Lane G 6b — Worktree war anfangs 11 Commits hinter main,
auf `eb66609c` per `--ff-only` vorgezogen). Reine Darstellungsschicht (§3): **kein
Daten-/Build-Eingriff**, `public/rechtsprechung/register.json` byte-unverändert,
B2-Tor + `check:entscheide` grün, kein DE-BGE-Drift. Golden byte-gleich (187).

**Auftrag 4 — Achsen-UX (Design zuerst, 3 Varianten bewertet):** (1) Achsen-
Umschalter (Gruppieren-nach-Segment) — verworfen (konflatiert Filtern/Gruppieren,
grosser Rail-Umbau, mobil gedrängt); (2) zweite Kachel-Schiene — verworfen (zwei
Rails konkurrieren, Instanz redundant zum Ebene-Segment, mobil zwei Chip-Bänder vor
dem Inhalt); (3) **kohärente Facetten-Leiste — GEWÄHLT**: EINE sichtbare Leiste in
der Ergebnis-Spalte mit Toggle-Chips + Trefferzahl (Reglement R15). Umgesetzt:
`«Gemeinwesen»`-Achse (Alle/Bund/Kantone + Kanton-Drilldown GR/BE/ZH/SG/AG) —
**ersetzt** das alte Ebene-Segment (`Rechtsprechung.tsx`) UND den Kanton-Select
(`<details>`), also EINE Achse statt zweier konkurrierender Controls. **Instanz
(gerichtstyp)** ist heute deckungsgleich mit Bund/Kanton (nur 2 Werte: bundesgericht/
kantonal) → bewusst KEINE eigene Facette; lebt schon als `gruppiereNachInstanz`
(Weitere-Sektion) und wird mit Batch 3 (BVGer/BStGer/BPatGer) zur echten Achse.
**Abteilung NICHT ins Manifest gehoben** (begründet): nur 2 gerichtstyp-Werte →
geringer Achsen-Nutzen, `abteilung` ist Freitext-Chamber, das Heben erzwänge eine
register.json-Regeneration (Drift-Risiko gegen B2/`check:entscheide`) ohne UI-Gewinn
in diesem Batch → §7-konform weggelassen, A2-Zusatz bleibt offen für Batch 3.

**Auftrag 8 — Sprachfilter:** echte FR-Entscheide vorhanden (4 real, Keys
`bge_152_I_105`/`bge_151_IV_357`/`bge_152_II_75`/`bge_152_II_98`). Sprache aus dem
vergrabenen `<details>`-Select in **dieselbe** Facetten-Leiste hochgezogen
(Alle/Deutsch/Französisch) — eine kohärente Leiste, nicht zwei konkurrierende.
Empirisch verifiziert: Klick «Französisch» → Treffer 4, jeder Eintrag trägt FR-Marke.

**F4 — Leit/BGE-Merge:** am aktuellen Korpus erneut geprüft `nurLeitentscheide`==
`nurBge` (272=272, 0 Divergenz, real ohne Verweise) → die zwei Häkchen zu EINEM
sichtbaren Filter «Nur Leitentscheide (amtliche BGE)» zusammengeführt. Feld
`leitcharakter` + `nurBge`-Prädikat (browse.ts) als latente Grundlage **behalten**
(spätere Trennung amtliche-BGE ⟂ Leitentscheid bleibt möglich).

**Bug-/Logik-Check + adversarial:** Facetten-Zähler **cross-gefiltert** (konsistent
mit der Sachgebiets-Rail, R15) — je Achse Resttreffer MIT allen anderen Filtern, aber
OHNE die eigene Achse; Null-Optionen ausgeblendet (FR aktiv → Gemeinwesen prunt auf
Alle 4/Bund 4; ZH aktiv → Sprache prunt auf Alle 6/Deutsch 6, kein Null-Treffer-Klick).
A11y: jede Achse `role=group`+aria-label, sprechendes Chip-aria-label; Ziffer
ink-500→ink-600 (12px auf --well 4.47→≥4.5:1, WCAG 1.4.3, Werte nicht runden). axe
wcag2aa/21aa/22aa: 0 Kontrast-Verstösse hell+dunkel. Playwright-Sicht hell/dunkel/
mobil (390) ok, Chips wrappen, kein Querscroll.

**5 Commits** (Pathspec, §12): F4-Merge · Auftrag 4 Gemeinwesen · Auftrag 8 Sprache ·
Bug-Check Cross-Filter · a11y. **Keine** verbotene Nacht-Session-Datei berührt
(materialien/App/navigation/seo/Suche/prerender/vercel/werkzeuge = 0). **NICHT
deployt** (§9 — Davids Ja offen). `npm run gate` (voll) grün. Offen/TODO(David):
fachliche Abnahme der Achsen-UX; Abteilung+Instanz als echte Achsen mit Batch 3.

## Session 27.6.2026 — JETZT-MACHEN Lane R · Batch 1: A1 + A2 + A3 (Worktree, nicht deployt)

«jetzt machen» — die drei Schritte A1→A2→A3 seriell (teilen Dateien), §12-isoliert
im Worktree, abgebrancht vom main mit B2-Tor + B1-Sweep. F5 (6 Regeln) von David
bestätigt. Gate vorher + nach jedem Schritt + am Schluss GRÜN, golden:vergleich
byte-gleich, DE-BGE driften NICHT. Drei getrennte Commits (A1/A2/A3). Nicht deployt.
- **A1 — BGE-Seitenmarker display-first aus dem Satzfluss gelöst**
  (`EntscheidBody.tsx`): der Inline-Kolumnentitel «BGE … S. ###» (B1: 273 Entscheide
  in `abschnitte` UND `auszugAbschnitte`) wird im Render herausgelöst und als
  dezenter, hochgestellter Seiten-Marker ERHALTEN (Default F2, `text-ink-600`/WCAG).
  Idempotent (ohne Marker zeichenidentisch zu `<NormText>`) → B2-Tor bleibt grün.
  §1-Ausnahme: steht der Marker hinter einer fremden Zitierung (8 Auszüge), wird der
  Paginierungs-Marker still entfernt (sonst falsche Fundstelle). Adversariale Render-
  Sonde über den ganzen Korpus: **0 verbleibende Inline-Marker, 2269 erhaltene
  Seiten-Marker**. Visuell (hell/mobil) bestätigt: dezentes `ˢ·³⁷`.
- **A2 — Mehrsprachige Extraktion (FR/IT) + Sprach-Label aus dem Body**
  (`adapter-entscheide.ts`, `sachverhalt.ts`): vier FR-Leitentscheide trugen
  fälschlich `sprache:'de'` (Body aus dem fr-aza-Urteil, Sprache aus dem 'bge'-Record
  kopiert). Fix: Sachverhalt-/Rubrum-Marker mehrsprachig (Faits/Composition/
  Participants/Objet/recours…contre + it), `spracheAusBody()`-Detektor (über 327
  Bodies verifiziert: 323 de / 4 fr / 0 it, kein DE-Fehlklassifikat), Top-/Sub-Marker-
  Lookahead um Latin-1-Akzent-Grossbuchstaben erweitert (A./B./C. bei «À/É…»).
  Nur die **4 FR regeneriert** (datum=Korpus-Datum → kein DE-Drift; register.json nur
  sprache de→fr, norm-index inhaltsgleich, KEIN anderes Snapshot-File berührt). Alle 4
  jetzt `sprache:'fr'`, Kopf-Block + A./B./C.-Gliederung (152_II_75 nur Teil-Rubrum:
  label-loses fr-Format → TODO(David)). **B2-Golden §6.3 deklariert gehoben**: fr-Zelle
  (152_I_105) trägt die korrekten Werte, de-Zelle byte-stabil. Adversarial: A1-Sweep
  post-A2 = 0 Leaks, check:entscheide OK. Visuell: FR-Kopf-Block (Objet/Parties/
  Autorité/Composition) + A./B./C. bestätigt.
- **A3 — Verbindliche Regeln für nicht-amtlich publizierte Urteile (F5 ✓)**:
  Reader/Reihenfolge waren schon konform (Regel 1–4,6: gleicher `EntscheidBody`,
  kein Auszug-Umschalter, Regeste→«Zusammenfassung», kein Leit-Badge, `maschinell`).
  **Regel 5 umgesetzt** (`browse.ts` `gruppiereNachInstanz` + `Rechtsprechung.tsx`):
  nicht-amtliche Urteile als eigene Voll-Urteil-Zeilen GRUPPIERT UNTER IHRER INSTANZ
  (Bundesgericht→…→Kantonale Gerichte), «verweis»-Karte bleibt der BGE→Volltext-
  Brücke vorbehalten. Tor: 2 neue Fälle in `rechtsprechung-browse.test.ts`. **Regeln
  verbindlich dokumentiert** in `DESIGN-REGLEMENT-RECHTSPRECHUNG.md` (Abschnitt
  «Verbindliche Regeln: nicht amtlich publizierte Urteile», mit Andockpunkten +
  Tor-Verweisen). Visuell (Reader + Übersicht) bestätigt.
- **Offen / TODO(David):** fachliche Einzelabnahme aller 4 FR + der A3-Inhalte
  (`verifiziert:false`); voll-Rubrum des label-losen fr-Formats (152_II_75); IT-Bodies
  0 im Korpus (Pfad nicht regressiv, aber unbelegt); kantonaler PDF-Superscript-Glue
  (`AG/HOR_2024_19`, B1-Klasse C/D) bleibt A1-Folge. Deploy = Davids Entscheid.

## Session 27.6.2026 — JETZT-MACHEN Lane R · Batch 1: B2 (Konsistenz-Tor) + B1 (Render-Noise-Sweep) (Worktree, nicht deployt)

«jetzt machen» — nur die ersten zwei Schritte B2+B1 von Lane R Batch 1 (A1/A2/A3
bewusst NICHT angefasst, Folge-Session). §12-isoliert im Worktree, Gate vorher
und nachher grün, Golden byte-gleich (keine Verhaltensänderung).
- **B2 — Konsistenz-Golden-Tor je (Gericht × Sprache):** neues
  `src/tests/entscheid-konsistenz.test.tsx` friert die heute gute BGE-de-
  Darstellung ein, **bevor** A2 die Extraktion anfasst. Mechanik bewusst zur
  Infrastruktur passend (explizite vitest-Assertions auf echtem Korpus-Entscheid
  via `react-dom/server`, wie ArtikelBody.test — KEINE `toMatchSnapshot`-Dateien,
  KEINE golden-outputs-Aufnahme). Zwei Zellen im erweiterbaren `REFERENZEN`-Array:
  `bge×de` (`150_III_137`: Kopf-Block 4 Rubrum-Zeilen, Sachverhalt A./B./C., kein
  Seitenmarker im VOLL-Body) + `bge×fr` (`152_I_105`: bewusst auf den degradierten
  **Vor-A2-Zustand** eingefroren — sprache=de-Mislabel, kein Kopf, ungegliedert,
  mit `TODO(David)`/A2-Hinweis). Je Zelle eingefroren: sha, Rubrum-Labels,
  Sachverhalts-Marken, sprache, marker-freier Render. Erweitern = ein Array-
  Eintrag (Batch 3/A2). Adversarial geprüft (Marker-Regex feuert auf Auszug-Body
  + bekannte Leaker → Tor kann fallen). 11 Tests grün.
- **B1 — Render-Noise-Sweep (read-only, kein Code-Fix):** Fix-Liste in
  `bibliothek/render-noise-sweep-2026-06-27.md` (+ INDEX). Befunde (empirisch,
  327 Snapshots): **Seitenmarker in 273 Entscheiden** (261 Auszug + 16 VOLL —
  korrigiert die Plan-Annahme «0 in abschnitte»); **4 FR-Bodies fälschlich
  `sprache:'de'`** (`151_IV_357`/`152_II_75`/`152_II_98`/`152_I_105` — korrigiert
  §7 «genau ein FR-Body»); 7 gekappte Sachverhalte; **Fussnoten-Leak = Heuristik-
  Falsch-Positiv** (41 «Fn.» = Doktrin-Zitate), nur 1 echter kantonaler
  Superscript-Leak (`AG/HOR_2024_19`); Regeste-Leak/verirrte Marken = 0.
  Steuert A1/A2/A3. Alles `verifiziert:false`, Abnahme David offen.

## Session 27.6.2026 — Lane G / Auftrag 6b: Randtitel-Ebenen einklappbar (Worktree, NICHT deployt)

JETZT-MACHEN §7 Lane G Punkt b (eigener Worktree, von main abgebrancht). Die
Buchstaben-/Randtitel-Ebenen des Gesetze-Readers («A. Persönlichkeit im
Allgemeinen → II. Handlungsfähigkeit → 2. Voraussetzungen») sind jetzt — analog
Fedlex — echte, einklappbare Gliederungs-Knoten statt blosser Artikel-Marginalien.
Default F3 (Laufzeit-Ableitung, KEIN Massen-Regen der struktur-Sidecars, §7
unberührt). Reine Präsentation (§3) — keine Rechtsregel/Normtext berührt.
- **Promotion (`src/lib/normtext/browse.ts` `baueGliederungsbaum`):** zur amtlichen
  Gliederung werden die von mehreren Artikeln GETEILTEN Randtitel-Ahnen als
  Sektions-Knoten angehängt (Ebene = unter der tiefsten Gliederungsstufe ansetzend;
  `randtitel:true`-Flag auf `Sektion`). Die artikel-EIGENE Sachüberschrift (das
  «Blatt») bleibt die Artikel-Überschrift — so verkümmert nicht jeder Einzel-Randtitel
  (≈83 %) zu einer 1-Artikel-Sektion. Neue reine Funktion `randtitelKnoten` in
  `darstellung.ts` (teilt Kette positionsweise in `ahnen`/`blatt`; aufgehobenes Blatt
  «c. …» → blatt=null, Artikel bleibt in seiner Gruppe).
- **Reader (`src/pages/GesetzLeser.tsx`):** `margAnzeige` zeigt im Fliesstext nur noch
  das Blatt (keine Doppel-Darstellung mehr, da die Ahnen jetzt Sektionsköpfe sind).
  `renderSektion` mischt direkte Artikel + Unter-Knoten in DOKUMENT-Reihenfolge
  (neuer `sekPos`-Memo, da ein Knoten seit 6b oft beides trägt). `SektionKopf` gibt
  Randtitel-Knoten eine ruhige Serif-Stimme + Einzug-Strich (`border-l/pl-3`, Tokens).
  Der bestehende Klapp-/TOC-/Scroll-Spy-Stack greift automatisch (Knoten sind jetzt
  echte `Sektion`en). Such-/Treffersicht unverändert (volle Marginalie).
- **Tore:** voller Gate grün (tsc · vitest · **golden byte-gleich** · lint 0 · check)
  + build (56 Routen, 1449 Erlasse 0 übersprungen) + e2e 76/76 (inkl. neuem
  `gesetze-randtitel-6b`; 6a-`gesetze-marginalie` weiter grün). Neue Unit-Tests:
  `randtitelKnoten` (darstellung), `baueGliederungsbaum`-Promotion (normtext-browse).
- **Visuell verifiziert** (Playwright via Bash, ZGB hell/dunkel/mobil): TOC zeigt die
  volle Verschachtelung A.→II.→2.; Fliesstext klappt «2. Voraussetzungen» sauber
  ein/aus; aufgehobener Art. 15 bleibt in Dokument-Reihenfolge in seiner Gruppe ohne
  Doppel-Titel; kein 390px-Overflow.
- **OFFEN/Annahmen:** Deploy entscheidet David (NICHT deployt). Randtitel-Knoten-Ebene
  wird positionsweise abgeleitet (Marker-Tier A./I./1. ist mehrdeutig) — bei
  inkonsistenter Kette theoretisch ein Doppel-Knoten (reine Anzeige, kein Logikfehler).
  `randtitelTeile`/`randtitelEintraege` bleiben (test-gedeckt, für eine spätere schmale
  Ansicht) — bewusst nicht entfernt.

## Session 26.6.2026 — JETZT-MACHEN Welle 0 + Lane G 6a: Kalender-Füllung & einheitliche Randtitel (deployt)

«jetzt machen» (JETZT-MACHEN.md). F5 (6 Regeln nicht-amtliche Urteile) von David
bestätigt; F1–F4 als Default. Zwei eigenständige Wellen umgesetzt, je eigener
Worktree, nach main gemergt, deployt. **Rest des Plans bewusst offen** (s. u.).
- **Welle 0 / Auftrag 7 — Schnellrechner-Kalender füllt seine Karte:** der
  kompakte Startseiten-Kalender klebte als feste 12.5rem-Kachel links im nicht-
  streckenden `flex-wrap`-Container → rechts Leerraum («füllt nicht alles aus»).
  Fix nur im `kompakt`-Pfad (`src/components/FristenKalender.tsx`): Monate
  `justify-center` + `flex-1 basis-[12.5rem] max-w-[17rem]` → ein Monat zentriert,
  zwei teilen die Breite, mobil gestapelt füllend. Nicht-kompakt (6 Fristen-
  Formulare) byte-gleich (beide Änderungen hinter `kompakt`). Neues e2e
  `schnellrechner-kalender` (zentriert + Füllgrad >55 %, kein Overflow 390px).
- **Lane G / Auftrag 6a — Randtitel einheitlich je Gliederungstiefe:** Stufen
  («A.» / «I.» / «1.») wurden je Position im Delta formatiert (`i===marg.length-1`
  → fett), wodurch dieselbe Stufe («II. Handlungsfähigkeit») zwischen fett (Blatt)
  und klein (Vorfahre) flippte. Fix (F3, Laufzeit, kein Massen-Regen):
  `margAnzeige` liefert den absoluten Tiefen-Offset `ab`; neue reine Funktion
  `margStufeStil(level)` formatiert je ABSOLUTER Tiefe (0 Abschnitt uppercase,
  1 mittel, ≥2 Sachtitel fett). Daten unberührt (§3). Neues e2e
  `gesetze-marginalie` (Monotonie + ≤3 Stilstufen). DOM-Sonde ZGB bestätigt.
- **Bug-Check §9 (2 unabh. Agenten) fand eine Regression:** die erste
  6a-Version formatierte rein je absoluter Tiefe → einstufige Sachüberschriften
  (Tiefe 0, **82.8 %** der Bund-Randtitel, oft ohne Aufzähler) wurden zu blassen
  Abschnittslabeln. Fix `116d6eb7`: `margStufeStil(level, istBlatt)` — das Blatt
  ist immer prominent, nur Vorfahren ruhig. Empirisch (ADOV Plain-Titel + ZGB)
  + e2e auf Blatt-Prominenz-Invariante umgestellt nachgeprüft.
- **Tore + Deploy:** voller Gate grün (tsc · vitest · golden byte-gleich · lint
  0 · check · build) + e2e 75/75; deployt **116d6eb7** auf lexmetrik.vercel.app
  (Asset-Hash live=dist, 7 Kernrouten 200).
- **OFFEN (gleiche JETZT-MACHEN-Direktive, Folge-Sessions):** 6b einklappbare
  Buchstaben-Ebenen; Lane R Batch 1–3 (Seitenzahlen A1 · mehrsprachige Extraktion
  FR/IT A2 + Regen 272 BGE adversarial · nicht-amtliche Urteile A3 · Achsen-UX
  Auftrag 4 · Sprachfilter 8 · neue Gerichte 9) inkl. B1/B2-Golden; Welle Final
  (Materialien-Korpus Auftrag 5 + B3 Kontext-Panel).

## Session 26.6.2026 — A11y/E2E-Strang: Kontrast WCAG hell+dunkel, Suche ARIA-rein, E2E gegated (deployt)

Folgeauftrag David («ja» auf E2E-/A11y-Strang). Branch `fix/e2e-a11y`. Zwei
Entscheid-Fragen vorab geklärt (AskUserQuestion): brass-700 abdunkeln + Such-
Optionen ohne `<a>`.
- **Kontrast (axe, WCAG 4.5:1 hell UND dunkel):** `--brass-700` #8A6A2F→#826225
  (nur Hell; Dunkel-brass-700 separat unberührt) = min 4.63:1. Aufgehobene Artikel-
  Links ink-400→ink-500 (GesetzLeser, Dunkel 3.6→5.5). Regeste-Provenienz
  (EntscheidLeser) + Varianten-Unterlabel (VariantenKopf) ink-500→ink-600 auf
  brass-100-Grund (4.2→6.3).
- **Suche a11y-rein:** Listbox-Optionen sind `role=option` OHNE inneres `<a>`
  (Navigation per onNavigate-Callback) → `nested-interactive` weg; Cmd-/Mittelklick
  auf Vorschläge entfällt bewusst (David). Tastatur/Combobox + Header-Schliessen intakt.
- **E2E entrottet + deterministisch:** a11y-Prüfpunkte pinnen das Theme (hell +
  Reader zusätzlich dunkel) statt zeitabhängig (zeitThema) zu flippen; 5 veraltete
  Funktions-/Locator-Tests auf reale UI nachgezogen (Reiter-Übersicht-Dialog, Ebene-
  Segment, eingeklappte Bund-Systematik, massgebliche-Fassung `.first()`, searchbox→
  combobox). **Ursache der Verrottung:** Suite lief nie im `check`-Gate → jetzt
  `npm run test:e2e` ins **deploy-check §1** verdrahtet.
- **Bug-Check:** volles Gate grün (tsc · eslint 0 · vitest 2601 · golden byte-gleich
  · check · build) + **E2E 71 passed** (beide Theme-Modi) + adversarialer Review
  (keine Regression, §1/§3 unberührt — nur Farbklassen/ARIA/Tests/Doku).

## Session 26.6.2026 — UI-Politur: A11y-Restpunkte (Combobox/Stretched-Link/Tab-Panels; deployt)

Nachzug zum Audit (David: «mach weiter bis alles fertig ist das du machen kannst»).
Branch `fix/ui-politur-2026-06-26`. 6 technisch ohne Davids Fachzeit machbare Punkte:
- HeaderSuche: Combobox-Parität zum Hero (Pfeil/Enter, role=combobox + ARIA, geteilte suchOptionId).
- EntscheidKarte/-Zeile: **Stretched-Link** (Norm-Chips nicht mehr fokussierbare <a>-Nachkommen; valides Markup, Fläche klickbar).
- SuchResultate role=group · UniversalSuche aria-controls-Guard · Gesetze Ebene-Tabs id+aria-controls+role=tabpanel · AllgemeineFristForm Längenfeld bleibt leer statt «0».
- Tore grün (tsc · eslint 0 · vitest 2601 · golden byte-gleich · build). **E2E gegen Baseline (1ea399c2) verglichen: KEINE neue Regression** (16 passed / 11 failed identisch).
- **BEFUND offen (nicht in diesem Batch behoben):** Die E2E-Suite (Playwright, NICHT im `check`-Gate) ist an der Baseline **rot — 11 Fehler** (7 axe-A11y u.a. `nested-interactive` Listbox-Option-Links + `color-contrast` brass-700; 4 funktionale/Inhalts-Asserts). Teils Davids dokumentierte Design-Entscheide (brass-700-Kontrast), teils Listbox-vs-Link-Designfrage → bewusst NICHT autonom gefixt. **Empfehlung: E2E ins Gate aufnehmen + eigener A11y-Durchgang.**

## Session 26.6.2026 — UI Bug- & Logik-Audit, 43 Fixes (Multi-Agent, gegengeprüft; deployt)

Auftrag David (ultracode): UI komplettem Bug-/Logik-Check unterziehen, Handlungsplan
vorbereiten, dann fixen + checken + deployen. §12-isoliert (Branch
`fix/ui-bugcheck-2026-06-26`, Worktree), da paralleler Agent auf `main` lief.
- **Audit (read-only):** 8 Bereichs-Finder über `src/components`+`src/pages`+`src/App`,
  jeder Befund einzeln adversarial gegengeprüft → **52 Befunde, 44 real** (0 Blocker,
  4 Major, 24 Minor, 16 Nit), 8 false-positive verworfen. Plan im Scratchpad.
- **Umgesetzt: 43/44.** #15 (Tausender-Gruppierung nur in Zahlenspalten) bewusst
  **revertiert**, weil er getestetes Streitwert-Verhalten brach (§6.3 — Tests nicht
  anpassen). #22 Theme auf David-treue Variante umgesetzt: zeitbasierter Default
  (Auftrag 19.6.) BEWAHRT, nur Pristine-Label ehrlich «Tageszeit» statt «System» (§8).
- **Neu:** geteilter Hook `useDialogFokus` (Fokus-Falle + Escape + Fokus-Rückgabe, baut
  auf bestehendem `naechsterFokus` auf) für Shell-Schublade, Reiter-Flyout, mobilen
  Gesetze-Drawer; `suchOptionId` ausgelagert (react-refresh).
- **Major-Fixes:** Fussnoten-Popover via Portal aus `overflow-x-clip` gelöst; Kontakt
  zeigt keine Fehler auf leerem Formular (§13/4); Rechtsprechung-Zähler «Alle» = Summe
  der Kacheln (Verweis-Ausnahme konsistent, auch Filter-Dropdowns); Shell-Schublade
  Fokus-Falle.
- **Bug-Check:** Gate voll grün (tsc · eslint 0 · vitest 2601 · golden byte-gleich ·
  check:* · build 56 Routen + 1776 Detailseiten 0 übersprungen) + **2 adversariale
  Reviewer** (Logik/Regression + React-19/A11y): keine Regression, §1 unberührt.
- **Offen (Nits, bewusst zurückgestellt):** NormChip strikt spec-clean (Stretched-Link
  in EntscheidKarte/-Zeile), Gesetze-Ebene-Tabs `aria-controls`, HeaderSuche-Combobox-
  Pfeilnav. Modell: alle Sub-Agenten Opus.

## Session 26.6.2026 — Gesetze-UX Batch 2 (Reiter ins Header, Fedlex-Feinschliff; ultracode)

Auftrag David (ultracode: Investigation → 4 parallele Impl-Agenten → ultracode-
Einheitlichkeits-/Verweis-Prüfung). 11 Punkte A–K, §12-isoliert auf
`feat/gesetze-ux-batch2`.
- **A/B** Horizontalen Reiter-Streifen aufgelöst; Reiter-Übersicht wandert als
  Flyout in die **Topbar** (`ReiterUebersicht.tsx`, nutzt `TabPanel`); `TabStreifen.tsx`
  gelöscht, `--tabstreifen-h` (tot) → konstante `4rem`. Tab-Funktion bleibt.
- **C** Bug: aktueller Artikel wurde bei **kantonalen** Gesetzen (ohne Gliederung)
  nicht verfolgt — Observer-Tor liess `ohneGliederung`-only-Erlasse aus → gefixt
  (Tor + Deps), Reiter-Live-Label läuft jetzt auch kantonal.
- **D** Bund-Einklappen verifiziert (Toggles intakt, Fliesstext default offen,
  TOC-Klick öffnet Pfad); stale Kommentare berichtigt. Die 9 gliederungslosen
  Bund-Erlasse bleiben ehrlich flach (§8).
- **E** Gliederungs-/Randtitel **grösser + nach Ebene abgestuft** (Fedlex: marg
  Sachüberschrift `text-base` semibold, SektionKopf `text-h2/h3/body-l/base`).
- **F** Drag&Drop + ▲▼-Tastatur-Umsortieren in der Übersicht (`ordneTabsUm`,
  Same-Group-Guard `gleicheReiterGruppe` in `tabGruppen.ts`).
- **G** Erneutes Öffnen eines offenen Gesetzes über `/gesetze` → neue Instanz
  (`?r`); Hook `useErlassOeffnen.ts`, Link/Mittelklick/Copy erhalten.
- **H** Absatz-Marker `2bis`/`2ter` verschieben den Text nicht mehr (feste
  Rinnen-Box `inline-block w-9`). **I** Marken-Nummern kleiner (`text-body-s`).
  **J** «Rauspoppen» pro Element wieder da — vertikaler Lift `-translate-y-0.5`
  (kein Clipping/Rahmen, P6/P7 gewahrt; nur zk-Zweig → Popover golden).
- **K** Gliederung klappt beim Scrollen automatisch auf UND beim Verlassen wieder
  zu — aber NUR auto-geöffnete Zweige; manuell geöffnete bleiben offen
  (`autoOffenRef`/`manuellOffenRef`).
- **Such-Bug** aus Batch 1 bleibt gefixt.
- **Aufräumen**: `istLesbar` als SSoT (§5, pdf-embed führt überall in den
  In-App-Reader), `istErlassOffen` encoding-robust, fedlex-Suffix `sexies` +
  Key-RegExp escaped, International-Intro präzisiert (§8).
- **Bug-Check**: zwei ultracode-Reviews (Impl-Investigation + Einheitlichkeits-/
  Verweis-Prüfung: keine Blocker/Major — alle Bund-Gesetze einheitlicher
  Render-Pfad, alle Verweise korrekt). Gate voll grün, build 56 Routen + 1449
  Erlass-Seiten (0 übersprungen), 9 E2E grün + neue Unit-Tests
  (`tabPanelDnd`, `useErlassOeffnen`, ArtikelBody H/I/J).

## Session 26.6.2026 — Gesetze-UX 9 Punkte (Reiter-Panel, Fedlex-Render, Scroll-Spy; deployt)

Auftrag David (ultracode-Handlungsplan zuerst, dann «go»): 9 Punkte in der
Gesetze-Lesesicht. Plan in `FAHRPLAN-GESETZE-UX-9PUNKTE.md` (Abschnitt 0 =
Davids Entscheide). §12-isoliert auf Branch `feat/gesetze-ux-9punkte`.
- **P1 Duplikate** (dasselbe Gesetz mehrfach offen): war via `?r`-Diskriminator
  in `lib/tabs.ts` bereits gebaut → nur verifiziert (Tab-Umschaltung, kein Split-View).
- **P2 + P9 geteilter «aktueller-Artikel»-Observer** (`lib/normtext/aktuellerArtikel.ts`,
  rein/getestet): EIN IntersectionObserver (Mittel-Band) ersetzt den alten Section-
  Scroll-Spy → speist Reiter-Live-Label «Kürzel – Art. X» (P2) UND TOC-Markierung +
  Mitscrollen (Dep-Fix `[aktivIds,tocBaum]`) + **expand-only**-Aufklappen (P9, kein
  Flackern). Toter `aktivIdRef` entfernt.
- **P3 vertikales Reiter-Panel** (`components/layout/TabPanel.tsx`): «Alle Reiter»-
  Trigger im TabStreifen öffnet gruppierte Liste — Top-Gruppen (Gesetze/Rechtsprechung/
  Vorlagen/Rechner), Gesetze nach Herkunft Bund→Kanton→International, dreispaltig
  (Herkunft-Icon · Name · Artikel). Geteilte Helfer `lib/tabGruppen.ts`
  (`reiterKategorie`/`herkunftVon`/`artikelLabelVonPfad`, SSoT §5 — TabStreifen nutzt
  sie jetzt mit), `HerkunftIcon` (Schweizerkreuz `public/wappen/CH.svg`, Welt-SVG,
  Kantonswappen).
- **P4 Fedlex-Reihenfolge**: Gliederung/Randtitel stehen im `GesetzLeser` jetzt ÜBER
  der Artikelnummer (vorher darunter), auch bei eingeklapptem Artikel sichtbar.
- **P5/P6/P7** (`components/normtext/ArtikelBody.tsx`, nur `zk`-Zweig → Popover golden):
  Block-Hover-Scale + `-mx-2` raus (nur das angewählte Item poppt, kein Clipping),
  Item-Rahmen (`hover:ring/shadow`) raus, dezenter bg-Hover bleibt.
- **P8**: Zitat/Link-Knöpfe inline in die Art.-Nr-Zeile (`ml-auto`), Abstand
  `mb-2.5→mb-1.5`.
- **Such-Bug (David, Live-Review)**: beim Aktivieren der Suche nach oben scrollen,
  sonst rutschte der sticky-Container (Suchleiste + Gliederung) mit der geschrumpften
  Trefferliste aus dem Bild (Restore beim Leeren bestand schon).
- **Bug-Check**: Gate voll grün (tsc · alle Tests · golden 187 byte-gleich · lint ·
  check), build prerendert alle 56 Routen + 1449 Erlass-Seiten (0 übersprungen),
  adversarialer Opus-Review (keine Blocker/Major), 7 neue E2E + neue Unit-Tests
  (`aktuellerArtikel`, `tabGruppen`, ArtikelBody-Hover). Regelmässig aufgeräumt.

## Session 26.6.2026 — Leitentscheid≠Urteil-Darstellung + getrennte Übersicht + Abdeckung (deployt)

Auftrag David (Folge-Schärfung): Leitentscheid anders darstellen als das vollständige
Urteil; mehr BGE umschaltbar; Übersicht trennt beide. Geplant + 2× adversarialer
Bug-Check (ultracode), integriert implementiert.
- **Abdeckung:** aza-Extraktion mehrsprachig (vom|du|del) + verbundene Verfahren (erstes Az.)
  + sprachunabhängiger Abruf → Volltext-Rate **90→97 %** (fr/it/verbundene BGE jetzt umschaltbar).
- **Detail-Ansicht-Weiche:** Leitentscheid (Regeste-forward, «massgebliche Fassung»→BGE) vs.
  Vollständiges Urteil (Rubrum/Gegenstand/Parteien, keine Regeste, →Urteil). Default folgt
  Klick-Herkunft via `?ansicht=voll`-Deep-Link. Sticky-Fix (Tabs+Sprungleiste ein Block).
- **Übersicht:** getrennte Einträge Leitentscheid (BGE-Nr) + vollständiges Urteil (aza-Nr) via
  Verweis-Manifest (datei:null, Deep-Link, keine Doppelzählung); dritte Sektion.
- **Datenkontrakt** `azaUrteil.quelleUrl` (Generator + gate-Tor). Bug-Check-Fixes:
  massgeblichFehlt nur BGE; Sachverhalt ohne leere Marker-Blöcke; Gate Verweis-Invarianten.
- Korpus 588 Manifest (272 BGE + 261 Volltext-Verweise + 55 routine), 22 MB. Abnahme David: offen.

## Session 26.6.2026 — Echte Leitentscheide (amtliche BGE) + Volltext-Umschalter (deployt)

Auftrag David: «Leitentscheid» soll nur heissen, was das Bundesgericht amtlich
publiziert (BGE), mit eigener harmonisierter Darstellung; zudem von jedem
Leitentscheid zwischen amtlichem Auszug und ganzem Urteil umschaltbar. Geplant per
ultracode-Workflow, autonom umgesetzt im Worktree `leitentscheide` ab `004d7b74`.
- **§8-Befund:** der deployte 610er-Korpus etikettierte ~96 % falsch als Leitentscheid
  (ODER-Glied `!!regeste`). Neu: `leitcharakter ⟺ amtlicher BGE`, bikonditional gate-verriegelt.
- **Daten:** neue bge-Pipeline (`enumeriereBge`/`holeBgeLeitentscheid`, A2-Merge): BGE-
  Identität + amtliche Regeste + aza-Volltext-Cross-Fetch (R8-Confidence-Quarantäne).
  Korpus 610→**327** (272 amtliche BGE, 243 mit Volltext, + 55 routine), 19.5 MB.
- **Umschalter:** `auszugAbschnitte` (Sammlungstext) neben `abschnitte` (Volltext);
  bestehende `Tabs`-Komponente «Vollständiges Urteil» ⟷ «Amtlicher BGE-Auszug» (E2E belegt).
- **Zwei adversariale Bug-Checks** (je 11–15 Agenten) fanden + fixten: kritischer März-
  Regex (`\w`→`\S`, Volltext 75→89 %), aza-Kollision (OCL-Quirk 152 V 2/20) → Quarantäne,
  Inversion (151 III 336) → verworfen, Bandjahr-Sentinel, Lesemodus-Desync. Gate-Backstops:
  aza-Kollision=Fehler, Inversion=Warnung. `BUDGET_MB` 20→35 (zwei Texte/BGE, fliessend).
- **OFFEN:** juristische Einzelabnahme (David, Zeitsperre); Korpus-Ausweitung BGE <2024 möglich.

## Session 26.6.2026 — BGer-Korpus-Ausbau 370→610 (Parallel-Session, deployt)

Auftrag David: «zwischenzeitlich mehr Leitentscheide des Bundesgerichts scrapen»
(während die UX-Session lief). §12-isoliert im Worktree
`rechtsprechung-ausbau` ab `197bb37e`, nach Abschluss der UX-Session per FF in main.
- **Generator-Rebuild (§7)** Court `bger` Citation-Graph: **610 Entscheide** =
  580 Bund (**+240 Leitentscheide**) + 30 kantonal (gr/be/zh/sg/ag je 6 = Superset
  gegen main, keine kantonale Löschung). `npm run entscheide -- --limit=580
  --courts=… --kanton-pro=6`.
- **`BUDGET_MB=20` ist der echte «sinnvoll»-Deckel** (nicht die Quelle): 1500 = 42.9 MB
  rissen das Tor → bewusst auf 18.93 MB / 610 begrenzt, Deckel NICHT eigenmächtig
  angehoben.
- **Bug-Check grün:** gate (tsc/vitest/lint), `check:entscheide` (610, 18.93 MB,
  5 nicht-fatale Warnungen), build prerendert **alle 610 Entscheid-Seiten, 0 übersprungen**;
  kein App-Code mit hartcodierten Korpus-IDs.
- §11-Doku `bibliothek/rechtsprechung/bger-korpus-ausbau-2026-06-26.md` + INDEX.
- **OFFEN (David/Integrator):** amtliche BGE (`bge`, echte Regesten) vs. Zitiergraph-BGer
  (`bger`, aktuell) vs. beides — Diskrepanz zur Stufe-1-Doku festgehalten.

## Session 26.6.2026 — UX-Punkteliste (20 Anweisungen David, autonom in Batches, deployt)

Auftrag David: 20 mündliche UX-/Darstellungs-Anweisungen → Handlungsplan
(`FAHRPLAN-UX-PUNKTELISTE.md`) → autonom in Batches umsetzen, pro Schritt
Bug-Check, nach jedem Batch deployen, am Ende voller adversarialer Durchgang.
Eigener Worktree `feat/ux-punkteliste` ab `197bb37e`. **16/20 live + D-Teil + 2 Pläne.**
- **Batch A (Quick-Wins):** `/gesetze?ebene=kanton` zeigte keine Kantone (Bund-only
  `gefiltert` → eigene `kantGefiltert`); Sidebar-Hash-Bug (Zivilprozess leuchtete
  bei #straf/#schkg mit → `istAktiv` hash-loses Ziel nur bei leerem `loc.hash`);
  Fristen-Kalender breiter; «Berechnung statt KI»-Badge weg; «blauer Kreis» =
  UA-Tap/Maus-Fokus (kein Blau-Token) → `-webkit-tap-highlight-color:transparent`
  + `:focus:not(:focus-visible)` (Tastatur-Fokus brass bleibt); Betreibungs-Grid
  `items-start`.
- **Batch B (Tabs):** Limit 8→50; **dasselbe Gesetz mehrfach** (Instanz-`?r=`,
  `⧉ In neuem Reiter`-Knopf, `naechsteInstanz`/`aktualisiereTabArtikel`); Streifen
  ab dem ERSTEN Reiter (Guard `<1`; Prerender bleibt leer, createRoot=keine
  Hydration); Label «Kürzel – Art. X» NUR bei Doppelinstanz; Typ-Piktogramme
  § ⚖ ✎ ∑. Tab-Klick scrollt zum gemerkten Artikel.
- **Batch C (Reader):** Marginalien/Sachüberschrift IMMER OBERHALB der Absätze
  (Fedlex-Stil, xl-Randspalte raus), Lesespalte 52rem; aufgehobene Artikel dezent
  + eingeklappt/aufklappbar (`artikelGanzAufgehoben`→darstellung.ts §5); Suche
  leeren hält Scrollposition, Treffer-Klick springt in Volltext + löscht Suche;
  Gliederung/Suchfeld bündig an Header+`--tabstreifen-h` (Magic-Number raus).
- **Batch E (ultracode):** Rubrik «Einstellungen» (/einstellungen). Inventar+Design
  via 7-Agenten-Workflow. Store `lib/einstellungen.ts` hält nur heimatlose Felder;
  Theme/Stil/Dichte/Lesegrösse gebrückt (§5, kein Mega-Store). Standard-Kanton in
  16 Formularen verdrahtet (Permalink/Wahl gewinnt, Default 'ZH' → golden
  byte-gleich); Profil Name/Adresse → Prefill der Absender-Felder (VorlagenSeite,
  leere Felder); Theme hell/dunkel/**auto** (prefers-color-scheme live); Detailgrad/
  Schriftbild-Defaults; Gesamt-Reset (alle Keys + Tages-Präfixe).
- **D (Teil):** internationale Volltext-Staatsverträge nicht mehr «Bundesgesetz»/
  «Bund» (→ «International»/Gebiets-Label). OFFEN: Anhänge/Schlussklauseln nicht im
  Snapshot (Extraktor-Daten-Schritt).
- **F (Plan):** `FAHRPLAN-KANTONALE-ENTSCHEIDE.md` (2 Web-Agenten): entscheidsuche.ch
  als Open-Data-Hebel, Vendor-Cluster (Tribuna/Findinfo/DECIS) → ein Adapter je
  Vendor; PDF-embed-Fallback; Phasen P0–P4.
- **C5 OFFEN (geflaggt):** Erlass-Ingress («Die Bundesversammlung … beschliesst:»)
  steckt NICHT im Snapshot → braucht Fedlex-Extraktor-Erweiterung + Netz-
  Regenerierung der ~200 Bund-Snapshots unter §7 (Currency-Arbiter/SHA/Drift/
  Golden) — bewusst NICHT im Marathon überstürzt, eigener Daten-Lauf.
- **Bug-Check:** pro Batch Gate + Playwright-Verifikation; am Ende **Gate voll grün**
  (tsc · vitest 2560 · golden byte-gleich · lint · check). Tests deklariert
  angepasst (Badge weg, MAX 50, Tab-Guard, Nav-Meta).

## Session 26.6.2026 — WCAG-2.2-Target-Size + UI-Einheitlichkeits-Audit (in `main`, deployt)

Auftrag David: Target-Size-Chips vergrössern → ganze UI auf Einheitlichkeit gegen die Design-Reglemente testen + Befunde umsetzen → Bug/Logik-Check von allem Geänderten → Deploy → Session schliessen.
- **WCAG 2.2 Target-Size (2.5.8):** `lc-chip` `min-height:24px` (→ alle Chips; **836** Norm-Kürzel-Chip-Verstösse in der Rechtsprechungs-Liste → **0**) + EntscheidLeser-Schriftbuttons A−/A+ `py-1`+`min-h-6` (≥24px). Lese-Passus-Zeilen (Lesefluss) bewusst belassen. Liste dadurch etwas weniger dicht (von David gewählt).
- **UI-Einheitlichkeits-Audit (3 Opus-Agenten gegen DESIGN-REGLEMENT.md):** harte Regeln sauber (keine rohen Farben/Default-Status/No-op-Klassen; Typo-Skala diszipliniert). Umgesetzt — sichere/bounded Fixes: F7 Inline-Style→Token (KuendigungTimeline/VerzugszinsTimeline/Shell, pixel-identisch), `lc-overline` statt einmaligem `text-overline`+arbitrary tracking (GesetzLeser «Verweise»), Status-Marker «ungeprüft»+Sprachtag in EntscheidZeile → `lc-badge lc-badge-soft` (§8/D3-Konsistenz). **Verifiziert FALSCH & verworfen:** `bg-black/50`→`bg-ink-900/50` (Dark-Scrim-Regression).
- **Bug-/Logik-Check (2 adversariale Opus-Reviews über `d8d78d1c..HEAD`):** **0 Logik-Bugs, 0 Regressionen** (live Desktop+Mobil+Print+Deep-Link). Härtung: `massgebendeErlasse` `encodeURIComponent` (Konsistenz). Deep-Link-Frisch-Laden mit content-visibility verifiziert (`#art-700` korrekt).
- Gate voll grün, golden byte-gleich, a11y 13/13.
- **BACKLOG (breitflächige Neu-Abstraktionen, brauchen visuelle QA pro Stelle, bewusst nicht am Marathon-Ende gerammt):** SelectionGrid-Adoption (~10 Formulare), `lc-segment`-Komponente (~6 Umschalter), Akkordeon-Kopf-Komponente (~5), `leading-reading`-Token + `--rsp-fs`-Fallback-Vereinheitlichung, `Card`-Inline→`<Card>` (3); breiter WCAG-2.2-Target-Size-Audit (axe-Tags auf 2.2 erweitern).

## Session 26.6.2026 — SEO/A11y Welle-1/2-Block: Kontrast, axe-Ausbau, Norm-Rückverlinkung, Tabellen-Semantik, Perf (in `main`, deployt)

Fortsetzung „mach alles / los", David-Entscheide: W3.6 delegiert, W2.1 kompakter Block ok, og:image nein, Tabellen nur pixel-identisch, alles inkl. Perf, **ein** Sammel-Deploy. Eigener Worktree, pro Einheit committet, ein Gate+Deploy am Schluss.
- **W3.6 Kontrast (delegiert):** `text-ink-400`→`text-ink-500` an 78 Stellen/22 Dateien. ink-400 fiel als Text in BEIDEN Modi unter AA (Light ~3.2:1, Dark 3.43:1) → ink-500 (Light ~4.7, Dark ~5.2). Per axe in hell+dunkel auf **color-contrast=0** verifiziert. `--ink-400`-Token bleibt (dekorativer Summary-Pfeil).
- **W1.7 axe-Tor 9→13** (Bund-Reader/Rechtsprechung/International). `color-contrast` aus allen BEKANNTE_BEFUNDE entfernt (W3.6 fixte → Tor strenger). **Realer Bug gefixt:** scrollbare Mehrspalten-Tabelle nicht tastaturfokussierbar (WCAG 2.1.1) → `tabIndex`/role/label.
- **W2.1 Norm-Rückverlinkung:** kompakter «Massgebende Gesetze»-Chip-Block auf `/rechner`+`/vorlagen` (`MassgebendeGesetze` + `massgebendeErlasse` invers, nur snapshot = kein toter Link, §8) → interner Link-Juice auf die Detailseiten; prerendert.
- **W2.2 Tabellen-Semantik:** ARIA-Rollen (table/row/columnheader/cell) auf die `display:table`-Spans (MehrspaltigeTabelle = 83 reale Tarif-Tabellen + TarifTabelle). **Pixel-neutral** (echtes `<table>` im Phrasing-/`<p>`-Kontext unmöglich → ARIA-Weg; deine „nur pixel-identisch"-Vorgabe erfüllt).
- **W2.6 Touch:** Favoriten-Button 20→24px (WCAG 2.5.8). (Breiter 2.2-Target-Audit separat — axe-Tags decken 2.5.8 noch nicht.)
- **W2.8 Perf (verhaltensneutral):** `content-visibility:auto`+`contain-intrinsic-size:auto 320px` pro Reader-Artikel (`.nt-art-cv`). Off-screen-Artikel überspringen Layout/Paint (LCP/INP-Gewinn OR/ZGB ~1099 Art.). **Verifiziert:** 1603 Artikel im DOM, Anker-Sprung #art-700 rendert+scrollt korrekt. KEIN JSON-Split (Suche/Anker/SR/Crawler unberührt, §6.4).
- **W2.4 Rest:** `<html lang="de-CH">` (war schon im vorigen Block).
- **W2.3 Tastatur-e2e +3** (Skip-Link, «/»-Suche, Karten-Kanton via Enter). 5/5 grün.
- Gate voll grün, golden byte-gleich. **OFFEN:** W2.5 Screenreader-Baseline (manuell VoiceOver/NVDA), breiter WCAG-2.2-Target-Size-Audit, W1.12 Search Console (Domain-abhängig).

## Session 25.6.2026 — W2.4 lang-Attribut (`de-CH`) (in `main`, deployt)

`<html lang="de">` → `<html lang="de-CH">` (WCAG 3.1.1, korrektes Schweizer-Hochdeutsch-Tag; alle prerenderten Detailseiten erben es via Template). Gate grün, golden byte-gleich.
- **OFFEN W2.4-Rest:** per-Element `lang` für fr/it-Zitate (braucht Reader- + Prerender-Sprachmarkierung, geringerer ROI).
- **W2.1 (Rück-Verlinkung Rechner→Norm-Detailseiten) bewusst NICHT gemacht:** saubere Platzierung wäre die einzelnen Rechner-Seiten (Übersicht ist dichtes Karten-Raster, §13 Dichte) — echte UI-Platzierungs-Entscheidung + breite Fläche + visuelle Abnahme, David vorgelegt statt am Session-Ende durchgedrückt.

## Session 25.6.2026 — SEO/A11y Welle-1-Batch: Karten-Fokus, Twitter-Meta, Cache-Header (in `main`, deployt)

Fortsetzung „mach alles" nach W1.1 — drei autonome Welle-1-Punkte in einem Worktree/Gate/Deploy:
- **W1.6 (WCAG 2.4.7 / §13 F3):** `SchweizKarte`-Pfade trugen `outline-none` → Tastaturfokus unsichtbar. Klasse entfernt → site-globaler `:focus-visible` (2px brass, ≥3:1) greift; Outline-Rendering auf dem SVG-`<path>` per Playwright hell+dunkel verifiziert (`auto 5px`/solid 2px). Keine Rechtslogik (§1 nicht berührt).
- **W1.10:** Twitter-Card-Meta (`summary` + title/description) in `index.html`; `rendereTemplate` spiegelt title/description per-Page → Startseite + alle Detailseiten. og:image bewusst offen (braucht 1200×630-Asset = Design).
- **W1.9:** `Cache-Control: public, max-age=3600, must-revalidate` für `/normtext/*` + neu `/rechtsprechung/*` (konservativ, bounded staleness; massgeblich bleibt via Live-Link + Drift-Tor die amtliche Quelle, §7/§8).
- Gate voll grün, golden byte-gleich.
- **OFFEN:** W1.7 axe-Tor-Ausbau (Test-Infra, eigener Pass), og:image-Asset; **W1.12 Search Console zurückgestellt** — `lexmetrik.vercel.app` ist temporär (David zahlt nicht dafür, Domain-Wechsel geplant); GSC erst bei echter Domain (Wechsel = nur `SITE_URL` in `seo.ts` ändern, W3.4).

## Session 25.6.2026 — SEO W1.1: Detailseiten prerendern (1819 indexierbare URLs, in `main`, deployt)

Auftrag David: `FAHRPLAN-SEO-A11Y-GOVERNANCE.md` umsetzen, „so viel wie möglich, run till dry". W1.1 (grösster Hebel): `/gesetze/:ebene/:key` + `/rechtsprechung/:key` lieferten bisher die noindex-SPA-Hülle (`app.html`) — der ganze Volltext-Korpus war für Suchmaschinen unsichtbar (nur 56 Katalog-URLs in der Sitemap). Vorgehen: eigener Worktree (§12), TDD, voller Gate + ultracode-Code-Review (37 Agenten) vor Deploy.
- **Build-Prerender erzeugt statisches Volltext-HTML** für 1449 Snapshot-Erlasse (218 Bund + 1231 Kanton) + 370 Entscheide = **1819 Detailseiten** (Sitemap-Index **1875 URLs**, vorher 56). Inhalt WÖRTLICH aus den on-disk-Snapshots (§7, gleiche Quelle wie der Reader); Meta/JSON-LD (`Legislation`+SR / `BreadcrumbList`) nur aus Strukturfeldern, KEINE Geltungsaussage (`legislationLegalForce` ausgelassen — snapshot≠in Kraft, TODO David). React ersetzt clientseitig (`createRoot` render-then-replace, kein hydrate) → Live-Reader unberührt; `vercel.json` unverändert (Vercel serviert die statische Datei vor dem `/(.*)→/app`-Rewrite).
- **Neu `src/lib/seo-detail.ts`** (rein, SSR-/build-safe: Pfad/Meta/JSON-LD/Volltext-HTML + Substanz-Prädikate + Key-Safety) + 26 Tests; `scripts/prerender.ts` Detail-Phase; `sitemap.xml` ist jetzt ein **Index** (3 Teil-Sitemaps, skaliert).
- **Kanton-Keys mit Leerzeichen** (165): Datei am ROHEN Key, URL prozentkodiert (`%20`) — Prod-Parität (sirv/Vercel decodiert beim Filesystem-Match) per `vite preview`+curl verifiziert.
- **Review-Fixes (37 Agenten):** absoluter Manifest-Floor (fängt stilles Schrumpfen, das der relative Count allein nicht sieht) · Substanz-Check **skip-statt-build-halt** bei thin content (§8) · Key-Safety-Guard · Dedup-Set distinkter Zielpfade · `GEBIET_LABEL`-Fallback · `ABSCHNITT_TITEL`/`esc` entdoppelt (§5). **Gate voll grün, golden byte-gleich.** Build 10s, dist +23M.
- **OFFEN (Fahrplan):** W1.2 per-Dokument-Meta-Feinschliff, W1.3 weitere JSON-LD-Typen, W1.9 Cache-Header `/normtext`+`/rechtsprechung`, W1.10 Twitter/og:image, A11y-Strang, W1.12 Search-Console-Setup.

## Session 25.6.2026 — Legal-Design: site-weites Dach-Reglement + Token-Disziplin maschinell erzwungen (in `main`, deployt)

Auftrag David: Legal-Design recherchieren → Erkenntnisse als **site-weite Design-Regeln** ins Projekt; danach „1–5 machen" (die 5 offenen Audit-Punkte). Vorgehen: doppelt-verifizierte Deep-Research (22 Quellen, 25/25 Claims bestätigt; Hagan/Stanford, MIT-TedLab, WorldCC) → Regeln abgeleitet; pro Schritt Bug-Check (`gate:schnell`), §12-konform (Pathspec, Parallel-Session lief auf main).
- **Dach-Reglement `DESIGN-REGLEMENT.md` + `CLAUDE.md §13`** (`1a4fc6ce`): site-weite Regeln in 5 Blöcken (A Sprache · B Darstellung · C UX · D Vertrauen · E Governance), an bestehende Tokens gebunden, ehrlicher CH-Evidenz-Vorbehalt; steht über den 3 Domänen-Reglementen. Enthält Code-Audit (erfüllt/teilweise/offen je Regel).
- **#2/#4 Off-Scale-Typo → Tokens** (`c7aa3e5d`, **byte-identisch**): rohe `text-[…rem]`-Literale in Lesern (GesetzLeser/EntscheidLeser/EntscheidBody) + UI-Chrome (Topbar/Sidebar/Shell/TabStreifen/ThemaUmschalter) auf zentrale `--fs-*`-Tokens (`index.css`, genutzt via `text-[length:var(--fs-*)]`); `text-sm`→`text-body-s`; `#3` `fontSize:'10px'`→`text-micro`. Golden durchgehend byte-gleich.
- **#1 Token-Schranke** (`7f9f0319`, E1): `scripts/check-design-tokens.ts` verbietet `text-sm/lg/xl…` + rohe `text-[…px|rem]` (erlaubt Skala/`var`/`em`), in `npm run check`→gate. Regex gegen 13 Fälle gegengeprüft.
- **#5 D1 — verifiziert, bereits erfüllt (§7, keine Änderung):** `TarifQuelle` (prozesskosten/grundbuchgebuehren) trägt `stand`+`quelleUrl` **typ-erzwungen**; Audit-Heuristik (norm 750× vs stand 51×) war by-design (norm-Zitate = NormLinks mit eigener Provenienz). Provenienz erfinden wäre §7-Verstoss.
- **Fremder Lint-Rot auf main behoben:** `backfill-legal-area.ts:96-97` (Parallel-Session `d5622250`) nutzte Ternary-als-Statement (`no-unused-expressions`) → if/else, verhaltensneutral. **Gate voll grün** (tsc·vitest·golden·lint·check).
- **Folge-Auftrag David «mach 3 richtig» — Fein-Typo verdichtet** (`0faec0c8`): die 12 `--fs-*`-Sonderwerte vollständig auf die bestehende Skala aufgelöst (body-l/base/h3/body-s/xs/micro/overline) — keine Sondertokens mehr, voll scale-bound, saubere absteigende Hierarchie. **Doppelt verifiziert**: Playwright Vorher/Nachher (ZGB-/Entscheid-Leser, Wortmarke) selbst gesichtet + unabhängiger Doppel-Check-Agent (fand+fixte 1 Regression: Verweise-Label uppercase/semibold). golden byte-gleich, gate voll grün.
- **UI-Design-Recherche + Block F + Struktur-Audit (ultracode) + P0/P1 umgesetzt + deployt:** zweite Deep-Research (UI-Design, `docs/recherche-ui-design-2026-06-25.md`) → `DESIGN-REGLEMENT.md` **Block F** + CLAUDE.md §13.7 (`906f6df6`). ultracode-Struktur-Audit (41 Agenten) → **P0** Hygiene (`4c6ff590`: lc-glass/lc-badge-massgeblich/tote Aliase) + **P1** (`803a9467`, **deployt**): brass-300-Config-Lücke gefixt (~25 stille No-op-Utilities erscheinen jetzt) + WCAG-Kontrast/Fokus (brass-700, ≥4.4:1) + Dark-Mode-Parität (Timeline-Label/SchweizKarte/Status-Linien) + Placeholder/Overline/LiveSuche/forced-colors + dark theme-color. Hell+Dunkel per Playwright selbst verifiziert. **F7 maschinell erzwungen**: `check:design-tokens` prüft jetzt auch, dass jede Farb-Utility in `tailwind.config.js` existiert (fängt die brass-50/300-No-op-Klasse). **Bewusst weggelassen** (zu heikel/geringer ROI): `/60`-Alpha-Modifier auf bare-`var()`-Farbtokens (projektweit still, bräuchte Token-Schema-Umbau auf `<alpha-value>`-Kanäle) → offener Folge-Punkt.

## Session 25.6.2026 — Ultracode-Gesamt-Bug-Check (88 Agenten) + alle 22 bestätigten Befunde gefixt (in `main`)

Auftrag David: fundierter Bug-Check über den GESAMTEN Code mit ultracode, „so viel wie möglich abdecken mit Prioritäten". Vorgehen: eingefrorener Worktree @`86197d9` (§12, Parallel-Agent lief auf main), 14 §-priorisierte Finder-Linsen (loop-until-dry, Opus) → 29 Rohbefunde → adversariale Verifikation (refute-by-default) → **22 bestätigt, 1 unsicher, 6 widerlegt**. Danach alle 22 gefixt (7 Commits `e0c4d1c`..`1026359`), **Gate voll grün, Golden durchgehend byte-identisch** (kein Re-Baseline nötig).
- **Echter Rechtswert-Fehler (A5-1, §1/§7):** Art. 472 ZGB nF (Pflichtteilsverlust bei hängiger Scheidung) griff ohne `rechtsstand`-Guard auch auf altrechtliche Todesfälle (≤31.12.2022) → Ehegatten-Pflichtteil zu Unrecht 0. Guard + ehrlicher Alt-Fall-Hinweis + fassungsabhängige Anker 470/471 (A5-2). Regressionstest.
- **A4 Beurkundung:** LU fehlte im `FREIES_NOTARIAT` → MwSt 8,1% fiel für ganz LU still weg (verifiziert: `notariate.ts`+Bibliothek = freies Notariat); Emissionsabgabe-Hinweis Freibetrag statt „ganzer Betrag"; Satz+Freibetrag in **eine** §5-Quelle `src/lib/emissionsabgabe.ts` (beide Engines behalten ihren Null-/Rundungs-Vertrag).
- **§3-Lecks/§5-Dedup:** Probezeit-/BGG-/Schlichtungs-Schwellen + Normanker aus der Engine statt 2. Kopie in Pages (D-1/D-5/D-7); UTC-Datum-Default → lokal (E2-1); Direkt-Download-Gate in 3 Familienmasken (B1-1); toter Nav-Anker, Float-Quote, Doku-Frist-Beispiele, Nits.
- **Normtext-Pipeline C1 (Logik gefixt):** verschachtelte `<dl>` balanciert + Fussnoten-Ebene (bis/ter) korrekt; `pdfLawIdSafe` inkl. olex zentral (`lawid-safe.ts`), Drift-Skip sichtbar. **OFFEN: Daten-Regenerierung über Fedlex-Netz** (committete Sidecars tragen noch alte Platzierung).
- **Rechtsprechung C2 (Logik gefixt):** 2A/2C/2D-Disambiguierung — Norm-Signal (AIG→öffentlich, DBG/StHG→sozial-abgaben) vor grobem Abteilungs-Default; `proNorm`-Index nur Bund.
- `verified`/„geprüft" NICHT gesetzt. Befund-Bänder: 1 unsicher (D-3 Mahnung-Doppelung, SSoT-Hygiene), 6 widerlegt (als nicht-auslösbar nachgewiesen).

**Daten-Regen erledigt + deployt (`ec23458`, Prod-LIVE):** C1 Fussnoten-Sidecars neu (207 Dateien; Fix an KVV Art. 28 Fn 105 belegt: `absatz=null`→`1bis/lit.h`; 612 Fussnoten korpusweit an bis/ter-Absätzen), `check:normtext` offline+netz grün. C2 Sachgebiet via neuem `scripts/normtext/remap-sachgebiet.ts` neu klassifiziert: **33 Reklassifizierungen** (32 sozial-abgaben→öffentlich, 1→privat 2C_349/2024 ZGB-Ehe), `proNorm` Bund-only (10 kantonale Refs raus). Golden durchgehend byte-gleich. **C2 auf Davids Wunsch live, aber NICHT `verified`** — fachliche Abnahme der 33 steht aus (Zeitsperre bis 1.12.). **§2-Folgeschritt offen:** `legal_area` (treibt 22 der 33) ist NICHT im Snapshot → nicht offline-deterministisch; sollte in den Entscheid-Snapshot persistiert werden.

**§2-Lücke geschlossen (`efd5ebd2`, in `main`, noch NICHT deployt):** `legalArea` als Feld in den Entscheid-Snapshot-Typ (`typen.ts`) + Writer (`adapter-entscheide.ts`, Live-Generator persistiert es künftig automatisch) + einmaliger Backfill (`backfill-legal-area.ts`, OCL keyed-Lookup) → 258 BGer + 3 Kanton gesetzt, Rest genuin null (klassierungs-irrelevant). `remap-sachgebiet.ts` liest `legalArea` jetzt OFFLINE statt live. **Harter Determinismus-Beweis:** Offline-Re-Map reproduziert `register.json`+`norm-index.json` byte-identisch zu `ee852e1` (zwei Läufe identischer Hash) → gleiche Klassierung wie live, ohne Live-Abhängigkeit. Golden byte-gleich, tsc/check:entscheide grün. Verhaltens-neutral zur Prod (register/norm-index unverändert) → geht mit nächstem Deploy mit.

## Session 25.6.2026 — Feature «pdf-embed»: amtliches PDF in-app (ultracode, EMRK+NYÜ), LIVE

Auftrag David: schwer extrahierbare Erlasse (kein Volltext-HTML) analog lexfind anders darstellen — wartungsarm, überprüfbar, doppelt kontrolliert; via ultracode gebaut + adversarial reviewed; nützlicher/besser als Konkurrenz. Andockpunkt wie in [[lexfind-clex-quelle-strategie]] vorgedacht: `ErlassStatus → render_mode`.
- **Dritter Status `'pdf-embed'`** (neben snapshot/nur-live-link): amtliches Fedlex-PDF/A wird same-origin in den vollen Reader eingebettet (Kopf, Provenienz, ⬇ Download, ↗ geltende Fassung, Werkzeuge + BGer-Entscheide, native PDF-Suche). EMRK (0.101) + NYÜ (0.277.12) — beide haben KEINEN extrahierbaren HTML, aber valides PDF/A.
- **Wartungsarm:** EINE deklarative Quelle `src/lib/normtext/pdf-embed.ts` (key/eli/kons) treibt Register + Build + Checks; sha/Stand generiert (`pdf-index.json`), pdf-a-URL abgeleitet. Build `normtext:pdf` → `public/normtext/pdf/<KEY>.pdf` (committet, Repo-Artefakt-Modell); Shell-Guard (%PDF + ≥20 kB) → §8-Fallback statt kaputtem Embed.
- **Doppelte Kontrolle:** `check:pdf` (offline: Datei/%PDF/Bytes/sha, im Gate) + `check:pdf-netz` (Live-sha-Drift + geltende Konsolidierung via SPARQL, leeres Resultat = ROT, in check:netz).
- **ultracode-Multi-Lens-Review fing 2 PROD-ONLY-BLOCKER** (lokal unsichtbar, beide gefixt + Prod-verifiziert): (1) PDF-Artefakte waren untracked + `build` ruft `normtext:pdf` nicht → jetzt committet; (2) `vercel.json` globale `X-Frame-Options: DENY`/CSP `frame-ancestors none` hätte den eigenen same-origin-iframe blockiert → eigene `/normtext/`-Regel SAMEORIGIN + `frame-ancestors 'self'`. + MAJORs (Currency-ROT-bei-leerem-SPARQL, Fetch-Timeouts, pdf-embed-Provenienz-Test-Tor). Prod: EMRK.pdf 200 application/pdf + X-Frame-Options SAMEORIGIN, 0 Framing-Konsolenfehler.
- EMRK ist damit NICHT mehr nur-live-link, sondern pdf-embed. `verified` NICHT gesetzt (fachliche Abnahme David).

## Session 25.6.2026 (Forts.) — Live-Review-Iteration David + International, je Schritt Gate+Deploy+Push (autonom, David weg)

Daueranweisung David: autonom weiterarbeiten, zwischen den Schritten Bug-Check über den neuen Code, nach jedem Schritt deployen+pushen. Mehrere Einzel-Deploys, jeder Gate-grün:
- **UI-Fix-Batch** (`31bce32`): Sidebar/Sachgebiet-Labels umbrechen statt abschneiden (David «Tableiste schneidet ab» = Navigations-/Sachgebiet-Leiste, cw=168 truncate); absatzloser Einzug `-indent-9`→`-indent-4` (erste Zeile nicht mehr zu weit links); nda-Titel `overflow-wrap` (Kompositum sprengte 360px). Mobil-Crawl-Befund nda-12px war KEIN Phantom → Wizard-`h1`.
- **Sticky Gliederung** (`134667f`): GesetzLeser — echte xl-Erkennung (matchMedia 1280); unter xl trägt die sticky Suchleiste einen ☰-Knopf → Gliederungs-**Overlay-Drawer** (analog Seitenleiste), jederzeit beim Lesen erreichbar (vorher scrollte sie oben weg). TOC-Baum als geteilte Variable (§5). Repro: @1000px ☰ sichtbar+öffnet, @1400px 2-Spalten.
- **Einklapp-Marke deutlich** (`…`): alle 124 Flowtext-Sektionen waren bereits klappbar, aber Chevron zu blass/winzig → Messing-Akzent+grösser (David «analog Fedlex, auch Untergruppen»).
- **EU-Rubrik** (`ca59859`, LIVE): eigene Gruppe «EU-Verordnungen mit Praxisrelevanz» auf `/international` — 8 nur-live-link EU-VO (DSGVO/DSA/DMA/KI-VO/MiCA/Rom I/Rom II/Brüssel Ia), CELEX gegen EUR-Lex geprüft (§7/§8). Manifest 1449 Erlasse.
- **`/gesetze`-Redesign** (`0f9a904`, LIVE): International als gleichwertige 3. Säule (Segment Bund · Kantone · International); International-Tab zeigt SR-0.* + EU-VO gruppiert; geteilte Komponente `InternationalRubriken` (§5, auch auf /international); Suche umfasst International.
- **Startseiten-Kalender + Gesetz-Cutoff** (`97b7118`, LIVE): Kalender `kompakt`-Modus (nur relevante Wochen, schmaler, Live-Badge raus); GesetzLeser Artikel-Block `min-w-0 overflow-x-clip` → kein Text-Cutoff mehr bei geteiltem Bildschirm (600/820px verifiziert); Bund-Übersicht default eingeklappt; Sektions-Chevron deutlich (Fedlex-analog, alle Untergruppen klappbar).
- **International SR-0.* VOLLTEXT** (LIVE, Prod verifiziert): 8 Staatsverträge promoviert nur-live-link→Volltext (CISG 101 / LugÜ 79 / HZÜ 31 / HBewÜ 42 / HKÜ 45 / FZA 25 / VRK 85 / UNO-Pakt II 53 Artikel) via Fedlex-Pipeline; `check:fedlex-versionen` alle = neueste Konsolidierung, adversarial Snapshot==Live-Anker, golden re-baselined, Gate grün. **EMRK (0.101) bleibt §8 Live-Link** (Fedlex nur ~9-kB-Shell ohne `<article>`). Bund jetzt 218 (inkl. 8 international-Volltext).
- **Reader-Feinschliff** (LIVE): Kalender zeigt Stillstand nur im Frist-Zeitraum (kein irrelevanter Sommer-Stillstand nach Fristende); unter xl Suche+Gliederung nur auf Wunsch (kompakter ☰→Drawer, Reiter-Streifen nicht mehr eng).
- **International P2 VOLLTEXT** (LIVE): +10 weitere Staatsverträge (UNO-Pakt I, KRK, CEDAW, UN-Antifolter, Haager Erwachsenenschutz HEsÜ, Haager Adoption HAdoptÜ, PVÜ, ICAO, GFK, Staatenlose) → International-Volltext gesamt **18**, Bund 228; neue Rubriken «Asyl & Migration» + «Weitere Spezialgebiete». check:fedlex-versionen alle aktuell (3 Resolver-Altfassungen nachgepinnt), Prod verifiziert (KRK 54 Art.). **EMRK (0.101) + NYÜ (0.277.12) strukturell nicht machbar** (Fedlex nur ~9-kB-Shell ohne `<article>`) → §8-Live-Link.
- **OFFEN:** noch mehr SR 0.* optional — `FAHRPLAN-INTERNATIONAL-VOLLTEXT.md`.

## Session 25.6.2026 — Autonomer Sammel-Batch David-Live-Review (Mobil/Lesbarkeit/Vorlagen-Logik/Normtext-Leak/Scroll/Rechtsprechung), Gate grün, Deploy

Auftrag David: «mach was du für richtig empfindest um nochmals alles komplett zu überprüfen», dann eine Reihe konkreter Befunde — alles autonom durchziehen, erst am Schluss melden, Deploy-Ja für die ganze Session. Vorgehen: 4 read-only Opus-Reviewer (Normtext/Vorlagen-Logik/Extraktor-Register/Farben) + eigene Playwright-Repros; je Befund Fix, Gate grün (`npm run gate`: tsc/vitest/golden/lint/check), bund-golden re-baselined. HEAD vorher `61d223a`.
- **Mobil (Playwright-Crawl 56 Routen × 360/390/414):** echte Seiten-Overflows nur bei 360px → `/rechner/verzugszins` (Titel+Buttons-Zeile `flex-wrap`, VerzugszinsForm) und `/vorlagen` (Rechtsgebiet-Select `min-w` → `w-full sm:w-auto`, Katalog). **Kachel-auf-Kachel-Überlappung NICHT reproduzierbar** (die 148 Treffer waren alle der gewollte schwebende «Vorschau ↓»-FAB + Icon-in-Input); FAB-Boden-Abstand `pb-20` am Wizard ergänzt, damit er das letzte Feld nicht verdeckt. Residuum: `/vorlagen/nda` 12px Phantom-Overflow (keinem Element zuordenbar, vermutlich Pseudo-Element) — offen, vernachlässigbar.
- **Lesbarkeit/Farben (WCAG-Audit):** eigenes `--placeholder`-Token (Platzhalter 2.06→~4.4:1 hell/dunkel), Link-Hover dunkelt jetzt (`a:hover`→`--brass-800` statt aufhellendem brass-600), `.lc-fineprint` `ink-500→ink-600` (4.85→7.2:1). Nur `index.css`-Tokens.
- **Gesetz-Reader:** absatzlose Artikel jetzt ebenfalls HÄNGEND eingerückt (`pl-9 -indent-9`, ArtikelBody, Auftrag David «2. Zeile verschoben»); Gliederungs-Öffner unter xl von winziger text-micro-Zeile auf klaren `lc-btn-outline ☰`-Button (GesetzLeser, «bei geteiltem Bildschirm aufrufbar»).
- **Startseite-Fristenkalender:** redundanten «Feiertage {Kanton}»-Kopf entfernt (FristenKalender; Legende erklärt es weiterhin).
- **Logo:** auf Vorzustand zurückgesetzt (David: altes besser) — `Logo.tsx` + `favicon.svg` aus `81a9f59^`.
- **Scroll-Reset Gesetz-Wechsel ENDGÜLTIG (App.tsx):** Wurzel = `aktiv.current`/Speicher-Sperre wurden in einem `useEffect` (NACH dem Paint) gesetzt → das durch das Höhen-Schrumpfen des neuen Readers ausgelöste Clamp-`scroll`-Event konnte davor feuern und dem ALTEN Pfad die ~0-Position zuschreiben (timing-abhängig = «ab und zu»; erklärt die früheren Teil-Fixes). Fix: Pfadwechsel + Sperre synchron im Commit via `useIsoLayoutEffect` (SSR-sicher) VOR Paint/Clamp; Sperre in allen Zweigen sauber gelöst. Round-Trip-Repro 5/5 Position erhalten.
- **Vorlagen-Logik (§1):** Eheschutzgesuch liess juristische Person als Ehegatte zu (`nurNatuerlich` vergessen) → Prop ergänzt; zusätzlich Logikschicht-Absicherung (Mängel-Check `typ==='juristisch'`) in eheschutz/scheidungsklage/scheidungsbegehren (§3, unabhängig vom UI-Prop). Vorsorgeauftrag: Personensorge durch juristische Person geblockt (vorher nur medizin-Teilfall), Art. 360/378 ZGB.
- **Normtext-Extraktor (2 echte Befunde, 114 Bund-Snapshots regeneriert via `--nur=bund`, kanton 30327 bewahrt, `check:normtext`/`check:zitate` grün):** **P1 Fussnoten-Ziffern-Leak** — der Fallback-Zweig (Artikel mit Nicht-«absatz»-`<p>`, z.B. `class="inkrafttreten"`) strippte `<sup><a>NNN</a></sup>` NICHT → Ziffer leakte (DBG art_222 «…1995 337», VwVG art_17). Fix: gemeinsamer robuster `entferneFussnotenSups` (Whitespace/`<inl>`-tolerant), auch im Fallback; Regressionstest. **P2 Sammel-Label** «Art. 2628»→«Art. 26–28» (`artikelLabel`: `_` vor Ziffer→«–», vor Buchstabe→entfernt; fliesst nicht in den sha).
- **Rechtsprechung:** Live-OCL-Rebuild Bund **265→340 BGer-Leitentscheide** (+75, alle mit Regeste; BFS 2048 geholt/1782 unique), Kanton 30; `erfasste-keys.generated.ts`/register/norm-index nachgezogen; `check:entscheide` grün (370, 4 Warnungen). Korpus-Pfad jetzt `bund/bger/` (kanonische Generator-Ausgabe). Backup vor Replace gesichert.
- **OFFEN:** `/vorlagen/nda` 12px-Phantom; fachliche Abnahme David (Zeitsperre bis 1.12.) unberührt — kein `verified` gesetzt.

## Session 25.6.2026 (nachts, autonom «mach das alles, ich geh schlafen») — Schluss-Bug-Check + QA-Kette über die Korpus-Verdreifachung, alles deployt

Nach den Volltext-Batches (1/2/3 = +139 Erlasse, ~200 Bund-Volltexte) fuhr eine autonome Kette mit mehreren parallelen/sequenziellen Opus-Reviewern + Fix-Agenten; jede Etappe Gate grün (golden byte-gleich), je deployt + gepusht. Alle Commits live (HEAD `81a9f59`).
- **Bug-Check (3 Reviewer):** **A Rechtstext** fand 1 BLOCKER (§1): der Fedlex-Extraktor zerstörte VERSCHACHTELTE `<dl>`-Listen (lit-Buchstabe + nummerierte Unterpunkte) — KVV art_30 3→22 items, MStG art_42 a–e komplett, ZPO art_250 4→38, MWSTV 126/127. Fix in `extrahiere-fedlex.ts` (balancierte `<dl>`-Erfassung + rekursives `parseDefinitionsListe`; Sekundärbug `<dt>`-Text/leeres `<dd>` mitgefixt), **144 Bund-Snapshots regeneriert (`--nur=bund`, +2781 items)**, Golden korrektheits-re-baselined (Kanton 30327 byte-erhalten), 3 neue Regressionstests, gegen Live-Fedlex verifiziert, keine Regression bei einfachen Listen (`8084eda`). **B Norm-Verlinkung:** sauber (0 Kollisionen/200 Keys, kein stiller Live-Link-Fallback — SNAPSHOT_QUELLE aus Register abgeleitet, Bijektions-Tor; keine Fehlziele/toten Verweise). **C UI/Bedienbarkeit:** sauber (0 Konsolenfehler/20 Routen) bis auf 1 Minor → Tab-Dropdown schliesst auf Escape (`e91c6d1`).
- **GesetzLeser Split-Screen** (`e09eda3`): TOC-Spalte + Artikel-Randtitel erst ab `xl` (1280) statt `lg` (1024) → Lesespalte bei 1024px 200→720px, bei 1100px 276→736px (reine Darstellung, golden byte-gleich).
- **Code-Vereinfachung** (`73de64b`): Darstellungs-Layer schon diszipliniert (tsc `noUnusedLocals` garantiert keine toten Locals); nur 3 überflüssige `export` an internen Typen entfernt; Rest bewusst belassen (§1).
- **Visual/Mobile/Startseite** (`ad4a4c9`): 1 Bug — horizontaler Reader-Overflow bei 360–430px (lange Komposita brachen im Hängeeinzug nicht) → `overflow-wrap:anywhere hyphens-auto` am Lese-Absatz; sonst nichts abgeschnitten/schief über alle Viewports + Startseite (golden byte-gleich).
- **Logo modernisiert** (`81a9f59`): «§ trifft Messkante» — §-Siegel als font-unabhängiger Pfad (retina-scharf bis 16px) + graduierte Messskala mit Messing-Messpunkt (Recht ⨉ Metrik); Favicon neu abgeleitet. `Logo.tsx` + `favicon.svg`. David sichtet/iteriert.

## Session 25.6.2026 — Punkt 12 Batch 3: Bund-Volltext auf ~100 Gesetze + ~100 Verordnungen aufgestockt (53 neue Erlasse, autonom, in `main` lokal, NICHT deployt/gepusht)

Auftrag David (Punkt 12, Batch 3): Bund-Volltext-Korpus Richtung **~100 Gesetze + ~100 Verordnungen** aufstocken (über die Bookmark-Liste hinaus die zentralsten eidg. Erlasse kuratieren; keine International-/SR-0.*-Erlasse). Working-Tree sauber (HEAD e92b667), keine Parallel-Session → direkt im Haupt-Baum (kein Worktree). Gate GRÜN (tsc/vitest/**golden:vergleich byte-gleich**/lint/check), `check:normtext` grün (**23236 Bund-Snapshots**, +4285), `check:fedlex-versionen` «Alle Pins aktuell», Kanton-Golden unberührt (**30327 Einträge bewahrt** via `--nur=bund`).
- **Bilanz:** Bund-Volltext **147 → 200 Erlasse** (+53). Aufteilung vorher Gesetze 83 / VO 66 → nachher **~100 / ~100** (200 total; je nach Zählung Reglemente 97/103 bzw. 101/99). Ziel beidseitig erreicht.
- **17 Stub-Promotionen** (Stub → Volltext): SortG, PRG, BEG, MStG, MStP, IRSG, MVG, EnG, CO2-Gesetz, EpG, TxG, LMG, LFG, EBG, FMG, MG (16 Gesetze) + ZStV (VO). **+ 2 neue Gesetze** kuratiert: THG (946.51), BGBM (943.02). **+ 34 kuratierte zentrale VERORDNUNGEN:** MSchV, PatV, DesV, URV, TGBV, VKKG, AdoV, PAVO (Privatrecht); ZentV, ZAV (Polizei/Straf); VGR (Verfahren); BKV, VFV, VVK, VKL, ArGV 5 (Steuern/Sozial/Arbeit); BBV, BMV, ZEMIS-V, RDV (Bildung/Migration); UVPV, ChemRRV, VeVA, VGV (Umwelt); NBV, KKV-FINMA, FinfraV-FINMA, FINMA-GebV, AkkBV (Finanzmarkt); SKV, VVV, VIL, FDV, FAV (Verkehr/Kommunikation). Mechanik wie Batch 1/2: `fedlex-cache.sh` (53 Pins, 6-Feld inkl. SR-Sonde) + `register.ts` (`bund()`) + `fedlex.ts` (FEDLEX-Keys) + `systematik.ts` (39 Keys neu, 14 lagen schon als Platzhalter) + `normtext-snapshot.ts` (ERLASS_MAP) + `bund-stubs-generieren.ts` (17 aus LISTE entfernt). `bundRef.ts` (Popover-Quelle) ist abgeleitet → erfasst die 53 automatisch.
- **§7-Doppelverifikation (Kern):** Wegwerf-Probe (`scratchpad/pin-probe.ts`, gleiche Currency-/Filestore-Logik wie `check:fedlex-versionen`+`fedlex-cache.sh`) prüfte je Pin die **geltende Konsolidierung** + **SR-Sonde** (`<p class="srnummer">` == erwartete SR) + art_1 + html-N. Der einfache ELI-Resolver gab für ~17 VO die REPEALTE Vorgänger-Fassung (nur ~9 kB SPA-Shell) — korrekte geltende ELI über die **date-geordnete Taxonomie-Abfrage** (mehrere ConsolidationAbstracts je SR) nachgezogen (z. B. DesV cc/2002/183, BBV cc/2003/748, NBV cc/2004/233, VeVA cc/2005/551, FDV cc/2007/166, FAV cc/2016/24, AdoV cc/2011/505). **Adversarial je Erlass:** Snapshot-Artikel-ID-Menge == Fedlex-`<article id="art_`-Menge bei ALLEN 53 (0 fehlend/extra); erster/mittlerer/letzter Artikel sauber; bis/ter erhalten (MStG art_49abis, IRSG art_80dbis/dter/dquater); Aufzählungen als items; keine Fussnoten-Leaks; «Keine Token übersprungen».
- **§8-Fallback (bleiben Live-Link-Stub):** PrHG (221.112.944, Filestore nur ~12 kB SPA-Shell — Batch-1-Befund bestätigt); SpV (172.081), AllgGebV (172.041.1), AsylMassnV (142.318, ~17 kB), OAV-SchKG (281.11) u. a. — nur SPA-Shell/<20 kB, nicht als fragwürdiger Volltext gespeichert. Übrige nur-live-link-Stubs jetzt nur noch PrHG + 9 International (SR 0.*).
- **§6.3-Test nachgezogen:** `normtext-bundRef.test.ts` nutzte MStG als Beispiel-Stub (jetzt Volltext) → auf PrHG umgestellt (echter Reststub). `register.json` neu generiert (1442 Erlasse, 211 Bund).
- `verified`/«geprüft» NICHT gesetzt (fachliche Abnahme David). **Offen:** PrHG/SpV/AllgGebV/AsylMassnV via direkten geltenden ELI (kleiner-Erlass-Sondertor); weitere Kuration nach Bedarf.

## Session 25.6.2026 — Punkt 12 Batch 2: 61 Bund-VERORDNUNGEN Volltext (autonom, isolierter Worktree, in `main` lokal, NICHT deployt/gepusht)

Auftrag David (Punkt 12, Batch 2): Schweizer Bundes-VERORDNUNGEN als Volltext im LexMetrik-Reader (Promotion nur-live-link-Stub → verifizierter Volltext-Snapshot; fehlende generieren; Gesamtziel ~100). Gate grün (golden byte-gleich, kanton unberührt via `--nur=bund`), `check:normtext` grün (18951 Bund-Snapshots, +6337), `check:fedlex-versionen` «Alle Pins aktuell». **§12-Isolation:** wegen fremdem VAG-WIP im Arbeitsbaum in eigenem git-Worktree `batch2-verordnungen` gearbeitet, Commit per Pathspec.
- **61 Verordnungen promoviert** (Stub → Volltext-Snapshot): AHVV, IVV, ELV, BVV 2, UVV, AVIV, ATSV, KLV, MWSTV, VStV, VZAE, VRV, VZV, SSV, DSV (15 aus Stub-LISTE) + ArGV 1–4, BewV, BüV, FZV, KOV, RPV, VFRR (281.31), VöB, VZG, BVV 3, MVV, EOV, FamZV, VEV, VIntA, AsylV 1–3, GSchV, LRV, LSV, VVEA, ChemV, NHV, WaV, VTS, BankV, KKV, ERV, FINIV, FinfraV, FIDLEV, AVO, GwV-FINMA, VAM, AMBV, MepV, EpV, BPV, RVOV, VGKE, BetmKV, QStV (46 neu generiert). Mechanik wie Batch 1: `fedlex-cache.sh` (61 Pins) + `register.ts` (`bund()`) + `fedlex.ts` (FEDLEX-Keys) + `bundRef.ts` (Snapshot-Quelle) + `systematik.ts` (Sidebar, 46 Keys neu, 15 lagen schon als Platzhalter) + `normtext-snapshot.ts` (ERLASS_MAP) + `bund-stubs-generieren.ts` (15 aus LISTE entfernt). Bund jetzt **147 Erlasse mit Volltext**.
- **§7-Doppelverifikation (Kern):** Der ELI-Resolver gab für VIELE VO die REPEALTE Vorgänger-Verordnung oder eine bereits überholte Konsolidierung — korrekte geltende ELI/Konsolidierung über die **date-geordnete Taxonomie-Abfrage** (mehrere ConsolidationAbstracts je SR; jüngste mit Filestore-HTML gewählt) + **`check:fedlex-versionen` als Currency-Arbiter** (fing 20 als ÜBERHOLT → auf die geltende Konsolidierung nachgepinnt) + **Filestore-HTML-Inhalts-Sonde** (Titel + art_1) doppelt verifiziert. Adversarial je Erlass: Snapshot-Artikel-ID-Menge == Fedlex-`<article id="art_`-Menge bei ALLEN 61 (0 fehlend/extra); Stichprobe erster/mittlerer/letzter Artikel sauber, bis/ter-Artikel erhalten (z. B. BPV art_64abis/88dbis/88dter), Aufzählungen als items, keine Fussnoten-Leaks, keine Tabellen-Verluste; «Keine Token übersprungen».
- **§8-Fallback (bleibt Live-Link-Stub):** LGV (SR 817.02) — die SR-Taxonomie löst nur auf die alte, abgelöste Lebensmittelverordnung (ELI cc/52/…, letzte Konsolidierung 1990) auf; keine geltende Konsolidierung sauber abrufbar → nicht als fragwürdiger Volltext gespeichert. ZStV (211.112.2) bleibt bewusst Stub (nicht in diesem Batch).
- `verified`/«geprüft» NICHT gesetzt (fachliche Abnahme David). **Offen:** weitere Bookmark-/Standard-Verordnungen Richtung ~100 (LGV-Sonderfall via direkten ELI); restliche Bookmark-Gesetze.

## Session 25.6.2026 — Ultracode-Review umgesetzt: Inline-Popover-Lücke (34 Gesetze) + SR-Sonde korpusweit + §5-Entdopplung (autonom, in `main` lokal, NICHT deployt/gepusht)

Auftrag David: «vereinfachen + Fehleranfälligkeit reduzieren, Befunde gleich umsetzen». Zwei adversariale Opus-Reviewer (Normtext-Mechanik + UI); risikoarme Befunde umgesetzt, gate grün (golden byte-gleich).
- **⭐ MAJOR-Funktionslücke (Commit `3e42bb4`):** `SNAPSHOT_QUELLE` (bundRef.ts) deckte nur 52 von 86 Volltext-Snapshots ab — 34 ZENTRALE Gesetze (BV, DBG, KG, FusG, MSchG, PatG, UWG, VStG, ATSG, RPG, IPRG, BVG, UVG, AHVG …) hatten den Volltext lokal, aber das Inline-Norm-Popover fiel STUMM auf den Live-Link zurück (Tabellen-Eintrag beim Promovieren vergessen, kein Tor fing es). Fix: 52-Zeilen-Handtabelle durch Ableitung `fedlexKey→key` aus ERLASS_REGISTER ersetzt (SSoT §5, kann nicht mehr driften). Empirisch: alte 52 byte-identisch, 34 lösen jetzt auf. **Deklarierte fachliche Änderung §6.3** (34 neue Popovers = zusätzlicher UI-Pfad zu BEREITS angezeigten, §7-verifizierten Snapshots, keine neue Rechtsquelle); Test nachgezogen.
- **SR-Sonde korpusweit (Commit `3e42bb4`):** Die VAG-Härtung (SR-Identitäts-Prüfung im Cache-Tor) trug nur 25/86 Pins → SR-Feld bei ALLEN 86 ergänzt. Lauf bestätigt: alle 86 SR-konform (kein weiterer VAG-artiger Fehlgriff im Altbestand).
- **§5-Entdopplung + a11y (Commit `d527c2a`):** verlaufLabel + Tab-Wappen-Helper teilten denselben {ebene,key}→Erlass-`find` (doppelt je Gesetz-Tab) → geteilter `erlassVonPfad`-Resolver. KantonWappen-Prop `dekorativ` (aria-hidden im Tab, da Titel daneben).
- **Systematik-Tor (Commit `113df2a`):** neuer Soft-Tor — jeder Bund-Volltext-Erlass muss in genau einer SYSTEMATIK-Gruppe stehen (sonst stumm «Weitere Erlasse»); fängt das Vergessen beim Promovieren (aktuell 0 fehlend).
- **Reviewer-Verdikt sonst:** erkenneFedlexGesetz bei ~90 Keys KOLLISIONSFREI (empirisch alle Paare); ScrollWiederherstellung-Loop NICHT umbauen (eingefangenes Bug-Wissen, Observer nicht klar besser) — beide bewusst gelassen.

## Session 25.6.2026 — Punkt-12-Bug-Check (VAG-Fehlerlass) + Scroll-Ruck + Tab-Kantonswappen (autonom, in `main` lokal, NICHT deployt/gepusht)

Forts. derselben Session (Daueranweisung David: laufend Bug-Check). Reine Darstellung/Daten, gate grün (golden byte-gleich), Playwright-verifiziert.
- **Bug-Check Punkt 12 (Commit `626927c`):** Zwei unabhängige adversariale Linien fanden denselben BLOCKER — **VAG-Snapshot trug den FALSCHEN Erlass** (Agrar-Einfuhr-VO SR 916.01 statt Versicherungsaufsichtsgesetz SR 961.01). Unter ELI cc/2005/734/20240901 liegen ZWEI Erlasse in verschiedenen html-Varianten; html-0 = Agrar-VO, html-1 = VAG. Der art_1-Anker existiert in BEIDEN → das Anker-Tor war blind. Fix: vag-Pin auf html-1 (61→149 Artikel, korrekt). **Strukturelle Härtung:** Cache-Tor (`fedlex-cache.sh`) prüft jetzt die im HTML eingebettete `<p class="srnummer">` gegen die erwartete SR (optionales 6. Cache-Feld); fängt die ganze Erlass-Kollisions-Klasse. Alle 25 Batch-1-Pins tragen die SR; Negativ-Test bestätigt. Übrige 24 Erlasse inhaltlich sauber (h1-Titel je Erlass gegen erwartete Norm geprüft).
- **Scroll-Ruck beim Gesetz-Wechsel (Commit `ce3981b`):** David meldete den «an-den-Anfang»-Sprung ZUM WIEDERHOLTEN MAL. Diagnose+Playwright-Repro: der Fix vom 24.6. («(13)») ZEMENTIERTE das unerwünschte Verhalten — sein 360-Frame-Beharrlichkeits-Loop ist nur fürs Restaurieren einer NICHT-Null-Position nötig, riss aber jeden frisch besuchten Gesetz-Pfad wiederholt nach oben. Fix (`App.tsx` `ScrollWiederherstellung`): frischer Pfad/Ziel 0 → EINMALIGES scrollTo(0)+Nach-Frame, KEIN Loop; Rückkehr-zur-Position bleibt. Repro: neues Gesetz Y=0 ruckfrei, Rückkehr restauriert ~3000.
- **Kantonswappen im Tab-Streifen (Commit `ce3981b`):** Reiter eines KANTONALEN Gesetzes zeigt jetzt das Kantonswappen statt des §-Glyphs (`TabStreifen.tsx`, Helper `kantonVon` aus dem Browse-Manifest, SSoT §5; `KantonWappen`+`public/wappen/*.svg` existierten). Einzel-Reiter + Dropdown. Bund/Manifest-noch-nicht-geladen → §-Fallback. Playwright hell+dunkel (AG-Wappen erscheint, OR/Bund ohne).
- **Hinweis §12:** Parallel-Session arbeitet in Worktree `.claude/worktrees/batch2-verordnungen/` (Verordnungen-Batch) — nicht angefasst.

## Session 25.6.2026 — Punkt 12 Batch 1: 25 Bund-Gesetze Volltext (autonom, in `main` lokal, NICHT deployt/gepusht)

Auftrag David (Punkt 12): Bund-Gesetze aus seiner Anwaltsprüfungs-Bookmark-Liste als Volltext im LexMetrik-Reader (statt nur-live-link-Stub). Erster sauber-verifizierter Batch der **Gesetze** (keine Verordnungen). Gate grün (golden byte-gleich, kanton unberührt via `--nur=bund`), `check:normtext` grün (12614 Bund-Snapshots).
- **25 Erlasse promoviert** (Stub → Volltext-Snapshot): BüG, BGÖ, BPR, VG, PublG, ParlG, RVOG, BöB, BPG, StBOG, DesG, OHG, NHG, EntG, GSchG, EntsG, ELG, FZG, WaG, PüG, FIDLEG, KAG, FINIG, FinfraG, VAG. Mechanik: `fedlex-cache.sh` (25 Pins) + `register.ts` (`bund()`) + `fedlex.ts` (FEDLEX-Keys) + `bundRef.ts` (Snapshot-Quelle) + `systematik.ts` (Sidebar) + `bund-stubs-generieren.ts` (16 promovierte aus LISTE entfernt). Bund jetzt 86 Erlasse mit Volltext.
- **§7-Doppelverifikation (Kern):** Der ELI-Resolver gab für rvog/stbog/desg/finig/wag/pueg die REPEALTE Altfassung (Lektion [[lexmetrik-bund-volltext-ausbau]] bestätigt) — korrekte in-Kraft-ELI über die **date-geordnete Taxonomie-Abfrage** gewählt, gegen `check:fedlex-versionen` (8 weitere Pins als ÜBERHOLT erkannt + nachgepinnt) + **Filestore-HTML-Inhalts-Sonde** + den **Titel der gepinnten ELI** doppelt verifiziert. Adversarial: generierte Artikelzahl == Fedlex-`<article id=>`-Zahl bei ALLEN 25 (0 Verluste); Stichprobe erster/mittlerer/letzter Artikel sauber, keine Fussnoten-Leaks; alle leeren Artikel ausschliesslich amtlich «Aufgehoben»/Änderungs-Artikel («…»).
- **§8-Fallback (bleiben Live-Link-Stub):** MitwG (SR 822.14), PrHG (SR 221.112.944) — Filestore-HTML nur ~15 kB (unter der 20-kB-SPA-Shell-Schwelle des Cache-Tors); nicht als fragwürdiger Volltext gespeichert.
- `verified`/«geprüft» NICHT gesetzt (fachliche Abnahme David). **Offen:** ~78 weitere Bookmark-Gesetze + ~100 Verordnungen (separate Batches); MitwG/PrHG (eigener kleiner-Erlass-Sondertor-Entscheid).

## Session 24.6.2026 (spät) — 14-Punkte-UI/Redesign-Welle, autonom (in `main` lokal, PROD-DEPLOY je Welle)

Auftrag David: Live-Review-Punkte am Stück, je Schritt Bug-Check (adversariale Opus-Agenten) + Deploy, ohne Rückfragen. Gate je Welle grün (golden byte-gleich), Playwright-/Prod-Preview-verifiziert. **12 von 14 erledigt + deployt; 11+12 (Gesetze-Ausbau) blockiert.**
- **(14) Rechtsprechung-Seitenleiste als Dropdown** wie die anderen: Sachgebiete in EINER einklappbaren Gruppe «Nach Sachgebiet» (standardOffen=false), strukturgleich zu Bund/Kantone; Punkt-5-Sonderbehandlung (nurBlaetter) entfernt.
- **(1) Suchleiste GesetzLeser** in die Gliederungs-Spalte (oberhalb TOC) statt voll über den Gesetzestext; Vollbreiten-Fallback nur ohne 2-Spalten. Review fand Mobil-Doppel (gefixt).
- **(2/4) Tab-Streifen nach Kategorie gruppiert** (`TabStreifen` v2): Sammel-Reiter je Kategorie (Gesetze/Rechtsprechung/Vorlagen/Rechner) mit Piktogramm + Dropdown; Drag-and-Drop entfernt. Dropdown auf nav-Ebene (ausserhalb des scrollenden `<ul>`), sonst abgeschnitten.
- **(3) Sortierung-Select (Rechtsprechung)** vertikales Klipping gefixt (`index.css`: `lc-select.lc-input-sm` 0-Vertikalpolster, höhere Spezifität).
- **(5) Seitenleiste**: Rechtsprechung-Direktlinks gleich eingerückt wie Gruppen-Auswahl. **(8)** Klick auf Abschnitts-Überschrift klappt Untergruppen zu (Remount-Key).
- **(6) Live-Suche (entscheidsuche.ch)** an den Kopf der Ergebnis-Spalte.
- **(7) Scheidungs-Vorlagen**: «Juristische Person» entfernt (`ParteiEditor` Prop `nurNatuerlich`; Ehegatten = natürliche Personen). KlageVereinfacht behält Umschalter. Golden byte-gleich.
- **(9) Vorlagen-Übersicht entschlackt** (`Katalog.tsx`, Workflow-Empfehlung): ein Header (`ohneKopf`), ~14 Pillen → ein Rechtsgebiet-Dropdown, geplante Vorlagen gesammelt in EINEN «In Vorbereitung»-Block, flache Unterrubriken, Form-Gate-Label weg. Nur `/vorlagen`, `/rechner` unverändert.
- **(10) Startseiten-Kalender** an Fristenrechner angeglichen: `start/FristenKalender` ist jetzt dünner Adapter auf `components/FristenKalender` (§5/§10); Basis rückwärtskompatibel erweitert (aQuoISO optional, `stillstandPerioden`); 6 Formulare byte-gleich (Review bestätigt).
- **(13) Scroll-Reset beim Gesetz-Tab-Wechsel** endgültig gefixt: die `ScrollWiederherstellung` (`App.tsx`) brach in der Reader-Ladephase (eintraege=null, kurze stabile Höhe) zu früh ab → bei langsamem Netz Sprung an den Anfang. «stabil» zählt erst ab geladenem Inhalt (Höhe > 1.5×Viewport). Mit 700ms-Netzdrosselung im Prod-Build verifiziert.
- **OFFEN/BLOCKIERT (11+12)**: International-Rubrik (SR 0.*: EMRK/CISG/LugÜ/Haager + EU/GDPR als Live-Link) und Gesetze-Ausbau ~100 Bund-SR. **Punkt 12 blockiert**: Quell-Datei `bookmarks_schweizer_recht_v2.html` ist aus `~/Downloads` verschwunden → ohne sie keine Extraktion der konkreten SR-Liste (keine erfundenen Normen, §7/§8). Beides ist Fedlex-Generator-Arbeit (dedizierte Session) — gemeinsam zu erledigen, sobald die Datei wieder da ist.
- **Hinweis Git**: Commits liegen LOKAL auf `main` (Push zu origin vom Auto-Classifier geblockt); PROD ist via `vercel --prod` aktuell (CLI-Deploy, nicht git-getrieben).

## Session 24.6.2026 (abends, Forts.) — Schnellrechner-Politur: «Berechnen» weg, Disclaimer entschlackt, Kalender zeigt Stillstand (in `main`, PROD-DEPLOY)

Auftrag David (Live-Review): Startseite-Schnellrechner aufräumen. Worktree (§12) auf `45c1315`, Gate grün, Playwright-verifiziert.
- **«Berechnen»-Label entfernt** (Fristen-Tab) — überflüssige Beschriftung.
- **Rechtlicher Hinweis (`PflichtDisclaimer`) auf der Startseite unterdrückt** in Gebühren (Prozess/Betreibung/Grundstück) + Zuständigkeit via `minimal`-Prop der Formulare. §8 gewahrt: die Startseite trägt bereits den **globalen** Pflicht-Hinweis (Startseite.tsx + Footer); die VOLL-Rechner behalten ihren Disclaimer unverändert (verifiziert).
- **(N) Kalender zeigt den Fristenstillstand**: `FristMarkierung.stillstand` (ISO-Perioden aus `data/zpoFeiertage`, §5) — ZPO immer, VwVG/BGG nur bei aktivem Tagesfristen-Stillstand; SchKG bewusst NICHT (eigene Betreibungsferien). FristenKalender schattiert die Gerichtsferien-Tage + Legende.

## Session 24.6.2026 (abends) — Fristen-Schnellrechner, Scroll-Erhalt, Rechtsprechungs-Bezeichnung, Gesetz-Suche/-Einzug & Navigation (in `main`, PROD-DEPLOY)

Auftrag David (Live-Review, rapid-fire): mehrere UI-Punkte. Isolierter Worktree (§12) auf `78614d2`. Gate grün (golden byte-gleich), **adversarialer Bug-Check auf OPUS** (Daueranweisung) — fand 3 MAJOR an der Leitsatz-Extraktion (alle gefixt + gegen alle 271 echten Regesten validiert) + MINOR-Politur. Playwright-verifiziert.
- **(C) Startseite-Fristen-Schnellrechner** (`EinfacheFristForm`/`FristenKalender`/`Schnellrechner`): Kalender für ALLE Ferien-/Stillstand-Regimes sichtbar (FristMarkierung Start+Ende ISO je Engine), nicht mehr nur „keine Ferien"; Kacheln Datum/Frist/Einheit/Kanton via `items-end` gleiche Höhe; Datum default heute (App hydratisiert nicht → render-then-replace), Ferien default ZPO. Reine Darstellung/Komposition (§3).
- **(I) Scroll-Erhalt beim Tab-/Routenwechsel** (`App.tsx` `ScrollWiederherstellung` ersetzt `ScrollToTop`): Position je Pfad gemerkt+wiederhergestellt (langer Reader→zurück landet an der Stelle); neue Pfade weiter oben; `scrollRestoration='manual'`, Listener während Restore/auf Anker-Routen stillgelegt; Anker via `ScrollZuHash`.
- **(Übersicht) Bezeichnung führt mit dem Leitsatz** (`browse.ts` `regesteLeitsatz`): Artikel-Block der Regeste gestrippt (Semikolon-Segmente + Punkt-nach-Gesetzeskürzel, abkürzungs-feste Satzerkennung, Grossschreibung), bei Zweifel ehrlich die VOLLE Regeste statt Fragment (§8). `EntscheidZeile` thema-führend, BGE-Nr rechts, Datum links, klickbare Normen. **3 Bug-Check-MAJORs gefixt** (Abkürzungs-Schnitt/Norm-only/Krümel).
- **(J) Gesetz-Suche oberhalb der Gliederung** (`GesetzLeser`): „Im Gesetz suchen" als volle Leiste über das 2-Spalten-Raster, sticky unter Header UND Reiter-Streifen (`--tabstreifen-h`).
- **(K) Reiter nur bei konkretem Inhalt** (`TabTracker`): Tab öffnet nur bei `/(rechner|vorlagen|gesetze|rechtsprechung)/<item>`, nicht bei Übersichts-/Seitenleisten-Klicks. **(L)** Seitenleiste „Bund"/„Kantone" navigieren direkt zur Gesetze-Übersicht (`navigation.ts`/`Sidebar.tsx`; Chevron klappt weiter auf).
- **(M) Absatzloser Artikel wird wie ein Absatz eingerückt** (`GesetzLeser`/`ArtikelLeser`): Artikel mit nur einem unnummerierten Absatz erhalten denselben Einzug wie nummerierte Absätze (einheitliches Schriftbild).

## Session 24.6.2026 — TEIL B + Rechtsprechungs-UI-Welle: Live-Suche, Sachverhalt-Gliederung, Lesemodus (ultracode, in `main`, PROD-DEPLOY)

Auftrag David (Live-Review, rapid-fire): entscheidsuche nutzbar machen (Teil B) + Sachverhalt „aufteilen" + diverse Reader-/Listen-Verbesserungen. Isolierter Worktree (§12) auf `eaff07c`. Gate grün (golden byte-gleich), **adversarialer Bug-Check auf OPUS** (Daueranweisung David: immer bestes Modell — der erste Lauf auf Haiku übersah den MAJOR), Playwright hell/dunkel/desktop/mobil 0 Konsolenfehler.
- **B2 Live-Volltextsuche** (`lib/rechtsprechung/livesuche.ts` + `LiveSuche.tsx` in `/rechtsprechung`): opt-in Discovery über den GANZEN CH-Korpus. §7: MCP `/mcp` blockt Browser-Origin (403) → direkter Browser-Fetch gegen `entscheidsuche.ch/_search.php` (CORS `*`). KEINE Engine (§2): externe, ungeprüfte Treffer klar markiert, amtlicher Link je Treffer, Suchbegriff verlässt App erst auf Klick (§8). End-to-end verifiziert.
- **Sachverhalt-Gliederung** (`lib/rechtsprechung/sachverhalt.ts`): Monolith→Buchstaben-Abschnitte. §1-sicher: Sub-Marker `Gross.Klein` (A.a/B.b) + Top-Marker A./B./C. NUR satz-initial+sequenzvalidiert (Namen „Spital B."/„Dr. B." ausgeschlossen); sonst bereinigter Fallback-Block. ~253/258 BGE gegliedert, Seiten-Rauschen entfernt, wortinvariant-modulo-Rauschen (0 Drift), idempotent. **2 Bug-Check-MAJORs gefixt:** (1) Blind-Trim löschte Schluss-Namen; (2) Abkürzungs-/Initialen-Punkt („Dr. B.") als Satzende → Namens-Fehlsplit (151_II_625). EntscheidBody: Buchstaben-Label je Absatz.
- **Doppeltes „Regeste"** (`register.ts`): führende Quell-Überschrift (auch „Regeste a"/FR/IT, nbsp) gestrippt; Manifest-`regesteKurz` offline aufgefrischt.
- **Listen-Zeile** (`EntscheidZeile.tsx`): Datum links · BGE-Nr als Bezeichnung · Regeste-Normen als klickbare Chips · Rechtsgebiet. **Sortier-Select** verbreitert. **Reader:** „massgebliche Fassung" oben.
- **Lesemodus** (`EntscheidLeser.tsx`): ablenkungsfreies Vollbild-Overlay (reuse EntscheidBody/Regeste, §3/§5); a11y role=dialog/Fokus-Falle/Fokus-Restore/ESC/Scroll-Lock, keine doppelten id.
- **Fahrplan** `FAHRPLAN-ENTSCHEIDSUCHE-AUSBAU.md` (P1–P6, von Fork erstellt) — entscheidsuche voll ausschöpfen.
- **Offen:** F = `152_I_105` Erwägungen kaputt extrahiert (frz., E.1–3 fehlen, Fragment) — braucht Re-Fetch dieses Entscheids. C = Startseite-Fristenrechner (Kalender/Defaults/Kachelhöhe) bewusst „für später" (Task). Davids fachliche Abnahme.

## Session 24.6.2026 — BGE-DETAILANSICHT einheitlicher Kopf + Rubrum-Daten-Reparatur (ultracode, in `main`, PROD-DEPLOY)

Auftrag David (ultracode): Detailseiten der Bundesgerichtsentscheide (`/rechtsprechung/:key`) einheitlich/übersichtlich darstellen, mit **Regeln, die auch für künftige Entscheide gelten**; zusätzlich entscheidsuche-mcp nutzbar machen durchdenken. Isolierter Worktree (§12). Plan + Befunde: `FAHRPLAN-BGE-DARSTELLUNG-EINHEITLICH.md` + `bibliothek/rechtsprechung/rubrum-darstellung-regelwerk.md`. Gate grün (tsc/lint/Tests/**golden byte-gleich**), Playwright hell/dunkel/desktop/mobil über 4 Repro-Entscheide 0 Konsolenfehler, adversarialer Bug-Check (4 Lupen → Verifikation: 4/5 widerlegt, 1 MINOR gefixt). **In `main` (FF `0c91558..0d611d8`, lokaler main der Parallel-Session unberührt §12) + PROD-DEPLOY 24.6.2026** (sauberer /tmp-HEAD-Worktree §12.3, `dpl_CDwEPyyfCuJWfuf66gDfkobVn15i`, lexmetrik.vercel.app READY): Kernrouten + `/rechtsprechung` + `/gesetze` + beide Register-JSONs HTTP 200; Beleg live `152_III_92` rubrum=null (Garbage weg, Regeste trägt Thema).
- **Problem:** Der Rubrum-Block war ein *separater*, rein datengetriebener Block nach dem Kopf → 9 Erscheinungsformen, 47 % ohne Block («mal Loch, mal nicht»).
- **Einheitlicher Kopf** (`src/lib/rechtsprechung/kopf.ts` NEU, rein/§3; Reader rendert nur): Identität immer (Gericht·Abteilung·Sachgebiet·Zitierung·Datum·Badges) → genau EINE Thema-Aussage (Rubrum-Gegenstand ODER Regeste-Box ODER, wenn beides fehlt, abgeleitete `synthThema`-Leitzeile, ehrlich markiert §8) → plausible Rubrum-Zeilen im selben Kopf (feste Reihenfolge). `synthThema` auf Interface `ThemaFelder` gelockert (SSoT §5, kein Cast-Bug). Mehrsprachige Labels/Marker de/fr/it (zukunftsfest).
- **⭐ Daten-Reparatur (entscheidsuche-Cross-Check, §7):** Cross-Check deckte auf, dass **alle 178 gespeicherten Rubrum-Felder Falsch-Positive** waren (Erwägungs-/Satzmitten-Fragmente, die der alte `extrahiereRubrum` aus Body-Text griff). Deterministisches `rubrumFeldPlausibel` (`rubrum.ts` NEU, SSoT) verwirft sie (leer/zu lang/Kleinbuchstabe-Beginn `\p{Ll}`/Erwägungs-Marker), eingesetzt in Anzeige + Live-Extraktion + Offline-Reiniger (`rubrum-bereinigen.ts`). **178 Felder in 140 Snapshots genullt** (nur `rubrum`, nicht sha/Erwägungen → Wort-Invariante + `check:entscheide` grün). Reader zeigt für diese Entscheide nun einheitlich die amtliche Regeste statt falscher Zeilen.
- **§1-Abweichung von Davids Option-B-Wahl (offengelegt §7):** «Extraktion härten + Korpus neu ableiten» → narrative Vorinstanz-Anreicherung VERWORFEN, weil ein Regex das *erste* «Gericht vom Datum» im Sachverhalt greift = oft ein zitiertes Präjudiz, nicht die Vorinstanz (Gegenbeispiel `152_III_92` → Gericht von 2000 für 2025er BGE). Lieber kein Feld als ein falsches. Die Display-Vereinheitlichung löst «einheitlich» bereits vollständig.
- **entscheidsuche-mcp** (`https://mcp.entscheidsuche.ch/mcp`, stateless, keine Auth): als Cross-Check genutzt; Nutzbarmachung (Live-Volltextsuche über ganzen CH-Korpus / Breiten-Ingestion / Norm-Verzahnung / News) als Teil B im Fahrplan dokumentiert, **separat umzusetzen** (§7-API-Vertrag + Davids Freigabe).
- **Offen:** Davids fachliche Abnahme + Deploy-Entscheid (§9); Rubrum-Zeilen/Leitzeile bleiben für den de-Bestand leer (greifen automatisch für künftige fr/it/BGer-Importe).

## Session 24.6.2026 — REVIEW-DURCHGANG David: 13 UI/Daten-Punkte + BGE-Darstellung vereinheitlicht (in `main`, PROD-DEPLOY)

Live-Durchgang Davids über die Prod → 13 Punkte, der Reihe nach abgearbeitet (Plan: `FAHRPLAN-REVIEW-DURCHGANG-2026-06-24.md`). Eigener Branch (§12, parallele UI-WELLE-Session lief gleichzeitig — deren Mobile-Fix `aaba6f2` ist als Vorfahr enthalten, NICHT angefasst). **Gate grün** (tsc/lint/2480+ Tests/build/**golden byte-gleich** → keine Rechtslogik berührt, §3) + **Playwright-Sweep hell/dunkel/desktop/mobil: 0 Konsolenfehler**. In `main` gemergt + gepusht (`main` ↔ `origin/main` synchron). **PROD-DEPLOY 24.6.2026** (HEAD `da8524f`, sauberer /tmp-HEAD-Worktree §12.3, `dpl_Dzdq5PpCXvXTyFwnjvwBb4hkWymR`, lexmetrik.vercel.app READY): Asset-Hashes live==lokal byte-gleich; Nachkontrolle Kernrouten + `/rechtsprechung` + `/gesetze` + beide Register-JSONs HTTP 200.
- **#2 ⭐ BGE-Darstellung vereinheitlicht (ultracode)**: reine, deterministische `normalisiereErwaegung` (SSoT, `scripts/normtext/erwaegung-normalisieren.ts`) setzt marke/tiefe robust; `markenPlausibel` REPARIERT (alte Start-bei-1/2- & Sprung≥3-Heuristik entwertete 168 genuine BGE — neu nur Jahr-/Monats-/Nicht-monoton-/>60-Fehlmarken verworfen). In `mappeEntscheidOCL` verdrahtet → künftige Importe einheitlich. **Bestands-Korpus per Live-Re-Fetch** (`refetch-bestand-netz.ts`: decision_id über OCL-Suche aufgelöst — zwei ID-Schemata `bge_152 III 92`/`bge_BGE_150_III_137`; GRAFTET nur Erwägungen, übrige Felder unangetastet; Wort-Invariante je Entscheid = Tor, 0 Drift): **marke-Abdeckung 34 %→91 %** (104→261 Entscheide strukturiert). Adversarialer Bug-Check fand 2 MAJOR (Number('')===0-Phantom-Top-0 + Monolith-Fabrikation) → behoben + Regressionstests.
- **#1 Zukunfts-Datum** `gr_gerichte_ZR12024196` (datum 2026-06-26 > Abruf) raus; `mappeEntscheidOCL`-Wächter für künftige Importe (+ Test). 295→294 Entscheide.
- **#3** Sortier-Select (Rechtsprechung) shrink-0 + min-w → nicht mehr abgeschnitten. **#4** Sidebar `istAktiv`: jeder Query-Diskriminator muss passen (Klick auf einen Kanton/Sachgebiet markierte vorher ALLE). **#13** römische Rubrik-Marker (IV/V/VI) entfernt.
- **Startseite #5/#6/#10**: Reihenfolge Suche→Rechnen→**Gesetze-Rubrik (neu: Suchfeld + Top-Erlasse)**→News; «Weiter wo du warst» raus (+ toten Verlauf-Teilbaum getilgt). **#7/#8** Fristen-Kalender = reine Visualisierung des Formular-Resultats (keine Doppel-Eingaben mehr). **#9** BGer-News per Klick durchblättern.
- **#11** Gesetz-Detail «Passende Werkzeuge»/«BGE zu diesem Erlass» einklappbar. **#12** Tab-Streifen per Drag-and-Drop sortierbar.



Auftrag David (10 UI-Kommentare, autonom durchgearbeitet «bis alles durch ist», inkl. Push+Deploy autorisiert). Vier Wellen + Bug-Checks, alles golden byte-identisch (187 Fälle → keine Rechtslogik berührt, §1/§3), gate-grün. In eigenem Worktree (§12, parallele BGE-Session lief im main-Arbeitsverzeichnis — NICHT angefasst). **In main gemergt (FF push origin HEAD:main, lokaler dirty main unberührt) + PROD-DEPLOY** (Commit `28f3334`, `dpl_EczNVwSJBbHNh6WbAmXLDZMzA3TX`, lexmetrik.vercel.app READY; Kernrouten + `/rechner`+`/vorlagen`+Register-JSONs HTTP 200).
- **W1 Shell** (`9fc3bd1`): Sidebar ohne Anzahl-Badges (`anzahl` ganz raus) + ohne Such-Schnellaktion (`lexmetrik:fokus-suche` getilgt); **einklappbar + breitenverstellbar** (`useSeitenleiste.ts` localStorage, Topbar-Schalter + Ziehgriff role=separator); **Header-Dropdown-Suche überall** (`HeaderSuche` + geteilte `suche/useUniversalSuche`+`SuchResultate`, kein `?q=`-Umweg mehr).
- **W2 Rubriken** (`55430de`): `/recherche` aufgelöst → Redirect `/rechner`; eigene Übersichten **`/rechner`** (3 Sektionen) + **`/vorlagen`** (5 Dok-Gruppen) via wiederverwendeter `KategorieSektion`; toter Code raus (Deckblatt/TrefferZeile/Katalog-Wrapper/kachelDirektlinks); Kategorie-Helfer in `lib/katalogKategorie.ts`; Routenzahl 54→55.
- **W3 Startseite** (`b88768c`): **News-Header** (`NewsHeader.tsx`, neueste BGer aus Rechtsprechungs-Register; Live-Augmentierung bewusst offen — braucht verifizierten API-Vertrag §7); Hero teilt Dropdown mit Header; **Gebühren-Tab schlank** (Notariats-Vollform raus → `NotariatGrundbuchForm minimal` = Grundstückkauf Kanton+Kaufpreis, Verweis auf Voll-Rechner; Segment-Buttons); **Fristen-Kalender** (`FristenKalender.tsx`, Monatsansicht über `berechneAllgemeineFrist` — dieselbe Engine).
- **W4 Responsive + Tabs** (`3bbf644`+`ad11e8d`, Ultracode): Audit 9 Routen×6 Breakpoints → Multi-Agenten-Plan. **Wurzel-Overflow-Fix** (Werkzeuge-Grid `grid-cols-1` — war VORBESTEHEND rot, jetzt grün) + Zeiterfassung/Rechtsprechung/Kalender-Politur. **In-App-Tab-Streifen v1** (`lib/tabs.ts` localStorage SSoT + `TabStreifen`/`TabTracker`/`useTabs`): mehrere Engines/Gesetze offen, Wechsel ohne Browser-Tab; Guard <2 Reiter→null (prerender byte-gleich, Streifen NICHT im HTML); navigationsbasiert (persistiert Reiter-LISTE, nicht Formular-State — Keep-Alive/Splitscreen = Stufe B).
- **Bug-Checks**: nach W1–W3 (`08247ff`) adversariale 3-Agenten-Runde fand 2 echte a11y-Tor-Brecher (`aria-expanded` am Such-Input; News/Kalender-Kontrast Dunkelmodus) + Mobil-Overflow-Regression → alle gefixt; nach W4 erneut. **Verbleibend rot (vorbestehend, auf main identisch, NICHT dieses Delta):** a11y-Reader BS-640.100 (Tariftabellen-Scrollregion, Gesetze-Domäne).
- **Tore**: tsc/lint/**2425 Tests**/build(55 Routen)/**golden byte-gleich**; Playwright hell+dunkel+mobil 375px über alle Wellen, 0 Konsolenfehler. **Offen**: Davids fachliche Sicht; Stufe-B-Tabs (Keep-Alive/Splitscreen); News-Live-Quelle; pre-existing 11px-Overflow `/rechner/verzugszins`@375 (Rechner-Forms-Domäne).

## Session 23.6.2026 — STARTSEITE-ÜBERARBEITUNG: Universal-Suche + Verlauf + Sidebar-Angleich (main, PROD-Deploy)

Auftrag David: Startseite nützlicher + schöner, Seitenleiste angleichen (Ultracode-Plan → umgesetzt). Design-Workflow (4 Konzepte → Jury → Synthese); alles im gesperrten Papier/Tinte/Messing-System, gate-grün (golden byte-gleich → keine Rechtslogik berührt, §1/§3).
- **Universal-Suche** (`src/components/start/UniversalSuche.tsx` + reiner Aggregator `src/lib/universalSuche.ts`): EIN Feld über Rechner+Vorlagen (`katalogSuche`), Fristen-Presets (`presetSuche`), Gesetze (`normtext/browse` `filtern`) und Rechtsprechung (`filterEntscheide`) — gruppiert, gekappt 6 + «alle zeigen». Bündelt nur bestehende Such-/Filter-Funktionen (§5); schwere Daten (Register/Preset-Index) **erst beim ersten Tastendruck lazy** (Start-Chunk schlank verifiziert).
- **«Weiter wo du warst»-Verlauf** (`src/lib/verlauf.ts` SSoT localStorage `lexmetrik-verlauf` + `verlaufLabel.ts` Resolver + `VerlaufTracker.tsx` in App.tsx): Chips zurück zum zuletzt Geöffneten. Label aus Manifesten (Gesetz→Kürzel, Entscheid→Zitierung), nie Rohpfad; KEIN `document.title`-Hack. Speichert nur Pfad+Label, nie Suchbegriffe/Formularinhalte (Berufsgeheimnis) + Löschknopf. Kein `Date.now()` in src/lib (§2 — Reihenfolge per Array-Position).
- **Verschlankt**: Favoriten+Zeiterfassung zu zweispaltiger «Werkzeuge»-Zeile; Schnellrechner bleibt sichtbar (Rechner-zuerst). Kopf-Absatz auf einen Satz.
- **Seitenleiste angeglichen** (`Sidebar.tsx`): «Suchen /»-Schnellaktion oben (fokussiert globale Topbar-Suche via Event `lexmetrik:fokus-suche` in `HeaderSuche.tsx`; **füllt die fehlende Suche in der Mobil-Schublade**), Kopf-Block per Haarlinie abgesetzt. `HeaderSuche` auf `/` neutralisiert → Hero-Suche besitzt `?q=` allein (deklarierte Änderung §6.3, `katalog.test.tsx` aktualisiert).
- **Verifiziert** (Playwright Bash, hell+dunkel+mobil 375px): Lazy-Loading (0 Daten-Fetch vor Tastendruck), SSR/Hydration 0 Warnungen mit vorbefülltem Verlauf, kein Mobil-Autofokus. 19 neue Unit-Tests. Offen (Backlog, bewusst verschoben): Stichtage-Widget aus Verfallsregister (braucht ISO-Strukturierung).
- **§9-Bug-Check** (2 unabhängige Lupen über das Delta): kein BLOCKER; ein §8-Befund gefixt (`85db3cf`: Preset-«alle N» ehrlich gezählt, irreführenden Tagerechner-Link entfernt). Lupe-Erkenntnis: App **hydratisiert nicht** (`main.tsx` createRoot render-then-replace) → Hydration-Mismatch-Klasse gegenstandslos.
- **PROD-DEPLOY 23.6.2026** (Commits `77c5aa3` + `85db3cf`, sauberer /tmp-HEAD-Worktree §12.3): `dpl_H7yq4NAFxuvwMmrEdAFA8FXdqDmE`, lexmetrik.vercel.app READY. Nachkontrolle: Kernrouten + `/normtext/register.json` + `/rechtsprechung/register.json` HTTP 200; Live-Suche interaktiv verifiziert (Lazy-Fetch erst beim Tastendruck). **Zu origin gepusht** (main synchron).
- **a11y/CI-Aufräumen**: e2e-a11y-Tor war rot durch einen **obsoleten** Startseiten-Test («offenem Register-Panel» klickte einen `/öffnen$/`-Button, den «/» seit V2 nicht hat). Repurposed → prüft jetzt die offene Universal-Suche (axe-sauber). Mein Delta verursacht **0** a11y-Verstösse (basis-Startseite + alle Rechner/Vorlagen grün). **Verbleibend rot (vorbestehend, NICHT mein Bereich):** `Gesetze — Reader BS-640.100` `scrollable-region-focusable` (BS-Tariftabelle ohne Tastaturzugriff) — Gesetze/BS-Domäne, gehört dorthin gefixt.
## Session 23.6.2026 — RECHTSPRECHUNG-ÜBERSICHT neu gestaltet (Scent-first) + ink-800-Token-Fix (main, PROD-Deploy)

Auftrag David (ultracode): UI der Rubrik `/rechtsprechung` fundamental verbessern — Ziel «maximale Nützlichkeit + Übersichtlichkeit». Multi-Agenten-Workflow (3 Konzepte → adversariale Juroren → Synthese), dann umgesetzt + Playwright-verifiziert (Desktop/Mobil, Liste/Karten, Norm-Filter, Dark), gate-grün, golden byte-gleich.
- **Übersicht (`Rechtsprechung.tsx` + Komponenten)**: Karte/Zeile führt jetzt mit dem **Thema** (Regeste, sonst deterministische Synth-Sachzeile aus Gebiet+Gericht+Normen, §8-ehrlich mit «ohne amtl. Regeste»-Marker — keine toten Karten mehr; 0/75 BGE-Ref, 26/75 ohne Regeste), Aktenzeichen gedämpft. Default = scanbare **Listenansicht** (+ Karten-Dichte, localStorage). **Sachgebiets-Rail** (kontrastreich, zählend) als einzige Sachgebiet-Steuerung (Select-Doppel weg; mobil Chip-Band). Schlanke Sticky-Toolbar (Suche+Sortierung+Dichte) + zugeklapptes «Erweiterte Filter» + entfernbare Aktiv-Filter-Chips. **Leitentscheide** priorisiert (Default-Sort relevanz + eigene Sektion). **Norm-Verzahnung**: normKeys als klickbare Chips (`?norm=`) + Kontextstreifen «Rechtsprechung zu X». Ebene-Segment Bund↔Kantone.
- **§3 gewahrt**: alle Sortier-/Filter-/Synth-Helfer rein in `lib/rechtsprechung/browse.ts` (themaText/synthThema/istSynth/nachRelevanz/nachGericht/sortiere/gruppiereNachLeit/zaehleSachgebiete/normHaeufigkeit/filterEntscheide(+norm,+ebene)/normLabel), 20 Unit-Tests (Determinismus/key-Tiebreak). Toter `gruppiereNachSachgebiet`/`SachgebietGruppe` entfernt.
- **Bug-Check (ultracode, 16 Agenten, adversarial verifiziert)**: neuer Code sauber; einziger realer Fund = **vorbestehender Token-Bug `ink-800` nie definiert** (Skala sprang 700→900, 53 Stellen in 16 Dateien fielen auf geerbte Farbe zurück — sichtbar falsch nur in Links). **Fix**: `ink-800` in `tailwind.config.js` + beide Themes in `index.css` ergänzt (Light `#2A2A25`, Dark `#DFD9CB`, je echter Mittelwert 700↔900); behebt alle 53 auf einmal, logikfrei. Verifiziert Gesetze/Leser hell+dunkel.

## Session 23.6.2026 — BS-VORBILDKANTON: Vollimport + Darstellung + 2× Ultra-Check + Rechtsprechung-Merge (main, PROD-Deploy)

Auftrag David: Gesetze ausbauen (freie Wahl) → BS als Vorbildkanton «beste Gesetzesseite im Netz». Abgearbeitet, alles auf `main`, gate-grün, render-verifiziert:
- **Retry-Härtung** `scripts/normtext/netz-retry.ts` (fetch Timeout+Wiederholung) → behob GR-ETIMEDOUT-Discovery-Crash; `enumeriereKanton` verdrahtet (Tests). **Kantons-Tier-Karte** (`bibliothek/recherche/kantons-tier-karte.md`): 19 Kantone voll Tier A.
- **BS-Vollimport** 910→859 Erlasse (17'688 Artikel-Snapshots, 0 Fetch-Fehler).
- **Darstellung** (`Gesetze.tsx`): Kanton-Ansicht nach amtlicher clex-Systematik (`kanton-systematik.json`, Generator `kanton-systematik-run.ts`), 2-Ebenen-Akkordeon (Top-Sachgebiet + Untergruppe), Längster-Präfix-Match `sachgruppe()` (handhabt AI-Hunderter/UR/ZG/Gemeinderecht-Namespace `BaB#…`); überlaufsichere Zeilen.
- **Cluster A** (Extraktor `adapter-lexwork.ts`, korpusweit): aufgehobene Artikel/lit. nicht mehr verschluckt (§-Reihe lückenlos, «aufgehoben»), `paragraph_post`, Randtitel (`titel`-Feld), S9 Titel-Heilung, S5 Gemeinderecht 162/162. Fix: `main()`-Guard (`!process.env.VITEST`).
- **Cluster B**: WCAG-Kontrast, Artikelzahl+Stand, Suche-auf-Kanton, Karte schlanker, Mobile, Reader-Sachgebiet, axe-Tor; Bund-`standardOffen` wiederhergestellt.
- **2× Ultracode-Audit** (je ~50 Agenten, adversarial): `FAHRPLAN-BS-VORBILDKANTON.md`. → **C1** Tarif-Tabellen (StG-Steuertarife jetzt Tabellen), HTML-Entities (≥/≤ Schwellen), Titel, IWB, Absatz-Marker. → **C2** Gliederung/TOC: `struktur-kanton-run.ts --kanton`-Filter; BS-Sidecars 5→849 (StG 312 TOC-Knoten). C3 (Kopf-Suche/§-Links/«SR»-Label) = offener Backlog im FAHRPLAN.
- **Rechtsprechung gemergt** (`merge ad009b8`, Branch `worktree-rechtsprechung-p0`): P0–P2 BGer+kantonale Rubrik, eigener Baum `public/rechtsprechung/`+`src/lib/rechtsprechung/`, Norm↔Entscheid-Verzahnung im Reader (golden-schonend; einziger Konflikt GesetzLeser.tsx additiv gelöst).

Memorys ergänzt: `regelmaessig-aufraeumen`. Offen (Backlog): C3-Reader/Suche-Feinschliff; weitere Kantone (Tier-A-Pipeline steht); GL/LU-Sondersystematik beim Import.

## Session 23.6.2026 — RECHTSPRECHUNG-INTEGRATION: Machbarkeit + konsolidierter Fahrplan (jetzt IMPLEMENTIERT + via ad009b8 in main/Prod)

Auftrag David: untersuchen, wie einfach Bundesgerichtsentscheide/Entscheid-DBs in
LexMetrik integrierbar wären → dann konkreter Umsetzungs-Fahrplan (ultracode), mit
2 geschärften Zielen: **(1) bessere Übersicht als entscheidsuche.ch**, **(2) Kantone
von Anfang an mittragen**. Ergebnis als aktive Direktive verankert.

**Geliefert: `FAHRPLAN-RECHTSPRECHUNG.md`** (Multi-Agenten-Workflow: Live-Recon →
5 Design-Stränge → adversariale Review → Synthese). Reiner Plan — nichts gebaut,
nichts deployt (§9). Kernpunkte:
- **Verdikt:** Datenpfad technisch günstig (OCL liefert Struktur/Regeste/Citations als
  JSON, kein Browser/OCR; CORS offen, kein Auth, Daten CC0). Eigentlicher Aufwand =
  Kuratierung (Sachgebiet/Leitentscheid), Excerpt-Auflösung, Verzahnungs-Veredelung.
- **Quellen:** OpenCaseLaw (`mcp.opencaselaw.ch/api`) primär, entscheidsuche.ch
  Fallback; HF-Parquet `voilaj/swiss-caselaw` (CC0) als Backfill. Recht = **Art. 5 URG**
  (Urteilstext gemeinfrei; Regeste Graustufe; keine De-Anonymisierung).
- **Architektur-Kernentscheid (golden-schonend):** eigener Baum `public/rechtsprechung/`
  + `src/lib/rechtsprechung/`, NICHT ins Gesetzes-Register quetschen — `baueBrowseManifest`
  scannt nur `bund/`+`kanton/`, also bleiben alle Gesetzes-Snapshots/Typen byte-gleich.
  Eigener Inhaltstyp (`gericht`+`kanton`, Bund=`'CH'`), **zwei Status-Achsen** `bestand`
  (snapshot/nur-live-link) × `kuratierung` (maschinell/geprüft, Default maschinell), eigene
  `sha256EntscheidBloecke`, Route `/rechtsprechung`, Flag `--nur=entscheide`.
- **Burggraben:** Norm↔Entscheid↔Werkzeug build-time deterministisch (norm-index.json aus
  `statutes[]`; «Rechtsprechung zu Art. X» im GesetzLeser; `NormText` 1:1 wiederverwendet).
- **Etappen:** P0 Fundament + ~50–150 BGE-Leitentscheide (OHNE Davids Fachzeit, gemeinfreier
  Text) → P1 Verzahnung breit + Regeste-Index → P2 jüngste aza + Suche → P3+ Kantone.
- **Top-Risiken:** R2 `statutes`-Qualität (Burggraben-Achillesferse, nie «verifiziert»),
  R3 **GELÖST (Preflight 23.6.: entscheidsuche `_search.php` CORS offen — OPTIONS→200
  allow-origin:* , POST liefert ES-JSON ~18ms; OCL /courts+/atom ebenfalls offen → Live-
  Volltextsuche im statischen FE baubar, kein Backend)**, R4 `/structure` Bund-only (Kanton-
  Reader einfacher), R5 Excerpt-Request-Last zwingt P0 klein, R7 Regeste-Lizenz nicht zweifelsfrei.

**Pass zu Direktiven:** dient Ausbau-Direktive (Burggraben) + respektiert Abnahme-
Zeitsperre (P0/P1 ohne Fachzeit via `kuratierung:'maschinell'`; Präjudiz-Veredelung in
Fristen-Warteschlange). **Offen/nächster Schritt:** Entscheid (a) STRUKTUR/Memory verankern
[erledigt], (b) CORS/API-Live-Preflight (R3) als Proof, (c) P0 starten. Zeilen-Anker im
Fahrplan gegen Code 23.6. verifiziert, beim Bau via Tore nochmals bestätigen.

## Session 23.6.2026 — Gesetze-Import 3-Tier: Discovery + Confidence + AR-Vollkorpus (main `aac411a` → PROD-DEPLOY, lexmetrik.vercel.app, dpl_5EKAuYZG)

Auftrag David: alle kantonalen Gesetze sauber + klickbar abbilden OHNE jedes einzeln zu prüfen,
besser als reines PDF. Vorarbeit: Reverse-Engineering lexfind.ch + clex/LexWork-APIs (Memory
`lexfind-clex-quelle-strategie`, Recherche-Workflow). Plan: `FAHRPLAN-GESETZE-IMPORT-3TIER.md`.

**Phase 0 bewiesen (live):** clex `/api/{lang}/texts_of_law/{sn}` liefert getypten Body
(`xhtml_tol` bzw. `show_as_json.json_content` mit `uid`-Ankern + separaten Fussnoten/`law_link`).
clex *ist* LexWork/Sitrox → der **bestehende `adapter-lexwork.ts` erschliesst clex-Kantone ohne
neuen Parser** (§10). Tier-A-Pilot AR 146.1: 35 Artikel sauber, Confidence 1.000. Discovery AR:
331 Erlasse in Kraft, ALLE Tier A.

**Gebaut + getestet (rein §2, Gate grün):**
- `scripts/normtext/confidence-logik.ts` (Treue-Invarianten + Kreuzdiff-Normalform + Token-Recall
  + Confidence-Score) — `src/tests/normtext-confidence.test.ts` (20).
- `scripts/normtext/lexfind-discovery.ts` (LexFind-Enumeration + Host→Tier-Klassifikation +
  clex-URL-Ableitung) — `src/tests/normtext-lexfind-discovery.test.ts` (7).
- Recherche `bibliothek/recherche/lexfind-clex-quellen.md` (+ INDEX, §11).
- Generator `--discovery`: `scripts/normtext/kanton-discovery-quellen.ts` (Routing Discovery→
  KantonInventarGruppe) + `erzeugeKantonsSnapshots(inventarOverride)` in normtext-snapshot.ts.

**Bug-Check (2 adversariale Review-Agenten):** kritische Befunde behoben — Kreuzdiff-Tausender-
trenner vor NFKC (Falsch-Vetos), Mojibake Ö/™/ß/â€, verklebter-token nur Ziffer/camelCase;
Discovery host-AGNOSTISCH über Pfad-Signatur (verfehlte ~10 LexWork-Hosts) + .ch-Grenze; Decode;
Pagination/Validierung. 40 Tests grün.

**Phase 1 AUSGEFÜHRT für AR:** `npm run normtext -- --nur=kanton --kanton=AR --discovery` →
**266 Gesetze / 6327 Artikel** strukturiert (Tier A, bestehender adapter-lexwork), 0 Fetch-Fehler.
Register 150→491 Erlasse. Confidence: 410/412 Auto-Akzept (100%), 2 Quarantäne. Status entwurf
(§8). Gate grün. Ehrliches Verdikt unverändert: ~25–40 % Rest-Review über alle Tiers (kein 0-Check).

**Bund-Volltext-Ausbau (main 3997635):** PartG (42 Art.) + JStG (45 Art.) aus nur-live-link-Stubs
zu Volltext promoviert. **Dann PERFEKTIONIERT (main 3cd3bc9):** Fedlex-Extraktor-Fix
(extrahiere-fedlex.ts) erkennt nun (a) plain `<p><sup>N>` ohne absatz-Klasse, (b) Intro-/Label-`<p>`
vor `<dl>` (Einzel-`<p>`-Schranke), (c) Suffixe bis/ter/quater/quinquies. Behebt 3 Bug-Klassen
älterer Konsolidierungen (verlorene Intros, Ganztext-Fallback, wegfallende Nbis-Absätze). Damit
**5 neue Volltexte** (PartG/JStG/IPRG/BetmG/VStrR) + **35 Bund-Gesetze verbessert & adversarial
verifiziert** (2 Agenten): Kronjuwelen OR/ZGB/StGB/BV reine Label-Verbesserung (Text-Recall
OLD⊇NEW=1.0000, kein Verlust); ältere Erlasse Fussnoten-gestrippt/strukturiert, 11 bis/ter-Absätze
restauriert (VwVG 20/2bis Zustellfiktion etc.); SchKG art_219 Konkursklassen korrekt. Globaler Scan:
0 fehlende Nbis-Absätze (15 Gesetze). Stubs 79→74. Confidence 415 Erlasse: 100% Auto-Akzept.

**OFFEN/Backlog:** (a) **GR-Discovery-Lauf an LexFind-`ETIMEDOUT` gecrasht** (nichts geschrieben) →
`enumeriereKanton` braucht Retry-Härtung; (b) weitere clex-Kantone (gleicher Befehl); (c)
render_mode-UI-Badge; (d) Kreuzdiff-Gate C (Netz); (e) Regressionstest für den bis/ter-Parser-Fix.
**PROD-DEPLOY 23.6.2026 (main 40f0268 → lexmetrik.vercel.app, dpl …7uwzzamp1):** AR-Korrekturen +
kompletter Bund-Ausbau live verifiziert — 40 Bund-Volltexte (IPRG 236/PartG 42/JStG 45/BetmG 70/
VStrR 109 Art.), Asset-Hash live=lokal, Kernrouten 200.

**Bund Batch 2 (PROD-DEPLOY 23.6.2026, dpl …81ledgjhy):** +10 Volltexte (ATSG/BVG/UVG/AVIG/RPG/USG/VGG/BGFA/KKG/GwG) → 50 Bund-Volltexte. LEKTION: ELI-Resolver liefert teils VERALTETE Konsolidierungen — `check:fedlex-versionen` ist das maßgebliche §7-Currency-Gate; es fing 6 Stale-Pins ab (BVG/RPG/VGG/GwG + die bereits deployten IPRG/VStrR), alle re-gepinnt auf geltend. Test-Fixture «unbekanntes Gesetz» ATSG→ZZG.

**Bund Batch 3 (PROD-DEPLOY 23.6.2026, dpl …3ss9uueqt):** +8 Volltexte (IVG/FamZG/StHG/AIG/AsylG/GlG/FINMAG/BGBB) → 58 Bund-Volltexte, Stubs 64→56. Currency-Gate fing 4 Stale-Pins (IVG/StHG/AIG/AsylG → geltend re-gepinnt). 7 Stubs (AHVG/ELG/GSchG/EnG/BankG/HMG/EpG) zurückgestellt: Resolver-Datum ohne Filestore-HTML → separate Konsolidierungs-Recherche nötig.

**Bund Batch 4 (main e91aca2, NOCH NICHT in Prod):** +3 Volltexte AHVG (169 Art.)/BankG (109)/HMG (141) → **61 Bund-Volltexte**. Korrektes Konsolidierungsdatum per Filestore-INHALTS-Sonde (ELI-Resolver lag grob daneben: AHVG 2019→2026, BankG 2011→2024, HMG 2019→2025). VERBLEIBEND zurückgestellt (4): ELG/GSchG/EnG/EpG — Fedlex serviert nur SPA-Shell, kein Filestore-Inhalts-HTML → bleiben nur-live-link (§8). Bund-Volltext-Bilanz Session: 35→61.

**Bug-Check + Extraktor-Fix (main c410e1d, NOCH NICHT in Prod):** 2 Agenten prüften die 26 neuen Gesetze wort-für-wort gg. Fedlex → 3 substanzielle Klassen gefunden+behoben (extrahiere-fedlex.ts, wirkt korpusweit/52 Gesetze): (1) `<table>` wurde gedroppt → jetzt mehrspaltig (17 Tabellen zurück, inkl. IVG-Renten-/DBG-Steuertarif, inhaltlich verifiziert); (2) Footnote-/Aufhebungs-Leak (auch OR/ZGB/StGB latent!) → <div class=footnotes>+<h6> vor Fallback gestrippt, aufgehobene Art.→«…»; (3) BANKG <inl><sup>-Absätze. Kronjuwelen-Agent: reine Verbesserung, kein Normtext-Verlust. PROD: AR + Bund Batch 1–4 sind live (dpl …8nqzbuamw); der Extraktor-Fix korrigiert die in Prod noch vorhandenen Tabellen-/Leak-Bugs — Deploy ausstehend. PROD-DEPLOY des Fix 23.6.2026 (dpl …doxo4brxq, IVG-Rententabelle u.a. live verifiziert). **Bug-Check Runde 2** (24 weitere geänderte Gesetze, 2 Agenten): ALLE treu/reine Verbesserung — kein Normtext-Verlust, KVV-Art-98- & GebV_SchKG-Tabellen zahlentreu, mehrere Alt-Garbles (SchKG 301a-d, VVG 25-27) repariert. **Gesamter Bund-Korpus (61 Gesetze) maschinell + adversarial verifiziert.** Nicht-substanziell offen (pre-existing, kein Regress): verschachtelte Unterlisten flach + SchKG art_219 «Dritte Klasse»-Inline-Label fehlt.

## Session 22.6.2026 — KORPUS-REVIEW aller Gesetze + systemische Render-Fixes (main, PROD-DEPLOY 5ed0e0a, lexmetrik.vercel.app)

Auftrag David: alle bestehenden Gesetze (Bund + Kantone) EINZELN reviewen (1 Agent/Gesetz),
Ultra-Aufwand, KEINE Downloads, alles stimmig/lesbar («nichts abgeschnitten/falsch benannt/
problematisch»). Werkzeug-Lektion: Playwright ist im Repo (`e2e/`, `@axe-core/playwright`) →
UI-Checks via Bash, nicht MCP (5s-Cap). Memorys: `werkzeuge-zuerst-pruefen`,
`lexmetrik-gesetze-rendering-lektionen`, `lesbarkeit-formatierung`, `immer-logik-bugcheck`.

**Korpus-Review:** Workflow, 150 Gesetze (35 Bund-Volltext + 115 Kanton; 79 Bund = Live-Link-
Stubs), je 1 Agent → 92 sauber, 58 mit Befunden. Klassen: fussnoten-leak 103, leerer/kaputter
Artikel 68, untableisierter-tarif 22, zerrissenes-Wort 16, Label/Stand 5, versch.-Zahlen 3.

**Behoben + deployt (display-layer, ohne Download) — alles live verifiziert:**
- **Fussnoten-/Änderungshistorie-Leak (103)**: `trenneAenderungshistorie` (darstellung.ts)
  erweitert (1–3 Fussnoten-Nummern vor Aufgehoben/Eingefügt/Fassung gemäss). Korpus 32'280
  Blöcke → Rest 2 (beide legitim «in der Fassung gemäss» mit Wort davor). DBG live = 0.
- **Falsches «aufgehoben» (232)**: ArtikelBody zeigt «aufgehoben» nur ohne items/tabelle/
  mehrspaltig (VWVG Art.1 live korrekt).
- **Tabellen links abgeschnitten**: `[text-indent:0]` auf Tabellen-Komponenten (geerbtes
  negatives text-indent aus `<p pl-9 -indent-9>` clippte 1. Zeile; scrollWidth zeigt's nicht).
- **Tausendertrenner `'`**: `gruppiereTausender` (Tabellen) + `gruppiereBetraege` (Fliesstext,
  Geld-Kontext, Jahre geschützt); Bereichs-Strich «65– 250»→«65–250».
- **ZH (3 Gesetze) + 6 LexWork-Kantone + SG + BL-331**: x-aware/·–/Füllpunkt-Tabellen, Absatz-
  Nr. wie Bund, «St PO»→«StPO». (Details Folge-Karten unten.)

**BACKLOG (braucht bewusste Download-Welle, David: keine Downloads):** 22 untableisierte
kantonale Tarife (Re-Extraktion); 68 «…»-Platzhalter/Fragmente (meist legitime Fedlex-
Auslassungen); 16 zerrissene Wörter; 3 versch. Zahlen; 5 Label/Stand; §4-Erstzeile; ZH echte
Fussnoten-Anzeige am Artikelfuss; VD-105539 («de X à Y»-Format, neuer Extraktor). Vollständig
in `FAHRPLAN-GESETZE-REVIEW.md`.

## Session 22.6.2026 — STUFE 2 Tarif-Tabellen + die 3 ZH-Gesetze «wie beim Bund» (feat/tarif-tabellen-stufe2)

Auftrag David: kantonale Gesetze Zahlen/Tabellen richtig + übersichtlich/schön
darstellen; explizit die 3 ZH-Gesetze «wirklich fertig/perfekt, wie beim Bund»
(keine Formatierungsfehler/Randziffern/abgeschnittenen Texte/falsch nummerierten
Absätze). Subagent-getrieben, je Schritt selbst-verifiziert (x-Geometrie + Quell-
Abgleich + UI desktop/mobil + adversarial). **Gate voll grün.**

**Geliefert (Branch, Commits 2bb7397..8dcd5e1):**
- **Tausendertrenner `'`** (`gruppiereTausender`, darstellung.ts): Leerzeichen-/bare-Tausender
  → Apostroph; Bereichs-Strich-Artefakt «65– 250»→«65–250». Render-Schicht (§3).
- **Mehrspalten-Tabellen** (`MehrspaltigeTabelle`, ArtikelBody): CSS-Table (inhaltsbasierte
  Spalten), mobil horizontal scrollbar (kein Clipping), Beträge rechtsbündig, Positions-Nr.
  links. Block-Feld `mehrspaltig?: {kopf?, zeilen}` additiv + Drift-SHA + Sanity-aware.
- **ZH x-aware Tarif-Extraktion** (adapter-zh-pdf, rein aus PDF-x-Geometrie, §1, kein Raten):
  ZH-215.3 §4 (3-Sp), ZH-211.11 §3 (2-Sp)/§4 (3-Sp), ZH-243 NotGebV §17-Anhang (132 Ziffer-
  Zeilen; 3740-Zeichen-Klumpen aufgelöst; Wurzelbug §17-Anhang-Grenze gefixt).
- **ZH Absatz-Nummerierung wie Bund**: erstes «1» wiederhergestellt, Streu-Fussnoten-
  Hochzahlen (z.B. ZH-243 §4 «10»/«5») verworfen, Fragmente gemerged → 0 Problem-Artikel.
- **ZH Fussnoten-Leaks weg**: Definitionen («Fassung gemäss…», «B vom…») aus allen ZH-Bodies
  gefiltert (0 Leaks); ZH-215.3 §25 trägt jetzt echten Übergangstext. (Offen/Follow-up:
  echte Fussnoten-Extraktion+Anzeige am Artikelfuss wie Bund — bewusst zurückgestellt.)
- **6 LexWork-`·`/`—`-Kantone** (Klasse A) je separat: NW-265.51/BS-154.810/SO-614.11/
  VS-173.8(de/fr)/ZG-163.4/TG-176.31 → MehrspaltigeTabelle; adversarial 0 Inhaltsverlust
  (NW-Abschnittsüberschrift-Fix). Ausschluss BL-211.71/FR-635.1.1/FR-214.5.16 (Änderungs-
  platzhalter, kein Tarif) unberührt.
- Verifikation: alle 3 ZH UI-gerendert (Tabellen/Apostrophe/Absatz-Nr/0 Konsolenfehler),
  Quell-Abgleich je Tarif, voller Gate grün (tsc/vitest 2235+/golden/lint/check inkl. vollstaendigkeit).
- **Deploy-Status:** auf `main` (98d51fc) + **PROD-DEPLOY 22.6.** (dpl_GYt53Q…, lexmetrik.vercel.app); Kernrouten + /gesetze/kanton/ZH-215.3·211.11·243 HTTP 200; ZH-243 live-verifiziert (kein Klumpen, 0 Leaks). Unbeabsichtigtes Voll-Re-Fetch des Korpus vor dem Merge verworfen (nur verifizierte ZH/LexWork-Arbeit deployt).

### Detail-Belege (Auswahl)

**Issue 1 (§1-safe): Row-11-Spaltenriss in `extrahiereZhStreitwertStaffel`**
- PDF-Stück «10 Mio. 106» (x=143.5 pt) landete x-technisch in col1 (Streitwert);
  «400» (x=181.3) in col2. Resultat: `['über 10 Mio. 106', '400', 'zuzügl. …']`.
- Fix: `mioSplit`-Post-Prozess in `scripts/normtext/adapter-zh-pdf.ts` —
  wenn col1 auf `/(.*\bMio\.)\s+(\d[\d\s]*)$/` matcht, wird der Trailing-Fragment
  an den ANFANG von col2 verschoben. Kein Zeichen geändert/erfunden, §1.
- Resultat row 11 nach Regen: `['über 10 Mio.', '106 400', 'zuzügl. 0,5% …']`.
- ZH-215.3.json regeneriert (22.6.2026), Regression-Test in `zh-streitwert-staffel.test.ts`.

**Issue 2: `gruppiereTausender` — Leerzeichen-getrennte Tausender (ZH-PDF-Stil)**
- Ergänzt in `src/lib/normtext/darstellung.ts`: Pass 1 vor dem bestehenden Pass 2
  (bare runs) — `(\d)\s(\d{3})(?=\D|$)` wiederholt bis stabil. «5 000» → «5'000»,
  «106 400» → «106'400», «über 10 Mio.» unverändert (kein 3-Ziffern-Match).
- SG-Logik (bare ≥4-stellige Läufe) unberührt.

**Issue 3: `MehrspaltigeTabelle` — `gruppiereTausender` auf ALLE Zellen**
- `src/components/normtext/ArtikelBody.tsx`: alle Zellen bekommen `gruppiereTausender`,
  nicht nur numerische. `istNumerischeZelle` steuert nur noch Rechtsbündigkeit.
- Resultat: Streitwert-Spalte «über 5 000 bis 10 000» → «über 5'000 bis 10'000».

---

## Session 22.6.2026 — KANTONALE TARIF-TABELLEN Stufe 1 (Füllpunkt-Zweispalter SG) — auf main + PROD-DEPLOY (553b2ee, dpl_DqgCNF…, lexmetrik.vercel.app)

**Deployt 22.6. nach Davids Ja + voller Verifikation** (Bug-Check alle Kantone + UI-Prüfung): SG-3849 rendert 346 saubere 2-Spalten-Tarifzeilen, 0 Konsolenfehler, Kernrouten + /gesetze/kanton/SG-3849 HTTP 200. Stufe-2-Worklist in `FAHRPLAN-TARIF-TABELLEN-STUFE2.md`.

Auftrag David: «kantonale Gesetze überarbeiten, Zahlen + Tabellen richtig darstellen.»
Gewählt: §7-sauberer Generator-Extrakt (nicht UI-Heuristik). Subagent-getrieben
(Spec + Plan unter `docs/superpowers/`), 7 Tasks, iterativer Logik+Bug-Check je Task
(Daueranweisung David) + adversarialer Schluss + finaler Whole-Branch-Review (opus,
«ready to merge»). **Geliefert (Stufe 1):**
- **Extraktion** `scripts/normtext/tarif-tabelle.ts`: Füllpunkt-Zeilen
  «Beschreibung . . . . Betrag» → `tabelle: {beschreibung, betrag}[]`. Reine,
  getestete Funktionen `betragAmAnfang`/`extrahiereTarifTabelle`. Konservativ (§1):
  Block nur Tabelle, wenn letztes Segment reiner Betrag; Reject-Guard bei
  unvollständigem Split (Betrag+Ziffer in Beschreibung) und **Betrag-ohne-Dash**
  (keine Phantom-Beträge aus Verweis-Nummern); Leader ≥3 Punkte; `vortext` immer ''
  (Intro bleibt in 1. Beschreibung — Doppelpunkt-Heuristik verworfen, §1).
- **Anreicherung** `adapter-pdf.ts`: Helper `reichereTabellen` in `baueBloecke` UND
  über ALLE Artikel in `holePdf` (idempotent) — erfasst auch die **Anhang-Ziffer-Tarife**
  (segmentiereAnhangZiffern), wo die Hauptmasse von SG-3849 liegt.
- **Schema/Drift** `typen.ts` + `sha256Bloecke`/`berechnePdfQuelleHash`: `tabelle`
  additiv im Snapshot + im Drift-SHA (§7). `pruefeInhaltsSanity` tabelle-aware.
- **UI** `ArtikelBody.tsx` `TarifTabelle`: 2-Spalten (Betrag rechtsbündig, tabular-nums)
  via Early-Return → Nicht-Tabellen-Pfad byte-identisch.
- **Daten:** SG-2808/2935/3849 regeneriert → **381 Tabellen / 413 Zeilen**, 0 leere
  Zellen, 0 Leader-Reste, 0 Inhaltsverlust. Gate grün (tsc, vitest 2085, golden, lint,
  check:normtext, smoke). Engine→Norm-Verweise lösen korrekt auf (nur Artikel-Level).
- **OFFEN / Stufe 2 (Auftrag David 22.6.):** (a) **mehrspaltige Staffeln** (Streitwert |
  Grundgebühr | Zuschlag) mit verklebten Zahl-Spalten — Befund ZH-215.3 §4 (AnwGebV),
  ZG-163.4 §3, TG-176.31 §5 («über 5000 bis 100001250»); (b) **Tausendertrenner `'`**
  in der Anzeige (zentral im Render, deckt auch SG); je Kanton einzeln prüfen.

## Session 22.6.2026 (vormittags) — Gesetze-UI-Schub + §6-Splits (PRs #37–#49 → main, HEAD 2d5aa10; Prod-Deploy NICHT bestätigt)

Mehrere Sessions am Vormittag (z.T. autonom/parallel) haben PRs #37–#49 auf
`main` gelandet. **Ehrlichkeitsvermerk (§8):** alle auf `main` gemergt; ein
Prod-Deploy dieser Stände ist hier **nicht verifiziert** — vor jeder Deploy-
Behauptung §9 (Davids Ja) + Topologie-Check. Inhalt:

- **§6-Datei-Splits (verhaltensneutral, Token-Disziplin):** `startseiteConfig`
  → Typen/Karten/Vorlagen + Barrel (#37 `5516796`); `gruendungAgSchemas` → 3
  Geschwister + Barrel (#38 `fe593e9`); `gruendungAgDokumente` → Typen/Gates/
  Assembly (#39 `4bc8f32`); `zustaendigkeit` Setup/State in
  `useZustaendigkeitForm`-Hook (#49 `1ad4416`). Golden byte-gleich.
- **Gesetze-Darstellung:** Gesetzesanzeige **zweispaltig mit statischen
  Randtiteln** (#41 `408ae66`) + Sektions-Kopf-Umbruch auf schmalen Viewports
  (`7f3a799`); Artikel-Randtitel **aus fusionierten h6 extrahieren** (BV u.a.,
  #42 `06f1e26`); Gliederungs-Sprung präzise + kein Scroll-Akkordeon +
  Suchleiste am Header (#43 `27f2a44`); aufgehobene Artikel einheitlich
  «aufgehoben» (#48 `501be00`).
- **Gesetze-Kanton-Übersicht (visuell):** Kantonswappen (#44 `cfdabb7`);
  **klickbare Schweiz-Kantonskarte** (#45 `ada4452`); Karte farblich
  differenziert + Name beim Hover (#46 `f09cbe7`).
- **Mobile:** Favoriten-Dropdown sprengt Viewport nicht mehr (#40 `4c9be90`).
- **Normtext-Infrastruktur:** **Fedlex-ELI-Resolver** SR-Nr → ELI + geltende
  Konsolidierung (#47 `27f657c`).
- **Offen / nächster Auftrag David (22.6.):** kantonale Gesetze überarbeiten,
  damit **Zahlen und Tabellen richtig dargestellt** werden — bekannte Wurzel:
  PDF-Spalten verschmelzen bei der Extraktion zu einem Fliesstext
  (`scripts/normtext/adapter-pdf.ts`), das UI repariert heuristisch
  (`ArtikelBody.tsx` `staffelZeilen`/`normalisiereTarifText`); §7-saubere
  Lösung = besserer Generator-Extrakt, nicht UI-Heuristik.

## Session 22.6.2026 — PROD-DEPLOY: Rechen-Audit A/B/C + Normtext-Adapter-Fixes + Gesetz-Optik (PR #35 → main 3422eff, lexmetrik.vercel.app)

David autonom-Auftrag («mach das alles bis morgen, keine Entscheidung»). Gebündelt
gelandet + deployt (Commit `7e37210`, Merge `3422eff`, dpl_Dpr4T3…, alle Kernrouten
+ neue /gesetze-Seiten HTTP 200):
- **Tarif-Rechen-Audit Band A** (doppelt am amtlichen Wortlaut verifiziert,
  `verifiziert:'recherche'`): TG GK §11 → 20'000; UR-PE-Anker → Art.28 Abs.1;
  VD-PE → Art.4 + fehlende 2%-Obergrenze; GE-PE eigene `GE_STAFFEL` (§4); GE/AI/VS
  Schlichtung; NW Testament/Erbvertrag = Audit-Befund WAR FALSCH (Code korrekt,
  defekter Snapshot). Befunde in `bibliothek/AUDIT-TARIF-2026-06-17.md`.
- **Normtext-Adapter-Fixes** (+ Unit-Tests): LexWork zwei-td.number (NW §18
  Sub-Staffel), PDF `istAnhangZifferLinks` (AR 8.1–8.4), Generator `--nur=kanton`
  (§8-sicher, Golden gemischt).
- **Anker/Quellen:** AR bGS 153.2 27 Anker «Art.12 Ziff.»→«Anhang Ziff.» +
  pdf_file-quelleUrl (27/27 lösen auf); SG GebT 821.5 → versions/3849, SG GKV
  941.12 → versions/2808. Snapshots AR/NW/SG gezielt regeneriert.
- **UI / Gesetz-Optik:** NormText key-Fix (React-Warnung weg), GesetzLeser/
  ArtikelBody/index.css Optik-Angleichung, ErrorBoundary/Sidebar/lazyRetry.
- Tore alle grün (2059 Tests, Lint, Golden byte-identisch, Build 53 Routen,
  check:normtext/zitate/vollstaendigkeit, Routen-Smoke 0 Konsolenfehler);
  mehrfacher adversarialer Bug-Check (Band A, B-AR, C, UI, holistisch) — deploy-reif.
- **Offen:** fachliche Abnahme David (Zeitsperre, kein Druck); C-Rest **OW 210.32**
  (braucht olexHosts-Inventar-Zeile + Stand-Fallback); VS-173.8 stand-Nachlauf.

## Session 19.6.2026 — INTEGRATION + PROD-DEPLOY: vorlagen-design ⊕ rechtssammlung gemeinsam auf main (feat/vorlagen-design → main, lexmetrik.vercel.app)

David: «mache alles fertig, gilt alles als abgenommen». Beim Deploy von
feat/vorlagen-design fiel auf, dass `origin/main` (15b101a) inzwischen die
komplette **Rubrik V «Gesetze»** (rechtssammlung, PR #1–#4) enthält — der erste
Deploy aus der db1a737-Basis hätte diese vom Prod gekippt. Korrektur:
`origin/main` in feat/vorlagen-design gemerged (nur STRUKTUR.md-Konflikt, Code
konfliktfrei), gate voll + build grün, **gemeinsam neu auf Prod deployt** (beide
Features live), Branch gepusht und **main fast-forward** auf den integrierten
Stand. Bug-Check-Fix im selben Strang `7d09500`: AG-Gründungs-Sammel-ZIP reichte
den Ausgabe-Stil nicht durch → behoben + Regressions-Wächter
`vorlagenStilDurchreichung.test.ts`. Abnahme: durch David erteilt (alles).

## Session 18.6.2026 — OUTPUT-DESIGN-REGLEMENT + VORLAGEN-SCHRIFTBILD (Variante A) + STIL-UMSCHALTER (feat/vorlagen-design, 19.6. gepusht + deployt + in main)

Auftrag David: «schön, nutzerfreundlich, state of the art» für die Dokument-
Outputs der Vorlagen — Regeln **in Code erzwungen**; Schlichtungsgesuch als
erste Umsetzung. Optik-Entscheid: Variante A «Dokument-Handwerk» (nüchtern-
seriös), per Design-Skizze in claude.ai/design abgenommen. Nachschub David:
«nüchtern UND modern als Stil bei der Ausgabe» → Umschalter gebaut.

**Geliefert (3 Commits, Worktree, ungepusht):**
- **Etappe 1** `b67a6c8`: Rollen-Abstände der Renderer als Tokens an EINER
  Stelle (`ROLLEN_PDF` mm / `ROLLEN_DOCX` twips, `formatvorlagen.ts`). KEINE
  mm→twips-Ableitung (Word-Masse eigenständig getunt). Byte-gleich bewiesen
  (datums-/ID-bereinigter Render-Vergleich: PDF-Operatoren + DOCX document.xml
  identisch, je Fall pro Format).
- **Etappe 2** `c4d6886`: Live-Vorschau liest neu aus der SSoT
  (`components/vorlagen/vorschauStil.ts`, dritte rem-Sicht — keine Projektion,
  weil das «Papier» container-relativ ist). Schriftbild = Variante A:
  tabellarische Ziffern (NICHT `.num`-Monospace), Parteirollen-Overlines,
  scanbarer Begehrensblock. Format-agnostisch → jede Vorlage profitiert.
- **Etappe 3** `ca825fd`: Ausgabe-Stil-Umschalter **nüchtern ⇄ modern**,
  kohärent über Vorschau + PDF + DOCX. Differenzierer = Rubrum-Parteirolle
  (`— klagende Partei —` ⇄ Versal-Label, `rolleLabel`). Geteilter Modul-Store
  `ausgabeStil.ts` (localStorage, Default modern); `stil` als reiner Renderer-
  Parameter (§3). UI: `StilUmschalter` im Vorschaukopf.
- **Reglement-Notiz** `DESIGN-REGLEMENT-VORLAGEN.md` (Spiegel von …-RECHNER.md).

Jede Etappe: `assemble` unberührt → golden byte-gleich; gate voll + build grün;
Struktur-Test `vorlagen.test.ts` deklariert auf neues Schriftbild angepasst
(§6 Ziff. 3). Design-Karten in claude.ai/design-Projekt (Gruppe «Dokument-
Vorschau»): Vorher / Nachher A / Nachher B / IMPLEMENTIERT.

**OFFEN für Davids Rückkehr:** (1) fachliche Abnahme der Optik durch
Ausprobieren (Vorschau + PDF + DOCX, beide Stile) — PDF/DOCX-Modern-Label noch
nicht visuell gegengeprüft; (2) Default-Stil bestätigen (aktuell `modern`);
(3) Push/Deploy (§9, nur nach ausdrücklichem Ja). — ERLEDIGT 19.6.2026 (s. Karte oben).

## Session 17./18.6.2026 — RUBRIK V «GESETZE» (browsbare Rechtssammlung) — PROD-DEPLOY (feat/rechtssammlung, in main integriert 19.6., lexmetrik.vercel.app)

**Neue Nav-Rubrik V «Gesetze»** (`/gesetze` + Client-lazy `/gesetze/:ebene/:key`),
4 Katalog-Tore unberührt. **Reader «Richtung A»** (Serif-Lesespalte): amtliche
Gliederung benannt + Fedlex-analog einklappbar (TOC↔Text synchron), Randtitel in der
Marge (entdoppelt), amtliche Fussnoten am Fuss (AS/BBl klickbar), Absatz/lit./Ziff. als
Ein-Klick-Zitate, Querverweis-Autolink, Hover-Zoom, Tab-Titel, **Download** (ganzer
Erlass), **globale Suche** (Bund+Kantone). **Daten = generierte Sidecars**
`public/normtext/struktur/{bund,kanton}/<KEY>.json` (Snapshots/Golden UNBERÜHRT);
Extraktoren `struktur-extrahiere`/`fussnoten-extrahiere` (Fedlex) + `struktur-lexwork`
(Kanton). **Kantone = Plattform-Adapter:** EIN LexWork-Adapter deckt 73/113; 40 Nicht-
LexWork → flacher Fallback. **Bund:** 27 Volltext + 30 SPARQL-verifizierte `nur-live-
link`-Stubs. **D1 Norm↔Werkzeug-Brücke** (`werkzeuge.ts`, einzigartig). Adversarialer
Bug-/Logik-Check (7 Agenten) → solide; 2 Display-Bugs aus Davids Review gefixt
(flacher Reader kollabierte; Hover-Zoom verzerrte lange Artikel) + e2e-Regression.
Gate voll grün, e2e 5/5. Dossier `bibliothek/normen/gesetzessammlung-rubrik-v.md`.
**WICHTIG:** Branch `feat/rechtssammlung` (Basis db1a737 = feat/normtext-popup) ist
**deployt, aber UNGEPUSHT und NICHT in main gemerged** — Code lebt nur im lokalen
Worktree `/private/tmp/lexmetrik-rechtssammlung`. Push/Merge bei Bedarf separat (§9).
**Update 19.6.:** via PR #1–#4 in `origin/main` integriert und gemeinsam mit
vorlagen-design neu auf Prod deployt; weitere P4–P6-Arbeit läuft im Worktree
separat weiter.

## Session 17.6.2026 (abend) — KANTONALER VOLLTEXT-AUSBAU + POPOVER-POLITUR + RECHEN-AUDIT — GEPUSHT + PROD-DEPLOY (feat/normtext-popup @ 4b54f67, lexmetrik.vercel.app)

**Volltext-Ausbau (echte Fallback-Quellen 23 → 3):** `parsePassus` löst jetzt
Anhang-/Tarif-Ziffern auf (`anhang-segmenter`); generisches **OrdoLex-PDF-Profil**
(`olexAt`/`olexPar`, Stand aus «(Stand …)»/«(état …)»/SRSZ via neuem rohText-Fallback
in `adapter-pdf`). NEU mit Volltext: GR/AR/LU/SG/FR/VS/SZ/TI (PDF) + TG/AG/SH (über
`/app/`-LexWork, Tarif-quelleUrl von `/api/` umgestellt) + ZH AnwGebV, GE RTFMC, VD
TNo (tolv/210344) / TDC (tolv/135783 — Falschquelle 105540 korrigiert), TI ripetibili
(m3/atto/141), SZ HSt (lexfind/82040 via sz-Profil), VS OcRF (lex.vs.ch/211.611).
**ZH-NotGebV-Anhang spaltenbewusst** extrahiert (`extrahiereZhAnhangSpalten` in
adapter-zh-pdf: Verweis-Spalte getrennt, Silbentrennung gefügt) — vorher unleserlich
verschränkt («Begrün-2.2.1, 2.2.2, dung» → «Begründung … (vgl. Ziff. …)»). 118 Ziffern.
Verbleibende 3 Fallback: UR-urilaw (privater Tarif), UR-Grundbuch-PDF (verstümmelt),
SG GebT 821.5 / SG 941.12 / OW 210.32 (nurPdf-Onboarding offen, s. Audit-Doc).

**Popover-Vereinheitlichung** (Darstellung, Wortlaut unverändert — Freigabe David):
Datum IMMER `DD.MM.YYYY`; Bund «Fassung vom:» / Kanton «In Kraft seit:»; Tarif-Text-
Normalisierung (verschluckte Trenn-Leerzeichen); Staffel zeilenweise. **Regeln
dokumentiert:** `bibliothek/normen/norm-vorschau-snapshot-system.md` (§ Darstellungs-Regeln).
«Erstrecherche» aus allen nutzerseitigen Strings entfernt.

**Rechen-Audit** (4-Agenten-Fan-out, ~250 Tarif-Einträge, Regel↔Gesetzesartikel):
Mehrheit OK. **A (Wert-/Norm-Abweichungen) mit PRÜFEN-Hinweis geflaggt — Fix später
(Entscheid David)**: NW Testament/Erbvertrag §18-Rahmen vs §20-Staffel, UR PE Art.30
(Strafnorm), VS/GE/AI Schlichtung, GE/VD PE, TG GK §11 (5000 vs 20'000). **B-Anker
korrigiert:** VS Art.96→32/33, VD GK 17→18, JU PE 7→13, ZG PE. **C-Coverage gefixt:**
VS-94116 / SZ-280.411 (4837→5862) / VD-105540-Falschquelle. **Vollständige Befundliste:
`bibliothek/AUDIT-TARIF-2026-06-17.md`** (offen: A-Wertfragen, systematische AR-Anker-
Verfeinerung, SG/OW-nurPdf-Onboarding).

**Tor + Deploy:** gate voll grün · check:netz Drift 0 / 0 Warnungen · Bug-Check
(Gate+Netz+ZH-No-Pollution+Stand-Fallback+Faithfulness+Browser-Render). Commit 4b54f67
(50 Dateien, Pathspec; Fremd-WIP `FAHRPLAN-RECHTSSAMMLUNG.md` einer Parallel-Session
unberührt). Deploy aus sauberem /tmp-Worktree → **lexmetrik.vercel.app READY**; Live-
Nachkontrolle: Kernroute + neue Snapshots HTTP 200, ZH-2.2.1 lesbar.

## Session 17.6.2026 — INLINE-NORM-AUTO-LINKER «NormText» + SNAPSHOT-AUSBAU (27 Bundesgesetze) + PHASE 2 (kantonal §) — GEPUSHT + PROD-DEPLOY (Branch feat/normtext-popup @ b9d35e6)

**➡️ NÄCHSTER AGENT — offene Hauptaufgabe:** «Volltext bei ALLEN Kantonen im
Popup» (pro Ziffer genau, alles bauen → EIN Deploy). Es ist ein **atomarer Build**
(parsePassus-Anhang + alle Quell-Adapter + Voll-Regenerierung Kanton + Verifikation
GEMEINSAM, sonst Tor rot). Validierte Engine liegt bereit (Commit `800f577`, inert):
generischer Ziffer-Segmentierer + ZH-PDF-Integration (ZH NotGebV 118 Ziffern
bewiesen); lexfind `/tolv/<id>` = uniformer PDF-Zugang. **Vollständige
Schritt-für-Schritt-Anweisung + Fallstricke: `FAHRPLAN-GESETZESTEXT-POPUP.md`,
Abschnitt «HANDOVER (17.6.2026) — ATOMARER ANHANG-/PDF-VOLLTEXT-BUILD».** Prod ist
stabil @ `b9d35e6`; Engine ungepusht/nicht-deployt — keine Regression.

**PROD-DEPLOY 17.6.2026 (David-Ja), 3 Stände:**
- @ 474b10a: Linker (Phase 1/3) + Snapshot-Ausbau 27 Bundesgesetze.
- @ f19ef9a: + Phase 2 (kantonale «§ N» inline) NACH fundiertem Bug-Check.
- @ b9d35e6: + 3 Polish-Fixes (s. u.) NACH fundiertem Bug-Check.
Prod via sauberem /tmp-Worktree → **lexmetrik.vercel.app**. Nachkontrolle live:
Kernrouten HTTP 200, Bund- (BBG) + Kanton-Snapshot (LU-265) 200, ZH §4-Popover
als 9 Zeilen, 0 tote Links, 0 Console-Fehler.
**Bug-Check Phase 2 (2 Review-Agents + empirisch):** HIGH-Bug gefunden+behoben —
KantonNormText verlinkte bare «Art. N» eines FÖDERALEN Posten (BGer, fedlex-URL)
kantonal → toter Popover; Fix: nur «§» + nur Nicht-fedlex-Quelle (Commit f19ef9a).
**3 Polish-Fixes (b9d35e6, Befunde David):** (1) föderaler Posten → KantonArtikel-
Trigger routet fedlex-Quellen über NormText→NormChip (BGG-Volltext statt Fallback)
— behebt zugleich den oben genannten pre-existing Punkt; (2) «Anhang Ziff. 1.1.1»
& andere nicht parsbare Artikel sind jetzt klickbar (Link zur amtlichen Quelle);
(3) Tarif-Staffel-Tabellen (ZH GebV OG §4, ZH AnwGebV §4, BS GGR §5) im Popover
zeilenweise statt als Blob (Korpus-Scan: nur diese 3, 0 Fehlauslösungen).
**Fachliche Abnahme durch David.**

**Auftrag David:** «kannst du an der Gesetzesverlinkung weiterarbeiten» → «jede Norm die
genannt wird soll verlinkt sein» → «weiterarbeiten bis Ziel erreicht» → «verifizieren und
Bug-Check» → «alles doppelt verifizieren von Anfang an». Detail: `FAHRPLAN-GESETZESTEXT-POPUP.md`
(ERLEDIGT-Abschnitt 17.6.).

- **Was:** Im FLIESSTEXT genannte Bundes-Normen («Art. N … GESETZ») werden zum Popover-
  Trigger (bisher nur an strukturierten Chip-Stellen). Neue Komponente `NormText` (universell:
  Normen via `NormChip`-Popover UND Rechtsprechung via `RechtsprechungText`); `NORM_IM_TEXT`-
  Regex in `fedlex.ts` (Gesetz-Namen aus FEDLEX-Keys + «GebV SchKG»-Alias, single source;
  KEIN blinder `§`-Regex). `NormChip` um `linkClass` erweitert (Default = heutige Pillen-Klasse,
  SSR byte-gleich). Nicht-auflösbare Nennungen bleiben Text (kein toter Link, §8).
- **Eingebaut (~90 Stellen, screen-only):** `ErgebnisAnzeige` (Warnungen+Annahmen ALLER
  Rechner — ersetzt das frühere `RechtsprechungText`), Wizard-Bausteinprotokoll,
  `VorlagenSeite`-Gates, 11 Formulare, 18 Vorlagen-Seiten (warnungen/hinweise/blocker),
  `Dokumentmappe`, `KvGerichtWahl`. Logikschicht unberührt (§3); Hinweis-Texte selbst
  unverändert, nur Inline-Rendering.
- **Verifikation (doppelt):** `npm run gate` voll grün (tsc/vitest/**golden byte-gleich**/lint/
  check), 13 neue Tests; 2 unabhängige adversariale Reviews (Regex/Komponente + Integration)
  ohne echten Bug (kein ReDoS, keine nested `<a>`, keine Key-Kollision, SSR effect-only);
  Browser-Smoke (prozesskosten 9 Inline-Links + Popover «Art. 95 ZPO» öffnet, arbeitsvertrag 8,
  vollmacht 2; 0 nested `<a>`, 0 Console-Fehler über 9 Seiten). Stale-`dist`-Fehlmessung
  (alter preview-Prozess :4173) erkannt + nach Neubau widerlegt.
- **Phase 3 (Bund-Prosa) ERLEDIGT 17.6.:** (3a) Field-hint + FehlerBox zentral durch NormText
  (deckt alle Hinweise/Eingabefehler an EINER Stelle); (3b) 156 statische «Art. N GESETZ»-
  Nennungen in JSX-Fliesstext (Vorlagen-/Rechner-Prosa) inline verlinkt — nur reine einzeilige
  Text-Knoten; Entity-Knoten/mehrzeilig/Choice-Labels/Placeholder bewusst aus. Gate grün
  (golden byte-gleich), Browser-Smoke 0 nested `<a>`/0 Console-Fehler. Commits a5a00a4
  (Phase 1), ff71685 (3a), 385bbf6 (3b).
- **Snapshot-Ausbau «jedes verwendete Gesetz in seiner Gesamtheit» + «§≡Art» (Auftrag David):**
  9 weitere Bundesgesetze als Volltext-Snapshot → **Bund 27 Gesetze / 6664 Artikel**
  (MWSTG·URG·BewG·EOG·SVG·DSG·BBG·GBV·JStPO). ELI+Konsolidierung via Fedlex-SPARQL ermittelt,
  SR-Nr.+Anker am Filestore empirisch verifiziert (§7); Linker (NORM_IM_TEXT/FEDLEX) erkennt
  sie automatisch, Popover lädt den Volltext (Kette end-to-end verifiziert). Generator: neuer
  `--nur=bund`-Modus (Bund nachführen ohne kantonale Quellen neu zu ziehen, Golden gemischt);
  Extractor: leerer Artikel-Körper (z. B. SVG art_107 aufgehoben) faithful als «aufgehoben».
  ATSG/IPRG bewusst NICHT (nur Kommentar/Test). Commits 5294edd, a00fdcb.
- **Regel «kantonales Gesetz nur als PDF» (Auftrag David 17.6.):** Quellen-Priorität
  LexWork→HTM→HTML→PDF→Live-Link; PDF browserlos via `adapter-pdf.ts`-Profil (pdfjs Build-Zeit,
  Body-Spalten-x, Stand/Drift-Token, Qualitäts-Tor → sonst ehrlicher Fallback §8); Speicherung
  wie Bund/LexWork inkl. Provenienz (§7). Dokumentiert: CLAUDE.md §7 +
  `bibliothek/normen/norm-vorschau-snapshot-system.md` (§11).
- **OFFEN:** Phase 2 (kantonale «§ N ERLASS» inline über Quelle-Kontext); Rest-Prosa (Entity-
  Knoten &gt;/&amp;, mehrzeilige Text-Knoten, prop-geroutete Choice-Labels); GBV: neuere
  Konsolidierung (2026) ist Fedlex-SPA-only, daher 20240101 gepinnt (Live-Link massgeblich).
  **Push/Deploy + fachliche Abnahme offen (§9 / David selbst).**

## Session 16./17.6.2026 — NORM-VORSCHAU-POPOVER (Volltext Bund+Kantone) GEBAUT (Branch feat/normtext-popup, ungepusht)

**Auftrag David:** «Popup mit Gesetzestext statt Weiterleitung, insbesondere
kantonal, relevante Stelle markiert» → iterativ stark ausgebaut («weiter»,
«mach was du für richtig hältst», «du kennst das Endziel», «so wie Basel-Stadt
ist super»). Fahrplan `FAHRPLAN-GESETZESTEXT-POPUP.md`; Build-Regel in **CLAUDE.md
§7** (Zitat-Ausnahme + Snapshot-Build-Muster); Dossiers `bibliothek/normen/
norm-vorschau-snapshot-system.md` + `kantonale-tarif-zitat-befunde.md`.

- **Was:** Klick auf einen Norm-Verweis öffnet ein Popover mit dem Artikel-
  **Volltext** (statt sofort extern); zitierte Stelle (Abs./lit./Ziff.) markiert
  + eingescrollt; Fuss «In Kraft seit» + Live-Link; aufgehobene Stellen als
  «aufgehoben». Progressive Enhancement: ohne Snapshot ehrlicher Link-Fallback,
  PDF/Golden/Prerender unverändert. A11y (Fokus-Falle, Scroll-Lock, Esc).
- **Architektur:** Build-time-Snapshots `public/normtext/{bund,kanton}/` (Generator
  `npm run normtext`, NIE von Hand), Client-Loader lazy je Datei (Manifest
  quelleUrl→Datei), ein `NormPopover` für alle Tiers. **Ganze Gesetze gespeichert**
  (alle Artikel je Erlass, kantonal wie Bund; einheitliches Label § N / Art. N).
- **Abdeckung:** Bund **5760 Art./18 Gesetze** (Fedlex-Cache, inkl. StGB/StG +
  Zuständigkeits-Verweise klickbar). Kanton **~5700 Art./103 Erlasse** über
  **vier Adapter-Tiers, beste Quelle je Kanton:** LexWork-JSON (19 Kt.) · Word-HTM
  (NE/GE/**TI**) · ZH-PDF (zhlex→notes.zh.ch via JS-Redirect, pdfjs build-time) ·
  generisches PDF (SZ/VD/JU). Aufzählungen vollständig, Tarif-Tabellen als gepaarte
  Items, präzise lit/Ziff-Markierung. Ehrlicher Fallback nur wo nichts
  Strukturiertes existiert (VD-HTML ist SPA/API-gated → begründet PDF).
- **Korrektheit/Pflege:** «aktuell in Kraft»-Garantie über alle Tiers (Bund
  Konsolidierung; LexWork version_uid; HTM/ZH/PDF quelleHash) — Drift-Tore
  `check:normtext`(-netz) + Vollständigkeitstest `check:vollstaendigkeit`. Bei
  Rechtsänderung: Drift rot → `npm run normtext` neu.
- **Fachliche Tarif-Korrekturen (durch den Vollständigkeitstest ans Licht):**
  **SH** Schlichtung totes ZPO-273.100 → JG 173.200 Art. 82 (Werte 50–300→100–1000,
  David-Ja); **OW** GK Art. 7 aufgehoben → Art. 12 GebOR (selbst bestimmt am GOG);
  **LU** quelleUrl 228→258; 5 NE/GE-Zitate (Art. 14 ch., LERF Art. 10, GE-Erlasse)
  — alle live-verifiziert, Status `recherche` (Abnahme David offen).
- **Verifikation:** 2 unabhängige Bug-Check-Runden + Einheitlichkeitscheck, alle
  Befunde behoben (ZH-Stand=Inkraft, einheitl. Label, Tabellen-Kopplung, FR-
  Markierung, Lückentor). Gate **voll grün**, golden byte-gleich, Drift 0, ~70
  Commits. **Browser-Smoke aller 26 Kantone** durchgeführt (0 Console-Fehler).
  **Push/Deploy + fachliche Abnahme offen (§9 / David selbst).**
- **OFFEN nächste Session (David 17.6.):** «viele genannte Artikel im FLIESSTEXT
  noch nicht verlinkt» (Hinweise/Begründungen/Tarif-`hinweis`) — Inline-Auto-Linker
  `NormText` (~2093 Nennungen, ~40 % federal sofort auflösbar). Plan + Einbaupunkte
  am Ende von `FAHRPLAN-GESETZESTEXT-POPUP.md`.

## Session 16.6.2026 — BEURKUNDUNGS-AUSBAU: 3-fach-Verifikation + Gesamtkosten + UI-Fix

**Auftrag David:** «verifiziere das alles / führe nochmals Recherche durch» + «sind
wirklich alle Kosten abgedeckt?» + «Handänderungssteuer-Anzeige verbessern».
- **3-fache Verifikation der Tarif-Daten:** find → unabhängiger Doppelcheck →
  **adversariale Zweitprüfung** (alle 624 kodierten Werte gegen die Erlasse) →
  **struktureller Korrektur-Reencode**. Die Zweitprüfung deckte **286 Befunde**
  auf (meine erste Recherche war zu nachlässig): veraltete Fassungen (ZH v95 →
  1.1.2024: Testament/Ehevertrag 200–4000, Erbvertrag 300–6000), degressive
  Staffeln als Flachsatz kodiert (OW/NW/GL/LU/VD … → jetzt echte Marginalbänder
  `staffel_sockel_prozent`), Aufwand-Tarife als Fix (ZG-Grundbuch = CHF 180/Std ×
  Faktor; Vorsorgeauftrag ZH = CHF 180/Std → formel_extern), falsche Artikel
  (Schuldbrief Ziff. 1.2.1, GL-Grundbuch Art. 41 Nr. X). Engine-Ausgaben gegen
  Zweitprüfungs-Stützstellen geprüft (OW Grundpfand 1'750, NW Erbvertrag 2'100,
  LU Schenkung 2'750, GL Schenkung 1'700 …). Dossiers + Tests nachgeführt.
- **Gesamtkosten (David: «alle Kosten?»):** neues Modul `lib/beurkundungZusatzkosten.ts`
  — **MwSt 8,1 %** (nur freies Notariat, 14 Kt), **Handelsregistergebühr Bund**
  (GebV-HReg SR 221.411.1, Anhang: AG/GmbH 420 · Genossenschaft 280 · Stiftung 210 ·
  Statutenänderung/Kapital 200 · Fusion 420), **Emissionsabgabe** (StG SR 641.10,
  1 % über **Freigrenze** 1 Mio — ganzer Betrag steuerbar). UI «Weitere
  Transaktionskosten» + «Total (Schätzung)», auch im PDF. Bundeswerte gegen Fedlex
  doppelt verifiziert (GebV-HReg 2021-Fassung, nicht die aufgehobene 2007er).
- **UI-Fix:** Position «Entfällt» klar ausweisen, wo ein Kanton die Steuer/Gebühr
  gar nicht kennt (z. B. ZH Handänderungssteuer) — statt irreführend «nach
  Vereinbarung/Aufwand».
- Gate **voll grün**, golden byte-gleich, 51 Routen prerendered, Playwright-Smoke
  ok (GE AG-Gründung 2M → Total 24'798 inkl. Zusatzkosten; ZH Testament 200–4000;
  OW Grundpfand 1'750; ZH Handänderung «Entfällt»; 0 Console-Fehler). Status
  durchgehend `recherche`/`entwurf` (§7).
- **VIERTER Pass (David «bist du absolut sicher?» → «lauf den 4. Pass»):** alle 621
  kodierten Werte an Stützpunkten (100k/500k/1M/3M) gegen die Erlasse adversarial
  geprüft → **529 ok, 91 Korrekturen** (Konvergenz von 286). Merge 3rd+4th-Pass.
  Zusätzlich **automatische Kontrollen** (in meiner Macht, ohne KI): (1) **Monotonie-
  Invariante** über 619 Tarife → fand 1 latenten Sockel-Bug (VD Schuldanerkennung,
  `minChf` nur auf 1. Band) → Generator setzt min jetzt auf JEDES Band; (2)
  **Stützpunkt-Abgleich** Engine vs. Sollwerte → fand 25 Mismatches (UR/TI/SZ
  **Gesamtwert-/Schwellensatz-Tarife**, die das marginale Schema nicht abbilden
  konnte). Fix outside the box: **Tarif-Primitiv erweitert** (`staffel_voll_prozent`
  jetzt mit Min/Max je Band — additiv, golden byte-gleich) + Overrides (UR Tarif A/B,
  TI LTORF-Schwellensatz, SZ 70%-Basis). Endstand: Stützpunkt-Mismatches **0** (bis
  auf 1 offengelegte Ceil-Step-Näherung SZ Stockwerkeigentum @<500k), Monotonie **0**.

## Session 15.6.2026 (Abend) — BEURKUNDUNGS-AUSBAU: Notariatsrechner auf alle Geschäfts-/Eintragungsarten (ungepusht)

**Auftrag David:** «baue den Notariatsrechner aus» + «achte darauf dass alle Arten
von Beurkundung abgebildet sind» + «und alle Arten von Grundbuchgebühren; von mir
aus kannst du die Engines auch aufteilen». FAHRPLAN-BEURKUNDUNGS-AUSBAU.md.
- **Zwei getrennte Engines (§4, David-freigegeben):** `src/lib/beurkundung.ts`
  (Notariats-/Beurkundungsgebühr je **Geschäftsart**, 22 Arten) + `src/lib/grundbuchgebuehren.ts`
  (Grundbuchgebühr je **Eintragungsart**, 10 Arten). Beide dünne Lader über
  `tarif/staffel`; Grundstückkauf/Eigentum-Kauf nutzen die verifizierte
  NOTARIAT/GRUNDBUCH-Schicht weiter (Parität getestet, **keine Regression**).
- **Taxonomien:** `beurkundung-typen.ts` (Immobilien · Familie & Nachlass ·
  Gesellschaft · Sicherung · Übriges) + `grundbuch-typen.ts`.
- **Deep Research (2 Workflows, je 26 Kt × find→Doppelcheck, 52 Agenten/4,1 M Token):**
  Beurkundungstarife + Grundbuchgebühren je amtlicher Erlass + Artikel + Regel +
  Stand → Dossiers `bibliothek/kosten/{beurkundungstarife,grundbuchgebuehren}-kantone.md`
  (+ INDEX). **Doppelt verifiziert** (find + unabhängiger Doppelcheck); GB-Gegenprobe
  reproduziert die GRUNDBUCH-Schicht. Korrekturen übernommen: GE Bürgschaft 1‰;
  BS § 51 Abs. 2/4/5/6; ZH § 11; AI Löschung. **Fachlicher Drittcheck** fand
  Überhöhungs-Risiko: Wert-Geschäfte (Schenkung/Gründung/Stiftung) in Staffel-
  Kantonen sind **degressiv** → in der Engine als ehrliche Spanne statt Flach-
  Promille kodiert (§8); Flach-Kantone (ZH/SZ/SG/GR/TG) behalten den Satz; TG
  Schenkung = 1‰ (§ 14 GGG); AG Anmerkung = fix 40.
- **UI** `/rechner/notariat-grundbuch`: drei Bereiche (Grundstückkauf · Beurkundung
  je Geschäftsart · Grundbuch je Eintragungsart); Wertfeld dynamisch nach
  aufgelöstem Tarif (`istWertbasiert`), interkant. Vergleich, PDF, Permalink. §8:
  fehlende Tarife «in Recherche», nie ein Schätzwert. Rechtsgebiet umbenannt
  «Immobilien & Beurkundung».
- **Verifikation:** Stützstellen-Tests beider Engines, Gate **voll grün**, golden
  byte-gleich, 51 Routen prerendered, Playwright-Smoke (OW Testament 1‰→1000,
  GB Grundpfand ZH→800, Vergleich 26 Zeilen, 0 Console-Fehler).
- Status durchgehend `entwurf`/`recherche`; nichts `geprüft` (§7). **Push/Deploy
  auf Davids frisches Ja (§9).**

## Session 15.6.2026 — NEUE DOMÄNE: Notariats- & Grundbuchkosten-Rechner GEBAUT (ungepusht)

**Auftrag David: «Notariat/Grundbuch von Anfang an richtig, ausführlicher
Handlungsplan (ultra effort), Deep Research, überprüfen und nochmals überprüfen,
amtliche Quelle hinterlegt.»** Plan: `FAHRPLAN-NOTARIAT-GRUNDBUCH.md`.
- **Deep Research** (5-Cluster-Fan-out, alle 26 Kantone): Beurkundung (Notariat) +
  Grundbuch + Grundpfand + Handänderungssteuer beim Grundstückkauf, je Wert mit
  amtlichem Erlass + Artikel + Link + Stand → Dossier `bibliothek/kosten/notariat-grundbuch-kantone.md` (+ INDEX).
- **Engine** `src/lib/notariatGrundbuch.ts` (dünner Lader über `tarif/staffel`) +
  **Datenschicht** `src/data/tarif/notariat-grundbuch.ts` (NOTARIAT/GRUNDBUCH/
  GRUNDPFAND/HANDAENDERUNGSSTEUER, 26 Kt). Determinismus: Promille/Staffel (marginal)
  wo klare Bänder; ehrlich `rahmen`/`formel_extern` wo aufwand-/bandbreitenbasiert
  (ZG/SO/BL freies Notariat) oder Bänder unscharf (BE/FR/VD/VS/NE/GE/JU-Notariat,
  Stützstelle im Hinweis). Handänderungssteuer als getrennter Steuerblock
  (1–3,3 %; ZH/UR/GL/ZG/SH/AG/TI keine separate).
- **UI** `/rechner/notariat-grundbuch` (Form + Page + Route + Katalog + neues
  Rechtsgebiet «Immobilien / Grundstückkauf»); interkant. Vergleich (günstigste
  zuoberst), Permalink, Aktenzeichen, PDF. 8 Stützstellen-Tests, Gate voll grün,
  golden byte-gleich, 51 Routen prerendered. Zähler 49 gebaut / 45 sichtbar.
- **Verifikation läuft:** Daten-Doppelcheck (Restunsicherheiten GE ‰/% · JU Punktwert ·
  VS Stufenmodus · BS § 51 · ZG ESTV · BE Anhang-1) + adversarialer Engine-Review.
- Status durchgehend `entwurf`/`recherche`; nichts `geprüft` (§7). Push/Deploy auf
  Davids frisches Ja (§9).
- **PDF-Quellen (15.6.2026, gilt für ALLE Rechner):** `Normverweis.url` durchgereicht
  → kantonale Erlasse/Verordnungen werden im PDF verlinkt (nicht nur Bundesquellen).
- **DIREKTIVE FÜR NEUE SESSION (David 15.6.2026): `FAHRPLAN-BEURKUNDUNGS-AUSBAU.md`** —
  Notariatsrechner extrem ausbauen auf Testament, Dienstbarkeiten, Gründungen (AG/GmbH),
  Stiftungsurkunde, Bürgschaften, Erbvertrag/Ehevertrag/Schenkung u. a. (Geschäftsart-
  Dimension; Deep Research je Geschäftsart × 26 Kt mit amtlicher Quelle; doppelt
  verifizieren). David will, dass das eine NEUE Session macht.

## Session 15.6.2026 — Prozesskosten-Cockpit I7/I8 + Schlichtungstarif GEBAUT (ungepusht)

**Auftrag David (Fortsetzung): «weiter mit nächsten Etappen» + «Schlichtungstarif
recherchieren und implementieren».** Recherche war bereits da (zweifach geprüftes
Dossier `bibliothek/kosten/schlichtungsgebuehren-kantone.md`, 5.6.2026) — implementiert.
- **Schlichtungstarif:** neue Datenschicht `src/data/tarif/schlichtung.ts` (26 Kt);
  Engine beziffert die Schlichtungsphase jetzt (regime-treu getrennt vom
  Entscheidgebühr-Tarif, §4). Betroffene Tests deklariert angepasst (§6.3).
- **I7 Instanz-Akkumulation:** `berechneInstanzenzug` (Stufen-Summe, Untergrenze
  bei unbezifferten Stufen) + UI-Tabelle.
- **I8 PDF-Bericht:** `prozesskostenBericht` → `Berechnungsergebnis` → zentraler
  `PdfExportButton` + `AktenzeichenFeld`.
- **Verifikation:** unabhängiger adversarialer Review der I6/I7/I8-Engine = **0 Befunde**
  (15+ Konstellationen handnachgerechnet). Erschöpfender Konstellations-Sweep als
  bleibender Test (>5000 Kombinationen, kein Crash, Invarianten halten). Gate voll
  grün (golden byte-gleich, lint, check:zitate). 45 Tests.
- **NV-Modus (nicht vermögensrechtliche Streitigkeiten) GEBAUT:** neue Datenschicht
  `src/data/tarif/nicht-vermoegensrechtlich.ts` (GERICHTSKOSTEN_NV/PARTEIENTSCHAEDIGUNG_NV/
  SCHLICHTUNG_NV, alle 26 Kt aus den Dossiers); Engine-Schalter `nichtVermoegensrechtlich`
  → eigener Gebührenrahmen ohne Streitwert, BGer Art. 65 III lit. a (200–5000), Arbeit
  nicht mehr auto-kostenlos (streitwertbedingt, Hinweis); Zeitsystem-Kantone bei der
  Parteientschädigung ehrlich `formel_extern` («nach Aufwand»). UI: Schalter blendet
  Streitwertfeld aus. GK-NV durchgängig `recherche` (Quelldossier einfach belegt →
  **Doppelcheck-Agent läuft**).
- **Art. 99 Sicherheitsleistung (Kaution) GEBAUT:** `berechneSicherheitsleistung`
  (Höhe = mutmassliche Parteientschädigung; Ausschlüsse Art. 99 III a–d: vereinfacht/
  Scheidung/summarisch/DSG; Kautionsgründe Abs. 1 a–d als Hinweis). **Wortlaut Art. 99
  am Fedlex-Filestore 1.1.2025 verifiziert** (Abs. 3 lit. d = DSG bestätigt). UI-Schalter + PDF.
- **Handelsgericht GEBAUT:** Instanz `handelsgericht` (Art. 6 ZPO am Fedlex verifiziert;
  nur ZH/BE/AG/SG), ordentlicher erstinstanzlicher Tarif ohne Modifikator, Hinweis
  einzige Instanz/keine Schlichtung (Art. 198 lit. f)/Weiterzug BGer (Art. 75 II lit. b BGG);
  Nicht-HG-Kantone mit ehrlichem Hinweis. UI: Phase/Verfahrensart/Vergleich/Instanzenzug ausgeblendet.
- **GK-NV-Doppelcheck EINGESPIELT:** 23/26 bestätigt, 3 korrigiert (TG 300–20 000
  statt 300–5 000 [Zahlenfehler], FR Art. 20 Zivilgericht 100–500 000, OW Art. 12 II
  800–10 000); GERICHTSKOSTEN_NV jetzt durchgehend `doppelt` (zwei unabhängige Pässe).
- **Art. 106–109 Verteilung GEBAUT:** `verfahrensausgang` (Anerkennung→Quote 1 /
  Rückzug→0 deterministisch; Vergleich Art. 109 / Billigkeit Art. 107 → Ermessen,
  kein Wert) + `KOSTENVERTEILUNG_SONDERFAELLE` (Art. 106 III/107/108/109). UI:
  Verfahrensausgang-Vorschalter im Kostenrisiko + Sonderfall-Liste.
- **FINALE GESAMT-VERIFIKATION (15.6.2026, «alles von vorne»):** unabhängiger
  adversarialer Review über Engine + alle 6 Datenschichten + UI (20+ Konstellationen
  handnachgerechnet). 3 Befunde behoben: (HOCH) **TG-NV zurück auf 300–5'000** — die
  vorige Doppelcheck-«Korrektur» auf 20'000 war ein Agent-Irrtum, am amtlichen VGG
  § 11 Ziff. 2 (RB 638.1) selbst verifiziert; (MITTEL) **MwSt-Doppelzählung behoben** —
  Flag `mwstInbegriffen` (BGer-PE + VS-PE inkl. MwSt → kein Aufschlag); (NIEDRIG)
  VS-PE oberstes Band Untergrenze 41'200 ergänzt. Gate voll grün, golden byte-gleich.
- **Unentgeltliche Rechtspflege (Art. 117 ff.) GEBAUT:** UR-Schalter im
  Kostenrisiko → eigene Gerichtskosten befreit (Art. 118 I lit. b), nur die
  gegnerische Parteientschädigung bleibt (Art. 118 III), Nachzahlung Art. 123;
  Art. 118/123 am Fedlex verifiziert.
- **I9 SchKG-Verknüpfung (Teil) GEBAUT:** Querverweis im Cockpit auf
  `/rechner/betreibungskosten` (GebV SchKG, Art. 16 SchKG / Art. 96 ZPO-Vorbehalt).
- **OFFEN:** Notariats-/Grundbuchgebühren (I9-Rest) · Push/Deploy auf Davids Ja.
  Nichts `geprüft`.

## Session 15.6.2026 — Prozesskosten-Cockpit I6 (Vollständigkeit der Kostenposten) GEBAUT (ungepusht)

**Auftrag David: «mach weiter mit prozesskosten, deep research wenn nötig».**
Etappe I6 aus `FAHRPLAN-PROZESSKOSTEN-COCKPIT.md`. **Keine neue Deep Research
nötig** — die Norm-Basis (Art. 95/98/117 ff. ZPO) lag bereits doppelt verifiziert
in `prozesskosten-zpo-95-96.md` §A (Art. 98 Rev. 1.1.2025) und
`prozesskosten-sonderkonstellationen.md` §6.4/§6.7/§3; MwSt-Satz im Verfallsregister.

**Gebaut (rein additiv, §6 verhaltensneutral — golden byte-gleich):**
- `lib/prozesskosten.ts` +3 Exporte: **`berechneKostenvorschuss`** (Art. 98: ½ GK
  als Regel; voller Vorschuss in Schlichtung/summarisch/Rechtsmittel nach Abs. 2,
  summarisch-Ausnahmen offengelegt; BGer = Art. 62 BGG voll; kostenlos → 0) ·
  **`berechneMwstParteientschaedigung`** (8,1 % Normalsatz, fallabhängig, nur auf
  Schalter; kantonale Behandlung inkl./zzgl./ohne offengelegt) · **`WEITERE_KOSTENPOSTEN`**
  (Art. 95 II c–e / III a + UR Art. 117–118/123 als ehrlicher Hinweis).
- `data/tarif/typen.ts`: **`MWST_NORMALSATZ_PROZENT = 8.1`** als §5-SSOT der
  Tarif-Domäne (Mietvertrags-Kopie bleibt; beide im Verfallsregister).
- UI `ProzesskostenForm.tsx`: Vorschuss-Kachel · MwSt-Schalter (Permalink `mw`) ·
  aufklappbare «Weitere Kostenposten».
- 11 neue handgerechnete Tests (36/36 grün). Gate voll grün, Build ok.

**OFFEN:** §9-Bug-Check noch nicht über unabhängige Lupen gefahren · Push/Deploy
auf Davids frisches Ja (§9). Nichts trägt `geprüft`. Nächste Etappen: I7
(Instanz-Akkumulation) → I8 (PDF) → I9 (Notariat/GebV-SchKG).

## Session 15.6.2026 — UI-REDESIGN «frischer Blick» GEBAUT + DEPLOYED (Auftrag David, parallel zum Cockpit)

**Auftrag `~/Downloads/AUFTRAG-UI-Redesign.md`:** ganze Darstellungsschicht frei,
Rechtslogik (`src/lib`/`src/data`) + Export-Inhalte unangetastet (Golden
byte-identisch verifiziert). Vorgehen: 10-Agent-Audit (97 Befunde) + empirische
Playwright/DOM-Prüfung; Plan/Stand in **`REDESIGN-PLAN.md`** (Root).

**Umgesetzt + DEPLOYED (15.6., lexmetrik.vercel.app):** Fundament-Primitive
(`<Card>`/`<SeitenKopf>`/`<Checkbox>`/`<GruppenTitel>`/`.lc-select`/`.lc-akzent-*`,
`--ring`-Fokus); Skip-Link + `<main>`-Landmark; **persistente Kategorie-Nav +
Mobile-Off-Canvas-Menü**; **Katalog-Rechtsgebiet-Filter** (tote kartePasst-Logik
verdrahtet, `?rg=`/`?status=`); Prozesskosten-Dialekt an Haus-Anatomie angeglichen;
Wizard: Mobile-Stepper-Fortschritt + Vorschau-Sprung + «Weiter»-Erklärung +
Tablet-`md`-Zweispalter + **Haarlinien-Sektionen** (`<GruppenTitel>`, Entscheid
David) + **kombinierte Schalter-Karte** (Vertragstyp+Detailgrad); Live-Wert-Puls +
Schritt-/Routen-Fade; A11y (Tabs-Tastatur, FristenKalender sr-only, Kontrast,
SprachUmschalter-Disclosure); Mobile-Touch (Checkbox/Radio/Tabs/Tabellen);
Sekundärseiten (`<SeitenKopf>`, ErrorBoundary, 404-Wegweiser, seo.ts Title/Meta).
Bewusst NICHT: reich-JSX-Checkboxen aufs Primitiv restrukturiert (0 sichtbarer
Gewinn, Sweep-Risiko bei verschachtelten Handlern — bleiben inline, aber
tap-/marken-konsistent). Tore + `build` grün vor jedem Commit; §9-Review
«deploy-tauglich»; Deploy aus sauberem /tmp-Worktree.

## Session 15.6.2026 — Prozesskosten-Cockpit GEBAUT + DEPLOYED (Hauptmoat P1)

**Auftrag David (vielstufig): Prozesskostenrechner zum vollen Cockpit vertiefen,
fundiert recherchieren, alle Sonderkonstellationen, doppelt verifizieren +
normhinterlegen, Logik-/Bug-Check, deployen.** Erledigt + LIVE auf
lexmetrik.vercel.app (`dpl_9YUEU1tckdLYK4wyJ7besDZsjnn9`, origin/main `0896d6c`,
22 Commits inkl. paralleler UI-Redesign-Session E1–E10).

**Cockpit `/rechner/prozesskosten`** (Engine `lib/prozesskosten.ts` + Datenschicht
`src/data/tarif/*` + Primitiv `lib/tarif/staffel.ts`): Matrix **Kanton ×
Verfahrensphase (Schlichtung/Entscheid) × Verfahrensart (ordentlich/vereinfacht/
summarisch) × Instanz (erst/Rechtsmittel/Bundesgericht) × Materie** →
Gerichtskosten + Parteientschädigung getrennt (Art. 95/96), Art. 113/114-
Kostenlos-Vorschalter (Miete nur Schlichtung), **Kostenrisiko nach Obsiegensquote
(Art. 106/111)**, Ermessenskriterien bei Spannen, **interkantonale
Vergleichstabelle**, jeder Wert mit amtlichem Link/Erlass/Stand/Verifikationsstand.
Bundesgericht: BGG Art. 65/68 + Reglemente (`data/tarif/bundesgericht.ts`).

**Recherche (alle doppelt verifiziert, normhinterlegt) — bibliothek/:** Dossiers
prozesskosten-zpo-95-96 · -bundesgericht · -sonderkonstellationen (104/132) ·
-wettbewerbsanalyse; Register gerichtskosten- · parteientschaedigung- ·
kosten-modifikatoren- · sonderkonstellationen-tarife-kantone (877 Sonderregeln).

**§9-Logik-/Bug-Check** (Workflows wk6eknug5 + w04tm2mr9, je 4 Lupen + adversarial)
abgearbeitet. **OFFEN für David:** Modifikatoren sind ERSTRECHERCHE
(`verifiziert: 'recherche'`, Caveat sichtbar) — vor `geprüft` Abnahme +
GR-Modifikatoren/LU-PE/BE-RM-GK am Wortlaut bestätigen; Fahrplan-Restposten
I6 (Vorschuss/MwSt/Auslagen) · I7 (Instanz-Akkumulation) · I8 (PDF) · I9
(Notariat etc.) in `FAHRPLAN-PROZESSKOSTEN-COCKPIT.md`. Nichts trägt `geprüft`.

## Session 14.6.2026 — Ausbau-Direktive + Ultra-Fahrplan PRODUKTAUSBAU & BURGGRABEN

**Neue aktive Direktive David (14.6.2026):** Bis zu den ersten Kanzleigesprächen
(Monate weg) ist das Ziel maximaler Produktausbau zu einem *imposanten Produkt
mit Burggraben* — Maßstäbe Praxistauglichkeit · Skalierbarkeit · fachliche Tiefe.
**Abnahme-Welle/Validierung bewusst zurückgestellt** (nicht mehr proaktiv
treiben). Verankert: `STRATEGIE-PLATTFORM.md` (Kopf-Block) + Memory
`lexmetrik-ausbau-direktive`.

**Neuer Fahrplan `FAHRPLAN-PRODUKTAUSBAU-BURGGRABEN.md`** (Ultra-Workflow, 16
Agenten: 5 Bestandsleser → 4 Säulen-Designs inkl. 3-Wege-Panel für die
Fall-Kontext-Säule → 3 adversariale Kritiker [Solo-Machbarkeit · CLAUDE.md-Treue
§1–§6 · Moat/Imposanz] → Synthese). Kern: **P0** Schema-Registry + Drift-Guards
(Bau-Hygiene, §6-verhaltensneutral) · **P1 Hauptmoat** Prozesskostenrechner
26/26 (deterministische Tarif-Staffeln statt Prosa; Verfallsregister VOR
30.6.2026 wegen SG GKV-Ablauf) · **P2** schlankes Fall-Kontext-Rückgrat
(URL-Transport, kein Cockpit) · **P3** fachliche Spitze (Zustellfiktion +
kant. Gerichtsferien + Feiertags-Verifikation) · **P4** opportunistisch.

**Umsetzung begonnen (14.6.2026): P0/C1 GEBAUT (ungepusht).**
`src/lib/vorlagen/registry.ts` = SSOT über die Menge aller 28 gebauten Vorlagen
(25 Einzel-Schemas + 3 Dokumentmappen AG/GmbH/KE); referenziert die echten
Modul-Exporte (Schema-Objekt, `zusammenstellen`/Mappe-Builder, `DEFAULTS`,
optionale Gate-Prüfung), deklariert nichts neu (§5/§1). Drift-Guard
`src/tests/vorlagenRegistry.test.ts`: Bijektion Registry↔Katalog-`schemaId`,
`schema.id === schemaId`, Karte+Route je schemaId, Identitäts-Guard gegen die
`kv`-Namenskollision (klageVereinfacht vs. kuendigungAllgemein). §6: Gate voll
grün, golden byte-gleich (verhaltensneutral; Registry wird von Golden/Engines
nicht importiert). Test-/Skript-Modul (nicht aus UI importieren — Bundle).
C1b (golden-outputs aus Registry) bewusst zurückgestellt (niedriger Wert,
hohe Byte-Fragilität) · C4 offen.

**P1 Hauptmoat begonnen — B-P0a GEBAUT (ungepusht):** `src/lib/tarif/staffel.ts`
= fachneutrales, deterministisches Tarif-Staffel-Primitiv (§2/§4 Infrastruktur,
kein Recht). Diskriminierte Regel-Union `fix · sockel_prozent · promille ·
staffel_inklusiv · staffel_exklusiv · rahmen · formel_extern`; Bandgrenzen
explizit typisiert (inklusiv/exklusiv, §1); `rahmen`/`formel_extern` tragen
KEINEN Betrag (Ergebnis-Union zwingt ehrlichen Rahmen, §2/§8). Test
`tarifStaffel.test.ts` (11) inkl. **Charakterisierung gegen die gebvKosten-
Pfändungsstaffel** (Art. 20 GebV SchKG) → spätere byte-gleiche Ablösung möglich.
Gate voll grün.

**B-P0a/Primitiv erweitert + RECHERCHE KOMPLETT (14.6.2026, Aufträge David
«beide Tranchen · Honorar dazu · doppelt prüfen · praxistauglich · kostenlose
Verfahren · amtliche Links»):** `tarif/staffel.ts` deckt jetzt 7 Tarifformen
(fix · sockel_prozent · promille · staffel_inklusiv/exklusiv · **staffel_rahmen**
· **staffel_sockel_prozent** · **staffel_voll_prozent** · rahmen · formel_extern),
§2/§8-ehrlich, Charakterisierungs-Tests ZH/AG/BS. §7-Grundlage:
`bibliothek/recherche/prozesskosten-zpo-95-96.md` (Art. 95/96/98/113/114 ZPO,
Fedlex 1.1.2025 verbatim — Engine teilt Gerichtskosten↔Parteientschädigung;
Schlichtung↔Entscheid-Kostenlos-Unterscheidung). **Alle 26 Kantone × 2 Tarife
amtlich (doppelt) verifiziert** und durabel als Register persistiert (je mit
amtlichem Link/Erlass/Stand/Artikel/TarifRegel/kostenlos-Hinweis):
`bibliothek/register/gerichtskosten-tarife-kantone.md` +
`…/parteientschaedigung-tarife-kantone.md`. Befund: ZH/AG/VD/ZG/GE/SG/AI/AR
deterministisch, Mehrheit Ermessensrahmen je Streitwert-Band, FR/SO/GR/GL/SH/SZ
aufwandbasiert. Re-Verif offen: AG (GK), SZ/GL/SH/GR (PE). Workflow-Runs
wf_47cbdc5e (GK T1) · wf_3afb439f (GK T2) · wf_17e78208 (PE).

**P1 HAUPTMOAT GEBAUT (14.6.2026, ungepusht):** Datenschicht
`src/data/tarif/{typen,gerichtskosten,parteientschaedigung}.ts` (alle 26 Kantone
× 2 Tarife, je amtlicher Link/Erlass/Stand/Artikel/verifiziert) · Engine
`lib/prozesskosten.ts` nach Art. 95 (Gerichtskosten + Parteientschädigung
getrennt; Art. 113/114-Kostenlos-Vorschalter inkl. Miete/Pacht nur Schlichtung;
Art. 95 II lit. a Schlichtungspauschale ≠ Entscheidgebühr ehrlich; Art. 98-
Vorschuss; `vergleichAlleKantone`) · Rechner `/rechner/prozesskosten`
(Karte entwurf, Klarnamen-Kantone, **interkantonale Vergleichstabelle**) ·
Tarif-Primitiv um %-vom-Streitwert-/Deckel-/Voll-/Sockel-Prozent-Typen erweitert.
**§9-Bug-Check** (4 Lupen + adversarial, Run `wk6eknug5`): 2 HOCH + 4 MITTEL +
NIEDRIG behoben (Schlichtungspauschale, verifiziert-Stand, BS/SZ-Register,
INF=Infinity, ganze Franken, Monotonie). Re-Verif unsicherer Tarife abgeschlossen
(`wibiq1gbs`). Gate grün, Build 50 Routen prerendered, empirisch (Playwright)
verifiziert. §11-Dossier `prozesskosten-zpo-95-96.md` + 2 Register.
OFFEN: Push+Deploy (Davids frisches Ja) · später B-P0b Verfallsregister-CI
(VOR 30.6.2026 SG GKV) · Parteientschädigung-Detailband-Abnahme David.

## Session 13.6.2026 (Abend) — FUNDAMENT-UMBAU Phasen 0/1a/4 + Bug-Check (Auftrag David «mache fertig … nochmals bug check»)

**Architektur-Umbau nach `FAHRPLAN-FUNDAMENT-UMBAU.md` (abgenommen), je Gate
voll grün, golden/prerender byte-bewiesen, ungepusht (6 Commits `223fcae`..
`fc5ec96`):**
(1) **Phase 0 — Doku-Hygiene/Tooling (`4bcb5b7`):** sieben 11.6.-Session-Karten
byte-genau rotiert (STRUKTUR 803→619 Z.); DESIGN/RECHNER-DESIGN/
VEREINHEITLICHUNG/TOKEN-DISZIPLIN ins `archiv/` (alle 0 offene Etappen);
`requirements.txt` für den einzigen Python-Lauf. GRUNDLAGEN (8 offene Posten,
Nordstern) + AG-/GMBH-GRUENDUNG + BGER-RECHTSWEG bewusst im Root.
(2) **Phase 1a — Routen-SSOT (`f33ec88`/`11155bb`, Thema B):** neues
`src/routesManifest.ts` (44 Karten-Routen, Pfad→Lazy), App.tsx rendert
`ROUTEN_MANIFEST.map` (−89 Z.), `seo.ts katalogRouten()` als Single Source,
Gating-Test `routenManifest.test.ts` (Manifest === Katalog beide Richtungen).
§5-Verstoß (doppelte Pfad-Existenz App.tsx↔Katalog) geheilt. Beweis: build →
49 Routen, sitemap byte-gleich (Hash `67e8bed3`), Code-Splitting unverändert.
(3) **Phase 4 — §7-Abnahme-Dossiers (`ddac5dd`, Thema C):** generischer
`scripts/abnahmeDossier.ts`; AG-Dossier byte-identisch; additive
`GMBH_ALLE_SCHEMAS`; `scripts/abnahme-dossiers.ts` erzeugt 26 Dossiers (GmbH +
25 Vorlagen, 432 Bausteine) nach `abnahme/dossiers/` → Wortlaut-Abnahme aller
Gebiete ohne TS-Lesen (bisher nur AG).
(4) **Bug-Check (§9, `fc5ec96`):** 4-Dimensionen-Multi-Agent + adversariale
Verifikation über das Delta; 3 bestätigt (alle niedrig/mittel, KEINE
Rechtslogik): AG-Konsolenzahl wiederhergestellt + `KV_SCHEMA`→`KLAGE_V_SCHEMA`
(klageVereinfacht, §5-Namensfalle) gefixt; Verifikationsstand-Drift (vor-
bestehend) offen. Deploy-Urteil: keine Blocker.

(5) **Thema A — generische `VorlagenSeite` + Pilot (`325ccc1`):**
`src/components/vorlagen/VorlagenSeite.tsx` übernimmt die fehleranfällige
Orchestrierung (useWizardState, useMemo, pruefen-Scaffold, DOCX-Gate,
VorschauPanel); `seiteHelfer.ts` (istIsoDatum/docxAktiv, Schritt-2-Dedup).
Pilot **Forderungsabtretung** umgestellt — §6-Beweis: golden 166 byte-gleich +
**Playwright-DOM byte-identisch über alle 3 Schritte + bedingtes Feld**; Logik-
Check: src/lib unberührt, Sweep 14448 ohne Widerspruch. Opt-in; seiten-
spezifisches JSX bleibt in der Config (§1).

(6) **Thema A — Rollout (`6a2c538`, `c175d4c`):** Verjährungsverzicht,
Nichtbekanntgabe + Mahnung auf `VorlagenSeite` umgestellt — **4 lineare Seiten
gesamt: FA/VV/NB/Mahnung**. VorlagenSeite opt-in erweitert: `zeigeWarnungen`
(gates.warnungen) · `fehlerEingabe(a,schritt,gates)` · `blockerImLetztenSchritt`
(Mahnung false). §6 je Seite: gate grün, golden byte-gleich, Playwright-DOM
byte-identisch (alle Schritte/bedingte Felder/Mahnung beide Varianten) v/n.

(7) **Grundsatz David «kein Eingabefehler im leeren Zustand» (`05c1899`,
`2d69e8a`):** Fehlerbox erst nach erster Eingabe («berührt»). Wizards zentral im
`VorlagenWizardRahmen`; Rechner-Forms via internem `BeruehrtContext` +
layout-transparentem `BeruehrtRahmen` (display:contents) in `ui.tsx`, 11 Forms
umschlossen. «Weiter» bleibt bei leeren Pflichtfeldern gesperrt. golden byte-
gleich (Rechtslogik unberührt), Playwright-verifiziert. Memory:
[[formulare-kein-fehler-vor-eingabe]]. Die meisten Rechner haben ohnehin
Beispiel-Defaults (keine sichtbare Änderung) — betraf v.a. die Wizards.

**NICHT umgesetzt (bewusst, §1/Konflikt-Register):** Rollout `VorlagenSeite`
auf weitere Seiten — VariantenKopf-/Mehrschritt-/eigenes-Gate-Seiten bleiben
handgeschrieben); Phase 5 Verbatim-Hebung (Gefahrenzone), Persistenz-/i18n-
Features; David-Entscheide (Server-Sync, fr/it-Inhalt, LIK Python→TS). TODO:
Drift-Guard `check:abnahme` (Dossiers regenerieren + git diff). Push/Deploy nur
auf frisches Ja (§9).

## Session 13.6.2026 — V3 Vertrags-Grundtypen KOMPLETT + Verwaltungs-/BGG-Stillstand (GO David «weitermachen mit bau» + eingeschobener Auftrag)

**FAHRPLAN-VORLAGEN-AUSBAU V3 ist mit 4/4 Grundtypen FERTIG** (je eigener
Commit, je Gate GRÜN + Build prerendered):
(1) **Auftrag/Dienstleistungsvertrag** `41dccc3` — Art. 394 ff. OR;
Gegenstands-Module allgemein/Beratung/Treuhand/Inkasso, Vergütungsweiche;
Kern-Offenlegung zwingendes Auflösungsrecht Art. 404. (2) **Werkvertrag**
`704aa85` — Art. 363 ff. OR; Weiche beweglich/unbeweglich → Rügefrist
(60 Tage zwingend, Art. 367 Abs. 1bis) und Verjährung (2/5 J, Art. 371);
Festpreis/Aufwand; Brücke zum Gewährleistungs-Rechner; Rücktritt Art. 377.
(3) **Geheimhaltungsvereinbarung/NDA** `5aa4b62` — Innominat (Art. 19 OR);
einseitig/gegenseitig + Konventionalstrafe (Art. 160/161/163, richterliche
Herabsetzung offengelegt). (4) **Konkubinatsvertrag** `d081391` — Art. 19
OR / Art. 646/650/651 ZGB / Art. 530/548/549 OR; Module Wohnen/Kosten/
Inventar/einfache Gesellschaft/Auflösung; kein gesetzliches Konkubinats-
recht + Kindesbelange nach Gesetz offengelegt. Endstand: Zähler 47 gebaut/
43 sichtbar, Golden 159, Routen 49.

**EINGESCHOBENER AUFTRAG David («baue parallel den Verwaltungs-Stillstand
Art. 22a VwVG und den BGG-Stillstand Art. 46 BGG im fristenrechner»):**
neue Engine `lib/bggVwvgFristen.ts` (reine Kompositions-Schicht über
fristenEngine) + zwei Ferien-Optionen im EinfacheFristForm. Beide Regimes
teilen die drei Stillstandsperioden (Ostern ±7 · 15.7.–15.8. · 18.12.–2.1.)
und den Ruhen-Mechanismus mit der ZPO (golden-bewiesen periodengleich);
regime-treu erhalten (kein Kollaps, §4): Geltung NUR für nach Tagen
bestimmte Fristen (Wochen/Monate/Jahre ruhen NICHT — anders als ZPO 145),
Abs.-2-Ausnahmen je Regime verschieden (VwVG 2 / BGG 5), Werktag-
verschiebung Art. 20 III VwVG / 45 I BGG. Empirie handgerechnet
(10.9./11.1.2027/11.5.). Dossier `bibliothek/recherche/stillstand-vwvg-
bgg.md` (§11). Alle V0-Anker am Filestore-Cache verifiziert (OR/ZGB
20260101, VwVG 20220701, BGG 20260401; check:zitate 0 Befunde).

OFFENE FOLGEPOSTEN: fachliche Abnahme der V3-Vorlagen + des Stillstand-
Wortlauts durch David · V4 (Detailgrad-Schalter) · V5 ff. Ungepusht;
Push/Deploy nur auf frisches Ja (§9).

## Session 13.6.2026 (Nacht) — V2-Rest KOMPLETT: Zession · Fristerstreckung · Nichtbekanntgabe (GO David «arbeite einfach»)

**FAHRPLAN-VORLAGEN-AUSBAU V2 ist mit 4/4 Vorlagen FERTIG** (je eigener
Commit, je Gate GRÜN + Build prerendered + Playwright-Sichtcheck):
(1) **Abtretungserklärung (Zession)** `5d4ccf8` — Art. 164/165/167/170 OR
verbatim am 20260101-Cache; Schriftform-Unterschrift Zedentin, optionale
Gegenzeichnung, Zinsen-Klarstellung (170 III nur Vermutung), Hinweise
Abtretungsverbot/Anzeige/Verpflichtungsgeschäft. (2) **Fristerstreckungs-
gesuch** `fd10ff1` — Art. 143/144/148 ZPO; Frist-Art-Weiche (gesetzlich =
Blocker mit 148-Hinweis), Gesuch nach Fristende = Blocker, letzter Tag =
143-I-Warnung; Begründung Maske/Platzhalter; ThemenEinstieg am
ZPO-Fristen-Rechner. (3) **Nichtbekanntgabe Betreibung** `3d1fc99` —
Art. 8a III lit. d SchKG in der NEUEN Fassung seit 1.1.2026 (AS 2025 522)
verifiziert ([VF] der Analyse aufgelöst); Rechtsvorschlag-Pflicht,
3-Monats-Schwelle mit konkretem frühestem Gesuchstag (Klemmfall 30.11.
handgerechnet), ehrliche Wieder-Bekanntgabe-Offenlegung; ThemenEinstieg
am SchKG-Fristen-Rechner. Endstand: Zähler 43 gebaut/39 sichtbar,
Golden 134, Routen 45. OFFENE FOLGEPOSTEN: Prefill-Brücke zpo-fristen→
Fristerstreckung · SchKG-Anliegen «Nichtbekanntgabe» für den
VorlagenSprung (Entscheid David). Ungepusht; Push/Deploy nur auf
frisches Ja (§9).

## Session 12.6.2026 (spät) — Pauschal-Abnahme Wortlaute (David) + V2-Fortsetzung

**Pauschal-Abnahme David («alles abgenommen»), Protokoll
`abnahme/wortlaute-2026-06/PAUSCHALABNAHME-2026-06-12.md`:** Wortlaute
geo.admin-Datenschutz-Absatz + «Beim Bund nachschlagen» · Zefix-Absatz ·
KVG-Preset Maske 3 · TI-Miete-Texte · FE-1-WARUM/FE-2-Weiche ·
Mahnung-Bausteine · BGer-Hinweise inkl. Eheschutz-V-1 — sowie die
**P1-Priorisierung der Wettbewerbsanalyse** (V2-Rest/V3 ff. freigegeben).
NICHT umfasst (bleibt offen): Karten-«geprüft»-Hebungen (brauchen
Karten-Verdikt + Referenzfall-Protokoll; Paket Tagerechner liegt in
`.scratch/`), Teil D, Praxis-Rang-Kuratierung, Anliegen-Liste, übrige
Dossiers. Status-Stellen nachgeführt (Datenschutz.tsx-Kommentare,
Dossier-/INDEX-Zeilen, FAHRPLAN-VORLAGEN-AUSBAU, HANDLUNGSPLAN A.3/A.4);
Datenschutz-Seite als GANZE bleibt Entwurf (Platzhalter Ziff. 1/4).

## Session 12.6.2026 (abends) — StGB-Re-Pin vollzogen (Verfallsregister-Termin)

Der am 12.6.2026 fällige, terminierte **StGB-Re-Pin (AS 2026 231) ist
VOLLZOGEN:** `fedlex-cache.sh` neu `20260612|0` (No-Suffix wie im
Voraus-Check vorausgesagt). Empirie am Stichtag: Anker-Inventar 477/477
identisch; alle 7 engine-zitierten Pflicht-Anker normtext-identisch zu
20260101 (Diffs nur Fussnoten-IDs); materiell geändert NUR Art. 354/357
(Eurodac/Schengen-Datenaustausch, nicht verdrahtet). Nachgeführt:
Quellen-Register, Verfallsregister (nächster Stichtag 1.7.2026 ZGB/ZPO),
Dossier-Nachtrag `fedlex-pin-nachverifikation-2026-06.md`. Tore:
`check:caches` → `check:zitate` (616 Zitate, 0 Befunde) → `check:verfall`
(StGB-Meldung weg) grün. Kein Engine-Code berührt. Ungepusht; Push/Deploy
nur auf frisches Ja (§9). In 45-Tage-Vorschau weiter: ZGB/ZPO-Re-Pin +
Streitwert-Formeln 1.7. · SG GKV 30.6.

## Session 12.6.2026 (Fortsetzung) — TI-Miete gemeindescharf + vertiefter §9-Bug-Check (Auftrag David: «tessin vertiefung, bug check, push, deploy»)

**(1) TI-Miete VERDRAHTET** (`6cf5802`) — der LETZTE Kanton ohne
Miete-Auto-Auflösung ist geschlossen (12/12 Register + 13 zentral +
NE-Wahl): Zuordnung amtlich doppelt belegt (Art. 5 LALoc RL/TI 3.3.2.1.4
+ amtliche Località-Suche locazione, **168/168 einzeln abgefragt**);
Praxis-Quelle geht dem 2005er-Wortlaut vor (Ex-Sonvico → n. 4, Claro →
n. 11). 97 Gemeinden eindeutig (TI_MIETE, Dossier §51 + Patch-Generator)
+ 3 Mehr-Uffici-Gemeinden via Ortsteil-Wahl (Lugano n. 3/4 · Bellinzona
n. 9/10/11 · Val Mara n. 5/2). Stammdaten-KORREKTUR Agno: Contrada
Nuova 3. 8 Selektor-Optionen = kantonale CMS-Lücken, über Mutter-
gemeinden geschlossen; Giudicature-Lücken (Ambrì/Pianezzo/S. Antonio/
Torre) am 12.6. nachgefasst: beim Kanton unverändert offen.
**(2) VERTIEFTER §9-BUG-CHECK (Auftrag David), 6 unabhängige Lupen**
(Code · fachlich mit ~45 amtlichen Gegen-Abfragen · Empirie/E2E ·
Daten-Integrität über ALLE Indizes · Integration/SSG · Edge-Cases mit
echten Aufruf-Batteries): **1 HOCH + 5 MITTEL + 7 NIEDRIG, alle
relevanten GEFIXT** (`4bc80e8`): HOCH TI-Miete-Ortsteil-Meldung sass im
unerreichbaren verzeichnis-Zweig (3 Lupen übereinstimmend; jetzt im
liste-Zweig, empirisch verifiziert) · kreisIdx jetzt geschlüsselt
(stale Wahl reiste in neue Liste: 8044→8050 meldete 0.2-%-Amt) ·
kantonFest-Guard in PlzGemeindeWahl (kantonsfremde Strassen-Auflösung
wird offengelegt) · Bund-Übernahme leert ZH-Strasse · Apostroph
U+2019↔ASCII + ALL-CAPS-«STR.» in strassenKandidaten (~1'300
Romandie-Strassen) · Versatz-PLZ ohne Index blenden das Strassenfeld
aus · FL-404-Meldung · KVG-64a-Warnung um Kinder-Ausnahme präzisiert
(deklariert, Fedlex wörtlich). Bestanden u. a.: SSG-Tore/Chunks sauber
(Daten nur lazy), PDF-Kette §5, CSP, alle Daten-Invarianten exakt,
0 Falschtreffer/0 Exceptions in allen Edge-Batteries, ti.ch/WFS/Fedlex-
Stichproben deckungsgleich. **OFFEN dokumentiert:** SZ ordentlich 26/30
(Alpthal/Lauerz/Steinerberg/Wangen fehlen quellbedingt — SZ-Vermittler-
Erhebung als Kandidat; SZ_MIETE deckt 30). Tore: gate voll GRÜN.
**PUSH + DEPLOY VOLLZOGEN (12.6.2026): origin/main = Prod = `7ff7315`**
(dpl_CWUebRfaqtCdhzraMDHJYr9qXpuu, /tmp-HEAD-Worktree, Hash live=lokal
index-B8c9RHkx, 8/8 Kernrouten 200, CI grün). **CSP-Klicktest auf Prod
BESTANDEN:** Bundes-Adresssuche live (Limmatstrasse 152 → 8005/Zürich/ZH
übernommen, 0 CSP-Fehler — connect-src api3.geo.admin.ch wirkt);
ZH-Kreis-Automatik auf Prod verifiziert. **Verfallsregister meldet
fällig: StGB-Re-Pin 12.6.2026 (AS 2026 231) — nächste Session.**

## Session 12.6.2026 — ZH-Kreis-Automatik + Adress-Ausbau Stufen 1–3 (Entscheide David, ungepusht)

**(0) Verifikationsfrage David beantwortet** (`8842bfd`): Stadt-Zürcher
PLZ sind **NICHT kreisscharf** (16/30 mehrkreisig; amtliche
Gebäudeadressen Stadt ZH, 56'666 real) — dank Ämter-Paarung sind 19 PLZ
amts-eindeutig → **Kreis-Automatik**: eindeutige PLZ lösen das
Kreis-Friedensrichteramt automatisch, mehrdeutige zeigen die
eingegrenzte Wahl mit Adressenanteil (dominant vorausgewählt), Postfach
→ Sechser-Wahl. Generator `zh-kreise-generieren.ts` → zuerichPlzKreise.
**(1) Stufe 1** (`0ec3a5d`): Strasse (+ Nr.) → Kreis-Amt offline
(`zhStrassen.json`, 1'984 Strassen, 58 amts-übergreifende per
Hausnummer; 26 KB gz); Vorrang Strasse → PLZ → Wahl, beide UIs.
**(2) Stufe 2** (`3bd6a9a`): schweizweit Strasse (+ Nr.) → Gemeinde bei
den 1'213 gemeinde-mehrdeutigen PLZ (47.4 % aller Adressen) — swisstopo
Gebäudeadressverzeichnis (3.24 Mio real) → `strassenVerzeichnis.json` +
`strassenNummern.json` (91'218 eindeutige Strassen, 1'425 Grenzstrassen
per Nummer; ~0.56 MB gz, eigene Lazy-Chunks); wirkt in PlzGemeindeWahl
(alle Eltern-UIs); kantonsübergreifend belegt (4052 Birswaldweg →
Münchenstein BL). Lint-Härtung `cb917b6` (PLZ-geschlüsselter Zustand).
**(3) Stufe 3** (`10ce93d`): `AdresseBundSuche` (§10) — Freitext-Adresse
über die Bundes-API (geo.admin.ch SearchServer + GWR-Detail) NUR auf
Klick, **permanenter Übermittlungs-Hinweis** + Offline-Alternative
benannt (Anweisung David); kantonsfremde Treffer offengelegt statt
übernommen; CSP + api3.geo.admin.ch (nur am echten Vercel prüfbar);
/datenschutz-Absatz ENTWURF. Empirie: Playwright beide UIs inkl.
Live-API (Bundesplatz 3 Bern → 3011/Bern/BE); 8044-Lehrstück
(Gockhausen→Dübendorf): Kreis-UI korrekt erst nach Gemeinde-Wahl.
Dossiers: gebaeudeadressverzeichnis-adressaufloesung.md (+ Verfalls-
Kandidat Re-Generierung 1.10.2026) · ZH-Vollerfassung Nachträge.
**OFFEN für David:** Wortlaut-Abnahmen (Datenschutz-geo.admin-Absatz,
«Beim Bund nachschlagen», Hinweis-Texte) · Verfallsregister-Eintrag
1.10.2026 entscheiden. Tore: gate voll GRÜN, Build 38/38.
**16 Commits ungepusht — Push/Deploy nur auf frisches Ja (§9).**

## Ältere Session-Karten und Chroniken — rotiert ins Archiv

Verbatim verschoben nach `archiv/STRUKTUR-SESSIONKARTEN.md`
(FAHRPLAN-TOKEN-DISZIPLIN.md T-4): **13.6.2026** alle sieben 11.6.-Karten
(früher Abend · später Nachmittag · abends · nachmittags · vormittags ·
über Nacht · Tag «Schlichtung fertig + Vollerhebungen») · **11.6.2026**
Sessions 10.6. abends (STRUKTUR-UMBAU S-1–S-6) und nachmittags
(Fristen-Einheit FE-1–FE-6) · 7.6. abends (Betreibungsamt-Finder) und
nachts (Plan 9b Volldokumente) · 6.6. abends und nachmittags ·
Verschlankung 5.6.2026 · Session-Abschluss 6.6.2026.

## Verifikationsstand (eine Zeile)

Stand 11.6.2026: Build + 38 Prerender-Routen ✓ · Lint 0/0 ✓ · Suite 1404
grün + 2 skipped (78 Dateien) ✓ · tsc STRICT · Golden 104/104 byte-gleich ✓
· Logik-Sweep 14'448 Kombinationen ✓ — Workflow: **`npm run gate`** (bzw.
`gate:schnell` pro Iteration; leise bei Grün, volle Ausgabe nur für rote
Tore, CLAUDE.md §6 Ziff. 1/5); `npm run check` für die Offline-Checks,
`npm run check:netz` für Fedlex; vor Deploys unabhängige Review-Agents
(Skill `deploy-check`).

**Informationsbibliothek: `bibliothek/INDEX.md`** — Quellen-Register
(verifizierte Fedlex-Stände inkl. ZPO-Revision 2025), Parameter-
Verfallsregister, Recherche-Dossiers (Schlichtungsbehörden 26 Kantone),
ZPO-Normtexte für die Zuständigkeitsengine.

**Zuständigkeitsengine (`src/lib/zustaendigkeit.ts`, Phase 1 — entwurf):**
Bundesrechtsschicht nach ZUSTAENDIGKEIT-AUFTRAG.md (Spezifikation im
Repo-Root): Verfahrensart (Art. 243 inkl. Abs.-3-Vorbehalt), Schlichtung
(197–200), Entscheidkompetenz (210/212, Revision 2025: 10'000),
Gerichtsstände (10/32–35), HG-/Direktklage-Weichen (6/8). 30 Tests mit
beidseitigen Schwellen-Grenzwerten. **Phase 2 erledigt:** Kantonsschicht
`data/zustaendigkeitKantone.ts` (BS-Pilot, Stellen-Auflösung über
behoerden.ts, GOG-Schwelle bewusst null/offen) + SG_SCHWELLEN beziehen
die Zuständigkeits-Schwellen aus ZPO_SCHWELLEN (SSoT §5, golden-bewiesen
byte-gleich). **Phase 3 erledigt:** /rechner/zustaendigkeit (Form §3-rein,
Eckdaten-Tiles, Stelle mit Adresse/Quelle, Weichen offen, PDF-Bericht);
Katalogkarte `zustaendigkeit` (pro/entwurf) ersetzt die drei geplanten
Karten gerichtsstand/verfahrensart/schlichtung. **Phase 4 erledigt:**
Prefill-CTA → Schlichtungsgesuch BS (sgPrefillKodieren/Lesen; nur bei
ordentlicher Behörde + erfasster Stelle; Golden byte-gleich) — MVP
end-to-end. OFFEN: weitere Kantone (nach Dossier-Abnahme), weitere
Ziel-Vorlagen. Davids fachliche Abnahme steht aus.

## Informationsarchitektur (Stand EINE Hauptseite 7.6.2026)

**EINE Hauptseite (FAHRPLAN-EINE-HAUPTSEITE.md, Auftrag David 7.6.2026 —
hebt die Free/Pro-Zweiteilung vom 5.6. wieder auf):** `/` trägt den
VOLLSTÄNDIGEN Katalog (Gebiets-Kacheln, Suche `?q=`, Panel `?gebiet=`,
Anliegen-Zeile, «Zuletzt verwendet») hinter einem kompakten Hero
(Free-Nutzen-Headline in h2-Höhe; Kennzahlen OHNE Preisaussage bis
Monetarisierungs-Entscheid G1). Davor eine kuratierte Chip-Zeile
**«Häufig gebraucht»** (`lib/haeufigGebraucht.ts`, Nachfolger der
Free-Kachelwand-Kuratierung; nur Verfügbare erscheinen). `tier`-Feld,
`PAYWALL_ACTIVE`, `lib/proSession.ts` (Pseudo-Login) und der
Header-Pro-Button sind ENTFERNT (D-3; Stand vor dem Rückbau: Git-Historie
bis `2e80daf`). `/pro`, `/fachpersonen`, `/rechner` → DAUERHAFTE Redirects
auf `/` mit erhaltenem Suchstring (Permalink-/.ics-Link-Erbe). Mobil erbt
die Hauptseite den vorbestehenden 390px-Overflow des Katalogs
(FAHRPLAN-DESIGN Etappe 4, offener Strang).

**Katalog-Gliederung: primär nach RECHTSGEBIET** (17 kanonische Sektionen
in fester Auftrags-Reihenfolge, `RECHTSGEBIET_SEKTIONEN`), darunter je die
Untergruppen **Rechner** und **Vorlagen** (nur nicht-leere). Output-Typ
(Rechner) und Dokument-Typ (Vorlagen) sind FILTER; Rechtsbereich-Filter und
Suche bleiben. **Der frühere Modus-Umschalter (Primärweiche Rechner |
Vorlagen) ist damit abgelöst und entfernt**; `?modus=`-Links bleiben
harmlos; die Alt-Gliederungen ('art'/'bereich') sind aus dem Code
entfernt. Header = Zwei-Zonen (Logo links, Aktionscluster rechts:
Sprache · Methodik — Pro-Button entfernt 7.6.2026, Methodik seither auch
mobil), Mitte leer; Utility-Bar nur Pflichthinweis rechts, mobil
ausgeblendet.

**Design-Tokens (Feinschliff 5.6.2026, single source tailwind.config +
index.css):** Typo-Skala GESCHLOSSEN — micro 11 · overline 11 · xs 12 ·
body-s 14 · base 16 · body-l 18 · h3 20 · h2 25.6 (auch Ergebnis-Hauptwerte
mit `leading-none`) · h1 32 · display 36/44 (Heroes). **`text-sm`/`text-lg`
sind verboten** (Tailwind-lh weicht ab; body-s/body-l verwenden). Radien
komplett tokenisiert (--radius-sm…2xl). Status-Hintergründe nach EINEM
Rezept (`color-mix --status-tint 10%` auf Papier; AA geprüft). Motion:
--dur-fast/base/slow + --ease, Default-Easing global. Komponenten-Anatomie:
`lc-tile` (Ergebnis-Kachel) · `lc-notice[-warn|-danger]` eigenständig (kein
Inline-Padding!) · `lc-btn-sm` (36px) · disabled steckt in den
lc-btn-Klassen (keine disabled:-Utilities) · ein Aktions-Akzent
(lc-btn-primary; lc-btn-brass entfernt).

**Layout:** Inhaltsspalte einheitlich `max-w-content` = **70rem (~1120px)**
(Token in tailwind.config); 8-px-Skala `--space-1…24`, `--control-h` 44px,
`--pill-h` 36px. Hero text-geführt einspaltig (keine Deko-Grafik, bewusst
nicht animiert), Untertext ≤ 58ch; Determinismus-Claim genau EINMAL (Hero).
Kartenraster `repeat(auto-fill, minmax(340px, 1fr))`; Titel ohne Silben-
trennung (`text-balance`); Pills im Inhaltsblock, nur CTA per `mt-auto`
unten. Keine Ziffern in Sektionsköpfen/Sidebar (konsistent nirgends).

**Pro-Katalog = KACHEL-KATALOG (Umbau 6.6.2026 nachts, Live-Auftrag David;
Roadmap + Entscheide: FAHRPLAN-KATALOG-UI.md):** Die 17 Rechtsgebiete sind
kompakte Kacheln unter den 5 Obergruppen (Name · Zähler «X verfügbar · Y in
Vorbereitung» · verfügbare Werkzeug-Titel, geklemmt). Klick öffnet das
Gebiet als Panel in voller Breite unter der Kachel-Zeile (`?gebiet=` in der
URL, teilbar; nur ein Panel zugleich); die Disclosure-Sektionen samt
Scrollspy sind entfernt. Darüber: Anliegen-Zeile (lib/anliegen.ts, 8
situative Einstiege — ENTWURF, Abnahme David offen) + «Zuletzt verwendet».

**Suche:** EIN kompaktes Suchfeld in der Katalog-Seitenleiste (Desktop)
bzw. im Filter-Drawer (mobil) — filtert den Katalog live. Die frühere
⌘K-Befehlspalette ist entfernt (Entscheid David 5.6.2026). Seit 6.6.2026:
Suche/Filter aktiv → flache, gerankte Trefferliste statt Kacheln (Rang:
Titel > Keyword exakt > Keyword > Norm > Gebiet; lib/katalogSuche.ts —
dieselbe Logik testet die Suchbegriff-Goldliste katalogSuche.test.ts,
48 Paare Laie/Fach/Norm); `?q=` in der URL; «/» fokussiert das Feld;
Keywords kompakt verglichen wie Normen («Art.311» = «311 ZPO»).
Metadaten-Inventur: `npx vite-node scripts/katalog-inventur.ts`.

**Sprachen:** Umschalter sichtbar (Header); EN/FR/IT «in Bearbeitung» mit
DE-Fallback + persistentem Banner; KEINE maschinelle Übersetzung (fachkundige
Person später). `<html lang>` folgt der Locale; Fedlex-Links ebenfalls
(fr/it amtlich — Anker stichprobenverifiziert sprachunabhängig; en → de).

## Status-Modell (ehrlich, drei Zustände)

`entwurf` (oranger Top-Rand `--warn-500` + Outline-Badge «Entwurf»
(`.lc-badge-entwurf`), Tooltip «erstellt, fachlich noch nicht geprüft»;
dazu EINE Status-Legende über der Startseiten-Kachelwand statt lauter
Einzel-Badges — Design-Review 6.6.2026, Freigabe David) = gebaut, ungeprüft ·
`geprüft` (Goldrand, KEIN Wort-Badge) = fachlich geprüft — **aktuell
nirgends vergeben** · `geplant` (gedämpft, AA-konform ohne Opacity) =
«In Vorbereitung», ohne Norm-Pills/Artikel-/Tagesangaben.
**Alle NormRefs tragen `verified: false`**, bis David sie fachkundig gegen
Fedlex prüft (Anker selbst sind build-verifiziert, Format `art_335_c`).
Form-Gates der Vorlagen bleiben im Entwurf-Status voll funktional.
Status-Filter heisst «Nur verfügbare» (= nicht geplant).

## Katalog (Quelle: src/lib/startseiteConfig.ts — Single Source of Truth)

**111 Einträge: 64 Rechner + 47 Vorlagen** (Katalog-Ausbau 5.6.2026: +59
geplante Karten gemäss KATALOG-ROADMAP.md; Soll-Inventar dort gepflegt).
Felder: modus, art, rechtsgebiet (kanonisch, 17 Werte),
**rechtsbereich** (privat/oeffentlich/straf/uebergreifend), status, norms
(NormRef mit verified), href, schemaId/formvorschrift/output (Vorlagen),
szenarien (konsolidierte Rechner), related (modusübergreifend), keywords
(**tier entfernt 7.6.2026**, FAHRPLAN-EINE-HAUPTSEITE). VorlageArt um
**korrespondenz** («Schreiben & Erklärungen») erweitert. Neue geplante
Karten: norms [], kein href, neutrale Beschreibungen (Normentreue);
Roadmap-«[Gerüst]» als «Strukturiertes Gerüst …» im Text.

**Konsolidierung (43→34):** 9 Einzelkarten absorbiert — Klagebewilligung +
Fristwiederherstellung → ZPO-Fristen; Rechtsöffnung/Aberkennung/Kollokation
+ Arrest → SchKG-Phasen; missbräuchl. Kündigung + Massenentlassung →
«Arbeitsrecht — Fristen»; Miet-Anfechtung → «Mietrecht — Fristen»;
Verzugszins-vertieft → Verzugszins; SV-Leistungsverwirkung → ATSG-Karte.
`RechnerCard.szenarien` zeigt abgedeckte/geplante Szenarien auf der Karte.

**Spät-Session 7.6.2026 (Kurzspiegel; Details HANDLUNGSPLAN.md A.0):**
Daueranweisungen §0 Mehrwert-Test + §0a Perfektion-vor-Neubau · Roadmap
−7 geplante Karten (verifiziert) · AG-Programm fertig inkl. Notariats-
tarif-Korrekturen (ZH-Rahmen 123! SG floor!) · Startseite: leere Gebiete
als «In Vorbereitung»-Zeile, Rubrik einzeilig · Vereinheitlichung Runde 1
(Tagerechner-Hash/geteilter Teilen-Button, 7 Titel-Paare + Invariante) ·
Dossiers neu: gmbh-deltas-g0, gmbh-qualifizierte-gruendung,
ag-kapitalkategorien (Bau gesperrt), BGerR-Verifikation (35/35a-Split).

**Konsolidierung Runde 2 (7.6.2026, FAHRPLAN-KATALOG-KONSOLIDIERUNG,
Auftrag David «simplifizieren — ein Einstieg pro Rechtsfrage»):** Katalog
gesamt 115→112, verfügbar 35→32 gebaut, davon **28 sichtbar**. (a) GELÖSCHT
die 3 reinen Hash-Deep-Link-Karten: untermietvertrag → Karte «Mietvertrag
(Wohnen · Geschäft · Untermiete)»; schkg-/straf-zustaendigkeit → EINE Karte
«Zuständigkeit (Zivilprozess · Betreibung · Strafverfahren)» mit szenarien
(kehrt den Katalog-Split vom 6.6. um — Davids Delegation 7.6.). (b) NEU
`imKatalog:false` (BaseItem) + `KATALOG_KARTEN`: die 4 Kündigungs-Masken
(AN/AG/Mieter/Vermieter-Checkliste) behalten ihre Karten als SSoT der
Masken-Seiten (`karte(id)`!), erscheinen aber nicht mehr im Register/Suche —
ihre Auffindbarkeit tragen die Themen-Einstiege «Kündigung & Fristen im
Arbeitsverhältnis» (ex «Arbeitsrecht – Fristen») und «… im Mietverhältnis»
(ex «Mietrecht – Fristen»), deren Rechner-Seiten die Masken direkt verlinken.
(c) Kachel-Overline zeigt jetzt `Gebiet · Rechner/Vorlage` (Funktions-
Kennzeichen, EIN Template-Literal wegen SSR-Marker). Ausdrücklich NICHT
gemergt: GmbH-/AG-Gründung (zwei Werkzeuge, echte Rechtsform-Entscheidung),
Tagerechner↔ZPO/SchKG (gewollter Laien-/Fach-Doppeleinstieg), Rechner↔
Vorlage-Paare (§5: eine Engine, zwei Ausgabeformen). Goldliste deklariert
nachgezogen (misst jetzt KATALOG_KARTEN); Davids Abnahme der neuen
Titel-Wortlaute offen.

**Gliederung (seit Katalog-Ausbau):** beide Seiten = Rechtsgebiet-Sektionen
(GebietSektion, feste §4-Reihenfolge OHNE Relevanz-Sortierung) mit
Untergruppen Rechner/Vorlagen; innerhalb der Gruppen verfügbare vor
geplanten (sortiereKarten). Filter: Status («Nur verfügbare») · auf /pro
zusätzlich Rechtsbereich · Output-Typ (Rechner) · Dokument-Typ (Vorlagen);
Suche in der Seitenleiste. Grenzfall Vorlage «Einsprache»: straf
(Strafbefehl häufiger), Verwaltungsbefehl via Keywords.

## Rechner (Engines in src/lib/, alle rein/deterministisch, kein LLM)

Gebaut (entwurf): zpo-fristen, schkg-fristen, kuendigung-sperrfristen
(inkl. **Sperrtage-Zähler**: Kontingent 30/90/180 je DJ, beansprucht nach
Art.-77-Zählung, verbleibend, Rückfall-Zeilen — Komponente
SperrtageZaehler, auch in der kombinierten Ansicht), mietrecht,
verjaehrung (Zwei-Fristen, Stillstand-Union), gewaehrleistung (Zwei-Regime
1.1.2026), verzugszins (Segmente, Art. 85-Anrechnung), lohnfortzahlung
(Skalen; Engine-Guard AUF 1–100 %), erbteilung, **allgemeineFrist**
(Free-Tagerechner, Auftrag 5.6.2026: dünne Engine auf fristenEngine/
zpoFeiertage — dies a quo IDENTISCH zu zpoFristen, Systemtest AF-14;
getrennte Wochenend-/Feiertags-Toggles, Tage-zwischen-Hilfsmittel;
SR 173.110.3 als Gesetzes-Seiten-Pill, ELI SPARQL-verifiziert).
Feiertage algorithmisch (Computus) — keine Jahres-Klippe.

## Vorlagen-Plattform (src/lib/vorlagen/)

Generische Engine: `assemble(schema, antworten)` rein/deterministisch
(Bedingungs-Algebra eq/in/nichtLeer/and/or/not; wiederholeUeber; nummeriert
mit Leerlisten-Guard; Interpolation; Bausteinprotokoll). Renderer aus EINER
Quelle: vorlagenPdf (jsPDF, Banner-API, WinAnsi-Sicherung) + vorlagenDocx
(docx-Lib, lazy geladen, Word-Formatvorlagen; XLSX architektonisch
vorbereitet, nirgends ausgeliefert). Geteilte Wizard-UI:
components/vorlagen/ui.tsx (Field, NormLink locale-bewusst, Stepper).

**8 gebaute Vorlagen (alle entwurf):**
1. **Testament** (/vorlagen/testament) — eigenhändig: Abschreib-Mustertext,
   Pflichtteils-Panel, Gates 467/505/481/472. KEIN DOCX (Eigenhändigkeit).
2. **Patientenverfügung** (/vorlagen/patientenverfuegung) — Schriftform;
   Konsistenz-Engine R1/R2, harter Sterbehilfe-Block R6 (Art. 114/115 StGB);
   PDF + DOCX (Pilot Mehrformat).
3. **Vorsorgeauftrag** (/vorlagen/vorsorgeauftrag) — formMode-Weiche
   eigenhändig (Mustertext) / beurkundet (Entwurf, DOCX nur hier);
   Eligibility-Gate Art. 13; Grundstück-Sondervollmacht erzwungen.
4. **Schlichtungsgesuch Basel-Stadt** (/vorlagen/schlichtungsgesuch-bs,
   tier experte) — Routing mit Stopp-Karten (Miete/GlG → eigene Stellen,
   Art. 198), Mängelliste mit Schritt-Sprung, SG_SCHWELLEN hart codiert,
   Behörden-Stammdaten BS, Form-Gate (Exemplare = 1+Beklagte), PDF+DOCX,
   BEWUSST ohne localStorage (Anweisung); 12 Akzeptanztests.
5. **Einzelarbeitsvertrag** (/vorlagen/arbeitsvertrag) — ERSTE Vorlage auf
   dem generischen Wizard-Rahmen. Grundlage: normverifiziertes Gutachten
   Art. 319 ff. OR (5.6.2026); Validierungskern = Matrix absolut/relativ
   zwingend (Art. 361/362) + Schriftform-Klauseln (durch beidseitige
   Unterschrift erfüllt) + Disclosure (BGE 145 III 365, 149 III 202,
   129 III 276). Harte Gates: Probezeit ≤ 3 Mte, Frist ≥ 1 Mt (bei
   Befristung neutralisiert), Ferien ≥ 4/5 Wochen, Ferienabgeltung bei
   Vollzeit gesperrt, KV nur mit Ort/Zeit/Gegenstand + Einblicks-
   Bestätigung. Kantonale Mindestlöhne als DATIERTE Parameter
   (AV_MINDESTLOEHNE, jährlich verifikationspflichtig!). ArG in fedlex.ts
   ergänzt (Anker art_9/12/13/46 empirisch verifiziert). PDF+DOCX;
   16 Akzeptanztests. Deklarierte Gutachten-Abweichung: einheitliche
   Frist < Staffel zulässig per Art. 335c Abs. 2 (Hinweis statt Verbot).
6. **Mietvertrag Wohn-/Geschäftsräume** (/vorlagen/mietvertrag, Karte
   mietvertrag-wohnen) — Gutachten Art. 253 ff. OR/VMWG (5.6.2026).
   Zentrale Weiche objektTyp + Kanton. Gates: Kaution ≤ 3 Monatszinse
   (nur Wohnraum), Fristen 3/6 Mte, Index ≥ 5 J/LIK + Staffel ≥ 3 J
   (beide am Fedlex-WORTLAUT verifiziert), NK-Einzelausweis, MWST nur
   Geschäftsraum. DATIERTE Parameter: Referenzzins 1.25 % (1.6.2026,
   quartalsweise!), MWST 8.1 %, Formularpflicht-Kantone (BWO 4.2.2026,
   BE-Diskrepanz offengelegt, dynamisch per 1.11.). PDF+DOCX; 14 Tests.
7. **Vollmacht** (/vorlagen/vollmacht, Karte `vollmacht`) — EINE Maske mit
   Typ-Schalter Anwalts-/General-/Spezialvollmacht (Entscheid David
   5.6.2026 statt zweier Vorlagen; Grundlagen-Bericht «Vollmachten»,
   Downloads). Formfrei (Art. 11 OR) → ausgabeArt `fertig`, PDF+DOCX.
   Gemeinsamer OR-AT-Kern (Parteien natürlich/juristisch, mehrere
   Bevollmächtigte einzeln/gemeinsam, Substitution, Widerruf Art. 34,
   Befristung, transmortale Klausel Art. 35); besondere Ermächtigungen
   als Katalog wortlautnah zu Art. 396 Abs. 3 OR. Deterministische
   Form-Gates: Bürgschaft = SPERRE (Art. 493 Abs. 6 OR), Grundstück =
   Warnung (Art. 216 OR / Art. 86 GBV / Formfrage offen BGE 112 II 330),
   Bank = bankeigene Formulare, Prozess-Bereich = Art. 68 ZPO-Warnung,
   Vorsorgefall = Weiche zu Vorsorgeauftrag/PV (Gesundheits-Bereich
   bewusst NICHT wählbar). Ersetzt die geplanten Karten generalvollmacht/
   bankvollmacht. StPO/VwVG in fedlex.ts ergänzt (Anker art_129/art_11
   empirisch verifiziert). 20 Akzeptanztests.
8. **Klage im vereinfachten Verfahren – BS** (/vorlagen/klage-vereinfacht,
   Karte `klage-vereinfacht`) — zweite BS-Eingabe der SG-Familie
   (normverifizierter Auftrag 5.6.2026). Deterministisches BS-Routing:
   Arbeit ≤30k → Arbeitsgericht (§§ 73 f. GOG), GlG/Mitwirkung →
   Dreiergericht, Gewaltschutz/DSG/Miete-Kern → Einzelgericht (§ 71 GOG);
   ehrliche Stopps (>30k ohne Abs.-2-Materie → ordentlich; Arbeit >30k →
   § 73 Abs. 2-Hinweis; KVG-Zusatz → Sozialversicherungsgericht).
   Schwellen aus ZPO_SCHWELLEN (SSoT); Klagefrist Art. 209 Abs. 3/4 über
   die zpoFristen-Engine ('klagefrist_klagebewilligung', Gerichtsferien).
   ABWEICHUNG vom Auftrag offengelegt: Art. 114 ZPO kennt KEINE Miete-
   Position (lit. d = Mitwirkungsgesetz) → Miete im Entscheidverfahren
   nicht kostenfrei. Begründung = freiwilliger strukturierter Platzhalter
   (Behauptungs-Liste + Beweismittel) mit Verzichts-Baustein (Art. 245
   Abs. 1); Begehren beziffert/unbeziffert (Art. 84/85), Rechtsöffnungs-
   Antrag, Beilagen-Automatik (KB/Ausnahme/Vollmacht/Urkunden), Doppel-
   Hinweis Art. 131. SG-Parteitypen wiederverwendet (parteiZeilen & Co.
   exportiert). PDF+DOCX, ohne localStorage (wie SG). 20 Akzeptanztests.

Wizards 1–3 und 7 mit localStorage (`lexmetrik.vorlage.*.v1`, Hydration
array-gesichert); Vorschau als Funktionsaufruf (kein Remount). Eingaben
(4, 8) bewusst OHNE localStorage.

## PDF-Rechenbericht (src/lib/pdf/)

**Abend-Paket (5.6.2026):** Formulierungskonventionen (lib/konventionen.ts
SSoT + Linter-Test über echte Textausgabe; — → – plattformweit, «5 %»,
SG-Floskeln, Golden-Diff programmatisch als rein konventionell bewiesen).
Free-KACHELWAND (flach, FREE_REIHENFOLGE, Hero neu «Schweizer Recht,
berechenbar.»; Katalog.tsx pro-only). Versimplung: ui/Tabs + ui/
SelectionGrid (14+3 Stellen entdoppelt, SSR-byte-identisch), chf()
kanonisch, tote Katalog-Props raus (netto −175 Z.). Pro: Sektionen
starten EINGEKLAPPT, Zivilprozess & Vollstreckung zuerst. KOMBINIERTER
FRISTENRECHNER free (/rechner/tagerechner: Verfahrens-Tabs Allgemein/
ZPO/SchKG → bestehende Forms; §4 unangetastet; Trennungs-Querschnitt-
Test). Mobile-Check: Tabs-Overflow gefixt (overflow-x-auto), Grids
mobil-Basis. PROJEKTBESCHRIEB.md neu geschrieben.

**Pro-Katalog-Umbau (5.6.2026, Auftrag):** Tabs Verfügbar(17)/Gesamt(111)
(?ansicht=, Default Verfügbar), juristische Obergruppen als Super-Trenner
(lib/rechtsbereichGruppen.ts, 5er-Modell, 4er-Fallback per GRUPPEN_MODELL),
gruppierte Scrollspy-Seitenleiste (Rechtsbereich-Filter+Direkteinstieg
entfernt), Schnellzugriff ★Favoriten+Zuletzt (lib/schnellzugriff.ts,
localStorage, Stern nie auf geplant), istVerfuegbar()-Prädikat, Hero «17
sofort verfügbar». Free unverändert. BetragsFeld: Tausender-Apostroph in
22 CHF-Feldern. Visual-Checks (2 Agenten) GRÜN; P1–P3 gefixt.

**Teuerungsrechner (5.6.2026, /rechner/teuerung, Free):** LIK-Indexierung
mit amtlicher BFS-Reihe (src/data/likReihe.ts, generiert via scripts/
lik-reihe-generieren.py aus cc-d-05.02.08; 10 Originalbasen 1966–Mai 2026;
OPEN-BY). Basis-AUTO wie BFS-Rechner; Modi Indexmiete (Art. 17 VMWG
wortlaut-verifiziert, Senkungspflicht)/Unterhalt (286/128 ZGB)/generisch.
VMWG neu in fedlex.ts. MONATLICHE PFLEGE: Reihe nach BFS-Publikation
regenerieren. Eingaben: Behörden-Registry +Miete/Diskriminierung BS
(Staatskalender 5.6.2026); SG-Forum-Häkchen entfernt (Kantonswahl).

**Logik-Nachrechnung + Versimplung (5.6.2026):** 4 Cluster unabhängig vom
Code aus dem Gesetz nachgerechnet (100+ Handfälle, 6912er-Erbrecht-Gitter,
576er-ZPO≡Allgemein-Gitter): KEINE Berechnungsfehler. Offen für Davids
Entscheid: Sperrtage-ANZEIGE-Konvention (beansprucht Art.-77 vs.
Kalendertage; Endtermine identisch). Versimplung golden-bewiesen
(scripts/golden-outputs.ts, 53 Fälle byte-gleich): naechsterWerktag/
dauerTageInklusiv kanonisch, fmt/iso ×7 dedupliziert, Vorlagen-Helfer
zentral, Rückwärts-Spiegelung direkt.

**Tagerechner-P1 (5.6.2026, Auftrag «Verbesserung Fristenrechner»):**
Rückwärtsmodus (spätester Handlungstag; Verschiebung defensiv «keine»,
Vorverlegung nur mit Ungeklärt-Vorbehalt), Zustell-Helfer (rein informativ:
7-Tage-Fiktion, A-Post Plus Art. 142 Abs. 1bis ZPO), .ics-Export (RFC-5545
inkl. Folding, deterministisch) + Permalink (validiert), Validierung/A11y;
BGE 150 III 367 nachgeführt. AV/MV-Schemas: v1.1.0 (Vertiefungs-Gutachten).
Golden-Output-Protokoll: scripts/golden-outputs.ts (53 Fälle, vergleich-Modus).

**Formatvorlagen-SSoT (5.6.2026, `formatvorlagen.ts` — drei Grundlagen-
Berichte):** Typografie je Format + AUSGABE_REGELN je AusgabeArt
(abschrift = DOCX hart gesperrt · entwurf = PDF-Wasserzeichen «ENTWURF»
[VA beurkundet] · fertig). Eingaben mit Korrekturrand 3.5 cm rechts,
Anrede/Schlussformel/«im Doppel» (Rollen anrede/schlussformel);
Verträge mit Ausfertigungs-Vermerk + QES-Hinweis (Art. 14 Abs. 2bis OR).
Pro-SITZUNG (lib/proSession.ts): Pro betreten = eingeloggt (localStorage,
Reload-fest, «/»→/pro), Header «Ausloggen»; Andockpunkt Zahlungs-Gate (System offen).
Einzeilen-Heros Free+Pro; Gebiets-Titel in Sans.

**Formatvorlagen der Vorlagen-Renderer (5.6.2026, Referenz-Layouts):**
Schemas deklarieren `format` (verfuegung·vertrag·eingabe) + Absatz-`rolle`n
(absender/adressat/datumzeile/betreff/rubrum/parteien/unterschrift); PDF,
DOCX UND Live-Vorschau interpretieren beide aus EINER Quelle. Arial/
Helvetica 11, Haarlinien unter Titel/Betreff, hängende Einzüge (1./–),
gezeichnete Unterschriftslinien, Fusszeile je Seite, Disclaimer 8pt am
Ende; Eingaben OHNE Dokumenttitel (Betreff trägt ihn), langes Datum.
Engine-Konvention: Platzhalter auf …Satz/…Zeile verschwinden leer
ersatzlos (sonst «________»-Vorschau-Strich). Visuell verifiziert via
`.scratch/pdf-beispiele.ts` + qlmanage-Thumbnails.

pdfModel (reines Block-Modell: kopf/hero/tabelle/schritt/hinweisbox/norm)
+ pdfRender mit **eingebetteten Markenschriften** (Fraunces/Geist/GeistMono
als Base64-TTF, ~0.4 MB NUR im lazy Klick-Chunk). Hero-Hauptkennzahl,
Eingaben-Tabelle (Mono rechtsbündig), unzerreissbare Schritte mit
klickbaren Norm-Pills (Vormessung inkl. Pill-Umbrüchen), sichtbare URLs,
Status «Berechnung vollständig». Verzugszins + Kündigung liefern hero.
Visuelle Prüfung: qlmanage-Thumbnails + Swift-PDFKit-Split.

## Oberste Ebene: vier Output-Typen

| Sektion (`art`) | Inhalt |
|---|---|
| Fristen (`frist`) | Prozessuale und materielle Fristen |
| Beträge & Quoten (`betrag`) | Geldansprüche, Zinsen, Kosten, Quoten |
| Zuständigkeit & Einordnung (`zuordnung`) | Gericht, Recht, Verfahrensart |
| Werkzeuge (`werkzeug`) | Rechtsgebietsübergreifende Hilfsrechner |

## Grossausbau 5./6.6.2026 — Zuständigkeits-Plattform (Kurzkarte)

**Drei Rechtswege live** im Zuständigkeitsrechner (je EIGENE Engine, §4):
- **Zivil** (`lib/zustaendigkeit.ts`): 9 Streitsachen · Fahrplan + kantonale
  Kosten-Rahmen (alle 26, `data/zustaendigkeitKosten.ts`) · Art.-113-Kosten-
  freiheit · konkrete Schlichtungsstelle aller 26 Kantone
  (`data/schlichtungsstellen.ts`) mit **PLZ→Gemeinde→Amt** gemeindescharf in
  ZH/AG/SG/TG/FR/ZG/AI (`data/schlichtung/*`, amtliches swisstopo/BFS-Register,
  Generator `scripts/plz-generieren.ts`) · **Handelsgerichte** ZH/BE/AG/SG ·
  **Rechtsmittel-Modus**: Berufung/Beschwerde-Weiche (308/319 ZPO) + obere
  Instanz aller 26 Kantone (`data/obereInstanzen.ts`) + BGer-Schwellen
  (Art. 74 BGG, BGG-Cache verifiziert).
- **SchKG** (`lib/schkgZustaendigkeit.ts`): Betreibungsort-Kaskade 46–55,
  11 Anliegen (Rechtsöffnung/Aberkennung/Widerspruch/Kollokation/Arrest/
  Konkurs/Aufsichtsbeschwerde) mit Verwirkungsfristen-Badges; Gebühr
  Zahlungsbefehl nach Art. 16 GebV SchKG (Stand 1.1.2022, 2026-Vorbehalt
  im Verfallsregister); BJ-Betreibungsämter-Verzeichnis verlinkt.
- **Straf** (`lib/strafZustaendigkeit.ts`): StPO-Decision-Tree (Spezialforen
  35–37 → Tatort 31 → Kaskade 32; Weichen 33/34/38/40/41/42); Anzeige-
  Fahrplan (301; Strafantrag 3 Mt., Art. 31 StGB); zentrale StA aller
  26 Kantone + Bundesanwaltschaft (`data/staatsanwaltschaften.ts`).

**Vorlage Schlichtungsgesuch kantonsübergreifend:** Behörden-Auflösung für
alle 26 Kantone (`components/vorlagen/SgBehoerdenWahl.tsx`; Adressat-Kette
Hand > BS-Registry > Recherche > Platzhalter). **UX-Programm** (9 Etappen-
Commits) + Design-Konsistenz-Sweep abgeschlossen. **Bibliothek:** 21 Dossiers
(4 Regelwerke ZPO/SchKG/StPO/Erbrecht; Behörden Zivil/Straf/Erbgang; Kosten)
— Status je Dossier in bibliothek/INDEX.md (SSoT-Karte dort).

## Offene Punkte (nächste Session)

1. **Fachliche Abnahme durch David** (er ist die «fachkundige Person»):
   **Erste Sichtung aller 4 Vorlagen am 5.6.2026 erfolgt** (Bausteine,
   Gates, Schwellen vorläufig für gut befunden). SEIN ENTSCHEID: **alles
   bleibt `entwurf` / `verified: false`** bis zur Wort-für-Wort-
   Detailüberarbeitung («wir überarbeiten alles später»). Erst danach
   NormRefs auf verified:true und Einträge einzeln auf «geprüft» (Goldrand).
2. **Seine Antworten ausstehend:** redundante Tageszählungs-Hinweise im
   Verzugszins-Bericht kürzen? · DOCX-Standardannahmen ok (Testament ohne,
   VA nur beurkundet)? · Bausteinprotokoll in PDF/DOCX-Exporte aufnehmen?
3. ~~Phase 4: Experten-Gating als Wrapper um /fachpersonen~~ → **entfällt
   ersatzlos** (Aufhebung der Free/Pro-Zweiteilung, Auftrag David
   7.6.2026); eine spätere Monetarisierung bekäme einen neuen,
   funktionsbezogenen Zuschnitt (STRATEGIE-PLATTFORM, Gate G1).
4. **Schlichtungsgesuch:** offene Verifikationen (kantonale §§ GOG/EG ZPO/
   GGR, PLZ 4001/4051, Art.-135-Randtitel) — in der UI offengelegt.
5. Kleineres: Detailseiten-Titel (calculators.ts) an neue Katalog-Titel
   angleichen? · Datepicker-Pfeiltasten (A11y-Kür) · Markenschriften auch
   für Vorlagen-PDFs · ggf. sichtbare Rechtsgebiet-Zwischentitel in den
   Untergruppen.
6. ~~Verschlankung Stufe 2~~ → **erledigt 5.6.2026** (generischer Rahmen
   in components/vorlagen/wizard.tsx, s. oben). Optional verbleibend:
   Form-Gate-Sektion (brass-Box mit Checkliste) als vierte geteilte
   Komponente — Texte sind je Vorlage fachlich verschieden, daher bewusst
   zurückgestellt.

## Backlog (bewusst NICHT gerendert)

Aufnahme nur bei klar regelbasiertem, deterministischem Umfang — sonst
Widerspruch zu «feste Rechenregeln, keine Schätzung»: Konsumkredit-Widerruf
(Anwendungsbereich klären) · Schadenersatz/Genugtuung · Unterhalt ·
Tagessatz · Mietzinsherabsetzung · Konkurrenzverbot (alle wertend/Ermessen).
