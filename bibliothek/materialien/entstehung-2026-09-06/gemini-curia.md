**Zweitquelle Gemini (ungeprueft, nur mit Nachpruefung verwenden). Recherche 6.9.2026, read-only.**

Hier ist die kompakte Recherche zu den maschinenlesbaren Daten des Schweizer Parlaments für den Aufbau von LexMetrik:

### 1. Web Services / APIs
*   **API & Entitäten:** Die Parlamentsdienste betreiben eine offene OData-V3-Schnittstelle (JSON/XML) unter `ws.parlament.ch/odata.svc/` (No-Auth) mit Entitäten wie `Business`, `Vote`, `Voting` und `Transcript` [URL: https://ws.parlament.ch/odata.svc/, Abruf: 06.09.2026] (belegt).
*   **Plattformen:** `opendata.swiss` verweist lediglich auf diese Schnittstellen und bietet Metadaten [URL: https://opendata.swiss, Abruf: 06.09.2026] (belegt). Die alte URL `ws-old.parlament.ch` wurde weitgehend durch `ws.parlament.ch` abgelöst; eine grundlegend neue API ist offiziell in Planung [URL: https://www.parlament.ch/en/services/open-data, Abruf: 06.09.2026] (belegt).
*   **Lizenz & Limits:** Keine Authentifizierung erforderlich, aber Pflicht zur Namensnennung ("Parlamentsdienste der Bundesversammlung, Bern") und Verbot der Veränderung oder des Eindrucks amtlicher Publikationen. Es gibt keine harten Rate-Limits, bei grossen Abfragen (wie Transcripts) wird serverseitig Paging und Filtering empfohlen [URL: https://www.parlament.ch/en/services/open-data, Abruf: 06.09.2026] (belegt).

### 2. Verknüpfung zu Fedlex (BBl, SR/ELI, AS)
*   **OData -> Fedlex Linkage:** Die OData-API fokussiert auf den parlamentarischen Prozess (`Business`). Ob direkte, verlässliche Felder für BBl-Nummern oder ELI/SR-Nummern auf Einzelartikelebene maschinenlesbar als Metadaten im `Business`-Objekt vorliegen, ist ohne Abfrage des `$metadata`-Schemas nicht sicher [URL: https://ws.parlament.ch/odata.svc/$metadata, Abruf: 06.09.2026] (unklar).
*   **SPARQL für Gesetzestexte:** Für die effektive Verknüpfung (Botschaft → BBl → Erlass → AS → ELI → Inkrafttreten) ist der Fedlex SPARQL-Endpunkt (`fedlex.data.admin.ch/sparqlendpoint`) zwingend. Das Matching zwischen OData-Parlamentsgeschäft und Fedlex erfolgt meist über die formale Geschäftsnummer oder Publikationsdaten [URL: https://fedlex.data.admin.ch, Abruf: 06.09.2026] (belegt).

### 3. Amtliches Bulletin (Wortprotokolle)
*   **Transcripts via API:** Wortprotokolle sind über die Entität `.../odata.svc/Transcript` strukturiert abrufbar [URL: https://ws.parlament.ch/odata.svc/, Abruf: 06.09.2026] (belegt).
*   **Inhalte:** Die Entität liefert Datum, Rat, Sprecher (via Verknüpfung zu `Person`) sowie den Votums-Volltext. Ein Bulk-Download aller historischen Transcripts ist via API möglich, aber sehr ressourcenintensiv [URL: https://www.parlament.ch/en/services/open-data, Abruf: 06.09.2026] (belegt).

### 4. Abstimmungen, Dokumente, Fahnen
*   **Namensabstimmungen:** Sind hochstrukturiert über die Entitäten `Vote` (die einzelne Stimmabgabe) und `Voting` (das Abstimmungsereignis im Geschäft) verfügbar [URL: https://ws.parlament.ch/odata.svc/, Abruf: 06.09.2026] (belegt).
*   **Fahnen & Berichte:** Kommissionsberichte und Fahnen (Gegenüberstellungen von Entwurfsdifferenzen) werden über die API (z.B. als `BillDocument`) primär als PDF- oder Word-Dokumente bereitgestellt. Eine strukturierte, maschinenlesbare Artikel-für-Artikel-Gegenüberstellung als Datenpunkt ist nicht standardmässig verfügbar [URL: https://www.parlament.ch, Abruf: 06.09.2026] (unklar / sehr unwahrscheinlich).

### 5. Drittprojekte und Code-Beispiele
*   **swissparlpy / swissparl:** Etablierte Wrapper für Python (`metaodi/swissparlpy`) und R (`zumbov2/swissparl`), die das Paging und die Entity-Verknüpfung des OData-Dienstes abstrahieren [URL: https://github.com/metaodi/swissparlpy, Abruf: 06.09.2026] (belegt).
*   **OpenParlData.ch:** Ein Open-Source-Projekt, das Parlamentsdaten via REST harmonisiert, was die Navigation im Vergleich zum rohen OData vereinfacht [URL: https://api.openparldata.ch/, Abruf: 06.09.2026] (belegt).
*   **parlament-mcp:** Ein aktuelles KI-Projekt (LobeHub), das die `Transcript`-OData-API direkt nutzt, um Wortprotokolle per LLM durchsuchbar zu machen (gutes Code-Beispiel für OData-Calls) [URL: https://github.com, Abruf: 06.09.2026] (belegt).
