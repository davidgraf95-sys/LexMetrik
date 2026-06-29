# LexMetrik — Handlungsplan (DER eine Steuerungsplan)

> **Stand 28.6.2026.** Die **einzige Steuerungsquelle**: sie entscheidet **Reihenfolge** +
> **bau-jetzt vs. geparkt** und ist so geordnet, dass eine **künftige Session sie autonom
> Schritt für Schritt abarbeiten** kann. Sie faltet das frühere `HANDLUNGSPLAN.md` ein
> (→ `archiv/`). Das *Wie* je Strang steht in der jeweiligen `FAHRPLAN-*.md` (Detailquelle),
> der **Ist-Zustand/Deploy** in `STRUKTUR.md`, die G1-Praxis-Abdeckung in `KATALOG-ROADMAP.md`.

---

## ▶ Ausführungs-Protokoll (für jede künftige Bau-Session)

1. **Nimm den obersten offenen Schritt** der «Geordneten Abarbeitung», dessen Abhängigkeiten
   erfüllt sind (`[OF]` zuerst; `[D]`/blockierte überspringen).
2. **Halte die Leitprinzipien** (Zeitsperre/`[OF]` · amtliche Quellen · nie zwei 26×-Assets
   parallel · Worktree-Isolation · golden-gegated · Deploy nur auf Davids Ja).
3. **Bau in eigenem Worktree**, wenn der Schritt eine Kollisionsdatei berührt (§12).
4. **Gate vor Abschluss:** `npm run gate` grün; verhaltensändernd ⇒ Golden byte-gleich.
5. **Markiere erledigt** (Häkchen + Datum hier), zieh die Session-Karte in `STRUKTUR.md` nach,
   → nächster Schritt. **Push/Deploy nicht selbst** — sammeln fürs Batch-Deploy-Fenster.

---

## So sieht das Taschenmesser aus (Produktvision)

**LexMetrik ist der Anlaufpunkt für alle Arten von Juristen** — Kanzlei, Gericht, Inhouse,
Studierende — um **das Schweizer Recht zu konsultieren und damit zu arbeiten.** Ein vielseitiges
Werkzeug, zu dem man zuerst greift; **alles auf amtlichen Quellen** (Fedlex, amtliche
Entscheid-Sammlungen, amtliche Tarife/Materialien — Art. 5 URG, urheberrechtlich frei),
**deterministisch gerechnet statt KI-geschätzt.**

Die «Klingen» (= die Informationsarchitektur):

- **Konsultieren.** Gesetze (Volltext + amtliche Systematik, **mehrsprachig DE/FR/IT zum
  Vergleich**) · Rechtsprechung (BGE/BGer-Korpus, amtliche Regesten) · amtliche Materialien
  (Botschaften/BBl) · **Gesetzgebung/Rechtsetzung** (was kommt: Vernehmlassung/Parlament/AS-BBl).
- **Rechnen.** Die deterministischen Klingen: Fristen · Streitwert · Prozesskosten · Verzug/
  Forderung · Zuständigkeit/Rechtsweg · Verjährung · Beurkundung · Gründungen — jeder Wert mit
  Norm + Link + Stand.
- **Verzahnen (der Burggraben).** **Norm → Werkzeug → Schriftsatz** und zurück: vom Artikel in
  den passenden Rechner/Entscheid, vom Rechen-Ergebnis in den kopierfertigen Begründungs-Absatz.
- **Finden (der Griff).** Eine Auffindbarkeits-Schicht: zweiachsiger Einstieg (Rechtsgebiet ×
  Aufgabe) + globale Suche → die richtige Klinge in einem Klick.

Universell, nicht in Personas-Schubladen: dieselben Klingen dienen allen; einzig die Verpackung
(Einstiege, Erklär-/Übungs-Layer) variiert. **Geparkt:** Dossier-/Mandatsverwaltung — alle
Werkzeuge bleiben **strikt zustandslos** (rechnen/drucken/ICS, keine Persistenz von Falldaten).

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
4. **Nie zwei 26×-Datenassets gleichzeitig offen** — eine Säule fertig führen. Die fünf 26×-Assets:
   Prozesskosten-Cockpit · Notariat-Grundbuch · Beurkundungs-Ausbau · Gesetze-Import-3Tier ·
   Kantonale-Entscheide. *Ein P0-Bugfix an einem Asset ist kein Daten-Bulklauf und **öffnet den
   26×-Slot nicht**.*
5. **Worktree-Isolation (§12)** bei Datei-Kollision: FUNDAMENT-UMBAU ⟂ VORLAGEN-AUSBAU ⟂
   VERTRAGS-VARIANTEN ⟂ Startseiten-Rahmen (`App.tsx`/`startseiteConfig.ts`/`vorlagenRegistry`);
   SEO-A11Y (`register.json`/`seo.ts`/`prerender.ts`/`vercel.json`).
6. **Push/Deploy nur auf Davids frisches Ja (§9);** jeder verhaltensändernde Schritt golden-gegated
   (§6). **§1 (Logik vor allem) / §5 (eine Quelle)** sind Invarianten über allen Wellen.
   **Zustandslosigkeit** (kein Dossier-Creep) ist Querschnittsregel.

**Verifikations-Blockaden (einmal definiert, danach nur referenziert):**
- **§4 — Lizenz/CORS für Live-Rechtsprechung** (CC-BY-SA vs. Art. 5 URG, CORS/Rate-Limits
  unbestätigt) → Rechts-/Lizenzbeurteilung = **`[D]`**. Solange offen: ENTSCHEIDSUCHE-P1 &
  KANTONALE-P1-Adapter **geparkt**. Nicht-§4-blockierte Korpus-/Übersichtsarbeit ist ausgenommen.
- **Prozesskosten I2** ⟵ Recherche `wbqdyap3x` (Schlichtungs-/Reduktionsfaktoren).

---

## Querschnitt-Band (läuft begleitend — kein Reihenfolge-Slot)

- **Status-Marker-Audit + Verifikations-Infrastruktur** *(LERNPHASE A/B, `[OF]`)*. Jede Karte/Engine
  trägt sichtbaren ehrlichen Status (`verified`/`entwurf`/`geplant`) + Stand; Golden-Abdeckung &
  Norm-Anker-Prüfung automatisieren. **Stärkste zeitsperre-konforme Arbeit** — macht die
  Dez-Abnahme billig; dauerhaft begleitend.
- **Adversariale Gegenprüfung — systematisiert** *(QS-GP, LERNPHASE B, `[OF]`)*, neu 29.6.2026 —
  erweitert die Verifikations-Infrastruktur. Der adversariale Zweitdurchgang (unabhängiger
  Opus-Agent, frischer Kontext, Auftrag: Output gegen die amtliche Quelle **widerlegen**) fing real
  die teuersten Bugs (Tabellen-Drop, Footnote-Leak, `bis`/`ter`-Verlust), hängt aber bisher an
  Session-Disziplin statt an einem Tor. Bausteine:
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
  `.claude/hooks/struktur-aktuell.py`: meldet **rot**, sobald eine neu hinzugefügte `FAHRPLAN-*.md`
  **nicht aus `ROADMAP.md` verlinkt** ist — setzt die Plan-Hygiene-Regel durch (jede `FAHRPLAN-*.md`
  muss aus der ROADMAP referenziert sein, sonst steuert sie unsichtbar; CLAUDE.md §14 Ziff. 1).
- **SEO/A11y** *(SEO-A11Y-GOVERNANCE)*. A11y zahlt auf Bedienbarkeit ein → begleitendes Tor
  (Tabellen-Semantik, Tastatur-e2e, hreflang). Reines SEO geparkt. **Bedingung der Gleichzeitigkeit:
  eigener Worktree.**

---

## ⚡ S0 — fristgetrieben (FRIST 30.6.2026) — ✅ gebaut + gegated 28.6.2026 (Live offen, Batch-Fenster)

**Verfallsregister mechanisch.** `check:verfall` muss den am 30.6. ablaufenden SG-GKV-Tarif +
die weiteren datierten Verfälle (s. «Pflege & Termine») erfassen und auf einer benannten UI-Fläche
sichtbar machen. `[OF]`. «Sichtbar» = verhaltensändernd → golden-gegated; bis 30.6. realistisch
**gebaut + gegated**, Live erst im Batch-Deploy-Fenster.

> **Erledigt 28.6.2026 (gebaut + gegated, nicht deployt):** Parse-Grammatik in eine geteilte
> Quelle gezogen (`scripts/verfall-parse.ts`, §5) — `check:verfall` (Tor) und neuer Generator
> `gen:verfall` teilen sie. Generator schreibt `src/data/verfallTermine.generated.ts` aus dem
> Register; Drift-Tor `check:verfall-ui` in der `check`-Kette. Benannte UI-Fläche: Abschnitt
> **«Aktualität & Pflege der Parameter»** auf `/methodik` (`src/components/VerfallUebersicht.tsx`)
> listet die 15 datierten Parameter mit nächstem Prüftermin; Tagesbezug (verfallen / bald fällig /
> aktuell) client-seitig (prerender-/hydration-sicher). SG-GKV 30.6. erscheint als «bald fällig»,
> ab 1.7. «verfallen». `npm run gate` grün, Golden byte-gleich. Kein Push/Deploy (Batch-Fenster).

---

## Die geordnete Abarbeitung (DAS ist der Plan)

> Reihenfolge nach Praxis-Hebel × Machbarkeit ohne Fachzeit × Abhängigkeiten. Alles `[OF]`, sofern
> nicht vermerkt. Details + Bau-Auflagen je Werkzeug: «Funktions-Katalog» unten + jeweilige `FAHRPLAN-*.md`.

> **■ Fortschritt 28.6.2026 (eine grosse Session, 3 Prod-Deploys):**
> - **S0** Verfallsregister-UI ✅ **LIVE**
> - **Welle 1 · 1** Begründungs-Absatz (alle [OF]-Teile, Phasen 0–5; PDF-Block AUS = Davids Entscheid) ✅ **LIVE**
> - **Welle 1 · 2** Norm↔Werkzeug-Brücke (Index gehärtet + Erlass-Karten-Hinweis) ✅ **LIVE**
> - **Welle 1 · 3** Alltags-Cockpits: #2 Streitwert-Grenzwert ✅ **LIVE**; #3/#4 bestanden bereits; #1 Fristen-Cockpit zurückgestellt (S-5c)
> - **Welle 1 · 4** Prozesskosten-Moat: zu ~90 % FERTIG; offen nur **I2** (Recherche `wbqdyap3x` blockiert) + **I4** (per-Kanton, mit I2)
> - **Welle 2 · 5** Auffindbarkeit: zweiachsiger Einstieg ✅ **LIVE** · globale Artikel-Volltextsuche (FlexSearch, 24'183 Bund-Artikel) ✅ **LIVE**; offen: Kanton in den Index + FUNDAMENT-UMBAU-Rahmen
> - **Deploys:** `b7273ae0` (S0+Welle1·1+W2-Index) · `88895088` (Streitwert+Einstieg) · `aebd72fb` (Volltextsuche, inkl. HOCH-Bug-Fix tote Links).
> - **Nächster offener [OF]-Block:** Welle 2 · 6 (Konsultieren) — Mehrsprach DE/FR/IT braucht aber einen Fedlex-Netz-Generator (nicht autonom); kleinere autonome Reste: Kanton-Artikel in den Suchindex, Rechtsprechung-P0 (SG-Regeste, §4-sensibel).

### Welle 1 — Kern: Norm → Werkzeug → Schriftsatz + die Alltags-Klingen

- [ ] **1 · Begründungs-Absatz** *(BEGRUENDUNGS-ABSATZ, ~5 %)*. Aus dem Rechen-Ergebnis ein
  **kopierfertiger, normgestützter Absatz** (UI **und** PDF), jeder Wert mit Norm+Link+Stand
  (schliesst die Rückrichtung *Werkzeug→Norm*). **Erst EIN Flaggschiff-Vertikalschnitt komplett**
  (Prozesskosten): Ergebnis → Absatz → PDF-Block → Kopier-Hook; dann Rollout.
  *Nächster Schritt:* PDF-Block (`pdfModel.ts`) + Kopier-Hook am Prozesskosten-Rechner; die 4
  David-Entscheide als **Default-und-Flag** setzen. §8-Rahmung «keine Rechtsberatung».
- [x] **2 · Norm↔Werkzeug-Brücke** *(RECHTSSAMMLUNG P4/D1)* — **Index-Teil erledigt 28.6.2026
  (gegated, nicht deployt).** `werkzeugeFuerNorm` (erlass-granular, 17 Erlasse) benannt + Map
  `ERLASS_WERKZEUGE` exportiert + Konsistenz-Tor `werkzeuge.test.ts` (kein stiller Tippfehler →
  heimlich fehlendes Werkzeug, §8). Anzeige im Reader (KontextPanel «Passende Werkzeuge») bestand
  schon; **neu** dezenter «N passende Werkzeuge»-Hinweis auf der Erlass-Karte (`/gesetze`, Task
  4.3). SSoT = Katalog (§5). **Der zweiachsige Startseiten-Einstieg (Rechtsgebiet × Aufgabe) ist
  Schritt 5** (Welle 2) und nutzt denselben Index — kein zweiter Pfad.
- [x] **3 · Alltags-Rechner als Cockpits** *(neu-Verpackung vorhandener Engines, `[OF]`)* —
  **abgearbeitet 28.6.2026:** #2 neu gebaut (Grenzwert-Abgleich); #3 + #4 bestanden bereits
  (kein §5-Duplikat gebaut); #1 zurückgestellt (S-5c-Konflikt, Davids Entscheid offen):
  - **Fristen-Cockpit** (Vorwärts/Rückwärts/Stillstand) über `fristenspiegel/` + `icsExport`.
    ⚠️ **Zurückgestellt:** kollidiert mit S-5c (10.6.: eigenständiger Fristenspiegel bewusst
    aufgelöst, Ereignisse in Fach-Rechnern). David möchte den eigenständigen Einstieg NICHT
    wieder einführen → nicht gebaut.
  - **Streitwert + Grenzwert-Abgleich** ✅ 28.6.2026 (gegated, nicht deployt): `streitwertGrenzwerte()`
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
- [ ] **4 · Prozesskosten-Cockpit Restbau** *(PROZESSKOSTEN-COCKPIT, Hauptmoat, 26×)*. Risiko-Modus
  fertigstellen; Festsetzung/Dispositiv → Welle 2.
  *Nächster Schritt:* I4 `kriterien`-Feld + I9-Rest **[OF]**; **I2 ⟵ Recherche `wbqdyap3x`**
  (Blockade). **Park-Entscheid:** bewusst bei «I4/I9 fertig, I2 blockiert» parken = **26×-Slot
  freigeben** (Voraussetzung für Welle 3 · Schritt 11).

### Welle 2 — Griff (Auffindbarkeit) + Konsultieren + mehr Klingen

- [~] **5 · Auffindbarkeits-Schicht** *(ein Index → mehrere Oberflächen)*. **Zweiachsiger Einstieg
  (Rechtsgebiet × Aufgabe)** ✅ **28.6.2026 (gegated, nicht deployt):** `einstiegMatrix()`
  (`src/lib/einstieg.ts`) projiziert den Katalog (§5) auf Rechtsgebiet × Aufgabe; Komponente
  `ZweiachsigerEinstieg` als zweite Achse auf `/rechner` (aufklappbare Gebiets-Kacheln, Werkzeuge
  nach Aufgabe gruppiert, nur verfügbar §8). Konsistenz-Tor `einstieg.test.ts`. Visuell bestätigt.
  **Globale Artikel-Volltextsuche** ✅ **28.6.2026 (David: «FlexSearch ja»; gegated, nicht deployt):**
  FlexSearch über alle **24 183 Bund-Artikel** (`bloecke`-Text), in DIE bestehende Suche integriert
  (neue Gruppe «Gesetzestext», `universalSuche`/`useUniversalSuche`, §5 ein Such-Workstream). Index
  build-time generiert (`gen:suchindex` → `public/such-index/`, gitignored, im `build`), lazy + eigener
  Chunk (FlexSearch 17 kB gz, NICHT im Haupt-Bundle — Task 4.4); Lib+Index ~4 MB gz erst auf erste
  Suche. Zitat-/Term-Suche stark («243 ZPO» → Art. 243 ZPO; Notwehr→Art. 16 StGB), Deklinations-
  Phrasen unscharf (§8-ehrlich). Snippet + Sprung `#art-`. Visuell bestätigt.
  **Offen:** Kanton-Volltext im Index nachziehen · **Startseiten-Modul-Rahmen** (FUNDAMENT-UMBAU
  Phase 0, eigener Worktree, Visualdiff-Tor).
- [ ] **5b · Reader-Darstellung Bund** *(GESETZESDARSTELLUNG-BUND, `[OF]`, eigener Worktree)* —
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
- [ ] **6 · Konsultieren-Klingen** *(`[OF]`, amtlich)*:
  - **Mehrsprachiger Normvergleich DE/FR/IT** (Auslegungswerkzeug, Art. 14 PublG — alle drei
    Fassungen gleich verbindlich). Heute nur `de` befüllt. *Aufbau:* Generator je Erlass 3
    Sprachfassungen aus Fedlex → `…<lang>.json`; Synopse-UI im Gesetzleser (Spalten + Diff).
  - **Recherche Norm → amtlicher Entscheid** (`norm-index.ts`, deterministisch, kein LLM-Ranking;
    Regeste nur amtlich oder eigene maschinelle, «maschinell»-Marker behalten).
  - **Gerichts-/Behörden-Adressregister** (Lese-/Index-Schicht über bestehende Stores, kein
    Duplikat; Abnahme-Status + Verfallsregister je Eintrag).
  - **Rechtsprechungs-Übersicht** *(KANTONALE/ENTSCHEIDSUCHE/RECHTSPRECHUNG)*: **P0-Fix** SG-Regeste
    + kant. Norm-Resolver (Bugfix, **öffnet keinen 26×-Slot**); **Korpus-/Übersichts-Breite [OF]**
    (Facetten/Sprachfilter-Vorbereitung). Live-Adapter §4-blockiert → geparkt.
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
- [ ] **7 · Verzahnungs-Klingen** *(`[OF]`, amtlich)*: **Verjährungs-/Gewährleistungs-Board**
  (`verjaehrung.ts`-Matrix; CISG nur Link); **Verzugszins-/Forderungs-/Inkasso-Strecke**
  (`verzugszins.ts`, Reverse-Reader strukturiert, stateless); **Gerichts-Baustein-Set** (amtlicher
  Zitierer BGE/BGer + Rubrum-Vorlage Art. 112 BGG/238 ZPO; reiner User-Input-Builder).
- [ ] **8 · Schriften-Baukasten** *(VORLAGEN, Worktree)* — Berufung/BGG-Beschwerde/Sistierung/
  Beweisverzeichnis über `vorlagen/engine.ts`; Zulässigkeit nur Hinweis, Status «entwurf».
- [ ] **9 · Aufräum-Item** *(UX-PUNKTELISTE ⚫ überholt)*. Deliverable = Mapping-Tabelle
  **alt-Punkt → Code-Pfad → Status**, *bevor* Restpunkte C2/C5 angefasst werden.

### Welle 3 — Tiefe / Breite (opportunistisch)

- [ ] **10 · Neue Rechner-Klingen** *(`[OF]`, §2/§7)*: **Zustellfiktions-Engine** (deterministisch,
  fristrelevant) · **Gesellschaftsrechtliche Schwellen-Module** (OR 727/671/653s, harte Zahlen) ·
  **Schutzrechts-Gebühren IGE** · **Normfassungs-/Geltungsstand-Prüfer** (intertemporal).
- [ ] **11 · Gesetzgebungs-/Rechtsetzungs-Tracking** *(neu, amtlich)*. Übersicht «was kommt»:
  Vernehmlassungen (admin.ch), Parlamentsgeschäfte (parlament.ch), in AS/BBl publiziert aber noch
  nicht in Kraft (Fedlex), künftige Fassungen — Drift gegen die geltende Fassung. Andockpunkt
  `fedlex.ts`/Drift-System.
- [ ] **12 · Kantonaler Breitenimport** *(GESETZE-IMPORT-3TIER Phase 2, 26×)*. **Erst öffnen, wenn
  der Prozesskosten-26×-Slot frei ist** (Schritt 4). BS-Pilot; Kantonale-Entscheide-Import hart
  **nachgelagert**, nie gleichzeitig.
- [ ] **13 · Vorlagen-Breite** *(VORLAGEN V5/V6/V8, GMBH G2, VERTRAGS-VARIANTEN P3; Worktree)*.
  Tiefe vor Stückzahl. GmbH qualifizierte Gründung (777c II) · Musterklagen (Bauhandwerkerpfand) ·
  Basistypen (Kauf/Fahrniskauf Art. 184 ff. dispositiv, Schenkung/Pacht/Darlehen/Bürgschaft).
- [ ] **14 · Multi-Pane / Split-View** *(SPLIT-VIEW, Fundament-Umbau, eigener Worktree; Auftrag
  David 29.6.2026)*. 2–3 „Engines" nebeneinander **wie im Browser** → der **Verzahnungs-Burggraben
  sichtbar** (Gesetz | Rechner | Begründungs-Absatz). **Erst Strang A** (Inhaltsbreite-Umschalter
  kompakt/breit, klein, `[OF]`), **dann Strang B** (Split-View: `RouteSwitch`-Extraktion →
  Container-Query-Fundament → Pane-Container in `Shell` → Steuerung → Scroll/A11y pro Pane →
  Mobil-Faltung; Layout-Modus **B3** Primär-URL + teilbar; bis **3 Panes** responsiv). Strikt
  zustandslos (Panes speichern nur Pfade, §5/§8); Lesespalte `max-w-reading` bleibt schmal (§13.2).
  **Kernaufwand = CSS Container-Queries** (450 Viewport-Breakpoints brechen in schmalen Panes;
  gestuft CQ-1). Detail + Architektur-Befund: `FAHRPLAN-SPLIT-VIEW.md`. §12-Kollisionsdateien
  `Shell.tsx`/`Topbar.tsx`/`App.tsx`/`tailwind.config.js` → nie parallel.
  - [ ] **Gebündelt (Auftrag David 29.6.2026): Bildschirm-/Responsive-Audit** *(SPLIT-VIEW, `[OF]`)* — **ein** `ultracode`-Workflow fotografiert **Seiten × Breakpoints** (Handy hoch ~390 · Tablet ~768 · Laptop ~1280 · Desktop ~1536 · Ultrawide ~2560) und flaggt Layout/Umbruch/**Tabellen-Overflow** (maschinell je `<table>`/Pane über `scrollWidth>clientWidth`, deterministisch §2). **Werkzeug zuerst prüfen (§5/§10): auf dem bestehenden Playwright-bash-Harness `scripts/screenshots.ts` aufsetzen** — Playwright-Start, Motiv→Route, Arg-Parsing und ehrliches FEHLT-Logging (§8) sind dort schon da; nur die Breitenliste (heute 360/768/1280) auf die fünf erweitern und die Seitenmenge ergänzen, **nicht** neu erfinden. **NICHT** der Playwright-MCP (Bash-Lektion 22.6.); Playwright ist bereits Dependency. **Aufruf** (kontextlos lauffähig): `npm run preview -- --port 4321 --strictPort`, dann `npx vite-node scripts/screenshots.ts -- --base-url http://localhost:4321 --out abnahme/responsive-audit/ist-<sha7>` — neuer Ausgabe-Pfad ⇒ eine `.gitignore`-Zeile `abnahme/responsive-audit/` ergänzen, Binär-PNGs nie committen (§6). **Rein lesend:** berührt selbst keine §12-Kollisionsdatei und kein Golden-/Logik-Tor (§6), Status-Modell unberührt (§8), kein Deploy ohne Davids Ja (§9); Befund = Screenshot-Mappe + Defektliste, **rein visuell verifizierbar, keine Davids-Fachzeit**. **Kein eigener Strang — gehört in Schritt 14** (dasselbe Breakpoint-/Container-Query-Subsystem), denn die aus dem Audit folgenden Fixes treffen **dieselben §12-Kollisionsdateien wie Schritt 14** → **im selben Worktree wie Strang B, nie als paralleler Strang** (kein 26×-Bezug).
  - [ ] **Split-View a11y-Restpunkte** *(SPLIT-VIEW, `[OF]`, NIEDRIG — aus §9-Bug-Check 29.6.2026)* —
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
Rechner-Lernpfad** (Schritt 2/6). Einbau jeweils im Mutter-Schritt, nicht als eigener Strang.

---

## 🚀 Batch-Deploy-Fenster (eigenes Item)

Vor **einem** Deploy-Ja stauen sich: Beurkundungs-Ausbau (Deploy-Status offen), Vertrags-Varianten
(ungepusht), S0, Welle-1-Ergebnisse. → Ein benanntes Fenster, alles golden-gegated, Push/Deploy
**nur auf Davids frisches Ja** (§9), aus sauberem HEAD-Worktree (§12).

---

## Geparkt (bis ≥1.12.2026 / Nutzerfeedback / Markt)

- **Dossier / Fall-Rückgrat** *(FALL-RUECKGRAT, G3.3, PRODUKTAUSBAU Säule A)* — Mandats-/Dossier­
  verwaltung & «Meine Fristen». Vorerst draussen; alle Werkzeuge bleiben stateless.
- **Markt-Themen** — Hosting (Infomaniak), Domain `lexmetrik.ch`, Zahlung (Payrexx/Datatrans/TWINT),
  Login/Pro.
- **Live-Rechtsprechung** — §4-blockiert (s. Verifikations-Blockaden).
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
  PDF-only-Kantone/Token-Lücken · LUECKEN L7 Konfidenz-UI/L8 · NOTARIAT NG-4 Zweitpass · TARIF Klasse C
  SG-Füllpunkte/ZH-PDF-Residuen.
- **Infrastruktur-Fundament:** GESETZESTEXT-POPUP (Snapshot/Drift) trägt RECHTSSAMMLUNG/Rechtsprechungs-
  Verzahnung/GESETZE-IMPORT → vor aufsetzenden Strängen mitdenken.
- **Archiv-Kandidaten** (Code-Stand prüfen): BGE-DARSTELLUNG-EINHEITLICH · INTERNATIONAL-VOLLTEXT-Rest.
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
