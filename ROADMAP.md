# LexMetrik — Handlungsplan (DER eine Steuerungsplan)

> **Stand 20.7.2026.** Die **einzige Steuerungsquelle**: sie entscheidet **Reihenfolge** +
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
wbqdyap3x: Prozesskosten I2 — Schlichtungs-/Reduktionsfaktoren. EIGENTÜMER: kein David-Gate — die Recherche ist [OF] und selbst Teil von W1·4. Also zuerst erledigen, nicht als Wartegrund führen (sonst bleibt der Hauptmoat dauerhaft geparkt).
§4-lizenz: Live-Rechtsprechung — CC-BY-SA vs. Art. 5 URG, CORS/Rate-Limits unbestätigt
26x-slot: FREI seit 3.7.2026 (E3 fertig), aber bis 20.7.2026 nicht zurückgegeben — 17 Tage grundlose Blockade von W3·12. Slot am 20.7.2026 per @slot-kette an W3·12 übergeben (Kanton-Gesetze, Leitprinzip 4 + Davids Reihenfolge-Entscheid 2.7.: «E3 zuerst, W3·12 danach»). Dieser Blocker ist damit AUFGELÖST und wird von keinem Schritt mehr referenziert; Eintrag bleibt als Beleg der Kette stehen.
vps-bestellung-david: E3-Serving + E4-UI hängen an einer VPS-Bestellung (David, ~15 Min) — Dossier `bibliothek/betrieb/vps-bestell-dossier-2026-07-17.md` (PR #271). ECHTES David-Gate, kein Bau-Blocker. Bis dahin sind QS-DATA/W2·6-DATA nur im NICHT-VPS-Teil baubar (E0–E4 sind lokal fertig). Befund 20.7.2026: dieser Blocker stand bisher NUR im Fliesstext («🔒 BLOCKER»), das @meta trug `blocker: null` — für `check:plan` unsichtbar.
zeit-historik-poc: Norm-Zeitmaschine/Fassungs-Diff (W2·5g-ZEIT) — historische Fedlex-Konsolidierungs-Extraktion fehlt (auf Platte nur die geltende Fassung; SPARQL dateApplicability vorhanden, Durchlauf gross); POC + Bau-GO je Kandidat durch David ausstehend. UMFASST AUCH die beiden Vorbedingungen, die KEINE getrackten ROADMAP-Schritte sind und darum nicht als `dep` abbildbar wären: AKN-XML-Phase 1 (Quell-Architektur-Entscheid Council 30.6., schaltet M16 frei) und G-HIST als Daten-Unterbau (beide dokumentarisch im Strang-Detailblock oben + FAHRPLAN-NORMTEXT-DARSTELLUNG.md §Intake, Bau-GO je Kandidat ebenfalls offen)
david-spaeter-tabellen: Tabellen-Darstellung in Gesetzen (W2·5j-TABELLEN). KEIN technischer Blocker — Daten und Weg sind geklärt (656 `mehrspaltig`-Blöcke, 137 Erlasse); David hat den Punkt am 20.7.2026 ausdrücklich auf «später» gesetzt. Auflösung = Davids Ja, kein Bau-Vorlauf nötig.
richter-analytik-gate: Richter-/Spruchkörper-Analytik (W3·15-RICHTER). GRENZE (20.7.2026): Filtern/Facette/Verlinkung sind FREI und gebaut (#309/#311); gesperrt bleiben allein RANKING und PROGNOSE. Nur deskriptiv; bewusste Freigabe Davids erforderlich (heikel: Standesrecht, Persönlichkeitsschutz, richterliche Unabhängigkeit)
-->

<!-- @slot-kette (dokumentarisch; harte Prüfung via @meta-Feld `slot: inhaber`, check.ts 5b)
inhaber: W3·12 (Kanton-Gesetze, übergeben 20.7.2026 — E3 war seit 3.7.2026 fertig, der Slot nur nie zurückgegeben)
kette: ~~E3(W2·6-DATA) ✅ 3.7.2026~~ · W3·12(Kanton-Gesetze) ← JETZT · Tarif-Bündel(W1·4) · E5(Kanton-Rechtsprechung, W2·6-DATA) · Gerichtsferien-Matrix
begruendung-uebergabe: E3 ist gebaut (195 342 Entscheide, 2 Voll-Läufe determinismus-gleich, Gegenprüfung bestanden) ⇒ Leitprinzip 4 «eine Säule fertig führen» erfüllt. Der offene E3-**Serving**-Rest ist KEIN Massenimport, sondern hängt am David-Gate `vps-bestellung-david` — er rechtfertigt keine Slot-Bindung. Nächstes Kettenglied ist laut Kette W3·12 (Davids Reihenfolge-Entscheid 2.7.2026, `FAHRPLAN-DATENHALTUNG.md` §10(1)); W1·4 wäre falsch (26x: nein + eigener Blocker `wbqdyap3x`).
uebergabe: nur per explizitem `plan:set <id> slot=inhaber`-Commit; check:plan erzwingt höchstens EINEN Inhaber (muss 26x: ja)
-->

---

## Querschnitt-Band (läuft begleitend — kein Reihenfolge-Slot)

- **Status-Marker-Audit + Verifikations-Infrastruktur** *(LERNPHASE A/B, `[OF]`)*. Jede Karte/Engine
  <!-- @meta id: LERNPHASE-AB · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein · fahrplan: FAHRPLAN-LERNPHASE-2026.md -->
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
  **Status-Korrektur 20.7.2026 (§8):** Die drei Werkzeug-Andockungen sind **fertig** (`9da9a9d4` ·
  `c6b7eef0` · `0d104ab5`, Doku `445001e9`, alle 5.7.2026) — seither **kein** Commit mit
  `Roadmap: LERNPHASE-AB`, kein Worktree, kein offener PR. Der **Dach-Auftrag** ist damit NICHT erledigt:
  «jede Karte/Engine trägt sichtbaren ehrlichen Status + Stand» (Strang A) und «Golden-Abdeckung &
  Norm-Anker-Prüfung automatisieren» sind nirgends als erfüllt belegt. Der Schritt stand nur deshalb auf
  `wip`, weil das Etikett nach dem 5.7. nie zurückgesetzt wurde ⇒ **`ready`** (offen, baubar, niemand baut).
- **Adversariale Gegenprüfung — systematisiert** *(QS-GP, LERNPHASE B, `[OF]`)*, neu 29.6.2026 —
  <!-- @meta id: QS-GP · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->
  erweitert die Verifikations-Infrastruktur. Der adversariale Zweitdurchgang (unabhängiger
  Opus-Agent, frischer Kontext, Auftrag: Output gegen die amtliche Quelle **widerlegen**) fing real
  die teuersten Bugs (Tabellen-Drop, Footnote-Leak, `bis`/`ter`-Verlust), hängt aber bisher an
  Session-Disziplin statt an einem Tor. **Design-Detailquelle:**
  [`docs/superpowers/specs/2026-07-01-gegenpruefung-gate-design.md`](docs/superpowers/specs/2026-07-01-gegenpruefung-gate-design.md);
  Nachweis-Register [`bibliothek/register/gegenpruefung-register.md`](bibliothek/register/gegenpruefung-register.md).
  **Stand 1.7.2026: Bausteine a+b+c gebaut, gemergt PR #67 (`252731bd`) + prod-live** (Tor
  `check:gegenpruefung` in `npm run gate`, Skill »gegenpruefung«, Register + Quittier-Helfer
  `npm run gegenpruefung:ok`); offen nur Baustein d (rückwirkende Kampagne).
  **Präzisierung 20.7.2026 (§8 — die alte Formel «offen nur d» verdeckte, dass d SELBST dreistufig ist):**
  von den drei Kampagnen-Stufen **Rechnen → extrahierte Normen → Rest** ist **nur Stufe 1 «Rechnen» gelaufen**
  (`58e8237e`, 2.7.2026, ~45 norm-belegte Korrekturen, Trailer `Gegenpruefung: bestanden (Opus, 7 Linsen) —
  45 confirmed/0 refuted`; Report `bibliothek/register/QS-GP-KAMPAGNE-2026-07-02.md`, 127 Rohbefunde/38 Dateien).
  **Offen bleiben Stufe 2 (extrahierte Normen), Stufe 3 (Rest) und die BGE-Korpus-Regenerierung.** Das Register
  führt bisher **keinen Kampagnen-Burn-down**, sondern nur Diff-gebundene Einzelquittungen aus laufender
  Bauarbeit — der rückwirkende Fortschritt ist also nicht messbar; ihn messbar zu machen gehört in Stufe 2.
  Status darum `ready` (niemand baut daran), nicht `wip`. **Hinweis:** die
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
  <!-- @meta id: QS-PH · status: done · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein · fahrplan: FAHRPLAN-PLAN-STEUERUNG.md -->
  `.claude/hooks/struktur-aktuell.py`: meldet **rot**, sobald eine neu hinzugefügte `FAHRPLAN-*.md`
  **nicht aus `ROADMAP.md` verlinkt** ist — setzt die Plan-Hygiene-Regel durch (jede `FAHRPLAN-*.md`
  muss aus der ROADMAP referenziert sein, sonst steuert sie unsichtbar; CLAUDE.md §14 Ziff. 1). Detail + Etikett-System: **`FAHRPLAN-PLAN-STEUERUNG.md`** (Tor `check:plan` = Etikett-Konsistenz + FAHRPLAN-Verlinkung der referenzierten Dateien).
- **Automatik-Gesundheit: läuft unsere Automatik wirklich?** *(QS-AUTOMATIK, `[OF]`, neu 20.7.2026 — §14-Intake)*.
  <!-- @meta id: QS-AUTOMATIK · status: ready · of: ja · blocker: null · dep: [] · kollision: [.github/workflows, scripts/datenhaltung/check-turso-frische.ts, scripts/check-ci-laeufe.ts] · worktree: ja · 26x: nein -->
  **Gebündelt aus zwei Befunden vom 20.7., weil sie dieselbe Prüf-Fläche und dieselbe Risiko-Klasse haben**
  (Tor-/Automatik-Logik, kein Rechtsinhalt) — §14.2. Der Anlass ist die **zentrale Lektion des 20.7.:**
  *ein Tor, das sich gegen die eigene Ladung prüft, ist kein Tor* — dreimal an einem Tag aufgetreten
  (Turso-Sync→Marke→Wächter · selbst-attestierter Gegenprüfungs-Trailer · Hook-Probe mit selbstgebautem
  stdin). Dieser Querschnitt hält die Gegenfrage dauerhaft offen: **läuft die Automatik, und würde sie
  scheitern können?**
  - **a · Zwei tote Workflows** (gefunden von `waechter.yml`, sofort beim ersten Lauf):
    **`normen-monitor.yml` — letzter Erfolgslauf 22.6.2026, seither failure/cancelled, also ~4 Wochen
    still tot.** **`fedlex-frische.yml` — jüngster Lauf failure.** Der zweite wiegt schwerer, als er
    aussieht: er ist der benannte **Ersatz-Arbiter für neun nur-lokale Tore** — solange er rot ist,
    **läuft deren Allowlist-Begründung leer** (s. `QS-BASIS`, Tor-Parität 16/36). Erst diagnostizieren,
    dann fixen; nicht raten.
    - **a′ · `normen-monitor.yml` — Ursache diagnostiziert (20.7.2026, doppelt verifiziert, Beleg
      CI-Run `29727448005`).** Der Monitor ist seit 29.6. rot; die **aktuelle** Ursache liegt in
      `check:netz`/Kanonik-Arbiter: **`chemrrv`** (SR 814.81, `eli/cc/2005/478`, Konsolidierung
      `20260716`, gepinnt 16.7.) zeigt auf die **nicht-kanonische** Revisions-Wurzel `html-0`,
      kanonisch ist `html-1`. **Reparatur (offener Bau-Schritt, NICHT im reinen Doku-Schritt
      ausgeführt):** Re-Pin nur für `chemrrv` via `scripts/fedlex-repin-kanonik.ts` → Snapshot-
      Regeneration über den Generator → **Inhalts-Treue-Diff** (gleiche Konsolidierung ⇒ substanziell
      identischer Text; ~31 mehrspaltig-Tabellenblöcke stichprobenhaft) → dann `workflow_dispatch` des
      Normen-Monitors als Echt-Beweis. **Dringlichkeit:** die Rechtsstand-Wache ist bis zur Reparatur
      faktisch **blind**, weil das Dauer-Rot jede neue Drift maskiert. **Risiko-Klasse abweichend von
      der DoD dieses Querschnitts:** dieser Re-Pin ist ein **Extraktions-Risikopfad** (Fedlex-Snapshot,
      berührt `scripts/fedlex-*`/`public/normtext/**`) ⇒ **`QS-GP`-Gegenprüfung Pflicht, kein
      Auto-Merge vor Verdikt** (§14.4) — anders als die reine Workflow-Plumbing-Arbeit unter a/b. Die
      Re-Pin-Mechanik teilt sich mit **`QS-CURRENCY`** (Korpus-Pflege) und **`QS-OPT` O-2** (Batch-
      Re-Pin vor dem 1.8.-Berg); der `chemrrv`-Fix ist deren terminnahes Geschwister, wird aber hier
      geführt, weil er den Monitor entsperrt.
  - **b · Turso-Wächter-Abdeckung ausdehnen.** `check:turso-frische` (aus #313) prüft vierfach
    (Struktur · Vollständigkeit gegen Soll-Zahlen · `manifest_sha` · Alter) — offen bleibt: **wo überall**
    geprüft wird, eine **Laufzeit-Prüfung in `api/suche`** (der Ausfall vom 20.7. war im Betrieb
    unsichtbar: ein halber Gesetzesindex und **null** Entscheide, ohne je rot zu werden), ein definierter
    **Alarmpfad** (wer erfährt es, wie?) und **Wachstums-Schwellen** (Budget-Ist 652/1024 MiB = 64 %;
    ab welchem Füllstand wird gewarnt, bevor der Sync an die Wand fährt?).
  **Leitplanke für JEDE Massnahme hier (aus derselben Lektion):** das neue/erweiterte Tor gegen eine
  **unabhängige** Referenz prüfen und seine **Scheiterns-Fähigkeit an einem ECHTEN Aufruf** belegen —
  nicht an einer Nachbildung mit selbstgebauter Eingabe (CLAUDE.md §6 Ziff. 7).
  **DoD:** beide Workflows nachweislich wieder grün **mit protokollierter Ursache** (nicht durch Rerun
  grün gemacht) · `check:ci-laeufe` grün · Alarmpfad dokumentiert. Die Workflow-/Tor-Plumbing-Anteile
  (a/b) sind **reine Prüflogik ⇒ golden byte-gleich, `Gegenpruefung: n/a`**; der `chemrrv`-Re-Pin (a′)
  ist die **Ausnahme** — Extraktions-Risikopfad ⇒ eigener Commit mit `QS-GP`-Verdikt, kein Auto-Merge.
  Trailer `Roadmap: QS-AUTOMATIK`.
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
  <!-- @meta id: QS-CURRENCY · status: done · of: ja · blocker: null · dep: [] · kollision: [scripts/fedlex-cache.sh, public/normtext/register.json] · worktree: ja · 26x: nein · fahrplan: FAHRPLAN-FEDLEX-PORTFOLIO.md -->
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
  **Etikett-Korrektur 20.7.2026:** Der Schritt stand trotz dieses `[✓]` noch auf `wip` ⇒ jetzt **`done`**.
  Geprüft, dass der Schritt-Umfang wirklich nur **Paket 1** ist: `FAHRPLAN-FEDLEX-PORTFOLIO.md` ordnet die
  Pakete 2/5/3/4 fremden IDs zu (`W2·6`, `W2·6-REV`, `W3·11`, `W3·13`), `W2·14-SIGNAL` hängt nur lose daran —
  es bleibt also kein Rest unter diesem Etikett liegen. Die laufende **Korpus-Pflege** (`check:fedlex-versionen`,
  Wiedervorlage-Läufe, z. B. `5b676c3b`) läuft als Automatik weiter und ist **kein** offener Bau-Schritt;
  die Gesundheit dieser Automatik wird neu von **`QS-AUTOMATIK`** überwacht (dort ist `fedlex-frische.yml` rot).
- **Geräte-Last / Performance** *(QS-PERF, `[OF]`, neu 30.6.2026 — Leitprinzip 7 + CLAUDE.md §15)*.
  **§14-Intake 20.7.2026 (David):** TBT-Budget `/gesetze/bund/OR` (#28) — VOR jeder Feature-Zuschreibung Nullprobe + Streuung (Dispatch §0 Ziff. 3): das Budget ist der einzige Job mit Rot im Sample, die Rausch-Rotquote allein erklärt den Grossteil. Lighthouse-Median n≥3 statt Einzelwert gehört in `scripts/perf/` (Worktree `lm-ci`).
  <!-- @meta id: QS-PERF · status: wip · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein · fahrplan: FAHRPLAN-PERFORMANCE.md -->
  Lexmetrik soll Computer **nicht merklich langsamer** machen, **ohne Logikverlust** (Treue gewinnt
  immer). Detailquelle: **`FAHRPLAN-PERFORMANCE.md`** (ultracode-Audit 30.6.2026, 25 verifizierte,
  logik-sichere Befunde; adversarial gegen Logikverlust geprüft). Gemessener Anlass: `/gesetze/bund/OR`
  unter 4× CPU Score **42**, **CLS 0,64**; Startseite CLS 0,57. **Empfohlene Reihenfolge:**
  - **a · Tor `check:perf-budget`** — **`[✓]` KOMPLETT (5.7.2026, PR feat/qs-perf-a-b):**
    Bundle-Teil + `check:perf-lighthouse` (Mobil-Preset, Median aus 3, letzte CI-Stufe nach den
    Treue-Toren = §15-Gegenkopplung). Wortlaut → `ROADMAP-CHRONIK.md` → QS-PERF (22.7.2026).
  - **b · Billig & verlustfrei zuerst** — **`[✓]` bereits in `main`** (Quick-Win-Batches 30.6./1.7., hier
    nur verifiziert + durch das Tor abgesichert): `React.memo(ArtikelLeser)` + `SektionBaumTOC` (`parts.tsx`),
    token-Mindesthöhen (`min-h-screen` Suspense-Fallback `App.tsx` + Reader-Ladezustand `inhalt.tsx`,
    `min-h-modul-news` `NewsHeader`), Reader-Chunk-Vorladen, `vendor-react`-manualChunks (`vite.config.ts`).
  - **c · M-Daten-Pfad** *(adopt-with-care, golden-gegated)*: OR-Fetch/Struktur-Parse per
    `requestIdleCallback` defern (vollen Parse behalten) · Suchindex (16 MiB) in Web-Worker (bzw. **FlexSearch `export()`/`import()`** — Index build-time serialisieren statt Client-Rebuild, Audit-1-B4; entfällt evtl. via E2-Edge-Suche, `FAHRPLAN-DATENHALTUNG.md` §8) ·
    `register.json` in Bund/Kanton sharden · Snapshot-Format verschlanken (Provenienz-Header-Hoist).
  - **d · Render-/Split-View-Feinschliff** *(zuletzt — nach den Memos marginal)*: TOC stabilisieren,
    `aktArtikel`-Tracker auslagern, Pane-Open-Guard + Such-Debounce, Fallback-Font-Metriken.
  - **e · CLS-Race-Härtung Reader-e2e** — **`[✓]` KOMPLETT (10.7.2026, `fix/cls-race-haertung`):**
    drei CI-Parallel-Last-Rotfälle an der Wurzel gefixt, Schwellen UNVERÄNDERT. Wortlaut →
    `ROADMAP-CHRONIK.md` → QS-PERF (22.7.2026); Detail STRUKTUR-Karte 10.7.
  - [~] **TBT-Deckel je Job normieren statt absolut prüfen** *(gebaut, gemessen, VERWORFEN
    20.7.2026)*. Zwei 8er-Runner-Reihen widersprechen sich; die unterstellte Proportionalität
    besteht nicht. **Assertiert wird darum weiter der Rohwert**; Kalibrierung bleibt als
    Diagnose-Ausgabe. **«TBT auf OR wieder scharf» ist damit NICHT erreicht und bleibt offen**
    (§8). Mess-Detail → `ROADMAP-CHRONIK.md` → QS-PERF (22.7.2026).
  - [x] **Chrome-Isolation je Lighthouse-Lauf + Neukalibrierung** *(erledigt 20.7.2026)* —
    frische Instanz je Messung; Schwellen über 16 Runner neu erhoben und verschärft (Start-TBT
    400 · Start-LCP 10000 · OR-TTI 13000 · Start-Score 55; OR-TBT 6500 und CLS 0.05 unverändert).
    Wortlaut → `ROADMAP-CHRONIK.md` → QS-PERF (22.7.2026).
  - [ ] **OR-LCP ist bimodal — Ursache offen** *(neuer Befund 20.7.2026)*. In der 8er-Messreihe misst
    `/gesetze/bund/OR` LCP entweder **~3.5 s** (4×) oder **~11.3–11.6 s** (4×), nichts dazwischen,
    **unabhängig von der Runner-Geschwindigkeit** (die Kalibrier-Referenz korreliert nicht mit dem
    Modus). Der naheliegende Verdacht «warm/kalt geladen» ist durch die Chrome-Isolation
    ausgeschlossen — jeder Lauf ist kalt. Vermutung, ungeprüft: Lighthouse wählt je nach Timing ein
    anderes LCP-Element. Der Deckel 13500 liegt ~16 % über dem hohen Modus und ist damit sicher;
    bevor er verschärft wird, muss die Bimodalität verstanden sein (sonst deckelt man sie nur weg, §8).
  - [ ] **e2e-Shard-Balance gegen GEMESSENE CI-Dauern packen** *(vorbereitet 20.7.2026; CI-Messwerte
    da 21.7.2026 — geparkt, gekoppelt an Davids Merge-Queue-Entscheid)*.
    Die Gruppen in `e2e/shard-gruppen.json` sind gegen LOKALE Dauern gepackt (Spread <0.1 %), die
    aber nicht uniform auf den CI-Runner skalieren: `leser-gliederung-a33.e2e.ts` braucht lokal 92 s,
    auf CI ~360 s (**Faktor ~3.7–3.9**), andere Specs weit weniger. **CI-Messbefund (Lauf
    `29779602507`): 283 Tests / 2100 s bei `workers:1`; die Top-10-Specs tragen 66 % der Zeit;
    `leser-gliederung-a33.e2e.ts` allein 342 s = 16 % der Gesamtzeit in nur 4 Tests; Shard 3 ist
    systematisch am längsten**, weil die Packung nach lokalen Zeiten geschah. Eine Neupackung auf
    geschätzter Grundlage wurde bewusst UNTERLASSEN (kann die Balance ebenso gut verschlechtern,
    §14.2) — jetzt liegen die CI-echten Per-Spec-Zeiten als `playwright-report.json`-Artefakte je
    Shard-Job vor, damit ist die Packung **gemessen**. **Hebel:** Neupackung nach CI-Messwerten,
    optional **`a33`-Split in zwei Spec-Dateien** (Tests byte-gleich, Anzahl 283 vorher = nachher)
    bzw. feineres Sharding — **kein Prüfumfang-Abbau (§6.3)**. **Strukturelle Grenze:** a33 ist mit
    ~342–360 s bereits grösser als das Shard-Drittel; Datei-Granularität allein löst das nicht (der
    Spec-Split ist der eigentliche Hebel). **Kopplung (§14.2):** ausdrücklich an den noch offenen
    **Merge-Queue-Entscheid Davids** gebunden (`QS-BASIS` B-12 / `QS-OPT` O-3.2/O-3.3) — ein CI-Umbau,
    nicht zwei; erst zusammen mit der Merge-Queue-Richtung neu packen.
  - **Constraints:** alles `[OF]`/zeitsperre-konform (Darstellungs-/Lade-/Build-Schicht); **kein**
    DOM-entfernendes Virtualisieren/`hydrateRoot`/Teilparse (Treue-Verlust, verworfen); Snapshot-
    Regenerierung (c) öffnet **keinen** 26×-Slot (nur Format, Union byte-gleich); Worktree-Isolation
    bei `vite.config.ts`/Generatoren/`public/normtext/**` (§12).
  - **e · Tor-Nachlese aus #312/#314 (§14-Intake 20.7.2026) — fünf offene Posten.** Der Tag hat das Tor
    kalibriert, aber in einem **bewusst stumpfen Übergangszustand** hinterlassen; das darf nicht
    einschlafen. **Reihenfolge nach Hebel:**
    1. **LCP-Element-Attribution — die DRINGENDSTE Einzeländerung, ~5 Zeilen, reine Diagnose.**
       `largest-contentful-paint-element` aus dem LHR ins Log **und** in `dist/_perf/lighthouse.json`.
       Sie entscheidet, ob die **OR-LCP-Bimodalität** (8× ~3,5 s / 8× ~11,4 s) ein Messartefakt ist oder
       der **Replace-Repaint als LCP-Element** — im zweiten Fall wäre der 11,4-s-Modus **reales
       Nutzererleben** und der 3,5-s-Modus misst schlicht das falsche Ereignis. **Jede Messreihe ohne
       diese Angabe ist verschenkt** — darum vor allen weiteren Messungen.
    2. **TBT auf OR wieder scharf stellen.** Heute **6500 = bewusst stumpf**; CLS (0,05) trägt derzeit
       **allein** die Regressions-Last. Erst nach (1) und nach neu erhobener Verteilung.
    3. **Zwei NEUE blinde Flecken, die #314 selbst erzeugt hat** (ehrlich mitführen, nicht verschweigen):
       **(a)** Die Chrome-Isolation macht jeden Lauf **kalt** — die entfernte «Drift» war zugleich ein
       **akzidenteller Detektor für aufschaukelnde Degradation** (Lecks, Listener, Cache-Bloat).
       Defekte ab der **2. Navigation** werden jetzt **nie** gemessen. **(b)** `nurAbInstall` verbannt
       **Layout-Sprünge >500 ms nach Interaktion** aus **jedem** Budget — auf langsamen Geräten real
       sichtbar. Beide brauchen eine bewusste Antwort (eigene Warm-/Interaktions-Messreihe), nicht ein
       Achselzucken.
    4. **Versions-Pinning der Deckel dokumentieren — gebündelt mit dem Lighthouse-Major-Bump
       (§14-Intake 22.7.2026, David).** Die Schwellen sind implizit **Lighthouse-versions-gepinnt** —
       bisher **undokumentiert**. Ein Lighthouse-Upgrade verschiebt sie still. **Anlass des Bündels:**
       `npm audit` meldet **17 moderate Findings**, alle EINE Wurzel — `@opentelemetry/core` < 2.8.0
       ([GHSA-8988-4f7v-96qf](https://github.com/advisories/GHSA-8988-4f7v-96qf), Baggage-DoS) über die Kette
       instrumentation-\* → `@sentry/node` → **`lighthouse`** (reine Dev-Dependency, keine Prod-Exposition —
       die App ist statisch/clientseitig; der Code liefe nur im CI-Runner). Fix erfordert
       `npm audit fix --force` = **Lighthouse-Major-Bump** ⇒ genau der Fall dieses Postens. **DoD des
       Bündels:** (a) Lighthouse-Major heben · (b) Schwellen NICHT übernehmen, sondern **neu vermessen**
       (16-Runner-Reihe wie 20.7., `perf-kalibrierung.yml`) · (c) Pinning ab dann **explizit dokumentiert**
       (Lighthouse-Version neben den Deckeln in `scripts/perf/lighthouse-budget.ts`) · (d) `npm audit`
       moderate = 0. **Vorsicht Lockfile:** lokales npm 11 prunt bei jedem Tree-Write den von CIs npm 10
       verlangten verschachtelten `typescript@5.9.3`-Eintrag (Vorfall 21./22.7., PR #326) — Diff vor dem
       Commit prüfen, ggf. chirurgisch setzen.
    5. **Revisions-Politik für legitimes Wachstum.** Vorschlag: **Deckel = Ist + max(3 sd, ~25 %)**,
       **Anhebung nur mit Mess-Beleg**. Ohne solche Politik wird jeder Deckel irgendwann «mal eben»
       hochgesetzt — und misst danach nichts mehr (Lektion 20.7.).
    **Abgrenzung:** Der **echte CLS-Defekt auf `/gesetze` (0.109 @8×)** gehört **NICHT hierher**, sondern
    ist ein Produktfehler mit eigenem Schritt **`W2·15-CLS`** — Tor-Arbeit und Defekt-Behebung dürfen sich
    nicht gegenseitig verdecken (§14.2).
  - **f · Serif-Preload nachziehen** *(§14-Intake 20.7.2026 — kleiner UX-Trade-off, Folge von
    `font-display:optional`)*. `font-display:optional` hat die CLS-Ursache (Serif-Font-Swap unter Linux)
    beseitigt — **um den Preis**, dass die Serif-Schrift bei langsamer Verbindung im ersten Paint
    **gar nicht** erscheint und der Wechsel erst beim nächsten Besuch sichtbar wird. Ein gezielter
    `preload` der tatsächlich im ersten Viewport benutzten Schnitte holt den Trade-off zurück, **ohne**
    den CLS-Gewinn aufzugeben. **Auflage:** mit CLS-Messung **vorher/nachher** belegen — eine
    Preload-Änderung, die CLS wieder hebt, ist keine Verbesserung. Klein, eigener Commit.
    Trailer `Roadmap: QS-PERF`.
- **Datenhaltung / Single-Source-DB** *(QS-DATA, `[OF]`, neu 2.7.2026 — Council-Entscheid)*.
  <!-- @meta id: QS-DATA · status: blocked · of: ja · blocker: vps-bestellung-david · dep: [] · kollision: [] · worktree: nein · 26x: nein · fahrplan: FAHRPLAN-DATENHALTUNG.md -->
  Für die Korpus-Inhalte (Normtext · Rechtsprechung · Materialien) wird ein **generator-erzeugtes
  DB-Artefakt die EINE Wahrheit (§5)**; `public/*.json` + prerenderte Seiten sind fortan
  **byte-gleiche Projektion** daraus — nie parallel gepflegt. Amtlicher Arbiter bleiben
  Fedlex/bger.ch (§7 a–d je Zeile); voilaj/swiss-caselaw (CC0) wird KONSUMIERT, nie gescrapt
  (Scraper-Verdikt `FAHRPLAN-OPENCASELAW-QUELLEN.md`). Zwei Dauer-Tore: **`check:paritaet`**
  (Projektion byte-gleich gegen den bisherigen Generator-Output) + **Drift-Tor** (DB-Manifest
  sha/Zeilenzahlen vs. committete Projektion; bestehende `check:*-netz` bleiben Quellen-Arbiter).
  Kuratiertes Schaufenster bleibt prerendert (§15); Long-Tail on-demand inhaltsvollständig (§15 Regel 6).
  Bau-Strang = **W2·6-DATA**; Detailquelle **`FAHRPLAN-DATENHALTUNG.md`**. **Stand 3.7.2026: E0/E0+/E1/E1-Rest-A + E2-Vorarbeiten durch** (E1 = Generator-Flip Bund + Tor `check:datenhaltung`; **E2-Vorarbeiten = hot-FTS build-time [`fts_artikel` external content + `fts_entscheide_schaufenster` standalone, Tokenizer `unicode61 remove_diacritics 2`, HOT-Replika 178 MiB/1 GB] + Such-Query-Modul `scripts/datenhaltung/suche.ts` mit Pagination-by-design + Edge-Funktion `api/suche.ts` [503 ohne Turso]**; **E2-Anbindung ✅ 3.7.2026 = Gruppe «Volltext-Suche (online)» im geteilten `useUniversalSuche`/`SuchResultate` [`src/lib/suche/onlineVolltext.ts`, debounced Fetch, AbortController ~4 s, §8-Offenlegung, ehrliches Degradieren bei 503/Netz/Timeout/200-leer, 5-min-Feature-Cache]**) — **E2 offen NUR: Turso-Hot-Daten laden/synchronisieren [David-Handschritt; Prod-Edge liefert aktuell 200-leer] → dann perf-budget/Payload-Grenz-Test greifen**. **§11.2 Leitfälle-Chips (3.7.2026): das tote `proNormArtikel`-Modell ist verdrahtet — Schaufenster-Shards je Erlass (`public/rechtsprechung/norm-index/<ERLASS>.json`, 19) + `leitfaelleFuerArtikel`-Lazy-Lader + Chip-Zeile im `ArtikelLeser` (Chip → Entscheid + «⧉ daneben öffnen»); Weiche-B-Masse-Anteil «+n weitere (online)» offen bis E2-live.** Details am Schritt W2·6-DATA. Trailer `Roadmap: W2·6-DATA`.
  **Reparatur 20.7.2026 — Sync-Transport + Frische-Wächter (E2 betriebsfest).** Der Workflow
  `turso-sync.yml` lief seit dem 18.7. sechsmal in den 20-min-Job-Timeout und wurde jedes Mal
  `cancelled` (grau, nicht rot) — BS-Import #300, G-REF #299, ASYLV2 #304, Richter #309/#310
  erreichten die Suche nie. Ursache war NICHT der Timeout: der Sync schickte je Zeile ein eigenes
  Hrana-`execute`, also einen durablen Commit pro Zeile (**gemessen 33 Zeilen/s** → ~46 min für
  61k Zeilen). Behoben durch **Mehrzeilen-INSERT in BEGIN/COMMIT** (gemessen **1429 Zeilen/s**,
  43×) + **Schatten-Tabellen mit atomarem Tausch** (ein Abbruch lässt den alten Stand stehen,
  statt wie bisher eine halb gedroppte Prod-Replika zu hinterlassen — genau das lag tagelang live:
  `artikel` 16'400 von 55'822, `fts_entscheide_schaufenster` gar nicht vorhanden). Die Atomarität
  trägt erst über den Hrana-**`baton`** (BEGIN und COMMIT in getrennten Requests): ein einzelner
  Request mit `BEGIN/…/COMMIT` ist NICHT atomar — die Pipeline bricht bei einem fehlgeschlagenen
  Statement nicht ab und das COMMIT schreibt den Teilzustand fest (von der Gegenprüfung empirisch
  widerlegt, im Wegwerf-Test verschwand eine Live-Tabelle dauerhaft). Neu:
  **`check:turso-frische`** — vierfach: Struktur · **Vollständigkeit** (Ist-Zeilenzahl gegen die
  vom letzten Sync protokollierten Soll-Zahlen; eine reine «nicht leer»-Prüfung hätte den
  historischen Schaden von 16'400 statt 55'822 Zeilen passieren lassen) · `manifest_sha` gegen
  `daten-manifest.json` · Alter — als harter Schritt im Sync **und** als täglicher cron-Job mit
  eigenem Token-Riegel; bewusst NICHT in `check:netz` (dort ohne Token = Schein-Abdeckung).
  Ein abgebrochener Sync schweigt nicht mehr (§8). HOT-Artefakte (lokal gebaute FTS-DBs, das
  Budget-Mass aus `build.ts`) **651.99 MiB / 1024 MiB (63.7 %)** — Treiber ist die
  `eintrag`-Tabelle der rechtsprechung.db (465.93 MiB). **Gekoppelter Folgeschritt:** der
  Quell-Riegel hasht via `manifestDb()` die ganze DB (~1.9 GiB Spitzen-Heap, Reserve 2.3× zum
  4288-MiB-Limit); auf die vier geprüften Tabellen einschränken, sobald der Entscheid-Korpus
  sich verdoppelt, die Heap-Reserve unter 1.5× fällt ODER das 1-GB-Budget reisst — gleicher
  Treiber, darum gemeinsam prüfen. Doku-Korrektur in `fts.ts`/`turso-sync.ts`:
  die «342 kuratierten Schaufenster-Entscheide» waren seit langem falsch — der Code filtert nicht,
  es sind alle `eintrag`-Zeilen (Stand 5093).
  **🔒 BLOCKER: VPS-Bestellung (David, ~15 Min) — entsperrt E3-Serving (195 342 Entscheide, cold-FTS 58-GB-Klasse) + E4-Zitatgraph + VZUI-V2 «Zitiert-von».** Bestell-Dossier mit 3 live-verifizierten Angeboten (17.7.2026, Empfehlung **netcup RS 4000 G12 · 32 GB/1 TB NVMe · ~€40/Mt**) + Setup-Plan + Schritt-für-Schritt-Anleitung: **`bibliothek/betrieb/vps-bestell-dossier-2026-07-17.md`** (QS-BASIS B-5). Serving-Bau bleibt QS-DATA. Synergie: derselbe VPS = Backup-Zweitziel (QS-BASIS B-2) + Fassungs-Archiv (B-9).
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
  **§14-Intake 20.7.2026 (David):** (a) **Turso-Wächter-Abdeckung** — alle relevanten Stellen prüfen, gekoppelt an die Tor-Echtheit (Wächter gegen UNABHÄNGIGE Grösse, nicht gegen die Sync-Marke; `cancelled`/`skipped` zählen als rot — Auslöser `turso-sync.yml` timeout-minutes: 20). (b) **CI-Fehlläufe** (#30) — Referenz auf Worktree `lm-ci`, hier NICHT duplizieren; Playbook-Eintrag «CI-Starvation» ist WIDERLEGT (Queue-Wartezeit 0,0–0,3 min über 10 Läufe gemessen), Kostentreiber sind Reruns (~72 % der Wanduhr). (c) **CI/lokal-Tor-Parität** — `check:seriell` fährt 36 Tore, CI 11; `check:tor-paritaet` friert die Lücke ein, das Schliessen ist offen. **Stand 20.7.2026 (PR `docs/bau-fundament`): 16/36 in CI** — `check:merge-schutz` · `check:tor-paritaet` · `check:dispatch-klausel` · `check:besetzung` · `check:entscheide` · `check:bs-entscheide` neu verdrahtet; die drei Rechtsprechungs-Tore standen mit der sachlich FALSCHEN Begründung «braucht rechtsprechung.db (488 MB)» auf der Allowlist, sie lesen in Wahrheit die committeten Projektionen (je ~1 s grün unter `CI=1`). Rest-Lücke 20 Tore, davon 9 mit Ersatz-Arbiter `fedlex-frische.yml` — **dessen Lauf ist rot (#37), solange das gilt, läuft diese Begründung leer.** (d) **Datenhaltungs-Optimierung** *(§14-Intake David 20.7.2026; im ersten Intake-Durchgang verloren gegangen und durch die adversariale Prüfung von PR #315 wiedergefunden — Nachtrag 20.7.)*: **inkrementeller Sync** (nicht bei jedem Lauf den Vollbestand schieben) · **contentless-FTS** (`content=''` statt external content, wo der Rohtext schon im Serving-Store liegt) · **Index-Strategie** (welche Spalten tragen die realen Query-Pfade aus `api/suche`) · **Heiss/Kalt-Gate** (was gehört in die 1-GB-Turso-Replika, was bleibt kalt) · **Korpus aus git ausgliedern (R6)** — gemessen 20./21.7.2026 als **moderate Kosten** (git status 25–80 ms, CI shallow; real: ~400 MB je Worktree-Checkout, 273 MB Pack, minimaler Churn) ⇒ **kein Dringlichkeits-Fall**, Vorstufe/Teil dieses serverlosen Korpus-Serving-Vorhabens, nicht als isolierter git-Eingriff (Detail `FAHRPLAN-DATENHALTUNG.md` §12.4). Detailquelle `FAHRPLAN-DATENHALTUNG.md`; Bau-Strang W2·6-DATA (E4-Nachbarschaft). Kein eigener FAHRPLAN.
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
  PR #244) · **B-12** Merge Queue (zuletzt, nach O-3.2/O-3.3).
  **Neu strukturiert (Daueranweisung David 17.7. «handlungsschritte von meiner seite erst am schluss …
  du alles baust was du kannst ohne mich»):** Plan in **§A Agent-baubar ohne David** (autonome Bau-Reihenfolge
  A1→A11: B-3→B-5-Dossier→B-6→B-8→B-11-Cron→B-1-Entwurf→B-2-Vorbereitung→B-10-Vorbereitung→B-7→B-9-Design→
  B-12-Vorbereitung) + **§B David-Schlussblock** (G1–G7 gebündelt am Ende, ~30–45-Min-Beschaffungs-/Freigabe-Block,
  je Gate notiert was danach noch zu VERDRAHTEN bleibt). Teilbare Einheiten gesplittet: Dossier/Entwurf/Skript/Tor
  = §A (jetzt), Bestellung/Freigabe/Kauf = §B. **§A wird jetzt autonom gebaut** (je Einheit Worktree+PR+Auto-Merge);
  Trailer `Roadmap: QS-BASIS`.
- [ ] **`QS-UI` — Oberflächen-Qualität app-weit** *(Ideen-Intake 20.7.2026 · reines UI/Design, §13 · kontinuierlich)*
  <!-- @meta id: QS-UI · status: ready · of: ja · blocker: null · dep: [] · kollision: [DESIGN-REGLEMENT.md, src/index.css, tailwind.config.js, scripts/check-farbwelt.ts, e2e/a11y.e2e.ts] · worktree: ja · 26x: nein · fahrplan: FAHRPLAN-UI-QUALITAET.md -->
  **Kein Einzel-Redesign und kein Reihenfolge-Slot**, sondern ein **kontinuierlicher, mess-getriebener
  Querschnitt-Strang** auf dem vorhandenen Fundament: Dach-`DESIGN-REGLEMENT.md` + 4 Domänen-Reglemente,
  Tor `scripts/check-farbwelt.ts` (OKLCH/WCAG/APCA) und `@axe-core/playwright`. **Nordstern:
  Kanzlei-Praxistauglichkeit** — nicht Schönheit, sondern schneller zum belegten Ergebnis.
  **Teil-Schritte statt vagem «UI besser machen»:** **(a) Fundament-Pass** app-weit gemeinsame Muster
  und Navigation · **(b) Informationshierarchie-Pass** «Verdikt zuerst, Warum auf Abruf» (§13.2) über
  alle Werkzeuge · **(c) Muster-/Navigations-Konsistenz** (⌘K, Verlauf, Breadcrumb) · **(d)
  Kanzlei-Alltags-Flow-Audits** domänenweise gegen das jeweilige Reglement · **(e) Gate-Verschärfung**
  (Farbwelt-Baseline enger ziehen, axe von Stichprobe auf Flächendeckung, ggf. Flow-/Hierarchie-Checks).
  **Feasibility 🟢 aus-Bestand** (Reglemente + Farbwelt-Gate + axe stehen). **Abgrenzung (§14.3,
  verbindlich):** `QS-UI` **koordiniert und härtet**, es **dupliziert nicht** `W2·10-UI-NAV`
  (Navigations-Plumbing), `W2·11-DESIGN` (Farbwärme) oder `W3·14` (Split/Responsive) — diese bleiben die
  konkreten Sub-Efforts, die dieser Strang treibt und einfordert. Nachgelagert hängt
  **`W2·5h-GESETZ-UI`** (Gesetzes-Fläche) an diesem Fundament. Detailquelle: **`FAHRPLAN-UI-QUALITAET.md`**.
  **DoD je Teil-Schritt:** §13-Tore grün (`check:farbwelt`, axe) · golden byte-gleich, wo die Änderung
  verhaltensrelevant ist. Trailer `Roadmap: QS-UI`.

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
> **Bündel R · Reader-Lesesteuerung** und **Bündel N · Normtext-Fidelity/Verweise** → beide in
> **Schritt 5b gebaut** (R ✅ 30.6. prod · N ✅ 1.7., inkl. Ursachen-Proben N1 Inline-Tag-Strip /
> N2 ELI-Ziel-lesen-statt-raten). Wortlaut inkl. Befunde → `ROADMAP-CHRONIK.md` → Eingang-30.6. (22.7.2026).
>
> **Quell-Architektur-Entscheid (Council 30.6.2026) → Detail `FAHRPLAN-NORMTEXT-DARSTELLUNG.md
> §Quell-Architektur-Entscheid`, Memory `lexmetrik-akn-xml-architektur-entscheid`.** N1/N2 sind **Phase 0**
> (jetzt, variantenunabhängig) zusammen mit einem **asymmetrischen Verifikations-Tor** (Containment: jedes
> Quell-Wort verbucht → fängt stille Drops + Struktur-Invarianten) + **Status-Marker** (in Kraft/aufgehoben/
> noch-nicht-in-Kraft). Der **HTML→AKN-XML-Wechsel ist Phase 1** — inkrementell über den Drift-Zyklus, **nie
> Big-Bang** (B «XML direkt rendern» verworfen); empirisch freigegeben (eId 99,7 % stabil über Konsolidierungen,
> DE/FR/IT ~95–99 % ausgerichtet) → schaltet `#art`-genaue Chips, ELI-Zitations-Graph, M15 (DE/FR/IT) und
> M16 (Point-in-Time) frei. **M16 ist seit dem Ideen-Intake 20.7.2026 als eigene Bau-Einheit
> `W2·5g-ZEIT` getrackt** (Norm-Zeitmaschine + Fassungs-Diff, `blocked` auf `zeit-historik-poc`) —
> diese Stelle hier bleibt die *Architektur*-Begründung, die *Bau*-Planung steht dort und wird hier
> nicht doppelt geführt (§14.3).
>
> **Intake «Informations-Nutzung der Gesetze» (David 17.7.2026) → hierher:** Recherche-Verdikt
> = Normtext-KÖRPER nahezu erschöpfend genutzt; die handlungsreifen Lücken sind **G-REF** (externe
> amtliche ELI-Verweise, verworfen via `entferneTags` — konkretisiert N2/Phase-1-ELI-Graph) und
> **G-HIST** (artikel-genaue Historie liegt nur als Fussnoten-Prosa — Daten-Unterbau von M16, und
> damit ausdrücklich Vorbedingung des Blockers `zeit-historik-poc` in `W2·5g-ZEIT`). Beide
> = **Extraktions-Risikopfad** (`QS-GP`, golden byte-gleich; **Bau-GO je Kandidat ausstehend, David**),
> verortet in `FAHRPLAN-NORMTEXT-DARSTELLUNG.md §Intake`. Der **Suchindex** (G-SUCH, Fussnoten/Tabellen
> nicht indexiert, kein Risikopfad) liegt getrennt in `FAHRPLAN-UI-NAVIGATION.md §7b`, **G-PRERENDER**
> (SEO/§15) in `FAHRPLAN-SEO-A11Y-GOVERNANCE.md §11`. **Detailquelle (§11):**
> `bibliothek/normen/informations-nutzung-gesetze-2026-07-17.md`.
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
>   ✅ **10.7.2026 — bereits behoben, empirisch verifiziert** (U-KOPF/Split-View-Refactor `60988318`,
>   Playwright-Beweis BGE 152 I 65). Wortlaut → `ROADMAP-CHRONIK.md` → Eingang-30.6. (22.7.2026).
>
> **Bündel S · Split-View → Schritt 14** *(SPLIT-VIEW, eigener Worktree):*
> - **S1 Breadcrumbs in der Pane:** `InhaltsKopf.tsx` Z.30 nutzt globalen Router-`<Link to>` → zielt
>   aufs Hauptfenster statt in die autonome Pane. Fix über `PaneKontext`-Navigator.
> - **S2 Tracker «alles schliessen» schliesst auch Panes:** Panes leben in `usePaneLayout`
>   (localStorage `lexmetrik-panes`), separater Store von den Tabs → Close-all muss `usePaneLayout`
>   mit-resetten. *(S1+S2 bündeln, gleiches Subsystem.)*
>
> **Einzeln:**
> - **I1 Seitenleisten-Reihenfolge** + **I2 Branding-Neuausrichtung** → **✅ beide gebündelt in
>   W2·5c (3.7.2026) und dort gebaut** (SSoT `navigation.ts` bzw. Messaging-SSoT `seo.ts` +
>   Tor `check:seo-index`; Doks-Wording ✅ 5.7.). Wortlaut → `ROADMAP-CHRONIK.md` → Eingang-30.6.
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
  **I4 ✅** (1.7.2026, Bemessungskriterien 25 GK + 26 PE, §7-belegt, QS-GP bestanden) · **I9-Rest ✅**
  (Notariats-/Grundbuch-Querverweis) — Wortlaut → `ROADMAP-CHRONIK.md` → W1·4 (22.7.2026).
  **I2 bleibt blockiert** (⟵ Recherche `wbqdyap3x`: Schlichtungs-/Reduktions-/
  Rechtsmittel-Modifikatoren). Festsetzung/Dispositiv → Welle 2. **26×-Slot damit frei** →
  Voraussetzung für Welle 3 · Schritt 12 erfüllt.
- [ ] **5-PRAXIS · Frist × Kosten verzahnen** *(Ideen-Intake 20.7.2026 · UI-Orchestrierung, `[OF]`)*:
  <!-- @meta id: W1·5-PRAXIS · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/lib/rechnerPermalinks.ts, src/lib/permalink.ts, src/lib/icsExport.ts, src/pages/RechnerProzesskosten.tsx, src/pages/RechnerStreitwert.tsx, src/pages/RechnerZpo.tsx, src/pages/RechnerUebersicht.tsx, src/components/forms/ProzesskostenForm.tsx, src/components/forms/StreitwertForm.tsx, src/components/forms/ZpoFristenForm.tsx, src/components/forms/VorlagenSprung.tsx] · worktree: ja · 26x: nein · fahrplan: FAHRPLAN-PROZESSKOSTEN-COCKPIT.md -->
  Die heute isoliert nebeneinander stehenden Rechner zu **einem Praxis-Workflow verketten**:
  Streitwert-Ergebnis → Gerichtskosten + Parteientschädigung; Rechtsmittelfrist ab Entscheiddatum ×
  Kanton × Gerichtsferien → in denselben Kostenfluss und in den `.ics`-Export. **Baut vollständig auf
  Gebautem:** `prozesskosten.ts` (Art. 95 ZPO, alle 26 Kantone), `streitwert.ts`, `staffel.ts`,
  `zpoFeiertage.ts`/`schkgFeiertage.ts` (Computus + 26-Kantone-Feiertagsmatrix, BJ-verifiziert),
  `fristenEngine.ts` + Fachlader, `rechnerPermalinks.ts`/`permalink.ts` (Prefill), `icsExport.ts`.
  **Feasibility 🟢 aus-Bestand — ehrlich:** es fehlt **nur eine dünne UI-Orchestrierungs-/Prefill-Schicht**
  (Ergebnis-Übergabe zwischen Rechnern), **kein neues Rechenfundament**; keine offene technische Frage.
  **Nicht zu verwechseln mit `W1·4`** (Prozesskosten-Cockpit, `parked` auf `wbqdyap3x`): W1·4 betrifft
  Cockpit-Interna und Reduktionsfaktoren und ist blockiert — W1·5-PRAXIS ist die cross-Rechner-
  Verzahnungsschicht darüber und **unblockiert**; kein Parallel-Schritt zur selben Bau-Fläche (§14.3).
  Offen ist allein die Formfrage (eigene «Kosten-Cockpit»-Fläche vs. Prefill-Deep-Links) — Entscheid
  beim Bau, kein Blocker. Detail: `FAHRPLAN-PROZESSKOSTEN-COCKPIT.md` §Verzahnung. **DoD:** §6-/§9-Tore
  grün · **golden byte-gleich** (Engines bleiben unberührt) · `check:gegenpruefung` nur, falls doch ein
  Risiko-Glob berührt wird — sauberes Chaining vermeidet das. Trailer `Roadmap: W1·5-PRAXIS`.

### Welle 2 — Griff (Auffindbarkeit) + Konsultieren + mehr Klingen

- [ ] **5 · Auffindbarkeits-Schicht** *(ein Index → mehrere Oberflächen)*. **Zweiachsiger Einstieg
  <!-- @meta id: W2·5 · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->
  (Rechtsgebiet × Aufgabe)** ✅ **28.6.2026** (gegated, deployt 2.7.) · **Globale Artikel-
  Volltextsuche** ✅ **28.6.2026** (FlexSearch, 24 183 Bund-Artikel, build-time-Index, lazy).
  Wortlaut → `ROADMAP-CHRONIK.md` → W2·5 (22.7.2026).
  **Offen:** Kanton-Volltext im Index nachziehen · ~~Startseiten-Modul-Rahmen~~ → **wird in W2·5c
  gebaut** (Modul-Registry, `FAHRPLAN-STARTSEITE-V3.md` §4 — FUNDAMENT-Vorleistung).
  **Status-Korrektur 20.7.2026: `wip` → `ready`.** Der Restposten ist gemessen, nicht geschätzt:
  `scripts/such-index-generieren.ts` baut ausschliesslich `public/such-index/artikel-bund.json` aus
  `public/normtext/bund` (`ebene: 'bund'` hartcodiert) — der Kanton-Volltext fehlt im Index also belegt.
  Seit dem 10.7. kein Commit mit `Roadmap: W2·5`, kein Worktree, kein offener PR ⇒ es baut niemand daran.
  **Zur Klarstellung (Befund 20.7.):** `W2·5b`/`5c`/`5d`/`5g`/`5h` sind **keine Kinder** dieses Schritts —
  `scripts/plan/*` kennt kein Eltern-/Kind-Konzept, jeder trägt eigenes `@meta` mit eigenem Status. Es ist
  eine **Nummern-Familie, keine Hierarchie**; W2·5 ist selbsttragend und wird eigenständig abgeschlossen.
- [ ] **5b · Reader-Darstellung Bund** *(GESETZESDARSTELLUNG-BUND, `[OF]`, eigener Worktree)* —
  <!-- @meta id: W2·5b · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/pages/gesetz-leser/inhalt.tsx, src/pages/gesetz-leser/parts.tsx, src/components/normtext/ArtikelBody.tsx] · worktree: ja · 26x: nein · fahrplan: FAHRPLAN-GESETZESDARSTELLUNG-BUND.md -->
  **Status-Korrektur 20.7.2026: `wip(reader-wt)` → `ready`.** Der Marker zeigte auf einen Worktree, den es
  **nicht mehr gibt** (`git worktree list` kennt nur LexMetrik/lm-ci/lm-fundament/lm-planintake; kein Branch
  `*w25b*`/`*reader*`). Der Restblock ist gelandet: **PR #156, Merge-Commit `9b0f9e48` (5.7.2026)**.
  **Vor einem Bau-Start zwingend nachmessen (§8, nicht abhaken ohne Beleg):** `FAHRPLAN-GESETZESDARSTELLUNG-BUND.md`
  führt Batch C (M4 Suche/Gliederung responsiv · M5 kompakt zum Header · M7 Scroll-Offset nach Suche ·
  M8 Treffer-Highlight) und Batch D (M11 Verweis-Popup + Artikel-Bezeichnung · M6-Renderteil) noch unabgehakt —
  **M5 und M8 sind aber vermutlich durch W2·5d-Arbeit faktisch erledigt** (PR #284 «A35 Suche in Kopfzeile +
  A40 Highlight», PR #301 «Suchfeld in die Kopfzeile»), ohne dass die Fahrplan-Checkboxen nachgezogen wurden.
  Erst am heutigen Reader verifizieren, dann bauen — sonst wird zweimal dasselbe gebaut.
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
  - **Gebaut (✅; Wortlaut → `ROADMAP-CHRONIK.md` → W2·5b, 22.7.2026):** Bündel R (Scroll-Spy/
    Gliederung/A−A+, PR #59, prod 30.6.) · Bündel N (N1 zerrissene Artikelnummern am Extraktor +
    N2 Self-Link-Unterdrückung + Tor `check:invarianten`, deployt 2.7.) · Phase-1-Fundament-Batch
    P1/P2/P4/P5 (Spec 2.7.) · N3 `he`-Entities (0-Byte-Diff) · **W2·5b-Restblock komplett 5.7.**
    (P3 Drop-Klassen-Inventur + Tor `check:p-klassen` · linkedom-POC gemessen → KEINE Migration ·
    SVG-style-Leak; QS-GP-Quittungen). Spec-Heimat unverändert (s. oben).
- [x] **5c · Startseite V3 + Branding I2** *(STARTSEITE-V3, done)* — ✅ GEBAUT 3.7.2026 (Bausequenz S1–S5 komplett, PRs #106/#107/#108/#111 + S5 Brass-Hero) + Zuletzt-Tracker. **Rest offen (kein Blocker):** Wash-Ton-Veto `bg-surface`-Fallback in `Hero.tsx`. Spec `FAHRPLAN-STARTSEITE-V3.md`. Trailer `Roadmap: W2·5c`. **Chronik:** `ROADMAP-CHRONIK.md` → W2·5c.
  <!-- @meta id: W2·5c · status: done · of: ja · blocker: null · dep: [] · kollision: [src/pages/Startseite.tsx, src/components/start, src/lib/navigation.ts, src/lib/seo.ts, index.html, tailwind.config.js, src/components/layout/Topbar.tsx, scripts/prerender.ts] · worktree: ja · 26x: nein · fahrplan: FAHRPLAN-STARTSEITE-V3.md -->
- [ ] **5d · Gesetzes-UX & Darstellungs-Reglement** *(GESETZES-UX, `[OF]`, eigener Worktree; Auftrag David 4.7.)*:
  **§14-Intake 20.7.2026 (David):** Fassungshistorie im Ansicht-Menü an-/abwählbar (#27).
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
  **Gebaut (✅-Teilerfolge; Wortlaut verschoben → `ROADMAP-CHRONIK.md` → W2·5d, 22.7.2026):**
  Etappen **G0–G6 komplett gemergt** (Stand 5.7., PRs #132–#149) inkl. G3b Schritt 1–3
  (Kanton-Tarif-Tabellen Stufe 2 Klasse A–D · Anhang-Block-Rendering · SG-Füllpunkt-Rest;
  Gegenprüfungen bestanden) · **Anmerkungs-Welle A1–A18**: U-LINIEN, U-KOPF, U-VERWEIS,
  U-POSITION, U-SUCHE, U-PDF, U-UEBERSICHT alle ✅ gebaut/gemergt (Stand 11.7.).
  **Aktiv bleibt:** A18 (BGE-Regeste nach Sprachen) → W2·6-B B2 · A9 = DoD-Querschnitt
  (CPU-Throttle-Beweis) in jedem Bau-Prompt · **Kollisions-Precheck gegen laufende
  Worktrees vor jeder Einheit.** Trailer `Roadmap: W2·5d`.
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
  **Fedlex-eId-Anker & Verifizier-Deep-Links (Intake, Live-Verifikation 17.7.2026; David-GO
  17.7. = Aufnahme als Bau-Einheit) → Bau-Spec `FAHRPLAN-GESETZES-UX.md` §12.** Befund:
  Fedlex-Fragmente = AKN-eIds (Container kumulativ `book_2/…/chap_4/lvl_D`, Artikel flach
  `art_712_a`, sprach-invariant DE/FR/IT); zitierfähig NUR als ELI-Form `…/de#<eId>`, nie
  Filestore-URL. Grundsatz: kumulative Pfade sind revisions-brüchig ⇒ eIds NUR als regenerierte
  Outbound-Links, NIE als eigene Anker; `#art-` unangetastet (K2/R8). Einheiten: EID-1 Enabler
  (Container-eIds im Struktur-Sidecar mitschneiden statt wegwerfen, `scripts/normtext`,
  additiv/verhaltensneutral, `check:gegenpruefung`+Golden byte-gleich) · EID-2 Verifizier-Deep-Links
  «amtliche Fassung an genau dieser Stelle» (ELI-Form; je Artikel sofort, je Sektion nach EID-1;
  David-Gate Platzierung) · EID-3 Folge-Härtungen (Breadcrumb-eIds → teilbare Sektions-Deep-Links,
  Linien-Tiefe aus eId-Pfadlänge; optional, David-Gate wegen A27/§11.7 SektionKontextKopf).
  Bau-Go der Einheiten ausstehend (§12.5, David-Gates ans Ende). Trailer `Roadmap: W2·5d`.
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
  **Mess-Werkzeug 16.7. (advisory, kein Gate):** `npm run eval:suche` (`scripts/suche-eval.ts` +
  Gold `scripts/suche-eval-gold.json`, 69 verifizierte Paare) misst die ECHTE Produkt-Suche
  deterministisch/LLM-frei (Recall@1/5/10·MRR·NDCG@10 je Klasse) — ruft die Produktions-Pipeline
  (Sprung-Parser + FlexSearch-Recall + `artikelRanking`), kein Parallel-Index (§5). Baseline
  16.7. (`bibliothek/werkzeuge/suche-eval-baseline-2026-07-16.md`): Rang-1-Zitate stark
  (normzitat/bge 0.83), **umgangssprachliche Mehrwort-/Kompositum-Fragen = grösste Lücke**
  (Recall@10 0.18) → priorisiert die S-Kette (Dekompositions-/Synonym-Hebel · FR/SR-Alias
  Cst/LDIP im Norm-Sprung). Vorher-Stand für jede künftige Recall-/Ranking-Änderung.
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
- [ ] **5g-ZEIT · Norm-Zeitmaschine + Fassungs-Diff** *(Ideen-Intake 20.7.2026 · Extraktion, `QS-GP`)*:
  **Status 20.7.2026 (David):** «irgendwann, aktuell nicht relevant» → von `blocked` auf `parked`; der Blocker `zeit-historik-poc` bleibt bestehen. Damit verschwindet der Schritt aus der aktiven Entscheidungslast, ohne dass die Vorbedingungen verloren gehen.
  <!-- @meta id: W2·5g-ZEIT · status: parked · of: ja · blocker: zeit-historik-poc · dep: [] · kollision: [scripts/normtext, src/lib/normtext, public/normtext] · worktree: ja · 26x: nein · fahrplan: FAHRPLAN-GESETZESDARSTELLUNG-V2.md -->
  «Art. X, wie er am Tag Y galt» (verknüpft mit dem Entscheiddatum) + **visueller Diff zweier
  Konsolidierungen**. Konsolidiert die heute verstreute Planung in **eine** getrackte Einheit: **M16**
  «Point-in-Time» (freigeschaltet nach AKN-XML-Phase 1) + **G-HIST** als Daten-Unterbau.
  **Warum `dep: []` trotz dieser Vorbedingungen korrekt ist (§14.5, keine Schönung):** weder
  AKN-XML-Phase 1 noch G-HIST sind eigene getrackte ROADMAP-Schritte mit `@meta`-ID — sie leben als
  Strang-Detailblock/`FAHRPLAN-NORMTEXT-DARSTELLUNG.md §Intake`. Ein `dep` auf sie ist maschinell
  nicht formulierbar; die Reihenfolge wird darum **vollständig vom Blocker `zeit-historik-poc`
  getragen**, dessen Registereintrag beide Vorbedingungen ausdrücklich mitführt. Sobald eine der
  beiden ein eigener Schritt wird, wandert sie hier in `dep`.
  **Feasibility ehrlich getrennt — die zwei Hälften sind sehr ungleich (§8):**
  🟢 **Metadaten-Timeline** («gilt seit …» / «was änderte sich wann») ist aus dem Bestand baubar und
  **läuft bereits** als G-HIST-UI (`public/normtext/historie/*.json` mit `giltSeit` + `ereignisse[]`
  aus Datum/Absatz/AS-ELI) — **hier nicht duplizieren**.
  🟠 **Der eigentliche Wunsch — echter Alt-Volltext plus Alt-vs-Neu-Wortdiff — BRAUCHT ZUSATZDATEN und
  ist GROSS:** auf Platte liegt je Norm **nur die geltende Fassung** (ein `stand`/`fassungsToken`/
  `bloecke` je Artikel); die Historie liefert Änderungs-**Metadaten, nicht den historischen Text**. Die
  Fähigkeit ist vorhanden (Fedlex `jolux:Consolidation`/`dateApplicability` via SPARQL — `fedlex-versionen-pruefen.ts`
  fragt das bereits ab), aber es braucht einen **neuen historischen Extraktions-Durchlauf** (N Konsolidierungen
  × 227 Erlasse) samt neuem Speicher- und §7-Provenienz-Modell. Der Diff selbst ist danach
  trivial-deterministisch (String-Diff, §2) — **der Aufwand steckt vollständig in der Daten-Beschaffung.**
  **Etappe Z0 (blocker-auflösend, vor jedem Bau):** POC historische Konsolidierungs-Extraktion +
  Speicher-/Provenienz-Entwurf + **Bau-GO je Kandidat durch David** (analog zum bestehenden
  G-HIST-Intake-Vorbehalt). POC-Rahmen und Kostenschätzung:
  `bibliothek/recherche/norm-zeitmaschine-poc.md`. Timeline-Detail `FAHRPLAN-NORMTEXT-DARSTELLUNG.md §Intake`.
  **DoD:** POC-Verdikt + David-GO **vor** Bau · `check:normtext`/`check:normtext-netz` ·
  `check:gegenpruefung` · §7 a–d je Fassung · golden byte-gleich. Trailer `Roadmap: W2·5g-ZEIT`.
- [ ] **5h-GESETZ-UI · Gesetzes-Webseite: UX-Pass** *(Ideen-Intake 20.7.2026 · reine UI/Darstellung)*:
  <!-- @meta id: W2·5h-GESETZ-UI · status: ready · of: ja · blocker: null · dep: [W2·5d] · kollision: [src/pages/gesetz-leser, src/pages/GesetzLeser.tsx, src/components/normtext, src/components/suche] · seq-hart: [QS-UI(a Fundament-Pass + b Hierarchie-Pass), W2·5b(gesetz-leser/parts.tsx, inhalt.tsx, ArtikelBody.tsx)] · seq-weich: [W2·10-UI-NAV(gesetz-leser, GesetzLeser.tsx, components/suche), W3·14(Split-View-Rahmen)] · worktree: ja · 26x: nein · fahrplan: FAHRPLAN-GESETZES-UX.md -->
  **Folgeschritt aus `QS-UI`** (Davids Sequenz: erst app-weit, dann die Gesetzes-Fläche): die Rubrik
  `/gesetze` und der Gesetz-Leser maximal tauglich für die tägliche Norm-Arbeit — Normtext-Darstellung,
  Gliederung/TOC, Split-View im Leser, Suche im Gesetz, Fussnoten und Marginalien. **Baut auf** `W2·5d`
  (Gesetzes-UX, G0/G1/G2a gebaut) und `W3·14` (Split-View). **Feasibility 🟢 aus-Bestand.**
  **Sequenz maschinenlesbar (§12/§14.3) — bewusst NICHT als `dep`:** `QS-UI` ist ein
  **kontinuierlicher Querschnitt-Strang ohne Endzustand**; ein `dep` darauf wäre nie erfüllbar und
  machte diesen Schritt dauerhaft nicht startbar. Massgeblich ist darum `seq-hart` auf die konkreten
  QS-UI-**Teil**-Schritte (a) Fundament-Pass und (b) Informationshierarchie-Pass — erst wenn diese
  beiden stehen, wird die Gesetzes-Fläche angefasst. `dep` bleibt allein `W2·5d` (echte
  Bau-Voraussetzung). **Datei-Überschneidungen ausgewiesen statt nur in Prosa behauptet:**
  `W2·5b` (Reader-Dateien, `wip`) hart sequenziert; `W2·10-UI-NAV` (`gesetz-leser`,
  `GesetzLeser.tsx`, `components/suche`) und `W3·14` (Split-View-Rahmen) weich — Worktree-Isolation
  §12 ist hier Pflicht, nicht Kür.
  **Detailquellen sind die bestehenden Gesetzes-Fahrpläne — hier bewusst NICHT dupliziert (§14.3):**
  `FAHRPLAN-GESETZES-UX.md` (G-Etappen) und `FAHRPLAN-NORMTEXT-DARSTELLUNG.md`; diese Einheit bündelt
  allein den 8b-UX-Pass darauf. Sequenz-Begründung: erst müssen die gemeinsamen Muster und die
  Informationshierarchie aus `QS-UI` stehen, sonst wird die Gesetzes-Fläche zweimal angefasst.
  **DoD:** `check:perf-budget` · `check:linien-kanon` · `e2e/leser-lesemass` · axe · **golden byte-gleich
  (Normtext-Treue §15 — Tempo gewinnt nie gegen Treue)**. Trailer `Roadmap: W2·5h-GESETZ-UI`.
- [ ] **5i-HIST-ANSICHT · Fassungshistorie an-/abwählbar + Fussnoten von Änderungsvermerken trennen**
  <!-- @meta id: W2·5i-HIST-ANSICHT · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/pages/gesetz-leser/LeserAnsichtMenu.tsx, src/components/normtext/ArtikelBody.tsx, src/pages/gesetz-leser/inhalt.tsx, public/normtext/historie] · worktree: ja · 26x: nein · fahrplan: FAHRPLAN-GESETZESDARSTELLUNG-V2.md -->
  *(§14-Intake 20.7.2026, David — Queue-Platz 4 · Darstellung + Datenklassifikation, kein Rechtsinhalt)*.
  **Der Befund, der den Schritt trägt (gemessen, nicht geschätzt):** im OR sind **778 von 933 Fussnoten
  Änderungsvermerke** und nur **77 echte Verweise**. Die Fussnoten-Spalte ist damit zu ~83 % Fassungs-
  historie, die als «Fussnote» getarnt den Lesefluss trägt — wer Fussnoten abschaltet, verliert die
  echten Verweise mit; wer sie anlässt, liest überwiegend Revisionsprosa.
  **Bau-Vorschlag:** dreiwertige Auswahl **«Änderungshistorie: aus / als Fussnoten / als Chronologie»**
  im bestehenden **«Ansicht ▾»-Menü** (`src/pages/gesetz-leser/LeserAnsichtMenu.tsx` hat Persistenz **und** Pre-Paint-Mechanik
  schon — dort einklinken, kein neues Menü), **Verweis-Fussnoten unabhängig davon** schaltbar. Löst
  nebenbei das bekannte Leerraum-Residuum.
  **ZWINGENDE VORSTUFE H0 — Trennbarkeit MESSEN, bevor irgendetwas gebaut wird (§8):** die 778/77-Zahl
  belegt, *dass* es zwei Klassen gibt, **nicht**, dass sie maschinell **sauber trennbar** sind. Vor dem Bau
  ist korpusweit (nicht nur am OR — Leitplanke «nie aus einem Beispiel aufs Ganze») zu erheben, mit welcher
  Präzision/Recall die Klassifikation Änderungsvermerk ↔ Verweis gelingt und **wie die Grauzone aussieht**
  (Fussnoten, die beides tun). Ergebnis ist ein Verdikt mit Zahlen; fällt es schlecht aus, wird der
  Umschalter **nicht** gebaut (eine Ansicht, die 5 % der Fussnoten falsch einordnet, verliert Normtext-
  Information und verstösst gegen §15-Funktions-Treue). **Erst H0, dann H1 (UI).**
  **Fassungs-Fundament (§14-Intake 20.7., David — gilt über diesen Schritt hinaus):** Dieser Schritt ist die
  erste aktive Fläche, an der es greift — darum hier verankert statt im geparkten `W2·5g-ZEIT`:
  **(i)** Fassungs-Schlüssel (`fassungsToken`/`stand`/`sha`) **durchgängig** mitführen, auch wo heute nur die
  geltende Fassung gezeigt wird · **(ii)** Anker **fassungsstabil** halten (`#art-` darf nicht kippen, wenn
  später eine zweite Fassung danebentritt) · **(iii)** §8 «nicht geltendes Recht» **unmissverständlich**
  auszeichnen. Das ist **kein eigener Bau-Schritt**, sondern eine Auflage an **jede** Normtext-Arbeit;
  Begründung und Detail: `FAHRPLAN-GESETZESDARSTELLUNG-V2.md` §7.
  **DoD:** H0-Verdikt mit Korpus-Zahlen **vor** H1 · `check:normtext`/`check:historie` · golden byte-gleich
  (§6/§15 — kein Fussnoten-Verlust in KEINER der drei Ansichten) · axe · `check:perf-budget`.
  Trailer `Roadmap: W2·5i-HIST-ANSICHT`.
- [d] **5j-TABELLEN · Tabellen in Gesetzen lesbar machen** *(§14-Intake 20.7.2026, David: **ausdrücklich «später»**)*
  <!-- @meta id: W2·5j-TABELLEN · status: parked · of: ja · blocker: david-spaeter-tabellen · dep: [] · kollision: [src/components/normtext/ArtikelBody.tsx, src/pages/gesetz-leser/inhalt.tsx] · worktree: ja · 26x: nein · fahrplan: FAHRPLAN-GESETZES-UX.md -->
  Beispiel `/gesetze/kanton/BS-154.810#art-29`. **Datenlage erhoben — die Daten sind GUT:** strukturiert als
  Block-Feld `mehrspaltig` mit `spalten[{typ,titel}]` + `zeilen[[…]]`. Es ist ein **reines Darstellungs-
  Problem**, keine Extraktions-Lücke — darum bewusst **nicht** mit `W2·13-KANTONE` (Extraktionstiefe)
  gebündelt: andere Risiko-Klasse (§14.2). **Fläche: 656 `mehrspaltig`-Blöcke in 137 Erlassen** (VTS 68 ·
  CHEMRRV 31 · VZV 30 · NBV 26 · VVV 25 · LRV 21). **Beim Bau zu beachten:** Lesespalte 42rem vs. breite
  Tarif-Tabellen · §15.1 (kein DOM-Entfernen; Ctrl+F und Print müssen vollständig bleiben) · Mobil @390.
  **Parkgrund, ehrlich:** kein technischer Blocker — David hat den Punkt am 20.7. ausdrücklich zurückgestellt.
  Umparken auf `ready` ist ein Einzeiler, sobald er ihn zieht. Trailer `Roadmap: W2·5j-TABELLEN`.
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
    - [x] **Kanton BS: Rechtsprechungs-Vollimport seit 2022 (amtliches Portal)** *(BS-Tranche
      des P3+-Slices, FAHRPLAN-RECHTSPRECHUNG §10; Direktauftrag David 19.7.2026 — zieht die
      erste Kanton-Tranche VOR die E5-Slot-Kette; committete `public/`-Projektion, DB-Angleichung
      = Folge-Einheit F4 in E5)*: ~3'765 Dokumente (2022–2026, inkl. 42 datumlose) aller 4
      BS-Instanzen von `rechtsprechung.gerichte.bs.ch` (Findinfo/Omnis, GET-only-CGI); Pipeline
      `scripts/rechtsprechung/bs-*` (`npm run entscheide:bs`, resumierbar, golden raw), Count-Gates
      Portal==Inventar==Snapshots + entscheidsuche-Untergrenze, Latin-1/Windows-1252-Fidelity,
      neues Offline-Tor **`check:bs-entscheide`** in der Gate-Kette, `BUDGET_MB` 200→1024 (David
      19.7.2026). Detail: `FAHRPLAN-KANTONALE-ENTSCHEIDE.md` §7a + Dossier
      `bibliothek/register/BS-RECHTSPRECHUNG-QUELLE-2026-07.md`. Trailer `Roadmap: W2·6-BS`.
    - [~] **Richter-/Spruchkörper-Filter — Fundament** *(`R-RICHTER`, Direktauftrag David 20.7.2026;
      gebündelt mit der BS-Tranche darüber: dieselbe Pipeline, dasselbe Datenasset — kein
      Parallel-Schritt, §14.2)*: der amtliche Spruchkörper wird aus dem Rubrum extrahiert und
      korpusweit zu Kanon-Slugs normalisiert, damit die Rechtsprechung nach Richter:in filterbar
      wird. **Block A (Daten/Risiko, erledigt):** Schnitt `scripts/rechtsprechung/bs-besetzung.ts`
      (BS-Deckblatt + Signatur, Re-Parse der 3765 aus dem Roh-Golden **ohne Re-Crawl**), reiner
      Parser/Kanon `src/lib/rechtsprechung/besetzung.ts` (deterministisch, §2), Projektion
      `BrowseEntscheid.richter[{s,r}]` + neues `public/rechtsprechung/richter.json`
      (Slug → Anzeigename + Trefferzahl), neues Tor **`check:besetzung`** in der Gate-Kette
      (Leak/Konsistenz/Determinismus hart, Abdeckung mit Schwelle, Kollisions-Report).
      Abdeckung BS 98.6 % · Bund 96.1 %, 511 Slugs (208 Richter:innen, 303 Gerichtsschreiber:innen),
      **Anonymisierungs-Leak-Scan korpusweit 0**. `abschnitte`/`sha` byte-unverändert (§6).
      **Block B (offen, reines UI):** Facette als Autocomplete/Combobox + `?richter`-URL-Achse
      + e2e/axe/perf — bewusst getrennt, um Risiko-Klassen nicht zu mischen (§14.2).
      **Spätere Politur:** Gerichtsschreiber:in als eigene Achse, Spruchkörper-Anzeige im Reader,
      Richter-Profilseite. Detail: `FAHRPLAN-RECHTSPRECHUNG.md` §12. Dossier
      `bibliothek/rechtsprechung/besetzung-extraktion-2026-07-20.md`. Trailer `Roadmap: R-RICHTER`.
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
      **Alle 5 Pakete (1 Currency · 2 Botschaften · 5 AS-Revisionen · 3 Vernehmlassungen · 4 Staats-
      verträge) ✅ AUSGEFÜHRT (Stand 10.7.2026)** — Detail `FAHRPLAN-FEDLEX-PORTFOLIO.md`; Wortlaut →
      `ROADMAP-CHRONIK.md` → Fedlex-Portfolio (22.7.2026).
    - [ ] **Datenhaltung-Bau: DB-Artefakt + Massen-Korpus + Edge-Suche** *(W2·6-DATA; Council 2.7.2026 — löst die drei OCL-Abbau-„DAVID-ENTSCHEID"-Punkte auf)*.
      <!-- @meta id: W2·6-DATA · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/normtext-snapshot.ts, scripts/prerender.ts, public/normtext/register.json] · worktree: ja · 26x: ja · fahrplan: FAHRPLAN-DATENHALTUNG.md -->
      Andockpunkt **eine Schicht UNTER dem heutigen Generator** — die bestehenden Adapter befüllen
      ein libSQL/SQLite-Artefakt, `public/*.json` + Prerender werden Projektion (Tor `check:paritaet`,
      §7 Build-Regel 6). Etappen (Detail `FAHRPLAN-DATENHALTUNG.md`): **E0** Fundament/Reverse-
      Befüllung+Parität → **E1** Generator-Flip → **E2** Edge-Suche-POC (alle BGE + alle Bund-Gesetze)
      → **E3** BGer-Massen-Import (voilaj-Konsum; **HÄLT den 26×-Slot seit 3.7.2026** — Reihenfolge ENTSCHIEDEN:
      E3 zuerst, W3·12 danach, David 2.7., `FAHRPLAN-DATENHALTUNG.md` §10(1)) → **E4** Zitat-Graph → **E5** Kanton-Rechtsprechung (26×, Slot-Kette #4) → **E6a**
      Verwaltungsverordnungen (Kreisschreiben — Bund-Strang, kein Slot; Nordstern-Doktyp) → **E6b**
      Materialien-Vollausbau (Detail `FAHRPLAN-DATENHALTUNG.md` §5). E0–E2 golden-neutral zu den Gesetzen; jede Projektions-
      Änderung golden byte-gleich (§6) + `QS-GP`; OCL-Pakete W12 (Bulk-Parquet) + F2 gehen hier auf. **E0 ✅ 2.7. (PR #80/81, check:paritaet in der Gate-Kette) · E0+ ✅ 3.7. (Ziel-Schema §3, Partitionierung je Doktyp, Parität 1796 Dateien) · E1 (Generator-Flip Bund + Tor `check:datenhaltung`) ✅ 3.7. · E2 (Edge-Suche `api/suche.ts` + Turso; Sync-Timeout-Wurzel behoben 20.7., PR #313) ✅ · E3 (`rechtsprechung.db`, 488 MB) ✅** — Wortlaut/Beweise → `ROADMAP-CHRONIK.md` → W2·6-DATA (22.7.2026). **VORBEHALT:** alter Direktpfad bleibt Wächter (Entfernen = eigener §6-Schritt); Kanton/Rechtsprechung/Materialien noch Blob-Weg. **Weichen entschieden 3.7.:** Kontext-Auslieferung = Hybrid (Shards+Edge, §10(6)/§11.5) · Massen-Rebuild = Voll-Rebuild (§10(7)). **Klarstellung Leitprinzip 4:** Reverse-Ingest committeter Daten öffnet KEINEN 26×-Slot.
      **Korrektur 20.7.2026 (§8 — die alte Zeile «Nächstes: E4 — hält den 26×-Slot» war doppelt falsch):**
      **E4 ist seit 3.7.2026 LOKAL FERTIG** (`FAHRPLAN-DATENHALTUNG.md` §5/E4, Bericht
      `bibliothek/register/e4-lokal-2026-07-03.md`, Oracle-Tor grün, 0 UNERKLÄRT) — E0/E0+/E1/E2/E3/E4 sind
      damit alle gebaut. Und der Schritt **hält den 26×-Slot nicht mehr** (am 20.7. an `W3·12` übergeben, s.
      `@slot-kette`). **Was wirklich offen ist, zerfällt in zwei Klassen:** (i) **VPS-gebunden**
      (David-Gate `vps-bestellung-david`): E3-Serving (rsync + cold-FTS `fts_entscheide_masse`, 58-GB-Klasse,
      Read-API, Long-Tail-Route `/rechtsprechung/:key`) und die E4-UI-Panels · (ii) **frei baubar, ohne VPS:**
      die **Datenhaltungs-Optimierung** (§14-Intake David 20.7., verortet in `QS-BASIS` (d), Bau-Strang hier —
      inkrementeller Sync · contentless-FTS · Index-Strategie · **Heiss/Kalt-Grenze = DAVID-GATE**, s. unten).
      Nachgelagert bleiben **E5** (Kanton-Rechtsprechung, 26× — braucht den Slot zurück) und E6a/E6b.
      **Heiss/Kalt-Grenze als DAVID-GATE (§8-Frage, nicht technisch entscheidbar):** 195 000 Massen-Entscheide
      passen **nie** in die 1-GB-Turso-Replika (Budget-Ist 20.7.: 652/1024 MiB bei 5093 kuratierten Entscheiden).
      Es muss darum entschieden werden, **was die Suche behaupten darf**, wenn der Long-Tail kalt liegt:
      schweigen, «nur kuratierter Korpus durchsucht» ausweisen, oder kalt nachladen mit spürbarer Latenz.
      Ein stiller Teiltreffer wäre der Fehler aus PR #313 in neuer Form (dort servierte `api/suche` einen halben
      Index, **ohne je rot zu werden**). Entscheid gehört David; bis dahin nicht implementieren.
    - [x] **+ Auftrags-Eingang 30.6.: Bündel B** — **B1+B2+A18 ✅ GEBAUT 5.7.2026** (Branch
      <!-- @meta id: W2·6-B · status: done · of: ja · blocker: null · dep: [] · kollision: [] · worktree: ja · 26x: nein -->
      `feat/w26b-regeste-a18`); B3 war schon 10.7. durch den U-KOPF-Refactor `60988318` geschlossen
      (Playwright-Beweis BGE 152 I 65) ⇒ alle drei Posten erledigt, Status `done`. B2/A18: Regeste
      dreisprachig aus bger.ch clir, 272/272 BGE, Tor `check:entscheide`, Gegenprüfung bestanden.
      Wortlaut → `ROADMAP-CHRONIK.md` → W2·6-B (22.7.2026).
    - [x] **Verweis-Präzision im Entscheid-Leser (Referenz BGE 151 III 377)** *(W2·6, `QS-GP`, 3.7.2026)*. i.V.m.-Ketten-Verlinkung (Kürzel auf bare Glieder propagiert, `normVerweiseImText`) + Zitierte-Normen-Chips → Sprung zur ersten Fundstelle-Erwägung; Tore grün, Snapshots additiv. **Chronik:** `ROADMAP-CHRONIK.md` → W2·6/Verweis-Präzision.
    - [x] **BGE-Auszug abgeschnitten — vollständig gefixt (34/34)** *(W2·6-BGE, Inhaltsverlust, `[OF]`)*. 29.6.2026: still mitten im Wort gekappte Auszug-Erwägungen voll nachgeladen (`fuelleGekappteErwaegungen` + Id-Disambiguierung) + Schutz-Tor U+2026 in `check:entscheide`; alle 34 BGE regeneriert, golden byte-gleich. Öffnet keinen 26×-Slot. **Chronik:** `ROADMAP-CHRONIK.md` → W2·6/BGE-Auszug.
      - [x] **Rest 30.6.2026 geschlossen** — `bge_151_V_1`/`bge_151_V_30` via Id-Disambiguierung sauber re-gefetcht (kein Hand-Edit §7), WARN-Quarantäne entfernt. **Chronik:** `ROADMAP-CHRONIK.md` → W2·6/BGE-Auszug.
- [ ] **6-FILTER · Entscheid-Filter über die API — Richter + allgemeine Facetten** *(§14-Intake 20.7.2026, David — Queue-Plätze 2 und 3; **ULTRACODE freigegeben** für Teil b)*
  <!-- @meta id: W2·6-FILTER · status: ready · of: ja · blocker: null · dep: [] · kollision: [api/suche.ts, scripts/datenhaltung, src/components/suche, src/lib/rechtsprechung, public/rechtsprechung] · worktree: ja · 26x: nein · fahrplan: FAHRPLAN-ENTSCHEIDSUCHE-AUSBAU.md -->
  **Gebündelt, weil beide Teile dieselbe Bau-Fläche tragen** (Turso-Schema + Sync + `api/suche` + Facetten-UI)
  und dieselbe Risiko-Klasse haben (Abfrage/Projektion, **kein** Rechtsinhalt) — §14.2. Reihenfolge folgt
  Davids Queue: **a vor b**. Vorleistung steht: Besetzung ist extrahiert und verlinkt (#309/#310/#311),
  die Sync-Architektur trägt seit #313 einen atomaren Voll-Rebuild.
  - **a · Richterfilter über die API** — Turso-Tabelle **`entscheid_richter(entscheid_id, slug, rolle)`** +
    Slug-Index, `api/suche` um **`?richter=<slug>`**. Heute existiert der Filter nur client-seitig über die
    ausgelieferten Projektionen; über die API ist er nicht abfragbar. **Feasibility 🟢** — Daten liegen vor
    (19 467 Nennungen, 484 Personen, 100 % eindeutig), es ist Schema + Sync + Query-Parameter.
  - **b · Gerichtsentscheide allgemein besser filterbar** — gilt **allgemein, nicht nur BS** (David).
    **Datenlage erhoben, drei ehrlich getrennte Klassen (§8):**
    🟢 **billig, sofort:** `datum` · `leitcharakter` (**1259 Leitentscheide**) · `sprache` ·
    `regesteVorhanden` · `gerichtstyp` — alle durchgängig befüllt.
    🔴 **teuer, NICHT als Filter versprechen:** `normKeys` ist **nur zu 18 % befüllt**. Ein Normen-Filter auf
    18 % Abdeckung erzeugt stille Falsch-Negative («keine Treffer» statt «nicht erfasst») — das ist der
    Fehler aus PR #313 in neuer Form. Entweder vorher die Abdeckung heben oder die Lücke im UI **ausweisen**;
    nicht stillschweigend filtern. **Abdeckung heben = eigener Schritt `W2·6-NKEY`** (§14-Intake 21.7.2026).
    🟠 **ableitbar, aber verifikationspflichtig:** **Geschäftsnummer-Präfix → Verfahrensart**
    (VD 612 · BES 494 · SB 450 · IV 429 …). Die Ableitung ist plausibel und wertvoll, aber sie ist eine
    **Rechtsaussage über die Verfahrensart** — sie **MUSS gegen die amtliche Geschäftsordnung/das amtliche
    Abkürzungsverzeichnis verifiziert werden**, bevor sie ein Filter-Label wird (§7 Norm+Link+Stand). Bis
    dahin nicht ausliefern. Dieser Teil ist Risikopfad ⇒ `check:gegenpruefung`, Opus.
  **Abgrenzung:** Ranking und Prognose über Richter:innen bleiben gesperrt (`richter-analytik-gate`,
  `W3·15-RICHTER`); Filtern/Facette/Verlinkung sind ausdrücklich frei. Richter im Entscheid klickbar (#24)
  ist ✅ mit #311 erledigt und hier **nicht** erneut geplant.
  **DoD:** `check:entscheide` · `check:besetzung` · `check:turso-frische` (Soll-Zahlen mitziehen!) ·
  Verifikations-Beleg für jede Verfahrensart-Abkürzung · golden byte-gleich. Trailer `Roadmap: W2·6-FILTER`.
- [ ] **6-RNAME · Richternamen gegen den Staatskalender auflösen** *(§14-Intake 20.7.2026, David · **Extraktion/Personendaten — Risikopfad**, `QS-GP`)*
  <!-- @meta id: W2·6-RNAME · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/rechtsprechung, public/rechtsprechung, src/lib/rechtsprechung] · worktree: ja · 26x: nein · fahrplan: FAHRPLAN-ENTSCHEIDSUCHE-AUSBAU.md -->
  Abgekürzte Vornamen auflösen: **«P. Kaderli» → «Kaderli Peter»**, Abgleich gegen **Staatskalender /
  amtliches Behördenverzeichnis** (§7: amtliche Quelle, mit Stand). **Bewusst NICHT mit `W2·6-FILTER`
  gebündelt (§14.2): andere Risiko-Klasse** — hier werden Personen identifiziert, dort nur abgefragt.
  **Harte Gegenrichtung, die den Schritt definiert:** zwei verschiedene Personen mit gleichem Nachnamen +
  gleicher Initiale werden **NIE verschmolzen**. Aufgelöst wird **nur bei Eindeutigkeit**; bei jeder
  Mehrdeutigkeit bleiben die Einträge **getrennt** und wandern in einen **Kollisions-Report**. Diese Regel
  ist nicht optional: #309 ging mit **11 erfundenen Amtsträger:innen** live (u. a. «Donzallaz Beusch» =
  zwei Bundesrichter verschmolzen), gefunden erst **nach** dem Merge. Eine Namens-Auflösung ist exakt die
  Operation, die diese Fehlerklasse erzeugt.
  **DoD:** Auflösung nur bei Eindeutigkeit · Kollisions-Report als Artefakt · Phantom-Scan + Vorsitz-
  Kardinalität (die Tore aus #310) grün über die **volle** Grundgesamtheit, nicht über eine Stichprobe ·
  `check:gegenpruefung` **bestanden** (Opus, unabhängig gegen den Staatskalender) · golden byte-gleich.
  **Fundament zugleich für** `W3·15-RICHTER` und Davids «Kenne-deine-Prüfer»-Dossier.
  Trailer `Roadmap: W2·6-RNAME`.
- [ ] **6-ZNETZ · Zitationsnetz: Rückwärts-Zitate + Leitentscheid-Score** *(Ideen-Intake 20.7.2026 · Daten-Derivation, `QS-GP`)*:
  <!-- @meta id: W2·6-ZNETZ · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/verzahnung, src/lib/verzahnung, src/lib/rechtsprechung, public/rechtsprechung] · worktree: ja · 26x: nein · fahrplan: FAHRPLAN-VERZAHNUNG-UI.md -->
  «Welche Entscheide zitieren diesen?» (Rückwärts-Kanten) + **Leitentscheid-Score nach Zitierhäufigkeit**.
  **Baut auf** hartem Bestand: jeder Entscheid-Snapshot trägt bereits `zitierteEntscheide` (BGE-Zitate UND
  Geschäftsnummern; 200-BGE-Stichprobe = 2566 Kanten), die Vorwärts-Auflösung läuft schon zur Laufzeit
  (`src/lib/verzahnung/entscheid-kanten.ts` gegen `register.json`), und ein **1:1-Vorbild für den
  Build-Zeit-Rückwärts-Index existiert**: `scripts/normtext/entscheide-schreiben.ts` schreibt bereits
  `register.json` + `norm-index.json` + Leitfall-Shards (Typen `src/lib/rechtsprechung/norm-index.ts`).
  **Feasibility ehrlich zweistufig:**
  🟢 **kuratierter Korpus** (5093 Snapshots auf Platte) ist jetzt baubar — der neue Build-Generator ist
  der Spiegel des norm-index-Generators (+ Shards + UI-Chip). 🟠 **Long-Tail über die 195k Massen-Entscheide
  ist es NICHT:** er hängt am nicht ausgelieferten ~5,7-GB-Artefakt `masse.db` (dort liegt `zitat_kanten`
  mit `ix_zitat_nach` bereits vor) und fällt damit in **`W2·6-DATA` E3-Serving/E4** — kein Parallel-Schritt
  (§14.3). **UI läuft in `W2·7-VZUI` V2 ein** («Wird zitiert von» + Startseiten-Kachel «Meistzitierte
  Artikel») und wird hier **nicht doppelt geplant**. **Score bleibt deskriptiv** — reine Zählhäufigkeit mit
  ausgewiesener Grundgesamtheit, kein LLM-Ranking und keine Qualitätsaussage (§2/§8). Feasibility-Beleg:
  `bibliothek/recherche/zitationsnetz-feasibility.md`. **DoD:** Generator deterministisch (2 Läufe
  byte-gleich) · `check:gegenpruefung` bestanden · golden byte-gleich · Tore grün. Trailer
  `Roadmap: W2·6-ZNETZ` + `Gegenpruefung: <Verdikt>`.
- [ ] **6-NKEY · normKeys-Abdeckung generalisieren — Register-Ableitung + FR/IT-Aliase + Sichtbarkeits-Tor** *(§14-Intake 21.7.2026, David · Extraktion/Mapping — Risikopfad, `QS-GP`; **ULTRACODE freigegeben** für den Bau)*
  <!-- @meta id: W2·6-NKEY · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/normtext, public/rechtsprechung, src/lib/rechtsprechung] · worktree: ja · 26x: nein -->
  **Befund (empirisch, 21.7.2026, Anlassfall `bge_148_II_475` ohne KG-Verzahnung):** Von 9 905
  Norm-Zitat-Nennungen über 5 093 Entscheide mappt die Hand-Whitelist `ABK_REGISTER`
  (`scripts/normtext/entscheide-mapping.ts`, 26 Einträge) nur **43 %** auf `normKeys`; der Rest wird
  **still verworfen** (§6.7-Verstoss dem Geist nach). Davon: **97 Erlasse sind längst im Korpus**,
  fehlen nur in der Tabelle (+13 %: IPRG, KVG, RPG, MWSTG, SVG, VwVG, USG, KG, …); **~40 % sind
  FR/IT-Abkürzungen** (CST→BV, CP→StGB, CPP→StPO, LTF→BGG, CO→OR, CPC→ZPO, CC→ZGB, LP/LEF→SchKG,
  LIFD→DBG, LAMal→KVG, LCart→KG, …), die die Tabelle gar nicht kennt. Drei Bausteine, Reihenfolge
  **a → c → b**:
  - **a · Mapping aus dem Register generieren (§5):** Die deutsche Abkürzung IST der Register-Key
    (`src/lib/normtext/register.ts`, 227 Bund-Erlasse) — Tabelle build-time ableiten statt parallel
    pflegen; jeder künftige Erlass wird automatisch verzahnbar (Ende der «BGFA-Fix»-Fehlerklasse,
    PR #290). Deklarierte Kollisions-/Ausschlussliste bleibt (Muster StG≠StGB; kantonale Namensvetter
    StG/KV/BauG dürfen NIE auf Bundesrecht mappen — §1).
  - **c · Sichtbarkeits-Tor gegen stilles Verwerfen (§6.7):** Wächter listet ungemappte Abkürzungen
    nach Häufigkeit gegen eine deklarierte Ignore-Liste (kantonal/ausserhalb Korpus/Rauschen wie
    «BGE» = bewusst); Neues darüber = rot. Sabotage-Probe Pflicht. Nebenprodukt: datenbasierte
    Korpus-Kandidaten (KVG 108+ Nennungen).
  - **b · Amtliche DE/FR/IT-Aliase aus Fedlex-Metadaten:** SPARQL liefert die amtliche Abkürzung je
    SR-Nummer und Sprache (Pipeline spricht Fedlex-SPARQL bereits, `scripts/fedlex-cache.sh`);
    generiertes Alias-Artefakt (`*.generated.ts`, Quelle+Stand §7, `merge=regen` §12), kein Hand-
    Erraten von Paaren. Ziel-Abdeckung **85–90 %**.
  **Backfill:** Entscheid-Snapshots + `norm-index`/Leitfall-Shards regenerieren (5 093 Entscheide,
  deterministisch, 2 Läufe byte-gleich). **Bündelung geprüft (§14.2/§14.3):** NICHT in `W2·6-FILTER`
  (andere Risiko-Klasse: hier Extraktion/Mapping = Risikopfad, dort Abfrage/Projektion) — löst aber
  dessen 🔴-Blocker «normKeys 18 %» und ist Fundament für `W2·6-ZNETZ`/`W2·7-VZUI`-Normfilter.
  Kollisionsfläche mit ZNETZ/FILTER (`public/rechtsprechung`) ⇒ Worktree + serielle Landung (§12).
  **DoD:** `check:entscheide` grün · Wächter-Tor einmal rot gezeigt · Abdeckungs-Quote vorher/nachher
  im PR ausgewiesen (§8) · `check:gegenpruefung` **bestanden** (Opus, unabhängig gegen Fedlex-
  Abkürzungen) · golden byte-gleich. Trailer `Roadmap: W2·6-NKEY` + `Gegenpruefung: <Verdikt>`.
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
  <!-- @meta id: W2·6a-MAT · status: done · of: ja · blocker: null · dep: [W2·7] · kollision: [scripts/materialien/**, public/materialien/**, src/lib/materialien/typen.ts, src/lib/materialien/register.ts, src/pages/Materialien.tsx, src/lib/kontext.ts, src/components/kontext/KontextPanel.tsx] · worktree: ja · 26x: nein · fahrplan: FAHRPLAN-MATERIALIEN-VERZAHNUNG.md -->
- [x] **7 · Verzahnungs-Klingen** *(`[OF]`, amtlich)* — GEBAUT 5.7.2026: (a) Verjährungs-/Gewährleistungs-Board · (b) Verzugs-/Inkasso-Strecke · (c) Gerichts-Baustein-Set (Zitierer + Rubrum-Vorlage). Reine Darstellung auf bestehenden Engines (§3), golden 201 (+8 additiv), Gegenprüfung bestanden. **Chronik:** `ROADMAP-CHRONIK.md` → W2·7.
  <!-- @meta id: W2·7 · status: done · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->
- [ ] **8 · Schriften-Baukasten** *(VORLAGEN, Worktree)* — Berufung/BGG-Beschwerde/Sistierung/
  <!-- @meta id: W2·8 · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/lib/vorlagen] · worktree: ja · 26x: nein · fahrplan: FAHRPLAN-VORLAGEN-AUSBAU.md -->
  Beweisverzeichnis über `vorlagen/engine.ts`; Zulässigkeit nur Hinweis, Status «entwurf».
  - [ ] **Zitat-Export & Fussnoten-Ausgabe** *(Ideen-Intake 20.7.2026, `[OF]`, klein → inline §14.1)* —
    Ein-Klick-Zitat in korrekter amtlicher Form (`BGE 148 III 1 E. 2.3` · `BGer 5A_691/2023 vom …`)
    plus **Word-Fussnoten-Export** einer gesammelten Zitatliste. **Baut auf** fertigem Bestand:
    `src/lib/gerichtszitat.ts` (deterministischer BGE/BGer-Formatierer),
    `src/lib/rechtsprechung/ecli.ts` (ECLI-Minting), `src/lib/rechtsprechung/zitat-extraktion.ts`,
    `src/components/useKopieren.ts`, `src/lib/vorlagen/vorlagenDocx.ts` (produktiver docx-Renderer, `docx ^9.7.1`) und dem
    bereits gebauten Gerichts-Baustein-Set aus `W2·7` (Zitierer + Rubrum). **Feasibility 🟢
    aus-Bestand:** nur ein **dünner Renderer** (docx-Fussnoten über die vorhandenen
    `gerichtszitat`/`ecli`-Ausgaben) + Verdrahtung an Entscheid- und Norm-Ansichten — keine neue
    Abhängigkeit, kein neues Fundament. Detail in `FAHRPLAN-VORLAGEN-AUSBAU.md`. **DoD:** golden
    byte-gleich · Zitierform stichprobenweise gegen die amtliche Fundstelle geprüft · Tore grün.
    Trailer `Roadmap: W2·8`.
- [ ] **9 · Aufräum-Item** *(UX-PUNKTELISTE ⚫ überholt)*. Deliverable = Mapping-Tabelle
  **§14-Intake 20.7.2026 (David):** Bedienungsanleitung/Onboarding für LexMetrik — Ersteinstieg «was kann das Werkzeug», je Rubrik ein Kurzpfad; kein eigener FAHRPLAN, Detail inline in `FAHRPLAN-UX-PUNKTELISTE.md`.
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
  **§14-Intake 20.7.2026 (David) — zwei Punkte HIER eingegliedert statt danebengelegt (§14.3), weil sie
  exakt dieselbe Bau-Fläche treffen (`scripts/normtext`, `public/normtext/kanton`, kantonale Adapter):**
  - **K-15 · Kantonale Extraktionstiefe** *(**ULTRACODE**, David: später)*. **Befund, nicht Vermutung:**
    **BS hat 41 % Erlasse ohne Gliederung** · kantonale Fussnoten sind **um Faktor ~40 dünner als beim
    Bund** · **ZH hat 0 Struktur-Dateien**. **Hypothese** (ausdrücklich als solche markiert): Quellen-
    Priorität bzw. PDF-Tier — kantonale Erlasse werden aus schwächeren Quellformaten gezogen als die
    Bundes-Erlasse. **DIAGNOSE VOR FIX, verbindlich:** erst je Kanton erheben, **welches Quellformat**
    tatsächlich verwendet wird und **wo** die Struktur verloren geht (Quelle dünn? Adapter dünn?
    Nachbearbeitung?). Ein Fix ohne diese Zuordnung repariert die falsche Schicht. Passt zur bestehenden
    Leitplanke «korpusweiter Adapter-Hebel VOR jedem Bulk» (`FAHRPLAN-BS-VORBILDKANTON.md`) und zu
    K-G3 (Gliederungs-Extraktion korpusweit) — dort einhängen, nicht doppelt planen.
  - **K-16 · Kantonale Änderungshistorie + Fundstelle im Kantonsblatt** *(David: «wenn möglich»)*.
    **Feasibility 🟢, belegt:** die kantonale Quelle liefert das **strukturiert** — `change_documents`
    und `history_information_map`. Es ist also Mapping-Arbeit, keine Text-Heuristik. **Zwei Auflagen:**
    (i) §7 Norm + Link + **Stand** je Fundstelle; (ii) die Kantonsblatt-Fundstelle ist eine amtliche
    Referenz — **stichprobenweise gegen das Kantonsblatt selbst verifizieren**, nicht der API blind
    glauben. Beide Punkte sind Risikopfad (Extraktion) ⇒ `check:gegenpruefung`, Opus.
  Trailer `Roadmap: W2·13-KANTONE`.
- [ ] **14-SIGNAL · Watchlist & Änderungs-Signale** *(Ideen-Intake 20.7.2026 · Infra/UI, kein Rechtsinhalt)*:
  <!-- @meta id: W2·14-SIGNAL · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/fedlex-wiedervorlage-generieren.ts, public/normtext/currency.json, public/rechtsprechung/register.json, src/lib/zuletztVerwendet.ts, src/pages/Startseite.tsx, src/pages/Einstellungen.tsx] · worktree: ja · 26x: nein · fahrplan: FAHRPLAN-FEDLEX-PORTFOLIO.md -->
  «Sag mir, wenn sich Norm Y ändert / Gericht X neu entscheidet.» **Baut auf** vorhandener Currency-/
  Drift-Infra: `check:fedlex-versionen`, `check:rss-oc`, `scripts/fedlex-wiedervorlage-generieren.ts`,
  `register/parameter-verfall.md`, `public/normtext/currency.json`, Muster `src/lib/zuletztVerwendet.ts`.
  **Feasibility bewusst gespalten (§8) — die zwei baubaren Stufen sind NICHT das, wonach es klingt:**
  **B1 🟢 statischer Änderungs-Feed** (RSS/Atom/JSON, zur Build-Zeit aus `currency.json` + Verfallsregister
  erzeugt, analog `gen:fedlex-wiedervorlage`) · **B2 🟢 Client-Watchlist** (localStorage-Liste gemerkter
  Normen/Gerichte, beim Besuch gegen die statischen Build-Artefakte geprüft → «seit deinem letzten Besuch
  geändert»-Flag; exakt das `zuletztVerwendet`-Muster). Beide sind **zustandslos-konform** und aus dem
  Bestand baubar.
  **Welches Feld das Rückblick-Signal WIRKLICH trägt (empirisch nachgelesen, §7 — Korrektur zum
  Erst-Intake):** `public/normtext/currency.json` führt je Erlass nur `{geprueftAm, naechsteFassungAb?}`.
  `geprueftAm` ist das Datum **unseres Currency-Laufs**, kein Norm-Änderungsdatum — es wandert bei jedem
  Re-Check auch ohne jede Änderung (→ Falschmeldungen) und markiert eine echte Änderung nicht als solche.
  **Tragfähig ist es nur für den VORWÄRTS-Fall** (`naechsteFassungAb`, «ab wann kommt eine neue Fassung»).
  Das **RÜCKBLICK-Signal kommt aus den Normtext-Snapshots**: `public/normtext/**/<ERLASS>.json` führt je
  Artikel `stand` (In-Kraft-Datum) + `fassungsToken` + `sha` (§7 Build-Regel 4) — nachgeprüft an
  `bund/ADOV` Art. 1 (`stand: 2023-01-23`, `fassungsToken: 20230123`). Der Watchlist-Vergleich läuft
  darum gegen `fassungsToken`/`sha`, nicht gegen `geprueftAm`.
  **Gerichts-Hälfte — eigenes Verdikt, nicht unter dem Fedlex-🟢 mitgeführt (§8, Korrektur zum
  Erst-Intake):** die oben genannten Belege (`check:fedlex-versionen`, `check:rss-oc`,
  `fedlex-wiedervorlage-generieren.ts`, `currency.json`) sind **ausnahmslos Norm-seitig** — auch
  `check:rss-oc` prüft den Amtliche-Sammlung-RSS, nicht Gerichte. Der Bestand, der «Gericht X entscheidet
  neu» trägt, ist ein **anderer**: `public/rechtsprechung/register.json` (6341 Einträge, je Eintrag
  `gericht`/`gerichtstyp`/`kanton`/`datum`/`normKeys`/`fassungsToken`) plus die Import-Strecke
  `scripts/rechtsprechung/` (BS) und `scripts/normtext-entscheide.ts`. **Verdikt darauf: 🟡 baubar mit
  ehrlicher Einschränkung** — ein Build-Zeit-Delta über `register.json` (neue Einträge je Gericht/Norm
  seit Datum X) ist deterministisch und billig; es gibt aber **keinen Live-Gerichts-Feed**: das Signal
  feuert erst, wenn WIR neu importieren. Die Latenz ist damit die Import-Kadenz, nicht die Publikations-
  geschwindigkeit des Gerichts — **das wird in der UI offengelegt** («Stand des Entscheid-Bestands: …»),
  sonst suggeriert die Funktion eine Aktualität, die der Korpus nicht trägt.
  **🟠 Echtes Push-/E-Mail-Abo ist ein Architektur-BRUCH** — es verlangt Nutzeridentität,
  serverseitigen Subscription-State und einen Sendedienst und verletzt damit «Werkzeuge bleiben zustandslos»
  (CLAUDE.md §5): **kein Bau ohne ausdrücklichen Architektur-Entscheid Davids**, und **nicht** in den
  B1/B2-Bau mischen. Optionen-Vergleich (B1/B2/Push, mit Kosten und Bruchstellen):
  `bibliothek/recherche/watchlist-signale-architektur.md`. Currency-Fläche: `FAHRPLAN-FEDLEX-PORTFOLIO.md`;
  lose an `QS-CURRENCY`. **DoD:** Feed-Generator deterministisch (2 Läufe byte-gleich) · **keine
  Mandats-/Personendaten in localStorage** (§8, Berufsgeheimnis) · Rückblick-Flag nachweislich gegen
  `fassungsToken`/`sha` gebildet, **nicht** gegen `geprueftAm` (sonst Falschmeldungen) · Gerichts-Signal
  mit sichtbarem Bestands-Stand ausgeliefert (§8-Offenlegung der Import-Latenz) · Tore grün.
  Trailer `Roadmap: W2·14-SIGNAL`.
- [ ] **15-CLS · Echter CLS-Defekt auf `/gesetze` (0.109 @8× CPU)** *(§14-Intake 20.7.2026 · **Produktfehler**, reine UI)*
  <!-- @meta id: W2·15-CLS · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/pages/Gesetze.tsx, src/components/start] · worktree: ja · 26x: nein · fahrplan: FAHRPLAN-PERFORMANCE.md -->
  **Bewusst ein eigener Schritt und NICHT unter `QS-PERF` mitgeführt (§14.2):** `QS-PERF` ist die Arbeit am
  **Tor**; dies hier ist ein **Defekt im Produkt**, den Nutzer:innen sehen. Die beiden dürfen sich nicht
  gegenseitig verdecken — genau das ist am 20.7. passiert, als die Tor-Kalibrierung die ganze
  Aufmerksamkeit band.
  **Befund:** `/gesetze` misst **CLS 0.109 unter 8× CPU**; Ursache sind **zwei unreservierte Platzhalter**,
  die asynchron einwachsen. **Kein Tor deckt das ab:** der CLS-Deckel läuft auf `/gesetze/bund/OR` und der
  Startseite, nicht auf der Übersicht `/gesetze` — der Defekt ist an allen Budgets vorbeigelaufen.
  **Fix nach §15.2:** Platz **reservieren** (token-basierte Mindesthöhe am **prerenderten** Element),
  **nie** weniger Inhalt zeigen. **Zweiter, gleich wichtiger Teil: `/gesetze` in die Perf-Messung aufnehmen**,
  sonst fällt derselbe Defekt beim nächsten Mal wieder durch.
  **DoD:** CLS auf `/gesetze` unter dem geltenden Deckel, gemessen unter 8× **und** 4× · `/gesetze` als
  gemessene Route im Tor verdrahtet · golden byte-gleich · axe. Trailer `Roadmap: W2·15-CLS`.
- [ ] **16-INVENTAR · Funktions-Inventar (Vorstufe der Bedienungsanleitung)** *(§14-Intake 20.7.2026, David: «erst wenn es Sinn ergibt» → Zweischritt, dies ist Schritt 1)*
  <!-- @meta id: W2·16-INVENTAR · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/lib/startseiteConfig.ts, bibliothek/INDEX.md] · worktree: ja · 26x: nein · fahrplan: FAHRPLAN-UI-QUALITAET.md -->
  Vollständige, ehrliche Aufnahme dessen, **was Lexmetrik heute kann** — je Werkzeug/Fläche: Zweck,
  Eingaben, Grenzen, Status (§8 `verified`/`entwurf`/`geplant`), Fundort. **Der Nutzen liegt VOR der
  Anleitung:** das Inventar ist **Input für `QS-UI`** — man kann eine Oberfläche nicht konsistent machen,
  solange niemand die Funktionsmenge aufgeschrieben hat. Darum **früh** und **nicht** an die Anleitung
  gekettet. Quelle ist der bestehende **Funktions-Katalog** (unten in dieser Datei) + `src/lib/startseiteConfig.ts`
  (§5-SSoT); Heimat des Ergebnisses: `bibliothek/` nach §11.
  **DoD:** jede Karte aus `src/lib/startseiteConfig.ts` erfasst · Status-Marker gegen die Realität geprüft, nicht
  abgeschrieben (§8) · `check:bibliothek` grün · Eintrag in `bibliothek/INDEX.md`.
  Trailer `Roadmap: W2·16-INVENTAR`.
- [ ] **16-ANLEITUNG · Bedienungsanleitung / Onboarding** *(§14-Intake 20.7.2026, David — Schritt 2, **bewusst spät**)*
  <!-- @meta id: W2·16-ANLEITUNG · status: ready · of: ja · blocker: null · dep: [W2·16-INVENTAR] · kollision: [src/pages, src/components/layout] · seq-hart: [QS-UI(8a), W2·5h-GESETZ-UI(8b)] · worktree: ja · 26x: nein · fahrplan: FAHRPLAN-UI-QUALITAET.md -->
  Davids Vorgabe wörtlich: **«erst wenn es Sinn ergibt»** — eine Anleitung auf eine Oberfläche zu schreiben,
  die gleich danach umgebaut wird, ist doppelte Arbeit und veraltet sofort. Darum **nach `QS-UI` (8a) und
  nach `W2·5h-GESETZ-UI` (8b)**.
  **Sequenz maschinenlesbar, bewusst getrennt (§14.3 — dieselbe Konstruktion wie bei `W2·5h-GESETZ-UI`):**
  `dep` trägt nur **`W2·16-INVENTAR`** (echte Bau-Voraussetzung, endlicher Schritt). `QS-UI` ist ein
  **kontinuierlicher Querschnitt ohne Endzustand** — ein `dep` darauf wäre nie erfüllbar und machte diesen
  Schritt dauerhaft nicht startbar; massgeblich ist darum `seq-hart` auf die konkreten Teil-Schritte.
  **DoD:** deckt die Funktionsmenge aus `W2·16-INVENTAR` **vollständig** ab (keine stille Auslassung, §8) ·
  Sprache nach §13 Ziff. 3 (Fach **und** Laie) · axe · golden byte-gleich.
  Trailer `Roadmap: W2·16-ANLEITUNG`.

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
  <!-- @meta id: W3·12 · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: ja · fahrplan: FAHRPLAN-GESETZE-IMPORT-3TIER.md · slot: inhaber -->
  **SLOT-ÜBERGABE 20.7.2026: dieser Schritt hält jetzt den 26×-Slot.** E3 (`W2·6-DATA`) hatte ihn seit
  3.7.2026 belegt, war aber am selben Tag fertig — der Slot wurde 17 Tage lang nur nicht zurückgegeben und
  hat W3·12 grundlos geparkt gehalten. Übergabe folgt der `@slot-kette` und Davids Reihenfolge-Entscheid
  2.7.2026 («E3 zuerst, W3·12 danach»); Blocker `26x-slot` damit aufgelöst, Status `parked` → `ready`.
  **Achtung Umfang (§8, keine Schönung):** «ready» heisst hier *slot-frei und startbar*, nicht *klein*.
  Dies ist ein 26×-Massenimport; er steht bewusst weit unten in Welle 3 und läuft **nicht** an Davids
  laufender Queue vorbei. Vor dem Start gilt Leitprinzip 4 (nie zwei 26×-Assets parallel).
  §14-gebündelt (Phase 0): führende Detailquelle
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
- [ ] **15-RICHTER · Spruchkörper-Analytik** *(Ideen-Intake 20.7.2026 · **bewusst freigabe-pflichtig**)* —
  <!-- @meta id: W3·15-RICHTER · status: blocked · of: ja · blocker: richter-analytik-gate · dep: [] · kollision: [] · worktree: ja · 26x: nein -->
  Ziel = **ausschliesslich deskriptive** Spruchkörper-Muster auf Entscheid-Metadaten (z. B. Verteilung
  von **Sachgebieten und Formalien** je Kammer und Zeitraum). **Verfahrensausgänge sind bewusst NICHT
  im Scope** (Korrektur 20.7.2026): eine Ausgangs-Verteilung je Kammer ist genau das Rohmaterial, aus
  dem die unten verbotene Erfolgs-/Trefferquote entsteht — es fehlt nur ein Aggregationsschritt, und die
  Kammer→Personen-Zuordnung liefert das Richter-Filter-Fundament separat. Eine Ausweitung auf
  Verfahrensausgänge wäre eine **eigene, ausdrücklich zu begründende David-Entscheidung** und ist mit
  der blossen Freigabe dieses Schritts NICHT mitgegeben. **Harte Leitplanke, die
  den Bau bindet:** **kein** Erfolgs-/Trefferquoten-Ranking einzelner Richterinnen und Richter, **keine**
  Prognose («wie entscheidet X wohl»), **keine** Bewertung von Personen — nur ehrliche, quellengestützte
  Deskription mit ausgewiesener Grundgesamtheit und offengelegten Grenzen (§8). Richterliche Unabhängigkeit,
  Persönlichkeitsschutz und Standesrecht gehen der Auswertbarkeit vor; im Zweifel wird weggelassen.
  **Baut auf** dem separat laufenden **Richter-Filter-Fundament** (Branch `feat/richter-fundament`,
  Auftrag David 20.7.2026) — dessen Intake wird hier **nicht dupliziert** (§14.3), diese Einheit ist
  allein die *darauf aufsetzende Analytik-Schicht*. **Feasibility: 🔴 technisch nachgelagert machbar,
  aber gesperrt** — Bau erst nach ausdrücklicher Freigabe Davids (`richter-analytik-gate`). Detailquelle
  vorerst `bibliothek/recherche/richter-analytik-leitplanken.md` (Leitplanken + deskriptiver Scope);
  eine `FAHRPLAN-RICHTER-ANALYTIK.md` entsteht **erst nach** der Freigabe. **DoD:** Freigabe dokumentiert ·
  adversariale Prüfung «kein verstecktes Ranking» bestanden · §8-Offenlegung der Aussagegrenzen.
  Trailer `Roadmap: W3·15-RICHTER`.

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
