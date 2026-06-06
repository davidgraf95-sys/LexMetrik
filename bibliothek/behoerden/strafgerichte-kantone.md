# Strafgerichte aller 26 Kantone — erste Instanz + Berufungsinstanz (+ ZMG-Bonus)

**Erstellt:** 6.6.2026 (Recherche-Agent, Auftrag David) · **Abrufdatum aller
neu recherchierten Quellen: 6.6.2026.**
**Status: ERSTRECHERCHE — NICHT fachlich abgenommen** (CLAUDE.md §7/§8;
Projektstandard: Erstrecherche → späterer Doppelcheck). Kein `verified: true`.
**Fachliche Abnahme David ausstehend; «verified» erst nach Doppelcheck.**

## Zweck und Abgrenzung

Erfasst je Kanton (Art. 13–14, 19–21 StPO):
1. **Erstinstanzliches Strafgericht** (Art. 19 StPO) — wer in 1. Instanz Recht
   spricht: Einzelgericht/Kollegialgericht.
2. **Berufungsinstanz** (Art. 21 StPO) — Berufungsgericht = Straf-/
   Appellations-/Strafkammer des Ober-/Kantons-/Appellationsgerichts.
3. **[Bonus] Zwangsmassnahmengericht (ZMG)** (Art. 18 StPO) — soweit bei der
   Recherche greifbar; gebraucht für den Haftfristen-Rechner
   (`bibliothek/recherche/strafrecht-cluster.md`, Rechner 4).

**Methodischer Kernbefund (Struktur):** In der Mehrzahl der Kantone ist die
erste Strafinstanz **organisatorisch dasselbe Gericht wie die Zivil-1.-Instanz**
(Bezirks-/Regional-/Kreisgericht bzw. dessen Strafabteilung). Dann wird die
**bereits im Repo verifizierte Adresse übernommen** — Quelle:
`gerichtsbehoerden-kantone.md` + `gog-gerichtsorganisation-kantone.md` (beide
ZWEIFACH GEPRÜFT) + `gerichtsadressen-erstliste.md`. **Eigenständige
Strafgerichte** (eigene Adresse, getrennt von der Zivil-1.-Instanz) gibt es in:
**BS** (Strafgericht, Schützenmattstr.), **ZG** (Strafgericht), **LU**
(Kriminalgericht — eigene Adresse!), **SZ** (Straf-/Jugend-/ZMG kantonal),
**BE** (Wirtschaftsstrafgericht kantonal, sonst Regionalgerichte). Diese sind
unten mit konkreter, am 6.6.2026 web-amtlich bestätigter Adresse geführt.

**Namenslogik-Falle (aus den Repo-Dossiers übernommen):** «Kantonsgericht» ist
in GL/SH/AR/OW/NW die **erste** Instanz (obere = Obergericht), in
SG/AI/VS/FR/BL/LU/SZ die **obere** Instanz. Berufungsinstanz-Adressen decken
sich überwiegend mit `src/data/obereInstanzen.ts` (Zivil) — hier mit der
**Straf-/Berufungskammer-Bezeichnung** ergänzt; Abweichungen ausgewiesen.

**Diskrepanz-Hinweis vorab (wichtig):** `obereInstanzen.ts` ist die
**Zivil**-Rechtsmittelinstanz. Für Straf ist sie in fast allen Kantonen
dasselbe Haus/dieselbe Behörde (andere Kammer). **Einzige strukturelle
Abweichung: BS** — Zivil-Berufung = Appellationsgericht (Bäumleingasse 1),
aber die **erste Strafinstanz** (Strafgericht) sitzt separat an der
Schützenmattstrasse 20. Die Strafberufung läuft ebenfalls ans
Appellationsgericht (Bäumleingasse 1).

---

## Deutschschweiz

### ZH — Zürich

- **1. Instanz:** Die **12 Bezirksgerichte** sind zugleich erstinstanzliche
  Strafgerichte (§ 22 ff. GOG LS 211.1; Einzelgericht/Kollegialgericht je nach
  Straferwartung). Beispiel-Hauptort **Bezirksgericht Zürich, Strafabteilung:
  Badenerstrasse 90 / Wengistrasse 28, 8004 Zürich** (Strafsachenkanzlei
  Badenerstrasse 90, Postfach 8036 Zürich). System der 12 BG-Adressen: siehe
  `gerichtsbehoerden-kantone.md` / `gerichtsadressen-erstliste.md`.
  Quelle 6.6.2026: gerichte-zh.ch (BG Zürich, Strafsachenkanzlei).
- **Berufungsinstanz:** **Obergericht des Kantons Zürich, I./II. Strafkammer**,
  Hirschengraben 13/15, 8001 Zürich (§ 48 f. GOG). Adresse = obereInstanzen.ts ✓.
- **ZMG:** An jedem der 12 Bezirksgerichte ein ZMG (§ 29 GOG). Zentral
  organisiert; **ZMG am Bezirksgericht Zürich: Güterstrasse 33, Postfach,
  8010 Zürich** (gleiche Liegenschaft wie die Oberstaatsanwaltschaft).
  Quelle 6.6.2026: gerichte-zh.ch (ZMG), search.ch.

### BE — Bern

- **1. Instanz (Regelfall):** **4 Regionalgerichte** (Art. 80 f. GSOG BSG
  161.1), Strafabteilung. Hauptort **Regionalgericht Bern-Mittelland,
  Strafabteilung: Amthaus, Hodlerstrasse 7, 3011 Bern** (web-amtlich
  bestätigt 6.6.2026, zsg.justice.be.ch / search.ch). Übrige Sitze
  (Berner Jura-Seeland = Biel, Emmental-Oberaargau = Burgdorf, Oberland =
  Thun): siehe `gerichtsbehoerden`/Repo.
- **1. Instanz (Sonderzuständigkeit):** **Wirtschaftsstrafgericht** (kantonal,
  Art. 63–66 GSOG) für Wirtschaftsstraffälle. Sitz Bern. *(Genaue Hausnummer
  nicht separat web-belegt — Repo-Querverweis; offen, mutmasslich Amthaus
  Hodlerstrasse 7.)*
- **Berufungsinstanz:** **Obergericht des Kantons Bern, 2. Strafkammer /
  Strafabteilung**, Hochschulstrasse 17, 3012 Bern (Art. 35 GSOG, Strafabt.).
  Adresse = obereInstanzen.ts ✓.
- **ZMG:** **Kantonales Zwangsmassnahmengericht, Amthaus, Hodlerstrasse 7,
  3011 Bern** + 3 regionale ZMG (Biel, Burgdorf, Thun). Web-amtlich bestätigt
  6.6.2026 (zsg.justice.be.ch). Art. 59–62 GSOG.

### LU — Luzern ⚠ eigenständiges Strafgericht mit EIGENER Adresse

- **1. Instanz:** **Kriminalgericht** (schwere Straffälle, § 33 JusG SRL 260)
  + die **4 Bezirksgerichte** (Luzern/Kriens, Hochdorf, Willisau, Sursee) für
  übrige Strafsachen.
  **Kriminalgericht Luzern: Landenbergstrasse 36, Postfach 3439, 6002 Luzern**
  (Verhandlungssaal Alpenquai 10, 6005 Luzern). ⚠ **NICHT** am Kantonsgericht
  (Hirschengraben 16) und **NICHT** an der im Repo für die Zivil-Bezirksgerichte
  geführten Adresse — eigenes Haus. Web-amtlich bestätigt 6.6.2026
  (gerichte.lu.ch/.../kriminalgericht/kontakt, staatskalender.lu.ch).
- **Berufungsinstanz:** **Kantonsgericht Luzern, 2. Abteilung (Strafrecht)**,
  Hirschengraben 16, Postfach 3569, 6002 Luzern (§ 14a JusG). Adresse =
  obereInstanzen.ts ✓ (Postadresse PF 3569/6002).
- **ZMG:** dem **Kantonsgericht** angegliedert (Hirschengraben 16, 6002 Luzern).
  *(Repo-Querverweis strafbehoerden/gog; eigene ZMG-Hausnummer nicht separat
  belegt — Kantonsgerichts-Adresse.)*

### UR — Uri (zentralisiert)

- **1. Instanz:** **Landgericht Uri** (Kollegialgericht) bzw.
  **Landgerichtspräsidium** (Einzelgericht), Rathausplatz 2, Postfach,
  6460 Altdorf (Art. 20/25 GOG RB 2.3221). Adresse = Repo
  `gerichtsbehoerden` ✓.
- **Berufungsinstanz:** **Obergericht Uri**, Rathausplatz 2, 6460 Altdorf
  (Art. 31 ff. GOG). Adresse = obereInstanzen.ts ✓.
- **ZMG:** **Landgerichtspräsidium als ZMG** (Art. 19e GOG), Rathausplatz 2,
  6460 Altdorf.

### SZ — Schwyz ⚠ eigenständiges kantonales Straf-/Jugend-/ZMG

- **1. Instanz (Regelfall):** **6 Bezirksgerichte** (Schwyz, Gersau, March,
  Einsiedeln, Küssnacht, Höfe) für Strafsachen (§ 32 JG SRSZ 231.110).
  Adressen = Repo `gerichtsbehoerden` ✓.
- **1. Instanz (schwere Fälle):** **Kantonales Straf-, Jugend- und
  Zwangsmassnahmengericht: Kollegiumstrasse 28, Postfach 2267, 6431 Schwyz**
  (§ 18/20 JG). Web-amtlich bestätigt 6.6.2026 (sz.ch …/straf-jugend-und-
  zwangsmassnahmengericht; search.ch Kollegiumstrasse 28).
- **Berufungsinstanz:** **Kantonsgericht Schwyz, Strafkammer**,
  Kollegiumstrasse 28, Postfach 2265, 6431 Schwyz (§ 12 JG). Adresse =
  obereInstanzen.ts ✓ (gleiche Liegenschaft, andere Postfachnummer 2265).
- **ZMG:** **im Straf-/Jugend-/ZMG vereint**, Kollegiumstrasse 28, PF 2267,
  6431 Schwyz (§ 24 JG). ✓ (kombinierte Behörde — eine Adresse).

### OW — Obwalden (zentralisiert; «Kantonsgericht» = ERSTE Instanz)

- **1. Instanz:** **Kantonsgericht OW** (Kollegial- + Präsidium als
  Einzelgericht), Poststrasse 6, Postfach, 6060 Sarnen (Art. 3/35 GOG GDB
  134.1; Strafkompetenz via StPO). Adresse = Repo `gerichtsbehoerden` ✓.
- **Berufungsinstanz:** **Obergericht Obwalden** (Strafsachen), Poststrasse 6,
  6061 Sarnen (Art. 1/37 GOG). Adresse = obereInstanzen.ts ✓ (6061 = PF-PLZ).
- **ZMG:** **Kantonsgericht OW als ZMG** (Art. 48 GOG), Poststrasse 6,
  6060/6061 Sarnen.

### NW — Nidwalden (zentralisiert; «Kantonsgericht» = ERSTE Instanz)

- **1. Instanz:** **Kantonsgericht NW** (Einzel-/Kollegialgericht), Rathausplatz
  1, Postfach 1244, 6371 Stans (Art. 6/17 GerG NG 261.1; Strafkompetenz).
  Adresse = Repo `gerichtsbehoerden` ✓.
- **Berufungsinstanz:** **Obergericht Nidwalden** (Strafsachen Art. 29 GerG),
  Bahnhofplatz 3, Postfach 1241, 6371 Stans. Adresse = obereInstanzen.ts ✓.
- **ZMG:** **Kantonsgericht NW als Einzelgericht/ZMG** (Art. 14 GerG),
  Rathausplatz 1, 6371 Stans.

### GL — Glarus (zentralisiert; «Kantonsgericht» = ERSTE Instanz)

- **1. Instanz:** **Kantonsgericht Glarus** (erstinstanzlich Straf, Art. 12 f.
  GOG GS III A/2), Gerichtshaus, Spielhof 6, 8750 Glarus. Adresse = Repo
  `gerichtsbehoerden` ✓.
- **Berufungsinstanz:** **Obergericht des Kantons Glarus** (Rechtsmittelinstanz
  Straf, Art. 17 GOG), Spielhof 6, 8750 Glarus. Adresse = obereInstanzen.ts ✓.
- **ZMG:** dem Kantonsgericht zugeordnet, Spielhof 6, 8750 Glarus *(genaue
  ZMG-Bezeichnung nicht separat belegt — Repo-Querverweis).*

### ZG — Zug ⚠ eigenständiges Strafgericht + eigenständiges ZMG

- **1. Instanz:** **Strafgericht des Kantons Zug** (Kollegialgericht zu dritt,
  «unteres Gericht in Strafsachen», § 30–32 GOG BGS 161.1),
  **Gerichtsgebäude an der Aa, Aabachstrasse 3, 6301 Zug**. Web-amtlich
  bestätigt 6.6.2026 (zg.ch/gerichte/.../strafgericht; staka.zug.ch). Adresse =
  Repo `gerichtsbehoerden` ✓ (gleicher Komplex wie Kantonsgericht ZG Zivil).
- **Berufungsinstanz:** **Obergericht des Kantons Zug, Strafabteilung** (§ 20
  GOG), Kirchenstrasse 6, Postfach, 6301 Zug. Adresse = obereInstanzen.ts ✓.
- **ZMG:** seit Revision 1.1.2025 **eigenständiges Zwangsmassnahmengericht**
  (§ 35a/35b GOG), Aabachstrasse 3, 6301 Zug *(gleicher Gerichtskomplex;
  eigene Hausnummer nicht abweichend publiziert — an der Aa).*

### FR — Freiburg (zweisprachig)

- **1. Instanz (Regelfall):** Die **7 Bezirksgerichte** (Saane, Sense, Greyerz,
  See, Glane, Broye, Vivisbach) sind als **Strafgericht** erstinstanzlich
  zuständig (Tribunal pénal d'arrondissement; Art. 32 ff. JG/LJ SGF 130.1).
  Adressen = Repo `gerichtsbehoerden` ✓.
- **1. Instanz (Sonderzuständigkeit):** **Wirtschaftsstrafgericht / Tribunal
  pénal économique**, Route d'Englisberg 13, 1763 Granges-Paccot (administrativ
  am TA Sarine; Repo-Befund ✓2; ⚠ PROVISORISCH — Umzug ab April 2026, ~2 Jahre,
  Verfallsregister).
- **Berufungsinstanz:** **Kantonsgericht Freiburg / Tribunal cantonal,
  Strafhof / Cour pénale** (Art. 52 LJ), Rue des Augustins 3, CP 630,
  1701 Freiburg. Adresse = obereInstanzen.ts ✓.
- **ZMG:** **Zwangsmassnahmengericht / Tribunal des mesures de contrainte**
  (kantonal, Sitz Fribourg). *(Genaue Hausnummer nicht web-belegt — offen;
  Repo-Querverweis.)*

### SO — Solothurn (5 Richterämter / Amtsgerichte)

- **1. Instanz:** Die **5 Richterämter** (Amtsgerichte) sind als
  **Strafgericht** (§ 15 GO BGS 125.12, Dreierbesetzung) bzw. **Amtsgerichts-
  präsident als Strafrichter** (§ 12) erstinstanzlich. Hauptort
  **Richteramt Solothurn-Lebern, Amthaus 2, Westbahnhofstrasse 16,
  4502 Solothurn**. Übrige (Bucheggberg-Wasseramt, Olten-Gösgen, Thal-Gäu,
  Dorneck-Thierstein): Adressen = Repo `gerichtsbehoerden` ✓.
- **Berufungsinstanz:** **Obergericht des Kantons Solothurn, Strafkammer**
  (§ 24 GO), Amthaus 1, Bielstrasse 1, 4502 Solothurn. Adresse =
  obereInstanzen.ts ✓.
- **ZMG:** Zwangsmassnahmengericht (Haftgericht), Solothurn. *(Genaue
  Hausnummer nicht separat belegt — offen; mutmasslich Amthaus, Repo-
  Querverweis.)*

### BS — Basel-Stadt ⚠ eigenständiges Strafgericht (EIGENE Adresse)

- **1. Instanz:** **Strafgericht Basel-Stadt** (§ 75/77 GOG SG 154.100),
  **Schützenmattstrasse 20, Postfach, 4009 Basel** (Besucheradresse 4051
  Basel). Web-amtlich bestätigt 6.6.2026 (strafgericht.bs.ch;
  staatskalender.bs.ch «Straf- und Zwangsmassnahmengericht»; search.ch
  Schützenmattstrasse 20). ⚠ **Abweichung zu obereInstanzen.ts:** dort steht
  für BS nur das Appellationsgericht (Bäumleingasse 1) — das ist die
  **Berufungs-/Zivilinstanz**, NICHT die erste Strafinstanz. Erste Strafinstanz
  = Schützenmattstrasse 20.
- **Berufungsinstanz:** **Appellationsgericht Basel-Stadt** (Strafrechtliche
  Abteilung, § 88 GOG), Bäumleingasse 1, 4051 Basel. Adresse =
  obereInstanzen.ts ✓.
- **ZMG:** **dem Strafgericht zugeordnet** (§ 78 GOG) — amtlich «Straf- und
  Zwangsmassnahmengericht», **Schützenmattstrasse 20, 4051 Basel** ✓
  (gemeinsame Kanzlei, web-amtlich bestätigt 6.6.2026 staatskalender.bs.ch).

### BL — Basel-Landschaft

- **1. Instanz:** **Strafgericht Basel-Landschaft** (kantonal, § 20 GOG SGS
  170, Fünfer-/Dreierkammern). Sitz im **Strafjustizzentrum Muttenz**
  (gleicher Standort wie die StA BL). ⚠ **Genaue Strasse/Hausnummer des
  Strafjustizzentrums Muttenz im Portal beschrieben, aber nicht zeichengenau
  extrahierbar — offen** (vgl. Repo `strafbehoerden-kantone.md`: dort StA BL
  «Grenzacherstrasse 8, 4132 Muttenz»; Gericht im selben Komplex — vor
  Übernahme amtlich nachschärfen).
- **Berufungsinstanz:** **Kantonsgericht Basel-Landschaft, Abteilung
  Strafrecht** (§ 8 ff. GOG), Bahnhofplatz 16, 4410 Liestal. Adresse =
  obereInstanzen.ts ✓.
- **ZMG:** **Präsidien des Strafgerichts üben die ZMG-Funktion aus** (§ 21
  GOG) — Strafjustizzentrum Muttenz (Adresse wie 1. Instanz, offen).

### SH — Schaffhausen («Kantonsgericht» = ERSTE Instanz)

- **1. Instanz:** **Kantonsgericht Schaffhausen** (erstinstanzlich Strafsachen,
  Art. 33 JG SHR 173.200), Herrenacker 26, 8200 Schaffhausen. Adresse = Repo
  `gerichtsbehoerden` ✓ (Snippet-verifiziert; sh.ch JS-Wall).
- **Berufungsinstanz:** **Obergericht des Kantons Schaffhausen**
  (Rechtsmittelinstanz Straf, Art. 43 JG), Frauengasse 17, 8200 Schaffhausen.
  Adresse = obereInstanzen.ts ✓.
- **ZMG:** **Kantonsgericht SH als Zwangsmassnahmengericht** (Art. 35 JG),
  Herrenacker 26, 8200 Schaffhausen.

### AR — Appenzell Ausserrhoden («Kantonsgericht» = ERSTE Instanz)

- **1. Instanz:** **Kantonsgericht AR** («erstinstanzliches Gericht in
  Strafsachen», Art. 15 JG bGS 145.31), Landsgemeindeplatz 2, Postfach,
  9043 Trogen. Adresse = Repo `gerichtsbehoerden` ✓.
- **Berufungsinstanz:** **Obergericht Appenzell Ausserrhoden** (Berufungs-/
  Beschwerdeinstanz Straf, Art. 26 JG), Fünfeckpalast, Postfach, 9043 Trogen.
  ⚠ **Hausnummer amtlich NICHT publiziert — offen** (= obereInstanzen.ts;
  «Landsgemeindeplatz 7» nur Drittquelle, nicht übernehmen).
- **ZMG:** *(nicht separat belegt — am Kantonsgericht/Einzelrichter; Repo-
  Querverweis, offen.)*

### AI — Appenzell Innerrhoden (1. Instanz = «Bezirksgericht»)

- **1. Instanz:** **Bezirksgericht Appenzell I.Rh.** (erstinstanzlich Zivil/
  Straf, Art. 7 f. GOG GS 173.000), Unteres Ziel 20, 9050 Appenzell. Adresse =
  Repo `gerichtsbehoerden` ✓ (= dasselbe Gebäude wie Zielstrasse 38, eine
  Kanzlei).
- **Berufungsinstanz:** **Kantonsgericht AI, Abteilung Zivil- und Strafgericht**
  (obere Instanz, Art. 10 f. GOG), Zielstrasse 38, 9050 Appenzell. Adresse =
  obereInstanzen.ts ✓.
- **ZMG:** **Zwangsmassnahmerichter am Bezirksgericht** (Art. 14 GOG),
  Unteres Ziel 20, 9050 Appenzell.

### SG — St. Gallen (7 Kreisgerichte)

- **1. Instanz:** Die **7 Kreisgerichte** sind erstinstanzliche Strafgerichte
  (Art. 5 f. GerG sGS 941.1; Einzelrichter/Kollegial). Hauptort **Kreisgericht
  St. Gallen, Bohl 1 (Haus Hecht) / Neugasse 3, 9004 St. Gallen**. Übrige
  (Rorschach, Rheintal/Altstätten, Werdenberg-Sarganserland/Mels, See-Gaster/
  Uznach, Toggenburg/Lichtensteig, Wil/Flawil): Adressen = Repo
  `gerichtsbehoerden` ✓.
- **Berufungsinstanz:** **Kantonsgericht St. Gallen, Strafkammer** (Art. 12
  GerG) + **Anklagekammer** (Art. 15 GerG), Klosterhof 1, 9001 St. Gallen.
  Adresse = obereInstanzen.ts ✓.
- **ZMG:** Zwangsmassnahmengericht (am Kantonsgericht/Untersuchungsbereich).
  *(Genaue Zuordnung/Hausnummer nicht separat belegt — offen; Repo-
  Querverweis.)*

### GR — Graubünden ⚠ Justizreform 1.1.2025 (Obergericht)

- **1. Instanz:** Die **11 Regionalgerichte** (Strafkammer, Art. 69 GOG BR
  173.000). Hauptort **Regionalgericht Plessur, Poststrasse 14, Postfach 262,
  7001 Chur**. Übrige 10 RG (Albula/Tiefencastel, Bernina/Poschiavo, Engiadina
  Bassa/Sent, Imboden/Domat-Ems, Landquart, Maloja/St. Moritz, Moesa/Roveredo,
  Prättigau-Davos/Klosters, Surselva/Ilanz, Viamala/Thusis): Adressen = Repo
  `gerichtsbehoerden` ✓.
- **Berufungsinstanz:** **Obergericht des Kantons Graubünden, Strafabteilung**
  (seit 1.1.2025; Art. 37 GOG), Grabenstrasse 30, 7001 Chur. Adresse =
  obereInstanzen.ts ✓.
- **ZMG:** **Kantonales Zwangsmassnahmengericht** (Art. 59–61 GOG),
  **Theaterweg 1, Postfach 36, 7001 Chur**. Adresse = Repo
  `gerichtsbehoerden` ✓.

### AG — Aargau (11 Bezirksgerichte)

- **1. Instanz:** Die **Bezirksgerichte** mit gegliederter **Strafgericht**-
  Abteilung (§ 50/52 GOG SAR 155.200). Hauptort **Bezirksgericht Aarau,
  Kasinostrasse 5, Postfach, 5001 Aarau**. Web-amtlich bestätigt 6.6.2026
  (ag.ch/.../bezirksgerichte/aarau; search.ch Kasinostrasse 5). Übrige BG-
  Adressen: siehe Repo `gerichtsadressen-erstliste.md` (dort grossflächig
  korrigiert).
- **Berufungsinstanz:** **Obergericht des Kantons Aargau, Strafgericht
  (Abteilung)** (§ 65 f. GOG), Obere Vorstadt 38/40, 5000 Aarau. Adresse =
  obereInstanzen.ts ✓ (Nr. 38; Nr. 40 = Handelsgericht).
- **ZMG:** **aus Bezirksgerichtspräsidien (Einzelrichter)** gebildet (§ 60
  GOG) — am jeweiligen Bezirksgericht.

### TG — Thurgau (5 Bezirksgerichte)

- **1. Instanz:** Die **5 Bezirksgerichte** (Arbon, Frauenfeld, Kreuzlingen,
  Münchwilen, Weinfelden) als erstinstanzliche Strafgerichte (§ 14/21 ZSRG
  RB 271.1). Adressen = Repo `gerichtsbehoerden` ✓.
- **Berufungsinstanz:** **Obergericht des Kantons Thurgau** (Berufungs-/
  Beschwerdeinstanz Straf, § 26 ZSRG), Promenadenstrasse 12A, 8500 Frauenfeld.
  Adresse = obereInstanzen.ts ✓.
- **ZMG:** **Zwangsmassnahmengericht** (§ 23 ZSRG). *(Genaue Hausnummer nicht
  separat belegt — offen; Repo-Querverweis.)*

---

## Romandie + Tessin

### TI — Ticino (10 Preture; eigenständiges kantonales Strafgericht)

- **1. Instanz:** **Tribunale penale cantonale** (schwere Strafsachen,
  assise criminali/correzionali; Art. 50 LOG RL 177.100) für schwere Fälle
  + **Pretura penale** (Strafbefehl/contravvenzioni, Einzelrichter, Sitz
  Bellinzona; Art. 39–41 LOG). Das Tribunale penale cantonale ist am
  **Tribunale d'appello, Via Pretorio 16, 6901 Lugano** angesiedelt. *(Eigene
  abweichende Hausnummer für das TPC nicht separat publiziert — offen;
  Pretura penale Bellinzona.)*
- **Berufungsinstanz:** **Corte di appello e di revisione penale (CARP)**, Teil
  des **Tribunale d'appello, Via Pretorio 16, 6901 Lugano** (Art. 42 LOG).
  Adresse = obereInstanzen.ts ✓.
- **ZMG:** **Ufficio del Giudice dei provvedimenti coercitivi (GPC)**,
  **Via Bossi 3, 6901 Lugano**. Web-amtlich bestätigt 6.6.2026 (www4.ti.ch
  …/ufficio-del-giudice-dei-provvedimenti-coercitivi).

### VD — Vaud (4 Tribunaux d'arrondissement)

- **1. Instanz:** Die **4 Tribunaux d'arrondissement** in Strafbesetzung
  (Tribunal correctionnel/criminel, Art. 96a LOJV RSV 173.01) + **Président =
  Tribunal de police** (Einzelrichter, Art. 96c). Hauptort **Tribunal
  d'arrondissement de Lausanne, Allée Ernest-Ansermet 2 (Montbenon),
  1014 Lausanne**. Übrige (Est vaudois/Vevey, La Côte/Nyon, Broye-Nord
  vaudois/Yverdon): Adressen = Repo `gerichtsbehoerden` ✓.
- **Berufungsinstanz:** **Tribunal cantonal, Cour d'appel pénale** (Art. 79
  LOJV) bzw. **Chambre des recours pénale** (Art. 80), Route du Signal 8
  (Hermitage), 1014 Lausanne. Adresse = obereInstanzen.ts ✓.
- **ZMG:** **Tribunal des mesures de contrainte** (kantonsweit, Art. 3 LOJV +
  loi spéciale), Lausanne. *(Genaue Hausnummer nicht separat belegt — offen.)*

### VS — Wallis ⚠ Straf-1.-Instanz ≠ Zivil-1.-Instanz

- **1. Instanz:** **3 Tribunaux d'arrondissement** (Strafgerichte,
  Dreierkollegium: Haut-Valais, Centre, Bas-Valais; Art. 11 LOJ RS 173.1) —
  gebildet aus dem juge de district des Tatorts + zwei weiteren. ⚠ Die
  Zivil-1.-Instanz sind die **9 Tribunaux de district** (Art. 10 LOJ); die
  Straf-1.-Instanz ist organisatorisch eine andere Besetzung. Sitze decken
  sich mit den Bezirksgerichts-Adressen (Repo `gerichtsbehoerden` ✓; Haupt-
  sitze Brig / Sion / Martigny-Monthey).
- **Berufungsinstanz:** **Kantonsgericht Wallis / Tribunal cantonal, Cour
  pénale** (Art. 14/19 LOJ), Rue Mathieu-Schiner 1, 1950 Sitten/Sion. Adresse =
  obereInstanzen.ts ✓ (web-amtlich bestätigt 6.6.2026 vs.ch contacts-et-accès).
- **ZMG:** **Tribunal des mesures de contrainte** (zentralisiert, Einzelrichter,
  Sitz Sion; Art. 12 LOJ). Sitz Sion (Rue Mathieu-Schiner 1, 1950 Sion —
  am Tribunal cantonal-Komplex). *(Eigene abweichende Hausnummer nicht separat
  publiziert — offen.)*

### NE — Neuchâtel (2 Tribunaux régionaux)

- **1. Instanz:** Die **2 Tribunaux régionaux** in Strafbesetzung — **Tribunal
  de police** (Einzelrichter, bis 2 J. FS; Art. 25–27 OJN RSN 161.1) und
  **Tribunal criminel** (3 Richter, > 2 J.; Art. 28–30 OJN). Sitze:
  Neuchâtel (Rue de l'Hôtel-de-Ville 2) / Boudry (Rue Louis-Favre 39) /
  La Chaux-de-Fonds (Av. Léopold-Robert 10 — ⚠ Umzug Sommer 2026 auf
  Léopold-Robert 63). Adressen = Repo `gerichtsbehoerden` ✓ (web-amtlich
  bestätigt 6.6.2026 ne.ch/PJNE).
- **Berufungsinstanz:** **Tribunal cantonal, Cour pénale** (Art. 46 OJN) bzw.
  **Autorité de recours pénal** (Art. 45), Rue du Pommier 1, Case postale 1,
  2002 Neuchâtel 2. Adresse = obereInstanzen.ts ✓ (Re-Audit 6.6.2026: CP 1/2002).
- **ZMG:** **Tribunal des mesures de contrainte** (Sektion des Tribunal
  régional, Art. 31–32 OJN). *(Genaue Hausnummer nicht separat belegt — offen;
  am jeweiligen Tribunal régional.)*

### GE — Genève (Strafgerichte nach Strafmass-Schwelle)

- **1. Instanz:** Drei nach Straferwartung gestufte Strafgerichte (alle am
  selben Komplex, Rue des Chaudronniers 9): **Tribunal de police** (Einzel-
  richter, Art. 95 f. LOJ E 2 05), **Tribunal correctionnel** (> 2 bis 10 J.,
  Art. 97 f.), **Tribunal criminel** (> 10 J., Art. 99 f.).
  **Adresse: Rue des Chaudronniers 9, Bât. H, 1204 Genève · CP 3715,
  1211 Genève 3** (Greffe für police/correctionnel/criminel). Web-amtlich
  bestätigt 6.6.2026 (justice.ge.ch/.../tribunal-correctionnel; search.ch).
  ⚠ **Abweichung zu gerichtsbehoerden:** dort ist das Tribunal de première
  instance (Zivil) am Bourg-de-Four 1 geführt — die **Strafgerichte** sitzen
  an der Rue des Chaudronniers 9 (gleicher Justizkomplex Altstadt, aber andere
  Hausadresse).
- **Berufungsinstanz:** **Cour de justice, Chambre pénale d'appel et de
  révision** (Art. 129 f. LOJ) bzw. **Chambre pénale de recours** (Art. 127 f.),
  Place du Bourg-de-Four 1, CP 3108, 1204 Genève. Adresse = obereInstanzen.ts ✓.
- **ZMG:** **Tribunal des mesures de contrainte** (Art. 94 LOJ), am
  Justizkomplex Rue des Chaudronniers 9, 1204 Genève. *(Eigene Hausnummer nicht
  separat publiziert — gleicher Strafgerichts-Komplex.)*

### JU — Jura (zentralisiert, Porrentruy)

- **1. Instanz:** **juge pénal / Tribunal pénal** (3 Richter; Art. 32 lit. e–f
  LOJ RSJU 181.1), als Sektion des **Tribunal de première instance,
  Chemin du Château 9, Case postale, 2900 Porrentruy**. Adresse = Repo
  `gerichtsbehoerden` ✓.
- **Berufungsinstanz:** **Tribunal cantonal, Cour pénale** (Art. 20 lit. c LOJ)
  bzw. **Chambre pénale des recours** (lit. d), Chemin du Château 9, CP 1693,
  2900 Porrentruy. Adresse = obereInstanzen.ts ✓.
- **ZMG:** **juge des mesures de contrainte** (Art. 32 lit. g LOJ),
  Chemin du Château 9, 2900 Porrentruy.

---

## Synthese-Tabelle (26 Kantone)

| Kt | 1. Instanz Straf (Behörde) | Adresse 1. Instanz (Hauptort/Sitz) | Berufungsinstanz | Adresse Berufung |
|---|---|---|---|---|
| ZH | 12 Bezirksgerichte (Strafabt.) | BG Zürich: Badenerstr. 90, 8004 Zürich | OGer ZH, Strafkammer | Hirschengraben 13/15, 8001 Zürich |
| BE | 4 Regionalgerichte + Wirtschaftsstrafgericht | RG Bern-Mittelland: Hodlerstr. 7, 3011 Bern | OGer BE, Strafabt. | Hochschulstr. 17, 3012 Bern |
| LU | Kriminalgericht + 4 Bezirksgerichte | **Kriminalgericht: Landenbergstr. 36, 6002 Luzern** | KGer LU, 2. Abt. | Hirschengraben 16, PF 3569, 6002 Luzern |
| UR | Landgericht | Rathausplatz 2, 6460 Altdorf | OGer Uri | Rathausplatz 2, 6460 Altdorf |
| SZ | 6 Bezirksgerichte + kant. Straf-/Jugend-/ZMG | Straf-G.: Kollegiumstr. 28, PF 2267, 6431 Schwyz | KGer SZ, Strafkammer | Kollegiumstr. 28, PF 2265, 6431 Schwyz |
| OW | Kantonsgericht | Poststrasse 6, 6060 Sarnen | OGer Obwalden | Poststrasse 6, 6061 Sarnen |
| NW | Kantonsgericht | Rathausplatz 1, PF 1244, 6371 Stans | OGer Nidwalden | Bahnhofplatz 3, PF 1241, 6371 Stans |
| GL | Kantonsgericht Glarus | Spielhof 6, 8750 Glarus | OGer Glarus | Spielhof 6, 8750 Glarus |
| ZG | **Strafgericht Zug** | Aabachstr. 3, 6301 Zug | OGer Zug, Strafabt. | Kirchenstr. 6, 6301 Zug |
| FR | 7 Bezirksgerichte + Wirtschaftsstrafgericht | BG / TPE: Route d'Englisberg 13, 1763 Granges-Paccot | KGer FR, Cour pénale | Rue des Augustins 3, CP 630, 1701 Fribourg |
| SO | 5 Richterämter (Strafgericht) | Solothurn-Lebern: Westbahnhofstr. 16, 4502 Solothurn | OGer SO, Strafkammer | Bielstrasse 1, 4502 Solothurn |
| BS | **Strafgericht Basel-Stadt** | **Schützenmattstr. 20, 4051 Basel** | Appellationsgericht BS | Bäumleingasse 1, 4051 Basel |
| BL | **Strafgericht BL** (kantonal) | Strafjustizzentrum Muttenz *(Nr. offen)* | KGer BL, Abt. Strafrecht | Bahnhofplatz 16, 4410 Liestal |
| SH | Kantonsgericht SH | Herrenacker 26, 8200 Schaffhausen | OGer Schaffhausen | Frauengasse 17, 8200 Schaffhausen |
| AR | Kantonsgericht AR | Landsgemeindeplatz 2, 9043 Trogen | OGer AR | Fünfeckpalast, 9043 Trogen *(Nr. offen)* |
| AI | Bezirksgericht AI | Unteres Ziel 20, 9050 Appenzell | KGer AI, Zivil-/Strafgericht | Zielstrasse 38, 9050 Appenzell |
| SG | 7 Kreisgerichte | KreisG SG: Bohl 1 / Neugasse 3, 9004 St. Gallen | KGer SG, Strafkammer | Klosterhof 1, 9001 St. Gallen |
| GR | 11 Regionalgerichte | RG Plessur: Poststr. 14, PF 262, 7001 Chur | OGer GR, Strafabt. | Grabenstrasse 30, 7001 Chur |
| AG | 11 Bezirksgerichte (Strafgericht) | BG Aarau: Kasinostr. 5, 5001 Aarau | OGer AG, Strafgericht | Obere Vorstadt 38, 5000 Aarau |
| TG | 5 Bezirksgerichte | (Sitze Arbon/Frauenfeld/Kreuzlingen/Münchwilen/Weinfelden) | OGer Thurgau | Promenadenstr. 12A, 8500 Frauenfeld |
| TI | Tribunale penale cantonale + Pretura penale | am TdA: Via Pretorio 16, 6901 Lugano | TdA, Corte appello/revisione penale | Via Pretorio 16, 6901 Lugano |
| VD | 4 Tribunaux d'arrondissement | TA Lausanne: Allée E.-Ansermet 2, 1014 Lausanne | TC, Cour d'appel pénale | Route du Signal 8, 1014 Lausanne |
| VS | 3 Tribunaux d'arrondissement | (Brig / Sion / Martigny-Monthey) | TC, Cour pénale | Rue Mathieu-Schiner 1, 1950 Sion |
| NE | 2 Tribunaux régionaux (police/criminel) | TR Littoral: Rue de l'Hôtel-de-Ville 2, 2000 Neuchâtel | TC, Cour pénale | Rue du Pommier 1, CP 1, 2002 Neuchâtel 2 |
| GE | Tribunal de police/correctionnel/criminel | Rue des Chaudronniers 9, 1204 Genève | Cour de justice, Chambre pénale | Bourg-de-Four 1, CP 3108, 1204 Genève |
| JU | juge/Tribunal pénal | Chemin du Château 9, 2900 Porrentruy | TC, Cour pénale | Chemin du Château 9, CP 1693, 2900 Porrentruy |

**Bonus-Spalte ZMG (soweit greifbar — für Haftfristen-Rechner):**

| Kt | ZMG-Behörde | ZMG-Adresse | Beleg |
|---|---|---|---|
| ZH | ZMG am BG (12 BG) | BG Zürich: Güterstrasse 33, 8010 Zürich | web 6.6.2026 ✓ |
| BE | Kant. ZMG + 3 reg. | Hodlerstrasse 7, 3011 Bern | web 6.6.2026 ✓ |
| LU | ZMG am Kantonsgericht | Hirschengraben 16, 6002 Luzern | Repo (Nr. = KGer) |
| UR | Landgerichtspräsidium | Rathausplatz 2, 6460 Altdorf | Repo ✓ |
| SZ | im Straf-/Jugend-/ZMG | Kollegiumstr. 28, PF 2267, 6431 Schwyz | web 6.6.2026 ✓ |
| OW | Kantonsgericht | Poststrasse 6, 6060 Sarnen | Repo (Art. 48 GOG) |
| NW | Kantonsgericht | Rathausplatz 1, 6371 Stans | Repo (Art. 14 GerG) |
| GL | am Kantonsgericht | Spielhof 6, 8750 Glarus | abgeleitet — offen |
| ZG | eigenständiges ZMG | Aabachstrasse 3, 6301 Zug | Repo (§ 35a GOG) |
| FR | Tribunal des mesures de contrainte | Fribourg *(Nr. offen)* | offen |
| SO | ZMG/Haftgericht | Solothurn *(Nr. offen)* | offen |
| BS | Straf- u. ZMG | Schützenmattstr. 20, 4051 Basel | web 6.6.2026 ✓ |
| BL | Strafgerichts-Präsidien | Strafjustizzentrum Muttenz *(Nr. offen)* | offen |
| SH | Kantonsgericht SH | Herrenacker 26, 8200 Schaffhausen | Repo (Art. 35 JG) |
| AR | am Kantonsgericht | Trogen *(Nr. offen)* | offen |
| AI | ZM-Richter am BG | Unteres Ziel 20, 9050 Appenzell | Repo (Art. 14 GOG) |
| SG | ZMG am Kantonsgericht | *(Nr. offen)* | offen |
| GR | Kant. ZMG | Theaterweg 1, PF 36, 7001 Chur | Repo ✓ |
| AG | BG-Präsidien als ZMG | je Bezirksgericht | Repo (§ 60 GOG) |
| TG | ZMG | *(Nr. offen)* | offen (§ 23 ZSRG) |
| TI | GPC | Via Bossi 3, 6901 Lugano | web 6.6.2026 ✓ |
| VD | Tribunal des mesures de contrainte | Lausanne *(Nr. offen)* | offen |
| VS | Tribunal des mesures de contrainte | Sion (Rue Mathieu-Schiner 1) | Repo (Art. 12 LOJ) |
| NE | Tribunal des mesures de contrainte | am Tribunal régional *(Nr. offen)* | offen |
| GE | Tribunal des mesures de contrainte | Rue des Chaudronniers 9, 1204 Genève | abgeleitet |
| JU | juge des mesures de contrainte | Chemin du Château 9, 2900 Porrentruy | Repo (Art. 32 LOJ) |

---

## Offene Verifikationen (ehrlich, §8)

1. **BL Strafgericht / ZMG (Strafjustizzentrum Muttenz):** Strasse + Hausnummer
   amtlich nicht zeichengenau extrahierbar (Repo-Befund bestätigt) — VOR
   Stammdaten-Übernahme nachschärfen. StA BL ist im Komplex an der
   Grenzacherstrasse 8, 4132 Muttenz; ob das Gericht dieselbe Hausnummer führt,
   ist nicht hart belegt.
2. **ZMG-Hausnummern offen:** FR, SO, SG, TG, VD, NE (genaue Adresse der
   Tribunal des mesures de contrainte / des Zwangsmassnahmengerichts nicht
   separat web-belegt).
3. **AR Obergericht Trogen:** Hausnummer amtlich nicht publiziert (Fünfeckpalast)
   — bleibt offen wie in obereInstanzen.ts.
4. **BE Wirtschaftsstrafgericht:** eigene Hausnummer nicht separat belegt
   (mutmasslich Amthaus Hodlerstrasse 7) — bestätigen.
5. **TI Tribunale penale cantonale:** eigene Hausnummer (≠ Tribunale d'appello
   Via Pretorio 16) nicht separat publiziert — bestätigen.
6. **VS Tribunaux d'arrondissement (Straf):** Einzeladressen je Arrondissement
   nicht abschliessend abgegriffen (vs.ch contacts-et-accès deckt die
   Bezirksgerichte; Strafbesetzung tagt an denselben Sitzen — bestätigen).
7. **GE/VS/ZG ZMG:** als am jeweiligen Strafgerichts-/Tribunal-cantonal-Komplex
   abgeleitet; eigene Hausnummer nicht separat publiziert.

## Diskrepanzen zu bestehenden Repo-Daten (ausgewiesen, nicht stillschweigend übernommen)

- **BS (strukturell):** Erste Strafinstanz = **Strafgericht, Schützenmattstr.
  20** — NICHT das in obereInstanzen.ts geführte Appellationsgericht
  (Bäumleingasse 1, = Berufungs-/Zivilinstanz). Beide Adressen korrekt, aber
  für verschiedene Funktionen.
- **LU (strukturell):** Erste Strafinstanz für schwere Fälle = **Kriminalgericht,
  Landenbergstrasse 36, 6002 Luzern** — eigene Adresse, abweichend von der
  Kantonsgerichts-Adresse (Hirschengraben 16) und von den Zivil-
  Bezirksgerichten. Neu recherchiert 6.6.2026.
- **GE (Gebäude):** Strafgerichte (police/correctionnel/criminel) =
  **Rue des Chaudronniers 9** — in gerichtsbehoerden ist für die Zivil-1.-Instanz
  (Tribunal de première instance) Bourg-de-Four 1 geführt. Gleicher
  Justizkomplex Altstadt, andere Hausadresse.
- **VS (organisatorisch):** Straf-1.-Instanz = **3 Tribunaux d'arrondissement**
  (Art. 11 LOJ), nicht die 9 Tribunaux de district (= Zivil-1.-Instanz). Sitze
  decken sich, Besetzung unterscheidet sich.
- **obereInstanzen.ts allgemein:** ist die **Zivil**-Berufungsinstanz; für Straf
  identische Häuser/Behörden (andere Kammer) — Adressen übernommen, Kammer-
  Bezeichnung ergänzt. Keine Adress-Abweichung ausser den oben genannten.

---

## Quellen (neu recherchiert, Abruf 6.6.2026)

- BS Strafgericht: strafgericht.bs.ch · staatskalender.bs.ch (Straf- und
  Zwangsmassnahmengericht) · search.ch (Schützenmattstrasse 20).
- LU Kriminalgericht: gerichte.lu.ch/organisation/erstinstanzliche_gerichte/
  kriminalgericht/kontakt · staatskalender.lu.ch.
- ZG Strafgericht: zg.ch/de/gerichte/zivil-und-strafrechtspflege/strafgericht ·
  staka.zug.ch.
- SZ Straf-/Jugend-/ZMG: sz.ch/behoerden/justiz/straf-jugend-und-
  zwangsmassnahmengericht · search.ch (Kollegiumstrasse 28).
- BE RG Bern-Mittelland Strafabt. + Kant. ZMG: zsg.justice.be.ch · search.ch.
- ZH BG Zürich Strafsachen + ZMG: gerichte-zh.ch (Strafsachenkanzlei; ZMG).
- AG BG Aarau: ag.ch/.../bezirksgerichte/aarau · search.ch (Kasinostrasse 5).
- TI GPC + TPC: www4.ti.ch/poteri/giudiziario/giustizia-penale/.
- GE Tribunal correctionnel/police/criminel: justice.ge.ch (Tribunal
  correctionnel; Contacts and access) · search.ch (Rue des Chaudronniers 9).
- VS: vs.ch/web/tribunaux/contacts-et-accès.
- NE: ne.ch/autorites/PJNE (Tribunal criminel; Tribunaux régionaux).
- Strukturwissen / Artikel-Mapping / übernommene Adressen: Repo-Dossiers
  `gog-gerichtsorganisation-kantone.md`, `gerichtsbehoerden-kantone.md`,
  `gerichtsadressen-erstliste.md`, `strafbehoerden-kantone.md` (alle ZWEIFACH
  GEPRÜFT, Abruf 5.6.2026).

**Bund (Vollständigkeit):** Bei Bundesgerichtsbarkeit (Art. 23/24 StPO):
1. Instanz = **Bundesstrafgericht, Strafkammer, Viale Stefano Franscini 7,
   6500 Bellinzona**; Berufung = **Berufungskammer BStGer** (gleiche Adresse);
   Weiterzug ans Bundesgericht (Art. 80 BGG). Quelle: `gerichte-bund.md` (✓2).
