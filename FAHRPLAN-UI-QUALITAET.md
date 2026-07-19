# FAHRPLAN — Oberflächen-Qualität app-weit (`QS-UI`)

> **ROADMAP-Schritt:** `QS-UI` (Querschnitt-Band — **kontinuierlich, kein Reihenfolge-Slot**).
> **Anlass:** Ideen-Intake 20.7.2026, Idee 8a («UI app-weit optimieren»); die Gesetzes-Fläche
> folgt als 8b in `W2·5f-GESETZ-UI` und hängt per `dep` an diesem Strang.
> **Charakter:** Dieses Dokument ist die **Umbrella-Detailquelle** für einen mess-getriebenen
> Dauer-Strang. Es ist **kein Redesign-Plan** und **kein zweiter Einstieg** (§14.1) — es
> koordiniert und härtet, es baut nicht neben den bestehenden UI-Schritten her.
>
> **Fundament steht bereits:** Dach-`DESIGN-REGLEMENT.md` + 4 Domänen-Reglemente
> (`-RECHNER`, `-RECHTSPRECHUNG`, `-VORLAGEN`, `-NORMTEXT`), Tor `scripts/check-farbwelt.ts`
> (OKLCH/WCAG/APCA) und `@axe-core/playwright`. Dieser Strang erfindet keine neue
> Design-Schicht, sondern **zieht die vorhandene flächendeckend durch und verschärft ihre Tore**.

---

## §0 · Ziel und Nordstern

**Nordstern: Kanzlei-Praxistauglichkeit** — nicht Schönheit. Die Messlatte jeder Einheit ist,
ob eine Anwältin **schneller zu einem belegten Ergebnis** kommt: weniger Klicks bis zum Verdikt,
weniger Rätselraten, wo etwas herkommt, weniger Rückwege ins Nichts.

Daraus folgen drei Leitsätze, die über allen Teil-Schritten stehen:

1. **§13.2 zuerst:** Verdikt zuerst, Warum auf Abruf. Eine Fläche, die den Nutzer erst durch
   Herleitung schickt, ist unabhängig von ihrer Optik mangelhaft.
2. **§8 vor Politur:** keine Oberfläche suggeriert mehr Gewissheit, als der Korpus trägt.
   Ein hübscher Zustand, der eine Unsicherheit wegglättet, ist ein **Rückschritt**.
3. **§15 gilt:** kein UX-Gewinn, der Treue kostet. Bei Konflikt gewinnt immer die Treue.

**Ausdrücklich NICHT Ziel:** ein grosser visueller Wurf, ein Marken-Relaunch oder ein
Umbau der Token-Schicht. Farbwärme/Atmosphäre ist und bleibt `W2·11-DESIGN`.

## §1 · Audit-Methodik gegen das DESIGN-REGLEMENT

Jeder Teil-Schritt läuft nach demselben Vierschritt, damit Befunde vergleichbar bleiben:

1. **Ist-Aufnahme am laufenden Prod-Stand** (nicht am Modellgedächtnis, nicht an einem
   Vintage-Screenshot) — Playwright/DOM + Screenshot je Breite. **Vintage-Regel** analog
   `FAHRPLAN-UI-NAVIGATION.md` §0.1: jeder ältere Befund wird vor dem Bau reproduziert.
2. **Abgleich gegen das zuständige Reglement** — Dach für site-weite Muster, Domänen-Reglement
   innerhalb seiner Domäne (bei Konflikt gewinnt das speziellere, §13).
3. **Verdikt je Befund:** übernommen / geändert / verworfen — **Verworfenes bleibt mit Grund
   stehen**, sonst wird es in der nächsten Runde erneut vorgeschlagen.
4. **Bündelung zu Bau-Einheiten** nach §14.2 (keine Risiko-Klassen mischen; klein genug für
   ein sauberes Gate). Befunde, die eine bestehende Einheit betreffen, laufen **dort ein**.

**Abgrenzungs-Precheck (Pflicht vor jedem Schnitt):** berührt der Befund
`W2·10-UI-NAV`, `W2·11-DESIGN`, `W3·14` oder `W2·5f-GESETZ-UI`? Dann gehört er **dorthin**,
nicht hierher (§14.3). Dieser Strang liefert dann nur Messung und Priorisierung.

## §2 · Informationshierarchie-Pass («Verdikt zuerst»)

Werkzeugweiser Durchgang durch alle Rechner-, Rechtsprechungs- und Vorlagen-Flächen mit
denselben Fragen: Steht das Ergebnis vor der Herleitung? Ist der massgebliche Wert optisch
der stärkste Punkt? Sind Norm + Link + Stand am Wert (§13.5/§7) und nicht in einer Fussleiste?
Ist die Lesespalte gewahrt (`max-w-reading`) oder läuft Fliesstext über die volle Breite?

Ergebnis je Fläche: eine Zeile **Ist → Soll → Einheit**. Flächen ohne Befund werden
ausdrücklich als geprüft vermerkt, damit der nächste Durchgang sie überspringen kann.

## §3 · Navigations- und Muster-Konsistenz

Gleiche Handlung, gleiches Muster — über alle Rubriken: ⌘K/Suche, Verlauf/«zuletzt verwendet»,
Breadcrumb und Rückweg, Kopier-/Export-Affordanz, Chip- und Badge-Grammatik, leere und
Fehlerzustände (§13-F4-Zustandsmatrix inkl. disabled/loading/selected/empty/error).

**Kollisionslage beachten:** das konkrete Navigations-Plumbing ist `W2·10-UI-NAV`. Hier wird
die **Grammatik** festgelegt und ihre Einhaltung geprüft; gebaut wird im Nav-Schritt.

## §4 · Gate-Verschärfung

Der Strang ist erst dann etwas wert, wenn das Erreichte **maschinell festgehalten** wird
(§13-E1: prüfbare Regeln gehören ins Tor, nicht ins .md):

1. **Farbwelt-Baseline enger ziehen** — bestehende Ausnahmen in `check-farbwelt.ts` abbauen,
   statt sie fortzuschreiben; jede verbleibende Ausnahme trägt einen datierten Grund.
2. **axe von Stichprobe auf Flächendeckung** — alle Hauptrouten in Hell **und** Dunkel.
3. **Neue Checks nur, wo sie tragen:** Lesespalten-/Hierarchie-Prüfungen sind erst dann ein
   Tor, wenn sie ohne Fehlalarm laufen. Ein flackerndes Tor ist schlechter als keines.

Jede Verschärfung kommt **nach** den Fixes, die sie grün machen — nie ein rotes Tor auf Vorrat.

## §5 · Teil-Schritt-Backlog und Verweise

| Teil-Schritt | Inhalt | Verhältnis zu bestehenden Einheiten |
|---|---|---|
| **(a) Fundament-Pass** | app-weite gemeinsame Muster + Navigation aufnehmen, Soll festschreiben | speist `W2·10-UI-NAV` |
| **(b) Hierarchie-Pass** | «Verdikt zuerst» über alle Werkzeuge (§2) | je Domäne eigene kleine Einheiten |
| **(c) Muster-Konsistenz** | ⌘K/Verlauf/Breadcrumb/Zustandsmatrix (§3) | Bau in `W2·10-UI-NAV` |
| **(d) Flow-Audits** | Kanzlei-Alltags-Flows domänenweise gegen ihr Reglement | Befunde laufen in die Domänen-Schritte ein |
| **(e) Gate-Verschärfung** | Farbwelt enger, axe flächendeckend (§4) | eigener Commit, verhaltensneutral |

**Nachgelagert:** `W2·5f-GESETZ-UI` (Idee 8b) setzt auf (a)+(b) auf — erst stehen die
gemeinsamen Muster und die Hierarchie, dann wird die Gesetzes-Fläche darauf gezogen.
**Nicht dupliziert:** `W2·10-UI-NAV` (Navigation), `W2·11-DESIGN` (Farbwärme),
`W3·14` (Split/Responsive), `FAHRPLAN-GESETZES-UX.md` + `FAHRPLAN-NORMTEXT-DARSTELLUNG.md`
(Gesetzes-Darstellung), `FAHRPLAN-SEO-A11Y-GOVERNANCE.md` (a11y-Governance).

## §6 · Definition of Done je Teil-Schritt

- §13-Tore grün: `check:farbwelt`, axe (Hell **und** Dunkel), `check:perf-budget` (§15).
- **Golden byte-gleich**, wo die Änderung verhaltensrelevant sein könnte (§6).
- Kein Rechtsinhalt in derselben Einheit wie reine UI (§14.2 — Risiko-Klassen nicht mischen).
- Trailer `Roadmap: QS-UI`.
