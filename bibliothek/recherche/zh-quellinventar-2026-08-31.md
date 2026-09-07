# ZH-Quellinventar — Zürcher Gesetzessammlung (LS), Quell-Menü & Import-Grundlage

**Erstellt:** 31.8.2026 — Auftrag David («Zürcher Gesetze inventarisieren und einbauen»,
W2·13-KANTONE-DATEN ZH-Tranche, Stufe 1 Inventar vor Import). Erhebung read-only
durch Recherche-Agent (Skill `scraping-swiss-official-sources` geladen, ~74 Requests,
~1 req/s, UA `LexMetrik-Inventar/1.0`); interner Pipeline-Befund durch zweiten
read-only-Agent (HEAD `cec6cdbfb`).
**Status:** ERSTRECHERCHE (einfach belegt; Kern-Erlass-Nummern über den amtlichen
JSON-Endpunkt verifiziert, PDF-Kette an LS 101 durchgezogen).

## Quellen

- Suchseite/Systematik: `https://www.zh.ch/de/politik-staat/gesetze-beschluesse/gesetzessammlung.html` (Abruf 31.8.2026, server-gerendert, 177 KB)
- JSON-Endpunkt LS: `https://www.zh.ch/de/politik-staat/gesetze-beschluesse/gesetzessammlung/_jcr_content/main/lawcollectionsearch_312548694.zhweb-zhlex-ls.zhweb-cache.json` (Abruf 31.8.2026, `application/json`) · OS-Pendant: `…zhweb-zhlex-os.zhweb-cache.json`
- Sitemap: `https://www.zh.ch/de/politik-staat/gesetze-beschluesse/gesetzessammlung.zhweb-sitemap.xml` (Abruf 31.8.2026, `text/xml`, 6 726 245 B)
- PDF-Kette (Beispiel LS 101): Registry-HTML → OpenAttachment `notes.zh.ch` → 152-B-JS-Redirect → `application/pdf` (367 128 B, 29 S., PDF 1.4; Abruf 31.8.2026)
- Permalink geltende Fassung: `http://www.zhlex.zh.ch/Erlass.html?Open&Ordnr=<LS-Nr>` (301 → `…/lawcollection-directlink`; Abruf 31.8.2026)
- Jahresregister: `register_zuercher_gesetzessammlung_2025.pdf` (`application/pdf`, 2 836 777 B, Last-Modified 5.5.2026 — nicht ausgewertet, s. Offenes)
- CKAN: `https://ckan.opendata.swiss/api/3/action/package_search?q=zhlex` (Abruf 31.8.2026)

## 1 Bestand: 944 in Kraft stehende LS-Erlasse (31.8.2026)

Zählweg A (tragend): JSON-Endpunkt je Systematik-Ordner `fileNumber=1…14`,
`includeRepealedEnactments=false`, alle 14 Slices HTTP 200 und ungekappt
(`moreSearchResultsThanAllowed:false` durchgehend):

| Ordner | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | Σ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| n | 72 | 62 | 76 | 27 | 44 | 50 | 70 | 130 | 44 | 67 | 68 | 65 | 108 | 61 | **944** |

Gegenprobe B (Obergrenze): Sitemap → 6 760 `zhlex-ls/erlass-*`-URLs = 1 593
distinkte Ordnungsnummern inkl. aufgehobener/historischer (ø 4,2 Fassungen,
max 48) — konsistent (1 593 ≥ 944), aber ohne Aufhebungs-Status keine Ist-Zahl.
Deckt sich mit Messung 12.7.2026 (~940). Volle Enumeration: 70 Requests
(15 Treffer/Seite, ordner-weise).

## 2 Formate — Entscheid Formatleiter

- **Volltext: ausschliesslich PDF** (notes.zh.ch, zweistufige Kette). Kein XML,
  kein DOCX, kein HTML-Volltext auf irgendeinem amtlichen ZH-Pfad (S5-Negativbefund;
  Registry-Seite trägt nur Metadaten + Fassungsliste). Der Formatleiter-Abstieg
  auf PDF ist damit **beweisgeführt** — `adapter-zh-pdf.ts` bleibt der richtige Weg.
- **Metadaten/Enumeration: amtlicher JSON-Endpunkt** (Fund der Erhebung).
  Antwort `{data[], numberOfResults, numberOfResultPages, moreSearchResultsThanAllowed}`;
  Satz `{link, referenceNumber, enactmentTitle, enactmentDate, withdrawalDate}`.
  Parameter: `fullText, enactmentTitle, referenceNumber, fileNumber, enactmentDate,
  entryIntoForceDate, withdrawalDate, publicationDate, includeRepealedEnactments, page`.
  15 Treffer/Seite, **harte Kappung bei 150** → nur ordner-weise vollständig.
- **CKAN/opendata.swiss: kein LS-Datensatz** (S5). Einziger ZH-Treffer ist die
  historische OS ab 1803 (Staatsarchiv, Zenodo-XML, `terms_by`, Stand 2024) —
  trägt geltendes Recht nicht; die zhlex-ähnlichen CSV/JSON-Datensätze gehören BS.
- **lexfind: Vertrag gebrochen.** `POST /api/fe/de/fulltext-search` mit dem im Repo
  dokumentierten Schema (23.6.2026) → HTTP 400 «Obsolete keys»; neues Schema laut
  Server: `search_text, active_only, search_in_systematic_number, search_in_title,
  search_in_keywords, search_in_content, use_global_systematics, entity_filter,
  systematic_filter, category_filter, direct_search`; leerer `search_text` wird
  abgewiesen. Für ZH ohnehin obsolet — der amtliche JSON-Endpunkt ersetzt lexfind
  als Enumerations-Signal vollständig.

## 3 Systematik — browserlos belegt (Ebene 1)

Die 14 Ordner stehen server-gerendert als `fileNumber`-Optionen in
`gesetzessammlung.html` (Nummernband + Thema): 1 Verfassung/Gemeinden/Politische
Rechte (101–176) · 2 Staatspersonal/Kirchen (177–184) · 3 Gerichtsorganisation/
Zivilrecht/Notariat/Grundbuch (211–255) · 4 SchKG/Strafrecht/Vollzug (281–351) ·
5 Bildung/Volksschule (410–412) · 6 Mittelschulen/Berufsbildung (413) ·
7 Fachhochschulen (414) · 8 Universität/Kultur (415–440) · 9 Militär/Polizei
(511–554) · 10 Finanzen/Steuern/Gebühren (611–691) · 11 Raumplanung/Bau/Umwelt
(700–715) · 12 Beschaffung/Strassen/Energie/Verkehr (720–782) · 13 Gesundheit/
Arbeit/Soziales (810–857) · 14 Feuerpolizei/Landwirtschaft/Gewerbe/Banken (861–954).
Feinere Ebenen maschinell nicht greifbar; einzige weitere Struktur ist die
Hunderter-Gruppe der Ordnungsnummer (Feingliederung evtl. im Jahresregister-PDF, offen).

## 4 Ordnungsnummern & Abkürzungen

Schema `H[.U[.U]]` (3-stellige Hauptnummer, 1–3 Ebenen, Punkt→Unterstrich in URLs);
Spannweite 101…954, tiefste beobachtete Schachtelung 414.410.5. Registry-URL-Form:
`erlass-{Nr}-{Erlassdatum}-{Inkraftsetzung|leer}-{Nachtragsnr}.html`; die 3-stellige
Endzahl ist die **Nachtragsnummer der Loseblattsammlung** (Fassungs-Zähler je
Ordnungsnummer, max beobachtet 134) — «höchste Nummer = aktuell» gilt NIE korpusweit.
Abkürzungen: in Klammern im `enactmentTitle` («Steuergesetz (StG)») + Feld
*Kurztitel* der Registry-Seite; kein eigener Abkürzungs-Datensatz (S5).

## 5 API-/Rate-Verhalten & Drift-Token

- robots.txt zh.ch: nur Sitemap-Zeile, kein Disallow/Crawl-delay; notes.zh.ch: 404.
- Antwortzeiten (seriell, n=1): JSON 0,15 s · Registry 0,18 s · PDF 0,37 s; keine
  Drosselung bei ~1 req/s über ~50 Requests. Über Parallel-Massenlast sagt das nichts.
- **Drift-Token:** Registry-HTML `Last-Modified` = Abrufzeit → unbrauchbar.
  **PDF auf notes.zh.ch trägt echtes `Last-Modified` + `ETag`** (Domino-Sequenz+UNID,
  z. B. LS 101: `Last-Modified: Tue, 24 Mar 2026 20:43:16 GMT`) — billiger Vor-Filter
  vor der `quelleHash`-Prüfung. Permalink `zhlex.zh.ch/Erlass.html?Open&Ordnr=…`
  löst Fassungswechsel unabhängig vom Dateinamen.
- **Fehlerverhalten:** notes.zh.ch liefert bei fehlender Datei echten HTTP 404
  (kein 200-Shell). Der JSON-Endpunkt liefert bei 0 Treffern **HTTP 204 mit leerem
  Body** (kein JSON!) — Status-/Längenprüfung vor `JSON.parse` ist Pflicht.
- **AEM-Fragilität:** `lawcollectionsearch_312548694` ist eine Komponenten-ID; ein
  Seiten-Redesign ändert sie ohne Vorwarnung → die ID zur Laufzeit aus
  `gesetzessammlung.html` auflösen, nie verdrahten.

## 6 Kern-Erlass-Kandidaten (verifiziert via JSON-Endpunkt; PDF-Kette an LS 101)

KV 101 · GG 131.1 · VGG 131.11 · FAG 132.1 · KBüG 141.1 · IDG 170.4 · IDV 170.41 ·
KRG 171.1 · VRG 175.2 · PG 177.10 · **GOG 211.1** · GebV OG 211.11 (im Repo) ·
IAV 211.15 · GSVGer 212.81 · GebV SVGer 212.812 · VOSTA 213.21 · **AnwG 215.1** ·
AnwGebV 215.3 (im Repo) · EG ZGB 230 · EG KESR 232.3 · EG BewG 234.1 · **NotG 242** ·
NotGebV 243 (im Repo) · VBG 281.1 · GebV Strafverfolgung 323.1 · StJVG 331 ·
PolG 550.1 · **StG 631.1** · StV 631.11 · PBG 700.1 · SHG 851.1.
**Auftragskorrekturen (§7):** Notariatsgesetz ist **LS 242** (nicht 154; 243 = NotGebV);
ein separates «EG ZPO» existiert in ZH **nicht** — Einführung ZPO/StPO leistet das
GOG (211.1).

## 7 Interner Pipeline-Befund (HEAD cec6cdbfb) — Import ist Bauschritt, kein Datenlauf

- **Kein deklaratives ZH-Manifest:** ZH-Erlassliste = Ableitung aus den Tarif-Tabellen
  (`sammleZhPdfInventar()`, `scripts/normtext/inventar-kanton.ts:340-372`, Filter
  `ZH_PDF_QUELLE`). Ein Erlass ohne Tarif-Zitat existiert für Pipeline UND
  Drift-Prüfung nicht (`check-drift.ts:321` liest dasselbe Inventar — §7-d-Lücke).
  Umweg über `src/data/tarif/*.ts` verboten (reisst `lexmetrik-golden.json`).
- **`holeZhPdf` ohne Retry/Cache** (`adapter-zh-pdf.ts:1310-1339`, nacktes `fetch`
  ×3/Erlass): bei 3 Erlassen nie aufgefallen, bei 20+ schlägt ein transienter
  Ausfall still zu (Erlass fehlt kommentarlos) — §17-Wurzelfix vor dem Lauf.
- **Perf-Deckel:** Der 97-%-Merkposten betrifft `public/rechtsprechung/register.json`
  (Urteile), nicht Normtext. Realer Deckel für Kanton-Importe:
  `public/such-index/artikel.json` (Budget 10 400 KB gzip, ~3,6 KB/Erlass, Luft
  ~200 Erlasse) → 20 ZH-Erlasse ≈ +72 KB, unkritisch.
- **Erlass-Hardcodes im Adapter:** `istZh21111`-Sonderpfad + `'4' in artikel`-Staffel-
  Heuristik (`adapter-zh-pdf.ts:1372-1390`), Spiegelrand-Layout-Annahmen (:21-35) —
  je neuem Erlass empirisch prüfen; pdfplumber-Gegenprobe Pflicht (G3).
- Systematik/Struktur-Sidecars/pdf-quellen laufen für ZH heute ins Leere (LexWork-only
  bzw. Host ohne `/api/de/systematic_categories`) — K-13-Anteil.

## 8 Offenes

- Jahresregister-PDF als unabhängige Bestands-Gegenprobe + Feingliederungs-Quelle (Zählweg D).
- lexfind-Neuvertrag: nur dokumentiert, nicht in `lexfind-discovery.ts` nachgezogen
  (betrifft andere Kantone; ROADMAP-Vermerk).
- OS-Schiene (`zhlex-os`, eigener JSON-Endpunkt): ZH-Pendant zur AS-Vorlauf-Problematik —
  für eine spätere Aktualitäts-Wache relevant, ungeprüft.
- Massenlast-Verhalten notes.zh.ch (nur seriell ~1 req/s getestet).

---

## 9 Nachtrag 1.9.2026 — Tranche A (Ordner 3, 10, 4): zwei Messbefunde

Additiv nach S8: Ziff. 1–8 bleiben im Wortlaut stehen (Erhebungsstand
31.8.2026). Diese Ziffer trägt nach, was der Import der drei Ordner
empirisch ergeben hat.

### 9.1 Ordner-Enumeration bestätigt die Bestandszahlen — und der Endpunkt
### zählt Seiten EINSBASIERT

Ordner-weise Enumeration (`zh-quellen-aufloesen.ts --ordner=3,10,4`) über
`fileNumber` + `page` liefert **76 / 67 / 27 = 170** geltende Erlasse. Das
deckt sich Erlass für Erlass mit Zählweg A aus Ziff. 1 — die Zahlen dort sind
damit unabhängig gegengeprüft, nicht bloss wiederholt. Alle 12 Erlasse, die
schon im Kern-Bestand standen, trugen Titel, Kürzel und Registry-URL
byte-gleich zum amtlichen Endpunkt (0 Konflikte).

**Neue Falle (empirisch belegt 1.9.2026), gehört neben die HTTP-204-Falle aus
Ziff. 5:** Der Parameter `page` ist **einsbasiert**. `page=0` und `page=1`
liefern beide dieselbe erste Seite. Eine nullbasierte Schleife
(`for seite=0; seite < numberOfResultPages`) holt darum Seite 1 doppelt und
lässt die **letzte** Seite still weg — gemessen an Ordner 4: 15 statt 27
Erlasse, ohne Fehler, ohne HTTP-Auffälligkeit. Wer ordner-weise enumeriert,
zählt `1 … numberOfResultPages` und hält eine Dubletten-Wache daneben.

### 9.2 55 von 170 Erlassen tragen gar keine §-/Art.-Gliederung (Adapter-Grenze)

Der ZH-Adapter erhebt die Zählweise je Erlass aus der Textbasis
(`erkenneZhMarker`: «§ N» oder «Art. N»). **55 der 170 Erlasse dieser drei
Ordner tragen keinen einzigen Kopf beider Formen** und liefern folglich
0 Bestimmungen. Es ist kein Quell-, sondern ein Gliederungsbefund — die PDFs
sind vollständig, byte-verifiziert und im Roh-Cache:

- **Kantonsrats-/Regierungsratsbeschlüsse** («Der Kantonsrat, … beschliesst:»)
  gliedern römisch («I., II.») oder gar nicht (LS 212.22, 631.21).
- **Gegenrechtserklärungen zu Erbschafts-/Schenkungssteuern** (die ganze
  Gruppe LS 672.6xx, 673.11) sind Briefwechsel-Erklärungen mit blosser
  Ziffern-Gliederung («1., 2., a., b.»).
- **Alte Reglemente** (LS 326, von 1961) nummerieren Bestimmungen als blosse
  Ziffern ohne §-Zeichen.

Konsequenz für den Bau: diese Klasse gehört in die Gliederungs-Runde
(FAHRPLAN-KANTONE §5.2 Phase II R1/R4), nicht in eine Sonderregel im Adapter.
Bis dahin stehen die Erlasse mit Grund in `ZH_ZURUECKGESTELLT`
(`scripts/normtext/zh-quellen.ts`) — ausgewiesene Lücke statt falscher Text
(§8). Dazu 13 Erlasse, an denen die unabhängige Zweitlesung
(`check:zh-vollstaendigkeit`) einen echten Befund gegen das PDF meldet; ihr
Befund steht dort im Wortlaut, damit die Fix-Runde nicht neu messen muss.

**Aufgenommen 1.9.2026: 111 Erlasse / 4356 Artikel-Einträge**, Zweitlesung
111/111 grün, 0 Befunde. Status unverändert «Geltung ungeprüft» (§7/§8).
