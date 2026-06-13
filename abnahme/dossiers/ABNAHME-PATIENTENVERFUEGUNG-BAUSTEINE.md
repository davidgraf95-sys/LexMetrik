# Abnahme-Dossier: Patientenverfügung — alle Bausteine Wort für Wort

**Zweck:** Wort-für-Wort-Abnahme durch David (fachkundige Person, CLAUDE.md §7).
Je Baustein eine Abhak-Zeile.

**Quelle:** `src/lib/vorlagen/patientenverfuegung.ts (PV_SCHEMA)`. **Generiert:**
`npx vite-node scripts/abnahme-dossiers.ts` — nach Engine-Änderungen NEU
laufen lassen; das Dossier ist eine Ableitung, keine zweite Pflege-Stelle (§5).

**Lesehilfe:** «Aufnahme: immer» = Baustein steht in jedem Dokument; sonst die
lesbare `includeIf`-Bedingung über die Antwort-Felder. «wiederholt über» =
ein Absatz je Listeneintrag ({{item.…}}-Platzhalter). {{platzhalter}} werden
beim Erzeugen interpoliert; Fragment-Felder (…Satz/…Zeile) verschwinden leer
ersatzlos.


---

## Patientenverfügung

Schema `patientenverfuegung` · Version 1.0.0 (Rechtsstand Art. 370–373 ZGB, in Kraft seit 1.1.2013) · Format verfuegung · Ausgabe fertig

> **Disclaimer (Fusszeile):** Entwurf – erstellt mit LexMetrik. Keine Rechts- oder medizinische Beratung. Gültig wird die Patientenverfügung erst mit handschriftlichem Datum und eigenhändiger Unterschrift (Art. 371 Abs. 1 ZGB). Empfohlen: Kopien an Vertretungsperson und Hausarztpraxis; Erneuerung der Unterschrift etwa alle zwei Jahre (Empfehlung, keine Pflicht).


### 1. `P01_identifikation`

- [ ] **abgenommen** (David)
- **Norm:** Art. 370 Abs. 1 ZGB
- **Aufnahme:** immer
- **Begründung (Protokoll):** Identifikation und Urteilsfähigkeits-Präambel – immer enthalten.

**Wortlaut:**

> Ich, {{vorname}} {{name}}, geboren am {{geburtsdatum}}, wohnhaft {{wohnort}}{{versichertenZeile}}, verfüge im Vollbesitz meiner Urteilsfähigkeit und nach reiflicher Überlegung für den Fall, dass ich urteilsunfähig werde, was folgt:

### 2. `P02_werte` — «Meine Werte und Anliegen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 372 Abs. 2 ZGB
- **Aufnahme:** werteText nicht leer
- **Begründung (Protokoll):** Aufgenommen, weil eine Werteerklärung erfasst wurde (hilft bei der Auslegung).

**Wortlaut:**

> {{werteText}}

### 3. `P03_situationen` — «Anwendungssituationen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 370 Abs. 1 ZGB
- **Aufnahme:** situationenListe nicht leer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Aufgenommen, weil Anwendungssituationen gewählt wurden.

**Wortlaut:**

> Diese Verfügung gilt insbesondere in folgenden Situationen meiner Urteilsunfähigkeit:

### 4. `P03b_situationenliste`

- [ ] **abgenommen** (David)
- **Norm:** Art. 370 Abs. 1 ZGB
- **Aufnahme:** situationenListe nicht leer
- **Wiederholt über:** `situationenListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Je gewählte Situation eine Zeile.

**Wortlaut:**

> – {{item.label}}

### 5. `P04_ziel` — «Behandlungsziel»

- [ ] **abgenommen** (David)
- **Norm:** Art. 370 Abs. 1 ZGB
- **Aufnahme:** zielText nicht leer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Aufgenommen, weil ein Behandlungsziel gewählt wurde.

**Wortlaut:**

> {{zielText}}

### 6. `P05_massnahmen` — «Konkrete medizinische Massnahmen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 370 Abs. 1 ZGB
- **Aufnahme:** massnahmenListe nicht leer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Aufgenommen, weil zu mindestens einer Massnahme ein Entscheid getroffen wurde.

**Wortlaut:**

> Zu den folgenden Massnahmen verfüge ich:

### 7. `P05b_massnahmenliste`

- [ ] **abgenommen** (David)
- **Norm:** Art. 370 Abs. 1 ZGB
- **Aufnahme:** massnahmenListe nicht leer
- **Wiederholt über:** `massnahmenListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Je entschiedene Massnahme eine Zeile (zustimmen / ablehnen / nur befristet).

**Wortlaut:**

> – {{item.label}}: {{item.entscheid}}.

### 8. `P06_palliativ`

- [ ] **abgenommen** (David)
- **Norm:** Art. 370 Abs. 1 ZGB
- **Aufnahme:** immer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Immer enthalten: Leidenslinderung inkl. zulässiger indirekter Sterbehilfe; Sedierung gekoppelt.
- **Hinweis (offengelegt):** Indirekte Sterbehilfe (Leidenslinderung mit möglicher Lebensverkürzung) ist zulässig – im Unterschied zu aktiver Sterbehilfe und Suizidhilfe (Art. 114/115 StGB), die nicht anordenbar sind.

**Wortlaut:**

> Schmerz- und Symptombehandlung: Ich wünsche in jedem Fall eine fachgerechte Linderung von Schmerzen, Atemnot und Angst – auch wenn dadurch als nicht beabsichtigte Nebenwirkung mein Sterben beschleunigt werden könnte. Reichen andere Mittel nicht aus, ist eine palliative Sedierung zulässig.

### 9. `P07_vertretung` — «Vertretungsperson»

- [ ] **abgenommen** (David)
- **Norm:** Art. 370 Abs. 2 ZGB
- **Aufnahme:** vertretungName nicht leer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Aufgenommen, weil eine Vertretungsperson bezeichnet wurde.

**Wortlaut:**

> Als vertretungsberechtigte Person bezeichne ich: {{vertretungName}}{{vertretungKontaktZeile}}. Sie soll mit der behandelnden Ärztin oder dem behandelnden Arzt die medizinischen Massnahmen besprechen und in meinem Namen entscheiden, soweit diese Verfügung keine Antwort gibt; massgebend sind dabei mein mutmasslicher Wille und meine Interessen.

### 10. `P07b_weisungen`

- [ ] **abgenommen** (David)
- **Norm:** Art. 370 Abs. 2 ZGB
- **Aufnahme:** vertretungWeisungen nicht leer
- **Begründung (Protokoll):** Aufgenommen, weil Weisungen an die Vertretungsperson erfasst wurden.

**Wortlaut:**

> Weisungen an meine Vertretungsperson: {{vertretungWeisungen}}

### 11. `P07c_ersatz`

- [ ] **abgenommen** (David)
- **Norm:** Art. 370 Abs. 3 ZGB
- **Aufnahme:** ersatzName nicht leer
- **Begründung (Protokoll):** Aufgenommen, weil eine Ersatzperson bezeichnet wurde (Ersatzverfügung).

**Wortlaut:**

> Kann oder will die bezeichnete Person die Vertretung nicht übernehmen oder ist sie ungeeignet, bezeichne ich als Ersatzperson: {{ersatzName}}.

### 12. `P08_schweigepflicht`

- [ ] **abgenommen** (David)
- **Norm:** Art. 370 Abs. 2 ZGB
- **Aufnahme:** vertretungName nicht leer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Automatisch aufgenommen, weil eine Vertretungsperson bezeichnet wurde (RULE R5).

**Wortlaut:**

> Ich entbinde die mich behandelnden Ärztinnen, Ärzte und Fachpersonen gegenüber meiner Vertretungsperson und der Ersatzperson von der beruflichen Schweigepflicht.

### 13. `P09_sterbeort` — «Sterbeort und Begleitung»

- [ ] **abgenommen** (David)
- **Norm:** Art. 370 Abs. 1 ZGB
- **Aufnahme:** sterbeortBegleitung nicht leer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Aufgenommen, weil Wünsche zu Sterbeort/Begleitung erfasst wurden.

**Wortlaut:**

> {{sterbeortBegleitung}}

### 14. `P10_organspende` — «Organspende»

- [ ] **abgenommen** (David)
- **Norm:** Art. 370 Abs. 1 ZGB
- **Aufnahme:** organspendeText nicht leer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Aufgenommen, weil eine Haltung zur Organspende festgelegt wurde.
- **Hinweis (offengelegt):** Den Organspende-Entscheid zusätzlich auf Ausweis/Register festhalten; Wechsel zur Widerspruchslösung voraussichtlich Q3 2027 (terminlich offen).

**Wortlaut:**

> {{organspendeText}}

### 15. `P11_ersetzt`

- [ ] **abgenommen** (David)
- **Norm:** Art. 371 Abs. 3 ZGB
- **Aufnahme:** ersetztFruehere = true
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Aufgenommen, weil «frühere Verfügungen ersetzen» gewählt wurde (Widerruf sinngemäss).

**Wortlaut:**

> Diese Patientenverfügung ersetzt alle früheren Patientenverfügungen.

### 16. `P12_schluss`

- [ ] **abgenommen** (David)
- **Norm:** Art. 371 Abs. 1 ZGB
- **Aufnahme:** immer
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Schlussformel: Datum und Unterschrift werden HANDSCHRIFTLICH geleistet – immer enthalten.

**Wortlaut:**

> {{ortZeile}}Datum (von Hand einzusetzen): ____________________
>
>
> _________________________________
> (eigenhändige Unterschrift: {{vorname}} {{name}})

---

**Summe:** 16 Bausteine in 1 Schemas.
