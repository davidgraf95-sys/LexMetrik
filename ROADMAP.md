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

---

## ⚡ S0 — fristgetrieben (FRIST 30.6.2026) — ✅ gebaut + gegated 28.6.2026 (live 2.7.2026, Deploy a3769d72)
<!-- @meta id: S0 · status: done · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->

**Verfallsregister mechanisch.** `check:verfall` muss den am 30.6. ablaufenden SG-GKV-Tarif +
die weiteren datierten Verfälle (s. «Pflege & Termine») erfassen und auf einer benannten UI-Fläche
sichtbar machen. `[OF]`. «Sichtbar» = verhaltensändernd → golden-gegated; bis 30.6. realistisch
**gebaut + gegated**, Live erst im Batch-Deploy-Fenster.

> **Erledigt 28.6.2026 (gebaut + gegated, deployt 2.7.2026):** Parse-Grammatik in eine geteilte
> Quelle gezogen (`scripts/verfall-parse.ts`, §5) — `check:verfall` (Tor) und neuer Generator
> `gen:verfall` teilen sie. Generator schreibt `src/data/verfallTermine.generated.ts` aus dem
> Register; Drift-Tor `check:verfall-ui` in der `check`-Kette. Benannte UI-Fläche: Abschnitt
> **«Aktualität & Pflege der Parameter»** auf `/methodik` (`src/components/VerfallUebersicht.tsx`)
> listet die 15 datierten Parameter mit nächstem Prüftermin; Tagesbezug (verfallen / bald fällig /
> aktuell) client-seitig (prerender-/hydration-sicher). SG-GKV 30.6. erscheint als «bald fällig»,
> ab 1.7. «verfallen». `npm run gate` grün, Golden byte-gleich. Deployt 2.7.2026 (a3769d72).

---

## Die geordnete Abarbeitung (DAS ist der Plan)

> Reihenfolge nach Praxis-Hebel × Machbarkeit ohne Fachzeit × Abhängigkeiten. Alles `[OF]`, sofern
> nicht vermerkt. Details + Bau-Auflagen je Werkzeug: «Funktions-Katalog» unten + jeweilige `FAHRPLAN-*.md`.

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

- [x] **1 · Begründungs-Absatz** *(BEGRUENDUNGS-ABSATZ, ~5 %)*. Aus dem Rechen-Ergebnis ein
  <!-- @meta id: W1·1 · status: done · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein · fahrplan: FAHRPLAN-BEGRUENDUNGS-ABSATZ.md -->
  **kopierfertiger, normgestützter Absatz** (UI **und** PDF), jeder Wert mit Norm+Link+Stand
  (schliesst die Rückrichtung *Werkzeug→Norm*). **Erst EIN Flaggschiff-Vertikalschnitt komplett**
  (Prozesskosten): Ergebnis → Absatz → PDF-Block → Kopier-Hook; dann Rollout.
  *Nächster Schritt:* PDF-Block (`pdfModel.ts`) + Kopier-Hook am Prozesskosten-Rechner; die 4
  David-Entscheide als **Default-und-Flag** setzen. §8-Rahmung «keine Rechtsberatung».
- [x] **2 · Norm↔Werkzeug-Brücke** *(RECHTSSAMMLUNG P4/D1)* — **Index-Teil erledigt 28.6.2026
  <!-- @meta id: W1·2 · status: done · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->
  (gegated, deployt 2.7.2026).** `werkzeugeFuerNorm` (erlass-granular, 17 Erlasse) benannt + Map
  `ERLASS_WERKZEUGE` exportiert + Konsistenz-Tor `werkzeuge.test.ts` (kein stiller Tippfehler →
  heimlich fehlendes Werkzeug, §8). Anzeige im Reader (KontextPanel «Passende Werkzeuge») bestand
  schon; **neu** dezenter «N passende Werkzeuge»-Hinweis auf der Erlass-Karte (`/gesetze`, Task
  4.3). SSoT = Katalog (§5). **Der zweiachsige Startseiten-Einstieg (Rechtsgebiet × Aufgabe) ist
  Schritt 5** (Welle 2) und nutzt denselben Index — kein zweiter Pfad.
- [x] **3 · Alltags-Rechner als Cockpits** *(neu-Verpackung vorhandener Engines, `[OF]`)* —
  <!-- @meta id: W1·3 · status: done · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->
  **abgearbeitet 28.6.2026:** #2 neu gebaut (Grenzwert-Abgleich); #3 + #4 bestanden bereits
  (kein §5-Duplikat gebaut); #1 zurückgestellt (S-5c-Konflikt, Davids Entscheid offen):
  - **Fristen-Cockpit** (Vorwärts/Rückwärts/Stillstand) über `fristenspiegel/` + `icsExport`.
    ⚠️ **Zurückgestellt:** kollidiert mit S-5c (10.6.: eigenständiger Fristenspiegel bewusst
    aufgelöst, Ereignisse in Fach-Rechnern). David möchte den eigenständigen Einstieg NICHT
    wieder einführen → nicht gebaut.
  - **Streitwert + Grenzwert-Abgleich** ✅ 28.6.2026 (gegated, deployt 2.7.2026): `streitwertGrenzwerte()`
    in `streitwert.ts` ordnet den Verfahrens-Streitwert STRIKT getrennt der ZPO-Verfahrensart
    (Art. 243 I, 30k) und der BGG-Beschwerde-Schwelle (Art. 74 I, 30k/15k Miete-Arbeit) zu; nicht-
    rechenbare Tore (243 II / 74 II / kant. Zuständigkeit / Art. 51–53 BGG) als «selbst prüfen» (§8).
    Schwellen am Snapshot verifiziert (§7). In `StreitwertForm` mit Gebiets-Toggle; Test + visuell.
  - **Zuständigkeits-/Verfahrensnavigator** (`zustaendigkeit/straf/schkg`) — ✅ bestand bereits
    vollständig: Rechtsweg-Switcher Zivil/SchKG/Straf, je Weg voller Flow + Hero + Permalink + PDF,
    6 Test-Dateien (inkl. `*Bericht`-Adapter), e2e. Verwaltung bewusst `aktiv:false` (nicht im Scope,
    bräuchte Verifikation). Adress-Ausbau = Schritt 6.
  - **Rechtsmittel-/Eintretensprüfung** — ✅ Logik bestand bereits: kantonal `bestimmeRechtsmittel()`
    (Berufung/Beschwerde, Fristen, Art. 314 Familienrecht, Stillstand) + BGG `berechneBgerRechtsweg()`,
    integriert in der Rechtsmittel-Gabelung des Navigators. Eine separate `rechtsmittel.ts` wäre
    §5-Duplikat → bewusst NICHT gebaut.
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
  - [ ] **+ Audit-Andockung 3.7.2026 (Audit 1, `BACKLOG-AUDIT-WERKZEUGE-2026-07.md`):** **N3 · `he` statt
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
- [x] **5c · Startseite V3 + Branding I2** *(STARTSEITE-V3, `[OF]`, eigener Worktree; Auftrag David
  <!-- @meta id: W2·5c · status: done · of: ja · blocker: null · dep: [] · kollision: [src/pages/Startseite.tsx, src/components/start, src/lib/navigation.ts, src/lib/seo.ts, index.html, tailwind.config.js, src/components/layout/Topbar.tsx, scripts/prerender.ts] · worktree: ja · 26x: nein · fahrplan: FAHRPLAN-STARTSEITE-V3.md -->
  3.7.2026)*. **✅ GEBAUT 3.7.2026 — Bausequenz S1–S5 komplett** (PRs #106 Messaging-SSoT ·
  #107 Plumbing · #108 Bugfixes · #111 Neukomposition · S5 Brass-Hero; je Schritt Tore grün,
  golden 201 byte-gleich, S4 e2e VOLL 89 passed, S5 Kontrast GEMESSEN hell+dunkel mit 2×
  ink-500→ink-600-Ausweich [axe fing den zweiten] + dokumentierter Input-Ruhe-Grenze
  [nicht-regressiv]; **Abnahme-Mappe `abnahme/startseite-v3/`** für Davids spätere Sichtung —
  kein Druck, Zeitsperre). **Gesetz-/Entscheid-Titel im Zuletzt-Tracker ✅ 3.7.2026**
  (Schreibzeit-Auflösung via lazy Manifest-Lader in `lib/zuletztTitel.ts` — dynamic import
  erst beim Track-Event per requestIdleCallback+setTimeout-Fallback; Startseiten-/Shell-Chunk
  ohne Register-Import [browse-Chunk hash-identisch, +1,1 KB reiner Tracker-Code], Kurzform
  Kürzel/Zitierung mit Wortgrenzen-Kappung, Alt-Einträge ohne Titel crash-frei gefiltert;
  Playwright-Nachweis OR→«OR», Entscheid→Zitierung, Rechner unverändert). **Rest offen (kein
  Blocker):** Doks-Wording «deterministisch statt KI-geschätzt» ✅ nachgezogen (5.7.2026) · Wash-Ton-Veto =
  Ein-Klassen-Fallback `bg-surface` in `Hero.tsx`. *Ursprünglicher Auftrag:* Neubau der Einstiegsseite: **modular** (Modul-Registry als FUNDAMENT-Vorleistung),
  einfacher Einstieg in alle Funktionen, willkommend + modern OHNE Startup-Look. **Design-Richtung
  durch DMAD-Council BINDEND entschieden** (Delegation David): Hybrid «A-Basis + Brass-Hero» als
  Schalter-Liste — `bg-brass-100`-Hero mit integrierter Suche als einzige Wärme-Dosis (Fallback
  `bg-surface`), KEINE Deko-SVG/Badges/XL-Typo/Gruss-Wort; Schnellrechner VOR den Kacheln;
  Favoriten → «Zuletzt verwendet»; Zeiterfassung als Sektion auf `/rechner` (keine neue Route,
  `ERWARTETE_ROUTEN` bleibt 57); H1 wird Value Proposition, I2-Messaging-SSoT in `seo.ts` +
  neues Tor `check:seo-index`. **Bündelt:** geparkten Startseiten-Merker (30.6.) + I1
  Sidebar-Reihenfolge + I2 Branding + W2·5-Startseiten-Modul-Rahmen + Redesign-zurückgestellt
  (16.6., Kernideen im Council verwertet). **Bau-Spec (bau-fertig für autonome Opus-Session,
  10 verbindliche Auflagen + erzwungene Bausequenz Plumbing→Hero-zuletzt):**
  `FAHRPLAN-STARTSEITE-V3.md`; Herleitung + volles Council-Verdikt:
  `bibliothek/recherche/startseite-v3-design.md`. **Auflagen-Kern:** Status-Wording §8-ehrlich
  (kein «jede Angabe»-Absolutum, kein «geprüfte Bausteine»), Kontrast-MESSUNG vor Merge,
  golden byte-gleich, e2e-Anker erhalten, §12-Koordination (tailwind↔W3·14, seo/prerender↔SEO-A11Y,
  Topbar/UniversalSuche↔E2-Suche), Pflicht-Screenshot-Serie + Abnahme-Mappe. Trailer `Roadmap: W2·5c`.
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
  U-LINIEN (überarbeitet G1+A8: Linien-Regeln aus dem TATSÄCHLICHEN Gesetzes-Aufbau,
  Struktur-Sidecar, neues Tor) → U-KOPF (umbaut G2a/G2b+A1/A3/A4: Fussnoten-AUS =
  verschwinden [überstimmt R9, David-Entscheid; heute dämpft CSS nur], Breadcrumbs,
  «Ansicht»-Dropdown; Golden-Klasse per P1-Beweis) → U-VERWEIS (A7/A10/A11/A13:
  Plural-Linker «in den Artikeln…», Präambel-Verweise, strukturiertes Verweis-Popover
  Artikel→Entscheide→Materialien — Risiko-Pfad, `check:gegenpruefung`) → U-POSITION
  (A2/A16/A17: Scrollbalken-Proportionalität, exakte Zurück-Restoration,
  Split-View-Fundstellen-Sprung — hart NACH QS-PERF). Parallel kollisionsarm:
  **U-SUCHE ✅ AUSGEFÜHRT (5.7., PR feat/u-suche-a5-a6, Auto-Merge armiert;
  Ausführungsvermerk `FAHRPLAN-GESETZES-UX.md` §10.7):** normQuery aus der
  gelöschten `BefehlsPalette` in die NORMALE Suchleiste (Sprung = oberster
  Treffer, Enter springt), Palette entfällt, ⌘K/«/» fokussieren die HeaderSuche;
  A6-Relevanz-Gruppierung (Rechtsinhalte vor Werkzeugen); KEIN Zweit-Index; Gate
  + e2e grün, `Gegenpruefung: n/a` · U-UEBERSICHT (A14/A15: Titel umbrechen statt kappen,
  Relevanz-Sortierung dokumentiert-deterministisch, Gliederungs-Umschalter
  Relevanz/Systematisch/Rechtsgebiet auf allen 3 Säulen; G6 = Modus statt vierte
  Tür) · U-PDF (A12: Download = amtliches PDF der gepinnten Fassung, SPARQL
  build-time, Pin-Überwachung). A18 (BGE-Regeste nach Sprachen) → W2·6-B B2.
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
- [ ] **6 · Konsultieren-Klingen** *(`[OF]`, amtlich)*:
  <!-- @meta id: W2·6 · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->
  - **Mehrsprachiger Normvergleich DE/FR/IT** (Auslegungswerkzeug, Art. 14 PublG — alle drei
    Fassungen gleich verbindlich). Heute nur `de` befüllt. *Aufbau:* Generator je Erlass 3
    Sprachfassungen aus Fedlex → `…<lang>.json`; Synopse-UI im Gesetzleser (Spalten + Diff).
  - **Recherche Norm → amtlicher Entscheid** (`norm-index.ts`, deterministisch, kein LLM-Ranking;
    Regeste nur amtlich oder eigene maschinelle, «maschinell»-Marker behalten).
  - **Gerichts-/Behörden-Adressregister** (Lese-/Index-Schicht über bestehende Stores, kein
    Duplikat; Abnahme-Status + Verfallsregister je Eintrag).
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
    - [D] **Fedlex-Datenarten-Portfolio** *(Plan 2.7.2026, §14-Intake je Paket pending David-Freigabe)* — 6 verwertbare
      Fedlex-Datenarten (Erlasse/Materialien/Verfahren/Staatsverträge u.a.), ausschliesslich amtliche Fedlex-Stelle
      (SPARQL + Filestore, nie Dritt-Repo). **Detailquelle:** `FAHRPLAN-FEDLEX-PORTFOLIO.md`.
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
    - [x] **Verweis-Präzision im Entscheid-Leser (Referenz BGE 151 III 377)** *(W2·6, `QS-GP`, 3.7.2026)*.
      **Teil 1 (Bug, §1-nah):** i.V.m.-Ketten-Verlinkung. Nur das letzte Glied trägt das Kürzel
      («Art. 684 i.V.m. Art. 679 ZGB»); das Kürzel wird jetzt auf die vorangehenden bare Glieder
      **propagiert** und jedes einzeln verlinkt — EINE Wahrheit `normVerweiseImText` (`fedlex.ts`),
      konsumiert von `NormText` (Inline-Linker) UND der Fundstellensuche. §1-Vorsicht: Propagation
      NUR über echte Konnektoren (i.V.m./in Verbindung mit/und/sowie/Komma) auf bare Glieder; bricht
      an Semikolon/BGE-Zitat/Satzgrenze/fremdem Kürzel; «f./ff.»+Abs./lit. brechen nicht; Anzeige
      zeichenidentisch (Auflösungsziel synthetisiert). Doppelt verifiziert: 342 Snapshots, **890
      propagierte Glieder / 686 Blöcke** (19870→20760 Links), 8 Handproben §1-korrekt.
      **Teil 2 (Feature):** (a) Erwägungs-Anker (`e-2-4`, marke-basiert, schon vorhanden) +
      Deep-Link-Scroll nach on-demand-Laden; (b) **Zitierte-Normen-Chips im Kopf → Sprung zur ersten
      Erwägung mit Fundstelle** (`ersteFundstelle`, gleiche Ketten-Logik → «Art. 679 ZGB»-Chip trifft
      die «Art. 684 i.V.m. Art. 679 ZGB»-Stelle in **E. 2.3.1**), lc-ziel-blink-Highlight, Regeste-
      Fallback. Tore grün (golden 201, tsc/lint/3127 Tests inkl. neuer Units, `check:entscheide`/
      `check:struktur-konsistenz`, Playwright), Snapshots unberührt (additiv).
    - [x] **BGE-Auszug abgeschnitten — vollständig gefixt (34/34)** *(W2·6-BGE, Inhaltsverlust, `[OF]`)*.
      29.6.2026 GEFIXT + verifiziert (gate/golden byte-gleich, zwei adversariale Gegenprüfungen
      gegen amtliche Quelle; die 1. fand einen Schutz-Tor-Blindfleck — Regex verlangte einen
      Buchstaben vor U+2026 und übersah 5 auf Space/Punkt/Ziffer endende Kappungen → Regex auf
      `(?<!\()…\s*$` geweitet, 5 nachgezogen, 2. Pass bestätigt). Die Default-«Auszug»-Ansicht der BGE-Leitentscheide schnitt Erwägungen
      >5000 Z. **still mitten im Wort** ab (U+2026): `holeBgeLeitentscheid` lud — anders als der
      Urteils-Body — den OCL-`/structure`-Auszug nicht voll nach (Datenfehler, nicht CSS).
      **Fix** (`scripts/normtext/adapter-entscheide.ts`): geteilter Helfer `fuelleGekappteErwaegungen`
      lädt gekappte Erwägungen (`holeErwaegung`) in BEIDEN Pfaden voll nach (Trigger: `text_chars
      ≥4900` ODER Ellipsis-Ende); **Id-Disambiguierung** gegen die präfixunscharfe OCL-Keyed-Lookup:
      mehrere Id-Formen probieren (`151_V_1` · `151 V 1` · `bge_BGE_151_V_1`), nur die EXAKT passende
      Entscheidung nehmen, Struktur über die kanonische `decision_id` holen.
      **Regenerierung** ohne Vollbau via neuem Flag `npm run entscheide -- --additiv --bge-refresh`
      (zieht nur die aktuell gekappten BGE neu, by-id-Überschreib; Bund/Kanton/eidg unberührt,
      §7 kein Hand-Edit). **Schutz-Tor** in `check:entscheide`: Block, der auf U+2026 endet
      (`(?<!\()…\s*$` — ausser amtl. «(…)»), ist ein gekapptes Excerpt → FEHLER/exit 1; deckt
      `abschnitte` + `auszugAbschnitte`. **Ergebnis:** ALLE 34 BGE regeneriert + voll, gate/golden
      byte-gleich, `check:entscheide` 0 Kappungen. **Öffnet keinen 26×-Slot.**
      - [x] **Rest 30.6.2026 geschlossen** — `bge_151_V_1`/`bge_151_V_30` (kurze Seiten-Ids, deren
        `/decisions/151_V_1` präfixunscharf auf `151_V_194` matchte) jetzt über die Id-Disambiguierung
        (`151 V 1` bzw. `bge_BGE_151_V_1` lösen eindeutig auf, ref=`BGE 151 V 1`) sauber re-gefetcht —
        kein Hand-Edit (§7). WARN-Quarantäne wieder entfernt, Tor ist reines FEHLER.
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
- [x] **6a-MAT · Materialien-Verzahnung Stufe 1** *(DATA+UI, Worktree)* — Verwaltungsverordnungen/
  <!-- @meta id: W2·6a-MAT · status: done · of: ja · blocker: null · dep: [W2·7-VZUI] · kollision: [scripts/materialien/**, public/materialien/**, src/lib/materialien/typen.ts, src/lib/materialien/register.ts, src/pages/Materialien.tsx, src/lib/kontext.ts, src/components/kontext/KontextPanel.tsx] · worktree: ja · 26x: nein · fahrplan: FAHRPLAN-MATERIALIEN-VERZAHNUNG.md -->
  Wegleitungen als Kanten am Norm-Artikel (David 3.7.: «SECO für ArG, EDÖB für DSG, ESTV für MWSTG»),
  E6a Stufe 1 = NUR Verweis-/Register-Ebene (Index-Karte + Norm-Mapping + amtlicher Link, §7 a–d
  korrekt gemappt inkl. sichtbarem Live-Link-Beweis, KEIN Volltext). **4 POC-bewiesene Quellen:**
  ESTV-MWST (artikelscharf via Fedlex-#art_N-Anker, ToC-Hash-Drift-Arbiter) · SECO ArG/ArGV 1
  (artikelscharf via Payload/Dateiname) · EDÖB Leitfäden (Erlass-Ebene ehrlich; VBGÖ gestrichen —
  nicht im Korpus) · ESTV KS/RS (Suffix-Kaskade; Seiten-Fallback ehrlich `quelle='maschinell'`).
  **Revisions-Invariante:** Cutoff-Tabelle je Erlass (revDSG/MWSTG-Teilrev) — artikelscharfe Kante
  nur bei Dokument-Stand ≥ Cutoff, sonst Downgrade Erlass-Ebene; UI sagt «verweist auf … (Stand des
  Dokuments)». SSoT `daten/soft-law.db` (gitignored) + **committeter Zustandsträger**
  `bibliothek/register/soft-law-zustand.jsonl` (append-only; Entlistetes nie löschen, aus Projektionen
  raus) → deterministische Projektion `public/materialien/kanten/<ERLASS>[/<bucket>].json`
  (Kanten je (Dokument, Artikel) aggregiert, Bucket-Split ab M0, Weiche C = Rebuild aus
  Manifest+Snapshot). Kanten im §3.2-Schema (zitat_key/roh_zitat/konfidenz; quelle-Enum +'amtlich').
  Etappen M0 Fundament (check:materialien-NEUBAU) → M1–M4 Adapter (je PR = Prod-sichtbarer
  Content-Release in Suche+Browse; browserlos, Drift in normen-monitor.yml) → **M5 UI-Delta GATED
  auf V1a-Merge** (dep W2·7-VZUI, nur Etappe M5; BESTEHENDE Materialien-Gruppe, `VerzahnungsKante`
  ziel.typ 'verwaltungsverordnung', StatusBadge 'nur-verweis' als bewusster V3-Vorzug; kein
  Registry-Refactor). **M1 (ESTV-MWST) gated auf Davids robots-Freigabe Q1 (Fahrplan §8)**; M0/M2–M4
  ohne Blocker sofort baubar. Tore: `check:materialien` (Neubau, +Wortfeld+Cutoff+Entlistungs-Quote) ·
  `check:materialien-netz` (+normen-monitor.yml-Step) · gegenpruefung-Globs NEU `scripts/materialien/**`
  · `gen:zaehler`. Stufe 2 benannt (BSV nach POC, FINMA/SEM nein, PDF-Volltext-Kanten nein). Kein
  26×-Bezug — parallel zu E3/VPS fahrbar. Aufwand ehrlich ~7–10 Tage.
  **Detailquelle:** `FAHRPLAN-MATERIALIEN-VERZAHNUNG.md` (§0 = Kritik-Einarbeitung, §8 = der eine
  offene David-Punkt robots Q1). **Stand 4.7.2026: M0 ✅ (#126) · M2 SECO ✅ (#127) · M3 EDÖB ✅
  (#128, 10 Dok DSG/BGÖ) · M4 ESTV-KS ✅ (90 Dok, 121 Kanten DBG/VSTG/STG) · M1 ESTV-MWST ✅
  (robots-Freigabe David 4.7.2026 im Chat; 48 Dok MI+MBI, 3375 Roh-/1739 aggregierte Kanten
  MWSTG/MWSTV, 1417 artikelscharf, 1186 Cutoff-Downgrades, MWSTG-Bucket-Split real,
  §2.4-Revisions-Listen doppelt erhoben; Gegenprüfung 2 Durchgänge — D1 fand Anker-Drop
  durch Fundstellen-Merge, gefixt via Teil-Kontext + Disambiguierung) · **M5 UI-Delta ✅ 4.7.2026**
  (async `kontextSoftLaw`-Loader Shard/Buckets, «Amtliche Materialien»-Gruppe sync+async gemerged
  mit Fundstellen-Sublabel «via Art. N u. a.»/Stand + Staleness §2.4 + «maschinell»-Badge; `StatusBadge
  'nur-verweis'` als V3-Vorzug auf der MaterialLeser-Karte; `gen:zaehler` +Materialien-Zähler [326] +
  Startseiten-Kachel; kuratierter Nachtrag als in-Bundle-Artikel-Anker STATT DB-Migration [DATABREACH→
  Art. 24 DSG, KS 6a→Art. 65 DBG, DSFA §2.4-Downgrade — 3/3 gegen Live-Fedlex CONFIRMED]; 10 Unit + 3
  e2e grün, CLS 0 auf OR/Startseite). **6a-MAT komplett (M0–M5).**
- [x] **7 · Verzahnungs-Klingen** *(`[OF]`, amtlich)* — **GEBAUT 5.7.2026** (Worktree
  <!-- @meta id: W2·7 · status: done · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->
  `feat/w27-verzahnungs-klingen`, Dossier `bibliothek/recherche/verzahnungs-klingen-w27.md`,
  STRUKTUR-Karte 5.7.). **(a) Verjährungs-/Gewährleistungs-Board** (`/rechner/verjaehrung-board`):
  `verjaehrung.ts`-Regime-Matrix + Gewährleistungs-Sonderfall + AT-Brücke; CISG nur Link.
  **(b) Verzugszins-/Forderungs-/Inkasso-Strecke** (`/rechner/inkasso-strecke`): stateless
  Reverse-Reader Verzug→Verzugszins→Mahnung→Betreibung→Fristen. **(c) Gerichts-Baustein-Set**:
  amtlicher Zitierer BGE/BGer (`/rechner/gerichtszitat`, `gerichtszitat.ts`) + Rubrum-Vorlage
  (`/vorlagen/rubrum`, Art. 238 ZPO/112 BGG live verifiziert + gegengeprüft bestanden).
  Reine Darstellung auf bestehenden Engines (§3); Golden 201 unverändert (+8 additiv),
  Gate grün, e2e 163, Gegenprüfung bestanden.
- [ ] **8 · Schriften-Baukasten** *(VORLAGEN, Worktree)* — Berufung/BGG-Beschwerde/Sistierung/
  <!-- @meta id: W2·8 · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/lib/vorlagen] · worktree: ja · 26x: nein · fahrplan: FAHRPLAN-VORLAGEN-AUSBAU.md -->
  Beweisverzeichnis über `vorlagen/engine.ts`; Zulässigkeit nur Hinweis, Status «entwurf».
- [ ] **9 · Aufräum-Item** *(UX-PUNKTELISTE ⚫ überholt)*. Deliverable = Mapping-Tabelle
  <!-- @meta id: W2·9 · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein · fahrplan: FAHRPLAN-UX-PUNKTELISTE.md -->
  **alt-Punkt → Code-Pfad → Status**, *bevor* Restpunkte C2/C5 angefasst werden.

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
- [ ] **12 · Kanton-Gesetze-Bündel** *(GESETZE-IMPORT-3TIER + BS-VORBILDKANTON + RECHTSSAMMLUNG P6 + POPUP-Kanton-Rest, 26×)*. **Erst öffnen, wenn
  <!-- @meta id: W3·12 · status: parked · of: ja · blocker: 26x-slot · dep: [] · kollision: [] · worktree: nein · 26x: ja · fahrplan: FAHRPLAN-GESETZE-IMPORT-3TIER.md -->
  der Prozesskosten-26×-Slot frei ist** (Schritt 4). §14-gebündelt (Phase 0): führende Detailquelle
  `FAHRPLAN-GESETZE-IMPORT-3TIER.md`; **BS-Sofortfixes S1–S13** = `FAHRPLAN-BS-VORBILDKANTON.md`
  (korpusweiter Adapter-Hebel VOR jedem Bulk); Volltext-Kanton = `FAHRPLAN-RECHTSSAMMLUNG.md` (P6).
  BS-Pilot; Kantonale-Entscheide-Import hart **nachgelagert**, nie gleichzeitig. *Werkzeug-Funde (Audit 1):
  LexWork-Adapter auf dieselbe DOM-Parser-Infra wie der linkedom-POC heben (strikt NACH dessen Bestehen, B5);
  `pdfplumber` (Python) NUR als nicht-lasttragendes Gegenprüf-Skript, falls die TS-PDF-Extraktion
  (pdfjs-Koordinaten) belegt versagt (B3) — kein Sprachwechsel am Produktpfad.*
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
  - [x] **Gebündelt (Auftrag David 29.6.2026): Bildschirm-/Responsive-Audit** *(SPLIT-VIEW, `[OF]`)* — **ein** `ultracode`-Workflow — **AUDIT GEFAHREN 5.7.2026 (rein lesend, PR `chore/responsive-audit`): 30 Motive × 5 Breiten (390/768/1280/1536/2560) = 150 Aufnahmen; 0 Seiten-Overflow, 0 Konsolenfehler; 12 Defekte geflaggt (1 hoch: Vorschau-Knopf im Vertragstyp-Raster @390 · 2 mittel: Header-Tap-Ziele <44px @390, methodik-Einzelspalte @2560 · 9 niedrig, 2 davon «manuell verifizieren»). Befund + Anleitung `abnahme/responsive-audit/BERICHT.md`; Fixes = spätere Schritt-14-Einheiten.**
    <!-- @meta id: W3·14-Responsive-Audit · status: done · of: ja · blocker: null · dep: [] · kollision: [] · worktree: ja · 26x: nein --> fotografiert **Seiten × Breakpoints** (Handy hoch ~390 · Tablet ~768 · Laptop ~1280 · Desktop ~1536 · Ultrawide ~2560) und flaggt Layout/Umbruch/**Tabellen-Overflow** (maschinell je `<table>`/Pane über `scrollWidth>clientWidth`, deterministisch §2). **Werkzeug zuerst prüfen (§5/§10): auf dem bestehenden Playwright-bash-Harness `scripts/screenshots.ts` aufsetzen** — Playwright-Start, Motiv→Route, Arg-Parsing und ehrliches FEHLT-Logging (§8) sind dort schon da; nur die Breitenliste (heute 360/768/1280) auf die fünf erweitern und die Seitenmenge ergänzen, **nicht** neu erfinden. **NICHT** der Playwright-MCP (Bash-Lektion 22.6.); Playwright ist bereits Dependency. **Aufruf** (kontextlos lauffähig): `npm run preview -- --port 4321 --strictPort`, dann `npx vite-node scripts/screenshots.ts -- --base-url http://localhost:4321 --out abnahme/responsive-audit/ist-<sha7>` — neuer Ausgabe-Pfad ⇒ eine `.gitignore`-Zeile `abnahme/responsive-audit/` ergänzen, Binär-PNGs nie committen (§6). **Rein lesend:** berührt selbst keine §12-Kollisionsdatei und kein Golden-/Logik-Tor (§6), Status-Modell unberührt (§8), kein Deploy ohne Davids Ja (§9); Befund = Screenshot-Mappe + Defektliste, **rein visuell verifizierbar, keine Davids-Fachzeit**. **Kein eigener Strang — gehört in Schritt 14** (dasselbe Breakpoint-/Container-Query-Subsystem), denn die aus dem Audit folgenden Fixes treffen **dieselben §12-Kollisionsdateien wie Schritt 14** → **im selben Worktree wie Strang B, nie als paralleler Strang** (kein 26×-Bezug).
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
