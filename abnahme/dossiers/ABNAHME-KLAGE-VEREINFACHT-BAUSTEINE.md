# Abnahme-Dossier: Klage im vereinfachten Verfahren — alle Bausteine Wort für Wort

**Zweck:** Wort-für-Wort-Abnahme durch David (fachkundige Person, CLAUDE.md §7).
Je Baustein eine Abhak-Zeile.

**Quelle:** `src/lib/vorlagen/klageVereinfacht.ts (KLAGE_V_SCHEMA)`. **Generiert:**
`npx vite-node scripts/abnahme-dossiers.ts` — nach Engine-Änderungen NEU
laufen lassen; das Dossier ist eine Ableitung, keine zweite Pflege-Stelle (§5).

**Lesehilfe:** «Aufnahme: immer» = Baustein steht in jedem Dokument; sonst die
lesbare `includeIf`-Bedingung über die Antwort-Felder. «wiederholt über» =
ein Absatz je Listeneintrag ({{item.…}}-Platzhalter). {{platzhalter}} werden
beim Erzeugen interpoliert; Fragment-Felder (…Satz/…Zeile) verschwinden leer
ersatzlos.


---

## Klage im vereinfachten Verfahren

Schema `klage-vereinfacht-bs` · Version 1.0.0 (ZPO-Fassung seit 1.1.2025; GOG BS gem. Auftrag 5.6.2026) · Format eingabe · Ausgabe fertig

> **Disclaimer (Fusszeile):** Erstellt mit LexMetrik – keine Rechtsberatung. Klage im vereinfachten Verfahren nach Art. 243 ff. ZPO; einzureichen unterschrieben im Doppel (ein Exemplar je Gegenpartei, Art. 131 ZPO), mit Klagebewilligung bzw. Ausnahme-Nachweis als Beilage. Fristen (Art. 209 Abs. 3/4 ZPO) eigenverantwortlich wahren.


### 1. `K02_adressat`

- [ ] **abgenommen** (David)
- **Norm:** Art. 4 ZPO i.V.m. GOG BS
- **Aufnahme:** immer
- **Layout-Rolle:** adressat
- **Begründung (Protokoll):** Zuständiges Gericht aus dem deterministischen Routing (BS: GOG-Spruchkörper; übrige Kantone: kantonale Gerichtsschicht).

**Wortlaut:**

> {{gerichtBlock}}

### 2. `K03_datum`

- [ ] **abgenommen** (David)
- **Norm:** Art. 244 Abs. 1 lit. e ZPO
- **Aufnahme:** immer
- **Layout-Rolle:** datumzeile
- **Begründung (Protokoll):** Ort und Datum der Eingabe.

**Wortlaut:**

> {{ortDatumZeile}}

### 3. `K04_betreff`

- [ ] **abgenommen** (David)
- **Norm:** Art. 244 Abs. 1 lit. d ZPO
- **Aufnahme:** immer
- **Layout-Rolle:** betreff
- **Begründung (Protokoll):** Betreff mit Verfahrensart; Streitwert, wo nötig.

**Wortlaut:**

> Klage im vereinfachten Verfahren (Art. 243 ff. ZPO){{streitwertBetreffZeile}}

### 4. `K05_rubrum`

- [ ] **abgenommen** (David)
- **Norm:** Art. 244 Abs. 1 lit. a–c ZPO
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

### 5. `K06_begehren` — «Rechtsbegehren»

- [ ] **abgenommen** (David)
- **Norm:** Art. 244 Abs. 1 lit. b ZPO
- **Aufnahme:** immer
- **Wiederholt über:** `rechtsbegehrenListe` (ein Absatz je Eintrag)
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Bezifferte (Art. 84 Abs. 2) bzw. unbezifferte (Art. 85) Begehren; Kostenfolge.

**Wortlaut:**

> {{item.text}}

### 6. `K07_formelles` — «Formelles»

- [ ] **abgenommen** (David)
- **Norm:** Art. 243/209 ZPO; GOG BS
- **Aufnahme:** immer
- **Begründung (Protokoll):** Zuständigkeit, Verfahrensart, Klagebewilligung/Ausnahme, ggf. Kostenfreiheit.

**Wortlaut:**

> {{formellesText}}

### 7. `K08_begruendung_intro` — «Begründung»

- [ ] **abgenommen** (David)
- **Norm:** Art. 244 Abs. 2 ZPO
- **Aufnahme:** sachverhaltListe nicht leer
- **Begründung (Protokoll):** Freiwillige Begründung als strukturierte Tatsachenbehauptungen.

**Wortlaut:**

> Zur Begründung wird Folgendes ausgeführt (Art. 244 Abs. 2 ZPO):

### 8. `K08b_sachverhalt`

- [ ] **abgenommen** (David)
- **Norm:** Art. 244 Abs. 2 ZPO
- **Aufnahme:** sachverhaltListe nicht leer
- **Wiederholt über:** `sachverhaltListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Je Behauptung eine Zeile (Tatsachendarstellung).

**Wortlaut:**

> – {{item.text}}

### 9. `K08c_beweise` — «Beweismittel»

- [ ] **abgenommen** (David)
- **Norm:** Art. 244 Abs. 3 lit. c ZPO
- **Aufnahme:** beweismittelListe nicht leer
- **Wiederholt über:** `beweismittelListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Beweismittel-Verzeichnis (Urkunden, Zeugen, Parteibefragung).

**Wortlaut:**

> – {{item.bezeichnung}}{{item.fuerZeile}}

### 10. `K09_keine_begruendung`

- [ ] **abgenommen** (David)
- **Norm:** Art. 244 Abs. 2 ZPO
- **Aufnahme:** ohneBegruendung = true
- **Begründung (Protokoll):** Verzichts-Baustein: Begründung ist im vereinfachten Verfahren freiwillig.

**Wortlaut:**

> Auf eine schriftliche Begründung wird verzichtet; sie erfolgt mündlich an der Hauptverhandlung (Art. 244 Abs. 2, Art. 245 Abs. 1 ZPO).

### 11. `K10_beilagen` — «Beilagen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 244 Abs. 3 ZPO
- **Aufnahme:** beilagenListe nicht leer
- **Wiederholt über:** `beilagenListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Beilagenverzeichnis: Klagebewilligung bzw. Ausnahme-Nachweis, Vollmacht, Beweisurkunden.

**Wortlaut:**

> – {{item.text}}

### 12. `K11_gruss`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** schlussformel
- **Begründung (Protokoll):** Schlussformel der Eingabe.

**Wortlaut:**

> Mit freundlichen Grüssen

### 13. `K12_unterschrift`

- [ ] **abgenommen** (David)
- **Norm:** Art. 244 Abs. 1 lit. e ZPO
- **Aufnahme:** immer
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Eigenhändige Unterschrift (Gültigkeitserfordernis).

**Wortlaut:**

> _________________________________
> {{unterschriftName}}

### 14. `K13_doppel`

- [ ] **abgenommen** (David)
- **Norm:** Art. 131 ZPO
- **Aufnahme:** immer
- **Begründung (Protokoll):** Exemplare-Hinweis nach Art. 131 ZPO.

**Wortlaut:**

> Einreichung im Doppel: ein Exemplar für das Gericht und je ein Exemplar für jede beklagte Partei (Art. 131 ZPO).

---

**Summe:** 14 Bausteine in 1 Schemas.
