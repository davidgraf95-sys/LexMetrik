# FAHRPLAN — Offene Befunde ohne eigenen Strang-Fahrplan

**Zweck.** Fünf Dach-Schritte der ROADMAP hatten bis zum Plan-Neuschnitt vom 29.8.2026 keinen
eigenen Fahrplan und trugen ihre Befundlisten deshalb IM Plan — teils als einzelne Zeilen von
mehreren Kilobyte. Diese Datei ist ihre Detailquelle: die Listen stehen hier **wörtlich** so, wie
sie in ROADMAP.md standen, mit ihren Belegen und Daten. In der ROADMAP steht seither je Schritt nur
noch Ziel, Grenze und ein Zeiger hierher.

**Belege altern nicht.** Datierte Mess- und Reproduktionsangaben in dieser Datei werden nie an einen
neuen Ist-Stand «nachgeführt», nur ergänzt. Wer eine Position abarbeitet, hakt sie in ROADMAP.md ab
und trägt das Ergebnis in ROADMAP-CHRONIK.md nach.

---

## §1 — `QS-KORPUS` · Korpus-Pflege: fehlende und fehlerhafte amtliche Substanz

Dach-Schritt (Fusion 15.8.2026) für die offenen Reparaturen an Normtext- und
Rechtsprechungs-Korpus. **Jede Zeile liegt auf dem Risikopfad** (Extraktion/Korpus,
`istRisikoPfad()`) ⇒ **Gegenprüfung Pflicht**, amtlicher Beleg mit Norm + Link + Stand (§7),
Korrektur nie in der Projektion, immer in der Pipeline-Quelle (§5); je Zeile eine sortenreine
Bau-Einheit.

Wörtlich aus ROADMAP.md (Stand 29.8.2026):

  · [ ] **`adapter-lexwork.ts:778` Fetch-Ergebnis unvalidiert** — `Response.json()` liefert unter `lib: DOM` `any`; Shape vor Verwendung prüfen (Nebenfund QS-TYP-LUECKE 15.8., Gegenprüfungs-Auflage A1; Risikopfad Extraktion ⇒ QS-GP)
  · [ ] **Geltende BMV in den Korpus aufnehmen** — die seit 1.3.2026 geltende Nachfolge-Verordnung (Totalrevision `cc/2025/408`, gleiche SR 412.103.1) fehlt; Nutzer finden nur den historischen Text. **Risikopfad** ⇒ Gegenprüfung. (fusioniert 15.8., vormals `QS-KORPUS-BMV`; Fahrplan: [FAHRPLAN-FEDLEX-PORTFOLIO.md](fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md) §20.4)
  · [ ] **scope/decl-Sektionen von 12 Staatsverträgen ingestieren** — 23 amtliche Sektionen liegen ausserhalb des `div#annex`-Containers und fehlen im Snapshot. **Risikopfad** ⇒ Gegenprüfung; golden-Diff erwartet (neue amtliche Substanz). (fusioniert 15.8., vormals `QS-KORPUS-SCOPE`; Fahrplan: [FAHRPLAN-FEDLEX-PORTFOLIO.md](fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md) §19)
  · [ ] **Entscheid-Datumsfehler im Rechtsprechungs-Register bereinigen** — `bge_151_II_475` trägt 1999 statt 2025; Datum gegen bger.ch verifizieren, in der Pipeline-Quelle korrigieren (nie im Projektions-JSON, §5), Register-Sweep nach weiteren Band/Jahr-Diskrepanzen, Projektion neu erzeugen. **Risikopfad** ⇒ Gegenprüfung. (fusioniert 15.8., vormals `QS-KORPUS-RSPR-DATUM`; Fahrplan: [FAHRPLAN-RECHTSPRECHUNG.md](fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md))

---

**Nebenfunde Nacht 5.9.2026 (Gegenprüfungen #679/#691/#694/#695):**
- [ ] **§17 /tmp-HTML-Cache invalidiert nicht bei Re-Pin** — `struktur-run.ts:61` refetcht nur bei Abwesenheit, `normtext-snapshot.ts:387` nur bei <20 KB; Generator stempelt neuen `fassungsToken` auf alten Text (Beleg DBG #695). Wurzel: Cache-Schlüssel um fassungsToken/html-N. Dazu (§6.7): `check-struktur-konsistenz.ts` vergleicht nur Artikel-Keys, nicht `stand`/`fassungsToken`.
- [ ] **`normtext:struktur` ohne Erlass-Filter** — je Lauf 227 `erzeugt`-Felder (Churn); `--nur=<key>` analog `--nur=bund`.
- [ ] **Offline-Refresh löscht bei fehlendem Shard stumm** (#691) — `entscheide-schreiben.ts:577` `continue` + `:239` `rmSync`, Guard nur `basis.length>0`; Bestandszahl-Sperre vor `schreibeKorpus`, Mindestzahl in `check:entscheide`. Analog `snapshotDateiPfad()` relativ ⇒ Datei-Sonde fail-open bei falschem cwd (#694).
- [ ] **GL-Schlüssel auf amtliche `canonical_link`-Form (`III-B.7.1`)** (#694) — 2 Erlasse `%`-Kanonik, 2 Punkt-Form; entscheiden, sonst zweite 301-Kette. Gleiche Dubletten-Klasse: FR-261.16↔FR-8428, JU-…-34172↔…-dl (PDF-Zweitweg).
- [ ] **Kanton-Fremd-Drift 19 Struktur-Sidecars** (#694) — BS Bürgerrechtsgesetz Stand 1.7.2026, AR/BS-PDF-Versionen; Drift-PR. `confidence.json` seit 23.6. stale (150/1565).
- [ ] **Fedlex-Trenner `a. ` vs `A: ` mitführen** (#679) — `extrahiere-fedlex.ts` verwirft ihn; ~90 Marken mit Sonderzeichen-Anfang falsch beschriftet. Extraktion + Neuerzeugung, Gegenprüfung.
- [ ] **`standRechtsprechung` = Erzeugungs- statt Abrufdatum** (#691, latent, nirgends gerendert) — Stand aus max(abgerufen) (§8).

## §2 — `QS-MONITOR-ROT` · Normen-Monitor seit ≥5 Wochen rot

Wörtlich aus ROADMAP.md (Stand 29.8.2026) — Aktivierungs-Audit 14.8.2026 und die daraus
abgeleitete Checkliste, samt den sieben Materialien-System-Befunden (a)–(h):

- [ ] **`QS-MONITOR-ROT` · Normen-Monitor seit ≥5 Wochen rot — Wurzel-Fix** — Aktivierungs-Audit 14.8.2026: `normen-monitor.yml` 5/5 Läufe failure (seit 6.7., Issue #166 offen, 8 rote Läufe in Folge); scheiternde Schritte `check:netz` und LIK-Reihe (BFS O-1.6). Rechtsstand-relevant. DIAGNOSE 14.8. (Session-Befund, Issue #166 beantwortet): Monitor korrekt, Rot ist ECHT — Checkliste: · [ ] LIK-Reihe 2026-05→2026-07 nachziehen (scripts/lik-reihe-generieren.py; amtliche Werte ⇒ Gegenprüfung trotz formal fehlendem Risikopfad-Flag) · [x] 14 nicht-kanonische Fedlex-Pins repariert (#497, 2 Gegenprüfungs-Runden 14/14 SPARQL-rederiviert; PR von 574 auf 10 Dateien entbläht — Automaten-Churn inkl. 115 Kanton-Dateien ist Befund (a2)) · [x] Frische-Automat: gen:historie/check:historie in Kaskade+Prüfliste nachgerüstet (Nullprobe-belegt) · [ ] 10 ESTV-MWST-Snapshot-Drifts aktualisieren (Risikopfad Materialien) · [ ] AIG-Botschaft BOTSCHAFT-2025-3067 nachführen (botschaften-netz rot, Klasse d — materialien:botschaften-Generator; Risikopfad) · [ ] VRV-Vernehmlassung VERN-2026-79 bereinigen (vernehmlassungen-netz rot, Klasse d — Verfahren live nicht mehr gelistet; Risikopfad) · [x] Rest-Sondierung 14.8.: 8 weitere Netz-Tore einzeln GRÜN (caches/zitate/rss-oc/normtext/pdf/pdf-quellen/revisionen/abk) — nur materialien-netz + fedlex-versionen noch offen · [ ] Materialien-System-Befunde 14.8. (aus Korpus-Nachzug, je §17-Wurzel-Fix nötig): (a) `npm run materialien` löscht in DB-losen Worktrees still 11 kanten-Artefakte — Orphan-Bereinigung bei fehlender DB überspringen; (b) Generator-Abgänge ohne Grabstein/Logzeile — Zu-/Abgänge ausgeben, Abgänge bestätigungspflichtig; (c) VERN-Schlüssel erbt mutable Fedlex-Projektnummer (79→78-Umnummerierung belegt) — intrinsische Identität wie bei fga-URIs; (d) botschaften-netz-Stichprobe = 8 feste Keys, blind für Register-Zuwachs (9 neue Erlasse monatelang ungeprüft) — Vollabgleich Grundmenge↔Roh-Dateien; (e) VERN-shas rauschen (stand=Abfragedatum im Hash); (f) Botschaften-Roh ohne ORDER BY — deterministisch sortieren; (h) Fussnoten-Link-Extraktor erzeugt «Link .»-Leerzeichen bei Satzend-Links (TGBV Fn 20/32 belegt, Muster main-weit) — Fix im Extraktor, nie in den Daten; (a2) Frische-Automat fasst bei Bund-Läufen 115 Kanton-Dateien mit Datums-Churn an (Verletzung der eigenen Reset-Invariante cache.sh:31); (g) Generator-Kaskade als EIN Kommando (materialien ⇒ normtext:revisionen ⇒ gen:zaehler — am 14.8. kostete das einzelweise Entdecken zwei CI-Rotläufe auf #499) · [ ] Verfahrens-Gap: Reparatur-Arm (Mo 04:43) vs. Detektions-Arm (Mo 05:17) — Cadence/Reihenfolge entscheiden; check:netz-&&-Kette zeigt nur ersten Befund (eigener deklarierter Schritt, §17).

**Ist-Diagnose 1.9.2026 (Session QS-MONITOR-ROT, Verteilung über 15 Läufe statt Einzelwert
— Ergänzung, keine Nachführung; die 14.8.-Angaben oben bleiben, wie sie waren):**

- Rotgrund A (6.7.–15.8.: LIK 05–07/2026, ESTV-MWST-Drifts, AIG-Botschaft, VERN-2026-79) ist
  seit #499 (14.8.), #524 (15.8.) und #581 (30.8., Gegenprüfung bestanden) behoben; Beleg: Lauf
  31.8. 00:31 UTC GRÜN (`check:lik-frische` 2026-07 ≥ 2026-06 · materialien-netz 48/48 ·
  botschaften/vernehmlassungen-netz OK). Die ROADMAP-Häkchen fehlten nur.
- Rotgrund B (24.8., 31.8. 11:38 — der stehende Rotgrund): Kanonik-Arbiter in
  `check:fedlex-versionen` — Fedlex republiziert html-N-Manifestationen (24.8.: 10 Pins bgg/vgg/
  aig/glg/ohg/elg/fidlev/beg/lmg/thg; 31.8.: stgb html-0→4). Der Reparatur-Arm
  (`fedlex-frische.yml`) erkennt und re-pinnt korrekt, sein PR landet aber nicht: Voll-Lauf
  `npm run normtext` fasst 4860 Kantons-Snapshots mit Datums-Churn an (Befund (a2)) → #596
  kollidiert an vier ZH-Dateien mit #606 (`git merge-tree`-Beleg) und bleibt liegen; der Monitor
  läuft 34 min nach dem Reparatur-Lauf, vor dessen Merge. Verfahrens-Gap damit belegt, nicht
  vermutet.
- Rotgrund C (30.8. 22:37 + 22:48, beide `workflow_dispatch`): `check:fedlex-abk-netz` — SPARQL-
  Teilantwort (Live 594 Zeilen, 199/230 SR) gegen Artefakt 597; 00:31 derselbe Lauf mit 597/597
  grün. Flake der Quelle, fail-closed korrekt («KEIN URTEIL MÖGLICH … NICHT regenerieren»). Kein
  Fix nötig; Verteilung notiert (2/15 Läufe).
- ESTV-ToC-Sonde 1.9.2026 (1 GET `tableOfContent.xhtml?publicationId=1248491`): 0× «Publiziert
  am», 0 Datumsangaben — das ToC trägt keine Publikationsdaten; der Stand-Wechsel MUSS über die
  Ziffer-Seiten geprüft werden (Stand-Probe je Dokument, `estv-mwst-stand-probe.ts`).
- Befund (a) war bereits behoben (`soft-law-projektion-run.ts` Z. 48–63: ohne Harvest-Kanten
  keine Orphan-Bereinigung) — hier nur festgestellt, nicht neu gebaut.

Erledigt und hier als Beleg belassen:

  - [x] ESTV-MWST-Drift 15.8. behoben: MI 05 + Branchen-Info 04 Snapshots nachgezogen (Gegenprüfung bestanden), check:materialien-netz 48/48 drift-frei; Monitor-Rotgrund seit 10.8. damit weg.
  - [x] 1.9.2026 (Branch `feat/qs-monitor-rot`): Verfahrens-Gap geschlossen — Monitor-Cron 07:17 UTC
    (2,5 h nach dem Reparatur-Arm), Reparatur-PR ohne Kanton-Churn (`--nur=bund` +
    `normtext:churn-reset`, Befund (a2)), `check:netz` als Runner mit Tafel aller 12 Verdikte
    (Rot-Beweis: zwei rote Dummy-Glieder beide sichtbar). StGB-Pin html-0→4 (kanonisch, SPARQL
    isExemplifiedBy; Regenerat aus html-4 = reiner Datums-Churn, Inhalt identisch).
  - [x] 1.9.2026 Befund (d): `check:botschaften-netz` = Vollabgleich der Grundmenge (227 Erlasse);
    Mutationsprobe BOTSCHAFT-2025-1528/EOG entfernt → alt grün, neu rot.
  - [x] 1.9.2026 Befund (f): Roh-Bindings deterministisch (`sortiereBindings`); reproduziert (4 Dateien
    umsortiert, multiset-identisch), Migration 59 Dateien, zweiter Lauf byte-stabil.
  - [x] 1.9.2026 Befund (g): `npm run materialien:kaskade -- --datum=…` (Projektion → Revisionen →
    Zähler → Churn-Reset → Manifest, Abbruch beim ersten Rot).
  - [x] 1.9.2026 Befund (a): bereits behoben vorgefunden (Projektion ohne Harvest-Kanten löscht nichts).

---

**Nacht 5.9.2026 (#687/#695, Läufe 33936281247/33937353756):**
- [ ] **Finding 7 ohne Reparaturweg** — bleibt Fedlex nach Fristablauf bei `laufend`, verlangt das Tor etwas, das der Generator verweigert; abgeleiteter Status `frist-abgelaufen` (amtlicher Status als Feld). `materialien:vernehmlassungen` in `materialien:kaskade` hängen (Zähler/Manifest fielen einzeln rot).
- [ ] **Register-`sha` rotiert mit `stand`** — `material-manifest.ts:45` hasht `r.stand`; stand-freie `shaVernehmlassung()` nur im Test (§5/§6.7).
- [ ] **Reparatur-Arm ohne `normtext:revisionen`** (#703) — Arm fährt nur `gen:artikel-revisionen`; DBG-Drift 54→55 blieb liegen. Dazu `--nur-geaendert` für den Revisionen-Lauf (227 `abgerufen`-Bumps je Lauf blähen den Diff ×20).
- [ ] **`check:materialien` lokal 7 falsche Shard-Abweichungen** (#703) — wenn `daten/soft-law.db` nur die gecrawlte Quelle trägt (ARG…VSTG); Tor darf DB-Zustand nur bei vollständig geladenen Quellen vergleichen. Zähler «0 Kanten · 0 Downgrades» strukturell 0, während der Lauf 3380/1157 zählt (§6.7).
- [ ] **Anker-Modell ESTV zieht nur verlinkte Normen** (Gegenprüfung #703) — MWSTV-Rechtsgrundlage von MBI 26 (Art. 83/93 MWSTV) unverlinkt ⇒ keine Kante; Text-Nennungen als Kandidaten-Kanten (Gegenprüfung).
- [ ] **Revisionen: Plausibilitäts-Marker `rectifies`-Notation ≠ eigene** (Gegenprüfung #703) — Fedlex klassiert die ZDG-Berichtigung AS 2026 448 unter 642.11 (DBG); Generator liest treu, Marker macht den Widerspruch sichtbar (§8).
- [ ] **Reparatur-Arm scheitert an wanduhr-abhängigem `check:materialien`** — Tor im Arm entschärfen (Kommentar in `fedlex-frische.yml`); Arm re-pinnte DBG korrekt, kam ohne PR durch (Feed/pdf-quellen-Reihenfolge behoben in #695).

## §3 — `QS-DATA-INGEST-DRIFT` · Ingest-Strecke 3× langsamer

Wörtlich aus ROADMAP.md (Stand 29.8.2026) — Messreihe, Nullprobe und die Auflage, den Deckel erst
NACH der Ursachenklärung neu zu bemessen:

  Befund: `scripts/datenhaltung/suche.test.ts` fiel im Vollauf mit «Hook timed out in
  95000ms» (`beforeAll`). **Nicht der Deckel ist falsch, die Basis ist gewandert.**
  Der Deckel wurde am 14.8.2026 sauber kalibriert (Ist + 3 sd) gegen eine
  ISOLIERTE Datei-Dauer von **10.85 s** (n=5, sd 0.45) und einen Lastfaktor ~4.7×.
  Neu gemessen am 17.8.2026, gleiche Maschine, unbelastet: **35.26 · 33.32 ·
  25.56 s** (Mittel 31.4) — die Ingest-Strecke kostet das **Dreifache**. Mit dem
  dokumentierten Lastfaktor liegt der Hook unter Last bei ~150 s und reisst 95 s
  systematisch, nicht zufällig.
  Nullprobe (§0 Ziff. 3): `scripts/datenhaltung/**` und die Korpus-Projektionen sind
  auf `feat/leser-v3-s1` **byte-identisch zu `main`** (`git diff origin/main...HEAD`
  leer für diesen Pfad) — die Eingaben des Tests sind dieselben, der Defekt liegt
  also auf `main`. Rate im Vollauf dort gemessen: **1 rot in 2 Läufen** (rot bei
  113 s Gesamtdauer, grün bei 67 s ⇒ lastabhängig).
  **Wurzel-Fix, nicht Deckel-Anhebung (§17):** zuerst klären, WARUM die Strecke 3×
  teurer wurde — Korpus-Zuwachs seit 14.8. oder eine Regression in
  `ingest.ts`/`fts.ts`. Den Deckel erst danach neu bemessen, nach demselben
  Protokoll wie am 14.8. (n=5 isoliert + n=5 unter gedeckelter Parallel-Last, Ist +
  max(3 sd, 25 %)). Den Hook NICHT durch ein gecachtes DB-Artefakt entlasten: er
  baut beide HOT-DBs über dieselben ingest+fts-Bausteine wie `datenhaltung:build`,
  und genau das ist die Aussage der Datei (§1 vor Tempo — Begründung steht im
  Datei-Kommentar).

---

## §4 — `W2·18-FEHLERBUCH` · Davids Alltags-Fehlerfunde

Stehender Sammel-Schritt (Entscheid David 8.8.2026 — Kleinvieh bündeln statt einzeln durch die
volle Maschine). David sammelt Fehler aus der täglichen Nutzung formlos als `- [ ]`-Zeile (oder
meldet sie im Chat — die Session trägt sie ein); Fix-Batch-Sessions arbeiten mehrere Positionen
sortenrein ab. **Risikopfad-Funde gehören NICHT hierher**, sondern in den passenden
Risiko-Dach-Schritt. Der Schritt bleibt stehen (nie `done`); Erledigtes wird abgehakt und
periodisch in die Chronik geräumt.

Die Liste steht wörtlich so, wie sie am 29.8.2026 in ROADMAP.md stand:

  - [ ] **Frische-Workflow fährt kein check:netz/fedlex-versionen** *(GP-Mitdenken 29.8.: genau der Lauf, der Pins bewegt, prüft die Currency-Tore nicht automatisch — Netz-Tor in fedlex-frische.yml ergänzen.)*
- [ ] **DIAGNOSE · e2e-Flake `suche-seite.e2e.ts` («Deep-Link ?q=Miete … ungekappt»)** *(Agent-Befund 31.8.2026, Volllauf zu PR #587)* — `expect.poll` auf >6 Treffer erhielt 0 (Timeout 10 s). Messbedingung (F3): 1× rot im Volllauf 663 Tests/5 Worker/KALT; isoliert 5/5 grün; unter warmer Last 30/30 grün (`--repeat-each=6 --workers=6`). Nicht reproduziert unter Warm-Last — Kalt-/Erstlauf-Verdacht (Familie F2g/⌘K-Wächter). Erst Verteilung messen, dann Fix; nichts «umschiffen». **Messpunkte 2 (31.8.2026, Branch feat/w213-kantone, Maschine unter Agenten-Last):** Volllauf 5 Worker → 3 rot (Deep-Link 0 Treffer · «alle N»-Option nicht sichtbar · V5-CLS 0.0006 statt 0 — zwei NEUE Signaturen derselben Familie, alle drei laden den 17,7-MB-Suchindex bzw. throtteln CPU); Wiederholung 5 Worker/3× → 1 rot (Deep-Link); isoliert 2 Worker/6× + 1 Worker/3× → 9/9 grün. Verdachtsverdichtung: Ressourcen-Kontention beim Erstladen des Client-Index, nicht datenabhängig (Diff berührt artikelVolltext nicht). **Messpunkt 3 (31.8., dritter Volllauf nach main-Einzug Test-Diät):** wieder genau 1 rot, wieder ANDERE Signatur (`international-kanonik-ia6` Deep-Link-Scroll, viewport ratio 0); isoliert 33/33 grün. Vier Vollläufe, vier verschiedene Einzel-Signaturen, alle isoliert grün — die Familie ist Erstlade-/Scroll-Timing unter Parallel-Last, nicht testspezifisch. **Messpunkt 4 (31.8., Design-Branch, zwei Vollläufe):** je 2–3 rot aus derselben Familie (Deep-Link-0, «alle N», leser-position-CLS byte-identisch 0.0506, leser-kopf-cls 0.060); ALLE isoliert grün (5/5, 6/6, 8/8, 5/5). Muster stabil: jeder Volllauf unter Last wirft 1–3 Familienmitglieder, isoliert nie reproduzierbar.
- [ ] **Gliederungsbaum: Knoten-Merge ohne Adjazenz-Bedingung** *(§9-Bug-Check 31.8.2026, Fund 3 — Vorbestand)* — `browse.ts` verschmilzt «letzter Knoten dieser Ebene + gleiches Label» auch über dazwischenliegende Direktartikel hinweg: `SG-811.1` rendert § 251bis direkt nach § 248bis (beide Marginalie «2. Straflose Selbstanzeige»), vor §§ 249–251. Wurzel-Fix: Adjazenz-Bedingung beim Merge; betrifft TOC + Lesespalte gleichermassen.
- [ ] **LM-165 · Deep-Link auf grossen Erlassen scrollt weit übers Ziel** *(Agent-Befund 31.8.2026, PR #584)* — `/gesetze/bund/OR#art-368` landet bei y≈1'077'504 statt ~355'887; danach ist `[data-v3-kopf-artikel]` leer und das Norm-Panel fällt auf Art. 1 zurück. Verdacht: spät auflösende content-visibility-Platzhalter; verwandt mit LM-163. Repro dokumentiert, kein Risikopfad.
- [ ] **PROZESS · Befund-Anker-Sweep vor jedem Rest-Batch** *(Lehre Batch 30./31.8.)* — 2 von 4 gebauten Befunden waren durch den V3-Umbau überholt; §8 führt `LeserAnsichtMenu.tsx`/`LeserRechtsprechungMenu.tsx` als Anker, die Dateien existieren nicht mehr. Vor dem nächsten Batch: tote Datei-Anker der Befundliste maschinell listen (git ls-files-Abgleich) und Positionen zuerst re-messen.
- [ ] **⌘K-Wächter seit ≥16.8. auf CI im Erstversuch 69/69 rot — von retries:2 maskiert** *(Forensik 29.8.2026 über 69 main-Läufe; Hydration-Hypothese widerlegt (20× Drossel greift sofort). Eigener Diagnose-Auftrag; zugleich frisst er ein maxFailures-Budget — so lief das neue topbar-320-Tor in Gruppe 6 nie («10 did not run»). Retry-Politik = David-Frage. Skill lehren F2-Verschärfung (i).)*
- [ ] **Leerflächen-Reservierung /gesetze messbasiert lösen (L1↔L2-Spannung)** *(Design-Review 29.8.: min-h-inhalt-region erzeugt bis 488 px Leerlauf auf ?ebene=bund; naive Verkleinerung brächte den Footer-Sprung (0.44 CLS) zurück — Fix braucht Messreihe, nicht Pixel-Jagd; App-weite Rahmen-Idee (EINE Reservierungs-Regel Route-Fallback+Platzhalter, App.tsx-Naht) als §10-Kandidat, siehe FAHRPLAN-PERFORMANCE dritter Posten.)*
- [ ] **Browser-Pane ist nicht Worktree-isoliert (§17-Werkzeugbefund 21.8.2026, zwei Agenten unabhängig)** — fremde Tabs/Navigationen zwischen parallelen Worktree-Sessions, `preview_start` mit launch.json-Name serviert den HAUPT-Checkout statt des Worktrees, resize wirkungslos. Wurzel-Fix: Worktree-bewusste launch.json-Auflösung bzw. je-Session-Pane; bis dahin Workaround eigener Playwright-Lauf (in Dispatch-Berichten dokumentiert).
  - [ ] **FlexSearch `suggest:true` wirkt bei Mehrwort-Queries wie ODER/fuzzy** *(Wurzel von Cowork-Befund 29, Fix 21.8. nur in artikelVolltext.ts; Rest der Suche-Schicht systematisch nach weiteren `doc.search(mehrwort, {suggest:true})`-Stellen absuchen.)*
  - [x] **EMRK-docTitle «EMRK (EMRK)»** *(Kürzel-Duplikat im title-Tag bei pdf-embed; Gegenprüfung J3 21.8., kosmetisch.)* **Erledigt 5.9.2026: `metaFuerErlass()` hängt Kürzel nur an, wenn nicht im Titel; Unit-Test.**
  - [x] **Kantonskarte: aktiver Kanton verliert Hervorhebungs-Rand bei Hover über Nachbar** *(nur EIN Overlay `gezeigt = hover ?? aktiv`; Gegenprüfung 21.8., kosmetisch.)* **Überholt 5.9.2026: Duplikat von Befund 12, behoben 29.8.2026 (`markierungen()`, zwei Ringe).**
  - [x] **`e2e/helpers/istHuelle.ts` löschen (totes Modul seit H5)** *(Nachlese 21.8.2026: kein Importer mehr, Projekt leser-v1 entfernt; Streich-Massstab aufraeumen.md §3 — Beweis = leerer grep vor Löschung.)* **Erledigt 5.9.2026 (Batch W2·18): gelöscht, grep-Beweis ohne Importer.**
  - [ ] **e2e-Assertions-Latten unter CPU-Aushungerung** *(QS-E2E-STABIL-Messreihe 14.8.: eigene Klasse, kein Timeout — international-kanonik-ia6 3× toBeInViewport, gesetze-ia-v2-walks, suche-seite:27 expect.poll, verlauf-o1, qsui-Vorlagen; wandert je Lauf mit Aushungerungstiefe; weitere Mitglieder 21.8.2026: leser-position-u:147, rechtsprechung.e2e:318 Rail-CLS, leser-gliederung-a33, norm-sprung Ctrl+K-Fokus — alle standalone grün nachgewiesen. Methode wie QS-E2E-STABIL, aber gedeckelte Lastbedingung — nie die verworfene Übersättigung. Weitere Mitglieder 29.8.2026 (drei Prüf-Sessions unabhängig): international-kanonik-ia6, leser-kopf-cls-s3, rechtsprechung-richter, datenhaltung/suche, leser-v3-h4-Familie, suche/rankingTestset-vitest-Hooks — je seriell grün, unter 5-Worker-Last wandernd.)*
  - [ ] **druck-fundstellen-z2 flakt NUR auf CI-Runnern** *(CI-Forensik 14.8.: 10 Vorkommen/30 Tage; lokal 11/11 sauber bei 19,8 s gegen 30-s-Budget — braucht Runner-Messung, kein lokaler Fix; blosses Budget-Hochsetzen ohne Messreihe bleibt ausgeschlossen.)*
  - [ ] **Kalender-Export: Termine als «frei» markieren (TRANSP:TRANSPARENT)** — Go David 8.8.2026 («frei ok»); bricht deklariert einen Golden-Anker ⇒ fachliche Änderung mit Golden-Neuschrieb im eigenen Commit (Herkunft: Session-Karte 3./4.8.2026, archiv/STRUKTUR-SESSIONKARTEN.md).
  - [ ] **LM-016-Wurzel: Topbar-Icon-Zeile an die Brotkrume-Breite angleichen** (Befund B7 8.8.2026, zurückgestellt: braucht eigenen Entscheid statt Menü-Pflaster).
  - [x] `check:design-tokens` scannt Kommentartext mit (Utility-Platzhalter im Kommentar = rotes Tor, je Vorfall ein Zyklus); Wurzel-Fix: Kommentar-Strip vor dem Scan, einmal rot zeigen (§6.7). *(Agent-Fund 8.8.2026.)* **Erledigt 5.9.2026: Kommentar-Strip vor dem Scan, Rot-Beweis beidseitig.**
  - [ ] **Perf-Blick auf den langen Artikel-Index (aus PR #486):** der flache Index ist bewusst nicht virtualisiert; seit dem B3-Wegfall trägt SG-3849 607 Zeilen (davon 590 im Anhang-Ast, der bei Anhang-Dominanz aufgeklappt startet), ZH-243 152. Messen, ob das auf schwachen Geräten trägt — sonst Virtualisierung des Index als eigener Schritt (Skill `perf`).
  - [ ] **`check:materialien` läuft durch blossen Kalender-Ablauf rot** — das Tor misst Kalenderzeit statt Korrektheit; Wurzel-Fix: abgelaufene Fristen deterministisch als «abgeschlossen» ableiten oder auf Harvest-Alter umstellen.
  - [ ] **Muster «Test pinnt von-Hand-Tageswert» anderswo suchen** — der `registerStand`-Fall (garantierter Fehlalarm bei jeder Pflege) ist gefixt; Geschwister finden.
  - [ ] **Alt-Flake `qsui-hierarchie.e2e.ts` (Vorlagen-Block, ~25 %/Fall, Nullprobe-belegt 25/84 auf main):** Wurzel-Fix mit Mandat; Familie + Zahlen im a33-Dossier-Nachtrag (PR #480).
  - [ ] **Alt-Flake `leser-weiterlesen-r4-r8` (Shard-Kontext, vorbestehend, Befund 9.8.2026):** gleiche Familie; Wurzel-Fix mit Mandat, Messbedingung protokollieren.
  - [ ] **Alt-Flake `leser-ohne-gliederungslinie.e2e.ts:71` (OR Art. 319, Befund 16.8.2026, Vorprobe LESER-V3):** 20-s-Timeout auf `getByRole('button', {name:'Ansicht'})`. Nullprobe-belegt auf `main` — **Flag aus** 1/3 rot, Flag an 2/5 rot, gepoolt 3/8 ≈ 38 %; Messbedingung lokal/warm/5 Worker/60 Tests im Lauf, isoliert 0/1 rot. Gleiche Familie wie oben; die Wurzel ist in `e2e/shard-gruppen.json` bereits benannt («zweiter schwerer OR-Reader je Chromium-Worker») und weiterhin ungefixt. CI unauffällig (`workers:1`, 90 s, `retries:2`) — der Preis fällt lokal an. Wurzel-Fix mit Mandat, nicht per Timeout maskieren. Zahlen: `docs/ux-audit-2026-07/reader/leser-v3-vorprobe.md`.
  - [ ] **Flake-Beobachtung 14.8.2026 (Voll-Suite, isoliert grün):** `gesetze-historie-badge` Lade-CLS-Budget (§15-Messrauschen unter Last) + `leser-kontext-e4` Deeplink — je 1× rot bei 539 grün, Wiederholung 8/8 grün; bei Wiederkehr zur CLS-/Leser-Flake-Familie schlagen.
  - [ ] **Klick-Pfad der Gliederungs-Zeile (Perf-Restposten W2·19):** 161 ms @4×, OR/BGFA-Verhältnis 7→14.6 verschlechtert; Messpunkte in der Perf-Nachmessung (bibliothek, via PR #480). Skill perf.
  - [ ] **Lese-Kadenz-TBT @4× (U3-Rest, ~10 s/32 s, @1× unmerklich):** Spy-/Zuklapp-/Re-Render-Pfad; Messvorschrift: Kadenz-Kopfzeile der Nachmessung.
  - [ ] **Liste `/gesetze`: ~370-px-Leerfläche am Seitenende schliessen** (LM-163-Alternativerklärung, risikoarm; Nachprüfung 9.8.2026).
  - [ ] **Tor gegen case-blinde Korpus-Pfad-Literale** (`public/normtext/**.json`-Strings zeichengenau gegen den git-Baum; macOS case-blind vs. Linux-CI, PR #478): `normtext-fixture.ts` deckt nur Nutzer; einmal rot zeigen (§6.7).
  - [ ] **tor-schutz.py: Trailer-Block-Format beim Commit prüfen** — ein `Gegenpruefung:`/`Roadmap:`-Trailer mit Leerzeile IM Block wird von git nicht als Trailer geparst und fällt erst als roter Merge-Schutz im CI auf (ein voller Zyklus; real 13.8.2026, PR #487, trotz Memory-Eintrag). Hook-Check beim Commit = Wurzel-Fix; einmal rot zeigen (§6.7). *(Konfig-Fläche — Umsetzung mit David-Freigabe.)*
  - [ ] **Tor gegen die Flake-Familie «einmaliges DOM-Lesen ohne Wartung»** (`boundingBox()!`, ungewartete Einzel-Lesungen in `page.evaluate`): vier belegte Fälle, je ein Diagnose-Zyklus Kosten; einmal rot zeigen (§6.7).
  - [ ] **Eingebettetes PDF: Ladephase ohne Messung** — Wortlaut korrigiert (29.8.2026): Fläche ist **hellgrau MIT Ladebalken**, nicht schwarz ohne Anzeige. **Dauer offen**: der Screenshot-Pfad misst sie nicht (ab 1 s unverändertes Bild = Browser-PDF-Viewer). Braucht Zeitmessung am `<iframe>`-Load; erst dann entscheidbar, ob etwas zu tun ist. *(Befund 46.)*
  - [ ] **FR/IT-Band: nicht reproduzierbar wie beschrieben** — 29.8.2026: das `<details>` schliesst sauber, weder «nur durch Aufgeben entfernbar» noch der 19-px-Sprung traten auf. **Fundort unklar** (andere Stelle? Viewport? inzwischen behoben?). Bleibt offen als *Suchauftrag nach dem Fundort*, nicht als Fix-Auftrag; ohne neue Repro-Angabe Rückbau-Kandidat (§17). *(Befund 48.)*
  - [x] **International-Erlasse unter `/gesetze/bund/`** — gebaut 29.8.2026 (Entscheid David: ja, mit Redirects). Kanonisch `/gesetze/international/:kuerzel`, Alt leitet dauerhaft. Herleitung: `lib/normtext/erlassAdresse`. *(Befund 45.)*
  - [ ] **Kantonswahl: Karte UND Karte/Liste-Umschalter verschwinden nach der Wahl** — «ZH 3» bricht dabei allein um. **Verifiziert 29.8.2026, bewusst nicht gebaut:** der ganze Detailzustand (Kürzelleiste + der Ort für den Umschalter) liegt in `src/pages/Gesetze.tsx`, `KantonAuswahl.tsx` wird beim Wählen ausgehängt — Datei belegt von PR #565. **Direkt nach #565 anschliessen**, zusammen mit Befund 12. *(Befund 41.)*
  - [ ] **Brotkrume Kantonsebene zu flach** — **Prämisse widerlegt (29.8.2026):** die Krume trägt bei KEINER Ebene eine Nummer (drei Stufen, `v3/erlassAnsicht.ts:377-386`); was wie «[SR 220]» aussieht, kommt aus dem Erlass-Kopf darunter — kein Bundes-Vorbild anzugleichen. Echter Unterschied: `zeigeVolltitel()` unterdrückt den Volltitel bei **775/1231 (63 %)** Kantonserlassen (Register-Kürzel = Volltitel). Sigle liegt schon im `sr` (ZH «LS 211.11», 1227/1231). Umsetzung: Ableitung in `erlassAnsicht.ts` + Geschwister-Element in `LeserKopf.tsx:204`. **Kein Fix-Batch-Posten** — vier e2e-Pins an der Ort-Zone, darunter die Ä-A4-Breitenfalle. 4/1231 ohne `sr` ⇒ muss entfallen können (§8). *(Befund 43/C8.)*
  - [ ] **SchweizKarte: aktiver Kanton verliert den Rand beim Hover über Nachbarn** — `gezeigt = hover ?? aktiv`, nur EIN Overlay-Pfad. **Heute folgenlos** (kein Aufrufer übergibt `aktiv`), **scharf sobald Befund 41 gebaut wird**. Notiz am Fundort; Auflösung = zweiter dauerhafter Overlay-Pfad für `aktiv`. Ins **Kantonskarten-Paket F1/F2** mit 41 + 49. *(Befund 12; geprüft 29.8.2026.)*
  - [ ] **Kantonskarte ohne Legende** — Pastellfarben ohne erklärte Bedeutung, Kantonsnamen erst nach Klick sichtbar. *(Cowork-Befund 49, 18.8.2026, unverifiziert — vor Bau reproduzieren.)* **Zusammen mit Befund 12 + 41 im Kantonskarten-Paket bauen** (alle drei sitzen in `SchweizKarte.tsx`/`Gesetze.tsx`; einzeln gebaut kollidieren sie).
  - [ ] **4'490 fokussierbare Elemente unter 24×24 px (WCAG 2.5.8)** — eigener Schritt, kein Nebenbei-Fix, nicht mit anderen Positionen bündeln. *(Cowork-Befund 37, 18.8.2026, unverifiziert — vor Bau reproduzieren.)*
  - [ ] **ZPO-Chronologie: 11 Sammelerlass-Einträge ohne Titel/AS-Fundstelle, Links kleben am Satzende** — **Verdikt (Datenklärung 21.8.2026, lex-recherche): strukturelle Lücke des SPARQL-Pfads, kein leeres Feld.** Pfad (b) findet nur Änderungserlasse mit primärer SR-Klassierung des Ziel-Erlasses; Mantelerlasse fremder SR fallen durchs Raster, Pfad (a) trägt nur das Datum. Fix = dritter Query-Pfad (c) über die tatsächliche Modifikations-Beziehung (`scripts/normtext/revisionen-generieren.ts` Z. 33–39/238–251), mittlerer Aufwand, mind. 10 betroffene Erlass-Dateien; der bestehende ehrliche UI-Hinweis bleibt für echte Rest-Lücken nötig. *(Cowork-Befund 36, 18.8.2026, unverifiziert am UI — vor Bau reproduzieren.)*
  - [ ] **Kantonale Gliederung ZH-211.11 nur «§ 1…§ 23» ohne Überschriften** — **Verdikt (Datenklärung 21.8.2026, lex-recherche): Extraktions-Lücke, keine Quell-Lücke.** `scripts/normtext/struktur-kanton-run.ts` überspringt bewusst Nicht-LexWork-Quellen (PDF/lexfind/zhlex); die Quelle (zhlex GebV OG) HAT eine Buchstaben-Gliederung («A. Allgemein» …). Systematisch: 38 von 1'231 kantonalen Erlassen ohne Struktur-Sidecar (ZH 3/3, JU 7, VD 7, TI 5, GE 4, NE 4, SZ 4, SG 3, AR 1, BS 0). Wurzel-Fix wäre ein PDF-Struktur-Adapter je Quellsystem — Priorisierungsentscheid, kein Quick-Fix. *(Cowork-Befund 42, 18.8.2026, unverifiziert am UI — vor Bau reproduzieren.)*

---

**Nacht 5.9.2026 (CI #691/#683):**
- [ ] **Kontention (5.9.2026, Nachmittag):** bei ≥ 4 parallelen Bau-Agenten + Stop-Hook-Gate auf einer Maschine reissen `scripts/datenhaltung/suche.test.ts`/`suche-rang.test.ts` ihr 95-s-Setup-Limit (Vollsuite 224 s statt 40 s) und E2E-Latten (`international-kanonik-ia6` toBeInViewport, `leser-kopf-cls-s3` CLS, `a11y` dunkel BS-640.100) — isoliert stets grün (belegt 4×). Kein Code-Fix; Regel: Tore seriell fahren, wenn Bauer laufen; Stop-Hook-Gate unter Last als Hinweis lesen, nicht als Rot. **Wurzel-Fix-Kandidat (Opus-Prüfer 5.9.2026):** `suche.test.ts` baut je Lauf den In-memory-FTS-Index auf (Budget 14.8. schon 60→95 s gehoben) — vorgebaute DB-Fixture statt Aufbau je Lauf; eigener Schritt unter QS-DATA-INGEST-DRIFT oder QS-BASIS.
- [ ] **Flake-Sammlung 5.9.2026 (je 1 failed, Retry grün):** `gesetze-ia-v2-walks:65` (#691/#711), `split-erwaegungssprung.e2e.ts:47` ⧉-Pane auf Erwägung, `tastatur.e2e.ts:81` Skip-Link (#715), `leser-v3-blatt:105` ⌘K-Split — alle Hydration-/Timing-Klasse; nach der 60-s-Härtung Rate neu messen (`zaehleFlakySpecs` in der Selbstopt-Zeitreihe).
- [ ] **OR-Leser-e2e auf 60-s-Budget härten** — `gesetze-ia-v2-walks.e2e.ts:72` 10-s-Timeout auf `#art-336_c` (2-vCPU); #682 härtete nur `norm-sprung`/`leser-suche`; alle `gesetze/bund/OR`-Specs als Infrastruktur.
- [ ] **⌘K-Vorlauf im Split** (CI #711, `leser-v3-blatt.e2e.ts:105` flaky) — Verdacht Nebenwirkung von #682 (vor Hydration löst der Vorlauf in der Kopf-Suche aus, nicht im fokussierten Pane); bei Wiederholung `fruehesSuchKuerzel.ts`: Vorlauf nur einlösen, wenn kein Pane-Fokus.
- [ ] **`check:e2e-shards` deckelt Laufzeit je Shard** — Balance über mehrere CI-Läufe mitteln (Streuung ≈ verschobener Betrag).

## §5 — `QS-CODE-PROP` · Eigenschafts-Tests (property-based) für die Rechen-Engines

Entscheid David 7.8.2026: je Engine ein Invarianten-Katalog («eine Frist endet nie vor ihrem
Beginn»), tausende generierte Eingaben. **Die Invarianten-Formulierung ist fachlich** — Katalog mit
Gegenprüfung härten und David vorlegen (§7); je Invariante einmal rot zeigen (§6.7).

Wörtlich aus ROADMAP.md (Stand 29.8.2026):

  - [ ] **`nichtKonsolidiert`-Marker bei Staatsverträgen falsch-positiv (FZA, Gegenprüfung S3 16.8.2026)** — `scripts/normtext/revisionen-generieren.ts:233` setzt `dateForce > korpusStand`, kennt aber «in Kraft ≠ angewendet ab» nicht: Fedlex-Konsolidierung 15.12.2020 enthält AS 2021 12 bereits (Fussnote «Bereinigt gemäss Beschluss Nr. 1/2020 … angewendet ab 1. Jan. 2021»), Warnung «seit 01.01.2021 geltend, nicht eingearbeitet» ist falsch (§1/§8). Wurzel-Fix: AS-Fundstelle im Konsolidierungs-XML als Konsolidiert-Beleg werten; Gegenrechnung über alle 87 Marker; Gegenprüfung Pflicht. Ergänzend `revisionen.ts:130` Kommentar (BMV-Begründung) berichtigen; Warnung auch in den Prerender-Standausweis (`seo-detail.ts`) übernehmen (§8 für Suchmaschinen).
  - [ ] **WARTET AUF DAVID (fachlich, §7):** SF-F1 — bleibt die Art.-63-Verlängerung bei gehemmter Frist erhalten (sonst verkürzt die Hemmung eine Verwirkungsfrist)? · SF-F2 — Wartefrist-Ablauf in den Betreibungsferien ergibt früheren «frühesten Handlungstag» (4.1.) als dieselbe Frist als Handlungsfrist (6.1.) — gewollt? Katalog-Zeilen «fachlich vorzulegen» dort.

Runde 1 (erledigt, als Beleg belassen):

  - [x] Runde 1 gebaut 15.8.: 12 Engines, 81 Invarianten, 99 fast-check-Tests (7,6 s), Katalog `bibliothek/register/property-invarianten-2026-08-15.md`; 89/89 Rot-Beweise; **kein Engine-Defekt** — Fund schkgFristen: Art. 63 S. 2 SchKG («bis zum dritten Tag nach DEREN Ende» = Ende der Ferien) macht Fristende nicht-monoton, normkonform (Pin SF-8).
