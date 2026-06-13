# Abnahme-Dossier: Arbeitsvertrag — alle Bausteine Wort für Wort

**Zweck:** Wort-für-Wort-Abnahme durch David (fachkundige Person, CLAUDE.md §7).
Je Baustein eine Abhak-Zeile.

**Quelle:** `src/lib/vorlagen/arbeitsvertrag.ts (AV_SCHEMA)`. **Generiert:**
`npx vite-node scripts/abnahme-dossiers.ts` — nach Engine-Änderungen NEU
laufen lassen; das Dossier ist eine Ableitung, keine zweite Pflege-Stelle (§5).

**Lesehilfe:** «Aufnahme: immer» = Baustein steht in jedem Dokument; sonst die
lesbare `includeIf`-Bedingung über die Antwort-Felder. «wiederholt über» =
ein Absatz je Listeneintrag ({{item.…}}-Platzhalter). {{platzhalter}} werden
beim Erzeugen interpoliert; Fragment-Felder (…Satz/…Zeile) verschwinden leer
ersatzlos.


---

## Einzelarbeitsvertrag

Schema `arbeitsvertrag` · Version 1.1.0 (Rechtsstand OR Art. 319 ff.; Vertiefungs-Gutachten 5.6.2026: Karenzentschädigung, KTG-Gleichwertigkeit, GAV-Typen, Probezeit bei Befristung) · Format vertrag · Ausgabe fertig

> **Disclaimer (Fusszeile):** Entwurf – erstellt mit LexMetrik. Keine Rechtsberatung. Der Arbeitsvertrag ist formfrei gültig (Art. 320 OR); einzelne Klauseln (Konkurrenzverbot, Überstunden-Wegbedingung, abweichende Kündigungsfristen, Probezeit-Verlängerung, Pauschalspesen) bedürfen der Schriftform – die beidseitige Unterzeichnung dieses Vertrags erfüllt sie. Anwendbare GAV/NAV und kantonale Mindestlöhne gehen vor und sind gesondert zu prüfen.


### 1. `A01_parteien`

- [ ] **abgenommen** (David)
- **Norm:** Art. 319 OR
- **Aufnahme:** immer
- **Layout-Rolle:** parteien
- **Begründung (Protokoll):** Bezeichnung der Vertragsparteien – immer enthalten.

**Wortlaut:**

> zwischen
>
> {{arbeitgeberBlock}}
> (nachfolgend «Arbeitgeber»)
>
> und
>
> {{arbeitnehmerBlock}}
> (nachfolgend «Arbeitnehmer/in»)

### 2. `A02_funktion` — «Funktion und Stellenantritt»

- [ ] **abgenommen** (David)
- **Norm:** Art. 319 OR
- **Aufnahme:** immer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Funktion und Beginn – immer enthalten (zugleich Information nach Art. 330b OR).

**Wortlaut:**

> Der/Die Arbeitnehmer/in wird als {{funktion}} angestellt. Das Arbeitsverhältnis beginnt am {{beginnFmt}}.{{befristungSatz}}

### 3. `A03_arbeitsort` — «Arbeitsort, Pensum und Arbeitszeit»

- [ ] **abgenommen** (David)
- **Norm:** Art. 9 ArG
- **Aufnahme:** immer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Arbeitsort, Pensum und Wochenarbeitszeit – immer enthalten.

**Wortlaut:**

> Arbeitsort ist {{arbeitsort}}. Das Pensum beträgt {{pensumProzent}} % ({{wochenstundenEffektiv}} Stunden pro Woche). Beginn und Ende der täglichen Arbeitszeit richten sich nach den betrieblichen Anordnungen; die zwingenden Schranken des Arbeitsgesetzes (Höchstarbeitszeit, Ruhezeiten, Arbeitszeiterfassung) bleiben vorbehalten.

### 4. `A04_probezeit_gesetzlich` — «Probezeit»

- [ ] **abgenommen** (David)
- **Norm:** Art. 335b OR
- **Aufnahme:** probezeitVariante = "gesetzlich"
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Gesetzliche Probezeit gewählt.

**Wortlaut:**

> Es gilt die gesetzliche Probezeit von einem Monat. Während der Probezeit kann das Arbeitsverhältnis beidseits mit einer Frist von sieben Tagen auf jeden Tag gekündigt werden.

### 5. `A04_probezeit_verlaengert` — «Probezeit»

- [ ] **abgenommen** (David)
- **Norm:** Art. 335b OR
- **Aufnahme:** probezeitVariante = "verlaengert"
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Verlängerte Probezeit (höchstens drei Monate) – Schriftform durch diesen Vertrag erfüllt.
- **Hinweis (offengelegt):** Nachzuholen sind die effektiv versäumten Arbeitstage (BGE 148 III 126).

**Wortlaut:**

> Die Probezeit wird auf {{probezeitMonate}} Monate verlängert (schriftliche Abrede). Während der Probezeit kann das Arbeitsverhältnis beidseits mit einer Frist von sieben Tagen auf jeden Tag gekündigt werden. Bei effektiver Verkürzung der Probezeit infolge Krankheit, Unfall oder Erfüllung einer nicht freiwillig übernommenen gesetzlichen Pflicht verlängert sie sich entsprechend.

### 6. `A04_probezeit_weg` — «Probezeit»

- [ ] **abgenommen** (David)
- **Norm:** Art. 335b OR
- **Aufnahme:** probezeitVariante = "wegbedungen"
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Probezeit wegbedungen (zulässig).

**Wortlaut:**

> Auf eine Probezeit wird verzichtet.

### 7. `A04_probezeit_befristet_vereinbart` — «Probezeit»

- [ ] **abgenommen** (David)
- **Norm:** Art. 335b OR
- **Aufnahme:** probezeitVariante = "befristet_vereinbart"
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Befristetes Verhältnis: Probezeit nur kraft ausdrücklicher Vereinbarung (Art. 335b Abs. 1 OR gilt nur unbefristet – Gutachten 5.6.2026); max. 3 Monate.

**Wortlaut:**

> Die Parteien VEREINBAREN eine Probezeit von {{probezeitMonateEff}} {{probezeitEinheit}} (bei befristeten Verhältnissen gilt die gesetzliche Probezeit-Vermutung nicht). Während der Probezeit kann das Arbeitsverhältnis beidseits mit einer Frist von sieben Tagen auf jeden Tag gekündigt werden. Bei effektiver Verkürzung der Probezeit infolge Krankheit, Unfall oder Erfüllung einer nicht freiwillig übernommenen gesetzlichen Pflicht verlängert sie sich entsprechend.

### 8. `A05_lohn_monat` — «Lohn»

- [ ] **abgenommen** (David)
- **Norm:** Art. 322 OR
- **Aufnahme:** lohnModell = "monatslohn"
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Monatslohn mit Fälligkeit Ende Monat (Art. 323 OR, absolut zwingend).

**Wortlaut:**

> Der Bruttolohn beträgt CHF {{lohnFmt}} pro Monat{{dreizehnterSatz}}. Die gesetzlichen und vertraglichen Abzüge (AHV/IV/EO, ALV, NBU, BVG, ggf. Quellensteuer) gehen zulasten des Arbeitnehmers/der Arbeitnehmerin. Der Lohn wird Ende jedes Monats ausgerichtet.

### 9. `A05_lohn_stunde` — «Lohn»

- [ ] **abgenommen** (David)
- **Norm:** Art. 322 OR
- **Aufnahme:** lohnModell = "stundenlohn"
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Stundenlohn mit Fälligkeit Ende Monat (Art. 323 OR, absolut zwingend).

**Wortlaut:**

> Der Bruttolohn beträgt CHF {{lohnFmt}} pro Stunde{{ferienzuschlagSatz}}{{dreizehnterSatz}}. Die gesetzlichen und vertraglichen Abzüge gehen zulasten des Arbeitnehmers/der Arbeitnehmerin. Der Lohn wird Ende jedes Monats für die geleisteten Stunden ausgerichtet.

### 10. `A05b_gratifikation`

- [ ] **abgenommen** (David)
- **Norm:** Art. 322d OR
- **Aufnahme:** gratifikation = true
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Freiwilligkeitsvorbehalt – ohne ihn kann die Gratifikation zum Anspruch erstarken.
- **Hinweis (offengelegt):** Trotz Vorbehalt kann langjährige vorbehaltlose Ausrichtung einen Anspruch begründen (BGE 129 III 276).

**Wortlaut:**

> Eine allfällige Gratifikation ist eine freiwillige Leistung des Arbeitgebers, auf die auch nach wiederholter Ausrichtung kein Anspruch besteht; über Ausrichtung und Höhe entscheidet der Arbeitgeber jedes Jahr neu und nach freiem Ermessen.

### 11. `A06_ueberstunden_gesetzlich` — «Überstunden»

- [ ] **abgenommen** (David)
- **Norm:** Art. 321c OR
- **Aufnahme:** ueberstunden = "gesetzlich"
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Gesetzliche Überstundenregelung.

**Wortlaut:**

> Überstunden, die notwendig sind und dem/der Arbeitnehmer/in zugemutet werden können, sind zu leisten. Sie werden mit Einverständnis des Arbeitnehmers/der Arbeitnehmerin durch Freizeit von gleicher Dauer ausgeglichen oder mit dem Lohn samt einem Zuschlag von 25 % vergütet.

### 12. `A06_ueberstunden_kompensation` — «Überstunden»

- [ ] **abgenommen** (David)
- **Norm:** Art. 321c OR
- **Aufnahme:** ueberstunden = "kompensation"
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Kompensationsmodell mit gesetzlicher Auffangregel.

**Wortlaut:**

> Überstunden, die notwendig sind und dem/der Arbeitnehmer/in zugemutet werden können, sind zu leisten. Sie werden grundsätzlich durch Freizeit von gleicher Dauer ausgeglichen; ist der Ausgleich nicht möglich, werden sie mit dem Lohn samt einem Zuschlag von 25 % vergütet.

### 13. `A06_ueberstunden_inbegriffen` — «Überstunden»

- [ ] **abgenommen** (David)
- **Norm:** Art. 321c OR
- **Aufnahme:** ueberstunden = "inbegriffen"
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Wegbedingung der Überstundenentschädigung – Schriftform durch diesen Vertrag erfüllt; ArG-Überzeit ausdrücklich vorbehalten.
- **Hinweis (offengelegt):** Gilt nur für OR-Überstunden; ArG-Überzeit (über 45/50 Wochenstunden) bleibt zwingend (Art. 12/13 ArG).

**Wortlaut:**

> Allfällige Überstunden sind mit dem vereinbarten Lohn abgegolten; Entschädigung und Zuschlag werden im Sinne von Art. 321c Abs. 3 OR schriftlich wegbedungen. Vorbehalten bleibt zwingend die Überzeit im Sinne des Arbeitsgesetzes (Arbeit über der wöchentlichen Höchstarbeitszeit), die nach Art. 13 ArG zu entschädigen oder durch Freizeit auszugleichen ist.

### 14. `A07_ferien` — «Ferien»

- [ ] **abgenommen** (David)
- **Norm:** Art. 329a OR
- **Aufnahme:** immer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Ferienanspruch (mindestens 4 bzw. 5 Wochen) inkl. Abgeltungsverbot – immer enthalten.

**Wortlaut:**

> Der Ferienanspruch beträgt {{ferienWochen}} Wochen pro Dienstjahr. Die Ferien werden vom Arbeitgeber unter Rücksicht auf die Wünsche des Arbeitnehmers/der Arbeitnehmerin festgelegt; wenigstens zwei Wochen müssen zusammenhängen. Während der Ferien ist der volle Lohn geschuldet; eine Abgeltung durch Geldleistungen während des Arbeitsverhältnisses ist ausgeschlossen.

### 15. `A08_lohnfortzahlung_gesetzlich` — «Lohnfortzahlung bei Verhinderung»

- [ ] **abgenommen** (David)
- **Norm:** Art. 324a OR
- **Aufnahme:** lohnfortzahlung = "gesetzlich"
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Gesetzliche Lohnfortzahlung.

**Wortlaut:**

> Wird der/die Arbeitnehmer/in ohne eigenes Verschulden an der Arbeitsleistung verhindert (Krankheit, Unfall, Erfüllung gesetzlicher Pflichten), richtet sich die Lohnfortzahlung nach Art. 324a OR (im ersten Dienstjahr drei Wochen, danach angemessen länger nach der anwendbaren Skala).

### 16. `A08_lohnfortzahlung_ktg` — «Lohnfortzahlung und Krankentaggeld»

- [ ] **abgenommen** (David)
- **Norm:** Art. 324a OR
- **Aufnahme:** lohnfortzahlung = "ktg"
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Versicherungslösung (mindestens gleichwertig) – Schriftform durch diesen Vertrag erfüllt.

**Wortlaut:**

> Der Arbeitgeber schliesst eine Krankentaggeldversicherung ab, deren Leistungen die Versicherung erbringt: bei krankheitsbedingter Arbeitsunfähigkeit Taggelder von {{ktgProzent}} % des Lohnes während {{ktgTage}} Tagen innert 900 Tagen.{{ktgWartefristSatz}} Vom Prämienaufwand trägt der/die Arbeitnehmer/in {{ktgPraemieAn}} %, der Arbeitgeber den Rest. Diese Lösung tritt im Sinne von Art. 324a Abs. 4 OR AN DIE STELLE der gesetzlichen Lohnfortzahlung; für nicht versicherte Fälle gilt Art. 324a OR.

### 17. `A09_spesen_effektiv` — «Spesen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 327a OR
- **Aufnahme:** spesen = "effektiv"
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Effektiver Auslagenersatz (zwingendes Minimum).

**Wortlaut:**

> Der Arbeitgeber ersetzt dem/der Arbeitnehmer/in alle durch die Ausführung der Arbeit notwendig entstehenden Auslagen gegen Beleg.

### 18. `A09_spesen_pauschal` — «Spesen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 327a OR
- **Aufnahme:** spesen = "pauschal"
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Pauschalspesen – Schriftform durch diesen Vertrag erfüllt; müssen alle notwendigen Auslagen decken.
- **Hinweis (offengelegt):** Eine Pauschale, die die notwendigen Auslagen nicht deckt, ist insoweit nichtig (Art. 327a Abs. 3 OR; BGE 131 III 439 – zu verifizieren).

**Wortlaut:**

> Die notwendigen Auslagen werden durch eine Pauschale von CHF {{spesenPauschaleFmt}} pro Monat abgegolten (schriftliche Abrede). Die Pauschale deckt sämtliche notwendigen Auslagen; weitergehende, durch sie nicht gedeckte notwendige Auslagen werden gegen Beleg ersetzt.

### 19. `A10_treuepflicht` — «Sorgfalts-, Treue- und Geheimhaltungspflicht»

- [ ] **abgenommen** (David)
- **Norm:** Art. 321a OR
- **Aufnahme:** immer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Treue- und Geheimhaltungspflicht – immer enthalten (deklaratorisch).

**Wortlaut:**

> Der/Die Arbeitnehmer/in führt die übertragene Arbeit sorgfältig aus und wahrt die berechtigten Interessen des Arbeitgebers. Über Tatsachen, die geheim zu halten sind (insbesondere Fabrikations- und Geschäftsgeheimnisse), bewahrt er/sie Stillschweigen – auch nach Beendigung des Arbeitsverhältnisses, soweit es zur Wahrung der berechtigten Interessen des Arbeitgebers erforderlich ist.

### 20. `A11_datenschutz` — «Datenschutz»

- [ ] **abgenommen** (David)
- **Norm:** Art. 328b OR
- **Aufnahme:** immer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Datenschutz im Arbeitsverhältnis – immer enthalten (deklaratorisch).

**Wortlaut:**

> Der Arbeitgeber bearbeitet Personendaten des Arbeitnehmers/der Arbeitnehmerin nur, soweit sie dessen/deren Eignung für das Arbeitsverhältnis betreffen oder zur Durchführung des Vertrags erforderlich sind; im Übrigen gelten die Grundsätze des Datenschutzgesetzes.

### 21. `A12_kuendigung_gesetzlich` — «Kündigung»

- [ ] **abgenommen** (David)
- **Norm:** Art. 335c OR
- **Aufnahme:** kuendigungZeigen = "gesetzlich"
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Gesetzliche Kündigungsfristen (Staffel nach Dienstjahren).

**Wortlaut:**

> Nach Ablauf der Probezeit kann das unbefristete Arbeitsverhältnis beidseits unter Einhaltung der gesetzlichen Fristen gekündigt werden: mit einem Monat im ersten, zwei Monaten im zweiten bis neunten und drei Monaten ab dem zehnten Dienstjahr, je auf das Ende eines Monats. Die Kündigung ist auf Verlangen schriftlich zu begründen. Vorbehalten bleiben der zwingende Kündigungsschutz (Sperrfristen) und die fristlose Auflösung aus wichtigem Grund.

### 22. `A12_kuendigung_abweichend` — «Kündigung»

- [ ] **abgenommen** (David)
- **Norm:** Art. 335c OR
- **Aufnahme:** kuendigungZeigen = "abweichend"
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Abweichende, paritätische Kündigungsfrist – Schriftform durch diesen Vertrag erfüllt.

**Wortlaut:**

> Nach Ablauf der Probezeit kann das unbefristete Arbeitsverhältnis beidseits mit einer Frist von {{kuendigungsfristMonate}} Monaten auf das Ende eines Monats gekündigt werden (schriftliche Abrede; für beide Parteien gleich). Die Kündigung ist auf Verlangen schriftlich zu begründen. Vorbehalten bleiben der zwingende Kündigungsschutz (Sperrfristen) und die fristlose Auflösung aus wichtigem Grund.

### 23. `A12_befristet_ende` — «Vertragsdauer»

- [ ] **abgenommen** (David)
- **Norm:** Art. 334 OR
- **Aufnahme:** kuendigungZeigen = "befristet"
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Befristung: Ende ohne Kündigung; stillschweigende Fortsetzung → unbefristet.

**Wortlaut:**

> Das Arbeitsverhältnis ist bis zum {{befristetBisFmt}} befristet und endet an diesem Tag ohne Kündigung. Wird es danach stillschweigend fortgesetzt, gilt es als unbefristetes Arbeitsverhältnis. Die fristlose Auflösung aus wichtigem Grund bleibt vorbehalten.

### 24. `A13_konkurrenzverbot` — «Konkurrenzverbot»

- [ ] **abgenommen** (David)
- **Norm:** Art. 340 OR
- **Aufnahme:** konkurrenzverbot = true
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Konkurrenzverbot, nach Ort/Zeit/Gegenstand begrenzt – Schriftform durch diesen Vertrag erfüllt.
- **Hinweis (offengelegt):** Voraussetzung ist Einblick in Kundenkreis oder Geheimnisse mit Schädigungspotenzial (Art. 340 Abs. 2 OR); übermässige Verbote kann das Gericht herabsetzen (Art. 340a Abs. 2 OR). BGE 145 III 365.

**Wortlaut:**

> Der/Die Arbeitnehmer/in verpflichtet sich, nach Beendigung des Arbeitsverhältnisses während {{kvDauerText}} im folgenden örtlichen Geltungsbereich: {{kvOrt}}, jede den Arbeitgeber konkurrenzierende Tätigkeit im folgenden Bereich zu unterlassen: {{kvGegenstand}}.{{kvStrafeSatz}}{{kvRealSatz}}{{kvKarenzSatz}} Das Verbot fällt dahin, wenn der Arbeitgeber nachweislich kein erhebliches Interesse mehr an seiner Aufrechterhaltung hat, sowie in den Fällen von Art. 340c Abs. 2 OR.

### 25. `A14_gav_ave` — «Gesamtarbeitsvertrag»

- [ ] **abgenommen** (David)
- **Norm:** Art. 357 OR
- **Aufnahme:** gavVariante = "ave"
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** AVE-GAV: Normwirkung kraft Allgemeinverbindlicherklärung (AVEG).

**Wortlaut:**

> Auf das Arbeitsverhältnis ist der folgende ALLGEMEINVERBINDLICH erklärte Gesamtarbeitsvertrag anwendbar: {{gavName}}. Dessen normative Bestimmungen gelten unmittelbar und zwingend; abweichende Abreden dieses Vertrags zuungunsten des Arbeitnehmers/der Arbeitnehmerin sind nichtig und werden durch die GAV-Bestimmungen ersetzt. Günstigere Abreden bleiben vorbehalten.

### 26. `A14_gav_mitglied` — «Gesamtarbeitsvertrag»

- [ ] **abgenommen** (David)
- **Norm:** Art. 357 OR
- **Aufnahme:** gavVariante = "mitgliedschaft"
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** GAV-Normwirkung kraft Verbandsmitgliedschaft (Art. 357 OR).

**Wortlaut:**

> Auf das Arbeitsverhältnis ist kraft beidseitiger Verbandszugehörigkeit der folgende Gesamtarbeitsvertrag anwendbar: {{gavName}}. Dessen normative Bestimmungen gelten unmittelbar und zwingend; abweichende Abreden dieses Vertrags zuungunsten des Arbeitnehmers/der Arbeitnehmerin sind nichtig und werden durch die GAV-Bestimmungen ersetzt. Günstigere Abreden bleiben vorbehalten.

### 27. `A14_gav_verweis` — «Gesamtarbeitsvertrag»

- [ ] **abgenommen** (David)
- **Norm:** Art. 356 OR
- **Aufnahme:** gavVariante = "verweis"
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Blosse vertragliche Verweisung – GAV-Inhalt wird Vertragsinhalt, keine Normwirkung (Gutachten 5.6.2026).

**Wortlaut:**

> Die Parteien vereinbaren, dass die Bestimmungen des folgenden Gesamtarbeitsvertrags als VERTRAGSINHALT gelten: {{gavName}}. (Hinweis: Diese Verweisung erzeugt keine zwingende Normwirkung im Sinne von Art. 357 OR.)

### 28. `A15_schluss` — «Schlussbestimmungen»

- [ ] **abgenommen** (David)
- **Norm:** Art. 320 OR
- **Aufnahme:** immer
- **Nummeriert** (fortlaufende Ziffer im Dokument)
- **Begründung (Protokoll):** Schriftformvorbehalt und Verweis auf das dispositive Gesetzesrecht – immer enthalten.

**Wortlaut:**

> Änderungen und Ergänzungen dieses Vertrags bedürfen zu ihrer Gültigkeit der Schriftform, soweit das Gesetz nichts anderes zulässt. Dieser Vertrag wird in zwei Exemplaren ausgefertigt; jede Partei erhält ein unterzeichnetes Exemplar. Im Übrigen gelten die Bestimmungen des Obligationenrechts (Art. 319 ff. OR) sowie die zwingenden Vorschriften des Arbeitsgesetzes.

### 29. `A16_unterschriften`

- [ ] **abgenommen** (David)
- **Norm:** Art. 320 OR
- **Aufnahme:** immer
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Ort, Datum und beidseitige Unterschriften – erfüllt die Schriftform der formbedürftigen Klauseln.

**Wortlaut:**

> {{ort}}, {{datumFmt}}
>
>
> Der Arbeitgeber:
>
> ___________________________
> {{arbeitgeberName}}
>
>
> Der/Die Arbeitnehmer/in:
>
> ___________________________
> {{arbeitnehmerKurz}}

---

**Summe:** 29 Bausteine in 1 Schemas.
