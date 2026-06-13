# Abnahme-Dossier: GmbH-Gründung — alle Bausteine Wort für Wort

**Zweck:** Wort-für-Wort-Abnahme durch David (fachkundige Person, CLAUDE.md §7).
Je Baustein eine Abhak-Zeile.

**Quelle:** `src/lib/vorlagen/gruendungGmbhDokumente.ts (GMBH_ALLE_SCHEMAS)`. **Generiert:**
`npx vite-node scripts/abnahme-dossiers.ts` — nach Engine-Änderungen NEU
laufen lassen; das Dossier ist eine Ableitung, keine zweite Pflege-Stelle (§5).

**Lesehilfe:** «Aufnahme: immer» = Baustein steht in jedem Dokument; sonst die
lesbare `includeIf`-Bedingung über die Antwort-Felder. «wiederholt über» =
ein Absatz je Listeneintrag ({{item.…}}-Platzhalter). {{platzhalter}} werden
beim Erzeugen interpoliert; Fragment-Felder (…Satz/…Zeile) verschwinden leer
ersatzlos.


---

## Statuten

Schema `gmbh-statuten` · Version 1.0.0 (Rechtsstand OR 1.1.2026; Wortlaut-Dossier 7.6.2026) · Format vertrag · Ausgabe entwurf

> **Disclaimer (Fusszeile):** Erstellt mit LexMetrik – keine Rechtsberatung. ENTWURF zur Vorbereitung der Gründung: Die Statuten der GmbH werden von der Urkundsperson geprüft und beglaubigt (Art. 22 Abs. 4 HRegV); massgeblich ist die beurkundete Fassung. Wortlaute nach den amtlichen Mustern ZH/SG/GL, verifiziert am OR-Stand 1.1.2026.


### 1. `ST00_ingress`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Begründung (Protokoll):** Identifikations-Ingress unter dem Dokumenttitel (Usanz aller amtlichen Muster).

**Wortlaut:**

> der {{firma}} mit Sitz in {{sitz}}

### 2. `ST01_firma_sitz` — «Firma und Sitz»

- [ ] **abgenommen** (David)
- **Norm:** Art. 776 Ziff. 1 OR
- **Aufnahme:** immer
- **Begründung (Protokoll):** Pflichtinhalt Firma/Sitz (SG-Kurzfassung in einem Artikel; ZH/GL/EHRA trennen in zwei – inhaltsgleich).

**Wortlaut:**

> Unter der Firma {{firma}} besteht mit Sitz in {{sitz}} auf unbestimmte Dauer eine Gesellschaft mit beschränkter Haftung gemäss Art. 772 ff. OR.

### 3. `ST02_zweck` — «Zweck»

- [ ] **abgenommen** (David)
- **Norm:** Art. 776 Ziff. 2 OR
- **Aufnahme:** immer
- **Begründung (Protokoll):** Pflichtinhalt Zweck.

**Wortlaut:**

> Die Gesellschaft bezweckt {{zweck}}.

### 4. `ST02b_zweck_erweiterung`

- [ ] **abgenommen** (David)
- **Norm:** Art. 776 Ziff. 2 OR
- **Aufnahme:** zweckErweiterung = true
- **Begründung (Protokoll):** Aufgenommen, weil die übliche Zweck-Erweiterungsklausel gewählt wurde (ZH-/GL-Muster-Wortlaut).

**Wortlaut:**

> Die Gesellschaft kann Zweigniederlassungen errichten, sich an anderen Unternehmen beteiligen, Grundstücke erwerben, halten und veräussern, Finanzierungen für eigene oder fremde Rechnung vornehmen sowie Sicherheiten für Verbindlichkeiten verbundener Gesellschaften leisten.

### 5. `ST03_stammkapital` — «Stammkapital und Stammanteile»

- [ ] **abgenommen** (David)
- **Norm:** Art. 776 Ziff. 3 OR
- **Aufnahme:** immer
- **Begründung (Protokoll):** Pflichtinhalt Stammkapital mit Anzahl und Nennwert der Stammanteile (Nennwert grösser als null, Art. 774 Abs. 1 OR rev. 2023 – kein 100-Franken-Minimum mehr).

**Wortlaut:**

> Das Stammkapital beträgt CHF {{stammkapitalFmt}}. Es ist eingeteilt in {{anzahlAnteile}} Stammanteile zu CHF {{nennwertFmt}}.

### 6. `ST10_nachschuss` — «Nachschusspflicht»

- [ ] **abgenommen** (David)
- **Norm:** Art. 795 OR
- **Aufnahme:** klausel_nachschuss = true
- **Begründung (Protokoll):** Aufgenommen, weil die Nachschusspflicht gewählt wurde; Betrag je Stammanteil zwingend, höchstens das Doppelte des Nennwerts (Abs. 2).

**Wortlaut:**

> Die Gesellschafter sind zur Leistung von Nachschüssen verpflichtet. Der Betrag der mit einem Stammanteil verbundenen Nachschusspflicht beträgt CHF {{nachschussFmt}}. Die Gesellschafter haften nur für die mit den eigenen Stammanteilen verbundenen Nachschüsse.

### 7. `ST11_nebenleistung` — «Nebenleistungspflichten»

- [ ] **abgenommen** (David)
- **Norm:** Art. 796 OR
- **Aufnahme:** klausel_nebenleistung = true
- **Begründung (Protokoll):** Aufgenommen, weil eine Nebenleistungspflicht gewählt wurde; Gegenstand und Umfang müssen in den Statuten bestimmt sein (Abs. 3).
- **Hinweis (offengelegt):** Zulässig nur, wenn die Pflicht dem Zweck, der Selbstständigkeit der Gesellschaft oder der Wahrung des Gesellschafterkreises dient (Art. 796 Abs. 2 OR).

**Wortlaut:**

> Mit sämtlichen Stammanteilen ist folgende Nebenleistungspflicht verbunden: {{nebenleistungText}}

### 8. `ST12_konkurrenzverbot` — «Konkurrenzverbot»

- [ ] **abgenommen** (David)
- **Norm:** Art. 803 Abs. 2 und 3 OR
- **Aufnahme:** klausel_konkurrenzverbot = true
- **Begründung (Protokoll):** Aufgenommen, weil das Gesellschafter-Konkurrenzverbot gewählt wurde (Wortlaut ZH/SG/GL/EHRA konvergent); Befreiungsweg nach Abs. 3 wählbar.

**Wortlaut:**

> Die Gesellschafter dürfen keine die Gesellschaft konkurrenzierenden Tätigkeiten ausüben. Solche Tätigkeiten sind zulässig, sofern {{konkurrenzBefreiungSatz}}.

### 9. `ST13_vorkauf_verfahren` — «Vorkaufsrecht: Verfahren»

- [ ] **abgenommen** (David)
- **Norm:** Art. 786 Abs. 2 OR
- **Aufnahme:** klausel_vorkaufsrecht = true
- **Begründung (Protokoll):** Aufgenommen, weil das Vorkaufsrecht gewählt wurde; Fristen 30/60/10/60 Tage nach den wortgleichen amtlichen Mustern ZH, SG, GL und EHRA.

**Wortlaut:**

> Jedem Gesellschafter steht an den Stammanteilen der anderen Gesellschafter ein Vorkaufsrecht zu den folgenden Bedingungen zu.
> Verkauft ein Gesellschafter Stammanteile und wird dadurch ein Vorkaufsfall ausgelöst, so meldet er dies innerhalb von 30 Tagen seit dessen Eintritt den anderen Gesellschaftern und der Geschäftsführung durch eingeschriebenen Brief.
> Die Vorkaufsberechtigten können ihr Vorkaufsrecht innerhalb einer Frist von 60 Tagen seit Empfang der Mitteilung des Vorkaufsfalls durch eingeschriebenen Brief an die Geschäftsführung ausüben. Die Ausübung muss stets sämtliche Stammanteile umfassen, die Gegenstand des Vorkaufsfalls bilden. Üben mehrere Vorkaufsberechtigte ihr Vorkaufsrecht aus, so werden die Stammanteile entsprechend ihrer bisherigen Beteiligung an der Gesellschaft zugewiesen.
> Nach Ablauf der Ausübungsfrist setzt die Geschäftsführung die Gesellschafter innerhalb von 10 Tagen mit eingeschriebenem Brief über die Ausübung in Kenntnis. Ausgeübte Vorkaufsrechte sind innerhalb von 60 Tagen seit Ablauf der Ausübungsfrist gegen Vergütung des gesamten Kaufpreises zu vollziehen.

### 10. `ST14_vorkauf_preis` — «Vorkaufsrecht: Preis»

- [ ] **abgenommen** (David)
- **Norm:** Art. 786 Abs. 2 OR
- **Aufnahme:** klausel_vorkaufsrecht = true
- **Begründung (Protokoll):** Preisbestimmung zum wirklichen Wert mit Schiedsgutachter-Mechanik (amtliche Muster).
- **Hinweis (offengelegt):** Ersatzbestimmung des Schiedsgutachters bewusst kantonsneutral («oberes kantonales Gericht») – die Muster nennen ZH/GL den Obergerichts-, SG den Handelsgerichtspräsidenten.

**Wortlaut:**

> Das Vorkaufsrecht ist zum wirklichen Wert der Stammanteile im Zeitpunkt des Eintritts des Vorkaufsfalls auszuüben.
> Einigen sich die Beteiligten nicht innerhalb von 30 Tagen über den wirklichen Wert, so wird dieser endgültig und für alle Beteiligten verbindlich durch eine zugelassene Revisionsexpertin oder einen zugelassenen Revisionsexperten als Schiedsgutachter festgestellt. Einigen sich die Beteiligten nicht auf die Person des Schiedsgutachters, so wird diese durch die Präsidentin oder den Präsidenten des am Sitz der Gesellschaft zuständigen oberen kantonalen Gerichts bezeichnet.

### 11. `ST15_stimmrecht` — «Stimmrecht»

- [ ] **abgenommen** (David)
- **Norm:** Art. 806 Abs. 2 OR
- **Aufnahme:** klausel_stimmrecht = true
- **Begründung (Protokoll):** Aufgenommen, weil das Stimmrecht nach Anteilszahl gewählt wurde (Abweichung vom Nennwert-Default des Art. 806 Abs. 1 OR).
- **Hinweis (offengelegt):** Voraussetzung: Die Stammanteile mit dem tiefsten Nennwert weisen mindestens einen Zehntel des Nennwerts der übrigen auf; für RS-Wahl, Sachverständige und Verantwortlichkeitsklage gilt die Anteilszahl-Bemessung nicht (Art. 806 Abs. 2 und 3 OR).

**Wortlaut:**

> Das Stimmrecht der Gesellschafter bemisst sich nach der Zahl ihrer Stammanteile; auf jeden Stammanteil entfällt eine Stimme.

### 12. `ST16_vetorecht` — «Vetorecht»

- [ ] **abgenommen** (David)
- **Norm:** Art. 807 OR
- **Aufnahme:** klausel_vetorecht = true
- **Begründung (Protokoll):** Aufgenommen, weil ein Vetorecht gewählt wurde; die Statuten müssen die erfassten Beschlüsse umschreiben (Abs. 1).
- **Hinweis (offengelegt):** Das Vetorecht ist unübertragbar; die nachträgliche Einführung bedürfte der Zustimmung aller Gesellschafter (Art. 807 Abs. 2 und 3 OR).

**Wortlaut:**

> Jedem Gesellschafter steht ein Vetorecht gegen folgende Beschlüsse der Gesellschafterversammlung zu: {{vetoBeschluesse}}

### 13. `ST19_virtuelle_gv` — «Gesellschafterversammlung»

- [ ] **abgenommen** (David)
- **Norm:** Art. 701d OR
- **Aufnahme:** virtuelleGv = true
- **Begründung (Protokoll):** Aufgenommen, weil die virtuelle Gesellschafterversammlung ermöglicht werden soll (statutarische Grundlage nötig; Art. 701d OR, auf die GmbH anwendbar über die Verweisung in Art. 805 Abs. 5 Ziff. 2bis OR).
- **Hinweis (offengelegt):** Ein genereller statutarischer Verzicht auf die unabhängige Stimmrechtsvertretung ist unzulässig – zulässig ist nur die Einzelfall-Ermächtigung (EHRA-Praxismitteilung 1/23).

**Wortlaut:**

> Die Gesellschafterversammlung kann vor Ort, hybrid oder mit elektronischen Mitteln ohne Tagungsort (virtuell) durchgeführt werden. Bei einer virtuellen Gesellschafterversammlung kann die Geschäftsführung im Einzelfall auf die Bezeichnung einer unabhängigen Stimmrechtsvertretung verzichten.

### 14. `ST20_mitteilungen` — «Mitteilungen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 776 Ziff. 4 OR
- **Aufnahme:** immer
- **Begründung (Protokoll):** Pflichtinhalt Form der Mitteilungen (rev. 2023 – ersetzt die frühere SHAB-Bekanntmachungs-Ziffer; Wortlaut ZH/SG).

**Wortlaut:**

> Die Mitteilungen der Gesellschaft an die Gesellschafter erfolgen per Brief oder E-Mail an die im Anteilbuch verzeichneten Adressen.

---

## Öffentliche Urkunde über den Errichtungsakt

Schema `gmbh-errichtungsakt` · Version 1.0.0 (Rechtsstand OR 1.1.2026; Wortlaut-Dossier 7.6.2026) · Format verfuegung · Ausgabe entwurf

> **Disclaimer (Fusszeile):** Erstellt mit LexMetrik – keine Rechtsberatung. ENTWURF zur Vorbereitung des Beurkundungstermins: Der Errichtungsakt der GmbH bedarf der öffentlichen Beurkundung (Art. 777 Abs. 1 OR); die Urkunde entsteht bei der Urkundsperson. Gliederung und Wortlaute nach den amtlichen Vorlagen ZH/SG (2023/2024).


### 1. `EA01_ingress`

- [ ] **abgenommen** (David)
- **Norm:** Art. 72 lit. a HRegV
- **Aufnahme:** immer
- **Begründung (Protokoll):** Urkunden-Ingress mit Personalien-Block (Art. 72 lit. a HRegV).

**Wortlaut:**

> Gründung der {{firma}} mit Sitz in {{sitz}}
>
> Vor der unterzeichnenden Urkundsperson sind heute erschienen:

### 2. `EA02_gruenderliste`

- [ ] **abgenommen** (David)
- **Norm:** Art. 72 lit. a HRegV
- **Aufnahme:** immer
- **Wiederholt über:** `gruenderListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Personenangaben zu allen Gründerinnen und Gründern.

**Wortlaut:**

> – {{item.name}}{{item.angabenZeile}}

### 3. `EA03_erklaerung` — «I. Gründungserklärung und Statuten»

- [ ] **abgenommen** (David)
- **Norm:** Art. 777 Abs. 1 OR
- **Aufnahme:** immer
- **Begründung (Protokoll):** Gründungserklärung und Statutenfestlegung in der öffentlichen Urkunde (Art. 72 lit. b und c HRegV).

**Wortlaut:**

> Die erschienenen Personen erklären, eine Gesellschaft mit beschränkter Haftung unter der Firma {{firma}} mit Sitz in {{sitz}} zu gründen, und legen hiermit die beiliegenden Statuten fest, die Bestandteil dieser Urkunde bilden.

### 4. `EA04_zeichnung` — «II. Stammkapital und Zeichnung»

- [ ] **abgenommen** (David)
- **Norm:** Art. 777a Abs. 1 OR
- **Aufnahme:** immer
- **Begründung (Protokoll):** Zeichnung der Stammanteile mit Anzahl, Nennwert und Ausgabebetrag – bei der Gründung erfolgt die Zeichnung in der Urkunde selbst (Art. 72 lit. d HRegV); Ausgabe zum Nennwert (Erstausbau ohne Agio). Nennwert und Ausgabebetrag gelten aus diesem Vorspann für jede einzelne Zeichnungszeile (Lösung des ZH-Musters).

**Wortlaut:**

> Das Stammkapital der Gesellschaft beträgt CHF {{stammkapitalFmt}} und ist eingeteilt in {{anzahlAnteile}} Stammanteile zu je CHF {{nennwertFmt}} (Nennwert), welche zum Ausgabebetrag von CHF {{nennwertFmt}} je Stammanteil wie folgt gezeichnet werden:

### 5. `EA05_zeichnungsliste`

- [ ] **abgenommen** (David)
- **Norm:** Art. 72 lit. d HRegV
- **Aufnahme:** immer
- **Wiederholt über:** `gruenderListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Zeichnungserklärung jeder Gründerin / jedes Gründers (Anzahl je Person; Nennwert, Ausgabebetrag und Kategorie aus dem Vorspann-Baustein – zusammen decken beide Art. 72 lit. d HRegV ab).

**Wortlaut:**

> – {{item.name}}: {{item.anzahl}} Stammanteile

### 6. `EA06_hinweis_777a`

- [ ] **abgenommen** (David)
- **Norm:** Art. 777a Abs. 2 OR
- **Aufnahme:** klauselHinweisListe nicht leer
- **Begründung (Protokoll):** Aufgenommen, weil statutarische Gestaltungen mit Hinweispflicht in der Zeichnungs-Urkunde gewählt wurden (Ziff. 1–5).

**Wortlaut:**

> Gemäss Statuten bestehen folgende Bestimmungen, auf die hiermit im Sinne von Art. 777a Abs. 2 OR hingewiesen wird:

### 7. `EA06b_hinweisliste`

- [ ] **abgenommen** (David)
- **Norm:** Art. 777a Abs. 2 OR
- **Aufnahme:** klauselHinweisListe nicht leer
- **Wiederholt über:** `klauselHinweisListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Je hinweispflichtige statutarische Bestimmung eine Zeile.

**Wortlaut:**

> – {{item.label}}

### 8. `EA07_einlagen_bank_genannt` — «III. Einlagen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 777c OR
- **Aufnahme:** bankInUrkundeGenannt = true
- **Begründung (Protokoll):** Bareinlage mit Banknennung in der Urkunde – die separate Bankbescheinigung als HR-Beleg entfällt (Art. 71 Abs. 1 lit. g HRegV).

**Wortlaut:**

> Sämtliche Einlagen von gesamthaft CHF {{stammkapitalFmt}} wurden in Geld geleistet und sind bei der {{bankName}}, {{bankOrt}}, einer Bank nach Art. 1 des Bundesgesetzes über die Banken und Sparkassen, zur ausschliesslichen Verfügung der Gesellschaft hinterlegt. Damit ist für jeden Stammanteil eine dem Ausgabebetrag entsprechende Einlage vollständig geleistet.

### 9. `EA07_einlagen_bescheinigung` — «III. Einlagen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 777c OR
- **Aufnahme:** bankInUrkundeGenannt = false
- **Begründung (Protokoll):** Bareinlage mit separater Bankbescheinigung (Beleg nach Art. 71 Abs. 1 lit. g HRegV).

**Wortlaut:**

> Sämtliche Einlagen von gesamthaft CHF {{stammkapitalFmt}} wurden in Geld geleistet und gemäss separater Bescheinigung bei einer Bank nach Art. 1 des Bundesgesetzes über die Banken und Sparkassen zur ausschliesslichen Verfügung der Gesellschaft hinterlegt. Damit ist für jeden Stammanteil eine dem Ausgabebetrag entsprechende Einlage vollständig geleistet.

### 10. `EA08_feststellungen_mit_pflichten` — «IV. Feststellungen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 777 Abs. 2 OR
- **Aufnahme:** hatNachschussOderNebenleistung = true
- **Begründung (Protokoll):** Gesetzliche Feststellungen Ziff. 1–5 einschliesslich Übernahme der statutarischen Nachschuss-/Nebenleistungspflichten (Ziff. 4) – Wortlaut der Norm folgend (ZH-Vorlage identisch).

**Wortlaut:**

> Die Gründerinnen und Gründer stellen fest, dass:
> – sämtliche Stammanteile gültig gezeichnet sind;
> – die Einlagen dem gesamten Ausgabebetrag entsprechen;
> – die gesetzlichen und statutarischen Anforderungen an die Einlagen im Zeitpunkt der Unterzeichnung des Errichtungsakts erfüllt sind;
> – sie die statutarischen Nachschuss- oder Nebenleistungspflichten übernehmen;
> – keine anderen Sacheinlagen, Verrechnungstatbestände oder besonderen Vorteile bestehen, als die in den Belegen genannten.

### 11. `EA08_feststellungen_ohne_pflichten` — «IV. Feststellungen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 777 Abs. 2 OR
- **Aufnahme:** hatNachschussOderNebenleistung = false
- **Begründung (Protokoll):** Gesetzliche Feststellungen Ziff. 1–3 und 5; Ziff. 4 entfällt, weil die Statuten keine Nachschuss- oder Nebenleistungspflichten vorsehen (ZH-Vorlage: Klammer-Variante).

**Wortlaut:**

> Die Gründerinnen und Gründer stellen fest, dass:
> – sämtliche Stammanteile gültig gezeichnet sind;
> – die Einlagen dem gesamten Ausgabebetrag entsprechen;
> – die gesetzlichen und statutarischen Anforderungen an die Einlagen im Zeitpunkt der Unterzeichnung des Errichtungsakts erfüllt sind;
> – keine anderen Sacheinlagen, Verrechnungstatbestände oder besonderen Vorteile bestehen, als die in den Belegen genannten.

### 12. `EA09_organbestellung` — «V. Organe»

- [ ] **abgenommen** (David)
- **Norm:** Art. 777 Abs. 1 OR
- **Aufnahme:** immer
- **Begründung (Protokoll):** Organbestellung in der Urkunde; Personenangaben nach Art. 72 lit. f HRegV.

**Wortlaut:**

> Als Geschäftsführerinnen und Geschäftsführer werden bestellt:

### 13. `EA09b_gfliste`

- [ ] **abgenommen** (David)
- **Norm:** Art. 72 lit. f HRegV
- **Aufnahme:** immer
- **Wiederholt über:** `gfListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Je Geschäftsführerin/Geschäftsführer eine Zeile mit Heimatort/Staatsangehörigkeit, Wohnort und Zeichnungsart (Usanz ZH-Protokolle).

**Wortlaut:**

> – {{item.name}}, von {{item.herkunft}}, in {{item.wohnort}}{{item.vorsitzZeile}}, mit {{item.zeichnung}}

### 14. `EA10_revisionsstelle`

- [ ] **abgenommen** (David)
- **Norm:** Art. 72 lit. g HRegV
- **Aufnahme:** optingOut = false
- **Begründung (Protokoll):** Aufgenommen, weil eine Revisionsstelle bestellt wird.

**Wortlaut:**

> Als Revisionsstelle wird gewählt: {{revisionsstelleName}}, {{revisionsstelleSitz}}.

### 15. `EA11_opting_out`

- [ ] **abgenommen** (David)
- **Norm:** Art. 727a Abs. 2 OR
- **Aufnahme:** optingOut = true
- **Begründung (Protokoll):** Opting-out bei der Gründung: dreigliedrige Feststellung direkt in der Urkunde (Art. 72 lit. g HRegV; ZH-KMU-Merkblatt und SG-Formular wortgleich).

**Wortlaut:**

> Auf eine Revision wird verzichtet. Die Gründerinnen und Gründer stellen fest, dass:
> – die Gesellschaft die Voraussetzungen für die Pflicht zur ordentlichen Revision nicht erfüllt;
> – die Gesellschaft nicht mehr als zehn Vollzeitstellen im Jahresdurchschnitt hat;
> – sämtliche Gründerinnen und Gründer auf eine eingeschränkte Revision verzichten.

### 16. `EA12_domizil_eigen` — «VI. Rechtsdomizil»

- [ ] **abgenommen** (David)
- **Norm:** Art. 117 Abs. 2 HRegV
- **Aufnahme:** eigeneBueros = true
- **Begründung (Protokoll):** Eigene Adresse am Sitz.

**Wortlaut:**

> Das Rechtsdomizil der Gesellschaft befindet sich an folgender Adresse: {{rechtsdomizilAdresse}}.

### 17. `EA12_domizil_co` — «VI. Rechtsdomizil»

- [ ] **abgenommen** (David)
- **Norm:** Art. 117 Abs. 3 HRegV
- **Aufnahme:** eigeneBueros = false
- **Begründung (Protokoll):** c/o-Domizil mit Domizilannahmeerklärung als Beleg (Art. 71 Abs. 1 lit. h HRegV).

**Wortlaut:**

> Die Gesellschaft hat ihr Rechtsdomizil als c/o-Adresse bei {{domizilhalterName}}, {{domizilhalterAdresse}}. Die Erklärung der Domizilhalterin bzw. des Domizilhalters liegt vor.

### 18. `EA13_nachtragsvollmacht` — «VII. Vollmacht»

- [ ] **abgenommen** (David)
- **Norm:** Art. 72 HRegV
- **Aufnahme:** immer
- **Begründung (Protokoll):** Vorsorgliche Nachtragsvollmacht für Beanstandungen (ZH-Vorlagen-Klausel) – vermeidet einen zweiten Termin aller Gründer.

**Wortlaut:**

> Die Gründerinnen und Gründer bevollmächtigen jede Gründerin und jeden Gründer sowie jede Geschäftsführerin und jeden Geschäftsführer einzeln, allfällige von der Handelsregisterbehörde beanstandete Punkte dieser Urkunde oder der Statuten durch einen öffentlich zu beurkundenden Nachtrag namens aller Gründerinnen und Gründer zu bereinigen.

### 19. `EA14_gruendungserklaerung` — «VIII. Gründungserklärung»

- [ ] **abgenommen** (David)
- **Norm:** Art. 777 Abs. 1 OR
- **Aufnahme:** immer
- **Begründung (Protokoll):** Abschliessende Gründungserklärung (ZH-Vorlage wortgleich, Singular/Plural vereinheitlicht).

**Wortlaut:**

> Abschliessend erklären die erschienenen Personen die Gesellschaft den gesetzlichen Vorschriften entsprechend als gegründet.

### 20. `EA15_belege` — «Bestätigung der Urkundsperson»

- [ ] **abgenommen** (David)
- **Norm:** Art. 777b OR
- **Aufnahme:** immer
- **Begründung (Protokoll):** Beleg-Nennung und Vorlage-Bestätigung durch die Urkundsperson; die Liste folgt aus der Gründungs-Konstellation.

**Wortlaut:**

> Die Urkundsperson nennt die Belege über die Gründung einzeln und bestätigt, dass diese ihr und den Gründerinnen und Gründern vorgelegen haben (Art. 777b Abs. 1 OR):

### 21. `EA15b_belegliste`

- [ ] **abgenommen** (David)
- **Norm:** Art. 777b Abs. 2 OR
- **Aufnahme:** immer
- **Wiederholt über:** `belegeListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Je Beleg eine Zeile (Art. 777b Abs. 2 OR; bei der Bargründung: Statuten und – sofern die Bank nicht in der Urkunde genannt ist – die Hinterlegungs-Bestätigung).

**Wortlaut:**

> – {{item.titel}}

### 22. `EA16_unterschriften`

- [ ] **abgenommen** (David)
- **Norm:** Art. 72 lit. i HRegV
- **Aufnahme:** immer
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Unterschriften der Gründerinnen und Gründer (Art. 72 lit. i HRegV).

**Wortlaut:**

> {{ortDatumZeile}}
>
> Die Gründerinnen und Gründer:

### 23. `EA16b_unterschriftenliste`

- [ ] **abgenommen** (David)
- **Norm:** Art. 72 lit. i HRegV
- **Aufnahme:** immer
- **Wiederholt über:** `gruenderListe` (ein Absatz je Eintrag)
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Je Gründerin/Gründer eine Unterschriftslinie.

**Wortlaut:**

> _________________________________
> {{item.name}}

### 24. `EA17_urkundsperson`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Beurkundungsvermerk – wird von der Urkundsperson nach kantonalem Beurkundungsrecht ergänzt.

**Wortlaut:**

> Die Urkundsperson:
>
> _________________________________

---

## Wahlannahmeerklärung

Schema `gmbh-wahlannahme` · Version 1.0.0 (ZH-Vorlage 26.7.2024; Wortlaut-Dossier 7.6.2026) · Format eingabe · Ausgabe fertig

> **Disclaimer (Fusszeile):** Erstellt mit LexMetrik – keine Rechtsberatung. Im Original einzureichen (Art. 20 HRegV); entbehrlich, wenn die Annahme in der öffentlichen Urkunde erklärt wird oder die gewählte Person die Handelsregister-Anmeldung selbst unterzeichnet (Praxis ZH/SG/LU).


### 1. `WA01_absender`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** absender
- **Begründung (Protokoll):** Absenderin/Absender ist die gewählte Person.

**Wortlaut:**

> {{personName}}
> {{personAdresse}}

### 2. `WA02_adressat`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** adressat
- **Begründung (Protokoll):** Adressatin ist die Gesellschaft (in Gründung).

**Wortlaut:**

> {{firma}}
> z. H. der Gründerinnen und Gründer
> {{sitz}}

### 3. `WA03_datum`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** datumzeile
- **Begründung (Protokoll):** Ort und Datum.

**Wortlaut:**

> {{ortDatumZeile}}

### 4. `WA04_betreff`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** betreff
- **Begründung (Protokoll):** Betreff nach amtlicher ZH-Vorlage.

**Wortlaut:**

> Wahlannahmeerklärung

### 5. `WA05_anrede`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** anrede
- **Begründung (Protokoll):** Anrede nach amtlicher ZH-Vorlage.

**Wortlaut:**

> Sehr geehrte Damen und Herren

### 6. `WA06_text`

- [ ] **abgenommen** (David)
- **Norm:** Art. 71 Abs. 1 lit. c HRegV
- **Aufnahme:** immer
- **Begründung (Protokoll):** Annahme-Kernsatz – verbatim nach der amtlichen ZH-Vorlage (gmbh_vorlage_wahlannahme_gf).

**Wortlaut:**

> Gerne bestätige ich Ihnen, dass ich die Wahl als Mitglied der Geschäftsführung der {{firma}}, in {{sitz}}, annehme.

### 7. `WA07_gruss`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** schlussformel
- **Begründung (Protokoll):** Schlussformel nach ZH-Vorlage.

**Wortlaut:**

> Mit freundlichen Grüssen

### 8. `WA08_unterschrift`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Original-Unterschrift der gewählten Person (Praxis ZH: original handschriftlich).

**Wortlaut:**

> _________________________________
> {{personName}}

---

## Domizilannahmeerklärung

Schema `gmbh-domizilannahme` · Version 1.0.0 (ZH-Vorlage 26.7.2024; Wortlaut-Dossier 7.6.2026) · Format eingabe · Ausgabe fertig

> **Disclaimer (Fusszeile):** Erstellt mit LexMetrik – keine Rechtsberatung. Erklärung der Domizilhalterin / des Domizilhalters nach Art. 117 Abs. 3 HRegV; im Original mit der Anmeldung einzureichen (Art. 71 Abs. 1 lit. h HRegV).


### 1. `DA01_absender`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** absender
- **Begründung (Protokoll):** Absender ist die Domizilhalterin / der Domizilhalter.

**Wortlaut:**

> {{domizilhalterName}}
> {{domizilhalterAdresse}}

### 2. `DA02_adressat`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** adressat
- **Begründung (Protokoll):** Adressatin ist die Gesellschaft an der c/o-Adresse.

**Wortlaut:**

> {{firma}}
> c/o {{domizilhalterName}}
> {{domizilhalterAdresse}}

### 3. `DA03_datum`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** datumzeile
- **Begründung (Protokoll):** Ort und Datum.

**Wortlaut:**

> {{ortDatumZeile}}

### 4. `DA04_betreff`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** betreff
- **Begründung (Protokoll):** Betreff nach amtlicher ZH-Vorlage.

**Wortlaut:**

> Domizilannahmeerklärung

### 5. `DA05_anrede`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** anrede
- **Begründung (Protokoll):** Anrede nach amtlicher ZH-Vorlage.

**Wortlaut:**

> Sehr geehrte Damen und Herren

### 6. `DA06_text`

- [ ] **abgenommen** (David)
- **Norm:** Art. 117 Abs. 3 HRegV
- **Aufnahme:** immer
- **Begründung (Protokoll):** Kernsatz verbatim nach der amtlichen ZH-Vorlage (gmbh_vorlage_domizilannahmeerklaerung).

**Wortlaut:**

> Gerne bestätigen wir Ihnen, dass wir der {{firma}}, mit Sitz in {{sitz}}, an unserer Adresse ({{domizilhalterAdresse}}) Domizil gewähren.

### 7. `DA07_gruss`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** schlussformel
- **Begründung (Protokoll):** Schlussformel nach ZH-Vorlage.

**Wortlaut:**

> Mit freundlichen Grüssen

### 8. `DA08_unterschrift`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Unterschrift der Domizilhalterin / des Domizilhalters.

**Wortlaut:**

> _________________________________
> {{domizilhalterName}}

---

## Beschluss über den Vorsitz der Geschäftsführung

Schema `gmbh-vorsitz-beschluss` · Version 1.0.0 (Wortlaut-Dossier 7.6.2026) · Format vertrag · Ausgabe fertig

> **Disclaimer (Fusszeile):** Erstellt mit LexMetrik – keine Rechtsberatung. Beschluss der Gründerinnen und Gründer als Beleg nach Art. 71 Abs. 1 lit. e HRegV; entbehrlich, wenn der Vorsitz bereits im Errichtungsakt geregelt ist (Art. 71 Abs. 2 HRegV).


### 1. `VB01_ingress`

- [ ] **abgenommen** (David)
- **Norm:** Art. 71 Abs. 1 lit. e HRegV
- **Aufnahme:** immer
- **Begründung (Protokoll):** Beschluss-Ingress (Protokoll-Form nach Art. 23 HRegV).

**Wortlaut:**

> Die unterzeichnenden Gründerinnen und Gründer der {{firma}}, mit Sitz in {{sitz}}, beschliessen hiermit:

### 2. `VB02_beschluss`

- [ ] **abgenommen** (David)
- **Norm:** Art. 809 Abs. 3 OR
- **Aufnahme:** immer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Vorsitz-Regelung bei mehreren Geschäftsführern (zwingend, Art. 809 Abs. 3 OR).

**Wortlaut:**

> Der Vorsitz der Geschäftsführung wird {{vorsitzName}} übertragen.

### 3. `VB03_unterschriften`

- [ ] **abgenommen** (David)
- **Norm:** Art. 23 Abs. 2 HRegV
- **Aufnahme:** immer
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Unterschriften aller Gründerinnen und Gründer (Zirkularbeschluss: alle Mitglieder, Art. 23 Abs. 2 HRegV).

**Wortlaut:**

> {{ortDatumZeile}}
>
> Die Gründerinnen und Gründer:

### 4. `VB03b_liste`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Wiederholt über:** `gruenderListe` (ein Absatz je Eintrag)
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Je Gründerin/Gründer eine Unterschriftslinie.

**Wortlaut:**

> _________________________________
> {{item.name}}

---

## Beschluss über die Ernennung weiterer Vertretungsberechtigter

Schema `gmbh-ernennungs-beschluss` · Version 1.0.0 (Wortlaut-Dossier 7.6.2026) · Format vertrag · Ausgabe fertig

> **Disclaimer (Fusszeile):** Erstellt mit LexMetrik – keine Rechtsberatung. Beschluss der Gründerinnen und Gründer als Beleg nach Art. 71 Abs. 1 lit. f HRegV (Direktorinnen/Direktoren, Prokuristinnen/Prokuristen – Ernennungskompetenz Art. 804 Abs. 3 OR).


### 1. `EB01_ingress`

- [ ] **abgenommen** (David)
- **Norm:** Art. 71 Abs. 1 lit. f HRegV
- **Aufnahme:** immer
- **Begründung (Protokoll):** Beschluss-Ingress.

**Wortlaut:**

> Die unterzeichnenden Gründerinnen und Gründer der {{firma}}, mit Sitz in {{sitz}}, beschliessen hiermit die Ernennung der folgenden weiteren zur Vertretung berechtigten Personen:

### 2. `EB02_liste`

- [ ] **abgenommen** (David)
- **Norm:** Art. 804 Abs. 3 OR
- **Aufnahme:** immer
- **Wiederholt über:** `vertretungsListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Je ernannte Person eine Zeile mit Funktion und Zeichnungsart.

**Wortlaut:**

> – {{item.name}}, als {{item.funktion}}, mit {{item.zeichnung}}

### 3. `EB03_unterschriften`

- [ ] **abgenommen** (David)
- **Norm:** Art. 23 Abs. 2 HRegV
- **Aufnahme:** immer
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Unterschriften aller Gründerinnen und Gründer (Art. 23 Abs. 2 HRegV).

**Wortlaut:**

> {{ortDatumZeile}}
>
> Die Gründerinnen und Gründer:

### 4. `EB03b_liste`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Wiederholt über:** `gruenderListe` (ein Absatz je Eintrag)
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Je Gründerin/Gründer eine Unterschriftslinie.

**Wortlaut:**

> _________________________________
> {{item.name}}

---

## Anmeldung an das Handelsregisteramt

Schema `gmbh-hr-anmeldung` · Version 1.0.0 (ZH-Formular-Struktur; Wortlaut-Dossier 7.6.2026) · Format eingabe · Ausgabe fertig

> **Disclaimer (Fusszeile):** Erstellt mit LexMetrik – keine Rechtsberatung. Unterschriften beim Handelsregisteramt zeichnen oder beglaubigt einreichen (Art. 18 Abs. 2, Art. 21 HRegV); Gebühr CHF 420 (GebV-HReg, Anhang Ziff. 1.3). Belege im Original oder in beglaubigter Kopie (Art. 20 HRegV).


### 1. `AN01_absender`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** absender
- **Begründung (Protokoll):** Absenderin ist die Gesellschaft in Gründung.

**Wortlaut:**

> {{firma}} (in Gründung)
> {{anmeldeAdresseZeile}}

### 2. `AN02_adressat`

- [ ] **abgenommen** (David)
- **Norm:** Art. 16 HRegV
- **Aufnahme:** immer
- **Layout-Rolle:** adressat
- **Begründung (Protokoll):** Zuständig ist das Handelsregisteramt am Sitz (Art. 16 HRegV).

**Wortlaut:**

> Handelsregisteramt des Kantons {{kanton}}

### 3. `AN03_datum`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** datumzeile
- **Begründung (Protokoll):** Ort und Datum.

**Wortlaut:**

> {{ortDatumZeile}}

### 4. `AN04_betreff`

- [ ] **abgenommen** (David)
- **Norm:** Art. 16 Abs. 1 HRegV
- **Aufnahme:** immer
- **Layout-Rolle:** betreff
- **Begründung (Protokoll):** Betreff mit Identifikation der Rechtseinheit (Art. 16 Abs. 1 HRegV).

**Wortlaut:**

> Anmeldung zur Eintragung der Gründung der {{firma}}

### 5. `AN05_text`

- [ ] **abgenommen** (David)
- **Norm:** Art. 16 Abs. 1 HRegV
- **Aufnahme:** immer
- **Begründung (Protokoll):** Anmeldungs-Kern: Identifikation und Verweis auf die Belege (zulässig nach Art. 16 Abs. 1 HRegV; ZH-Formular-Struktur).

**Wortlaut:**

> Zur Eintragung in das Handelsregister wird angemeldet: die Gründung der {{firma}} mit Sitz in {{sitz}}. Die einzutragenden Tatsachen ergeben sich aus den beigelegten Belegen.

### 6. `AN06_beilagen` — «Beilagen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 71 HRegV
- **Aufnahme:** immer
- **Wiederholt über:** `belegeAnmeldung` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Beilagen-Liste aus der Gründungs-Konstellation – identisch mit der Checklisten-Engine (eine Quelle, §5).

**Wortlaut:**

> – {{item.titel}} ({{item.norm}})

### 7. `AN07_unterschriften`

- [ ] **abgenommen** (David)
- **Norm:** Art. 18 HRegV
- **Aufnahme:** immer
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Anmeldende Personen (Art. 17 HRegV); Unterschriften nach Art. 18 Abs. 2 HRegV.

**Wortlaut:**

> Die Geschäftsführerinnen und Geschäftsführer:

### 8. `AN07b_liste`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Wiederholt über:** `gfListe` (ein Absatz je Eintrag)
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Je anmeldende Person eine Unterschriftslinie.

**Wortlaut:**

> _________________________________
> {{item.name}}

---

**Summe:** 70 Bausteine in 7 Schemas.
