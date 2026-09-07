# R7 «Beschriftungen» — Befunde (W2·24-DESIGN-IDENTITAET)

Finder, read-only. Ort: `.claude/worktrees/w2-24-sweep` (Branch `feat/w2-24-sweep`,
HEAD 7a3b697e5 = PR #739). Preview: `vite preview` — Port 4353 war durch eine
parallele Session belegt, Vite ist selbständig auf **Port 4354** ausgewichen
(kein fremder Prozess angefasst). Werkzeug: Playwright-Node-Skript
(`chromium.launch()`, `page.evaluate`) gegen `localhost:4354`, Desktop
1024×800 und Mobile 390×844, `waitUntil: networkidle` + 300–500 ms Nachlauf.
Ergänzend grep gegen `src/**` für Datei:Zeile-Belege der Befunde.

## (A) Inventar

Für jede Route: alle sichtbaren Chrome-Elemente (`button, a, nav, header,
label, input, h1–h4, th` + deren `aria-label`/`title`/`placeholder`),
dedupliziert je Text, mit Wiederholungszähler. **Rechtsinhalt ausgefiltert**
(Art.-Sprunglinks, BBl/AS-Fundstellen, Gliederungs-Titel wie «Erste
Abteilung», Ziffern-Marker) — Zähler pro Route ausgewiesen. Bei drei
Übersichten und den zwei Gesetz-Leser-Routen ist die Liste **methodisch
gekappt** (Route ist datengetrieben mit hunderten strukturgleichen
Wiederholungen, z. B. 1'686 Artikel im OR) — Kappung explizit vermerkt,
keine verdeckte Auslassung. Datei-Zuordnung ist auf **Routen-Ebene**
vermerkt (eine Komponente rendert hunderte Beschriftungen; Datei:Zeile je
Einzelzeile wäre für 1'358 Inventarzeilen unverhältnismässig — die
konkreten Befunde unten tragen exakte Datei:Zeile).

### Startseite — 75 UI-Beschriftungen (6 Rechtsinhalt-Treffer ausgefiltert, 204 DOM-Elemente gesamt)  
Quelle (Routen-Ebene, nicht je Zeile): `src/pages/Startseite.tsx`
| Element | Text | Wdh. | title |
|---|---|---|---|
| a | Zum Inhalt springen | 1 |  |
| button [aria-label] | Seitenleiste ein- und ausblenden | 1 |  |
| a [aria-label] | §LexMetrik | 1 |  |
| input [aria-label] | LexMetrik durchsuchen oder zur Norm springen | 1 |  |
| button [aria-label] | ◐ | 1 | Automatisch (System) |
| button [aria-label] | de▾ | 1 |  |
| nav [aria-label] | + | 1 |  |
| button [aria-label] | + | 1 | Neuer Reiter (Alt+T) |
| h1 | Sammlung | 1 |  |
| a | Rechtsprechung5'093Entscheide im VolltextBundesgericht und kantonale Gerichte, nach Sachgebiet | 1 |  |
| a | Materialien1'561amtliche Materialien erfasstKreisschreiben, Wegleitungen und Leitfäden nach Behörde | 1 |  |
| a | Rechner23RechnerFristen, Gebühren und Beträge, Zuständigkeiten | 1 |  |
| a | Vorlagen26VorlagenVerträge, Klagen und Gesuche zum Ausfüllen | 1 |  |
| h2 | Bundesrecht, systematische Ordnung | 1 |  |
| button [aria-label] | Ausblenden | ×3 |  |
| a | Staats- und Verfassungsrecht | 1 |  |
| a | BV | 1 |  |
| a | ParlG | 1 |  |
| a | RVOG | 1 |  |
| a | RVOV | 1 |  |
| a | Privatrecht | 1 |  |
| a | ZGB | 1 |  |
| a | ZStV | 1 |  |
| a | GBV | 1 |  |
| a | TGBV | 1 |  |
| a | Zivilprozess- und Zwangsvollstreckungsrecht | 1 |  |
| a | ZPO | 1 |  |
| a | SchKG | 1 |  |
| a | GebV SchKG | 1 |  |
| a | KOV | 1 |  |
| a | Strafrecht und Strafverfahren | 1 |  |
| a | StGB | 1 |  |
| a | StPO | 1 |  |
| a | JStPO | 1 |  |
| a | JStG | 1 |  |
| a | Verwaltungsrecht | 1 |  |
| a | VwVG | 1 |  |
| a | VGG | 1 |  |
| a | VGKE | 1 |  |
| a | VGR | 1 |  |
| a | Internationales Recht | 1 |  |
| a | CISG | 1 |  |
| a | LugÜ | 1 |  |
| a | HZÜ | 1 |  |
| a | HBewÜ | 1 |  |
| h2 | Kantone, erfasste Erlasse | 1 |  |
| button [aria-label] | Anzeigen | ×2 |  |
| h2 | Frist berechnen | 1 |  |
| label | Datum (Ereignis) | 1 |  |
| input | TT.MM.JJJJ | 1 |  |
| button [aria-label] | Kalender öffnen | 1 |  |
| label | Frist | 1 |  |
| label | Einheit | 1 |  |
| label | Kanton (Feiertage) | 1 |  |
| label | Ferien / Stillstand | 1 |  |
| button | In Kalender (.ics) | 1 |  |
| a | Fristenrechner | 1 |  |
| a | Prozesskosten | 1 |  |
| a | Zuständigkeit | 1 |  |
| a | alle Rechner | 1 |  |
| a | Arbeitsvertrag | 1 |  |
| a | alle Vorlagen | 1 |  |
| h2 | Jüngste Entscheide im Korpus | 1 |  |
| a | alle Entscheide | 1 |  |
| h2 | Amtliche Materialien nach Behörde | 1 |  |
| button | Startseite anpassen | 1 |  |
| nav [aria-label] | NavigationRechnerVorlagenEinstellungenMethodikÜber LexMetrikKontaktDatenschutzerklärung | 1 |  |
| a | Rechner | 1 |  |
| a | Vorlagen | 1 |  |
| a | Einstellungen | 1 |  |
| a | Methodik | 1 |  |
| a | Über LexMetrik | 1 |  |
| a | Kontakt | 1 |  |
| a | Datenschutzerklärung | 1 |  |
| a | fedlex.admin.ch | 1 |  |
### Uebersicht-Gesetze — 120 von 233 UI-Beschriftungen (0 Rechtsinhalt-Treffer ausgefiltert, 1369 DOM-Elemente gesamt) — GEKAPPT auf die ersten 120 von 233 (Route datengetrieben mit vielen strukturgleichen Wiederholungen; Rest nicht einzeln aufgeführt, methodischer Entscheid Finder)  
Quelle (Routen-Ebene, nicht je Zeile): `src/pages/Gesetze.tsx + src/pages/gesetze-teile/*.tsx`
| Element | Text | Wdh. | title |
|---|---|---|---|
| a | Zum Inhalt springen | 1 |  |
| button [aria-label] | Seitenleiste ein- und ausblenden | 1 |  |
| a [aria-label] | §LexMetrik | 1 |  |
| input [aria-label] | LexMetrik durchsuchen oder zur Norm springen | 1 |  |
| button [aria-label] | ◐ | 1 | Automatisch (System) |
| button [aria-label] | de▾ | 1 |  |
| nav [aria-label] | Reiter 1: Gesetze✕+ | 1 |  |
| button | Reiter 1: Gesetze | 1 |  |
| button [aria-label] | ✕ | 1 | Reiter «Gesetze» schliessen |
| button [aria-label] | + | 1 | Neuer Reiter (Alt+T) |
| h1 | Gesetze | 1 |  |
| label | Filtern | 1 |  |
| input | Kürzel, Titel, SR-Nr. … | 1 |  |
| button | Alle | 1 |  |
| button | Bund | 1 |  |
| button | Kantone | 1 |  |
| button | International | 1 |  |
| a | OR | 1 | Bundesgesetz betreffend die Ergänzung des ZGB (Obligationenrecht) |
| a | ZGB | 1 | Schweizerisches Zivilgesetzbuch |
| a | ZPO | 1 | Schweizerische Zivilprozessordnung |
| a | StGB | 1 | Schweizerisches Strafgesetzbuch |
| a | StPO | 1 | Schweizerische Strafprozessordnung |
| a | SchKG | 1 | Bundesgesetz über Schuldbetreibung und Konkurs |
| a | BV | 1 | Bundesverfassung der Schweizerischen Eidgenossenschaft |
| a | DBG | 1 | Bundesgesetz über die direkte Bundessteuer |
| a | VwVG | 1 | Bundesgesetz über das Verwaltungsverfahren |
| a | BGG | 1 | Bundesgesetz über das Bundesgericht (Bundesgerichtsgesetz) |
| button | 201ErlasseBundesrechtGesetze & Verordnungen · 23'976 Artikel im VolltextÖffnen → | 1 |  |
| button | 37ErlasseInternationalStaatsverträge & EU-RechtÖffnen → | 1 |  |
| h2 | Gesetze nach Rechtsgebiet | 1 |  |
| h3 | Privatrecht | 1 |  |
| a | ZGBSchweizerisches ZivilgesetzbuchSR 210 | 1 |  |
| a | ORBundesgesetz betreffend die Ergänzung des ZGB (Obligationenrecht)SR 220 | 1 |  |
| a | VVGBundesgesetz über den VersicherungsvertragSR 221.229.1 | 1 |  |
| a | VMWGVerordnung über die Miete und Pacht von Wohn- und GeschäftsräumenSR 221.213.11 | 1 |  |
| a | GBVGrundbuchverordnungSR 211.432.1 | 1 |  |
| a | HRegVHandelsregisterverordnungSR 221.411 | 1 |  |
| a | GebV-HRegGebührenverordnung für das HandelsregisterSR 221.411.1 | 1 |  |
| a | URGBundesgesetz über das Urheberrecht und verwandte SchutzrechteSR 231.1 | 1 |  |
| a | UWGBundesgesetz gegen den unlauteren WettbewerbSR 241 | 1 |  |
| a | MSchGBundesgesetz über den Schutz von Marken und Herkunftsangaben (Markenschutzgesetz)SR 232.11 | 1 |  |
| a | PatGBundesgesetz über die Erfindungspatente (Patentgesetz)SR 232.14 | 1 |  |
| a | SortGBundesgesetz über den Schutz von Pflanzenzüchtungen (Sortenschutzgesetz)SR 232.16 | 1 |  |
| a | PRGBundesgesetz über PauschalreisenSR 944.3 | 1 |  |
| a | BEGBundesgesetz über Bucheffekten (Bucheffektengesetz, BEG)SR 957.1 | 1 |  |
| a | ZStVZivilstandsverordnung (ZStV)SR 211.112.2 | 1 |  |
| a | IPRGBundesgesetz über das Internationale Privatrecht (IPRG)SR 291 | 1 |  |
| a | MSchVVerordnung über den Schutz von Marken und Herkunftsangaben (MSchV)SR 232.111 | 1 |  |
| a | KKGBundesgesetz über den Konsumkredit (KKG)SR 221.214.1 | 1 |  |
| a | PatVVerordnung über die Erfindungspatente (Patentverordnung, PatV)SR 232.141 | 1 |  |
| a | BGBBBundesgesetz über das bäuerliche Bodenrecht (BGBB)SR 211.412.11 | 1 |  |
| a | DesVVerordnung über den Schutz von Design (Designverordnung, DesV)SR 232.121 | 1 |  |
| a | DesGBundesgesetz über den Schutz von Design (Designgesetz, DesG)SR 232.12 | 1 |  |
| a | TGBVTechnische Verordnung des EJPD und des VBS über das Grundbuch (TGBV)SR 211.432.11 | 1 |  |
| a | VKKGVerordnung zum Konsumkreditgesetz (VKKG)SR 221.214.11 | 1 |  |
| a | AdoVVerordnung über die Adoption (Adoptionsverordnung, AdoV)SR 211.221.36 | 1 |  |
| a | PAVOVerordnung über die Aufnahme von Pflegekindern (Pflegekinderverordnung, PAVO)SR 211.222.338 | 1 |  |
| h3 | Strafrecht | 1 |  |
| a | StGBSchweizerisches StrafgesetzbuchSR 311.0 | 1 |  |
| a | JStGBundesgesetz über das Jugendstrafrecht (Jugendstrafgesetz, JStG)SR 311.1 | 1 |  |
| a | VStrRBundesgesetz über das Verwaltungsstrafrecht (VStrR)SR 313.0 | 1 |  |
| a | OHGBundesgesetz über die Hilfe an Opfer von Straftaten (Opferhilfegesetz, OHG)SR 312.5 | 1 |  |
| a | MStGMilitärstrafgesetz (MStG)SR 321.0 | 1 |  |
| a | MStPMilitärstrafprozess (MStP)SR 322.1 | 1 |  |
| a | IRSGBundesgesetz über internationale Rechtshilfe in Strafsachen (Rechtshilfegesetz, IRSG)SR 351.1 | 1 |  |
| a | ZentVVerordnung über kriminalpolizeiliche Zentralstellen des Bundes (ZentV)SR 360.1 | 1 |  |
| h3 | Verfahrensrecht | 1 |  |
| a | ZPOSchweizerische ZivilprozessordnungSR 272 | 1 |  |
| a | StPOSchweizerische StrafprozessordnungSR 312.0 | 1 |  |
| a | BGGBundesgesetz über das Bundesgericht (Bundesgerichtsgesetz)SR 173.110 | 1 |  |
| a | JStPOSchweizerische JugendstrafprozessordnungSR 312.1 | 1 |  |
| a | VwVGBundesgesetz über das VerwaltungsverfahrenSR 172.021 | 1 |  |
| a | BGerRReglement für das BundesgerichtSR 173.110.131 | 1 |  |
| a | VGGBundesgesetz über das Bundesverwaltungsgericht (Verwaltungsgerichtsgesetz, VGG)SR 173.32 | 1 |  |
| a | BGFABundesgesetz über die Freizügigkeit der Anwältinnen und Anwälte (Anwaltsgesetz, BGFA)SR 935.61 | 1 |  |
| a | VGRGeschäftsreglement für das Bundesverwaltungsgericht (VGR)SR 173.320.1 | 1 |  |
| h3 | Schuldbetreibung & Konkurs | 1 |  |
| a | SchKGBundesgesetz über Schuldbetreibung und KonkursSR 281.1 | 1 |  |
| a | GebV SchKGGebührenverordnung zum SchKGSR 281.35 | 1 |  |
| a | KOVVerordnung über die Geschäftsführung der Konkursämter (KOV)SR 281.32 | 1 |  |
| a | VZGVerordnung des Bundesgerichts über die Zwangsverwertung von Grundstücken (VZG)SR 281.42 | 1 |  |
| h3 | Öffentliches Recht | 1 |  |
| a | BVBundesverfassung der Schweizerischen EidgenossenschaftSR 101 | 1 |  |
| a | SVGStrassenverkehrsgesetzSR 741.01 | 1 |  |
| a | DSGBundesgesetz über den DatenschutzSR 235.1 | 1 |  |
| a | BBGBundesgesetz über die BerufsbildungSR 412.10 | 1 |  |
| a | KGBundesgesetz über Kartelle und andere Wettbewerbsbeschränkungen (Kartellgesetz)SR 251 | 1 |  |
| a | BPRBundesgesetz über die politischen Rechte (BPR)SR 161.1 | 1 |  |
| a | ParlGBundesgesetz über die Bundesversammlung (Parlamentsgesetz, ParlG)SR 171.10 | 1 |  |
| a | RVOGRegierungs- und Verwaltungsorganisationsgesetz (RVOG)SR 172.010 | 1 |  |
| a | BPGBundespersonalgesetz (BPG)SR 172.220.1 | 1 |  |
| a | BGÖBundesgesetz über das Öffentlichkeitsprinzip der Verwaltung (Öffentlichkeitsgesetz, BGÖ)SR 152.3 | 1 |  |
| a | RPGBundesgesetz über die Raumplanung (Raumplanungsgesetz, RPG)SR 700 | 1 |  |
| a | USGBundesgesetz über den Umweltschutz (Umweltschutzgesetz, USG)SR 814.01 | 1 |  |
| a | AsylGAsylgesetz (AsylG)SR 142.31 | 1 |  |
| a | GlGBundesgesetz über die Gleichstellung von Frau und Mann (Gleichstellungsgesetz, GlG)SR 151.1 | 1 |  |
| a | BankGBundesgesetz über die Banken und Sparkassen (Bankengesetz, BankG)SR 952.0 | 1 |  |
| a | HMGBundesgesetz über Arzneimittel und Medizinprodukte (Heilmittelgesetz, HMG)SR 812.21 | 1 |  |
| a | BüGBundesgesetz über das Schweizer Bürgerrecht (Bürgerrechtsgesetz, BüG)SR 141.0 | 1 |  |
| a | NHGBundesgesetz über den Natur- und Heimatschutz (NHG)SR 451 | 1 |  |
| a | GSchGBundesgesetz über den Schutz der Gewässer (Gewässerschutzgesetz, GSchG)SR 814.20 | 1 |  |
| a | WaGBundesgesetz über den Wald (Waldgesetz, WaG)SR 921.0 | 1 |  |
| a | EntGBundesgesetz über die Enteignung (EntG)SR 711 | 1 |  |
| a | BöBBundesgesetz über das öffentliche Beschaffungswesen (BöB)SR 172.056.1 | 1 |  |
| a | PüGPreisüberwachungsgesetz (PüG)SR 942.20 | 1 |  |
| a | FIDLEGBundesgesetz über die Finanzdienstleistungen (Finanzdienstleistungsgesetz, FIDLEG)SR 950.1 | 1 |  |
| a | KAGBundesgesetz über die kollektiven Kapitalanlagen (Kollektivanlagengesetz, KAG)SR 951.31 | 1 |  |
| a | FINIGBundesgesetz über die Finanzinstitute (Finanzinstitutsgesetz, FINIG)SR 954.1 | 1 |  |
| a | VZAEVerordnung über Zulassung, Aufenthalt und Erwerbstätigkeit (VZAE)SR 142.201 | 1 |  |
| a | VRVVerkehrsregelnverordnung (VRV)SR 741.11 | 1 |  |
| a | SSVSignalisationsverordnung (SSV)SR 741.21 | 1 |  |
| a | DSVVerordnung über den Datenschutz (Datenschutzverordnung, DSV)SR 235.11 | 1 |  |
| a | BewVVerordnung über den Erwerb von Grundstücken durch Personen im Ausland (BewV)SR 211.412.411 | 1 |  |
| a | BüVVerordnung über das Schweizer Bürgerrecht (Bürgerrechtsverordnung, BüV)SR 141.01 | 1 |  |
| a | RPVRaumplanungsverordnung (RPV)SR 700.1 | 1 |  |
| a | VöBVerordnung über das öffentliche Beschaffungswesen (VöB)SR 172.056.11 | 1 |  |
| a | VEVVerordnung über die Einreise und die Visumerteilung (VEV)SR 142.204 | 1 |  |
| a | VIntAVerordnung über die Integration von Ausländerinnen und Ausländern (VIntA)SR 142.205 | 1 |  |
| a | AsylV 1Asylverordnung 1 über Verfahrensfragen (Asylverordnung 1, AsylV 1)SR 142.311 | 1 |  |
| a | AsylV 2Asylverordnung 2 über Finanzierungsfragen (Asylverordnung 2, AsylV 2)SR 142.312 | 1 |  |
### Uebersicht-Rechtsprechung — 120 von 371 UI-Beschriftungen (3 Rechtsinhalt-Treffer ausgefiltert, 1522 DOM-Elemente gesamt) — GEKAPPT auf die ersten 120 von 371 (Route datengetrieben mit vielen strukturgleichen Wiederholungen; Rest nicht einzeln aufgeführt, methodischer Entscheid Finder)  
Quelle (Routen-Ebene, nicht je Zeile): `src/pages/Rechtsprechung.tsx + src/components/rechtsprechung/*.tsx`
| Element | Text | Wdh. | title |
|---|---|---|---|
| a | Zum Inhalt springen | 1 |  |
| button [aria-label] | Seitenleiste ein- und ausblenden | 1 |  |
| a [aria-label] | §LexMetrik | 1 |  |
| input [aria-label] | LexMetrik durchsuchen oder zur Norm springen | 1 |  |
| button [aria-label] | ◐ | 1 | Automatisch (System) |
| button [aria-label] | de▾ | 1 |  |
| nav [aria-label] | Reiter 1: Gesetze⧉✕Reiter 2: Rechtsprechung✕+ | 1 |  |
| button | Reiter 1: Gesetze | 1 |  |
| button [aria-label] | ⧉ | 1 | Daneben öffnen |
| button [aria-label] | ✕ | ×2 | Reiter «Gesetze» schliessen |
| button | Reiter 2: Rechtsprechung | 1 |  |
| button [aria-label] | + | 1 | Neuer Reiter (Alt+T) |
| h1 | Rechtsprechung | 1 |  |
| button | Alle Sachgebiete5'093 | 1 |  |
| button | Privatrecht992 | 1 |  |
| button | Strafrecht1'419 | 1 |  |
| button | Verfahrensrecht86 | 1 |  |
| button | Öffentliches Recht1'330 | 1 |  |
| button | Steuern & Abgaben116 | 1 |  |
| button | Sozialversicherung1'150 | 1 |  |
| button | Nicht dabei? Im gesamten Schweizer Korpus suchen (entscheidsuche.ch) → | 1 |  |
| label | Filtern | 1 |  |
| input | Thema, Aktenzeichen, Norm, Gericht … | 1 |  |
| label | SortierungLeitentscheide zuerstNeueste zuerstÄlteste zuerstBund → Kantone | 1 |  |
| button | Liste | 1 |  |
| button | Karten | 1 |  |
| button [aria-label] | Alle 5'093 | ×3 |  |
| button [aria-label] | Bund 1'298 | 1 |  |
| button [aria-label] | Kantone 3'795 | ×2 |  |
| button [aria-label] | AG 6 | 1 |  |
| button [aria-label] | BE 6 | 1 |  |
| button [aria-label] | BS 3'765 | 1 |  |
| button [aria-label] | GR 6 | 1 |  |
| button [aria-label] | SG 6 | 1 |  |
| button [aria-label] | ZH 6 | 1 |  |
| button [aria-label] | BVGer 5 | 1 | Bundesverwaltungsgericht |
| button [aria-label] | BStGer 5 | 1 | Bundesstrafgericht |
| button [aria-label] | BPatGer 5 | 1 | Bundespatentgericht |
| button [aria-label] | Deutsch 4'689 | 1 |  |
| button [aria-label] | Französisch 367 | 1 |  |
| button [aria-label] | Italienisch 37 | 1 |  |
| input [aria-label] | Nach Richter:in filtern | 1 |  |
| label | Urteil ab | 1 |  |
| label | Urteil bis | 1 |  |
| label | Nur Leitentscheide (amtliche BGE) | 1 |  |
| h2 | Amtliche Leitentscheide (BGE) | 1 |  |
| a [aria-label] | Invalidenrente; Valideneinkommen; Invalideneinkommen. | 1 |  |
| a [aria-label] | Siegelung und Entsiegelung sichergestellter elektronischer Datenträger; Zulässigkeit der Anordnung einer Datenspiegelung durch die Strafverfolgungsbehörden. | 1 |  |
| a [aria-label] | Steuerliche Behandlung einer Entschädigung wegen unrechtmässiger fristloser Kündigung nach öffentlichem Personalrecht. | 1 |  |
| a [aria-label] | Gerichtskosten im kantonalen Verfahren bei Rechtsverweigerungs- oder Rechtsverzögerungsbeschwerden auf dem… | 1 |  |
| a [aria-label] | Ersatz von Erwerbsausfall bei Organspende. | 1 |  |
| a [aria-label] | Anlagekosten; Abbruch von Bauten; Ersatzneubau. | 1 |  |
| a [aria-label] | Bestimmung des Stellvertretungsstatuts. | 1 |  |
| a [aria-label] | Verfahren betreffend Feststellung neuen Vermögens, Fortsetzung der Betreibung und Fristenstillstand. | 1 |  |
| a [aria-label] | Verwaltungsreglement für die Ersatzkasse gemäss den Art. 72 und 73 UVG (Ausgabe 2008.1); Zuweisung von… | 1 |  |
| a [aria-label] | Ausnahmsweise Verwendung einer vom angefochtenen Entscheid abweichenden Amtssprache; Streitwerterfordernis bei der Anfechtung eines kantonalen… | 1 |  |
| a [aria-label] | Verbot einer Tätigkeit mit Minderjährigen nach Verurteilung wegen Pornografie, die sexuelle Handlungen mit Minderjährigen zum Gegenstand hatte. | 1 |  |
| a [aria-label] | Konkurseröffnung nach SchKG; Auflösung der Gesellschaft wegen Organmangels und Anordnung der Liquidation nach den Vorschriften über den Konkurs. | 1 |  |
| a [aria-label] | Qualifiziert grobe Verletzung der Verkehrsregeln; Strafzumessung. | 1 |  |
| a [aria-label] | Kann auch eine uneheliche Person erbschaftssteuerrechtlich… | 1 |  |
| a [aria-label] | Verhältnis zwischen diesem Übereinkommen und den… | 1 |  |
| a [aria-label] | Anhang II FZA; Verordnung (EG) Nr. 883/2004; kein Anspruch auf Übernahme von invaliditätsbedingten baulichen Anpassungen an Immobilien im Ausland. | 1 |  |
| a [aria-label] | Eventuelle passive Streitgenossenschaft. | 1 |  |
| a [aria-label] | Beschränkung der Berufung auf die Strafzumessung; Sachverhaltskognition des Berufungsgerichts. | 1 |  |
| a [aria-label] | Abgrenzung des Angriffs zum Raufhandel. | 1 |  |
| a [aria-label] | Anspruch auf Lohnfortzahlung des Arbeitnehmers. | 1 |  |
| a [aria-label] | Entbindung vom ärztlichen Berufsgeheimnis gegenüber Angehörigen eines Patienten, der in spitalärztlicher Behandlung verstorben ist. | 1 |  |
| a [aria-label] | Überlassen eines Motorfahrzeugs an einen Fahrer, dessen Führerausweis abgelaufen ist. | 1 |  |
| a [aria-label] | Ort der Eheschliessung, wenn sich eine der betroffenen Personen im Zeitpunkt des amtlichen Rechtsaktes in der Schweiz befindet und die andere im Ausland. | 1 |  |
| a [aria-label] | Eignung als Vorsorgebeauftragter bei Familienkonflikten. | 1 |  |
| a [aria-label] | Öffentliche Aufforderung zu Verbrechen oder zur Gewalttätigkeit; Rechtsgut, Aufforderung zu einer im Ausland zu verübenden Straftat. | 1 |  |
| a [aria-label] | Zustellung des Zahlungsbefehls an den Ehegatten des Schuldners. | 1 |  |
| a [aria-label] | Besteuerung einer natürlichen Person, deren Steuerpflicht sich während der Steuerperiode ändert; Aufteilung der Steuerperiode. | 1 |  |
| a [aria-label] | Nicht wieder gutzumachender Nachteil. | 1 |  |
| a [aria-label] | Verwirkung der Herabsetzungsklage bei (lebzeitigen) Zuwendungen an mehr als eine Person; separater Lauf der Verwirkungsfristen. | 1 |  |
| a [aria-label] | Tilgung der Kosten des Konkursgerichts innert der zehntägigen Frist zur Weiterziehung des Konkurserkenntnisses; Erfordernis der Glaubhaftmachung der Zahlungsfähigkeit. | 1 |  |
| a [aria-label] | Angeborene Dysplasie der Zähne als Geburtsgebrechen. | 1 |  |
| a [aria-label] | Grundsätze gerichtlicher Vergleichsverhandlungen; Befangenheit eines Mitglieds der Gerichtsdelegation wegen Äusserungen an einer Vergleichsverhandlung. | 1 |  |
| a [aria-label] | Die erstinstanzliche Zuständigkeit eines Einzelgerichts begründet keine Einschränkung des berufungsgerichtlichen Ermessens bei der Strafzumessung. | 1 |  |
| a [aria-label] | Prosequierung eines schweizweiten Arrestes; Pfändung. | 1 |  |
| a [aria-label] | Nichtigkeit einer Entbindung von der ärztlichen Schweigepflicht wegen schwerer Verfahrensmängel. | 1 |  |
| a [aria-label] | Beschwerde gegen die Sistierung eines Zivilprozesses aufgrund einer bewilligten Nachlassstundung; Erfordernis des nicht wieder gutzumachenden Nachteils. | 1 |  |
| a [aria-label] | Provisorische Rechtsöffnung; befreiende Einwendung; vom Mieter gestellte Sicherheiten. | 1 |  |
| a [aria-label] | Vorrangige Begünstigte hinsichtlich der Erhaltung des Vorsorgeschutzes im Todesfall; geschiedener Ehegatte. | 1 |  |
| a [aria-label] | Rechtsmittel gegen Entscheide des Zwangsmassnahmengerichts. | 1 |  |
| a [aria-label] | Quantitative und zeitliche Begrenzung der jährlichen Einkaufssumme der beruflichen Vorsorge. | 1 |  |
| a [aria-label] | Folgen der Verletzung der Bestimmungen zum Ausstand und Zuständigkeit bei deren Geltendmachung im Berufungsverfahren. | 1 |  |
| a [aria-label] | Arbeitsvertrag; Konkurrenzverbot; Karenzentschädigung. | 1 |  |
| a [aria-label] | Internationale Schiedsgerichtsbarkeit; Revision; Einwirkung durch Verbrechen oder Vergehen. | 1 |  |
| a [aria-label] | Sachliche Zuständigkeit des kantonalen Gerichts für Streitigkeiten im Bereich der beruflichen Vorsorge; Klage auf Rückerstattung von Prämien der gebundenen Selbstvorsorge. | 1 |  |
| a [aria-label] | Begriff des Wiederholungsfalls. | 1 |  |
| a [aria-label] | Kurzarbeitsentschädigung; normale Arbeitszeit und flexibles Arbeitszeitsystem; Auslegung eines Arbeitsvertrags. | 1 |  |
| a [aria-label] | Erbverzicht; paulianische Anfechtung. | 1 |  |
| a [aria-label] | Verlauf der beruflichen Eingliederung im Verhältnis zur Arbeitsfähigkeit… | 1 |  |
| a [aria-label] | Buchführungspflichten für Immobilienfonds mit direktem Grundbesitz; Niederstwertprinzip; Erst- und Folgebewertung; Periodizitätsprinzip und Nachholung von Aufwandbuchungen. | 1 |  |
| a [aria-label] | Sicherheitshaft im Hinblick auf einen selbstständigen nachträglichen Entscheid; anwendbare Verfahrensregeln. | 1 |  |
| a [aria-label] | Rückerstattung rechtmässig bezogener Ergänzungsleistungen; Beginn der Verwirkungsfrist. | 1 |  |
| a [aria-label] | Vermögensverzicht und sittliche Unterstützungspflicht unter Geschwistern. | 1 |  |
| a [aria-label] | Gebundene Vorsorge (Säule 3a); Beweismass. | 1 |  |
| a [aria-label] | Grundsatz der freien Beweiswürdigung; Beweiswert eines Berichts einer Psychologin. | 1 |  |
| a [aria-label] | Rechtsschutz bei verfrüht abgeschlossenen Beschaffungsverträgen. | 1 |  |
| a [aria-label] | Sperrung von Vermögenswerten im Hinblick auf eine Einziehung bei Scheitern der Rechtshilfe an die Ukraine (Art. 4 SRVG). | 1 |  |
| a [aria-label] | Prozessstandschaft; Prozessmaxime betreffend die Prozessvoraussetzungen der Klage; gerichtliche Fragepflicht. | 1 |  |
| a [aria-label] | Strafzumessung bei gleichzeitiger Landesverweisung. | 1 |  |
| a [aria-label] | Neu entdeckte Tatsachen; Erheblichkeit des Ausstandsgrundes; Verbindung eines Mitgliedes des Bundespatentgerichts zu einer Zulieferin einer Partei. | 1 |  |
| a [aria-label] | Internationale Amtshilfe in Steuersachen; Amtshilfeersuchen zur Beschaffung von Informationen über schweizerische Bankkonten… | 1 |  |
| a [aria-label] | Lebensmittelrechtliches Täuschungsverbot; Verwendung von Tierarten zur Bezeichnung von pflanzlichen Fleischersatzprodukten. | 1 |  |
| a [aria-label] | Formelle Anforderungen an Revisionsgesuche; interkantonale Doppelbesteuerung; nachträgliche Aufhebung oder Änderung von Veranlagungsentscheiden; Revision oder Wiedererwägung. | 1 |  |
| a [aria-label] | Recht auf Ehe; illegal anwesende Personen. | 1 |  |
| a [aria-label] | Erweiterung der Bewilligung für das Inverkehrbringen eines Pflanzenschutzmittels; Vorsorgeprinzip.… | 1 |  |
| a [aria-label] | Prozessuale Konsequenzen (E. 1 und 5). | 1 |  |
| a [aria-label] | Wirtschaftlichkeitskontrolle von ärztlichen Leistungserbringern ("Überarztung"); Rückerstattung von Vergütungen. | 1 |  |
| a [aria-label] | Wiederherstellung der rechtskonformen Situation bei formell rechtswidrigen Bauten; Vollstreckungsverfügung. | 1 |  |
| a [aria-label] | Vermittlungsfähigkeit und versicherter Verdienst von behinderten Arbeitslosen. | 1 |  |
| a [aria-label] | Öffentlichkeitsprinzip bei einem Weiterzug eines Schiedsentscheids an das Bundesgericht. | 1 |  |
| a [aria-label] | Internationale Schiedsgerichtsbarkeit, Revision, nachträglich gefundene Beweismittel. | 1 |  |
| a [aria-label] | Wegentschädigung. | 1 |  |
| a [aria-label] | Vollstreckung auf dem Weg der Pfändung; Lastenverzeichnis; gesetzliches Grundpfandrecht zur Sicherung des Anspruchs der Stockwerkeigentümergemeinschaft auf die Beitragsforderungen der letzten drei… | 1 |  |
| a [aria-label] | Verdeckte Kapitaleinlagen; Wertzunahme auf Gesellschaftsanteilen als Erlösbestandteil. | 1 |  |
| a [aria-label] | Menschenhandel zum Zwecke der Ausbeutung der Arbeitskraft. | 1 |  |
### Uebersicht-Materialien — 100 von 201 UI-Beschriftungen (0 Rechtsinhalt-Treffer ausgefiltert, 4586 DOM-Elemente gesamt) — GEKAPPT auf die ersten 100 von 201 (Route datengetrieben mit vielen strukturgleichen Wiederholungen; Rest nicht einzeln aufgeführt, methodischer Entscheid Finder)  
Quelle (Routen-Ebene, nicht je Zeile): `src/pages/Materialien.tsx`
| Element | Text | Wdh. | title |
|---|---|---|---|
| a | Zum Inhalt springen | 1 |  |
| button [aria-label] | Seitenleiste ein- und ausblenden | 1 |  |
| a [aria-label] | §LexMetrik | 1 |  |
| input [aria-label] | LexMetrik durchsuchen oder zur Norm springen | 1 |  |
| button [aria-label] | ◐ | 1 | Automatisch (System) |
| button [aria-label] | de▾ | 1 |  |
| nav [aria-label] | Reiter 1: Gesetze⧉✕Reiter 2: Rechtsprechung⧉✕Reiter 3: Materialien✕+3 offen | 1 |  |
| button | Reiter 1: Gesetze | 1 |  |
| button [aria-label] | ⧉ | ×2 | Daneben öffnen |
| button [aria-label] | ✕ | ×3 | Reiter «Gesetze» schliessen |
| button | Reiter 2: Rechtsprechung | 1 |  |
| button | Reiter 3: Materialien | 1 |  |
| button [aria-label] | + | 1 | Neuer Reiter (Alt+T) |
| h1 | Materialien | 1 |  |
| label | Filtern | 1 |  |
| input | Titel, Nummer oder Behörde … | 1 |  |
| h2 | ESTV | 1 |  |
| a | Kreisschreiben · Nr. 5aUmstrukturierungenStand 01.02.2022Details & amtliche Fassung → | 1 |  |
| a | Kreisschreiben · Nr. 37MitarbeiterbeteiligungenStand 30.10.2020Details & amtliche Fassung → | 1 |  |
| a | MWST-Info · Nr. 02MWST-Info 02 SteuerpflichtStand 27.07.2026Details & amtliche Fassung → | 1 |  |
| a | MWST-Info · Nr. 03MWST-Info 03 GruppenbesteuerungStand 27.08.2026Details & amtliche Fassung → | 1 |  |
| a | MWST-Info · Nr. 04MWST-Info 04 SteuerobjektStand 03.09.2026Details & amtliche Fassung → | 1 |  |
| a | MWST-Info · Nr. 05MWST-Info 05 Subventionen und SpendenStand 26.05.2026Details & amtliche Fassung → | 1 |  |
| a | MWST-Info · Nr. 08MWST-Info 08 PrivatanteileStand 16.03.2026Details & amtliche Fassung → | 1 |  |
| a | MWST-Info · Nr. 10MWST-Info 10 NutzungsänderungenStand 10.08.2026Details & amtliche Fassung → | 1 |  |
| a | MWST-Info · Nr. 11MWST-Info 11 MeldeverfahrenStand 11.05.2026Details & amtliche Fassung → | 1 |  |
| a | MWST-Info · Nr. 12MWST-Info 12 SaldosteuersätzeStand 31.08.2026Details & amtliche Fassung → | 1 |  |
| a | MWST-Info · Nr. 13MWST-Info 13 PauschalsteuersätzeStand 31.08.2026Details & amtliche Fassung → | 1 |  |
| a | MWST-Info · Nr. 14MWST-Info 14 BezugsteuerStand 27.08.2026Details & amtliche Fassung → | 1 |  |
| a | MWST-Info · Nr. 18MWST-Info 18 VergütungsverfahrenStand 26.02.2026Details & amtliche Fassung → | 1 |  |
| a | MWST-Info · Nr. 21MWST-Info 21 Neue SteuerpflichtigeStand 04.12.2025Details & amtliche Fassung → | 1 |  |
| a | MWST-Info · Nr. 22MWST-Info 22 Ausländische UnternehmenStand 11.05.2026Details & amtliche Fassung → | 1 |  |
| a | MWST-Branchen-Info · Nr. 20MWST-Branchen-Info 20 BildungStand 28.07.2026Details & amtliche Fassung → | 1 |  |
| a | MWST-Branchen-Info · Nr. 23MWST-Branchen-Info 23 KulturStand 26.05.2026Details & amtliche Fassung → | 1 |  |
| a | MWST-Branchen-Info · Nr. 24MWST-Branchen Info 24 SportStand 26.05.2026Details & amtliche Fassung → | 1 |  |
| a | Kreisschreiben · Nr. 29bKreisschreiben Nr. 29b: KEPStand 10.10.2023Details & amtliche Fassung → | 1 |  |
| a | Kreisschreiben · Nr. 29cKreisschreiben Nr. 29c: KEPStand 10.10.2023Details & amtliche Fassung → | 1 |  |
| a | Weisung · W03-001W03-001D vom 03.10.2002Stand 03.10.2002Details & amtliche Fassung → | 1 |  |
| a | Weisung · W03-006W01-006D vom 06.06.2001Stand 06.06.2001Details & amtliche Fassung → | 1 |  |
| a | Weisung · W03-008W02-008D vom 18.12.2001Stand 18.12.2001Details & amtliche Fassung → | 1 |  |
| a | Weisung · W81-004W81-004D vom 30.04.1980Stand 30.04.1980Details & amtliche Fassung → | 1 |  |
| a | Weisung · W95-002W95-002D vom 12.11.1992Stand 12.11.1992Details & amtliche Fassung → | 1 |  |
| a | Weisung · W95-003W95-003D vom 25.11.1992Stand 25.11.1992Details & amtliche Fassung → | 1 |  |
| a | Weisung · W95-009W95-009D vom 03.12.1993Stand 03.12.1993Details & amtliche Fassung → | 1 |  |
| a | Weisung · W95-011W95-011D vom 08.06.1994Stand 08.06.1994Details & amtliche Fassung → | 1 |  |
| a | Weisung · W95-012W95-012D vom 08.07.1994Stand 08.07.1994Details & amtliche Fassung → | 1 |  |
| a | Weisung · W95-019W95-019D vom 07.03.1995Stand 07.03.1995Details & amtliche Fassung → | 1 |  |
| a | Weisung · W95-024W95-024D vom 30.06.1995Stand 30.06.1995Details & amtliche Fassung → | 1 |  |
| a | Weisung · W95-026W95-026D vom 22.09.1995Stand 22.09.1995Details & amtliche Fassung → | 1 |  |
| a | Weisung · W97-006W97-006D vom 06.06.1997Stand 06.06.1997Details & amtliche Fassung → | 1 |  |
| a | Weisung · W95-028W95-028D vom 29.01.1996Stand 29.01.1996Details & amtliche Fassung → | 1 |  |
| a | Weisung · W99-005W99-005D vom 19.08.1999Stand 19.08.1999Details & amtliche Fassung → | 1 |  |
| a | MerkblattS-02.122.1bStand 09.10.2023Details & amtliche Fassung → | 1 |  |
| h2 | EDÖB | 1 |  |
| a | Tätigkeitsbericht32. Tätigkeitsbericht 2024/2025Stand 30.06.2025Details & amtliche Fassung → | 1 |  |
| a | MerkblattMerkblatt Anmeldeformulare für MietwohnungenStand 15.07.2025Details & amtliche Fassung → | 1 |  |
| a | LeitfadenLeitfaden GesuchsbeurteilungStand 10.05.2023Details & amtliche Fassung → | 1 |  |
| h2 | SECO | 1 |  |
| a | MerkblattMerkblatt zum PikettdienstStand 02.11.2020Details & amtliche Fassung → | 1 |  |
| a | Wegleitung · Art. 4ArG Artikel 4: FamilienbetriebeStand 28.03.2018Details & amtliche Fassung → | 1 |  |
| a | Wegleitung · Art. 15ArG Artikel 15: PausenStand 14.10.2022Details & amtliche Fassung → | 1 |  |
| a | Wegleitung · Art. 15aArG Artikel 15a: Tägliche RuhezeitStand 03.02.2012Details & amtliche Fassung → | 1 |  |
| a | Wegleitung · Art. 25ArG Artikel 25: SchichtenwechselStand 03.02.2012Details & amtliche Fassung → | 1 |  |
| a | Wegleitung · Art. 30ArG Artikel 30: MindestalterStand 03.02.2012Details & amtliche Fassung → | 1 |  |
| a | Wegleitung · Art. 37ArG Artikel 37: AufstellungStand 03.02.2012Details & amtliche Fassung → | 1 |  |
| a | Wegleitung · Art. 38ArG Artikel 38: InhaltStand 03.02.2012Details & amtliche Fassung → | 1 |  |
| a | Wegleitung · Art. 39ArG Artikel 39: Kontrolle, WirkungenStand 03.02.2012Details & amtliche Fassung → | 1 |  |
| a | Wegleitung · Art. 40ArG Artikel 40: BundesratStand 03.02.2012Details & amtliche Fassung → | 1 |  |
| a | Wegleitung · Art. 41ArG Artikel 41: KantoneStand 03.02.2012Details & amtliche Fassung → | 1 |  |
| a | Wegleitung · Art. 42ArG Artikel 42: BundStand 26.04.2013Details & amtliche Fassung → | 1 |  |
| a | Wegleitung · Art. 43ArG Artikel 43: ArbeitskommissionStand 03.02.2012Details & amtliche Fassung → | 1 |  |
| a | Wegleitung · Art. 44ArG Artikel 44: SchweigepflichtStand 26.04.2013Details & amtliche Fassung → | 1 |  |
| a | Wegleitung · Art. 44aArG Artikel 44a: DatenbekanntgabeStand 03.02.2012Details & amtliche Fassung → | 1 |  |
| a | Wegleitung · Art. 45ArG Artikel 45: AuskunftspflichtStand 03.02.2012Details & amtliche Fassung → | 1 |  |
| a | Wegleitung · Art. 48ArG Artikel 48: MitwirkungsrechteStand 03.02.2012Details & amtliche Fassung → | 1 |  |
| a | Wegleitung · Art. 49ArG Artikel 49: BewilligungsgesucheStand 03.02.2012Details & amtliche Fassung → | 1 |  |
| a | Wegleitung · Art. 54ArG Artikel 54: AnzeigenStand 02.10.2024Details & amtliche Fassung → | 1 |  |
| a | Wegleitung · Art. 61ArG Artikel 61: StrafenStand 03.02.2012Details & amtliche Fassung → | 1 |  |
| a | Wegleitung · Art. 64ArG Artikel 64: MitwirkungsgesetzStand 03.02.2012Details & amtliche Fassung → | 1 |  |
| a | Wegleitung · Art. 1ArGV 1 Artikel 1: ArbeitnehmerStand 02.04.2007Details & amtliche Fassung → | 1 |  |
| a | Wegleitung · Art. 6ArGV 1 Artikel 6: GartenbaubetriebeStand 03.02.2008Details & amtliche Fassung → | 1 |  |
| a | Wegleitung · Art. 18ArGV 1 Artikel 18: PausenStand 03.02.2012Details & amtliche Fassung → | 1 |  |
| a | Wegleitung · Art. 19ArGV 1 Artikel 19: Tägliche RuhezeitStand 03.02.2012Details & amtliche Fassung → | 1 |  |
| a | Wegleitung · Art. 36ArGV 1 Artikel 36: BegriffStand 03.02.2012Details & amtliche Fassung → | 1 |  |
| a | Wegleitung · Art. 37ArGV 1 Artikel 37: RuhetageStand 03.02.2012Details & amtliche Fassung → | 1 |  |
| a | Wegleitung · Art. 38ArGV 1 Artikel 38: ArbeitszeitStand 03.02.2012Details & amtliche Fassung → | 1 |  |
| a | Wegleitung · Art. 41ArGV 1 Artikel 41: GesuchStand 01.04.2022Details & amtliche Fassung → | 1 |  |
| a | Wegleitung · Art. 74ArGV 1 Artikel 74: AltersausweisStand 20.07.2016Details & amtliche Fassung → | 1 |  |
| a | Wegleitung · Art. 75ArGV 1 Artikel 75: SECOStand 26.04.2013Details & amtliche Fassung → | 1 |  |
| a | Wegleitung · Art. 79ArGV 1 Artikel 79: AufgabenStand 26.04.2013Details & amtliche Fassung → | 1 |  |
| a | Wegleitung · Art. 82ArGV 1 Artikel 82: SchweigepflichtStand 03.02.2012Details & amtliche Fassung → | 1 |  |
| a | Wegleitung · Art. 89ArGV 1 Artikel 89: DatenschutzStand 18.11.2025Details & amtliche Fassung → | 1 |  |
| a | Wegleitung · Art. 90ArGV 1 Artikel 90: StrafbestimmungStand 03.02.2012Details & amtliche Fassung → | 1 |  |
| h2 | BSV | 1 |  |
| h2 | EHRA | 1 |  |
| a | Praxismitteilung · 1/26Praxismitteilung EHRA 1/26Stand 03.03.2026Details & amtliche Fassung → | 1 |  |
| a | Praxismitteilung · 1/25Praxismitteilung EHRA 1/25Stand 07.04.2025Details & amtliche Fassung → | 1 |  |
| h2 | FINMA | 1 |  |
| h2 | IGE | 1 |  |
| a | RichtlinieRichtlinien in Patentsachen (Teile 1–4)Stand 01.07.2023Details & amtliche Fassung → | 1 |  |
### Uebersicht-Rechner — 116 UI-Beschriftungen (0 Rechtsinhalt-Treffer ausgefiltert, 389 DOM-Elemente gesamt)  
Quelle (Routen-Ebene, nicht je Zeile): `src/pages/RechnerUebersicht.tsx`
| Element | Text | Wdh. | title |
|---|---|---|---|
| a | Zum Inhalt springen | 1 |  |
| button [aria-label] | Seitenleiste ein- und ausblenden | 1 |  |
| a [aria-label] | §LexMetrik | 1 |  |
| input [aria-label] | LexMetrik durchsuchen oder zur Norm springen | 1 |  |
| button [aria-label] | ◐ | 1 | Automatisch (System) |
| button [aria-label] | de▾ | 1 |  |
| nav [aria-label] | Reiter 1: Gesetze⧉✕Reiter 2: Rechtsprechung⧉✕Reiter 3: Materialien⧉✕Reiter 4: Rechner✕+4 offen | 1 |  |
| button | Reiter 1: Gesetze | 1 |  |
| button [aria-label] | ⧉ | ×3 | Daneben öffnen |
| button [aria-label] | ✕ | ×4 | Reiter «Gesetze» schliessen |
| button | Reiter 2: Rechtsprechung | 1 |  |
| button | Reiter 3: Materialien | 1 |  |
| button | Reiter 4: Rechner | 1 |  |
| button [aria-label] | + | 1 | Neuer Reiter (Alt+T) |
| h1 | Rechner | 1 |  |
| label | Filtern | 1 |  |
| input | Titel, Rechtsgebiet oder Norm … | 1 |  |
| button | erstellt, fachlich noch nicht geprüft | 1 |  |
| a | Zuständigkeit Zivilprozess | 1 |  |
| a | Verfahrens- & Rechtsmittelfristen | 1 |  |
| a | Beschwerde ans Bundesgericht (BGG) | 1 |  |
| a | Prozesskosten (Gerichts- & Parteikosten) | 1 |  |
| a | Streitwert (ZPO) | 1 |  |
| a | Schlichtungsgesuch (alle Kantone) | 1 |  |
| a | Klage (vereinfachtes Verfahren) | 1 |  |
| a | Klage (ordentliches Verfahren) | 1 |  |
| a | Fristerstreckungsgesuch | 1 |  |
| a | Rubrum (Entscheidkopf) | 1 |  |
| a | Zuständigkeit Vollstreckung (SchKG) | 1 |  |
| a | Betreibungs- & Konkursfristen | 1 |  |
| a | Betreibungskosten (GebV SchKG) | 1 |  |
| a | Nichtbekanntgabe einer Betreibung («Löschung» im Auszug) | 1 |  |
| a | Kündigung & Fristen im Arbeitsverhältnis | 1 |  |
| a | Lohnfortzahlung (kantonale Skala) | 1 |  |
| a | Arbeitsvertrag | 1 |  |
| a | Kündigung durch Arbeitgeber:in | 1 |  |
| a | Kündigung durch Arbeitnehmer:in | 1 |  |
| a | Kündigung & Fristen im Mietverhältnis | 1 |  |
| a | Kündigung durch Vermieter:in (Checkliste) | 1 |  |
| a | Kündigung durch Mieter:in | 1 |  |
| a | Mietvertrag (Wohnen · Geschäft · Untermiete) | 1 |  |
| a | Verjährung | 1 |  |
| a | Gewährleistung & Mängelrüge | 1 |  |
| a | Verjährungs- & Gewährleistungs-Board | 1 |  |
| a | Verzugszins | 1 |  |
| a | Forderungs- & Inkasso-Strecke | 1 |  |
| a | Auftrag (Dienstleistungsvertrag) | 1 |  |
| a | Werkvertrag | 1 |  |
| a | Geheimhaltungsvereinbarung (NDA) | 1 |  |
| a | Vertrag kündigen (Versicherung · Krankenkasse · Darlehen · Auftrag · Abo) | 1 |  |
| a | Mahnung & Inverzugsetzung | 1 |  |
| a | Verjährungsverzichtserklärung | 1 |  |
| a | Abtretungserklärung (Zession) | 1 |  |
| a | Erbrecht – Fristen | 1 |  |
| a | Pflichtteil & verfügbare Quote | 1 |  |
| a | Eigenhändiges Testament | 1 |  |
| a | Vorsorgeauftrag | 1 |  |
| a | Patientenverfügung | 1 |  |
| a | Konkubinatsvertrag | 1 |  |
| a | Eheschutzgesuch | 1 |  |
| a | Gemeinsames Scheidungsbegehren | 1 |  |
| a | Scheidungsklage (unbegründete Eingabe) | 1 |  |
| a | Kapitalerhöhung (AG / GmbH) | 1 |  |
| a | GmbH-Gründung (Checkliste + Dokumentmappe) | 1 |  |
| a | AG-Gründung (Checkliste + Dokumentmappe) | 1 |  |
| a | Zuständigkeit Strafverfahren | 1 |  |
| a | Notariats- & Grundbuchkosten | 1 |  |
| a | Fristenrechner (Tage · ZPO · SchKG) | 1 |  |
| a | Teuerungsrechner (LIK-Indexierung) | 1 |  |
| a | Amtlicher Zitierer (BGE/BGer) | 1 |  |
| a | Vollmacht (Anwalt · General · Spezial) | 1 |  |
| h2 | Zuständigkeiten | 1 |  |
| h3 | Rechtswege | 1 |  |
| a | Zuständigkeit ZivilprozessVerfahrensart · Schlichtung · Gerichtsstand · Rechtsmittel (ZPO)Entwurf→ | 1 |  |
| h2 | Fristen | 1 |  |
| h3 | Fristen berechnen | 1 |  |
| h3 | Prozessuale Fristen | 1 |  |
| h3 | Materielle Fristen | 1 |  |
| h2 | Gebühren & Beträge | 1 |  |
| h3 | Prozess- & Verfahrenskosten | 1 |  |
| a | Betreibungskosten (GebV SchKG)Betreibung & Konkurs (SchKG)Entwurf→ | 1 |  |
| a | Prozesskosten (Gerichts- & Parteikosten)Zivilprozess (ZPO) & BundesgerichtEntwurf→ | 1 |  |
| a | Streitwert (ZPO)Zivilprozess (ZPO) & BundesgerichtEntwurf→ | 1 |  |
| h3 | Materielle Beträge & Quoten | 1 |  |
| a | VerzugszinsVertrag & Forderung (OR)Entwurf→ | 1 |  |
| a | Lohnfortzahlung (kantonale Skala)ArbeitEntwurf→ | 1 |  |
| a | Pflichtteil & verfügbare QuoteErbrechtEntwurf→ | 1 |  |
| a | Notariats- & GrundbuchkostenImmobilien & BeurkundungEntwurf→ | 1 |  |
| h3 | Hilfsrechner | 1 |  |
| a | Forderungs- & Inkasso-StreckeVertrag & Forderung (OR)Entwurf→ | 1 |  |
| a | Teuerungsrechner (LIK-Indexierung)Übergreifende WerkzeugeEntwurf→ | 1 |  |
| h2 | Werkzeuge | 1 |  |
| input [aria-label] | Aufgabe | 1 |  |
| button | Start | 1 |  |
| button | Zurücksetzen | 1 |  |
| h2 | Massgebende Gesetze im Volltext | 1 |  |
| a | ZGB | 1 | Schweizerisches Zivilgesetzbuch |
| a | OR | 1 | Bundesgesetz betreffend die Ergänzung des ZGB (Obligationenrecht) |
| a | VMWG | 1 | Verordnung über die Miete und Pacht von Wohn- und Geschäftsräumen |
| a | StGB | 1 | Schweizerisches Strafgesetzbuch |
| a | ZPO | 1 | Schweizerische Zivilprozessordnung |
| a | StPO | 1 | Schweizerische Strafprozessordnung |
| a | BGG | 1 | Bundesgesetz über das Bundesgericht (Bundesgerichtsgesetz) |
| a | SchKG | 1 | Bundesgesetz über Schuldbetreibung und Konkurs |
| a | GebV SchKG | 1 | Gebührenverordnung zum SchKG |
| a | ArG | 1 | Bundesgesetz über die Arbeit in Industrie, Gewerbe und Handel (Arbeitsgesetz) |
| a | Zur Methodik → | 1 |  |
| nav [aria-label] | NavigationRechnerVorlagenEinstellungenMethodikÜber LexMetrikKontaktDatenschutzerklärung | 1 |  |
| a | Rechner | 1 |  |
| a | Vorlagen | 1 |  |
| a | Einstellungen | 1 |  |
| a | Methodik | 1 |  |
| a | Über LexMetrik | 1 |  |
| a | Kontakt | 1 |  |
| a | Datenschutzerklärung | 1 |  |
| a | fedlex.admin.ch | 1 |  |
### Uebersicht-Vorlagen — 71 UI-Beschriftungen (0 Rechtsinhalt-Treffer ausgefiltert, 258 DOM-Elemente gesamt)  
Quelle (Routen-Ebene, nicht je Zeile): `src/pages/VorlagenUebersicht.tsx`
| Element | Text | Wdh. | title |
|---|---|---|---|
| a | Zum Inhalt springen | 1 |  |
| button [aria-label] | Seitenleiste ein- und ausblenden | 1 |  |
| a [aria-label] | §LexMetrik | 1 |  |
| input [aria-label] | LexMetrik durchsuchen oder zur Norm springen | 1 |  |
| button [aria-label] | ◐ | 1 | Automatisch (System) |
| button [aria-label] | de▾ | 1 |  |
| button | Reiter 1: Gesetze | 1 |  |
| button [aria-label] | ⧉ | ×4 | Daneben öffnen |
| button [aria-label] | ✕ | ×5 | Reiter «Gesetze» schliessen |
| button | Reiter 2: Rechtsprechung | 1 |  |
| button | Reiter 3: Materialien | 1 |  |
| button | Reiter 4: Rechner | 1 |  |
| button | Reiter 5: Vorlagen | 1 |  |
| button [aria-label] | + | 1 | Neuer Reiter (Alt+T) |
| h1 | Vorlagen | 1 |  |
| button | erstellt, fachlich noch nicht geprüft | 1 |  |
| label | Filtern | 1 |  |
| h3 | Behördeneingaben | 1 |  |
| h4 | Klagen – allgemein | 1 |  |
| a | Schlichtungsgesuch (alle Kantone)Zivilprozess (ZPO) & BundesgerichtEntwurf→ | 1 |  |
| a | Klage (vereinfachtes Verfahren)Zivilprozess (ZPO) & BundesgerichtEntwurf→ | 1 |  |
| a | Klage (ordentliches Verfahren)Zivilprozess (ZPO) & BundesgerichtEntwurf→ | 1 |  |
| h4 | Klagen – besondere Konstellationen | 1 |  |
| a | EheschutzgesuchFamilienrechtEntwurf→ | 1 |  |
| a | Gemeinsames ScheidungsbegehrenFamilienrechtEntwurf→ | 1 |  |
| a | Scheidungsklage (unbegründete Eingabe)FamilienrechtEntwurf→ | 1 |  |
| h4 | Gesuche & sonstige Eingaben | 1 |  |
| a | Nichtbekanntgabe einer Betreibung («Löschung» im Auszug)Betreibung & Konkurs (SchKG)Entwurf→ | 1 |  |
| a | FristerstreckungsgesuchZivilprozess (ZPO) & BundesgerichtEntwurf→ | 1 |  |
| a | Rubrum (Entscheidkopf)Zivilprozess (ZPO) & BundesgerichtEntwurf→ | 1 |  |
| h3 | Verträge | 1 |  |
| h4 | Arbeit & Personal | 1 |  |
| a | ArbeitsvertragArbeitEntwurf→ | 1 |  |
| h4 | Miete & Pacht | 1 |  |
| a | Mietvertrag (Wohnen · Geschäft · Untermiete)MieteEntwurf→ | 1 |  |
| h4 | Auftrag & Werkvertrag | 1 |  |
| a | Auftrag (Dienstleistungsvertrag)Vertrag & Forderung (OR)Entwurf→ | 1 |  |
| a | WerkvertragVertrag & Forderung (OR)Entwurf→ | 1 |  |
| h4 | Familie & Partnerschaft | 1 |  |
| a | KonkubinatsvertragFamilienrechtEntwurf→ | 1 |  |
| h4 | Zusammenarbeit & Geheimhaltung | 1 |  |
| a | Geheimhaltungsvereinbarung (NDA)Vertrag & Forderung (OR)Entwurf→ | 1 |  |
| h3 | Einseitige Willenserklärungen | 1 |  |
| a | Mahnung & InverzugsetzungVertrag & Forderung (OR)Entwurf→ | 1 |  |
| a | VerjährungsverzichtserklärungVertrag & Forderung (OR)Entwurf→ | 1 |  |
| a | Abtretungserklärung (Zession)Vertrag & Forderung (OR)Entwurf→ | 1 |  |
| a | Vollmacht (Anwalt · General · Spezial)Übergreifende WerkzeugeEntwurf→ | 1 |  |
| h3 | Gesellschaftsrecht | 1 |  |
| a | Kapitalerhöhung (AG / GmbH)GesellschaftsrechtEntwurf→ | 1 |  |
| a | GmbH-Gründung (Checkliste + Dokumentmappe)GesellschaftsrechtEntwurf→ | 1 |  |
| a | AG-Gründung (Checkliste + Dokumentmappe)GesellschaftsrechtEntwurf→ | 1 |  |
| h3 | Vorsorge & Nachlass | 1 |  |
| a | Eigenhändiges TestamentErbrechtEntwurf→ | 1 |  |
| a | VorsorgeauftragVorsorge & ErwachsenenschutzEntwurf→ | 1 |  |
| a | PatientenverfügungVorsorge & ErwachsenenschutzEntwurf→ | 1 |  |
| h2 | Massgebende Gesetze im Volltext | 1 |  |
| a | ZGB | 1 | Schweizerisches Zivilgesetzbuch |
| a | OR | 1 | Bundesgesetz betreffend die Ergänzung des ZGB (Obligationenrecht) |
| a | HRegV | 1 | Handelsregisterverordnung |
| a | ZPO | 1 | Schweizerische Zivilprozessordnung |
| a | SchKG | 1 | Bundesgesetz über Schuldbetreibung und Konkurs |
| a | Zur Methodik → | 1 |  |
| nav [aria-label] | NavigationRechnerVorlagenEinstellungenMethodikÜber LexMetrikKontaktDatenschutzerklärung | 1 |  |
| a | Rechner | 1 |  |
| a | Vorlagen | 1 |  |
| a | Einstellungen | 1 |  |
| a | Methodik | 1 |  |
| a | Über LexMetrik | 1 |  |
| a | Kontakt | 1 |  |
| a | Datenschutzerklärung | 1 |  |
| a | fedlex.admin.ch | 1 |  |
### GesetzLeser-Bund — 70 von 954 UI-Beschriftungen (7441 Rechtsinhalt-Treffer ausgefiltert, 28791 DOM-Elemente gesamt) — GEKAPPT auf die ersten 70 von 954 (Route datengetrieben mit vielen strukturgleichen Wiederholungen; Rest nicht einzeln aufgeführt, methodischer Entscheid Finder)  
Quelle (Routen-Ebene, nicht je Zeile): `src/pages/GesetzLeser.tsx + src/pages/gesetz-leser/v3/*.tsx + parts/*.tsx`
| Element | Text | Wdh. | title |
|---|---|---|---|
| a | Zum Inhalt springen | 1 |  |
| button [aria-label] | Seitenleiste ein- und ausblenden | 1 |  |
| a [aria-label] | §LexMetrik | 1 |  |
| input [aria-label] | LexMetrik durchsuchen oder zur Norm springen | 1 |  |
| button [aria-label] | Verlauf – zuletzt geöffnet | 1 | Verlauf (nur auf diesem Gerät) |
| button [aria-label] | ◐ | 1 | Automatisch (System) |
| button [aria-label] | de▾ | 1 |  |
| button | Reiter 1: Gesetze | 1 |  |
| button [aria-label] | ⧉ | ×5 | Daneben öffnen |
| button [aria-label] | ✕ | ×6 | Reiter «Gesetze» schliessen |
| button | Reiter 2: Rechtsprechung | 1 |  |
| button | Reiter 3: Materialien | 1 |  |
| button | Reiter 4: Rechner | 1 |  |
| button | Reiter 5: Vorlagen | 1 |  |
| button | Reiter 6: OR | 1 |  |
| button [aria-label] | + | 1 | Neuer Reiter (Alt+T) |
| button [aria-label] | ⚖Rechtsprechung | 1 | Rechtsprechung und Kontext zu Art. 1 öffnen |
| button [aria-label] | ◧Ansicht▾ | 1 | Ansicht: Fussnoten · Fassung · Rechtsprechung · Grösse nur des Gesetzestexts |
| input [aria-label] | Im Erlass OR suchen oder zu einer Bestimmung springen | 1 |  |
| button | ‹Gliederung ausblenden | 1 | Gliederung ausblenden |
| a | Amtliche Fassung ↗ | ×1692 |  |
| a | ⬇ Amtliches PDF | 1 |  |
| h2 | Gliederung | 1 |  |
| button | ⌄alles auf | 1 | Alle Gliederungsstufen aufklappen |
| button | ↑Anfang | 1 | Zum Anfang des Erlasses |
| button [aria-label] | ▸ | ×18 |  |
| a [aria-label] | Schlussbestimmungen der Änderung vom 23. März 1962 | 1 | Schlussbestimmungen der Änderung vom 23. März 1962 |
| a [aria-label] | Übergangsbestimmungen der Änderung vom 16. Dezember 2005 | 1 | Übergangsbestimmungen der Änderung vom 16. Dezember 2005 |
| a [aria-label] | Übergangsbestimmungen der Änderung vom 23. Dezember 2011 | 1 | Übergangsbestimmungen der Änderung vom 23. Dezember 2011 |
| a [aria-label] | Übergangsbestimmungen der Änderung vom 12. Dezember 2014 | 1 | Übergangsbestimmungen der Änderung vom 12. Dezember 2014 |
| a [aria-label] | Übergangsbestimmungen der Änderung vom 25. September 2015 | 1 | Übergangsbestimmungen der Änderung vom 25. September 2015 |
| a [aria-label] | Übergangsbestimmungen zur Änderung vom 17. März 2017 | 1 | Übergangsbestimmungen zur Änderung vom 17. März 2017 |
| a [aria-label] | Übergangsbestimmungen zur Änderung vom 21. Juni 2019 | 1 | Übergangsbestimmungen zur Änderung vom 21. Juni 2019 |
| a [aria-label] | Übergangsbestimmungen zur Änderung vom 19. Juni 2020 | 1 | Übergangsbestimmungen zur Änderung vom 19. Juni 2020 |
| a [aria-label] | Schlussbestimmungen zum VIII. Titel und zum VIIIbis. Titel | 1 | Schlussbestimmungen zum VIII. Titel und zum VIIIbis. Titel |
| a [aria-label] | Schluss- und Übergangsbestimmungen zum X. Titel | 1 | Schluss- und Übergangsbestimmungen zum X. Titel |
| a [aria-label] | Schluss- und Übergangsbestimmungen zu den Titeln XXIV–XXXIII | 1 | Schluss- und Übergangsbestimmungen zu den Titeln XXIV–XXXIII |
| a [aria-label] | Schlussbestimmungen zum XXVI. Titel | 1 | Schlussbestimmungen zum XXVI. Titel |
| h1 | Bundesgesetz betreffend die Ergänzung des ZGB (OR) | 1 |  |
| button [aria-label] | ⧉ Daneben öffnen | 1 | Diesen Erlass zusätzlich im zweiten Fenster daneben öffnen |
| a [aria-label] | ⬇ Amtliches PDF (Fassung vom 01.01.2026) | 1 | Amtliches PDF der geltenden Fassung — massgeblich ist die amtliche Fassung |
| a | 1909 III 725 | 1 | Amtliche Fedlex-Quelle — öffnet in neuem Tab |
| a | 1911 I 845 | 1 | Amtliche Fedlex-Quelle — öffnet in neuem Tab |
| button | ▾Allgemeine Bestimmungen | 1 |  |
| button | Erster Titel | 1 |  |
| button | ▾Die Entstehung der Obligationen | 1 |  |
| button | ▾Die Entstehung durch Vertrag | 1 |  |
| button | ▾A. Abschluss des Vertrages | 1 |  |
| button [aria-label] | ▾ | ×1530 |  |
| button [aria-label] | Zitat | ×1530 |  |
| button [aria-label] | Link | 1 |  |
| button | Gilt seit 01.07.1991▸ | 1 | Fassungs-Zeitleiste anzeigen |
| button | ▾B. Form der Verträge | 1 |  |
| button | Fassungshistorie▸ | 1 | Fassungs-Zeitleiste anzeigen |
| button | Gilt seit 01.01.2017▸ | 1 | Fassungs-Zeitleiste anzeigen |
| button | 2bis | ×9 | Art. 14 Abs. 2bis OR — kopieren |
| a | SR 943.03 | 1 | Amtliche Fedlex-Quelle — öffnet in neuem Tab |
| button | ▾D. Auslegung der Verträge, Simulation | 1 |  |
| button | ▾E. Inhalt des Vertrages | 1 |  |
| button | ▾F. Mängel des Vertragsabschlusses | 1 |  |
| button | 1. | ×169 | Art. 24 Abs. 1 Ziff. 1 OR — kopieren |
| button | 2. | ×169 | Art. 24 Abs. 1 Ziff. 2 OR — kopieren |
| button | 3. | ×132 | Art. 24 Abs. 1 Ziff. 3 OR — kopieren |
| button | 4. | ×86 | Art. 24 Abs. 1 Ziff. 4 OR — kopieren |
| button | ▾G. Stellvertretung | 1 |  |
| button | Gilt seit 01.01.1972▸ | 1 | Fassungs-Zeitleiste anzeigen |
| button | Gilt seit 01.01.2013▸ | 1 | Fassungs-Zeitleiste anzeigen |
| button | ▾H. Widerruf bei Haustürgeschäften und ähnlichen Verträgen | 1 |  |
| button | Gilt seit 01.01.2022▸ | 1 | Fassungs-Zeitleiste anzeigen |
| button | a. | ×59 | Art. 40a Abs. 1 lit. a OR — kopieren |
### GesetzLeser-Kanton-BS — 70 von 96 UI-Beschriftungen (134 Rechtsinhalt-Treffer ausgefiltert, 840 DOM-Elemente gesamt) — GEKAPPT auf die ersten 70 von 96 (Route datengetrieben mit vielen strukturgleichen Wiederholungen; Rest nicht einzeln aufgeführt, methodischer Entscheid Finder)  
Quelle (Routen-Ebene, nicht je Zeile): `src/pages/GesetzLeser.tsx + src/pages/gesetz-leser/v3/*.tsx (gleicher Leser, Kanton-Daten)`
| Element | Text | Wdh. | title |
|---|---|---|---|
| a | Zum Inhalt springen | 1 |  |
| button [aria-label] | Seitenleiste ein- und ausblenden | 1 |  |
| a [aria-label] | §LexMetrik | 1 |  |
| input [aria-label] | LexMetrik durchsuchen oder zur Norm springen | 1 |  |
| button [aria-label] | Verlauf – zuletzt geöffnet | 1 | Verlauf (nur auf diesem Gerät) |
| button [aria-label] | ◐ | 1 | Automatisch (System) |
| button [aria-label] | de▾ | 1 |  |
| button | Reiter 1: Gesetze | 1 |  |
| button [aria-label] | ⧉ | ×6 | Daneben öffnen |
| button [aria-label] | ✕ | ×7 | Reiter «Gesetze» schliessen |
| button | Reiter 2: Rechtsprechung | 1 |  |
| button | Reiter 3: Materialien | 1 |  |
| button | Reiter 4: Rechner | 1 |  |
| button | Reiter 5: Vorlagen | 1 |  |
| button | Reiter 6: OR | 1 |  |
| button | Reiter 7: WJV | 1 |  |
| button [aria-label] | + | 1 | Neuer Reiter (Alt+T) |
| button [aria-label] | ⚖Rechtsprechung | 1 | Rechtsprechung und Kontext zu § 1 öffnen |
| button [aria-label] | ◧Ansicht▾ | 1 | Ansicht: Fussnoten · Rechtsprechung · Grösse nur des Gesetzestexts |
| input [aria-label] | Im Erlass WJV suchen oder zu einer Bestimmung springen | 1 |  |
| button | ‹Gliederung ausblenden | 1 | Gliederung ausblenden |
| a | Amtliche Fassung ↗ | 1 |  |
| a | ⬇ Amtliches PDF | 1 |  |
| h2 | Gliederung | 1 |  |
| button | ⌄alles auf | 1 | Alle Gliederungsstufen aufklappen |
| button | ↑Anfang | 1 | Zum Anfang des Erlasses |
| button [aria-label] | ▸ | ×7 |  |
| h1 | Wildtier- und Jagdverordnung (WJV) | 1 |  |
| button [aria-label] | ⧉ Daneben öffnen | 1 | Diesen Erlass zusätzlich im zweiten Fenster daneben öffnen |
| a [aria-label] | ⬇ Amtliches PDF (Fassung vom 01.04.2024) | 1 | Amtliches PDF der geltenden Fassung — massgeblich ist die amtliche Fassung |
| a | 912.200 | 1 | Intern öffnen |
| button [aria-label] | ▾ | ×40 |  |
| a | § 1 | 1 |  |
| button [aria-label] | Zitat | ×40 |  |
| button [aria-label] | Link | 1 |  |
| a | § 2 | 1 |  |
| button | a. | ×18 | § 2 Abs. 2 lit. a WJV — kopieren |
| button | b. | ×18 | § 2 Abs. 2 lit. b WJV — kopieren |
| button | c. | ×13 | § 2 Abs. 2 lit. c WJV — kopieren |
| button | d. | ×11 | § 2 Abs. 2 lit. d WJV — kopieren |
| button | e. | ×8 | § 2 Abs. 2 lit. e WJV — kopieren |
| button | f. | ×6 | § 2 Abs. 2 lit. f WJV — kopieren |
| a | § 3 | 1 |  |
| a | § 4 | 1 |  |
| button | g. | ×4 | § 4 Abs. 1 lit. g WJV — kopieren |
| button | h. | ×3 | § 4 Abs. 1 lit. h WJV — kopieren |
| button | i. | ×2 | § 4 Abs. 1 lit. i WJV — kopieren |
| a | § 5 | 1 |  |
| a | § 6 | 1 |  |
| a | § 7 | 1 |  |
| a | § 8 | 1 |  |
| a | § 9 | 1 |  |
| a | § 10 | 1 |  |
| a | § 11 | 1 |  |
| a | § 12 | 1 |  |
| a | § 13 | 1 |  |
| a | § 14 | 1 |  |
| a | § 15 | 1 |  |
| a | § 16 | 1 |  |
| a | § 17 | 1 |  |
| a | § 18 | 1 |  |
| a | § 19 | 1 |  |
| a | § 20 | 1 |  |
| a | § 21 | 1 |  |
| a | § 22 | 1 |  |
| a | § 23 | 1 |  |
| a | § 24 | 1 |  |
| a | § 25 | 1 |  |
| a | § 26 | 1 |  |
| a | § 27 | 1 |  |
### EntscheidLeser — 32 UI-Beschriftungen (0 Rechtsinhalt-Treffer ausgefiltert, 104 DOM-Elemente gesamt)  
Quelle (Routen-Ebene, nicht je Zeile): `src/pages/EntscheidLeser.tsx + src/components/rechtsprechung/*.tsx`
| Element | Text | Wdh. | title |
|---|---|---|---|
| a | Zum Inhalt springen | 1 |  |
| button [aria-label] | Seitenleiste ein- und ausblenden | 1 |  |
| a [aria-label] | §LexMetrik | 1 |  |
| input [aria-label] | LexMetrik durchsuchen oder zur Norm springen | 1 |  |
| button [aria-label] | Verlauf – zuletzt geöffnet | 1 | Verlauf (nur auf diesem Gerät) |
| button [aria-label] | ◐ | 1 | Automatisch (System) |
| button [aria-label] | de▾ | 1 |  |
| button | Reiter 1: Gesetze | 1 |  |
| button [aria-label] | ⧉ | ×7 | Daneben öffnen |
| button [aria-label] | ✕ | ×9 | Reiter «Gesetze» schliessen |
| button | Reiter 2: Rechtsprechung | 1 |  |
| button | Reiter 3: Materialien | 1 |  |
| button | Reiter 4: Rechner | 1 |  |
| button | Reiter 5: Vorlagen | 1 |  |
| button | Reiter 6: OR | 1 |  |
| button | Reiter 7: WJV | 1 |  |
| button | Reiter 8: Entscheid öffnen | 1 |  |
| button [aria-label] | + | 1 | Neuer Reiter (Alt+T) |
| nav [aria-label] | ‹Rechtsprechung›Entscheid öffnen | 1 |  |
| a | Rechtsprechung | 1 |  |
| h1 | Entscheid nicht gefunden | 1 |  |
| nav [aria-label] | ← Zur Rechtsprechung | 1 |  |
| a | ← Zur Rechtsprechung | 1 |  |
| nav [aria-label] | NavigationRechnerVorlagenEinstellungenMethodikÜber LexMetrikKontaktDatenschutzerklärung | 1 |  |
| a | Rechner | 1 |  |
| a | Vorlagen | 1 |  |
| a | Einstellungen | 1 |  |
| a | Methodik | 1 |  |
| a | Über LexMetrik | 1 |  |
| a | Kontakt | 1 |  |
| a | Datenschutzerklärung | 1 |  |
| a | fedlex.admin.ch | 1 |  |
### MaterialLeser — 54 UI-Beschriftungen (8 Rechtsinhalt-Treffer ausgefiltert, 220 DOM-Elemente gesamt)  
Quelle (Routen-Ebene, nicht je Zeile): `src/pages/MaterialLeser.tsx`
| Element | Text | Wdh. | title |
|---|---|---|---|
| a | Zum Inhalt springen | 1 |  |
| button [aria-label] | Seitenleiste ein- und ausblenden | 1 |  |
| a [aria-label] | §LexMetrik | 1 |  |
| input [aria-label] | LexMetrik durchsuchen oder zur Norm springen | 1 |  |
| button [aria-label] | Verlauf – zuletzt geöffnet | 1 | Verlauf (nur auf diesem Gerät) |
| button [aria-label] | ◐ | 1 | Automatisch (System) |
| button [aria-label] | de▾ | 1 |  |
| button | Reiter 1: Gesetze | 1 |  |
| button [aria-label] | ⧉ | ×30 | Daneben öffnen |
| button [aria-label] | ✕ | ×9 | Reiter «Gesetze» schliessen |
| button | Reiter 2: Rechtsprechung | 1 |  |
| button | Reiter 3: Materialien | 1 |  |
| button | Reiter 4: Rechner | 1 |  |
| button | Reiter 5: Vorlagen | 1 |  |
| button | Reiter 6: OR | 1 |  |
| button | Reiter 7: WJV | 1 |  |
| button | Reiter 8: Praxismitteilung EHRA 1/25 | 1 |  |
| button [aria-label] | + | 1 | Neuer Reiter (Alt+T) |
| button [aria-label] | +1 | 1 | Alle offenen Reiter |
| nav [aria-label] | ‹Materialien›Praxismitteilung EHRA 1/25 | 1 |  |
| a | Materialien | 1 |  |
| h1 | Praxismitteilung EHRA 1/25 | 1 |  |
| a | Amtliche Fassung ↗ | 1 |  |
| h2 | Kontext | 1 |  |
| h3 | Wendet an · Erlasse2 | 1 |  |
| a | HRegV | 1 | Handelsregisterverordnung |
| a | OR | 1 | Bundesgesetz betreffend die Ergänzung des ZGB (Obligationenrecht) |
| h3 | Wird zitiert von · Bundesgerichtsentscheide18 | 1 |  |
| a | Alle 18 erfassten Entscheide ansehen → | 1 |  |
| button | Zeichenerklärung | 1 |  |
| h3 | Passende Werkzeuge13 | 1 |  |
| a | ▤GmbH-Gründung (Checkliste + Dokumentmappe) | 1 |  |
| a | ▤AG-Gründung (Checkliste + Dokumentmappe) | 1 |  |
| a | ⊞Kündigung & Fristen im Arbeitsverhältnis | 1 |  |
| a | ⊞Lohnfortzahlung (kantonale Skala) | 1 |  |
| a | ⊞Verjährung | 1 |  |
| a | ⊞Verzugszins | 1 |  |
| a | ⊞Gewährleistung & Mängelrüge | 1 |  |
| a | ⊞Kündigung & Fristen im Mietverhältnis | 1 |  |
| a | ▤Arbeitsvertrag | 1 |  |
| a | ▤Mietvertrag (Wohnen · Geschäft · Untermiete) | 1 |  |
| a | ▤Auftrag (Dienstleistungsvertrag) | 1 |  |
| a | ▤Werkvertrag | 1 |  |
| a | ▤Mahnung & Inverzugsetzung | 1 |  |
| a | ← Alle Materialien | 1 |  |
| nav [aria-label] | NavigationRechnerVorlagenEinstellungenMethodikÜber LexMetrikKontaktDatenschutzerklärung | 1 |  |
| a | Rechner | 1 |  |
| a | Vorlagen | 1 |  |
| a | Einstellungen | 1 |  |
| a | Methodik | 1 |  |
| a | Über LexMetrik | 1 |  |
| a | Kontakt | 1 |  |
| a | Datenschutzerklärung | 1 |  |
| a | fedlex.admin.ch | 1 |  |
### Rechner-Verjaehrung — 54 UI-Beschriftungen (13 Rechtsinhalt-Treffer ausgefiltert, 175 DOM-Elemente gesamt)  
Quelle (Routen-Ebene, nicht je Zeile): `src/pages/RechnerVerjaehrung.tsx`
| Element | Text | Wdh. | title |
|---|---|---|---|
| a | Zum Inhalt springen | 1 |  |
| button [aria-label] | Seitenleiste ein- und ausblenden | 1 |  |
| a [aria-label] | §LexMetrik | 1 |  |
| input [aria-label] | LexMetrik durchsuchen oder zur Norm springen | 1 |  |
| button [aria-label] | Verlauf – zuletzt geöffnet | 1 | Verlauf (nur auf diesem Gerät) |
| button [aria-label] | ◐ | 1 | Automatisch (System) |
| button [aria-label] | de▾ | 1 |  |
| button | Reiter 1: Gesetze | 1 |  |
| button [aria-label] | ⧉ | ×7 | Daneben öffnen |
| button [aria-label] | ✕ | ×9 | Reiter «Gesetze» schliessen |
| button | Reiter 2: Rechtsprechung | 1 |  |
| button | Reiter 3: Materialien | 1 |  |
| button | Reiter 4: Rechner | 1 |  |
| button | Reiter 5: Vorlagen | 1 |  |
| button | Reiter 6: OR | 1 |  |
| button | Reiter 7: WJV | 1 |  |
| button | Reiter 8: Verjährung | 1 |  |
| button [aria-label] | + | 1 | Neuer Reiter (Alt+T) |
| button [aria-label] | +2 | 1 | Alle offenen Reiter |
| nav [aria-label] | ‹Rechner›Verjährung | 1 |  |
| a | Rechner | 1 |  |
| h1 | Verjährung | 1 |  |
| a | Zum Fristenrechner → | 1 |  |
| button | Offene Rechnung (10 J.) | 1 |  |
| button | Mietzins (5 J.) | 1 |  |
| button | Delikt (3/10 J.) | 1 |  |
| label | Anspruchstyp / Rechtsgrund | 1 |  |
| label | Fälligkeit der Forderung | 1 |  |
| input | TT.MM.JJJJ | 1 |  |
| button [aria-label] | Kalender öffnen | 1 |  |
| label | Stichtag (Prüfdatum) | 1 |  |
| label | Kanton (Feiertage am Erfüllungsort) | 1 |  |
| button | + Unterbrechung | 1 |  |
| button | + Stillstandsperiode | 1 |  |
| label | Schriftlicher Verzicht auf die Verjährungseinrede (Art. 141 OR) | 1 |  |
| a | ↓ Ergebnis | 1 |  |
| h2 | Verjährung (Art. 60, 67, 127 ff. OR) | 1 |  |
| button | Ergebnis kopieren | 1 |  |
| button | Rechenweg (4 Schritte)▸ | 1 |  |
| button | Annahmen (1)▸ | 1 |  |
| button | Absatz kopieren | 1 |  |
| label | Aktenzeichen / Referenz · optional | 1 |  |
| button | PDF-Rechenbericht | 1 |  |
| button | In Kalender (.ics) | 1 |  |
| button | Link teilen | 1 |  |
| a | Verjährungsverzichtserklärung (Art. 141 OR) | 1 |  |
| nav [aria-label] | NavigationRechnerVorlagenEinstellungenMethodikÜber LexMetrikKontaktDatenschutzerklärung | 1 |  |
| a | Vorlagen | 1 |  |
| a | Einstellungen | 1 |  |
| a | Methodik | 1 |  |
| a | Über LexMetrik | 1 |  |
| a | Kontakt | 1 |  |
| a | Datenschutzerklärung | 1 |  |
| a | fedlex.admin.ch | 1 |  |
### Rechner-Kuendigung — 68 UI-Beschriftungen (10 Rechtsinhalt-Treffer ausgefiltert, 271 DOM-Elemente gesamt)  
Quelle (Routen-Ebene, nicht je Zeile): `src/pages/RechnerKuendigung.tsx`
| Element | Text | Wdh. | title |
|---|---|---|---|
| a | Zum Inhalt springen | 1 |  |
| button [aria-label] | Seitenleiste ein- und ausblenden | 1 |  |
| a [aria-label] | §LexMetrik | 1 |  |
| input [aria-label] | LexMetrik durchsuchen oder zur Norm springen | 1 |  |
| button [aria-label] | Verlauf – zuletzt geöffnet | 1 | Verlauf (nur auf diesem Gerät) |
| button [aria-label] | ◐ | 1 | Automatisch (System) |
| button [aria-label] | de▾ | 1 |  |
| button | Reiter 1: Gesetze | 1 |  |
| button [aria-label] | ⧉ | ×7 | Daneben öffnen |
| button [aria-label] | ✕ | ×9 | Reiter «Gesetze» schliessen |
| button | Reiter 2: Rechtsprechung | 1 |  |
| button | Reiter 3: Materialien | 1 |  |
| button | Reiter 4: Rechner | 1 |  |
| button | Reiter 5: Vorlagen | 1 |  |
| button | Reiter 6: OR | 1 |  |
| button | Reiter 7: WJV | 1 |  |
| button | Reiter 8: Kündigung & Fristen im Arbeitsverhältnis | 1 |  |
| button [aria-label] | + | 1 | Neuer Reiter (Alt+T) |
| button [aria-label] | +3 | 1 | Alle offenen Reiter |
| nav [aria-label] | ‹Rechner›Kündigung & Fristen im Arbeitsverhältnis | 1 |  |
| a | Rechner | 1 |  |
| h1 | Kündigung & Fristen im Arbeitsverhältnis | 1 |  |
| a | Zum Fristenrechner → | 1 |  |
| button | A – LohnfortzahlungArt. 324a OR | 1 |  |
| button | B+C – KündigungArt. 335c / 336c OR | 1 |  |
| button | KombiniertA + B + C | 1 |  |
| button | Krankheit 3. DJ (BS) | 1 |  |
| button | Teil-AUF 50 % | 1 |  |
| button | DJ-übergreifend | 1 |  |
| button | KTG vorhanden | 1 |  |
| label | Vertragsbeginn | 1 |  |
| input | TT.MM.JJJJ | 1 |  |
| button [aria-label] | Kalender öffnen | 1 |  |
| label | Beginn der Arbeitsverhinderung | 1 |  |
| label | Verhinderungsgrund | 1 |  |
| label | Kanton | 1 |  |
| label | Arbeitsunfähigkeit (%) | 1 |  |
| label | Monatslohn brutto (CHF) · optional | 1 |  |
| input | Leer = kein Betrag | 1 |  |
| label | Beschäftigungsgrad / Pensum (%) | 1 |  |
| label | KTG-Versicherung gleichwertig? | 1 |  |
| label | Nein (Skala gilt) | 1 |  |
| label | Ja (KTG-Regime, Art. 324b OR) | 1 |  |
| button | Erweiterte Eingaben (Anspruch, DJ-übergreifend, Lohnbasis)▼ | 1 |  |
| a | ↓ Ergebnis | 1 |  |
| h2 | Lohnfortzahlung (Art. 324a OR) | 1 |  |
| button | Ergebnis kopieren | 1 |  |
| button | Hinweise / Vorbehalte (1)▸ | 1 |  |
| button | Rechenweg (5 Schritte)▸ | 1 |  |
| button | Annahmen (7)▸ | 1 |  |
| button | Absatz kopieren | 1 |  |
| label | Aktenzeichen / Referenz · optional | 1 |  |
| button | PDF-Rechenbericht | 1 |  |
| button | Link teilen | 1 |  |
| h2 | Ereignis-Fristen – ein Anlass, mehrere Fristen | 1 |  |
| label | Ereignis | 1 |  |
| label | Ende der Kündigungsfrist | 1 |  |
| input [aria-label] | Ereignisdatum | 1 |  |
| a | durch Arbeitnehmer:in | 1 |  |
| a | durch Arbeitgeber:in (mit Sperrfristen-Gate) | 1 |  |
| nav [aria-label] | NavigationRechnerVorlagenEinstellungenMethodikÜber LexMetrikKontaktDatenschutzerklärung | 1 |  |
| a | Vorlagen | 1 |  |
| a | Einstellungen | 1 |  |
| a | Methodik | 1 |  |
| a | Über LexMetrik | 1 |  |
| a | Kontakt | 1 |  |
| a | Datenschutzerklärung | 1 |  |
| a | fedlex.admin.ch | 1 |  |
### Vorlage-Mietvertrag — 59 UI-Beschriftungen (17 Rechtsinhalt-Treffer ausgefiltert, 275 DOM-Elemente gesamt)  
Quelle (Routen-Ebene, nicht je Zeile): `src/pages/VorlageMietvertrag.tsx`
| Element | Text | Wdh. | title |
|---|---|---|---|
| a | Zum Inhalt springen | 1 |  |
| button [aria-label] | Seitenleiste ein- und ausblenden | 1 |  |
| a [aria-label] | §LexMetrik | 1 |  |
| input [aria-label] | LexMetrik durchsuchen oder zur Norm springen | 1 |  |
| button [aria-label] | Verlauf – zuletzt geöffnet | 1 | Verlauf (nur auf diesem Gerät) |
| button [aria-label] | ◐ | 1 | Automatisch (System) |
| button [aria-label] | de▾ | 1 |  |
| button | Reiter 1: Gesetze | 1 |  |
| button [aria-label] | ⧉ | ×7 | Daneben öffnen |
| button [aria-label] | ✕ | ×9 | Reiter «Gesetze» schliessen |
| button | Reiter 2: Rechtsprechung | 1 |  |
| button | Reiter 3: Materialien | 1 |  |
| button | Reiter 4: Rechner | 1 |  |
| button | Reiter 5: Vorlagen | 1 |  |
| button | Reiter 6: OR | 1 |  |
| button | Reiter 7: WJV | 1 |  |
| button | Reiter 8: Mietvertrag | 1 |  |
| button [aria-label] | + | 1 | Neuer Reiter (Alt+T) |
| button [aria-label] | +4 | 1 | Alle offenen Reiter |
| nav [aria-label] | ‹Vorlagen›Mietvertrag (Wohnen · Geschäft · Untermiete) | 1 |  |
| a | Vorlagen | 1 |  |
| a | ←Zurück zum Katalog | 1 |  |
| h1 | Mietvertrag | 1 |  |
| a | Kündigung & Fristen im Mietverhältnis → | 1 |  |
| button | ↺ Eingaben zurücksetzen | 1 |  |
| button | Einfachnur die Kernklauseln | 1 |  |
| button | Standardvollständige Grundausstattung | 1 |  |
| button | Expertemit allen Zusatzmodulen | 1 |  |
| button | 1Mietobjekt | 1 |  |
| button | 2Parteien | 1 | Noch nicht erreichbar — vorherige Schritte zuerst ausfüllen |
| button | 3Dauer & Kündigung | 1 | Noch nicht erreichbar — vorherige Schritte zuerst ausfüllen |
| button | 4Mietzins & Nebenkosten | 1 | Noch nicht erreichbar — vorherige Schritte zuerst ausfüllen |
| button | 5Kaution & Klauseln | 1 | Noch nicht erreichbar — vorherige Schritte zuerst ausfüllen |
| button | 6Prüfen & Unterzeichnen | 1 | Noch nicht erreichbar — vorherige Schritte zuerst ausfüllen |
| h2 | Mietobjekt | 1 |  |
| button | Mietvertrag (Hauptmiete)Vermieter:in vermietet die eigene Sache | 1 |  |
| button | UntermietvertragHauptmieter:in vermietet ganz oder teilweise weiter (Art. 262 OR) | 1 |  |
| button | WohnraumWohnung, Einfamilienhaus – voller Mieterschutz | 1 |  |
| button | GeschäftsraumBüro, Laden, Gewerbe – freiere Gestaltung | 1 |  |
| label | Mietobjekt (Beschrieb) | 1 |  |
| label | Adresse des Mietobjekts | 1 |  |
| input | Strasse Nr., PLZ Ort | 1 |  |
| label | Mitvermietete Nebenräume · optional | 1 |  |
| label | Kanton · optional | 1 |  |
| label | Das Objekt dient als Familienwohnung (besonderer Kündigungsschutz, Art. 266m/266n OR) | 1 |  |
| button | ← Zurück | 1 |  |
| button | Weiter → | 1 |  |
| button | Nüchtern | 1 | Klassisch-gerichtstauglich (traditionelles Rubrum mit Gedankenstrichen) |
| button | Modern | 1 | Variante A «Dokument-Handwerk» (ruhige Versal-Labels) |
| button | PDF | 1 | Nebenkosten sind nur geschuldet, wenn sie besonders vereinbart und die Positionen einzeln aufgeführt sind (Art. 257a Abs. 2 OR) – mindestens eine Position wählen oder «im Mietzins inbegriffen» wählen. |
| button | Word (DOCX) | 1 | Nebenkosten sind nur geschuldet, wenn sie besonders vereinbart und die Positionen einzeln aufgeführt sind (Art. 257a Abs. 2 OR) – mindestens eine Position wählen oder «im Mietzins inbegriffen» wählen. |
| nav [aria-label] | NavigationRechnerVorlagenEinstellungenMethodikÜber LexMetrikKontaktDatenschutzerklärung | 1 |  |
| a | Rechner | 1 |  |
| a | Einstellungen | 1 |  |
| a | Methodik | 1 |  |
| a | Über LexMetrik | 1 |  |
| a | Kontakt | 1 |  |
| a | Datenschutzerklärung | 1 |  |
| a | fedlex.admin.ch | 1 |  |
### Suche-leer — 31 UI-Beschriftungen (0 Rechtsinhalt-Treffer ausgefiltert, 102 DOM-Elemente gesamt)  
Quelle (Routen-Ebene, nicht je Zeile): `src/pages/Suche.tsx`
| Element | Text | Wdh. | title |
|---|---|---|---|
| a | Zum Inhalt springen | 1 |  |
| button [aria-label] | Seitenleiste ein- und ausblenden | 1 |  |
| a [aria-label] | §LexMetrik | 1 |  |
| input [aria-label] | LexMetrik durchsuchen oder zur Norm springen | 1 |  |
| button [aria-label] | Verlauf – zuletzt geöffnet | 1 | Verlauf (nur auf diesem Gerät) |
| button [aria-label] | ◐ | 1 | Automatisch (System) |
| button [aria-label] | de▾ | 1 |  |
| button | Reiter 1: Gesetze | 1 |  |
| button [aria-label] | ⧉ | ×8 | Daneben öffnen |
| button [aria-label] | ✕ | ×8 | Reiter «Gesetze» schliessen |
| button | Reiter 2: Rechtsprechung | 1 |  |
| button | Reiter 3: Materialien | 1 |  |
| button | Reiter 4: Rechner | 1 |  |
| button | Reiter 5: Vorlagen | 1 |  |
| button | Reiter 6: OR | 1 |  |
| button | Reiter 7: WJV | 1 |  |
| button | Reiter 8: Entscheid öffnen | 1 |  |
| button [aria-label] | + | 1 | Neuer Reiter (Alt+T) |
| button [aria-label] | +4 | 1 | Alle offenen Reiter |
| h1 | Suche | 1 |  |
| input [aria-label] | LexMetrik durchsuchen | 1 |  |
| a | Was ist durchsuchbar? → | 1 |  |
| nav [aria-label] | NavigationRechnerVorlagenEinstellungenMethodikÜber LexMetrikKontaktDatenschutzerklärung | 1 |  |
| a | Rechner | 1 |  |
| a | Vorlagen | 1 |  |
| a | Einstellungen | 1 |  |
| a | Methodik | 1 |  |
| a | Über LexMetrik | 1 |  |
| a | Kontakt | 1 |  |
| a | Datenschutzerklärung | 1 |  |
| a | fedlex.admin.ch | 1 |  |
### Suche-Treffer — 41 UI-Beschriftungen (93 Rechtsinhalt-Treffer ausgefiltert, 420 DOM-Elemente gesamt)  
Quelle (Routen-Ebene, nicht je Zeile): `src/pages/Suche.tsx`
| Element | Text | Wdh. | title |
|---|---|---|---|
| a | Zum Inhalt springen | 1 |  |
| button [aria-label] | Seitenleiste ein- und ausblenden | 1 |  |
| a [aria-label] | §LexMetrik | 1 |  |
| input [aria-label] | LexMetrik durchsuchen oder zur Norm springen | 1 |  |
| button [aria-label] | Verlauf – zuletzt geöffnet | 1 | Verlauf (nur auf diesem Gerät) |
| button [aria-label] | ◐ | 1 | Automatisch (System) |
| button [aria-label] | de▾ | 1 |  |
| button | Reiter 1: Gesetze | 1 |  |
| button [aria-label] | ⧉ | ×8 | Daneben öffnen |
| button [aria-label] | ✕ | ×9 | Reiter «Gesetze» schliessen |
| button | Reiter 2: Rechtsprechung | 1 |  |
| button | Reiter 3: Materialien | 1 |  |
| button | Reiter 4: Rechner | 1 |  |
| button | Reiter 5: Vorlagen | 1 |  |
| button | Reiter 6: OR | 1 |  |
| button | Reiter 7: WJV | 1 |  |
| button | Reiter 8: Entscheid öffnen | 1 |  |
| button [aria-label] | + | 1 | Neuer Reiter (Alt+T) |
| button [aria-label] | +4 | 1 | Alle offenen Reiter |
| h1 | Suche | 1 |  |
| input [aria-label] | LexMetrik durchsuchen | 1 |  |
| button [aria-label] | Alle 102 | 1 |  |
| button [aria-label] | Gesetze 1 | 1 |  |
| button [aria-label] | Gesetzestext 97 | 1 |  |
| button [aria-label] | Materialien 4 | 1 |  |
| a | Vorläufige Verordnung zum MietrechtGesetz · AR | 1 |  |
| a | Anhang 3 KKV-FINMAGesetz | 1 |  |
| a | Anhang 4 FIDLEVGesetz | 1 |  |
| a | Anhang 1 RVOVGesetz | 1 |  |
| a | Anhang 2 MepVGesetz | 1 |  |
| a | BundMaterialie | 1 |  |
| a | Was ist drin? | 1 |  |
| nav [aria-label] | NavigationRechnerVorlagenEinstellungenMethodikÜber LexMetrikKontaktDatenschutzerklärung | 1 |  |
| a | Rechner | 1 |  |
| a | Vorlagen | 1 |  |
| a | Einstellungen | 1 |  |
| a | Methodik | 1 |  |
| a | Über LexMetrik | 1 |  |
| a | Kontakt | 1 |  |
| a | Datenschutzerklärung | 1 |  |
| a | fedlex.admin.ch | 1 |  |
### Einstellungen — 47 UI-Beschriftungen (0 Rechtsinhalt-Treffer ausgefiltert, 161 DOM-Elemente gesamt)  
Quelle (Routen-Ebene, nicht je Zeile): `src/pages/Einstellungen.tsx`
| Element | Text | Wdh. | title |
|---|---|---|---|
| a | Zum Inhalt springen | 1 |  |
| button [aria-label] | Seitenleiste ein- und ausblenden | 1 |  |
| a [aria-label] | §LexMetrik | 1 |  |
| input [aria-label] | LexMetrik durchsuchen oder zur Norm springen | 1 |  |
| button [aria-label] | Verlauf – zuletzt geöffnet | 1 | Verlauf (nur auf diesem Gerät) |
| button [aria-label] | ◐ | 1 | Automatisch (System) |
| button [aria-label] | de▾ | 1 |  |
| button | Reiter 1: Gesetze | 1 |  |
| button [aria-label] | ⧉ | ×8 | Daneben öffnen |
| button [aria-label] | ✕ | ×8 | Reiter «Gesetze» schliessen |
| button | Reiter 2: Rechtsprechung | 1 |  |
| button | Reiter 3: Materialien | 1 |  |
| button | Reiter 4: Rechner | 1 |  |
| button | Reiter 5: Vorlagen | 1 |  |
| button | Reiter 6: OR | 1 |  |
| button | Reiter 7: WJV | 1 |  |
| button | Reiter 8: Entscheid öffnen | 1 |  |
| button [aria-label] | + | 1 | Neuer Reiter (Alt+T) |
| button [aria-label] | +4 | 1 | Alle offenen Reiter |
| h1 | Einstellungen | 1 |  |
| input [aria-label] | Name | 1 |  |
| button [aria-label] | A− | 1 | Verkleinert die ganze Anwendung — der Gesetzestext hat im Menü «Ansicht» einen eigenen Regler |
| button [aria-label] | A+ | 1 | Vergrössert die ganze Anwendung — der Gesetzestext hat im Menü «Ansicht» einen eigenen Regler |
| button | Hell | 1 |  |
| button | Dunkel | 1 |  |
| button | Automatischfolgt dem System | 1 |  |
| button | Einfachnur die Kernklauseln | 1 |  |
| button | Standardvollständige Grundausstattung | 1 |  |
| button | Expertemit allen Zusatzmodulen | 1 |  |
| button | Modern | 1 |  |
| button | Nüchtern | 1 |  |
| button | Liste | 1 |  |
| button | Karten | 1 |  |
| button | Klein | 1 |  |
| button | Normal | 1 |  |
| button | Gross | 1 |  |
| button | Sehr gross | 1 |  |
| button | Alles zurücksetzen … | 1 |  |
| nav [aria-label] | NavigationRechnerVorlagenEinstellungenMethodikÜber LexMetrikKontaktDatenschutzerklärung | 1 |  |
| a | Rechner | 1 |  |
| a | Vorlagen | 1 |  |
| a | Einstellungen | 1 |  |
| a | Methodik | 1 |  |
| a | Über LexMetrik | 1 |  |
| a | Kontakt | 1 |  |
| a | Datenschutzerklärung | 1 |  |
| a | fedlex.admin.ch | 1 |  |
### Methodik — 36 UI-Beschriftungen (0 Rechtsinhalt-Treffer ausgefiltert, 319 DOM-Elemente gesamt)  
Quelle (Routen-Ebene, nicht je Zeile): `src/pages/Methodik.tsx`
| Element | Text | Wdh. | title |
|---|---|---|---|
| a | Zum Inhalt springen | 1 |  |
| button [aria-label] | Seitenleiste ein- und ausblenden | 1 |  |
| a [aria-label] | §LexMetrik | 1 |  |
| input [aria-label] | LexMetrik durchsuchen oder zur Norm springen | 1 |  |
| button [aria-label] | Verlauf – zuletzt geöffnet | 1 | Verlauf (nur auf diesem Gerät) |
| button [aria-label] | ◐ | 1 | Automatisch (System) |
| button [aria-label] | de▾ | 1 |  |
| button | Reiter 1: Gesetze | 1 |  |
| button [aria-label] | ⧉ | ×8 | Daneben öffnen |
| button [aria-label] | ✕ | ×8 | Reiter «Gesetze» schliessen |
| button | Reiter 2: Rechtsprechung | 1 |  |
| button | Reiter 3: Materialien | 1 |  |
| button | Reiter 4: Rechner | 1 |  |
| button | Reiter 5: Vorlagen | 1 |  |
| button | Reiter 6: OR | 1 |  |
| button | Reiter 7: WJV | 1 |  |
| button | Reiter 8: Entscheid öffnen | 1 |  |
| button [aria-label] | + | 1 | Neuer Reiter (Alt+T) |
| button [aria-label] | +4 | 1 | Alle offenen Reiter |
| h1 | Wie LexMetrik rechnet | 1 |  |
| h2 | Deterministisch gerechnet statt KI-geschätzt | 1 |  |
| h2 | Jeder Schritt liegt offen | 1 |  |
| h2 | Strittige Rechtsfragen werden offengelegt, nicht versteckt | 1 |  |
| h2 | Geprüft oder In Vorbereitung | 1 |  |
| h2 | Wie Vorlagen entstehen | 1 |  |
| h2 | Ihre Daten bleiben bei Ihnen | 1 |  |
| h2 | Aktualität & Pflege der Parameter | 1 |  |
| nav [aria-label] | NavigationRechnerVorlagenEinstellungenMethodikÜber LexMetrikKontaktDatenschutzerklärung | 1 |  |
| a | Rechner | 1 |  |
| a | Vorlagen | 1 |  |
| a | Einstellungen | 1 |  |
| a | Methodik | 1 |  |
| a | Über LexMetrik | 1 |  |
| a | Kontakt | 1 |  |
| a | Datenschutzerklärung | 1 |  |
| a | fedlex.admin.ch | 1 |  |
### Ueber — 33 UI-Beschriftungen (0 Rechtsinhalt-Treffer ausgefiltert, 120 DOM-Elemente gesamt)  
Quelle (Routen-Ebene, nicht je Zeile): `src/pages/Ueber.tsx`
| Element | Text | Wdh. | title |
|---|---|---|---|
| a | Zum Inhalt springen | 1 |  |
| button [aria-label] | Seitenleiste ein- und ausblenden | 1 |  |
| a [aria-label] | §LexMetrik | 1 |  |
| input [aria-label] | LexMetrik durchsuchen oder zur Norm springen | 1 |  |
| button [aria-label] | Verlauf – zuletzt geöffnet | 1 | Verlauf (nur auf diesem Gerät) |
| button [aria-label] | ◐ | 1 | Automatisch (System) |
| button [aria-label] | de▾ | 1 |  |
| button | Reiter 1: Gesetze | 1 |  |
| button [aria-label] | ⧉ | ×8 | Daneben öffnen |
| button [aria-label] | ✕ | ×8 | Reiter «Gesetze» schliessen |
| button | Reiter 2: Rechtsprechung | 1 |  |
| button | Reiter 3: Materialien | 1 |  |
| button | Reiter 4: Rechner | 1 |  |
| button | Reiter 5: Vorlagen | 1 |  |
| button | Reiter 6: OR | 1 |  |
| button | Reiter 7: WJV | 1 |  |
| button | Reiter 8: Entscheid öffnen | 1 |  |
| button [aria-label] | + | 1 | Neuer Reiter (Alt+T) |
| button [aria-label] | +4 | 1 | Alle offenen Reiter |
| h1 | Über LexMetrik | 1 |  |
| h2 | Was LexMetrik heute ist | 1 |  |
| h2 | Wonach LexMetrik gebaut ist | 1 |  |
| a | Abdeckung | 1 |  |
| a | Methodik | 1 |  |
| a | Kontakt | 1 |  |
| a | David Graf | 1 |  |
| nav [aria-label] | NavigationRechnerVorlagenEinstellungenMethodikÜber LexMetrikKontaktDatenschutzerklärung | 1 |  |
| a | Rechner | 1 |  |
| a | Vorlagen | 1 |  |
| a | Einstellungen | 1 |  |
| a | Über LexMetrik | 1 |  |
| a | Datenschutzerklärung | 1 |  |
| a | fedlex.admin.ch | 1 |  |
### Kontakt — 35 UI-Beschriftungen (0 Rechtsinhalt-Treffer ausgefiltert, 109 DOM-Elemente gesamt)  
Quelle (Routen-Ebene, nicht je Zeile): `src/pages/Kontakt.tsx`
| Element | Text | Wdh. | title |
|---|---|---|---|
| a | Zum Inhalt springen | 1 |  |
| button [aria-label] | Seitenleiste ein- und ausblenden | 1 |  |
| a [aria-label] | §LexMetrik | 1 |  |
| input [aria-label] | LexMetrik durchsuchen oder zur Norm springen | 1 |  |
| button [aria-label] | Verlauf – zuletzt geöffnet | 1 | Verlauf (nur auf diesem Gerät) |
| button [aria-label] | ◐ | 1 | Automatisch (System) |
| button [aria-label] | de▾ | 1 |  |
| button | Reiter 1: Gesetze | 1 |  |
| button [aria-label] | ⧉ | ×8 | Daneben öffnen |
| button [aria-label] | ✕ | ×8 | Reiter «Gesetze» schliessen |
| button | Reiter 2: Rechtsprechung | 1 |  |
| button | Reiter 3: Materialien | 1 |  |
| button | Reiter 4: Rechner | 1 |  |
| button | Reiter 5: Vorlagen | 1 |  |
| button | Reiter 6: OR | 1 |  |
| button | Reiter 7: WJV | 1 |  |
| button | Reiter 8: Entscheid öffnen | 1 |  |
| button [aria-label] | + | 1 | Neuer Reiter (Alt+T) |
| button [aria-label] | +4 | 1 | Alle offenen Reiter |
| h1 | Kontakt aufnehmen | 1 |  |
| label | Name · optional | 1 |  |
| label | E-Mail (für die Antwort) | 1 |  |
| label | Betreff · optional | 1 |  |
| label | Nachricht | 1 |  |
| a | Datenschutzerklärung | 1 |  |
| button | Nachricht senden | 1 | Versandweg noch nicht eingerichtet |
| button | Nachricht kopieren | 1 |  |
| nav [aria-label] | NavigationRechnerVorlagenEinstellungenMethodikÜber LexMetrikKontaktDatenschutzerklärung | 1 |  |
| a | Rechner | 1 |  |
| a | Vorlagen | 1 |  |
| a | Einstellungen | 1 |  |
| a | Methodik | 1 |  |
| a | Über LexMetrik | 1 |  |
| a | Kontakt | 1 |  |
| a | fedlex.admin.ch | 1 |  |
### Datenschutz — 30 UI-Beschriftungen (8 Rechtsinhalt-Treffer ausgefiltert, 116 DOM-Elemente gesamt)  
Quelle (Routen-Ebene, nicht je Zeile): `src/pages/Datenschutz.tsx`
| Element | Text | Wdh. | title |
|---|---|---|---|
| a | Zum Inhalt springen | 1 |  |
| button [aria-label] | Seitenleiste ein- und ausblenden | 1 |  |
| a [aria-label] | §LexMetrik | 1 |  |
| input [aria-label] | LexMetrik durchsuchen oder zur Norm springen | 1 |  |
| button [aria-label] | Verlauf – zuletzt geöffnet | 1 | Verlauf (nur auf diesem Gerät) |
| button [aria-label] | ◐ | 1 | Automatisch (System) |
| button [aria-label] | de▾ | 1 |  |
| button | Reiter 1: Gesetze | 1 |  |
| button [aria-label] | ⧉ | ×8 | Daneben öffnen |
| button [aria-label] | ✕ | ×8 | Reiter «Gesetze» schliessen |
| button | Reiter 2: Rechtsprechung | 1 |  |
| button | Reiter 3: Materialien | 1 |  |
| button | Reiter 4: Rechner | 1 |  |
| button | Reiter 5: Vorlagen | 1 |  |
| button | Reiter 6: OR | 1 |  |
| button | Reiter 7: WJV | 1 |  |
| button | Reiter 8: Entscheid öffnen | 1 |  |
| button [aria-label] | + | 1 | Neuer Reiter (Alt+T) |
| button [aria-label] | +4 | 1 | Alle offenen Reiter |
| h1 | Datenschutzerklärung | 1 |  |
| a | Kontaktseite | 1 |  |
| nav [aria-label] | NavigationRechnerVorlagenEinstellungenMethodikÜber LexMetrikKontaktDatenschutzerklärung | 1 |  |
| a | Rechner | 1 |  |
| a | Vorlagen | 1 |  |
| a | Einstellungen | 1 |  |
| a | Methodik | 1 |  |
| a | Über LexMetrik | 1 |  |
| a | Kontakt | 1 |  |
| a | Datenschutzerklärung | 1 |  |
| a | fedlex.admin.ch | 1 |  |
### Abdeckung — 34 UI-Beschriftungen (0 Rechtsinhalt-Treffer ausgefiltert, 107 DOM-Elemente gesamt)  
Quelle (Routen-Ebene, nicht je Zeile): `src/pages/Abdeckung.tsx`
| Element | Text | Wdh. | title |
|---|---|---|---|
| a | Zum Inhalt springen | 1 |  |
| button [aria-label] | Seitenleiste ein- und ausblenden | 1 |  |
| a [aria-label] | §LexMetrik | 1 |  |
| input [aria-label] | LexMetrik durchsuchen oder zur Norm springen | 1 |  |
| button [aria-label] | Verlauf – zuletzt geöffnet | 1 | Verlauf (nur auf diesem Gerät) |
| button [aria-label] | ◐ | 1 | Automatisch (System) |
| button [aria-label] | de▾ | 1 |  |
| button | Reiter 1: Gesetze | 1 |  |
| button [aria-label] | ⧉ | ×8 | Daneben öffnen |
| button [aria-label] | ✕ | ×8 | Reiter «Gesetze» schliessen |
| button | Reiter 2: Rechtsprechung | 1 |  |
| button | Reiter 3: Materialien | 1 |  |
| button | Reiter 4: Rechner | 1 |  |
| button | Reiter 5: Vorlagen | 1 |  |
| button | Reiter 6: OR | 1 |  |
| button | Reiter 7: WJV | 1 |  |
| button | Reiter 8: Entscheid öffnen | 1 |  |
| button [aria-label] | + | 1 | Neuer Reiter (Alt+T) |
| button [aria-label] | +4 | 1 | Alle offenen Reiter |
| h1 | Was ist durchsuchbar | 1 |  |
| h2 | Gesetze | 1 |  |
| a | Gesetze | 1 |  |
| h2 | Rechtsprechung | 1 |  |
| a | Zur Rechtsprechung → | 1 |  |
| h2 | Materialien | 1 |  |
| nav [aria-label] | NavigationRechnerVorlagenEinstellungenMethodikÜber LexMetrikKontaktDatenschutzerklärung | 1 |  |
| a | Rechner | 1 |  |
| a | Vorlagen | 1 |  |
| a | Einstellungen | 1 |  |
| a | Methodik | 1 |  |
| a | Über LexMetrik | 1 |  |
| a | Kontakt | 1 |  |
| a | Datenschutzerklärung | 1 |  |
| a | fedlex.admin.ch | 1 |  |
## (B) Befunde nach Schwere

### Hoch

**F1 · Linse 2 (Begriffs-Kanon) · Route `/rechtsprechung` (Übersicht,
Erweiterte Filter) und `/rechtsprechung/:key` (Entscheid-Leser, Fallback-Datumszeile)
· «Urteil» statt Kanon-Begriff «Entscheid»**
- vorher: Filterfeld-Labels **„Urteil ab“ / „Urteil bis“**; Datumszeile im
  Entscheid-Leser **„Urteil vom {Datum}“** (Fallback für ALLE Entscheidarten,
  nicht nur BGE-Urteile — Beschlüsse/Verfügungen laufen über denselben Zweig).
- nachher (Vorschlag): „Entscheid ab“ / „Entscheid bis“; „Entscheid vom {Datum}“.
- Datei:Zeile: `src/components/rechtsprechung/EntscheidFilter.tsx:295,300`;
  `src/components/rechtsprechung/EntscheidKopfTeile.tsx:140` (Funktion
  `DatumMeta`, Fallback-Zweig nach `istBandjahr`-Prüfung).
- Begründung: Begriffs-Kanon (Spec §Massstab) schreibt «Entscheid (nicht
  Urteil)» ausdrücklich vor; das Filterfeld gilt für ALLE Instanzen/Gerichte,
  nicht nur Urteile — «Urteil ab/bis» suggeriert eine Einschränkung, die es
  nicht gibt. Beleg: Screenshot `finder-r7-urteil-filter.jpg` (Erweiterte
  Filter geöffnet), `finder-r7-entscheid-urteil-vom.jpg` (Kopfzeile BGer
  1C_733/2025).
- Zählung: 3 Fundstellen (2× Filter, 1× Fallback-Datumszeile, dort aber
  Route-weit für JEDEN Entscheid ohne Sonderformat sichtbar).

**F2 · Linse 5 (Accessible Name) · Gesetz-Leser (alle Erlasse, Bund + Kanton)
und Entscheid-Leser (Pin-Cite) · Ziffer-/Absatz-Kopierknöpfe tragen den Scope
NUR im `title`, nicht im `aria-label`**
- vorher: `<button title="Art. 1 Abs. 2 OR — kopieren">2</button>` — sichtbarer
  Text nur „2“, kein `aria-label`.
- nachher (Vorschlag): `aria-label={`${zitat} — kopieren`}` zusätzlich zu
  `title` setzen (analog zum bereits gefixten Muster in `ArtikelLeser.tsx:474f`
  und dem 5B-Nachzug in `EntscheidLeser.tsx:816` — „Fehlerbuch-18: Kern: Scope
  nur im aria-label“ ist hier NICHT nachgezogen).
- Datei:Zeile: `src/components/normtext/ArtikelBody.zitier.tsx:36`
  (`ZitierMarke`, `title={`${zitat} — kopieren`}`, kein `aria-label`).
- Begründung: `title` ist auf Touch unerreichbar und nicht in jedem
  Screenreader-Baum verlässlich; dieselbe Baustelle wurde im Erlass-Kopf
  (Amtliche-Fassung-Link) und im 5B-Nachzug bereits behoben — dieser eine
  gemeinsame Baustein (`ZitierMarke`) bedient JEDEN Absatz-/Ziffer-Marker in
  JEDEM Erlass und blieb aussen vor. Zählung: 1 Baustein, hunderte gerenderte
  Instanzen (OR allein: 1'170+ Ziff.-Marker im Inventar, s. GesetzLeser-Bund).

### Hoch (Fortsetzung)

**F3 · Linse 3 (Dopplung/Konsistenz) · Route
`/rechtsprechung/BGE-146-III-1` (nicht vorhandener Entscheid) · Reiter-Titel
widerspricht dem Seiteninhalt**
- vorher: Tab-Leiste zeigt weiterhin den generischen Platzhalter «Entscheid
  öffnen», während der Seiteninhalt bereits «Entscheid nicht gefunden» anzeigt
  — zwei widersprüchliche Aussagen gleichzeitig sichtbar.
- nachher (Vorschlag): Reiter-Titel bei Nicht-Fund auf «Nicht gefunden» oder
  den angefragten Schlüssel setzen, statt beim Lade-Platzhalter zu bleiben.
- Beleg: Screenshot `finder-r7-tab-nichtgefunden-mismatch.jpg`.
- Datei:Zeile: `src/lib/verlaufLabel.ts:90-94` (`verlaufLabel()`): findet
  `entscheidPfad(path)` den Schlüssel NICHT im Manifest, liefert die Funktion
  unbedingt den generischen String `'Entscheid öffnen'` zurück — unabhängig
  davon, ob der Entscheid noch lädt oder nachweislich nicht existiert; die
  Reiterleiste übernimmt dieses Label unverändert als Tab-Titel.
- Begründung: Linse 3 (Dopplung/Widerspruch) — ein Reiter, der eine andere
  Aussage trifft als die Fläche, die er beschriftet, ist ein Konsistenz-Fund
  unabhängig vom exakten Code-Ort.

### Kosmetisch

**F4 · Linse 6 (i18n) · global · kein Übersetzungs-Inhalt, nur Sprach-Umschalter**
- Befund: `src/components/locale.tsx` definiert de/en/fr/it, aber
  „ALLE Inhalte fallen auf Deutsch zurück, bis eine fachkundige Person
  übersetzt“ (Kommentar Z. 5f). Linse 6 damit **nicht anwendbar** — es gibt
  keine Übersetzungsdatei mit Parität zu prüfen, nur den Umschalter selbst
  (Menü-Einträge «Deutsch ✓ · English In Vorbereitung · Français In
  Vorbereitung · Italiano In Vorbereitung» — konsistent beschriftet, kein
  Fund).

**F5 · Linse 4 (Länge) · Startseite/Übersichten · Karten-Volltext als EIN Link**
  gemessen, keine echten Kurz-Knöpfe
- Befund (Methodik-Hinweis, kein Sprachfund): die grossen Kategorie-Kacheln
  (`Gesetze1'565Erlasse im Volltext…`) sind je EIN `<a>`, das Zahl + Titel +
  Beschreibung umschliesst — die 3-Wörter-Regel für „Knopf-Texte“ greift hier
  nicht, weil es kein Knopf, sondern eine Karte mit Fliesstext ist. Kein
  Fund, nur Abgrenzung für die Wortliste unten (falls der Fixer versehentlich
  die ganze Karte kürzt).

## (C) Wortliste vorher → nachher je Datei (Bau-Vorlage)

| Datei | vorher | nachher |
|---|---|---|
| `src/components/rechtsprechung/EntscheidFilter.tsx:295` | `Urteil ab` | `Entscheid ab` |
| `src/components/rechtsprechung/EntscheidFilter.tsx:300` | `Urteil bis` | `Entscheid bis` |
| `src/components/rechtsprechung/EntscheidKopfTeile.tsx:140` | `Urteil vom ` | `Entscheid vom ` |
| `src/components/normtext/ArtikelBody.zitier.tsx:36` | nur `title={`${zitat} — kopieren`}` | zusätzlich `aria-label={`${zitat} — kopieren`}` |
| `src/lib/verlaufLabel.ts:93` | `'Entscheid öffnen'` (unbedingter Fallback) | z. B. `'Nicht gefunden'` bzw. den angefragten Schlüssel als Label, wenn der Entscheid nicht im Manifest steht |

## (D) Wächter, die deklariert nachzuziehen sind

- `src/tests/leser-benennung.test.ts` — trägt bereits das „Fehlerbuch-18“-Muster
  (Scope nur im aria-label) für ANDERE Bausteine (B-1/B-6 im Erlass-Kopf); ein
  neuer Fall für `ArtikelBody.zitier.tsx` (F2) ist dort NICHT erfasst — grep
  `grep -n "ZitierMarke\|ArtikelBody.zitier" src/tests/leser-benennung.test.ts`
  ergab keinen Treffer → Wächter deckt F2 nicht, müsste ergänzt werden.
- `src/tests/konventionen.test.ts` — prüft Flosk eln/Formulierung in
  Vorlagen-Text, NICHT „Urteil“ vs. „Entscheid“ in der Rechtsprechungs-UI
  (anderes Themenfeld) → deckt F1 nicht.
- Keine Sonde gefunden, die `"Urteil ab"` oder `"Urteil bis"` im Test-Korpus
  sucht (`grep -rn "Urteil ab\|Urteil bis" src/tests/` → 0 Treffer) — ein Fix
  von F1 bricht also keinen bestehenden Test, muss aber einen NEUEN
  Begriffs-Kanon-Test für die Rechtsprechungs-Filterzeile erhalten, sonst
  wandert der Fehler unbemerkt zurück.

## (E) Nicht geprüft / nicht erreichbar

- **Mobile Schublade @390**: Klick auf „☰ Navigation öffnen“ zeigte im
  Messlauf denselben Inhalt wie ungeöffnet (kein separates Sheet erfasst) —
  entweder öffnet sich kein eigenes Overlay (Navigation ist bereits inline)
  oder der Selektor traf das falsche Element. Nicht abschliessend geklärt.
- **⌘K**: kein eigenes Popover — fokussiert nur das bestehende Suchfeld
  (`HeaderSuche.tsx:182`); ursprüngliche Annahme einer Command-Palette war
  falsch, daher kein Befund, nur Klarstellung.
- **Split-View (Pane daneben)**: „⧉ Daneben öffnen“ als Knopf im Inventar
  gesichtet, das tatsächliche Öffnen einer zweiten Pane-Fläche NICHT
  durchgeklickt (Zeitbudget).
- **Alle 20 Rechner und 26 Vorlagen einzeln**: nur je 2 repräsentative Routen
  gemessen (`/rechner/verjaehrung`, `/rechner/kuendigung`,
  `/vorlagen/mietvertrag`), wie Spec „zwei Rechner … ein Vorlagen-Wizard“
  vorsieht — die übrigen 18 Rechner/25 Vorlagen NICHT einzeln inventarisiert.
- **DE/FR/IT-Datei-Parität**: entfällt strukturell (F4), keine Übersetzung
  vorhanden, die geprüft werden könnte.
- Preview-Prozess (vite, Port 4354) wird am Ende dieser Session beendet.
