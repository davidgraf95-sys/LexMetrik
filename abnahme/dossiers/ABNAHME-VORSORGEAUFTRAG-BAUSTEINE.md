# Abnahme-Dossier: Vorsorgeauftrag — alle Bausteine Wort für Wort

**Zweck:** Wort-für-Wort-Abnahme durch David (fachkundige Person, CLAUDE.md §7).
Je Baustein eine Abhak-Zeile.

**Quelle:** `src/lib/vorlagen/vorsorgeauftrag.ts (VA_SCHEMA)`. **Generiert:**
`npx vite-node scripts/abnahme-dossiers.ts` — nach Engine-Änderungen NEU
laufen lassen; das Dossier ist eine Ableitung, keine zweite Pflege-Stelle (§5).

**Lesehilfe:** «Aufnahme: immer» = Baustein steht in jedem Dokument; sonst die
lesbare `includeIf`-Bedingung über die Antwort-Felder. «wiederholt über» =
ein Absatz je Listeneintrag ({{item.…}}-Platzhalter). {{platzhalter}} werden
beim Erzeugen interpoliert; Fragment-Felder (…Satz/…Zeile) verschwinden leer
ersatzlos.


---

## Vorsorgeauftrag

Schema `vorsorgeauftrag` · Version 1.0.0 (Rechtsstand Art. 360–369 ZGB, in Kraft seit 1.1.2013) · Format verfuegung · Ausgabe abschrift

> **Disclaimer (Fusszeile):** Entwurf – erstellt mit LexMetrik. Keine Rechtsberatung. Gültig ist der Vorsorgeauftrag nur vollständig eigenhändig (von Hand geschrieben, datiert, unterzeichnet, Art. 361 Abs. 2 ZGB) oder öffentlich beurkundet (Art. 361 Abs. 1 ZGB); wirksam erst nach Validierung durch die KESB (Art. 363 ZGB). Bei komplexen Vermögensverhältnissen oder Unternehmen: Notariat bzw. Fachberatung beiziehen.


### 1. `V01_identifikation`

- [ ] **abgenommen** (David)
- **Norm:** Art. 360 Abs. 1 ZGB
- **Aufnahme:** immer
- **Begründung (Protokoll):** Identifikation und Handlungsfähigkeits-Präambel – immer enthalten.

**Wortlaut:**

> Ich, {{vorname}} {{nachname}}, geboren am {{geburtsdatum}}, von {{heimatort}}, wohnhaft {{adresse}}, errichte hiermit – handlungsfähig im Sinne von Art. 13 ZGB – für den Fall meiner Urteilsunfähigkeit den folgenden Vorsorgeauftrag:

### 2. `V02_beauftragte` — «Beauftragte Person(en)»

- [ ] **abgenommen** (David)
- **Norm:** Art. 360 Abs. 1 ZGB
- **Aufnahme:** beauftragteListe nicht leer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Aufgenommen, weil mindestens eine beauftragte Person bezeichnet wurde.

**Wortlaut:**

> Ich beauftrage:

### 3. `V02b_beauftragteliste`

- [ ] **abgenommen** (David)
- **Norm:** Art. 360 Abs. 1 ZGB
- **Aufnahme:** beauftragteListe nicht leer
- **Wiederholt über:** `beauftragteListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Je beauftragte Person eine Zeile mit den übertragenen Aufgabenbereichen.

**Wortlaut:**

> – {{item.name}} ({{item.angaben}}) für: {{item.bereicheText}};

### 4. `V03_ersatz`

- [ ] **abgenommen** (David)
- **Norm:** Art. 360 Abs. 3 ZGB
- **Aufnahme:** ersatzText nicht leer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Aufgenommen, weil Ersatzpersonen bezeichnet wurden (Ersatzverfügung).

**Wortlaut:**

> Ist eine beauftragte Person für die Aufgaben nicht geeignet, nimmt sie den Auftrag nicht an oder kündigt sie ihn, setze ich als Ersatz ein (in dieser Reihenfolge): {{ersatzText}}.

### 5. `V04_personensorge` — «Personensorge»

- [ ] **abgenommen** (David)
- **Norm:** Art. 360 Abs. 1 ZGB
- **Aufnahme:** personensorgeListe nicht leer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Aufgenommen, weil der Bereich Personensorge übertragen und Module gewählt wurden.

**Wortlaut:**

> Im Bereich der Personensorge umfasst der Auftrag insbesondere:

### 6. `V04b_personensorgeliste`

- [ ] **abgenommen** (David)
- **Norm:** Art. 360 Abs. 2 ZGB
- **Aufnahme:** personensorgeListe nicht leer
- **Wiederholt über:** `personensorgeListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Je gewähltes Personensorge-Modul eine Zeile.

**Wortlaut:**

> – {{item.label}};

### 7. `V05_vermoegenssorge` — «Vermögenssorge»

- [ ] **abgenommen** (David)
- **Norm:** Art. 360 Abs. 1 ZGB
- **Aufnahme:** vermoegenssorgeListe nicht leer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Aufgenommen, weil der Bereich Vermögenssorge übertragen und Module gewählt wurden.

**Wortlaut:**

> Im Bereich der Vermögenssorge umfasst der Auftrag insbesondere:

### 8. `V05b_vermoegenssorgeliste`

- [ ] **abgenommen** (David)
- **Norm:** Art. 360 Abs. 2 ZGB
- **Aufnahme:** vermoegenssorgeListe nicht leer
- **Wiederholt über:** `vermoegenssorgeListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Je gewähltes Vermögenssorge-Modul eine Zeile.

**Wortlaut:**

> – {{item.label}};

### 9. `V06_rechtsverkehr` — «Vertretung im Rechtsverkehr»

- [ ] **abgenommen** (David)
- **Norm:** Art. 360 Abs. 1 ZGB
- **Aufnahme:** rechtsverkehrListe nicht leer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Aufgenommen, weil der Bereich Rechtsverkehr übertragen und Module gewählt wurden.

**Wortlaut:**

> Im Rechtsverkehr umfasst der Auftrag insbesondere:

### 10. `V06b_rechtsverkehrliste`

- [ ] **abgenommen** (David)
- **Norm:** Art. 360 Abs. 2 ZGB
- **Aufnahme:** rechtsverkehrListe nicht leer
- **Wiederholt über:** `rechtsverkehrListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Je gewähltes Rechtsverkehr-Modul eine Zeile.

**Wortlaut:**

> – {{item.label}};

### 11. `V07_grundstueck`

- [ ] **abgenommen** (David)
- **Norm:** Art. 396 Abs. 3 OR
- **Aufnahme:** liegenschaftenGewaehlt = true
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Automatisch aufgenommen, weil das Modul «Liegenschaften» gewählt wurde – ausdrückliche Sondervollmacht.
- **Hinweis (offengelegt):** Ob Art. 396 Abs. 3 OR auf den Vorsorgeauftrag analog anwendbar ist, ist in der Lehre umstritten; die Praxis empfiehlt die ausdrückliche Sondervollmacht dennoch.

**Wortlaut:**

> Die beauftragte Person ist ausdrücklich ermächtigt, Grundeigentum zu erwerben, zu belasten und zu veräussern sowie die entsprechenden Grundbucheinschreibungen zu veranlassen.

### 12. `V08_schenkungen`

- [ ] **abgenommen** (David)
- **Norm:** Art. 240 Abs. 2 OR
- **Aufnahme:** schenkungenErlaubt = true
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Aufgenommen, weil Gelegenheitsgeschenke erlaubt werden sollen.
- **Hinweis (offengelegt):** Aus dem Vermögen einer handlungsunfähigen Person dürfen nur übliche Gelegenheitsgeschenke ausgerichtet werden – weitergehende Schenkungen sind problematisch.

**Wortlaut:**

> Die beauftragte Person ist befugt, übliche Gelegenheitsgeschenke auszurichten und Zuwendungen zur Erfüllung einer sittlichen Pflicht vorzunehmen.

### 13. `V09_besondere`

- [ ] **abgenommen** (David)
- **Norm:** Art. 396 Abs. 3 OR
- **Aufnahme:** besondereGeschaefte = true
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Aufgenommen, weil besondere Geschäfte ausdrücklich ermächtigt werden sollen.

**Wortlaut:**

> Die beauftragte Person ist ausdrücklich ermächtigt, Vergleiche abzuschliessen, Schiedsvereinbarungen einzugehen und Wechselverbindlichkeiten einzugehen.

### 14. `V10_weisungen` — «Weisungen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 360 Abs. 2 ZGB
- **Aufnahme:** weisungen nicht leer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Aufgenommen, weil Weisungen für die Erfüllung der Aufgaben erteilt wurden.

**Wortlaut:**

> {{weisungen}}

### 15. `V11_entschaedigung` — «Entschädigung»

- [ ] **abgenommen** (David)
- **Norm:** Art. 366 ZGB
- **Aufnahme:** entschaedigungText nicht leer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Aufgenommen, weil eine Entschädigungsregelung getroffen wurde (sonst legt die KESB sie fest).

**Wortlaut:**

> {{entschaedigungText}}

### 16. `V12_pv`

- [ ] **abgenommen** (David)
- **Norm:** Art. 370 ZGB
- **Aufnahme:** pvVorhanden = true
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Aufgenommen, weil auf eine bestehende Patientenverfügung verwiesen wird.

**Wortlaut:**

> Ich habe eine separate Patientenverfügung errichtet{{pvHinterlegungZeile}}; für medizinische Massnahmen geht diese vor.

### 17. `V13_ersetzt`

- [ ] **abgenommen** (David)
- **Norm:** Art. 362 Abs. 3 ZGB
- **Aufnahme:** ersetztFruehere = true
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Aufgenommen, weil frühere Vorsorgeaufträge ausdrücklich ersetzt werden sollen.

**Wortlaut:**

> Dieser Vorsorgeauftrag ersetzt alle früheren Vorsorgeaufträge.

### 18. `V14_schluss_eigenhaendig`

- [ ] **abgenommen** (David)
- **Norm:** Art. 361 Abs. 2 ZGB
- **Aufnahme:** formMode = "eigenhaendig"
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Schlussformel der eigenhändigen Form: Ort/Datum und Unterschrift werden – wie der ganze Text – von Hand geschrieben.

**Wortlaut:**

> {{ortDatumZeile}}
>
>
> _________________________________
> (eigenhändige Unterschrift: {{vorname}} {{nachname}})

### 19. `V14_schluss_beurkundung`

- [ ] **abgenommen** (David)
- **Norm:** Art. 361 Abs. 1 ZGB
- **Aufnahme:** formMode = "oeffentlich_beurkundet"
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Schlusshinweis der beurkundeten Form: Errichtung erfolgt vor der Urkundsperson.
- **Hinweis (offengelegt):** Das Beurkundungsverfahren richtet sich nach kantonalem Recht; zwei Zeugen wie beim öffentlichen Testament sind nicht erforderlich (BGE 151 III 81).

**Wortlaut:**

> Ort, Datum und Unterschriften erfolgen anlässlich der öffentlichen Beurkundung durch die Urkundsperson nach kantonalem Recht.

---

**Summe:** 19 Bausteine in 1 Schemas.
