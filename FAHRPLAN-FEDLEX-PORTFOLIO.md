# FAHRPLAN-FEDLEX-PORTFOLIO — Nützliche Fedlex-Datenarten für LexMetrik

> **Rolle dieses Dokuments:** Detailquelle (§14) zu den ROADMAP-Schritten, die am Ende je Paket benannt sind. **Kein** zweiter Einstieg. **Fable plant, Opus baut** — jedes Paket ist Risiko-Pfad (Extraktion/Norm) → `check:gegenpruefung` Pflicht (§14 DoD), §7-Verifikation, §9-Deploy nur mit Davids Ja.
> **Quellen-Hygiene (für ALLE Pakete):** ausschliesslich die amtliche Fedlex-Stelle — SPARQL `https://fedlex.data.admin.ch/sparqlendpoint` (POST, `Accept: application/sparql-results+json`, `curl --data-urlencode`) + Filestore-HTML. **Nie** das Dritt-Repo `droid-f/fedlex` (CC BY-NC-SA, kommerziell verboten). Kein fremdes Byte fliesst ins Produkt.
>
> Status: Plan (2.7.2026), noch kein Code. §14-Intake (ROADMAP-Verlinkung) erfolgt erst mit Davids Freigabe je Paket.
>
> **Ergänzt 3.7.2026:** Opus-Härtung (7 Untersuchungs-Briefs + 3 adversariale Kritiken + 3 live-verifizierte Repo-Fakten) in DIESE eine Datei eingearbeitet — Fable-Überblick bleibt §0; Andockregeln/Bausteine/Moat-Hebel/Verifikationspunkte/Meilensteine (Abschnitte 0b–0d + je Paket «Opus-Härtung» + Bridge B1 + Abschnitte «Recht/Lizenz-Leitplanken» / «Offene Verifikationspunkte» / «Reihenfolge & Meilensteine») stammen aus dem Opus-Bauplan. Reihenfolge bindend **1 → 2 → (B1) → 5 → 3 → 4**.
>
> **Drei live gegen den Arbeitsbaum verifizierte Repo-Fakten (nicht nur aus den Briefs übernommen; Currency-Blindfleck ist Paket-1-relevant):**
> 1. `scripts/fedlex-pins.ts:19` = `/^\s*"([a-z_]+)\|([a-z0-9/_]+)\|(\d{8})\|/gm` — Namensgruppe ohne `0-9`.
> 2. `scripts/fedlex-cache.sh` enthält **bereits** 13+ Ziffern-Namen-Pins (`asylv1/2/3`, `argv1..5`, `bvv_2`, `bvv3`, `co2_gesetz`, …) → diese Pins sind **jetzt parser-blind** = latenter Currency-Blindfleck. 218 Pin-Zeilen total.
> 3. `scripts/datenhaltung/ingest.ts:8,32` ingestet **nur** `public/normtext/bund` als `typ='normtext-bund'`; `scripts/gegenpruefung/kern.ts:63-84` Risiko-Globs = `scripts/normtext/`, `src/lib/normtext/`, `public/normtext/*.json`, `scripts/**/*check*` — **nicht** `scripts/materialien/`, **nicht** `public/materialien/`, **nicht** `scripts/`-root (also `fedlex-cache.sh`-Edits triggern das Gate nicht).

---

## 0. Portfolio-Überblick

Fedlex ist die **Gesetzgebungs-Datenbank** des Bundes (Erlasse, Materialien, Verfahren, Staatsverträge) — **nicht** Rechtsprechung. Sechs Datenarten sind für LexMetrik verwertbar; fünf davon bauen, eine ist bewusst ausserhalb des Scopes.

| # | Paket | Wert | Machbarkeit (heute) | Aufwand | Priorität |
|---|-------|------|---------------------|---------|-----------|
| **1** | **Gesetze-Currency & Coverage** (20 stale aktualisieren + Monitoring-Lücke schliessen + 56 künftige als Wiedervorlage) | **Hoch** — Kernversprechen «immer geltende Fassung» (§7 Build-Regel 3); heute liefern wir 20 veraltete Erlasse aus | **Belegt** — Gap-Report fertig (`fedlex-gap-report-2026-07-02.md`); Pipeline (`normtext`/`fedlex-cache.sh`/`check:fedlex-versionen`) existiert | **M** (Datenlauf + kleiner Tor-Umbau) | **P0** |
| **2** | **Botschaften / Bundesblatt** (Entstehungsgeschichte je Gesetz) | **Hoch** — neue Klinge «amtliche Materialien», Burggraben Norm↔Gesetzesgeschichte; kein Wettbewerber verzahnt das | **Belegt** — SPARQL-Reverse-Kette getestet (AVIG→11, DSG→2); Materialien-Modell trägt es fast unverändert | **M–L** (neuer Datentyp + Pipeline + UI-Abschnitt) | **P1** |
| **5** | **Änderungshistorie / Amtliche Sammlung** (Revisions-Timeline je Gesetz: welche AS/RO-Erlasse haben es wann geändert) | **Hoch** — Schwester zu Paket 2; Botschaft = Genese-Absicht, AS-Erlass = die tatsächliche Änderung → zusammen volle Gesetzes-Geschichte | **Belegt** — live getestet (DSG 235.1): Pfad über `classifiedByTaxonomyEntry` + `dateEntryInForce` liefert Änderungs-Erlasse mit Datum, Titel, RO-Fundstelle, Botschafts-Verzahnung | **M–L** (teilt Paket-2-Pipeline) | **P1.5** |
| **3** | **Vernehmlassungen** (`eli/dl/proj`, ~2000) | **Mittel** — «was kommt»-Vorschau, ergänzt Gesetzgebungs-Tracking (W3·11) | **Teilweise offen** — Projekt-Graph-Andockung plausibel (gleiche `?proj`), aber **nicht** end-to-end getestet; POC nötig | **L** (nach Botschaften-Pipeline günstiger) | **P2** |
| **4** | **Staatsverträge** (`eli/treaty`, ~18 500) | **Mittel-niedrig** — punktuelle Lücken der International-Rubrik (wir haben 18 Volltext + 2 PDF) | **Teilweise offen** — `eli/treaty` ≠ `eli/cc`-Markup; kuratierte Auswahl statt Masse; POC je Kandidat | **S–M** (kuratiert, kein Bulk) | **P3** |
| **6** | **Rechtsprechung** | — | **Nicht in Fedlex** | — | **Out of scope** (OpenCaseLaw/bger, W2·6) |

**Empfohlene Reihenfolge (Wert × Machbarkeit × Aufwand): 1 → 2 → 5 → 3 → 4.** Paket 1 heilt einen **aktiven Treuedefekt** (wir liefern Veraltetes) bei belegter Pipeline und geringstem Aufwand → zuerst. Paket 2 ist das Vorzeige-Paket mit belegter Machbarkeit und hohem Neuwert → als Nächstes. Paket 5 folgt **unmittelbar auf 2** (erbt dessen Pipeline, Currency-Daten liegen schon vor, komplettiert die volle Gesetzes-Geschichte). Paket 3 erbt ebenfalls die Graph-Pipeline, Machbarkeit erst per POC → vierte Stelle. Paket 4 ist kuratierte Feinarbeit mit dem geringsten Grenznutzen → zuletzt.

---

## 0a. Endziel & Moat-These (warum dieses Fundament) — Opus-Bauplan

**Endziel (ROADMAP.md:30-52):** LexMetrik = „Schweizer Taschenmesser für alle Juristen" mit vier Klingen — **Konsultieren** (Gesetze DE/FR/IT, Rechtsprechung, Materialien, Gesetzgebung), **Rechnen** (deterministisch, jeder Wert mit Norm+Link+Stand), **Verzahnen** (der eigentliche Burggraben: Norm → Werkzeug → Schriftsatz und zurück), **Finden**. Alles auf amtlichen, URG-freien Quellen (Art. 5 URG). Das Fedlex-Portfolio sitzt in **Welle W2·6** („Konsultieren-Klingen") und ist der Datenausbau, der die Konsultieren-Klinge vertieft und die Rohkanten für Verzahnen legt.

**Moat-These (STRATEGIE-PLATTFORM.md:39-45):** Der Moat ist **nicht der Code** (Engine + SPARQL-Ketten sind in Wochen kopierbar), sondern (B) die **kuratierten, quervernetzten Datenassets**, (C) der **Verifikations-Prozess** und (D) Davids fachkundige Abnahme. Daraus folgt die zentrale Härtung dieses Plans gegen die Moat-Kritik:

- **Der Moat sitzt einen Schritt hinter dem Punkt, wo die Original-Specs aufhören.** Eine flache `nur-live-link`-Liste („Botschaft: Datum + Titel + Fedlex-Link") ist ein hübscherer Curia-Vista-Ausschnitt — Fedlex besitzt diese Daten nativ, ein Link darauf ist Commodity. **Verteidigbar** sind erst (a) die **norm-verankerte Aggregation** (die Genese steht *auf* der Gesetzesseite, nicht in einem separaten Portal) und (b) die **Verzahnung** dieser Kanten mit Rechtsprechung (Zitat-Graph) und Rechnern.
- **Deshalb drei Moat-Härtungen, die in die Specs eingearbeitet sind** (Details §4): (1) Pakete 2/5/3 speisen in **denselben Norm-Kontext-Bus** ein, der schon Entscheide an einer Norm aufflächt (`KontextPanel typ="norm"`), statt fünf Silo-Sektionen nebeneinander; (2) **Artikel-Anker mitführen** (nicht auf Erlass-Ebene zementieren), damit artikelweise Genese/Änderung inkrementell wachsen kann — genau das, wofür Verlage Geld nehmen und was Fedlex nicht bietet; (3) **Currency als sichtbares Produkt** („geltend geprüft am TT.MM., maschinell") statt Minimal-Chip — eine verteidigbare Freshness-Aussage, weil selbst die Fedlex-Konsolidierung die AS trailt.

**Warum dieses Fundament zuerst:** Paket 1 behebt einen **Live-Defekt** (20+ stale Erlasse werden heute ausgeliefert, davon 13+ in einem parser-blinden Monitoring-Loch) und vertieft direkt Moat-Asset C. Ohne belastbaren Currency-Boden ist jede weitere Datenart nur mehr potenziell-veraltete Fläche. Reihenfolge daher bindend **1 → 2 → 5 → 3 → 4**, mit einem eingeschobenen **Bridge-Meilenstein B1 (Norm-Kontext-Bus)** nach Paket 2 (§7).

---

## 0b. Architektur-Grundsatz (Andockung an die neue DB; Datei↔DB-Koexistenz; Abstraktions-Schnittstelle) — Opus-Bauplan

**Verbindliche Speicher-Architektur (FAHRPLAN-DATENHALTUNG.md, Council 2.7.2026):** libSQL/SQLite, ein generator-erzeugtes, **gitignored** Artefakt `daten/lexmetrik.db`; die DB wird **Single Source of Truth** für Korpus-Inhalte, `public/*.json` + prerenderte Seiten werden **Projektion daraus**. Andockpunkt eine Schicht **unter** dem heutigen Generator: Adapter (`extrahiere-fedlex.ts` etc.) bleiben Extraktions-Wahrheit, schreiben künftig Zeilen ins DB-Artefakt; Prerender liest weiter nur JSON-Projektion. Parität nie auf `.db`-Rohbytes, sondern (a) JSON-Projektion byte-gleich + (b) kanonisches Dump-Manifest.

**Ist-Stand E0/E1 (verifiziert, NICHT der Memory-„nichts gebaut"-Stand):**
- **E0 ist gebaut.** `scripts/datenhaltung/{schema,ingest,projektion,build,check-paritaet}.ts`; `check:paritaet` läuft in der `check`-Kette als **In-Memory-Roundtrip** JSON→DB→JSON byte-gleich. **Schema heute minimal-generisch:** `datei(pfad,typ,erzeugt)` + `eintrag(pfad,idx,id,erlass,artikel,artikel_label,blob)`. `ingest.ts` ingestet **ausschliesslich** `public/normtext/bund` (`typ='normtext-bund'`, `ingestBundNormtext`, `BUND_DIR` konst.). `projektion.ts` rekonstruiert generisch via `blob = JSON.stringify(eintrag)` und setzt `{erzeugt, eintraege}` zusammen.
- **E1 (Generator-Flip) ist NICHT gebaut** (kein `daten/`-Verzeichnis, kein Adapter-→-DB-Schreibpfad). Der heutige **Direktpfad Adapter → `public/*.json`** bleibt gültig und ist der Schreibweg für alle fünf Pakete.
- Die reichen Ziel-Tabellen aus FAHRPLAN-DATENHALTUNG §3 (`erlasse`, `artikel`, `erlass_fassungen`, `materialien`, `erlass_revisionen`, FTS5) **existieren in E0 noch nicht**. Sie sind Zukunfts-Schema (E6). **Kein Paket darf sie als vorhanden unterstellen** (härtet die Refutation gegen Paket 5, die eine `REFERENCES erlasse(key)`-Reife suggerierte, die E0 nicht hergibt).

**Daraus die verbindlichen Andock-Regeln (gelten für alle Pakete):**

1. **Kein Paket baut einen eigenen DB-Layer vorweg.** Geschrieben wird in die bestehenden Datei-Formate (`NormSnapshot`/`register.json`/Sidecar). Beim E1-Flip wird **nur der Schreibpfad umgehängt**, der Adapter-Output bleibt byte-identisch (FAHRPLAN-FEDLEX-PORTFOLIO.md:47; FAHRPLAN-DATENHALTUNG §8).
2. **`check:paritaet` deckt heute NUR Bund-Normtext — das ist kein automatisches Sicherheitsnetz für neue Dateien** (Refutation-Treffer 2 + Vollständigkeits-Finding 3). Jedes Paket, das eine neue Projektionsdatei erzeugt (`currency.json`, `materialien/register.json`, `revisionen/*.json`), muss **entweder** `ingest.ts` + `check-paritaet.ts` additiv um seinen Datei-Typ erweitern (mit eigenem Roundtrip-Nachweis) **oder** eine explizite **„noch-nicht-in-DB"-Allowlist** führen, sodass eine ungedeckte neue Datei **rot** statt still-grün ist. „`check:paritaet` deckt automatisch mit" ist als Behauptung **verboten**.
3. **Serialisierungs-Vertrag ist der echte Paritäts-Hebel** (Refutation-Treffer bei Paket 1): Der Blob-Roundtrip ist strukturagnostisch — eine neue Block-Form roundtrippt byte-gleich. Bruch entsteht nur, wenn (a) der Generator Key-Reihenfolge/Whitespace/Trailing-Newline ändert (`projektion` erzwingt `JSON.stringify(obj,null,2)` ohne Trailing-Newline) oder (b) eine Datei ein **drittes Top-Level-Feld** neben `erzeugt`/`eintraege` bekommt (würde still gedroppt). Wer eine neue Datei ins Ingest zieht, hält exakt diesen Vertrag ein.
4. **Schema-Rückkopplung Pflicht** (Vollständigkeits-Finding 17): Neue Spalten (Paket 3: `vern_status`, `frist_start/ende`, `proj_eli`) und neue Tabellen (Paket 5: `erlass_revisionen`) sind **Änderungen am FAHRPLAN-DATENHALTUNG-Schema**. Jedes Paket, das solche definiert, trägt sie in denselben Commit als Notiz in `FAHRPLAN-DATENHALTUNG.md §3` zurück (E6b-Koordination), damit E6 nicht ein zweites, divergierendes Schema baut.
5. **Abstraktions-Schnittstelle im Generator:** Jeder neue Generator wird von Anfang an **zweigeteilt** geschnitten — reine `extrahiere()`/`parse()`-Funktion (Roh → normalisierte Datensätze, deterministisch, injizierbare `fetchImpl`) getrennt von `schreibe()` (Sidecar/Register-Writer). Beim E1-Flip wird nur `schreibe()` auf DB-Insert umgehängt. **Kein** `Date.now()` in der Logik (§2): `--datum=$(date +%F)` aus der Shell.

---

## 0c. Gemeinsame Bausteine (wiederverwendbar über alle Pakete) — Opus-Bauplan

Wiederverwenden statt neu bauen (§1 CLAUDE.md: lieber Duplikat behalten als falsche Abstraktion — aber **verhaltensneutrale** Mechanik wird geteilt):

**Fetch/Cache/Retry**
- `scripts/normtext/netz-retry.ts` → `fetchMitWiederholung()`: Timeout+Backoff-Hülle, **deterministisch** (kein `Math.random`), injizierbare `fetchImpl`/`warte` (testbar), Retry bei 429/5xx/Netzwurf. **Alle SPARQL-POSTs laufen darüber.**
- `scripts/fedlex-cache.sh` (406 Z., `npm run check:caches`): Basis-URL `https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli`; Array `EINTRAEGE` = `name|eli|kons(YYYYMMDD)|html-N|pflicht-anker|SR`. Re-Pin-Historie als Kommentare (§7-Nachverifikation).
- **store-raw (Reproduzierbarkeit §11):** jede SPARQL-Rohantwort nach `bibliothek/materialien/<typ>-raw/<SR>.json` bzw. `bibliothek/normtext/revisionen-raw/<KEY>.json` — Parser-Bug ⇒ **Re-Parse aus Raw, nie Re-Crawl**.
- **Globales Rate-Budget** (Vollständigkeits-Finding 20): `check:netz` bündelt künftig `fedlex-versionen` + `botschaften-netz` + `revisionen-netz` + `vernehmlassungen-netz`, jeder mit 218-SR-Läufen gegen **denselben amtlichen Endpunkt**. Gemeinsame **sequenzielle/klein-batchende** Drossel (VALUES-Batch à ~60 wie Gap-Report; keine paketübergreifende Parallelität) in `netz-retry.ts` als geteilte `mitDrossel()`-Hülle. Höflichkeit + eigene Timeouts.

**SPARQL-Endpunkt (einzige Materialien-/Currency-Quelle)**
- `https://fedlex.data.admin.ch/sparqlendpoint` — POST, `Content-Type: application/x-www-form-urlencoded`, `Accept: application/sparql-results+json`. Mechanik verbindlich aus `scripts/fedlex-versionen-pruefen.ts` (VALUES-Batch, typisierter `skos:notation`-Join).
- **Zwei belegte Fallen, immer beachten:** (i) `skos:notation` MUSS typisiert sein (`"235.1"^^<https://fedlex.data.admin.ch/vocabulary/notation-type/id-systematique>`), sonst Endpunkt-**Timeout**; (ii) **keine UNION-Queries** für Coverage-Läufe (bekannte ~700-statt-alle-Falle) — VALUES-Batching, Ergebnis gegen bekannte Gesamtzahl plausibilisieren (218 Volltext-Erlasse / 229 Bund-Erlasse Gap-Report).

**ID-Auflösung ELI / Geschäfts-Nr / SR**
- `scripts/fedlex-eli-aufloesen.ts` (SR→ELI, geltend = grösste `dateApplicability` ≤ heute, gibt fertige `cache.sh`-Zeilen aus).
- `scripts/fedlex-pins.ts` `lesePins()` = **SSoT** (parst `cache.sh`, keine zweite SR-Liste). **P1-b fixt hier zuerst die Regex** (`[a-z0-9_]+`, §Paket 1) — bis dahin ist jede Pin-basierte Zählung über Ziffern-Namen blind.
- Erlass-Grundmenge = `ERLASS_REGISTER` / `public/normtext/register.json` mit `ebene==='bund' && status==='snapshot'` (218 Erlasse, alle mit `sr`).

**Currency-Sonde**
- `scripts/fedlex-versionen-pruefen.ts` (`npm run check:fedlex-versionen`): `?c jolux:isMemberOf <abstract> ; jolux:dateApplicability ?date`, geltend = `max(date ≤ heute)`, künftig = `min(date > heute)`. Exit 0 OK/HINWEIS · 1 ÜBERHOLT · 2 Netzfehler. **Currency-Arbiter für alle Snapshot-/PDF-Erlasse.**

**Verifikations-Tore (Bestand, `scripts/normtext/` + Composite `check`)**
- `check:vollstaendigkeit` (jedes `art_*`-Token braucht Snapshot; Kanton-Zitat-Abdeckung; Inhalts-Sanity; Manifest), `check:normtext`/`-netz` (Drift Fassungstoken vs. cache.sh; Pflicht-Anker; Kanton `--netz`), `check:confidence` (Quarantäne < Schwelle), `check:struktur-konsistenz`, `check:tabellen`, `check:bilder`, `check:pdf`/`-netz`, `check:invarianten`, `check:entscheide`, `check:caches`, `check:verfall`.
- `scripts/check-gegenpruefung.ts` + `scripts/gegenpruefung/kern.ts`: Diff-basiertes Gate. **Risiko-Globs heute:** `scripts/normtext/`, `src/lib/normtext/`, `public/normtext/*.json`, `scripts/**/*check*`. **Bekannte Löcher, die Pakete schliessen müssen:** kein `scripts/materialien/`, kein `public/materialien/`, kein `scripts/`-root. → **Jedes materialien-schreibende Paket erweitert `istRisikoPfad()` und testet die Rot-Auslösung positiv** (DoD-Pflicht, sonst ist `check:gegenpruefung` ein No-Op).

**Neue geteilte Helfer, die dieses Portfolio einführt**
- `sparqlBatch(query, valuesListe, fetchImpl)` — aus `fedlex-versionen-pruefen.ts` extrahiert (verhaltensneutral, §1), von Paket 1/2/3/5 genutzt.
- `shaEintrag()` / `KEY_UNSICHER`-Regex — aus `src/lib/materialien/register.ts` (Key-Sicherheit + Drift-Token).
- **§8-Status-Marker-Baustein** (Design-Token-konform): einheitlicher „maschinell aus dem amtlichen Fedlex-Graphen zugeordnet; massgeblich bleibt die amtliche Quelle" + Reichweiten-Hinweis + Fetch-**Fehler**-Zustand (≠ Leerzustand, Finding 15).

---

## 0d. Moat-Hebel (die 2–3 Verknüpfungen, die den Burggraben vertiefen) — Opus-Bauplan

*(= Verzahnungs-Rückgrat der ROADMAP-Produktvision; Code-Bestand `FAHRPLAN-DATENHALTUNG.md` §0bis. Bewusst VOR den Paketen: Hebel 1 «Norm-Kontext-Bus statt fünf Silos» ist die Fedlex-Instanz des Verzahnungs-Rückgrats, das Organisationsprinzip vor den Paket-Details.)*

**Hebel 1 — Norm-Kontext-Bus statt fünf Silos (Bridge B1, teuerster Einzelgewinn).** Botschaft (Genese) + Revision (Änderung) + Entscheide (aus dem bereits vorhandenen Zitat-Graphen `norm_kanten`/`zitat_kanten`, ~11,9M/8,7M Kanten) + Rechner an **einer** norm-verankerten Stelle. `<KontextPanel typ="norm">` existiert und trägt schon Entscheide — Pakete 2/5/3 speisen dort ein, statt daneben zu stehen. Das kann weder Fedlex noch entscheidsuche noch ein Gratis-Verlag. Umsetzung: `botschaftenFuerNorm`/`revisionenFuerNorm`/`vernehmlassungenFuerNorm` in denselben Bus routen (kein neuer Datenbau — Graph liegt vor).

**Hebel 2 — Artikel-Ebene statt Erlass-Ebene.** Eine Botschaft/ein AS erklärt *bestimmte Artikel*. Pakete 2/5/3 führen ab jetzt `artAnker?` mit (grob, wo ableitbar) — die Datenstruktur wird **nicht** auf Erlass-Ebene zementiert, damit die artikelweise Entstehungs-/Änderungsgeschichte (wofür Verlage Geld nehmen, was Fedlex nicht bietet) inkrementell wachsen kann (W3·10).

**Hebel 3 — Verifikation als sichtbares Produkt (Freshness-SLA).** Paket 1 macht Currency zum dauerhaft maschinell bewiesenen Zustand (Coverage-Assertion, `check:fedlex-versionen` Exit 0, Regex-Fix gegen den Blindfleck). P1-d hebt das vom Minimal-Chip zum sichtbaren **„geltend geprüft am TT.MM. (maschinell)"** — eine verteidigbare Vertrauensaussage, die kein Wettbewerber macht (selbst Fedlex-Konsolidierung trailt die AS). Prominent, nicht Randnotiz.

**Anti-Moat-Warnung (Moat-Kritik):** Eine flache `nur-live-link`-Liste ist Commodity. Gegen Fedlex gewinnt nur **Aggregation + Verzahnung + Rechner**, nie das Nachbauen von Fedlex-Links; gegen entscheidsuche nur **Norm↔Urteil** (via Zitat-Graph, den B1 anzapft). Paket 4 verteidigt nichts → Backlog.

---

## Paket 1 — Gesetze-Currency & Coverage (P0)

> **✅ P1-a + P1-b AUSGEFÜHRT 5.7.2026 (Opus-Bau-Session; Branch `feat/fedlex-p1-ab`; Trailer `Roadmap: QS-CURRENCY`). PAKET 1 DAMIT KOMPLETT.**
> **P1-b (Monitoring dicht, zuerst):** Regex-Fix `fedlex-pins.ts` `[a-z_]+`→`[a-z0-9_]+` (die 11 Ziffern-Namen-Pins
> asylv1/2/3, argv1..5, bvv_2, bvv3, co2_gesetz waren parser-blind → jetzt 207→218 überwacht) + Parser-Selbsttest
> `src/tests/fedlex-pins.test.ts` (geparste Pins == cache.sh-Datenzeilen, Gegen-Regex). **Coverage-Assertion** in
> `check:normtext` (offline, `drift-logik.ts` `pruefeCoverage`/`fedlexEliAusUrl`): jeder Register-Eintrag bund/snapshot
> mit Fedlex-ELI braucht einen cache.sh-Pin, jedes pdf-embed einen PDF_EMBED_QUELLEN-Eintrag — rot bei jedem künftigen
> ungepinnten Volltext. **PDF-Embed-Pins ins Monitoring:** `fedlex-versionen-pruefen.ts` merged `lesePdfEmbedPins()`
> (EMRK/NYÜ) in dieselbe SPARQL-Currency-Prüfung; `lesePins()`-Signatur unverändert.
> **P1-a (Datenlauf):** die echten 18 überholten Snapshots (Stand 5.7.: kvg kvv svg rpg klv vrv ssv rpv vts mepv bpv vil
> fdv → 20260701; argv2 → 20260201; asylv1/2/3 icao → 20260612) neu gepinnt (html-N SPARQL-kanonisch via
> `jolux:isExemplifiedBy` — klv/vrv=8, **ssv=14** ausserhalb der 1–5-Fallback-Heuristik; Filestore-Inhalts-Sonde
> Anker+SR + SPARQL deckungsgleich) und gezielt re-extrahiert (`--nur=bund --erlass=…`). Artikel-Diff: **+85 neue
> Artikel, 9 eId-Renames/Bereichs-Regroups 1:1 belegt, 0 echter Verlust** (SVG disp_u2_art_108→108; VRV/RPV Annex-Reorg;
> ASYLV2-Bereiche; VIL 27bbis = reale swisstopo-Änderung). VRV-«99 geändert» ≈ Soft-Hyphen-Bereinigung der N=8-Fassung
> (kein Sachinhalt). **2 PDF-Embeds:** EMRK 20050323→20220916 (kanonische pdf-a trägt Suffix `-2`; suffixlos = ÄLTERER
> Re-Issue → neues Feld `pdfSuffix` in `pdf-embed.ts`), NYÜ 20200207→20260506. `check:fedlex-versionen` **Exit 0 (0 stale,
> beide Pin-Quellen)**. **Zwei Mechanik-Bugs, die der Lauf aufdeckte:** (1) Golden-`--erlass`-Merge behielt die ALTEN
> Keys der regenerierten Erlasse → 9 Phantom-Golden-Keys; jetzt werden nur die regenerierten Erlasse verworfen + frisch
> ersetzt. (2) `check:pdf --netz`-Currency: notation-Join × `LIMIT 300` = Partial-Result-Falle (EMRK geltend fälschlich
> 20050323) → ELI-ConsolidationAbstract-Query. ASYLV2 art_41 Formel-`<dl>` («[tab]», Content erhalten) als Expected-Fail
> registriert. **P1-d-Refresh:** `gen:fedlex-wiedervorlage` neu gelaufen → die 18 tragen jetzt den geprüft-Chip
> (currency.json 200→218). Alle Tore grün, engine golden 201 byte-gleich. Gegenprüfung **bestanden** (unabhängiger
> Opus-Adversarial gegen Fedlex-SPARQL+Filestore). Beleg: `bibliothek/register/fedlex-currency-2026-07-05.md`.
>
> **✅ P1-c + P1-d AUSGEFÜHRT 4.7.2026 (Opus-Bau-Session; Branch `feat/fedlex-p1-cd`; Trailer `Roadmap: QS-CURRENCY`).**
> Neu: geteilter SPARQL-Helfer `scripts/fedlex-sparql.ts` (`sparqlBatch`, injizierbare fetchImpl) + Generator
> `scripts/fedlex-wiedervorlage-generieren.ts` (`npm run gen:fedlex-wiedervorlage -- --datum=…`), getrieben aus der
> **Register-Grundmenge** (`register.json`, ebene=bund & status=snapshot = 218; NICHT `lesePins()`, dessen Regex 11
> Ziffern-Pins verfehlt). **P1-c:** 56 künftige Konsolidierungen (`dateApplicability` > Laufdatum) als datierter
> AUTO-Block (`<!-- AUTO fedlex-wiedervorlage -->`, 5-Spalten-Grammatik, idempotent) in `parameter-verfall.md`;
> `gen:verfall` nachgezogen (69 terminierte Einträge), `check:verfall`/`-ui` grün. **P1-d:** Sidecar
> `public/normtext/currency.json` ({key:{geprueftAm, naechsteFassungAb?}}), zwei Chips «geltend geprüft am … (maschinell)»
> + «nächste Fassung ab …» in der **geteilten** `ErlassLeserKopf` (G2b — beide Panes) UND im prerenderten SEO-Kopf
> (`erlassVolltextHtml`, CLS 0). **§8-Härtung (Abweichung vom Wortlaut):** «geltend geprüft» wird NUR für Erlasse
> geschrieben, deren Pin == geltende Fassung ist — überholte erhalten keinen falschen Freshness-Chip. `currency.json`
> in `ingest.ts`-Paritätsklasse aufgenommen; `istRisikoPfad()` um `scripts/fedlex-*` erweitert (Rot-Auslösung positiv
> getestet). Gegenprüfung **bestanden** (10 Stichproben OR/ZGB/STGB/KVV/AHVG/BVV_2/CISG/KRK/VIL/ASYLV1 unabhängig gegen
> Fedlex-SPARQL, 2 Filestore-Proben). golden byte-gleich, `check:paritaet`/`datenhaltung`/`normtext`/`smoke` + e2e grün.
>
> **⚠ KORREKTUR: P1-a + P1-b sind NICHT gemergt.** Der Ausführungsvermerk unten (PR #117, docs-only) beschreibt Arbeit
> aus **PR #103 — die CLOSED (nicht merged) wurde**: Regex-Fix, `sparqlBatch`, Coverage-Assertion, PDF-Embed-Merge und
> die 20-Erlass-Aktualisierung fehlen in `main`. Empirisch 4.7.: `fedlex-pins.ts` Regex weiter `[a-z_]+`; kein
> `fedlex-currency-2026-07-03.md`; **`check:fedlex-versionen` rot — 18 Pins überholt** (der register-getriebene P1-c-Lauf
> sieht 18, `check:fedlex-versionen` via `lesePins` nur 14 — die 4 zusätzlichen ASYLV1/2/3+ARGV2 sind exakt das
> parser-blinde Ziffern-Loch). **P1-a/P1-b bleiben OFFEN** (nächste Bau-Einheit, eigener Risiko-/Golden-Pfad; nicht mit
> P1-c/d gebündelt, §14.2). Der folgende «✅ P1-a + P1-b»-Block ist daher als **Plan**, nicht als Ist-Stand zu lesen:
>
> **P1-a + P1-b (Plan; PR #103 geschlossen, siehe Korrektur oben):**
> Frischer Ist-Befund 3.7. == Gap-Report (18 stale Pins + EMRK/NYÜ). **P1-b:** Regex-Fix `fedlex-pins.ts` `[a-z0-9_]+`
> (207→**218** überwachte Pins; die 11 «ohne Pin» waren in Wahrheit parser-blinde Ziffern-Pins — Kritik-Korrektur bestätigt)
> + Parser-Selbsttest `src/tests/fedlex-pins.test.ts` + **Pin-Coverage-Assertion** in `check:normtext` (negativ rot-getestet)
> + **`check:pdf-netz`-Fix** (notation-Join × LIMIT 300 = Partial-Result-Falle; EMRK-Pin 20050323 bestand fälschlich grün —
> jetzt ELI-Abstract-Query) + Gegenprüfungs-Glob `scripts/fedlex-*` + Tests. **P1-a:** alle 18 Snapshots + 2 PDF-Embeds
> (EMRK→20220916 **pdf-a-Suffix `-2` kanonisch**, NYÜ→20260506) auf die geltende Konsolidierung; html-N je Erlass via
> `jolux:isExemplifiedBy` (klv=8/vrv=8/**ssv=14** ausserhalb Fallback -1..-5!); Artikel-Diff je Erlass **ohne Verlust**
> (+81 neue Artikel, eId-Reshuffles asylv2/svg/vil/vrv/rpv dokumentiert); 54/54 Wortlaut-Stichproben; alle Tore grün,
> golden byte-gleich; Gegenprüfung 3+1 Opus-Agents. **Bonus aus der Gegenprüfung (F2):** Extraktor-Ordinalia auf
> sexies…decies erweitert — heilt 2 STILL GEDROPPTE Absätze VSTG art_5 (1sexies/1septies) + BPV/ELG/VZAE-Labels +
> HMG/FINMA_GEBV-Marker (5 Zusatz-Erlasse, quell-verifiziert). Beleg: `bibliothek/register/fedlex-currency-2026-07-03.md`.
> **OFFEN: P1-c** (Wiedervorlage-Generator für die 56 künftigen Fassungen) **+ P1-d** (Currency-Chips/`currency.json`) —
> beide unten spezifiziert, nächste Session.

**Ziel:** Kein Erlass wird veraltet ausgeliefert, und keine Currency-Lücke bleibt strukturell unsichtbar. **Nicht-Ziel:** neue Erlasse aufnehmen (Coverage ist laut Report vollständig — 218/229 Volltext, 11 bewusste Stubs).

**Grundlage:** `bibliothek/register/fedlex-gap-report-2026-07-02.md` (bereits erhoben). Drei Befund-Klassen → drei Arbeitsschritte:

### P1-a · Die 20 stale Erlasse aktualisieren (Datenlauf)
- **14 gepinnt-überholt** (RPG, SVG, VRV, SSV, VTS, KVG, KVV, KLV, BPV, RPV, VIL, FDV, MepV, ICAO-Übk. 0.748.0): in `scripts/fedlex-cache.sh` den Konsolidierungs-Stand auf die geltende Fassung (meist `20260701`) neu pinnen, **Anker/Wortlaute neu verifizieren** (§7), dann `npm run normtext -- --datum=$(date +%F)` regenerieren.
- **6 blinde Flecken** (AsylV 1/2/3 = SR 142.311/312/314, ArGV 2 = 822.112, EMRK 0.101, NYÜ 0.277.12): dieselbe Aktualisierung; die 2 PDF-Embeds (EMRK/NYÜ) über `scripts/normtext/pdf-fetch.ts` (neuer `kons`-Wert in `src/lib/normtext/pdf-embed.ts` → `PDF_EMBED_QUELLEN`).
- **Vor** jeder Re-Extraktion: Artikel-Diff («neuere Fassung» ≠ «für uns relevante Artikel geändert»). Golden byte-gleich für unveränderte Teile; verhaltensändernde Text-Änderung ist erwartet und wird als solche gegated.

### P1-b · Monitoring-Lücke schliessen (Tor-Härtung — der eigentliche Hebel)
Der Cron `check:fedlex-versionen` sieht **nur gepinnte** ELIs (`scripts/fedlex-pins.ts` parst `fedlex-cache.sh`). **11 Volltexte ohne Pin** (AsylV 1/2/3, CO2-Gesetz, BVV 2, ArGV 1–5) sind strukturell unsichtbar.
- **Fix:** alle 11 in `fedlex-cache.sh` pinnen (Format `name|eli|YYYYMMDD|html-N|anker|sr`).
- **Zusätzliche Absicherung (empfohlen):** eine **Coverage-Assertion** im Tor — «jeder `snapshot`-Bund-Erlass mit ELI-`quelleUrl` hat einen Pin». So kann künftig kein Volltext ohne Pin durchrutschen. Das ist der dauerhafte Wächter, nicht der Einmal-Lauf.

### P1-c · 56 künftige Fassungen als Wiedervorlage (Verfallsregister)
Fedlex hat 56 future-dated Konsolidierungen im Triplestore (z. B. OR ab 2026-10-01, StGB ab 2026-10-01) — **kein Fehler, sondern Re-Extraktions-Horizont**.
- **Fix:** je Erlass das nächste In-Kraft-Datum > heute als **Verfallsregister-Eintrag** (§11 Pflegebedarf) andocken an das bestehende Drift-/Verfall-System (`scripts/verfall-*.ts`, `check:verfall`). Mehrwert = datierte Wiedervorlage statt flüchtiger Warnung.

**Betroffene Dateien:** `scripts/fedlex-cache.sh` · `scripts/fedlex-pins.ts` · `scripts/fedlex-versionen-pruefen.ts` · `src/lib/normtext/pdf-embed.ts` · `scripts/normtext/pdf-fetch.ts` · `public/normtext/bund/*.json` (regeneriert) · `public/normtext/register.json` (regeneriert) · Verfallsregister. **QS-DATA-Kopplung:** sobald der Generator-Flip (E1, `FAHRPLAN-DATENHALTUNG.md`) vollzogen ist, schreibt der Currency-Lauf in das DB-Artefakt; `public/normtext/` bleibt byte-gleiche Projektion (`check:paritaet`) — Paket 1 baut keinen zweiten Pfad.

**Tore:** bestehend `check:normtext`, `check:normtext-netz`, `check:fedlex-versionen`, `check:tabellen`, `check:invarianten`, `golden:vergleich`; **neu** die Coverage-Assertion. **Gegenprüfung (Risiko-Pfad):** adversarialer Zweitpass je re-extrahiertem Erlass gegen die Filestore-HTML-Quelle — die teuersten Bugs (Tabellen-Drop, Footnote-Leak, `bis`/`ter`-Verlust) sassen real hier.

**Aufwand grob:** P1-a ~1 Datenlauf-Session (Artikel-Diff je Erlass = Zeitfresser) · P1-b ~0,5 Session · P1-c ~0,5 Session. **Gesamt M.**

**§14-Intake:** neuer Querschnitt **`QS-CURRENCY`** im Querschnitt-Band der `ROADMAP.md` (begleitende Korpus-Pflege). Kein 26×-Bezug. **Trailer:** `Roadmap: QS-CURRENCY` + `Gegenpruefung: …`.

### Opus-Härtung (adversarial geprüft, 2.7.)

**Paket 1 — Gesetze-Currency & Coverage (QS-CURRENCY, P0)**

**Ziel.** Kein Bund-Erlass wird veraltet ausgeliefert; keine Currency-Lücke bleibt strukturell unsichtbar. Heute verletzt: 20 stale Erlasse live + **ein parser-blindes Monitoring-Loch** + 56 künftige Fassungen ohne Wiedervorlage. Moat = Verifikations-Prozess (Asset C) wird dauerhaft maschinell bewiesen. **Nicht-Ziel:** neue Erlasse (Coverage vollständig: 218/229 Volltext, 11 bewusste Stubs).

**Kritik-Korrektur (Refutation-Treffer, in Repo bestätigt): Die Prämisse „11 Volltexte OHNE Pin" ist sachlich falsch.** `asylv1/2/3`, `argv1..5`, `bvv_2`, `bvv3`, `co2_gesetz` sind **bereits in `fedlex-cache.sh` gepinnt** — aber mit Ziffern-Namen, die die Parser-Regex `([a-z_]+)` in `fedlex-pins.ts:19` **nicht matcht**. Sie *sehen überwacht aus, sind es aber nicht* — schlimmer als ungepinnt. Der Regex-Fix ist damit **kein theoretischer Hinweis, sondern die dringlichste Einzelmassnahme des ganzen Portfolios**.

**Quelle+Endpunkt.** Ausschliesslich amtlich: SPARQL `fedlex.data.admin.ch/sparqlendpoint` (Currency-Query wie `fedlex-versionen-pruefen.ts:30-35`) + Filestore-HTML via `fedlex-cache.sh`; PDF/A via `pdfaUrl()` (`src/lib/normtext/pdf-embed.ts:52-54`). Nie `droid-f/fedlex`.

**Extraktion — Bau-Reihenfolge P1-b → P1-a → P1-c → P1-d** (erst Monitoring dichtmachen, dann Datenlauf über vollständige Pin-Basis).

*P1-b · Monitoring-Lücke (der dauerhafte Hebel):*
1. **Regex-Fix ZUERST:** `fedlex-pins.ts:19` Namensgruppe `([a-z_]+)` → `([a-z0-9_]+)` (ELI-Gruppe erlaubt Ziffern bereits). **+ Selbsttest im Parser/Tor:** Anzahl geparster Pins == Anzahl `"…|…|YYYYMMDD|"`-Zeilen in `cache.sh` (verifiziert: 218 Zeilen). Unit-Test in `src/tests/`. Ohne diesen Fix läuft P1-a über eine parser-blinde Basis.
2. **11 fehlende Volltexte prüfen/pinnen:** Nach dem Regex-Fix erneut `check:fedlex-versionen` fahren — die 13+ Ziffern-Pins werden erstmals *gesehen*; verbleibende echt-ungepinnte Volltexte (falls nach Regex-Fix noch welche) via `fedlex-eli-aufloesen.ts` nachpinnen (2–4 Pflicht-Anker empirisch am HTML verifizieren, `kons` = Bautag-geltend).
3. **Coverage-Assertion (neues dauerhaftes Tor-Stück):** in `check-drift.ts` (offline-Teil `check:normtext`): jeder Register-Eintrag `ebene=='bund' && status=='snapshot'` mit Fedlex-ELI-`quelleUrl` hat einen Pin; jeder `status=='pdf-embed'` einen `PDF_EMBED_QUELLEN`-Eintrag. Rot bei jedem künftigen ungepinnten Volltext. (`nur-live-link` + Nicht-Fedlex/EU-VO ausgenommen.)
4. **PDF-Embeds ins Versions-Monitoring:** `fedlex-versionen-pruefen.ts` prüft heute nur `lesePins()` — EMRK/NYÜ strukturell blind. Additiv zweite Quelle `lesePdfEmbedPins()` aus `PDF_EMBED_QUELLEN` (`pdf-embed.ts:31`, trägt `eli`+`kons`) in die geprüfte Liste mergen; `lesePins()`-Signatur unverändert (auch vom Gegenprüfungs-Tor genutzt).

*P1-a · 20 stale Erlasse aktualisieren (Datenlauf):*
- **18 Snapshots** (14 gepinnt-überholt: RPG, RPV, SVG, VRV, SSV, VTS, KVG, KVV, KLV, BPV, VIL, FDV, MepV, ICAO-Übk 0.748.0; 4 blinde Flecken: AsylV 1/2/3, ArGV 2): je Erlass neu pinnen (frisch erhobene geltende Konsolidierung, **html-N empirisch sondieren** — OR-Falle: `n=0` UND `n=1` können echtes HTML liefern, `n=0` stale), dann regenerieren via `npm run normtext -- --datum=$(date +%F)`, gescoped auf betroffene Keys [Flag `--nur=` zu verifizieren durch Opus in `scripts/normtext-snapshot.ts`].
- **Vor jeder Re-Extraktion Artikel-Diff:** „neuere Fassung" ≠ „relevante Artikel geändert". Alte + neue HTML laden, `art_*`-Inventar + per-Artikel-Inhalt diffen; Befund als Re-Pin-Kommentar in `cache.sh` (§7-Konvention) + §11-Notiz.
- **2 PDF-Embeds** (EMRK 0.101 → geltend 2022-09-16; NYÜ 0.277.12 → geltend 2026-05-06): neuen `kons` in `PDF_EMBED_QUELLEN`, Refetch via `pdf-fetch.ts`; **Probe-Fetch vor Pin**, ob PDF/A unter neuem `kons` existiert [zu verifizieren durch Opus]; wenn nicht: Fallback dokumentieren, Status ehrlich (§8).
- Golden: unveränderte Erlasse byte-gleich; die 20 Text-Änderungen sind **deklarierte fachliche Änderung**, so committen und gaten.

*P1-c · 56 künftige Fassungen als datierte Wiedervorlage:* Andocken an Verfall-System (`scripts/verfall-parse.ts`, `check:verfall`), SSoT `bibliothek/register/parameter-verfall.md`. Neues `scripts/fedlex-wiedervorlage-generieren.ts`: fragt je Bund-Erlass die **nächste** künftige Konsolidierung > `--datum` (geteilte `sparqlBatch`-Funktion, §2) und schreibt einen **markierten Auto-Block** (`<!-- AUTO fedlex-wiedervorlage --> … <!-- /AUTO -->`) in der bestehenden 5-Spalten-Grammatik. Idempotent (Block ersetzen, nie appenden; Sortierung Datum→SR). npm `gen:fedlex-wiedervorlage` (netz). `check:verfall` liest offline mit; fällige Einträge = automatisch rot.
- **Kritik-Korrektur (Finding 16):** Diese 56 künftigen Daten sind zugleich die `gueltig_bis`-Grenzen für den späteren `erlass_fassungen`-Flip (`gueltig_bis` = Datum der nächsten Fassung). Join-Abhängigkeit im Code als E1-Flip-Notiz dokumentieren.

*P1-d · Currency als sichtbares Produkt (Moat-Hebel 3, aufgewertet):* Kein „stale"-Badge (stale darf nie deployen — das erzwingen die Tore). Stattdessen (§8-ehrlich) **zwei** Chips neben Stand-Chip + Live-Link-Chip:
- **„geltend geprüft am TT.MM.YYYY (maschinell)"** — der sichtbare Freshness-Beweis (Moat-Asset C wird Produkt, nicht Randnotiz). Datum = letzter grüner `check:fedlex-versionen`-Lauf.
- **„Fassung ab TT.MM.YYYY angekündigt"** — nur wenn künftige Konsolidierung bekannt.
- Datenfluss: derselbe P1-c-Generator schreibt Sidecar `public/normtext/currency.json` (`{erlassKey:{geprueftAm, naechsteFassungAb?}}`, nur Zukunfts-/Prüf-Daten zum Generierungsdatum → keine Datums-Logik im Client). **Beide** Leser-Instanzen (Haupt `inhalt.tsx:689-690` + Split-View-Pane `:877-879`).

**DB-Schema.** Kein neues Schema, kein DB-Layer. Regeneration über bestehenden Generator; `check:paritaet` muss grün bleiben — **aber** `currency.json` ist **neu und heute nicht im Ingest** → entweder `ingest.ts`/`check-paritaet.ts` um `typ='currency'` erweitern **oder** Allowlist-Eintrag (§1 Regel 2). Serialisierungs-Vertrag halten (§1 Regel 3). Späteres Mapping (nur einhalten, nichts bauen): Pin ≙ `erlass_fassungen`-Zeile, geltend = `gueltig_bis IS NULL`; SSoT der Pins bleibt `cache.sh` bis E1.

**UI-Andockung.** Meta-Leiste `inhalt.tsx:689/877` (beide Instanzen); optional über `meldeInhaltsKopf()` (`:240-246`) in den Shell-Kopf. `DESIGN-REGLEMENT-NORMTEXT.md` L0 (Chip nur in Meta-Leiste, nie im Wortlaut), CLAUDE.md §13 (Tokens, kein `text-red-*`), §15 (prerender-stabil / token-Mindesthöhe, CLS=0). Leerer Zustand ohne Chip, kein Fehlerzustand.

**Verifikations-Tor.** `check:fedlex-versionen` Exit 0 über cache.sh-Pins **und** PDF-Embed-Pins · Coverage-Assertion grün · Pins-Parser-Selbsttest grün · `check:normtext`/`caches`/`vollstaendigkeit`/`struktur-konsistenz`/`tabellen`/`invarianten`/`bilder` grün · `check:verfall` (56 terminiert, keiner fällig) · `check:paritaet` grün inkl. `currency.json`-Deckung · `golden:vergleich` byte-gleich ausser den 20. **Gegenprüfung (Skill `gegenpruefung`, Pflicht):** adversarialer Zweitpass je re-extrahiertem Erlass — (a) Artikel-Inventar alt/neu vollständig (kein `art_*` verloren, `bis`/`ter` intakt), (b) Tabellen-Drop/Footnote-Leak, (c) ≥3 geänderte + ≥3 unveränderte Artikel wortlaut-verglichen, (d) html-N-Wahl SPARQL-belegt, (e) 56 Wiedervorlage-Daten stichprobenweise. **Kritik-Korrektur:** Gegenprüfungs-Glob `istRisikoPfad()` um `scripts/fedlex-*` (root) erweitern — sonst triggern reine `cache.sh`/`pins.ts`-Edits das Gate nicht. Jeder Pin: SPARQL-`dateApplicability` **und** Filestore-Inhalts-Probe müssen übereinstimmen. Dann `npm run gegenpruefung:ok`.

**Risiken.** Stille Extraktions-Regression (Tabellen-Drop/Leak/bis-ter) → Artikel-Diff + adversariale Gegenprüfung + Struktur-Tore. Parser-Regex frisst Ziffern-Namen still → Fix + Selbsttest + Coverage-Assertion (dreifach). html-N-Falle → Inhalts-Probe + SPARQL. Konsolidierung trailt AS (STALE-PENDING unerkennbar via `dateApplicability`) → ehrlich dokumentierte Grenze; RSS-OC-Überwachung ist Backlog, nicht P1-Scope. Paritäts-Risiko **präzise auf Serialisierung/Top-Level-Form** fassen, nicht auf Blockform (Refutation). Parallelbau QS-DATA E1 auf gleichen Dateien → §12-Worktree.

**Definition of Done.** (1) `check:fedlex-versionen` Exit 0 über beide Pin-Quellen; 20 stale tragen Bautag-Fassung mit frischem `stand`/`fassungsToken`/`sha`/`abgerufen`. (2) Regex-Fix + Selbsttest + Coverage-Assertion grün. (3) 56 Wiedervorlage-Einträge + beide Currency-Chips (beide Leser-Instanzen), Token-konform. (4) `npm run gate` + `check:netz` grün, `check:paritaet` inkl. `currency.json`. (5) Gegenprüfung bestanden + quittiert, Re-Pin-Kommentare + §11-Ablage; Gegenprüfungs-Glob um `scripts/fedlex-*` erweitert und Rot-Auslösung positiv getestet. (6) §14-Intake `QS-CURRENCY` im Querschnitt-Band; STRUKTUR.md. **Push/Deploy nur auf Davids §9-Ja.**

**Aufwand: M** (P1-b ~0,5 · P1-a ~1 [Artikel-Diff = Zeitfresser] · P1-c ~0,5 · P1-d ~0,25 Session). **Abhängigkeiten:** blockiert von nichts, blockiert nichts; Paket 5 erbt die frischen Daten + `sparqlBatch`-Helfer.

**Betroffene Dateien:** `scripts/fedlex-cache.sh` · `scripts/fedlex-pins.ts` (Regex+Selbsttest) · `scripts/fedlex-versionen-pruefen.ts` (PDF-Embed-Merge, `sparqlBatch` extrahieren) · `scripts/normtext/check-drift.ts` (Coverage-Assertion) · `src/lib/normtext/pdf-embed.ts` · **neu** `scripts/fedlex-wiedervorlage-generieren.ts` · `bibliothek/register/parameter-verfall.md` (Auto-Block) · `public/normtext/bund/*.json` + `register.json` (regeneriert) · **neu** `public/normtext/currency.json` · `scripts/gegenpruefung/kern.ts` (Glob) · `scripts/datenhaltung/{ingest,check-paritaet}.ts` (currency-Typ/Allowlist) · `src/pages/gesetz-leser/inhalt.tsx` (:689/:877) · `package.json`.

---

## Paket 2 — Botschaften / Bundesblatt (P1, Vorzeige-Paket)

> **✅ AUSGEFÜHRT 10.7.2026 (Opus-Bau-Session; Branch `feat/fedlex-p2-botschaften`; Go David «go zu allem»; Trailer `Roadmap: W2·6`).**
> **POC live (Finding 5 erfüllt):** Reverse-Kette verifiziert, DSG→2 reproduziert (17.059+03.016); korpusweite Füllraten
> gemessen VOR dem Bau — **401 Botschaften** über die 218 Volltext-Erlasse, Datum 100 % · Titel DE/FR/IT je 100 % ·
> Curia 99,8 % · 27 Mantelerlasse · 97/218 Erlasse mit ≥1 Botschaft (Rest = Verordnungen ohne Botschaft, ehrlicher
> Leerzustand). **Performance-Härtung:** STRSTARTS (lexikalischer Präfix-Join, ~1,5 s/SR) durch die direkte Graph-Kante
> `?proj jolux:draftHasLegislativeTask ?event` ersetzt = **260× schneller** (Korpus 2,6 s), Ergebnismenge byte-gleich.
> **Determinismus-Fix:** eine Botschaft kann mehreren Projekt-Knoten zugeordnet sein (`fga/2016/467`→2 projs) → projEli/Curia
> deterministisch aus dem kleinsten proj (zwei Läufe byte-identisch).
> **Join-Felder (Finding 1, P0):** `projEli`/`ocUris`/`botschaftDate` persistiert → Paket 5 kann joinen. **i18n (Finding 10):**
> `titel_de/fr/it`. **Key (Finding 9):** `BOTSCHAFT-<jahr>-<fga-num>` (fga-intrinsisch, rebuild-fest, dedupe-korrekt — bewusste
> Abweichung vom `<KÜRZEL>`-Format, weil Kürzel bei Mantelerlassen instabil wäre; disclosed).
> **Speicher:** Botschaften NICHT im in-Bundle `MATERIAL_REGISTER` (§15), sondern build-zeitlich via `ALLE_MATERIALIEN` in die
> lazy `register.json`-Projektion gemerged (727 Materialien); `check:paritaet` deckt register.json bereits (byte-Roundtrip),
> `daten-manifest.json` nachgezogen. **Bridge B1 (Moat-Hebel 1):** «Entstehungsgeschichte»-Gruppe IM bestehenden `KontextPanel`
> (Norm-Kontext-Bus, alle 3 Instanzen), kein Silo — Genese neben Anwendung/Auslegung/Werkzeug an einer Stelle. Locale-Titel
> (Finding 10), fedlexLokalisiert-Link, Curia→parlament.ch (AffairId live verifiziert), Fetch-Fehler≠leer (Finding 15).
> **Neu/erweitert:** `scripts/materialien/botschaften-generieren(.ts/-run.ts)`, `check-botschaften-netz.ts`,
> `src/lib/materialien/{botschaften.generated.ts,botschaften.ts,typen.ts,register.ts}` (BehoerdeId `BR`, DoktypId `botschaft`),
> `material-manifest.ts`/`check-materialien.ts` (Botschaften kuratiert-äquivalent + Join-Feld-Integrität), `KontextPanel.tsx`,
> 2 Test-Dateien. **Tore grün:** tsc · lint (0 Fehler) · vitest (223 Dateien / 3636+14) · build (727 Material-Seiten) ·
> check:materialien · check:botschaften-netz (DSG→2) · check:paritaet · check:datenhaltung. Gegenprüfung-Glob deckt
> `scripts/materialien/**` + `public/materialien/*.json` bereits (Rot-Auslösung verifiziert). **Gegenprüfung bestanden**
> (unabhängiger Opus-Adversarial gegen Fedlex-SPARQL/fedlex/parlament). Beleg: `bibliothek/materialien/botschaften-2026-07-10.md`.
> **OFFEN (Nicht-Ziel P1):** kein Text-Snapshot (P2, geparkt bis nach 1.12.2026); Pre-2000 nur Live-Link.

### Ziel & Nicht-Ziel
**Ziel:** Auf jeder Bund-Gesetzesseite ein Abschnitt **«Entstehungsgeschichte»** mit den zugehörigen Botschaften des Bundesrats — Datum, Titel, Fedlex-Volltext-Link, Parlaments-/Curia-Nummer (→ parlament.ch). Kernwert = **automatische Verknüpfung Gesetz→Botschaft** über den Gesetzgebungs-Projekt-Graphen (kein Anbieter verzahnt Norm + Gesetzesgeschichte + Rechner an einer Stelle).

**Nicht-Ziel (P1):** kein eigener Text-Snapshot (Live-Link genügt); keine Botschaften zu Gesetzen ohne eigenen Volltext; keine Pre-2000-Botschaften (gescannte PDFs ohne Projekt-Link); keine Ratsdebatten (nur Deep-Link).

### P1-Umfang (scharf)
Nur Botschaften zu den **Bund-Erlassen mit Volltext-Snapshot** (`register.json`, `ebene==bund`, `status=='snapshot'` — 218 Erlasse, alle mit `sr`). Status **`nur-live-link`** (kein gehosteter Inhalt → kein §7-Extraktionsrisiko, keine Davids-Fachzeit → zeitsperre-konform). `normKeys` **automatisch** aus dem Taxonomie-Join.

### Phasen
- **P1 — Live-Link + Auto-Verknüpfung** (dieser Umfang): Pipeline + Register-Erweiterung + «Entstehungsgeschichte»-Abschnitt.
- **P2 (optional, später)** — Volltext-Snapshot einzelner Schlüssel-Botschaften: nur mit voller §7-Zitat-Ausnahme (a–d). Botschafts-HTML nutzt **dieselben CSS-Klassen** wie Fedlex-Gesetze → `scripts/normtext/extrahiere-fedlex.ts` wiederverwendbar. Braucht Davids Abnahme → **[D]**, geparkt bis nach 1.12.2026.
- **P3 (optional)** — UI-Ausbau: Filter nach Botschaftstyp, Curia-Verlauf, Zeitstrahl.

### Datenpipeline (konkret)
**Neues Skript:** `scripts/materialien/botschaften-generieren.ts` (Muster: `scripts/normtext/bund-stubs-generieren.ts`). Ausgabe: `src/lib/materialien/botschaften.generated.ts` (analog `bund-stubs.generated.ts`), gemerged ins `MATERIAL_REGISTER`. Nie von Hand editieren.

**Idempotenter Ablauf** `fetch → store-raw → parse → load`:
1. **Reverse-Query je Volltext-SR** (getestet):
   ```
   ?tax skos:notation "235.1"^^<.../notation-type/id-systematique>   # SR → Taxonomie (TYPISIERT! sonst Timeout)
   ?oc  jolux:classifiedByTaxonomyEntry ?tax ; jolux:legalResourceFamilyType <.../resource-family/oc>
   ?proj jolux:hasResultingLegalResource ?oc
   ?event jolux:legislativeTaskHasResultingLegalResource ?botschaft
   FILTER(STRSTARTS(STR(?event), STR(?proj)))
   ?botschaft jolux:typeDocument <.../resource-type/23>              # "Botschaft des Bundesrates"
   ```
   Kette geht **zwingend über `eli/oc`** (nicht `eli/cc`); `impactFromLegalResource` war Sackgasse. Batchen wie `fedlex-versionen-pruefen.ts` (VALUES-Liste), `--datum` aus Shell (§2, kein `Date.now`).
2. **Je Botschaft:** Datum, Titel, Curia-/Geschäftsnummer, Datei-URL via `jolux:isExemplifiedBy` (PDF/HTML/XML/DOCX; DE/FR/IT). Für P1 die HTML- oder PDF-Fedlex-URL als `quelleUrl`.
3. **store-raw:** SPARQL-Rohantwort je SR nach `bibliothek/materialien/botschaften-raw/<SR>.json` (Reproduzierbarkeit §11).
4. **load:** generierte Einträge deterministisch in `botschaften.generated.ts`.

**Feld-Mapping auf `MaterialRegistereintrag`:**
- `key` — stabil + URL-sicher, z. B. `BOTSCHAFT-DSG-17059` (Fallback ohne Curia: Datum). Muss `KEY_UNSICHER`-Regex bestehen.
- `behoerde` — **neuer `BehoerdeId` `'BR'`** (Bundesrat) in `typen.ts` + `BEHOERDEN` in `register.ts`.
- `doktyp` — **neuer `DoktypId` `'botschaft'`** (label «Botschaft») in `typen.ts` + `DOKTYPEN`.
- `titel` — amtlicher Botschafts-Titel aus SPARQL.
- `nummer` — Curia-/Geschäftsnummer (z. B. «17.059»); `null` wenn keine.
- `rechtsgebiet` — **geerbt vom verknüpften Erlass** (`ERLASS_REGISTER[normKey].rechtsgebiet`), nicht geraten (§2).
- `sprache` — `'de'`; FR/IT im `hinweis`.
- `status` — `'nur-live-link'` (P1-Zwang).
- `quelleUrl` — Fedlex-Botschafts-URL (HTML/PDF); Pflicht http(s), §7c.
- `stand` — Botschafts-Datum (ISO); Tor prüft «nicht in Zukunft».
- `rang` — Datum absteigend → jüngste Botschaft zuerst.
- `normKeys` — **automatisch** = Erlass-Keys, deren SR-Join diese Botschaft ergab (Mantelerlasse unter **jedem** betroffenen SR — Feature).
- `hinweis` — Provenienz/Ehrlichkeit («Automatisch über den Fedlex-Projekt-Graphen zugeordnet; maschinell, fachlich nicht geprüft.»).
- `sha` — `shaEintrag()`-Muster über die Identitätsfelder inkl. `normKeys` = Drift-/Currency-Token.

**`-N.pdf`-Mehrteiler:** für P1 (Live-Link) HTML-Fassung oder Sammel-PDF als `quelleUrl`, Mehrteiligkeit im `hinweis`.

### Betroffene Dateien
- **neu:** `scripts/materialien/botschaften-generieren.ts` · `src/lib/materialien/botschaften.generated.ts` · `bibliothek/materialien/botschaften-raw/*.json` · `bibliothek/materialien/botschaften-<datum>.md` (§11 + INDEX).
- **erweitert:** `src/lib/materialien/typen.ts` · `src/lib/materialien/register.ts` · `package.json` (Script `materialien:botschaften`) · `public/materialien/register.json` (regeneriert).
- **UI:** «Entstehungsgeschichte»-Abschnitt.

### UI / Design (§13)
**Andockpunkt:** `src/pages/gesetz-leser/inhalt.tsx` rendert bereits `<KontextPanel typ="norm" …/>` am Leseende (Z. 706/1041). **Empfohlen (A):** eigener Abschnitt **«Entstehungsgeschichte»** neben dem KontextPanel — semantisch getrennt von «Materialien, die auslegen» (Botschaften = Genese, nicht Auslegung); Auflösung `botschaftenFuerNorm(key)` (Filter `doktyp==='botschaft'`), Reihenfolge Datum absteigend. Alternative (B): weitere Gruppe im `KontextPanel` (billiger, aber vermischt Genese/Auslegung). Tokens statt Magic-Numbers (§13.1), Lesespalte `max-w-reading` (§13.2), Status-Marker «maschinell zugeordnet / amtliche Quelle massgeblich» (§8). DE-Link in P1; FR/IT im Hinweis.

### Verifikations-Tore & Gegenprüfung
- **Bestehend:** `check:materialien` prüft mit — key-Eindeutigkeit/URL-Sicherheit, `quelleUrl` http(s), `stand` ISO & nicht-zukünftig, `normKeys` ⊆ `ERLASS_REGISTER`, committetes `register.json` == frischer Build, P1-Status-Zwang.
- **Neu:** Botschaften-Netz-Tor (Reverse-Join-Drift, analog `check:fedlex-versionen`); Test für `botschaftenFuerNorm` (nur `botschaft`, Datum-absteigend). Ggf. Gegenprüfungs-Globs (`scripts/gegenpruefung/kern.ts`) um `scripts/materialien/**` + `public/materialien/*.json` erweitern.
- **Adversariale Gegenprüfung (Pflicht, §14/QS-GP):** unabhängiger Opus-Agent, Auftrag **widerlegen** — (a) gehört die Botschaft wirklich zum Gesetz? (Stichprobe ≥15 stratifiziert, gegen fedlex.admin.ch/parlament.ch); (b) falsch-positive Sammelerlasse; (c) Vollständigkeit an Referenzfällen (AVIG→11 1999–2023, DSG→17.059+2003); (d) Pre-2000-Ehrlichkeit (kein stummes «keine»). Dann `npm run gegenpruefung:ok`.

### Grenzen (ehrlich)
Automatische Zuordnung nur **~2000+**; ~6800 Botschaften total (P1 nur die zu 218 Volltext-Erlassen); frische Erlasse evtl. noch ohne Verknüpfung (Hinweis, nicht «keine»); Sammelerlasse unter jedem betroffenen SR (kennzeichnen).

**Aufwand grob:** Pipeline+Generator ~1 Session · Register/Typen + UI ~1 Session · Gegenprüfung + Tore ~0,5 Session. **Gesamt M–L.**

**§14-Intake:** ROADMAP-Schritt **W2·6** («Konsultieren-Klingen»), Unterpunkt «Entstehungsgeschichte / Botschaften», Detailquelle = dieser FAHRPLAN (bzw. ausgekoppelt `FAHRPLAN-MATERIALIEN-BOTSCHAFTEN.md`, verlinkt aus W2·6, damit **QS-PH** nicht rot). Kein 26×, kein Worktree. **Trailer:** `Roadmap: W2·6` + `Gegenpruefung: …`.

### Opus-Härtung (adversarial geprüft, 2.7.)

**Paket 2 — Botschaften / Projekt-Graph (W2·6, P1, Moat-Kern)**

**Ziel.** Je Bund-Gesetzesseite die zugehörigen **Botschaften des Bundesrats** (Datum, amtlicher Titel, Curia-/Geschäftsnummer, Fedlex-Live-Link), **automatisch** über den Projekt-Graphen verknüpft. Fundament für Paket 5 (Verzahnung) und Paket 3 (Generalisierung). **Nicht-Ziel (P1):** kein Text-Snapshot (`nur-live-link`, zeitsperre-konform); keine Botschaften zu Erlassen ohne Volltext; keine Pre-2000 (nur PDF-Scans ohne Projekt-Link — Lücke transparent); keine Ratsdebatten.

**Quelle+Endpunkt.** SPARQL, getestete Reverse-Kette (belegt AVIG→11, DSG→2; DSG=2 in Refutation live reproduziert):
```sparql
?tax skos:notation "235.1"^^<https://fedlex.data.admin.ch/vocabulary/notation-type/id-systematique> .  # TYPISIERT
?oc  jolux:classifiedByTaxonomyEntry ?tax ;
     jolux:legalResourceFamilyType <https://fedlex.data.admin.ch/vocabulary/resource-family/oc> .
?proj  jolux:hasResultingLegalResource ?oc .
?event jolux:legislativeTaskHasResultingLegalResource ?botschaft .
FILTER(STRSTARTS(STR(?event), STR(?proj)))
?botschaft jolux:typeDocument <https://fedlex.data.admin.ch/vocabulary/resource-type/23> .  # Botschaft des Bundesrates
```
Je Botschaft: Datum, Titel, Curia-/Geschäftsnummer, Datei-URLs via `jolux:isExemplifiedBy` (PDF/HTML/XML/DOCX; DE/FR/IT). **Kette zwingend über `eli/oc`, nicht `eli/cc`;** `impactFromLegalResource` ist belegte Sackgasse.

**Kritik-Korrekturen eingearbeitet:**
- **POC VOR Pipeline (Finding 5):** Die Prädikate für Datum/Titel/Curia-Nr. am Botschafts-Knoten sind unverifiziert und **sind der Inhalt jedes Eintrags**. `FILTER(STRSTARTS)` ist lexikalischer Präfix-Join — bei Legacy-URI-Schemata (Paket 3 belegt `6006`-Kodierung für Altjahre) kann er über-/untermatchen. **Opus misst korpusweit die Feld-Füllrate** (Datum/Titel/Curia über alle 218), nicht nur AVIG/DSG-Anekdoten, **bevor** der M–L-Aufwand freigegeben wird.
- **Artikel-Anker mitführen (Moat-Hebel 2):** Zusätzlich zu `normKeys` (Erlass) das Feld `artAnker?: string[]` (grobe `art_*`-Zuordnung, wo aus dem Graphen ableitbar) mitführen — nicht auf Erlass-Ebene zementieren. Auch leer zulässig; das Feld existiert, damit artikelweise Genese inkrementell wachsen kann (W3·10).
- **Join-Felder für Paket 5 persistieren (Finding 1, P0):** Paket 5 will `botschaft_key` über `?proj`/`botschaftDate` matchen — aber der Botschafts-Key `BOTSCHAFT-<KÜRZEL>-<CURIA>` enthält keins davon. **Paket 2 MUSS `projEli`/`ocUri` UND `botschaftDate` als Felder speichern**, sonst degradiert Paket 5 zwangsweise auf `botschaftKey=NULL` — die beworbene Verzahnung existiert dann nicht.
- **Trilingual (Finding 10):** `titel_de/fr/it` speichern (nicht nur DE + „FR/IT im Hinweis") — sonst bekommt der FR/IT-Leser deutschsprachige Abschnittsinhalte, Bruch der i18n-Zusage.

**Extraktion.** Neues `scripts/materialien/botschaften-generieren.ts` (Muster `bund-stubs-generieren.ts` + `sparqlBatch`). npm `materialien:botschaften`. Ablauf idempotent `fetch → store-raw (`bibliothek/materialien/botschaften-raw/<SR>.json`) → parse (deterministisch, Sortierung Datum absteigend, tie-break key) → load (`src/lib/materialien/botschaften.generated.ts`, „generiert, nie von Hand" → `MATERIAL_REGISTER` → `npm run materialien` regeneriert `public/materialien/register.json`)`. §11-Recherche-Ablage + INDEX. Extraktion/Writer getrennt (§1 Regel 5).

**DB-Schema.** `MaterialRegistereintrag` (`src/lib/materialien/typen.ts`) additiv:

| Feld | Wert |
|---|---|
| `key` | `BOTSCHAFT-<KÜRZEL>-<CURIA ohne Punkt>` (z.B. `BOTSCHAFT-DSG-17059`); Fallback Datum. `KEY_UNSICHER`-fest. |
| `behoerde` | neuer `BehoerdeId 'BR'` (Bundesrat) in `typen.ts` + `BEHOERDEN` |
| `doktyp` | neuer `DoktypId 'botschaft'` in `typen.ts` + `DOKTYPEN` |
| `titel_de/fr/it` | amtliche Titel je Sprache (nie umformulieren, §1) |
| `nummer` | Curia-/Geschäftsnummer; fehlt → weglassen |
| `rechtsgebiet` | **geerbt** aus `ERLASS_REGISTER[normKey]` (nicht raten, §2); bei mehreren normKeys primärer SR, Regel dokumentiert |
| `status` | `'nur-live-link'` (P1-Zwang) |
| `quelleUrl` | Fedlex-Botschafts-URL (HTML bevorzugt, sonst Sammel-PDF); Pflicht http(s) §7c |
| `stand` | Botschafts-Datum ISO (Tor: nicht in Zukunft) |
| `normKeys` | automatisch aus SR-Join (Mantelerlass → mehrere) |
| `artAnker?` | grobe `art_*`-Zuordnung (Moat-Hebel 2) |
| `projEli` / `ocUri` / `botschaftDate` | **für Paket-5-Join** (Finding 1) |
| `hinweis` | „Automatisch über den Fedlex-Projekt-Graphen zugeordnet; maschinell, fachlich nicht geprüft." + Mehrteiler |
| `sha` | `shaEintrag()` über Identitätsfelder **inkl. `normKeys`** (Drift-Token) |

**DB-Andockung ist BAU-SCHRITT, nicht „deckt automatisch" (Refutation-Treffer 2):** `ingest.ts` liest heute nur `normtext-bund`; Materialien sind **nicht** im Roundtrip. Also **explizit bauen:** `ingest.ts` um `ingestMaterialien()` erweitern (`public/materialien/register.json` als `datei(typ='materialien')` + je `BrowseMaterial` eine `eintrag`-Zeile, `id=key`, `blob`=Eintrags-Struktur, Reihenfolge=Manifest); `check-paritaet.ts` deckt `typ='materialien'` mit (Roundtrip byte-gleich). Serialisierungs-Vertrag (§1 Regel 3). **Nicht** die volle `materialien(…)`-Zieltabelle vorbauen (kommt mit E6b) — Blob-Roundtrip genügt, damit E1 nur den Schreibpfad umhängt. Vor E1 bleibt `botschaften.generated.ts` → `register.json` die Wahrheit.

**UI-Andockung — Moat-Hebel 1 (Norm-Kontext-Bus statt Silo):** Botschaften **nicht** als isolierte Parallel-Sektion, sondern in **denselben Norm-Kontext-Layer** einspeisen, der schon Entscheide an der Norm aufflächt (`<KontextPanel typ="norm">`). Lese-Brücke `botschaftenFuerNorm(key)` (Filter `doktyp==='botschaft'` über `normKeys`, Datum absteigend) routet in den Kontext-Bus. Sichtbar als Abschnitt **„Entstehungsgeschichte"** (semantisch: Botschaft = Genese, Entscheide = Anwendung) — im selben Panel, das Vergangenheit/Anwendung bündelt. Je Eintrag: Datum · Titel (UI-Sprache, Fallback DE) · Curia-Nr. (Deep-Link parlament.ch, extern gekennzeichnet — **URL-Muster [zu verifizieren durch Opus]**, Finding 18) · Fedlex-Live-Link.

- **Kritik-Korrekturen:**
  - **Leerzustand-Taxonomie (Finding 13):** vier unterscheidbare Ursachen — (a) pre-2000, (b) **Pa.Iv.-Ursprung ohne Botschaft**, (c) Fedlex-Verknüpfung noch nicht vorhanden (frischer Erlass), (d) echt keine. Nicht zu einem Text konflatieren; §8 verlangt konkrete Ursache.
  - **Fetch-Fehler ≠ Leer (Finding 15):** expliziter Fehlerzustand bei 404/500/offline, nie stilles „keine Daten".
  - **Beide Leser-Instanzen (Finding 12):** Haupt `inhalt.tsx:706` **und** Split-View-Pane `:1041` (Kopf `:689/878`) — bekanntes Vergessens-Muster.
  - **§15-Widerspruch auflösen (Finding 2):** `KontextPanel` fetcht `register.json` clientseitig → **nicht** Ctrl+F-prerendert. Entscheidung für dieses Paket: die §15-„voller Inhalt im DOM"-Zusage für diese Sektion **explizit als clientseitig-nachgeladen markieren** (nicht beides gleichzeitig behaupten); CLS über token-Mindesthöhe. (Build-seitiges Einbetten wäre die Alternative, wird aber wegen Bundle-Kosten hier nicht gewählt — Entscheid dokumentieren.)
  - **Payload/§15-Regression (Finding 11):** `register.json` wird clientseitig gefiltert; +200 Botschaften erhöhen die Last auf **jeder** Gesetzseite. Ab diesem Paket **Norm→Material-Index** (`public/materialien/norm-index.json`: `{erlassKey: [materialKey]}`) einführen, damit `botschaftenFuerNorm` nicht über die volle Liste iteriert. Konsistent mit Paket-5-Sharding.
  - Design: L0/§1 (Wortlaut unantastbar), §13 (Tokens), §8-Marker sichtbar; Materialien-Browse-Rubrik zeigt Doktyp „Botschaft" automatisch — Doktyp-Filter prüfen, damit 200+ Einträge die Übersicht nicht fluten.

**Verifikations-Tor.** `check:materialien` (erweitert: key-Eindeutigkeit/URL-Sicherheit, `quelleUrl` http(s), `stand` ISO+nicht-zukünftig, `normKeys ⊆ ERLASS_REGISTER`, committet==Build; **+ P1-Status-Zwang** `botschaft ⇒ nur-live-link`; **+ Coverage-Richtung `normKeys ⊇`**, Finding 8: bekannte Multi-Gesetz-Botschaft muss unter **allen** ihren Gesetzen erscheinen — Referenzfall-Assertion). `check:paritaet` deckt `register.json` (nach Ingest-Bau). **Neu `check:botschaften-netz`** (in `check:netz`): Stichproben-Reverse-Query, Treffermenge/shas vs. committet, Drift=rot (Exit 2 Netzfehler). Unit-Test `botschaftenFuerNorm` (nur doktyp, Datum absteigend, Mantelerlass unter 2 normKeys). **Gegenprüfungs-Glob:** `istRisikoPfad()` um `scripts/materialien/**` + `public/materialien/*.json` erweitern **und Rot-Auslösung positiv testen** (sonst No-Op, Refutation). Adversariale Gegenprüfung (≥15 stratifiziert, gegen fedlex.admin.ch/parlament.ch; Referenzfälle AVIG→11, DSG→17.059+2003; Pre-2000-Ehrlichkeit) → `gegenpruefung:ok`.

**Risiken.** Falsch-Zuordnung (Graph-Join) → typisierte Notation + `resource-type/23` + STRSTARTS-Filter + Stichprobe + §8-Marker. Unbelegte Prädikate → POC vor Bau. Unvollständigkeit (~2000/6800; Pre-2000 fehlt) → P1-Grenze, Lücke benannt. Rebuild-Key-Stabilität (Finding 9): ändert sich das Botschafts-Key-Schema, brechen Paket-5-`botschaft_key` still → Cross-Package-Key-Stabilitätstest nach Regeneration. Materialien-Übersicht geflutet → Doktyp-Trennung.

**DoD.** POC dokumentiert (Prädikate + Füllraten belegt, AVIG=11/DSG=2 reproduziert) · Generator idempotent + raw + §11 · `typen.ts`/`register.ts` erweitert (`BR`/`botschaft`) · `botschaften.generated.ts` + `register.json` committet · **`ingestMaterialien()` gebaut + `check:paritaet` deckt `register.json` (Roundtrip grün, positiv getestet)** · UI im Kontext-Bus (beide Instanzen), §8-Marker + Leerzustand-Taxonomie + Fehlerzustand · norm-index.json · alle Tore grün inkl. erweiterter `check:materialien`, `check:botschaften-netz`, Unit-Test · **Gegenprüfungs-Glob erweitert + Rot-Auslösung positiv getestet** · adversariale Gegenprüfung → `gegenpruefung:ok` · Schema-Rückkopplung in FAHRPLAN-DATENHALTUNG (`materialien`-Felder `projEli/ocUri/botschaftDate/artAnker`) · §14-Intake W2·6 · **kein Push/Deploy ohne §9-Ja.**

**Aufwand: M–L** (~2,5 Sessions: Pipeline+Generator+POC ~1 · Typen/Register+Kontext-Bus-UI ~1 · Ingest+Tore+Gegenprüfung ~0,5). **Abhängigkeiten:** nach Paket 1 empfohlen, technisch unabhängig. **Paket 5 hängt an diesem Paket** (`dep: [W2·6-BOT]`, erbt Pipeline + `botschaftDate`/`ocUri`-Join). E0 liegt vor; E1 ändert nur Schreibpfad.

---

## Bridge B1 — Norm-Kontext-Bus verdrahten (Moat-Kern, nach Paket 2, vor Paket 5)

**Warum eigener Meilenstein (Moat-Kritik):** Vier Pakete addieren *konsultierbare Daten*; fast keines addiert *Verzahnungs-Kanten* — genau die sind laut ROADMAP der Burggraben. Der teuerste einzelne Moat-Gewinn liegt quer zur Paket-Struktur: **Botschaft (Genese) + Revision (Änderung) + Entscheide (Anwendung, aus dem bereits vorhandenen Zitat-Graphen `norm_kanten`/`zitat_kanten`) an EINER norm-verankerten Stelle** zusammenführen. `<KontextPanel typ="norm">` existiert und trägt schon Entscheide — er ist der Verzahnungs-Anker.

**Inhalt.** Nach Paket 2: `botschaftenFuerNorm` (und ab Paket 5 `revisionenFuerNorm`) in **denselben** Kontext-Layer routen, der Entscheide trägt — nicht als parallele Sektionen. Ergebnis auf Art. X: *warum entstanden* (Botschaft) + *was geändert* (AS) + *wie ausgelegt* (BGE aus Graph) + *Rechner* — an einer Stelle. Das kann weder Fedlex noch entscheidsuche noch ein Gratis-Verlag. **Kein neuer Datenbau** (Zitat-Graph liegt vor, DB-Brief E4) — reine UI-/Bus-Verdrahtung. **Aufwand: S–M.** Kein separater §14-Slot nötig; als Teil-DoD von Paket 2/5 führen, aber als expliziten Prüfpunkt „speist in Kontext-Bus, nicht Silo" gaten.

---

## Paket 5 — Änderungshistorie / Amtliche Sammlung (P1.5)

> **✅ AUSGEFÜHRT 10.7.2026 (Opus-Bau-Session; Branch `feat/fedlex-p5-historie`; Go David «go zu allem»; Trailer `Roadmap: W2·6`).**
> **Füllraten-POC (Finding 6, VOR Aufwand-Freigabe korpusweit erhoben):** Pfad (b) live an DSG + 218 Erlassen —
> **3108 Änderungs-Erlasse** über alle 218 Volltext-Erlasse (Erlasse mit ≥1 Änderung 218/218), dateDocument 100 % ·
> Titel DE·FR·IT je 100 % · roFundstelle 100 %. **POC-Korrektur:** die Spec-OPTIONALs `jolux:historicalId`/`botschaftDate`
> liefern am oc-Knoten NICHTS (0/7 DSG, korpusweit leer) → RO/AS-Fundstelle deterministisch aus der oc-URI abgeleitet
> («AS <jahr> <num>», gegen `sequenceInTheYearOfPublication`+`publicationDate` gegengeprüft; Gegenprüfung bestätigte
> == `jolux:historicalId` «RO 1993 1945»), Botschafts-Join über die von Paket 2 persistierten `ocUris` (477 Joins).
> **Determinismus:** zwei Live-Läufe byte-identisch; Tor `check:revisionen` baut Sidecar aus store-raw neu == committet.
> **Sammelerlass-Cross-Check (§8):** Pfad-(a)-Geltungsstände des gepinnten cc-Abstracts ohne (b)-Erlass ab 2000 →
> 1942 «sammelerlass-marker» (nie stille Lücke). **nichtKonsolidiert-Marker (Finding 4):** 93 Einträge
> `dateEntryInForce > Korpus-Stand` (in Kraft, noch nicht konsolidiert — löst den «geändert-am-X-neben-Vor-Fassung»-Widerspruch).
> **DSG-Referenzfall:** Timeline spannt die Totalrevision (Alt-DSG oc/1993 + Neu-DSG oc/2022/491), Tor-Anker.
> **Speicher:** File-Sidecar `public/normtext/revisionen/<KEY>.json` (218, lazy) — **Übergangslösung**, Zielsenke ab E1
> `erlass_fassungen` (im Generator markiert, Schema-Rückkopplung in FAHRPLAN-DATENHALTUNG §3). Ingest erweitert
> (`normtext-revisionen`) → `check:paritaet` deckt die 218 byte-genau; `daten-manifest.json` nachgezogen.
> **Bridge B1 (Moat-Hebel 1):** «Änderungen / Revisionen»-Gruppe IM bestehenden `KontextPanel` neben der
> «Entstehungsgeschichte» (Norm-Kontext-Bus, KEIN Silo, ohne `gesetz-leser`-Änderung); Botschafts-Verweis über den
> ohnehin geladenen Bus (kein zweiter Fetch), Sammelerlass-Marker im `<details>`, locale-Titel, Fetch-Fehler≠leer.
> **Neu:** `scripts/normtext/revisionen-generieren(.ts/-run.ts)`, `check-revisionen.ts`,
> `src/lib/normtext/revisionen.ts`, `src/tests/normtext-revisionen.test.ts` (11), `bibliothek/normtext/revisionen-2026-07-10.md`;
> **erweitert:** `scripts/datenhaltung/ingest.ts`, `src/components/kontext/KontextPanel.tsx`, `package.json`. **Tore grün:**
> tsc · lint (0 F) · vitest 225/3661 · golden byte-gleich · build (61 Routen) · check:revisionen(-netz) · check:paritaet ·
> check:datenhaltung. **Gegenprüfung (Risiko-Pfad Extraktion) BESTANDEN** (unabh. Opus, frischer Kontext, live gegen den
> amtlichen Fedlex-SPARQL-Endpunkt: Drop-Check DSG7/MWSTG29/StGB58/BGBM2 deckungsgleich, DSG-Totalrevision, Marker
> 2025-04-01 belegt, Joins bidirektional, Q1 Bandjahr + Titel verbatim; 0 Befunde). Beleg `bibliothek/normtext/revisionen-2026-07-10.md`.
> **OFFEN (Nicht-Ziel P1):** kein AS-Volltext-Snapshot; keine Artikel-Diff-Darstellung (W3·10); Pre-2000-Marker bewusst nicht.

**Ziel:** Auf der Gesetzesseite ein Abschnitt **«Änderungen / Revisionen»** — welche Änderungserlasse (AS/RO, `eli/oc`) haben dieses Gesetz wann geändert, mit In-Kraft-Datum, Titel, RO-Fundstelle und Link zum AS-Text. Das ist die **Schwester zur «Entstehungsgeschichte» (Paket 2)**: Botschaft = Genese-*Absicht*, AS-Erlass = die *tatsächliche* Änderung; zusammen = die volle Gesetzes-Geschichte an einer Stelle (Burggraben). **Nicht-Ziel (P1):** kein Volltext-Snapshot des Änderungserlasses (Live-Link auf den AS-Text genügt); keine Artikel-für-Artikel-Diff-Darstellung (das ist der intertemporale Fassungsvergleich, W3·10 «Normfassungs-/Geltungsstand-Prüfer», separat).

### Machbarkeit — belegt (live getestet an DSG SR 235.1)

Zwei Kandidatenpfade geprüft; **Pfad (b) ist der verlässliche, dublettenfreie Lieferant** der «wann wurde was geändert»-Liste:

- **Pfad (a) — Konsolidierungs-Versionen:** `?cons jolux:isMemberOf <abstract> ; jolux:dateApplicability ?date`. Gibt die vollständige Liste der *Geltungsstände* (DSG-Alt-Abstract: 14 Daten 1993–2019). **ABER:** die `Consolidation` trägt **keinen** Link auf den auslösenden Erlass (kein `generationCause`/Trigger-Edge — live verifiziert) → kein Titel, keine AS-Fundstelle. Zudem ist sie **an einen Abstract gebunden**: die Totalrevision DSG 2020 erzeugt einen **neuen** Abstract (`cc/2022/491`) → Pfad (a) sieht die Historie über die Totalrevision hinweg **nicht** zusammenhängend. **= identisch mit den Daten, die der Gap-Report §3 schon hat** (Currency), nicht mehr.

- **Pfad (b) — Erlasse über die SR-Taxonomie (empfohlen):**
  ```sparql
  PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>
  PREFIX skos:  <http://www.w3.org/2004/02/skos/core#>
  SELECT ?oc ?dateForce ?dateDoc ?roId ?botschaftDate (SAMPLE(?t) AS ?titel) WHERE {
    ?tax skos:notation "235.1"^^<https://fedlex.data.admin.ch/vocabulary/notation-type/id-systematique> .
    ?oc jolux:classifiedByTaxonomyEntry ?tax ;
        jolux:legalResourceFamilyType <https://fedlex.data.admin.ch/vocabulary/resource-family/oc> ;
        jolux:dateEntryInForce ?dateForce .
    OPTIONAL { ?oc jolux:dateDocument   ?dateDoc . }
    OPTIONAL { ?oc jolux:historicalId   ?roId . }         # "RO 2019 625" = AS-Fundstelle
    OPTIONAL { ?oc jolux:botschaftDate  ?botschaftDate . } # Verzahnung → Paket 2
    OPTIONAL { ?oc jolux:isRealizedBy ?e . ?e jolux:title ?t . }
  }
  GROUP BY ?oc ?dateForce ?dateDoc ?roId ?botschaftDate
  ORDER BY DESC(?dateForce)
  ```
  Getestet: DSG → die Änderungs-**Erlasse** mit `dateEntryInForce` (1993-07-01 … 2025-07-07), jeder mit `dateDocument` (Erlass-Datum), **`historicalId` = RO-Fundstelle** (z. B. «RO 2019 625»), **`botschaftDate`** (Botschafts-Datum → direkte Verzahnung zu Paket 2) und `eli/oc`-Link zum AS-Text. **Spannt die Totalrevision** (Alt-DSG `oc/1993/1945` + Neu-DSG `oc/2022/491` liegen beide unter Taxonomie `5993`). Dubletten (die `cc`-Abstracts selbst) werden per `legalResourceFamilyType = …/resource-family/oc` **herausgefiltert**; Sprach-Realisierungen kollabieren über `GROUP BY ?oc`.

**Ehrliche Grenze (Vollständigkeit):** Pfad (b) listet nur Erlasse, die **primär** unter dieser SR klassifiziert sind. Änderungen, die über **Mantel-/Sammelerlasse anderer SR** eingebracht wurden, tauchen bei (b) **nicht** auf (sie erzeugen einen Geltungsstand, den nur Pfad (a) als Datum sieht) — es gibt **keine** saubere «amends»-Kante in den Abstract (live geprüft: reverse-Edges sind nur `isMemberOf`/`foreseenImpactToLegalResource(2)`/`subdivisionIsPartOf`, kein vollständiger Änderungs-Graph). **Umgang:** Pfad (b) ist die Timeline; **Cross-Check gegen Pfad (a)** (dessen Konsolidierungs-Daten der Gap-Report bereits hat): wo (a) *mehr* Geltungsstände als (b) Erlasse zeigt, gab es eine Mantelerlass-Änderung → ehrlicher Marker «weitere Änderung über einen Sammelerlass — siehe amtliche Sammlung» statt stiller Lücke (§8).

**Historische Reichweite:** strukturierte Verknüpfung mit `botschaftDate`/`historicalId` verlässlich **ab ~2000** (digitale AS). Ältere Erlasse sind als `eli/oc` mit RO-Fundstelle vorhanden (DSG bis `oc/1993`), aber ohne durchgehende Botschafts-Verknüpfung; Konsolidierung reicht bis zur Erstpublikation (Alt-DSG 1993). Grenze im UI benennen.

### Abgrenzung / Verzahnung
- **vs. Paket 1 (Currency):** Paket 1 beantwortet «welche **eine** geltende Fassung liefern wir?» (Pfad-a-Daten, für die Extraktions-Aktualität). Paket 5 beantwortet «welche Änderungen gab es über die **Zeit**?» (Pfad-b-Erlasse, als Lese-Feature). Gleiche Rohdaten-Ecke, anderer Zweck — **kein Doppel-Build:** Paket 5 nutzt die Konsolidierungs-Daten aus dem Gap-Report für den Vollständigkeits-Cross-Check.
- **vs. Paket 2 (Botschaften):** komplementär. Jeder AS-Änderungseintrag **verlinkt seine Botschaft** über `botschaftDate` bzw. den gemeinsamen `?proj`-Knoten (gleiche Kette) → im Reader stehen «Entstehungsgeschichte» (Botschaften) und «Änderungen/Revisionen» (AS-Erlasse) nebeneinander, gegenseitig verlinkt.

### Datenmodell / UI — Empfehlung: erlass-eigene Revisions-Timeline (NICHT Materialien-Doktyp)

**Empfehlung:** eine **erlass-eigene «Änderungen / Revisionen»-Timeline** als Sidecar am Normtext, **nicht** ein Materialien-Doktyp. Begründung: (1) AS-Änderungserlasse sind **kein browsbares Standalone-Korpus** — niemand blättert «alle AS-Erlasse»; sie werden immer im Kontext *eines* Gesetzes gelesen. (2) Als Materialien-Einträge würden hunderte fast identischer AS-Zeilen die Materialien-Übersicht fluten. (3) Die Daten sind eine reine **Build-time-Projektion aus dem Graphen, keyed nach SR** → am besten als Sidecar `public/normtext/revisionen/<KEY>.json` (oder ein `revisionen-index.json`), lazy vom Reader geladen — analog zum Norm→Entscheid-Index. **Alternative (ehrlich):** will David die AS-Erlasse *auch* durchsuchbar/browsbar, ginge ein Materialien-`doktyp: 'as-erlass'` (wie Botschaften mit `BehoerdeId 'BR'`) — für P1 **nicht empfohlen** (Flut + kein Browse-Bedarf).

**UI:** Abschnitt «Änderungen / Revisionen» in `src/pages/gesetz-leser/inhalt.tsx`, direkt neben «Entstehungsgeschichte» (beide am Leseende, über/neben dem `KontextPanel`). Je Eintrag: In-Kraft-Datum · Titel · RO-Fundstelle · AS-Live-Link · «Botschaft ansehen»-Verweis (wenn vorhanden). **Reihenfolge: Datum absteigend.** Status-Marker (§8): «maschinell aus dem amtlichen Fedlex-Graphen; massgeblich bleibt die amtliche Sammlung» + Vollständigkeits-Hinweis bei Mantelerlass-Lücken. Sprachwahl DE/FR/IT über die `isRealizedBy`-Realisierungen.

### P1-Umfang
Für die **218 Bund-Volltext-Erlasse** (`register.json`, `ebene==bund`, `status=='snapshot'`) je eine Revisions-Timeline aus Pfad (b), Status = Live-Link (kein AS-Volltext-Snapshot). `botschaftKey` automatisch verknüpft, wo Paket 2 den Eintrag kennt.

### Betroffene Dateien
- **neu:** `scripts/normtext/revisionen-generieren.ts` (Muster: der Paket-2-Generator / `bund-stubs-generieren.ts`; SPARQL Pfad (b) je SR + Cross-Check gegen Pfad-a-Daten) · `public/normtext/revisionen/*.json` bzw. `revisionen-index.json` · `bibliothek/normtext/revisionen-raw/*.json` (store-raw, §11).
- **neu (Lese-Brücke):** `revisionenFuerNorm(key)` in `src/lib/normtext/werkzeuge.ts` (oder `revisionen.ts`), sortiert Datum absteigend, verknüpft Botschaft.
- **erweitert:** `src/pages/gesetz-leser/inhalt.tsx` (Abschnitt) · ggf. `src/lib/kontext.ts` (falls ins Kontext-Modell integriert) · `package.json` (Script `normtext:revisionen`).

### Tore & Gegenprüfung
- **Neu:** `check:revisionen` (offline) — committetes Sidecar == frischer Build (Determinismus §2), key-/Datums-/URL-Validität, `botschaftKey` verweist nur auf existierende Paket-2-Einträge (kein toter Cross-Link, §8); **Netz-Tor** (Drift): Pfad-b-Query stichprobenweise nachfahren + Vollständigkeits-Cross-Check gegen Pfad (a).
- **Gegenprüfung (Pflicht §14, Risiko-Pfad):** unabhängiger Opus-Zweitpass, Auftrag **widerlegen** — Stichproben: (a) gehört der AS-Erlass wirklich zu diesem Gesetz (gegen die amtliche AS-Seite / RO-Fundstelle)? (b) stimmt das In-Kraft-Datum mit der amtlichen Fassung? (c) sind Mantelerlass-Lücken korrekt als «weitere Änderung über Sammelerlass» markiert statt verschwiegen? (d) Referenzfall DSG: Timeline enthält Alt- **und** Neu-DSG über die Totalrevision hinweg. `npm run gegenpruefung:ok` erst nach bestandenem Pass. **Quelle immer die amtliche Fedlex-Stelle** (SPARQL + AS-Filestore); **nie** `droid-f/fedlex`.

### Aufwand grob
Generator (Pfad b + Cross-Check, Paket-2-Pipeline geerbt) ~1 Session · Sidecar-Store + Reader-Abschnitt + Botschafts-Verzahnung ~1 Session · Tore + Gegenprüfung ~0,5 Session. **Gesamt M–L**, deutlich günstiger **nach** Paket 2.

### §14-Intake
ROADMAP **W2·6** (Konsultieren-Klingen, Schwester zu W2·6-BOT), Detailquelle `FAHRPLAN-FEDLEX-PORTFOLIO.md`. Kein 26×-Bezug, kein Worktree.
`<!-- @meta id: W2·6-REV · status: done · of: ja · blocker: null · dep: [W2·6-BOT] · kollision: [] · worktree: nein · 26x: nein · fahrplan: FAHRPLAN-FEDLEX-PORTFOLIO.md -->` — **✅ 10.7.2026 ausgeführt (siehe Stand-Block oben).**
**Trailer:** `Roadmap: W2·6` + `Gegenpruefung: …`.

**Historie-Modell vereinheitlicht (Fundament-Plan §4.4/§7 Punkt 5, David 3.7.2026 — verbindlich):** Der hier vorgeschlagene File-Sidecar `public/normtext/revisionen/<KEY>.json` ist eine **Übergangslösung**. **Zielsenke ist die Tabelle `erlass_fassungen` ab E1** (`FAHRPLAN-DATENHALTUNG.md §3`; §5-Doktrin «nie zwei Wahrheiten»: `erlass_fassungen` ist DAS Historie-Modell, kein paralleler Revisions-Sidecar). Wird Paket 5 VOR E1 gebaut, bleibt der Sidecar zulässig, ist aber im Generator **explizit als Übergangslösung zu markieren** + Migrationsnotiz «schreibt ab E1 in `erlass_fassungen`, Sidecar wird dann Projektion». Fundstellen-Rohstoff (`jolux:dateEntryInForce`, AS-`historicalId`) ist deckungsgleich. **Zusatznutzen:** dieselben Historie-Daten speisen die Artikel-Stabilitäts-Messung (Fundament-Plan §3.2 — Anteil `art_id`s stabil/verändert/verschwunden über die letzten N Revisionen von OR/ZGB/StGB), die das versionslose Verzahnungs-Kanten-Modell empirisch absichert, statt es nur zu behaupten.

### Opus-Härtung (adversarial geprüft, 2.7.)

**Paket 5 — Änderungshistorie / Amtliche Sammlung (W2·6-REV, P1.5)**

**Ziel.** Je Bund-Gesetzesseite Abschnitt **„Änderungen / Revisionen"**: welche AS/RO-Änderungserlasse (`eli/oc`) haben wann geändert — In-Kraft-Datum, Titel, RO-Fundstelle, AS-Live-Link, Botschafts-Verweis. Moat zusammen mit Paket 2: Botschaft = *Absicht*, AS = *tatsächliche* Änderung → volle Gesetzes-Geschichte an einer Stelle. **Nicht-Ziel (P1):** kein AS-Volltext-Snapshot; keine Artikel-Diff-Darstellung (W3·10) — **aber** Artikel-Anker mitführen (Moat-Hebel 2).

**Quelle+Endpunkt.** Pfad (b), live an DSG SR 235.1 verifiziert (DSG=19 in Refutation reproduziert, spannt Totalrevision):
```sparql
SELECT ?oc ?dateForce ?dateDoc ?roId ?botschaftDate (SAMPLE(?t) AS ?titel) WHERE {
  ?tax skos:notation "<SR>"^^<https://fedlex.data.admin.ch/vocabulary/notation-type/id-systematique> .
  ?oc jolux:classifiedByTaxonomyEntry ?tax ;
      jolux:legalResourceFamilyType <https://fedlex.data.admin.ch/vocabulary/resource-family/oc> ;
      jolux:dateEntryInForce ?dateForce .
  OPTIONAL { ?oc jolux:dateDocument  ?dateDoc . }
  OPTIONAL { ?oc jolux:historicalId  ?roId . }          # "RO 2019 625" = AS-Fundstelle
  OPTIONAL { ?oc jolux:botschaftDate ?botschaftDate . }  # Verzahnung → Paket 2
  OPTIONAL { ?oc jolux:isRealizedBy ?e . ?e jolux:title ?t . }
} GROUP BY ?oc ?dateForce ?dateDoc ?roId ?botschaftDate ORDER BY DESC(?dateForce)
```
Fallen: `skos:notation` typisiert; `resource-family/oc` filtert `cc`-Dubletten, `GROUP BY ?oc` kollabiert DE/FR/IT [Sprach-Kante zu verifizieren durch Opus]. **Mantel-/Sammelerlass-Lücke (strukturell):** keine `amends`-Kante → **Cross-Check gegen Pfad (a)** (`?cons jolux:isMemberOf <abstract> ; jolux:dateApplicability ?date`, Mechanik = `fedlex-versionen-pruefen.ts`); wo (a) mehr Stände zeigt als (b) Erlasse → **§8-Marker** „weitere Änderung über einen Sammelerlass — siehe amtliche Sammlung", nie stille Lücke. Totalrevision: Alt+Neu-Abstract unter derselben Taxonomie → Cross-Check über ALLE Abstracts der SR [Abstract-Enumeration zu verifizieren durch Opus]. Reichweite verlässlich ab ~2000.

**Kritik-Korrekturen eingearbeitet:**
- **Füllraten-POC VOR Aufwand-Freigabe (Finding 6):** `botschaftDate`/`historicalId`/Sprach-Kante/data-URI→Portal-Mapping sind alle `[zu verifizieren]`; der DSG-Test verifizierte nur die SELECT-Form, nicht die Füllung über 218. **Opus misst korpusweit die OPTIONAL-Feld-Füllraten**, bevor M–L freigegeben wird — sonst besteht die Timeline überwiegend aus Zeilen mit nur `dateEntryInForce` (geringer Nutzwert).
- **„Konsolidierung trailt AS"-Widerspruch (Finding 4, P0, user-sichtbar):** Paket 1 lässt ein frisch in Kraft getretenes, noch unkonsolidiertes Amendment mit **altem Normtext** stehen; Paket 5 listet dasselbe als „geändert am X". Der Leser sähe „geändert am 1.10.2026" neben Vor-Fassungs-Text. **Pflicht-Marker in Paket 5:** bei `dateEntryInForce > erlass.stand` → „Änderung noch nicht in den geltenden Text konsolidiert".
- **DB-Reife NICHT übertreiben (Refutation-Treffer 3):** `erlass_revisionen(... REFERENCES erlasse(key) ...)` ist **reines Zukunfts-Schema** — in E0 existiert weder `erlasse` noch `erlass_fassungen` noch `materialien`, der FK ist heute nicht anlegbar; `projektion.ts` kann keine typisierte-Tabelle→JSON. **Heutiger Beweis = ausschliesslich das `check:revisionen`-Sidecar-Tor, NICHT `check:paritaet`.**
- **Botschafts-Join auflösbar (Finding 1):** `botschaft_key` matcht über die von Paket 2 nun persistierten `ocUri`/`botschaftDate` (nicht über Curia-Nr., die Paket 5 nicht kennt). Nur bei belegtem Match setzen, sonst NULL + nur `botschaftDate` als Text (kein toter Link).
- **Trilingual korrekt** (Paket 5 speichert bereits `titel_de/fr/it`).

**Extraktion.** Neues `scripts/normtext/revisionen-generieren.ts` (Muster Paket-2-Generator + `sparqlBatch`). npm `normtext:revisionen`. Ablauf: SR → Pfad-b-Query → store-raw (`bibliothek/normtext/revisionen-raw/<KEY>.json`) → normalisieren/sortieren (Datum absteigend, kanonisch, stabil) → Pfad-a-Cross-Check → Sidecar. Idempotent, `--nur <KEY>`-Filter. Sequenziell/klein-Batch (Rate-Budget §2). Extraktion/Writer getrennt (§1 Regel 5).

**DB-Schema.** **File-Sidecar heute** `public/normtext/revisionen/<KEY>.json` (ein File je Erlass, lazy — kein Monolith; 218 × Timeline würde Reader-Load aufblähen). JSON-Felder = geplante Spalten (camelCase): `erlassKey, ocUri, dateEntryInForce, dateDocument, roFundstelle, titelDe/Fr/It, botschaftDate, botschaftKey?, artAnker?, art ('aenderung'|'sammelerlass-marker'|'nicht-konsolidiert-marker'), nichtKonsolidiert?, quelleUrl, stand, abgerufen, sha`. `sammelerlass-marker` = Pfad-(a)-Datum ohne `ocUri`-Erlass, synthetischer Key `paketa:<datum>`. **Zukunfts-Tabelle `erlass_revisionen` ist E6b-Schema** (in FAHRPLAN-DATENHALTUNG §3 zurückgetragen, Finding 17) — **heute nicht anlegen**. Sidecar ist **neu und nicht im Ingest** → Allowlist-Eintrag oder Ingest-Erweiterung (§1 Regel 2). Golden-schonend: rein additiv, `NormSnapshot`/`register.ts` unverändert (Sidecar-Existenz = Signal).

**UI-Andockung.** Abschnitt „Änderungen / Revisionen" in den **Norm-Kontext-Bus** (B1), neben „Entstehungsgeschichte" — Timeline **ans Leseende**, nicht in den `ErlassKopfBlock`. Lese-Brücke `revisionenFuerNorm(key)` (lädt Sidecar, sortiert, reichert `botschaftKey` an). Je Eintrag: In-Kraft-Datum · Titel (UI-Sprache, Fallback DE) · RO-Fundstelle · „AS-Text ↗" · „Botschaft ansehen" (nur bei `botschaftKey`) · ggf. „noch nicht konsolidiert"-Marker. Sammelerlass-Marker als abgesetzte Zeile. §8-Marker + Reichweiten-Hinweis (~ab 2000). **Beide Leser-Instanzen** (Finding 12). §15-Zusage konsistent zu Paket 2 (lazy-Sidecar explizit, token-Mindesthöhe, CLS=0). Leerzustand ehrlich, Fetch-Fehler ≠ Leer (Finding 15). L0/§1/§13/D1.

**Verifikations-Tor.** **Neu `check:revisionen` (offline, in `check`):** (1) Determinismus (Build aus raw == committetes Sidecar); (2) Schema-Validität (`dateEntryInForce` ISO, `quelleUrl` http/s, Key ∈ Register); (3) Cross-Link-Integrität (`botschaftKey` → existierender Paket-2-Eintrag; **Cross-Package-Key-Stabilität**, Finding 9); (4) Sortierung; (5) **DSG-Regressionsanker** (Timeline SR 235.1 enthält Einträge vor UND nach Totalrevision 2020); (6) `nicht-konsolidiert`-Marker gesetzt wo `dateEntryInForce > erlass.stand`. **Netz-Tor** `check:revisionen-netz` (in `check:netz`): Stichproben-Nachfahrt Pfad-b + Cross-Check (a)vs(b), Drift=Exit 1. **Gegenprüfung:** `public/normtext/revisionen/*.json` fällt bereits unter die bestehende `public/normtext/*.json`-Glob (Refutation bestätigt gedeckt) — aber `scripts/normtext/revisionen-generieren.ts` liegt unter `scripts/normtext/` = ebenfalls gedeckt. Adversarial: gehört AS-Erlass wirklich zum Gesetz (gegen RO-Fundstelle/amtliche AS-Seite)? In-Kraft-Datum? Sammelerlass-Lücken als Marker sichtbar? DSG Alt+Neu? → `gegenpruefung:ok`.

**Risiken.** Stille Mantelerlass-Lücke → Pflicht-Cross-Check (a)+Marker+Netz-Assertion. Datum-Matching (a)↔(b) unscharf (Konsolidierung trailt AS) → [an 3 Referenzgesetzen kalibrieren], im Zweifel Marker (falsch-positiver Marker §8-verträglicher als stille Lücke). Toter Botschafts-Link → `botschaftKey` nur bei belegtem Match. Pre-2000-Datenqualität → Quell-Grenze, nie Fabrikation. DB-Reife-Übertreibung → als Zukunfts-Schema klargestellt.

**DoD.** Füllraten-POC dokumentiert · Generator deterministisch, 218 Sidecars + raw, `--nur` · Reader zeigt Abschnitt (beide Instanzen) mit allen Feldern + §8/Sammelerlass/nicht-konsolidiert-Marker, DSG-Referenzfall visuell (Playwright, mobil+Dark) · `check:revisionen` grün + in `check`, `check:revisionen-netz` in `check:netz` · Gegenprüfung quittiert · Sidecar im Allowlist/Ingest, `erlass_revisionen` in FAHRPLAN-DATENHALTUNG zurückgetragen · Writer als E1-Flip-Punkt markiert · §14-Intake W2·6-REV · **kein Push/Deploy ohne §9-Ja.**

**Aufwand: M–L** (Generator+Cross-Check ~1 · Sidecar+Reader+Verzahnung ~1 · Tore+Gegenprüfung ~0,5). Günstiger NACH Paket 2. **Abhängigkeiten:** hart `dep: [W2·6-BOT]` (Verzahnung); baubar auch ohne (dann `botschaftKey`=NULL), nicht empfohlen. Helfer mit Paket 1 teilen (Pfad a). Vor E1 Sidecar, nach E1 Writer umhängen.

---

## Paket 3 — Vernehmlassungen (P2)

**Wert:** «was kommt»-Vorschau (Anhörungen vor dem Parlament) — komplettiert die Konsultieren-Klinge **W3·11** (Gesetzgebungs-Tracking).

**Machbarkeit (teilweise offen — ehrlich):** Vernehmlassungen liegen unter `eli/dl/proj` (~2000). Die Projekt-Graph-Verknüpfung zum Gesetz ist **plausibel dieselbe** wie bei Botschaften (der `?proj`-Knoten trägt beide als `legislativeTask`-Ereignisse), **aber nicht end-to-end getestet**. **Vor Bau:** POC (§7 Quell-Wahl) — SPARQL-Probe, ob ein Vernehmlassungs-`event` am selben `?proj` hängt und sich per SR rückwärts auflöst. Erst wenn belegt bauen, sonst als Grenze dokumentieren.

**P1-Umfang (falls POC grün):** Vernehmlassungen zu unseren Volltext-Erlassen als Materialien-Typ `doktyp: 'vernehmlassung'`, Status `nur-live-link`. **Erbt die Botschaften-Pipeline** (`botschaften-generieren.ts` → generischer `projekt-graph-generieren.ts` mit `typeDocument`-Parameter) → billiger nach Paket 2.

**Grenze:** laufende vs. abgeschlossene Verfahren — Currency-Frage (welche noch offen?) braucht Datum-Feld + Wiedervorlage, sonst Liste toter Alt-Anhörungen. Im POC mitprüfen.

**Aufwand grob:** POC ~0,5 Session; Bau (POC grün, Pipeline geerbt) ~1 Session. **Gesamt L.**

**§14-Intake:** ROADMAP-Schritt **W3·11**. **Trailer:** `Roadmap: W3·11` + `Gegenpruefung: …`.

### Opus-Härtung (adversarial geprüft, 2.7.)

**Paket 3 — Vernehmlassungen (W3·11, P2 → durch POC auf M herabgestuft)**

**Ziel.** Je Bund-Gesetzesseite Abschnitt **„Gesetzgebung in Arbeit"**: laufende/abgeschlossene Vernehmlassungen mit Status, Frist, Live-Link. Komplettiert mit Paket 2/5 die Zeitachse Vergangenheit→Gegenwart→Zukunft. **Moat-Kritik eingearbeitet:** der differenzierende Wert ist **proaktiv** (Laufend-Tracking „was ändert sich in meinem Rechtsgebiet"), nicht die retrospektive Pro-Norm-Liste. Deshalb bleibt der **Laufend-Badge + Cross-Norm-Fähigkeit** in diesem Paket (nicht auf P2 verschoben, wo der Original-Plan den differenzierenden Teil weggeschnitten hätte).

**Quelle+Endpunkt (live belegt 2.7.2026; COUNT=2548 und OR→33 in Refutation reproduziert).** Direkte Kante — **einfacher als Paket 2**, keine oc-Reverse-Kette:
```sparql
?tax skos:notation "220"^^<https://fedlex.data.admin.ch/vocabulary/notation-type/id-systematique> .  # TYPISIERT
?cc jolux:classifiedByTaxonomyEntry ?tax .
?cons a jolux:Consultation ;
      jolux:foreseenImpactToLegalResource ?cc ;
      jolux:consultationStatus ?status .
OPTIONAL { ?cons jolux:eventTitle ?titel . FILTER(LANG(?titel)="de") }
OPTIONAL { ?cons jolux:hasSubTask ?open . ?open a jolux:ConsultationPhase ;
           jolux:eventStartDate ?start ; jolux:eventEndDate ?ende }
```
Belegt: OR(220)→33, DSG(235.1)→3, MWSTG(641.20)→4. URI `eli/dl/proj/{jahr}/{nr}/cons_1`, Legacy-Jahre `6006`–`6020`. **Status-Vokabular** `vocabulary/consultation-status/{0..6}` (0 In Vorbereitung · 1 Geplant · 2 Laufend · 3/4 Abgeschlossen-abwarten · 5 Abgeschlossen · 6 Zurückgezogen) — löst die Plan-offene „laufend vs. abgeschlossen"-Grenze amtlich. Fristen via Sub-Task `cons-open` (`eventStartDate`/`eventEndDate`). Titel/Beschreibung DE/FR/IT direkt am Knoten. Live-Link `https://www.fedlex.admin.ch/eli/dl/proj/{jahr}/{nr}/cons_1/de` (HTTP 200 geprüft).

Fallen: typisierte notation; SPA-Shell (200 ≠ Inhalt → Existenz per SPARQL prüfen, nie HTTP-Status); Zuordnungs-Grobheit (`foreseenImpact`: VDSG proj/6006/36 hängt auch am DSG-cc → §8-Marker); Mantelvorlagen unter jedem SR (Feature, kennzeichnen); `DISTINCT`. **Rest-POC [zu verifizieren durch Opus, ~0,25 Session]:** Voll-Lauf über 218 SR (Trefferverteilung/Laufzeit/Batch); Status-0/1 ohne `cons-open` (Frist „noch offen", nicht leerer String); `institutionInChargeOfTheEvent`-Labels; ältester Eintrag (Reichweite ~ab 2006).

**Extraktion.** Neues `scripts/materialien/vernehmlassungen-generieren.ts` (oder zweiter `typeDocument`-Modus des Paket-2-Generators, falls dieser existiert — **nicht vorab abstrahieren**, §1). npm `materialien:vernehmlassungen`. Ablauf idempotent `fetch → store-raw (`…/vernehmlassungen-raw/<SR>.json`) → parse → load (`vernehmlassungen.generated.ts` → `MATERIAL_REGISTER` → `register.json`)`. Sortierung (Status-Priorität laufend>geplant>abgeschlossen, Fristende absteigend, key). Exit 2 bei Netzfehler, keine halben Generate.

**DB-Schema.** `MaterialRegistereintrag` additiv: `DoktypId 'vernehmlassung'`; **`BehoerdeId 'BUND'`** (generisch — Vernehmlassungen kommen von BR/Departementen **oder parl. Kommissionen** (Pa.Iv.-Fälle wie „22.448 Caroni"), Paket-2-`'BR'` wäre teils falsch; eröffnende Stelle aus `institutionInChargeOfTheEvent`-Label im Hinweis). Neues Feld `vernehmlassung?: { status: 'in-vorbereitung'|'geplant'|'laufend'|'abgeschlossen-stellungnahmen'|'abgeschlossen-bericht'|'abgeschlossen'|'zurueckgezogen'; fristStart?; fristEnde?; projEli }` (1:1 vom Vokabular 0–6). `key` = `VERN-{jahr}-{nr}` (Legacy `VERN-6006-36` unverändert). `titel_de/fr/it` (Finding 10). `status: 'nur-live-link'`. `quelleUrl` = cons_1-Portal-URL. `stand` = Abfragedatum (Status **mutabel**). `normKeys` automatisch. `artAnker?` (Moat-Hebel 2, wo ableitbar). `sha` inkl. `vernehmlassung.status`+`fristEnde`+`normKeys` (Drift-Token).

**DB-Andockung (Refutation: wie Paket 2 — Bau-Schritt, nicht automatisch):** dieselbe Materialien-Roundtrip-Lücke. Wird Paket 3 **vorgezogen** (POC erlaubt es, da direkte Kante keine oc-Kette braucht), muss es `ingestMaterialien()` **selbst** bauen (nicht auf Paket 2 verlassen). Zukunfts-Mapping (E6b, in FAHRPLAN-DATENHALTUNG zurückgetragen): `materialien(…)` + additive Spalten `vern_status/frist_start/frist_ende/proj_eli`. Vor E1 Datei-Pfad. `norm-index.json` (Finding 11) mitnutzen — potenziell tausende Vernehmlassungen dürfen `register.json` nicht clientseitig voll-iterieren.

**UI-Andockung.** Abschnitt „Gesetzgebung in Arbeit" in den **Norm-Kontext-Bus** (B1), `vernehmlassungenFuerNorm(key)`, laufende zuerst. **Laufend-Badge (Moat-Teil, behalten):** kleiner Chip im `ErlassKopfBlock` (`parts.tsx`, Erweiterungspunkt `inhalt.tsx:903-904`) **nur** bei `status==='laufend'`: „Vernehmlassung läuft bis {fristEnde}", Anker auf Abschnitt. **Beide Leser-Instanzen.** §8-Marker sichtbar; leere Liste = ehrlicher Reichweiten-Hinweis (~ab 2006); Fetch-Fehler ≠ Leer. §15 lazy explizit (wie Paket 2). L0/§1/§13/D1; Status-Chips über Design-Tokens (kein `text-red-*`). Übersichtsseite „alle laufenden Vernehmlassungen" = W3·11-Ausbau, nicht dieses Paket.

**Verifikations-Tor.** `check:materialien` erweitert: URL http(s) auf `www.fedlex.admin.ch/eli/dl/proj/`, `fristStart<=fristEnde`, Status ∈ Enum, P1-Status-Zwang, Determinismus, **Konsistenz-Assertion `laufend && fristEnde < heute ⇒ rot`** (Finding 7 — gegen **heute** im Build, nicht gegen mit-alterndes `stand`). **Neu `check:vernehmlassungen-netz`** (in `check:netz`) = **Currency-Arbiter** (Vernehmlassungen sind mutable: `consultationStatus`+`previousConsultationStatus`+`consultationHasModification`): alle nicht-abgeschlossenen live nachfahren, sha-Vergleich, Statuswechsel/Fristverlängerung = Exit 1. **Kadenz-Hinweis (Finding 7 + Refutation):** Netz-Tore sind nur so gut wie ihr Aufruf; `check:netz` ist nicht im Default-`gate`. Solange kein Cron im Repo verankert ist, ist die Offline-Assertion `laufend && fristEnde<heute` der belastbare Schutz gegen still-falsche „laufend"-Anzeige. **Gegenprüfungs-Glob** wie Paket 2 (`scripts/materialien/**`+`public/materialien/*.json`, Rot-Auslösung positiv testen). Adversarial (≥15 stratifiziert: laufend/abgeschlossen/zurückgezogen/Legacy-6xxx/Mantel; Referenzfälle OR→33/DSG→3/MWSTG→4; VDSG-Grobheit als maschinell markiert; Pre-2006-Ehrlichkeit) → `gegenpruefung:ok`.

**Risiken.** Currency (Status veraltet) = Hauptrisiko → Netz-Tor + Offline-Assertion `fristEnde<heute`. Zuordnungs-Grobheit → §8-Marker, nie „amtlich bestätigt zugehörig". SPA-Shell → Existenz per SPARQL. Timeout → typisierte notation, VALUES-Batch, Rate-Budget. Doppelbau → Datei-Pfad bis E1, festes Spaltenmapping.

**DoD.** Rest-POC a–d verifiziert + §11 · Generator deterministisch + raw · alle 218 abgedeckt (Treffer oder ehrliches Leer) · UI + Laufend-Badge (beide Instanzen), DE/FR/IT, §8-Marker, Fehlerzustand · `check:materialien`-Erweiterung inkl. `fristEnde<heute`-Assertion + `check:vernehmlassungen-netz` grün · Engine-Golden byte-gleich · Gegenprüfungs-Glob + Rot-Test · adversariale Gegenprüfung → `gegenpruefung:ok` · Schema-Rückkopplung · §14-Intake **W3·11** · **kein Push/Deploy ohne §9-Ja.**

**Aufwand: M** (herabgestuft von L — Kernkette belegt + einfacher als Paket 2): Rest-POC ~0,25 · Generator+Schema ~1 · UI+Tore+Gegenprüfung ~1. **Abhängigkeiten:** erbt Materialien-Typen-Mechanik + Kontext-Bus von Paket 2; **technisch seit POC unabhängig baubar** (direkte `foreseenImpact`-Kante) — bei Vorziehen +~0,5 Session (eigenes `ingestMaterialien()`). Kollisionsfläche `src/lib/materialien/**` mit Paket 2 → bei Parallelbau §12-Worktree.

---

## Paket 4 — Staatsverträge (P3)

**Wert:** punktuelle Ergänzung der International-Rubrik. **Ist-Stand:** bereits 20 SR-0.* (18 Volltext inkl. CISG/LugÜ/FZA/HKÜ/UNO-Pakte + 2 PDF-Embeds EMRK/NYÜ) + 8 EU-Verordnungen (EUR-Lex-Links). Grenznutzen weiterer Verträge **niedrig-mittel**.

**Machbarkeit (teilweise offen):** `eli/treaty` (~18 500) ist ein **anderer Namespace als `eli/cc`** mit potenziell anderem Markup. Ob `eli/treaty` dieselben `<article id="art_*">`-Strukturen liefert, ist **nicht verifiziert**. **Kein Bulk** — 18 500 Verträge sind zu 99 % kanzlei-irrelevant.

**P1-Umfang:** **kuratierte Auswahl** praxisrelevanter, heute fehlender Verträge (Kandidaten-Recherche nötig). Je Kandidat **POC-Fetch** (§7): extrahierbares HTML → `snapshot`; nur SPA-Shell → `pdf-embed` (wie EMRK/NYÜ); sonst `nur-live-link`. Andockpunkt `bund-stubs-generieren.ts` bzw. `pdf-embed.ts`.

**Abgrenzung:** Staatsverträge haben oft **keine artikelweise Konsolidierung**; Geltungsbereich/Vorbehalte je Vertragsstaat bildet die Norm-Snapshot-Struktur nicht ab — im Zweifel `pdf-embed` statt fehleranfälligem Struktur-Extrakt.

**Aufwand grob:** Recherche + POC ~0,5 Session; Bau je Handvoll ~0,5–1 Session. **Gesamt S–M.**

**§14-Intake:** ROADMAP-Schritt **W2·6**/**W3·13**, Detailquelle bestehende `FAHRPLAN-INTERNATIONAL-VOLLTEXT.md` (dort verlinken, kein neuer FAHRPLAN). **Trailer:** `Roadmap: W2·6` + `Gegenpruefung: …`.

### Opus-Härtung (adversarial geprüft, 2.7.)

**Paket 4 — Staatsverträge (SR 0.*) — auf Backlog/opportunistisch (Moat-Kritik)**

**Priorisierungs-Korrektur (Moat-Kritik):** Paket 4 ist **reines Coverage-Padding, Null Moat** (Eigenurteil „Grenznutzen niedrig-mittel", Fedlex hat sie, Verlage kuratieren sie besser). **Keine Session dafür ausgeben, bevor der Norm-Kontext-Bus (B1) + Verzahnung existieren.** Bleibt letztes Paket; nur bei explizitem David-Entscheid vorziehen. Technisch das **sauberste** Paket (Refutation: „hier stimmt keine Doppelung wirklich").

**Ziel.** Kuratierte Ergänzung der International-Rubrik (heute 20 SR-0.*: 18 snapshot + 2 pdf-embed) um praxisrelevante fehlende Verträge, gleiche Qualität/Provenienz/Currency wie Bundesgesetze. **Kein Bulk** (18'500 `eli/treaty` zu 99% irrelevant).

**Quelle+Endpunkt (im Repo belegt).** Die 18 bestehenden Volltext-Verträge laufen **NICHT über `eli/treaty`, sondern über konsolidierte `eli/cc`-ELIs** — `fedlex-cache.sh:321` `cisg|cc/1991/307_307_307|…|0.221.211.1`, `:322 lugue|cc/2010/801|…`. Konsolidierte Staatsverträge = **selber Namespace + Markup-Vertrag** wie Bundesgesetze. **Königsweg = unveränderte bestehende Pipeline**, kein treaty-Extraktor. SR→ELI via `fedlex-eli-aufloesen.ts`; HTML via `fedlex-cache.sh`. `eli/treaty` **nur Fallback je Kandidat** (POC-Fetch, ob `dateApplicability`/`art_*`-HTML; [zu verifizieren durch Opus, nie generalisieren]).

**Extraktion — reine Wiederverwendung, keine neuen Skripte.**
- *Phase A Kuratierung (~0,5 Session):* Startliste [je Kandidat POC/Triage durch Opus]: HKsÜ 96 (0.211.231.011), HUnterhaltsÜ 2007 (0.211.213.02), ESÜ (0.211.230.01), Apostille (0.172.030.4), WÜD/WÜK (0.191.01/02), UNO-BRK (0.109), Istanbul-Konv. (0.311.35), EAUe (0.353.1), CMR (0.741.611), Montrealer Übk (0.748.411), EPÜ 2000 (0.232.142.2), RBÜ (0.231.15), DBA-DE (0.672.913.62). **Kritik-Korrektur (Finding 19):** Liste ist **nicht triagiert** — Risiko, dass ein Grossteil auf `pdf-embed`/`nur-live-link` fällt und der „gleiche Qualität"-Nutzen kleiner ausfällt als impliziert; auf ~6–10 kürzen mit dokumentierter Begründung.
- *Phase B POC je Kandidat (§7-Pflicht):* `eli-aufloesen --sr 0.x` → cc-ELI? → Filestore-HTML fetchen (`fetchMitWiederholung`) → `art_*`-Anker + Sanity → Triage: extrahierbar → `snapshot`; SPA-Shell/PDF → `pdf-embed`; sonst `nur-live-link`. Ergebnis je Kandidat mit Beleg (URL/Datum/Ankerzahl) dokumentieren.
- *Phase C Bau:* `snapshot` → Pin in `cache.sh` (Pflicht-Anker empirisch) → `extrahiere-fedlex.ts` (unverändert) → Registereintrag `bund(KEY,…,'0.x','international',lfd-Nr)`. `pdf-embed` → `PDF_EMBED`-Eintrag + amtliches PDF. Vor Extraktion Skill `scraping-swiss-official-sources` laden.

**DB-Schema.** **Kernentscheid: Staatsverträge sind ERLASSE, nicht Materialien** — schon heute `ErlassRegistereintrag`/`NormSnapshot`. Null neues Schema; landen bei E0 automatisch in `erlasse`/`artikel`/`erlass_fassungen`; `check:paritaet`/gegenpruefung-Globs greifen ohne Sonderfall (sauberste Andockung). Die `materialien`-Tabelle (E6b nennt „Staatsverträge") ist **nur für Begleitmaterialien** (Botschaft zum Vertrag = Paket 2) — Abgrenzung im Commit festhalten, damit E6b nicht doppelt baut. Kein Ad-hoc-Format.

**UI-Andockung.** **Kein neues UI.** Rubrik „International/Staatsverträge" existiert (`register.ts:67`); neue Einträge erscheinen automatisch in Systematik + Leser (Stand-Chip + `↗ geltende Fassung`) bzw. pdf-embed-Viewer. Reihenfolge hinter `STAATENLOSE` (108) fortführen. L0 (**Geltungsbereich-Anhänge/Protokolle nie stumm droppen** — LugÜ-Protokolle-Lektion), §1/§13/§15. `nur-live-link` → §8-Fallback-Stub-Muster.

**Verifikations-Tor.** Bestehende Tore greifen automatisch (`check:caches`, `check:fedlex-versionen`, `check:vollstaendigkeit`, `check:normtext`, `check:struktur-konsistenz`/`tabellen`/`bilder`/`confidence`/`pdf`/`pdf-netz`, `check:paritaet`). **[zu verifizieren durch Opus]:** ob `check:fedlex-versionen` für `eli/treaty`-Sonderfälle Consolidations findet — wenn nein, Kandidat NICHT als snapshot (pdf-embed/nur-live-link), Tor nie aufweichen. `check:gegenpruefung` Pflicht je Vertrag (Artikelzahl, Stichprobe-Wortlaut, Stand, Anhänge?) gegen amtliche Seite → `gegenpruefung:ok`. Playwright-Sichtprüfung (Desktop/mobil/Dark).

**Risiken.** Struktur-Untreue (fehlende artikelweise Konsolidierung, Vorbehalte/Geltungsbereich je Staat, mehrsprachig authentisch) = **Hauptrisiko** → Triage strikt „im Zweifel pdf-embed", Anhänge nie stumm (L0). `eli/treaty`-Markup unbekannt → nur Fallback, POC je Kandidat. Currency (Beitritts-Updates ohne neue Konsolidierung) → Restlücke dokumentieren (§8). Scope-Creep → harte Obergrenze, Mehrwert-Test §0.

**DoD.** Kuratierte Liste + Triage-Ergebnis je Kandidat in `FAHRPLAN-INTERNATIONAL-VOLLTEXT.md` (kein neuer Fahrplan) · je Vertrag Pin/PDF_EMBED/Stub + Registereintrag + Snapshot · `npm run check` + `check:netz` + `check:gegenpruefung` grün · Playwright-Sichtprüfung, Anhänge gerendert oder als Hinweis+Link · kein neues Format/Skript · STRUKTUR.md + Fahrplan · §14 W2·6 · **kein Push/Deploy ohne §9-Ja.**

**Aufwand: S–M** (Recherche+POC ~0,5 · Bau je Handvoll ~0,5–1). **Abhängigkeiten:** keine harte zu 1/2/5/3 (nur bestehende Gesetze-Pipeline). Botschaften ZU Verträgen (Genehmigungsbeschlüsse) = Paket 2. Baubar vor E0/E1.

---

## Paket 6 — Was Fedlex NICHT hergibt (ehrliche Abgrenzung)

**Rechtsprechung ist NICHT in Fedlex.** Fedlex = **nur Gesetzgebung** (Erlasse, Materialien, Verfahren, Staatsverträge). Bundesgerichts-/kantonale Entscheide kommen aus **OpenCaseLaw / bger.ch / entscheidsuche.ch** und sind bereits eigener Strang (ROADMAP **W2·6**, `FAHRPLAN-RECHTSPRECHUNG.md`, `FAHRPLAN-OPENCASELAW-QUELLEN.md`) — **hier ausserhalb des Scopes.** Ebenfalls nicht Fedlex: EU-Recht (EUR-Lex → `international-extern.ts`), kantonale Erlasse (LexWork/lexfind), Parlaments-Ratsdebatten (parlament.ch/Curia → nur Deep-Link).

---

## 5. Recht/Lizenz-Leitplanken (Do/Don't)

**DO.**
- Ausschliesslich `https://fedlex.data.admin.ch/sparqlendpoint` (POST, live) + Fedlex-Filestore-HTML für alle Pakete. `jolux:*` ist Legilux-Vokabular auf dem amtlichen CH-Endpunkt = amtlich, kein Dritt-Byte.
- Jeder Eintrag mit `quelleUrl` (http/s, Pflicht §7c), `stand`, `abgerufen`, Live-Link, §8-Status-Marker („maschinell zugeordnet, amtliche Quelle massgeblich").
- P1-Umfang strikt `nur-live-link` für Botschaften/Historie/Vernehmlassungen — kein Snapshot ohne volle §7-Zitat-Ausnahme (a)-(d). Staatsverträge = Erlasse/Snapshots (§7-Zitat-Ausnahme über `stand`/`quelleUrl`/`abgerufen`/`fassungsToken`/`sha` erfüllt).
- Vor jeder Extraktion Skill `scraping-swiss-official-sources` laden (Daueranweisung).

**DON'T.**
- **Nie `droid-f/fedlex` (CC BY-NC-SA)** oder irgendeinen Dritt-Crawl als Datenquelle — auch nicht „nur zur Beschleunigung". Kein fremdes Byte fliesst ins Produkt. (Fakten/Lücken-Liste lesen wäre erlaubt, wird hier aber nicht gebraucht — SPARQL reicht direkt.)
- Keine Machbarkeits-Annahme ungeprüft bauen (Prädikate/Füllraten/`eli/treaty`-Markup) — erst POC/Query-Probe, dann Pipeline.
- Keine UNION-Query ungeprüft für Coverage-Zählungen (~700-statt-alle-Falle) — gegen bekannte Gesamtzahl (218/229) plausibilisieren.
- Keine Text-Snapshots von Botschaften/AS/Vernehmlassungen in P1 (Zeitsperre bis 1.12.2026, §7).

---

## 6. Offene Verifikationspunkte für Opus (empirisch VOR Bau prüfen)

**P0 (blockieren Aufwand-Freigabe des jeweiligen Pakets):**
1. **Paket 2/5 Feld-Füllraten korpusweit** (nicht nur AVIG/DSG): Datum/Titel/Curia (P2) und `botschaftDate`/`historicalId`/Sprach-Kante (P5) über alle 218 messen — sonst halbe/leere Einträge trotz „belegt"-Status.
2. **Paket 2 Prädikate am Botschafts-Knoten** (Datum/Titel/Curia via `isExemplifiedBy`) + `FILTER(STRSTARTS)`-Verhalten bei Legacy-`6006`-URIs (über-/untermatch).
3. **Join-Kette P2↔P5**: dass `ocUri`/`botschaftDate` in Paket 2 gespeichert und in Paket 5 matchbar sind (sonst `botschaftKey` durchgehend NULL).

**P1 (vor Produktivsetzung):**
4. Generator-Erlass-Filter-Flag (`--nur=`?) in `scripts/normtext-snapshot.ts`.
5. PDF/A-Existenz unter neuen `kons` für EMRK (20220916)/NYÜ (20260506) per Probe-Fetch.
6. Paket 5: Sprach-Kante an `isRealizedBy`; data-URI→Portal-URL-Mapping für AS-Anzeige-Link; Abstract-Enumeration je SR (Totalrevision); Datum-Matching-Toleranz (a)↔(b) an 3 Referenzgesetzen.
7. Paket 3 Rest-POC: Voll-Lauf 218 SR (Trefferverteilung/Batch), Status-0/1 ohne `cons-open`, Institutions-Labels, ältester Eintrag.
8. parlament.ch-Deep-Link-URL-Muster (Curia-Nr. → Geschäft-URL) — sonst D1-Verstoss (Wert ohne validen Link).
9. Paket 4: `eli/treaty`-Markup je Kandidat; Triage jeder Startlisten-Position (snapshot/pdf-embed/nur-live-link).

**Bestätigt (nicht mehr offen):** Endpunkt real + Datenlieferung (COUNT=2548, OR→33, DSG-Botschaften=2, DSG-Revisionen=19 live reproduziert); Regex-Blindfleck + 13+ Ziffern-Pins (Repo-verifiziert); `ingest.ts` deckt nur Bund-Normtext; gegenpruefung-Globs-Löcher.

---

## Priorisierte Gesamt-Reihenfolge

1. **Paket 1 — Currency/Coverage** `[P0, QS-CURRENCY]` — heilt aktiven Treuedefekt, Pipeline belegt, Aufwand M.
2. **Paket 2 — Botschaften** `[P1, W2·6]` — Vorzeige-Paket, Machbarkeit belegt, hoher Neuwert, Aufwand M–L.
3. **Paket 5 — Änderungshistorie / Amtliche Sammlung** `[P1.5, W2·6-REV]` — Schwester zu Paket 2, erbt dessen Pipeline, Machbarkeit belegt (DSG live), Aufwand M–L. Komplettiert mit Paket 2 die volle Gesetzes-Geschichte.
4. **Paket 3 — Vernehmlassungen** `[P2, W3·11]` — erbt Paket-2-Pipeline, Machbarkeit erst per POC, Aufwand L.
5. **Paket 4 — Staatsverträge** `[P3, W2·6/W3·13]` — kuratierte Feinarbeit, geringster Grenznutzen, Aufwand S–M.

**Querschnitt für alle:** amtliche Fedlex-Quelle only · Opus baut (Risiko-Pfad → `check:gegenpruefung` Pflicht) · §7-Verifikation · §9-Deploy nur mit Davids Ja · je Paket §14-Intake gesetzt.

---

## 7. Reihenfolge & Meilensteine (mit abnahme-tauglichen Zwischenständen)

| # | Meilenstein | Abnahme-tauglicher Zwischenstand (David kann es prüfen) | Aufwand |
|---|---|---|---|
| **M1** | **Paket 1 · P1-b** (Regex-Fix + Selbsttest + Coverage-Assertion + PDF-Embed-Monitoring) | `check:fedlex-versionen` sieht erstmals die 13+ Ziffern-Pins; kein Volltext ohne Pin mehr möglich (Tor rot bei Verstoss) | ~0,5 S |
| **M2** | **Paket 1 · P1-a/c/d** (20 stale aktualisiert, 56 Wiedervorlagen, Currency-Chips) | Kein stale Erlass live; „geltend geprüft am"-Chip sichtbar (beide Leser-Instanzen); Gap-Report-Defekt behoben | ~1,75 S |
| **M3** | **Paket 2 · Botschaften** (Entstehungsgeschichte, POC-belegt, Kontext-Bus, `ingestMaterialien`) | Auf DSG/AVIG die Botschaften *auf der Gesetzseite*; §8-Marker; Gegenprüfung quittiert | ~2,5 S |
| **M4** | **Bridge B1 · Norm-Kontext-Bus** | Botschaft + (bestehende) Entscheide im selben Panel an der Norm — der Verzahnungs-Beweis | ~0,5–1 S |
| **M5** | **Paket 5 · Änderungshistorie** (Revisionen-Timeline, Verzahnung mit M3, nicht-konsolidiert-Marker) | Auf DSG die Timeline vor+nach Totalrevision 2020; „Botschaft ansehen"-Verweis funktioniert | ~2,5 S |
| **M6** | **Paket 3 · Vernehmlassungen** (Laufend-Badge, Currency-Arbiter-Netztor) | Auf OR die 33 Verfahren + Laufend-Badge „läuft bis …"; abgelaufene nie als laufend | ~2,25 S |
| **M7** | **Paket 4 · Staatsverträge** (opportunistisch, nach B1) | ~6–10 kuratierte Verträge in gleicher Qualität; Anhänge nie stumm | ~1–1,5 S |

**Reihenfolge bindend 1 → 2 → (B1) → 5 → 3 → 4.** Jeder Meilenstein endet mit: alle Tore grün, adversariale Gegenprüfung quittiert (`gegenpruefung:ok`), Playwright-Sichtprüfung (mobil+Dark), §14-Intake gesetzt, STRUKTUR.md nachgezogen — **und wartet auf Davids §9-Ja vor Push/Deploy.** Autonom-Modus (Daueranweisung): innerhalb eines freigegebenen Pakets alles am Stück, pro Schritt Bug-Check, ohne Rückfrage — hebt das §9-Deploy-Ja nicht auf.

**Cross-Package-Invarianten (über alle Meilensteine gaten):** (a) `check:paritaet` deckt jede neue Projektionsdatei explizit (Ingest-Erweiterung ODER Allowlist — nie still-grün); (b) `check:gegenpruefung`-Globs decken jeden neuen Risiko-Pfad (`scripts/fedlex-*`, `scripts/materialien/**`, `public/materialien/*.json`) und die Rot-Auslösung ist positiv getestet; (c) Norm→Material-Index/Sidecar-Sharding statt clientseitiger Voll-Iteration über `register.json` (§15); (d) beide Leser-Instanzen (Haupt + Split-View-Pane) bei jedem neuen Abschnitt; (e) neue Schema-Elemente in FAHRPLAN-DATENHALTUNG §3 zurückgetragen (E6b-Koordination); (f) trilinguale Titel (`titel_de/fr/it`) in allen materialien-Paketen; (g) Fetch-Fehler-Zustand ≠ Leerzustand.

---

## Offene Entscheidungen für David

1. **Live-Link vs. Snapshot (Botschaften).** Empfehlung: P1 **`nur-live-link`** (kein §7-Risiko, keine Fachzeit, zeitsperre-konform); Volltext-Snapshot erst P2 → **[D]** bis 1.12.2026.
2. **Nur vorhandene Gesetze vs. alle (Botschaften).** Empfehlung: P1-Grenze «nur die 218 Volltext-Erlasse» halten.
3. **Umgang mit Pre-2000.** Empfehlung: Lücke transparent als Hinweis ausweisen (nicht stumm weglassen).
4. **Behörden-Taxonomie für den Bundesrat.** Empfehlung: gleicher Namespace mit neuem Doktyp `botschaft` + eigener «Entstehungsgeschichte»-UI-Sektion (minimaler Umbau, klare Trennung).
5. **Currency-Coverage-Assertion (Paket 1).** Empfehlung: **hart** blockieren (Exit 1), wenn ein Volltext-Erlass keinen Pin hat — genau die Blindstelle, die den Report nötig machte.
