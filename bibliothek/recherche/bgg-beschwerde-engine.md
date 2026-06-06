# Beschwerde ans Bundesgericht (BGG) – Recherche-Dossier (Zuständigkeits-/Rechtsmittel-Engine, Zivil-Schwerpunkt)

**Erstellt:** 6.6.2026 · **Autor:** Recherche-Agent (Auftrag David) · **Typ: ERSTRECHERCHE – fachliche Abnahme ausstehend (CLAUDE.md §7/§8).**

**Wortlaut-Quelle (primär):**
- **BGG** SR 173.110 – Cache `/tmp/bgg.html`, konsolidierte Fassung
  **«vom 17. Juni 2005 (Stand am 1. Januar 2025)»** (ELI `cc/2006/218`,
  Fedlex-Filestore; Anker-Format empirisch geprüft: `id="art_74"`,
  durchgehend `art_1`–`art_133`, alle hier zitierten Artikel vorhanden).
  Abrufdatum 6.6.2026.
- **ZPO** SR 272 (Art. 308/319/320/311/321/314/145 – Anschluss kantonale Stufe)
  und **SchKG** SR 281.1 (Art. 19 – Aufsichtsbeschwerde) werden referenziert,
  nicht neu am Cache verifiziert (Anschlussnormen; in den bestehenden Dossiers
  `zpo-kosten-streitwert.md` / `schkg-existenzminimum-vorlagen.md` belegt).

**Status: Arbeitsgrundlage – NICHT fachlich abgenommen.** Alle BGG-Wortlaut-
Zitate sind **verbatim am Cache verifiziert** (Konfidenz «verifiziert am
Wortlaut»). BGE-Leitlinien sind **Sekundärquelle** bzw. **[zu verifizieren]**
(kein Rechtsprechungs-Cache vorhanden). Es wurden **nur zwei Dateien geändert**:
dieses Dossier und `INDEX.md`.

**Vorarbeiten, auf die dieses Dossier aufbaut (statt zu duplizieren):**
- `src/lib/zustaendigkeit.ts` → **`bestimmeRechtsmittel(input)`** ist bereits
  vorhanden (kantonale Stufe Art. 308/319 ZPO + BGer-Schwelle Art. 74 BGG
  rudimentär). Dieses Dossier ist die **normative Grundlage für den Ausbau**
  dieser Funktion: Streitwertberechnung (Art. 51–53), Ausnahmekatalog Art. 74
  Abs. 2, subsidiäre Verfassungsbeschwerde (Art. 113 ff.), Zwischenentscheide
  (Art. 90–93), Fristen-Stillstand (Art. 46/100) und Kognitions-Hinweise
  (Art. 95–99).
- `src/lib/strafRechtsmittel.ts` → der `BGER_HINWEIS` (Art. 78 ff., 100, 46)
  ist dort als nachgelagerter Hinweis schon implementiert. **Teil 4 dieses
  Dossiers verifiziert und präzisiert ihn** (insb. Art. 81 Abs. 1 lit. b Ziff. 5
  Privatklägerschaft, Art. 79 Ausnahme BStGer, Art. 80 Vorinstanzen).
- `src/lib/fristenEngine.ts` (`OHNE_STILLSTAND`) + `zpoPresets.ts` als
  Wiederverwendungs-Bausteine für die BGer-Fristen-Presets.

**Verifikations-TODOs (Sammlung, vor `verified:true`/Deploy):**
- **V-0 (Stand 2025):** Cache ist Stand 1.1.2025. Vor Deploy gegen den
  Fedlex-Aktualstand prüfen (insb. die per 2025 in Kraft getretene
  englischsprachige Rechtsschrift-Option in Art. 42 Abs. 1bis / Art. 77 Abs. 2bis
  – bereits im Cache enthalten, also Stand ≥ 1.1.2025 bestätigt).
- **V-1 (Eheschutz = vorsorgliche Massnahme i.S.v. Art. 98/46):** Die im Auftrag
  markierte Frage ist über die Rechtsprechung zu schliessen (BGE 133 III 393:
  Eheschutzentscheide gelten im BGG als vorsorgliche Massnahmen → nur
  Verfassungsrügen Art. 98; Fristen-Stillstand-Ausnahme Art. 46 Abs. 2 lit. a).
  **[zu verifizieren – Sekundärquelle].**
- **V-2 (A-Post-Plus-Zustellung):** Art. 44 regelt nur den Fristbeginn und die
  7-Tage-Zustellfiktion bei eingeschriebener Post; die A-Post-Plus-Praxis (Frist
  beginnt mit Ablage im Postfach, kein Unterschrifts-Erfordernis) ist
  **Rechtsprechung** (BGE 142 III 599) und NICHT aus dem Wortlaut ableitbar →
  als Hinweis/Weiche, nicht als Rechenregel. **[zu verifizieren].**
- **V-3 (Rechtsfrage von grundsätzlicher Bedeutung):** Art. 74 Abs. 2 lit. a /
  Art. 42 Abs. 2 – die Subsumtion ist reine Rechtsfrage (Eingabe-Verantwortung,
  Weiche; §2/§8).
- **V-4 (Streitwert «übrige Fälle» 30 000 ohne Trennung Familienunterhalt):**
  prüfen, ob die Engine «arbeits-/mietrechtlich» (15 000) sauber von übrigen
  vermögensrechtlichen Fällen (30 000) trennt – Wortlaut Art. 74 Abs. 1 ist
  abschliessend zweistufig.

---

## TEIL 1 – BESCHWERDE IN ZIVILSACHEN (Art. 72–77 BGG)

### 1.1 · Sachlicher Geltungsbereich (Art. 72) – inkl. SchKG-Entscheide

**Art. 72 (verbatim, Konfidenz: verifiziert am Wortlaut):**
> «¹ Das Bundesgericht beurteilt Beschwerden gegen Entscheide in Zivilsachen.
> ² Der Beschwerde in Zivilsachen unterliegen auch:
> a. Entscheide in Schuldbetreibungs- und Konkurssachen;
> b. öffentlich-rechtliche Entscheide, die in unmittelbarem Zusammenhang mit
> Zivilrecht stehen, insbesondere Entscheide … 2. über die Führung des
> Grundbuchs, des Zivilstands- und des Handelsregisters … 6. auf dem Gebiet
> des Kindes- und Erwachsenenschutzes …»

**Antwort:** Die Beschwerde in Zivilsachen erfasst **kraft ausdrücklichen
Wortlauts auch SchKG-Entscheide** (Abs. 2 lit. a) sowie zivilrechtsnahe
öffentlich-rechtliche Entscheide (Abs. 2 lit. b, abschliessend mit
Beispielkatalog Ziff. 1–6). Damit ist die Beschwerde in Zivilsachen – nicht die
in öffentlich-rechtlichen Angelegenheiten – der Rechtsweg für Betreibungs-,
Konkurs-, Grundbuch-, Register- und KESB-Sachen.

**Art. 73 (Ausnahme, verbatim):**
> «Die Beschwerde ist unzulässig gegen Entscheide, die im Rahmen des
> Widerspruchsverfahrens gegen eine Marke getroffen worden sind.»

→ Engine-Weiche: Markenwiderspruchsverfahren = **Hard-Stop** für die Beschwerde
in Zivilsachen (Art. 73). Konfidenz: verifiziert am Wortlaut.

### 1.2 · Streitwertgrenze (Art. 74 Abs. 1) und Ausnahmen (Abs. 2)

**Art. 74 (verbatim, Konfidenz: verifiziert am Wortlaut):**
> «¹ In vermögensrechtlichen Angelegenheiten ist die Beschwerde nur zulässig,
> wenn der Streitwert mindestens beträgt:
> a. 15 000 Franken in arbeits- und mietrechtlichen Fällen;
> b. 30 000 Franken in allen übrigen Fällen.
> ² Erreicht der Streitwert den massgebenden Betrag nach Absatz 1 nicht, so ist
> die Beschwerde dennoch zulässig:
> a. wenn sich eine Rechtsfrage von grundsätzlicher Bedeutung stellt;
> b. wenn ein Bundesgesetz eine einzige kantonale Instanz vorsieht;
> c. gegen Entscheide der kantonalen Aufsichtsbehörden in Schuldbetreibungs-
> und Konkurssachen;
> d. gegen Entscheide des Konkurs- und Nachlassrichters oder der Konkurs- und
> Nachlassrichterin;
> e. gegen Entscheide des Bundespatentgerichts.»

**Antwort (deterministisch):**
- **Abs. 1 lit. a:** 15 000 in **arbeits- und mietrechtlichen** Fällen.
- **Abs. 1 lit. b:** 30 000 in **allen übrigen** vermögensrechtlichen Fällen.
- **Abs. 2** öffnet die Beschwerde **streitwertunabhängig** (also auch unter der
  Schwelle) in fünf abschliessend aufgezählten Fällen:
  - **lit. a** – Rechtsfrage grundsätzlicher Bedeutung (Rechtsfrage → Weiche,
    KEINE automatische Bejahung; Begründungspflicht Art. 42 Abs. 2).
  - **lit. b** – Bundesgesetz sieht eine **einzige kantonale Instanz** vor
    (deckt sich mit Art. 5/6 ZPO; **Handelsgericht** als Fachgericht =
    Art. 75 Abs. 2 lit. b, siehe Teil 5).
  - **lit. c** – Entscheide der **kantonalen Aufsichtsbehörden in SchKG-Sachen**
    (Art. 19 SchKG; korrespondiert mit der 10-Tage-Frist Art. 100 Abs. 2 lit. a).
  - **lit. d** – Entscheide des **Konkurs- und Nachlassrichters** (z. B.
    Konkurseröffnung, Nachlassstundung). → **Auftrags-Frage «lit. d ??»:
    bestätigt am Wortlaut** – lit. d existiert und betrifft genau Konkurs/Nachlass.
  - **lit. e** – Entscheide des **Bundespatentgerichts**.

Konfidenz: **verifiziert am Wortlaut** (gesamter Art. 74 inkl. lit. c/d/e).

**Korrektur einer Auftrags-Prämisse (§7):** Der Auftrag fragte, ob die
Ausnahme «Aufsichtsbehörde SchKG» bei **lit. c** steht – ja (lit. c), und
**lit. d** ist Konkurs/Nachlass-**Richter** (nicht «Konkurs/Nachlass»-Behörde).
Beide sind bestätigt; das im bestehenden Code (`bestimmeRechtsmittel`)
genannte Schwellen-Paar 15 000/30 000 ist korrekt.

### 1.3 · Streitwertberechnung (Art. 51–53)

**Art. 51 (verbatim, Konfidenz: verifiziert am Wortlaut):**
> «¹ Der Streitwert bestimmt sich: a. bei Beschwerden gegen Endentscheide nach
> den **Begehren, die vor der Vorinstanz streitig geblieben waren**; …
> d. bei Klagen nach den Begehren des Klägers oder der Klägerin.
> ³ Zinsen, Früchte, Gerichtskosten und Parteientschädigungen, die als
> Nebenrechte geltend gemacht werden, … fallen bei der Bestimmung des
> Streitwerts nicht in Betracht.
> ⁴ Als Wert wiederkehrender Nutzungen oder Leistungen gilt der Kapitalwert.
> Bei ungewisser oder unbeschränkter Dauer gilt als Kapitalwert der
> **zwanzigfache Betrag** der einjährigen Nutzung oder Leistung, bei Leibrenten
> jedoch der Barwert.»

**Art. 52 (Zusammenrechnung, verbatim):**
> «Mehrere in einer vermögensrechtlichen Sache von der gleichen Partei oder von
> Streitgenossen … geltend gemachte Begehren werden zusammengerechnet, sofern
> sie sich nicht gegenseitig ausschliessen.»

**Art. 53 (Widerklage, verbatim):**
> «¹ Der Betrag einer Widerklage wird nicht mit demjenigen der Hauptklage
> zusammengerechnet. ² Schliessen die in Hauptklage und Widerklage geltend
> gemachten Ansprüche einander aus und erreicht eine der beiden Klagen die
> Streitwertgrenze nicht, so gilt die Streitwertgrenze auch für diese Klage als
> erreicht, wenn sich die Beschwerde auf beide Klagen bezieht.»

**Antwort (Regelwerk-Skizze, deterministisch):**
- Massgeblich sind die **vor der Vorinstanz streitig gebliebenen Begehren**
  (Art. 51 Abs. 1 lit. a) – NICHT die ursprüngliche Klageforderung. (Spiegelt
  Art. 308 Abs. 2 ZPO «zuletzt aufrechterhaltene Rechtsbegehren».)
- **Wiederkehrende Leistungen:** Kapitalwert; bei unbestimmter/unbeschränkter
  Dauer **20× Jahresleistung** (Art. 51 Abs. 4) – das ist die einzige im BGG
  hinterlegte **Kapitalisierungsregel** (deterministisch parametrisierbar).
  Bei Leibrenten Barwert (= versicherungsmathematisch → Weiche, nicht
  determinierbar ohne Tafel).
- **Nebenrechte** (Zinsen, Gerichtskosten, Parteientschädigung) zählen NICHT
  zum Streitwert (Art. 51 Abs. 3).
- **Zusammenrechnung** mehrerer Begehren derselben Partei/Streitgenossen, wenn
  sie sich nicht ausschliessen (Art. 52).
- **Widerklage** wird NICHT zur Hauptklage addiert (Art. 53 Abs. 1); Sonderregel
  bei sich ausschliessenden Ansprüchen (Abs. 2).

Konfidenz: **verifiziert am Wortlaut**. **Engine-Konsequenz:** Die Streitwert-
Eingabe bleibt **Nutzer-Verantwortung** (§2 – keine Schätzung); die Engine kann
aber die **20×-Kapitalisierung wiederkehrender Leistungen** deterministisch
anbieten und Nebenrechte explizit ausklammern (UI-Hinweis).

### 1.4 · Schiedsgerichtsbarkeit (Art. 77) – Vollständigkeit

**Art. 77 Abs. 1 (verbatim):** «Die Beschwerde in Zivilsachen ist ungeachtet des
Streitwerts zulässig gegen Entscheide von Schiedsgerichten: a. in der
internationalen Schiedsgerichtsbarkeit … (Art. 190–192 IPRG); b. in der
nationalen Schiedsgerichtsbarkeit … (Art. 389–395 ZPO).»

→ Streitwertunabhängig; eigener (eng begrenzter) Rügenkatalog. Für die Engine
als **Sonderzweig/Weiche** (selten; nicht Kern des Zivil-Ausbaus). Konfidenz:
verifiziert am Wortlaut.

---

## TEIL 2 – SUBSIDIÄRE VERFASSUNGSBESCHWERDE (Art. 113–119 BGG)

### 2.1 · Wann sie greift (Art. 113)

**Art. 113 (verbatim, Konfidenz: verifiziert am Wortlaut):**
> «Das Bundesgericht beurteilt Verfassungsbeschwerden gegen Entscheide letzter
> kantonaler Instanzen, **soweit keine Beschwerde nach den Artikeln 72–89
> zulässig ist**.»

**Antwort:** Strikte **Subsidiarität**. Die Verfassungsbeschwerde steht offen,
wenn die ordentliche Beschwerde NICHT zulässig ist – typisch: **Streitwert nach
Art. 74 Abs. 1 nicht erreicht UND keine Ausnahme nach Art. 74 Abs. 2** (insb.
keine Rechtsfrage grundsätzlicher Bedeutung). Nur **letztinstanzliche kantonale**
Entscheide (Art. 114 i.V.m. Art. 75/86).

### 2.2 · Rügen (Art. 116) und massgeblicher Sachverhalt (Art. 118)

**Art. 116 (verbatim):** «Mit der Verfassungsbeschwerde kann die Verletzung von
**verfassungsmässigen Rechten** gerügt werden.»

**Art. 115 (Legitimation, verbatim):** «Zur Verfassungsbeschwerde ist berechtigt,
wer: a. vor der Vorinstanz am Verfahren teilgenommen … und b. ein **rechtlich
geschütztes Interesse** an der Aufhebung oder Änderung … hat.»

**Art. 118 (verbatim):** Bindung an den vorinstanzlich festgestellten
Sachverhalt; Berichtigung nur bei Rechtsverletzung i.S.v. Art. 116.

→ Rügebeschränkung: **nur Verfassungsrügen** (kein freies Bundesrecht), Rüge-
und Begründungspflicht (Art. 117 verweist u. a. auf Art. 106 Abs. 2).
Legitimation enger als bei Art. 76 (**rechtlich geschütztes Interesse**, nicht
bloss schutzwürdiges). Konfidenz: verifiziert am Wortlaut.

### 2.3 · Frist und Verfahren (Art. 117)

**Art. 117 (verbatim):** «Für das Verfahren der Verfassungsbeschwerde gelten die
Artikel **90–94, 99, 100**, 102, 103 Absätze 1 und 3, 104, 106 Absatz 2 sowie
107–112 sinngemäss.»

→ **Frist = Art. 100** (also 30 Tage Grundsatz, Sonderfristen identisch);
Zwischenentscheide Art. 90–94; Novenverbot Art. 99. **Achtung:** Art. 117
verweist auf **Art. 103 Abs. 1 und 3** (nicht Abs. 2) – die automatische
aufschiebende Wirkung des Art. 103 Abs. 2 gilt bei der Verfassungsbeschwerde
NICHT. Konfidenz: verifiziert am Wortlaut.

### 2.4 · Verhältnis zur ordentlichen Beschwerde / gleiche Eingabe (Art. 119)

**Art. 119 (verbatim, Konfidenz: verifiziert am Wortlaut):**
> «¹ Führt eine Partei gegen einen Entscheid sowohl ordentliche Beschwerde als
> auch Verfassungsbeschwerde, so hat sie **beide Rechtsmittel in der gleichen
> Rechtsschrift einzureichen**. ² Das Bundesgericht behandelt beide Beschwerden
> im gleichen Verfahren. ³ Es prüft die vorgebrachten Rügen nach den
> Vorschriften über die entsprechende Beschwerdeart.»

**Antwort:** Ist unklar, ob die Streitwertschwelle erreicht ist oder ob eine
Rechtsfrage grundsätzlicher Bedeutung vorliegt, ist die **Doppelbeschwerde in
einer Rechtsschrift** der sichere Weg (Art. 119). Eine «Konversion» findet
faktisch über die Eventualbegründung statt; das BGer prüft jede Rüge nach der
für sie geltenden Beschwerdeart. **Engine-Hinweis:** Bei `bger =
schwelle_verfehlt` (bestehender Code) ist die Verfassungsbeschwerde der
Auffangweg – plus Hinweis auf die gleiche-Rechtsschrift-Pflicht.

---

## TEIL 3 – BESCHWERDE IN STRAFSACHEN (Art. 78–81 BGG)

### 3.1 · Anfechtungsobjekte (Art. 78/79)

**Art. 78 (verbatim, Konfidenz: verifiziert am Wortlaut):**
> «¹ Das Bundesgericht beurteilt Beschwerden gegen Entscheide in Strafsachen.
> ² Der Beschwerde in Strafsachen unterliegen auch Entscheide über:
> a. **Zivilansprüche, wenn diese zusammen mit der Strafsache zu behandeln
> sind**; b. den Vollzug von Strafen und Massnahmen.»

**Art. 79 (Ausnahme, verbatim):** «Die Beschwerde ist unzulässig gegen
Entscheide der **Beschwerdekammer des Bundesstrafgerichts**, soweit es sich
nicht um Entscheide über **Zwangsmassnahmen** handelt.»

### 3.2 · Vorinstanzen (Art. 80)

**Art. 80 (verbatim):** «¹ Die Beschwerde ist zulässig gegen Entscheide letzter
kantonaler Instanzen und gegen Entscheide der Beschwerdekammer und der
Berufungskammer des Bundesstrafgerichts. ² Die Kantone setzen als letzte
kantonale Instanzen obere Gerichte ein. Diese entscheiden als
Rechtsmittelinstanzen. Ausgenommen sind die Fälle, in denen nach der StPO ein
Zwangsmassnahmegericht oder ein anderes Gericht als einzige kantonale Instanz
entscheidet.»

### 3.3 · Legitimation (Art. 81) – Privatklägerschaft / Zivilansprüche-Erfordernis

**Art. 81 (verbatim, Auszug, Konfidenz: verifiziert am Wortlaut):**
> «¹ Zur Beschwerde in Strafsachen ist berechtigt, wer: a. vor der Vorinstanz
> am Verfahren teilgenommen … und b. ein **rechtlich geschütztes Interesse** …
> hat, insbesondere: 1. die beschuldigte Person, … 3. die Staatsanwaltschaft,
> **ausser bei Entscheiden über die Anordnung, die Verlängerung und die
> Aufhebung der Untersuchungs- und Sicherheitshaft**, … 5. die
> **Privatklägerschaft, wenn der angefochtene Entscheid sich auf die Beurteilung
> ihrer Zivilansprüche auswirken kann**, 6. die Person, die den Strafantrag
> stellt, soweit es um das Strafantragsrecht als solches geht, …»

**Antwort:**
- **Privatklägerschaft (Ziff. 5):** beschwerdeberechtigt **nur, wenn der
  Entscheid sich auf ihre Zivilansprüche auswirken kann** → Engine-Gate:
  «Zivilansprüche-Auswirkung» als Eingabe; ohne sie kein Weiterzug der
  Privatklägerschaft (Rechtsfrage → Weiche).
- **Staatsanwaltschaft (Ziff. 3):** beschwerdeberechtigt, **ausser bei
  Haftentscheiden** (kohärent mit Art. 222 StPO Fassung seit 1.1.2024 und mit
  dem bereits in `strafRechtsmittel.ts` implementierten Hard-Stop).
- **Strafantragstellende (Ziff. 6):** nur betreffend das Strafantragsrecht als
  solches.

**Verhältnis zu `lib/strafRechtsmittel.ts`:** Der dortige `BGER_HINWEIS` ist
**inhaltlich korrekt**, aber teilweise unpräzise: er nennt «Art. 81 BGG»
pauschal. **Empfehlung (Teil 5):** den Hinweis um die Privatkläger-Bedingung
(Ziff. 5) und die Art.-79-Ausnahme (BStGer-Beschwerdekammer) ergänzen –
**ohne** die StPO-Engine-Logik zu ändern (§4: keine Fusion; nur Hinweistext).

---

## TEIL 4 – BESCHWERDE IN ÖFFENTLICH-RECHTLICHEN ANGELEGENHEITEN (Art. 82–89) – Grundzüge

**Art. 82 (verbatim):** Beschwerde gegen a. Entscheide in Angelegenheiten des
öffentlichen Rechts, b. kantonale Erlasse, c. politische Stimmberechtigung.

**Art. 83 (Ausnahmekatalog, verbatim, Auszug):** «Die Beschwerde ist unzulässig
gegen: a. Entscheide auf dem Gebiet der inneren/äusseren Sicherheit …;
b. Entscheide über die ordentliche Einbürgerung; c. Entscheide auf dem Gebiet
des **Ausländerrechts** betreffend (1.) die Einreise, (2.) Bewilligungen, auf
die weder Bundesrecht noch Völkerrecht einen Anspruch einräumt, (3.) die
vorläufige Aufnahme, (4.) Ausweisung/Wegweisung …; d. Entscheide auf dem Gebiet
des **Asyls** …; e. Verweigerung der Ermächtigung zur Strafverfolgung von
Behördenmitgliedern/Bundespersonal; f. **öffentliche Beschaffungen**, wenn sich
keine Rechtsfrage von grundsätzlicher Bedeutung stellt …» (Katalog lit. a–x,
hier auszugsweise).

**Art. 86 (Vorinstanzen):** Bundesverwaltungsgericht, Bundesstrafgericht, UBI,
letzte kantonale Instanzen (sofern nicht BVGer zulässig); Kantone setzen obere
Gerichte als unmittelbare Vorinstanzen ein.

**Antwort:** Nur **Grundzüge** für die spätere Verwaltungs-Rechtsweg-Phase. Der
**Ausnahmekatalog Art. 83** ist der zentrale Hard-Stop (Ausländer-/Asyl-/
Beschaffungs-/Einbürgerungssachen). Konfidenz: verifiziert am Wortlaut (Auszug);
vollständige Katalog-Subsumtion = eigene spätere Recherche.

---

## TEIL 5 – VORINSTANZEN / DOUBLE INSTANCE (Art. 75/80/86)

**Art. 75 (verbatim, Konfidenz: verifiziert am Wortlaut):**
> «¹ Die Beschwerde ist zulässig gegen Entscheide **letzter kantonaler
> Instanzen**, des Bundesverwaltungsgerichts und des Bundespatentgerichts.
> ² Die Kantone setzen als letzte kantonale Instanzen **obere Gerichte** ein.
> Diese entscheiden als **Rechtsmittelinstanzen**; ausgenommen sind die Fälle,
> in denen: a. ein Bundesgesetz eine einzige kantonale Instanz vorsieht;
> b. ein **Fachgericht für handelsrechtliche Streitigkeiten als einzige
> kantonale Instanz** entscheidet; c. eine Klage mit einem Streitwert von
> mindestens **100 000 Franken** mit Zustimmung aller Parteien direkt beim
> oberen Gericht eingereicht wurde.»

**Antwort (double instance, Art. 75 Abs. 2 ZPO-Spiegelung):**
- **Grundsatz:** Beschwerde nur gegen Entscheide einer **oberen kantonalen
  Rechtsmittelinstanz** (kantonaler Instanzenzug muss ausgeschöpft sein –
  Art. 75 Abs. 1/2).
- **Ausnahmen vom Erfordernis der oberen Rechtsmittelinstanz** (Abs. 2 lit. a–c):
  - lit. a – **einzige kantonale Instanz** nach Bundesgesetz (= Art. 5 ZPO).
  - lit. b – **Handelsgericht** als einzige kantonale Instanz (= Art. 6 ZPO).
  - lit. c – **Direktklage ans obere Gericht** ab Streitwert 100 000 mit
    Zustimmung aller Parteien (= Art. 8 ZPO).

Das deckt sich exakt mit den bereits in `zustaendigkeit.ts` modellierten Weichen
(`istEinzigeInstanz`, `hgWeiche`, `direktklageWeiche`). **Engine-Konsequenz:**
In diesen drei Fällen entfällt die kantonale Berufung/Beschwerde, und es geht
**direkt** ans BGer (Art. 75 Abs. 2). Konfidenz: verifiziert am Wortlaut.

---

## TEIL 6 – FRISTEN (Art. 100), STILLSTAND (Art. 46) UND ZUSTELLUNG (Art. 44/45)

### 6.1 · Beschwerdefrist (Art. 100)

**Art. 100 (verbatim, Konfidenz: verifiziert am Wortlaut):**
> «¹ Die Beschwerde gegen einen Entscheid ist innert **30 Tagen** nach der
> Eröffnung der **vollständigen Ausfertigung** beim Bundesgericht einzureichen.
> ² Die Beschwerdefrist beträgt **zehn Tage**: a. bei Entscheiden der
> **kantonalen Aufsichtsbehörden in Schuldbetreibungs- und Konkurssachen**;
> b. bei Entscheiden auf den Gebieten der internationalen Rechtshilfe in
> Strafsachen und der internationalen Amtshilfe in Steuersachen; c. bei
> Entscheiden über die Rückgabe eines Kindes (HKÜ) …; d. bei Entscheiden des
> Bundespatentgerichts über die Erteilung einer Lizenz …
> ³ Die Beschwerdefrist beträgt **fünf Tage**: a. bei Entscheiden der kantonalen
> Aufsichtsbehörden in SchKG-Sachen **im Rahmen der Wechselbetreibung**;
> b. … Abstimmungen … ⁴ … Nationalratswahlen … **drei Tage**. …
> ⁷ Gegen das unrechtmässige Verweigern oder Verzögern eines Entscheids kann
> **jederzeit** Beschwerde geführt werden.»

**Antwort (deterministisch, Preset-Tabelle):**

| Materie | Frist | Norm | Trigger |
|---|---|---|---|
| Grundsatz (Zivil/Straf/öff.-recht.) | **30 Tage** | Art. 100 Abs. 1 | Eröffnung der vollständigen (begründeten) Ausfertigung |
| SchKG-**Aufsichtsbeschwerde** | **10 Tage** | Art. 100 Abs. 2 lit. a | Eröffnung |
| Internat. Rechtshilfe Straf / Amtshilfe Steuern | 10 Tage | Art. 100 Abs. 2 lit. b | Eröffnung |
| Kindesrückgabe (HKÜ) | 10 Tage | Art. 100 Abs. 2 lit. c | Eröffnung |
| SchKG-Aufsicht **Wechselbetreibung** | **5 Tage** | Art. 100 Abs. 3 lit. a | Eröffnung |
| Eidg. Abstimmungen | 5 Tage | Art. 100 Abs. 3 lit. b | Eröffnung |
| Nationalratswahlen | 3 Tage | Art. 100 Abs. 4 | Eröffnung |
| Rechtsverweigerung/-verzögerung | **fristlos** | Art. 100 Abs. 7 | – |

→ **Auftrags-Frage «SchKG-Aufsichtsbeschwerde 10 Tage?»: bestätigt am Wortlaut**
(Art. 100 Abs. 2 lit. a). Konfidenz: verifiziert am Wortlaut.

### 6.2 · Fristbeginn und -ende (Art. 44/45)

**Art. 44 (verbatim):** «¹ Fristen, die durch eine Mitteilung oder den Eintritt
eines Ereignisses ausgelöst werden, beginnen **am folgenden Tag** zu laufen.
² Eine Mitteilung, die nur gegen Unterschrift … überbracht wird, gilt
spätestens am **siebenten Tag nach dem ersten erfolglosen Zustellungsversuch**
als erfolgt.»

**Art. 45 (verbatim):** «¹ Ist der letzte Tag der Frist ein **Samstag, ein
Sonntag oder ein … anerkannter Feiertag**, so endet sie am **nächstfolgenden
Werktag**. ² Massgebend ist das Recht des Kantons, in dem die Partei oder ihr
Vertreter … den Wohnsitz oder den Sitz hat.»

→ Deterministisch in `fristenEngine.ts` abbildbar (Wochenenden/Feiertage,
7-Tage-Zustellfiktion bei eingeschriebener Post). **A-Post-Plus** ist NICHT im
Wortlaut → Rechtsprechung (V-2). Konfidenz: verifiziert am Wortlaut (Wortlaut-
Teil); A-Post-Plus offen.

### 6.3 · Fristenstillstand (Art. 46) UND seine Ausnahmen (Abs. 2)

**Art. 46 (verbatim, Konfidenz: verifiziert am Wortlaut):**
> «¹ Gesetzlich oder richterlich nach Tagen bestimmte Fristen **stehen still**:
> a. vom **siebenten Tag vor Ostern bis und mit dem siebenten Tag nach Ostern**;
> b. vom **15. Juli bis und mit dem 15. August**; c. vom **18. Dezember bis und
> mit dem 2. Januar**. ² Absatz 1 **gilt nicht** in Verfahren betreffend:
> a. die **aufschiebende Wirkung und andere vorsorgliche Massnahmen**;
> b. die **Wechselbetreibung**; c. Stimmrechtssachen (Art. 82 Bst. c); d. die
> internationale Rechtshilfe in Strafsachen und die internationale Amtshilfe in
> Steuersachen; e. die **öffentlichen Beschaffungen**.»

**Antwort (deterministisch + eine kritische Weiche):**
- **Stillstand** in drei Perioden (Ostern ±7 Tage, 15.7.–15.8., 18.12.–2.1.).
  Im Unterschied zur ZPO (Art. 145) ist der BGG-Stillstand **eigenständig** und
  gilt auch dann, wenn das vorinstanzliche Verfahren keinen Stillstand kannte.
- **Ausnahmen Abs. 2 (KEIN Stillstand):** vorsorgliche Massnahmen / aufschiebende
  Wirkung (lit. a), Wechselbetreibung (lit. b), Stimmrechtssachen (lit. c),
  internat. Rechtshilfe/Amtshilfe (lit. d), öffentliche Beschaffungen (lit. e).
- **EHESCHUTZ (Auftrags-Vorsicht!):** Eheschutzentscheide gelten nach
  **BGer-Rechtsprechung** (BGE 133 III 393) als **vorsorgliche Massnahmen** im
  Sinne des BGG. Folge: (1) **nur Verfassungsrügen** (Art. 98, siehe Teil 7) und
  (2) **kein Fristenstillstand** (Art. 46 Abs. 2 lit. a). **Das ist NICHT aus
  dem Wortlaut «Eheschutz» ableitbar** (das Wort kommt in Art. 46/98 nicht vor)
  → Konfidenz: **Sekundärquelle / [zu verifizieren] (V-1)**. Die Engine darf
  das nur als **Weiche/Warnung** ausgeben, nicht als feste Regel.

→ **Achtung Doppelnatur SchKG:** Für die **Wechselbetreibung** entfällt der
Stillstand (Abs. 2 lit. b) UND die Frist verkürzt sich auf 5 Tage (Art. 100
Abs. 3 lit. a). Die **gewöhnliche** SchKG-Aufsichtsbeschwerde (10 Tage, Art. 100
Abs. 2 lit. a) ist hingegen **nicht** in Art. 46 Abs. 2 genannt → dort gilt der
Stillstand grundsätzlich (Rechtsprechung beachten; Betreibungs-Sachen sind heikel
– V-1-Umfeld).

### 6.4 · Erstreckung / Wiederherstellung (Art. 47/50)

**Art. 47 (verbatim):** «¹ **Gesetzlich bestimmte Fristen können nicht
erstreckt werden.** ² Richterlich bestimmte Fristen können aus zureichenden
Gründen erstreckt werden, wenn das Gesuch vor Ablauf der Frist gestellt …»

**Art. 50 (verbatim):** «¹ Ist eine Partei … durch einen anderen Grund als die
mangelhafte Eröffnung **unverschuldeterweise abgehalten** worden, fristgerecht
zu handeln, so wird die Frist wiederhergestellt, sofern die Partei … **innert
30 Tagen nach Wegfall des Hindernisses** darum ersucht und die versäumte
Rechtshandlung nachholt. …»

→ Die Beschwerdefrist ist **gesetzlich → NICHT erstreckbar** (Art. 47 Abs. 1);
einziger Rettungsweg ist die **Wiederherstellung** (Art. 50, 30-Tage-
Gesuchsfrist). Engine-Hinweis. Konfidenz: verifiziert am Wortlaut.

---

## TEIL 7 – END-/ZWISCHENENTSCHEID (Art. 90–93) UND KOGNITION/RÜGEN (Art. 95–99)

### 7.1 · Anfechtbare Entscheide (Art. 90–93) – die «Weiche»

**Art. 90 (verbatim):** «Die Beschwerde ist zulässig gegen Entscheide, die das
Verfahren abschliessen.» (**Endentscheid**.)

**Art. 91 (Teilentscheide, verbatim):** zulässig gegen einen Entscheid, der
a. nur einen Teil der Begehren behandelt (unabhängig beurteilbar) oder b. das
Verfahren für einen Teil der Streitgenossen abschliesst.

**Art. 92 (Vor-/Zwischenentscheide über Zuständigkeit/Ausstand, verbatim):**
«¹ Gegen selbständig eröffnete Vor- und Zwischenentscheide über die
**Zuständigkeit** und über **Ausstandsbegehren** ist die Beschwerde zulässig.
² Diese Entscheide können später nicht mehr angefochten werden.» (**Sofort
anzufechten – sonst verwirkt.**)

**Art. 93 (andere Vor-/Zwischenentscheide, verbatim, Konfidenz: verifiziert):**
> «¹ Gegen andere selbständig eröffnete Vor- und Zwischenentscheide ist die
> Beschwerde zulässig: a. wenn sie einen **nicht wieder gutzumachenden
> Nachteil** bewirken können; oder b. wenn die Gutheissung der Beschwerde
> **sofort einen Endentscheid herbeiführen** und damit einen bedeutenden Aufwand
> … ersparen würde. … ³ Ist die Beschwerde … nicht zulässig oder wurde von ihr
> kein Gebrauch gemacht, so sind die … Vor- und Zwischenentscheide durch
> Beschwerde **gegen den Endentscheid** anfechtbar, soweit sie sich auf dessen
> Inhalt auswirken.»

**Antwort (Decision-Weiche):**
- **Endentscheid (Art. 90):** Beschwerde immer offen (vorbehältlich Streitwert
  etc.).
- **Teilentscheid (Art. 91):** wie Endentscheid (für den abgeschlossenen Teil).
- **Zwischenentscheid Zuständigkeit/Ausstand (Art. 92):** **sofort** anfechtbar
  und **muss** sofort angefochten werden (sonst Verwirkung, Abs. 2).
- **Anderer Zwischenentscheid (Art. 93):** nur bei (a) nicht wieder
  gutzumachendem Nachteil **oder** (b) sofortiger Endentscheid-Herbeiführung;
  sonst Anfechtung erst mit Endentscheid (Abs. 3). «Nicht wieder
  gutzumachender Nachteil» = **Rechtsfrage → Weiche** (§2).

Konfidenz: verifiziert am Wortlaut. **Engine-Konsequenz:** Eingabe
`entscheidTyp ∈ {endentscheid, teilentscheid, zwischen_zustaendigkeit_ausstand,
zwischen_anderer}` → deterministische Statthaftigkeits-Weiche, mit Hard-Stop-
Hinweis bei `zwischen_anderer` ohne (a)/(b).

### 7.2 · Kognition / Rügen (Art. 95–99) – insb. Art. 98 (Eheschutz!)

**Art. 95 (verbatim):** Rüge der Verletzung von a. Bundesrecht, b. Völkerrecht,
c. kantonalen verfassungsmässigen Rechten, d. kant. Stimmrechtsbestimmungen,
e. interkantonalem Recht.

**Art. 97 (Sachverhalt, verbatim):** «¹ Die Feststellung des Sachverhalts kann
nur gerügt werden, wenn sie **offensichtlich unrichtig** ist oder auf einer
Rechtsverletzung … beruht und wenn die Behebung … für den Ausgang … entscheidend
sein kann.»

**Art. 98 (verbatim, Konfidenz: verifiziert am Wortlaut):**
> «Mit der Beschwerde gegen Entscheide über **vorsorgliche Massnahmen** kann nur
> die Verletzung **verfassungsmässiger Rechte** gerügt werden.»

**Art. 99 (Noven, verbatim):** «¹ **Neue Tatsachen und Beweismittel** dürfen nur
so weit vorgebracht werden, als erst der Entscheid der Vorinstanz dazu Anlass
gibt. ² **Neue Begehren sind unzulässig.**»

**Antwort:**
- **Grundsatz:** volle Rechtskognition (Art. 95), eingeschränkte
  Sachverhaltskognition (Art. 97 – «offensichtlich unrichtig»/Willkür).
- **Vorsorgliche Massnahmen (Art. 98):** **nur Verfassungsrügen** – das ist die
  zentrale Kognitions-Einschränkung. **EHESCHUTZ** fällt nach Rechtsprechung
  hierunter (V-1) → Engine gibt bei Eheschutz/Massnahmen den Kognitions-Hinweis
  «nur Verfassungsrügen (Art. 98)» aus.
- **Novenverbot (Art. 99):** neue Tatsachen nur ausnahmsweise, neue Begehren
  unzulässig → UI-Hinweis.

Konfidenz: Wortlaut verifiziert; Eheschutz-Subsumtion = Sekundärquelle (V-1).

---

## TEIL 8 – AUFSCHIEBENDE WIRKUNG (Art. 103)

**Art. 103 (verbatim, Konfidenz: verifiziert am Wortlaut):**
> «¹ Die Beschwerde hat **in der Regel keine aufschiebende Wirkung**. ² Die
> Beschwerde hat im Umfang der Begehren aufschiebende Wirkung: a. **in
> Zivilsachen, wenn sie sich gegen ein Gestaltungsurteil richtet**; b. in
> Strafsachen, wenn sie sich gegen einen Entscheid richtet, der eine unbedingte
> Freiheitsstrafe oder eine freiheitsentziehende Massnahme ausspricht …;
> c./d. internat. Rechts-/Amtshilfe. ³ Der Instruktionsrichter … kann … eine
> andere Anordnung treffen.»

**Antwort:** Grundsatz **keine** aufschiebende Wirkung; ex lege nur bei
**Gestaltungsurteilen** (Zivil) bzw. unbedingten Freiheitsstrafen (Straf).
Sonst Antrag an den Instruktionsrichter (Abs. 3). **Achtung:** Bei der
Verfassungsbeschwerde gilt nur Art. 103 **Abs. 1 und 3** (Art. 117) – kein
ex-lege-Suspensiveffekt. Konfidenz: verifiziert am Wortlaut.

---

## TEIL 9 – BESCHWERDESCHRIFT (Art. 42), KOSTEN (Art. 65/66), UR (Art. 64) – UI-Hinweise

**Art. 42 (verbatim, Auszug):** «¹ Rechtsschriften … haben die **Begehren,
deren Begründung mit Angabe der Beweismittel und die Unterschrift** zu enthalten.
² In der Begründung ist in gedrängter Form darzulegen, inwiefern der angefochtene
Akt **Recht verletzt**. Ist eine Beschwerde nur unter der Voraussetzung zulässig,
dass sich eine **Rechtsfrage von grundsätzlicher Bedeutung** stellt …, so ist
auszuführen, warum die jeweilige Voraussetzung erfüllt ist. …» (Abs. 4:
elektronische Einreichung mit qualifizierter Signatur.)

**Art. 64 (UR, verbatim, Auszug):** Befreiung von Gerichtskosten/Sicherstellung
auf Antrag, sofern Rechtsbegehren nicht aussichtslos; nötigenfalls
unentgeltliche Verbeiständung (Anwalt). Nachzahlungspflicht bei späterer
Leistungsfähigkeit.

**Art. 65 (Gerichtskosten, verbatim, Auszug):** Gerichtsgebühr nach Streitwert,
Umfang, Schwierigkeit, finanzieller Lage. Rahmen i.d.R.: a. ohne
Vermögensinteresse **200–5000 Fr.**; b. übrige **200–100 000 Fr.** Abs. 4:
**200–1000 Fr.** und streitwertunabhängig u. a. bei Sozialversicherungsleistungen,
Geschlechterdiskriminierung, **Arbeitsverhältnis bis 30 000 Fr.**, BehiG Art. 7/8.

**Art. 66 (verbatim, Auszug):** Kosten i.d.R. der unterliegenden Partei;
Verzicht/andere Verteilung möglich; Bund/Kantone/Gemeinden i.d.R. kostenfrei im
amtlichen Wirkungskreis.

**Antwort:** Knappe **UI-Hinweise** (keine Engine-Rechenregel): Form-/
Begründungspflicht (Art. 42 – inkl. besondere Begründung bei Art. 74 Abs. 2
lit. a / Art. 83 lit. f), Kostenrahmen (Art. 65), UR-Möglichkeit (Art. 64).
Konfidenz: verifiziert am Wortlaut.

---

## DECISION-TREE FÜR DIE ENGINE (deterministisch, regelbasiert – keine Schätzung)

Ausbau-Vorbild: bestehende `bestimmeRechtsmittel(input)` in
`src/lib/zustaendigkeit.ts`. Reihenfolge der Weichen:

**Stufe A · Rechtsgebiet → Beschwerde-Typ**
```
rechtsweg == 'zivil'        → Beschwerde in Zivilsachen (Art. 72); SchKG-Entscheide
                               ebenfalls hier (Art. 72 Abs. 2 lit. a)
              ↳ Markenwiderspruch                → HARD-STOP (Art. 73)
rechtsweg == 'straf'        → Beschwerde in Strafsachen (Art. 78)
              ↳ BStGer-Beschwerdekammer ohne ZM  → HARD-STOP (Art. 79)
rechtsweg == 'verwaltung'   → Beschwerde öff.-recht. (Art. 82); Art.-83-Katalog
                               (Ausländer/Asyl/Beschaffung …)  → HARD-STOP wenn erfasst
```

**Stufe B · Vorinstanz (Art. 75/80/86) – double instance**
```
istEinzigeInstanz (Art. 5 ZPO)            → BGer direkt (Art. 75 Abs. 2 lit. a)
Handelsgericht (Art. 6 ZPO)               → BGer direkt (Art. 75 Abs. 2 lit. b)
Direktklage ≥ 100'000 + Zustimmung (Art.8)→ BGer direkt (Art. 75 Abs. 2 lit. c)
sonst: obere kantonale Rechtsmittelinstanz erforderlich (Art. 75 Abs. 1/2)
```

**Stufe C · Anfechtungsobjekt (Art. 90–93)**
```
endentscheid / teilentscheid              → zulässig (Art. 90/91)
zwischen_zustaendigkeit_ausstand          → SOFORT zulässig u. NÖTIG (Art. 92; sonst Verwirkung)
zwischen_anderer                          → nur (a) nicht wieder gutzumach. Nachteil
                                            ODER (b) sofortiger Endentscheid (Art. 93)
                                            sonst: erst mit Endentscheid (Abs. 3) → WEICHE
```

**Stufe D · Streitwert/Ausnahmen (Zivil; Art. 74, 51–53)**
```
nicht vermögensrechtlich                  → Streitwertgrenze entfällt → zulässig
schiedsgericht                            → streitwertunabhängig (Art. 77)
vermögensrechtlich:
  schwelle = (arbeit|miete) ? 15'000 : 30'000           [Art. 74 Abs. 1 lit. a/b]
  sw_massgeblich = vor Vorinstanz streitig gebliebene Begehren  [Art. 51 Abs. 1 lit. a]
                   (wiederkehrend → Kapitalwert, unbestimmt = 20× Jahresleistung [Abs. 4];
                    Nebenrechte NICHT [Abs. 3]; Widerklage NICHT addieren [Art. 53])
  sw >= schwelle                          → Beschwerde in Zivilsachen zulässig
  sw <  schwelle:
     Ausnahme Art. 74 Abs. 2 erfüllt?
       lit. a Rechtsfrage grundsätzl. Bed.        → zulässig (WEICHE, Begründung Art. 42 Abs. 2)
       lit. b einzige kant. Instanz               → zulässig (deckt Stufe B lit. a/b)
       lit. c SchKG-Aufsichtsbehörde              → zulässig
       lit. d Konkurs-/Nachlassrichter            → zulässig
       lit. e Bundespatentgericht                 → zulässig
     sonst → ordentl. Beschwerde NICHT zulässig
            → SUBSIDIÄRE VERFASSUNGSBESCHWERDE (Art. 113; nur Verfassungsrügen Art. 116)
            → bei Unsicherheit: gleiche Rechtsschrift (Art. 119)
```
(Straf: keine Streitwertgrenze; Legitimation Art. 81 – Privatklägerschaft nur,
wenn Entscheid Zivilansprüche berührt [Ziff. 5]; StA nicht in Haftsachen [Ziff. 3].)

**Stufe E · Frist (Art. 100) inkl. Stillstand-Ausnahmen (Art. 46)**
```
frist = 30 Tage (Grundsatz, Art. 100 Abs. 1; ab vollständiger Ausfertigung)
  SchKG-Aufsichtsbeschwerde                 → 10 Tage (Art. 100 Abs. 2 lit. a)
  internat. Rechts-/Amtshilfe, HKÜ          → 10 Tage (Abs. 2 lit. b/c)
  Wechselbetreibung (SchKG-Aufsicht)        →  5 Tage (Abs. 3 lit. a)
  Abstimmungen                              →  5 Tage; Nationalratswahl 3 Tage (Abs. 3/4)
  Rechtsverweigerung/-verzögerung           → fristlos (Abs. 7)
stillstand (Art. 46 Abs. 1): Ostern±7 / 15.7.–15.8. / 18.12.–2.1.
  KEIN Stillstand (Abs. 2): vorsorgl. Massnahmen/aufsch. Wirkung (lit. a),
       Wechselbetreibung (lit. b), Stimmrechtssachen (lit. c), internat. Rechts-/
       Amtshilfe (lit. d), öffentl. Beschaffungen (lit. e)
  EHESCHUTZ = vorsorgl. Massnahme → KEIN Stillstand (lit. a) [WEICHE/Warnung, V-1]
fristende Sa/So/Feiertag → nächster Werktag (Art. 45)
gesetzliche Frist NICHT erstreckbar (Art. 47); nur Wiederherstellung (Art. 50, 30 T.)
```

**Stufe F · Kognitions-Hinweis (Art. 95–99)**
```
Grundsatz: Rechtsrügen Art. 95; Sachverhalt nur «offensichtlich unrichtig» (Art. 97)
vorsorgliche Massnahmen / Eheschutz       → NUR Verfassungsrügen (Art. 98)  [WEICHE, V-1]
Verfassungsbeschwerde                      → NUR Verfassungsrügen (Art. 116)
Noven: neue Tatsachen nur ausnahmsweise, neue Begehren unzulässig (Art. 99)
aufschiebende Wirkung: i.d.R. keine (Art. 103); ex lege nur Gestaltungsurteil/
       unbedingte Freiheitsstrafe (Abs. 2 lit. a/b)
```

Alle mit «WEICHE» markierten Knoten sind **Rechtsfragen** (Eingabe-Verantwortung,
offengelegt – §2/§8); alle übrigen sind **deterministisch** aus Eingabe +
Wortlaut ableitbar.

---

## OFFENE FRAGEN FÜR DAVID

1. **Eheschutz/vorsorgliche Massnahmen (V-1):** Soll die Engine bei Eingabe
   «Eheschutz»/«vorsorgliche Massnahme» automatisch (a) den Kognitions-Hinweis
   «nur Verfassungsrügen (Art. 98)» UND (b) «kein Fristenstillstand (Art. 46
   Abs. 2 lit. a)» setzen? Beides beruht auf **Rechtsprechung** (BGE 133 III 393),
   nicht auf dem Wortlaut – Vorschlag: als **Weiche/Warnung** ausgeben, nicht als
   harte Regel. Abnahme nötig.
2. **A-Post-Plus (V-2):** Fristbeginn bei A-Post-Plus (Ablage im Postfach) ist
   Rechtsprechung. Als reiner Hinweis ausweisen oder gar nicht? (Art. 44 deckt
   nur eingeschriebene Post / 7-Tage-Fiktion.)
3. **Streitwert-Kapitalisierung (Art. 51 Abs. 4):** Soll die Engine die
   20×-Jahresleistung deterministisch anbieten (wiederkehrende Leistungen
   unbestimmter Dauer), oder bleibt die Streitwert-Eingabe vollständig
   Nutzer-Sache (wie bei `bestimmeZustaendigkeit`)?
4. **Rechtsfrage grundsätzlicher Bedeutung (Art. 74 Abs. 2 lit. a):** Nur als
   Weiche («kann zulässig sein, Begründung nach Art. 42 Abs. 2») – einverstanden?
   Es gibt keine deterministische Subsumtion.
5. **`strafRechtsmittel.ts`-Hinweistext:** Soll der `BGER_HINWEIS` um die
   Privatkläger-Bedingung (Art. 81 Abs. 1 lit. b Ziff. 5) und die Art.-79-
   Ausnahme (BStGer) ergänzt werden? (Nur Hinweistext, keine Logikänderung –
   §4.) Falls ja, eigener deklarierter Schritt.
6. **Verwaltungs-Rechtsweg (Teil 4):** Der Art.-83-Ausnahmekatalog ist hier nur
   auszugsweise erfasst. Eigene Folgerecherche für die Verwaltungs-Phase, oder
   genügen die Grundzüge vorerst?
7. **Subsidiäre Verfassungsbeschwerde – UI:** Bei `bger = schwelle_verfehlt`
   soll die Engine aktiv auf Art. 113 ff. + die gleiche-Rechtsschrift-Pflicht
   (Art. 119) hinweisen – als nachgelagerter Block analog zum kantonalen Teil?

---

## QUELLENREGISTER (Belege / URLs)

**Primär (Wortlaut, am Cache `/tmp/bgg.html` verbatim verifiziert, Stand 1.1.2025):**
- BGG SR 173.110 – Fedlex konsolidierte Fassung:
  https://www.fedlex.admin.ch/eli/cc/2006/218/de
  - Art. 42 (Rechtsschriften) · Art. 44/45 (Fristbeginn/-ende) · Art. 46
    (Stillstand + Ausnahmen Abs. 2) · Art. 47 (Erstreckung) · Art. 50
    (Wiederherstellung) · Art. 51–53 (Streitwert) · Art. 64 (UR) · Art. 65/66
    (Kosten) · Art. 72–77 (Zivilsachen) · Art. 78–81 (Strafsachen) · Art. 82/83/86
    (öff.-recht.) · Art. 90–93 (End-/Zwischenentscheide) · Art. 95–99 (Kognition/
    Noven) · Art. 100 (Fristen) · Art. 103 (aufschiebende Wirkung) · Art. 113–119
    (Verfassungsbeschwerde).

**Sekundär / [zu verifizieren] (kein Rechtsprechungs-Cache):**
- BGE 133 III 393 – Eheschutzentscheide = vorsorgliche Massnahmen i.S.v. Art. 98
  BGG (Kognition nur Verfassungsrügen; Stillstand-Ausnahme Art. 46 Abs. 2 lit. a).
- BGE 142 III 599 – A-Post-Plus-Zustellung / Fristbeginn.
- BGE 134 III 354 / Botschaft BGG (BBl 2001 4202) – «Rechtsfrage von
  grundsätzlicher Bedeutung» (Art. 74 Abs. 2 lit. a).
- Recherche-Plattformen: https://www.bger.ch (Rechtsprechung),
  https://www.fedlex.admin.ch (Botschaft BGG BBl 2001 4202).

**Anschlussnormen (in bestehenden Dossiers belegt, hier nicht neu verifiziert):**
- ZPO SR 272 Art. 308/319/320/311/321/314/145 – kantonale Rechtsmittelstufe
  (`bibliothek/recherche/zpo-kosten-streitwert.md`).
- SchKG SR 281.1 Art. 19 – kantonale Aufsichtsbeschwerde
  (`bibliothek/recherche/schkg-existenzminimum-vorlagen.md`).
- StPO-Weiterzug: `bibliothek/recherche/stpo-rechtsmittel.md` Teil 3.

---

**ERSTRECHERCHE – fachliche Abnahme durch David ausstehend (§7).** Kein
`verified:true`, kein Deploy ohne Abnahme. Nur dieses Dossier und `INDEX.md`
geändert.
