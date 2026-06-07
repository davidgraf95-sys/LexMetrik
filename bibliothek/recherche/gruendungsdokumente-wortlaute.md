# Gründungsdokumente GmbH + AG — Wortlaut-Dossier (Statuten-Bausteine, Zeichnung, Erklärungen, Urkunde, Anmeldung)

**Erstellt:** 7.6.2026 (Auftrag David: Plan 9b «Ausbaustufe Gründung» — Volldokumente
statt Checkliste, GmbH zuerst, danach AG; **Zusatzanweisung 7.6.2026: Statuten
müssen dem NEUSTEN Recht entsprechen** — Rechtsstand-Verifikation ist harte
Anforderung, siehe Teil 0). · **Baut auf:**
[gesellschaftsgruendung.md](gesellschaftsgruendung.md) (Beleg-Listen 43/71 HRegV)
· [gmbh-gruendung.md](gmbh-gruendung.md) (Klausel-Tabelle 1.2, Teil 3a = Auftrag)
· [ag-gruendung.md](ag-gruendung.md) (AG-Klauseln 1.2, Praxis Teil 2).

**Recherche:** 4 parallele Muster-Sweeps (EHRA · ZH · SG/GL · Zeichnungs-/
Erklärungs-/Anmeldungs-Muster), alle Dokumente lokal geparst
(dauerhaft archiviert: [`bibliothek/muster/`](../muster/MANIFEST.md)); Norm-Kerne verbatim am
Fedlex-Cache gezogen (`/tmp/gruendung-normen-extrakt.txt` + `…-extrakt2.txt`,
OR @ **1.1.2026**, HRegV @ 1.1.2025 — `scripts/fedlex-cache.sh`).

**Status: ERSTRECHERCHE (Norm-Kerne zweifach: Cache + Muster-Konvergenz).**
Fachliche Abnahme David ausstehend (§7). `verified:false` für alle daraus
gebauten Bausteine bis Wort-für-Wort-Durchgang.

---

# TEIL 0 — RECHTSSTAND-VERIFIKATION (Anweisung David 7.6.2026)

**Bindende Regel für den Bau:** Massgeblich ist der **OR-Cache 1.1.2026**,
nie das Muster. Muster liefern Formulierungs-Usanz; jede Klausel wird gegen
die Sachnorm geprüft. Abweichungen vom Muster werden im Baustein-Kommentar
offengelegt.

## 0.1 Delta-Tabelle: Muster vs. geltendes Recht

| Muster | Befund | Folge für LexMetrik |
|---|---|---|
| **EHRA GmbH 1.4.2017** (einziges Bundes-Muster; AG-Muster existiert beim EHRA NICHT — verifiziert via 404-Proben + Archiv-Seite) | Zitiert **Art. 776a OR (aufgehoben 1.1.2023)**; Beispiel-Nennwert «CHF 100» (überholt: 774 I rev. = «grösser als null»); Stand vor Revision (keine virtuelle GV, kein 808b-Ziff.-6bis/10bis-Katalog); Art. 35 zitiert 783 a. F. | Nur als Gliederungs-/Formulierungs-Referenz; **keine Klausel ungeprüft übernehmen** |
| **ZH-Suite 26.7.2024** (HRegA; statuten kurz/lang GmbH+AG, Urkunden, Erklärungen) | post-Revision: virtuelle/hybride GV, Kapitalband-Ziffer, Schiedsklausel-Ziffer, Stimmrechtsvertreter-Verzicht — alles geltendes Recht | **Primär-Referenz** für Wortlaute |
| **SG-Suite (Ordner «…änderung2023»)** | post-Revision, wie ZH; Abweichung: Schiedsgutachter-Ersatzbestimmung durch «Präsident des **Handelsgerichts**» (ZH/GL/EHRA: **Obergericht**) | kantonsneutrale Formulierung wählen, Abweichung offenlegen (0.3) |
| **GL-Suite** | post-Revision, weitgehend wortgleich SG/ZH | Konvergenz-Beleg |

## 0.2 §7-Korrektur an der eigenen Bibliothek

[gmbh-gruendung.md](gmbh-gruendung.md) Teil 1.3 behauptet, die EHRA-Muster
zitierten «Art. 776a/**806b a. F.**». **Falsch für 806b: Art. 806b OR ist
GELTENDES Recht** (Cache 1.1.2026 verbatim: «Im Falle der Nutzniessung an
einem Stammanteil stehen das Stimmrecht und die damit zusammenhängenden
Rechte dem Nutzniesser zu. …»). Auch ZH/GL-Muster 2024 zitieren ihn korrekt.
Aufgehoben ist nur 776a. → Notiz dort korrigiert (gleicher Commit).

## 0.3 Revisions-Checkliste je Statuten-Thema (alle am Cache verifiziert)

1. **Mindestinhalt GmbH = 4 Ziffern** (776: Firma+Sitz · Zweck · Stammkapital
   mit Anzahl/Nennwert · **Form der Mitteilungen**); AG = 626 Abs. 1
   Ziff. 1–4 + 7 (zusätzlich **«Höhe UND WÄHRUNG»** des AK **«sowie den
   Betrag der darauf geleisteten Einlagen»**; Ziff. 5/6 aufgehoben).
2. **Nennwert «grösser als null»** (774 I / 622 IV) — keine 100er-/1-Rappen-
   Mindestgrenzen behaupten.
3. **Opting-out bei Gründung:** Feststellungen direkt in der Urkunde
   (44 lit. f / 72 lit. g HRegV «Verzicht auf eine Revision»); 727a II
   Satz 2 + IIbis (in Kraft **1.1.2025**) betreffen den NACHTRÄGLICHEN
   Verzicht (nur künftige Geschäftsjahre, Anmeldung vor Geschäftsjahresbeginn,
   Beilage letzte Jahresrechnung) — ZH-KMU-Merkblatt: «Bei einer Gründung ist
   nur die Erklärung gemäss Ziffer 2 erforderlich, welche üblicherweise in
   die öffentliche Urkunde integriert wird.»
4. **Virtuelle/hybride GV** statutarisch möglich (701d; GmbH via 805 Abs. 5
   Ziff. 2bis); nicht kotiert: Statuten können Verzicht auf den unabhängigen
   Stimmrechtsvertreter vorsehen — ABER EHRA-PM 1/23: genereller
   statutarischer Verzicht unzulässig, nur Ermächtigung an VR/GF im
   Einzelfall (ZH-Wortlaut bildet genau das ab).
5. **Qualifizierte Beschlüsse:** GmbH-Katalog 808b I (inkl. **Ziff. 6bis
   Währungswechsel, Ziff. 10bis Schiedsklausel**); AG 704 (Kapitalband,
   Stimmrechtsvertreter-Verzicht etc. — ZH/SG/GL-Kataloge decken sich).
6. **Einberufungsfrist 20 Tage** (700 I; GmbH 805 III: Statuten können
   verlängern oder **bis auf 10 Tage verkürzen**).
7. **SHAB-Klausel** («Publikationsorgan ist das SHAB») ist zulässig, aber
   nicht Pflichtinhalt; Pflicht ist die **Form der Mitteilungen** (776
   Ziff. 4 / 626 Ziff. 7). Haus-Baustein: «per Brief oder E-Mail an die im
   Anteilbuch/Aktienbuch verzeichneten Adressen» (ZH/SG konvergent).
8. **Stichentscheid:** GmbH-GV: Vorsitzender hat Stichentscheid, Statuten
   können abweichen (808a); AG-GV: **kein gesetzlicher Stichentscheid**
   (703 — GL-Muster ergänzt ihn statutarisch, SG nicht: beides zulässig,
   als Option führen).

# TEIL 1 — Statuten-Baustein-Katalog GmbH (Engine-fertig)

Jeder Baustein: deterministische includeIf-Weiche · Norm @ Cache 1.1.2026 ·
Wortlaut an ZH/SG/GL-Konvergenz ausgerichtet. Stammquelle Wortlaut:
`zh-gmbh-statuten-lang.txt` / `-kurz.txt`, `sg-gmbh-langversion.txt`,
`gl-gmbh-statuten-lang.txt`.

## 1.1 Pflicht-Bausteine (immer; Art. 776 OR)

| # | Baustein | Wortlaut-Kern (Muster-konvergent) | Norm |
|---|---|---|---|
| S1 | Firma/Sitz | «Unter der Firma {{firma}} GmbH besteht mit Sitz in {{sitz}} auf unbestimmte Dauer eine Gesellschaft mit beschränkter Haftung gemäss Art. 772 ff. OR.» (SG-Fassung; ZH/GL/EHRA trennen Firma/Sitz in 2 Artikel — Kurzform gewählt) | 776 Ziff. 1; 772 |
| S2 | Zweck | «Die Gesellschaft bezweckt {{zweck}}.» + optionale Erweiterungsklausel (Zweigniederlassungen, Beteiligungen, Grundeigentum, Finanzierungen; ZH-Wortlaut) | 776 Ziff. 2 |
| S3 | Stammkapital | «Das Stammkapital beträgt CHF {{stammkapital}}. Es ist eingeteilt in {{anzahl}} Stammanteile zu CHF {{nennwert}}.» — Fremdwährungs-Variante: Währungs-Platzhalter statt CHF (773 II; Anhang 3 HRegV: GBP/EUR/USD/JPY) | 776 Ziff. 3; 773; 774 |
| S4 | Mitteilungen | «Die Mitteilungen der Gesellschaft an die Gesellschafter erfolgen per Brief oder E-Mail an die im Anteilbuch verzeichneten Adressen.» | 776 Ziff. 4 |

## 1.2 Bedingte Bausteine (nur wirksam mit Statutenklausel — Weiche je Klausel)

| # | Baustein (Weiche) | Wortlaut-Kern | Norm (Cache-Kern) |
|---|---|---|---|
| S10 | Nachschusspflicht | «Die Gesellschafter sind zur Leistung von Nachschüssen verpflichtet. Der Betrag der mit einem Stammanteil verbundenen Nachschusspflicht beträgt CHF {{nachschussBetrag}}.» + Gate: ≤ 2 × Nennwert | 795 (Abs. 2: max. das Doppelte des Nennwerts) |
| S11 | Nebenleistungspflichten | «Mit den Stammanteilen {{…}} ist folgende Nebenleistungspflicht verbunden: {{gegenstandUmfang}}. Für die nähere Umschreibung wird auf ein Reglement der Gesellschafterversammlung verwiesen.» (Reglement-Satz optional) | 796 (Abs. 3: Gegenstand+Umfang in Statuten) |
| S12 | Konkurrenzverbot Gesellschafter | «Die Gesellschafter dürfen keine die Gesellschaft konkurrenzierenden Tätigkeiten ausüben.» + Befreiungs-Satz: «…sofern alle übrigen Gesellschafter schriftlich zustimmen.» ODER Variante GV-Zustimmung | 803 II/III (ZH/SG/GL/EHRA wortgleich) |
| S13 | Vorkaufsrecht Verfahren | ZH/SG/GL/EHRA-konvergenter Block: Meldung Vorkaufsfall **30 Tage** (eingeschriebener Brief) · Ausübung **60 Tage** ab Mitteilung · stets sämtliche betroffenen Anteile · GF informiert binnen **10 Tagen** · Übertragung binnen **60 Tagen** gegen Vergütung | 786 II Ziff. (statutarische Gestaltung); Hinweispflicht 777a II Ziff. 4 |
| S14 | Vorkaufsrecht Preis | «zum wirklichen Wert im Zeitpunkt des Eintritts des Vorkaufsfalls»; Nichteinigung binnen 30 Tagen → «zugelassener Revisionsexperte als Schiedsgutachter»; Ersatzbestimmung: ZH/GL/EHRA «Präsident des Obergerichts am Sitz» vs. SG «Präsident des Handelsgerichts» → **Haus-Fassung kantonsneutral: «die Präsidentin oder der Präsident des am Sitz der Gesellschaft zuständigen oberen kantonalen Gerichts» — ABWEICHUNG von allen Mustern, offenlegen** | 786; (Bewertung: Usanz, keine zwingende Norm) |
| S15 | Stimmrecht nach Anteilszahl | «Das Stimmrecht bemisst sich nach der Zahl der Stammanteile; auf jeden Stammanteil entfällt eine Stimme.» + Gate: kleinster Nennwert ≥ 1/10 des grössten; Default ohne S15: Nennwert-Stimmrecht (806 I, ZH-Wortlaut) | 806 II (+ Schranke 806 III) |
| S16 | Vetorecht | «Folgenden Gesellschaftern steht ein Vetorecht gegen folgende Beschlüsse der Gesellschafterversammlung zu: {{beschluesse}}.» — Statuten MÜSSEN Beschlüsse umschreiben | 807 I |
| S17 | Abtretungs-Regime | Default-Wiedergabe 786 I (GV-Zustimmung, Verweigerung ohne Grundangabe, 6-Monats-Fiktion — ZH/EHRA-Wortlaut) ODER Varianten 786 II Ziff. 1–5 (Verzicht / Gründe / Übernahme zum wirklichen Wert / Ausschluss) | 785/786/787 |
| S18 | GF-Konkurrenzverbot-Befreiung | «Die Geschäftsführer dürfen konkurrenzierende Tätigkeiten ausüben, wenn {{alle übrigen Gesellschafter schriftlich zustimmen | die Gesellschafterversammlung zustimmt}}.» | 812 III |
| S19 | Virtuelle/hybride GV | ZH-Wortlaut: vor Ort/hybrid/virtuell zulässig; Ausland mit unabhängigem Stimmrechtsvertreter; virtuell ohne Tagungsort, Verzicht auf Stimmrechtsvertreter (Einzelfall-Ermächtigung) | 805 V Ziff. 2bis i. V. m. 701a–701d |
| S20 | Einberufungsfrist-Abweichung | Verlängern oder verkürzen bis 10 Tage | 805 III |

**Nicht aufgenommen (bewusst):** Kapitalband/bedingtes Kapital (AG-only),
Konventionalstrafen-Klausel (individuell, kein Muster-Wortlaut belegt → nur
Hinweispflicht-Zeile 777a II Ziff. 5), Genussscheine.

# TEIL 2 — Statuten-Baustein-Katalog AG

Stammquellen: `zh-ag-statuten-lang/kurz.txt`, `sg-ag-langversion/
-kurzversion-vinkulierung/-minimalversion.txt`, `gl-ag-statuten-*.txt`.

## 2.1 Pflicht (626 Abs. 1)

| # | Baustein | Wortlaut-Kern | Norm |
|---|---|---|---|
| A1 | Firma/Sitz | «Unter der Firma {{firma}} AG besteht mit Sitz in {{sitz}} auf unbestimmte Dauer eine Aktiengesellschaft gemäss Art. 620 ff. OR.» (ZH=SG=GL) | 626 Ziff. 1 |
| A2 | Zweck | wie S2 | 626 Ziff. 2 |
| A3 | Kapital/Aktien | «Das Aktienkapital beträgt CHF {{betrag}} und ist eingeteilt in {{anzahl}} Namenaktien zu CHF {{nennwert}}. Die Aktien sind {{vollständig | zu {{prozent}} %}} liberiert.» — deckt 626 Ziff. 3 (Höhe+Währung+**geleistete Einlagen**) und Ziff. 4 (Anzahl/Nennwert/Art) ab; Teilliberierung: ≥ 20 % je Aktie, gesamthaft ≥ CHF 50'000 (632) | 626 Ziff. 3+4; 632 |
| A4 | Mitteilungen | «Mitteilungen an die Aktionäre erfolgen per Brief oder E-Mail an die im Aktienbuch verzeichneten Adressen.» (+ optional SHAB-Satz, SG kurz) | 626 Ziff. 7 |

## 2.2 Bedingt

| # | Baustein (Weiche) | Wortlaut-Kern | Norm |
|---|---|---|---|
| A10 | Vinkulierung | ZH/SG/GL-wortgleicher Block: Übertragung/Nutzniessung nur mit VR-Genehmigung; Ablehnung bei Übernahmeangebot zum wirklichen Wert oder fehlender Eigenerwerbs-Erklärung (Escape 685b I/III); Erbgang/Güterrecht/Zwangsvollstreckung: Ablehnung nur mit Übernahmeangebot (685b IV); gerichtliche Wertbestimmung am Sitz, Kosten Gesellschaft (685b V) | 685a/685b |
| A11 | Stimmrecht | «Die Aktionäre üben ihr Stimmrecht nach Verhältnis des gesamten Nennwerts der ihnen gehörenden Aktien aus.» (= 692 I Default, deklaratorisch; ZH/SG/GL) — Stimmrechtsaktien (693) NICHT als Baustein (Spezialgestaltung, Backlog) | 692 |
| A12 | GV-Organisation | Einberufung mind. 20 Tage; Beschluss mit Mehrheit der vertretenen Aktienstimmen; qualifizierter Katalog 704 wortlautnah (ZH/SG/GL decken sich); Stichentscheid-Option (GL ja / SG nein — als Schalter, Hinweis: 703 kennt keinen gesetzlichen Stichentscheid) | 700/703/704 |
| A13 | Virtuelle/hybride GV | wie S19 (AG-Fassung; 704 I-Katalog-Ziffer Verzicht Stimmrechtsvertreter) | 701a–701d |
| A14 | VR-Organisation | «Der Verwaltungsrat besteht aus einem oder mehreren Mitgliedern. Die Amtsdauer beträgt drei Jahre; Wiederwahl ist zulässig.» (710 II Default; max. 6 J.); Selbstkonstituierung (712 II); unübertragbare Aufgaben-Verweis (716a); Delegation nach Organisationsreglement (716b); «Mindestens ein Mitglied … zur Vertretung befugt. Die Gesellschaft muss durch eine Person vertreten werden können, die Wohnsitz in der Schweiz hat.» (718 III/IV) | 707–718 |
| A15 | Revision/Opting-out | Verzichtsformel dreigliedrig (keine ordentliche Revisionspflicht · ≤ 10 Vollzeitstellen · Zustimmung aller); Folgejahre-Geltung; Recht jedes Aktionärs auf eingeschränkte Revision bis 10 Tage vor GV | 727/727a |

# TEIL 3 — Zeichnung (777a / 630 / 652)

1. **Bei der GRÜNDUNG erfolgt die Zeichnung IM Errichtungsakt** — GmbH wie
   AG (72 lit. d / 44 lit. d HRegV). **Negativbefund (4 Kantone geprüft):
   ein separater amtlicher GmbH-Zeichnungsschein existiert nicht.**
   → Engine: Zeichnungs-Bausteine gehören in den Urkunden-ENTWURF, KEIN
   eigenes Exportdokument bei der Gründung.
2. **Zeichnungs-Wortlaut GmbH** (ZH-Urkunde, verbatim): «…eingeteilt in
   {{anzahl}} Stammanteile zu je CHF {{nennwert}} (Nennwert), welche zum
   Ausgabebetrag von CHF {{ausgabebetrag}} je Stammanteil
   {{von mir vollständig | wie folgt}} gezeichnet werden: …» + Block
   «Gemäss Statuten bestehen folgende Bestimmungen im Sinne von Art. 777a
   Abs. 2 OR: – … (Artikel … der Statuten)» — Pflicht-Hinweis auf
   Nachschuss/Nebenleistung/Konkurrenzverbot/Vorhand-Vorkaufs-Kaufsrechte/
   Konventionalstrafen, WENN solche Klauseln gewählt sind.
3. **Zeichnungs-Wortlaut AG** (ZH-Urkunde): «… welche zum Ausgabebetrag von
   CHF {{…}} je Aktie … gezeichnet werden. Jeder Gründer verpflichtet sich
   hiermit bedingungslos, die dem Ausgabebetrag der von ihm gezeichneten
   Aktien entsprechende Einlage zu leisten.» (= 630 Ziff. 1+2 abgebildet;
   Angaben Anzahl/Nennwert/Art/Kategorie/Ausgabebetrag).
4. **Separater Zeichnungsschein** ist das Dokument der KAPITALERHÖHUNG
   (652: «besondere Urkunde (Zeichnungsschein)», Bezugnahme auf GV-/VR-
   Beschluss; Verbindlichkeit endet nach 3 Monaten — SG-Klausel = 652 III
   a. F.? **Nein:** 652 III ist aufgehoben; die 3-Monats-Klausel ist
   VERTRAGLICHE Usanz aus dem SG-Muster → als optionale Klausel, nicht als
   Gesetzesinhalt ausweisen!). SG führt zusätzlich einen Gründungs-
   Zeichnungsschein «mit Vollmacht» (Bezug auf Gründungsbelege 631 II) für
   die Vertretung beim Termin. → Backlog «Kapitalerhöhung»; bei der
   Gründungs-Maske nur als Hinweis (Vertretungs-Fall).

# TEIL 4 — Erklärungen (beurkundungsfrei → exportierbar `fertig`)

Alle Wortlaute verbatim aus amtlichen Vorlagen (ZH 26.7.2024; SG 2023):

1. **Wahlannahme GF/VR** (ZH, Brief-Anatomie): «Gerne bestätige ich Ihnen,
   dass ich die Wahl als Mitglied {{der Geschäftsführung | des
   Verwaltungsrates}} der {{firma}}, in {{sitz}}, annehme.» — SG-Variante
   mit Funktion+Zeichnungsberechtigung. Form: Original-Unterschrift
   (Praxis ZH «original handschriftlich»); entbehrlich bei Annahme in der
   Urkunde oder Anmelde-Unterschrift (71 I lit. c / 43 I lit. c HRegV).
2. **Domizilannahme** (ZH): «Gerne bestätigen wir Ihnen, dass wir der
   {{firma}}, mit Sitz in {{sitz}}, an unserer Adresse ({{adresse}})
   {{Domizil | Sitz}} gewähren.» (GmbH-Vorlage «Domizil», AG-Vorlage
   «Sitz» — Haus-Fassung: «Domizil», deckt 117 III HRegV). SG formaler mit
   Strafhinweis 152/153 StGB (als optionaler Hinweis-Absatz).
3. **VR-Konstituierungsprotokoll** (ZH, AG-Pflichtbeleg 43 I lit. e):
   Kopf (Datum/Beginn/Ort/Anwesend/Vorsitz/Protokoll) · Eröffnung +
   Beschlussfähigkeit · Konstituierung + Zeichnungsberechtigungen je
   Mitglied (Name, Heimatort/Staatsangehörigkeit, Wohnsitz, Funktion,
   Zeichnungsart) · weitere Zeichnungsberechtigte · Unterschriften
   Vorsitz/Protokoll (23 II HRegV; entbehrlich, wenn ALLE VR-Mitglieder die
   Anmeldung unterzeichnen, 23 III). GmbH-Pendant (Vorsitz-/Ernennungs-
   Beschluss 71 I lit. e/f) nach gleichem Muster, schlanker.
4. **Opting-out-Erklärung** (ZH «KMU-Erklärung» + SG «Verzicht auf eine
   Revision», konvergent dreigliedrig): 1. keine ordentliche
   Revisionspflicht · 2. ≤ 10 Vollzeitstellen im Jahresdurchschnitt ·
   3. Zustimmung sämtlicher Gesellschafter/Aktionäre. Bei GRÜNDUNG:
   Erklärung in der Urkunde (ZH-Merkblatt ausdrücklich); separates
   Formular nur nachträglich (dann 727a II Satz 2/IIbis-Regeln). →
   Engine: Urkunden-Baustein + optional separates Erklärungs-Dokument
   für Ämter, die es zusätzlich wollen (Hinweis, kein Default).
5. **HR-Anmeldung** (ZH-Formular `div-zh-anmeldung-neueintragung-gmbh.txt`):
   Eingabe-Format an das HRegA; Inhalt: Firma · Sitz · Rechtsdomizil
   (eigene/c-o-Adresse) · einzutragende Tatsachen bzw. Beleg-Verweise
   (16 I HRegV) · Beilagen-Liste (= 71/43-Belege) · Unterschriften
   (18 II: beim Amt zeichnen oder beglaubigt; 21 I Hinterlegungs-
   Modalitäten). Gebühr CHF 420 (GebV-HReg Anhang 1.3).

# TEIL 5 — Errichtungsakt (ENTWURF-Gate §8)

Konvergente Gliederung ZH (I–VIII) / SG (Ziff. 1–11), GmbH und AG parallel:

I. Erscheinen/Personalien der Gründer (72 lit. a / 44 lit. a HRegV) ·
II. Gründungserklärung + Statutenfestlegung (777 I / 629 I; Statuten als
Urkundenbestandteil) · III. Kapital + **Zeichnung** (Teil 3; mit
777a-II-Hinweisblock bzw. 630-Verpflichtungssatz) · IV. Einlagen
(Bareinlage: Bank nach Art. 1 BankG, Bescheinigungs-Referenz ODER
Banknennung in der Urkunde → lit. g/f-Entbehrlichkeit; AG-Teilliberierung:
634b-Variante) · V. **Feststellungen** (777 II Ziff. 1–5 / 629 II
Ziff. 1–4, ZH-Wortlaut = Gesetzes-Wortlaut; Ziff.-4-Klammer nur bei
Nachschuss-/Nebenleistungsklauseln) · VI. Organbestellung (GF/VR;
Revisionsstelle ODER Opting-out-Feststellungen) · VII. Domizil (+ AG-
Variante: Konstituierung in der Urkunde, «unter der Bedingung, dass der
Verwaltungsrat vollzählig anwesend ist») · VIII. Gründungserklärung
(«Abschliessend erkläre/n ich/wir die Gesellschaft den gesetzlichen
Vorschriften entsprechend als gegründet.») + **Nachtragsvollmacht**
(ZH-Klausel: jeder Gründer/GF einzeln für Beanstandungs-Nachträge) ·
Urkundsperson-Bestätigung (777b I / 631 I: Belege einzeln nennen).

**Form:** öffentliche Beurkundung (777 I / 629 I) → Ausgabe NUR als
`entwurf` (Wasserzeichen ENTWURF, Hinweiszeile), Zweck: Vorbereitung für
die Urkundsperson. Statuten ebenso `entwurf` (Beglaubigung 22 IV HRegV).

# TEIL 6 — Formvorschriften-Matrix → Export-Gates

| Dokument | Form | ausgabeArt | DOCX |
|---|---|---|---|
| Statuten (GmbH/AG) | notarielle Beglaubigung (22 IV HRegV) | **entwurf** | ja (Notariat arbeitet damit) |
| Errichtungsakt | öffentliche Beurkundung (777/629) | **entwurf** | ja |
| Wahlannahme GF/VR | einfache Schriftform, Original | fertig | ja |
| Domizilannahme | einfache Schriftform, Original (117 III HRegV) | fertig | ja |
| Vorsitz-/Ernennungs-Beschluss (GmbH) · VR-Protokoll (AG) | Schriftform; Unterschriften Vorsitz+Protokoll (23 II HRegV); Vertretungs-Unterschriften beglaubigt (Praxis ZH bei AG) | fertig | ja |
| Opting-out-Erklärung (separat, nachträglich/Zusatz) | Schriftform, ≥ 1 Mitglied oberstes Organ | fertig | ja |
| HR-Anmeldung | Unterschriften beglaubigt oder beim Amt (18 II HRegV) | fertig | ja |

# TEIL 7 — Engine-Bauspezifikation (GmbH zuerst, AG danach, §4 getrennt)

- **EIN Antworten-Satz** je Rechtsform (erweitert `GmbhGruendungEingaben`
  um Identität: Firma, Sitz, Zweck, Kapital/Anteile, Gründerliste mit
  Zeichnungen, GF-Liste mit Zeichnungsart, Bank, Domizilhalter,
  Revisionsstelle, gewählte Statutenklauseln samt Parametern) →
  **N Schemas** (statuten · errichtungsakt · wahlannahme[je Person] ·
  domizilannahme · vorsitzBeschluss/vrProtokoll · optingOut · hrAnmeldung),
  jedes per `assemble()`; Aufnahme eines Dokuments in die Mappe =
  dieselben Weichen wie `gruendungsunterlagen.ts` (SSoT: Weichen-Logik
  bleibt DORT, die Vorlagen-Schicht konsumiert sie).
- **Checkliste bleibt**, Volldokumente ergänzen sie (Davids 9b: «direkt
  erzeugen»); Maske erweitert `VorlageGmbhGruendung` um Dokumentmappen-Teil.
- Konsistenz-Gates: Summe gezeichneter Anteile = Anzahl; Nennwert > 0;
  Stammkapital = Anzahl × Nennwert ≥ CHF 20'000 (773 I) bzw. AK ≥ 100'000,
  Teilliberierung ≥ 20 %/50'000 (632); Nachschuss ≤ 2 × Nennwert (795 II);
  CH-Vertretung (814 III/718 IV) als Blocker (besteht).
- Konventionen (`konventionen.ts`) gelten für alle neuen Texte;
  `scripts/norm-zitate-pruefen.ts` + Konventions-Test decken die Schemas ab.

# TEIL 8 — Pflegebedarf (im Verfallsregister eingetragen, 7.6.2026)

- ZH-Vorlagen-Suite Stand 26.7.2024, SG «…2023», GL undatiert → bei
  OR-Änderungen neu abgleichen (Prüfrhythmus: mit HRegV-Cache-Pin).
- Fremdwährungsliste Anhang 3 HRegV (bereits im Register).
- 3-Monats-Klausel Zeichnungsschein (SG) ist Usanz, NICHT Gesetz (652 III
  aufgehoben) — bei künftigem Kapitalerhöhungs-Modul beachten.

# TEIL 9 — Offene Punkte

- [ ] Notariats-Akzeptanz der ENTWURF-Urkunde (Praxis-Feedback) — bewusst
  nur als Vorbereitung deklariert.
- [ ] Qualifizierte Gründung (Sacheinlage/Verrechnung) als Urkunden-
  Varianten: ZH/SG führen eigene Muster («qualifiziert») — NICHT geladen;
  Stufe 2 (Erstausbau: Bargründung; qualifiziert → Checklisten-Hinweis).
- [ ] AG Fremdwährungs-Urkunde (ZH «bar in Fremdwährung») — Stufe 2.
- [ ] BE/LU-Erklärungs-Wortlaute (in PDF-Formulare integriert) — nur
  Quervergleich, nicht blockierend.
- [ ] Statuten-Katalog-Eintrag `statuten` (geplant) kann nach dem Bau auf
  die neuen Bausteine zeigen (SSoT, §5).
