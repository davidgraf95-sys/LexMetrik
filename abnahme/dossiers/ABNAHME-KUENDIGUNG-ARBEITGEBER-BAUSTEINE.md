# Abnahme-Dossier: Kündigung durch Arbeitgeber — alle Bausteine Wort für Wort

**Zweck:** Wort-für-Wort-Abnahme durch David (fachkundige Person, CLAUDE.md §7).
Je Baustein eine Abhak-Zeile.

**Quelle:** `src/lib/vorlagen/kuendigungArbeitgeber.ts (KAG_SCHEMA)`. **Generiert:**
`npx vite-node scripts/abnahme-dossiers.ts` — nach Engine-Änderungen NEU
laufen lassen; das Dossier ist eine Ableitung, keine zweite Pflege-Stelle (§5).

**Lesehilfe:** «Aufnahme: immer» = Baustein steht in jedem Dokument; sonst die
lesbare `includeIf`-Bedingung über die Antwort-Felder. «wiederholt über» =
ein Absatz je Listeneintrag ({{item.…}}-Platzhalter). {{platzhalter}} werden
beim Erzeugen interpoliert; Fragment-Felder (…Satz/…Zeile) verschwinden leer
ersatzlos.


---

## Kündigung des Arbeitsverhältnisses

Schema `kuendigung-arbeitgeber` · Version 1.0.0 (Rechtsstand OR Art. 335 ff./336c; Masken-Spezifikation 6.6.2026) · Format eingabe · Ausgabe fertig

> **Disclaimer (Fusszeile):** Erstellt mit LexMetrik. Keine Rechtsberatung. Beendigungsdatum und Sperrfrist-Prüfung beruhen auf den eingegebenen Daten (Art. 335a–c, 336c OR); massgebend ist der Zugang bei der Arbeitnehmerin/beim Arbeitnehmer. GAV und Einzelvertrag gehen vor.


### 1. `K2_absender`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** absender
- **Begründung (Protokoll):** Absenderin/Absender der Kündigung – immer enthalten.

**Wortlaut:**

> {{absenderBlock}}

### 2. `K2_adressat`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** adressat
- **Begründung (Protokoll):** Empfängerin/Empfänger der Kündigung – immer enthalten.

**Wortlaut:**

> {{adressatBlock}}

### 3. `K2_datumzeile`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** datumzeile
- **Begründung (Protokoll):** Ort und Datum der Erklärung – immer enthalten.

**Wortlaut:**

> {{ort}}, {{datumFmt}}

### 4. `K2_betreff`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** betreff
- **Begründung (Protokoll):** Betreff des Kündigungsschreibens – immer enthalten.

**Wortlaut:**

> Kündigung des Arbeitsverhältnisses

### 5. `K2_anrede`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** anrede
- **Begründung (Protokoll):** Anrede — immer enthalten (Nachname aus dem Adressat-Feld, anpassbar).

**Wortlaut:**

> Sehr geehrte Frau, sehr geehrter Herr {{adressatNachnameZeile}}

### 6. `K2_erklaerung`

- [ ] **abgenommen** (David)
- **Norm:** Art. 335 Abs. 1 OR
- **Aufnahme:** immer
- **Begründung (Protokoll):** Kündigungserklärung; Beendigungsdatum aus der Sperrfristen-Engine (gehemmt/erstreckt nach Art. 336c OR).

**Wortlaut:**

> Hiermit kündigen wir das mit Ihnen bestehende Arbeitsverhältnis ordentlich per {{beendigungFmt}}.

### 7. `K2_probezeit`

- [ ] **abgenommen** (David)
- **Norm:** Art. 335b OR
- **Aufnahme:** istProbezeit = true
- **Begründung (Protokoll):** Zugang liegt in der Probezeit (Engine-Befund) — Klarstellung der 7-Tage-Frist; Sperrfristen gelten in der Probezeit nicht.

**Wortlaut:**

> (Die Kündigung erfolgt während der Probezeit; es gilt die siebentägige Frist nach Art. 335b OR.)

### 8. `K2_begruendung`

- [ ] **abgenommen** (David)
- **Aufnahme:** begruendungAufnehmen = true UND begruendungText nicht leer
- **Begründung (Protokoll):** Begründung auf ausdrücklichen Wunsch aufgenommen (Freitext — rechtlich nur auf Verlangen geschuldet, Art. 335 Abs. 2 OR).
- **Hinweis (offengelegt):** Bewusst optional: Eine frühe Festlegung kann die Verteidigung gegen einen Missbrauchsvorwurf erschweren.

**Wortlaut:**

> {{begruendungText}}

### 9. `K2_freistellung`

- [ ] **abgenommen** (David)
- **Norm:** Art. 324 OR
- **Aufnahme:** freistellung = true
- **Begründung (Protokoll):** Freistellung gewählt; Lohnfortzahlungs- und Anrechnungsfolge nach Art. 324 OR.
- **Hinweis (offengelegt):** Ferienanrechnung während der Freistellung ist eine Würdigungsfrage (Verhältnis Freistellungsdauer/Feriensaldo) und wird hier bewusst nicht berechnet.

**Wortlaut:**

> Wir stellen Sie ab {{freistellungAbFmt}} bis zum Austritt von der Arbeitspflicht frei. Der Lohn wird bis zur Beendigung ausgerichtet; anderweitiger Erwerb wird nach Art. 324 Abs. 2 OR angerechnet.

### 10. `K2_abrechnung`

- [ ] **abgenommen** (David)
- **Norm:** Art. 330a OR
- **Aufnahme:** immer
- **Begründung (Protokoll):** Abwicklung (Schlussabrechnung, Rückgaben, Zeugnis-Zusage) — immer enthalten.

**Wortlaut:**

> Bis zum Austritt erhalten Sie die Schlussabrechnung (Lohn, anteiliger 13. Monatslohn, Feriensaldo, Überstunden). Wir bitten Sie, Arbeitsmittel und Unterlagen bis zum letzten Arbeitstag zurückzugeben. Ein Arbeitszeugnis (Art. 330a OR) stellen wir Ihnen zu.

### 11. `K2_schluss`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** schlussformel
- **Begründung (Protokoll):** Schlussformel – immer enthalten.

**Wortlaut:**

> Freundliche Grüsse

### 12. `K2_unterschrift`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Unterschrift der zeichnungsberechtigten Person für die Arbeitgeberin/den Arbeitgeber.

**Wortlaut:**

> ___________________________
> {{absenderName}}
> {{unterzeichner}}

---

**Summe:** 12 Bausteine in 1 Schemas.
