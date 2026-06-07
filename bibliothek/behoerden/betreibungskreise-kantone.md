# Betreibungskreise und Betreibungsämter — Organisation aller 26 Kantone

**Erstellt:** 7.6.2026 (Auftrag David: Betreibungsamt-Finder nach dem Vorbild
des EasyGov-Finders «Betreibungsamt finden» als eigene Datenschicht hinter dem
SchKG-Zuständigkeitsrechner aufbauen; Recherche vor Bau, CLAUDE.md §11).
**Status: ZWEIFACH GEPRÜFT** (Erstrecherche + unabhängiger adversarialer
Durchgang je Kanton, 52 Agents 7.6.2026; Wortlaut-Lücken an JS-Portalen
[OW, FR, NW, AI] sind je Kanton ausdrücklich markiert). Fachliche Abnahme
David ausstehend. Roh-Berichte: `.scratch/betreibungskreise-2026-06-07/`
(Arbeitskopie, kein Beleg — Belege sind die amtlichen URLs je Kanton, alle
abgerufen 7.6.2026).

**Bundesrahmen:** Art. 1 Abs. 1 SchKG — «Das Gebiet jedes Kantons bildet für
die Durchführung der Schuldbetreibungen und der Konkurse einen oder mehrere
Kreise.» Art. 2 SchKG: in jedem Betreibungskreis ein Betreibungsamt. Die
KREISEINTEILUNG ist also rein kantonales Organisationsrecht — daher 26
verschiedene Systeme. (SchKG-Pin: cc/11/529_488_529, Stand 1.1.2026.)

**Kein konsolidiertes Bundes-Verzeichnis (Negativbefund, S5):** Das BJ hat den
öffentlichen Finder an EasyGov/SECO delegiert (alte BJ-Liste 404, vgl.
`src/lib/schkgZustaendigkeit.ts:359`); das eSchKG-Amtsverzeichnis ist nur für
Netzwerk-Teilnehmer mit BJ-Vereinbarung zugänglich. Der EasyGov-Finder selbst
(empirisch zerlegt 7.6.2026): öffentliches Adress-Autocomplete
(`/easygov-srv/public/application/debtOffice/autoComplete` — GWR-Gebäudedaten
mit BFS-Gemeindenummer), Amts-Auflösung dahinter (`…/debtOffice/detail`)
CSRF-geschützt, kein offenes API. → Eigene Datenschicht aus den 26 kantonalen
Quellen ist der einzige tragfähige Weg.

## Übersichtstabelle (Engine-Quelle künftig: `src/data/betreibungsaemter.ts`, Plan)

| Kt. | System | Ämter | Gemeinde→Amt ableitbar | Verzeichnis (abgerufen 7.6.2026) | Prüfung |
|---|---|---|---|---|---|
| ZH | Bezirks-/Regionalämter | 55 | ja | https://www.betreibungsinspektorat-zh.ch/deu/geo.php | ✓✓ |
| BE | Bezirks-/Regionalämter | 4 | nein | https://www.baka.dij.be.ch/de/start/ueber-uns/Standort.html | ✓✓ |
| LU | gemischt | ? | ja | https://gerichte.lu.ch/organisation/betreibungsaemter | ✓✓ |
| UR | gemischt | 2 | ja | https://www.ur.ch/rechtsgebiete/3912 | ✓✓ |
| SZ | gemischt | 11 | ja | https://ba-sz.ch/home/aemterverzeichnis/ | ✓✓ |
| OW | Einheitsamt | 1 | ja | https://www.ow.ch/fachbereiche/1906 | ✓ (Lücke: Rechtsgrundlage) |
| NW | Einheitsamt | 1 | ja | https://www.nw.ch/baka/315 | ✓✓ |
| GL | Einheitsamt | 1 | ja | https://www.gl.ch/verwaltung/sicherheit-und-justiz/justiz/betreibungs-konkursamt.html/1258 | ✓✓ |
| ZG | Gemeindeämter | 8 | ja | https://zg.ch/dam/jcr:87cb3853-5a22-4f9b-928e-40d220e2f906/Adressen%20Betreibungs%C3%A4mter%20Stand%20Februar%202023.pdf | ✓✓ |
| FR | Bezirks-/Regionalämter | 7 | ja | https://www.fr.ch/de/sjsd/baka | ✓ (Lücke: Rechtsgrundlage) |
| SO | Bezirks-/Regionalämter | 5 | ja | https://so.ch/verwaltung/finanzdepartement/betreibungsaemter/zuordnung-der-gemeinden-1/ | ✓✓ |
| BS | Einheitsamt | 1 | ja | https://www.bs.ch/gerichte-judikative/betreibungs-und-konkursamt | ✓✓ |
| BL | Einheitsamt | 1 | ja | https://www.baselland.ch/politik-und-behorden/direktionen/sicherheitsdirektion/zivilrechtsverwaltung/betreibungsamt/ | ✓✓ |
| SH | Einheitsamt | 1 | ja | https://sh.ch/CMS/Webseite/Kanton-Schaffhausen/Beh-rde/Justiz/Betreibungs--und-Konkursamt-407143-DE.html | ✓✓ |
| AR | Bezirks-/Regionalämter | 3 | ja | https://ar.ch/verwaltung/departement-inneres-und-sicherheit/departementssekretariat/betreibungsaemter-und-konkursamt/betreibungsaemter/ | ✓✓ |
| AI | Einheitsamt | 1 | ja | https://www.ai.ch/verwaltung/volkwirtschaftsdepartement/betreibungs-und-konkursamt | ✓✓ |
| SG | Gemeindeämter | ? | ja | https://www.sg.ch/recht/gerichte/organisation---standorte/kreisgerichte.html | ✓✓ |
| GR | Bezirks-/Regionalämter | 11 | ja | https://www.justiz-gr.ch/schuldbetreibung-und-konkurs/ueber-uns/betreibungs-und-konkursaemter/ | ✓✓ |
| AG | gemischt | ? | ja | https://www.betreibungsamt-ag.ch/v5/index.php/amtsverzeichnis | ✓ (Lücke: Verzeichnis) |
| TG | Bezirks-/Regionalämter | 5 | ja | https://www.tg.ch/justiz/zivil--und-strafrechtspflege.html/23 | ✓ (Lücke: Rechtsgrundlage) |
| TI | Bezirks-/Regionalämter | 8 | ja | https://www4.ti.ch/di/dg/sezione-di-esecuzione-e-fallimento/chi-siamo/uffici-esecuzione | ✓✓ |
| VD | Bezirks-/Regionalämter | 10 | ja | https://www.vd.ch/ojv/offices-des-poursuites | ✓✓ |
| VS | Bezirks-/Regionalämter | 5 | ja | https://www.vs.ch/de/web/spf/office-competent | ✓✓ |
| NE | Einheitsamt | 1 | ja | https://www.ne.ch/autorites/DESC/SEPF/Organisation/Pages/ofpo.aspx | ✓✓ |
| GE | Einheitsamt | 1 | ja | https://www.ge.ch/organisation/ocp-direction-office-cantonal-poursuites | ✓✓ |
| JU | Einheitsamt | 1 | ja | https://www.jura.ch/fr/Autorites/Administration/DFI/Office-des-poursuites-et-faillites-OPF.html | ✓✓ |

Legende Prüfung: ✓✓ = alle vier Prüfpunkte (System, Rechtsgrundlage,
Verzeichnis, Beispieladresse) im adversarialen Durchgang an der Quelle
bestätigt; ✓ = Kernbefund bestätigt, genannte Lücke im Kantonsabschnitt
erläutert. «?» bei Ämterzahl = amtlich nicht zählbar (dezentral).

## ZH — Bezirks-/Regionalämter (55 Ämter)

Der Kanton Zürich kennt kein kantonales Einheitsamt und auch nicht durchgehend ein Amt pro Gemeinde. Massgeblich sind Betreibungskreise: Ein Betreibungskreis umfasst das Gebiet einer oder mehrerer, in der Regel im gleichen Bezirk liegenden politischen Gemeinden (§ 1 Abs. 1 EG SchKG, LS 281). Der Regierungsrat legt die Betreibungskreise nach Anhörung der Gemeinden fest (§ 1 Abs. 2 EG SchKG). In jedem Kreis besteht ein Betreibungsamt; umfasst ein Kreis mehrere Gemeinden, vereinbaren diese Sitz und Bezeichnung des Amtes (§ 2 EG SchKG). Für die Städte Zürich und Winterthur können mehrere Kreise gebildet werden (§ 1 Abs. 1 EG SchKG); die Stadt Zürich hat 12, Winterthur 3 Stadtkreis-Ämter. Die Ämter sind in der Praxis vielfach mit den Gemeindeammann-/Stadtammannämtern zusammengefasst (Betreibungs- und Gemeindeammannamt). Die fachliche Aufsicht übt das dem Obergericht (Verwaltungskommission) zugeordnete Betreibungsinspektorat aus. Das System ist somit ein Regional-/Kreissystem mit weitgehender Orientierung an den Bezirken, ergänzt um Mehrfachkreise in den beiden Städten.

- **Rechtsgrundlage:** Einführungsgesetz zum Bundesgesetz über Schuldbetreibung und Konkurs (EG SchKG) (LS 281), Zürcher Gesetzessammlung (ZH-Lex / zhlex), Erlass Nr. 281; konsolidierte Fassung Stand 1.7.2025 (Version 129).
  Stand: konsolidierte Fassung, Stand 1.7.2025 (Erlass vom 26.11.2007, in Kraft seit 1.7.2010; geltend, nicht aufgehoben). https://www.notes.zh.ch/appl/zhlex_r.nsf/WebView/347C639309597C8EC1258CAD002C1BA9/$File/281_26.11.07_129.pdf (am Wortlaut geprüft).
  Kern: § 1 Abs. 1: "Ein Betreibungskreis umfasst das Gebiet einer oder mehrerer, in der Regel im gleichen Bezirk liegenden politischen Gemeinden. Für die Städte Zürich und Winterthur können mehrere Kreise gebildet werden." § 1 Abs. 2: "Der Regierungsrat legt nach Anhörung der Gemeinden die Betreibungskreise fest." § 2 Abs. 1: Umfasst ein Betreibungskreis mehrere Gemeinden, vereinbaren diese den Sitz und die Bezeichnung des Betreibungsamtes sowie wer die Rechte und Pflichten der Gemeinde wahrnimmt.
- **Amtliches Verzeichnis** (suchmaske, gemeindescharf ableitbar: ja): https://www.betreibungsinspektorat-zh.ch/deu/geo.php
  Das Betreibungsinspektorat des Kantons Zürich (dem Obergericht zugeordnet) führt unter 'Örtliche Zuständigkeiten' eine Suchmaske (nach PLZ/Ort) sowie eine PDF-Ämterliste (https://www.betreibungsinspektorat-zh.ch/deu/documents/Aemterliste_001.pdf). Die Ämterliste ordnet jeder politischen Gemeinde (mit Stadtkreis bei Zürich/Winterthur) das zuständige Betreibungsamt, den Bezirk und einen Link zur Amtsadresse zu. Damit ist die Zuordnung Gemeinde -> Betreibungsamt gemeindescharf und deterministisch ableitbar. Die Detailseiten (geo_det.php) nennen je Amt vollständige Postadresse und alle zugeordneten Gemeinden.
- **Beispielämter (adressgeprüft):**
  - Betreibungs- und Gemeindeammannamt Andelfingen — Schlossgasse 14, 8450 Andelfingen (https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=8)
  - Betreibungs- und Gemeindeammannamt Küsnacht-Zollikon-Zumikon — Postfach, 8125 Zollikerberg (zuständig für Forch, Küsnacht, Zollikerberg, Zollikon, Zumikon) (https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=158_8700)
- **Adversariale Prüfung:** System ja · Rechtsgrundlage ja · Verzeichnis ja · Adresse ja.
  **Korrekturen/Präzisierungen des Prüf-Agents:** 1) Aktuellste konsolidierte Fassung des EG SchKG ist nicht mehr Version 129, sondern Version 132 (laut zh.ch-Erlassseite als 'aktuell' markiert); die verifizierten §§ 1-3 sind inhaltlich unveraendert. 2) Beispiel-Adresse Kuesnacht-Zollikon-Zumikon: physische Amtsadresse ist 'Wilhofstrasse 1, 8125 Zollikerberg' (die Behauptung nennt nur das Postfach). 3) Anzahl: VGBZ/zh.ch nennen aktuell 56 Betreibungskreise; die Zahl 55 entspricht der Inspektorats-Zaehlung kombinierter Aemter - Zaehlweise sollte transparent gemacht werden. 4) Eine vom Regierungsrat am 5.11.2025 angestossene Reorganisation (Reduktion auf 34 bzw. 18 Kreise) ist noch nicht in Kraft, aber zu beobachten.
- **Risiken/Pflege:**
  - Die offizielle Zahl '55 Betreibungs- und Gemeindeammann-/Stadtammannämter' (Quelle: Betreibungsinspektorat) fasst Betreibungs- und Gemeindeammann-/Stadtammannämter zusammen; davon 12 in der Stadt Zürich und 3 in Winterthur. Die Zahl der reinen Betreibungskreise/-ämter kann je nach Zählung leicht abweichen; anzahlAemter=55 entspricht der amtlich genannten Gesamtzahl.
  - Gemeindefusionen und Zusammenlegungen von Betreibungskreisen wurden in den letzten Jahren mehrfach durch Regierungsratsbeschluss (Festsetzung der Betreibungskreise) angepasst; massgeblich ist stets die aktuelle Ämterliste/Suchmaske des Betreibungsinspektorats, nicht ältere Listen.
  - Der EG-SchKG-Erlassstand auf der zh.ch-Erlassseite (Fassung 108) war bis 1.1.2023 gültig und wurde abgelöst; belegt und gelesen wurde hier die geltende konsolidierte Fassung Stand 1.7.2025 (Version 129) aus der amtlichen Sammlung (notes.zh.ch/zhlex_r).
  - Die maschinelle Zählung der PDF-Ämterliste (rund 61 Verlinkungen) deckt sich nicht exakt mit der amtlich genannten Zahl 55, da Stadtkreise/Mehrfachzeilen und Gemeindeammannfunktionen die Zeilenzahl erhöhen; für die deterministische Zuordnung ist die Suchmaske/Detailseite massgeblich.

## BE — Bezirks-/Regionalämter (4 Ämter)

Der Kanton Bern führt das Betreibungs- und Konkurswesen über vier regionale Betreibungs- und Konkursämter, die je einer Verwaltungsregion entsprechen: Berner Jura-Seeland, Emmental-Oberaargau, Bern-Mittelland und Oberland (Art. 1 EGSchKG, BSG 281.1; der frühere fünfte Kreis "lit. b" ist aufgehoben). Diese vier Ämter unterhalten gemäss Art. 2 EGSchKG Dienststellen an insgesamt acht Standorten (Ostermundigen, Biel/Bienne, Aarberg, Sonceboz-Sombeval, Thun, Interlaken, Burgdorf, Langenthal). Es handelt sich also nicht um ein Einheitsamt und nicht um Gemeindeämter, sondern um ein regionales (verwaltungsregionsbasiertes) System mit Dienststellen. Die Zuordnung einer politischen Gemeinde zur zuständigen Region ergibt sich deterministisch über die Zugehörigkeit der Gemeinde zur Verwaltungsregion bzw. zum Verwaltungskreis; welche Dienststelle innerhalb der Region örtlich zuständig ist, richtet sich nach Art. 46 ff. SchKG (Wohnsitz/Sitz des Schuldners). Aufsichtsbehörde ist das Obergericht; die Standorte werden durch die Direktion für Inneres und Justiz (DIJ) festgelegt.

- **Rechtsgrundlage:** Einführungsgesetz zum Bundesgesetz über Schuldbetreibung und Konkurs (EGSchKG) (BSG 281.1), Systematische Gesetzessammlung des Kantons Bern (BSG), belex.sites.be.ch; Art. 1 (Betreibungs- und Konkursregionen) und Art. 2 (Sitz/Dienststellen).
  Stand: vom 16.03.1995, in Kraft seit 01.01.1997, geltende konsolidierte Fassung, nicht aufgehoben (abrogated=false). https://www.belex.sites.be.ch/app/de/texts_of_law/281.1 (am Wortlaut geprüft).
  Kern: Art. 1 Abs. 1: 'Für die Durchführung der Schuldbetreibung und der Konkurse bestehen folgende Regionen: a Berner Jura-Seeland, ... c Emmental-Oberaargau, d Bern-Mittelland, e Oberland', je den entsprechenden Verwaltungsregionen entsprechend (lit. b aufgehoben). Art. 2: 'Die Direktion für Inneres und Justiz bestimmt den Sitz der Betreibungs- und Konkursämter ... Zur Durchführung ... können die ... Ämter Dienststellen unterhalten.'
- **Amtliches Verzeichnis** (htmlListe, gemeindescharf ableitbar: nein): https://www.baka.dij.be.ch/de/start/ueber-uns/Standort.html
  Amtliche Seite der Betreibungs-, Aufsichts-, Konkurs- und Abwicklungsbehörden (BAKA) der Direktion für Inneres und Justiz. Sie listet die vier regionalen Ämter mit ihren acht Dienststellen-Standorten und Adressen (je Detailseite). Eine explizite Gemeindeliste je Amt/Dienststelle ist auf dieser Seite NICHT publiziert; die Region ergibt sich gemeindescharf aus der Verwaltungsregion/-kreis-Zugehörigkeit, die konkret zuständige Dienststelle aber erst über Art. 46 ff. SchKG (Schuldnerwohnsitz). Daher nur regionenscharf direkt aus der Liste ableitbar.
- **Beispielämter (adressgeprüft):**
  - Betreibungs- und Konkursamt Bern-Mittelland, Dienststelle Mittelland — Poststrasse 25, 3071 Ostermundigen (https://www.baka.dij.be.ch/de/start/ueber-uns/Standort/BA_Mittelland.html)
  - Betreibungs- und Konkursamt Berner Jura-Seeland, Dienststelle Seeland (Aarberg) — Stadtplatz 33, 3270 Aarberg (https://www.baka.dij.be.ch/de/start/ueber-uns/Standort/BA_Seeland.html)
- **Adversariale Prüfung:** System ja · Rechtsgrundlage ja · Verzeichnis ja · Adresse ja.
  **Korrekturen/Präzisierungen des Prüf-Agents:** Die Stand-/Datierungsangabe der Rechtsgrundlage ist zu praezisieren: Die Reduktion auf vier Betreibungs- und Konkursregionen (Aufhebung von Art. 1 lit. b EGSchKG) ist nicht Teil der Fassung von 1995/1997, sondern wurde per 01.01.2026 wirksam (Beschluss vom 03.09.2024). Die geltende konsolidierte Fassung ist seit 01.01.2026 in Kraft (nicht aufgehoben). Sachlich bleibt die Behauptung (4 regionale Aemter, 8 Dienststellen, regionsbasiertes System, beide Adressen) per heutigem Datum 2026-06-07 korrekt; lediglich die implizite Behauptung, lit. b sei bereits laenger/seit 1997 aufgehoben, ist falsch.
- **Risiken/Pflege:**
  - Gemeindescharfe Zuordnung Gemeinde→Dienststelle nicht direkt aus der amtlichen BAKA-Liste ableitbar: Die Region ergibt sich aus der Verwaltungsregion, die konkret örtlich zuständige Dienststelle innerhalb einer Region jedoch erst über Art. 46 ff. SchKG (Schuldnerwohnsitz). Es fehlen explizite Gemeindelisten je Dienststelle auf der Standort-Seite.
  - Art. 1 lit. b EGSchKG ist aufgehoben ('…'), d.h. ein früher bestehender fünfter Kreis wurde reduziert; aktuell vier Regionen. Bei älteren Quellen kann eine abweichende Kreiszahl erscheinen.
  - Anzahl 'Ämter' = 4 regionale Ämter; die amtliche Seite spricht zugleich von 8 Dienststellen-Standorten. Je nach Zählweise (Ämter vs. Standorte) ergeben sich 4 bzw. 8.
  - Gemeindefusionen im Kanton Bern können Gemeindenamen/-bestände ändern; die Regionenzuordnung über Verwaltungskreise bleibt jedoch massgeblich.
  - Die belex-Seite ist eine JavaScript-Anwendung; der Wortlaut wurde über die amtliche belex-API (api/de/texts_of_law/281.1) der kantonalen Sammlung verifiziert, nicht über Drittquellen.

## LU — gemischt (Anzahl offen)

Im Kanton Luzern bildet von Gesetzes wegen jede Einwohnergemeinde einen Betreibungskreis mit eigenem Betreibungsamt (Betreibungsbeamter + Stellvertreter), § 1 Abs. 1 EGSchKG (SRL 290). § 1 Abs. 2 erlaubt aber, dass sich zwei oder mehr Einwohnergemeinden mit Genehmigung des Regierungsrates zu einem Betreibungskreis vereinigen; § 1 Abs. 3 lässt bei Gemeindefusionen/-aufteilungen abweichende Regelungen zu. In der Praxis bestehen daher zahlreiche zusammengelegte Regional-/Kreisämter (z. B. Regionales Betreibungsamt Willisau für 11 Gemeinden, Region Sursee, Kreis Hochdorf, Kreis Hitzkirch, Region Entlebuch, Kreis Michelsamt, Oberer Sempachersee, Root+ usw.) neben einzelnen Gemeindeämtern (z. B. Luzern, Kriens, Emmen, Horw, Meggen). System ist somit gemischt: rechtliche Grundeinheit Gemeinde, faktisch viele regionale Zusammenschlüsse. Untere Aufsichtsbehörden sind die Bezirksgerichte, obere Aufsichtsbehörde das Kantonsgericht (§ 4 EGSchKG). Die Konkurskreise entsprechen demgegenüber den Gerichtsbezirken (§ 2 EGSchKG).

- **Rechtsgrundlage:** Einführungsgesetz zum Bundesgesetz über Schuldbetreibung und Konkurs (EGSchKG) (SRL Nr. 290), Systematische Rechtssammlung des Kantons Luzern (SRL), § 1 (Betreibungskreise).
  Stand: vom 22.10.1996, aktuelle Fassung in Kraft seit 01.07.2023; Erlass in Kraft seit 01.01.1997; nicht aufgehoben (abrogated=false). https://srl.lu.ch/app/de/texts_of_law/290 (am Wortlaut geprüft).
  Kern: § 1 Abs. 1: 'Jede Einwohnergemeinde bildet einen Betreibungskreis mit einem Betreibungsbeamten und einem Stellvertreter.' Abs. 2: 'Zwei oder mehr Einwohnergemeinden können sich mit Genehmigung des Regierungsrates zu einem Betreibungskreis vereinigen.'
- **Amtliches Verzeichnis** (htmlListe, gemeindescharf ableitbar: ja): https://gerichte.lu.ch/organisation/betreibungsaemter
  Die amtliche Justizportal-Seite des Kantons Luzern (gerichte.lu.ch) zur Organisation der Betreibungsämter verweist auf die offizielle Liste 'Betreibungsämter des Kantons Luzern' (gerichte.lu.ch -> betreibungsaemter-zentralschweiz.ch/ueber-uns/betreibungsaemter), die als Tabelle für JEDE der rund 80 Luzerner Gemeinden das zuständige Betreibungsamt, das übergeordnete Bezirksgericht, die vollständige Adresse, PLZ/Ort und Telefon auflistet. Die Zuordnung Gemeinde->Amt ist damit gemeindescharf (eine Zeile pro Gemeinde) deterministisch ableitbar. Ergänzend führt der Kanton im Geoportal (daten.geo.lu.ch, Datensatz 'Betreibungskreise', GRZBTRKR) die Kreise flächenscharf.
- **Beispielämter (adressgeprüft):**
  - Betreibungsamt Luzern — Winkelriedstrasse 14, 6003 Luzern (https://betreibungsaemter-zentralschweiz.ch/ueber-uns/betreibungsaemter/)
  - Betreibungsamt Kreis Hochdorf (deckt u. a. Hochdorf, Hohenrain) — Sagenbachstrasse 1, 6280 Hochdorf (https://betreibungsaemter-zentralschweiz.ch/ueber-uns/betreibungsaemter/)
- **Adversariale Prüfung:** System ja · Rechtsgrundlage ja · Verzeichnis ja · Adresse ja.
  **Korrekturen/Präzisierungen des Prüf-Agents:** Praezisierung Aufsichtsbehoerden: Untere kantonale Aufsichtsbehoerde ist NICHT 'das Bezirksgericht', sondern eine Einzelrichterin/ein Einzelrichter des betreffenden Gerichtsbezirks; obere Aufsichtsbehoerde ist die Schuldbetreibungs- und Konkurskommission des Kantonsgerichts (gerichte.lu.ch). Die Aussage 'untere Aufsichtsbehoerden sind die Bezirksgerichte' ist daher zu ungenau. Hinweis zur Rechtsgrundlage: Wortlaut § 1 Abs. 1/2 und § 2 sind bestaetigt, jedoch konnten der exakte Stand/das Inkrafttretensdatum (01.07.2023) sowie der Wortlaut von § 1 Abs. 3 nicht direkt an der Primaerquelle srl.lu.ch (JS-Render 'LexWork') verifiziert werden — bei strenger Zitierpflicht ist der Stand am Originalerlass nachzupruefen. Uebrige Behauptungen (System gemischt, Verzeichnis gemeindescharf, beide Beispiel-Adressen, anzahlAemter=null) sind bestaetigt.
- **Risiken/Pflege:**
  - Exakte Ämterzahl nicht eindeutig bestimmbar: Die amtlich verlinkte Liste enthält Inkonsistenzen (gleiches Amt unter wechselnden Namensvarianten je nach führender Gemeinde, abweichende PLZ/Telefon-Nebenstellen für dasselbe Amt, z. B. Region Sursee, Hochdorf). Grobe Schätzung rund 30-40 Betreibungskreise; anzahlAemter daher null gesetzt.
  - Das maschinell ausgewertete Verzeichnis liegt formal auf betreibungsaemter-zentralschweiz.ch (Verband der Betreibungs- und Konkursbeamten Zentralschweiz). Diese Liste wird jedoch vom amtlichen Justizportal gerichte.lu.ch ausdrücklich als offizielle Liste der Luzerner Betreibungsämter verlinkt; die rechtliche Grundlage selbst stammt aus der amtlichen SRL (srl.lu.ch).
  - Gemeindefusionen und Amtszusammenlegungen der letzten Jahre verändern die Zuordnung laufend (z. B. Michelsamt, Oberer Sempachersee, Root+). Bei Abweichungen ist die jeweils aktuellste Fassung der gerichte.lu.ch-verlinkten Liste bzw. des Geoportal-Datensatzes massgebend.
  - § 2 EGSchKG (Konkurskreise = Gerichtsbezirke) nicht mit dem Betreibungskreis-System verwechseln; für die Betreibung gilt die Gemeinde/Kreis-Zuordnung nach § 1.

## UR — gemischt (2 Ämter)

Betreibung und Konkurs sind im Kanton Uri getrennt organisiert. Konkurs: Der ganze Kanton bildet EINEN Konkurskreis mit dem kantonalen Konkursamt Uri (Art. 4 EG/SchKG, RB 9.2421). Betreibung: Grundsatz ist je Einwohnergemeinde ein Betreibungskreis (Gemeindeamt-Modell, Art. 3 Abs. 1 EG/SchKG); zwei oder mehr Gemeinden dürfen sich mit Genehmigung des Regierungsrates zu einem Betreibungskreis vereinigen (Art. 3 Abs. 2). Praktisch hat Uri diese Fusionsmöglichkeit fast vollständig genutzt: Es bestehen heute nur noch ZWEI Betreibungsämter — das Betreibungsamt Altdorf (für die Gemeinde Altdorf) und das Regionale Betreibungsamt Erstfeld, das die übrigen 18 Urner Gemeinden betreut. Daher ist das System ein gemischtes (rechtlich Gemeindemodell mit weitgehender regionaler Zusammenlegung). Aufsichtsbehörde ist die Schuldbetreibungs- und Konkurskommission des Obergerichts (Art. 12 Abs. 2 EG/SchKG).

- **Rechtsgrundlage:** Gesetz über die Einführung des Bundesgesetzes über Schuldbetreibung und Konkurs (EG/SchKG) (RB 9.2421), Urner Rechtsbuch (RB) 9.2421, vom 01.12.1996, in Kraft seit 01.04.1997.
  Stand: in Kraft seit 01.04.1997 (Stand 01.04.1997); nicht aufgehoben (abrogated=false gemäss LexWork-API der amtlichen Sammlung). https://rechtsbuch.ur.ch/app/de/texts_of_law/9.2421 (am Wortlaut geprüft).
  Kern: Art. 3 (Betreibungskreise) Abs. 1: «Jede Einwohnergemeinde bildet einen Betreibungskreis mit einem Betreibungsbeamten und einem oder mehreren Stellvertretern.» Abs. 2: «Zwei oder mehr Einwohnergemeinden können sich mit Genehmigung des Regierungsrates zu einem Betreibungskreis vereinigen.» Art. 4 (Konkurskreis) Abs. 1: «Der ganze Kanton bildet einen Konkurskreis mit einem Konkursbeamten und einem oder mehreren Stellvertretern.»
- **Amtliches Verzeichnis** (htmlListe, gemeindescharf ableitbar: ja): https://www.ur.ch/rechtsgebiete/3912
  Die amtliche Kantonsseite (Rechtsgebiet Schuldbetreibungs- und Konkursrecht) verweist auf die zwei Betreibungsämter (Altdorf, Erstfeld) und das Konkursamt Uri. Gemeindescharf ableitbar: Das Regionale Betreibungsamt Erstfeld listet auf seiner amtlichen Seite alle 18 zugehörigen Gemeinden explizit auf; die verbleibende Gemeinde Altdorf wird vom Betreibungsamt Altdorf bedient. Da Uri 19 Gemeinden hat (18 + Altdorf), ist die Zuordnung Gemeinde→Amt vollständig und eindeutig.
- **Beispielämter (adressgeprüft):**
  - Regionales Betreibungsamt Erstfeld (für 18 Gemeinden: Andermatt, Attinghausen, Bürglen, Erstfeld, Flüelen, Göschenen, Gurtnellen, Hospental, Isenthal, Realp, Schattdorf, Seedorf, Seelisberg, Silenen, Sisikon, Spiringen, Unterschächen, Wassen) — Gotthardstrasse 99, Postfach 51, 6472 Erstfeld; Tel. 041 882 01 46; betreibungsamt@ba-erstfeld.ch (https://betreibungsamt-erstfeld.ch/)
  - Betreibungsamt Altdorf (für die Gemeinde Altdorf) — Tellsgasse 25, 6460 Altdorf UR; Tel. 041 874 12 21; Fax 041 874 12 14; betreibungsamt@altdorf.ch (https://www.altdorf.ch/aemter/2594)
- **Adversariale Prüfung:** System ja · Rechtsgrundlage ja · Verzeichnis ja · Adresse ja.
- **Risiken/Pflege:**
  - Betreibung und Konkurs sind getrennt: Das kantonale Konkursamt Uri (Dätwylerstrasse 15, 6460 Altdorf; Tel. +41 41 871 00 94; info@konkursamt-uri.ch, Quelle https://www.ur.ch/aemter/2572) ist ein eigenständiges Amt und NICHT in der Zählung der zwei Betreibungsämter enthalten (Art. 4 EG/SchKG: ein kantonaler Konkurskreis).
  - Das EG/SchKG (RB 9.2421) regelt nur das Prinzip (je Gemeinde ein Kreis, Fusion mit Genehmigung des Regierungsrates), nennt aber NICHT die konkreten heutigen Betreibungskreise/Ämter. Die tatsächliche Aufteilung in genau zwei Ämter (Altdorf + Erstfeld) stützt sich auf die amtlichen Webseiten der Ämter bzw. des Kantons, nicht auf den Gesetzeswortlaut.
  - Die offizielle Detailseite des Betreibungsamts Altdorf (www.altdorf.ch/aemter/2594) konnte wegen eines TLS-Zertifikatsfehlers nicht direkt abgerufen werden; die Adresse Tellsgasse 25, 6460 Altdorf wurde über einen Verzeichnisdienst (Wegweiser, nicht amtlich) bestätigt — vor produktiver Nutzung am amtlichen altdorf.ch-Eintrag gegenprüfen.
  - Stand-Hinweis: Die LexWork-API der amtlichen Urner Sammlung weist als aktuelle (einzige) Version weiterhin die Fassung mit Stand 01.04.1997 aus; abrogated=false. Bei künftigen Gemeindefusionen oder Amts-Zusammenlegungen kann sich die Zahl/Zuordnung ändern — Ämterseiten regelmässig prüfen.

## SZ — gemischt (11 Ämter)

Gesetzlicher Grundsatz (§ 1 Abs. 1 EGzSchKG, SRSZ 270.110): Jede Gemeinde bildet einen Betreibungskreis; der Gemeinderat wählt den Betreibungsbeamten. Abweichend davon können sich mehrere Gemeinden zu einem gemeinsamen Betreibungskreis vereinigen oder die Aufgaben des Betreibungsamtes an einen Bezirk übertragen (§ 1 Abs. 2); zudem kann der Regierungsrat Gemeinden zu einem Kreis vereinigen (§ 1 Abs. 3). Tatsächlich haben die Gemeinden von dieser Möglichkeit Gebrauch gemacht, sodass der Kanton heute nicht 30 Gemeindeämter, sondern 11 zusammengelegte Betreibungsämter/Betreibungskreise kennt (z. B. Betreibungsamt Höfe für mehrere Gemeinden, Betreibungsamt Schwyz für Schwyz/Steinen/Sattel/Rothenthurm). System ist daher gemischt: per Gesetz gemeindebasiert, in der Praxis durch Vereinigungen/Bezirksübertragung regionalisiert. Aufsicht: Bezirksgerichtspraesident = untere, Kantonsgericht = obere Aufsichtsbehoerde (§ 10). Das Verzeichnis des Verbands der Betreibungsbeamten (ba-sz.ch) listet je Amt die zugehoerigen Gemeinden, womit die Zuordnung Gemeinde -> Amt gemeindescharf ableitbar ist.

- **Rechtsgrundlage:** Einführungsgesetz zum Bundesgesetz über Schuldbetreibung und Konkurs (EGzSchKG) (SRSZ 270.110), § 1 (Betreibungskreise); ergänzend § 2 (Konkurskreise) und § 10 (Aufsichtsbehörden).
  Stand: Vom 25. Oktober 1974; konsolidierte Fassung Stand SRSZ 1.2.2021; letzte Änderungen in Kraft 1.6.2020 (KRB vom 18.9.2019); in Kraft, nicht aufgehoben. https://www.sz.ch/public/upload/assets/5598/270_110.pdf (am Wortlaut geprüft).
  Kern: § 1 Abs. 1: 'Jede Gemeinde bildet einen Betreibungskreis. Der Gemeinderat wählt den Betreibungsbeamten und den Stellvertreter.' Abs. 2: 'Mehrere Gemeinden können sich zu einem Betreibungskreis vereinigen oder die Aufgaben des Betreibungsamtes an einen Bezirk übertragen' (Genehmigung durch den Regierungsrat). Abs. 3: Der Regierungsrat kann, wenn es die Verhältnisse erfordern, Gemeinden in einen Betreibungskreis vereinigen.
- **Amtliches Verzeichnis** (htmlListe, gemeindescharf ableitbar: ja): https://ba-sz.ch/home/aemterverzeichnis/
  Ämterverzeichnis des Verbands der Betreibungsbeamten des Kantons Schwyz: HTML-Liste aller 11 Betreibungsämter mit Postadresse und den jeweils zugeordneten Gemeinden, womit die Zuordnung Gemeinde -> Amt gemeindescharf möglich ist. Hinweis: ba-sz.ch ist die Branchenverbands-Seite der amtlichen Betreibungsbeamten; die kantonale Rechtsgrundlage selbst (EGzSchKG) findet sich in der systematischen Gesetzsammlung des Kantons unter sz.ch. Ein einheitliches kantonales Behoerdenportal mit Gemeinde-Amt-Liste mit Adressen wird primär über ba-sz.ch sowie die einzelnen Gemeindewebseiten abgebildet.
- **Beispielämter (adressgeprüft):**
  - Betreibungsamt Schwyz — Herrengasse 23, Postfach 23, 6431 Schwyz (zuständig für die Gemeinden Schwyz, Steinen, Sattel, Rothenthurm) (https://ba-sz.ch/home/aemterverzeichnis/)
  - Betreibungsamt Höfe — Rebhaldenstrasse 15, 8807 Freienbach (zuständig u. a. für Freienbach/Pfäffikon, Wollerau, Feusisberg) (https://ba-sz.ch/home/aemterverzeichnis/)
- **Adversariale Prüfung:** System ja · Rechtsgrundlage ja · Verzeichnis ja · Adresse ja.
  **Korrekturen/Präzisierungen des Prüf-Agents:** Keine inhaltlichen Korrekturen noetig - alle Kernbehauptungen wurden an der Quelle bestaetigt. Praezisierungen: (1) Die ba-sz.ch-Quelle nennt die Hoefe-Adresse als 'Rebhaldenstrasse 15, 8807 Freienbach SZ' (mit Kantonskuerzel 'SZ'). (2) Die Konfidenz koennte von 'mittel' auf 'mittel-hoch' angehoben werden, da sowohl Gesetzeswortlaut (§ 1, § 10 zeichengenau aus amtlicher SRSZ-PDF extrahiert) als auch Verzeichnis (11 Aemter mit Adressen) und die Beispiel-Adresse Schwyz vollstaendig verifiziert sind und keine Gegenindizien gefunden wurden.
- **Risiken/Pflege:**
  - Die im Gesetz (§ 1 Abs. 1) verankerte Regel 'jede Gemeinde ein Betreibungskreis' entspricht nicht der gelebten Praxis: durch Vereinigungen bzw. Bezirksuebertragungen (§ 1 Abs. 2/3) bestehen faktisch nur 11 Aemter. Wer allein vom Gesetzeswortlaut ausgeht, koennte faelschlich auf ein Amt je Gemeinde schliessen.
  - Die zaehlbare, gemeindescharfe Liste (11 Aemter) stammt von ba-sz.ch (Verband der Betreibungsbeamten), nicht von einem rein kantonalen Justizportal. ba-sz.ch ist zwar die offizielle Verbandsseite der amtlichen Betreibungsbeamten, aber kein hoheitliches Behoerdenverzeichnis - kantonale Bestaetigung der genauen Gemeindezuordnung idealerweise zusaetzlich ueber die jeweiligen Gemeindewebseiten verifizieren.
  - Gemeindefusionen/Amts-Zusammenlegungen der letzten Jahre koennen die Zuordnung einzelner Ortschaften veraendern (z. B. Reorganisation im Bezirk March: Aemter Altendorf/Lachen, Schuebelbach, Wangen). Bei Widerspruechen die neuere Quelle bevorzugen.
  - Der PDF-Erlass war ueber WebFetch nicht direkt textlich lesbar; der Wortlaut wurde durch separates Herunterladen und Textextraktion der amtlichen PDF (sz.ch, SRSZ 270.110) geprueft.
  - Anzahl 11 aus der Verbandsliste abgeleitet; eine exakt deckungsgleiche, behoerdlich publizierte Gesamtzahl auf einem kantonalen Portal wurde nicht separat als Zaehlquelle herangezogen.

## OW — Einheitsamt (1 Amt)

Obwalden ist ein Einheitskanton mit einem einzigen kantonalen Betreibungs- und Konkursamt. Gemäss Art. 77 Abs. 1 des Gesetzes über die Gerichtsorganisation (GOG, GDB 134.1) bildet der Kanton EINEN Betreibungs- und Konkurskreis; das ganze Kantonsgebiet (alle politischen Gemeinden: Sarnen, Kerns, Sachseln, Alpnach, Giswil, Lungern, Engelberg) gehört zu diesem einen Kreis. Sitz des Amtes ist Sarnen (Enetriederstrasse 1, 6060 Sarnen). Das Gesetz sieht in Engelberg eine Zweigstelle des Betreibungsamtes vor (Dorfstrasse 1, 6390 Engelberg); diese ist gemäss der amtlichen Kantonsseite jedoch bis auf Weiteres geschlossen, sodass faktisch alle Dienstleistungen über den Standort Sarnen laufen. Das Amt ist organisatorisch eine Abteilung des Sicherheits- und Sozialdepartements (Art. 76a GOG); Aufsichtsbehörde ist das Obergericht (Art. 76 GOG). Die Zuordnung Gemeinde->Amt ist trivial deterministisch: jede der politischen Gemeinden Obwaldens ist dem einen Betreibungs- und Konkursamt Obwalden in Sarnen zugeordnet.

- **Rechtsgrundlage:** Gesetz über die Gerichtsorganisation (GOG) (GDB 134.1), Systematische Sammlung des Kantons Obwalden (GDB), Art. 77 (Betreibungs- und Konkursamt); vgl. Art. 76 und Art. 76a.
  Stand: vom 22.09.1996, in Kraft seit 15.02.1997, aktuelle Fassung Stand 01.04.2022 (Beschlussdatum 27.01.2022); nicht aufgehoben. https://gdb.ow.ch/app/de/texts_of_law/134.1 (am Wortlaut geprüft).
  Kern: Art. 77 Abs. 1: 'Der Kanton bildet einen Betreibungs- und Konkurskreis.' Abs. 2: 'Der Sitz des Betreibungs- und Konkursamtes befindet sich in Sarnen; in Engelberg wird eine Zweigstelle des Betreibungsamtes geführt.'
- **Amtliches Verzeichnis** (htmlListe, gemeindescharf ableitbar: ja): https://www.ow.ch/fachbereiche/1906
  Amtliche Kantonsseite (ow.ch) des Betreibungs- und Konkursamts mit vollständiger Postadresse, Kontaktangaben und Öffnungszeiten. Da nur ein einziges kantonales Amt für den gesamten Kanton (einen Betreibungs- und Konkurskreis) zuständig ist, ist die Zuordnung jeder politischen Gemeinde zum Amt eindeutig/gemeindescharf ableitbar. Die Seite weist zudem ausdrücklich darauf hin, dass die Zweigstelle in Engelberg (Dorfstrasse 1, 6390 Engelberg) bis auf Weiteres geschlossen ist.
- **Beispielämter (adressgeprüft):**
  - Betreibungs- und Konkursamt Obwalden (Hauptsitz) — Enetriederstrasse 1, 6060 Sarnen (https://www.ow.ch/fachbereiche/1906)
  - Betreibungs- und Konkursamt Obwalden, Zweigstelle Engelberg (Betreibungsamt; gemäss amtlicher Seite bis auf Weiteres geschlossen) — Dorfstrasse 1, 6390 Engelberg (https://www.ow.ch/fachbereiche/1906)
- **Adversariale Prüfung:** System ja · Rechtsgrundlage nein · Verzeichnis ja · Adresse ja.
  **Korrekturen/Präzisierungen des Prüf-Agents:** System (Einheitsamt, 1 kantonales Betreibungs- und Konkursamt in Sarnen), Verzeichnis-URL und beide Beispieladressen (Sarnen Enetriederstrasse 1, 6060; Engelberg Dorfstrasse 1, 6390 - geschlossen) sind korrekt und durch mehrere Quellen belegt. Einschraenkung: Der Gesetzeswortlaut (GOG, GDB 134.1, Art. 76/76a/77) konnte an der amtlichen Quelle NICHT geprueft werden - gdb.ow.ch ist JS-gerendert und lieferte nur einen Auszug bis ca. Art. 73; die behaupteten API-Endpunkte ergaben HTTP 404. Damit sind die woertlichen Zitate, die Versionsangabe 'Stand 01.04.2022' und insbesondere die Unterscheidung 'Zweigstelle des Betreibungsamtes' (Art. 77 Abs. 2) unverifiziert; rechtsgrundlageBestaetigt=false. Die inhaltliche Einordnung als Einheitsamt bleibt jedoch durch unabhaengige Quellen gestuetzt.
- **Risiken/Pflege:**
  - Die im Gesetz (Art. 77 Abs. 2 GOG) vorgesehene Zweigstelle des Betreibungsamtes in Engelberg ist gemäss der amtlichen Kantonsseite (ow.ch/fachbereiche/1906) bis auf Weiteres geschlossen. Es besteht daher eine Diskrepanz zwischen dem (weiterhin geltenden) Gesetzeswortlaut und dem faktischen Betrieb: praktisch werden alle Dienstleistungen am Standort Sarnen erbracht.
  - Die offizielle GDB-Seite (gdb.ow.ch) ist JavaScript-gerendert; der Gesetzeswortlaut wurde über die offizielle GDB-API (gdb.ow.ch/api) des Kantons Obwalden im Originaltext abgerufen und verifiziert (gleiche amtliche Quelle).
  - Telefon-/Detailangaben (z. B. Adresse der Zweigstelle Engelberg) stammen von der amtlichen Kantonsseite; sie sollten vor produktivem Einsatz periodisch gegen ow.ch nachgeprüft werden, da die Engelberg-Situation 'bis auf Weiteres' und damit potenziell änderbar ist.

## NW — Einheitsamt (1 Amt)

Der Kanton Nidwalden bildet für die Durchführung der Schuldbetreibungen und Konkurse einen einzigen Kreis und führt ein einziges kantonales Betreibungs- und Konkursamt (Einheitsamt) mit Sitz in Stans (Engelbergstrasse 34, 6371 Stans). Es ist zuständig für Betreibungen gegen Personen mit Wohnsitz bzw. (Haupt-)Sitz im gesamten Kantonsgebiet sowie für die Durchführung der Konkurse. Damit werden alle politischen Gemeinden Nidwaldens (z. B. Stans, Hergiswil, Buochs, Beckenried, Stansstad, Ennetbürgen, Dallenwil, Oberdorf, Wolfenschiessen, Emmetten, Ennetmoos und Engelberg gehört zu OW, nicht NW) ausnahmslos vom kantonalen Betreibungs- und Konkursamt in Stans bedient. Es bestehen keine Bezirks-, Regional- oder Gemeindeämter und keine Zweigstellen. Rechtsgrundlage ist Art. 1 EG SchKG (NG 271.1): "Der Kanton bildet ... einen Kreis", Art. 2: "Der Kanton führt ein Betreibungs- und Konkursamt." Die Lokalisierung des Sitzes (Stans) ergibt sich aus dem amtlichen Auftritt des Kantons (nw.ch/baka).

- **Rechtsgrundlage:** Einführungsgesetz zum Bundesgesetz über Schuldbetreibung und Konkurs (EG SchKG) (NG 271.1), Art. 1 und Art. 2 EG SchKG, Systematische Gesetzessammlung des Kantons Nidwalden (NG).
  Stand: 01.01.2013 (Beschluss vom 26.09.2012), geltende konsolidierte Fassung, nicht aufgehoben. https://gesetze.nw.ch/app/de/texts_of_law/271.1 (am Wortlaut geprüft).
  Kern: Art. 1: 'Der Kanton bildet für die Durchführung der Schuldbetreibungen und der Konkurse einen Kreis.' Art. 2: 'Der Kanton führt ein Betreibungs- und Konkursamt.' — Damit ein einziges kantonales Einheitsamt für das ganze Kantonsgebiet.
- **Amtliches Verzeichnis** (htmlListe, gemeindescharf ableitbar: ja): https://www.nw.ch/baka/315
  Amtlicher Auftritt des Kantons Nidwalden (Betreibungs- und Konkursamt). Da es nur ein einziges kantonales Amt mit Sitz in Stans gibt und dieses für alle Einwohner/Sitzinhaber im gesamten Kantonsgebiet zuständig ist, ist die Zuordnung Gemeinde -> Amt trivial gemeindescharf: jede politische Gemeinde Nidwaldens wird vom Betreibungs- und Konkursamt Nidwalden in Stans bedient. Adresse mit vollständigen Kontaktdaten und Öffnungszeiten auf der Seite verzeichnet.
- **Beispielämter (adressgeprüft):**
  - Betreibungs- und Konkursamt Nidwalden (kantonales Einheitsamt, Betreibungsamt) — Betreibungs- und Konkursamt Nidwalden, Engelbergstrasse 34, Postfach 1243, 6371 Stans (https://www.nw.ch/baka/315)
  - Betreibungs- und Konkursamt Nidwalden (kantonales Einheitsamt, zugleich Konkursamt; keine separate Zweigstelle) — Betreibungs- und Konkursamt Nidwalden, Engelbergstrasse 34, Postfach 1243, 6371 Stans, Tel. 041 618 76 70 (https://www.nw.ch/baka/315)
- **Adversariale Prüfung:** System ja · Rechtsgrundlage ja · Verzeichnis ja · Adresse ja.
  **Korrekturen/Präzisierungen des Prüf-Agents:** Kleine Praezisierung zur Behauptung: Der Sitz 'Stans' ist entgegen dem Risikohinweis der Behauptung (Risiko 2) sehr wahrscheinlich Teil des Gesetzeswortlauts von Art. 1 EG SchKG - die amtliche Kantonsseite nw.ch/baka/315 zitiert Art. 1 als 'einen Kreis, mit Sitz in Stans'. Einschraenkung: Der exakte Wortlaut von Art. 1/Art. 2 konnte an der amtlichen Quelle gesetze.nw.ch nicht zeichengenau verifiziert werden, da die Seite JavaScript-gerendert ist und kein Text ausgeliefert wurde; die Bestaetigung stuetzt sich auf das amtliche Zitat der Kantonsverwaltung. Adresse: PLZ 6371 (Postfach) ist korrekt; die Haus-PLZ von Stans ist 6370 (search.ch) - beide zutreffend. Sonst keine Korrekturen; System, Verzeichnis und Adresse vollumfaenglich bestaetigt.
- **Risiken/Pflege:**
  - Es gibt nur EIN Amt (Einheitsamt). Die geforderten 2 Beispiele beziehen sich daher beide auf dasselbe Amt am gleichen Standort in Stans; es existieren keine Zweigstellen und keine zweite Adresse.
  - Der Sitz 'Stans' steht nicht im Gesetzeswortlaut (Art. 1/2 EG SchKG nennen nur 'einen Kreis' bzw. 'ein Betreibungs- und Konkursamt'); die Lokalisierung Stans stammt aus dem amtlichen Verwaltungsauftritt nw.ch/baka, nicht aus dem Erlass.
  - Der Gesetzeswortlaut (Art. 1, Art. 2) wurde über die API-Auslieferung der amtlichen NG-Sammlung (gesetze.nw.ch, LexWork) abgerufen; die interaktive HTML-Ansicht rendert JavaScript-basiert. Stand 01.01.2013, keine Hinweise auf Aufhebung gefunden.
  - Engelberg liegt geografisch nahe, gehört aber zum Kanton Obwalden (OW), nicht Nidwalden — bei Gemeindezuordnungen nicht verwechseln.

## GL — Einheitsamt (1 Amt)

Der Kanton Glarus kennt ein kantonales Einheitsamt: Gemäss Art. 1 EG SchKG (III D/1) bildet der ganze Kanton einen einzigen Betreibungs- und Konkurskreis. Betreibungsamt und Konkursamt sind nach Art. 2 zusammengelegt zum "Betreibungs- und Konkursamt des Kantons Glarus" mit Sitz an der Zwinglistrasse 8, 8750 Glarus. Das Amt ist Teil der kantonalen Verwaltung und in das vom Regierungsrat bezeichnete Departement (Sicherheit und Justiz) eingegliedert (Art. 4). Es gibt keine Bezirks- oder Gemeindeämter und keine Zweigstellen. Die Zuordnung Gemeinde -> Betreibungsamt ist damit trivial deterministisch: Alle drei politischen Gemeinden des Kantons (Glarus, Glarus Nord, Glarus Süd) sind diesem einen Amt zugeordnet. (Hinweis: Glarus hat seit der Gemeindefusion 2011 nur noch 3 politische Gemeinden.) Innerhalb des Amts bestehen funktional getrennte Schalter/Telefonnummern fuer Betreibung (055 646 69 30, betreibungsamt@gl.ch) und Konkurs (055 646 69 45, konkursamt@gl.ch), beide an derselben Adresse.

- **Rechtsgrundlage:** Gesetz über die Einführung des Bundesgesetzes über Schuldbetreibung und Konkurs (EG SchKG) (III D/1), Systematische Gesetzessammlung des Kantons Glarus (gl.lexwork.naz.ch), Erlass III D/1; SBE VI/5 413.
  Stand: Vom 4. Mai 1997 (erlassen von der Landsgemeinde am 4. Mai 1997), konsolidierte Fassung Stand 1. September 2014 — geltend, nicht aufgehoben. https://gl.lexwork.naz.ch/de/dta/III-D.1.pdf (am Wortlaut geprüft).
  Kern: Art. 1: "Der Kanton Glarus bildet für die Durchführung der Schuldbetreibungen und Konkurse einen einzigen Betreibungs- und Konkurskreis." Art. 2 Abs. 1: "Betreibungs- und Konkursamt sind zusammengelegt."
- **Amtliches Verzeichnis** (htmlListe, gemeindescharf ableitbar: ja): https://www.gl.ch/verwaltung/sicherheit-und-justiz/justiz/betreibungs-konkursamt.html/1258
  Amtliche Seite des Kantons Glarus (Departement Sicherheit und Justiz, Justiz) zum Betreibungs- und Konkursamt mit voller Postadresse und Kontaktangaben. Da es nur EIN kantonales Amt für den ganzen Kanton gibt (Art. 1 EG SchKG, einziger Betreibungs- und Konkurskreis), ist die Zuordnung Gemeinde->Amt trivial gemeindescharf: alle drei politischen Gemeinden (Glarus, Glarus Nord, Glarus Süd) gehören zu diesem Amt. Die Seite selbst listet keine Gemeinden auf, weil keine Aufteilung besteht.
- **Beispielämter (adressgeprüft):**
  - Betreibungs- und Konkursamt des Kantons Glarus — Betreibungsamt — Departement Sicherheit und Justiz, Betreibungs- und Konkursamt, Zwinglistrasse 8, 8750 Glarus (Tel. 055 646 69 30, betreibungsamt@gl.ch) (https://www.gl.ch/verwaltung/sicherheit-und-justiz/justiz/betreibungs-konkursamt.html/1258)
  - Betreibungs- und Konkursamt des Kantons Glarus — Konkursamt (selbe Amtsstelle, anderer Schalter) — Departement Sicherheit und Justiz, Betreibungs- und Konkursamt, Zwinglistrasse 8, 8750 Glarus (Tel. 055 646 69 45, konkursamt@gl.ch) (https://www.gl.ch/verwaltung/sicherheit-und-justiz/justiz/betreibungs-konkursamt.html/1258)
- **Adversariale Prüfung:** System ja · Rechtsgrundlage ja · Verzeichnis ja · Adresse ja.
- **Risiken/Pflege:**
  - Einheitsamt: Betreibungs- und Konkursamt sind zusammengelegt (Art. 2 EG SchKG); die 'zwei Beispiele' sind daher nicht zwei verschiedene Ämter, sondern die funktional getrennten Schalter Betreibung und Konkurs derselben Amtsstelle an identischer Adresse.
  - Die gl.ch-Seite und die FAQ nennen keinen Postfach-Eintrag; eine Suche ergab teils 'Postfach 168, 8750 Glarus' (Sekundärquellen/Verzeichnisdienste). Da die amtliche Seite nur Zwinglistrasse 8, 8750 Glarus ausweist, wurde die Postfach-Angabe nicht in die Adresse übernommen (nicht amtlich bestätigt).
  - Gemeindefusion 2011: Der Kanton hat nur noch 3 politische Gemeinden (Glarus, Glarus Nord, Glarus Süd). Bei Datenbeständen mit alten Gemeindenamen (z.B. Näfels, Mollis, Netstal, Ennenda) müssen diese auf die heutigen drei Gemeinden gemappt werden — alle gehören ohnehin zum selben Einheitsamt, daher kein Zuordnungsrisiko fürs Betreibungsamt.
  - amWortlautGeprueft=true: Der EG-SchKG-Wortlaut (Art. 1 und 2) wurde aus dem amtlichen PDF der kantonalen Gesetzessammlung (III D/1, Stand 1.9.2014) lokal extrahiert und gelesen.

## ZG — Gemeindeämter (8 Ämter)

Das Betreibungswesen im Kanton Zug ist gemeindebasiert organisiert: Nach § 1 Abs. 1 EG SchKG (BGS 231.1) bilden die Einwohnergemeinden des Kantons Zug je einen Betreibungskreis (11 Einwohnergemeinden = grundsätzlich 11 Kreise). § 1 Abs. 2 erlaubt mehreren Gemeinden, mit Zustimmung des Obergerichts gemeinsam einen Betreibungskreis zu bilden. Den Betreibungsbeamten/die Betreibungsbeamtin und die Stellvertretung ernennt der jeweilige Gemeinderat (§ 3 EG SchKG); Aufsichtsbehörde ist die Beschwerdeabteilung des Obergerichts. Der Kanton bildet einen einzigen Konkurskreis mit einem kantonalen Konkursamt (§ 2). In der Praxis bestehen wegen Amts-Zusammenlegungen weniger als 11 Betreibungsämter: Steinhausen wurde per 01.04.2017 und Walchwil per 01.01.2023 mit dem Betreibungsamt Zug zusammengelegt; Oberägeri und Unterägeri werden gemeinsam vom Betreibungsamt Ägerital (Unterägeri) geführt; Neuheim wird über die Verwaltung in Menzingen abgewickelt (gleiche Telefon-/E-Mail-Adresse wie Menzingen, eigene Postadresse). Damit ergeben sich gemäss amtlicher Adressliste (Stand Februar 2023) acht operativ tätige Betreibungsämter, denen sich jede der 11 politischen Gemeinden eindeutig zuordnen lässt. System: gemeindebasiert mit einzelnen Zusammenlegungen (im Schema 'gemeindeaemter').

- **Rechtsgrundlage:** Einführungsgesetz zum Bundesgesetz über Schuldbetreibung und Konkurs (EG SchKG) (BGS 231.1), Systematische Gesetzessammlung des Kantons Zug (BGS), § 1 (Betreibungskreise), § 3 (Ernennung).
  Stand: Stand 13. Januar 2023; in Kraft (ursprüngliche Inkraftsetzung 1. Januar 1997), nicht aufgehoben. https://bgs.zg.ch/app/de/texts_of_law/231.1 (am Wortlaut geprüft).
  Kern: § 1 Abs. 1: 'Die Einwohnergemeinden des Kantons Zug bilden je einen Betreibungskreis.' § 1 Abs. 2: 'Mehrere Gemeinden können mit Zustimmung des Obergerichtes gemeinsam einen Betreibungskreis bilden.' § 3 Abs. 1: 'Der Gemeinderat ernennt für seinen Betreibungskreis die Betreibungsbeamtin oder den Betreibungsbeamten und die Stellvertreterin oder den Stellvertreter.'
- **Amtliches Verzeichnis** (pdf, gemeindescharf ableitbar: ja): https://zg.ch/dam/jcr:87cb3853-5a22-4f9b-928e-40d220e2f906/Adressen%20Betreibungs%C3%A4mter%20Stand%20Februar%202023.pdf
  Amtliche PDF-Liste des Kantons Zug (zg.ch) 'Adressen und Öffnungszeiten der Betreibungsämter im Kanton Zug', Stand Februar 2023. Tabelle mit Spalte Gemeinde -> zuständiges Betreibungsamt mit vollständiger Postadresse, Telefon, E-Mail und Öffnungszeiten. Jede der 11 politischen Gemeinden ist explizit einem Amt zugeordnet; Zusammenlegungen (Steinhausen seit 01.04.2017 und Walchwil seit 01.01.2023 zum Betreibungsamt Zug) sind ausgewiesen. Daraus ist die Zuordnung Gemeinde -> Amt gemeindescharf und deterministisch ableitbar.
- **Beispielämter (adressgeprüft):**
  - Betreibungsamt Zug (zuständig für Zug, Steinhausen und Walchwil) — Gubelstrasse 22, Postfach 1258, 6301 Zug (https://zg.ch/dam/jcr:87cb3853-5a22-4f9b-928e-40d220e2f906/Adressen%20Betreibungs%C3%A4mter%20Stand%20Februar%202023.pdf)
  - Betreibungsamt Baar — Rigistrasse 5, Postfach 1254, 6341 Baar (https://zg.ch/dam/jcr:87cb3853-5a22-4f9b-928e-40d220e2f906/Adressen%20Betreibungs%C3%A4mter%20Stand%20Februar%202023.pdf)
- **Adversariale Prüfung:** System ja · Rechtsgrundlage ja · Verzeichnis ja · Adresse ja.
- **Risiken/Pflege:**
  - Die zentrale Rechtsgrundlage (bgs.zg.ch) wird per JavaScript gerendert; der Wortlaut von § 1 und § 3 wurde über den JSON-API-Endpunkt (bgs.zg.ch/api/de/texts_of_law/231.1) der amtlichen Sammlung abgerufen und gelesen. Die menschenlesbare URL lautet https://bgs.zg.ch/app/de/texts_of_law/231.1.
  - Anzahl der Betreibungskreise nach Gesetz (je Gemeinde einer = 11) weicht von der Anzahl operativer Ämter (8) ab, weil mehrere Kreise zusammengelegt bzw. gemeinsam geführt werden. Die Zahl 8 stammt aus der amtlichen Adressliste (Stand Februar 2023); Neuheim teilt sich Telefon/E-Mail mit Menzingen, wird hier aber wegen eigener Postadresse mitgezählt – je nach Zählweise sind 7 oder 8 Ämter vertretbar.
  - Die amtliche Adressliste hat Stand Februar 2023. Spätere Zusammenlegungen, Fusionen oder Adressänderungen (z.B. zwischen 2023 und 2026) könnten nicht erfasst sein; vor produktiver Nutzung sollte eine aktuellere amtliche Liste oder die Gemeindeportale (zg.ch/behoerden/gemeinden) geprüft werden.
  - Politisch wird das gemeindliche System ('Sportelsystem') diskutiert (Interpellation im Kantonsrat); eine künftige Zentralisierung zu einem kantonalen Amt ist denkbar, war aber per geltender Fassung (Stand 13.01.2023) nicht umgesetzt.

## FR — Bezirks-/Regionalämter (7 Ämter)

Der Kanton Freiburg organisiert das Betreibungswesen nach Verwaltungsbezirken: Das Gebiet jedes der sieben Verwaltungsbezirke bildet einen Betreibungskreis mit einem Betreibungsamt, dessen Sitz im jeweiligen Bezirkshauptort liegt. Es gibt sieben Betreibungsämter (fünf französischsprachige, ein deutschsprachiges und ein zweisprachiges): Saanebezirk (Freiburg), Sensebezirk (Tafers), Greyerzbezirk (Bulle), Seebezirk (Murten), Glanebezirk (Romont), Broyebezirk (Estavayer-le-Lac) und Vivisbachbezirk (Châtel-St-Denis). Für den Konkurs gilt dagegen eine zentralisierte Struktur: Der ganze Kanton bildet einen einzigen Konkurskreis mit dem Kantonalen Konkursamt in Freiburg. Rechtsgrundlage ist das Ausführungsgesetz zur Bundesgesetzgebung über Schuldbetreibung und Konkurs (AGSchKG/LALP), SGF 28.1, in Kraft seit 1. Juli 2015.

- **Rechtsgrundlage:** Ausführungsgesetz zur Bundesgesetzgebung über Schuldbetreibung und Konkurs (AGSchKG) / Loi d'application de la législation fédérale sur la poursuite pour dettes et la faillite (LALP) (SGF 28.1), Systematische Gesetzessammlung des Kantons Freiburg (SGF/BDLF), Nr. 28.1.
  Stand: vom 12.02.2015, in Kraft seit 01.07.2015; geltende konsolidierte Fassung (nicht aufgehoben). https://bdlf.fr.ch/app/de/texts_of_law/28.1 (**Wortlaut NICHT an der amtlichen Quelle prüfbar**).
  Kern: Art. 2: Das Gebiet jedes Verwaltungsbezirks bildet einen Betreibungskreis; der Sitz des Betreibungsamtes befindet sich im Bezirkshauptort. Das Gebiet des Kantons Freiburg bildet einen einzigen Konkurskreis; der Sitz des Konkursamtes befindet sich in Freiburg.
- **Amtliches Verzeichnis** (htmlListe, gemeindescharf ableitbar: ja): https://www.fr.ch/de/sjsd/baka
  Amtliche Übersicht der Sicherheits- und Justizdirektion (Betreibungsämter und Konkursamt, BAKA) mit allen sieben Bezirks-Betreibungsämtern und dem Kantonalen Konkursamt, je mit Detailseite (Adresse, Öffnungszeiten). Da jeder Verwaltungsbezirk genau einen Betreibungskreis bildet und die Bezirke des Kantons Freiburg über fixe Gemeindelisten definiert sind, lässt sich jede politische Gemeinde deterministisch ihrem Bezirks-Betreibungsamt zuordnen (politische Gemeinde -> Verwaltungsbezirk -> Betreibungsamt am Bezirkshauptort). Eine zusätzliche amtliche Liste mit Adressen findet sich unter fr.ch/de/gb/.../justiz/betreibungsaemter.
- **Beispielämter (adressgeprüft):**
  - Betreibungsamt des Saanebezirks (Office des poursuites de la Sarine) — Av. Beauregard 13, 1700 Freiburg (https://www.fr.ch/de/staat-und-recht/betreibungen-und-konkurse/ein-betreibungs-oder-konkursamt-kontaktieren/betreibungsamt-in-freiburg)
  - Betreibungsamt des Greyerzbezirks (Office des poursuites de la Gruyère) — Rue de l'Europe 10, Postfach 155, 1630 Bulle (https://www.fr.ch/de/staat-und-recht/betreibungen-und-konkurse/betreibungsamt-in-bulle)
- **Adversariale Prüfung:** System ja · Rechtsgrundlage nein · Verzeichnis ja · Adresse ja.
- **Risiken/Pflege:**
  - Der Wortlaut von Art. 2 SGF 28.1 konnte nicht direkt auf der amtlichen BDLF-Seite gelesen werden, da bdlf.fr.ch ein reines JavaScript-Frontend (LexWork) ist, das WebFetch nicht rendern kann. Der wiedergegebene Wortlaut-Kern stammt aus einer Drittquelle (lexaris.eu, Spiegel) und ist daher mit der amtlichen Quelle abzugleichen; amWortlautGeprueft wurde deshalb auf false gesetzt. Die Existenz, Nummer (SGF 28.1), das Inkrafttreten (01.07.2015) und die Organisationsstruktur (Amt je Bezirk, Sitz am Bezirkshauptort) sind durch die amtliche fr.ch-Übersicht jedoch klar bestätigt.
  - Gemeindefusionen im Kanton Freiburg sind häufig; die Zuordnung Gemeinde->Bezirk sollte gegen das aktuelle amtliche Gemeindeverzeichnis (BFS/Staatskanzlei FR) geprüft werden. Die Bezirkszugehörigkeit selbst ist aber stabil und bestimmt eindeutig das zuständige Amt.
  - Das Kantonale Konkursamt in Freiburg ist kein Betreibungsamt; die Zahl 7 bezieht sich ausschliesslich auf die Betreibungsämter (Bezirke), das Konkursamt ist separat.

## SO — Bezirks-/Regionalämter (5 Ämter)

Der Kanton Solothurn führt das Betreibungswesen über regionale Betreibungsämter, die organisatorisch Teil der Amtschreibereien sind (die Amtschreiberei umfasst Grundbuch-, Erbschafts-, Betreibungs-, Konkurs- und Handelsregisteramt; § 1 Amtschreibereiverordnung, BGS 123.21). Massgeblich ist § 1 EV SchKG (BGS 123.321): Die Betreibungs- und Konkurskreise sowie die Betreibungs- und Konkursbeamten werden in der Spezialgesetzgebung bezeichnet; die Betreibungskreise entsprechen den Amtschreibereikreisen (vgl. § 297 Abs. 2 EG ZGB: Grundbuchkreise = Amtschreibereikreise). Aufsichtsbehörde ist die Schuldbetreibungs- und Konkurskammer des Obergerichts (§ 5 EV SchKG). Das ordentliche Betreibungsverfahren führt die Amtschreiberei, in deren Kreis der Schuldner wohnt. Es bestehen heute fünf regionale Betreibungsämter: Region Solothurn, Grenchen-Bettlach, Dorneck-Thierstein, Olten-Gösgen und Thal-Gäu. Die Zuordnung jeder politischen Gemeinde zu einem Betreibungsamt ist auf der amtlichen Kantonsseite explizit gemeindescharf aufgelistet (vollständige Gemeindelisten je Amt), wodurch eine deterministische Zuordnung Gemeinde -> Betreibungsamt möglich ist.

- **Rechtsgrundlage:** Verordnung zur Einführung des Bundesgesetzes über Schuldbetreibung und Konkurs sowie des Bundesgesetzes über die Schuldbetreibung gegen Gemeinden und andere Körperschaften des kantonalen öffentlichen Rechts (EV SchKG) (BGS 123.321), Bereinigte Gesetzessammlung des Kantons Solothurn (BGS), § 1 (Betreibungs- und Konkurskreise; Beamte); § 5 (Aufsichtsbehörde); § 10 (Zuständigkeit gegen Körperschaften).
  Stand: vom 03.04.1996, in Kraft seit 01.01.1997; aktuelle Fassung in Kraft seit 01.01.2011; nicht aufgehoben (abrogated=false). https://bgs.so.ch/app/de/texts_of_law/123.321 (am Wortlaut geprüft).
  Kern: § 1 Abs. 1: 'Die Betreibungs- und Konkurskreise sowie die Betreibungs- und Konkursbeamten oder -beamtinnen werden in der Spezialgesetzgebung bezeichnet.' § 5 Abs. 1: 'Aufsichtsbehörde ist die Schuldbetreibungs- und Konkurskammer des Obergerichts.'
- **Rechtsgrundlage:** Verordnung über die Geschäftsführung der Amtschreibereien (Amtschreibereiverordnung) (BGS 123.21), Bereinigte Gesetzessammlung des Kantons Solothurn (BGS), § 1 (Geschäftskreis der Amtschreiberei).
  Stand: vom 14.05.2013, in Kraft seit 01.08.2013; aktuelle Fassung in Kraft seit 01.01.2016; nicht aufgehoben. https://bgs.so.ch/app/de/texts_of_law/123.21 (am Wortlaut geprüft).
  Kern: § 1 Abs. 1: 'Die Amtschreiberei umfasst: a) das Grundbuchamt; b) das Erbschaftsamt; c) das Betreibungsamt; d) das Konkursamt; e) das Handelsregisteramt.' Das Betreibungsamt ist somit Teil der jeweiligen Amtschreiberei (= Betreibungskreis).
- **Rechtsgrundlage:** Gesetz über die Einführung des Schweizerischen Zivilgesetzbuches (EG ZGB) (BGS 211.1), Bereinigte Gesetzessammlung des Kantons Solothurn (BGS), § 297 Abs. 2 (Grundbuchkreise/Amtschreibereikreise).
  Stand: vom 04.04.1954, in Kraft seit 01.01.1955; aktuelle Fassung in Kraft seit 01.01.2025; nicht aufgehoben. https://bgs.so.ch/app/de/texts_of_law/211.1 (am Wortlaut geprüft).
  Kern: § 297 Abs. 2: 'Die Grundbuchkreise entsprechen den Amtschreibereikreisen.' Die Amtschreibereikreise bilden zugleich den territorialen Rahmen für die Betreibungsämter (Spezialgesetzgebung i.S.v. § 1 EV SchKG).
- **Amtliches Verzeichnis** (htmlListe, gemeindescharf ableitbar: ja): https://so.ch/verwaltung/finanzdepartement/betreibungsaemter/zuordnung-der-gemeinden-1/
  Amtliche Seite des Finanzdepartements des Kantons Solothurn. Listet alle fünf Betreibungsämter mit Adressen und für jedes Amt die vollständige, namentliche Liste der zugeordneten politischen Gemeinden (z.B. Dorneck-Thierstein 23 Gemeinden, Region Solothurn ca. 40 Gemeinden, Grenchen-Bettlach nur Grenchen und Bettlach). Daraus ist die Zuordnung Gemeinde -> Betreibungsamt deterministisch und gemeindescharf ableitbar. Übersichtsseite mit Adressen/Öffnungszeiten: https://so.ch/verwaltung/finanzdepartement/betreibungsaemter/
- **Beispielämter (adressgeprüft):**
  - Betreibungsamt Region Solothurn (Amtschreiberei Region Solothurn) — Rötistrasse 4, 4502 Solothurn (https://so.ch/verwaltung/finanzdepartement/betreibungsaemter/)
  - Betreibungsamt Dorneck-Thierstein (Amtschreiberei Dorneck-Thierstein) — Amthausstrasse 15, 4143 Dornach (https://so.ch/verwaltung/finanzdepartement/betreibungsaemter/)
- **Adversariale Prüfung:** System ja · Rechtsgrundlage ja · Verzeichnis ja · Adresse ja.
  **Korrekturen/Präzisierungen des Prüf-Agents:** Kernbehauptungen bestaetigt. Praezisierungen: (1) § 5 EV SchKG verweist fuer die Aufsichtsbehoerde auf '§ 33 des Gesetzes ueber die Gerichtsorganisation vom 13. Maerz 1977', nicht auf das in den Risiken genannte GOG BGS 125.12. (2) Konkurs ist im Kt. SO ueber EIN zentrales Kantonales Konkursamt (Oensingen) zentralisiert; die 5 Kreise betreffen die Betreibung, waehrend fuer den Konkurs faktisch ein einziger kantonsweiter Kreis besteht - die Formulierung 'Betreibungs- und Konkurskreise entsprechen den Amtschreibereikreisen' gilt streng nur fuer die Betreibung. (3) Die in den Risiken angegebene Amtschreibereiverordnung-Fassung trifft zu; eine veraltete 1958/2007-Fassung listet das Betreibungsamt noch nicht, ist aber nicht massgeblich. (4) EG ZGB § 297 Abs. 2 konnte nicht zeichengenau verifiziert werden (bgs.so.ch nur JS-gerendert); sekundaere Stuetzzitierung, ohne Einfluss auf die bestaetigten Kernpunkte.
- **Risiken/Pflege:**
  - Die kantonale Rechtsgrundlage (§ 1 EV SchKG, BGS 123.321) definiert die Betreibungskreise nicht selbst namentlich, sondern verweist auf die 'Spezialgesetzgebung'; die konkrete Anzahl/Bezeichnung der fünf heutigen Betreibungsämter ergibt sich primär aus der amtlichen Kantonsseite (so.ch) und der Anbindung an die Amtschreibereikreise, nicht aus einer einzelnen abschliessenden Aufzählung im Gesetz.
  - Die Amteien/Gerichtsbezirke gemäss GOG (BGS 125.12, § 86: Solothurn-Lebern, Bucheggberg-Wasseramt, Thal-Gäu, Olten-Gösgen, Dorneck-Thierstein) decken sich NICHT deckungsgleich mit den fünf Betreibungsämtern; das Betreibungswesen kennt separat 'Region Solothurn' und 'Grenchen-Bettlach' statt 'Solothurn-Lebern'/'Bucheggberg-Wasseramt'. Massgeblich für die Gemeindezuordnung ist die amtliche Betreibungsamts-Liste auf so.ch.
  - Gemeindefusionen können die Gemeindelisten je Amt verändern; die genaue Gemeindezahl pro Amt (z.B. Region Solothurn ca. 37-40) sollte bei Bedarf direkt der jeweils aktuellen so.ch-Liste entnommen werden. Für eine deterministische Zuordnung empfiehlt sich die regelmässige Aktualisierung anhand der amtlichen Zuordnungsseite.
  - anzahlAemter=5 basiert auf der zählbaren amtlichen Liste der so.ch-Seite (fünf benannte Betreibungsämter).

## BS — Einheitsamt (1 Amt)

Basel-Stadt ist ein Stadtkanton mit nur drei Gemeinden (Basel, Riehen, Bettingen). Das gesamte Kantonsgebiet bildet einen einzigen Betreibungs- und einen einzigen Konkurskreis (§ 1 EG SchKG, SG 230.100: "Das Gebiet des Kantons Basel-Stadt bildet einen Betreibungs- und einen Konkurskreis."). Es gibt damit EIN kantonales Betreibungs- und Konkursamt (Betreibungs- und Konkursamt Basel-Stadt), das für alle drei Gemeinden örtlich zuständig ist. Das Amt ist dem Zivilgericht angegliedert und in zwei räumlich getrennte Abteilungen organisiert: das Betreibungsamt (Aeschenvorstadt 56) und das Konkursamt (Bäumleingasse 5). Untere kantonale Aufsichtsbehörde sind drei Präsidentinnen/Präsidenten des Zivilgerichts; das Appellationsgericht amtet als obere Aufsichtsbehörde (§ 5 EG SchKG). Eine gemeindescharfe Zuordnung ist trivial: Alle drei Gemeinden sind demselben einen Amt zugeordnet.

- **Rechtsgrundlage:** Gesetz betreffend Einführung des Bundesgesetzes über Schuldbetreibung und Konkurs (SG 230.100), Systematische Gesetzessammlung des Kantons Basel-Stadt (SG), Nr. 230.100, § 1.
  Stand: Vom 22. Juni 1891, in Kraft seit 1. Januar 1892; aktuell geltende konsolidierte Fassung Stand 13. Juni 2024 (Beschlussdatum 10.04.2024); Erlass NICHT aufgehoben (abrogated=false gemäss amtlicher Datenbank). https://www.gesetzessammlung.bs.ch/app/de/texts_of_law/230.100 (am Wortlaut geprüft).
  Kern: § 1 Abs. 1: "Das Gebiet des Kantons Basel-Stadt bildet einen Betreibungs- und einen Konkurskreis." Damit besteht für den ganzen Kanton ein einziges Betreibungs- und Konkursamt.
- **Amtliches Verzeichnis** (htmlListe, gemeindescharf ableitbar: ja): https://www.bs.ch/gerichte-judikative/betreibungs-und-konkursamt
  Amtliche Seite des Kantons Basel-Stadt (Portal bs.ch, Bereich Gerichte/Judikative) zum Betreibungs- und Konkursamt mit Adressen. Da nur ein einziges kantonales Amt existiert, das alle drei Gemeinden (Basel, Riehen, Bettingen) abdeckt, ist die Zuordnung Gemeinde→Amt eindeutig gemeindescharf. Adressen auch im amtlichen Staatskalender staatskalender.bs.ch.
- **Beispielämter (adressgeprüft):**
  - Betreibungs- und Konkursamt Basel-Stadt - Betreibungsamt (Abteilung Betreibungen) — Aeschenvorstadt 56, 4051 Basel (Postadresse: Postfach, 4001 Basel); Tel. +41 61 267 81 81, bka@bs.ch (https://staatskalender.bs.ch/organization/richterliche-behoerden/gerichte/zivilgericht/betreibungs-und-konkursamt/betreibungsamt)
  - Betreibungs- und Konkursamt Basel-Stadt - Konkursamt (Abteilung Konkurse) — Bäumleingasse 5, 4051 Basel; Tel. +41 61 267 83 92, konkursamt@bs.ch (https://staatskalender.bs.ch/organization/richterliche-behoerden/gerichte/zivilgericht/betreibungs-und-konkursamt/konkursamt)
- **Adversariale Prüfung:** System ja · Rechtsgrundlage ja · Verzeichnis ja · Adresse ja.
- **Risiken/Pflege:**
  - Es handelt sich um ein Einheitsamt: ANZAHL=1 bezieht sich auf das eine kantonale Betreibungs- und Konkursamt. Die zwei Beispiele sind die zwei Abteilungen (Betreibungsamt / Konkursamt) desselben Amtes an unterschiedlichen Standorten, nicht zwei eigenständige Betreibungsämter.
  - Die offizielle kantonale Gesetzessammlung (gesetzessammlung.bs.ch) ist eine JavaScript-Single-Page-App; der Wortlaut wurde über die offizielle JSON-/XHTML-API derselben Domain (api/de/texts_of_law/230.100) abgerufen und verifiziert (§ 1). Die Browser-URL und die API-URL gehören zur selben amtlichen Quelle.
  - Postadresse des Betreibungsamts laut Staatskalender 'Postfach, 4001 Basel'; die physische Standortadresse ist Aeschenvorstadt 56, 4051 Basel.

## BL — Einheitsamt (1 Amt)

Der Kanton Basel-Landschaft kennt das Einheitsamt-System: Das gesamte Kantonsgebiet bildet einen einzigen Betreibungs- und Konkurskreis (§ 1 EG SchKG, SGS 233). Es gibt somit ein einziges kantonales Betreibungs- und Konkursamt fuer alle Gemeinden, das Betreibungs- und Konkursamt Basel-Landschaft mit Sitz an der Eichenweg 12, 4410 Liestal. Es ist eine Hauptabteilung der Zivilrechtsverwaltung (Sicherheitsdirektion) und gliedert sich intern in eine Betreibungsabteilung und eine Konkursabteilung (§ 2 EG SchKG). Die Aufsicht ueber das Amt nach Art. 13 SchKG uebt die Dreierkammer der Abteilung Zivilrecht des Kantonsgerichts aus (§ 6 EG SchKG). Da nur ein einziges Amt fuer den ganzen Kanton besteht, ist die Zuordnung jeder politischen Gemeinde zum zustaendigen Betreibungsamt trivial und eindeutig: Saemtliche rund 86 Gemeinden des Kantons werden vom Betreibungs- und Konkursamt Basel-Landschaft in Liestal bedient. Eigene Zweigstellen sind nicht ausgewiesen.

- **Rechtsgrundlage:** Einfuehrungsgesetz zum Bundesgesetz ueber Schuldbetreibung und Konkurs (EG SchKG) (SGS 233), GS 753; Vom 19. September 1996; aktuelle konsolidierte Fassung Stand 1. Januar 2014 (letzte Aenderung vom 22. Maerz 2012, GS 37.1079, in Kraft seit 1. Januar 2014). Erlass in Kraft, nicht aufgehoben..
  Stand: 1. Januar 2014. https://bl.clex.ch/app/de/texts_of_law/233 (am Wortlaut geprüft).
  Kern: § 1 (Betreibungs- und Konkurskreis): 'Das Gebiet des Kantons Basel-Landschaft bildet einen Betreibungs- und Konkurskreis.' § 2 Abs. 1 (Betreibungs- und Konkursamt): 'Das Betreibungs- und Konkursamt Basel-Landschaft ist eine Hauptabteilung der Zivilrechtsverwaltung.' Damit besteht ein einziges kantonales Amt fuer alle Gemeinden.
- **Amtliches Verzeichnis** (htmlListe, gemeindescharf ableitbar: ja): https://www.baselland.ch/politik-und-behorden/direktionen/sicherheitsdirektion/zivilrechtsverwaltung/betreibungsamt/
  Amtliche Seite der Zivilrechtsverwaltung (Sicherheitsdirektion) des Kantons Basel-Landschaft zum Betreibungsamt, mit Generaladresse Eichenweg 12, 4410 Liestal. Da der ganze Kanton einen einzigen Betreibungs- und Konkurskreis bildet (§ 1 EG SchKG, SGS 233), ist die Zuordnung Gemeinde -> Amt eindeutig und gemeindescharf: alle Gemeinden -> Betreibungs- und Konkursamt Basel-Landschaft, Liestal. Eine gemeindeweise Aufteilung in mehrere Aemter existiert nicht. Die kantonale offizielle Kontaktseite (baselland.ch) lieferte beim direkten Abruf zeitweise HTTP 403; die Adressangaben sind ueber die amtliche Generaladresse-Seite und Drittverzeichnisse bestaetigt.
- **Beispielämter (adressgeprüft):**
  - Betreibungs- und Konkursamt Basel-Landschaft (Betreibungsabteilung), Zivilrechtsverwaltung — Eichenweg 12, Postfach, 4410 Liestal (Tel. 061 552 46 00, betreibungsamt@bl.ch) (https://www.baselland.ch/politik-und-behorden/direktionen/sicherheitsdirektion/zivilrechtsverwaltung/betreibungsamt/)
  - Betreibungs- und Konkursamt Basel-Landschaft (Konkursabteilung), Zivilrechtsverwaltung — Eichenweg 12, 4410 Liestal (Tel. 061 552 46 00, konkursamt@bl.ch) (https://www.baselland.ch/politik-und-behorden/direktionen/sicherheitsdirektion/zivilrechtsverwaltung/konkursamt)
- **Adversariale Prüfung:** System ja · Rechtsgrundlage ja · Verzeichnis ja · Adresse ja.
- **Risiken/Pflege:**
  - Einheitsamt: Es existiert nur EIN Betreibungs- und Konkursamt fuer den ganzen Kanton (§ 1 EG SchKG). Daher gibt es keine zaehlbare Liste mehrerer Betreibungsaemter; anzahlAemter=1. Die beiden Beispiele sind die zwei internen Abteilungen (Betreibung / Konkurs) desselben Amtes an derselben Adresse, nicht zwei separate Aemter.
  - Die kantonale amtliche Kontaktseite baselland.ch (betreibungsamt-Unterseite und Generaladresse) lieferte beim direkten WebFetch wiederholt HTTP 403; die Adressdaten (Eichenweg 12, 4410 Liestal) sind ueber mehrere unabhaengige Quellen (eamt.ch, zip.ch, baselland.ch-Suchtreffer) konsistent bestaetigt, konnten aber nicht aus dem Roh-HTML der amtlichen Seite verifiziert werden.
  - Der Volltext des EG SchKG wurde aus der lexfind.ch-PDF (Spiegel der kantonalen Sammlung, Stand 1.1.2014) gelesen, da bl.clex.ch (kantonale amtliche Sammlung) beim direkten Abruf blockierte. Wortlaut von § 1 und § 2 ist dadurch verifiziert; die kantonale amtliche URL (bl.clex.ch/app/de/texts_of_law/233) ist als Beleg angegeben.
  - Die Aufsicht liegt seit der Justizreform bei der Dreierkammer der Abteilung Zivilrecht des Kantonsgerichts (§ 6 EG SchKG), nicht beim Amt selbst.
  - Gemeindefusionen aendern an der Zuordnung nichts, da ohnehin alle Gemeinden demselben einzigen Amt zugeordnet sind.

## SH — Einheitsamt (1 Amt)

Der Kanton Schaffhausen bildet einen einzigen Betreibungskreis mit einem einzigen kantonalen Betreibungsamt (Betreibungsamt Schaffhausen, Sitz in der Stadt Schaffhausen). Rechtsgrundlage ist die Verordnung über die Betreibungskreise (SHR 281.101), § 1 Abs. 1 in der Fassung mit Stand 01.01.2025: "Der Kanton Schaffhausen besteht aus einem einzigen Betreibungskreis. Das Betreibungsamt hat seinen Sitz in Schaffhausen." Das Betreibungsamt bildet zusammen mit dem Konkursamt die Dienststelle "Betreibungs- und Konkursamt Schaffhausen". Historisch (2017-2024) führte das Betreibungsamt drei Regionalstellen als Zweigstellen (Klettgau in Neunkirch, Reiat in Thayngen, Stein in Stein am Rhein) gemäss der Verordnung des Obergerichts über die Organisation des Betreibungsamts und seiner Regionalstellen (VOBA, SHR 281.102). Diese Regionalstellen wurden 2024 geschlossen; die VOBA wurde per 31.12.2024 aufgehoben und die §§ 1 Abs. 2 und 3 der Verordnung über die Betreibungskreise (die früher Gemeinden Regionen zuteilten) wurden per 01.01.2025 ersatzlos aufgehoben. Seit 01.01.2025 ist ausschliesslich das Betreibungsamt Schaffhausen am Münsterplatz 31 für sämtliche Betreibungen im ganzen Kanton zuständig - eine gemeindescharfe Zuordnung ist trivial, da jede Gemeinde demselben Amt zugeordnet ist.

- **Rechtsgrundlage:** Verordnung über die Betreibungskreise (SHR 281.101), Schaffhauser Rechtsbuch (kantonale systematische Gesetzessammlung), Abl. 2009 S. 635; Änderung 2024-09.
  Stand: Vom 28.04.2009, aktuelle Fassung in Kraft seit 01.01.2025 (Beschlussdatum 10.12.2024); nicht aufgehoben. https://rechtsbuch.sh.ch/app/de/texts_of_law/281.101 (am Wortlaut geprüft).
  Kern: § 1 Abs. 1: "Der Kanton Schaffhausen besteht aus einem einzigen Betreibungskreis. Das Betreibungsamt hat seinen Sitz in Schaffhausen." Die früheren Abs. 2 und 3 (Zuteilung von Gemeinden zu Regionen) wurden per 01.01.2025 aufgehoben.
- **Rechtsgrundlage:** Justizgesetz (Delegationsgrundlage für die Verordnung über die Betreibungskreise) (SHR 173.200), Schaffhauser Rechtsbuch; gestützt auf Art. 103 Justizgesetz und Art. 1 SchKG erlässt der Regierungsrat die Verordnung über die Betreibungskreise.
  Stand: Vom 09.11.2009, in Kraft seit 01.01.2011; nicht aufgehoben. https://rechtsbuch.sh.ch/app/de/texts_of_law/173.200 (**Wortlaut NICHT an der amtlichen Quelle prüfbar**).
  Kern: Art. 103 Justizgesetz bildet (zusammen mit Art. 1 SchKG) die Rechtsgrundlage, gestützt auf welche der Regierungsrat die Betreibungskreise festlegt. Wortlaut von Art. 103 selbst nicht im Volltext abgerufen.
- **Rechtsgrundlage:** Verordnung des Obergerichts über die Organisation des Betreibungsamts und seiner Regionalstellen (VOBA) (SHR 281.102), Schaffhauser Rechtsbuch; Volltext über lexfind verifiziert.
  Stand: Vom 02.12.2016, in Kraft von 01.01.2017 bis 31.12.2024 - AUFGEHOBEN per 31.12.2024. https://rechtsbuch.sh.ch/app/de/texts_of_law/281.102 (am Wortlaut geprüft).
  Kern: § 1: "Das 'Betreibungsamt Schaffhausen' ist das für den ganzen Kanton Schaffhausen zuständige Betreibungsamt. Es hat seinen Sitz in der Stadt Schaffhausen ... Das Betreibungsamt Schaffhausen führt drei Regionalstellen in den folgenden Hauptorten: 1. Regionalstelle Klettgau in Neunkirch, 2. Regionalstelle Reiat in Thayngen, 3. Regionalstelle Stein in Stein am Rhein." Diese Verordnung ist seit 01.01.2025 nicht mehr in Kraft (Regionalstellen aufgehoben).
- **Amtliches Verzeichnis** (htmlListe, gemeindescharf ableitbar: ja): https://sh.ch/CMS/Webseite/Kanton-Schaffhausen/Beh-rde/Justiz/Betreibungs--und-Konkursamt-407143-DE.html
  Offizielles Justizportal des Kantons Schaffhausen (Behörde > Justiz > Betreibungs- und Konkursamt). Die Seite ist JavaScript-gerendert; statisches Abrufen liefert nur das Navigationsgerüst. Da der Kanton seit 01.01.2025 ein einziges Betreibungsamt (Münsterplatz 31, 8200 Schaffhausen) für den ganzen Kanton hat, ist die Zuordnung Gemeinde->Amt trivial gemeindescharf ableitbar: jede politische Gemeinde des Kantons ist diesem einen Amt zugeordnet. Die Adresse ist zusätzlich durch ein amtliches sh.ch-Dokument (Steigerungsbedingungen, Dez. 2025) bestätigt.
- **Beispielämter (adressgeprüft):**
  - Betreibungsamt Schaffhausen (kantonales Einheitsamt, Teil des Betreibungs- und Konkursamts Schaffhausen) — Münsterplatz 31, 8200 Schaffhausen; Telefon 052 632 54 60; E-Mail betreibungsamt@sh.ch (https://sh.ch/CMS/get/file/933febe1-a307-40e6-a96b-b15bf85f6cfa)
  - Betreibungsamt Schaffhausen (zuständig für den ganzen Kanton; gemäss VOBA-Beleg bis Ende 2024 mit Regionalstellen, z.B. ehemalige Regionalstelle Stein in Stein am Rhein - seit 2025 keine Zweigstellen mehr) — Münsterplatz 31, 8200 Schaffhausen (alleiniger Standort seit 01.01.2025; ehemalige Regionalstellen Neunkirch, Thayngen, Stein am Rhein geschlossen) (https://rechtsbuch.sh.ch/app/de/texts_of_law/281.101)
- **Adversariale Prüfung:** System ja · Rechtsgrundlage ja · Verzeichnis ja · Adresse ja.
  **Korrekturen/Präzisierungen des Prüf-Agents:** VOBA (281.102): Die Behauptung sagt 'aufgehoben per 31.12.2024 (mit Hinweis auf 2024-09)'. Amtlich korrekt: aufgehoben durch Erlass 2024-16 (Beschlussdatum 17.12.2024), wirksam per 01.01.2025; letzter Geltungstag 31.12.2024 ('in Kraft von 01.01.2017 bis 31.12.2024'). Das Aenderungs-Kennzeichen 2024-09 betrifft AUSSCHLIESSLICH die Aufhebung von § 1 Abs. 2 und 3 der Verordnung 281.101, NICHT die VOBA. Diese Praezisierung aendert die Sacheinschaetzung (Einheitsamt seit 01.01.2025) nicht. Alle uebrigen Kernbehauptungen (Einheitsamt, ein einziger Betreibungskreis, Sitz Schaffhausen, § 1 Abs. 1 Wortlaut, Aufhebung Abs. 2/3 per 01.01.2025 durch 2024-09, 281.101 in Kraft, Adresse Muensterplatz 31 / 8200 Schaffhausen / 052 632 54 60 / betreibungsamt@sh.ch) sind zeichen- bzw. sachgenau an der amtlichen Quelle bestaetigt.
- **Risiken/Pflege:**
  - Einheitsamt: Es gibt nur EIN Betreibungsamt, daher konnten keine zwei separaten Ämter mit unterschiedlichen Adressen genannt werden; das zweite Beispiel ist dasselbe Amt (mit Hinweis auf die per 2025 geschlossenen ehemaligen Regionalstellen).
  - Jüngste Reorganisation: Die drei Regionalstellen (Klettgau/Neunkirch, Reiat/Thayngen, Stein/Stein am Rhein) wurden 2024 geschlossen; die VOBA (281.102) wurde per 31.12.2024 aufgehoben und §1 Abs.2/3 der Verordnung 281.101 per 01.01.2025. Ältere Quellen (auch Drittseiten) nennen noch Regionalstellen und sind veraltet - hier wurde die NEUERE amtliche Quelle (281.101, Stand 01.01.2025) verwendet.
  - Die offizielle sh.ch-Verzeichnisseite ist JavaScript-gerendert und liefert beim direkten Abruf keinen statischen Adresstext; die Adresse wurde daher über ein amtliches sh.ch-PDF (Steigerungsbedingungen) und das amtliche Rechtsbuch verifiziert.
  - Art. 103 Justizgesetz (Delegationsnorm) wurde nicht im Volltext abgerufen (amWortlautGeprueft=false); er wird im Ingress der Verordnung 281.101 als Grundlage zitiert.
  - Gemeindefusionen im Kanton SH (z.B. Stein am Rhein-Region) berühren die Zuordnung nicht, da ohnehin ein Einheitsamt für alle Gemeinden zuständig ist.

## AR — Bezirks-/Regionalämter (3 Ämter)

Gesetzliche Grundordnung (Art. 1 EG SchKG, bGS 241.1): "Jede Gemeinde des Kantons bildet einen Betreibungskreis", wobei sich zwei oder mehrere Gemeinden zu einem gemeinsamen Betreibungskreis zusammenschliessen können (zuständig: Gemeinderat). Von dieser Zusammenschluss-Möglichkeit ist umfassend Gebrauch gemacht worden: Heute bestehen faktisch drei regionale Betreibungsämter (Appenzeller Hinterland in Herisau, Appenzeller Mittelland in Teufen, Appenzeller Vorderland in Heiden), die zusammen alle 20 Einwohnergemeinden des Kantons abdecken. Es handelt sich also formal um ein gemeindebasiertes System mit gesetzlich vorgesehenen, regional zusammengelegten Kreisen (regionale/interkommunale Ämter). Die Betreibungsbeamten werden vom Gemeinderat gewählt; Aufsichtsbehörde ist eine Kammer aus drei Mitgliedern des Obergerichts. Konkurskreise legt demgegenüber der Regierungsrat fest.

- **Rechtsgrundlage:** Gesetz über die Einführung des Bundesgesetzes vom 11. April 1889 über Schuldbetreibung und Konkurs (EG SchKG) (bGS 241.1), Systematische Gesetzessammlung Kanton Appenzell A.Rh. (clex), bGS 241.1, Art. 1 (Betreibungskreis).
  Stand: vom 27.04.1997, aktuelle Fassung in Kraft seit 01.01.2011 (Beschluss 13.09.2010); nicht aufgehoben (abrogated=false). https://ar.clex.ch/app/de/texts_of_law/241.1 (am Wortlaut geprüft).
  Kern: Art. 1 Betreibungskreis: Abs. 1 'Jede Gemeinde des Kantons bildet einen Betreibungskreis.' Abs. 2 'Zwei oder mehrere Gemeinden können sich zu einem Betreibungskreis zusammenschliessen.' Abs. 3 'Zuständig zum Abschluss einer entsprechenden Vereinbarung ist der Gemeinderat.'
- **Amtliches Verzeichnis** (htmlListe, gemeindescharf ableitbar: ja): https://ar.ch/verwaltung/departement-inneres-und-sicherheit/departementssekretariat/betreibungsaemter-und-konkursamt/betreibungsaemter/
  Amtliche Kantonsseite (ar.ch, Departement Inneres und Sicherheit) listet die drei Betreibungsämter mit vollständiger Postadresse und je einer expliziten, vollständigen Aufzählung der zugehörigen Gemeinden. Hinterland (Herisau): Herisau, Hundwil, Schwellbrunn, Waldstatt, Schönengrund, Urnäsch. Mittelland (Teufen): Teufen, Bühler, Gais, Speicher, Trogen, Stein. Vorderland (Heiden): Heiden, Walzenhausen, Wolfhalden, Lutzenberg, Grub, Wald, Reute, Rehetobel. Dadurch ist die Zuordnung politische Gemeinde -> Betreibungsamt deterministisch und gemeindescharf ableitbar. Bestätigt durch den amtlichen Staatskalender (staatskalender.ar.ch), der ebenfalls genau diese drei Ämter führt.
- **Beispielämter (adressgeprüft):**
  - Betreibungsamt Appenzeller Hinterland — Poststrasse 6, Postfach 1160, 9102 Herisau (https://ar.ch/verwaltung/departement-inneres-und-sicherheit/departementssekretariat/betreibungsaemter-und-konkursamt/betreibungsaemter/)
  - Betreibungsamt Appenzeller Vorderland — Paradiesweg 2 / Haus Eden, Postfach 42, 9410 Heiden (https://ar.ch/verwaltung/departement-inneres-und-sicherheit/departementssekretariat/betreibungsaemter-und-konkursamt/betreibungsaemter/)
- **Adversariale Prüfung:** System ja · Rechtsgrundlage ja · Verzeichnis ja · Adresse ja.
  **Korrekturen/Präzisierungen des Prüf-Agents:** Kernfakten bestaetigt, keine inhaltliche Korrektur der Aemterzahl, Adressen oder Gemeindezuordnung noetig. Eine Praezisierung beim Risiko-Hinweis: Die Aussage, AR habe 'per 1.1.2026 seine Gemeindestrukturen weiter reduziert', trifft nicht zu - die radikale Fusion (20 -> 3/5 Gemeinden) wurde vom Stimmvolk abgelehnt; lediglich eine Eventualvorlage zur Erleichterung freiwilliger Fusionen wurde angenommen. Es bleibt bei 20 Einwohnergemeinden und drei regionalen Betreibungsaemtern. Methodischer Hinweis: Der Wortlaut von Art. 1 bGS 241.1 war nur ueber den API-Endpunkt (ar.clex.ch/api/de/texts_of_law/241.1) maschinell lesbar; HTML- und data-Endpunkt liefern wegen JavaScript-Rendering keinen Text - der API-Inhalt bestaetigt die Behauptung aber vollstaendig.
- **Risiken/Pflege:**
  - Begriffliche Einordnung: Das EG SchKG (Art. 1) knüpft formal an die Gemeinde an ('Jede Gemeinde bildet einen Betreibungskreis'); die heutigen drei Ämter beruhen auf Zusammenschluss-Vereinbarungen der Gemeinden. Das System ist daher zwischen 'gemeindeaemter' (gesetzliche Grundordnung) und 'bezirksRegionalaemter' (faktische regionale Ämter) anzusiedeln; gewählt wurde 'bezirksRegionalaemter', da nur noch drei regionale Ämter existieren und die Zuordnung über diese erfolgt.
  - Gemeindefusionen: Per 1.1.2026 hat der Kanton seine Gemeindestrukturen weiter optimiert/reduziert (Projekt Optimierung Gemeindestrukturen). Die exakte aktuelle Gemeindezahl und allfällige Anpassungen der Amtszuteilung sollten vor produktivem Einsatz nochmals gegen die ar.ch-Liste geprüft werden, da fusionierte Gemeindenamen sich ändern können.
  - Die clex.ch-Seite rendert per JavaScript; der Wortlaut wurde über den offiziellen JSON/XHTML-API-Endpunkt von ar.clex.ch (api/de/texts_of_law/241.1) abgerufen und gelesen - Inhalt deckungsgleich mit der amtlichen Sammlung.
  - Anzahl (3) aus zwei amtlichen Quellen (ar.ch-Liste und staatskalender.ar.ch) konsistent bestätigt.

## AI — Einheitsamt (1 Amt)

Appenzell Innerrhoden ist ein Einheitsamt-Kanton: Der ganze Kanton bildet einen einzigen Betreibungskreis und einen einzigen Konkurskreis (Art. 1 und Art. 2 EG SchKG, GS 280.100). Zuständig ist das Betreibungs- und Konkursamt mit Sitz in Appenzell (Marktgasse 2, 9050 Appenzell), angesiedelt im Volkswirtschaftsdepartement. Aufsichtsbehörde ist eine dreiköpfige Delegation des Kantonsgerichts (Art. 5 EG SchKG). Das frühere eigenständige Betreibungsamt des Bezirks Oberegg wurde nach der Landsgemeinde 2024 aufgehoben und per 1. Juni 2024 vollständig in das Betreibungs- und Konkursamt Appenzell I.Rh. integriert (Änderung 2024-10: Aufhebung von Art. 1 Abs. 1 lit. a/b). Bereits ab Januar 2024 führte das kantonale Amt Oberegg als ausserordentliche Stellvertretung. In Oberegg gibt es keine eigenständige Dienststelle mehr; nach Voranmeldung sind Termine vor Ort bzw. in der Bezirkskanzlei Oberegg möglich. Da nur ein einziges Amt existiert, ist die Zuordnung jeder politischen Gemeinde (Appenzell, Schwende-Rüte, Rüte/Schwende, Schlatt-Haslen, Gonten, Oberegg) zum Betreibungs- und Konkursamt Appenzell deterministisch und eindeutig.

- **Rechtsgrundlage:** Einführungsgesetz zum Bundesgesetz über Schuldbetreibung und Konkurs (EG SchKG) (GS 280.100), Gesetzessammlung des Kantons Appenzell I.Rh. (ai.clex.ch), GS 280.100.
  Stand: vom 28. April 1996, in Kraft seit 1. Januar 1997; aktuelle konsolidierte Fassung in Kraft seit 1. Juni 2024 (Beschluss vom 28.04.2024, Änderung 2024-10); nicht aufgehoben. https://ai.clex.ch/app/de/texts_of_law/280.100 (am Wortlaut geprüft).
  Kern: Art. 1 Abs. 1: 'Der Kanton Appenzell I.Rh. bildet für die Durchführung der Schuldbetreibung einen Betreibungskreis.' Art. 1 Abs. 2: 'Der Sitz der für das Betreibungswesen zuständigen Stelle ist Appenzell.' (Die frühere Unterteilung in lit. a/b wurde mit der Änderung 2024-10 per 01.06.2024 aufgehoben.) Art. 2 bildet analog einen einzigen Konkurskreis mit Sitz Appenzell.
- **Amtliches Verzeichnis** (htmlListe, gemeindescharf ableitbar: ja): https://www.ai.ch/verwaltung/volkwirtschaftsdepartement/betreibungs-und-konkursamt
  Amtliche Seite der kantonalen Verwaltung (Volkswirtschaftsdepartement) zum Betreibungs- und Konkursamt mit Kontakt-/Adressblock. Da es nur ein einziges kantonales Amt gibt, ist die Zuordnung jeder politischen Gemeinde zu diesem Amt trivial und gemeindescharf. Vollständige Postadresse/Öffnungszeiten unter der Kontakt-Unterseite (.../betreibungs-und-konkursamt/kontakt/addressblock_detail_view).
- **Beispielämter (adressgeprüft):**
  - Betreibungs- und Konkursamt Appenzell I.Rh. (kantonales Einheitsamt) — Betreibungs- und Konkursamt, Marktgasse 2, 9050 Appenzell; Tel. +41 71 788 96 21; E-Mail [email protected]; Öffnungszeiten Mo-Fr 08.00-11.30 / 14.00-17.00 (https://www.ai.ch/verwaltung/volkwirtschaftsdepartement/betreibungs-und-konkursamt/kontakt/addressblock_detail_view)
  - Betreibungswesen Bezirk Oberegg (kein eigenes Amt mehr; durch Betreibungs- und Konkursamt Appenzell geführt) — Keine eigenständige Dienststelle mehr. Das Betreibungsamt Oberegg wurde per 01.06.2024 aufgehoben und in das Betreibungs- und Konkursamt Appenzell (Marktgasse 2, 9050 Appenzell, Tel. +41 71 788 96 21) integriert; vor Ort/in der Bezirkskanzlei Oberegg nur Termine nach Voranmeldung. (https://www.ai.ch/politik/standeskommission/mitteilungen/aktuelles/kantonsaufgaben-in-oberegg-werden-neu-organisiert)
- **Adversariale Prüfung:** System ja · Rechtsgrundlage ja · Verzeichnis ja · Adresse ja.
  **Korrekturen/Präzisierungen des Prüf-Agents:** Keine substanziellen Korrekturen noetig; alle Kernbehauptungen (Einheitsamt, ein Betreibungs-/Konkurskreis, Sitz Appenzell, Aufhebung lit. a/b per 01.06.2024, Adresse Marktgasse 2/9050 Appenzell/Tel. 071 788 96 21, Oberegg-Integration) wurden bestaetigt. Hinweise: (1) Die amtlichen ai.ch-Seiten und die clex.ch-Gesetzesseite waren fuer WebFetch nicht direkt abrufbar (HTTP 403 bzw. JavaScript-Rendering); die Verifikation stuetzt sich daher auf einen unabhaengigen Gesetzes-Versionsvergleich (lexaris.eu) und mehrere Drittverzeichnisse statt auf den Direktabruf der amtlichen Quelle - die im Behauptungstext als 'am Wortlaut geprueft' deklarierte Direktpruefung der amtlichen Quelle konnte hier nicht repliziert werden, der Inhalt ist aber inhaltlich/zeichengenau extern bestaetigt. (2) Die Aufzaehlung der Beispielgemeinden enthaelt redundant 'Schwende-Ruete' und 'Rüte/Schwende' - seit der Fusion 2022 existiert nur die politische Gemeinde Schwende-Ruete; dies beeintraechtigt die (ohnehin triviale) Amtszuordnung nicht.
- **Risiken/Pflege:**
  - Bis Ende 2023 bestand neben dem kantonalen Amt ein eigenständiges Betreibungsamt im Bezirk Oberegg; ältere Quellen (vor 01.06.2024) nennen daher zwei Stellen. Massgebend ist die neuere amtliche Fassung des EG SchKG (Stand 01.06.2024) mit nur noch einem Betreibungskreis.
  - Die amtliche Seite ai.ch lieferte WebFetch teils HTTP 403; Adresse und Wortlaut wurden über direkten Seitenabruf bzw. das PDF der Gesetzessammlung (ai.clex.ch) verifiziert.
  - Es existiert kein 'Verzeichnis' mehrerer Ämter, da es nur ein Einheitsamt gibt; die Anzahl (1) und die Adresse stammen aus der amtlichen Kontaktseite des Amts.
  - Gemeindefusionen (z. B. Schwende-Rüte per 2022) ändern die Zuständigkeit nicht: alle politischen Gemeinden des Kantons werden vom einen kantonalen Betreibungs- und Konkursamt Appenzell bedient.

## SG — Gemeindeämter (Anzahl offen)

Im Kanton St. Gallen ist das Betreibungswesen GEMEINDEBASIERT organisiert. Nach Art. 1 Abs. 1 des Einführungsgesetzes zum Bundesgesetz über Schuldbetreibung und Konkurs (EG SchKG, sGS 971.1) bildet jede politische Gemeinde einen Betreibungskreis und führt grundsätzlich ein eigenes Betreibungsamt. Die Betreibungsbeamten werden vom Gemeinderat gewählt (Art. 2), von der Gemeinde besoldet (Art. 4), und die Gebühren fallen in die Gemeindekasse (Art. 5). Politische Gemeinden können sich durch Vereinbarung der Gemeinderäte zu einem gemeinsamen Betreibungskreis zusammenschliessen (Art. 1 Abs. 2); die Regierung kann einen Zusammenschluss anordnen, wenn die ordentliche Amtsführung nicht mehr gewährleistet ist (Art. 1 Abs. 3). Es bestehen daher tendenziell so viele Betreibungsämter wie politische Gemeinden, mit einzelnen zusammengeschlossenen Kreisen (z. B. Betreibungsamt Gossau, das auch für Andwil und Waldkirch zuständig ist; Betreibungsamt Grabs-Gams; Betreibungsamt Bütschwil-Ganterschwil). Das Konkursamt ist demgegenüber kantonal einheitlich (Art. 7 f.: der Kanton bildet einen Konkurskreis, Sitz St. Gallen). Untere Aufsichtsbehörde über die Betreibungsämter ist der Einzelrichter des Kreisgerichts (Art. 12), obere Aufsichtsbehörde ein Ausschuss des Kantonsgerichts (Art. 13). Die Adressen der einzelnen Betreibungsämter werden dezentral auf den jeweiligen Gemeinde-Websites publiziert; ein zentrales, adressscharfes kantonales HTML-Verzeichnis besteht nicht. Wegen der Kombinationsmöglichkeit mehrerer Gemeinden in einem Kreis kann das System auch als gemischt (Grundregel Gemeindeamt + vereinzelte Zusammenschlüsse) charakterisiert werden; die gesetzliche Grundregel ist jedoch das Gemeindeamt.

- **Rechtsgrundlage:** Einführungsgesetz zum Bundesgesetz über Schuldbetreibung und Konkurs (EG SchKG) (sGS 971.1), Art. 1 (Betreibungskreis); Art. 2, 4, 5 (Betreibungsbeamte/Besoldung/Gebühren); Art. 7-8 (Konkursamt, kantonaler Konkurskreis, Sitz St. Gallen); Art. 12-13 (Aufsichtsbehörden).
  Stand: Erlassen 27. Februar 1980 / rechtsgültig 10. April 1980, in Vollzug ab 1. Januar 1981; letzte Änderungen u. a. durch EG-ZPO (15. Juni 2010) und EG-StPO (3. August 2010); geltend, nicht aufgehoben.. https://www.gesetzessammlung.sg.ch/app/de/texts_of_law/971.1 (am Wortlaut geprüft).
  Kern: Art. 1 Abs. 1: 'Die politische Gemeinde bildet einen Betreibungskreis.' Abs. 2: 'Politische Gemeinden können sich durch Vereinbarung zu einem Betreibungskreis zusammenschliessen. Zuständig sind die Gemeinderäte.' Abs. 3: 'Die Regierung ordnet den Zusammenschluss an, wenn die ordentliche Führung des Amtes nicht mehr gewährleistet ist.'
- **Amtliches Verzeichnis** (keines, gemeindescharf ableitbar: ja): https://www.sg.ch/recht/gerichte/organisation---standorte/kreisgerichte.html
  Es existiert kein zentrales, adressscharfes kantonales Verzeichnis der Betreibungsämter auf einer amtlichen Kantonsseite. Die offizielle Kantonsseite sg.ch (Gerichte/Kreisgerichte) listet zwar gemeindescharf die Zuordnung Gemeinde -> Kreisgericht (= untere Aufsichtsbehörde, Art. 12 EG SchKG), aber NICHT die Betreibungsämter mit Adressen. Die Adressen der einzelnen Betreibungsämter sind dezentral auf den jeweiligen politischen-Gemeinde-Websites publiziert (z. B. au.ch, stadt.sg.ch, stadtgossau.ch). Die Zuordnung Gemeinde -> Betreibungsamt ist gleichwohl gemeindescharf deterministisch ableitbar, weil nach Art. 1 EG SchKG jede politische Gemeinde ihren eigenen Betreibungskreis bildet; einzige Ausnahmen sind die per Vereinbarung zusammengeschlossenen Kreise (z. B. Gossau für Andwil/Waldkirch), die separat zu erfassen sind.
- **Beispielämter (adressgeprüft):**
  - Betreibungsamt der Stadt St. Gallen — Betreibungsamt, Unterstrasse 14, 9001 St. Gallen (https://www.stadt.sg.ch/home/verwaltung-politik/direktionen/inneres-finanzen/betreibungsamt.html)
  - Betreibungsamt Au (SG) — Betreibungsamt Au, Kirchweg 6, 9434 Au (https://www.au.ch/aemter/7149)
- **Adversariale Prüfung:** System ja · Rechtsgrundlage ja · Verzeichnis ja · Adresse ja.
  **Korrekturen/Präzisierungen des Prüf-Agents:** Keine inhaltlichen Korrekturen noetig - alle pruefbaren Behauptungen am Quelltext bestaetigt. Praezisierung: Die untere Aufsichtsbehoerde ist gemaess authentischem Art. 12 EG SchKG (sGS 971.1) der 'Einzelrichter des Kreisgerichtes' (nicht der Praesident); die Behauptung ist insofern korrekt. Ein abweichender Web-Suchtreffer ('Kreisgerichtspraesident') ist falsch. Die Beispieladresse Betreibungsamt Au enthaelt am Quell-URL zusaetzlich 'Postfach' (Kirchweg 6, Postfach, 9434 Au); Strasse/Nummer/PLZ/Ort sind identisch zur Behauptung.
- **Risiken/Pflege:**
  - Kein offizielles, zentrales und adressscharfes kantonales Betreibungsamt-Verzeichnis auf sg.ch gefunden; die Adressen liegen verteilt auf den einzelnen Gemeinde-Websites. Eine zählbare amtliche Gesamtliste konnte nicht verifiziert werden, daher anzahlAemter = null.
  - Grundregel ist ein Betreibungsamt je politische Gemeinde (Art. 1 Abs. 1 EG SchKG), doch mehrere Gemeinden können sich per Vereinbarung zu einem Kreis zusammenschliessen (Art. 1 Abs. 2). Solche Zusammenschlüsse (belegt: Gossau für Andwil/Waldkirch; Hinweise auf Grabs-Gams, Bütschwil-Ganterschwil) müssen einzeln erfasst werden, sonst droht falsche Zuordnung.
  - Gemeindefusionen der letzten Jahre verändern die Zahl und die Zuordnung der Betreibungskreise laufend; die jeweils aktuelle Gemeindeliste des Kantons ist abzugleichen, bevor eine Gemeinde -> Amt-Tabelle finalisiert wird.
  - Bei mehrgemeindigen Betreibungskreisen ist der Sitz (Adresse) nur an einem Ort; die Mitgemeinden sind dort mitzuführen (z. B. Au verweist auf Strassenverzeichnis Heerbrugg zur Abgrenzung der politischen Gemeinde Au).

## GR — Bezirks-/Regionalämter (11 Ämter)

Der Kanton Graubünden ist in 11 Regionen eingeteilt. Jede Region bildet einen Betreibungs- und Konkurskreis mit einem eigenen Betreibungs- und Konkursamt (kombiniert Betreibung und Konkurs). Diese Struktur gilt seit dem 1.1.2016; die früheren 39 Kreise wurden per 31.12.2015 aufgehoben und durch die 11 Regionen ersetzt. Die fachliche Aufsicht nimmt das Obergericht (unterstützt durch zwei Inspektoren) wahr; Konkursgericht ist das Regionalgericht. Die 11 Ämter sind: Albula (Tiefencastel), Bernina (Poschiavo), Engiadina Bassa/Val Müstair (Scuol, mit Zweigstelle Sta. Maria), Imboden (Domat/Ems), Landquart (Landquart), Maloja (Samedan), Moesa (Roveredo), Plessur (Chur), Prättigau/Davos (Davos Platz, mit Zweigstelle Schiers), Surselva (Ilanz), Viamala (Thusis). Zwei oder mehrere Regionen könnten ihre Ämter rechtlich zusammenlegen (Art. 1 Abs. 2 EG SchKG).

- **Rechtsgrundlage:** Einführungsgesetz zum Bundesgesetz über Schuldbetreibung und Konkurs (EGzSchKG) (BR 220.000), Bündner Rechtsbuch (Systematische Sammlung), Art. 1 (Betreibungs- und Konkurskreise).
  Stand: in Kraft seit 1.1.2016 (konsolidierte Fassung, nicht aufgehoben). https://www.gr-lex.gr.ch/app/de/texts_of_law/220.000 (am Wortlaut geprüft).
  Kern: Art. 1: 'Jede Region bildet einen Betreibungs- und Konkurskreis. Zwei oder mehrere Regionen können die Führung und Verwaltung ihrer Betreibungs- und Konkursämter zusammenlegen.'
- **Rechtsgrundlage:** Gesetz über die Einteilung des Kantons Graubünden in Regionen (BR 110.200), Art. 1 (Einteilung): listet alle Gemeinden je Region mit Hauptort.
  Stand: vom 23. April 2014 (Stand 1. Januar 2016), nicht aufgehoben; Gemeindebestand wird Fusionen entsprechend formlos angepasst. https://www.gr-lex.gr.ch/app/de/texts_of_law/110.200 (am Wortlaut geprüft).
  Kern: Art. 1 Abs. 1: 'Die Gemeinden werden wie folgt den Regionen zugeteilt: ...' — z. B. Region Imboden: Bonaduz, Domat/Ems, Felsberg, Flims, Rhäzüns, Tamins, Trin (Hauptort Domat/Ems). Diese Norm liefert die gemeindescharfe Zuordnung Gemeinde→Region→Betreibungsamt.
- **Amtliches Verzeichnis** (htmlListe, gemeindescharf ableitbar: ja): https://www.justiz-gr.ch/schuldbetreibung-und-konkurs/ueber-uns/betreibungs-und-konkursaemter/
  Amtliches Justizportal des Kantons Graubünden (justiz-gr.ch) listet alle Betreibungs- und Konkursämter (je Region) mit vollständigen Postadressen. Die gemeindescharfe Zuordnung ergibt sich deterministisch über das Gesetz über die Einteilung des Kantons in Regionen (BR 110.200, Art. 1), das jede Gemeinde genau einer Region und damit genau einem Betreibungs- und Konkursamt zuweist. Das Justizportal verlinkt das Einteilungsgesetz zudem als PDF unter https://www.justiz-gr.ch/fileadmin/dateien/Betreibung_und_Konkurs/Gesetz_ueber_die_Einteilung_des_Kantons_Graubuenden_in_Regionen.pdf
- **Beispielämter (adressgeprüft):**
  - Betreibungs- und Konkursamt Plessur — Masanserstrasse 2, 7001 Chur (https://www.justiz-gr.ch/schuldbetreibung-und-konkurs/ueber-uns/betreibungs-und-konkursaemter/)
  - Betreibungs- und Konkursamt Imboden — Plazza Staziun 6, 7013 Domat/Ems (https://www.justiz-gr.ch/schuldbetreibung-und-konkurs/ueber-uns/betreibungs-und-konkursaemter/)
- **Adversariale Prüfung:** System ja · Rechtsgrundlage ja · Verzeichnis ja · Adresse ja.
  **Korrekturen/Präzisierungen des Prüf-Agents:** Operative Rechtsgrundlage praezisieren: Die amtliche Organisationsseite (justiz-gr.ch) stuetzt sich auf Art. 1 und 2 Abs. 2 SchKG (Bundesrecht) sowie Art. 13 Abs. 1 und Art. 14 Abs. 1 EGzSchKG; Art. 1 EGzSchKG regelt (wie behauptet) die Kreiseinteilung. Empfehlung: Art. 13/14 EGzSchKG als operative Normen ergaenzen. - Die Detailbehauptung 'Konkursgericht ist das Regionalgericht' wurde an der Quelle NICHT bestaetigt (Organisationsseite nennt kein konkretes Gericht); plausibel, aber unverifiziert. - Hinweis zur Verifikationsqualitaet der Rechtsgrundlage: Das gr-lex-Portal ist JS-gerendert und das amtliche PDF font-kodiert; der Art.-1-Wortlaut wurde daher indirekt (Suchindex + Parlamentsvorlage 2014), nicht durch direkten zeichengenauen Quellabruf am gr-lex-Volltext bestaetigt - vor produktivem Einsatz finale Sichtpruefung am gr-lex-Portal empfohlen. Alle Kern-Fakten (System, 11 Regionen, 2016, Aufsicht Obergericht/2 Inspektoren, beide Beispieladressen, gemeindescharfe Ableitbarkeit) sind bestaetigt.
- **Risiken/Pflege:**
  - Der genaue 'Stand' der konsolidierten Fassung von BR 220.000 konnte am amtlichen Portal gr-lex.gr.ch nicht direkt abgerufen werden, da die Seite JavaScript-gerendert ist (WebFetch lieferte nur den Seitenrahmen 'LexWork'). Der Wortlaut von Art. 1 wurde über eine vollständige Textspiegelung verifiziert; das aktuelle Inkrafttretensdatum (1.1.2016) stammt aus dem amtlichen Kontext (justiz-gr.ch) — eine spätere Teilrevision ist nicht ausgeschlossen und sollte am gr-lex-Portal final geprüft werden.
  - Das amtliche Ämterverzeichnis (justiz-gr.ch) führt 13 Einträge, weil zwei Ämter Zweigstellen haben (Prättigau/Davos: Hauptamt Davos Platz + Zweigstelle Schiers; Engiadina Bassa/Val Müstair: Hauptamt Scuol + Zweigstelle Sta. Maria). Massgebend für die Zahl der Betreibungskreise/-ämter sind die 11 Regionen.
  - Gemeindefusionen: Der Gemeindebestand je Region wird gemäss BR 110.200 Fusionen entsprechend formlos angepasst; die Gemeindeliste in der PDF (Stand 2016) kann von der heutigen Gemeindelandschaft abweichen. Für eine produktive Zuordnung ist der aktuelle konsolidierte Stand von BR 110.200 zu verwenden.
  - Adressen der Beispielämter wurden aus der HTML-Liste des Justizportals übernommen (via WebFetch zusammengefasst); vor produktivem Einsatz empfiehlt sich eine 1:1-Sichtprüfung direkt auf der amtlichen Seite.

## AG — gemischt (Anzahl offen)

Im Kanton Aargau ist das Betreibungswesen grundsätzlich gemeindebasiert: Nach § 1 Abs. 1 EG SchKG bildet jede Einwohnergemeinde einen Betreibungskreis. § 1 Abs. 2 erlaubt jedoch, dass sich zwei oder mehr Einwohnergemeinden mit Genehmigung der Schuldbetreibungs- und Konkurskommission des Obergerichts zu einem gemeinsamen Betreibungskreis zusammenschliessen; die Zusammenarbeit, Organisation und Kostentragung wird per Vertrag der Gemeinderäte geregelt (§ 1 Abs. 3). In der Praxis ist daraus ein gemischtes System entstanden: Es gibt eine Reihe regionaler Betreibungsämter (Zusammenschlüsse mehrerer Gemeinden, z. B. Regionales Betreibungsamt Buchs für 8 Gemeinden inkl. Aarau, oder Regionales Betreibungsamt Rheinfelden für Rheinfelden, Kaiseraugst, Magden, Olsberg) neben einzelnen Gemeinden, die ihr eigenes Betreibungsamt führen. Der Sitz-Gemeinderat stellt die Betreibungsbeamtin/den Betreibungsbeamten an (§ 3). Für das Konkurswesen bildet der Kanton dagegen EINEN Konkurskreis mit einem kantonalen Konkursamt (§ 2 Abs. 1). Aufsichtsbehörde ist die Schuldbetreibungs- und Konkurskommission des Obergerichts; das Betreibungsinspektorat fungiert als Auskunfts-/Beratungsstelle.

- **Rechtsgrundlage:** Einführungsgesetz zum Bundesgesetz über Schuldbetreibung und Konkurs (EG SchKG) (SAR 231.200), Systematische Sammlung des Aargauischen Rechts (SAR), Erlass-Sammlung Kanton Aargau.
  Stand: Vom 22. Februar 2005, konsolidierte Fassung Stand 1. Juli 2024; in Kraft (nicht aufgehoben). https://gesetzessammlungen.ag.ch/app/de/texts_of_law/231.200 (am Wortlaut geprüft).
  Kern: § 1 Abs. 1: «Jede Einwohnergemeinde bildet einen Betreibungskreis.» § 1 Abs. 2: «Zwei oder mehr Einwohnergemeinden können sich mit Genehmigung der Schuldbetreibungs- und Konkurskommission des Obergerichts zu einem Betreibungskreis zusammenschliessen.» (§ 2 Abs. 1: «Der Kanton bildet einen Konkurskreis.»)
- **Amtliches Verzeichnis** (suchmaske, gemeindescharf ableitbar: ja): https://www.betreibungsamt-ag.ch/v5/index.php/amtsverzeichnis
  Offizielles Amtsverzeichnis der Betreibungsämter des Kantons Aargau (betrieben vom Verband Betreibungsbeamten Kanton Aargau; von der kantonalen Justizseite ag.ch/Betreibungsinspektorat als zentrale Auskunftsstelle verlinkt). Das Verzeichnis bietet eine Auswahl/Suchmaske nach Bezirk/Gemeinde und führt die einzelnen Betreibungsämter mit Adressen samt zugeordneten Gemeinden auf, womit die Zuordnung Gemeinde->Amt gemeindescharf ableitbar ist. Ergänzend nennen die offiziellen Gemeinde-Webseiten je Amt explizit die zugeordneten politischen Gemeinden (z. B. Buchs: Aarau, Biberstein, Buchs, Densbüren/Asp, Erlinsbach AG, Gränichen, Küttigen/Rombach, Suhr). Hinweis: Das Verzeichnis war beim Abruf zeitweise nicht erreichbar (ECONNREFUSED); Struktur und Inhalt aus Suchergebnis-Indexierung und verlinkten Detailseiten bestätigt.
- **Beispielämter (adressgeprüft):**
  - Regionales Betreibungsamt Buchs (zuständig für Aarau, Biberstein, Buchs, Densbüren/Asp, Erlinsbach AG, Gränichen, Küttigen/Rombach, Suhr) — Steinachermattweg 2a, Postfach 39, 5033 Buchs (https://www.buchs-aargau.ch/verwaltung/abteilungen-bereiche/betreibungsamt-regional.html/102)
  - Regionales Betreibungsamt Rheinfelden (zuständig für Rheinfelden, Kaiseraugst, Magden, Olsberg) — Baslerstrasse 10, 4310 Rheinfelden (https://www.rheinfelden.ch/de/verwaltung/abteilungen/8_betreibungsamt)
- **Adversariale Prüfung:** System ja · Rechtsgrundlage ja · Verzeichnis nein · Adresse ja.
  **Korrekturen/Präzisierungen des Prüf-Agents:** Keine inhaltlichen Korrekturen an System, Rechtsgrundlage oder Beispieladressen noetig - alle zeichengenau/woertlich an der amtlichen Quelle bestaetigt. Einschraenkung: Die Verzeichnis-URL (betreibungsamt-ag.ch/v5/.../amtsverzeichnis) war bei mehreren Abrufversuchen nicht erreichbar (ECONNREFUSED), daher konnte 'gemeindescharf ableitbar=true' nicht direkt an der Suchmaske verifiziert werden - Feld verzeichnisBestaetigt=false (nicht widerlegt, sondern nicht eigenstaendig pruefbar). Ergaenzender Hinweis zur Vollstaendigkeit: § 2 Abs. 2 EG SchKG erlaubt der SchKK, nach Bedarf regionale Amtsstellen fuer das Konkurswesen zu schaffen; die Einordnung 'ein Konkurskreis' bleibt davon korrekt.
- **Risiken/Pflege:**
  - Anzahl der Betreibungsämter nicht abschliessend gezählt: Das offizielle Amtsverzeichnis (betreibungsamt-ag.ch) war beim Abruf zeitweise nicht erreichbar (ECONNREFUSED/Timeout), sodass keine deterministische Zählung aus der Liste erfolgen konnte; anzahlAemter daher null.
  - Gemeindefusionen und Amts-Zusammenlegungen: Da § 1 EG SchKG laufende Zusammenschlüsse zulässt, ändert sich die Zahl und der Zuschnitt der Betreibungskreise periodisch. Suchergebnis-Angaben (z. B. 'fünf Gemeinden mit eigenem Amt, vierzehn Zusammenschlüsse') stammen aus journalistischen/Sekundärquellen und sind nicht als amtlich verifiziert anzusehen.
  - Trägerschaft des Verzeichnisses: Das Amtsverzeichnis wird vom Verband Betreibungsbeamten Kanton Aargau betrieben (nicht unmittelbar vom Kanton publiziert), ist aber die von der offiziellen kantonalen Justizseite (ag.ch, Betreibungsinspektorat) als zentrale Auskunftsstelle verlinkte Quelle; die Beispieladressen wurden zur Absicherung von offiziellen Gemeinde-Webseiten verifiziert.
  - Hinweis auf möglichen Domain-/Hosting-Wechsel (Suchtreffer erwähnen gemeinden-ag.ch / vbb.gemeinden-ag.ch) — Verzeichnis-URL vor produktivem Einsatz erneut prüfen.

## TG — Bezirks-/Regionalämter (5 Ämter)

Der Kanton Thurgau ist operativ in 5 Bezirksbetreibungsämter aufgeteilt: Arbon (Sitz Romanshorn), Frauenfeld (mit Aussenstelle Steckborn), Kreuzlingen, Münchwilen und Weinfelden (mit Aussenstelle Bischofszell). Diese sind Abteilungen des kantonalen Amtes für Betreibungs- und Konkurswesen (Sitz Bahnhofplatz 69, 8510 Frauenfeld) im Departement für Justiz und Sicherheit; die Konkurse führt das zentrale Konkursamt/Betreibungsinspektorat durch. Rechtliche Grundlage ist das Gesetz über die Zivil- und Strafrechtspflege (ZSRG, RB 271.1). Dieses teilt die Bezirke in Friedensrichter-/Betreibungskreise ein (§ 15); gemäss § 57 führt die Friedensrichterin/der Friedensrichter das Betreibungsamt, und die örtliche Zuständigkeit richtet sich nach dem Anhang zum Gesetz (Bezirk → Kreise → politische Gemeinden). Die operativen Betreibungsämter sind heute auf Bezirksebene zusammengelegt. Eine gemeindescharfe Zuordnung politische Gemeinde → Betreibungsamt ist über das amtliche Portal tg.ch verfügbar (Detailseite je Gemeinde) sowie über die Gemeindelisten auf den einzelnen Amts-Seiten von betreibungsamt.tg.ch.

- **Rechtsgrundlage:** Gesetz über die Zivil- und Strafrechtspflege (ZSRG) (RB 271.1), Rechtsbuch des Kantons Thurgau, Systematische Sammlung, Nr. 271.1; Gesetz vom 17. Juni 2009, in Kraft seit 1. Januar 2011.
  Stand: Gesetz vom 17. Juni 2009, in Kraft gesetzt auf den 1. Januar 2011; geltende konsolidierte Fassung (nicht aufgehoben; konkretisiert durch Zivil- und Strafrechtspflegeverordnung RB 271.11). https://www.rechtsbuch.tg.ch/app/de/texts_of_law/271.1 (am Wortlaut geprüft).
  Kern: § 15 Abs. 1: 'Die Bezirke sind in Friedensrichterkreise eingeteilt.' Abs. 2: 'Die örtliche Zuständigkeit richtet sich nach dem Anhang zu diesem Gesetz.' § 57 Abs. 1: 'Die Friedensrichterin oder der Friedensrichter führt das Betreibungsamt.' Der Anhang ('Friedensrichter- und Betreibungskreise') ordnet jede politische Gemeinde einem Kreis innerhalb eines Bezirks zu (z. B. Bezirk Arbon, Kreise Arbon und Romanshorn).
- **Amtliches Verzeichnis** (htmlListe, gemeindescharf ableitbar: ja): https://www.tg.ch/justiz/zivil--und-strafrechtspflege.html/23
  Amtliches Portal des Kantons Thurgau (tg.ch/Justiz): alphabetische Liste aller politischen Gemeinden; pro Gemeinde eine Detailseite, die ausdrücklich das zuständige Friedensrichter-/Betreibungsamt (sowie Schlichtungsbehörde, Bezirksgericht, Staatsanwaltschaft) nennt. Zuordnung damit gemeindescharf und deterministisch. Ergänzend listet betreibungsamt.tg.ch auf jeder Amts-Seite die zugehörigen politischen Gemeinden (z. B. Betreibungsamt Bezirk Arbon: 12 Gemeinden). Die Übersicht der 5 Bezirksbetreibungsämter findet sich unter https://betreibungsamt.tg.ch/html/928 ; Standorte zusätzlich über ThurGIS.
- **Beispielämter (adressgeprüft):**
  - Betreibungsamt Bezirk Arbon — Bahnhofstrasse 3, Postfach, 8590 Romanshorn (Tel. 058 345 16 70, betreibungsamt.arbon@tg.ch); zuständig u.a. für Amriswil, Arbon, Dozwil, Egnach, Hefenhofen, Horn, Kesswil, Roggwil, Romanshorn, Salmsach, Sommeri, Uttwil (https://betreibungsamt.tg.ch/betreibungsaemter/betreibungsamt-arbon.html/990)
  - Betreibungsamt Bezirk Frauenfeld — St. Gallerstrasse 4, 8510 Frauenfeld (Tel. 058 345 77 40, betreibungsamt.frauenfeld@tg.ch); mit Aussenstelle Steckborn (https://betreibungsamt.tg.ch/betreibungsaemter/betreibungsamt-frauenfeld.html/992)
- **Adversariale Prüfung:** System ja · Rechtsgrundlage nein · Verzeichnis ja · Adresse ja.
  **Korrekturen/Präzisierungen des Prüf-Agents:** Systemeinordnung (5 Bezirksbetreibungsämter) und Beispieladressen sind korrekt; die Rechtsgrundlagen-Zitate sind jedoch fehlerhaft und der Befund 'amWortlautGeprueft: true' für § 15/§ 57 ist nicht haltbar. Korrigierter Wortlaut der GELTENDEN Fassung (ZSRG RB 271.1, vom 17.6.2009, Stand 1.6.2016, in Kraft, nicht aufgehoben): § 15 ('Friedensrichterin oder Friedensrichter') Abs. 1: 'Jeder Bezirk hat eine Friedensrichterin oder einen Friedensrichter. Sie oder er kann in mehreren Bezirken tätig sein und ist administrativ dem Betreibungsamt angegliedert.' § 57 ('Betreibungsamt') Abs. 1: 'Jeder Bezirk hat ein Betreibungsamt. Die Betreibungsämter können Aussenstellen führen.' Der behauptete 'Anhang (Friedensrichter- und Betreibungskreise)' wurde per 1.6.2016 AUFGEHOBEN; die Begriffe Friedensrichterkreis/Betreibungskreis und 'örtliche Zuständigkeit nach dem Anhang' existieren im geltenden Gesetz nicht mehr. Die gemeindescharfe Zuordnung ergibt sich heute ausschliesslich aus dem operativen Verzeichnis (tg.ch-Gemeindeseiten bzw. betreibungsamt.tg.ch), nicht aus einem Gesetzesanhang. Massgeblich für die örtliche Zuständigkeit ist heute schlicht 'ein Betreibungsamt je Bezirk' (§ 57). Adressen Arbon (Bahnhofstrasse 3, Postfach, 8590 Romanshorn) und Frauenfeld (St. Gallerstrasse 4, 8510 Frauenfeld) sind zeichengenau bestätigt.
- **Risiken/Pflege:**
  - Begriffliche Doppelung: Rechtlich kennt das ZSRG (§ 15/§ 57, Anhang) Friedensrichter-/Betreibungskreise pro Bezirk; operativ sind die Ämter zu 5 Bezirksbetreibungsämtern zusammengelegt (Amt für Betreibungs- und Konkurswesen). Für die deterministische Zuordnung ist das operative Verzeichnis (tg.ch-Gemeindeseiten / betreibungsamt.tg.ch) massgebend.
  - Die Zahl 5 bezieht sich auf die operativen Bezirksbetreibungsämter; Aussenstellen (Steckborn zu Frauenfeld, Bischofszell zu Weinfelden) sind keine eigenständigen Ämter und nicht mitgezählt.
  - Gemeindefusionen im Kanton Thurgau können die Gemeindelisten verändern; die tg.ch-Gemeindedetailseiten gelten als laufend nachgeführte, neuere amtliche Quelle und sind Widersprüchen vorzuziehen.
  - Der genaue Wortlaut des Anhangs (vollständige Gemeindezuordnung je Kreis/Bezirk) wurde nur auszugsweise (Bezirk Arbon) im PDF des ZSRG verifiziert; die vollständige Gemeinde→Amt-Zuordnung ist über die tg.ch-Gemeindeseiten abzugleichen.
  - Die konsolidierte Fassung des ZSRG wurde über den lexfind-Spiegel (identischer amtlicher Text, RB 271.1, 1/2011) im Wortlaut gelesen; rechtsbuch.tg.ch selbst rendert nur via JavaScript und liefert die Belegseite (URL angegeben).

## TI — Bezirks-/Regionalämter (8 Ämter)

Der Kanton Tessin bildet seit der Reorganisation einen einzigen Betreibungskreis (circondario di esecuzione) und einen einzigen Konkurskreis (circondario dei fallimenti). Innerhalb des Betreibungskreises bestehen jedoch regionale Hauptämter (uffici principali) und Agenturen (agenzie). Art. 1 Abs. 3 LALEF nennt die Hauptsitze Bellinzona, Locarno, Lugano und Mendrisio sowie die Agenturen Acquarossa, Biasca, Cevio und Faido. Die amtliche Liste der Sezione di esecuzione e fallimento fuehrt dementsprechend 8 Betreibungsaemter (uffici di esecuzione), benannt nach den Bezirken/Regionen: Bellinzona, Blenio (Acquarossa), Leventina (Faido), Locarno, Lugano, Mendrisio, Riviera (Biasca) und Vallemaggia (Cevio). Die Aufsicht uebt die Camera di esecuzione e fallimenti des Tribunale d'appello (CEF) aus; ein kantonales Ispettorato di esecuzione e fallimenti ueberwacht alle Aemter. Fuer die Zuordnung Gemeinde -> Amt besteht eine amtliche Tabelle Comune/Distretto. Es handelt sich somit um regionale/bezirksbezogene Aemter innerhalb eines kantonalen Kreises (gemischtes Modell mit Hauptaemtern und Agenturen, einheitlicher Kreis fuer Konkurs).

- **Rechtsgrundlage:** Legge cantonale di applicazione della legge federale sulla esecuzione e sul fallimento (LALEF) (RL 280.100), Raccolta delle leggi del Cantone Ticino, RL 280.100; del 12 marzo 1997, in vigore dal 6 giugno 1997.
  Stand: In vigore (konsolidierte Fassung; nicht aufgehoben; einzelne Artikel im Verlauf revidiert/aufgehoben), Stand 2026. https://m3.ti.ch/CAN/RLeggi/public/index.php/index/nuovafinestra/atto/163/volume//numLegge/280.100 (am Wortlaut geprüft).
  Kern: Art. 1 Abs. 3 LALEF: 'Il circondario di esecuzione e composto dagli uffici principali con sede a Bellinzona, Locarno, Lugano e Mendrisio e dalle agenzie di Acquarossa, Biasca, Cevio e Faido. Il circondario dei fallimenti e composto dall'ufficio principale con sede a Lugano e dalle agenzie di Acquarossa, Bellinzona, Biasca, Cevio, Faido, Locarno e Mendrisio.'
- **Amtliches Verzeichnis** (htmlListe, gemeindescharf ableitbar: ja): https://www4.ti.ch/di/dg/sezione-di-esecuzione-e-fallimento/chi-siamo/uffici-esecuzione
  Amtliche Seite der Sezione di esecuzione e fallimento (Dipartimento delle istituzioni) mit der Liste aller 8 Betreibungsaemter und vollstaendigen Postadressen. Zusaetzlich besteht eine amtliche Tabelle Comune/Distretto (https://www4.ti.ch/index.php?id=94308), aus der fuer jede politische Gemeinde der zustaendige Bezirk/das zustaendige Amt ableitbar ist. Damit ist die Zuordnung Gemeinde -> Amt gemeindescharf moeglich.
- **Beispielämter (adressgeprüft):**
  - Ufficio di esecuzione di Bellinzona — Via Henri Guisan 3, 6501 Bellinzona (https://www4.ti.ch/di/dg/sezione-di-esecuzione-e-fallimento/chi-siamo/uffici-esecuzione)
  - Ufficio di esecuzione di Lugano — Via Bossi 2A, 6901 Lugano (https://www4.ti.ch/di/dg/sezione-di-esecuzione-e-fallimento/chi-siamo/uffici-esecuzione)
- **Adversariale Prüfung:** System ja · Rechtsgrundlage ja · Verzeichnis ja · Adresse ja.
- **Risiken/Pflege:**
  - Begriffliche Diskrepanz: Art. 1 LALEF spricht von 'uffici principali' (Bellinzona, Locarno, Lugano, Mendrisio) und 'agenzie' (Acquarossa, Biasca, Cevio, Faido), waehrend die amtliche Webliste 8 gleichrangige uffici di esecuzione nach Bezirksnamen fuehrt (Bellinzona, Blenio, Leventina, Locarno, Lugano, Mendrisio, Riviera, Vallemaggia). Die Bezirksnamen entsprechen den im Gesetz genannten Standorten (Blenio=Acquarossa, Leventina=Faido, Riviera=Biasca, Vallemaggia=Cevio).
  - Der Kanton bildet rechtlich EINEN Betreibungskreis und EINEN Konkurskreis; die regionalen Aemter sind operative Standorte innerhalb dieses Kreises. Beim Konkurs ist der Hauptsitz Lugano massgebend, mit Agenturen an den uebrigen Standorten.
  - Gemeindefusionen: Die Comune/Distretto-Zuordnung kann durch laufende Tessiner Gemeindefusionen veraendert werden; die amtliche Tabelle (id=94308) ist massgebend und sollte fuer aktuelle Zuordnungen direkt konsultiert werden.
  - Die explizite Comune->Amt-Liste wurde als vorhanden bestaetigt (id=94308), aber der vollstaendige Inhalt der Tabelle wurde nicht Gemeinde fuer Gemeinde verifiziert.

## VD — Bezirks-/Regionalämter (10 Ämter)

Im Kanton Waadt ist das Betreibungswesen nach Bezirken (districts) organisiert: Jeder der 10 Bezirke des Kantons bildet einen Betreibungskreis (arrondissement de poursuite) mit je einem eigenen Betreibungsamt (office des poursuites). Massgeblich ist die LVLP (Loi vaudoise d'application de la LP, RSV 280.05) vom 18. Mai 1955. Art. 1 Abs. 1 LVLP: jeder Bezirk bildet einen Betreibungs- und einen Konkurskreis. Art. 2 Abs. 1: jeder Betreibungskreis verfügt über ein Betreibungsamt. Art. 3 Abs. 1: das Amt hat seinen Sitz grundsätzlich am Bezirkshauptort (chef-lieu). Der Staatsrat (Conseil d'Etat) kann auf Antrag des Kantonsgerichts Bezirke aufteilen oder zusammenlegen (Art. 1 Abs. 2). Es handelt sich somit nicht um ein Einheitsamt, sondern um Bezirksaemter. Konkurs (faillites) ist separat in vier Kreisen organisiert. Die amtliche Liste auf vd.ch/ojv weist genau 10 Betreibungsaemter aus (je eines pro Bezirk: Aigle, Broye-Vully, Gros-de-Vaud, Jura-Nord vaudois, Lausanne, Lavaux-Oron, Morges, Nyon, Ouest lausannois, Riviera-Pays-d'Enhaut).

- **Rechtsgrundlage:** Loi d'application dans le Canton de Vaud de la loi fédérale sur la poursuite pour dettes et la faillite (LVLP) (RSV 280.05), Recueil systématique de la législation vaudoise (RSV / Base législative vaudoise), Titre I Organisation, Chapitre I, Art. 1, 2 et 3.
  Stand: Loi du 18 mai 1955; version consolidée en vigueur dès le 01.01.2018 (Art. 2 modifié par la loi du 12.11.1996, en vigueur dès le 01.01.1997); erlass in Kraft, nicht aufgehoben. https://prestations.vd.ch/pub/blv-publication/actes/consolide/280.05 (am Wortlaut geprüft).
  Kern: Art. 1 al. 1: «Chaque district du Canton de Vaud forme un arrondissement de poursuite et un arrondissement de faillite (art. premier LP).» Art. 2 al. 1: «Chaque arrondissement de poursuite est pourvu d'un office des poursuites (art. 2 LP).» Art. 3 al. 1: «L'office a en principe son siège au chef-lieu du district.»
- **Rechtsgrundlage:** Arrêté d'exécution de la loi du 18 mai 1955 d'application dans le Canton de Vaud de la loi fédérale sur la poursuite pour dettes et la faillite (LVLP) (RSV 280.05.1), Recueil systématique de la législation vaudoise (RSV).
  Stand: Version en vigueur dès le 01.01.2018 (document généré le 21.10.2019); konkretisiert die Betreibungskreise/Sitze, in Kraft. https://www.lexfind.ch/tolv/95182/fr (**Wortlaut NICHT an der amtlichen Quelle prüfbar**).
  Kern: Ausführungserlass zur LVLP, der die Betreibungs- und Konkurskreise sowie deren Sitze näher regelt. Wortlaut der einzelnen Artikel konnte aus dem amtlichen PDF (CID-Fonts) nicht zeichengenau extrahiert werden.
- **Amtliches Verzeichnis** (suchmaske, gemeindescharf ableitbar: ja): https://www.vd.ch/ojv/offices-des-poursuites
  Amtliche Seite des Ordre judiciaire vaudois (OJV) auf dem kantonalen Portal vd.ch. Listet die 10 Betreibungsaemter (je Bezirk) und bietet ein Suchwerkzeug, um die zuständige Stelle nach Gemeinde (commune) oder Postleitzahl (NPA) zu ermitteln. Da jeder Bezirk genau einem Betreibungsamt entspricht und jede politische Gemeinde genau einem Bezirk angehört, ist die Zuordnung Gemeinde→Amt gemeindescharf ableitbar. Einzelne Amtsseiten (z.B. .../lausanne, .../nyon) enthalten die vollständigen Postadressen.
- **Beispielämter (adressgeprüft):**
  - Office des poursuites du district de Lausanne — Ch. du Trabandan 28 (entrée A), 1014 Lausanne; Tel. +41 21 316 66 00 (https://www.vd.ch/ojv/offices-des-poursuites/lausanne)
  - Office des poursuites du district de Nyon — Av. Reverdil 2, Case postale, 1260 Nyon 2; Tel. +41 22 557 50 80 (https://www.vd.ch/ojv/offices-des-poursuites/nyon)
- **Adversariale Prüfung:** System ja · Rechtsgrundlage ja · Verzeichnis ja · Adresse ja.
  **Korrekturen/Präzisierungen des Prüf-Agents:** Geringfügige Präzisierung: Art. 1 al. 2 LVLP lautet 'sur préavis du Tribunal cantonal' (auf Stellungnahme/Begutachtung des Kantonsgerichts), nicht 'auf Antrag des Kantonsgerichts'. Die Kernfakten (Bezirkssystem mit 10 Betreibungsämtern, je eines pro Bezirk; LVLP RSV 280.05 vom 18.05.1955, geltende konsolidierte Fassung i.K. seit 01.01.2018; Wortlaut Art. 1-3; Verzeichnis mit Suchmaske; Lausanne-Adresse Ch. du Trabandan 28, 1014 Lausanne) sind alle bestätigt. Die Anzahl der Konkursämter ('ca. 4') wurde nicht am Wortlaut geprüft und bleibt offen.
- **Risiken/Pflege:**
  - Frühere Suchergebnisse nannten teils '5 arrondissements de poursuite' bzw. zusätzliche Stellen in Lausanne/Vevey/Montreux; massgeblich und aktueller ist die amtliche vd.ch-Liste mit 10 Betreibungsaemtern (eines pro Bezirk). Die Diskrepanz beruht auf älterer Bezirkseinteilung/historischen Aufteilungen vor der Konsolidierung.
  - Betreibung (poursuite) und Konkurs (faillite) sind unterschiedlich organisiert: 10 Betreibungsaemter (je Bezirk), aber nur wenige (ca. 4) Konkursaemter je Konkurskreis. Bei Anfragen nicht verwechseln.
  - Der ARRÊTÉ 280.05.1 (RSV 280.05.1) regelt Kreise/Sitze im Detail; sein Wortlaut konnte aus dem amtlichen PDF (subsetted CID-Fonts) nicht zeichengenau abgerufen werden (amWortlautGeprueft=false). Wortlaut der LVLP selbst (Art. 1-3) wurde dagegen verbatim aus dem amtlichen PDF gelesen.
  - Gemeindefusionen im Kanton Waadt sind häufig; die gemeindescharfe Zuordnung sollte über die NPA/Gemeinde-Suchmaske auf vd.ch laufend verifiziert werden, da sich Gemeindebestände ändern, die Bezirkseinteilung aber stabil bleibt.
  - Die vd.ch-Übersichtsseite zeigt keine Adressen direkt; Adressen stammen von den einzelnen Amts-Unterseiten (verifiziert für Lausanne und Nyon).

## VS — Bezirks-/Regionalämter (5 Ämter)

Das Kantonsgebiet ist gemäss Art. 1 EGSchKG (281.1) in fünf Betreibungskreise (und drei Konkurskreise) aufgeteilt; jeder Betreibungskreis verfügt über EIN staatliches (kantonales) Betreibungsamt. Es handelt sich also um Regional-/Bezirksämter, nicht um ein Einheitsamt und nicht um Gemeindeämter. Die fünf Kreise sind gesetzlich nach Bezirken definiert: (a) Oberwallis; (b) Bezirk Siders; (c) Bezirke Sitten, Ering und Gundis; (d) Bezirke Martinach und Entremont; (e) Bezirke St-Maurice und Monthey. Die Ämter sind im kantonalen Service des poursuites et des faillites (SPF) zusammengefasst, der für Koordination und einheitliche Verfahren sorgt. Der Staatsrat bestimmt den Sitz jedes Amtes. Sitze (gemäss amtlichem SPF-Portal): Visp (Oberwallis), Sierre/Siders, Sion/Sitten, Martigny/Martinach, Monthey. Da die Kreise gesetzlich über die Bezirke (und damit deren Gemeinden) definiert sind, ist die Zuordnung Gemeinde -> Betreibungsamt grundsätzlich deterministisch über die Bezirkszugehörigkeit ableitbar; das SPF stellt zusätzlich eine Suchmaske ("Zuständiges Amt suchen") bereit.

- **Rechtsgrundlage:** Einführungsgesetz zum Bundesgesetz über Schuldbetreibung und Konkurs (EGSchKG) (281.1 (SGS Kanton Wallis)), Systematische Gesetzessammlung des Kantons Wallis (SGS), 281.1; Art. 1 (1 Organisation / 1.1 Allgemeines, Art. 1 Grundsätze).
  Stand: vom 20.06.1996, Stand 01.05.2020 (geltende konsolidierte Fassung; nicht aufgehoben). https://lex.vs.ch/app/de/texts_of_law/281.1 (am Wortlaut geprüft).
  Kern: Art. 1 Abs. 1: 'Das Kantonsgebiet wird in fünf Betreibungskreise und drei Konkurskreise aufgeteilt. Jeder Betreibungskreis wird mit einem staatlichen Betreibungsamt und jeder Konkurskreis mit einem staatlichen Konkursamt ausgestattet.' Abs. 1bis legt die fünf Betreibungskreise nach Bezirken fest (Oberwallis; Bezirk Siders; Bezirke Sitten/Ering/Gundis; Bezirke Martinach/Entremont; Bezirke St-Maurice/Monthey). Abs. 3: 'Der Staatsrat bestimmt den Sitz jedes Amtes.'
- **Rechtsgrundlage:** Ausführungsverordnung zur Gesetzgebung über Schuldbetreibung und Konkurs (281.100 (SGS Kanton Wallis)), Systematische Gesetzessammlung des Kantons Wallis (SGS), 281.100.
  Stand: geltende Fassung (Ausführungsverordnung zum EGSchKG); Wortlaut nicht im Detail abgerufen. https://lex.vs.ch/app/de/texts_of_law/281.100 (**Wortlaut NICHT an der amtlichen Quelle prüfbar**).
  Kern: Ausführungsbestimmungen zum EGSchKG; konkretisiert Organisation/Betrieb der Betreibungs- und Konkursämter. Wortlaut nicht verifiziert.
- **Amtliches Verzeichnis** (suchmaske, gemeindescharf ableitbar: ja): https://www.vs.ch/de/web/spf/office-competent
  Amtliches Portal des Service des poursuites et des faillites (SPF) des Kantons Wallis. Die Seite 'Zuständiges Amt suchen / Recherche de l'office compétent' bietet eine karten-/adressbasierte Suchmaske, über die zu Adresse/Ort das zuständige Betreibungs- und Konkursamt ermittelt wird. Verzeichnet sind die fünf Betreibungsämter (Oberwallis/Visp, Bezirk Siders/Sierre, Bezirke Sitten-Ering-Gundis/Sion, Bezirke Martinach-Entremont/Martigny, Bezirke Monthey-St-Maurice/Monthey) sowie drei Konkursämter (Oberwallis/Visp, Zentral-/Mittelwallis/Sion, Unter-/Bas-Valais/Monthey), je mit eigener Detailseite und Postadresse. Die Zuordnung Gemeinde->Amt ist gemeindescharf ableitbar, da die Kreise gesetzlich über die Bezirke definiert sind und die Suchmaske eine ortsscharfe Abfrage erlaubt.
- **Beispielämter (adressgeprüft):**
  - Office des poursuites du district de Sierre / Betreibungsamt Bezirk Siders — Avenue du Rothorn 2, Case postale 312, 3960 Sierre/Siders (https://www.vs.ch/de/web/spf/siders)
  - Office des poursuites des districts de Sion, Hérens et Conthey / Betreibungsamt der Bezirke Sitten, Ering und Gundis — Route de la Piscine 10, Case postale 634, 1951 Sion/Sitten (https://www.vs.ch/de/web/spf/office-competent)
- **Adversariale Prüfung:** System ja · Rechtsgrundlage ja · Verzeichnis ja · Adresse ja.
  **Korrekturen/Präzisierungen des Prüf-Agents:** Geringfuegige Adress-Ungenauigkeit beim zweiten Beispiel (nicht ausschlaggebend): Die amtliche Adresse des Betreibungsamts Sitten/Ering/Gundis lautet vollstaendig 'Route de la Piscine 10, Bâtiment C, Trame 3, Case postale 634, 1951 Sion'; die Behauptung liess 'Bâtiment C, Trame 3' weg. Kern (Strasse, Nummer, Postfach 634, PLZ 1951 Sion) ist korrekt. Hinweis: Die Behauptung gab die Quell-URL des Sion-Beispiels als die allgemeine office-competent-Seite an (die Adresse ist dort tatsaechlich verifizierbar) und merkte zutreffend an, dass die einzelnen Amts-Detailseiten (z.B. .../spf/siders) per direkter Abfrage HTTP 404 liefern - dies bestaetigt sich, ist aber unschaedlich, da die Adressen ueber office-competent amtlich belegt sind.
- **Risiken/Pflege:**
  - Die einzelnen Amts-Detailseiten auf vs.ch (z.B. .../spf/siders, .../spf/sierre) sind JS-/Portal-gerendert und liessen sich per WebFetch nicht direkt als Text abrufen (HTTP 404). Die Existenz dieser amtlichen Seiten und die Office-Liste sind über die amtliche Suchseite (office-competent) und Suchmaschinen-Indexierung der vs.ch-URLs belegt; die Postadressen wurden zusätzlich über tel.search.ch corroboriert, aber nicht jede Adresse konnte unmittelbar aus dem gerenderten amtlichen Seiteninhalt verifiziert werden.
  - Die Bezirksnamen im EGSchKG sind in der deutschen Fassung historisch/eigen benannt (Ering = Hérens, Gundis = Conthey, Martinach = Martigny). Bei der konkreten Gemeindezuordnung müssen aktuelle Bezirkszugehörigkeiten (inkl. Gemeindefusionen, z.B. im Bezirk Goms/Oberwallis) beachtet werden; die SPF-Suchmaske ist hierfür die massgebliche, aktuellste Quelle.
  - Wortlaut der Ausführungsverordnung 281.100 wurde nicht im Detail abgerufen (amWortlautGeprueft=false). Massgeblich für die Kreisaufteilung ist ohnehin Art. 1 EGSchKG (verifiziert).
  - Konkurskreise (3) sind anders aufgeteilt als Betreibungskreise (5); für die Betreibungs-Zuordnung sind ausschliesslich die fünf Betreibungskreise relevant.

## NE — Einheitsamt (1 Amt)

Der Kanton Neuenburg bildet einen EINZIGEN kantonalen Betreibungskreis ("un arrondissement de poursuite pour dettes"). Diesem ist EIN kantonales Betreibungsamt (office des poursuites) unter Leitung eines Betreibungsbeamten (préposé aux poursuites) zugeordnet (Art. 1 Abs. 1-2 LILP, RSN 261.1). Parallel besteht ein einziges Konkursamt (office des faillites) für einen einzigen Konkurskreis. Der Sitz der Ämter wird vom Regierungsrat (Conseil d'État) bestimmt (Art. 1 Abs. 4 LILP); Sitz des Betreibungsamts ist Neuchâtel (Rue de Tivoli 28). Nach Art. 1a LILP kann das Amt zur Erfüllung ortsnaher Aufgaben "antennes régionales" (regionale Aussenstellen) sowie ein oder mehrere Kompetenzzentren umfassen; deren Aufgaben und Funktionsweise definiert der Service des poursuites et faillites. Es handelt sich somit um ein EINHEITSAMT (ein kantonales Amt für das gesamte Kantonsgebiet, ggf. mit unselbständigen regionalen Antennen). Die Gemeinde-Amt-Zuordnung ist damit trivial: jede politische Gemeinde des Kantons Neuenburg fällt unter das eine kantonale Betreibungsamt.

- **Rechtsgrundlage:** Loi d'introduction de la loi fédérale sur la poursuite pour dettes et la faillite (LILP) (RSN 261.1), Recueil systématique de la législation neuchâteloise (RSN) 261.1, du 12 novembre 1996.
  Stand: In Kraft; mehrfach revidiert, letzte Änderung u.a. durch Gesetz vom 18. März 2025 (Inkrafttreten u.a. per 1. Januar 2026); Erlass nicht aufgehoben. https://rsn.ne.ch/DATA/program/books/rsne/htm/261.1.htm (am Wortlaut geprüft).
  Kern: Art. 1 Abs. 1: «Le Canton de Neuchâtel forme un arrondissement de poursuite pour dettes et un arrondissement d'administration des faillites.» Abs. 2: «L'arrondissement de poursuite pour dettes est pourvu d'un office des poursuites dirigé par le préposé aux poursuites.» Abs. 4: «Le siège de chacun des offices est désigné par le Conseil d'État.» Art. 1a sieht zudem «antennes régionales» und Kompetenzzentren vor.
- **Amtliches Verzeichnis** (htmlListe, gemeindescharf ableitbar: ja): https://www.ne.ch/autorites/DESC/SEPF/Organisation/Pages/ofpo.aspx
  Offizielle Seite des Service des poursuites et faillites (SEPF) des Kantons Neuenburg mit Beschreibung von Organisation und Adresse des kantonalen Betreibungsamts (Rue de Tivoli 28, 2002 Neuchâtel 2). Da der Kanton nur EINEN Betreibungskreis und EIN kantonales Betreibungsamt kennt, ist die Zuordnung Gemeinde->Amt trivial gemeindescharf: alle Gemeinden des Kantons fallen unter dieses eine Amt. Die offizielle Seite listet keine separaten Antennen-Adressen auf; die Funktionsweise der Antennen wird intern vom SEPF geregelt.
- **Beispielämter (adressgeprüft):**
  - Office des poursuites du canton de Neuchâtel (kantonales Betreibungsamt) — Rue de Tivoli 28, Case postale 1, 2002 Neuchâtel 2 (https://www.ne.ch/autorites/DESC/SEPF/Organisation/Pages/ofpo.aspx)
  - Office des faillites du canton de Neuchâtel (kantonales Konkursamt, gleiche Trägerschaft/Adresse) — Rue de Tivoli 28, Case postale 1, 2002 Neuchâtel 2 (https://www.ne.ch/autorites/DESC/SEPF/Organisation/Pages/ofpo.aspx)
- **Adversariale Prüfung:** System ja · Rechtsgrundlage ja · Verzeichnis ja · Adresse ja.
- **Risiken/Pflege:**
  - Einheitsamt: Der Kanton kennt nur EIN kantonales Betreibungsamt (Art. 1 LILP). Ein zweites eigenständiges Betreibungsamt existiert nicht; als zweites Beispiel wurde das ebenfalls kantonale Konkursamt (office des faillites) an gleicher Adresse angegeben.
  - Antennen: Art. 1a LILP erlaubt regionale Antennen (z.B. La Chaux-de-Fonds, historisch Avenue Léopold-Robert 63). Eine vollständige, amtlich publizierte Adressliste der Antennen war auf den geprüften offiziellen ne.ch-Seiten nicht auffindbar; die in Verzeichnissen (local.ch/search.ch) kursierende Antennen-Adresse La Chaux-de-Fonds konnte NICHT amtlich auf ne.ch verifiziert werden und wurde daher nicht als Beispiel verwendet.
  - Gemeindefusionen im Kanton NE (z.B. Val-de-Travers, Val-de-Ruz, La Grande Béroche) berühren die Zuständigkeit NICHT, da ohnehin ein einziges kantonales Amt für alle Gemeinden zuständig ist.
  - Aktualität: LILP wurde per 1.1.2025 (Verfahren gegen im HR eingetragene Schuldner -> ausschliesslich Konkursweg) und durch Gesetz vom 18.3.2025 weiter angepasst; Organisationsprinzip (ein Kreis/ein Amt) blieb unverändert.

## GE — Einheitsamt (1 Amt)

Der Kanton Genf bildet einen einzigen Betreibungs- und Konkurskreis. Gemäss Art. 1 Abs. 1 LaLP (rsGE E 3 60) bildet das gesamte Kantonsgebiet "un seul arrondissement de poursuite pour dettes et d'administration des faillites" und ist mit einem kantonalen Betreibungsamt (Office cantonal des poursuites, OCP) sowie einem kantonalen Konkursamt (Office cantonal des faillites, OCF) ausgestattet. Es gibt somit ein einziges Betreibungsamt (Einheitsamt), das für alle politischen Gemeinden des Kantons zuständig ist. Damit ist die Zuordnung Gemeinde -> Betreibungsamt trivial: jede Genfer Gemeinde wird vom OCP an der Rue du Stand 46, 1204 Genève bedient. Organisation und Verwaltung der kantonalen Ämter unterstehen dem Staatsrat (Art. 1 Abs. 2 LaLP); Aufsichtsbehörde ist die Surveillance-Kammer des Cour de justice.

- **Rechtsgrundlage:** Loi d'application de la loi fédérale sur la poursuite pour dettes et la faillite (LaLP) (rsGE E 3 60), Recueil systématique genevois (silgeneve.ch / SILGE), Art. 1.
  Stand: In Kraft seit 1.1.2011; konsolidierte Fassung mit Änderungen Stand 29.8.2023; nicht aufgehoben. https://silgeneve.ch/legis/data/rsg_e3_60.htm (am Wortlaut geprüft).
  Kern: Art. 1 Abs. 1: «Le territoire du canton forme un seul arrondissement de poursuite pour dettes et d'administration des faillites. Celui-ci est doté d'un office cantonal des poursuites et d'un office cantonal des faillites.» Abs. 2: Organisation und Verwaltung der kantonalen Ämter unterstehen dem Staatsrat.
- **Amtliches Verzeichnis** (htmlListe, gemeindescharf ableitbar: ja): https://www.ge.ch/organisation/ocp-direction-office-cantonal-poursuites
  Amtliche Organisationsseite des Kantons Genf (ge.ch) zur Direction de l'Office cantonal des poursuites mit vollständiger Post- und Besucheradresse. Da es im Kanton Genf nur ein einziges Betreibungsamt (Einheitsamt) gibt, ist die Zuordnung jeder politischen Gemeinde zu diesem Amt deterministisch und gemeindescharf ableitbar: alle Genfer Gemeinden -> OCP, Rue du Stand 46, 1204 Genève. Ergänzend führt die Übersicht ge.ch/poursuites zum selben Amt.
- **Beispielämter (adressgeprüft):**
  - Office cantonal des poursuites (OCP) — Rue du Stand 46, 1204 Genève (Case postale 208, 1211 Genève 8) (https://www.ge.ch/organisation/ocp-direction-office-cantonal-poursuites)
  - Office cantonal des faillites (OCF) — Office cantonal des faillites, Case postale, 1211 Genève 6 (Direction; ressort konkursrechtliche Verfahren des Kantons Genf) (https://www.ge.ch/organisation/office-cantonal-faillites)
- **Adversariale Prüfung:** System ja · Rechtsgrundlage ja · Verzeichnis ja · Adresse ja.
- **Risiken/Pflege:**
  - Im Kanton Genf gibt es nur EIN Betreibungsamt (Einheitsamt); es existiert daher keine gemeindeweise Liste mehrerer Ämter. Als zweites Beispiel wurde das kantonale Konkursamt (OCF) aufgeführt, da es kein zweites Betreibungsamt gibt. Betreibungssachen werden ausschliesslich vom OCP behandelt.
  - Die ge.ch-Seiten nennen keine separaten Zweigstellen/Antennen; alle Schalterdienste laufen über den Standort Rue du Stand 46, 1204 Genève. Sollte der Kanton künftig Aussenstellen einrichten, wäre dies zu aktualisieren.
  - Postadressen (Cases postales) und Besucheradresse unterscheiden sich; für den Schriftverkehr ist die jeweilige Case postale massgebend (OCP: CP 208, 1211 Genève 8; OCF: 1211 Genève 6).

## JU — Einheitsamt (1 Amt)

Der Kanton Jura bildet seit dem 1. Juli 2025 EINEN einzigen Betreibungs- und Konkurskreis mit EINEM kantonalen Einheitsamt ("Office des poursuites et faillites", OPF) mit Sitz in Porrentruy. Davor (bis 30. Juni 2025) bestanden drei bezirksweise Ämter (Delémont, Porrentruy, Saignelégier/Franches-Montagnes); diese wurden durch die Loi du 29 juin 2022 portant réorganisation des offices des poursuites et faillites zu einem einzigen kantonalen Amt zusammengelegt (Inkrafttreten 1.7.2025). Gesetzliche Grundlage: Art. 3 LiLP — der ganze Kanton bildet einen einzigen Betreibungs-/Konkurskreis ("arrondissement"); Art. 4 LiLP — ein Office des poursuites et faillites, geleitet vom préposé; Art. 5 LiLP — Sitz in Porrentruy, wöchentliche Permanenzen (mind. 1 Tag/Woche) in jedem Bezirkshauptort. Folge: Da der ganze Kanton EIN Kreis ist, ist die Zuordnung jeder politischen Gemeinde zum zuständigen Amt trivial gemeindescharf bestimmt — alle Gemeinden des Kantons Jura sind dem einen kantonalen OPF in Porrentruy zugeordnet. In Delémont und Saignelégier werden weiterhin Permanenzen (nach Voranmeldung) geführt; die bisherigen Standorte Delémont (Rue de l'Avenir 2) und Saignelégier (Place du 23-Juin) schliessen per 15. Juni 2026.

- **Rechtsgrundlage:** Loi portant introduction de la loi fédérale sur la poursuite pour dettes et la faillite (LiLP) (RSJU 281.1), Recueil systématique jurassien (RSJU) 281.1, Loi du 11 décembre 1996, Section 2 'Organisation de l'Office des poursuites et faillites', Art. 3-5.
  Stand: Neue Fassung der Art. 1, 3, 4, 5, 7, 10, 13, 14, 16, 25 in Kraft seit 1. Juli 2025 (gemäss Ziff. III der Loi du 29 juin 2022 portant réorganisation des offices des poursuites et faillites); Erlass nicht aufgehoben, konsolidierte Fassung. https://rsju.jura.ch/fr/viewdocument.html?idn=20046&id=38954 (am Wortlaut geprüft).
  Kern: Art. 3: «Le canton du Jura forme un arrondissement de poursuite pour dettes et d'administration des faillites.» Art. 4 Abs. 1: «L'arrondissement est pourvu d'un Office des poursuites et faillites, qui est dirigé par le préposé...» Art. 5 Abs. 1-2: «L'Office des poursuites et faillites a son siège à Porrentruy. Des permanences sont assurées dans chaque chef-lieu de la République et Canton du Jura à raison d'un jour par semaine au minimum.»
- **Rechtsgrundlage:** Règlement concernant les cercles pour la nomination des agents de poursuites (RSJU 282.311), Recueil systématique jurassien (RSJU), Ziff. 282 'Organisation'.
  Stand: geltend (gemäss RSJU); betrifft die Nomination der agents de poursuites, nicht die Betreibungskreis-Einteilung des Einheitsamts. https://rsju.jura.ch/fr/viewdocument.html?idn=20047&id=37654 (**Wortlaut NICHT an der amtlichen Quelle prüfbar**).
- **Amtliches Verzeichnis** (htmlListe, gemeindescharf ableitbar: ja): https://www.jura.ch/fr/Autorites/Administration/DFI/Office-des-poursuites-et-faillites-OPF.html
  Offizielle Seite des Departements (DFI) der République et Canton du Jura zum Office des poursuites et faillites (OPF). Sie nennt den Hauptsitz in Porrentruy sowie die (per 15.6.2026 schliessenden) Standorte Delémont und Saignelégier mit Adressen und beschreibt das OPF ausdrücklich als 'office cantonal unique' (einziges kantonales Amt) seit 1.7.2025. Da der gesamte Kanton EIN Betreibungs-/Konkurskreis ist (Art. 3 LiLP), ist die Zuordnung Gemeinde→Amt eindeutig und gemeindescharf: alle politischen Gemeinden des Kantons Jura → OPF Porrentruy.
- **Beispielämter (adressgeprüft):**
  - Office des poursuites et faillites (OPF) - Siège cantonal, Porrentruy — Rue Auguste-Cuenin 15, 2900 Porrentruy (Tel. 032 420 32 10, secr.opf@jura.ch) (https://www.jura.ch/fr/Autorites/Administration/DFI/Office-des-poursuites-et-faillites-OPF.html)
  - Office des poursuites et faillites (OPF) - Permanence Delémont (Antenne, bis 15.6.2026; danach wöchentliche Permanenz nach Voranmeldung) — Rue de l'Avenir 2, 2800 Delémont (https://www.jura.ch/fr/Autorites/Administration/DFI/Office-des-poursuites-et-faillites-OPF.html)
- **Adversariale Prüfung:** System ja · Rechtsgrundlage ja · Verzeichnis ja · Adresse ja.
  **Korrekturen/Präzisierungen des Prüf-Agents:** Alle Kernbehauptungen bestaetigt. Praezisierungen: (1) Aktualisierung zum Risiko 'Moutier-Standort noch nicht festgelegt' - die offizielle OPF-Seite/Medien nennen nun eine geplante woechentliche Permanenz auch in Moutier (zusaetzlich zu Delemont und Saignelegier), nachdem Moutier per 1.1.2026 zum Kanton Jura kommt; das System (1 kantonales Einheitsamt) bleibt unveraendert. (2) Hinweis zur Quelle: Die RSJU-Webseite zeigt in ihrer HTML-Versionsliste irrefuehrend '01.01.2023 au 30.06.2025' als aktuelle Fassung an; das unter der angegebenen URL ausgelieferte amtliche PDF ist jedoch korrekt die konsolidierte Fassung 'Stand 01.07.2025' (Dateiname 281.1_01.07.2025.pdf) mit den reformierten Art. 3/4/5. Inhaltlich keine Korrektur noetig.
- **Risiken/Pflege:**
  - Übergangsphase: Das Einheitsamt besteht erst seit 1.7.2025. Ältere amtliche und nicht-amtliche Quellen nennen noch drei getrennte Bezirksämter (Delémont, Porrentruy, Saignelégier/Franches-Montagnes) - diese sind überholt.
  - Standortänderung im Gang: Die Antennen Delémont (Rue de l'Avenir 2) und Saignelégier (Place du 23-Juin) schliessen laut OPF-Seite per 15. Juni 2026; danach nur noch wöchentliche Permanenzen nach Voranmeldung. Adressen der Permanenzen können sich ändern; das Beispiel Delémont ist als Antenne (nicht eigenständiges Amt) zu verstehen.
  - Der Standort einer allfälligen Permanenz in Moutier war gemäss Kanton noch nicht festgelegt (Moutier wechselt per 1.1.2026 vom Kanton Bern zum Kanton Jura) - mögliche künftige Anpassung der Standorte/Zuständigkeit.
  - Règlement RSJU 282.311 ('cercles pour la nomination des agents de poursuites') wurde nicht im Wortlaut geprüft; Titel deutet auf personelle Nomination, nicht auf eine Betreibungskreis-Einteilung hin (Kreis = ganzer Kanton).
  - Wortlaut der LiLP wurde aus dem amtlichen RSJU-PDF (281.1) extrahiert; die konsolidierte Fassung trägt keine separate 'Etat au'-Datierung, die Inkraftsetzung der Reorganisations-Artikel per 1.7.2025 ist über die Fussnoten 20/21/23 belegt.

## Synthese der Systeme (Bau-Sicht)

- **Einheitsamt (10):** BS, BL, SH, AI, NE, GE, JU, GL, OW, NW — ein
  kantonales Amt (z. T. mit Zweigstellen-Geschichte: AI hat Oberegg per
  1.6.2024 integriert, SH ist seit 1.1.2025 Einheitsamt, OW seit 1.1.2000;
  OW-Zweigstelle Engelberg ist geschlossen). Zuordnung trivial: Kanton → Amt.
- **Bezirks-/Regionalämter (10):** ZH (55 Kreise), BE (4 Regionen/8
  Dienststellen seit 1.1.2026), FR (7 = Verwaltungsbezirke), SO (5 =
  Amtschreibereikreise, amtliche Gemeinde-Zuordnungsliste!), AR (3), GR (11 =
  Regionen), TG (5 = Bezirke), TI (8 circondari), VD (10), VS (5) — Zuordnung
  Gemeinde → Kreis je Kanton deterministisch; wo Kreise = BFS-Bezirke/Regionen
  (FR, TG, GR), ist die Zuordnung direkt aus dem amtlichen Gemeinderegister
  (BFS) ableitbar.
- **Gemeindeämter (2):** ZG (8 = je Einwohnergemeinde… 11 Gemeinden, 8 Ämter
  durch Zusammenschlüsse — kantonale PDF-Liste), SG (jede politische Gemeinde
  = Betreibungskreis, Art. 1 sGS 971.1 verbatim; KEIN zentrales
  Adressverzeichnis — Adressen dezentral auf Gemeindeseiten).
- **Gemischt (4):** LU (Gemeindekreise mit laufenden Fusionen, amtliche
  Liste gerichte.lu.ch), UR (2 Kreise), SZ (11 Ämter, Bezirks-/Gemeindemix;
  Liste auf ba-sz.ch = Verbandsseite → als PRAXIS-Schicht markieren), AG
  (grundsätzlich je Einwohnergemeinde, real ~19 Regional-/Gemeindeämter;
  Verzeichnis = Verbands-Suchmaske, beim Prüflauf nicht erreichbar).

## Bau-Empfehlung (Etappierung, Entscheid David offen)

**Architektur** (Muster Schlichtungsstellen, §4/§5): neue Datenschicht
`src/data/betreibungsaemter.ts` (Plan) — je Kanton `modus`
('einheitsamt' | 'kreise'), Ämter mit Adresse + `stand` + Quell-URL,
Zuordnung Gemeinde(BFS-Nr) → Amt wo erfasst, sonst ehrlicher Fallback auf
das kantonale Verzeichnis (Muster SO/VS/TI/AR bei der Schlichtung). Anschluss
im SchKG-Rechner: ersetzt den Pauschal-Link `BETREIBUNGSAEMTER_VERZEICHNIS`
(`src/lib/schkgZustaendigkeit.ts:359`) durch konkrete Amts-Auflösung am
Betreibungsort; die PLZ→Gemeinde-Schicht (`src/data/schlichtung/*`,
swisstopo/BFS) wird WIEDERVERWENDET, nicht dupliziert (§5).

1. **Etappe 1 — Einheitsamt-Kantone (10):** je eine Amtsadresse, sofort
   kantonsweit «gemeindescharf». Geringster Aufwand, grösste ehrliche Abdeckung.
2. **Etappe 2 — Kreis-Kantone mit amtlicher Zuordnungsliste:** SO (eigene
   amtliche Gemeinde-Zuordnungsseite), FR/TG/GR (Kreise = BFS-Bezirke bzw.
   -Regionen), AR (3 Ämter mit Gemeindelisten), VD/VS/TI (amtliche
   Bezirkslisten), BE (4 Regionen — Zuordnung über die 8 Dienststellen-
   Gebiete erfassen). ZH über die PDF-Ämterliste des Betreibungsinspektorats
   (gemeindescharf), ABER Reorganisation im Gange (s. Pflege) — bauen mit
   Verfalls-Vermerk oder zurückstellen.
3. **Etappe 3 — Gemeinde-/Mischkantone:** ZG (PDF-Liste, 8 Ämter), UR (2),
   LU (amtliche Liste, Fusionen beobachten), SZ/AG (Verbandslisten als
   Praxis-Schicht offenlegen oder Amtsadressen einzeln amtlich verifizieren),
   SG (Zuordnung trivial Gemeinde=Kreis, aber ~75 Adressen dezentral —
   Vollerfassung eigener Arbeitsgang).

**Abgrenzung:** KONKURSÄMTER sind ein anderes Netz (oft zentralisiert: SO,
FR, AG ein Konkurskreis trotz vieler Betreibungskreise) — nicht in dieser
Recherche erfasst; bei Bedarf eigener Arbeitsgang.

## Pflege (Einträge im Verfallsregister, S6)

- **ZH-Reorganisation:** RR-Beschluss/Vernehmlassung 5.11.2025 — Reduktion
  von 56 auf 34 oder 18 Kreise; noch NICHT in Kraft. Halbjährlich prüfen.
- **ZH EG SchKG:** zitierte Konsolidierung Version 129 (1.7.2025); zh.ch
  führt inzwischen Version 132 als aktuell (§§ 1–3 unverändert,
  prüfer-verifiziert). Beim Bau neueste Version pinnen.
- **ZG-Ämterliste:** kantonales PDF trägt Stand Februar 2023 — vor Bau
  aktualität prüfen.
- **AG-Verzeichnis-URL:** betreibungsamt-ag.ch beim Prüflauf 7.6.2026
  nicht erreichbar (ECONNREFUSED) — vor Bau erneut prüfen.
- **LU:** laufende Ämterfusionen (zuletzt 2024) — jährlich prüfen.
- **BE:** 4 Regionen erst seit 1.1.2026 (Aufhebung Art. 1 lit. b EG SchKG,
  Beschluss 3.9.2024) — Altlisten mit >4 Ämtern sind überholt.

## Abnahme-Status

ZWEIFACH GEPRÜFT (52 Agents, 7.6.2026): je Kanton ein Recherche- und ein
unabhängiger adversarialer Prüf-Agent (Prüfpunkte: System am Wortlaut,
Rechtsgrundlage geltend/nicht aufgehoben, Verzeichnis existiert + Einschätzung
gemeindescharf, eine Beispieladresse zeichengenau). Bekannte Lücken ehrlich
markiert: Wortlaut an JS-Portalen (LexWork) nicht direkt abrufbar bei OW und
FR (inhaltlich über amtliche Behördenseiten bestätigt), NW/AI über amtliche
Kantonsseiten-Zitate bzw. Versionsvergleich. TG: Erst-Zitate stammten aus
einer Altfassung — vom Prüf-Agent am amtsidentischen PDF korrigiert (geltende
Fassung: § 57 Abs. 1 ZSRG «Jeder Bezirk hat ein Betreibungsamt», Anhang
aufgehoben per 1.6.2016). Fachliche Abnahme durch David: AUSSTEHEND.

## GEBAUT 7.6.2026 — Etappen 1+2 (Commits `aeb8fed` + `eb307a9`)

**Datenschicht** `src/data/betreibungsaemter.ts` (Ehrlichkeits-Modell §8:
einheitsamt/kreise/verzeichnis) + Resolver `src/data/betreibung/
amtAufloesung.ts` mit Gemeinde-Karten `src/data/betreibung/aemterKantone.json`;
UI: SchKG-Zuständigkeitsrechner Sektion «3b · Betreibungsort lokalisieren»
(PLZ→Kanton+Gemeinde via amtliches Ortschaftenverzeichnis) + Anzeige
«Betreibungsamt am Betreibungsort».

- **Etappe 1:** 10 Einheitsamt-Kantone mit dossier-verifizierter Adresse.
- **Etappe 2:** 117 Kreis-Ämter (ZH 55 · BE 8 · FR 7 · SO 5 · AR 3 · GR 11 ·
  TG 5 · TI 8 · VD 10 · VS 5) per Workflow-Extraktion von den amtlichen
  Verzeichnissen (20 Agents; adversariale Stichproben: **49/49 Adressen
  zeichengenau**, alle Ämterzahlen amtlich bestätigt, Gemeinde-Stichproben
  6/6 Kantone ok). Prüf-Korrekturen eingearbeitet: BE Burgdorf «Dunantstrasse
  7C»; ZH = LIVE-Struktur mit 55 Ämtern (die PDF-Ämterliste führt noch 57 —
  Elgg ist in den Seuzach-Kreis, Wald-Fischenthal in den Rüti-Kreis
  integriert; Live-Detailseiten massgeblich).
- **Gemeinde-Karten (8 Kantone, 981 aktuelle Gemeinden)** gegen das
  swisstopo-Ortschaftenverzeichnis normalisiert: 32 Suffix-/Schreibvarianten
  auf amtliche Form («Wald (ZH)», «Roggwil (TG)», «Corminboeuf»,
  14× «… (VD)»), 14 aufgelöste Gemeinden entfernt (ZH 12, SO Brunnenthal/
  Küttigkofen), Fusions-Nachfolger per Vorgänger-Konsens abgeleitet
  (ZH Stammheim; TI Verzasca/Tresa/Riviera/Monteceneri/Collina d'Oro/
  Val Mara/Lema); manuell ergänzt: VD Crans (VD) [amtliche Umbenennung von
  Crans-près-Céligny 2021, gleicher Kreis Nyon], TI Locarno → Ufficio Locarno
  und Brusino Arsizio → Ufficio Mendrisio [definitorische Distriktzugehörig-
  keit; TI ist ohnehin seit 2015 EIN kantonsweiter Kreis, Zuteilung
  administrativ]. NICHT kartiert (gemeindefreie Gebiete): FR Staatswald Galm,
  TI Comunanza Cadenazzo/Monteceneri.
- **ZH-Städte:** Zürich (12) und Winterthur (3) lösen auf ihre
  Stadtkreis-Ämter als LISTE auf (massgeblich ist der Kreis der Adresse —
  kein Raten, §2).
- **BE/VS ehrlich ohne Gemeinde-Karte** (amtlich keine gemeindescharfe
  Zuordnung publiziert) → Dienststellen-/Ämterliste mit Gebiets-Beschrieb.
  VS-Amtsname Sion als Haus-Fassung «Betreibungsamt der Bezirke Sitten,
  Ering und Gundis» (amtliche Seite schreibt «Betreibungamt des
  Bezirkes …» [sic] — Tippfehler der Quelle, Inhalt identisch).
- **Tests:** 24 Akzeptanztests inkl. Integritäts-Invariante «jeder
  Karten-Schlüssel ist eine AKTUELLE Gemeinde im swisstopo-Register» und
  Goldwerten aus den adversarial bestätigten Stichproben.
- **Offen (Etappe 3):** LU/UR/SZ/ZG/AG/SG nur Verzeichnis-Link; BE-Folge
  «Avenir Berne romande» (Moutier-Wechsel 1.1.2026 → Umzüge Berner Jura/Biel
  innert ~3 J.) im Verfallsregister.

## GEBAUT 7.6.2026 — Etappe 3 (ZG/UR/SZ gemeindescharf; LU/AG/SG bleiben Verzeichnis)

Workflow-Extraktion (12 Agents, je Kanton adversarial). Ergebnis:

- **ZG → kreise (7 Ämter, 11/11 Gemeinden):** kommunale Betreibungsämter,
  amtliches zg.ch-Adressverzeichnis (Stand 2/2023, Einzelangaben 2026 an
  Gemeindeseiten gegengeprüft; 7/7 Adressen bestätigt). Zusammenlegungen in
  die Karte eingearbeitet: **Steinhausen → Betreibungsamt Zug (seit 1.4.2017),
  Walchwil → Zug (seit 1.1.2023)**; **Menzingen/Neuheim = EIN gemeinsam
  geführtes Amt** (das PDF führt 2 Zeilen mit identischer Adresse → auf einen
  Eintrag «Betreibungsamt Menzingen / Neuheim» zusammengeführt, daher 7 statt
  «8»).
- **UR → kreise (2 Ämter, 19/19 Gemeinden):** 2 Betreibungskreise, Adressen
  + Gemeinde-Zuordnung amtlich bestätigt (3/3 Stichproben).
- **SZ → kreise (11 Ämter, 30/30 Gemeinden):** Bezirks-/Gemeindemix
  (§ 1 EGzSchKG SZ). Verzeichnis ist VERBANDSGEFÜHRT (ba-sz.ch) — im
  `quelle`-Feld offengelegt; Adressen an Gemeinde-/Bezirksquellen
  gegengeprüft (5/5). Schreibvariante «Wangen» → «Wangen (SZ)» (swisstopo).
- **LU → bleibt verzeichnis (§8):** amtliche gerichte.lu.ch führt KEINE
  eigene Adressliste, delegiert auf die regionale Verbands-Plattform
  betreibungsaemter-zentralschweiz.ch; ~34 Amtsstellen, Liste durch
  Mehrkreis-Ämter aufgebläht, laufende Fusionen (Honau→Root 1.1.2025),
  keine belastbare amtliche gemeindescharfe Gesamtliste (gemOk=false).
- **AG → bleibt verzeichnis (§8):** nur ~14 von rund 19 aktiven Kreisen mit
  amtlicher Adresse belegbar (Verbands-Verzeichnis betreibungsamt-ag.ch bei
  jedem Abruf ECONNREFUSED); Teilliste (86/196 Gemeinden) wäre als
  «gemeindescharf» irreführend → Verzeichnis-Link aufs ag.ch-Inspektorat.
- **SG → bleibt verzeichnis (§8):** Negativbefund an sg.ch/regress.admin.ch
  bestätigt — KEINE amtliche kantonale Sammelliste; jede der ~75 Gemeinden
  ist ein Kreis, Adressen dezentral. EasyGov-Fallback.

**Stand nach Etappe 3:** 13 Kantone gemeindescharf (ZH/FR/SO/AR/GR/TG/TI/VD +
ZG/UR/SZ), 10 Einheitsämter direkt, BE/VS als Dienststellen-Liste, LU/AG/SG +
Rest als Verzeichnis-Link. Aufgelöste Karten-Kantone (`BETREIBUNGSAMT_KANTONE`):
ZH, FR, SO, AR, GR, TG, TI, VD, ZG, UR, SZ. Tests: 26 Akzeptanztests.
