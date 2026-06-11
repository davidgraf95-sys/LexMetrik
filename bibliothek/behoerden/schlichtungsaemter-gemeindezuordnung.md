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
| Friedensrichterkreis 10 Bubendorf | Am Rain 20 | 4419 Lupsingen | Bubendorf, Lupsingen, Ramlinsburg, Seltisberg, Ziefen | https://www.baselland.ch/politik-und-behorden/gerichte/bv-gerichte/friedensrichter |
| Friedensrichterkreis 11 Frenkendorf | Bächliackerstrasse 2 | 4402 Frenkendorf | Arisdorf, Frenkendorf, Füllinsdorf, Giebenach, Hersberg | https://www.baselland.ch/politik-und-behorden/gerichte/bv-gerichte/friedensrichter |
| Friedensrichterkreis 12 Pratteln-Augst | Postfach 1335 | 4133 Pratteln | Augst, Pratteln | https://www.baselland.ch/politik-und-behorden/gerichte/bv-gerichte/friedensrichter |
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

**NACHTRAG 11.6.2026 (Sektion 35, Gemeindeseiten-Verifikation aller 15 Kreise — baselland.ch Cloudflare-gesperrt):** 10 Zeilen amtlich bestätigt; ZWEI korrigiert: K10 amtlich «Am Rain 20» (seltisberg.ch; war 14) · K12 amtlich «Friedensrichteramt Pratteln-Augst, Postfach 1335, 4133 Pratteln» (pratteln.ch; war Muttenzerstrasse 38). K4/K15 als c/o-Verwaltungsadressen bestätigt; K8 (Brombergstrasse 42, Röschenz) bleibt UNSICHER (nirgends amtlich publiziert, nur indiziell — Vorbehalt im Kreis-Eintrag belassen, bei Gelegenheit beim Kreis nachfragen). Detail-Protokoll /tmp-Erhebung der Session.

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
löst sie über den BFS-Snapshot (agvchapp.bfs.admin.ch, Stand 1.6.2026)
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

## 38. TI — Giudicature di pace je Circolo (38 Circoli) — VERDRAHTET 11.6.2026 (amtliche Online-Suche)

**Quelle + Stand:** Amtliche Località-Suche der Giudici-di-pace-Seite
(www4.ti.ch, TYPO3-Endpunkt id=29221), Vollerhebung am 11.6.2026: die
Suche führt 175 Località-Optionen (169 distinkte Namen — einzelne Namen
doppelt mit eigener ID), alle distinkten Namen einzeln abgefragt; die
Abdeckung ALLER 100 BFS-Gemeinden ist im Test `tiSchlichtung.test.ts`
verankert. Gemeinde→Circolo-Zuordnung und Adressen stammen aus den
Antworten (Abkürzungen wie «CP» als «Casella postale» ausgeschrieben;
URL-Spalte = amtlicher Deep-Link der Suche je Circolo). Rechtsgrundlage:
Art. 28 f. LOG (RL 177.100) i. V. m. RL 180.100.

**Korrekturen gegenüber der Vollerfassung vom 5.6.2026** (dort Abschnitt
1a — esecuzioni-piu-basiert, jetzt überholt):
1. Die Circoli **Ticino** und **Giubiasco** existieren in der amtlichen
   Suche NICHT mehr — sämtliche Ex-Gemeinden (Monte Carasso, Sementina,
   Giubiasco, Camorino, Gudo, Pianezzo, S. Antonio …) antworten mit dem
   **Circolo di Bellinzona**. Die 38 ergeben sich heute also OHNE die
   alte Übergangs-Dreiteilung des Distretto Bellinzona.
2. Die Unsicherheit «Sitz Bellinzona vs. Giubiasco» ist amtlich geklärt:
   «Sede principale e invio corrispondenza: Piazza Grande 3,
   6512 Giubiasco; Sede secondaria: Via Lavizzari 14, 6500 Bellinzona».
3. Mehrere Sitz-Adressen sind gegenüber 5.6. amtlich anders: Capriasca
   neu Vaglio (nicht Tesserete) · Gambarogno neu Magadino (nicht
   S. Nazzaro) · Maggia neu Lodano · Olivone neu Torre · Sessa neu
   Banco · Giornico Nr. 13 · Lugano Est Strada di Pregassona 33 ·
   Verzasca Postanschrift Casella Postale 4, 6516 Cugnasco (Sitz
   Lavertezzo). Lugano Nord nennt amtlich keine PLZ — 6968 Sonvico
   ergänzt aus dem swisstopo-Ortschaftenverzeichnis.
4. Kantonale Datenlücken: die Località-Optionen Ambrì, Pianezzo,
   S. Antonio und Torre liefern einen LEEREN Circolo-Namen (Platzhalter
   ohne Giudice) — ihre Gemeinden (Quinto, Bellinzona, Blenio) sind über
   die Gemeinde-Option selbst eindeutig aufgelöst.
5. Onsernone und Breno (Alto Malcantone) führen amtlich KEINE
   Strassenadresse (nur PLZ/Ort) — ehrlich leer gelassen.

**Drei Gemeinden liegen in MEHREREN Circoli** (Fusionen über
Circolo-Grenzen; NICHT in der Generator-Tabelle — die UI bietet die
Ortsteil-Wahl an, Daten in `src/data/schlichtung/tiAmt.ts`):

- Lugano → Lugano Ovest (Zentrum, Barbengo, Besso, Breganzona, Carabbia, Carona, Figino, Loreto, Molino Nuovo, Pambio-Noranco, Pazzallo) · Lugano Est (Aldesago, Brè, Caprino, Cassarate, Castagnola, Cureggia, Gandria, Pregassona, Viganello) · Lugano Nord (Bogno, Cadro, Certara, Cimadera, Davesco-Soragno, Sonvico, Valcolla, Villa Luganese)
- Lema → Sessa (Astano, Bedigliora) · Magliasina (Curio) · Breno (Miglieglia, Novaggio)
- Tresa → Sessa (Croglio, Monteggio, Sessa) · Magliasina (Ponte Tresa)

| Amt | Strasse | PLZ Ort | Gemeinden | URL |
| --- | --- | --- | --- | --- |
| Giudicatura di pace del Circolo di Acquarossa | Casa comunale, Via Bosco Ciossera 9 | 6716 Acquarossa | Acquarossa | https://www4.ti.ch/index.php?id=29221&user_pgiudiziario_pi4%5Bbox%5D=1185&bTrova=Trova |
| Giudicatura di pace del Circolo di Agno | Piazza Colonnello Vicari 1 | 6982 Agno | Agno, Bioggio, Cademario, Muzzano, Vernate | https://www4.ti.ch/index.php?id=29221&user_pgiudiziario_pi4%5Bbox%5D=1044&bTrova=Trova |
| Giudicatura di pace del Circolo di Airolo | Municipio | 6780 Airolo | Airolo, Bedretto | https://www4.ti.ch/index.php?id=29221&user_pgiudiziario_pi4%5Bbox%5D=1176&bTrova=Trova |
| Giudicatura di pace del Circolo di Arbedo-Castione | Via Centro Civico 7 | 6517 Arbedo-Castione | Arbedo-Castione, Lumino | https://www4.ti.ch/index.php?id=29221&user_pgiudiziario_pi4%5Bbox%5D=1166&bTrova=Trova |
| Giudicatura di pace del Circolo di Balerna | Via San Gottardo 90, Casella postale 137 | 6828 Balerna | Balerna, Castel San Pietro, Chiasso, Morbio Inferiore | https://www4.ti.ch/index.php?id=29221&user_pgiudiziario_pi4%5Bbox%5D=1001&bTrova=Trova |
| Giudicatura di pace del Circolo di Bellinzona | Piazza Grande 3 | 6512 Giubiasco | Bellinzona | https://www4.ti.ch/index.php?id=29221&user_pgiudiziario_pi4%5Bbox%5D=1164&bTrova=Trova |
| Giudicatura di pace del Circolo di Breno |  | 6937 Alto Malcantone | Alto Malcantone, Aranno | https://www4.ti.ch/index.php?id=29221&user_pgiudiziario_pi4%5Bbox%5D=1046&bTrova=Trova |
| Giudicatura di pace del Circolo di Caneggio | Casella postale 91 | 6833 Vacallo | Breggia, Vacallo | https://www4.ti.ch/index.php?id=29221&user_pgiudiziario_pi4%5Bbox%5D=1032&bTrova=Trova |
| Giudicatura di pace del Circolo di Capriasca | Via della Pieve 46 | 6947 Vaglio | Capriasca, Origlio, Ponte Capriasca | https://www4.ti.ch/index.php?id=29221&user_pgiudiziario_pi4%5Bbox%5D=1518&bTrova=Trova |
| Giudicatura di pace del Circolo di Ceresio | Palazzo Comunale | 6817 Maroggia | Arogno, Bissone, Brusino Arsizio, Val Mara | https://www4.ti.ch/index.php?id=29221&user_pgiudiziario_pi4%5Bbox%5D=1025&bTrova=Trova |
| Giudicatura di pace del Circolo di Faido | Casa Comunale, Piazza Frascini | 6760 Faido | Faido | https://www4.ti.ch/index.php?id=29221&user_pgiudiziario_pi4%5Bbox%5D=1192&bTrova=Trova |
| Giudicatura di pace del Circolo di Gambarogno | Via Orgnana 7 | 6573 Magadino | Gambarogno | https://www4.ti.ch/index.php?id=29221&user_pgiudiziario_pi4%5Bbox%5D=1399&bTrova=Trova |
| Giudicatura di pace del Circolo di Giornico | Via Fond la Tera 13 | 6745 Giornico | Giornico, Personico, Pollegio | https://www4.ti.ch/index.php?id=29221&user_pgiudiziario_pi4%5Bbox%5D=1180&bTrova=Trova |
| Giudicatura di pace del Circolo di Isole | Via Bartolomeo Papio 10 | 6612 Ascona | Ascona, Brissago, Losone, Ronco sopra Ascona | https://www4.ti.ch/index.php?id=29221&user_pgiudiziario_pi4%5Bbox%5D=1122&bTrova=Trova |
| Giudicatura di pace del Circolo di Lavizzara | Palazzo Giudicatura | 6695 Lavizzara | Lavizzara | https://www4.ti.ch/index.php?id=29221&user_pgiudiziario_pi4%5Bbox%5D=1144&bTrova=Trova |
| Giudicatura di pace del Circolo di Locarno | Via Trevani 1a, Casella postale 831 | 6600 Locarno | Locarno, Muralto, Orselina | https://www4.ti.ch/index.php?id=29221&user_pgiudiziario_pi4%5Bbox%5D=1106&bTrova=Trova |
| Giudicatura di pace del Circolo di Lugano Est | Strada di Pregassona 33 | 6963 Pregassona |  | https://www4.ti.ch/index.php?id=29221&user_pgiudiziario_pi4%5Bbox%5D=1538&bTrova=Trova |
| Giudicatura di pace del Circolo di Lugano Nord | Piazza Gránda | 6968 Sonvico |  | https://www4.ti.ch/index.php?id=29221&user_pgiudiziario_pi4%5Bbox%5D=1340&bTrova=Trova |
| Giudicatura di pace del Circolo di Lugano Ovest | Via Carducci 4 | 6901 Lugano |  | https://www4.ti.ch/index.php?id=29221&user_pgiudiziario_pi4%5Bbox%5D=1418&bTrova=Trova |
| Giudicatura di pace del Circolo di Maggia | Palazzo Comunale | 6678 Lodano | Avegno Gordevio, Maggia | https://www4.ti.ch/index.php?id=29221&user_pgiudiziario_pi4%5Bbox%5D=1478&bTrova=Trova |
| Giudicatura di pace del Circolo di Magliasina | Palazzo scolastico, Via Baragia 34 | 6987 Caslano | Caslano, Magliaso, Neggio, Pura | https://www4.ti.ch/index.php?id=29221&user_pgiudiziario_pi4%5Bbox%5D=1074&bTrova=Trova |
| Giudicatura di pace del Circolo di Malvaglia | Casella postale 205 | 6713 Malvaglia | Serravalle | https://www4.ti.ch/index.php?id=29221&user_pgiudiziario_pi4%5Bbox%5D=1519&bTrova=Trova |
| Giudicatura di pace del Circolo di Melezza | Piazza Intragna 1, Casella postale | 6653 Verscio | Centovalli, Terre di Pedemonte | https://www4.ti.ch/index.php?id=29221&user_pgiudiziario_pi4%5Bbox%5D=1558&bTrova=Trova |
| Giudicatura di pace del Circolo di Mendrisio | Palazzo Municipale, Piazza Municipio | 6850 Mendrisio | Coldrerio, Mendrisio | https://www4.ti.ch/index.php?id=29221&user_pgiudiziario_pi4%5Bbox%5D=1005&bTrova=Trova |
| Giudicatura di pace del Circolo di Navegna | Via S. Gottardo 80 | 6648 Minusio | Brione sopra Minusio, Gordola, Mergoscia, Minusio, Tenero-Contra | https://www4.ti.ch/index.php?id=29221&user_pgiudiziario_pi4%5Bbox%5D=1140&bTrova=Trova |
| Giudicatura di pace del Circolo di Olivone | Via Chiesa Santo Stefano 17 | 6717 Torre | Blenio | https://www4.ti.ch/index.php?id=29221&user_pgiudiziario_pi4%5Bbox%5D=1217&bTrova=Trova |
| Giudicatura di pace del Circolo di Onsernone |  | 6662 Onsernone | Onsernone | https://www4.ti.ch/index.php?id=29221&user_pgiudiziario_pi4%5Bbox%5D=1110&bTrova=Trova |
| Giudicatura di pace del Circolo di Paradiso | Palazzo Comunale, Via delle Scuole 23 | 6900 Paradiso | Collina d'Oro, Grancia, Melide, Morcote, Paradiso, Vico Morcote | https://www4.ti.ch/index.php?id=29221&user_pgiudiziario_pi4%5Bbox%5D=1065&bTrova=Trova |
| Giudicatura di pace del Circolo di Quinto | c/o Scuole Medie | 6775 Ambrì | Dalpe, Quinto | https://www4.ti.ch/index.php?id=29221&user_pgiudiziario_pi4%5Bbox%5D=1191&bTrova=Trova |
| Giudicatura di pace del Circolo di Riva San Vitale | Via Opera don Guanella | 6826 Riva San Vitale | Riva San Vitale | https://www4.ti.ch/index.php?id=29221&user_pgiudiziario_pi4%5Bbox%5D=1024&bTrova=Trova |
| Giudicatura di pace del Circolo di Riviera | Palazzo Patriziale, Via A. Tognola 1 | 6710 Biasca | Biasca, Riviera | https://www4.ti.ch/index.php?id=29221&user_pgiudiziario_pi4%5Bbox%5D=1175&bTrova=Trova |
| Giudicatura di pace del Circolo di Rovana | Pretorio | 6675 Cevio | Bosco/Gurin, Campo (Vallemaggia), Cerentino, Cevio, Linescio | https://www4.ti.ch/index.php?id=29221&user_pgiudiziario_pi4%5Bbox%5D=1132&bTrova=Trova |
| Giudicatura di pace del Circolo di Sant'Antonino | Via Serrai 10, Casella postale | 6592 S. Antonino | Cadenazzo, Isone, Sant'Antonino | https://www4.ti.ch/index.php?id=29221&user_pgiudiziario_pi4%5Bbox%5D=1165&bTrova=Trova |
| Giudicatura di pace del Circolo di Sessa | Casella postale 10 | 6981 Banco |  | https://www4.ti.ch/index.php?id=29221&user_pgiudiziario_pi4%5Bbox%5D=1438&bTrova=Trova |
| Giudicatura di pace del Circolo di Stabio | Casa Yvette, Via Arca 40, Casella postale 633 | 6855 Stabio | Novazzano, Stabio | https://www4.ti.ch/index.php?id=29221&user_pgiudiziario_pi4%5Bbox%5D=1026&bTrova=Trova |
| Giudicatura di pace del Circolo di Taverne | Casa Comunale | 6808 Torricella-Taverne | Bedano, Gravesano, Manno, Mezzovico-Vira, Monteceneri, Torricella-Taverne | https://www4.ti.ch/index.php?id=29221&user_pgiudiziario_pi4%5Bbox%5D=1063&bTrova=Trova |
| Giudicatura di pace del Circolo di Verzasca | Casella Postale 4 | 6516 Cugnasco | Cugnasco-Gerra, Lavertezzo, Verzasca | https://www4.ti.ch/index.php?id=29221&user_pgiudiziario_pi4%5Bbox%5D=1136&bTrova=Trova |
| Giudicatura di pace del Circolo di Vezia | Via Daldini 13 | 6943 Vezia | Cadempino, Canobbio, Comano, Cureglia, Lamone, Massagno, Porza, Savosa, Sorengo, Vezia | https://www4.ti.ch/index.php?id=29221&user_pgiudiziario_pi4%5Bbox%5D=1099&bTrova=Trova |
**Pflegebedarf:** Giudici/Supplenti sind personengebunden (Amtsperioden)
— Adressen beim jährlichen Behörden-Durchgang gegen die ti.ch-Suche
prüfen; die vier kantonalen Datenlücken-Località gelegentlich neu
abfragen. **Abnahme-Status:** Erstrecherche vollerhoben an der amtlichen
Quelle (169/169 Località, 11.6.2026); fachliche Abnahme David ausstehend.

## 39. SO — Amtsgerichtspräsidien als Auffang-Schlichtungsbehörde (§ 10 GO) — VERDRAHTET 11.6.2026 (BFS-Bezirks-Join)

**Normlage WÖRTLICH verifiziert 11.6.2026** (GO SO, BGS 125.12, Stand
1.1.2026, via bgs.so.ch; Vollerhebung /tmp-Protokoll der Session):

- **§ 5 Abs. 1 GO:** «Der Friedensrichter ist die zuständige
  Schlichtungsbehörde gemäss Artikel 197 ZPO, sofern beide bzw. alle
  Parteien in derselben Gemeinde wohnen oder ihren Sitz haben.»
  (juristische Personen über den SITZ erfasst). Abs. 2 nimmt aus:
  Staat/Gemeinde als Partei · Art. 961/975 ZGB · Miete/Pacht Wohn- und
  Geschäftsräume + landwirtschaftliche Pacht (lit. d) · GlG (lit. e) ·
  Unterstützungspflicht.
- **§ 10 Abs. 1 GO:** «Der Amtsgerichtspräsident ist in allen
  Streitigkeiten, die nicht ausdrücklich einer anderen Stelle zugewiesen
  sind, die Schlichtungsbehörde nach den Bestimmungen der ZPO.»
- **Kreis-Negativprobe (so.ch, amtlich):** Auch in
  Friedensrichterkreisen bleibt der gemeinsame Friedensrichter NUR
  zuständig, wenn beide Parteien in der GLEICHEN Gemeinde wohnen —
  der Kreis erweitert die Zuständigkeit nicht.
- **§ 86 Abs. 1 GO:** Amtssitz der Friedensrichter ist die Wahlgemeinde;
  Friedensrichter sind Gemeindeorgane → Anlaufstelle ist die
  Gemeindeverwaltung (eine explizite Adress-Publikation existiert NICHT —
  ehrlich ohne Strassenadresse führen). so.ch publiziert keine
  FR-Strassenadressen; einzige bekannte Kreis-Adresse (Solothurn-Bellach,
  Baselstrasse 7) ist nur über die Gemeinde Bellach belegt — NICHT
  übernehmen.

**Deterministische Weiche (Decision-Tree):** gleiche Wohnsitz-/
Sitzgemeinde beider Parteien? JA → Friedensrichter/in dieser Gemeinde
(Anlaufstelle Gemeindeverwaltung; 10 Kreis-Zusammenschlüsse mit 29
Gemeinden ändern daran nichts) · NEIN bzw. Ausnahme nach § 5 Abs. 2 →
Amtsgerichtspräsidium des Richteramts der massgeblichen Gemeinde
(Tabelle unten). Miete/GlG laufen über die Sonder-Schlichtungsbehörden
(§§ 34bis ff. GO — bereits erfasst).

Generator-Muster wie BE: Spalte 4 trägt die BFS-BEZIRKE (Level-2-Namen
ohne Präfix «Bezirk »); plz-generieren.ts löst sie über
den BFS-Snapshot (agvchapp.bfs.admin.ch) in die 104 Gemeinden auf. Amtei-Einteilung
amtlich doppelt belegt (so.ch-Zuständigkeitslisten + Art. 43 KV SO).

| Amt | Strasse | PLZ Ort | Gemeinden | URL |
| --- | --- | --- | --- | --- |
| Richteramt Solothurn-Lebern (Amtsgerichtspräsidium) | Amthaus 2, Westbahnhofstrasse 16 | 4502 Solothurn | Solothurn, Lebern | https://so.ch/gerichte/richteraemter/richteramt-solothurn-lebern/ |
| Richteramt Bucheggberg-Wasseramt (Amtsgerichtspräsidium) | Amthaus 1, Bielstrasse 1 | 4502 Solothurn | Bucheggberg, Wasseramt | https://so.ch/gerichte/richteraemter/richteramt-bucheggberg-wasseramt/ |
| Richteramt Thal-Gäu (Amtsgerichtspräsidium) | Schmelzihof, Wengimattstrasse 2 | 4710 Balsthal | Thal, Gäu | https://so.ch/gerichte/richteraemter/richteramt-thal-gaeu/ |
| Richteramt Olten-Gösgen (Amtsgerichtspräsidium) | Römerstrasse 2 | 4600 Olten | Olten, Gösgen | https://so.ch/gerichte/richteraemter/richteramt-olten-goesgen/ |
| Richteramt Dorneck-Thierstein (Amtsgerichtspräsidium) | Amthausstrasse 15 | 4143 Dornach | Dorneck, Thierstein | https://so.ch/gerichte/richteraemter/richteramt-dorneck-thierstein/ |

**Friedensrichter-Kreise (10, Stand inkl. GVK 23.2.2026 — als Liste,
parser-unsichtbar; massgeblich bleibt die GLEICHE Gemeinde):**

- Unterer Leberberg (Sitz Flumenthal): Flumenthal, Günsberg, Hubersdorf, Riedholz
- Gäu (Egerkingen): Egerkingen, Härkingen, Neuendorf, Niederbuchsiten, Oberbuchsiten (Erweiterung GVK 23.2.2026)
- Niederamt (Schönenwerd): Schönenwerd, Gretzenbach, Eppenberg-Wöschnau
- Bärschwil-Erschwil-Grindel (Erschwil) · Erlinsbach-Kienberg (Erlinsbach SO) · Solothurn-Bellach (Solothurn) · Wartenfels (Lostorf) · Fehren-Himmelried (Fehren) · Unterer Hauenstein (Trimbach): Trimbach, Hauenstein-Ifenthal, Wisen, Winznau · Derendingen-Luterbach (Derendingen, GVK 18.8.2025)

**Pflegebedarf:** GVK-Genehmigungen neuer Kreis-Zusammenschlüsse
(laufend, zuletzt 23.2.2026/18.8.2025) — jährlich mit dem
Behörden-Durchgang; so.ch-Zuständigkeitsliste führt teils
Alt-Gemeindenamen (Fusions-Mapping: Halten/Oekingen→Kriegstetten 2026 ·
Lüterswil-Gächliwil→Buchegg 2024 · Gänsbrunnen/Welschenrohr→
Welschenrohr-Gänsbrunnen 2021 · Rohr→Stüsslingen 2021 — alle
richteramts-intern). **Abnahme-Status:** Norm + Adressen Erstrecherche
wörtlich am amtlichen Erlass/so.ch (11.6.2026); Abnahme David ausstehend.

## 40. VS — Juge de commune / Gemeinderichter: Anlaufstelle Gemeindeverwaltung (122 Gemeinden) — VERDRAHTET 11.6.2026 (Einzelerhebung)


**Abrufdatum:** 11.06.2026

**Quellen:**
1. Amtliche Namensliste der Richter/Vizerichter je Gemeinde (nur Namen, keine Adressen): https://www.vs.ch/web/communes/juges-vice-juges (verlinkt von https://www.vs.ch/web/tribunaux/liste-de-juges-et-vice-juges-de-commune)
2. Kantonales Gemeindeverzeichnis (Detailseiten je Gemeinde, ohne Postadressen — liefert amtliche Gemeinde-Websites): https://www.vs.ch/web/communes/commune
3. Postadressen: amtliche Website jeder einzelnen Gemeinde (alle 122 einzeln abgerufen; Footer/Kontakt/Impressum bzw. bei Megaphone-CMS-Sites der JSON-Endpunkt api.megaphone.info/v1/websites?domain=…, Feld configs.footer.attributes.addressComponents)
4. Gemeindebestand validiert gegen BFS (Level 3 unter Kanton VS, ValidTo leer): 122 Gemeinden, Stand 2026

**Methodik:** Keine kantonale Zentralliste mit Strassenadressen vorhanden (vs.ch-Annuaire nur Staatspersonal; opendata.swiss-Datensatz «Adressen der Gemeindeverwaltungen» betrifft nur BL). Daher Auto-Auflösung über das kantonale Verzeichnis (Slug→amtliche Website) und Einzelerhebung aller 122 Gemeinde-Websites; 12 JS-gerenderte Sites (Megaphone-CMS) über den dahinterliegenden JSON-Endpunkt erhoben. Jede Zeile gegen die BFS-Gemeindeliste validiert (122/122, 0 Lücken).

**Gemeinden ohne auffindbare amtliche Strassenadresse (Gemeinde publiziert selbst keine Strasse/Hausnummer):** Baltschieder (nur «3937 Baltschieder»), Bellwald (nur «3997 Bellwald»), Grächen («Dorfplatz» ohne Nr.), Saas-Almagell («Dorfplatz» ohne Nr.), Ardon («Place Saint-Jean» ohne Nr.), Anniviers/Salvan/Unterbäch (nur Postfach/Case postale — für Postzustellung korrekt).

**Sonderfälle:** Blatten: Verwaltung seit 28.05.2025 (Bergsturz) c/o Gemeindeverwaltung Wiler, Dorfstrasse 24, 3918 Wiler (Lötschen). Leuk: Verwaltung in Susten (3952). Riederalp: Verwaltung in Ried-Mörel (3986). Conthey: Verwaltung in St-Séverin (1975). Goms: Verwaltung in Gluringen (3998). Obergoms: Verwaltung in Obergesteln (3988). Mont-Noble: Verwaltung in Nax (1973). Noble-Contrée: Verwaltung in Veyras (3968). Port-Valais: Verwaltung in Le Bouveret (1897). Zwischbergen: Verwaltung in Gondo (3907). Nendaz: Basse-Nendaz (1996). Val de Bagnes: Le Châble (1934). Martigny-Combe: Martigny-Croix (1921).

| Amt | Strasse | PLZ Ort | Gemeinden | URL |
|---|---|---|---|---|
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Agarn) | Alte Kantonsstrasse 14, Postfach 17 | 3951 Agarn | Agarn | https://www.agarn.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Albinen) | Torrentstrasse 49 | 3955 Albinen | Albinen | https://www.albinen.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Anniviers) | Case postale 46 | 3961 Vissoie | Anniviers | https://www.anniviers.org |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Arbaz) | Rte du Village 14 | 1974 Arbaz | Arbaz | https://www.arbaz.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Ardon) | Place Saint-Jean | 1957 Ardon | Ardon | https://www.ardon.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Ausserberg) | Dorfstrasse 71 | 3938 Ausserberg | Ausserberg | https://www.ausserberg.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Ayent) | Rte d'Anzère 1 | 1966 Ayent | Ayent | https://www.ayent.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Baltschieder) |  | 3937 Baltschieder | Baltschieder | https://www.baltschieder.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Bellwald) |  | 3997 Bellwald | Bellwald | https://gemeinde.bellwald.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Bettmeralp) | Hauptstrasse 156 | 3992 Bettmeralp | Bettmeralp | https://gemeinde.bettmeralp.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Binn) | Dorfstrasse 11 | 3996 Binn | Binn | https://www.binn.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Bister) | Kantonsstrasse 50 | 3983 Bister | Bister | https://www.bister.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Bitsch) | Furkastrasse 88 | 3982 Bitsch | Bitsch | https://www.bitsch.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Blatten) | c/o Gemeindeverwaltung Wiler, Dorfstrasse 24 | 3918 Wiler (Lötschen) | Blatten | https://www.blatten.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Bourg-Saint-Pierre) | Route de Raveire 5 | 1946 Bourg-St-Pierre | Bourg-Saint-Pierre | https://www.bourg-st-pierre.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Bovernier) | Rue Principale 105 | 1932 Bovernier | Bovernier | https://www.bovernier.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Brig-Glis) | Alte Simplonstrasse 28 | 3900 Brig | Brig-Glis | https://www.brig-glis.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Bürchen) | Haselstrasse 42 | 3935 Bürchen | Bürchen | https://www.buerchen.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Chalais) | Route de l'Eglise 10 B | 3966 Chalais | Chalais | https://www.chalais.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Chamoson) | Chemin Neuf 9 | 1955 Chamoson | Chamoson | https://www.chamoson.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Champéry) | Rue du Village 46, Case postale 54 | 1874 Champéry | Champéry | https://www.champery.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Chippis) | Grande Avenue 5, Case postale 24 | 3965 Chippis | Chippis | https://www.chippis.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Collombey-Muraz) | Rue des Dents-du-Midi 44, Case postale 246 | 1868 Collombey | Collombey-Muraz | https://www.collombey-muraz.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Collonges) | Rue Sainte-Anne 5 | 1903 Collonges | Collonges | https://www.collonges.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Conthey) | Route de Savoie 54 | 1975 St-Séverin | Conthey | https://www.conthey.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Crans-Montana) | Avenue de la Gare 20, Case postale 308 | 3963 Crans-Montana 1 | Crans-Montana | https://www.cransmontana.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Dorénaz) | Rue de la Mairie 17 | 1905 Dorénaz | Dorénaz | https://www.dorenaz.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Eggerberg) | Bahnhofstrasse 2 | 3939 Eggerberg | Eggerberg | https://www.eggerberg.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Eischoll) | Dorfstrasse 54 | 3943 Eischoll | Eischoll | https://gemeinde.eischoll.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Eisten) | Zenschmieden 6 | 3922 Eisten | Eisten | https://www.eisten.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Embd) | Kirchweg 18 | 3926 Embd | Embd | https://www.embd.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Ergisch) | Mitteldorf 12 | 3947 Ergisch | Ergisch | https://www.ergisch.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Ernen) | Hengert 1 | 3995 Ernen | Ernen | https://www.ernen.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Evionnaz) | Rue principale 26, Case postale 13 | 1902 Evionnaz | Evionnaz | https://www.evionnaz.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Evolène) | Rue Centrale 216, Case postale 83 | 1983 Evolène | Evolène | https://www.commune-evolene.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Ferden) | Leischa 1b | 3916 Ferden | Ferden | https://www.ferden.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Fiesch) | Furkastrasse 44 | 3984 Fiesch | Fiesch | https://www.fiesch.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Fieschertal) | Dorfplatz 6 | 3984 Fieschertal | Fieschertal | https://www.fieschertal.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Finhaut) | Place de l'Eglise 3 | 1925 Finhaut | Finhaut | https://www.finhaut.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Fully) | Rue de l'Eglise 46 | 1926 Fully | Fully | https://www.fully.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Gampel-Bratsch) | Kirchstrasse 6 | 3945 Gampel | Gampel-Bratsch | https://www.gampel-bratsch.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Goms) | Furkastrasse 399 | 3998 Gluringen | Goms | https://www.gemeinde-goms.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Grengiols) | Heerstrasse 2 | 3993 Grengiols | Grengiols | https://www.grengiols.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Grimisuat) | Place Mgr Gabriel Balet 1 | 1971 Grimisuat | Grimisuat | https://www.grimisuat.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Grächen) | Dorfplatz | 3925 Grächen | Grächen | https://www.gemeinde-graechen.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Grône) | Rue Centrale 182 | 3979 Grône | Grône | https://www.grone.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Guttet-Feschel) | Kirchstrasse 2 | 3956 Guttet-Feschel | Guttet-Feschel | https://www.guttet-feschel.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Hérémence) | Rue de l'Eglise 14, Case postale 16 | 1987 Hérémence | Hérémence | https://www.heremence.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Icogne) | Rte de la Bourgeoisie 7 | 1977 Icogne | Icogne | https://www.icogne.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Inden) | Hauptstrasse 41 | 3953 Inden | Inden | https://www.inden.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Isérables) | Place de la Maison de Commune 1 | 1914 Isérables | Isérables | https://www.iserables.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Kippel) | Hauptstrasse 61 | 3917 Kippel | Kippel | https://www.kippel.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Lalden) | Dorfstrasse 60 | 3931 Lalden | Lalden | https://www.lalden.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Lax) | Furkastrasse 46 | 3994 Lax | Lax | https://www.lax.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Lens) | Place du Village 1 | 1978 Lens | Lens | https://www.lens.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Leuk) | Sustenstrasse 3 | 3952 Susten | Leuk | https://www.leuk.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Leukerbad) | Ringstrasse 85, Postfach 346 | 3954 Leukerbad | Leukerbad | https://www.leukerbad.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Leytron) | Place de la Maison de Commune 1 | 1912 Leytron | Leytron | https://www.leytron.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Liddes) | Rue du Fond de Ville 46 | 1945 Liddes | Liddes | https://www.liddes.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Martigny) | Hôtel de Ville 1, Case postale 176 | 1920 Martigny | Martigny | https://www.martigny.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Martigny-Combe) | Route de la Croix 32, Case postale 25 | 1921 Martigny-Croix | Martigny-Combe | https://www.martigny-combe.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Massongex) | Place de l'Eglise 1 | 1869 Massongex | Massongex | https://www.massongex.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Mont-Noble) | La Vaye-Plane 13, Case postale 11 | 1973 Nax | Mont-Noble | https://www.mont-noble.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Monthey) | Place de l'Hôtel-de-Ville 2, Case postale 512 | 1870 Monthey 1 | Monthey | https://www.monthey.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Mörel-Filet) | Furkastrasse 39 | 3983 Mörel-Filet | Mörel-Filet | https://www.moerel-filet.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Naters) | Bahnhofstrasse 9a | 3904 Naters | Naters | https://www.naters.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Nendaz) | Route de Nendaz 352 | 1996 Basse-Nendaz | Nendaz | https://www.nendaz.org |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Niedergesteln) | Pfarreigasse 10 | 3942 Niedergesteln | Niedergesteln | https://www.niedergesteln.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Noble-Contrée) | Avenue St-François 6 | 3968 Veyras | Noble-Contrée | https://www.noble-contree.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Oberems) | Moosmattenstrasse 3 | 3948 Oberems | Oberems | https://www.oberems.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Obergoms) | Bahnhofstrasse 1 | 3988 Obergesteln | Obergoms | https://gemeinde.obergoms.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Orsières) | Rue de la Commune 3 | 1937 Orsières | Orsières | https://www.orsieres.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Port-Valais) | Place de la Gare, Case postale 28 | 1897 Le Bouveret | Port-Valais | https://www.port-valais.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Randa) | Dorfstrasse 138 | 3928 Randa | Randa | https://www.randa.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Raron) | Gemeindezentrum Scheibenmoos, Theaterstrasse 4, Postfach 53 | 3942 Raron | Raron | https://www.raron.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Riddes) | Rue du Village 2 | 1908 Riddes | Riddes | https://www.riddes.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Ried-Brig) | Dorfstrasse 43 | 3911 Ried-Brig | Ried-Brig | https://www.ried-brig.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Riederalp) | Schulhausweg 1 | 3986 Ried-Mörel | Riederalp | https://www.gemeinde-riederalp.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Saas-Almagell) | Dorfplatz | 3905 Saas-Almagell | Saas-Almagell | https://www.saas-almagell.org |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Saas-Balen) | Dorfstrasse 1 | 3908 Saas-Balen | Saas-Balen | https://www.saas-balen.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Saas-Fee) | Dorfplatz 8 | 3906 Saas-Fee | Saas-Fee | https://www.gemeinde-saas-fee.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Saas-Grund) | Saastalstrasse 390 | 3910 Saas-Grund | Saas-Grund | https://www.saas-grund.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Saillon) | Rue du Bourg 19 | 1913 Saillon | Saillon | https://www.saillon.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Saint-Gingolph) | Place de la Croix-Blanche 1, Case postale 1 | 1898 St-Gingolph | Saint-Gingolph | https://www.st-gingolph.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Saint-Léonard) | Rue Centrale 22 | 1958 St-Léonard | Saint-Léonard | https://www.st-leonard.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Saint-Martin (VS)) | Rue de l'Eglise 5 | 1969 St-Martin | Saint-Martin (VS) | https://www.saint-martin.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Saint-Maurice) | Chemin de la Tuilerie 3, Case postale 83 | 1890 Saint-Maurice | Saint-Maurice | https://www.st-maurice.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Salgesch) | Klareistrasse 1 | 3970 Salgesch | Salgesch | https://www.salgesch.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Salvan) | Case postale 10 | 1922 Salvan | Salvan | https://www.salvan.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Savièse) | Rue de St-Germain 50, Case postale 32 | 1965 Savièse | Savièse | https://www.saviese.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Saxon) | Route du Village 42 | 1907 Saxon | Saxon | https://www.saxon.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Sembrancher) | Rue Principale 24 | 1933 Sembrancher | Sembrancher | https://www.sembrancher.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Sierre) | Rue du Bourg 14, Case postale 96 | 3960 Sierre | Sierre | https://www.sierre.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Simplon) | Dorfplatz 25 | 3907 Simplon Dorf | Simplon | https://www.simplon.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Sion) | Hôtel de Ville, Rue du Grand-Pont 12, Case postale 2272 | 1950 Sion 2 | Sion | https://www.sion.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung St. Niklaus) | Talstrasse 31 | 3924 St. Niklaus | St. Niklaus | https://www.st-niklaus.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Stalden (VS)) | Märtplatz 7 | 3922 Stalden | Stalden (VS) | https://www.stalden.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Staldenried) | Zer Chirchu 58 | 3933 Staldenried | Staldenried | https://www.staldenried.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Steg-Hohtenn) | Kirchstrasse 37 | 3940 Steg | Steg-Hohtenn | https://www.steg.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Termen) | Termerstrasse 6 | 3912 Termen | Termen | https://www.termen.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Trient) | Gilliod 27 | 1929 Trient | Trient | https://www.trient.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Troistorrents) | Place du Village 1, Case postale 65 | 1872 Troistorrents | Troistorrents | https://www.troistorrents.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Turtmann-Unterems) | Dorfstrasse 26, Postfach 18 | 3946 Turtmann | Turtmann-Unterems | https://www.turtmann-unterems.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Täsch) | Dorfstrasse 5 | 3929 Täsch | Täsch | https://www.taesch.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Törbel) | Wegsolstrasse 17 | 3923 Törbel | Törbel | https://www.toerbel.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Unterbäch) | Postfach 17 | 3944 Unterbäch | Unterbäch | https://www.unterbaech.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Val de Bagnes) | Route de Clouchèvre 44 | 1934 Le Châble VS | Val de Bagnes | https://www.valdebagnes.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Val-d'Illiez) | Route de Proz 4 | 1873 Val-d'Illiez | Val-d'Illiez | https://www.illiez.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Varen) | Dorfstrasse 35 | 3953 Varen | Varen | https://www.varen.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Vernayaz) | Rue du Collège 10 | 1904 Vernayaz | Vernayaz | https://www.vernayaz.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Vex) | Route de Sion 10, Case postale 79 | 1981 Vex | Vex | https://www.vex.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Veysonnaz) | Rue Centre du Village 17 | 1993 Veysonnaz | Veysonnaz | https://www.veysonnaz.org |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Vionnaz) | Rue du Pavé 14 | 1895 Vionnaz | Vionnaz | https://www.vionnaz.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Visp) | St. Martiniplatz 1 | 3930 Visp | Visp | https://www.visp.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Visperterminen) | Kanzleiweg 8 | 3932 Visperterminen | Visperterminen | https://www.visperterminen.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Vouvry) | Grand'Rue 25 | 1896 Vouvry | Vouvry | https://www.vouvry.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Vérossaz) | Place communale 1, Case postale 22 | 1891 Vérossaz | Vérossaz | https://www.verossaz.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Vétroz) | Rue des Pêcheurs 12 | 1963 Vétroz | Vétroz | https://www.vetroz.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Wiler (Lötschen)) | Dorfstrasse 24 | 3918 Wiler | Wiler (Lötschen) | https://www.wiler.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Zeneggen) | Dorfstrasse 53 | 3934 Zeneggen | Zeneggen | https://www.zeneggen.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Zermatt) | Gemeindehaus, Kirchplatz 3, Postfach 345 | 3920 Zermatt | Zermatt | https://www.gemeinde.zermatt.ch |
| Juge de commune / Gemeinderichter (Anlaufstelle Gemeindeverwaltung Zwischbergen) | Simplonstrasse 34 | 3907 Gondo | Zwischbergen | https://www.zwischbergen.ch |

**Pflegebedarf:** Gemeindeverwaltungs-Adressen wandern bei Fusionen/Umzügen (Sonderfall Blatten c/o Wiler seit Bergsturz 28.5.2025 — bei Wiederaufbau prüfen); jährlicher Behörden-Durchgang. **Abnahme-Status:** Erstrecherche, alle 122 an der amtlichen Gemeinde-Website erhoben (11.6.2026); Abnahme David ausstehend.

## 41. VD-MIETE — 10 Commissions préfectorales de conciliation (eine je District, bei der Préfecture)

Quelle: vd.ch Préfectures-Sammelseite + alle 10 Préfecture-Detailseiten einzeln (11.6.2026); District-Kongruenz amtlich («une commission … dans chaque district»). Spalte 4 = BFS-Districts (präfixfrei; Join im Generator). Besonderheit: Antenne Château-d’Oex der Préfecture Riviera; amtliche Postfach-PLZ-Formen («Morges 1», «Nyon 2», «Renens 1») übernommen.

| Amt | Strasse | PLZ Ort | Gemeinden | URL |
| --- | --- | --- | --- | --- |
| Commission préfectorale de conciliation (Préfecture d'Aigle) | Place du Marché 2 | 1860 Aigle | Aigle | https://www.vd.ch/etat-droit-finances/districts-/-prefectures/prefectures/aigle |
| Commission préfectorale de conciliation (Préfecture de la Broye-Vully) | Rue du Temple 6, Case postale 336 | 1530 Payerne | Broye-Vully | https://www.vd.ch/etat-droit-finances/districts-/-prefectures/prefectures/broye-vully |
| Commission préfectorale de conciliation (Préfecture du Gros-de-Vaud) | Place Emile Gardaz 8 | 1040 Echallens | Gros-de-Vaud | https://www.vd.ch/etat-droit-finances/districts-/-prefectures/prefectures/gros-de-vaud |
| Commission préfectorale de conciliation (Préfecture du Jura-Nord vaudois) | Rue des Moulins 10, Case postale | 1401 Yverdon-les-Bains | Jura-Nord vaudois | https://www.vd.ch/etat-droit-finances/districts-/-prefectures/prefectures/jura-nord-vaudois |
| Commission préfectorale de conciliation (Préfecture de Lausanne) | Place du Château 1 | 1014 Lausanne | Lausanne | https://www.vd.ch/etat-droit-finances/districts-/-prefectures/prefectures/lausanne |
| Commission préfectorale de conciliation (Préfecture de Lavaux-Oron) | Chemin de Versailles 6 | 1096 Cully | Lavaux-Oron | https://www.vd.ch/etat-droit-finances/districts-/-prefectures/prefectures/lavaux-oron |
| Commission préfectorale de conciliation (Préfecture de Morges) | Place Saint-Louis 4 | 1110 Morges 1 | Morges | https://www.vd.ch/etat-droit-finances/districts-/-prefectures/prefectures/morges |
| Commission préfectorale de conciliation (Préfecture de Nyon) | Rue Juste-Olivier 8, Case postale | 1260 Nyon 2 | Nyon | https://www.vd.ch/etat-droit-finances/districts-/-prefectures/prefectures/nyon |
| Commission préfectorale de conciliation (Préfecture de l'Ouest lausannois) | Rue de Verdeaux 2, Case postale 285 | 1020 Renens 1 | Ouest lausannois | https://www.vd.ch/etat-droit-finances/districts-/-prefectures/prefectures/ouest-lausannois |
| Commission préfectorale de conciliation (Préfecture de la Riviera-Pays-d'Enhaut) | Rue du Simplon 22 | 1800 Vevey | Riviera-Pays-d'Enhaut | https://www.vd.ch/etat-droit-finances/districts-/-prefectures/prefectures/riviera-pays-denhaut |

## 42. FR-MIETE — DREI Schlichtungskommissionen Miete/Pacht (Bezirks-Gruppen — Korrektur zur 5.6.-Annahme «je Bezirk»)

Quelle: fr.ch Justizseite + Staatskalender-Detailseiten (11.6.2026). NICHT je Bezirk und nicht zentral: Saane (CCBSA) · Sense+See (CCBSL, Sitz Tafers nur Postfach) · Süd-Bezirke Greyerz/Glane/Broye/Vivisbach (CCBSUD, Romont). Spalte 4 = BFS-Bezirke (mehrere je Zeile, präfixfrei normalisiert; Join im Generator). Artikel-Nr. im RSF 130.1 nicht maschinell zitierbar — OFFEN.

| Amt | Strasse | PLZ Ort | Gemeinden | URL |
| --- | --- | --- | --- | --- |
| Commission de conciliation en matière de bail à loyer du district de la Sarine (CCBSA) | Grand-Rue 27 | 1700 Fribourg | La Sarine | https://www.fr.ch/cha/app/gescom_com/OTAxLTE1MjY |
| Commission de conciliation en matière de bail à loyer des districts de la Singine et du Lac (CCBSL) / Mietschlichtungskommission Sense und See | Case postale 96 | 1712 Tafers | Sense, See / Lac | https://www.fr.ch/cha/app/gescom_com/OTAxLTE1Mjc |
| Commission de conciliation en matière de bail à loyer des districts du Sud (CCBSUD) | Rue des Moines 58, Case postale 160 | 1680 Romont | La Gruyère, La Glâne, La Broye, La Veveyse | https://www.fr.ch/cha/app/gescom_com/OTAxLTE1Mjg |

## 43. GR-MIETE — 11 Schlichtungsbehörden für Mietsachen (je Region)

Quelle: justiz-gr.ch Mietsachen-Seite, führt selbst alle 11 Adressen (Roh-HTML wörtlich, 11.6.2026). WICHTIG: Mietsachen-Adressen ≠ Regionalgerichts-Adressen (Imboden/Plessur/Prättigau-Davos abweichend; Imboden + Prättigau/Davos nur Postfach) — massgeblich ist die Mietsachen-Sammelseite. Spalte 4 = BFS-Regionen (Join im Generator).

| Amt | Strasse | PLZ Ort | Gemeinden | URL |
| --- | --- | --- | --- | --- |
| Schlichtungsbehörde Mietsachen Albula | Stradung 26 | 7450 Tiefencastel | Albula | https://www.justiz-gr.ch/schlichtungsbehoerden-und-mediation/ueber-uns/mietsachen/ |
| Schlichtungsbehörde Mietsachen Bernina | Via da la Pesa 8 | 7742 Poschiavo | Bernina | https://www.justiz-gr.ch/schlichtungsbehoerden-und-mediation/ueber-uns/mietsachen/ |
| Schlichtungsbehörde Mietsachen Engiadina Bassa/Val Müstair | Saglina 22 | 7554 Sent | Engiadina Bassa / Val Müstair | https://www.justiz-gr.ch/schlichtungsbehoerden-und-mediation/ueber-uns/mietsachen/ |
| Schlichtungsbehörde Mietsachen Imboden | Postfach 308 | 7001 Chur | Imboden | https://www.justiz-gr.ch/schlichtungsbehoerden-und-mediation/ueber-uns/mietsachen/ |
| Schlichtungsbehörde Mietsachen Landquart | Bahnhofplatz 2b, Postfach 244 | 7302 Landquart | Landquart | https://www.justiz-gr.ch/schlichtungsbehoerden-und-mediation/ueber-uns/mietsachen/ |
| Schlichtungsbehörde Mietsachen Maloja | Plazza da Scuola 16 | 7500 St. Moritz | Maloja | https://www.justiz-gr.ch/schlichtungsbehoerden-und-mediation/ueber-uns/mietsachen/ |
| Schlichtungsbehörde Mietsachen Moesa | Centro regionale dei servizi, Al Giardinètt 2 | 6535 Roveredo | Moesa | https://www.justiz-gr.ch/schlichtungsbehoerden-und-mediation/ueber-uns/mietsachen/ |
| Schlichtungsbehörde Mietsachen Plessur | Bärenloch 1, Postfach 290 | 7001 Chur | Plessur | https://www.justiz-gr.ch/schlichtungsbehoerden-und-mediation/ueber-uns/mietsachen/ |
| Schlichtungsbehörde Mietsachen Prättigau/Davos | Postfach 125 | 7250 Klosters | Prättigau / Davos | https://www.justiz-gr.ch/schlichtungsbehoerden-und-mediation/ueber-uns/mietsachen/ |
| Schlichtungsbehörde Mietsachen Surselva | Via Centrala 4 | 7130 Ilanz/Glion | Surselva | https://www.justiz-gr.ch/schlichtungsbehoerden-und-mediation/ueber-uns/mietsachen/ |
| Schlichtungsbehörde Mietsachen Viamala | Rathaus, Untere Gasse 1 | 7430 Thusis | Viamala | https://www.justiz-gr.ch/schlichtungsbehoerden-und-mediation/ueber-uns/mietsachen/ |

## 44. SZ-MIETE — 6 Bezirks-Schlichtungsbehörden Miete/Pacht

Quelle: sz.ch-Verzeichnis + 6 amtliche Bezirksseiten einzeln (11.6.2026). Höfe ohne Strasse (nur Postfach 43, Pfäffikon); Küssnacht ohne Postfach-Nr.; ein unbelegtes «Postfach 59» Gersau bewusst weggelassen. Spalte 4 = BFS-Bezirke (Join im Generator).

| Amt | Strasse | PLZ Ort | Gemeinden | URL |
| --- | --- | --- | --- | --- |
| Schlichtungsbehörde im Mietwesen Bezirk Einsiedeln | Paracelsuspark 3, Postfach 161 | 8840 Einsiedeln | Einsiedeln | https://www.einsiedeln.ch/justiz/schlichtungsbehoerde-im-mietwesen |
| Schlichtungsbehörde im Mietwesen Bezirk Gersau | c/o Bezirksverwaltung, Ausserdorfstrasse 7 | 6442 Gersau | Gersau | https://www.gersau.ch/topics/behoerden-politik/justiz-gericht/schlichtungsbehoerde-im-mietwesen |
| Schlichtungsbehörde im Mietwesen Höfe | Postfach 43 | 8808 Pfäffikon | Höfe | https://www.hoefe.ch/de/judikative/mietschlichtung/ |
| Schlichtungsbehörde in Mietsachen des Bezirks Küssnacht | Breitfeld 15 | 6403 Küssnacht | Küssnacht (SZ) | https://www.kuessnacht.ch/justiz/schlichtungsbehoerde-in-mietsachen.html/262 |
| Schlichtungsbehörde in Mietsachen Bezirk March (Sekretariat) | Rathausplatz 1, Postfach 531 | 8853 Lachen | March | https://www.bezirk-march.ch/behoerden/4644 |
| Schlichtungsbehörde im Mietwesen Bezirk Schwyz | Bahnhofstrasse 4, Postfach 547 | 6431 Schwyz | Schwyz | https://bezirk-schwyz.ch/schlichtungsbehoerde-im-mietwesen/ |

## 45. AG-MIETE — 11 Schlichtungsbehörden für Miete und Pacht (je Bezirk)

Quelle: ag.ch «Schlichtungsbehörden nach Bezirken» (publiziert 1.4.2026, Abruf 11.6.2026) + Behördenverzeichnis-Detailseiten. Kongruenz mit den 11 BFS-Bezirken bestätigt. Spalte 4 = BFS-Bezirke (Join im Generator).

| Amt | Strasse | PLZ Ort | Gemeinden | URL |
| --- | --- | --- | --- | --- |
| Schlichtungsbehörde für Miete und Pacht Bezirk Aarau | Obere Vorstadt 37, Postfach | 5001 Aarau | Aarau | https://www.ag.ch/de/ueber-uns/kontakt/behoerdenverzeichnis?rewriteRemoteUrl=/organisations/GKA-Bezirk-Aarau |
| Schlichtungsbehörde für Miete und Pacht Bezirk Baden | Rütistrasse 3 | 5400 Baden | Baden | https://www.ag.ch/de/ueber-uns/kontakt/behoerdenverzeichnis?rewriteRemoteUrl=/organisations/GKA-Bezirk-Baden |
| Schlichtungsbehörde für Miete und Pacht Bezirk Bremgarten | Rathausplatz 1, Postfach | 5620 Bremgarten | Bremgarten | https://www.ag.ch/de/ueber-uns/kontakt/behoerdenverzeichnis?rewriteRemoteUrl=/organisations/Bezirk-Bremgarten |
| Schlichtungsbehörde für Miete und Pacht Bezirk Brugg | Untere Hofstatt 4 | 5200 Brugg | Brugg | https://www.ag.ch/de/ueber-uns/kontakt/behoerdenverzeichnis?rewriteRemoteUrl=/organisations/GKA-Bezirk-Brugg |
| Schlichtungsbehörde für Miete und Pacht Bezirk Kulm | Bezirksgebäude, Zentrumsplatz 3, Postfach | 5726 Unterkulm | Kulm | https://www.ag.ch/de/ueber-uns/kontakt/behoerdenverzeichnis?rewriteRemoteUrl=/organisations/GKA-Bezirk-Kulm |
| Schlichtungsbehörde für Miete und Pacht Bezirk Laufenburg | Gerichtsgasse 85 | 5080 Laufenburg | Laufenburg | https://www.ag.ch/de/ueber-uns/kontakt/behoerdenverzeichnis?rewriteRemoteUrl=/organisations/GKA-Bezirk-Laufenburg |
| Schlichtungsbehörde für Miete und Pacht Bezirk Lenzburg | Malagarain 2 | 5600 Lenzburg | Lenzburg | https://www.ag.ch/de/ueber-uns/kontakt/behoerdenverzeichnis?rewriteRemoteUrl=/organisations/GKA-Bezirk-Lenzburg |
| Schlichtungsbehörde für Miete und Pacht Bezirk Muri | Seetalstrasse 8 | 5630 Muri | Muri | https://www.ag.ch/de/ueber-uns/kontakt/behoerdenverzeichnis?rewriteRemoteUrl=/organisations/Bezirk-Muri |
| Schlichtungsbehörde für Miete und Pacht Bezirk Rheinfelden | Hermann Keller-Strasse 6 | 4310 Rheinfelden | Rheinfelden | https://www.ag.ch/de/ueber-uns/kontakt/behoerdenverzeichnis?rewriteRemoteUrl=/organisations/GKA-Bezirk-Rheinfelden |
| Schlichtungsbehörde für Miete und Pacht Bezirk Zofingen | Bahnhofplatz/Untere Grabenstrasse 30 | 4800 Zofingen | Zofingen | https://www.ag.ch/de/ueber-uns/kontakt/behoerdenverzeichnis?rewriteRemoteUrl=/organisations/GKA-Bezirk-Zofingen |
| Schlichtungsbehörde für Miete und Pacht Bezirk Zurzach | Hauptstrasse 50 | 5330 Bad Zurzach | Zurzach | https://www.ag.ch/de/ueber-uns/kontakt/behoerdenverzeichnis?rewriteRemoteUrl=/organisations/Bezirk-Zurzach |

## 46. SG-MIETE — 7 Schlichtungsstellen für Miet- und Pachtverhältnisse (Gerichtskreise)

Quelle: sg.ch (Stand 15.4.2026) + Gerichtsgesetz sGS 941.1 Art. 3 (PDF). Gerichtskreis = Wahlkreis, ABER Werdenberg+Sarganserland zusammengelegt (8 Wahlkreise → 7 Stellen). Spalte 4 = BFS-Wahlkreise (mit Präfix «Wahlkreis», mehrere je Zeile möglich; Join im Generator). Nur eine Sammel-Detailseite für alle 7.

| Amt | Strasse | PLZ Ort | Gemeinden | URL |
| --- | --- | --- | --- | --- |
| Schlichtungsstelle für Miet- und Pachtverhältnisse St.Gallen | Wohnungsamt, Rathaus | 9001 St.Gallen | Wahlkreis St. Gallen | https://www.sg.ch/recht/gerichte/organisation---standorte/schlichtungsstellen-und-vermittlungsaemter/schlichtungsstellen-fuer-miet--und-pachtverhaeltnisse.html |
| Schlichtungsstelle für Miet- und Pachtverhältnisse Rorschach | Hauptstrasse 29 | 9401 Rorschach | Wahlkreis Rorschach | https://www.sg.ch/recht/gerichte/organisation---standorte/schlichtungsstellen-und-vermittlungsaemter/schlichtungsstellen-fuer-miet--und-pachtverhaeltnisse.html |
| Schlichtungsstelle für Miet- und Pachtverhältnisse Rheintal | Rathausplatz 2 | 9450 Altstätten | Wahlkreis Rheintal | https://www.sg.ch/recht/gerichte/organisation---standorte/schlichtungsstellen-und-vermittlungsaemter/schlichtungsstellen-fuer-miet--und-pachtverhaeltnisse.html |
| Schlichtungsstelle für Miet- und Pachtverhältnisse Werdenberg-Sarganserland | St. Gallerstrasse 2 | 9471 Buchs SG | Wahlkreis Werdenberg, Wahlkreis Sarganserland | https://www.sg.ch/recht/gerichte/organisation---standorte/schlichtungsstellen-und-vermittlungsaemter/schlichtungsstellen-fuer-miet--und-pachtverhaeltnisse.html |
| Schlichtungsstelle für Miet- und Pachtverhältnisse See-Gaster | St.Gallerstrasse 40 | 8645 Jona | Wahlkreis See-Gaster | https://www.sg.ch/recht/gerichte/organisation---standorte/schlichtungsstellen-und-vermittlungsaemter/schlichtungsstellen-fuer-miet--und-pachtverhaeltnisse.html |
| Schlichtungsstelle für Miet- und Pachtverhältnisse Toggenburg | Grundbuchamt, Grüenaustrasse 7 | 9630 Wattwil | Wahlkreis Toggenburg | https://www.sg.ch/recht/gerichte/organisation---standorte/schlichtungsstellen-und-vermittlungsaemter/schlichtungsstellen-fuer-miet--und-pachtverhaeltnisse.html |
| Schlichtungsstelle für Miet- und Pachtverhältnisse Wil | Marktgasse 58 | 9500 Wil | Wahlkreis Wil | https://www.sg.ch/recht/gerichte/organisation---standorte/schlichtungsstellen-und-vermittlungsaemter/schlichtungsstellen-fuer-miet--und-pachtverhaeltnisse.html |

## 47. TG-MIETE — 80 kommunale Schlichtungsbehörden in Mietsachen (TG-Sonderfall, je politische Gemeinde)

Quelle: amtliche Liste erechtsverkehr.tg.ch/7980 (Abruf 11.6.2026; führt KEINE Adressen) + alle 80 verlinkten tg.ch-Kontaktseiten maschinell (Rate-Limit-Backoff). 80/80 mit Adresse, 1:1 gegen BFS validiert. 49/80 mit Sitz bei fremder/geteilter Verwaltung (z. B. Ermatingen → geführt bei Kreuzlingen; Sammelsekretariate). Defekter amtlicher ERV-Link Zihlschlacht-Sitterdorf (CMS-Staging) + Quell-Tippfehler dokumentiert. Spalte 4 = Gemeinde direkt.

| Amt | Strasse | PLZ Ort | Gemeinden | URL |
| --- | --- | --- | --- | --- |
| Schlichtungsbehörde in Mietsachen Amriswil | Postfach | 8580 Amriswil | Amriswil | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/amriswil.html/192 |
| Schlichtungsbehörde in Mietsachen Arbon | Hauptstrasse 12 | 9320 Arbon | Arbon | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/arbon.html/193 |
| Schlichtungsbehörde in Mietsachen Dozwil | Bahnhofsstrasse 19 | 8590 Romanshorn | Dozwil | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/dozwil.html/203 |
| Schlichtungsbehörde in Mietsachen Egnach | Bahnhofstrasse 81 | 9315 Neukirch-Egnach | Egnach | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/egnach.html/204 |
| Schlichtungsbehörde in Mietsachen Hefenhofen | Auenhof Aegelsee 10 | 8580 Hefenhofen | Hefenhofen | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/hefenhofen.html/215 |
| Schlichtungsbehörde in Mietsachen Horn | Tübacherstrasse 11 | 9326 Horn | Horn | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/horn.html/219 |
| Schlichtungsbehörde in Mietsachen Kesswil | Bahnhofsstrasse 19 | 8590 Romanshorn | Kesswil | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/kesswil.html/223 |
| Schlichtungsbehörde in Mietsachen Roggwil | St. Gallerstrasse 64 | 9325 Roggwil | Roggwil | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/Roggwil.html/237 |
| Schlichtungsbehörde in Mietsachen Romanshorn | Bahnhofstrasse 19 | 8590 Romanshorn | Romanshorn | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/Romanshorn.html/238 |
| Schlichtungsbehörde in Mietsachen Salmsach | Bahnhofstrasse 81 | 9315 Neukirch-Egnach | Salmsach | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/Salmsach.html/240 |
| Schlichtungsbehörde in Mietsachen Sommeri | Hauptstrasse 33 | 8580 Sommeri | Sommeri | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/Sommeri.html/244 |
| Schlichtungsbehörde in Mietsachen Uttwil | Postfach 53 | 8592 Uttwil | Uttwil | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/Uttwil.html/250 |
| Schlichtungsbehörde in Mietsachen Basadingen-Schlattingen | Hintergasse 49 | 8253 Diessenhofen | Basadingen-Schlattingen | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/basadingen-schlatingen.html/194 |
| Schlichtungsbehörde in Miet- und Pachtsachen | Seestrasse 123 | 8266 Steckborn | Berlingen | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/berlingen.html/196 |
| Schlichtungsbehörde in Mietsachen Diessenhofen | Hintergasse 49 | 8253 Diessenhofen | Diessenhofen | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/diessenhofen.html/202 |
| Schlichtungsbehörde in Miet- und Pachtsachen | Seestrasse 123 | 8266 Steckborn | Eschenz | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/eschenz.html/207 |
| Schlichtungsbehörde in Mietsachen Felben-Wellhausen | Hauptstrasse 52 | 8553 Hüttlingen | Felben-Wellhausen | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/felben-wllhausen.html/209 |
| Schlichtungsbehörde in Mietsachen Frauenfeld | Postfach | 8501 Frauenfeld | Frauenfeld | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/frauenfeld.html/210 |
| Schlichtungsbehörden in Mietsachen Gachnang | Hauptstrasse 52 | 8553 Hüttlingen | Gachnang | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/gachnang.html/211 |
| Schlichtungsbehörde in Mietsachen Herdern | Hauptstrasse 52 | 8553 Hüttlingen | Herdern | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/herdern.html/216 |
| Schlichtungsbehörde in Mietsachen Homburg | Hauptstrasse 52 | 8553 Hüttlingen | Homburg | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/homburg.html/218 |
| Schlichtungsbehörde in Mietsachen Hüttlingen | Hauptstrasse 52 | 8553 Hüttlingen | Hüttlingen | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/huettlingen.html/220 |
| Schlichtungsbehörde in Mietsachen Hüttwilen | Hauptstrasse 52 | 8553 Hüttlingen | Hüttwilen | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/huettwilen.html/221 |
| Schlichtungsbehörde in Miet- und Pachtsachen | Seestrasse 123 | 8266 Steckborn | Mammern | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/Mammern.html/228 |
| Schlichtungsbehörde für Mietsachen der Gemeinde Matzingen | Altholzstrasse 7 | 9548 Matzingen | Matzingen | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/Matzingen.html/230 |
| Schlichtungsbehörde in Mietsachen Müllheim | Hauptstrasse 52 | 8553 Hüttlingen | Müllheim | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/Muellheim.html/231 |
| Schlichtungsbehörde in Mietsachen Neunforn | Hauptstrasse 52 | 8553 Hüttlingen | Neunforn | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/Neunforn.html/233 |
| Schlichtungsbehörde in Mietsachen Pfyn | Hauptstrasse 52 | 8553 Hüttlingen | Pfyn | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/Pfyn.html/234 |
| Schlichtungsbehörde in Mietsachen Schlatt | Hintergasse 49 | 8253 Diessenhofen | Schlatt | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/Schlatt.html/241 |
| Schlichtungsbehörde in Miet- und Pachtsachen | Seestrasse 123 | 8266 Steckborn | Steckborn | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/Steckborn.html/245 |
| Schlichtungsbehörde in Mietsachen Stettfurt | Wilerstrasse 3 | 9545 Wängi | Stettfurt | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/Stettfurt.html/634 |
| Schlichtungsbehörde in Mietsachen Thundorf | Altholzstrasse 3 | 9548 Matzingen | Thundorf | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/Thundorf.html/248 |
| Schlichtungsbehörde in Mietsachen Uesslingen-Buch | Hauptstrasse 52 | 8553 Hüttlingen | Uesslingen-Buch | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/Uesslingen-Buch.html/249 |
| Schlichtungsbehörde in Miet- und Pachtsachen | Seestrasse 123 | 8266 Steckborn | Wagenhausen | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/Wagenhausen.html/251 |
| Schlichtungsbehörde in Mietsachen Warth-Weiningen | Hauptstrasse 52 | 8553 Hüttlingen | Warth-Weiningen | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/Warth-Weinigen.html/253 |
| Schichtungsbehörde in Mietsachen Altnau | Scherzingerstrasse 2 | 8595 Altnau | Altnau | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/altnau.html/190 |
| Schlichtungsbehörde in Mietsachen Bottighofen | Postfach 86 | 8598 Bottighofen | Bottighofen | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/bottighofen.html/199 |
| Schlichtungsbehörde in Mietsachen Kreuzlingen | Marktstrasse 4 | 8280 Kreuzlingen | Ermatingen | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/ermatingen.html/206 |
| Schlichtungsbehörde in Mietsachen Kreuzlingen | Marktstrasse 4 | 8280 Kreuzlingen | Gottlieben | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/gottlieben.html/212 |
| Schlichtungsbehörde in Mietsachen Güttingen | Klosterstrasse 4 | 8596 Münsterlingen | Güttingen | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/guettingen.html/213 |
| Schlichtungsbehörde in Mietsachen Kemmental | Postfach | 8570 Weinfelden | Kemmental | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/kemmental.html/222 |
| Schlichtungsbehörde in Mietsachen Kreuzlingen | Marktstrasse 4 | 8280 Kreuzlingen | Kreuzlingen | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/kreuzlingen.html/225 |
| Schlichtungsbehörde in Mietsachen Langrickenbach | Klosterstrasse 4 | 8596 Münsterlingen | Langrickenbach | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/langrickenbach.html/226 |
| Schlichtungsbehörde in Mietsachen Lengwil | Klosterstrasse 4 | 8596 Münsterlingen | Lengwil | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/lengwil.html/227 |
| Schlichtungsbehörde in Mietsachen Münsterlingen | Kloserstrasse 4 | 8596 Münsterlingen | Münsterlingen | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/Muensterlingen.html/232 |
| Schlichtungsbehörde in Mietsachen Kreuzlingen | Marktstrasse 4 | 8280 Kreuzlingen | Raperswilen | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/Raperswilen.html/235 |
| Schlichtungsbehörde in Mietsachen Salenstein | Eugensbergstrasse 2 | 8268 Salenstein | Salenstein | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/salenstein.html/239 |
| Schlichtungsbehörde in Mietsachen Tägerwilen | Postfach 141 | 8274 Tägerwilen | Tägerwilen | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/Taegerwilen.html/247 |
| Schlichtungsbehörde in Mietsachen Kreuzlingen | Marktstrasse 4 | 8280 Kreuzlingen | Wäldi | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/waeldi.html/252 |
| Schlichtungsbehörde in Mietsachen Aadorf | Gemeindeplatz 1 | 8355 Aadorf | Aadorf | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/aadorf.html/187 |
| Schlichtungsbehörde in Mietsachen Bettwiesen | Wilerstrasse 3 | 9545 Wängi | Bettwiesen | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/bettwiesen.html/180 |
| Schlichtungsbehörde in Mietsachen Bichelsee-Balterswil | Wiesenstrasse 3 | 8360 Eschlikon | Bichelsee-Balterswil | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/bichelsee-balterswil.html/182 |
| Schlichtungsbehörde in Mietsachen Braunau | Wilerstrasse 3 | 9545 Wängi | Braunau | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/braunau.html/183 |
| Schlichtungsbehörde in Mietsachen Eschlikon | Wiesenstrasse 3 | 8360 Eschlikon | Eschlikon | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/eschlikon.html/208 |
| Schlichtungsbehörde in Mietsachen Fischingen | Wiesenstrasse 3 | 8360 Eschlikon | Fischingen | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/fischingen.html/188 |
| Schlichtungsbehörde in Mietsachen Lommis | Wilerstrasse 3 | 9545 Wängi | Lommis | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/Lommis.html/184 |
| Schlichtungsbehörde in Mietsachen Münchwilen und Sirnach | Kirchplatz 5 | 8370 Sirnach | Münchwilen | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/Muenchwilen.html/185 |
| Schlichtungsbehöre in Mietsachen Rickenbach b. Wil | Wilenstrasse 41 | 9532 Rickenbach | Rickenbach | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/Rickenbach.html/236 |
| Schlichtungsbehörde in Mietsachen Sirnach udn Münchwilen | Kirchplatz 5 | 8370 Sirnach | Sirnach | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/Sirnach.html/243 |
| Schlichtungsbehörde in Mietsachen Tobel-Tägerschen | Wilerstrasser 3 | 9545 Wängi | Tobel-Tägerschen | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/Tobel-Taegerschen.html/186 |
| Schlichtungsbehörde in Mietsachen Wängi | Steinlerstrasse 2 | 9545 Wängi | Wängi | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/waengi.html/181 |
| Schlichtungsbehörde in Mietsachen Wilen | Hubstrasse 1 | 9535 Wilen | Wilen | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/Wilen.html/256 |
| Schlichtungsbehörde in Mietsachen Affeltrangen | Wilerstrasse 3 | 9545 Wängi | Affeltrangen | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/affeltrangen.html/189 |
| Schlichtungsstelle in Mietsachen Amlikon-Bissegg | Postfach | 8570 Weinfelden | Amlikon-Bissegg | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/amlikon-bissegg.html/191 |
| Schlichtungsbehörde in Mietsachen Berg | Postfach | 8570 Weinfelden | Berg | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/berg.html/195 |
| Schlichtungsbehörde für Mietsachen Birwinken | Frauenfelderstrasse 8 | 8570 Weinfelden | Birwinken | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/birwinken.html/197 |
| Schlichtungsbehörde in Mietsachen Bischofszell | Bahnhofstrasse 5 | 9220 Bischofszell | Bischofszell | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/bischofszell.html/198 |
| Schlichtungsbehörde in Mietsachen Bürglen | Postfach | 8570 Weinfelden | Bürglen | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/buerglen.html/200 |
| Schlichtungsbehörde in Mietsachen Bussnang | Postfach | 8570 Weinfelden | Bussnang | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/bussnang.html/201 |
| Schlichtungsbehörde in Mietsachen Erlen | Thurbruggstrasse 11a | 9215 Kradolf-Schönenberg | Erlen | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/erlen.html/205 |
| Schlichtungsbehörde in Mietsachen Hauptwil-Gottshaus | Oberdorfstrasse 3 | 9213 Hauptwil | Hauptwil-Gottshaus | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/hauptwil-gottshaus.html/214 |
| Schlichtungsbehörde in Mietsachen Hohentannen | Bahnhofstrasse 5 | 9220 Bischofszell | Hohentannen | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/hohentannen.html/217 |
| Schlichtungsbehörde in Mietsachen Kradolf-Schönenberg | Thurbruggstrasse 11a | 9215 Kradolf-Schönenberg | Kradolf-Schönenberg | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/kradolf-schoenenberg.html/224 |
| Schlichtungsbehörde in Mietsachen Märstetten | Postfach | 8570 Weinfelden | Märstetten | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/Maerstetten.html/229 |
| Schlichtungsbehörde in Mietsachen Schönholzerswilen | Postfach | 8570 Weinfelden | Schönholzerswilen | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/Schoenholzerswilen.html/242 |
| Schlichtungsbehörde in Mietsachen Sulgen | Thurbruggstrasse 11a | 9215 Kradolf-Schönenberg | Sulgen | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/Sulgen.html/246 |
| Schlichtungsbehörde in Mietsachen Weinfelden | Postfach | 8570 Weinfelden | Weinfelden | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/Weinfelden.html/254 |
| Schlichtungsbehörde in Mietsachen Wigoltingen | Postfach | 8570 Weinfelden | Wigoltingen | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/Wigoltingen.html/255 |
| Schlichtungsbehörde in Mietsachen Wuppenau | Postfach | 8570 Weinfelden | Wuppenau | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/Wuppenau.html/257 |
| Schlichtungsbehörde in Mietsachen Zihlschlacht-Sitterdorf | Bernhauserstrasse 5 | 8588 Zihlschlacht | Zihlschlacht-Sitterdorf | https://www.tg.ch/zivil--und-strafrechtspflege/organisation/Ziehlschlacht-Sitterdorf.html/258 |

**Pflegebedarf (alle Miete-Register):** jährlicher BWO-/Behörden-Durchgang; TG-Sammelsekretariate fluktuieren. **Abnahme-Status:** Erstrecherche an amtlichen Quellen (11.6.2026), Abnahme David ausstehend.

## 48. ZH-MIETE — 12 paritätische Mietschlichtungsbehörden (je Bezirk, beim Bezirksgericht)

Quelle: schlichtungsbehoerden-zh-vollerfassung.md (gerichte-zh.ch, 5.6.2026;
Bezirk Zürich seit 9.3.2026 Wengistrasse 30). Spalte 4 = BFS-Bezirke
(Join im Generator). Auto-Verdrahtung 11.6.2026.

| Amt | Strasse | PLZ Ort | Gemeinden | URL |
| --- | --- | --- | --- | --- |
| SB Miete Bezirk Zürich | Wengistrasse 30 | 8004 Zürich | Zürich | https://www.gerichte-zh.ch/organisation/bezirksgerichte/bezirksgericht-zuerich/kontakt/adressen-telefonnummern/mietgericht-und-schlichtungsbehoerde |
| SB Miete (BezGer Winterthur) | Lindstrasse 10 | 8400 Winterthur | Winterthur | |
| SB Miete (BezGer Bülach) | Spitalstrasse 13 | 8180 Bülach | Bülach | |
| SB Miete (BezGer Dietikon) | Bahnhofplatz 10 | 8953 Dietikon | Dietikon | |
| SB Miete (BezGer Affoltern) | Im Grund 15 | 8910 Affoltern am Albis | Affoltern | |
| SB Miete (BezGer Andelfingen) | Thurtalstrasse 1 | 8450 Andelfingen | Andelfingen | |
| SB Miete (BezGer Dielsdorf) | Spitalstrasse 7 | 8157 Dielsdorf | Dielsdorf | |
| SB Miete (BezGer Hinwil) | Gerichtshausstrasse 12 | 8340 Hinwil | Hinwil | |
| SB Miete (BezGer Horgen) | Burghaldenstrasse 3 | 8810 Horgen | Horgen | |
| SB Miete (BezGer Meilen) | Untere Bruech 139/140 | 8706 Meilen | Meilen | |
| SB Miete (BezGer Pfäffikon) | Hörnlistrasse 55 | 8330 Pfäffikon ZH | Pfäffikon | |
| SB Miete (BezGer Uster) | Gerichtsstrasse 17 | 8610 Uster | Uster | |

## 49. SO-MIETE — 4 Schlichtungsbehörden für Miet- und Pachtverhältnisse (Sekretariat: Oberamt, § 34quinquies/septies GO)

Quelle: so.ch Mietschlichtungs-Sammelseite (zweifach geprüft 5.6./6.6.2026;
PLZ Solothurn amtlich 4502). Oberamtsregion→Bezirke amtlich (Region
Solothurn deckt die Amteien Solothurn-Lebern UND Bucheggberg-Wasseramt).
Spalte 4 = BFS-Bezirke (Join im Generator). Auto-Verdrahtung 11.6.2026.

| Amt | Strasse | PLZ Ort | Gemeinden | URL |
| --- | --- | --- | --- | --- |
| Schlichtungsbehörde Miete/Pacht — Oberamt Region Solothurn | Rötistrasse 4 | 4502 Solothurn | Solothurn, Lebern, Bucheggberg, Wasseramt | https://so.ch/verwaltung/departement-des-innern/oberaemter/schlichtung-und-vermittlung/mietschlichtung/ |
| Schlichtungsbehörde Miete/Pacht — Oberamt Region Olten | Amthausquai 23 | 4600 Olten | Olten, Gösgen | https://so.ch/verwaltung/departement-des-innern/oberaemter/schlichtung-und-vermittlung/mietschlichtung/ |
| Schlichtungsbehörde Miete/Pacht — Oberamt Thal-Gäu | Wengimattstrasse 2 | 4710 Balsthal | Thal, Gäu | https://so.ch/verwaltung/departement-des-innern/oberaemter/schlichtung-und-vermittlung/mietschlichtung/ |
| Schlichtungsbehörde Miete/Pacht — Oberamt Dorneck-Thierstein | Passwangstrasse 29 | 4226 Breitenbach | Dorneck, Thierstein | https://so.ch/verwaltung/departement-des-innern/oberaemter/schlichtung-und-vermittlung/mietschlichtung/ |

## 50. JU-MIETE — 3 Commissions de conciliation en matière de bail (je District; Moutier seit 1.1.2026 bei Delémont)

Quelle: jura.ch/JUST Sammelseite «Droit du travail et du bail» (verifiziert
6.6.2026); Moutier-Zuordnung gemäss Bestandes-Eintrag (Kantonswechsel
1.1.2026). Spalte 4 = BFS-Districts (Join im Generator). Auto-Verdrahtung
11.6.2026.

| Amt | Strasse | PLZ Ort | Gemeinden | URL |
| --- | --- | --- | --- | --- |
| Commission de conciliation District de Delémont | Hôtel-de-Ville, Case postale | 2800 Delémont | Delémont, Moutier | https://www.jura.ch/JUST/Renseignements-juridiques/Droit-du-travail-et-du-bail/Droit-du-travail-et-du-bail.html |
| Commission de conciliation District de Porrentruy | Rue de la Roche-de-Mars 5 | 2900 Porrentruy | Porrentruy | https://www.jura.ch/JUST/Renseignements-juridiques/Droit-du-travail-et-du-bail/Droit-du-travail-et-du-bail.html |
| Commission de conciliation Franches-Montagnes | Au Village 21c | 2360 Le Bémont | Franches-Montagnes | https://www.jura.ch/JUST/Renseignements-juridiques/Droit-du-travail-et-du-bail/Droit-du-travail-et-du-bail.html |
