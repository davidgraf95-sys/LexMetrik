# Vorbilder: Gesetzgebungs-Genese pro Artikel — GitHub-/Portal-Recherche

*Kopiert unveraendert aus Recherche 6.9.2026, Agent Sonnet, read-only.*
Stand aller Angaben: Abruf 6.9.2026 via GitHub Search API (unauthenticated) + WebFetch/WebSearch.
Belegstatus je Zeile: [belegt] = direkt aus README/API-Response gelesen, [unklar] = nur Repo-Metadaten/Kurzbeschreibung, nicht vertieft geprüft.

## Deutschland

| Projekt | Repo-URL | Lizenz | Aktivität (updated_at) | Quelle/Daten | Datenmodell / Join-Schlüssel | UI-Muster | Bausteine |
|---|---|---|---|---|---|---|---|
| DIP-API-Wrapper | github.com/bundesAPI/dip-bundestag-api | keine Angabe | 2026-06-05 | amtliche API dip.bundestag.de/api | Entitäten Vorgang, Vorgangsposition, Drucksache(+Text), Plenarprotokoll(+Text), Person, Aktivität; Verknüpfung über numerische IDs. **Kein** direkter Link Vorgang→verkündeter Gesetzestext (BGBl) dokumentiert [belegt README] | keins (reiner API-Client) | API-Client als Vorlage für DIP-Anbindung |
| Gesetzestext-Archiv | github.com/bundestag/gesetze (1918★, Unlicense) + gesetze-tools (135★, LGPL-3.0) | Unlicense/LGPL | 2026-09-04 / 2026-08-28, täglich | gesetze-im-internet.de-Spiegel als Git-Repo, ein Gesetz = eine Datei | Commit-Historie = Änderungshistorie des **Volltexts**, nicht pro Artikel granular, keine Verknüpfung zu Verfahrensschritten [unklar, nicht README-geprüft] | Git-Log als Versionsliste | Scraper/Cronjob-Muster |
| OffeneGesetze.de | github.com/okfde/offenegesetze.de (93★) + api.offenegesetze.de (25★, Backend seit 2023 inaktiv) | MIT | Frontend aktiv 2026-09-01, Backend still seit 2023-11 | Bundesgesetzblatt | nicht dokumentiert [belegt README: keine Datenmodell-Details] | Next.js/Bulma-Suche | — |
| **NeuRIS ris-norms** | github.com/digitalservicebund/ris-norms | GPL-3.0 | **archiviert 21.8.2026, read-only**, 7866 Commits | amtliches Normendokumentations-Projekt des Bundes | **LegalDocML.de** (Akoma-Ntoso-Ableitung) als Zielschema, Schema-Erweiterungen in separatem Submodul ris-norms-ldml-schema-extensions (dieses Submodul war noch am 2026-08-18 aktiv) | nicht dokumentiert im README | LegalDocML.de-Schema als Referenz, aber Projekt tot |
| ris-backend-service (Caselaw-Teil von NeuRIS) | github.com/digitalservicebund/ris-backend-service | GPL-3.0 | 2026-08-10 | amtlich | nicht vertieft geprüft [unklar] | — | — |
| rechtsinformationen.bund.de | mehrere reine MCP-Wrapper (z.B. wolfgangihloff/rechtsinformationen-bund-de-mcp, 23★) | diverse | aktiv | amtliches Portal | nur Wrapper, kein eigenes Datenmodell dokumentiert | — | — |

## Frankreich

| Projekt | Repo-URL | Lizenz | Aktivität | Quelle | Datenmodell / Join-Schlüssel | UI-Muster | Bausteine |
|---|---|---|---|---|---|---|---|
| **The Law Factory** (Frontend) | github.com/regardscitoyens/the-law-factory | AGPL-3.0 | 1375 Commits, kein exaktes Letztdatum ermittelt [unklar] | eigene API (the-law-factory-parser) | — | **Genau die gesuchte Gesetzgebungs-Timeline**: LaFabriqueDeLaLoi.fr visualisiert Dossiers als Stufenkette | Frontend/Backend getrennt, config.js für API-URL |
| The Law Factory Parser (Backend/Datengenerator) | github.com/regardscitoyens/the-law-factory-parser (46★) | GPL-3.0 | aktiv (2026-05-20) | senat.fr + assemblee-nationale.fr via senapy/anpy-Scraper | **Join-Schlüssel = Zustands-Graph pro Dossier**: Knoten sind "Lesung • Kammer • Phase" (z.B. `1ère lecture • assemblee • commission`), Kanten annotiert mit Dossier-URL [belegt aus docs/steps_cases.txt]. **Granularität ist Verfahrensstufe, nicht Artikel** — Amendements/Artikel selbst nicht im Graph verlinkt. | Stufen-Zustandsmaschine als Timeline-Backbone | senapy/anpy als Scraper-Bausteine |
| Tricoteuses-Ökosystem | mehrere Repos (tricoteuses/*, div. Forks) | uneinheitlich, teils None | grösstenteils 0★, mehrere seit Jahren tot, ein Hackathon-Repo 2026-07-04 | Assemblée/Légifrance | nicht ausgereift, keine stabile Referenz | — | — |
| Légifrance PISTE-API | amtlich, kein GitHub-Kernrepo gefunden | — | — | — | offen — nicht vertieft geprüft | — | — |

## EU

| Projekt | Repo-URL/Portal | Lizenz | Aktivität | Quelle | Datenmodell | UI-Muster | Bausteine |
|---|---|---|---|---|---|---|---|
| Parltrack | github.com/parltrack/parltrack (75★) | keine Lizenz angegeben | 2026-06-11 | scrapt EP-Dossiers/MEP-Abstimmungen | Dumps (JSON), mehrere Downstream-Konsumenten teils archiviert | — | Datendump-Format als Rohquelle |
| OEIL (Legislative Observatory) | oeil.europarl.europa.eu (amtlich, kein OSS-Repo) | amtlich | laufend | EP | Procedure-File pro Dossier (z.B. `2020/0108(COD)`) mit Reitern Key events/Committee report/Plenary/Forecasts — **exakt das gesuchte "Materialien"-Reiter-Muster auf Verfahrensebene** [belegt WebSearch, UI selbst nicht im Detail geprüft — offen] | Reiter-UI | — |
| EUR-Lex | eur-lex.europa.eu (amtlich) | amtlich | laufend | EU | API liefert Verfahrenshistorie inkl. Rechtsgrundlage, Änderungen, Aufhebungen [belegt WebSearch, Feldebene nicht verifiziert — offen] | "Procedure"-Tab pro Dokument | — |
| Akoma Ntoso Standard | github.com/oasis-open/legaldocml-akomantoso (84★) | NOASSERTION | 2026-07-16 | OASIS-Standard | XML-Schema für Norm-Struktur, länderneutral | — | Referenzschemas |
| **laws-africa/bluebell** (23★, GPL-3.0) + **cobalt** (27★, NOASSERTION) + **slaw** (28★, MIT) | github.com/laws-africa/* | gemischt | 2026-07/08-2026 | — | generischer Akoma-Ntoso-3-Parser + Python-Lib zum Lesen/Schreiben von AN-Dokumenten + Renderer aus Plaintext/PDF | — | **Reifste, länderneutrale AN-Parser-Bausteine**, direkt nutzbar falls LexMetrik ein AN-ähnliches internes Schema will |
| SenatoDellaRepubblica/AkomaNtosoBulkData (39★, CC-BY-4.0) | github.com/SenatoDellaRepubblica/AkomaNtosoBulkData | CC-BY-4.0 | 2026-09-05 | italienischer Senat, amtlich | AN in Produktion bei einem Parlament — Referenzimplementierung | — | — |

## UK

| Projekt | Repo-URL | Lizenz | Aktivität | Quelle | Datenmodell / Join-Schlüssel | UI-Muster | Bausteine |
|---|---|---|---|---|---|---|---|
| **legislation.gov.uk — offizieller Quellcode** | github.com/legislation/website-frontend (24★) | NOASSERTION (Lizenz vor Codeübernahme prüfen!) | 2026-05-14 | The National Archives/Crown, amtlich | siehe unten | XSLT-Rendering des amtlichen Portals selbst | Frontend-Code des Live-Portals |
| Datenmodell-Doku | github.com/legislation/data-documentation (5★) + legislation.github.io/data-documentation | NOASSERTION | 2026-08-11 | — | **Drei Kernentitäten** [belegt, wörtlich aus Doku]: (1) "Items and subdivisions of legislation" = abstrakte Norm/Absatz unabhängig von Fassung, (2) "Versions" = Fassung zu einem Zeitpunkt, (3) "Effects/Commencements" = Änderungsmechanismus. **URI = Join-Schlüssel**: abstrakt `id/ukpga/1985/67`; Fassung zu Stichtag `.../uksi/2013/376/regulation/12/2015-03-27`; einzelner Änderungs-Effekt `id/effect/<hash>`. Das ist der bisher konkreteste gefundene Mechanismus, um einen Artikel mit *genau der Änderung, die ihn erzeugt hat*, zu verknüpfen. | Point-in-Time-Versionierung, „as enacted" vs. spätere Fassungen | URI-Schema direkt übertragbar als Konzept |
| UK-law-mcp / legislation-mcp-ts | github.com/Ansvar-Systems/UK-law-mcp, github.com/legislation/legislation-mcp-ts | Apache-2.0 / NOASSERTION | 2026-07/08-2026 | — | reine API-Wrapper | — | — |

## Schweiz

| Projekt | Repo-URL | Lizenz | Aktivität | Quelle | Datenmodell / Join-Schlüssel | UI-Muster | Bausteine |
|---|---|---|---|---|---|---|---|
| swissparl-Wrapper (zumbov2/swissparl 39★ R, metaodi/swissparlpy 26★ Python) | GitHub | MIT/NOASSERTION | 2026-08-12 | amtl. Curia-Vista-OData (ws.parlament.ch) | Geschäft/Vorstoss-Objekte mit IDs, **keine Verlinkung zu Fedlex-Artikeltext gefunden** [unklar] | — | API-Clients |
| entscheidsuche.ch-Ökosystem (NeueScraper 11★ AGPL-3.0, mehrere MCP-Server) | GitHub | AGPL-3.0 u.a. | 2026-07/08-2026 | Bundes-/Kantonsgerichte | Fokus **Rechtsprechung**, nicht Gesetzgebungsprozess | — | Scraper-Muster |
| Fedlex-Spiegel (droid-f/fedlex 24★, keine Lizenz angegeben) + fedlex-mcp/-connector | GitHub | keine/MIT | 2026-09-04/05 (heute) | fedlex.admin.ch amtlich | Portal-Crawl als Git-Repo bzw. MCP-Wrapper um SPARQL/REST | — | — |
| **jonashertner/opencaselaw** (61★) | github.com/jonashertner/opencaselaw | Code MIT, Metadaten CC0, ECHR-Texte fremdrechtlich | **heute aktualisiert** (2026-09-06), täglich | BGer/BVGer/BStGer/Militärkassationsgericht + alle 26 Kantone (~1M Entscheide seit 1875) + **Fedlex-SPARQL: 5525 Bundesgesetze / ~133k Artikel je DE/FR/IT** + 15.6k kantonale Gesetze | 34-Felder-Schema pro Entscheid; **Citation-Graph**: 9,65 Mio. Entscheid-zu-Entscheid-Kanten + **12,4 Mio. Entscheid-zu-Gesetzesartikel-Links**, aufgelöst über SR-Nummer + Artikel-Position; `decision_id = {court}_{docket_normalized}` als deterministischer Join-Schlüssel [belegt README] | 44 MCP-Tools (Suche, Citation-Graph, Appeal-Chain, Statute-Browsing) | **Direkt interessant für LexMetrik**: SR+Artikel als Join-Schlüssel-Muster, Fedlex-SPARQL-Extraktionsmethode. **Aber**: kein Bezug zur Gesetzes-*Genese* (keine Botschaft/Kommission/Debatte), sondern Urteil↔Artikel. Selbstberichtete Auflösungsquote 93,8 % noch ohne unabhängiges Audit — vor Übernahme prüfen. |
| lobbywatch (39★, GPL-2.0) | GitHub | GPL-2.0 | 2026-07-18 | Interessenbindungen Parlamentarier:innen | angrenzendes Transparenz-Thema, nicht Gesetzgebungsprozess | — | — |
| **Lücke bestätigt**: kein CH-Projekt gefunden, das Botschaft→Kommission→Ratsdebatte→Abstimmung→Inkraftsetzung pro Artikel rekonstruiert. | — | — | — | — | — | — | — |

## Niederlande, USA, sonstige (kompakter, weniger vertieft geprüft)

| Projekt | Repo-URL | Lizenz | Aktivität | Bemerkung |
|---|---|---|---|---|
| OpenKamer + tkapi | github.com/openkamer/openkamer (76★ MIT), tkapi (20★) | MIT | 2026-09-01 | Python-Bindings für Tweede-Kamer-OData-API, zeigt Gesetzesstatus; Datenmodell nicht vertieft geprüft [offen] |
| unitedstates/congress + congress-legislators | github.com/unitedstates/congress (1062★), congress-legislators (2433★) | CC0-1.0 | 2026-09-05/03, sehr aktiv | öffentliche Datensammler für congress.gov; Bioguide-ID als Personen-Join-Schlüssel; kanonische Referenzdatenbasis |
| GovTrack | github.com/govtrack/govtrack.us-web (415★) | **keine Lizenz angegeben** — Code-Reuse rechtlich unklar, vor Übernahme klären | 2026-08-21 | Django-App hinter govtrack.us; **UI-Referenz** (nicht Code) für Bill-Timeline (Introduced→Committee→Floor→President→Law) + CRS-Zusammenfassungen als „Materialien"-Analogon; seit >15 Jahren im Feldeinsatz |
| OParl (Kommunalparlamente) | github.com/OParl/spec (65★, CC-BY-SA-4.0) | CC-BY-SA-4.0 | 2026-08-23 | Spezifikation für Ratsinformationssysteme: Objekte Gremium/Sitzung/TagesordnungspunktVorlage/Beschluss, URL-basierte IDs — Analogmuster für Vorlage→Sitzung→Beschluss, aber **kommunal**, nicht Bundesgesetzgebung |
| Österreich RIS | github.com/legalize-dev/legalize-at (9★, MIT-Code/CC-BY-4.0-Daten) | MIT/CC-BY-4.0 | 2026-09-05 | Gesetzgebung als Markdown+Git; **eigenes README räumt ein**: Novellenhistorie wird derzeit NICHT aus dem Novellen-Endpunkt rekonstruiert — Reformkette fehlt trotz Git-Modell [belegt README] |

## Bewertung: 5 Projekte für einen tieferen Blick

1. **legislation.gov.uk (legislation/website-frontend + data-documentation)** — konkretestes, amtlich produktiv genutztes Datenmodell für Artikel-Version↔Änderungs-Effekt via URI (`id/effect/<hash>`); Lizenz des Codes vor Übernahme klären (NOASSERTION), Datenmodell-Konzept ist frei übernehmbar.
2. **regardscitoyens/the-law-factory + -parser** — einzige gefundene Umsetzung einer echten Gesetzgebungs-Timeline-UI (Lesung×Kammer×Phase); Copyleft (AGPL/GPL) schränkt Codeübernahme ein, Konzept ist frei.
3. **jonashertner/opencaselaw** — Schweiz-spezifisch, SR+Artikel-Join-Schlüssel und Fedlex-SPARQL-Extraktion sind methodisch direkt für LexMetrik verwertbar (Urteile/Statute-Links), deckt aber nicht die Genese-Kette ab.
4. **laws-africa/bluebell + cobalt + slaw** — reifste länderneutrale Akoma-Ntoso-Parser-Bausteine, falls ein internes AN-ähnliches Norm-Schema erwogen wird.
5. **OEIL/EUR-Lex (amtlich)** — bestes Reiter-UI-Vorbild auf Verfahrensebene (Key events/Committee/Plenary), aber nur oberflächlich per WebSearch geprüft — vertiefte API-Feldprüfung offen.

## Bestätigte Lücke (= Chance für LexMetrik)
Kein gefundenes Projekt verbindet **Artikel-Granularität** (nicht nur Dossier-/Gesetzesebene) mit der **vollständigen Genese-Kette** (Entwurf→Botschaft/Erläuterungen→Ausschuss/Kommission→Plenardebatte→Abstimmung→Inkrafttreten→spätere Änderungen) UND zusätzlich Verwaltungs-Wegleitungen am selben Artikel. Bestehende Tools zerfallen in drei getrennte Schichten:
- Verfahrens-/Dossier-Tracker (DE DIP, FR the-law-factory, EU OEIL) — Granularität stoppt bei "Lesung x", nicht beim Artikel.
- Artikel-Versionierung/Diff (UK legislation.gov.uk, Akoma-Ntoso-Ökosystem) — zeigt Textänderung, aber nicht die dazugehörigen Debatten-/Materialien-Dokumente.
- Urteils-Zitationsgraphen (opencaselaw) — verlinkt Artikel mit späterer Rechtsprechung, nicht mit seiner eigenen Entstehung.
Keine der geprüften Quellen kombiniert alle drei Ebenen an einem Artikel-Anker.
