# SchKG-Zuständigkeiten — Regelwerk (Deep Research)

**Erstellt:** 5.6.2026 · **Wortlaut-Quelle:** Fedlex-Filestore SR 281.1,
konsolidierte Fassung Stand 1.1.2025 (Cache /tmp/schkg.html via
scripts/fedlex-cache.sh) · **Abrufdatum: 5.6.2026**
**Status: Arbeitsgrundlage für den Rechtsweg «SchKG» der Zuständigkeits-
engine — NICHT abgenommen.** Folgeauftrag zu Art. 46 ZPO («soweit das
SchKG keinen Gerichtsstand vorsieht»); ergänzt
[zpo-zustaendigkeit-regelwerk.md](zpo-zustaendigkeit-regelwerk.md).

---

# Abschlussbericht: SchKG-eigene Gerichtsstände und Zuständigkeiten

**Auftrag:** Folgeauftrag zu Art. 46 ZPO («soweit das SchKG keinen Gerichtsstand vorsieht»). Erfassung der SchKG-eigenen Foren/Zuständigkeiten für den Rechtsweg «SchKG» der Zuständigkeitsengine.
**Quelle:** Lokaler Cache `/tmp/schkg.html` (Fedlex-Filestore, SR 281.1, **konsolidierte Fassung Stand 1. Januar 2025**), Anker `id="art_X"` (Art. 85a unter `art_85_a`). Alle Wortlaute wörtlich aus dem amtlichen Volltext. **Abrufdatum: 5.6.2026.**
**Hinweis BGE:** Es werden keine BGE zitiert; reine Gesetzeswiedergabe. Wo Lehre/Praxis nötig wäre (z.B. Doppelnatur der Aberkennungsklage), ist dies als **[Sekundär]** markiert.

**Grundsatz Forum-Zweiteilung:** Das SchKG kennt zwei Entscheidträger — (a) das **Gericht** (am Betreibungs-, Arrest- oder Konkursort) für materiellrechtliche/justizielle Streitigkeiten, und (b) die **Aufsichtsbehörde** (Art. 13 ff.) für die Kontrolle der Amtshandlungen (Verfügungen der Betreibungs-/Konkursämter). Die Beschwerde an die Aufsichtsbehörde ist subsidiär: Art. 17 Abs. 1 schliesst sie aus, «in den Fällen, in denen dieses Gesetz den Weg der gerichtlichen Klage vorschreibt».

---

## 1. Betreibungsort (Art. 46–55 SchKG)

| Art. | Forum / Regel | Wortlaut-Kern |
|---|---|---|
| **46** | **Grundsatz: Wohnsitz** | «Der Schuldner ist an seinem Wohnsitze zu betreiben.» Abs. 2: Im HR eingetragene jur. Personen/Gesellschaften **am Sitz**, nicht eingetragene jur. Personen **am Hauptsitz ihrer Verwaltung**. Abs. 3: Gemeinderschaft am Ort der gemeinsamen wirtschaftl. Tätigkeit. Abs. 4: **Stockwerkeigentümergemeinschaft am Ort der gelegenen Sache.** |
| 47 | — | **Aufgehoben** (seit 1.1.1997). |
| **48** | Aufenthaltsort | «Schuldner, welche keinen festen Wohnsitz haben, können da betrieben werden, wo sie sich aufhalten.» |
| **49** | **Erbschaft** | Solange Teilung/Gemeinderschaft/amtl. Liquidation nicht erfolgt: Betreibung «an dem Ort …, wo der Erblasser zur Zeit seines Todes betrieben werden konnte», in der auf den Verstorbenen anwendbaren Betreibungsart. |
| **50** | **Auslandschuldner mit CH-Niederlassung / Spezialdomizil** | Abs. 1: Für auf Rechnung der CH-Geschäftsniederlassung eingegangene Verbindlichkeiten **am Sitz der Niederlassung**. Abs. 2: Bei gewähltem **Spezialdomizil** zur Erfüllung **am Ort des Spezialdomizils**. |
| **51** | **Pfandverwertung (gelegene Sache)** | Abs. 1 **Faustpfand:** entweder nach Art. 46–50 **oder** am Ort, wo sich das Pfand / dessen wertvollster Teil befindet. Abs. 2 **Grundpfand:** Betreibung **nur** dort, wo das verpfändete Grundstück liegt (bei mehreren Grundstücken: Kreis des wertvollsten Teils). |
| **52** | **Arrest** | «Ist für eine Forderung Arrest gelegt, so kann die Betreibung auch dort eingeleitet werden, wo sich der Arrestgegenstand befindet.» Aber: **Konkursandrohung und Konkurseröffnung nur am ordentlichen Betreibungsort.** |
| **53** | Wohnsitzwechsel | Nach Ankündigung Pfändung / Zustellung Konkursandrohung / ZB Wechselbetreibung → Fortsetzung am **bisherigen Ort**. |
| **54** | Konkurs flüchtiger Schuldner | Konkurseröffnung am **letzten Wohnsitz**. |
| **55** | Einheit des Konkurses | Konkurs gegen denselben Schuldner gleichzeitig **nur an einem Ort**; gilt dort eröffnet, wo zuerst erkannt. |

**Engine-Hinweis:** Betreibungsort ist die Wurzelgrösse — er determiniert das Forum für Rechtsöffnung (84), Aberkennungs- (83 II), Kollokations- (148), Anschluss- (111) und Feststellungsklagen (85/85a). Eingabe: Schuldnertyp (natürlich/jur. Person/Erbschaft/Auslandschuldner) + Pfand-/Arrest-Konstellation → Betreibungsort. **Achtung:** Spezialbetreibungsorte (51, 52) gelten nur für die *Einleitung*; Konkurs nur am ordentlichen Ort (52 Satz 2).

---

## 2. Klagen mit SchKG-eigenem Forum

### Anerkennungsklage – Art. 79
Forum **nicht** im SchKG geregelt (Verweis auf Zivilprozess/Verwaltungsverfahren): «Ein Gläubiger, gegen dessen Betreibung Rechtsvorschlag erhoben worden ist, hat seinen Anspruch im Zivilprozess oder im Verwaltungsverfahren geltend zu machen. Er kann die Fortsetzung … nur aufgrund eines vollstreckbaren Entscheids erwirken, der den Rechtsvorschlag ausdrücklich beseitigt.»
→ **Engine: Forum nach ordentlichen ZPO-Regeln** (Art. 9 ff. ZPO), **kein** SchKG-eigenes Forum. Ordentliches/vereinfachtes Verfahren.

### Aberkennungsklage – Art. 83 Abs. 2 ⚠️ FRIST
«Der Betriebene kann … **innert 20 Tagen nach der Rechtsöffnung** auf dem Weg des **ordentlichen Prozesses beim Gericht des Betreibungsortes** auf Aberkennung der Forderung klagen.»
- **Forum: Gericht des Betreibungsortes** (SchKG-eigen).
- **Frist: 20 Tage** ab Erteilung provisorischer Rechtsöffnung (Verwirkung; Abs. 3: Versäumnis → Rechtsöffnung wird definitiv).
- **Verfahren: ordentlicher Prozess** (negative Feststellungsklage des Schuldners). Abs. 4: Verjährungsstillstand der Frist nach Art. 165 II zwischen Erhebung und Erledigung.

### Rückforderungsklage – Art. 86
- **Forum (Wahlgerichtsstand):** «entweder beim Gerichte des **Betreibungsortes** oder dort, wo der Beklagte seinen **ordentlichen Gerichtsstand** hat» (Abs. 2).
- **Frist: 1 Jahr nach der Zahlung** (Abs. 1), Voraussetzung Rechtsvorschlag unterlassen/durch Rechtsöffnung beseitigt + Zahlung einer Nichtschuld. Abs. 3: kein Erfordernis nach Art. 63 OR ausser Nachweis der Nichtschuld.

### Widerspruchsklage – Art. 106–109 (Foren je Konstellation!)
- **Vorverfahren beim Betreibungsamt:** Art. 106 (Vormerk Drittanspruch), Art. 107 (Gewahrsam Schuldner → Bestreitungsfrist 10 Tage; **Dritter klagt** binnen **20 Tagen**), Art. 108 (Gewahrsam/Mitgewahrsam Dritter → **Gläubiger/Schuldner klagen** binnen **20 Tagen**).
- **Forum Art. 109 (SchKG-eigen, differenziert):**
  - Abs. 1 Ziff. 1: Klagen nach **Art. 107 Abs. 5** → **Gericht des Betreibungsortes**.
  - Abs. 1 Ziff. 2: Klagen nach **Art. 108 Abs. 1**, wenn **Beklagter Wohnsitz im Ausland** → **Gericht des Betreibungsortes**.
  - Abs. 2: Art. 108-Klage gegen Beklagten **mit Wohnsitz in der Schweiz** → **Wohnsitz des Beklagten**.
  - Abs. 3: Bei **Grundstücken in jedem Fall** → Gericht am **Ort des Grundstücks** (wertvollster Teil).
  - Abs. 5: Betreibung bis Erledigung eingestellt; Verwertungsfristen (Art. 116) stehen still.
→ **Engine: Forum hängt von (a) Klagerichtung [107 vs. 108], (b) Wohnsitz des Beklagten CH/Ausland, (c) Objekt Grundstück ja/nein] ab.** Frist 20 Tage durchwegs.

### Kollokationsklage – Art. 148 (Pfändung) / Art. 250 (Konkurs)
- **Art. 148 (Pfändung):** Gläubiger, der Forderung/Rang eines anderen bestreitet, muss **innert 20 Tagen nach Empfang des Auszuges** beim **Gericht des Betreibungsortes** Kollokationsklage erheben.
- **Art. 250 (Konkurs):** **innert 20 Tagen nach öffentlicher Auflage des Kollokationsplanes** beim **Richter am Konkursort** — Abs. 1 gegen die **Masse** (eigene Forderung abgewiesen), Abs. 2 gegen den **anderen Gläubiger** (dessen Zulassung/Rang bestritten).
→ **Engine: Forum je nach Verfahrensart — Pfändung = Betreibungsort, Konkurs = Konkursort.** Frist 20 Tage, je anderer Fristbeginn (Auszug-Empfang vs. öffentliche Auflage).

### Anschlussklage (Pfändungsanschluss) – Art. 111
- Privilegierter Anschluss ohne vorgängige Betreibung **innert 40 Tagen** nach Pfändungsvollzug (Ehegatte/eingetr. Partner, Kinder, Pfründer etc., Abs. 1).
- Abs. 4: Schuldner/Gläubiger können binnen **10 Tagen** bestreiten.
- **Abs. 5: Wird bestritten → provisorische Pfändung; der Ansprecher muss innert 20 Tagen beim Gericht des Betreibungsortes klagen**, sonst fällt Teilnahme dahin.
→ **Engine: Forum Gericht des Betreibungsortes; Frist 20 Tage (Klage), vorgelagert 40 Tage Anschluss / 10 Tage Bestreitung.**

### Arrest – Art. 271–280
- **Art. 271:** Arrestgründe (Ziff. 1–6; u.a. Ziff. 4 Auslandschuldner mit genügendem Bezug/Schuldanerkennung Art. 82 I, Ziff. 5 Verlustschein, Ziff. 6 definitiver Rechtsöffnungstitel).
- **Art. 272 Arrestgericht (Forum):** «Der Arrest wird vom **Gericht am Betreibungsort oder am Ort, wo die Vermögensgegenstände sich befinden**, bewilligt», wenn Gläubiger Forderung, Arrestgrund und Vermögen **glaubhaft** macht (Beweismass: Glaubhaftmachung). **[Sekundär: summarisches Verfahren, Art. 251 lit. a ZPO; einseitig/ohne Anhörung.]**
- **Art. 278 Einsprache ⚠️:** «Wer durch einen Arrest in seinen Rechten betroffen ist, kann **innert zehn Tagen**, nachdem er von dessen Anordnung Kenntnis erhalten hat, **beim Gericht** Einsprache erheben.» Abs. 3: Einspracheentscheid mit **Beschwerde nach ZPO** anfechtbar (neue Tatsachen zulässig). Abs. 4: keine Suspensivwirkung.
- **Art. 279 Prosequierung ⚠️ (mehrere 10-/20-Tage-Fristen):**
  - Abs. 1: Falls noch keine Betreibung/Klage → **innert 10 Tagen nach Zustellung der Arresturkunde** Betreibung einleiten oder Klage einreichen.
  - Abs. 2: Bei Rechtsvorschlag → **innert 10 Tagen** nach Zustellung Gläubigerdoppel ZB Rechtsöffnung verlangen / Anerkennungsklage; bei Abweisung Rechtsöffnung → **10 Tage** nach Eröffnung des Entscheids Klage.
  - Abs. 3: Ohne Rechtsvorschlag → **innert 20 Tagen** Fortsetzungsbegehren.
  - Abs. 4: Bei Klage ohne vorgängige Betreibung → **10 Tage** nach Entscheid Betreibung einleiten.
  - Abs. 5: Fristenstillstand während Einsprache-/Lugano-Vollstreckbarkeitsverfahren.
- **Art. 280 Dahinfallen:** Arrest fällt dahin bei Nichteinhaltung der Fristen (Art. 279), Rückzug/Erlöschen der Klage/Betreibung, oder endgültiger Klageabweisung.
→ **Engine: Forum Arrestbewilligung = Gericht am Betreibungsort ODER Ort der Vermögensgegenstände (Wahl). Einsprache = dasselbe Arrestgericht, Frist 10 Tage. Prosequierung: Fristenwarnung 10/20 Tage je nach Rechtsvorschlag-Konstellation.**

### Anfechtungsklage (paulianische Anfechtung) – Art. 285–292
- **Art. 285:** Zweck (Rückführung entzogener Vermögenswerte); Aktivlegitimation: Pfändungsverlustschein-Gläubiger bzw. Konkursverwaltung / einzelner Gläubiger (Art. 260, 269 III).
- **Arten:** Schenkungsanfechtung **Art. 286** (1 Jahr vor Pfändung/Konkurs); Überschuldungsanfechtung Art. 287 (nicht angefordert); **Absichtsanfechtung Art. 288** (5 Jahre).
- **Art. 289 Forum (SchKG-eigen):** «Die Anfechtungsklage ist beim **Richter am Wohnsitz des Beklagten** einzureichen. Hat der Beklagte keinen Wohnsitz in der Schweiz, so kann die Klage beim **Richter am Ort der Pfändung oder des Konkurses** eingereicht werden.»
- **Art. 292 Verjährung:** Anfechtungsrecht verjährt nach **3 Jahren** (seit Zustellung Pfändungsverlustschein / Konkurseröffnung / Bestätigung Nachlassvertrag).
→ **Engine: Forum = Wohnsitz Beklagter (CH); bei Auslandwohnsitz = Pfändungs-/Konkursort. Verjährungswarnung 3 Jahre.**

### Feststellungsklagen – Art. 85 / 85a (Foren!)
- **Art. 85 (summarisch, urkundlich):** Beweist der Betriebene **durch Urkunden** Tilgung/Stundung, kann er **jederzeit beim Gericht des Betreibungsortes** Aufhebung (Tilgung) bzw. Einstellung (Stundung) der Betreibung verlangen.
- **Art. 85a (negative Feststellungsklage):** «Ungeachtet eines allfälligen Rechtsvorschlages kann der Betriebene **jederzeit vom Gericht des Betreibungsortes** feststellen lassen, dass die Schuld nicht oder nicht mehr besteht oder gestundet ist.» Abs. 2: vorläufige Einstellung bei sehr wahrscheinlicher Begründetheit (Ziff. 1 Pfändung/Pfandverwertung vor Verwertung/Verteilung; Ziff. 2 Konkurs nach Konkursandrohung). Abs. 3: bei Gutheissung Aufhebung/Einstellung der Betreibung.
→ **Engine: Beide Forum = Gericht des Betreibungsortes; Frist «jederzeit». Art. 85 summarisch + Urkundenbeweis, Art. 85a ordentliches/vereinfachtes Verfahren [Sekundär].**

---

## 3. Rechtsöffnung (Art. 80–84)

| Art. | Inhalt |
|---|---|
| **80** | **Definitive Rechtsöffnung** bei vollstreckbarem **gerichtlichem Entscheid**; gleichgestellt (Abs. 2): gerichtl. Vergleiche/Schuldanerkennungen, vollstreckbare öffentliche Urkunden (Art. 347–352 ZPO), Verfügungen schweiz. Verwaltungsbehörden u.a. |
| **81** | Einwendungen gegen definitive RÖ: nur Tilgung/Stundung **durch Urkunden** seit Entscheid oder Verjährung (Abs. 1); bei öffentl. Urkunde weitere sofort beweisbare Einwendungen (Abs. 2); bei ausländischem Entscheid Staatsvertrags-/IPRG-Einwendungen (Abs. 3). |
| **82** | **Provisorische Rechtsöffnung** bei **Schuldanerkennung** (öffentl. Urkunde oder Unterschrift). Erteilung, sofern Betriebener nicht Einwendungen **sofort glaubhaft** macht. |
| **83** | Wirkungen (prov. Pfändung) + **Aberkennungsklage** (siehe Ziff. 2). |
| **84** | **Zuständigkeit & Verfahren:** Abs. 1: «Der **Richter des Betreibungsortes** entscheidet über Gesuche um Rechtsöffnung.» Abs. 2: Betriebener erhält sofort Gelegenheit zur Stellungnahme; Entscheid **innert 5 Tagen**. |

- **Forum:** stets **Richter/Gericht des Betreibungsortes** (Art. 84 Abs. 1).
- **Verfahren:** **summarisch** (Art. 251 lit. a ZPO) **[Sekundär – ergibt sich aus ZPO, nicht aus SchKG-Wortlaut]**; Beweismass für Einwendungen: Glaubhaftmachung (prov. RÖ) bzw. Urkundenbeweis (def. RÖ).
- **Bindungsgrad:** RÖ-Entscheid ist rein betreibungsrechtlich (keine materielle Rechtskraft über den Bestand der Forderung); Korrektur durch Aberkennungs- (83 II) bzw. Anerkennungsklage **[Sekundär]**.
→ **Engine: Eingabe Titel-Typ (gerichtl. Entscheid/Verwaltungsverfügung = definitiv; Schuldanerkennung = provisorisch) → Forum Betreibungsort, summarisch. Bei prov. RÖ Folge-Warnung: Aberkennungsklage 20 Tage.**

---

## 4. Konkurs (Art. 166 ff. / Konkursgericht; Weiterziehung 174)

- **Konkursort:** Das SchKG definiert keinen separaten «Konkursort»-Artikel; das **Konkursgericht ist das Gericht am Betreibungsort** (vgl. Art. 46 ff. i.V.m. Art. 52 Satz 2: Konkurseröffnung nur am ordentlichen Betreibungsort; Art. 54 flüchtiger Schuldner = letzter Wohnsitz; Art. 55 Einheit des Konkurses).
- **Art. 166 Konkursbegehren:** «Nach Ablauf von **20 Tagen** seit Zustellung der Konkursandrohung kann der Gläubiger … **beim Konkursgerichte** das Konkursbegehren stellen.» Abs. 2: Recht erlischt **15 Monate** nach Zustellung des Zahlungsbefehls (Stillstand bei Rechtsvorschlag-Verfahren).
- **Art. 174 Weiterziehung ⚠️:** «Der Entscheid des Konkursgerichtes kann **innert zehn Tagen** mit **Beschwerde nach der ZPO** angefochten werden.» Neue Tatsachen zulässig, wenn vor erstinstanzlichem Entscheid eingetreten (Abs. 1). Abs. 2: Aufhebung der Konkurseröffnung bei glaubhafter Zahlungsfähigkeit + urkundlichem Nachweis (Tilgung / Hinterlegung beim oberen Gericht / Gläubigerverzicht).
→ **Engine: Forum Konkursgericht = Gericht am Betreibungsort. Konkursbegehren: 20 Tage Wartefrist + 15 Monate Erlöschen. Weiterziehung: Beschwerde 10 Tage (ZPO).**

---

## 5. Aufsichtsbehörden (Art. 13 ff.; Beschwerde 17–19) — Abgrenzung Gericht vs. Aufsicht

| Art. | Inhalt |
|---|---|
| **13** | Jeder Kanton bezeichnet eine (kantonale) **Aufsichtsbehörde**; fakultativ **untere** Aufsichtsbehörden für einen/mehrere Kreise. |
| **14** | Jährliche Geschäftsprüfung; Disziplinarmassnahmen (Rüge, Busse bis 1000 Fr., Amtseinstellung ≤ 6 Mt., Amtsentsetzung). |
| **15** | **Oberaufsicht des Bundesrates**; Weisungen an kantonale Aufsichtsbehörden. |
| **16** | Gebührentarif durch Bundesrat. |
| **17** | **Beschwerde an die Aufsichtsbehörde:** «Mit Ausnahme der Fälle, in denen dieses Gesetz den Weg der gerichtlichen Klage vorschreibt, kann gegen jede **Verfügung eines Betreibungs- oder Konkursamtes** … wegen **Gesetzesverletzung oder Unangemessenheit** Beschwerde geführt werden.» **Frist: 10 Tage** seit Kenntnis (Abs. 2). Abs. 3: wegen **Rechtsverweigerung/-verzögerung jederzeit**. Abs. 4: Wiedererwägung durch das Amt bis zur Vernehmlassung. |
| **18** | **Weiterzug an obere kantonale Aufsichtsbehörde** binnen **10 Tagen** nach Eröffnung; Rechtsverweigerung/-verzögerung jederzeit. |
| **19** | **Beschwerde ans Bundesgericht** nach BGG (SR 173.110). |

**Abgrenzung (für Engine zentral):**
- **Aufsichtsbehörde** = Kontrolle von **Amtshandlungen/Verfügungen** der Betreibungs-/Konkursämter (formelles Vollstreckungsrecht; Gesetzesverletzung/Unangemessenheit), Frist **10 Tage**, Instanzenzug **untere → obere kantonale AB → Bundesgericht** (17/18/19).
- **Gericht** (Betreibungs-/Arrest-/Konkursort) = **materiellrechtliche/justizielle** Streitigkeiten (Bestand der Forderung, Drittrechte, Kollokation, Anfechtung, Rechtsöffnung, Arrestbewilligung).
- **Trennlinie:** Art. 17 Abs. 1 selbst — «mit Ausnahme der Fälle, in denen dieses Gesetz den Weg der gerichtlichen Klage vorschreibt».

---

## 6. Synthese-Tabelle für die Zuständigkeitsengine (Rechtsweg «SchKG»)

| Eingabe (Streitgegenstand) | Forum | Eingabe-Art / Verfahren | Frist (⚠️ = Verwirkung/kritisch) |
|---|---|---|---|
| Forderung bestreiten nach Rechtsvorschlag (Gläubiger) | ordentliches ZPO-Forum (kein SchKG-Forum) | Anerkennungsklage, Art. 79 | — |
| Provisorische RÖ erteilt → Schuldner wehrt sich | **Gericht des Betreibungsortes** | Aberkennungsklage, ordentlich, Art. 83 II | ⚠️ **20 Tage** ab RÖ |
| Nichtschuld bezahlt | **Betreibungsort ODER ordentl. GS Beklagter** (Wahl) | Rückforderungsklage, Art. 86 | **1 Jahr** ab Zahlung |
| Drittanspruch, Gewahrsam Schuldner | **Betreibungsort** (Dritter klagt) | Widerspruch Art. 107 V / 109 I Ziff. 1 | ⚠️ **20 Tage** |
| Drittanspruch, Gewahrsam Dritter, Beklagter CH | **Wohnsitz Beklagter** | Widerspruch Art. 108 / 109 II | ⚠️ **20 Tage** |
| Drittanspruch, Gewahrsam Dritter, Beklagter Ausland | **Betreibungsort** | Art. 108 / 109 I Ziff. 2 | ⚠️ **20 Tage** |
| Drittanspruch an Grundstück | **Ort des Grundstücks** | Art. 109 III | ⚠️ **20 Tage** |
| Kollokation in Pfändung | **Betreibungsort** | Kollokationsklage Art. 148 | ⚠️ **20 Tage** (ab Auszug) |
| Kollokation im Konkurs | **Konkursort** | Kollokationsklage Art. 250 | ⚠️ **20 Tage** (ab Auflage) |
| Privilegierter Pfändungsanschluss bestritten | **Betreibungsort** | Klage Art. 111 V | ⚠️ **20 Tage** (Anschluss 40 / Bestreit. 10) |
| Arrest erwirken | **Betreibungsort ODER Ort der Vermögenswerte** (Wahl) | Arrestgesuch Art. 272, summarisch, Glaubhaftmachung | — |
| Arrest anfechten | **Arrestgericht** | Einsprache Art. 278 | ⚠️ **10 Tage** ab Kenntnis |
| Arrest prosequieren | je nach Konstellation | Art. 279 | ⚠️ **10 / 20 Tage** |
| Gläubigerbenachteiligende Rechtshandlung | **Wohnsitz Beklagter** (CH) / **Pfändungs-/Konkursort** (Ausland) | Anfechtungsklage Art. 285–289 | Verjährung **3 Jahre** (292) |
| Schuld getilgt/gestundet (urkundlich) | **Betreibungsort** | Art. 85, summarisch, Urkunden | jederzeit |
| Schuld besteht nicht (Feststellung) | **Betreibungsort** | Art. 85a | jederzeit |
| Rechtsöffnung (prov./def.) | **Betreibungsort** (Art. 84 I) | summarisch (Art. 251 ZPO) | Entscheid in 5 Tagen |
| Konkurseröffnung | **Konkursgericht = Betreibungsort** | Konkursbegehren Art. 166 | 20 Tage Wartefrist / 15 Mt. Erlöschen |
| Konkurseröffnung anfechten | obere Instanz | Beschwerde ZPO, Art. 174 | ⚠️ **10 Tage** |
| Verfügung Betreibungs-/Konkursamt | **Aufsichtsbehörde** (nicht Gericht!) | Beschwerde Art. 17 | ⚠️ **10 Tage** (Rechtsverweig. jederzeit) |

---

## Hinweise zu Qualität / Vorbehalten
- **Wortlaute:** durchwegs verifiziert gegen `/tmp/schkg.html`, konsolidierte Fassung **Stand 1.1.2025** (Cache aktuell). Art. 85a lag unter Anker `art_85_a`.
- **Als [Sekundär] markiert** (nicht im SchKG-Wortlaut, sondern aus ZPO/Lehre): Verfahrensart «summarisch» bei Rechtsöffnung/Arrest/Art. 85 (folgt aus Art. 251 ZPO); Doppelnatur und fehlende materielle Rechtskraft des Rechtsöffnungsentscheids; Charakter der Aberkennungsklage als negative Feststellungsklage.
- **Keine BGE zitiert** (Auftrag: nur belegbar) — der Cache enthält ausschliesslich Gesetzestext.
- **Art. 287** (Überschuldungsanfechtung) wurde nicht eigens extrahiert, da nicht im Auftragskatalog; bei Bedarf vorhanden unter `art_287`.
- Keine Repo-Dateien geändert (reiner Rechercheauftrag).

**Relevante Datei:** `/tmp/schkg.html` (lokaler Fedlex-Cache SR 281.1, Stand 1.1.2025).
