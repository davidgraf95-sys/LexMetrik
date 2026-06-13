# Abnahme-Dossier: Testament — alle Bausteine Wort für Wort

**Zweck:** Wort-für-Wort-Abnahme durch David (fachkundige Person, CLAUDE.md §7).
Je Baustein eine Abhak-Zeile.

**Quelle:** `src/lib/vorlagen/testament.ts (TESTAMENT_SCHEMA)`. **Generiert:**
`npx vite-node scripts/abnahme-dossiers.ts` — nach Engine-Änderungen NEU
laufen lassen; das Dossier ist eine Ableitung, keine zweite Pflege-Stelle (§5).

**Lesehilfe:** «Aufnahme: immer» = Baustein steht in jedem Dokument; sonst die
lesbare `includeIf`-Bedingung über die Antwort-Felder. «wiederholt über» =
ein Absatz je Listeneintrag ({{item.…}}-Platzhalter). {{platzhalter}} werden
beim Erzeugen interpoliert; Fragment-Felder (…Satz/…Zeile) verschwinden leer
ersatzlos.


---

## Letztwillige Verfügung (Testament)

Schema `testament-eigenhaendig` · Version 1.0.0 (Rechtsstand 1.1.2023, AS 2021 312) · Format verfuegung · Ausgabe abschrift

> **Disclaimer (Fusszeile):** Entwurf – erstellt mit LexMetrik. Keine Rechtsberatung. Nur die vollständig eigenhändig (von Hand) geschriebene, datierte und unterschriebene Fassung ist gültig (Art. 505 Abs. 1 ZGB).


### 1. `C01_titel`

- [ ] **abgenommen** (David)
- **Norm:** Art. 505 ZGB
- **Aufnahme:** immer
- **Begründung (Protokoll):** Selbstidentifikation des Erblassers/der Erblasserin – immer enthalten.

**Wortlaut:**

> Ich, {{vorname}} {{nachname}}, geboren am {{geburtsdatum}}, von {{heimatort}}, wohnhaft {{adresse}}, errichte hiermit die folgende letztwillige Verfügung:

### 2. `C02_widerruf`

- [ ] **abgenommen** (David)
- **Norm:** Art. 509, 511 ZGB
- **Aufnahme:** widerruf = true
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Aufgenommen, weil «frühere Verfügungen widerrufen» gewählt wurde.

**Wortlaut:**

> Ich widerrufe hiermit sämtliche früheren letztwilligen Verfügungen.

### 3. `C03_erbeinsetzung` — «Erbeinsetzung»

- [ ] **abgenommen** (David)
- **Norm:** Art. 483 ZGB
- **Aufnahme:** erben nicht leer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Aufgenommen, weil mindestens eine Erbin/ein Erbe erfasst wurde.

**Wortlaut:**

> Als meine Erbinnen und Erben setze ich ein:

### 4. `C03b_erbenliste`

- [ ] **abgenommen** (David)
- **Norm:** Art. 483 ZGB
- **Aufnahme:** erben nicht leer
- **Wiederholt über:** `erben` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Je erfasste Erbin/erfasster Erbe eine Zeile mit Quote.

**Wortlaut:**

> – {{item.name}} ({{item.angaben}}), zu einer Quote von {{item.quoteProzent}} % meines Nachlasses;

### 5. `C05_ersatz_erben`

- [ ] **abgenommen** (David)
- **Norm:** Art. 487 ZGB
- **Aufnahme:** erbenMitErsatz nicht leer
- **Wiederholt über:** `erbenMitErsatz` (ein Absatz je Eintrag)
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Aufgenommen, weil für Erben eine Ersatzperson bezeichnet wurde.

**Wortlaut:**

> Sollte {{item.name}} den Erbfall nicht erleben oder die Erbschaft ausschlagen, so tritt an ihre/seine Stelle: {{item.ersatz}}.

### 6. `C04_vermaechtnis` — «Vermächtnisse»

- [ ] **abgenommen** (David)
- **Norm:** Art. 484 ZGB
- **Aufnahme:** vermaechtnisse nicht leer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Aufgenommen, weil mindestens ein Vermächtnis erfasst wurde.

**Wortlaut:**

> Ich richte – ohne Erbeinsetzung – folgende Vermächtnisse aus:

### 7. `C04b_vermaechtnisliste`

- [ ] **abgenommen** (David)
- **Norm:** Art. 484 ZGB
- **Aufnahme:** vermaechtnisse nicht leer
- **Wiederholt über:** `vermaechtnisse` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Je erfasstes Vermächtnis eine Zeile.

**Wortlaut:**

> – {{item.empfaenger}} erhält: {{item.gegenstand}};

### 8. `C05_ersatz_vermaechtnis`

- [ ] **abgenommen** (David)
- **Norm:** Art. 487 ZGB
- **Aufnahme:** vermaechtnisseMitErsatz nicht leer
- **Wiederholt über:** `vermaechtnisseMitErsatz` (ein Absatz je Eintrag)
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Aufgenommen, weil für Vermächtnisse eine Ersatzperson bezeichnet wurde.

**Wortlaut:**

> Sollte {{item.empfaenger}} das Vermächtnis nicht erwerben können oder es ausschlagen, so fällt es an: {{item.ersatz}}.

### 9. `C09_willensvollstrecker` — «Willensvollstreckung»

- [ ] **abgenommen** (David)
- **Norm:** Art. 517 f. ZGB
- **Aufnahme:** willensvollstrecker nicht leer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Aufgenommen, weil eine Willensvollstreckerin/ein Willensvollstrecker bezeichnet wurde.

**Wortlaut:**

> Als Willensvollstrecker/in setze ich ein: {{willensvollstrecker}}.

### 10. `C09b_wv_ersatz`

- [ ] **abgenommen** (David)
- **Norm:** Art. 517 f. ZGB
- **Aufnahme:** willensvollstreckerErsatz nicht leer
- **Begründung (Protokoll):** Aufgenommen, weil eine Ersatzperson für die Willensvollstreckung bezeichnet wurde.

**Wortlaut:**

> Kann oder will diese Person das Amt nicht übernehmen, setze ich als Ersatz-Willensvollstrecker/in ein: {{willensvollstreckerErsatz}}.

### 11. `C12_schlussformel`

- [ ] **abgenommen** (David)
- **Norm:** Art. 505 Abs. 1 ZGB
- **Aufnahme:** immer
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Schlussformel mit Datum (Jahr/Monat/Tag) und Unterschriftszeile am Schluss – immer enthalten.
- **Hinweis (offengelegt):** Ob das Datum selbst eigenhändig geschrieben sein muss (kein Stempel/Vordruck), ist in der Lehre umstritten – sicherheitshalber auch das Datum von Hand schreiben.

**Wortlaut:**

> {{ortDatumZeile}}
>
>
> _________________________________
> (eigenhändige Unterschrift: {{vorname}} {{nachname}})

---

**Summe:** 11 Bausteine in 1 Schemas.
