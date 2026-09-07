# R6H · Die gespeicherte Lesestellung überlebt den Neustart (D27, 7.9.2026)

Ein Befund, eine Wurzel. Bau-Branch `feat/w2-24-lh`, Commit `e29c6bfd0`.

## Befund

Sonde `e2e/w224-reiterverhalten.e2e.ts`, Fall **(e)**, Zusage 2: nach 1500 px
Scrollen im ZGB steht `/gesetze/bund/ZGB#art-3` im Reiter-Speicher; ein Reload
macht daraus `#art-1`.

```
Error: die Lesestellung ueberlebt den Neustart
  Expected: "/gesetze/bund/ZGB#art-3"
  Received: "/gesetze/bund/ZGB#art-1"
```

Reproduziert 3/3 (gebautes `dist/`, Preview 4417, Chromium 1440×900). Die
Zeitmessung zeigt, warum die Beschriftungs-Zusage eine Zeile davor noch grün
war — der Überschreiber kommt **nach** ihr:

```
reload +  0 ms · scrollY=0 · art-1.top=877 · tabs=[{"path":"…#art-3"}]
reload +150 ms · scrollY=0 · art-1.top=877 · tabs=[{"path":"…#art-1"}]
```

## Bisect

Je eigener Build, dieselbe Messung, `art-1`.top bei scrollY 0:

| Stand | `art-1`.top | Spy am Dokumentanfang | Reiter nach Reload | |
|---|---|---|---|---|
| `0ba97c5d6` (Nullprobe, nach Fixer C) | 921 px | meldet nichts | `#art-3` | **grün** |
| `a60dd7f75` (D30/D31) | 921 px | meldet nichts | `#art-3` | **grün** |
| `7e71a5dd2` (D32/N4) | 877 px | meldet «1» | `#art-1` | **rot** |

`7e71a5dd2` («D32 Suche über dem Gesetz, N4 eine Kopfzeile») hat den 44-px-Kopf
aus R6d aus der Lesespalte genommen; `art-1` fällt dadurch bei 900 px
Fensterhöhe wieder **über** die Bezugslinie des Scroll-Spys. Damit ist D32 der
**Auslöser**, nicht die Ursache — es hat nichts falsch gemacht, sondern eine
Fensterhöhe verändert.

## Wurzel

`src/pages/gesetz-leser/inhalt-hooks.tsx`, Zweig (b) des Scroll-Spys (vor dem
Fix Zeile 355): `aktualisiereTabArtikel(tabZiel)` lief **beim Aufsetzen** des
Spys, also bevor der Leser einen Finger gerührt hatte, und überschrieb damit
genau die Stelle, die den Neustart tragen soll. Der Leser springt beim erneuten
Öffnen bewusst **nicht** zurück (W2·10-UI-NAV/R4, `lesePosition.ts`: kein
Auto-Sprung, nur ein Chip) — die gespeicherte Stelle ist dort die einzige
Erinnerung, und sie war einer Fensterhöhe ausgeliefert. Latent war das seit dem
F1G-Stand, der dieselben 877 px mass (§0 Ziff. 2b: dessen Protokoll bleibt für
seinen Stand richtig).

## Fix

Der Reiter-Anker folgt dem **Lesen**, nicht dem Aufsetzen. Ein Ref `gescrollt`
latcht am echten Scroll-Ereignis — demselben, das den rAF-Kranz weckt, und ein
Klick-/TOC-Sprung scrollt programmatisch, gibt es also ebenso frei — und wird
zurückgesetzt, sobald ein anderes Dokument bzw. eine andere Pane-Instanz im
Fenster steht (sonst trüge ein SPA-Wechsel die Erlaubnis des Vorgängers weiter
— genau die Kalt-/SPA-Asymmetrie des F5-Befunds). Nur hinter diesem Tor
schreibt der Spy. Zweig (a), die Kopfzeile, meldet «Art. 1» unverändert: sie
ist Darstellung, nicht Persistenz (§3).

## Sonde (h) — geometrieunabhängig

Fall (e) fällt nur auf, solange `art-1` über der Linie liegt; bei 921 px war der
Defekt unsichtbar. Neu misst **(h)** dieselbe Zusage ohne jede Geometrie:
gespeicherte Stellung `#art-99`, Reload, **kein** Scrollen, 2000 ms warten — sie
muss unverändert dastehen.

**Rot-Beweis (§6.7):** gegen das `dist/` ohne das Tor 3/3 rot —
`Expected "/gesetze/bund/ZGB#art-99" · Received "/gesetze/bund/ZGB#art-1"`.

## Tore (Exit-Code 0, sofern nicht anders vermerkt)

| Tor | Ergebnis |
|---|---|
| `npx tsc -b` / `npm run build` | grün |
| `npm run lint` | 0 errors, 1 warning (vorbestehend, `useUniversalSuche.ts`) |
| `npm run test` | 460 Dateien, 7454 Tests grün |
| `npm run check:golden-normtext` | 60257 Knoten vollständig, 0 Waisen |
| `npm run check:normtext` | 25404 Snapshots, Drift ok |
| `npm run check:schlankheit` | grün, keine Neuzugänge |
| `npm run check:e2e-shards` | 137 Specs, Union deckungsgleich |
| 4 Sonden `--repeat-each=2 --workers=2` | **74 von 76 grün** |

## Vorbestehende Rote (nicht von diesem Bau)

`e2e/w224-r13-reiter.e2e.ts` R13-2 **@390** ist rot: `scrollWidth 256 >
clientWidth+1 242`. **Nullprobe** am Vorstand `5d8ed6375` ohne diesen Fix,
`--repeat-each=3`: **3/3 rot mit identischen Zahlen**. Der Befund liegt in der
Überlauf-Rechnung der Reiterleiste @390, nicht im Lesestellungs-Pfad, und ist
hier nicht angefasst worden (Whitelist/TABU). @1440 und @1024 sind grün.
