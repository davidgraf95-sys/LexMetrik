# Recherche: Schlichtungsbehörden aller Kantone (Art. 197 ff. ZPO)

**Erstellt:** 5.6.2026, 4 parallele Recherche-Agents · **Abrufdatum aller Quellen: 5.6.2026**
**Status: RECHERCHE — NICHT abgenommen.** Übernahme in `src/lib/vorlagen/behoerden.ts`
erst nach fachlicher Prüfung durch David (CLAUDE.md §7); Unsicherheiten sind je Kanton
markiert und nicht weggeglättet (§8). BS ist bereits als Stammdatum hinterlegt.

**Zentrale amtliche Quelle für ALLE Miet-Schlichtungsbehörden:** Bundesamt für
Wohnungswesen (BWO), «Adressen der Schlichtungsbehörden in Mietsachen», Stand 13.02.2026 —
https://www.bwo.admin.ch/bwo/de/home/mietrecht/schlichtungsbehoerden.html
(PDF: …/20260213_Schlichtungsbehörden.pdf). Jährlich nachzuprüfen.

---

## Erkenntnis fürs Datenmodell

`BEHOERDEN` (eine Adresse pro Kanton × EingabeArt) passt nur für Kantone mit EINER
zentralen Stelle. Befund über alle 26 Kantone:

- **Zentral (1 Stelle, direkt abbildbar):** BS ✓, UR, OW, NW, GL, GE, JU — und für
  die *Miet*-Schlichtung zusätzlich LU, BL, SH, AR, VS (zentrale Mietstelle trotz
  dezentraler allgemeiner Schlichtung).
- **Wenige Stellen (≤ ~11, als Liste abbildbar, Zuständigkeit nach Region/Bezirk):**
  BE (4), TG (5), FR (7), VD (9), ZG (~9 Gemeinden), SG (10), GR (11), NE (2 Gerichte/3 Standorte), AR (3), AI (~5).
- **Viele Stellen (nur Verzeichnis-URL + Zuständigkeitsregel sinnvoll):**
  ZH (>170 Friedensrichterämter), SZ (30 Vermittlerämter), AG (17 Friedensrichterkreise),
  BL (15 Kreise), TI (38 circoli), VS (Gemeinderichter, >100), SO (gemischt kommunal/Amtsgericht).
- **Sonderfall TG Miete:** kommunal — JEDE politische Gemeinde hat eine eigene
  Schlichtungsbehörde in Mietsachen → nicht als Einzeladresse abbildbar.

→ Vorschlag: `BehoerdenEintrag = Adresse | { verzeichnisUrl, zustaendigkeitsRegel, beispiele[] }`
(Erweiterung erst nach Davids Entscheid).

---

## Übersichtstabelle (alle 26)

| Kt | Allg. Schlichtungsbehörde (Art. 197) | Struktur | Miete/Pacht (Art. 200 Abs. 1) |
|----|--------------------------------------|----------|-------------------------------|
| ZH | Friedensrichterämter (kommunal) | >170 Kreise | bezirksweise (12), beim Bezirksgericht |
| BE | regionale Schlichtungsbehörden | 4 | identisch (paritätisch besetzt) |
| LU | Friedensrichterämter | 4 Gerichtsbezirke | zentral: Bahnhofstrasse 22, 6002 Luzern |
| UR | kantonale Schlichtungsbehörde | **1** (Bahnhofstrasse 43, 6460 Altdorf) | dieselbe, paritätisch |
| SZ | Vermittlerämter (kommunal) | 30 | 6 Bezirks-Stellen (abweichend!) |
| OW | kantonale Schlichtungsbehörde | **1** (Enetriederstrasse 1, 6060 Sarnen) | dieselbe |
| NW | kantonale Schlichtungsbehörde | **1** (Rathausplatz 9, PF 1244, 6371 Stans) | dieselbe |
| GL | kantonale Schlichtungsbehörde | **1** (Gerichtshausstrasse 22, 8750 Glarus) | dieselbe |
| ZG | Friedensrichterämter (kommunal) | **11** ✓2 | zentral: Baarerstrasse 131, **6300** Zug ✓2 |
| FR | Friedensgerichte / Justices de paix | 7 Bezirke | 3 regionale Kommissionen |
| SO | Friedensrichter ODER Amtsgerichtspräsidium | gemischt | 4 regionale (Oberämter) |
| BS | Zivilgericht (Schlichtungsbehörde) ✓ Stammdatum | **1** | Staatl. Schlichtungsstelle ✓ Stammdatum |
| BL | Friedensrichterkreise | 15 | zentral: **Rheinstrasse 16, 4410 Liestal** ✓2 (Bahnhofstr. 3/5 überholt!) |
| SH | **EIN kantonales Friedensrichteramt seit 1.1.2018** ✓2 | **1** | zentral: Vordergasse 54, **8201** Schaffhausen ✓2 |
| AR | Vermittlerämter (Kreise) | 3 | zentral: Fünfeckpalast, 9043 Trogen |
| AI | Vermittler je Bezirk | ~5 | 2 (innerer/äusserer Landesteil) |
| SG | Vermittlungsämter (Gerichtskreise) | 10 | 7 regionale Stellen |
| GR | Vermittlerämter (Regionen) | 11 | 11 regionale Stellen |
| AG | Friedensrichterkreise | 17 | 11 Bezirks-Stellen |
| TG | Friedensrichterämter (Bezirke) | 5 | **kommunal je Gemeinde** (Sonderfall!) |
| TI | Giudice di pace (circoli) | 38 | 11 Uffici di conciliazione locazione |
| VD | Justices de paix (Bezirke) | 9 | Commission préfectorale je Bezirk |
| VS | Juge de commune (Gemeinderichter) | >100 | zentral: **Av. du Midi 7, 1950 Sion** ✓2 (PLZ-Korrektur; LACPC Art. 3 am Originaltext bestätigt) |
| NE | Chambre de conciliation (Regionalgerichte) | 2 Gerichte/3 Standorte | identisch: Chambre paritätisch in Bail-Sachen ✓2 |
| GE | Tribunal de première instance | **1** (Rue de l'Athénée 6-8, 1205 Genève) | Commission baux et loyers (gleiche Adresse, eigenes PF) |
| JU | Juge civil am Tribunal de première instance | **1** (Porrentruy) | nicht recherchiert |

---

## Detailberichte

### ZH — Zürich
- **Allgemein:** kommunale Friedensrichterämter, >170 Schlichtungskreise; Zuständigkeit nach Gemeinde/Kreis. Verzeichnis: https://www.vfzh.ch/recht-finden/aemterverzeichnis (verlinkt von gerichte-zh.ch). Beispiele: FR-Amt Kreise 1+2, Ulmbergstrasse 1, PF, 8027 Zürich · FR-Amt Kreise 4+5, Hohlstrasse 35, 8004 Zürich · FR-Amt Winterthur, Stadthausstrasse 4a, 8403 Winterthur.
- **Miete:** NICHT die Friedensrichter — paritätische Schlichtungsbehörde je Bezirk (12) beim Bezirksgericht. Bezirk Zürich: Postfach, 8036 Zürich · Winterthur: Lindstrasse 10, 8400 · Bülach: Spitalstrasse 13, 8180. Übrige im BWO-Verzeichnis.
- Quellen: gerichte-zh.ch (Schlichtungsverfahren, Miete-Hilfen), vfzh.ch, BWO 13.02.2026.
- Unsicherheit: exakte Ämterzahl nur via VFZH-Verzeichnis.

### BE — Bern
- **4 regionale Schlichtungsbehörden** (zugleich paritätisch für Miete/Arbeit): Berner Jura-Seeland, Neuengasse 8, 2502 Biel (Agence du Jura bernois: Rue de l'Union 13) · Bern-Mittelland, Effingerstrasse 34, 3008 Bern · Emmental-Oberaargau, Dunantstrasse 3, 3400 Burgdorf · Oberland, Scheibenstrasse 11 B, 3600 Thun.
- Quellen: zsg.justice.be.ch (Überblick + 4 Detailseiten), BWO. **Keine wesentlichen Unsicherheiten — direkt stammdatenfähig (nach Abnahme).**

### LU — Luzern
- **Allgemein:** 4 Friedensrichterämter (Bezirke Luzern, Kriens, Hochdorf, Willisau). Luzern: Grabenstrasse 2, PF 2266, 6002 Luzern; übrige via gerichte.lu.ch.
- **Miete zentral:** Schlichtungsbehörde Miete und Pacht, Bahnhofstrasse 22, 6002 Luzern (Adresse aus BWO; auf gerichte.lu.ch nur Telefon).
- Unsicherheit: Adressen Kriens/Hochdorf/Willisau nicht einzeln verifiziert.

### UR / OW / NW / GL — je EINE kantonale Stelle (auch Miete, paritätisch besetzt)
- **UR:** Schlichtungsbehörde Uri, Bahnhofstrasse 43, 6460 Altdorf — ur.ch/aemter/1586 + BWO, doppelt bestätigt.
- **OW:** Schlichtungsbehörde Obwalden (Amt für Justiz), Enetriederstrasse 1, 6060 Sarnen — ow.ch + BWO. Achtung: ältere Treffer nennen «Poststrasse 10» — NICHT verwenden.
- **NW:** Schlichtungsbehörde Nidwalden, Rathausplatz 9, PF 1244, 6371 Stans — nw.ch + BWO, doppelt bestätigt.
- **GL:** Kantonale Schlichtungsbehörde, Gerichtshausstrasse 22, 8750 Glarus — gl.ch/rechtspflege. Keine Unsicherheiten.
- **Diese vier sind die reifsten Kandidaten für die direkte Stammdaten-Übernahme.**

### SZ — Schwyz
- **Allgemein:** 30 kommunale Vermittlerämter; Verzeichnis sz.ch/behoerden/justiz/vermittleraemter.html (→ vermittler-sz.ch). Beispiel: Vermittleramt Schwyz, Herrengasse 17, 6431 Schwyz.
- **Miete abweichend:** 6 Bezirks-Stellen (Schwyz PF 547 · Gersau **Bezirkskanzlei, Postfach 59** ✓2 (Dossier-Erstangabe «Ausserdorfstrasse 7» ersetzt) · March PF 531 Lachen · Einsiedeln PF 161 · Küssnacht Breitfeld 15 · Höfe PF 43 Pfäffikon) — überwiegend Postfächer (amtlich so).

### ZG — Zug
- **Allgemein:** kommunale Friedensrichterämter — **11** (✓2. Durchgang: Zug, Oberägeri, Unterägeri, Menzingen, Baar, Cham, Hünenberg, Steinhausen, Risch, Walchwil, Neuheim). Beispiel: FR-Amt Stadt Zug, Gubelstrasse 22, PF, 6301 Zug. Verzeichnis: zg.ch/de/gerichte/zivil-und-strafrechtspflege/schlichtungsbehoerden.
- **Miete zentral:** Schlichtungsbehörde Miet- und Pachtrecht, Baarerstrasse 131, **6300 Zug** (✓2: BWO + Portrait; 6301 nur Postfach-PLZ; Treffer «Industriestrasse 24» verwerfen).

### FR — Freiburg (zweisprachig)
- **Allgemein:** 7 Friedensgerichte/Justices de paix (je Bezirk), alle Adressen verifiziert: Saane Rue des Chanoines 1, 1701 Fribourg · Sense Schwarzseestrasse 5, 1712 Tafers · Greyerz Rue de l'Europe 10, 1630 Bulle · See Freiburgstrasse 69, 3280 Murten · Glane Rue des Moines 58, 1680 Romont · Broye Av. de la Gare 111, 1470 Estavayer-le-Lac · Vivisbach Ch. du Château 11, 1618 Châtel-St-Denis.
- **Miete:** 3 Kommissionen — Saane: Grand-Rue 27, 1700 Fribourg · Sense+See: PF 96, 1712 Tafers · Süd (Greyerz/Glane/Broye/Vivisbach): Rue des Moines 58, PF 160, 1680 Romont.
- Unsicherheit: Miet-Kommissionen teils nur Postfach.

### SO — Solothurn (gemischt!)
- **Allgemein:** Friedensrichter NUR wenn beide Parteien in derselben Gemeinde; sonst Amtsgerichtspräsidium (Auffang, § 10 GO). Kontakt: Amthaus 1, Bielstrasse 1, 4502 Solothurn. FR-Verzeichnis: so.ch/gerichte/weitere-gerichte/friedensrichter/.
- **Miete:** 4 Oberämter — Region Solothurn Rötistrasse 4, 4502 · Olten-Gösgen Amthausquai 23, 4600 Olten · Thal-Gäu Wengimattstrasse 2, 4710 Balsthal · Dorneck-Thierstein Passwangstrasse 29, 4226 Breitenbach.
- Hinweis fürs Produkt: Zuständigkeitsregel (gleiche Gemeinde?) ist abfragbar/deterministisch.

### BL — Basel-Landschaft
- **Allgemein:** 15 Friedensrichterkreise; Verzeichnis baselland.ch/politik-und-behorden/gerichte/friedensrichter-innen. (Direktabruf lieferte 403 — Inhalte aus amtlichen Treffern.)
- **Miete zentral:** Schlichtungsstelle für Mietangelegenheiten, **Rheinstrasse 16, 4410 Liestal** (✓2. Durchgang: BWO 13.02.2026 + amtlicher Online-Schalter oslvb.bl.ch/553 — Erstangaben Bahnhofstrasse 3 UND 5 sind überholt).

### SH — Schaffhausen (erhöhte Unsicherheit)
- **Allgemein:** ✓2. Durchgang GEKLÄRT — seit **1.1.2018 EIN kantonales Friedensrichteramt** (Fusion der Kreise Schaffhausen/Stein/Reiat/Klettgau, Volksabstimmung 21.5.2017): Friedensrichteramt des Kantons Schaffhausen, Vordergasse 54, **8201** Schaffhausen. SH zählt damit zu den ZENTRAL-Kantonen.
- **Miete zentral:** Schlichtungsstelle für Mietsachen, Vordergasse 54, **8201** Schaffhausen (✓2: BWO; Drittverzeichnis-Treffer «Herrenacker 26» verwerfen).

### AR — Appenzell Ausserrhoden
- **Allgemein:** 3 Vermittlerämter: Kreis 1 Hinterland, Regierungsgebäude, Obstmarkt 3 ✓2, PF, 9102 Herisau · Kreis 2 Mittelland und Kreis 3 Vorderland: beide Landsgemeindeplatz 2, Rathaus 3. Stock, 9043 Trogen.
- **Miete zentral:** Schlichtungsstelle für Miete und nichtlandw. Pacht, Landsgemeindeplatz 7c / Fünfeckpalast, 9043 Trogen. (Landw. Pacht → Vermittlerämter.)
- Quellen: ar.ch/gerichte + staatskalender.ar.ch. Solide.

### AI — Appenzell Innerrhoden (erhebliche Unsicherheit)
- **Allgemein:** Vermittler je Bezirk (~5). Namen/Adressen nur aus amtlichen Such-Snippets (ai.ch blockte Abrufe mit 403) — z. B. Bezirk Appenzell: Kronengarten 8, 9050 Appenzell. **Vor Übernahme direkt auf ai.ch/gerichte/vermittler prüfen.**
- **Miete:** 2 Stellen (innerer/äusserer Landesteil), Sekretariat je c/o Ratskanzlei, Marktgasse 2, 9050 Appenzell.

### SG — St. Gallen (vollständig amtlich verifiziert)
- **Allgemein, alle 10 Vermittlungsämter:** St.Gallen Neugasse 3, 9004 · Gossau Merkurstrasse 12, 9201 · Rorschach Promenadenstrasse 74, 9401 · Rheintal Obergasse 4, 9437 Marbach · Werdenberg Bahnhofstrasse 2, 9470 Buchs · Sarganserland Marktstrasse 25, 8890 Flums · See St.Gallerstrasse 23, PF 2160, 8645 Jona · Obersee-Gaster Zürcherstrasse 1, 8730 Uznach · Toggenburg Hauptgasse 8, 9620 Lichtensteig · Wil Lerchenfeldstrasse 11, 9500 Wil.
- **Miete:** 7 regionale Stellen (St.Gallen Wohnungsamt Rathaus 9001 · Rorschach Hauptstrasse 29 · Rheintal Rathausplatz 2, 9450 Altstätten · Werdenberg-Sarganserland St. Gallerstrasse 2, 9471 Buchs · See-Gaster St.Gallerstrasse 40, 8645 Jona · Toggenburg Grüenaustrasse 7, 9630 Wattwil · Wil Marktgasse 58, 9500 Wil).
- Quelle: sg.ch Justizportal. **Keine wesentlichen Unsicherheiten.**

### GR — Graubünden
- **Allgemein:** 11 Vermittlerämter (je Region), nur Sitzorte amtlich gelistet (Albula/Tiefencastel, Bernina/Poschiavo, Engiadina Bassa/Sent, Imboden/Chur, Landquart, Maloja/St. Moritz, Moesa/Roveredo, Plessur/Chur, Prättigau-Davos/Klosters, Surselva/Ilanz, Viamala/Thusis) — Strassenadressen je Region erfragen.
- **Miete, alle 11 mit Adresse:** Albula Stradung 26, 7450 Tiefencastel · Bernina Via da la Pesa 8, 7742 Poschiavo · EB/VM Saglina 22, 7554 Sent · Imboden PF 308, 7001 Chur · Landquart Bahnhofplatz 2b, 7302 · Maloja Plazza da Scuola 16, 7500 St. Moritz · Moesa Al Giardinètt 2, 6535 Roveredo · Plessur Bärenloch 1, 7001 Chur · Prättigau/Davos PF 125, 7250 Klosters · Surselva Via Centrala 4, 7130 Ilanz · Viamala Untere Gasse 1, 7430 Thusis.
- Quelle: justiz-gr.ch.

### AG — Aargau (vollständig amtlich verifiziert)
- **Allgemein:** 17 Friedensrichterkreise — überwiegend Postfachadressen (amtlich so), vollständige Liste: ag.ch → Gerichte → Schlichtungsbehörden → Friedensrichterkreise (Kreis I PF 2347 Aarau · II PF Oberentfelden · III PF Baden · IV Alb.-Zwyssig-Str. 76 Wettingen · V PF 56 Brugg · VI PF Dottikon · VII PF 225 Bremgarten · VIII PF 151 Wildegg · IX PF 174 Unterkulm · X PF Frick · XI PF Lenzburg · XII PF Seengen · XIII PF 238 Muri · XIV Im Kunzental 30 Rheinfelden · XV PF 110 Rothrist · XVI PF 135 Zofingen · XVII PF Bad Zurzach).
- **Miete:** 11 Bezirks-Stellen mit Strassenadressen (Aarau Obere Vorstadt 37 · Baden Rütistrasse 3 · Bremgarten Rathausplatz 1 · Brugg Untere Hofstatt 4 · Kulm Zentrumsplatz 3 Unterkulm · Laufenburg Gerichtsgasse 85 · Lenzburg Malagarain 2 · Muri Seetalstrasse 8 · Rheinfelden Hermann Keller-Strasse 6 · Zofingen Untere Grabenstrasse 30 · Zurzach Hauptstrasse 50).

### TG — Thurgau
- **Allgemein, alle 5 Friedensrichterämter:** Arbon Bahnhofstrasse 16, 9320 · Frauenfeld St. Gallerstrasse 4, PF 100, 8501 · Kreuzlingen Bachstrasse 10, 8280 · Münchwilen Rütiweg 1, PF 126, 8370 Sirnach · Weinfelden Bahnhofstrasse 22, 8570. Quelle: friedensrichteraemter.tg.ch.
- **Miete SONDERFALL:** kommunal, c/o politische Gemeinde des Mietobjekts — keine zentrale Adresse abbildbar; Gemeinde-Suche auf tg.ch.

### TI — Tessin
- **Allgemein:** Giudice di pace, 38 circoli. Amtliche Ortssuche: www4.ti.ch/poteri/giudiziario/giustizia-civile/giudici-di-pace (keine geschlossene Adressliste — Beispieladressen aus Drittquelle, vor Übernahme prüfen).
- **Miete:** 11 Uffici di conciliazione in materia di locazione (Chiasso, Mendrisio, Lugano Ovest/Est, Agno, Massagno, Locarno, Minusio, Bellinzona, Giubiasco, Biasca); Verzeichnis www4.ti.ch/poteri/giudiziario/locazione/la-locazione. Beispiel Bellinzona: Via Lugano 1, CP 2694, 6501.

### VD — Waadt
- **Allgemein:** 9 Justices de paix (Bezirke; Gros-de-Vaud mit Jura-Nord vaudois fusioniert). Liste: vd.ch/ojv/justices-de-paix. Vollständig verifiziert nur Yverdon (Rue des Moulins 10, CP 693, 1401) — übrige Adressen über die Detailseiten ziehen.
- **Miete:** Commission préfectorale de conciliation, eine pro Bezirk (bei der Präfektur); Verzeichnis auf vd.ch.

### VS — Wallis (erhöhte Unsicherheit)
- **Allgemein:** Juge de commune (Gemeinderichter) je Gemeinde (>100) — ✓2. Durchgang: **Art. 3 LACPC am Originaltext bestätigt** («tenter la conciliation, art. 201 al. 1 CPC»; Abs. 2 reserviert die Miet-Kommission).
- **Miete zentral:** Commission cantonale de conciliation en matière de baux à loyer, Av. du Midi 7, 1950 Sion ✓2 (nur Such-Snippet — auf vs.ch gegenprüfen).

### NE — Neuenburg
- **Allgemein:** Chambre de conciliation der 2 Tribunaux régionaux, 3 Standorte: Neuchâtel Rue de l'Hôtel-de-Ville 2, 2000 · Boudry Rue Louis-Favre 39, CP 36, 2017 · La Chaux-de-Fonds Av. Léopold-Robert 10, CP 2284, 2300. Quelle: ne.ch/PJNE.
- **Miete: nicht recherchiert** (offen).

### GE — Genf (solide)
- **Allgemein zentral:** Tribunal de première instance (autorité de conciliation), Rue de l'Athénée 6-8, 1205 Genève; Post: CP 3736, 1211 Genève 3. Quelle: justice.ge.ch.
- **Miete zentral:** Commission de conciliation en matière de baux et loyers, gleiche Strasse, CP 3120, 1211 Genève 3.

### JU — Jura
- **Allgemein zentral:** Juge civil am Tribunal de première instance, Le Château, Chemin du Château 9, 2900 Porrentruy (Hausnummer/Postfach gegenprüfen). Quelle: jura.ch/JUST.
- **Miete (✓2. Durchgang, Lückenschluss): NICHT zentral — 3 Bezirks-Commissions de conciliation en matière de bail:** Delémont (Hôtel-de-Ville, CP, 2800 Delémont, inkl. Moutier) · Porrentruy (Rue de la Roche-de-Mars 5, 2900, c/o SIDP) · Franches-Montagnes (Au Village 21c, 2360 Le Bémont). Quelle: jura.ch/JUST «Droit du travail et du bail».

---

## Offene Punkte / nächste Schritte (Vorschlag)

1. **Lücken schliessen:** Miete NE + JU; VD-Adressen 8 von 9; TI-Einzeladressen; VS-Gesetzesbeleg (LACPC).
2. **Nachverifikation der markierten Punkte** (SH-Kreise, ZG-Anzahl, BL-Hausnummer, AI gesamt, OW-Altadresse verwerfen).
3. **Datenmodell-Entscheid** (Adresse vs. Verzeichnis+Regel) — dann Übernahme-Reihenfolge:
   zuerst die 7 Zentral-Kantone (UR/OW/NW/GL/GE/JU + BS ✓), dann BE (4) und SG (komplett verifiziert).
4. Hinweis David 5.6.2026: **lawmaps.ch** als mögliche Findhilfe (JS-SPA, nicht maschinell
   auslesbar; als Beleg ohnehin nicht amtlich — nur zur Gegenprobe nutzen).
5. BWO-Verzeichnis (Miete, alle Kantone) als **jährlich datierten Parameter** führen
   (analog AV_MINDESTLOEHNE).
