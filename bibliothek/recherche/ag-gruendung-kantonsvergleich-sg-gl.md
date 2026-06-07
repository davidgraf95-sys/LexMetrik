# AG-Gründung — Kantons-Quervergleich der Haus-Bausteine gegen SG und GL

Quervergleich der ZH-basierten Haus-Fassung (Statuten, Errichtungsakt,
Wahlannahme, Domizilannahme) gegen die amtlichen Vergleichsmuster der
Handelsregisterämter St. Gallen und Glarus. Zweck: Prüfen, ob die Haus-Bausteine
kantonsneutral tragen, und einzelne Befunde als Empfehlung für den Hauptstrang
festhalten. **Engine nicht geändert** — dies ist eine Erstrecherche.

## 1 Quelle + Stand

| Kürzel | Dokument (Dateiname in /tmp/muster bzw. bibliothek/muster) | Herkunft |
|---|---|---|
| GL-kurz | `gl-ag-statuten-kurz.txt` | HR-Amt Glarus, Musterstatuten AG Kurzfassung |
| GL-lang | `gl-ag-statuten-lang.txt` | HR-Amt Glarus, Musterstatuten AG Langfassung |
| SG-vink | `sg-ag-kurzversion-vinkulierung.txt` | HR-Amt St. Gallen, Musterstatuten AG Kurzversion mit Vinkulierung |
| SG-lang | `sg-ag-langversion.txt` | HR-Amt St. Gallen, Musterstatuten AG Langversion |
| SG-min | `sg-ag-minimalversion.txt` | HR-Amt St. Gallen, Musterstatuten AG Minimalversion |
| SG-EA | `div-sg-errichtungsakt-ag-gruendung.txt` | Urkundsperson Kanton St. Gallen, Errichtungsakt AG |
| SG-ZS | `div-sg-zeichnungsschein-ag-gruendung.txt` | Kanton St. Gallen, Zeichnungsschein mit Vollmacht (Gründung) |
| SG-WA | `div-sg-wahlannahmeerklaerung.txt` | Kanton St. Gallen, Wahlannahmeerklärung |
| SG-DH | `div-sg-domizilhaltererklaerung.txt` | Kanton St. Gallen, Domizilhalterbestätigung |

Haus-Bausteine: `src/lib/vorlagen/gruendungAgDokumente.ts` (Schemas
`ag-statuten`, `ag-errichtungsakt`, `ag-wahlannahme`, `ag-domizilannahme`),
lesbar im generierten `ABNAHME-AG-BAUSTEINE.md` (Repo-Root, 185 Bausteine). Die
Haus-Fassung ist ZH-basiert (`.scratch/ag-knowledge/`, Vorlagen-Stand 26.7.2024;
Norm-Kerne am OR-Cache 1.1.2026).

**Abrufdatum der SG-/GL-Muster:** siehe Commit-Historie der Muster-Dateien in
`bibliothek/muster/MANIFEST` bzw. der /tmp-Archivierung (7.6.2026). Die Muster
sind keine konsolidierten Erlasse, sondern Behörden-Vorlagen ohne datierten
Rechtsstand; massgeblich bleibt der OR-Stand 1.1.2026.

## 2 Befunde

Halbgeviertstrich «–». Einordnung: **U** = kantonsspezifische Usanz (kein
Pflegebedarf), **I** = inhaltliche Differenz (zu prüfen), **S** = Haus-Fassung
schärfbar (kantonsneutrale Präzisierung möglich).

### Statuten

| Nr. | Gegenstand | Haus-Wortlaut (Baustein) | SG/GL-Wortlaut (verbatim) | Einordnung | Empfehlung |
|---|---|---|---|---|---|
| B1 | Firma/Sitz (Pflicht 626 I Ziff. 1) | «Unter der Firma {{firma}} besteht mit Sitz in {{sitz}} auf unbestimmte Dauer eine Aktiengesellschaft gemäss Art. 620 ff. OR.» (`AS01_firma_sitz`) | GL-kurz/SG-vink wortgleich; SG nennt zusätzlich den Kanton: «besteht mit Sitz in [politische Gemeinde], **Kanton St. Gallen**, … » | U | nichts tun — der Kanton steckt in der Haus-Variable `{{sitz}}`; SG-Festschreibung ist eine Kantons-Usanz |
| B2 | Zweck-Erweiterung (626 I Ziff. 2) | «Die Gesellschaft kann Zweigniederlassungen errichten, sich an anderen Unternehmen beteiligen, Grundstücke erwerben, halten und veräussern, Finanzierungen für eigene oder fremde Rechnung vornehmen sowie Sicherheiten für Verbindlichkeiten verbundener Gesellschaften leisten.» (`AS02b_zweck_erweiterung`) | SG/GL gleichlautend, aber ausführlicher: «… Tochtergesellschaften im In- und Ausland errichten … alle Geschäfte tätigen, die direkt oder indirekt mit ihrem Zweck in Zusammenhang stehen … Grundeigentum erwerben, belasten, veräussern und verwalten … Garantien und Bürgschaften für Tochtergesellschaften und Dritte eingehen.» | U | nichts tun — reine Stilvariante (längere Aufzählung), inhaltlich deckungsgleich; Haus-Fassung trägt |
| B3 | Kapital/Aktien (Pflicht 626 I Ziff. 3+4) | «Das Aktienkapital beträgt {{waehrungCode}} {{akFmt}} und ist eingeteilt in {{anzahlAktien}} {{aktienArt}} zu {{waehrungCode}} {{nennwertFmt}}. Die Aktien sind {{liberierungSatz}}.» (`AS03_kapital`) | SG-vink/GL-kurz: «Das Aktienkapital beträgt CHF […] und ist eingeteilt in […] Namenaktien zu CHF […]. Die Aktien sind zu […]% liberiert.» – SG-lang/GL-lang fügen die Betrags-Ausschreibung in Worten bei: «CHF […] (Schweizer Franken […])» | U | nichts tun (Betragswort in Klammern ist Usanz). **Hinweis:** GL-lang fixiert «**Die Aktien sind vollständig liberiert.**» — die Haus-Fassung ist hier flexibler (parametrierter Liberierungsgrad) und damit überlegen |
| B4 | Vinkulierung (685a/685b) | «… bedarf der Genehmigung durch den Verwaltungsrat. Der Verwaltungsrat kann das Gesuch … ablehnen, wenn er im Namen der Gesellschaft dem Veräusserer anbietet, die Aktien zum wirklichen Wert im Zeitpunkt des Gesuches zu übernehmen, oder wenn der Erwerber nicht ausdrücklich erklärt … Werden Aktien durch Erbgang … erworben, so kann **die Gesellschaft** das Gesuch … nur ablehnen, wenn **sie** dem Erwerber die Übernahme … anbietet.» (`AS10_vinkulierung`, gekürzt) | SG-vink/GL wortgleicher Aufbau, aber **ausführlicher** beim Übernahmeangebot: «… die Aktien **für deren Rechnung, für Rechnung anderer Aktionäre oder für Rechnung Dritter** zum wirklichen Wert … zu übernehmen». Bei den Sondererwerbsarten: «… so kann **der Verwaltungsrat** das Gesuch … nur ablehnen» und Zusatz: «**Der Erwerber kann verlangen, dass der Richter am Sitz der Gesellschaft den wirklichen Wert bestimmt. Die Kosten der Bewertung trägt die Gesellschaft.**» | S | kantonsneutral schärfen erwägen: (a) die Drei-Rechnungs-Formel («für deren / anderer Aktionäre / Dritter Rechnung») gibt Art. 685b Abs. 1 OR präziser wieder als die Haus-Kürzung; (b) der Bewertungs-/Kostensatz (Art. 685b Abs. 5 OR) fehlt in der Haus-Fassung. Beides ist deklaratorischer Gesetzeswortlaut — Übernahme wäre eine Verbesserung, kein Muss |
| B5 | Mitteilungen (Pflicht 626 I Ziff. 7) | «Mitteilungen der Gesellschaft an die Aktionärinnen und Aktionäre erfolgen per Brief oder E-Mail an die im Aktienbuch verzeichneten Adressen.» (`AS04_mitteilungen`) | SG/GL wortgleich (ohne «-innen»); SG-vink ergänzt einen eigenen Artikel: «**Publikationsorgan der Gesellschaft ist das Schweizerische Handelsamtsblatt.**» | I | offenlegen / erwägen: Das SHAB als Publikationsorgan ist gesetzliche Auffangregel (Art. 931a Abs. 2 OR, vormals 35 HRegV), darum nicht zwingend statutarisch. SG nennt es trotzdem. Haus-Fassung trägt ohne; bei Bedarf optionaler Baustein «Publikationsorgan» |
| B6 | Revision (727a) — Verzichts-Binnenverweis | «… Die Generalversammlung darf diesfalls die Beschlüsse **über die Genehmigung der Jahresrechnung und die Verwendung des Bilanzgewinnes** erst fassen, wenn der Revisionsbericht vorliegt.» (`ASL50_revision`) | SG-vink gleich umschrieben; SG-lang/GL-lang verweisen per Artikelnummer: «die Beschlüsse **nach Art. 8 Ziff. 3 bis 6**». | U | nichts tun — die Haus-Lösung (inhaltliche Umschreibung statt Binnenverweis) ist wegen der dynamischen Artikelnummerierung bewusst gewählt und bereits offengelegt; SG-Kurzfassung bestätigt diesen Weg |
| B7 | Geschäftsjahr-Default | «Das Geschäftsjahr beginnt am {{gjBeginnTxt}} und endet am {{gjEndeTxt}}.» (`AS15_geschaeftsjahr`) | SG-vink: «Das Geschäftsjahr **wird durch den Verwaltungsrat festgelegt. Ohne anderslautenden Beschluss beginnt es am 1. Januar und endet am 31. Dezember.**» | U | nichts tun — SG-Variante delegiert an den VR; die Haus-Fassung setzt es statutarisch fest (beides zulässig, gesetzlich nicht fixiert). Kein Pflegebedarf |
| B8 | Stichentscheid GV (703) | «… mit der Mehrheit der vertretenen Aktienstimmen. **Bei Stimmengleichheit hat der Vorsitzende den Stichentscheid.**» (`ASL37_beschlussfassung`, Langfassung) | SG-lang stellt die Grundregel **umgekehrt** dar: «**Bei Stimmengleichheit gilt ein Antrag als abgelehnt. Dem Vorsitzenden steht kein Stichentscheid zu.** [Variante: … hat der Vorsitzende den Stichentscheid.]» | I | offenlegen: Der statutarische Stichentscheid ist ein qualifiziert zu beschliessender Eingriff (Art. 704 Abs. 1 OR nennt ihn im Katalog). SG behandelt «kein Stichentscheid» als Default und den Stichentscheid als Variante; die Haus-Fassung (ZH) hat den Stichentscheid fest. Beides zulässig, aber die SG-Sicht ist die vorsichtigere — **als optionale Weiche erwägen** |
| B9 | Qualifiziertes Mehr (704) — Nennwert-Mehrheit | «… mindestens zwei Drittel der vertretenen Stimmen und **die Mehrheit der vertretenen Aktiennennwerte** …» (`ASL37_beschlussfassung`) | SG-lang: «… und **die absolute Mehrheit der vertretenen Aktiennennwerte** …» | U | nichts tun — «Mehrheit» und «absolute Mehrheit» meinen dasselbe (Art. 704 Abs. 1 OR: «absolute Mehrheit»). Der Gesetzeswortlaut sagt «absolute»; minimaler Schärfungs-Kandidat, aber rein sprachlich |
| B10 | Organisations-Artikel Langfassung (GV/VR/RS) | ZH-Langvorlage verbatim (`ASL30`–`ASL51`): Befugnisse, Einberufung, Tagungsort, virtuelle GV, Vorsitz, Zirkular, Stimmrecht, Beschlussfassung, VR-Wahl/Sitzungen/Auskunft/Aufgaben/Delegation, Revision, RS-Anforderungen | SG-lang/GL-lang decken denselben Artikel-Katalog praktisch **deckungsgleich** ab (Art. 8–26). Abweichungen nur in B6/B8/B9 oben sowie GL-lang Art. 12 «virtuelle GV»: «**Auf die Bezeichnung eines unabhängigen Stimmrechtsvertreters kann verzichtet werden**» (genereller, ohne «im Einzelfall») | U/S | nichts tun beim Katalog. **Bestätigung:** Die Haus-Abweichung bei der virtuellen GV (`ASL33_virtuell`: «im Einzelfall» statt genereller Verzicht, EHRA-PM 1/23) ist gegenüber GL die **rechtlich saubere** Variante — die GL-Langfassung übernimmt den unzulässigen generellen Verzicht ungeprüft. Haus-Fassung hier überlegen |

### Errichtungsakt

| Nr. | Gegenstand | Haus-Wortlaut | SG-Wortlaut (verbatim, SG-EA) | Einordnung | Empfehlung |
|---|---|---|---|---|---|
| E1 | Zeichnung in der Urkunde (630) | «Das Aktienkapital … ist eingeteilt in {{anzahlAktien}} {{aktienArt}} zu je {{waehrungCode}} {{nennwertFmt}} (Nennwert), welche zum Ausgabebetrag von {{waehrungCode}} {{ausgabeFmt}} je Aktie wie folgt **gezeichnet werden**:» + Liste je Gründer (`AE04_zeichnung`/`AE05_zeichnungsliste`) | SG-EA Ziff. 3: «Das Aktienkapital … beträgt CHF […], eingeteilt in: […] Namenaktien zum Nennwert von je CHF […], **die zum Ausgabebetrag in der Höhe des Nennwertes wie folgt gezeichnet werden:** … durch [Name],[Vorname]» | U | **bestätigt: SG zeichnet IN der Urkunde**, wortgleich zum Haus-Aufbau. Kein separater Zeichnungsschein nötig — siehe E2 |
| E2 | Separater Zeichnungsschein? | Haus hat **keinen** separaten Zeichnungsschein; die Zeichnung erfolgt in der Urkunde (wie ZH/SG-EA) | SG stellt **zusätzlich** ein Formular «Zeichnungsschein mit Vollmacht (Gründung)» bereit (SG-ZS): «… zeichnet hiermit unter Bezugnahme auf die … genehmigten Gründungsbelege (Art. 631 Abs. 2 OR) folgende Aktien … erteilt hiermit Vollmacht … zur Vertretung anlässlich der Gründerversammlung … Die Verbindlichkeit dieser Aktienzeichnung und Vollmacht endet nach Ablauf von 3 Monaten …» | I | offenlegen: Der SG-Zeichnungsschein ist **kein Pflichtdokument für die Eintragung**, sondern ein Hilfsmittel für den Fall der **Stellvertretung** in der Gründerversammlung (Zeichnung + Vollmacht in einem, mit 3-Monats-Befristung). Wer persönlich erscheint und in der Urkunde zeichnet, braucht ihn nicht. → Die Haus-Fassung (Zeichnung in der Urkunde) ist die kantonsneutrale Grundform. **Backlog-Kandidat:** optionaler «Zeichnungsschein mit Vollmacht» für Vertretungs-Konstellationen (auch ZH/AR kennen ihn) |
| E3 | Bank-Definition | «… einer Bank nach **Art. 1 des Bundesgesetzes über die Banken und Sparkassen** …» (`AE07_einlagen_*`) | SG-EA Ziff. 4: «… einer Bank nach **Art. 1 Abs. 1 des Bankengesetzes vom 8. November 1934** …» | U | nichts tun — gleiche Norm, andere Zitierweise. Haus-Fassung trägt; allenfalls «Abs. 1» ergänzen (minimal) |
| E4 | Feststellungen (629 II) | «… stellt fest, dass: – sämtliche Aktien gültig gezeichnet sind; – die versprochenen Einlagen dem gesamten Ausgabebetrag entsprechen; – die gesetzlichen und statutarischen Anforderungen an die geleisteten Einlagen … erfüllt sind; – keine anderen Sacheinlagen, Verrechnungstatbestände oder besonderen Vorteile bestehen, als die in den Belegen genannten.» (`AE08_feststellungen`) | SG-EA Ziff. 5 **wortgleich** in der Sache (vier Spiegelstriche, identische Reihenfolge und Inhalt) | U | nichts tun — Haus-Fassung deckungsgleich mit SG; trägt kantonsneutral |
| E5 | Organbestellung/Konstituierung | «Als Mitglieder des Verwaltungsrates werden gewählt: …» + Konstituierungs-Ziffer «Unter der Bedingung, dass der Verwaltungsrat vollzählig anwesend ist, erklären die soeben ernannten Mitglieder …» (`AE09`/`AE12k`) | SG-EA Ziff. 6: «… wählen wir in den Verwaltungsrat: … Die Gewählten sind mit der Übernahme des Mandats einverstanden und **bestätigen die innerhalb ihres Gremiums erfolgte Konstituierung und Regelung der Zeichnungsberechtigung.**» | U | nichts tun — SG fasst Wahl + Annahme + Konstituierung in einem Satz; die Haus-Fassung trennt sauberer (Wahl, dann Konstituierungs-Ziffer mit Vollzähligkeits-Bedingung). Beides trägt; Haus-Variante ist granularer |
| E6 | Opting-out | dreigliedrige Feststellung in der Urkunde (`AE11_opting_out`): keine Pflicht zur ordentlichen Revision · ≤ 10 VZS · sämtliche verzichten | SG-EA Ziff. 7 Variante: «Die Gründer haben Kenntnis von den gesetzlichen Bestimmungen betreffend Verzicht auf eine eingeschränkte Revision (**Art. 727a OR**) und erklären übereinstimmend, auf eine solche zu verzichten.» | S | offenlegen: Die SG-Kurzformel nennt nur den Verzicht, **nicht** die drei Tatbestandsmerkmale. Die Haus-Fassung ist hier **strenger und HRegV-konformer** (Art. 62 Abs. 1 lit. c HRegV verlangt die Erklärung über das Nichterfüllen der ordentlichen Revisionspflicht und ≤ 10 VZS). Haus-Fassung überlegen — nichts ändern |
| E7 | Belege-Bestätigung (631) | «Die Urkundsperson nennt die Belege über die Gründung einzeln und bestätigt, dass diese ihr und den Gründerinnen und Gründern vorgelegen haben (Art. 631 Abs. 1 OR): …» (`AE15_belege`) | SG-EA Ziff. 11: «Gründer und Urkundsperson bestätigen: dass die … Belege (Art. 631 OR) der Gründerversammlung und der Urkundsperson vorgelegen haben; dass die … Urkunde die … Willenserklärungen … enthält; dass diese öffentliche Urkunde der Gründerversammlung vorgelesen, … und in Gegenwart der Urkundsperson unterzeichnet wurde.» | U | nichts tun — SG bündelt Beleg-Bestätigung mit dem Vorlesungs-/Beurkundungsvermerk; Letzterer ist kantonales Beurkundungsrecht und steht in der Haus-Fassung beim `AE17_urkundsperson`-Vermerk. Inhaltlich gedeckt |

### Wahlannahme

| Nr. | Gegenstand | Haus-Wortlaut (`AW06_text`) | SG-Wortlaut (SG-WA) | Einordnung | Empfehlung |
|---|---|---|---|---|---|
| W1 | Annahme-Kernsatz | «Gerne bestätige ich Ihnen, dass ich die Wahl als **Mitglied des Verwaltungsrates** der {{firma}}, in {{sitz}}, annehme.» | «Gerne bestätige ich Ihnen, dass ich die Wahl als **[Funktion] mit [Zeichnungsberechtigung]** der [Firma], in [Sitz], annehme.» | S | kantonsneutral schärfen erwägen: SG nennt zusätzlich **Funktion und Zeichnungsberechtigung**. Die Haus-Fassung fixiert «Mitglied des Verwaltungsrates» ohne Zeichnungsberechtigung. Für die HReg-Anmeldung ist die Zeichnungsart ohnehin in der Urkunde/Anmeldung deklariert; der Zusatz ist nicht zwingend, aber praxisüblich. **Optional:** Funktions-/Zeichnungs-Platzhalter ergänzen |

### Domizilannahme

| Nr. | Gegenstand | Haus-Wortlaut (`AD06_text`) | SG-Wortlaut (SG-DH) | Einordnung | Empfehlung |
|---|---|---|---|---|---|
| D1 | Domizil-Kernsatz | «Gerne bestätigen wir Ihnen, dass wir der {{firma}}, mit Sitz in {{sitz}}, an unserer Adresse ({{domizilhalterAdresse}}) **Domizil gewähren**.» | «Hiermit wird bestätigt, dass der … Domizilhalter der [Firma], in [Sitz], an oben aufgeführter Adresse **Domizil gewährt**.» | U | nichts tun — Kernaussage identisch («Domizil gewähren», Art. 117 Abs. 3 HRegV). Haus-Fassung trägt |
| D2 | Form/Belehrung | knapper Brief (Absender/Adressat/Betreff/Anrede/Text/Gruss/Unterschrift) | SG-DH ist **deutlich ausführlicher**: Definition Rechtsdomizil, Strafbelehrung (Art. 929 OR, Art. 152/153 StGB), Verweis Art. 2 lit. c / 117 HRegV, c/o-Block, Domizilhalter-Block (mit Vertretungs-Variante) | U/S | offenlegen: Die SG-Strafbelehrung und der Norm-Hinweis sind **informativ**, nicht eintragungs-konstitutiv (die Erklärung als solche genügt, Art. 43 Abs. 1 lit. g / 117 Abs. 3 HRegV). Haus-Fassung trägt; ein optionaler Belehrungs-/Fussnoten-Block (Art. 152/153 StGB) wäre eine Nutzer-freundliche, kantonsneutrale Ergänzung |

## 3 Geltungsbereich

- **Räumlich:** Die Befunde betreffen die Behörden-Vorlagen SG (HR-Amt
  St. Gallen) und GL (HR-Amt Glarus). Sie sind **keine kantonalen
  Sonderrechte** — das materielle Recht ist eidgenössisch (OR/HRegV). Die
  Abweichungen sind durchwegs **Formulierungs-Usanzen** oder **fakultative
  Zusatzklauseln**, nicht zwingende kantonale Pflichtinhalte.
- **Pflichtinhalte (Art. 626 OR):** Firma/Sitz (B1), Zweck (B2), Kapital/Aktien
  (B3), Mitteilungsform (B5) sind in allen drei Kantonen **inhaltlich
  deckungsgleich**; die Haus-Fassung deckt sie vollständig.
- **Errichtungsakt:** SG zeichnet — wie ZH und die Haus-Fassung — **in der
  Urkunde** (E1). Der separate SG-Zeichnungsschein (E2) ist ein
  **Vertretungs-Hilfsmittel**, kein Eintragungs-Pflichtbeleg; er verlangt die
  Zeichnung in der Urkunde nicht ab und stellt sie auch nicht in Frage.
- **Nicht erfasst:** GmbH-Muster (eigenes Rechtsgebiet, §4), SG-Minimalversion
  als Statuten-Stufe (nur als Beleg, dass SG noch eine dritte, kürzere Stufe
  führt), kantonale Notariats-/Beurkundungsformalien (gehören zum kantonalen
  Beurkundungsrecht, in der Haus-Fassung via `AE17_urkundsperson` offengehalten).

## 4 Pflegebedarf

- **Keine datierten Parameter** — die Muster enthalten keine Beträge/Sätze, die
  ins Verfallsregister gehören. Pflege folgt dem OR/HRegV-Stand (zentral über
  `register/parameter-verfall.md` bzw. den OR-Cache).
- **Schärfungs-Kandidaten für den Hauptstrang** (Empfehlungen, nicht umgesetzt):
  - B4 Vinkulierung: Drei-Rechnungs-Formel (685b I) und Bewertungs-/Kostensatz
    (685b V) ergänzen.
  - B8 Stichentscheid GV: optionale «kein Stichentscheid»-Weiche (SG-Default).
  - B5 Publikationsorgan SHAB: optionaler Statuten-Baustein.
  - E2 Zeichnungsschein mit Vollmacht: optionales Dokument für
    Vertretungs-Konstellationen (Backlog).
  - W1 Wahlannahme: Funktions-/Zeichnungs-Platzhalter.
  - D2 Domizilannahme: optionaler Strafbelehrungs-/Norm-Block.
- **Bestätigte Haus-Stärken (nichts tun):** parametrierter Liberierungsgrad (B3
  vs. GL-lang-Fixierung), «im Einzelfall»-Verzicht virtuelle GV (B10 vs.
  GL-genereller Verzicht, EHRA-PM 1/23), HRegV-konforme Opting-out-Tripel-Formel
  (E6 vs. SG-Kurzformel).

## 5 Abnahme-Status

**Erstrecherche.** Quervergleich gegen die lokal vorliegenden amtlichen SG-/GL-
Vergleichsmuster; Haus-Wortlaute aus `ABNAHME-AG-BAUSTEINE.md` (Engine-Stand
7.6.2026). Keine Web-/Archiv-Quellen herangezogen (Daueranweisung). Befunde sind
**Empfehlungen für den Hauptstrang**; die Engine wurde nicht geändert. Fachliche
Abnahme durch David (§7) und ein adversarialer Zweitdurchgang stehen aus.

**Fazit:** Die Haus-Bausteine **tragen kantonsneutral**. Sämtliche SG-/GL-
Abweichungen sind Formulierungs-Usanzen oder fakultative Zusatzklauseln; in den
rechtlich heiklen Punkten (virtuelle GV, Opting-out, Liberierungsgrad) ist die
Haus-Fassung der SG-/GL-Vorlage **überlegen**. Echte inhaltliche Differenzen mit
Empfehlungs-Charakter beschränken sich auf wenige, allesamt **optionale**
Schärfungen (B4, B8, E2, W1, D2).
