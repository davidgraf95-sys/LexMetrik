# R5 — Fixer 1h «Facetten als Text-Schalter + Sonden-Wurzelfixes»

Branch `feat/w2-24-r5-f1h`, abgezweigt von `c91541617`. Auftrag aus
`w224-pruef-r2-funde.md`: Zeile «Aus D24 (offen)» (Facetten-Text-Schalter) und
Zeile «Aus Fixer 1e (offen, §17)» (Test-Warten auf den lazy Such-Index,
`druck-fundstellen.test.ts` Element-Sonde).

---

## 1 · Facetten als Text-Schalter (D24-Nachzug)

**Befund.** `ui/FacettenGruppe` (bedient `/rechtsprechung` UND `/suche`) trug
die drei Achsen (Gemeinwesen · Instanz · Sprache bzw. Inhaltstyp) weiter als
`.lc-chip`-Kästen (Rahmen + Fläche), obwohl D22 dieselbe Kasten-Optik an der
Filterzeile bereits abgeräumt hatte («keine Kästen» — R12B-LISTEN.md §6/§8
hatte den Punkt ausdrücklich offengelassen: «Eine Umstellung gehört in einen
Schritt, der beide Flächen zugleich verantwortet»).

**Bau.** Neue Klassen `.fc-zeile`/`.fc-schalter` (additiv, `src/index.css`,
Präfix `.fc-*` wie vom Auftrag vorgegeben — NICHT `.ub-schalter`
wiederverwendet, weil der den Registerstrich fest auf `--reg-g` verdrahtet):

* kein Rahmen, keine Fläche — Wort + Zähler (`.num`, Tabellenziffern) als
  reiner Text, `ink-500` ruhig / `ink-900` gewählt;
* GEWÄHLT = 2-px-Registerstrich UNTEN (analog `.ub-schalter`, Vorbild aus
  derselben Datei) + ✓-Präfix im `::before` (Form-Signal statt reiner
  Farbvergleich, LM-040/F2/F4 — wie zuvor `.lc-chip-selected::before`, der Tick
  erbt die Textfarbe, trägt keine zweite Registerfarbe);
* `data-reg` am `role=group`-Wrapper wählt die Registerfarbe (`g`/`r`/`m`/`w`,
  Default `'g'` wie `ui/ListenTabelle`) — `/rechtsprechung` übergibt `register="r"`
  (`EntscheidFilter.tsx`, drei Aufrufe), `/suche` lässt den Neutralwert `'g'`
  stehen (keine einzelne Domäne);
* `min-height: var(--tap-ziel)` bleibt (WCAG 2.5.8), auch ausserhalb der
  heute gemessenen a11y-Sweep-Liste (die deckt `.fc-schalter` bewusst nicht ab
  — die Sweeps liefen auch VORHER nie auf `/rechtsprechung`/`/suche`, kein
  Regressionsloch);
* «Alle» als erster Schalter je Achse — bereits VORHER so gebaut (Aufrufer,
  nicht der Baustein), unverändert übernommen;
* Pfeiltasten (←→↑↓) bewegen den Fokus innerhalb der Gruppe (Komfort-Zusatz,
  `onKeyDown` am Wrapper, `querySelectorAll('button')` + Wrap-Around) —
  reine Komfort-Navigation, KEIN Roving-Tabindex: Tab bleibt unverändert,
  jeder Schalter einzeln erreichbar.

**Nichts verloren:** Filterlogik, URL-Parameter, Zähler-Herkunft und
Screenreader-Namen (`«<Achse>: <Wert> (<n>)»`) liegen unverändert beim
Aufrufer (`EntscheidFilter.tsx`, `Suche.tsx`) — `ui/FacettenGruppe` bleibt
reine Anzeige (§3).

**Kontrast, gemessen (empirisch, nicht nur behauptet):** `e2e/a11y.e2e.ts`
axe-Scans `/rechtsprechung` (hell + dunkel, inkl. «Facette BS» mit
gewähltem Schalter) UND `/suche?q=Miete` (hell + dunkel) — alle grün, keine
neue `color-contrast`-Verletzung. Die verwendeten Farbpaare (`ink-500`/
`ink-900` auf `--paper`, `reg-g`/`reg-r`/`reg-m`/`reg-w` auf `--paper`) sind
bereits PFLICHT-Paare in `scripts/farbwelt-tabellen.ts` (`check:farbwelt`
grün, keine neue Warnung).

**Deklarierte Test-Änderung** (§6.3, fachliche Änderung, kein Refactoring):
`src/tests/design-konsistenz-chips-marken.test.tsx`, describe-Block D-1 —
die Sonde prüfte bisher explizit `lc-chip-zeile`/`lc-chip-selected` in
`FacettenGruppe.tsx`; jetzt `fc-zeile`/`fc-schalter` UND eine explizite
Negativ-Zeile («keine `lc-chip`-Klasse mehr»). Die ABSICHT (ein Baustein, ein
Auswahl-Signal, `aria-pressed` trägt die Semantik, kein lokaler Nachbau in den
Konsumenten) ist unverändert — nur der Klassenname der neuen Anatomie. Neue
Zeile: Registerstrich-CSS-Regel für `data-reg="r"` als Bestandssonde.

---

## 2 · Wurzel-Fix: Test-Warten auf den lazy Such-Index (§17)

**Befund** (R5-F1E §8, dort als Roadmap-Punkt notiert statt gebaut):
`e2e/suche-seite.e2e.ts` (3 Fälle) und `e2e/w224-plus-reiter.e2e.ts` («Suche
füllt DENSELBEN Reiter») warteten mit dem Playwright-Standardtimeout (10 s,
`playwright.config.ts`) auf den lazy geladenen Such-Index
(`useUniversalSuche.ts`: Preset-Index, Gesetzes-/Entscheid-Manifest,
~10 MB gzip Artikel-Volltext) — eine UHR statt eines Index-Zustands. Messreihe
in R5-F1E §8: unter Last (mehrere parallele Bau-Agenten) 3/13 Specs rot, bei
geringer Last 116/116 grün — die Messbedingung war die Maschinenlast, nicht
der Code-Stand.

**Kein neuer Code-Pfad nötig.** `SuchResultate.tsx` rendert für jede Suche
bereits eine barrierefreie Live-Region (`role="status"`, `aria-live="polite"`),
deren Text während des Ladens «wird [noch] durchsucht …» lautet und danach
entweder die fertige Trefferzahl oder «Keine Treffer» trägt. Derselbe Baustein
bedient sowohl das Kopf-Dropdown (`HeaderSuche.tsx`) als auch die
`/suche`-Vollseite (`Suche.tsx`) — ein Signal für beide Flächen (§5). Die im
Auftrag vorgesehene `data-suchindex="bereit"`-Alternative an
`useUniversalSuche.ts`/`HeaderSuche.tsx` war darum NICHT nötig (§17-Gegengewicht:
was nicht scheitern kann, wird nicht zusätzlich gebaut) — `useUniversalSuche.ts`
und `HeaderSuche.tsx` bleiben unverändert.

**Bau.** Neuer Helfer `e2e/helpers/warteAufSuchindex.ts`: wartet, bis die
`role="status"`-Live-Region NICHT mehr `/wird (noch )?durchsucht/` meldet
(grosszügiges Zeitbudget 20 s statt der impliziten 10 s — genau die Wartezeit,
die vorher unter der Decke verschwand, steht jetzt im Test). Eingesetzt in:

* `suche-seite.e2e.ts`: vor dem `zeilen.count()`-Poll, vor der
  Inhaltstyp-Facette-Prüfung, vor der «alle N Treffer anzeigen»-Option im
  Header-Dropdown-Test;
* `w224-plus-reiter.e2e.ts`: vor `feld.press('Enter')` (der Reiter-Navigations-
  Effekt in `HeaderSuche.tsx` feuert erst bei `allesGeladen === true` — vorher
  wartete der Test dafür auf die Standarduhr, nicht auf den Zustand selbst).

---

## 3 · Wurzel-Fix: `druck-fundstellen.test.ts` Element-Sonde statt 300-Zeichen-Regex

**Befund:** `TOPBAR.match(/<header[\s\S]{0,300}?>/)` — ein Zeichenfenster.
Trägt das `<header>`-Tag mehr als 300 Zeichen Attribute vor der Klasse, findet
der Regex kein `>` im Fenster und liefert `undefined`; die Sonde verfehlt die
Klasse lautlos, ohne je rot zu werden. Dieselbe Fehlerklasse wie beim
Klammerzählen in `scripts/analyse/test-assertion-diff.ts` (dort bereits auf die
TypeScript-Compiler-API umgestellt, Gegenprüfungs-Befund 3.9.2026).

**Bau.** `ersterHeaderTraegtKlasse()` parst die Datei mit
`ts.createSourceFile` (`ScriptKind.TSX`) und sucht das erste
`JsxOpeningElement`/`JsxSelfClosingElement` mit Tag-Namen `header`; die Prüfung
sitzt am `className`-Attribut-Knoten, unabhängig von dessen Zeichenlänge.

**Rot-Probe (§6.7), zweifach belegt:**

1. Embeddete Negativ-Kontrolle im Testfile selbst: ein synthetisches
   `<header data-x="y" … (40×) … className="lc-glass">` (> 300 Zeichen vor der
   Klasse) — die ALTE Regex-Sonde verfehlt die Klasse (`not.toContain`
   bestätigt), die NEUE Element-Sonde findet sie trotzdem. Läuft bei jedem
   `npm run test` mit.
2. Empirisch am echten Fall: `Topbar.tsx` temporär auf
   `<header className="sticky top-0 z-dropdown">` (ohne `lc-glass`) gesetzt →
   `npx vitest run src/tests/druck-fundstellen.test.ts` **1 failed** (die neue
   Sonde erkennt die fehlende Klasse). Datei danach exakt zurückgesetzt
   (`git diff --stat` zeigt 0 Änderungen an `Topbar.tsx`) → wieder 6/6 grün.

---

## 4 · Kollisionssonden (§0 Ziff. 5)

`gh pr list --state open --json files`: **PR #727** (Jules,
`feat/qs-ui-checkbox-3-…`) ändert `EntscheidFilter.tsx` (Checkbox-Baustein bei
«Nur Leitentscheide», Zeile 320 ff.) — eine ANDERE Stelle derselben Datei
(mein Bau berührt nur die drei `<FacettenGruppe …>`-Aufrufe, Zeilen 244–246).
Kein Dateiüberschneidungs-Risiko in den geänderten Hunks; dennoch: PR #727 vor
dem Mergen dieses Branches gegenprüfen, ob ein Merge-Konflikt entsteht.
`git ls-remote --heads origin`: keine fremden `feat/`-Branches auf
`FacettenGruppe.tsx`/`EntscheidFilter.tsx`/`druck-fundstellen.test.ts`/
`warteAufSuchindex`. `git worktree list`: R6c (`gesetz-leser/**`), Fixer 1f
(`layout/Sidebar`, Footer), Prüfer (read-only) — keine Überschneidung.

---

## 5 · Tore und Nachweise

`npm run lint` (0 Fehler, 1 vorbestehende Warnung `useUniversalSuche.ts`,
unverändert) · `npx tsc -b` · `npm run test` (**449 Dateien, 7358 Tests grün**,
2 skipped) · `npm run check:design-tokens` · `npm run check:farbwelt`
(146 Pflichtpaare grün, 4 vorbestehende beratende Warnungen unverändert) ·
`npm run build` (63 Routen prerendered) · `npm run check:e2e-shards`
(120 Specs, Union deckungsgleich) — alle nackt gefahren, alle grün.

Playwright (Preview `dist`, Port 4369): `rechtsprechung.e2e.ts`,
`rechtsprechung-richter.e2e.ts`, `suche-seite.e2e.ts`, `w224-plus-reiter.e2e.ts`,
`a11y.e2e.ts` — **85 passed, 1 failed**. Der eine Fehlschlag
(«V5 — Erwägungs-Rail im Entscheid-Leser › im Lesemodus verschwindet der Rail»)
ist NICHT von diesem Bau verursacht: identisch reproduziert auf dem
unveränderten Ausgangsstand `c91541617` (Nullprobe: `git stash`, `npm run
build`, Preview auf separatem Port, derselbe Timeout an derselben Zeile) — ein
vorbestehender Defekt in der Lesemodus-Overlay-Schliessung, ausserhalb der
Whitelist dieses Auftrags.

## 6 · Bilder

`r5f1h-rechtsprechung-facette-{1440,390}-{hell,dunkel}.jpg` (Facette «BS»
gewählt), `r5f1h-suche-facette-{1440,390}-{hell,dunkel}.jpg` (Facette
«Gesetzestext» gewählt).
