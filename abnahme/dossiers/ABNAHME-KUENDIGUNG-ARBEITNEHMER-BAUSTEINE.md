# Abnahme-Dossier: Kündigung durch Arbeitnehmer — alle Bausteine Wort für Wort

**Zweck:** Wort-für-Wort-Abnahme durch David (fachkundige Person, CLAUDE.md §7).
Je Baustein eine Abhak-Zeile.

**Quelle:** `src/lib/vorlagen/kuendigungArbeitnehmer.ts (KAN_SCHEMA)`. **Generiert:**
`npx vite-node scripts/abnahme-dossiers.ts` — nach Engine-Änderungen NEU
laufen lassen; das Dossier ist eine Ableitung, keine zweite Pflege-Stelle (§5).

**Lesehilfe:** «Aufnahme: immer» = Baustein steht in jedem Dokument; sonst die
lesbare `includeIf`-Bedingung über die Antwort-Felder. «wiederholt über» =
ein Absatz je Listeneintrag ({{item.…}}-Platzhalter). {{platzhalter}} werden
beim Erzeugen interpoliert; Fragment-Felder (…Satz/…Zeile) verschwinden leer
ersatzlos.


---

## Kündigung des Arbeitsverhältnisses

Schema `kuendigung-arbeitnehmer` · Version 1.0.0 (Rechtsstand OR Art. 335 ff.; Masken-Spezifikation 6.6.2026) · Format eingabe · Ausgabe fertig

> **Disclaimer (Fusszeile):** Erstellt mit LexMetrik. Keine Rechtsberatung. Die Kündigung des Arbeitsverhältnisses ist formfrei gültig (vorbehältlich vertraglicher Schriftform); massgebend ist der Zugang beim Empfänger. Das Beendigungsdatum beruht auf den eingegebenen Daten (Art. 335a–c OR).


### 1. `K1_absender`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** absender
- **Begründung (Protokoll):** Absenderin/Absender der Kündigung – immer enthalten.

**Wortlaut:**

> {{absenderBlock}}

### 2. `K1_adressat`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** adressat
- **Begründung (Protokoll):** Empfängerin/Empfänger der Kündigung – immer enthalten.

**Wortlaut:**

> {{adressatBlock}}

### 3. `K1_datumzeile`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** datumzeile
- **Begründung (Protokoll):** Ort und Datum der Erklärung – immer enthalten.

**Wortlaut:**

> {{ort}}, {{datumFmt}}

### 4. `K1_betreff`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** betreff
- **Begründung (Protokoll):** Betreff des Kündigungsschreibens – immer enthalten.

**Wortlaut:**

> Kündigung des Arbeitsverhältnisses

### 5. `K1_anrede`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** anrede
- **Begründung (Protokoll):** Anrede – immer enthalten.

**Wortlaut:**

> Sehr geehrte Damen und Herren

### 6. `K1_erklaerung`

- [ ] **abgenommen** (David)
- **Norm:** Art. 335 Abs. 1 OR
- **Aufnahme:** immer
- **Begründung (Protokoll):** Kündigungserklärung mit Beendigungsdatum aus der Fristen-Engine (Art. 335a–c OR).

**Wortlaut:**

> Hiermit kündige ich das Arbeitsverhältnis ordentlich und fristgerecht per {{beendigungFmt}}.

### 7. `K1_probezeit`

- [ ] **abgenommen** (David)
- **Norm:** Art. 335b OR
- **Aufnahme:** istProbezeit = true
- **Begründung (Protokoll):** Zugang liegt in der Probezeit (Engine-Befund) – Klarstellung der 7-Tage-Frist.

**Wortlaut:**

> (Die Kündigung erfolgt während der Probezeit; es gilt die siebentägige Frist nach Art. 335b OR.)

### 8. `K1_zeugnis`

- [ ] **abgenommen** (David)
- **Norm:** Art. 330a OR
- **Aufnahme:** zeugnisVerlangen = true
- **Begründung (Protokoll):** Zeugnisbitte gewählt (Anspruch nach Art. 330a OR).

**Wortlaut:**

> Ich bitte um Ausstellung eines qualifizierten Arbeitszeugnisses.

### 9. `K1_abrechnung`

- [ ] **abgenommen** (David)
- **Aufnahme:** schlussabrechnungVerlangen = true
- **Begründung (Protokoll):** Bitte um Schlussabrechnung gewählt.

**Wortlaut:**

> Bitte stellen Sie mir die Schlussabrechnung (Lohn, anteiliger 13. Monatslohn, Feriensaldo, Überstunden) bis zum Austritt zu.

### 10. `K1_dank`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Begründung (Protokoll):** Bestätigungsbitte (Zugangs-/Beweissicherung) – immer enthalten.

**Wortlaut:**

> Ich danke für die Zusammenarbeit und bitte um eine kurze schriftliche Bestätigung dieser Kündigung.

### 11. `K1_schluss`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** schlussformel
- **Begründung (Protokoll):** Schlussformel – immer enthalten.

**Wortlaut:**

> Freundliche Grüsse

### 12. `K1_unterschrift`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Unterschrift der kündigenden Partei.

**Wortlaut:**

> ___________________________
> {{absenderName}}

---

**Summe:** 12 Bausteine in 1 Schemas.
