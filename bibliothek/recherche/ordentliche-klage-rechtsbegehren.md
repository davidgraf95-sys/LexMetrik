# Ordentliche Klage & Rechtsbegehren-Bausteine — Grundlagen-Dossier

**Erstellt:** 10.6.2026, Auftrag David (Wissens-Verwertung Ablagen «Legal Calc
Knowledge» + «_Anwaltsprüfung») — Bauspezifikation für den GEPLANTEN Neubau
der Vorlage «ordentliche Klage» und zur Härtung der gebauten Vorlage
`src/lib/vorlagen/klageVereinfacht.ts`. NUR Recherche, nichts gebaut.

**Status:** ERSTRECHERCHE (Norm-Kerne Art. 58/59/84–92/219/221/236/343 ZPO am
gepinnten Cache verbatim verifiziert; Praxis-Schicht einfach belegt, private
Quellen).

## Quellen

**Amtlich (Beleg-Schicht):**

| Quelle | Stand | Nachweis |
|---|---|---|
| ZPO (SR 272), Fedlex-Filestore `cc/2010/262` | Konsolidierung **20250101** (enthält Revision «Praxistauglichkeit» vom 17.3.2023, in Kraft 1.1.2025) | Pin gemäss `register/quellen-register.md`; Arbeitskopie `/tmp/zpo.html` via `scripts/fedlex-cache.sh`-Basis-URL, Abruf 10.6.2026. In DIESEM Dossier am Wortlaut geprüft: art_58, art_59, art_84–88, art_90–92, art_219, art_221, art_236, art_343. |

**PRIVAT (Praxis-Schicht — lokale, gitignorte Privatkopien; als Beleg in UI/
Engine NICHT zitierfähig, nur als Formulierungs- und Struktur-Vorbild):**

| # | Quelle | Pfad (lokal) | Auswertungstiefe |
|---|---|---|---|
| P1 | Mabillard, Grundsätze zur Formulierung der Rechtsbegehren, CIVPRO Bd. 11, 2017 | `bibliothek/quellen/anwaltspruefung/rechtsbegehren/Grundsätze zur Formulierung der Rechtsbegehren .pdf` | vollständig |
| P2 | Eckert, Stolpersteine bei der Formulierung der Rechtsbegehren, Folien Tagung «ZPO – Fallstricke und Chancen», 18.3.2014 | `…/rechtsbegehren/Stolpersteine Rechtsbegehren.pdf` | vollständig |
| P3 | Rechtsbegehrensammlung 342 S. (mit Inhaltsverzeichnis, BL-orientiert) | `…/rechtsbegehren/Allgemeine Rechtsbegehrensammlungen/Rechtsbegehrensammlung_342-Seiten.docx` | strukturell + Stichproben (Miete, Arbeit, Kauf, Werkvertrag) |
| P4 | Rechtsbegehren neu 339 S. (gleiche Familie, ohne IHV) | `…/Allgemeine Rechtsbegehrensammlungen/Rechtsbegehren neu_339-Seiten.docx` | strukturell |
| P5 | Privatrechtliche Klagen & Rechtsbegehren BS, Stand 2016 | `…/Allgemeine Rechtsbegehrensammlungen/Privatrechtliche Klagen und Rechtsbegehren_BS_Stand 2016.docx` | strukturell + Kapitel «Musterformulierungen» |
| P6 | Privatrechtliche Klagen & Rechtsbegehren BL, 2019 («under construction») | `…/Allgemeine Rechtsbegehrensammlungen/Privatrechtliche Klagen und Rechtsbegehren_BL_2019 (under Construction).docx` | strukturell |
| P7 | Rechtsbegehren (Homburger), Kanzlei-Praktikanten-Referat, Muster ca. 1999–2005 (noch ZPO ZH!) | `…/Allgemeine Rechtsbegehrensammlungen/Rechtsbegehren (Homburger).pdf` | vollständig (Muster-Ebene) |
| P8 | Rechtsbegehren-Skript (Kanzlei-Muster, gescannt, OCR mässig) | `…/Allgemeine Rechtsbegehrensammlungen/Rechtsbegehren-Skript.pdf` | strukturell |
| P9 | Rechtsbegehren ZGB-Tabelle (Norm → Legitimation → Begehren) | `…/Allgemeine Rechtsbegehrensammlungen/Rechtsbegehren ZGB_Tabelle.docx` | strukturell + Stichproben |
| P10 | Hrubesch-Millauer u.a., Rechtsbegehren im Erbrecht, CIVPRO Bd. 11, 2017 | `…/Fachspezifische Rechtsbegehrensammlungen/Rechtsbegehren im Erbrecht_Hrubesch_CIVPRO_2017.pdf` | Gliederung + alle Muster-Begehren |
| P11 | Hrubesch-Millauer/Bosshardt/Kocher, Rechtsbegehren im Erbrecht, successio 2018, 4–30 | `…/Rechtsbegehren im Erbrecht_successio_2018.pdf` | strukturell (inhaltlich = P10-Familie) |
| P12 | Krauskopf/Wirz, Rechtsbegehren im Haftpflichtrecht, CIVPRO Bd. 11, 2017 | `…/Rechtsbegehren im Haftpflichtrecht_Krauskopf_CIVPRO_2017.pdf` | Gliederung + Muster |
| P13 | Schmid-Tschirren, Rechtsbegehren im Sachenrecht, CIVPRO Bd. 11, 2017 | `…/Rechtsbegehren im Sachenrecht.pdf` | Gliederung + 2 Beispiel-Begehren |
| P14 | Conrad/Eichenberger, Rechtsbegehren im Vollstreckungsrecht, CIVPRO Bd. 11, 2017 | `…/Rechtsbegehren im Vollstreckungsrecht_CIVPRO_2017.pdf` | Gliederung + Muster (Pauliana, Arrest, SchKG-Beschwerde) |
| P15 | Rechtsbegehren aktienrechtliche Klagen (Kanzlei-Sammlung mit Bemerkungen) | `…/Fachspezifische Rechtsbegehrensammlungen/Rechtsbegehren aktienrechtliche Klagen.docx` | Gliederung + Muster |
| P16 | Rechtsbegehren Erbrecht (Prüfungs-Kondensat) | `…/Fachspezifische Rechtsbegehrensammlungen/Rechtsbegehren Erbrecht.docx` | Gliederung + Muster |
| P17 | Vorlage Rechtsschrift Privatrecht, Anwaltsprüfung 2025 | `bibliothek/quellen/anwaltspruefung/rechtsschriften-privatr/Vorlage Rechtsschrift Privatrecht_AP2025.docx` | vollständig |
| P18 | Klage/Gesuch/Beschwerde-Gerüst «Lorenzo» | `…/rechtsschriften-privatr/Klage_Gesuch_Beschwerde_Lorenzo.docx` | vollständig |
| P19 | Fischer/Theus Simoni/Gessler (Hrsg.), Kommentierte Musterklagen Bd. I, 2. Aufl. 2022 — § 1 (Dickenmann, Erfüllungsklage Käufer), § 6 (Rohrer/Schneider, Erstreckung Geschäftsmiete), § 7 (Rohrer u.a., Anfechtung Mietzinserhöhung), § 8 (Rohrer/Rohrer, Schadenersatz/Ausweisung Vermieter), § 9 (Klage Arbeitnehmer nach ordentlicher Kündigung; Datei enthält zusätzlich die Musterklage fristlose Entlassung) | `bibliothek/quellen/legal-calc-knowledge/Musterklagen Vertrags- und Haftplfichtrecht/…` | Aufbau + Rechtsbegehren + zentrale Praxis-Bemerkungen |

**Urheberrechts-Disziplin:** Rechtsbegehren-Formeln sind nicht schutzfähige
Standardformeln und werden hier in EIGENER, parametrisierter Fassung geführt;
Kommentar-Passagen der Privatquellen wurden NICHT übernommen, nur als Regel
destilliert.

---

## 1. Aufbau einer Klage im ordentlichen Verfahren

### 1.1 ZPO-Pflichtinhalt (Art. 221, verbatim am Cache 20250101)

> «**Art. 221** Klage
> ¹ Die Klage enthält: a. die Bezeichnung der Parteien und allfälliger
> Vertreterinnen und Vertreter; b. das Rechtsbegehren; c. die Angabe des
> Streitwerts; d. die Tatsachenbehauptungen; e. die Bezeichnung der einzelnen
> Beweismittel zu den behaupteten Tatsachen; f. das Datum und die Unterschrift.
> ² Mit der Klage sind folgende Beilagen einzureichen: a. eine Vollmacht bei
> Vertretung; b. gegebenenfalls die Klagebewilligung oder die Erklärung, dass
> auf das Schlichtungsverfahren verzichtet werde; c. die verfügbaren Urkunden,
> welche als Beweismittel dienen sollen; d. ein Verzeichnis der Beweismittel.
> ³ Die Klage kann eine rechtliche Begründung enthalten.»

Dazu Art. 219 ZPO (verbatim): die Bestimmungen des ordentlichen Verfahrens
gelten «sinngemäss für sämtliche anderen Verfahren, soweit das Gesetz nichts
anderes bestimmt» — der Klage-Aufbau ist also die MUTTERFORM, von der
Art. 244 ZPO (vereinfacht) nur Erleichterungen gewährt.

### 1.2 Praxis-Gliederung (Synthese P17/P18/P19) → Baustein-Plan

Alle drei Praxisquellen (Anwaltsprüfungs-Vorlagen + Musterklagen 2022)
verwenden dieselbe Grundgliederung. Engine-Mapping (Baustein-IDs als
Vorschlag für die neue Vorlage, Präfix `OK`):

| # | Praxis-Block | ZPO-Pflicht? | Engine-Baustein (Plan) |
|---|---|---|---|
| 1 | Absender (Vertretung/Partei) + Gericht + Einschreiben + «im Doppel/x-fach» | Pflicht via Art. 221 I lit. a / Art. 131 | `OK01_absender`, `OK02_adressat` |
| 2 | Ort/Datum | Pflicht (lit. f Datum) | `OK03_datum` |
| 3 | Betreff: «Klage» + «betreffend [Streitgegenstand]» + Streitwert | Streitwert Pflicht (lit. c) | `OK04_betreff` |
| 4 | Rubrum «in Sachen [Kläger], vertreten durch … gegen [Beklagte] betreffend …» | Pflicht (lit. a) | `OK05_rubrum` |
| 5 | Einleitungssatz «… erhebe ich namens und mit Vollmacht der Klägerin [durch Einreichen der Klagebewilligung vom …] KLAGE mit folgendem» | Praxis (KB-Nennung deckt Abs. 2 lit. b) | `OK06_einleitung` |
| 6 | **RECHTSBEGEHREN** (nummeriert; letzte Ziffer Kostenfolge) | Pflicht (lit. b) | `OK07_begehren` (Liste) |
| 7 | **Verfahrensanträge** (separat NACH den Rechtsbegehren) | Praxis (Inhalte je eigene ZPO-Grundlage) | `OK08_verfahrensantraege` |
| 8 | BEGRÜNDUNG → **I. Formelles**: Vollmacht · Parteien/Partei- u. Prozessfähigkeit · örtliche + sachliche Zuständigkeit · Verfahrensart · Streitwert(-Berechnung) · Klagebewilligung/Verzicht · (nur bei Feststellungsklage:) Feststellungsinteresse · Begründung der Verfahrensanträge/Editionsbegehren | teils Pflicht-Nachweis (Prozessvoraussetzungen Art. 59 II), Gliederung = Praxis | `OK09_formelles` |
| 9 | **II. Materielles — A. Tatsächliches**: nummerierte Tatsachenbehauptungen, je Behauptung Beweisofferte «BO: [Beweismittel] — Beilage n» | **Pflicht** (lit. d + e: Beweismittel «zu den behaupteten Tatsachen», d.h. ZUGEORDNET) | `OK10_sachverhalt` (Behauptung + BO-Liste je Ziffer) |
| 10 | **II. Materielles — B. Rechtliches** (Anspruchsgrundlage, Sachlegitimation, Subsumtion) | freiwillig (Abs. 3) | `OK11_rechtliches` (optional) |
| 11 | **III. Kosten** (Streitwert-Bezug, MWST-Zusatz) | Praxis | `OK12_kosten` |
| 12 | Schluss «Demzufolge sind die eingangs gestellten Rechtsbegehren … gutzuheissen.» + Grussformel + **Unterschrift** | Unterschrift Pflicht (lit. f) | `OK13_schluss`, `OK14_unterschrift` |
| 13 | **Beweismittel- und Beilagenverzeichnis** (separates Blatt): Urkunden (Beilage A/1…n) · Zeugen (Name, Adresse, Beweisthema) · Parteibefragung · Gutachten · Augenschein · Editionsbegehren | Verzeichnis Pflicht (Abs. 2 lit. d); Beilagen lit. a–c | `OK15_verzeichnis` |

**Konventionen aus den Musterklagen (P19), direkt übernehmbar:**
- Vollmacht als «Beilage A»/«Beilage 1» und IMMER erste Formelles-Ziffer.
- Klagebewilligung im Einleitungssatz nennen UND als Beilage führen.
- Jede Sachverhalts-Ziffer trägt ihre Beweisofferten («BO:») unmittelbar bei
  der Behauptung — nicht gesammelt am Ende (deckt Art. 221 I lit. e:
  «Bezeichnung der einzelnen Beweismittel **zu den behaupteten Tatsachen**»).
- Kostenfolge als LETZTE Ziffer der Rechtsbegehren («Alles unter Kosten- und
  Entschädigungsfolgen … zulasten der Beklagten»), nicht als eigener Antrag
  ausserhalb.
- Mehrere Beklagte: im Rubrum nummeriert («Beklagter 1», «Beklagte 2», …,
  «daselbst» bei gleicher Adresse); Kostenfolge «zulasten der dafür
  solidarisch haftenden Beklagten».

### 1.3 Abgrenzung zum vereinfachten Verfahren (Art. 244)

| Punkt | Ordentlich (221) | Vereinfacht (244, gebaut) |
|---|---|---|
| Begründung (Tatsachen + Beweismittel je Behauptung) | **Pflicht** | freiwillig («braucht keine Begründung zu enthalten») |
| Streitwert | immer anzugeben (lit. c) | nur «sofern nötig» (244 I lit. d) |
| Rechtliche Begründung | ausdrücklich zugelassen (Abs. 3) | nicht vorgesehen, aber unschädlich |
| Beilagen-Regime | Abs. 2 lit. a–d inkl. Beweismittelverzeichnis | 244 III (Vollmacht, KB, Urkunden) |
| Anwaltstypischer Block «Verfahrensanträge» | üblich | selten |

---

## 2. Formulierungsregeln Rechtsbegehren (Regelwerk R1–R16, decision-tree-fähig)

Quellen: P1 (dogmatische Herleitung), P2 (Praktiker-Regeln), P7/P12 (Muster);
Norm-Kerne am Cache verifiziert.

**R1 — Bestimmtheit (Doppel-Test).** Ein Begehren ist genügend bestimmt, wenn
(a) das Gericht es bei Gutheissung UNVERÄNDERT ins Urteilsdispositiv übernehmen
kann und (b) die Vollstreckungsbehörde allein aus dem Dispositiv — ohne
Lektüre der Urteilserwägungen — weiss, was zu vollstrecken ist (P1 mit
BGE 142 III 102 E. 5.3.1, BGE 137 III 617 E. 4.3). Engine-Konsequenz: jeder
Begehren-Baustein wird im Konjunktiv «sei zu …» formuliert, sodass das
Dispositiv durch blossen Wechsel zu «wird» entsteht.

**R2 — Zwei Pflicht-Elemente.** Jedes Begehren = individualisierte
Rechtsfolge (wer schuldet wem was) + Rechtsschutzform aus dem numerus clausus:
Leistung (Tun/Unterlassen/Dulden, Art. 84), Gestaltung (Art. 87),
Feststellung (Art. 88) — plus vorsorgliche Massnahme und
Vollstreckungsanordnung (P1). Engine: `begehrenTyp` als Enum, KEIN Freitext
als einziger Weg.

**R3 — Bezifferung (Art. 84 II verbatim: «Wird die Bezahlung eines
Geldbetrages verlangt, so ist dieser zu beziffern.»).** Inklusive Zins:
Zinssatz UND Zinsbeginn gehören ins Begehren («nebst Zins zu 5 % seit
[Datum]»). «ca.», «samt Zinsen» (ohne Satz/Datum) oder «den ihr zustehenden
Betrag» sind unbestimmt (P2, P12). Mehrere Zinsläufe: Aufstellung im Begehren
(«nebst Zins zu 5 % auf CHF … seit … und auf CHF … seit …») — Muster P7.
Praxis-Datum «mittlerer Verfall» für periodisch aufgelaufene Posten (P19 § 8).

**R4 — Währung.** Geldschulden sind in der GESCHULDETEN Währung einzuklagen;
wer eine Fremdwährungsschuld in CHF einklagt, verlangt etwas materiell nicht
Geschuldetes → Klageabweisung (P2 mit BGE 134 III 151). Vertraglich: Währung
aus Vertrag; ausservertraglich: Währung des Staats des Schadenseintritts.
Engine: Währungsfeld mit CHF-Default, Hinweis-Gate bei Fremdwährungssachverhalt.

**R5 — Brutto/Netto (Arbeitsrecht).** Lohnforderungen brutto; Entschädigungen
nach Art. 336a/337c Abs. 3 OR netto (Strafcharakter, keine Sozialabzüge); im
Begehren ausdrücklich «brutto»/«netto» nennen (P2; P19 § 9 differenziert und
empfiehlt, wo die exakten Abzüge bekannt sind, Netto-Klage wegen
Vollstreckungsproblemen von Brutto-Urteilen — als umstritten offengelegt).

**R6 — MWST.** (a) Auf der PARTEIENTSCHÄDIGUNG: Zusatz nur auf Antrag —
Standardformel «unter Kosten- und Entschädigungsfolgen (zzgl. MwSt.)
zulasten …»; nur sinnvoll, wenn die Partei nicht vorsteuerabzugsberechtigt
ist (P19 § 7 Bem. 2: zwei mwst-pflichtige Gesellschaften → kein Zusatz).
(b) Auf der eingeklagten LEISTUNG: ausdrücklich ins Begehren («zuzüglich
Mehrwertsteuer»), bezogen auf den Kapitalbetrag — kein MWST auf Verzugszins
oder Schadenersatz (P2). Engine: zwei getrennte Schalter; Satz NIE hart
kodieren (Quellen nennen 7,7 %/8 % — datiert, vgl. Verfallsregister-Kandidaten).

**R7 — Keine Rechtsgrundlage, keine Begründung im Begehren.** Die
Anspruchsgrundlage gehört NICHT ins Rechtsbegehren (iura novit curia; P1);
«gestützt auf Ziffer 3 des Vertrags» im Begehren ist ein klassischer Fehler
(P2-Übung). Ausnahmen nur, wo die Norm das Begehren typisiert (z.B.
Strafandrohung «gemäss Art. 292 StGB» — das ist Vollstreckungs-, nicht
Anspruchszitat).

**R8 — Bedingungsfeindlichkeit.** Haupt-Rechtsbegehren dürfen nicht von
Bedingungen abhängen («sofern die Aktien im Urteilszeitpunkt …» = Fehler).
ZULÄSSIG sind: (a) unbedingtes Begehren auf bedingten ANSPRUCH («falls und
solange das Kind … besucht»), (b) Leistung Zug um Zug, (c) künftige/
suspensiv bedingte Leistungen (Vollstreckung: Art. 342 ZPO), (d)
Eventualbegehren für den Fall der Abweisung des Hauptbegehrens, (e) eventuelle
Widerklage für den Fall der Gutheissung der Hauptklage, (f) die
Streitverkündungsklage (kein bedingtes Begehren, sondern bedingter Anspruch —
BGE 142 III 102 E. 5.3.2). (P1, P2.)

**R9 — Eventual-/Subeventualbegehren.** Reihenfolge Haupt → eventualiter →
subeventualiter; das Eventualbegehren DARF weiter gehen als das Hauptbegehren
(kein Verbot in der ZPO; P1, P10). Eventualbegehren zählen NICHT zum
Streitwert (Art. 91 I verbatim: «… sowie allfällige Eventualbegehren werden
nicht hinzugerechnet»). Alternativbegehren («das eine oder das andere nach
Gutdünken des Gerichts») sind unzulässig (P1 mit BGer 4A_99/2016).

**R10 — Subsidiarität der Feststellungsklage.** Feststellungsbegehren nur,
wenn Leistungs-/Gestaltungsklage NICHT möglich ist (Rechtsschutzinteresse:
Ungewissheit + Unzumutbarkeit ihres Fortbestands + keine andere Behebung);
sonst Nichteintreten — der teuerste Standard-Stolperstein (P2). Ausnahmen mit
gesetzlicher Feststellungs-Typisierung (z.B. Art. 28a I Ziff. 3 ZGB) und die
vermieterseitige Klage auf Feststellung der Nicht-Missbräuchlichkeit einer
Mietzinserhöhung (P19 § 7 mit BGer 4A_616/2020). Negative Feststellungsklage:
«forum running» ist im Binnenverhältnis/LugÜ KEIN genügendes Interesse (P2).

**R11 — Unbezifferte Forderungsklage (Art. 85).** Zulässig wenn Bezifferung
zu Prozessbeginn unmöglich/unzumutbar; Pflicht-Element: Mindestwert als
vorläufiger Streitwert (Abs. 1). **Revision 2025 (am Cache verifiziert, in
ALLEN Privatquellen noch fehlend):** Abs. 2 neu — nach Beweisverfahren oder
Auskunft «durch die Parteien oder Dritte» setzt DAS GERICHT eine Frist zur
Bezifferung, und das angerufene Gericht BLEIBT zuständig, auch wenn der
Streitwert die sachliche Zuständigkeit übersteigt. Anwendungsfälle: Schaden
nicht nachweisbar (Art. 42 II OR, Sachverhaltsermessen), Rechtsfolgeermessen
(Art. 47, 336a II OR — von P2 als wohl zulässig markiert, str.),
Beweisverfahren liefert Grundlagen erst. Muster-Kern: «… einen nach
Durchführung des Beweisverfahrens zu beziffernden Betrag, mindestens jedoch
CHF [X], zu bezahlen.»

**R12 — Stufenklage (Art. 85 II Var. Auskunft).** Zweiteiliges Begehren:
Ziff. 1 materieller Hilfsanspruch auf Auskunft/Rechnungslegung (braucht eine
EIGENE materielle Grundlage: Art. 170 ZGB, 607 III/610 II ZGB, 322a II OR,
400 I OR, Bereicherung, GoA; str. bei unerlaubter Handlung), Ziff. 2
unbeziffertes Leistungsbegehren «mindestens CHF [X]» (Mindestwert auch hier
Pflicht). Objektive Klagenhäufung → gleiche sachliche Zuständigkeit und
Verfahrensart nötig (Art. 90 — Abs. 2 seit 1.1.2025 entschärft:
streitwertbedingte Unterschiede schaden nicht, Beurteilung zusammen im
ordentlichen Verfahren). Ein blosser prozessualer Editionsantrag macht noch
keine Stufenklage (P12 mit BGE 140 III 409).

**R13 — Teilklage/Nachklagevorbehalt (Art. 86).** Teilbarer Anspruch darf
teilweise eingeklagt werden (Streitwert-/Kostensteuerung, «Testprozess»).
Vorbehalt («Mehrforderung vorbehalten» / «unter Vorbehalt des
Nachklagerechts») ist nach Praxis NICHT Gültigkeitserfordernis des Begehrens
(OGer ZH), aber bei der ECHTEN Teilklage dringend empfohlen, sonst droht die
Deutung als stillschweigender Erlass bzw. Rechtsmissbrauchs-Einwand bei der
Nachklage (P1, P2). Bei MEHREREN Einzelforderungen aus verschiedenen
Streitgegenständen (z.B. mehrere Monatsmieten) muss erkennbar sein, welcher
Teil welcher Forderung in welcher Reihenfolge eingeklagt ist — nötigenfalls
separate Begehren-Ziffern (P1 mit BGer 4A_99/2016). Abwehrmittel der
Gegenseite: negative Feststellungswiderklage über den Gesamtanspruch.

**R14 — Vollstreckungsanordnungen direkt beantragen (Art. 236 III/343).**
Bei Nicht-Geld-Leistungen empfiehlt sich der Antrag auf direkte Vollstreckung
schon im Erkenntnisverfahren («Auf Antrag der obsiegenden Partei ordnet es
Vollstreckungsmassnahmen an», Art. 236 III verbatim): Strafandrohung
Art. 292 StGB, Ordnungsbusse (bis 5000 / 1000 pro Tag), Zwangsmassnahme
(Wegnahme/Räumung), Ersatzvornahme (Art. 343 I lit. a–e). Erfüllungsfrist in
den Antrag aufnehmen («innert [X] Tagen seit Eintritt der Rechtskraft»).
Kantonal verschieden, ob die Vollstreckungsbehörde direkt im Urteil
angewiesen wird (P19 § 8 Bem. 2: ZH ja, BE separates Begehren).

**R15 — Prozessuale Anträge separat führen.** Sicherheitsleistung (Art. 99),
unentgeltliche Rechtspflege (Art. 119), vorsorgliche Beweisführung
(Art. 158), vorsorgliche Massnahmen (Art. 261), Sistierung/Vereinigung/
Trennung (Art. 125 f.), aufschiebende Wirkung — als «Verfahrensanträge»
NACH den Rechtsbegehren, jeder einzeln begründet (P2, P17, P18). Wer das
Gericht zu SOFORTIGEM Handeln bewegen will, stellt den Antrag sichtbar am
Anfang der Rechtsschrift (P1).

**R16 — Fixierung und Änderung.** Alle Begehren (inkl. Nebenforderungen:
Zinsen, Kosten, Entschädigung) sind bis zum massgebenden Zeitpunkt zu stellen;
spätere Modifikation nur als Klageänderung (Art. 227/230). Blosse REDUKTION
oder Verdeutlichung ist keine Klageänderung; Wechsel Feststellungs- →
Leistungsklage ist eine (P1). Engine-Konsequenz: Hinweis-Baustein, dass
vergessene Zins-/Kostenbegehren später nicht voraussetzungslos nachgeschoben
werden können.

---

## 3. Stolpersteine (eigene Destillation aus P2, ergänzt P1/P19)

Format: Stolperstein → Folge → deterministische Engine-Gegenmassnahme.

| # | Stolperstein | Typische Folge | Engine-Gegenmassnahme (Gate/Hint/Baustein) |
|---|---|---|---|
| S1 | Feststellungsbegehren, obwohl Leistungsklage möglich («Es sei festzustellen, dass … schuldet») | Nichteintreten, Kosten | Begehren-Generator erzeugt für Geldforderungen IMMER Leistungsform «sei zu verpflichten … zu bezahlen»; Feststellungsform nur über expliziten Typ mit Interesse-Warnhinweis |
| S2 | Unbezifferter Betrag («den ihr zustehenden Betrag») ohne Art.-85-Konstruktion | Nichteintreten (Prozessvoraussetzung!) | Pflichtfeld Betrag ODER Wechsel auf Art.-85-Baustein mit Pflicht-Mindestwert (Gate existiert in `kvMaengel`, übernehmen) |
| S3 | «samt Zinsen» ohne Satz und Anfangsdatum | Zins nicht zugesprochen | Zins-Baustein verlangt Satz + Datum gemeinsam; Default 5 % (Art. 104 I OR) wählbar |
| S4 | Bedingtes Hauptbegehren («sofern …») | unzulässig, Rückweisung/Nichteintreten | kein Freitext-Konditional im generierten Kernbegehren; bedingte ANSPRÜCHE über eigenen Baustein «falls und solange …» (R8 lit. a) |
| S5 | Rechtsgrundlage/Begründung im Begehren («gestützt auf Ziff. 3 des Vertrags») | unschön bis schädlich (Streitgegenstand-Verengung) | Generator hält Begehren begründungsfrei; Vertrag/Norm nur in Begründungs-Bausteinen |
| S6 | Kostenfolge unvollständig («unter Kosten- und Entschädigungsfolgen.» ohne Adressat, ohne MWST-Entscheid) | Parteientschädigung ohne MWST-Zusatz; Unklarheit | fester Kosten-Baustein «… zulasten der beklagten Partei», MWST-Schalter (R6), Solidar-Zusatz bei Mehrparteien |
| S7 | Unterlassungsbegehren zu allgemein («zu verbieten, den Kläger in seiner Persönlichkeit zu verletzen») | nicht vollstreckbar → unzulässig | Unterlassungs-Baustein erzwingt konkretes Verhalten-Feld; Hint «eng und bestimmt umschreiben, Charakteristikum der Verletzung» |
| S8 | Herausgabebegehren ohne Individualisierung («die streitige Maschine») | nicht vollstreckbar | Pflichtfelder Gegenstand/Identifikationsmerkmale (Marke, Nummer, Standort) |
| S9 | Falsche Währung (CHF statt geschuldeter Fremdwährung) | Klageabweisung | Währungsfeld + Warnhinweis (R4) |
| S10 | Brutto/netto nicht deklariert (Arbeitsrecht) | Vollstreckungsprobleme, Streit | Pflicht-Schalter brutto/netto bei Materie Arbeit (R5) |
| S11 | Teilklage ohne Vorbehalt, Nachklage später | Erlass-Deutung/Art. 2 ZGB-Einwand | optionaler Baustein «Mehrforderung vorbehalten» mit Hint (R13) |
| S12 | Stufenklage ohne materiellen Hilfsanspruch (nur Editionsantrag) | keine Stufenklage, Bezifferungspflicht verletzt | Stufenklage-Baustein verlangt Auswahl der Anspruchsgrundlage (Katalog R12) |
| S13 | Vollstreckungsantrag vergessen (Nicht-Geldleistung) | zweites Verfahren vor Vollstreckungsgericht | Vollstreckungs-Baustein als Vorschlag, wenn Begehren-Typ ≠ Geld (R14) |
| S14 | Prozessuale Anträge mit Rechtsbegehren vermischt | Übersehen durch Gericht | getrennte Blöcke `OK07`/`OK08` (R15) |
| S15 | Eventualbegehren zum Streitwert gerechnet / Alternativbegehren gestellt | falscher Vorschuss bzw. Unzulässigkeit | Streitwert-Logik ignoriert Eventualbegehren (Art. 91 I); keine Alternativ-Konstrukte im Generator |
| S16 | Klage der falschen Partei nach Urteilsvorschlag/Klagebewilligung (wer muss klagen?) | Fristverlust | bestehende Klagefristen-Engine + Hinweis, dass nach abgelehntem Urteilsvorschlag die ablehnende bzw. in der KB bezeichnete Partei klagen muss (P19 § 6: Vermieter klagt auf Feststellung der Gültigkeit der eigenen Kündigung!) |

Das Übungs-Beispiel «Finden Sie die 6 Fehler» aus P2 kombiniert S1, S5, S2,
S3, S4 und S6 in einem einzigen Begehren — als Regressionstest-Fixture für den
Generator geeignet (Eingabe der 6 Felder → erwartetes korrektes Begehren).

---

## 4. Baustein-Katalog: deterministische Begehren-Muster

Notation: `{{feld}}` = Pflicht-Platzhalter, `[[…]]` = optionaler Baustein.
Alle Formeln eigene Fassung (Standardformeln). «Unter Kosten- und
Entschädigungsfolgen [[zzgl. MwSt.]] zulasten der beklagten Partei.» (= KO)
wird überall als Schlussziffer angefügt und unten nicht wiederholt.

### 4.1 Generische Kern-Bausteine (G — tragen jede Materie)

| ID | Typ | Muster |
|---|---|---|
| G1 | Zahlung | «Die beklagte Partei sei zu verpflichten, der klagenden Partei {{waehrung}} {{betrag}} [[brutto/netto]] [[zuzüglich Mehrwertsteuer]] nebst Zins zu {{satz}} % seit {{datum}} zu bezahlen.» |
| G1a | Zahlung, mehrere Zinsläufe | «… {{waehrung}} {{total}} nebst Zins zu {{satz}} % auf {{betrag1}} seit {{datum1}} und auf {{betrag2}} seit {{datum2}} zu bezahlen.» |
| G1b | Zahlung, solidarisch | «Die Beklagten 1–{{n}} seien unter solidarischer Haftung zu verpflichten, …» |
| G2 | Herausgabe | «Die beklagte Partei sei [[unter Androhung der Zwangsvollstreckung (Art. 343 Abs. 1 lit. d ZPO) im Unterlassungsfall]] zu verpflichten, der klagenden Partei {{gegenstand mit Identifikationsmerkmalen}} [[innert {{x}} Tagen seit Eintritt der Rechtskraft]] herauszugeben.» |
| G3 | Vornahme einer Handlung | «Die beklagte Partei sei [[unter Androhung der Bestrafung nach Art. 292 StGB im Unterlassungsfall]] zu verpflichten, innert {{x}} Tagen seit Eintritt der Rechtskraft {{handlung}}.» |
| G4 | Unterlassung | «Es sei der beklagten Partei unter Androhung der Bestrafung [[ihrer verantwortlichen Organe]] nach Art. 292 StGB im Widerhandlungsfall zu verbieten, {{konkret umschriebenes Verhalten}}.» |
| G5 | Zug um Zug | «Die beklagte Partei sei zu verpflichten, der klagenden Partei {{leistung}}, Zug um Zug gegen {{gegenleistung}}.» |
| G6 | Abgabe einer Willenserklärung | «1. Die beklagte Partei sei zur Abgabe folgender Willenserklärung zu verpflichten: ‹{{erklaerung}}›. 2. Es sei der beklagten Partei eine Frist von {{x}} Tagen ab Rechtskraft anzusetzen, die Erklärung gemäss Ziff. 1 abzugeben, mit der Androhung, dass bei unbenütztem Ablauf das Urteil die Erklärung ersetze.» |
| G7 | Unbezifferte Forderung (Art. 85) | «Die beklagte Partei sei zu verpflichten, der klagenden Partei einen nach Durchführung des Beweisverfahrens zu beziffernden Betrag, mindestens jedoch CHF {{mindestwert}}, nebst Zins zu {{satz}} % seit {{datum}} zu bezahlen.» |
| G8 | Stufenklage | «1. Die beklagte Partei sei [[unter Androhung der Bestrafung nach Art. 292 StGB]] zu verpflichten, der klagenden Partei über {{gegenstand}} für den Zeitraum {{von–bis}} Auskunft zu erteilen und Rechnung zu legen, unter Vorlage von {{belege}}. 2. Die beklagte Partei sei zu verpflichten, der klagenden Partei den nach erfolgter Auskunft gemäss Ziff. 1 zu beziffernden Betrag, mindestens jedoch CHF {{mindestwert}}, nebst Zins … zu bezahlen.» |
| G9+ | Positive Feststellung | «Es sei festzustellen, dass {{recht/rechtsverhaeltnis}} besteht.» |
| G9− | Negative Feststellung | «Es sei festzustellen, dass die klagende Partei der beklagten Partei aus {{rechtsverhaeltnis}} nichts schuldet[[, insbesondere nicht den Betrag von {{waehrung}} {{betrag}}]].» |
| G10 | Gestaltung | «{{rechtsverhaeltnis/beschluss/verfuegung}} sei {{aufzuheben / für ungültig zu erklären / zu ändern in …}}.» |
| G11 | Eventualstaffel | «Eventualiter sei …» / «Subeventualiter sei …» (je eigene Ziffer, nach dem Hauptbegehren) |
| G12 | Teilklage-Vorbehalt | Zusatz «; Mehrforderung bleibt ausdrücklich vorbehalten.» bzw. eigene Ziffer «Es sei davon Vormerk zu nehmen, dass es sich um eine Teilklage handelt und die Nachklage vorbehalten bleibt.» |
| G13 | Direkte Vollstreckung | «{{vollstreckungsbehoerde}} sei anzuweisen, die Verpflichtung gemäss Ziff. {{n}} nach Eintritt der Rechtskraft auf erstes Verlangen der klagenden Partei zu vollstrecken[[, mittels {{massnahme nach Art. 343 Abs. 1 ZPO}}, nötigenfalls unter Beizug der Polizei]].» |
| G14 | Bedingter Anspruch (zulässig) | «… zu bezahlen, falls und solange {{bedingung des materiellen Anspruchs}}.» |

### 4.2 Forderung aus Vertrag (Kauf/Werkvertrag — P3, P19 § 1)

| Fall | Muster (Kern) |
|---|---|
| Erfüllungsklage Käufer (Gattungsware, mit Vollstreckung) | «1. Die Beklagte sei unter Androhung der Bestrafung ihrer verantwortlichen Organe nach Art. 292 StGB im Unterlassungsfall zu verpflichten, der Klägerin {{menge}} {{ware mit Typ-/Bestellnummer}} gemäss Bestellung vom {{datum}} an {{lieferadresse}} zu liefern. 2. [G13 mit Wegnahme nach Art. 343 I lit. d, Lagerort nennen].» |
| Verzug, Festhalten am Vertrag (Art. 107 II OR) | «1. [G5: Lieferung Zug um Zug gegen Kaufpreis]. 2. [G1: Verspätungsschaden].» |
| Verzug, Verzicht auf Leistung (pos. Interesse) | «[G1: Schadenersatz nebst Zins seit {{verzichtserklaerung}}].» |
| Verzug, Rücktritt (neg. Interesse) | «[G1: Schadenersatz aus dem Dahinfallen des Vertrags].» |
| Wandelung Werkvertrag (Art. 368 I OR) | «1. Der zwischen den Parteien am {{datum}} geschlossene Werkvertrag sei zu wandeln, und die beklagte Partei sei zu verpflichten, der klagenden Partei den bezahlten Werklohn von CHF {{betrag}} nebst Zins … Zug um Zug gegen Rückgabe des Werks zurückzuerstatten. 2. [G1: Schadenersatz].» |
| Minderung (Art. 368 II OR) | «1. Der im Vertrag vom {{datum}} vereinbarte Werklohn sei um CHF {{minderwert}} herabzusetzen, und die beklagte Partei sei zu verpflichten, der klagenden Partei diesen Betrag nebst Zins … zurückzuerstatten.» |

Praxis-Kern aus P19 § 1: VOR der Erfüllungsklage Vollstreckbarkeit prüfen
(Auslandsbeklagte: indirekter Zwang läuft leer; Wegnahme nur, solange die Ware
greifbar in der Schweiz liegt) — als Hinweis-Baustein, nicht als Gate.

### 4.3 Arbeitsrecht (P3, P19 § 9)

| Fall | Muster (Kern) | Bemerkung |
|---|---|---|
| Lohn/Überstunden | «… CHF {{betrag}} **brutto** nebst Zins zu 5 % seit {{faelligkeit}} zu bezahlen.» | R5 |
| Bonus/Lohn nach Ermessen (Art. 322a/42 II OR analog) | «… einen vom Gericht durch Schätzung festzulegenden Betrag, [[mindestens CHF {{x}},]] nebst Zins … zu bezahlen.» | unbeziffert, str. Grundlage offenlegen |
| Entschädigung missbräuchliche Kündigung (336a) | «… eine Entschädigung von CHF {{betrag}} **netto** [bzw. {{n}} Monatslöhnen] nebst Zins zu 5 % seit {{beendigung}} zu bezahlen.» | netto; 180-Tage-Frist 336b II (Klagefrist-Preset existiert) |
| Lohnfortzahlung nach fristloser Entlassung (337c I/II) | «… CHF {{betrag}} brutto nebst Zins … zu bezahlen, vorbehältlich der nachträglichen Reduktion der Klage im Falle des Antritts einer neuen Stelle vor Ablauf der hypothetischen ordentlichen Kündigungsfrist.» | zulässiger Reduktions-Vorbehalt (Kostenrisiko-Steuerung, P19) |
| Pönale 337c III | «… CHF {{betrag}} **netto** … » (max. 6 Monatslöhne) | netto |
| Arbeitszeugnis | «Die beklagte Partei sei zu verpflichten, der klagenden Partei ein auf den {{datum}} datiertes Arbeitszeugnis mit folgendem Wortlaut aus- und zuzustellen: ‹{{wortlaut bzw. Verweis auf Anhang}}›.» | abzuändernde Passagen KONKRET beantragen; kein Feststellungsbegehren «Kündigung sei ungerechtfertigt» (S1) |
| Konkurrenzverbot (Arbeitgeber) | [G4 mit Tätigkeitsumschreibung + Befristung] + [G1 Konventionalstrafe, «Mehrforderung vorbehalten»] | P3 |

### 4.4 Mietrecht (P3, P19 §§ 6–8) — inkl. Erstreckung/Anfechtung

| Fall | Muster (Kern) | Bemerkung |
|---|---|---|
| Mieter: Anfechtung ordentliche/ao. Kündigung | «1. Es sei festzustellen, dass die mit amtlichem Formular vom {{datum}} per {{termin}} ausgesprochene Kündigung des Mietverhältnisses über {{objekt}} ungültig/missbräuchlich ist und das Mietverhältnis fortbesteht. 2. Eventualiter sei das Mietverhältnis um {{dauer}} zu erstrecken.» | 30 Tage zur Schlichtungsbehörde; Eventual-Erstreckung zählt nicht zum Streitwert (Art. 91 I; P19 § 6 Bem. 7) |
| Mieter: Erstreckung (befristet/nach gültiger Kündigung) | «Das Mietverhältnis über {{objekt}} sei erstmals um {{dauer}}, d.h. bis {{datum}}, zu erstrecken.» | BEZIFFERN statt «längstmöglich» (sonst Streitwert-Streit, Art. 85-Notbehelf des Vermieters: 1 Brutto-Monatszins als Mindestwert; P19 § 6 Bem. 6); Fristen 273 II OR |
| Vermieter: Klage nach abgelehntem Urteilsvorschlag (Kündigungsschutz) | «1. Es sei festzustellen, dass die mit amtlichem Formular vom {{datum}} per {{termin}} erklärte Kündigung … gültig ist. 2. Es sei ein allenfalls gestelltes Begehren um Erstreckung vollumfänglich abzuweisen[[, soweit damit mehr oder anderes als eine einmalige und definitive Erstreckung bis {{datum}} beantragt wird]].» | Kuriosum: klagende Partei kennt die Anträge der Gegenseite noch nicht — Begehren orientieren sich an deren Schlichtungs-Begehren (P19 § 6) |
| Mieter: Anfechtung Anfangsmietzins (270 OR) | «1. Der monatliche Nettomietzins für {{objekt}} sei ab Mietbeginn auf CHF {{betrag}} herabzusetzen. 2. Die beklagte Partei sei zu verpflichten, der klagenden Partei die zu viel bezahlten Mietzinse von CHF {{betrag}} nebst Zins zu 5 % seit {{mittlerer verfall}} zurückzuerstatten.» | 30 Tage seit Übernahme |
| Mieter: Herabsetzung während Mietdauer (270a) / Anfechtung Erhöhung (270b) | Gestaltungsbegehren auf Herabsetzung bzw. «Die mit Formular vom {{datum}} per {{termin}} angezeigte Mietzinserhöhung sei ungültig zu erklären, eventualiter auf CHF {{betrag}} herabzusetzen.» | Gestaltungsklage (BGE 146 III 346) |
| Vermieter: Erhöhung nach Mieter-Anfechtung + abgelehntem Urteilsvorschlag | «Es sei festzustellen, dass der Mietzins von CHF {{betrag}} netto p.a. für {{objekt}} nicht missbräuchlich ist.» | Feststellungsklage (BGer 4A_616/2020 — Praxis-Parameter, s. Verfallsregister-Kandidaten); Streitwert: 20 × Jahresdifferenz der zuletzt strittigen Anträge (Art. 92 II) |
| Vermieter: Ausweisung (klarer Fall, 257 ZPO) + Forderung | «1. Es sei den Beklagten unter Androhung der Zwangsvollstreckung im Unterlassungsfall zu befehlen, {{objekt}} unverzüglich vertragskonform geräumt und gereinigt zu verlassen und der Klägerin zurückzugeben. 2. [dito Nebenobjekte]. 3. [G1 Mietzins-Ausstand, ‹unter ausdrücklichem Vorbehalt der Nachklage›, Zins ab mittlerem Verfall — nur gegen den Mieter selbst]. 4. {{bank}} sei anzuweisen, den Saldo des Mietzins-Kautionskontos Nr. {{nr}} nach Rechtskraft zugunsten der Klägerin freizugeben. 5. [G13 Vollstreckungsanweisung].» | Kombination Geldforderung im Summarverfahren NICHT empfohlen (illiquide) — eher Zweitverfahren; Solidarhaft nur für Ausweisung, nicht für Mietzins (P19 § 8) |

**Streitwert-Regeln Miete (für die Streitwert-Engine):** Kündigungsschutz =
Bruttomietzins der 3-jährigen Sperrfrist + Zeitraum bis zur nächsten
Kündigungsmöglichkeit (BGE 137 III 389); nur Erstreckung = Mietzins der
beantragten Erstreckungsdauer; Eventual-Erstreckung zählt nicht.

### 4.5 Erbrecht (P10, P16)

| Fall | Muster (Kern) | Bemerkung |
|---|---|---|
| Ungültigkeitsklage (519) | «Das am {{datum}} von {{erblasser}}, verstorben am {{datum}}, errichtete Testament [bzw. Ziff. {{n}} davon] sei für ungültig zu erklären. [[2. Es sei festzustellen, dass die Kläger als gesetzliche Erben je zu {{quote}} am Nachlass beteiligt sind.]]» | zwingend GESTALTUNGS-, nicht Feststellungsform; Ungültigkeitsgrund NICHT ins Begehren; Klausel «Klage nur zur Fristwahrung, kein Entscheid über Annahme/Ausschlagung» in die Begründung (Einmischungsgefahr) |
| Nichtigkeit (Exkurs) | «Es sei festzustellen, dass das am {{datum}} errichtete Testament … nichtig ist.» | Feststellungsklage, unverjährbar |
| Herabsetzungsklage (522) — Vier-Stufen-Schema | «1. Es sei festzustellen, dass der Nachlass von {{erblasser}} die im Inventar aufgeführten Aktiven und Passiven von insgesamt CHF {{wert}} umfasst. 2. Es sei festzustellen, dass der Pflichtteil der klagenden Partei {{bruch}} beträgt. 3. Die lebzeitige Zuwendung an die beklagte Partei von CHF {{betrag}} sei herabzusetzen, soweit dies zur Wahrung des Pflichtteils erforderlich ist. 4. Die beklagte Partei sei zu verpflichten, der klagenden Partei CHF {{betrag}} nebst Zins zu 5 % seit Klageeinleitung zu bezahlen.» | Zins ab Klageeinleitung (bei Bösgläubigkeit ab Todestag, Art. 528); proportionale Varianten (mehrere Begünstigte) möglich; Erbanteil/Pflichtteil als Bruch genügt der Bezifferung (P1) |
| Erbschaftsklage (598) | «Die beklagte Partei sei zu verurteilen, den Klägern (a) {{einzeln bezeichnete Sachen}}, (b) den Erlös aus {{veräusserte Sache}} von CHF {{betrag}} nebst Zins seit Klageeinleitung sowie (c) alle weiteren in ihrem Besitz befindlichen Sachen und Rechte, die zur Erbschaft des am {{datum}} verstorbenen {{erblasser}} gehören, herauszugeben. [[+ Grundbuch-/Bank-Anweisungen]]» | Kombination Singular- + subsidiäre Gesamtklage = beste Praxis |
| Ausgleichungsklage (626) — Leistung | «1. Die beklagte Partei sei zu verurteilen, {{zuwendung}} (a) in die Erbmasse einzuwerfen oder (b) sich mit dem gerichtlich zu ermittelnden Wert anrechnen zu lassen. 2. Der beklagten Partei sei Frist zur Ausübung der Wahl nach Ziff. 1a/1b anzusetzen, unter Androhung, dass bei unbenütztem Ablauf das Urteil nach Ziff. 1b ergeht.» | Wahlrecht des Beklagten (628) abbilden |
| Ausgleichung — reine Feststellungsklage | «Es sei festzustellen, dass die Schenkung von CHF {{betrag}} an die beklagte Partei eine ausgleichungspflichtige Zuwendung darstellt, die der Berechnungsmasse hinzuzurechnen und an den Erbteil der beklagten Partei anzurechnen ist.» | zulässig trotz R10 (Spezialfall) |
| Erbteilungsklage (604) | «1. Es sei der Nachlass des am {{datum}} verstorbenen {{erblasser}} festzustellen (Aktiven/Passiven gemäss Beilage {{n}}). 2. Es sei festzustellen, dass die klagende Partei zu {{quote}} berechtigt ist. 3.a Es seien {{n}} gleichwertige Lose zu bilden mit folgender Zuweisung: {{lose}}; 3.b der klagenden Partei sei Los {{x}} zuzuweisen. 4. Die klagende Partei sei von allen nicht ihrem Los zugewiesenen Erbschaftspassiven zu entlasten.» | abstraktes Begehren «Der Nachlass sei festzustellen und zu teilen» unter eidg. ZPO UMSTRITTEN/ungeklärt — Engine erzeugt das konkrete Schema, abstrakt nur als dokumentierter Fallback; mit Stufenklage (G8) kombinierbar bei Auskunftsverweigerung |

### 4.6 Haftpflichtrecht (P12)

- Kern = G1/G1a/G1b (Schadenersatz + Genugtuung je eigene Ziffer, Schadenszins
  ab Schadenseintritt), G7 (unbezifferte Klage: Abgrenzung Art. 42 II OR
  [Beweismass] vs. Art. 85 ZPO [Bezifferung] beachten — beides kann kumulieren),
  G8 (Stufenklage), G12 (Teilklage als «Testprozess», Nachklagevorbehalt),
  G1b (Solidarhaftung mehrerer Ersatzpflichtiger).
- Streitverkündungsklage: eigene Begehren im laufenden Prozess («Im Falle des
  Unterliegens im Hauptprozess sei die streitverkündungsbeklagte Partei zu
  verpflichten, der Streitverkündungsklägerin … zu bezahlen» — Anspruchs-,
  nicht Begehrens-Bedingung); Zulassungsantrag nach Art. 82 ZPO nötig.
  Für die Vorlage Erstausbau AUSSER Scope (eigene Parteirollen-Logik).
- Adhäsionsklage (Art. 122 ff. StPO) nur als Wegweiser-Notiz.

### 4.7 Personen- und Sachenrecht (P3, P5, P9, P13)

- Persönlichkeitsschutz 28a ZGB: G4 (Unterlassung, Verhalten exakt), G3
  (Beseitigung mit Frist + Ersatzvornahme-Ermächtigung), G9 (Feststellung der
  widerrechtlichen Verletzung — gesetzlich typisiert), je + Art.-292-Androhung.
- Vindikation 641 II: G2 mit Identifikationsmerkmalen.
- Actio negatoria/Immissionen: G3/G4 mit konkretem Massnahmenkatalog
  (P13-Beispiel: Massnahmen a–c einzeln aufzählen statt «übermässige
  Einwirkungen zu unterlassen»).
- Bauhandwerkerpfandrecht: «Das Grundbuchamt {{amt}} sei anzuweisen, zulasten
  des Grundstücks {{gb-bezeichnung}} und zugunsten der gesuchstellenden Partei
  die VORLÄUFIGE Eintragung eines Bauhandwerkerpfandrechts für die Pfandsumme
  von CHF {{betrag}} nebst Zins zu {{satz}} % seit {{datum}} vorzumerken.»
  (superprovisorisch beantragbar; 4-Monats-Frist — Rechner-Idee bereits in
  `querschnitt-spezialrechner.md`).
- Grundbuchberichtigung 975: «Das Grundbuchamt sei anzuweisen, {{eintrag}} zu
  löschen/zu berichtigen und {{partei}} als Eigentümerin einzutragen.»

### 4.8 Gesellschaftsrecht (P15, P3)

- Anfechtung GV-Beschluss (706 OR): «1. Der Beschluss der Generalversammlung
  der Beklagten vom {{datum}} betreffend {{traktandum}} sei aufzuheben.
  2. Eventualiter sei dessen Nichtigkeit festzustellen. 3. [[HReg-Anweisung,
  Eintragung abzuweisen]].» + Massnahmebegehren Registersperre (162 HRegV).
- Auflösungsklage (736 Ziff. 4): «Die {{firma}} mit Sitz in {{ort}} sei
  aufzulösen[[; als Liquidator sei {{person}} einzusetzen]].»
- Verantwortlichkeitsklage (754): G1b mit «unter solidarischer Haftung …,
  wobei die individuelle Ersatzpflicht der Beklagten durch das Gericht
  festzusetzen sei» + Nachklagevorbehalt; Leistung AN DIE GESELLSCHAFT bei
  mittelbarem Schaden.
- Einberufungsklage (699 OR): Begehren mit Traktanden + Beschlussanträgen +
  Durchführungsmodalitäten (Notar, Fristen) — hochgradig fallabhängig, für
  Vorlagen-Erstausbau ausser Scope.
- Auskunft/Einsicht (697) und Sonderprüfung (697a ff.): Fragenkatalog als
  nummerierte Unterpunkte des Begehrens; thematische Kongruenz mit dem in der
  GV gestellten Begehren nötig.

### 4.9 SchKG-Schnittstellen (P14, P3 — nur soweit die KLAGE betroffen ist)

- Beseitigung des Rechtsvorschlags in der Anerkennungsklage (Art. 79 SchKG):
  Zusatzziffer «Der Rechtsvorschlag in der Betreibung Nr. {{nr}} des
  Betreibungsamts {{amt}} (Zahlungsbefehl vom {{datum}}) sei zu beseitigen.»
  — existiert sinngemäss schon in `klageVereinfacht.ts` (`rechtsoeffnung`);
  Formulierungs-Update: Betreibungsamt + Zahlungsbefehl-Datum aufnehmen.
- Paulianische Anfechtung, Arrest, Kollokation: eigene Verfahrenswege; nur
  als Katalog-Wegweiser, nicht Teil der Klage-Vorlage.

### 4.10 Erstausbau-Empfehlung (Scope-Schnitt für den Neubau)

Deterministisch und mit vertretbarem UI-Aufwand im ERSTEN Wurf: G1/G1a/G1b,
G7, G9−, G11, G12, KO mit MWST-Schalter, RV-Beseitigung, Verfahrensanträge-
Block (Freitext-Liste), Formelles-Generator (aus Routing), Pflicht-Begründung
(Behauptung+BO), Beweismittelverzeichnis. — G2–G6/G8/G13 als zweite Welle
(je 1–2 Zusatzfelder). Materien-Kataloge (4.3–4.8) als Preset-Schicht über
den G-Bausteinen, NICHT als eigene Engines (§4/§10).

---

## 5. Delta zur gebauten Vorlage `klageVereinfacht.ts`

### 5.1 Was die gebaute Vorlage schon kann (wiederverwendbar)

| Fähigkeit | Befund |
|---|---|
| Rubrum, Parteien (`SgPartei`), Vertretungszeile, Gerichts-Kaskade (BS-Stammdaten → kantonale Auflösung → manuell), Export-Gates | trägt 1:1 — `parteiZeilen`/`behoerdeManuell` sind vorlagenneutral |
| Begehren beziffert (G1 mit einem Zinslauf) + unbeziffert (G7 mit Mindestwert) | Formulierungen decken R3/R11-Kern; Art.-85-Gate (`kvMaengel`) vorhanden |
| RV-Beseitigung, freie Zusatzbegehren, Kostenfolge als Schlussziffer | vorhanden (Kostenfolge OHNE MWST-Schalter) |
| Formelles-Generator (Zuständigkeit, Verfahrensart, KB/Verzicht/Art. 198, Kostenfreiheit) | Muster für `OK09_formelles`; Inhalte ordentlich = Streitwert>30k bzw. nichtvermögensrechtlich statt 243er-Materien |
| Klagebewilligungs-Fristen (Art. 209 III/IV inkl. Gerichtsferien) via `berechneFrist` | identisch nutzbar — die 3-Monats-Frist gilt auch für die ordentliche Klage |
| Streitgegenstand-Pflicht, Begründung als Behauptungs-/Beweismittel-Listen, Beilagen-Nummerierung, Doppel-Hinweis (131), Disclaimer | Grundgerüst für `OK10/OK15` |
| Prefill-Brücke Zuständigkeits-Wizard → Klage | Muster wiederverwenden (`kvPrefill*`) |

### 5.2 Was der ordentlichen Klage FEHLT (Neubau-Pflichten)

| # | Lücke | Norm/Regel | Schwere |
|---|---|---|---|
| D1 | Begründung ist PFLICHT, nicht optional: Tatsachenbehauptungen + Beweismittel JE BEHAUPTUNG zugeordnet (heute: zwei getrennte Listen, `begruendungAktiv` default aus, Verzichts-Baustein K09 wäre im ordentlichen Verfahren FALSCH) | Art. 221 I lit. d/e | hoch |
| D2 | Streitwert immer Pflichtangabe + Berechnungs-Hinweis im Formellen (Art. 91/92; 20×-Regel für wiederkehrende Leistungen; Eventualbegehren zählen nicht) | Art. 221 I lit. c | hoch |
| D3 | Begehren-Typen: nur Zahlung; es fehlen G2–G6, G8, G11 (Eventualstaffel!), G12 (Teilklage-Vorbehalt), G13, G14 sowie strukturierte MEHRFACH-Begehren mit Zins je Position (G1a) und Solidarhaftung (G1b) | R2 ff. | hoch |
| D4 | Kostenfolge ohne MWST-Schalter und ohne Solidar-Zusatz | R6 | mittel |
| D5 | Kein Verfahrensanträge-Block (`OK08`) | R15 | mittel |
| D6 | Kein Rechtliches-Kapitel (optional, Art. 221 III) und kein Formelles-Unterkapitel Sachlegitimation/Feststellungsinteresse | P17/P18 | mittel |
| D7 | Beweismittelverzeichnis: nur Bezeichnung+`fuer`; es fehlen Beweismittel-ARTEN (Urkunde/Zeuge mit Adresse/Parteibefragung/Gutachten/Augenschein/Edition) gemäss P17-Verzeichnisstruktur | Art. 221 II lit. d | mittel |
| D8 | Routing: ordentliches Verfahren = Auffangbecken (`stopp:'ordentlich'` der KV-Vorlage wird zum EINSTIEG); sachliche Zuständigkeit kantonal verschieden, Handelsgerichts-Weiche (Art. 6 ZPO, vier Kantone) und 243er-Vorrang vor Handelsgericht (BGE 139 III 457) abbilden | Art. 4/6 | hoch |
| D9 | brutto/netto-Schalter (Arbeit), Währungsfeld, MWST-auf-Leistung | R4–R6 | mittel |
| D10 | Mehrparteien (Beklagte 1–n, «daselbst», Solidar-Kosten) | P19 § 8 | mittel (Erstausbau: 1–2 Beklagte) |
| D11 | Einleitungssatz mit KB-/Verzichts-Nennung VOR den Begehren (heute steckt die KB nur im Formellen + Beilage) | P19-Konvention | tief |
| D12 | Klage erfordert im ordentlichen Verfahren idR anwaltliche Sorgfaltstiefe → `ausgabeArt`/Banner-Entscheid («Gerüst» vs. «fertig») ist FACHENTSCHEID David | §8 | — |

### 5.3 Härtungs-Kandidaten für `klageVereinfacht.ts` (klein, ohne Neubau)

1. **MWST-Schalter Kostenfolge** (D4) — auch im vereinfachten Verfahren üblich.
2. **Teilklage-Vorbehalt** als optionaler Begehren-Zusatz (R13/S11).
3. **brutto/netto-Schalter** bei Materie `arbeit` (R5/S10).
4. **RV-Beseitigung präzisieren**: Betreibungsamt + Zahlungsbefehl-Datum (4.9).
5. **Zins-Hint**: Default 5 % (Art. 104 I OR) anbieten statt leerem Feld.
6. **Eventual-Erstreckung** als zweite Begehren-Ziffer bei `miete_kernbereich`
   (Kündigungsanfechtung) — Muster 4.4 Zeile 1.
7. K09-Verzichtstext bleibt korrekt (Art. 244 II), aber ein Hinweis, dass die
   Begründung im BESTRITTENEN Fall faktisch nötig wird, wäre ehrlicher (§8).

---

## 6. Quellen-Lücken / Negativbefunde (S5)

1. **ZPO-Revision 2025 fehlt in ALLEN Privatquellen** (alle ≤ 2022): Art. 85
   Abs. 2 neu (Gericht setzt Frist zur Bezifferung; Zuständigkeits-Fortdauer
   bei Überschreiten) und Art. 90 Abs. 2 neu (Klagenhäufung trotz
   streitwertbedingt verschiedener Verfahrensart) — hier am Cache 20250101
   verifiziert und eingearbeitet; beim Bau NICHT die Quellen-, sondern die
   Cache-Fassung verwenden.
2. **P2 (Stolpersteine) ist Stand 2014**: zitierte MWST-Praxis («zzgl. 8 %»)
   und einzelne BGE-Stände datiert; die Folien-Regeln wurden nur als
   Struktur-Regeln übernommen, alle Norm-Kerne neu verifiziert.
3. **P7 (Homburger) ist vor-eidgenössisch** (zitiert §§ ZPO ZH, OG statt BGG):
   nur die Muster-FORMELN verwertet, sämtliche Verfahrenszitate verworfen.
4. **P8 (Rechtsbegehren-Skript)**: schlechter OCR-Scan, Herkunft/Autor unklar
   («Muster»-Disclaimer einer Kanzlei) — nur strukturell gesichtet
   (I. Personenrecht, II. Familienrecht, III. Erbrecht, IV. OR-Klagen);
   als Beleg unbrauchbar.
5. **P6 (BL 2019)** ist ausdrücklich «under construction» und inhaltlich
   weitgehend Kopie von P5 (BS 2016) mit BL-EG-ZPO-Angaben; P4 (339 S.) ist
   dieselbe Familie ohne Inhaltsverzeichnis. KEIN eigenständiger Mehrwert
   über P3/P5 hinaus festgestellt.
6. **Kantonale Angaben der Sammlungen (P3–P6)** (Spruchkörper, Tarifordnungen
   BL/BS, EG-ZPO-Paragraphen) sind 2016/2019 datiert und wurden NICHT
   übernommen — bei Bedarf gegen geltendes kantonales Recht neu erheben
   (eigene Recherche-Schicht existiert: `data/zivilgerichteErstinstanz.ts`).
7. **Keine Quelle liefert Muster für KLAGEANTWORT/WIDERKLAGE in Vollform**;
   P5 enthält nur Kurz-Begehren («Die Klage sei vollumfänglich abzuweisen» /
   Nichteintreten + eventualiter Abweisung; Widerklage-Ziffern). Für eine
   spätere Vorlage «Klageantwort» braucht es zusätzliche Grundlagen.
8. **Musterklagen-Datei «§ 9» enthält ZWEI Klagen** (ordentliche Kündigung
   und fristlose Entlassung) — die zweite gehört systematisch zu § 10; beim
   Zitieren auf Randziffern, nicht auf Datei-Titel abstellen.
9. **Kein amtliches Klage-Formular**: keine der Quellen kennt (und das
   Quellen-Register führt) ein amtliches Formular für die ordentliche Klage —
   die Klage ist eine frei strukturierte Rechtsschrift; einzige Formzwänge
   sind Art. 221 + Unterschrift + Beilagen. (Abgrenzung: amtliche Formulare
   existieren für Miet-Kündigung/Mietzinserhöhung — andere Baustelle.)
10. **Werkzeug-Notiz** (Reproduzierbarkeit): `pdftotext`/`pdftoppm` fehlen auf
    dem System; Extraktion erfolgte mit `pypdf` 6.12.2 (reine Text-Extraktion,
    keine Inhaltsänderung), Plausibilisierung an den im Chat mitgelesenen
    Original-PDFs (P1, P2, P7).

---

## Verfallsregister-Kandidaten (durch Hauptsession zu registrieren)

| Parameter | Fundstelle im Dossier | Stand | Prüfrhythmus-Vorschlag |
|---|---|---|---|
| MWST-Normalsatz für «zzgl. MwSt.»-Bausteine (Quellen nennen 7,7 %/8 %; seit 1.1.2024 gilt 8,1 % — im Dossier bewusst NIE beziffert, Engine soll Satz parametrisieren oder ganz weglassen) | § 2 R6, § 4 KO-Baustein | 10.6.2026 | jährlich (MWST-Sätze) |
| Verzugszins-Default 5 % (Art. 104 I OR) in G1/G7-Mustern | § 4.1 | OR-Cache 1.1.2026 | bei OR-Re-Pin |
| BGer-Praxis «Vermieter-Klage betr. Mietzinserhöhung = Feststellungsklage» (4A_616/2020) als Begehren-Weiche | § 4.4 | Urteil 6.5.2021 (via P19, 2022) | bei Miet-Dossier-Pflege / neuer BGE |
| Zulässigkeit des abstrakten Erbteilungs-Begehrens unter eidg. ZPO (offen, BGer nicht entschieden gem. P10/2017) | § 4.5 | 2017/2018 | vor Bau einer Erbteilungs-Vorlage neu prüfen |
| Streitwert-Formeln Miete (3-Jahres-Sperrfrist-Regel BGE 137 III 389; 20×-Regel Art. 92 II) | § 4.4 | Cache 20250101 / BGE | bei ZPO-Re-Pin |
| Ordnungsbussen-Beträge Art. 343 I lit. b/c (5000/1000) in G13/G4-Hinweisen | § 2 R14 | Cache 20250101 | bei ZPO-Re-Pin |
