# E6a-Quell-Inventar — Verwaltungsverordnungen / amtliche Praxis Bund

**Stand:** 2026-07-03 · **Methode:** Reine Web-Recherche mit Probe-Fetches (curl/WebFetch, je Quelle
Übersichtsseite UND mindestens ein Einzeldokument real gefetcht; Statuscode + Content-Type belegt,
Soft-404-Prüfung). 4 parallele Recherche-Agenten (ESTV · BSV+VPB · FINMA+SEM · SECO/BAG/BAZG/BJ).
Doktrin «Quell-Wahl zuerst»: strukturiert (JSON/API/Sitemap/RSS) > server-gerendertes HTML > PDF.

> **Kernbefund vorweg:** KEINE der geprüften Behörden bietet eine dokumentierte JSON/REST-API für
> ihre Praxis-Dokumente. Die höchste verfügbare Struktur ist fast überall «server-gerendertes HTML
> als Index + PDF als Inhalt». Die grosse Ausnahme: die **ESTV-MWST-Webpublikationen** — echter
> HTML-Volltext mit eigener Norm-Register- und Änderungshistorie-Seite. Die VPB ist **tot**
> (eingestellt 1.1.2018).

---

## 1. ESTV — Eidgenössische Steuerverwaltung (Kernquelle Steuer)

### 1a. Kreisschreiben (DBST / Verrechnungssteuer / Stempelabgaben)

| Feld | Befund |
|---|---|
| Einstieg | `https://www.estv.admin.ch/de/kreisschreiben-direkten-bundessteuer` · `…/kreisschreiben-verrechnungssteuer` · `…/kreisschreiben-stempelabgaben` (alle 200, `text/html`) |
| Struktur | Server-gerendertes HTML mit direkten `<a class="download-item" href="…pdf">`-Links — **kein** SPA-Shell, kein JSON/RSS. `robots.txt` offen, generische `sitemap.xml` (200) ohne KS-spezifische Liste |
| Dokument-Format | **PDF-only** (Probe: `dbst-ks-2020-1-050a-d-de.pdf` → 200, `application/pdf`, 172 KB). Titel/Nr./Datum nur als Linktext im HTML |
| Nummerierung | «Kreisschreiben Nr. 50a», fortlaufend je Steuerart |
| Historie | **Nur geltende KS gelistet**, keine Archiv-Sektion; Ablösungen nur im PDF-Fliesstext erwähnt |
| Menge | DBST ~42 · VST ~22 · Stempel ~11 aktive KS |
| Frequenz | unregelmässig (Publikationsdaten 1995–2020+) |
| Norm-Bezug | nur Fliesstext im PDF (z. B. «Art. 58 DBG»), nicht strukturiert |
| Zugang | frei, kein Login, kein JS nötig |

### 1b. MWST-Infos / MWST-Branchen-Infos («MWST-Praxispublikationen») ★ strukturreichste Quelle

| Feld | Befund |
|---|---|
| Einstieg | `https://www.estv.admin.ch/de/mwst-praxispublikationen` → Sub-Portal `https://www.gate.estv.admin.ch/mwst-webpublikationen/public` (200, `text/html`) |
| Struktur | JSF/PrimeFaces-Webanwendung (`.xhtml`, ViewState) — **aber serverseitig gerendert, per curl vollständig lesbar** (kein JS-Zwang fürs Lesen). Schlüssel-Seiten: `pages/sectorInfos/tableOfContent.xhtml` (Inhaltsverzeichnis) · `pages/legalBasis/legalBasis.xhtml` (**Norm-Register**: MWSTG/MWSTV-Artikel-Verweise) · `pages/displayDocs/changedCiphers.xhtml` (**Änderungshistorie pro Ziffer**, z. B. Steuersatzänderungen 2011/2018/2024) |
| Dokument-Format | **HTML-Volltext pro Kapitel/Ziffer** (Probe: `cipherDisplay.xhtml?publicationId=1023907&componentId=1023912` → 200, 70 KB HTML, Norm-Zitat «Art. 22» im Text). Zusätzlich Archiv-Broschüren als PDF |
| Nummerierung | «MWST-Info 20», «MWST-Branchen-Info 27»; darunter Ziffern/Kapitel |
| Historie | **JA, strukturiert** — `changedCiphers`-Seite je Praxisänderung; MWST-Info 20 regelt sogar die zeitliche Wirkung von Praxisfestlegungen |
| Menge | ~20 MWST-Infos + 12+ Branchen-Infos (publicationId-Bereich 1000066–1014334+) |
| Norm-Bezug | teils **strukturiert** (separates `legalBasis`-Register), im Kapiteltext als Fliesstext |
| Zugang | kein Login; ABER JSF-Session/ViewState-Mechanik: Deep-Links laufen über `publicationId`/`componentId`-Query-Parameter, hübsche Pfade (`MI/20/1`) liefern 302 auf die kanonische `cipherDisplay.xhtml`-URL |

### 1c. Rundschreiben

| Feld | Befund |
|---|---|
| Einstieg | `…/de/rundschreiben-direkten-bundessteuer` (200) · `…/rundschreiben-verrechnungssteuer` (200) · Stempel: 200 mit ehrlichem «Aktuell gibt es keine Rundschreiben…» (kein Soft-404) |
| Struktur/Format | identisch 1a: server-gerenderte PDF-Linkliste |
| Nummerierung | «Rundschreiben Nr. 219: Zinssätze 2026 …» — fortlaufend |
| Menge/Frequenz | DBST ~45 gelistet (Nummern bis 219 → ältere entlistet) · VST ~15 · **jährlicher Rhythmus** bei Zinssatz-RS (aktuellstes 2026) |

---

## 2. BSV — sozialversicherungen.admin.ch (AHV/IV/EL/EO/FamZ/BV-Weisungen)

| Feld | Befund |
|---|---|
| Einstieg | **`https://sozialversicherungen.admin.ch/de`** (Portal «BSV Vollzug»). Alter Pfad `bsv.admin.ch/…/weisungen.html` → **404** (migriert). Ordner/Themen: `/de/f/{id}` · Dokumente: `/de/d/{id}` |
| Struktur | server-gerendertes statisches HTML (CMS «2sic»), curl-lesbar ohne JS. **Kein** JSON/API/Sitemap (`/sitemap.xml` → 404, `?format=json` liefert HTML) |
| Dokument-Format | **PDF-only** (Probe: RWL `…/de/d/6857/download?version=7` → 200, `application/pdf`, 1,88 MB) |
| Nummerierung | BSV-Dokumentnummern (RWL = `318.104.01`), im PDF **Randziffern (Rz.)** |
| Historie | **JA, vorbildlich** — RWL-Seite zeigt **21 Versionen bis 2001 zurück, jede via `?version=N` einzeln downloadbar**, mit «gültig ab»/«Stand» (aktuell V21, gültig ab 1.1.2024, Stand 1.1.2026) |
| Menge | mehrere hundert Dokumente (Bsp. Ordner EO `/de/f/5619`: 14 Dok. DE/FR/IT); Themenbäume AHV/IV/EL/EO/FamZ/BV/KV/ALV |
| Frequenz | revisionsgekoppelt (z. B. RWL-Totalrevision AHV 21 per 1.1.2024 + Nachträge); Portal bietet Abo-Benachrichtigung |
| Norm-Bezug | nur im PDF-Inhalt (AHVG/AHVV/IVG-Zitate in Rz.-Struktur), Portal-HTML ohne Artikel-Links |
| Zugang | frei; `robots.txt` sperrt nur `/Login/`; **kein Akamai-Bot-Gate** (anders als admin.ch-Kern) |

---

## 3. FINMA — Rundschreiben (finma.ch)

| Feld | Befund |
|---|---|
| Einstieg | `https://www.finma.ch/de/dokumentation/rundschreiben/` (200, 79 KB — echter Inhalt) |
| Struktur | **JS-App-Shell für die Liste**: HTML enthält nur das Filter-Widget mit `data-filter-url="/de/api/search/getresult"` — Liste wird per AJAX nachgeladen. **Interne JSON-API existiert** (POST `…/de/api/search/getresult` → 200, `{"Items":[…],"Count":…}` verifiziert), Facetten-Parameter für «nur Rundschreiben» aber undokumentiert (Probe-Calls gaben Count:0/News — Reverse-Engineering nötig). RSS `…/de/rss/rundschreiben/` existiert (200, XML) aber **leer** (0 Items). Sitemap: nur 21 generische «rundschreiben»-URLs (Archiv-Ordnerseiten 2008–2020, keine Einzel-RS) |
| Dokument-Format | **PDF-only**, sauber einzeln adressierbar (Probe: `…/rundschreiben/finma-rs-2023-01-20221207.pdf` → 200, `application/pdf`, 380 KB, PDF 1.7) |
| Nummerierung | «FINMA-RS JJJJ/N» (z. B. 2023/1 ersetzt 2008/21) |
| Historie | Archiv-Sektion `…/archiv/rundschreiben/` (200) vorhanden, aber ebenfalls JS/API-getrieben |
| Menge | ~25–35 aktive RS (Schätzung, ohne API-Auszählung) |
| Frequenz | unregelmässig, mehrere Revisionen/Aufhebungen pro Jahr |
| Norm-Bezug | Rz.-System mit «Rechtliche Grundlagen»-Verweisen (FINMAG/BankG/FINIG/KAG) — Erfahrungswert, PDF-Text in dieser Session nicht extrahiert |
| Zugang | `robots.txt` offen, kein Login; JS-Pflicht nur für die Liste, PDFs direkt abrufbar |

---

## 4. SEM — Weisungen Ausländer-/Asylbereich (sem.admin.ch)

| Feld | Befund |
|---|---|
| Einstieg | `https://www.sem.admin.ch/sem/de/home/publiservice/weisungen-kreisschreiben.html` (200, 76 KB) — 8 Kategorien (I Ausländer · II FZA · III Asyl · IV Integration · V Bürgerrecht · VI Datenschutz · VII Visa · VIII Weitere) |
| Struktur | reine statische HTML-Baumstruktur → PDF-Links; kein JSON/API, Sitemap nur auf Seiten-Ebene |
| Format Ausländer | **Ein grosses PDF-Kompendium** (Probe: `weisungen-aig-d.pdf` → GET 200, `application/pdf`, 2,9 MB, PDF 1.7; **HEAD liefert fälschlich 404** auf AEM-DAM-Assets!) + separates Kapitel-4-PDF. 11 Kapitel; «Stand 15. Juni 2026» (Hauptdok.) / «Stand 30. Juni 2026» (Kap. 4) im HTML sichtbar |
| Format Asyl | granularer: 8 Themen-Unterseiten mit **mehreren kleinen Einzel-PDFs** (Probe: `1_asylverfahren-d.pdf` → 200, `application/pdf`, 333 KB; Einzel-Kreisschreiben datumsgenau, z. B. `20250401-weis-auswertung-datentraeger-d.pdf`) |
| Historie | «Stand …»-Datum pro Kapitel im HTML, aber **keine Altfassungs-Liste** |
| Frequenz | laufend, kapitelweise (Kap. 4 zuletzt 30.6.2026) |
| Norm-Bezug | AIG/VZAE- bzw. AsylG-artikelgegliedert (bekannte Struktur; PDF-Text nicht frisch extrahiert) |
| Zugang | frei, kein JS, gut crawlbar. Kuriosum: robots.txt-Pfad lieferte fremde Fehlerseite (gemeinsame admin.ch-Infrastruktur), Inhaltsseiten alle sauber 200 |

---

## 5. SECO — Wegleitungen ArG/ArGV + AVIG-Praxis (seco.admin.ch / arbeit.swiss)

| Feld | Befund |
|---|---|
| Einstieg ArG | `https://www.seco.admin.ch/de/wegleitungen` (200, `text/html`) |
| Format ArG | **PDF, aber artikelgranular**: Gesamtdokument (Wegleitung ArGV 1+2, PDF 9,66 MB, 20.2.2026) + separate Änderungslisten + **Einzelartikel-PDFs pro Verordnungsartikel** (Unterseiten wie `/de/wegleitung-argv-1`). Abdeckung ArGV 1–5 + WBF-V gefährliche Jugendarbeiten |
| Norm-Bezug ArG | **1:1** — Wegleitungs-Einheit = ArGV-Artikel (bester Norm-Bezug aller geprüften Quellen) |
| Historie ArG | ja, über separate Änderungslisten |
| Einstieg AVIG | `https://www.secoalv.admin.ch/secoalv/en/home/service/publikationen/kreisschreiben---avig-praxis.html` (200) · Nachfolgeportal arbeit.swiss |
| Format AVIG | **grosse monolithische PDFs** je Rechtsgebiet (AVIG-Praxis ALE gültig ab 1.1.2026, KAE 1.1.2026, AMM 1.6.2026) + Einzelweisungen (z. B. «Weisung 2025/02 Kurzarbeit US-Zölle»). Keine amtliche HTML-Kapitelstruktur (HTML-Aufbereitung nur beim Privaten koordination.ch — **nicht als Quelle verwendbar**). Archiv unter `archiv_weisungen.html` |
| Zugang | robots.txt offen, Sitemap vorhanden, kein Login |

---

## 6. BAG — Kreisschreiben Krankenversicherung (bag.admin.ch)

| Feld | Befund |
|---|---|
| Einstieg | Portalseite `…/de/krankenversicherung-kreis-und-informationsschreiben` (200, nur Erklärtext); **Dokumentliste**: `https://www.bag.admin.ch/de/krankenversicherung-kreisschreiben-schweiz` (200) |
| Format/Menge | **18 Kreisschreiben-PDFs**, Serien-Nummerierung 1.1–7.10 (mit Lücken); jüngstes KS 7.1 vom **1.7.2026** (Datenschutzaufsicht). Getrennte Seite «Kreisschreiben Internationales» |
| Historie | kein Archiv, nur chronologische Sortierung |
| Norm-Bezug | explizit KVG (832.10) / KVV (832.102) / KVAG (832.12) / KVAV (832.121) |
| Verdikt | sauber, aber **klein** — Ergänzung, keine Hauptquelle |

---

## 7. BAZG (ex-OZD) — Richtlinien (bazg.admin.ch)

| Feld | Befund |
|---|---|
| Einstieg | `https://www.bazg.admin.ch/de/richtlinien` (200) — **25 Richtlinien-Gruppen**, R-Nummern R-08…R-249 (Gefahrgut, Mineralölsteuer, Verwaltungsverfahren R-20, Verzugs-/Vergütungszins R-22, Edelmetall, GwG R-249) |
| Struktur | je R-Nummer eigene **HTML-Landingpage** (Probe: `/de/r-08-abfertigung-gefaehrlicher-gueter` → 200) mit eingebettetem PDF-Link (`…/dam/de/sd-web/…/richtlinie-…-de.pdf`) |
| Historie | nicht ersichtlich («werden laufend ergänzt», kein Änderungsdatum auf Übersicht) |
| Zugang | offen, Sitemap vorhanden — per Sitemap diskretisierbar |

---

## 8. BJ — Gutachten (bj.admin.ch)

| Feld | Befund |
|---|---|
| Einstieg | `https://www.bj.admin.ch/de/berichte-gutachten-und-verfuegungen` (200) — chronologische Liste, **200+ Einträge 1998–Feb. 2026**, keine Filter/Themen-Taxonomie |
| Struktur | je Gutachten eigene HTML-Seite (`/de/gutachten-des-bundesamtes-fuer-justiz-vom-<datum>`) mit PDF-Anhang (Probe: `2025-08-14-co2-pipelines.pdf` verlinkt). Alte `/bj/de/home/…`-URLs → 404 «Locale Not Available» (migriert). `sitemap/de.xml` enthält alle Einzel-URLs (per grep bestätigt) |
| Verdikt | vollständig über Sitemap diskretisierbar, HTML-first — aber ohne Norm-/Themen-Taxonomie: jedes Gutachten müsste einzeln klassifiziert werden. **Nachrangig** |

---

## 9. VPB — Verwaltungspraxis der Bundesbehörden: TOT ✝

| Feld | Befund |
|---|---|
| Status | **Eingestellt per 1.1.2018** (V vom 11.10.2017); keine zentrale Nachfolgepublikation — Praxis wird seither dezentral je Amt publiziert (= genau die Quellen 1–8 dieses Inventars) |
| Amtliche Seite | `admin.ch/gov/de/start/bundesrecht/verwaltungspraxis-der-bundesbehoerden.html` → **403 Akamai-Bot-Schutz** (auch mit Browser-UA); alte Domain `vpb.admin.ch` nicht mehr erreichbar (curl Statuscode 000) |
| Archiv | Bundesarchiv übernahm Jahrgänge 1987–2018 → `www.amtsdruckschriften.bar.admin.ch` (bar.admin.ch → 200, offen; konkrete VPB-Bestand-Navigation in dieser Session nicht abschliessend verifiziert) |
| Spiegel | `entscheidsuche.ch/bund/vpb/` → 302 auf Such-SPA, **1,4-KB-Vue-Shell** (curl-unlesbar, JS-Pflicht); bewirbt eine MCP-Schnittstelle (`mcp.entscheidsuche.ch/mcp`) — Dritt-Quelle, für uns ohnehin nur Findhilfe |
| Nummerierung | historisch «VPB Band.Nummer» (z. B. VPB 70.46) |
| Verdikt | nur als **historisches, nicht aktualisierbares Korpus** relevant; für E6a KEINE laufende Quelle |

---

## (a) Ranking «welche Quelle zuerst» (Nutzen × Machbarkeit)

| Rang | Quelle | Nutzen (Steuerbehörden/Ämter) | Machbarkeit | Begründung |
|---|---|---|---|---|
| **1** | **ESTV MWST-Webpublikationen** | sehr hoch (MWST-Praxis = tägliche Kernfrage) | **hoch** — einzige HTML-Volltext-Quelle, mit Norm-Register + Änderungshistorie | maximale Struktur × maximaler Nutzen; JSF-Mechanik ist lösbar (server-gerendert) |
| **2** | **ESTV Kreisschreiben + Rundschreiben** | sehr hoch (DBST/VST-Praxis) | mittel — trivialer Crawl, aber PDF-Inhalt | Index-Adapter sofort baubar; Volltext = PDF-Tier-B später |
| **3** | **BSV sozialversicherungen.admin.ch** | hoch (AHV/IV-Vollzug, RWL & Co.) | mittel-hoch — bestes Versions-/Historie-Modell aller Quellen (`?version=N`), aber PDF-Inhalt | Historie ist Gold für unseren Stand-/Currency-Ansatz |
| 4 | SECO Wegleitung ArG/ArGV | hoch (Arbeitsrecht — unsere Vorlagen!) | mittel — artikelgranulare PDFs = natürlicher Norm-Anker | 1:1-Artikel-Mapping einzigartig |
| 5 | SEM Weisungen | mittel-hoch (Migrationsrecht) | mittel — statisch crawlbar, aber AIG = 2,9-MB-Monolith-PDF | Asyl-Teil granular, Ausländer-Teil Kompendium |
| 6 | SECO AVIG-Praxis | mittel | tief-mittel — monolithische PDFs | erst nach ArG |
| 7 | FINMA Rundschreiben | mittel (Finanzmarkt-Nische) | **tief** — JS-Liste, undokumentierte API, leerer RSS | API-Reverse-Engineering oder Headless nötig |
| 8 | BAZG Richtlinien | tief-mittel | mittel (Sitemap + HTML-Landingpages) | Nische |
| 9 | BAG Kreisschreiben KV | tief (nur 18 Dok.) | hoch | Mini-Ergänzung zu BSV |
| 10 | BJ Gutachten | tief | tief (keine Taxonomie) | später, einzelfallweise |
| — | VPB | — | — | tot; höchstens Archiv-Korpus via Bundesarchiv |
| **3½** *(Nachtrag 3.7., David-Input)* | **EDÖB Leitfäden/Merkblätter (DSG/BGÖ)** | hoch (DSG = Querschnittsmaterie für ALLE Zielgruppen; Kanzlei-Dauerthema) | **hoch** — statisches HTML, `sitemap.xml` de/fr/it, Hubs `dokumentation-datenschutz`/`-bgoe`; Leitfäden teils HTML-Volltext (TOM, Cookies, DSFA, Vereine), Rest PDF | live sondiert 3.7.2026 (200er, kein Akamai-Block); Norm-Anker DSG/DSV/BGÖ in den Leitfäden explizit → Norm-Mapping machbar; einsortiert zwischen Rang 3 und 4 |

## (b) Empfohlene Andockpunkte der Top 3

**1. ESTV MWST (gate.estv.admin.ch):**
- Inhaltsverzeichnis abgehen: `https://www.gate.estv.admin.ch/mwst-webpublikationen/public/pages/sectorInfos/tableOfContent.xhtml` → alle `publicationId`s einsammeln
- Kapitel-Volltext: `…/pages/displayDocs/cipherDisplay.xhtml?publicationId=<P>&componentId=<C>` (HTML, ~70 KB/Kapitel)
- Norm-Verzahnung: `…/pages/legalBasis/legalBasis.xhtml` (MWSTG/MWSTV-Artikel-Register) — direkt gegen unsere SR-641.20-Anker mappbar
- Currency: `…/pages/displayDocs/changedCiphers.xhtml` als Änderungs-Feed-Ersatz
- Falle: Session/ViewState — Adapter muss zuerst die Portalseite laden (Cookie), dann Deep-Links; hübsche Pfade (`MI/20/1`) nur als 302-Resolver nutzen

**2. ESTV KS/RS (estv.admin.ch):**
- Die 5 Übersichtsseiten (`kreisschreiben-direkten-bundessteuer`, `-verrechnungssteuer`, `-stempelabgaben`, `rundschreiben-direkten-bundessteuer`, `-verrechnungssteuer`) sind server-gerendert → `<a class="download-item">`-Links mit PDF-URL + Linktext (Nr., Titel, Datum) parsen = fertiges Register
- Stufe 1 nur Index (Nr./Titel/Datum/PDF-Link als Verweiskarte), Stufe 2 optional PDF-Text (Tier B)
- Falle: keine Historie — entlistete KS sind weg → **eigene Snapshots behalten** (Append-only-Register)

**3. BSV (sozialversicherungen.admin.ch):**
- Themenbaum ablaufen: `/de/f/{id}` (Ordner) rekursiv → `/de/d/{id}` (Dokumentseite mit Metadaten: Nr., «gültig ab», «Stand», Versionsliste)
- Download deterministisch: `/de/d/{id}/download?version=N` → PDF; Versionsliste der Dokumentseite = fertige Historie (RWL: 21 Versionen bis 2001)
- Falle: keine Sitemap → Ordner-IDs müssen gecrawlt werden; IDs wirken stabil, aber Vollständigkeit des Baums einmalig verifizieren

## (c) Ehrliche Risiken

1. **PDF-only dominiert:** Ausser MWST-Webpublikationen liegt der eigentliche Rechtsinhalt ÜBERALL im PDF (ESTV KS/RS, BSV, SECO, SEM, FINMA, BAG, BAZG). Artikel-/Rz.-granulare Extraktion = Tier-B-PDF-Heuristik (LexFind-clex-Lektion: ~25–40 % Review-Bedarf bleibt). Ehrlicher Scope für E6a-Start: **Verweis-/Register-Ebene (Index + Norm-Mapping + PDF-Link), nicht Volltext-Einbettung.**
2. **Fehlende Historie bei ESTV KS/RS und SEM:** nur geltende Fassungen online; entlistete Dokumente verschwinden. Ohne eigene Append-only-Snapshots können wir «galt damals» später nicht belegen. BSV ist die rühmliche Ausnahme (Versions-API-artiges `?version=N`).
3. **FINMA technisch fragil:** undokumentierte Such-API (Parameter unbekannt), leerer RSS, JS-Liste — Adapter dort ist Reverse-Engineering mit Bruchrisiko bei jedem Relaunch.
4. **admin.ch-Akamai-Gate ist inkonsistent:** Kern-`admin.ch` blockt Skripte hart (403 auch mit Browser-UA), die Amts-Subdomains (estv/sem/seco/bag/bazg/sozialversicherungen) sind offen. Nicht darauf verlassen, dass das so bleibt — Fetch-Fehlerpfade (403/Soft-404) im Adapter first-class behandeln.
5. **AEM-DAM-HEAD-Falle (SEM):** `HEAD` auf `…/dam/…`-PDF-Assets liefert fälschlich 404, `GET` 200 — Existenz-Checks im Adapter immer per GET (Range-Request) machen.
6. **JSF-ViewState (ESTV MWST):** kein REST — URL-Schema (`publicationId`) kann bei ESTV-Releases brechen; IDs zusätzlich zur Nummern-Systematik («MWST-Info 20») persistieren, nie nur die ID.
7. **Kein Norm-Bezug maschinenlesbar** (ausser MWST-`legalBasis`): die Verzahnung mit unseren Normtext-Ankern erfordert überall eigene Zitat-Regexes über PDF-/HTML-Text — dieselbe Werkzeugklasse wie beim OpenCaseLaw-Befund (Zitat-Regexes als Moat).
8. **VPB:** als laufende Quelle streichen; Archiv-Korpus 1987–2018 nur via Bundesarchiv (`amtsdruckschriften.bar.admin.ch`, offen), Aufwand/Nutzen dort ungeprüft.

---

*Erhoben 3.7.2026 durch 4 parallele Recherche-Agenten mit Probe-Fetches; keine Repo-Änderung ausser dieser Datei. Kein Commit (Haupt-Session koordiniert).*
