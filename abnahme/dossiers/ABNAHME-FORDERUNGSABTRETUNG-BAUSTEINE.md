# Abnahme-Dossier: Forderungsabtretung (Zession) — alle Bausteine Wort für Wort

**Zweck:** Wort-für-Wort-Abnahme durch David (fachkundige Person, CLAUDE.md §7).
Je Baustein eine Abhak-Zeile.

**Quelle:** `src/lib/vorlagen/forderungsabtretung.ts (FA_SCHEMA)`. **Generiert:**
`npx vite-node scripts/abnahme-dossiers.ts` — nach Engine-Änderungen NEU
laufen lassen; das Dossier ist eine Ableitung, keine zweite Pflege-Stelle (§5).

**Lesehilfe:** «Aufnahme: immer» = Baustein steht in jedem Dokument; sonst die
lesbare `includeIf`-Bedingung über die Antwort-Felder. «wiederholt über» =
ein Absatz je Listeneintrag ({{item.…}}-Platzhalter). {{platzhalter}} werden
beim Erzeugen interpoliert; Fragment-Felder (…Satz/…Zeile) verschwinden leer
ersatzlos.


---

## Abtretungserklärung (Zession)

Schema `forderungsabtretung` · Version 1.0.0 (Wettbewerbsanalyse V2; Art. 164/165/167/170 OR verifiziert 20260101) · Format eingabe · Ausgabe fertig

> **Disclaimer (Fusszeile):** Erstellt mit LexMetrik. Keine Rechtsberatung. Die Abtretung setzt die Abtretbarkeit der Forderung voraus (Art. 164 Abs. 1 OR); massgebend sind Gesetz und konkreter Sachverhalt.


### 1. `FA_absender`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** absender
- **Begründung (Protokoll):** Zedentin/Zedent als erklärende Partei – ihre Unterschrift verlangt die Schriftform (Art. 165 Abs. 1 OR).

**Wortlaut:**

> {{absenderBlock}}

### 2. `FA_adressat`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** adressat
- **Begründung (Protokoll):** Zessionarin/Zessionar als Erwerberin der Forderung und Empfängerin der Erklärung.

**Wortlaut:**

> {{adressatBlock}}

### 3. `FA_datumzeile`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** datumzeile
- **Begründung (Protokoll):** Ort und Datum der Erklärung – immer enthalten.

**Wortlaut:**

> {{ort}}, {{datumFmt}}

### 4. `FA_betreff`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** betreff
- **Begründung (Protokoll):** Betreff mit bestimmter Bezeichnung der abgetretenen Forderung.

**Wortlaut:**

> Abtretungserklärung (Zession) – {{forderungBeschrieb}}

### 5. `FA_anrede`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** anrede
- **Begründung (Protokoll):** Anrede – immer enthalten.

**Wortlaut:**

> Sehr geehrte Damen und Herren

### 6. `FA_abtretung`

- [ ] **abgenommen** (David)
- **Norm:** Art. 164 Abs. 1 und Art. 165 Abs. 1 OR
- **Aufnahme:** immer
- **Begründung (Protokoll):** Kern der Erklärung: Verfügung über die bestimmt bezeichnete Forderung; der gesetzliche Übergang der Nebenrechte wird deklaratorisch wiedergegeben.

**Wortlaut:**

> Hiermit trete ich meine Forderung gegen {{schuldnerName}}{{schuldnerAdresseSatz}} ({{forderungBeschrieb}}{{betragSatz}}) an Sie ab. Mit der Forderung gehen die Vorzugs- und Nebenrechte auf Sie über, soweit sie nicht untrennbar mit meiner Person verknüpft sind (Art. 170 Abs. 1 OR).

### 7. `FA_zinsen`

- [ ] **abgenommen** (David)
- **Norm:** Art. 170 Abs. 3 OR
- **Aufnahme:** zinsenAusdruecklich = true
- **Begründung (Protokoll):** Klarstellung: Der Übergang der rückständigen Zinse ist von Gesetzes wegen nur VERMUTET (Art. 170 Abs. 3 OR) – die ausdrückliche Nennung stellt ihn ausser Streit.

**Wortlaut:**

> Mitabgetreten sind ausdrücklich auch die rückständigen Zinse.

### 8. `FA_urkunden`

- [ ] **abgenommen** (David)
- **Norm:** Art. 170 Abs. 2 OR
- **Aufnahme:** urkundenUebergabe = true
- **Begründung (Protokoll):** Wiedergabe der gesetzlichen Auslieferungs- und Auskunftspflicht der Zedentin (Art. 170 Abs. 2 OR) als ausdrückliche Zusage.

**Wortlaut:**

> Die Schuldurkunde und die vorhandenen Beweismittel händige ich Ihnen aus; die zur Geltendmachung der Forderung nötigen Aufschlüsse erteile ich Ihnen.

### 9. `FA_anzeige`

- [ ] **abgenommen** (David)
- **Aufnahme:** anzeigeAnkuendigen = true
- **Begründung (Protokoll):** Praxis-Standard: Bis zur Anzeige kann der Schuldner in gutem Glauben befreiend an die bisherige Gläubigerin leisten (Art. 167 OR) – die Ankündigung dokumentiert die vorgesehene Anzeige.

**Wortlaut:**

> Der Schuldner wird über die Abtretung schriftlich in Kenntnis gesetzt.

### 10. `FA_schluss`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** schlussformel
- **Begründung (Protokoll):** Schlussformel – immer enthalten.

**Wortlaut:**

> Freundliche Grüsse

### 11. `FA_unterschrift`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Unterschrift der abtretenden Partei – Schriftform ist Gültigkeitsvoraussetzung (Art. 165 Abs. 1 OR).

**Wortlaut:**

> ___________________________
> {{absenderName}} (Zedentin/Zedent)

### 12. `FA_annahme`

- [ ] **abgenommen** (David)
- **Aufnahme:** annahmeZeile = true
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Gegenzeichnung der Erwerberin – formfrei möglich und keine Gültigkeitsvoraussetzung; sie dokumentiert die Annahme.

**Wortlaut:**

> Von der Abtretung Kenntnis genommen und mit ihr einverstanden:
> ___________________________
> {{adressatName}} (Zessionarin/Zessionar)

---

**Summe:** 12 Bausteine in 1 Schemas.
