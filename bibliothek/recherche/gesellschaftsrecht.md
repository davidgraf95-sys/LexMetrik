# Gesellschaftsrecht — Recherche-Dossier (Cluster, Grundlage für die geplanten Rechner)

**Erstellt:** 6.6.2026 · **Wortlaut-Quelle:** Fedlex SR 220 (OR), lokaler Cache
`/tmp/or.html` — Konsolidierungsstand empirisch **«Stand am 1. Januar 2026»**,
also **POST-Aktienrechtsrevision** (BG vom 19. Juni 2020 [Aktienrecht],
AS 2020 4005 / 2022 109, in Kraft seit **1.1.2023**). Alle aktienrechtlichen
Kernartikel tragen im Cache die Fussnote dieser Revision. · **Abrufdatum:
6.6.2026** · Anker-Format empirisch `id="art_725_a"` (Unterstrich vor
Buchstaben, **nicht** `art_725a`).

**FinfraG-Teile (SR 958.1) nicht im Cache** → über Web (takeoverpractice.ch,
UEK/takeover.ch, swiss-estates.ch) belegt, 6.6.2026.

**Status: EINFACH BELEGT (Erstrecherche).** Wortlaut-Proben: 30+ Artikel
verbatim aus dem Cache gezogen; FinfraG-Schwellen aus Sekundärquellen.
Adversarialer Zweitdurchgang + fachliche Abnahme durch David ausstehend (§7).
BGE-Hinweise durchwegs **[zu verifizieren]**.

**Quellenlage / Verifikations-TODOs (offen):**
- [ ] FinfraG Art. 135/137 + FusG Art. 8/18 (Squeeze-out 90 %) nicht aus
  amtlichem Fedlex-Cache, sondern Sekundärquellen — vor Engine-Übernahme
  gegen Fedlex SR 958.1 / SR 221.301 prüfen.
- [ ] Liberierungs-Mindestbetrag CHF 50 000 (Art. 632 Abs. 1) gilt nur für
  AK in CHF; bei Fremdwährungs-AK: «Gegenwert von mind. 50 000 Franken»
  (Abs. 2) — Umrechnungskurs ist Nutzereingabe, nicht berechenbar.
- [ ] Art. 671 Abs. 4: Aufwertungsreserve (725c) und eigene-Aktien-Reserve
  (659b) bei Grenzwert­berechnungen ausnehmen — gilt das auch für die
  725a-Schwelle? Wortlaut 725a verweist nur auf «nicht an die Aktionäre
  zurückzahlbare gesetzliche Kapitalreserve» → Auslegungsfrage, offenlegen.
- [ ] Alle BGE-Anker im Register `src/data/verifikation.ts` ergänzen.

**Gliederung:** Teil A = 7 RECHNER (je nach PRO-ITEM-Schema). Teil B =
VORLAGEN (nur Skizze, §8-Exportsperre beachten). Teil C = Bau-Reihenfolge +
Wiederverwendung.

---

# TEIL A — RECHNER

---

## A1 — Beteiligungs- / Stimmrechtsquoten + Schwellen-Übersicht

**1) Nutzerfrage.** «Ich halte X Aktien (Nennwert je …) von total Y / bzw.
X % der Stimmen — welche Aktionärsrechte stehen mir offen, welche Schwellen
erreiche / verfehle ich?»

**2) Normbasis (OR, rev. 2023, sofern nicht anders vermerkt).**

| Schwelle | Norm | Auslöser / Recht | Wortlaut-Kern (verbatim) |
|---|---|---|---|
| **je 1 Aktie** | 620 IV | Aktionärsstellung | «Aktionär ist, wer mit mindestens einer Aktie … beteiligt ist.» |
| **5 % AK od. Stimmen** | 697a I | Einsicht Bücher/Akten | «… von Aktionären eingesehen werden, die zusammen mindestens 5 Prozent des Aktienkapitals oder der Stimmen vertreten.» (VR gewährt innert 4 Mt.) |
| **5 % (nicht kotiert)** | 699 III Ziff. 2 | **Einberufung GV verlangen** | «bei anderen Gesellschaften: 10 Prozent» — **ACHTUNG**: für nicht kotierte ist es **10 %**, für kotierte **5 %** (Ziff. 1). |
| **0,5 % (kotiert) / 5 % (nicht kotiert)** | 699b I | **Traktandierung / Antrag** | «in Gesellschaften, deren Aktien an einer Börse kotiert sind: 0,5 Prozent …; in anderen Gesellschaften: 5 Prozent des Aktienkapitals oder der Stimmen.» |
| **5 % (kotiert) / 10 % (nicht kotiert)** | 697d I | **Sonderuntersuchung vom Gericht** | «1. … kotiert: 5 Prozent …; 2. … nicht kotiert: 10 Prozent des Aktienkapitals oder der Stimmen.» (Frist: 3 Monate ab ablehnender GV) |
| **33⅓ % Stimmen** | FinfraG 135 I | **Angebotspflicht** (öffentl. Pflichtangebot, nur kotiert) | «… 33⅓ Prozent der Stimmrechte einer Zielgesellschaft, ob ausübbar oder nicht …» [Sekundär] |
| **bis 49 %** | FinfraG 135 I | **Opting-up** (Schwelle statutarisch anheben, max. 49 %) | [Sekundär] |
| **(Statutenklausel)** | FinfraG 125 III/135 | **Opting-out** (Befreiung von Angebotspflicht) | [Sekundär] |
| **> 98 % Stimmen** | FinfraG 137 | **Squeeze-out** (Kraftloserklärung Restpapiere nach Übernahmeangebot, kotiert) | «… nach Vollzug … mehr als 98 Prozent der Stimmrechte …» [Sekundär] |
| **≥ 90 %** | FusG 8 II / 18 V | **Squeeze-out-Fusion** (Abfindung statt Anteile) — nicht-FinfraG-Weg | [zu verifizieren, nicht aus Cache] |

**Qualifizierte Mehrheiten — GV-Beschluss-Schwellen** (keine Beteiligungs-,
sondern Beschluss-Schwellen, der Vollständigkeit halber hier, materiell zu A6):

- **Art. 703 (gewöhnlich):** «… mit der Mehrheit der vertretenen
  Aktienstimmen.» (relatives Mehr der vertretenen Stimmen)
- **Art. 704 I (qualifiziert):** «… mindestens **zwei Drittel der vertretenen
  Stimmen und die Mehrheit der vertretenen Aktiennennwerte** …» — **doppeltes
  Quorum** (Stimmen UND Nennwerte!). Katalog **Ziff. 1–16 vollständig** (Cache):
  1 Zweckänderung · 2 Zusammenlegung von Aktien · 3 Kapitalerhöhung aus
  Eigenkapital/Sacheinlage/Verrechnung + besondere Vorteile · 4 Einschränkung/
  Aufhebung Bezugsrecht · 5 bedingtes Kapital / Kapitalband / Vorratskapital ·
  6 Umwandlung PS in Aktien · 7 Beschränkung Übertragbarkeit Namenaktien ·
  8 Stimmrechtsaktien · 9 Währungswechsel AK · 10 Stichentscheid Vorsitz ·
  11 GV im Ausland · 12 Dekotierung · 13 Sitzverlegung · 14 statutarische
  Schiedsklausel · 15 Verzicht unabh. Stimmrechtsvertreter (virtuelle GV,
  nicht kotiert) · 16 Auflösung. (Statuten können höhere Mehrheiten
  festlegen — 704 II; Änderung solcher Klauseln nur mit dem vorgesehenen Mehr.)
- **GmbH-Pendant Art. 808b I:** «… zwei Drittel der vertretenen Stimmen sowie
  die **absolute Mehrheit des gesamten Stammkapitals** …» (anderes Quorum als
  AG: absolute Mehrheit des *gesamten* Kapitals, nicht nur des vertretenen!).

**3) Regelwerk-Skizze.**
- **Eingaben:** Rechtsform (AG/GmbH), kotiert ja/nein, eigene Aktien/Stammanteile
  (Stück oder Nennwertsumme), Total ausgegeben, optional Stimmrechtsaktien
  (Stimmrechte ≠ Kapital → zwei Quoten getrennt führen!).
- **Berechnung:** Quote = `eigene / total` als **gekürzter Bruch** (bruch.ts:
  `br`, `fmtB`, `zahl`). Kapitalquote und Stimmenquote getrennt, weil 697a/699/
  704 «… des Aktienkapitals **oder** der Stimmen» alternativ anknüpfen → es
  genügt das Erreichen *einer* der beiden Grössen.
- **Ausgaben:** Liste der erreichten/verfehlten Schwellen mit Norm-Anker +
  Frist (z. B. Sonderuntersuchung: 3 Mt.) + Warnung kotiert/nicht kotiert.
- **Warnungen:** «oder»-Logik (Kapital *oder* Stimmen) explizit zeigen;
  Hinweis, dass FinfraG-Schwellen nur für kotierte gelten; Opting-out als
  Statutenfrage (nicht aus Beteiligung allein ableitbar).

**4) §2-Beurteilung.** Voll deterministisch (reine Schwellen-/Bruchlogik,
keine Schätzung). **Geeignet.**

**5) Datenbedarf.** Keine kantonalen Parameter. FinfraG-Schwellen als
Stammdaten (SSoT). Keine HReg-Gebühren nötig.

**6) Fallstricke.** «oder»-Verknüpfung Kapital/Stimmen nicht zu «und»
verkürzen. 699 III: nicht kotiert **10 %** (nicht 5 %!) — der Auftrag nannte
«5%/10% Traktandierung 699a/b», das ist zu trennen: **699** = Einberufung
(10 %/5 %), **699b** = Traktandierung (5 %/0,5 %), **699a** = Zugang
Geschäftsbericht 20 Tage (keine Quote). Stimmrechtsaktien (704 I Ziff. 8)
brechen Kapital=Stimmen-Annahme. 704: **doppeltes** Quorum; GmbH 808b: **anderes**
Quorum. Squeeze-out: zwei Wege (FinfraG 98 % vs. FusG 90 %) nicht vermengen.

**7) Aufwand: S.** Hohe Wiederverwendung: `bruch.ts` für Quoten,
Schwellen-Katalog als Stammdaten-Tabelle. Kein Fristen-Datumsrechnen nötig
(Schwellen sind statisch). Output-Muster wie Zuständigkeits-Fahrplan.

---

## A2 — Liberierungsgrad

**1) Nutzerfrage.** «Genügt meine Einzahlung den gesetzlichen Mindestvorgaben
bei Gründung (AG/GmbH)?»

**2) Normbasis.**
- **Art. 621 I:** «Das Aktienkapital beträgt **mindestens 100 000 Franken**.»
- **Art. 632 I:** «Bei der Errichtung … muss die Einlage für **mindestens
  20 Prozent des Nennwertes jeder Aktie** geleistet sein. In allen Fällen
  müssen die geleisteten Einlagen **mindestens 50 000 Franken** betragen.»
  (Abs. 2: Fremdwährungs-AK → Gegenwert mind. CHF 50 000 bei Errichtung.)
- **Art. 633:** Geldeinlagen bei Bank zur ausschliesslichen Verfügung
  hinterlegen; Freigabe erst nach HReg-Eintrag.
- **GmbH Art. 773:** «Das Stammkapital beträgt mindestens **20 000 Franken**.»
- **GmbH Art. 777c I:** «Bei der Gründung muss für jeden Stammanteil eine dem
  **Ausgabebetrag entsprechende Einlage vollständig** geleistet werden.» →
  GmbH = **100 % Liberierung** (keine 20 %-Regel!).

**3) Regelwerk-Skizze.**
- **Eingaben:** Rechtsform; Nennkapital; einbezahlter Betrag; (AG:) Nennwert je
  Aktie + Einzahlung je Aktie ODER aggregierte Liberierungsquote; Währung.
- **Prüfregeln (AG):** (a) AK ≥ 100 000; (b) Einzahlung je Aktie ≥ 20 % des
  Nennwerts; (c) Summe geleisteter Einlagen ≥ 50 000; alle drei müssen erfüllt
  sein. **GmbH:** (a) SK ≥ 20 000; (b) Einzahlung = 100 % des Ausgabebetrags.
- **Ausgaben:** Pro Regel «erfüllt / nicht erfüllt» + fehlender Betrag;
  Liberierungsgrad als Bruch/Prozent.
- **Warnungen:** Sacheinlage/Verrechnungsliberierung (634/634a; GmbH 777c
  i. V. m. Aktienrecht) → muss voll gedeckt sein, Statuten-Angaben nötig;
  Aufstockung später (Art. 634b nachträgliche Leistung) ist kein Gründungsfall.

**4) §2-Beurteilung.** Deterministisch (feste Schwellen + Prozent je Aktie).
**Geeignet.**

**5) Datenbedarf.** Keine kantonalen Parameter; CHF-Schwellen als Stammdaten.
Bei Fremdwährung ist der Umrechnungskurs Nutzereingabe (nicht berechenbar →
§8-Hinweis).

**6) Fallstricke.** **20 % gilt je Aktie, nicht aufs Gesamtkapital** — der CHF-
50 000-Mindestbetrag kann die 20 %-Regel überlagern (bei AK = 100 000 sind
20 % = 20 000, aber 50 000 sind zwingend → faktisch 50 %). GmbH **nie** 20 %
(immer voll). Bankdepot-Pflicht (633) ist Verfahrens-, keine Rechenfrage.

**7) Aufwand: S.** Wiederverwendung: einfache Schwellenprüfung; `bruch.ts`
für Quotenanzeige. Eigenständige kleine Engine (§4).

---

## A3 — Kapitalverlust (Art. 725a, rev. 2023)

**1) Nutzerfrage.** «Liegt ein Kapitalverlust vor (Pflicht des VR zu
Sanierungsmassnahmen + ggf. eingeschränkte Revision)?»

**2) Normbasis — Art. 725a I (verbatim):** «Zeigt die letzte Jahresrechnung,
dass die **Aktiven abzüglich der Verbindlichkeiten** die **Hälfte der Summe
aus Aktienkapital, nicht an die Aktionäre zurückzahlbarer gesetzlicher
Kapitalreserve und gesetzlicher Gewinnreserve** nicht mehr decken, so ergreift
der Verwaltungsrat Massnahmen zur Beseitigung des Kapitalverlusts.»
- Abs. 2: ohne Revisionsstelle → letzte JR vor GV-Genehmigung eingeschränkter
  Revision durch zugelassenen Revisor unterziehen (VR ernennt ihn).
- Abs. 3: Revisionspflicht entfällt bei Gesuch um Nachlassstundung.
- Begriffe **gesetzliche Kapital-/Gewinnreserve**: Art. 671 / 672.
- GmbH: **Art. 820** erklärt 725a sinngemäss anwendbar (Stammkapital).

**3) Regelwerk-Skizze (mit Bilanz-Eingabemaske + Formel + Beispiel).**

- **Eingabemaske (Bilanzgrössen aus letzter Jahresrechnung):**
  - Aktiven gesamt `A`
  - Fremdkapital / Verbindlichkeiten `FK`
  - Aktienkapital (HReg) `AK`
  - gesetzliche Kapitalreserve, **soweit nicht an Aktionäre rückzahlbar** `gKR`
  - gesetzliche Gewinnreserve `gGR`
- **Formel:**
  - Eigenkapital-Deckung: `EK = A − FK`
  - Geschützte Hälfte: `S = (AK + gKR + gGR) / 2`
  - **Kapitalverlust, wenn `EK < S`** (Wortlaut: «… nicht mehr decken»).
  - Fehlbetrag: `S − EK` (Betrag, der zur Beseitigung mindestens fehlt).
- **Beispielrechnung:** AK = 100 000, gKR = 0, gGR = 10 000, A = 140 000,
  FK = 85 000. → `EK = 55 000`; `S = (110 000)/2 = 55 000`. `EK (55 000)` ist
  **nicht < 55 000** → **kein** Kapitalverlust (Grenzfall, exakt gedeckt).
  Sinkt A auf 139 000 → `EK = 54 000 < 55 000` → **Kapitalverlust**, Fehlbetrag
  1 000; VR muss Massnahmen ergreifen, ohne Revisionsstelle zudem eingeschränkte
  Revision (725a II).
- **Ausgaben:** Status (Kapitalverlust ja/nein), Fehlbetrag, Pflichten-Liste
  (Massnahmen 725a I; Revision 725a II falls keine RS; Hinweis 725c Aufwertung
  Grundstücke/Beteiligungen als Sanierungshebel).
- **Warnungen:** Aufwertungsreserve (725c) und eigene-Aktien-Reserve (659b)
  bei der Reserve-Erfassung **nicht** einrechnen (671 IV; Auslegung 725a →
  TODO). «nicht rückzahlbare» Kapitalreserve = Differenzierung nötig.

**4) §2-Beurteilung.** Voll deterministisch (eine Bilanz-Ungleichung).
**Sehr geeignet** — Paradebeispiel «feste Rechenregel».

**5) Datenbedarf.** Keine kantonalen Parameter. Nur Bilanzeingaben des
Nutzers; keine Stammdaten ausser den Normtexten.

**6) Fallstricke.** **Stille Reserven** zählen nicht (massgebend ist die
*bilanzielle* JR, nicht der Verkehrswert) → §8-Hinweis. «nicht an Aktionäre
zurückzahlbare» gesetzliche Kapitalreserve (671 II/IV): rückzahlbare Teile
**nicht** in die geschützte Summe. Grenzfall `EK = S` ist **kein** Verlust
(Wortlaut «nicht mehr decken» = strikt darunter). Abgrenzung zu 725
(Zahlungsfähigkeit) und 725b (Überschuldung) — drei verschiedene Tatbestände.

**7) Aufwand: M.** Bilanz-Eingabemaske + Validierung. Wiederverwendung der
Maske mit A4 (Überschuldung) — gemeinsame Bilanz-Komponente in der
Darstellungsschicht, **getrennte** Engines (§4). Keine Datumslogik.

---

## A4 — Überschuldung (Art. 725b, rev. 2023)

**1) Nutzerfrage.** «Ist die Gesellschaft überschuldet — muss der VR das
Gericht benachrichtigen, oder greift eine Ausnahme (Rangrücktritt /
90-Tage-Toleranz)?»

**2) Normbasis — Art. 725b (verbatim, gekürzt):** «Besteht **begründete
Besorgnis**, dass die Verbindlichkeiten … nicht mehr durch die Aktiven gedeckt
sind, so erstellt der Verwaltungsrat **unverzüglich je einen Zwischenabschluss
zu Fortführungs- und zu Veräusserungswerten**.» (Verzicht auf
Veräusserungswerte zulässig, wenn Fortführung gegeben und FW-Abschluss keine
Überschuldung zeigt; ist Fortführung nicht gegeben, genügt der
Veräusserungs-Abschluss.) Prüfung durch Revisionsstelle / zugel. Revisor.
- **Abs. 3:** «Ist die Gesellschaft gemäss den **beiden** Zwischenabschlüssen
  überschuldet, so benachrichtigt der Verwaltungsrat das Gericht.» (Konkurs
  oder Verfahren nach Art. 173a SchKG.)
- **Abs. 4 — Benachrichtigung kann unterbleiben:**
  - **Ziff. 1 (Rangrücktritt):** «wenn Gesellschaftsgläubiger im Ausmass der
    Überschuldung im Rang hinter alle anderen Gläubiger zurücktreten und ihre
    Forderungen stunden, sofern der Rangrücktritt den **geschuldeten Betrag und
    die Zinsforderungen während der Dauer der Überschuldung** umfasst;»
  - **Ziff. 2 (90-Tage-Toleranz):** «solange begründete Aussicht besteht, dass
    die Überschuldung innert angemessener Frist, **spätestens aber 90 Tage nach
    Vorliegen der geprüften Zwischenabschlüsse**, behoben werden kann und dass
    die Forderungen der Gläubiger nicht zusätzlich gefährdet werden.»
- GmbH: **Art. 820** erklärt 725b sinngemäss anwendbar.

**3) Regelwerk-Skizze (Bilanz-Eingabemaske + Formel + Beispiel).**
- **Eingabemaske:** Aktiven zu Fortführungswerten `A_FW`, Aktiven zu
  Veräusserungswerten `A_VW`, Verbindlichkeiten `FK`; davon im Rang
  zurückgetretene Forderungen `RR` (inkl. Zinsen-Deckung ja/nein); Datum der
  geprüften Zwischenabschlüsse `d0` (für 90-Tage-Frist).
- **Formel:** Überschuldung in einem Abschluss, wenn `FK > A` (bzw. nach
  Wortlaut: Verbindlichkeiten nicht mehr durch Aktiven gedeckt).
  - Bereinigt um Rangrücktritt: maßgeblich ist Überschuldung **trotz**
    Rangrücktritt → `FK − RR > A` (Rangrücktritt im Ausmass der Überschuldung).
  - **Benachrichtigungspflicht** nur, wenn **beide** Abschlüsse Überschuldung
    zeigen (`FK > A_FW` **und** `FK > A_VW`) — bzuvor Rangrücktritt abziehen.
  - **Aufschub:** wenn 725b IV Ziff. 1 (RR deckt Betrag + Zinsen für Dauer der
    Überschuldung) **oder** Ziff. 2 (Sanierungsaussicht, Frist `d0 + 90 Tage`).
- **Beispiel:** FK = 200 000, A_FW = 180 000, A_VW = 150 000 → beide
  überschuldet (Differenz 20 000 bzw. 50 000). Treten Gläubiger mit RR ≥ 50 000
  (inkl. Zinsen) zurück → `FK − RR = 150 000 ≤ A_VW` → Benachrichtigung kann
  unterbleiben (Ziff. 1). Ohne RR, aber mit Sanierungsaussicht: Frist läuft bis
  `d0 + 90 Tage` (datumsbasiert → **fristenEngine**).
- **Ausgaben:** Status (Überschuldung FW / VW), Benachrichtigungspflicht
  ja/nein, anwendbare Ausnahme, Ablaufdatum 90-Tage-Toleranz.
- **Warnungen:** «begründete Besorgnis» ist Auslöser der *Erstellungspflicht*,
  nicht der Benachrichtigung — Engine kann nur die *Abschluss*-Lage rechnen,
  nicht die Besorgnis beurteilen (§8). RR muss Betrag **und Zinsen für die
  Dauer der Überschuldung** umfassen, sonst unwirksam (häufiger Fehler).

**4) §2-Beurteilung.** Bilanz-Ungleichungen + 90-Tage-Frist deterministisch.
«Begründete Besorgnis» / «angemessene Frist» sind unbestimmt → **nur Teilbereich
geeignet** (rechenbare Lage + Fristberechnung; die Tatbestands-Schwelle
«Besorgnis» bleibt Nutzer-/Anwalts-Einschätzung, klar offenlegen).

**5) Datenbedarf.** Keine kantonalen Parameter. 90-Tage-Frist über
fristenEngine (Kalendertage ab `d0`).

**6) Fallstricke.** **Beide** Abschlüsse müssen Überschuldung zeigen (Abs. 3),
nicht nur einer — bei gegebener Fortführung kann der VW-Abschluss entfallen
(Abs. 1). **Rangrücktritt** nur wirksam mit Zins-Deckung für die Dauer (Abs. 4
Ziff. 1) — und nur «im Ausmass der Überschuldung». 90 Tage zählen ab **Vorliegen
der geprüften** Zwischenabschlüsse, nicht ab Bilanzstichtag. Verhältnis zu
725a (Kapitalverlust) und 725 (Zahlungsunfähigkeit): Eskalationsstufen, nicht
austauschbar. Art. 757 IV: zurückgetretene Forderungen werden bei der
*Schadensberechnung* nicht einbezogen — separater Kontext.

**7) Aufwand: M.** Wiederverwendung: Bilanz-Maske mit A3 (Darstellung),
fristenEngine für 90 Tage. **Getrennte** Engine (§4).

---

## A5 — Kapitalerhöhung (ordentlich / Kapitalband / bedingt)

**1) Nutzerfrage.** «Welche Form der Kapitalerhöhung passt, welche Fristen und
Beschlussquoren gelten, halte ich die Grenzen ein?»

**2) Normbasis.**
- **Ordentlich Art. 650:** GV beschliesst; Beschluss **öffentlich beurkundet**;
  Inhalt Ziff. 1–10. **Abs. 3:** «Die Kapitalerhöhung muss **innerhalb von
  sechs Monaten** nach dem Beschluss … beim Handelsregisteramt zur Eintragung
  angemeldet werden; sonst fällt der Beschluss dahin.» (Beschlussquorum:
  Sacheinlage/Verrechnung/Eigenkapital + besondere Vorteile → 704 I Ziff. 3
  qualifiziert; reine Bareinlage mit Bezugsrecht → 703 einfaches Mehr.)
- **Bezugsrecht Art. 652b:** jeder Aktionär anteilig; Einschränkung/Aufhebung
  nur aus wichtigen Gründen (Beispiele: Unternehmensübernahme,
  Arbeitnehmerbeteiligung); keine unsachliche Begünstigung.
- **Kapitalband Art. 653s–653v:** Statuten ermächtigen VR für **längstens
  5 Jahre**, AK innerhalb einer **Bandbreite** zu verändern. **Obere Grenze
  höchstens +½, untere Grenze höchstens −½** des eingetragenen AK (653s II/III).
  Herabsetzungsermächtigung nur, wenn nicht auf eingeschränkte Revision
  verzichtet (653s V). Statuteninhalt 653t. Einführung = 704 I Ziff. 5
  (qualifiziert).
- **Bedingtes Kapital Art. 653:** Wandel-/Optionsrechte; AK erhöht sich «ohne
  Weiteres», sobald Rechte ausgeübt + Einlage geleistet. Einführung = 704 I
  Ziff. 5 (qualifiziert). (Schranken 653a ff.)
- **GmbH Art. 781:** Erhöhung Stammkapital durch Gesellschafterversammlung;
  «innerhalb von **sechs Monaten** … zur Eintragung angemeldet …; sonst fällt
  der Beschluss dahin» (Abs. 5). Aktienrecht-Regeln sinngemäss. Quorum 808b I
  Ziff. 5.

**3) Regelwerk-Skizze.**
- **Eingaben:** Erhöhungsart; Beschlussdatum (für 6-Monats-Frist); aktuelles AK;
  bei Kapitalband: gewünschte obere/untere Grenze; Liberierungsart.
- **Berechnung/Prüfung:**
  - Ordentlich/GmbH: Frist `Beschluss + 6 Monate` (fristenEngine) → Verfallsdatum.
  - Kapitalband: `obere ≤ AK × 1,5`, `untere ≥ AK × 0,5`, Laufzeit ≤ 5 Jahre.
  - Quorum-Hinweis abhängig von Liberierungsart (703 vs. 704 I Ziff. 3/5).
- **Ausgaben:** anwendbare Form, Frist-Verfallsdatum, Bandgrenzen-Check,
  erforderliches Quorum, Beurkundungspflicht.
- **Warnungen:** 6-Monats-Frist ist **Verwirkung** («fällt dahin»);
  Beurkundung (650 II / 653u IV) → §8-Exportsperre (kein fertiges Dokument).

**4) §2-Beurteilung.** Fristen + Bandgrenzen + Quorum-Zuordnung deterministisch.
Die *Wahl* der richtigen Form ist regelbasiert führbar (Entscheidbaum).
**Geeignet** (als Prüf-/Fristenrechner, nicht als Beurkundungs-Generator).

**5) Datenbedarf.** Keine kantonalen Parameter. **HReg-Gebühren** wären
optional (eidg. Gebührenverordnung HRegV/GebV-HReg) — separat zu recherchieren,
nicht zwingend für die Rechtslogik.

**6) Fallstricke.** 6-Monats-Frist ist Verwirkung, nicht bloss Ordnungsfrist.
Kapitalband ±½ bezieht sich auf das **eingetragene** AK im Zeitpunkt der
Einführung; GV-Beschluss zu Erhöhung/Herabsetzung/Währungswechsel lässt das
Band dahinfallen (653v I). Quorum hängt von der Liberierungsart ab (Bareinlage
mit Bezugsrecht ≠ Sacheinlage). Bedingtes Kapital: keine «Frist», sondern
automatische Erhöhung bei Ausübung.

**7) Aufwand: M–L.** Wiederverwendung: fristenEngine (6 Mt.), Quoten via
bruch.ts, Entscheidbaum-Muster wie Zuständigkeit. L, falls Beurkundungs-
Vorbereitung (Checkliste) ergänzt wird.

---

## A6 — Anfechtung / Nichtigkeit von GV-Beschlüssen

**1) Nutzerfrage.** «Kann ich diesen GV-Beschluss anfechten — und habe ich die
Frist gewahrt? Oder ist er gar nichtig (keine Frist)?»

**2) Normbasis.**
- **Anfechtung Art. 706 I:** «Der Verwaltungsrat und **jeder Aktionär** können
  Beschlüsse der Generalversammlung, die gegen das Gesetz oder die Statuten
  verstossen, beim Gericht mit Klage gegen die Gesellschaft anfechten.»
  (Abs. 2 Ziff. 1–4: typische Anfechtungsgründe — Entzug/Beschränkung von
  Aktionärsrechten, unsachliche Beschränkung, ungerechtfertigte
  Ungleichbehandlung, Aufhebung der Gewinnstrebigkeit ohne Allzustimmung.)
- **Frist Art. 706a I (verbatim):** «Das Anfechtungsrecht **erlischt**, wenn die
  Klage **nicht spätestens zwei Monate nach der Generalversammlung** angehoben
  wird.» → **Verwirkungsfrist 2 Monate** ab GV.
- **Nichtigkeit Art. 706b:** «**Nichtig** sind insbesondere Beschlüsse …, die:
  1. … zwingend gewährte Rechte des Aktionärs (Teilnahme, Mindeststimmrecht,
  Klagerechte) entziehen/beschränken; 2. Kontrollrechte über das zulässige Mass
  hinaus beschränken; 3. die Grundstrukturen der AG missachten oder den
  Kapitalschutz verletzen.» → **keine Frist** (jederzeit, von jedermann mit
  Interesse geltend zu machen).
- GmbH: Anfechtung sinngemäss (Verweisnorm im GmbH-Recht auf Aktienrecht;
  Quorumskatalog 808b).

**3) Regelwerk-Skizze.**
- **Eingaben:** GV-Datum; (optional) Beschlusstyp/Mangelart zur Einordnung
  Anfechtung vs. Nichtigkeit; Klägerstellung (Aktionär/VR).
- **Berechnung:** Verwirkungsfrist `GV-Datum + 2 Monate` (fristenEngine,
  Monatsfrist; Wochenend-/Feiertags-Ultimo nach allgemeiner Fristenregel
  prüfen). Nichtigkeit → keine Frist, Hinweis.
- **Ausgaben:** Fristende Anfechtung, Status (gewahrt/verwirkt), Abgrenzung
  Anfechtung/Nichtigkeit, Klage gegen die **Gesellschaft** (Passivlegitimation),
  Wirkung erga omnes (706 V).
- **Warnungen:** Einordnung Anfechtung↔Nichtigkeit ist juristische Wertung →
  Engine bietet Einordnungshilfe, keine verbindliche Qualifikation (§8).

**4) §2-Beurteilung.** **2-Monats-Frist** rein deterministisch (fristenEngine).
Die Qualifikation anfechtbar/nichtig ist wertend → Fristenteil **geeignet**,
Qualifikation nur als Hinweis.

**5) Datenbedarf.** Keine kantonalen Parameter. Allgemeine Fristenregeln
(Monatsfrist, Ultimo) aus vorhandener Fristen-Infrastruktur.

**6) Fallstricke.** **2 Monate** (706a) — nicht mit anderen Fristen verwechseln
(697b: 30 Tage Auskunft/Einsicht-Klage; 697d: 3 Monate Sonderuntersuchung;
699 III: 60 Tage Gerichts-Einberufung; 697c II: 30 Tage). Verwirkung, nicht
Verjährung (keine Unterbrechung/Stillstand). Nichtigkeit kennt **keine** Frist.
Klage gegen die **Gesellschaft**, nicht gegen die Aktionäre.

**7) Aufwand: S.** Wiederverwendung: fristenEngine (Monatsfrist) — wie
zpoFristen/erbrecht-Klagefristen. Kleine eigenständige Engine.

---

## A7 — Verantwortlichkeits- und Einberufungsfristen

**1) Nutzerfrage.** «Welche gesellschaftsrechtlichen Fristen laufen — und ist
mein Verantwortlichkeitsanspruch (754 ff.) noch nicht verjährt?»

**2) Normbasis.**
- **Verantwortlichkeit Art. 754 I:** VR-Mitglieder und mit Geschäftsführung/
  Liquidation Befasste haften «sowohl der Gesellschaft als den einzelnen
  Aktionären und Gesellschaftsgläubigern für den Schaden … durch absichtliche
  oder fahrlässige Verletzung ihrer Pflichten».
- **Verjährung Art. 760 (rev. Verjährungsrecht 2020 + Aktienrecht 2023):**
  «… verjährt in **drei Jahren** von dem Tag an, an dem der Geschädigte
  **Kenntnis vom Schaden und von der Person des Ersatzpflichtigen** erlangt hat,
  jedenfalls aber mit dem Ablauf von **zehn Jahren**, vom Tage an gerechnet, an
  welchem das schädigende Verhalten erfolgte oder aufhörte.» **Abs. 1bis:** Frist
  **steht still** während Verfahren auf Anordnung + Durchführung einer
  Sonderuntersuchung. **Abs. 2:** bei strafbarer Handlung → mind. strafrechtliche
  Verfolgungsverjährung (mind. 3 Jahre ab erstinstanzl. Urteil).
- **Einberufung GV Art. 700 I:** «… mindestens **20 Tage** vor dem
  Versammlungstag mit.» (Zugang Geschäftsbericht Art. 699a: ebenfalls **20 Tage**
  vorher.) **Gerichtliche Einberufung Art. 699 IV:** wenn VR nicht «innert
  angemessener Frist, längstens aber **innert 60 Tagen**» handelt.
- Zirkular-/elektronische Beschlüsse: GV Art. 701 II/III; VR Art. 713.

> **Auftrags-Korrektur (§7):** Der Auftrag nannte «699 Abs. 3: 20 Tage
> Einberufung». Im Cache (rev. 2023) regelt **Art. 700 I** die 20-Tage-
> Einladungsfrist; **Art. 699 III** enthält die Beteiligungsschwellen (5 %/10 %)
> für das Einberufungs**begehren**, **699 IV** die 60-Tage-Frist bis zum
> Gerichtsantrag. Engine entsprechend dem Cache-Wortlaut bauen.

**3) Regelwerk-Skizze.**
- **Eingaben:** Frist-Typ (Verjährung 754/760 | Einladung 700 | Gerichts-
  Einberufung 699 IV); Anknüpfungsdatum (Kenntnis / schädigendes Verhalten /
  geplanter GV-Termin / Begehrensdatum); ggf. Sonderuntersuchungs-Zeitraum
  (Stillstand 760 I bis).
- **Berechnung (fristenEngine):** relative Frist 3 J. ab Kenntnis; absolute
  10 J. ab Verhalten — **massgebend ist die zuerst ablaufende** (Verwirkung
  der absoluten). 20-Tage-Einladung rückwärts vom GV-Termin. 60 Tage ab
  Begehren. Stillstand: Sonderuntersuchungs-Dauer addieren.
- **Ausgaben:** Verjährungs-/Fristdaten, ob noch offen, Hinweis auf
  Strafverjährungs-Vorbehalt (760 II).
- **Warnungen:** Doppelfrist (relativ/absolut) — beide anzeigen; Stillstand nur
  bei Sonderuntersuchung; Strafvorbehalt nur bei strafbarem Verhalten.

**4) §2-Beurteilung.** Datumsarithmetik (3/10 J., 20/60 Tage) deterministisch.
**Geeignet.** Der Stillstand 760 I bis ist rechenbar, sobald die
Sonderuntersuchungs-Daten als Eingabe vorliegen.

**5) Datenbedarf.** Keine kantonalen Parameter. Allgemeine
Verjährungs-/Fristmechanik (verjaehrung.ts-Muster, fristenEngine).

**6) Fallstricke.** **3/10 Jahre** ist die rev. Fassung (vor 2020: 5/10) —
Übergangsrecht am schädigenden Verhalten/Kenntniszeitpunkt prüfen
[zu verifizieren]. Relative vs. absolute Frist: zuerst ablaufende gilt.
Stillstand nur Sonderuntersuchung (nicht jede Klage). 700/699 nicht verwechseln
(Einladung vs. Begehren vs. Gerichtsantrag). Verjährung ≠ Anfechtungs-
Verwirkung (706a, 2 Mt.).

**7) Aufwand: M.** Hohe Wiederverwendung: verjaehrung.ts-Muster (relativ/absolut)
+ fristenEngine. Doppelfrist-Logik existiert konzeptuell bereits.

---

# TEIL B — VORLAGEN (nur Skizze; §8-Exportsperre beachten)

> Gemeinsamer Vorbehalt: Gründungen (629/777) und mehrere Kapitalbeschlüsse
> verlangen **öffentliche Beurkundung** → nach §8 **keine** fertigen Export-
> Dokumente, nur **Vorbereitung + Checkliste**. Statuten/Protokolle ohne
> Beurkundungszwang können als Gerüst über die Vorlagen-Engine laufen.

- **Statuten AG — Mindestinhalt Art. 626 I:** 1. Firma + Sitz; 2. Zweck;
  3. Höhe + Währung AK + geleistete Einlagen; 4. Anzahl/Nennwert/Art der Aktien;
  7. Form der Mitteilungen. (Ziff. 5/6 aufgehoben; Abs. 2 = Zusatzinhalt nur
  für **kotierte** Gesellschaften.) **Der frühere «fakultative Inhalt» Art. 627
  ist mit der Revision 2023 aufgehoben** (Cache: «NOT FOUND» / im 626-Block) —
  Auftrag «627 rev.» entsprechend **korrigieren**. → Gerüst möglich.
- **Statuten GmbH — Mindestinhalt Art. 776:** 1. Firma + Sitz; 2. Zweck;
  3. Höhe Stammkapital + Anzahl/Nennwert Stammanteile; 4. Form der Mitteilungen.
  **Art. 776a ist aufgehoben** (rev. 2023) — Auftrag «776a» korrigieren.
  → Gerüst möglich.
- **GV-Protokoll (Form Art. 701 II/III):** Universalversammlung; Zirkular-/
  elektronische Beschlüsse auf Papier oder elektronisch zulässig, sofern kein
  Aktionär mündliche Beratung verlangt → Gerüst möglich.
- **VR-Beschluss-Protokoll (Art. 713):** Mehrheit der abgegebenen Stimmen;
  Beschlüsse an Sitzung, elektronisch (701c–701e sinngemäss) oder schriftlich
  (Papier/elektronisch); bei elektronischem Weg keine Unterschrift nötig;
  Protokollpflicht (Vorsitz + Protokollführer) → Gerüst möglich.
- **Gründung AG/GmbH (629/777):** öffentliche Urkunde zwingend → **nur**
  Vorbereitungs-Checkliste (Zeichnung, Liberierungsnachweis 632/777c,
  Sacheinlage-Belege 634/634a, Organbestellung), **kein** Export (§8).

---

# TEIL C — Bau-Reihenfolge + Wiederverwendung

**Priorisierte Bau-Reihenfolge** (Korrektheits-Hebel × geringer Aufwand):

1. **A3 Kapitalverlust (725a)** — M, höchster Nutzen, reine Bilanz-Ungleichung,
   Paradebeispiel §2. Liefert die Bilanz-Eingabemaske für A4.
2. **A4 Überschuldung (725b)** — M, baut auf A3-Maske; fristenEngine für 90 Tage.
3. **A2 Liberierungsgrad** — S, schnell, abgeschlossene Schwellenprüfung.
4. **A1 Quoten + Schwellen** — S, bruch.ts + Schwellen-Stammdaten; FinfraG-TODO.
5. **A6 Anfechtung/Nichtigkeit (706a 2 Mt.)** — S, fristenEngine-Monatsfrist.
6. **A7 Verantwortlichkeits-/Einberufungsfristen** — M, verjaehrung.ts-Muster.
7. **A5 Kapitalerhöhung** — M–L, mehrere Formen + Entscheidbaum; zuletzt.
8. **Teil B Vorlagen** — nur beurkundungsfreie Gerüste; nach Vorlagen-Engine-Bedarf.

**Wiederverwendung bestehender Bausteine (§4/§10):**
- `src/lib/bruch.ts` → alle Quoten (A1, A2, Liberierungsgrad-Anzeige).
- `src/lib/fristenEngine.ts` → 90 Tage (A4), 6 Mt. (A5), 2 Mt. (A6),
  20/60 Tage (A7).
- `src/lib/verjaehrung.ts`-Muster → Doppelfrist 3/10 J. (A7/760).
- Bilanz-Eingabemaske → gemeinsame **Darstellungs**-Komponente A3+A4
  (Logik bleibt **getrennt**, §4).
- `vorlagen/engine.ts` → Statuten-/Protokoll-Gerüste (Teil B).
- Schwellen-Katalog (A1) → Stammdaten-Tabelle als SSoT (§5), wie
  Zuständigkeits-/Behörden-Stammdaten.

**Auftrags-Korrekturen offengelegt (§7):** (1) 627 (fakult. Statuteninhalt) und
776a sind **aufgehoben** (rev. 2023) — nicht «rev.», sondern gestrichen.
(2) 20-Tage-Einladung steht in **700 I**, nicht 699 III; 699 III = Schwellen,
699 IV = 60 Tage. (3) Traktandierung 699b = **5 %/0,5 %**, Einberufung 699 =
**10 %/5 %** (nicht kotiert/kotiert) — sauber trennen. (4) FinfraG: Pflichtangebot
**33⅓ %** (135), Opting-up **bis 49 %**, Squeeze-out **>98 %** (137);
FusG-Squeeze-out **90 %** ist ein **anderer** Weg.
