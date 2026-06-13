# Abnahme-Dossier: Schlichtungsgesuch — alle Bausteine Wort für Wort

**Zweck:** Wort-für-Wort-Abnahme durch David (fachkundige Person, CLAUDE.md §7).
Je Baustein eine Abhak-Zeile.

**Quelle:** `src/lib/vorlagen/schlichtungsgesuchBs.ts (SG_SCHEMA)`. **Generiert:**
`npx vite-node scripts/abnahme-dossiers.ts` — nach Engine-Änderungen NEU
laufen lassen; das Dossier ist eine Ableitung, keine zweite Pflege-Stelle (§5).

**Lesehilfe:** «Aufnahme: immer» = Baustein steht in jedem Dokument; sonst die
lesbare `includeIf`-Bedingung über die Antwort-Felder. «wiederholt über» =
ein Absatz je Listeneintrag ({{item.…}}-Platzhalter). {{platzhalter}} werden
beim Erzeugen interpoliert; Fragment-Felder (…Satz/…Zeile) verschwinden leer
ersatzlos.


---

## Schlichtungsgesuch nach Art. 202 ZPO

Schema `schlichtungsgesuch-bs` · Version 1.0.0 (ZPO-Fassung seit 1.1.2025; Behörden-Stammdaten BS Stand 2025/2026) · Format eingabe · Ausgabe fertig

> **Disclaimer (Fusszeile):** Entwurf – erstellt mit LexMetrik. Orientierungsdokument, keine Rechtsberatung. Massgeblich sind Gesetz, Vertrag und der konkrete Sachverhalt; für Fristwahrung, Formgültigkeit und inhaltliche Richtigkeit ist die nutzende Person verantwortlich. Die örtliche und sachliche Zuständigkeit der angeschriebenen Behörde ist selbst zu prüfen.


### 1. `adressat`

- [ ] **abgenommen** (David)
- **Norm:** Art. 200 ZPO
- **Aufnahme:** immer
- **Layout-Rolle:** adressat
- **Begründung (Protokoll):** Zuständige Behörde gemäss sachlichem Routing (Pilot: Zivilgericht BS).

**Wortlaut:**

> {{adressatBlock}}

### 2. `ortDatum`

- [ ] **abgenommen** (David)
- **Norm:** Art. 130 ZPO
- **Aufnahme:** immer
- **Layout-Rolle:** datumzeile
- **Begründung (Protokoll):** Ort und Datum – immer enthalten.

**Wortlaut:**

> {{ort}}, {{datumFmt}}

### 3. `betreff`

- [ ] **abgenommen** (David)
- **Norm:** Art. 202 ZPO
- **Aufnahme:** immer
- **Layout-Rolle:** betreff
- **Begründung (Protokoll):** Betreff mit Parteien und Streitgegenstand-Stichwort – immer enthalten.

**Wortlaut:**

> Schlichtungsgesuch nach Art. 202 ZPO

### 4. `rubrum`

- [ ] **abgenommen** (David)
- **Norm:** Art. 202 Abs. 2 ZPO
- **Aufnahme:** immer
- **Layout-Rolle:** rubrum
- **Begründung (Protokoll):** Rubrum: Bezeichnung der Parteien (Pflichtinhalt).

**Wortlaut:**

> {{rubrumText}}

### 5. `anrede`

- [ ] **abgenommen** (David)
- **Norm:** Art. 202 ZPO
- **Aufnahme:** immer
- **Layout-Rolle:** anrede
- **Begründung (Protokoll):** Anrede und Einleitungsformel (anwaltliche Usanz, kein Pflichtinhalt); Numerus/Vertretung dynamisch.

**Wortlaut:**

> Sehr geehrte Damen und Herren
>
> {{einleitungSatz}}

### 6. `rechtsbegehren` — «Rechtsbegehren»

- [ ] **abgenommen** (David)
- **Norm:** Art. 202 Abs. 2 ZPO
- **Aufnahme:** rbListe nicht leer
- **Wiederholt über:** `rbListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Rechtsbegehren (Pflichtinhalt), fortlaufend nummeriert; Kostenfolge als letztes Begehren.

**Wortlaut:**

> {{item.text}}

### 7. `antrag_entscheid` — «Antrag auf Entscheid»

- [ ] **abgenommen** (David)
- **Norm:** Art. 212 ZPO
- **Aufnahme:** antragEntscheidZulaessig = true
- **Begründung (Protokoll):** Aufgenommen, weil beantragt und Streitwert ≤ CHF 2'000 (vermögensrechtlich).

**Wortlaut:**

> Die klagende Partei beantragt, dass die Schlichtungsbehörde gestützt auf Art. 212 ZPO in der Sache entscheidet.

### 8. `antrag_mediation` — «Antrag auf Mediation»

- [ ] **abgenommen** (David)
- **Norm:** Art. 213 ZPO
- **Aufnahme:** antragMediation = true
- **Begründung (Protokoll):** Aufgenommen, weil Mediation beantragt – setzt Zustimmung der Gegenpartei voraus.
- **Hinweis (offengelegt):** Kann auch erst an der Schlichtungsverhandlung gestellt werden; Unterschrift beider Parteien.

**Wortlaut:**

> Die Parteien beantragen, anstelle des Schlichtungsverfahrens eine Mediation durchzuführen (Art. 213 ZPO).
>
> ___________________________
> (klagende Partei)
>
> ___________________________
> (beklagte Partei)

### 9. `streitgegenstand_text` — «Streitgegenstand»

- [ ] **abgenommen** (David)
- **Norm:** Art. 202 Abs. 2 ZPO
- **Aufnahme:** immer
- **Begründung (Protokoll):** Kurze Umschreibung des Streitgegenstands (Pflichtinhalt).

**Wortlaut:**

> {{streitgegenstand}}

### 10. `begruendung_text` — «Begründung»

- [ ] **abgenommen** (David)
- **Norm:** Art. 202 Abs. 2 ZPO
- **Aufnahme:** begruendung nicht leer
- **Begründung (Protokoll):** Aufgenommen, weil eine (freiwillige) Begründung erfasst wurde – nicht erforderlich.

**Wortlaut:**

> {{begruendung}}

### 11. `schlussformel`

- [ ] **abgenommen** (David)
- **Norm:** Art. 202 ZPO
- **Aufnahme:** immer
- **Layout-Rolle:** schlussformel
- **Begründung (Protokoll):** Schlussformel (anwaltliche Usanz).

**Wortlaut:**

> Mit freundlichen Grüssen

### 12. `unterschrift`

- [ ] **abgenommen** (David)
- **Norm:** Art. 130 ZPO
- **Aufnahme:** immer
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Unterschriftsblock: Papierform mit eigenhändiger Unterschrift.

**Wortlaut:**

> {{ort}}, {{datumFmt}}
>
>
> ___________________________
> {{unterschriftZeile}}

### 13. `beilagenverzeichnis` — «Beilagen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 131 ZPO
- **Aufnahme:** beilagenListe nicht leer
- **Wiederholt über:** `beilagenListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Beilagenverzeichnis (inkl. automatischer Vollmacht bei Vertretung).

**Wortlaut:**

> {{item.text}}

### 14. `doppel_vermerk`

- [ ] **abgenommen** (David)
- **Norm:** Art. 131 ZPO
- **Aufnahme:** immer
- **Begründung (Protokoll):** Exemplar-Vermerk (Art. 131 ZPO: je ein Exemplar für Behörde und Gegenpartei) – Usanz-Baustein.

**Wortlaut:**

> Diese Eingabe und ihre Beilagen werden {{exemplareWort}} eingereicht.

---

**Summe:** 14 Bausteine in 1 Schemas.
