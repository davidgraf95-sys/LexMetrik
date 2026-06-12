# Musterklagen Vertrags- und Haftpflichtrecht (Bd. I) — Struktur-Bauspezifikation Klage-Vorlagen

**Erstellt:** 12.6.2026, Auftrag David («weitere Rubrik mit Musterklagen …
und baue dann die entsprechenden masken»; Quellordner LexMetrik Knowledge).

**Status: ERSTRECHERCHE / Bauspezifikation — fachliche Abnahme David
ausstehend; [VF]-Anker vor Bau am Fedlex-Cache zu verifizieren (§7).**

## Quelle + Stand (§11 Ziff. 1)

**Referenz:** Schulthess «Kommentierte Musterklagen zum Vertrags- und zum
Haftpflichtrecht» Bd. I, 2. Aufl. 2022, §§ 1–25 — 23 PDFs in Davids Ablage
(`~/Desktop/LexMetrik Knowledge/Musterklagen Vertrags- und
Haftplfichtrecht/`), ausgewertet 12.6.2026 durch 4 Struktur-Agents
(§§ 1–4 · 5–8 · 9–16 · 17–25; §§ 10/12/23 stecken in den Doppel-PDFs).

**URHEBERRECHTS-REGEL (verbindlich, wie familienrecht-klagen-vorlagen.md):**
Die Muster sind Verlagswerke. Dieses Dossier erfasst NUR Struktur (Aufbau,
Begehren-TYPEN/-Raster, Norm-Anker, Weichen, Feldlisten) — **kein
Wortlaut**. LexMetrik-Bausteine werden EIGENFORMULIERT.

**Bekannte Quell-Vorbehalte:** Druckstand 2022 (ZPO-Revision 1.1.2025
teils nur als Entwurf referenziert — revArt. 177 ZPO Privatgutachten,
Art. 118 Abs. 2 ZPO URP: vor Bau verifizieren); §§ 6/7 sind als
VERMIETER-Klagen ausgestaltet (Rollenumkehr nach Urteilsvorschlag bzw.
Art. 209 Abs. 1 lit. a ZPO); § 4 ohne superprovisorisches Muster-Begehren;
lange Kommentar-Teile («Ergänzende Hinweise») der §§ 5–8 nur per
Überschriften-Scan erfasst.

**Gemeinsame Schriftsatz-Anatomie:** identisch mit familienrecht-klagen-
vorlagen.md §2 (Rubrum → Rechtsbegehren → Formelles → Materielles mit
BO je Behauptung → Beweismittelverzeichnis/Beilagen) — der Rahmen ist in
`klageOrdentlich.ts` GEBAUT (Tatsache+Beweis-Paare, Platzhalter-Modus);
die typspezifischen Masken liefern Begehren-RASTER + Feldlisten + Gates.

---

# Musterklagen Vertrags- und Haftpflichtrecht (Bd. I) — strukturelle Auswertung Teil 1 (§§ 1–4)
Quelle: Kommentierte Musterklagen zum Vertrags- und Haftpflichtrecht, Bd. I — NUR Struktur/Metadaten, keine Textübernahme.

### § 1 — Erfüllungsklage des Käufers (internationaler Warenkauf, Realerfüllung)

**Konstellation (abstrakt):** CH-Käuferin (AG) klagt gegen ausländische Verkäuferin (hier: Irland) auf Lieferung bestellter Gattungsware aus Kaufvertrag mit Rahmenvereinbarung; Streit über Vertragsinhalt (vorbehaltlose Lieferpflicht vs. Ersatzlieferungsklausel).

**1. Verfahrensart**
- Ordentliches Verfahren (Art. 219 ff. ZPO), da Streitwert > CHF 30'000 (Art. 243, 248 ZPO e contrario).
- KEIN Schlichtungsverfahren: bei handelsgerichtlicher Zuständigkeit ausgeschlossen (Art. 198 lit. f i.V.m. Art. 6 ZPO; § 44 GOG/ZH).
- Achtung: Streitwert von exakt CHF 30'000 fällt noch ins vereinfachte Verfahren und damit aus der HGer-Zuständigkeit (Art. 243 Abs. 1 ZPO; BGE 143 III 137).

**2. Zuständigkeit**
- International/örtlich: LugÜ (Art. 1 Ziff. 1 LugÜ) wegen euro-internationalem Verhältnis; Erfüllungsort-Gerichtsstand Art. 5 Ziff. 1 lit. a/b LugÜ (einheitlicher Lieferort-Gerichtsstand für Kaufverträge), alternativ allgemeiner Gerichtsstand Art. 2 LugÜ. LugÜ verdrängt IPRG (Art. 1 Abs. 2 IPRG) und ZPO (Art. 2 ZPO).
- Sachlich: Handelsgericht, Art. 6 ZPO i.V.m. kantonalem Recht (§ 44 GOG/ZH); Voraussetzungen: geschäftliche Tätigkeit beider Parteien, beidseitiger Registereintrag (ausländisches vergleichbares Register genügt), Streitwert > CHF 30'000.
- Rechtsmittel: nur Beschwerde in Zivilsachen ans BGer (Art. 308 Abs. 1 lit. a ZPO; Art. 75 Abs. 2 lit. b BGG); keine aufschiebende Wirkung (Art. 103 BGG) → HGer-Urteil sofort rechtskräftig/vollstreckbar.

**3. Rechtsbegehren-RASTER**
1. Verpflichtung der Beklagten — unter Androhung der Bestrafung der verantwortlichen Organe nach Art. 292 StGB (Busse bis CHF 10'000) im Unterlassungsfall — zur Lieferung von [ANZAHL] [WARE, genaue Spezifikation/Ausführung], Bestellnummer [NR], gemäss Bestellung vom [DATUM], an [LIEFERADRESSE], unverzüglich nach Urteilseröffnung.
2. Direkte Vollstreckung (Art. 236 Abs. 3, Art. 337 ZPO): Anweisung an [VOLLSTRECKUNGSBEHÖRDE, z.B. Gemeindeammannamt] zur Vollstreckung auf erstes Verlangen mittels Wegnahme (Art. 343 Abs. 1 lit. d ZPO) von [ANZAHL WARE] aus [LAGERORT der Beklagten in der CH], nötigenfalls unter Polizeibeizug.
3. Kosten- und Entschädigungsfolgen zulasten der Beklagten.
Felder: Parteien (Firma, Sitz, Vertreter), Ware (Typ/Ausführung/Bestellnr.), Menge, Bestelldatum, Lieferadresse, Lagerort/Vollstreckungsobjekt, Vollstreckungsbehörde.

**4. Aufbau-Gliederung der Klageschrift**
- Rubrum (Gericht, Parteien, Vertreter; bei ausländischer Beklagter: Zustellungsproblematik — Rechtshilfe/HZUe65, Art. 10 lit. a)
- Rechtsbegehren (Leistung + direkte Vollstreckung + Kosten)
- Begründung I. Formelles: Vollmacht → Parteien/Registereinträge → internationale/örtliche Zuständigkeit (LugÜ) → sachliche Zuständigkeit (HGer) → Verfahrensart/Streitwert → Ausschluss Schlichtung → Sprache der Beweisurkunden
- Begründung II. Materielles: A. Sachverhalt (chronologisch, jede Behauptung mit BO: Beilage/Personalbeweis) — B. Rechtliches: a) anwendbares Recht (IPRG/Haager Übk. 1955/Rechtswahl, CISG-Ausschluss), b) Anspruch (Vertragsschluss unstreitig, Inhalt streitig → Auslegung: wirklicher Wille Art. 18 Abs. 1 OR, eventualiter Vertrauensprinzip), c) keine Einreden (z.B. Anzahlung geleistet), d) Begründung Vollstreckungsantrag
- Schlussformel, Unterschrift, Beilagenverzeichnis (Beweismittelverzeichnis, Urkunden im Doppel)
- (Im Buch zusätzlich: III. Ergänzende Hinweise — Konsensstreit/Vertragsauslegung, Rechtsmittel)

**5. Anspruchsgrundlagen + Masken-Felder**
- Erfüllungsanspruch aus Kaufvertrag: Art. 184 OR (Lieferpflicht) — zu verifizieren (Fedlex); Vertragsschluss/-inhalt Art. 1, 18 Abs. 1 OR.
- IPR: Art. 118 IPRG → Haager Übk. v. 15.6.1955 (Art. 2: Rechtswahl); CISG-Ausschluss durch Parteivereinbarung (Art. 1 CISG Geltungsbereich).
- Verzug im kaufmännischen Verkehr: Art. 190 OR (Vermutung Verzicht auf Lieferung!); Art. 102 ff., 107 Abs. 2, 109 OR (Wandlung in Schadenersatz).
- Vollstreckung: Art. 236 Abs. 3, 337, 343 Abs. 1 lit. a–e ZPO; Art. 292 StGB; Deckungskauf Art. 191 Abs. 2 OR.
- Masken-Felder: Vertragstyp (Einzelkauf/Rahmenvertrag), Vertragsdatum, Rechtswahl ja/nein, CISG-Ausschluss ja/nein, Bestelldatum + Bestätigungsdatum, Liefertermin (bestimmt? → Art. 190 OR), Lieferort (→ Gerichtsstand), Warenmenge/Spezifikation, Kaufpreis/Anzahlung (geleistet?), Verfügbarkeit der Ware (Lagerort CH?), Mahnung/Festhaltenserklärung (Datum!), Sitzstaat Beklagte (LugÜ-Staat?).

**6. Deterministisch vs. wertend**
- Deterministisch: Zuständigkeitsprüfung (LugÜ-Kaskade, HGer-Voraussetzungen), Verfahrensart nach Streitwert, Schlichtungsausschluss, Fristberechnung Art. 190 OR, Beilagen-Zuordnung pro Sachverhaltsbehauptung, Rechtsbegehren-Raster.
- Wertend: Vertragsauslegung (wirklicher Wille vs. Vertrauensprinzip; Unklarheitsregel, favor negotii), «Unverzüglichkeit» der Anzeige nach Art. 190 Abs. 2 OR, Prognose Vollstreckbarkeit/Prozesstaktik (ob direkte Vollstreckung beantragen; ob heikle Punkte erst in Replik thematisieren), Beweiswert Parteibefragung vs. Beweisaussage (Art. 191/192 ZPO).

**7. Beilagen-Typen**
Vollmacht; Handelsregisterauszug Klägerin; ausländischer Registerauszug Beklagte; Rahmenvereinbarung + Anhang; E-Mail-Korrespondenz (Produktankündigung, Bestellung, Auftragsbestätigung, Kürzungsmitteilung, Ablehnungen); Kundenanfragen/-rückmeldungen (Bedarfsnachweis); Telefonnotiz; Rundmail an Kunden; Zahlungsbeleg Anzahlung; Lieferschein Teillieferung; Mahnschreiben/Nachfristansetzung; Antwortschreiben. Personalbeweise: Parteibefragung/Beweisaussage (Art. 191 f. ZPO) von Organen (nicht Zeugen, Art. 159 ZPO); Editionsbegehren (Bestellunterlagen der Gegenseite).

**8. Fallen (Fristen/Verwirkung)**
- Art. 190 Abs. 1/2 OR: kaufmännischer Verkehr + bestimmter Liefertermin → Vermutung des Verzichts auf Lieferung; ohne UNVERZÜGLICHE Anzeige (am Erfüllungstag oder Folgetag) verwirkt der Erfüllungsanspruch unwiderlegbar — Wandlung in Schadenersatz (Art. 107 Abs. 2, 109 OR). Vor jeder Erfüllungsklage prüfen!
- Klageänderung (Erfüllung→Schadenersatz): Art. 227 ZPO; nach Eröffnung Hauptverhandlung nur noch mit Noven (Art. 230 ZPO); Verzichtserklärung nach Art. 107 Abs. 2 OR muss vor Novenschranke (Art. 229 ZPO) eingeführt werden.
- Vollstreckbarkeit vorab prüfen: gegen ausländische Beklagte greifen indirekte Zwangsmittel kaum; einzig tauglich meist Wegnahme (Art. 343 Abs. 1 lit. d ZPO) — setzt Ware in der CH voraus → Sicherungsmassnahmen (§ 2) rechtzeitig.
- Zustellung ins Ausland: Rechtshilfeweg/HZUe65 zeitaufwendig; ggf. vorprozessual CH-Zustelladresse der Gegenseite provozieren.
- Bei ordentlichen Gerichten (nicht HGer): Berufung hemmt Rechtskraft/Vollstreckung (Art. 315 Abs. 1 ZPO); vorzeitige Vollstreckung nur via Art. 315 Abs. 2 ZPO oder vorsorgliche Massnahme (Art. 315 Abs. 4 ZPO: Berufung ohne aufschiebende Wirkung).

### § 2 — Vorsorgliche Massnahmen zur Erfüllungsklage des Käufers (Sicherungs- + Leistungsmassnahmen, superprovisorisch)

**Konstellation (abstrakt):** Wie § 1 (CH-Käuferin vs. ausländische Verkäuferin), zusätzlich: Weiterverkaufsvertrag mit Detailhändlerin (Liefertermin, Konventionalstrafe), Verkäuferin verweigert Lieferung und droht Ware an Dritten zu verkaufen; Gerichtsstandsvereinbarung zugunsten ausländischer Gerichte (Art. 23 LugÜ) — Massnahmegesuch trotzdem in der CH am Lageort der Ware.

**1. Verfahrensart**
- Summarisches Verfahren (Art. 248 lit. d ZPO); Gesuch um provisorische UND superprovisorische Massnahmen (Art. 261 ff., 265 ZPO).
- Beweismass: Glaubhaftmachen (nicht voller Beweis); bei Leistungsmassnahmen erhöhter Massstab («relativ klar begründet», BGE 138 III 378; 131 III 473).
- Beweismittel: grundsätzlich Urkunden (Art. 254 Abs. 1 ZPO); andere Beweismittel nur ohne wesentliche Verzögerung (Abs. 2).
- KEINE Schlichtung (Art. 198 lit. a ZPO für summarische Verfahren; vor HGer ohnehin Art. 198 lit. f ZPO).

**2. Zuständigkeit**
- International: Art. 31 LugÜ — Massnahmen am Massnahmegericht auch bei Hauptsache-Zuständigkeit eines anderen LugÜ-Staats; gilt selbst trotz ausschliesslicher Gerichtsstandsvereinbarung (Art. 23 Abs. 1 LugÜ), wenn nur dieses Gericht rechtzeitig vollstreckbare Massnahmen anordnen kann (BGE 125 III 451). Bei Leistungsmassnahmen 4 BGer-Voraussetzungen: (i) sachliche Erforderlichkeit, (ii) zeitliche Dringlichkeit, (iii) Hauptsachegericht kann nicht rechtzeitig wirksam handeln (Territorialitätsprinzip; Anerkennung ausländischer Massnahmen nach Art. 33 ff. LugÜ setzt rechtliches Gehör voraus, BGE 129 III 626), (iv) Sicherheitsleistung angeboten.
- Örtlich: Art. 10 lit. b IPRG — Gericht am Vollstreckungsort (Sicherungsmassnahme: Lageort der Ware; Leistungsmassnahme: Erbringungs-/Unterlassungsort).
- Sachlich: Einzelgericht des Handelsgerichts (Art. 6 Abs. 5 ZPO; § 45 lit. b GOG/ZH); HGer-Voraussetzungen wie § 1.

**3. Rechtsbegehren-RASTER**
1.a Verbot an Gesuchsgegnerin (vorsorglich, Art. 261 ff. ZPO; Strafandrohung Art. 292 StGB), [WARE] aus [LAGERORT] auszuliefern, soweit Lagerbestand unter [MINDESTMENGE] fiele;
1.b Befehl an Gesuchsgegnerin, unverzüglich nach Zustellung des Entscheids [MENGE WARE] an [LIEFERADRESSE] zu liefern (Leistungsmassnahme);
2. Verbot an DRITTE [LAGERBETREIBERIN, Adresse] (mit Strafandrohung Art. 292 StGB), Auslieferungen zuzulassen, die Ziff. 1.a verletzen;
3. Anweisung an [VOLLSTRECKUNGSBEHÖRDE]: Vollstreckung von Ziff. 1.b mittels Wegnahme aus [LAGERORT], nötigenfalls mit Polizei;
4. Superprovisorische Anordnung der Verbote Ziff. 1.a und 2 ohne Anhörung (Art. 265 ZPO);
5. Angebot Sicherheitsleistung CHF [BETRAG] (Hinterlegung bei Gerichtskasse, eventualiter gerichtlich bestimmter Betrag);
6. Kosten- und Entschädigungsfolgen zulasten der Gesuchsgegnerin.
Felder: Parteien, Drittpartei (Lagerbetreiberin), Ware/Bestellnr., Mengen (Liefermenge/Sperrbestand), Lagerort, Lieferadresse, Vollstreckungsbehörde, Sicherheitsbetrag (+ Herleitung, z.B. Mehrerlös des Drittangebots).

**4. Aufbau-Gliederung des Gesuchs**
- Rubrum (HGer Einzelgericht; Zustellungshinweis Ausland wie § 1)
- Rechtsbegehren (Verbot/Befehl/Drittverbot/Vollstreckung/superprovisorisch/Sicherheit/Kosten)
- Begründung I. Einleitender Überblick (Kurzdarstellung in 4 Ziffern: Vertragslage, Bestellung/Anzahlung/Weiterverkauf, Lieferverweigerung + wahres Motiv, drohende Nachteile + Begründung Massnahmenbedarf)
- II. Formelles: Vollmacht, Parteien, internationale Zuständigkeit (Art. 31 LugÜ + 4 BGer-Kriterien einzeln subsumiert!), Art. 10 lit. b IPRG, sachliche Zuständigkeit, Schlichtungsausschluss, Streitwert (geschätzt: Weiterverkaufsmarge), Verfahrensart, Beweismass Glaubhaftmachen
- III. Materielles: A. Sachverhalt (gegliedert: a) Vertragsabschluss Parteien, b) Weiterverkaufsvertrag, c) Lieferverweigerung) — B. Rechtliches: a) anwendbares Recht, b) Massnahme-Voraussetzungen (Art. 261 ZPO: 5 Punkte), c) zivilrechtlicher Anspruch (Vertragsschluss Art. 1, 2, 184 OR), d) Verletzung, e) nicht leicht wiedergutzumachender Nachteil, f) zeitliche Dringlichkeit (+ keine Verwirkung durch Zuwarten), g) Verhältnismässigkeit (Interessenabwägung), h) Vollstreckungsbegehren (Art. 261 i.V.m. 267 ZPO), i) Ausdehnung auf Dritte (Art. 262 ZPO «insbesondere» nicht abschliessend), j) superprovisorische Anordnung (Art. 265 Abs. 1 ZPO)
- Schlussformel; Beilagen dreifach (Beweismittelverzeichnis + Urkunden)
- (Im Buch: III. Ergänzende Hinweise — Art. 31 LugÜ, Glaubhaftmachen/Leistungsmassnahmen)

**5. Anspruchsgrundlagen + Masken-Felder**
- Massnahmerecht: Art. 261 (Hauptsachen- + Nachteilsprognose), 262 (Massnahmearten, auch gegen Dritte), 263 (Prosequierungsfrist), 264 (Sicherheit/Haftung), 265 (superprovisorisch), 267 (Vollstreckung), 254 (Urkundenbeweis) ZPO; Art. 292 StGB.
- Materiell: Vertragsschluss Art. 1 Abs. 1, 2 Abs. 1 OR (normativer Konsens genügt); Kaufvertrag Art. 184 Abs. 1 OR (essentialia: Ware + Preis; Zahlungsfrist objektiv NICHT wesentlich); Formfreiheit Art. 11 Abs. 1 OR.
- IPR: wie § 1 (Art. 118 IPRG, Haager Übk. 1955, CISG-Ausschluss Art. 6 CISG); LugÜ Art. 23, 31, 33 ff.
- Masken-Felder: Hauptsachegerichtsstand (CH/Ausland? Gerichtsstandsklausel?), Lageort der Ware (CH-Kanton → Massnahmegericht), Lagerbetreiber (Dritter?), Drittverkaufsgefahr (konkrete Indizien + Quelle/Datum), Weiterverkaufsvertrag (Liefertermin, Konventionalstrafe, Schadenersatzvorbehalt), verbleibende Zeit bis Termin, Reaktionschronologie seit Verletzung (Verwirkung!), Sicherheitsbetrag + Berechnungsbasis, Streitwertschätzung (Marge ./. Gemeinkosten).

**6. Deterministisch vs. wertend**
- Deterministisch: Verfahrensart, Zuständigkeitskaskade (Art. 31 LugÜ / Art. 10 lit. b IPRG / Art. 6 ZPO), Prüfschema Art. 261 ZPO (5 Voraussetzungen), 4-Punkte-Test BGE 125 III 451, Rechtsbegehren-Bausteine (Verbot/Befehl/Drittverbot/Vollstreckung/Superprovisorium/Sicherheit), Prosequierungsfrist-Mechanik Art. 263 ZPO.
- Wertend: Glaubhaftmachung (Beweiswürdigung prima facie), Nachteilsprognose (Reputation, Kundenverlust, Bezifferbarkeit), Verhältnismässigkeits-/Interessenabwägung, besondere Dringlichkeit für Superprovisorium, Höhe der Sicherheitsleistung, prozesstaktische Gesamtabwägung (Kosten/Schadenersatzrisiko Art. 264 ZPO vs. Nutzen; psychologischer Effekt einer Abweisung).

**7. Beilagen-Typen**
Vollmacht; Registerauszüge (beide Parteien + Drittpartei/Lagerbetreiberin); Rahmenvereinbarung (beide Versionen) + begleitende E-Mail; Bestellung; Auftragsbestätigung; Zahlungsbeleg Anzahlung (Banküberweisung); Weiterverkaufsvertrag mit Drittabnehmerin; Werbeflyer/Marktinformationen (Nachweis Zeitfenster/Dringlichkeit); E-Mails zur Lieferverweigerung und Festhaltenserklärung; Reservations-/Nachfragebelege. Personalbeweis: Parteibefragung/Beweisaussage (kurzfristig verfügbar anbieten!). Achtung: zu Prozesszwecken erstellte «Zeugenbescheinigungen» sind keine schriftliche Auskunft i.S.v. Art. 190 ZPO, nur Urkunde (Art. 177 ZPO) mit geringem Beweiswert.

**8. Fallen (Fristen/Verwirkung)**
- Verwirkung durch Zuwarten: zu langes Zögern nach Kenntnis der (drohenden) Verletzung lässt Dringlichkeit entfallen — bei Superprovisorium besonders streng; Reaktionschronologie dokumentieren.
- Prosequierung: Art. 263 ZPO — gerichtliche Frist zur Klageanhebung in der Hauptsache (Praxis ~30 Tage bis max. 3 Monate, erstreckbar Art. 144 Abs. 2 ZPO); bei ungenutztem Ablauf fällt die Massnahme dahin. Bei ausländischem Hauptsachegerichtsstand sofort mit Klagevorbereitung beginnen (Übersetzungen, Korrespondenzanwalt).
- Schadenersatzhaftung für ungerechtfertigte Massnahme (Art. 264 Abs. 2 ZPO) + mögliche Sicherheitsleistung (Abs. 1) — Kostenrisiko vorab abwägen.
- Leistungsmassnahmen (vorgezogene Erfüllung) nur restriktiv; erhöhtes Beweismass — schwache Hauptsachenprognose → Gesuch kann taktisch schaden.
- Anerkennungsfalle: superprovisorische ausländische Massnahmen ohne Gehör sind im Ausland nicht vollstreckbar (BGE 129 III 626) — Argument FÜR CH-Massnahmegericht am Lageort.

### § 3 — Klage des Käufers aus Unternehmenskauf (Share Deal: Grundlagenirrtum + Kaufpreisrückforderung)

**Konstellation (abstrakt):** Käufer (natürliche Person) erwarb 100% der Aktien einer AG; massgebliches Aktivum (Warenlager) war in der Übernahmebilanz überbewertet, Kaufpreis vertraglich «in genauer Höhe» an Substanz/Inventarwert gekoppelt. Klage auf Rückzahlung des zu viel bezahlten Kaufpreisteils (bezifferte Geldforderung + 5% Zins). Vorlage: BGE 107 II 419.

**1. Verfahrensart (+ Schlichtung)**
- Ordentliches Verfahren (Art. 243 i.V.m. 219 ZPO), Streitwert > CHF 30'000.
- MIT Schlichtungsverfahren (Parteien = natürliche Personen, kein HGer): Klagebewilligung nach Art. 209 Abs. 1 lit. b ZPO; Klagefrist Art. 209 Abs. 3 ZPO einhalten.

**2. Zuständigkeit**
- Örtlich: Art. 31 ZPO (Vertragsgerichtsstand: Wohnsitz/Sitz Beklagter ODER Ort der charakteristischen Leistung).
- Sachlich: Kollegialgericht Bezirksgericht (§ 19 GOG/ZH). HGer-Abgrenzung (Art. 6 Abs. 2 ZPO): Bei natürlichen Personen genügt HR-Eintrag als Organ/VR/Alleinaktionär NICHT — erforderlich ist Eintrag als Inhaber eines eigenen kaufmännischen Gewerbes (BGE 140 III 409); HGer-Zuständigkeit, wo gegeben, ist zwingend/ausschliesslich (BGE 138 III 471; 140 III 155), bei nur beklagtseitigem HR-Eintrag Wahlrecht des Klägers (Art. 6 Abs. 3 ZPO).

**3. Rechtsbegehren-RASTER**
1. Verpflichtung des Beklagten zur Zahlung von CHF [BETRAG = Überbewertung] nebst Zins zu 5% seit [DATUM, i.d.R. Klageeinreichung].
2. Kosten- und Entschädigungsfolgen (zzgl. MwSt.) zulasten des Beklagten.
Felder: Parteien, Forderungsbetrag (Differenz ausgewiesener vs. tatsächlicher Wert), Zinsbeginn.

**4. Aufbau-Gliederung**
- Rubrum (Bezirksgericht; betreffend Forderung) — Rechtsbegehren
- I. Formelles: Vollmacht/Registereintrag Anwalt → Klagebewilligung (Schlichtung durchlaufen, Frist Art. 209 Abs. 3 ZPO) → örtliche Zuständigkeit (Art. 31 ZPO) → Verfahrensart → sachliche Zuständigkeit → Beweismittelvorbehalt → Urkunden als Kopien
- II. Sachverhalt: A. Parteien (a Kläger, b Beklagter) — B. Verkauf der Gesellschaft (Vertrag, Kaufpreisklausel, Zahlung, Bilanz) — C. Unrichtige Bewertung (Entdeckung, Privatgutachten, Antrag gerichtliches Gutachten) — D. Zu hoher Kaufpreis (Bezifferung)
- III. Rechtliches: A. Grundlagenirrtum (a Irrtum über notwendige Vertragsgrundlage, b subjektive Wesentlichkeit, c objektive Wesentlichkeit, d Erkennbarkeit für Gegenpartei, e Fristwahrung Art. 31 OR, f Fazit) — B. Modifizierte Teilnichtigkeit (Art. 20 Abs. 2 OR analog) — C. Ungerechtfertigte Bereicherung (a Allgemeines, b Bereicherung, c aus fremdem Vermögen, d ungerechtfertigt) — D. Fazit (+ Verzugszins) — E. Kosten
- Schlussformel; Beilagen gemäss separatem Beweismittelverzeichnis
- (Im Buch: Ergänzende Hinweise — Lehrkritik an BGer-Praxis; Representations & Warranties; HGer-Frage)

**5. Anspruchsgrundlagen + Masken-Felder**
- Grundlagenirrtum: Art. 24 Abs. 1 Ziff. 4 OR (Irrtum über finanzielle Lage der Zielgesellschaft genügt: BGE 107 II 419; 97 II 43); Unverbindlichkeit Art. 23 OR; Anfechtungsfrist Art. 31 Abs. 1/2 OR.
- Anpassung statt Totalunverbindlichkeit: modifizierte Teilnichtigkeit, Art. 20 Abs. 2 OR analog (BGE 107 II 419 E. 3.b) — Kaufpreisreduktion auf objektiv angemessenen Wert.
- Rückforderung: ungerechtfertigte Bereicherung Art. 62 Abs. 1/2 OR (Geldleistung; ex-tunc-Wegfall im Umfang der Teilunverbindlichkeit).
- Zins: Fälligkeit Art. 75 OR; Klageerhebung = Mahnung (Art. 102 Abs. 1 OR); Verzugszins 5% Art. 104 Abs. 1 OR.
- Alternativ-Rechtsbehelfe (Wahlrecht des Käufers, BGE 127 III 83 u.a.): Sachmängelgewährleistung Art. 197 ff. OR — beim Share Deal grundsätzlich NICHT anwendbar (Kaufgegenstand = nur Aktien, BGE 107 II 419), ausser bei Zusicherung i.S.v. Art. 197 Abs. 1 OR (ggf. durch Bilanzvorlage); dann Rüge Art. 201 OR + Verjährung Art. 210 Abs. 1 OR (2 Jahre; Arglist: Abs. 6). Schadenersatz Art. 97 Abs. 1 OR — nach BGer ebenfalls an Art. 201/210 OR gebunden (BGE 133 III 335).
- Masken-Felder: Deal-Typ (Share/Asset), Kaufpreis + Preisbestimmungsklausel (Wortlaut-Kopplung an Bilanz/Inventar!), Zusicherungen/Garantien im Vertrag (Reps & Warranties: gegenwartsbezogen = Zusicherung Art. 197 OR; zukunftsbezogen = selbständige Garantie), Bilanz-/Inventarstichtag, ausgewiesener vs. tatsächlicher Wert (Differenz = Klagesumme), Entdeckungsdatum des Irrtums (sichere Kenntnis, z.B. Datum Expertenbericht), Anfechtungserklärung (Datum, Form), HR-Status der Parteien (HGer-Frage).

**6. Deterministisch vs. wertend**
- Deterministisch: Schlichtungspflicht + Klagefrist, Zuständigkeitsprüfung, Jahresfrist Art. 31 OR ab Entdeckung, Prüfschema Grundlagenirrtum (4 Elemente + Frist), Bereicherungs-Schema, Zinsberechnung, Forderungsbetrag = Bewertungsdifferenz.
- Wertend: subjektive/objektive Wesentlichkeit des Irrtums, Erkennbarkeit für Verkäufer, «sichere Kenntnis» vs. blosse Zweifel (Fristbeginn), hypothetischer Parteiwille bei Teilnichtigkeit (objektivierte Verkaufsbereitschaft zu tieferem Preis), Bewertung des Warenlagers (Gutachtensfrage), Wahl des Rechtsbehelfs (Taktik), Qualifikation Zusicherung vs. Garantie (Auslegung nach Vertrauensprinzip).

**7. Beilagen-Typen**
Vollmacht; Klagebewilligung; Kaufvertrag (Aktienkauf); HR-Auszug Zielgesellschaft; Inventar; Übernahmebilanz; Zahlungsbestätigung Kaufpreis; Rüge-/Anzeige-E-Mail an Verkäufer; Privatgutachten/Prüfungsbericht zur Bewertung. Beweisantrag: gerichtliches Gutachten (Art. 183 Abs. 1 ZPO) — Privatgutachten ist nach BGer-Praxis blosse Parteibehauptung, kein Beweismittel (BGE 141 III 433; ZPO-Revision sieht Urkundenqualität vor — Stand zu verifizieren, revArt. 177 ZPO seit 1.1.2025).

**8. Fallen (Fristen/Verwirkung)**
- Art. 31 Abs. 1/2 OR: relative 1-Jahres-Frist ab Entdeckung (sichere Kenntnis); keine absolute Frist (BGE 114 II 131), aber Rechtsmissbrauchsschranke bei langem Zuwarten.
- Verwirkung des Willensmangel-Behelfs durch Genehmigung: Wer sich zuerst auf Sachmängelgewährleistung beruft, genehmigt den Vertrag konkludent (Art. 31 Abs. 1 OR) und verliert die Irrtumsanfechtung (BGer 4C.296/2000) — Rechtsbehelfswahl vorab festlegen!
- Bei Gewährleistungsweg: sofortige Prüfung + Rüge (Art. 201 OR, einzelfallabhängige Tunlichkeit) und 2-jährige Verjährung (Art. 210 Abs. 1 OR); gilt nach BGer auch für Art. 97 OR-Anspruch bei Mängeln.
- Share-Deal-Falle: ohne Zusicherung keine Gewährleistung fürs Unternehmen (nur für die Aktien) — Irrtums-/Täuschungsweg als Ausweich-Pfad.
- Privatgutachten-Falle: genügt im Bestreitungsfall nicht als Beweis → gerichtliches Gutachten beantragen.

### § 4 — Vorsorgliche Massnahmen beim Unternehmenskauf (Stimmrechtsschutz des verkaufenden Mehrheitsaktionärs)

**Konstellation (abstrakt):** Mehrheitsaktionär (natürliche Person, 51.3%) hat seine Aktien an eine Konkurrentin verkauft (Vollzug aufgeschoben bis Wettbewerbsbehörden-Freigabe); opponierende VR-Mehrheit droht mit Streichung im Aktienbuch / Stimmrechtsbeschränkung auf 10% (angebliche Vinkulierungsumgehung). Gesuch um vorsorgliche Verbote/Gebote gegen die Gesellschaft vor der nächsten VR-Sitzung/GV.

**1. Verfahrensart (+ Schlichtung)**
- Summarisches Verfahren (Art. 248 lit. d ZPO); Gesuch um vorsorgliche Massnahmen (Art. 261 ff. ZPO; hier ohne Superprovisorium — dieses nur in den ergänzenden Hinweisen behandelt, Art. 265 ZPO).
- Beweismass Glaubhaftmachen; Urkundenbeweis (Art. 254 Abs. 1/2 ZPO).
- Hauptsacheklage nach Massnahme: direkt beim Gericht, OHNE Schlichtung (Art. 198 lit. h ZPO).

**2. Zuständigkeit**
- Örtlich (Binnenfall): Art. 13 ZPO zwingend — Gericht der Hauptsache (lit. a) oder Vollstreckungsort (lit. b); Hauptsache: Sitz der beklagten Gesellschaft, Art. 10 Abs. 1 lit. b ZPO.
- Sachlich: gesellschaftsrechtliche Streitigkeit i.S.v. Art. 6 Abs. 4 lit. b ZPO (Stimmrecht, Art. 692 ff. OR) → HGer kraft kantonaler Zuweisung (§ 44 lit. b GOG/ZH, Streitwert ≥ CHF 30'000); für Massnahmen vor Rechtshängigkeit: Einzelgericht HGer (Art. 6 Abs. 5 ZPO; § 45 lit. b GOG/ZH; BGE 137 III 563).
- Streitwert nicht bezifferbar → Hilfsgrösse: Nominalwert der betroffenen Aktien analog GV-Beschluss-Anfechtung (BGE 133 III 368); Streitwertangabe im Gesuch trotzdem nötig (Art. 219 i.V.m. 221 Abs. 1 lit. c ZPO; offensichtlich zu tiefe Angabe unverbindlich, Art. 91 Abs. 2 ZPO).

**3. Rechtsbegehren-RASTER** (alle mit Strafandrohung Art. 292 StGB gegen Organe)
1. Verbot an die Gesellschaft, den Gesuchsteller als stimmberechtigten Aktionär bezüglich [ANZAHL] Namenaktien à CHF [NENNWERT] im Aktienbuch zu streichen;
2. Verbot, das Stimmrecht in anderer Form zu beschränken (Auffangverbot);
3. Verpflichtung, das Stimmrecht für [ANZAHL] Aktien bei allen Abstimmungen/Wahlen jeder GV und jeder sonstigen Stimmrechtsausübung anzuerkennen (positives Gebot gegen Umgehung);
4. Kosten- und Entschädigungsfolgen (zzgl. MwSt.) zulasten der Gesuchsgegnerin.
Felder: Aktienzahl, Nennwert, Stimmrechtsanteil %, Gesellschaft, befürchtete Eingriffsformen.
Drei-Stufen-Logik: spezifisches Verbot + generelles Verbot + positives Anerkennungsgebot (Umgehungsschutz) — jede Stufe einzeln auf Eignung begründen.

**4. Aufbau-Gliederung**
- Rubrum (HGer; betreffend Stimmrecht/vorsorgliche Massnahmen) — Rechtsbegehren
- I. Formelles: Vollmacht → Streitwertbestimmung (Hilfsgrösse + Herleitung) → örtliche Zuständigkeit (Art. 13/10 ZPO) → sachliche Zuständigkeit (Art. 6 Abs. 4 lit. b, Abs. 5 ZPO + GOG) → Kopien-Vorbehalt
- II. Sachverhalt: A. Parteien — B. Aktienverkauf (Vertrag, Vollzugsvorbehalt) — C. Opposition des VR (Chronologie: Einberufungsantrag a.o. GV, Ablehnung, Geheimgutachten, Statutenklauseln [Vinkulierung, Stimmrechtsregel], Medienmitteilungen, bevorstehende VR-Sitzung) 
- III. Rechtliches: A. Massnahme-Voraussetzungen (Art. 261 Abs. 1 ZPO + Verhältnismässigkeit/Dringlichkeit) — B. Verfügungsanspruch/positive Hauptsachenprognose (Stimmrechtsanspruch; Widerlegung aller denkbaren Eingriffsgrundlagen) — C. Verfügungsgrund/Nachteilsprognose (a nicht leicht wiedergutzumachender Nachteil, b zeitliche Dringlichkeit, c Verhältnismässigkeit je Begehren, d Fazit Glaubhaftmachung) — D. Kosten
- Beilagen gemäss separatem Beweismittelverzeichnis
- (Im Buch: Ergänzende Hinweise — Glaubhaftmachung, Superprovisorium, Abwehrmöglichkeiten des Gesuchsgegners)

**5. Anspruchsgrundlagen + Masken-Felder**
- Verfügungsanspruch (Aktienrecht): Stimmrecht Art. 692 ff. OR; Stimmrechtsaktien Art. 693 Abs. 1 OR; Streichung im Aktienbuch NUR bei falschen Angaben des Erwerbers im Eintragungszeitpunkt (Art. 686a OR; nachträgliche Veränderungen genügen nicht); gesetzliche Stimmrechtsausschlüsse abschliessend: Art. 659a Abs. 1 OR (eigene Aktien), Art. 695 Abs. 1 OR (Décharge); statutarische Stimmrechtsbeschränkung nur falls vorgesehen (Art. 692 Abs. 2 OR); Vinkulierung greift erst beim ERWERB, nicht beim Abschluss des Kaufvertrags (aufgeschobener Vollzug!); «Kann»-Vinkulierung = keine Pflicht zur Durchsetzung; VR-Pflichten Art. 717 Abs. 1 OR (Verhältnismässigkeits-Argument).
- Massnahmerecht: Art. 261, 263, 264 (Abs. 1 Sicherheit — bei Superprovisorium von Amtes wegen Art. 265 Abs. 3 ZPO; Abs. 2 Kausalhaftung), 265 ZPO; Kosten Art. 95 ff., 104 Abs. 3 ZPO.
- Masken-Felder: Beteiligungsquote/Aktienzahl/Nennwert, Statutenklauseln (Vinkulierung: Wortlaut, Kann/Muss, Prozent-Schwelle; Stimmrechtsregelung), Kaufvertrag (Vollzugsbedingungen!), VR-Zusammensetzung + Mehrheitsverhältnisse, Chronologie der Eskalation (Anträge, Ablehnungen, Medienmitteilungen), Termine (VR-Sitzung, GV) — Dringlichkeitsanker, MwSt-Status des Klägers (Parteientschädigung zzgl. MwSt. beantragen, wenn kein Vorsteuerabzug).

**6. Deterministisch vs. wertend**
- Deterministisch: Zuständigkeitskaskade, Streitwert-Hilfsregel (Nominalwert), Prüfschema Art. 261 ZPO, abschliessender Katalog gesetzlicher Stimmrechtsausschlüsse, Voraussetzungen Art. 686a OR (falsche Angaben + Kausalität + Zeitpunkt), Schlichtungsbefreiung Art. 198 lit. h ZPO, Prosekutionsfrist-Mechanik.
- Wertend: Glaubhaftmachung der Verletzungsgefahr (Indizienwürdigung: Verhalten des VR, Medienmitteilungen, Traktanden), Nachteilsprognose (Wesensgehalt der Mitwirkungsrechte, kaum bezifferbarer Schaden), Dringlichkeit (Terminnähe), Verhältnismässigkeit/Interessenabwägung (neue VR unterliegen gleichen Pflichten → kein Nachteil für Gesellschaft), Auslegung der Vinkulierungsklausel, Umgehungstatbestände (Weisungsbindung/Vollmacht/Zession des Stimmrechts).

**7. Beilagen-Typen**
Vollmacht; HR-Auszug Gesellschaft; Gründungsurkunde; Bank-Depotbestätigung (Aktienbesitz); Aktienkaufvertrag; Statuten; Antrag auf Einberufung a.o. GV; Schreiben der Gesellschaft (Ablehnung/Gutachtenshinweis); Medienmitteilungen; VR-Sitzungseinladung + Traktandenliste; GV-Ankündigung. Editionsbegehren: Aktienbuch der Gesellschaft.

**8. Fallen (Fristen/Verwirkung)**
- Prosekutionsfrist Art. 263 ZPO: Massnahme fällt bei unbenutztem Fristablauf ohne Weiteres dahin; richterliche Frist, erstreckbar (Art. 144 Abs. 2 ZPO); Hauptsacheklage ohne Schlichtung (Art. 198 lit. h ZPO).
- Kausalhaftung Art. 264 Abs. 2 ZPO für ungerechtfertigte Massnahme (Entlastung nur bei Gesuch in guten Treuen); Sicherheitsleistung Art. 264 Abs. 1 ZPO (bei Superprovisorium von Amtes wegen, Art. 265 Abs. 3 ZPO).
- Dringlichkeit an konkrete Termine (VR-Sitzung/GV) knüpfen; faktische Präjudizwirkung der Massnahme bei langen M&A-Hauptverfahren bedenken.
- Kostenfallen: Streitwertangabe obligatorisch trotz unbezifferbarem Begehren; definitive Kostenverteilung des Massnahmeverfahrens erst im Hauptsache-Endentscheid (Art. 104 Abs. 3 ZPO); MwSt.-Zuschlag zur Parteientschädigung aktiv beantragen.
- Abwehrperspektive (Gegenseite): Bestreiten einzelner Voraussetzungen, insb. Dringlichkeit/Verhältnismässigkeit, genügt zur Abweisung.

---
**Quellen-Metadaten:** Schulthess «Kommentierte Musterklagen», Bd. I, 2. Aufl. 2022 — § 1/§ 2: P. Dickenmann (S. 1–61); § 3/§ 4: M. Reiter/A. Grieder (S. 63–90). Kantonale Normen (GOG/ZH §§ 19, 44, 45) und ZPO-Revisionsstand (Privatgutachten, revArt. 177 ZPO) vor Produktivnutzung verifizieren (Fedlex/ZH-Lex).
# Musterklagen Vertrags- und Haftpflichtrecht (Bd. I) — Strukturauswertung Teil 2 (§§ 5–8)

Quelle: Kommentierte Musterklagen zum Vertrags- und zum Haftpflichtrecht, Bd. I, 2. Aufl. 2022, Schulthess (Hrsg. Fischer/Theus Simoni/Gessler). Rein strukturelle Auswertung; keine Textübernahme.

---

### § 5 — Klage des Käufers beim Verzug des Verkäufers (Schadenersatz wegen Verspätungs-/Haftungsschadens; internationaler Kauf B2B)

**1. Verfahrensart (+ Schlichtung?)**
- Ordentliches Verfahren (Art. 219 ff. ZPO), da Streitwert über den Grenzen von Art. 243 / 248 ZPO (e contrario); Streitwertbemessung nach Art. 91 ff. ZPO (Zinsen/Kosten nicht hinzugerechnet, Art. 91 Abs. 1 ZPO).
- KEIN Schlichtungsverfahren: bei handelsgerichtlicher Zuständigkeit ausgeschlossen (Art. 198 lit. f i.V.m. Art. 6 ZPO; § 44 GOG/ZH).

**2. Zuständigkeit (Normen)**
- International/örtlich (Muster: Beklagte mit Sitz in Irland → euro-internationales Verhältnis): LugÜ anwendbar (Art. 1 Ziff. 1 LugÜ); Gerichtsstand am Lieferort der beweglichen Sache Art. 5 Abs. 1 lit. a/b LugÜ (alternativ zum Beklagtensitz Art. 2 LugÜ); rein nationaler Fall: Art. 31 ZPO (zu verifizieren — im ausgewerteten Teil nicht behandelt).
- Sachlich: Handelsgericht, Art. 6 ZPO i.V.m. § 44 GOG/ZH (geschäftliche Tätigkeit beider Parteien; Streitwert beschwerdefähig ans BGer Art. 74 Abs. 1 lit. b BGG [> CHF 30 000]; beide Parteien in HR bzw. vergleichbarem ausländischem Register eingetragen).
- Anwendbares Recht (internationaler Fall): IPRG Art. 118 → Haager Übereinkommen 1955 (Art. 2: Rechtswahl; Art. 3: objektive Anknüpfung Verkäufersitz); CISG-Ausschluss nach Art. 6 CISG — Wahl «Schweizer OR» (spezifisches Sachrecht) genügt, blosse Wahl «Schweizer Recht» genügt NICHT (BGer 4C.94/2006).

**3. Rechtsbegehren-RASTER**
1. Verpflichtung der Beklagten, der Klägerin CHF [Betrag] zzgl. Zins zu 5% seit [Datum Schadenseintritt] zu bezahlen — unter ausdrücklichem Vorbehalt des Nachklagerechts (wenn weitere Drittansprüche noch ungewiss).
2. Kosten- und Entschädigungsfolgen zulasten der Beklagten.
Platzhalter-Felder: [Betrag Haftungsschaden], [Zinslaufbeginn], [Vorbehalt Nachklage ja/nein].

**4. Aufbau-Gliederung**
- Rubrum (Gericht, Parteien mit Vertretung, «betreffend Forderung auf Schadenersatz») → KLAGE → RECHTSBEGEHREN → BEGRÜNDUNG:
  - I. Formelles: Vollmacht; Parteien (HR-Auszüge); internationale/örtliche Zuständigkeit (LugÜ); sachliche Zuständigkeit (HGer); kein Schlichtungsverfahren; Verfahrensart/Streitwert; genereller Beweisofferten-Vorbehalt; fremdsprachige Urkunden ohne Übersetzung (Nachreichung auf Aufforderung).
  - II. Materielles, A. Sachverhalt (chronologisch, je Behauptung «BO:»-Beweisofferten): a) Vertragsabschluss Parteien (inkl. AGB-Übermittlung), b) Weiterverkaufsvertrag mit Drittabnehmerin (Konventionalstrafklausel), c) Lieferverzögerung, Mahnungen, Drittforderung, ggf. vorgängiges Massnahmeverfahren, verspätete Lieferung.
  - II. B. Rechtliches: a) anwendbares Recht (IPRG/Haager Übk./CISG-Ausschluss), b) einschlägige AGB (Übernahme eigene AGB; keine Übernahme Gegen-AGB; Eventualbegründung «battle of forms»/knock-out rule; Subeventualbegründung Vorrang der Individualabrede), c) Anspruch auf Verzugsschadenersatz (Tatbestand), d) Zinsanspruch (Schadenszins).
  - Schlussformel, Unterschrift, Anzahl Exemplare, Beilage: Beweismittelverzeichnis mit Urkunden im Doppel.

**5. Anspruchsgrundlagen (Normen) + Masken-Feldliste**
- Hauptanspruch: Art. 103 OR (Verspätungsschaden) bzw. vertragliche AGB-Haftungsklausel; Voraussetzungen: (1) Schuldnerverzug — Fälligkeit, Nichtleistung trotz Möglichkeit, Verfalltag (Art. 102 Abs. 2 OR) oder Mahnung (Art. 102 Abs. 1 OR), Pflichtwidrigkeit; (2) Schaden (inkl. Haftungsschaden gegenüber Dritten, z.B. verfallene Konventionalstrafe; Schadenseintritt bereits mit Entstehung der Verbindlichkeit, BGE 116 II 441); (3) adäquater Kausalzusammenhang; (4) Verschulden (vermutet, Exkulpation der Schuldnerin).
- Zins: Schadenszins 5% ab Schadenseintritt (kein Verzugszins, keine Mahnung nötig; Satz analog Art. 104 Abs. 1 OR).
- Kaufmännischer Verkehr: Vermutung Verzicht auf Lieferung bei Fixtermin, Art. 190 Abs. 1 OR — Beharren auf Erfüllung muss UNVERZÜGLICH erklärt werden.
- Masken-Felder: Parteien (Firma, Sitz, Zweck, Registerauszug In-/Ausland); Vertragsschluss (Datum Offerte/Annahme, Kommunikationsweg, Liefermenge/-gegenstand, Liefertermin, Lieferort); Rechtswahl (ja/nein, Formulierung — OR spezifisch?); AGB beider Seiten (Übermittlungsart, Zeitpunkt, einschlägige Klausel-Nr.); Drittvertrag (Datum, Kaufpreis, Liefertermin, Konventionalstrafklausel inkl. Höhe %); Mahnungen (Daten); Erklärung Festhalten an Lieferung (Datum, Art. 190 OR!); Datum tatsächliche Lieferung; Drittforderung (Datum, Betrag); Schadensbetrag; Zinslaufbeginn.

**6. Deterministisch vs. wertend**
- Deterministisch: Zuständigkeitsprüfung (LugÜ/ZPO/GOG-Kaskade), Verfahrensart nach Streitwert, Verzugseintritt bei Verfalltagsgeschäft (Datum + 1 Tag), Zinssatz 5%, Konventionalstrafhöhe (% × Kaufpreis), Beilagen-Nummerierung.
- Wertend: wirksame AGB-Übernahme (Zumutbarkeit der Kenntnisnahme, BGE 139 III 345), battle of forms (knock-out vs. last shot — höchstrichterlich offen), objektive/subjektive Wesentlichkeit des Dissenses, Übermässigkeit der Konventionalstrafe (Art. 163 Abs. 3 OR), Substanziierung des Drittanspruchs, Adäquanz, Exkulpation, taktische Frage Klage vor Zahlung an Dritten.

**7. Beilagen-Typen**
Vollmacht; HR-Auszug Klägerin; ausländischer Registerauszug + Statuten Beklagte; E-Mail-Korrespondenz Vertragsschluss; AGB beider Parteien; Weiterverkaufsvertrag; HR-Auszug Drittabnehmerin; Mahn-E-Mails; Forderungsschreiben Drittabnehmerin; Massnahmeentscheid; Bestätigungs-/Vorbehaltschreiben Drittabnehmerin; Beweismittelverzeichnis. Personalbeweise: Zeuge (Drittfirma), Parteibefragung/Beweisaussage (Organ der Klägerin, Art. 191 f. ZPO — zu verifizieren [Fedlex]).

**8. Fallen (Fristen/Verwirkung)**
- Art. 190 Abs. 1 OR: bei kaufmännischem Fixgeschäft Vermutung des Lieferverzichts — wer Erfüllung will, muss dies UNVERZÜGLICH (gleicher/nächster Werktag) anzeigen, sonst Untergang des Erfüllungsanspruchs.
- Haftungsschaden klagbar schon vor Zahlung an Drittgläubigerin (BGE 116 II 441), ABER: Drittanspruch muss substanziiert behauptet/bewiesen werden (BGer 4A_71/2012); Klage wirkt faktisch als Schuldeingeständnis gegenüber Drittgläubigerin — taktisch nur bei zweifelsfreier Haftung.
- Verjährung gegenüber Verkäuferin laufend unterbrechen bzw. Verjährungseinredeverzicht einholen (Art. 127/135 OR — zu verifizieren [Fedlex]).
- Noch ungewisse weitere Drittansprüche nicht einklagen, sondern Nachklagevorbehalt ins Rechtsbegehren.
- Streitverkündung an Verkäuferin im Prozess der Drittgläubigerin (Art. 78 ZPO).
- AGB-Falle: blosse Rechtswahl «Schweizer Recht» schliesst CISG nicht aus; AGB per Fax-Bestellmöglichkeit oder erst nach Vertragsschluss zugestellt = nicht übernommen (BGE 139 III 345; BGE 98 Ia 314).

---
### § 6 — Gesuch um Erstreckung des Mietverhältnisses (Geschäftsmiete) — Muster: Klage des VERMIETERS auf Feststellung der Kündigungsgültigkeit + Abweisung der Erstreckung (nach abgelehntem Urteilsvorschlag)

**Besonderheit:** Trotz §-Titel ist die Musterschrift die Klage des Vermieters ans Mietgericht, nachdem dieser den Urteilsvorschlag der Schlichtungsbehörde (Kündigung gültig, 5 Jahre Erstreckung) abgelehnt hat. Kläger muss klagen, ohne die gerichtlichen Anträge der Mieterin zu kennen → Anträge orientieren sich am Rechtsbegehren der Mieterin vor Schlichtungsbehörde.

**1. Verfahrensart (+ Schlichtung?)**
- Vereinfachtes Verfahren ohne Streitwertgrenze: Kündigungsschutz/Erstreckung Wohn- und Geschäftsräume, Art. 243 Abs. 2 lit. c ZPO.
- Schlichtung ZWINGEND vorgelagert; Schlichtungsbehörde kann im «Kernbereich» des Mietrechts (Hinterlegung, Mietzinsschutz, Kündigungsschutz, Erstreckung) Urteilsvorschlag erlassen (Art. 210 Abs. 1 lit. b ZPO); Ablehnung innert 20 Tagen (Art. 211 Abs. 1 ZPO); Klagebewilligung an die ABLEHNENDE Partei (Art. 211 Abs. 2 ZPO).
- Vertraulichkeit des Schlichtungsverfahrens (Art. 205 ZPO): Aussagen dürfen im Gerichtsverfahren nicht verwendet werden — bei Sachverhaltsredaktion beachten.

**2. Zuständigkeit (Normen)**
- Örtlich: Gericht am Ort der gelegenen Sache, Art. 33 ZPO.
- Sachlich: Mietgericht (Kanton ZH: § 21 GOG/ZH); in Kantonen ohne Mietgericht ordentliches Gericht.
- Streitwert (vermögensrechtlich, Basis Bruttomietzins): Kündigungsschutz = Bruttomietzins der 3-jährigen Sperrfrist + Zeitraum bis zur nächsten Kündigungsmöglichkeit (BGE 137 III 389; 136 III 196); reine Erstreckung = Mietzins während beantragter Erstreckungsdauer; Eventualbegehren Erstreckung wird beim Streitwert NICHT mitgerechnet (Art. 91 Abs. 1 ZPO); unbeziffertes Erstreckungsbegehren («längstmöglich») → vorläufiger Mindestwert über Art. 85 ZPO; Kostenvorschuss Art. 98 ZPO (Kann-Vorschrift, in ZH praktisch immer verlangt).

**3. Rechtsbegehren-RASTER (Vermieterklage)**
1. Feststellung, dass die mit amtlichem Formular vom [Datum] erklärte Kündigung der [Objektbeschreibung] in der Liegenschaft [Adresse] per [Termin] gültig ist.
2. Abweisung eines allenfalls gestellten Erstreckungsbegehrens — vollumfänglich ODER eingeschränkt: «…soweit damit mehr oder anderes als eine einmalige und definitive Erstreckung bis zum [Datum] beantragt wird» (Kostenrisiko-Reduktion bei absehbarer Verfahrensdauer).
3. Kosten- und Entschädigungsfolgen (zzgl. MwSt.) zulasten der Beklagten.
Optional: Antrag auf Vertragsanpassung im Erstreckungsentscheid (Art. 272c Abs. 1 OR — Mietzinsanpassung, relative und absolute Methode, frühestens ab Erstreckungsbeginn).
Platzhalter: [Kündigungsdatum/-formular], [Wirkungstermin], [Objekt/Adresse], [max. akzeptierte Erstreckungsdauer], [MwSt-Satz].

**4. Aufbau-Gliederung**
- Rubrum (Mietgericht; «betreffend Anfechtung Kündigung/Mieterstreckung»; Mietobjekt-Angabe; Bezug auf Klagebewilligung) → KLAGE → RECHTSBEGEHREN → BEGRÜNDUNG:
  - I. Formelles: Vollmacht; Fristwahrung (Prüfung von Amtes wegen); Streitwert; Zuständigkeit + Verfahrensart.
  - II. Sachverhalt: A. Mietverhältnis (Vertrag, Mietzins netto/brutto, Kündigungsfristen/-termine), B. Kündigung (amtliches Formular + Begleitschreiben, vorzeitiges Auszugsrecht), C. Kündigungsgrund/Bauprojekt (Machbarkeitsstudie, Pläne, Finanzierung, Baubewilligung, Terminplan).
  - III. Materielles: A. Gültigkeit der Kündigung (Formvorschriften Art. 266l Abs. 2 OR; kein Verstoss gegen Treu und Glauben Art. 271/271a OR; keine Sperrfrist), B. Erstreckung (Härtebegriff; Abarbeitung der Kriterien von Art. 272 Abs. 2 OR lit. a–e als Untertitel a–h, inkl. antizipierte Entkräftung der Mieterargumente: Standortgebundenheit, Investitionen, Suchbemühungen; Interessen des Vermieters; Subeventualstandpunkt zur Dauer).
  - Schlussformel; Beilage: Beweismittelverzeichnis zweifach mit Urkunden im Doppel.

**5. Anspruchsgrundlagen (Normen) + Masken-Feldliste**
- Kündigungsgültigkeit: Art. 266l Abs. 2 OR (amtliches Formular), Art. 266o OR (Nichtigkeit bei Formverstoss Art. 266l–266n OR), Art. 271 Abs. 1 OR (Treu und Glauben; Beweislast Missbräuchlichkeit beim Mieter, BGE 135 III 112), Art. 271a OR (verpönte Gründe/Sperrfrist Abs. 1 lit. e, Abs. 2); Abbruch-/Umbaukündigung: Projekt muss bei Kündigung «genügend ausgereift»/greifbare Realität sein (BGE 140 III 496; 140 III 598; 142 III 91); Baubewilligung NICHT vorausgesetzt.
- Erstreckung: Art. 272 Abs. 1 OR (Härte für Mieter/Familie, nicht durch Vermieterinteressen gerechtfertigt); Kriterien Art. 272 Abs. 2 OR (lit. a Vertragsumstände/-inhalt, lit. b Dauer, lit. c wirtschaftliche Verhältnisse, lit. d persönliche Verhältnisse — zu verifizieren (Fedlex), lit. e Verhältnisse örtlicher Markt); Ausschluss: Art. 272a OR (u.a. Abs. 2 Ersatzobjekt); Dauer/Anzahl Erstreckungen Geschäftsräume: Art. 272b OR (max. 6 Jahre — zu verifizieren (Fedlex)); Vertragsanpassung: Art. 272c OR; Weitergeltung des Vertrags während Erstreckung: Art. 272 Abs. 2 OR i.V.m. Art. 272c Abs. 2 — zu verifizieren (Fedlex).
- Masken-Felder: Parteien (Vermieter natürliche Person / Mieterin AG); Mietvertrag (Datum, Objektart, Anfangs-/aktueller Mietzins netto+brutto, Zahlungstermin, Kündigungsfrist/-termine, früheste Kündigung); Kündigung (Formular-Datum, Genehmigungsdatum Formular, Wirkungstermin, Begleitschreiben, vorzeitiges Auszugsrecht ja/nein); Projekt (Studien/Pläne/Finanzierung/Bewilligung mit Daten, Investitionsvolumen, Baubeginn); Schlichtungsverfahren (Anfechtungsdatum, Verhandlungsdatum, Urteilsvorschlag-Inhalt, Ablehnung, Klagebewilligung, Klagefrist); Streitwertberechnung.

**6. Deterministisch vs. wertend**
- Deterministisch: Fristberechnungen (30 Tage Anfechtung ab Empfang, absolute Empfangstheorie; 20 Tage Ablehnung Urteilsvorschlag — KEIN Gerichtsferienstillstand; 30 Tage Klagefrist — MIT Gerichtsferienstillstand Art. 145 Abs. 1 ZPO); Formularpflicht; Streitwertformeln; Zuständigkeit.
- Wertend: Missbräuchlichkeit der Kündigung (ernsthaftes/wahres Kündigungsmotiv, Reifegrad des Projekts), Härtebeurteilung, Gewichtung der Art.-272-Abs.-2-Kriterien, Genügen der Suchbemühungen, Zumutbarkeit von Ersatzobjekten, Interessenabwägung, Erstreckungsdauer (einmalig/erstmalig, definitiv).

**7. Beilagen-Typen**
Klagebewilligung (Beschluss Schlichtungsbehörde); Vollmacht; Mietvertrag; amtliches Formular aktueller Mietzins; amtliches Kündigungsformular; Begleitschreiben; Projektunterlagen (Visualisierung, Machbarkeitsstudie, Pläne, Investoren-Fact-Sheet, Terminplan, Finanzierungsofferte, Baubewilligung mit Rechtskraftbescheinigung); Beweismittelverzeichnis.

**8. Fallen (Fristen/Verwirkung)**
- 30-Tage-Anfechtungs-/Erstreckungsfrist (Art. 273 Abs. 1 und 2 OR) ist VERWIRKUNGSFRIST (BGE 121 III 156): keine Unterbrechung/Erstreckung/Wiederherstellung; Fristbeginn nach absoluter Empfangstheorie (Beginn Abholfrist, unabhängig von tatsächlicher Kenntnis; BGE 140 III 244; 143 III 15); Wochenend-/Feiertage zählen mit.
- Befristetes Mietverhältnis: Erstreckungsgesuch spätestens 60 Tage VOR Vertragsablauf (Art. 273 Abs. 2 lit. b OR — zu verifizieren (Fedlex)).
- Bei gültiger Kündigungsanfechtung prüft Schlichtungsbehörde Erstreckung von Amtes wegen (Art. 273 Abs. 5 OR) — separates Erstreckungsgesuch dann entbehrlich.
- Ablehnungsfrist Urteilsvorschlag (20 Tage, Art. 211 Abs. 1 ZPO) steht während Gerichtsferien NICHT still (BGE 138 III 615) — anders als die 30-tägige Klagefrist (Art. 145 Abs. 1 ZPO). Keine Klage innert 30 Tagen nach Klagebewilligung → Urteilsvorschlag wird rechtskräftig (Art. 211 Abs. 3 ZPO).
- Abgelehnter Urteilsvorschlag ist vollständig hinfällig, keine Teilrechtskraft (BGE 135 III 253).
- Nichtige/unwirksame Kündigung löst KEINE Sperrfrist nach Art. 271a Abs. 1 lit. e OR aus — «Wiederholung» jederzeit zulässig (BGer 4A_588/2013).
- Begründungs-Falle: Kündigung ist auch ohne Begründung gültig; eine zu knappe Begründung im Begleitschreiben kann aber Angriffsfläche bieten (BGE 142 III 91 vs. BGE 143 III 344).

---
### § 7 — Anfechtung von Mietzinserhöhungen (Geschäftsmiete) — Muster: Klage der VERMIETERIN auf Feststellung der Nicht-Missbräuchlichkeit der Erhöhung (Orts-/Quartierüblichkeit)

**Besonderheit:** Nach Anfechtung der Erhöhung durch die Mieterin und Nichteinigung im Schlichtungsverfahren erhält zwingend die VERMIETERIN die Klagebewilligung (Art. 209 Abs. 1 lit. a ZPO) — Rollenumkehr. Vermieterklage = Feststellungsklage (BGer 4A_616/2020); Anfechtung durch Mieter = Gestaltungsklage (BGE 146 III 346). Gleichzeitiges Senkungsbegehren der Mieterin = selbständige Klage (nicht Widerklage) → ggf. Klagebewilligung an beide Parteien, Erst-/Zweitklage, Vereinigung.

**1. Verfahrensart (+ Schlichtung?)**
- Vereinfachtes Verfahren UNABHÄNGIG vom Streitwert: Schutz vor missbräuchlichen Miet-/Pachtzinsen, Art. 243 Abs. 2 lit. c ZPO (im Muster bei Streitwert CHF 3,68 Mio.).
- Schlichtung zwingend (Art. 197 ZPO); Urteilsvorschlag möglich (Art. 210 Abs. 1 lit. b ZPO), Ablehnung innert 20 Tagen (läuft auch in Gerichtsferien), Art. 211 ZPO.
- Verfahrensart verdrängt die handelsgerichtliche Zuständigkeit: kein HGer für Art.-243-Abs.-2-lit.-c-Streitigkeiten (BGE 139 III 457).

**2. Zuständigkeit (Normen)**
- Örtlich: Ort der gelegenen Sache, Art. 33 ZPO (Schlichtungsbehörde am Ort des Mietobjekts, Art. 270b OR).
- Sachlich: Mietgericht/Bezirksgericht als Kollegialgericht (ZH: Art. 4 ZPO i.V.m. § 21 Abs. 1 lit. a, § 24 lit. a, § 26 GOG/ZH).
- Streitwert: 20 × jährliche Mietzinsdifferenz der zuletzt strittigen Anträge (Art. 92 Abs. 2 ZPO); bei befristeten Verträgen: Differenz × Restlaufzeit; Parteien können Streitwert durch Teilanerkennung im Schlichtungsverfahren reduzieren.

**3. Rechtsbegehren-RASTER (Vermieter-Feststellungsklage)**
1. Feststellung, dass der Mietzins von CHF [Betrag] netto pro Jahr (aufgeschlüsselt je Teilfläche: CHF [x] Ladenlokal, CHF [y] Lager) für die von der Beklagten an [Adresse] gemieteten Räume und Flächen nicht missbräuchlich ist.
2. Kosten- und Entschädigungsfolgen zulasten der Beklagten.
Cave: MwSt-Zuschlag auf Parteientschädigung nur bei nicht vorsteuerabzugsberechtigten Parteien (zwei jur. Personen → kein MwSt-Zusatz).
Platzhalter: [Mietzins neu, aufgeschlüsselt], [Objekt/Adresse], [Flächen m2 und m2-Preise].

**4. Aufbau-Gliederung**
- Rubrum (Mietgericht; Vermieterin zusätzlich v.d. Liegenschaftsverwaltung; «betreffend Anfechtung Mietzinserhöhung»; Mietobjekt) → KLAGE → RECHTSBEGEHREN → BEGRÜNDUNG:
  - I. Formelles: Vollmacht; örtliche Zuständigkeit; Streitwertberechnung (mit Rechenweg); Verfahrensart + sachliche Zuständigkeit; Schlichtung/funktionelle Zuständigkeit; Klagebewilligung + Fristwahrung (30 Tage, Gerichtsferien).
  - II. Sachverhalt: A. Mietverhältnis (Vertrag, Flächen, Anfangsmietzins pro m2, Indexklausel, Kündigungsmodalitäten), B. Erhöhungsanzeige (amtliches Formular, Erhöhungsbetrag, Begründung «Orts-/Quartierüblichkeit»), C. Anfechtung durch Mieterin + Schlichtungsverlauf.
  - III. Rechtliches: A. Missbrauchskriterien (Art. 269/269a OR; «Altbauten»-Ausnahme von der Kriterien-Hierarchie), B. Orts-/Quartierüblichkeit: a) Begriff + Anforderungen an Vergleichsobjekte, b) Abarbeitung der einzelnen Vergleichskriterien (Lage, Ausstattung/«Edelrohbau», Zustand, Bauperiode, Grösse) je mit offerierten Vergleichsobjekten + Gutachten.
  - Schlussformel; «Im Doppel»; Beweismittel gemäss separatem Verzeichnis.

**5. Anspruchsgrundlagen (Normen) + Masken-Feldliste**
- Erhöhungsanzeige: Art. 269d OR (amtliches Formular, Wirkung nur auf Kündigungstermin, mind. 10 Tage vor Beginn der Kündigungsfrist; Inhalt: Art. 19 VMWG; klare Begründung Art. 19 Abs. 1 lit. a Ziff. 4 VMWG; Begründung im Begleitschreiben mit Verweis möglich, Art. 19 Abs. 1bis VMWG).
- Missbräuchlichkeit: Art. 269 OR (übersetzter Ertrag/Kaufpreis), Art. 269a OR (Vermutungen, lit. a Orts-/Quartierüblichkeit); Anfechtung: Art. 270b Abs. 1 OR; Senkung: Art. 270a OR (Abs. 2 Vorverfahren, Abs. 3 gleichzeitig mit Erhöhungsanfechtung formlos); Index/Staffel: Art. 269b/269c OR (+ Art. 17 Abs. 4 VMWG: Index nur bei mind. 5 Jahren Unkündbarkeit); Vergleichskriterien: Art. 11 VMWG (Lage, Grösse, Ausstattung, Zustand, Bauperiode; mind. 5 Vergleichsobjekte verschiedener Eigentümer in verschiedenen Gebäuden).
- «Altbauten»-Regel: Liegenschaft vor über 30 Jahren gebaut/erworben → Orts-/Quartierüblichkeit statt Ertragsrechnung im Vordergrund (BGE 140 III 433; 144 III 514).
- Masken-Felder: Vertrag (Datum, befristet/unbefristet, Mindestdauer, Flächenarten + m2, Anfangsmietzins pro m2/Jahr, Indexklausel ja/nein + Mindestmietzins-Klausel, Kündigungsfrist/-termine); Liegenschaft (Baujahr, Erwerbsjahr → Altbaute?); Erhöhung (Formular-Datum, Wirkungstermin, alte/neue m2-Preise je Fläche, Begründungstext); statistisch relevanter Zeitraum seit letzter Mietzinsfestlegung (5–7 Jahre); Anfechtung (Datum); Schlichtung (Verhandlungsdatum, Klagebewilligung an wen, Zustelldatum, Fristberechnung); Vergleichsobjekte (je: Adresse/Kreis, Eigentümer, Fläche, Zustand, Ausstattung, Bauperiode, m2-Preis); Gutachten.

**6. Deterministisch vs. wertend**
- Deterministisch: Formularpflicht + 10-Tage-Vorlauf, Wirkungstermin = Kündigungstermin, 30-Tage-Anfechtungsfrist, 30-Tage-Klagefrist (mit Gerichtsferien), Streitwertformel (20 × Jahresdifferenz), Zuständigkeitskaskade, Altbauten-Schwelle (30 Jahre), Mindestzahl 5 Vergleichsobjekte.
- Wertend: Vergleichbarkeit der Objekte nach Art. 11 VMWG (Lage, Ausstattung, Zustand, Bauperiode), «statistisch relevanter Zeitraum» (5–7 Jahre, einzelfallabhängig), Klarheit der Begründung, Hierarchie der Missbrauchskriterien/Ertragseinwand, Beweiswert von Privatgutachten/Statistiken, Substanziierungsgrad (von Rechtsprechung streng verlangt).

**7. Beilagen-Typen**
Anwaltsvollmacht; Klagebewilligung (Beschluss Schlichtungsbehörde); Mietvertrag; amtliches Erhöhungsformular; Dokumentation Vergleichsobjekte (Zusammenstellung mit Detailangaben je Objekt); Privatgutachten (z.B. Immobilienberatungsfirma) zu orts-/quartierüblichen m2-Preisen; Beweisofferte gerichtliches Gutachten (Expertise); separates Beweismittelverzeichnis.

**8. Fallen (Fristen/Verwirkung)**
- Nichtigkeitsfallen bei der Erhöhungsanzeige (Art. 269d Abs. 2 OR): kein/ungenehmigtes Formular, fehlende oder UNKLARE Begründung (= unbegründet, nichtig; BGE 121 III 6), Kumulation relativer und absoluter Erhöhungsgründe, fehlende eigenhändige Unterschrift (aber: Berufung darauf nach unangefochtener Erhöhung rechtsmissbräuchlich, BGE 138 III 401), Erhöhung auf Nicht-Kündigungstermin oder ohne 10-Tage-Vorlauf.
- Zustellfristen: Erhöhungsanzeige nach EINGESCHRÄNKTER Empfangstheorie (Zustellfiktion nach 7-tägiger Abholfrist); Anfechtungsfrist 30 Tage (Art. 270b Abs. 1 OR) ab Tag nach Zugang.
- Senkungsbegehren: eigenständig nur SCHRIFTLICH und mit Vorverfahren auf Kündigungstermin (Art. 270a Abs. 2 OR; Prozessvoraussetzung, BGE 132 III 702); formlos nur GLEICHZEITIG mit Erhöhungsanfechtung und nur auf denselben Termin (Art. 270a Abs. 3 OR; BGE 122 III 20); nach Schlichtungsverfahren gilt die Erleichterung nicht mehr → beide Parteien müssen je innert 30 Tagen klagen.
- Mehrere Mieter = notwendige Streitgenossenschaft: Anfechtung durch nur einen Mieter unwirksam; nicht anfechtende Mitmieter sind einzuklagen (BGE 136 III 431; 140 III 598); Vollmacht-Nachreichung nach Fristablauf fraglich (BGE 140 III 70).
- Indexklausel mit Mindestmietzins schliesst Anfechtung nach Art. 270c/270d OR während der Unkündbarkeitsdauer aus (BGE 125 III 358); nach Ablauf der Mindestdauer Überprüfung nach absoluten ODER relativen Kriterien möglich.
- Einvernehmliche Mietzinsanpassung ohne Formular nur unter 6 kumulativen Voraussetzungen (u.a. geschäftserfahrener Mieter, kein Kündigungsdruck); Beweislast beim Vermieter.

---
### § 8 — Klage des Vermieters auf Schadenersatz und Ausweisung (nach Zahlungsverzugskündigung Art. 257d OR; Wohnung mit Ehegattin + Untermieter)

**1. Verfahrensart (+ Schlichtung?)**
- Wahlrecht des Vermieters: (a) Rechtsschutz in klaren Fällen = summarisches Verfahren (Art. 257 i.V.m. Art. 248 lit. b ZPO) — schnellster Weg zum Ausweisungstitel, ABER nur wenn Sachverhalt unbestritten/sofort beweisbar UND Rechtslage klar; sonst Nichteintreten (ohne Rechtsverlust, ohne Sperrfristauslösung, BGE 144 III 346) und Neueinreichung; (b) ordentlicher Prozessweg = vereinfachtes Verfahren (Art. 243 ff. ZPO).
- KEINE Schlichtung im summarischen Verfahren (Art. 198 lit. a ZPO).
- Pendentes Kündigungsschutzverfahren der Mieter hindert die Ausweisung nach Art. 257 ZPO NICHT — keine Litispendenz-Einrede (Art. 59 Abs. 2 lit. d ZPO; BGE 141 III 262); Antrag auf Sistierung des Schlichtungsverfahrens stellen.
- Forderungsklage (Mietzinsausstände + Nutzungsentschädigung) im Summarverfahren NICHT empfohlen (Schadenshöhe bei Klageeinreichung noch offen, Bestreitung zerstört Liquidität) → besser zweites Verfahren nach Rückgabe; Muster zeigt Forderung als Variante für den ordentlichen Weg.

**2. Zuständigkeit (Normen)**
- Örtlich: Ort der gelegenen Sache, Art. 33 ZPO; international: Art. 22 Ziff. 1 LugÜ (ausschliesslich Belegenheitsort) bzw. Art. 113 IPRG.
- Sachlich (ZH): Einzelgericht im summarischen Verfahren («Einzelgericht Audienz»), § 24 lit. c GOG/ZH; bei HR-eingetragenen Beklagten ggf. Handelsgerichts-Zuständigkeit prüfen (Art. 6 ZPO; Kantone ZH/BE/AG/SG).
- Streitwert Ausweisung: 6 Bruttomonatsmietzinse (mutmassliche Dauer bis Vollzug; BGE 144 III 346; BGE 138 III 620); bei verspäteter/keiner Anfechtung KEINE Einrechnung der 3-jährigen Sperrfrist; zusätzlich eingeklagte Forderung wird addiert.

**3. Rechtsbegehren-RASTER**
1. Befehl an die Beklagten (alle Bewohner!), das Mietobjekt [Beschreibung, Stockwerk, inkl. Nebenräume] unverzüglich vertragskonform geräumt und gereinigt zu verlassen und zurückzugeben, unter Androhung der Zwangsvollstreckung im Unterlassungsfall.
2. Gleicher Befehl je weiteres Mietobjekt (z.B. Einstellplatz Nr. [x]).
3. Verpflichtung des Beklagten 1 (nur Vertragspartei!) zur Zahlung von CHF [Betrag] zzgl. Zins 5% ab [Datum, mittlerer Verfall], unter ausdrücklichem Nachklagevorbehalt.
4. Anweisung an die Bank [x], den Saldo des Mietzins-Kautionskontos Nr. [x] (lautend auf Beklagten 1) nach Rechtskraft zugunsten der Klägerin auf Anrechnung freizugeben.
5. Anweisung an das zuständige Vollstreckungsorgan (ZH: Stadtammannamt), den Ausweisungsbefehl nach Rechtskraft auf erstes Verlangen zu vollstrecken (kantonal verschieden; BE: separates Vollstreckungsbegehren nötig).
6. Kosten- und Entschädigungsfolgen (zzgl. MwSt.) unter solidarischer Haftung der Beklagten.
Platzhalter: [Objekt(e)], [Parteien 1–n: Mieter/Ehegatte/Untermieter mit Geburtsdaten], [Forderungsbetrag + Zusammensetzung], [Zinsbeginn mittlerer Verfall], [Kautionskonto], [Vollstreckungsorgan].

**4. Aufbau-Gliederung**
- Rubrum (Einzelgericht im summarischen Verfahren; mehrere Beklagte; «betreffend Ausweisung/Schadenersatz») → AUSWEISUNGSBEGEHREN → BEGRÜNDUNG:
  - I. Formelles: Vollmacht; örtliche Zuständigkeit; Verfahrensart/sachliche Zuständigkeit + Wegfall Schlichtung; Umgang mit pendenter Kündigungsanfechtung (keine Litispendenz, Anfechtung verspätet); Streitwertberechnung (mit Rechenweg).
  - II. Sachverhalt: Mietverträge (Wohnung + Abstellplatz, Mietzinsentwicklung); Einzug Ehegattin; genehmigte Untermiete; Zahlungsausstand; Abmahnung Art. 257d OR (separat an Mieter und Ehegattin, eingeschrieben); Nichtabholung/Zustellfiktion (Track & Trace); Teilzahlung; Kündigung mit amtlichem Formular per Termin (separat zugestellt); Mitteilung Übergabetermin; Einwände der Mieter (Mängel/Verrechnung, angebliche Nichtzustellung) + Entkräftung; Verweigerung der Rückgabe; aufgelaufener Ausstand + Schaden; Kaution.
  - III. Rechtliches: Voraussetzungen Art. 257 ZPO; Voraussetzungen Art. 257d OR (Abmahnung, Frist, Androhung); Anspruchsgrundlagen Rückgabe; Zustellungs-/Fristennachweis; Verrechnungseinwand; Anfechtungsverspätung; direkte Vollstreckbarkeit.
  - Beilage: Urkunden gemäss separatem Beweismittelverzeichnis.

**5. Anspruchsgrundlagen (Normen) + Masken-Feldliste**
- Ausserordentliche Kündigung Zahlungsverzug: Art. 257d OR (schriftliche Zahlungsfrist mind. 30 Tage + ausdrückliche Kündigungsandrohung — blosser Gesetzesverweis genügt NICHT, BGE 136 III 196; Ausstand eindeutig bestimmbar, BGer 4A_134/2011; Kündigungsfrist mind. 30 Tage auf Monatsende; amtliches Formular).
- Familienwohnung: Abmahnung und Kündigung dem Mieter UND Ehegatten/eingetragenem Partner SEPARAT zustellen (Art. 266n OR), sonst nichtig (Art. 266o OR).
- Rückgabe-/Räumungsanspruch: vertraglich Art. 267 Abs. 1 OR; dinglich Art. 641 Abs. 2 ZGB (Vindikation — Grundlage auch gegen Untermieter und Nicht-Vertragsparteien).
- Schadenersatz für Nutzung nach Kündigungstermin: Schaden vermutungsweise = bisheriger Mietzins (BGer 4A_276/2018); plus offene Mietzinse; Zins 5% mittlerer Verfall.
- Kaution: Mietzins-Sparkonto Art. 257e OR; Freigabe an Vermieter auf Anrechnung.
- Masken-Felder: Parteien (Vermieterin/Verwaltung; Beklagte: Mieter, Ehegatte, Untermieter, Geburtsdaten); Mietverträge (Daten, Objekte, Netto-/Akonto-/Bruttomietzins, Zahlungsmodalität, Mietzinsänderungen mit Formulardaten); Untermiete (Anzeige-, Vertrags-, Zustimmungsdatum); Ausstand (Monat, Betrag); Abmahnung (Datum, Empfänger je separat, Versandart, Abholfristen, Zustellfiktionsdaten); Teilzahlungen (Datum, Betrag); Kündigung (Formulardatum, Wirkungstermin, Zustellnachweis je Empfänger); Übergabetermin; Einwände der Gegenseite; Forderungsrechnung (Restanz + Monatsbetreffnisse + Nutzungsentschädigung); Kautionskonto (Bank, Nr., Saldo); Vollstreckungsorgan.

**6. Deterministisch vs. wertend**
- Deterministisch: Fristenketten (Zahlungsfrist 30 Tage ab Zustellfiktion; Kündigungsfrist 30 Tage auf Monatsende; 7-Tage-Abholfrist + Zustellfiktion, BGE 137 III 208; 30-Tage-Anfechtungsfrist Art. 273 OR); Formular-/Separatzustellungs-Pflichten; Streitwert = 6 Bruttomietzinse (+ Forderung); Forderungsrechnung; Zinsbeginn mittlerer Verfall.
- Wertend: «Liquidität» von Sachverhalt und Rechtslage (Art. 257 ZPO) — Prognose, ob Einwände der Gegenseite die Klarheit zerstören; Bestand/Höhe von Gegenforderungen (Mängel, Mietzinsherabsetzung); Rechtsmissbräuchlichkeit der Kündigung (nur in absoluten Ausnahmefällen); Wahl Summar- vs. ordentlicher Weg; Risiko konkludenter Neuabschluss bei Zuwarten.

**7. Beilagen-Typen**
Anwaltsvollmacht; Mietverträge (Wohnung, Abstellplatz); Mietzinsänderungs-Formular; Wohnungsübernahmeprotokoll; Untermiete-Korrespondenz (E-Mail, Untermietvertrag, Zustimmung); Abmahnschreiben je Empfänger; Track-&-Trace-Auszüge; ungeöffnet retournierte Briefumschläge («nicht abgeholt») als Beweis; amtliche Kündigungsformulare je Empfänger; Begleit-/Übergabeterminschreiben; E-Mail-Wechsel zu Einwänden; Kautions-Kontoauszug; separates Beweismittelverzeichnis.

**8. Fallen (Fristen/Verwirkung)**
- Abmahnungs-Mindestinhalt (Art. 257d OR): Schriftform, Frist mind. 30 Tage, AUSDRÜCKLICHE Kündigungsandrohung (Gesetzesverweis genügt nicht), bestimmbarer Ausstand — sonst Kündigung unwirksam.
- Familienwohnung: fehlende Separatzustellung an Ehegatten (Art. 266n OR) → Nichtigkeit (Art. 266o OR).
- Verrechnungserklärung des Mieters zählt nur, wenn sie WÄHREND der Zahlungsfrist abgegeben wird; bestrittene, nicht liquide Gegenforderungen hindern die Kündigung nicht (im Muster: nie gerügter Mangel).
- Zustellfiktion: Abmahnung/Kündigung gelten am 7. Tag der Abholfrist als zugestellt (eingeschränkte Empfangstheorie, BGE 137 III 208); Ferienabwesenheit der Mieter schützt nicht; Beweis via Track & Trace + ungeöffnete Umschläge.
- Klage gegen ALLE Bewohner richten (Ehegatte, Untermieter — Art. 641 ZGB), sonst keine Vollstreckung des Urteils gegen sie.
- Zuwarten nach Kündigungstermin + vorbehaltlose Annahme von Zahlungen in Mietzinshöhe → Risiko konkludenter Neuvertrag/Verzicht, Verlust der Liquidität für Art. 257 ZPO; Zahlungen nur unter Vorbehalt als Nutzungsentschädigung annehmen.
- Anfechtungsfrist der Mieter: 30 Tage, Verwirkung (Art. 273 Abs. 1 OR); verspätete Anfechtung → Sperrfrist bleibt bei Streitwert unberücksichtigt.
- Nur der Mieter (Vertragspartei) haftet für Mietzins/Schadenersatz — Forderungsbegehren nicht gegen Ehegatten/Untermieter richten; Solidarhaftung nur für Prozesskosten beantragen.
- Vollstreckungsanordnung kantonal unterschiedlich (direkt im Urteil vs. separates Vollstreckungsbegehren, z.B. BE).

---

## Lücken / Hinweise
- Auswertung basiert je § auf Vorbemerkungen, vollständiger Musterklageschrift und Überschriften-Scan der Kommentar-/Hinweisteile; die ausführlichen Kommentarpassagen (III. Ergänzende Hinweise, u.a. Rechtsmittel-Abschnitte in §§ 6–8) wurden nur strukturell, nicht inhaltlich erfasst.
- § 5: Abschnitte zu Adäquanz/Verschulden (S. 26–28) und «III. Ergänzende Hinweise» (Ungewöhnlichkeitsregel, AGB-Auslegung) nur überflogen.
- Mit «zu verifizieren (Fedlex)» markierte Normzitate (u.a. Art. 31 ZPO, Art. 191 f. ZPO, Art. 127/135 OR, Art. 272 Abs. 2 lit. d OR, Art. 272b OR, Art. 273 Abs. 2 lit. b OR) stammen nicht direkt aus dem ausgewerteten Text.
# Dossier: Strukturauswertung Musterklagen Arbeits-/Werkvertrags-/Baurecht (Schulthess Musterklagen Bd. I, 2. Aufl. 2022)

*Quellenhinweis: Das «§ 9»-PDF enthält zusätzlich § 10 (Klage nach fristloser Kündigung) — beide ausgewertet. Das «§ 11»-PDF enthält § 11 und § 12.*

---

## § 9 — Klage des Arbeitnehmers nach ordentlicher Kündigung (Bonus / Überstunden / missbräuchliche Kündigung / Arbeitszeugnis)

**1. Klagetyp/Verfahren:** Leistungsklage mit objektiver Klagehäufung (3 Geldforderungen + 1 Realbegehren Zeugnis). Verfahrensart streitwertabhängig: vereinfacht bis CHF 30 000 (Art. 243 ZPO), sonst ordentlich. Schlichtung obligatorisch (Klage via Klagebewilligung). Kostenlos bis CHF 30 000 Streitwert in arbeitsrechtlichen Streitigkeiten (Art. 113 Abs. 2 lit. d, Art. 114 lit. c ZPO; nicht vor BGer, Art. 65 Abs. 4 lit. c BGG) — Teilklage (Art. 86 ZPO) als Kostendämpfungs-Strategie.

**2. Zuständigkeit:** Örtlich: Sitz/Wohnsitz Beklagte (Art. 10 Abs. 1 lit. b ZPO) oder gewöhnlicher Arbeitsort (Art. 34 Abs. 1 ZPO). Sachlich: Arbeitsgericht nach kantonalem Recht (im Muster: Arbeitsgericht Zürich).

**3. Rechtsbegehren-Raster (5 Begehren):**
1. Bezifferte **Brutto**-Geldforderung [Bonus pro rata: Betrag] + Zins 5% seit [Datum Inverzugsetzung]
2. **Unbezifferte** Forderung: gerichtlich durch Schätzung festzulegender Betrag [Überstunden] + Zins 5% seit [Datum]
3. Bezifferte **Netto**-Geldforderung [Entschädigung missbräuchliche Kündigung: Betrag] + Zins 5% seit [Tag nach Vertragsende]
4. Realbegehren: Aus-/Zustellung Arbeitszeugnis, datiert auf [letzter Arbeitstag], mit konkret beantragtem Änderungswortlaut [Absatz-Referenz + neuer Text; bei langem Text Verweis auf Anhang]
5. Kosten- und Entschädigungsfolgen zzgl. MwSt. [Satz]

**4. Aufbau:** Rubrum (Gericht, Parteien, Vertreter, «betreffend») → Einreichung Klagebewilligung → Rechtsbegehren → Begründung: I. Formelles (Zuständigkeit) → II. Materielles: A. Sachverhalt (Arbeitsverhältnis-Eckdaten; Pflichtenheft/Arbeitslast; Überstunden-Indizien; fehlende Zeiterfassung; Kündigung + Motiv; Vorsorgesituation; Leistungsausweis; Zeugnismängel; Bonuspraxis) — je Behauptung mit Beweisofferte (BO) und Beilagennummer → B. Rechtliches (a) Bonus, b) Überstunden, c) missbräuchliche Kündigung, d) Zeugnisberichtigung, e) Zinsen, f) Kosten) → Schlussformel → Beweismittelverzeichnis im Doppel.

**5. Materielle Grundlagen + Masken-Felder:**
- *Bonus:* Abgrenzung Gratifikation (Art. 322d OR) vs. variabler Lohnbestandteil/Erfolgsbeteiligung (Art. 322a OR); Fälligkeit bei Vertragsende (Art. 339 OR). Felder: Vertragsklausel-Wortlaut | Auszahlungsjahre | Freiwilligkeitsvorbehalt ja/nein | Berechnungsbasis (Kennzahl, Promille-/Prozentsatz) | Durchschnitts-Basisjahre | pro-rata-Monate.
- *Überstunden:* Art. 321c OR (Zuschlag 25%, Abs. 3); Schätzung analog Art. 42 Abs. 2 OR; Zeiterfassungspflicht Art. 46 ArG i.V.m. Art. 73 ArGV 1. Felder: Zeitraum | behauptete Wochenstunden (saisonal differenziert) | Indizienquellen | Anordnung/Notwendigkeit | Stundenansatz | Zuschlag.
- *Missbräuchliche Kündigung:* Art. 336, 336a, 336b OR. Felder: Alter | Dienstjahre | Kündigungsdatum/-frist | angegebenes vs. wahres Motiv | Vorsorge-Nachteil | geforderte Monatslöhne (max. 6).
- *Zeugnis:* Art. 330a OR (wahr + wohlwollend, BGE 136 III 510). Felder: Ist-Text | Soll-Text | Datierung.

**6. Deterministisch vs. wertend:**
- *Maskierbar:* Verwirkungsfristen (Einsprache/180 Tage); Verjährung 5 J. (Lohn) / 10 J. (Zeugnis); Zins 5% + Zinsbeginn (Mahnung Art. 102 Abs. 1 / Verfalltag Abs. 2, Art. 104 Abs. 1 OR); pro-rata-Bruch; 25%-Zuschlag; CHF-30 000-Schwellen; MwSt-Satz; Brutto/Netto-Kennzeichnung je Begehren.
- *Freitext-Gerüst:* Missbräuchlichkeits-Würdigung (Fallgruppen, erhöhte Fürsorgepflicht Alter/Dienstjahre); Bemessung Entschädigung; Plausibilisierung der Überstundenschätzung; Zeugnisformulierungen.

**7. Beilagen-Checkliste:** Vollmacht | Klagebewilligung | HR-Auszug Beklagte | Arbeitsvertrag | Organigramm, Pflichtenheft, Stellenbeschrieb | Vergleichsdaten/Gutachten | Arbeitszeit-Indizien (Kalenderauszüge, E-Mails, ÖV-Fahrplan) | Editionsbegehren (Zutritts-/Log-Protokolle, Vertrag der Nachfolge, Jahresabschlüsse) | Kündigung + Begründung | Vorsorgeplan/-ausweis | Mitarbeiterbeurteilungen | Anerkennungsschreiben | strittiges Zeugnis | Bonus-/Gratifikationsschreiben (Serie) | Zeugenliste mit Privatadressen.

**8. Besonderheiten/Fallen:** Doppelte Verwirkung Art. 336b OR (schriftliche Einsprache bis Ende Kündigungsfrist + Klage innert 180 Tagen nach Vertragsende); laufende 5-Jahres-Verjährung älterer Überstunden/Ferienlohn → Eile; unbezifferte Klage nur bei Sachverhalts-, nicht Rechtsfolgeermessen (BGE 131 III 243); Kostenrisiko bei Ermessensentschädigung → Art. 107 Abs. 1 lit. a ZPO anrufen; Zeugnis: summarisches Verfahren (Art. 248 lit. b ZPO) nur wenn noch gar kein Zeugnis ausgestellt, nicht für Abänderung; keine vorsorglichen Massnahmen (Vorvollstreckung); Beweislastverteilung Zeugnisinhalt (Arbeitgeber für Bestehendes, Arbeitnehmer für Änderungen).

---

## § 10 — Klage des Arbeitnehmers nach fristloser Kündigung

**1. Klagetyp/Verfahren:** Leistungsklage (3 Geldbegehren); Verfahrensart streitwertabhängig (Musterfall: ordentlich, hohe Beträge); Schlichtung obligatorisch. Kein Feststellungsbegehren «Kündigung ungerechtfertigt» — führt bei möglicher Leistungsklage i.d.R. zu Nichteintreten.

**2. Zuständigkeit:** Örtlich gewöhnlicher Arbeitsort (im Muster: Bezirksgericht Plessur/Chur); sachlich nach kantonalem Recht.

**3. Rechtsbegehren-Raster (4 Begehren):**
1. **Brutto**-Schadenersatz [entgangener Lohn ab fristloser Entlassung bis Ende hypothetischer Kündigungsfrist: Monate × Monatslohn] + Zins 5% seit [Tag nach Entlassung], **mit Reduktionsvorbehalt** bei Stellenantritt vor Fristende
2. **Netto**-Schadenersatz [BVG-Schaden: Arbeitgeber-Prämienanteile in % auf Lohnsumme] + Zins, gleicher Vorbehalt
3. **Netto**-Entschädigung Art. 337c Abs. 3 OR [x Monatslöhne, max. 6] + Zins seit [Entlassungsdatum]
4. Kosten-/Entschädigungsfolgen zzgl. MwSt.

**4. Aufbau:** Rubrum → Rechtsbegehren → Begründung: I. Zuständigkeit → II. Sachverhalt (Verlauf, Leistungsausweis, Chronologie Kenntnis der Vorwürfe → Entlassung) → III. Rechtliches (Verwirkung des Kündigungsrechts wegen Zeitablaufs; fehlender wichtiger Grund Art. 337 OR; Schadenersatz Art. 337c Abs. 1/2 OR; BVG-Schaden; Poenale Abs. 3; Verzinsung) → Schluss → Beweismittelverzeichnis.

**5. Materielle Grundlagen + Felder:** Art. 337, 337c Abs. 1–3 OR; Art. 102 Abs. 2, 104 Abs. 1 OR; Art. 10 Abs. 2 lit. b BVG; Art. 29 Abs. 2 AVIG (Subrogation Arbeitslosenkasse); Art. 324a, 336c OR (Sonderfälle). Felder: Datum Kenntnis Kündigungsgrund | Datum Aussprache fristlose Entlassung (Verwirkungsprüfung: Überlegungsfrist normal 2–3 Arbeitstage; Abklärungsfrist separat) | Monatslohn | hypothetisches Vertragsende | Ersparnisse/Ersatzverdienst (Art. 337c Abs. 2) | ALV-Taggelder | BVG-Prämiensatz | Anzahl Poenale-Monatslöhne | Mitverschuldens-Faktoren.

**6. Deterministisch vs. wertend:** *Maskierbar:* Lohnersatz = Monate × Lohn; BVG-% × Lohnsumme; Zinsbeginn = Entlassungsdatum (Verfalltag, Art. 102 Abs. 2 OR); Poenale-Rahmen 0–6 Monatslöhne, stets netto (keine Sozialversicherungsabzüge); Verjährung 10 Jahre. *Wertend:* wichtiger Grund / Rechtfertigung; Verwirkungs-Würdigung (Abklärungs- vs. Überlegungsfrist); Bemessung Poenale (Dienstjahre, Umstände, Mitverschulden); Klagehöhen-Taktik.

**7. Beilagen:** Arbeitsvertrag | Mitarbeiterbeurteilungen | Zwischenzeugnis | Referenz-/Dankesschreiben (Kundendaten abdecken!) | eigene Information an Arbeitgeberin | fristlose Kündigung | Zeugen (bei Amts-/Berufsgeheimnis: Ermächtigung erforderlich).

**8. Fallen:** Brutto- vs. Nettoklage umstritten — wenn möglich netto einklagen (Vollstreckungsprobleme, Art. 81 Abs. 1 SchKG); Subrogation der ALV-Taggelder (Art. 29 Abs. 2 AVIG) → Reduktionsvorbehalt ins Begehren; Sperrfristen Art. 336c OR können Anspruchsdauer verlängern; Bankgeheimnis Art. 47 BankG bei Beilagen; Nachschieben von Kündigungsgründen durch Gegenseite möglich (beschränkt); offene Ferien/Überstunden nur abzugelten, wenn Bezug in hypothetischer Frist unzumutbar.

---

## § 11 — Klage des Arbeitgebers auf Durchsetzung eines Konkurrenzverbots

**1. Klagetyp/Verfahren:** Leistungsklage: Geldforderung (Konventionalstrafe) + Unterlassungsbegehren (Realvollstreckung). Ordentliches Verfahren. Schlichtung durchgeführt (Klagebewilligung, Frist Art. 209 Abs. 3 ZPO); als **Prosequierungsklage** nach vorsorglicher Massnahme entfällt die Schlichtung (Art. 198 lit. h ZPO) und ist die gerichtliche Prosequierungsfrist zu wahren.

**2. Zuständigkeit:** Örtlich/sachlich aus dem (beendeten) Arbeitsverhältnis: gewöhnlicher Arbeitsort (im Muster: Regionalgericht Berner Jura-Seeland); sachlich kantonales Recht.

**3. Rechtsbegehren-Raster (3 Begehren):**
1. Zahlung Konventionalstrafe CHF [Betrag gem. Vertragsklausel] + Zins 5% seit [Datum]
2. Verbot unter Androhung von Art. 292 StGB: jede direkte/indirekte Tätigkeit für [Konkurrenzfirma] sowie jede sonstige Konkurrenzierung, befristet bis [Ende Verbotsdauer]
3. Kosten-/Entschädigungsfolgen zzgl. MwSt.

**4. Aufbau:** Rubrum → Rechtsbegehren → I. Formelles (Vollmacht; Zuständigkeit; Klagebewilligung fristgerecht; Wahrung der Prosequierungsfrist aus Massnahmeentscheid) → II. Materielles: Arbeitsverhältnis | wörtliche Wiedergabe der Konkurrenzklausel | Verbindlichkeitsvoraussetzungen | Verletzungshandlungen | Verfall + Angemessenheit Konventionalstrafe | Voraussetzungen Realvollstreckung | Schlussfolgerung | Kosten → Schluss/Beweismittelverzeichnis.

**5. Materielle Grundlagen + Felder:** Art. 340 Abs. 1/2, 340a Abs. 1, 340b Abs. 2/3, 340c OR; Art. 160–163 OR (Konventionalstrafe; Herabsetzung Art. 163 Abs. 3); Art. 292 StGB. **Checkliste der 10 Gültigkeitsvoraussetzungen** (erste 7 vom Arbeitgeber zu beweisen): Handlungsfähigkeit | kein Lehrverhältnis (Art. 344a Abs. 4 OR) | Schriftform | Einblick Kundenkreis/Geheimnisse | erhebliche Schädigungsmöglichkeit | Kausalzusammenhang | angemessene Begrenzung Ort/Zeit/Gegenstand | kein Wegfall mangels Interesse (Art. 340c Abs. 1) | kein Wegfall wegen Kündigungsumständen (Art. 340c Abs. 2) | kein Verzicht (Saldoklausel, Zeugnis-Floskel). Felder: Klauselwortlaut | Dauer | Radius/Gebiet | Gegenstand | Strafbetrag + Bemessungsbasis | Realvollstreckungsabrede ja/nein | Verletzungshandlungen mit Daten.

**6. Deterministisch vs. wertend:** *Maskierbar:* Schriftformprüfung; Verbots-Enddatum; Strafbetrag aus Vertrag; Verjährung 10 Jahre; Zinslauf. *Wertend:* Angemessenheit der Begrenzung (Kundenschutz i.d.R. max. 1–1,5 Jahre); doppelte Voraussetzung der Realvollstreckung (Interessen + Verhalten, eindeutiges Abwägungsresultat); Herabsetzungsrisiko der Strafe (über ein halbes Jahresgehalt selten zugesprochen); Reichweite des Verbots über die konkrete Konkurrenzfirma hinaus.

**7. Beilagen:** Vollmacht | Arbeitsvertrag mit Klausel | Klagebewilligung | Massnahmeentscheid (mit Prosequierungsfrist) | HR-Auszug Konkurrenzfirma | Inserate, Kundenanschreiben, Verträge | Zeugen.

**8. Fallen:** Prosequierungsfrist (oft < 1 Monat; Massnahme fällt bei Versäumnis dahin, Art. 263 ZPO); Realvollstreckung nur bei schriftlicher Abrede + qualifizierter Interessenlage (Art. 340b Abs. 3 OR); ohne abweichende Abrede befreit Strafzahlung vom Verbot (Art. 340b Abs. 2 OR) → Klausel prüfen; gänzliche Unwirksamkeit völlig unbestimmter Verbote (BGE 145 III 365); Wegfalltatbestände Art. 340c OR (Arbeitgeberkündigung ohne begründeten Anlass!).

---

## § 12 — Vorsorgliche Massnahmen zur Durchsetzung des Konkurrenzverbots

**1. Gesuchstyp/Verfahren:** Gesuch um vorsorgliche Massnahmen, verbunden mit Gesuch um superprovisorische Anordnung (Art. 261–265 ZPO); summarisches Verfahren; keine Schlichtung.

**2. Zuständigkeit:** Örtlich wie § 11 (Arbeitsgerichtsstand); sachlich kantonal (im Muster Kanton BE: Regionalgerichte, Art. 11 EG ZSJ/BE).

**3. Rechtsbegehren-Raster (4 Anträge):**
1. Unterlassungsverbot (Inhalt wie § 11 Ziff. 2) unter Androhung Art. 292 StGB, befristet: für Verfahrensdauer + Prosequierungsfrist + Prosequierungsprozess, längstens bis [Verbotsende]
2. Superprovisorische Anordnung ohne Anhörung des Gesuchsgegners
3. Ansetzung einer angemessenen Frist zur Prosequierungsklage
4. Kosten-/Entschädigungsfolgen zzgl. MwSt.

**4. Aufbau:** Rubrum (Gesuchstellerin/Gesuchsgegner) → Anträge → I. Formelles (örtliche + sachliche Zuständigkeit Summarverfahren) → II. Materielles: Arbeitsverhältnis | Klauselwortlaut | Verletzungshandlungen | **Hauptsachenprognose 1** (Verbindlichkeit des Verbots glaubhaft) | **Hauptsachenprognose 2** (Realvollstreckungsanspruch glaubhaft) | **Nachteilsprognose** (nicht leicht wiedergutzumachender Nachteil, Art. 261 Abs. 1 lit. b ZPO: Kundenverluste) | **besondere Dringlichkeit** (Art. 265 Abs. 1 ZPO) | Schlussfolgerung | Kosten.

**5. Materielle Grundlagen + Felder:** Prozessual Art. 261–265, 263, 270 ZPO; materiell Art. 340 ff. OR (wie § 11), Beweismass: Glaubhaftmachung; Urkundenprimat Art. 254 ZPO. Felder: Klauseldaten | Verletzungsbeginn/-handlungen mit Daten | bereits eingetretene Verluste (Kunden, Umsatz) | Kenntniszeitpunkt (Dringlichkeit!) | Sicherheitsleistungs-Bereitschaft.

**6. Deterministisch vs. wertend:** *Maskierbar:* Praxisregel ~2 Wochen ab Kenntnis für Superprovisorik; kein zweiter Schriftenwechsel im Summarverfahren → vollständiger Vortrag im Gesuch; Befristungsformel des Verbots. *Wertend:* Glaubhaftmachung beider Prognosen; Unwiederbringlichkeit des Kundenverlusts; Dringlichkeitsbegründung.

**7. Beilagen (nur Urkunden):** Vollmacht | Arbeitsvertrag | HR-Auszug Konkurrenzfirma | Inserate, Kundenanschreiben, Verlust-Dokumentation.

**8. Fallen:** Zuwarten zerstört die Dringlichkeit (Selbstwiderlegung); Gericht kann Sicherheitsleistung von Amtes wegen schon superprovisorisch verlangen (Art. 264 ZPO) — Liquidität bereithalten; Haftung für Schaden aus ungerechtfertigter Massnahme; kein Rechtsmittel gegen Superprovisorik (stattdessen Anhörung + Neuentscheid, Art. 265 ZPO); Gegenseite kann Schutzschrift hinterlegt haben (Art. 270 ZPO, 6 Monate wirksam); Gegenseite kann durch eigene Sicherheitsleistung Massnahme abwenden (Art. 261 Abs. 2 ZPO); Streitwert = wirtschaftliches Interesse (hoch!).

---

## § 13 — Schadenersatzklage des Bestellers bei Nichterfüllung (Werkvertrag)

**1. Klagetyp/Verfahren:** Leistungsklage nach Vertragsrücktritt via Verzugsregeln: Rückabwicklung (Geld + Realbegehren Rücknahme) + Schadenersatz (negatives Interesse) + Beseitigung Rechtsvorschlag (Art. 79 SchKG). Ordentliches Verfahren vor Handelsgericht; **Schlichtung entfällt** (Art. 198 lit. f ZPO). Widerklagerisiko (Restwerklohn) einkalkulieren.

**2. Zuständigkeit:** International: Gerichtsstandsklausel in AGB (Art. 23 Ziff. 1 lit. a LugÜ; Sitzbegriff Art. 60 LugÜ); sachlich Handelsgericht (Art. 6 Abs. 2 ZPO i.V.m. § 44 lit. b GOG/ZH, Streitwert > CHF 30 000); Rechtswahl gültig nach Art. 116 IPRG.

**3. Rechtsbegehren-Raster (3 Begehren):**
1. Zahlung [Rückerstattung geleisteter Teilzahlungen, **in Vertragswährung**] + Zins 5% seit [Ablauf Rückzahlungsfrist]; zusätzlich [Schadenersatzbetrag] + Zins 5% seit [Betreibungseinleitung]; Realbegehren: Rücknahme/Demontage/Abtransport der Anlagenteile auf Kosten der Beklagten
2. Aufhebung des Rechtsvorschlags in Betreibung Nr. [x] im Umfang von [**CHF-umgerechnete** Beträge] + Zins
3. Kosten-/Entschädigungsfolgen (MwSt. auf Parteientschädigung nur bei Schweizer, nicht vorsteuerabzugsberechtigter Klägerin)

**4. Aufbau:** Rubrum → Rechtsbegehren → I. Formelles (Vollmacht; internationale/örtliche Zuständigkeit; sachliche Zuständigkeit HGer; Entfall Schlichtung; Betreibungsvorgeschichte) → II. Materielles: A. Tatsächliches (Parteien; Werkvertrag mit Spezifikation/Terminen/Zahlungsplan; geleistete Zahlungen; Terminverschiebung; Streit um angebliche Abnahme; Nachfristansetzung; ungenutzter Ablauf; Rücktrittserklärung) → B. Rechtliches (a) anwendbares Recht + Vertragsqualifikation, b) Lieferumfang/Soll-Ist, c) Verzug/Nachfrist/Rücktritt, d) Rückabwicklung, e) Schadenersatz mit Einzelposten, f) Verzugszinsen) → Schluss (HGer ZH: fünffach) → Beweismittelverzeichnis.

**5. Materielle Grundlagen + Felder:** Art. 363 ff. OR (Qualifikation); Art. 366 Abs. 1 OR (Herstellungsverzug) bzw. Art. 102–109 OR (Ablieferungsverzug); Art. 107 Abs. 2, 108, 109 Abs. 1/2 OR (Wahlrechte, Rücktritt, negatives Interesse, Verschuldensvermutung/Exkulpation); Art. 84 Abs. 1 OR (Fremdwährung); Art. 104 OR. Felder: Vertragsdatum | Soll-Spezifikation (Anhang) | Ablieferungstermin (+ einvernehmliche Verschiebung) | Mahnung/Verfalltag | Nachfrist (Datum, Endtermin, Angemessenheit) | Rücktrittsdatum (Unverzüglichkeit!) | geleistete Zahlungen | Schadensposten als Liste (Finanzierungs-, Lohn-, Bau-/Infrastruktur-, Marketingkosten: je Betrag + Substanziierung + Beilage) | Betreibungsdaten.

**6. Deterministisch vs. wertend:** *Maskierbar:* Währungslogik (Klage in Fremdwährung, Betreibung in CHF, Art. 67 Abs. 1 Ziff. 3 SchKG); Zinssatz 5% + Zinsbeginn-Regeln; Jahresgültigkeit Zahlungsbefehl (Art. 88 Abs. 2 SchKG); Verjährung 10 Jahre ab Wirksamkeit Rücktritt. *Wertend:* Abnahme-/Vollendungsfrage; Angemessenheit der Nachfrist; Unverzüglichkeit der Verzichts-/Rücktrittserklärung; Schadens-Substanziierung; Wahl unter den drei Gläubigeroptionen (Rücktritt + negatives Interesse / Austauschtheorie / Differenztheorie).

**7. Beilagen:** Vollmacht | HR-Auszüge beider Parteien (inkl. ausländisches Register) | Werkvertrag inkl. AGB + Anhänge | Zahlungsbefehl | Korrespondenz-Kette (Terminverschiebung, Abnahme-Streit, Nachfrist, Rücktritt) | Privatgutachten Ist/Soll (nur Parteibehauptung → gerichtliches Gutachten beantragen) | Kostenaufstellungen je Schadensposten | Zeugen.

**8. Fallen:** Klage in falscher Währung → Abweisung (BGE 134 III 151); Rücktritt muss **unverzüglich** erklärt werden (Art. 107 Abs. 2 OR; auch bei Entbehrlichkeit der Nachfrist nach Art. 108 OR); bei blossem Teilverzug kein voraussetzungsloser Gesamtrücktritt (BGE 141 III 106); nur negatives Vertragsinteresse ersetzbar (BGer-Praxis zu Art. 109 OR), kein Verspätungsschaden; Zahlungsbefehl vor Klage ggf. erneuern; Widerklage-Konstellation (negative Feststellungswiderklage bei Teilklage, BGE 143 III 506); HGer = einzige kantonale Instanz, Sachverhalt vor BGer nur eingeschränkt überprüfbar.

---

## § 14 — Klage des Bestellers aus Sachgewährleistung (Teilklage)

**1. Klagetyp/Verfahren:** **Teilklage** (Art. 86 ZPO) auf Geld (Nachbesserungskosten zweier Mangelpositionen, je Teilbetrag) + Aufhebung Rechtsvorschlag; ordentliches Verfahren vor Handelsgericht (Klägerwahlrecht Art. 6 Abs. 3 ZPO für nicht HR-eingetragene Privatperson); Schlichtung entfällt (Art. 198 lit. f ZPO). Nachklagerecht ausdrücklich vorbehalten.

**2. Zuständigkeit:** International: «Gerichtsstand Schweiz» genügt unter Art. 23 Ziff. 1 LugÜ (anders Art. 5 IPRG: bestimmtes Gericht nötig); örtlich Art. 112 Abs. 1 IPRG; sachlich Art. 6 Abs. 2/3 + Art. 219 ZPO i.V.m. § 44 lit. b GOG/ZH.

**3. Rechtsbegehren-Raster (3 Begehren):**
1. Zahlung [Teilbetrag Mangelposition 1] + Zins 5% seit [Verzugsdatum 1] **sowie** [Teilbetrag Mangelposition 2] + Zins 5% seit [Verzugsdatum 2] — bei mehreren Schadenspositionen je Position zugeordnet und separat verzinst
2. Aufhebung Rechtsvorschlag Betreibung Nr. [x] im gleichen Umfang (keine definitive Rechtsöffnung — dafür wäre Einzelrichter im Summarverfahren zuständig)
3. Kosten-/Entschädigungsfolgen

**4. Aufbau:** I. Formelles (Vollmacht; internationale Zuständigkeit; sachliche Zuständigkeit mit Wahlrecht; Entfall Schlichtung; **Teilklage-Deklaration**: Gesamtanspruch, Teilbeträge, Zuordnung, Nachklagevorbehalt; Betreibung) → II. Materielles: A. Tatsächliches (Vertragsgenese: Offertanfrage, Muster, Offerte, Auftragsbestätigung, Vertrag; Mangel 1: Feststellung, sofortige Rüge, einvernehmliche Behebung vor Ort, Kostenaufstellung, Rechnung, Verzugssetzung; Mangel 2: Entdeckung, sofortige Rüge, Gutachten, Bestreitung Gegenseite, Selbstvornahme-Ankündigung, Kosten, Rechnung, Nachfrist) → B. Rechtliches (a) Rechtswahl + Qualifikation, AGB-Nichteinbezug, b) Mangelhaftigkeit, c) Rügen + Verjährung, Anspruch auf Nachbesserungskostenersatz, d) Verzug/Zins, e) Kosten).

**5. Materielle Grundlagen + Felder:** Art. 363 ff., 367 Abs. 1 (Prüfung), 368 (Wandelung/Minderung/Nachbesserung/Mangelfolgeschaden), 369 (Selbstverschulden Besteller/Weisung), 370 Abs. 2 (Genehmigungsfiktion), 371 OR (Verjährung); Art. 107 ff. OR (Verzug mit Nachbesserungsschuld → Ersatz des Nichterfüllungsschadens = Verbesserungskosten); Art. 116/117 IPRG. Felder: Vertragsdatum + Spezifikation | Lieferdaten | je Mangelposition: Beschreibung, Ursache, Entdeckungsdatum, Rügedatum + -form, Fristansetzung, Weigerung, Kosten (Aufstellung) | Gesamtanspruch | Teilbeträge + Zuordnung | AGB-Einbezug ja/nein.

**6. Deterministisch vs. wertend:** *Maskierbar:* Verjährung 2 J. / 5 J. (Integration in unbewegliches Werk) / 10 J. (Arglist) (Art. 371, 210 Abs. 3 OR); Zins 5% ab Verzug je Position; Teilklage-Arithmetik; Streitwertgrenze CHF 30 000. *Wertend:* Rechtzeitigkeit + Substanziierung der Rüge (strenge BGer-Praxis); AGB-Globalübernahme (zumutbare Kenntnisnahme vor Vertragsschluss); Abgrenzung sachverständige Weisung des Bestellers (= wie Stofflieferung, Haftungsbefreiung); Übermässigkeit der Nachbesserungskosten.

**7. Beilagen:** Vollmacht | HR-Auszug (zefix) | Werkvertrag | Zahlungsbefehl (Gläubigerdoppel) | Offertanfrage, Offerten, Auftragsbestätigung | Lieferscheine | Rüge-Korrespondenz | Privatgutachten | detaillierte Kostendokumentation je Position | Rechnungen + Nachfristschreiben | Zeugen (Architekt, Drittfirma-Mitarbeiter); Geschäftsführer-Organ = Parteibefragung (Art. 159 ZPO).

**8. Fallen:** Genehmigungsfiktion bei verspäteter Rüge (Art. 370 Abs. 2 OR; Ausweich-Route Deliktsrecht Art. 41 ff. OR, sofern keine Freizeichnung); Privatgutachten = blosse Parteibehauptung; Schlichtungsgesuch unterbricht Verjährung **nicht** bei zwingender HGer-Zuständigkeit (BGer 4A_592/2013); Teilklage provoziert ggf. negative Feststellungswiderklage → Überweisung ins ordentliche Verfahren; Mängelrechte verdrängen Art. 97 OR vollständig; Streitverkündung an Lieferanten/Subunternehmer prüfen; Werklohnverweigerung nach Art. 82 OR nur bei gewähltem Nachbesserungsrecht + ausdrücklicher Einrede.

---

## § 15 — Klage des Bauherrn wegen Mängeln eines Bauwerks

**1. Klagetyp/Verfahren:** Leistungsklage auf Geld: (a) Ersatz bereits bezahlter Ersatzvornahmekosten (Mangel vor Abnahme, Art. 366 Abs. 2 OR) + (b) voraussichtliche Verbesserungskosten (Mangel nach Abnahme, Schadenersatz statt Nachbesserung, Art. 107 Abs. 2 OR), eventualiter Minderung. Verfahrensart streitwertabhängig; Schlichtung obligatorisch (Klagebewilligung, Art. 209 Abs. 3 ZPO), ausser bei HGer-Zuständigkeit (Art. 198 lit. f ZPO). Bei noch nicht feststehenden Kosten: unbezifferte Forderungsklage Art. 85 ZPO möglich (eng).

**2. Zuständigkeit:** Örtlich bei vereinbarter SIA-Norm 118: Art. 37 Abs. 3 SIA-118 → Wohnsitz/Sitz der beklagten Partei (verdrängt Art. 31 ZPO); sachlich kantonal (im Muster: Bezirksgericht Zürich).

**3. Rechtsbegehren-Raster (2 Begehren):**
1. Verurteilung zur Zahlung CHF [Gesamtsumme inkl. MwSt.] + Zins 5% auf [Teilbetrag Mangel 1] seit [Zahlungsdatum Ersatzvornahme] und auf [Teilbetrag Mangel 2] seit [Inverzugsetzung]
2. Kosten-/Entschädigungsfolgen inkl. MwSt.
(Optional: Beseitigung Rechtsvorschlag, falls vorgängig betrieben. Eventualstandpunkt Minderung läuft über die Begründung.)

**4. Aufbau:** I. Formelles (Vollmacht; Zuständigkeit via SIA 37 Abs. 3; Klagebewilligung; Streitwertbezifferung Art. 221 Abs. 1 lit. c ZPO) → II. Materielles: Werkvertrag + SIA-118-Einbezug (Inhalt behaupten + beweisen — nicht sicher notorisch!) → **A. Mangel 1** (Feststellung während Ausführung; Abhilfefrist mit Androhung der Drittvornahme, Art. 366 Abs. 2 OR; Weigerung; unwiderrufliche Verzichtsmitteilung; behelfsmässige Beweissicherung; Ersatzvornahme mit Regierapport; Kosten + Zahlung; Mangelnachweis via SIA-Fachnorm/Gutachten) → **B. Mangel 2** (Abnahme; allmähliche Entdeckung; sofortige Rüge; Nachbesserungsaufforderung mit Frist + Ersatzvornahme-Androhung; Weigerung; Verzicht + Wahl Schadenersatz, eventualiter Minderung; Mangel-Substanziierung; Verbesserungskosten via Offerte; Interesse an Verbesserung; Minderwert) → **C. Zusammenfassung, Zins, MwSt.**

**5. Materielle Grundlagen + Felder:** Art. 366 Abs. 2 OR (vor Abnahme; analog nach Abnahme); Art. 367 Abs. 1, 368, 370 Abs. 3, 371 Abs. 2 OR; Art. 107 Abs. 2 OR (positives Interesse = Verbesserungskosten); Art. 73 Abs. 1 + 99 Abs. 3 OR (Schadenszins); SIA-Norm 118: Art. 169 (Vorrang Nachbesserung), 172/173 (2-Jahres-Rügefrist), 174 Abs. 3 (Beweislastumkehr Mangel), 37 Abs. 3. Felder: Vertrag + SIA-Einbezugsklausel | Arbeitsgattung | je Mangel: Beschreibung, verletzte technische Norm, Feststellungs-/Rügedatum, Fristansetzung + Androhungswortlaut, Weigerungsdatum, Verzichtserklärung, Kosten (Rechnung/Offerte, Bauleitung, Folgekosten, MwSt.) | Abnahmedatum | Werkpreis + Zahlungsdaten (für Minderung/Zins).

**6. Deterministisch vs. wertend:** *Maskierbar:* Sofortrüge-Frist (Richtwert max. ~7 Tage, Art. 370 Abs. 3 OR) vs. 2 Jahre nach SIA 173/172; Verjährung 5 Jahre ab Abnahme, **je Werkvertrag separat** (Art. 371 Abs. 2 OR); Schadenszins 5% ab finanzieller Auswirkung (Zahlung); MwSt. als Schadensposition wenn kein Vorsteuerabzug; relative Minderungsmethode + Vermutungen (Preis = Wert; Minderwert = Behebungskosten). *Wertend:* Mangelqualifikation (Regeln der Baukunde, SIA-Normen — gerichtliches Gutachten); bestimmte Voraussehbarkeit mangelhafter Erstellung (Art. 366 Abs. 2 OR); Notwendigkeit/Angemessenheit des Ersatzvornahme-Aufwands; Übermässigkeit der Nachbesserung; Taktik, ob «erste Mängelspuren» überhaupt vorgetragen werden.

**7. Beilagen:** Vollmacht | Werkvertrag | SIA-Norm 118 + einschlägige technische SIA-Normen | HR-Auszug | Klagebewilligung | Fristansetzungs-/Androhungs-Mails | Weigerungsschreiben | Fotodokumentation | Regierapport + Rechnung + Zahlungsbeleg (Ersatzvornahme) | Mängelrüge (Wortlaut!) | Offerte Verbesserungsarbeiten | Zahlungsnachweis Werklohn; BO zusätzlich: Bauleiter als Zeuge, gerichtliches Gutachten, Augenschein, Parteibefragung.

**8. Besonderheiten/Fallen:** Doppelregime OR/SIA-118 bei unklarem Einbezug → vorsichtshalber stets die **strengere** Regel einhalten: sofort rügen (OR) **und** zuerst Nachbesserung verlangen (SIA 169) — Ersatzvornahme ohne vorherige Nachbesserungschance vernichtet die Mängelrechte (BGE 116 II 305); Rüge an **alle** direktvertraglichen potenziellen Mitverursacher; Beweissicherung **vor** jeder Ersatzvornahme (sonst Beweisverlust; Alternativen zu Art. 158 ZPO: Schiedsgutachten Art. 189 ZPO, gemeinsames Gutachten, sachverständiger Zeuge mit reiner Feststellungsdokumentation); Beweiswert von Fotos wird überschätzt; Verrechnungsverbote («Kauf ab Plan») ändern die Prozessrollen; Gutachterkosten-Vorschuss durch beweisbelastete Partei; merkantiler Minderwert (BGE 145 III 225) prüfen.

---

## § 15a — Gesuch betreffend vorsorgliche Beweisführung bei einer Baute (Art. 158 ZPO)

**1. Gesuchstyp/Verfahren:** Gesuch um vorsorgliche Beweisführung (Gerichtsgutachten über Schadensbilder) vor Rechtshängigkeit der Hauptsache; **summarisches Verfahren** (Art. 158 Abs. 2 i.V.m. Art. 261 ff., 252 ff. ZPO); keine Schlichtung. Systemfremd sind hier: Nachteilsprognose (Art. 261 Abs. 1 lit. b) und Prosequierungsfrist (Art. 263); Superprovisorik nur ausnahmsweise (Beweismittel-Sicherung).

**2. Zuständigkeit:** Örtlich Art. 13 ZPO (Sitz Gegenpartei via Art. 10 Abs. 1 lit. b oder Vollstreckungsort); sachlich bei handelsrechtlicher Streitigkeit (Art. 6 ZPO): Einzelgericht des Handelsgerichts (§ 45 lit. b GOG/ZH). Achtung: Mit Rechtshängigkeit der Hauptsache geht die Zuständigkeit an das Hauptsachegericht über.

**3. Rechtsbegehren-Raster (3 Anträge):**
1. Anordnung eines Gerichtsgutachtens über [Untersuchungsobjekt, präzise Ortsangabe]
2. Fragenkatalog an die sachverständige Person — pro Schadensbild als Kaskade: Feststellbarkeit? → üblich oder übermässig? → messbar/quantifizierbar? → Folgen kurz-/mittel-/langfristig? → Ursache / Verletzung von Regeln der Baukunde bei Planung und/oder Ausführung? → Behebungsmassnahmen? → Grobkostenschätzung? → weitere sachdienliche Feststellungen? (**nur Tatfragen, keine Rechtsbegriffe** wie «Mangel»/«Schaden»)
3. **Kostenvorbehalt**: Auferlegung nur unter Vorbehalt anderer/definitiver Regelung im Hauptsacheverfahren (nicht die übliche KEF-Formel!)

**4. Aufbau:** Vollmacht → örtliche Zuständigkeit → Streitwertschätzung (Art. 91 Abs. 2 i.V.m. Art. 221 Abs. 1 lit. c ZPO; z.B. Bruchteil der geschätzten Sanierungskosten) → sachliche Zuständigkeit → Sachverhalt (Werkvertrag; Abnahme; Schadensbilder + Rüge innerhalb Rüge-/Garantiefrist; Bericht externer Bauführer mit Foto-/Mess-/Plandokumentation + Kostenschätzung; Fristansetzung Nachbesserung; Haftungsablehnung; Position der Planerin; aussergerichtliche Streitverkündung; Einreichung Ausführungspläne) → Rechtliches (Glaubhaftmachung des materiellen Anspruchs + schutzwürdiges Interesse) → Gutachtervorschlag mit Unabhängigkeitserklärung → Schluss (vierfach).

**5. Materielle Grundlagen + Felder:** Art. 158 Abs. 1 lit. b Var. 2 ZPO — schutzwürdiges Interesse = Abklärung der Beweis-/Prozessaussichten, Vermeidung aussichtsloser Prozesse (BGE 140 III 16; 138 III 76); Glaubhaftmachung des Anspruchs (Art. 261 Abs. 1 lit. a ZPO analog, tiefe Anforderungen); zugrunde liegender Anspruch z.B. Nachbesserung (Vertrag / Art. 368 Abs. 2 OR). Felder: Objekt | Vertrag + Abnahmedatum | Rügedaten | Schadensbilder (Beschreibung, Dokumentationsquelle) | geschätzte Sanierungskosten | Streitwert(-bruchteil) | Fragenkatalog | Gutachtervorschlag.

**6. Deterministisch vs. wertend:** *Maskierbar:* Verfahrensschiene + Zuständigkeitsnormen; Kostentragungsregel (Gesuchsteller trägt Gerichtskosten inkl. Begutachtung + Parteientschädigung, BGE 139 III 33/140 III 30) inkl. Vorbehaltsformel (Art. 104 Abs. 3 ZPO); keine Prosequierungsfrist; Rechtsmittelraster (HGer → nur BGer, Art. 98 BGG Willkürkognition; unteres Gericht → Berufung ab CHF 10 000 Streitwert, 10 Tage, Art. 308/314 ZPO, sonst Beschwerde). *Wertend:* Formulierung zulässiger Tatfragen (Bestimmtheitsgebot; keine «fishing expedition», keine Beweiswürdigungs-/Rechtsfragen); Glaubhaftmachungs-Dichte; Streitwertschätzung; Einbezug der Planerin (Partei / Streitverkündung / nur aussergerichtlich).

**7. Beilagen:** Vollmacht | Zefix-Auszüge beider Parteien | GU-Werkvertrag | Abnahmeprotokoll | Rüge- und Antwortkorrespondenz | Bericht des Bauführers (Fotos, Messdaten, Risse auf Plänen, Kostenschätzung) | Fristansetzungs- und Ablehnungsschreiben | Korrespondenz mit Planerin | aussergerichtliche Streitverkündung | sämtliche Ausführungspläne | CV + Referenzliste vorgeschlagene sachverständige Person.

**8. Fallen:** Gesuchsteller zahlt grundsätzlich alles (Vorbehalt fürs Hauptverfahren zwingend beantragen; vollständige Überwälzung dorthin unzulässig); unentgeltliche Rechtspflege ausgeschlossen (BGE 141 I 241; ZPO-Revision sieht Änderung vor — zu verifizieren, Fedlex); Rechtsbegriffe in Gutachterfragen unzulässig; konkrete Durchführung (Gutachterwahl, definitive Fragen) liegt beim Gericht; Gegenpartei kann via Ergänzungsfragen (Art. 185 Abs. 2 ZPO) den Gegenstand faktisch erweitern (umfangreicher Katalog = eigenes Gesuch mit Kostenfolge); nach durchgeführter Beweisabnahme: Abschreibung wegen Gegenstandslosigkeit (Art. 242 ZPO).

---

## § 16 — Gesuch um provisorische Eintragung eines Bauhandwerkerpfandrechts

**1. Gesuchstyp/Verfahren:** Gesuch um vorläufige Eintragung (Vormerkung) + superprovisorische Anordnung; **summarisches Verfahren** (Art. 249 lit. d Ziff. 5 ZPO); keine Schlichtung. Anschliessend setzt das Gericht Frist zur Klage auf definitive Eintragung (Art. 961 Abs. 3 ZGB, Art. 263 ZPO; Schlichtung entfällt, Art. 198 lit. h ZPO; Praxis 2–3 Monate, richterliche Frist, erstreckbar, keine Gerichtsferien).

**2. Zuständigkeit:** Örtlich: Gericht am Ort des Grundstücks (Art. 13 lit. b bzw. Art. 13 lit. a i.V.m. Art. 29 Abs. 1 lit. c ZPO); sachlich: Einzelrichter im Summarverfahren (kantonal, z.B. § 24 lit. c GOG/ZH); Handelsgericht, sofern die Hauptsache handelsgerichtlich ist (BGE 137 III 563).

**3. Rechtsbegehren-Raster (3 Begehren):**
1. Anweisung an das Grundbuchamt [x], zulasten des Grundstücks [Eigentümer, Adresse, GBBl./Kataster-Nr.] ein Bauhandwerkerpfandrecht für die Pfandsumme CHF [Betrag] + Zins [Satz] seit [Datum] **vorläufig als Vormerkung** einzutragen
2. Superprovisorische Verfügung mit unverzüglicher Mitteilung an das Grundbuchamt
3. Kosten-/Entschädigungsfolgen inkl. MwSt. zulasten der Gesuchsgegnerin

**4. Aufbau:** I. Formelles (Vollmacht; örtliche/sachliche Zuständigkeit; Streitwert = Pfandsumme) → II. Materielles: Vertrag mit [Schuldner — hier Hauptunternehmer, Gesuchstellerin als Subunternehmerin] über Leistungen auf dem Grundstück der Gesuchsgegnerin → Leistungserbringung mit Material und Arbeit [Zeitraum, Art der Arbeiten] → **Vollendungstag** (fristauslösend, mit Rapport belegt) → Forderungshöhe + Rechnung + Zahlungsfrist → Mahnung + Verzugszins (Art. 102 Abs. 1, 104 Abs. 1 OR) → weder Zahlung noch anderweitige Sicherstellung → Schluss.

**5. Materielle Grundlagen + Felder:** Art. 837 Abs. 1 Ziff. 3 + Abs. 2 ZGB (Pfandberechtigung; Zustimmung des Eigentümers bei Bestellung durch Mieter/sonst Berechtigte); Art. 839 Abs. 1–3 ZGB (Eintragungszeitpunkt, 4-Monats-Frist, keine Fälligkeitsvoraussetzung, Vorbehalt hinreichender Sicherheit); Art. 961 Abs. 1 Ziff. 1 + Abs. 3 ZGB (vorläufige Eintragung, Glaubhaftmachung); Art. 48/76 GBV; subsidiär Art. 672 ZGB. Felder: Grundstück (aktueller GB-Auszug!) | Eigentümer = Gesuchsgegner (Passivlegitimation) | Forderungsschuldner (≠ Eigentümer im Subunternehmerfall) | Vertragsdatum | Leistungsart (Material+Arbeit / Arbeit allein — Pfandberechtigung prüfen; intellektuelle Leistungen nicht pfandberechtigt) | Arbeitszeitraum | Vollendungstag | Forderungsbetrag | Zinsbeginn | keine Sicherheit vorhanden.

**6. Deterministisch vs. wertend:** *Maskierbar:* **4-Monats-Verwirkungsfrist** ab Vollendung (Art. 839 Abs. 2 ZGB; Berechnung via Art. 7 ZGB i.V.m. Art. 77 f. OR, Verschiebung Sa/So/Feiertag); Eintrag muss vor Fristablauf im Tagebuch des Grundbuchs **erfolgt** sein (Gesuchstellung genügt nicht; Superprovisorik i.d.R. am selben/folgenden Arbeitstag); Beweismass nur Glaubhaftmachung, Plausibilitätsprüfung der Forderung, im Zweifel Eintragung; Urkundenprimat (Art. 254 ZPO); Verzugszinse zeitlich unlimitiert mitgesichert, nicht auf 5% gedeckelt. *Wertend:* Vollendungsbegriff (qualitative Betrachtung; geringfügige aber «unerlässliche, funktionell notwendige» Arbeiten; funktionale Einheit bei mehreren Verträgen/Arbeitsgattungen/Bauwerken); Pfandberechtigung gemischter Leistungen; Aufteilung bei Mit-/Stockwerkeigentum.

**7. Beilagen-Checkliste (nur Urkunden):** Vollmacht | **aktueller** Grundbuchauszug (am Eingabetag telefonisch verifizieren) | Werkvertrag mit Leistungsverzeichnis | Arbeitsrapporte (Beleg Leistungszeitraum + Vollendungstag) | Rechnung | Mahnung.

**8. Besonderheiten/Fallen:** Verwirkung nach 4 Monaten — Superprovisorik-Antrag praktisch zwingend; falsche Passivlegitimation oder falsches Grundstück führt wegen Fristablaufs meist zum endgültigen Rechtsverlust; Eigentümerwechsel vor Eintrag kann Anspruch vereiteln; gewöhnliches Miteigentum: Wahl Stammgrundstück/Anteile (entfällt bei Vorbelastung eines Anteils), Aufteilung nach Wertquoten, **notwendige passive Streitgenossenschaft**; Stockwerkeigentum: einfache Streitgenossenschaft, quotenproportionale bzw. einheitenbezogene Belastung (komplex, Rechtsunsicherheit — pro Einheit getrennt abrechnen, vorsorglich Höchstbetrag je Anteil); Mieterausbau: Zustimmung des Grundeigentümers (Art. 837 Abs. 2 ZGB); hinreichende Sicherheit verdrängt das Pfandrecht (Art. 839 Abs. 3 ZGB; Zinse müssen zeitlich unbegrenzt gesichert sein, BGE 142 III 738); kein zweiter Schriftenwechsel → vollständiges Fundament ins Gesuch; Klagefrist für definitive Eintragung nicht verpassen (sonst Löschung auf Antrag des Eigentümers); objektive Häufung der Klage auf definitive Eintragung mit der Forderungsklage unzulässig, wenn für letztere ein nötiges Schlichtungsverfahren fehlt (BGer 4A_368/2020); Grundstücke im Verwaltungsvermögen unpfändbar → gesetzliche Bürgschaft (Art. 839 Abs. 4–6 ZGB, schriftliche Geltendmachung innert 4 Monaten; bei strittiger Zuordnung doppelgleisig vorgehen); gegen superprovisorische **Verweigerung** ausnahmsweise Rechtsmittel (Verwirkungsgefahr, BGE 140 III 289 obiter).
# Strukturelle Auswertung Musterklagen Bd. I — §§ 17–25 (Rohmaterial für regelbasierte Klage-Vorlagen)

## § 17 Klage der Architektin auf Bezahlung des Honorars

**1. Klagetyp/Verfahrensart:** Leistungsklage auf Geldzahlung (Honorarforderung aus Architektenvertrag, zwei Forderungsteile: Vertragshonorar + Zusatzleistungen). Ordentliches Verfahren (vereinfacht nur bis CHF 30'000, Art. 243 Abs. 1 ZPO). Schlichtung obligatorisch; Klagebewilligung, Einreichungsfrist 3 Monate (Art. 209 Abs. 3 ZPO); entfällt bei handelsgerichtlicher Zuständigkeit (Art. 198 lit. f ZPO). Streitwert beziffern (Art. 221 Abs. 1 lit. c ZPO).

**2. Zuständigkeit:** Örtlich: Gerichtsstandsvereinbarung im SIA-Vertragsformular (Art. 17 ZPO); sonst Wohnsitz/Sitz Beklagter (Art. 10 ZPO) oder Erfüllungsort (Art. 31 ZPO). Sachlich: kantonales Recht (Art. 4 ZPO); je nach Konstellation Handelsgericht (Art. 6 ZPO).

**3. Rechtsbegehren-RASTER:**
1. Leistungsbegehren mit gesplittetem Zinslauf: Zahlung von [Gesamtbetrag] (inkl./exkl. [MwSt-Flag]) nebst Zins zu [Zinssatz, Standard 5%] auf [Teilbetrag Vertragshonorar] seit [Verzugsdatum 1] und auf [Teilbetrag Zusatzhonorar] seit [Verzugsdatum 2]
2. Kosten-/Entschädigungsbegehren zulasten [Beklagter]
3. Optional (bedingtes Feld): Beseitigung des Rechtsvorschlags in Betreibung Nr. [Betreibungs-Nr.], Betreibungsamt [Ort] — nur bei vorgängiger Betreibung
- MwSt-Logik: vorsteuerabzugsberechtigte Klägerin → keine MwSt auf Parteientschädigung (Checkbox)

**4. Aufbau-Gliederung:** Rubrum («betreffend Forderung») → Rechtsbegehren → I. Formelles (Vollmacht, Zuständigkeit/Gerichtsstandsklausel, Klagebewilligung/Fristwahrung, Streitwert) → II. Materielles: Vertragsanbahnung/-schluss (inkl. SIA-Ordnung 102 als AGB) → A. Ausstehendes Vertragshonorar (Honorarmodell + Parameter, Projektabschluss, Schlussrechnung, Saldo; antizipierte Widerlegung vorprozessualer Einwände) → B. Zusatzarbeiten (Auftragserteilung, Leistungsbeschrieb, Stundenaufwand pro Person/Tag, übliche Ansätze) → C. Zusammenfassung, Zins, MwSt (Forderungstabelle). Beweisofferten (BO) direkt nach jeder Behauptung; Beweismittelverzeichnis; Einreichung im Doppel.

**5. Materielle Anspruchsgrundlagen + Maskenfelder:** Gemischter Vertrag — Auftrag (Art. 394 ff. OR) für Bauleitung, Werkvertrag (Art. 363 ff. OR) für Planung (BGE 127 III 543; 134 III 361); Vergütung ohne Abrede Art. 374 OR; Verzug Art. 102 Abs. 1/2 OR; Verzugszins 5% Art. 104 Abs. 1 OR; Verrechnung Art. 120 OR. Vertraglich: SIA-Ordnung 102 (2014), insb. Art. 7 (Honorar nach aufwandbestimmenden Baukosten), Art. 7.1.5, Art. 4, Art. 1.4.1 (30-Tage-Zahlungsfrist), Art. 1.9.4 (Rügefristen), Art. 5.2/7.11/6 (Zusatzleistungen).
Felder: [Parteien + HR-Auszug] · [Vertragsdatum, SIA-Formular 1001/1 + Ausgabe, SIA 102 Ausgabe, Gerichtsstandsklausel-Ziffer, Phasen/Leistungsumfang, Honorarmodell] · Honorarparameter [B, n, q, r, i, s, U, Z1/Z2 + Jahr] · Abrechnung [Schlussrechnungsdatum, Gesamthonorar, Akonto-/Teilzahlungen, Saldo, Zahlungsfrist] · Verzug [Rechnungsdatum, Fristende = Verfalltag, Mahndatum, Zugangsdatum] · Zusatzauftrag [Erteilungsdatum/-form, Beleg, Leistungsbeschrieb, Stunden je Mitarbeiter (Datum/Funktion/Tätigkeit/Dauer), Stundensatz je Funktion, Üblichkeitsbeleg z.B. KBOB 2017] · MwSt [steuerpflichtig j/n, Vorsteuerabzug j/n].

**6. Deterministisch vs. wertend:**
- *Maskierbar:* Honorarformel Art. 7 SIA 102 (rein rechnerisch); Verzugsbeginn = Rechnungsdatum + 30 Tage (Verfalltag, Art. 102 Abs. 2 OR), eventualiter Mahnungszugang; Zins 5%; 3-Monats-Frist; Streitwert; MwSt-Weiche; Summentabelle; bedingtes Rechtsöffnungsbegehren; Formalien.
- *Wertend:* Taktik antizipierte Einwand-Entkräftung (Replik oft nur mündlich, Art. 225 ZPO); Aufwand-Substanziierung (BGer 4A_446/2020); Qualifikation Akonto- vs. definitive Teilzahlung; Würdigung Planungsfehler, Abgrenzung Grund-/Zusatzleistung, Üblichkeit der Ansätze; Ungewöhnlichkeitsregel bei AGB-Klauseln.

**7. Beilagen-Checkliste:** Vollmacht; Architektenvertrag (SIA 1001/1) inkl. Beilagen; SIA-Ordnung 102 im Volltext (nicht gerichtsnotorisch); HR-Auszug; Klagebewilligung im Original; Anbahnungsdokumente; Z-Werte des Jahres; Schlussrechnung + Zusatzrechnung; Mahnschreiben; Streitkorrespondenz (Cave Vergleichsvorschläge); Sitzungsprotokolle; Arbeitsergebnisse/Stundenrapporte; KBOB-Empfehlungen; Beweismittelverzeichnis. Nicht-Urkunden: Zeugen, Parteibefragung, gerichtliches Gutachten (zwingend beantragen), ESTV-Auskunft (Art. 190 ZPO), Editionsantrag.

**8. Besonderheiten/Fallen:** Honorar 10 Jahre verjährt (Art. 127 OR); Mängelansprüche gegen Architekten 5 Jahre ab Abnahme (Art. 371 Abs. 2 OR); verjährte Gegenforderung bleibt verrechenbar (Art. 120 Abs. 3 OR). Rügeobliegenheit: Planungsfehler = Werkvertragsrecht, sofortige Rüge (Art. 370 Abs. 3 OR), modifiziert durch Art. 1.9.4 SIA 102 (60 Tage; 2 Jahre bei Bauwerksmangel-Folge); zu rügen ist der Plan-, nicht der Bauwerksmangel. Substanziierungsfallen: aufwandbasiertes Honorar erfordert Angaben pro Leistung (BGer 4A_446/2020), Pauschalverweis auf Beilagen unzulässig; Gegenmittel: laufend definitiv abrechnen (Akontozahlungen sind nachträglich angreifbar). Gutachten nur auf Antrag (Art. 183 Abs. 1 ZPO). Bei Pauschalbestreitung u.U. Gesamthonorar substanziieren. Beweislast für Honorarminderung/Gegenforderungen beim Beklagten (BGer 4A_82/2019). Vergleichsvorschläge der Gegenseite nur mit Zustimmung offenlegen (Art. 26 SAV-Standesregeln). Berufshaftpflicht deckt Honorarklage nicht. SIA 102 als AGB behaupten/beweisen; Ausgabe 2014 vs. 2020 unterscheiden. Trotz Verfalltag sicherheitshalber mahnen, Zugang substanziieren.

## § 18 Klage des Kunden gegen die Vermögensverwalterin

**1. Klagetyp/Verfahrensart:** Leistungsklage (Schadenersatz) kombiniert mit Stufenklage (Rechenschaft + unbezifferte Herausgabe) = objektive Klagenhäufung (Art. 90 ZPO) aus drei Ansprüchen: Schadenersatz, Rechenschaft, Herausgabe. Ordentliches Verfahren (Streitwert > CHF 30'000). Schlichtung: entfällt vor Handelsgericht (Art. 198 lit. f ZPO); vor Bezirksgericht gemeinsamer Verzicht ab Streitwert CHF 100'000 möglich (Art. 199 Abs. 1 ZPO); FIDLEG-Sonderweg: nach Ombudsstellen-Verfahren einseitiger Verzicht des Klägers (Art. 76 Abs. 2 FIDLEG).

**2. Zuständigkeit:** Örtlich Art. 31 ZPO (dispositiv); kein Konsumentenvertrag i.S.v. Art. 32 ZPO → Gerichtsstandsklausel (Art. 17 ZPO) prüfen, in VV-Verträgen häufig. Sachlich: Kollegialgericht (ZH: § 19 GOG/ZH); Handelsgericht (Art. 6 Abs. 2 f. ZPO); nur Beklagte im HR → Wahlrecht des Klägers (Art. 6 Abs. 3 ZPO; Abwägung Fachkunde/keine Schlichtung vs. Instanzenzug/strenge Substanziierung HGer ZH). Klagenhäufung nur bei gleicher sachlicher Zuständigkeit/Verfahrensart (Art. 90 ZPO); Streitwerte grundsätzlich addiert (Art. 93 Abs. 1 ZPO), bei Stufenklage nicht. International: LugÜ (Verbrauchergerichtsstand Art. 15–17; sonst Art. 2, Art. 5 Ziff. 1 lit. b); IPRG Art. 112 f., kein Konsumentenvertrag nach Art. 120 IPRG, Rechtswahl Art. 5 IPRG.

**3. Rechtsbegehren-RASTER (4 Begehren):**
1. Bezifferter Schadenersatz: [Betrag CHF] zzgl. [Zinssatz]% seit [Datum Vertragsbeendigung]
2. Rechenschaft (Stufe 1): vollständige dokumentierte Rechenschaft über Drittvergütungen [Vergütungsarten] innert [Frist Tage] ab Rechtskraft, unter Strafandrohung Art. 292 StGB / Vollstreckung Art. 343 Abs. 1 ZPO
3. Unbezifferte Leistung (Stufe 2): nachträglich zu beziffernder Betrag, mindestens [Mindestbetrag CHF] (zwingend, Art. 85 Abs. 1 ZPO), zzgl. [Zinssatz]% seit [Fälligkeit]
4. Kosten-/Entschädigungsfolgen (zzgl. MwSt)

**4. Aufbau-Gliederung:** Rubrum → Rechtsbegehren → I. Formelles (Vollmacht, Schlichtung, Zuständigkeit/Klausel) → II. Schadenersatz aus Vertragsverletzung: A. Parteien, B. Vertragsschluss/-inhalt, C. Sorgfaltspflichtverletzungen (Kundenprofil / Anlagestrategie / Aufklärungspflicht / Zusammenfassung), D. Schaden, E. Kausalität/Verschulden, F. Zusammenfassung → III. Herausgabe der Rückvergütungen: A. Rechenschaft, B. Herausgabe (inkl. Unwirksamkeit Vorausverzicht) → Schlussantrag, Ausfertigungen (Art. 131 ZPO; HGer ZH: fünffach, Beilagen im Doppel), Beilagenverzeichnis. BO je Behauptung.

**5. Materielle Anspruchsgrundlagen + Maskenfelder:** Schadenersatz: Art. 398 Abs. 2 OR (Auftragsrecht, BGE 115 II 62); Art. 97 Abs. 1 OR (Verschuldensvermutung); Art. 42 Abs. 2 OR (Schätzung); Schadenszins 5% analog Art. 104 Abs. 1 OR; Konkretisierung FIDLEG Art. 8, 10 ff., 15, 18. Rechenschaft/Herausgabe: Art. 400 Abs. 1 OR; Zins Art. 400 Abs. 2 i.V.m. Art. 104 Abs. 1 OR; Art. 16, 26, 72 FIDLEG; BGE 132 III 460, 137 III 393, 138 III 755. Haftungsbeschränkung eng (Art. 100 f. OR, konzessioniertes Gewerbe seit FINIG).
Felder: Vertrag [Datum, Form, Depotbank, Konto-/Depot-Nr.] · Parameter [Anlagebetrag, Bezüge/Jahr, Zielperformance, Horizont, Strategie] · Kläger-Profil [Alter, Beruf, Erfahrung, Einkommen, Vorsorge, Vermögensherkunft, Anteil in Verwaltung] · Pflichtverletzung [fehlendes Kundenprofil / ungeeignete Strategie / unterlassene Aufklärung — Mehrfachauswahl] · Schaden [Anfangs-/Schlusswert, Bezüge, Honorar → Verlust; Vergleichsportfolio: Quoten + Renditen + Dauer] · Kausalität/Verschulden [hypothetischer Verlauf; Verschulden vermutet] · Herausgabe [Datum Rechenschaftsaufforderung, Reaktion, Verzichtsklausel j/n + Fundstelle, Aufklärung über Eckwerte/Bandbreite, Mindestbetrag].

**6. Deterministisch vs. wertend:**
- *Maskierbar:* Verfahrens-/Zuständigkeitslogik (Schwellen 30'000/100'000, HR-Eintrag, Kanton, Klausel); Schlichtungs-Weiche (HGer/Verzicht/Ombudsstelle); Zins 5% (Beginn: Vertragsende bzw. Erhalt der Vergütung); Verjährung 10 Jahre (Schadenersatz ab Auftragsende; Herausgabe je Retro ab Erhalt); Schadensarithmetik aus Portfolioquoten/Renditen; Mindestbetrag-Pflichtfeld; Strafandrohungs-Baustein; Formalien.
- *Wertend:* Wahl Handels- vs. Bezirksgericht; hypothetisches Vergleichsportfolio + Renditeannahmen (gutachtensabhängig); positives vs. negatives Vertragsinteresse; Subsumtion der Sorgfaltspflichtverletzungen; Gültigkeit Retro-Verzicht; Teilklage-/Stufenklage-Strategie.

**7. Beilagen-Checkliste:** Vollmacht; VV-Vertrag (zentral); Steuererklärungen + Wertschriftenverzeichnisse mehrerer Jahre; Herkunftsbeleg Vermögen; HR-Auszug Beklagte; Verwaltungsvollmacht bei Depotbank; Konto-/Depotauszüge Beginn/Ende; Vermögensausweise pro Jahr; Kündigung + Korrespondenz; Marktentwicklungs-Belege (Vergleichsportfolio); Rechenschaftsaufforderung + Verweigerung. Personalbeweise: Parteibefragung, Kundenberaterin als Zeugin, gerichtliches Gutachten (praktisch unverzichtbar).

**8. Besonderheiten/Fallen:** Verjährung je 10 Jahre, aber unterschiedlicher Beginn — Herausgabe pro Rückvergütung ab Erhalt (BGer-Praxis 2017) → tranchenweise Verjährung. Schaden-Substanziierung = Hauptklippe (Vergleichsportfolio vollständig; je pflichtwidrige Transaktion separat, BGE 144 III 155; Eventualberechnungen; Haftung endet mit Vertragsende). Teilklage (Art. 86 ZPO) mit Vorsicht: negative Feststellungswiderklage → ordentliches Verfahren (BGE 143 III 506); Autoren raten i.d.R. ab. Stufenklage statt Edition: Rechenschaft (Art. 400 Abs. 1 OR) materiellrechtlich + vollstreckbar (Art. 343 ZPO/Art. 292 StGB); Bezifferung nach Art. 85 Abs. 2 ZPO. Alternativen: isolierte Rechenschaftsklage; Art. 257 ZPO bei liquider Lage; Dokumentenherausgabe Art. 72 FIDLEG summarisch (Kostenfolge Art. 72 Abs. 4 FIDLEG). Retro-Verzicht nur gültig bei Aufklärung über Eckwerte + Bandbreite (BGE 137 III 393; Art. 26 FIDLEG), Beweislast bei Verwalterin. Kläger beweist Vertrag/Pflichtverletzung/Schaden/Kausalität; fehlende Dokumentation (Art. 15 FIDLEG) als Indiz gegen Verwalterin. Keine Honorarherabsetzung neben voller Schadloshaltung. Keine Sammelklage; Streitgenossenschaft (Art. 71, 106 Abs. 3 ZPO) oder Abtretungsbündelung (Abtretung an Anwalt unzulässig, Art. 12 BGFA / Art. 20 OR). Kapitel (2022) referenziert ZPO-Revision als Entwurf — heutiger Stand zu verifizieren (Fedlex).

## § 19 Klage gegen den Arzt wegen fehlerhafter Behandlung

**1. Klagetyp/Verfahrensart:** Leistungsklage auf Genugtuung wegen Tötung infolge Fehlbehandlung; Musterfall: Eltern gegen öffentliches Spital (Staatshaftung ZH). Ordentliches Verfahren (Streitwert im Muster CHF 90'000, über Art. 243 ZPO). ZPO in kantonalen Staatshaftungsprozessen analog als subsidiäres kantonales Recht (BGer 2C_692/2012); OR via Verweisnorm (§ 29 HG/ZH). Vorverfahren: zwingend Haftungsbegehren an die Anstalt (§ 22, 24 HG/ZH); nach Ablehnung 1-jährige Klagefrist (§ 24 Abs. 2 HG/ZH); Schlichtungsfrage kantonal — zu verifizieren. Bei privatrechtlicher Haftung normales Schlichtungsobligatorium (Art. 197 ZPO).

**2. Zuständigkeit:** Sachlich (Staatshaftung) kantonal verschieden — ZH: Zivilgerichte (§ 20 i.V.m. § 23 HG/ZH); Fehlqualifikationsrisiko öffentlich/privat. Örtlich: Sitz der Spitalanstalt; privatrechtlich ZPO-Gerichtsstände (Art. 10, evtl. Art. 36 ZPO — zu verifizieren je Anspruchstyp). Instanzenzug: zivilrechtsnah (Art. 72 Abs. 2 lit. b BGG; BGE 133 III 462), doppelter kantonaler Instanzenzug (Art. 75 Abs. 2 BGG; BGE 139 III 252). Direktklagerecht gegen Haftpflichtversicherer seit 1.1.2022 (Art. 60 Abs. 1bis VVG); bei obligatorischer Versicherung (Arzt: Art. 40 lit. h MedBG) Einredenausschluss (Art. 59 Abs. 3 VVG). Teilklage zulässig.

**3. Rechtsbegehren-RASTER:** 1. Genugtuung CHF [Betrag] an [Partei 1] und CHF [Betrag] an [Partei 2], je zzgl. [Zinssatz, Standard 5]% seit [Todestag/Ereignistag]. Optional: Schadenersatz je [Position: Bestattungskosten/Versorgerschaden/Erwerbs-/Haushaltschaden] CHF [Betrag] + Zins. Bei Teilklage: [Teilbetrag] mit [Nachklagevorbehalt]. Kostenbegehren inkl. MwSt [Satz]%. (Muster: 2 Begehren — Leistungsbegehren mit zwei Genugtuungssummen + Kosten.)

**4. Aufbau-Gliederung:** Rubrum («Forderung aus ärztlicher Behandlung vom [Datum]») → Anträge → I. Formelles (Vollmacht; Rechtsnatur der Beklagten/anwendbares Haftungsrecht; Zuständigkeit; Fristwahrung Haftungsbegehren + Klagefrist; Streitgenossenschaft Art. 71 Abs. 1 ZPO; ergänzendes OR) → II. Schadenbegründendes Ereignis (chronologisch, BO je Behauptung) → III. Mangelhafte Aufklärung / keine hypothetische Einwilligung → IV. Sorgfaltspflichtverletzung und Kausalität → V. Genugtuung (Grundlage, Voraussetzungen, Aktivlegitimation Angehörige, Bemessung, Schadenszins, Kosten) → Schlussformel, Beweismittelverzeichnis.

**5. Materielle Anspruchsgrundlagen + Maskenfelder:** Öffentliches Spital: kantonales Staatshaftungsgesetz (ZH: Genugtuung § 10 HG/ZH; Kausalhaftung ohne Verschulden § 6 Abs. 1 HG/ZH; ausschliessliche Staatshaftung § 6 Abs. 4 HG/ZH; Regress § 15 Abs. 1 HG/ZH). Privat: Auftrag (Art. 394 ff. OR) + Delikt (Art. 41 ff. OR). Genugtuung Art. 47 OR; Bemessung Art. 42 Abs. 2 OR. Versorgerschaden Art. 45 Abs. 3 OR; Produkte: Art. 1, 2, 4, 9–11 PrHG, Solidarhaftung Art. 51 Abs. 2 i.V.m. Art. 50 Abs. 1 OR. Aufklärung: Berufspflicht (BGE 117 Ib 197); Art. 10 FMH-Standesordnung; Beweislast für Aufklärung + hypothetische Einwilligung beim Arzt (BGE 133 III 121).
Felder: [Behandlungsdatum/-zeitraum, Ort/Spital, Arzt, Rechtsform Spital, Anstellungsverhältnis (angestellt/Belegarzt/frei), Versicherungsstatus Patient] · [Geschädigter; Anspruchsteller + Verwandtschaftsgrad; Streitgenossenschaft j/n] · [Vorwurfstyp: Aufklärungsmangel/Sorgfaltspflichtverletzung/beides] · Tatbestand [Pflichtwidrigkeit, Kausalität inkl. Ohnehinverlauf, Verschulden nur falls verlangt, Schaden/Unbill] · Aufklärungsblock [Risiken/Alternativen; Inhalt/Ort/Zeit/Person gemäss KG; Argumente gegen hypothetische Einwilligung] · Genugtuungsblock [Basis nach Verwandtschaftsgrad, Erhöhungs-/Reduktionsfaktoren, Zinsbeginn = Todestag] · Fristenblock [Kenntnisdatum, Haftungsbegehren, Ablehnungsentscheid, Klagefristablauf].

**6. Deterministisch vs. wertend:**
- *Maskierbar:* Rubrum/Formalien; kantonale Zuständigkeits-Lookup-Tabelle; Fristenrechner (ZH: 2 Jahre Haftungsbegehren, 1 Jahr Klagefrist; OR parallel; PrHG 3/10 Jahre, Art. 9/10 PrHG); Zins fix 5% ab Todes-/Ereignistag (BGE 122 III 53); Genugtuungs-Richtwerttabelle (Eltern bei Kindsverlust Basis ca. CHF 20'000–40'000 je Elternteil) mit Erhöhungs-Checkboxen; BO-Schema; Kostenantrag.
- *Wertend:* Qualifikation öffentlich/privat bei Mischformen; Sachverhaltsnarrativ + Vorwurfsauswahl (zuerst Aufklärung, dann Sorgfalt); Argumentation gegen hypothetische Einwilligung; Kausalität/Ohnehinverlauf, Gutachtens-Antizipation; konkrete Genugtuungsbemessung (Zwei-Phasen-Methode, Präjudizienvergleich); Teilklage-Entscheid, Versorgerschaden.

**7. Beilagen-Checkliste:** Vollmacht; Nachweis Rechtsnatur Spital (Spitalliste/Statut); Haftungsbegehren + Ablehnungsentscheid (Fristnachweis); Krankengeschichte; Aufklärungsprotokoll; Medikamenten-Fachinformationen; Überwachungsprotokolle (z.B. CTG); Obduktions-/Arztberichte; Fachliteratur; Beweismittelverzeichnis. Ohne Beilage: gerichtliche Fachgutachten, Parteibefragung/Beweisaussage, Zeugen (Beziehungsintensität).

**8. Besonderheiten/Fallen:** Kantonale Verwirkungsfristen (ZH: 2 Jahre Haftungsbegehren) — nicht unterbrechbar; bei unklarer Rechtsnatur fristwahrende Handlungen doppelt (Staatshaftung + OR). Klagefrist § 24 Abs. 2 HG/ZH gemäss OGer ZH Verjährungs-, nicht Verwirkungsfrist; kantonal verschieden — verifizieren. Beweislast: Behandlungsfehler + Kausalität beim Geschädigten (Art. 8 ZGB; Kausalität überwiegende Wahrscheinlichkeit, BGE 132 III 715); Aufklärung + hypothetische Einwilligung beim Arzt (BGE 133 III 121); Dokumentationsmängel → Beweismassreduktion (BGE 141 III 363); Sorgfaltsmassstab: nur nicht mehr vertretbares Vorgehen, ex ante. Strategie: Aufklärungsrüge zuerst (Eingriff ohne Einwilligung per se widerrechtlich). Teilklage: Kostenrisiko-Reduktion, aber negative Feststellungswiderklage (vgl. § 22). Öffentlich/privat: Staatshaftung sperrt Direktklage gegen angestellten Arzt; Belegarzt privatrechtlich; Privatpatient mit Wahlarzt im öffentlichen Spital dennoch kantonales Recht (BGE 122 I 153). BGer-Kognition nur Willkür (Art. 95 lit. a BGG e contrario, Art. 9 BV). Genugtuungs-Kumulation bis zu drei Ansprüchen bei vorgängiger Invalidität. PrHG-Schiene mit eigenen Fristen bei Medikamenten/Implantaten.

## § 20 Klage auf Schadenersatz gegen den Spediteur

**1. Klagetyp/Verfahrensart:** Leistungsklage auf Schadenersatz aus Speditionsvertrag (Verlust von Transportgut). Ordentliches Verfahren, im Muster Handelsgericht. Schlichtung entfällt vor Handelsgericht (Art. 198 lit. f ZPO); sonst nach allgemeinen Regeln.

**2. Zuständigkeit:** Örtlich: Sitz der Beklagten (Art. 10 Abs. 1 lit. b ZPO); ggf. Gerichtsstandsklausel der AB SPEDLOGSWISS (Art. 33 Abs. 1: Sitz des Spediteurs). Sachlich: Handelsgericht (Art. 6 Abs. 2 ZPO: geschäftliche Tätigkeit beider, HR-Eintrag, Beschwerde nach Art. 72 Abs. 1 BGG offen; ZH: § 44 lit. b GOG/ZH). International: auf den Speditionsvertrag — anders als beim Frachtvertrag — keine internationalen Übereinkommen anwendbar.

**3. Rechtsbegehren-RASTER:** 1. Zahlung CHF [Betrag] zzgl. [Zinssatz, i.d.R. 5]% seit [Datum Schadenseintritt/Verlust]. 2. Kosten-/Entschädigungsfolgen. Felder: [Betrag], [Zinssatz], [Zinsbeginn], [Parteien/Sitz], [Vertretung].

**4. Aufbau-Gliederung:** Rubrum → Rechtsbegehren → I. Formelles (Vollmacht, örtliche + sachliche Zuständigkeit, Entbehrlichkeit Schlichtung) → II. Sachverhalt (Parteien/HR, Speditionsvertrag + AGB-Einbezug, Untervergabe an Frachtführer, Transportablauf, Verlust, Schadenshöhe, aussergerichtliche Geltendmachung; BO je Behauptung) → III. Rechtliches (Pflichtverletzung, qualifiziertes Verschulden, Durchbrechung AGB-Limiten, Kausalität, Schadenshöhe, Zins) → Schlussformel, Ausfertigungen (HGer ZH fünffach, Beilagen im Doppel; Art. 131 ZPO), Beilagenverzeichnis.

**5. Materielle Anspruchsgrundlagen + Maskenfelder:** Zwei-Spur-Haftung (Art. 439 OR): Spur A (Vorbereitung/Organisation) — kommissions-/auftragsrechtlich, Art. 439 i.V.m. Art. 97 und 398 OR, Verjährung 10 Jahre (Art. 127 OR), vertragliche Verkürzung insoweit unwirksam (Art. 129 i.V.m. Art. 127 OR); Spur B (Ausführung) — frachtrechtlich, Art. 439 i.V.m. Art. 447 OR (voller Wert bei Verlust); Frachtrecht Art. 440 ff., 456/457 OR. Abgrenzung nach schadensursächlicher Pflichtverletzung (umstritten; BGE 102 II 256 vs. Lehre); bei Sammeltransport Frachtführerhaftung. AB SPEDLOGSWISS (nur bei Einbezug): Art. 21 (Auswahl/Instruktion), Art. 22/25 (Limiten), Art. 2 Ziff. 2 (Ausschlüsse), Art. 32 (Verjährung 1 Jahr); Durchbrechung Art. 100 Abs. 1 OR.
Felder: [Vertragsschluss: Datum, Parteien, Vergütung] · [AGB-Einbezug j/n, Version, Klausel] · [Gut: Art, Anzahl, Wert, Übernahmequittung] · [Verlust/Beschädigung: was/wann/wo] · [Sorgfaltspflichtverletzung Spur A: konkrete Organisationsfehler] · [Kausalität] · [Schaden: Höhe, Bewertungsgrundlage] · [qualifiziertes Verschulden — nur für Limiten-Durchbrechung] · [Schadenszins: Satz, Beginn = finanzielle Auswirkung, BGE 130 III 591] · [Forderungsschreiben: Datum, Reaktion].

**6. Deterministisch vs. wertend:**
- *Maskierbar:* Zuständigkeitsblock; Rechtsbegehren-Formel; Verjährungs-Ampel (Spur A 10 Jahre / Spur B + AGB 1 Jahr → Sicherheitsregel: immer innert Jahresfrist klagen); Limiten-Rechner AB SPEDLOGSWISS; Formalien; BO-Mechanik (Organe via Parteibefragung, Art. 159 ZPO).
- *Wertend:* Qualifikation Spedition vs. Fracht (Parteiwille, nicht Titel; BGE 132 III 626); Spur-Zuordnung (oder doppelspurig); Begründung grobes Verschulden; Kausalität bei ungeklärtem Hergang; Beklagtenwahl (Spediteur vs. Frachtführer/Chauffeur: Art. 41 OR; Abtretung Art. 21 Abs. 3 AB; Forderungsübergang Art. 401 Abs. 1 OR), Solvenz; Schadensbewertung.

**7. Beilagen-Checkliste:** Vollmacht; HR-Auszüge (Klägerin, Beklagte, Frachtführer); Speditionsvertrag; AB SPEDLOGSWISS (Fassung); Grundgeschäfts-Dokumente; Übernahmequittung/Transportdokumente; Polizeiunterlagen (bei Diebstahl/Verlust); Wertnachweis (Gutachten); Forderungsschreiben; Web-/Werbeauftritt der Beklagten (Professionalität). Offerten: Zeugen (Chauffeur, Mitarbeitende), Parteibefragung/Beweisaussage (Organe, Art. 159 ZPO).

**8. Besonderheiten/Fallen:** De-facto kurze Verjährung: frachtrechtliche Spur bzw. AGB-Jahresfrist (Art. 32 AB) → vorsorglich innert 1 Jahr klagen; AGB-Verkürzung für Spur A unwirksam (Art. 129 i.V.m. Art. 127 OR). Limiten (Art. 21, 22, 25, Art. 2 Ziff. 2 AB) zulässig, aber bei Grobfahrlässigkeit/Vorsatz unwirksam (Art. 100 Abs. 1 OR) — qualifiziertes Verschulden behaupten und beweisen. Hilfspersonen-Falle: Art. 101 OR erlaubt weitergehende Freizeichnung. Qualifikationsrisiko Spedition/Fracht (Beweislast je nach Praxis bei der Partei, die sich auf AGB beruft; BGE 132 III 626). Aktiv-/Passivlegitimation: Versender ist nicht Partei des Unterfrachtvertrags — Optionen: Delikt (Art. 41 OR), Abtretung (Art. 21 Abs. 3 AB), Art. 401 Abs. 1 OR. Schadenszins ab finanzieller Auswirkung (BGE 130 III 591), nicht ab Mahnung.

## § 21 Klage auf Schadenersatz gegen den Frachtführer

**1. Klagetyp/Verfahrensart:** Leistungsklage auf Schadenersatz aus Frachtvertrag (Art. 440 ff. OR; Binnentransport Strasse, Muster CHF 170'000, Handelsgericht ZH). Ordentliches Verfahren. Schlichtung entfällt vor Handelsgericht (Art. 198 lit. f ZPO).

**2. Zuständigkeit:** Örtlich: Sitz Beklagte (Art. 10 Abs. 1 lit. b ZPO); Vertragsgerichtsstand Art. 31 ZPO möglich. Sachlich: Handelsgericht (Art. 6 Abs. 2 ZPO; § 44 lit. b GOG/ZH; Art. 72 Abs. 1 BGG). International Strasse: CMR (SR 0.741.611) vorrangig; Gerichtsstände Art. 31 Abs. 1 CMR (vereinbartes Gericht, Wohnsitz/Niederlassung Beklagter, Übernahmeort, Ablieferungsort). Weitere Regimes je Modalität: CIM/COTIF (Schiene), MÜ + LTrV (Luft), SSG (See), CMNI (Binnenschifffahrt).

**3. Rechtsbegehren-RASTER:** 1. Zahlung [Betrag CHF] zzgl. [Zinssatz, i.d.R. 5]% seit [Datum: Schadensereignis; bei CMR/CIM Reklamations-/Klagedatum]. 2. Kostenfolgen. Optional: Teilklage-Vorbehalt, Stufenklage auf Rechenschaft (Art. 400 Abs. 1 i.V.m. Art. 440 Abs. 2 OR), Eventualbegehren bei unsicherer Limite.

**4. Aufbau-Gliederung:** Rubrum → Rechtsbegehren → I. Formelles → II. Parteien (HR) → III. Sachverhalt (Grundgeschäft, Frachtvertragsschluss, AGB/Haftungsklausel, Übernahme des Guts, Schadensereignis, Verschuldensumstände, Schadensanzeige, Schadensberechnung, Folgeschaden) → IV. Rechtliches (anwendbares Recht, Haftungsgrundlage, Obhutsbeweis, qualifiziertes Verschulden, Nichtigkeit Freizeichnung, Entlastungsgründe widerlegen, Schadenshöhe/Limite, Zins, Aktivlegitimation, Anzeige, Verjährung) → Schlussformel, Beilagen-/Beweismittelverzeichnis.

**5. Materielle Anspruchsgrundlagen + Maskenfelder:** Art. 440–457 OR; Verlust/Untergang: Art. 447 Abs. 1 OR (voller Wert); Beschädigung/Teiluntergang/Verspätung: Art. 448 Abs. 1 OR (aller Schaden inkl. entgangener Gewinn), Limite voller Wert (Art. 448 Abs. 2 OR). Gemilderte Kausalhaftung mit Entlastungsbeweis (BGE 103 II 59; 102 II 256; 93 II 345). International: CMR Art. 17, Art. 23 Abs. 1/3 (8.33 SZR/kg); CIM Art. 23, Art. 30 § 2 (17 SZR/kg); MÜ Art. 22 Abs. 3 / LTrV (19 SZR/kg, undurchbrechlich); SSG Art. 105 (2 SZR/kg bzw. 666.67 SZR/Stück); CMNI Art. 16 ff., Art. 20 Abs. 1. Freizeichnung: Art. 100 Abs. 1 OR; Art. 101 Abs. 2/3 OR (str.).
Felder: [Absender, Empfänger, Frachtführer: Firma/Sitz/HR] · [Vertrag: Datum, Strecke, Vergütung; AGB j/n + Klausel] · [Gut: Bezeichnung, Gewicht, Wert + Nachweis] · [Übernahme: Ort, Datum, Zustand; Frachtbrief/Empfangsschein?] · [Ereignis: Datum, Ort, Hergang; Schadensart: Verlust/Untergang/Beschädigung/Verspätung] · [Verschulden: leicht/grob/Vorsatz + Belege] · [Schadensanzeige: Datum, Form, fristgerecht?] · [Berechnung: Wert am massgebenden Ort/Zeitpunkt − Restwert] · [Zins: Satz, Beginn] · [Regime: OR/CMR/CIM/MÜ/SSG/CMNI] · [Aktivlegitimation: Eigentum/Verfügungsrecht, Absender-/Empfängerstellung, Versicherer-Subrogation].

**6. Deterministisch vs. wertend:**
- *Maskierbar:* Regime-Weiche (Transportart + national/international); Anzeigefristen: 8 Tage (Art. 452 Abs. 3 OR), 7 Tage (Art. 30 Abs. 1 CMR; Art. 47 § 2 CIM; vgl. Art. 23 Abs. 4 CMNI), 3 Tage (Art. 111 Abs. 3 SSG), 14 Tage (Art. 31 Abs. 2 MÜ; Art. 13 Abs. 2 LTrV); Verjährung 1 Jahr (Art. 454 Abs. 1 OR; Art. 32 Abs. 1 CMR; Art. 24 Abs. 1 CMNI; Art. 48 § 1 CIM), 10 Jahre bei qualifiziertem Verschulden (Art. 454 Abs. 3 i.V.m. Art. 127 OR), 2 Jahre Verwirkung Luft (Art. 35 Abs. 1 MÜ); Limiten-Rechner (SZR/kg × Gewicht vs. Schaden); Zins 5% ab finanzieller Auswirkung (BGE 130 III 591) bzw. ab Reklamation/Klage (Art. 27 Abs. 1 CMR; Art. 37 § 2 CIM); Wertzeitpunkt (Ablieferung: OR/SSG/CMNI vs. Übernahme: CMR/CIM); Zuständigkeits-/Formalienlogik.
- *Wertend:* Verschuldensqualifikation + Limiten-Durchbrechung (Art. 29 Abs. 1 CMR; Art. 36 CIM; Art. 21 Abs. 1 CMNI; OR str.); AGB-Freizeichnungs-Gültigkeit; Aktivlegitimation Absender vs. Empfänger (BGer offen); Widerlegung von Entlastungsgründen inkl. privilegierter Vermutungen; Schadenssubstanziierung; Strategie bei Informationsasymmetrie (Rechenschaft Art. 400 Abs. 1 i.V.m. Art. 440 Abs. 2 OR).

**7. Beilagen-Checkliste:** Vollmacht; HR-Auszüge; Kaufvertrag/Rechnung (Wertnachweis); Frachtvertrag/Offerte/AB; AGB; Frachtbrief/Empfangsschein; Polizeirapport/Unfalldokumentation; Einvernahmeprotokolle, Tachografenauszug; Schadensanzeige mit Zustellnachweis; Schadensgutachten/Survey (idealerweise kontradiktorisch); Zeugenangaben; bei Versicherer-Klage: Police, Leistungsnachweis, Abtretungen.

**8. Besonderheiten/Fallen:** Verwirkung: vorbehaltlose Annahme + Frachtzahlung (Art. 452 Abs. 1 OR); erkennbare Schäden sofort, verdeckte unverzüglich, absolut 8 Tage (Art. 452 Abs. 2/3 OR); international 3–14 Tage. Verjährung 1 Jahr; 10 Jahre bei qualifiziertem Verschulden. Aktivlegitimation als Prozessrisiko (Verfügungsrecht Art. 443 OR; international Art. 13 Abs. 1 CMR, Art. 44 § 1 CIM); Versicherer-Subrogation Art. 95c Abs. 2 VVG (seit 1.1.2022; alte Gini/Durlemann-Praxis überholt), durch CMR-Haftungsordnung verdrängt (BGE 132 III 626); ausländische Syndikate: Legitimation sorgfältig belegen (BGE 141 III 539). Haftungsdurchbrechung regimeabhängig (Luft unverbrüchlich, Art. 22 Abs. 3/5 MÜ). Freizeichnung: nichtig bei eigenem grobem Verschulden (Art. 100 Abs. 1 OR), für Hilfspersonen weitergehend (Art. 101 Abs. 2 OR, str.). Wertangabe-Einwand Art. 447 Abs. 2 OR. Nur unmittelbarer Schaden; entgangener Gewinn nur via Art. 448 Abs. 1 OR. Frachtlohn entfällt bei wertlosem Transport (Art. 25 Abs. 1 i.V.m. Art. 23 Abs. 4 CMR; Art. 109 Abs. 1 SSG). Multimodal: Regime/Limite hängen vom Schadensabschnitt ab — Schadenslokalisierung mit grosser finanzieller Hebelwirkung.

## § 22 Klage aus Körperverletzung infolge Autounfalls

**1. Klagetyp/Verfahrensart:** Leistungsklage gegen den Motorfahrzeug-Haftpflichtversicherer als echte Teilklage (Art. 86 ZPO). Ordentliches Verfahren (Muster: Bezirksgericht, Streitwert deutlich über CHF 30'000). Schlichtung erforderlich (Klagebewilligung als Beilage); alternativ Handelsgericht (Art. 6 Abs. 2 i.V.m. Abs. 3 ZPO; BGE 138 III 694) — dann keine Schlichtung (Art. 198 lit. f ZPO).

**2. Zuständigkeit:** Örtlich: Unfallort oder Wohnsitz/Sitz Beklagte (Art. 38 Abs. 1 ZPO); gegen NGF/NVB zusätzlich Zweigniederlassung (Art. 38 Abs. 2 ZPO). Sachlich: Wahlrecht ordentliches Gericht/Handelsgericht. Direktes Forderungsrecht: Art. 65 Abs. 1 SVG; Einredenausschluss Art. 65 Abs. 2 SVG. Teilklage bei teilbarer Leistung (Art. 86 ZPO). International: LugÜ (Art. 2 Abs. 1; Art. 5 Ziff. 3; Direktklage am Wohnsitz des Geschädigten via Art. 11 Ziff. 2 i.V.m. Art. 8–10 LugÜ; «Odenbreit», BGE 138 III 386); ausserhalb LugÜ Art. 129, 131 IPRG. Anwendbares Recht: Haager Strassenverkehrsübereinkommen (Art. 3; via Art. 134 IPRG).

**3. Rechtsbegehren-RASTER (3 Begehren):**
1. Leistung: Zahlung [Betrag CHF] für die bis [Stichtag] aufgelaufene [Schadensposition], zzgl. aufgelaufener Schadenszins [Betrag CHF] bis [Stichtag], zzgl. [Zinssatz, i.d.R. 5]% auf [Hauptbetrag] ab [Stichtag]
2. Vormerkung Teilklage mit Vorbehalt der Nachforderung [weitere Positionen, Genugtuung]
3. Kostenfolgen inkl. MwSt [Satz]%

**4. Aufbau-Gliederung:** Rubrum (Betreff mit [Unfalldatum]) → Anträge → I. Formelles (Vollmacht; Zuständigkeit; Direktforderungsrecht; erfolglose Schlichtung; Teilklage-Erklärung mit Nachklagevorbehalt) → II. Unfallhergang → III. Medizinische Situation (chronologisch, bis heute + Prognose) → IV. Berufliche Auswirkungen → V. Lohnfortzahlungen/SV-Leistungen → VI. Haftung → VII. Kausalzusammenhang (natürlich/adäquat) → VIII. Erwerbsschaden (Rechtsgrundlagen) → IX. Validenhypothese → X. Invalidensituation → XI. Konkrete Schadenberechnung → XII. Schadenszins → XIII. Fazit mit Kostenantrag. BO + Beilagenverweis je Behauptung; «zweifach»; separates Beweismittelverzeichnis.

**5. Materielle Anspruchsgrundlagen + Maskenfelder:** Halterhaftung als Gefährdungshaftung Art. 58 Abs. 1 SVG; mehrere Halter Art. 61 Abs. 1 SVG; Direktanspruch Art. 65 Abs. 1 SVG. Schadensposten Art. 46 OR; Schätzung Art. 42 Abs. 2 OR; Schadenminderung Art. 44 OR i.V.m. Art. 2 Abs. 1 ZGB; Nettolohnprinzip/Rentenschaden BGE 129 III 135; Schadenszins 5% ab Entstehung ohne Mahnung (BGE 122 III 53). SV-Schnittstelle: Subrogation/Kongruenz Art. 72–74 ATSG, Art. 34b BVG; Privatversicherer Art. 72 VVG; Quotenvorrecht Art. 73 ATSG / Art. 88 SVG; UVG-Taggeld Art. 16 Abs. 1 UVG, Einstellung Art. 19 Abs. 1 UVG, Rente Art. 18 Abs. 1 UVG; IV-Rente Art. 28 Abs. 1 IVG; PK Art. 23, 26 BVG; Invaliditätsbemessung Art. 16 ATSG. (Haushaltschaden, Heilungskosten, Genugtuung im Muster nicht beziffert — Verweis auf §§ 19/23.)
Felder: [Unfalldatum/-ort/-hergang], [Delta-v], [Erstdiagnose + Datum, 72h-Latenz dokumentiert j/n], [Beschwerdeliste je Zeitraum], [AUF-Grad % je Phase], [Beruf/Arbeitgeber vor Unfall], [Bruttolohn-Reihe], [Lohnsteigerung %], [Validenlohn pro Jahr], [Sozialabzug %], [Invalideneinkommen + Pensum %], [UVG-Taggeld + Einstellungsdatum], [IV-Rente ab Datum], [PK-Rente ab Datum], [IV-Grad %], [Rechnungstag], [Berechnungstool z.B. Leonardo], [Haftungsquote %], [Schlichtung/Klagebewilligung].

**6. Deterministisch vs. wertend:**
- *Maskierbar:* Gerichtsstandsprüfung; Schlichtungserfordernis; Teilklage-Klausel; Zins 5% taggenau ab Entstehung; Nettolohnabzug; Kapitalisierung nach Barwerttafeln Stauffer/Schaetzle/Weber (Leonardo; BGer 4A_433/2013); Kongruenz-Anrechnungstabelle je Periode; Quotenvorrecht-Rechnung; MwSt; Formalien.
- *Wertend:* Kausalitäts-Plausibilisierung bei nicht objektivierbaren Beschwerden (HWS); Substanziierungstiefe Beschwerdeverlauf; Validenhypothese (Karriere/Lohnentwicklung); Schadenminderung am konkreten Arbeitsmarkt; Umgang mit nachteiligen SV-Gutachten; Teilklage-Strategie (Auswahl Position/Periode).

**7. Beilagen-Checkliste:** Vollmacht; Klagebewilligung; Polizeirapport; unfallanalytisches Gutachten; HWS-Dokumentationsbogen; Spital-/Hausarzt-/Facharztberichte; polydisziplinäres SV-Gutachten; Lebenslauf; Arbeitszeugnisse; Aufhebungsvereinbarung; Bewerbungsdossier + Absagen (Schadenminderung); neuer/alter Arbeitsvertrag; UV-Taggeldabrechnungen; IV-/PK-Rentenentscheide; Mitarbeiterqualifikation; Lohnausweise; Lohnstatistik (LSE); Schadenberechnungs-Auszug (Papier + elektronisch). Offerten: Zeugen (Ärzte, Vorgesetzte, Ehepartner, Case Manager), Parteibefragung, gerichtliche Gutachten (medizinisch, betriebswirtschaftlich).

**8. Besonderheiten/Fallen:** Nachklagevorbehalt nach h.L. nicht zwingend, aber empfohlen; negative Feststellungswiderklage auch bei unterschiedlicher Verfahrensart möglich (BGE 143 III 506; 145 III 299; 147 III 172; BGer 4A_395/2021) — Risiko vorzeitiger Gesamtbeurteilung; rechtskräftige Abweisung einer Teilklage sperrt grundsätzlich die Nachklage (BGer 4A_449/2020). Kostensteuerung via Teilklage; bei teilweisem Obsiegen Kostenüberbindung möglich (Art. 107 Abs. 1 lit. a ZPO). SV-Regress: Anspruchsübergang im Unfallzeitpunkt (Art. 72 ATSG), nur kongruente Leistungen anrechenbar (Art. 74 Abs. 2 ATSG), Quotenvorrecht (Art. 73 ATSG, Art. 88 SVG); definitive Berechnung erst nach SV-Abschluss. Adäquanz-Schere: UVG-Einstellung (BGE 134 V 109) präjudiziert Haftpflichtrecht nicht (BGE 123 III 110). Vorprozessuale vs. ausserprozessuale Anwaltskosten unterscheiden (BGer 4A_264/2015). NGF (Art. 76 SVG) / NVB (Art. 74 SVG) als passivlegitimierte Sonderfälle. Verjährung Personenschäden seit 1.1.2020: 3 Jahre relativ / 20 Jahre absolut (Art. 60 Abs. 1bis OR, Art. 128a OR); spezifische SVG-Verjährungsnorm zu verifizieren (Fedlex).

## § 23 Gesuch um vorsorgliche Beweisabnahme (Unfallfolgen)

**1. Gesuchstyp/Verfahrensart:** Gesuch um vorsorgliche Beweisführung ausserhalb hängigen Prozesses nach Art. 158 Abs. 1 lit. b ZPO (schutzwürdiges Interesse: Abklärung Prozess-/Beweisaussichten), gerichtet auf gerichtliches medizinisches Gutachten (Muster: Skiunfall/Haushaltschaden). Summarisches Verfahren (Art. 158 Abs. 2 ZPO), Einzelrichter; keine Schlichtung (Art. 158 Abs. 2 i.V.m. Art. 198 lit. a ZPO).

**2. Zuständigkeit:** Örtlich: Handlungs-/Erfolgsort = Unfallort (Art. 158 Abs. 2 i.V.m. Art. 13 lit. a i.V.m. Art. 36 ZPO). Sachlich: Einzelrichter, summarisch (kantonale Organisation).

**3. Rechtsbegehren-RASTER (1 Begehren, bewusst ohne Kostenantrag):** Anordnung eines gerichtlichen Gutachtens zu [Beweisthema: medizinische Folgen des Unfalls vom [Datum] + Einschränkungen in [Lebensbereich]]. Kein Kostenantrag (Gesuchsteller trägt Kosten und entschädigt die Gegenpartei ohnehin, BGE 140 III 30); stattdessen Rückforderungsvorbehalt. Im Begründungsteil: Katalog von [n] Expertenfragen + [Anzahl] Gutachterstellen-Vorschläge.

**4. Aufbau-Gliederung:** Rubrum («vorsorgliche Beweisabnahme, Art. 158 ZPO») → Antrag → I. Formelles (Vollmacht, Rechtsinstitut, Zuständigkeit, keine Schlichtung) → II. Unfallhergang (substanziiert, kein Aktenverweis) → III. Medizinische Situation → IV. Rechtsgrundlagen + Interessennachweis (Glaubhaftmachung) → V. Anspruch gegen Gesuchsgegnerin → VI. Grundsätzliche Haftung → VII. Schaden (hypothetische Positionen: Haushaltschaden, Genugtuung, Kosten) → VIII. Expertenfragen → IX. Gutachterstellen → X. Kosten (Rückforderungsvorbehalt). «Zweifach»; Beilagen dreifach (Gutachterexemplar).

**5. Materielle Anspruchsgrundlagen + Maskenfelder:** (Substanziierung des möglichen Hauptanspruchs ist Gültigkeitsvoraussetzung.) Haftung Skilift-/Bergbahnbetreiberin: Art. 2 Abs. 1 SebG; Art. 20 SebG verweist auf EBG; Gefährdungshaftung Art. 40b Abs. 1 EBG; Entlastung Art. 40c EBG. Alternativ Verkehrssicherungspflicht aus Transportvertrag (Art. 97 OR; BGE 130 III 193) bzw. Delikt (Art. 41 OR). Schadensposten: Haushaltschaden normativ, SAKE-Statistik (BGE 132 III 321); Genugtuung nach Ermessen (Anlehnung an Integritätsentschädigung Anhang 3 UVV/Suva-Tabellen; Grundnorm Art. 47 OR); Heilbehandlungskosten inkl. Franchise/Selbstbehalt (Art. 46 Abs. 1 OR; Art. 64 KVG). Beweismass: schutzwürdiges Interesse glaubhaft machen (BGE 138 III 76; 140 III 16).
Felder: [Unfalldatum/Zeit/Ort], [Hergang], [Diagnosen], [Operationen/Verlauf mit Daten], [aktuelle Beschwerden], [Haushaltstyp + Tätigkeitenliste], [Standpunkt Gegenseite + Bestreitungsdatum], [vorhandene Gutachten/SV-Akten j/n], [Beweisthema], [Expertenfragen 1–n], [Gutachterstellen], [Geburtsdatum/Erwerbsstatus].

**6. Deterministisch vs. wertend:**
- *Maskierbar:* Verfahrensart/Zuständigkeit/keine Schlichtung; Antrag ohne Kostenbegehren + Standard-Rückforderungsvorbehalt; Kostenvorschuss (Art. 102 Abs. 1 ZPO); Streitwert = mutmassliches Hauptbegehren (BGE 140 III 12); standardisierbarer Fragenkatalog (Beschwerden/Verlauf; stabiler Zustand per [Datum]; Unfallkausalität mit überwiegender Wahrscheinlichkeit, allein-/teilursächlich; unfallfremde Faktoren; Therapiebedarf; prozentuale Einschränkung je Haushaltstätigkeit; dauerhafte Integritätsbeeinträchtigung nach Anhang 3 UVV/Suva-Tabellen); Beilagen dreifach; Rechtsmittelfrist 10 Tage.
- *Wertend:* schutzwürdiges Interesse (insb. bei vorhandenen SV-Gutachten); Substanziierungstiefe Haftung/Schadensposten; Strategie Art.-158-Gesuch vs. Teilklage; fallbezogene Zusatzfragen; Gutachterstellen-Auswahl.

**7. Beilagen-Checkliste:** Vollmacht; Polizeirapport; Fotodokumentation Unfallort (markiert); Einvernahmeprotokolle; Operationsberichte; Spital-Austrittsbericht; fachärztliche Berichte (chronologisch); Bestreitungsschreiben der Gegenseite; HR-Auszug Gesuchsgegnerin. Beilagen dreifach.

**8. Besonderheiten/Fallen:** Substanziierungspflicht trotz Summarverfahren — Hauptanspruch präzise darlegen, kein Aktenverweis (BGer 4A_317/2014; BGE 143 III 113). Kein schutzwürdiges Interesse bei bereits tauglichen Gutachten/umfangreichen SV-Akten (BGE 140 III 24); bei IV-Gutachten offen (IV prüft Kausalität nicht). Beweiskraft-Falle: gerichtliches Gutachten (Art. 183 ff. ZPO) mit voller Beweiskraft im Folgeprozess — negatives Ergebnis beerdigt den Hauptanspruch faktisch. Kostenrisiken: Vorschuss für polydisziplinäre Gutachten; Streitwert nach mutmasslichem Hauptbegehren (Art. 95 Abs. 2 lit. b ZPO); Entschädigungspflicht unabhängig vom Ausgang (BGE 140 III 30); keine unentgeltliche Rechtspflege nach bisheriger Praxis (BGE 140 III 12; Änderung via ZPO-Revision, neuer Art. 118 Abs. 2 ZPO — Inkrafttreten zu verifizieren, Fedlex). Verjährung Personenschäden seit 1.1.2020: 3/20 Jahre (Art. 60 Abs. 1bis, Art. 128a OR). Expertenfragen primär vom Gesuchsteller (BGer 4A_322/2012); Teilkausalität genügt (BGer 4A_130/2014), unfallfremde Faktoren erst bei Berechnung/Bemessung (Art. 42–44 OR; BGE 113 II 86). Rechtsmittel: Berufung/Beschwerde je nach Streitwert (Art. 308/319 ZPO), Frist 10 Tage (Art. 314 Abs. 1 / Art. 321 Abs. 2 ZPO); vor BGer nur Verfassungsrügen (Art. 98 BGG); gutheissender Ernennungsentscheid = Zwischenentscheid (Art. 93 Abs. 1 BGG). Alternative Teilklage mit Gutachtensantrag: schneller, aber Widerklage-Risiko mit Streitwertsprung.

## § 24 Klage wegen absichtlicher Täuschung

**1. Klagetyp/Verfahrensart:** Leistungsklage auf Geldzahlung («betreffend Forderung»), kombiniert mit Begehren um Beseitigung des Rechtsvorschlags (Muster mit vorgängiger Betreibung). Ordentliches Verfahren (Muster CHF 200'000; vereinfacht nur bis CHF 30'000, Art. 243 ZPO). Schlichtung obligatorisch (Klagebewilligung Art. 206 Abs. 2 / Art. 209 ZPO; Einreichungsfrist 3 Monate, Art. 209 Abs. 3 ZPO). Strategische Alternativen: Arrest (Art. 271 Abs. 1 Ziff. 2 SchKG), Strafanzeige mit Beschlagnahme (Art. 69 ff. StGB; Art. 263 ff. StPO), Adhäsionsklage (Art. 122 Abs. 1 StPO).

**2. Zuständigkeit:** Örtlich: primär Gerichtsstandsvereinbarung (Art. 17 ZPO — gilt nach h.L. auch für Streit über die Vertrags(un)gültigkeit); alternativ Art. 10 ZPO; deliktisch Art. 36 ZPO (Handlungs-/Erfolgsort, Sitz Geschädigter). International: Art. 23, Art. 5 Ziff. 3 LugÜ; Art. 5, 129 IPRG. Sachlich kantonal (Muster: § 27 Abs. 1 GOG/ZG). Taktik: Forum mit unzweifelhaftester Zuständigkeit wählen (Deliktsforum umstrittener als Vertrags-/Sitzgerichtsstand).

**3. Rechtsbegehren-RASTER (3 Begehren):** 1. Zahlung [Betrag CHF] zzgl. [Zinssatz, i.d.R. 5]% seit [Datum der Leistung/Überweisung]. 2. Beseitigung des Rechtsvorschlags in Betreibung Nr. [Nr.], Betreibungsamt [Ort], Zahlungsbefehl vom [Datum] (nur bei Betreibung). 3. Kostenfolgen [+ MwSt-Zusatz, wenn nicht vorsteuerabzugsberechtigt; kantonale Tarifgrundlage, Muster AnwT/ZG].

**4. Aufbau-Gliederung:** Rubrum → Rechtsbegehren → Begründung in fester Reihenfolge: Bevollmächtigung → Zuständigkeit (örtlich/sachlich) → Prozessgeschichte I (Betreibung/Rechtsvorschlag) → Prozessgeschichte II (Schlichtung, Klagebewilligung, Fristwahrung) → Beschreibung der Beklagten (HR, Statuten, Zweck, Organe) → Sachverhalt chronologisch (Anbahnung → täuschende Angaben → Vertragsschluss → Leistung → Entdeckung → Unverbindlichkeitserklärung), BO je Behauptung → Rechtliche Würdigung (Täuschung/Unverbindlichkeit → Rückforderung/Bereicherung → kumulativ Delikt + Schadenszins) → Kostenfolge (Art. 106 ZPO) → Schlussantrag, Beilagenverzeichnis (im Doppel).

**5. Materielle Anspruchsgrundlagen + Maskenfelder:** Täuschung Art. 28 OR (Dritttäuschung Art. 28 Abs. 2 OR); Geltendmachung Art. 31 OR (Jahresfrist ab Entdeckung; formlose Erklärung genügt; Genehmigung schliesst Schadenersatz nicht aus, Art. 31 Abs. 3 OR); Rückabwicklung Art. 62 ff. OR (Bereicherung nach BGer-Praxis), Verjährung Art. 67 OR (3/10 Jahre); Delikt kumulativ Art. 41 ff. OR, Schadenszins 5% ab Leistung (BGE 130 III 591), Verjährung Art. 60 OR (bei strafbarem Betrug längere strafrechtliche Frist); optional gegen Organ persönlich: Art. 41 OR, culpa in contrahendo, Art. 754 OR (BGE 132 III 564); Abgrenzung Grundlagenirrtum Art. 24 Abs. 1 Ziff. 4 OR (Eventualbegründung); UWG Art. 3 Abs. 1 lit. a–d, Art. 9 UWG (taktisch meist verzichtbar).
Felder: [Täuschungshandlung: unrichtige Behauptung / Verschweigen (BGE 132 II 161)] · [Täuschungsabsicht (Vorsatz Organ/Hilfsperson)] · [Täuschender: Partei oder Dritter — bei Drittem Zusatzvoraussetzung Art. 28 Abs. 2 OR] · [Irrtum (einfacher Motivirrtum genügt)] · [Kausalität: ohne Täuschung kein Vertragsschluss (BGE 129 III 320); bei nachgewiesener Handlung vermutet (BGer 4A_533/2013)] · [Vertragstyp, Datum, Leistungsgegenstand] · [erbrachte Leistung: Betrag, Überweisungsdatum = Zinsbeginn] · [Entdeckungsdatum (Fristanker Art. 31 OR)] · [Unverbindlichkeitserklärung: Datum, Form/Beleg, innert Jahresfrist] · [keine vorherige Genehmigung].

**6. Deterministisch vs. wertend:**
- *Maskierbar:* Jahresfrist-Check Art. 31 OR ([Entdeckung] + 1 Jahr); Verjährung Art. 67/60 OR; 3-Monats-Frist Klagebewilligung; Zins fix 5% ab Leistung; Verfahrensart aus Streitwert; Kostenvorschuss (Art. 98 ZPO); MwSt-Weiche; Betreibungs-Metadaten → Begehren 2 ein-/ausblenden; Zuständigkeitsnormen-Auswahl.
- *Wertend:* Beweisführung Täuschungshandlung und -absicht (Hauptproblem); Gerichtsstandswahl; Beklagtenwahl Gesellschaft vs. Organ; Bonitäts-/Haftungssubstratprüfung, Arrest- vs. Strafweg; Eventualbegründung Grundlagenirrtum; Sachverhaltsnarrativ.

**7. Beilagen-Checkliste:** Vollmacht; Zahlungsbefehl; Klagebewilligung; HR-Auszug; Statuten; täuschende Unterlagen (Prospekt, Werbematerial); Webseiten-Auszug; Vertrag; Zahlungsbeleg; Nachweis der Unwahrheit (z.B. Behördenauskunft, mit Übersetzung); Unverbindlichkeitserklärung. Ohne Beilagencharakter: Zeugen, Parteibefragung/Beweisaussage.

**8. Besonderheiten/Fallen:** Verwirkung: Jahresfrist ab Entdeckung (Art. 31 OR); Unverbindlichkeit muss VOR Klage erklärt sein — die Klage ersetzt die Erklärung nicht. Genehmigung schliesst bei Täuschung Schadenersatz nicht aus (Art. 31 Abs. 3 OR) — anders beim Grundlagenirrtum. Gewährleistungsfalle: Geltendmachung kaufrechtlicher Mängelrechte gilt als Genehmigung → Anfechtung danach ausgeschlossen (BGE 127 III 83); Wahlrecht besteht (BGE 107 II 419); bei Täuschung keine Rügeobliegenheiten (Art. 203 OR), keine Verjährungseinrede (Art. 210 Abs. 6 OR). Kausalität bei nachgewiesener Täuschungshandlung vermutet (BGer 4A_533/2013; 4A_523/2014) — Beweisfokus auf der Handlung. Grundlagenirrtum nur als Eventualbegründung (höhere Anforderungen). Vollstreckungsrisiko: fehlendes Haftungssubstrat → Arrest (Art. 271 Abs. 1 Ziff. 2 SchKG) oder Strafweg (Adhäsion Art. 122 StPO; günstiger, aber Verlust der Verfahrensherrschaft). Kantonale Variablen: sachliche Zuständigkeit + MwSt-Praxis pro Kanton hinterlegen.

## § 25 Klage gegen den Versicherer wegen Leistungskürzungen

**1. Klagetyp/Verfahrensart:** Leistungsklage des Versicherten gegen den Privatversicherer auf ungekürzte VVG-Leistungen (Muster: Invaliditätskapital aus Einzel-Unfallversicherung). Grundsätzlich ordentliches Verfahren; Schlichtung erforderlich, Klagefrist 3 Monate (Art. 209 Abs. 3 ZPO). Sonderfall Zusatzversicherungen zur sozialen KV (inkl. Krankentaggeld; nach Rechtsprechung auch UVG-Zusatz-Taggelder, BGer 4A_409/2015; 4A_382/2014): vereinfachtes Verfahren ohne Streitwertgrenze (Art. 243 Abs. 2 lit. f ZPO); sozialer Untersuchungsgrundsatz (Art. 247 Abs. 2 lit. a ZPO); bei kantonaler einziger Instanz (Art. 7 ZPO) keine Schlichtung (BGE 138 III 558); keine Gerichtskosten (Art. 114 Abs. 1 lit. e ZPO); BGer-Beschwerde auch unter CHF 30'000 (Art. 74 Abs. 2 lit. b BGG). Säule 3a: BVG-Gericht (Art. 73 Abs. 1 lit. b BVG).

**2. Zuständigkeit:** Örtlich: ZPO-Gerichtsstände; AVB räumen häufig zusätzlichen Gerichtsstand am Wohnsitz/Sitz des Versicherten ein → Klausel prüfen und anführen. Sachlich: kantonal; in Handelsgerichtskantonen Wahlrecht des Versicherten (Art. 6 Abs. 3 ZPO); bei KV-Zusatz je nach Kanton Versicherungsgericht als einzige Instanz (Art. 7 ZPO). Parteibezeichnungs-Falle: Auslandssitz mit CH-Zweigniederlassung → Hauptsitz als Partei, Niederlassung nur Zustelladresse (BGer 4A_27/2013).

**3. Rechtsbegehren-RASTER (2 Begehren):** 1. Zahlung [Betrag CHF] nebst Zins zu [Zinssatz, i.d.R. 5]% seit [Verzugsdatum]. 2. Kosten-/Entschädigungsfolgen (zzgl. MwSt [Satz]%). Berechnungslogik [Betrag] bei Invaliditätskapital: [Invaliditätsgrad %] × [Versicherungssumme Vollinvalidität CHF]. [Verzugsdatum]: Tag nach Mahnungszugang, frühestens nach Ablauf der 4-Wochen-Frist von Art. 41 Abs. 1 VVG.

**4. Aufbau-Gliederung:** Rubrum («betreffend Forderung [VVG-Leistungen]») → Rechtsbegehren → I. Formelles (Vollmacht → örtliche Zuständigkeit/AVB-Gerichtsstand → sachliche Zuständigkeit + Verfahrensart → Schlichtung/Klagebewilligung/Frist) → II. Materielles: a) Sachverhalt chronologisch (Unfall → Erstbehandlung → Spital/Reha → Verlauf bis stationärer Endzustand → heutige Beeinträchtigungen), b) Anspruchsgrundlage (Police + AVB, Leistungsart, Bemessungsmechanik, Invaliditätsgrad, Betragsherleitung), c) Widerlegung jedes einzelnen Kürzungs-/Verweigerungsgrunds (je ein Block pro Tatbestand), d) Fälligkeit und Verzugszins, e) Schlussantrag → Unterschrift, Doppel, Beweismittelverzeichnis. Nummerierte Randziffern mit BO je Behauptung.

**5. Materielle Anspruchsgrundlagen + Maskenfelder:** Police + AVB als primäre Grundlage (Summen-/Kapitalversicherung; im PDF Art. 88 bzw. Art. 95b VVG genannt). Kürzungstatbestände (Abwehr): Art. 14 Abs. 2 VVG (Grobfahrlässigkeit), Art. 38a VVG (Schadenminderungsobliegenheit — nur bei Verschulden + Kausalität), AVB-Vorzustandsklauseln i.V.m. Art. 33 VVG (Unklarheitenregel). Art. 14 VVG dispositiv (vgl. Art. 97 VVG) → vertraglicher Kürzungsverzicht des Versicherers in Unfall-AVB verbreitet → AVB zuerst prüfen. Fälligkeit/Verzug: Art. 41 Abs. 1 VVG (4 Wochen), Art. 102 Abs. 1 OR (Mahnung), Art. 104 Abs. 1 OR (5%). Bemessung: AVB-Gliedertaxe; subsidiär Anhang 3 UVV / Suva-Tabellen (Richtwert, BGE 116 V 156).
Felder: [VN/Versicherter, Versicherer, Policen-Nr., AVB-Ausgabe] · [Versicherungsart: Schaden- vs. Summenversicherung — entscheidend für Substanziierungslast] · [Ereignis: Datum/Ort/Hergang] · [Leistungsfall; Dauerzustand erreicht: Datum] · [IV-Grad % + Bemessungsgrundlage] · [Versicherungssumme → Anspruch CHF] · [angerufene Kürzungsgründe: Grobfahrlässigkeit/Obliegenheit/Vorzustand/Anzeigepflicht/andere — Mehrfachauswahl; Ablehnungsschreiben: Datum] · [Einreichung Belege + Zugang; Mahnung + Zugang → Verzugsbeginn] · [Schlichtungsbehörde, Klagebewilligung].

**6. Deterministisch vs. wertend:**
- *Maskierbar:* Rubrum/Parteibezeichnung (Auslandssitz-Regel); Gerichtsstand aus AVB; Verfahrensart-Weiche (KV-Zusatz → vereinfacht/keine Schlichtung/keine Gerichtskosten; sonst ordentlich + Schlichtung); 3-Monats-Frist; Betragsberechnung Grad × Summe; Verzugsrechner (Belege-Zugang + 4 Wochen + Mahnung → 5%); MwSt; BO-Systematik.
- *Wertend:* Qualifikation Schaden- vs. Summenversicherung; Bestreiten der Grobfahrlässigkeit («elementarste Vorsichtsgebote», BGE 119 II 443); Schadenminderung (Kausalität + Verschulden, subjektive Umstände); AVB-Auslegung Vorzustandsklauseln (Art. 33 VVG); Würdigung medizinischer Berichte; Überklagungsrisiko (gerichtliches Gutachten kann tiefer ausfallen → vorprozessuale Facheinschätzung); Umgang mit Privatgutachten (nur Parteibehauptung, BGE 141 III 433; Alternative Schiedsgutachten, Art. 189 ZPO).

**7. Beilagen-Checkliste:** Vollmacht; Police mit massgebender AVB-Ausgabe; Klagebewilligung; Erstkonsultations-/Arztbericht; Spital-Austrittsbericht; Reha-Austrittsbericht inkl. neuropsychologischem Verlaufsbericht; fachärztliche Verlaufsberichte (chronologisch); Stellungnahme zur Dauerschaden-Einstufung; Bemessungstabelle (Suva); Ablehnungs-/Kürzungsschreiben; Anspruchsanmeldung mit Belegen + Zustellnachweis (Track&Trace); Mahnschreiben + Zustellnachweis; Beweismittelverzeichnis. Offerten: Zeugen, Parteibefragung/Beweisaussage, gerichtliches Gutachten.

**8. Besonderheiten/Fallen:** Fälligkeit Art. 41 Abs. 1 VVG: Verzug erst nach 4-Wochen-Frist ab Zugang der anspruchsbegründenden Unterlagen plus Mahnung — Zustelldaten dokumentieren, sonst falscher Zinsbeginn. Beweislast: Versicherter beweist Versicherungsfall + Umfang (Art. 8 ZGB); Kürzungs-/Befreiungstatbestände der Versicherer; bei Schadenversicherung volle Substanziierung des Ausfalls, bei Summenversicherung nicht (BGE 146 III 339). Privatgutachten keine Beweismittel (BGE 141 III 433); ZPO-Revision ordnet sie der Urkunde zu — Stand zu verifizieren (Fedlex, Art. 177 ZPO rev.). AVB-Verzicht auf Art. 14 VVG prüfen, bevor Grobfahrlässigkeit diskutiert wird (Art. 97 VVG). Vorzustandskürzung nur bei klarer AVB-Grundlage (Art. 33 VVG); Doppelprüfung: sprachliche Erfassung + ergäbe der Vorzustand nach derselben Methode überhaupt einen Grad > 0%? Schadenminderung (Art. 38a VVG): kumulativ Kausalität + Verschulden; zurückhaltende Sanktionierung (verzögerter Arztbesuch erst bei sehr langem Zuwarten schädlich, BGer 5C.55/2005: > 2 Monate). Verjährung im PDF nicht behandelt: Art. 46 VVG — seit Revision (1.1.2022) 5 Jahre (vorher 2); Übergangsrecht zu verifizieren (Fedlex). Anzeigepflichtverletzung nicht Thema: Art. 4 ff., Art. 6 VVG — Fristen/Kausalitätserfordernis zu verifizieren (Fedlex). Direktes Forderungsrecht seit 1.1.2022: Art. 60 Abs. 1bis VVG (im PDF als Art. 61 Abs. 1bis bezeichnet — Artikelnummer zu verifizieren, Fedlex); Einredenausschluss bei obligatorischen Haftpflichtversicherungen (Art. 59 Abs. 3 VVG; vgl. Art. 65 SVG). Überklagungsrisiko bei gutachtensabhängigen Leistungen → konservativ beziffern.


---

## Pflegebedarf (§11 Ziff. 4)

Alle [VF]-Marker vor Bau verifizieren; ZPO-Revisions-Stände (Art. 177,
118 Abs. 2) prüfen; kantonale Anker (GOG/ZH) nur ZH-Beispiele;
VVG-Revisions-Artikelnummern (60 Abs. 1bis) verifizieren.

## Abnahme-Status (§11 Ziff. 5)

Erstrecherche (4 Struktur-Agents, 12.6.2026); KEINE Wortlaut-Übernahme;
Priorisierung der Masken-Reihenfolge = Entscheidvorlage an David
(FAHRPLAN-VORLAGEN-AUSBAU, Phase V8).
