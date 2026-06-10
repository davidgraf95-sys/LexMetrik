# Schlichtungsämter mit Gemeinde-Zuordnung (PLZ-Auflösung)

**Erstellt:** 5.6.2026 · **Abrufdatum: 5.6.2026** · **Status: einfach belegt
(amtliche Behördenverzeichnisse); dient als Quelle für die generierten
Zuordnungs-Daten (scripts/plz-generieren.ts → src/data/schlichtung/).**

⚠ Generator-relevante Flags: AG-Liste noch ohne Fusion Villnachern→Brugg
(1.1.2026) · TG-Amt Münchwilen sitzt in SIRNACH (Rütiweg 1) · SG-Liste
enthält Ortsteile (Heerbrugg u. a.) — Zuordnung über politische Gemeinde.

## Teil 2 — FR · ZG · AI · SZ · BL

# Recherche-Bericht: Ordentliche Schlichtungsbehörden mit Gemeindezuordnung — FR, ZG, AI, SZ, BL

**Abrufdatum: 5.6.2026 · Nur amtliche / amtsnahe Quellen · «NICHT GEFUNDEN» statt Spekulation**

Wichtiger Methodenhinweis: Die kantonalen Portale `ai.ch`, `baselland.ch` und teils `sz.ch` lieferten HTTP 403 bzw. nur JS-gerenderte Karten. Wo nötig wurde auf amtliche Gemeindeseiten, das Behördenverzeichnis betreibungsschalter-plus.ch und das GOG zurückgegriffen. Die „abgedeckte Gemeinden"-Felder von betreibungsschalter-plus.ch sind PLZ-basiert und vermischen teilweise Nachbarkantone (AR/SG/ZG) — sie wurden NICHT als Zuständigkeitsquelle übernommen; massgeblich sind die amtlichen Bezirks-/Kreisstrukturen.

---

## 1. FR — Freiburg: 7 Friedensgerichte (justices de paix) — VOLLSTÄNDIG

Die FR-Gerichtsbezirke sind BFS-kongruent (7 Verwaltungsbezirke = 7 Gerichtsbezirke). Bestätigt über fr.ch.

| Amt | Strasse | PLZ Ort | Gemeinden (Bezirk) |
|-----|---------|---------|--------------------|
| Friedensgericht Saanebezirk / JP Sarine | Rue des Chanoines 1, PF 614 | 1701 Freiburg | alle Gemeinden Bezirk Saane/Sarine |
| Friedensgericht Sensebezirk | Schwarzseestrasse 5, PF 37 | 1712 Tafers | alle Gemeinden Bezirk Sense |
| Friedensgericht Greyerzbezirk / JP Gruyère | Rue de l'Europe 10, PF 1630 | 1630 Bulle | alle Gemeinden Bezirk Greyerz/Gruyère |
| Friedensgericht Seebezirk | Freiburgstrasse 69, PF 76 | 3280 Murten | alle Gemeinden Bezirk See/Lac |
| Friedensgericht Glanebezirk / JP Glâne | Rue des Moines 58 | 1680 Romont | alle Gemeinden Bezirk Glane/Glâne |
| Friedensgericht Broyebezirk / JP Broye | Av. de la Gare 111 | 1470 Estavayer-le-Lac | alle Gemeinden Bezirk Broye |
| Friedensgericht Vivisbachbezirk / JP Veveyse | Ch. du Château 11 | 1618 Châtel-St-Denis | alle Gemeinden Bezirk Vivisbach/Veveyse |

**Unsicherheiten FR:** keine wesentlichen. Adressen direkt von fr.ch. Bestätigung der BFS-Kongruenz: ja (7 Bezirke). Romont-Strasse korrekt „Rue des Moines" (nicht „Rue de Moines" wie in einem Snippet).
**Quellen:** https://www.fr.ch/de/staat-und-recht/justiz/gerichtsbehoerden-friedensgerichte · https://www.fr.ch/de/staat-und-recht/justiz/oertliche-zustaendigkeiten

---

## 2. ZG — Zug: 11 Friedensrichterämter — Gemeinde→Amt = 1:1 (bestätigt) — nahezu VOLLSTÄNDIG

Bestätigt über zg.ch: jede der 11 Gemeinden hat ihr eigenes Friedensrichteramt, 1:1.

| Amt | Strasse | PLZ Ort | Gemeinde | URL |
|-----|---------|---------|----------|---|
| Friedensrichteramt Zug | Gubelstrasse 22, PF | 6301 Zug | Zug | https://www.stadtzug.ch/aemter/782 |
| Friedensrichteramt Baar | Leihgasse 9 | 6341 Baar | Baar | https://www.baar.ch/aemter/11308 |
| Friedensrichteramt Cham | Mandelhof, Postfach | 6330 Cham | Cham | https://www.cham.ch/bereiche/2569 |
| Friedensrichteramt Hünenberg | Chamerstrasse 11 | 6331 Hünenberg | Hünenberg | https://www.zg.ch/behoerden/gemeinden/hunenberg/de/verwaltung/praesidiales/friedensrichteramt |
| Friedensrichteramt Risch | Rathaus, Zentrum Dorfmatt 1 | 6343 Rotkreuz | Risch | https://www.zg.ch/behoerden/gemeinden/risch-rotkreuz/verwaltung/praesidiales/friedensrichter |
| Friedensrichteramt Steinhausen | Bahnhofstrasse 3, PF | 6312 Steinhausen | Steinhausen | https://www.zg.ch/behoerden/gemeinden/steinhausen/verwaltung/praesidiales/friedensrichter |
| Friedensrichteramt Walchwil | Dorfstrasse 23, PF (Gemeindeverwaltung) | 6318 Walchwil | Walchwil | https://www.walchwil.ch/verwaltung/friedensrichteramt.html/175 |
| Friedensrichteramt Unterägeri | Seestrasse 2 | 6314 Unterägeri | Unterägeri | https://www.unteraegeri.ch/behoerden/671 |
| Friedensrichteramt Oberägeri | Alosenstrasse 2 | 6315 Oberägeri | Oberägeri | https://www.oberaegeri.ch/behoerden/274 |
| Friedensrichteramt Neuheim | Dorfplatz 5, PF 134 | 6345 Neuheim | Neuheim | https://www.neuheim.ch/friedensrichteramt |
| Friedensrichteramt Menzingen | Alte Landstrasse 2a, PF (Gemeindeverwaltung) | 6313 Menzingen | Menzingen | https://www.zg.ch/behoerden/gemeinden/menzingen/de/verwaltung/verwaltung/aemter-und-stellen/friedensrichter |

**Hausnummern Cham/Menzingen geklärt:**
- **Menzingen: GEKLÄRT** → Alte Landstrasse 2a (offizielle Gemeindeverwaltungs-Anschrift menzingen-Seite).
- **Cham: NICHT GEFUNDEN (Hausnummer).** Amtlich wird durchgängig nur „Mandelhof, 6330 Cham" (Gemeindehaus Mandelhof) ohne Hausnummer geführt — sowohl cham.ch als auch Behördenverzeichnis. Tel. 041 723 87 14. Eine Hausnummer wird amtlich offenbar nicht verwendet.

**Weitere Unsicherheiten ZG:**
- Oberägeri/Neuheim/Risch werden amtlich primär mit Postfach bzw. „Rathaus/Zentrum Dorfmatt" geführt; physische Strassenadresse mit Hausnummer für Oberägeri/Neuheim NICHT separat publiziert (Postfach ist die offizielle Korrespondenzadresse).
- Ignorieren Sie die „abgedeckte Gemeinden"-Listen aus betreibungsschalter-plus.ch (z. B. Oberägeri „Sattel/Rothenthurm/Morgarten") — das sind fehlerhafte PLZ-Treffer aus SZ; ZG ist strikt 1:1.

**Quellen:** https://zg.ch/de/recht-justiz/zivilverfahren/schlichtung/friedensrichteraemter · https://www.cham.ch/bereiche/2569 · https://www.zg.ch/behoerden/gemeinden/menzingen/de/verwaltung/verwaltung/aemter-und-stellen/friedensrichter · https://www.walchwil.ch/verwaltung/friedensrichteramt.html/175 · https://www.unteraegeri.ch/behoerden/671 · https://www.neuheim.ch/friedensrichteramt

---

## 3. AI — Appenzell Innerrhoden: 5 Bezirks-Vermittlerämter — VOLLSTÄNDIG (mit Vorbehalt Hausnummern)

AI-Bezirke = BFS-Bezirke. Seit 2022 fusionierten die früheren Bezirke Schwende und Rüte zu **Schwende-Rüte** — das ergibt aktuell 5 Bezirke/5 Vermittlerämter (Appenzell, Schwende-Rüte, Schlatt-Haslen, Gonten, Oberegg). Hinweis: ai.ch blockt (403); Daten aus amtlichen Bezirksseiten.

| Amt | Strasse | PLZ Ort | Bezirk/Gemeinde | URL |
|-----|---------|---------|------------------|---|
| Vermittleramt Appenzell | Kronengarten 8 (Vermittlerin B. Manser) | 9050 Appenzell | Bezirk Appenzell | https://www.ai.ch/gerichte/vermittler |
| Vermittleramt Schwende-Rüte | Pöppelstrasse 14 (Vermittler T. Mainberger) | 9050 Appenzell Steinegg | Bezirk Schwende-Rüte | https://www.ai.ch/gerichte/vermittler |
| Vermittleramt Schlatt-Haslen | Hinterhaslen 41 (Vermittler P. Sutter) | 9054 Haslen | Bezirk Schlatt-Haslen | https://www.ai.ch/gerichte/vermittler |
| Vermittleramt Gonten | Oberschwarzstrasse 7 (Vermittlerin L. Zürcher) | 9108 Gonten | Bezirk Gonten | https://www.gonten.ch/bezirk/behoerden-verwaltung/vermittleramt |
| Vermittleramt Oberegg | Sonnenstrasse 6 (Vermittlerin S. Blatter-Ulmann) | 9413 Oberegg | Bezirk Oberegg | https://www.ai.ch/gerichte/vermittler |

**NACHTRAG 10.6.2026 (ai.ch per Direktabruf gelesen, Browser-UA):** Drei
Adressen wegen Vermittler-Wechsel KORRIGIERT (Appenzell: Kronengarten 8 ·
Schwende-Rüte: Pöppelstrasse 14, 9050 Appenzell Steinegg · Gonten:
Oberschwarzstrasse 7); direkte amtliche URL für alle 5: ai.ch/gerichte/vermittler.

**Unsicherheiten AI (Stand 5.6.2026, überholt soweit oben korrigiert):**
- **WARNUNG Quellenvermischung:** betreibungsschalter-plus.ch führt veraltete getrennte „Vermittleramt Schwende" (Küchenrain 6, 9057 Schwende) und „Vermittleramt Rüte" sowie ein AR-„Vermittleramt Haslen, Oberbühl 9054" (deckt Gais/Bühler/Teufen AR — das ist **Appenzell Ausserrhoden**, NICHT AI). Diese wurden ausgeschlossen.
- Schwende-Rüte: Aktuelle Vermittler-Korrespondenzadresse ist die Privat-/Funktionsadresse des Vermittlers (Zidler 19, 9057 Weissbad). Eine separate „Amts"-Anschrift in der Bezirksverwaltung (Pöppelstrasse 14, 9050 Appenzell Steinegg) ist möglich, aber für das Vermittleramt nicht eindeutig amtlich bestätigt → **leichte Unsicherheit**.
- Da ai.ch (403) nicht direkt verifizierbar war, sind die 5 Ämter strukturell sicher, die exakten Hausnummern teils über Vermittler-Personenadressen abgeleitet.

**Quellen:** https://www.ai.ch/gerichte/vermittler (403, nicht abrufbar) · https://schwende-ruete.ch/ · https://schlatt-haslen.ch/ · https://www.appenzell.ch/de/dorf-appenzell/bezirke-in-appenzell-innerrhoden/

---

## ALT (ersetzt durch 36) · SZ — Schwyz: Vermittlerämter — TEILWEISE OFFEN (per-Gemeinde-System, amtliche Karte JS-only)

**Struktur:** Das SZ-System ist NICHT in wenige Kreise gegliedert, sondern grundsätzlich **per Gemeinde**: Jede der 30 Gemeinden hat (amtlich) einen Vermittler + Stellvertreter, gewählt auf 4 Jahre. Einzelne Bezirke/Gemeinden teilen sich ein Amt (Konsolidierungen). Gemeinde→Amt ist daher überwiegend 1:1 mit einigen Ausnahmen.

**Datenquellen-Befund:** Die amtliche Übersicht `vermittler-sz.ch` ist eine reine JS-Leaflet-Karte („Die Karte wird geladen"); ein dahinterliegendes JSON/REST-Endpoint (WP-REST `/wp-json/wp/v2/...`) liefert 404 — **keine offene maschinenlesbare Datenquelle gefunden**. sz.ch selbst verlinkt nur auf vermittler-sz.ch. Es existiert ein RRB Nr. 585/2024 (PDF, sz.ch) mit Statistik, aber als gescanntes/komprimiertes PDF ohne extrahierbaren Volltext (lokal kein pdftotext verfügbar).

**Verifizierte Einzelämter (Adresse + abgedeckte Gemeinden):**

| Amt | Strasse | PLZ Ort | Gemeinden |
|-----|---------|---------|-----------|
| Vermittleramt Höfe | Rebhaldenstrasse 15 | 8807 Freienbach | Feusisberg, Freienbach, Wollerau (Bezirk Höfe, konsolidiert) |
| Vermittleramt March | Gallerstrasse 56 (Vermittler M. Diethelm) | 8853 Lachen | Bezirk March: Lachen, Altendorf, Galgenen, Vorderthal, Innerthal, Schübelbach, Tuggen, Wangen, Reichenburg — ABER: einzelne Marchgemeinden führen eigene Vermittler (s. u.) → **unsicher, ob March-weit konsolidiert** |
| Vermittleramt Gemeinde Schwyz | Laubstrasse 13 (Gemeindehaus; ältere Angabe Herrengasse 17) | 6430 Schwyz | Gemeinde Schwyz (Kerngebiet) |
| Vermittleramt Bezirk Brunnen/Ingenbohl | c/o Eisenbahnstrasse 20a, PF 405 (Vermittler F. Rüegg) | 8840 Einsiedeln (Korrespondenz); Verhandlungen in Ingenbohl | Gersau, Ingenbohl, Morschach, Riemenstalden (Kreis Brunnen, seit 2020 konsolidiert) |
| Vermittleramt Bezirk Einsiedeln | (Schlichtungsbehörde Bezirk Einsiedeln) | 8840 Einsiedeln | Bezirk Einsiedeln |

**Was OFFEN bleibt (ehrlich markiert):**
- **NICHT GEFUNDEN:** vollständige, verifizierte Liste aller ~20-30 SZ-Vermittlerämter mit Adressen + exakter Gemeindezuordnung. Einzelne Gemeinden (Galgenen, Tuggen, Wangen, Reichenburg, Vorderthal, Innerthal, Küssnacht, Arth, Gersau, Unter-/Oberiberg, Rothenthurm, Sattel, Steinen, Lauerz, Muotathal, Alpthal, Riemenstalden) haben eigene Vermittler-Einträge auf ihren Gemeindeseiten — diese müssten gemeindeweise einzeln abgefragt werden.
- **Widerspruch March:** Es existiert sowohl ein „Vermittleramt March" (Lachen) als auch separate Gemeinde-Vermittlerämter (Galgenen/Reichenburg: Merikenstrasse 8, 8864 Reichenburg; Wangen; Tuggen). Ob March als Einheitskreis oder gemeindeweise organisiert ist, **konnte amtlich nicht abschliessend geklärt werden**.
- Empfehlung: Für SZ die Karte vermittler-sz.ch manuell (Browser) auslesen oder den Verband (VVS) bzw. das RRB 585/2024 als OCR-Quelle heranziehen.

**Quellen:** https://www.sz.ch/behoerden/justiz/vermittleraemter.html · https://vermittler-sz.ch/ (JS-only) · https://www.hoefe.ch/de/judikative/vermittleramt/ · https://www.gemeindeschwyz.ch/kommissionen/31483 · https://www.ingenbohl.ch/vermittler/47618 · https://www.einsiedeln.ch/verwaltung/weitere-stellen/vermittler · RRB 585/2024: https://www.sz.ch/public/upload/assets/77626/I_Vermittler%C3%A4mter.pdf

---

## ALT (ersetzt durch 35) · BL — Basel-Landschaft: 15 Friedensrichterkreise — Kreisstruktur VOLLSTÄNDIG, Korrespondenzadressen TEILWEISE

baselland.ch blockt durchgängig (403). Kreisstruktur aus GOG §18 (SGS 170) + amtsnahen Quellen rekonstruiert; je 2 Friedensrichter/Kreis. Die Korrespondenzadresse ist i. d. R. die Sitzgemeinde-Verwaltung (Termine nur nach Vereinbarung; Friedensrichter amtieren nebenamtlich, oft ohne separates Büro).

| Kreis (Nr.) | Sitz / Korrespondenzadresse | PLZ Ort | Gemeinden |
|-------------|------------------------------|---------|-----------|
| K1 Allschwil | Gemeindeverwaltung Allschwil | 4123 Allschwil | Allschwil, Schönenbuch |
| K2 Binningen-Bottmingen | Gemeindeverwaltung Binningen | 4102 Binningen | Binningen, Bottmingen |
| K3 Oberwil-Therwil | Gemeindeverwaltung Oberwil | 4104 Oberwil | Oberwil, Therwil, Biel-Benken, Ettingen (Leimental) — **Gemeindeliste teils unsicher** |
| K4 Reinach | Gemeindeverwaltung Reinach | 4153 Reinach | Reinach |
| K5 Aesch | Gemeindeverwaltung Aesch | 4147 Aesch | Aesch, Pfeffingen |
| K6 Muttenz-Birsfelden | Gemeinde Muttenz, Kirchplatz 3 (auch Birsfelden, Hardstrasse 21) | 4132 Muttenz / 4127 Birsfelden | Muttenz, Birsfelden |
| K7 Arlesheim-Münchenstein | Gemeindeverwaltung Arlesheim | 4144 Arlesheim | Arlesheim, Münchenstein |
| K8 Laufen | Gemeindeverwaltung/Bezirk Laufen | 4242 Laufen | Blauen, Brislach, Burg i.L., Dittingen, Duggingen, Grellingen, Laufen, Liesberg, Nenzlingen, Roggenburg, Röschenz, Wahlen, Zwingen |
| K9 Liestal | Friedensrichteramt Liestal, PF 454 | 4410 Liestal | Liestal, Lausen, Arisdorf, Itingen — **(Itingen evtl. Sissach, s. u.)** |
| K10 Bubendorf | Gemeindeverwaltung Bubendorf | 4416 Bubendorf | Bubendorf u. Umlandgemeinden — **Gemeindeliste NICHT vollständig verifiziert** |
| K11 Frenkendorf | Gemeindeverwaltung Frenkendorf | 4402 Frenkendorf | Frenkendorf, Füllinsdorf u. a. — **NICHT vollständig verifiziert** |
| K12 Pratteln | Gemeindeverwaltung Pratteln | 4133 Pratteln | Pratteln, Augst u. a. — **NICHT vollständig verifiziert** |
| K13 Sissach | Gemeindeverwaltung Sissach | 4450 Sissach | Böckten, Buckten, Diepflingen, Häfelfingen, Itingen, Känerkinden, Läufelfingen, Nusshof, Rümlingen, Sissach, Tenniken, Thürnen, Wintersingen, Wittinsburg, Zunzgen |
| K14 Gelterkinden | Gemeindeverwaltung Gelterkinden | 4460 Gelterkinden | Anwil, Buus, Gelterkinden, Hemmiken, Kilchberg, Maisprach, Oltingen, Ormalingen, Rickenbach, Rothenfluh, Rünenberg, Tecknau, Wenslingen, Zeglingen |
| K15 Waldenburg | Gemeindeverwaltung Waldenburg | 4437 Waldenburg | Arboldswil, Bennwil, Bretzwil, Diegten, Eptingen, Hölstein, Lampenberg, Langenbruck, Lauwil, Liedertswil, Niederdorf, Oberdorf, Reigoldswil, Titterten, Waldenburg |

**Verifizierte Adressen (amtlich/amtsnah):**
- K6 Muttenz: Kirchplatz 3, 4132 Muttenz · Birsfelden: Hardstrasse 21, 4127 Birsfelden ✓
- K9 Liestal: Friedensrichteramt Liestal, PF 454, 4410 Liestal ✓ (deckt Liestal, Lausen, Arisdorf, Itingen)
- K1 Allschwil: Friedensrichter in Allschwil ✓ (Personenadressen Parkallee 61 bzw. Strengigartenweg 5A, 4123 Allschwil)

**Unsicherheiten BL (erheblich):**
- **Itingen-Konflikt:** erscheint sowohl bei K9 Liestal (Behördenverzeichnis) als auch bei K13 Sissach (GOG-Liste). Eine Gemeinde gehört nur zu einem Kreis → **muss am GOG §18-Volltext final geklärt werden** (Quelle deutet auf Sissach hin als gesetzliche Zuordnung; Liestal-Eintrag evtl. veraltet/praktisch).
- Kreise K9-K12 (Liestal/Bubendorf/Frenkendorf/Pratteln, Bezirk Liestal): die genaue gemeindeweise Aufteilung des Bezirks Liestal auf diese 4 Kreise ist aus den abrufbaren Quellen **NICHT vollständig** rekonstruierbar (baselland.ch 403, GOG-PDF nicht text-extrahierbar). Die Sitzgemeinden sind sicher, die jeweiligen Zuteilungsgemeinden teilweise NICHT GEFUNDEN.
- Kreisnummerierung K1-K15: Reihenfolge plausibel (nach Bezirken Arlesheim→Laufen→Liestal→Sissach→Waldenburg), aber die exakte amtliche Nummer je Kreis ist nur für K6 (=„06 Muttenz-Birsfelden", amtlich bestätigt) gesichert; übrige Nummern sind abgeleitet.
- Korrespondenzadressen: durchwegs als Sitzgemeinde-Verwaltung angegeben; verifizierte Strasse/Hausnummer liegt nur für K6 und K9 vor. Für die übrigen Kreise = **Strasse/Hausnummer NICHT einzeln verifiziert** (Friedensrichter nebenamtlich, Korrespondenz über Gemeindeverwaltung).

**Quellen:** GOG SGS 170 §18: https://bl.clex.ch/app/de/texts_of_law/170 (Volltext JS-gerendert) · https://www.baselland.ch/politik-und-behorden/gerichte/friedensrichter-innen (403) · https://www.muttenz.ch/behoerden/2582 · https://www.liestal.ch/dienstleistungen/26418 · https://www.allschwil.ch/de/verwaltung/dienstleistungen/detail/detail.php?i=473 · Landratsvorlage 2002/338 (Kreiskonsolidierung 23→15)

---

## Gesamtfazit für den PLZ-Zuständigkeitsrechner

| Kanton | Status maschinenlesbare Gemeinde→Amt-Zuordnung |
|--------|-----------------------------------------------|
| **FR** | ✅ Vollständig & sicher (7 Gerichte = 7 BFS-Bezirke; Bezirks-Gemeindelisten via BFS) |
| **ZG** | ✅ Vollständig (11 Ämter, strikt 1:1); offen nur: Hausnummer Cham (amtlich gar nicht geführt → „Mandelhof" verwenden) |
| **AI** | ✅ Strukturell vollständig (5 Bezirks-Vermittlerämter = BFS-Bezirke nach Fusion Schwende-Rüte 2022); Adressen verifiziert, AR-Vermischung ausgeschlossen |
| **SZ** | ⚠️ Teilweise offen: per-Gemeinde-System, keine offene Datenquelle (Karte JS-only), vollständige Amts-/Gemeindeliste NICHT gefunden. 5 Ämter verifiziert. Manuelle Erfassung von vermittler-sz.ch nötig |
| **BL** | ⚠️ Kreisstruktur (15) vollständig, GOG §18-Gemeindelisten für K8/K13/K14/K15 sicher; K9-K12 (Bezirk Liestal) Gemeindezuteilung unvollständig; Itingen-Zuordnung K9 vs. K13 zu klären; Korrespondenzadressen nur K6/K9 verifiziert |

Hauptlücken, die ein zweiter Durchgang (mit Browser-Rendering für ai.ch/baselland.ch/vermittler-sz.ch und OCR der GOG-PDF) schliessen sollte: **SZ Vollständigkeit** und **BL Bezirk-Liestal-Kreisaufteilung + Itingen + restliche Korrespondenzadressen**.

---

# Schlichtungsbehörden mit Gemeinde-Zuordnung — AG / SG / TG

Abrufdatum: 5. Juni 2026. Nur amtliche Quellen. Gemeinden in amtlicher Schreibweise.

---

## 1. Aargau — 17 Friedensrichterkreise

Quelle: ag.ch, «Friedensrichterkreise» (Gerichte Kanton Aargau → Schlichtungsbehörden). Rechtsgrundlage: Gesetz über die Organisation der ordentlichen richterlichen Behörden (GOG, SAR 155.100); die konkrete Kreiseinteilung wird kantonal publiziert.

| Amt | Strasse | PLZ Ort | Gemeinden | URL |
|---|---|---|---|---|
| Kreis I (Bez. Aarau) | Postfach 2347 | 5001 Aarau | Aarau, Biberstein, Densbüren, Erlinsbach, Küttigen | https://www.aarau.ch/leben/staat-und-recht.html/121 |
| Kreis II (Bez. Aarau) | Postfach | 5036 Oberentfelden | Buchs, Gränichen, Hirschthal, Muhen, Oberentfelden, Suhr, Unterentfelden | https://www.suhr.ch/dienstleistungen/29632 |
| Kreis III (Bez. Baden) | Rathausgasse 6, Postfach | 5400 Baden | Baden, Ehrendingen, Ennetbaden, Freienwil, Obersiggenthal, Untersiggenthal, Würenlingen | https://www.baden.ch/de/leben-wohnen/sicherheit-und-recht/recht/friedensrichteramt.html/620 |
| Kreis IV (Bez. Baden) | Alb.-Zwyssigstrasse 76 | 5430 Wettingen | Bergdietikon, Killwangen, Neuenhof, Spreitenbach, Wettingen, Würenlos | https://www.wettingen.ch/aemter/6581 |
| Kreis V (Bez. Baden) | Postfach 56 | 5200 Brugg | Bellikon, Birmenstorf, Fislisbach, Gebenstorf, Künten, Mägenwil, Mellingen, Niederrohrdorf, Oberrohrdorf, Remetschwil, Stetten, Wohlenschwil | https://www.mellingen.ch/verwaltung/friedensrichter.html/147 |
| Kreis VI (Bez. Bremgarten) | Postfach | 5605 Dottikon | Büttikon, Dottikon, Fischbach-Göslikon, Hägglingen, Niederwil, Sarmenstorf, Tägerig, Uezwil, Villmergen, Wohlen | https://www.villmergen.ch/aemter/810 |
| Kreis VII (Bez. Bremgarten) | Postfach 225 | 5620 Bremgarten | Arni, Berikon, Bremgarten, Eggenwil, Islisberg, Jonen, Oberlunkhofen, Oberwil-Lieli, Rudolfstetten-Friedlisberg, Unterlunkhofen, Widen, Zufikon | https://www.bremgarten.ch/abteilungen/17314 |
| Kreis VIII (Bez. Brugg) | Postfach 151 | 5103 Wildegg | Auenstein, Birr, Birrhard, Bözberg, Brugg, Habsburg, Hausen, Lupfig, Mandach, Mönthal, Mülligen, Remigen, Riniken, Rüfenach, Schinznach, Thalheim, Veltheim, Villigen, Villnachern, Windisch | https://www.moenthal.ch/verwaltung/externe-amtsstellen |
| Kreis IX (Bez. Kulm) | Postfach 174 | 5726 Unterkulm | Beinwil am See, Birrwil, Dürrenäsch, Gontenschwil, Holziken, Leimbach, Leutwil, Menziken, Oberkulm, Reinach, Schlossrued, Schmiedrued, Schöftland, Teufenthal, Unterkulm, Zetzwil | https://www.unterkulm.ch/gemeinde/verwaltung/bezirksstellen.html/270 |
| Kreis X (Bez. Laufenburg) | Postfach | 5070 Frick | Böztal, Eiken, Frick, Gansingen, Gipf-Oberfrick, Herznach-Ueken, Kaisten, Laufenburg, Mettauertal, Münchwilen, Oberhof, Oeschgen, Schwaderloch, Sisseln, Wittnau, Wölflinswil, Zeihen | https://www.frick.ch/dienstleistungen/3378 |
| Kreis XI (Bez. Lenzburg) | Postfach | 5600 Lenzburg 1 | Ammerswil, Brunegg, Dintikon, Hendschiken, Holderbank, Lenzburg, Möriken-Wildegg, Niederlenz, Othmarsingen | https://www.ag.ch/de/ueber-uns/gerichte-kanton-aargau/organisation/schlichtungsbehoerden/friedensrichterinnen-und-friedensrichter/friedensrichterkreise |
| Kreis XII (Bez. Lenzburg) | Postfach | 5707 Seengen | Boniswil, Egliswil, Fahrwangen, Hallwil, Hunzenschwil, Meisterschwanden, Rupperswil, Schafisheim, Seengen, Seon, Staufen | https://www.seon.ch/verwaltung/externe-dienste/friedensrichteramt-kreis-xii.html/119 |
| Kreis XIII (Bez. Muri) | Postfach 238 | 5630 Muri AG | Abtwil, Aristau, Auw, Beinwil (Freiamt), Besenbüren, Bettwil, Boswil, Bünzen, Buttwil, Dietwil, Geltwil, Kallern, Merenschwand, Mühlau, Muri, Oberrüti, Rottenschwil, Sins, Waltenschwil | https://www.muri.ch/gemeinde/verwaltung/amtsstellen.html/326 |
| Kreis XIV (Bez. Rheinfelden) | Im Kunzental 30, Postfach 55 | 4310 Rheinfelden | Hellikon, Kaiseraugst, Magden, Möhlin, Mumpf, Obermumpf, Olsberg, Rheinfelden, Schupfart, Stein, Wallbach, Wegenstetten, Zeiningen, Zuzgen | https://www.moehlin.ch/de/kontakte/detail/detail.php?i=448 |
| Kreis XV (Bez. Zofingen) | Postfach 110 | 4852 Rothrist | Aarburg, Murgenthal, Oftringen, Rothrist | https://www.rothrist.ch/dienstleistungen/112975 |
| Kreis XVI (Bez. Zofingen) | Postfach 135 | 4800 Zofingen | Bottenwil, Brittnau, Kirchleerau, Kölliken, Moosleerau, Reitnau, Safenwil, Staffelbach, Strengelbach, Uerkheim, Vordemwald, Wiliberg, Zofingen | https://www.zofingen.ch/gesellschaft/gerichte.html/387 |
| Kreis XVII (Bez. Zurzach) | c/o Gerichtskanzlei, Hauptstrasse 50, Postfach | 5330 Bad Zurzach | Böttstein, Döttingen, Endingen, Fisibach, Full-Reuenthal, Klingnau, Koblenz, Leibstadt, Lengnau, Leuggern, Mellikon, Schneisingen, Siglistorf, Tegerfelden, Zurzach | https://www.zurzach.ch/weitereamtsstellen |

Quelle: https://www.ag.ch/de/ueber-uns/gerichte-kanton-aargau/organisation/schlichtungsbehoerden/friedensrichterinnen-und-friedensrichter/friedensrichterkreise · GOG: https://gesetzessammlungen.ag.ch/data/155.100

Unsicherheiten AG:
- WICHTIG (Stand-Bug): Per 1.1.2026 wurde **Villnachern in die Stadt Brugg eingemeindet** (AG nur noch 196 Gemeinden). Die ag.ch-Liste führt in Kreis VIII weiterhin «Brugg» UND «Villnachern» getrennt — die Seite scheint nicht nachgeführt. Für die PLZ-Auflösung: Villnachern (alte PLZ 5213) gehört weiterhin zu Kreis VIII, jetzt als Teil von Brugg. Vor Deploy verifizieren, ob ag.ch zwischenzeitlich aktualisiert wurde.
- Kreis XVII: PLZ-Reform — «Bad Zurzach»/«Zurzach»: die Gemeinde heisst amtlich **Zurzach** (Fusion 2022), Postort 5330 Bad Zurzach. In der Gemeindeliste steht «Zurzach».
- Adressen sind durchwegs Postfach-/Korrespondenzadressen (Friedensrichter teils privat domiziliert) — so amtlich publiziert.

---

## 2. St. Gallen — 10 Vermittlungsämter

Quelle: sg.ch, «Vermittlungsämter» (Gerichte → Organisation/Standorte). Rechtsgrundlage: Gerichtsgesetz (GerG, sGS 941.1) i.V.m. Gerichtsordnung (GO, sGS 941.21); die Vermittlungskreise/Gemeindezuteilung werden über diese Erlasse bzw. deren Anhang geregelt.

| Amt | Strasse | PLZ Ort | Gemeinden |
|---|---|---|---|
| Vermittlungsamt St.Gallen | Neugasse 3 | 9004 St.Gallen | St.Gallen, Wittenbach, Häggenschwil, Muolen, Eggersriet, Gaiserwald |
| Vermittlungsamt Gossau | Merkurstrasse 12 | 9201 Gossau | Gossau, Waldkirch, Andwil |
| Vermittlungsamt Rorschach | Promenadenstrasse 74 | 9401 Rorschach | Berg, Goldach, Mörschwil, Rorschach, Rorschacherberg, Steinach, Tübach, Untereggen, Thal |
| Vermittlungsamt Rheintal | Obergasse 4 | 9437 Marbach | Altstätten, Au, Balgach, Berneck, Diepoldsau, Eichberg, Marbach, Oberriet, Rebstein, Rheineck, Rüthi, St.Margrethen, Widnau |
| Vermittlungsamt Werdenberg | Bahnhofstrasse 2 | 9470 Buchs | Buchs, Gams, Grabs, Sennwald, Sevelen, Wartau |
| Vermittlungsamt Sarganserland | Marktstrasse 25 | 8890 Flums | Sargans, Pfäfers, Bad Ragaz, Vilters-Wangs, Mels, Flums, Walenstadt, Quarten |
| Vermittlungsamt See | St.Gallerstrasse 23, Postfach 2160 | 8645 Jona | Rapperswil-Jona, Eschenbach |
| Vermittlungsamt Obersee-Gaster | Zürcherstrasse 1 | 8730 Uznach | Schmerikon, Uznach, Gommiswald, Kaltbrunn, Benken, Schänis, Weesen, Amden |
| Vermittlungsamt Toggenburg | Hauptgasse 8 | 9620 Lichtensteig | Bütschwil-Ganterschwil, Lütisburg, Mosnang, Kirchberg, Wattwil, Lichtensteig, Oberhelfenschwil, Hemberg, Neckertal, Wildhaus-Alt St.Johann, Nesslau, Ebnat-Kappel |
| Vermittlungsamt Wil | Lerchenfeldstrasse 11 | 9500 Wil | Wil, Uzwil, Oberuzwil, Jonschwil, Oberbüren, Niederbüren, Flawil, Degersheim, Zuzwil, Niederhelfenschwil |

Quelle: https://www.sg.ch/recht/gerichte/organisation---standorte/schlichtungsstellen-und-vermittlungsaemter/vermittlungsaemter.html · GerG sGS 941.1: https://www.gesetzessammlung.sg.ch/app/de/texts_of_law/941.1 · GO sGS 941.21: https://www.gesetzessammlung.sg.ch/app/de/texts_of_law/941.21

Unsicherheiten SG:
- Rheintal: die sg.ch-Liste nennt zusätzlich Ortsteile, die KEINE eigenen politischen Gemeinden sind (Heerbrugg = Teil von Au/Balgach/Widnau; Hinterforst/Lüchingen = Altstätten; Kriessern/Montlingen = Oberriet; Lienz = Rüthi). Oben sind nur die **politischen Gemeinden** gelistet; die Ortsteile dürften für die PLZ-Auflösung relevant sein (z. B. PLZ 9435 Heerbrugg → polit. Gemeinde Au, Amt Rheintal).
- Toggenburg: «Krinau» ist seit 2013 Teil von Wattwil (auf der sg.ch-Liste teils noch separat geführt) — als Ortsteil von Wattwil zu behandeln.
- Konkrete Gesetzes-Belegstelle (Artikel/Anhang) für die Kreiseinteilung konnte NICHT zeichengenau zitiert werden: gesetzessammlung.sg.ch liefert nur eine JS-/PDF-Ansicht, deren Text maschinell nicht extrahierbar war. Die sg.ch-Behördenliste ist aber die amtliche, massgebliche Zuteilung.

---

## 3. Thurgau — 5 Friedensrichterämter (bezirksdeckungsgleich)

Quelle: friedensrichteraemter.tg.ch (Adressen, je Amtsseite). Gemeindelisten = die 5 Bezirke (BFS-kongruent, Stand 1.1.2011 ff.); Bezirkszuordnung gemäss Bezirks-/Justizreform TG.

| Amt | Strasse | PLZ Ort | Gemeinden | URL |
|---|---|---|---|---|
| Friedensrichteramt Bezirk Arbon | Bahnhofstrasse 16, Postfach | 9320 Arbon | Amriswil, Arbon, Dozwil, Egnach, Hefenhofen, Horn, Kesswil, Roggwil (TG), Romanshorn, Salmsach, Sommeri, Uttwil | https://friedensrichteraemter.tg.ch/friedensrichtraemter/friedensrichteramt-bezirk-arbon.html/12945 |
| Friedensrichteramt Bezirk Frauenfeld | St. Gallerstrasse 4, Postfach | 8510 Frauenfeld | Basadingen-Schlattingen, Berlingen, Diessenhofen, Eschenz, Felben-Wellhausen, Frauenfeld, Gachnang, Herdern, Homburg, Hüttlingen, Hüttwilen, Mammern, Matzingen, Müllheim, Neunforn, Pfyn, Schlatt (TG), Steckborn, Stettfurt, Thundorf, Uesslingen-Buch, Wagenhausen, Warth-Weiningen | https://friedensrichteraemter.tg.ch/friedensrichtraemter/friedensrichteramt-bezirk-frauenfeld.html/12946 |
| Friedensrichteramt Bezirk Kreuzlingen | Bachstrasse 10, Postfach | 8280 Kreuzlingen 1 | Altnau, Bottighofen, Ermatingen, Gottlieben, Güttingen, Kemmental, Kreuzlingen, Langrickenbach, Lengwil, Münsterlingen, Raperswilen, Salenstein, Tägerwilen, Wäldi | https://friedensrichteraemter.tg.ch/friedensrichtraemter/friedensrichteramt-bezirk-kreuzlingen.html/12947 |
| Friedensrichteramt Bezirk Münchwilen | Rütiweg 1, Postfach 126 | 8370 Sirnach | Aadorf, Bettwiesen, Bichelsee-Balterswil, Braunau, Eschlikon, Fischingen, Lommis, Münchwilen, Rickenbach, Sirnach, Tobel-Tägerschen, Wängi, Wilen | https://friedensrichteraemter.tg.ch/friedensrichtraemter/friedensrichteramt-bezirk-muenchwilen.html/12948 |
| Friedensrichteramt Bezirk Weinfelden | Bahnhofstrasse 22, Postfach | 8570 Weinfelden | Affeltrangen, Amlikon-Bissegg, Berg (TG), Birwinken, Bischofszell, Bürglen (TG), Bussnang, Erlen, Hauptwil-Gottshaus, Hohentannen, Kradolf-Schönenberg, Märstetten, Schönholzerswilen, Sulgen, Weinfelden, Wigoltingen, Wuppenau, Zihlschlacht-Sitterdorf | https://friedensrichteraemter.tg.ch/friedensrichtraemter/friedensrichteramt-bezirk-weinfelden.html/12949 |

Quellen: https://friedensrichteraemter.tg.ch/ und Amtsseiten (Arbon /12945, Frauenfeld /12946, Kreuzlingen /12947, Münchwilen /12948, Weinfelden /12949) · Bezirke/Gemeinden: https://statistik.tg.ch/verzeichnisse/bezirke-und-gemeinden.html/6777 (Zählung bestätigt: 12+23+14+13+18 = 80) · Gemeindelisten je Bezirk: de.wikipedia.org/wiki/Bezirk_Arbon etc. (BFS-Stand)

Bestätigung BFS-Kongruenz: Ja. TG-Friedensrichterämter decken sich je 1:1 mit den 5 BFS-Bezirken (Summe 80 politische Gemeinden = amtliche TG-Gesamtzahl).

Unsicherheiten TG:
- Adresse Münchwilen — KORREKTURHINWEIS: Eine Suchergebnis-Zusammenfassung nannte fälschlich «Murgtalstrasse 20, 9542 Münchwilen». Die **Amtsseite selbst** weist aber **Rütiweg 1, Postfach 126, 8370 Sirnach** aus (deckungsgleich mit dem Verwaltungsstandort Sirnach). Massgeblich ist die Amtsseite → Sirnach.
- Die TG-Gemeindelisten stammen aus dem BFS-/Statistik-Verzeichnis bzw. den Bezirks-Wikipedia-Seiten (BFS-basiert); die friedensrichteraemter.tg.ch-Amtsseiten publizieren die Gemeindelisten nicht direkt, verweisen aber über «Zuständiges Friedensrichteramt» auf die Bezirkszuteilung.

---

## Zusammenfassung / wichtigste Befunde

- AG, SG, TG je vollständig erfasst (17 / 10 / 5 Ämter) mit Adresse + Gemeindeliste.
- TG: BFS-Bezirkskongruenz bestätigt (80 Gemeinden). Adress-Korrektur Münchwilen → **Sirnach** (nicht Murgtalstrasse Münchwilen).
- AG **Stand-Warnung**: ag.ch-Liste noch nicht auf die Fusion **Villnachern → Brugg (1.1.2026)** nachgeführt; AG hat aktuell 196 Gemeinden. Villnachern bleibt Kreis VIII.
- SG: Ortsteile (Heerbrugg, Krinau, Montlingen u.a.) in der amtlichen Liste teils als eigene Einträge — für PLZ-Mapping den zugehörigen politischen Gemeinden zuordnen.
- Keine zeichengenaue Gesetzes-Belegstelle für die SG/AG-Kreiseinteilung verfügbar (gesetzessammlung.sg.ch und gesetzessammlungen.ag.ch rendern nur als JS-/Binär-PDF, nicht text-extrahierbar). Die amtlichen Behördenverzeichnisse (ag.ch / sg.ch) sind die massgebliche Zuteilung. «NICHT GEFUNDEN»: konkrete Artikel-/Anhangnummer der SG-Vermittlungskreise.

---

# NACHTRAG 6.6.2026 — SZ und BL GESCHLOSSEN (Restlücken-Recherche)

## ALT (ersetzt durch 36) · SZ — Vermittlerämter mit Gemeinde-Zuordnung — **GESCHLOSSEN**

Wichtigste Erkenntnis (korrigiert die bisherige Annahme): Die sz.ch-Aussage «jede der 30 Gemeinden hat einen Vermittler» ist vereinfacht/teilweise überholt. Tatsächlich gibt es **Bezirks-Vermittlerämter** (Höfe, Einsiedeln, Küssnacht, Gersau) und **gemeindeübergreifende Vermittlerkreise**. Massgebliche amtliche Quelle ist der **Staatskalender SZ 2024–2026** (Staatskanzlei), nicht die JS-Karte auf sz.ch/vermittler.

| Bezirk / Gemeinde | Vermittler:in | Stellvertretung | Adresse (soweit im Kalender) |
|---|---|---|---|
| **Bezirk Höfe** (Freienbach, Wollerau, Feusisberg – konsolidiert seit 1.7.2020) | Schönbächler Albert | Veya André; Brändli-Benz Simone | Rebhaldenstrasse 15, 8807 Freienbach |
| **Bezirk Einsiedeln** | Schönbächler Albert | Schuler Ponte Jeannette | Vermittleramt Bezirk Einsiedeln, Eisenbahnstrasse 20a, 8840 Einsiedeln |
| **Bezirk Küssnacht** | Hofmann Sonja | Beutler Ruedi | 6403 Küssnacht |
| **Bezirk Gersau** — *Vermittlerkreis Ingenbohl, Gersau, Morschach, Riemenstalden* | Rüegg Felix | Schönbächler Albert | Brunnen/Gersau |
| Gemeinde Schwyz | Marty Bruno (Schwyz) | Wilms Henri (Rothenthurm) | Herrengasse 17, 6431 Schwyz |
| Gemeinde Arth | Beutler Ruedi | Kraft Jürg | — |
| Gemeinde Ingenbohl | Rüegg Felix | Schönbächler Albert | (s. Vermittlerkreis Gersau) |
| Gemeinde Muotathal | Ulrich Marlis | Wilms Henri | — |
| Gemeinde Steinen | Messerli Hans | Wilms Henri | — |
| Gemeinde Sattel | Wilms-Lüönd Henri | Fach-Stolz Alex | — |
| Gemeinde Rothenthurm | Wilms-Lüönd Henri | von Rickenbach-Schuler Robert | — |
| Gemeinde Oberiberg | Schönbächler Albert | Schuler Konrad | — |
| Gemeinde Unteriberg | Schuler Konrad | Schönbächler Albert | Sonnmattstr. 19, 8842 Unteriberg |
| Gemeinde Lauerz | Marty Bruno | Wilms Henri | — |
| Gemeinde Steinerberg | Wilms Henri | von Rickenbach Robert | — |
| Gemeinde Morschach | Rüegg Felix | Schönbächler Albert | (s. Vermittlerkreis Gersau) |
| Gemeinde Alpthal | Schönbächler Albert | Schuler Ponte Jeannette | — |
| Gemeinde Illgau | Wilms Henri (Rothenthurm) | Ulrich Marlis (Muotathal) | — |
| Gemeinde Riemenstalden | Rüegg Felix | Schönbächler Albert | (s. Vermittlerkreis Gersau) |
| Gemeinde Lachen | Hofmann Marta | Wildhaber Annamarie | — |
| Gemeinde Altendorf | Wildhaber Annamarie | Hofmann Marta | Oberdorfstr. 3, Pf. 23, 8852 Altendorf |
| Gemeinde Vorderthal | Züger Daniela | Schättin Heinz | — |
| Gemeinde Innerthal | Schättin-Landolt Heinz | Ziltener Peter | — |
| Gemeinde Schübelbach | Kägi Irene | Schättin Heinz | Sieben-Eichenweg 15, 8854 Siebnen |
| Gemeinde Tuggen | Schättin Heinz | Weibel Peter | — |
| Gemeinde Wangen | Schättin-Landolt Heinz (Wangen) | Kägi Irene (Siebnen) | — |
| Gemeinde Reichenburg | Diethelm-Scherrer Markus | Weibel Peter (Lachen) | 8864 Reichenburg |

Amtliche Quelle: Staatskalender SZ 2024–2026, https://www.sz.ch/public/upload/assets/61726/Staatskalender_aktuell.pdf (Abruf 6.6.2026); ergänzend sz.ch Vermittlerämter https://www.sz.ch/behoerden/justiz/vermittleraemter.html (Abruf 6.6.2026), Einsiedeln-Adresse https://www.einsiedeln.ch (Abruf 6.6.2026).
Ehrliche Restlücke: Einzeladressen der reinen Gemeinde-Vermittler stehen im Kalender meist ohne Strasse (nur Name/Wohnsitz); für Volladressen ist je Gemeinde-Website nachzuziehen. Bezirks-Vermittlerämter sind vollständig adressiert.

## ALT (ersetzt durch 35) · BL — Friedensrichterkreise K9–K12 + Itingen — **GESCHLOSSEN**

Korrektur zur Dossier-Annahme: Die Kreiseinteilung steht **nicht** in einem separaten Dekret (SGS 170.1) und auch nicht in «§ 2», sondern direkt im **GOG BL § 18** (SGS 170). § 2 GOG regelt nur, *dass* Friedensrichter die Zivilgerichtsbarkeit ausüben.

| Kreis | Sitzort | Gemeinden |
|---|---|---|
| 9 | **Liestal** | Lausen, Liestal |
| 10 | **Bubendorf** | Bubendorf, Lupsingen, Ramlinsburg, Seltisberg, Ziefen |
| 11 | **Frenkendorf** | Arisdorf, Frenkendorf, Füllinsdorf, Giebenach, Hersberg |
| 12 | **Pratteln** | Augst, Pratteln |
| 13 | **Sissach** | Böckten, Buckten, Diepflingen, Häfelfingen, **Itingen**, Känerkinden, Läufelfingen, Nusshof, Rümlingen, Sissach, Tenniken, Thürnen, Wintersingen, Wittinsburg, Zunzgen |

**Itingen-Konflikt aufgelöst:** Itingen gehört eindeutig zu **Kreis 13 (Sissach)** — dreifach bestätigt: GOG BL § 18 Ziff. 13 (Erlasstext), kanton baselland.ch und gemeinde sissach.ch. Es ist **nicht** in K9–K12. Pro Kreis werden 2 Friedensrichter:innen gewählt (§ 19 GOG); Sitz am Wohnsitz. Amtsperiode aktuell 1.4.2026–31.3.2030; für Kreis 13 z. B. Maria Gaetani und Markus Hunziker (Sissach).

Amtliche Quellen (Abruf 6.6.2026): GOG BL § 18, SGS 170 — Erlasstext https://bl.clex.ch/app/de/texts_of_law/170 (PDF-Fassung verifiziert); kanton baselland.ch https://www.baselland.ch/politik-und-behorden/gerichte/friedensrichter-innen; sissach.ch https://www.sissach.ch/themenaz/41240.


**Generator-Hinweis:** SZ/BL bleiben BEWUSST ausserhalb der automatischen
PLZ→Amt-Auflösung: Die Vermittler-/Friedensrichter-Adressen sind PERSONEN-
gebunden (Sitz am Wohnsitz, Amtsperiode 1.4.2026–31.3.2030) und damit
fluktuierend — der Verzeichnis-Fallback in der UI ist die ehrliche Lösung.
Die Gemeinde→Kreis-Zuordnung oben ist amtlich gesichert (GOG BL § 18;
Staatskalender SZ) und dient der manuellen Bestimmung.

## SZ-Adress-Nachtrag (6.6.2026, amtliche Gemeinde-/Bezirksseiten)
- Höfe: **Rebhaldenstrasse 15, 8807 Freienbach** (hoefe.ch) ·
  Einsiedeln: Eisenbahnstrasse 20a, PF 405, 8840 (einsiedeln.ch) ·
  Küssnacht: **Seeplatz 2/3, PF 176, 6403** (kuessnacht.ch) ·
  Gemeinde Schwyz: **Herrengasse 17, 6431** (gemeindeschwyz.ch —
  Amtsadresse; «Laubstrasse 13» war Privatadresse) ·
  Arth/Lachen: amtlich nur Postfach (6410 Goldau / PF 626, 8853 Lachen).
- ⚠ DIVERGENZ Ingenbohl: ingenbohl.ch verweist auf das Vermittleramt
  EINSIEDELN (Eisenbahnstrasse 20a); der Staatskalender führt Ingenbohl im
  Vermittlerkreis GERSAU (Rüegg, Brunnen). Re-Audit 6.6.2026 ENTSCHIEDEN: massgebliche Eingabeadresse = EINSIEDELN (ingenbohl.ch direkt) — bis zur SZ-Gesamtlösung
  bleibt SZ Verzeichnis-Fallback (personengebundene Ämter).
- Übrige Klein-/Sammelgemeinden: weiterhin offen (vermittler-sz.ch JS-only).

---

# TEIL 3 — GR: Vermittlerämter je Region (6.6.2026, für den Generator)

Quelle: TI-VS-GR-Vollerfassung (zweifach geprüft, justiz-gr.ch 5.6.2026);
Regionen = amtliche BFS-Ebene (11/11 namensgleich). Gemeinde-Zuordnung
über das BFS-Gemeindeverzeichnis (Snapshot 1.6.2026) wie bei FR.

## 30. GR — Graubünden: Vermittlerämter (Region = BFS-Region)

| Amt | Strasse | PLZ Ort | Regionen | URL |
|---|---|---|---|---|
| Vermittleramt Region Albula | Stradung 26 | 7450 Tiefencastel | Albula | https://www.justiz-gr.ch/schlichtungsbehoerden-und-mediation/ueber-uns/vermittleraemter/ |
| Vermittleramt Region Bernina | Via da la Pesa 8 | 7742 Poschiavo | Bernina | https://www.justiz-gr.ch/schlichtungsbehoerden-und-mediation/ueber-uns/vermittleraemter/ |
| Vermittleramt Region Engiadina Bassa/Val Müstair | Saglina 22 | 7554 Sent | Engiadina Bassa / Val Müstair | https://www.justiz-gr.ch/schlichtungsbehoerden-und-mediation/ueber-uns/vermittleraemter/ |
| Vermittleramt Region Imboden | Postfach 667 | 7001 Chur | Imboden | https://www.justiz-gr.ch/schlichtungsbehoerden-und-mediation/ueber-uns/vermittleraemter/ |
| Vermittleramt Region Landquart | Bahnhofplatz 2b, Postfach 244 | 7302 Landquart | Landquart | https://www.justiz-gr.ch/schlichtungsbehoerden-und-mediation/ueber-uns/vermittleraemter/ |
| Vermittleramt Region Maloja | Plazza da Scoula 16, Postfach 83 | 7500 St. Moritz | Maloja | https://www.justiz-gr.ch/schlichtungsbehoerden-und-mediation/ueber-uns/vermittleraemter/ |
| Vermittleramt Region Moesa | Al Giardinètt 2 | 6535 Roveredo | Moesa | https://www.justiz-gr.ch/schlichtungsbehoerden-und-mediation/ueber-uns/vermittleraemter/ |
| Vermittleramt Region Plessur | Bärenloch 1, Postfach 290 | 7001 Chur | Plessur | https://www.chur.ch/dienstleistungen/35245 |
| Vermittleramt Region Prättigau/Davos | Talstrasse 10a, Postfach 125 | 7250 Klosters | Prättigau / Davos | https://www.justiz-gr.ch/schlichtungsbehoerden-und-mediation/ueber-uns/vermittleraemter/ |
| Vermittleramt Region Surselva | Via Centrala 4 | 7130 Ilanz/Glion | Surselva | https://www.justiz-gr.ch/schlichtungsbehoerden-und-mediation/ueber-uns/vermittleraemter/ |
| Vermittleramt Region Viamala | Untere Gasse 1 | 7430 Thusis | Viamala | https://www.justiz-gr.ch/schlichtungsbehoerden-und-mediation/ueber-uns/vermittleraemter/ |



## NACHTRAG 10.6.2026 — URL-Spalte + Korrekturen (Recherche-Agents)

AG (17 Kreise), TG (5 Detailseiten friedensrichteraemter.tg.ch — amtlicher
Pfad-Tippfehler «friedensrichtraemter», so verifiziert), ZG (11 Gemeinde-
URLs; Oberägeri neu Alosenstrasse 2, Risch «Zentrum Dorfmatt 1», Cham amtlich
OHNE Hausnummer «Mandelhof» [eidg. Gebäuderegister], Neuheim Dorfplatz 5),
AI (alle 5 via ai.ch/gerichte/vermittler; 3 Adressen wegen Personalwechsel
korrigiert), GR (Sammelseite justiz-gr.ch …/vermittleraemter/; Plessur
zusätzlich chur.ch-Detail; Prättigau/Davos Talstrasse 10a [via Gemeinde
Davos, Tel.-identisch]; Imboden PF 308→667 — KONFLIKT justiz-gr.ch [308] vs.
zwei Regionsgemeinden Tamins/Domat-Ems [667, Tel.-identisch, aktueller] →
667 mit Vorbehalt; Imboden amtlich ohne Strasse). SG/FR: amtlich KEINE
Einzelseiten (Sammelseiten; alte fr.ch-Institutionsseiten 410 Gone) — Link-
Fallback bleibt die Verzeichnis-URL. AG-Kernbefund: Milizämter, amtlich
überwiegend NUR Postfach (Bremgarten verlangt Adressierung ausdrücklich
ohne Strasse) — Postfach-Adressen sind dort der korrekte Stand, keine Lücke.

## 31. LU — Friedensrichterämter = Gerichtsbezirke (JusG § 45; SRL 261 §§ 2–5, Stand 1.1.2025)

Volltext-verifiziert 10.6.2026 (srl.lu.ch PDF Version 4329). 1+11+18+49 = 79
Gemeinden = aktueller Bestand. SRL-Schreibweise «Hergiswil»/«Rickenbach» —
Gemeinden-Spalte unten in swisstopo-Schreibweise (Lookup-Schlüssel).

| Amt | Strasse | PLZ Ort | Gemeinden | URL |
|---|---|---|---|---|
| Friedensrichteramt Luzern | Grabenstrasse 2, Postfach 2266 | 6002 Luzern | Luzern | https://gerichte.lu.ch/organisation/schlichtungsbehoerden/Friedensrichterinnen_und_Friedensrichter/Kontakt |
| Friedensrichteramt Kriens | c/o Bezirksgericht Kriens, Villastrasse 1 | 6010 Kriens | Adligenswil, Greppen, Horw, Kriens, Malters, Meggen, Meierskappel, Schwarzenberg, Udligenswil, Vitznau, Weggis | https://gerichte.lu.ch/organisation/schlichtungsbehoerden/Friedensrichterinnen_und_Friedensrichter/Kontakt |
| Friedensrichteramt Hochdorf | c/o Bezirksgericht Hochdorf, Hohenrainstrasse 8 | 6280 Hochdorf | Aesch (LU), Ballwil, Buchrain, Dierikon, Ebikon, Emmen, Ermensee, Eschenbach (LU), Gisikon, Hitzkirch, Hochdorf, Hohenrain, Inwil, Rain, Römerswil, Rothenburg, Root, Schongau | https://gerichte.lu.ch/organisation/schlichtungsbehoerden/Friedensrichterinnen_und_Friedensrichter/Kontakt |
| Friedensrichteramt Willisau | Menzbergstrasse 16, Postfach | 6130 Willisau | Alberswil, Altbüron, Altishofen, Beromünster, Büron, Buttisholz, Dagmersellen, Doppleschwand, Egolzwil, Eich, Entlebuch, Escholzmatt-Marbach, Ettiswil, Fischbach, Flühli, Geuensee, Grossdietwil, Grosswangen, Hasle (LU), Hergiswil bei Willisau, Hildisrieden, Knutwil, Luthern, Mauensee, Menznau, Nebikon, Neuenkirch, Nottwil, Oberkirch, Pfaffnau, Reiden, Rickenbach (LU), Roggliswil, Romoos, Ruswil, Schenkon, Schlierbach, Schötz, Schüpfheim, Sempach, Sursee, Triengen, Ufhusen, Wauwil, Werthenstein, Wikon, Willisau, Wolhusen, Zell (LU) | https://gerichte.lu.ch/organisation/schlichtungsbehoerden/Friedensrichterinnen_und_Friedensrichter/Kontakt |

## 32. AR — 3 Vermittlerämter (ordentliche Schlichtung; ar.ch verifiziert 10.6.2026)

| Amt | Strasse | PLZ Ort | Gemeinden | URL |
|---|---|---|---|---|
| Vermittleramt Appenzeller Hinterland | Obstmarkt 3 (Regierungsgebäude) | 9102 Herisau | Herisau, Urnäsch, Schwellbrunn, Hundwil, Stein (AR), Schönengrund, Waldstatt | https://ar.ch/gerichte/vermittler-und-schlichtungsstellen/vermittler/ |
| Vermittleramt Appenzeller Mittelland | Landsgemeindeplatz 2, Rathaus 3. Stock | 9043 Trogen | Teufen (AR), Bühler, Gais, Speicher, Trogen | https://ar.ch/gerichte/vermittler-und-schlichtungsstellen/vermittler/ |
| Vermittleramt Appenzeller Vorderland | Landsgemeindeplatz 2, Rathaus 3. Stock | 9043 Trogen | Rehetobel, Wald (AR), Grub (AR), Heiden, Wolfhalden, Lutzenberg, Walzenhausen, Reute (AR) | https://ar.ch/gerichte/vermittler-und-schlichtungsstellen/vermittler/ |

OFFEN: gesetzliche Verankerung der drei Kreise im AR-JG nicht volltext-geprüft
(Gemeindelisten = amtliche ar.ch-Seite; 20/20 Gemeinden gedeckt).

## 33. NE — Chambres de conciliation der 2 Tribunaux régionaux (OJN Art. 98a/98e; LDP Art. 44a)

Volltext-verifiziert 10.6.2026 (rsn.ne.ch PDFs, OJN état 1.2.2026):
Zuordnung nach WAHLREGIONEN (seit 1.1.2021), nicht mehr Bezirken. Site
Boudry = zweiter Eingabeort desselben Sprengels (OJN Art. 98c) → im
Dropdown wählbar, ohne eigene Gemeinden.

| Amt | Strasse | PLZ Ort | Gemeinden | URL |
|---|---|---|---|---|
| Tribunal régional Littoral/Val-de-Travers — Chambre de conciliation (Neuchâtel) | Rue de l'Hôtel-de-Ville 2 | 2000 Neuchâtel | Boudry, Cornaux, Cortaillod, Cressier (NE), La Grande Béroche, Laténa, Le Landeron, Lignières, Milvignes, Neuchâtel, Rochefort, La Côte-aux-Fées, Les Verrières, Val-de-Travers | https://www.ne.ch/autorites/PJNE/tribunaux-regionaux/Pages/accueil.aspx |
| — Site Boudry (gleicher Sprengel, Art. 98c OJN) | Rue Louis-Favre 39 | 2017 Boudry |  | https://www.ne.ch/autorites/PJNE/tribunaux-regionaux/Pages/accueil.aspx |
| Tribunal régional Montagnes/Val-de-Ruz — Chambre de conciliation | Avenue Léopold-Robert 10 (Hôtel judiciaire) | 2300 La Chaux-de-Fonds | Brot-Plamboz, La Brévine, La Chaux-de-Fonds, La Chaux-du-Milieu, La Sagne, Le Cerneux-Péquignot, Le Locle, Les Planchettes, Les Ponts-de-Martel, Val-de-Ruz | https://www.ne.ch/autorites/PJNE/tribunaux-regionaux/Pages/accueil.aspx |

Vorbehalt: Reform «Tribunal d'instance» (OJN Art. 8) beschlossen, Spezial-
gesetz zu Sitz/Sprengel noch nicht in Kraft → bei Inkrafttreten anpassen.
FUSIONS-NACHTRAG 10.6.2026 (swisstopo aktuell, massgeblich für den
PLZ-Lookup): Hauterive + La Tène + Saint-Blaise + Enges → **Laténa**;
Cressier amtlich «Cressier (NE)». Die LDP-44a-Schreibweisen (Fassung 2021)
sind insoweit überholt; Liste oben auf swisstopo-Stand normalisiert.

## 34. BE — Schlichtungsbehörden je Gerichtsregion (GSOG Art. 80/84; OrG Art. 39a) — VERDRAHTET 10.6.2026 (BFS-Join)

Zuordnung über VERWALTUNGSKREISE (= BFS-Bezirke): Bern-Mittelland ·
Emmental+Oberaargau · Thun+Frutigen-Niedersimmental+Obersimmental-Saanen+
Interlaken-Oberhasli · Berner Jura+Biel/Bienne+Seeland. Adressen/URLs:
Effingerstrasse 34, 3008 Bern · Dunantstrasse 3, 3400 Burgdorf ·
Scheibenstrasse 11 B, 3600 Thun · Neuengasse 8, 2502 Biel/Bienne
(Aussenstelle Berner Jura prov. Unionsgasse 13, 2502 Biel — Moutier seit
1.1.2026 JU!). zsg.justice.be.ch …/schlichtungsbehoerden/<region>.html.
Gemeinde-Map via BFS-Join (Verwaltungskreise; BFS führt den Berner Jura
französisch als «Arrondissement administratif Jura bernois»). VERDRAHTET
10.6.2026 (334/334 Gemeinden, agvchapp-Snapshot 1.6.2026):

| Amt | Strasse | PLZ Ort | Verwaltungskreise | URL |
|---|---|---|---|---|
| Schlichtungsbehörde Bern-Mittelland | Effingerstrasse 34 | 3008 Bern | Bern-Mittelland | https://www.zsg.justice.be.ch/de/start/ueber-uns/schlichtungsbehoerden/bern-mittelland.html |
| Schlichtungsbehörde Emmental-Oberaargau | Dunantstrasse 3 | 3400 Burgdorf | Emmental, Oberaargau | https://www.zsg.justice.be.ch/de/start/ueber-uns/schlichtungsbehoerden/emmental-oberaargau.html |
| Schlichtungsbehörde Oberland | Scheibenstrasse 11 B (Verwaltungsgebäude Selve) | 3600 Thun | Thun, Frutigen-Niedersimmental, Obersimmental-Saanen, Interlaken-Oberhasli | https://www.zsg.justice.be.ch/de/start/ueber-uns/schlichtungsbehoerden/oberland.html |
| Schlichtungsbehörde Berner Jura-Seeland | Neuengasse 8 | 2502 Biel/Bienne | Jura bernois, Biel/Bienne, Seeland | https://www.zsg.justice.be.ch/de/start/ueber-uns/schlichtungsbehoerden/berner-jura-seeland.html |

## 35. BL — 15 Friedensrichterkreise VOLLSTÄNDIG (§ 18 GOG BL, SGS 170 — Volltext via bl.clex.ch 10.6.2026)

Ersetzt die Teilliste in Abschnitt 5 (dort u.a. K9-Itingen-Verdacht: BESTÄTIGT
— Itingen gehört zu K13 Sissach). 86/86 Gemeinden. Adressen aus der amtlichen
Kontakttabelle baselland.ch (personengebunden, Wahlperioden-Halbwertszeit!);
Kreiseinteilung gesetzlich stabil. Gemeinden-Spalte in swisstopo-Schreibweise.

| Amt | Strasse | PLZ Ort | Gemeinden | URL |
|---|---|---|---|---|
| Friedensrichterkreis 1 Aesch | Ziegelbüntenweg 27 | 4147 Aesch | Aesch (BL), Pfeffingen | https://www.baselland.ch/politik-und-behorden/gerichte/bv-gerichte/friedensrichter |
| Friedensrichterkreis 2 Reinach | c/o Gemeindeverwaltung, Hauptstrasse 10 | 4153 Reinach | Reinach (BL) | https://www.baselland.ch/politik-und-behorden/gerichte/bv-gerichte/friedensrichter |
| Friedensrichterkreis 3 Allschwil | Strengigartenweg 5A | 4123 Allschwil | Allschwil, Schönenbuch | https://www.baselland.ch/politik-und-behorden/gerichte/bv-gerichte/friedensrichter |
| Friedensrichterkreis 4 Binningen | c/o Gemeindeverwaltung Binningen, Curt Goetz-Strasse 1 | 4102 Binningen | Binningen, Bottmingen | https://www.baselland.ch/politik-und-behorden/gerichte/bv-gerichte/friedensrichter |
| Friedensrichterkreis 5 Arlesheim | c/o Gemeindeverwaltung Münchenstein, Schulackerstrasse 4 | 4142 Münchenstein | Arlesheim, Münchenstein | https://www.baselland.ch/politik-und-behorden/gerichte/bv-gerichte/friedensrichter |
| Friedensrichterkreis 6 Birsfelden | Kirchplatz 3 | 4132 Muttenz | Birsfelden, Muttenz | https://www.baselland.ch/politik-und-behorden/gerichte/bv-gerichte/friedensrichter |
| Friedensrichterkreis 7 Oberwil | Rosenweg 11 | 4104 Oberwil | Biel-Benken, Ettingen, Oberwil (BL), Therwil | https://www.baselland.ch/politik-und-behorden/gerichte/bv-gerichte/friedensrichter |
| Friedensrichterkreis 8 Laufen | Brombergstrasse 42 | 4244 Röschenz | Blauen, Brislach, Burg im Leimental, Dittingen, Duggingen, Grellingen, Laufen, Liesberg, Nenzlingen, Roggenburg, Röschenz, Wahlen, Zwingen | https://www.baselland.ch/politik-und-behorden/gerichte/bv-gerichte/friedensrichter |
| Friedensrichterkreis 9 Liestal | Rathausstrasse 36, Postfach | 4410 Liestal | Lausen, Liestal | https://www.baselland.ch/politik-und-behorden/gerichte/bv-gerichte/friedensrichter |
| Friedensrichterkreis 10 Bubendorf | Am Rain 14 | 4419 Lupsingen | Bubendorf, Lupsingen, Ramlinsburg, Seltisberg, Ziefen | https://www.baselland.ch/politik-und-behorden/gerichte/bv-gerichte/friedensrichter |
| Friedensrichterkreis 11 Frenkendorf | Bächliackerstrasse 2 | 4402 Frenkendorf | Arisdorf, Frenkendorf, Füllinsdorf, Giebenach, Hersberg | https://www.baselland.ch/politik-und-behorden/gerichte/bv-gerichte/friedensrichter |
| Friedensrichterkreis 12 Pratteln | Muttenzerstrasse 38 | 4133 Pratteln | Augst, Pratteln | https://www.baselland.ch/politik-und-behorden/gerichte/bv-gerichte/friedensrichter |
| Friedensrichterkreis 13 Sissach | c/o Gemeindeverwaltung Sissach, Bahnhofstrasse 1 | 4450 Sissach | Böckten, Buckten, Diepflingen, Häfelfingen, Itingen, Känerkinden, Läufelfingen, Nusshof, Rümlingen, Sissach, Tenniken, Thürnen, Wintersingen, Wittinsburg, Zunzgen | https://www.baselland.ch/politik-und-behorden/gerichte/bv-gerichte/friedensrichter |
| Friedensrichterkreis 14 Gelterkinden | Huebacherweg 16 | 4460 Gelterkinden | Anwil, Buus, Gelterkinden, Hemmiken, Kilchberg (BL), Maisprach, Oltingen, Ormalingen, Rickenbach (BL), Rothenfluh, Rünenberg, Tecknau, Wenslingen, Zeglingen | https://www.baselland.ch/politik-und-behorden/gerichte/bv-gerichte/friedensrichter |
| Friedensrichterkreis 15 Waldenburg | c/o Gemeindeverwaltung Reigoldswil, Dorfplatz 2 | 4418 Reigoldswil | Arboldswil, Bennwil, Bretzwil, Diegten, Eptingen, Hölstein, Lampenberg, Langenbruck, Lauwil, Liedertswil, Niederdorf, Oberdorf (BL), Reigoldswil, Titterten, Waldenburg | https://www.baselland.ch/politik-und-behorden/gerichte/bv-gerichte/friedensrichter |

## 36. SZ — Vermittlerämter mit Gemeinde-Zuordnung (Staatskalender 2024–2026, Stand 9.6.2026)

§§ 69a–69d JG (SRSZ 231.110). Konsolidierungen: Höfe (Bezirk, seit 1.7.2020)
und Vermittlerkreis Ingenbohl–Gersau–Morschach–Riemenstalden. OFFEN (Adresse
amtlich nicht publiziert, NICHT in der Auto-Zuordnung): Lauerz, Steinerberg,
Alpthal, Wangen — dort Dropdown/Handeingabe. 26/30 Gemeinden automatisch.

| Amt | Strasse | PLZ Ort | Gemeinden | URL |
|---|---|---|---|---|
| Vermittleramt Höfe (Bezirk) | Rebhaldenstrasse 15 | 8807 Freienbach | Feusisberg, Freienbach, Wollerau | https://www.hoefe.ch/de/judikative/vermittleramt/ |
| Vermittlerkreis Ingenbohl–Gersau–Morschach–Riemenstalden | Eisenbahnstrasse 20a, Postfach 405 | 8840 Einsiedeln | Ingenbohl, Gersau, Morschach, Riemenstalden | https://www.ingenbohl.ch/vermittler |
| Vermittleramt Bezirk Einsiedeln | Eisenbahnstrasse 20a, Postfach 405 | 8840 Einsiedeln | Einsiedeln | https://www.einsiedeln.ch/justiz/vermittler |
| Vermittleramt Bezirk Küssnacht | Postfach 115 | 6403 Küssnacht am Rigi | Küssnacht (SZ) | https://www.kuessnacht.ch/justiz/vermittleramt.html/76 |
| Vermittleramt Gemeinde Schwyz | Herrengasse 17 | 6431 Schwyz | Schwyz | https://www.gemeindeschwyz.ch/kommissionen/31483 |
| Vermittleramt Arth | Postfach | 6410 Goldau | Arth | https://www.arth.ch/verwaltung/5680 |
| Vermittleramt Muotathal | Schwarzenbach 4 | 6436 Bisisthal | Muotathal | https://www.muotathal.ch/gemeinde/gemeindeverwaltung/vermittleramt |
| Vermittleramt Steinen | Räbengasse 17 | 6422 Steinen | Steinen | https://www.steinen.ch/bereiche/34525 |
| Vermittleramt Sattel | Dorfbachstrasse 18 | 6418 Rothenthurm | Sattel | https://www.sattel.ch/abteilungen/24842 |
| Vermittleramt Rothenthurm | Dorfbachstrasse 18 | 6418 Rothenthurm | Rothenthurm | https://www.rothenthurm.ch/verwaltung/abteilungen/vermittleramt |
| Vermittleramt Illgau | Dorfbachstrasse 18 | 6418 Rothenthurm | Illgau | https://www.illgau.ch/verwaltung/abteilungen/vermittleramt |
| Vermittleramt Oberiberg | Eisenbahnstrasse 20a, Postfach 405 | 8840 Einsiedeln | Oberiberg | https://www.oberiberg.ch/verwaltung/vermittler |
| Vermittleramt Unteriberg | Sonnmattstrasse 19 | 8842 Unteriberg | Unteriberg | https://www.unteriberg.ch/verwaltung/abteilungen/vermittleramt |
| Vermittleramt Lachen | Postfach 626 | 8853 Lachen | Lachen | https://www.lachen.ch/laebe-lache-gnuesse/lache/verwaltung/aemter-und-abteilungen/vermittleramt.html/107 |
| Vermittleramt Altendorf | Oberdorfstrasse 3, Postfach 23 | 8852 Altendorf | Altendorf | https://www.altendorf.ch/verwaltung/abteilungen/vermittleramt.html/45 |
| Vermittleramt Galgenen | Merikenstrasse 8 | 8864 Reichenburg | Galgenen | https://www.galgenen.ch/abteilungen/28273 |
| Vermittleramt Reichenburg | Merikenstrasse 8 | 8864 Reichenburg | Reichenburg | https://www.reichenburg.ch/politik-verwaltung/verwaltung/abteilungen/vermittleramt.html/158 |
| Vermittleramt Schübelbach | Sieben-Eichenweg 15 | 8854 Siebnen | Schübelbach | https://www.schuebelbach.ch/aemter/12889 |
| Vermittleramt Tuggen | Zürcherstrasse 14, Postfach 35 | 8856 Tuggen | Tuggen | https://www.tuggen.ch/de/verwaltung/aemter/?amt_id=5121 |
| Vermittleramt Vorderthal | Kreuzstrasse 30 | 8854 Siebnen | Vorderthal | https://www.vorderthal.ch/verwaltung/vermittler |
| Vermittleramt Innerthal | Mühlestrasse 16 | 8855 Wangen | Innerthal | https://www.innerthal.ch/verwaltung/vermittleramt-1456 |

## 37. VD — Justices de paix je District (Streitwert-Stufe < CHF 10'000) — VERDRAHTET 11.6.2026 (BFS-Join)

**Normlage WÖRTLICH verifiziert 11.6.2026** (LOJV BLV 173.01, konsolidierte
Fassung via Lexfind-Spiegel der BLV-Publikation; CDPJ BLV 211.02; Arrêté
AAJTJ BLV 173.01.2, Fassung in Kraft seit 1.9.2008):

- **Art. 41 Abs. 1 CDPJ:** «Le juge de la tentative de conciliation est le
  juge matériellement compétent pour l'instance au fond.» Abs. 2: bei einem
  Kollegialgericht der juge délégué (für die Chambre patrimoniale
  ausdrücklich Art. 42 Abs. 1 CDPJ). Abs. 3: Spezialgesetze vorbehalten
  (Miete → Commission préfectorale; Arbeit inkl. GlG → LJT, unten).
- **Arbeitsrecht inkl. GlG — LJT (BLV 173.61), wörtlich verifiziert
  11.6.2026 (Bug-Check-Befund: die ordentliche Kaskade gilt hier NICHT):**
  Art. 1 Abs. 1 (Geltung: Arbeitsvertrag, AVG-Verleih, GlG,
  Mitwirkungsgesetz) · Art. 2 Abs. 1: a. Tribunal de prud'hommes
  «n'excède pas 30'000» · b. Tribunal d'arrondissement > 30'000 bis
  ≤ 100'000 · c. Chambre patrimoniale > 100'000 · Art. 2 Abs. 2: nur-GlG
  ohne Geldbegehren → prud'hommes streitwertunabhängig · Art. 5: das
  prud'hommes ist die spezialisierte Kammer JEDES Tribunal
  d'arrondissement (= dessen Anschrift) · Art. 10 Abs. 2: Schlichtung
  ohne Beisitzer, Art. 200 Abs. 2 ZPO (GlG-Parität) vorbehalten.
- **Art. 113 Abs. 1bis LOJV:** Juge de paix für vermögensrechtliche
  Streitigkeiten **unter CHF 10'000** («inférieure à 10'000 francs …
  Cette règle est impérative»).
- **Art. 96d Abs. 2 LOJV:** Präsident des Tribunal d'arrondissement
  **CHF 10'000 bis 30'000** («comprise entre 10'000 et 30'000 francs»).
- **Art. 96b Abs. 3 LOJV:** Tribunal d'arrondissement (Kollegium)
  **über CHF 30'000 bis und mit 100'000** («supérieure à 30'000 …
  inférieure ou égale à 100'000»).
- **Art. 96g LOJV:** Chambre patrimoniale cantonale **über CHF 100'000**
  («supérieure à 100'000 francs»); Art. 96f: der Kammer-Sitz ist beim
  Tribunal d'arrondissement de Lausanne. Damit ist die im Struktur-Befund
  10.6.2026 offene >-100k-Schwelle wörtlich geschlossen; die dortige Angabe
  «10'000–100'000 Tribunal d'arrondissement» war ungenau (Stufe 10–30k =
  Präsident als Einzelrichter, gleicher Sitz/gleiche Adresse).
- Frühere Dossier-Notiz «Justices-de-paix-Adressen nicht erhoben» ist
  überholt: alle 9 Adressen seit 6.6.2026 WebFetch-verifiziert (vd.ch/ojv).

Korrektur der alten Distrikts-Angabe: Die **Arrondissement-Einteilung**
folgt dem AAJTJ Art. 1 (nicht dem Struktur-Befund): Lausanne =
Lausanne + Ouest lausannois (Sitz Lausanne) · La Côte = Morges + Nyon
(Sitz Nyon) · Est vaudois = Aigle + Lavaux-Oron + Riviera-Pays-d'Enhaut
(Sitz **Vevey**) · Broye et Nord vaudois = Broye-Vully + Gros-de-Vaud +
Jura-Nord vaudois (Sitz Yverdon-les-Bains).

Generator-Muster wie BE: Spalte 4 trägt die **Districts** (BFS-Level-2-
Namen ohne Präfix «District de/du/d'/de la/de l'»); `plz-generieren.ts`
löst sie über den BFS-Snapshot (/tmp/bfs_gemeinden.csv, agvchapp 1.6.2026)
in die 300 VD-Gemeinden auf. Die Justice de paix «Jura-Nord vaudois et
Gros-de-Vaud» deckt amtlich ZWEI Districts (vd.ch/ojv).

| Amt | Strasse | PLZ Ort | Districts | URL |
| --- | --- | --- | --- | --- |
| Justice de paix Lausanne | Côtes-de-Montbenon 8 | 1014 Lausanne | Lausanne | https://www.vd.ch/ojv/justices-de-paix/lausanne |
| Justice de paix Ouest lausannois | Av. de Longemalle 1 | 1020 Renens | Ouest lausannois | https://www.vd.ch/ojv/justices-de-paix/ouest-lausannois |
| Justice de paix Morges | Rue Saint-Louis 2 | 1110 Morges | Morges | https://www.vd.ch/ojv/justices-de-paix/morges |
| Justice de paix Nyon | Rue Jules-Gachet 5 | 1260 Nyon | Nyon | https://www.vd.ch/ojv/justices-de-paix/nyon |
| Justice de paix Aigle | Hôtel de Ville, Place du Marché 1 | 1860 Aigle | Aigle | https://www.vd.ch/ojv/justices-de-paix/aigle |
| Justice de paix Riviera | Rue du Musée 6 | 1800 Vevey | Riviera-Pays-d'Enhaut | https://www.vd.ch/ojv/justices-de-paix/riviera-pays-denhaut |
| Justice de paix Lavaux-Oron | Rue Davel 9 | 1096 Cully | Lavaux-Oron | https://www.vd.ch/ojv/justices-de-paix/lavaux-oron |
| Justice de paix Broye-Vully | Rue de la Gare 45 | 1530 Payerne | Broye-Vully | https://www.vd.ch/ojv/justices-de-paix/broye-vully |
| Justice de paix Jura-Nord vaudois/Gros-de-Vaud | Rue des Moulins 10, Case postale | 1401 Yverdon-les-Bains | Jura-Nord vaudois, Gros-de-Vaud | https://www.vd.ch/ojv/justices-de-paix/jura-nord-vaudois-et-gros-de-vaud |

**Tribunaux d'arrondissement + Chambre patrimoniale (Stufen ≥ CHF 10'000)** —
Adressen WebFetch-verifiziert 11.6.2026 an den vd.ch/ojv-Detailseiten; die
Daten leben in `src/data/schlichtungsstellen.ts` (VD_TRIBUNAUX /
VD_CHAMBRE_PATRIMONIALE), NICHT in der Generator-Tabelle oben. Bewusst als
Liste statt Tabelle (Bug-B1-Muster: `|`-Zeilen in der VD-Sektion würde der
Generator als weitere «Justices de paix» einlesen und die Districts-Spalte
würde die Gemeinde-Zuordnung überschreiben):

- Tribunal d'arrondissement de Lausanne · Allée E.-Ansermet 2, Palais de justice de Montbenon · 1014 Lausanne · Districts Lausanne + Ouest lausannois · https://www.vd.ch/ojv/tribunaux-darrondissement/lausanne
- Tribunal d'arrondissement de La Côte · Route de Saint-Cergue 38 · 1260 Nyon · Districts Morges + Nyon · https://www.vd.ch/ojv/tribunaux-darrondissement/la-cote
- Tribunal d'arrondissement de l'Est vaudois · Cour-au-Chantre, Rue du Simplon 22 · 1800 Vevey · Districts Aigle + Lavaux-Oron + Riviera-Pays-d'Enhaut · https://www.vd.ch/ojv/tribunaux-darrondissement/est-vaudois
- Tribunal d'arrondissement de la Broye et du Nord vaudois · Rue des Moulins 8, Case postale · 1401 Yverdon-les-Bains · Districts Broye-Vully + Gros-de-Vaud + Jura-Nord vaudois · https://www.vd.ch/ojv/tribunaux-darrondissement/broye-et-nord-vaudois
- Chambre patrimoniale cantonale · Allée E.-Ansermet 2, Palais de justice de Montbenon · 1014 Lausanne · ganzer Kanton (Art. 96f LOJV: beim TA Lausanne) · https://www.vd.ch/ojv/chambre-patrimoniale-cantonale

**Pflegebedarf:** Schwellenwerte (10'000/30'000/100'000) sind Gesetzes-
Parameter (LOJV-Revisionen beobachten, kein fixes Verfallsdatum);
TA-Adressen wie übrige Behördenadressen jährlich mit dem BWO-Durchgang.
**Abnahme-Status:** Normlage + Adressen Erstrecherche wörtlich am amtlichen
Erlass (11.6.2026); fachliche Abnahme durch David ausstehend.
