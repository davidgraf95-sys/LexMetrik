# LexMetrik — Handlungsplan (DER eine Steuerungsplan)

> **Stand 1.7.2026.** Die **einzige Steuerungsquelle**: sie entscheidet **Reihenfolge** +
> **bau-jetzt vs. geparkt** und ist so geordnet, dass eine **künftige Session sie autonom
> Schritt für Schritt abarbeiten** kann. Sie faltet das frühere `HANDLUNGSPLAN.md` ein
> (→ `archiv/`). Das *Wie* je Strang steht in der jeweiligen `FAHRPLAN-*.md` (Detailquelle),
> der **Ist-Zustand/Deploy** in `STRUKTUR.md`, die G1-Praxis-Abdeckung in `KATALOG-ROADMAP.md`.
>
> **Chronologische Ordnungs-Schicht:** `FAHRPLAN-GESAMTAUFBAU.md` (Council+Fable 2.7.2026) ordnet
> ALLE offenen Stränge in **7 Phasen bis zum Nordstern** (Juli 2026 → ab Mitte 2027) — 4 Parallel-Bahnen,
> serieller 26×-Slot (@meta-Etikett), Autonomie bis 1.12.2026, Abnahme-Welle ab Feb 2027. Sie ist eine
> **reine Lese-/Ordnungs-Sicht** (steuert nicht selbst): Sie **ordnet** diese ROADMAP, ersetzt sie nicht;
> bei Divergenz gilt die ROADMAP nach Davids **Freigabe-Paket T0b** (= der David-Touchpoint «Freigabe-Paket»,
> definiert in `FAHRPLAN-GESAMTAUFBAU.md` Phase 0 — ein ~30-Min-Ja/Nein-Paket, ohne das der Default gilt).

---

## ▶ Ausführungs-Protokoll (für jede künftige Bau-Session)

1. **Nimm den obersten offenen Schritt** der «Geordneten Abarbeitung», dessen Abhängigkeiten
   erfüllt sind (`[OF]` zuerst; `[D]`/blockierte überspringen). Die **phasen-übergreifende
   Reihenfolge** (welcher Strang wann, konfliktfrei) gibt `FAHRPLAN-GESAMTAUFBAU.md` vor.
2. **Halte die Leitprinzipien** (Zeitsperre/`[OF]` · amtliche Quellen · nie zwei 26×-Assets
   parallel · Worktree-Isolation · golden-gegated · Deploy nur auf Davids Ja).
3. **Bau in eigenem Worktree**, wenn der Schritt eine Kollisionsdatei berührt (§12).
4. **Gate vor Abschluss:** `npm run gate` grün; verhaltensändernd ⇒ Golden byte-gleich.
5. **Markiere erledigt** (Häkchen + Datum hier), zieh die Session-Karte in `STRUKTUR.md` nach,
   → nächster Schritt. **Push/PR/Auto-Merge stehend freigegeben (§9 Weg 1, David 3.7.2026:
   Merge nach `main` = Deploy-Entscheid; die §9-Sorgfalt — Tore/Golden/Bug-Check — gilt VOR dem
   Merge).** *(Ersetzt das frühere «Push/Deploy nicht selbst — sammeln fürs Batch-Deploy-Fenster».)*
6. **Erledigt-Prosa gehört in die Chronik (Token-Ökonomie, QS-TOK/T7).** Wird ein Schritt
   abgeschlossen, kommt die ausführliche Abschluss-Prosa («gebaut/PR#…/Beweise») **direkt** nach
   [`ROADMAP-CHRONIK.md`](ROADMAP-CHRONIK.md); hier bleibt nur Checkbox + `@meta` + Einzeiler +
   Pointer. So bläht `ROADMAP.md` (der Session-Einstieg) nicht wieder auf. **Nie zusammenfassen**
   (voller Wortlaut in der Chronik) — nur verschieben.

---

## So sieht das Taschenmesser aus (Produktvision)

**LexMetrik ist DIE EINE Anlaufplattform für alle Rechtsanwender** *(Nordstern geschärft, David
3.7.2026)* — Kanzlei, Gericht, Inhouse, **Steuerbehörden, Ämter/Verwaltung, Notariate, Treuhänder**,
Studierende — um **das Schweizer Recht zu konsultieren und damit zu arbeiten.** Ein vielseitiges
Werkzeug, zu dem man zuerst greift; **alles auf amtlichen Quellen** (Fedlex, amtliche
Entscheid-Sammlungen, amtliche Tarife/Materialien — Art. 5 URG, urheberrechtlich frei),
**deterministisch gerechnet statt KI-geschätzt.**

Die «Klingen» (= die Informationsarchitektur):

- **Konsultieren.** Gesetze (Volltext + amtliche Systematik, **mehrsprachig DE/FR/IT zum
  Vergleich**) · Rechtsprechung (BGE/BGer-Korpus, amtliche Regesten) · amtliche Materialien
  (Botschaften/BBl) · **Gesetzgebung/Rechtsetzung** (was kommt: Vernehmlassung/Parlament/AS-BBl) · **Verwaltungsverordnungen/amtliche Praxis** (Kreisschreiben ESTV/BSV/FINMA/SEM, Weisungen, Merkblätter, Rundschreiben — Etappe E6a, Detail `FAHRPLAN-DATENHALTUNG.md` §5).
- **Rechnen.** Die deterministischen Klingen: Fristen · Streitwert · Prozesskosten · Verzug/
  Forderung · Zuständigkeit/Rechtsweg · Verjährung · Beurkundung · Gründungen — jeder Wert mit
  Norm + Link + Stand.
- **Verzahnen (der Burggraben).** **Norm → Werkzeug → Schriftsatz** und zurück: vom Artikel in
  den passenden Rechner/Entscheid, vom Rechen-Ergebnis in den kopierfertigen Begründungs-Absatz.
  Und quer über den ganzen Korpus: **Norm ↔ Entscheid ↔ Material ↔ Verwaltungsverordnung** — ein
  Kreisschreiben zeigt, welche Norm es auslegt; ein Entscheid, welchen Artikel er anwendet; eine
  Botschaft hängt am Gesetz; von jedem Artikel zu allem, was ihn betrifft, und zurück. **Dieselbe
  Graph-Struktur, nicht vier Silos — das Organisationsprinzip des gesamten Datenausbaus**
  (Architektur `FAHRPLAN-DATENHALTUNG.md` §0/§0bis/§1; Etappen E4/E5/E6), nicht nur der Rechner-Achse.
- **Finden (der Griff).** Eine Auffindbarkeits-Schicht: zweiachsiger Einstieg (Rechtsgebiet ×
  Aufgabe) + globale Suche → die richtige Klinge in einem Klick.

Universell, nicht in Personas-Schubladen: dieselben Klingen dienen allen; einzig die Verpackung
(Einstiege, Erklär-/Übungs-Layer) variiert. **Geparkt:** Dossier-/Mandatsverwaltung — alle
Werkzeuge bleiben **strikt zustandslos** (rechnen/drucken/ICS, keine Persistenz von Falldaten).

**Verzahnung als Rückgrat (Organisationsprinzip, kein Einzelfeature):** die tragenden Schritte
dieses Plans sind Glieder EINES Graphen — W1·2 (Norm↔Werkzeug, live) · W2·6 Norm→Entscheid +
W2·6-DATA E4 Zitat-Graph · W2·7 Verzahnungs-Klingen · E5/E6a/E6b (Kanton-Entscheide, VerwVO,
Materialien) · W3·14 Split-View (macht den Graphen sichtbar). Das kann kein einzelnes Amtsportal —
darum ist die Verzahnung Burggraben UND das Kriterium, nach dem neue Schritte einsortiert werden
(§14: neue Doktypen docken immer an den Graphen an, nie als Silo). Der bestehende Code-Bestand dazu
(kontext.ts/KontextPanel/norm-index) ist in `FAHRPLAN-DATENHALTUNG.md` §0bis inventarisiert.
*Ehrliche Grenze: das Rückgrat ist Plan-Doktrin, kein maschinelles Tor — es wird über
§14-Einsortierung und Review gelebt, nicht von einem `check:` erzwungen.*

---

## Leitprinzipien (gelten immer)

1. **Amtliche Quellen, urheberrechtlich frei.** Inhalte ruhen **nur** auf amtlichen Werken
   (Art. 5 URG): Fedlex/kantonale amtliche Sammlungen, amtlich publizierte Entscheide + Regesten,
   amtliche Tarife/Verzeichnisse/Formulare, Botschaften/BBl. **Keine Kommentare/geschützte
   Sekundärliteratur.** Funktion, die das bräuchte ⇒ verwerfen oder auf amtliches Surrogat bauen.
2. **Mehrwert-Test (§0).** Nur bauen/behalten, was echten Mehrwert über generische Werkzeuge
   liefert (sonst streichen + in `KATALOG-ROADMAP.md` begründen).
3. **Zeitsperre bis 1.12.2026.** Nur Arbeit, die (a) **keine Davids-Fachzeit** braucht `[OF]`
   und (b) die spätere Abnahme-Welle billiger macht. Kein `verified`/`geprüft` ohne David
   (§7/§8). `[D]` = geparkt, in der Abnahme-Warteschlange (nicht drängen). G1-Gespräche ab Feb 2027.
4. **Nie zwei 26×-Datenassets gleichzeitig offen** — eine Säule fertig führen. Die sechs 26×-Assets — **fertig gebaut + aus dem Slot entlassen**
   (Abnahme ausstehend): Notariat-Grundbuch · Beurkundungs-Ausbau (entlassen 2.7.2026); **offen,
   Reihenfolge = @slot-kette-Kommentar unten:** BGer-Massenkorpus (QS-DATA E3) · Gesetze-Import-3Tier
   (W3·12) · Prozesskosten-Cockpit (W1·4-Rest) · Kantonale-Entscheide (E5). *Ein P0-Bugfix an einem Asset ist kein Daten-Bulklauf und **öffnet den
   26×-Slot nicht**.*
5. **Worktree-Isolation (§12)** bei Datei-Kollision: FUNDAMENT-UMBAU ⟂ VORLAGEN-AUSBAU ⟂
   VERTRAGS-VARIANTEN ⟂ Startseiten-Rahmen (`App.tsx`/`startseiteConfig.ts`/`vorlagenRegistry`);
   SEO-A11Y (`register.json`/`seo.ts`/`prerender.ts`/`vercel.json`).
6. **Push/Deploy nur auf Davids frisches Ja (§9);** jeder verhaltensändernde Schritt golden-gegated
   (§6). **§1 (Logik vor allem) / §5 (eine Quelle)** sind Invarianten über allen Wellen.
   **Zustandslosigkeit** (kein Dossier-Creep) ist Querschnittsregel.
7. **Geräte-Last: nicht merklich langsamer — ausser bei Logikverlust** (Anweisung David 30.6.2026,
   voll in **CLAUDE.md §15**). Lexmetrik darf den Computer des Nutzers nicht merklich verlangsamen,
   **solange daraus kein Logikverlust** (Inhalts-/Rechtsregel-/Funktions-Treue, golden-Byte-Gleichheit)
   entsteht; bei Konflikt gewinnt **immer die Treue** (§1-untergeordnet). Jede Optimierung trägt eine
   explizite Logikverlust-Bewertung. Operationalisiert durch das Tor **`check:perf-budget`** →
   Querschnitt **`QS-PERF`** / **`FAHRPLAN-PERFORMANCE.md`**.

**Verifikations-Blockaden (einmal definiert, danach nur referenziert):**
- **§4 — Lizenz/CORS für Live-Rechtsprechung** (CC-BY-SA vs. Art. 5 URG, CORS/Rate-Limits
  unbestätigt) → Rechts-/Lizenzbeurteilung = **`[D]`**. Solange offen: ENTSCHEIDSUCHE-P1 &
  KANTONALE-P1-Adapter **geparkt**. Nicht-§4-blockierte Korpus-/Übersichtsarbeit ist ausgenommen.
- **Prozesskosten I2** ⟵ Recherche `wbqdyap3x` (Schlichtungs-/Reduktionsfaktoren).

<!-- @blockers
wbqdyap3x: Prozesskosten I2 — Schlichtungs-/Reduktionsfaktoren (Recherche offen)
§4-lizenz: Live-Rechtsprechung — CC-BY-SA vs. Art. 5 URG, CORS/Rate-Limits unbestätigt
26x-slot: BELEGT durch E3 (W2·6-DATA, seit 3.7.2026 — BGer-Massen-Import); W3·12 wartet dahinter (Leitprinzip 4)
-->

<!-- @slot-kette (dokumentarisch; harte Prüfung via @meta-Feld `slot: inhaber`, check.ts 5b)
inhaber: W2·6-DATA (E3 seit 3.7.2026)
kette: E3(W2·6-DATA) · W3·12(Kanton-Gesetze) · Tarif-Bündel(W1·4) · E5(Kanton-Rechtsprechung) · Gerichtsferien-Matrix
uebergabe: nur per explizitem `plan:set <id> slot=inhaber`-Commit; check:plan erzwingt höchstens EINEN Inhaber (muss 26x: ja)
-->

---

## Querschnitt-Band (läuft begleitend — kein Reihenfolge-Slot)

- **Status-Marker-Audit + Verifikations-Infrastruktur** *(LERNPHASE A/B, `[OF]`)*. Jede Karte/Engine
  <!-- @meta id: LERNPHASE-AB · status: wip · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein · fahrplan: FAHRPLAN-LERNPHASE-2026.md -->
  trägt sichtbaren ehrlichen Status (`verified`/`entwurf`/`geplant`) + Stand; Golden-Abdeckung &
  Norm-Anker-Prüfung automatisieren. **Werkzeug-Andockung (Audit 1, 2.7.):** `fast-check`-Property-Tests
  für Staffel-/Bandgrenzen (`src/tests/tarifInvarianten.test.ts` — fängt Off-by-one; Dev-Dependency,
  seed-deterministisch §2) · **Gate-Kette parallelisieren** (`package.json`-`check` via Promise.all/spawn,
  ~9,6 s → ~2–3 s, Bordmittel) · Myers-`diff`-Package NUR als `golden:diff`-Diagnose — **das Gate selbst
  bleibt Byte-Vergleich.** Detail `BACKLOG-AUDIT-WERKZEUGE-2026-07.md`. **Stärkste zeitsperre-konforme Arbeit** — macht die
  Dez-Abnahme billig; dauerhaft begleitend. **Stand 5.7.2026 (PR `feat/lernphase-verifikations-infra`): alle drei
  Werkzeug-Andockungen erfüllt** — (1) Property-Tests um 3 Klassen erweitert (`tarifStaffel.property.test.ts`, jetzt 9
  Tests: Stetigkeit/Sprung an der `abChf`-Kante inkl. Hinweis-Sprache · Rahmen nie invertiert · Rundungs-Invarianz; alle
  grün, keine Engine-Änderung) · (2) Gate-Parallelisierung nachgemessen (seriell 16,2 s → parallel 6,5 s, 10-Kern; durch
  langsamsten Einzel-Check gedeckelt; Rot-Propagation adversarial bewiesen) · (3) B6 Myers-`diff` in `golden:diff` (Gate
  bleibt Byte-Vergleich).
- **Adversariale Gegenprüfung — systematisiert** *(QS-GP, LERNPHASE B, `[OF]`)*, neu 29.6.2026 —
  <!-- @meta id: QS-GP · status: wip · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->
  erweitert die Verifikations-Infrastruktur. Der adversariale Zweitdurchgang (unabhängiger
  Opus-Agent, frischer Kontext, Auftrag: Output gegen die amtliche Quelle **widerlegen**) fing real
  die teuersten Bugs (Tabellen-Drop, Footnote-Leak, `bis`/`ter`-Verlust), hängt aber bisher an
  Session-Disziplin statt an einem Tor. **Design-Detailquelle:**
  [`docs/superpowers/specs/2026-07-01-gegenpruefung-gate-design.md`](docs/superpowers/specs/2026-07-01-gegenpruefung-gate-design.md);
  Nachweis-Register [`bibliothek/register/gegenpruefung-register.md`](bibliothek/register/gegenpruefung-register.md).
  **Stand 1.7.2026: Bausteine a+b+c gebaut, gemergt PR #67 (`252731bd`) + prod-live** (Tor
  `check:gegenpruefung` in `npm run gate`, Skill »gegenpruefung«, Register + Quittier-Helfer
  `npm run gegenpruefung:ok`); offen nur Baustein d (rückwirkende Kampagne). **Hinweis:** die
  Risiko-Glob-Formen unten sind der *ursprüngliche Plan* — beim Bau korrigiert (verschachtelte
  `public/normtext/**` statt Top-Level-`*.json`, hand-gerolltes Pfad-Prädikat statt kaputter
  `*(a|b)*`-Alternation, `git status -uall`); die **as-built**-Wahrheit steht in
  `scripts/gegenpruefung/kern.ts` + der Spec. Bausteine:
  - **a · Gegenprüfungs-Gate `check:gegenpruefung`** — eingehängt in `npm run gate` (**nur lokal**,
    CI unverändert). Schneidet `git diff` ∩ Risiko-Pfade: **Extraktion** `scripts/normtext/**`,
    `src/lib/normtext/**`, `public/normtext/*.json` · **Rechnen** `src/lib/*(tarif|kosten|gebuehr|`
    `zustaendigkeit|frist|verjaehr|streitwert|beurkund|gruendung|schkg|straf|bger)*.ts` plus die
    Engine-Verzeichnisse `src/lib/tarif/**`, `src/lib/fristenspiegel/**` · **Norm/Tarif**
    `src/data/tarif/**`, `src/lib/vorlagen/**`. Trifft der Diff diese Globs, verlangt das Tor einen
    **Nachweis** (Commit-Trailer `Gegenpruefung:`; vor dem Commit liegt das Token in
    `bibliothek/.gegenpruefung-pending`, **gitignored** — Eintrag in `.gitignore` ergänzen), sonst
    **rot**. Über-Triggerung auf reine Tor-/Test-Änderungen wird mit Trailer
    `Gegenpruefung: n/a — reine Prüflogik` quittiert. **ERSTE AKTION beim Bau:** die Glob-Form gegen
    den real existierenden Baum prüfen (Verzeichnisse vs. `*.ts` — `src/lib/tarif`/`fristenspiegel`
    sind Ordner), sonst läuft das Tor leer. Das Tor selbst ist reine Prüflogik → golden byte-gleich (§6).
  - **b · Adversariales Protokoll als feste Skill** — unabhängiger Opus-Agent, frischer Kontext, vor
    sich Output **und** amtliche Quelle, Auftrag: widerlegen; **beim Rechnen** unabhängig aus der
    Norm nachrechnen (nicht den Code lesen). Gibt dem Trailer `Gegenpruefung:` überall dieselbe,
    nachvollziehbare Bedeutung.
  - **c · Gegenprüfungs-Register mit «Stand»** (`bibliothek/`, §11) — hält je Snapshot/Engine fest,
    welcher protokollierte Durchgang vorliegt (Datum, Verdikt, **gepinnte Quell-Version**) →
    Rück-Prüfung als Burn-down. Gekoppelt an `check:fedlex-versionen`: überholter Pin ⇒ Eintrag wird
    «**neu fällig**».
  - **d · Rückwirkende Kampagne** *(Batches, Opus, `[OF]`)* — risiko-priorisiert: **Rechnen →
    extrahierte Normen → Rest**; enthält die **BGE-Korpus-Regenerierung** (Welle 2 · 6). Gegen
    amtliche Quelle verifizierbar; Verdikte ins Register (c). **Constraints:** reine Re-Verifikation
    öffnet **keinen** 26×-Slot; ein daraus folgender Daten-Bulklauf (Korpus neu ziehen) ist ein
    26×-Asset → nur bei freiem Slot, nie zwei parallel (Leitprinzip 4). Korrekturen aus der Kampagne
    sind verhaltensändernd → golden-gegated (§6) + Push/Deploy nur auf Davids Ja (§9).
- **Plan-Hygiene-Wächter** *(QS-PH, `[OF]`)*. Mechanischer Check nach Vorbild des SessionStart-Hooks
  <!-- @meta id: QS-PH · status: wip · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein · fahrplan: FAHRPLAN-PLAN-STEUERUNG.md -->
  `.claude/hooks/struktur-aktuell.py`: meldet **rot**, sobald eine neu hinzugefügte `FAHRPLAN-*.md`
  **nicht aus `ROADMAP.md` verlinkt** ist — setzt die Plan-Hygiene-Regel durch (jede `FAHRPLAN-*.md`
  muss aus der ROADMAP referenziert sein, sonst steuert sie unsichtbar; CLAUDE.md §14 Ziff. 1). Detail + Etikett-System: **`FAHRPLAN-PLAN-STEUERUNG.md`** (Tor `check:plan` = Etikett-Konsistenz + FAHRPLAN-Verlinkung der referenzierten Dateien).
- **Wissens-/Werkzeug-Infrastruktur** *(QS-WISSEN, `[OF]`, neu 10.7.2026)*.
  <!-- @meta id: QS-WISSEN · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein · fahrplan: FAHRPLAN-NOTEBOOKLM-EINSATZ.md -->
  NotebookLM als **menschen-seitige** Recall-/Recherche-Oberfläche über den stabilen
  LexMetrik-Doku-Korpus (David lädt FAHRPLÄNE/ROADMAP/Register/Dossiers hoch; Quellenzitat je
  Antwort, Audio-Overview). **Kein** Ersatz für die `STRUKTUR.md`-Navigation und **kein**
  In-Session-Query des Assistenten — kein ToS-konformer Consumer-API zum programmatischen
  Abfragen/Bespielen. Schwester zu `[[werkzeuge-zuerst-pruefen]]`. Detailquelle:
  **`FAHRPLAN-NOTEBOOKLM-EINSATZ.md`** (Machbarkeits-Matrix, 6.7.2026). **Status: bereitgestellt**
  — die Notebook-Befüllung selbst ist Davids Handschritt, kein Bau-Auftrag.
- **SEO/A11y** *(SEO-A11Y-GOVERNANCE)*. A11y zahlt auf Bedienbarkeit ein → begleitendes Tor
  <!-- @meta id: SEO-A11Y · status: ready · of: ja · blocker: null · dep: [] · kollision: [public/normtext/register.json, src/lib/seo.ts, scripts/prerender.ts, vercel.json] · worktree: ja · 26x: nein · fahrplan: FAHRPLAN-SEO-A11Y-GOVERNANCE.md -->
  (Tabellen-Semantik, Tastatur-e2e, hreflang). Reines SEO geparkt. **Bedingung der Gleichzeitigkeit:
  eigener Worktree.**
- **Gesetze-Currency & Coverage** *(QS-CURRENCY, `[OF]`, neu 4.7.2026 — Fedlex-Portfolio Paket 1)*.
  <!-- @meta id: QS-CURRENCY · status: wip · of: ja · blocker: null · dep: [] · kollision: [scripts/fedlex-cache.sh, public/normtext/register.json] · worktree: ja · 26x: nein · fahrplan: FAHRPLAN-FEDLEX-PORTFOLIO.md -->
  Kein Bund-Erlass wird veraltet ausgeliefert, keine Currency-Lücke bleibt strukturell
  unsichtbar. Detailquelle **`FAHRPLAN-FEDLEX-PORTFOLIO.md`** (Paket 1, P1-a…d). **Stand 5.7.2026:
  P1-a + P1-b gebaut (dieser PR) — Paket 1 damit komplett (P1-c/d schon in main, PR #142).**
  **P1-b (Monitoring dicht):** Regex-Fix `fedlex-pins.ts` `[a-z_]+`→`[a-z0-9_]+` (11 parser-blinde
  Ziffern-Pins jetzt überwacht, 207→218) + Parser-Selbsttest + Coverage-Assertion (kein gehosteter
  Bund-Volltext ohne Pin, rot bei Verstoss) + PDF-Embed-Pins (EMRK/NYÜ) ins `check:fedlex-versionen`.
  **P1-a (Datenlauf):** 18 überholte Snapshots + 2 PDF-Embeds auf die geltende Fassung gehoben
  (html-N SPARQL-kanonisch via isExemplifiedBy; klv/vrv=8, ssv=14; Artikel-Diff +85, 9 eId-Renames
  1:1, 0 Verlust); `check:fedlex-versionen` **Exit 0 (0 stale)**. Nebenbei zwei Mechanik-Bugs gefixt
  (Golden-`--erlass`-Merge behielt Phantom-Keys; check:pdf-netz notation-Join-Partial-Result).
  Gegenprüfung bestanden. Trailer `Roadmap: QS-CURRENCY`. **Status: `[✓]` (Paket 1 abgeschlossen).**
- **Geräte-Last / Performance** *(QS-PERF, `[OF]`, neu 30.6.2026 — Leitprinzip 7 + CLAUDE.md §15)*.
  <!-- @meta id: QS-PERF · status: wip · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein · fahrplan: FAHRPLAN-PERFORMANCE.md -->
  Lexmetrik soll Computer **nicht merklich langsamer** machen, **ohne Logikverlust** (Treue gewinnt
  immer). Detailquelle: **`FAHRPLAN-PERFORMANCE.md`** (ultracode-Audit 30.6.2026, 25 verifizierte,
  logik-sichere Befunde; adversarial gegen Logikverlust geprüft). Gemessener Anlass: `/gesetze/bund/OR`
  unter 4× CPU Score **42**, **CLS 0,64**; Startseite CLS 0,57. **Empfohlene Reihenfolge:**
  - **a · Tor `check:perf-budget`** — **`[✓]` KOMPLETT (5.7.2026, PR feat/qs-perf-a-b).** Bundle-Teil
    (Chrome-frei, `scripts/check-perf-budget.ts`) war seit 30.6. da; jetzt ergänzt: **`check:perf-lighthouse`**
    (`scripts/perf/lighthouse-budget.ts`) misst CLS/LCP/TBT/TTI/Score auf `/gesetze/bund/OR` + Startseite im
    Lighthouse-**Mobil-Preset (4× CPU + langsames 4G)** und ist als **letzte CI-Stufe** nach Build + allen
    Treue-Toren (golden/smoke/struktur-konsistenz/e2e) verdrahtet → §15-**Gegenkopplung** über die
    Schritt-Reihenfolge (Treue rot ⇒ Job bricht vor der Messung; nicht im schnellen `gate`, der nicht baut).
    **Median aus 3 Läufen** (CI; lokal 1) gegen Ausreisser-Flake. Schwellen an der **CI-Baseline**
    kalibriert (dort läuft das Tor — der 2-Kern-Runner legt unter 4×-CPU echten Spät-Shift/Blocking offen,
    stärker als lokal): CLS OR ≤ **0,15** / Start ≤ 0,10 (Regressions-Fänger, kappt die alte 0,64/0,57 mit
    Marge; FAHRPLAN-Eintritt war 0,25 → Ziel 0,10); LCP/TBT/TTI/Score grosszügige Deckel. **Ist Mobil-Preset:**
    OR CLS lokal 0,005 / CI ~0,10, Score CI ~38–56; Startseite CLS **0,000**. CI-Impact ~2 Min. Verschärfung =
    dokumentierter Folgeschritt nach breiterer CI-Baseline.
  - **b · Billig & verlustfrei zuerst** — **`[✓]` bereits in `main`** (Quick-Win-Batches 30.6./1.7., hier
    nur verifiziert + durch das Tor abgesichert): `React.memo(ArtikelLeser)` + `SektionBaumTOC` (`parts.tsx`),
    token-Mindesthöhen (`min-h-screen` Suspense-Fallback `App.tsx` + Reader-Ladezustand `inhalt.tsx`,
    `min-h-modul-news` `NewsHeader`), Reader-Chunk-Vorladen, `vendor-react`-manualChunks (`vite.config.ts`).
  - **c · M-Daten-Pfad** *(adopt-with-care, golden-gegated)*: OR-Fetch/Struktur-Parse per
    `requestIdleCallback` defern (vollen Parse behalten) · Suchindex (16 MiB) in Web-Worker (bzw. **FlexSearch `export()`/`import()`** — Index build-time serialisieren statt Client-Rebuild, Audit-1-B4; entfällt evtl. via E2-Edge-Suche, `FAHRPLAN-DATENHALTUNG.md` §8) ·
    `register.json` in Bund/Kanton sharden · Snapshot-Format verschlanken (Provenienz-Header-Hoist).
  - **d · Render-/Split-View-Feinschliff** *(zuletzt — nach den Memos marginal)*: TOC stabilisieren,
    `aktArtikel`-Tracker auslagern, Pane-Open-Guard + Such-Debounce, Fallback-Font-Metriken.
  - **e · CLS-Race-Härtung Reader-e2e** — **`[✓]` KOMPLETT (10.7.2026, `fix/cls-race-haertung`).**
    Drei byte-identische, nur unter CI-Parallel-Last reproduzierbare e2e-Rotfälle mit LayoutShift-
    Attribution auf die Wurzel gefixt (§15.2/§15.3), 12-s/CLS-Schwellen UNVERÄNDERT: (1) `verweis-u`
    0,49-CLS = `istXlVp`-Post-Mount-Flip 1→2-Spalten (`inhalt.tsx`, jetzt lazy-`useState` = Client-
    Initialstate gepinnt); (2) `leser-kopf-a9` 0,0001-Mikro-Shift = TOC-Akkordeon-Höhen-ANIMATION +
    spät committende `springeZuSektion`-Zweigöffnung (`parts.tsx` Akkordeon sofort statt animiert;
    `flushSync` + jumpLock 500 ms in `inhalt.tsx`); (3) `norm-sprung` Sprung >12 s = teure 4-MB-
    Artikelsuche blockierte den Sprung-Aufbau (`useUniversalSuche` `useDeferredValue` entkoppelt).
    Golden byte-gleich (nur React-Reader/Such-Hook); 10× lokal grün unter 6× Drossel. Detail:
    STRUKTUR-Karte 10.7.
  - **Constraints:** alles `[OF]`/zeitsperre-konform (Darstellungs-/Lade-/Build-Schicht); **kein**
    DOM-entfernendes Virtualisieren/`hydrateRoot`/Teilparse (Treue-Verlust, verworfen); Snapshot-
    Regenerierung (c) öffnet **keinen** 26×-Slot (nur Format, Union byte-gleich); Worktree-Isolation
    bei `vite.config.ts`/Generatoren/`public/normtext/**` (§12). Trailer `Roadmap: QS-PERF`.
- **Datenhaltung / Single-Source-DB** *(QS-DATA, `[OF]`, neu 2.7.2026 — Council-Entscheid)*.
  <!-- @meta id: QS-DATA · status: wip · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein · fahrplan: FAHRPLAN-DATENHALTUNG.md -->
  Für die Korpus-Inhalte (Normtext · Rechtsprechung · Materialien) wird ein **generator-erzeugtes
  DB-Artefakt die EINE Wahrheit (§5)**; `public/*.json` + prerenderte Seiten sind fortan
  **byte-gleiche Projektion** daraus — nie parallel gepflegt. Amtlicher Arbiter bleiben
  Fedlex/bger.ch (§7 a–d je Zeile); voilaj/swiss-caselaw (CC0) wird KONSUMIERT, nie gescrapt
  (Scraper-Verdikt `FAHRPLAN-OPENCASELAW-QUELLEN.md`). Zwei Dauer-Tore: **`check:paritaet`**
  (Projektion byte-gleich gegen den bisherigen Generator-Output) + **Drift-Tor** (DB-Manifest
  sha/Zeilenzahlen vs. committete Projektion; bestehende `check:*-netz` bleiben Quellen-Arbiter).
  Kuratiertes Schaufenster bleibt prerendert (§15); Long-Tail on-demand inhaltsvollständig (§15 Regel 6).
  Bau-Strang = **W2·6-DATA**; Detailquelle **`FAHRPLAN-DATENHALTUNG.md`**. **Stand 3.7.2026: E0/E0+/E1/E1-Rest-A + E2-Vorarbeiten durch** (E1 = Generator-Flip Bund + Tor `check:datenhaltung`; **E2-Vorarbeiten = hot-FTS build-time [`fts_artikel` external content + `fts_entscheide_schaufenster` standalone, Tokenizer `unicode61 remove_diacritics 2`, HOT-Replika 178 MiB/1 GB] + Such-Query-Modul `scripts/datenhaltung/suche.ts` mit Pagination-by-design + Edge-Funktion `api/suche.ts` [503 ohne Turso]**; **E2-Anbindung ✅ 3.7.2026 = Gruppe «Volltext-Suche (online)» im geteilten `useUniversalSuche`/`SuchResultate` [`src/lib/suche/onlineVolltext.ts`, debounced Fetch, AbortController ~4 s, §8-Offenlegung, ehrliches Degradieren bei 503/Netz/Timeout/200-leer, 5-min-Feature-Cache]**) — **E2 offen NUR: Turso-Hot-Daten laden/synchronisieren [David-Handschritt; Prod-Edge liefert aktuell 200-leer] → dann perf-budget/Payload-Grenz-Test greifen**. **§11.2 Leitfälle-Chips (3.7.2026): das tote `proNormArtikel`-Modell ist verdrahtet — Schaufenster-Shards je Erlass (`public/rechtsprechung/norm-index/<ERLASS>.json`, 19) + `leitfaelleFuerArtikel`-Lazy-Lader + Chip-Zeile im `ArtikelLeser` (Chip → Entscheid + «⧉ daneben öffnen»); Weiche-B-Masse-Anteil «+n weitere (online)» offen bis E2-live.** Details am Schritt W2·6-DATA. Trailer `Roadmap: W2·6-DATA`.
- **Optimierungs-Research Juli 2026 — Betrieb/Frische/Prüf-Tore/FR-IT** *(QS-OPT, `[OF]`, neu 12.7.2026)*.
  <!-- @meta id: QS-OPT · status: ready · of: ja · blocker: null · dep: [] · kollision: [vercel.json, .github/workflows/normen-monitor.yml, src/lib/normtext/laden.ts] · worktree: ja · 26x: nein · fahrplan: FAHRPLAN-OPTIMIERUNG-2026-07.md -->
  Kritik-gefilterte Ablage des allgemeinen Ultracode-Optimierungs-Research (Auftrag David
  12.7.2026; 0 Befunde widerlegt, 2 Prämissen veraltet). Detailquelle
  **`FAHRPLAN-OPTIMIERUNG-2026-07.md`**: **O-1 Betrieb & Wachhund** (sofort baubar: CSP-Fix
  LiveSuche [Prod-Feature empirisch tot], Prod-Smoke + alle 10 Netz-Tore im Normen-Monitor,
  Soft-404-Rewrite-Ausnahmen, Case-Redirect, LIK-Freshness-Tor, `laden.ts`-Fehler-Cache,
  Zefix/geo-Vertragstests; `/api/fehler` = Mini-Gate Datenschutztext) · **O-2 Frische-Automatik**
  (sofort baubar, Verortung QS-CURRENCY/QS-DATA; **terminkritisch: Batch-Re-Pin vor dem
  1.8.-Berg — 10 Erlasse fällig, check:verfall-Vorlauf läuft**; einmaliges David-Rahmen-Gate
  für unbeaufsichtigte Repair-PRs + Turso-CI-Secret) · **O-3 Prüf-Tore** (Golden-Matrix
  prozesskosten/beurkundung/grundbuch/notariat = grösster Rechen-Blindspot →
  waitForTimeout-Abbau+Flake-Telemetrie → e2e-Sharding → erst dann e2e-Masse) ·
  **O-4 FR/IT-Zugang** (sofort: Alias-Tabelle CO/CC/CP/LP, FR|IT-Chips; klein-Gate David:
  DE-Filter der BGer-Pipeline heben) · **O-5 SEO-Nachträge** (GEPARKT, als §10 in
  `FAHRPLAN-SEO-A11Y-GOVERNANCE.md` einsortiert) · **O-6 Werkzeug-Empirie** (DAVID-GATE §0a,
  als Notiz-Block in `KATALOG-ROADMAP.md` §D verortet). **Nur Plan — kein Bau in diesem Schritt.**
- **Basis-Ausbau — Fundament-Handlungsplan** *(QS-BASIS, `[OF]`, neu 17.7.2026)*.
  <!-- @meta id: QS-BASIS · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein · fahrplan: FAHRPLAN-BASIS-AUSBAU.md -->
  Kritik-gefilterte Ablage des Ultracode-Fundament-Research (Auftrag David 17.7.2026: «was ich an der
  Basis von LexMetrik verbessern kann»; 5 Miner + 3 Fable-Strategen + Fable-Judge, dedupliziert gegen den
  Plan-Bestand nach §14). Detailquelle **`FAHRPLAN-BASIS-AUSBAU.md`** — 12 B-Einheiten (Wirkung÷Aufwand):
  **B-1** Betreiber-Identität (DS-Platzhalter + Impressum) · **B-2** Off-site-Backup + Restore-Probe für
  `daten/` (6,9 GB, heute **null Backup** = höchstes Einzelrisiko) · **B-3** Bund-Currency-Kette vor dem
  **1.8.-Verfall-Berg** (terminkritisch; Prämisse P1-a/b evtl. schon ✅, vor Bau festnageln) · **B-4** Domain
  `lexmetrik.ch` registrieren (Entscheid; Umzug bleibt SEO-A11Y W3.4) · **B-5** VPS-Bestell-Dossier +
  Blocker-Zeile (Serving = QS-DATA) · **B-6** Stand-Ausweis (Fassung/Abruf/Permalink) in jeder Kopie/Export ·
  **B-7** öffentlicher Determinismus-Nachweis auf `/methodik` (maschinell, nie fachlich) · **B-8**
  Kantons-Currency-Wachhund + FR/IT-Sprach-Label-Fix · **B-9** append-only Fassungs-Archiv (nach B-2) ·
  **B-10** Permalink-Beständigkeits-Vertrag (nach B-4) · **B-11** Prod-Watchdog (Delta zu QS-OPT O-1, +
  PR #244) · **B-12** Merge Queue (zuletzt, nach O-3.2/O-3.3). **David-Gates getrennt** (G1–G7, fachzeit-arm,
  ein ~30–45-Min-Block: Betreiber-Identität · Backup-Ziel · Domain · VPS · Turso-Env · Monitor-Konto ·
  Merge-Queue-OK). **Nur Plan — kein Bau in diesem Schritt;** Bau je Einheit nach Priorität bzw. David-Signal.
  Trailer `Roadmap: QS-BASIS`.

---

## ⚡ S0 — fristgetrieben (FRIST 30.6.2026) — ✅ gebaut + gegated 28.6.2026 (live 2.7.2026, Deploy a3769d72)
<!-- @meta id: S0 · status: done · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->

**Verfallsregister mechanisch.** `check:verfall` muss den am 30.6. ablaufenden SG-GKV-Tarif +
die weiteren datierten Verfälle (s. «Pflege & Termine») erfassen und auf einer benannten UI-Fläche
sichtbar machen. `[OF]`. «Sichtbar» = verhaltensändernd → golden-gegated; bis 30.6. realistisch
**gebaut + gegated**, Live erst im Batch-Deploy-Fenster.

> **Erledigt 28.6.2026 (gebaut + gegated, deployt 2.7.2026):** geteilte Parse-Grammatik
> (`scripts/verfall-parse.ts`) für `check:verfall` + `gen:verfall`; Drift-Tor `check:verfall-ui`;
> UI-Fläche «Aktualität & Pflege der Parameter» auf `/methodik`. **Chronik:** `ROADMAP-CHRONIK.md` → S0.

---

## Die geordnete Abarbeitung (DAS ist der Plan)

> Reihenfolge nach Praxis-Hebel × Machbarkeit ohne Fachzeit × Abhängigkeiten. Alles `[OF]`, sofern
> nicht vermerkt. Details + Bau-Auflagen je Werkzeug: «Funktions-Katalog» unten + jeweilige `FAHRPLAN-*.md`.

> **⬆ OBERSTER OFFENER SCHRITT (Priorisierung David 10.7.2026): `QS-TOK` Token-Ökonomie des
> Agenten-Baus.** Wortlaut David (Chat 10.7.2026): «oberster schritt soll sein den token verbrauch
> zu minimieren.»
> <!-- @meta id: QS-TOK · status: ready · of: ja · blocker: null · dep: [] · kollision: [package.json, scripts, .claude, CLAUDE.md, ROADMAP.md, STRUKTUR.md] · worktree: ja · 26x: nein · fahrplan: FAHRPLAN-TOKEN-OEKONOMIE.md -->
> Bau verbraucht **weniger Tokens** — nur über Effizienz (gezielter lesen, kompakter übergeben,
> deterministisch statt modellgetrieben, cachen, indizieren); Einmal-Investitionen ok.
> **Leitplanke (nicht verhandelbar):** keine Massnahme kürzt Beweis, Tor oder Prüfung —
> Gegenprüfung/Doppel-Verifikation/iterative Bug-Checks/golden byte-gleich bleiben unangetastet.
> Detailquelle [`FAHRPLAN-TOKEN-OEKONOMIE.md`](FAHRPLAN-TOKEN-OEKONOMIE.md) (ultracode-Audit
> 10.7.2026, Pakete P0–P5). **Start = P0/T2 Token-Baseline (Messung zuerst)**, dann Pakete in
> Plan-Reihenfolge. Die Reader-Kette **W2·5d U-POSITION → U-PDF** ist danach der nächste
> Feature-Schritt.

> **■ Auftrags-Eingang 30.6.2026 (David) — §14 gebündelt + verortet.** 13 Aufträge, alle `[OF]`
> (reine Darstellung oder amtliche Daten, keine Davids-Fachzeit). **Risiko-Klassen getrennt halten**
> (§14.2: reines UI ≠ Daten/Pipeline ≠ §1-nahe Verweis-Logik — nicht in EINEN Commit mischen). Daten-/
> Verweis-Pfade ⇒ adversariale Gegenprüfung (`QS-GP`) + golden byte-gleich.
>
> **Bündel R · Gesetz-Reader-Lesesteuerung → Schritt 5b** *(reine UI, eigener Worktree, golden-neutral):*
> - **R1 Scroll-Spy:** mitscrollender **Kopf UND Gliederung** markieren den **zuoberst im Viewport
>   angeschnittenen** Artikel, nicht einen mittigen (`gesetz-leser/`, eine „aktiver-Artikel"-Bestimmung).
> - **R2 Gliederung links auch auf kleineren Laptops:** Schwelle `istXl` (~1280px) in
>   `gesetz-leser/inhalt.tsx` ~Z.754 senken → linke TOC grundsätzlich, nur bei echt-zu-klein in den
>   Drawer. Wechselwirkung `PANE_BREIT_PX` + `max-w-reading` prüfen. (Quer zu Schritt 14 Responsive-Audit.)
> - **R3 Schriftgrösse +/− statt «Kompakt/Breit»:** Breiten-Umschalter (`Topbar.tsx` Z.54–62 +
>   `useInhaltsbreite.ts`, localStorage) durch **+/−-Schriftgrössen-Steller** ersetzen (persistent,
>   §13-Tokens/rem-Faktor, keine `text-[..px]`). Global (Topbar) → trifft alle Seiten.
>
> **Bündel N · Normtext-Fidelity/Verweise → Schritt 5b (Extraktor-Härtung, L0) bzw. Schritt 6:**
> - **N1 Zerrissene Artikelnummer** «Artikel 7 b»→«7b» (auch «43 a», «28–28 b», «14 a», «1 bis»):
>   Muster `Art. <zahl> <buchstabe>` in **111/218 Bund-Erlassen** (steht im Block-/items-`text`).
>   Fix am **Generator/Extraktor** (§7 kein Hand-Edit), Quelle-vs-Extraktion bestätigen
>   (`scripts/fedlex-cache.sh`). **§1/§2:** keine blinde Zahl-Leer-Buchstabe-Regex (echte «1 a)»-Listen).
>   *Daten/Pipeline → golden + `QS-GP`.* Bsp. David: Art. 7e ATSV; Art. 16/14a BetmKV.
>   **Ursache (Probe 30.6.):** Quelle hat `7<i>b</i>` (kein Leerzeichen, b kursiv) — unser Extraktor
>   fügt das Leerzeichen beim Strippen der Inline-Tags `<i>`/`<sup>` selbst ein. Fix = **kein Whitespace
>   zwischen Ziffer und Inline-getaggtem Buchstaben/`bis`/`ter`** (gilt für HTML *und* XML, kein Quell-Wechsel).
> - **N2 Falsche Verweis-Auflösung** *(§1-NAH, heikler):* interner Artikel-Link zeigt auf den
>   **aktuellen** Erlass, obwohl ein anderer genannt ist (Bsp.: «Artikel 14a … BetmG» in BetmKV Art. 16
>   → Klick landet bei Art. 14a der BetmKV statt im BetmG). Resolver ignoriert die nachgestellte
>   Erlass-Abkürzung. Nähe `norm-link`/`fntext-links`/`NormChip`. *Erst Häufigkeit messen, dann fixen;
>   golden/Tests + `QS-GP`.*
>   **Befund (Probe 30.6.):** das ELI-Verweisziel steht **schon im HTML** (`<a href="…/eli/…">`, 19 in
>   BetmKV, identisch im XML, z.B. StGB) — der Resolver liest es nur nicht. Fix = **Ziel lesen statt raten**
>   (erlass-genau; `#art` selbst auflösen). **Geschwister von M12** → Verweis-Chips als Feature.
>
> **Quell-Architektur-Entscheid (Council 30.6.2026) → Detail `FAHRPLAN-NORMTEXT-DARSTELLUNG.md
> §Quell-Architektur-Entscheid`, Memory `lexmetrik-akn-xml-architektur-entscheid`.** N1/N2 sind **Phase 0**
> (jetzt, variantenunabhängig) zusammen mit einem **asymmetrischen Verifikations-Tor** (Containment: jedes
> Quell-Wort verbucht → fängt stille Drops + Struktur-Invarianten) + **Status-Marker** (in Kraft/aufgehoben/
> noch-nicht-in-Kraft). Der **HTML→AKN-XML-Wechsel ist Phase 1** — inkrementell über den Drift-Zyklus, **nie
> Big-Bang** (B «XML direkt rendern» verworfen); empirisch freigegeben (eId 99,7 % stabil über Konsolidierungen,
> DE/FR/IT ~95–99 % ausgerichtet) → schaltet `#art`-genaue Chips, ELI-Zitations-Graph, M15 (DE/FR/IT) und
> M16 (Point-in-Time) frei.
>
> **Bündel B · Rechtsprechungs-Leser → Schritt 6 / W2·6-BGE:**
> - **B1 BGE ohne «vollständiges Urteil»** (Bsp. BGE 152 V 2): `azaUrteil:null` + kein
>   `auszugAbschnitte` ⇒ `switcherSichtbar=false`, Ansicht fest auf «Auszug». **12/272 BGE** betroffen
>   (151_I_73, 151_III_336, 152_V_20, 152_V_2, 150_I_183, 151_V_30, 151_I_41, 150_II_334, 151_II_475,
>   151_V_100, 151_IV_316, 151_II_710). *Daten/Pipeline (AZA-Resolver, vgl. W2·6-Id-Disambiguierung) → `QS-GP`.*
> - **B2 Regeste wie amtlich:** **Absätze + massgebliche Artikel FETT**. Heute `regeste.text` flacher
>   String ohne `\n`/Markup → Struktur **aus der Quelle nachextrahieren** (kein Raten, §1/§2). *Daten/
>   Pipeline → `QS-GP`; Geschwister von B1 (gemeinsamer Korpus-Re-Lauf denkbar).*
> - **B3 Sticky-Kopf überdeckt Body** im Entscheid-Leser (Screenshot BGE 152 I 65): Hintergrund nicht
>   deckend / z-index / scroll-margin in `EntscheidLeser.tsx`. *Reine UI (§13-F) — eigener Commit, NICHT mit B1/B2.*
>   ✅ **10.7.2026 — bereits behoben, empirisch verifiziert** (kein neuer Code nötig): Der U-KOPF/Split-
>   View-Refactor (Commit `60988318`) hat alle drei Kandidaten geschlossen — Block zu **EINEM** sticky-
>   Element konsolidiert, `top`-Offset von `top-16`→`calc(4rem + 2.25rem)` (sitzt jetzt UNTER dem
>   InhaltsKopf-Breadcrumb statt ihn zu überdecken), opaker `bg-paper`, `z-[15]` (< Topbar `z-20`,
>   > Breadcrumb `z-10`), `scroll-margin-top:var(--rsp-stick)` = 12.75rem. Playwright-Beweis 152 I 65
>   (Desktop 1280 + Mobil 390, Light+Dark, 3 Scroll-Stände, alle 3 Sprung-Chips, beide Tab-Fassungen):
>   **0 Overpaint**, Sprung-Ziele landen sichtbar unter dem 185/193px-Kopf; die alte `top-16`-Fassung
>   reproduziert den Überdeckungs-Defekt (Breadcrumb verschwindet). Golden byte-gleich (Doku-only).
>
> **Bündel S · Split-View → Schritt 14** *(SPLIT-VIEW, eigener Worktree):*
> - **S1 Breadcrumbs in der Pane:** `InhaltsKopf.tsx` Z.30 nutzt globalen Router-`<Link to>` → zielt
>   aufs Hauptfenster statt in die autonome Pane. Fix über `PaneKontext`-Navigator.
> - **S2 Tracker «alles schliessen» schliesst auch Panes:** Panes leben in `usePaneLayout`
>   (localStorage `lexmetrik-panes`), separater Store von den Tabs → Close-all muss `usePaneLayout`
>   mit-resetten. *(S1+S2 bündeln, gleiches Subsystem.)*
>
> **Einzeln:**
> - **I1 Seitenleisten-/Rubriken-Reihenfolge** → **✅ gebündelt in W2·5c (3.7.2026):** `navigation.ts`-
>   SSoT-Array auf **Gesetze → Rechtsprechung → Materialien → Rechner → Vorlagen** — Bau im
>   Plumbing-Schritt von `FAHRPLAN-STARTSEITE-V3.md` §10 (treibt Sidebar UND Startseiten-Kacheln).
> - **I2 Branding-Neuausrichtung** → **✅ gebündelt in W2·5c (3.7.2026):** das geforderte
>   **Messaging-Konzept ist erledigt** (Ultracode-Recherche + DMAD-Council, gegen «nicht nach KI
>   klingen» geprüft; Wortlaut + SSoT-Architektur `seo.ts`→Projektionen + Tor `check:seo-index` in
>   `FAHRPLAN-STARTSEITE-V3.md` §6, Herleitung `bibliothek/recherche/startseite-v3-design.md`);
>   Ausrollen = Bausequenz-Schritt 1 des W2·5c. *(Ursprünglicher Auftragstext:)* weg von
>   «Berechnen statt KI» → **KI-freies Übersichtstool über amtliche Quellen, inkl. Rechner + Vorlagen**;
>   «KI-frei» als Vertrauensmerkmal (positiv), nicht als Headline. Surfaces ohne SSoT (§5-Geruch,
>   mitkonsolidieren): `index.html` (title/meta/og/twitter), `seo.ts` (`SITE_TITEL`/`SITE_DESCRIPTION`/
>   Route-Beschreibungen/`/methodik`), `Startseite.tsx` Hero, `KatalogHinweis.tsx`. **Deliverable:
>   Messaging-Konzept zuerst** (brainstorming/council, gegen «nicht nach KI klingen» geprüft), DANN
>   ausrollen + auf EINE SSoT ziehen (`seo.ts` Quelle, `index.html` daraus). Doks-Wording
>   (ROADMAP/PROJEKTBESCHRIEB «deterministisch statt KI-geschätzt») **✅ nachgezogen (5.7.2026,
>   W2·5c-Rest):** `Methodik.tsx`-Abschnittstitel umgestellt, Erinnerungs-Marker aufgelöst.
>
> **Merker Startseiten-Überarbeitung: ✅ entparkt 3.7.2026 → Schritt W2·5c** (Ultracode-Recherche
> + bindendes Council-Verdikt liegen vor; Redesign-zurückgestellt 16.6. + FUNDAMENT-Startseitenrahmen
> dort abgeglichen).

### Welle 1 — Kern: Norm → Werkzeug → Schriftsatz + die Alltags-Klingen

- [x] **1 · Begründungs-Absatz** *(BEGRUENDUNGS-ABSATZ, ~5 %)*. Kopierfertiger, normgestützter Absatz (UI+PDF), jeder Wert mit Norm+Link+Stand; schliesst die Rückrichtung Werkzeug→Norm. **Chronik:** `ROADMAP-CHRONIK.md` → W1·1.
  <!-- @meta id: W1·1 · status: done · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein · fahrplan: FAHRPLAN-BEGRUENDUNGS-ABSATZ.md -->
- [x] **2 · Norm↔Werkzeug-Brücke** *(RECHTSSAMMLUNG P4/D1)* — Index-Teil erledigt 28.6.2026 (gegated, deployt 2.7.2026): `werkzeugeFuerNorm` + `ERLASS_WERKZEUGE` + Konsistenz-Tor; «N passende Werkzeuge»-Hinweis auf der Erlass-Karte. **Chronik:** `ROADMAP-CHRONIK.md` → W1·2.
  <!-- @meta id: W1·2 · status: done · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->
- [x] **3 · Alltags-Rechner als Cockpits** *(neu-Verpackung vorhandener Engines, `[OF]`)* — abgearbeitet 28.6.2026: Streitwert-Grenzwert-Abgleich neu gebaut (gegated, deployt 2.7.2026); Zuständigkeits-Navigator + Rechtsmittelprüfung bestanden bereits (kein §5-Duplikat); Fristen-Cockpit zurückgestellt (S-5c-Konflikt). **Chronik:** `ROADMAP-CHRONIK.md` → W1·3.
  <!-- @meta id: W1·3 · status: done · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->
- [ ] **4 · Prozesskosten-Cockpit Restbau** *(PROZESSKOSTEN-COCKPIT, Hauptmoat)* — **GEPARKT 1.7.2026, 26×-Slot FREI.**
  <!-- @meta id: W1·4 · status: parked · of: ja · blocker: wbqdyap3x · dep: [] · kollision: [] · worktree: nein · 26x: nein · fahrplan: FAHRPLAN-PROZESSKOSTEN-COCKPIT.md -->
  **I4 ✅** (1.7.2026): `kriterien`/`kriterienNorm` auf `KantonalerTarif` — Bemessungskriterien je
  Tarif (25 GK + 26 PE, Kanton × GK/PE frisch am amtlichen Erlass extrahiert, §7-belegt in
  `bibliothek/register/bemessungskriterien-tarife-kantone.md`), Anzeige im Ermessensrahmen-Block bei
  Spanne (§8); GR gk ohne Kriteriennorm → generischer Fallback. Adversariale Gegenprüfung (QS-GP,
  2 Opus-Agenten): 1 Fund korrigiert (OW pe Art. 4a→Art. 32), 4 Titel-Korrekturen bestätigt. Golden
  byte-gleich (Engine liest kriterien nicht). **I9-Rest ✅**: Notariats-/Grundbuch-Querverweis im
  Cockpit. **I2 bleibt blockiert** (⟵ Recherche `wbqdyap3x`: Schlichtungs-/Reduktions-/
  Rechtsmittel-Modifikatoren). Festsetzung/Dispositiv → Welle 2. **26×-Slot damit frei** →
  Voraussetzung für Welle 3 · Schritt 12 erfüllt.

### Welle 2 — Griff (Auffindbarkeit) + Konsultieren + mehr Klingen

- [~] **5 · Auffindbarkeits-Schicht** *(ein Index → mehrere Oberflächen)*. **Zweiachsiger Einstieg
  <!-- @meta id: W2·5 · status: wip · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->
  (Rechtsgebiet × Aufgabe)** ✅ **28.6.2026 (gegated, deployt 2.7.2026):** `einstiegMatrix()`
  (`src/lib/einstieg.ts`) projiziert den Katalog (§5) auf Rechtsgebiet × Aufgabe; Komponente
  `ZweiachsigerEinstieg` als zweite Achse auf `/rechner` (aufklappbare Gebiets-Kacheln, Werkzeuge
  nach Aufgabe gruppiert, nur verfügbar §8). Konsistenz-Tor `einstieg.test.ts`. Visuell bestätigt.
  **Globale Artikel-Volltextsuche** ✅ **28.6.2026 (David: «FlexSearch ja»; gegated, deployt 2.7.2026):**
  FlexSearch über alle **24 183 Bund-Artikel** (`bloecke`-Text), in DIE bestehende Suche integriert
  (neue Gruppe «Gesetzestext», `universalSuche`/`useUniversalSuche`, §5 ein Such-Workstream). Index
  build-time generiert (`gen:suchindex` → `public/such-index/`, gitignored, im `build`), lazy + eigener
  Chunk (FlexSearch 17 kB gz, NICHT im Haupt-Bundle — Task 4.4); Lib+Index ~4 MB gz erst auf erste
  Suche. Zitat-/Term-Suche stark («243 ZPO» → Art. 243 ZPO; Notwehr→Art. 16 StGB), Deklinations-
  Phrasen unscharf (§8-ehrlich). Snippet + Sprung `#art-`. Visuell bestätigt.
  **Offen:** Kanton-Volltext im Index nachziehen · ~~Startseiten-Modul-Rahmen~~ → **wird in W2·5c
  gebaut** (Modul-Registry, `FAHRPLAN-STARTSEITE-V3.md` §4 — FUNDAMENT-Vorleistung).
- [~] **5b · Reader-Darstellung Bund** *(GESETZESDARSTELLUNG-BUND, `[OF]`, eigener Worktree)* —
  <!-- @meta id: W2·5b · status: wip(reader-wt) · of: ja · blocker: null · dep: [] · kollision: [src/pages/gesetz-leser/inhalt.tsx, src/pages/gesetz-leser/parts.tsx, src/components/normtext/ArtikelBody.tsx] · worktree: ja · 26x: nein · fahrplan: FAHRPLAN-GESETZESDARSTELLUNG-BUND.md -->
  konsolidierter QA-Sweep der **Bund-Gesetzesdarstellung** (29.6.2026): 11 Defekt-/Ausbau-Punkte
  (Präambel-Fussnoten · Fussnoten einheitlich erst auf Klick · Randtitel-/Gruppierungslinien je
  Gesetz + Umschalter · Suche↔Gliederung responsiv + kompakt zum Header · Verweis ZGB→BVG via
  ELI/`data-rs` · Treffer-Highlight · Sprung-Offset nach Suche · aufgehobene Artikel bündig ·
  **Tabellen-Regelwerk T-A…T-F seitenweit** · Verweis-Popup + Artikel-Bezeichnung) unter der
  **Leitlinie L0** «Extraktor strukturerhaltend härten statt pro Gesetz patchen» (Fedlex-HTML
  empirisch einheitlich, verifiziert 29.6.). **Plan = `FAHRPLAN-GESETZESDARSTELLUNG-BUND.md`**
  (4 Batches: A Extraktor/Pipeline konfliktfrei zuerst → B Render zuletzt, **Split-View-Konflikt auf
  `ArtikelBody.tsx`** abstimmen → C Suche/Layout → D Popover). **Auflagen:** zuerst nur Bund;
  **Renderer abwärtskompatibel** (Kanton-Altdaten nicht brechen); golden byte-gleich + §6.3;
  neuer `check:tabellen`-Validator. Tabellen-Detail quer in `FAHRPLAN-TARIF-TABELLEN-STUFE2.md`,
  Layout/a11y in `DESIGN-REGLEMENT-NORMTEXT.md`, Popover in `FAHRPLAN-GESETZESTEXT-POPUP.md`.
  - **+ Auftrags-Eingang 30.6.:** **[x] Bündel R ✅ FERTIG + LIVE** (PR #59 `0560fd87`, prod-verifiziert 30.6.
    via Perf-Deploy): R1 Scroll-Spy Kopf+Gliederung · R2 Gliederung links ab 1024 px · R3 A−/A+ Schriftgrösse
    statt Kompakt/Breit. **[x] Bündel N ✅ FERTIG (1.7., Worktree, gegated — deployt 2.7.2026):**
    **N1** zerrissene Artikelnummer «329 g»→«329g» am Extraktor (`entferneTags` strippt Inline-Tags
    leerzeichenlos, Ziffern-sup/sub behalten Abstand; 194 Bund-Snapshots regeneriert, golden byte-gleich,
    Opus-Gegenprüfung BESTANDEN). **N2** falscher Self-Link auf benanntes Fremdgesetz unterdrückt
    (`fremdgesetzNachArtikel`, ~1195 Fälle, render-only; §7-Abweichung: ELI-Ziel steht NICHT im HTML-Body
    → erlass-genaue Chips = Phase-1-Folge; Gegenprüfung fand+fixte FinfraV-FINMA-Kürzel-Regression).
    **+ Verifikations-Tor** `check:invarianten` (Markup-/Entity-/Suffix-Leak). **+ Status-Marker:
    empirisch schon erfüllt** (aufgehoben = «· aufgehoben»-Statuszeile + Einklappen; noch-nicht-in-Kraft
    kommt bei current-consolidation-Pinning nicht vor) → §7-dokumentiert, kein Neubau. Details Eingangsblock.
  - **+ 2.7.: Verlässliche-Umwandlung-Spec (Fable-Ultracode) + Phase-1-Fundament-Batch.** Spec
    `docs/superpowers/specs/2026-07-02-verlaessliche-normtext-umwandlung-bund.md` (Verdikt Hybrid «XML-Träger,
    HTML-Arbiter»; verlinkt aus `FAHRPLAN-NORMTEXT-DARSTELLUNG.md §Quell-Architektur`). **[x]** erster Bau-Schritt
    rein HTML gebaut+gegated+gegenprüft: **P2** Split-sup-Merge (6 Blöcke: GEBV/HMG×2/KLV/CO2/VRV), **P4**
    SSV-Kachel-379-Leak, **P1** sha deckt `mehrspaltig.spalten`, **P5** `[tab]`-Negativ-Lexikon (Expected-Fail-Register).
    **[x] P3** Drop-Klasse laut ✅ 5.7.2026 (W2·5b-Restblock, s.u.). Detail STRUKTUR-Karte 2.7. + Spec §7.
  - [x] **+ Audit-Andockung 3.7.2026 (Audit 1, `BACKLOG-AUDIT-WERKZEUGE-2026-07.md`):** **N3 · `he` statt
    Handtabelle ✅ 3.7.2026** (Branch `feat/nulltarif-werkzeuge`: Ergebnis BESSER als erwartet — Bund-Regen aus
    gepinnten Caches **0-Byte-Diff** (golden-neutral; die `&ge;`/`&le;`-Klasse sitzt in Kanton-Quellen und
    greift bei deren nächstem Regen); einzige Divergenzen der Alt-Tabelle: `&nbsp;`/`&mu;` als dokumentierte
    Sonderfälle BEHALTEN, `&ldquo;`/`&rdquo;`-ASCII-Abflachung als deklarierte Korrektur auf WHATWG (Korpus-Impact
    heute null); Beleg `bibliothek/register/he-entity-korrekturen-2026-07-03.md`, QS-GP-Quittung).
    **✅ W2·5b-Restblock KOMPLETT 5.7.2026 (Worktree `feat/w25b-l0-haertung`, alle vier Posten):**
    **P3 Drop-Klasse laut ✅** — korpusweite `<p>`-Klassen-Inventur (218 Erlasse/24 602 Artikel,
    `p3-drop-inventar.ts`): Verdikt je Klasse in `bibliothek/register/p3-drop-klassen-inventar-2026-07-05.md`;
    EXTRAHIERT: standalone `man-template-tab-krpr` (OR art_361/362 = 28+61 Vorschriften-Zeilen inkl.
    aufgehobener «…»-Platzhalter, VRV 8
    Verweis-Noten; neue Block-Alternative 7) + bare `class="referenz"`→`grundlage` (347 Trägernorm-Verweise
    in ATSV/FZV/BankV/FINIV/FinfraV/ArGV5; Regex `\breferenz\b` deckt beide Formen); BEWUSST IGNORIERT
    (belegt): inkrafttreten/abstand1seite/tab-utit-Titel/tab-kpf/italic-Note; DEFERIERT (dokumentiert):
    absatz-pt-Varianten (ParlG-Eid, UVPV 13 III/IV) + GBV-34i-Textformel. **Stille Drops sind LAUT:** neues
    Tor **`check:p-klassen`** (Manifest entschiedener Klassen; jede neue Fedlex-Drop-Klasse bricht das Tor).
    **N3-B1 `he`-Entities ✅** — war schon 3.7. gelandet (Commit `50fd4e15`, main): Bund-Regen 0-Byte-Diff,
    Sonderfälle `&nbsp;`/`&mu;` dokumentiert BEHALTEN; hier verifiziert, kein Rest offen.
    **linkedom-POC ✅ GEMESSEN, Verdikt: KEINE Migration** — 9 562 `<dl>`- + 35 178 `<dd>`-Grenzen über den
    ganzen Korpus: **0 Abweichungen** Regex-Tiefenzähler vs. DOM (linkedom devDep nur für den POC;
    `poc-linkedom-tiefenzaehler.ts`, Beleg `bibliothek/register/poc-linkedom-tiefenzaehler-2026-07-05.md`) —
    Regex ist DOM-äquivalent, Umbau wäre verhaltensneutral = nur Risiko/Laufzeit ohne Gewinn (§7-Messpflicht
    erfüllt; E0/E1 bauen bewusst auf dem BEWIESENEN Parser). **SVG-style-Leak ✅** — `<style>/<script>`-
    Element-INHALT wird vor dem Tag-Strip entfernt (`NICHT_TEXT_ELEMENTE`); SSV-Signalkatalog-Kacheln von
    «.cls-1 { fill: #010101; }»-CSS bereinigt (5 Stellen, Signal-Nr/Name/Artikel vollständig erhalten;
    einziger `<style>`-Träger im Korpus). Daten-Regen 9 Erlasse (OR +4 713 Z., VRV +409 Z., 6 VO +348
    grundlage, SSV −CSS), golden klassifiziert-additiv, Engine-Golden byte-gleich, QS-GP-Quittung.
- [x] **5c · Startseite V3 + Branding I2** *(STARTSEITE-V3, `[OF]`, eigener Worktree; Auftrag David 3.7.2026)*. ✅ GEBAUT 3.7.2026 — Bausequenz S1–S5 komplett (PRs #106/#107/#108/#111 + S5 Brass-Hero; golden 201 byte-gleich, e2e 89, Kontrast gemessen) + Zuletzt-Tracker Gesetz-/Entscheid-Titel; bündelt I1/I2 + Startseiten-Modul-Rahmen. Rest offen (kein Blocker): Wash-Ton-Veto `bg-surface`-Fallback in `Hero.tsx`. Spec `FAHRPLAN-STARTSEITE-V3.md`. Trailer `Roadmap: W2·5c`. **Chronik:** `ROADMAP-CHRONIK.md` → W2·5c.
  <!-- @meta id: W2·5c · status: done · of: ja · blocker: null · dep: [] · kollision: [src/pages/Startseite.tsx, src/components/start, src/lib/navigation.ts, src/lib/seo.ts, index.html, tailwind.config.js, src/components/layout/Topbar.tsx, scripts/prerender.ts] · worktree: ja · 26x: nein · fahrplan: FAHRPLAN-STARTSEITE-V3.md -->
- [ ] **5d · Gesetzes-UX & Darstellungs-Reglement** *(GESETZES-UX, `[OF]`, eigener Worktree; Auftrag David 4.7.)*:
  <!-- @meta id: W2·5d · status: ready · of: ja · blocker: null · dep: [W2·5c] · kollision: [src/pages/gesetz-leser/parts.tsx, src/pages/gesetz-leser/inhalt.tsx, src/components/normtext/ArtikelBody.tsx, src/lib/normtext/register.ts, src/components/suche, scripts/normtext] · seq-hart: [QS-PERF(ArtikelBody.tsx)] · seq-weich: [W2·5b-L0(scripts/normtext, nur U-PDF)] · worktree: ja · 26x: nein · fahrplan: FAHRPLAN-GESETZES-UX.md -->
  UX/Lesbarkeit des Gesetz-Lesers auf State-of-the-Art heben (Fedlex =
  Mindestlatte). **EINE Linien-Sprache** (3 benannte Rollen `--guide-gliederung`/
  `--rule-artikel`/`--rule-struktur` statt 4 Ad-hoc-Opazitäten; max 1 Guide,
  Tiefe über Einzug — Semantik-Refactor, kein Farb-Bug), Lesespalte hart auf
  `max-w-reading` (Mobil-Fix ~16→≥40 ch), **Leser-Kopf Options-Leiste**
  (Linien/Fussnoten/Verweise; Fussnoten-«AUS» dämpft nur, versteckt keine
  amtliche Substanz; §15 nur-visuell/golden byte-gleich in G2a), **je Grundart
  eine Designvorschrift** (8 Grundarten aus `erlass-klassifikation.json` →
  Register-Feld `grundart`, Pflicht + Tor `check:grundart`; Kanton-§-Label ≠
  Anker: `#art-` bleibt). Übersichten Bund/Kanton entrümpelt + Cmd/Ctrl-K-Einstieg
  auf dem BESTEHENDEN Suchindex (Artikel in ≤2 Interaktionen) +
  **Rechtsgebiets-Sicht als Gerüst** (Auto-Grundgerüst jetzt, Vollkuration nach
  Abnahme-Zeitsperre). **Sequenzieren:** hart gegen V1c/V1b (parts.tsx), weich
  gegen M5 (KontextPanel, nur G2); V1a erledigt. Etappen G0/G1/G2a/G2b/G3a/G3b/
  G4/G5/G6, Tore `check:grundart`/`check:linien-kanon`/`e2e/leser-lesemass` +
  bestehendes `check:perf-budget`; G3b (Anhang/Tarif-Extraktion) ist Risiko-Pfad
  mit `check:gegenpruefung`. Detail: **`FAHRPLAN-GESETZES-UX.md`**. Trailer `Roadmap: W2·5d`.
  **Stand 4.7.2026:** **G0** (Grundart-Register/`check:grundart`) **und G1**
  (Linien-Kanon 3 Rollen-Tokens + `max-w-reading` + Einzug-Skala/Mobil-Kollaps +
  `hyphens:manual` + Randtitel-Hänge-Einzug; Tore R1 `check:linien-kanon` /
  R2 eslint / R4·R5 e2e; Reglement-Falt in `DESIGN-REGLEMENT-NORMTEXT.md §4b`;
  Wortlaut + Engine-Golden byte-gleich) **gebaut**. **G2a** (Leser-Options-Leiste
  Linien/Fussnoten/Verweise als reine `data-*`/CSS-Toggles am `<html>`,
  localStorage + Pre-Paint via `main.tsx` CSP-konform ohne Inline-Script;
  `leserOptionen.ts` + `LeserOptionenLeiste.tsx`; R6 golden byte-gleich bewiesen
  [`golden:vergleich` IDENTISCH 201], R9 Fussnoten-«AUS» dämpft/versteckt nie
  [e2e]; global = beide Reader-Instanzen synchron ohne Re-Render §15) **gebaut**.
  Bewusste G2a-Grenze: Linien-Default global AN (grundart-abhängiger Default =
  G2b, `grundart` nicht auf `BrowseErlass`); Fussnoten-Options-Toggle koexistiert
  mit dem bestehenden Apparat-Schalter (Unifizierung = G2b Kopf-Zusammenführung).
  Nächste Etappe **G2b** (Kopf-Merge/Fussnoten-Render-Fix/Sticky-Kontextkopf).
  R5-Mobil offengelegt auf ~30ch statt aspirativ 40ch (physikalisch gedeckelt
  @390, s. FAHRPLAN + Spec-Kommentar). **G4** (Einstieg /gesetze + Cmd/Ctrl-K,
  eigener Worktree, kollisionsarm) **gebaut**: (a) Landeplatz löst die Dreifach-
  Redundanz auf — drei gleichwertige Einstiegskacheln mit Live-Statistik statt
  stillem Bund-Default, neutrale Overline, Segment/Tab-Panel erst NACH Säulen-Wahl
  (`?ebene=`); alte Deep-Links (`?ebene=`/`?kt=`/`#sys-`/`?q=`) bleiben erreichbar.
  (b) Globale **Befehls-/Sprung-Palette** (`Cmd/Ctrl-K` + Mobil-Knopf in der Topbar)
  mit deterministischem **Norm-Query-Parser** (`src/lib/suche/normQuery.ts`):
  «OR 257d»/«Art. 5 AIG»/«ZGB 684 II»/«VMWG»/Kanton mit Code «StG AI 5» →
  `#art-<token>`-Deep-Link in ≤2 Interaktionen; Token-Ableitung kongruent
  passus.ts (257d→257_d, 49abis→49_a_bis), KEIN neuer Index (sitzt auf dem
  Browse-Manifest), Freitext → normale Suche (kein Fehl-Sprung). Lazy (§15, kein
  Eager-Load im Erst-Paint), a11y role="dialog"/Fokus-Falle/Esc via `useDialogFokus`.
  29 Unit-Akzeptanztests (`normQuery.test.ts`), 6 e2e (`befehlspalette.e2e.ts`);
  golden byte-gleich (kein Normtext/Engine); `gegenpruefung: n/a — reine UI`.
  **G5** (Kantons-Seite entrümpelt, eigener Worktree, kollisionsarm) **gebaut**:
  Kontext-Zeile Mengen-Asymmetrie (§8) · Sicht-Umschalter **Karte | Liste**
  (Karte default sichtbar statt zugeklapptem `<details>`) · Sortierung
  **Alphabet/Erlass-Zahl/Region** (Region = BFS-Grossregionen `grossregionen.ts`) ·
  Ordnung vereinheitlicht (Sidebar-Kantone alphabetisch nach Vollname statt föderal,
  `navigation.ts`) · Roh-Code→Klartext (Sammlungs-Kürzel-Buckets «LS»/«bGS» → ein
  ehrlicher «Nicht systematisiert»-Block statt «Bereich LS», Roh-Code bleibt je
  Erlass an der Nummer) · Mobil-Vollnamen (kein `truncate`, wrap). Reine Darstellung
  (§3), kein Risiko-Pfad im Diff → `gegenpruefung: n/a`; golden `golden:vergleich`
  IDENTISCH; 8 Unit (`grossregionen`/`navigation`) + 6 e2e (`gesetze-kanton-g5`),
  volle Suite 139 grün.
  **G2b** (Kopf-Merge `ErlassLeserKopf` + Fussnoten-Unifizierung + Sticky-Section-
  Kontextkopf + «Zitat kopieren», eigener Worktree) **gebaut** (s. STRUKTUR-Karte).
  **G3a** (Per-Grundart-Darstellung, Worktree `feat/gesetzes-ux-g3a`) **gebaut
  (5.7.2026):** Laufzeit-Grundart aus `GRUNDART_SEED` via `grundartMeta()` in der
  Darstellungsschicht (`helpers.tsx`, §5 — kantonale Erlasse stehen nicht im
  `ERLASS_REGISTER`, darum Seed als SSoT; **kein Risiko-Pfad im Diff**). **erlassTyp-
  Kopf-Label** (`kopfOverline`): 103 Verordnungen heissen jetzt «Verordnung» statt
  «Bundesgesetz», BV «Bundesverfassung», 18 Staatsverträge «Staatsvertrag», Kanton
  «Kanton XX · Gesetz|Verordnung». **⑥ KANTON §-Label:** «§ N» steht schon im
  Snapshot-`artikelLabel` → `bestimmungsEtikett` steuert nur das Kopf-Zähl-Substantiv
  «N Paragraphen» (775 §-Kantone); Anker bleibt **überall** `art-<token>` (R8, e2e).
  **⑤ Staatsvertrag** Präambel (bereits `ErlassKopfBlock`) + Label; **⑦ PDF-Rahmen**
  `border-rule-struktur`; **⑧ LIVE_VERWEIS** ehrliche Verweiskarte statt Fehlerseite
  (amtlicher Live-Link + Stand + §8-Hinweis) für die 9 `nur-live-link`-Erlasse; **④**
  Kurzerlass-Lesespalte lag durch G1 schon auf `max-w-reading`. **K11 umgesetzt**
  (grundart-abhängiger Linien-Default): Tri-State `data-linien:auto` + `data-grundart`
  am `.lc-leser` — nur KODIFIKATION zeigt den Guide im Default, expliziter Klick
  übersteuert; CLS 0. **Nebenfix:** Options-Switch OFF-Zustand `text-ink-500`→
  `text-ink-600` (WCAG 4.47→~6.7:1, latenter G2a-a11y-Bug, durch K11-Default-OFF
  aufgedeckt). Reine Darstellung (§3) → **`gegenpruefung: n/a`**; `golden:vergleich`
  IDENTISCH (201) + Prosa-Byte-Beweis ZGB/OR/VMWG/BV/AG-Kanton gegen `origin/main`;
  `check:grundart`/`check:linien-kanon`/`check:normtext`/`check:struktur-konsistenz`
  grün; neuer e2e `gesetze-ux-g3a` (6) + a11y/leser-Specs grün.
  **G6** (Rechtsgebiets-Sicht «Gerüst», Worktree `feat/gesetzes-ux-g6`,
  kollisionsarm) **gebaut (5.7.2026):** zweite, achsen-orthogonale Gliederung über
  eine vierte Landeplatz-Tür (`?ansicht=rechtsgebiet`) in `src/pages/Gesetze.tsx` —
  (a) **Auto-Grundgerüst** aus der vorhandenen `rechtsgebiet`-Achse (7 GEBIETE,
  aufklappbar, deckt JEDEN Bund-Erlass) + (b) **Querschnitts-Delta**: 8 kuratierte
  Praxisfelder (Arbeit / Miete & Pacht / Vertrag & Haftung / Gesellschaft & Handel /
  Familie & Erbrecht / Sachenrecht & Grundeigentum / Zwangsvollstreckung / Steuern &
  Abgaben) in `src/lib/normtext/rechtsgebiet-thema.ts` (SSoT — **kein** dupliziertes
  Register-Feld `rechtsgebietThema`, Abweichung von Spec §5.1 offengelegt, §5), enge
  Norm-Verankerung mit funktionierendem Deep-Link (OR Art. 319–362 → `#art-319`,
  Anker bleibt `art-<token>`, K2/R8) + je Thema **Verzahnung** (Rechner-Slug +
  `/rechtsprechung?rg=`) + `status: entwurf` (§8, K8). **Tolerantes Tor**
  `src/tests/rechtsgebiet-thema.test.ts`: Mitglieder-/Werkzeug-Slugs müssen
  existieren, 6–8 Themen, §7-Beleg je Zeile; Abdeckung wird beziffert (40/229
  Bund-Erlasse thematisiert), «unzugeordnet» ist zulässig (nie rot). Reine
  Darstellung/Klassifikation (§3); `golden:vergleich` IDENTISCH (201); neuer e2e
  `gesetze-rechtsgebiet-g6` (2) + Landeplatz-/Kanton-Regressionen grün; Visual-Review
  Desktop 1440 + Mobil 390 (0 Overflow). **Vollkuration bleibt späterer Strang**
  (nach Abnahme-Zeitsperre). **G3b Schritt 1 · Kanton-Tarif-Tabellen Stufe 2, Klasse A+D
  (Risiko-Pfad, 5.7.2026) gebaut:** die bereits extrahierten ·/—-Kanton-Tabellen
  (NW-265.51, BS-154.810, BS-291.400, SO-614.11, VS-173.8-de+fr; 32 Blöcke) vom
  Legacy-`{kopf,zeilen}` aufs kanonische typisierte `{spalten:[{typ,titel}],zeilen}`-
  Modell (T-B1/T-B4) nachgezogen → typgesteuerte Ausrichtung + Klasse-D-Tausender-
  gruppierung NUR in betrag/zahl/bereich (T-C5). Behebt einen §7-Faithfulness-Bug
  des Legacy-Renderers (globales `gruppiereTausender` verunstaltete Zitat-Jahre:
  «1937»→«1'937» in BS-154.810 Verfahrens-Spalten). Deterministischer Spalten-Typer
  `typisiereSpalten` (Prosa/Position→text, Staffel→bereich, Betrag→betrag, Satz/%→zahl,
  ziffernloses Einzelwort «gebührenfrei»→betrags-kompatibel); Werte (`zeilen`)
  byte-gleich (nur Typ-Metadaten+`sha` neu). Offline-Re-Projektion über den
  generator-eigenen Typer+`sha256Bloecke` (kein LexWork-Refetch → 0 Fremd-Drift).
  `check:gegenpruefung` **bestanden** (unabhängiger Opus-Pass gegen LexWork-APIs
  NW/BS/SO/VS, alle Stichproben byte-exakt, 0 Zeile verloren). Tore
  golden/tsc/vitest/lint/check:tabellen/paritaet/normtext grün, e2e 12/12; Visual
  Desktop+Mobil (0 Overflow @390). Zusatz: e2e-Flake `gesetze.e2e.ts` (OR
  fill-Timeout) gehärtet (Scroll-Spy/Suche-Kontrakt auf VGKE seitengrössen-
  unabhängig, App-Ready-Wait; 6× CPU-Throttle-Probe 5/5). **G3b Schritt 2 ·
  Anhang-Block-Rendering ③/⑤ (reine Darstellung, 5.7.2026) gebaut:** Anhänge
  (`annex_*`) + Staatsvertrags-Protokolle (`lvl_*`, LugÜ) rendern jetzt als
  eigenständig erkennbare, klar abgesetzte Blöcke (Struktur-Trenner + «Anhang N»/
  «Protokoll N» als Struktur-Überschrift, `data-anhang`; Anker bleibt `#art-`/R8;
  Ziffer-Zwischentitel via bestehendem `titel`-Block/M13). **LugÜ-Mobil-Overflow
  (scrollW 790 @390) gefixt** — Ursache war empirisch NICHT die Tabelle (die
  scrollt im `overflow-x-auto`-Container), sondern der `shrink-0`-Bereich-Badge der
  Anhang-Sektion (Lang-Labels 770px) → für Anhang-Sektionen unterdrückt + generisch
  umbruchfähig. Mehrspalten-Tabellen: `lc-scroll-x` + `min-w-full w-max` → breite
  Tabellen scrollen seitlich statt Zellen zu zerquetschen. **`gegenpruefung: n/a`
  literal** (nur `src/pages/gesetz-leser/**` + `ArtikelBody.tsx` + e2e — keine
  Risiko-Datei). Wortlaut-Byte-Beweis GSchV/ChemRRV/LugÜ/ZGB byte-identisch gegen
  `origin/main`; voller `gate` grün; e2e 1 Worker grün + neuer Spec
  `gesetze-ux-g3b-anhang` (5); Visual Desktop 1440 + Mobil 390 (0 Overflow @390).
  Trailer `Roadmap: W2·5d`.
  **G3b Schritt 2 (Tarif-Strang) · Klasse B (verklebte Zahlen, 5.7.2026,
  parallel zur Anhang-Einheit) fertig:** die x-koordinaten-rekonstruierten
  Streitwert-Staffeln ZH-215.3 §4, ZH-211.11 §3+§4 (zhlex-PDF) sowie ZG-163.4 §3,
  TG-176.31 §5 (LexWork-·/—) aufs kanonische `spalten`-Modell nachgezogen (5
  Tabellen / 44 Zeilen; `zeilen` byte-gleich). **Befund (§7, wie Schritt 1):** die
  x-Spaltenrekonstruktion war für ZH bereits committet (Commits e17793e8/559b1d9a),
  ZG/TG kommen vor-gespalten aus den LexWork-Zellen — kein NEUer Extraktions-Code
  nötig; der ZH-Adapter emittiert die Staffel jetzt kanonisch (kein Legacy-Regress).
  Verkleben-Befunde `100001250`=`10 000`|`1'250` und `5000250`=`5 000`|`250`
  x-getrennt verifiziert. `check:gegenpruefung` **bestanden** (unabhängiger Opus,
  44 Zeilen gegen zhlex-PDF via pdfplumber + LexWork-xhtml; Konkatenation==Roh,
  0 verloren/erfunden/geändert). Tore golden/tsc/vitest/lint/check:tabellen/
  paritaet grün, e2e 158; Visual ZH-215.3 §4 + ZH-211.11 §4 Desktop+Mobil (Tabelle
  scrollt im Container, 0 Page-Overflow @390, Tausender-Apostroph korrekt).
  **G3b Schritt 3 (Tarif-Strang) · Klasse C (SG-Füllpunkt-Rest, 5.7.2026) fertig —
  G3b KOMPLETT (A+B+C+D):** Diagnose der 159 nicht erfassten SG-Blöcke (SG-3849 135/
  SG-2935 20/SG-2808 4) = **kein** Block-Grenzen-Problem, sondern der **DEFECT-1-Guard**
  (Block als Plaintext gedroppt, sobald das letzte Leader-Segment nach dem Betrag noch
  angeklebten Folge-Inhalt trug — nächste Position/Überschrift/Folge-Artikel/Seitenzahl).
  Fix §1-konservativ: DEFECT-1 → **`nachtext`** (saubere Leader-Zeilen tableisiert, trailing
  Rest verlustfrei als Folge-Textblock; **Konkatenations-Invariante** als Unit-Test).
  Mehrdeutiges bleibt Text (mittleres Segment ohne Betrag, eingebetteter No-Leader-Betrag,
  No-Dash). **127 Einträge → +127 Tabellen** (SG-3849 110/SG-2935 15/SG-2808 2), **32 §1-
  konservativ Plaintext** (14 eingebettete Beträge + 18 Nicht-Tarif-Füllpunkte, unverändert
  zu HEAD). **Blast-Radius bewiesen SG-only** (0 Fremd-Kanton neu tableisiert; AUSSCHLUSS
  BL/FR unberührt). Klasse D für SG-`tabelle` durch bestehenden `TarifTabelle`-Renderer
  gedeckt (`gruppiereTausender` → `4'000`/`15'000`). Offline-Nachzug `kanton-fuellpunkt-
  nachzug.ts` (exakte produktive `reichereTabellen`, kein PDF-Refetch → 0 Drift); leader-
  freier Inhalt aller 728 SG-Einträge byte-identisch HEAD↔regeneriert. `check:gegenpruefung`
  **bestanden** (unabhängiger Opus, neue Tabellen zeichenweise gegen SG-PDFs via pdfplumber).
  Tore golden `IDENTISCH`/tsc/vitest/lint/check:tabellen/paritaet/normtext/struktur-konsistenz
  grün, e2e 163/163; Visual SG Desktop 1200 + Mobil 390 (0 Overflow @390, Apostroph korrekt).
  `ArtikelBody`/Reader unberührt (TABU). Detail: `FAHRPLAN-TARIF-TABELLEN-STUFE2.md`.
  **Stand 5.7.: G0–G6 ✅ gemergt** (#132/#135/#136/#141/#143/#145/#147/#148/#149,
  golden byte-gleich). **Anmerkungs-Welle A1–A18 (David 5.7., Go erteilt im Chat
  «run till dry»; Wortlaut-Quelle `docs/ux-audit-2026-07/ANMERKUNGEN-DAVID-2026-07-05.md`,
  Bau-Spec `FAHRPLAN-GESETZES-UX.md` §10):** revidiert die GEMERGTEN Etappen —
  **U-LINIEN ✅ gebaut** (PR `feat/u-linien-a8`: Linien-Default aufbau-basiert statt
  grundart-Kategorie — SSoT `linienAufbau.ts`, Schwellen empirisch aus 1135 Sidecars,
  Reglement §4b-A, Tor `check:linien-kanon` = R1/R4-Nachfolger; ZGB ruhig, ArG
  sichtbar; Wortlaut/Golden byte-gleich) → **U-KOPF ✅ gebaut** (PR
  `feat/u-kopf-a1-a3-a4`, Auto-Merge armiert; Ausführungsvermerk §10.7): A1
  Fussnoten-AUS = VERSCHWINDEN (display:none, überstimmt R9 — David-Entscheid;
  Normtext bleibt durchsuchbar, Print folgt Toggle, CLS 0) · A3 Positions-Leiste =
  echte klickbare Breadcrumbs (nav/ol/li, aria-current, springeZuSektion) · A4
  «Ansicht»-Dropdown im Kopf (`LeserAnsichtMenu`, ehrliche Disclosure + useDialog-
  Fokus; Chip-Leiste entfällt); P1 golden-ändernd (Kopf-Markup), Artikel-Prosa
  byte-gleich; Gate + e2e (inkl. neuer A9-Throttle `leser-kopf-a9`) grün →
  **U-VERWEIS ✅ gebaut (10.7., PR `feat/u-verweis-a7-a10-a11-a13`;
  Ausführungsvermerk §10.7):** A10 Plural-Linker `artikelnPluralVerweise`
  (MWSTG Art. 5 = GENAU 5 Links art_31/35/37/38/45; bounded, §1-Unterdrückungs-
  Regeln BGSA/Code-civil/42octies; Korpus 2091 Regionen/5187 Glieder) · A11
  Präambel-Verweise (kuratierte Genitiv-Map «der Bundesverfassung»→BV, 26 belegte
  Einträge + **aBV-Schutz**: Ingress-Linkung nur Erlassdatum ≥ 2000) · A7
  Verweis-Popover strukturiert (Wortlaut → Provenienz → Massgebliche Entscheide →
  abgetrennt Amtliche Materialien; `VerweisKontext`, geteilte Shards, Top-3+Zähler,
  CLS 0 by construction) · A13 Materialien-Kanten klarer (artikelscharf prominent,
  Erlass-Ebene hinter `<details>`-Zähler). Reglement §5a; Gate voll grün, Engine-
  Golden byte-gleich, e2e 188/188 inkl. `verweis-u` (A9-Throttle) →**
  **U-POSITION ✅ gebaut (11.7., PR `feat/u-position-a2-a16-a17`;
  Ausführungsvermerk §10.7):** A2 inhalts-proportionale content-visibility-
  Platzhalterhöhe (`schaetzeArtikelHoehe`, überschreibt den Flach-320px →
  proportionaler Scrollbalken, content-visibility bleibt = kein Logikverlust) ·
  A16 anker-basierte Scroll-Restoration (`scrollAnker.ts`, oberster Artikel +
  Offset, element-basiert robust gegen die Höhenschätzung; interne Verweise
  navigieren über den Router = echter History-Eintrag; NormPopover «Im Gesetz
  öffnen» SPA-`<Link>` → Cross-Erlass-Zurück landet am Ausgangs-Artikel) · A17
  Split-View liest den Pane-lokalen Hash/`?norm` ⇒ Norm-⧉ öffnet an Art.+Passus,
  Entscheid-⧉ an der Erwägung (nie stumm falsch). Golden byte-gleich (Client-
  Reader; kein `public/normtext`), Gate voll grün, e2e `leser-position-u` (P4 +
  A9-Throttle CLS 0). Parallel kollisionsarm:
  **U-SUCHE ✅ AUSGEFÜHRT (5.7., PR feat/u-suche-a5-a6, Auto-Merge armiert;
  Ausführungsvermerk `FAHRPLAN-GESETZES-UX.md` §10.7):** normQuery aus der
  gelöschten `BefehlsPalette` in die NORMALE Suchleiste (Sprung = oberster
  Treffer, Enter springt), Palette entfällt, ⌘K/«/» fokussieren die HeaderSuche;
  A6-Relevanz-Gruppierung (Rechtsinhalte vor Werkzeugen); KEIN Zweit-Index; Gate
  + e2e grün, `Gegenpruefung: n/a` · U-UEBERSICHT (A14/A15: Titel umbrechen statt kappen,
  Relevanz-Sortierung dokumentiert-deterministisch, Gliederungs-Umschalter
  Relevanz/Systematisch/Rechtsgebiet auf allen 3 Säulen; G6 = Modus statt vierte
  Tür) · **U-PDF ✅ AUSGEFÜHRT (11.7., PR `feat/u-pdf-a12`, Auto-Merge armiert;
  Ausführungsvermerk `FAHRPLAN-GESETZES-UX.md` §10.7):** Download = amtliches PDF
  der gepinnten Fassung (Bund Fedlex-`isExemplifiedBy` build-time — Suffix-Falle `-2`
  durch exakte URL statt Konstruktion gelöst, 227/227; Kanton LexWork bei Versions-
  Gleichstand, 1184/1231; Staatsvertrag self-hosted; render-eigenes `.txt` entfernt,
  §10.5); neues Tor `check:pdf-quellen` bindet die PDF-URL an die `fedlex-cache.sh`-
  Pins; `Gegenpruefung: bestanden` (P5-Stichprobe 12, Fassungsdatum-im-PDF-Beweis
  inkl. `-2`). **Damit ist die kollisionsarme A1–A18-Welle gebaut; offen nur das in
  CI laufende U-POSITION (A2/A16/A17).** A18 (BGE-Regeste nach Sprachen) → W2·6-B B2.
  A9 = DoD-Querschnitt (CPU-Throttle-Beweis) in jedem Bau-Prompt. **Kollisions-
  Precheck gegen laufende Worktrees (lm-qsperf/lm-l0) vor jeder Einheit; W2·7-Klingen
  #154 und W2·6a-MAT sind gemergt — nicht mehr live.** Trailer `Roadmap: W2·5d`.
  **U-UEBERSICHT ✅ (5.7., Opus, Worktree `feat/u-uebersicht-a14-a15`):** A14
  (Kanton-Titel umbrechen statt kappen + Relevanz-Sortierung = dokumentierte
  Kern-Erlass-Kategorie, dann Systematik) + A15 (Gliederungs-Umschalter
  Relevanz/Systematisch/Rechtsgebiet auf allen 3 Säulen, G6 = Modus + Tür bleibt;
  Wahl persistent `?gliederung=`/localStorage, alle bestehenden Deep-Links
  erreichbar). SR-0.*-Labels per Gegenprüfung korrigiert (0.5 → «Krieg und
  Neutralität»). Gate 25/25 grün, golden identisch, e2e 173/173 (inkl. A9
  6×-Throttle). Detail: `FAHRPLAN-GESETZES-UX.md` §10.7. Rest der Welle offen
  (U-LINIEN/U-KOPF/U-VERWEIS/U-POSITION Reader-Kette nach QS-PERF; U-SUCHE; U-PDF).
  **Nachzug-Welle A19–A25 (David 10.7.2026 — Ultracode-Recherche, Bau-Go David
  ausstehend):** eingeordnet in `FAHRPLAN-GESETZES-UX.md` §10.8; Spec-Heimat
  `FAHRPLAN-GESETZESDARSTELLUNG-V2.md`; Wortlaut
  `docs/ux-audit-2026-07/ANMERKUNGEN-DAVID-2026-07-10.md`. Offene Schritte:
  - [x] **A19** (FN-1+FN-2 +Drop-Fix `disp_*`): **✅ GEBAUT 10.7.2026 (Bau-Go David «go
    zu allem», `feat/v2-fn1-fn2`).** VZG-Alt-Form-Fussnoten erhalten nr (873 nr='' → echt,
    22 Erlasse), Präambel-`fnNrs` erfasst. **Abweichung (§7): Drop-Fix breiter als geplant** —
    recovert die verworfenen Schlusstitel-Fussnoten (`disp_uN/art_*`) korpusweit (227 recovert,
    u.a. OR/ZGB); «OR/ZGB byte-gleich» galt NICHT, stattdessen strukturell nicht-regressions-
    bewiesen (nur additiv, 0 Verlust). Gegenprüfung gegen Fedlex bestanden; Detail V2 §2 F1. V2 §2 F1.
  - [x] **A20** (FN-3): Präambel-Fussnoten inline (nach U-VERWEIS-Merge). V2 §2 F1.
    **✅ GEBAUT 12.7.2026 (`feat/v2-fn3`, PR #212).** Detail §10.8.
  - [ ] **A21** (FN-4): Absatz-Zuordnung Alt-Form (bündelt mit A19-Regen). V2 §2 F1.
    **Bau-Go David ausstehend.**
  - [~] **A22** (K-1+K-2): Kopf nützlicher + Fussnoten-Anwahl (koordinierter Kopf-PR
    mit U-PDF, nach U-VERWEIS). V2 §2 F2. **K-2 ✅ GEBAUT 11.7.2026 (`feat/v2-kopf-pr`,
    PR #194) — Fussnoten-Chip. K-1 («in Kraft seit» / SPARQL-Datenteil) weiterhin offen.**
    Detail §10.8.
  - [x] **A23** (B-1+B-2): BGE Ab-/Anwahl + Zeitfilter in Rubrik-Ansicht, Kappung
    `LEITFAELLE_SICHTBAR` 5→10 (überstimmt §3.1-«3 Toggles»; nach U-VERWEIS).
    V2 §2 F3. **✅ GEBAUT 11.7.2026 (`feat/v2-kopf-pr`, PR #194).** Detail §10.8.
  - [~] **A24** (L-1+L-2+L-3): Linien-Reparatur, Auto-Default-Umkehr ZGB/OR (Umkehr
    #161, David freigegeben); L-4 entfällt. V2 §2 F4.
    - [x] **L-1+L-2 ✅ GEBAUT 11.7.2026 (feat/v2-l1-l2):** Einzug-Cap 3→5 + Mobil-
      Token `einzug-mobil` (0.75rem statt Kollaps auf 0; `data-linien=aus` kollabiert
      weiter alle Ebenen) + Guide-Ton 10 %/14 % → 18 %/24 % (= `--line-strong`).
      Golden byte-gleich (reine Reader-CSS/TS, kein Snapshot); `check:linien-kanon`
      GRÜN unverändert (Aufbau-Regelwerk/Referenz-Verdikte unberührt). Playwright-
      Beleg Light+Dark, Desktop+Mobil@390: Guide 0.18/0.24 gemessen; ZGB indentet
      neu Ebene 1–5 (6–7 gekappt); Mobil-Einzug 12px; CLS 0 (padding/border). V2 §2 F4.
    - [ ] **L-3** (Auto-Default-Umkehr): weiterhin **hinter David/Council-Gate** —
      NICHT in feat/v2-l1-l2 gebaut. V2 §2 F4.
  - **A25** (C-1+C-2+C-3): Farbe nur Referenzschicht (Chips/Badges/Kopf),
    Normtext-Körper farbfrei. V2 §2 F5. Bau-Go David 10.7. «go zu allem».
    - [x] **C-1 ✅ (10.7.2026, feat/v2-c1-kantenchip):** KantenChip `kategorie`-Prop
      (Norm=brass byte-identisch / Entscheid=slate-Tick+Hover), ↻ Revision→warn-700
      (★ bleibt brass), slate-Doppelbelegung aufgelöst → DESIGN-REGLEMENT-NORMTEXT
      §4b-B (Farb-Wörterbuch). Golden byte-gleich, Kontrast als Gate gemessen, CLS 0.
    - [x] **C-2 ✅ (11.7.2026, feat/v2-c2, #201):** Overline-Farbpunkte Leitfälle/
      Verweise (`lc-punkt`/`lc-punkt-entscheid`) + Currency-Chip-Tonung
      (`lc-chip-geltend` sage «geltend geprüft (maschinell)» / `lc-chip-vorbehalt`
      warn «nächste Fassung ab»). Kontrast gemessen, golden byte-gleich, CLS 0.
    - [x] **C-3 ✅ (11.7.2026, feat/v2-c3) — Farb-Wörterbuch KOMPLETT:**
      Materialien-Familie sage (`lc-punkt-material` + `punkt`-Prop an KontextGruppe:
      Materialien/Norm/Entscheid-Gruppen tragen ihren Familien-Punkt) + NormChip-
      Verweisfarbe (`hover:border-brass-400`, brass-Hover-Familie vereinheitlicht).
      Kontrast gemessen (sage 4.48/3.84 ≥3:1), golden byte-gleich, CLS 0. V2 §2 F5,
      DESIGN-REGLEMENT §4b-B Abschluss.
  - [ ] **DEFER FN-5/M14** wortgenaue Marker: hinter QS-PERF/U-POSITION, separates
    David-Go (Entscheid 10.7.). V2 §2 F1.

  **Nachzug-Welle A29–A40 (David 16.7.2026 — BAU-GO in derselben Session: «run till
  dry» + «und dann wie immer alles mit opus bauen»):** eingeordnet in
  `FAHRPLAN-GESETZES-UX.md` §10.10; Wortlaut
  `docs/ux-audit-2026-07/ANMERKUNGEN-DAVID-2026-07-16.md`. Einheiten E1–E7:
  E1/A29 Regesten-Extraktions-Fix BGE 147 III 121 (Risiko-Pfad, Gegenprüfung) ·
  E2/A30+A31 Marginalien-Superscript + Fussnoten im Fliesstext/Abstände ·
  E3/A34 Split-View-Bugs (Scroll-Sprung, Ansicht-Menü) · E4/A32+A36 Kontextfenster-
  Position + ZGB-TOC-Kuration · E5/A35+A40 Suche in Kopfzeile + Treffer-Highlight +
  BGer-Deep-Link-Bug · E6/A37 Reader-Layout-Breite · E7/A33 Gliederungs-Scroll-Spy
  (explizites Ultracode-Opt-in, QS-TOK/T20). Ausserdem: A38 «ganze Website heller
  und weisser» → Design-Kette D-5 (`FAHRPLAN-DESIGN-WAERME.md`) · A39 BGE-Band-Lücke
  (150 II 308 fehlt) → W2·6 PR-B (148/149) + PR-C (150/151).
  **Gesetze-Aufteilung Bund/Kantone V2 «Erfassungsgrad-Staffel» (David-Auftrag 16.7.2026:
  «sinnvoller und praxistauglicher aufbau … schnell relevantes finden»; Ultracode-Panel
  5 Miner/3 Entwürfe/3 Judges) → Bau-Spec `FAHRPLAN-GESETZES-UX.md` §11. Bau-Einheiten:
  IA-1 Named-Article-Garantie+Dedup (Engine, Gegenprüfung, vorgezogen, nach #232) · IA-2
  Erfassungsgrad-Badges/SSoT `erfassungsgrad.ts` (Gegenprüfung) · IA-3 A–Z-Register · IA-4
  Scope-Chip · IA-5 Rechtsgebiet-Kanonisierung · IA-6 /international-Kanonik Stufe 1 · IA-7
  Sidebar-Badges. David-Fragen Y-A/Y-B/Y-C (§11.8). Trailer `Roadmap: W2·5d`.
- [ ] **5e · UI-Nutzwert & Navigation (Ultracode-Synthese 11.7.)** *(`[OF]`, reine UI/Navigation)*:
  <!-- @meta id: W2·10-UI-NAV · status: ready · of: ja · blocker: null · dep: [W2·5d] · kollision: [src/components/suche, src/lib/suche, src/lib/universalSuche.ts, src/components/layout, src/components/rechtsprechung, src/pages/Rechtsprechung.tsx, src/pages/gesetz-leser, src/pages/GesetzLeser.tsx] · worktree: ja · 26x: nein · fahrplan: FAHRPLAN-UI-NAVIGATION.md -->
  Priorisierter UI-Verbesserungs-Plan aus 60 empirischen Befunden + 3 Kritik-Linsen
  (david-treue · repo-realität · praxis-nutzen; Bilanz 44 übernommen / 32 geändert / 4
  verworfen): Quick-Win-Paket «tote Rückwege/Anker/Key-Normalisierung» → Suche-Kette
  (Query-Durchreichung `?q=` · BGE-Zitations-Direktsprung + §8-«nicht im Bestand» ·
  Dropdown-Ehrlichkeit/Enter-Puffer/Meinten-Sie · Ranking-Kernerlasse · /suche-Seite
  [David-Go] · Mobil-Fokusmodus) → Verzahnungs-Politur (Artikel↔Werkzeug-Map beidseitig,
  Hover-Preview am NormPopover, Leitfall-Regeste-Popover, Erwägungs-TOC) → Reader-/
  Wiedereinstiegs-Welle (In-Gesetz-Highlight, Mobile-Gliederung+Quickjump, Zitat+Permalink,
  Weiterlesen-Chip, Verlauf-Initiative, Tap-Target-Pass) → Rechtsprechungs-/Rechner-Politur
  (Pagination, Mobil-Filter, Sachgebiets-Pipeline [Risiko → `QS-GP`], News-Karten). Leitthema
  «gebaut ≠ gefunden». **Vor jedem Schnitt Prod-Re-Audit** (Befund-Vintage teils vor den
  Merges 10./11.7.); Reader-Flächen **hart HINTER die offenen A20–A25**; 6 Posten =
  David-Entscheid (A6-Werkzeug-Chip · Arbeitsmappe · V3-Cockpit-Fragen · Lese-Toggles ·
  /suche-Go · Zitiert-Chips); hart gegated: Zitiert-von=VZUI-V2 (VPS), Fassungsvergleich
  (Fedlex-P1a/b + Freigabe). Verworfen mit Grund (Command-Palette [A5-Entscheid],
  Normtext-Virtualisierung [§15.1], Minimap, Scroll-Hash-Sync u. a.).
  Detail: **[`FAHRPLAN-UI-NAVIGATION.md`](FAHRPLAN-UI-NAVIGATION.md)**. Trailer `Roadmap: W2·10-UI-NAV`.
  **Teillieferung 12.7.2026 (`fix/suche-aktivindex-race`):** Such-Dropdown-Race
  gegen die deferred Artikelgruppe (#183/§15.3) an der Wurzel geschlossen — die
  Pfeil-Auswahl folgt jetzt einem STABILEN Treffer-Key (`src/components/suche/trefferAuswahl.ts`,
  geteilt von HeaderSuche + Hero) statt einem Positions-Index; nachwachsende
  Treffer verschieben das Enter-Ziel nicht mehr (empirisch war Enter auf
  SCHKG#art-257 statt OR#art-257_d gelandet). Deterministischer Repro-Test +
  10×-Drossel-Beweis grün; die #210-A9-Reset-Härtung bleibt als Redundanz.
  **Stand 11.7.:** Einheit **N0 (Quick-Win-Paket, N0a–N0d) ✅ gebaut+belegt** (Opus, Playwright
  Desktop+Mobil): tote Rückwege · Erlass-Key-case-insensitiv+hilfreiche Fehlseite · Anker-`--nt-stick` ·
  Kleinposten (Ergebnis-FAB-IO · Rechner-Filter · Streitwert-Leerzustand · Entwurf-Legende-Popover ·
  Entscheid-`?ansicht=` · «In neuem Reiter»-Toast+☰-Tooltip). Rest der Kette (Suche S1–S6 …) offen.
- [ ] **5f · Design-Wärme & Atmosphäre (Ultracode-Synthese 11.7.)** *(`[OF]`, reine Darstellung/Token-Schicht)*:
  <!-- @meta id: W2·11-DESIGN · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/index.css, tailwind.config.js, DESIGN-REGLEMENT.md, scripts/check-design-tokens.ts, src/components/rechtsprechung, src/pages/EntscheidLeser.tsx] · worktree: ja · 26x: nein · fahrplan: FAHRPLAN-DESIGN-WAERME.md -->
  Farbklima/Wärme/Typografie-Plan aus 48 Ultracode-Befunden + 3 Kritik-Linsen (reglement-treue ·
  umsetzbarkeit · geschmacks-kohärenz). Fünf tragende Entscheide: **E1** Ein Papier, eine Tinte,
  ein Winkel (OKLCH-Rekalibrierung der Neutralen auf Brass-Hue, kein zweiter Wärme-Kanal) ·
  **E2** Brass ist Signal, nicht Klima (warm empfangen, kühl prüfen) · **E3** Zwei Stimmen
  (Serif=Werkstoff/Sans=Werkzeug, Mono-Diät) · **E4** Ein Lese-Register (`--reading-ink`,
  Kontrastfenster) · **E5** Rollen vor Stufen, Messung vor Geschmack (`check:farbwelt`-Tor).
  Bau-Einheiten D-0 Mess-Fundament → D-1 Sofort-Fixes (FS-Bug · Overline-AA · danger-dark-1.4.11 ·
  Lesespalte Regeste/Verdikt · Chevron · Motion-Dedup) → D-2 Rollen-Aliase+§13-Nachträge →
  D-3 oklab-Mix → D-4 Ink-Wärme → D-5 Papier-Treppe → D-6 Dunkel-Paket → D-7 Lese-Register →
  D-8 Wörterbuch-auf-Fläche+Mono-Diät; D-9 = David-Entscheide (Display-Serif · Typo-Rampe ·
  Stripe-L) nur bereitgelegt. Fixpunkte: `--paper` hell/dunkel + C-1/C-2/C-3-Kalibrierung;
  golden byte-gleich; §15 ohne Textur/Font-Zuwachs. **Vor jedem Schnitt Prod-Re-Audit**
  (Befund-Vintage teils vor #201). Verworfen mit Grund (`--paper-warm`, Dark-Brass-Tausch,
  Elevation-Neubau, Sepia-Modus u. a.). Detail: **[`FAHRPLAN-DESIGN-WAERME.md`](FAHRPLAN-DESIGN-WAERME.md)**.
  Trailer `Roadmap: W2·11-DESIGN`.
- [ ] **6 · Konsultieren-Klingen** *(`[OF]`, amtlich)*:
  <!-- @meta id: W2·6 · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->
  - **Mehrsprachiger Normvergleich DE/FR/IT** (Auslegungswerkzeug, Art. 14 PublG — alle drei
    Fassungen gleich verbindlich). Heute nur `de` befüllt. *Aufbau:* Generator je Erlass 3
    Sprachfassungen aus Fedlex → `…<lang>.json`; Synopse-UI im Gesetzleser (Spalten + Diff).
  - **Recherche Norm → amtlicher Entscheid** (`norm-index.ts`, deterministisch, kein LLM-Ranking;
    Regeste nur amtlich oder eigene maschinelle, «maschinell»-Marker behalten).
  - **Gerichts-/Behörden-Adressregister** (Lese-/Index-Schicht über bestehende Stores, kein
    Duplikat; Abnahme-Status + Verfallsregister je Eintrag).
  - **BGE-Band-Nachzug 146–149 (Jahrgänge 2020–2023) [Auftrag David 12.7.2026 «bge bis 2020»]:**
    **PR-A (146+147 = 404 BGE, alle Sprachen) 12.7.2026** — band-basierte de/fr/it-Enumeration
    (`enumeriereBgeBaender`; Q1-Bandjahr-Quirk + Sprachfilter-Falle: `language=de` verlöre 247
    fr/it-BGE), additiv (Bestand byte-treu), aza-Bindung + Urteilsdatum aus dem AMTLICHEN
    clir-Urteilskopf (`parseClirUrteilskopf`; Fix nach Gegenprüfungs-R1 `widerlegt`: 31 Streudaten +
    2 aza-Fehlzuordnungen + fehlende fr/it-BGE), clir-Regeste dreisprachig, BUDGET_MB 35→100,
    Determinismus 2 Läufe byte-gleich, VOLLE Gegenprüfungs-Runde 2 (Opus) je PR. **PR-B
    (148+149 = 384 BGE)** gleiche Mechanik, band-weise (Datenmenge/Crawl-Risiko).
    Beleg `bibliothek/rechtsprechung/bge-baender-146-149-nachzug-2026-07-12.md`.
  - **Rechtsprechungs-Übersicht** *(KANTONALE/ENTSCHEIDSUCHE/RECHTSPRECHUNG)*: **P0-Fix** SG-Regeste
    + kant. Norm-Resolver (Bugfix, **öffnet keinen 26×-Slot**); **Korpus-/Übersichts-Breite [OF]**
    (Facetten/Sprachfilter-Vorbereitung). Live-Adapter §4-blockiert → geparkt. §14-gebündelt (Phase 0):
    führende Detailquelle für Live-/Volltextsuche (`livesuche.ts`, P1–P6) = `FAHRPLAN-ENTSCHEIDSUCHE-AUSBAU.md`;
    nicht doppelt planen (BGE-Darstellung-Teil B ist Verweis).
    *— Datenausbau-Unterschritte (Quellen → DB → Korpus = Fundament der Verzahnung):*
    - [D] **Quellen-Steinbruch OpenCaseLaw** *(Analyse 2.7.2026; **Richtungsentscheid gefallen 2.7.: KONSUMIEREN statt scrapen** — Massen-/Graph-Verwertung läuft im DB-Strang **W2·6-DATA**/`FAHRPLAN-DATENHALTUNG.md`; Technik-Ports W1/W4–W13 unverändert nach `PLAN-OCL-ABBAU.md`)* — Auswertung
      von opencaselaw.ch/`caselaw-repo-1` (Daten CC0, Code MIT): was für LexMetrik verwertbar ist
      (LexWork-Kantons-API · Fedlex-SPARQL-Eigenheiten · Zitat-Regexes/ECLI · Verifikations-Rails →
      Gegenprüfung). Leit-Doktrin: OCL nie load-bearing, nur Seed/Diff-Orakel + Endpunkt-Wissen selbst
      gegen amtliche Quelle nachbauen. **Detailquelle:** `FAHRPLAN-OPENCASELAW-QUELLEN.md`.
      **Baustein ① LexWork-Kantons-API ✅ verifiziert 11.7.2026** (POC/Mess über alle 19 Kantone
      live): war **bereits gebaut+live** (Adapter/Discovery/1232 Snapshots/`check:normtext-netz`) → kein
      Neubau (§1/§6). 18/19 voll nutzbar; **GL teilweise** (Migration `gesetze.gl.ch`, `xhtml_tol`-Endpunkt
      tot → Currency-Befund, Verfallsregister). Gegenprüfung SO/AR-future/BS-abrogated bestanden. Doc-only.
      Verdikt-Tabelle `bibliothek/normen/lexwork-kantone-poc-19-verdikt.md`. Offen: GL-`json_content`-
      Andockung + David-SCHEMA-ENTSCHEID (`json_content` vs. `xhtml_tol`, Golden-Churn 1232 Snapshots).
    - [~] **Fedlex-Datenarten-Portfolio** *(Plan 2.7.2026; Go David 10.7.2026 «go zu allem», Reihenfolge 1→2→5→3→4)* — 6 verwertbare
      Fedlex-Datenarten (Erlasse/Materialien/Verfahren/Staatsverträge u.a.), ausschliesslich amtliche Fedlex-Stelle
      (SPARQL + Filestore, nie Dritt-Repo). **Detailquelle:** `FAHRPLAN-FEDLEX-PORTFOLIO.md`.
      **Paket 1 (Gesetze-Currency, `QS-CURRENCY`) ✅.** **Paket 2 (Botschaften/«Entstehungsgeschichte», W2·6) ✅ 10.7.2026** —
      401 Botschaften des Bundesrates über die 218 Volltext-Erlasse (Projekt-Graph, `nur-live-link`), im Norm-Kontext-Bus
      (Bridge B1); Join-Felder `projEli/ocUris/botschaftDate` für Paket 5 persistiert. **Paket 5 (Änderungshistorie/AS, W2·6-REV) ✅ 10.7.2026** —
      3108 AS/RO-Änderungs-Erlasse über die 218 Volltext-Erlasse (SPARQL Pfad (b) SR-Taxonomie), RO-Fundstelle aus oc-URI (100 %),
      Botschafts-Join über `ocUris` (477), `nichtKonsolidiert`-Marker (93) + Sammelerlass-Cross-Check gegen Pfad (a) ab 2000 (1942);
      Sidecar `public/normtext/revisionen/` (Übergangslösung bis E1→`erlass_fassungen`), im Norm-Kontext-Bus «Änderungen / Revisionen»
      neben der Entstehungsgeschichte (Bridge B1); Tore `check:revisionen`(-netz), Gegenprüfung bestanden. **Alle 5 Pakete (1/2/5/3/4) ✅ AUSGEFÜHRT** — Detail `FAHRPLAN-FEDLEX-PORTFOLIO.md`.

      (Bridge B1); Join-Felder `projEli/ocUris/botschaftDate` für Paket 5 persistiert. Paket 5/3 (Änderungshistorie/AS,
      Vernehmlassungen) via eigene PRs. **Paket 4 (Staatsverträge, `W2·6`) ✅ 10.7.2026** — 9 kuratierte SR-0.*-Verträge
      (HKsÜ 96/HUVÜ/EAUe/CMR/Montreal/RBÜ/UNO-BRK/Istanbul/Apostille) als Volltext über die bestehende `eli/cc`-Pipeline
      (kein `eli/treaty`-Extraktor); International-Volltext 18→27; POC: keine strukturierte Parteien-Kante → «Geltungsbereich»-Anhang
      verbatim, html-0 bei 5/9 stale → kanonische html-N gepinnt; Gegenprüfung bestanden. Detailquelle
      `bibliothek/register/fedlex-staatsvertraege-2026-07-10.md`. **Damit sind alle 5 Portfolio-Pakete gebaut.**
    - [~] **Datenhaltung-Bau: DB-Artefakt + Massen-Korpus + Edge-Suche** *(W2·6-DATA; Council 2.7.2026 — löst die drei OCL-Abbau-„DAVID-ENTSCHEID"-Punkte auf)*.
      <!-- @meta id: W2·6-DATA · status: wip · of: ja · blocker: null · dep: [] · kollision: [scripts/normtext-snapshot.ts, scripts/prerender.ts, public/normtext/register.json] · worktree: ja · 26x: ja · fahrplan: FAHRPLAN-DATENHALTUNG.md · slot: inhaber -->
      Andockpunkt **eine Schicht UNTER dem heutigen Generator** — die bestehenden Adapter befüllen
      ein libSQL/SQLite-Artefakt, `public/*.json` + Prerender werden Projektion (Tor `check:paritaet`,
      §7 Build-Regel 6). Etappen (Detail `FAHRPLAN-DATENHALTUNG.md`): **E0** Fundament/Reverse-
      Befüllung+Parität → **E1** Generator-Flip → **E2** Edge-Suche-POC (alle BGE + alle Bund-Gesetze)
      → **E3** BGer-Massen-Import (voilaj-Konsum; **HÄLT den 26×-Slot seit 3.7.2026** — Reihenfolge ENTSCHIEDEN:
      E3 zuerst, W3·12 danach, David 2.7., `FAHRPLAN-DATENHALTUNG.md` §10(1)) → **E4** Zitat-Graph → **E5** Kanton-Rechtsprechung (26×, Slot-Kette #4) → **E6a**
      Verwaltungsverordnungen (Kreisschreiben — Bund-Strang, kein Slot; Nordstern-Doktyp) → **E6b**
      Materialien-Vollausbau (Detail `FAHRPLAN-DATENHALTUNG.md` §5). E0–E2 golden-neutral zu den Gesetzen; jede Projektions-
      Änderung golden byte-gleich (§6) + `QS-GP`. OCL-Pakete W12 (Bulk-Parquet) + F2 gehen hier auf. **E0 ✅ 2.7.2026** (PR #80/81, `ad065c03`: 218 Bund-Normtext byte-gleich DB↔JSON, `check:paritaet` in der Gate-Kette, doppelt verifiziert). **E0+ ✅ 3.7.2026** (Branch `feat/qs-data-e0-plus`, expliziter Sub-Schritt, KEIN neuer ROADMAP-Schritt — §14): Ziel-Schema §3 angelegt (erlasse/erlass_fassungen/artikel/entscheide inkl. `ecli_key`/`bge_key`+Indizes/soft_law + leere norm_referenzen/zitat_kanten/norm_rangliste) · Partitionierung je Doktyp (`daten/normtext.db`·`rechtsprechung.db`·`soft-law.db`; Monolith `lexmetrik.db` entfällt ersatzlos) · `normalisiere-zitat.ts` + DB-freie Unit-Tests · Reverse-Ingest ausgedehnt (Kanton-Normtext 1231 · Rechtsprechung 342 · 4 Manifeste inkl. Trailing-Newline · Materialien 1) — **`check:paritaet` byte-gleich über 1796 Dateien**, golden-neutral, doppelt verifiziert. **Nächstes: E1** (Generator-Flip). **Klarstellung Leitprinzip 4:** der Reverse-Ingest bereits committeter Kantons-JSONs öffnet **KEINEN** 26×-Slot (Leitprinzip 4 meint neuen Massenimport, nicht Reverse-Befüllung committeter Daten). **Weichen entschieden 3.7.:** Kontext-Auslieferung = Hybrid (Shards+Edge, `FAHRPLAN-DATENHALTUNG.md` §10(6)/§11.5) · Massen-Rebuild = Voll-Rebuild (§10(7)). **E1 ✅ 3.7.2026** (Branch `feat/qs-data-e1-flip`): Generator-Flip Bund-Normtext auf das Spalten-Zielschema (`erlasse`/`erlass_fassungen`/`artikel`), `public/*.json` = Projektion (Wächter alt≠neu → hart ab); neues Tor **`check:datenhaltung`** (Dump-Manifest-Determinismus + Drift gegen committetes `daten-manifest.json` + Invarianten Orphans/§7-Spalten/ATTACH); Risiko-Globs um `scripts/datenhaltung/**`+`daten/**`+`normtext-snapshot.ts` erweitert; Stabilitäts-Report. Byte-Beweis 3 Doppelläufe alt==neu==committet (218 Erlasse/24858 Artikel), `check:paritaet` unverändert 1796, golden byte-gleich, `QS-GP` bestanden. **VORBEHALT:** alter Direktpfad bleibt Wächter (Entfernen = eigener §6-Schritt); Kanton/Rechtsprechung/Materialien noch Blob-Weg. **Nächstes: E2** (Edge-Suche-POC).
    - [~] **+ Auftrags-Eingang 30.6.: Bündel B** — **B1+B2+A18 ✅ GEBAUT 5.7.2026** (Branch
      <!-- @meta id: W2·6-B · status: wip · of: ja · blocker: null · dep: [] · kollision: [] · worktree: ja · 26x: nein -->
      `feat/w26b-regeste-a18`; B3 offen = reine UI). **B1** BGE ohne «vollständiges Urteil»:
      aza-Resolver gehärtet (2. OCL-Kopfformat «BGE … (aza)» + Bandjahr statt fehlerhaftem
      `decision_date` als Plausibilitäts-Referenz) — **5/12 voll aufgelöst** (150 I 183/151 V 30/
      151 I 41/150 II 334/151 IV 316), **2 Kollisions-quarantäniert** (152 V 2/20 = OCL-Konflation,
      korrekt Auszug-only §8), **5 weiter Auszug** (151 I 73/151 II 710 kein aza im Kopf;
      151 III 336/151 II 475/151 V 100 Inversions-/Fetch-Grenze — ehrlicher Auszug §8).
      **B2+A18** (EIN Regeste-Pass, Quell-Wahl §7): die amtliche BGE-Regeste ist als flacher
      OCL-String weder dreisprachig noch strukturiert → aus **bger.ch clir** (`atf://<band>:de|fr|it`)
      nachextrahiert: Regestenkopf (massgebliche Artikel **fett**) + Absätze, je Sprachfassung,
      **strukturbasiert getrennt** (`<div id="regeste" lang>`) und **sortiert DE→FR→IT** — **272/272
      BGE, 0 Lücken**, additiv (`regeste.sprachfassungen`; `regeste.text` byte-stabil, Engine-Golden
      unberührt). `RegesteBlock.tsx`: DE prominent, FR/IT dezent einklappbar. Tor
      `check:entscheide` erzwingt Sortierung+Kopf+clir-Quelle; Gegenprüfung **bestanden** (Opus-
      Zweitpass 6 BGE × 3 Sprachen byte-genau vs. bger.ch). Detail `FAHRPLAN-GESETZES-UX.md`
      §10/U-REGESTE. · **B3** Sticky-Kopf überdeckt Body in `EntscheidLeser.tsx`
      (*reine UI, eigener Commit — NICHT in dieser Einheit*). Details im Eingangsblock oben.
    - [x] **Verweis-Präzision im Entscheid-Leser (Referenz BGE 151 III 377)** *(W2·6, `QS-GP`, 3.7.2026)*. i.V.m.-Ketten-Verlinkung (Kürzel auf bare Glieder propagiert, `normVerweiseImText`) + Zitierte-Normen-Chips → Sprung zur ersten Fundstelle-Erwägung; Tore grün, Snapshots additiv. **Chronik:** `ROADMAP-CHRONIK.md` → W2·6/Verweis-Präzision.
    - [x] **BGE-Auszug abgeschnitten — vollständig gefixt (34/34)** *(W2·6-BGE, Inhaltsverlust, `[OF]`)*. 29.6.2026: still mitten im Wort gekappte Auszug-Erwägungen voll nachgeladen (`fuelleGekappteErwaegungen` + Id-Disambiguierung) + Schutz-Tor U+2026 in `check:entscheide`; alle 34 BGE regeneriert, golden byte-gleich. Öffnet keinen 26×-Slot. **Chronik:** `ROADMAP-CHRONIK.md` → W2·6/BGE-Auszug.
      - [x] **Rest 30.6.2026 geschlossen** — `bge_151_V_1`/`bge_151_V_30` via Id-Disambiguierung sauber re-gefetcht (kein Hand-Edit §7), WARN-Quarantäne entfernt. **Chronik:** `ROADMAP-CHRONIK.md` → W2·6/BGE-Auszug.
- [ ] **6-VZUI · Verzahnung sichtbar machen** *(David-Auftrag 3.7.2026; reine UI auf vorhandenen Daten)* — **V1a ✅ GEBAUT 3.7.2026** (PRs #118/#121/#122 + e2e/Doku-PR; Fundament + Vereinheitlichung + Entscheid beide Richtungen + alle 4 Zusatzaufträge; 13 Verzahnungs-e2e grün, Referenzfall ZGB 684→BGE 151 III 377 = E. 2.3.1) · **V1c ✅ GEBAUT 4.7.2026** (Normrevisions-Ehrlichkeit: Build-Extrakt `public/verzahnung/artikel-revisionen/` 201 Erlasse/12702 Artikel + `klassifiziereFassungsBezug` in LeitfallZeile/KontextPanel/EntscheidLeser + `StatusBadge revidiert` ↻ mit Revisionsdatum+AS; Gegenprüfung bestanden — 3 reale Parser-Bugs gefixt, 0 Rest über 12702 Belege + 10 Artikel gegen Fedlex; 22 Unit + e2e AIG Art. 5/34); **V1b ✅ GEBAUT 4.7.2026** (Branch `feat/vzui-v1b-rangliste`; E4-Rangliste in die 19 Leitfall-Shards eingebacken: `norm_rangliste`-`gewicht` ersetzt build-time das kuratierte, Provenienz NIE gemischt — `gewichtQuelle:'e4'|'alt'` je Shard, 5 e4 [AHVG/AVIG/BVG/ELG/VVG] / 14 alt [vintage-absent Band-152-BGE oder Recall-Lücke]; masse.db-Rebuild deterministisch [195 342 Entscheide, Resolve-Quote 0,8245], Oracle-Tor GRÜN 931 Tripel/0 UNERKLÄRT, `check:entscheide` prüft Membership+Monotonie masse-frei; **727a-Vorbestands-Bug gefixt** [`normArtikelToken` strippt `_`, Reader-Query `727_a`→Shard `727a`]; Gegenprüfung bestanden) · **offen: V2 (E3-Serving) · V2 (E3-Serving) · V3 (E6a)**:
  <!-- @meta id: W2·7-VZUI · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/pages/gesetz-leser/parts.tsx, src/components/kontext/KontextPanel.tsx, src/pages/EntscheidLeser.tsx, src/components/NormPopover.tsx, src/components/suche/SuchResultate.tsx] · worktree: ja · 26x: nein · fahrplan: FAHRPLAN-VERZAHNUNG-UI.md -->
  EINE Interaktions-Grammatik (KantenChip · StatusBadge nur-Abweichung · KontextGruppe-Overlines ·
  MehrKante · FundstellenAnker · Begriff-Glossar) über GesetzLeser/EntscheidLeser/MaterialLeser/Suche/
  Split-View. **V1a JETZT vor VPS** (4 Leitentscheid-Darstellungen vereinheitlicht, EntscheidLeser beide
  Richtungen am Fuss, Artikel-Sublabels, ⧉ Panel+Popover unter Pane-Gating; Zusatzaufträge David 3.7.:
  Fundstellen-Sprung zur massgeblichen Erwägung an ALLEN eingehenden Entscheid-Links + Popover-Verankerung
  am Link) · **V1c** Normrevisions-Ehrlichkeit (David 3.7.: alter Entscheid nie unbesehen an revidierte
  Norm — `fassungsBezug` aus Sidecar-Revisions-Fussnoten, `StatusBadge revidiert`; Extraktions-Risikopfad
  ⇒ `check:gegenpruefung`) · **V1b** Rangliste-Einbacken
  (gated: law-code-Kanonisierung ✅ E4 3.7.; Provenienz nie gemischt; `check:gegenpruefung`) · **V2** Masse/Edge
  (Registry + «Wird zitiert von» + `masse`-Badge, mit E3-Serving) · **V3** Soft-Law (E6a-Anschluss,
  `nur-verweis`, VersionsLeiste). §7-Wortfeld-Tor («geprüft» verboten), R16 zu, Q1 Bandjahr, CLS 0.
  **Sequenz:** erst `fix/leitentscheid-stern-tooltip` + `feat/entscheid-verweis-praezision` mergen;
  `parts.tsx`-Eigentümerschaft geklärt (W2·5c fertig). Kein 26×-Bezug — parallel zu E3 fahrbar.
  Startseiten-Kachel «Meistzitierte Artikel» = Andockpunkt (W2·5c fertig, Fläche frei).
  **Detailquelle:** `FAHRPLAN-VERZAHNUNG-UI.md`.
- [x] **6a-MAT · Materialien-Verzahnung Stufe 1** *(DATA+UI, Worktree)* — Verwaltungsverordnungen/Wegleitungen als Kanten am Norm-Artikel (E6a Stufe 1 = nur Verweis-/Register-Ebene, §7 a–d). Komplett 4.7.2026 (M0–M5, PRs #126/#127/#128 + ESTV-KS/MWST + UI-Delta; 4 Quellen SECO/EDÖB/ESTV-KS/ESTV-MWST, Cutoff-Revisions-Invariante, Gegenprüfung bestanden, CLS 0). Kein 26×-Bezug. Spec `FAHRPLAN-MATERIALIEN-VERZAHNUNG.md`. **Chronik:** `ROADMAP-CHRONIK.md` → W2·6a-MAT.
  <!-- @meta id: W2·6a-MAT · status: done · of: ja · blocker: null · dep: [W2·7-VZUI] · kollision: [scripts/materialien/**, public/materialien/**, src/lib/materialien/typen.ts, src/lib/materialien/register.ts, src/pages/Materialien.tsx, src/lib/kontext.ts, src/components/kontext/KontextPanel.tsx] · worktree: ja · 26x: nein · fahrplan: FAHRPLAN-MATERIALIEN-VERZAHNUNG.md -->
- [x] **7 · Verzahnungs-Klingen** *(`[OF]`, amtlich)* — GEBAUT 5.7.2026: (a) Verjährungs-/Gewährleistungs-Board · (b) Verzugs-/Inkasso-Strecke · (c) Gerichts-Baustein-Set (Zitierer + Rubrum-Vorlage). Reine Darstellung auf bestehenden Engines (§3), golden 201 (+8 additiv), Gegenprüfung bestanden. **Chronik:** `ROADMAP-CHRONIK.md` → W2·7.
  <!-- @meta id: W2·7 · status: done · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->
- [ ] **8 · Schriften-Baukasten** *(VORLAGEN, Worktree)* — Berufung/BGG-Beschwerde/Sistierung/
  <!-- @meta id: W2·8 · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/lib/vorlagen] · worktree: ja · 26x: nein · fahrplan: FAHRPLAN-VORLAGEN-AUSBAU.md -->
  Beweisverzeichnis über `vorlagen/engine.ts`; Zulässigkeit nur Hinweis, Status «entwurf».
- [ ] **9 · Aufräum-Item** *(UX-PUNKTELISTE ⚫ überholt)*. Deliverable = Mapping-Tabelle
  <!-- @meta id: W2·9 · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein · fahrplan: FAHRPLAN-UX-PUNKTELISTE.md -->
  **alt-Punkt → Code-Pfad → Status**, *bevor* Restpunkte C2/C5 angefasst werden.
- [ ] **12 · Code- & Bibliothek-Hygiene** *(Auftrag David 12.7.2026, `[OF]`; Ultracode-Audit
  <!-- @meta id: W2·12-HYGIENE · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/data/tarif, src/lib/vorlagen/datum.ts, src/pages/gesetz-leser/inhalt.tsx, src/components/forms, bibliothek/INDEX.md, scripts/bibliothek-check.sh] · worktree: ja · 26x: nein · fahrplan: FAHRPLAN-CODE-HYGIENE.md -->
  41 Befunde + 3 Kritik-Linsen mit Repo-Stichproben)* — 14 Bau-Einheiten **H-1…H-14** in
  Risikoklassen-Reihenfolge: P0 Doku-/Git-Hygiene (Bibliothek-Wahrheits-Sweep inkl.
  SH-Doppel-Wahrheit §5/S8, check-Scope, 16 gemergte Branches) → P1 verhaltensneutraler Code
  (Tot-Sweeps src/scripts, Kanton-Typ-Konsolidierung, SG-60.13-Staffel-Generator, Import-Zyklen
  + `check:zyklen`-Tor) → P2 gegated (Format-SSOT `lib/format.ts` + Gegenprüfung,
  §6.6-Splits billig, `zahl()`-Eingabe-Entdopplung [Commit B = deklarierte UI-Änderung],
  Vorlagen-Schema-Konventionstest) → P3 nach PR-Kette #164/#165 (grosse §6.6-Splits,
  engine-map). **GESPERRT ohne David:** Alt-Engine-Ablösung Gründungsgebühren (BE>20-Mio-
  Divergenz, Entscheid-Queue). **Eskaliert (scope-fremd):** NE-Umzugsprüfung (per 12.7.
  FÄLLIG) + 10 Fedlex-Wiedervorlagen 1.8. → Currency-Slot, s. «Pflege & Termine».
  Beweisregeln G1–G3 (richtiger Beweis-Anker je Fläche, keine Beweisklassen-Mischung pro PR,
  Gegenprüfungs-Pflicht Risikopfade) im Plan. Detail: **`FAHRPLAN-CODE-HYGIENE.md`**.
  Trailer `Roadmap: W2·12-HYGIENE`.
- [ ] **13 · Kantonale Gesetze & Darstellung** *(Auftrag David 12.7.2026, `[OF]`; Ultracode-Audit
  <!-- @meta id: W2·13-KANTONE · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/normtext, src/pages/gesetz-leser/inhalt.tsx, src/pages/GesetzLeser.tsx, src/components/NormText.tsx, src/lib/suche/onlineVolltext.ts, src/lib/normtext/relevanz.ts, public/normtext/kanton] · worktree: ja · 26x: nein · fahrplan: FAHRPLAN-KANTONE.md -->
  44 Befunde + 3 Kritik-Linsen, davon 10 live an Amtsquellen re-verifiziert)* — **14 sofort
  baubare Einheiten K-1…K-14** (kantons-einzelne Fixes + Display-/UI-Schicht, slot-frei):
  P0 Reader-Treue (Lesereihenfolge in 404 Erlassen zerrissen · GL-Routen tot · falsches
  «SR»-Label) → §8-Ehrlichkeit (Currency-Chip «Geltung ungeprüft», Kontext-Panel-Hinweis,
  Abdeckungs-Ausweis) → Suche-Ebenen-Fix (Kanton-Treffer landen auf `/gesetze/bund/`) →
  Einzel-Nachzüge (ZG-161.7 stale seit 1.7.! · SZ-Stand-2027 · Invariante «stand ≤ heute») →
  NormText-§-Verweise (F41 vor F40) → Quellen-Hygiene (9 lexfind-quelleUrls = §7-Verstoss →
  amtliche Portale, Dedupe-Tor) → PDF-Werkstatt (Dehyphenation-**GATE** vor jedem
  FR/VS/AR-PDF-Nachzug; VD/SZ/ZH-Profile) → Werkzeug-Brücke, AR-Sidecars, Perf-Profil,
  Reports, Systematik-7, Zitat-Vokabular-POC. **Gegatet dahinter (26×-Slot durch E3 belegt,
  nur ausgewiesen): K-G1…K-G5** — pre-S1-Regenerationswelle (93 Snapshots/23 Kantone),
  Currency-/Juli-Drift-Läufer, Gliederungs-Extraktion korpusweit, Tabellen/Barème,
  Vollkorpus-Ausbau (BS+AR = 91,4 % des Korpus, ZH 3/~940) — **K-G5 hängt in `W3·12` ein,
  kein Parallel-Schritt** (§14.3). Risikopfade (Tarif/Extraktion) je Opus + `gegenpruefung`.
  Verworfen u. a. Client-Kanton-Suchindex (K10/§15-Arbiter). Detail: **`FAHRPLAN-KANTONE.md`**.
  Trailer `Roadmap: W2·13-KANTONE`.

### Welle 3 — Tiefe / Breite (opportunistisch)

- [ ] **10 · Neue Rechner-Klingen** *(`[OF]`, §2/§7)*: **Zustellfiktions-Engine** (deterministisch,
  <!-- @meta id: W3·10 · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->
  fristrelevant) · **Gesellschaftsrechtliche Schwellen-Module** (OR 727/671/653s, harte Zahlen) ·
  **Schutzrechts-Gebühren IGE** · **Normfassungs-/Geltungsstand-Prüfer** (intertemporal) ·
  **Kantonale Gerichtsferien-Datenschicht** (eigene/zusätzliche Gerichtsferien im kant.
  Verfahrensrecht VRPG/Justizgesetz, optionale Schicht über der bestehenden `stillstandsperioden`-
  Strategie, je Kanton eigene Deklaration — **26×-Datenasset, Leitprinzip 4/Slot beachten**;
  Bau-Auflagen Zustellfiktion SchKG strikt trennen, BGE 138 III 225 nur offengelegte Annahme:
  `archiv/FAHRPLAN-PRODUKTAUSBAU-BURGGRABEN.md` §P3).
- [ ] **11 · Gesetzgebungs-/Rechtsetzungs-Tracking** *(neu, amtlich)*. Übersicht «was kommt»:
  <!-- @meta id: W3·11 · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->
  Vernehmlassungen (admin.ch), Parlamentsgeschäfte (parlament.ch), in AS/BBl publiziert aber noch
  nicht in Kraft (Fedlex), künftige Fassungen — Drift gegen die geltende Fassung. Andockpunkt
  `fedlex.ts`/Drift-System.
  **Teil-ERLEDIGT 10.7.2026 (Fedlex-Portfolio Paket 3):** Vernehmlassungen über den Fedlex-Graphen
  (822 Verfahren, direkte `foreseenImpactToLegalResource`-Kante; Status/Frist/DE·FR·IT; Norm-Kontext-Bus
  «Gesetzgebung in Arbeit», laufend zuerst). Currency-Tor `check:vernehmlassungen-netz` + Offline-Assertion.
  Detail `FAHRPLAN-FEDLEX-PORTFOLIO.md §Paket 3` + `bibliothek/materialien/vernehmlassungen-2026-07-10.md`.
  **Rest offen:** Parlamentsgeschäfte (parlament.ch), künftige-Fassungen-Drift, Übersichtsseite «alle
  laufenden Vernehmlassungen», Laufend-Badge im Reader-Kopf (gesetz-leser war TABU).
- [ ] **12 · Kanton-Gesetze-Bündel** *(GESETZE-IMPORT-3TIER + BS-VORBILDKANTON + RECHTSSAMMLUNG P6 + POPUP-Kanton-Rest, 26×)*. **Erst öffnen, wenn
  <!-- @meta id: W3·12 · status: parked · of: ja · blocker: 26x-slot · dep: [] · kollision: [] · worktree: nein · 26x: ja · fahrplan: FAHRPLAN-GESETZE-IMPORT-3TIER.md -->
  der Prozesskosten-26×-Slot frei ist** (Schritt 4). §14-gebündelt (Phase 0): führende Detailquelle
  `FAHRPLAN-GESETZE-IMPORT-3TIER.md`; **BS-Sofortfixes S1–S13** = `FAHRPLAN-BS-VORBILDKANTON.md`
  (korpusweiter Adapter-Hebel VOR jedem Bulk); Volltext-Kanton = `FAHRPLAN-RECHTSSAMMLUNG.md` (P6).
  BS-Pilot; Kantonale-Entscheide-Import hart **nachgelagert**, nie gleichzeitig. *Werkzeug-Funde (Audit 1):
  LexWork-Adapter auf dieselbe DOM-Parser-Infra wie der linkedom-POC heben (strikt NACH dessen Bestehen, B5);
  `pdfplumber` (Python) NUR als nicht-lasttragendes Gegenprüf-Skript, falls die TS-PDF-Extraktion
  (pdfjs-Koordinaten) belegt versagt (B3) — kein Sprachwechsel am Produktpfad.*
  **Zubringer (12.7.2026):** `FAHRPLAN-KANTONE.md §K-G5` liefert Priorisierung
  (ZH→BE→VD→AG→SG→LU→GE), Kern-Erlass-Inventarquelle und §7-Quell-Menü-Auflagen
  (kein Headless, lexfind nur Fakten-Signal) — dort einhängen, kein Parallel-Schritt.
- [ ] **13 · Vorlagen-Breite** *(VORLAGEN V5/V6/V8, GMBH G2, VERTRAGS-VARIANTEN P3; Worktree)*.
  <!-- @meta id: W3·13 · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/lib/vorlagen] · worktree: ja · 26x: nein -->
  Tiefe vor Stückzahl. GmbH qualifizierte Gründung (777c II) · Musterklagen (Bauhandwerkerpfand) ·
  Basistypen (Kauf/Fahrniskauf Art. 184 ff. dispositiv, Schenkung/Pacht/Darlehen/Bürgschaft).
- [ ] **14 · Multi-Pane / Split-View** *(SPLIT-VIEW, Fundament-Umbau, eigener Worktree; Auftrag
  <!-- @meta id: W3·14 · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/components/layout/Shell.tsx, src/components/layout/Topbar.tsx, src/App.tsx, tailwind.config.js] · worktree: ja · 26x: nein · fahrplan: FAHRPLAN-SPLIT-VIEW.md -->
  David 29.6.2026)*. 2–3 „Engines" nebeneinander **wie im Browser** → der **Verzahnungs-Burggraben
  sichtbar** (Gesetz | Rechner | Begründungs-Absatz). **Erst Strang A** (Inhaltsbreite-Umschalter
  kompakt/breit, klein, `[OF]`), **dann Strang B** (Split-View: `RouteSwitch`-Extraktion →
  Container-Query-Fundament → Pane-Container in `Shell` → Steuerung → Scroll/A11y pro Pane →
  Mobil-Faltung; Layout-Modus **B3** Primär-URL + teilbar; bis **3 Panes** responsiv). Strikt
  zustandslos (Panes speichern nur Pfade, §5/§8); Lesespalte `max-w-reading` bleibt schmal (§13.2).
  **Kernaufwand = CSS Container-Queries** (450 Viewport-Breakpoints brechen in schmalen Panes;
  gestuft CQ-1). Detail + Architektur-Befund: `FAHRPLAN-SPLIT-VIEW.md`. §12-Kollisionsdateien
  `Shell.tsx`/`Topbar.tsx`/`App.tsx`/`tailwind.config.js` → nie parallel.
  - [x] **Gebündelt (Auftrag David 29.6.2026): Bildschirm-/Responsive-Audit** *(SPLIT-VIEW, `[OF]`)* — AUDIT GEFAHREN 5.7.2026 (rein lesend, PR `chore/responsive-audit`): 30 Motive × 5 Breiten = 150 Aufnahmen, 0 Seiten-Overflow, 12 Defekte geflaggt; Befund `abnahme/responsive-audit/BERICHT.md`, Fixes = spätere Schritt-14-Einheiten. **Chronik:** `ROADMAP-CHRONIK.md` → W3·14-Responsive-Audit.
    <!-- @meta id: W3·14-Responsive-Audit · status: done · of: ja · blocker: null · dep: [] · kollision: [] · worktree: ja · 26x: nein -->
  - [x] **Responsive-Audit-Defekte D1–D10 abgearbeitet** *(reines UI, Go David 10.7.2026, Branch `fix/responsive-audit-defekte`)* — **gefixt:** D1 Vorschau-FAB (Karten-Optik → gefülltes Pill), D2 Shell-Kopf/Fuss-Tap-Ziele auf 44px, D3 Methodik-Pflegeliste mehrspaltig (Höhe −43 %), D5 «A− A+»-Steller + Header-Suche, D9 Gesetze-Placeholder, D10 Chip-Band-Scroll-Affordance. **Bereits geheilt (empirisch belegt):** D7 (Container-Breiten jetzt konsistent 1120px, via A15-Refactor #908bf143) · D8 (Ingress jetzt max-w-reading). **Caveat/nicht Code-Defekt:** D4 (Headless-PDF-Artefakt, Fallbacks vorhanden) · D6 (Sticky-Sidebar-Screenshot-Artefakt) — beide zudem im TABU-Pfad `gesetz-leser/**`. Status je Defekt in `abnahme/responsive-audit/BERICHT.md`.
    <!-- @meta id: W3·14-Responsive-Defekte · status: done · of: ja · blocker: null · dep: [] · kollision: [] · worktree: ja · 26x: nein -->
  - [ ] **+ Auftrags-Eingang 30.6.: Bündel S** — **S1** Breadcrumbs in der Pane laufen über globalen
    <!-- @meta id: W3·14-S · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: ja · 26x: nein -->
    Router-`<Link>` (`InhaltsKopf.tsx` Z.30) statt PaneKontext-Navigator → fixen · **S2** Tracker «alles
    schliessen» muss auch `usePaneLayout` (Pane-Store) leeren. S1+S2 bündeln. Details im Eingangsblock oben.
  - [ ] **Split-View a11y-Restpunkte** *(SPLIT-VIEW, `[OF]`, NIEDRIG — aus §9-Bug-Check 29.6.2026)* —
    <!-- @meta id: W3·14-a11y · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: ja · 26x: nein -->
    3 verifizierte, bewusst **nach** dem Prod-Deploy zurückgestellte Kanten (Fokus-Logik-Regressions-
    risiko vor Deploy zu hoch): **#4** `usePaneLayout.ts` Z.102–110 strippt `?p=` per
    `history.replaceState` am React-Router vorbei → `useLocation().search` veraltet (Sidebar-Aktiv-
    Markierung); Fix = `navigate(…, {replace:true})`. **#6** `gesetz-leser/inhalt.tsx` Z.855 —
    F6-Panewechsel verlässt die Fokus-Falle des offenen In-Pane-Drawers (F6-Guard `Shell.tsx` prüft
    nur `aria-modal="true"`); Fix = Guard auf offenen fokus-gefangenen Drawer weiten. **#7**
    `Shell.tsx` F6-Handler ordnet Fokus auf PaneKopf-Knopf/Gutter dem falschen Pane zu; Fix =
    `data-pane-root`-Marker + `closest()`. (#1/#2 MITTEL + #3/#5 NIEDRIG am 29.6. gefixt + deployt.)

### Studierende-Layer (querliegend, `[OF]`, billig)

Kaum eigene Engines — **Erklär-/Übungs-Schichten** auf amtlicher Substanz (§3, Darstellungsschicht):
ausklappbarer **Rechenweg/«Warum»** an den Rechnern (Begründungs-Baustein), der **Mehrsprach-Vergleich**
(Schritt 6) als Auslegungsübung, **amtliche Zitierhilfe** (aus Schritt 7), der **Norm↔Entscheid↔
Rechner-Lernpfad** (Schritt 2/6). Einbau jeweils im Mutter-Schritt, nicht als eigener Strang. Gilt
sinngemäss für jeden fachfremden Rechtsanwender (Ämter/Steuerbehörden/Treuhänder — Nordstern 3.7.);
Sprachregel bleibt CLAUDE.md §13.3 (klar für Fach UND Laie) — keine parallele «Nicht-Juristen-Layer» erfinden.

---

## 🚀 Batch-Deploy-Fenster (eigenes Item)

✅ **Erledigt 2.7.2026** — der aufgestaute Stand (Beurkundungs-Ausbau, Vertrags-Varianten P0–P2, S0,
Welle-1-Ergebnisse, M13, Bündel N, AKN-Batch PR #78) ist auf PROD (Deploy `a3769d72`). Das Fenster
bleibt als **Mechanismus**: künftige gegatete Stände sammeln, Push/Deploy **nur auf Davids frisches
Ja** (§9), aus sauberem HEAD-Worktree (§12).

---

## Geparkt (bis ≥1.12.2026 / Nutzerfeedback / Markt)

- **Dossier / Fall-Rückgrat** *(FALL-RUECKGRAT, G3.3, PRODUKTAUSBAU Säule A)* — Mandats-/Dossier­
  verwaltung & «Meine Fristen». Vorerst draussen; alle Werkzeuge bleiben stateless. Umfasst auch
  das nie gebaute schlanke URL-Kontext-Rückgrat (PRODUKTAUSBAU P2, A-E0–E3 `fallakte`/`c_`-Transport)
  samt Bau-Auflagen (keine Kanonisierung mehrdeutiger Beträge, `koPrefill` nicht anfassen) — Detail
  `archiv/FAHRPLAN-PRODUKTAUSBAU-BURGGRABEN.md` §P2.
- **Markt-Themen** — Hosting (Infomaniak), Domain `lexmetrik.ch`, Zahlung (Payrexx/Datatrans/TWINT),
  Login/Pro.
- ~~Grundsätzliche Startseiten-Überarbeitung~~ — **✅ ENTPARKT 3.7.2026 → Welle 2 · Schritt 5c**
  (Ultracode-Recherche + bindendes Council-Verdikt; bündelt Redesign-zurückgestellt 16.6.,
  FUNDAMENT-Startseitenrahmen, I1 + I2; Spec `FAHRPLAN-STARTSEITE-V3.md`).
- **Live-Rechtsprechung** — §4-blockiert (s. Verifikations-Blockaden).
- **Betriebs-Instrumente (später):** Sentry (erst bei Traffic; A5-Fehler-Link deckt jetzt) · CodeQL ·
  `npm audit` als Prüf-**Meldung** (nie Stopper) · Claude-Code-PR-Action (bewusster Entscheid) —
  Detail + Verworfen-Liste: `BACKLOG-AUDIT-WERKZEUGE-2026-07.md`.
- **Abnahme-Warteschlange** (Haftungsrang: 1 Fristen → 2 Form-Gate-Vorlagen → 3 Beträge; aufgereiht,
  nicht gedrängt): BGER-RECHTSWEG (§7) · BEURKUNDUNGS-AUSBAU · NOTARIAT/LUECKEN (`geprüft`) ·
  GESETZESTEXT-POPUP-Snapshots · GRUNDLAGEN G2/B.
- **Offene David-Grundsatzfragen** (gebündelt mitführen): Dienstjahr-Stichtag Kündigungsfrist ·
  Sperrtage-Konvention · 3 Export-Antworten · GebV-SchKG-Promille-Rundung (0.01 vs. amtlich 0.05).

---

## Pflege & Termine  *(Quelle: `bibliothek/register/parameter-verfall.md`)*

- **30.6.2026** — SG-GKV (= S0). · **Anfang Sept.** — Referenzzins (quartalsweise). · **1.11.2026**
  — BE-Formularpflicht. · **Vor SchKG-Abnahme** — GebV-SchKG-Revision AS 2025 630 vs. Staffel 1.1.2022.
  · **Vor Mietvertrags-Abnahme** — VMWG Art. 19a am Original. · **Feiertage** je Kanton vor «geprüft»
  (BJ-Liste Stand 2011).

---

## Funktions-Katalog (Aufbau + Auflagen je Werkzeug)

Quellen durchgehend amtlich (Fedlex / amtliche Sammlungen / amtliche Entscheide+Regesten / amtliche
Tarife+Verzeichnisse — Art. 5 URG). Alle Werkzeuge **stateless**. «grenzwertig» = amtlich nutzbar mit
harter Auflage.

| Werkzeug | Welle | neu/vorh. | §2 | Quelle amtl. | Aufw. |
|---|---|---|---|---|---|
| Fristen-Cockpit (Vorw./Rückw./Stillstand) | 1 | Verpackung | ja | ja | M |
| Streitwert + Grenzwert-Abgleich | 1 | Ausbau | ja | ja | S |
| Zuständigkeits-/Verfahrensnavigator | 1 | Ausbau | ja | ja | S |
| Rechtsmittel-/Eintretensprüfung | 1 | neu | teils | ja | M |
| Prozesskosten-Cockpit (Risiko/Festsetz./Dispositiv) | 1/2 | Verpackung | ja | ja | L |
| Norm→amtlicher Entscheid (Recherche) | 1/2 | Ausbau | ja | grenzwertig | M |
| Mehrsprach-Vergleich DE/FR/IT | 2 | neu | ja | ja | L |
| Verjährungs-/Gewährleistungs-Board | 2 | Ausbau | ja | ja | M |
| Verzugs-/Forderungs-/Inkasso-Strecke | 2 | Verpackung | teils | ja | M |
| Gerichts-/Behörden-Adressregister | 2 | Verpackung | ja | ja | M |
| Gerichts-Baustein-Set (Rubrum + Zitierer) | 2 | Verpackung | ja | grenzwertig | M |
| Schriften-/Eingaben-Baukasten | 2 | Ausbau | teils | ja | L |
| Gesetzgebungs-/Rechtsetzungs-Tracking | 3 | neu | teils | ja | M |
| Zustellfiktions-Engine | 3 | neu | ja | ja | M |
| Gesellschafts-/Schwellen-Module | 3 | neu | teils | ja | L |
| B2B-/Basis-Vertragsbaukasten | 3 | Ausbau | ja | grenzwertig | L |
| Schutzrechts-Gebühren (IGE) | 3 | neu | ja | ja | M |
| Normfassungs-/Geltungsstand-Prüfer | 3 | neu | teils | ja | L |

**Kern-Auflagen (§1/§2/§8-kritisch):**
- **Fristen-Cockpit:** Vorwärts nur mit *bestehenden* Auslösern bündeln (jede neue Ereignis→Frist-
  Abbildung ist verifikationspflichtiger Rechtsregel-Code → bricht `[OF]`); stateless.
- **Streitwert:** ZPO-Streitwert ≠ BGG-Schwelle (Art. 51–53 vs. 74 BGG); `kostenBasisCHF` nur ins
  Kosten-Cockpit, `streitwertVerfahrenCHF` nur in Zuständigkeit/Rechtsmittel; Ermessen → `null`, nie 0.
- **Rechtsmittelprüfung:** BGG-Schicht an `berechneBgerRechtsweg()` **delegieren**, nicht neu codieren;
  nicht-rechenbare Tore (Art. 74 II lit. a, Art.-83-Katalog) als «selbst prüfen», keine Scheinpräzision.
- **Prozesskosten:** Dispositiv bei Ermessenstarif nur Spanne+Kriterien; bei `quote=null` keinen Saldo
  erzwingen; §8-Disclaimer auch im Gericht-Modus; MwSt nur auf Schalter.
- **Recherche/Gerichts-Set (grenzwertig):** nur amtliche Regeste **oder** eigene maschinelle (Marker
  «maschinell»); kein fremdverfasster Drittleitsatz; `statutes[]` = «genannt/zitiert», nicht «einschlägig».
- **Adressregister:** Lese-Schicht, kein Datenduplikat; Zuständigkeits-Schluss bleibt im Navigator;
  «noch nicht erfasst» statt raten; Stand + Verfallsregister.
- **Verzug/Inkasso:** Reverse-Reader nur strukturierte Eingabe (kein Freitext/LLM); Mahnung ruft Engine,
  rechnet 5 % nicht nach (§5).
- **B2B-Vertrag (grenzwertig):** vorhandene Schemas (NDA/Auftrag/Zession) nicht neu bauen (§5); nicht-
  dispositive Klauseln nur an konkrete Norm verankert oder mit §8-Offenlegung weglassen — kein
  Kommentar-/Verlagswortlaut.
- **Schwellen-Module:** OR 727 I = 2 von 3 Schwellen in **zwei** Folgejahren; DSG kennt keine 72h-Frist
  («so rasch als möglich») → kein numerischer Wert, nur Zitat + §8.

---

## Strang-Detailpunkte & Hygiene  *(steuern nicht — Heimat = jeweilige `FAHRPLAN-*.md`/`STRUKTUR.md`)*

- **Offene Detailpunkte:** GRUNDLAGEN G3.4 kant. Stammdaten · BS C3/§-Verlinkung/N5/D3 · POPUP
  PDF-only-Kantone/Token-Lücken · LUECKEN L7 Konfidenz-UI/L8 · NOTARIAT NG-4 Zweitpass · TARIF G3b
  komplett (A+B+C+D); Residuum = 32 mehrdeutige SG-Restblöcke (faithful Plaintext, §1) + eigener
  ZH-PDF-Strang (ZH-243 NotGebV §17 / hierarchische Ziffer-Tarife, andere Risiko-Klasse).
  **ERLEDIGT 5.7. (SG-2935-Rohtext-Reparatur, Branch `fix/sg2935-x-spalten`):** der
  Gegenprüfungs-Vorbefund (SG-2935 21.03–21.06/3.04–3.07/24.01 fehlten komplett) ist behoben —
  Wurzel war KEIN Zweispalten-Merge, sondern das Kopf-/Fussband im falschen Koordinatenraum
  (MediaBox-Ursprung y0≈123 vs. `viewport.height*0.9`-Schwelle → oberste Positionszeilen jeder
  Anhang-Seite als Schein-Kopfband verworfen) + verworfene ~0-breite Wort-Trenner-Fragmente
  (Verklebungen) + umgebrochene Querverweis-Zeilen als Schein-Positions-Köpfe (Gegenprüfungs-D1–D3
  → Geometrie-Orakel `istZifferKopfZeile`: Kopf nur in der Nr.-Spalte). Fix in `adapter-pdf.ts`
  (`bandSchwellen` MediaBox-relativ, origin-0 byte-identisch) + `anhang-segmenter.ts` (Orakel);
  SG-2935 83→112 Positionen (25.10 zeigt wieder amtliche 100.–), SG-2808/3849 wortlaut-treuer
  (verlustfrei; 3849: 4 Phantom-Positionen aus Nachtrags-Historie entfernt). Korpus-Probe über
  alle 27 PDF-Kanton-Snapshots: 10 weitere Nicht-SG-Dateien tragen Wortlaut-Verbesserungen durch
  denselben Fix (LU/FR/VS/SZ×4/VD×3, davon SZ-280.411 auch MediaBox-versetzt=Band-Klasse) —
  Nachzug via `normen-monitor`-Drift (`check:pdf-netz` wird rot) bzw. gezielte Regeneration,
  Detail `FAHRPLAN-TARIF-TABELLEN-STUFE2.md` §SG-2935-Reparatur.
- **Infrastruktur-Fundament:** GESETZESTEXT-POPUP (Snapshot/Drift) trägt RECHTSSAMMLUNG/Rechtsprechungs-
  Verzahnung/GESETZE-IMPORT → vor aufsetzenden Strängen mitdenken.
- **Archiv-Kandidaten** (Code-Stand prüfen): INTERNATIONAL-VOLLTEXT-Rest.
  RECHTSPRECHUNG-Dach/TARIF-STUFE2/BGER-RECHTSWEG deployt → nur Abnahme.
  **Methode** (verify-then-archive, ultracode): die 28→`ROADMAP.md`-Konsolidierung ist seit 28.6.
  erledigt — offen ist nur das Archivieren obsoleter `FAHRPLAN-*.md` (Repo-Wurzel). Je FAHRPLAN
  prüft **ein Opus-Agent**, ob ALLE offenen Punkte bereits in `ROADMAP.md` stehen; nur zu 100%
  gemappte Dateien wandern per `git mv` nach `archiv/` (kein Informationsverlust), der Rest bleibt
  liegen bis gemappt. Reine Doku-Hygiene → kein Deploy/§9, kein Golden/§6, kein Worktree-Zwang
  (keine Kollisionsdatei, §12). `[OF]`
- **Stale Doku-Köpfe** (in der jeweiligen `FAHRPLAN-*.md` korrigieren): POPUP «27»→218 · VERTRAGS-
  VARIANTEN «1000» · LUECKEN · NOTARIAT-GRUNDBUCH.
- **Klein-Backlog** (Issue-Ebene): Direktklage Art. 8 ZPO < 100k plausibilisieren · stabile Keys in
  7 Listen-Editoren · Datepicker-Pfeiltasten · Markenschriften in Vorlagen-PDFs · Detailseiten-Titel an
  Katalog-Titel (§13) · CHF-Formatter `chf(n,dez)` als SSoT (nur mit Golden) · Norm-Chip-Kopien auf
  geteilten NormLink · Gründungs-Rahmen GmbH/AG teilen · 4× `MONATE`-Array → eine lib-Konstante ·
  GebV-SchKG: lokalen `staffel()`-Helfer (`gebvKosten.ts`) nur nach Charakterisierungs-Test der
  Bandgrenzen-Semantik aufs `tarif/staffel.ts`-Primitiv heben — bei Nicht-Deckung NICHT
  vereinheitlichen (§1 vor §6; `archiv/FAHRPLAN-PRODUKTAUSBAU-BURGGRABEN.md` §P4) ·
  **BGE-Metadaten-Asymmetrie** (OCL-Quelle, Befund Gegenprüfung 30.6.): bei manchen BGE
  `aktenzeichen`/`abteilung`/`titel` `null`, einzelne ohne `rubrum`/`dispositivOrders` (z. B.
  `151_V_30`) — Korpus-weit prüfen, ob aus `full_text`/`citation` nachziehbar (kein Inhalts-/
  Identitätsproblem, rein Metadaten; `[OF]`).

---
*Konsolidiert 28.6.2026 aus den 26 `FAHRPLAN-*.md` + Strategie-Dokumenten + dem früheren
`HANDLUNGSPLAN.md` (→ `archiv/`) + ultracode-Funktions-Ideation (alle Juristen, amtliche Quellen).
Detailquellen = die jeweilige `FAHRPLAN-*.md`; Ist-Zustand/Deploy = `STRUKTUR.md`; G1-Abdeckung =
`KATALOG-ROADMAP.md`. Diese Datei ordnet sie und ist der eine Plan, der Schritt für Schritt
abgearbeitet wird.*
