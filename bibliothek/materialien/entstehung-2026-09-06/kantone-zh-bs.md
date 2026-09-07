# Kantonale Gesetzesmaterialien ZH/BS — maschinenlesbare amtliche Quellen

*Kopiert unveraendert aus Recherche 6.9.2026, Agent Sonnet, read-only.*
Recherche/alle Abrufe: 6.9.2026 (curl/WebFetch/WebSearch).

## 1. Zürich (ZH)

### 1.1 Kantonsrat-Geschäftsdatenbank — belegt, LIVE
CKAN-Katalogeintrag opendata.swiss: `organisation-und-geschafte-des-zurcher-
kantonsrats` (Org: Fach- u. Koordinationsstelle OGD Kanton Zürich).
https://opendata.swiss/de/dataset/organisation-und-geschafte-des-zurcher-kantonsrats
(direkter curl auf opendata.swiss → HTTP 403/Cloudflare; realer Host ist
ckan.opendata.swiss, dort HTTP 200 mit Browser-UA).
Reale Schnittstelle: XML-Webservice `parlzhcdws.cmicloud.ch` (CMI-Parlaments-
software), getestet:
`https://parlzhcdws.cmicloud.ch/parlzh5/cdws/Index/GESCHAEFT/searchdetails?q=krnr%20any%20*%20sortBy%20beginn_start/sort.descending&l=de-CH&s=1&m=2`
→ HTTP 200, XML, `numHits="18946"`, Feld `KRNr` z.B. "324/2026". Weitere
Indizes: SITZUNGENDETAIL, Files (PDF je Geschäft), KRVERSAND, MITGLIEDER,
BEHOERDEN, PARTEIEN, GESCHAEFT_GESCHAEFTSART, ABLAUFSCHRITTE. Undokumentierte
Query-Syntax, kein OpenAPI/Swagger. Lizenz im CKAN-Metadatum leer (`license_id`
= None) — offen, ob generische OGD-Bedingungen ZH gelten. Weisungen/Anträge
des RR sind Teilmenge von GESCHAEFT (Geschäftsart), nicht eigener Datensatz.

### 1.2 Regierungsratsbeschlüsse (RRB) — Negativbefund
Kein aktueller RRB-Datensatz auf opendata.swiss. Einziger Treffer:
`zurcher-regierungsratsbeschlusse-des-19-jahrhunderts` (Staatsarchiv, nur
19./20. Jh., kein Live-Feed). Aktuelle RRB nur HTML/PDF/Amtsblatt. Offen, ob
es überhaupt eine amtliche RRB-API gibt (nur Katalogsuche geprüft).

### 1.3 Volksabstimmungen — belegt
`abstimmungsarchiv-des-kantons-zurich1` (Amt für Statistik u. Daten ZH),
"ab 1831". https://opendata.swiss/de/dataset/abstimmungsarchiv-des-kantons-zurich1
Struktur nicht im Detail geprüft. Ergänzend: `abstimmungsempfehlungen-von-
kantonsrat-und-regierungsrat-des-kantons-zurich` (Parolen).

### 1.4 ZH-Lex — Negativbefund (kein API, kein Materialien-Link)
WebFetch auf https://www.zh.ch/de/politik-staat/gesetze-beschluesse/
gesetzessammlung.html (6.9.2026): nur Suche + Direktlinks je Erlass, **keine**
API, kein XML/JSON-Export, **keine** Verweise auf das auslösende Kantonsrats-
geschäft je Änderung. Änderungshistorie "Geschäft → geänderter Artikel" für
ZH strukturiert nicht auffindbar. Steuerbuch/Weisungen Steueramt ZH: nicht
geprüft (Zeitbudget) — offen, vermutlich ebenfalls reines HTML/PDF.

### 1.5 Vernehmlassungen ZH — kein Fund (offen)

## 2. Basel-Stadt (BS) — deutlich reichhaltiger

Plattform OpenDataSoft ("Huwise"): `https://data.bs.ch/api/explore/v2.1/
catalog/datasets/{id}/records` bzw. `/exports/{format}`. Getestet, live:

| ID | Titel | Lizenz | Kernfelder |
|---|---|---|---|
| 100311 | Grosser Rat: Geschäfte | CC BY 4.0 | `signatur_ges` ("11.5056"), `titel_ges`, `ga_rr_gr` (Anzug/Ratschlag/…), Urheber |
| 100312/100314 | Zuweisungen / Vorgänge von Geschäften | — | Join via `signatur_ges` |
| 100313 | Grosser Rat: Dokumente | CC BY 4.0 | `signatur_ges` (Join zu 100311), `url_dok` |
| 100515/100516/100514 | Vernehmlassungen (Dok./Übersicht/Rückmeldungen) | CC BY 4.0 | `name_vernehmlassung`, Start/Ende, Dok-URLs |
| 100354 | Gesetzessammlung: Gesetzestexte | CC BY 4.0 | `systematic_number`, `gesetzestext_html`, `url_de`→gesetzessammlung.bs.ch |
| 100355 | Gesetzessammlung: Gesetzesänderungen | CC BY 4.0 | `change_date`, `change_type`, `text_of_law_systematic_number`, `text_of_law_version_id` |

Belege: `.../datasets/100311/records?limit=2` → 21'134 Records, Beispiel
`signatur_ges: "11.5056"`, `url_dokumente` verweist mit
`?refine.signatur_ges=11.5056` auf 100313 — dokumentierter Join innerhalb des
Grossrats-Clusters. `.../datasets/100355/records` → 3'254 Records, Feld
`tols_dta_url: https://www.lexfind.ch/tol/34420/de` und
`tols_dta_original_url: https://www.gesetzessammlung.bs.ch/data/772.180/de`
— SG-Nummer als Schlüssel zu gesetzessammlung.bs.ch und lexfind.ch bestätigt.
Regierungsratsgeschäfte BS (`geschafte-und-berichte-regierungsrat-...`):
CKAN-Package katalogisiert, aber alle 4 Resources Format **HTML** (Links auf
regierungsrat.bs.ch/geschaefte/*.html) — kein strukturierter Export trotz
OGD-Meldung. Negativbefund.

## 3. Join-Schlüssel Erlass ↔ Geschäft — Kernbefund

- **BS**: `signatur_ges` ist sauberer Schlüssel *innerhalb* der Grossrats-
  Datensätze (100311–100314). Zwischen Gesetzessammlung (100354/100355,
  Schlüssel `systematic_number`/`text_of_law_id`) und Grossrats-Geschäften
  (`signatur_ges`) wurde **kein** gemeinsames Feld gefunden — Join "welcher
  Ratschlag hat diese Änderung bewirkt" ist mit OGD-Feldern nicht direkt
  herstellbar, nur über Datum/Titel-Fuzzy-Matching oder Scraping des
  Ratschlag-Volltexts. Offen.
- **ZH**: kein Gesetzessammlungs-Datensatz mit Änderungs-Metadaten gefunden
  (§1.4) — Join mangels zweitem Datensatz nicht prüfbar. Offen.
- **lexfind.ch**: laut LeGes/Weblaw-Artikel (Sekundärquelle, WebSearch
  6.9.2026, nicht direkt gegen lexfind.ch verifiziert) ein von der
  Schweiz. Staatsschreiberkonferenz finanziertes, seit 2013 von Sitrox/ZRI
  betriebenes interkantonales Gemeinschaftsprojekt, bündelt Gesetzes-
  sammlungen aller Kantone+Bund, tägliche Änderungsprüfung. Kein privates
  Drittportal, aber kein "amtliches Organ" i.S.v. LexMetrik §7 (Live-Link
  muss auf kantonale Originalquelle zeigen) — als Metadaten-Lieferant
  brauchbar, nicht als Zitatquelle selbst.
  Quelle: https://leges.weblaw.ch/legesissues/2020/2/lexfind-2.0_dcb8a91d6f.html

## 4. Weitere Kantone — Musterprüfung

- **Bern (BE)**: `geschafte-des-grossen-rates`, eigene Plattform
  `ogd.parl.apps.be.ch`. Getestet: `.../data/geschaeft.json` → HTTP 200,
  13.9 MB, `{exportDate, data:[...]}`, Felder `geschaeft_nr` ("2014.RRGR.1157"),
  `geschaeft_vorstoss_nummer`, `geschaeft_federfuehrung_*`, DE/FR parallel.
  Auch CSV/XML. Lizenz im CKAN-Package leer (wie ZH) — technisch das
  sauberste geprüfte Muster (tagesaktueller Vollexport, klare Feldnamen).
- **St. Gallen (SG)**: `geschafte-im-kantonsrat-st-gallen`, Plattform
  `daten.sg.ch` (OpenDataSoft — gleiches Muster wie BS, Exports CSV/JSON/
  JSONL/Parquet/RDF-XML). Nur Endpoint-Existenz geprüft, nicht Inhalt.
- **Aargau / Luzern**: Katalogsuche opendata.swiss ohne Treffer zu Grossrats-/
  Kantonsratsgeschäften (nur Fuzzy-Zufallstreffer) — kein OGD-Parlaments-
  datensatz gefunden. Offen, evtl. eigene Seite ohne OGD-Meldung.

## 5. Lizenzlage

BS (OpenDataSoft): durchgängig **CC BY 4.0**, explizit im Metadatenfeld.
ZH und BE (CKAN): Lizenzfeld im geprüften Beispiel **leer** — kein Beleg für
eine deklarierte Lizenz, nicht separat gegen die Portal-AGB verifiziert.

## 6. Empfehlung

BS liefert den saubereren Baustein: dokumentierter `signatur_ges`-Join,
CC BY 4.0, OpenDataSoft-API identisch zu SG (ein Adapter für beide). ZH nur
roher CMI-XML-Feed für Kantonsrats-Geschäfte, kein Gesetzessammlungs-
Gegenstück, keine Lizenz-Deklaration. In BEIDEN Kantonen fehlt ein direkter,
amtlich gepflegter Schlüssel "Erlass-Artikel ↔ auslösendes Geschäft" — das
müsste heuristisch (Datum, Titel, PDF-Volltext von Ratschlag/Weisung)
hergestellt werden, kein Plug-and-Play-Join.
