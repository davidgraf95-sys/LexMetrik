# Abnahme-Dossier: Fristerstreckungsgesuch — alle Bausteine Wort für Wort

**Zweck:** Wort-für-Wort-Abnahme durch David (fachkundige Person, CLAUDE.md §7).
Je Baustein eine Abhak-Zeile.

**Quelle:** `src/lib/vorlagen/fristerstreckung.ts (FE_SCHEMA)`. **Generiert:**
`npx vite-node scripts/abnahme-dossiers.ts` — nach Engine-Änderungen NEU
laufen lassen; das Dossier ist eine Ableitung, keine zweite Pflege-Stelle (§5).

**Lesehilfe:** «Aufnahme: immer» = Baustein steht in jedem Dokument; sonst die
lesbare `includeIf`-Bedingung über die Antwort-Felder. «wiederholt über» =
ein Absatz je Listeneintrag ({{item.…}}-Platzhalter). {{platzhalter}} werden
beim Erzeugen interpoliert; Fragment-Felder (…Satz/…Zeile) verschwinden leer
ersatzlos.


---

## Fristerstreckungsgesuch

Schema `fristerstreckungsgesuch` · Version 1.0.0 (Wettbewerbsanalyse V2; Art. 143/144/148 ZPO verifiziert 20250101) · Format eingabe · Ausgabe fertig

> **Disclaimer (Fusszeile):** Erstellt mit LexMetrik. Keine Rechtsberatung. Ob die Gründe zureichend sind (Art. 144 Abs. 2 ZPO), entscheidet das Gericht; massgebend sind Gesetz und konkreter Sachverhalt.


### 1. `FE_absender`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** absender
- **Begründung (Protokoll):** Gesuchstellende Partei bzw. Vertretung.

**Wortlaut:**

> {{absenderBlock}}

### 2. `FE_adressat`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** adressat
- **Begründung (Protokoll):** Das Gericht, das die Frist angesetzt hat – nur dieses kann sie erstrecken (Art. 144 Abs. 2 ZPO).

**Wortlaut:**

> {{adressatBlock}}

### 3. `FE_datumzeile`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** datumzeile
- **Begründung (Protokoll):** Ort und Datum der Erklärung – immer enthalten.

**Wortlaut:**

> {{ort}}, {{datumFmt}}

### 4. `FE_betreff`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** betreff
- **Begründung (Protokoll):** Betreff mit Verfahrensbezeichnung und Geschäftsnummer zur Zuordnung.

**Wortlaut:**

> Gesuch um Fristerstreckung – {{verfahrenBeschrieb}}{{verfahrenNrSatz}}

### 5. `FE_anrede`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** anrede
- **Begründung (Protokoll):** Anrede – immer enthalten (Haus-Standard; die konkrete Besetzung des Gerichts ist dem Gesuch nicht bekannt).

**Wortlaut:**

> Sehr geehrte Damen und Herren

### 6. `FE_einleitung`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Begründung (Protokoll):** Bestimmte Bezeichnung der laufenden gerichtlichen Frist (Anlass des Gesuchs).

**Wortlaut:**

> Im genannten Verfahren läuft mir die{{verfuegungSatz}} angesetzte {{fristBeschrieb}} bis zum {{fristEndeFmt}}.

### 7. `FE_antrag`

- [ ] **abgenommen** (David)
- **Norm:** Art. 144 Abs. 2 ZPO
- **Aufnahme:** immer
- **Begründung (Protokoll):** Kern des Gesuchs: bestimmter Erstreckungs-Antrag vor Fristablauf (Art. 144 Abs. 2 ZPO).

**Wortlaut:**

> Ich ersuche Sie, diese Frist bis zum {{erstreckungBisFmt}} zu erstrecken.

### 8. `FE_begruendung` — «Begründung»

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Begründung (Protokoll):** Zureichende Gründe (Art. 144 Abs. 2 ZPO) – als Masken-Text oder Platzhalter zum späteren Ausfüllen (ob sie genügen, ist Rechtsfrage des Gerichts).

**Wortlaut:**

> {{begruendungText}}

### 9. `FE_erste`

- [ ] **abgenommen** (David)
- **Aufnahme:** ersteErstreckung = true
- **Begründung (Protokoll):** Praxis-Standard: Das erste Gesuch wird regelmässig grosszügiger behandelt – die Offenlegung schafft Vertrauen.

**Wortlaut:**

> Es handelt sich um das erste Erstreckungsgesuch in dieser Frist.

### 10. `FE_dank`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Begründung (Protokoll):** Schlusssatz – immer enthalten.

**Wortlaut:**

> Ich danke Ihnen für die Prüfung dieses Gesuchs und stehe für Rückfragen zur Verfügung.

### 11. `FE_schluss`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** schlussformel
- **Begründung (Protokoll):** Schlussformel – immer enthalten.

**Wortlaut:**

> Mit freundlichen Grüssen

### 12. `FE_unterschrift`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Unterschrift der gesuchstellenden Partei.

**Wortlaut:**

> ___________________________
> {{absenderName}}

---

**Summe:** 12 Bausteine in 1 Schemas.
