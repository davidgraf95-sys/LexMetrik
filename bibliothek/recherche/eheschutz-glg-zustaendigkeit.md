# Eheschutz- & Gleichstellungsgesetz-Verfahren — Zuständigkeits-Dossier

**Erstellt:** 6.6.2026 · **Engine im Fokus:** `src/lib/zustaendigkeit.ts`
(Streitsache → Verfahrensart · Schlichtung · sachliche/örtliche Zuständigkeit).
**Wortlaut-Quellen:** Fedlex-Cache `/tmp/zpo.html` (SR 272, Konsolidierung
20250101, ZPO-Revision «Verbesserung der Praxistauglichkeit und der
Rechtsdurchsetzung» in Kraft seit 1.1.2025) und `/tmp/zgb.html` (SR 210) —
Anker-Format `id="art_NN"`, sprachunabhängig (§7); GlG (SR 151.1) am
Fedlex-Filestore nicht als statisches HTML greifbar (JS-Shell), daher
Sekundärquellen-Verifikation (swissrights.ch artikelweise, EBG/BJ).
**Abrufdatum:** 6.6.2026.

**Status: ERSTRECHERCHE / ENTWURF.** ZPO-/ZGB-Kernwortlaute verbatim am Cache
geprüft (197, 198, 199, 200, 202, 210, 212, 243, 271–273, 276, 113, 114, 9, 23,
34, 92, 248, 308, 314, 315; ZGB 172, 173, 176, 179). **GlG-Wortlaute** (1, 2, 3,
5, 6, 7, 10, 13; Aufhebung 11/12) sind **[Sekundärquelle — am Fedlex-Original
nachzuziehen]**. Kantonale GOG-Aussagen sind **[Sekundärquelle / offen]**.
Fachliche Abnahme durch David steht aus (§7); keine Rechtsberatung (§8).
`verified: true` wird hier NICHT gesetzt.

**Bezug zur bestehenden Engine.** Heute kennt die Zivil-Engine `scheidung`
(eigenes Scheidungsverfahren, Art. 274 ff., Gerichtsstand Art. 23 zwingend) und
ein Flag `glgBetroffen?: boolean`, das auf `arbeit`/`geldforderung` die
GlG-Weichen (Art. 200 Abs. 2, 210 lit. a, 243 Abs. 2 lit. a, 113/114 lit. a,
199 Abs. 2 lit. c) auslöst. **Eheschutz ist NICHT abgebildet** — er ist ein
summarisches Verfahren (Art. 271 ZPO), das die Engine gar nicht führt (vgl. die
`annahmen`-Zeile «Summarische Verfahren … sind nicht abgebildet»). GlG ist nur
als Flag, **nicht als eigene Streitsache** abgebildet; die Abgrenzung zum
öffentlich-rechtlichen Arbeitsverhältnis (Verwaltungsweg) fehlt.

---

## Methodischer Befund vorweg

- **Eheschutz** sprengt die heutige Engine-Achse «Verfahrensart 243/Schlichtung
  197 ff.»: Es ist **summarisch** (Art. 271 → Art. 248 ff.), Schlichtung
  entfällt schon deshalb (Art. 198 lit. a), und die örtliche Zuständigkeit
  läuft über den **zwingenden** Gerichtsstand Art. 23 — denselben, den die
  Engine bereits für `scheidung` setzt. Ein sauberer Einbau heisst: eine vierte
  `Verfahrensart` («summarisch») oder eine eigene Streitsache `eheschutz`.
- **GlG** ist bereits weitgehend korrekt verdrahtet (Flag-Pfad). Die echten
  Lücken sind (1) die **Abgrenzung privat/öffentlich-rechtlich** (Art. 13 GlG →
  Verwaltungsweg, ZPO-Engine NICHT zuständig) und (2) der Umstand, dass GlG
  heute nur als Zusatzflag, nicht als wählbare Streitsache existiert.

---

# TEIL A — EHESCHUTZVERFAHREN (Art. 271 ff. ZPO, Art. 172 ff. ZGB)

## A1 · Verfahrensart: summarisches Verfahren

**Norm-Beleg (Art. 271 ZPO, verbatim Cache):** «Das summarische Verfahren ist
unter Vorbehalt der Artikel 272 und 273 anwendbar für **Massnahmen zum Schutz
der ehelichen Gemeinschaft**, insbesondere für: a. die Massnahmen nach den
Artikeln 172–179 ZGB; b. die Ausdehnung der Vertretungsbefugnis …; c. die
Ermächtigung … zur Verfügung über die Wohnung der Familie (Art. 169 Abs. 2
ZGB); d. die Auskunftspflicht … über Einkommen, Vermögen und Schulden
(Art. 170 Abs. 2 ZGB); e. die Anordnung der Gütertrennung …; … i. die Anweisung
an die Schuldner und die Sicherstellung nachehelichen Unterhalts …»

**Modifikationen** (Vorbehalt aus Art. 271): Art. 272 ZPO «Das Gericht stellt
den Sachverhalt **von Amtes wegen** fest» (Untersuchungsgrundsatz); Art. 273
ZPO: mündliche Verhandlung als Regel, persönliches Erscheinen, Einigungsversuch
des Gerichts.

**Antwort.** Eheschutz ist ein **summarisches Verfahren** (Art. 271 i.V.m.
Art. 248 ff. ZPO) mit eingeschränkter Kognition (Glaubhaftmachung), aber
**uneingeschränkter Untersuchungsmaxime** (Art. 272). Der häufigste Praxisfall
ist lit. a (Art. 172–179 ZGB: Unterhaltsbeiträge Art. 173/176 Ziff. 1,
Wohnungs-/Hausratszuteilung Art. 176 Abs. 1 Ziff. 2, Gütertrennung Ziff. 3).

**Konfidenz: verifiziert am Wortlaut** (Cache /tmp/zpo.html, /tmp/zgb.html).

## A2 · Schlichtung entfällt

**Norm-Beleg (Art. 198 lit. a ZPO, verbatim):** «Das Schlichtungsverfahren
entfällt: **a. im summarischen Verfahren**; …»

**Antwort.** Da Eheschutz summarisch ist (A1), entfällt die Schlichtung bereits
nach **Art. 198 lit. a** — die für Eheschutz einschlägige Litera ist **lit. a**
(NICHT lit. c «im Scheidungsverfahren»; lit. c betrifft das eigentliche
Scheidungsverfahren nach Art. 274 ff., nicht den Eheschutz). Eingeleitet wird
direkt mit Gesuch beim Gericht.

> **Auftrags-Präzisierung (§7):** Der Auftrag fragte «Art. 198 lit. a ZPO?» mit
> Fragezeichen — bestätigt: **lit. a** ist korrekt (summarisches Verfahren).

**Konfidenz: verifiziert am Wortlaut.**

## A3 · Örtliche Zuständigkeit: Art. 23 ZPO, zwingend

**Norm-Beleg (Art. 23 Abs. 1 ZPO, verbatim):** «Für eherechtliche Gesuche und
Klagen **sowie für Gesuche um Anordnung vorsorglicher Massnahmen** ist das
Gericht am **Wohnsitz einer Partei zwingend zuständig**.»

**Norm-Beleg (Art. 9 ZPO):** «Abs. 1 Ein Gerichtsstand ist nur dann zwingend,
wenn es das Gesetz ausdrücklich vorschreibt. Abs. 2 Von einem zwingenden
Gerichtsstand können die Parteien nicht abweichen.»

**Antwort.** Eheschutzgesuche sind «eherechtliche Gesuche» (und schützende
Massnahmen) i.S.v. Art. 23 Abs. 1 → **Gericht am Wohnsitz EINER der Parteien**,
und zwar **zwingend** (Art. 23 sagt es ausdrücklich, Art. 9). Folge: weder
Gerichtsstandsvereinbarung (Art. 17) noch Einlassung (Art. 18) sind möglich.
Das ist **identisch** zur bereits in der Engine kodierten Scheidungs-Anknüpfung
(`gerichtsstand = 'Gericht am Wohnsitz einer der Parteien'`, `bindung =
'zwingend'`, `oertlichNormen = [N_23]`).

**Konfidenz: verifiziert am Wortlaut.**

## A4 · Sachliche/funktionelle Zuständigkeit: kantonal (Art. 4 ZPO)

**Norm-Beleg (Art. 4 Abs. 1 ZPO):** «Das kantonale Recht regelt die sachliche
und funktionelle Zuständigkeit der Gerichte, soweit das Gesetz nichts anderes
bestimmt.» Das Bundesrecht bestimmt für Eheschutz nichts anderes (Art. 271
sagt nur «das Gericht»).

**Antwort.** Welches **konkrete** Gericht entscheidet, ist **kantonales Recht**
(GOG). Belegbare Aussagen — alle **[Sekundärquelle / kantonales Recht, für die
Engine als Kantonsschicht-Aufgabe zu verifizieren]**:
- **ZH:** Einzelgericht am Bezirksgericht (Eheschutz/eherechtliche Massnahmen
  im summarischen Verfahren) — GOG/ZPO ZH **[zu verifizieren]**.
- **AG:** **Familiengericht** als Abteilung des Bezirksgerichts (AG kennt ein
  spezialisiertes Familiengericht für familienrechtliche Verfahren). Deckt sich
  mit dem Hinweis aus der Klage-vereinfacht-Vorlage BS («GlG → Dreiergericht»
  betrifft hingegen GlG/BS, nicht Eheschutz/AG) **[zu verifizieren am
  EG ZPO/AG]**.
- **BS:** Zivilgericht Basel-Stadt (Einzelgericht für summarische
  Familiensachen) **[zu verifizieren]**.

**Engine-Konsequenz:** wie bei allen Streitsachen liefert die Engine hier nur
die bundesrechtliche Aussage «kantonal organisiert (Art. 4)» + Warnung; die
konkrete Stelle ist Sache der Kantonsschicht (Phase 2), **nicht** stille
Subsumtion (§8).

**Konfidenz:** Bundesrechtliche Delegation **verifiziert am Wortlaut**
(Art. 4); kantonale Konkretisierungen **Sekundärquelle / offen**.

## A5 · Rechtsmittel: Berufung, 10-Tage- vs. 30-Tage-Frist, aufschiebende Wirkung

**Norm-Beleg (Art. 308 ZPO):** «Abs. 1 Mit Berufung sind anfechtbar: a.
erstinstanzliche End- und Zwischenentscheide; b. erstinstanzliche Entscheide
über vorsorgliche Massnahmen. Abs. 2 In vermögensrechtlichen Angelegenheiten
ist die Berufung nur zulässig, wenn der Streitwert der zuletzt aufrecht-
erhaltenen Rechtsbegehren mindestens **10 000 Franken** beträgt.»

**Norm-Beleg (Art. 314 ZPO — Frist im summarischen Verfahren):** «Abs. 1 Gegen
einen im summarischen Verfahren ergangenen Entscheid beträgt die Frist … je
**zehn Tage**. … **Abs. 2 (NEU 1.1.2025) Bei familienrechtlichen Streitigkeiten
nach den Artikeln 271, 276, 302 und 305 beträgt die Frist … je 30 Tage. Die
Anschlussberufung ist zulässig.**»

**Norm-Beleg (Art. 315 ZPO — aufschiebende Wirkung, rev. 2025):** «Abs. 1 Die
Berufung hemmt die Rechtskraft und die Vollstreckbarkeit … Abs. 2 **Keine
aufschiebende Wirkung** hat die Berufung gegen Entscheide über: … b.
**vorsorgliche Massnahmen**; c. Anweisungen an die Schuldner; **d. die
Sicherstellung des Unterhalts**. … Abs. 4 Wenn der betroffenen Partei ein nicht
leicht wiedergutzumachender Nachteil droht, kann die Rechtsmittelinstanz auf
Gesuch: a. die vorzeitige Vollstreckbarkeit bewilligen …; oder b. in den Fällen
nach Absatz 2 die Vollstreckbarkeit ausnahmsweise aufschieben.»

**Norm-Beleg (Art. 92 ZPO — Kapitalisierung wiederkehrender Leistungen):**
«Abs. 1 Als Wert wiederkehrender Nutzungen oder Leistungen gilt der Kapitalwert.
Abs. 2 Bei ungewisser oder unbeschränkter Dauer gilt als Kapitalwert der
**zwanzigfache Betrag der einjährigen** Nutzung oder Leistung …»

**Antwort.**
- **Rechtsmittel = Berufung** (Art. 308 Abs. 1 lit. a/b). Eheschutzentscheide
  gelten praxisgemäss als Entscheide über vorsorgliche Massnahmen i.w.S.; sie
  sind mit Berufung anfechtbar (Art. 308 Abs. 1, BGE 137 III 475 zur
  Massnahmen-Qualifikation **[Sekundärquelle, zu verifizieren]**).
- **Streitwertgrenze** (vermögensrechtliche Eheschutzpunkte, v.a. Unterhalt):
  **CHF 10 000** (Art. 308 Abs. 2). Bei wiederkehrendem Unterhalt **ungewisser
  Dauer** ist der Streitwert nach **Art. 92 Abs. 2 = 20× Jahresbetrag** zu
  kapitalisieren — die Schwelle wird damit praktisch fast immer erreicht.
  (Unter CHF 10 000: nur **Beschwerde**, Art. 319 lit. a.)
- **Frist:** durch die Revision 2025 für Eheschutz (Art. 271!) **30 Tage**
  (Art. 314 Abs. 2 NEU) statt der summarischen 10 Tage — wichtige Korrektur
  gegenüber dem alten Recht.
- **Aufschiebende Wirkung:** Eheschutz = vorsorgliche Massnahme → **keine**
  aufschiebende Wirkung von Gesetzes wegen (Art. 315 Abs. 2 lit. b; für die
  Unterhalts-Sicherstellung ausdrücklich lit. d, rev. 2025). Die Instanz kann
  sie auf Gesuch ausnahmsweise erteilen (Art. 315 Abs. 4 lit. b, rev. 2025).

**Konfidenz: verifiziert am Wortlaut** (308/314/315/92); die Qualifikation
«Eheschutz = Massnahmenentscheid» ist **Sekundärquelle (BGE), zu verifizieren**.

## A6 · Kosten

**Norm-Beleg.** Eheschutz fällt unter **keinen** der Kostenfreiheits-Kataloge
Art. 113 Abs. 2 / Art. 114 ZPO (dort: GlG, BehiG, Miete/Pacht Wohn-/Geschäft,
Arbeit/AVG bis 30 000, MitwG, KVG-Zusatz, Gewaltschutz 28b/28c, DSG — **kein**
Familien-/Eheschutz-Eintrag). → **Gerichtskosten werden erhoben** (kantonale
Tarife, Art. 96 ZPO). Keine bundesrechtliche Kostenbefreiung ausser der
unentgeltlichen Rechtspflege **Art. 117 ff. ZPO** (allgemein, bedürftigkeits-
abhängig).

**Antwort.** Keine Eheschutz-spezifische Kostenbefreiung; Gerichtskosten nach
kantonalem Tarif, im Übrigen UR nach Art. 117 ff.

**Konfidenz: verifiziert am Wortlaut** (113/114 — Negativbefund).

---

# TEIL B — GLEICHSTELLUNGSGESETZ-VERFAHREN (GlG, SR 151.1)

> **Quellen-Vorbehalt für ganz Teil B:** Die GlG-Wortlaute konnten am
> Fedlex-Filestore nicht als statisches HTML gezogen werden (JS-Shell); sie
> stammen aus **artikelweisen Sekundärspiegeln** (swissrights.ch, EBG/BJ) und
> sind **am Fedlex-Original (SR 151.1) wörtlich nachzuziehen** [zu verifizieren].
> Die ZPO-Anschlussnormen (199/200/210/113/114/34) sind dagegen am Cache
> verifiziert.

## B1 · Geltungsbereich (Art. 2/3 GlG)

**Norm-Beleg (Art. 2 GlG):** «Dieser Abschnitt gilt für **Arbeitsverhältnisse
nach Obligationenrecht** sowie für **alle öffentlich-rechtlichen Arbeits-
verhältnisse in Bund, Kantonen und Gemeinden**.» **[Sekundärquelle.]**

**Norm-Beleg (Art. 3 GlG, Diskriminierungsverbot):** Abs. 1 Verbot der
direkten/indirekten Benachteiligung **aufgrund des Geschlechts**, insb. unter
Berufung auf Zivilstand, familiäre Situation oder Schwangerschaft; Abs. 2 das
Verbot gilt namentlich für **Anstellung, Aufgabenzuteilung, Gestaltung der
Arbeitsbedingungen, Entlöhnung, Aus- und Weiterbildung, Beförderung und
Entlassung**; Abs. 3 angemessene Förderungsmassnahmen gelten nicht als
Diskriminierung. **[Sekundärquelle.]**

**Antwort.** GlG erfasst **Diskriminierung im Erwerbsleben** — **privat
(OR)** UND **öffentlich-rechtlich** (Bund/Kantone/Gemeinden). Die Rechtsansprüche
(Art. 5: Beseitigung/Unterlassung/Feststellung, Entschädigung bei
Nichtanstellung max. 3 Monatslöhne / bei diskriminierender Kündigung oder
sexueller Belästigung max. 6 Monatslöhne) gelten in beiden Bereichen — der
**Rechtsweg** unterscheidet sich aber (privat → ZPO/Zivilgericht; öff.-rechtl.
→ Verwaltungsweg, Art. 13 GlG, siehe B5).

**Konfidenz: Sekundärquelle** (am GlG-Original nachzuziehen); ZPO-Anschluss
verifiziert.

## B2 · Schlichtung: paritätische Behörde (Art. 200 Abs. 2 ZPO) — obligatorisch, aber einseitig verzichtbar

**Norm-Beleg (Art. 200 Abs. 2 ZPO, verbatim Cache):** «Bei Streitigkeiten nach
dem Gleichstellungsgesetz vom 24. März 1995 besteht die Schlichtungsbehörde aus
einer vorsitzenden Person und einer **paritätischen Vertretung der Arbeitgeber-
und Arbeitnehmerseite und des öffentlichen und privaten Bereichs; die
Geschlechter müssen paritätisch vertreten sein**.»

**Norm-Beleg (Art. 197 ZPO):** «Dem Entscheidverfahren geht ein
Schlichtungsversuch vor einer Schlichtungsbehörde voraus.» → Schlichtung ist im
GlG-Zivilprozess **grundsätzlich obligatorisch** (anders als beim Eheschutz, wo
sie nach Art. 198 lit. a entfällt).

**Norm-Beleg (Art. 199 Abs. 2 lit. c ZPO, verbatim):** «Die klagende Partei
kann **einseitig** auf das Schlichtungsverfahren verzichten, wenn: … c. in
Streitigkeiten nach dem Gleichstellungsgesetz vom 24. März 1995.»

**Antwort.** Im **privatrechtlichen** GlG-Streit ist die Schlichtung vor der
**paritätischen** Schlichtungsbehörde (Art. 200 Abs. 2) **obligatorisch
(Art. 197)** — die klagende Partei kann aber **einseitig darauf verzichten**
(Art. 199 Abs. 2 lit. c). Sie ist also nicht freiwillig im Sinne von
«beidseitig wählbar», sondern: Regel = Schlichtung, mit einseitigem
Verzichtsrecht der Klägerseite.

> **Auftrags-Präzisierung (§7):** Der Auftrag fragte «Art. 199 Abs. 3 ZPO rev.
> 2025?» für den Verzicht. **Falsch zugeordnet:** Der GlG-Verzicht steht in
> **Art. 199 Abs. 2 lit. c** (bestand schon vor 2025). **Abs. 3** (neu 2025)
> betrifft die **einzige kantonale Instanz** (Art. 5/6/8 — Klage direkt beim
> Gericht), nicht das GlG. Die Engine setzt `verzichtEinseitig` bei
> `glgBetroffen` bereits korrekt (Verweis auf Art. 199 Abs. 2).

**Wichtig — Art. 11/12 GlG aufgehoben:** Die ursprünglichen GlG-eigenen
Schlichtungsstellen (Art. 11/12 GlG) wurden **per 1.1.2011 durch die ZPO
aufgehoben** **[Sekundärquelle, zu verifizieren]**. Die GlG-Schlichtung läuft
heute **ausschliesslich** über die ZPO-Schlichtungsbehörde Art. 200 Abs. 2 —
**kein** GlG-eigener Schlichtungspfad mehr.

**Konfidenz: verifiziert am Wortlaut** (197/199/200 am Cache); Aufhebung
11/12 GlG **Sekundärquelle**.

## B3 · Verfahrensart: vereinfachtes Verfahren OHNE Streitwertgrenze

**Norm-Beleg (Art. 243 ZPO, verbatim Cache):** «Abs. 1 Das vereinfachte
Verfahren gilt für vermögensrechtliche Streitigkeiten bis zu einem Streitwert
von 30 000 Franken. **Abs. 2 Es gilt OHNE Rücksicht auf den Streitwert bei
Streitigkeiten: a. nach dem Gleichstellungsgesetz vom 24. März 1995;** …»

**Antwort.** GlG-Streitigkeiten laufen **immer im vereinfachten Verfahren**,
**unabhängig vom Streitwert** (Art. 243 Abs. 2 lit. a). Das deckt sich exakt mit
der Engine (`streitwertunabhaengigVereinfacht = mieteSchutz || glgBetroffen`).
Es gilt der soziale Untersuchungsgrundsatz (Art. 247 Abs. 2 lit. a ZPO, hier
nicht weiter ausgeführt).

**Konfidenz: verifiziert am Wortlaut.**

## B4 · Kostenfreiheit (Schlichtung Art. 113 + Entscheidverfahren Art. 114)

**Norm-Beleg (Art. 113 Abs. 2 lit. a ZPO, verbatim):** «**Keine Gerichtskosten**
werden gesprochen in Streitigkeiten: **a. nach dem Gleichstellungsgesetz vom
24. März 1995**; …» (Abs. 1: keine Parteientschädigung im Schlichtungsverfahren,
vorbehalten UR-Beistand.)

**Norm-Beleg (Art. 114 lit. a ZPO, verbatim):** «Im Entscheidverfahren werden
**keine Gerichtskosten** gesprochen bei Streitigkeiten: **a. nach dem
Gleichstellungsgesetz vom 24. März 1995**; …»

**Antwort.** GlG ist sowohl in der **Schlichtung** (Art. 113 Abs. 2 lit. a) als
auch im **Entscheidverfahren** (Art. 114 lit. a) **gerichtskostenfrei** —
streitwertunabhängig, auch über 30 000. (Vorbehalt: Kostenauflage bei bös-/
mutwilliger Prozessführung, Art. 115 Abs. 1; Parteientschädigung nach Art. 106
bleibt im Entscheidverfahren möglich.) Die Engine bildet beide bereits ab
(`kostenlosGrund` = Art. 113 Abs. 2 lit. a; Art.-114-Warnung = lit. a).

**Konfidenz: verifiziert am Wortlaut.**

## B5 · Örtliche Zuständigkeit & die Abgrenzung privat / öffentlich-rechtlich

**Norm-Beleg (Art. 34 Abs. 1 ZPO, verbatim Cache):** «Für arbeitsrechtliche
Klagen ist das Gericht am **Wohnsitz oder Sitz der beklagten Partei** oder an
dem Ort, an dem die Arbeitnehmerin oder der Arbeitnehmer **gewöhnlich die Arbeit
verrichtet**, zuständig.» (teilzwingend i.V.m. Art. 35 Abs. 1 lit. d — kein
Vorausverzicht der AN-Seite.)

**Norm-Beleg (Art. 13 GlG):** Abs. 1 «Der Rechtsschutz bei **öffentlich-
rechtlichen** Arbeitsverhältnissen richtet sich nach den allgemeinen
Bestimmungen über die **Bundesrechtspflege**.» Abs. 2 Direktbeschwerde bei
diskriminierender Nichtanstellung; Abs. 3 Schlichtungskommission für
Bundespersonal; Abs. 5 «Das Verfahren ist **kostenlos**; ausgenommen sind Fälle
von mutwilliger Prozessführung.» **[Sekundärquelle.]**

**Antwort — zwei getrennte Wege:**
- **Privatrechtliches** Arbeitsverhältnis (OR): **ZPO-Zivilweg**. Örtlich
  **Art. 34** (Beklagtensitz **oder** gewöhnlicher Arbeitsort, Wahl der
  klagenden Partei), teilzwingend (Art. 35). → Diese Engine ist zuständig.
- **Öffentlich-rechtliches** Arbeitsverhältnis (Bund/Kanton/Gemeinde):
  **Verwaltungsweg** (Art. 13 GlG → Verfügung/Beschwerde, beim Bund VwVG/BGG;
  in Kantonen kantonales Verwaltungsverfahrensrecht). → **Diese ZPO-Engine ist
  NICHT zuständig.** Hier braucht es eine harte **Weiche/Warnung**, sonst
  produziert die Engine einen falschen (zivilrechtlichen) Gerichtsstand.

**Konfidenz:** Art. 34/35 **verifiziert am Wortlaut**; Art. 13 GlG
**Sekundärquelle**; die Abgrenzungs-Notwendigkeit ist die zentrale Engine-Lücke.

## B6 · Beweislasterleichterung (Art. 6 GlG) & Kündigungsschutz (Art. 10 GlG) — als Rechner-Inputs

**Norm-Beleg (Art. 6 GlG, verbatim Sekundärquelle):** «Bezüglich der
Aufgabenzuteilung, Gestaltung der Arbeitsbedingungen, Entlöhnung, Aus- und
Weiterbildung, Beförderung und Entlassung wird eine **Diskriminierung
vermutet**, wenn diese von der betroffenen Person **glaubhaft gemacht** wird.»
→ **Beweislastumkehr** (Glaubhaftmachung genügt; Ausnahme: **sexuelle
Belästigung** und **Anstellung** sind NICHT erfasst — dort volle Beweislast).
**[Sekundärquelle, zu verifizieren.]**

**Norm-Beleg (Art. 10 GlG — Rachekündigungsschutz, verbatim Sekundärquelle):**
- Abs. 1 «Die Kündigung … durch die Arbeitgeberin oder den Arbeitgeber ist
  **anfechtbar**, wenn sie ohne begründeten Anlass auf eine innerbetriebliche
  Beschwerde über eine Diskriminierung oder auf die Anrufung der
  Schlichtungsstelle oder des Gerichts folgt.»
- Abs. 2 «Der Kündigungsschutz gilt für die Dauer eines innerbetrieblichen
  Beschwerdeverfahrens, eines Schlichtungs- oder eines Gerichtsverfahrens sowie
  **sechs Monate darüber hinaus**.»
- Abs. 3 «Die Kündigung muss **vor Ende der Kündigungsfrist** beim Gericht
  angefochten werden. Das Gericht kann die **provisorische Wiedereinstellung**
  … für die Dauer des Verfahrens anordnen …»
- Abs. 4 Verzicht auf Weiterführung + Entschädigung nach Art. 336a OR.
- Abs. 5 gilt sinngemäss für Kündigungen wegen einer Organisationsklage
  (Art. 7). **[Sekundärquelle, zu verifizieren.]**

**Antwort / mögliche Rechner-Inputs (Fristen!).** Zwei harte Fristen taugen für
einen späteren Fristen-Rechner: (1) **Anfechtung der Rachekündigung VOR Ende
der Kündigungsfrist** (Art. 10 Abs. 3 — Verwirkung, anders als die 180-Tage-
Klagefrist von Art. 336b OR!); (2) **Schutzdauer = Verfahrensdauer + 6 Monate**
(Art. 10 Abs. 2). Diese Fristen gehören **nicht in die Zuständigkeits-Engine**,
sondern in einen GlG-Fristen-/Vorlagen-Rechner (vgl. Cluster
arbeitsrecht-rechner: 336b-Fristen) — hier nur als Backlog markiert.

**Konfidenz: Sekundärquelle** (Art. 6/10 am GlG-Original nachzuziehen).

## B7 · Klagerecht der Organisationen (Art. 7 GlG)

**Norm-Beleg (Art. 7 Abs. 1 GlG, verbatim Sekundärquelle):** «Organisationen,
die nach ihren Statuten die Gleichstellung von Frau und Mann fördern oder die
Interessen der Arbeitnehmerinnen und Arbeitnehmer wahren und **seit mindestens
zwei Jahren** bestehen, können im eigenen Namen **feststellen lassen, dass eine
Diskriminierung vorliegt**, wenn der Ausgang des Verfahrens sich voraussichtlich
auf eine **grössere Zahl von Arbeitsverhältnissen** auswirken wird.» Abs. 2: im
Übrigen gelten die Bestimmungen für Einzelklagen sinngemäss. **[Sekundärquelle.]**

**Antwort.** Verbands-**Feststellungsklage** (kein Leistungsanspruch) bei
Breitenwirkung; Anhörung der Arbeitgeberseite vor Anrufung. Für die
Zuständigkeits-Engine relevant nur insoweit, als Art. 10 Abs. 5 GlG den
Kündigungsschutz auf Organisationsklagen erstreckt — sonst **kein** eigener
Zuständigkeits-Sonderpfad (es bleibt beim GlG-Zivilweg).

**Konfidenz: Sekundärquelle.**

---

# Bau-Empfehlung für die Engine

## Befund: Was heute schon stimmt
- **GlG-Flag-Pfad ist fachlich korrekt** verdrahtet: Art. 200 Abs. 2
  (paritätisch), 210 lit. a (Entscheidvorschlag), 243 Abs. 2 lit. a
  (vereinfacht streitwertunabhängig), 113 Abs. 2 lit. a + 114 lit. a
  (kostenlos), 199 Abs. 2 lit. c (einseitiger Verzicht). **Nichts davon ist zu
  ändern.**
- **Scheidung** (Art. 23 zwingend, 274 ff.) liegt vor — die Eheschutz-
  Anknüpfung (Art. 23) ist also schon kodiert, nur unter dem falschen Etikett.

## Lücke 1 — EHESCHUTZ als eigener Pfad (neu)
Eheschutz passt nicht in die heutige 243/197-Achse, weil **summarisch**. Zwei
Optionen für David:
- **(a) neue Streitsache `eheschutz`** mit Sonderbehandlung analog `scheidung`:
  - örtlich: `gerichtsstand = 'Gericht am Wohnsitz einer der Parteien'`,
    `bindung = 'zwingend'`, `[N_23]` (1:1 wie Scheidung).
  - Schlichtung entfällt → `entfaelltGrund = '... (Art. 198 lit. a ZPO)'`
    (summarisches Verfahren) — **neue Litera-Konstante N_198a-Begründung**.
  - Verfahrensart: erfordert einen **vierten `Verfahrensart`-Wert
    `'summarisch'`** (Art. 271/248) — heute existiert er nicht; Alternative wäre
    ein eigener Ergebnis-Zweig wie bei `scheidungsverfahren`.
  - Rechtsmittel: in `bestimmeRechtsmittel` ein Eheschutz-Zweig — **Berufung**
    (Art. 308), vermögensrechtliche Schwelle CHF 10 000 mit **Art.-92-Abs.-2-
    Kapitalisierung (20×)** beim Unterhalt; **Frist 30 Tage (Art. 314 Abs. 2
    NEU 2025**, NICHT 10!); **keine** aufschiebende Wirkung (Art. 315 Abs. 2
    lit. b/d), erteilbar nach Abs. 4 lit. b.
  - Kosten: **kein** 113/114-Eintrag → keine Kostenfreiheit (nur UR 117 ff.).
- **(b)** Eheschutz vorerst als **dokumentierter Backlog** (wie heute die
  «summarische Verfahren nicht abgebildet»-Annahme) belassen und nur die
  Annahme-Zeile präzisieren. **Empfehlung: (a)**, weil Anknüpfung + Schlichtung
  + Rechtsmittel deterministisch und die ZGB-/ZPO-Wortlaute verifiziert sind;
  der einzige Neubau ist der `'summarisch'`-Verfahrenszweig.

## Lücke 2 — GlG als eigene Streitsache + Privat/Öffentlich-Weiche
- Heute ist GlG nur ein **Zusatzflag** auf `arbeit`/`geldforderung`. Sauberer
  wäre eine **wählbare Streitsache `gleichstellung`** (oder das Flag bleibt, aber
  mit Pflicht-Folgefrage). Der Kern-Neubau ist die **Abgrenzung**:
  - **neues Input-Feld** z.B. `oeffentlichRechtlichesArbeitsverhaeltnis?: boolean`.
  - Ist es **true** → **harte Warnung/Weiche**: «Öffentlich-rechtliches
    Arbeitsverhältnis: GlG-Rechtsschutz läuft über den **Verwaltungsweg**
    (Art. 13 GlG, VwVG/BGG bzw. kantonales Recht) — diese ZPO-Engine ist NICHT
    zuständig; der ausgewiesene Zivilgerichtsstand gilt nicht.» (Analog zur
    bestehenden IPRG/LugÜ-Weiche bei Auslandsbezug.)
  - Ist es **false** (OR-Arbeitsverhältnis) → bestehender GlG-Flag-Pfad +
    örtlich **Art. 34/35** (heute schon, wenn Streitsache `arbeit`).
- **Art. 11/12 GlG (aufgehoben 2011)**: sicherstellen, dass kein GlG-eigener
  Schlichtungspfad behauptet wird — Schlichtung ausschliesslich Art. 200 Abs. 2.

## Was David entscheiden muss
1. **Eheschutz: Option (a) ausbauen oder (b) als Backlog dokumentieren?** Falls
   (a): wird `'summarisch'` als vierte Verfahrensart eingeführt (betrifft auch
   die Anzeige/`zustaendigkeitErgebnis`) — das ist eine **fachliche** Erweiterung
   (§6: kein verhaltensneutrales Refactoring; eigener deklarierter Schritt).
2. **GlG: eigene Streitsache `gleichstellung` oder Flag + Pflicht-Folgefrage
   behalten?** (Single-Source/SSoT-Frage.)
3. **Verwaltungs-Weiche:** Soll die Privat/Öffentlich-Abgrenzung schon jetzt als
   Warnung rein (empfohlen, Ehrlichkeit §8), obwohl die Verwaltungs-Engine
   (eigener Rechtsweg `verwaltung`) noch nicht existiert?
4. **Kantonale sachliche Zuständigkeit** (AG Familiengericht, BS Dreiergericht
   für GlG, ZH Einzelgericht) bleibt **Phase 2 / Kantonsschicht** — nicht in die
   Bundesschicht ziehen (§3). Die kantonalen GOG-Verweise oben sind **noch zu
   verifizieren**.

## Verifikations-TODOs (vor fachlicher Abnahme)
- [ ] GlG-Wortlaute (Art. 1, 2, 3, 5, 6, 7, 10, 13) am **Fedlex-Original
      SR 151.1** verbatim nachziehen (hier nur Sekundärspiegel).
- [ ] Aufhebung Art. 11/12 GlG per 1.1.2011 am Fedlex bestätigen.
- [ ] Qualifikation «Eheschutzentscheid = vorsorgliche Massnahme» für
      Rechtsmittel/aufschiebende Wirkung (BGE 137 III 475 / 138 III 728) prüfen.
- [ ] Kantonale GOG: AG Familiengericht · BS Zivilgericht/Dreiergericht (GlG) ·
      ZH Einzelgericht Bezirksgericht — je am kantonalen EG ZPO/GOG verifizieren.
- [ ] Art. 247 Abs. 2 (sozialer Untersuchungsgrundsatz im vereinfachten
      Verfahren bei GlG/Arbeit) am Cache nachtragen, falls Engine ihn ausweisen
      soll.

---

# Quellenregister

**Primär (Fedlex-Cache, verbatim geprüft 6.6.2026):**
- ZPO (SR 272), Cache `/tmp/zpo.html`, Konsolidierung 20250101 (Rev. 1.1.2025):
  Art. 9, 23, 34, 35, 92, 113, 114, 197, 198, 199, 200, 202, 210, 212, 243,
  248, 271, 272, 273, 276, 308, 314, 315.
  https://www.fedlex.admin.ch/eli/cc/2010/262/de
- ZGB (SR 210), Cache `/tmp/zgb.html`: Art. 172, 173, 176, 179.
  https://www.fedlex.admin.ch/eli/cc/24/233_245_233/de

**Sekundär (GlG-Wortlaut / Kantons- & BGE-Hinweise — zu verifizieren):**
- GlG (SR 151.1), Fedlex (JS-Shell, Volltext nicht statisch abrufbar):
  https://www.fedlex.admin.ch/eli/cc/1996/1498_1498_1498/de
- swissrights.ch, artikelweiser GlG-Spiegel (Art. 1/2/3/5/6/7/10/13):
  https://www.swissrights.ch/gesetze/Artikel-10-GlG-2020-DE.php (u.a.)
- EBG — Bundesverfassung und Gleichstellungsgesetz:
  https://www.ebg.admin.ch/de/bundesverfassung-und-gleichstellungsgesetz
- BJ — FAQ zur GlG-Revision 2018:
  https://www.bj.admin.ch/bj/de/home/staat/gesetzgebung/archiv/lohngleichheit/faq.html
- Leitfaden «GlG im Gerichtsverfahren», gleichstellungsgesetz.ch:
  https://www.gleichstellungsgesetz.ch/pdf/RED_210622_2_Leitfaden_Gleichstellungsgesetz_Einzelseiten.pdf
- arbeitsrecht-aktuell.ch zu Art. 10 GlG (provisorische Wiedereinstellung,
  Anfechtungsfrist): https://www.arbeitsrecht-aktuell.ch/de/2026/05/23/provisorische-wiedereinstellung-nach-art-10-glg-ein-starker-schutz-mit-hohen-praktischen-huerden/

**Verwandte Repo-Dossiers:** `arbeitsrecht-rechner.md` (336b-Fristen),
`arbeitsrecht-vorlagen.md` (Stilreferenz), `zpo-kosten-streitwert.md`
(Streitwert/Art. 92), Normsammlung `bibliothek/normen/zpo-zustaendigkeit-regelwerk.md`.
