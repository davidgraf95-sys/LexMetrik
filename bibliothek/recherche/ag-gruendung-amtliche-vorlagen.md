# AG-Gründung — Amtliche ZH-Vorlagen-Suite (Originalmaterial David, 7.6.2026)

**Erstellt:** 7.6.2026 (Auftrag David: «AG-Gründungsmaske komplett überarbeiten,
beachte diese Infos») · **Quelle:** Original-Dateiablage David
`~/Desktop/Legal Calc Knowledge/Gründung AG` (27 eindeutige Dokumente;
Text-Extrakte der DOCX in `.scratch/ag-knowledge/`, nicht committet) —
durchwegs **amtliches Material des Handelsregisteramts Kanton Zürich bzw.
der Notariate ZH** (Copyright-Fusszeilen, Löwen-Logo). · **Verhältnis zu
bestehenden Dossiers:** [ag-gruendung.md](ag-gruendung.md) (Vertiefung) und
[gruendungsdokumente-wortlaute.md](gruendungsdokumente-wortlaute.md)
(Wortlaut-Katalog) stützten sich auf Web-Parsings derselben Suite — **jetzt
liegen die Originale vor**; dieses Dossier hält die NEUEN Inhalte und die
Deltas zur gebauten Maske (`lib/vorlagen/gruendungAgDokumente.ts`) fest.

**Status: Erstsichtung am Original (alle 27 Dokumente vollständig gelesen,
Duplikate per byte-diff ausgeschieden).** Wortlaute sind amtliche Muster —
für Engine-Bausteine gilt weiterhin §7/Teil 0 des Wortlaut-Dossiers:
massgeblich ist der OR-Cache 1.1.2026, nie das Muster. Fachliche Abnahme
David ausstehend.

---

## TEIL 1 — Inventar (Stand-Daten = Pflegebedarf)

| Dokument | Stand | Inhaltstyp |
|---|---|---|
| 3.1 Urkunde Gründung **bar CHF** (= `ag_vorlage_urkunde_gruendung_bar.docx`, byte-identisch) | 26.7.2024 | Notariats-Textvorlage mit Erläuterungen |
| 3.2 Urkunde Gründung **bar Fremdwährung** | 26.7.2024 | dito (EUR-Beispiel, Kurs-Satz) |
| 3.3 Urkunde Gründung **qualifiziert** (= `…qualifiziert.docx`, identisch) | 26.7.2024 | dito (3 Sacheinlage-Varianten + besondere Vorteile) |
| 3.4 Gründungs-**Nachtrag** | undat. | Urkunde für Beanstandungs-Nachträge |
| 3.5 Urkunde Gründung **Einpersonen** bar | undat. | Singular-Fassung |
| Statuten **kurz** / **lang** | 26.7.2024-Suite | DOCX-Vorlagen |
| Wahlannahme VR · Domizilannahme · VR-Protokoll | 26.7.2024-Suite | DOCX + ausgefüllte Muster-PDFs («Brinkmann Lux AG») |
| Sacheinlage**vertrag** einfach/Geschäft · Gründungs**bericht** einfach/Geschäft | 26.7.2024-Suite | DOCX + Muster-PDFs |
| HR-**Anmeldung** Neueintragung (Formular) | aktuell | Formular mit Belege-Checkboxen |
| Checkliste **Mindestinhalt Statuten** (626 OR) · **Minimalanforderungen Errichtungsakt** (44 HRegV) · **Belege Neueintragung** (43 HRegV) | 11.12.2024 | Prüfraster des HRegA |
| Merkblatt **Belege Neueintragung** | 11.12.2024 | Beleg-Erläuterungen |
| Merkblatt **Formelle Anforderungen an Handelsregisterbelege** | 7.1.2025 | Protokoll-/Beglaubigungs-/Übersetzungs-Regeln |
| Merkblatt **Gesetzliche Pflichten VR** | 3.12.2025 | 716a/725/725b OR · 165/166 StGB |
| Merkblatt **Vorsicht vor privaten Registern** | 17.2.2026 | Warnung Fake-Rechnungen + HRA-Rechnungs-Merkmale |
| Merkblatt **Opting-out KMU** | 11.12.2024 | 727a OR / 62 HRegV inkl. Wortlaute |
| **Lex-Koller-Erklärung** (Formular) | 1.1.2025 | 4 Ja/Nein-Erklärungen + BewG-Definitionen |

Die Muster-PDFs (`ag_muster_*`) sind **ausgefüllte Beispiele** der
gleichnamigen Vorlagen (verifiziert am VR-Protokoll) — nützlich als
Plausibilitäts-Referenz für Personenangaben-Formate.

## TEIL 2 — Regeln, die die gebaute Maske noch NICHT abbildet (Deltas, engine-orientiert)

Nummerierung D1… wird im FAHRPLAN-AG-GRUENDUNG.md referenziert.

### Urkunde / Errichtungsakt

- **D1 Numerus:** «Falls nur eine einzige natürliche Person gründet (oder
  als Gründervertreter handelt), ist die Gründungsurkunde in der **Einzahl**
  abzufassen» (Erläuterung 3.1; eigenständige Singular-Vorlage 3.5).
  → IST: Engine formuliert immer Plural («Die erschienenen Personen
  erklären…»). Weiche: `gruenderListe.length === 1` → Singular-Bausteine.
- **D3 Qualifizierte Gründung** (3.3) — drei Urkunden-Varianten Ziff. IV,
  «unter sich und mit Ziff. IV der Textvorlage 3.1 [bar] kombinierbar»:
  1. **Sacheinlage**: Sacheinlagevertrag vom {{datum}}, «welcher von uns
     genehmigt wird», mit Bestätigung — Weiche Grundstück: «sofort als
     Eigentümerin über die Sacheinlagen verfügen kann» (ohne) vs.
     «einen bedingungslosen Anspruch auf Eintragung in das Grundbuch
     erhält» (mit) · Gründungsbericht Art. 635 OR, von ALLEN Gründern
     unterzeichnet · Prüfungsbestätigung Art. 635a OR des zugelassenen
     Revisors («vollständig und richtig»).
  2. **Sacheinlage mit Verrechnung**: zusätzlich Übernahmebilanz, «wonach
     dem Mitgründer {{name}} eine verrechenbare Forderung gegenüber dem
     eingebrachten, im Handelsregister nicht eingetragenen Unternehmen
     zusteht, wovon der Betrag von CHF {{betrag}} verrechnet wird»;
     Gründungsbericht zusätzlich «über den Bestand und die
     Verrechenbarkeit der Forderung».
  3. **Kombination Sacheinlage/Sachübernahme**: «wobei die in Gründung
     begriffene Gesellschaft dafür eine weitere Gegenleistung erbringt»;
     Sacheinlage- UND Sachübernahmevertrag; Bericht über «Sacheinlagen
     und Sachübernahmen».
  - **Zusatz-Variante besondere Vorteile**: «die in den Statuten
    umschriebenen besonderen Vorteile» + Bericht «über die Begründung und
    über die Angemessenheit» + Prüfungsbestätigung.
  - Statuten-Pflichtklauseln dazu: 634 IV (Sacheinlage), 634a III
    (Verrechnung) — Klausel-Kerne in
    [ag-gruendung.md](ag-gruendung.md) Tabelle 1.2.
  - Erläuterung: bei Sacheinlagen **Art. 181 Abs. 4 OR (FusG-Verweis)**
    beachten; Prüfungsbestätigung ggf. durch Revisionsexperten/
    beaufsichtigtes Unternehmen (727b).
- **D2 Fremdwährung** (3.2): Einlage-Absatz mit Pflicht-Kurs-Satz: «Die
  geleisteten Einlagen entsprechen, aufgrund des Umrechnungskurses per
  {{währung}} 1.00 = CHF 1.{{rappen}}, dem Betrag von CHF {{chf}}. Dieser
  Umrechnungskurs entspricht dem Devisenmittelkurs der {{bank}}.»
  (Art. 629 Abs. 3 OR). Zulässig: **GBP, EUR, USD, JPY** (Anhang 3 i. V. m.
  Art. 45a HRegV); Checkliste: Fremdwährung muss **umgerechnet in CHF die
  Mindesthöhe CHF 100'000 ergeben**. Statuten/Zeichnungs-Beträge dann in
  der Fremdwährung (Ziff. III ohne CHF-Präfix).
- **D6 Teilliberierung JE GRÜNDER:** ZH-Urkunde listet «a) {{n}} Aktien des
  Gründers {{name}} zu {{p}} %» — Liberierungsgrad ist pro Gründer
  variabel. 634b-Verpflichtung: «auf erstes Verlangen des Verwaltungsrates
  die restliche und vollständige Leistung seiner Einlage im Sinne von
  Art. 634b OR **sofort** zu erbringen». → IST: ein globaler Prozentsatz;
  Verpflichtungssatz vorhanden, aber ohne «sofort»/Norm-Zitat.
- **D7 Agio:** Ausgabebetrag = «Nennwert plus Agio» (Checkliste
  Errichtungsakt zu Art. 630 OR); Urkunde führt Ausgabebetrag als eigenes
  Feld. → IST: Ausgabebetrag hart = Nennwert.
- **D8 Wahlannahme IN der Urkunde:** VR-Wahl ergänzbar um «welcher hiermit
  die Annahme erklärt» (anwesend) oder «dessen Annahmeerklärung vorliegt»
  → separate Wahlannahmeerklärung wird ENTBEHRLICH (Merkblatt: «Die
  Wahlannahme kann auch in der Gründungsurkunde selbst erfolgen»).
  Weitere Wahl-Zusätze: «zugleich als Präsident» (nur wenn Statuten
  GV-Wahl vorsehen, 712 II) · Partizipanten-Vertreter (656e) ·
  Kategorie-Vertreter (709 I) · Körperschafts-Vertreter (762 I) — Stufe 3.
- **D9 Konstituierung + Domizil in der Urkunde** (Ziff. VII), «[Variante:
  Unter der Bedingung, dass der Verwaltungsrat vollzählig anwesend ist]»:
  Zeichnungsberechtigungen + Domizil direkt in der Urkunde → separates
  VR-Protokoll entbehrlich. Domizil-Hinweis kann in der Urkunde WEGGELASSEN
  werden (dann nur in der Anmeldung; Erläuterung zu Ziff. VII).
- **D10 Nachtragsvollmacht (ZH-Wortlaut):** «Ferner bevollmächtigen wir
  {{Vorname, Name, Geburtsdatum, Bürgerort/Staatsangehörigkeit,
  Wohnadresse}} allfällige, wegen Beanstandung durch die
  Handelsregisterbehörde erforderliche Änderungen an den Statuten oder am
  Errichtungsakt, durch einen öffentlich zu beurkundenden Nachtrag namens
  aller Gründer vorzunehmen.» — EINE benannte Person mit vollen
  Personalien, auf Verlangen der Gründer (optional!). → IST: pauschal
  «jede Gründerin … sowie jedes Mitglied des Verwaltungsrates einzeln»,
  immer enthalten — weicht vom amtlichen Muster ab.
- **D11 Gründungs-Nachtrag** (3.4) als eigenes Dokument (öffentliche
  Beurkundung → ENTWURF-Gate §8): «Ziff. {{n}} der Gründungsurkunde lautet
  neu wie folgt: „…“» / «Art. {{n}} Abs. {{n}} der Statuten … lautet neu
  wie folgt: „…“» + Feststellung vollständiger Statuten + «Im Übrigen gilt
  der ursprüngliche Errichtungsakt (mit Statuten) unverändert weiter.»
- **D12 Opting-out-Wortlaut Urkunde (ZH):** «Sämtliche Gründer erklären,
  auf die eingeschränkte Revision und damit auf die Wahl einer
  Revisionsstelle zu verzichten, weil die zu gründende Gesellschaft nicht
  mehr als zehn Vollzeitstellen im Jahresdurchschnitt hat und die
  Voraussetzungen für die Pflicht zur ordentlichen Revision nicht
  erfüllt.» (Ein-Satz-Fassung; Haus-Fassung = dreigliedrige Feststellung
  deckt 62 HRegV expliziter — Abweichung offenlegen, beibehalten.)
  Revisionsstellen-Anforderungen als Hinweis: 727b/727c; natürliche Person
  nur als im HR eingetragenes Einzelunternehmen (Art. 8 Abs. 1 RAV).

### Nebendokumente

- **D4 Sacheinlagevertrag-Wortlaute** (druckfertig, einfache Schriftform):
  - *einfach* (Sachgesamtheit): Parteien (Sacheinleger + «{{firma}} AG in
    Gründung, vertreten durch» alle Gründer) · Einlage «gemäss beiliegender
    Inventarliste vom {{datum}} im Wert und zum Preis von CHF {{betrag}}»,
    Inventarliste integrierender Bestandteil, beigeheftet · Gegenleistung:
    «als voll liberiert geltende Aktien» je Empfänger + optionale
    Gutschrift «CHF {{betrag}} in den Büchern der Gesellschaft» ·
    Zeitpunkt: unwiderrufliche Verfügungsbefugnis «sofort nach ihrer
    Eintragung im Handelsregister» · Zusicherung «frei von Rechten
    Dritter» · Nutzen und Gefahr per {{datum}} · «unter Aufhebung jeder
    Gewährleistung».
  - *Geschäft* (Einzelunternehmen): Übernahme ALLER Aktiven und Passiven
    des [evtl. nicht] im HR eingetragenen Einzelunternehmens
    [CHE-{{nr}}] gemäss Übernahmebilanz per {{datum}} (Aktiven/Passiven/
    Kaufpreis) · zusätzlich **Rückwirkungsklausel**: «Die seit dem
    {{datum}} abgeschlossenen Rechtsgeschäfte des Einzelunternehmens
    {{firma}} gelten als für Rechnung der in Gründung begriffenen
    {{firma}} AG getätigt.»
  - Merkblatt: Vermögenswert = Geschäft(steil) → **Übernahmebilanz**
    beilegen; Sachgesamtheit → **unterzeichnete und datierte
    Inventarliste** (Gegenstände einzeln aufgeführt und bewertet);
    Original oder beglaubigte Kopie.
- **D5 Gründungsbericht-Wortlaute** (druckfertig, von allen Gründern
  original unterzeichnet): *einfach* — Art/Zustand der Sacheinlage
  (Vertrag + Inventarliste als integrierender Bestandteil) +
  «Angemessenheit der Bewertung … mit CHF {{betrag}} als angemessen»;
  *Geschäft* — je **Bilanzposten** «Auskunft über Bestand … und deren
  Bewertung», Aktiven/Passiven/Kaufpreis aus der Übernahmebilanz.
- **D15 Wahlannahme REVISIONSSTELLE** ist eigener Beleg (Checkliste
  Ziff. 2 «evtl. einzureichen») — fehlt in der Dokumentmappe (nur VR).
- **D16 Lex-Koller-Erklärung** (Formular 1.1.2025) — generierbar
  (druckfertig, Unterschrift EIN VR-Mitglied): 4 Ja/Nein-Erklärungen:
  1. Personen im Ausland sind beteiligt · 2. erwerben mit dem
  Eintragungsgeschäft NEU eine Beteiligung · 3. bei Sacheinlage/Fusion/
  Umwandlung/Spaltung: Gesellschaft erwirbt Nicht-Betriebsstätte-
  Grundstücke · 4. bei Kapitalherabsetzung: beherrschende Stellung
  (Art. 6 BewG). Definitionen «Personen im Ausland» (Art. 5 BewG, inkl.
  GB-Sonderfall SR 0.142.113.672) und «Betriebsstätte-Grundstück»
  (Art. 2 Abs. 2 lit. a/Abs. 3 BewG) als Fussnoten. Folge fehlender
  Angaben: Aussetzung + Verweisung an Bewilligungsbehörde (ZH:
  Bezirksräte; Art. 18 Abs. 1/2 BewG). Nur bei Immobilien-Haupttätigkeit
  einzureichen.

### VR-Protokoll / Formalia (Merkblatt 7.1.2025 + Vorlage/Muster)

- **D13 Protokoll-Mindestelemente** (Art. 23 HRegV-Praxis): Sitzungsart ·
  Ort **bzw. Feststellung virtuelle Sitzung** · Datum, **Beginn UND Ende**
  der Sitzung · **Anzahl anwesender/abwesender** Personen · Vorsitz ·
  Protokollführung. ZH-Vorlage zusätzlich: Feststellungssatz «Einladung
  gemäss den statutarischen Vorschriften fristgerecht erfolgt». → IST:
  Beginn/Ende und Abwesend fehlen. Vier Einreichungsformen (Vollprotokoll /
  Auszug / Zirkularbeschluss aller / beglaubigte Fotokopie).
- **D14 Zeichnungsarten:** Muster-Protokoll führt «**ohne
  Zeichnungsberechtigung**» (VR-Mitglied!) und «**Kollektivprokura zu
  zweien**» sowie Funktion «Direktor» mit Einzelunterschrift. → IST: nur
  Einzelunterschrift/Kollektiv zu zweien; VR immer zeichnungsberechtigt.
- Wahlannahme-Nachweis: 4 Wege (Mitunterzeichnung Anmeldung · schriftliche
  Erklärung · Mitunterzeichnung Wahlprotokoll · Annahme zu Protokoll);
  Rücktritt analog 2 Wege.

### HR-Anmeldung (Formular + Merkblätter)

- **D17 Anmeldung:** **zwingend auf Deutsch**; Unterzeichnung durch
  Zeichnungsberechtigte gemäss Zeichnungsart ODER bevollmächtigte
  Drittperson (Vollmacht von zeichnungsberechtigten VR-Mitgliedern,
  **Kopie genügt**; FusG-Sachverhalte: nur VR-Mitglieder) ·
  **Ausweiskopie für JEDE einzutragende Person** (Art. 24a HRegV; als
  separates loses Dokument — landet in den NICHT öffentlichen Akten) ·
  Anmeldung+Belege öffentlich (Art. 936 OR) · Bestellungen: HR-Auszug nach
  SHAB CHF 50 / Eintragungsbestätigung vor SHAB CHF 80 (ZH-Preise) ·
  Rechnungsadresse Pflichtfeld · Original-Grundsatz (E-Mail = Kopie).
- **D23 FINMA-Gate:** Bank vor Bewilligung NICHT eintragbar; Bezeichnungen
  «Vermögensverwalter», «Trustee», «Verwalter von Kollektivvermögen»,
  «Fondsleitung», «Wertpapierhaus» in Firma ODER Zweck nur mit
  FINMA-Bewilligung → deterministische Wortprüfung als Warnung möglich.
- **D24 Übersetzungen:** wichtige Belege (Statuten, Urkunden,
  Sacheinlageverträge, Berichte) fremdsprachig nur MIT beglaubigter
  deutscher Übersetzung durch qualifizierte Übersetzer; übrige Belege in
  «leicht verständlichem» F/I/RR/EN ohne.

### Statuten

- **D18 Statuten LANG** (amtlicher Volltext liegt jetzt verbatim vor):
  Aktienzertifikate · Zerlegung/Zusammenlegung · Aktienbuch · GV-Befugnisse
  (rev. Katalog inkl. **Zwischendividende** und **Rückzahlung der
  gesetzlichen Kapitalreserve**) · Einberufung 20 T., 10-%-Einberufungs-,
  5-%-Traktandierungsrecht, Geschäftsbericht-Zugänglichkeit 20 T./1 Jahr ·
  Tagungsort/mehrere Orte/Ausland (701a/b) · virtuelle GV (701d, mit
  Technik-Pannen-Klausel) · Vorsitz/Protokoll (30-T.-Zugänglichkeit) ·
  Zirkularbeschluss/schriftliche Abstimmung mit **Erwahrungsprotokoll**
  (GV und VR; vgl. EHRA-PM 1/24) · Stimmrecht nach Nennwert ·
  Beschlussfassung: Mehrheit + Stichentscheid-Option · 704-Katalog
  wortlautnah (inkl. Währungswechsel, Schiedsklausel, GV im Ausland,
  Sitzverlegung, Stimmrechtsvertreter-Verzicht virtuell) · VR: 1+,
  **3 Jahre**, Selbstkonstituierung, Stichentscheid, Auskunft/Einsicht
  (715a-Wiedergabe), 716a-Aufgabenkatalog, Delegation nach
  Organisationsreglement, 718-IV-CH-Vertretung · Revisionsstelle:
  Verzichts-Artikel + Anforderungs-Artikel (727b/c, RAG 2005,
  Unabhängigkeit 728/729, Amtsdauer 1 GJ, Abberufung nur aus wichtigen
  Gründen) · Geschäftsjahr (**«erstmals am {{datum}}»**) · Reserven/
  Gewinnverwendung (671 ff.) · Auflösung/Liquidation (742 ff., Verteilung
  «nach Massgabe der einbezahlten Beträge»!) · Mitteilungen.
- **D19 Statuten KURZ enthalten amtlich auch:** Beschlussfassungsarten-
  Artikel (vor Ort/hybrid/virtuell + **schriftliche Beschlussfassung
  Art. 701 Abs. 3 OR** sofern keine mündliche Beratung verlangt) und
  **Geschäftsjahr-Artikel** («beginnt am … endet am …», 957 ff.). → IST:
  beide fehlen in der Haus-Kurzfassung.
- Checkliste Mindestinhalt zusätzlich: Stimmrechtsaktien nur voll
  liberierte Namenaktien, übrige Nennwerte max. 10× (693 II);
  Vorzugsaktien 654; Inhaberaktien-Nachweis — deckt sich mit Tabelle 1.2
  in [ag-gruendung.md](ag-gruendung.md).

### Nach dem Eintrag (Info-Schicht)

- **D20 VR-Pflichten-Hinweis** (Merkblatt 3.12.2025, gemeinsam mit
  Kantonspolizei!): Buchführungspflicht persönlich (auch bei Übernahme
  ohne erhaltene Buchhaltung) · hälftige Deckung → Sanierungsmassnahmen +
  geprüfter Zwischenabschluss (Revisor auch ohne Revisionsstelle;
  entfällt bei Nachlassstundungs-Gesuch) · Überschuldung → Gericht
  (725b III) · persönliche Haftung + StGB 165 (Misswirtschaft)/166
  (Unterlassung Buchführung); gilt auch nach Weiterverkauf vor Konkurs.
- **D21 private-Register-Warnung** (17.2.2026): nur HRA-Rechnung zahlen;
  Erkennungsmerkmale (Rechnungsnr. 900…, Zahlungsempfänger Kanton Zürich,
  Walcheplatz 1); Fake-Namen («Handelsregisteramt Schweiz», «ZEFIREG» …);
  zh.ch/falsche-rechnungen.

## TEIL 3 — Bestätigungen (Material deckt sich mit gebauter Maske)

Feststellungen Ziff. V = 629 II wortgleich · Bankeinlage-Satz («…als dem
Bundesgesetz über die Banken und Sparkassen unterstellte Bank … zur
ausschliesslichen Verfügung der Gesellschaft») · Wahlannahme-/
Domizilannahme-Kernsätze verbatim wie gebaut («Sitz gewähren» in der
AG-Vorlage; Haus-Fassung «Domizil» bleibt als offengelegte Abweichung) ·
Opting-out-Gründungsfall in der Urkunde · Statuten-Pflichtartikel A1–A4 ·
Vinkulierungs-Block (685a/b) wortgleich ZH-kurz · CHF 100'000 / 50'000 /
20 % / Nennwert > 0 · Belege-Listen 43/44 HRegV = Checklisten-Engine.

## TEIL 4 — Pflegebedarf

- Suite-Stände (26.7.2024 / 11.12.2024 / 7.1.2025 / 3.12.2025 / 17.2.2026)
  → bei OR-/HRegV-Cache-Aktualisierung neu abgleichen; ZH-Preise
  (Auszug 50/Bestätigung 80) sind kantonal → nicht hart verdrahten.
- Lex-Koller-Formular nennt Bewilligungsbehörde ZH (Bezirksräte) —
  kantonsabhängig, nur als ZH-Beispiel ausweisen.

## TEIL 5 — Abnahme-Status

Erstsichtung Claude am Original (7.6.2026). Deltas D1–D24 sind
Bau-Kandidaten — Reihenfolge und Zuschnitt: **FAHRPLAN-AG-GRUENDUNG.md**
(Repo-Root). Davids Wort-für-Wort-Abnahme aller Bausteine steht aus
(`verified:false` bleibt).
