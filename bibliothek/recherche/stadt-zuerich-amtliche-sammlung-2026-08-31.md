# Stadt Zürich — Amtliche Sammlung (AS): Publikationsweg & Import-Einordnung

**Erstellt:** 31.8.2026 — Auftrag David («recherchiere auch wie stadt zh gesetze
publiziert», Nebenstrang zur ZH-Tranche W2·13-KANTONE-DATEN). Erhebung read-only
durch Recherche-Agent (Skill `scraping-swiss-official-sources` geladen, ~33 Requests,
~1 req/s, UA `LexMetrik-Inventar/1.0`).
**Status:** ERSTRECHERCHE (einfach belegt).

## Quellen

- Einstieg: `https://www.stadt-zuerich.ch/amtliche-sammlung` → kanonisch
  `https://www.stadt-zuerich.ch/de/politik-und-verwaltung/politik-und-recht/amtliche-sammlung.html`
  (Abruf 31.8.2026, `text/html`, 73 070 B, AEM server-gerendert)
- Such-JSON: `https://www.stadt-zuerich.ch/stzh/search?lang=de&compResource=…/search_1143309565&q=&limit=1000`
  (Abruf 31.8.2026, `application/json`, 222 716 B) · Änderungs-Feed: `…_co`-Variante
- Sling-Export: jede Erlass-/Versionsseite + `.1.json` (Abruf 31.8.2026; `.2.json` 404, `.model.json` 403)
- PDF-Probe: `…/dam/web/de/politik-verwaltung/politik-recht/amtliche-sammlung/101/100/101.100-gemeindeordnung-2025.11-v31.pdf`
  (728 909 B, `Last-Modified: Tue, 07 Jul 2026`)
- robots.txt: `https://www.stadt-zuerich.ch/robots.txt` (Abruf 31.8.2026)
- CKAN Stadt: `data.stadt-zuerich.ch` `package_search` (Abruf 31.8.2026)

## 1 Sammlung & Bestand

«Amtliche Sammlung» (AS) der Stadt Zürich, Stadtkanzlei, seit 1893. AS-Nummern
`NNN.NNN` (775) bzw. `NNN.NNN.N` (14); erste Ziffer = 1 von 9 Hauptgruppen
(1 Gemeinde/Personal/Verwaltung · 5 Polizei · 6 Finanzen · 7 Bau/Umwelt/Verkehr ·
8 Gesundheit/Soziales …). **Bestand: 790 Einträge, davon 621 geltend**,
169 ausser Kraft, 7 mit Inkrafttreten in der Zukunft (per 1.9.2026, u. a.
BZO 700.100). Enumeration = **ein einziger Request** (`limit=1000`,
`meta.total`-Count-Gate; kein Cap beobachtet).

## 2 Formate

- **Struktur-Endpunkte (JSON), verifiziert:** Such-API (`/stzh/search`, Felder
  `topic`=AS-Nr, `heading`, `href`, `meta[]` mit In-Kraft-/Ausser-Kraft-Datum;
  Parameter `ASZ` exakt, `q_topic`, `q_dy`, `q`) + Sling-`.1.json` je Erlass
  (Versionsknoten) und je Version (`ErlassDatum`, `InkrafttretenDatum`,
  `AusserkraftgetretenDatum`, `PdfFileReference`). AEM-Komponenten-ID
  `search_1143309565` zur Laufzeit aus dem Markup auflösen (gleiche Falle wie zh.ch).
- **Volltext: nur PDF** (S5-Negativbefund an 4 Stichproben 101.100/551.110/
  177.100/700.100 — HTML trägt nur Metadaten + einen PDF-Link; kein DOCX/XML;
  Website: «Alle Erlasse sind seit 2002 als PDF-Dokument im Internet publiziert»).
  PDFs: InDesign-erzeugt, **Tagged PDF** mit Textlayer (keine OCR), kein PDF/A,
  Text kerning-zerstückelt → layoutfähiger Extraktor nötig.
- **Kein OGD-Datensatz** zur AS auf data.stadt-zuerich.ch (S5; `title:"Amtliche
  Sammlung"` → 0; Treffer zu erlass/gesetz/recht = Statistik/Geodaten).

## 3 Aktualität / Drift

- Je Fassung maschinenlesbar: Geltungsfenster (Sling-JSON) + lückenlose
  Versionstabelle auf der Erlass-Seite (Gemeindeordnung: 30 Vorfassungen bis 1971).
- **Drift-Token = `Last-Modified` des DAM-PDF** (echt) + Versionszähler im
  Dateinamen (`…-v31.pdf`); HTML-`Last-Modified` = Abrufzeit (wertlos), ETag schwach.
- **Zukunfts-Falle:** oberste Fassung kann künftig sein (7 Fälle per 31.8.2026) —
  Fassung immer über das Geltungsfenster auf den Stichtag wählen
  (Fedlex-`dateApplicability`-Analogie).
- **Klassifikations-Fallen:** 2 Einträge ohne Themen-Tag (Themen-Partition
  verliert sie still, 788≠790); «ausser Kraft» nur am Datumsfeld erkennen —
  4 aufgehobene Erlasse sind im Titel unmarkiert.
- Änderungskanäle daneben: städtisches Amtsblatt (wöchentlich) +
  Stadtratsbeschlüsse (ab 2010) — eigene Rubriken, nicht Teil der AS.

## 4 Abgrenzung Kanton

Disjunkt zu zhlex: eigene Nummern (AS vs LS), eigener Betreiber (Stadtkanzlei vs
Kanton), eigener Endpunkt. Keine Verweise der AS-Seiten auf die kantonale
Sammlung. Ob lexfind die Stadt-AS spiegelt: offen (lexfind liefert nur
Angular-Shell; für uns irrelevant — stadt-zuerich.ch ist Primärquelle).

## 5 Einordnung für LexMetrik

Fachlich lohnend (Gebühren-Cluster 681.100/702.140/551.2xx/711.210/712.110,
BZO, APV, Personalrecht = Praktiker-Alltagsware), technisch günstiger als der
Kanton (1-Request-Katalog, saubere Versions-JSON). Empfohlener Weg:
**erst Registerebene** (AS-Nr · Titel · Geltungsfenster · Link aufs amtliche PDF —
verlustfrei aus JSON), Volltext nur für einzelne geprüfte Erlasse.

**Hürde — robots.txt (wartet auf David):** `robots.txt` verbietet das
AS-PDF-Verzeichnis (`/content/dam/web/de/politik-verwaltung/politik-recht/
amtliche-sammlung/`). Urheberrechtlich sind die Texte frei (Art. 5 URG), aber
ein PDF-Massenabzug liefe der ausgedrückten Absicht zuwider → vor einem
Volltext-Import **Anfrage an die Stadtkanzlei**; die JSON-Registerebene ist von
keiner Disallow-Regel erfasst. Einzelabrufe zur Verifikation (wie diese
Erhebung) sind kein Massenabzug.

## 6 Offenes

- lexfind-Spiegelung der Stadt-AS (nur mit neuem lexfind-Vertrag prüfbar).
- Sling-`.1.json` mutmasslich auch für Stadtratsbeschlüsse nutzbar (ungeprüft).
- Stadtkanzlei-Anfrage für PDF-Volltextbezug (Entscheid + ggf. Brief: David).
