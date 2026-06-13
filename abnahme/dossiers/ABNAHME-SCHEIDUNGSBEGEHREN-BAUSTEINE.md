# Abnahme-Dossier: Gemeinsames Scheidungsbegehren — alle Bausteine Wort für Wort

**Zweck:** Wort-für-Wort-Abnahme durch David (fachkundige Person, CLAUDE.md §7).
Je Baustein eine Abhak-Zeile.

**Quelle:** `src/lib/vorlagen/scheidungsbegehren.ts (SB_SCHEMA)`. **Generiert:**
`npx vite-node scripts/abnahme-dossiers.ts` — nach Engine-Änderungen NEU
laufen lassen; das Dossier ist eine Ableitung, keine zweite Pflege-Stelle (§5).

**Lesehilfe:** «Aufnahme: immer» = Baustein steht in jedem Dokument; sonst die
lesbare `includeIf`-Bedingung über die Antwort-Felder. «wiederholt über» =
ein Absatz je Listeneintrag ({{item.…}}-Platzhalter). {{platzhalter}} werden
beim Erzeugen interpoliert; Fragment-Felder (…Satz/…Zeile) verschwinden leer
ersatzlos.


---

## Gemeinsames Scheidungsbegehren

Schema `scheidungsbegehren-gemeinsam` · Version 1.0.0 (Bauspez. familienrecht-klagen-vorlagen.md §3.2; ZPO/ZGB verifiziert 20260101) · Format eingabe · Ausgabe fertig

> **Disclaimer (Fusszeile):** Erstellt mit LexMetrik – keine Rechtsberatung. Gemeinsames Scheidungsbegehren nach Art. 285/286 ZPO; von BEIDEN Ehegatten zu unterzeichnen und mit der Vereinbarung über die Scheidungsfolgen samt Belegen beim Gericht am Wohnsitz einer Partei einzureichen. Das Gericht hört die Parteien an (Art. 287 ZPO) und prüft die Vereinbarung.


### 1. `SB01_adressat`

- [ ] **abgenommen** (David)
- **Norm:** Art. 23 Abs. 1 ZPO
- **Aufnahme:** immer
- **Layout-Rolle:** adressat
- **Begründung (Protokoll):** Gericht am Wohnsitz einer Partei — zwingender Gerichtsstand.

**Wortlaut:**

> {{gerichtBlock}}

### 2. `SB02_datum`

- [ ] **abgenommen** (David)
- **Norm:** Art. 285 lit. f ZPO
- **Aufnahme:** immer
- **Layout-Rolle:** datumzeile
- **Begründung (Protokoll):** Ort und Datum der Eingabe.

**Wortlaut:**

> {{ortDatumZeile}}

### 3. `SB03_betreff`

- [ ] **abgenommen** (David)
- **Norm:** Art. 285/286 ZPO
- **Aufnahme:** immer
- **Layout-Rolle:** betreff
- **Begründung (Protokoll):** Betreff mit der Einigungs-Variante (umfassende Einigung Art. 285 ZPO bzw. Teileinigung Art. 286 ZPO).

**Wortlaut:**

> Gemeinsames Scheidungsbegehren ({{einigungNorm}})

### 4. `SB04_rubrum`

- [ ] **abgenommen** (David)
- **Norm:** Art. 285 lit. a ZPO
- **Aufnahme:** immer
- **Layout-Rolle:** rubrum
- **Begründung (Protokoll):** Beide Ehegatten als gemeinsam gesuchstellende Parteien — kein Gegner-Rubrum.

**Wortlaut:**

> in Sachen
> {{ehegatte1Rubrum}}{{vertretung1Zeile}}
>
> und
>
> {{ehegatte2Rubrum}}{{vertretung2Zeile}}
>
> (gesuchstellende Parteien)
>
> betreffend Scheidung auf gemeinsames Begehren

### 5. `SB05_begehren` — «Begehren und Anträge»

- [ ] **abgenommen** (David)
- **Norm:** Art. 285 lit. b–d / 286 Abs. 1 ZPO
- **Aufnahme:** immer
- **Wiederholt über:** `begehrenListe` (ein Absatz je Eintrag)
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Gemeinsames Scheidungsbegehren, Genehmigungsantrag zur Vereinbarung, Kinder-Anträge; bei Teileinigung der Pflicht-Antrag auf gerichtliche Beurteilung der streitigen Folgen.

**Wortlaut:**

> {{item.text}}

### 6. `SB06_formelles` — «Formelles»

- [ ] **abgenommen** (David)
- **Norm:** Art. 23 Abs. 1 / 198 lit. c / 287 ZPO
- **Aufnahme:** immer
- **Begründung (Protokoll):** Zuständigkeit; kein Schlichtungsverfahren; Hinweis auf die Anhörung.

**Wortlaut:**

> {{formellesText}}

### 7. `SB07_beilagen` — «Beilagen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 285 lit. c/e ZPO
- **Aufnahme:** beilagenListe nicht leer
- **Wiederholt über:** `beilagenListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Vereinbarung und erforderliche Belege.

**Wortlaut:**

> – {{item.text}}

### 8. `SB08_gruss`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** schlussformel
- **Begründung (Protokoll):** Schlussformel der Eingabe.

**Wortlaut:**

> Mit freundlichen Grüssen

### 9. `SB09_unterschriften`

- [ ] **abgenommen** (David)
- **Norm:** Art. 285 lit. f ZPO
- **Aufnahme:** immer
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Unterschriften BEIDER Ehegatten — Gültigkeitserfordernis der gemeinsamen Eingabe.

**Wortlaut:**

> _________________________________
> {{ehegatte1Name}}
>
> _________________________________
> {{ehegatte2Name}}

---

**Summe:** 9 Bausteine in 1 Schemas.
