# D41 / D42 — Ansicht-Menü ohne Abdunkelung, Split bleibt bedienbar

**Anlass:** zwei Meldungen David, 7.9.2026.
· D41 «wenn man ansicht auswählt wird der hintergrund uneinheitlich abgedunkelt»
· D42 «split screen nach bezug entscheid: gesetzesseite komisch abgedunkelt, fast
nicht mehr bedienbar»

**Bau-Einheit:** W2·24-DESIGN-IDENTITAET · Wirkungsbereich Benutzeroberfläche ·
baut auf PR #758 (D35-F2) auf. Keine Rechtslogik, keine Rechtsdaten berührt.
Messungen @1440, Chromium, deviceScaleFactor 1, hell und dunkel.

---

## D41 — die Abdunklung konnte gar nicht einheitlich sein

### Befund
Beim Öffnen von «Ansicht ▾» erschien genau **ein** abdunkelndes Element:
`div[data-v3-ansicht-scrim].lc-scrim.fixed.inset-0`, z-index 16,
`rgba(0,0,0,0.3)`, Rect [0,0,1440,900]. Kein zweiter Scrim, kein `opacity<1`,
kein `filter`/`backdrop-filter`, kein gebrochener Stapelkontext — die Vermutung
«mehrere Scrims» war falsifiziert.

Die Uneinheitlichkeit entstand aus dem, was **darüber** lag. Vier Balken mit
**drei verschiedenen Breiten**:

| z | Bauteil | Rect | volle Breite? |
|---|---|---|---|
| 30 | Topbar | 0,0,1440,64 | ja |
| 20 | Reiterleiste | 0,64,1440,34 | ja |
| 19 | `layout/InhaltsKopf` | 0,64,1440,36 | ja |
| **17** | **`[data-v3-kopf]` (Leser-Kopf)** | **180,98,1080,57** | **nein — 1080 von 1440** |
| 16 | `[data-v3-ansicht-scrim]` | 0,0,1440,900 | ja |

Horizontalprofil im Kopf-Band y = 120…135, Δ Leuchtdichte (hell), je 20-px-Band:

    x=   0 …  160 : Δ −74.9   (abgedunkelt)
    x= 200 … 1160 : Δ   0.0   (NICHT abgedunkelt — der Leser-Kopf steht darüber)
    x=1280 … 1400 : Δ −74.9   (abgedunkelt)

Vertikalprofil bei x = 80…100: y ≤ 88 Δ 0.0 · y ≥ 98 Δ −74.9 (247.3 → 172.4,
konstant bis y=900). Dunkelmodus: dieselbe Geometrie, Δ ≈ −8 bis −14.

**Bild:** ein 1080 × 57 px **helles Fenster** im sonst gleichmässig um 30 %
abgedunkelten Schirm, mit zwei harten senkrechten Kanten bei x=180 und x=1260.
Weil der Kopf `sticky` ist, wandert die helle Insel beim Scrollen mit.

### Wurzel
Kein Regressionsfehler, sondern die **Bauart**. `LeserScrim.tsx` legte den Scrim
absichtlich unter den klebenden Kopf («so tritt der Lesetext zurück, während
Öffner UND Menü scharf stehen»). Der Entwurf hat übersehen, dass dort vier
Balken mit drei Breiten liegen. Ein vollflächiger Scrim unter einem **nicht**
vollflächigen Kopf kann nicht einheitlich aussehen.

### Fix — ersatzlos zurückgebaut (§17-Gegengewicht)
Ein Dropdown auf deckendem Grund braucht keine Abdunklung (Browser-Norm).
Montagezeile in `LeserAnsichtV3.tsx` und die Datei `LeserScrim.tsx` sind weg.

**Kein Ausweg ist verloren gegangen** — gemessen bei per JS entferntem
Scrim-Knoten, Menü offen: Aussenklick `[data-v3-ansicht-panel]` 1 → **0**,
Escape 1 → **0**. `usePopoverAutoZu` (Modus `popover`) trägt beide Wege selbst;
ersatzlos entfällt allein die Zusage «Klick auf die Abdunklung schliesst».

**Kein Wissensverlust:** die Herleitung «`black`, nicht `ink-900`» und «30 % ist
die Zahl DER ROLLE» wohnt seit F2-1 an `.lc-scrim` in `src/index.css`, samt der
Leuchtdichte-Messung von damals.

---

## D42 — der Split machte das Gesetzes-Pane wirklich unbedienbar

### Befund (Davids Reihenfolge, Variante A)
1. `/gesetze/bund/OR#art-336_c` @1440, Einzelansicht.
2. Rechtsprechungs-Panel öffnen. **Zustand korrekt (Ä52):** `form="rechts"`,
   `modal="nein"`, `role="region"`, **keine Scrims**; alle 5 Ziele treffbar.
3. «⧉ Daneben öffnen» — und der Zustand mutierte still:

       [data-v3-panel-scrim]  absolute · z 40 · pointer-events AUTO
                              rect [2,165,718,735] = die GANZE Gesetzes-Pane
       [data-v3-panel-form]   form "unten" · modal "ja" · role "dialog"
                              rect [2,496,718,404]

Das offene, **nicht-modale** Beiwerk-Panel war zum Bottom-Sheet mit
Vollflächen-Scrim geworden — obwohl der Nutzer am Panel nichts getan hatte.

### Bedienbarkeit — gemessen, nicht vermutet
`elementFromPoint` auf die Mitte jedes Ziels im primären Pane:

| Ziel | trifft? | Sperrer |
|---|---|---|
| Ansicht-Öffner | **nein** | `div[data-v3-panel-scrim]` |
| Panel-Öffner (⚖) | **nein** | dito |
| Suchfeld im Leser-Kopf | **nein** | dito |
| Artikel-Textabsatz | **nein** | dito |

«Fast nicht mehr bedienbar» war also **wörtlich wahr**, nicht optisch: jeder
Klick landete auf dem Scrim, der daraufhin das Blatt schloss. Identisch hell und
dunkel. **Gegenprobe (Alleinursache):** Scrim-Knoten per JS entfernt, sonst
nichts geändert → Ansicht-Öffner trifft wieder. Kein `inert` (0 in allen sechs
gemessenen Zuständen), kein `aria-hidden`, kein `pointer-events:none` am Pane.

Variante B (`?p=…`, Split schon beim Laden) ergab denselben Zustand — der Defekt
hing am **Pane-Zustand**, nicht am Übergang; der Übergang machte ihn nur
überraschend.

### Wurzel
`LeserPanelZone.tsx`:

    const imPaneBlatt = paneZiel != null;
    const modal = imPaneBlatt || form === 'unten';      // ← die Wurzel

`paneZiel` wechselt beim Split von `null` auf die Overlay-Wurzel des Panes — eine
reine **Portal**-Frage. Über das `||` hing die **Bedien**-Frage daran. Ä52 hatte
genau diese Verwechslung schon einmal aufgelöst; für den Pane-Fall stand sie noch.

Die Begründung im Kommentar («es beansprucht die ganze Pane-Fläche») ist gemessen
widerlegt: das Blatt belegt **404 von 735 px** Pane-Höhe (55 %), 331 px
Gesetzestext bleiben sichtbar — und waren doch tot.

### Fix

    const modal = !imPaneBlatt && form === 'unten';

Modal ist das Blatt nur noch dort, wo es die einzige Bedienfläche deckt: das
Bottom-Sheet der Einzelansicht (@390). Im Pane ist es Beiwerk wie auf D (Ä52).
Folge-Rückbau: der `imPaneBlatt ? absolute : fixed`-Ternär am Scrim fällt auf
`fixed` zusammen, `aria-modal` auf `modal || undefined`; `role` liefert im Pane
jetzt korrekt `region` statt einer Rollen-Lüge (§8).

**Nicht** geändert: `panelForm` (`kopfStufen.ts`) gibt im Pane weiterhin
`'unten'`. Die **Gestalt** ist begründet — ein 22-rem-Streifen in einer 718-px-
Spalte liesse vom Text nichts übrig (Lesespalte im Pane: x 40, Breite 641) — und
«NIE drei vertikale Flächen im Split» bleibt. Falsch war allein die Modalität.

**Weg hinaus bleibt:** `modus` fällt im Pane auf `'fest'`; das steht in
`OHNE_FALLE`, woran der Escape-Handler hängt. Escape, ✕ und Zweitklick am Zähler
tragen weiter — gemessen: Escape → Blatt count 1 → 0. Nur der Aussenklick
entfällt, wie auf D seit Ä52 gewollt (sonst wäre Textmarkieren unmöglich).

---

## Wächter

**Rückbau (D41).** In `e2e/leser-v3-scrim-b7n1.e2e.ts` entfielen die drei Fälle,
die genau die gemeldete Stufe zementierten. Der Dateiname bleibt: B7-N1 ist nur
zur Hälfte aufgehoben — der modale Blatt-Scrim @390 trägt den Kern weiter («ein
Scrim, der seine Farbe mit dem Thema wechselt, ist per Definition falsch»).
`src/tests/design-r2d-mobil-zustaende.test.ts`: sieben → sechs Fundstellen. Die
datierten Beleg-Kommentare in `scripts/check-design-tokens.ts` bleiben
unverändert (§2b — Belege altern nicht); `src/index.css` bekam zwei
Ergänzungs-Zeilen, weil der dort genannte Träger entfallen ist.

**Zubau.** Der bestehende Ä52-Fall läuft neu in hell UND dunkel und misst
zusätzlich den Zustand, um den es ging: **Menü offen**. Neu die Gruppe «D42 ·
Split: das Gesetzes-Pane bleibt bedienbar» mit zwei Aufbauten — Zustand (Split
beim Laden) und Übergang (Davids Reihenfolge).

**Der Beweis ist nicht der Zähler, sondern die Bedienbarkeit** (§6.7): eine
Treffer-Sonde prüft, ob `elementFromPoint` auf die Mitte von Ansicht-Öffner,
⚖-Öffner, Suchfeld und Artikel-Absatz das Ziel liefert. Ein `toHaveCount(0)` auf
einen `data-`-Namen fiele bei der nächsten Bauart still um. Untergrenze drei
gemessene Ziele, damit die Sonde nicht still auf null zusammenschrumpft.

### Rot-Probe (vorgeführt 7.9.2026)
Quelldateien auf 7db4880d5 zurückgesetzt, `dist` neu gebaut, Spec unverändert:

    6 von 8 Fällen rot  (grün blieben nur die zwei unveränderten @390-Fälle)
    D41: [data-v3-ansicht-scrim] count 1 statt 0 — hell UND dunkel
    D42: [data-v3-panel-scrim]   count 1 statt 0 — beide Aufbauten, beide Themes

Weil der Zähler zuerst zuschlägt, ist die **Treffer-Sonde eigens rot gemessen**
worden — sonst wäre sie ein Tor, das nie gefallen ist:

    (a) Split beim Laden : 4 Ziele gemessen, 4 nicht treffbar
    (b) Übergang         : 4 Ziele gemessen, 4 nicht treffbar
    je Ziel: elementFromPoint → div[data-v3-panel-scrim] statt des Ziels

**Gegenprobe, dass nur der Pane-Fall entmodalisiert wurde:**
`e2e/leser-v3-rahmen.e2e.ts` «(f2) Gegenprobe @390: das modale Blatt schliesst
beim Klick auf den Scrim» bleibt grün.

---

## Tore

| Tor | Ergebnis |
|---|---|
| `npm run test` | 461 Dateien, 7467 Tests grün (2 skipped) |
| `npx tsc -b` | grün (ohne Ausgabe) |
| `npm run lint` | 0 Fehler, 1 Bestands-Warnung (`useUniversalSuche.ts`, unberührt) |
| `check:design-tokens` | grün — 75 Stufen, 17 Deckkraft-Klassen |
| `check:schlankheit` | grün — 1491 Dateien, keine Überschreitung |
| `check:e2e-shards` | grün — 151 Specs, Union deckungsgleich |
| `golden:vergleich` | **IDENTISCH — 256 Fälle byte-gleich** |
| e2e-Block `--repeat-each=2 --workers=2` | **114 / 114 grün** |
| `check:perf-lighthouse` (PERF_RUNS=1) | grün — CLS 0.000 überall |

e2e-Block: `leser-v3-scrim-b7n1` · `leser-v3-rahmen` · `leser-v3-panel-nachzug` ·
`leser-v3-panel-zaehler` · `w224-d35-f2-kopf` · `w224-d35-f4-menue` ·
`leser-w224-g` · `leser-v3-split-a34-bugs`.

## Belege

| Bild | zeigt |
|---|---|
| `d41-d42-a-menue-1440-hell.jpg` | Ansicht-Menü offen, Hintergrund unverändert hell |
| `d41-d42-b-menue-1440-dunkel.jpg` | dasselbe im Dunkelmodus |
| `d41-d42-c-split-1440-hell.jpg` | Split mit offenem Panel — Gesetzes-Pane scharf und treffbar |
| `d41-d42-d-split-1440-dunkel.jpg` | dasselbe im Dunkelmodus |

## Offene Punkte
- **Nur Chromium.** `elementFromPoint` ist standardisiert, das Risiko ist gering,
  WebKit/Firefox sind aber ungemessen.
- **Nebenbefund, nicht behoben (ausserhalb des Auftrags):** ein Klick auf einen
  Entscheid in der Bezüge-Zeile am Artikelende öffnet **keinen** Split, sondern
  navigiert die ganze Seite — die Split-Regel `randNotizZiel` greift nur für
  Links in `.lr-notiz` (`v3/LeserLesespalte.tsx`, `closest('.lr-notiz')`). Davids
  Wortlaut passt auf Variante A; ob das Navigieren gewollt ist, ist ein
  Produkt-Entscheid und wartet auf David.
- **Fachliche Abnahme durch David** steht aus (§7).
