# Abnahme-Dossier: Scheidungsklage — alle Bausteine Wort für Wort

**Zweck:** Wort-für-Wort-Abnahme durch David (fachkundige Person, CLAUDE.md §7).
Je Baustein eine Abhak-Zeile.

**Quelle:** `src/lib/vorlagen/scheidungsklage.ts (SK_SCHEMA)`. **Generiert:**
`npx vite-node scripts/abnahme-dossiers.ts` — nach Engine-Änderungen NEU
laufen lassen; das Dossier ist eine Ableitung, keine zweite Pflege-Stelle (§5).

**Lesehilfe:** «Aufnahme: immer» = Baustein steht in jedem Dokument; sonst die
lesbare `includeIf`-Bedingung über die Antwort-Felder. «wiederholt über» =
ein Absatz je Listeneintrag ({{item.…}}-Platzhalter). {{platzhalter}} werden
beim Erzeugen interpoliert; Fragment-Felder (…Satz/…Zeile) verschwinden leer
ersatzlos.


---

## Scheidungsklage (unbegründete Eingabe)

Schema `scheidungsklage` · Version 1.0.0 (Bauspez. familienrecht-klagen-vorlagen.md §3.3; ZPO/ZGB verifiziert 20260101) · Format eingabe · Ausgabe fertig

> **Disclaimer (Fusszeile):** Erstellt mit LexMetrik – keine Rechtsberatung. Unbegründete Scheidungsklage nach Art. 290 ZPO; einzureichen unterschrieben im Doppel beim Gericht am Wohnsitz einer Partei (Art. 23 Abs. 1 ZPO). Das Gericht lädt zur Einigungsverhandlung vor (Art. 291 ZPO); Kinderbelange unterliegen der Offizialmaxime.


### 1. `SK01_adressat`

- [ ] **abgenommen** (David)
- **Norm:** Art. 23 Abs. 1 ZPO
- **Aufnahme:** immer
- **Layout-Rolle:** adressat
- **Begründung (Protokoll):** Gericht am Wohnsitz einer Partei — zwingender Gerichtsstand.

**Wortlaut:**

> {{gerichtBlock}}

### 2. `SK02_datum`

- [ ] **abgenommen** (David)
- **Norm:** Art. 290 lit. f ZPO
- **Aufnahme:** immer
- **Layout-Rolle:** datumzeile
- **Begründung (Protokoll):** Ort und Datum der Eingabe.

**Wortlaut:**

> {{ortDatumZeile}}

### 3. `SK03_betreff`

- [ ] **abgenommen** (David)
- **Norm:** Art. 290 ZPO
- **Aufnahme:** immer
- **Layout-Rolle:** betreff
- **Begründung (Protokoll):** Betreff mit Verfahrensbezeichnung; die Klage darf ohne schriftliche Begründung eingereicht werden.

**Wortlaut:**

> Scheidungsklage (Art. 290 ZPO) — unbegründete Eingabe

### 4. `SK04_rubrum`

- [ ] **abgenommen** (David)
- **Norm:** Art. 290 lit. a ZPO
- **Aufnahme:** immer
- **Layout-Rolle:** rubrum
- **Begründung (Protokoll):** Parteien und allfällige Vertretung.

**Wortlaut:**

> in Sachen
> {{klaegerRubrum}}
> (klagende Partei){{vertretungZeile}}
>
> gegen
>
> {{beklagteRubrum}}
> (beklagte Partei)
>
> betreffend Scheidung

### 5. `SK05_begehren` — «Rechtsbegehren»

- [ ] **abgenommen** (David)
- **Norm:** Art. 290 lit. b–d ZPO
- **Aufnahme:** immer
- **Wiederholt über:** `rechtsbegehrenListe` (ein Absatz je Eintrag)
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Scheidungsbegehren mit Grund-Bezeichnung (lit. b), vermögensrechtliche Folgen (lit. c), Kinderbelange (lit. d), Kosten.

**Wortlaut:**

> {{item.text}}

### 6. `SK06_formelles` — «Formelles»

- [ ] **abgenommen** (David)
- **Norm:** Art. 23 Abs. 1 / 198 lit. c / 291 ZPO
- **Aufnahme:** immer
- **Begründung (Protokoll):** Zwingende örtliche Zuständigkeit; kein Schlichtungsverfahren; Hinweis auf die Einigungsverhandlung.

**Wortlaut:**

> {{formellesText}}

### 7. `SK07_beilagen` — «Beilagen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 290 lit. e ZPO
- **Aufnahme:** beilagenListe nicht leer
- **Wiederholt über:** `beilagenListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Erforderliche Belege.

**Wortlaut:**

> – {{item.text}}

### 8. `SK08_gruss`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** schlussformel
- **Begründung (Protokoll):** Schlussformel der Eingabe.

**Wortlaut:**

> Mit freundlichen Grüssen

### 9. `SK09_unterschrift`

- [ ] **abgenommen** (David)
- **Norm:** Art. 290 lit. f ZPO
- **Aufnahme:** immer
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Unterschrift der klagenden Partei bzw. der Vertretung.

**Wortlaut:**

> _________________________________
> {{unterschriftName}}

### 10. `SK10_doppel`

- [ ] **abgenommen** (David)
- **Norm:** Art. 131 ZPO
- **Aufnahme:** immer
- **Begründung (Protokoll):** Exemplare-Hinweis.

**Wortlaut:**

> Einreichung im Doppel: ein Exemplar für das Gericht und ein Exemplar für die beklagte Partei (Art. 131 ZPO).

---

**Summe:** 10 Bausteine in 1 Schemas.
