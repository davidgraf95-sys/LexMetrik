# Schlichtungsstellen — amtliche Detail-URLs (Erstrecherche 6.6.2026)

Beleg-Liste zur `url?`-Anreicherung der Schlichtungsstellen-Schicht
(`src/data/schlichtungsstellen.ts`, BS zusätzlich `src/lib/vorlagen/behoerden.ts`).

**Verfahren (§7/§8, Daueranweisung David):** Nur amtliche Domains (kantonale
Gerichts-/Justizportale, staatskalender.*, Gemeinde-Seiten für kommunale
Stellen). Jede URL per WebFetch aufgerufen und verifiziert: HTTP 200 + Seite
nennt die Stelle erkennbar (Name/Adresse). Keine Vermutungspfade, keine
Drittportale.

**Statistik (Stellen mit eigener `url`, modus zentral/liste):**
vorher 6/85 · nachher 48/85. Restliche Stellen ohne eigene `url` sind durch
Kantons-Fallback-`url` (NE, SO-Miete, JU-Miete) oder durch `verzeichnis`-URLs
abgedeckt; verbleibende Lücken (BL, SH, AI, GR-Einzelämter) unten dokumentiert.

| Kt | vorher | nachher | Bemerkung |
|----|--------|---------|-----------|
| ZH | 2/13   | 2/13    | bestehend (Vollerfassung); nicht Teil des Auftrags |
| BE | 0/4    | 4/4     | alle 4 Regionen verlinkt |
| LU | 0/5    | 5/5     | 4 FRA (staatskalender) + Miete (gerichte.lu.ch) |
| UR | 0/2    | 2/2     | eine Stelle, beide Felder |
| OW | 0/2    | 2/2     | eine Stelle |
| NW | 0/2    | 2/2     | eine Stelle |
| GL | 0/2    | 2/2     | eine Stelle |
| ZG | 0/1    | 1/1     | Miete |
| SO | 0/4    | 0/4 + Kanton-url | Mietschlichtung-Sammelseite als Fallback |
| BS | 0/3    | 3/3     | staatskalender.bs.ch-Detailseiten |
| AR | 0/3    | 3/3     | 2 Vermittlerämter (staatskalender) + Miete |
| TI | 3/10   | 9/10    | 6 Comune-Seiten ergänzt (Mendrisio bestand) |
| VD | 0/9    | 9/9     | alle Justices de paix (vd.ch/ojv) |
| GE | 0/2    | 2/2     | TPI + CCBL (justice.ge.ch FR) |
| NE | 0/3    | 0/3 + Kanton-url | PJNE-Übersicht als Fallback |
| JU | 0/4    | 1/4 + Kanton-url | TPI verlinkt; Bail-Sammelseite als Fallback |

---

## Verlinkte Stellen (Stelle → URL → Abrufdatum → wie gefunden)

Abrufdatum durchgehend **6.6.2026**, Methode **WebSearch (amtl. Domain) →
WebFetch-Verifikation (HTTP 200 + Name/Adresse auf der Seite)**.

### BE — zsg.justice.be.ch (4/4)
- Schlichtungsbehörde Bern-Mittelland (Effingerstrasse 34, 3008 Bern)
  → https://www.zsg.justice.be.ch/de/start/ueber-uns/schlichtungsbehoerden/bern-mittelland.html
- Schlichtungsbehörde Berner Jura-Seeland (Neuengasse 8, 2502 Biel)
  → https://www.zsg.justice.be.ch/de/start/ueber-uns/schlichtungsbehoerden/berner-jura-seeland.html
- Schlichtungsbehörde Emmental-Oberaargau (Dunantstrasse 3, 3400 Burgdorf)
  → https://www.zsg.justice.be.ch/de/start/ueber-uns/schlichtungsbehoerden/emmental-oberaargau.html
- Schlichtungsbehörde Oberland (Scheibenstrasse 11B, 3600 Thun)
  → https://www.zsg.justice.be.ch/de/start/ueber-uns/schlichtungsbehoerden/oberland.html

### LU — staatskalender.lu.ch + gerichte.lu.ch (5/5)
- Friedensrichteramt Luzern (Grabenstrasse 2, 6004 Luzern)
  → https://staatskalender.lu.ch/organization/gerichte/schlichtungsbehoerden/friedensrichteraemter/luzern
- Friedensrichteramt Kriens (Villastrasse 1, 6010 Kriens)
  → https://staatskalender.lu.ch/organization/gerichte/schlichtungsbehoerden/friedensrichteraemter/kriens
- Friedensrichteramt Hochdorf (Hohenrainstrasse 8, 6280 Hochdorf)
  → https://staatskalender.lu.ch/organization/gerichte/schlichtungsbehoerden/friedensrichteraemter/hochdorf
- Friedensrichteramt Willisau (Menzbergstrasse 16, 6130 Willisau)
  → https://staatskalender.lu.ch/organization/gerichte/schlichtungsbehoerden/friedensrichteraemter/willisau
- Schlichtungsbehörde Miete und Pacht (Bahnhofstrasse 22, 6002 Luzern)
  → https://gerichte.lu.ch/organisation/schlichtungsbehoerden/miete_pacht
  (Seite nennt die Behörde erkennbar; Adresse auf der Kontakt-Unterseite/Staatskalender)

### BS — staatskalender.bs.ch (3/3; auch in behoerden.ts)
- Schlichtungsbehörde des Zivilgerichts / Kanzlei (Bäumleingasse 5, 4001 Basel)
  → https://staatskalender.bs.ch/organization/richterliche-behoerden/gerichte/zivilgericht/kanzlei-schlichtungsbehoerde
- Staatliche Schlichtungsstelle für Mietstreitigkeiten (Grenzacherstrasse 62, 4005 Basel)
  → https://staatskalender.bs.ch/organization/regierung-und-verwaltung/praesidialdepartement/staatskanzlei/mietstreitigkeiten-staatliche-schlichtungsstelle-fuer
- Kantonale Schlichtungsstelle für Diskriminierungsfragen (Grenzacherstrasse 62, 4005 Basel)
  → https://staatskalender.bs.ch/organization/regierung-und-verwaltung/praesidialdepartement/staatskanzlei/schlichtungsstelle-fuer-diskriminierungsfragen-kantonale

### UR / OW / NW / GL — je eine kantonale Stelle (beide Felder verlinkt)
- Schlichtungsbehörde Uri (Bahnhofstrasse 43, 6460 Altdorf)
  → https://www.ur.ch/aemter/1586
- Schlichtungsbehörde Obwalden (Enetriederstrasse 1, 6060 Sarnen)
  → https://www.ow.ch/fachbereiche/2131
- Schlichtungsbehörde in Zivilsachen Nidwalden (Rathausplatz 9, 6371 Stans)
  → https://www.nw.ch/judikative/326
- Kantonale Schlichtungsbehörde Glarus (Gerichtshausstrasse 22, 8750 Glarus)
  → https://www.gl.ch/rechtspflege/kantonale-schlichtungsbehoerde.html/316

### ZG — Miete (1/1)
- Schlichtungsbehörde Miet- und Pachtrecht (Baarerstrasse 131, 6300 Zug)
  → https://zg.ch/de/recht-justiz/zivilverfahren/schlichtung/mietschlichtungsverfahren

### AR — staatskalender.ar.ch + ar.ch (3/3)
- Vermittleramt Kreis 1 (Obstmarkt 3, 9100 Herisau)
  → https://staatskalender.ar.ch/organization/kantonale-behoerden/gerichtsbehoerden/schlichtungsbehoerden/vermittleramt-kreis-1-appenzeller-hinterland
- Vermittleramt Kreise 2 und 3 (Sitz Trogen, Landsgemeindeplatz 2) → staatskalender-Seite Kreis 2 (Mittelland), Adresse identisch (Rathaus, Landsgemeindeplatz 2, 9043 Trogen)
  → https://staatskalender.ar.ch/organization/kantonale-behoerden/gerichtsbehoerden/schlichtungsbehoerden/vermittleramt-kreis-2-appenzeller-mitteland
- Schlichtungsstelle für Miete und nichtlandw. Pacht (Landsgemeindeplatz 7c, 9043 Trogen)
  → https://ar.ch/gerichte/vermittler-und-schlichtungsstellen/schlichtungsstelle-fuer-miete-und-nichtlandwirtschaftliche-pacht/

### TI — Comune-Seiten (Miete, 9/10)
- Ufficio di conciliazione Agno (Stelle bestätigt; Comune-Seite zeigt Adresse «Contrada Nuova 3, 6982 Agno» — Abweichung zur Daten-Adresse «Piazza Colonnello Vicari 1», siehe Vorbehalt unten)
  → https://www.agno.ch/index.php?node=395&lng=1&vis=1&rif=2392173537
- Ufficio di conciliazione Massagno (Via Motta 53, 6900/6908 Massagno)
  → https://www.massagno.ch/Ufficio-conciliazione-in-materia-di-locazione
- Ufficio di conciliazione Minusio (Via San Gottardo 60, 6648 Minusio)
  → https://www.minusio.ch/uc
- Ufficio di conciliazione Bellinzona / Giubiasco / Biasca (eine Comune-Seite
  Bellinzona führt die Uffici Nr. 9 Bellinzona, Nr. 10 Giubiasco, Nr. 11 Biasca
  je mit Adresse) → für alle drei Stellen verlinkt
  → https://www.bellinzona.ch/Ufficio-di-conciliazione-c0723c00
  (bestehend: Mendrisio, Lugano, Locarno; siehe ti-vs-gr-Vollerfassung)

### VD — vd.ch/ojv (Justices de paix, 9/9)
- Lausanne → https://www.vd.ch/ojv/justices-de-paix/lausanne
- Ouest lausannois → https://www.vd.ch/ojv/justices-de-paix/ouest-lausannois
- Morges → https://www.vd.ch/ojv/justices-de-paix/morges
- Nyon → https://www.vd.ch/ojv/justices-de-paix/nyon
- Aigle → https://www.vd.ch/ojv/justices-de-paix/aigle
- Riviera-Pays-d'Enhaut → https://www.vd.ch/ojv/justices-de-paix/riviera-pays-denhaut
- Lavaux-Oron → https://www.vd.ch/ojv/justices-de-paix/lavaux-oron
- Broye-Vully → https://www.vd.ch/ojv/justices-de-paix/broye-vully
- Jura-Nord vaudois/Gros-de-Vaud → https://www.vd.ch/ojv/justices-de-paix/jura-nord-vaudois-et-gros-de-vaud
(alle Adressen mit Daten identisch verifiziert)

### GE — justice.ge.ch (FR-Pfad /fr/contenu/, 2/2)
- Tribunal de première instance (conciliation) (Rue de l'Athénée 6-8, 1205 Genève)
  → https://justice.ge.ch/fr/contenu/tribunal-de-premiere-instance
- Commission de conciliation en matière de baux et loyers (Rue de l'Athénée 6-8, 1205 Genève)
  → https://justice.ge.ch/fr/contenu/commission-de-conciliation-en-matiere-de-baux-et-loyers
  (Hinweis: /fr/content/ liefert 404; kanonischer FR-Pfad ist /fr/contenu/)

### JU — jura.ch (TPI 1/1)
- Juge civil, Tribunal de première instance (Chemin du Château 9, 2900 Porrentruy)
  → https://www.jura.ch/fr/Autorites/JUST/Instances-judiciaires/Tribunal-de-premiere-instance/Tribunal-de-premiere-instance.html

---

## Kantons-Fallback-`url` (Sammelseite statt Stellen-URLs)

- **SO (Miete):** Sammelseite listet alle vier Oberämter (Region Solothurn,
  Region Olten, Thal-Gäu, Dorneck-Thierstein) mit Adressen; keine Detailseite je
  Oberamt → Kanton-`url`
  → https://so.ch/verwaltung/departement-des-innern/oberaemter/schlichtung-und-vermittlung/mietschlichtung/
- **NE:** PJNE-Übersicht der Tribunaux régionaux nennt alle drei Standorte
  (Neuchâtel, Boudry, La Chaux-de-Fonds) mit Adressen → Kanton-`url`
  → https://www.ne.ch/autorites/PJNE/tribunaux-regionaux/Pages/accueil.aspx
- **JU (Miete):** jura.ch-Sammelseite «Droit du travail et du bail» nennt alle
  drei Commissions de conciliation en matière de bail (Delémont, Porrentruy,
  Franches-Montagnes) mit Adressen → Kanton-`url`
  → https://www.jura.ch/JUST/Renseignements-juridiques/Droit-du-travail-et-du-bail/Droit-du-travail-et-du-bail.html

---

## Keine Detailseite auffindbar / nicht WebFetch-verifizierbar

- **BL (Miete):** Detailseite existiert
  (baselland.ch/.../schlichtungsstellen/mietangelegenheiten), aber baselland.ch
  liefert WebFetch durchgehend **HTTP 403 (Bot-Sperre)** — Verifikation HTTP 200
  nicht möglich → nicht übernommen (Regel 1). Bestehende `verzeichnis`-url der
  Friedensrichter (ordentlich) bleibt; Miete bleibt ohne `url`.
- **SH:** Stellenseiten existieren auf sh.ch (Friedensrichteramt; Schlichtungs-
  stelle für Mietsachen), aber das CMS liefert per WebFetch nur das Backend-
  Menü ohne Inhalt/Adresse → Name/Adresse nicht verifizierbar; zudem besteht
  bereits ein Adress-Vorbehalt (Vordergasse vs. Fronwagplatz) → nicht übernommen.
- **AI (Miete):** ai.ch liefert WebFetch **HTTP 403** (Portal-Sperre, wie im
  bestehenden Dossier vermerkt) → nicht übernommen. ordentlich bleibt
  `verzeichnis`.
- **GR (Vermittlerämter/Mietsachen):** keine Detailseite je Vermittleramt unter
  dem Vermittlerämter-Pfad; die Einzelämter sind nur auf der bereits gesetzten
  kantonalen Vermittlerämter-Übersicht (Kanton-`url`) gelistet. Region-Detail-
  seiten existieren nur für die Regionalgerichte, nicht für die Vermittlerämter
  als Schlichtungsstelle → keine Stellen-URLs ergänzt.

## Offene Vorbehalte für David

- **TI Agno:** verlinkte amtliche Comune-Seite nennt die Stelle, weist aber
  «Contrada Nuova 3, 6982 Agno» aus statt der in den Daten geführten
  «Piazza Colonnello Vicari 1». Die `url` wurde gesetzt (Stelle eindeutig),
  die Adresse in den Daten NICHT verändert (ausserhalb dieses Auftrags) —
  Adressabgleich Agno bei Gelegenheit prüfen.
- PLZ-Kleinabweichungen ohne Adressänderung belassen: Bellinzona 6501 (Daten)
  vs. teils 6500; Massagno 6908 (Seite) vs. 6900 (Daten); LU Friedensrichteramt
  Luzern Staatskalender 6004 vs. Daten 6002 (Postfach). Nur `url` ergänzt.
