# ⚡ JETZT MACHEN — Trigger-Datei

> **STAND 27.6.2026 — PLAN VOLLSTÄNDIG ABGEARBEITET + DEPLOYT (`85ac7e47`,
> Prod `dpl_DJZJ3EJU…`, lexmetrik.vercel.app):** Alle 9 Aufträge + Zusätze sind
> auf `main` und live. **ERLEDIGT + LIVE:** Welle 0/Auftrag 7 · Lane G 6a+6b ·
> Lane R B1/B2 · A1/A2/A3 (Seitenmarker dezent, FR-Extraktion ×4, Voll-Urteil-
> Regeln F5✓) · Batch 2 (Auftrag 4 Facetten-Leiste, 8 Sprachfilter, F4 Leit/BGE-
> Merge) · Batch 3/Auftrag 9 (BVGer/BStGer/BPatGer, 15 Urteile, Instanz-Achse) ·
> Welle Final: Auftrag 5 Materialien (28 amtliche Ressourcen, parallele Nacht-
> Session) + B3 Kontext-Panel (Norm↔Entscheid↔Material). Gate + Prod-Build grün,
> Golden byte-gleich, kein Bestand-Drift. **Offen = nur fachliche Abnahme David**
> (Abnahme-Zeitsperre bis 1.12.; alles `verifiziert:false`) + Leitentscheid-Welle
> je neuem Gericht + B3-Designfrage (Norm-Reader: Panel am Leseende statt oben).
> Dieser Plan ist „dry" — Details je Block in den STRUKTUR.md-Session-Karten 27.6.


> **AUSLÖSER:** Sagt David in einer neuen Session **„jetzt machen"** (oder „mach jetzt"), ist das die Freigabe (= „go"), diesen Plan **abzuarbeiten** — beginnend mit Welle 0 (§3), dann Lane R ∥ Lane G, zuletzt Welle Final.
>
> **Beim Start zwingend:** (1) §0 Querregeln + CLAUDE.md §1–§13 laden. (2) §9 Gabelungen: F1–F4 als Default umsetzen, **F5 einmal kurz von David bestätigen lassen**. (3) Andockpunkte (`file:line`) am echten Repo gegenprüfen (können durch Parallel-Sessions verschoben sein). (4) Memory `immer-bestes-modell` / `autonom-durchfuehren-modus` / `immer-logik-bugcheck` beachten. (5) **Deploy nur auf Davids §9-Ja.**
>
> Sagt David „jetzt machen" mit Zusatz (z. B. „jetzt machen Welle 0" / „jetzt machen Lane R"), nur diesen Teil starten.

---

# HANDLUNGSPLAN — Darstellung & Korpus-Ausbau (Stand 26.6.2026)

> **Zweck:** Selbsttragender Handlungsplan für eine **neue Session**. David hat in dieser Session 9 Aufträge diktiert + Zusatz-Ideen freigegeben; die Ausführung erfolgt in einer Folge-Session. Dieser Plan ist so geschrieben, dass er **kalt** (ohne den Gesprächsverlauf) abgearbeitet werden kann: jeder Punkt hat Ursache + Code-Anker (`file:line`) aus read-only Mappings vom 26.6.
>
> **Belegdisziplin:** Alle `file:line` stammen aus read-only Explore-Läufen am echten Repo am 26.6.2026. Vor dem Anfassen Zeilennummern kurz gegenprüfen (Code kann sich durch Parallel-Sessions verschoben haben).
>
> **Status:** PLAN ONLY — in dieser Session wurde **kein Code geändert**, keine Workflows gestartet.

---

## 0. Querregeln (gelten für JEDEN Block)

- **Worktree-Isolation:** pro Lane/Block eigener git-Worktree, sauber von aktuellem `main` abgebranched. Hinweis: lokales `main` ist z. Z. **29 Commits ungepusht**.
- **Modell:** jeder Sub-Agent / Workflow-Agent **explizit `model:'opus'`** (Memory `immer-bestes-modell`).
- **TDD/Golden zuerst** (Memory `immer-logik-bugcheck`, `immer-doppelt-verifizieren`): Test/Golden rot → Code grün.
- **Iterativer Bug-/Logik-Check** nach jedem Teilschritt + **adversarialer Schlussdurchgang** (Memory-Lektion Fedlex: adversariale Agenten fingen Tabellen-Drop/Leak).
- **`/code-review`** (medium = Daten-Batch, high = Logik/Extraktor/Tor, ultra = Mechanik-Umbau); danach `simplify`/Aufräumen (Memory `regelmaessig-aufraeumen`).
- **Deploy nur auf Davids §9-Ja** (`vercel:deploy` Preview→Prod), danach `get_runtime_errors` + `get_deployment_build_logs` prüfen. Im freigegebenen Batch dann durchziehen ohne Rückfrage (Memory `autonom-durchfuehren-modus`).
- **Lesbarkeit/mobil** visuell verifizieren (Playwright via Bash, **nicht** MCP-Screenshot — Memory `werkzeuge-zuerst-pruefen`).
- **Abnahme-Zeitsperre bis 1.12.2026:** nur Arbeit ohne Davids juristische Fachzeit; Inhaltliches als `TODO(David)` + Status-Marker (`verifiziert:false`/`kuratierung:'maschinell'`/`'recherche'`).

---

## 1. Umsetzungs-Modell — Wellen + 2 parallele Lanes

```
Welle 0  ── Kalender (Auftrag 7)            ← schneller, sichtbarer Quick-Win, eigenständig deploybar
            │
   ┌────────┴───────────────────────────────────┐
 Lane R (Worktree „entscheid-qualitaet")     Lane G (Worktree „gesetze-gliederung")
   Batch 1: B2→B1→A1→A2→A3                    Gesetze (Auftrag 6)   ← laufen PARALLEL
        ↓                                          │
   Batch 2: A4 + Abteilung + A8 + Leit/BGE         │
        ↓                                          │
   Batch 3: Neue Gerichte (A9, ultracode)          │
   └────────┬───────────────────────────────────┘
            ↓
 Welle Final ── Materialien (Auftrag 5, ultracode) → B3 Kontext-Panel
```

**Warum so (Neuplanung gegenüber „1→6 seriell"):**
1. Rechtsprechung teilt sich Dateien (`entscheide-schreiben.ts`, `browse.ts`, `Rechtsprechung.tsx`) → Aufträge 1/2/3/4/8/9 **seriell in EINEM Worktree** (Kollisionsschutz).
2. Gesetze (6) + Kalender (7) sind komplett unabhängig → **parallele Lane G** (Zeitersparnis).
3. **B2 (Golden) ist Voraussetzung, nicht Nachsicherung:** erst Baseline einfrieren, dann die riskante Extraktionsänderung A2 — sonst bleibt Regression an den 272 deutschen BGE unbemerkt.

---

## 2. Auftragsliste (Quelle: David, 26.6.2026)

| # | Auftrag | Lane/Block |
|---|---|---|
| 1 | BGE-Seitenzahlen aus dem Fliesstext lösen (dezent erhalten) | Lane R · Batch 1 |
| 2 | FR/IT-Entscheide einheitlich zu DE (Kopf-Block + Buchstaben-Gliederung) | Lane R · Batch 1 |
| 3 | Verbindliche Regeln für nicht-amtlich publizierte Urteile (analog Voll-Urteil, auch Übersicht) | Lane R · Batch 1 |
| 4 | Zusätzliche Listen-Einteilung (Instanz/Gemeinwesen) — **ultracode** | Lane R · Batch 2 |
| 5 | Neue Top-Kategorie „amtliche Ressourcen" (ESTV/EDÖB…) — **ultracode** | Welle Final |
| 6 | Gesetze: einheitliche Gliederungstitel-Formatierung + Buchstaben-Ebenen einklappbar | Lane G |
| 7 | Schnellrechner-Kalender (Startseite) Layout „füllt nicht aus" | Welle 0 |
| 8 | Rechtsprechung nach Sprache filtern | Lane R · Batch 2 |
| 9 | BVGer/BStGer/BPatGer aufnehmen (Publikationsart → Regel → je 4–5 neueste) — **ultracode** | Lane R · Batch 3 |

**Zusätze (von David freigegeben):**
- **A1–A3** (Ausführungs-Prinzipien, keine eigenen Batches): A1 mehrsprachige Extraktion **vor** neuen Gerichten · A2 `abteilung` beim Manifest-Anfassen mitheben · A3 neue Korpora sofort in Sitemap/Prerender/Suche.
- **B1** Render-Noise-Sweep über den Entscheid-Korpus.
- **B2** Konsistenz-Golden-Tor je (Gericht × Sprache).
- **B3** Kontext-Panel (Norm↔Entscheid↔Material) — **nach Auftrag 5**.
- C1/C2 **bewusst draussen** (C1 von B2 mitabgedeckt; C2 fällt ans bestehende axe-Tor).

---

## 3. WELLE 0 — Kalender (Auftrag 7)

**Symptom:** Schnellrechner-Kalender „füllt nicht alles aus", Teilwochen/leere Zellen wirken kaputt.

**Komponenten:**
- Parent-Panel: `src/components/start/Schnellrechner.tsx` (Kalender gerendert Z.115; Layout `lg:grid-cols-[18rem_minmax(0,1fr)]` Z.109).
- Adapter-Shell: `src/components/start/FristenKalender.tsx`.
- **Eigentliches Grid:** `src/components/FristenKalender.tsx`.

**Ursache (zwei getrennte):**
1. **Feste Tile-Breite in zu breitem, nicht-streckendem Flex-Container** → rechts Leerraum. Container `flex flex-wrap … gap-x-7` (Z.117); Tile-Breite `w-[min(12.5rem,100%)]` (Z.144). Das 7-Spalten-Grid selbst (`grid-cols-7`, Z.150) ist korrekt.
2. **`kompakt`-Wochenfilter** rendert nur fristrelevante Wochen (Z.127-133, `istRelevant` Z.103-104) → Teilwochen + leere Offset-Zellen (Offset Z.122-123, Leerzelle Z.155).

**Fix:**
- Tile-Breite fraktional / Monate als Grid, Container streckt (Z.144/117).
- `kompakt`-Filter so anpassen, dass volle Wochen/balanciertes Raster rendern (oder die Teilwochen sauber zentriert/aufgefüllt).
- **Layout-Golden/e2e ergänzen** (existiert keiner — `e2e/tastatur.e2e.ts` deckt nur das `DatumsFeld`-Popover ab, nicht dieses Grid).

**Verifikation:** Playwright-Screenshot hell/dunkel + mobil; Vergleich gegen Soll-Layout.

---

## 4. LANE R · BATCH 1 — Entscheid-Darstellung (Aufträge 1+2+3, B1, B2)

Reihenfolge zwingend: **B2 → B1 → A1 → A2 → A3**.

### 4.1 B2 — Konsistenz-Golden-Tor (ZUERST, als Sicherheitsnetz)
Je **(Gericht × Sprache)** ein gerenderter Referenz-Entscheid; Assertions: Kopf-Block vorhanden, Sachverhalt korrekt gegliedert (Buchstaben-Marken), **keine** Inline-Seitenmarker. Baseline der aktuell guten BGE-de-Darstellung einfrieren, **bevor** A2 die Extraktion anfasst. Wird in Batch 3 um neue (Gericht×Sprache)-Zellen erweitert.

### 4.2 B1 — Render-Noise-Sweep (adversarial)
Sweep über den ganzen Entscheid-Korpus nach der Bug-Klasse „Render-Noise": Seitenmarker (A1) **plus Geschwister** — Fussnoten-Leak, Regeste-Leak, verirrte Marker. Liefert die Fix-Liste für A1 + evtl. weitere.

### 4.3 A1 — BGE-Seitenzahlen (display-first)
**Befund:** Marker im Format `BGE 152 I 105 S. 114` stehen **nur in `auszugAbschnitte`** (amtlicher BGE-Auszug), in den `erwaegung`-Blöcken, **mitten im Satz**. Verifiziert in `152_I_105.json`: 0 in `abschnitte`, 12 in `auszugAbschnitte`.
- Strip-Logik existiert: `src/lib/rechtsprechung/sachverhalt.ts:25-31`, Regex `/\bBGE\s+\d+\s+[IVXLCDM]+\s+\d+\s+S\.\s*\d+/g`, **aber nur** aus `teileSachverhalt` aufgerufen (`sachverhalt.ts:104`) → greift nur für Sachverhalt.
- Erwägungen-Pfad `scripts/normtext/erwaegung-normalisieren.ts` hat **kein** Marker-Handling → Marker überleben.

**Fix (Default F2 = dezent erhalten, nicht löschen):** Marker im **Render** (in `src/components/rechtsprechung/EntscheidBody.tsx`, Erwägungs-Rendering) aus dem Satzfluss **herauslösen** und als dezenten Seiten-Marker (randständig/hochgestellt `S. 114`) setzen → Fundstelle bleibt zitierfähig. Kein Daten-Regen nötig (display-first, Memory-Lektion).

### 4.4 A2 — Mehrsprachige Extraktion (FR/IT, + Sprach-Label-Fix)
**Befund — Extraktion ist deutsch-keyword-only:**
- `extrahiereSachverhalt` (`scripts/normtext/adapter-entscheide.ts:83-99`): Start-Marker **deutsch-only** `/(?:^|\n)\s*Sachverhalt\s*:?\s*\n/i` (Z.87); End-Marker schon mehrsprachig (`Erw…|In Erwägung|Considérant|Diritto`, Z.88). FR „Faits" matcht nie → Fallback auf gekürzten OCL-Auszug, `vollstaendig:false`.
- `extrahiereRubrum` (`adapter-entscheide.ts:106-153`): nur deutsche Labels (`Besetzung` Z.137, `Parteien|Verfahrensbeteiligte`/`Gegenstand` Z.138-139, `Beschwerde|Berufung|Rekurs gegen` Z.141). FR (Composition/Participants/Objet/recours contre) → `null` → **kein Kopf-Block**.
- `sprache` wird aus dem **OCL-BGE-Record** kopiert (`adapter` Z.242, 389), FR-Body kommt aber aus dem aza-Urteil mit `sprache:null` (`holeBgeLeitentscheid` Z.528) → `bge_152_I_105` ist fälschlich `sprache:'de'` (einziger Mismatch im Korpus: alle 272 BGE tragen `'de'`, nur dieser hat FR-Body).
- `teileSachverhalt`/`SUB_RE`/`TOP_RE` (`sachverhalt.ts:36,41`) sind **sprachneutral** → A./B./C.-Split + Fettung funktionieren, sobald Marker im gespeicherten Text überleben.

**Fix:** Start-Marker + Rubrum-Labels **mehrsprachig** (FR: Faits/En fait, Composition, Participants/Parties, Objet, recours/recours en matière … gegen; IT: Fatti/In fatto, Composizione, Parti, Oggetto, ricorso); `sprache` aus dem **Body** bestimmen statt aus dem OCL-Record. Dann betroffene Entscheide **regenerieren** (Golden B2 fängt DE-Regression; neue FR-Golden-Zelle ergänzen).
**Render-Seite ist sprachbereit:** Sachverhalt-Fettung `EntscheidBody.tsx:141`; Kopf-Labels `KOPF_LABEL` haben de/fr/it/rm (`EntscheidLeser.tsx:44-49`); Rubrum-Modell `src/lib/rechtsprechung/kopf.ts:48-62` (Reihenfolge Z.23), Plausi `rubrum.ts:32-42`.
**Adversarial Pflicht** (Extraktionsänderung gefährdet 272 DE-BGE).

### 4.5 A3 — Verbindliche Regeln für nicht-amtlich publizierte Urteile
**Befund:** Normale Urteile haben Volltext bereits in `abschnitte`; Reader öffnet Nicht-BGE default `ansicht='voll'` (`EntscheidLeser.tsx:169`). Sie erscheinen in der Übersicht als simple Zeilen in „Weitere Entscheide" (`gruppiereNachLeit` `browse.ts:277-287`, Render `Rechtsprechung.tsx:222-228`). Die „verweis/vollständiges Urteil"-Karte ist BGE-only (Writer `entscheide-schreiben.ts:51-62`, Typ `register.ts:36-40`, Render `EntscheidZeile.tsx:19-22,37`).
`leitcharakter` (`typen.ts:81`, `register.ts:23`) abgeleitet `leit = istBge || !!det.bge_reference` (`adapter` Z.336); Invariante `leitcharakter==='leitentscheid' ⟺ bgeReferenz≠null` (`adapter` Z.335).

**Vorgeschlagene verbindliche Regeln (F5 — David-Nicken offen):**
1. **Identische Voll-Urteil-Struktur** wie beim Leitentscheid (Kopf-Block, gegliederter Sachverhalt, E.-Erwägungen, Dispositiv).
2. **Kein Auszug/Volltext-Umschalter** (kein amtlicher Auszug) → direkt Volltext.
3. **Regeste-Box nur bei amtlicher Regeste**; sonst „Zusammenfassung" + `kuratierung`-Marker.
4. **Kein „Leitentscheid (BGE)"-Badge** → neutrale Gericht/Abteilung/Datum-Kennung.
5. **Übersicht:** eigene konsistente Voll-Urteil-Zeile, **gruppiert unter ihrer Instanz**; die „verweis"-Karte bleibt für die BGE-Auszug→Volltext-Brücke reserviert.
6. **Status-Marker** (`verifiziert:false`/`kuratierung:'maschinell'`) bis Davids Abnahme.

Regeln zusätzlich **schriftlich in STRUKTUR.md / Entscheid-Konventionen** fixieren („verbindlich").

---

## 5. LANE R · BATCH 2 — Rechtsprechung-Liste (Aufträge 4, 8 + Leit/BGE-Cleanup)

**Auftrag 4 (ultracode-Design der Achsen-UX zuerst):** zusätzliche Einteilung neben Sachgebiet.
- Übersicht: `src/pages/Rechtsprechung.tsx` (Load 84-92; `gefiltert` 107-110; Sektions-Split `alsSektionen` 118; Sachgebiet-Schiene `SachgebietKacheln` 161-168 `?rg=`; Ebene-Segment 200-217).
- **Achsen bereits im Manifest** (`BrowseEntscheid` `register.ts:43-70`): `gerichtstyp` (Instanz, `typen.ts:18-20`: bundesgericht/bundesverwaltungsgericht/bundesstrafgericht/bundespatentgericht/kantonal), `kanton` (Gemeinwesen, CH=Bund), `gericht`/`gerichtName`, `datum`, `bgeReferenz`.
- **Abteilung nur snapshot-only** (`typen.ts:69`) → **A2-Zusatz: ins Manifest heben** (Writer `entscheide-schreiben.ts:39-46` + Typ `register.ts:43-70` + `register.json` regenerieren) → ermöglicht Kammer/Abteilung als echte Achse. Werte sind Freitext („Verwaltungskommission") bzw. römische Abteilung aus `bgeReferenz`-Mittel-Token ableitbar.
- Filter-Mechanik: `EntscheidFilterWerte` (`browse.ts:59-74`) kann schon `gericht/kanton/ebene/sachgebiet/nurLeitentscheide/nurBge`; Prädikate `browse.ts:201-211`. Für echte Gruppierungsachse: Gruppierfunktion analog `gruppiereNachLeit` keyed auf `gerichtstyp`/`kanton`/`abteilung`.

**Auftrag 8 (Sprache-Filter):** Sprache-Select existiert bereits in „Erweiterte Filter" `EntscheidFilter.tsx:92-145` (eingeklapptes `<details>`). → klären: sichtbar machen/hochziehen (eigene Facette/Segment) **oder** Bugfix. Mit Auftrag 4 verzahnen.

**Leit/BGE-Redundanz auflösen (F4 = zusammenführen):** „nur Leitentscheide" (`browse.ts:208`, `leitcharakter==='leitentscheid'`) und „nur BGE" (`browse.ts:209`, `bgeReferenz≠null`) wählen **exakt dieselbe Menge** (an Daten geprüft 26.6.: 272=272=272, 0 Divergenz). → Zu **einem** Filter zusammenführen; Feld `leitcharakter` als semantische Grundlage behalten (spätere Trennung amtliche-BGE ⟂ Leitentscheid möglich).

---

## 6. LANE R · BATCH 3 — Neue eidg. Gerichte (Auftrag 9, ultracode)

BVGer / BStGer / BPatGer. **Voraussetzung: A2 (mehrsprachig) ist gelandet** (diese Gerichte publizieren stark FR/IT).
- Typ-Andockpunkt vorhanden: `gerichtstyp` kennt die drei bereits (`typen.ts:18-20`).
- Pipeline `scripts/normtext-entscheide.ts` (Zweige `bgeKorpus` Z.121, `bundKorpus` Z.61, `kantonKorpus` Z.101) → **neuer Quell-/Adapter-Zweig pro Gericht** analog. Adapter `mappeEntscheidOCL` (`adapter-entscheide.ts:230`).

**ultracode-Workflow (Vorschlag):**
1. **Recherche-Fan-out** (je Gericht ein Agent): Publikationsart untersuchen — BVGE/TPF/eigene Sammlungen, Volltext-Portale, Metadaten, Regeste-Praxis, Geschäftsnummern-Schema, Sprachen.
2. **Regel-Synthese** je Gericht: Aufnahme → Verarbeitung → Darstellung, **orientiert an BGer** und dessen Darstellung; verbindlich dokumentieren.
3. **Bestückung:** je Instanz die **4–5 neuesten** Urteile aufnehmen + darstellen (Status-Marker `kuratierung:'maschinell'`).
4. **B2-Golden** auf neue (Gericht×Sprache)-Zellen erweitern.
5. **A3-Zusatz:** neue Gerichte gleich in Sitemap/Prerender/Suche verdrahten (siehe §8 Andock-Liste, Such-/Prerender-Punkte).

---

## 7. LANE G — Gesetze-Darstellung (Auftrag 6)

Reader: `src/pages/GesetzLeser.tsx` (1090 Z. — **über §6-Limit 800**, ggf. splitten).

**a) Uneinheitliche Bold-Formatierung — Ursache:**
- Randtitel sind ein **flaches `string[]` ohne Ebenen-Feld** (`ArtikelStruktur.marginalie` `browse.ts:138`); Fettung rein über **Array-Position** entschieden: `i === marg.length-1` → fett/grösser, sonst klein/grau (`GesetzLeser.tsx:154-166`).
- `marg` ist nur das **Delta** zum Vorartikel (`margAnzeige` `GesetzLeser.tsx:386-397`). Bei „C. Handlungsfähigkeit → I. Voraussetzung" ist `C.` nicht letztes Element → klein; `I.` letztes → fett. Genau das gemeldete Symptom.
- Ebene wird schon **bei der Extraktion verworfen**: Marginalie auf `ebene:0` geflacht (`scripts/normtext/struktur-extrahiere.ts:129`, Emit ohne Ebene Z.106; Kanton `struktur-lexwork.ts:53`).
- Gliederungs-Sektionen haben echtes `ebene` (`Sektion` `browse.ts:167-173`, Bau `baueGliederungsbaum` 179-206) und werden konsistent gestylt (`SektionKopf` `GesetzLeser.tsx:230-259`, `titelStil` 242).

**Fix (F3 = Runtime-Ableitung, kein Massen-Regen):** Ebene zur Laufzeit aus dem Marker ableiten — die **bereits existierenden, aber ungenutzten** Parser `randtitelTeile`/`randtitelEintraege` (`src/lib/normtext/darstellung.ts:50-74`) nutzen → jede Stufe einheitlich formatieren (`GesetzLeser.tsx:154-166` Positions-Ternär ersetzen). Display-first, reversibel.

**b) Buchstaben-Ebenen einklappbar (analog Fedlex):**
- Klappbar sind aktuell nur Sektionen + Artikel (Artikel `artOffen` `GesetzLeser.tsx:87/171-173/195`; Sektion `offen` Record 280, `istOffen/toggle/oeffnePfad` 483-487, `renderSektion` 784-797; TOC `tocBaum` 285/`SektionBaumTOC` 1047-1083; Scroll-Spy 519-577).
- Marginalie sind **gar keine Knoten** → Fix: in `baueGliederungsbaum` (`browse.ts:179-206`) Randtitel-Ebenen als zusätzliche `Sektion`-Knoten promoten (id + Ebene aus Marker ableiten). Dann greift der bestehende Klapp-Stack automatisch; `margAnzeige`-Delta-Logik entsprechend rückbauen.
- Fedlex-Anlehnung schon kommentiert (`GesetzLeser.tsx:148-153, 228-229, 248-251, 481-482, 1045` — „jede Stufe einklappbar"), Lücke ist genau die Buchstaben-Ebene.

**§-Constraint:** reine Präsentation (§3, keine Rechtslogik); struktur-Sidecars nur über die Generatoren ändern (§7).

---

## 8. WELLE FINAL — Materialien (Auftrag 5, ultracode) + B3

Neue Top-Kategorie „amtliche Ressourcen / Materialien" (ESTV-Kreisschreiben, EDÖB-Publikationen, Wegleitungen, Praxisfestlegungen …).

**ultracode-Design zuerst:** welche Behörden, welche Dokumenttypen, **Datenbeschaffungs-Strategie** (überwiegend PDFs → erst `nur-live-link`/`pdf-embed`, Volltext später), Einordnung, Verzahnung mit Erlassen. Template-Wahl: **Rechtsprechung-Klon** (Volltext) bzw. **International-Klon** (`status:'nur-live-link'`, kein Detail-Reader).

**12-Punkt-Andock-Liste (Build):**
1. `src/lib/materialien/register.ts` + `…/typen.ts` + `…/browse.ts` (normtext-Trio klonen). Register-Shape-Vorlage: `ErlassRegistereintrag` `register.ts:32-57`, Status `register.ts:30`.
2. `public/materialien/register.json` + Generator `scripts/…/material-manifest*.ts` + npm-Script (Spiegel `package.json:40`).
3. `src/pages/Materialien.tsx` (Übersicht) + `MaterialLeser.tsx` (Reader).
4. `src/App.tsx`: lazy-Imports (~Z.37-48) + `<Route>`s (~Z.225-231).
5. `src/lib/navigation.ts`: `MATERIALIEN_KINDER` + Eintrag in `NAVIGATION` (Z.153-161).
6. `src/lib/seo.ts`: `STATISCHE_SEITEN['/materialien']` (Z.54-65).
7. `src/lib/seo-detail.ts`: `metaFuerMaterial`/`materialVolltextHtml`/`jsonLdFuerMaterial`.
8. `scripts/prerender.ts`: `ERWARTETE_ROUTEN` bumpen (Z.53), Manifest-Read (~176-181), Detail-Write-Loop (~220-288), Floor-Const (~191), Teil-Sitemap (~325-329).
9. `vercel.json`: `/materialien/(.*)` Header-Block.
10. `src/lib/universalSuche.ts` + `src/components/suche/useUniversalSuche.ts`: `material`-Suchgruppe.
11. (Cross-Linking) `src/lib/normtext/werkzeuge.ts`: Materialien ↔ Rechner/Erlasse-Brücke (über `normKeys`).
12. Tests: `src/tests/normtext-register.test.ts` spiegeln (Register ⊇ Snapshots; committed JSON == frischer Build) + Dead-Link-Nav-Test.

**Danach B3 — Kontext-Panel:** einheitliches „Kontext"-Panel über die 3 Korpora (Norm ↔ Entscheid ↔ Material) im Reader, über vorhandene `normKeys`/`werkzeuge.ts`. = Burggraben (haben weder fedlex noch entscheidsuche).

---

## 9. Offene Bestätigungen (zu Session-Start abklären)

| # | Entscheidung | Default (Davids Vorschlag/Empfehlung) | Status |
|---|---|---|---|
| F1 | Reihenfolge | Wellen-Modell (§1) | empfohlen |
| F2 | Auftrag 1 Seitenzahl | dezent **erhalten**, nicht löschen | empfohlen |
| F3 | Auftrag 6 Ebenen | **Runtime-Ableitung** (kein Massen-Regen) | empfohlen |
| F4 | Leit/BGE-Filter | zu **einem** zusammenführen, `leitcharakter` behalten | empfohlen |
| F5 | Auftrag 3 Regeln | die 6 Regeln in §4.5 | **David-Nicken offen** |

> Bei „go ohne Kommentar" werden F1–F4 als Default umgesetzt; F5 zu Beginn kurz bestätigen lassen.

---

## 10. Reproduktion dieses Plans
Erstellt aus 4 read-only Explore-Mappings (Entscheid-Rendering/Pipeline · Rechtsprechung-Liste · Register/Route/Nav-Architektur · Gesetze-Gliederung · Kalender) + 1 Daten-Sonde (Leit/BGE-Mengen) am 26.6.2026. Kein Code geändert. Andockpunkte vor Gebrauch am echten Repo gegenprüfen.
