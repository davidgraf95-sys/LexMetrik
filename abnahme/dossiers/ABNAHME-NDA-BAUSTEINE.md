# Abnahme-Dossier: Geheimhaltungsvereinbarung (NDA) — alle Bausteine Wort für Wort

**Zweck:** Wort-für-Wort-Abnahme durch David (fachkundige Person, CLAUDE.md §7).
Je Baustein eine Abhak-Zeile.

**Quelle:** `src/lib/vorlagen/nda.ts (NDA_SCHEMA)`. **Generiert:**
`npx vite-node scripts/abnahme-dossiers.ts` — nach Engine-Änderungen NEU
laufen lassen; das Dossier ist eine Ableitung, keine zweite Pflege-Stelle (§5).

**Lesehilfe:** «Aufnahme: immer» = Baustein steht in jedem Dokument; sonst die
lesbare `includeIf`-Bedingung über die Antwort-Felder. «wiederholt über» =
ein Absatz je Listeneintrag ({{item.…}}-Platzhalter). {{platzhalter}} werden
beim Erzeugen interpoliert; Fragment-Felder (…Satz/…Zeile) verschwinden leer
ersatzlos.


---

## Geheimhaltungsvereinbarung (NDA)

Schema `nda` · Version 1.0.0 (Wettbewerbsanalyse V3; Art. 19/160/161/163 OR verifiziert 20260101) · Format vertrag · Ausgabe fertig

> **Disclaimer (Fusszeile):** Erstellt mit LexMetrik. Keine Rechtsberatung. Die Geheimhaltungsvereinbarung ist ein Innominatvertrag (Art. 19 OR) und formfrei gültig; die beidseitige Unterzeichnung dient dem Beweis. Eine übermässige Konventionalstrafe setzt der Richter herab (Art. 163 Abs. 3 OR). Massgebend sind Gesetz und der konkrete Einzelfall.


### 1. `NDA01_parteien`

- [ ] **abgenommen** (David)
- **Norm:** Art. 19 OR
- **Aufnahme:** immer
- **Layout-Rolle:** parteien
- **Begründung (Protokoll):** Bezeichnung der Vertragsparteien (Rollen je nach einseitig/gegenseitig) – immer enthalten.

**Wortlaut:**

> zwischen
>
> {{parteiABlock}}
> ({{rolleA}})
>
> und
>
> {{parteiBBlock}}
> ({{rolleB}})

### 2. `NDA02_zweck` — «Zweck»

- [ ] **abgenommen** (David)
- **Norm:** Art. 19 OR
- **Aufnahme:** immer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Zweck der Offenlegung – bestimmt den zulässigen Verwendungsrahmen.

**Wortlaut:**

> Die Parteien tauschen im Hinblick auf den folgenden Zweck vertrauliche Informationen aus: {{zweck}}. Diese Vereinbarung regelt den Umgang mit diesen Informationen.

### 3. `NDA03_begriff` — «Vertrauliche Informationen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 19 OR
- **Aufnahme:** immer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Definition der vertraulichen Informationen samt üblicher Ausnahmen – immer enthalten.

**Wortlaut:**

> Als vertraulich gelten alle nicht offenkundigen Informationen, die eine Partei der anderen im Zusammenhang mit dem Zweck schriftlich, mündlich, elektronisch oder auf andere Weise zugänglich macht.{{infoBeschriebSatz}} Nicht vertraulich sind Informationen, die allgemein bekannt sind oder ohne Verletzung dieser Vereinbarung werden, die der empfangenden Partei rechtmässig und ohne Geheimhaltungspflicht von Dritten zugänglich gemacht werden oder die sie nachweislich unabhängig selbst erarbeitet hat.

### 4. `NDA04_pflicht` — «Geheimhaltungspflicht»

- [ ] **abgenommen** (David)
- **Norm:** Art. 19 OR
- **Aufnahme:** immer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Kern: Geheimhaltungs- und Zweckbindungspflicht (einseitig oder gegenseitig) – immer enthalten.

**Wortlaut:**

> {{pflichtText}} Die Informationen dürfen ausschliesslich für den genannten Zweck verwendet und nur Personen zugänglich gemacht werden, die sie für diesen Zweck kennen müssen und ihrerseits zur Vertraulichkeit verpflichtet sind.

### 5. `NDA05_dauer` — «Dauer»

- [ ] **abgenommen** (David)
- **Norm:** Art. 19 OR
- **Aufnahme:** dauerErfassen = true
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Nachwirkungsfrist der Geheimhaltung – nur wenn vereinbart.

**Wortlaut:**

> Die Geheimhaltungspflicht gilt ab Unterzeichnung und besteht während {{dauerJahre}} Jahren nach Beendigung der Zusammenarbeit oder des mit dem Zweck verfolgten Vorhabens fort.

### 6. `NDA06_rueckgabe` — «Rückgabe und Vernichtung»

- [ ] **abgenommen** (David)
- **Norm:** Art. 19 OR
- **Aufnahme:** rueckgabe = true
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Rückgabe-/Vernichtungspflicht – nur wenn vereinbart.

**Wortlaut:**

> Auf Verlangen der offenlegenden Partei sowie nach Wegfall des Zwecks gibt die empfangende Partei alle überlassenen Unterlagen und Datenträger zurück oder vernichtet sie samt Kopien und bestätigt dies auf Wunsch schriftlich; gesetzliche Aufbewahrungspflichten bleiben vorbehalten.

### 7. `NDA07_strafe` — «Konventionalstrafe»

- [ ] **abgenommen** (David)
- **Norm:** Art. 160 Abs. 1 OR
- **Aufnahme:** konventionalstrafe = true
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Konventionalstrafe mit ausdrücklicher Kumulation (Art. 160 Abs. 1 OR) und Schadensunabhängigkeit (Art. 161 Abs. 1 OR); die richterliche Herabsetzung übermässiger Strafen (Art. 163 Abs. 3 OR) ist offengelegt.
- **Hinweis (offengelegt):** Eine übermässig hohe Konventionalstrafe setzt der Richter nach Art. 163 Abs. 3 OR von Amtes wegen herab.

**Wortlaut:**

> Bei jeder Verletzung der Geheimhaltungspflicht schuldet die verletzende Partei eine Konventionalstrafe von CHF {{strafeFmt}}. Die Strafe ist auch ohne Schadensnachweis geschuldet (Art. 161 Abs. 1 OR); die Bezahlung befreit nicht von der Geheimhaltungspflicht. Ausdrücklich vorbehalten bleiben die weitere Unterlassung und der Ersatz eines die Strafe übersteigenden Schadens (Art. 160 Abs. 1 OR).

### 8. `NDA08_keinrecht` — «Keine Rechtsübertragung»

- [ ] **abgenommen** (David)
- **Norm:** Art. 19 OR
- **Aufnahme:** detailgrad ∈ {"standard", "experte"}
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Klarstellung: weder Offenlegungspflicht noch Rechtsübergang – ab Detailgrad «standard» (in «einfach» ausgeblendet).

**Wortlaut:**

> Diese Vereinbarung begründet keine Pflicht zur Offenlegung von Informationen und überträgt keine Rechte an den vertraulichen Informationen, insbesondere keine Lizenzen oder Immaterialgüterrechte.

### 9. `NDA08b_unterlassung` — «Unterlassung und Gerichtsstand»

- [ ] **abgenommen** (David)
- **Norm:** Art. 19 OR
- **Aufnahme:** detailgrad = "experte"
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Unterlassungs-/Gerichtsstandsklausel – Detailgrad «experte».

**Wortlaut:**

> Bei drohender oder erfolgter Verletzung kann die verletzte Partei Unterlassung und Beseitigung verlangen; die Geltendmachung weiteren Schadens bleibt vorbehalten. Ausschliesslicher Gerichtsstand ist der Sitz der offenlegenden Partei, soweit nicht zwingende Gerichtsstände entgegenstehen.

### 10. `NDA09_schluss` — «Schlussbestimmungen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 19 OR
- **Aufnahme:** immer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Schriftform, salvatorische Klausel, Ausfertigung und Rechtswahl – immer enthalten.

**Wortlaut:**

> Änderungen und Ergänzungen dieser Vereinbarung bedürfen der Schriftform. Sollte eine Bestimmung unwirksam sein, bleibt die Vereinbarung im Übrigen gültig; an die Stelle der unwirksamen Bestimmung tritt eine gültige, die ihrem Zweck möglichst nahekommt. Diese Vereinbarung wird in zwei Exemplaren ausgefertigt; jede Partei erhält ein unterzeichnetes Exemplar. Es gilt schweizerisches Recht.

### 11. `NDA10_unterschriften`

- [ ] **abgenommen** (David)
- **Norm:** Art. 19 OR
- **Aufnahme:** immer
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Ort, Datum und beidseitige Unterschriften – dienen dem Beweis (formfreier Vertrag).

**Wortlaut:**

> {{ort}}, {{datumFmt}}
>
>
> {{rolleA}}:
>
> ___________________________
> {{parteiAName}}
>
>
> {{rolleB}}:
>
> ___________________________
> {{parteiBName}}

---

**Summe:** 11 Bausteine in 1 Schemas.
