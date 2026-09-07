# R5 — Fixer 1d «Plus-Reiter» (D19)

Branch `feat/w2-24-r5-f1d`, abgezweigt von `04815ac33` (Stand nach Fixer 1c).
Auftrag David 6.9.2026, wörtlich: «in der tab zeile oben soll man mit plus
einen neuen reiter erzeugen können».

## 1 · Was gebaut wurde

Ein Browser-«+» am Ende der Arbeitsleiste (`Reiterleiste.tsx`, `.rl-plus`,
34 px hoch über `items-stretch` des Elternflusses, `aria-label="Neuer
Reiter"`, `title="Neuer Reiter (Alt+T)"`):

* legt einen **leeren Reiter** an — Pfad `/`, Kurzform «Neuer Reiter»,
  Registerfarbe keine (Tinte) — und macht ihn aktiv;
* schickt den Fokus in die Kopf-Suche über dieselbe, bereits bestehende
  globale Geste `lm:suche-fokus` (`HeaderSuche.tsx`, sonst unverändert —
  Whitelist-Eintrag «nur Fokus-API» ist damit ein Nicht-Eingriff: das Event
  existierte schon für den /gesetze-Landeplatz-CTA);
* die **erste Navigation/Suche füllt genau diesen Reiter** — die D7-Regel
  «Navigation ersetzt den aktiven Reiter» (§5a Ziff. 3, `lib/tabs.ersetzeTab`)
  greift dafür unverändert, weil `TabTracker.tsx` den leeren Reiter trotz
  Pfad `/` als aktiv führt (die Startseite selbst bleibt sonst ohne Reiter,
  D7-Abweichung — der leere Reiter ist die eine, ausdrücklich benannte
  Ausnahme mit `leer: true`);
* **höchstens ein leerer Reiter gleichzeitig** (`lib/tabs.neuerLeererReiter`):
  ein zweiter Klick auf «+» aktiviert den bestehenden (`navigate('/')` ist
  ohnehin idempotent, keine Sonderfallabfrage nötig);
* Tastatur **Alt+T** (Ctrl/⌘+T fängt der Browser selbst ab, dieselbe Lage wie
  Alt+W statt Ctrl/⌘+W beim Schliessen);
* derselbe «+» zusätzlich im Überlauf-Blatt (@390 der Haupt-Weg zu den
  Reitern, §5a Ziff. 8);
* Alt+1…9, Umordnen, Ziehen ins Pane, Persistenz, Schliessen (×/Alt+W) —
  **keine Sonderbehandlung nötig**: der leere Reiter ist ein `TabEintrag` wie
  jeder andere, nur mit einem zusätzlichen Kennzeichen.

## 2 · Wo das Kennzeichen sitzt

`lib/tabs.ts`: `TabEintrag.leer?: boolean`, `NEUER_REITER_NAME` (SSoT-Text,
§5, gelesen von `Reiterleiste.kurzform` UND `TabPanel.zeile` statt doppelt
geführt), `neuerLeererReiter()` (Höchstens-einer-Regel), `hatLeerenReiter()`
(für `TabTracker`). Ersetzt ein `ersetzeTab`-Aufruf den leeren Reiter, trägt
der neue Eintrag `leer` von selbst nicht mehr — `eintragAus` baut ihn ohne
dieses Feld, keine Lösch-Sonderlogik.

`TabTracker.tsx`: EIN neuer Zweig — Pfad `/` ohne `?search`/`#hash` UND
`hatLeerenReiter()` ⇒ `aktiv.current = '/'`, sonst bliebe der leere Reiter für
den Tracker unsichtbar (D7 kennt sonst keinen Reiter für die Startseite) und
die nächste Navigation ersetzte den davor aktiven Reiter statt den leeren zu
füllen.

## 3 · Nebeneffekt: kein stummer Platzhalter mehr

Bis hierher stand bei 0 offenen Reitern ein `aria-hidden`-`<div>` OHNE `<nav>`
(Nullprobe R10, 6.9.2026: reine Höhenreservierung gegen CLS, keine
Navigations-Landmark ohne Ziel). Mit dem «+» gibt es jetzt IMMER ein Ziel,
auch bei 0 Reitern — den «+», mit dem man den ERSTEN Reiter überhaupt anlegt.
Der Sonderpfad ist darum ersatzlos gestrichen (§17-Gegengewicht): dieselbe
`<nav aria-label="Offene Reiter">` trägt beide Fälle, Höhe und Sticky-Position
bleiben identisch (CLS unverändert 0 — geprüft über dieselben Klassen, die
vorher am Platzhalter standen).

**Deklarierte Test-Änderung (§6.3):** `src/tests/tabsSsr.test.tsx` — die
0-Reiter-Zusage ist jetzt «Höhe UND der «+»-Knopf», nicht mehr «keine
Landmark»; `not.toContain('aria-label="Reiter «')` bleibt (kein Reiter im
Markup bei 0 Reitern).

## 4 · Rot-Beweis (§6.7)

**Unit** (`src/tests/tabs.test.ts`, 5 neue Fälle unter
«neuerLeererReiter — höchstens ein leerer Reiter»): `git stash` auf
`lib/tabs.ts` allein → `neuerLeererReiter is not a function` /
`hatLeerenReiter is not a function`, 5 rot, 22 unverändert grün. Nach
`stash pop`: 27/27 grün.

**e2e** (`e2e/w224-plus-reiter.e2e.ts`): ROT ZU BEKOMMEN im Kopf der Datei
dokumentiert (zwei Fälle, `lib/tabs.neuerLeererReiter` bzw. den D19-Zweig in
`TabTracker.tsx` entfernen).

## 5 · Tore

```
npm run lint                  0 errors (1 Alt-Warnung useUniversalSuche.ts:176, unverändert)
npx tsc -b                    grün
npm run test                  446 Dateien, 7329 Tests, 2 übersprungen, 0 rot
npm run check:design-tokens   grün (75 gültige Stufen, 19 Deckkraft-Klassen)
npm run build                 grün (via Playwright-webServer, 6.9.2026)
npm run check:e2e-shards      grün — 118 Specs, Union deckungsgleich; shard-gruppen.json neu generiert
```

Playwright (Auftrags-Specs, `--workers=1` zur Kontentions-Nullprobe — s. §6
unten): `w224-plus-reiter.e2e.ts` (5/5), `w224-reiterverhalten.e2e.ts`,
`w224-reiter-umordnen-d16.e2e.ts`, `tastatur.e2e.ts`, `a11y.e2e.ts`
durchgängig grün.

## 6 · Nullprobe: Kontentions-Flakes, kein Regressions-Befund (§0 Ziff. 3)

Der erste Lauf (5 Worker, parallel) zeigte 7 rote Fälle: zwei davon in MEINEM
neuen Spec (Locator-Fehler, unten behoben), fünf in unveränderten Dateien
(`a11y.e2e.ts` ×2, `w224-reiterverhalten.e2e.ts` ×2, `w224-plus-reiter.e2e.ts`
×1 «Suche füllt denselben Reiter»). Dass unveränderte Specs mitreissen, ist
laut §0 Ziff. 3 die Nullprobe selbst: der Defekt liegt nicht im Feature.
Bestätigt durch Neulauf mit `--workers=1` (Kontention weg) — alle sieben
grün, inklusive der beiden unveränderten `w224-reiterverhalten`-Fälle — sowie
durch einen eigenständigen Playwright-Einzellauf (`r5f1d-1440-hell-reiter-
gefuellt.jpg`, s. Belege), der «Suche «OR 257d» + Enter füllt den leeren
Reiter» im ersten Versuch reproduziert.

**Echter Bug, behoben:** die zwei Fälle in `w224-plus-reiter.e2e.ts` selbst
waren ein Locator-Fehler — `getByRole('button', { name: 'Neuer Reiter' })`
matcht standardmässig als Substring, und sobald der leere Reiter existiert,
tragen auch sein eigener Reiter-Knopf («Reiter 1: Neuer Reiter») und sein
Schliess-✕ («Reiter «Neuer Reiter» schliessen») diese Zeichenkette als Teil
ihres Accessible Name — drei Treffer statt des einen «+». Fix: `exact: true`.

## 7 · Belege

`r5f1d-1440-hell-plus-leerer-reiter.jpg` (Leiste mit «+», leerer Reiter aktiv,
Kopf-Suche mit Fokus und geöffnetem Leerzustand-Panel) ·
`r5f1d-1440-hell-reiter-gefuellt.jpg` (nach «OR 257d» + Enter: derselbe
Reiter trägt «Art. 257d OR», Reiterzahl bleibt 1) ·
`r5f1d-390-hell-blatt-plus.jpg` (Überlauf-Blatt @390 mit «+ Neuer Reiter» am
Kopf der Liste, drei gemischte Reiter darunter).

## 8 · Offen

Nichts — der Auftrag ist mit den obigen Toren und Belegen vollständig
umgesetzt. L6 (PaneKopf-Platzhalter) und der waagrechte Rest-CLS aus Fixer 1c
bleiben unverändert offen, von diesem Schritt nicht berührt.
