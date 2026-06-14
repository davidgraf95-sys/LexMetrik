# Katalog der Sonderkonstellationen der Schweizer Prozesskosten

**Erstellt:** 14.–15.6.2026 · **Anlass:** Direktive David — Prozesskosten-Cockpit
„alle Sonderkonstellationen miteinbeziehen", „fundierte Recherche zentral".
**Methode:** Ultra-Workflow `wwleump0i` (139 Agenten, 6 Domänen-Lupen +
adversariale Einzel-Verifikation je Konstellation); **104 von 132 Konstellationen
amtlich bestätigt.** Je Eintrag: Klasse (deterministisch/Ermessen/Hinweis) +
Cockpit-Modellierung + Relevanz.
**Status:** Erstrecherche, doppelt verifiziert (Recherche + adversariale
Einzel-Verifikation), normhinterlegt; fachliche Abnahme durch David ausstehend (§7).

*Bezugsrecht: ZPO (SR 272), Konsolidierung 1.1.2025 inkl. Revision BG vom 17.3.2023 (AS 2023 491). Höhen kantonal nach Art. 96 ZPO.*

---

## §1 Streitwert (Bemessungsgrundlage, Art. 85–94a ZPO)

### 1.1 Grundsatz: Streitwert nach Rechtsbegehren
**Norm:** Art. 91 Abs. 1 ZPO.
**Kostenwirkung:** Der Streitwert bestimmt die Bemessungsgrundlage für Gerichtsgebühr (kantonale Streitwerttarife, Art. 96 ZPO) und Parteientschädigung. Zinsen, laufende Verfahrens-/Publikationskosten sowie Eventualbegehren werden NICHT hinzugerechnet. Häufiger Fehler: Mitrechnen aufgelaufener Zinsen.
**Klasse:** deterministisch. **Relevanz:** kern.
**Cockpit-Modellierung:** Eingabe beziffertes Hauptbegehren (CHF), Faktor 1:1. Validierung, dass Zins-/Kostenpositionen nicht einfliessen; Eventualbegehren als separates, streitwertneutrales Feld.

### 1.2 Nicht auf bestimmte Geldsumme lautendes Begehren
**Norm:** Art. 91 Abs. 2 ZPO.
**Kostenwirkung:** Keine berechenbare Kostenbasis aus dem Begehren; das Gericht setzt den Streitwert nach Ermessen fest (sofern keine Parteieinigung / keine offensichtlich unrichtigen Angaben).
**Klasse:** Ermessen. **Relevanz:** kern.
**Cockpit-Modellierung:** Weiche Begehrenstyp «unbeziffert/nicht Geldsumme» → Engine gibt keinen Wert aus (`streitwertVerfahrenCHF`/`kostenBasisCHF = null`), Hinweis «Gericht setzt fest». Umgesetzt in `src/lib/streitwert.ts` (Typ `unbeziffert`).

### 1.3 Wiederkehrende Nutzungen/Leistungen — Kapitalisierung ×20
**Norm:** Art. 92 Abs. 1 und 2 ZPO.
**Kostenwirkung:** Massgeblich ist der Kapitalwert; bei ungewisser/unbeschränkter Dauer der zwanzigfache Jahresbetrag. Kann den Streitwert massiv erhöhen (Renten, Dauerschuldverhältnisse).
**Klasse:** deterministisch. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Eingabe Jahresbetrag, Faktor ×20 in Streitwert und Kostenbasis. Umgesetzt (`dauer='unbestimmt'` → `jahresbetragCHF * 20`).

### 1.4 Leibrente — Streitwert ist der Barwert
**Norm:** Art. 92 Abs. 2 ZPO.
**Kostenwirkung:** Bei Leibrenten gilt nicht ×20, sondern der Barwert (abhängig von Alter/Sterbetafeln/Zinssatz, gesetzlich nicht als Formel vorgegeben).
**Klasse:** Hinweis. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Weiche `dauer='leibrente'`. Engine schätzt nicht; verlangt Barwert als Nutzereingabe (`barwertCHF`); ohne Eingabe Hinweis «Barwert nach Sterbetafeln / gerichtliche Festsetzung». Umgesetzt.

### 1.5 Einfache Streitgenossenschaft / Klagenhäufung — Zusammenrechnung
**Norm:** Art. 93 Abs. 1 ZPO i.V.m. Art. 90 ZPO.
**Kostenwirkung:** Ansprüche werden zusammengerechnet → höhere Bemessungsgrundlage. Schliessen sie sich gegenseitig aus, keine Addition (massgeblich höchster Einzelwert).
**Klasse:** deterministisch. **Relevanz:** kern.
**Cockpit-Modellierung:** Begehren als Liste; Summe aller nicht-ausschliessenden Werte. «Schliessen sich aus» als Nutzer-Ja/Nein (subsumtionsbedürftig) → `Math.max` statt Summe. Umgesetzt (`begehrenSchliessenSichAus`).

### 1.6 Einfache Streitgenossenschaft — Verfahrensart bleibt erhalten
**Norm:** Art. 93 Abs. 2 ZPO.
**Kostenwirkung:** Die Zusammenrechnung erhöht die Kostenbasis, ändert aber nicht die Verfahrensart (vereinfachtes Verfahren bleibt trotz Überschreiten der 30'000-Schwelle). Relevant für verfahrensartabhängige Reduktionen und Vorschussregeln.
**Klasse:** deterministisch. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Kostenbasis = Summe, ABER Verfahrensart-Bestimmung entkoppelt (nicht aus Summenstreitwert ableiten). Im Rechenweg ausweisen.

### 1.7 Widerklage — massgeblicher Streitwert (Verfahren/Rechtsmittel)
**Norm:** Art. 94 Abs. 1 ZPO.
**Kostenwirkung:** Für Verfahrensart und Rechtsmittelzulässigkeit gilt der höhere der beiden Streitwerte (nicht die Summe).
**Klasse:** deterministisch. **Relevanz:** kern.
**Cockpit-Modellierung:** Getrennte Ausgabe `streitwertVerfahrenCHF = max(Klage, Widerklage)`. Umgesetzt.

### 1.8 Widerklage — Kostenbemessung durch Zusammenrechnung
**Norm:** Art. 94 Abs. 2 ZPO.
**Kostenwirkung:** Für die Prozesskosten werden die Streitwerte von Klage und Widerklage zusammengerechnet (höhere Basis als der Verfahrenshöchstwert). Ausnahme: gegenseitiger Ausschluss → keine Addition (h.L.: höchster Wert).
**Klasse:** deterministisch. **Relevanz:** wichtig.
**Cockpit-Modellierung:** `kostenBasisCHF = Klage + Widerklage`; bei `schliesstAus=true` → `max`. Hinweis, dass Massgeblichkeit des höheren Werts bei Ausschluss h.L. ist (zu verifizieren). Abweichung zu Art. 53 BGG (BGer rechnet nicht zusammen). Umgesetzt.

### 1.9 Teilklage als Hauptklage mit Widerklage — nur Streitwert Hauptklage (Rev. 2025)
**Norm:** Art. 94 Abs. 3 ZPO (eingefügt BG 17.3.2023, in Kraft 1.1.2025).
**Kostenwirkung:** Prozesskosten ausschliesslich auf Grundlage des Streitwerts der Hauptklage; die (oft höhere) negative Feststellungs-Widerklage wird nicht hinzugerechnet. Schutz des Teilklägers vor explodierendem Kostenrisiko.
**Klasse:** deterministisch. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Vorschalter «Hauptklage ist Teilklage» (Ja/Nein). Wenn ja: `kostenBasisCHF = Streitwert Hauptklage` (Widerklage ausgeblendet), Verfahrensstreitwert weiterhin nach Abs. 1. Übergangsrecht (Verfahren nach 1.1.2025) zu verifizieren. Umgesetzt (`hauptklageIstTeilklage`).

### 1.10 Teilklage (allgemein) — Kostenbasis ist der eingeklagte Teil
**Norm:** Art. 86 ZPO i.V.m. Art. 91 Abs. 1 ZPO.
**Kostenwirkung:** Bei teilbarem Anspruch ist allein der eingeklagte Teilbetrag massgeblich, nicht der Gesamtanspruch. Senkt Gebühr und Vorschuss; kann Verfahrensart/Rechtsmittelschwelle beeinflussen.
**Klasse:** deterministisch. **Relevanz:** kern.
**Cockpit-Modellierung:** Eingabe Teilbetrag als beziffertes Begehren. Hinweis, dass der Gesamtanspruch für Verfahrenswahl unbeachtlich, für Art. 94 Abs. 3 aber relevant ist.

### 1.11 Unbezifferte Forderungsklage — vorläufiger Streitwert = Mindestwert
**Norm:** Art. 85 ZPO (Abs. 1 Fassung BG 17.3.2023, in Kraft 1.1.2025).
**Kostenwirkung:** Bis zur Bezifferung gilt der anzugebende Mindestwert als vorläufiger Streitwert und Kostenbasis; nach Bezifferung bestimmt der definitive (ggf. höhere) Streitwert die Endkosten. Perpetuatio: angerufenes Gericht bleibt zuständig, auch wenn der Streitwert die sachliche Zuständigkeit später übersteigt.
**Klasse:** deterministisch. **Relevanz:** kern.
**Cockpit-Modellierung:** Eingabe Mindestwert → vorläufige Kostenbasis; Phase-Schalter «vorläufig/beziffert»; Hinweis auf Neuberechnung nach Bezifferung und Zuständigkeitserhalt.

### 1.12 Verbandsklage — Gericht setzt Streitwert nach Ermessen fest (Rev. 2025)
**Norm:** Art. 94a ZPO (eingefügt BG 17.3.2023, in Kraft 1.1.2025) i.V.m. Art. 89 ZPO.
**Kostenwirkung:** Keine streitwertproportionale Basis; Gericht setzt nach Ermessen fest (Interesse der Angehörigen der Personengruppe + Bedeutung des Falls). Korrektur: Art. 94a betrifft die **Verbandsklage**, NICHT die Stufenklage.
**Klasse:** Ermessen. **Relevanz:** rand.
**Cockpit-Modellierung:** Weiche «Verbandsklage» → kein Wert (null), Hinweis «Gericht setzt Streitwert nach Ermessen fest (Art. 94a ZPO)». Als `unbeziffert`-Zweig abgebildet.

### 1.13 Stufenklage — kein eigener Streitwertartikel
**Norm:** Art. 85/91 ZPO; KEINE eigene Norm (insb. nicht Art. 94a).
**Kostenwirkung:** Streitwert folgt der Hauptforderung (unbezifferter Leistungsanspruch); das vorgeschaltete Auskunftsbegehren wird nicht eigenständig kostentreibend addiert. Bemessung weitgehend gerichtliches Ermessen bis zur Bezifferung.
**Klasse:** Hinweis. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Hinweis-Weiche «Stufenklage» → behandeln wie unbezifferte Forderungsklage (Art. 85/91), kein ×20, kein Art. 94a. Praxis (Gesamtinteresse vs. höchster Stufenwert) zu verifizieren.

### 1.14 Nicht vermögensrechtliche / nicht in Geld bestimmbare Streitigkeiten
**Norm:** Art. 91 Abs. 2 ZPO i.V.m. Art. 96 ZPO.
**Kostenwirkung:** Kein Geldstreitwert; Gerichtsgebühr nach kantonalen Sondertarifen (eigene Rahmen/Pauschalen, Bemessung nach Bedeutung/Umfang/Schwierigkeit). Kein streitwertproportionaler Betrag.
**Klasse:** Ermessen. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Weiche «nicht vermögensrechtlich/nicht bestimmbar» → kein Geldstreitwert; Verweis auf kantonalen Rahmen; Engine gibt Spanne/Hinweis statt Punktwert. **Kantonale Varianz: hoch** (jeder Kanton eigener Rahmen).

---

## §2 Verteilung der Prozesskosten (Art. 104–112 ZPO)

### 2.1 Unterliegerprinzip (volles Obsiegen)
**Norm:** Art. 106 Abs. 1 ZPO.
**Kostenwirkung:** Gesamte Prozesskosten zu 100 % zulasten der unterliegenden Partei; Obsiegende trägt 0 % und erhält volle Parteientschädigung.
**Klasse:** deterministisch. **Relevanz:** kern.
**Cockpit-Modellierung:** Eingabe obsiegende Partei → Verteilungsfaktor Sieger 0 % / Verlierer 100 % auf Gerichtskosten und Parteientschädigung.

### 2.2 Fiktion der unterliegenden Partei (Nichteintreten, Rückzug, Anerkennung)
**Norm:** Art. 106 Abs. 1 Satz 2 ZPO.
**Kostenwirkung:** Nichteintreten/Rückzug → Kläger; Anerkennung → Beklagter gilt als unterliegend. Folge 100 %/0 %, vorbehältlich Art. 107.
**Klasse:** deterministisch. **Relevanz:** kern.
**Cockpit-Modellierung:** Vorschalter «Verfahrensausgang» setzt unterliegende Partei automatisch; bei Rückzug/Anerkennung Hinweis auf mögliche Billigkeitskorrektur (Art. 107 Abs. 1 lit. b/e).

### 2.3 Teilweises Obsiegen — Quotelung
**Norm:** Art. 106 Abs. 2 ZPO.
**Kostenwirkung:** Bei teilweisem Obsiegen werden die Kosten nach Ausgang verhältnismässig (Obsiegensquote) verteilt.
**Klasse:** deterministisch. **Relevanz:** kern.
**Cockpit-Modellierung:** Eingabe Obsiegensquote (%) → quotale Verteilung von Gerichtskosten und Saldierung der gegenseitigen Parteientschädigungen. (Aus Art. 106 abgeleitet; durch Art. 107 lit. a überschreibbar.)

### 2.4 Mehrere Parteien / Streitgenossenschaft — Anteil nach Beteiligung
**Norm:** Art. 106 Abs. 3 Satz 1 ZPO.
**Kostenwirkung:** Bei mehreren (Neben-)Parteien interne Aufteilung nach Massgabe der Beteiligung; betrifft Tragung, nicht Gesamtbetrag.
**Klasse:** Ermessen. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Eingabe Anzahl Streitgenossen + Beteiligungsanteile (Default Kopfteile); anpassbare Anteils-Eingabe mit Ermessens-Hinweis.

### 2.5 Solidarische Haftung bei notwendiger Streitgenossenschaft (Rev. 2025)
**Norm:** Art. 106 Abs. 3 Satz 2 ZPO (Fassung ab 1.1.2025).
**Kostenwirkung:** Solidarische Aussenhaftung mehrerer kostenpflichtiger Streitgenossen — seit 2025 nur noch bei NOTWENDIGER Streitgenossenschaft (Einschränkung gegenüber altem Recht).
**Klasse:** Ermessen. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Vorschalter «notwendige Streitgenossenschaft?» → optionale Solidaritäts-Markierung («kann») mit Haftungsmodus-Hinweis; keine Betragsänderung.

### 2.6 Billigkeitsverteilung allgemein (Abweichung vom Unterliegerprinzip)
**Norm:** Art. 107 Abs. 1 Einleitung ZPO.
**Kostenwirkung:** Erlaubt Abweichung von Art. 106; Verteilung nach gerichtlichem Ermessen (Wettschlagung, Auferlegung an obsiegende Partei). Kein berechenbarer Wert.
**Klasse:** Ermessen. **Relevanz:** kern.
**Cockpit-Modellierung:** Dachschalter «Billigkeitskorrektur Art. 107»; bei Aktivierung ersetzt manuell anpassbare Verteilung die deterministische Quote, mit Ermessens-Hinweis und einschlägigen lit.-Tatbeständen.

### 2.7 Billigkeit lit. a — grundsätzlich, nicht in voller Höhe gutgeheissen
**Norm:** Art. 107 Abs. 1 lit. a ZPO.
**Kostenwirkung:** Trotz teilweisen Unterliegens (zu hohe Bezifferung bei ermessensabhängiger/schwierig bezifferbarer Höhe) können dem grundsätzlich obsiegenden Kläger die Kosten erlassen / voll der Gegenpartei auferlegt werden; verhindert Quotelung nach Art. 106 Abs. 2.
**Klasse:** Ermessen. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Checkbox-Tatbestand unter Art. 107; überschreibt Streitwert-Quote durch Ermessensverteilung (Default «voll zulasten Gegenpartei») + Hinweis.

### 2.8 Billigkeit lit. b — gutgläubige Veranlassung zur Prozessführung
**Norm:** Art. 107 Abs. 1 lit. b ZPO.
**Kostenwirkung:** Kosten der gutgläubig (an sich unterliegenden) Partei können erlassen oder der Gegenpartei auferlegt werden.
**Klasse:** Ermessen. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Checkbox-Tatbestand → Ermessensverteilung mit Hinweis; keine fixe Berechnung.

### 2.9 Billigkeit lit. c — familienrechtliche Verfahren
**Norm:** Art. 107 Abs. 1 lit. c ZPO.
**Kostenwirkung:** Freie Verteilung (häufig hälftige Teilung / Wettschlagung) unabhängig vom Obsiegen.
**Klasse:** Ermessen. **Relevanz:** kern.
**Cockpit-Modellierung:** Vorschalter «Verfahrenstyp = Familienrecht» aktiviert Art.-107-Ermessensmodus automatisch (Default z.B. hälftige Teilung / keine Parteientschädigung); kombinierbar mit lit. f (Kinderbelange).

### 2.10 Billigkeit lit. d — eingetragene Partnerschaft
**Norm:** Art. 107 Abs. 1 lit. d ZPO.
**Kostenwirkung:** Freie Billigkeitsverteilung wie Familienrecht.
**Klasse:** Ermessen. **Relevanz:** rand.
**Cockpit-Modellierung:** Vorschalter «eingetragene Partnerschaft» aktiviert Ermessensmodus analog lit. c.

### 2.11 Billigkeit lit. e — gegenstandslos abgeschriebenes Verfahren
**Norm:** Art. 107 Abs. 1 lit. e ZPO.
**Kostenwirkung:** Bei Gegenstandslosigkeit Verteilung nach Ermessen (mutmasslicher Prozessausgang / Verursachung) statt nach Art. 106.
**Klasse:** Ermessen. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Vorschalter «gegenstandslos abgeschrieben» → Ermessensmodus; Default-Verteilung manuell wählbar.

### 2.12 Billigkeit lit. f — andere besondere Umstände (Auffangtatbestand)
**Norm:** Art. 107 Abs. 1 lit. f ZPO.
**Kostenwirkung:** Ermessensverteilung bei sonstiger Unbilligkeit; nicht im Voraus bezifferbar.
**Klasse:** Ermessen. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Freitext-/Checkbox-Auffangtatbestand → manuelle Verteilung mit Begründungs-Hinweis.

### 2.13 Nicht veranlasste Gerichtskosten zulasten Kanton
**Norm:** Art. 107 Abs. 2 ZPO.
**Kostenwirkung:** Nicht von Partei/Dritten veranlasste Gerichtskosten können aus Billigkeit dem Kanton auferlegt werden; nur Gerichtskosten, nicht Parteientschädigung.
**Klasse:** Ermessen. **Relevanz:** rand.
**Cockpit-Modellierung:** Checkbox «nicht veranlasste Gerichtskosten → Kanton» reduziert die parteienseitig verteilte Basis um den eingegebenen Betrag («kann»-Hinweis).

### 2.14 Unnötige Prozesskosten — Verursacherprinzip
**Norm:** Art. 108 ZPO.
**Kostenwirkung:** Unnötige Kosten (trölerisches Verhalten, vertane Verhandlungen) trägt der Verursacher — auch eine obsiegende Partei oder ein Dritter (kein Verschulden nötig).
**Klasse:** Ermessen. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Sonderposten «unnötige Kosten» mit Betrag + Verursacher-Zuordnung (A/B/Dritter); wird vor der Hauptverteilung zugewiesen. Beurteilung der «Unnötigkeit» ist Ermessen → Hinweis.

### 2.15 Vergleich ohne / unzulässige Kostenregelung → Art. 106–108
**Norm:** Art. 109 Abs. 2 lit. a–b ZPO.
**Kostenwirkung:** Fehlt eine Kostenregelung oder belastet sie eine UR-Partei einseitig, greift die gesetzliche Verteilung nach Art. 106–108.
**Klasse:** Hinweis. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Fallback auf Art.-106-Mechanismus (mutmasslicher Ausgang); UR-Schutz (lit. b) als Vorschalter, der einseitige UR-Belastung sperrt.

### 2.16 Zeitpunkt des Kostenentscheids
**Norm:** Art. 104 Abs. 1–4 ZPO.
**Kostenwirkung:** Endentscheid (Abs. 1); Zwischenentscheid Art. 237 (Abs. 2); vorsorgliche Massnahmen mit der Hauptsache (Abs. 3); Rückweisung — obere Instanz kann Verteilung der Rechtsmittelkosten der Vorinstanz überlassen (Abs. 4).
**Klasse:** Hinweis. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Kontext-Vorschalter «Entscheidtyp»; bei Rückweisung Hinweis, dass Verteilung der Vorinstanz vorbehalten sein kann → keine abschliessende Berechnung.

### 2.17 Festsetzung von Amtes wegen; Parteientschädigung nach Tarif/Kostennote
**Norm:** Art. 105 Abs. 1–2 ZPO i.V.m. Art. 96 ZPO.
**Kostenwirkung:** Gerichtskosten von Amtes wegen verteilt; Parteientschädigung nur auf Antrag/nach Tarif, Höhe nach kantonalem Tarif oder Kostennote.
**Klasse:** Hinweis. **Relevanz:** kern.
**Cockpit-Modellierung:** Strukturhinweis: Gerichtskosten automatisch; Parteientschädigung nur bei Antrag, Höhe aus Tarif-Domäne (Art. 96) — Verweis auf Tarif-Vorschalter + Kostennote-Eingabe. **Kantonale Varianz** bei Parteientschädigungshöhe.

### 2.18 Anfechtung des Kostenentscheids nur mit Beschwerde
**Norm:** Art. 110 ZPO.
**Kostenwirkung:** Isoliert (ohne Hauptsache) angefochtener Kostenentscheid nur mit Beschwerde (Art. 319 ff.); keine Bezifferungswirkung.
**Klasse:** Hinweis. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Reiner Rechtsmittel-Hinweis (kein Rechenfaktor).

### 2.19 Liquidation: Verrechnung, Rückerstattung, Nachforderung (Rev. 2025)
**Norm:** Art. 111 Abs. 1 ZPO (Fassung ab 1.1.2025).
**Kostenwirkung:** Leistet die kostenpflichtige Partei selbst den Vorschuss → Verrechnung; sonst Rückerstattung; Fehlbetrag wird bei der kostenpflichtigen Partei nachgefordert. Neue Fassung entlastet die obsiegende vorschiessende Partei vom Inkassorisiko gegenüber dem Staat.
**Klasse:** deterministisch. **Relevanz:** kern.
**Cockpit-Modellierung:** Liquidationsblock: Eingabe geleistete Vorschüsse je Partei + verteilte Gerichtskosten → automatische Verrechnung/Rückerstattung/Nachforderung; Output Saldo je Partei gegenüber Gericht. Versionsweiche alt/neu (Stichtag 1.1.2025).

### 2.20 Liquidation: Parteientschädigung direkt geschuldet
**Norm:** Art. 111 Abs. 2 ZPO.
**Kostenwirkung:** Parteientschädigung fliesst direkt zwischen den Parteien (nicht über das Gericht); Inkassorisiko trägt die berechtigte Partei.
**Klasse:** deterministisch. **Relevanz:** kern.
**Cockpit-Modellierung:** Output-Posten «geschuldete Parteientschädigung» mit Richtung (kostenpflichtig → obsiegend); bei Quotelung Saldierung der gegenseitigen Entschädigungen.

### 2.21 Liquidation: Vorbehalt der unentgeltlichen Rechtspflege
**Norm:** Art. 111 Abs. 3 ZPO i.V.m. Art. 117 ff. ZPO.
**Kostenwirkung:** Bei bewilligter UR modifizieren deren Regeln die Liquidation (Befreiung Vorschuss/Gerichtskosten, Nachzahlung Art. 123).
**Klasse:** Hinweis. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Vorschalter «UR bewilligt (A/B)» setzt UR-Sonderregeln; Hinweis auf abweichende Liquidation (Art. 117 ff., insb. Art. 123) → Verweis auf UR-Domäne.

### 2.22 Stundung / Erlass bei Mittellosigkeit
**Norm:** Art. 112 Abs. 1 ZPO.
**Kostenwirkung:** Gerichtskosten können gestundet oder bei dauernder Mittellosigkeit erlassen werden → reduziert/verschiebt effektive Last; nur Gerichtskosten.
**Klasse:** Ermessen. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Vollzugs-Schalter «Stundung/Erlass» («kann», dauernde Mittellosigkeit nötig); keine Verteilungsänderung, sondern Vollzugshinweis.

### 2.23 Verjährung und Verzugszins der Gerichtskostenforderung
**Norm:** Art. 112 Abs. 2 und 3 ZPO.
**Kostenwirkung:** Verjährung 10 Jahre nach Verfahrensabschluss; Verzugszins 5 %. Beeinflusst durchsetzbare Höhe über die Zeit, nicht die Verteilung.
**Klasse:** deterministisch. **Relevanz:** rand.
**Cockpit-Modellierung:** Optionaler Zins-/Verjährungsrechner: Abschlussdatum + Zahlungsdatum → 5 % p.a. + Verjährungsanzeige. Nachgelagerter Posten.

---

## §3 Kostenlosigkeit und unentgeltliche Rechtspflege (Art. 99, 113–123 ZPO)

### 3.1 Schlichtungsverfahren: keine Parteientschädigung
**Norm:** Art. 113 Abs. 1 ZPO.
**Kostenwirkung:** Im Schlichtungsverfahren grundsätzlich keine Parteientschädigung (Ausnahme: UR-Rechtsbeistand durch Kanton entschädigt).
**Klasse:** deterministisch. **Relevanz:** kern.
**Cockpit-Modellierung:** Vorschalter «Schlichtung» → Parteientschädigung = 0; Hinweis Sonderfall UR-Beistand.

### 3.2 Schlichtungsverfahren: kostenlose Sachgebiete (keine Gerichtskosten)
**Norm:** Art. 113 Abs. 2 lit. a–g ZPO.
**Kostenwirkung:** Keine Gerichtskosten bei GlG (a), BehiG (b), Miete/Pacht Wohn-/Geschäftsräume + landw. Pacht (c, streitwertunabhängig), Arbeit/AVG bis CHF 30'000 (d), Mitwirkung (e), KVG-Zusatzversicherung (f), DSG (g).
**Klasse:** deterministisch. **Relevanz:** kern.
**Cockpit-Modellierung:** Vorschalter Sachgebiet-Dropdown (lit. a–g) + Streitwertschwelle 30'000 bei lit. d → Gerichtskosten = 0 in der Schlichtung.

### 3.3 Entscheidverfahren: kostenlose Sachgebiete (keine Gerichtskosten)
**Norm:** Art. 114 lit. a–g ZPO.
**Kostenwirkung:** Keine Gerichtskosten bei GlG (a), BehiG (b), Arbeit/AVG bis CHF 30'000 (c), Mitwirkung (d), KVG-Zusatzversicherung (e), Gewaltschutz Art. 28b/28c ZGB (f), DSG (g). **Wichtig: Miete/Pacht fehlt — im Entscheidverfahren NICHT generell kostenlos.**
**Klasse:** deterministisch. **Relevanz:** kern.
**Cockpit-Modellierung:** Vorschalter Sachgebiet (lit. a–g) + Schwelle 30'000 bei lit. c → Gerichtskosten = 0; Asymmetrie-Hinweis Miete/Pacht nur in Schlichtung.

### 3.4 Streitwertschwelle CHF 30'000 (Arbeit/AVG)
**Norm:** Art. 113 Abs. 2 lit. d / Art. 114 lit. c ZPO.
**Kostenwirkung:** Kostenlosigkeit nur bis Streitwert CHF 30'000; darüber ordentliche Gerichtskosten nach kantonalem Tarif. Betragsgenaue Schwelle.
**Klasse:** deterministisch. **Relevanz:** kern.
**Cockpit-Modellierung:** Eingabe Streitwert; wenn ≤ 30'000 und Arbeit/AVG → Gerichtskosten = 0; sonst Tarif. Harte Grenze (knapp darüber = volle Kosten).

### 3.5 Gewaltschutz Art. 28b/28c ZGB: Kostenlosigkeit nur im Entscheidverfahren
**Norm:** Art. 114 lit. f ZPO.
**Kostenwirkung:** Keine Gerichtskosten im Entscheidverfahren bei Gewalt/Drohung/Nachstellung bzw. elektronischer Überwachung. Privileg nicht im Schlichtungskatalog (Art. 113 enthält kein lit. f).
**Klasse:** deterministisch. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Vorschalter «Gewaltschutz Art. 28b/28c» → Gerichtskosten = 0 (Entscheidverfahren), Wechselwirkung mit Art. 115 Abs. 2.

### 3.6 Kostentragung trotz Kostenlosigkeit bei bös-/mutwilliger Prozessführung
**Norm:** Art. 115 Abs. 1 ZPO.
**Kostenwirkung:** Bei bös-/mutwilliger Prozessführung können Gerichtskosten auch in unentgeltlichen Verfahren (Art. 113/114) auferlegt werden. Durchbricht Kostenlosigkeit; Höhe nach kantonalem Tarif.
**Klasse:** Ermessen. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Globaler Override-Schalter «Bös-/Mutwilligkeit?» → hebt Kostenlosigkeit auf; Höhe nach Tarif. Default aus, mit Begründungs-Hinweis.

### 3.7 Kostenauflage an unterliegende Partei bei Gewaltschutz-Verbot/Überwachung
**Norm:** Art. 115 Abs. 2 ZPO.
**Kostenwirkung:** Bei Art. 114 lit. f können Gerichtskosten der unterliegenden Partei auferlegt werden, wenn gegen sie ein Verbot (Art. 28b) oder eine Überwachung (Art. 28c) angeordnet wird. Verlagert Risiko vom Opfer auf den Täter.
**Klasse:** Ermessen. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Schalter gekoppelt an Gewaltschutz + Ausgang «Verbot/Überwachung angeordnet» → Kann-Auferlegung (Default 0, Spanne bis volle Gerichtskosten) mit Hinweis.

### 3.8 Weitere kantonale Kostenbefreiungen (Öffnungsklausel)
**Norm:** Art. 116 Abs. 1 ZPO.
**Kostenwirkung:** Kantone können über den Bundeskatalog hinaus weitere Befreiungen gewähren. Nicht bundeseinheitlich bezifferbar.
**Klasse:** Hinweis. **Relevanz:** rand.
**Cockpit-Modellierung:** Kantonsspezifischer Hinweis/Vorschalter, sobald die jeweilige Regelung erfasst ist. **Kantonale Varianz: hoch.**

### 3.9 UR: Anspruchsvoraussetzungen (Bedürftigkeit + Erfolgsaussicht)
**Norm:** Art. 117 lit. a–b ZPO.
**Kostenwirkung:** UR-Anspruch bei fehlenden Mitteln UND nicht aussichtslosem Rechtsbegehren. Beide Voraussetzungen wertend.
**Klasse:** Ermessen. **Relevanz:** kern.
**Cockpit-Modellierung:** Vorschalter UR mit zwei Prüfkriterien; Bedürftigkeit teilberechenbar (Einkommen/Vermögen/Existenzminimum), Aussichtslosigkeit als wertender Hinweis. Aktiviert UR-Wirkungen (Art. 118). **Bedürftigkeitsberechnung kantonal/gerichtlich geprägt.**

### 3.10 UR: teilweise Gewährung und vorsorgliche Beweisführung (Rev. 2025)
**Norm:** Art. 118 Abs. 2 ZPO.
**Kostenwirkung:** UR ganz oder teilweise; seit 1.1.2025 auch für vorsorgliche Beweisführung.
**Klasse:** Ermessen. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Schalter «UR teilweise» (Quote/Umfang) + Option «auch vorsorgliche Beweisführung»; reduziert Befreiungsumfang anteilig.

### 3.11 UR befreit NICHT von Parteientschädigung an Gegenpartei
**Norm:** Art. 118 Abs. 3 ZPO.
**Kostenwirkung:** Trotz UR bleibt die unterliegende UR-Partei der Gegenpartei gegenüber parteientschädigungspflichtig (vgl. Art. 122 Abs. 1 lit. d).
**Klasse:** deterministisch. **Relevanz:** kern.
**Cockpit-Modellierung:** Feste Regel: UR setzt Parteientschädigungspflicht gegenüber Gegenpartei NICHT auf 0; Hinweis.

### 3.12 UR: keine Gerichtskosten im Gesuchsverfahren
**Norm:** Art. 119 Abs. 6 ZPO.
**Kostenwirkung:** Ausser bei Bös-/Mutwilligkeit ist das UR-Gesuchsverfahren selbst kostenlos.
**Klasse:** deterministisch. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Regel: Gerichtskosten UR-Gesuchsverfahren = 0 (Ausnahme Bös-/Mutwilligkeit → Override, vgl. Art. 115 Abs. 1).

### 3.13 UR: Neuantrag im Rechtsmittelverfahren / rückwirkende Bewilligung
**Norm:** Art. 119 Abs. 4 und 5 ZPO.
**Kostenwirkung:** Rückwirkende Bewilligung nur ausnahmsweise (Abs. 4); im Rechtsmittelverfahren UR neu zu beantragen (Abs. 5). UR gilt nicht automatisch für die Rechtsmittelinstanz.
**Klasse:** Hinweis. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Hinweis: UR pro Instanz separat beantragen; steuert Geltungsbereich der UR-Faktoren je Instanz.

### 3.14 Entzug der UR
**Norm:** Art. 120 ZPO.
**Kostenwirkung:** Gericht entzieht UR, wenn Anspruch nicht mehr/nie bestanden hat; UR-Befreiungen fallen (rückwirkend) weg.
**Klasse:** Hinweis. **Relevanz:** rand.
**Cockpit-Modellierung:** Schalter «UR entzogen» → hebt UR-Faktoren auf, reaktiviert ordentliche Kostenfolgen. Voraussetzungsprüfung gerichtlich.

### 3.15 Liquidation bei Unterliegen der UR-Partei
**Norm:** Art. 122 Abs. 1 lit. a–d ZPO.
**Kostenwirkung:** Rechtsbeistand vom Kanton entschädigt (a); Gerichtskosten zulasten Kanton (b); geleistete Vorschüsse der Gegenpartei zurückerstattet (c); UR-Partei schuldet der Gegenpartei die Parteientschädigung (d).
**Klasse:** deterministisch. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Verteilungsregel für «UR-Partei unterliegt»: Gerichtskosten → Kanton; Parteientschädigung → von UR-Partei an Gegenpartei. **Höhen Rechtsbeistand/Parteientschädigung kantonal.**

### 3.16 Nachzahlungspflicht der UR-Partei
**Norm:** Art. 123 Abs. 1 und 2 ZPO.
**Kostenwirkung:** UR-Partei nachzahlungspflichtig, sobald in der Lage; Anspruch des Kantons verjährt 10 Jahre nach Verfahrensabschluss. UR = nur vorläufige Befreiung.
**Klasse:** Hinweis. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Hinweis: UR = vorläufige Stundung, Nachzahlung bei Leistungsfähigkeit, Verjährung 10 Jahre (fixer Hinweiswert). Zeitpunkt nicht vorab berechenbar.

### 3.17 Sicherheit für die Parteientschädigung (Kautionsgründe)
**Norm:** Art. 99 Abs. 1 lit. a–d ZPO.
**Kostenwirkung:** Klagende Partei leistet auf Antrag Sicherheit, wenn: kein Wohnsitz/Sitz CH (a); Zahlungsunfähigkeit/Konkurs/Verlustscheine (b); Prozesskostenschulden aus früheren Verfahren (c); erhebliche Gefährdung aus anderen Gründen (d).
**Klasse:** Ermessen. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Vorschalter «Kautionsantrag» mit Kriterien a–d (a–c relativ klar, d wertend) → löst Sicherheitsleistung aus (Höhe = Parteientschädigung, Art. 100/Tarif). **Höhe kantonal.**

### 3.18 Sicherheit bei notwendiger Streitgenossenschaft
**Norm:** Art. 99 Abs. 2 ZPO.
**Kostenwirkung:** Sicherheit nur, wenn bei ALLEN Streitgenossen ein Kautionsgrund vorliegt.
**Klasse:** deterministisch. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Logischer UND-Schalter über alle Streitgenossen.

### 3.19 Keine Sicherheit (Ausnahmen nach Verfahrensart)
**Norm:** Art. 99 Abs. 3 lit. a–d ZPO.
**Kostenwirkung:** Keine Sicherheit im vereinfachten Verfahren (ausser vermögensrechtlich nach Art. 243 Abs. 1, lit. a), im Scheidungsverfahren (b), im summarischen Verfahren (ausser Rechtsschutz in klaren Fällen Art. 257, c), in DSG-Streitigkeiten (d).
**Klasse:** deterministisch. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Vorschalter Verfahrensart → sperrt Sicherheitsleistung mit Rückausnahmen (Art. 243 Abs. 1, Art. 257), ableitbar aus Verfahrenstyp + Streitgegenstand.

---

## §4 Verfahren und Instanz (Art. 4–8, 95–96, 148, 209–212, 248–265, 308–334 ZPO)

### 4.1 Schlichtung: Pauschale als Gerichtskosten
**Norm:** Art. 95 Abs. 2 lit. a i.V.m. Art. 96 ZPO.
**Kostenwirkung:** In der Schlichtung fällt nur die kantonal tarifierte Pauschale an (kein Entscheidgebühren-/Beweistarif).
**Klasse:** Ermessen (Höhe). **Relevanz:** kern.
**Cockpit-Modellierung:** Vorschalter «Phase = Schlichtung» schaltet auf kantonalen Schlichtungspauschalen-Tarif (Spanne). Eingabe Kanton + Streitwert. **Kantonale Varianz** (Höhe).

### 4.2 Schlichtung: keine Parteientschädigung
**Norm:** Art. 113 Abs. 1 ZPO.
**Kostenwirkung:** Parteientschädigung ausgeschlossen (Ausnahme UR-Beistand).
**Klasse:** deterministisch. **Relevanz:** kern.
**Cockpit-Modellierung:** Hartregel Phase = Schlichtung → Parteientschädigung = 0. *(Dublette zu 3.1; einheitlich führen.)*

### 4.3 Schlichtung: kostenlose Streitsachen
**Norm:** Art. 113 Abs. 2 ZPO.
**Kostenwirkung:** In den aufgezählten Materien keine Gerichtskosten → auch keine Schlichtungspauschale.
**Klasse:** deterministisch. **Relevanz:** kern.
**Cockpit-Modellierung:** Vorschalter Materie in Phase Schlichtung → Gerichtskosten = 0; 30k-Schwelle nur bei Arbeit. *(Vgl. 3.2.)*

### 4.4 Schlichtungsbehörde: Entscheidvorschlag (Urteilsvorschlag)
**Norm:** Art. 210 i.V.m. Art. 211 ZPO.
**Kostenwirkung:** Bei Nichtablehnung innert 20 Tagen rechtskräftiger Entscheid; es bleibt bei den Schlichtungskosten, kein Hauptprozess-Entscheidgebührentarif. Anwendbar in GlG-/Miet-/Pachtsachen und übrigen vermögensrechtlichen Streitigkeiten bis CHF 10'000.
**Klasse:** Hinweis. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Szenario-/Hinweis-Pfad «Entscheidvorschlag angenommen → kein Hauptprozesskostenanfall» (Schwellen 10k bzw. Miete/Pacht/GlG). Keine eigenständige Bezifferung.

### 4.5 Schlichtungsbehörde: Entscheid bei Streitwert bis CHF 2000
**Norm:** Art. 212 ZPO (Festlegungskompetenz neu seit 1.1.2025).
**Kostenwirkung:** Bei Antrag und Streitwert ≤ CHF 2000 materieller Entscheid; die Schlichtungsbehörde legt Gerichtskosten UND Parteientschädigung fest (Abweichung von Art. 113 Abs. 1 — Parteientschädigung hier möglich).
**Klasse:** Hinweis. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Vorschalter «Schlichtungsentscheid Art. 212 (SW ≤ 2000 + Antrag)» → Gerichtskosten + Parteientschädigung nach kantonalem Tarif (Spanne) statt Art.-113-Nullregel. **Höhe kantonal.**

### 4.6 Schlichtung: Klagebewilligung und Kostenverfügung
**Norm:** Art. 209 Abs. 2 lit. d ZPO.
**Kostenwirkung:** Mit der Klagebewilligung wird über die Schlichtungskosten verfügt; sie werden Teil der Gesamtprozesskosten und im Folgeprozess zugeschlagen.
**Klasse:** Hinweis. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Hinweis zur Kostenkumulation Schlichtung → Hauptverfahren.

### 4.7 Kostentragung trotz Kostenfreiheit bei bös-/mutwilliger Prozessführung
**Norm:** Art. 115 ZPO.
**Kostenwirkung:** Durchbricht die Kostenfreiheit nach Art. 113/114 (Abs. 1 Bös-/Mutwilligkeit; Abs. 2 Gewaltschutz-Verbot).
**Klasse:** Hinweis/Ermessen. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Risikoflag «Kostenfreiheit kann entfallen (Art. 115)». *(Vgl. 3.6/3.7.)*

### 4.8 Summarisches Verfahren: vorsorgliche Massnahmen
**Norm:** Art. 248 lit. d i.V.m. Art. 261 ZPO.
**Kostenwirkung:** Eigenes summarisches Massnahmeverfahren mit eigener Kosten-/Entschädigungsfolge, separat vom Hauptverfahren (Kosten oft zur Hauptsache geschlagen).
**Klasse:** Ermessen. **Relevanz:** kern.
**Cockpit-Modellierung:** Eigener Verfahrensblock «vorsorgliche Massnahme» mit summarischem Tarif (Spanne) + separater Verteilung; verknüpfbar mit Hauptverfahren. **Höhe kantonal.**

### 4.9 Superprovisorische Massnahme
**Norm:** Art. 265 ZPO.
**Kostenwirkung:** Unterfall der vorsorglichen Massnahme ohne vorherige Anhörung; Kostenfolge im nachträglichen kontradiktorischen Entscheid.
**Klasse:** Hinweis. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Unterfall des Massnahmeblocks; Kosten im nachfolgenden Massnahmeentscheid festgelegt. Nicht separat bezifferbar.

### 4.10 Summarisches Verfahren: SchKG-Summarsachen
**Norm:** Art. 251 ZPO; GebV SchKG (SR 281.35).
**Kostenwirkung:** SchKG-Summarsachen (insb. Rechtsöffnung) laufen summarisch; Gebühren teils nach GebV SchKG, teils kantonaler Summartarif. Schlichtung entfällt (Art. 198 lit. a).
**Klasse:** Ermessen. **Relevanz:** kern.
**Cockpit-Modellierung:** Vorschalter «SchKG-Summarsache (Art. 251)» → Summartarif bzw. bei Rechtsöffnung GebV SchKG (Spanne). **Gebühr teils bundesrechtlich (GebV SchKG), teils kantonal.**

### 4.11 Einzige kantonale Instanz (IP, Kartell, UWG u.a.)
**Norm:** Art. 5 ZPO; BGG (SR 173.110) Art. 75 Abs. 2 lit. a.
**Kostenwirkung:** Kein doppelter kantonaler Instanzenzug; Rechtsmittel direkt ans Bundesgericht. Kantonale Berufung/Beschwerde (Art. 308/319) entfällt; nächster Kostenblock = BGer-Beschwerde (ausserhalb ZPO-Tarif).
**Klasse:** Hinweis. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Vorschalter «einzige kantonale Instanz (Art. 5)» → kantonale Rechtsmittelblöcke deaktiviert, Rechtsmittelpfad = BGer (BGG-Tarif, eigene Domäne).

### 4.12 Handelsgericht als einzige kantonale Instanz (ZH/BE/AG/SG)
**Norm:** Art. 6 ZPO; BGG Art. 75 Abs. 2 lit. b.
**Kostenwirkung:** Handelsgerichtsentscheid → einzige kantonale Instanz, keine kantonale Berufung/Beschwerde; Rechtsmittel direkt ans BGer.
**Klasse:** Hinweis. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Vorschalter «Handelsgericht (Art. 6)» → nur ZH, BE, AG, SG; kantonale Rechtsmittelblöcke deaktiviert → BGer. **Kantonale Varianz: nur 4 Kantone führen ein HG.**

### 4.13 Gericht bei Zusatzversicherungen zur sozialen KV
**Norm:** Art. 7 ZPO i.V.m. Art. 114 lit. e und Art. 198 lit. f ZPO.
**Kostenwirkung:** Wird ein solches Gericht als einzige Instanz bezeichnet: kein doppelter Instanzenzug, Schlichtung entfällt, im Entscheidverfahren keine Gerichtskosten.
**Klasse:** Hinweis. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Vorschalter «Zusatzversicherung KVG, einzige Instanz Art. 7» → Schlichtung aus, kantonale Rechtsmittel aus (BGer), Gerichtskosten = 0. **Kantonale Kann-Vorschrift.**

### 4.14 Direkte Klage beim oberen Gericht (Streitwert ≥ CHF 100'000)
**Norm:** Art. 8 ZPO (Abs. 2 Zweitsatz in Kraft seit 1.1.2025).
**Kostenwirkung:** Mit Zustimmung der Gegenpartei und SW ≥ 100k entscheidet das obere Gericht als einzige kantonale Instanz → keine kantonale Berufung/Beschwerde; Rechtsmittel direkt ans BGer.
**Klasse:** Hinweis. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Vorschalter «Direktklage Art. 8 (SW ≥ 100k + Zustimmung)» → kantonale Rechtsmittel deaktiviert, Pfad BGer.

### 4.15 Sachliche/funktionelle Zuständigkeit kantonal; Streitwertberechnung bundesrechtlich
**Norm:** Art. 4 ZPO.
**Kostenwirkung:** Steuert die zuständige Instanz und damit indirekt den Gebührentarif; Streitwertberechnung erfolgt nach ZPO (Art. 91 ff.).
**Klasse:** Hinweis. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Grundlagen-Hinweis: Spruchkörper/Instanz nach kantonalem Recht → Tarifwahl; Streitwert einheitlich. Eingabe Kanton steuert Spruchkörper-/Tariflogik. **Zuständigkeit kantonal.**

### 4.16 Berufung — Streitwertgrenze CHF 10'000
**Norm:** Art. 308 ZPO.
**Kostenwirkung:** Zweiter kantonaler Kostenblock (Entscheidgebühr + Parteientschädigung der Berufungsinstanz). Zulässig nur bei SW ≥ CHF 10'000 (sonst Beschwerde Art. 319).
**Klasse:** Ermessen (Höhe). **Relevanz:** kern.
**Cockpit-Modellierung:** Rechtsmittelblock «Berufung» (aktiv ab SW ≥ 10k) mit kantonalem Rechtsmitteltarif (Spanne) + Parteientschädigung. **Höhe kantonal.**

### 4.17 Berufung unzulässig — Ausnahmen (Vollstreckung, SchKG-Summarsachen)
**Norm:** Art. 309 ZPO.
**Kostenwirkung:** In diesen Materien nur Beschwerde (Art. 319 ff.) → anderer, begrenzter Rechtsmitteltarif und engere Kognition.
**Klasse:** deterministisch. **Relevanz:** kern.
**Cockpit-Modellierung:** Vorschalter «Vollstreckung/SchKG-Summarsache» → Rechtsmitteltyp = Beschwerde (Berufungsblock deaktiviert).

### 4.18 Beschwerde (Rechtsmittel)
**Norm:** Art. 319 ZPO.
**Kostenwirkung:** Kantonaler Rechtsmittelblock «Beschwerde» mit eigenem (regelmässig reduziertem) Tarif + Parteientschädigung; greift bei nicht berufungsfähigen Entscheiden (SW < 10k, summarisch, prozessleitende Verfügungen, Rechtsverzögerung).
**Klasse:** Ermessen (Höhe). **Relevanz:** wichtig.
**Cockpit-Modellierung:** Rechtsmittelblock «Beschwerde» mit kantonalem Tarif (Spanne) + Parteientschädigung; Vorschalter aus Entscheidtyp/Streitwert. **Höhe kantonal.**

### 4.19 Erläuterung und Berichtigung
**Norm:** Art. 334 ZPO.
**Kostenwirkung:** Kein eigentliches Rechtsmittel; regelmässig kostenfrei bzw. geringe Gebühr (insb. Schreib-/Rechnungsfehler von Amtes wegen).
**Klasse:** Hinweis. **Relevanz:** rand.
**Cockpit-Modellierung:** Hinweis: i.d.R. kostenneutral; kein separater Tarifblock.

### 4.20 Wiederherstellung (Fristwiederherstellung)
**Norm:** Art. 148 ZPO.
**Kostenwirkung:** Prozessuales Gesuch; kann eine geringe Gebühr auslösen; keine eigenständige bezifferbare Hauptkostenfolge.
**Klasse:** Hinweis. **Relevanz:** rand.
**Cockpit-Modellierung:** Optionaler Mini-Block «Wiederherstellungsgesuch Art. 148»; keine deterministische Bezifferung. **Gebühr kantonal.**

### 4.21 Tarif-Delegation an die Kantone (Grundlage aller Höhen)
**Norm:** Art. 95, 96 ZPO.
**Kostenwirkung:** Bundesrechtliche Grundlage, dass alle konkreten Gerichtsgebühren- und Parteientschädigungshöhen kantonal sind; die ZPO regelt nur Verfahrensart, Befreiungen und Verteilung, nicht die Beträge.
**Klasse:** Hinweis. **Relevanz:** kern.
**Cockpit-Modellierung:** Grundlagen-Vorschalter: Kanton-Auswahl bestimmt den anzuwendenden Tarif-Datensatz (GebV/AnwGebV). Steuert alle Beträge. **Kantonale Varianz: zentral.**

---

## §5 Materien (materienspezifische Privilegien und Bemessung)

### 5.1 Miet-/Pachtrecht: Schlichtung kostenlos (Gerichtskosten)
**Norm:** Art. 113 Abs. 2 lit. c ZPO.
**Kostenwirkung:** In der Schlichtung gar keine Gerichtskosten bei Miete/Pacht von Wohn-/Geschäftsräumen + landw. Pacht; zusätzlich keine Parteientschädigung (Art. 113 Abs. 1).
**Klasse:** deterministisch. **Relevanz:** kern.
**Cockpit-Modellierung:** Vorschalter Phase = Schlichtung + Materie = Miete/Pacht → Gerichtskosten = 0 erzwingen; Parteientschädigung = 0 (Hinweis UR-Beistand-Vorbehalt).

### 5.2 Schlichtung generell: keine Parteientschädigung
**Norm:** Art. 113 Abs. 1 ZPO.
**Kostenwirkung:** In jedem Schlichtungsverfahren keine Parteientschädigung (Vorbehalt UR-Beistand).
**Klasse:** deterministisch. **Relevanz:** kern.
**Cockpit-Modellierung:** Vorschalter Phase = Schlichtung → Parteientschädigung-Block auf 0. *(Dublette zu 3.1/4.2.)*

### 5.3 Schlichtung weitere kostenlose Materien (GlG, BehiG, MitwirkungsG, KVG-Zusatzvers.)
**Norm:** Art. 113 Abs. 2 lit. a, b, e, f ZPO.
**Kostenwirkung:** Keine Gerichtskosten in diesen Materien (ohne Streitwertgrenze).
**Klasse:** deterministisch. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Vorschalter Phase = Schlichtung + Materie in {GlG, BehiG, Mitwirkung, KVG-Zusatzvers.} → Gerichtskosten = 0.

### 5.4 Arbeitsrecht ≤ CHF 30'000: kostenloses Entscheidverfahren
**Norm:** Art. 114 lit. c ZPO.
**Kostenwirkung:** Bei SW ≤ CHF 30'000 keine Gerichtskosten erstinstanzlich; Parteientschädigung bleibt geschuldet. Vorbehalt Art. 115.
**Klasse:** deterministisch. **Relevanz:** kern.
**Cockpit-Modellierung:** Vorschalter Materie = Arbeit + SW ≤ 30'000 → Gerichtskosten = 0; Parteientschädigung weiter berechnen; harte Grenze.

### 5.5 GlG / BehiG: kostenloses Entscheidverfahren
**Norm:** Art. 114 lit. a/b ZPO.
**Kostenwirkung:** Keine Gerichtskosten im Entscheidverfahren, OHNE Streitwertgrenze (anders als Arbeit). Parteientschädigung bleibt geschuldet.
**Klasse:** deterministisch. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Vorschalter Materie in {GlG, BehiG} → Gerichtskosten = 0 streitwertunabhängig.

### 5.6 MitwirkungsG / KVG-Zusatzversicherungen: kostenloses Entscheidverfahren
**Norm:** Art. 114 lit. d/e ZPO.
**Kostenwirkung:** Keine Gerichtskosten im Entscheidverfahren, ohne Streitwertgrenze; Parteientschädigung bleibt geschuldet.
**Klasse:** deterministisch. **Relevanz:** rand.
**Cockpit-Modellierung:** Vorschalter Materie in {Mitwirkung, KVG-Zusatzvers.} → Gerichtskosten = 0.

### 5.7 Datenschutzgesetz (DSG): kostenloses Entscheidverfahren
**Norm:** Art. 114 lit. g ZPO (in Kraft seit 1.9.2023).
**Kostenwirkung:** Keine Gerichtskosten im Entscheidverfahren bei DSG-Streitigkeiten; Parteientschädigung bleibt geschuldet.
**Klasse:** deterministisch. **Relevanz:** rand.
**Cockpit-Modellierung:** Vorschalter Materie = DSG → Gerichtskosten = 0 (Datums-Flag ab 1.9.2023).

### 5.8 Gewaltschutz Art. 28b/28c ZGB: kostenloses Entscheidverfahren
**Norm:** Art. 114 lit. f ZPO (in Kraft seit 1.1.2022).
**Kostenwirkung:** Keine Gerichtskosten im Entscheidverfahren bei Gewaltschutzklagen; schützt die gefährdete Person.
**Klasse:** deterministisch. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Vorschalter Materie = Gewaltschutz → Gerichtskosten = 0 als Grundregel; verknüpft mit Art. 115 Abs. 2 (5.9). *(Vgl. 3.5.)*

### 5.9 Gewaltschutz: Kostenauferlegung an unterliegende Partei (Ausnahme)
**Norm:** Art. 115 Abs. 2 ZPO.
**Kostenwirkung:** Trotz Kostenfreiheit können die Gerichtskosten der unterliegenden (gewaltausübenden) Partei auferlegt werden, wenn Verbot/Überwachung angeordnet wird («können»).
**Klasse:** Ermessen. **Relevanz:** rand.
**Cockpit-Modellierung:** Schalter im Gewaltschutz-Fall: bei Verbot/Überwachung optionale Auferlegung an Gegenpartei (Spanne 0 bis volle Gerichtskosten), Default 0, Ermessens-Hinweis. **Höhe kantonal.** *(Vgl. 3.7.)*

### 5.10 Bös-/mutwillige Prozessführung: Kostenauferlegung trotz Kostenfreiheit
**Norm:** Art. 115 Abs. 1 ZPO.
**Kostenwirkung:** In allen kostenlosen Verfahren (Art. 113/114) können bei Bös-/Mutwilligkeit dennoch Gerichtskosten auferlegt werden.
**Klasse:** Ermessen. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Globaler Schalter auf jedem kostenfreien Verfahren → hebt Gerichtskosten = 0 auf, Auferlegung nach kantonalem Tarif, Default aus, Begründungs-Hinweis. *(Vgl. 3.6.)*

### 5.11 Kinderbelange: Untersuchungs-/Offizialgrundsatz (Verteilung nach Ermessen)
**Norm:** Art. 296 ZPO i.V.m. Art. 107 Abs. 1 lit. c ZPO.
**Kostenwirkung:** Strenge Untersuchungs-/Offizialmaxime; Gericht verteilt Prozesskosten nach Ermessen und weicht vom Erfolgsprinzip ab. Keine schematische Verteilung nach Obsiegen/Unterliegen.
**Klasse:** Ermessen. **Relevanz:** kern.
**Cockpit-Modellierung:** Bei Familienrecht mit Kinderbelangen Verteilung von «nach Obsiegen» auf «Ermessen» umschalten (Spanne hälftig/Billigkeit) + Hinweis auf Offizial-/Untersuchungsgrundsatz. **Gebührenhöhe kantonal.**

### 5.12 Scheidung auf gemeinsames Begehren: reduzierte Gebühr (Bsp. BS)
**Norm:** GGR BS (SG 154.810) § 7.
**Kostenwirkung:** Gemeinsames Begehren reduziert die Scheidungsgebühr auf 2/5 der einkommensabhängigen Gebühr (Clamp CHF 500–5'000).
**Klasse:** deterministisch. **Relevanz:** kern.
**Cockpit-Modellierung:** Schalter «gemeinsames Begehren» (Scheidungsmodus BS) → Faktor 2/5 auf Grundgebühr, Clamp [500; 5000]. **Kantonale Varianz: hoch** (ZH bis zur Hälfte; BS 2/5 + Deckel).

### 5.13 Eheschutz / vorsorgliche Massnahmen im Scheidungsverfahren
**Norm:** Art. 271 ff. / Art. 276 ZPO; kantonale Tarife (z.B. GebV OG ZH, GGR BS).
**Kostenwirkung:** Summarisches Verfahren mit reduzierten Gebührenansätzen; bei enthaltenen Kinderbelangen Verteilung nach Ermessen.
**Klasse:** Ermessen. **Relevanz:** kern.
**Cockpit-Modellierung:** Eigener Verfahrenstyp «Eheschutz/vorsorgliche Massnahmen» mit reduziertem kantonalem Ansatz; bei Kinderbelangen Verteilung auf Ermessen umstellen. **Kantonale Varianz: hoch.**

### 5.14 Nicht vermögensrechtliche / Persönlichkeitsrechts-Streitigkeiten
**Norm:** Art. 91 Abs. 1 ZPO; BGE 142 III 145; kantonale Rahmen (z.B. GebV OG ZH § 5 ff.).
**Kostenwirkung:** Keine streitwertbasierte Gebühr; Bemessung nach Aufwand/Bedeutung im kantonalen Rahmen. Abgrenzung vermögens-/nicht vermögensrechtlich entscheidend.
**Klasse:** Ermessen. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Schalter «nicht vermögensrechtlich» → Streitwert-Eingabe deaktivieren, Rahmen-/Aufwandgebühr (kantonale Spanne) mit Default-Schätzwert; Hinweis auf Abgrenzungsfrage. **Höhe kantonal.**

### 5.15 Kollektiver Rechtsschutz / Verbandsklage (Art. 89 ZPO)
**Norm:** Art. 89 ZPO i.V.m. Art. 95 ff. ZPO.
**Kostenwirkung:** Verbandsklage erfasst nur Persönlichkeitsverletzungen (kein Reparationsanspruch); der klagende Verband trägt das volle Kostenrisiko nach allgemeinen Regeln. Keine besondere Privilegierung de lege lata; nicht vermögensrechtlich → Gebühr nach Aufwand/Rahmen. (Revision kollektiver Rechtsschutz noch nicht in Kraft.)
**Klasse:** Hinweis. **Relevanz:** rand.
**Cockpit-Modellierung:** Hinweis-Flag: volles Kostenrisiko des Verbands, Gebühr i.d.R. nicht vermögensrechtlich bemessen. Keine bezifferbare Sonderregel. *(Streitwertfestsetzung selbst → Art. 94a, vgl. 1.12.)*

---

## §6 Kantonale Modifikatoren (Art. 95–98, 104 OR, kantonale Tarife)

### 6.1 Tarifhoheit der Kantone (Rahmen)
**Norm:** Art. 96 Abs. 1 ZPO.
**Kostenwirkung:** Grundlage aller kantonalen Modifikatoren: Gerichtskosten UND Parteientschädigung werden kantonal bestimmt. Jede Erhöhungs-/Reduktions-/Mindest-/Höchst-/Zuschlags-/MwSt-Klausel ist kantonale Ausgestaltung dieser Delegation, kein Bundesrecht.
**Klasse:** Hinweis. **Relevanz:** kern.
**Cockpit-Modellierung:** KantonCode als oberste Eingabe selektiert die gesamte Tarif-Datenschicht. Keine eigene Berechnung, aber legitimierende Norm (im UI als Quelle anzeigen). **Kantonale Varianz: zentral.**

### 6.2 Reduktion bei Erledigung ohne Urteil (Vergleich/Rückzug/Anerkennung/Abstand)
**Norm:** z.B. § 10 Abs. 1 GebV OG ZH (LS 211.11), kumulativ § 4 Abs. 2; Verteilung Art. 109 ZPO.
**Kostenwirkung:** Senkt die Gerichtsgebühr (häufig bis auf die Hälfte) wegen geringeren Aufwands ohne materielle Anspruchsprüfung. ZH-Praxis: Abschreibung nach Rückzug → § 4 II + kumulativ § 10 I (max ½).
**Klasse:** Ermessen. **Relevanz:** kern.
**Cockpit-Modellierung:** Reduktionsfaktor (0.5–1.0) auf Basistarif, ausgelöst durch «Erledigungsart» (Urteil/Vergleich/Rückzug/Anerkennung); kumulierbar mit allgemeiner Ermessensreduktion. **Kantonale Varianz: hoch** (Deckel/Sätze differieren).

### 6.3 Parteientschädigung als Funktion der Gerichtsgebühr (Kopplungs-Tarif)
**Norm:** z.B. LU JusKV (Honorar = 75–150 % der Gerichtsgebühr).
**Kostenwirkung:** Parteientschädigung als Prozentband der Gerichtsgebühr statt eigenständig nach Streitwert; koppelt Parteikostenrisiko an Gerichtskosten.
**Klasse:** Ermessen. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Faktor-Spanne (0.75–1.5) auf das Gerichtskosten-Ergebnis (Sonder-Regeltyp `formel_extern`/Kopplung); Ergebnis als Spanne. **Kantonale Varianz: nur einzelne Kantone koppeln.**

### 6.4 Mehrwertsteuer auf die Parteientschädigung
**Norm:** Art. 95 Abs. 3 lit. b ZPO i.V.m. kantonalem Tarif (MWSTG-Satz).
**Kostenwirkung:** MwSt (Normalsatz 8,1 % seit 2024) kommt hinzu, wenn die berechtigte Partei nicht vorsteuerabzugsberechtigt ist. Kantone behandeln unterschiedlich: inkl. (NE) / zzgl. (BL) / ohne (FR, VD).
**Klasse:** Hinweis. **Relevanz:** kern.
**Cockpit-Modellierung:** Schalter «MwSt-pflichtig/vorsteuerabzugsberechtigt» + Kantons-Hinweis (inkl./zzgl.); Aufschlag deterministisch (Satz × Honorar), Anwendbarkeit fallabhängig → als Hinweis/optionaler Aufschlag. **Satz bundesrechtlich, Behandlung kantonal.**

### 6.5 Barauslagen / Auslagenersatz (separat)
**Norm:** Art. 95 Abs. 3 lit. a ZPO; kantonale Tarife (FR/VD «ohne Barauslagen», teils Pauschale).
**Kostenwirkung:** Notwendige Auslagen (Porti, Telefon, Kopien, Reisen) kommen zum Honorar hinzu — teils Pauschale (% des Honorars), teils effektiv.
**Klasse:** Hinweis. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Hinweis (Auslagen nicht im Honorar); wo Pauschalsatz beziffert, optionaler deterministischer Aufschlag, sonst nicht beziffert. **Kantonale Varianz** (Pauschale vs. effektiv).

### 6.6 Beweis-/Übersetzungs-/Kindesvertretungskosten als Gerichtskosten
**Norm:** Art. 95 Abs. 2 lit. c–e ZPO.
**Kostenwirkung:** Zusätzlich zur Entscheidgebühr, rein aufwandabhängig (Gutachten, Dolmetscher, Kindesvertreter), nicht aus Streitwert/Tarif berechenbar.
**Klasse:** Hinweis. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Reiner Hinweis «zzgl. Beweis-/Übersetzungs-/Kindesvertretungskosten»; keine Faktorisierung. **Posten bundesrechtlich, Höhe einzelfallabhängig.**

### 6.7 Kostenvorschuss als Bruchteil der mutmasslichen Gerichtskosten (Rev. 2025)
**Norm:** Art. 98 ZPO (Stand 1.1.2025).
**Kostenwirkung:** Regel: höchstens die Hälfte der mutmasslichen Gerichtskosten; voller Vorschuss in bestimmten Verfahren (Art. 6 IV lit. c / Art. 8 / Schlichtung / summarisch / Rechtsmittel). Betrifft Liquidität, nicht Kostenhöhe.
**Klasse:** deterministisch. **Relevanz:** wichtig.
**Cockpit-Modellierung:** Abgeleiteter Posten 0,5 × Gerichtskosten (bzw. voll bei Ausnahmeverfahren), aus Gerichtskosten-Ergebnis + Verfahrensart; ehrlich als Regel («in der Regel ≤ ½»).

### 6.8 Ermessensverteilung abweichend vom Erfolgsprinzip (Billigkeit)
**Norm:** Art. 107/108/109 ZPO.
**Kostenwirkung:** Verteilung nach Billigkeit (Familienrecht-Wettschlagung, Verursacherprinzip, Vergleichsabrede). Verändert Verteilung, nicht Tarifhöhe.
**Klasse:** Ermessen. **Relevanz:** kern.
**Cockpit-Modellierung:** Hinweis-/Schalter-Ebene auf der Verteilung; keine bezifferte Automatik, Spanne + Hinweis. *(Vgl. §2.6–2.15.)*

### 6.9 Verzugszins auf zugesprochene Prozesskosten
**Norm:** Art. 104 OR (5 %) i.V.m. Rechtskraft des Kostenentscheids (keine eigene ZPO-Norm).
**Kostenwirkung:** Auf rechtskräftig zugesprochene, unbezahlte Kosten läuft ab Fälligkeit Verzugszins (i.d.R. 5 %). Erhöht die Forderung zeitabhängig.
**Klasse:** Hinweis. **Relevanz:** rand.
**Cockpit-Modellierung:** Hinweis (Verknüpfung zum Verzugszins-Rechner möglich); keine Default-Bezifferung (Verzugsbeginn fallabhängig). **OR-Satz bundesrechtlich.**

### 6.10 Schlichtungspauschale (eigener, reduzierter Tarif)
**Norm:** Art. 95 Abs. 2 lit. a / Art. 113 Abs. 1 ZPO; kantonale Schlichtungstarife (z.B. GL CHF 100–800).
**Kostenwirkung:** Eigener, deutlich tieferer Pauschaltarif + keine Parteientschädigung. Senkt das Risiko der Schlichtungsstufe.
**Klasse:** Ermessen (Höhe). **Relevanz:** kern.
**Cockpit-Modellierung:** Phase als Vorschalter: Schlichtung → Parteientschädigung = 0 + Gerichtskosten = separater Schlichtungstarif (eigener Tarif/Hinweis). Logik in `src/lib/prozesskosten.ts`. **Pauschalhöhe kantonal.** *(Vgl. 4.1.)*

### 6.11 Kostenlose Verfahren (sachgebietsbezogen) als Vorschalter
**Norm:** Art. 113 Abs. 2 / Art. 114 ZPO.
**Kostenwirkung:** Setzt für bestimmte Materien Gerichtskosten (und in Schlichtung Parteientschädigung) auf null VOR jeder Tarifberechnung. Asymmetrie: Miete/Pacht nur in Schlichtung kostenlos.
**Klasse:** deterministisch. **Relevanz:** kern.
**Cockpit-Modellierung:** Vorschalter aus Materie + Phase + Streitwert (30k-Schwelle bei Arbeit). Implementiert in `src/lib/prozesskosten.ts` (`gerichtskostenKostenlos`). *(Aggregat zu §3.2/3.3, §5.1–5.8.)*

### 6.12 Kantonale Zusatz-Kostenbefreiungen (Öffnungsklausel)
**Norm:** Art. 116 Abs. 1 ZPO.
**Kostenwirkung:** Kantone können über Art. 113/114 hinaus weitere Verfahren kostenfrei stellen. Kann das Risiko in einzelnen Kantonen weiter senken.
**Klasse:** Hinweis. **Relevanz:** rand.
**Cockpit-Modellierung:** Kantonaler Sondervermerk, wo belegt; punktuelle Recherche pro Kanton. **Kantonale Varianz: hoch.** *(Vgl. 3.8.)*

### 6.13 Einkommens-/leistungsfähigkeitsabhängige Gebührenfestsetzung
**Norm:** z.B. BE Art. 36 VKD (BSG 161.12).
**Kostenwirkung:** Einzelne Kantone lassen die wirtschaftliche Leistungsfähigkeit als Bemessungskriterium einfliessen — Gebühr nicht allein streitwertabhängig.
**Klasse:** Ermessen. **Relevanz:** rand.
**Cockpit-Modellierung:** Bemessungskriterium-Hinweis am Tarif (`kriterien`-Feld); keine bezifferte Automatik (Leistungsfähigkeit nicht modelliert) → erklärt die Spanne. Anzeige bei Rahmentarifen. **Kantonale Varianz** (nur einzelne Erlasse).

---

## §7 Bau-Implikationen (priorisiert)

### A. Deterministisches Engine-Modell (1:1 berechnen, fixe Faktoren/Schwellen)
**Priorität kern:**
1. Streitwert-Grundsatz Art. 91 Abs. 1 (Eingabe → Kostenbasis, mit Zins-/Eventual-Validierung) — §1.1.
2. Verfahrens- vs. Kostenstreitwert bei Widerklage: `max` (Art. 94 Abs. 1) **und** Summe (Art. 94 Abs. 2) als zwei getrennte Ausgaben — §1.7/1.8.
3. Teilklage-Sonderregel Art. 94 Abs. 3 (Kostenbasis = Hauptklage) — §1.9; Teilklage allgemein Art. 86 — §1.10.
4. Zusammenrechnung Streitgenossenschaft/Klagenhäufung (Summe vs. `max`) — §1.5; Verfahrensart-Entkopplung Art. 93 Abs. 2 — §1.6.
5. Unterliegerprinzip + Fiktion + Quotelung (Art. 106 Abs. 1–2) als Verteilungskern — §2.1–2.3.
6. Liquidation Art. 111 Abs. 1/2 (Verrechnung/Rückerstattung/Nachforderung; Zahlungsrichtung Parteientschädigung) mit Versionsweiche 1.1.2025 — §2.19/2.20.
7. Kostenlosigkeits-Vorschalter Art. 113/114 inkl. 30k-Schwelle und Asymmetrie Miete/Pacht (nur Schlichtung) — §3.2/3.3/3.4, §5.1/5.4, §6.11.
8. UR-Grenze Art. 118 Abs. 3 (Parteientschädigung an Gegenpartei bleibt) — §3.11.
9. Schlichtung → Parteientschädigung = 0 (Art. 113 Abs. 1) — §3.1/4.2/5.2 (eine einzige Regel führen).
10. Kapitalisierung ×20 (Art. 92 Abs. 1/2) — §1.3.

**Priorität wichtig:**
11. Kostenvorschuss = 0,5 × Gerichtskosten (Art. 98) mit Voll-Vorschuss-Ausnahmen — §6.7.
12. Berufungsschwelle CHF 10'000 / Berufung-vs.-Beschwerde-Weiche (Art. 308/309) — §4.16/4.17.
13. Sicherheit notwendige Streitgenossenschaft (UND-Logik, Art. 99 Abs. 2) und Ausnahmen Art. 99 Abs. 3 — §3.18/3.19.
14. UR-Gesuchsverfahren kostenlos (Art. 119 Abs. 6) — §3.12.
15. Liquidation bei Unterliegen der UR-Partei (Art. 122 Abs. 1) — §3.15.
16. Scheidung gemeinsames Begehren (kantonaler Faktor 2/5 + Clamp, Bsp. BS) — §5.12.
17. Verjährung/Verzugszins Gerichtskosten 10 J./5 % (Art. 112 Abs. 2/3) — §2.23.

### B. Ermessens-Spanne + Kriterien (keine Punktzahl; anpassbare Verteilung/Spanne, Begründungshinweis)
**Priorität kern:**
1. Billigkeitsdach Art. 107 (Dachschalter ersetzt Quote durch manuelle Verteilung) inkl. lit. c Familienrecht — §2.6/2.9.
2. Kinderbelange Offizial-/Untersuchungsmaxime → Verteilung auf Ermessen (Art. 296 i.V.m. 107 lit. c) — §5.11.
3. Schlichtungspauschale + alle kantonalen Tarif-Höhen als Spanne (Art. 95/96) — §4.1/6.10/6.1.
4. Vorsorgliche Massnahmen als eigener Verfahrensblock mit Spanne (Art. 248/261) — §4.8.
5. SchKG-Summarsachen/Rechtsöffnung (GebV SchKG vs. kantonaler Summartarif) — §4.10.

**Priorität wichtig:**
6. Restliche Art.-107-Tatbestände lit. a/b/e/f als Checkbox-Overrides — §2.7/2.8/2.11/2.12.
7. Unnötige Kosten Verursacherprinzip (Sonderposten + Zuordnung, Art. 108) — §2.14.
8. Mehrparteien-Anteil nach Beteiligung (Default Kopfteile, Art. 106 Abs. 3) — §2.4.
9. Bös-/Mutwilligkeit-Override hebt Kostenlosigkeit auf (Art. 115 Abs. 1) — §3.6/5.10.
10. Gewaltschutz-Kostenauferlegung Art. 115 Abs. 2 (Default 0, Spanne) — §3.7/5.9.
11. Kopplungs-Tarif Parteientschädigung (75–150 % Gerichtsgebühr, LU) — §6.3.
12. Kautionsgründe Art. 99 Abs. 1 (Höhe = Parteientschädigung) — §3.17.
13. Nicht vermögensrechtliche/Persönlichkeits-Gebühr nach Rahmen/Aufwand — §1.14/5.14.
14. UR teilweise (Art. 118 Abs. 2) — §3.10; UR-Anspruchsprüfung (Bedürftigkeit teilberechenbar, Aussichtslosigkeit wertend, Art. 117) — §3.9.

### C. Reiner Hinweis (kein Rechenfaktor; Flag/Verweis/Ehrlichkeit über offene Posten)
**Priorität kern/wichtig:**
1. Streitwert nicht berechenbar → null + Ermessenshinweis: Art. 91 Abs. 2, Art. 94a Verbandsklage, Stufenklage, Leibrente-Barwert — §1.2/1.12/1.13/1.4.
2. Festsetzung von Amtes wegen + Parteientschädigung nur auf Antrag/Tarif (Art. 105) — §2.17.
3. Einzige-Instanz-Pfade → Rechtsmittel = BGer, kantonale Blöcke aus (Art. 5/6/7/8) — §4.11–4.14.
4. Sachliche/funktionelle Zuständigkeit kantonal; Streitwert einheitlich (Art. 4) — §4.15.
5. Tarif-Delegation als legitimierender Quellenhinweis (Art. 96) — §4.21/6.1.
6. Offene Zusatzposten ehrlich ausweisen: Beweis-/Übersetzungs-/Kindesvertretungskosten (Art. 95 Abs. 2 lit. c–e), Barauslagen (lit. a), MwSt-Aufschlag (lit. b, fallabhängig) — §6.4/6.5/6.6.
7. Entscheidvorschlag/Schlichtungsentscheid Art. 210–212 (10k bzw. ≤2000) als Szenario-Hinweise — §4.4/4.5.
8. Solidarhaftung notwendige Streitgenossenschaft (Art. 106 Abs. 3 Satz 2, «kann») — §2.5.
9. Vergleich ohne Kostenregelung → Fallback Art. 106–108 + UR-Schutz (Art. 109 Abs. 2) — §2.15.
10. UR pro Instanz / rückwirkend / Entzug / Nachzahlung 10 J. (Art. 119 Abs. 4/5, 120, 123) — §3.13/3.14/3.16.
11. Entscheidtyp/Rückweisung (Art. 104), Anfechtung nur Beschwerde (Art. 110) — §2.16/2.18.

**Priorität rand:**
12. Stundung/Erlass (Art. 112 Abs. 1), nicht veranlasste Kosten → Kanton (Art. 107 Abs. 2), Verzugszins OR 104, Erläuterung/Berichtigung (Art. 334), Wiederherstellung (Art. 148), kantonale Zusatzbefreiungen (Art. 116), leistungsfähigkeitsabhängige Gebühr (BE Art. 36 VKD), Verbandsklage-Kostenrisiko (Art. 89) — §2.22/2.13/6.9/4.19/4.20/3.8/6.12/6.13/5.15.

### D. Querschnitt-Hinweise zur Bauausführung
- **Dubletten konsolidieren:** Art. 113 Abs. 1 (keine Parteientschädigung) erscheint dreifach (§3.1/4.2/5.2) — als eine Regel führen; ebenso Kostenlosigkeits-Vorschalter (§3.2/3.3, §5.1–5.8, §6.11) und Bös-/Mutwilligkeit (§3.6/5.10) und Gewaltschutz (§3.5/5.8, §3.7/5.9).
- **Versionsweichen (Stichtag 1.1.2025):** Art. 85, 94 Abs. 3, 94a, 98, 106 Abs. 3 Satz 2, 111 Abs. 1, 118 Abs. 2, 212 — Übergangsrecht je Verfahren prüfen.
- **Kantonale Datenschicht (Art. 96):** alle Höhen, Reduktionssätze, Kopplungen, MwSt-Behandlung, Schlichtungspauschalen, Zusatzbefreiungen und Leistungsfähigkeitskriterien hängen am KantonCode — höchste Eingabe-Hierarchie.
- **Zu verifizieren (offen):** h.L. «höchster Wert» bei sich ausschliessender Widerklage (§1.8); Übergangsrecht Art. 94 Abs. 3 (§1.9); Stufenklage-Bemessungspraxis Gesamtinteresse vs. höchster Stufenwert (§1.13).
