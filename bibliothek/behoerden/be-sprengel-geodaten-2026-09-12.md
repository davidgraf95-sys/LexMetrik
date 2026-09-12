# BE — Gerichts- und Staatsanwaltschafts-Sprengel aus amtlichen Geodaten (K-15)

**Erstellt:** 12.9.2026 · **Stand der Quellen:** 1.1.2026 (Geodaten) / 1.5.2026 (GSOG)
**Status:** einfach belegt (Erstrecherche mit Vollerhebung + Gegenprobe gegen den
Bestand); fachliche Abnahme durch David ausstehend — `verified` bleibt ungesetzt (§7/§8).
**Rolle:** Vormessung + Quellenbeleg zu ROADMAP W2·13-KANTONE-DATEN / K-15.

## 1 · Ausgangslage im Code (gemessen, nicht vermutet)

| Stelle | Was heute da ist |
|---|---|
| `src/data/zivilgerichteErstinstanz.ts` (BE) | `modus: 'liste'` — vier Regionalgerichte als Auswahl; die örtliche Zuordnung Gemeinde→Gerichtsregion ist im Kopfkommentar ausdrücklich als NICHT abgebildet deklariert; die Wahl trifft die Nutzerin |
| `src/data/strafgerichte.ts` (BE) | ein Hauptort-Beispiel (Regionalgericht Bern-Mittelland, Amthaus Hodlerstrasse 7); übrige Sitze nur als Prosa-Hinweis; keine Gemeinde-Zuordnung |
| `src/data/schlichtung/aemterKantone.json` (`BE`) | 334 Gemeinden → 4 Schlichtungsbehörden, erzeugt von `scripts/plz-generieren.ts` über einen **BFS-Verwaltungskreis-Join** (Dossier `schlichtungsaemter-gemeindezuordnung.md` §34, 10.6.2026) |
| Regionale Staatsanwaltschaften | im Code **gar nicht** als Gemeinde-Zuordnung vorhanden |

Keine Heuristik, kein Fuzzy-Matching — aber die bestehende BE-Zuordnung ist eine
**Ableitung** (Verwaltungskreis-Gruppierung aus einer Dossier-Tabelle), kein
amtlich veröffentlichter Sprengel-Datensatz. Genau das schliesst K-15.

## 2 · Normbasis (unabhängige zweite Quelle, nicht Geodaten)

Quelle: BELEX-API des Kantons Bern, `https://www.belex.sites.be.ch/api/texts_of_law/161.1`
(JSON, abgerufen 12.9.2026). Fassung: **«Aktuelle Version in Kraft seit: 01.05.2026
(Beschlussdatum: 02.09.2025)»**. Live-Fassung: `https://www.belex.sites.be.ch/app/de/texts_of_law/161.1`.

- **Art. 80 Abs. 1 GSOG** (BSG 161.1): vier Gerichtsregionen — Berner Jura-Seeland,
  Emmental-Oberaargau, Bern-Mittelland, Oberland.
- **Art. 80 Abs. 2 GSOG**: «Die Gerichtsregion Berner Jura-Seeland entspricht den
  Verwaltungsregionen Berner Jura und Seeland, die übrigen Gerichtsregionen
  entsprechen den gleich bezeichneten Verwaltungsregionen gemäss Artikel 39a
  [OrG]». → Der Sprengel ist gesetzlich an die **Verwaltungsregionen** gebunden,
  nicht an die Verwaltungskreise. Die Kreis-Ableitung im Bestand trifft dasselbe
  Ergebnis, weil die Verwaltungsregionen Vereinigungen von Verwaltungskreisen sind.
- **Art. 81 Abs. 1 GSOG**: «Für jede Gerichtsregion besteht ein Regionalgericht. Das
  Regionalgericht Berner Jura-Seeland hat eine **Aussenstelle im Berner Jura**.»
  → Die Aussenstelle ist gesetzlich, nicht bloss organisatorisch.
- **Art. 92 Abs. 1 GSOG**: vier regionale Staatsanwaltschaften, gleich bezeichnet.
- **Art. 91 Abs. 3 GSOG** (Kontext): wegen des Wechsels der Gemeinde **Moutier zum
  Kanton Jura** kann die Aussenstelle vorübergehend im Verwaltungskreis Biel/Bienne
  untergebracht werden — deckt sich mit der Geodaten-Adresse Unionsgasse 13, 2502 Biel.

## 3 · Die Geodatensätze (live geprüft 12.9.2026)

CKAN: `https://ckan.opendata.swiss/api/3/action/package_search` (Hinweis: ohne
gesetzten `User-Agent` antwortet der CKAN-Host mit **HTTP 403**, nicht mit JSON).

| Datensatz | Code | Bezug (ZIP) | Zeilen | Stand |
|---|---|---|---|---|
| Regionalgerichte | `ADMRG` | `https://geofiles.be.ch/geoportal/pub/download/ADMRG/admrg.gpkg.zip` (0,97 MiB) | 9 Flächen | STAC-`temporal` ab **2026-01-01**; CKAN `modified` 2026-01-01 |
| Regionale Staatsanwaltschaften | `ADMRSA` | `https://geofiles.be.ch/geoportal/pub/download/ADMRSA/admrsa.gpkg.zip` (0,74 MiB) | 4 Flächen | dito |
| Politische Grenzen (Gemeinden) | `GRENZ5` | `https://geofiles.be.ch/geoportal/pub/download/GRENZ5/grenz5.gpkg.zip` (9,3 MiB) | 340 Flächen (334 BE-Gemeinden + 4 Seen + 2 Ausserkantonale) | dito |

Detailseiten: `https://www.agi.dij.be.ch/de/start/geoportal/geodaten/detail.html?type=geoproduct&code=ADMRG`
(analog `…&code=ADMRSA`, `…&code=GRENZ5`). Herausgeberin: Amt für Geoinformation
des Kantons Bern (`info.agi@be.ch`).

**Lizenz.** CKAN führt `license_id: null` — die massgebliche Erklärung steht in den
verlinkten Nutzungsbedingungen `https://geofiles.be.ch/internet/geo/geodaten/agi-dv-nutzungsbedingungen-de.pdf`
(Bearbeitungsdatum 20.1.2026, Klassifizierung «frei»): kantonale Geodaten «dürfen
grundsätzlich von jedermann für private und gewerbliche Zwecke kostenlos genutzt
werden» (Art. 22 KGeoIV, KGeoIG BSG 215.341); ausgewiesene opendata.swiss-Kategorie
**«Freie Nutzung. Quellenangabe ist Pflicht.»** Das Dokument hält zusätzlich fest,
Geodaten wiesen als strukturierte Daten keinen individuellen Werkcharakter auf.
→ Übernahme zulässig; die Quellenangabe wird im Artefakt und im Reader mitgeführt.

## 4 · Schlüssel und Attribute — was die Quelle trägt und was nicht

`ADMRG` (Tabelle `geodb.admrg_rg_vw`): `rgname`, `asname` (Aussenstelle), `rgtyp`
(«Strafsachen / Affaires pénales» vs. «Zivilsachen / Affaires civiles»), `adresse`,
`plz_ort`, Telefon/Fax/E-Mail je Zentrale und Direktwahl.
`ADMRSA` (`geodb.admrsa_rsa_vw`): `rsaname`, `adresse`, `plz_ort`, Telefon, Fax.

**Befund (§7, weicht vom Auftrags-Wortlaut ab):** Beide Sprengel-Datensätze führen
**keine** BFS-Gemeindenummer und überhaupt kein Gemeinde-Attribut — sie bestehen aus
Regionsflächen. Die Gemeinde↔Sprengel-Zuordnung ist deshalb **nicht attributiv
ableitbar**; sie muss geometrisch verschnitten werden. Die BFS-Nummer kommt aus
`GRENZ5` (`geodb.grenz5_g5_vw`: `bfsnr`, `gemname`, `vkreisnr`, `kt`, `see`) —
derselbe Herausgeber, dieselbe Lizenz, dasselbe Bezugssystem (EPSG 2056 / LV95).

Weiterer Quellen-Befund: `ADMRG` trägt die **Zivil/Straf-Adressspaltung** amtlich
(Bern-Mittelland Zivil = Effingerstrasse 34, 3008 Bern; Straf = Amthaus,
Hodlerstrasse 7, 3011 Bern). Der bisher nur als Prosa-Hinweis geführte Satz
«Hodlerstrasse 7 ist NUR die Strafabteilung» ist damit amtlich bestätigt.

## 5 · Verfahren der Zuordnung (deterministisch, Build-Zeit)

1. GPKG-Geometrien direkt aus SQLite lesen (`node:sqlite`), GPKG-Header + WKB
   selbst parsen — **keine** Geo-Bibliothek, keine Laufzeit-Geodaten im Browser.
   `GRENZ5` führt neben `Polygon`/`MultiPolygon` auch `CurvePolygon`/`MultiSurface`
   mit Kreisbögen; Bögen werden mit exakter Kreisgeometrie in eine feste Zahl
   Sehnen zerlegt (fixe Konstante → determinisch, kein Toleranz-Parameter).
2. Je Gemeinde ein **garantierter Innenpunkt** (point-on-surface): feste Schar von
   Scanlinien über den flächengrössten Teil, breiteste Innenspanne gewinnt. Der
   Punkt wird gegen die eigene Gemeindefläche gegengeprüft (Selbsttest).
3. Punkt-in-Polygon (even-odd) gegen alle Sprengelflächen; verlangt wird **genau
   ein** Treffer-Sprengel je Gemeinde.

## 6 · Messergebnis (Vollerhebung, 12.9.2026)

- **334/334** BE-Gemeinden zugeordnet; **0** Selbsttest-Fehler, **0** ohne Treffer,
  **0** mehrdeutig.
- Regionalgerichte: Bern-Mittelland **74** · Emmental-Oberaargau **82** ·
  Oberland **78** · Berner Jura-Seeland **100**, davon **39** über die
  **Aussenstelle Berner Jura** («Tribunal régional Jura bernois-Seeland, Agence du
  Jura bernois», Unionsgasse 13, 2502 Biel) und **61** über den Sitz Biel
  (Amthaus Biel, Spitalstrasse 14). Die beiden Flächen sind disjunkt (39 + 61 = 100).
- Regionale Staatsanwaltschaften: dieselbe Vierteilung (74 / 82 / 78 / 100).
- **Gegenprobe gegen den Bestand:** die geometrisch bestimmte Vierteilung stimmt
  Gemeinde für Gemeinde mit `aemterKantone.json` (`BE`) überein — **0 Abweichungen
  bei 334 Gemeinden**. Die Namensmengen sind identisch (0 nur-Geodaten, 0 nur-Register).
  Der Verwaltungskreis-Join des Bestandes ist damit amtlich bestätigt, nicht ersetzt.
- **Verwaltungskreis-Konsistenz:** alle zehn BE-Verwaltungskreise fallen je ganz in
  genau eine Gerichtsregion (241 Jura bernois → Aussenstelle; 242/243 → Sitz Biel;
  244/245 → Emmental-Oberaargau; 246 → Bern-Mittelland; 247–250 → Oberland).
  Das ist die geometrische Bestätigung von Art. 80 Abs. 2 GSOG.
- **Moutier** ist in `GRENZ5` (Stand 1.1.2026) korrekt **nicht** mehr enthalten
  (Kantonswechsel zu JU per 1.1.2026); der Bestand führt es ebenfalls nicht.

## 7 · Was offen bleibt

- Die Zuordnung ist **Erstrecherche mit Vollerhebung**; fachliche Abnahme (§7/§8)
  steht aus. Das Artefakt trägt darum keinen `verified`-Status.
- Die amtlichen Stellen publizieren **keine** Gemeindeliste je Gerichtsregion auf
  ihren Webseiten (`zsg.justice.be.ch/…/regionalgerichte/<region>.html` nennen nur
  Adressen und Öffnungszeiten). Die Stichprobe stützt sich darum auf die
  Normbasis (Art. 80 Abs. 2 GSOG → Verwaltungsregion) und die Geodaten selbst.
- Jugendanwaltschaften (`ADMRSA`-Schwester `Regionale Jugendanwaltschaften`,
  Art. 91 GSOG) sind bewusst **nicht** aufgenommen — eigener Arbeitsgang.
