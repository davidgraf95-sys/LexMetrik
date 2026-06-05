# ZPO-Zuständigkeiten — Regelwerk (Deep Research)

**Erstellt:** 5.6.2026 · **Wortlaut-Quelle:** Fedlex-Filestore SR 272,
Konsolidierung 20250101 (Cache /tmp/zpo.html, reproduzierbar via
scripts/fedlex-cache.sh) · **Abrufdatum: 5.6.2026**
**Status: Arbeitsgrundlage für den Engine-Umbau — NICHT abgenommen.
Alle BGE-Angaben sind als SEKUNDÄR markiert, solange sie nicht an der
amtlichen Sammlung gegengeprüft sind (§7).**

Gliederung: Teil 1 (Art. 9–30) · Teil 2 (Art. 31–46) · Teil 3
(sachlich/funktionell Art. 4–8 + Systematik). Ergänzt die wörtlichen
Normtexte in [normtexte-zpo-zustaendigkeit.md](normtexte-zpo-zustaendigkeit.md).

---

## TEIL 1 — Art. 9–30 (Allgemeine Bestimmungen · Personen/Familie/Erb/Sachen)

_(Bericht ausstehend — wird hier ergänzt.)_

---

# ZPO — Örtliche Zuständigkeit, Teil 2: Art. 31–46

**Regelwerk für die Zuständigkeitsengine**
Quelle: Fedlex-Konsolidierung SR 272, Stand 20250101 (lokaler Cache `/tmp/zpo.html`, Anker `id="art_X"`). Abrufdatum: 5.6.2026.

**Revisionshinweis 1.1.2025 (vorab, gilt für ganzen Teil):** Die ZPO-Revision per 1.1.2025 (AS 2023 491, «Verbesserung der Praxistauglichkeit und der Rechtsdurchsetzung») hat **keinen** der Artikel 31–46 materiell geändert. Die 106 «in Kraft seit 1.1.2025»-Fundstellen im Erlass liegen sämtlich ausserhalb dieses Bereichs. Die jüngsten Änderungen in diesem Block stammen aus früheren Teilrevisionen: Art. 38a (Nuklearschäden, eingefügt per 1.1.2022), Art. 40 (Handelsregisterrecht, Fassung/Abs. 2 per 1.1.2021), Art. 41 (aufgehoben per 1.5.2013). **Für die Engine: keine Migration der Gerichtsstand-Logik in diesem Bereich nötig; Wortlaute 2025 = bisherige Fassung.**

Sektionsstruktur: 6. Abschnitt «Klagen aus Vertrag» (Art. 31–35) · 7. Abschnitt «Klagen aus unerlaubter Handlung» (Art. 36–39) · 8. Abschnitt «Handelsrecht» (Art. 40–45) · 9. Abschnitt «Schuldbetreibungs- und Konkursrecht» (Art. 46).

---

## Art. 31 — Grundsatz (Vertrag)

**1. Wortlaut-Kern:** «Für Klagen aus Vertrag ist das Gericht am Wohnsitz oder Sitz der beklagten Partei oder an dem Ort zuständig, an dem die charakteristische Leistung zu erbringen ist.»

**2. Bindungsgrad:** **Dispositiv** (alternative Gerichtsstände; abänderbar durch Gerichtsstandsvereinbarung Art. 17 oder Einlassung Art. 18 — Art. 35 schützt hier *nicht*, da nur Art. 32–34 erfasst).

**3. Anwendungsbereich/Abgrenzung:** Allgemeiner Vertragsgerichtsstand. Der Ort der charakteristischen Leistung ist **nicht** der Erfüllungsort nach Art. 74 OR, sondern bestimmt sich nach der charakteristischen (= vertragstypprägenden, i.d.R. nicht der Geld-) Leistung — beim Kauf die Ware, beim Werkvertrag das Werk usw. Subsidiär gegenüber den Spezialgerichtsständen Art. 32 (Konsument), 33 (Miete/Pacht), 34 (Arbeit), die als lex specialis vorgehen.

**4. Leitentscheide (Sekundär-Hinweis, Kommentarlage):** Lehre/Rechtsprechung stellen einhellig klar, dass «charakteristische Leistung» ≠ Erfüllungsort OR 74 ist (Geldschuld begründet keinen Gerichtsstand am Gläubigerwohnsitz). *Konkrete BGE-Belegstelle nicht aus amtlicher Primärquelle verifiziert — als Sekundär markiert.*

**5. Engine-Hinweis:** Erweitert die Kachel **geldforderung** um den deterministischen Zweig «Vertragsforderung»: Gerichtsstandsoptionen = {Wohnsitz/Sitz Beklagte} ∪ {Ort charakteristische Leistung}. Achtung: charakteristische Leistung ist nicht maschinell aus «Geldforderung» ableitbar → als wählbares Eingabefeld (Vertragstyp/Leistungsort) modellieren, nicht automatisch = Klägerwohnsitz setzen.

---

## Art. 32 — Konsumentenvertrag

**1. Wortlaut-Kern (vollständig):**
Abs. 1 — «Bei Streitigkeiten aus Konsumentenverträgen ist zuständig:
a. für Klagen der Konsumentin oder des Konsumenten: das Gericht am Wohnsitz oder Sitz einer der Parteien;
b. für Klagen der Anbieterin oder des Anbieters: das Gericht am Wohnsitz der beklagten Partei.»
Abs. 2 (**Definition**) — «Als Konsumentenverträge gelten Verträge über Leistungen des üblichen Verbrauchs, die für die persönlichen oder familiären Bedürfnisse der Konsumentin oder des Konsumenten bestimmt sind und von der anderen Partei im Rahmen ihrer beruflichen oder gewerblichen Tätigkeit angeboten werden.»

**2. Bindungsgrad:** **Teilzwingend** zugunsten des Konsumenten (vgl. Art. 35 Abs. 1 lit. a): Der Konsument kann auf diesen Gerichtsstand **nicht zum Voraus** und nicht durch Einlassung verzichten. Kein CHF-Schwellenwert in der Norm (verifiziert: kein «Franken» im Artikeltext).

**3. Anwendungsbereich/Abgrenzung:** Forum-actoris-Privileg: Klagt der Konsument, kann er am Wohnsitz **einer** Partei (auch seinem eigenen) klagen; klagt der Anbieter, nur am Wohnsitz des beklagten Konsumenten. Drei kumulative Definitionsmerkmale (Abs. 2): (i) Leistung des üblichen Verbrauchs, (ii) für persönliche/familiäre Bedürfnisse, (iii) Anbieter handelt beruflich/gewerblich. Abgrenzung zu Art. 31 (genereller Vertrag, wenn kein Konsumentenvertrag).

**4. Leitentscheide (Sekundär):** Rechtsprechung verlangt restriktive Auslegung von «üblicher Verbrauch» (z.B. keine grösseren Anlagegeschäfte). *Primär-BGE nicht aus amtlicher Quelle gegengeprüft — Sekundär.*

**5. Engine-Hinweis:** Neue Kachel-Logik **konsumentenvertrag** (oder Unterzweig von geldforderung): Verzweigung nach Rolle (Kläger = Konsument vs. Anbieter). Determinismus: bei Konsument-Kläger → 2 Optionen (Wohnsitz Konsument / Sitz Anbieter); bei Anbieter-Kläger → 1 Option (Wohnsitz Konsument). Verzichts-Sperre als Hard-Flag setzen (keine GSV im Engine-Output zulassen). Definition Abs. 2 ist ein Eingabe-Gate, nicht automatisch entscheidbar → Ja/Nein-Frage an Nutzer.

---

## Art. 33 — Miete und Pacht unbeweglicher Sachen

**1. Wortlaut-Kern:** «Für Klagen aus Miete und Pacht unbeweglicher Sachen ist das Gericht am Ort der gelegenen Sache zuständig.»

**2. Bindungsgrad:** **Teilzwingend** zugunsten der mietenden/pachtenden Partei (Art. 35 Abs. 1 lit. b für Wohn-/Geschäftsräume; lit. c für landwirtschaftliche Pacht). Für andere Konstellationen praktisch ausschliesslicher Gerichtsstand am Lageort.

**3. Anwendungsbereich/Abgrenzung:** Nur **unbewegliche** Sachen (Grundstücke/Räume). Forum rei sitae (Lage der Sache). Klagen aus Miete *beweglicher* Sachen fallen unter Art. 31. Erfasst mietrechtliche Streitigkeiten (Mietzins, Kündigung, Ausweisung, Mängel).

**4. Leitentscheide (Sekundär):** Lageortgerichtsstand gilt auch für Ausweisungsbegehren/Mietzinsklagen. *Sekundär.*

**5. Engine-Hinweis:** Schärft bestehende Kachel **miete**: Gerichtsstand deterministisch = Ort der gelegenen Sache (eindeutig, eine Option). Engine sollte Verzichtssperre (lit. b/c) berücksichtigen → bei Wohn-/Geschäftsraummiete bzw. landw. Pacht keine abweichende GSV im Output. Klar von Art. 31 trennen (nur unbewegliche Sachen).

---

## Art. 34 — Arbeitsrecht

**1. Wortlaut-Kern:**
Abs. 1 — «Für arbeitsrechtliche Klagen ist das Gericht am Wohnsitz oder Sitz der beklagten Partei oder an dem Ort, an dem die Arbeitnehmerin oder der Arbeitnehmer gewöhnlich die Arbeit verrichtet, zuständig.»
Abs. 2 — «Für Klagen einer stellensuchenden Person sowie einer Arbeitnehmerin oder eines Arbeitnehmers, die sich auf das Arbeitsvermittlungsgesetz vom 6. Oktober 1989 stützen, ist zusätzlich das Gericht am Ort der Geschäftsniederlassung der vermittelnden oder verleihenden Person, mit welcher der Vertrag abgeschlossen wurde, zuständig.»

**2. Bindungsgrad:** **Teilzwingend** zugunsten der stellensuchenden/arbeitnehmenden Partei (Art. 35 Abs. 1 lit. d). Vorausverzicht und Einlassung zulasten des Arbeitnehmers ausgeschlossen.

**3. Anwendungsbereich/Abgrenzung:** Alternativ: {Wohnsitz/Sitz Beklagte} ∪ {gewöhnlicher Arbeitsort}. Abs. 2 fügt für **überlassene/vermittelte Arbeitnehmer** (Personalverleih nach AVG, SR 823.11) einen *zusätzlichen* Gerichtsstand am Ort der Geschäftsniederlassung des Vermittlers/Verleihers hinzu (mit dem der Vertrag geschlossen wurde). Lex specialis zu Art. 31.

**4. Leitentscheide (Sekundär):** «Gewöhnlicher Arbeitsort» = örtlicher Schwerpunkt der Tätigkeit; bei wechselnden Einsatzorten massgebend der tatsächliche Tätigkeitsmittelpunkt. *Sekundär.*

**5. Engine-Hinweis:** Schärft bestehende Kachel **arbeit**: deterministische Optionen {Sitz Arbeitgeber/Beklagter, gewöhnlicher Arbeitsort}; bei Personalverleih-Flag zusätzlich {Niederlassung Verleiher}. Verzichtssperre lit. d als Hard-Flag. Personalverleih als optionales Eingabefeld modellieren.

---

## Art. 35 — Verzicht auf die gesetzlichen Gerichtsstände

**1. Wortlaut-Kern:**
Abs. 1 — «Auf die Gerichtsstände nach den Artikeln 32–34 können nicht zum Voraus oder durch Einlassung verzichten:
a. die Konsumentin oder der Konsument;
b. die Partei, die Wohn- oder Geschäftsräume gemietet oder gepachtet hat;
c. bei landwirtschaftlichen Pachtverhältnissen: die pachtende Partei;
d. die stellensuchende oder arbeitnehmende Partei.»
Abs. 2 — «Vorbehalten bleibt der Abschluss einer Gerichtsstandsvereinbarung nach Entstehung der Streitigkeit.»

**2. Bindungsgrad:** Dies *ist* die Teilzwingend-Norm: sie macht Art. 32–34 zu **halbzwingenden** Schutzgerichtsständen. Der Verzicht ist nur **nachträglich** (nach Entstehung der Streitigkeit, Abs. 2) zulässig.

**3. Anwendungsbereich/Abgrenzung:** Geschützter Personenkreis abschliessend (lit. a–d). «Zum Voraus»-Verzicht (GSV vor Streit) und Verzicht durch Einlassung (Art. 18) sind gesperrt; nachträgliche GSV bleibt möglich. Betrifft ausdrücklich nur Art. 32–34 — **nicht** Art. 31, 36 ff.

**4. Leitentscheide (Sekundär):** Eine vor Streitentstehung getroffene GSV zulasten der geschützten Partei ist unwirksam; das Gericht prüft die Zuständigkeit insoweit von Amtes wegen / die Einlassung schützt nicht. *Sekundär.*

**5. Engine-Hinweis:** Querschnitt-Regel für die Engine: Bei den Kacheln **konsumentenvertrag / miete / arbeit** muss der Output ein Flag «GSV/Prorogation vor Streitentstehung unzulässig» tragen; nur «GSV nach Streitentstehung» als zulässige Abweichung anbieten. Engine sollte Einlassung als zuständigkeitsbegründendes Element für diese Schutzfälle deaktivieren.

---

## Art. 36 — Grundsatz (unerlaubte Handlung)

**1. Wortlaut-Kern:** «Für Klagen aus unerlaubter Handlung ist das Gericht am Wohnsitz oder Sitz der geschädigten Person oder der beklagten Partei oder am Handlungs- oder am Erfolgsort zuständig.»

**2. Bindungsgrad:** **Dispositiv** (alternative Gerichtsstände, frei wählbar; GSV/Einlassung möglich, da nicht von Art. 35 erfasst).

**3. Anwendungsbereich/Abgrenzung:** Vier alternative Anknüpfungen: {Wohnsitz/Sitz Geschädigter} ∪ {Wohnsitz/Sitz Beklagte} ∪ {Handlungsort} ∪ {Erfolgsort}. Handlungsort = Ort des deliktischen Verhaltens; Erfolgsort = Ort des Schadenseintritts. Forum actoris (Geschädigtenwohnsitz) ist hier ausdrücklich vorgesehen. Spezialdelikte gehen vor: Art. 37 (ungerechtfertigte vM), Art. 38 (Motorfahrzeug/Fahrrad), Art. 38a (Nuklear).

**4. Leitentscheide (Sekundär):** Bei Distanzdelikten kann der Geschädigte zwischen Handlungs- und Erfolgsort wählen. *Sekundär.*

**5. Engine-Hinweis:** **Neue Kachel deliktshaftung/schadenersatz.** Deterministisch 4 Optionen (Geschädigter-Sitz, Beklagter-Sitz, Handlungsort, Erfolgsort). Handlungs-/Erfolgsort als Eingabefelder. Dispositiv → GSV/Einlassung erlaubt.

---

## Art. 37 — Schadenersatz bei ungerechtfertigten vorsorglichen Massnahmen

**1. Wortlaut-Kern:** «Für Schadenersatzklagen wegen ungerechtfertigter vorsorglicher Massnahmen ist das Gericht am Wohnsitz oder Sitz der beklagten Partei oder an dem Ort, an dem die vorsorgliche Massnahme angeordnet wurde, zuständig.»

**2. Bindungsgrad:** **Dispositiv.**

**3. Anwendungsbereich/Abgrenzung:** Spezialgerichtsstand für die Haftung nach ungerechtfertigter vM (materiell Art. 264 Abs. 2 ZPO). Optionen: {Wohnsitz/Sitz Beklagte} ∪ {Anordnungsort der vM}. Lex specialis zu Art. 36.

**4. Leitentscheide (Sekundär):** Anknüpfung an den anordnenden Gerichtsort dient der Sachnähe zum Massnahmeverfahren. *Sekundär.*

**5. Engine-Hinweis:** Spezialzweig unter Kachel **deliktshaftung** (Unterfall vM-Schadenersatz): 2 Optionen. Anordnungsort als Eingabe. Geringe Priorität / Nischenfall.

---

## Art. 38 — Motorfahrzeug- und Fahrradunfälle (inkl. Art. 38a Nuklearschäden)

**1. Wortlaut-Kern (Art. 38):**
Abs. 1 — «Für Klagen aus Motorfahrzeug- und Fahrradunfällen ist das Gericht am Wohnsitz oder Sitz der beklagten Partei oder am Unfallort zuständig.»
Abs. 2 — «Für Klagen gegen das nationale Versicherungsbüro (Art. 74 SVG) oder gegen den nationalen Garantiefonds (Art. 76 SVG) ist zusätzlich das Gericht am Ort einer Zweigniederlassung dieser Einrichtungen zuständig.»
**Art. 38a Nuklearschäden** (eingefügt per **1.1.2022**): Abs. 1 — «Für Klagen aus nuklearen Ereignissen ist **zwingend** das Gericht des Kantons zuständig, auf dessen Gebiet das Ereignis eingetreten ist.» Abs. 2 (subsidiär: Kanton der Kernanlage des haftpflichtigen Inhabers, falls Ereigniskanton nicht sicher bestimmbar). Abs. 3 (bei mehreren Gerichtsständen: Kanton mit engster Verbindung / am meisten betroffen).

**2. Bindungsgrad:** Art. 38: **dispositiv.** Art. 38a: **zwingend** (ausschliesslicher Kantonsgerichtsstand).

**3. Anwendungsbereich/Abgrenzung:** Art. 38 Spezialgerichtsstand für Strassenverkehrsunfälle: {Wohnsitz/Sitz Beklagte} ∪ {Unfallort}; Abs. 2 erweitert um Zweigniederlassung von Nationalem Versicherungsbüro/Garantiefonds (SVG, SR 741.01). Art. 38a deckt nukleare Ereignisse (Kernenergiehaftpflicht) als zwingenden kantonalen Gerichtsstand. Beide lex specialis zu Art. 36.

**4. Leitentscheide (Sekundär):** *Keine amtlich gegengeprüfte Primär-Rechtsprechung in dieser Recherche; Anwendungsfragen v.a. zum Unfallort und zur Direktklage gegen Versicherer. Sekundär.*

**5. Engine-Hinweis:** Unterzweige der Kachel **deliktshaftung**: «Verkehrsunfall» (2–3 Optionen) und «Nuklearschaden» (zwingend, 1 Kantonsoption mit Subsidiärkaskade). Nuklear: praktisch vernachlässigbar, aber zwingend-Flag wichtig. Revisionsmarker: Art. 38a = 1.1.2022, nicht 2025.

---

## Art. 39 — Adhäsionsklage

**1. Wortlaut-Kern:** «Für die Beurteilung adhäsionsweise geltend gemachter Zivilansprüche bleibt die Zuständigkeit des Strafgerichts vorbehalten.»

**2. Bindungsgrad:** Kollisions-/Vorbehaltsnorm (keine eigene örtliche Anknüpfung; verweist auf die Zuständigkeit des Strafgerichts gemäss StPO).

**3. Anwendungsbereich/Abgrenzung:** Stellt klar, dass der Adhäsionsweg (Zivilanspruch im Strafverfahren, Art. 122 ff. StPO) durch die ZPO-Gerichtsstände nicht verdrängt wird. Keine ZPO-Ortsregel — Zuständigkeit folgt dem Strafgericht.

**4. Leitentscheide (Sekundär):** *Sekundär; Abgrenzung Zivil-/Strafweg.*

**5. Engine-Hinweis:** **Kein** eigener ZPO-Gerichtsstand → in der Engine als Hinweis/Disclaimer abbilden (Verweis auf Strafverfahren), nicht als berechenbare Kachel.

---

## Art. 40 — Gesellschaftsrecht und Handelsregister

**1. Wortlaut-Kern:**
Abs. 1 — «Für Klagen aus gesellschaftsrechtlicher Verantwortlichkeit ist das Gericht am Wohnsitz oder Sitz der beklagten Partei oder am Sitz der Gesellschaft zuständig.»
Abs. 2 — «Für die Wiedereintragung einer gelöschten Rechtseinheit ins Handelsregister ist das Gericht am letzten eingetragenen Sitz der gelöschten Rechtseinheit **zwingend** zuständig.»

**2. Bindungsgrad:** Abs. 1 **dispositiv** (alternative Gerichtsstände). Abs. 2 **zwingend.**

**3. Anwendungsbereich/Abgrenzung:** Abs. 1 = aktien-/gesellschaftsrechtliche Verantwortlichkeitsklagen (Organhaftung, Art. 754 ff. OR): {Wohnsitz/Sitz Beklagte} ∪ {Sitz Gesellschaft}. Abs. 2 = Wiedereintragung gelöschter Rechtseinheit, zwingend am letzten Sitz. **Revisionsmarker: Titel und Abs. 2 in Kraft seit 1.1.2021** (Handelsregisterrecht, AS 2020 957) — nicht 2025.

**4. Leitentscheide (Sekundär):** *Sekundär.*

**5. Engine-Hinweis:** Neue Kachel **gesellschaftsrecht** (Verantwortlichkeit): 2 Optionen, dispositiv. Wiedereintragung als separater zwingender Spezialfall (1 Option). Nischen-Priorität.

---

## Art. 41 — [aufgehoben]

**1. Wortlaut-Kern:** **Aufgehoben.** «Aufgehoben durch Ziff. II 1 des BG vom 28. Sept. 2012, **mit Wirkung seit 1. Mai 2013** (AS 2013 1103).»

**2.–4.:** Entfällt. (Ursprünglich Wertpapier-/börsenrechtlicher Gerichtsstand; durch FINIG/FinfraG-Umfeld obsolet geworden.)

**5. Engine-Hinweis:** Leerstelle — in der Engine ignorieren. Nicht durch die 2025-Revision betroffen (Aufhebung bereits 2013).

---

## Art. 42 — Fusionen, Spaltungen, Umwandlungen und Vermögensübertragungen

**1. Wortlaut-Kern:** «Für Klagen, die sich auf das Fusionsgesetz vom 3. Oktober 2003 stützen, ist das Gericht am Sitz eines beteiligten Rechtsträgers zuständig.»

**2. Bindungsgrad:** **Dispositiv** (Wortlaut ohne «zwingend»).

**3. Anwendungsbereich/Abgrenzung:** Erfasst alle Klagen nach FusG (SR 221.301) — Fusion, Spaltung, Umwandlung, Vermögensübertragung (z.B. Überprüfungs-/Anfechtungs-/Verantwortlichkeitsklagen). Gerichtsstand am Sitz **eines** beteiligten Rechtsträgers (Wahlrecht bei mehreren).

**4. Leitentscheide (Sekundär):** *Sekundär.*

**5. Engine-Hinweis:** Unterzweig der Kachel **gesellschaftsrecht**: Sitz eines beteiligten Rechtsträgers (ggf. mehrere Optionen). Nischen-Priorität.

---

## Art. 43 — Kraftloserklärung von Wertpapieren und Versicherungspolicen; Zahlungsverbot

**1. Wortlaut-Kern:**
Abs. 1 — Kraftloserklärung von **Beteiligungspapieren**: **zwingend** Gericht am **Sitz der Gesellschaft**.
Abs. 2 — Kraftloserklärung von **Grundpfandtiteln**: **zwingend** Gericht am Ort, **an dem das Grundstück im Grundbuch aufgenommen** ist.
Abs. 3 — übrige Wertpapiere und Versicherungspolicen: **zwingend** Gericht am **Wohnsitz/Sitz des Schuldners**.
Abs. 4 — Zahlungsverbote aus **Wechsel und Check** und deren Kraftloserklärung: **zwingend** Gericht am **Zahlungsort**.

**2. Bindungsgrad:** Durchgehend **zwingend** (alle vier Absätze).

**3. Anwendungsbereich/Abgrenzung:** Vier separate zwingende Anknüpfungen je nach Papierart. Trotz Verortung im Abschnitt «Handelsrecht» mit Bezug zum SchKG-/Wertpapierrecht. Klare Subsumtion nach Papiertyp.

**4. Leitentscheide (Sekundär):** *Sekundär.*

**5. Engine-Hinweis:** Spezialkachel **kraftloserklärung** mit deterministischer Verzweigung nach Papiertyp (Beteiligungspapier → Gesellschaftssitz; Grundpfandtitel → Grundbuchort; übrige/Police → Schuldnersitz; Wechsel/Check → Zahlungsort). Jeweils 1 zwingende Option. Gut maschinell abbildbar.

---

## Art. 44 — Anleihensobligationen

**1. Wortlaut-Kern:** «Die örtliche Zuständigkeit für die Ermächtigung zur Einberufung der Gläubigerversammlung richtet sich nach Artikel 1165 OR.»

**2. Bindungsgrad:** Verweisnorm (Zuständigkeit folgt OR 1165, SR 220).

**3. Anwendungsbereich/Abgrenzung:** Betrifft Gläubigergemeinschaft bei Anleihensobligationen; keine eigenständige ZPO-Ortsregel, sondern Renvoi auf OR 1165.

**4.:** Entfällt.

**5. Engine-Hinweis:** Reiner Verweis → in der Engine als Hinweis (OR 1165) führen, keine eigene Berechnungslogik. Nische.

---

## Art. 45 — Kollektivanlagen

**1. Wortlaut-Kern:** «Für Klagen der Anlegerinnen und Anleger sowie der Vertretung der Anlegergemeinschaft ist das Gericht am **Sitz des jeweils betroffenen Bewilligungsträgers** **zwingend** zuständig.»

**2. Bindungsgrad:** **Zwingend.**

**3. Anwendungsbereich/Abgrenzung:** Klagen aus Kollektivanlagenrecht (KAG): zwingend am Sitz des betroffenen Bewilligungsträgers (Fondsleitung/SICAV etc.). Schliesst Abschnitt «Handelsrecht» ab.

**4.:** *Sekundär.*

**5. Engine-Hinweis:** Spezialkachel/Unterzweig: 1 zwingende Option (Sitz Bewilligungsträger). Nische.

---

## Art. 46 — Schuldbetreibungs- und Konkursrecht (SchKG-Klagen)

**1. Wortlaut-Kern:** «Für Klagen nach dem Bundesgesetz vom 11. April 1889 über Schuldbetreibung und Konkurs (SchKG) bestimmt sich die örtliche Zuständigkeit nach diesem Kapitel, soweit das SchKG keinen Gerichtsstand vorsieht.»

**2. Bindungsgrad:** Auffang-/Subsidiaritätsnorm. Wo das SchKG selbst Gerichtsstände vorsieht, gehen diese vor (**lex specialis SchKG**); nur lückenfüllend greifen die ZPO-Gerichtsstände (Kap. 2).

**3. Anwendungsbereich/Abgrenzung:** Betrifft betreibungs-/konkursrechtliche Klagen (z.B. Anerkennungsklage Art. 79 SchKG, Aberkennungsklage Art. 83 Abs. 2 SchKG, Kollokationsklage Art. 250 SchKG, Arrestprosequierung/Widerspruchs-/Anfechtungsklagen Art. 285 ff. SchKG, **Arrest** Art. 271 ff. SchKG mit eigenem Arrestort-Forum). **Wichtig:** Für den **Arrest** und viele dieser Klagen enthält das SchKG eigene Gerichtsstände (z.B. Arrestort, Betreibungsort) — Art. 46 ZPO greift dort gerade **nicht**, sondern verweist auf das SchKG. ZPO ist nur Auffangordnung.

**4. Leitentscheide (Sekundär):** Vorrang der SchKG-Spezialgerichtsstände vor ZPO-Auffang; Aberkennungsklage am Betreibungsort (SchKG-eigener Gerichtsstand). *Sekundär.*

**5. Engine-Hinweis:** Eigene Kachel **schkg-klagen** mit Disclaimer-Logik: Engine muss zuerst prüfen, ob das **SchKG** selbst einen Gerichtsstand vorsieht (Arrest → Arrestort; Aberkennung → Betreibungsort; Kollokation → Konkursort) und nur subsidiär auf ZPO-Kap. 2 zurückfallen. Da die Spezialgerichtsstände im SchKG (nicht in dieser ZPO-Datei) stehen, ist für eine deterministische Abbildung eine zusätzliche SchKG-Recherche (Art. 79, 83, 250, 271 ff. SchKG) erforderlich — als offener Folgeauftrag markieren.

---

## Engine-Gesamtsynthese (Teil 2)

| Artikel | Streitsache | Bindungsgrad | Gerichtsstand-Optionen (deterministisch) | Kachel-Mapping |
|---|---|---|---|---|
| 31 | Vertrag allg. | dispositiv | Sitz Beklagte / Ort charakt. Leistung | erweitert **geldforderung** |
| 32 | Konsumentenvertrag | teilzwingend (lit. a) | rollenabhängig (1–2) | neu **konsumentenvertrag** |
| 33 | Miete/Pacht unbewegl. | teilzwingend (lit. b/c) | Lageort (1) | schärft **miete** |
| 34 | Arbeit | teilzwingend (lit. d) | Sitz Beklagte / Arbeitsort (/Verleiher) | schärft **arbeit** |
| 35 | Verzichtssperre | — (Querschnitt) | GSV nur nach Streitentstehung | Flag über 32–34 |
| 36 | Delikt allg. | dispositiv | Geschädigter/Beklagte/Handlungs-/Erfolgsort (4) | neu **deliktshaftung** |
| 37 | ungerechtf. vM | dispositiv | Sitz Beklagte / Anordnungsort (2) | Unterzweig Delikt |
| 38/38a | Verkehr / Nuklear | dispositiv / **zwingend** | Sitz/Unfallort (+ZN) / Ereigniskanton | Unterzweig Delikt |
| 39 | Adhäsion | Vorbehalt StPO | — (kein ZPO-Forum) | Disclaimer |
| 40 | Gesellschaftsrecht | dispositiv / Abs.2 zwingend | Sitz Beklagte/Gesellschaft | neu **gesellschaftsrecht** |
| 41 | aufgehoben (2013) | — | — | ignorieren |
| 42 | FusG-Klagen | dispositiv | Sitz beteiligter Rechtsträger | Unterzweig Gesellschaft |
| 43 | Kraftloserklärung | zwingend | typabhängig (4) | neu **kraftloserklärung** |
| 44 | Anleihensobl. | Verweis OR 1165 | — | Hinweis |
| 45 | Kollektivanlagen | zwingend | Sitz Bewilligungsträger | Nische |
| 46 | SchKG-Klagen | subsidiär | SchKG-Forum vorrangig, sonst ZPO | neu **schkg-klagen** (+SchKG-Folgerecherche) |

**Prioritäten für die Engine-Erweiterung:** Hoher Praxiswert → Art. 31 (Vertrag), 32 (Konsument), 36 (Delikt). Mittel → Art. 37, 38, 40, 42, 43. Nische/Disclaimer → Art. 39, 44, 45, 46 (46 nur mit zusätzlicher SchKG-Recherche deterministisch abbildbar).

---

### Verifikations- und Quellenhinweise
- **Primärquelle (verifiziert):** Wortlaute Art. 31–46 wörtlich aus Fedlex-Konsolidierung SR 272, Stand 20250101 (lokaler Cache `/tmp/zpo.html`, Anker `id="art_31"`…`id="art_46"`). Abruf 5.6.2026.
- **Revision 1.1.2025:** Maschinell verifiziert, dass im Bereich Art. 31–46 **kein** «in Kraft seit 1.1.2025»-Marker liegt → diese Artikel durch die 2025-Revision nicht geändert. Tatsächliche Änderungsmarker im Block: Art. 38a (1.1.2022), Art. 40 Titel/Abs. 2 (1.1.2021), Art. 41 aufgehoben (1.5.2013).
- **Rechtsprechung:** Sämtliche BGE-/Leitentscheid-Aussagen sind als **Sekundär** markiert — sie wurden nicht gegen eine amtliche Primärquelle (BGE-Sammlung) abgeglichen und sollten vor produktivem Einsatz im Tool mit amtlichen Fundstellen belegt werden.
- **Offener Folgeauftrag:** Für Art. 46 ist eine separate SchKG-Recherche (Art. 79, 83 Abs. 2, 250, 271 ff. SchKG, Arrestort) nötig, um die Gerichtsstände deterministisch in der Engine abzubilden.

---

## TEIL 3 — Sachliche/funktionelle Zuständigkeit (Art. 4–8) + Systematik

_(Bericht ausstehend — wird hier ergänzt.)_
