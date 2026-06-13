# Abnahme-Dossier: Konkubinatsvertrag — alle Bausteine Wort für Wort

**Zweck:** Wort-für-Wort-Abnahme durch David (fachkundige Person, CLAUDE.md §7).
Je Baustein eine Abhak-Zeile.

**Quelle:** `src/lib/vorlagen/konkubinat.ts (KK_SCHEMA)`. **Generiert:**
`npx vite-node scripts/abnahme-dossiers.ts` — nach Engine-Änderungen NEU
laufen lassen; das Dossier ist eine Ableitung, keine zweite Pflege-Stelle (§5).

**Lesehilfe:** «Aufnahme: immer» = Baustein steht in jedem Dokument; sonst die
lesbare `includeIf`-Bedingung über die Antwort-Felder. «wiederholt über» =
ein Absatz je Listeneintrag ({{item.…}}-Platzhalter). {{platzhalter}} werden
beim Erzeugen interpoliert; Fragment-Felder (…Satz/…Zeile) verschwinden leer
ersatzlos.


---

## Konkubinatsvertrag

Schema `konkubinat` · Version 1.0.0 (Wettbewerbsanalyse V3; Art. 19 OR, Art. 646/650/651 ZGB, Art. 530/548/549 OR verifiziert 20260101) · Format vertrag · Ausgabe fertig

> **Disclaimer (Fusszeile):** Erstellt mit LexMetrik. Keine Rechtsberatung. Der Konkubinatsvertrag ist ein Innominatvertrag (Art. 19 OR) und formfrei gültig; die beidseitige Unterzeichnung dient dem Beweis. Es besteht kein gesetzliches Konkubinatsrecht; Belange gemeinsamer Kinder richten sich nach dem Gesetz. Massgebend sind Gesetz und der konkrete Einzelfall.


### 1. `KK01_parteien`

- [ ] **abgenommen** (David)
- **Norm:** Art. 19 OR
- **Aufnahme:** immer
- **Layout-Rolle:** parteien
- **Begründung (Protokoll):** Bezeichnung der Vertragsparteien – immer enthalten.

**Wortlaut:**

> zwischen
>
> {{partner1Block}}
> (Partnerin/Partner 1)
>
> und
>
> {{partner2Block}}
> (Partnerin/Partner 2)

### 2. `KK02_grundsatz` — «Grundsatz»

- [ ] **abgenommen** (David)
- **Norm:** Art. 19 OR
- **Aufnahme:** immer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Klarstellung der Rechtsnatur (kein gesetzliches Konkubinatsrecht) – immer enthalten.

**Wortlaut:**

> Die Parteien führen eine nichteheliche Lebensgemeinschaft (Konkubinat). Sie halten fest, dass zwischen ihnen kein gesetzliches Unterhalts-, Beistands- oder Güterrecht besteht; dieser Vertrag regelt ihr Zusammenleben und die Folgen einer Trennung im Rahmen der Vertragsfreiheit (Art. 19 OR).

### 3. `KK03_wohnen` — «Wohnen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 19 OR
- **Aufnahme:** wohnenAufnehmen = true
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Wohn-Regelung (Mietverhältnis/Nutzung) – nur wenn aufgenommen.

**Wortlaut:**

> Für die gemeinsame Wohnsituation gilt: {{wohnBeschrieb}}. Zieht eine Partei aus, verständigen sich die Parteien rechtzeitig über die Weiterführung oder Auflösung des Mietverhältnisses bzw. die Nutzung der Wohnung.

### 4. `KK04_kosten` — «Kosten des Zusammenlebens»

- [ ] **abgenommen** (David)
- **Norm:** Art. 19 OR
- **Aufnahme:** immer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Verteilung der Lebenshaltungskosten (hälftig / nach Einkommen / fix) und gemeinsames Konto – immer enthalten.

**Wortlaut:**

> {{kostenText}}{{kontoSatz}}

### 5. `KK05_vermoegen` — «Vermögen und Inventar»

- [ ] **abgenommen** (David)
- **Norm:** Art. 646 ZGB
- **Aufnahme:** immer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Zuordnung von Allein- und Miteigentum (Art. 646 ZGB) und Inventarverweis – immer enthalten.

**Wortlaut:**

> Jede Partei behält das Alleineigentum an den von ihr eingebrachten und allein angeschafften Sachen. Gemeinsam angeschaffte Sachen stehen mangels anderer Abrede im Miteigentum zu gleichen Teilen (Art. 646 ZGB).{{inventarSatz}}

### 6. `KK06_gesellschaft` — «Gemeinsamer Zweck»

- [ ] **abgenommen** (David)
- **Norm:** Art. 530 OR
- **Aufnahme:** einfacheGesellschaft = true
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Einfache Gesellschaft für gemeinsame Zwecke (Art. 530/548/549 OR) – nur wenn vereinbart.

**Wortlaut:**

> Verfolgen die Parteien einen gemeinsamen Zweck mit gemeinsamen Mitteln ({{einfacheGesellschaftZweck}}), bilden sie insoweit eine einfache Gesellschaft (Art. 530 OR). Bei deren Auflösung erfolgt die Auseinandersetzung nach Art. 548 f. OR: Rückerstattung der Vermögensbeiträge und Verteilung eines Überschusses bzw. eines Fehlbetrags je zur Hälfte, soweit nichts anderes vereinbart ist.

### 7. `KK07_kinder` — «Gemeinsame Kinder»

- [ ] **abgenommen** (David)
- **Norm:** Art. 19 OR
- **Aufnahme:** kinderHinweis = true
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Deklaratorischer Hinweis auf die zwingende gesetzliche Ordnung des Kindesrechts – nur wenn gewählt.

**Wortlaut:**

> Die Parteien nehmen zur Kenntnis, dass sich die elterliche Sorge und der Unterhalt gemeinsamer Kinder zwingend nach dem Gesetz (ZGB) richten und nicht zulasten des Kindes durch diesen Vertrag geregelt werden können. Eine Unterhaltsvereinbarung bedarf der Genehmigung der Kindesschutzbehörde.

### 8. `KK08_aufloesung` — «Auflösung des Konkubinats»

- [ ] **abgenommen** (David)
- **Norm:** Art. 651 ZGB
- **Aufnahme:** immer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Auflösungsfolgen: Rücknahme Alleineigentum, Aufhebung Miteigentum (Art. 650 f. ZGB), Kontosaldo – immer enthalten.

**Wortlaut:**

> Bei Auflösung der Lebensgemeinschaft nimmt jede Partei ihr Alleineigentum zurück. Miteigentum wird aufgehoben; können sich die Parteien über die Art nicht einigen, gelten die gesetzlichen Teilungsregeln (Art. 650 f. ZGB: körperliche Teilung, Verkauf oder Übernahme gegen Auskauf). Ein gemeinsames Konto wird saldiert und der Saldo nach dem vereinbarten Kostenschlüssel ausgeglichen. Gegenseitige Ansprüche aus der Zeit des Zusammenlebens sind damit, vorbehältlich abweichender schriftlicher Abrede, abgegolten.

### 9. `KK09_vorsorge` — «Vorsorge und Erbrecht»

- [ ] **abgenommen** (David)
- **Norm:** Art. 19 OR
- **Aufnahme:** vorsorgeHinweis = true
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Hinweis auf fehlendes gesetzliches Erbrecht und separate Vorsorge-/Begünstigungsregelung – nur wenn gewählt.

**Wortlaut:**

> Den Parteien ist bewusst, dass zwischen ihnen kein gesetzliches Erbrecht besteht. Wer den Partner absichern will, regelt dies gesondert durch Begünstigung (Säule 3a, Pensionskasse) und letztwillige Verfügung.

### 10. `KK09b_mediation` — «Streitbeilegung und Gerichtsstand»

- [ ] **abgenommen** (David)
- **Norm:** Art. 19 OR
- **Aufnahme:** detailgrad = "experte"
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Mediations-/Gerichtsstandsklausel mit Vorbehalt der Kindesbelange – Detailgrad «experte».

**Wortlaut:**

> Die Parteien versuchen, Streitigkeiten aus diesem Vertrag zunächst durch Gespräch oder Mediation beizulegen. Gelingt dies nicht, ist ausschliesslicher Gerichtsstand der Wohnsitz der beklagten Partei, soweit nicht zwingende Gerichtsstände entgegenstehen. Belange gemeinsamer Kinder bleiben dem zwingenden Recht vorbehalten.

### 11. `KK10_schluss` — «Schlussbestimmungen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 19 OR
- **Aufnahme:** immer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Schriftform, salvatorische Klausel, Ausfertigung, Rechtswahl – immer enthalten.

**Wortlaut:**

> Änderungen und Ergänzungen dieses Vertrags bedürfen der Schriftform. Sollte eine Bestimmung unwirksam sein, bleibt der Vertrag im Übrigen gültig. Dieser Vertrag wird in zwei Exemplaren ausgefertigt; jede Partei erhält ein unterzeichnetes Exemplar. Es gilt schweizerisches Recht.

### 12. `KK11_unterschriften`

- [ ] **abgenommen** (David)
- **Norm:** Art. 19 OR
- **Aufnahme:** immer
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Ort, Datum und beidseitige Unterschriften – dienen dem Beweis (formfreier Vertrag).

**Wortlaut:**

> {{ort}}, {{datumFmt}}
>
>
> Partnerin/Partner 1:
>
> ___________________________
> {{partner1Name}}
>
>
> Partnerin/Partner 2:
>
> ___________________________
> {{partner2Name}}

---

**Summe:** 12 Bausteine in 1 Schemas.
