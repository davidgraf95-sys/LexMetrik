# R6d — Erlass-Suche in den Leser-Kopf, Brotkrume raus, Lesestellung als Signal

**Auftrag:** W2·24-DESIGN-IDENTITAET, Zeilen **D27 · D28 · D28-Zusatz · D28-Regel**
(Prüfrunde 2, 6.9.2026). **Zweig:** `feat/w2-24-r6d`, abgezweigt von
`feat/w2-24-design-identitaet` (Stand nach R6c-Merge; R6c ist zu diesem Zeitpunkt
noch **nicht** in `main` — der Integrationszweig ist der nächstliegende korrekte
Baugrund, offengelegt).

Davids Wortlaut, 6.9.2026:

> «die suchleiste im gesetz, welche sich oben an der gliederung befindet, will ich
> oben am gesetz — dann verschiebt sie sich auch nicht, wenn gliederung
> eingeklappt ist; achte darauf, dass dann das gleiche gilt»

> «diese funktion, dass es anzeigt, in welchem artikel wir sind, soll der tab
> bekommen; es kann dann direkt im gesetz raus»

---

## 1 · D28 — die Erlass-Suche sitzt oben am Gesetz

**Vorzustand.** Ein Feld, zwei Wohnorte: stand die Gliederung als 18-rem-Spalte,
lag es in deren klebendem Sockel; klappte man sie ein, wanderte es in den
klebenden Kopf-Block (Ä19, 17.8.2026). Genau dieses Wandern ist der Mangel.

**Gebaut.** `LeserRahmenV3.tsx`: `const suchZoneKlebt = hatLeiste;` — bis 6.9.
stand dort `hatLeiste && !zweiSpalten`. Die Gliederungs-Seitenleiste hat ihren
`suchFeld`-Slot **verloren** (Prop gestrichen, nicht nur ungenutzt); sie trägt
nur noch die Gliederung. Im modalen Gliederungs-Sheet (@390, hinter ☰) reicht der
Rahmen das Feld weiterhin an dessen eigenen Kopf (`sprungFeld`, A2/WCAG 2.4.3 —
ein Feld hinter einer Fokus-Falle wäre unerreichbar); es bleibt bei **genau einem
Feld im DOM**.

**Warum in den klebenden Kopf-BLOCK und nicht unter das Titelblatt.** Der Auftrag
formuliert «Zeile unter SR-Nummer/Titel/Meta». Das ist die einzige Stelle, an der
ich **abweiche**, und zwar messbar begründet: das Titelblatt liegt in der
Lese-ZELLE, und die rückt beim Ein-/Ausklappen der Gliederung um **127 px** zur
Seite (Messung unten). Ein Feld dort verstiesse gegen D28-Zusatz («Δx = 0») und
gegen Davids Begründung selbst. Der Kopf-Block liegt über der ganzen
Rahmenbreite; seine x-Position hängt an keinem Spalten-Zustand — die Zusage ist
damit **strukturell erfüllt statt bewacht**. Er steht zudem sichtbar «oben am
Gesetz», über Gliederung *und* Text, und er klebt (H2, David 16.8.2026: «das
Suchfeld muss immer zugreifbar sein»).

**Funktion 1:1 mitgenommen:** Treffer-Hervorhebung, Sprung zur Fundstelle,
Artikel-Sprung («Art. 429» → Enter), Fokus, ⌘K/Ctrl+K und «/», Esc leert,
↑↓ blättern. Kein Callback, kein Zustand, keine Registry wurde ersetzt.

**Neu, weil D28 es verlangt** («Treffer-Navigation ‹ › und Zähler in derselben
Zeile»): zwei 20-px-Griffe `‹ ›` rechts in der Zähler-Zeile, auf denselben
Callbacks wie ↑↓ im Feld und die Pfeile im Kopf der Trefferliste (§5, eine
Fundstellen-Folge, drei Bedienarten). Registerfarbe **Gesetze** (`--reg-g`) im
Hover/Fokus, Ruhefarbe `--ink-500` — eine Navigations-Hilfe, die im Ruhezustand
leuchtet, zöge den Blick vom Gesetzestext ab. Additiv, `.lr8-erlasssuche-schritt`.

**Druck ohne Feld.** `@media print { .lr8-erlasssuche { display: none } }` —
gemessen am gebauten Stand (`emulateMedia({media:'print'})`): `display = none`.
Die Zone fällt ganz, nicht nur ihre Knöpfe: der Pauschal-Selektor `button` des
Druck-Blocks hätte Eingabefeld und Trefferzahlen stehen gelassen.

### 1a · Feldbreite — ein gemessener Nebenbefund

Nach dem Umzug lief das Eingabefeld @1440 über **1072 px** (vorher 280 px in der
Spalte): die Zone erbt die Breite des Kopf-Blocks. Ein Unterstrich-Feld über
einen Meter Bildschirm ist keine Eingabe mehr. Gedeckelt auf **`max-w-reading`**
(40 rem = 640 px) — dieselbe Token-Breite wie die Lesespalte, kein arbitrary
`max-w-[…rem]` (das verbietet der Linien-/Typo-Kanon R2 an dieser Stelle, und der
Lint-Fehler hat mich zu Recht darauf gestossen).

### 1b · Nachzug aus dem eigenen Screen: die doppelte Trefferliste

**Selbst erzeugt und selbst gefunden** (Screen `r6d-leser-1440-suche-aktiv`,
erster Lauf): weil die Zone jetzt auch bei stehender Spalte da ist, erschien das
Treffer-Blatt am Feld (Ä76) — und legte sich über die Spalte, die dieselbe
Trefferliste samt demselben Kopf «49 Artikel · 110 Fundstellen» bereits zeigte.
Zwei gleiche Listen übereinander (§5). Behoben mit `listeSteht`: steht die
Gliederungs-Spalte, schweigt die Zone (kein Blatt, keine Zähler-Zeile, kein
«Treffer anzeigen →») — die Zahlen und der Schritt stehen zwei Zentimeter links,
aus derselben Quelle. Übrig bleibt das Feld, und darum ging es.
Nachgemessen: `[data-treffer-liste]` count **1**.

---

## 2 · D28-Regel — die Klapp-Sonde

`e2e/leser-klapp-sonde.e2e.ts` (neu, Shard-Gruppe 7).

**Messreihe @1440, `/gesetze/bund/STPO`, Preview 4372 (6.9.2026):**

| Vorgang | Erlass-Suche | Kopf | Kopf-Ortszone | Kopf-Griffe | Ansicht | Lesespalte |
|---|---|---|---|---|---|---|
| Gliederung **zu** | Δx 0 · Δy 0 | Δx 0 · Δy 0 | Δx 0 · Δy 0 | Δx 0 · Δy 0 | Δx 0 · Δy 0 | **Δx −127 · Δw +1** |
| Gliederung **wieder auf** | Δx 0 · Δy 0 | Δx 0 · Δy 0 | Δx 0 · Δy 0 | Δx 0 · Δy 0 | Δx 0 · Δy 0 | Δx 0 · Δw 0 |
| App-Seitenleiste, **absolut** | Δx +128 | +128 | +128 | +128 | +128 | +127 |
| App-Seitenleiste, **relativ zum Rahmen** | 0 | 0 | 0 | 0 | 0 | −1 (Rundung) |

Ausgangslagen: Suche x 184 / y 185 / w 640 · Kopf x 180 / w 1080 · Rahmen x 184 /
w 1072 · Lesespalte x 554 / w 640.

**«nur die Textspalte ändert sich» ist damit gemessen, nicht behauptet.**

**Rot-Beweis (§6.7), am neu gebauten Vorzustand:**
`suchZoneKlebt` zurück auf `hatLeiste && !zweiSpalten`, Feld zurück in die
Gliederung, `npm run build`, gemessen:

```
VORZUSTAND, Gliederung offen : x 184, y 273, w 280, im Kopf: false
VORZUSTAND, Gliederung zu    : x 184, y 185, w 672, im Kopf: true
WANDERUNG des Feldes: Δy = -88 px, Δw = +392 px
```

Die Sonde fällt dabei schon an ihrer ersten Zusage: mit stehender Gliederung gibt
es gar kein `[data-v3-such-zone] input` (Timeout nach 20 s). Danach zurückgebaut.

**Offengelegte Abweichung (§7) — die App-Seitenleiste.** Der Auftrag verlangt
Δx = 0 auch beim Ein-/Ausblenden der App-Seitenleiste. Das ist dort nicht
erreichbar **und nicht gewollt**: die Leiste nimmt dem `<main>` real Platz weg,
gemessen rückt der ganze Seiteninhalt um 128 px — Kopf, Titelblatt, Text und
Arbeitsleiste gemeinsam. Eine Zusage «nichts verschiebt sich» hiesse dort, den
Inhalt gegen sein eigenes Fenster festzunageln. Fall (b) misst darum **relativ
zum Leser-Rahmen**: kein Kopf-Element rutscht gegen ihn (alle 0). Das ist
dieselbe Zusage wie in (a), im Bezugssystem, das die App-Leiste übrig lässt.

---

## 3 · D27 — die Brotkrume ist weg, die Lesestellung wird Signal

**Entfernt** aus `LeserKopf.tsx`: die Kette «Gesetze › Bund ›», ihr enger Ersatz
«‹ Gesetze» (`data-v3-kopf-krume-kurz`) und der laufende Artikel
(`data-v3-kopf-artikel`). Die Landmarke `<nav aria-label="Ort im Gesetz">` fällt
mit ihrem Inhalt — eine `nav` ohne Ziel darin ist für einen Screenreader eine
leere Verheissung (§8). Die **Zone** bleibt als `[data-v3-kopf-ort]` (linke Spur
der Kopfzeile, Messpunkt der Klapp-Sonde).

**Geblieben:** das **Kürzel**. Es ist nicht der *Ort*, sondern der *Name* des
Dokuments; ohne es trüge die klebende Zeile beim Scrollen keine Auskunft mehr
darüber, worin man liest. Der Entscheid 17.8. «keine Doppelkrume» bleibt gewahrt:
der Ort steht genau einmal, im Reiter.

### 3a · Das Signal, das die Reiter-Kurzform lesen muss

**Es existiert bereits und feuert bereits** — ich habe nichts daran gebaut,
sondern es geprüft und bewacht. Die Kette, Datei für Datei:

| Schritt | Ort |
|---|---|
| Scroll-Spy erkennt den Artikelwechsel im Bild | `src/pages/gesetz-leser/inhalt-hooks.tsx:487` (`aktiverArtikel`) |
| baut das Ziel `<basisPfad><?search>#art-<token>` | `src/pages/gesetz-leser/inhalt-hooks.tsx:514` |
| meldet es entprellt (200 ms, trailing) | `src/pages/gesetz-leser/inhalt-hooks.tsx:516` — `aktualisiereTabArtikel(tabZiel)` |
| schreibt **nur den Anker** des passenden Reiters | `src/lib/tabs.ts:417` — `aktualisiereTabArtikel(path)` |
| Speicher + Ereignis | `src/lib/tabs.ts:150` — `localStorage['lexmetrik-tabs']`, dann `dispatchEvent(TABS_EVENT = 'lexmetrik:tabs')` |
| zweiter Schreiber (Artikel-SPRUNG statt Scrollen) | `src/pages/gesetz-leser/v3/leserV3Modell.ts:318` |

**Das Feld, das die Kurzform künftig lesen muss, heisst `TabEintrag.path`** — und
zwar dessen `#art-…`-Anker, ausgelesen mit `artikelLabelVonPfad`
(`src/lib/tabGruppen.ts:78`). Das Ereignis, auf das sie hört, ist `TABS_EVENT`.

**Heutiger Stand, geprüft:** die Reiterleiste liest die Lesestellung **schon**
aus dieser Quelle — aber nur für den `title`:
`src/components/layout/Reiterleiste.tsx:546` (`gelesen = artikelLabelVonPfad(t.path)`,
ergibt «… — gelesen bis Art. 336c»). Die **Kurzform** liest dagegen
`src/components/layout/Reiterleiste.tsx:144` — `t.wahl`, also den bei der
Navigation GEWÄHLTEN Anker, nicht die laufende Stellung (Regel F5/R2-Nachzug,
`lib/tabs.ts:415`: «Rührt `wahl` NICHT an: die Beschriftung folgt der Adresse,
nicht dem Scroll-Spy»).

**Was Fixer 1i/1g also zu tun hat** (TABU für mich — `lib/tabs.ts`,
`layout/Reiterleiste.tsx`): in `kurzform` `t.wahl` durch `t.path` ersetzen und die
F5-Regel als revidiert deklarieren (D27 sagt ausdrücklich: «deterministisch heisst
jetzt gleiche Lesestellung ⇒ gleiche Beschriftung»). Mehr ist nicht nötig — das
Signal steht, ist entprellt, ist pane-tauglich (LM-179) und wird ab jetzt bewacht.

**Wächter (mein Beitrag):** `e2e/leser-v3-ortsangabe.e2e.ts` ist von der
Kopf-Ortsangabe auf **das Signal** umgestellt. Es misst dieselbe §7-Frage wie
zuvor — «nennt die Ortsangabe wirklich die Stelle, an der der Leser steht» — nur
am neuen Träger, und in drei Zusagen: (1) es gibt keine zweite Chrome-Quelle mehr,
(2) das Signal nennt eine im Bild sichtbare Bestimmung, (3) **es wechselt beim
Weiterscrollen** (genau der vom Auftrag verlangte Wächter). Rot zu bekommen:
`aktualisiereTabArtikel(tabZiel)` auskommentieren.

---

## 4 · Was der Umzug kostet, offen benannt

**Klebendes Chrome des Lesers @1440: 57 → 101 px** (+44 = `SUCH_H_RUHE`,
2.75 rem). @390 unverändert **93 px** — dort stand das Feld schon vorher im Kopf.
Die Schranke `EIGEN_D` in `e2e/leser-v3-kopfzeile.e2e.ts` ist mit
§6.3-Deklaration von 59 auf 103 gehoben (Bissigkeit 2 px bleibt); die
Vorher-Messwerte (17.8.2026) sind **nicht** umgeschrieben, der Zuschlag steht als
eigene Konstante `SUCH_ZONE_H` daneben.

**Der Weg zurück zur Gesetzes-Übersicht.** D27 verweist ihn auf Seitenleiste und
Reiter. Gemessen @1440 auf `/gesetze/bund/STPO`: die Hauptnavigation ist auf
Leser-Seiten **eingeklappt** (`useSeitenleiste({ vorgabeEingeklappt:
istGesetzLeserPfad })`) — `nav[aria-label="Hauptnavigation"]` count **0**. Der
Umschalter in der Topbar ist immer da (count 1), nach einem Klick steht der Link
`/gesetze` (count 1); @390 führt der Weg über ☰ (im Test geklickt, samt
URL-Prüfung). **Der Rücksprung ist damit einen Klick teurer als vorher** — das ist
die Folge von D27 und keine Nebenwirkung, aber es ist ein Punkt für David: wenn
ihm das zu teuer ist, ist die günstigste Rückholung ein «Gesetze»-Reiter, der
beim Öffnen eines Erlasses ohnehin stehen bleibt (D7), nicht die Krume.

**Kein Höhenausgleich mehr nötig beim Klappen.** Der V6-Fall
(`leser-v3-kopfzeile` (e)) prüfte als Vorbedingung, dass der Kopf beim Einklappen
**wächst** (121 → 164 px, Ä19), damit `useStickAusgleich` den Scroll nachziehen
kann. Gemessen 6.9.: **101 → 101 px**. Die tragende Zusage des Falls («der
Artikel, an dem ich lese, steht danach immer noch unter dem Kopf») ist damit auf
dem kürzeren Weg erfüllt; die Vorbedingung ist umgedreht statt gestrichen und
meldet jede Rückkehr der lagen-abhängigen Kopfhöhe. `useStickAusgleich` bleibt in
Kraft — sein zweiter Auslöser (Beiwerk-Blatt, `rohPanel.offen`) ist unberührt.

---

## 4a · Zwei Wächter, die ihren Messpunkt verloren haben — und was daraus wurde

**`e2e/leser-spy-w25d.e2e.ts`** (der Scroll-Spy-Wächter) las sein «Ist» aus
`nav .num`, also aus der Kopf-Ortsangabe. Der Spy selbst ist unverändert; nur
sein Abnehmer ist ein anderer. Gemessen wird ab jetzt das **Reiter-Signal**
(Token gegen Token statt Token gegen Anzeige-Label — schärfer, weil
Schlusstitel-Token wie `disp_u1_art_3` als Label gar nicht rückrechenbar waren,
M13). Drei der vier Fälle sind danach grün.

**Der vierte Fall ist rot — und war es vorher auch.** §0 Nr. 3, Nullprobe
gefahren: `src/` und die Spec auf den Ausgangsstand `0fda3ea9c` zurückgesetzt,
neu gebaut, derselbe Fall gelaufen — **bitgleich dieselbe Abweichung**:

```
mein Stand : y=20744: Signal meldet «40_a», an der Bezugslinie (198px) liegt «40_b» (Oberkante -10px)
Basis      : y=20744: Kopf zeigt  «40a»,  an der Bezugslinie (198px) liegt «40_b» (Oberkante -10px)
```

3/3 Läufe reproduzierbar. Es ist ein **Defekt auf dem Integrationszweig**
(H6-a, 400 % Zoom 320×200, OR): der Spy und die Soll-Rechnung der Sonde gehen an
genau einer Position um 10 px auseinander. Nicht meiner, nicht in meiner
Whitelist — **offen, für den Orchestrator**. Zugleich ist die Bit-Gleichheit der
Beleg, dass meine Umstellung des Messpunkts verhaltensneutral ist.

**`e2e/leser-v3-fokusring-suchfeld.e2e.ts`** verlangte als Vorbedingung, dass das
Feld «in einem clippenden Scroller» liegt — der Ort des David-Befunds vom
17.8.2026. Genau dieser Ort existiert für das Feld nicht mehr. Die Vorbedingung
ist ersetzt durch die **Ursache statt der Wirkung an einer Stelle**: der Ring
wird innerhalb der Border-Box gezeichnet (`outline-offset <= -outline-width`,
gemessen an den Computed-Werten). Das ist prüfbar, gilt in jedem Behälter, und
fällt bei derselben Rot-Probe, die im Datei-Kopf schon steht
(`outline-offset: 0`). Die Kanten-Messung gegen einen clippenden Vorfahren
bleibt daneben stehen und greift, sobald das Feld je wieder in einen Scroller
gerät.

## 4b · Zwei CLS-Fehlschläge, die keine waren (§0 Nr. 3, Messbedingung)

Im ersten Gesamtlauf meldeten `leser-kopf-cls-s3` (D21-Tieflink, 0.0436 gegen
Schranke 0.01) und `leser-r1-r2` (A9-DoD, 0.0191 gegen 0) Layout-Shifts. Beide
liefen in einem Block von **85 Specs**, darunter die a11y-Suite im Projekt
`[schwer]`, parallel.

Nicht zugeschrieben, sondern gemessen. **Direktmessung** am gebauten Stand
(Preview 4372, Shift-Quellen protokolliert): späte Summe **0.0000**.
**Gegenprobe unter gleicher Bedingung**: dieselben drei Specs (plus Fokusring),
`--workers=2`, erst auf dem Ausgangsstand `0fda3ea9c`, dann auf meinem —
**19/19 grün in beiden Fällen**.

Die Zahlen sind also eine Aussage über die Maschinenlast, nicht über die
Änderung. Festgehalten, weil eine Rate ohne Messbedingung keine Zahl ist: **CLS
misst man nicht neben einer parallel laufenden a11y-Suite.**

## 5 · Nichts verloren — geprüfte Liste

Sprung (Artikel + Fundstelle) · Fussnoten · Fassungen · Bezüge-Zeile ·
Ansicht-Menü · Gliederungsbaum samt «alles auf/zu» und «↑ Anfang» ·
Reload-Stelle (`lexmetrik-leseposition`, `inhalt-weiterlesen.tsx` unberührt) ·
Weiterlesen-Chip · Trefferliste und ihre Facetten · Bottom-Sheet @390 ·
Split-View je Pane. Golden **byte-gleich** (256 Fälle, `golden:vergleich`).

## 6 · Screens (Preview 4372, gebauter Stand)

`r6d-leser-1440-hell` · `r6d-leser-1440-dunkel` ·
`r6d-leser-1440-gliederung-zu` · `r6d-leser-1440-seitenleiste-auf` ·
`r6d-leser-1440-suche-aktiv` · `r6d-leser-1440-suche-gliederung-zu` ·
`r6d-leser-390-hell` · `r6d-leser-390-dunkel` · `r6d-leser-390-suche-aktiv` ·
`r6d-leser-split-1600` · `r6d-leser-druck`.

## 6a · Tor-Ergebnisse (Schlusslauf 6.9.2026)

| Tor | Ergebnis |
|---|---|
| `npm run lint` | 0 Fehler (1 vorbestehende Warnung in `useUniversalSuche.ts`) |
| `npx tsc -b` | grün |
| `npm run test` | **450/450 Dateien · 7359 Tests grün**, 2 skipped |
| `npm run check:design-tokens` | grün |
| `npm run check:golden-normtext` | 60257 Knoten vollständig, 0 Waisen |
| `npm run golden:vergleich` | **IDENTISCH — 256 Fälle byte-gleich** |
| `npm run check:e2e-shards` | 124 Specs, Union deckungsgleich, Datei aktuell |
| `npm run build` | grün (1224 Module) |
| Playwright, 15 Specs, `--workers=2` | **139 passed · 1 failed** — der eine ist der Altbefund H6-a (§4a) |

**Zwei rote Tore, die nicht von hier kommen und nicht in meiner Whitelist
liegen — gemeldet, nicht angefasst:**
- `leser-spy-w25d` H6-a (400 % Zoom): Nullprobe-belegt bitgleich auf dem
  Ausgangsstand rot (§4a).
- `npm run check:steuerdeckel`: `ROADMAP.md` 107.4 KB > 100 KB Budget. Die Datei
  ist gegenüber dem Ausgangsstand **byte-gleich** (110001 Bytes, `git show`) —
  der Deckel war schon vorher gerissen. `ROADMAP.md` ist für diesen Auftrag TABU.

**Umgebungs-Nachtrag:** der geteilte `node_modules`-Baum kannte
`@fontsource-variable/archivo` und `…/literata` nicht (mit R6c ins
`package.json` gekommen, in `main` nicht vorhanden) — der Build brach ab. Die
zwei Pakete sind rein additiv nachgelegt, ohne den geteilten Baum umzubauen
(isoliert installiert, Ordner kopiert). Jede weitere W2·24-Fläche hätte
denselben Abbruch gehabt.

## 7 · Deklarierte Test-Änderungen (§6.3)

| Datei | Was und warum |
|---|---|
| `src/tests/leser-v3-bauteile.test.tsx` | drei Krumen-Stufen-Fälle gestrichen (die Mechanik existiert nicht mehr, §6.7/§17), dafür neuer Fall «keine Brotkrume, keine Lesestellung» über alle drei Stufen; Leisten-Reihenfolge ohne Feld + Negativ-Zusage |
| `src/tests/leser-v3-kuerzel.test.ts` | Quellensonde auf `const suchZoneKlebt = hatLeiste;` — strenger als zuvor |
| `e2e/leser-v3-ortsangabe.e2e.ts` | von der Kopf-Ortsangabe auf das Reiter-Signal umgestellt, dritte Zusage «es wechselt» neu |
| `e2e/leser-v3-kopf.e2e.ts` | Ortsleisten-Selektor um `[data-v3-kopf-ort]` ergänzt; Rücksprung-Zusagen auf Hauptnavigation + Umschalter; Inventar um die Erlass-Suche ergänzt |
| `e2e/leser-v3-kopfzeile.e2e.ts` | (b)(b2)(d)(f)(h) auf den krumenlosen Kopf; `EIGEN_D` +44 px; (e) Vorbedingung umgedreht |
| `e2e/leser-v3-seitenleiste-ordnung.e2e.ts` | (a) Ordnung ohne Feld + «die Gliederung trägt kein Feld» |
| `e2e/leser-v3-suchfeld-ueberall.e2e.ts` | (c) Lage-Aussage umgedreht: Feld vorher UND nachher im Kopf-Block |
| `e2e/leser-klapp-sonde.e2e.ts` | **neu** (D28-Regel) |
| `e2e/leser-spy-w25d.e2e.ts` | Messpunkt Kopfzeile → Reiter-Signal (Token gegen Token, schärfer); Nullprobe-belegt verhaltensneutral |
| `e2e/leser-v3-fokusring-suchfeld.e2e.ts` | Vorbedingung «clippender Scroller» → «Ring liegt in der Border-Box» (Ursache statt Wirkung) |
| `e2e/shard-gruppen.json` | generiert (`npm run gen:e2e-shards`) |

## 8 · Offen für David

**Der Rücksprung «Gesetze» kostet jetzt einen Klick mehr** (§4). D27 verweist ihn
auf Seitenleiste und Reiter; die Seitenleiste startet auf Leser-Seiten aber
eingeklappt. Wenn das zu teuer ist, ist die günstigste Rückholung ein
«Gesetze»-Reiter in der Arbeitsleiste (D7 sieht ihn ohnehin vor) — nicht die
Rückkehr der Krume, die den Widerspruch zum Reiter erst erzeugt hat.
