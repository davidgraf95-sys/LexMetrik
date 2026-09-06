# R8-REPORT-0 — «Nichts abgeschnitten» (6.9.2026)

Erster Lauf des Messwerkzeugs `e2e/kein-abschnitt.e2e.ts` (Runde R8 von
`W2·24-DESIGN-IDENTITAET`, Auftrag in `w224-pruef-r2-funde.md`). **Dieser
Bericht ist die Messung, nicht der Fix** — kein Fund unten ist behoben; das
ist der ausdrückliche Auftrag dieser Runde. Rohdaten:
`test-results/kein-abschnitt.json` (nicht versioniert, wird bei jedem Lauf neu
geschrieben).

## Methode und Messbedingung (§0 Ziff. 3)

25 Routen (13 statische Übersichten aus `prerenderRouten() \ katalogRouten()`
+ je 2 Vertreter Gesetz-Bund/Gesetz-Kanton/Entscheid/Materialie/Rechner/
Vorlage) × 6 Viewports (320/390/768/1024/1280/1440) × hell/dunkel für die
Kategorien a/b/c/f/g/h; Kategorie d (Sprungziel) auf den 4 Gesetz-Vertretern ×
2 Viewports; Kategorie e (Popover) auf 4 Repräsentativ-Routen × 2 Viewports;
2 Split-View-Kombinationen × 2 Viewports. Gegen `vite preview` aus einem
frischen `vite build`, Chromium, seriell (1 Worker — Begründung im Dateikopf).

**Vier Läufe bis zum stabilen Ergebnis** (gehört zur Messbedingung, nicht nur
zur Historie):

1. Erster Lauf: 5384 Funde, davon 5019 durch einen Werkzeug-Fehler (die
   Screenreader-only-Technik `.sr-only`, 1×1 px, wurde als „Überlauf ohne
   Scroller" gezählt — sichtbar für niemanden, also keine Abschnitt-Kategorie).
   Fix in `helpers/abschnittMessung.ts`: Schwelle `clientWidth > 4` statt `> 0`.
2. Zweiter Lauf: ein einzelner Popover-Trigger auf `/gesetze/bund/OR` hing
   (Index verschob sich nach einem vorherigen Klick) und riss das 30-s-
   Test-Timeout — `mode: 'serial'` übersprang danach 10 Folgetests
   **inklusive des Berichts selbst**. Fix: kurze Einzel-Timeouts + Zeitbudget
   pro Seite in `popoverUeberlaufScan`.
3. Dritter Lauf: derselbe Effekt, diesmal am globalen 30-s-Test-Timeout des
   *Geometrie-Sweeps* auf `/gesetze/bund/OR` — ein Playwright-Test-Timeout
   wird von AUSSEN erzwungen und ist durch `try/catch` im Testkörper NICHT
   abfangbar. Fix: `testInfo.setTimeout(90_000)` für den Geometrie-Sweep bzw.
   `60_000` für d/e/Split (Muster aus `a11y-flaeche.e2e.ts` übernommen).
4. Vierter Lauf: **grün durchgelaufen** (71/72 technisch bestanden, 1 rot mit
   echten Funden — die erwartete Tor-Aussage). Laufzeit 5.1 min reine
   Testzeit / 6.3 min inkl. lokalem Rebuild (`Slow test file`-Warnung von
   Playwright). Die Maschine war unter wechselnder Last (Lauf 1: 3.4 min bei
   identischer Testmenge, Lauf 4: 5.1 min) — die Zahl ist eine obere Schranke,
   keine feste Grösse; auf CI ist die reine Testzeit (ohne den lokalen
   Doppel-Build) massgeblich. **Naheliegender Folgeschritt, hier nicht
   gebaut:** die Viewport-Zahl für OR/ZGB im Geometrie-Sweep auf 3 statt 6
   senken, falls sich 5.1 min in der CI-Shard-Verteilung als zu knapp erweist.

## Ergebnis: 2640 Funde, aber nur ~10 Wurzeln

Alle 2640 Funde sind Kategorie **a** (Überlauf ohne Scroller, 1567) oder **b**
(Ellipsis/Line-Clamp ohne `title`, 1073) — **null** Funde in c, d, e, f, g, h
bei den geprüften Stichproben (siehe Einschränkung unten). Nach Baustein
statt nach Route gruppiert (Textteil in `«…»` weggelassen, weil er sich pro
Karte unterscheidet):

| Fund | Kategorie | Anzahl | Beispiel-Route | Einordnung |
|---|---|---|---|---|
| `span.min-w-0` (Karten-Titel) | a + b | 1071 + 1059 = 2130 | `/rechtsprechung` (2130 allein hier) | **EIN** Baustein-Defekt (Karten-Titel ohne `title`-Attribut, vermutlich `EntscheidZeile.tsx`/`ErlassKarte.tsx`-Familie), der sich mit jeder gelisteten Karte wiederholt — keine 2130 Einzelfehler |
| `nav` (Hauptnavigation) | a | 150 | `/` @1024/1280/1440 | **App-weit auf ALLEN 25 geprüften Routen** — die Topbar-Navigation ist bei 768–1440 px durchgehend 15–45 px zu schmal für ihren Inhalt |
| `p.mt-1.5` | a | 98 | `/materialien` @320 | Beschreibungstext auf Material-/Erlass-Karten |
| `nav.hidden` | a | 90 | `/` @768 | dieselbe Hauptnavigation, sichtbare Variante bei `md`-Breakpoint (Klassenname irreführend — `hidden` ist die Basis-Utility, nicht der Ist-Zustand bei 768 px) |
| `div.lc-route` | a | 74 | `/materialien` @320 | Brotkrumen-/Routenpfad-Zeile |
| `span.truncate` | a + b | 18 + 6 = 24 | diverse | reguläre Tailwind-`truncate`-Stellen ohne `title` |
| `span.lc-scroll-x` | a | 16 | `/gesetze/kanton/ZH-211.11` | **Sonderfall, kein echtes Abschneiden**: `.lc-scroll-x` (Tabellen, `ArtikelTabellen.tsx`) IST scrollbar (`overflow-x:auto`), trägt nur nicht die neuere Affordanz-Klasse `.lc-scrollrand-x` — eine Migrationsfrage, keine Kappung |
| `div.flex` | a | 16 | diverse | undekorierte Flex-Container ohne `min-w-0` an einem Kind |
| `h2.m-0` | a | 8 | `/gesetze` @768 | A–Z-Register-Überschrift mit Zähler |
| Rest (10 Muster) | a + b | 24 | diverse | Einzelfälle, siehe Rohdaten |

**Grösste Route:** `/rechtsprechung` allein trägt 2130 der 2640 Funde (81 %) —
die Übersicht listet sehr viele Entscheid-Karten, und der Karten-Titel-Defekt
multipliziert sich mit jeder Zeile. Nächstgrösste: `/materialien` (110),
`/gesetze/kanton/ZH-211.11` (56).

**Werkzeug-Fehler im finalen Lauf:** 0 (`werkzeugFehler` im Report leer).

## Einschränkung: was NICHT geprüft wurde (Messbedingung, keine Lücke)

- **d/e nur auf Stichproben** (4 Gesetz-Routen bzw. 4 Repräsentativ-Routen,
  s. Dateikopf) — null Funde dort heisst «in dieser Stichprobe sauber», nicht
  «app-weit garantiert». D5 (Ansicht-Menü-Anatomie, Prüfbefund 6.9.) und D9
  (Suchpanel-Versatz) sind LAYOUT-/Anatomie-Fragen, keine reinen
  Viewport-Überläufe — R8 misst nur Letzteres, R5/R9 die Anatomie.
- **f (Reiter-Wortgrenze)**: 0 Funde in den 25×6×2 Kombinationen — die
  offenen-Reiter-Leiste und `[role=tab]`-Elemente kürzen im geprüften Bestand
  nirgends mitten im Wort. F6 (Entscheid-Kurzform «Obergericht AG HOR.2024.1…»)
  ist eine **andere** Stelle (Zitierspalte in einer Zeile, kein `role=tab`) —
  ausserhalb des f-Scopes, gehört zu b oder in einen eigenen Nachzug.
- **Nur 2 Vertreter je dynamischer Familie** (nicht alle ~19 Rechner, ~29
  Vorlagen, 1'576 Kantonserlasse, tausende Entscheide/Materialien) —
  Laufzeit-Budget. Der `span.min-w-0`-Kartendefekt ist so breit gestreut
  (Rechtsprechung, Materialien, Gesetze, Vorlagen), dass er mit hoher
  Wahrscheinlichkeit auf jeder Listen-/Karten-Seite wiederkehrt — das ist eine
  Vermutung aus der Stichprobe, kein Beweis für den ganzen Bestand.

## Tor-Politik ab jetzt

`e2e/kein-abschnitt.allow.json` startet **leer** (Auftrag). Der vierte Lauf
ist damit real ROT — 2640 nicht erlaubte Funde, das Tor zeigt sie korrekt an
(`npx playwright test e2e/kein-abschnitt.e2e.ts` endet mit Exit-Code 1). Das
ist der **erwartete** Zustand dieser Runde, kein Bau-Fehler: R8 liefert das
Messwerkzeug und den Erstbefund, der Fix ist ein eigener, künftiger Schritt
(R9 oder ein eigener Nachzug). Wer diesen Bericht abarbeitet, behebt am Bau-
stein (nicht an den 2130 einzelnen Fundzeilen) und lässt das Tor danach neu
laufen — ein sauberer `span.min-w-0`-Fix sollte die Fundzahl auf einen Schlag
um mehr als 80 % senken.
