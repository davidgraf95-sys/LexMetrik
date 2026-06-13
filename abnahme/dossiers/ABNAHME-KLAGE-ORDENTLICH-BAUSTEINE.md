# Abnahme-Dossier: Klage im ordentlichen Verfahren — alle Bausteine Wort für Wort

**Zweck:** Wort-für-Wort-Abnahme durch David (fachkundige Person, CLAUDE.md §7).
Je Baustein eine Abhak-Zeile.

**Quelle:** `src/lib/vorlagen/klageOrdentlich.ts (KO_SCHEMA)`. **Generiert:**
`npx vite-node scripts/abnahme-dossiers.ts` — nach Engine-Änderungen NEU
laufen lassen; das Dossier ist eine Ableitung, keine zweite Pflege-Stelle (§5).

**Lesehilfe:** «Aufnahme: immer» = Baustein steht in jedem Dokument; sonst die
lesbare `includeIf`-Bedingung über die Antwort-Felder. «wiederholt über» =
ein Absatz je Listeneintrag ({{item.…}}-Platzhalter). {{platzhalter}} werden
beim Erzeugen interpoliert; Fragment-Felder (…Satz/…Zeile) verschwinden leer
ersatzlos.


---

## Klage im ordentlichen Verfahren

Schema `klage-ordentlich` · Version 1.0.0 (ZPO-Fassung seit 1.1.2025) · Format eingabe · Ausgabe fertig

> **Disclaimer (Fusszeile):** Erstellt mit LexMetrik – keine Rechtsberatung. Klage im ordentlichen Verfahren nach Art. 219 ff. ZPO; einzureichen unterschrieben im Doppel (Art. 131 ZPO), mit Klagebewilligung bzw. Verzichts-/Ausnahme-Nachweis und den verfügbaren Beweisurkunden als Beilagen (Art. 221 Abs. 2 ZPO). Die örtliche und sachliche Zuständigkeit des angeschriebenen Gerichts ist selbst zu prüfen; Fristen (Art. 209 Abs. 3 ZPO) eigenverantwortlich wahren.


### 1. `O02_adressat`

- [ ] **abgenommen** (David)
- **Norm:** Art. 4 ZPO
- **Aufnahme:** immer
- **Layout-Rolle:** adressat
- **Begründung (Protokoll):** Erstinstanzliches Zivilgericht des gewählten Kantons (kantonale Gerichtsschicht; Handeingabe möglich).

**Wortlaut:**

> {{gerichtBlock}}

### 2. `O03_datum`

- [ ] **abgenommen** (David)
- **Norm:** Art. 221 Abs. 1 lit. f ZPO
- **Aufnahme:** immer
- **Layout-Rolle:** datumzeile
- **Begründung (Protokoll):** Ort und Datum der Eingabe.

**Wortlaut:**

> {{ortDatumZeile}}

### 3. `O04_betreff`

- [ ] **abgenommen** (David)
- **Norm:** Art. 221 Abs. 1 lit. c ZPO
- **Aufnahme:** immer
- **Layout-Rolle:** betreff
- **Begründung (Protokoll):** Betreff mit Verfahrensart und Streitwertangabe.

**Wortlaut:**

> Klage (ordentliches Verfahren, Art. 219 ff. ZPO){{streitwertBetreffZeile}}

### 4. `O05_rubrum`

- [ ] **abgenommen** (David)
- **Norm:** Art. 221 Abs. 1 lit. a ZPO
- **Aufnahme:** immer
- **Layout-Rolle:** rubrum
- **Begründung (Protokoll):** Rubrum mit Parteien und Streitgegenstand.

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
> betreffend {{streitgegenstandKurz}}

### 5. `O06_begehren` — «Rechtsbegehren»

- [ ] **abgenommen** (David)
- **Norm:** Art. 221 Abs. 1 lit. b ZPO
- **Aufnahme:** immer
- **Wiederholt über:** `rechtsbegehrenListe` (ein Absatz je Eintrag)
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Bezifferte (Art. 84 Abs. 2), unbezifferte (Art. 85) oder frei formulierte Begehren; Kostenfolge.

**Wortlaut:**

> {{item.text}}

### 6. `O07_formelles` — «Formelles»

- [ ] **abgenommen** (David)
- **Norm:** Art. 219/209 ZPO
- **Aufnahme:** immer
- **Begründung (Protokoll):** Zuständigkeit, Verfahrensart, Klagebewilligung/Verzicht/Ausnahme.

**Wortlaut:**

> {{formellesText}}

### 7. `O08_tatsachen_intro` — «Begründung»

- [ ] **abgenommen** (David)
- **Norm:** Art. 221 Abs. 1 lit. d/e ZPO
- **Aufnahme:** tatsachenListe nicht leer
- **Begründung (Protokoll):** Pflicht-Begründung: Tatsachenbehauptungen mit Beweismitteln je Behauptung.

**Wortlaut:**

> I. Tatsächliches

### 8. `O08b_tatsachen`

- [ ] **abgenommen** (David)
- **Norm:** Art. 221 Abs. 1 lit. d/e ZPO
- **Aufnahme:** immer
- **Wiederholt über:** `tatsachenListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Je Ziffer eine Behauptung; darunter die Beweisofferte («Beweis: …»).

**Wortlaut:**

> {{item.text}}

### 9. `O09_recht_intro`

- [ ] **abgenommen** (David)
- **Norm:** Art. 221 Abs. 3 ZPO
- **Aufnahme:** rechtListe nicht leer
- **Begründung (Protokoll):** Fakultative rechtliche Begründung.

**Wortlaut:**

> II. Rechtliches

### 10. `O09b_recht`

- [ ] **abgenommen** (David)
- **Norm:** Art. 221 Abs. 3 ZPO
- **Aufnahme:** rechtListe nicht leer
- **Wiederholt über:** `rechtListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Rechtliche Erwägungen, je Ziffer.

**Wortlaut:**

> {{item.text}}

### 11. `O10_beweisverzeichnis` — «Beweismittelverzeichnis»

- [ ] **abgenommen** (David)
- **Norm:** Art. 221 Abs. 2 lit. d ZPO
- **Aufnahme:** beweisverzeichnisListe nicht leer
- **Wiederholt über:** `beweisverzeichnisListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Verzeichnis aller bezeichneten Beweismittel — Pflichtbeilage.

**Wortlaut:**

> – {{item.text}}

### 12. `O11_beilagen` — «Beilagen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 221 Abs. 2 ZPO
- **Aufnahme:** beilagenListe nicht leer
- **Wiederholt über:** `beilagenListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Vollmacht, Klagebewilligung/Verzicht, verfügbare Beweisurkunden.

**Wortlaut:**

> – {{item.text}}

### 13. `O12_gruss`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** schlussformel
- **Begründung (Protokoll):** Schlussformel der Eingabe.

**Wortlaut:**

> Mit freundlichen Grüssen

### 14. `O13_unterschrift`

- [ ] **abgenommen** (David)
- **Norm:** Art. 221 Abs. 1 lit. f ZPO
- **Aufnahme:** immer
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Eigenhändige Unterschrift (Gültigkeitserfordernis).

**Wortlaut:**

> _________________________________
> {{unterschriftName}}

### 15. `O14_doppel`

- [ ] **abgenommen** (David)
- **Norm:** Art. 131 ZPO
- **Aufnahme:** immer
- **Begründung (Protokoll):** Exemplare-Hinweis nach Art. 131 ZPO.

**Wortlaut:**

> Einreichung im Doppel: ein Exemplar für das Gericht und je ein Exemplar für jede beklagte Partei (Art. 131 ZPO).

---

**Summe:** 15 Bausteine in 1 Schemas.
