**Zweitquelle Gemini (ungeprueft, nur mit Nachpruefung verwenden). Recherche 6.9.2026, read-only.**

Hier ist eine strukturierte Recherche-Übersicht der amtlichen Portale und Open-Source-Projekte zur Gesetzgebung, fokussiert auf Datenmodelle, Verknüpfungen und wiederverwendbare Bausteine.

**DEUTSCHLAND**
* **Bundestag DIP API:** Verknüpft Gesetzentwürfe, Ausschussberichte, Plenarprotokolle, Abstimmungen; Tech: JSON/XML, Join via Vorgangs-ID; UI: Zeitleiste [https://dip.bundestag.de, 06.09.2026, belegt].
* **offenegesetze.de:** Repo: github.com/okfde/offenegesetze.de; Lizenz: MIT; Aktiv: Inaktiv (letzter Commit ca. 2025); Verknüpft: BGBl-PDFs; Bausteine: Python-Parser/Django-UI wiederverwendbar [https://offenegesetze.de, 06.09.2026, belegt].
* **gesetze-im-internet:** XML-Datenmodell, amtliche Fassungen, Historie jedoch mangelhaft verknüpft [https://www.gesetze-im-internet.de, 06.09.2026, belegt].
* **NeuRIS / rechtsinformationen.bund.de:** Repo: github.com/digitalservicebund/ris-search; Lizenz: MIT; Aktiv: Ja; Verknüpft: Normen & Urteile; Bausteine: UI-Komponenten, LegalDocML-Schema [https://github.com/digitalservicebund, 06.09.2026, belegt].
* **OParl:** JSON-Schema für Ratsinfos; standardisiert Anträge/Protokolle-Verknüpfung [https://oparl.org, 06.09.2026, belegt].
* **Bundesrat:** Bietet keine strukturierte offene API für die Gesetzgebungshistorie [https://www.bundesrat.de, 06.09.2026, unklar].
* **Timeline-Projekte:** Private Visualisierungen nutzen meist DIP-Vorgangs-IDs als primären Join-Schlüssel [https://fragdenstaat.de, 06.09.2026, unklar].

**ÖSTERREICH**
* **RIS Materialien:** Verknüpft Regierungsvorlagen und Ausschussberichte deterministisch mit Gesetzestexten [https://www.ris.bka.gv.at, 06.09.2026, belegt].
* **Parlament-API:** Verknüpft Gesetzwerdung; Tech: JSON/XML; Join-Key: LL-Nummer (Legislatur/Laufnummer) [https://data.parlament.gv.at, 06.09.2026, belegt].

**GROSSBRITANNIEN**
* **legislation.gov.uk:** Verknüpft Gesetzestext, Explanatory Notes, Inkrafttreten; Tech: Akoma Ntoso XML, Join via Semantische URIs; Bausteine: Timeline-UI [https://www.legislation.gov.uk/developer, 06.09.2026, belegt].
* **TheyWorkForYou:** Repo: github.com/mysociety/theyworkforyou; Lizenz: AGPL; Aktiv: Ja; Verknüpft: Debatten mit Abgeordneten; Bausteine: UI/Parser [https://www.theyworkforyou.com, 06.09.2026, belegt].
* **Parliament API:** Offizielle REST-API für Bills/Votes; Tech: Graph/JSON-Datenmodell [https://developer.parliament.uk, 06.09.2026, belegt].

**EU**
* **EUR-Lex / OEIL:** Verknüpft Richtlinien mit Legislative Observatory (Procedure); Tech: Join via CELEX-Nummer [https://eur-lex.europa.eu, 06.09.2026, belegt].
* **Parltrack:** Repo: github.com/pudo/parltrack; Lizenz: AGPL; Aktiv: Inaktiv; Verknüpft: EU-Dossiers; Bausteine: Scraper wiederverwendbar [https://parltrack.org, 06.09.2026, unklar].

**FRANKREICH**
* **Légifrance API:** Verknüpft Codes mit "Dossiers Législatifs" (Entwurf, Abstimmungen) [https://developer.aife.economie.gouv.fr, 06.09.2026, belegt].
* **Tricoteuses:** Repo: github.com/tricoteuses; Lizenz: MIT; Aktiv: Ja; Verknüpft: Assemblée-Daten; Bausteine: Scraper-Module [https://github.com/tricoteuses, 06.09.2026, unklar].
* **nosdeputes.fr:** Repo: github.com/regardscitoyens/nosdeputes.fr; Lizenz: AGPL; Aktiv: Ja; Verknüpft: Parlamentsaktivitäten [https://nosdeputes.fr, 06.09.2026, unklar].

**USA**
* **congress.gov API:** Verknüpft Bills, Amendments, Actions, Votes; Tech: JSON, Join via Congress/Bill-Number [https://api.congress.gov, 06.09.2026, belegt].
* **GovTrack:** Repo: github.com/govtrack/govtrack.us-web; Lizenz: AGPL; Aktiv: Ja; Verknüpft: Gesetzgebung-Tracking; Bausteine: UI [https://www.govtrack.us, 06.09.2026, belegt].
* **unitedstates/congress:** Repo: github.com/unitedstates/congress; Lizenz: CC0; Aktiv: Ja; Bausteine: Wiederverwendbare Python-Scraper für Gesetze/Votes [https://github.com/unitedstates/congress, 06.09.2026, belegt].

**NIEDERLANDE**
* **wetten.overheid.nl:** Portal verknüpft Änderungshistorie; Tech: XML, Join via BWB-ID [https://wetten.overheid.nl, 06.09.2026, belegt].
* **Open Kamer:** Parlamentsdaten; Repo: github.com/openstate/openkamer; Aktiv: Inaktiv [https://www.openkamer.org, 06.09.2026, unklar].

**SCHWEIZ**
* **Fedlex-Tools:** Verknüpft Erlasse mit Botschaften; Tech: Semantisches Web (SPARQL), Akoma Ntoso, Join via ELI (European Legislation Identifier) [https://www.fedlex.admin.ch, 06.09.2026, belegt].
* **OpenCaseLaw:** Repo: github.com/jonashertner/opencaselaw; Lizenz: MIT/CC0; Aktiv: Ja (2026); Verknüpft: Urteile & Zitationen; Bausteine: MCP-Server/Parser [https://opencaselaw.ch, 06.09.2026, belegt].
* **swissparl:** Repo: github.com/zumbov2/swissparl; Lizenz: MIT; Aktiv: Ja; Bausteine: R-Paket für die Parlaments-API [https://cran.r-project.org/package=swissparl, 06.09.2026, belegt].
* **politmonitor:** Verknüpft Geschäfte/Tracking, nicht Open Source [https://politmonitor.ch, 06.09.2026, unklar].
* **lobbywatch:** Repo: github.com/lobbywatch; Lizenz: MIT; Aktiv: Ja; Verknüpft: Interessenbindungen [https://lobbywatch.ch, 06.09.2026, unklar].
* **entscheidsuche:** Repo: github.com/entscheidsuche; Aktiv: Ja; Verknüpft: Gerichtsentscheide; Bausteine: UI/Suchindex [https://entscheidsuche.ch, 06.09.2026, belegt].

**FAZIT FÜR LEXMETRIK (Datenmodell & UI)**
Best Practice für das **Datenmodell**: LegalDocML / Akoma Ntoso als Grundschema (genutzt von NeuRIS, Fedlex, UK), deterministische Verknüpfung via semantischer URIs (ELI) [https://www.akomantoso.org, 06.09.2026, belegt].
Best Practice für das **UI-Muster**: Zeitleisten pro Gesetzesartikel, basierend auf Dossier-/Geschäfts-IDs (wie UK, DIP, Österreich) als Join-Schlüssel zwischen Parlament-API und publiziertem Gesetzestext [https://www.legislation.gov.uk/developer, 06.09.2026, belegt].
