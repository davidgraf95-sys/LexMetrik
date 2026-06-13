# Abnahme-Dossier: Auftrag/Dienstleistungsvertrag — alle Bausteine Wort für Wort

**Zweck:** Wort-für-Wort-Abnahme durch David (fachkundige Person, CLAUDE.md §7).
Je Baustein eine Abhak-Zeile.

**Quelle:** `src/lib/vorlagen/auftrag.ts (AF_SCHEMA)`. **Generiert:**
`npx vite-node scripts/abnahme-dossiers.ts` — nach Engine-Änderungen NEU
laufen lassen; das Dossier ist eine Ableitung, keine zweite Pflege-Stelle (§5).

**Lesehilfe:** «Aufnahme: immer» = Baustein steht in jedem Dokument; sonst die
lesbare `includeIf`-Bedingung über die Antwort-Felder. «wiederholt über» =
ein Absatz je Listeneintrag ({{item.…}}-Platzhalter). {{platzhalter}} werden
beim Erzeugen interpoliert; Fragment-Felder (…Satz/…Zeile) verschwinden leer
ersatzlos.


---

## Auftrag (Dienstleistungsvertrag)

Schema `auftrag` · Version 1.0.0 (Wettbewerbsanalyse V3; Art. 394/396/397/398/400/402/404 OR verifiziert 20260101) · Format vertrag · Ausgabe fertig

> **Disclaimer (Fusszeile):** Erstellt mit LexMetrik. Keine Rechtsberatung. Der Auftrag ist formfrei gültig; die beidseitige Unterzeichnung dient dem Beweis. Das jederzeitige Auflösungsrecht (Art. 404 OR) ist zwingend. Massgebend sind Gesetz (Art. 394 ff. OR) und der konkrete Einzelfall.


### 1. `AF01_parteien`

- [ ] **abgenommen** (David)
- **Norm:** Art. 394 OR
- **Aufnahme:** immer
- **Layout-Rolle:** parteien
- **Begründung (Protokoll):** Bezeichnung der Vertragsparteien – immer enthalten.

**Wortlaut:**

> zwischen
>
> {{auftraggeberBlock}}
> (Auftraggeberin)
>
> und
>
> {{beauftragteBlock}}
> (Beauftragte)

### 2. `AF02_gegenstand` — «Gegenstand des Auftrags»

- [ ] **abgenommen** (David)
- **Norm:** Art. 394 Abs. 1 OR
- **Aufnahme:** immer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Umschreibung der übertragenen Geschäfte/Dienste (Gegenstands-Modul je Mandatstyp) – immer enthalten.

**Wortlaut:**

> {{mandatRahmen}}: {{gegenstand}}.{{beginnSatz}} Die Beauftragte besorgt die übertragenen Geschäfte vertragsgemäss.

### 3. `AF03_umfang` — «Umfang und Vollmacht»

- [ ] **abgenommen** (David)
- **Norm:** Art. 396 OR
- **Aufnahme:** detailgrad ∈ {"standard", "experte"}
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Umfang nach Natur des Geschäfts und gesetzlich umschriebener Bereich der besonderen Ermächtigung (Art. 396 Abs. 3 OR) – ab Detailgrad «standard» (in «einfach» ausgeblendet).

**Wortlaut:**

> Der Umfang des Auftrags bestimmt sich nach dieser Vereinbarung und nach der Natur des zu besorgenden Geschäfts; die Beauftragte ist zu den Rechtshandlungen ermächtigt, die zur Ausführung gehören. Für besonders bezeichnete Geschäfte – namentlich den Abschluss eines Vergleichs, die Annahme eines Schiedsgerichts, das Eingehen wechselrechtlicher Verbindlichkeiten, die Veräusserung oder Belastung von Grundstücken sowie Schenkungen – bedarf sie einer besonderen Ermächtigung.{{vollmachtSatz}}

### 4. `AF04_sorgfalt` — «Sorgfalt und Ausführung»

- [ ] **abgenommen** (David)
- **Norm:** Art. 398 OR
- **Aufnahme:** immer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Sorgfalts- und Treuepflicht (Art. 398 Abs. 2 OR) sowie persönliche Ausführung bzw. zugelassene Substitution (Abs. 3) – immer enthalten.

**Wortlaut:**

> Die Beauftragte haftet für getreue und sorgfältige Ausführung des übertragenen Geschäfts. {{ausfuehrungSatz}}

### 5. `AF05_weisungen` — «Weisungen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 397 Abs. 1 OR
- **Aufnahme:** weisungsKlausel = true
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Weisungsbindung (Art. 397 Abs. 1 OR) – optional, weil deklaratorisch.

**Wortlaut:**

> Die Beauftragte beachtet die Weisungen der Auftraggeberin. Von einer Weisung darf sie nur abweichen, soweit die Einholung einer Erlaubnis nach den Umständen nicht tunlich ist und anzunehmen ist, die Auftraggeberin würde sie bei Kenntnis der Sachlage erteilen.

### 6. `AF06_verguetung` — «Vergütung»

- [ ] **abgenommen** (David)
- **Norm:** Art. 394 Abs. 3 OR
- **Aufnahme:** immer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Vergütungsregelung – eine Vergütung ist nur geschuldet, wenn verabredet oder üblich (Art. 394 Abs. 3 OR); die gewählte Regelung hält dies fest.

**Wortlaut:**

> {{verguetungText}}

### 7. `AF07_auslagen` — «Auslagen und Verwendungen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 402 Abs. 1 OR
- **Aufnahme:** auslagenErsatz = true
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Auslagen-/Verwendungsersatz (Art. 402 Abs. 1 OR) – ausdrücklich aufgenommen.

**Wortlaut:**

> Die Auftraggeberin ersetzt der Beauftragten die Auslagen und Verwendungen, die diese in richtiger Ausführung des Auftrags gemacht hat, samt Zinsen, und befreit sie von den dabei eingegangenen Verbindlichkeiten.

### 8. `AF08_rechenschaft` — «Rechenschaft und Herausgabe»

- [ ] **abgenommen** (David)
- **Norm:** Art. 400 Abs. 1 OR
- **Aufnahme:** immer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Rechenschafts- und Herausgabepflicht (Art. 400 Abs. 1 OR) – immer enthalten.

**Wortlaut:**

> Die Beauftragte legt der Auftraggeberin auf Verlangen jederzeit über ihre Geschäftsführung Rechenschaft ab und erstattet alles, was ihr aus der Geschäftsbesorgung zugekommen ist. Gelder, mit deren Ablieferung sie im Rückstand ist, hat sie zu verzinsen.

### 9. `AF09_beendigung` — «Dauer und Beendigung»

- [ ] **abgenommen** (David)
- **Norm:** Art. 404 OR
- **Aufnahme:** immer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Zwingendes jederzeitiges Auflösungsrecht (Art. 404 Abs. 1 OR) und Schadenersatz bei Beendigung zur Unzeit (Abs. 2) – immer enthalten, keine Ausschlussklausel (§8).
- **Hinweis (offengelegt):** Das jederzeitige Auflösungsrecht ist nach bundesgerichtlicher Rechtsprechung zwingend; abweichende Ausschluss- oder Mindestdauer-Klauseln sind wirkungslos.

**Wortlaut:**

> Der Auftrag kann von jeder Partei jederzeit widerrufen oder gekündigt werden (Art. 404 Abs. 1 OR). Dieses Recht ist zwingend und kann nicht gültig ausgeschlossen werden. Erfolgt die Auflösung zur Unzeit, ersetzt die zurücktretende Partei der anderen den dadurch verursachten Schaden (Art. 404 Abs. 2 OR). Bereits erbrachte Leistungen und entstandene Auslagen sind nach den vorstehenden Bestimmungen abzugelten.

### 10. `AF09b_geheimhaltung` — «Geheimhaltung»

- [ ] **abgenommen** (David)
- **Norm:** Art. 398 Abs. 2 OR
- **Aufnahme:** detailgrad = "experte"
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Geheimhaltungsklausel (Treuepflicht aus Art. 398 Abs. 2 OR konkretisiert) – Detailgrad «experte».

**Wortlaut:**

> Die Beauftragte hält alle ihr im Rahmen des Auftrags bekannt gewordenen, nicht offenkundigen Geschäfts- und Privatangelegenheiten der Auftraggeberin geheim; diese Pflicht besteht auch nach Beendigung des Auftrags fort.

### 11. `AF09c_haftung` — «Haftung»

- [ ] **abgenommen** (David)
- **Norm:** Art. 100 Abs. 1 OR
- **Aufnahme:** detailgrad = "experte"
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Haftungsklausel mit zwingender Schranke Art. 100 Abs. 1 OR – Detailgrad «experte» (offengelegt, keine unzulässige Freizeichnung).

**Wortlaut:**

> Die Beauftragte haftet für getreue und sorgfältige Ausführung (Art. 398 OR). Für leichte Fahrlässigkeit kann die Haftung im gesetzlich zulässigen Rahmen begrenzt werden; eine Freizeichnung für rechtswidrige Absicht oder grobe Fahrlässigkeit ist unwirksam (Art. 100 Abs. 1 OR).

### 12. `AF09d_gerichtsstand` — «Anwendbares Recht und Gerichtsstand»

- [ ] **abgenommen** (David)
- **Norm:** Art. 19 OR
- **Aufnahme:** detailgrad = "experte"
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Rechtswahl- und Gerichtsstandsklausel mit Vorbehalt zwingender Gerichtsstände – Detailgrad «experte».

**Wortlaut:**

> Dieser Vertrag untersteht schweizerischem Recht. Ausschliesslicher Gerichtsstand ist der Sitz der Auftraggeberin, soweit nicht zwingende Gerichtsstände entgegenstehen.

### 13. `AF10_schluss` — «Schlussbestimmungen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 394 OR
- **Aufnahme:** immer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Schriftformvorbehalt für Änderungen, Ausfertigung und Gesetzesverweis – immer enthalten.

**Wortlaut:**

> Änderungen und Ergänzungen dieses Vertrags bedürfen der Schriftform. Dieser Vertrag wird in zwei Exemplaren ausgefertigt; jede Partei erhält ein unterzeichnetes Exemplar. Im Übrigen gelten die Bestimmungen des Obligationenrechts über den Auftrag (Art. 394 ff. OR).

### 14. `AF11_unterschriften`

- [ ] **abgenommen** (David)
- **Norm:** Art. 394 OR
- **Aufnahme:** immer
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Ort, Datum und beidseitige Unterschriften – dienen dem Beweis (formfreier Vertrag).

**Wortlaut:**

> {{ort}}, {{datumFmt}}
>
>
> Die Auftraggeberin:
>
> ___________________________
> {{auftraggeberName}}
>
>
> Die Beauftragte:
>
> ___________________________
> {{beauftragteName}}

---

**Summe:** 14 Bausteine in 1 Schemas.
