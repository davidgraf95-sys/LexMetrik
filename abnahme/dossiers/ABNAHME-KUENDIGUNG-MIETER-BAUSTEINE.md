# Abnahme-Dossier: Kündigung durch Mieter — alle Bausteine Wort für Wort

**Zweck:** Wort-für-Wort-Abnahme durch David (fachkundige Person, CLAUDE.md §7).
Je Baustein eine Abhak-Zeile.

**Quelle:** `src/lib/vorlagen/kuendigungMieter.ts (KM_SCHEMA)`. **Generiert:**
`npx vite-node scripts/abnahme-dossiers.ts` — nach Engine-Änderungen NEU
laufen lassen; das Dossier ist eine Ableitung, keine zweite Pflege-Stelle (§5).

**Lesehilfe:** «Aufnahme: immer» = Baustein steht in jedem Dokument; sonst die
lesbare `includeIf`-Bedingung über die Antwort-Felder. «wiederholt über» =
ein Absatz je Listeneintrag ({{item.…}}-Platzhalter). {{platzhalter}} werden
beim Erzeugen interpoliert; Fragment-Felder (…Satz/…Zeile) verschwinden leer
ersatzlos.


---

## Kündigung des Mietverhältnisses

Schema `kuendigung-mieter` · Version 1.0.0 (Rechtsstand OR Art. 253 ff./266a–o; Masken-Spezifikation 6.6.2026) · Format eingabe · Ausgabe fertig

> **Disclaimer (Fusszeile):** Erstellt mit LexMetrik. Keine Rechtsberatung. Endtermin und Form-Prüfung beruhen auf den eingegebenen Daten (Art. 266a–o OR); massgebend ist der Zugang bei der Vermieterschaft. Ortsübliche Termine sind eine Tatfrage des konkreten Ortes.


### 1. `M_absender`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** absender
- **Begründung (Protokoll):** Absenderin/Absender der Kündigung – immer enthalten.

**Wortlaut:**

> {{absenderBlock}}

### 2. `M_adressat`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** adressat
- **Begründung (Protokoll):** Empfängerin/Empfänger der Kündigung – immer enthalten.

**Wortlaut:**

> {{adressatBlock}}

### 3. `M_datumzeile`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** datumzeile
- **Begründung (Protokoll):** Ort und Datum der Erklärung – immer enthalten.

**Wortlaut:**

> {{ort}}, {{datumFmt}}

### 4. `M_betreff`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** betreff
- **Begründung (Protokoll):** Betreff mit Mietobjekt — immer enthalten.

**Wortlaut:**

> Kündigung des Mietverhältnisses — {{mietobjektAdresse}}

### 5. `M_anrede`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** anrede
- **Begründung (Protokoll):** Anrede — immer enthalten.

**Wortlaut:**

> Sehr geehrte Damen und Herren

### 6. `M_erklaerung`

- [ ] **abgenommen** (David)
- **Norm:** Art. 266a OR
- **Aufnahme:** immer
- **Begründung (Protokoll):** Kündigungserklärung; Endtermin aus der Mietrechts-Engine (Termin-Hierarchie Vertrag → Ortsgebrauch → Gesetz; objektspezifische Frist nach Art. 266b–f OR).

**Wortlaut:**

> Hiermit kündige ich das Mietverhältnis über die oben genannte Mietsache ordentlich per {{endterminFmt}}.{{mitmieterSatz}}

### 7. `M_familienwohnung_zustimmung`

- [ ] **abgenommen** (David)
- **Norm:** Art. 266m OR
- **Aufnahme:** familienwohnung = true UND zustimmungEhegatte = true
- **Begründung (Protokoll):** Familienwohnung: Zustimmung dokumentiert und Mitunterzeichnung angekündigt (Nichtigkeitsfolge des Art. 266o OR vermieden).

**Wortlaut:**

> Die Mietsache dient als Wohnung der Familie. Diese Kündigung wird mit der ausdrücklichen Zustimmung von {{ehegatteName}} (Ehegatte/eingetragene Partnerin bzw. eingetragener Partner) ausgesprochen (Art. 266m OR); sie/er unterzeichnet mit.

### 8. `M_ausserterminlich_264`

- [ ] **abgenommen** (David)
- **Norm:** Art. 264 OR
- **Aufnahme:** ausserterminlich = true UND nachmieterName nicht leer
- **Begründung (Protokoll):** Ausserterminliche Rückgabe mit Nachmieter-Vorschlag gewählt.
- **Hinweis (offengelegt):** Ob der Nachmieter zumutbar, zahlungsfähig und übernahmebereit ist, beurteilt die Vermieterschaft — das Befreiungsrisiko bleibt offengelegt.

**Wortlaut:**

> Ich gebe die Mietsache vorzeitig zurück und schlage als zumutbare:n, zahlungsfähige:n Nachmieter:in vor, die/der bereit ist, den Mietvertrag zu den gleichen Bedingungen zu übernehmen: {{nachmieterName}}. Mit deren/dessen Eintritt bin ich von meinen Verpflichtungen aus dem Mietverhältnis befreit (Art. 264 OR).

### 9. `M_uebergabe`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Begründung (Protokoll):** Übergabe-/Depot-Bitte — immer enthalten (praktische Abwicklung).

**Wortlaut:**

> Ich bitte um einen Termin für die Rückgabe der Mietsache und die gemeinsame Erstellung des Übergabeprotokolls{{rueckgabeWunschSatz}} sowie um die Abrechnung und Freigabe des Mietzinsdepots.

### 10. `M_schluss`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** schlussformel
- **Begründung (Protokoll):** Schlussformel – immer enthalten.

**Wortlaut:**

> Freundliche Grüsse

### 11. `M_unterschrift`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Unterschrift der kündigenden Mietpartei; weitere Mieter:innen unterschreiben mit.

**Wortlaut:**

> ___________________________
> {{absenderName}}{{mitmieterUnterschriftenZeile}}

### 12. `M_unterschrift_ehegatte`

- [ ] **abgenommen** (David)
- **Norm:** Art. 266m OR
- **Aufnahme:** familienwohnung = true UND zustimmungEhegatte = true
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Zweite Unterschriftslinie für die zustimmende Person (Familienwohnung).

**Wortlaut:**

> ___________________________
> {{ehegatteName}} (Zustimmung nach Art. 266m OR)

---

**Summe:** 12 Bausteine in 1 Schemas.
