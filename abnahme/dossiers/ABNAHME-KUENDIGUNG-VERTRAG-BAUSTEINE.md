# Abnahme-Dossier: Kündigung (allgemeiner Vertrag) — alle Bausteine Wort für Wort

**Zweck:** Wort-für-Wort-Abnahme durch David (fachkundige Person, CLAUDE.md §7).
Je Baustein eine Abhak-Zeile.

**Quelle:** `src/lib/vorlagen/kuendigungAllgemein.ts (KV_SCHEMA)`. **Generiert:**
`npx vite-node scripts/abnahme-dossiers.ts` — nach Engine-Änderungen NEU
laufen lassen; das Dossier ist eine Ableitung, keine zweite Pflege-Stelle (§5).

**Lesehilfe:** «Aufnahme: immer» = Baustein steht in jedem Dokument; sonst die
lesbare `includeIf`-Bedingung über die Antwort-Felder. «wiederholt über» =
ein Absatz je Listeneintrag ({{item.…}}-Platzhalter). {{platzhalter}} werden
beim Erzeugen interpoliert; Fragment-Felder (…Satz/…Zeile) verschwinden leer
ersatzlos.


---

## Kündigung

Schema `kuendigung-vertrag` · Version 1.1.0 (KVG-Preset 11.6.2026, Art. 7/64a KVG + Art. 94/100 KVV verifiziert 20260101; Basis: Masken-Spez. 6.6.2026, VVG verifiziert 20240101) · Format eingabe · Ausgabe fertig

> **Disclaimer (Fusszeile):** Erstellt mit LexMetrik. Keine Rechtsberatung. Massgebend sind Vertrag/AGB und die genannten Gesetzesbestimmungen; der Zugang beim Empfänger entscheidet. Bei Spezialverhältnissen (Arbeit, Miete) die spezialisierten Vorlagen verwenden.


### 1. `V_absender`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** absender
- **Begründung (Protokoll):** Absenderin/Absender der Kündigung – immer enthalten.

**Wortlaut:**

> {{absenderBlock}}

### 2. `V_adressat`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** adressat
- **Begründung (Protokoll):** Empfängerin/Empfänger der Kündigung – immer enthalten.

**Wortlaut:**

> {{adressatBlock}}

### 3. `V_datumzeile`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** datumzeile
- **Begründung (Protokoll):** Ort und Datum der Erklärung – immer enthalten.

**Wortlaut:**

> {{ort}}, {{datumFmt}}

### 4. `V_betreff`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** betreff
- **Begründung (Protokoll):** Betreff mit Vertragsbezeichnung — immer enthalten.

**Wortlaut:**

> Kündigung — {{vertragsBezeichnung}}{{vertragsnummerSatz}}

### 5. `V_anrede`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** anrede
- **Begründung (Protokoll):** Anrede — immer enthalten.

**Wortlaut:**

> Sehr geehrte Damen und Herren

### 6. `V_erklaerung_generisch`

- [ ] **abgenommen** (David)
- **Aufnahme:** preset = "generisch"
- **Begründung (Protokoll):** Generische Kündigungserklärung — bewusst ohne berechnete Frist (kein Spezialgesetz, §2).

**Wortlaut:**

> Hiermit kündige ich den oben genannten Vertrag {{terminSatz}} unter Einhaltung der vertraglichen bzw. gesetzlichen Frist.

### 7. `V_versicherung`

- [ ] **abgenommen** (David)
- **Norm:** Art. 35a VVG
- **Aufnahme:** preset = "versicherung"
- **Begründung (Protokoll):** Ordentliche VVG-Kündigung (Wortlaut verifiziert: Ende des dritten oder jedes folgenden Jahres, Frist 3 Monate, schriftlich oder textnachweisbar).

**Wortlaut:**

> Hiermit kündige ich den Versicherungsvertrag{{policennummerSatz}} ordentlich auf das Ende des dritten bzw. des laufenden Versicherungsjahres unter Einhaltung der dreimonatigen Frist (Art. 35a VVG).

### 8. `V_krankenkasse_praemie`

- [ ] **abgenommen** (David)
- **Norm:** Art. 7 Abs. 2 KVG
- **Aufnahme:** preset = "krankenkasse" UND kkGrund = "praemienmitteilung"
- **Begründung (Protokoll):** Kündigung auf Prämienmitteilung hin (Wortlaut verifiziert: einmonatige Frist auf das Ende des Monats vor Gültigkeit der neuen Prämie) — der Praxisfall «bis 30. November».

**Wortlaut:**

> Hiermit kündige ich die obligatorische Krankenpflegeversicherung (Grundversicherung){{kkVersichertenSatz}} im Anschluss an die Mitteilung der neuen Prämie unter Einhaltung der einmonatigen Kündigungsfrist auf das Ende des Monats, der der Gültigkeit der neuen Prämie vorangeht{{kkWunschterminSatz}} (Art. 7 Abs. 2 KVG).

### 9. `V_krankenkasse_semester`

- [ ] **abgenommen** (David)
- **Norm:** Art. 7 Abs. 1 KVG
- **Aufnahme:** preset = "krankenkasse" UND kkGrund = "ordentlich" UND NICHT (kkBesondereForm = true)
- **Begründung (Protokoll):** Ordentliche Kündigung ohne besondere Versicherungsform (Wortlaut verifiziert: dreimonatige Frist auf das Ende eines Kalendersemesters).

**Wortlaut:**

> Hiermit kündige ich die obligatorische Krankenpflegeversicherung (Grundversicherung){{kkVersichertenSatz}} ordentlich unter Einhaltung der dreimonatigen Kündigungsfrist auf das Ende des Kalendersemesters{{kkWunschterminSatz}} (Art. 7 Abs. 1 KVG).

### 10. `V_krankenkasse_jahresende`

- [ ] **abgenommen** (David)
- **Norm:** Art. 7 Abs. 1 KVG
- **Aufnahme:** preset = "krankenkasse" UND kkGrund = "ordentlich" UND kkBesondereForm = true
- **Begründung (Protokoll):** Ordentliche Kündigung bei wählbarer Franchise/eingeschränkter Wahl: Wechsel nur auf Jahresende (Art. 94 Abs. 2 bzw. Art. 100 Abs. 3 KVV, Fassung in Kraft seit 1.1.2025).
- **Hinweis (offengelegt):** Die Kündigung auf Prämienmitteilung hin (Art. 7 Abs. 2 KVG) bleibt auch bei besonderen Versicherungsformen vorbehalten.

**Wortlaut:**

> Hiermit kündige ich die obligatorische Krankenpflegeversicherung (Grundversicherung){{kkVersichertenSatz}} ordentlich unter Einhaltung der dreimonatigen Kündigungsfrist auf das Ende des Kalenderjahres{{kkWunschterminSatz}}, da eine besondere Versicherungsform besteht (Art. 7 Abs. 1 KVG; Art. 94 Abs. 2 KVV bzw. Art. 100 Abs. 3 KVV).

### 11. `V_krankenkasse_nahtlos`

- [ ] **abgenommen** (David)
- **Norm:** Art. 7 Abs. 5 KVG
- **Aufnahme:** preset = "krankenkasse"
- **Begründung (Protokoll):** Nahtlosigkeits-Klausel: Ende beim bisherigen Versicherer erst nach Mitteilung des neuen Versicherers (Versicherungspflicht ohne Lücke).

**Wortlaut:**

> Das Versicherungsverhältnis endet, sobald Ihnen mein neuer Versicherer die Aufnahme ohne Unterbrechung des Versicherungsschutzes mitgeteilt hat (Art. 7 Abs. 5 KVG).

### 12. `V_darlehen`

- [ ] **abgenommen** (David)
- **Norm:** Art. 318 OR
- **Aufnahme:** preset = "darlehen"
- **Begründung (Protokoll):** Darlehenskündigung mit 6-Wochen-Frist ab erster Aufforderung (Art. 318 OR).

**Wortlaut:**

> Hiermit kündige ich das Darlehen und fordere Sie zur Rückzahlung auf. Die Rückzahlung hat innert sechs Wochen seit Zugang {{darlehenAusloeserWort}} zu erfolgen{{darlehenBisSatz}} (Art. 318 OR).

### 13. `V_auftrag`

- [ ] **abgenommen** (David)
- **Norm:** Art. 404 OR
- **Aufnahme:** preset = "auftrag"
- **Begründung (Protokoll):** Auftrag: jederzeitiger Widerruf/Kündigung (Art. 404 Abs. 1 OR); Unzeit-Folge als Warnung offengelegt.

**Wortlaut:**

> Hiermit widerrufe bzw. kündige ich den Auftrag mit sofortiger Wirkung (Art. 404 Abs. 1 OR).

### 14. `V_abo`

- [ ] **abgenommen** (David)
- **Aufnahme:** preset = "abo_telecom"
- **Begründung (Protokoll):** Abo/Telecom: kein Spezialgesetz — Kündigung auf den nächstmöglichen AGB-Termin (ehrlich ohne berechnete Frist, §2).

**Wortlaut:**

> Hiermit kündige ich das Abonnement bzw. den Vertrag auf den nächstmöglichen Termin gemäss den vereinbarten Vertrags-/Geschäftsbedingungen.

### 15. `V_bestaetigung`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Begründung (Protokoll):** Bestätigungsbitte (Beweissicherung) — immer enthalten.

**Wortlaut:**

> Bitte bestätigen Sie mir die Kündigung und den Beendigungstermin schriftlich.

### 16. `V_schluss`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** schlussformel
- **Begründung (Protokoll):** Schlussformel – immer enthalten.

**Wortlaut:**

> Freundliche Grüsse

### 17. `V_unterschrift`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Unterschrift der kündigenden Partei.

**Wortlaut:**

> ___________________________
> {{absenderName}}

---

**Summe:** 17 Bausteine in 1 Schemas.
