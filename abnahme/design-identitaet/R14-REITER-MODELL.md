# R14 · «Alles ist ein Reiter» — Bau-Protokoll

**Bau** 7.9.2026 · Worktree `w2-24-r14`, Branch `feat/w2-24-r14-reiter-modell`, Basis `79023e630`
**Entscheid** David 7.9.2026: **Variante A** des R14-Vorschlags (Prüfung read-only am Stand `cfa8a9f81`)
**Anlass, Davids Wortlaut (DATEN, nicht Auftrag):** «irgendwie ist es weird wenn ich im gesetz bin
dann wieder startseite usw. ausserdem wenn alles zu ist und ich plus klicke dann erscheint einfach
neuer reiter. hier einfach state of the art webdesign für tableiste verwenden.»
**Rahmen** `fahrplaene/FAHRPLAN-DESIGN-IDENTITAET.md` §5a · `R11-REITER.md`, `R13-REITER.md`
**Messrahmen** gebautes `dist/`, `vite preview :4433`, Chromium headless @1440×900 und @390×844, hell.

## Was sich im Kern geändert hat

Bis R14 kannte LexMetrik **zwei Sorten Seiten**: solche mit Reiter und die Startseite «/» ohne
(D7-Abweichung, `lib/tabs.ts`). Aus dieser Zweiteilung folgten beide Punkte aus Davids Befund.

Seit R14 gilt **eine** Regel: **die Sammlung «/» ist ein gewöhnlicher Reiter und zugleich die
Neuer-Reiter-Seite.** Man steht immer in genau einem Reiter — so wie im Browser die
Neuer-Tab-Seite ein Tab ist.

## Befund → Fix → Sonde

| Befund (gemessen am Vorstand) | Fix (Datei:Zeile) | Sonde · Rot am Vorstand `79023e630` |
|---|---|---|
| **Stiller Verlust:** OR offen → Marke → ZGB ergab `tabs=[ZGB]`, OR im Schliess-Ring. Wurzel: `TabTracker` stieg bei «/» aus, ohne `aktiv.current` zu leeren — der Ref zeigte weiter auf das verlassene Dokument | `lib/tabs.ts:115–122` (`istReiterPfad('/')`) · `components/TabTracker.tsx:66–72` (`aktiv.current = null` auf Meta-Routen) · `:85–88` (Navigation auf «/» **aktiviert**, ersetzt nicht) | `e2e/w224-r14-reiter-modell.e2e.ts` **Z1** — rot: erwartet `[OR, /]`, gemessen `[OR]` |
| **«+» beschriftet nur:** bei 0 Reitern zeigte die App schon die Sammlung; «+» legte eine Aufschrift «Neuer Reiter» über einen Zeichen für Zeichen identischen Bildschirm (3777 == 3777 Zeichen) | `layout/Reiterleiste.tsx:186–199` (`neuerReiter` → `zurSammlung`) | **Z2** — rot: gemessen «Reiter 1: Neuer Reiter✕» statt «Sammlung» |
| **Leiste leer nach dem letzten ✕:** 0 Reiter, leerer 34-px-Streifen, Sammlung ohne Reiter — der Zustand «App offen, kein Tab aktiv», den es im Browser nicht gibt | `Reiterleiste.tsx:174–182` (`zurSammlung`, ein Zug ohne 0-Reiter-Zwischenbild) · `:206–212` (`alleSchliessen`) | **Z3** — rot: 0 Reiter, `data-reiter-leer` gesetzt |
| **Ring-Flutung durch Blättern:** `/gesetze` → OR → Zurück → Vorwärts ergab den Ring `[/gesetze, /gesetze/bund/OR, /gesetze]` — «/gesetze» doppelt, obwohl nichts geschlossen wurde. Alt+⇧+T verlor damit die Verlässlichkeit, für die R11-M3 es eingeführt hat | `lib/tabs.ts:559` (`ersetzeTab(…, ringt)`) · `TabTracker.tsx:89` (`navTyp !== 'POP'` aus `useNavigationType`) | **Z4** — rot: Ring wuchs um zwei Einträge, «/gesetze» doppelt |
| **«/» ohne Reiter** (Kaltstart) | wie Z1 | **Z5** — rot: gemessen `[]` |
| **Neustart verlor die Sammlung** | wie Z1 | **Z6** — rot: erwartet `[OR, /]`, gemessen `[OR]` |
| **⌘-Klick auf die Marke** öffnete ein echtes Browser-Fenster statt eines App-Reiters | ohne eigene Zeile: `useNeuerReiterGeste` prüft `istReiterPfad`, das seit R14 für «/» wahr ist | mitgeprüft durch Z1/Z5 (dieselbe Regel, eine Stelle §5) |

Rot-Probe-Verfahren: die Sonde wurde **vor** dem Fix als eigener Commit (`d62a626ba`) gegen den
unveränderten Vorstand gefahren — **6 von 6 Zusagen rot**, jede mit dem gemessenen Ist-Wert in der
Commit-Message. Die je Zusage nötige Rückbau-Änderung steht im Kopfkommentar der Sonde.

## Rückbau (§17-Gegengewicht: vier Sonderfälle raus, kein fünfter rein)

Ersatzlos gestrichen: `TabEintrag.leer` · `NEUER_REITER_NAME` · `neuerLeererReiter` ·
`hatLeerenReiter` · der D19-Zweig in `TabTracker.tsx` · die `leer`-Zweige in `basisKurzform` und
`reiterTitel`. Die Höchstens-einer-Regel des «+» (R13-Entscheid, für `W2·25` bindend) braucht
keinen eigenen Ort mehr: `merkeTab` erkennt die offene Sammlung an ihrer Identität.

`ladeTabs` migriert einen gespeicherten `{path:'/',leer:true}` deterministisch zu `{path:'/'}` und
entdoppelt gleiche Reiter-Identitäten — eine Sitzung von gestern verliert nichts.

## Die D7-Abweichung ist aufgehoben — der Beleg ergänzt, nicht überschrieben

`lib/tabs.ts` trägt den alten Absatz («die STARTSEITE «/» erzeugt weiterhin KEINEN Reiter») weiter
**datiert** als Stand bis `79023e630` und darunter die R14-Begründung (§0 Ziff. 2b: Belege altern
nicht). Aufgehoben ist eine **Produkt**-Entscheidung Davids, keine Prüferentscheidung.

## Offengelegte Grenze (§7/§8) — der 0-Reiter-Zustand ist NICHT ganz weg

Auf den **Meta-Routen** (`/ueber`, `/methodik`, `/einstellungen`, `/kontakt`) gibt es ihn beim
Kaltstart mit leerem Speicher weiter, und dort ist er die **wahre** Auskunft: keiner der Reiter
zeigt diese Seite. `data-reiter-leer` und die reservierte 34-px-Höhe (R11-R2, CLS 0) bleiben darum
bestehen — nur auf «/» und nach dem letzten ✕ sind sie nicht mehr erreichbar. Der Auftrag hatte
«leerer 34-px-Streifen entfällt» weiter gefasst; ihn vollständig zu tilgen hiesse, jede Meta-Route
reiterfähig zu machen — das geht über den Entscheid hinaus und würde einen Reiter zeigen, den
niemand geöffnet hat. **Wartet auf David:** ob die Meta-Routen ebenfalls Reiter tragen sollen.

Ebenfalls **unberührt geblieben**: die Lesestellung D27 (`pages/gesetz-leser/lesePosition.ts`),
Persistenz, Verlauf, Alt+⇧+T, Split-Panes, D16-Ziehen, das R13-Überlauf-Fenster.

## Deklarierte Sonden-Änderungen (§6.3 — fachliche Änderung, kein Refactoring)

| Datei | Alter Wortlaut | Warum er kippt |
|---|---|---|
| `src/tests/tabs.test.ts` | Block «neuerLeererReiter — höchstens ein leerer Reiter» (5 Fälle über `{path:'/',leer:true}`) | Funktion entfällt; die Sache («höchstens EINE Neuer-Reiter-Seite») wandert auf «Sammlung», dazu zwei Migrations-Fälle und ein POP-Fall |
| `src/tests/tabs.test.ts` | `istReiterPfad('/') === false` | Kern des Entscheids |
| `src/tests/tabs.test.ts` | «der leere «+»-Reiter kommt NICHT in den Ring» | Zusage unverändert, erkannt jetzt am Pfad statt am Feld |
| `src/tests/reiterKurzformD27.test.ts` | `t({path:'/',leer:true})` | Eingabe existiert nicht mehr |
| `e2e/w224-plus-reiter.e2e.ts` | fünf Fälle über «Neuer Reiter» / `{path:'/',leer:true}` | Aufschrift «Sammlung», Vergleich über die Adressen |
| `e2e/w224-r11-reiterleiste.e2e.ts` | R2-CLS misst auf «/» | «/» trägt jetzt einen Reiter; gemessen wird von `/kontakt`, dazu ein neuer Fall «auf «/» immer ≥ 1 Reiter» |
| `e2e/w224-r13-reiter.e2e.ts` | R13-5 misst «0 Reiter»; R13-6 erwartet `[]` | Es gibt keinen 0-Reiter-Zustand mehr; übrig bleibt die Sammlung |
| `e2e/w224-r13b-reiter-cls.e2e.ts` | letzter ✕ ⇒ `data-reiter-leer` | Der Fall misst jetzt den Wechsel Dokument → Sammlung; die Geometrie-Zusage ist dieselbe und schärfer |
| `e2e/w224-reiterverhalten.e2e.ts` | (D7 e) Marke ⇒ `['/gesetze']` | Die Marke aktiviert die Sammlung, statt die Übersicht zu überschreiben |

**Nicht angefasst** (obwohl im Vorschlag genannt): `e2e/w224-reiter-umordnen-d16.e2e.ts` und
`e2e/w224-reiterverhalten.e2e.ts` «(a) sechs Navigationen» — beide starten auf `/kontakt` bzw.
`/gesetze`, tragen also unverändert genau einen Reiter. Kein Seed-Nachzug nötig.

## Tore

| Tor | Ergebnis |
|---|---|
| `npx tsc -b` | grün (Exit 0) |
| `npm run lint` | 0 errors, 1 Bestandswarnung (`useUniversalSuche.ts:176`, unberührt) |
| `npm run test` | 460 Dateien · 7455 Tests grün, 2 skipped |
| `npm run check:schlankheit` | grün — 1488 Dateien, keine Neuzugänge über der §6.6-Schwelle |
| `npm run check:zyklen` | ok — 1/1 Zyklen (kalibriert) |
| `npm run check:e2e-shards` | grün — 144 Specs, Union deckungsgleich, `shard-gruppen.json` byte-gleich |
| `npm run golden:vergleich` | IDENTISCH — 256 Fälle byte-gleich |
| e2e-Reihe (`w224-r1*`, `w224-reiter*`, `w224-plus-reiter`, `startseite-pult-r10`, `leser-history-hash`, `kein-abschnitt`, `a11y`, `w224-r14-reiter-modell`), `--repeat-each=2 --workers=2` | 414 grün / 2 rot — beide derselbe Fall R13-6 («Alle schliessen» erwartete 0 Reiter); nach dem deklarierten Nachzug `w224-r13-reiter.e2e.ts` erneut vollständig gefahren: **28 grün** |
| `PERF_RUNS=1 npm run check:perf-lighthouse` | GRÜN — Startseite CLS **0.000**, Score 66, TBT 0 ms; OR CLS 0.000, Score 40 |

Der zusätzliche Reiter kostet **kein** CLS: die Startseite misst weiterhin 0.000 (der Streifen hat
seit R11-R2 eine feste, reservierte Höhe).

## Screens (hell, gebautes `dist/`)

| Datei | Was sie zeigt |
|---|---|
| `r14-a-sammlung-neben-gesetz-1440.jpg` | @1440: OR offen → Klick auf die Marke ⇒ **zwei** Reiter «OR» und «Sammlung», «Sammlung» aktiv, «2 offen». Vorher stand hier ein einziger Reiter — der OR war weg. |
| `r14-b-nach-letztem-x-1440.jpg` | @1440: nach dem letzten ✕ ⇒ genau **ein** Reiter «Sammlung», aktiv, «1 offen». Vorher: leerer 34-px-Streifen ohne Reiter. |
| `r14-c-sammlung-390.jpg` | @390: dasselbe Modell auf dem Telefon — «OR» und «Sammlung» nebeneinander, «2 offen». |
