# Fahrplan Kantonale Tarif-Tabellen — Stufe 2 (22.6.2026)

> **Update 29.6.2026 — BUND-Tabellen separat erfasst:** Ein eigenständiges, vollständiges
> **Tabellen-Regelwerk (T-A…T-F) + seitenweiter Bund-Umsetzungsplan** liegt in
> `FAHRPLAN-GESETZESDARSTELLUNG-BUND.md` (Anhang 1+2, Milestone M10). Es betrifft den **Fedlex**-
> Extraktor (`extrahiere-fedlex.ts`, 28 Bund-Erlasse mit `mehrspaltig`) und ist von DIESEM
> Kanton-Fahrplan getrennt; Schema (`spalten`-Modell) + Renderer + Validator `check:tabellen`
> werden aber **geteilt** → der Renderer muss kanton-abwärtskompatibel bleiben. Kern-Befund:
> bei `<th>`-Tabellen trägt teils **nur der Kopf** colspan (GebV SchKG Art. 20) → der frühere
> Audit-Schluss «`<th>`-colspan widerlegt» ist an Art. 20 **falsifiziert**. Kanton-Nachzug aufs
> kanonische Modell = Folge-Arbeitspaket nach Bund-Abnahme.

**Kontext:** Stufe 1 (Füllpunkt-Zweispalter «Beschreibung . . . . Betrag» → `tabelle`) ist
für SG auf Prod (s. STRUKTUR-Karte 22.6.). Mechanik: §7-Generator-Extrakt
(`scripts/normtext/tarif-tabelle.ts` + `reichereTabellen` in `adapter-pdf.ts`), Render
`ArtikelBody.tsx` `TarifTabelle`. Stufe 2 = die übrigen Tabellen-/Zahl-Defektklassen,
**kanton-für-kanton** (Auftrag David). Grundsatz unverändert: §1 konservativ — im Zweifel
Block als Text belassen; nie Inhalt erfinden/verändern; §3 Render trennt von Logik;
§7 nur via Generator.

## Anforderungen David (22.6.)
1. **Mehrspaltige Staffeln** (Streitwert | Grundgebühr | Zuschlag) mit verschmolzenen
   Zahl-Spalten korrekt trennen — Befund `100001250` (= `10'000` | `1'250`).
2. **Tausendertrenner `'`** in der Anzeige (`10000`→`10'000`). §1: nur Gruppierung der
   Ziffern, kein Wert geändert; zentral im Render (deckt auch SG-Tabellen).
3. Jeden Kanton **einzeln** prüfen + beheben + verifizieren.
4. Engine→Norm-Verweise müssen weiter korrekt auflösen (gilt fort).

## Defektklassen + Worklist (aus Bug-Check alle Kantone 22.6.)
- **A · `·`/`—`-Zellentrenner-Tabellen** (Quelle hat explizite Zell-Marker → am tract­ab­elsten):
  - NW-265.51 (120+ Zeilen Tarif — höchster Zeilen-Ertrag, sauberster Parser-Einstieg)
  - BS-154.810 + BS-291.400 (Gerichtsgebühren; Beträge schon mit `'`)
  - SO-614.11 (Steuer-Tarifstufen — echte Mehrspalten)
  - VS-173.8-de/-fr (zweisprachiges Paar)
- **B · Mehrspalten-Staffel mit verklebten Zahlen** (schwierigste Klasse, Spaltenrekonstruktion):
  - ZH-215.3 §4, ZH-211.11 (`100001250`, `5000250`), ZG-163.4 §3, TG-176.31 §5
  - Muster: `über X bis Y<Gebühr> zuzügl. Z% …` — Y und Gebühr verklebt.
- **C · Restliche Füllpunkt-Blöcke** (gleicher Stufe-1-Parser, nur noch nicht regeneriert/erfasst):
  - SG 159 Blöcke (SG-3849 135, SG-2935 20, SG-2808 4) — prüfen warum nicht erfasst (evtl. Block-Grenzen) und nachziehen.
- **D · Tausendertrenner:** nur SG braucht Normalisierung in `tabelle`-Beträgen (30 Werte);
  20/26 Kantone haben `'` schon in der Quelle. Zentrale Render-Formatierung der Betrag-Spalte
  (nicht im Snapshot — §7 faithful). VD-Sonderbefund: `250'000251'000` = zwei Zeilen ohne
  Trenner verschmolzen (eigener Extraktions-Bug, separat).
- **AUSSCHLUSS (kein Tarif!):** BL-211.71, FR-635.1.1, FR-214.5.16 — die `…`-Läufe sind
  **Gesetzes-Änderungsplatzhalter** («wird wie folgt geändert: …»), NICHT Tarifzeilen.
  Niemals tableisieren.

## Reihenfolge (Vorschlag)
1. **D Tausendertrenner** (Betrag-Spalte zentral im Render) — klein, hoher sichtbarer Wert, deckt SG sofort. §1: reine Gruppierung.
2. **A `·`/`—`-Tabellen** (NW zuerst) — eigener Parser-Zweig, explizite Marker.
3. **C SG-Rest-Füllpunkt** — warum nicht erfasst, dann nachziehen.
4. **B Mehrspalten-Staffel** (ZH/ZG/TG) — Spaltenrekonstruktion, schwierigste; eigener Spec.

Jede Klasse: Spec/Plan-light → TDD → echte Daten-Validierung (Logik+Bug-Check je Schritt,
Daueranweisung David) → Regenerieren → Gate → UI-Sicht → Deploy nach Davids Ja.

*Quelle Worklist: `.superpowers/sdd/canton-bugcheck-report.md` (Scratch, 22.6.).*

## Technische Befunde Mehrspalten (22.6., Entscheid David: «echte Mehrspalten-Tabelle»)
- **ZH § 4 AnwGebV (David-Beispiel «unübersichtlich»):** Quelle = Text-PDF (notes.zh.ch, pdfjs), KEINE HTML-Tabelle. `100001250` = PDF-Spaltenverlust in der Body-Zeilen-Assemblierung. Sauberer Fix: **x-koordinatenbasierte Spaltenerkennung** (Streitwert | Grundgebühr | Zuschlag). Vorlage: `adapter-zh-pdf.ts` hat bereits `extrahiereZhAnhangSpalten` (spaltenbewusst über x) für den Anhang — § 4 läuft aber durch die normale Body-Assemblierung. NICHT Ziffern raten (§1).
- **Datenmodell:** generische Mehrspalten-Tabelle (Header + Zeilen×N Zellen) statt nur {beschreibung,betrag}. Render: echte N-Spalten, Beträge rechtsbündig + gruppiereTausender.
- **Klasse A (NW/BS/SO/VS):** ·/—-Marker → deterministischer Split in Zeilen×Felder (Label:Wert). Variable Felder (Tarif-Nr./Bezeichnung/Betrag/Gemeinde/Kanton) + Hierarchie.
- Reihenfolge offen: ZH (David-Beispiel) vs. NW (tractabelste). Beide brauchen das gemeinsame Mehrspalten-Modell+Render zuerst.

## NEUER BEFUND David (22.6.): ZH-243 NotGebV § 17 «praktisch unlesbar»
- ZH-243 = Notariatsgebührenverordnung (NotGebV, LS 243), Text-PDF (zhlex/notes.zh.ch).
- § 17 = riesige hierarchische Anhang-Tariftabelle (Blöcke bis 3740 Zeichen!), bei der PDF-Extraktion zu EINEM Fliesstext-Klumpen kollabiert: Ziffern (2.3.3, 1.2.4…), Beschreibungen, Ansätze (0,75‰, mind. 50, 100), Bänder (–…) alles verschmolzen. Auch art-1.x Anhang-Ziffern: «Beschreibung 100–1500» (Betrag angeklebt, kein Apostroph).
- = EIGENE distinkte Struktur (hierarchischer Ziffer-Tarif mit Ansatz-Spalte + Querverweis-Spalte), schwieriger als ZH-215.3 §4. Braucht eigene x-aware Mehrspalten-Extraktion (Spalten: Ziffer | Beschreibung | (Querverweis) | Ansatz/Fr.). Eigener Task/Spec.
- NICHT von aktueller Stufe 2 abgedeckt (die fixte nur ZH-215.3 §4 + LexWork-·/—-Kantone). Prod zeigt es unverändert.
- Vermutlich weitere ZH-Tarif-PDFs ähnlich betroffen (ZH-211.11 u.a.) → ZH-Tarif-Tabellen sind ein eigener, grösserer Strang.

---

## Ausführungsvermerk — Schritt 1 · Klasse A + D (5.7.2026, Opus, Worktree `feat/tarif-tabellen-stufe2-a`)

**Erkenntnis (§7 — Realität gewinnt):** Die ·/—-Zellentrenner-**Extraktion** (Klasse A)
war bereits gebaut (Commit `bb7bc26b`, `reichereMehrspaltig`). NW-265.51/BS-154.810/
BS-291.400/SO-614.11/VS-173.8-de+fr trugen schon `mehrspaltig`, aber im **Legacy-
`{kopf,zeilen}`**-Modell. Gerendert wurde das über `LegacyMehrspaltigeTabelle`
(`ArtikelBody.tsx`) mit einer Inhalts-Heuristik (`istNumerischeZelle`) **und globalem
`gruppiereTausender` auf ALLEN Zellen** — ein echter **§7-Faithfulness-Bug:**
Zitat-Jahre in Prosa-Zellen wurden verunstaltet (BS-154.810 §19/§20: «1937»→«1'937»,
«2007»→«2'007», «2010»→«2'010»).

**Gebaut = der Kanton-Nachzug aufs kanonische `spalten`-Modell** (Zeile 11 dieses
Fahrplans; ruleset-konform K1/T-A1/T-B3: Typisierung im Generator, nie im Renderer):

- **Klasse A → kanonisch:** deterministischer Typer `typisiereSpalten(kopf,zeilen)`
  in `scripts/normtext/mehrspaltige-tabelle.ts`, verdrahtet in `reichereMehrspaltig`
  (emittiert `{spalten:[{typ,titel}],zeilen}` statt `{kopf,zeilen}`). Zell-Klassen:
  Prosa/Position (hierarchische Tarif-Nr.) → `text`; Staffel-Spanne (bis/über/ab/
  von…bis/de…à/jusqu’à) → `bereich`; CHF-Betrag (Fr./CHF/.–) → `betrag`; Satz
  (%/‰/Promille/Prozent) → `zahl`; ein einzelnes **ziffernloses** Nicht-Atom-Wort
  («gebührenfrei») bleibt betrags-kompatibel (kein Zahl-Risiko) und kippt eine
  Amount-Spalte NICHT zu text.
- **Klasse D → typisiert:** die Tausender-Gruppierung (`gruppiereTausender`, existierte
  aus Bund-M10) greift in `KanonischeTabelle` nur noch in betrag/zahl/bereich (T-C5) —
  Prosa-Spalten (Jahre/§-Nummern) bleiben unberührt. **Kein Renderer-Umbau** nötig
  (der Bund-M10-Renderer war bereits kanonisch; `ArtikelBody.tsx` unverändert).

**Regeneration ohne Drift:** committeter Generator-Tool `scripts/normtext/
kanton-spalten-nachzug.ts` re-projiziert die 6 Snapshots **offline** über denselben
`typisiereSpalten` + das geteilte `sha256Bloecke` (neu extrahiert nach
`scripts/normtext/sha-bloecke.ts`, §5) und zieht die Golden-sha-Map nach — **kein
LexWork-Refetch → 0 Fremd-Drift** (honoriert «je Erlass einzeln, nie Voll-Lauf»).

**Tabellen-/Zeilen-Statistik (32 Blöcke / 30 Einträge / 6 Dateien):**
- NW-265.51: 11 Tabellen (Klasse `text/betrag/bereich` + 5-Spalter a1-1 Gemeinde/
  Kanton=betrag; Betrag-Catch-all=text wegen «gebührenfrei»/per-Seite-Prosa).
- BS-154.810: 6 Tabellen (Streitwert=bereich, Verfahren/Gegenstand=**text** →
  Jahr-Bugfix; gemischte Gebühr-Spalten mit Regel-Prosa «mind./aber/½ %»=text).
- BS-291.400: 3 (Streitwert=bereich, Grundhonorar=bereich, «des Streitwerts»-Rest=text).
- SO-614.11: 7 (Sätze %/Promille=zahl, 6-Spalten-Klassenmatrix §232=zahl,
  Einkommen/Vermögen-Prosa=text).
- VS-173.8-de/-fr: je 2 (Streitwert-/émolument-Spannen=bereich/text bilingual).
- **Als Text belassen (konservativ, §1):** jede Spalte mit ≥1 Regel-/Beschreibungs-
  Prosa-Zelle (Bezeichnung, «mind. aber Fr. …», «X % des Streitwerts»,
  «von den ersten … Franken») — verlustfrei, nur nicht rechts/gruppiert.
- **Werte (`zeilen`) byte-gleich zu HEAD** (sha1 je Datei bewiesen); Render-Delta =
  genau **6 Zellen** (3 BS-Jahre, 3 SO-Tageseinkünfte) + typkorrekte Ausrichtung.

**Gegenprüfung BESTANDEN** (unabhängiger Opus-Adversarial gegen LexWork-APIs
NW/BS/SO/VS, 20260705): alle Stichproben byte-exakt, 0 Zeile verloren/erfunden,
Typ-Calls faithful (BS §19/§20 Verfahren=text bestätigt), keine Staleness.
**Amtlicher Quell-Quirk notiert:** VS-173.8 §32 trägt in DE vs. FR abweichende
Honorar-Obergrenzen (24'000/24'900, 33'100/33'300) — das steht so in der amtlichen
zweisprachigen Fassung; beide Sprachfassungen treu reproduziert (kein Extraktions-
fehler). Register-Zeile: `bibliothek/register/gegenpruefung-register.md`.

**Zusatz e2e-Flake-Härtung:** `gesetze.e2e.ts` (OR-fill-Timeout PR #145) — der
Scroll-Spy-/In-Gesetz-Such-Kontrakt zog auf den kleinen Erlass **VGKE** um
(seitengrössen-unabhängig, App-Ready-Waits), Assertions unverändert scharf;
**6× CPU-Throttle-Probe 5/5 PASS**, e2e 12/12.

**Offen (eigene Folge-Schritte):** **Klasse B** (verklebte Zahlen ZH-215.3/ZH-211.11/
ZG-163.4/TG-176.31 — Spaltenrekonstruktion, eigener Spec), **Klasse C** (SG-Füllpunkt-
Rest, warum nicht erfasst → nachziehen). Der Typer + das Nachzug-Tool sind für diese
wiederverwendbar (Typisierung ist erlassunabhängig).

---

## Ausführungsvermerk — Schritt 2 · Klasse B (5.7.2026, Opus, Worktree `feat/tarif-tabellen-stufe2-b`)

**Erkenntnis (§7 — Realität gewinnt, wie Schritt 1):** Die im Spec geplante
«x-koordinatenbasierte Spaltenrekonstruktion VOR der Typisierung» war für die ZH-
Erlasse **bereits gebaut und committet** (`adapter-zh-pdf.ts` `extrahiereZhStreitwert-
Staffel`, Commits `e17793e8`/`7971fd81`/`559b1d9a`): die Streitwert-Staffeln lesen die
§-Region x-bewusst (TABLE_MAX_H-Filter, threshold1/2 aus den Kopf-Stück-x) und teilen
`100001250` deterministisch in `10 000`|`1 250`. **ZG-163.4/TG-176.31** kommen gar nicht
aus einem PDF, sondern aus **LexWork-`·`/`—`-Zellen** (`adapter-lexwork.ts` →
`reichereMehrspaltig`) und sind damit **schon vor-gespalten**. Es gab also KEIN neues
Verkleben aufzulösen — die 4 Erlasse trugen `mehrspaltig`, aber noch im **Legacy-
`{kopf,zeilen}`**-Modell (nie auf `spalten` nachgezogen, weil sie nicht in der
Schritt-1-Klasse-A-Liste standen).

**Gebaut = zwei Dinge:**
1. **Generator-Emit kanonisch (ZH):** `adapter-zh-pdf.ts` wickelt die beiden Staffel-
   Zuweisungen jetzt in `zuKanonisch()` (→ `typisiereSpalten`), analog zu
   `reichereMehrspaltig` (Klasse A). So produziert ein **frischer Generatorlauf** dasselbe
   kanonische `{spalten,zeilen}` wie der committete Snapshot (kein Legacy-Regress).
   `extrahiereZhStreitwertStaffel` selbst unverändert (Rückgabe `{kopf,zeilen}`, Tests intakt).
2. **Offline-Nachzug der 4 Snapshots:** `kanton-spalten-nachzug.ts -- ZH-215.3 ZH-211.11
   ZG-163.4 TG-176.31` (kein LexWork-/zhlex-Refetch → **0 Fremd-Drift**). `zeilen`
   **byte-gleich zu HEAD** bewiesen; nur Spalten-Typ + `sha` + Golden-Map (5 Keys) +
   `daten-manifest.json`-Rollup neu.

**Tabellen-/Zeilen-Statistik (5 Tabellen / 44 Datenzeilen / 4 Dateien):**
- **ZH-215.3 §4** (AnwGebV): 12 Zeilen — `[text Streitwert, zahl Grundgebühr, text Zuschlag]`.
  Grundgebühr rechtsbündig + Tausender-Apostroph (`1'250`…`106'400`). Streitwert=text,
  weil die erste Zeile (`bis 5 000 25% des Streitwertes, mind. aber Fr. 100`) Prosa ist (§1).
- **ZH-211.11 §3** (GebV OG): 4 Zeilen — `[bereich Streitwert, bereich Gebühr]` (beide
  gruppiert; Gebühr-Spannen `65–250`…`615–1'240`).
- **ZH-211.11 §4** (GebV OG): 8 Zeilen — `[text, text, text]`. **Bewusst konservativ:**
  die erste Grundgebühr-Zelle `250` ist ein **bare Integer** und in Isolation nicht von
  einer Positions-/Tarif-Nr. unterscheidbar (`TARIF_NR_RE`) → sobald eine Positions-Zelle
  in der Spalte steht, bleibt die Spalte `text` (nie mis-gruppiert; §1 «im Zweifel als Text
  belassen»). Verlustfrei — die Werte stehen unverändert im DOM, nur ohne Rechtsbündigkeit/
  Apostroph. (Kein Jahr-/Position-Bug wie bei Klasse A, da diese 4 Tabellen keine Prosa-Jahre
  in Amount-Spalten haben.)
- **ZG-163.4 §3**: 12 Zeilen — `[text, text]` (die Honorar-Formel «1250 zzgl. 23 % …» ist Prosa).
- **TG-176.31 §5**: 8 Zeilen — `[bereich Streitwert, text Grundhonorar]`.

**Konkatenations-Invariante:** die x-getrennten Zellen ergeben aneinandergefügt die Roh-
Textfolge der Quelle (Test: Ziffern von Streitwert-Obergrenze + Grundgebühr = `100001250`
bzw. `5000250`). Als Unit-Test in `klasse-b-kanonisch.test.ts` fixiert (11 Fälle: kanonische
Form + Rechteckigkeit + Typer-Regression-Lock + beide Verkleben-Befunde).

**Gegenprüfung BESTANDEN** (unabhängiger Opus-Adversarial, frischer Kontext, 20260705):
44 Zeilen zeichenweise gegen die amtliche Quelle — **ZH via `pdfplumber`** (bewusst ein
anderes Werkzeug als das produktive pdfjs → echte Unabhängigkeit), **ZG/TG via `xhtml_tol`**.
Alle Zellen deckungsgleich, beide Verkleben-Befunde korrekt getrennt, Konkatenation==Roh,
0 Zeile verloren/erfunden, 0 Ziffernwert geändert, keine Staleness. Register-Zeile:
`bibliothek/register/gegenpruefung-register.md`.

**Tore:** golden `IDENTISCH` (Engine unberührt, TABU) · tsc/vitest/lint/`check:tabellen`
(Kanton-Report: die 4 jetzt kanonisch)/`check:paritaet`(2966)/voller `npm run gate` grün ·
`test:e2e` 158/158 (1 Worker, dist). **Visual-Review** ZH-215.3 §4 + ZH-211.11 §4
Desktop 1200 + Mobil 390: Tabelle scrollt im `overflow-x-auto`-Container, **0 Page-Overflow
@390**, Tausender-Apostroph korrekt (Grundgebühr `1'250`…`106'400` rechtsbündig).

**Tabu respektiert:** `src/components/normtext/**` + `src/pages/gesetz-leser/**`
(Anhang-Rendering-Einheit) und `scripts/normtext/extrahiere-fedlex*` + `public/normtext/bund/**`
(Bund-Extraktor-Einheit) nicht angefasst; `ArtikelBody.tsx`/`KanonischeTabelle` unverändert
(Renderer war schon kanonisch, #147).

**Offen:** **Klasse C** (SG-Füllpunkt-Rest) + Anhang-Block-Rendering ③/⑤ = G3b Schritt 3.

**Lehren für Klasse C:** (a) Der Typer + der Nachzug sind erneut wiederverwendbar — kein
neuer Extraktions-Code, wenn die Rohextraktion schon rechteckig ist. (b) Die `bare-Integer`-
Falle (`250`→Position→`text`) ist die einzige typer-seitige Unschärfe bei Klasse B; sie ist
§1-sicher (nie falsch), aber wer für eine Amount-Spalte volle Rechtsbündigkeit will, müsste
`inferiereSpaltentyp` semantisch erweitern (Position-in-Amount-Spalte → betrag) — bewusst
NICHT gemacht (Blast-Radius auf die Klasse-A-Snapshots + Tarif-Nr.-Spalten; §1 > Kosmetik).
(c) Für SG (Klasse C) zuerst prüfen, ob die Blöcke schon `mehrspaltig`/rechteckig sind
(dann Nachzug) oder ob der Füllpunkt-Parser sie gar nicht erfasst (dann `extrahiereTarif-
Tabelle`-Block-Grenzen debuggen — echter Extraktions-Schritt).

---

## Ausführungsvermerk — Schritt 3 · Klasse C (SG-Füllpunkt-Rest) — G3b KOMPLETT (5.7.2026, Opus, Worktree `feat/tarif-tabellen-stufe2-c`)

**Diagnose ZUERST (§7, empirisch am committeten Snapshot + real-Parser):** Die 159
nicht erfassten SG-Blöcke (SG-3849 135 · SG-2935 20 · SG-2808 4) sind **kein**
Block-Grenzen- oder Payload-Problem — es war der **DEFECT-1-Guard** aus dem 22.6.-Parser:
`extrahiereTarifTabelle` liess einen ganzen Block als Plaintext (`return null`), sobald das
LETZTE Leader-Segment nach dem Betrag noch Text trug. Rejection-Breakdown der 159 (real-
Parser instrumentiert): **156× DEFECT-1** (140 «letztes Segment = Betrag + angeklebter Rest»,
16 «letztes Segment ohne Betrag») + **3× INCOMPLETE_SPLIT**. Der angeklebte Rest ist der von
der PDF-Extraktion an das Blockende geklebte **Folge-Inhalt**: nächste Tarif-Position, eine
Überschrift («3. Behörden der Zivilgerichtsbarkeit»), ein ganzer Folge-Artikel («Art. 25
Übergangsbestimmung …», SG-2935 art_5.05) oder eine Seitenzahl. DEFECT-1 schützte diesen Rest
vor stillem Verlust — droppte aber auch die vielen SAUBEREN Leader-Zeilen davor.

**Fix (§1-konservativ, belegte Ursache):** DEFECT-1 durch **`nachtext`** ersetzt. Die sauberen
Leader-Zeilen werden tableisiert; der trailing Rest wird VERLUSTFREI als `nachtext` bewahrt und
im Renderer (unverändert!) als eigener Text-Block hinter der Tabelle gezeigt. Zentraler §1-Beweis
= **Konkatenations-Invariante**: leader-freier Originaltext == (alle Zeilen-Beschreibung+Betrag)
+ nachtext, zeichenweise (als Unit-Test fixiert). Mehrdeutige Fälle bleiben §1-konservativ Text:
**mittleres** Segment ohne Betrag → `null`; `INCOMPLETE_SPLIT`/`RESIDUAL_LEADER` (eingebetteter
No-Leader-Betrag in einer Zeilen-Beschreibung) → `null`; Betrag ohne Dash → `null`. Neu-`items`-
Guard in `reichereTabellen`: ein Block mit lit./Ziff.-`items` wird NIE tableisiert (der Renderer
verbärge die items sonst) — aktuell 0 Fälle, latenter §1-Schutz.

**Blast-Radius bewiesen SG-only:** der Füllpunkt-Parser ist über `reichereTabellen` von ALLEN
PDF-Kantonen geteilt, aber ein Dry-Run des erweiterten Parsers über alle 26 Kanton-Snapshots
tableisiert **0** Blöcke ausserhalb SG (AR/BL/BS/FR/LU/OW/TG/VD-Leaderblöcke fallen weiter durch
No-Dash-/mittleres-No-Betrag-Guards). Insbesondere die **AUSSCHLUSS**-Erlasse BL-211.71/FR-635.1.1/
FR-214.5.16 (Änderungsplatzhalter «wird wie folgt geändert: …») bleiben unberührt.

**Regeneration ohne Drift:** committetes Tool `scripts/normtext/kanton-fuellpunkt-nachzug.ts`
re-projiziert NUR SG-3849/SG-2935/SG-2808 **offline** über die EXAKTE produktive `reichereTabellen`
(reexportiert, kein Re-Implement) + geteiltes `sha256Bloecke` — **kein PDF-Refetch → 0 Fremd-Drift**.
Das ist deterministisch identisch zu einem frischen Generatorlauf (die 159 Blöcke gingen im
Alt-Parser als `null` zurück → ihr `text` blieb roh = die Extraktionsausgabe vor Tableisierung).

**Statistik (erfasst / als-Text-belassen):**
- **127 Einträge → +127 Tarif-Tabellen + 127 Nachtext-Blöcke** (SG-3849 110 · SG-2935 15 · SG-2808 2).
- **32 bleiben §1-konservativ Plaintext** (unverändert zu HEAD): **14×** eingebetteter No-Leader-Betrag
  in einer Zeilen-Beschreibung (INCOMPLETE_SPLIT — echte, mehrdeutig verschmolzene Zeile), **18×**
  Füllpunkte in Nicht-Tarif-Kontext (Leader von Prosa gefolgt, keine gültige CHF-Zeile). Beispiel
  SG-3849 art_2: eine Zeile trägt `900.— 22.80.03 Teil…` (No-Leader-Betrag) → ganzer Block Text.
- **Klasse D (Tausendertrenner) für SG-`tabelle`:** durch den bestehenden `TarifTabelle`-Renderer
  gedeckt — `gruppiereTausender` greift auf die Betrag-Spalte (Visual verifiziert: `150.— bis 4'000.—`,
  `500.– bis 15'000.–`). Der #147-Klasse-D-Fix betraf `KanonischeTabelle` (mehrspaltig); der `tabelle`-
  Zweig gruppierte schon immer. Kein zusätzlicher Fix nötig.
- **Werte verlustfrei:** leader-freier Inhalt aller **728** SG-Einträge byte-identisch HEAD↔regeneriert
  (maschinell bewiesen); geänderte Struktur (+Tabelle/+Nachtext-Block) → nur `sha` + Golden-Map (127 Keys)
  + `daten-manifest.json`-Rollup neu.

**Gegenprüfung BESTANDEN** (unabhängiger Opus-Adversarial, frischer Kontext, 20260705): die neuen
Tabellen zeichenweise gegen die amtlichen SG-PDFs (gesetzessammlung.sg.ch, unabhängiges Werkzeug
`pdfplumber`/`pdftotext` statt produktivem pdfjs). Register-Zeile:
`bibliothek/register/gegenpruefung-register.md`.

**Tore:** golden `IDENTISCH` (Engine unberührt, TABU) · tsc/vitest (parser-Tests 26, inkl.
Konkatenations-Invariante + nachtext-Fälle)/lint/`check:tabellen`/`check:paritaet`(2966)/
`check:normtext`/`check:struktur-konsistenz`/voller `npm run gate` grün · `test:e2e` 163/163 (1 Worker,
dist). **Visual-Review** SG-3849/SG-2808/SG-2935 Desktop 1200 + Mobil 390: neue Tabellen bordiert,
Beträge rechtsbündig + Tausender-Apostroph, Nachtext als Folge-Textblock, **0 Page-Overflow @390**.

**Tabu respektiert:** `ArtikelBody.tsx`/`TarifTabelle` (Reader/QS-PERF) unverändert; `extrahiere-fedlex*`
+ `public/normtext/bund/**` (L0-Einheit) nicht angefasst; Fläche = `tarif-tabelle.ts`/`adapter-pdf.ts`
(reichereTabellen) + `public/normtext/kanton/SG*` + neues Nachzug-Tool + Tests.

**→ G3b (Kanton-Tarif-Tabellen Stufe 2) ist damit KOMPLETT: A (·/—-Zellentrenner) + B (verklebte
Zahlen) + C (Füllpunkt-Rest) + D (Tausendertrenner) alle gebaut/verifiziert.** Bewusst NICHT erfasst
(dokumentiert, §1): die 32 mehrdeutigen SG-Restblöcke (bleiben faithful Plaintext) und die eigenen
ZH-PDF-Stränge ZH-243 NotGebV §17 / hierarchische Ziffer-Tarife (eigene Risiko-Klasse, oben notiert).

**NEUER Vorbefund aus der Gegenprüfung (NICHT von dieser Änderung verursacht — Backlog, andere
Risiko-Klasse):** Der zugrunde liegende **Rohtext von SG-2935** (und potenziell SG-3849-Anhänge) ist
stellenweise durch die URSPRÜNGLICHE pdfjs-Extraktion der **zweispaltigen Anhang-Tabellen** verstümmelt
— real existierende, aktive Gebührenpositionen fehlen VOLLSTÄNDIG im Snapshot UND im gerenderten HTML
(grep=0 Treffer): **21.03/21.04/21.05/21.06** (Papier-Schuldbrief-Neuausfertigung/Pfandsummen-Herabsetzung/
Nebenbestimmungs-Änderung/Forderungs-Auswechslung), **3.04–3.07** (elektronische Auskunft u.a.), **24.01**
(Veräusserungsbeschränkung BVG). Beweis, dass es NICHT diese Änderung ist: die Konkatenations-/Byte-Invariante
zeigt reine byte-identische Re-Partition (fehlende Daten können nicht wiederhergestellt werden) — die Lücke
war schon im committeten Rohtext. Die unabhängige `pdfplumber -layout`-Extraktion des Prüfers holt alle
Positionen sauber. **Backlog-Item:** SG-2935/SG-3849-**Anhang-Tabellen** mit layout-bewusstem Extraktor
(x-Spalten, wie ZH-Anhang) neu extrahieren — eigener Extraktions-Schritt, NICHT der Füllpunkt-Parser.
Nebenbefund (kosmetisch, kein Verlust): SG-2935 `art_17` schiebt eine Prosa-Notiz zwischen 26.01/26.02,
wodurch 26.02 samt intaktem «50.–» in den nachtext statt in die Tabelle wandert — Gebühr bleibt lesbar.

## Ausführungsvermerk — SG-2935-Rohtext-Reparatur (5.7.2026, Branch `fix/sg2935-x-spalten`)

**Der Vorbefund oben ist BEHOBEN.** Empirische Defekt-Mechanik (Reproduktion am amtlichen PDF,
`versions/2935/pdf_file_with_annexes`): die Anhänge sind KEIN Zweispalten-Merge-Problem —
das PDF ist ein Spiegelrand-Layout (Body ungerade Seiten x≈162, gerade x≈119) mit **versetzter
MediaBox** (`view=[87.9, 123.3, 507.1, 718.7]`, Ursprung y0≈123). Zwei Wurzel-Fehler im geteilten
Extraktor `scripts/normtext/adapter-pdf.ts`:

1. **Kopf-/Fussband im falschen Koordinatenraum:** Schwelle `viewport.height*0.9 ≈ 535` wurde gegen
   die ROHEN `transform[5]`-y-Werte (123…719) verglichen → die obersten ~123 pt jeder Seite galten
   als Kopfband; jede Zeile dort, die nicht mit «Art.» beginnt (= genau die Tarif-Positionszeilen
   «21.03 Neuausfertigung …»), wurde KOMPLETT verworfen. Fix: `bandSchwellen(mbY0, mbY1)`
   MediaBox-relativ; für origin-0-PDFs byte-identisch zur alten Formel (§6-Neutralität).
2. **Verworfene Wort-Trenner:** die Quelle setzt Leerzeichen als eigene, teils ~0-breite Fragmente
   (`str=" "`, h≈0); die alte Verwerf-Regel `!str.replace(/\s/g,'')` liess die Worttrennung an der
   width-Heuristik hängen, die bei ~0-Breite versagt («AuswechslungderForderung»,
   «Schuldübernahmeanzeige(Art.834Abs.1ZGB)»). Fix: Trenner-Fragmente als explizites
   Wortgrenz-Signal behalten → genau EIN Leerzeichen (§1, kein Zeichen erfunden; auch die
   amtlichen Tausendertrenner «Fr. 2 000 000.–» sind reale Quell-Fragmente).

**Dritter Wurzel-Fehler (Befund der ERSTEN adversarialen Gegenprüfung dieser Einheit — Verdikt
«widerlegt», D1–D3, dann gefixt):** eine UMGEBROCHENE Querverweis-Zeile, die mit einer
Positions-Nummer beginnt («… ausgenommen Nrn. 25.07 bis ⏎ 25.10 dieses Erlasses … 50.–»),
öffnete im Ziffer-Segmentierer fälschlich eine neue Position → 20.05/24.02 trunkiert (Betrag
verloren) und der Phantom-Eintrag «25.10 dieses Erlasses … 50.–» verdrängte per First-wins-Dedup
die ECHTE Position 25.10 («Anmerkung Verwaltungsbeschlüsse … Art. 649a ZGB» = **100.–**) — ein
falscher Gebührenwert. Fix: **Geometrie-Orakel `istZifferKopfZeile`** (Kopf nur, wenn die Ziffer
in der Nr.-SPALTE am linken Body-Rand sitzt, x ≤ bodyMinX+8; Wrap-Zeilen beginnen in der
Beschreibungs-Spalte ≈ bodyMinX+50) + `segmentiereAnhangZiffern(text, istKopfZeile?)`; nicht
belegte Ziffer-Zeilen fliessen als Fortsetzung (§1). 9 Regressions-Tests (D1–D3 + reale Geometrie).

**Daten:** SG-2935 **83→112 Positionen** (+29: 21.03–21.07 · 3.04–3.08/3.14/3.15 · 24.01/24.02 ·
5.01/5.02 · 20.02+20.02.01–03 · 20.04/20.05 · 22.01 · 23.01/23.02 · 25.08/25.09 · 27.01/27.02;
0 entfernt; 20.05/24.02/25.10 inhaltlich korrigiert per D1–D3-Fix). SG-2808 (34→34): reine
Wortlaut-Treue, **bewiesen verlustfrei** (whitespace-bereinigte Zeichenkette Subsequenz-identisch
zu HEAD). SG-3849 (**611→607**): Wortlaut-Treue + **4 Phantom-«Positionen» entfernt**
(141.81/146.11/552.11/672.51 = sGS-Nummern aus der Nachtrags-Historie im ERLASS-KOPF, vom alten
Segmentierer als Tarif-Positionen fehlgedeutet; deren Apparat-Prosa ist Editions-Beiwerk vor der
ersten echten Position, kein Tarif-Normtext — Live-Link bleibt massgeblich §7). SG-811.1/963.75
unberührt (Probe MATCH).

**Gegenprüfung (2 unabhängige adversariale Durchgänge, pdfplumber ≠ produktives pdfjs):**
Durchgang 1 = «widerlegt» (D1–D3, oben) → gefixt; Durchgang 2 (frischer Kontext) über das
GANZE Inventar: 87=87 Anhang-Positionen beidseitig (x-bewusste Enumeration), 0 erfunden,
0 verloren, 20.05/24.02/25.10 amtlich korrekt (25.10 = 100.–), wiederhergestellte Positionen
wortlaut-genau; Rest-Deltas = pdfplumber-Artefakte (Fussnoten-Hochzahlen «ZGB18», Absatz-Ziffern,
Seiten-Furnitur, Leader-Punkte) — der Snapshot ist je die treue Seite. 24.01 «vom 25. Juni 1982»
= korrektes BVG-Datum.

**Korpus-Probe (alle 27 committeten PDF-Kanton-Snapshots re-extrahiert):** 13 DIFF / 14 MATCH.
Nur SG-2935 (y0≈123) und **SZ-280.411 (y0≈204)** tragen die MediaBox-Band-Klasse; die übrigen
11 DIFF (FR-8428, LU-3870, SG-2808/3849 ✓mitgefixt, SZ-173.111/213.512/82040, VD-105539/106879/
210344, VS-1413) sind reine Wortlaut-Verbesserungen durch den Trenner-Fix (origin-0, kein
Positions-Verlust). **Ehrliches Residuum (Backlog):** die 10 Nicht-SG-Dateien wurden NICHT in
diesem Schritt regeneriert (Blast-Radius klein halten; SG war die Bau-Fläche) — der
`normen-monitor`-Drift-Check (`check:pdf-netz`) wird für sie ROT und quittiert den Nachzug je
Kanton (`npm run normtext -- --nur=kanton --kanton=XX`); SZ-280.411 dabei priorisieren
(Band-Klasse = potenziell fehlende Zeilen, gleiche Prüfschablone wie hier).

## Ausführungsvermerk — Nachzug SZ-280.411 + Nicht-SG-Snapshots (6.7.2026, Branch `fix/sz-nichtsg-nachzug`)

**Das Backlog-Residuum oben ist ABGEARBEITET — 6 von 11 Dateien regeneriert, 4 mit Begründung
NICHT (Einzelfälle unten), SG war schon in #162 gefixt.** Kein Code-Diff (der gemergte
#162-Extraktor reicht); reiner Daten-Nachzug via `--nur=kanton --kanton=SZ|LU|VD|FR|VS`,
Sibling-Erlasse derselben Kantone (LexWork-Quellen, out-of-scope-Drift) je auf HEAD zurückgesetzt.

**SZ-280.411 (Band-Klasse, y0≈204 — priorisiert): 15→19 §§.** VORHER fehlte im Live-Snapshot
komplett: **§5** (Entschädigung amtliche Verteidigung, 3 Abs.), **§9** (Ehe-/Vaterschaftssachen,
2 Abs.), **§14** (Verwaltungsgericht Fr. 300.- bis Fr. 8 400.-), **§14a** (Zwangsmassnahmengericht
Fr. 180.- bis Fr. 5 000.-); dazu fehlende Absätze wiederhergestellt in §1 (Abs 1+2), §6 (Abs 1–3
statt leerem Block), §8 (**Abs 2 = die ganze Grundhonorar-Staffel** von Fr. 2 000.- bis
>Fr. 1 000 000.-), §15 (erste Satzhälfte «Für die Vertretung in Rechtsmittelverfahren …»),
§17 (Abs 3 Kopien), §18 (Abs 1+3 statt nur Schlussfragment). Wortlaut gegen das amtliche
LexWork-PDF (sz.ch 280_411.pdf, SRSZ 1.1.2015) via pdfplumber verifiziert. **Dokumentierte
Residuen (NICHT bereinigt, pdfjs-Glyph-Umordnung / Absatz-Merge):** §9 Abs 1 zeigt
«Fr. 1 - 000.bis» statt «Fr. 1 000.- bis» (das «-»-Glyph liegt im pdfjs-Stream bei x=427.7 LINKS
von «000.» x=433.5 — pdfplumber liest dieselbe Zeile korrekt; Klassen-Geschwister pre-existing
byte-identisch in HEAD: §7 Abs 3 «zua- m chen», §13 lit. a «e-B zirksgericht»); §18 Abs 2 in
Abs 1 verklebt + Übergangsbestimmungs-Titel in Abs 3; Abschnitts-Überschriften («V. Ausnahmen» …)
kleben an Absatz-Enden (Klasse, pre-existing). §8-Schlusszeile «1 - 3.5 %» ist amtliche
Rendering-Form (kein Defekt).

**Trenner-Klasse regeneriert (je Diff klassifiziert, amtlich gegengeprüft):**
- **SZ-173.111** (40=40 §§): 4 §§ whitespace-only entklebt (§26/33/34/36); Stand SRSZ 1.2.2026 ✓.
- **SZ-213.512** (7=7 §§): §5 **amtlich korrigiert** «Fr. 50000.-- … 45.--» → «Fr. 50’000.- … 45.-»
  (PDF-Wortlaut exakt); §6 Fussnoten-Superscript «11» entfernt (Furniture-Leak); **Stand-Korrektur
  2021-02-01 → 2027-02-01** (PDF-Fusszeile «SRSZ 1.2.2027» — der Band-Fix macht den echten
  Konsolidierungsstempel erst lesbar).
- **SZ-82040** (24=24 §§): §23 whitespace-only.
- **LU-3870** (56=56): reine Trenner-Entklebung; §48 «Fr. 100.– bis Fr. 1000. –.» = amtliche
  Quell-Spationierung (verifiziert).
- **VD-vd-105539** (118=118): reine Whitespace-Verbesserung; die 51 «xx - yy»-Muster sind ECHTE
  Quell-Bindestriche (Emolument-Staffeln), Anzahl identisch vor/nach.

**NICHT regeneriert (4 Einzelfälle, Diff unklar/regressiv — auf HEAD belassen):**
- **FR-8428 + VS-1413:** der aktuelle Extraktor REGRESSIERT Silbentrennungs-Joins — HEAD hat
  «secondaire»/«imprimé»/«notariat» korrekt zusammengefügt, das Regenerat zerreisst sie zu
  «se - condaire»/«im - primé»/«no - tariat» (amtlich stehen die Wörter mit Trennstrich am
  Zeilenumbruch; pdfplumber-dehyphenation bestätigt). Der Trenner-Fix aus #162 behandelt das
  ~0-breite Leerraum-Fragment jetzt als Wortgrenze — auch dort, wo die Quelle einen
  Trennstrich-Umbruch hat. **Backlog: Dehyphenation-Regel im Trenner-Pfad (Zeilenend-«-» +
  Kleinbuchstaben-Fortsetzung → join), erst dann FR-8428/VS-1413 nachziehen.**
- **VD-vd-106879:** §81 hängt ein zerschossenes Zahlen-Barème (Anhang) an; das Regenerat
  verliert dort lesbare Furniture («valable dès le 1er janvier 2005», «BAREME SPECIAL …»-Titel)
  gegen andere Zahlenfenster — Diff nicht als reine Verbesserung klassifizierbar. **Backlog:
  Barème-Anhang braucht layout-bewusste Extraktion (wie SG-Anhänge), erst dann nachziehen.**
- **VD-vd-210344:** Gegenprüfungs-Befund — das Regenerat setzt die Randtitel von **Art. 4/5/6**
  («Actes non instrumentés»/«Intervention facultative du notaire»/«Base de l'émolument») in den
  Fliesstext von Art. 3; Art. 4–6 fehlen als eigene Einträge (pre-existing Kollaps, HEAD wie
  Regenerat: Sprung Art. 3 → Art. 7). Netto additiv, aber strukturell fehlplatziert → §1
  konservativ NICHT übernommen. **Backlog: VD-Profil-Artikelkopf-Erkennung fixen (Art. 4–6
  wiederherstellen), dann regenerieren.**

**Gegenprüfung (2 unabhängige adversariale Durchgänge, pdfplumber ≠ pdfjs, frischer Kontext):**
Durchgang 1 «widerlegt» → VD-210344 zurückgesetzt + Residuen-Claim präzisiert (2 der 4 Befunde
waren Prüf-Artefakte: §13 lit. a–d und §6 Abs 3 lit. a/b liegen vollständig in den `items`-Arrays);
Durchgang 2 über den korrigierten 6-Dateien-Diff (Verdikt s. gegenpruefung-register 6.7.).
#162-Lektion aktiv geprüft: keine Phantom-§§ durch nummern-beginnende Wrap-Zeilen (§-Set exakt
= amtliches Inventar §1–§18+§14a; §8-Staffelzeilen/«20 000.-;»-Umbrüche öffnen nichts).
