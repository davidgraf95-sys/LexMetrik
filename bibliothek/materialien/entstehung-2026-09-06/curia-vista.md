# Curia Vista / ws.parlament.ch — Recherche 6.9.2026

*Kopiert unveraendert aus Recherche 6.9.2026, Agent Sonnet, read-only.*

Alle Live-Abfragen empirisch mit `curl` am 6.9.2026 gegen `https://ws.parlament.ch/odata.svc/`
verifiziert (Rohdateien im selben Scratchpad-Ordner: metadata.xml, *_sample.json).
Amtliche Doku-Seite: https://www.parlament.ch/de/über-das-parlament/fakten-und-zahlen/open-data-web-services
(Abruf 6.9.2026, HTTP 200, 197'497 Bytes).

## 1. Web Services — belegt

- **Endpoint aktiv, modern:** `https://ws.parlament.ch/odata.svc/` — OData v3 (JSON "verbose"-
  Envelope `{"d":{"results":[...],"__next":"..."}}` bei Server-Paging, `{"d":[...]}` wenn
  Resultat < Page-Grösse). `$metadata` liefert 130'112 Bytes XML, HTTP 200 — belegt.
- **Entitäten bestätigt vorhanden** (aus `$metadata`, 49 EntityTypes gezählt): Business,
  BusinessStatus, BusinessType, BusinessResponsibility, BusinessRole, Bill, BillLink,
  BillStatus, Preconsultation, Publication, Objective, Resolution, Rapporteur, Vote, Voting,
  Transcript, Committee, Council, MemberCouncil(+History), MemberCommittee(+History),
  MemberParlGroup(+History), MemberParty(+History), Person(+Address/Communication/
  Employee/Interest/Occupation), Party, ParlGroup(+History), Session, Meeting,
  LegislativePeriod, Subject, SubjectBusiness, Tags, RelatedBusiness, Canton, Citizenship,
  External, SeatOrganisationNr/Sr, Mutation — belegt, `metadata.xml`.
- **Server-seitiges Paging real, nicht nur `$top`:** `$top=10000` und kein `$top` liefern
  beide exakt 1000 Datensätze + `__next`-Link mit `$skiptoken` (empirisch: Business,
  Filter Language eq 'DE', 67'376 Treffer laut `$count`, aber nur 1000/Request) — belegt.
  Für Bulk-Export sind also ~68 Requests nötig für Business DE allein.
- **`$count` funktioniert** als Suffix (`/Business/$count?...` → `67376`) — belegt.
- **Format:** `$format=json` liefert JSON; XML ist Default (Atom/OData), nicht separat
  geprüft — unklar, ob CSV/Bulk-Dump existiert (s.u.).
- **Rate-Limits:** keine `X-RateLimit-*`-Header in Response-Headers beobachtet (nur Akamai
  CDN-Header `akamai-grn`, Cache-Control no-store) — belegt (Header-Dump), aber Abwesenheit
  von Headern ⇏ Abwesenheit von Limits; kein Auth/API-Key im Query nötig (alle Calls ohne
  Header/Key erfolgreich) — belegt.
- **`ws-old.parlament.ch`:** Root `https://ws-old.parlament.ch/` antwortet HTTP 200 (curl,
  6.9.2026), aber getesteter Pfad `.../BusinessesFullTextSearch.svc/` → 404. Die *aktuelle*
  offizielle Doku-Seite (Abruf 6.9.2026) nennt weiterhin **`ws-old.parlament.ch` als
  "aktuellen Webservice"** und erwähnt eine "neue, nutzerfreundlichere API" als geplant,
  ohne Termin — das widerspricht dem empirischen Befund, dass `ws.parlament.ch/odata.svc`
  bereits produktiv und vollständig ist. Einschätzung: Doku-Seite ist veraltet/inkonsistent
  gepflegt; `ws.parlament.ch` (ohne "-old") ist der tatsächlich aktuelle, vollwertige
  OData-Dienst — **unklar**, ob `ws-old` inhaltlich identisch, ein Alt-Schema oder abgekündigt
  ist; nicht tiefer erforscht (Scope-Grenze).
- **opendata.swiss:** Datensatz `webservices-httpws-old-parlament-ch` existiert im Katalog
  (Suchtreffer via WebSearch, Titel: "Webservices : http://ws-old.parlament.ch"); Detailseite
  bei direktem Fetch HTTP 403 (Bot-Schutz), Ryan-Retry via CKAN-API-Redirect
  (`ckan.opendata.swiss/api/3/action/package_search`) ebenfalls 403 blockiert — **unklar**,
  Lizenz/Beschreibung im opendata.swiss-Eintrag nicht direkt einsehbar in dieser Session.
- **Bulk-Download:** keine separate Bulk/CSV-Download-Seite gefunden; Web-Recherche und
  Doku-Seite nennen keinen Bulk-Endpoint — **unklar/vermutlich nicht vorhanden**, Bulk müsste
  selbst via paginierte OData-Calls zusammengebaut werden.

## 2. Lizenz / Nutzungsbedingungen — belegt (Zitat)

Von der offiziellen Seite (WebFetch + curl-Bestätigung des Wortlauts im Roh-HTML,
6.9.2026): wörtliches Zitat:

> "Die Daten dürfen nur mit Angabe der Quelle «Parlamentsdienste der Bundesversammlung, Bern»
> verwendet werden." / "Die Daten dürfen inhaltlich nicht verändert werden."

Zusätzlich laut Fetch-Zusammenfassung: Download-Datum muss dokumentiert werden, kein falscher
Eindruck einer amtlichen Publikation, Haftungsausschluss der Parlamentsdienste. Für LexMetrik
(Art. 5 URG ohnehin einschlägig, da amtliches Dokument) unproblematisch, aber **Zusatzpflicht
Quellenangabe + Änderungsverbot + Abrufdatum-Dokumentation** ist strenger als reine URG-Freiheit
— zu beachten bei Snapshot-Speicherung (§7 Zitat-Ausnahme im Repo verlangt ohnehin Stand+Quelle).

## 3. Fedlex/BBl/AS-Join-Schlüssel — belegt

**Kein direktes SR-Nummer- oder ELI-Feld** in Business/Bill/Publication/Objective gefunden
(Grep über volle `$metadata`) — belegt (Negativbefund). Der Join zu Fedlex läuft indirekt
über **Publikations-Koordinaten**, nicht über eine ID:

- **`Publication`-Entität** (verknüpft mit Business via `BusinessNumber`): Felder
  `PublicationTypeAbbreviation` (**"BBl"**), `Year`, `Volume`, `Page`, `Title` — Beispiel
  (Geschäft 78.222, live abgefragt): `{"PublicationTypeAbbreviation":"BBl","Year":"1980",
  "Volume":"III","Page":"1047"}`. Das entspricht der klassischen BBl-Zitierweise
  "BBl 1980 III 1047", die sich gegen Fedlex/admin.ch auflösen lässt — **belegt, aber kein
  direkter Deep-Link/BBl-Nummer im modernen Format (z.B. "BBl 2023 1234")**, nur alte
  Band/Seiten-Notation (`IsOldFormat:true` im Beispiel).
- **`Objective`-Entität** ist der reichhaltigste Fund: Felder `ReferenceTypeName` (Werte
  empirisch aus 1000 DE-Datensätzen: **"Beratungsgegenstand / Entwurf", "Bericht",
  "Stellungnahme des Bundesrates", "Schlussabstimmungstext", "Erlasstext", "Amtliche
  Sammlung"**), `PublicationTypeName` (**"Bundesblatt"** oder **"Amtliche Sammlung"**),
  `PublicationVolume`/`PublicationYear`/`PublicationNumber`, **`ReferendumDeadline`**
  (DateTime, in Stichprobe bei 118/1000 Datensätzen gesetzt) — belegt. Das ist der
  gesuchte Join-Pfad Botschaft → Schlussabstimmungstext → **AS-Publikation** (Amtliche
  Sammlung, Jahr+Nummer) → **Referendumsfrist**. AS-Jahr+Nummer lässt sich gegen Fedlex/
  `fedlex.data.admin.ch` auflösen (nicht in dieser Session gegengeprüft — **unklar/offen**,
  ob 1:1 exakt matchbar ohne manuelle Normalisierung, insb. bei `IsOldPublicationFormat`).
- **`BillLink`**: freie externe Links (`LinkUrl`) zu Dokumenten, aber via
  `parlament.ch/.../DocIdRedir.aspx?ID=DOCID-...` (Parlaments-eigenes Redirect-System, kein
  Fedlex/ELI-Link) — belegt, Beispielsatz oben.
- **Fazit Join:** Es gibt **keinen harten Fremdschlüssel** Curia-Vista↔Fedlex; der Join ist
  über **(PublicationType, Year, Volume/Number)** zu konstruieren — fehleranfällig bei
  Altformat-Datensätzen, aber für Botschaft/BBl/AS/Referendumsfrist grundsätzlich machbar.
  Inkrafttreten selbst (Datum) taucht in dieser Stichprobe nicht als eigenes Feld auf — nur
  Referendumsfrist; Inkrafttreten müsste weiterhin über Fedlex/AS bezogen werden — **offen**.

## 4. Amtliches Bulletin / Transcript — belegt

- **`Transcript`-Entität**: **Volltext inline** im Feld `Text` (HTML-artiges Markup
  `<pd_text><p>...`), nicht nur Link — belegt, Beispiel ID=1 (Session Wintersession 1999,
  Sprecher Jacques Neirynck) mit vollständigem Redetext. Felder: `SpeakerFullName`,
  `SpeakerFunction`, `CouncilName`, `MeetingDate`, `IdSession`, `Start`/`End` (Zeitstempel),
  `LanguageOfText`, Bezug zu `VoteId`/`Businesses` (deferred Navigation) — belegt.
- **Grösse:** `Transcript/$count` (Filter DE) = **346'433** Datensätze — belegt, Live-Call.
  Bei durchschnittlich mehreren hundert bis tausend Zeichen Text pro Eintrag ist das ein
  Corpus im hohen zweistelligen bis dreistelligen MB-Bereich für DE allein — grobe Schätzung,
  nicht exakt vermessen (kein Volltext-Download in dieser Session durchgeführt).

## 5. Namensabstimmungen, Kommissionsberichte, Bills — belegt

- **`Vote`** (Geschäftsebene, ein Abstimmungsvorgang): `BusinessNumber`, `BillNumber`,
  `Subject` ("Gesamtabstimmung" etc.), `SessionName`, `VoteEnd` — belegt, Beispiel ID=1
  (Geschäft 03.054, Wintersession 2003). `Vote/$count` (DE) = **24'187** — belegt.
- **`Voting`** (Personenebene, Stimme je Ratsmitglied je Vote): `IdVote`, `PersonNumber`,
  `FirstName/LastName`, `Canton`, `ParlGroupCode`, `Decision`/`DecisionText` — vollständig
  strukturiert, kein Freitext nötig für Namensabstimmungen — belegt.
  `Voting/$count` (DE) = **4'835'234** — belegt (sehr gross, > 4,8 Mio. Einzelstimmen).
- **`Bill`** (Erlassentwurf-Ebene je Geschäft): `IdBusiness`, `BusinessNumber`, `BillNumber`,
  `BillTypeName`, `BusinessStatusText` — belegt.
- **`BillLink`**: Dokument-Links (Kommissionsunterlagen etc.) mit `LinkType`,
  mehrsprachig (DE/FR/EN je eigener Datensatz gleicher `ID`+`StartDate`) — belegt.
- **`Preconsultation`**: Kommissions-Vorberatung je Bill (`CommitteeName`,
  `PreconsultationDate`, `TreatmentCategory`) — belegt (Feldliste aus `$metadata`), kein
  Live-Sample gezogen.
- **Kommissionsberichte als Volltext:** nicht in eigener Entität gefunden; vermutlich nur
  via `Publication`/`Objective` (ReferenceTypeName "Bericht") mit BBl-Koordinaten referenziert,
  nicht als Volltext in der API — **unklar**, nicht abschliessend verifiziert.

## 6. Drittprojekte (nur genannt, nicht geprüft)

- **`swissparl`** R-Paket (CRAN, aktuell Version 0.3.0 lt. Suchtreffer, Autor David Zumbach,
  GitHub github.com/zumbov2/swissparl) — kapselt exakt `ws.parlament.ch/odata.svc` plus
  zusätzlich eine dritte Quelle **`api.openparldata.ch`** ("OpenParlData", auch kantonale/
  kommunale Parlamente) — Fund aus WebSearch, nicht selbst gegen die API geprüft.
- Politmonitor, lobbywatch, weitere opendata.ch-Hackathon-Projekte: in Suchtreffern nur
  am Rand sichtbar (z.B. hack.opendata.ch/project/948), nicht einzeln verifiziert — **offen**.

## Offene Fragen (nicht abschliessend geklärt)

1. Ist `ws-old.parlament.ch` inhaltlich noch relevant/unterschiedlich zu `ws.parlament.ch`,
   oder ist die offizielle Doku-Seite schlicht veraltet? (Widerspruch Doku vs. Empirie.)
2. Existiert ein echter Bulk-Download (Full-Dump), oder ist Vollimport nur via ~1000er-
   Pagination über Monate von Entitäten möglich (bei Voting z.B. 4835 Requests à 1000)?
3. opendata.swiss-Lizenzfeld für den ws-old-Datensatz (403 blockiert in dieser Session).
4. Exaktheit des BBl/AS→Fedlex-Joins bei Altformat-Publikationen (`IsOldFormat:true`).
5. Wo genau steht das Inkrafttretedatum strukturiert (nicht nur Referendumsfrist)?
