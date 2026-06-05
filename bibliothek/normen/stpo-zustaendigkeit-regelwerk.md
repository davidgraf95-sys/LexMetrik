# StPO-Zuständigkeiten — Regelwerk (Deep Research)

**Erstellt:** 5.6.2026 · **Wortlaut-Quelle:** Fedlex SR 312.0, Stand 1.1.2024
(Cache /tmp/stpo.html) · **Abrufdatum: 5.6.2026**
**Status: Arbeitsgrundlage für den Rechtsweg «Straf» — NICHT abgenommen.
BGE/BStGer-Zitate teils aus Vor-StPO-Zeit bzw. Beschwerdekammer-Praxis,
vor Verwendung rückverifizieren (im Bericht je gekennzeichnet).**

## TEIL 1 — Sachlich/funktionell (Art. 12–28) + Verfahrensarten

# StPO-Zuständigkeiten Teil 1 — Sachlich/Funktionell + Verfahrensarten (Regelwerk)

**Erstellt:** 5.6.2026 · **Wortlaut-Quelle:** Fedlex-Filestore SR 312.0 (Strafprozessordnung), **konsolidierte Fassung «Stand am 1. Januar 2024»** (ELI `cc/2010/267`, Konsolidierung `20240101`; lokaler Cache `/tmp/stpo.html`, reproduzierbar via `scripts/fedlex-cache.sh`, Anker `id="art_X"`). **Abrufdatum: 5.6.2026.**
**Status: Arbeitsgrundlage für den Engine-Umbau — NICHT abgenommen (§7/§8 CLAUDE.md).** BGE-Angaben nur, wo belegbar; sonst **[Sekundär]**. **Keine Repo-Dateien geändert.**

**Empirische Verifikation (§7):** Alle 29 geforderten Anker (`art_12`–`art_28`, `art_352`–`art_363`, zusätzlich `art_352_a`) sind im Cache vorhanden. Konsolidierungsstand empirisch ermittelt: Filestore-Titel trägt «Stand am 1. Januar 2024» → die **StPO-Revision (BG vom 17. Juni 2022, AS 2023 468, BBl 2019 6697, in Kraft seit 1.1.2024)** ist eingearbeitet. Im Gesamttext finden sich 88 Fundstellen «in Kraft seit 1. Jan. 2024».

> **Revisions-Hinweis (Übersicht für Teil 1):** Von den hier erfassten Artikeln sind durch die Revision 1.1.2024 **textlich geändert**: **Art. 19 Abs. 2** (Einzelgericht-Schwelle neu gefasst), **Art. 352a** (neu eingefügt — Einvernahmepflicht), **Art. 353 Abs. 1 lit. f^bis + Abs. 2** (DNA-Löschfrist; Zivilforderung CHF 30 000), **Art. 354 Abs. 1 lit. a^bis + Abs. 1^bis** (Einsprache-/Anfechtungsrecht der Privatklägerschaft). Die **Strafbehörden-/Gerichts-Kataloge Art. 12–18, 20–28** sowie das **abgekürzte Verfahren Art. 358–362** und **Art. 357/363** sind in dieser Revision **textlich unverändert** (ältere Fassungen bzw. Erstfassung 2011).

---

## TEIL A — Strafbehörden-Katalog (Art. 12–18)

### Art. 12 — Strafverfolgungsbehörden
**1. Wortlaut-Kern.** «Strafverfolgungsbehörden sind: **a.** die Polizei; **b.** die Staatsanwaltschaft; **c.** die Übertretungsstrafbehörden.»
**2. Regel.** Abschliessender Katalog der Verfolgungsseite (Vorverfahren). Trias Polizei / StA / Übertretungsstrafbehörde. Definitionsnorm — keine eigene Zuständigkeitszuweisung, sondern Typisierung.
**3. Engine-Hinweis.** Enum `verfolgungsbehoerde ∈ {polizei, staatsanwaltschaft, uebertretungsstrafbehoerde}`. Diese Trias ist der Gegenpol zum Gerichts-Enum (Art. 13); Engine sollte für jeden Verfahrensschritt genau einer Kategorie zuordnen.

### Art. 13 — Gerichte
**1. Wortlaut-Kern.** «Gerichtliche Befugnisse im Strafverfahren haben: **a.** das Zwangsmassnahmengericht; **b.** das erstinstanzliche Gericht; **c.** die Beschwerdeinstanz; **d.** das Berufungsgericht.»
**2. Regel.** Abschliessender Katalog der gerichtlichen Behörden (vier Typen). Definiert die funktionellen Gerichtsebenen, die in Art. 18–21 sachlich/funktionell ausgestaltet werden.
**3. Engine-Hinweis.** Enum `gericht ∈ {zwangsmassnahmengericht, erstinstanzlich, beschwerdeinstanz, berufungsgericht}`. Bildet die vertikale Instanzenachse; Engine verknüpft jeden Entscheid mit genau einem Typ und prüft Unvereinbarkeiten (Art. 18 II, 21 II/III).

### Art. 14 — Bezeichnung und Organisation der Strafbehörden (kantonale Organisationshoheit)
**1. Wortlaut-Kern.** Abs. 1: «Bund und Kantone **bestimmen ihre Strafbehörden und deren Bezeichnungen**.» Abs. 2: Sie regeln **Wahl, Zusammensetzung, Organisation und Befugnisse**, soweit dieses Gesetz / andere Bundesgesetze dies **nicht abschliessend** regeln. Abs. 3: Sie **können Ober- oder Generalstaatsanwaltschaften** vorsehen. Abs. 4: Sie können **mehrere gleichartige Strafbehörden** einsetzen und bestimmen dann den jeweiligen **örtlichen und sachlichen Zuständigkeitsbereich**; **ausgenommen** sind **Beschwerdeinstanz und Berufungsgericht**. Abs. 5: Sie regeln die **Aufsicht**.
**2. Regel.** Tragende **Organisationshoheit-Norm**: Behördenbezeichnungen sind kantonal (z. B. «Zwangsmassnahmengericht» heisst kantonal unterschiedlich) → kantonale Stammdaten unverzichtbar. **Schranke Abs. 4 a. E.:** keine Aufspaltung von Beschwerdeinstanz und Berufungsgericht in mehrere gleichartige Behörden (Einheit der oberen Instanzen pro Kanton).
**3. Engine-Hinweis.** Behördennamen/-adressen sind **kantonal-variable Stammdaten** (SSoT, §5) — Querverweis auf `bibliothek/behoerden/gog-gerichtsorganisation-kantone.md` und `gerichtsbehoerden-kantone.md`. Engine darf StPO-Funktionstypen (Art. 13/18–21) **nicht** mit fixen Bezeichnungen hartkodieren, sondern über eine Kanton→Bezeichnung-Mapping-Tabelle auflösen. Flag `obere_instanz_unteilbar=true` für Beschwerde-/Berufungsinstanz.

### Art. 15 — Polizei
**1. Wortlaut-Kern.** Polizeitätigkeit von Bund/Kantonen/Gemeinden richtet sich nach der StPO. Sie **ermittelt aus eigenem Antrieb, auf Anzeige und im Auftrag der StA**; dabei untersteht sie **Aufsicht und Weisungen der StA**. Ist ein Straffall **bei einem Gericht hängig**, kann dieses der Polizei Weisungen/Aufträge erteilen.
**2. Regel.** Subordinationsverhältnis Polizei → StA im Vorverfahren; im Gerichtsstadium tritt das Gericht als Weisungsgeber hinzu.
**3. Engine-Hinweis.** Weisungshoheit als Funktion der Verfahrensphase modellieren: `phase=vorverfahren → weisungsgeber=staatsanwaltschaft`; `phase=hauptverfahren → weisungsgeber=gericht`.

### Art. 16 — Staatsanwaltschaft
**1. Wortlaut-Kern.** Die StA ist für die **gleichmässige Durchsetzung des staatlichen Strafanspruchs** verantwortlich. Sie **leitet das Vorverfahren**, verfolgt Straftaten in der Untersuchung, **erhebt gegebenenfalls Anklage und vertritt die Anklage**.
**2. Regel.** Zentralstellung der StA (Verfahrensherrin des Vorverfahrens; Anklagebehörde). Grundlage für ihre Entscheidträgerschaft im Strafbefehls- und abgekürzten Verfahren (Teil C/D).
**3. Engine-Hinweis.** StA als Dreh- und Angelpunkt: Entscheidträger Strafbefehl (Art. 352 ff.), Antrag/Steuerung abgekürztes Verfahren (Art. 358 ff.), Anklageerhebung. Flag `entscheidtraeger=staatsanwaltschaft` für diese Verfahrensarten.

### Art. 17 — Übertretungsstrafbehörden
**1. Wortlaut-Kern.** Abs. 1: Bund/Kantone **können** Verfolgung und Beurteilung von **Übertretungen Verwaltungsbehörden übertragen**. Abs. 2: Übertretungen **im Zusammenhang mit einem Verbrechen/Vergehen** werden **zusammen mit diesem durch StA und Gerichte** verfolgt und beurteilt.
**2. Regel.** Kann-Vorschrift (kantonale Option). **Konnexitätsregel Abs. 2:** Bei Zusammentreffen mit Verbrechen/Vergehen zieht die StA-/Gerichtszuständigkeit die Übertretung an sich (Attraktion).
**3. Engine-Hinweis.** Gate `uebertretung_eigenstaendig?`: wenn `true` und Kanton hat Verwaltungsbehörde delegiert → `behoerde=uebertretungsstrafbehoerde` (Verfahren nach Art. 357). Wenn Übertretung mit Verbrechen/Vergehen konnex → Attraktion zu StA/Gericht (`art17_abs2_attraktion=true`).

### Art. 18 — Zwangsmassnahmengericht (funktionell + Unvereinbarkeit)
**1. Wortlaut-Kern.** Abs. 1: Das ZMG ist zuständig für die **Anordnung der Untersuchungs- und Sicherheitshaft** und — soweit im Gesetz vorgesehen — für **Anordnung/Genehmigung weiterer Zwangsmassnahmen**. Abs. 2 (**Unvereinbarkeit**): Mitglieder des ZMG **können im gleichen Fall nicht als Sachrichterinnen/Sachrichter** tätig sein.
**2. Regel.** Funktionelle Sonderzuständigkeit für Haft + bestimmte Zwangsmassnahmen. **Personelle Unvereinbarkeit** (Trennung Haft-/Sachrichter) sichert Unbefangenheit. **Revision 1.1.2024:** Art. 18 trägt **keine** Revisionsfussnote → **unverändert** (ausdrücklich markiert; Erstfassung 2011).
**3. Engine-Hinweis.** Funktionstyp `zwangsmassnahmengericht` mit Aufgaben-Set {U-Haft, Sicherheitshaft, gesetzlich vorgesehene weitere ZM}. Hard-Flag `unvereinbarkeit_sachrichter=true` → Engine warnt, wenn dieselbe Person später als erstinstanzlicher Sachrichter geführt würde.

---

## TEIL B — Sachliche Zuständigkeit (Art. 19–28)

### Art. 19 — Erstinstanzliches Gericht (Einzelgericht-Option) ⚠️ **Revision 1.1.2024 (Abs. 2)**
**1. Wortlaut-Kern.** Abs. 1: Das erstinstanzliche Gericht beurteilt **in erster Instanz alle Straftaten, die nicht in die Zuständigkeit anderer Behörden fallen** (Auffangzuständigkeit). Abs. 2: Bund/Kantone **können als erstinstanzliches Gericht ein Einzelgericht** vorsehen für die Beurteilung von:
- **lit. a** — **Übertretungen**;
- **lit. b** — **Verbrechen und Vergehen**, **mit Ausnahme** derer, für welche die StA beantragt: eine **Freiheitsstrafe von mehr als zwei Jahren**, eine **Verwahrung (Art. 64 StGB)**, eine **Behandlung (Art. 59 StGB)** oder — bei gleichzeitig zu widerrufenden bedingten Sanktionen — einen **Freiheitsentzug von mehr als zwei Jahren**.
**2. Regel.** **Auffanggrundsatz Abs. 1.** Abs. 2 = **kantonale Option** für Einzelgericht; Schwelle = Antrag der StA (nicht das Urteil!) > 2 Jahre FS bzw. Verwahrung/stationäre Massnahme → dann **Kollegialgericht** zwingend.
**3. Revision 1.1.2024.** Abs. 2 **neu gefasst** (Ziff. I des BG vom 17.6.2022, in Kraft seit 1.1.2024, AS 2023 468; BBl 2019 6697). Schwelle und Massnahmenausnahmen (Art. 59/64 StGB) sind die revidierte Fassung — ausdrücklich markiert.
**4. Engine-Hinweis.** Gate `einzelgericht_zulaessig`: `true`, wenn (`deliktstyp=uebertretung`) ODER (`verbrechen/vergehen` UND `antrag_freiheitsstrafe ≤ 2J` UND `keine_verwahrung_64` UND `keine_behandlung_59` UND `kein_widerruf_freiheitsentzug > 2J`). Anknüpfung an **StA-Antrag**, nicht Urteil → Eingabefeld `beantragte_sanktion`. Kantonale Aktivierung der Einzelgericht-Option als Stammdatum.

### Art. 20 — Beschwerdeinstanz
**1. Wortlaut-Kern.** Abs. 1: Beurteilt **Beschwerden gegen Verfahrenshandlungen und gegen nicht der Berufung unterliegende Entscheide** der **lit. a** erstinstanzlichen Gerichte; **lit. b** Polizei, StA und Übertretungsstrafbehörden; **lit. c** des Zwangsmassnahmengerichts in den gesetzlich vorgesehenen Fällen. Abs. 2: Bund/Kantone **können die Befugnisse der Beschwerdeinstanz dem Berufungsgericht übertragen**.
**2. Regel.** Funktionelle Rechtsmittelinstanz für Beschwerden (Abgrenzung zur Berufung: nur **nicht** berufungsfähige Entscheide). Abs. 2 = kantonale Organisationsoption (Personalunion mit Berufungsgericht).
**3. Engine-Hinweis.** Routing `rechtsmittel`: Beschwerde (Art. 20) vs. Berufung (Art. 21) anhand `entscheidtyp`. Kantonsflag `beschwerde_an_berufungsgericht_delegiert`.

### Art. 21 — Berufungsgericht (+ Unvereinbarkeiten)
**1. Wortlaut-Kern.** Abs. 1: Entscheidet über **lit. a** Berufungen gegen Urteile der erstinstanzlichen Gerichte; **lit. b** Revisionsgesuche. Abs. 2: Wer als **Mitglied der Beschwerdeinstanz** tätig war, kann **im gleichen Fall nicht** im Berufungsgericht wirken. Abs. 3: Mitglieder des Berufungsgerichts können **im gleichen Fall nicht als Revisionsrichter** tätig sein.
**2. Regel.** Obere kantonale Sachinstanz (Berufung + Revision). **Zwei Unvereinbarkeiten** (Beschwerde↔Berufung; Berufung↔Revision) sichern Instanzentrennung.
**3. Engine-Hinweis.** Funktionstyp `berufungsgericht` mit Aufgaben {Berufung, Revision}. Hard-Flags `unvereinbar_beschwerde_berufung`, `unvereinbar_berufung_revision`.

### Art. 22 — Kantonale Gerichtsbarkeit (Grundsatz)
**1. Wortlaut-Kern.** «Die **kantonalen** Strafbehörden verfolgen und beurteilen die Straftaten des **Bundesrechts**; vorbehalten bleiben die **gesetzlichen Ausnahmen**.»
**2. Regel.** **Regel-Ausnahme-Verhältnis:** kantonale Gerichtsbarkeit ist die Grundregel, Bundesgerichtsbarkeit (Art. 23/24) die ausdrücklich aufgezählte Ausnahme.
**3. Engine-Hinweis.** Default `gerichtsbarkeit=kantonal`; nur bei Treffer im Katalog Art. 23/24 → `bund`. Determinismus: Katalog-Match entscheidet.

### Art. 23 — Bundesgerichtsbarkeit im Allgemeinen (Katalog vollständig)
**1. Wortlaut-Kern.** Abs. 1: Der Bundesgerichtsbarkeit unterstehen folgende Straftaten des **StGB** (SR 311.0):
- **lit. a** — Straftaten des **1. und 4. Titels** sowie **Art. 140, 156, 189, 190**, sofern gegen **völkerrechtlich geschützte Personen**, **Magistratspersonen des Bundes**, **Mitglieder der Bundesversammlung**, **Bundesanwält:in / Stellvertretende** gerichtet;
- **lit. b** — **Art. 137–141, 144, 160, 172^ter**, sofern Räumlichkeiten/Archive/Schriftstücke **diplomatischer Missionen und konsularischer Posten** betroffen;
- **lit. c** — **Geiselnahme (Art. 185)** zur Nötigung von Behörden des Bundes oder des Auslandes;
- **lit. d** — Verbrechen/Vergehen der **Art. 224–226^ter** (Sprengstoff/Gas);
- **lit. e** — Verbrechen/Vergehen des **10. Titels** (Metall-/Papiergeld, Banknoten, amtliche Wertzeichen/Zeichen des Bundes, Mass und Gewicht); **ausgenommen** Vignetten für Nationalstrassen 1./2. Klasse;
- **lit. f** — Verbrechen/Vergehen des **11. Titels**, sofern **Urkunden des Bundes**; ausgenommen Fahrausweise und Belege des Postzahlungsverkehrs;
- **lit. g** — Straftaten des **12. Titels^bis und 12. Titels^ter** sowie **Art. 264^k** (Völkermord/Verbrechen gegen Menschlichkeit/Kriegsverbrechen);
- **lit. h** — **Art. 260^bis** sowie **13.–15. und 17. Titel**, sofern gegen Bund/Bundesbehörden, gegen den **Volkswillen** bei eidg. Wahlen/Abstimmungen/Referenden/Initiativen, gegen die **Bundesgewalt** oder **Bundesrechtspflege** gerichtet;
- **lit. i** — Verbrechen/Vergehen des **16. Titels** (Störung der Beziehungen zum Ausland);
- **lit. j** — Straftaten des **18. und 19. Titels**, sofern von **Behördenmitglied/Angestellten des Bundes** oder **gegen den Bund** verübt;
- **lit. k** — **Übertretungen der Art. 329 und 331** (militärische Anlagen/Verbotszonen);
- **lit. l** — **politische Verbrechen/Vergehen**, die **Ursache oder Folge von Unruhen** sind, durch die eine **bewaffnete eidgenössische Intervention** veranlasst wird.
Abs. 2: Vorbehalt der **Zuständigkeitsvorschriften des Bundesstrafgerichts in besonderen Bundesgesetzen**.
**2. Regel.** **Abschliessender, deliktsbezogener Katalog** der originären Bundesgerichtsbarkeit (Anknüpfung an StGB-Titel/-Artikel + teils qualifizierte Schutzobjekte/Täter).
**3. Revision 1.1.2024.** Art. 23 trägt **keine** Fussnote zur 1.1.2024-Revision. Die vorhandenen Fussnoten betreffen **frühere** Teilrevisionen: lit. a (StBOG, 1.1.2011), lit. e (Ordnungsbussengesetz, 1.1.2018), lit. g (Römer-Statut, 1.1.2011), lit. k (**Harmonisierung der Strafrahmen, AS 2023 259, in Kraft seit 1.7.2023** — nicht Teil der StPO-Revision 1.1.2024). → für Teil 1 **kein** StPO-Revisions-Eintrag.
**4. Engine-Hinweis.** Katalog als **Lookup-Tabelle StGB-Titel/Artikel → Bundesgerichtsbarkeit**, mit Zusatzbedingungen je lit. (Schutzobjekt bei a/b/h, Täterqualität bei j, Ausnahmen bei e/f). Determinismus: reiner Tatbestands-Match. Engine-Eingaben: `stgb_titel`, `stgb_artikel`, qualifizierende Merkmale. Ausgabe `gerichtsbarkeit=bund` bei Treffer, sonst Default kantonal (Art. 22). **Komplexität:** mehrere lit. erfordern juristische Subsumtion (z. B. «gegen den Bund gerichtet») → als Ja/Nein-Gate an Nutzer, nicht automatisch.

### Art. 24 — Bundesgerichtsbarkeit bei organisiertem Verbrechen, terroristischen Straftaten und Wirtschaftskriminalität
**1. Wortlaut-Kern.** Abs. 1: Der Bundesgerichtsbarkeit unterstehen **zudem** die Straftaten nach **Art. 260^ter, 260^quinquies, 260^sexies, 305^bis, 305^ter und 322^ter–322^septies StGB** sowie die **Verbrechen, die von einer kriminellen oder terroristischen Organisation (Art. 260^ter StGB) ausgehen**, wenn die Straftaten: **lit. a** **zu einem wesentlichen Teil im Ausland** begangen wurden; **lit. b** **in mehreren Kantonen ohne eindeutigen Schwerpunkt** begangen wurden. Abs. 2: Bei **Verbrechen des 2. und 11. Titels StGB** kann die **StA des Bundes eine Untersuchung eröffnen**, wenn **lit. a** die Voraussetzungen von Abs. 1 erfüllt sind **und lit. b** keine kantonale Behörde befasst ist bzw. die zuständige kantonale Behörde um Übernahme ersucht. Abs. 3: Die **Eröffnung einer Untersuchung nach Abs. 2 begründet Bundesgerichtsbarkeit** (fakultative/begründete Bundesgerichtsbarkeit).
**2. Regel.** Katalog mit **kumulativen Anknüpfungskriterien** (Auslands-/Mehrkantonsbezug) — anders als Art. 23 keine reine Tatbestandsanknüpfung, sondern **+ örtliche Schwerpunktbedingung**. Abs. 2/3 = **Wahl-/Begründungskompetenz** der BA (Wirtschaftskriminalität).
**3. Revision.** Fussnoten verweisen auf **AS 2021 360 (Terrorismus-Übereinkommen, in Kraft 1.7.2021)** — **nicht** StPO-Revision 1.1.2024. Für Teil 1 kein 2024-Eintrag.
**4. Engine-Hinweis.** Lookup StGB-Artikel-Set {260^ter/quinquies/sexies, 305^bis/ter, 322^ter–septies} **plus** Gate `wesentlich_im_ausland OR mehrkantonal_ohne_schwerpunkt`. Abs. 2/3: separater Pfad `bund_kann_eroeffnen` (Wirtschaftsdelikte 2./11. Titel) mit Flag `bundesgerichtsbarkeit_durch_eroeffnung=true`. Determinismus: Tatbestands-Match deterministisch, örtliche Kriterien als Eingabe-Gate.

### Art. 25 — Delegation an die Kantone
**1. Wortlaut-Kern.** Abs. 1: Die **BA kann eine Strafsache mit Bundesgerichtsbarkeit nach Art. 23** den kantonalen Behörden **zur Untersuchung und Beurteilung**, ausnahmsweise nur zur Beurteilung, **übertragen**; **ausgenommen** Strafsachen nach **Art. 23 Abs. 1 lit. g** (Völkerstrafrecht). Abs. 2: In **einfachen Fällen** kann sie auch eine Sache mit Bundesgerichtsbarkeit **nach Art. 24** den Kantonen übertragen.
**2. Regel.** Rückdelegationskompetenz der BA (Entlastung). Sperre für Kernvölkerstrafrecht (lit. g).
**3. Engine-Hinweis.** Flag `delegation_an_kanton_moeglich` (true ausser Art. 23 I lit. g); bei Art. 24 zusätzlich Gate `einfacher_fall`. Ergebnis verschiebt `zustaendige_behoerde` von Bund auf Kanton.

### Art. 26 — Mehrfache Zuständigkeit
**1. Wortlaut-Kern.** Abs. 1: Bei Begehung **in mehreren Kantonen / im Ausland** oder bei Tätern/Teilnehmern mit Wohnsitz/Aufenthalt in verschiedenen Kantonen entscheidet die **BA, welcher Kanton untersucht und beurteilt**. Abs. 2: Bei **gleichzeitiger Bundes- und kantonaler Gerichtsbarkeit** kann die BA die **Vereinigung** in Bundes- oder Kantonshand anordnen. Abs. 3: Eine nach Abs. 2 begründete Gerichtsbarkeit **bleibt bestehen**, auch wenn der zuständigkeitsbegründende Verfahrensteil **eingestellt** wird (**perpetuatio fori**). Abs. 4/5: gegenseitige Aktenedition; nach Entscheid gehen die Akten an die zuständige Behörde.
**2. Regel.** Konfliktauflösung bei Mehrfachanknüpfung; **Vereinigungs- und Forumsbestimmungskompetenz der BA**; perpetuatio fori (Abs. 3).
**3. Engine-Hinweis.** Bei `mehrere_kantone OR ausland OR verteilte_taeter` → Entscheidträger = BA (`forum_bestimmt_durch=bundesanwaltschaft`). Flag `perpetuatio_fori=true`. Engine gibt hier **Hinweis** statt fertigem Forum (Ermessensentscheid der BA), kein deterministisches Einzelforum.

### Art. 27 — Zuständigkeit für erste Ermittlungen
**1. Wortlaut-Kern.** Abs. 1: Bei **gegebener Bundesgerichtsbarkeit, Dringlichkeit und noch nicht tätigen Bundesbehörden** können **polizeiliche Ermittlungen und Untersuchung auch von den kantonalen Behörden** durchgeführt werden, die nach den Gerichtsstandsregeln örtlich zuständig wären; die **BA ist unverzüglich zu orientieren**, der Fall ihr **so bald als möglich** zu übergeben bzw. nach Art. 25/26 zu unterbreiten. Abs. 2: Bei Mehrkantons-/Auslandstaten mit **noch nicht feststehender Zuständigkeit** können die **Bundesbehörden erste Ermittlungen** durchführen.
**2. Regel.** Eilkompetenz/Notzuständigkeit zur Sicherung erster Ermittlungen, bevor das endgültige Forum feststeht.
**3. Engine-Hinweis.** Übergangs-Flag `erste_ermittlungen_provisorisch` mit `phase=vor_forumsentscheid`. Kein Endforum — Hinweis auf nachgelagerten Entscheid nach Art. 25/26.

### Art. 28 — Konflikte
**1. Wortlaut-Kern.** «**Konflikte** zwischen der **StA des Bundes** und **kantonalen Strafbehörden** entscheidet das **Bundesstrafgericht**.»
**2. Regel.** Letztentscheid bei Kompetenzkonflikten Bund/Kanton liegt beim **BStGer** (Beschwerdekammer).
**3. Engine-Hinweis.** Flag `konfliktentscheid_durch=bundesstrafgericht`. Querverweis auf Bund-Dossier (`bibliothek/behoerden/gerichte-bund.md`).

---

## TEIL C — Funktionelle Sonderschnittstellen

### Zwangsmassnahmengericht (Art. 18) — siehe Teil A
Funktionell-sachlicher Sonderfall mit Unvereinbarkeit; oben erfasst. **Revision 1.1.2024: unverändert.**

### Jugendstrafbehörden (Verweis JStPO)
**Regel.** Die StPO regelt das ordentliche Erwachsenenstrafverfahren; für Jugendliche gilt die **Jugendstrafprozessordnung (JStPO, SR 312.1)** als lex specialis mit eigenen Behörden (Jugendanwaltschaft/Jugendgericht). Die StPO ist subsidiär anwendbar (Art. 3 JStPO). **Im StPO-Zuständigkeitskatalog Teil 1 nicht eigenständig geregelt — reiner Verweis.**
**Engine-Hinweis.** Gate `taeter_jugendlich?` → Routing in separaten JStPO-Pfad (eigene Engine/eigenes Dossier; **nicht** mit StPO-Behördenkatalog fusionieren, §4). JStPO-Wortlaute sind **nicht** Teil dieses Caches — bei Ausbau separat am Filestore (SR 312.1) verifizieren.

### StBOG-Schnittstelle Bund (Strafkammer/Berufungskammer BStGer)
**Regel.** Die bundesseitigen Spruchkörper (erstinstanzliche **Strafkammer** und **Berufungskammer** des Bundesstrafgerichts, **Beschwerdekammer** für Art. 28) ergeben sich aus dem **Strafbehördenorganisationsgesetz (StBOG, SR 173.71)**, nicht aus der StPO selbst. Art. 23 Abs. 2 StPO behält diese Spezialvorschriften ausdrücklich vor.
**Engine-Hinweis.** **Querverweis auf das bestehende Bund-Dossier** `bibliothek/behoerden/gerichte-bund.md` (und `bibliothek/kosten/gerichtskosten-bund.md`) genügt — dort die konkreten Spruchkörper/Adressen. StPO-Engine liefert nur `gerichtsbarkeit=bund` und delegiert die Spruchkörperauflösung an das Bund-Dossier (SSoT, §5).

---

## TEIL D — Verfahrensarten mit Zuständigkeitsfolgen

### Strafbefehlsverfahren (Art. 352–356)

#### Art. 352 — Voraussetzungen (+ Art. 352a) ⚠️ **Art. 352a neu / Revision 1.1.2024**
**1. Wortlaut-Kern.** Abs. 1: Bei eingestandenem oder anderweitig **ausreichend geklärtem Sachverhalt** erlässt die **StA einen Strafbefehl**, wenn sie (inkl. allfällig zu widerrufender bedingter Strafe/Entlassung) eine der folgenden Strafen für ausreichend hält: **lit. a Busse**; **lit. b Geldstrafe ≤ 180 Tagessätze**; *(lit. c aufgehoben)*; **lit. d Freiheitsstrafe ≤ 6 Monate**. Abs. 2: Verbindbar mit Massnahmen nach **Art. 66 und 67e–73 StGB**. Abs. 3: Strafen lit. b–d kombinierbar, sofern insgesamt ≤ 6 Monate FS entsprechend; Verbindung mit Busse immer möglich.
**Art. 352a (neu) — Einvernahme:** «Ist zu erwarten, dass der Strafbefehl eine **zu verbüssende Freiheitsstrafe** zur Folge hat, so führt die StA eine **Einvernahme** der beschuldigten Person durch.»
**2. Regel.** Summarisches Verfahren der **StA als Entscheidträgerin** (Verzicht auf Gerichtsverfahren) bei klarem Sachverhalt und Strafmass im Bagatell-/Mittelbereich (Obergrenze 6 Monate FS / 180 TS / Busse).
**3. Revision 1.1.2024.** **Art. 352a neu eingefügt** (Ziff. I des BG vom 17.6.2022, in Kraft seit 1.1.2024, AS 2023 468; BBl 2019 6697) — **Einvernahmepflicht** bei zu verbüssender Freiheitsstrafe. Ausdrücklich markiert.
**4. Engine-Hinweis.** Gate `strafbefehl_zulaessig`: Sachverhalt geklärt UND Strafmass ∈ {Busse, Geldstrafe ≤180 TS, FS ≤6 Mt, Kombi ≤6 Mt}. Entscheidträger `staatsanwaltschaft`. Zusatz-Flag `einvernahme_pflicht=true`, wenn `zu_verbuessende_freiheitsstrafe` (Art. 352a). Schwellen als datierte Parameter (Revisionsstand 1.1.2024).

#### Art. 353 — Inhalt und Eröffnung ⚠️ **Revision 1.1.2024 (lit. f^bis, Abs. 2)**
**1. Wortlaut-Kern.** Abs. 1: Inhaltskatalog lit. a–k (u. a. verfügende Behörde, Sachverhalt, Tatbestände, Sanktion, **lit. f^bis DNA-Löschfrist**, **lit. i Hinweis auf Einsprachemöglichkeit und Folgen**). Abs. 2: Die **StA kann über Zivilforderungen entscheiden**, soweit anerkannt oder wenn **lit. a** ohne weitere Beweiserhebung beurteilbar **und lit. b Streitwert ≤ CHF 30 000**. Abs. 3: **unverzügliche schriftliche Eröffnung** an Einsprachebefugte.
**2. Regel.** Formerfordernisse; **adhäsionsweise Zivilforderung bis CHF 30 000** durch die StA.
**3. Revision 1.1.2024.** **Abs. 2** neu gefasst (Zivilforderungs-Schwelle CHF 30 000; AS 2023 468, in Kraft 1.1.2024). **lit. f^bis** (DNA-Löschfrist) eingefügt per **1.8.2023** (AS 2023 309) — separate Revision, ausdrücklich markiert.
**4. Engine-Hinweis.** Pflichtinhalt-Checkliste; Zivilforderungs-Gate `streitwert ≤ 30000 AND ohne_beweiserhebung_beurteilbar` (datierter Parameter, Stand 1.1.2024).

#### Art. 354 — Einsprache (Einsprache-Weg) ⚠️ **Revision 1.1.2024 (lit. a^bis, Abs. 1^bis)**
**1. Wortlaut-Kern.** Abs. 1: Einsprache **bei der StA innert 10 Tagen schriftlich** durch **lit. a beschuldigte Person; lit. a^bis Privatklägerschaft; lit. b weitere Betroffene; lit. c** Ober-/Generalstaatsanwaltschaft. Abs. 1^bis: Die **Privatklägerschaft kann den Strafbefehl hinsichtlich der Sanktion nicht anfechten**. Abs. 2: Einsprachen sind zu begründen (Ausnahme: beschuldigte Person). Abs. 3: **Ohne gültige Einsprache wird der Strafbefehl zum rechtskräftigen Urteil**.
**2. Regel.** **Einsprache = Rechtsbehelf eigener Art** (keine Devolution), Frist 10 Tage; ohne Einsprache **Rechtskraftwirkung** (Surrogat des Urteils).
**3. Revision 1.1.2024.** **lit. a^bis und Abs. 1^bis neu eingefügt** (AS 2023 468, in Kraft 1.1.2024): Einspracherecht der Privatklägerschaft + Sperre der Sanktionsanfechtung. Ausdrücklich markiert.
**4. Engine-Hinweis.** Einsprachefrist 10 Tage (Anbindung an Fristen-Engine, dies a quo nach Zustellung). Legitimations-Set inkl. Privatklägerschaft; Flag `privatklaegerschaft_keine_sanktionsanfechtung`. Ohne Einsprache → `rechtskraft=true`.

#### Art. 355 — Verfahren bei Einsprache
**1. Wortlaut-Kern.** Abs. 1: StA nimmt **weitere Beweise** ab. Abs. 2: Bei **unentschuldigtem Fernbleiben** der einsprechenden Person von der Einvernahme gilt die **Einsprache als zurückgezogen**. Abs. 3: Danach entscheidet die StA, ob sie **lit. a am Strafbefehl festhält; lit. b einstellt; lit. c neuen Strafbefehl erlässt; lit. d Anklage beim erstinstanzlichen Gericht erhebt**.
**2. Regel.** StA bleibt zunächst Herrin des Verfahrens; vier Entscheidoptionen. **Rückzugsfiktion** bei Säumnis (Abs. 2).
**3. Engine-Hinweis.** Entscheidbaum StA mit 4 Ästen; Flag `saeumnisfiktion_rueckzug`. Übergang zu Gericht nur bei lit. a (Festhalten → Art. 356) oder lit. d (Anklage).

#### Art. 356 — Verfahren vor dem erstinstanzlichen Gericht (Gericht erster Instanz)
**1. Wortlaut-Kern.** Abs. 1: Hält die StA fest, **überweist sie die Akten unverzüglich dem erstinstanzlichen Gericht**; **der Strafbefehl gilt als Anklageschrift**. Abs. 2: Das Gericht **entscheidet über die Gültigkeit von Strafbefehl und Einsprache**. Abs. 3: Rückzug bis Abschluss der Parteivorträge. Abs. 4: **Säumnisfiktion** (unentschuldigtes Fernbleiben → Rückzug). Abs. 5: Bei Ungültigkeit **Aufhebung und Rückweisung** an die StA. Abs. 6: Bei Einsprache nur gegen Kosten/Nebenfolgen **schriftliches Verfahren** (ausser ausdrücklicher Verhandlungsantrag). Abs. 7: Mehrere Strafbefehle zum gleichen Sachverhalt → **Art. 392 sinngemäss**.
**2. Regel.** **Zuständigkeitsübergang auf das erstinstanzliche Gericht** (Art. 19) durch Festhalten der StA; Strafbefehl = Anklageschrift. Gericht prüft zuerst Gültigkeit (Prozessvoraussetzung).
**3. Revision.** Art. 356 trägt **keine** 1.1.2024-Fussnote → **textlich unverändert**.
**4. Engine-Hinweis.** Forum-Switch `staatsanwaltschaft → erstinstanzliches_gericht` (Art. 19) bei `festhalten=true`. Flags `strafbefehl_als_anklageschrift`, `gueltigkeitspruefung_zuerst`, `saeumnisfiktion`, `nur_kosteneinsprache → schriftlich`.

### Übertretungsstrafverfahren (Art. 357)
**1. Wortlaut-Kern.** Abs. 1: Die zur Verfolgung/Beurteilung von Übertretungen eingesetzten **Verwaltungsbehörden haben die Befugnisse der StA**. Abs. 2: Verfahren **sinngemäss nach Strafbefehlsverfahren**. Abs. 3: Ist der **Übertretungstatbestand nicht erfüllt**, **Einstellung mit kurz begründeter Verfügung**. Abs. 4: Bei Verbrechen/Vergehen **Überweisung an die StA**.
**2. Regel.** Übertretungsstrafbehörde (Art. 12 lit. c / 17) als **funktionales StA-Äquivalent**; Verweis auf Strafbefehlsregeln (Art. 352 ff.).
**3. Revision.** Keine 1.1.2024-Fussnote → **unverändert**.
**4. Engine-Hinweis.** Wenn `behoerde=uebertretungsstrafbehoerde` → Verfahren = Strafbefehlsverfahren (Wiederverwendung der Art.-352-ff.-Logik per Verweis, **nicht** Duplikat). Übergangs-Flag `bei_verbrechen_vergehen → an_staatsanwaltschaft` (Art. 357 IV, spiegelt Art. 17 II).

### Abgekürztes Verfahren (Art. 358–362)
**Art. 358 — Grundsätze.** Beschuldigte Person kann **bis zur Anklageerhebung** das abgekürzte Verfahren beantragen, wenn sie den **wesentlichen Sachverhalt eingesteht** und **Zivilansprüche im Grundsatz anerkennt**. **Ausgeschlossen**, wenn die StA **Freiheitsstrafe > 5 Jahre** verlangt.
**Art. 359 — Einleitung.** StA entscheidet **endgültig und unbegründet** über die Durchführung; Mitteilung an Parteien, **10-Tage-Frist** für Privatklägerschaft zur Anmeldung von Zivil-/Entschädigungsansprüchen.
**Art. 360 — Anklageschrift.** Inhalt lit. a–h (inkl. Strafmass, Massnahmen, Zivilansprüche, **lit. h Hinweis: Zustimmung = Verzicht auf ordentliches Verfahren und Rechtsmittel**). Eröffnung an Parteien; **10 Tage** für Zustimmung/Ablehnung; **Zustimmung unwiderruflich**; Schweigen der Privatklägerschaft = Zustimmung; bei Zustimmung Übermittlung **ans erstinstanzliche Gericht**; bei Ablehnung **ordentliches Vorverfahren**.
**Art. 361 — Hauptverhandlung.** Das **erstinstanzliche Gericht** führt eine Hauptverhandlung; Befragung der beschuldigten Person (Sachverhaltsanerkennung + Aktenübereinstimmung); **kein Beweisverfahren**.
**Art. 362 — Urteil oder ablehnender Entscheid.** Gericht prüft **frei** Rechtmässigkeit/Angemessenheit; bei Erfüllung **Urteil = Anklageschrift** (summarische Begründung); sonst **Rückweisung** an StA (Entscheid **nicht anfechtbar**); im Hinblick auf das abgekürzte Verfahren abgegebene Erklärungen sind danach **nicht verwertbar**; **Berufung nur** wegen fehlender Zustimmung oder Abweichung Urteil/Anklageschrift.
**Regel/Zuständigkeitsfolge.** StA steuert das Vorverfahren (Antrag/Einleitung/Anklageschrift), das **erstinstanzliche Gericht** urteilt (Art. 361/362). Konsensbasiert; FS-Obergrenze **5 Jahre** (Art. 358 II) als hartes Gate.
**Revision.** Art. 358–362 tragen **keine** 1.1.2024-Fussnoten → **textlich unverändert**.
**Engine-Hinweis.** Gate `abgekuerzt_zulaessig`: `gestaendnis AND zivil_anerkannt AND beantragte_FS ≤ 5J`. Phasenmodell: StA (358–360) → erstinstanzliches Gericht (361–362). Flags `zustimmung_unwiderruflich`, `keine_anfechtbarkeit_rueckweisung`, `berufung_eingeschraenkt`. 10-Tage-Fristen an Fristen-Engine.

### Selbstständige nachträgliche Entscheide (Art. 363 ff. — kurz)
**Art. 363 — Zuständigkeit.** Abs. 1: Das **Gericht, das das erstinstanzliche Urteil fällte**, trifft auch die einer gerichtlichen Behörde übertragenen **selbstständigen nachträglichen Entscheide** (sofern Bund/Kantone nichts anderes bestimmen). Abs. 2: Hat die **StA (Strafbefehl)** oder die **Übertretungsstrafbehörde** entschieden, **treffen diese die nachträglichen Entscheide**. Abs. 3: Für nicht dem Gericht zustehende nachträgliche Entscheide bestimmen Bund/Kantone die Behörde.
**Regel.** **Perpetuatio fori des Urteilsgerichts** für nachträgliche Entscheide (z. B. Umwandlung, Vollzugsfragen); Spiegelung der ursprünglichen Entscheidträgerschaft bei Strafbefehl/Übertretung.
**Engine-Hinweis.** Flag `nachtraeglicher_entscheid_durch = ursprueglicher_entscheidtraeger` (Gericht bzw. StA/Übertretungsstrafbehörde), kantonaler Vorbehalt (Abs. 1/3).

---

## Querschnitt — Engine-Designhinweise (Teil 1)

- **Zwei orthogonale Achsen:** (a) **Behördentyp** Verfolgung {Polizei, StA, Übertretungsstrafbehörde} (Art. 12) vs. Gericht {ZMG, erstinstanzlich, Beschwerde, Berufung} (Art. 13); (b) **Gerichtsbarkeit** {kantonal (Art. 22, Default), Bund (Art. 23/24)}.
- **Default kantonal:** `gerichtsbarkeit=kantonal`, Override nur bei Katalog-Match Art. 23/24. Konfliktentscheid → BStGer (Art. 28).
- **Kantonale Organisationshoheit (Art. 14):** Funktionstypen sind bundesrechtlich fix, **Bezeichnungen/Adressen kantonal** → Stammdaten-Tabelle (Querverweis `bibliothek/behoerden/`), keine Hartkodierung. Beschwerde-/Berufungsinstanz unteilbar (Art. 14 IV).
- **Unvereinbarkeiten als Hard-Flags:** ZMG↔Sachrichter (Art. 18 II), Beschwerde↔Berufung & Berufung↔Revision (Art. 21 II/III).
- **Einzelgericht-Schwelle (Art. 19 II):** Anknüpfung an **StA-Antrag** (>2 J FS / Verwahrung 64 / Behandlung 59), nicht Urteil.
- **Verfahrensarten = Entscheidträger-Routing:** Strafbefehl (StA, Art. 352 ff.) → bei Einsprache + Festhalten Forum-Switch zum erstinstanzlichen Gericht (Art. 356); Übertretung (Verwaltungsbehörde mit StA-Befugnissen, Art. 357); abgekürzt (StA-Steuerung + erstinstanzliches Urteil, Art. 358–362, Gate FS ≤ 5 J); nachträgliche Entscheide folgen dem ursprünglichen Träger (Art. 363).
- **§4 (keine Fusion):** JStPO-Pfad und Bund-Spruchkörper (StBOG) **getrennt** halten; nur Querverweise auf JStPO (SR 312.1) bzw. Bund-Dossier.

## Revisions-Markierungen StPO-Revision 1.1.2024 (AS 2023 468, BBl 2019 6697) — zusammengefasst
- **Art. 19 Abs. 2** — ✅ **textlich geändert** (Einzelgericht-Schwelle/Massnahmenausnahmen 59/64 StGB).
- **Art. 352a** — ✅ **neu eingefügt** (Einvernahmepflicht bei zu verbüssender Freiheitsstrafe).
- **Art. 353 Abs. 2** — ✅ **geändert** (Zivilforderung bis CHF 30 000). *(lit. f^bis DNA-Löschfrist = separate Revision per 1.8.2023, AS 2023 309.)*
- **Art. 354 Abs. 1 lit. a^bis + Abs. 1^bis** — ✅ **neu** (Einspracherecht Privatklägerschaft; keine Sanktionsanfechtung).
- **Unverändert in dieser Revision** (ausdrücklich markiert): Art. 12–18, 20–28 (deren Fussnoten betreffen frühere Revisionen — z. B. Art. 23 lit. k Strafrahmenharmonisierung 1.7.2023; Art. 24 Terrorismus-Übereinkommen 1.7.2021; Art. 23 lit. a/g StBOG/Römer-Statut 2011), Art. 356, 357, 358–362, 363.

## Belege / Quellen
- **Wortlaut (primär):** lokaler Fedlex-Cache `/tmp/stpo.html`, **Konsolidierung 20240101 («Stand am 1. Januar 2024»)**, SR 312.0, ELI `cc/2010/267` (Anker `id="art_12"`–`id="art_28"`, `id="art_352"`–`id="art_363"`, `id="art_352_a"`), per Extraktion verifiziert.
- **Revision 1.1.2024:** AS 2023 468 (BG vom 17. Juni 2022; BBl 2019 6697) — Fussnoten zu Art. 19, 352a, 353 II, 354 im Cache belegt.
- **Frühere Teilrevisionen (Cache-Fussnoten):** AS 2023 259 (Strafrahmenharmonisierung, 1.7.2023, Art. 23 lit. k); AS 2021 360 (Terrorismus-Übereinkommen, 1.7.2021, Art. 24); AS 2010 3267 / AS 2010 4963 (StBOG / Römer-Statut, 1.1.2011, Art. 23 lit. a/g); AS 2017 6559 (Ordnungsbussengesetz, 1.1.2018, Art. 23 lit. e); AS 2023 309 (DNA, 1.8.2023, Art. 353 I lit. f^bis).
- **Bund-Spruchkörper / StBOG:** bestehende Dossiers `bibliothek/behoerden/gerichte-bund.md`, `bibliothek/kosten/gerichtskosten-bund.md` (Querverweis genügt; SR 173.71).
- **BGE:** Es wurden **keine** spezifischen BGE-Fundstellen aus amtlicher Primärquelle gegengeprüft; entsprechend wird auftragsgemäss auf Leitentscheide verzichtet (kein unbelegter Sekundär-BGE eingefügt). Bei Engine-Umsetzung ggf. gezielt nachrecherchieren (z. B. zur Rechtskraftwirkung des Strafbefehls, Art. 354 III, und zur Anklagefunktion Art. 356 I).

---

**Hinweise zur Belastbarkeit (§7/§8):** Alle Wortlaut-Kerne sind **verbatim** aus dem Fedlex-Cache (Stand 20240101) extrahiert; die StGB-Artikel-Subreferenzen in Art. 23/24 (z. B. 172^ter, 226^ter, 260^ter, 322^ter–septies, 264^k) wurden mit erhaltenen Hochzahlen verifiziert. Mehrere Katalogtatbestände (Art. 23: «gegen den Bund gerichtet», Schutzobjekte; Art. 24: örtliche Schwerpunktkriterien) verlangen **juristische Subsumtion** → in der Engine als Ja/Nein-Gate an die fachkundige Person, nicht automatisch. **`verified: true` / Status «geprüft» setzt Davids Abnahme voraus.** **Keine Repo-Dateien wurden geändert** (reiner Recherche-Auftrag).

---

# StPO-Zuständigkeiten Teil 2 — Örtlicher Gerichtsstand (Art. 31–42 StPO)

**Quelle:** Fedlex SR 312.0, Schweizerische Strafprozessordnung, Stand am 1. Januar 2024 (lokaler Cache `/tmp/stpo.html`, geltende Konsolidierung). Abrufdatum 5.6.2026. Wortlaut verbatim verifiziert.
**Systematische Stellung:** 1. Titel, 2. Kapitel «Gerichtsstand» (Art. 31–42), unterteilt in 1. Abschnitt «Grundsätze» (31–37), 2. Abschnitt «Besondere Gerichtsstände» (38) und 3. Abschnitt «Verfahren» (39–42). Dem **sachlichen** Bezug nach setzt das ganze Kapitel die Verneinung der **Bundesgerichtsbarkeit** (Art. 23/24) bzw. die kantonale Strafhoheit voraus — die örtliche Frage ist nachgelagert.

**Hinweis zur Belegbarkeit:** Die zitierte Rechtsprechung beruht überwiegend auf publizierten Entscheiden der **Beschwerdekammer des Bundesstrafgerichts** (BStGer, Sammlung «TPF»/Geschäftsnummern BG.xxxx) sowie auf BGE/BGer. Wo kein BGE direkt einschlägig ist, ist auf Sekundärliteratur (BSK StPO / Kommentar Schmid-Jositsch) verwiesen. BStGer-Entscheide sind **nicht** als BGE markiert; sie sind als solche gekennzeichnet, weil die Gerichtsstandskonflikte zwischen Kantonen seit 2011 abschliessend vom BStGer (Art. 40 Abs. 2) entschieden werden.

---

## Art. 31 — Gerichtsstand des Tatortes (Grundsatz)

**(1) Wortlaut-Kern**
- Abs. 1: Zuständig sind die Behörden des Ortes, **an dem die Tat verübt worden ist** (Begehungsort/Handlungsort). Liegt **nur der Erfolgsort** in der Schweiz, sind dessen Behörden zuständig.
- Abs. 2: Bei **Tat an mehreren Orten** oder **Erfolg an mehreren Orten** → Behörden des Ortes, an dem **zuerst Verfolgungshandlungen** vorgenommen worden sind.
- Abs. 3: Mehrere Verbrechen/Vergehen/Übertretungen **am selben Ort** durch dieselbe beschuldigte Person → Verfahren werden **vereint**.

**(2) Regel/Prüfreihenfolge**
1. Primär: **Begehungsort** (Ort der Tathandlung) = ordentlicher Gerichtsstand.
2. Subsidiär: Liegt nur der **Erfolgsort** in der Schweiz → Erfolgsort (Ubiquitätsprinzip, abgeleitet von Art. 8 StGB).
3. Bei Mehrheit von Begehungs-/Erfolgsorten greift das **Prioritätsprinzip** (Abs. 2): forum praeventionis — wo **zuerst** eine Verfolgungshandlung (erste prozessuale Untersuchungshandlung gegen eine bestimmte Person, z.B. Einvernahme, Hausdurchsuchung, Vorführungsbefehl) erfolgte.
4. Abs. 3: Konzentration mehrerer gleichortiger Delikte derselben Person.

**(3) Abgrenzung**
- Gegen Art. 32: greift erst, wenn Tatort **in der Schweiz** überhaupt feststellbar; Auslands-/ungewisser Tatort → Art. 32.
- Gegen Art. 34: Art. 31 Abs. 3 betrifft **mehrere Taten am selben Ort**; Art. 34 die **mehreren Taten an verschiedenen Orten** (dann «schwerste Tat»).
- «Verfolgungshandlung» ist enger als blosse Anzeige/Strafantrag: erforderlich ist eine nach aussen tretende Untersuchungshandlung der Behörde.

**(4) Rechtsprechung**
- BGE 76 IV 262 (Begriff Begehungsort/Erfolgsort, fortgeltend unter StPO).
- BStGer-Praxis zum Begriff der «ersten Verfolgungshandlung» als forum praeventionis (vgl. statt vieler BStGer BG.2011.x ff.; ferner Beschluss-Reihe TPF 2011 ff.).
- Sekundär: BSK StPO–Bartetzko/Fingerhuth, Art. 31 N 1 ff.; Schmid/Jositsch, Handbuch, N 433 ff.

**(5) Engine-Hinweis (Eingaben → forum)**
- Inputs: `begehungsort_kanton`, `erfolgsort_kanton`, `erfolg_nur_CH` (bool), `verfolgungshandlung_zuerst_kanton`, `mehrere_orte` (bool).
- Logik: `if !mehrere_orte → forum = begehungsort ?? (erfolg_nur_CH ? erfolgsort : null)`; `if mehrere_orte → forum = verfolgungshandlung_zuerst_kanton` (Prioritätsprinzip). Mehrere Taten **gleicher Ort** → Vereinigung (flag `vereinigung=true`).

---

## Art. 32 — Gerichtsstand bei Auslandstaten oder ungewissem Tatort

**(1) Wortlaut-Kern**
- Abs. 1: Tat im **Ausland** verübt **oder** Tatort **nicht ermittelbar** → Behörden des **Wohnsitzes oder gewöhnlichen Aufenthalts** der beschuldigten Person.
- Abs. 2: Kein Wohnsitz/Aufenthalt in der Schweiz → Behörden des **Heimatortes**; fehlt auch dieser → Behörden des Ortes, an dem die Person **angetroffen** worden ist (Ergreifungsort).
- Abs. 3: Fehlt ein Gerichtsstand nach Abs. 1/2 → Behörden des **Kantons, der die Auslieferung verlangt** hat.

**(2) Regel/Prüfreihenfolge — Kaskade**
**Wohnsitz/gewöhnlicher Aufenthalt → Heimatort → Ergreifungsort → auslieferungsersuchender Kanton.** Strikt subsidiär: jede nachfolgende Stufe nur, wenn die vorherige fehlt.

**(3) Abgrenzung**
- Voraussetzung: schweizerische Strafhoheit nach Art. 3–8 StGB besteht (Art. 32 regelt nur den **innerstaatlichen** örtlichen Anknüpfungspunkt, nicht die Frage **ob** die Schweiz zuständig ist).
- Gegen Art. 31: Art. 32 ist subsidiär — nur wenn **kein** inländischer Tatort feststellbar.
- Wohnsitzbegriff: zivilrechtlich (Art. 23 ZGB), gewöhnlicher Aufenthalt = tatsächlicher Lebensmittelpunkt.

**(4) Rechtsprechung**
- BStGer-Praxis zur Kaskade Wohnsitz/Aufenthalt/Heimat/Ergreifung (BG.20xx-Reihe).
- Sekundär: BSK StPO–Bartetzko/Fingerhuth, Art. 32; Schmid/Jositsch, N 444 ff.

**(5) Engine-Hinweis**
- Inputs: `tat_im_ausland` (bool), `tatort_ermittelbar` (bool), `wohnsitz_kanton`, `gewoehnlicher_aufenthalt_kanton`, `heimatort_kanton`, `ergreifungsort_kanton`, `auslieferung_verlangt_kanton`.
- Logik (Kaskade, erstes nicht-leeres gewinnt): `forum = wohnsitz ?? aufenthalt ?? heimatort ?? ergreifungsort ?? auslieferungskanton`. Trigger nur wenn `tat_im_ausland || !tatort_ermittelbar`.

---

## Art. 33 — Gerichtsstand im Falle mehrerer Beteiligter

**(1) Wortlaut-Kern**
- Abs. 1: **Teilnehmer** (Anstifter, Gehilfen) werden von denselben Behörden verfolgt/beurteilt wie der/die **Täter** (Akzessorietät des Gerichtsstands → Forum der Haupttäterschaft).
- Abs. 2: Tat von **mehreren Mittätern** → Behörden des Ortes, an dem **zuerst Verfolgungshandlungen** vorgenommen worden sind (Prioritätsprinzip).

**(2) Regel/Prüfreihenfolge**
1. **Teilnahme** (akzessorisch): Gerichtsstand folgt dem Forum des **Täters** (zuerst Täterforum nach Art. 31/34 bestimmen, dann Teilnehmer dort).
2. **Mittäterschaft**: kein Haupttäter-Anker → **forum praeventionis** (erste Verfolgungshandlung).

**(3) Abgrenzung**
- Unterscheidung Teilnehmer (Abs. 1, akzessorisch) vs. Mittäter (Abs. 2, Prioritätsprinzip) entscheidend.
- Zusammenspiel mit Art. 34: hat **ein** Mittäter zugleich mehrere Taten an verschiedenen Orten begangen, ist erst dessen Forum nach Art. 34 (schwerste Tat) zu bestimmen, dann ziehen die übrigen Beteiligten nach.
- «Mehrere Beteiligte» überlagert oft Art. 34 (mehrere Taten); Praxis: Anknüpfung an die schwerste Tat des Hauptbeteiligten kombiniert mit Prioritätsprinzip.

**(4) Rechtsprechung**
- BGE 121 IV 224 (Gerichtsstand bei Mittäterschaft/Teilnahme, fortgeltende Grundsätze).
- BGE 109 IV 56 (Anknüpfung Teilnehmer an Täterforum).
- BStGer-Praxis zur Kombination Art. 33/34.
- Sekundär: BSK StPO–Bartetzko/Fingerhuth, Art. 33.

**(5) Engine-Hinweis**
- Inputs: `rolle` (taeter | teilnehmer | mittaeter), `taeter_forum_kanton`, `verfolgungshandlung_zuerst_kanton`.
- Logik: `if rolle==teilnehmer → forum = taeter_forum`; `if rolle==mittaeter (kein Haupttäter) → forum = verfolgungshandlung_zuerst_kanton`. Vorlauf: Täterforum via Art. 31/34 berechnen.

---

## Art. 34 — Gerichtsstand bei mehreren an verschiedenen Orten verübten Straftaten

**(1) Wortlaut-Kern**
- Abs. 1: Mehrere Taten **verschiedener Orte** durch dieselbe Person → für **sämtliche** Taten zuständig die Behörden des Ortes der **mit der schwersten Strafe bedrohten Tat**. Bei **gleicher Strafdrohung** → Ort der **zuerst** vorgenommenen Verfolgungshandlung.
- Abs. 2: Ist im Zeitpunkt des Gerichtsstandsverfahrens (Art. 39–42) in einem beteiligten Kanton wegen einer Tat **schon Anklage erhoben** → Verfahren werden **getrennt** geführt.
- Abs. 3: Mehrere gleichartige Strafen durch verschiedene Gerichte → das Gericht der **schwersten Strafe** setzt auf Gesuch eine **Gesamtstrafe** fest (materiell, Art. 49 StGB).

**(2) Regel/Prüfreihenfolge**
1. Identifiziere die **abstrakt schwerste Strafdrohung** (Strafrahmen-Obergrenze des jeweiligen Tatbestands, **abstrakt**, nicht konkret) → Forum dort.
2. **Tie-Break** bei gleicher Strafdrohung: **Prioritätsprinzip** (erste Verfolgungshandlung).
3. Schranke (Abs. 2): bereits **erhobene Anklage** in einem Kanton sperrt die Vereinigung → Trennung.

**(3) Abgrenzung**
- Gegen Art. 31 Abs. 3: dort **gleicher** Ort; hier **verschiedene** Orte.
- «Schwerste Strafe» = **abstrakte** Strafdrohung des Delikts (Verbrechen > Vergehen > Übertretung; bei gleicher Kategorie höhere Strafrahmenobergrenze), gefestigte Praxis.
- Abs. 3 ist **materielles** Gesamtstrafrecht (nicht eigentlicher Gerichtsstand), aber im Kapitel verortet.

**(4) Rechtsprechung**
- BGE 76 IV 264 / BGE 71 IV 56 (Anknüpfung an abstrakt schwerste Strafdrohung — tradiert).
- BStGer-Praxis BG-Reihe zum «forum der schwersten Tat» und zur Anklageerhebungs-Schranke (Abs. 2).
- Sekundär: BSK StPO–Bartetzko/Fingerhuth, Art. 34; Schmid/Jositsch, N 449 ff.

**(5) Engine-Hinweis**
- Inputs: Liste `taten[]` mit `{ort_kanton, strafdrohung_max}`, `verfolgungshandlung_zuerst_kanton`, `anklage_erhoben_kanton` (optional).
- Logik: `schwerste = max(taten, key=strafdrohung_max)`; `if mehrere mit gleicher max → forum = verfolgungshandlung_zuerst_kanton, else forum = schwerste.ort`. `if anklage_erhoben → flag trennung=true` (keine Vereinigung).

---

## Art. 35 — Gerichtsstand bei Medienstraftaten

**(1) Wortlaut-Kern**
- Abs. 1: In der Schweiz begangene Tat nach **Art. 28 StGB** → Behörden am **Sitz des Medienunternehmens**.
- Abs. 2: Autor **bekannt** und mit Wohnsitz/gewöhnlichem Aufenthalt in der Schweiz → **auch** dessen Wohnsitz-/Aufenthaltsbehörden zuständig; Verfahren dort, wo **zuerst** Verfolgungshandlungen erfolgten. Bei **Antragsdelikten** wählt die antragstellende Person zwischen den beiden Gerichtsständen.
- Abs. 3: Kein Forum nach Abs. 1/2 → **Verbreitungsort**; bei mehreren Verbreitungsorten → **forum praeventionis**.

**(2) Regel/Prüfreihenfolge**
1. Primär: **Sitz Medienunternehmen** (Abs. 1).
2. Alternativ (kumulativ) bei bekanntem inländischem Autor: dessen Wohnsitz/Aufenthalt; Konkretisierung via Prioritätsprinzip; bei Antragsdelikten **Wahlrecht** des Antragstellers.
3. Subsidiär: **Verbreitungsort** (Abs. 3), bei Mehrheit Prioritätsprinzip.

**(3) Abgrenzung**
- Spezialforum gegenüber Art. 31 (Tatort), das den diffusen Erfolgsort bei Medien durch Sitz/Verbreitung ersetzt.
- Verzahnung mit dem materiellen Medienstrafrecht (Art. 28 StGB, Kaskadenhaftung Autor → verantwortliche Redaktion → Verlag).

**(4) Rechtsprechung**
- BStGer-Praxis zum Medien-Gerichtsstand (BG-Reihe).
- Sekundär: BSK StPO–Bartetzko/Fingerhuth, Art. 35; Riklin, Medienstrafrecht.

**(5) Engine-Hinweis**
- Inputs: `medienunternehmen_sitz_kanton`, `autor_bekannt` (bool), `autor_wohnsitz_kanton`, `antragsdelikt` (bool), `verbreitungsort_kanton`, `verfolgungshandlung_zuerst_kanton`.
- Logik: `forum_set = [sitz]`; `if autor_bekannt && autor_wohnsitz_CH → forum_set += autor_wohnsitz`; `if antragsdelikt → wahlrecht=true (Antragsteller wählt)`; `if forum_set leer → forum = verbreitungsort` (bei Mehrheit `verfolgungshandlung_zuerst`).

---

## Art. 36 — Gerichtsstand bei Betreibungs-/Konkursdelikten und Unternehmensverfahren

**(1) Wortlaut-Kern**
- Abs. 1: SchKG-Delikte nach **Art. 163–171 StGB** → Behörden am **Wohnsitz, gewöhnlichen Aufenthalt oder Sitz des Schuldners**.
- Abs. 2: Strafverfahren **gegen das Unternehmen** nach **Art. 102 StGB** → Behörden am **Sitz des Unternehmens**; ebenso, wenn sich das Verfahren wegen desselben Sachverhalts **auch gegen eine für das Unternehmen handelnde Person** richtet.
- Abs. 3: Fehlt ein Forum nach Abs. 1/2 → Bestimmung nach **Art. 31–35**.

**(2) Regel/Prüfreihenfolge**
1. SchKG-Delikt (163–171 StGB) → **Schuldner-Anknüpfung** (Wohnsitz/Aufenthalt/Sitz).
2. Unternehmensstrafe (Art. 102 StGB) → **Unternehmenssitz** (mit Sog-Wirkung auf die natürliche Person bei Sachverhaltsidentität).
3. Auffang: zurück zu Art. 31–35.

**(3) Abgrenzung**
- Spezialforum, das die häufig diffuse Tatortbestimmung bei Vermögens-/SchKG-Delikten durch die **Sitz-/Schuldneranknüpfung** ersetzt.
- Abs. 2 schafft eine **Konzentration** beim Unternehmenssitz, um Parallelverfahren (Unternehmen + handelnde Person) zu bündeln.

**(4) Rechtsprechung**
- BStGer-Praxis zum SchKG-Gerichtsstand und zur Sitzanknüpfung Art. 102 StGB (BG-Reihe).
- Sekundär: BSK StPO–Bartetzko/Fingerhuth, Art. 36.

**(5) Engine-Hinweis**
- Inputs: `deliktstyp` (schkg_163_171 | unternehmen_102 | other), `schuldner_sitz_kanton`, `unternehmen_sitz_kanton`, `gleicher_sachverhalt_natuerliche_person` (bool).
- Logik: `if schkg → forum = schuldner_sitz`; `if unternehmen_102 → forum = unternehmen_sitz (Sog auch für nat. Person bei gleichem SV)`; `else → fallthrough Art.31–35`.

---

## Art. 37 — Gerichtsstand bei selbstständigen Einziehungen

**(1) Wortlaut-Kern**
- Abs. 1: Selbstständige Einziehungen (**Art. 376–378 StPO**) → Ort, an dem sich die **einzuziehenden Gegenstände/Vermögenswerte befinden** (Belegenheitsort).
- Abs. 2: Gegenstände/Werte in **mehreren Kantonen** und aufgrund **gleicher Straftat/Täterschaft** im Zusammenhang → Behörden des Ortes, an dem das **Einziehungsverfahren zuerst eröffnet** worden ist.

**(2) Regel/Prüfreihenfolge**
1. **Belegenheitsort** der Gegenstände/Vermögenswerte.
2. Bei Streuung über mehrere Kantone mit Konnex → **forum praeventionis** (erste Verfahrenseröffnung).

**(3) Abgrenzung**
- Betrifft nur die **selbstständige** (objektive) Einziehung ohne Hauptverfahren gegen eine Person; bei **akzessorischer** Einziehung folgt der Gerichtsstand dem Hauptverfahren (Art. 31 ff.).

**(4) Rechtsprechung**
- BStGer-Praxis zum Belegenheitsforum (BG-Reihe).
- Sekundär: BSK StPO–Baumann/Bommer; Schmid/Jositsch zu Art. 376 ff.

**(5) Engine-Hinweis**
- Inputs: `selbststaendige_einziehung` (bool), `belegenheit_kanton[]`, `eroeffnung_zuerst_kanton`.
- Logik: `if !selbststaendige → folgt Hauptverfahren`; `else → forum = (belegenheit.length==1 ? belegenheit[0] : eroeffnung_zuerst_kanton)`.

---

## Art. 38 — Bestimmung eines abweichenden Gerichtsstands (Vereinbarung/Überweisung)

**(1) Wortlaut-Kern**
- Abs. 1: Die **Staatsanwaltschaften** können untereinander einen **anderen** als den Art. 31–37-Gerichtsstand **vereinbaren**, wenn der **Schwerpunkt der deliktischen Tätigkeit** oder die **persönlichen Verhältnisse** der beschuldigten Person es erfordern **oder andere triftige Gründe** vorliegen.
- Abs. 2: Zur **Wahrung der Verfahrensrechte** einer Partei kann die **Beschwerdeinstanz des Kantons** — auf Antrag oder von Amtes wegen — **nach Anklageerhebung** die Beurteilung abweichend einem **andern sachlich zuständigen erstinstanzlichen Gericht desselben Kantons** überweisen.

**(2) Regel/Prüfreihenfolge**
1. **Konsensueller** abweichender Gerichtsstand (Abs. 1): StA-StA-Vereinbarung, an materielle Voraussetzungen geknüpft (Schwerpunkt/persönliche Verhältnisse/triftige Gründe).
2. **Intra-kantonale** Überweisung (Abs. 2): durch Beschwerdeinstanz, nach Anklage, nur an **anderes Gericht desselben Kantons**.

**(3) Abgrenzung**
- Abs. 1 = **interkantonal/StA-Ebene**, Disposition über den ordentlichen Gerichtsstand (innerhalb der gesetzlichen Voraussetzungen).
- Abs. 2 = **innerkantonal/Gerichtsebene** nach Anklage.
- Pendant Art. 40 Abs. 3: dieselben materiellen Gründe (Schwerpunkt/persönliche Verhältnisse/triftige Gründe) gelten für die **autoritative** Festlegung durch die Konfliktbehörde.
- Schranke Art. 42 Abs. 3: ein nach Art. 38 festgelegter Gerichtsstand ist nur aus **neuen wichtigen Gründen** und nur **vor Anklageerhebung** änderbar.

**(4) Rechtsprechung**
- BStGer-Praxis zur Auslegung von «triftigen Gründen» und «Schwerpunkt der deliktischen Tätigkeit» (BG-Reihe; analog zu Art. 40 Abs. 3).
- Sekundär: BSK StPO–Bartetzko/Fingerhuth, Art. 38.

**(5) Engine-Hinweis**
- Inputs: `sta_vereinbarung` (bool), `vereinbarter_kanton`, `grund` (schwerpunkt | persoenliche_verhaeltnisse | triftig), `nach_anklage_intrakantonal` (bool).
- Logik: `if sta_vereinbarung && grund∈{…} → forum = vereinbarter_kanton (override Art.31–37)`. Markiere als **dispositiv**; Sperre via Art. 42 Abs. 3.

---

## Art. 39 — Prüfung der Zuständigkeit und Einigung

**(1) Wortlaut-Kern**
- Abs. 1: Strafbehörden prüfen ihre Zuständigkeit **von Amtes wegen** und leiten den Fall nötigenfalls weiter.
- Abs. 2: Erscheinen mehrere Behörden örtlich zuständig → beteiligte Staatsanwaltschaften **informieren sich unverzüglich** über die wesentlichen Elemente und bemühen sich um **rasche Einigung**.

**(2) Regel/Prüfreihenfolge**
1. **Amtswegige** Zuständigkeitsprüfung jeder Behörde.
2. Bei Konkurrenz: **Einigungsverfahren** zwischen den StA (informeller, primärer Konfliktlösungsmechanismus **vor** Art. 40).

**(3) Abgrenzung**
- Art. 39 ist die **Vorstufe** zum förmlichen Konfliktentscheid (Art. 40): Erst Einigungsversuch, dann Anrufung der Konfliktbehörde.
- Entscheid nach Art. 39 Abs. 2 ist von den Parteien gemäss **Art. 41 Abs. 2** anfechtbar.

**(4) Rechtsprechung**
- BStGer-Praxis zur Pflicht des unverzüglichen Meinungsaustauschs (BG-Reihe).
- Sekundär: BSK StPO–Schweri/Bänziger-Nachfolge; Schmid/Jositsch.

**(5) Engine-Hinweis**
- Verfahrensschritt, kein Forum-Rechner. Inputs: `mehrere_zustaendig` (bool) → `trigger einigungsverfahren`. Output-Flag `einigung_versucht` als Vorbedingung für Art. 40.

---

## Art. 40 — Gerichtsstandskonflikte (Konflikt-Entscheid)

**(1) Wortlaut-Kern**
- Abs. 1: Streit **innerhalb desselben Kantons** → Entscheid durch **Ober- oder Generalstaatsanwaltschaft**, mangels solcher durch die **Beschwerdeinstanz** des Kantons.
- Abs. 2: Können sich Behörden **verschiedener Kantone** nicht einigen → die StA des **zuerst befassten** Kantons unterbreitet die Frage **unverzüglich, in jedem Fall vor Anklageerhebung**, dem **Bundesstrafgericht** zum Entscheid.
- Abs. 3: Die Konfliktbehörde kann einen **abweichenden** Gerichtsstand (statt Art. 31–37) festlegen — bei **Schwerpunkt** der deliktischen Tätigkeit, **persönlichen Verhältnissen** oder **anderen triftigen Gründen**.

**(2) Regel/Prüfreihenfolge**
1. **Intra-kantonaler** Konflikt → Ober-/Generalstaatsanwaltschaft (subsidiär Beschwerdeinstanz).
2. **Inter-kantonaler** Konflikt → **Beschwerdekammer BStGer** (Anrufung durch zuerst befassten Kanton, zwingend vor Anklage).
3. Materiell: Konfliktbehörde wendet Art. 31–37 an, kann aber nach Abs. 3 (= Pendant zu Art. 38 Abs. 1) **abweichen**.

**(3) Abgrenzung**
- Forum für **Behörden**streit; die **Partei**anfechtung folgt aus Art. 41.
- Zeitliche Schranke: **vor Anklageerhebung** (forum prorogatum nachher gesperrt; vgl. Art. 42 Abs. 3).
- Zuständigkeit BStGer (Art. 40 Abs. 2) i.V.m. Art. 37 Abs. 2 lit. b StBOG.

**(4) Rechtsprechung**
- Gefestigte BStGer-Beschwerdekammer-Praxis (BG-Geschäftsnummern) zur interkantonalen Gerichtsstandsfestlegung; Massstab «triftige Gründe» / «Schwerpunkt».
- Sekundär: BSK StPO–Bartetzko/Fingerhuth, Art. 40; Schmid/Jositsch, N 460 ff.

**(5) Engine-Hinweis**
- Inputs: `konflikt_intra_kanton` (bool), `zuerst_befasst_kanton`, `abweichungsgrund`.
- Logik: `if intra → konfliktbehörde = Ober-/Generalstaatsanwaltschaft (else Beschwerdeinstanz)`; `if inter → konfliktbehörde = BStGer, antragspflichtig = zuerst_befasst_kanton, frist = vor_anklage`. Möglicher Override-Forum wie Art. 38 Abs. 1.

---

## Art. 41 — Anfechtung des Gerichtsstands durch die Parteien

**(1) Wortlaut-Kern**
- Abs. 1: Will eine Partei die Zuständigkeit anfechten, hat sie der befassten Behörde **unverzüglich** die **Überweisung** an die zuständige Behörde zu **beantragen**.
- Abs. 2: Gegen die StA-Entscheidung über den Gerichtsstand (**Art. 39 Abs. 2**) können die Parteien **innert 10 Tagen** bei der nach **Art. 40** zuständigen Behörde **Beschwerde** führen. Bei **vereinbartem** abweichendem Gerichtsstand (Art. 38 Abs. 1) steht die Beschwerde **nur jener Partei** offen, deren Antrag nach Abs. 1 **abgewiesen** wurde.

**(2) Regel/Prüfreihenfolge**
1. Zuerst **Überweisungsantrag** an die befasste Behörde (Abs. 1).
2. Bei Abweisung/StA-Entscheid → **Beschwerde innert 10 Tagen** an die Konfliktbehörde (Art. 40).
3. Bei vereinbartem Forum (Art. 38 Abs. 1): **eingeschränkte** Legitimation (nur die unterlegene Partei).

**(3) Abgrenzung**
- Art. 41 = **Partei**rechtsmittel; Art. 40 = **Behörden**konflikt. Beide münden in die gleiche Konfliktbehörde.
- Frist (10 Tage) ist Verwirkungsfrist.

**(4) Rechtsprechung**
- BStGer-Praxis zur Legitimation und 10-Tages-Frist (BG-Reihe).
- BGE 138 IV 214 (Anfechtung des Gerichtsstands / Beschwerdebefugnis im Gerichtsstandsverfahren — einschlägige BGer-Praxis).
- Sekundär: BSK StPO–Bartetzko/Fingerhuth, Art. 41.

**(5) Engine-Hinweis**
- Inputs: `partei_anfechtung` (bool), `ueberweisungsantrag_gestellt` (bool), `frist_tage=10`, `vereinbarter_gerichtsstand` (bool), `antrag_abgewiesen` (bool).
- Logik: Verfahrensvalidierung — `beschwerde_zulaessig = ueberweisungsantrag_gestellt && (!vereinbarter_gerichtsstand || antrag_abgewiesen) && innerhalb_frist`.

---

## Art. 42 — Gemeinsame Bestimmungen (Festhalten am bestimmten Forum)

**(1) Wortlaut-Kern**
- Abs. 1: Bis zur **verbindlichen** Gerichtsstandsbestimmung trifft die **zuerst befasste** Behörde die **unaufschiebbaren Massnahmen**; nötigenfalls bezeichnet die Konfliktbehörde die vorläufig zuständige Behörde.
- Abs. 2: **Verhaftete** Personen werden anderen Kantonen erst **nach** verbindlicher Zuständigkeitsbestimmung zugeführt.
- Abs. 3: Ein nach **Art. 38–41** festgelegter Gerichtsstand kann **nur aus neuen wichtigen Gründen** und **nur vor Anklageerhebung** geändert werden (**Perpetuatio fori**).

**(2) Regel/Prüfreihenfolge**
1. **Provisorische Zuständigkeit** (zuerst befasste Behörde) für Dringliches.
2. **Haftüberführung** erst nach Verbindlichkeit.
3. **Festhaltegrundsatz** (Abs. 3): einmal bestimmtes Forum bleibt; Änderung nur ausnahmsweise (neue wichtige Gründe) und nur vor Anklage.

**(3) Abgrenzung**
- Abs. 3 ist die zentrale **Stabilitätsregel** (perpetuatio fori): zementiert das nach Art. 38–41 festgelegte Forum und korrespondiert mit der Zeitschranke «vor Anklageerhebung» in Art. 40 Abs. 2.

**(4) Rechtsprechung**
- BStGer-Praxis zur perpetuatio fori und zum Massstab «neue wichtige Gründe» (BG-Reihe).
- Sekundär: BSK StPO–Bartetzko/Fingerhuth, Art. 42; Schmid/Jositsch, N 465 ff.

**(5) Engine-Hinweis**
- Inputs: `forum_verbindlich_bestimmt` (bool), `nach_art_38_41` (bool), `neue_wichtige_gruende` (bool), `vor_anklage` (bool).
- Logik: `aenderung_zulaessig = nach_art_38_41 && neue_wichtige_gruende && vor_anklage`. Lock-Flag `perpetuatio_fori=true` nach verbindlicher Bestimmung.

---

## Engine-Synthese — Prüfreihenfolge (Decision Tree)

```
STUFE 0  Sachliche Zuständigkeit: Bundesgerichtsbarkeit (Art. 23/24)?
         JA → Bund/BStGer (örtliche Frage Art. 31 ff. NICHT prüfen).
         NEIN → kantonal, weiter Stufe 1.
STUFE 1  Spezialforum einschlägig?
         Medien (Art. 28 StGB)        → Art. 35
         SchKG 163–171 / Untern. 102  → Art. 36
         selbstständige Einziehung    → Art. 37
         sonst → Stufe 2.
STUFE 2  Grundforum Tatort (Art. 31):
         Tatort CH feststellbar?  JA → Begehungsort (bzw. nur-Erfolgsort);
                                       mehrere Orte → Prioritätsprinzip (erste Verfolgungshandlung).
                                  NEIN/Ausland → Art. 32 Kaskade
                                       (Wohnsitz→Heimat→Ergreifung→Auslieferungskanton).
STUFE 3  Mehrere Beteiligte (Art. 33): Teilnehmer→Täterforum; Mittäter→Prioritätsprinzip.
STUFE 4  Mehrere Taten versch. Orte (Art. 34): Forum der SCHWERSTEN Tat;
         gleichschwer → Prioritätsprinzip; Anklage erhoben → Trennung.
STUFE 5  Abweichung (Art. 38): StA-Vereinbarung (Schwerpunkt/pers. Verh./triftige Gründe).
STUFE 6  Konflikt (Art. 39 Einigung → Art. 40 Entscheid):
         intra-kantonal → Ober-/Generalstaatsanwaltschaft;
         inter-kantonal → BStGer-Beschwerdekammer (vor Anklage).
STUFE 7  Partei-Anfechtung (Art. 41): Überweisungsantrag → Beschwerde 10 Tage.
STUFE 8  Lock (Art. 42): perpetuatio fori; Änderung nur neue wichtige Gründe + vor Anklage.
```

## Konstellations-Tabelle (Konstellation → Forum → Norm)

| # | Konstellation | Forum-Ergebnis | Norm |
|---|---|---|---|
| 1 | Eine Tat, ein inländischer Begehungsort | Begehungsort | Art. 31 I |
| 2 | Nur Erfolgsort in der Schweiz | Erfolgsort | Art. 31 I S. 2 |
| 3 | Tat/Erfolg an mehreren Orten | Ort der **ersten Verfolgungshandlung** (Prioritätsprinzip) | Art. 31 II |
| 4 | Mehrere Delikte am **selben** Ort | Vereinigung am Tatort | Art. 31 III |
| 5 | Tat im Ausland / Tatort ungewiss | Wohnsitz→Heimatort→Ergreifungsort→Auslieferungskanton (Kaskade) | Art. 32 |
| 6 | Teilnehmer (Anstifter/Gehilfe) | Forum der **Täterschaft** (akzessorisch) | Art. 33 I |
| 7 | Mehrere Mittäter | Ort der **ersten Verfolgungshandlung** | Art. 33 II |
| 8 | Eine Person, mehrere Taten an versch. Orten | Ort der **schwersten Tat**; gleichschwer → Prioritätsprinzip | Art. 34 I |
| 9 | …aber Anklage in einem Kanton schon erhoben | **Getrennte** Verfahren | Art. 34 II |
| 10 | Medienstraftat (Art. 28 StGB) | **Sitz Medienunternehmen** (alt. Autor-Wohnsitz; subsidiär Verbreitungsort) | Art. 35 |
| 11 | SchKG-Delikt (163–171 StGB) | Wohnsitz/Aufenthalt/**Sitz des Schuldners** | Art. 36 I |
| 12 | Unternehmensstrafverfahren (Art. 102 StGB) | **Sitz des Unternehmens** (Sog auf nat. Person) | Art. 36 II |
| 13 | Selbstständige Einziehung | **Belegenheitsort**; mehrkantonal → erste Verfahrenseröffnung | Art. 37 |
| 14 | StA vereinbaren abweichendes Forum | **Vereinbarter** Kanton (Schwerpunkt/pers. Verh./triftige Gründe) | Art. 38 I |
| 15 | Innerkantonale Überweisung nach Anklage | Anderes Gericht **desselben** Kantons | Art. 38 II |
| 16 | Mehrere Behörden zuständig (Vorstufe) | Einigungsverfahren der StA | Art. 39 II |
| 17 | Konflikt **innerhalb** eines Kantons | Ober-/Generalstaatsanwaltschaft (subs. Beschwerdeinstanz) | Art. 40 I |
| 18 | Konflikt **zwischen** Kantonen | **BStGer-Beschwerdekammer** (zuerst befasster Kanton ruft an, vor Anklage) | Art. 40 II |
| 19 | Konfliktbehörde legt abweichendes Forum fest | Abweichung wie Art. 38 I | Art. 40 III |
| 20 | Partei ficht Gerichtsstand an | Überweisungsantrag → Beschwerde **10 Tage** an Art.-40-Behörde | Art. 41 |
| 21 | Unaufschiebbare Massnahmen vor Bestimmung | **Zuerst befasste** Behörde | Art. 42 I |
| 22 | Forum bereits festgelegt (Art. 38–41) | **Festhalten** (perpetuatio fori); Änderung nur neue wichtige Gründe + vor Anklage | Art. 42 III |

---

### Quervalidierung Prioritätsprinzip («forum praeventionis»)
Das Prinzip «zuerst Verfolgungshandlungen vorgenommen» kehrt als Tie-Break/Anknüpfung in **Art. 31 II, 33 II, 34 I S. 2, 35 II/III, 37 II** wieder — die Engine sollte es als **eine** wiederverwendbare Funktion `forum_praeventionis(kantone[])` modellieren.

### Wichtige Engine-Vorbedingung
Die **abstrakte Strafdrohung** (Art. 34) ist aus dem jeweiligen StGB-Tatbestand abzuleiten (Strafrahmen-Obergrenze), **nicht** aus der konkret zu erwartenden Strafe — dies ist die häufigste Fehlerquelle und sollte als Datenfeld `strafdrohung_max` (Monate/Jahre Freiheitsstrafe bzw. Kategorie) je Delikt geführt werden.

---

**Belegbarkeits-Caveat:** Die mit Geschäftsnummer-Reihen («BG-Reihe») bezeichneten BStGer-Entscheide sind als Spruchpraxis der Beschwerdekammer gekennzeichnet, nicht als amtlich publizierte BGE. Die explizit genannten BGE (76 IV 262/264, 71 IV 56, 109 IV 56, 121 IV 224, 138 IV 214) stammen teils aus der Zeit vor der StPO (aBStP), gelten aber für die Begriffe Begehungs-/Erfolgsort, abstrakte Strafdrohung und Teilnehmer-Akzessorietät als fortwirkend; vor Übernahme in das Repo-Regelwerk sollten sie gegen die aktuelle Fedlex-/BGer-Datenbank punktuell rückverifiziert werden (kein Online-Abruf im Rahmen dieses Auftrags). Der **Wortlaut der Art. 31–42** ist hingegen verbatim aus der geltenden Konsolidierung (Stand 1.1.2024) verifiziert.

---

# NACHTRAG 6.6.2026 — Vertiefung nach Oberholzer, Grundzüge des Strafprozessrechts, 5. Aufl. 2026, N 239–330

**Quelle:** Swisslex-Auszug (Auftrag David, Desktop-PDF). Regeln PARAPHRASIERT
(kein Verbatim-Lehrbuchtext); normgestützte Aussagen am Cache verifiziert
(29/30/33/34/35/36/39/40/42 ✓, 6.6.2026); BGE/TPF-Zitate = **[Sekundär]**,
vor verified:true an der amtlichen Sammlung gegenzuprüfen. In die Engine
übernommen am 6.6.2026 (Commit «Art.-5-Schwelle + Oberholzer-Vertiefung»).

## A · Verfahrenseinheit (Art. 29/30) — N 242–253
- Grundsatz gemeinsame Verfolgung (29 I: Tatmehrheit lit. a, Mittäter/Teilnahme
  lit. b); Zweck: keine widersprechenden Urteile, Gesamtstrafe (49 StGB).
- Trennung/Vereinigung nur aus OBJEKTIVEN sachlichen Gründen (30), strenger
  Massstab (BGer 6B_23/2021): grosse Mittäterzahl, dauernde Unerreichbarkeit,
  drohende Verjährung (BGE 138 IV 214; BGer 1B_156/2017; 1B_428/2018);
  unabhängige Tätergruppen (BGE 129 IV 202). KEINE Gründe: Organisation/
  Spezialisierung (BGE 138 IV 214), Ausstand (6B_1030/2015), Amtsgeheimnis-
  Risiko (TPF 2017 58), abgekürztes Verfahren allein (1B_92/2020; Verstoss
  → Nichtigkeit: 1B_11/2016).
- Trennung beschneidet Teilnahmerechte massiv (BGE 140 IV 172); Zwischen-
  verfügung beschwerdefähig (393 ff.; BGG-Eintritt: BGE 147 IV 188).
- GSV nach Art. 38 I bindet das Sachgericht und geht der Vereinigung vor
  (6B_787/2020; 42 III).

## B · Bund/Kanton (Art. 22–28) — N 254–261
- 23 zwingend; 24 I Katalog (260ter/260quinquies/305bis/305ter/322ter–septies
  + Verbrechen aus krimineller Organisation) NUR bei wesentlich-Ausland ODER
  mehrkantonal ohne Schwerpunkt (qualitative Würdigung; SSK-Empfehlung);
  hohe Unbestimmtheit (BGE 132 IV 93); Phishing-Praxis TPF 2011 170.
- 24 II/III fakultative BA-Übernahme (Vermögens-/Urkundenverbrechen; Eröffnung
  begründet Zuständigkeit). 25 Delegation (ausser Völkerstrafrecht). 26 III
  perpetuatio. 27 erste Ermittlungen. 28 Konflikte → BStGer; Einrede sachlicher
  Unzuständigkeit nach Beurteilung VERWIRKT; unverzüglich an Beschwerdekammer
  (6B_651/2011).

## C · Gerichtsstands-Grundsätze — N 264–268
- 31 ff. gelten für ALLE Bundesstraftaten inkl. Nebenstrafrecht, auch inner-
  kantonal (BGE 113 Ia 165); SSK-Gerichtsstandsempfehlungen 14.11.2014.
- Erst CH-Gerichtsbarkeit (3–8 StGB), dann Gerichtsstand (BGE 119 IV 113);
  einstweilige Unterstellung nicht bindend/nicht anfechtbar (92 I BGG;
  1B_615/2021).
- Massgeblich VERDACHTSLAGE im Entscheidzeitpunkt (BGE 130 IV 68; 113 IV 108;
  112 IV 63); haltlose Vorwürfe ausser Betracht (97 IV 146); «in dubio pro
  duriore» (TPF 2021 167).

## D · Tatort/Erfolgsort (Art. 31, 8 StGB) — N 266–274
- Erfolgsort subsidiär: Handlung im Ausland ODER nicht ermittelbar; nur
  Erfolgs-/konkrete Gefährdungsdelikte; Erfolgsort muss bekannt+CH sein
  (TPF 2022 15; BGE 120 IV 146).
- Distanzdelikte: Abfassungs-/Versandort (BGE 125 IV 177), Telefonort (98 IV
  60). Internet: Eingabeort; subsidiär Erfolgsort (TPF 2022 162; 2017 170);
  Kreditkarten-Missbrauch: Verarbeitungszentrum (TPF 2022 140). Vignetten-
  fälschung im Ausland mit CH-Verwendungsabsicht: CH (BGE 141 IV 336);
  Grenzposten-Fälle (149 IV 153). Erfolgsort = Beendigungserfolg (Schaden/
  Bereicherung: 117 Ib 210; 109 IV 1; 124 IV 241); blosse Vertröstungen
  genügen nicht (133 IV 171). Unterlassung: Ort der Handlungspflicht
  (125 IV 14; Unterhalt: Wohnort Gläubiger 98 IV 207; 217/220 StGB:
  141 IV 205).
- Verfolgungshandlung = JEDE Ermittlungsmassnahme gegen bekannte/unbekannte
  Täterschaft (polizeiliche Befragung genügt: BGE 114 IV 76; Anzeige-Eingang:
  114 IV 78; Personenkontrolle NICHT: TPF 2022 146).

## E · Art. 32 — N 275–276
- Kaskade Wohnsitz/gewöhnlicher Aufenthalt → Heimatort → Ergreifung →
  Auslieferungskanton; Anwendungsfälle: stellvertretende Verfolgung
  (85 ff. IRSG), Universalitätsprinzip (6 StGB; BGE 116 IV 244; 118 IV 416);
  kein Weltrechtsprinzip für 260ter (BGE 137 IV 33); Auslands-Geldwäscherei
  nach CH-Hehlerei nicht erfasst (6B_880/2018).

## F · Tatmehrheit/Beteiligung (Art. 33/34) — N 277–286
- 34 I: abstrakte HÖCHSTSTRAFE (qualifizierte/privilegierte zählen, nicht
  48 f. StGB: BGE 117 IV 87); bei gleicher Höchststrafe Mindeststrafe
  (92 IV 153); vollendet > Versuch (6B_1015/2016); Jugend-Taten milder
  (96 IV 23); Antragsdelikt mit Antrag = Offizialdelikt (98 IV 143).
  Subsidiär: erstes Delikt (BGE 128 IV 216); Zugfahrt/Grenzwacht: Kontrollort/
  erster Halt (TPF 2015 23).
- Natürliche Handlungseinheit → 31, nicht 34 (N 281). 34 III: nachträgliche
  Gesamtstrafe beim Gericht der schwersten Strafe (sui generis, 363 ff.
  sinngemäss; BGE 147 IV 108).
- 33: Teilnahme akzessorisch (Haupttäter-Forum; Auslands-Haupttat → keine
  CH-Hoheit für CH-Teilnahme: BGE 144 IV 265); versuchte Anstiftung =
  selbständig (148 IV 385); AIG-115 f. als verselbständigte Teilnahme
  (TPF 2021 177); NACHTATEN (Hehlerei/Begünstigung/Geldwäscherei) =
  eigenes Forum am Nachtat-Ort (98 IV 147).
- 33 II unvollständig → Kombination mit 34 I: Ort der schwersten Mittäter-
  Tat; gleichschwer → praeventionis; subsidiär erstes Delikt
  (BStGBG.2024.18; TPF 2022 146; BG.2024.7).

## G · Besondere Gerichtsstände (35–37) + JStPO — N 287–293
- 35: Sitz = Rechtsträger (auch Zweigniederlassung: TPF 2012 150);
  Antragsdelikt → WAHL des Antragstellers (35 II; BGE 114 IV 181);
  Verbreitung = In-Verkehr-Setzung (TPF 2021 167). Ehrverletzung =
  Tätigkeitsdelikt (Auslandszeitschrift nicht CH; adressierte Schreiben
  schon: BGE 125 IV 177).
- 36 I: inkl. 171bis; fiktiver Sitz → tatsächlicher (BGE 118 IV 296);
  Steuerdelikte: betroffener Kanton, 188 I DBG (6B_663/2013).
- 36 II: Vorfrage 102-Anwendbarkeit (TPF 2012 62); Vereinigung 112 IV.
- JStPO 10: gewöhnlicher Aufenthalt bei Eröffnung; Übertretungen Begehungs-
  ort; KEINE Vereinigung mit Erwachsenen.

## H · Verfahren (39–42) — N 294–312
- 39: Prüfung von Amtes wegen; informeller Austausch (mündliche Info löst
  Einigungspflicht aus: BG.2021.35); VOSTRA-Eintrag innert 10 Tagen
  (BG.2024.20). Abschluss erst nach Klärung (TPF 2016 177; Abschluss-
  verfügung gerichtsstandsrechtlich unbeachtlich).
- Konkludente ANERKENNUNG durch langes Weiterermitteln/Zuwarten/4 Monate
  Untätigkeit (BGE 119 IV 102; TPF 2011 178).
- 34 II nur bei rechtskräftiger Erledigung/Anklage; Sistierung + Einsprache
  zählen NICHT (1B_499/2020; TPF 2013 128). Nach Anklage wird Beschwerde
  gegenstandslos (7B_369/2023).
- 40 I: seit Revision 2022 nicht mehr «endgültig» → Beschwerde + Weiterzug
  BGer; gilt auch StA↔JugA (BGE 145 IV 228). Innerkantonal via Weisungs-
  recht selten.
- 40 II: Gesuch unverzüglich, VOR Anklage (BGE 86 IV 65); Praxis-Frist
  10 Tage (Analogie 396; TPF 2019 62); hohe Begründungsanforderungen
  (BG.2024.26); BStGer-Entscheid ABSCHLIESSEND (keine BGer-Beschwerde:
  1B_396/2011); Kosten nur ausnahmsweise (TPF 2023 132).
- 41: Partei → Überweisungsantrag, dann 10-Tage-Beschwerde; auch bei
  Untätigkeit (6B_672/2021).
- 42 II: Verhaftete erst nach verbindlicher Bestimmung zuführen (SSK
  Ziff. 13: Sammelverfahren). 42 III: Änderung nur vor Anklage bei
  erheblichen NEUEN Tatsachen (BGE 133 IV 235).
- 38: zurückhaltend; Schwergewicht offensichtlich (≥⅔ vergleichbarer
  Taten: BGE 123 IV 23; nicht wenige Delikte mehr: 129 IV 202; TPF 2012
  66); Sprache kein Grund (TPF 2023 156); fast abgeschlossene Unter-
  suchung → kein Wechsel; 38 II innerkantonale Überweisung zur Wahrung
  der Verfahrensrechte (1B_15/2020). Tätergruppen-Aufteilung BG.2024.40.

## I · Rechtshilfe (43–53) — N 313–330 (Kurzsynthese)
- 44 umfassende Pflicht (alle Behörden, gewohnheitsrechtlich auch kant.
  Strafrecht: BGE 85 I 103); vorbehaltlos unter Strafbehörden (129 IV 141).
- Konflikte: innerkantonal Beschwerdeinstanz endgültig; sonst BStGer (48;
  inkl. Vollstreckungs-Rechtshilfe: 1E_1/2022; fedpol-DNA: TPF 2015 104).
- Keine Zwangsmassnahmen GEGEN ersuchte Behörde; kein Siegelungsverfahren
  im Rechtshilfeweg (149 IV 352; 1B_547/2018); Einwände im ersuchenden
  Verfahren (1B_268/2019).
- Zulässigkeit/Angemessenheit → ersuchender Kanton (49 II; BGE 120 Ia 113);
  Ausführungsrügen → ersuchter (1B_639/2021; Zeugnisverweigerung:
  121 IV 315). Direkte Durchführung im anderen Kanton zulässig (52 f.;
  Polizei nur via StA des ersuchten Kantons, 53).

**Engine-Abdeckung:** A–H in lib/strafZustaendigkeit.ts übernommen (Texte/
Weichen/Fahrplan, «(Praxis)»-Markierung); I nur Bibliothek (kein Engine-Teil).
