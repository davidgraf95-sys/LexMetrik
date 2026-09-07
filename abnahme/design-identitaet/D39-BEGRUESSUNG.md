# D39 · Begrüssung als Kopf, «Sammlung» weg, Datum + Uhrzeit darunter

**Auftrag** Fixer D39 der W2·24-Nachzug-Reihe (David 7.9.2026), 2. Anlauf
(der erste blieb beim Start hängen, Worktree sauber übernommen).
**Wunsch (wörtlich):** «auf der homeseite entferne oberhalb der begrüssung
das wort Sammlung und dann mach die begrüssung prominenter und klarer von
dem darunter abgegrenzt. also das hallo und dann etwas kleiner datum und
uhrzeit.»

**Branch** `feat/w2-24-d39-begruessung`, Basis `origin/main` `0c2fc3e06`.
Kein Merge, kein Deploy (Bau-Auftrag).

---

## 1 · Fix

**`src/components/start/SuchBlock.tsx`** — die eigene `<h1>{SAMMLUNG_TITEL}</h1>`
(«Sammlung», Archivo 12 px, oberhalb des Grusses) ist weg. Die BEGRÜSSUNG
selbst ist jetzt die (einzige) `<h1>`, eine Typo-Stufe grösser als der
R10-NACHZUG-Stand (D14): `text-h1 lg:text-display` (32 px @390, 36 px @1440
— Skala unverändert aus `tailwind.config.js`, kein neuer Wert; vorher
`text-h2 lg:text-h1`, 25.6/32 px). Wochentag/Datum, bis hierher NEBEN dem
Gruss in derselben Zeile, stehen jetzt in einer EIGENEN, kleineren Zeile
darunter (`text-xs`, unverändert) — und tragen dort neu die UHRZEIT:
«Montag, 7. September 2026 · 14:32». Eine 1-px-Linie (`border-b border-rule`,
F0.6 — bewusst `--rule`, nicht `--rule-soft`, weil hier die ganze erste Ebene
des Pults gegen die Bereichs-Reihe abgrenzt, nicht eine Zeile im Satzspiegel)
plus `pb-8` (zusätzlich zum bestehenden `gap-y-9` des Pult-Rasters) grenzt den
Block sichtbar nach unten ab — ungestaffelt auch @390.

**`src/components/start/Begruessung.tsx`** — `useHeute()` liefert neu ein
viertes Feld `uhrzeit: string | null`. Gruss/Wochentag/Datum bleiben wie
bisher EIN Bild vom Mount-Zeitpunkt (lazy `useState`-Init); die Uhrzeit lebt
in einem EIGENEN State, startet mit `null` (identisch zwischen Server- und
erstem Client-Render — keine Hydration-Divergenz, kein im Build
eingefrorener Wert), wird erst im `useEffect` — also NACH der Hydration —
gesetzt und danach per `setInterval(…, 60_000)` jede Minute nachgeführt.
ZEITQUELLE INJIZIERBAR: bewusst KEIN eigener Test-Parameter — die Komponente
ruft nur `new Date()`/`setInterval`, dieselben Globals, die Playwrights
`page.clock` (verfügbar ab 1.45, hier 1.60) transparent abfängt; ein
zweiter, nur für Tests existierender Parameter wäre eine spekulative
Abstraktion für einen Bedarf, den es bereits gibt (Minimalismus-Prinzip,
`.claude/rules/schichtentrennung.md`).

**CLS 0 (§15):** der Platz für die Uhrzeit ist von Anfang an reserviert —
`visibility:hidden` an einem `00:00`-Platzhalter (unter `.num`
tabellarisch exakt gleich breit wie jede echte `HH:MM`), NICHT bedingtes
Rendering. `visibility:hidden` nimmt (anders als `display:none` oder ein
weggelassenes Element) nie eine Box aus dem Layout-Fluss — eine CSS-Spec-
Garantie, keine Empirie.

**`src/pages/Startseite.tsx`** — Datei-Kopf-Kommentar nachgeführt («genau
EINE <h1> — die Begrüssung im Suchblock, seit D39»).

**`src/lib/seo.ts`** — `SAMMLUNG_TITEL` («Sammlung») ist GESTRICHEN, nicht nur
umkommentiert: kein anderer Konsument blieb übrig, nachdem die H1-Rolle
entfiel (`SAMMLUNG_BESTAND`, die Aufzählung im Seitenfuss, ist davon
unberührt — Minimalismus-Prinzip statt unbenutzt bewachter Export).

### Deklarierte Testanpassung (§6.3)

**`src/tests/katalog.test.tsx`** — der Fall «Titelblatt-Zeile: EINE H1
«Sammlung» …» prüfte wörtlich den festen String `SAMMLUNG_TITEL` als
H1-Inhalt; das ist mit D39 falsch (die H1 trägt jetzt den zufällig
gezogenen Gruss). Umgestellt auf: (a) H1-Inhalt ist Mitglied im
Begrüssungs-Pool (`IMMER` ∪ `TAGESZEITEN[*].pool`), (b) kein «Sammlung» im
Kopfbereich (vor der Bereichs-Reihe). Zusätzlich ergänzt: der SSR-Schnappschuss
(`renderToString`, keine Effekte) trägt nur den unsichtbaren
`00:00`-Platzhalter, keine gebackene Uhrzeit — Grund für die frühere Notiz
«weiterhin ohne tickende Uhr» ist jetzt technisch (kein `useEffect` in
`renderToString`), nicht mehr fachlich (die Uhr tickt seit D39 nach der
Hydration).

---

## 2 · Wächter + Rot-Probe (§6.7 — ein Tor, das nicht scheitern kann, ist gefährlicher als keines)

Neuer Wächter `e2e/d39-begruessung.e2e.ts` (6 Fälle: kein «Sammlung» im
Kopfbereich + H1=Begrüssung, H1 grösser als Datumszeile, Datum+Uhrzeit-Format
minütlich nachgeführt, Uhrzeit im Prerender nur als unsichtbarer Platzhalter,
1-px-Linie @1440/@390, CLS beim Uhrzeit-Reveal).

**Rot-Probe 1 (Vorzustand, 7.9.2026):** Quelldateien per `git stash` auf den
Stand vor dem Fix zurückgesetzt, `dist` neu gebaut, derselbe Wächter
gefahren — 6/6 ROT:

```
1) kein «Sammlung» im Kopfbereich …
   Error: H1-Text: «Sammlung»
   Expected substring: not "Sammlung"   Received: "Sammlung"

2) Begrüssung (H1) grösser als Datumszeile …
   Error: H1 12px vs. Datumszeile 32px
   Expected: > 32   Received: 12

3–6) analog rot (Uhrzeit-Platzhalter fehlt, keine Uhrzeit im Format HH:MM,
   keine Linie `border-rule`, CLS-Fall bricht schon am fehlenden
   Datumszeilen-Locator ab).
```

Mit dem Fix (Stand wiederhergestellt, `dist` neu gebaut): 6/6 grün, auch mit
`--repeat-each=2` zusammen mit `e2e/startseite-pult-r10.e2e.ts` (32/32).

**Rot-Probe 2 (CLS-Mechanismus, gezielt für den `visibility:hidden`-Platzhalter):**
Reservierung durch bedingtes Rendering (`{uhrzeit && <span>…</span>}`) ersetzt.
Befund: an der konkreten Textlänge dieser Runde («Montag, 7. September 2026 ·
14:32», @1440 UND @390) reicht die Zeilenbreite in beiden Fassungen aus, ohne
Umbruch — CLS blieb in BEIDEN Varianten identisch (@390 exakt 0, @1440
dasselbe, vom Block unabhängige Restrauschen unter der 0.01-Schwelle). Die
Reservierung bleibt trotzdem gebaut (CSS-Spec-Garantie, exakt die Zusage aus
dem Auftrag) und der CLS-Fall bleibt als Regression-Wächter stehen — ein
künftig längerer Gruss, der die Zeile zum Umbruch zwingt, würde die
0.01-Schwelle reissen (zwei Grössenordnungen unter dem Web-Vitals-«gut»-Wert
0.1). Ehrlich im Testkommentar dokumentiert statt stillschweigend als
bewiesen behauptet.

---

## 3 · Tor-Ergebnisse

| Tor | Ergebnis |
|---|---|
| `npx tsc -b` | grün, keine Ausgabe (Exit 0) |
| `npm run lint` | 0 Fehler (1 Warnung, vorbestehend, `useUniversalSuche.ts`, ausserhalb Whitelist) |
| `npm run test` (vitest) | 460 Testdateien, 7454 grün / 2 skipped |
| `npm run check:schlankheit` | GRÜN — 1487 Dateien, 15 Bestands-Einträge, keine Überschreitung |
| `npm run gen:e2e-shards` + `npm run check:e2e-shards` | GRÜN — 142 Specs, Union der 8 Gruppen deckungsgleich, `shard-gruppen.json` aktuell |
| `npm run check:seo-index` | OK — 7 Meta-Felder spiegeln `seo.ts` (document.title/SEO unberührt) |
| `npm run build` (inkl. Prerender) | grün, 63 Routen prerendered |
| `npm run golden:vergleich` | IDENTISCH — 256 Fälle byte-gleich (verhaltensneutral — reine UI-Änderung, keine Rechenlogik berührt) |
| `npx playwright test e2e/d39-begruessung.e2e.ts e2e/startseite-pult-r10.e2e.ts --repeat-each=2 --workers=2` | 32/32 grün |
| `npx playwright test e2e/a11y.e2e.ts e2e/a11y-flaeche.e2e.ts --workers=2` | 107/107 grün (Heading-Hierarchie Startseite inklusive) |

Preview lief gegen den eigenen `dist`-Stand auf Port 4431
(`vite preview -- --port 4431 --strictPort`, `E2E_PORT=4431`).

---

## 4 · Screenshots (4)

- `d39-1440-hell.jpg` — Desktop @1440, hell: «Schön, Sie wieder zu sehen.»
  als grosse, kursive H1, darunter klein «Montag, 7. September 2026 · 14:25»,
  darunter die Trennlinie vor der Bereichs-Reihe.
- `d39-1440-dunkel.jpg` — dieselbe Stelle im Dunkelmodus («Endspurt am
  Nachmittag.»).
- `d39-390-hell.jpg` — mobile @390, hell («Grüezi.») — Linie und Abstand
  ungestaffelt wie @1440.
- `d39-390-dunkel.jpg` — mobile @390, dunkel («Ihr Tag, Ihre Akten.»).

Alle vier: kein «Sammlung» oberhalb der Bereichs-Reihe.

---

**Geänderte Dateien:**
`src/components/start/SuchBlock.tsx` (H1 = Begrüssung, Datumszeile +
Uhrzeit, Trennlinie), `src/components/start/Begruessung.tsx` (Uhrzeit-State,
minütlich), `src/pages/Startseite.tsx` (Kommentar nachgeführt),
`src/lib/seo.ts` (`SAMMLUNG_TITEL` gestrichen), `src/tests/katalog.test.tsx`
(deklarierte Anpassung §6.3), `e2e/d39-begruessung.e2e.ts` (neuer Wächter),
`e2e/shard-gruppen.json` (Projektion, `gen:e2e-shards`), diese Datei, vier
Screenshots.
