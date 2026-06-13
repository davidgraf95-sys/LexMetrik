# Abnahme-Dossier: Eheschutzgesuch — alle Bausteine Wort für Wort

**Zweck:** Wort-für-Wort-Abnahme durch David (fachkundige Person, CLAUDE.md §7).
Je Baustein eine Abhak-Zeile.

**Quelle:** `src/lib/vorlagen/eheschutzgesuch.ts (EG_SCHEMA)`. **Generiert:**
`npx vite-node scripts/abnahme-dossiers.ts` — nach Engine-Änderungen NEU
laufen lassen; das Dossier ist eine Ableitung, keine zweite Pflege-Stelle (§5).

**Lesehilfe:** «Aufnahme: immer» = Baustein steht in jedem Dokument; sonst die
lesbare `includeIf`-Bedingung über die Antwort-Felder. «wiederholt über» =
ein Absatz je Listeneintrag ({{item.…}}-Platzhalter). {{platzhalter}} werden
beim Erzeugen interpoliert; Fragment-Felder (…Satz/…Zeile) verschwinden leer
ersatzlos.


---

## Eheschutzgesuch

Schema `eheschutzgesuch` · Version 1.0.0 (Bauspez. familienrecht-klagen-vorlagen.md §3.1; ZGB/ZPO verifiziert 20260101) · Format eingabe · Ausgabe fertig

> **Disclaimer (Fusszeile):** Erstellt mit LexMetrik – keine Rechtsberatung. Eheschutzgesuch (Art. 175 ff. ZGB) im summarischen Verfahren (Art. 271 lit. a ZPO); einzureichen unterschrieben im Doppel beim Gericht am Wohnsitz einer Partei. Tatsachen sind glaubhaft zu machen; Unterhaltshöhen bestimmt das Gericht nach den konkreten Verhältnissen.


### 1. `EG01_adressat`

- [ ] **abgenommen** (David)
- **Norm:** Art. 23 Abs. 1 ZPO
- **Aufnahme:** immer
- **Layout-Rolle:** adressat
- **Begründung (Protokoll):** Gericht am Wohnsitz einer Partei — zwingender Gerichtsstand für eherechtliche Gesuche.

**Wortlaut:**

> {{gerichtBlock}}

### 2. `EG02_datum`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** datumzeile
- **Begründung (Protokoll):** Ort und Datum der Eingabe.

**Wortlaut:**

> {{ortDatumZeile}}

### 3. `EG03_betreff`

- [ ] **abgenommen** (David)
- **Norm:** Art. 271 ZPO
- **Aufnahme:** immer
- **Layout-Rolle:** betreff
- **Begründung (Protokoll):** Betreff mit Verfahrensbezeichnung.

**Wortlaut:**

> Eheschutzgesuch (Art. 175 ff. ZGB; summarisches Verfahren, Art. 271 lit. a ZPO)

### 4. `EG04_rubrum`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** rubrum
- **Begründung (Protokoll):** Parteien und allfällige Vertretung.

**Wortlaut:**

> in Sachen
> {{gesuchstellerRubrum}}
> (gesuchstellende Partei){{vertretungZeile}}
>
> gegen
>
> {{gesuchsgegnerRubrum}}
> (gesuchsgegnerische Partei)
>
> betreffend Eheschutz

### 5. `EG05_begehren` — «Rechtsbegehren»

- [ ] **abgenommen** (David)
- **Norm:** Art. 176 ZGB
- **Aufnahme:** immer
- **Wiederholt über:** `begehrenListe` (ein Absatz je Eintrag)
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Begehren-Katalog des Eheschutzes: Getrenntleben, Wohnung/Hausrat, Kinderbelange, Unterhalt (Formel deterministisch, Höhe Eingabe), weitere Massnahmen, Kosten.

**Wortlaut:**

> {{item.text}}

### 6. `EG06_formelles` — «Formelles»

- [ ] **abgenommen** (David)
- **Norm:** Art. 271/198 lit. a/273 ZPO
- **Aufnahme:** immer
- **Begründung (Protokoll):** Zuständigkeit, summarisches Verfahren, kein Schlichtungsverfahren, mündliche Verhandlung.

**Wortlaut:**

> {{formellesText}}

### 7. `EG07_beilagen` — «Beilagen»

- [ ] **abgenommen** (David)
- **Aufnahme:** beilagenListe nicht leer
- **Wiederholt über:** `beilagenListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Belege zur Glaubhaftmachung (Lohn, Wohnkosten, Krankenkassen, Kinderbelege).

**Wortlaut:**

> – {{item.text}}

### 8. `EG08_gruss`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** schlussformel
- **Begründung (Protokoll):** Schlussformel der Eingabe.

**Wortlaut:**

> Mit freundlichen Grüssen

### 9. `EG09_unterschrift`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Unterschrift der gesuchstellenden Partei bzw. der Vertretung.

**Wortlaut:**

> _________________________________
> {{unterschriftName}}

### 10. `EG10_doppel`

- [ ] **abgenommen** (David)
- **Norm:** Art. 131 ZPO
- **Aufnahme:** immer
- **Begründung (Protokoll):** Exemplare-Hinweis.

**Wortlaut:**

> Einreichung im Doppel: ein Exemplar für das Gericht und ein Exemplar für die gesuchsgegnerische Partei (Art. 131 ZPO).

---

**Summe:** 10 Bausteine in 1 Schemas.
