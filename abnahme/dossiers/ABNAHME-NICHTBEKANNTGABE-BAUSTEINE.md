# Abnahme-Dossier: Gesuch um Nichtbekanntgabe einer Betreibung — alle Bausteine Wort für Wort

**Zweck:** Wort-für-Wort-Abnahme durch David (fachkundige Person, CLAUDE.md §7).
Je Baustein eine Abhak-Zeile.

**Quelle:** `src/lib/vorlagen/nichtbekanntgabe.ts (NB_SCHEMA)`. **Generiert:**
`npx vite-node scripts/abnahme-dossiers.ts` — nach Engine-Änderungen NEU
laufen lassen; das Dossier ist eine Ableitung, keine zweite Pflege-Stelle (§5).

**Lesehilfe:** «Aufnahme: immer» = Baustein steht in jedem Dokument; sonst die
lesbare `includeIf`-Bedingung über die Antwort-Felder. «wiederholt über» =
ein Absatz je Listeneintrag ({{item.…}}-Platzhalter). {{platzhalter}} werden
beim Erzeugen interpoliert; Fragment-Felder (…Satz/…Zeile) verschwinden leer
ersatzlos.


---

## Gesuch um Nichtbekanntgabe einer Betreibung

Schema `nichtbekanntgabe-betreibung` · Version 1.0.0 (Wettbewerbsanalyse V2; Art. 8a SchKG, Fassung 1.1.2026, verifiziert 20260101) · Format eingabe · Ausgabe fertig

> **Disclaimer (Fusszeile):** Erstellt mit LexMetrik. Keine Rechtsberatung. Der Eintrag wird nicht gelöscht, sondern Dritten nicht mehr bekannt gegeben (Art. 8a Abs. 3 lit. d SchKG); massgebend sind Gesetz und konkreter Sachverhalt.


### 1. `NB_absender`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** absender
- **Begründung (Protokoll):** Schuldnerin/Schuldner als gesuchstellende Partei.

**Wortlaut:**

> {{absenderBlock}}

### 2. `NB_adressat`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** adressat
- **Begründung (Protokoll):** Das Betreibungsamt, das die Betreibung führt – es entscheidet über die Nichtbekanntgabe (Art. 8a Abs. 3 lit. d SchKG).

**Wortlaut:**

> {{adressatBlock}}

### 3. `NB_datumzeile`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** datumzeile
- **Begründung (Protokoll):** Ort und Datum der Erklärung – immer enthalten.

**Wortlaut:**

> {{ort}}, {{datumFmt}}

### 4. `NB_betreff`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** betreff
- **Begründung (Protokoll):** Betreff mit Betreibungsnummer zur eindeutigen Zuordnung.

**Wortlaut:**

> Gesuch um Nichtbekanntgabe der Betreibung Nr. {{betreibungNr}} (Art. 8a Abs. 3 lit. d SchKG)

### 5. `NB_anrede`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** anrede
- **Begründung (Protokoll):** Anrede – immer enthalten.

**Wortlaut:**

> Sehr geehrte Damen und Herren

### 6. `NB_sachverhalt`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Begründung (Protokoll):** Sachverhalt mit den beiden Tatbestands-Anknüpfungen: Zustellungsdatum (Fristbeginn) und erhobener Rechtsvorschlag.

**Wortlaut:**

> In der Betreibung Nr. {{betreibungNr}}{{glaeubigerSatz}} wurde mir der Zahlungsbefehl am {{zustellungFmt}} zugestellt. Ich habe Rechtsvorschlag erhoben.

### 7. `NB_antrag`

- [ ] **abgenommen** (David)
- **Norm:** Art. 8a Abs. 3 lit. d SchKG
- **Aufnahme:** immer
- **Begründung (Protokoll):** Kern des Gesuchs: Antrag auf Nichtbekanntgabe nach Ablauf der 3-Monats-Frist (Art. 8a Abs. 3 lit. d SchKG, Fassung in Kraft seit 1.1.2026).

**Wortlaut:**

> Da seit der Zustellung des Zahlungsbefehls mehr als drei Monate verstrichen sind, ersuche ich Sie, diese Betreibung Dritten nicht mehr zur Kenntnis zu geben.

### 8. `NB_kein_verfahren`

- [ ] **abgenommen** (David)
- **Aufnahme:** keinVerfahrenBekannt = true
- **Begründung (Protokoll):** Abwählbare Zusatz-Aussage – den förmlichen Nachweis verlangt das Amt beim Gläubiger (20-Tage-Frist, Art. 79–84 SchKG).

**Wortlaut:**

> Ein Verfahren zur Beseitigung des Rechtsvorschlags ist mir nicht bekannt.

### 9. `NB_beilage`

- [ ] **abgenommen** (David)
- **Aufnahme:** beilageZb = true
- **Begründung (Protokoll):** Beilagen-Zeile – erleichtert dem Amt die Zuordnung.

**Wortlaut:**

> Beilage: Kopie des Zahlungsbefehls.

### 10. `NB_dank`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Begründung (Protokoll):** Schlusssatz – immer enthalten.

**Wortlaut:**

> Ich danke Ihnen für die Prüfung dieses Gesuchs und stehe für Rückfragen zur Verfügung.

### 11. `NB_schluss`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** schlussformel
- **Begründung (Protokoll):** Schlussformel – immer enthalten.

**Wortlaut:**

> Mit freundlichen Grüssen

### 12. `NB_unterschrift`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Unterschrift der gesuchstellenden Partei.

**Wortlaut:**

> ___________________________
> {{absenderName}}

---

**Summe:** 12 Bausteine in 1 Schemas.
