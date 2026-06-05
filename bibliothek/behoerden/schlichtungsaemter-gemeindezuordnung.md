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

| Amt | Strasse | PLZ Ort | Gemeinde |
|-----|---------|---------|----------|
| Friedensrichteramt Zug | Gubelstrasse 22, PF | 6301 Zug | Zug |
| Friedensrichteramt Baar | Leihgasse 9 | 6341 Baar | Baar |
| Friedensrichteramt Cham | Mandelhof (ohne Hausnr.) | 6330 Cham | Cham |
| Friedensrichteramt Hünenberg | Chamerstrasse 11 | 6331 Hünenberg | Hünenberg |
| Friedensrichteramt Risch | Rathaus, Zentrum Dorfmatt | 6343 Rotkreuz | Risch |
| Friedensrichteramt Steinhausen | Bahnhofstrasse 3, PF | 6312 Steinhausen | Steinhausen |
| Friedensrichteramt Walchwil | Dorfstrasse 23, PF (Gemeindeverwaltung) | 6318 Walchwil | Walchwil |
| Friedensrichteramt Unterägeri | Seestrasse 2 | 6314 Unterägeri | Unterägeri |
| Friedensrichteramt Oberägeri | PF 128 | 6315 Oberägeri | Oberägeri |
| Friedensrichteramt Neuheim | PF 134 | 6345 Neuheim | Neuheim |
| Friedensrichteramt Menzingen | Alte Landstrasse 2a, PF (Gemeindeverwaltung) | 6313 Menzingen | Menzingen |

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

| Amt | Strasse | PLZ Ort | Bezirk/Gemeinde |
|-----|---------|---------|------------------|
| Vermittleramt Appenzell | Landsgemeindeplatz 5 | 9050 Appenzell | Bezirk Appenzell |
| Vermittleramt Schwende-Rüte | Zidler 19 (Vermittler T. Mainberger) | 9057 Weissbad | Bezirk Schwende-Rüte |
| Vermittleramt Schlatt-Haslen | Hinterhaslen 41 (Vermittler P. Sutter) | 9054 Haslen | Bezirk Schlatt-Haslen |
| Vermittleramt Gonten | Lorettohalde 1 (Vermittlerin L. Zürcher-Baumgartner; Privat: Oberschwarzstrasse 7) | 9108 Gonten | Bezirk Gonten |
| Vermittleramt Oberegg | Sonnenstrasse 6 (Vermittlerin S. Blatter-Ulmann) | 9413 Oberegg | Bezirk Oberegg |

**Unsicherheiten AI:**
- **WARNUNG Quellenvermischung:** betreibungsschalter-plus.ch führt veraltete getrennte „Vermittleramt Schwende" (Küchenrain 6, 9057 Schwende) und „Vermittleramt Rüte" sowie ein AR-„Vermittleramt Haslen, Oberbühl 9054" (deckt Gais/Bühler/Teufen AR — das ist **Appenzell Ausserrhoden**, NICHT AI). Diese wurden ausgeschlossen.
- Schwende-Rüte: Aktuelle Vermittler-Korrespondenzadresse ist die Privat-/Funktionsadresse des Vermittlers (Zidler 19, 9057 Weissbad). Eine separate „Amts"-Anschrift in der Bezirksverwaltung (Pöppelstrasse 14, 9050 Appenzell Steinegg) ist möglich, aber für das Vermittleramt nicht eindeutig amtlich bestätigt → **leichte Unsicherheit**.
- Da ai.ch (403) nicht direkt verifizierbar war, sind die 5 Ämter strukturell sicher, die exakten Hausnummern teils über Vermittler-Personenadressen abgeleitet.

**Quellen:** https://www.ai.ch/gerichte/vermittler (403, nicht abrufbar) · https://schwende-ruete.ch/ · https://schlatt-haslen.ch/ · https://www.appenzell.ch/de/dorf-appenzell/bezirke-in-appenzell-innerrhoden/

---

## 4. SZ — Schwyz: Vermittlerämter — TEILWEISE OFFEN (per-Gemeinde-System, amtliche Karte JS-only)

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

## 5. BL — Basel-Landschaft: 15 Friedensrichterkreise — Kreisstruktur VOLLSTÄNDIG, Korrespondenzadressen TEILWEISE

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

| Amt | Strasse | PLZ Ort | Gemeinden |
|---|---|---|---|
| Kreis I (Bez. Aarau) | Postfach 2347 | 5001 Aarau | Aarau, Biberstein, Densbüren, Erlinsbach, Küttigen |
| Kreis II (Bez. Aarau) | Postfach | 5036 Oberentfelden | Buchs, Gränichen, Hirschthal, Muhen, Oberentfelden, Suhr, Unterentfelden |
| Kreis III (Bez. Baden) | Postfach | 5400 Baden | Baden, Ehrendingen, Ennetbaden, Freienwil, Obersiggenthal, Untersiggenthal, Würenlingen |
| Kreis IV (Bez. Baden) | Alb.-Zwyssigstrasse 76 | 5430 Wettingen | Bergdietikon, Killwangen, Neuenhof, Spreitenbach, Wettingen, Würenlos |
| Kreis V (Bez. Baden) | Postfach 56 | 5200 Brugg | Bellikon, Birmenstorf, Fislisbach, Gebenstorf, Künten, Mägenwil, Mellingen, Niederrohrdorf, Oberrohrdorf, Remetschwil, Stetten, Wohlenschwil |
| Kreis VI (Bez. Bremgarten) | Postfach | 5605 Dottikon | Büttikon, Dottikon, Fischbach-Göslikon, Hägglingen, Niederwil, Sarmenstorf, Tägerig, Uezwil, Villmergen, Wohlen |
| Kreis VII (Bez. Bremgarten) | Postfach 225 | 5620 Bremgarten | Arni, Berikon, Bremgarten, Eggenwil, Islisberg, Jonen, Oberlunkhofen, Oberwil-Lieli, Rudolfstetten-Friedlisberg, Unterlunkhofen, Widen, Zufikon |
| Kreis VIII (Bez. Brugg) | Postfach 151 | 5103 Wildegg | Auenstein, Birr, Birrhard, Bözberg, Brugg, Habsburg, Hausen, Lupfig, Mandach, Mönthal, Mülligen, Remigen, Riniken, Rüfenach, Schinznach, Thalheim, Veltheim, Villigen, Villnachern, Windisch |
| Kreis IX (Bez. Kulm) | Postfach 174 | 5726 Unterkulm | Beinwil am See, Birrwil, Dürrenäsch, Gontenschwil, Holziken, Leimbach, Leutwil, Menziken, Oberkulm, Reinach, Schlossrued, Schmiedrued, Schöftland, Teufenthal, Unterkulm, Zetzwil |
| Kreis X (Bez. Laufenburg) | Postfach | 5070 Frick | Böztal, Eiken, Frick, Gansingen, Gipf-Oberfrick, Herznach-Ueken, Kaisten, Laufenburg, Mettauertal, Münchwilen, Oberhof, Oeschgen, Schwaderloch, Sisseln, Wittnau, Wölflinswil, Zeihen |
| Kreis XI (Bez. Lenzburg) | Postfach | 5600 Lenzburg 1 | Ammerswil, Brunegg, Dintikon, Hendschiken, Holderbank, Lenzburg, Möriken-Wildegg, Niederlenz, Othmarsingen |
| Kreis XII (Bez. Lenzburg) | Postfach | 5707 Seengen | Boniswil, Egliswil, Fahrwangen, Hallwil, Hunzenschwil, Meisterschwanden, Rupperswil, Schafisheim, Seengen, Seon, Staufen |
| Kreis XIII (Bez. Muri) | Postfach 238 | 5630 Muri AG | Abtwil, Aristau, Auw, Beinwil (Freiamt), Besenbüren, Bettwil, Boswil, Bünzen, Buttwil, Dietwil, Geltwil, Kallern, Merenschwand, Mühlau, Muri, Oberrüti, Rottenschwil, Sins, Waltenschwil |
| Kreis XIV (Bez. Rheinfelden) | Im Kunzental 30, Postfach 55 | 4310 Rheinfelden | Hellikon, Kaiseraugst, Magden, Möhlin, Mumpf, Obermumpf, Olsberg, Rheinfelden, Schupfart, Stein, Wallbach, Wegenstetten, Zeiningen, Zuzgen |
| Kreis XV (Bez. Zofingen) | Postfach 110 | 4852 Rothrist | Aarburg, Murgenthal, Oftringen, Rothrist |
| Kreis XVI (Bez. Zofingen) | Postfach 135 | 4800 Zofingen | Bottenwil, Brittnau, Kirchleerau, Kölliken, Moosleerau, Reitnau, Safenwil, Staffelbach, Strengelbach, Uerkheim, Vordemwald, Wiliberg, Zofingen |
| Kreis XVII (Bez. Zurzach) | c/o Gerichtskanzlei, Postfach | 5330 Bad Zurzach | Böttstein, Döttingen, Endingen, Fisibach, Full-Reuenthal, Klingnau, Koblenz, Leibstadt, Lengnau, Leuggern, Mellikon, Schneisingen, Siglistorf, Tegerfelden, Zurzach |

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

| Amt | Strasse | PLZ Ort | Gemeinden |
|---|---|---|---|
| Friedensrichteramt Bezirk Arbon | Bahnhofstrasse 16, Postfach | 9320 Arbon | Amriswil, Arbon, Dozwil, Egnach, Hefenhofen, Horn, Kesswil, Roggwil (TG), Romanshorn, Salmsach, Sommeri, Uttwil |
| Friedensrichteramt Bezirk Frauenfeld | St. Gallerstrasse 4, Postfach | 8510 Frauenfeld | Basadingen-Schlattingen, Berlingen, Diessenhofen, Eschenz, Felben-Wellhausen, Frauenfeld, Gachnang, Herdern, Homburg, Hüttlingen, Hüttwilen, Mammern, Matzingen, Müllheim, Neunforn, Pfyn, Schlatt (TG), Steckborn, Stettfurt, Thundorf, Uesslingen-Buch, Wagenhausen, Warth-Weiningen |
| Friedensrichteramt Bezirk Kreuzlingen | Bachstrasse 10, Postfach | 8280 Kreuzlingen 1 | Altnau, Bottighofen, Ermatingen, Gottlieben, Güttingen, Kemmental, Kreuzlingen, Langrickenbach, Lengwil, Münsterlingen, Raperswilen, Salenstein, Tägerwilen, Wäldi |
| Friedensrichteramt Bezirk Münchwilen | Rütiweg 1, Postfach 126 | 8370 Sirnach | Aadorf, Bettwiesen, Bichelsee-Balterswil, Braunau, Eschlikon, Fischingen, Lommis, Münchwilen, Rickenbach, Sirnach, Tobel-Tägerschen, Wängi, Wilen |
| Friedensrichteramt Bezirk Weinfelden | Bahnhofstrasse 22, Postfach | 8570 Weinfelden | Affeltrangen, Amlikon-Bissegg, Berg (TG), Birwinken, Bischofszell, Bürglen (TG), Bussnang, Erlen, Hauptwil-Gottshaus, Hohentannen, Kradolf-Schönenberg, Märstetten, Schönholzerswilen, Sulgen, Weinfelden, Wigoltingen, Wuppenau, Zihlschlacht-Sitterdorf |

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

## 1. SZ — Vermittlerämter mit Gemeinde-Zuordnung — **GESCHLOSSEN**

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

## 2. BL — Friedensrichterkreise K9–K12 + Itingen — **GESCHLOSSEN**

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
  Vermittlerkreis GERSAU (Rüegg, Brunnen). Vor Übernahme klären — bis dahin
  bleibt SZ Verzeichnis-Fallback (personengebundene Ämter).
- Übrige Klein-/Sammelgemeinden: weiterhin offen (vermittler-sz.ch JS-only).

---

# TEIL 3 — GR: Vermittlerämter je Region (6.6.2026, für den Generator)

Quelle: TI-VS-GR-Vollerfassung (zweifach geprüft, justiz-gr.ch 5.6.2026);
Regionen = amtliche BFS-Ebene (11/11 namensgleich). Gemeinde-Zuordnung
über das BFS-Gemeindeverzeichnis (Snapshot 1.6.2026) wie bei FR.

## 30. GR — Graubünden: Vermittlerämter (Region = BFS-Region)

| Amt | Strasse | PLZ Ort | Regionen |
|---|---|---|---|
| Vermittleramt Region Albula | Stradung 26 | 7450 Tiefencastel | Albula |
| Vermittleramt Region Bernina | Via da la Pesa 8 | 7742 Poschiavo | Bernina |
| Vermittleramt Region Engiadina Bassa/Val Müstair | Saglina 22 | 7554 Sent | Engiadina Bassa / Val Müstair |
| Vermittleramt Region Imboden | Postfach 308 | 7001 Chur | Imboden |
| Vermittleramt Region Landquart | Bahnhofplatz 2b, Postfach 244 | 7302 Landquart | Landquart |
| Vermittleramt Region Maloja | Plazza da Scoula 16, Postfach 83 | 7500 St. Moritz | Maloja |
| Vermittleramt Region Moesa | Al Giardinètt 2 | 6535 Roveredo | Moesa |
| Vermittleramt Region Plessur | Bärenloch 1, Postfach 290 | 7001 Chur | Plessur |
| Vermittleramt Region Prättigau/Davos | Postfach 125 | 7250 Klosters | Prättigau / Davos |
| Vermittleramt Region Surselva | Via Centrala 4 | 7130 Ilanz/Glion | Surselva |
| Vermittleramt Region Viamala | Untere Gasse 1 | 7430 Thusis | Viamala |

