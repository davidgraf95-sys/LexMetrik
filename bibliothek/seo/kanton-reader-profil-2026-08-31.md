# Kanton-Reader-Profil (K-11) — Zeit bis zum ersten Artikel

> **Messung, keine Massnahme.** Auftrag W2·13-KANTONE/K-11 lautete ausdrücklich
> «erst messen, nichts fixen vor dem Profil» (§15: Treue vor Tempo). Dieses
> Dossier hält den Messaufbau, die Rohzahlen und eine **Kandidatenliste mit
> Logikverlust-Vorbewertung** fest. Nichts davon ist ein beschlossener Fix.

- **Erstellt:** 31.8.2026, Auftrag W2·13-KANTONE Paket E (K-11), Worktree
  `lexmetrik-kantone`, Branch `feat/w213-kantone`, Stand `0921112c2`.
- **Status:** ERSTRECHERCHE (Mess-Dossier; jede Zahl unten ist auf dieser einen
  Maschine erhoben — belastbar sind die **Verhältnisse** und die A/B-Differenzen,
  nicht die Absolutwerte).
- **Abnahme-Status:** keine fachliche Abnahme nötig und keine erteilt — es sind
  Messwerte, keine Rechtsinhalte. Die *Fix-Auswahl* aus der Kandidatenliste
  wartet auf einen eigenen Bauschritt.
- **Pflegebedarf:** Die Zahlen altern mit jedem Bundle- und Datenzuwachs. Sie
  werden **nicht nachgeführt, sondern ergänzt** (§0/2b). Der laufende Wächter
  ist seit diesem Schritt `check:perf-lighthouse` (Route `kantonleser`).

## Messaufbau (reproduzierbar)

- `npm run build` → `npx vite preview --port 4331 --strictPort` gegen `dist/`.
- Harness: Playwright-Chromium (`@playwright/test`, Build `chromium-1223`),
  Viewport 1440×900, **frischer Browser-Kontext und `Network.setCacheDisabled`
  je Lauf** (jeder Lauf kalt), CPU-Drossel über CDP
  `Emulation.setCPUThrottlingRate`, Netzdrossel über
  `Network.emulateNetworkConditions` (langsames 4G = 1.6 Mbit/s ↓, 150 ms RTT;
  langsames 3G = 400 kbit/s ↓, 400 ms RTT).
- **Messgrösse «Marker»** = `performance.now()`, wenn das erste
  `article[id^="art-"]` im DOM steht. Dieser Selektor trifft **nur** den vom
  React-Leser gerenderten Artikel: der Prerender-Rumpf liefert `<article>` ohne
  `id` (geprüft: `grep -c 'id="art-'` auf `dist/gesetze/kanton/*.html` = 0). Die
  Messgrösse ist also «erster Artikel des *interaktiven* Lesers», nicht «erster
  Text auf dem Schirm» — Letzterer steht durch den Prerender ab FCP (0.85–1.0 s
  unter 4×/4G).
- **Netz-Mitschnitt über CDP**, nicht über `PerformanceResourceTiming`. Das ist
  entscheidend: Resource-Timing legt den Eintrag erst **bei Abschluss** an. Die
  erste Auswertung dieses Profils hat deshalb einen 753-KB-Download, der beim
  Marker noch lief, schlicht nicht gesehen — und wäre zum falschen Befund
  gekommen. (Lehre für die nächste Messung: bei Bandbreiten-Fragen immer CDP.)

## Rohzahlen

### Reihe 1 — ungedrosselt (1× CPU, kein Netzlimit), n=3

| Route | Artikel | Marker Median | Einzelläufe (ms) | Long-Task-Summe (ms) |
|---|--:|--:|---|---|
| `/gesetze/kanton/BS-154.100` (GOG BS) | 100 | **437** | 441 · 437 · 430 | 64 · 64 · 64 |
| `/gesetze/kanton/SO-614.11` (StG SO) | 347 | **511** | 511 · 521 · 506 | 110 · 106 · 105 |
| `/gesetze/kanton/SG-3849` | 607 | **509** | 517 · 503 · 509 | 109 · 105 · 106 |
| `/gesetze/bund/OR` (Vergleich) | 1686 | **787** | 787 · 774 · 796 | 363 · 350 · 353 |

### Reihe 2 — 4× CPU + langsames 4G (Lighthouse-Mobil-Profil), n=3

| Route | Marker Median | Einzelläufe (ms) |
|---|--:|---|
| `/gesetze/kanton/BS-154.100` | **4595** | 4586 · 4595 · 4615 |
| `/gesetze/kanton/SO-614.11` | **5791** | 5805 · 5743 · 5791 |
| `/gesetze/bund/OR` | **9769** | 9769 · 9806 · 9769 |

### Reihe 3 — 6× CPU + langsames 3G, n=3

| Route | Marker Median | Einzelläufe (ms) |
|---|--:|---|
| `/gesetze/kanton/BS-154.100` | **17 360** | 17 519 · 17 360 · 17 339 |
| `/gesetze/kanton/SO-614.11` | **21 561** | 21 561 · 21 563 · 21 556 |
| `/gesetze/bund/OR` | **36 979** | 37 001 · 36 979 · 36 211 |

### Wasserfall `/gesetze/kanton/BS-154.100`, 4× CPU + langsames 4G (CDP)

Marker 4746 ms. Gekürzt auf die Kette, die den Takt vorgibt:

| von → bis (ms) | KB | Ressource |
|---|--:|---|
| 0 → 258 | 20 | `/gesetze/kanton/BS-154.100` (Prerender-HTML) |
| 176 → **1530** | ~200 | 18 Eager-Chunks (`index`, `vendor-react`, `startseiteConfig`, `register-*`, `browse-*` …) |
| 1668 → **2209** | 45 | Route-Welle (`GesetzLeser`, `NormText`, `KontextPanel`, `werkzeuge`) |
| 1767 → **3936** | 131 | `/normtext/register.json` |
| 1828 → **läuft beim Marker noch** | (753) | `/rechtsprechung/register.json` |
| 2216 → **3025** | 35 | `LeserRahmenV3` |
| 3040 → 3649 | 28 | `/normtext/kanton-systematik.json` |
| **3952 → 4499** | 26 | `/normtext/kanton/BS-154.100.json` ← **der Snapshot** |
| — | | Marker **4746** |

**Die zentrale Zahl: der Snapshot wird erst nach 3952 ms von 4746 ms angefordert
— 83 % der Wartezeit vergehen, bevor die eigentliche Nutzlast überhaupt bestellt
ist.** Der Snapshot selbst kostet 547 ms, das Rendern danach 247 ms.

### Reihe 4 — Gegenprobe: `/rechtsprechung/register.json` abgewürgt

Reine Messung (`page.route(...).abort()`), kein Codeeingriff.

| Bedingung | Route | mit (ms) | ohne (ms) | Differenz |
|---|---|--:|--:|--:|
| 4× CPU + langsames 4G, n=3 | BS-154.100 | 4623 | 3876 | **−747 (−16.2 %)** |
| 4× CPU + langsames 4G, n=3 | SO-614.11 | 5814 | 4724 | **−1090 (−18.8 %)** |
| 20× CPU, kein Netzlimit, n=5 | BS-154.100 | 3603 | 3053 | **−550 (−15.3 %)** |

### Reihe 5 — Streuung (Intermittenz-Frage), 20× CPU, n=12, BS-154.100

3714 · 3479 · 3708 · 3653 · 3761 · 3610 · 3599 · 3460 · 3651 · 3746 · 3701 ·
3662 ms → Median 3657, Spanne 3460–3761 (**8.7 %**). Keine schwere Flanke.

## Befunde

### B1 — Das 50-s-Symptom ist NICHT reproduziert

Der Fahrplan (`archiv/fahrplaene/FAHRPLAN-KANTONE.md` §K-11) nennt
«intermittierend 50 s bis zum ersten Artikel (reproduziert)» — **ohne
Messbedingung**. Eine Zahl ohne Bedingung ist keine Zahl (§0/3c); der Satz wird
hier nicht bestritten, aber er ist mit dem hier festgehaltenen Aufbau nicht
nachvollziehbar.

- Höchstwert auf einer **Kanton**-Route: **21.6 s** (SO-614.11, 6× CPU +
  langsames 3G). Erst `/gesetze/bund/OR` erreicht unter denselben Bedingungen
  37.0 s — also die Grössenordnung, aber auf der Bund-Route.
- **Intermittenz: nicht reproduziert.** n=12 bei 20× CPU streut über 8.7 %. Ein
  einzelner Ausreisser (6829 ms gegen 4460 ms Basis, +53 %) trat in einer
  n=3-Reihe auf, **während parallel ein `vite dev`-Server lief**; nach dessen
  Stopp wiederholte er sich in n=5 und n=12 nicht. Das ist ein Hinweis auf
  Fremdlast als Ursache, kein Beweis.
- Der Dev-Server ist als Erklärung **geprüft und verworfen**: `rm -rf
  node_modules/.vite && npx vite --port 5199`, danach n=4 kalt → 548–564 ms.

Ehrlich bleibt damit: **die Ursache des 50-s-Berichts ist offen.** Wer sie
weiterverfolgt, braucht zuerst die Bedingung (Gerät, Netz, Prod oder lokal,
warm oder kalt) — nicht die nächste Hypothese.

### B2 — Die Auftrags-Prämisse trifft nicht zu

Der Auftrag vermutet den Blocker «zwischen Snapshot-Fetch (~200 ms) und erstem
Artikel-Render». Gemessen: der Snapshot-Fetch liegt bei ~200 ms **nur
ungedrosselt** (401 → 408 ms bei Marker 471 ms). Unter Last verschiebt er sich
auf 3952 ms, und die Strecke **danach** ist der kleinste Posten (247 ms von
4746 ms = 5 %). Der Engpass sitzt **davor**, im Netz, nicht im Render.

### B3 — Die «Marginalien-/Sektions-Effekt-Kaskade» ist als Haupt-Term widerlegt

Die Zeit zwischen Snapshot-Ende und erstem Artikel skaliert **linear** mit der
Artikelzahl:

| Route | Artikel | Strecke Snapshot-Ende → Marker | je Artikel | Beleg |
|---|--:|--:|--:|---|
| BS-154.100 @4× | 100 | 247 ms (4499 → 4746) | 2.5 ms | CDP-Wasserfall oben |
| SO-614.11 @4× | 347 | ~390 ms | ~1.1 ms | grösster Long-Task 387 ms bei 5357 ms, Marker 5791 ms |
| OR @6× | 1686 | 2547 ms (34 432 → 36 979) | 1.5 ms | Long-Task 2431 ms bei 34 553 ms |

Eine Marginalien-/Sektions-Effekt-**Kaskade** würde überlinear kosten; gemessen
ist der Aufwand je Artikel über einen Faktor 17 in der Artikelzahl konstant
(1.1–2.5 ms, der höchste Wert beim *kleinsten* Erlass — dort trägt der feste
Rahmen-Anteil am meisten). Der artikelreichste kantonale Erlass hat 607
Artikel (`SG-3849`, gemessen über `eintraege.length` aller 1232
Kanton-Snapshots); auf dieser Achse ist der Kanton-Leser strukturell billiger
als der Bund-Leser, nicht teurer.

### B4 — React-Compiler-Falle: geprüft, kein Beleg

Der React-Compiler ist tatsächlich aus (`vite.config.ts:68` —
`plugins: [serifFontDisplayOptional(), react(), buildKennungMeta()]`, kein
`babel-plugin-react-compiler`). Der heisse Pfad ist aber **von Hand**
memoisiert: `ArtikelLeser` ist `memo(...)`
(`src/pages/gesetz-leser/parts/ArtikelLeser.tsx:107`), `LeitfallZeile` ebenso
(Z. 50), `inhalt-ableitungen.tsx` trägt 10 `useMemo`/`useCallback`. Zusammen mit
der Linearität aus B3 gibt es **keinen Beleg**, dass fehlende Memoisierung hier
der Blocker ist. (Das ist kein Freispruch für andere Reader-Interaktionen —
nur für die Strecke bis zum ersten Artikel.)

## Kandidaten für einen späteren Fix-Schritt (mit Logikverlust-Vorbewertung)

Reihenfolge = gemessener Anteil, nicht Umsetzungs-Reihenfolge. **Keiner davon
ist beschlossen.**

### K1 — `/rechtsprechung/register.json` lädt auf jeder Gesetzes-Leserseite

**Beleg.** `src/components/layout/Shell.tsx:218–229` lädt für jeden Inhaltspfad
(`istInhaltsPfad`) per `Promise.all` **beide** Manifeste — auch das der
Rechtsprechung, allein für das Blattlabel der Brotkrume. Grösse: 9 453 724 B
roh (9.0 MB) / **771 068 B gzip (753 KB)**, gemessen mit
`curl -H 'Accept-Encoding: gzip'` gegen `vite preview`. Beim ersten Artikel
läuft der Download noch (CDP: Start
1828 ms, Marker 4746 ms). Gegenprobe: −16 bis −19 % Zeit bis zum ersten
Artikel (Reihe 4).

**Nicht neu, aber erstmals beziffert.** `scripts/check-perf-budget.ts:81–84`
hält seit dem Gegenprüfungs-Befund vom 20.7.2026 fest, dass «die Shell es für
jeden Inhaltspfad (Breadcrumb-Label) zieht, also faktisch auf jeder
Gesetzes-Leserseite». Das Budget dafür steht bei 780 KB und ist mit 753 KB zu
**96.5 %** ausgeschöpft; Z. 143–147 benennt die Verschlankung (eigene Projektion
nach dem Vorbild von `richter.json`) bereits als Folgearbeit.

**Logikverlust-Vorbewertung.**
- Variante *«Lader auf Rechtsprechungs-Pfade beschränken»*: **echter
  Informationsverlust** — im Gesetzes-Brotkrumen fiele das Blattlabel eines
  sekundären Entscheid-Panes weg (§8: Nutzer sähe weniger, nicht Falsches).
- Variante *«schlanke Titel-Projektion»* (key → Kürzel/Titel/Stand,
  generator-erzeugt aus derselben Quelle, wie `richter.json` es vormacht):
  **kein Logikverlust**; §5 ist gewahrt, solange die Projektion aus dem
  DB-Artefakt erzeugt und nicht von Hand gepflegt wird. Braucht ein
  Drift-Tor Projektion ↔ Register.
- Rechtsregel-, Frist- oder Quotenlogik ist in **keiner** Variante berührt.

### K2 — Serielle Kette Register → Snapshot

**Beleg.** `src/lib/normtext/browse.ts:75–78` — `ladeErlass(key)` wartet auf
`ladeBrowseManifest()` (131 KB) und liefert erst daraus `e.datei`;
`src/pages/gesetz-leser/inhalt-hooks.tsx:94/121` ruft `ladeErlassDatei(e.datei)`
folglich **nach** dem Register. Im Wasserfall: Register endet 3936 ms, der
Snapshot startet 3952 ms — 16 ms Abstand, also eine harte Abhängigkeit, keine
Bandbreiten-Koinzidenz. Anteil: der Snapshot könnte rund 2 s früher starten.

**Logikverlust-Vorbewertung.**
- Variante *«Dateipfad im Client aus (Ebene, Key) ableiten»*: schafft eine
  **zweite Wahrheit über den Dateinamen** (§5) und kollidiert mit der
  Ebenen-Übersetzung, die `inhalt-hooks.tsx:83–88` ausdrücklich als
  Fehlerquelle dokumentiert (Befund 45: `/gesetze/international/CISG` lädt
  `bund/CISG.json`). Nur mit Tor Ableitung ↔ Register vertretbar.
- Variante *«`<link rel="preload">` des Snapshots in den Prerender-Kopf»*: der
  Prerender kennt den Pfad bereits zur Bauzeit, der Client behält das Register
  als einzige Wahrheit. **Kein Logikverlust**, keine zweite Wahrheit — der
  sauberere Kandidat.
- Rechtsinhalte sind in beiden Varianten unberührt; ein falsch abgeleiteter Pfad
  würde als 404 sichtbar, nicht als stiller Falschinhalt (`ladeErlassDatei`
  cacht 404 als `null`, der Leser zeigt die Fehlseite).

### K3 — Drei-Wellen-Chunk-Kaskade vor dem ersten Datenzugriff

**Beleg.** Wasserfall oben: Eager-Welle 176 → 1530 ms (18 Chunks, ~200 KB),
Route-Welle 1668 → 2209 ms, `LeserRahmenV3` 2216 → 3025 ms. Erst danach laufen
die Normtext-Fetches (ausser dem Register) an. Die Wellen sind seriell, weil
jede den Import-Baum der vorigen braucht. In der Eager-Welle stehen Chunks, die
der Leser nicht braucht (`katalogSuche`, drei `browse-*`, `kantone`, `fedlex`).

**Logikverlust-Vorbewertung.** Reine Ladeanordnung (§3, Darstellungsschicht) —
**kein Logikverlust erwartbar**. Aber: jeder Chunk-Umbau berührt das
§15-Bundle-Budget und muss mit Golden-Beweis und `check:perf-budget` geführt
werden; §6.7 verlangt zusätzlich, dass das Verhältnis Bund/Kanton nach dem
Umbau erneut gemessen wird (die Wellen sind auf **jeder** Leserseite dieselben,
ein Fix wirkt also breiter als K-11 und braucht eine breitere Nachmessung).

## Wächter (im selben Schritt gebaut)

`scripts/perf/lighthouse-budget.ts` hat eine **vierte** Route bekommen:
`kantonleser` = `/gesetze/kanton/SO-614.11` — mit 281 KB Prerender-HTML die
schwerste kantonale Leserseite (347 Artikel). «Schwerste» heisst **nach
HTML-Masse**, und das ist für CLS/LCP die bindende Grösse; nach Artikelzahl
führt `SG-3849` mit 607 bei nur 214 KB HTML (§8 — die Einschränkung steht auch
im Code). Assertiert wird — wie bei `/gesetze` seit
29.8.2026 — **nur CLS ≤ 0.05**; LCP/TBT/TTI/Score werden gemessen und gedruckt,
aber als «unkalibriert» geführt, weil für sie der CI-Runner die bindende Grösse
ist und dafür keine Runner-Matrix vorliegt (§8). Bestehende Routen und Budgets
sind unverändert.

Lokal gemessen 31.8.2026 (`PERF_RUNS=3 npm run check:perf-lighthouse --
--messen`, Normier-Faktor 0.468): Score 68 · CLS 0.0143 · LCP 9.91 s · TBT roh
153 ms / normiert 327 ms · TTI 9.91 s. Der Deckel liegt damit 3.2–3.5× über dem
Ist — dieselbe Kopffreiheit wie bei den Nachbarrouten.

Zusätzlich eine **Existenz-Sonde**: fehlt `dist/gesetze/kanton/SO-614.11.html`,
bricht das Tor mit Exit 1, statt eine Fehlseite mit tadellosem CLS still grün zu
melden (§6.7). Der kantonale Korpus wird in `W2·13-KANTONE-DATEN` neu erzeugt —
ohne diese Sonde wäre der Wächter ein Tor, das nicht scheitern kann.

**Rot-Beweise (§6.7, beide am 31.8.2026 lokal geführt):**
1. Schwelle testweise auf `clsMax: 0.005` → `check:perf-lighthouse ROT: ✗
   /gesetze/kanton/SO-614.11 …: CLS 0.016 > 0.005`, Exit 1; die drei
   Bestandsrouten blieben grün.
2. `dist/gesetze/kanton/SO-614.11.html` weggeschoben → `check:perf-lighthouse —
   Messobjekt fehlt: …`, Exit 1, vor dem ersten Lighthouse-Lauf.

## Verwandtes

- [CWV-Baseline (W1.11)](cwv-baseline.md) — misst LCP/Transfer der prerenderten
  Detailseiten; dieses Dossier misst die **andere** Grösse (erster Artikel des
  interaktiven Lesers) und erklärt damit, warum eine gute LCP und ein zäher
  Leser koexistieren können.
- `scripts/check-perf-budget.ts` — Nutzlast-Schranken; `register.json` dort bei
  96.5 % Budgetausschöpfung.
