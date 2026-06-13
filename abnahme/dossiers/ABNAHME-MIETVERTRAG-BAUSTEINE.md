# Abnahme-Dossier: Mietvertrag — alle Bausteine Wort für Wort

**Zweck:** Wort-für-Wort-Abnahme durch David (fachkundige Person, CLAUDE.md §7).
Je Baustein eine Abhak-Zeile.

**Quelle:** `src/lib/vorlagen/mietvertrag.ts (MV_SCHEMA)`. **Generiert:**
`npx vite-node scripts/abnahme-dossiers.ts` — nach Engine-Änderungen NEU
laufen lassen; das Dossier ist eine Ableitung, keine zweite Pflege-Stelle (§5).

**Lesehilfe:** «Aufnahme: immer» = Baustein steht in jedem Dokument; sonst die
lesbare `includeIf`-Bedingung über die Antwort-Felder. «wiederholt über» =
ein Absatz je Listeneintrag ({{item.…}}-Platzhalter). {{platzhalter}} werden
beim Erzeugen interpoliert; Fragment-Felder (…Satz/…Zeile) verschwinden leer
ersatzlos.


---

## Mietvertrag

Schema `mietvertrag` · Version 1.2.0 (Rechtsstand OR Art. 253 ff./VMWG; + Untermiete 6.6.2026: Art. 262 GELTENDE Fassung – Revision in der Volksabstimmung 24.11.2024 abgelehnt) · Format vertrag · Ausgabe fertig

> **Disclaimer (Fusszeile):** Entwurf – erstellt mit LexMetrik. Keine Rechtsberatung. Der Mietvertrag ist formfrei gültig; Index- und Staffelmiete bedürfen der Schriftform – die beidseitige Unterzeichnung erfüllt sie. Kantonale Formularpflichten für den Anfangsmietzins (Art. 270 Abs. 2 OR) sind zusätzlich zu beachten; massgeblich sind Gesetz (OR/VMWG) und der konkrete Einzelfall.


### 1. `M01_parteien`

- [ ] **abgenommen** (David)
- **Norm:** Art. 253 OR
- **Aufnahme:** immer
- **Layout-Rolle:** parteien
- **Begründung (Protokoll):** Bezeichnung der Vertragsparteien – immer enthalten.

**Wortlaut:**

> zwischen
>
> {{vermieterBlock}}
> (Vermieter)
>
> und
>
> {{mieterBlock}}
> (Mieter)

### 2. `U01_praeambel` — «Untermietverhältnis»

- [ ] **abgenommen** (David)
- **Norm:** Art. 262 OR
- **Aufnahme:** istUntermiete = true
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Präambel mit Hauptmietvertrag-Referenz – verankert das Untermietverhältnis und die Vergleichsgrösse für Art. 262 Abs. 2 lit. b.

**Wortlaut:**

> Der Untervermieter ist Hauptmieter der Mietsache gemäss Hauptmietvertrag mit {{hmVermieterName}} (Hauptvermieter){{hmDatumSatz}}{{hmMietzinsSatz}}. Mit diesem Vertrag vermietet er die Mietsache {{untermieteUmfangWort}} unter (Art. 262 OR).{{mehrleistungSatz}}

### 3. `U02_zustimmung` — «Zustimmung des Hauptvermieters»

- [ ] **abgenommen** (David)
- **Norm:** Art. 262 Abs. 1 OR
- **Aufnahme:** zustimmungVorhanden = true
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Zustimmungs-Klausel – nur wenn die Zustimmung erteilt ist (sonst greift die Gate-Warnung G-Z).

**Wortlaut:**

> Der Hauptvermieter hat der Untervermietung zugestimmt{{zustimmungDatumSatz}} (Art. 262 Abs. 1 OR). Die Zustimmung ist formfrei gültig; ihre schriftliche Festhaltung dient dem Beweis.

### 4. `M02_objekt` — «Mietobjekt»

- [ ] **abgenommen** (David)
- **Norm:** Art. 253 OR
- **Aufnahme:** immer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Mietobjekt mit Beschrieb, Nebenräumen und Zweck – immer enthalten.

**Wortlaut:**

> Vermietet wird: {{objektBeschrieb}}, {{objektAdresse}}.{{untermieteTeilSatz}}{{nebenraeumeSatz}}{{zweckSatz}} Der Zustand des Mietobjekts wird bei der Übergabe in einem gemeinsamen Protokoll festgehalten.

### 5. `M03_beginn_unbefristet` — «Mietbeginn und Dauer»

- [ ] **abgenommen** (David)
- **Norm:** Art. 255 OR
- **Aufnahme:** befristet = false
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Unbefristetes Mietverhältnis.

**Wortlaut:**

> Das Mietverhältnis beginnt am {{beginnFmt}} und läuft auf unbestimmte Zeit.{{mindestdauerSatz}}

### 6. `M03_beginn_befristet` — «Mietbeginn und Dauer»

- [ ] **abgenommen** (David)
- **Norm:** Art. 255 OR
- **Aufnahme:** befristet = true
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Befristetes Mietverhältnis (endet ohne Kündigung; stillschweigende Fortsetzung → unbefristet).

**Wortlaut:**

> Das Mietverhältnis beginnt am {{beginnFmt}} und endet am {{befristetBisFmt}}, ohne dass es einer Kündigung bedarf. Wird es danach stillschweigend fortgesetzt, gilt es als unbefristetes Mietverhältnis.

### 7. `M04_mietzins` — «Mietzins und Nebenkosten»

- [ ] **abgenommen** (David)
- **Norm:** Art. 257 OR
- **Aufnahme:** immer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Nettomietzins, Nebenkosten-Modus und Referenzzins-Basis (Grundlage künftiger Anpassungen) – immer enthalten.

**Wortlaut:**

> Der monatliche Nettomietzins beträgt CHF {{nettoFmt}}.{{nkSatz}} Mietzins und Nebenkosten sind monatlich im Voraus, jeweils auf den Ersten des Monats, zu bezahlen.{{refZinsSatz}}

### 8. `M04b_nkliste`

- [ ] **abgenommen** (David)
- **Norm:** Art. 257a OR
- **Aufnahme:** nkListe nicht leer
- **Wiederholt über:** `nkListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Nebenkosten-Positionen einzeln aufgeführt (Pauschalverweis genügt nicht).

**Wortlaut:**

> – {{item.label}}

### 9. `M05_index` — «Indexmiete»

- [ ] **abgenommen** (David)
- **Norm:** Art. 269b OR
- **Aufnahme:** mietzinsModell = "index"
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Indexmiete (Schriftform durch diesen Vertrag erfüllt; nur LIK).
- **Hinweis (offengelegt):** Nur gültig bei Vertragsdauer von mindestens fünf Jahren; Mischklauseln sind unzulässig.

**Wortlaut:**

> Der Nettomietzins ist an den Landesindex der Konsumentenpreise (LIK) gebunden; Basis ist der Indexstand von {{indexBasisMonat}}{{indexBasisPunkteSatz}}. Eine Anpassung kann höchstens im Umfang der Veränderung des Indexes verlangt werden und ist mit einer Frist von 30 Tagen auf einen Monatsanfang anzukündigen (Art. 17 VMWG). Diese Vereinbarung setzt die feste Vertragsdauer von mindestens fünf Jahren gemäss Ziffer «Mietbeginn und Dauer» voraus; andere Anpassungsgründe sind während der Indexbindung ausgeschlossen.

### 10. `M05_staffel` — «Staffelmiete»

- [ ] **abgenommen** (David)
- **Norm:** Art. 269c OR
- **Aufnahme:** mietzinsModell = "staffel"
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Staffelmiete (Schriftform durch diesen Vertrag erfüllt).
- **Hinweis (offengelegt):** Nur gültig bei Vertragsdauer von mindestens drei Jahren; während der Staffelung keine anderen Anpassungen.

**Wortlaut:**

> Der Nettomietzins erhöht sich wie folgt (höchstens einmal jährlich, Beträge in Franken):

### 11. `M05b_staffelliste`

- [ ] **abgenommen** (David)
- **Norm:** Art. 269c OR
- **Aufnahme:** staffelListe nicht leer
- **Wiederholt über:** `staffelListe` (ein Absatz je Eintrag)
- **Begründung (Protokoll):** Je Staffel eine Zeile (Datum + Frankenbetrag).

**Wortlaut:**

> – ab {{item.abFmt}}: Erhöhung um CHF {{item.erhoehungFmt}} pro Monat

### 12. `M06_kaution` — «Sicherheitsleistung»

- [ ] **abgenommen** (David)
- **Norm:** Art. 257e OR
- **Aufnahme:** kautionZeigen = true
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Kaution mit zwingender Hinterlegung auf Mietername und Rückgaberegel.

**Wortlaut:**

> Der Mieter leistet eine Sicherheit von CHF {{kautionFmt}}{{kautionMonateSatz}}. Der Vermieter hinterlegt die Sicherheit bei einer Bank auf einem Sparkonto oder Depot, das auf den Namen des Mieters lautet. Macht der Vermieter innert eines Jahres nach Beendigung des Mietverhältnisses keinen Anspruch gegenüber dem Mieter geltend, kann dieser die Rückerstattung verlangen.

### 13. `M06b_zahlungsverzug` — «Zahlungsverzug»

- [ ] **abgenommen** (David)
- **Norm:** Art. 257d OR
- **Aufnahme:** immer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Zahlungsverzugs-Folge (deklaratorisch; Art. 257d OR) – immer enthalten.

**Wortlaut:**

> Ist der Mieter mit der Zahlung von Mietzins oder Nebenkosten im Rückstand, kann ihm der Vermieter schriftlich eine Zahlungsfrist von mindestens 30 Tagen setzen und ihm für den Fall der Nichtzahlung die Kündigung androhen; bezahlt der Mieter innert Frist nicht, kann der Vermieter mit einer Frist von mindestens 30 Tagen auf das Ende eines Monats kündigen. Bei einer Familienwohnung sind Fristansetzung und Androhung dem Ehegatten bzw. der eingetragenen Partnerin/dem eingetragenen Partner separat zuzustellen.

### 14. `M07_unterhalt` — «Unterhalt und Mängel»

- [ ] **abgenommen** (David)
- **Norm:** Art. 256 OR
- **Aufnahme:** immer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Erhaltungspflicht (relativ zwingend) und kleiner Unterhalt in den gesetzlichen Schranken – immer enthalten.

**Wortlaut:**

> Der Vermieter erhält das Mietobjekt in einem zum vorausgesetzten Gebrauch tauglichen Zustand. Der Mieter trägt den kleinen Unterhalt, d. h. Reinigungen und Ausbesserungen, die für den gewöhnlichen Gebrauch erforderlich sind und die er ohne besonderen Aufwand selbst vornehmen kann. Mängel sind dem Vermieter unverzüglich zu melden; die gesetzlichen Mängelrechte des Mieters bleiben vorbehalten.

### 15. `M08_gebrauch` — «Gebrauch, Untermiete und bauliche Änderungen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 262 OR
- **Aufnahme:** immer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Sorgfaltspflicht, Untermiete (gesetzliche Verweigerungsgründe) und Art. 260a – immer enthalten.

**Wortlaut:**

> Der Mieter gebraucht das Mietobjekt sorgfältig und nimmt Rücksicht auf Hausbewohner und Nachbarn.{{untermieteSatz}} Erneuerungen und Änderungen am Mietobjekt durch den Mieter bedürfen der schriftlichen Zustimmung des Vermieters; hat der Vermieter zugestimmt, kann er die Wiederherstellung des früheren Zustands nur verlangen, wenn dies schriftlich vereinbart wurde. Weist das Mietobjekt bei Mietende dank solcher Arbeiten einen erheblichen Mehrwert auf, kann der Mieter dafür eine entsprechende Entschädigung verlangen (Art. 260a Abs. 3 OR).{{tierhaltungSatz}}{{hausordnungSatz}}

### 16. `U03_gebrauch_haftung` — «Gebrauchsumfang und Haftung gegenüber dem Hauptvermieter»

- [ ] **abgenommen** (David)
- **Norm:** Art. 262 Abs. 3 OR
- **Aufnahme:** istUntermiete = true
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Gebrauchskopplung an den Hauptmietvertrag und Haftungskette nach Art. 262 Abs. 3 – bei Untermiete immer enthalten.

**Wortlaut:**

> Der Untermieter darf die Mietsache nur in dem Umfang gebrauchen, der dem Untervermieter nach dem Hauptmietvertrag gestattet ist. Der Untervermieter haftet dem Hauptvermieter dafür, dass der Untermieter die Sache nicht anders gebraucht, als es ihm selbst gestattet ist; der Hauptvermieter kann den Untermieter unmittelbar dazu anhalten (Art. 262 Abs. 3 OR). Eine Weitervermietung durch den Untermieter bedarf der Zustimmung des Untervermieters.

### 17. `U04_endigung_hauptmiete` — «Hinweis: Ende des Hauptmietvertrags»

- [ ] **abgenommen** (David)
- **Norm:** Art. 262 OR
- **Aufnahme:** istUntermiete = true
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Endigungs-Kopplung als WARN-Baustein – rechtlich keine automatische Auflösung (bewusst keine auflösende Bedingung, Dossier §1.4).

**Wortlaut:**

> Die Parteien nehmen zur Kenntnis: Endet der Hauptmietvertrag, kann der Untervermieter dem Untermieter den weiteren Gebrauch nicht mehr verschaffen. Der Untermieter hat keinen Anspruch, in den Hauptmietvertrag einzutreten, und keinen Erstreckungsanspruch gegen den Hauptvermieter. Dieser Untermietvertrag endet dadurch jedoch nicht automatisch; er ist eigenständig form- und fristgerecht zu kündigen (Art. 266a ff. OR). Der Untervermieter kann gegenüber dem Untermieter schadenersatzpflichtig werden.

### 18. `M09_versicherung` — «Versicherung»

- [ ] **abgenommen** (David)
- **Norm:** Art. 257f OR
- **Aufnahme:** versicherungspflicht = true
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Haftpflichtversicherung des Mieters (übliche Klausel).

**Wortlaut:**

> {{versicherungText}}

### 19. `M10_mwst` — «Mehrwertsteuer»

- [ ] **abgenommen** (David)
- **Norm:** Art. 22 MWSTG
- **Aufnahme:** mwstZeigen = true
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** MWST-Option (nur Geschäftsraum; bei reiner Wohnnutzung ausgeschlossen).

**Wortlaut:**

> Der Vermieter optiert für die Versteuerung der Mietzinseinnahmen (Art. 22 MWSTG). Der Mieter schuldet zusätzlich zum Mietzins und zu den Nebenkosten die gesetzliche Mehrwertsteuer zum jeweils geltenden Satz (zurzeit {{mwstSatz}} %); Satzänderungen berechtigen zur entsprechenden Anpassung.

### 20. `M11_konkurrenzschutz` — «Konkurrenzschutz»

- [ ] **abgenommen** (David)
- **Norm:** Art. 253 OR
- **Aufnahme:** konkurrenzschutzZeigen = true
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Konkurrenzschutz ist nicht vertragsimmanent – ausdrücklich vereinbart und umschrieben.
- **Hinweis (offengelegt):** Gesetzlich nicht spezifisch geregelt; Reichweite vor Verwendung anwaltlich prüfen.

**Wortlaut:**

> Der Vermieter verpflichtet sich, in der gleichen Liegenschaft keine Räume an direkte Konkurrenten des Mieters im folgenden Bereich zu vermieten: {{konkurrenzschutzText}}.{{ksStrafeSatz}}

### 21. `M12_kuendigung` — «Kündigung»

- [ ] **abgenommen** (David)
- **Norm:** Art. 266l OR
- **Aufnahme:** befristet = false
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Kündigungsfristen/-termine und zwingende Formvorschriften (Art. 266l–266o OR).

**Wortlaut:**

> {{kuendigungText}} Die Kündigung bedarf der Schriftform; der Vermieter kündigt mit dem vom Kanton genehmigten amtlichen Formular, sonst ist die Kündigung nichtig.{{familienwohnungSatz}} Vorbehalten bleiben die ausserordentlichen Kündigungsgründe des Gesetzes.

### 22. `M13_rueckgabe` — «Rückgabe»

- [ ] **abgenommen** (David)
- **Norm:** Art. 267 OR
- **Aufnahme:** immer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Rückgabe und sofortige Prüf-/Rügeobliegenheit des Vermieters – immer enthalten.

**Wortlaut:**

> Bei Beendigung des Mietverhältnisses gibt der Mieter das Mietobjekt in dem Zustand zurück, der sich aus vertragsgemässem Gebrauch ergibt. Über die Rückgabe wird ein gemeinsames Protokoll erstellt; der Vermieter prüft den Zustand sofort und meldet Mängel, für die der Mieter einzustehen hat, umgehend.

### 23. `M14_schluss` — «Schlussbestimmungen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 274 OR
- **Aufnahme:** immer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Schriftformvorbehalt, Schlichtung am Ort der Sache, Gesetzesverweis – immer enthalten.

**Wortlaut:**

> Änderungen und Ergänzungen dieses Vertrags bedürfen der Schriftform, soweit das Gesetz nichts anderes zulässt. Dieser Vertrag wird in zwei Exemplaren ausgefertigt; jede Partei erhält ein unterzeichnetes Exemplar. Streitigkeiten aus diesem Vertrag werden zunächst der Schlichtungsbehörde am Ort des Mietobjekts unterbreitet. Im Übrigen gelten die Bestimmungen des Obligationenrechts (Art. 253 ff. OR) und der VMWG.

### 24. `M15_unterschriften`

- [ ] **abgenommen** (David)
- **Norm:** Art. 255 OR
- **Aufnahme:** immer
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Ort, Datum und Unterschriften – erfüllt die Schriftform der formbedürftigen Klauseln.

**Wortlaut:**

> {{ort}}, {{datumFmt}}
>
>
> Der Vermieter:
>
> ___________________________
> {{vermieterName}}
>
>
> Der Mieter / Die Mieter:
>
> ___________________________
> {{mieterUnterschrift}}{{zweiteUnterschriftSatz}}

---

**Summe:** 24 Bausteine in 1 Schemas.
