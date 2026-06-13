# Abnahme-Dossier: Vollmacht — alle Bausteine Wort für Wort

**Zweck:** Wort-für-Wort-Abnahme durch David (fachkundige Person, CLAUDE.md §7).
Je Baustein eine Abhak-Zeile.

**Quelle:** `src/lib/vorlagen/vollmacht.ts (VOLLMACHT_SCHEMA)`. **Generiert:**
`npx vite-node scripts/abnahme-dossiers.ts` — nach Engine-Änderungen NEU
laufen lassen; das Dossier ist eine Ableitung, keine zweite Pflege-Stelle (§5).

**Lesehilfe:** «Aufnahme: immer» = Baustein steht in jedem Dokument; sonst die
lesbare `includeIf`-Bedingung über die Antwort-Felder. «wiederholt über» =
ein Absatz je Listeneintrag ({{item.…}}-Platzhalter). {{platzhalter}} werden
beim Erzeugen interpoliert; Fragment-Felder (…Satz/…Zeile) verschwinden leer
ersatzlos.


---

## Vollmacht

Schema `vollmacht` · Version 1.0.0 (Rechtsstand Art. 32–40 OR; Bericht 5.6.2026) · Format vertrag · Ausgabe fertig

> **Disclaimer (Fusszeile):** Erstellt mit LexMetrik – keine Rechtsberatung. Die Vollmacht ist grundsätzlich formfrei (Art. 11 OR); die unterzeichnete schriftliche Fassung dient dem Ausweis gegenüber Dritten (Art. 33 Abs. 3 OR). Formbedürftige Geschäfte (z. B. Bürgschaft, Grundstückkauf) und der Vorsorgefall (Vorsorgeauftrag, Art. 360 ff. ZGB) sind gesondert zu regeln.


### 1. `VM01_geber_natuerlich`

- [ ] **abgenommen** (David)
- **Norm:** Art. 32 Abs. 1 OR
- **Aufnahme:** geberTyp = "natuerlich"
- **Begründung (Protokoll):** Identifikation der vollmachtgebenden natürlichen Person – immer enthalten.

**Wortlaut:**

> Ich, {{vorname}} {{nachname}},{{geburtsdatumSatz}} wohnhaft {{adresse}} (Vollmachtgeber/in), erteile hiermit die folgende Vollmacht:

### 2. `VM01_geber_juristisch`

- [ ] **abgenommen** (David)
- **Norm:** Art. 32 Abs. 1 OR
- **Aufnahme:** geberTyp = "juristisch"
- **Begründung (Protokoll):** Identifikation der vollmachtgebenden juristischen Person samt Vertretungsorgan – immer enthalten.

**Wortlaut:**

> {{firma}}, mit Sitz in {{sitz}}, vertreten durch {{vertretenDurch}} (Vollmachtgeberin), erteilt hiermit die folgende Vollmacht:

### 3. `VM02_bevollmaechtigte` — «Bevollmächtigte Person(en)»

- [ ] **abgenommen** (David)
- **Norm:** Art. 32 Abs. 1 OR
- **Aufnahme:** bevollmaechtigteListe nicht leer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Aufgenommen, weil mindestens eine bevollmächtigte Person bezeichnet wurde.

**Wortlaut:**

> Bevollmächtigt wird/werden:

### 4. `VM02b_bevollmaechtigteliste`

- [ ] **abgenommen** (David)
- **Norm:** Art. 33 Abs. 3 OR
- **Aufnahme:** bevollmaechtigteListe nicht leer
- **Wiederholt über:** `bevollmaechtigteListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Je bevollmächtigte Person eine Zeile (Identifikation für die Kundgabe an Dritte).

**Wortlaut:**

> – {{item.name}}{{item.angabenZeile}}

### 5. `VM03_einzeln`

- [ ] **abgenommen** (David)
- **Norm:** Art. 33 Abs. 2 OR
- **Aufnahme:** mehrere = true UND vertretung = "einzeln"
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Aufgenommen, weil mehrere Bevollmächtigte mit Einzelvertretung gewählt wurden (Usanz «je einzeln»).

**Wortlaut:**

> Mehrere Bevollmächtigte sind je einzeln zur Vertretung berechtigt.

### 6. `VM03_gemeinsam`

- [ ] **abgenommen** (David)
- **Norm:** Art. 33 Abs. 2 OR
- **Aufnahme:** mehrere = true UND vertretung = "gemeinsam"
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Aufgenommen, weil mehrere Bevollmächtigte mit gemeinsamer Vertretung gewählt wurden.

**Wortlaut:**

> Mehrere Bevollmächtigte sind nur gemeinsam zur Vertretung berechtigt (Kollektivvollmacht).

### 7. `VM10_umfang_anwalt` — «Umfang der Vollmacht»

- [ ] **abgenommen** (David)
- **Norm:** Art. 33 Abs. 2 OR
- **Aufnahme:** typ = "anwalt"
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Umfangsklausel der Anwaltsvollmacht (Usanz SAV-Kanzleien); die Prozessvollmacht deckt alle Prozesshandlungen, die das Verfahren mit sich bringt.
- **Hinweis (offengelegt):** Der Ausweis gegenüber Gericht/Behörde erfolgt durch diese schriftliche Vollmacht (Art. 68 Abs. 3 ZPO; Art. 129 Abs. 2 StPO; Art. 11 Abs. 2 VwVG).

**Wortlaut:**

> Die bevollmächtigte Person wird ermächtigt, die vollmachtgebende Person in Sachen {{mandatsgegenstand}} vor allen Gerichten und Behörden sowie gegenüber Privaten zu vertreten und alles zu tun oder zu unterlassen, was sie zur Wahrung der übertragenen Interessen für notwendig oder angemessen hält. Eingeschlossen sind insbesondere die Einreichung von Klagen und Rechtsmitteln, der Vollzug von Urteilen, die Empfangnahme und Herausgabe von Zahlungen sowie die Anhebung und Durchführung von Schuldbetreibungen und die Stellung von Konkursbegehren.

### 8. `VM11_prozessbefugnisse`

- [ ] **abgenommen** (David)
- **Norm:** Art. 396 Abs. 3 OR
- **Aufnahme:** typ = "anwalt" UND prozessbefugnisse = true
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Aufgenommen, weil die Vergleichs-/Anerkennungs-/Rückzugsbefugnis ausdrücklich erteilt wurde – materielle Verfügungshandlungen brauchen die besondere Ermächtigung.
- **Hinweis (offengelegt):** Vergleich, Klageanerkennung und Klagerückzug beenden das Verfahren mit Entscheidwirkung (Art. 241 ZPO); die Lehre stellt strenge Anforderungen an die Spezifizierung.

**Wortlaut:**

> Die bevollmächtigte Person ist ausdrücklich ermächtigt, Vergleiche abzuschliessen sowie Klagen anzuerkennen und zurückzuziehen.

### 9. `VM12_geheimnisentbindung`

- [ ] **abgenommen** (David)
- **Aufnahme:** typ = "anwalt" UND geheimnisentbindung = true
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Aufgenommen, weil die Geheimnisentbindung zur Aktenbeschaffung gewählt wurde (Usanz in Anwaltsvollmachten).

**Wortlaut:**

> Dritte – namentlich Anwältinnen und Anwälte, Ärztinnen und Ärzte, Spitäler, Versicherungen, Banken und Behörden – werden gegenüber der bevollmächtigten Person von ihrer Schweige- und Geheimhaltungspflicht entbunden. Diese Entbindung kann jederzeit schriftlich widerrufen werden.

### 10. `VM20_umfang_general` — «Umfang der Vollmacht»

- [ ] **abgenommen** (David)
- **Norm:** Art. 33 Abs. 2 OR
- **Aufnahme:** typ = "general"
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Umfangsklausel der Generalvollmacht (Mustertext Bericht Ziff. 5).

**Wortlaut:**

> Die bevollmächtigte Person wird ermächtigt, die vollmachtgebende Person in allen Rechtshandlungen und Geschäften zu vertreten, für die eine Stellvertretung gesetzlich zulässig ist (Generalvollmacht).

### 11. `VM21_grenze_hoechstpersoenlich`

- [ ] **abgenommen** (David)
- **Norm:** Art. 19c ZGB
- **Aufnahme:** typ = "general"
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Feste Grenze jeder Generalvollmacht: absolut höchstpersönliche Rechte sind vertretungsfeindlich.

**Wortlaut:**

> Ausgenommen bleiben höchstpersönliche Rechte, die keiner Vertretung zugänglich sind – insbesondere die Errichtung einer letztwilligen Verfügung, die Eheschliessung und die Anerkennung eines Kindes.

### 12. `VM30_spezial_geschaeft` — «Umfang der Vollmacht»

- [ ] **abgenommen** (David)
- **Norm:** Art. 33 Abs. 2 OR
- **Aufnahme:** typ = "spezial" UND geschaeft nicht leer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Aufgenommen, weil ein bestimmtes Geschäft bezeichnet wurde (Spezialvollmacht).

**Wortlaut:**

> Die bevollmächtigte Person wird ermächtigt, die vollmachtgebende Person in folgender Angelegenheit zu vertreten: {{geschaeft}}

### 13. `VM31a_bereiche_zusatz`

- [ ] **abgenommen** (David)
- **Norm:** Art. 33 Abs. 2 OR
- **Aufnahme:** typ = "spezial" UND bereicheListe nicht leer UND geschaeft nicht leer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Aufgenommen, weil zusätzlich zum bezeichneten Geschäft Vertretungsbereiche gewählt wurden.

**Wortlaut:**

> Die Vollmacht umfasst zudem die folgenden Vertretungsbereiche:

### 14. `VM31b_bereiche` — «Umfang der Vollmacht»

- [ ] **abgenommen** (David)
- **Norm:** Art. 33 Abs. 2 OR
- **Aufnahme:** typ = "spezial" UND bereicheListe nicht leer UND NICHT (geschaeft nicht leer)
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Aufgenommen, weil Vertretungsbereiche (ohne einzelnes Geschäft) gewählt wurden.

**Wortlaut:**

> Die Vollmacht umfasst die folgenden Vertretungsbereiche:

### 15. `VM31c_bereicheliste`

- [ ] **abgenommen** (David)
- **Norm:** Art. 33 Abs. 2 OR
- **Aufnahme:** typ = "spezial" UND bereicheListe nicht leer
- **Wiederholt über:** `bereicheListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Je gewählter Vertretungsbereich eine Zeile (sachliche Beschränkung).

**Wortlaut:**

> – {{item.label}};

### 16. `VM32_beschraenkung`

- [ ] **abgenommen** (David)
- **Norm:** Art. 33 Abs. 2 OR
- **Aufnahme:** typ = "spezial"
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Klarstellung der sachlichen Beschränkung – Überschreitung führt zum Handeln ohne Vertretungsmacht (Art. 38 f. OR).

**Wortlaut:**

> Die Vollmacht ist auf die vorstehend bezeichneten Angelegenheiten und Bereiche beschränkt.

### 17. `VM40_ermaechtigungen` — «Besondere Ermächtigungen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 396 Abs. 3 OR
- **Aufnahme:** ermaechtigungenListe nicht leer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Aufgenommen, weil Geschäfte gewählt wurden, die eine besondere Ermächtigung verlangen – sie gelten ohne ausdrückliche Nennung als NICHT erteilt.

**Wortlaut:**

> Die bevollmächtigte Person ist ausdrücklich ermächtigt:

### 18. `VM40b_ermaechtigungenliste`

- [ ] **abgenommen** (David)
- **Norm:** Art. 396 Abs. 3 OR
- **Aufnahme:** ermaechtigungenListe nicht leer
- **Wiederholt über:** `ermaechtigungenListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Je besondere Ermächtigung eine Zeile (Katalog wortlautnah zu Art. 396 Abs. 3 OR).

**Wortlaut:**

> – {{item.label}};

### 19. `VM50_substitution_erlaubt` — «Substitution»

- [ ] **abgenommen** (David)
- **Norm:** Art. 399 Abs. 2 OR
- **Aufnahme:** substitution = "erlaubt"
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Aufgenommen, weil Substitution erlaubt wurde – bei befugter Substitution haftet die beauftragte Person nur für gehörige Auswahl und Instruktion.

**Wortlaut:**

> Die bevollmächtigte Person ist berechtigt, eine Untervollmacht zu erteilen (Substitution).

### 20. `VM51_substitution_verboten` — «Substitution»

- [ ] **abgenommen** (David)
- **Norm:** Art. 398 Abs. 3 OR
- **Aufnahme:** substitution = "verboten"
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Aufgenommen, weil Substitution ausgeschlossen wurde (persönliche Besorgungspflicht).

**Wortlaut:**

> Die Erteilung einer Untervollmacht ist ausgeschlossen.

### 21. `VM60_befristung`

- [ ] **abgenommen** (David)
- **Norm:** Art. 33 Abs. 2 OR
- **Aufnahme:** befristetBis nicht leer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Aufgenommen, weil eine Befristung gewählt wurde (zeitliche Beschränkung der Ermächtigung).

**Wortlaut:**

> Diese Vollmacht ist befristet und gilt bis zum {{befristetBis}}.

### 22. `VM61_widerruf`

- [ ] **abgenommen** (David)
- **Norm:** Art. 34 OR
- **Aufnahme:** immer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Deklaratorische Widerrufsklausel – das Widerrufsrecht ist zwingend, ein Vorausverzicht ungültig (Art. 34 Abs. 2 OR).

**Wortlaut:**

> Diese Vollmacht kann jederzeit beschränkt oder widerrufen werden. Gegenüber gutgläubigen Dritten, denen die Vollmacht kundgegeben wurde, wird der Widerruf erst mit dessen Mitteilung wirksam.

### 23. `VM62_fortgeltung`

- [ ] **abgenommen** (David)
- **Norm:** Art. 35 Abs. 1 OR
- **Aufnahme:** fortgeltungTod = true
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Aufgenommen, weil die Fortgeltung über Tod/Handlungsunfähigkeit hinaus gewählt wurde – Art. 35 Abs. 1 OR ist dispositiv.
- **Hinweis (offengelegt):** Für die Vorsorge bei Urteilsunfähigkeit ist der Vorsorgeauftrag (Art. 360 ff. ZGB) das massgebliche Instrument; Banken/Behörden akzeptieren blosse Dauervollmachten dann nicht zuverlässig.

**Wortlaut:**

> Diese Vollmacht erlischt nicht mit dem Tod, der Verschollenerklärung oder dem Verlust der Handlungsfähigkeit der vollmachtgebenden Person.

### 24. `VM70_unterschrift`

- [ ] **abgenommen** (David)
- **Norm:** Art. 33 Abs. 3 OR
- **Aufnahme:** immer
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Unterschriftsblock der vollmachtgebenden Person – die unterzeichnete Urkunde dient als Ausweis gegenüber Dritten.

**Wortlaut:**

> {{ortDatumZeile}}
>
>
> _________________________________
> {{unterschriftZeile}}

---

**Summe:** 24 Bausteine in 1 Schemas.
