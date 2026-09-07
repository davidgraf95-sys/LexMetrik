# L6 · Der Pane-Kopf nennt die Kurzform

**Auftrag:** Entscheid David 7.9.2026 («alles wie empfohlen») zum Befund L6 des
Ästhetik-Reviews vom 17.8.2026. **Zweig:** `feat/w2-24-l6-panekopf`.
**Gemessen:** Preview 4423 aus eigenem `dist/`, Chromium, @1440 und @1024,
hell und dunkel, 7.9.2026.

---

## 1 · Der Befund, nachgemessen — er war untertrieben

Der Befund sprach vom primären Pane. Gemessen an
`/gesetze/bund/OR?p=/gesetze/bund/ZGB` @1440 traf es **beide** Fenster:

| Leiste | `innerText` vor dem Fix |
|---|---|
| primär | `⠿ (aktuelle Adresse) ▸ ✕` |
| sekundär | `⠿ ◂ ▸ ⇱ ⧉ ✕` |

Zwei Erlasse nebeneinander, und keine der zwei Titelleisten sagt, welcher —
während der Reiterstreifen 74 px darüber «OR» und «ZGB» nennt. Der Platzhalter
«(aktuelle Adresse)» ist `sr-only`, sichtbar stand also gar nichts.

Ursache ist A-2 (17.8.2026): meldet die Inhaltsseite `kopfzeileSelbst`, gibt
die Leiste ihren **ganzen** Identitäts-Teil ab — Krume *und* Name. Die
Begründung («derselbe Ort zweimal in zwei Zentimetern») trägt für die Krume;
für den blossen Namen des Fensters trägt sie nicht.

Die Asymmetrie, die der Befund beschreibt («das sekundäre Pane nennt sein
Dokument»), tritt nur auf, wenn im zweiten Fenster **kein** V3-Leser liegt:

| Split | primär | sekundär |
|---|---|---|
| OR ∥ ZGB | — | — |
| OR ∥ `/rechner/zpo-fristen` | — | `Verfahrens- & Rechtsmittelfristen` |
| OR ∥ `HOR.2024.19` | — | `Rechtsprechung › Kanton AG › HOR.2024.19` |

## 2 · Was gebaut wurde

`layout/PaneKopf.tsx` zeigt den **Namen des Fensters**, sobald der
Identitäts-Teil abgegeben ist (`nurSteuerung`). Der Name ist ein fertiges
Element, `layout/PaneName.tsx`.

**§5 — dieselbe Quelle wie der Reiter, nicht nur dieselbe Absicht.** `PaneName`
sucht den **offenen Reiter** mit derselben Identität (`tabSchluessel`) und
schickt ihn durch **dieselbe Funktion**, die die Reiterleiste benutzt
(`lib/tabs.reiterKurzformText`). Nur der Reiter-Eintrag trägt die Lesestellung,
die der Scroll-Spy hineinlegt (D27). Ohne offenen Reiter steht der Pfad selbst
Modell — dann fehlt die Stellung, nie der Name. Keine zweite Ableitung.

**§15 — eigene Komponente statt `Shell.titelVon`.** Die Lesestellung ist
reaktiv (`aktualisiereTabArtikel` → `TABS_EVENT`). Ein `useTabs()` in der Shell
hätte dieses Ereignis an die ganze App-Hülle gehängt: Topbar, Seitenleiste,
Fusszeile und den kompletten Teilbaum jedes sekundären Panes (es bekommt bei
jedem Shell-Render neue Props und rendert seinen `RouteSwitch` nach). Das
Abonnement bleibt darum beim einen Text-Knoten, der sich ändert. Logikverlust:
keiner, die Anzeige ist dieselbe.

**§17-Gegengewicht — der Platzhalter ist ersetzt, nicht ergänzt.**
«(aktuelle Adresse)» nannte nicht das Dokument, sondern die Rolle — und die
sagt dieselbe Leiste schon über den Schliess-Knopf («Hauptfenster schliessen»
gegen «‹ZGB› schliessen»). Zwei verschieden formulierte Fassungen derselben
Auskunft in einer Leiste sind der Fall, den D4 ausschliesst; die schwächere
fällt. Leer wird dabei nichts: `reiterKurzformText` ist nie leer (ohne Manifest
«Gesetz öffnen»).

**§7-Abweichung, offengelegt:** der Auftrag nennt nur das **primäre** Pane.
Gemessen war auch das sekundäre namenlos, sobald ein Leser darin liegt; ein Fix
nur links hätte eine neue Asymmetrie erzeugt. Beide Rollen laufen ohnehin durch
dieselbe Leiste — die Änderung gilt für beide.

**Nebenkorrektur:** `titelVon(pathname)` → `titelVon(pathname + search)` am
primären Fundort. Ohne den Diskriminator `?r=2` fände die Reiter-Suche bei zwei
offenen Instanzen desselben Erlasses die erste und zeigte deren Lesestellung.
`label` und `stand` sind unberührt (beide Ableitungen schneiden die Query
ohnehin ab).

## 3 · Nach dem Fix, gemessen

| Lage | primär | sekundär |
|---|---|---|
| OR ∥ ZGB, kalt | `⠿ OR ▸ ✕` | `⠿ ZGB ◂ ▸ ⇱ ⧉ ✕` |
| dieselbe, gescrollt | `⠿ Art. 9 OR ▸ ✕` | `⠿ ZGB ◂ ▸ ⇱ ⧉ ✕` |
| OR ∥ Rechner | `⠿ OR ▸ ✕` | unverändert `Verfahrens- & Rechtsmittelfristen` |

Wortgleich mit dem Reiter desselben Fensters, Lesestellung inbegriffen.
Schriftgrad/Ton wie die Blatt-Krume der `OrtsAngabe` (`text-xs · font-medium ·
ink-800`), `truncate` + `title` (R8, kein stiller Anschnitt).
Screens: `l6-split-hell-1440.jpg`, `l6-split-dunkel-1440.jpg` (Titelblatt +
Reiterstreifen + beide Titelleisten, DPR 2).

## 4 · Wächter und Rot-Probe (§6.7)

`e2e/w224-l6-panekopf.e2e.ts`, vier Fälle: @1440 «jedes Fenster nennt sein
Dokument, genau einmal» · @1440 «der Name ist der Reiter-Text, Lesestellung
inbegriffen» · @1024 «der Name hält auch in der schmalen Spalte» ·
«Rechner/Entscheid daneben: die Leiste mit Ortsangabe bleibt unberührt».

* **Mutation 1** (`{!zeigeIdentitaet && kurzform}` entfernt = Stand vor L6):
  **4 failed · 0 passed**, alle mit «element(s) not found» auf
  `[data-pane-rolle="primaer"] [data-pane-name]`.
* **Mutation 2** (`{kurzform}` unbedingt = Name *neben* der Ortsangabe):
  **3 failed · 1 passed** — «primaer: Name UND Brotkrume in einer Leiste»,
  «zweiter Name neben der Ortsangabe» (erhalten `ZPO-Fristen`), und die
  Lesestellung erreicht den Kopf nicht mehr.

Beides zurückgenommen; danach 4 passed. `e2e/w224-ga-kopf.e2e.ts` bleibt grün
(es misst die Kopfzone der Einzelansicht, nicht die Fenster-Titelleiste).

**§6.3-Deklaration:** `e2e/leser-v3-kopfzeile.e2e.ts` (d) prüfte «die
Pane-Titelleiste nennt gar nichts mehr». Der Fall ist auf L6 nachgezogen: Krume,
Sektion, Stand und «›» bleiben verboten, der Name muss stehen und **genau
einmal** vorkommen. `src/tests/ortsAngabe.test.tsx` zieht die Zeichenkette des
§7-Wächters auf `titelVon(pathname + search)` nach; die Kette (a)–(d) bleibt.

## 5 · Offener Restbefund — nicht gebaut, weil ausserhalb der Whitelist

**«OR» steht jetzt dreimal untereinander.** Gemessen @1440,
`/gesetze/bund/OR?p=/gesetze/bund/ZGB`, `top` in CSS-px:

| y | Ort | Text |
|---:|---|---|
| 64 | Reiter | `OR` |
| 138 | Pane-Titelleiste (neu) | `OR` |
| 180 | Leser-Kennung `[data-v3-kopf-kuerzel]` | `OR` |
| 303 | H1 | `Bundesgesetz betreffend die Ergänzung des ZGB (OR)` |

Zwischen Titelleiste und Leser-Kennung liegen **42 px**. Vor L6 waren es zwei
Nennungen (Reiter + Leser-Kennung), jetzt drei. D4 ist im **Pane-Kopf**
eingehalten (dort steht die Angabe genau einmal, bewacht); die Dopplung liegt
zwischen zwei verschiedenen Leisten.

**Die eine richtige Änderung liegt im Leser, nicht hier** (`TABU` dieses
Auftrags): die konsequente Fortschreibung von A-2 wäre, dass der V3-Leser sein
Erlass-Kürzel **im Pane** abgibt — dort nennt das Fenster es schon, genau wie
der Leser die Krume abgibt, weil die Leiste sie sonst doppelt trüge. In der
Einzelansicht bliebe die Kennung unverändert stehen (dort gibt es keine
Fenster-Titelleiste).

Betroffen sind heute `e2e/leser-v3-kopfzeile.e2e.ts` (d) («`kuerzel` sichtbar
in beiden Panes») und Ä1 (d) («das Erlass-Kürzel im Kopf ist nie
angeschnitten») — beide müssten in demselben deklarierten Schritt nachgezogen
werden. **Wartet auf den Orchestrator bzw. David.**

## 6 · Tore

| Tor | Ergebnis |
|---|---|
| `npm run test` | 460 Dateien, 7454 passed / 2 skipped, Exit 0 |
| `npx tsc -b` | keine Ausgabe, Exit 0 |
| `npm run lint` | 0 errors, 1 Bestands-Warnung (`useUniversalSuche.ts`, unberührt) |
| `npm run check:schlankheit` | GRÜN, 1487 Dateien, keine Neuzugänge über der Schwelle |
| `npm run check:e2e-shards` | GRÜN, 139 Specs, Union deckungsgleich |
| `npm run golden:vergleich` | IDENTISCH — 256 Fälle byte-gleich |
| `npm run check:perf-budget` | GRÜN, entry gzip 53.8 KB (Budget 60.0) |
| `npm run check:zyklen` · `check:gegenpruefung` | ok · grün (kein Risikopfad) |
| Playwright, 7 Dateien Pane/Split/Kopf, `--repeat-each=2 --workers=2` | **106 passed** (7.9 min) |
