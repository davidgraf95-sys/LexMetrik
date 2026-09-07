# Fedlex-Wissensgraph: Gesetzgebungsprozess-Kette — empirische Sichtung

*Kopiert unveraendert aus Recherche 6.9.2026, Agent Sonnet, read-only.*

Abrufdatum aller Befunde: **6.9.2026**. Endpoint: `https://fedlex.data.admin.ch/sparqlendpoint`
(POST, `Accept: application/sparql-results+json`, jolux-Ontologie). Alle Zahlen live erhoben,
keine Sekundärquelle.

## 0. Kontext (was das Repo schon nutzt)

`scripts/materialien/botschaften-generieren.ts` + `vernehmlassungen-generieren.ts` nutzen bereits:
- `?proj jolux:draftHasLegislativeTask ?event` (Botschaft-Kette, DIREKTE Kante statt STRSTARTS)
- `?botschaft jolux:typeDocument <resource-type/23>` (Botschaft des Bundesrates)
- `?proj jolux:parliamentDraftId` (Curia-Nr., z.B. "17.059")
- `jolux:Consultation` + `jolux:foreseenImpactToLegalResource` (Vernehmlassungen, direkte Norm-Kante)
- `jolux:consultationStatus` (Vokabular 0..6)

**Das Neue in dieser Recherche:** die `?event`-Knoten selbst tragen `jolux:legislativeTaskType`
aus dem Vokabular **`type-projet`** (NICHT `legislative-task-type` — falscher Namensraum in einer
ersten Vermutung, korrigiert nach leerer Probe) — das ist eine durchgehende **Zeitachse pro
Gesetzgebungsprojekt**, nicht nur der Botschaft-Einzelschritt.

## 1. Die Prozesskette am Beispiel DSG (SR 235.1, proj 8022/0491)

Query:
```sparql
PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>
SELECT ?event ?type ?decisionDate ?res ?resType WHERE {
  <https://fedlex.data.admin.ch/eli/dl/proj/8022/0491> jolux:draftHasLegislativeTask ?event .
  ?event jolux:legislativeTaskType ?type .
  OPTIONAL { ?event jolux:decisionDate ?decisionDate }
  OPTIONAL { ?event jolux:legislativeTaskHasResultingLegalResource ?res .
             OPTIONAL{?res jolux:typeDocument ?resType} }
} ORDER BY ?event
```
Ergebnis (5 Events, DSG-Totalrevision):

| event | type-projet | Label | decisionDate | resultingLegalResource | resType |
|---|---|---|---|---|---|
| /event/1 | 8 | Publikation der Eröffnung im BBl | 2016-12-28 | fga/2016/2181 | 40 (Eröffnung Vernehmlassungsverfahren) |
| /event/2 | 200 | Botschaft des Bundesrats | 2017-09-15 | fga/2017/2057 | 23 (Botschaft) |
| /event/3 | 300 | Beschluss des Parlaments | 2020-09-25 | fga/2020/1998 | 21 (Bundesgesetz — Schlussabstimmung) |
| /event/4 | 400 | Ablauf der Referendumsfrist am | 2021-01-14 | — | — |
| /event/5 | 1 | Vernehmlassung | — | proj/6016/61/cons_1 | (Consultation-Link, matcht das VERN-Dossier) |

→ **Belegt: der Graph liefert de facto die ganze Kette Vernehmlassung → Botschaft →
Schlussabstimmung → Referendumsfrist als eine Sequenz von `LegislativeTask`-Events am selben
`?proj`-Knoten**, inkl. Datum + Link zur jeweiligen BBl-Publikation (`fga`). Für DSG kein
Referendum ergriffen → keine Events Typ 480/490/650/9 an diesem proj (konsistent: kein
Volksabstimmungs-Fall).

## 2. type-projet-Vokabular — vollständige Liste + korpusweite Belegungszahlen

Abfrage `COUNT(*)` je Typ-URI `.../vocabulary/type-projet/{N}` über den ganzen Graph:

| Code | Label (DE) | # Events (Graph) |
|---|---|---|
| 1 | Vernehmlassung | 229 |
| 2 | Erlassentwurf | 225 |
| 4 | Eröffnung der Vernehmlassung | 130 |
| 6 | Veröffentlichung des Ergebnisberichts | 4 |
| 8 | Publikation der Eröffnung im BBl | 99 |
| 200 | Botschaft des Bundesrats | **7299** |
| 201 | Stellungnahme des Bundesrates | 102 |
| 300 | Beschluss des Parlaments | **4931** |
| 301 | Bericht Kommission | 118 |
| 400 | Ablauf der Referendumsfrist am | **1868** |
| 480 | Ref. Zustandegekommen | 202 |
| 490 | Ref. nicht zustandegekommen | 39 |
| 630 | Festlegung Abstimmungsgegenstände BR | 164 |
| 650 | Abgestimmt am | **629** |
| 9 | Ergebnis der Volksabstimmung | 13 |

**Befund, unklar→jetzt geklärt:** Referendums-/Abstimmungs-Ereignisse SIND im Graph modelliert
(anders als eine erste Fehlprobe unter dem falschen Vokabular-Namensraum nahelegte, die 0 Treffer
zeigte — Falle: `legislative-task-type` existiert nicht, korrekt ist `type-projet`). Aber:
- **Typ 650 „Abgestimmt am"** (629 Fälle) trägt nur `decisionDate` — das ist das
  **Abstimmungsdatum**, kein Ergebnis.
- **Typ 9 „Ergebnis der Volksabstimmung"** (nur 13 Fälle korpusweit!) trägt `decisionDate` +
  optional `legislativeTaskHasResultingLegalResource` → Link auf die BBl-Publikation des
  Bundesratsbeschlusses über das Abstimmungsergebnis (Beispiel: proj/8022/0462/event/3,
  decisionDate 2022-05-15, res=fga/2022/2010). **Keine Ja/Nein-Prozente, keine
  Stimmbeteiligung, kein Kantons-Mehr** — nur Datum + Publikations-Link. Für die eigentlichen
  Resultatzahlen bleibt swissvotes.ch/BK die Quelle (Frage 4).

Belegprobe Typ 650 (Auszug, DESC sortiert nach decisionDate):
```
proj/7024/0154 → 2025-09-28   proj/2019/1400 → 2024-11-24   proj/7021/0077 → 2024-06-09
proj/7021/0466 → 2024-03-03   proj/8522/1536 → 2023-06-18   proj/2019/3433 → 2020-11-23
```
(Diese Daten sind tatsächliche eidgenössische Abstimmungssonntage — 28.9.2025, 24.11.2024 etc. —
das bestätigt die Feld-Semantik als Abstimmungstermin, nicht Publikationsdatum.)

## 3. Curia-Vista-Geschäftsnummer

`jolux:parliamentDraftId` am `?proj`-Knoten IST die Curia-Vista-Nummer im Format `NN.NNN`
(Beleg: DSG-proj 8022/0491 → `17.059`; proj 2002/2754 → `03.016`). Zusätzlich `jolux:draftId`
= reine Ziffernfolge (`20171085` = Jahr+laufende Nr. ohne Punkt, intern). Kein separates
`legislativeTaskNumber`-Property gefunden — die Geschäftsnummer hängt am **proj**, nicht am
einzelnen Event. **Format-Varianz bestätigt** (bereits im Botschaften-Dossier notiert):
Legacy-Fälle `1988.032` (Bindestrich-/Punktschema vor 2000). `jolux:draftHasStage` liefert
zusätzlich 1-4 `migstage`-Knoten pro proj — Bedeutung nicht weiter exploriert (vermutlich
Migrations-/Pipeline-Metadaten, kein fachlicher Prozessschritt), als offen markiert.

## 4. Dokumenttypen — Kommissionsberichte, erläuternde Berichte

Vollständiges `resource-type`-Vokabular abgefragt (46 distinkte Typen). Relevant für die Frage:

| Code | Label |
|---|---|
| 23 | Botschaft des Bundesrates |
| 24 | Bericht des Bundesrates |
| 25 | Stellungnahme des Bundesrates |
| 30 | Bericht parlamentarische Kommission |
| 38 | Erlassentwurf |
| 40 | Eröffnung des Vernehmlassungsverfahrens |
| 84 | Schlussabstimmungstext |
| 54 | Fakultatives Referendum |

→ **Kommissionsberichte (parlamentarische Initiativen) SIND als Dokumenttyp 30 „Bericht
parlamentarische Kommission" erfasst** (118 Instanzen korpusweit, an type-projet/301
„Bericht Kommission"-Events verlinkt) — Frage 2, erster Teil: **belegt, ja**.

**Erläuternde Berichte zu Verordnungen (Frage 2, zweiter Teil): NICHT gefunden.** Geprüft:
(a) das volle 46-Typen-Vokabular enthält keinen Eintrag „Erläuternder Bericht"/„Rapport
explicatif"; (b) die Properties eines `jolux:Consultation`-Knotens (DSG cons_1 exploriert)
sind nur `hasSubTask, consultationStatus, eventDescription, eventTitle, eventId,
foreseenImpactToLegalResource, isOpinionOf, previousConsultationStatus` — **kein
Dokument-Link zu einem erläuternden Bericht**. Der erläuternde Bericht zur Vernehmlassung
einer Verordnung liegt (soweit hier geprüft) **ausserhalb des jolux-Graphen**, vermutlich
nur auf dem admin.ch-Vernehmlassungsportal (fedlex.admin.ch/eli/dl/proj/…/cons_1/de zeigt laut
Vernehmlassungs-Dossier eine Liste angehängter PDFs, aber das ist die SPA-Ansicht, nicht der
Graph). **Unklar/offen:** ob eine SPARQL-Property existiert, die diese Anhänge referenziert —
in der begrenzten Zeit keine gefunden; nicht abschliessend als „existiert nicht" zu werten,
aber alle naheliegenden Prädikate am Consultation-Knoten sind negativ getestet.

## 5. Bundesblatt-Volltext: Format — **kein XML/HTML, nur DOC + PDF/A**

Manifestations-Abfrage (`isRealizedBy → isEmbodiedBy → userFormat/isExemplifiedBy`) für zwei
Botschaften unterschiedlicher Epochen:

- DSG-Botschaft fga/2017/2057 (15.9.2017): Formate = `user-format/doc` + `user-format/pdf-a`
  je DE/FR/IT (6 Dateien). **Kein XML, kein HTML.**
- ZPO-Revisions-Botschaft fga/2020/653 (26.2.2020): identisch — nur `doc` + `pdf-a`.

`.doc`-Datei real geprüft (curl + `file`): **echtes binäres Word-97-2003-Dokument**
(Composite Document File V2), Metadaten: Title = „Botschaft zum Bundesgesetz über die
Totalrevision…", Template `Bot-Vorl.dot` (amtliche Botschafts-Formatvorlage der
Bundeskanzlei), 252 Seiten, 90'164 Wörter. **Das ist strukturierter als PDF** (Word-Absatz-
/Überschriftsformate bleiben erhalten, inkl. vermutlich der Kapitelstruktur
„Erläuterungen zu den einzelnen Artikeln" als eigene Word-Heading-Ebene) — ein
`.doc`-Parser (z.B. `antiword`, `python-docx2txt` nach Konvertierung, oder LibreOffice
`--headless --convert-to docx`) wäre der Hebel für artikelscharfe Botschaftsverweise, PDF
dagegen nicht. **Frage 3 („XML/HTML je BBl-Eintrag") ist damit empirisch verneint** — es gibt
nur DOC (alt-Word-Binärformat) + PDF/A, keine der beiden Fedlex-typischen Strukturformate
(AKN-XML wie bei Erlassen, oder HTML). Kapitelstruktur „Erläuterungen zu den einzelnen
Artikeln" nicht direkt im Graph, nur implizit über Word-Absatzformatierung im .doc.

## 6. Abstimmungsdaten Bund — Join-Schlüssel (Frage 4, nicht empirisch, nur recherchiert)

**Nicht per SPARQL geprüft** (ausserhalb des Fedlex-Endpoints, Zeitbudget) — hier nur benannt,
als offen markiert:

- **swissvotes.ch (Uni Bern/FORS):** Datenbank aller eidg. Volksabstimmungen seit 1848,
  Datensatz mit Ja/Nein-Anteil, Stimmbeteiligung, Kantons-Ständemehr. Lizenz: laut
  öffentlichem Auftritt „für nicht-kommerzielle/wissenschaftliche Nutzung frei, Quellenangabe
  Pflicht" — **exakte Lizenzklausel hier nicht verifiziert, offen**.
- **Bundeskanzlei (bk.admin.ch/Abstimmungen):** amtliche Endergebnisse, i.d.R. nur als
  HTML/PDF-Communiqué, kein erkennbarer maschinenlesbarer Feed ohne weitere Prüfung — offen.
- **opendata.swiss „Eidgenössische Volksabstimmungen":** laut CKAN-Katalog (nicht live
  abgefragt in dieser Runde) vermutlich BK-Datensatz mit Vorlagen-Nummer — **Join-Schlüssel zu
  BBl/Erlass nicht verifiziert**; die naheliegende Brücke wäre die **BBl-Nummer der
  Schlussabstimmung** (`fga/JJJJ/NNNN`, Dokumenttyp 21/84) oder das **Abstimmungsdatum**
  (`type-projet/650 decisionDate`, s. §2) als gemeinsamer Schlüssel — nicht empirisch getestet.

## 7. Empfehlung

1. **Die Prozesskette lohnt sich als Ausbau des Botschaften-Pakets, nicht als neues Paket:**
   `type-projet`-Events an bestehenden `?proj`-Knoten sind bereits im Join (`draftHasLegislativeTask`
   wird schon abgefragt) — ein zusätzliches `?event jolux:legislativeTaskType ?type` +
   `decisionDate` liefert Vernehmlassungs-Eröffnung, Schlussabstimmungsdatum,
   Referendumsfristablauf und ggf. Abstimmungsdatum **ohne neuen Endpoint-Fremdkörper**, reine
   SPARQL-Erweiterung der bestehenden Query in `botschaften-generieren.ts`.
2. **Kein Hebel für Volksabstimmungs-Resultate im Graph selbst** (nur 13 „Ergebnis"-Events,
   nur Datum+Link, keine Prozentzahlen) — dafür bleibt eine externe Quelle nötig (swissvotes.ch
   oder BK), mit eigener Lizenzprüfung vor Nutzung.
3. **BBl-Volltext-Hebel ist DOC, nicht XML/HTML** — für „Erläuterungen zu den einzelnen
   Artikeln" müsste ein `.doc`→Text-Konverter in die Pipeline (LibreOffice-Headless o.ä.), nicht
   der bestehende AKN-XML-Parser. Das ist ein separates Format-Problem, kein SPARQL-Problem, und
   entsprechend höherer Aufwand (Format-Ladder wie im Skill, aber ohne XML-Stufe).
4. **Erläuternde Berichte zu Verordnungen fehlen im Graph** — kein Fedlex-Hebel dafür ersichtlich;
   wenn gebraucht, wäre das eine Recherche auf dem admin.ch-Vernehmlassungsportal selbst
   (ausserhalb SPARQL), nicht in dieser Runde geprüft.
