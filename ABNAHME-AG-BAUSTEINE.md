# Abnahme-Dossier AG-Gründung — alle Bausteine Wort für Wort

**Zweck:** Wort-für-Wort-Abnahme der AG-Gründungs-Schemas durch David
(fachkundige Person, CLAUDE.md §7). Je Baustein eine Abhak-Zeile; abgehakte
Bausteine werden anschliessend im Schema auf `verified: true` gehoben.

**Quelle:** `src/lib/vorlagen/gruendungAgDokumente.ts` (Registry
`AG_ALLE_SCHEMAS`). **Generiert:** `npx vite-node scripts/abnahme-ag.ts` —
nach Engine-Änderungen NEU laufen lassen, das Dossier ist eine Ableitung,
keine zweite Pflege-Stelle (§5).

**Lesehilfe:** «Aufnahme: immer» = Baustein steht in jedem Dokument;
sonst die lesbare `includeIf`-Bedingung über die Antwort-Felder.
«wiederholt über» = ein Absatz je Listeneintrag ({{item.…}}-Platzhalter).
{{platzhalter}} werden beim Erzeugen interpoliert; Fragment-Felder
(…Satz/…Zeile) verschwinden leer ersatzlos.


---

## Statuten

Schema `ag-statuten` · Version 1.0.0 (Rechtsstand OR 1.1.2026; Wortlaut-Dossier 7.6.2026) · Format vertrag · Ausgabe entwurf

> **Disclaimer (Fusszeile):** Erstellt mit LexMetrik – keine Rechtsberatung. ENTWURF zur Vorbereitung der Gründung: Die Statuten der AG werden von der Urkundsperson geprüft und beglaubigt (Art. 22 Abs. 4 HRegV); massgeblich ist die beurkundete Fassung. Wortlaute nach den amtlichen Mustern ZH/SG/GL, verifiziert am OR-Stand 1.1.2026.


### 1. `AS00_ingress`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Begründung (Protokoll):** Identifikations-Ingress unter dem Dokumenttitel (Usanz aller amtlichen Muster).

**Wortlaut:**

> der {{firma}} mit Sitz in {{sitz}}

### 2. `AS01_firma_sitz` — «Firma und Sitz»

- [ ] **abgenommen** (David)
- **Norm:** Art. 626 Abs. 1 Ziff. 1 OR
- **Aufnahme:** immer
- **Begründung (Protokoll):** Pflichtinhalt Firma/Sitz (Wortlaut ZH/SG/GL wortgleich).

**Wortlaut:**

> Unter der Firma {{firma}} besteht mit Sitz in {{sitz}} auf unbestimmte Dauer eine Aktiengesellschaft gemäss Art. 620 ff. OR.

### 3. `AS02_zweck` — «Zweck»

- [ ] **abgenommen** (David)
- **Norm:** Art. 626 Abs. 1 Ziff. 2 OR
- **Aufnahme:** immer
- **Begründung (Protokoll):** Pflichtinhalt Zweck.

**Wortlaut:**

> Die Gesellschaft bezweckt {{zweck}}.

### 4. `AS02b_zweck_erweiterung`

- [ ] **abgenommen** (David)
- **Norm:** Art. 626 Abs. 1 Ziff. 2 OR
- **Aufnahme:** zweckErweiterung = true
- **Begründung (Protokoll):** Aufgenommen, weil die übliche Zweck-Erweiterungsklausel gewählt wurde (ZH-/GL-Muster-Wortlaut).

**Wortlaut:**

> Die Gesellschaft kann Zweigniederlassungen errichten, sich an anderen Unternehmen beteiligen, Grundstücke erwerben, halten und veräussern, Finanzierungen für eigene oder fremde Rechnung vornehmen sowie Sicherheiten für Verbindlichkeiten verbundener Gesellschaften leisten.

### 5. `AS03_kapital` — «Aktienkapital und Aktien»

- [ ] **abgenommen** (David)
- **Norm:** Art. 626 Abs. 1 Ziff. 3 und 4 OR
- **Aufnahme:** immer
- **Begründung (Protokoll):** Pflichtinhalt: Höhe des Kapitals, geleistete Einlagen (Liberierungsgrad) sowie Anzahl, Nennwert und Art der Aktien (rev. 2023; Wortlaut ZH/SG/GL).

**Wortlaut:**

> Das Aktienkapital beträgt {{waehrungCode}} {{akFmt}} und ist eingeteilt in {{anzahlAktien}} Namenaktien zu {{waehrungCode}} {{nennwertFmt}}. Die Aktien sind {{liberierungSatz}}.

### 6. `AS06_sacheinlagen` — «Sacheinlagen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 634 Abs. 4 OR
- **Aufnahme:** hatSacheinlagen = true
- **Wiederholt über:** `sachListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Pflichtinhalt bei Sacheinlage: Gegenstand, Bewertung, Name des Einlegers, ausgegebene Aktien und allfällige weitere Gegenleistungen (Art. 634 Abs. 4 OR; Elemente-Katalog am Cache verifiziert, Dossier ag-qualifizierte-gruendung.md Teil 1). Haus-Formulierung — die amtlichen Muster enthalten keinen Standard-Klauseltext.
- **Hinweis (offengelegt):** Die Generalversammlung kann diese Statutenbestimmung erst nach zehn Jahren aufheben (Art. 634 Abs. 4 Satz 2 OR — Nachfolgeregel des aufgehobenen Art. 628 aOR).

**Wortlaut:**

> Die Gesellschaft übernimmt bei der Gründung von {{item.einleger}} als Sacheinlage: {{item.objektLabel}} ({{item.belegSatz}}), bewertet mit CHF {{item.wertFmt}}. Dafür werden {{item.aktien}} Namenaktien zu CHF {{nennwertFmt}} ausgegeben{{item.gutschriftKlauselSatz}}.

### 7. `AS07_verrechnung` — «Verrechnungsliberierung»

- [ ] **abgenommen** (David)
- **Norm:** Art. 634a Abs. 3 OR
- **Aufnahme:** hatVerrechnungen = true
- **Wiederholt über:** `verrListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Pflichtinhalt bei Verrechnungsliberierung: Betrag der Forderung, Name des Aktionärs, zukommende Aktien (Art. 634a Abs. 3 OR am Cache verifiziert). Eigenständige qualifizierte Liberierungsart — KEINE Sacheinlage; Werthaltigkeit der Forderung ist keine Voraussetzung (Art. 634a Abs. 2 OR).
- **Hinweis (offengelegt):** Die Generalversammlung kann diese Statutenbestimmung erst nach zehn Jahren aufheben (Art. 634a Abs. 3 Satz 2 OR).

**Wortlaut:**

> Bei der Gründung werden {{item.aktien}} Namenaktien zu CHF {{nennwertFmt}} durch Verrechnung mit einer Forderung von {{item.glaeubiger}} im Betrag von CHF {{item.forderungFmt}} liberiert.

### 8. `AS08_vorteile` — «Besondere Vorteile»

- [ ] **abgenommen** (David)
- **Norm:** Art. 636 OR
- **Aufnahme:** hatVorteile = true
- **Wiederholt über:** `vorteilListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Pflichtinhalt bei besonderen Vorteilen: begünstigte Personen mit Namen sowie Inhalt und Wert des gewährten Vorteils (Art. 636 OR am Cache verifiziert).

**Wortlaut:**

> Bei der Gründung wird {{item.beguenstigter}} folgender besonderer Vorteil gewährt: {{item.inhalt}} (Wert: CHF {{item.wertFmt}}).

### 9. `ASL20_zertifikate` — «Aktienzertifikate»

- [ ] **abgenommen** (David)
- **Aufnahme:** istLang = true
- **Begründung (Protokoll):** ZH-Langvorlage verbatim; gesetzlich nicht besonders geregelt — zulässige Ausgestaltung der Aktien als Wertpapiere (vgl. Art. 622 Abs. 1 OR), darum ohne Norm-Chip.

**Wortlaut:**

> Anstelle von einzelnen Aktien kann die Gesellschaft Zertifikate über mehrere Aktien ausstellen.

### 10. `ASL21_zerlegung` — «Zerlegung und Zusammenlegung von Aktien»

- [ ] **abgenommen** (David)
- **Norm:** Art. 623 OR
- **Aufnahme:** istLang = true
- **Begründung (Protokoll):** ZH-Langvorlage; Haus-Präzisierung (offengelegt): ZH sagt «der Zustimmung des Aktionärs» — Art. 623 Abs. 2 OR verlangt bei nicht kotierten Aktien die Zustimmung ALLER betroffenen Aktionäre.

**Wortlaut:**

> Die Generalversammlung kann bei unverändert bleibendem Aktienkapital durch Statutenänderung Aktien in solche von kleinerem Nennwert zerlegen oder zu solchen von grösserem Nennwert zusammenlegen; die Zusammenlegung bedarf der Zustimmung aller betroffenen Aktionäre.

### 11. `ASL22_aktienbuch` — «Aktienbuch»

- [ ] **abgenommen** (David)
- **Norm:** Art. 686 OR
- **Aufnahme:** istLang = true
- **Begründung (Protokoll):** ZH-Langvorlage verbatim (Aktienbuch-Führung und Legitimationswirkung, Art. 686 Abs. 1 und 4 OR).

**Wortlaut:**

> Der Verwaltungsrat führt über alle Namenaktien ein Aktienbuch, in welches die Eigentümer und Nutzniesser mit Namen und Adresse eingetragen werden.
> Im Verhältnis zur Gesellschaft gilt als Aktionär oder als Nutzniesser, wer im Aktienbuch eingetragen ist.

### 12. `AS10_vinkulierung` — «Übertragung der Aktien»

- [ ] **abgenommen** (David)
- **Norm:** Art. 685a und 685b OR
- **Aufnahme:** vinkulierung = true
- **Begründung (Protokoll):** Aufgenommen, weil die Vinkulierung gewählt wurde – Wortlaut der wortgleichen amtlichen Muster ZH/SG/GL (Escape-Klausel und Sonderregel besondere Erwerbsarten).

**Wortlaut:**

> Die Übertragung der Namenaktien oder die Begründung einer Nutzniessung an Namenaktien bedarf der Genehmigung durch den Verwaltungsrat.
> Der Verwaltungsrat kann das Gesuch um Zustimmung ablehnen, wenn er im Namen der Gesellschaft dem Veräusserer anbietet, die Aktien zum wirklichen Wert im Zeitpunkt des Gesuches zu übernehmen, oder wenn der Erwerber nicht ausdrücklich erklärt, dass er die Aktien im eigenen Namen und auf eigene Rechnung erworben hat.
> Werden Aktien durch Erbgang, Erbteilung, eheliches Güterrecht oder Zwangsvollstreckung erworben, so kann die Gesellschaft das Gesuch um Zustimmung nur ablehnen, wenn sie dem Erwerber die Übernahme der Aktien zum wirklichen Wert anbietet.

### 13. `ASL30_gv_befugnisse` — «Befugnisse der Generalversammlung»

- [ ] **abgenommen** (David)
- **Norm:** Art. 698 OR
- **Aufnahme:** istLang = true
- **Begründung (Protokoll):** ZH-Langvorlage verbatim — Befugnis-Katalog nach revidiertem Recht (inkl. Zwischendividende und Rückzahlung der gesetzlichen Kapitalreserve, Art. 698 Abs. 2 OR).

**Wortlaut:**

> Oberstes Organ der Gesellschaft ist die Generalversammlung der Aktionäre. Ihr stehen folgende unübertragbare Befugnisse zu:
> – die Festsetzung und Änderung der Statuten;
> – die Wahl der Mitglieder des Verwaltungsrates und der Revisionsstelle;
> – die Genehmigung des Lageberichts und der Konzernrechnung;
> – die Genehmigung der Jahresrechnung sowie die Beschlussfassung über die Verwendung des Bilanzgewinnes, insbesondere die Festsetzung der Dividende und der Tantieme;
> – die Festsetzung der Zwischendividende und die Genehmigung des dafür erforderlichen Zwischenabschlusses;
> – die Beschlussfassung über die Rückzahlung der gesetzlichen Kapitalreserve;
> – die Entlastung der Mitglieder des Verwaltungsrates;
> – die Beschlussfassung über die Gegenstände, die der Generalversammlung durch das Gesetz oder die Statuten vorbehalten sind.

### 14. `ASL31_einberufung` — «Einberufung und Traktandierung»

- [ ] **abgenommen** (David)
- **Norm:** Art. 700 OR
- **Aufnahme:** istLang = true
- **Begründung (Protokoll):** ZH-Langvorlage verbatim (inkl. Original-Interpunktion — Bug-Check B1, 7.6.2026). Norm-Kette: 6-Monats-Frist und Einberufungsrecht Art. 699 OR (10 % Abs. 3), Unterlagen-Zugänglichkeit Art. 699a OR, Traktandierungsrecht 5 % Art. 699b OR, Inhalt und Ankündigungs-Schranke Art. 700 OR.

**Wortlaut:**

> Die ordentliche Versammlung findet jährlich innerhalb von sechs Monaten nach Abschluss des Geschäftsjahres statt, ausserordentliche Versammlungen werden je nach Bedürfnis einberufen.
> Der Verwaltungsrat teilt den Aktionären die Einberufung der Generalversammlung mindestens 20 Tage vor dem Versammlungstag mit. Die Einberufung erfolgt durch den Verwaltungsrat, nötigenfalls durch die Revisionsstelle. Das Einberufungsrecht steht auch den Liquidatoren und den Vertretern der Anleihensgläubiger zu.
> Die Einberufung einer Generalversammlung kann auch von einem oder mehreren Aktionären, die zusammen über mindestens 10 Prozent des Aktienkapitals oder der Stimmen verfügen, verlangt werden. Sie müssen die Einberufung schriftlich verlangen. Die Verhandlungsgegenstände und Anträge müssen im Begehren enthalten sein.
> In der Einberufung sind das Datum, der Beginn, die Art und der Ort der Generalversammlung, die Verhandlungsgegenstände, die Anträge des Verwaltungsrates, gegebenenfalls die Anträge der Aktionäre samt kurzer Begründung sowie gegebenenfalls der Name und die Adresse des unabhängigen Stimmrechtsvertreters bekanntzugeben.
> Mindestens 20 Tage vor der ordentlichen Generalversammlung sind der Geschäftsbericht und die Revisionsberichte den Aktionären zugänglich zu machen. Sofern die Unterlagen nicht elektronisch zugänglich sind, kann jeder Aktionär verlangen, dass ihm diese rechtzeitig zugestellt werden. Jeder Aktionär kann während eines Jahres nach der Generalversammlung verlangen, dass ihm der Geschäftsbericht in der von der Generalversammlung genehmigten Form sowie die Revisionsberichte zugestellt werden, sofern die Unterlagen nicht elektronisch zugänglich sind.
> Aktionäre, die zusammen über mindestens 5 Prozent des Aktienkapitals oder der Stimmen verfügen, können die Traktandierung von Verhandlungsgegenständen oder die Aufnahme eines Antrages zu einem Verhandlungsgegenstand in die Einberufung der Generalversammlung verlangen.
> Über Anträge zu nicht gehörig angekündigten Verhandlungsgegenständen können keine Beschlüsse gefasst werden; ausgenommen sind Anträge auf Einberufung einer ausserordentlichen Generalversammlung, auf Durchführung einer Sonderuntersuchung und auf Wahl einer Revisionsstelle.

### 15. `AS13_beschlussfassung_virtuell` — «Beschlussfassungsarten der Aktionäre»

- [ ] **abgenommen** (David)
- **Norm:** Art. 701d OR
- **Aufnahme:** virtuelleGv = true
- **Begründung (Protokoll):** Beschlussfassungsarten-Artikel der amtlichen ZH-Kurzvorlage (Satz 1 verbatim); virtuelle GV braucht die statutarische Grundlage (Art. 701d OR), der Schriftweg-Satz gibt Art. 701 Abs. 3 OR wieder.
- **Hinweis (offengelegt):** Ein genereller statutarischer Verzicht auf die unabhängige Stimmrechtsvertretung ist unzulässig – zulässig ist nur die Einzelfall-Ermächtigung (EHRA-Praxismitteilung 1/23).

**Wortlaut:**

> Aktionäre können unter Beachtung der Einberufungs- und Traktandierungsvorschriften die Generalversammlungen vor Ort oder hybrid (vor Ort und virtuell) oder virtuell abhalten. Bei einer virtuellen Generalversammlung kann der Verwaltungsrat im Einzelfall auf die Bezeichnung einer unabhängigen Stimmrechtsvertretung verzichten.
> Sofern kein Aktionär oder dessen Vertretung eine mündliche Beratung an einer Generalversammlung verlangt, können die Aktionäre ihre Beschlüsse gemäss Art. 701 Abs. 3 OR auch auf schriftlichem Weg fassen.

### 16. `AS13_beschlussfassung` — «Beschlussfassungsarten der Aktionäre»

- [ ] **abgenommen** (David)
- **Norm:** Art. 701 Abs. 3 OR
- **Aufnahme:** virtuelleGv = false
- **Begründung (Protokoll):** Beschlussfassungsarten-Artikel der amtlichen ZH-Kurzvorlage ohne den Virtuell-Satz (keine 701d-Grundlage gewählt); der Schriftweg-Satz gibt geltendes Recht deklaratorisch wieder.

**Wortlaut:**

> Sofern kein Aktionär oder dessen Vertretung eine mündliche Beratung an einer Generalversammlung verlangt, können die Aktionäre ihre Beschlüsse gemäss Art. 701 Abs. 3 OR auch auf schriftlichem Weg fassen.

### 17. `ASL32_tagungsort` — «Generalversammlung mit Tagungsort»

- [ ] **abgenommen** (David)
- **Norm:** Art. 701a OR
- **Aufnahme:** istLang = true
- **Begründung (Protokoll):** ZH-Langvorlage verbatim (Tagungsort und mehrere Orte Art. 701a OR; Ausland mit Stimmrechtsvertreter-Statutengrundlage Art. 701b OR; elektronische Rechtsausübung Art. 701c OR).

**Wortlaut:**

> Der Verwaltungsrat bestimmt den Tagungsort der Generalversammlung. Durch die Festlegung des Tagungsortes darf für keinen Aktionär die Ausübung seiner Rechte im Zusammenhang mit der Generalversammlung in unsachlicher Weise erschwert werden.
> Die Generalversammlung kann an verschiedenen Orten gleichzeitig durchgeführt werden. Die Voten der Teilnehmer müssen in diesem Fall unmittelbar in Bild und Ton an sämtliche Tagungsorte übertragen werden.
> Die Generalversammlung kann im Ausland durchgeführt werden, wenn der Verwaltungsrat in der Einberufung einen unabhängigen Stimmrechtsvertreter bezeichnet. Der Verwaltungsrat kann auf die Bezeichnung eines unabhängigen Stimmrechtsvertreters verzichten, sofern alle Aktionäre damit einverstanden sind.
> Der Verwaltungsrat kann vorsehen, dass Aktionäre, die nicht am Ort der Generalversammlung anwesend sind, ihre Rechte auf elektronischem Weg ausüben können.

### 18. `ASL33_virtuell` — «Generalversammlung ohne Tagungsort (virtuell)»

- [ ] **abgenommen** (David)
- **Norm:** Art. 701d OR
- **Aufnahme:** istLang = true UND virtuelleGv = true
- **Begründung (Protokoll):** ZH-Langvorlage; Haus-Abweichung (offengelegt): Der ZH-Satz «Auf die Bezeichnung eines unabhängigen Stimmrechtsvertreters kann verzichtet werden» ist als EINZELFALL-Ermächtigung des VR gefasst — ein genereller statutarischer Verzicht ist unzulässig (EHRA-Praxismitteilung 1/23). Technik-Pannen-Klausel = Art. 701f OR sinngemäss.
- **Hinweis (offengelegt):** Nur mit der Weiche «virtuelle GV» — der Artikel selbst ist die statutarische Grundlage nach Art. 701d Abs. 1 OR.

**Wortlaut:**

> Eine Generalversammlung kann mit elektronischen Mitteln ohne Tagungsort durchgeführt werden. Der Verwaltungsrat kann im Einzelfall auf die Bezeichnung einer unabhängigen Stimmrechtsvertretung verzichten.
> Der Verwaltungsrat regelt die Verwendung elektronischer Mittel. Er stellt sicher, dass die Identität der Teilnehmer feststeht, die Voten in der Generalversammlung unmittelbar übertragen werden, jeder Teilnehmer Anträge stellen und sich an der Diskussion beteiligen kann und das Abstimmungsergebnis nicht verfälscht werden kann.
> Treten während der Generalversammlung technische Probleme auf, sodass die Generalversammlung nicht ordnungsgemäss durchgeführt werden kann, so muss sie wiederholt werden. Beschlüsse, welche die Generalversammlung vor dem Auftreten der technischen Probleme gefasst hat, bleiben gültig.

### 19. `ASL34_vorsitz` — «Vorsitz und Protokoll»

- [ ] **abgenommen** (David)
- **Norm:** Art. 702 OR
- **Aufnahme:** istLang = true
- **Begründung (Protokoll):** ZH-Langvorlage verbatim (Protokollführung und 30-Tage-Zugänglichkeit, Art. 702 Abs. 2 und 4 OR).

**Wortlaut:**

> Den Vorsitz in der Generalversammlung führt der Präsident, in dessen Verhinderungsfalle ein anderes vom Verwaltungsrat bestimmtes Mitglied desselben. Nimmt kein Mitglied des Verwaltungsrates teil, wählt die Generalversammlung einen Tagesvorsitzenden.
> Der Vorsitzende bezeichnet den Protokollführer und die Stimmenzähler, die nicht Aktionäre zu sein brauchen. Das Protokoll ist vom Vorsitzenden und vom Protokollführer zu unterzeichnen. Jeder Aktionär kann verlangen, dass ihm das Protokoll innerhalb von 30 Tagen nach der Generalversammlung zugänglich gemacht wird.

### 20. `ASL35_zirkular` — «Protokollierung von schriftlichen Beschlüssen der Aktionäre»

- [ ] **abgenommen** (David)
- **Norm:** Art. 701 Abs. 3 OR
- **Aufnahme:** istLang = true
- **Begründung (Protokoll):** ZH-Langvorlage verbatim (schriftliche Beschlussfassung Art. 701 Abs. 3 OR; Erwahrungsprotokoll-Praxis nach EHRA-Praxismitteilung 1/24).

**Wortlaut:**

> Aktionäre können schriftliche Beschlüsse auf dem Zirkularweg oder mittels schriftlicher Abstimmung fassen. Diese Beschlüsse können auf schriftlichem Weg auf Papier, mittels einer vom Verwaltungsrat bezeichneten elektronischen Plattform oder in elektronischer Form, welche den Nachweis in Textform vorsieht, gefasst werden.
> Ein Zirkularbeschluss ist von sämtlichen Aktionären zu unterzeichnen und mit der ausdrücklichen Feststellung eines Mitglieds des Verwaltungsrates zu ergänzen, dass die Beschlussfassung damit gültig zustande gekommen ist. Das Mitglied des Verwaltungsrates muss den Zirkularbeschluss mitunterzeichnen.
> Sofern die Aktionäre mittels schriftlicher Abstimmung einen Beschluss fassen, muss in einem Erwahrungsprotokoll des Verwaltungsrates der Ablauf der schriftlichen Beschlussfassung sowie das Abstimmungsergebnis festgehalten werden. Das Erwahrungsprotokoll ist vom Vorsitzenden und Protokollführer zu unterzeichnen.

### 21. `ASL36_stimmrecht` — «Stimmrecht und Vertretung»

- [ ] **abgenommen** (David)
- **Norm:** Art. 692 OR
- **Aufnahme:** istLang = true
- **Begründung (Protokoll):** ZH-Langvorlage verbatim (Stimmkraft nach Nennwert Art. 692 Abs. 1 OR; Legitimation/Vertretung Art. 689a Abs. 1 OR).

**Wortlaut:**

> Die Aktionäre üben ihr Stimmrecht in der Generalversammlung nach Verhältnis des gesamten Nennwerts der ihnen gehörenden Aktien aus.
> Die Mitgliedschaftsrechte aus Namenaktien kann ausüben, wer durch den Eintrag im Aktienbuch ausgewiesen oder vom Aktionär dazu schriftlich bevollmächtigt ist.

### 22. `ASL37_beschlussfassung` — «Beschlussfassung»

- [ ] **abgenommen** (David)
- **Norm:** Art. 703 und 704 OR
- **Aufnahme:** istLang = true
- **Begründung (Protokoll):** ZH-Langvorlage verbatim — Mehrheitserfordernis (Art. 703 OR), statutarischer Stichentscheid des Vorsitzenden sowie der qualifizierte Katalog nach revidiertem Recht (Art. 704 Abs. 1 OR, inkl. Währungswechsel, Kapitalband, Schiedsklausel, GV im Ausland, Sitzverlegung, Stimmrechtsvertreter-Verzicht) und die Verschärfungs-Schranke (Art. 704 Abs. 2 OR). Haus-Anmerkung (Bug-Check B2, 7.6.2026): Ziff. 12 des Gesetzeskatalogs (Dekotierung der Beteiligungspapiere) ist wie in der ZH-Vorlage bewusst weggelassen — sie betrifft nur Gesellschaften mit börsenkotierten Papieren.

**Wortlaut:**

> Die Generalversammlung fasst ihre Beschlüsse und vollzieht ihre Wahlen, soweit das Gesetz oder die Statuten es nicht anders bestimmen, mit der Mehrheit der vertretenen Aktienstimmen. Bei Stimmengleichheit hat der Vorsitzende den Stichentscheid.
> Ein Beschluss der Generalversammlung, der mindestens zwei Drittel der vertretenen Stimmen und die Mehrheit der vertretenen Aktiennennwerte auf sich vereinigt, ist erforderlich für:
> – die Änderung des Gesellschaftszweckes;
> – die Zusammenlegung von Aktien, soweit dafür nicht die Zustimmung aller betroffenen Aktionäre erforderlich ist;
> – die Kapitalerhöhung aus Eigenkapital, gegen Sacheinlagen oder durch Verrechnung mit einer Forderung und die Gewährung von besonderen Vorteilen;
> – die Einschränkung oder Aufhebung des Bezugsrechts;
> – die Einführung eines bedingten Kapitals oder die Einführung eines Kapitalbands;
> – die Umwandlung von Partizipationsscheinen in Aktien;
> – die Beschränkung der Übertragbarkeit von Namenaktien;
> – die Einführung von Stimmrechtsaktien;
> – den Wechsel der Währung des Aktienkapitals;
> – die Einführung des Stichentscheids des Vorsitzenden in der Generalversammlung;
> – eine Statutenbestimmung zur Durchführung der Generalversammlung im Ausland;
> – die Verlegung des Sitzes der Gesellschaft;
> – die Einführung einer statutarischen Schiedsklausel;
> – den Verzicht auf die Bezeichnung eines unabhängigen Stimmrechtsvertreters für die Durchführung einer virtuellen Generalversammlung bei Gesellschaften, deren Aktien nicht an einer Börse kotiert sind;
> – die Auflösung der Gesellschaft.
> Statutenbestimmungen, die für die Fassung bestimmter Beschlüsse grössere Mehrheiten als die vom Gesetz vorgeschriebenen festlegen, können nur mit dem vorgesehenen Mehr eingeführt, geändert oder aufgehoben werden.

### 23. `ASL40_vr_wahl` — «Wahl und Zusammensetzung des Verwaltungsrates»

- [ ] **abgenommen** (David)
- **Norm:** Art. 710 OR
- **Aufnahme:** istLang = true
- **Begründung (Protokoll):** ZH-Langvorlage verbatim (ein oder mehrere Mitglieder Art. 707 Abs. 1 OR; Amtsdauer drei Jahre Art. 710 Abs. 2 OR; Selbstkonstituierung Art. 712 Abs. 2 OR).

**Wortlaut:**

> Der Verwaltungsrat der Gesellschaft besteht aus einem oder mehreren Mitgliedern.
> Die Mitglieder des Verwaltungsrates werden auf drei Jahre gewählt. Neugewählte treten in die Amtsdauer derjenigen Mitglieder ein, die sie ersetzen.
> Der Verwaltungsrat konstituiert sich selbst. Er bezeichnet seinen Präsidenten und den Sekretär. Dieser muss dem Verwaltungsrat nicht angehören.

### 24. `ASL41_vr_sitzungen` — «Sitzungen und Beschlussfassung des Verwaltungsrates»

- [ ] **abgenommen** (David)
- **Norm:** Art. 713 OR
- **Aufnahme:** istLang = true
- **Begründung (Protokoll):** ZH-Langvorlage verbatim (Einberufungsrecht Art. 715 OR; Beschlussformen und Protokoll Art. 713 OR).

**Wortlaut:**

> Beschlussfähigkeit, Beschlussfassung und Geschäftsordnung werden im Organisationsreglement geregelt. Jedes Mitglied des Verwaltungsrates kann unter Angabe der Gründe vom Präsidenten die unverzügliche Einberufung einer Sitzung verlangen.
> Bei der Beschlussfassung in Sitzungen des Verwaltungsrates hat der Vorsitzende den Stichentscheid. Beschlüsse können auch auf dem Wege der schriftlichen Zustimmung oder in elektronischer Form zu einem gestellten Antrag gefasst werden, sofern nicht ein Mitglied die mündliche Beratung verlangt.
> Über die Verhandlungen und Beschlüsse ist ein Protokoll zu führen, das vom Vorsitzenden und vom Sekretär unterzeichnet wird.

### 25. `ASL42_vr_zirkular` — «Protokollierung von Beschlüssen des Verwaltungsrates»

- [ ] **abgenommen** (David)
- **Norm:** Art. 713 Abs. 2 OR
- **Aufnahme:** istLang = true
- **Begründung (Protokoll):** ZH-Langvorlage verbatim (Beschlussformen Art. 713 Abs. 2 OR; Erwahrungsprotokoll-Praxis nach EHRA-Praxismitteilung 1/24).

**Wortlaut:**

> Der Verwaltungsrat kann auf dem Zirkularweg oder mittels schriftlicher Abstimmung Beschluss fassen. Diese Beschlüsse können auf schriftlichem Weg auf Papier, mittels einer vom Verwaltungsrat bezeichneten elektronischen Plattform oder in elektronischer Form, welche den Nachweis in Textform vorsieht, gefasst werden.
> Ein Zirkularbeschluss ist von sämtlichen Mitgliedern des Verwaltungsrates zu unterzeichnen.
> Sofern die Mitglieder des Verwaltungsrates mittels schriftlicher Abstimmung einen Beschluss fassen, muss in einem Erwahrungsprotokoll des Verwaltungsrates der Ablauf der schriftlichen Beschlussfassung sowie das Abstimmungsergebnis festgehalten werden. Das Erwahrungsprotokoll ist vom Vorsitzenden und Protokollführer zu unterzeichnen.

### 26. `ASL43_vr_auskunft` — «Recht auf Auskunft und Einsicht»

- [ ] **abgenommen** (David)
- **Norm:** Art. 715a OR
- **Aufnahme:** istLang = true
- **Begründung (Protokoll):** ZH-Langvorlage verbatim (Wiedergabe von Art. 715a Abs. 1–6 OR).

**Wortlaut:**

> Jedes Mitglied des Verwaltungsrates kann Auskunft über alle Angelegenheiten der Gesellschaft verlangen.
> In den Sitzungen sind alle Mitglieder des Verwaltungsrates sowie die mit der Geschäftsführung betrauten Personen zur Auskunft verpflichtet.
> Ausserhalb der Sitzungen kann jedes Mitglied von den mit der Geschäftsführung betrauten Personen Auskunft über den Geschäftsgang und, mit Ermächtigung des Präsidenten, auch über einzelne Geschäfte verlangen.
> Soweit es für die Erfüllung einer Aufgabe erforderlich ist, kann jedes Mitglied dem Präsidenten beantragen, dass ihm Bücher und Akten vorgelegt werden.
> Weist der Präsident ein Gesuch auf Auskunft, Anhörung oder Einsicht ab, so entscheidet der Verwaltungsrat.
> Regelungen oder Beschlüsse des Verwaltungsrates, die das Recht auf Auskunft und Einsichtnahme der Verwaltungsräte erweitern, bleiben vorbehalten.

### 27. `ASL44_vr_aufgaben` — «Aufgaben des Verwaltungsrates»

- [ ] **abgenommen** (David)
- **Norm:** Art. 716a OR
- **Aufnahme:** istLang = true
- **Begründung (Protokoll):** ZH-Langvorlage verbatim (Vermutungskompetenz Art. 716 OR; unübertragbare Aufgaben Art. 716a Abs. 1 OR; Ausschüsse Art. 716a Abs. 2 OR).

**Wortlaut:**

> Der Verwaltungsrat kann in allen Angelegenheiten Beschluss fassen, die nicht nach Gesetz oder Statuten der Generalversammlung zugeteilt sind. Er führt die Geschäfte der Gesellschaft, soweit er die Geschäftsführung nicht übertragen hat.
> Der Verwaltungsrat hat folgende unübertragbare und unentziehbare Aufgaben:
> – die Oberleitung der Gesellschaft und die Erteilung der nötigen Weisungen;
> – die Festlegung der Organisation;
> – die Ausgestaltung des Rechnungswesens, der Finanzkontrolle sowie der Finanzplanung, sofern diese für die Führung der Gesellschaft notwendig ist;
> – die Ernennung und Abberufung der mit der Geschäftsführung und der Vertretung betrauten Personen;
> – die Oberaufsicht über die mit der Geschäftsführung betrauten Personen, namentlich im Hinblick auf die Befolgung der Gesetze, Statuten, Reglemente und Weisungen;
> – die Erstellung des Geschäftsberichtes sowie die Vorbereitung der Generalversammlung und die Ausführung ihrer Beschlüsse;
> – die Einreichung eines Gesuchs um Nachlassstundung und die Benachrichtigung des Gerichts im Falle der Überschuldung.
> Der Verwaltungsrat kann die Vorbereitung und die Ausführung seiner Beschlüsse oder die Überwachung von Geschäften Ausschüssen oder einzelnen Mitgliedern zuweisen. Er hat für eine angemessene Berichterstattung an seine Mitglieder zu sorgen.

### 28. `ASL45_vr_delegation` — «Übertragung der Geschäftsführung und der Vertretung»

- [ ] **abgenommen** (David)
- **Norm:** Art. 716b OR
- **Aufnahme:** istLang = true
- **Begründung (Protokoll):** ZH-Langvorlage (Delegation Art. 716b OR; Vertretung Art. 718 Abs. 2–4 OR). Haus-Korrektur (offengelegt): ZH schreibt «an einzelnen Mitgliedern oder an Dritten» — grammatisch richtig ist der Akkusativ «an einzelne Mitglieder oder an Dritte».

**Wortlaut:**

> Der Verwaltungsrat kann die Geschäftsführung nach Massgabe eines Organisationsreglementes ganz oder zum Teil an einzelne Mitglieder oder an Dritte übertragen (Geschäftsleitung).
> Das Organisationsreglement ordnet die Geschäftsführung, bestimmt die hierfür erforderlichen Stellen, umschreibt deren Aufgaben und regelt insbesondere die Berichterstattung.
> Soweit die Geschäftsführung nicht übertragen worden ist, steht sie allen Mitgliedern des Verwaltungsrates gesamthaft zu.
> Der Verwaltungsrat kann die Vertretung einem oder mehreren Mitgliedern (Delegierte) oder Dritten (Direktoren) übertragen. Mindestens ein Mitglied des Verwaltungsrates muss zur Vertretung befugt sein. Die Gesellschaft muss durch eine Person vertreten werden können, die Wohnsitz in der Schweiz hat.

### 29. `ASL50_revision` — «Revision»

- [ ] **abgenommen** (David)
- **Norm:** Art. 727a OR
- **Aufnahme:** istLang = true
- **Begründung (Protokoll):** ZH-Langvorlage; Haus-Abweichung (offengelegt): Der ZH-Binnenverweis «die Beschlüsse nach Art. 8 Ziff. 3 bis 6» ist durch die inhaltliche Umschreibung ersetzt (Genehmigung der Jahresrechnung, Verwendung des Bilanzgewinnes — Art. 731 Abs. 1 OR), weil die Artikelnummerierung der Haus-Statuten dynamisch ist.

**Wortlaut:**

> Die Generalversammlung wählt eine Revisionsstelle. Sie kann auf die Wahl einer Revisionsstelle verzichten, wenn:
> – die Gesellschaft nicht zur ordentlichen Revision verpflichtet ist;
> – sämtliche Aktionäre zustimmen; und
> – die Gesellschaft nicht mehr als zehn Vollzeitstellen im Jahresdurchschnitt hat.
> Der Verzicht gilt auch für die nachfolgenden Jahre. Jeder Aktionär hat jedoch das Recht, spätestens zehn Tage vor der Generalversammlung die Durchführung einer eingeschränkten Revision und die Wahl einer entsprechenden Revisionsstelle zu verlangen. Die Generalversammlung darf diesfalls die Beschlüsse über die Genehmigung der Jahresrechnung und die Verwendung des Bilanzgewinnes erst fassen, wenn der Revisionsbericht vorliegt.

### 30. `ASL51_rs_anforderungen` — «Anforderungen an die Revisionsstelle»

- [ ] **abgenommen** (David)
- **Norm:** Art. 727b OR
- **Aufnahme:** istLang = true
- **Begründung (Protokoll):** ZH-Langvorlage (Wählbarkeit Art. 730 OR; ordentliche/eingeschränkte Revision Art. 727b/727c OR; Unabhängigkeit Art. 728/729 OR; Abberufung Art. 730a OR). Haus-Abweichungen (offengelegt): ZH-Binnenverweis «nach Artikel 23» durch «gemäss dem vorstehenden Artikel» ersetzt (dynamische Nummerierung); die Amtsdauer «für ein Geschäftsjahr» ist eine statutarische Festlegung INNERHALB der gesetzlichen Bandbreite von Art. 730a Abs. 1 OR (ein bis drei Geschäftsjahre — Bug-Check B3, 7.6.2026).

**Wortlaut:**

> Als Revisionsstelle können eine oder mehrere natürliche oder juristische Personen oder Personengesellschaften gewählt werden.
> Die Revisionsstelle muss ihren Wohnsitz, ihren Sitz oder eine eingetragene Zweigniederlassung in der Schweiz haben. Hat die Gesellschaft mehrere Revisionsstellen, so muss zumindest eine diese Voraussetzungen erfüllen.
> Ist die Gesellschaft zur ordentlichen Revision verpflichtet, so muss die Generalversammlung als Revisionsstelle einen zugelassenen Revisionsexperten bzw. ein staatlich beaufsichtigtes Revisionsunternehmen nach den Vorschriften des Revisionsaufsichtsgesetzes vom 16. Dezember 2005 wählen.
> Ist die Gesellschaft zur eingeschränkten Revision verpflichtet, so muss die Generalversammlung als Revisionsstelle einen zugelassenen Revisor nach den Vorschriften des Revisionsaufsichtsgesetzes vom 16. Dezember 2005 wählen. Vorbehalten bleibt der Verzicht auf die Wahl einer Revisionsstelle gemäss dem vorstehenden Artikel.
> Die Revisionsstelle muss nach Art. 728 bzw. 729 OR unabhängig sein.
> Die Revisionsstelle wird für ein Geschäftsjahr gewählt. Ihr Amt endet mit der Abnahme der letzten Jahresrechnung. Eine Wiederwahl ist möglich. Die Generalversammlung kann die Revisionsstelle nur aus wichtigen Gründen abberufen.

### 31. `AS15_geschaeftsjahr` — «Geschäftsjahr und Buchführung»

- [ ] **abgenommen** (David)
- **Norm:** Art. 958 Abs. 2 OR
- **Aufnahme:** immer
- **Begründung (Protokoll):** Geschäftsjahr-Artikel der amtlichen ZH-Kurzvorlage (verbatim; kein Pflichtinhalt nach Art. 626 OR, aber Standard aller amtlichen Muster). Der Norm-Anker deckt die Jahresrechnungs-Bestandteile des zweiten Satzes (Bilanz, Erfolgsrechnung, Anhang — Art. 958 Abs. 2 OR); das Geschäftsjahr selbst ist gesetzlich nicht fixiert (Bug-Check-Befund 5, 7.6.2026).

**Wortlaut:**

> Das Geschäftsjahr beginnt am {{gjBeginnTxt}} und endet am {{gjEndeTxt}}.
> Die Jahresrechnung, bestehend aus Erfolgsrechnung, Bilanz und Anhang, ist gemäss den Vorschriften des Schweizerischen Obligationenrechts, insbesondere der Art. 957 ff., zu erstellen.

### 32. `ASL60_reserven` — «Reserven und Gewinnverwendung»

- [ ] **abgenommen** (David)
- **Norm:** Art. 672 OR
- **Aufnahme:** istLang = true
- **Begründung (Protokoll):** ZH-Langvorlage verbatim (gesetzliche Gewinnreserve Art. 672 OR; der Sammelverweis «Art. 671 ff. OR» umfasst den ganzen Reserven-Abschnitt inkl. der gesetzlichen Kapitalreserve Art. 671 OR).

**Wortlaut:**

> Aus dem Jahresgewinn ist zuerst die Zuweisung an die gesetzliche Gewinnreserve entsprechend den Vorschriften des Gesetzes vorzunehmen. Der Bilanzgewinn steht zur Verfügung der Generalversammlung, die ihn im Rahmen der gesetzlichen Auflagen (insbesondere Art. 671 ff. OR) nach freiem Ermessen verwenden kann.

### 33. `ASL61_aufloesung` — «Auflösung und Liquidation»

- [ ] **abgenommen** (David)
- **Norm:** Art. 736 OR
- **Aufnahme:** istLang = true
- **Begründung (Protokoll):** ZH-Langvorlage verbatim (Auflösungsbeschluss mit öffentlicher Urkunde Art. 736 Abs. 1 Ziff. 2 OR; Liquidatoren Art. 740 OR; Verteilung nach einbezahlten Beträgen Art. 745 Abs. 1 OR).

**Wortlaut:**

> Die Auflösung der Gesellschaft kann durch einen Beschluss der Generalversammlung, über den eine öffentliche Urkunde zu errichten ist, erfolgen.
> Die Liquidation wird durch den Verwaltungsrat besorgt, falls sie nicht durch einen Beschluss der Generalversammlung anderen Personen übertragen wird. Die Liquidation erfolgt gemäss Art. 742 ff. OR.
> Das Vermögen der aufgelösten Gesellschaft wird nach Tilgung ihrer Schulden nach Massgabe der einbezahlten Beträge unter die Aktionäre verteilt.

### 34. `AS04_mitteilungen` — «Mitteilungen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 626 Abs. 1 Ziff. 7 OR
- **Aufnahme:** immer
- **Begründung (Protokoll):** Pflichtinhalt Form der Mitteilungen (rev. 2023; Wortlaut ZH/SG).

**Wortlaut:**

> Mitteilungen der Gesellschaft an die Aktionärinnen und Aktionäre erfolgen per Brief oder E-Mail an die im Aktienbuch verzeichneten Adressen.

---

## Öffentliche Urkunde über den Errichtungsakt

Schema `ag-errichtungsakt` · Version 1.0.0 (Rechtsstand OR 1.1.2026; Wortlaut-Dossier 7.6.2026) · Format verfuegung · Ausgabe entwurf

> **Disclaimer (Fusszeile):** Erstellt mit LexMetrik – keine Rechtsberatung. ENTWURF zur Vorbereitung des Beurkundungstermins: Der Errichtungsakt der AG bedarf der öffentlichen Beurkundung (Art. 629 Abs. 1 OR); die Urkunde entsteht bei der Urkundsperson. Gliederung und Wortlaute nach den amtlichen Vorlagen ZH/SG (2023/2024).


### 1. `AE01_ingress`

- [ ] **abgenommen** (David)
- **Norm:** Art. 44 lit. a HRegV
- **Aufnahme:** einGruender = false
- **Begründung (Protokoll):** Urkunden-Ingress mit Personalien-Block (Art. 44 lit. a HRegV).

**Wortlaut:**

> Gründung der {{firma}} mit Sitz in {{sitz}}
>
> Vor der unterzeichnenden Urkundsperson sind heute erschienen:

### 2. `AE01_ingress_singular`

- [ ] **abgenommen** (David)
- **Norm:** Art. 44 lit. a HRegV
- **Aufnahme:** einGruender = true
- **Begründung (Protokoll):** Urkunden-Ingress im Singular (D1: Einpersonen-Gründung ist in der Einzahl abzufassen — Erläuterung der ZH-Vorlagen; eigenständige Singular-Vorlage 3.5).

**Wortlaut:**

> Gründung der {{firma}} mit Sitz in {{sitz}}
>
> Vor der unterzeichnenden Urkundsperson ist heute erschienen:

### 3. `AE02_gruenderliste`

- [ ] **abgenommen** (David)
- **Norm:** Art. 44 lit. a HRegV
- **Aufnahme:** immer
- **Wiederholt über:** `gruenderListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Personenangaben zu allen Gründerinnen und Gründern.

**Wortlaut:**

> – {{item.name}}{{item.angabenZeile}}

### 4. `AE03_erklaerung` — «Gründungserklärung und Statuten»

- [ ] **abgenommen** (David)
- **Norm:** Art. 629 Abs. 1 OR
- **Aufnahme:** einGruender = false
- **Begründung (Protokoll):** Gründungserklärung und Statutenfestlegung in der öffentlichen Urkunde (Art. 44 lit. b und c HRegV).

**Wortlaut:**

> Die erschienenen Personen erklären, eine Aktiengesellschaft unter der Firma {{firma}} mit Sitz in {{sitz}} zu gründen, und legen hiermit die beiliegenden Statuten fest, die Bestandteil dieser Urkunde bilden.

### 5. `AE03_erklaerung_singular` — «Gründungserklärung und Statuten»

- [ ] **abgenommen** (David)
- **Norm:** Art. 629 Abs. 1 OR
- **Aufnahme:** einGruender = true
- **Begründung (Protokoll):** Gründungserklärung im Singular (D1; ZH-Vorlage 3.5: «gründe ich» — Haus-Fassung in der dritten Person wie die Plural-Fassung).

**Wortlaut:**

> Die erschienene Person erklärt, eine Aktiengesellschaft unter der Firma {{firma}} mit Sitz in {{sitz}} zu gründen, und legt hiermit die beiliegenden Statuten fest, die Bestandteil dieser Urkunde bilden.

### 6. `AE04_zeichnung` — «Aktienkapital und Zeichnung»

- [ ] **abgenommen** (David)
- **Norm:** Art. 630 Ziff. 1 OR
- **Aufnahme:** immer
- **Begründung (Protokoll):** Zeichnung mit Anzahl, Nennwert, Art und Ausgabebetrag – bei der Gründung in der Urkunde selbst (Art. 44 lit. d HRegV); Ausgabebetrag = Nennwert plus allfälliges Agio (Etappe 3.2/D7; Checkliste Errichtungsakt zu Art. 630 OR).

**Wortlaut:**

> Das Aktienkapital der Gesellschaft beträgt {{waehrungCode}} {{akFmt}} und ist eingeteilt in {{anzahlAktien}} Namenaktien zu je {{waehrungCode}} {{nennwertFmt}} (Nennwert), welche zum Ausgabebetrag von {{waehrungCode}} {{ausgabeFmt}} je Aktie wie folgt gezeichnet werden:

### 7. `AE05_zeichnungsliste`

- [ ] **abgenommen** (David)
- **Norm:** Art. 44 lit. d HRegV
- **Aufnahme:** immer
- **Wiederholt über:** `gruenderListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Zeichnungserklärung jeder Gründerin / jedes Gründers.

**Wortlaut:**

> – {{item.name}}: {{item.anzahl}} Namenaktien

### 8. `AE05b_verpflichtung`

- [ ] **abgenommen** (David)
- **Norm:** Art. 630 Ziff. 2 OR
- **Aufnahme:** einGruender = false
- **Begründung (Protokoll):** Bedingungslose Einlage-Verpflichtung als Gültigkeitserfordernis der Zeichnung (ZH-Urkunde wortgleich).

**Wortlaut:**

> Jede Gründerin und jeder Gründer verpflichtet sich hiermit bedingungslos, die dem Ausgabebetrag der gezeichneten Aktien entsprechende Einlage zu leisten.

### 9. `AE05b_verpflichtung_singular`

- [ ] **abgenommen** (David)
- **Norm:** Art. 630 Ziff. 2 OR
- **Aufnahme:** einGruender = true
- **Begründung (Protokoll):** Einlage-Verpflichtung im Singular (D1; ZH-Vorlage 3.5: «Der Gründer verpflichtet sich hiermit bedingungslos …»).

**Wortlaut:**

> Die Gründerin bzw. der Gründer verpflichtet sich hiermit bedingungslos, die dem Ausgabebetrag der gezeichneten Aktien entsprechende Einlage zu leisten.

### 10. `AE07_einlagen_voll_bank` — «Einlagen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 633 OR
- **Aufnahme:** nurBar = true UND vollLiberiert = true UND bankInUrkundeGenannt = true
- **Begründung (Protokoll):** Volliberierung in Geld mit Banknennung in der Urkunde (separate Bescheinigung entfällt, Art. 43 Abs. 1 lit. f HRegV); nur bei der reinen Bargründung («Sämtliche Einlagen»).

**Wortlaut:**

> Sämtliche Einlagen von gesamthaft {{waehrungCode}} {{einlagenTotalFmt}} wurden in Geld geleistet und sind bei der {{bankName}}, {{bankOrt}}, einer Bank nach Art. 1 des Bundesgesetzes über die Banken und Sparkassen, zur ausschliesslichen Verfügung der Gesellschaft hinterlegt.

### 11. `AE07_einlagen_voll_bescheinigung` — «Einlagen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 633 OR
- **Aufnahme:** nurBar = true UND vollLiberiert = true UND bankInUrkundeGenannt = false
- **Begründung (Protokoll):** Volliberierung in Geld mit separater Bankbescheinigung als Beleg; nur bei der reinen Bargründung.

**Wortlaut:**

> Sämtliche Einlagen von gesamthaft {{waehrungCode}} {{einlagenTotalFmt}} wurden in Geld geleistet und gemäss separater Bescheinigung bei einer Bank nach Art. 1 des Bundesgesetzes über die Banken und Sparkassen zur ausschliesslichen Verfügung der Gesellschaft hinterlegt.

### 12. `AE07_einlagen_teil_bank` — «Einlagen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 632 OR
- **Aufnahme:** teilGleich = true UND bankInUrkundeGenannt = true
- **Begründung (Protokoll):** Teilliberierung mit EINHEITLICHEM Grad (mind. 20 % je Aktie, gesamthaft mind. CHF 50'000); individuelle Grade je Gründer in der eigenen Variante (Etappe 3.3).

**Wortlaut:**

> Auf dem Aktienkapital wurden Einlagen von gesamthaft {{waehrungCode}} {{einbezahltFmt}} ({{liberierungProzent}} % des Nennwerts jeder Aktie) in Geld geleistet und bei der {{bankName}}, {{bankOrt}}, einer Bank nach Art. 1 des Bundesgesetzes über die Banken und Sparkassen, zur ausschliesslichen Verfügung der Gesellschaft hinterlegt.

### 13. `AE07_einlagen_teil_bescheinigung` — «Einlagen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 632 OR
- **Aufnahme:** teilGleich = true UND bankInUrkundeGenannt = false
- **Begründung (Protokoll):** Teilliberierung (einheitlich) mit separater Bankbescheinigung.

**Wortlaut:**

> Auf dem Aktienkapital wurden Einlagen von gesamthaft {{waehrungCode}} {{einbezahltFmt}} ({{liberierungProzent}} % des Nennwerts jeder Aktie) in Geld geleistet und gemäss separater Bescheinigung bei einer Bank nach Art. 1 des Bundesgesetzes über die Banken und Sparkassen zur ausschliesslichen Verfügung der Gesellschaft hinterlegt.

### 14. `AE07i_einlagen_individuell_bank` — «Einlagen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 632 OR
- **Aufnahme:** teilIndividuell = true UND bankInUrkundeGenannt = true
- **Begründung (Protokoll):** Teilliberierung mit individuellen Graden nach ZH-Urkunde 3.1 («Dadurch ist das Aktienkapital teilweise liberiert worden, nämlich a) … Aktien des Gründers … zu … %»).

**Wortlaut:**

> Auf dem Aktienkapital wurden Einlagen von gesamthaft {{waehrungCode}} {{einbezahltFmt}} in Geld geleistet und bei der {{bankName}}, {{bankOrt}}, einer Bank nach Art. 1 des Bundesgesetzes über die Banken und Sparkassen, zur ausschliesslichen Verfügung der Gesellschaft hinterlegt. Dadurch ist das Aktienkapital teilweise liberiert worden, nämlich:

### 15. `AE07i_einlagen_individuell_bescheinigung` — «Einlagen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 632 OR
- **Aufnahme:** teilIndividuell = true UND bankInUrkundeGenannt = false
- **Begründung (Protokoll):** Individuelle Teilliberierung mit separater Bankbescheinigung.

**Wortlaut:**

> Auf dem Aktienkapital wurden Einlagen von gesamthaft {{waehrungCode}} {{einbezahltFmt}} in Geld geleistet und gemäss separater Bescheinigung bei einer Bank nach Art. 1 des Bundesgesetzes über die Banken und Sparkassen zur ausschliesslichen Verfügung der Gesellschaft hinterlegt. Dadurch ist das Aktienkapital teilweise liberiert worden, nämlich:

### 16. `AE07i_liste`

- [ ] **abgenommen** (David)
- **Norm:** Art. 632 Abs. 1 OR
- **Aufnahme:** teilIndividuell = true
- **Wiederholt über:** `gruenderTeilListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Je Gründerin/Gründer eine Liberierungs-Zeile (ZH-Urkunde 3.1 Teilliberierungs-Variante; Haus-Fassung geschlechtsneutral «Aktien von» statt «Aktien des Gründers»).

**Wortlaut:**

> – {{item.anzahl}} Aktien von {{item.name}} zu {{item.prozentTxt}} %

### 17. `AE07w_kurs`

- [ ] **abgenommen** (David)
- **Norm:** Art. 629 Abs. 3 OR
- **Aufnahme:** fremdwaehrungAktiv = true
- **Begründung (Protokoll):** Pflicht-Kurs-Satz der Fremdwährungs-Gründung nach ZH-Urkundenvorlage 3.2 verbatim — inkl. «per» (Bug-Check 3.1 Befund 1; Art. 629 Abs. 3 OR: angewandte Umrechnungskurse sind in der Urkunde anzugeben). Erstausbau: Einlagewährung = Kapitalwährung (Einlagen in anderer Währung als das Kapital = Stufe 2).

**Wortlaut:**

> Die geleisteten Einlagen entsprechen, aufgrund des Umrechnungskurses per {{waehrungCode}} 1.00 = CHF {{kursTxt}}, dem Betrag von CHF {{einbezahltChfFmt}}. Dieser Umrechnungskurs entspricht dem Devisenmittelkurs der {{kursQuelleTxt}}.

### 18. `AE07g_geld_bank` — «Einlagen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 633 OR
- **Aufnahme:** istGemischt = true UND hatBarEinlage = true UND bankInUrkundeGenannt = true
- **Begründung (Protokoll):** Bar-Anteil der gemischten Gründung (ZH-Bemerkung 3.3: Varianten «mit Ziff. IV der Textvorlage 3.1 kombinierbar»); Banknennung in der Urkunde.

**Wortlaut:**

> Auf {{barAktienTxt}} Namenaktien wurden Einlagen von gesamthaft CHF {{barEinlageFmt}} in Geld geleistet und bei der {{bankName}}, {{bankOrt}}, einer Bank nach Art. 1 des Bundesgesetzes über die Banken und Sparkassen, zur ausschliesslichen Verfügung der Gesellschaft hinterlegt.

### 19. `AE07g_geld_bescheinigung` — «Einlagen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 633 OR
- **Aufnahme:** istGemischt = true UND hatBarEinlage = true UND bankInUrkundeGenannt = false
- **Begründung (Protokoll):** Bar-Anteil der gemischten Gründung mit separater Bankbescheinigung.

**Wortlaut:**

> Auf {{barAktienTxt}} Namenaktien wurden Einlagen von gesamthaft CHF {{barEinlageFmt}} in Geld geleistet und gemäss separater Bescheinigung bei einer Bank nach Art. 1 des Bundesgesetzes über die Banken und Sparkassen zur ausschliesslichen Verfügung der Gesellschaft hinterlegt.

### 20. `AE07q_intro_mit_titel` — «Einlagen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 629 Abs. 2 Ziff. 4 OR
- **Aufnahme:** hatQualifiziert = true UND hatBarEinlage = false
- **Begründung (Protokoll):** Einleitung des qualifizierten Einlagen-Blocks nach ZH-Urkunde 3.3 («Die in den Statuten angegebenen Sacheinlagen gemäss folgenden, uns vorliegenden Unterlagen» — Haus-Fassung ohne «uns», dritte Person); trägt die Abschnitts-Überschrift, wenn kein Bar-Absatz vorangeht.

**Wortlaut:**

> {{qualifiziertIntro}}

### 21. `AE07q_intro`

- [ ] **abgenommen** (David)
- **Norm:** Art. 629 Abs. 2 Ziff. 4 OR
- **Aufnahme:** hatQualifiziert = true UND hatBarEinlage = true
- **Begründung (Protokoll):** Einleitung des qualifizierten Einlagen-Blocks (gemischte Gründung — folgt dem Bar-Absatz unter derselben Ziffer).

**Wortlaut:**

> {{qualifiziertIntro}}

### 22. `AE07q_sachliste`

- [ ] **abgenommen** (David)
- **Norm:** Art. 634 OR
- **Aufnahme:** hatSacheinlagen = true
- **Wiederholt über:** `sachListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Je Sacheinlage eine Beleg-Zeile nach ZH-Urkunde 3.3 inkl. Grundstücks-Weiche (Art. 634 Abs. 1 Ziff. 3 OR: «sofort als Eigentümerin verfügen» vs. «bedingungsloser Anspruch auf Eintragung in das Grundbuch»).

**Wortlaut:**

> – Sacheinlagevertrag vom {{item.vertragDatumFmt}} mit {{item.einleger}} über {{item.objektLabel}} ({{item.belegSatz}}; Bewertung CHF {{item.wertFmt}} für {{item.aktien}} Namenaktien{{item.gutschriftKlauselSatz}}), welcher genehmigt wird, mit der Bestätigung, dass die Gesellschaft nach ihrer Eintragung in das Handelsregister {{item.verfuegungsSatz}}.

### 23. `AE07q_verrliste`

- [ ] **abgenommen** (David)
- **Norm:** Art. 634a OR
- **Aufnahme:** hatVerrechnungen = true
- **Wiederholt über:** `verrListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Je Verrechnungsliberierung eine Zeile — Haus-Fassung (die ZH-Vorlage kennt die Verrechnung nur in der Geschäftsübernahme-Variante; die generische Fassung deckt Art. 634a Abs. 1 OR, Bestand/Verrechenbarkeit belegt der Gründungsbericht, Art. 635 Ziff. 2 OR).

**Wortlaut:**

> – Verrechnungsliberierung: {{item.aktien}} Namenaktien werden durch Verrechnung mit einer Forderung von {{item.glaeubiger}} im Betrag von CHF {{item.forderungFmt}} liberiert (Art. 634a OR).

### 24. `AE07q_vorteile`

- [ ] **abgenommen** (David)
- **Norm:** Art. 636 OR
- **Aufnahme:** hatVorteile = true
- **Begründung (Protokoll):** Zusatz-Variante besondere Vorteile nach ZH-Urkunde 3.3.

**Wortlaut:**

> Ferner werden bei der Gründung die in den Statuten umschriebenen besonderen Vorteile gewährt.

### 25. `AE07q_bericht`

- [ ] **abgenommen** (David)
- **Norm:** Art. 635a OR
- **Aufnahme:** hatQualifiziert = true UND einGruender = false
- **Begründung (Protokoll):** EINE Bericht- und Prüfungs-Zeile für alle Tatbestände (ZH-Bemerkung 3.3 erlaubt die Zusammenfassung ausdrücklich: «Werden mehrere Sachverhalte im gleichen Gründungsbericht … dargestellt, so ist der Varianten-Text entsprechend anzupassen»). Zugelassener REVISOR genügt (Art. 635a OR — Dossier: ZH-Checklisten-«Revisionsunternehmen» ist enger als das Gesetz).

**Wortlaut:**

> – Gründungsbericht gemäss Art. 635 OR vom ________, von allen Gründerinnen und Gründern unterzeichnet.
> – Prüfungsbestätigung gemäss Art. 635a OR vom ________ der zugelassenen Revisorin bzw. des zugelassenen Revisors {{revisorZeile}}, wonach der Gründungsbericht vollständig und richtig ist.

### 26. `AE07q_bericht_singular`

- [ ] **abgenommen** (David)
- **Norm:** Art. 635a OR
- **Aufnahme:** hatQualifiziert = true UND einGruender = true
- **Begründung (Protokoll):** Bericht-/Prüfungs-Zeile im Singular (D1).

**Wortlaut:**

> – Gründungsbericht gemäss Art. 635 OR vom ________, von der Gründerin bzw. dem Gründer unterzeichnet.
> – Prüfungsbestätigung gemäss Art. 635a OR vom ________ der zugelassenen Revisorin bzw. des zugelassenen Revisors {{revisorZeile}}, wonach der Gründungsbericht vollständig und richtig ist.

### 27. `AE07c_resteinlage`

- [ ] **abgenommen** (David)
- **Norm:** Art. 634b OR
- **Aufnahme:** vollLiberiert = false UND einGruender = false
- **Begründung (Protokoll):** Resteinlage-Verpflichtungssatz der ZH-Urkunde verbatim (D6/0.3 — ersetzt die frühere Haus-Formulierung «sobald er es für nötig erachtet»). Norm-Gehalt: Art. 634b Abs. 1 OR lässt den VR die NACHTRÄGLICHE LEISTUNG BESCHLIESSEN; das «erste Verlangen» ist die vertragliche Verpflichtungsseite des Musters (Bug-Check-Befund 2, 7.6.2026).

**Wortlaut:**

> Jede Gründerin und jeder Gründer verpflichtet sich, auf erstes Verlangen des Verwaltungsrates die restliche und vollständige Leistung der eigenen Einlage im Sinne von Art. 634b OR sofort zu erbringen.

### 28. `AE07c_resteinlage_singular`

- [ ] **abgenommen** (David)
- **Norm:** Art. 634b OR
- **Aufnahme:** vollLiberiert = false UND einGruender = true
- **Begründung (Protokoll):** Resteinlage-Verpflichtungssatz im Singular (D1/D6; ZH-Vorlage 3.5).

**Wortlaut:**

> Die Gründerin bzw. der Gründer verpflichtet sich, auf erstes Verlangen des Verwaltungsrates die restliche und vollständige Leistung der Einlage im Sinne von Art. 634b OR sofort zu erbringen.

### 29. `AE08_feststellungen` — «Feststellungen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 629 Abs. 2 OR
- **Aufnahme:** einGruender = false
- **Begründung (Protokoll):** Gesetzliche Feststellungen Ziff. 1–4 – Wortlaut der Norm folgend (ZH-Urkunde identisch).

**Wortlaut:**

> Die Gründerinnen und Gründer stellen fest, dass:
> – sämtliche Aktien gültig gezeichnet sind;
> – die versprochenen Einlagen dem gesamten Ausgabebetrag entsprechen;
> – die gesetzlichen und statutarischen Anforderungen an die geleisteten Einlagen im Zeitpunkt der Unterzeichnung des Errichtungsakts erfüllt sind;
> – keine anderen Sacheinlagen, Verrechnungstatbestände oder besonderen Vorteile bestehen, als die in den Belegen genannten.

### 30. `AE08_feststellungen_singular` — «Feststellungen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 629 Abs. 2 OR
- **Aufnahme:** einGruender = true
- **Begründung (Protokoll):** Feststellungen im Singular (D1; ZH-Vorlage 3.5: «Ich stelle fest, dass …» — Haus-Fassung in der dritten Person).

**Wortlaut:**

> Die Gründerin bzw. der Gründer stellt fest, dass:
> – sämtliche Aktien gültig gezeichnet sind;
> – die versprochenen Einlagen dem gesamten Ausgabebetrag entsprechen;
> – die gesetzlichen und statutarischen Anforderungen an die geleisteten Einlagen im Zeitpunkt der Unterzeichnung des Errichtungsakts erfüllt sind;
> – keine anderen Sacheinlagen, Verrechnungstatbestände oder besonderen Vorteile bestehen, als die in den Belegen genannten.

### 31. `AE09_organbestellung` — «Organe»

- [ ] **abgenommen** (David)
- **Norm:** Art. 629 Abs. 1 OR
- **Aufnahme:** einVr = false
- **Begründung (Protokoll):** Organbestellung in der Urkunde; Personenangaben nach Art. 44 lit. e HRegV.

**Wortlaut:**

> Als Mitglieder des Verwaltungsrates werden gewählt:

### 32. `AE09_organbestellung_singular` — «Organe»

- [ ] **abgenommen** (David)
- **Norm:** Art. 629 Abs. 1 OR
- **Aufnahme:** einVr = true
- **Begründung (Protokoll):** Organbestellung im Singular bei eingliedrigem Verwaltungsrat (Numerus-Korrektur analog D1).

**Wortlaut:**

> Als Mitglied des Verwaltungsrates wird gewählt:

### 33. `AE09b_vrliste`

- [ ] **abgenommen** (David)
- **Norm:** Art. 44 lit. e HRegV
- **Aufnahme:** immer
- **Wiederholt über:** `vrListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Je VR-Mitglied eine Zeile; Wahl-Zusatz «welche bzw. welcher hiermit die Annahme erklärt» nach der ZH-Erläuterung zu Ziff. VI, wenn die Annahme in der Urkunde erfolgt (Etappe 4.1/D8 — die separate Wahlannahmeerklärung ist dann entbehrlich, Art. 43 Abs. 1 lit. c HRegV).

**Wortlaut:**

> – {{item.name}}, von {{item.herkunft}}, in {{item.wohnort}}{{item.praesidentZeile}}{{item.wahlannahmeSatz}}

### 34. `AE10_revisionsstelle`

- [ ] **abgenommen** (David)
- **Norm:** Art. 44 lit. f HRegV
- **Aufnahme:** optingOut = false
- **Begründung (Protokoll):** Aufgenommen, weil eine Revisionsstelle bestellt wird.

**Wortlaut:**

> Als Revisionsstelle wird gewählt: {{revisionsstelleName}}, {{revisionsstelleSitz}}.

### 35. `AE11_opting_out`

- [ ] **abgenommen** (David)
- **Norm:** Art. 727a Abs. 2 OR
- **Aufnahme:** optingOut = true UND einGruender = false
- **Begründung (Protokoll):** Opting-out bei der Gründung: dreigliedrige Feststellung direkt in der Urkunde (Art. 44 lit. f HRegV; ZH-KMU-Merkblatt und SG-Formular wortgleich).

**Wortlaut:**

> Auf eine Revision wird verzichtet. Die Gründerinnen und Gründer stellen fest, dass:
> – die Gesellschaft die Voraussetzungen für die Pflicht zur ordentlichen Revision nicht erfüllt;
> – die Gesellschaft nicht mehr als zehn Vollzeitstellen im Jahresdurchschnitt hat;
> – sämtliche Gründerinnen und Gründer auf eine eingeschränkte Revision verzichten.

### 36. `AE11_opting_out_singular`

- [ ] **abgenommen** (David)
- **Norm:** Art. 727a Abs. 2 OR
- **Aufnahme:** optingOut = true UND einGruender = true
- **Begründung (Protokoll):** Opting-out im Singular (D1; ZH-Vorlage 3.5). Bug-Check-Befund 1 (7.6.2026): Art. 62 Abs. 1 lit. c HRegV verlangt die Erklärung, dass SÄMTLICHE Aktionärinnen und Aktionäre verzichtet haben — der Verzichtsträger bleibt darum auch im Singular ausdrücklich benannt («als einzige Aktionärin bzw. einziger Aktionär»), kein subjektloses Passiv.

**Wortlaut:**

> Auf eine Revision wird verzichtet. Die Gründerin bzw. der Gründer stellt fest, dass:
> – die Gesellschaft die Voraussetzungen für die Pflicht zur ordentlichen Revision nicht erfüllt;
> – die Gesellschaft nicht mehr als zehn Vollzeitstellen im Jahresdurchschnitt hat;
> – die Gründerin bzw. der Gründer als einzige Aktionärin bzw. einziger Aktionär auf eine eingeschränkte Revision verzichtet.

### 37. `AE12_domizil_eigen` — «Rechtsdomizil»

- [ ] **abgenommen** (David)
- **Norm:** Art. 117 Abs. 2 HRegV
- **Aufnahme:** domizilImDomizilArtikel = true UND eigeneBueros = true
- **Begründung (Protokoll):** Eigene Adresse am Sitz; die Ziffer entfällt, wenn das Domizil in der Konstituierungs-Ziffer steht oder weggelassen wird (ZH-Erläuterung zu Ziff. VII: Domizil kann in der Urkunde weggelassen werden, muss aber in der Anmeldung stehen — Etappe 4.2/D9).

**Wortlaut:**

> Das Rechtsdomizil der Gesellschaft befindet sich an folgender Adresse: {{rechtsdomizilAdresse}}.

### 38. `AE12_domizil_co` — «Rechtsdomizil»

- [ ] **abgenommen** (David)
- **Norm:** Art. 117 Abs. 3 HRegV
- **Aufnahme:** domizilImDomizilArtikel = true UND eigeneBueros = false
- **Begründung (Protokoll):** c/o-Domizil mit Domizilannahmeerklärung als Beleg (Art. 43 Abs. 1 lit. g HRegV); Ziffer entfällt analog AE12_domizil_eigen (Etappe 4.2/D9).

**Wortlaut:**

> Die Gesellschaft hat ihr Rechtsdomizil als c/o-Adresse bei {{domizilhalterName}}, {{domizilhalterAdresse}}. Die Erklärung der Domizilhalterin bzw. des Domizilhalters liegt vor.

### 39. `AE12k_konstituierung` — «Konstituierung und Zeichnungsberechtigung»

- [ ] **abgenommen** (David)
- **Norm:** Art. 712 OR
- **Aufnahme:** konstituierungInUrkunde = true UND einVr = false
- **Begründung (Protokoll):** ZH-Urkunde Ziff. VII mit der Vollzähligkeits-Bedingung («[Variante: Unter der Bedingung, dass der Verwaltungsrat vollzählig anwesend ist]»). Haus-Abweichung (offengelegt): «die soeben ernannten Mitglieder des Verwaltungsrates» statt ZH «die soeben als Verwaltungsräte ernannten Gründer» — die Maske erlaubt VR-Mitglieder, die nicht Gründer sind. Das separate VR-Protokoll ist damit entbehrlich (Art. 43 Abs. 1 lit. e HRegV — die Konstituierung ist aus der Urkunde ersichtlich).

**Wortlaut:**

> Unter der Bedingung, dass der Verwaltungsrat vollzählig anwesend ist, erklären die soeben ernannten Mitglieder des Verwaltungsrates:

### 40. `AE12k_konstituierung_singular` — «Konstituierung und Zeichnungsberechtigung»

- [ ] **abgenommen** (David)
- **Norm:** Art. 712 OR
- **Aufnahme:** konstituierungInUrkunde = true UND einVr = true
- **Begründung (Protokoll):** Konstituierungs-Ziffer im Singular (eingliedriger VR — die Vollzähligkeits-Bedingung ist trivial erfüllt; D1-Numerus).

**Wortlaut:**

> Das soeben ernannte einzige Mitglied des Verwaltungsrates erklärt:

### 41. `AE12k_liste`

- [ ] **abgenommen** (David)
- **Norm:** Art. 718 OR
- **Aufnahme:** konstituierungInUrkunde = true
- **Wiederholt über:** `vrListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Je VR-Mitglied eine Zeile nach ZH Ziff. VII lit. a («… ist … mit … [Art der Zeichnungsberechtigung]»).

**Wortlaut:**

> – {{item.konstituierungZeile}}

### 42. `AE12k_domizil_eigen`

- [ ] **abgenommen** (David)
- **Norm:** Art. 117 Abs. 2 HRegV
- **Aufnahme:** domizilInKonstituierung = true UND eigeneBueros = true
- **Begründung (Protokoll):** ZH Ziff. VII lit. b («Das Domizil befindet sich … mit Hinweis auf eigene Geschäftsräume oder auf die Erklärung des Domizilhalters»).

**Wortlaut:**

> Das Rechtsdomizil befindet sich an folgender Adresse: {{rechtsdomizilAdresse}} (eigene Geschäftsräume).

### 43. `AE12k_domizil_co`

- [ ] **abgenommen** (David)
- **Norm:** Art. 117 Abs. 3 HRegV
- **Aufnahme:** domizilInKonstituierung = true UND eigeneBueros = false
- **Begründung (Protokoll):** ZH Ziff. VII lit. b, c/o-Fall («Eine allenfalls vorliegende Domizilhaltererklärung ist in der Urkunde zu nennen»).

**Wortlaut:**

> Das Rechtsdomizil befindet sich als c/o-Adresse bei {{domizilhalterName}}, {{domizilhalterAdresse}}. Die Erklärung der Domizilhalterin bzw. des Domizilhalters liegt vor.

### 44. `AE13_nachtragsvollmacht` — «Vollmacht»

- [ ] **abgenommen** (David)
- **Norm:** Art. 44 HRegV
- **Aufnahme:** hatNachtragsvollmacht = true UND einGruender = false
- **Begründung (Protokoll):** Aufgenommen, weil eine Nachtrags-Bevollmächtigung gewünscht ist (D10: ZH-Klausel «Auf Verlangen der Gründer» — eine benannte Person mit vollen Personalien: Vorname, Name, Geburtsdatum, Bürgerort bzw. Staatsangehörigkeit, Wohnadresse).

**Wortlaut:**

> Die Gründerinnen und Gründer bevollmächtigen {{nachtragsbevollmaechtigter}}, allfällige wegen Beanstandung durch die Handelsregisterbehörde erforderliche Änderungen an den Statuten oder am Errichtungsakt durch einen öffentlich zu beurkundenden Nachtrag namens aller Gründerinnen und Gründer vorzunehmen.

### 45. `AE13_nachtragsvollmacht_singular` — «Vollmacht»

- [ ] **abgenommen** (David)
- **Norm:** Art. 44 HRegV
- **Aufnahme:** hatNachtragsvollmacht = true UND einGruender = true
- **Begründung (Protokoll):** Nachtragsvollmacht im Singular (D1/D10).

**Wortlaut:**

> Die Gründerin bzw. der Gründer bevollmächtigt {{nachtragsbevollmaechtigter}}, allfällige wegen Beanstandung durch die Handelsregisterbehörde erforderliche Änderungen an den Statuten oder am Errichtungsakt durch einen öffentlich zu beurkundenden Nachtrag in ihrem bzw. seinem Namen vorzunehmen.

### 46. `AE14_gruendungserklaerung` — «Gründungserklärung»

- [ ] **abgenommen** (David)
- **Norm:** Art. 629 Abs. 1 OR
- **Aufnahme:** einGruender = false
- **Begründung (Protokoll):** Abschliessende Gründungserklärung (ZH-Vorlage wortgleich).

**Wortlaut:**

> Abschliessend erklären die erschienenen Personen die Gesellschaft den gesetzlichen Vorschriften entsprechend als gegründet.

### 47. `AE14_gruendungserklaerung_singular` — «Gründungserklärung»

- [ ] **abgenommen** (David)
- **Norm:** Art. 629 Abs. 1 OR
- **Aufnahme:** einGruender = true
- **Begründung (Protokoll):** Abschliessende Gründungserklärung im Singular (D1; ZH-Vorlage 3.5: «erkläre ich» — Haus-Fassung dritte Person).

**Wortlaut:**

> Abschliessend erklärt die erschienene Person die Gesellschaft den gesetzlichen Vorschriften entsprechend als gegründet.

### 48. `AE15_belege` — «Bestätigung der Urkundsperson»

- [ ] **abgenommen** (David)
- **Norm:** Art. 631 OR
- **Aufnahme:** einGruender = false
- **Begründung (Protokoll):** Beleg-Nennung und Vorlage-Bestätigung durch die Urkundsperson.

**Wortlaut:**

> Die Urkundsperson nennt die Belege über die Gründung einzeln und bestätigt, dass diese ihr und den Gründerinnen und Gründern vorgelegen haben (Art. 631 Abs. 1 OR):

### 49. `AE15_belege_singular` — «Bestätigung der Urkundsperson»

- [ ] **abgenommen** (David)
- **Norm:** Art. 631 OR
- **Aufnahme:** einGruender = true
- **Begründung (Protokoll):** Vorlage-Bestätigung im Singular (D1; ZH-Vorlage 3.5: «… dass ihr und dem Gründer bzw. dessen Vertreter … vorgelegen haben»).

**Wortlaut:**

> Die Urkundsperson nennt die Belege über die Gründung einzeln und bestätigt, dass diese ihr und der Gründerin bzw. dem Gründer vorgelegen haben (Art. 631 Abs. 1 OR):

### 50. `AE15b_belegliste`

- [ ] **abgenommen** (David)
- **Norm:** Art. 631 Abs. 2 OR
- **Aufnahme:** immer
- **Wiederholt über:** `belegeListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Je Beleg eine Zeile (Art. 631 Abs. 2 OR; bei der Bargründung: Statuten und – sofern die Bank nicht in der Urkunde genannt ist – die Hinterlegungs-Bestätigung).

**Wortlaut:**

> – {{item.titel}}

### 51. `AE16_unterschriften`

- [ ] **abgenommen** (David)
- **Norm:** Art. 44 lit. i HRegV
- **Aufnahme:** einGruender = false
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Unterschriften der Gründerinnen und Gründer (Art. 44 lit. i HRegV).

**Wortlaut:**

> {{ortDatumZeile}}
>
> Die Gründerinnen und Gründer:

### 52. `AE16_unterschriften_singular`

- [ ] **abgenommen** (David)
- **Norm:** Art. 44 lit. i HRegV
- **Aufnahme:** einGruender = true
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Unterschrift im Singular (D1).

**Wortlaut:**

> {{ortDatumZeile}}
>
> Die Gründerin bzw. der Gründer:

### 53. `AE16b_unterschriftenliste`

- [ ] **abgenommen** (David)
- **Norm:** Art. 44 lit. i HRegV
- **Aufnahme:** immer
- **Wiederholt über:** `gruenderListe` (ein Absatz je Eintrag)
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Je Gründerin/Gründer eine Unterschriftslinie.

**Wortlaut:**

> _________________________________
> {{item.name}}

### 54. `AE17_urkundsperson`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Beurkundungsvermerk – wird von der Urkundsperson nach kantonalem Beurkundungsrecht ergänzt.

**Wortlaut:**

> Die Urkundsperson:
>
> _________________________________

---

## Sacheinlagevertrag

Schema `ag-sacheinlagevertrag` · Version 1.0.0 (ZH-Vorlagen vertrag_se_einfach/_geschaeft 26.7.2024; Dossier 7.6.2026) · Format vertrag · Ausgabe fertig

> **Disclaimer (Fusszeile):** Erstellt mit LexMetrik – keine Rechtsberatung. Schriftform (Art. 634 Abs. 2 OR); im Original oder als beglaubigte Kopie einzureichen (Art. 20 HRegV). Inventarliste bzw. Übernahmebilanz unterzeichnet und datiert beiheften (Merkblatt HRegA ZH).


### 1. `SV01_parteien`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Begründung (Protokoll):** Parteien-Ingress nach den ZH-Vertragsvorlagen (Vertretung durch die Gründer; Haus-Fassung sammelt sie statt Einzelaufzählung — Unterschriftsblock nennt alle).

**Wortlaut:**

> zwischen
> {{einlegerName}},
> als Veräusserer/in und Sacheinleger/in,
> und
> {{firma}} in Gründung, {{sitz}}, vertreten durch die Gründerinnen und Gründer,
> als übernehmende Gesellschaft.

### 2. `SV02_gegenstand_einfach` — «Sacheinlage»

- [ ] **abgenommen** (David)
- **Norm:** Art. 634 OR
- **Aufnahme:** typGeschaeft = false
- **Begründung (Protokoll):** ZH-Vorlage «Sacheinlagevertrag einfach» verbatim (Sachgesamtheit mit unterzeichneter, datierter Inventarliste — Beleg-Anforderung des ZH-Merkblatts: Gegenstände einzeln aufgeführt und bewertet).

**Wortlaut:**

> Der/die Sacheinleger/in bringt in die zu gründende {{firma}} ein: {{bezeichnung}} gemäss beiliegender Inventarliste vom {{belegDatumFmt}} im Wert und zum Preis von CHF {{wertFmt}}.
> Die beiliegende Inventarliste bildet einen integrierenden Bestandteil des vorliegenden Vertrages und wird demselben, von den Vertragsparteien unterzeichnet, beigeheftet.

### 3. `SV02_gegenstand_geschaeft` — «Gegenstand der Sacheinlage»

- [ ] **abgenommen** (David)
- **Norm:** Art. 634 OR
- **Aufnahme:** typGeschaeft = true
- **Begründung (Protokoll):** ZH-Vorlage «Sacheinlagevertrag Geschäft» verbatim (Übernahme aller Aktiven und Passiven eines Einzelunternehmens mit Übernahmebilanz).

**Wortlaut:**

> Die {{firma}} übernimmt alle Aktiven und Passiven {{hrZusatz}} Einzelunternehmens {{bezeichnung}}{{cheSatz}} gemäss Übernahmebilanz per {{belegDatumFmt}}. Danach betragen die Aktiven CHF {{aktivenFmt}} und die Passiven CHF {{passivenFmt}}. Der Kaufpreis beträgt CHF {{wertFmt}}. Die Bilanz bildet einen Bestandteil dieses Vertrages und wird von den Vertragsparteien anerkannt.

### 4. `SV03_gegenleistung` — «Gegenleistung»

- [ ] **abgenommen** (David)
- **Norm:** Art. 634 Abs. 4 OR
- **Aufnahme:** immer
- **Begründung (Protokoll):** Gegenleistung nach den ZH-Vorlagen («als voll liberiert geltende Aktien … zu nominal»); Gutschrift-Satz = weitere Gegenleistung (Art. 634 Abs. 4 OR), nur wenn erfasst.

**Wortlaut:**

> Als Gegenleistung erhält {{einlegerName}} {{aktien}} als voll liberiert geltende Namenaktien der Gesellschaft zu nominal CHF {{nennwertFmt}}.{{gutschriftSatz}}

### 5. `SV04_zeitpunkt` — «Zeitpunkt»

- [ ] **abgenommen** (David)
- **Norm:** Art. 634 Abs. 1 Ziff. 3 OR
- **Aufnahme:** immer
- **Begründung (Protokoll):** ZH-Vorlagen verbatim — setzt die Deckungs-Voraussetzung der sofortigen freien Verfügbarkeit um.

**Wortlaut:**

> Der/die Sacheinleger/in erteilt mit der Unterzeichnung dieses Vertrages der {{firma}} die unwiderrufliche Befugnis, sofort nach ihrer Eintragung im Handelsregister über sämtliche übertragenen Vermögenswerte tatsächlich und rechtlich zu verfügen. Mit der Eintragung der {{firma}} im Handelsregister kann sie frei und bedingungslos über die Sacheinlage verfügen.

### 6. `SV05_zusicherungen` — «Zusicherungen»

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Begründung (Protokoll):** ZH-Vorlagen verbatim.

**Wortlaut:**

> Die übernommenen Vermögenswerte sind frei von Rechten Dritter.

### 7. `SV06_rechtsgeschaefte` — «Rechtsgeschäfte»

- [ ] **abgenommen** (David)
- **Aufnahme:** typGeschaeft = true
- **Begründung (Protokoll):** Rückwirkungsklausel der ZH-Vorlage «Geschäft» (nur Geschäftsübernahme).

**Wortlaut:**

> Die seit dem {{rueckwirkungFmt}} abgeschlossenen Rechtsgeschäfte des Einzelunternehmens {{bezeichnung}} gelten als für Rechnung der in Gründung begriffenen {{firma}} getätigt.

### 8. `SV07_nutzen_gefahr` — «Nutzen und Gefahr»

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Begründung (Protokoll):** ZH-Vorlagen verbatim; Stichtag = Inventarlisten- bzw. Übernahmebilanz-Datum.

**Wortlaut:**

> Nutzen und Gefahr hinsichtlich aller übertragenen Vermögenswerte gelten als per {{belegDatumFmt}} auf die {{firma}} übergegangen.

### 9. `SV08_gewaehrleistung` — «Gewährleistung»

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Begründung (Protokoll):** ZH-Vorlagen verbatim.

**Wortlaut:**

> Der vorliegende Vertrag wird unter Aufhebung jeder Gewährleistung abgeschlossen.

### 10. `SV09_unterschriften`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Unterschriften der Sacheinlegerin / des Sacheinlegers und aller Gründerinnen und Gründer (ZH-Vorlagen).

**Wortlaut:**

> {{ortDatumZeile}}
>
> _________________________________
> {{einlegerName}} (Sacheinleger/in)
>
> {{firma}} in Gründung – die Gründerinnen und Gründer:

### 11. `SV09b_gruenderliste`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Wiederholt über:** `gruenderListe` (ein Absatz je Eintrag)
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Je Gründerin/Gründer eine Unterschriftslinie.

**Wortlaut:**

> _________________________________
> {{item.name}}

---

## Sacheinlagevertrag

Schema `ag-sacheinlagevertrag-grundstueck` · Version 1.0.0 (ZH-Vorlagen vertrag_se_einfach/_geschaeft 26.7.2024; Dossier 7.6.2026) · Format vertrag · Ausgabe entwurf

> **Disclaimer (Fusszeile):** Erstellt mit LexMetrik – keine Rechtsberatung. ENTWURF: Dieser Sacheinlagevertrag enthält ein Grundstück und bedarf der öffentlichen Beurkundung (Art. 634 Abs. 2 OR i. V. m. Art. 657 ZGB); eine einzige Urkunde genügt auch für Grundstücke in verschiedenen Kantonen und ist durch eine Urkundsperson am Sitz der Gesellschaft zu errichten (Art. 634 Abs. 3 OR).


### 1. `SV01_parteien`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Begründung (Protokoll):** Parteien-Ingress nach den ZH-Vertragsvorlagen (Vertretung durch die Gründer; Haus-Fassung sammelt sie statt Einzelaufzählung — Unterschriftsblock nennt alle).

**Wortlaut:**

> zwischen
> {{einlegerName}},
> als Veräusserer/in und Sacheinleger/in,
> und
> {{firma}} in Gründung, {{sitz}}, vertreten durch die Gründerinnen und Gründer,
> als übernehmende Gesellschaft.

### 2. `SV02_gegenstand_einfach` — «Sacheinlage»

- [ ] **abgenommen** (David)
- **Norm:** Art. 634 OR
- **Aufnahme:** typGeschaeft = false
- **Begründung (Protokoll):** ZH-Vorlage «Sacheinlagevertrag einfach» verbatim (Sachgesamtheit mit unterzeichneter, datierter Inventarliste — Beleg-Anforderung des ZH-Merkblatts: Gegenstände einzeln aufgeführt und bewertet).

**Wortlaut:**

> Der/die Sacheinleger/in bringt in die zu gründende {{firma}} ein: {{bezeichnung}} gemäss beiliegender Inventarliste vom {{belegDatumFmt}} im Wert und zum Preis von CHF {{wertFmt}}.
> Die beiliegende Inventarliste bildet einen integrierenden Bestandteil des vorliegenden Vertrages und wird demselben, von den Vertragsparteien unterzeichnet, beigeheftet.

### 3. `SV02_gegenstand_geschaeft` — «Gegenstand der Sacheinlage»

- [ ] **abgenommen** (David)
- **Norm:** Art. 634 OR
- **Aufnahme:** typGeschaeft = true
- **Begründung (Protokoll):** ZH-Vorlage «Sacheinlagevertrag Geschäft» verbatim (Übernahme aller Aktiven und Passiven eines Einzelunternehmens mit Übernahmebilanz).

**Wortlaut:**

> Die {{firma}} übernimmt alle Aktiven und Passiven {{hrZusatz}} Einzelunternehmens {{bezeichnung}}{{cheSatz}} gemäss Übernahmebilanz per {{belegDatumFmt}}. Danach betragen die Aktiven CHF {{aktivenFmt}} und die Passiven CHF {{passivenFmt}}. Der Kaufpreis beträgt CHF {{wertFmt}}. Die Bilanz bildet einen Bestandteil dieses Vertrages und wird von den Vertragsparteien anerkannt.

### 4. `SV03_gegenleistung` — «Gegenleistung»

- [ ] **abgenommen** (David)
- **Norm:** Art. 634 Abs. 4 OR
- **Aufnahme:** immer
- **Begründung (Protokoll):** Gegenleistung nach den ZH-Vorlagen («als voll liberiert geltende Aktien … zu nominal»); Gutschrift-Satz = weitere Gegenleistung (Art. 634 Abs. 4 OR), nur wenn erfasst.

**Wortlaut:**

> Als Gegenleistung erhält {{einlegerName}} {{aktien}} als voll liberiert geltende Namenaktien der Gesellschaft zu nominal CHF {{nennwertFmt}}.{{gutschriftSatz}}

### 5. `SV04_zeitpunkt` — «Zeitpunkt»

- [ ] **abgenommen** (David)
- **Norm:** Art. 634 Abs. 1 Ziff. 3 OR
- **Aufnahme:** immer
- **Begründung (Protokoll):** ZH-Vorlagen verbatim — setzt die Deckungs-Voraussetzung der sofortigen freien Verfügbarkeit um.

**Wortlaut:**

> Der/die Sacheinleger/in erteilt mit der Unterzeichnung dieses Vertrages der {{firma}} die unwiderrufliche Befugnis, sofort nach ihrer Eintragung im Handelsregister über sämtliche übertragenen Vermögenswerte tatsächlich und rechtlich zu verfügen. Mit der Eintragung der {{firma}} im Handelsregister kann sie frei und bedingungslos über die Sacheinlage verfügen.

### 6. `SV05_zusicherungen` — «Zusicherungen»

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Begründung (Protokoll):** ZH-Vorlagen verbatim.

**Wortlaut:**

> Die übernommenen Vermögenswerte sind frei von Rechten Dritter.

### 7. `SV06_rechtsgeschaefte` — «Rechtsgeschäfte»

- [ ] **abgenommen** (David)
- **Aufnahme:** typGeschaeft = true
- **Begründung (Protokoll):** Rückwirkungsklausel der ZH-Vorlage «Geschäft» (nur Geschäftsübernahme).

**Wortlaut:**

> Die seit dem {{rueckwirkungFmt}} abgeschlossenen Rechtsgeschäfte des Einzelunternehmens {{bezeichnung}} gelten als für Rechnung der in Gründung begriffenen {{firma}} getätigt.

### 8. `SV07_nutzen_gefahr` — «Nutzen und Gefahr»

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Begründung (Protokoll):** ZH-Vorlagen verbatim; Stichtag = Inventarlisten- bzw. Übernahmebilanz-Datum.

**Wortlaut:**

> Nutzen und Gefahr hinsichtlich aller übertragenen Vermögenswerte gelten als per {{belegDatumFmt}} auf die {{firma}} übergegangen.

### 9. `SV08_gewaehrleistung` — «Gewährleistung»

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Begründung (Protokoll):** ZH-Vorlagen verbatim.

**Wortlaut:**

> Der vorliegende Vertrag wird unter Aufhebung jeder Gewährleistung abgeschlossen.

### 10. `SV09_unterschriften`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Unterschriften der Sacheinlegerin / des Sacheinlegers und aller Gründerinnen und Gründer (ZH-Vorlagen).

**Wortlaut:**

> {{ortDatumZeile}}
>
> _________________________________
> {{einlegerName}} (Sacheinleger/in)
>
> {{firma}} in Gründung – die Gründerinnen und Gründer:

### 11. `SV09b_gruenderliste`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Wiederholt über:** `gruenderListe` (ein Absatz je Eintrag)
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Je Gründerin/Gründer eine Unterschriftslinie.

**Wortlaut:**

> _________________________________
> {{item.name}}

---

## Gründungsbericht

Schema `ag-gruendungsbericht` · Version 1.0.0 (ZH-Vorlagen gruendungsbericht_se_einfach/_geschaeft 26.7.2024; Dossier 7.6.2026) · Format vertrag · Ausgabe fertig

> **Disclaimer (Fusszeile):** Erstellt mit LexMetrik – keine Rechtsberatung. Von allen Gründerinnen und Gründern (oder ihren Vertretern) ORIGINAL HANDSCHRIFTLICH zu unterzeichnen (Praxis HRegA ZH); ein zugelassener Revisor prüft den Bericht und bestätigt schriftlich, dass er vollständig und richtig ist (Art. 635a OR).


### 1. `GB01_ingress`

- [ ] **abgenommen** (David)
- **Norm:** Art. 635 OR
- **Aufnahme:** einGruender = false
- **Begründung (Protokoll):** Ingress nach der ZH-Vorlage («Die Gründer der … AG erstatten hiermit folgenden Gründungsbericht im Sinne von Art. 635 OR»).

**Wortlaut:**

> Die Gründerinnen und Gründer der {{firma}}, in {{sitz}}, erstatten hiermit folgenden Gründungsbericht im Sinne von Art. 635 OR:

### 2. `GB01_ingress_singular`

- [ ] **abgenommen** (David)
- **Norm:** Art. 635 OR
- **Aufnahme:** einGruender = true
- **Begründung (Protokoll):** Ingress im Singular (D1).

**Wortlaut:**

> Die Gründerin bzw. der Gründer der {{firma}}, in {{sitz}}, erstattet hiermit folgenden Gründungsbericht im Sinne von Art. 635 OR:

### 3. `GB02_sach` — «Art und Zustand der Sacheinlage»

- [ ] **abgenommen** (David)
- **Norm:** Art. 635 Ziff. 1 OR
- **Aufnahme:** hatSacheinlagen = true
- **Wiederholt über:** `sachListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Je Sacheinlage ein Abschnitt nach den ZH-Vorlagen (Art/Zustand + Angemessenheit der Bewertung); beim Geschäft tritt die Übernahmebilanz an die Stelle der Inventarliste, die Posten-Würdigung steht im Zustands-Text (ZH-Vorlage «Geschäft»: je Bilanzposten Bestand und Bewertung).

**Wortlaut:**

> Die Sacheinlage von {{item.einleger}} umfasst {{item.objektLabel}}. Der entsprechende Sacheinlagevertrag vom {{item.vertragDatumFmt}} mit {{item.belegSatz}} liegt diesem Bericht als integrierender Bestandteil bei. Zum Zustand der Sacheinlage wird Folgendes erklärt: {{item.zustandTxt}}
> Auf Grund obiger Feststellungen kann die Bewertung der Sacheinlage mit CHF {{item.wertFmt}} als angemessen bezeichnet werden.

### 4. `GB03_verrechnung` — «Bestand und Verrechenbarkeit»

- [ ] **abgenommen** (David)
- **Norm:** Art. 635 Ziff. 2 OR
- **Aufnahme:** hatVerrechnungen = true
- **Wiederholt über:** `verrListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Rechenschaft über Bestand und Verrechenbarkeit der Schuld (Art. 635 Ziff. 2 OR; BE-Merkblatt) — Haus-Fassung, die ZH-Vorlagen decken nur den Sacheinlage-Fall.

**Wortlaut:**

> Die zur Verrechnung gebrachte Forderung von {{item.glaeubiger}} im Betrag von CHF {{item.forderungFmt}} besteht und ist verrechenbar. Begründung: {{item.begruendungTxt}}

### 5. `GB04_vorteile` — «Besondere Vorteile»

- [ ] **abgenommen** (David)
- **Norm:** Art. 635 Ziff. 3 OR
- **Aufnahme:** hatVorteile = true
- **Wiederholt über:** `vorteilListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Rechenschaft über Begründung und Angemessenheit besonderer Vorteile (Art. 635 Ziff. 3 OR) — Haus-Fassung.

**Wortlaut:**

> {{item.beguenstigter}} wird folgender besonderer Vorteil gewährt: {{item.inhalt}} (Wert: CHF {{item.wertFmt}}). Begründung und Angemessenheit: {{item.begruendungTxt}}

### 6. `GB05_unterschriften`

- [ ] **abgenommen** (David)
- **Aufnahme:** einGruender = false
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Unterschriften ALLER Gründerinnen und Gründer (ZH-Praxis: original handschriftlich).

**Wortlaut:**

> {{ortDatumZeile}}
>
> Die Gründerinnen und Gründer:

### 7. `GB05_unterschriften_singular`

- [ ] **abgenommen** (David)
- **Aufnahme:** einGruender = true
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Unterschrift im Singular (D1).

**Wortlaut:**

> {{ortDatumZeile}}
>
> Die Gründerin bzw. der Gründer:

### 8. `GB05b_gruenderliste`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Wiederholt über:** `gruenderListe` (ein Absatz je Eintrag)
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Je Gründerin/Gründer eine Unterschriftslinie.

**Wortlaut:**

> _________________________________
> {{item.name}}

---

## Nachtrag zur Gründungsurkunde

Schema `ag-gruendungs-nachtrag` · Version 1.0.0 (ZH-Vorlage 3.4 «AG Gründungs-Nachtrag») · Format verfuegung · Ausgabe entwurf

> **Disclaimer (Fusszeile):** Erstellt mit LexMetrik – keine Rechtsberatung. ENTWURF für die Urkundsperson: Der Nachtrag zur Gründungsurkunde bedarf der öffentlichen Beurkundung (ZH-Vorlage 3.4; Art. 629 Abs. 1 OR). Wer den Nachtrag namens aller Gründerinnen und Gründer vornimmt, ergibt sich aus der Nachtragsvollmacht der Gründungsurkunde oder dem persönlichen Erscheinen.


### 1. `NT01_ingress`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Begründung (Protokoll):** Ingress nach ZH 3.4 («Nachtrag zur Gründungsurkunde vom … der … mit Sitz in …»).

**Wortlaut:**

> Nachtrag zur Gründungsurkunde vom {{nachtragGruendungsdatumFmt}} der {{firma}} mit Sitz in {{sitz}}

### 2. `NT02_erklaerung`

- [ ] **abgenommen** (David)
- **Aufnahme:** einGruender = false
- **Begründung (Protokoll):** ZH 3.4 verbatim-nah («Die Gründer erklären infolge einer Beanstandung durch die Handelsregisterbehörde folgenden Nachtrag»).

**Wortlaut:**

> Die Gründerinnen und Gründer erklären infolge einer Beanstandung durch die Handelsregisterbehörde folgenden Nachtrag:

### 3. `NT02_erklaerung_singular`

- [ ] **abgenommen** (David)
- **Aufnahme:** einGruender = true
- **Begründung (Protokoll):** Nachtrags-Erklärung im Singular (D1; ZH 3.4 führt beide Numeri).

**Wortlaut:**

> Die Gründerin bzw. der Gründer erklärt infolge einer Beanstandung durch die Handelsregisterbehörde folgenden Nachtrag:

### 4. `NT03_urkunde`

- [ ] **abgenommen** (David)
- **Aufnahme:** hatNachtragUrkunde = true
- **Begründung (Protokoll):** Urkunden-Änderung nach ZH 3.4 («Ziff. … der Gründungsurkunde lautet neu wie folgt: „…“» — Haus-Anführung mit Guillemets statt deutscher Anführungszeichen, Konventions-Standard).

**Wortlaut:**

> Ziff. {{nachtragUrkundeZiffer}} der Gründungsurkunde lautet neu wie folgt:
> «{{nachtragUrkundeText}}»

### 5. `NT04_statuten`

- [ ] **abgenommen** (David)
- **Aufnahme:** hatNachtragStatuten = true
- **Begründung (Protokoll):** Statuten-Änderung nach ZH 3.4.

**Wortlaut:**

> Art. {{nachtragStatutenArtikel}}{{nachtragAbsatzSatz}} der Statuten der Gesellschaft lautet neu wie folgt:
> «{{nachtragStatutenText}}»

### 6. `NT05_statuten_feststellung`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Begründung (Protokoll):** Vollständigkeits-Feststellung nach ZH 3.4 (Haus-Fassung in der dritten Person; ZH: «Der bzw. Die Gründer legt bzw. legen ein Exemplar … vor und erklärt bzw. erklären …»).

**Wortlaut:**

> Es liegt ein Exemplar der Gesellschaftsstatuten vor; es handelt sich um die vollständigen, unter Berücksichtigung der vorstehenden Änderungen gültigen Statuten. Diese Statuten sind Bestandteil dieser Urkunde.

### 7. `NT06_fortgeltung`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Begründung (Protokoll):** ZH 3.4 verbatim.

**Wortlaut:**

> Im Übrigen gilt der ursprüngliche Errichtungsakt (mit Statuten) unverändert weiter.

### 8. `NT07_unterschriften`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Unterschriften; die Urkundsperson ergänzt Bestätigung und Beurkundungsvermerk (ZH 3.4: Belegbestätigung Art. 631 Abs. 1 OR).

**Wortlaut:**

> {{ortDatumZeile}}
>
> Die Gründerinnen und Gründer (bzw. die bevollmächtigte Person):

### 9. `NT07b_gruenderliste`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Wiederholt über:** `gruenderListe` (ein Absatz je Eintrag)
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Je Gründerin/Gründer eine Unterschriftslinie.

**Wortlaut:**

> _________________________________
> {{item.name}}

---

## Lex-Koller-Erklärung

Schema `ag-lex-koller` · Version 1.0.0 (ZH-Formular allg_formular_lex_koller_erklaerung 1.1.2025) · Format eingabe · Ausgabe fertig

> **Disclaimer (Fusszeile):** Erstellt mit LexMetrik – keine Rechtsberatung. Nur einzureichen, wenn die Gesellschaft eine Immobilien-Haupttätigkeit verfolgt; persönliche Unterschrift EINES Mitglieds des obersten Leitungs- oder Verwaltungsorgans (Merkblatt HRegA ZH). Fehlende Angaben können die Verweisung an die kantonale Bewilligungsbehörde zur Folge haben (Art. 18 Abs. 1 und 2 BewG).


### 1. `LK01_absender`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** absender
- **Begründung (Protokoll):** Absenderin ist die Gesellschaft in Gründung.

**Wortlaut:**

> {{firma}} (in Gründung)
> {{anmeldeAdresseZeile}}

### 2. `LK02_adressat`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** adressat
- **Begründung (Protokoll):** Beleg zur HR-Anmeldung (Art. 43 HRegV; ZH-Checkliste «Lex-Koller-Erklärung»).

**Wortlaut:**

> Handelsregisteramt des Kantons {{kanton}}

### 3. `LK03_datum`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** datumzeile
- **Begründung (Protokoll):** Ort und Datum.

**Wortlaut:**

> {{ortDatumZeile}}

### 4. `LK04_betreff`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** betreff
- **Begründung (Protokoll):** Titel des amtlichen ZH-Formulars.

**Wortlaut:**

> Lex-Koller-Erklärung

### 5. `LK05_ingress`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Begründung (Protokoll):** Ingress nach dem ZH-Formular («Im Hinblick auf die Bestimmungen … erklären die Unterzeichnenden bezüglich der Gesellschaft … Folgendes zum angemeldeten Eintragungsgeschäft» — Haus-Fassung im Singular, da ein VR-Mitglied unterzeichnet).

**Wortlaut:**

> Im Hinblick auf die Bestimmungen des Bundesgesetzes und der Verordnung über den Erwerb von Grundstücken durch Personen im Ausland erklärt das unterzeichnende Mitglied des Verwaltungsrates bezüglich der Gesellschaft {{firma}}, mit Sitz in {{sitz}}, Folgendes zum angemeldeten Eintragungsgeschäft (Neueintragung/Gründung):

### 6. `LK06_fragen`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Begründung (Protokoll):** Die vier Erklärungen des ZH-Formulars verbatim-nah; Frage 4 betrifft nur Kapitalherabsetzungen und ist bei der Gründung als «nicht anwendbar» ausgewiesen (§8 — ehrlicher als eine leere Ankreuzzeile).

**Wortlaut:**

> 1. Personen im Ausland bzw. Personen, die für Rechnung von Personen im Ausland handeln, sind an der Gesellschaft beteiligt: {{lkFrage1}}.
> 2. Personen im Ausland bzw. Personen, die für Rechnung von Personen im Ausland handeln, erwerben im Zusammenhang mit dem angemeldeten Eintragungsgeschäft an der Gesellschaft neu eine Beteiligung: {{lkFrage2}}.
> 3. Bei Sacheinlage, Fusion, Umwandlung oder Spaltung: Die Gesellschaft erwirbt Nicht-Betriebsstätte-Grundstücke in der Schweiz: {{lkFrage3}}.
> 4. Bei Kapitalherabsetzung: nicht anwendbar (Gründung).

### 7. `LK07_definitionen`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Begründung (Protokoll):** Definitions-Fussnoten des ZH-Formulars (gekürzt um den GB-Staatsvertrags-Sonderfall SR 0.142.113.672 — als Detail dem Formular-Original vorbehalten; Abweichung offengelegt).

**Wortlaut:**

> Personen im Ausland (Art. 5 BewG) sind insbesondere: Ausländerinnen und Ausländer mit Wohnsitz im Ausland; Ausländerinnen und Ausländer mit Wohnsitz in der Schweiz, die weder Staatsangehörige eines EU-/EFTA-Mitgliedstaates sind noch eine gültige Niederlassungsbewilligung (Ausweis C) besitzen; juristische Personen mit Sitz im Ausland oder mit Sitz in der Schweiz, die von Personen im Ausland beherrscht werden; sowie Personen, die ein Grundstück auf Rechnung einer Person im Ausland erwerben. Betriebsstätte-Grundstück (Art. 2 Abs. 2 lit. a und Abs. 3 BewG) ist ein Grundstück, das als ständige Betriebsstätte eines nach kaufmännischer Art geführten Gewerbes, eines Handwerksbetriebes oder eines freien Berufes dient.

### 8. `LK08_folge`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Begründung (Protokoll):** Folgen-Hinweis des ZH-Formulars, kantonsneutral gefasst (ZH nennt die Bezirksräte — die Bewilligungsbehörde ist kantonal verschieden; Abweichung offengelegt).

**Wortlaut:**

> Kann die Handelsregisterbehörde die Bewilligungspflicht nicht ohne Weiteres ausschliessen, so setzt sie das Eintragungsverfahren aus und verweist die Anmeldenden an die zuständige kantonale Bewilligungsbehörde (Art. 18 Abs. 1 und 2 BewG).

### 9. `LK09_unterschrift`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** ZH-Formular: «Persönliche Unterschrift von einem Mitglied des obersten Leitungs- oder Verwaltungsorgans»; vorbelegt mit der Präsidentin / dem Präsidenten.

**Wortlaut:**

> Persönliche Unterschrift eines Mitglieds des Verwaltungsrates:
>
> _________________________________
> {{praesidentName}}

---

## Wahlannahmeerklärung

Schema `ag-wahlannahme` · Version 1.0.0 (ZH-Vorlage 26.7.2024; Wortlaut-Dossier 7.6.2026) · Format eingabe · Ausgabe fertig

> **Disclaimer (Fusszeile):** Erstellt mit LexMetrik – keine Rechtsberatung. Im Original einzureichen (Art. 20 HRegV); entbehrlich, wenn die Annahme in der öffentlichen Urkunde erklärt wird oder die gewählte Person die Handelsregister-Anmeldung selbst unterzeichnet (Praxis ZH/LU/BE).


### 1. `AW01_absender`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** absender
- **Begründung (Protokoll):** Absenderin/Absender ist die gewählte Person.

**Wortlaut:**

> {{personName}}
> {{personAdresse}}

### 2. `AW02_adressat`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** adressat
- **Begründung (Protokoll):** Adressatin ist die Gesellschaft (in Gründung); z.-H.-Zeile im passenden Numerus (D1).

**Wortlaut:**

> {{firma}}
> {{zuHandenZeile}}
> {{sitz}}

### 3. `AW03_datum`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** datumzeile
- **Begründung (Protokoll):** Ort und Datum.

**Wortlaut:**

> {{ortDatumZeile}}

### 4. `AW04_betreff`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** betreff
- **Begründung (Protokoll):** Betreff nach amtlicher ZH-Vorlage.

**Wortlaut:**

> Wahlannahmeerklärung

### 5. `AW05_anrede`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** anrede
- **Begründung (Protokoll):** Anrede nach amtlicher ZH-Vorlage.

**Wortlaut:**

> Sehr geehrte Damen und Herren

### 6. `AW06_text`

- [ ] **abgenommen** (David)
- **Norm:** Art. 43 Abs. 1 lit. c HRegV
- **Aufnahme:** immer
- **Begründung (Protokoll):** Annahme-Kernsatz – verbatim nach der amtlichen ZH-Vorlage (ag_vorlage_wahlannahme_vr).

**Wortlaut:**

> Gerne bestätige ich Ihnen, dass ich die Wahl als Mitglied des Verwaltungsrates der {{firma}}, in {{sitz}}, annehme.

### 7. `AW07_gruss`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** schlussformel
- **Begründung (Protokoll):** Schlussformel nach ZH-Vorlage.

**Wortlaut:**

> Mit freundlichen Grüssen

### 8. `AW08_unterschrift`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Original-Unterschrift der gewählten Person.

**Wortlaut:**

> _________________________________
> {{personName}}

---

## Wahlannahmeerklärung der Revisionsstelle

Schema `ag-wahlannahme-rs` · Version 1.0.0 (Haus-Fassung analog ZH-VR-Vorlage; Original-Suite 7.6.2026) · Format eingabe · Ausgabe fertig

> **Disclaimer (Fusszeile):** Erstellt mit LexMetrik – keine Rechtsberatung. Im Original einzureichen (Art. 20 HRegV); entbehrlich, wenn die Annahme in der öffentlichen Urkunde erklärt wird oder die Revisionsstelle die Handelsregister-Anmeldung mitunterzeichnet (Merkblatt HRegA ZH).


### 1. `AR01_absender`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** absender
- **Begründung (Protokoll):** Absenderin ist die gewählte Revisionsstelle.

**Wortlaut:**

> {{revisionsstelleName}}
> {{revisionsstelleSitz}}

### 2. `AR02_adressat`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** adressat
- **Begründung (Protokoll):** Adressatin ist die Gesellschaft (in Gründung).

**Wortlaut:**

> {{firma}}
> {{zuHandenZeile}}
> {{sitz}}

### 3. `AR03_datum`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** datumzeile
- **Begründung (Protokoll):** Ort und Datum.

**Wortlaut:**

> {{ortDatumZeile}}

### 4. `AR04_betreff`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** betreff
- **Begründung (Protokoll):** Betreff analog der amtlichen ZH-Vorlage für VR-Mitglieder.

**Wortlaut:**

> Wahlannahmeerklärung

### 5. `AR05_anrede`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** anrede
- **Begründung (Protokoll):** Anrede nach ZH-Vorlagen-Anatomie.

**Wortlaut:**

> Sehr geehrte Damen und Herren

### 6. `AR06_text`

- [ ] **abgenommen** (David)
- **Norm:** Art. 43 Abs. 1 lit. d HRegV
- **Aufnahme:** immer
- **Begründung (Protokoll):** Annahme-Kernsatz analog der amtlichen ZH-VR-Vorlage (0.6/D15); wir-Form, da die Revisionsstelle regelmässig eine juristische Person ist (Haus-Fassung, offengelegt).

**Wortlaut:**

> Gerne bestätigen wir Ihnen, dass wir die Wahl als Revisionsstelle der {{firma}}, in {{sitz}}, annehmen.

### 7. `AR07_gruss`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** schlussformel
- **Begründung (Protokoll):** Schlussformel nach ZH-Vorlagen-Anatomie.

**Wortlaut:**

> Mit freundlichen Grüssen

### 8. `AR08_unterschrift`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Unterschrift der Revisionsstelle (zeichnungsberechtigte Person).

**Wortlaut:**

> _________________________________
> {{revisionsstelleName}}

---

## Protokoll des Verwaltungsrates (Konstituierung)

Schema `ag-vr-protokoll` · Version 1.0.0 (ZH-Vorlage 26.7.2024; Wortlaut-Dossier 7.6.2026) · Format vertrag · Ausgabe fertig

> **Disclaimer (Fusszeile):** Erstellt mit LexMetrik – keine Rechtsberatung. Pflichtbeleg der AG-Gründung (Art. 43 Abs. 1 lit. e HRegV): Konstituierung, Vorsitz und Zeichnungsbefugnisse. Unterschriften von Vorsitz und Protokollführung (Art. 23 Abs. 2 HRegV); entbehrlich, wenn sämtliche VR-Mitglieder die Anmeldung unterzeichnen (Art. 23 Abs. 3 HRegV).


### 1. `VP01_ingress`

- [ ] **abgenommen** (David)
- **Norm:** Art. 43 Abs. 1 lit. e HRegV
- **Aufnahme:** immer
- **Begründung (Protokoll):** Protokoll-Kopf nach der amtlichen ZH-Vorlage (ag_vorlage_protokoll_vr; Zeilen-Reihenfolge Datum→Beginn→Ort wie das Original — Bug-Check-Befund 3); Mindestelemente der Praxis zu Art. 23 HRegV (Beginn der Sitzung, Anwesenheits-/Abwesenheits-Feststellung — Merkblatt «Formelle Anforderungen an Handelsregisterbelege», 7.1.2025; D13).

**Wortlaut:**

> der {{firma}}, mit Sitz in {{sitz}}
>
> Datum: {{datumZeile}}
> Beginn der Sitzung: {{sitzungBeginnZeile}}
> Ort: {{ort}}
> Anwesend: sämtliche Mitglieder des Verwaltungsrates
> Abwesend: keine
> Vorsitz: {{praesidentName}}
> Protokoll: {{protokollName}}

### 2. `VP02_eroeffnung` — «Eröffnung der Sitzung und Feststellung der Beschlussfähigkeit»

- [ ] **abgenommen** (David)
- **Norm:** Art. 713 OR
- **Aufnahme:** immer
- **Begründung (Protokoll):** Eröffnungs-Passus nach der amtlichen ZH-Vorlage. Haus-Abweichung (offengelegt): Der ZH-Einladungs-Feststellungssatz («Einladung gemäss den statutarischen Vorschriften fristgerecht») entfällt — bei der Konstituierungs-Sitzung unmittelbar nach der Gründung sind sämtliche Mitglieder anwesend (Kopf-Feststellung), womit Einberufungsmängel nach herrschender Auffassung unbeachtlich sind.

**Wortlaut:**

> {{praesidentName}} eröffnet die Sitzung und übernimmt den Vorsitz. {{protokollName}} amtet als Protokollführer/in. Der Vorsitzende stellt fest, dass der Verwaltungsrat in beschlussfähiger Anzahl anwesend ist. Gegen diese Feststellungen wird kein Widerspruch erhoben. Der Verwaltungsrat beschliesst:

### 3. `VP03_konstituierung` — «Konstituierung und Zeichnungsberechtigung»

- [ ] **abgenommen** (David)
- **Norm:** Art. 712 OR
- **Aufnahme:** immer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Selbstkonstituierung des VR (Präsidentenwahl bei mehrgliedrigem VR zwingend, Art. 712 Abs. 2 OR); Zeichnungsbefugnisse als Eintragungsinhalt.

**Wortlaut:**

> Der Verwaltungsrat konstituiert sich und erteilt seinen Mitgliedern Zeichnungsberechtigungen wie folgt:

### 4. `VP03b_vrliste`

- [ ] **abgenommen** (David)
- **Norm:** Art. 718 OR
- **Aufnahme:** immer
- **Wiederholt über:** `vrListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Je VR-Mitglied eine Zeile (Funktion + Zeichnungsart, ZH-Vorlagen-Struktur).

**Wortlaut:**

> – {{item.name}}, von {{item.herkunft}}, in {{item.wohnort}}: {{item.funktion}}, {{item.zeichnung}}

### 5. `VP04_weitere` — «Erteilung von weiteren Zeichnungsberechtigungen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 716a Abs. 1 Ziff. 4 OR
- **Aufnahme:** hatWeitereVertretungen = true
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Aufgenommen, weil weitere Vertretungsberechtigte (Direktion/Prokura) ernannt werden.

**Wortlaut:**

> Weitere Zeichnungsberechtigungen werden erteilt:

### 6. `VP04b_liste`

- [ ] **abgenommen** (David)
- **Norm:** Art. 718 Abs. 2 OR
- **Aufnahme:** hatWeitereVertretungen = true
- **Wiederholt über:** `vertretungsListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Je ernannte Person eine Zeile.

**Wortlaut:**

> – {{item.name}}, als {{item.funktion}}, mit {{item.zeichnung}}

### 7. `VP04c_ende`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Begründung (Protokoll):** Schluss-Zeile nach der amtlichen ZH-Vorlage; Mindestelement «Datum, Beginn und Ende der Sitzung» (Merkblatt 7.1.2025; D13).

**Wortlaut:**

> Ende der Sitzung: {{sitzungEndeZeile}}

### 8. `VP05_unterschriften`

- [ ] **abgenommen** (David)
- **Norm:** Art. 23 Abs. 2 HRegV
- **Aufnahme:** immer
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Unterschriften von Vorsitz und Protokollführung (Art. 23 Abs. 2 HRegV); für die HR-Einreichung Unterschriften der Vertretungsberechtigten amtlich beglaubigt (Praxis ZH).

**Wortlaut:**

> {{ortDatumZeile}}
>
> _________________________________
> {{praesidentName}} (Vorsitz)
>
> _________________________________
> {{protokollName}} (Protokoll)

---

## Domizilannahmeerklärung

Schema `ag-domizilannahme` · Version 1.0.0 (ZH-Vorlage 26.7.2024; Wortlaut-Dossier 7.6.2026) · Format eingabe · Ausgabe fertig

> **Disclaimer (Fusszeile):** Erstellt mit LexMetrik – keine Rechtsberatung. Erklärung der Domizilhalterin / des Domizilhalters nach Art. 117 Abs. 3 HRegV; im Original mit der Anmeldung einzureichen (Art. 43 Abs. 1 lit. g HRegV).


### 1. `AD01_absender`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** absender
- **Begründung (Protokoll):** Absender ist die Domizilhalterin / der Domizilhalter.

**Wortlaut:**

> {{domizilhalterName}}
> {{domizilhalterAdresse}}

### 2. `AD02_adressat`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** adressat
- **Begründung (Protokoll):** Adressatin ist die Gesellschaft an der c/o-Adresse.

**Wortlaut:**

> {{firma}}
> c/o {{domizilhalterName}}
> {{domizilhalterAdresse}}

### 3. `AD03_datum`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** datumzeile
- **Begründung (Protokoll):** Ort und Datum.

**Wortlaut:**

> {{ortDatumZeile}}

### 4. `AD04_betreff`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** betreff
- **Begründung (Protokoll):** Betreff nach amtlicher ZH-Vorlage.

**Wortlaut:**

> Domizilannahmeerklärung

### 5. `AD05_anrede`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** anrede
- **Begründung (Protokoll):** Anrede nach amtlicher ZH-Vorlage.

**Wortlaut:**

> Sehr geehrte Damen und Herren

### 6. `AD06_text`

- [ ] **abgenommen** (David)
- **Norm:** Art. 117 Abs. 3 HRegV
- **Aufnahme:** immer
- **Begründung (Protokoll):** Kernsatz nach den amtlichen ZH-Vorlagen (AG-Fassung sagt «Sitz gewähren» – Haus-Fassung einheitlich «Domizil», deckt Art. 117 Abs. 3 HRegV; Abweichung offengelegt).

**Wortlaut:**

> Gerne bestätigen wir Ihnen, dass wir der {{firma}}, mit Sitz in {{sitz}}, an unserer Adresse ({{domizilhalterAdresse}}) Domizil gewähren.

### 7. `AD07_gruss`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** schlussformel
- **Begründung (Protokoll):** Schlussformel nach ZH-Vorlage.

**Wortlaut:**

> Mit freundlichen Grüssen

### 8. `AD08_unterschrift`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Unterschrift der Domizilhalterin / des Domizilhalters.

**Wortlaut:**

> _________________________________
> {{domizilhalterName}}

---

## Anmeldung an das Handelsregisteramt

Schema `ag-hr-anmeldung` · Version 1.0.0 (ZH-Formular-Struktur; Wortlaut-Dossier 7.6.2026) · Format eingabe · Ausgabe fertig

> **Disclaimer (Fusszeile):** Erstellt mit LexMetrik – keine Rechtsberatung. Unterschriften beim Handelsregisteramt zeichnen oder beglaubigt einreichen (Art. 18 Abs. 2, Art. 21 HRegV); Gebühr CHF 420 (GebV-HReg, Anhang Ziff. 1.3). Belege im Original oder in beglaubigter Kopie (Art. 20 HRegV); per E-Mail eingereichte Unterlagen gelten als Kopien. Die Anmeldung ist auf Deutsch abzufassen (Praxis HRegA ZH); Ausweiskopien der einzutragenden Personen als separate, lose Beilage (Art. 24a HRegV – nicht öffentlich). Unterzeichnet eine bevollmächtigte Drittperson, Vollmachts-Kopie beilegen (Art. 17 HRegV).


### 1. `AA01_absender`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** absender
- **Begründung (Protokoll):** Absenderin ist die Gesellschaft in Gründung.

**Wortlaut:**

> {{firma}} (in Gründung)
> {{anmeldeAdresseZeile}}

### 2. `AA02_adressat`

- [ ] **abgenommen** (David)
- **Norm:** Art. 16 HRegV
- **Aufnahme:** immer
- **Layout-Rolle:** adressat
- **Begründung (Protokoll):** Zuständig ist das Handelsregisteramt am Sitz (Art. 16 HRegV).

**Wortlaut:**

> Handelsregisteramt des Kantons {{kanton}}

### 3. `AA03_datum`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** datumzeile
- **Begründung (Protokoll):** Ort und Datum.

**Wortlaut:**

> {{ortDatumZeile}}

### 4. `AA04_betreff`

- [ ] **abgenommen** (David)
- **Norm:** Art. 16 Abs. 1 HRegV
- **Aufnahme:** immer
- **Layout-Rolle:** betreff
- **Begründung (Protokoll):** Betreff mit Identifikation der Rechtseinheit (Art. 16 Abs. 1 HRegV).

**Wortlaut:**

> Anmeldung zur Eintragung der Gründung der {{firma}}

### 5. `AA05_text`

- [ ] **abgenommen** (David)
- **Norm:** Art. 16 Abs. 1 HRegV
- **Aufnahme:** immer
- **Begründung (Protokoll):** Anmeldungs-Kern: Identifikation und Beleg-Verweis (ZH-Formular-Struktur).

**Wortlaut:**

> Zur Eintragung in das Handelsregister wird angemeldet: die Gründung der {{firma}} mit Sitz in {{sitz}}. Die einzutragenden Tatsachen ergeben sich aus den beigelegten Belegen.

### 6. `AA06_beilagen` — «Beilagen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 43 HRegV
- **Aufnahme:** immer
- **Wiederholt über:** `belegeAnmeldung` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Beilagen-Liste aus der Gründungs-Konstellation – identisch mit der Checklisten-Engine (eine Quelle, §5).

**Wortlaut:**

> – {{item.titel}} ({{item.norm}})

### 7. `AA07_unterschriften`

- [ ] **abgenommen** (David)
- **Norm:** Art. 18 HRegV
- **Aufnahme:** immer
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Anmeldende Personen (Art. 17 HRegV); Unterschriften nach Art. 18 Abs. 2 HRegV.

**Wortlaut:**

> Die Mitglieder des Verwaltungsrates:

### 8. `AA07b_liste`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Wiederholt über:** `vrListe` (ein Absatz je Eintrag)
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Je anmeldende Person eine Unterschriftslinie.

**Wortlaut:**

> _________________________________
> {{item.name}}

---

**Summe:** 176 Bausteine in 12 Schemas.
