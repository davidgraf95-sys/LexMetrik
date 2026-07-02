# QS-GP-Kampagne — Gegenprüfung Alt-Rechen-Engines (2026-07-02)

Adversariale Gegenprüfung sämtlicher Alt-Rechen-Engines gegen die amtliche Norm.
Runde 1/2 = Fable 5 (Session-Limit), Abschluss = Opus. Read-only erhoben; Fixes separat.

**127 Rohbefunde** über 38 Dateien.

## Übersicht (Schweregrad × Fix-Klasse)

| Schwere | wertfehler | norm-anker | hinweistext | abdeckungslücke |
|---|---|---|---|---|
| **hoch** | 5 | 1 | 1 | 0 |
| **mittel** | 15 | 9 | 11 | 7 |
| **niedrig** | 12 | 15 | 23 | 28 |

## Befunde nach Datei

### `src/lib/tarif/staffel.ts`  (14)

- **[HOCH · norm-anker]** SG Grundbuch- und Notariats-Staffel Kauf (GRUNDBUCH.SG notariat-grundbuch.ts:112, NOTARIAT.SG :63, re-exportiert in grundbuch.ts:16)
  - Norm: GB-GebV sGS 914.5, Art. 8 Nr. 20.01 (i.V.m. Art. 5 Abs. 1 Verdoppelung bei amtl. Beurkundung), aktuelle Fassung in Vollzug seit 1.6.2020 (nGS 2020-017) — https://www.gesetzessammlung.sg.ch/api/de/versions/2935/pdf_file
  - Erwartet: 2‰ des Erwerbspreises bis 2 Mio. + 0,5‰ darüber, Rahmen 200–10'000 je Eintragungs-Ansatz; Kauf 3 Mio → 4'500, 10 Mio → 8'000, Deckel 10'000, Minimum 200
  - Ist: 2‰ bis 3 Mio. + 0,5‰ darüber, min 100, max 12'500 (Anker «Nr. 10.01, Stand 3.2.1998» bzw. «Nr. 60.01.01 + Nr. 0.2» — beide Nummern existieren in der geltenden Fassung nicht); Kauf 3 Mio → 6'000, 10 Mio → 9'500
  - Notiz: Staffel stammt aus einer Vor-2020-Fassung: Knick 3 Mio statt 2 Mio, min/max 100/12'500 statt 200/10'000; betrifft Notariats- UND Grundbuch-Posten (beide identisch kodiert). Überzeichnung bis ~33% im Bereich 2–3 Mio.
- **[HOCH · hinweistext]** VS Grundbuchgebühr Eigentumsübertragung Kauf (GRUNDBUCH.VS notariat-grundbuch.ts:124)
  - Norm: OcRF VS RS 211.611, Art. 32 al. 2 let. a (état 1.10.2025) — https://lex.vs.ch/api/fr/versions/3515/pdf_file
  - Erwartet: 2‰, «au minimum 100 francs et au maximum 5'000 francs»; Kauf 5 Mio → 5'000, Kauf 2 Mio → 4'000; zudem al. 3: Bemessung auf nächsten Tausender aufgerundet
  - Ist: promille 2, minChf 50, maxChf 3000; Kauf 5 Mio → 3'000, Kauf 2 Mio → 3'000 (falscher Deckel greift ab 1,5 Mio)
  - Notiz: Repo-interner §5-Widerspruch: grundbuch.ts eigentum_erbgang.VS trägt dieselbe Norm bereits korrekt (min 100/max 5'000, Kommentar «KORREKTUR: min/max fehlten bisher») — die Basistabelle wurde nicht nachgezogen.
- **[MITTEL · wertfehler]** SG Kapitalerhöhung/Kapitalherabsetzung/Fusion Nr. 60.14 — lineare Promille statt «je weitere VOLLE 100'000» (beurkundung.ts:322, :343, :523)
  - Norm: GebT sGS 821.5 Nr. 60.14 i.V.m. Nr. 60.13 (Stand 1.1.2026, XXVI. Nachtrag) — https://www.gesetzessammlung.sg.ch/api/de/versions/3849/pdf_file: «für die ersten Fr. 100 000.– 385.—; für je weitere volle Fr. 100 000.– 80.—; höchstens 15 000.—»
  - Erwartet: Erhöhungs-/Herabsetzungsbetrag 250'000 → 385 + 1×80 = 465; 150'000 → 385; nur ganze 100k-Tranchen zählen (Wortlaut «volle» amtlich bestätigt)
  - Ist: staffel_sockel_prozent 0,08% linear auf Überschuss über 100'000 → 250'000 = 505; 150'000 = 425 (bis +80 je Geschäft zu viel)
  - Notiz: Die Gründungs-Einträge (Nr. 60.13, beurkundung.ts:266/294 als exklusive Bracket-Staffel) und notariatsgebuehrenGruendung.ts:125 floorn korrekt — der geflaggte offene Punkt «SG Kapitalerhöhung/-herabsetzung 60.13-floor» ist damit norm-seitig entschieden: Floor ist richtig, die 60.14-Einträge sind inkonsistent linear. Gleiches Muster im Stiftungs-Eintrag :367.
- **[MITTEL · wertfehler]** BS Kauf-Beurkundung: Degressionsbänder >5 Mio. und >10 Mio. fehlen (NOTARIAT.BS notariat-grundbuch.ts:55; analog eingebettet in GRUNDPFAND.BS :147)
  - Norm: Notariatstarif BS SG 292.400, § 11 Ziff. 17 (Stand 1.7.2016) — https://www.gesetzessammlung.bs.ch/api/de/versions/3875/pdf_file: 0,25% bis 2 Mio (min 500), +0,2% über 2 Mio, +0,1% über 5 Mio, +0,075% über 10 Mio, höchstens 50'000
  - Erwartet: Kauf 10 Mio → 5'000+6'000+5'000 = 16'000; Kauf 20 Mio → 23'500
  - Ist: nur 2 Bänder (0,25% bis 2 Mio; danach flach 0,2%): 10 Mio → 21'000; 20 Mio → 41'000
  - Notiz: Nur Kaufpreise über 5 Mio betroffen; Ziff.-33-Gründungsstaffel derselben Engine ist dagegen vollständig degressiv kodiert.
- **[MITTEL · hinweistext]** LU Grundpfand-Gesamtposten: Beurkundungsstaffel § 29 fehlt (GRUNDPFAND.LU notariat-grundbuch.ts:138)
  - Norm: BeurkGebV LU SRL 258 § 29 Abs. 1 (2‰ bis 500k, +1,25‰, +0,75‰, +0,5‰, >10 Mio frei; min 300, max 7'125) — https://srl.lu.ch/api/de/versions/3870/pdf_file; GBGT SRL 228 § 8 Abs. 1 Ziff. 1 (Eintrag 2‰, min 50, Stand 1.1.2026)
  - Erwartet: Pfandsumme 1 Mio: Beurkundung 1'625 + Eintrag 2'000 (+ Titel 40) ≈ 3'665; 500k ≈ 2'040
  - Ist: Gesamt-Regel promille 2, min 350 (entspricht nur dem Eintrag): 1 Mio → 2'000; 500k → 1'000
  - Notiz: Der eigene hinweis nennt «Beurkundung Staffel (max. 7'125) + Eintrag 2‰ + Titel 40», die regel kodiert aber nur 2‰ — Understatement ~45%.
- **[MITTEL · abdeckungsluecke]** SZ Wertgebühr «Fr. 45 je Fr. 50'000 bzw. Bruchteile» — Tranchenrundung und Halbierung über 10 Mio./8 Mio. fehlen (NOTARIAT.SZ notariat-grundbuch.ts:33, GRUNDPFAND.SZ :140, grundbuch.ts grundpfand.SZ:65)
  - Norm: Gebührentarif SRSZ 213.512 § 5 Abs. 1 Nr. 1 und Nr. 2 (SRSZ-PDF, Stand 1.2.2027-Druck) — https://www.sz.ch/public/upload/assets/7361/213_512.pdf: 45 je 50'000 bzw. Bruchteile davon; Nr. 1: über 10 Mio Mehrbetrag −50%, insgesamt max 13'500; Nr. 2: über 8 Mio −50%, max 10'350
  - Erwartet: Handänderung 60'000 → 2×45 = 90; 15 Mio → 9'000 + 100×22.50 = 11'250; Pfandsumme 10 Mio → 7'200 + 900 = 8'100
  - Ist: glattes promille 0.9 (max 13'500 bzw. 10'350): 60'000 → 54; 15 Mio → 13'500; Pfandsumme 10 Mio → 9'000
  - Notiz: Zwei Effekte: Untertreibung bis 44.99 bei nicht-glatten Kleinbeträgen (angefangene Tranche zählt voll), Übertreibung im Bereich über 10 Mio (Handänderung) bzw. 8 Mio (Pfand), weil die −50%-Regel fehlt.
- **[MITTEL · hinweistext]** TG Grundpfand-Gesamtposten ohne Höchstbetrag (GRUNDPFAND.TG notariat-grundbuch.ts:155)
  - Norm: GGG TG RB 632.1 § 14 Abs. 1 (Beurkundung 1‰, max 5'000) + § 14 Abs. 2 Ziff. 11 (Eintrag 1,5‰, max 10'000), Stand 1.1.2016 — https://www.rechtsbuch.tg.ch/api/de/versions/2182/pdf_file
  - Erwartet: kombiniert höchstens 15'000; Pfandsumme 10 Mio → 5'000 + 10'000 = 15'000
  - Ist: promille 2.5, minChf 200, KEIN maxChf: 10 Mio → 25'000
  - Notiz: Der eigene hinweis nennt beide Deckel (5'000/10'000), die regel trägt keinen; ab ~6 Mio Pfandsumme überzeichnet.
- **[MITTEL · hinweistext]** promille 1 ‰ von CHF 1'234'567; sockel_prozent 8.5 % von 12'355.29
  - Norm: Modul-Kontrakt Z.122-124 (round2 = 2 Nachkommastellen) vs. Kommentar Z.123 «Gebühren werden ganzzahlig dargestellt» + chf() Z.124 (Math.round auf ganze Franken); §2 Determinismus/Nachvollziehbarkeit
  - Erwartet: Rückgabewert (betragChf) und die zur Begründung ausgewiesenen schritte müssen denselben Betrag tragen (eine einzige Rundungskonvention)
  - Ist: betragChf = 1234.57 (Rappen, round2), während schritte «= CHF 1'235» (ganze Franken) narriert — Divergenz 0.43 CHF; ebenso betragChf 1050.20 vs. Schritt «CHF 1'050». Der maschinell konsumierte Wert lässt sich mit der angezeigten Herleitung nicht abstimmen.
  - Notiz: Betrifft JEDE promille-/prozent-Regel, die Rappen erzeugt, und damit ALLE Engines auf diesem Primitiv. Ob es beim Nutzer als falsche Zahl erscheint, hängt davon ab, wie der jeweilige Konsument betragChf formatiert (pro-Engine-Gegenprüfung nötig, hier nicht auditiert). Kein Norm-Anker möglich, da fachneutral — daher als Konventions-/Konsistenzdefekt gemeldet.
- **[NIEDRIG · wertfehler]** ZH Kapitalherabsetzung/übrige gesellschaftsrechtliche Urkunden: fixer Satz 0,5‰ statt Norm-Spanne 0,2–0,5‰ (beurkundung.ts kapitalherabsetzung.ZH)
  - Norm: NotGebV ZH LS 243, Anhang Ziff. 4.4.3.2 (Stand 1.1.2024, Nachtrag 123) — amtl. PDF via zhlex/notes.zh.ch (243_9.3.09_123.pdf): «vom Kapital 0,2–0,5‰ … für die übrigen Gesellschaften im Rahmen von 250–2000»
  - Erwartet: Spanne: Kapital 2 Mio → 400–1'000 (im Rahmen 250–2'000), kein deterministischer Punktwert
  - Ist: staffel_sockel_prozent prozent 0.05 (=0,5‰) min 250 max 2000 → deterministisch 1'000 bei 2 Mio (oberes Spannen-Ende als Punktwert)
  - Notiz: §8-Punkt: Wert liegt zwar im zulässigen Rahmen, wird aber als deterministisch ausgegeben, obwohl schon der Promillesatz eine Ermessens-Spanne ist.
- **[NIEDRIG · hinweistext]** VS Grundpfand-Gesamtposten: Eintrags-Deckel falsch beziffert, Kombisatz ungedeckelt (GRUNDPFAND.VS notariat-grundbuch.ts:158)
  - Norm: OcRF VS 211.611 Art. 32 al. 2 let. b (Papierschuldbrief 2,5‰, min 100, max 2'500 je Titel) / let. c (Register/Hypothek 1‰, 100–2'500), état 1.10.2025 — https://lex.vs.ch/api/fr/versions/3515/pdf_file
  - Erwartet: Eintrags-Komponente höchstens 2'500 je Titel; Pfandsumme 2 Mio gesamt ≈ Notariatsstaffel + 2'500 (gedeckelt) + 0,2% Pfandsteuer
  - Ist: hinweis behauptet «Eintrag 2,5‰ (max. 3'000)»; kombinierte regel 4,5‰ min 300 ohne Deckel → 2 Mio = 9'000
  - Notiz: grundbuch.ts grundpfand.VS (1‰, 100–2'500) ist dagegen normkonform; nur der vereinfachte Kombiposten weicht ab.
- **[NIEDRIG · wertfehler]** SG Stiftungserrichtung GebT Nr. 60.01 (beurkundung.ts:367)
  - Norm: GebT sGS 821.5 Nr. 60.01 (Stand 1.1.2026): «Ansätze je nach dem Stiftungskapital wie bei Nr. 60.13 … 330.— bis 3850.—» — https://www.gesetzessammlung.sg.ch/api/de/versions/3849/pdf_file
  - Erwartet: Rahmen 330–3'850 mit 60.13-Ansätzen (385/80 je volle 100k)
  - Ist: sockel 385 + 0,08% linear, min 330, max 3850 — die Norm-Untergrenze 330 ist mit Sockel 385 nie erreichbar; zudem linear statt volle Tranchen (wie Befund Nr. 60.14)
  - Notiz: Spannung steckt teils schon im Erlass (Rahmen 330 < Sockelansatz 385); kein grosser Frankeneffekt, aber gleiche Floor-Inkonsistenz.
- **[NIEDRIG · abdeckungsluecke]** staffel_sockel_prozent / staffel_voll_prozent / staffel_rahmen am exakten Bandgrenzwert (z. B. wert == 100'000)
  - Norm: Z.150 (Flach-Staffel bietet inklusiv UND exklusiv) vs. Z.213/253/262 (diese drei Typen nur `basisChf <= x.bisChf`); Design-Rationale Z.11-17 «lieber zwei klare Typen als ein Rappen-Shift»
  - Erwartet: Wie bei der Flach-Staffel sollte die Bandgrenzen-Semantik wählbar sein; bei exklusiver Tarifschreibweise («über 100'000: …») gehört wert==100'000 ins UNTERE Band
  - Ist: Diese drei Typen wählen fest inklusiv (`<=`); es gibt keine exklusiv-Variante. Bei einer DISKONTINUIERLichen Staffel liefert wert==100'000 den unteren Bandwert (2'000 statt 5'000 im Testfall). Für kontinuierliche Sockel-Staffeln harmlos (beide Bänder ergeben denselben Wert), aber für sprunghafte/exklusiv notierte Tarife am Grenz-Rappen falsch.
  - Notiz: Umgehbar durch bisChf-Verschiebung um 0.01 in der Datenschicht; sauberer wäre ein grenzeInklusiv-Flag. Real bissig nur bei sprunghaften Tarifen in exklusiver Schreibweise (selten).
- **[NIEDRIG · hinweistext]** skaliereErgebnis(det, 0.5, 0.5, hinweis) — symmetrischer (Punkt-)Faktor, z. B. fixe ½-Gebühr im summarischen Verfahren
  - Norm: Z.165-169; Kurzschluss nur für faktorMin==1 && faktorMax==1 (Z.166)
  - Erwartet: Ein deterministischer Betrag, der mit einem EXAKTEN Faktor (faktorMin==faktorMax) skaliert wird, bleibt ein deterministischer Punktwert (nur ein Zahlenwert, kein Ermessens-Rahmen)
  - Ist: Ergebnis wird deterministisch:false mit vonChf==bisChf (500==500 bzw. 2000==2000). Ein fix halbierter/verdoppelter Betrag wird als «Spanne» ohne betragChf ausgewiesen; Downstream, das deterministisch:false als «Ermessens-Rahmen/kein Punktwert» behandelt, labelt einen exakten Wert falsch als nicht-deterministisch.
  - Notiz: Ehrlicher Vorbehalt: Docstring Z.162-164 sagt «ein deterministischer Betrag wird zur Spanne» — Verhalten also teils gewollt. Konkretes Risiko nur beim degenerierten von==bis-Fall (fixer Bruchteil statt echter Bereich).
- **[NIEDRIG · hinweistext]** staffel_sockel_prozent mit unterAbRahmen:true, aber OHNE minChf, Wert unter abChf (z. B. @50'000, abChf 100'000)
  - Norm: Z.66-72 (§8 ehrliche Spanne unter der Schwelle) + Bedingung Z.219 (`b.unterAbRahmen && basisChf < b.abChf && b.minChf != null`)
  - Erwartet: Unter der Schwelle soll KEIN erfundener Punktwert erscheinen (der Sinn des Flags): entweder ehrliche Spanne oder ein Konfigurationsfehler wird erkannt
  - Ist: Fehlt minChf, greift der §8-Rahmen-Zweig nicht; es fällt auf die deterministische Berechnung durch und liefert betragChf = sockelChf (2'000) als Punktwert — genau den «erfundenen Punktwert», den das Flag unterdrücken soll.
  - Notiz: Konfigurationsabhängig; ein defensiver Guard (throw bei unterAbRahmen ohne minChf) würde die stille Aushebelung der Ehrlichkeits-Regel verhindern.

### `src/data/tarif/beurkundung.ts`  (12)

- **[HOCH · wertfehler]** SG Grundbuch eigentum_kauf + Notariat grundstueckkauf: Engine rechnet nach AUFGEHOBENEM Tarif (data: notariat-grundbuch.ts GRUNDBUCH.SG «Nr. 10.01», Stand 3.2.1998 / NOTARIAT.SG «Nr. 60.01.01 + Nr. 0.2», Stand 28.10.2014)
  - Norm: GB-GebV sGS 914.5 vom 10.11.2015 (Stand 1.6.2020, per SG-API als aktuelle Fassung bestätigt), Art. 8 Nr. 20.01: «2 Promille des Erwerbspreises bis Fr. 2 000 000, zuzüglich 0,5 Promille des darüber liegenden Erwerbspreises … im Rahmen von 200–10 000»; Art. 5 Abs. 1: bei Beurkundung durch Grundbuchverwalter/in werden die Eintragungs-Ansätze VERDOPPELT — https://www.gesetzessammlung.sg.ch/api/de/versions/2935/pdf_file_with_annexes
  - Erwartet: GB-Eintragung: 50'000 → 200 (Min.); 2 Mio → 4'000; 4 Mio → 5'000 (4'000 + 0,5‰×2 Mio); 20 Mio → 10'000 (Max.). Beurkundung Grundstückkauf (verdoppelt): 1 Mio → 4'000
  - Ist: GB-Eintragung: 50'000 → 100; 4 Mio → 6'500 (Knick fälschlich bei 3 Mio, Sockel 6'000 + 0,05 %); 20 Mio → 12'500 (falsches Max.). Beurkundung: 1 Mio → 2'000 (Verdoppelung nach Art. 5 Abs. 1 fehlt — halber Wert)
  - Notiz: Engine zitiert eine im geltenden Erlass inexistente «Nr. 10.01» und trägt Stand 3.2.1998; die zitierte Quelle-URL (texts_of_law/914.5) enthält den NEUEN Tarif. Werte stimmen zufällig nur im Band 100k–2 Mio überein.
- **[MITTEL · hinweistext]** Emissionsabgabe bei Geschäftsart kapitalerhoehung (beurkundungZusatzkosten.ts Z. 155–169): 1-Mio-Freibetrag wird je Vorgang auf den isolierten Erhöhungsbetrag gewährt
  - Norm: Art. 6 Abs. 1 lit. h StG (SR 641.10): befreit nur «soweit die Leistungen der Gesellschafter GESAMTHAFT eine Million Franken nicht übersteigen» — kumulativ über Gründung + alle früheren Erhöhungen (ESTV-Praxis, Abrechnungsformular kumulierte Leistungen); https://www.fedlex.admin.ch/eli/cc/1974/11_11_11/de, Stand 1.1.2024 (Wortlaut am Fedlex-AKN-XML verifiziert)
  - Erwartet: AG mit bereits geleisteten Einlagen ≥ 1 Mio (z. B. Gründung 1 Mio) erhöht um 500'000 → Freibetrag aufgebraucht → Abgabe 1 % × 500'000 = CHF 5'000; allgemein: steuerbar = Erhöhung − max(0, 1 Mio − frühere Leistungen)
  - Ist: Engine: emissionsabgabe(Erhöhungsbetrag) = max(0, 500'000 − 1'000'000) × 1 % = CHF 0, Hinweis «Kapital (inkl. Agio) bis CHF 1 Mio: abgabefrei» — systematische Unterdeckung bei jeder Kapitalerhöhung, sobald frühere Leistungen > 0; UI erfragt nur «Erhöhungsbetrag (CHF)» (beurkundung-typen.ts Z. 166), die Kumulation wird auch im Hinweistext nicht offengelegt
  - Notiz: Bei Gründung (gruendungsunterlagen, leistungenChf = Gesamtleistungen) ist die Rechnung korrekt; der Fehler betrifft nur den Kapitalerhöhungs-Posten der Zusatzkosten-Anzeige. Minimal-Fix ohne neue Eingabe: Hinweis auf Kumulation («Freibetrag nur, soweit nicht durch frühere Leistungen aufgebraucht») oder Zusatzfeld frühere Leistungen.
- **[MITTEL · wertfehler]** SG Kapitalerhöhung/-herabsetzung (src/data/tarif/beurkundung.ts, SG-Einträge kapitalerhoehung/kapitalherabsetzung/kapitalerhoehung-GmbH: staffel_sockel_prozent, prozent 0.08 linear ab 100'000)
  - Norm: GebT SG (sGS 821.5) Nr. 60.14 i.V.m. Nr. 60.13: «für die ersten Fr. 100 000.– 385.—, für je weitere VOLLE Fr. 100 000.– 80.—, höchstens 15 000.—», Bemessung nach Betrag der Erhöhung/Herabsetzung; https://www.gesetzessammlung.sg.ch/app/de/texts_of_law/821.5, aktuelle Fassung in Vollzug seit 1.1.2026 (amtliches PDF Version 3849)
  - Erwartet: Erhöhungsbetrag 150'000 → 385 (0 volle weitere Tranchen); 250'000 → 465 (1 Tranche); 1'050'000 → 1'105 (9 Tranchen)
  - Ist: berechneBeurkundung SG: 150'000 → 425; 250'000 → 505; 1'050'000 → 1'145 (linear 0,08 % statt nur volle 100k-Tranchen) — überzeichnet jede nicht-glatte Summe um bis zu CHF 80; die Gründungs-Einträge derselben Datei (staffel_exklusiv) rechnen korrekt floor (250'000 → 465)
  - Notiz: Bekannt-geflaggter offener Tarif-Punkt; NEU: der amtliche Wortlaut der seit 1.1.2026 geltenden Fassung enthält «volle» ausdrücklich — die floor-Lesart ist direkt belegt; die lineare Erhöhungs-/Herabsetzungs-Regel widerspricht dem Wortlaut.
- **[MITTEL · wertfehler]** SG kapitalerhoehung/kapitalherabsetzung/stiftung/fusion (data beurkundung.ts Z. 322/343/367/523): stetige 0,08 % statt Tranchen-Floor «je weitere VOLLE Fr. 100'000» — der geflaggte offene Punkt ‹SG 60.13-floor› ist real und unverändert
  - Norm: GebT sGS 821.5 (Stand 1.1.2026, XXVI. Nachtrag) Nr. 60.13: «für die ersten Fr. 100 000.– 385.—, für je weitere VOLLE Fr. 100 000.– 80.—, höchstens 15 000.—»; Nr. 60.14: mindestens 385, im Übrigen Gebühr gemäss Nr. 60.13 nach dem Erhöhungs-/Herabsetzungsbetrag; Nr. 60.01 Stiftung: Ansätze wie Nr. 60.13, Rahmen 330–3850 — https://www.gesetzessammlung.sg.ch/api/de/versions/3849/pdf_file
  - Erwartet: Erhöhung 150'000 → 385 (0 volle weitere Tranchen); 250'000 → 465 (1 volle Tranche); Stiftungskapital 550'000 → 705
  - Ist: 150'000 → 425; 250'000 → 505 (kapitalherabsetzung identisch 505); Stiftung 550'000 → 745 (0,08 % stetig auf den Überschuss)
  - Notiz: Inkonsistent im selben Datenfile: ag_gruendung/gmbh_gruendung SG (Z. 266/294) implementieren den Floor KORREKT als exklusive 100k-Bänder (an 199'999/200'000/1 Mio/18,4 Mio nachgerechnet). Überschätzung bis 79.99 CHF je angebrochene Tranche; exakt nur bei Vielfachen von 100k.
- **[MITTEL · hinweistext]** beurkundungZusatzkosten.ts / emissionsabgabe.ts: 1-Mio-Freibetrag wird bei kapitalerhoehung auf den ISOLIERTEN Erhöhungsbetrag angewendet — Art. 6 Abs. 1 lit. h StG befreit aber nur «soweit die Leistungen der Gesellschafter GESAMTHAFT eine Million Franken nicht übersteigen» (kumulativ über Gründung + alle Erhöhungen)
  - Norm: StG SR 641.10, Art. 6 Abs. 1 lit. h i.V.m. Art. 8 Abs. 1 (1 %), Konsolidierung 1.1.2024 — https://www.fedlex.admin.ch/eli/cc/1974/11_11_11/de (Filestore-HTML 20240101)
  - Erwartet: Kapitalerhöhung 500'000 bei bereits geleisteten Einlagen ≥ 1 Mio (Regelfall bei Erhöhungen): 1 % × 500'000 = 5'000; generell: 1 % × max(0, bisherige Leistungen + Erhöhung − 1 Mio, begrenzt auf Erhöhung)
  - Ist: 0, mit Hinweis «Kapital (inkl. Agio) bis CHF 1 Mio: abgabefrei (Freibetrag)» — Engine kennt die Vorleistungen nicht und behandelt jeden Vorgang mit frischem 1-Mio-Freibetrag
  - Notiz: Für ag_/gmbh_gruendung (Erstvorgang) ist die Rechnung korrekt. Fix bräuchte ein Eingabefeld «bisherige Leistungen» oder einen ehrlichen §8-Hinweis, dass der Freibetrag gesamthaft gilt und bei Erhöhungen meist verbraucht ist. Nebenbefund (niedrig): Genossenschafts-Anteilscheine sind abgabepflichtig mit gleicher 1-Mio-Grenze (Art. 6 Abs. 1 lit. b StG); genossenschaft_gruendung zeigt gar keinen Emissionsabgabe-Posten.
- **[NIEDRIG · hinweistext]** Kopf-Kommentar beurkundungZusatzkosten.ts Z. 10: «1 % bei AG/GmbH-Kapital über der Freigrenze 1 Mio.»
  - Norm: Art. 6 Abs. 1 lit. h StG normiert nach gefestigter Praxis einen FREIBETRAG (nur der übersteigende Teil steuerbar), keine Freigrenze; https://www.fedlex.admin.ch/eli/cc/1974/11_11_11/de, Stand 1.1.2024
  - Erwartet: Terminologie «Freibetrag» (wie im Fix A4-3a derselben Datei Z. 63–66 und im UI-Hinweis korrekt)
  - Ist: Nur der Datei-Kopf verwendet noch «Freigrenze»; Rechnung und UI-Texte sind korrekt
  - Notiz: rein kosmetische Kommentar-Drift, kein Rechenfehler
- **[NIEDRIG · wertfehler]** PFANDSTEUER.VD (beurkundungZusatzkosten.ts Z. 87): Bemessungsgrundlage wird nicht auf volle tausend Franken ABGERUNDET
  - Norm: LTim BLV 652.11, Art. 3 al. 2: «Son taux est de 2‰ de la valeur constatée dans l'acte, ARRONDIE AUX MILLE FRANCS INFÉRIEURS» (in Kraft 1.1.2014, statut EN_VIGUEUR) — https://prestations.vd.ch/pub/blv-publication/actes/consolide/652.11
  - Erwartet: Pfandsumme 512'345 → 2‰ × 512'000 = 1'024
  - Ist: Math.round(512'345 × 0,2 %) = 1'025
  - Notiz: Max. Abweichung ~2 CHF; Satz 2‰ und Freigrenze ≤ 5'000 (Art. 3 al. 3: Engine-Ausgabe 0 bei 5'000) sind korrekt.
- **[NIEDRIG · norm-anker]** BE kapitalerhoehung/kapitalherabsetzung (data beurkundung.ts): pauschaler Umschlag-Rahmen 750–20'512.50 statt bandgenauem ¾-Anhang-4-Rahmen
  - Norm: GebVN BSG 169.81, Art. 21 Abs. 2/4 i.V.m. Anhang 4 (Stand 1.7.2006; Erlass-Fassung 1.3.2022): ¾ des Anhang-4-Tarifs, bemessen nach Erhöhungs-/Herabsetzungsbetrag inkl. Agio — https://www.belex.sites.be.ch/api/de/versions/2543/pdf_file_with_annexes
  - Erwartet: Erhöhung 500'000 → Rahmen 1'087.50–1'762.50 (¾ × 1'450–2'350)
  - Ist: Für jeden Betrag dieselbe Spanne 750–20'512.50 (= ¾ der untersten Min-/obersten Max-Stufe)
  - Notiz: Kein falscher Wert (Umschlag deckt jede Norm-Spanne ab), aber massiv entpräzisiert, obwohl Anhang 4 als staffel_rahmen bereits im ag_gruendung-Eintrag korrekt bandgenau kodiert ist; die zusätzliche VR-Feststellungsurkunde (min. 400, Zeitaufwand) ist nur im Anker-Text erwähnt.
- **[NIEDRIG · abdeckungsluecke]** FR/VD/VS/JU/NE Grundstückkauf ist formel_extern (nicht gerechnet); Sondertarif-Staffelwerte der französisch-/italienischsprachigen Kantone (FR, VD, VS, JU) und der weiteren Geschäftsarten (dienstbarkeit, kapitalerhöhung, testament u.a.) wurden in diesem Durchgang NICHT einzeln gegen die amtliche Quelle nachgerechnet
  - Norm: RSF 261.16 / BLV 178.11.2 / RS 178.104 / RSJU 189.61 / RSN 166.31 u.a. (je Kanton)
  - Erwartet: jeder Promillesatz/jede Bandgrenze/jedes Min/Max Band-für-Band amtlich belegt
  - Ist: nur interne Akkumulations-Konsistenz geprüft (bestanden), Norm-Werte dieser Bänder offen
  - Notiz: Ehrliche Umfangsgrenze dieses Passes, kein festgestellter Fehler. Für vollständige Freigabe: FR Art.4/GE Art.10 Vorkaufsrecht, VD Art.14/18/22, VS Art.13, JU Art.9 sowie die Nicht-Grundstück-Geschäftsarten separat amtlich nachrechnen. Die stichprobenweise amtlich geprüften Staffeln (ZH/LU/AG/GE) waren alle exakt korrekt, was die generierte Datenschicht insgesamt stützt.
- **[NIEDRIG · hinweistext]** LU Grundstückkauf > 10 Mio: Engine liefert flach CHF 15'750 (Cap), amtlicher Wortlaut §21 «über 10 Mio. keine Gebühr»
  - Norm: BeurkGebV SRL Nr. 258 §21 Abs. 1 (Stand 1.1.2022), srl.lu.ch/api/de/texts_of_law/258
  - Erwartet: Deckelung des Gesamtbetrags bei 15'750 (kein Zuwachs über 10 Mio) — Standardlesart «gebührenfrei für den Mehrbetrag»
  - Ist: Engine: 15'750 (sockel 15'750, prozent 0, maxChf 15'750) — korrekt gedeckelt
  - Notiz: Verifiziert KORREKT: Cap 15'750 deckt sich mit dem amtlichen Höchstbetrag; die Datei-Formulierung «>10 Mio gebührenfrei» meint den Mehrbetrag, nicht Betrag 0. Nur als Transparenz-Hinweis gemeldet (Wortlaut könnte als «0» missverstanden werden); kein Fix nötig.
- **[NIEDRIG · norm-anker]** ZH-Einträge tragen stand '1.1.2024'; amtlich gegengeprüft wurde die Konsolidierung 1.1.2017 (LS 243)
  - Norm: NotGebV LS 243 Anhang Ziff. 1.1.1 / 1.4.1.1
  - Erwartet: Prüfung gegen die zitierte Fassung 1.1.2024
  - Ist: Werte in Fassung 1.1.2017 identisch (1‰/100 bzw. 1‰/150) → kein Wertdrift; Stand-Datum plausibel unverändert, aber nicht an der 2024-Fassung selbst belegt
  - Notiz: Kein Wertfehler; die Sätze sind in beiden Fassungen gleich. Für lückenlosen §7-Beleg die 2024-Konsolidierung direkt bestätigen.
- **[NIEDRIG · wertfehler]** GE kapitalherabsetzung Band-Sockel = CHF 88 statt exakt 87.50 (0.175% × 50'000)
  - Norm: REmNot RSG E 6 05.03 (Sockel-Akkumulation)
  - Erwartet: 87.50
  - Ist: 88 (auf ganze Franken gerundeter kumulierter Sockel)
  - Notiz: Immateriell: Gebühren werden ohnehin ganzzahlig in CHF dargestellt (staffel.ts chf() rundet). Rundungsdifferenz von 0.50 im kumulierten Sockel, keine sichtbare Wirkung. Einziger Treffer im 133-Staffel-Sweep.

### `src/lib/verjaehrung.ts`  (6)

- **[HOCH · wertfehler]** Unterbrechung durch Urkunde/Urteil bei Zwei-Fristen-Regimes (delikt/delikt_person/vertrag_person/bereicherung): Engine kappt die neue 10-Jahres-Frist an der alten absoluten Frist
  - Norm: Art. 137 Abs. 2 OR: «Wird die Forderung durch Ausstellung einer Urkunde anerkannt oder durch Urteil des Richters festgestellt, so ist die neue Verjährungsfrist stets die zehnjährige.» — https://www.fedlex.admin.ch/eli/cc/27/317_321_377/de (Filestore-Konsolidierung 20260101, gültig ab 1.1.2026)
  - Erwartet: Delikt, Verhalten 1.6.2016, Kenntnis 10.5.2023, Urteil 1.5.2026: neue Frist stets 10 Jahre ab Urteil → Ende 1.5.2036 (ZH-Feiertag → 2.5.2036); am Stichtag 2.7.2026 NICHT verjährt
  - Ist: «Verjährt: … mit Ablauf des 01.06.2026 eingetreten», massgeblich=absolut (relativEnde 2036-05-02 wird zwar berechnet, aber vom Verdikt überstimmt); nur als Annahme-Text relativiert, der selbst einräumt, die selbständige 10-Jahres-Frist sei h.M.
  - Notiz: Falsches «Verjährt»-Verdikt für eine gerichtlich festgestellte/urkundlich anerkannte Forderung — gegen den «stets»-Wortlaut; gefährliche Richtung (Gläubiger schreibt titulierten Anspruch ab). Offenlegung als Annahme mildert, heilt das Verdikt aber nicht.
- **[HOCH · wertfehler]** Klage-Unterbrechung: absolute Frist läuft während des hängigen Verfahrens ab und die Engine meldet «Verjährt»
  - Norm: Art. 135 Ziff. 2 i.V.m. Art. 138 Abs. 1 OR: Unterbrechung durch Klage; Neubeginn erst «wenn der Rechtsstreit vor der befassten Instanz abgeschlossen ist» — https://www.fedlex.admin.ch/eli/cc/27/317_321_377/de (Stand 20260101); vgl. BGE 147 III 419 (von der Engine selbst referenziert)
  - Erwartet: Delikt, Verhalten 1.6.2016, Klage 1.4.2026 (vor Ablauf absolut 1.6.2026), Prozessende 20.6.2026: Verjährung ist ab Klage unterbrochen, während des Verfahrens kein Eintritt; Neubeginn 20.6.2026 → am 2.7.2026 NICHT verjährt
  - Ist: «Verjährt: … mit Ablauf des 01.06.2026 eingetreten» (mitten im hängigen Verfahren), massgeblich=absolut — inkonsistent zur eigenen Ein-Frist-Logik, die bei laufender Klage korrekt «steht prozessbedingt still … nicht verjährt» ausgibt
  - Notiz: Innerer Widerspruch der Engine: dieselbe Klage schützt bei Art. 127/128-Forderungen, bei Zwei-Fristen-Regimes nicht.
- **[MITTEL · norm-anker]** «Konservative Regel»: auch Anerkennung/Betreibungsakt werden an der absoluten Frist gekappt; Annahme-Text behauptet, das sei «für Art. 67 OR gesichert»
  - Norm: Art. 135 i.V.m. Art. 137 Abs. 1 OR («Mit der Unterbrechung beginnt die Verjährung von neuem») — https://www.fedlex.admin.ch/eli/cc/27/317_321_377/de (Stand 20260101). Wohl h.L.: absolute OR-Fristen sind echte, unterbrechbare Verjährungsfristen (kein Verwirkungscharakter wie Art. 10 PrHG); so implizit auch die Regress-Praxis (AHV/IV-Verjährungsabkommen mit 15-Jahres-Regel ab Ereignis, regress.admin.ch, Stand 26.5.2023) und HGer ZH HG150169 («Auch allfällige zivilrechtliche Unterbrechungshandlungen würden sich … direkt auf die … zehnjährige Frist auswirken»)
  - Erwartet: Nach Anerkennung (1.5.2026) vor Ablauf der absoluten Frist (1.6.2026) läuft nach wohl h.L. eine neue Frist; jedenfalls ist die Kappung eine strengste Mindermeinungs-Lesart. Die Behauptung «für Art. 67 OR gesichert» ist unbelegt — ich konnte keinen BGE finden, der die absolute Bereicherungsfrist für unterbrechungsfest erklärt
  - Ist: «Verjährt … 01.06.2026», Kappung für ALLE Unterbrechungstypen; Annahme-Text deklariert die Regel, zitiert aber keine Quelle und behauptet Gesichertheit für Art. 67
  - Notiz: Als Annahme offengelegt und in der vorsichtigen Richtung vertretbar konservativ — aber die «gesichert»-Behauptung verletzt die Belegpflicht (Norm/BGE-Anker fehlt) und die Kappung produziert potenziell falsche «Verjährt»-Verdikte.
- **[MITTEL · norm-anker]** Einredeverzicht (Art. 141): verzichtBis = unmodifiziertes Verjährungsende + N Jahre (Anker «ab Verjährungseintritt», so auch UI-Label)
  - Norm: Art. 141 Abs. 1 OR: «Der Schuldner kann ab Beginn der Verjährung jeweils für höchstens zehn Jahre auf die Erhebung der Verjährungseinrede verzichten.» — https://www.fedlex.admin.ch/eli/cc/27/317_321_377/de (Stand 20260101); kodifiziert BGE 132 III 226 (Verzicht «ne saurait être émise pour une durée dépassant le délai ordinaire de l'art. 127 CO» = Höchst-DAUER 10 Jahre); BJ/EJPD-Bericht VE-OR
  - Erwartet: Ordentliche Frist ab 3.6.2020 (Ende 3.6.2030), Verzicht erklärt 1.1.2029 «für 15 Jahre»: Clamp auf 10 Jahre korrekt, aber Höchstwirkung nach der BGE-132-III-226-Linie längstens 10 Jahre ab der Erklärung → spätestens 1.1.2039
  - Ist: verzichtBis = 2040-06-03 (= Fristende 3.6.2030 + 10 J) — Wirkungsdauer ab Erklärung 11 J 5 M, überschreitet die Höchstdauer; UI behauptet den Anker «ab Verjährungseintritt» als gesetzt, ohne den Streitstand (Erklärung vs. Fristbeginn; ein Anker «Verjährungseintritt» findet sich weder im Wortlaut noch in Botschaft/BGE) offenzulegen
  - Notiz: Richtung anti-konservativ: Gläubiger könnte auf Verzichtsschutz bis 2040 vertrauen, der nach strengster Lesart 2039 endet. Umgekehrt (Verzicht nach Eintritt, O2) kappt derselbe Anker die Wirkung zu früh (3.6.2035 statt 1.8.2035) — der Anker ist in beiden Richtungen unbelegt.
- **[NIEDRIG · abdeckungsluecke]** Art. 128 'kurz' (5 Jahre) — Katalog nicht abgebildet
  - Norm: Art. 128 Ziff. 1–3 OR (Miet-/Pacht-/Kapitalzinse u. periodische Leistungen; Lebensmittel/Beköstigung/Wirtsschulden; Handwerk/Kleinverkauf/ärztl. Besorgung/Anwälte/Notare/Arbeitsverhältnis) vs. Auffangnorm Art. 127 OR — Fedlex OR.json Stand 2026-01-01
  - Erwartet: Entscheidungshilfe/Zuordnung, welche Forderung unter den 5-Jahres-Katalog (Art. 128) fällt und welche unter die 10-Jahres-Auffangnorm (Art. 127); der Katalog ist abschliessend und die Abgrenzung ist der eigentliche Fehlerhebel.
  - Ist: Die Engine bietet nur ein generisches Regime 'kurz' mit Label 'Katalogforderungen: 5 Jahre'; die Ziff. 1–3 sind nicht enumeriert. Der Nutzer muss selbst korrekt klassifizieren. Kein Rechenfehler, aber keine Regime-Zuordnungshilfe.
  - Notiz: Die Regime-Trennung selbst ist regime-treu und korrekt (kurz=5, ordentlich=10, kein Kollaps). Reiner Umfang-/Guidance-Punkt.
- **[NIEDRIG · hinweistext]** Einredeverzicht Art. 141 — verzichtBis = Verjährungseintritt + max. 10 Jahre
  - Norm: Art. 141 Abs. 1 OR ('ab Beginn der Verjährung jeweils für höchstens zehn Jahre') — Fedlex OR.json Stand 2026-01-01
  - Erwartet: Offenlegung, dass der Bezugspunkt der 10-Jahres-Höchstdauer (Erklärungsdatum vs. Verjährungseintritt vs. Beginn der Verjährung) doktrinell umstritten ist; das Ergebnis hängt bei früh erklärtem Verzicht vom Bezugspunkt ab.
  - Ist: Engine rechnet verzichtBis = werktagsverschobener Verjährungseintritt + min(jahre,10) und deklariert im Rechenweg 'höchstens 10 Jahre ab Verjährungseintritt' als einzige Lesart, ohne den Streit offenzulegen (getestet: Verzicht 2024, jahre=10 → 2035-01-03; jahre=15 → gekürzt + Warnung; Vorausverzicht vor Beginn → unwirksam + Warnung).
  - Notiz: Gewählte Lesart ist die praktikergängige Mehrheitsauffassung und mit Norm-Anker im Rechenweg belegt; Kappung >10 J und Vorausverzicht-Sperre korrekt. Nur ein Offenlegungs-/Hinweis-Punkt, kein Wertfehler.

### `src/data/tarif/grundbuch.ts`  (6)

- **[HOCH · wertfehler]** VS Eigentumsuebertragung Kauf (GRUNDBUCH_EIGENTUM_KAUF.VS, src/data/tarif/notariat-grundbuch.ts ~Z.124): regel promille 2, minChf 50, maxChf 3000
  - Norm: OcRF/kGBV VS RS 211.611 Art. 32 al. 2 let. a (etat 01.10.2025): inscription des droits de propriete = 2 pour-mille, au minimum 100 francs et au maximum 5'000 francs
  - Erwartet: minChf 100, maxChf 5000. Bei Wert 2'000'000 = 4'000; bei 2'500'000 = 5'000 (Deckel); Kleinwert 20'000 -> 100 (Sockel)
  - Ist: minChf 50, maxChf 3000. Engine liefert bei 2'000'000 -> 3'000 (falsch gedeckelt), bei 2'500'000 -> 3'000, bei 20'000 -> 50. Deckel schon ab 1'500'000 statt 2'500'000 wirksam
  - Notiz: Selbst-widerlegend: die Schwester-Zeile GRUNDBUCH_EINTRAG.eigentum_erbgang.VS (grundbuch.ts ~Z.42) zitiert DENSELBEN Art. 32 al. 2 let. a und kodiert korrekt min 100 / max 5000. Der Haupt-Kauf-Fall (haeufigste Abfrage) ist der fehlerhafte.
- **[MITTEL · wertfehler]** grundpfand SZ, Pfandsumme > CHF 8 Mio (z.B. 10 Mio → Engine 9000; 12 Mio → 10350)
  - Norm: Gebührentarif SRSZ 213.512 § 5 Abs. 1 Nr. 2 (Errichtung/Erhöhung Grundpfand: 0,9‰, über 8 Mio -50% auf den Mehrbetrag, Höchstgebühr insgesamt Fr. 10'350) — so im hinweis des Datensatzes selbst transkribiert
  - Erwartet: 0,9‰ bis 8 Mio (=7200), darüber nur 0,45‰: 10 Mio → 7200+900=8100; 12 Mio → 7200+1800=9000; Deckel 10'350 greift erst bei 15 Mio
  - Ist: regel ist flach promille 0.9 mit maxChf 10350; die degressive -50%-Stufe über 8 Mio fehlt. Engine 10 Mio=9000 (statt 8100), 12 Mio=10350 (statt 9000) — Überhöhung bis ~1350 CHF / ~15%
  - Notiz: Selbst-Widerspruch regel vs. eigener hinweis; via realem vite-node-Lauf bestätigt. Zusätzlich unklar: «Fr. 45 je Fr. 50'000» impliziert Tranchen-Aufrundung auf nächste 50'000 und es ist kein minChf kodiert → für Nicht-Vielfache von 50k unterschätzt die flache Promille (70k → Engine 63 statt evtl. 90). PLAUSIBEL, PDF-Beleg nötig.
- **[MITTEL · abdeckungsluecke]** eintragsart 'eigentum_erbgang' — je Kanton nur EIN Regime kodiert, obwohl SG/AI/TI Erbteilung materiell anders tarifieren
  - Norm: z.B. SG GB-GebV sGS 914.5 Nr. 20.02.01 Erbgang 1‰ (200-1000) vs. Nr. 20.02.02 Erbteilung 2‰ (200-10000); AI GebT Art. 11 Abs.1 Ziff.2 Erbgang fix 100 vs. Ziff.3 Erbteilung 2‰ min 200; TI Art. 13 LTORF Sonderreduktion
  - Erwartet: Erbgang und Erbteilung als getrennte Bemessung (§4 regime-treu) oder als deterministisch verschiedene Werte
  - Ist: Label lautet «Eigentum infolge Erbgang / Erbteilung», die Engine liefert aber je Kanton nur den Erbgang-Wert; für eine Erbteilung erhält der Nutzer den (oft zu tiefen) Erbgang-Betrag. Der Unterschied steht nur in der hinweis-Prosa, nicht im Rechenwert
  - Notiz: §4-Regime-Kollaps zweier rechtlich verschiedener Vorgänge in einer Eintragsart; teilweise via hinweis offengelegt (§8), aber nicht im Betrag.
- **[NIEDRIG · wertfehler]** eigentum_erbgang / grundpfand / eigentum_kauf VS bei nicht auf 1000 aufgehenden Werten (z.B. 1'000'500 → Engine 2001)
  - Norm: Art. 32 al. 3 OcRF (RS 211.611): «Bemessung auf den nächsten Tausender aufgerundet» — so im hinweis VS transkribiert
  - Erwartet: Basis vor Anwendung des Satzes auf nächsten Tausender aufrunden: 1'000'500 → 1'001'000 × 2‰ = 2002
  - Ist: Engine wendet 2‰ direkt auf Rohwert an (2001); die im staffel-Primitiv fehlende Basis-Aufrundung ist für KEINEN Kanton implementiert
  - Notiz: Betrag winzig (≤ ~2 CHF bei 2‰), aber echte Norm-Abweichung; Selbst-Widerspruch regel vs. hinweis. Betrifft VS eigentum+grundpfand (2‰) analog.
- **[NIEDRIG · abdeckungsluecke]** grundpfand TI (Default 7‰) und grundpfand VS (Default 1‰)
  - Norm: TI LTORF Art. 25 Schuldbrief 7‰ vs. Art. 23 Hypothek 5‰ vs. gesetzliche 1‰; VS OcRF Art. 32 al.2 let. b Papierschuldbrief 2,5‰ vs. let. c Registerschuldbrief/Hypothek 1‰
  - Erwartet: Pfandart-abhängiger Satz (Schuldbrief vs. Hypothek) wählbar oder als Spanne ausgewiesen
  - Ist: grundpfand kollabiert alle Pfandarten auf EINEN Default (TI = höchster 7‰, VS = tiefster 1‰); die Alternativsätze stehen nur im hinweis-Text
  - Notiz: Register-Schuldbrief ist heute der Regelfall, daher Default vertretbar; Transparenzlücke, da die abweichende Pfandart nur in Prosa erscheint.
- **[NIEDRIG · abdeckungsluecke]** VS alle wertbasierten GB-Gebuehren (eigentum_kauf, eigentum_erbgang, grundpfand): Basis wird roh in promille-Regel gegeben
  - Norm: OcRF VS RS 211.611 Art. 32 al. 3: 'la base de calcul est arrondie au millier de francs superieurs' (Bemessungsbasis auf den naechsten Tausender AUFrunden, bevor der Promille-Satz angewendet wird)
  - Erwartet: Basis vor Promille auf naechsten 1000er aufrunden: 1'234'567 -> 1'235'000 -> 2 permille = 2'470
  - Ist: Engine rechnet 1'234'567 * 2/1000 = 2'469.13 (round2). Aufrundungsregel Art. 32 al. 3 ist im promille-Typ nicht abgebildet; systematisch minimal zu niedrig
  - Notiz: Geringe Betragswirkung (max ~ 1000 x Promille), aber eine explizite, deterministische Norm-Rechenregel fehlt. Betrifft nur VS; kein generischer Basis-Aufrundungsmechanismus im Evaluator vorhanden.

### `src/lib/verzugszins.ts`  (4)

- **[HOCH · wertfehler]** ersterZinstag bei beginnTyp 'mahnung' (Zeile 134: beginnTyp === 'verfalltag' ? addDays(eingabeBeginn, 1) : eingabeBeginn)
  - Norm: Art. 102 Abs. 1 i.V.m. Art. 104 Abs. 1 OR, https://www.fedlex.admin.ch/eli/cc/27/317_321_377/de (Stand 2026-01-01); BGer-Praxis: Verzugszins ab dem auf den Zugang der Mahnung FOLGENDEN Tag — BGE 103 II 102 E. 1a (http://relevancy.bger.ch/php/clir/http/index.php?highlight_docid=atf://103-II-102:de) und explizit BGer 4A_58/2019 vom 13.01.2020 E. 4.1 («à partir du jour suivant celui où le débiteur a reçu l'interpellation», m.H. auf 5C.177/2005 E. 6.1; https://servat.unibe.ch/dfr/bger/2020/200113_4A_58-2019.html)
  - Erwartet: Mahnung 15.01.2024, Stichtag 31.01.2024, K=10'000, 5 %: erster Zinstag 16.01.2024 → unter Engine-eigener Konvention 15 Zinstage, Zins CHF 20.55; identisch mit Verfalltag 15.01.2024 (gleicher Verzugseintritt)
  - Ist: ersterZinstag 15.01.2024, 16 Tage, Zins CHF 21.92 — 1 Tag zu viel; Widerspruchsbeweis in der Engine selbst: Verfalltag 15.01. liefert 15 Tage/CHF 20.55, Mahnung 15.01. liefert 16 Tage/CHF 21.92. Rechenweg-Text zudem falsch: «der Zins läuft ab Erhalt der Mahnung (15.01.2024)»
  - Notiz: Frankeneffekt klein (1 Tag), aber ersterZinstag ist genau das Datum fürs Rechtsbegehren («Zins zu 5 % seit …») — jedes Mahnungs-Rechtsbegehren wäre um 1 Tag zu früh; betrifft Default-Pfad (beginnTyp default 'mahnung'). Tests decken nur den Verfalltag-Folgetag ab (verzugszins.test.ts:94-96)
- **[MITTEL · wertfehler]** ersterZinstag bei beginnTyp 'klage' ohne rueckstaendigeZinsforderung
  - Norm: BGer 4A_58/2019 E. 4.1: bei gerichtlicher Klage Verzugszins «dès le lendemain du jour où la demande en justice a été notifiée au débiteur» (Folgetag der ZUSTELLUNG an den Schuldner), https://servat.unibe.ch/dfr/bger/2020/200113_4A_58-2019.html; abzugrenzen von Art. 105 Abs. 1 OR («vom Tage der Anhebung ... an», nur für rückständige Zinsen/Renten/geschenkte Summe), Fedlex SR 220 Stand 2026-01-01
  - Erwartet: Normale Geldschuld: Zins ab Folgetag der Klagezustellung (Sonde: Klage 15.01.2024, Stichtag 31.01. → 15 Zinstage, CHF 20.55); nur im Art.-105-Abs.-1-Fall Zins ab dem Anhebungstag selbst
  - Ist: Zins ab Klagedatum in beiden Fällen identisch (16 Tage, CHF 21.92); das Flag rueckstaendigeZinsforderung ändert nur eine Warnung, nie die Rechnung — der Normalfall erbt den taggleichen Start, der nur für Art. 105 Abs. 1 korrekt ist. Input-Doku «Klagedatum» lässt zudem Einreichung statt Zustellung eingeben
  - Notiz: Gleiche Wurzel wie Befund 1 (Zeile 134); Fix müsste mahnung/klage auf Folgetag stellen und für Art. 105 Abs. 1 den taggleichen Start behalten
- **[NIEDRIG · wertfehler]** beginnTyp 'mahnung' kombiniert mit rueckstaendigeZinsforderung: true rechnet dennoch Zins ab Mahnung
  - Norm: Art. 105 Abs. 1 OR: bei rückständigen Zinsen/Renten/geschenkter Summe Verzugszins «erst vom Tage der Anhebung der Betreibung oder der gerichtlichen Klage an», https://www.fedlex.admin.ch/eli/cc/27/317_321_377/de (Stand 2026-01-01)
  - Erwartet: Vor Betreibung/Klage ist kein Verzugszins geschuldet — Rechnung ab blosser Mahnung müsste blockieren oder deutlich als rechtlich nicht geschuldet markieren
  - Ist: status 'ok', Zins CHF 21.92 wird normal ausgewiesen; nur eine Warnung «der Verzugsbeginn sollte diesem Datum entsprechen» wird angehängt
  - Notiz: Soft guard vorhanden und Konvention deklariert — vertretbar, aber der ausgewiesene Betrag ist im Warn-Fall rechtlich nicht geschuldet
- **[NIEDRIG · abdeckungsluecke]** Teilzahlungs-Anrechnung — fehlende Kosten-Dimension
  - Norm: Art. 85 Abs. 1 OR
  - Erwartet: Anrechnungsreihenfolge Kosten → Zinsen → Kapital: eine Teilzahlung tilgt zuerst Kosten (Betreibungs-/Mahnkosten), dann aufgelaufene Zinsen, erst dann Kapital.
  - Ist: Die Engine kennt nur Zinsen → Kapital; es gibt kein Eingabefeld für Kosten. Der Warntext ('Reihenfolge Kosten→Zinsen→Kapital nach Lehre/Praxis', Z. 297) und der Code-Kommentar behaupten dennoch die volle Reihenfolge inkl. Kosten. Bei tatsächlich vorhandenen Kosten würde eine Teilzahlung zu früh auf Zinsen/Kapital angerechnet.
  - Notiz: Scope-bedingt für einen reinen Verzugszinsrechner vertretbar; die materielle Zins/Kapital-Rechnung ist korrekt. Rein: entweder Kosten-Ereignis modellieren oder Warntext auf die tatsächlich abgebildete Reihenfolge (Zinsen→Kapital) präzisieren, um die Erwartungslücke zu schliessen.

### `src/data/tarif/modifikatoren.ts`  (6)

- **[MITTEL · wertfehler]** TG rechtsmittel: f(1, 1, 0.333, 0.667) — gk=1.0
  - Norm: VGG (RB 638.1) § 13 Ziff. 1 (Obergericht, Endentscheide Zivilsachen mit Streitwert) vs. § 11 Ziff. 1 (Bezirksgericht): OG 100–500k = Fr. 3'000–12'000, BG 100–500k = Fr. 2'000–8'000; OG 500k–1M = 10'000–20'000, BG = 7'000–15'000; OG >1M = 1,5–4,5 % des Streitwerts, BG = 1–3 %.
  - Erwartet: Rechtsmittel-gk ≈ 1,3–1,5 (Sockel-Verhältnisse 1,43–1,5; Decken-Verhältnisse 1,125–1,5; Prozentsätze exakt 1,5×)
  - Ist: gk = 1,0 → Berufungs-Gerichtsgebühr um ~30–50 % zu tief modelliert (Unterzeichnung, verharmlost die Rechtsmittelkosten gegenüber dem Nutzer)
  - Notiz: Der code-Kommentar (Z. 28–32) behauptet, der frühere 1,1–1,5-Zuschlag sei «im Wortlaut unbelegt» und neutralisiert ihn auf 1,0. Genau das ist am Wortlaut WIDERLEGT: § 13 (OG) liegt systematisch ~1,5× über § 11 (BG). Die Neutralisierung war die falsche Richtung; die ursprüngliche 1,1–1,5-Spanne war näher an der Norm.
- **[MITTEL · abdeckungsluecke]** BE rechtsmittel: f(1, 1, 0.2, 0.5) — gk=1.0 (ein Topf für Berufung UND Beschwerde)
  - Norm: VKD (BSG 161.12, i.K. 1.5.2026) Art. 46 Beschwerdeverfahren = pauschal 300–7'500 Taxpunkte; dagegen Art. 36 ordentliches Verfahren 30–100k = 1'000–20'000 TP, 100–500k = 4'000–36'000, 500k–1M = 8'000–60'000, 1–2M = 12'000–120'000 TP.
  - Erwartet: Berufung (Art. 44) ≈ 1,0 (korrekt — Art. 44 = Art. 36 in den oberen Bändern identisch, unten Sockel 1,5×); Beschwerde (Art. 46) ≈ 0,06–0,4 (fixer Deckel 7'500 TP weit unter dem ordentlichen Rahmen)
  - Ist: gk = 1,0 pauschal → Beschwerde-Gerichtsgebühr grob überzeichnet (bis >15× zu hoch bei hohem Streitwert)
  - Notiz: Die Neutralisierung des früheren 1,5-Zuschlags auf 1,0 ist für die Berufung (Art. 44) am Wortlaut BESTÄTIGT (Berufungs- und ordentlicher Rahmen sind in den oberen Bändern deckungsgleich). Der Mangel ist die Vermengung von Berufung und Beschwerde in EINEM rechtsmittel-Topf: Art. 46 hat einen viel tieferen Fixrahmen.
- **[MITTEL · norm-anker]** GR: vereinfacht/summarisch/rechtsmittel alle EINS (1.0); Kommentar «VGZ (BR 320.210) Pauschale «vor jeder Instanz»»
  - Norm: VGZ (BR 320.210, i.K. 1.1.2025) setzt je Verfahrensart/Instanz EIGENE absolute Rahmen: Art. 3 ordentlich 3'000–30'000; Art. 4 vereinfacht 1'000–8'000; Art. 5 summarisch 100–5'000; Art. 11 Berufung 1'000–30'000; Art. 12 Beschwerde 500–8'000.
  - Erwartet: Kein «Pauschale vor jeder Instanz» — die Rahmen unterscheiden sich stark; summarisch/vereinfacht/Beschwerde liegen deutlich unter dem ordentlichen Rahmen
  - Ist: gk = 1,0 überall → summarisch, vereinfacht und Beschwerde-Gerichtsgebühren überzeichnet; Norm-Begründung «vor jeder Instanz» trifft die geltende Fassung nicht
  - Notiz: Die zitierte Begründung stammt aus einer älteren VGZ-Logik. Register-Zeile 96–98 kennt die Lücke bereits («GR-GK sauber als eigener Absoluttarif je Verfahrenssituation modellieren»). GR pe=1,0 ist dagegen sauber (HV BR 310.250 rein aufwandbasiert, keine Faktoren).
- **[MITTEL · abdeckungsluecke]** VD vereinfacht: f(0.55, 0.75, 0.5, 0.7) — gk 0.55–0.75
  - Norm: TFJC (BLV 270.11.5) Art. 23 procédure simplifiée: 0–2k=360, 2–5k=750, 5–10k=900, 10–30k=2'100 Fr.; Art. 18 procédure ordinaire = FIX 3'750 Fr. für die ganze Spanne 0–30'000.
  - Erwartet: Verhältnis simplifiée/ordinaire ≈ 0,10 (Kleinfälle) bis 0,56 (nahe 30k) — nicht 0,55–0,75
  - Ist: gk 0,55–0,75 überzeichnet die Gerichtsgebühr geringwertiger vereinfachter Fälle um bis ~3× (z. B. 5k: Modell ~2'060–2'810 vs. Norm 900) und deckt die tiefen Verhältnisse gar nicht ab
  - Notiz: VD-gk sind durchweg abgeleitete Verhältnisse fixer Franken-Tabellen (TFJC Art. 18/23/25/appel/recours), keine wörtlichen Multiplikatoren. summarisch-gk 0,15–0,8 und rechtsmittel-gk 0,2–0,55 in diesem Pass nicht erschöpfend nachgerechnet (Abdeckungslücke). Register-Zeile 97–99 kennzeichnet VD-gk bereits als «Näherung».
- **[NIEDRIG · norm-anker]** SZ summarisch: f(1, 1, 0.2, 0.6) — pe 0.2–0.6; OW summarisch: f(1, 1, 0.5, 0.8) — pe 0.5–0.8
  - Norm: SZ GebTRA (SRSZ 280.411) § 10: «In summarischen Verfahren beträgt das Honorar Fr. 300.– bis Fr. 4'800.–» (absolut, KEIN Prozentsatz); OW GebOR (GDB 134.15) Art. 35a: summarisches Verfahren Anwaltsgebühr Fr. 400.– bis Fr. 5'000.– (absolut).
  - Erwartet: summarisch-pe ist in SZ/OW ein absoluter Frankendeckel, kein Faktor der ordentlichen pe
  - Ist: Als Faktor 0,2–0,6 (SZ) bzw. 0,5–0,8 (OW) modelliert → überzeichnet die Parteientschädigung hochwertiger Summarfälle (Faktor × ordentliche pe übersteigt den Norm-Deckel 4'800/5'000)
  - Notiz: Bei SZ zusätzlich auffällig: summarisch-pe 0,2–0,6 ist identisch zum rechtsmittel-pe 0,2–0,6 (§ 11 Berufung/Revision «20 bis 60 %») — der §-11-Prozentsatz wurde faktisch auf das summarische Verfahren übertragen, dessen § 10 aber absolut ist. Register-Zeile 87–88 kennt beide Absolut-Ausnahmen bereits.
- **[NIEDRIG · hinweistext]** Kopf-Kommentar Z. 17–18: «Die pe-Faktoren sind grösstenteils WÖRTLICH aus den kantonalen Anwaltstarifen belegt (echte Prozentsätze)»
  - Norm: Trifft zu für OW (Art. 36 20–100 %), SZ (§ 11 20–60 %), JU-rechtsmittel (Art. 22 30–150 %), LU. Trifft NICHT zu für VD (TDC 270.11.6 Art. 4–13 = absolute Frankentabellen), SZ-summ (§ 10 absolut), OW-summ (Art. 35a absolut), FR (RJ forfait 100–200'000/500'000).
  - Erwartet: Aussage auf die Kantone mit echten Prozentsätzen einschränken
  - Ist: Verallgemeinerung überzeichnet den Beleggrad; für VD/FR und die Summar-pe von SZ/OW sind die pe-Faktoren ebenfalls abgeleitete Verhältnisse, nicht wörtliche Prozentsätze
  - Notiz: Reiner Kommentartext; keine Rechenwirkung, aber irreführend für spätere Abnahme (§7/§8).

### `src/lib/bgerRechtsweg.ts`  (5)

- **[MITTEL · abdeckungsluecke]** Zulässigkeit Verwaltungsweg vermögensrechtlich (Streitwertgrenzen öffentlich-rechtlich) — berechneBgerRechtsweg, weg='verwaltung'
  - Norm: Art. 85 Abs. 1–2 BGG, https://www.fedlex.admin.ch/eli/cc/2006/218/de, Stand 1.4.2026: Beschwerde UNZULÄSSIG bei Staatshaftung < CHF 30'000 (lit. a) und öffentlich-rechtlichen Arbeitsverhältnissen < CHF 15'000 (lit. b); Ausnahme nur Rechtsfrage von grundsätzlicher Bedeutung (Abs. 2)
  - Erwartet: Bei vermögensrechtlicher Staatshaftungs-/Personalrechtssache unter der Schwelle: «unzulässig, ausser Rechtsfrage von grundsätzlicher Bedeutung» — oder mindestens eine offengelegte Warnung, dass Art. 85 nicht geprüft wird
  - Ist: Engine liefert für weg='verwaltung' IMMER zulaessigkeit='zulaessig' («Beschwerde in öffentlich-rechtlichen Angelegenheiten: zulässig · Frist 30 Tage …»); Art. 85 kommt in der gesamten Codebasis nicht vor (grep leer); die Warnung legt nur den Art.-83-Ausnahmekatalog offen — was suggeriert, alles Übrige sei geprüft. Weder Engine noch Form (BgerRechtswegForm.tsx) bieten für den Verwaltungsweg einen Streitwert-/Gebiets-Input
  - Notiz: Einzige echte Lücke. Fristen bleiben auch in dieser Konstellation korrekt (30 T. mit Stillstand); falsch ist nur das pauschale Zulässigkeits-Verdikt für die Teilmenge Staatshaftung/öff. Personalrecht. Fix-Optionen (nicht ausgeführt, read-only): Art.-85-Zweig analog Art. 74 ODER die bestehende Art.-83-Warnung um Art. 85 erweitern.
- **[NIEDRIG · hinweistext]** 10-Tage-Frist für BPatGer-Lizenzentscheide (Art. 40d PatG) nicht abbildbar
  - Norm: Art. 100 Abs. 2 lit. d BGG, https://www.fedlex.admin.ch/eli/cc/2006/218/de, Stand 1.4.2026 (ferner Art. 74 Abs. 2 lit. e BGG)
  - Erwartet: Eingabepfad für Entscheide des Bundespatentgerichts (Frist 10 Tage bei Lizenz nach Art. 40d PatG; Streitwert-Ausnahme Abs. 2 lit. e)
  - Ist: Kein Eingabepfad — es kann dadurch KEIN falscher Wert entstehen (Konstellation nicht erreichbar); Art. 74 Abs. 2 lit. e wird im schwelle_verfehlt-Text immerhin genannt, Art. 100 Abs. 2 lit. d nirgends
  - Notiz: Reine Vollständigkeits-/Scope-Lücke, kein Rechenfehler. Der Engine-Kopf listet die abgedeckten Artikel, nennt diese Lücke aber nicht explizit.
- **[NIEDRIG · abdeckungsluecke]** Art. 74 Abs. 2 lit. e (Bundespatentgericht) — Patent-/Immaterialgüter-Entscheid mit Streitwert < 30'000
  - Norm: Art. 74 Abs. 2 lit. e BGG (SR 173.110, Kons. 20260401): «Erreicht der Streitwert den massgebenden Betrag ... nicht, so ist die Beschwerde dennoch zulässig: ... e. gegen Entscheide des Bundespatentgerichts.»
  - Erwartet: zulaessigkeit = zulaessig_ausnahme (streitwertunabhängig zulässig)
  - Ist: zulaessigkeit = schwelle_verfehlt — es gibt keinen strukturierten Input für lit. e (nur einzigeKantonaleInstanz=lit.b, schkg_aufsicht=lit.c, konkursNachlassrichter=lit.d sind abgebildet)
  - Notiz: Teilweise gemildert: der schwelle_verfehlt-Text (Zeile 320) nennt das «Bundespatentgericht» im Residual-Katalog des Abs. 2 als Hinweis; das strukturierte Verdikt (zulaessigkeit) bleibt für diesen seltenen Fall aber falsch. Enger Anwendungsfall (Bundespatentgericht ist einzige Instanz, Art. 26 PatGG).
- **[NIEDRIG · abdeckungsluecke]** Art. 100 Abs. 2 lit. d (Lizenz-Entscheid Bundespatentgericht, Art. 40d PatG) — Frist 10 Tage
  - Norm: Art. 100 Abs. 2 lit. d BGG (SR 173.110, Kons. 20260401): «Die Beschwerdefrist beträgt zehn Tage: ... d. bei Entscheiden des Bundespatentgerichts über die Erteilung einer Lizenz nach Artikel 40d des Patentgesetzes ...»
  - Erwartet: fristTage = 10, fristNorm = Art. 100 Abs. 2 lit. d BGG
  - Ist: fristTage = 30 (Grundsatz Abs. 1) — der Sonderfall lit. d ist weder als Input noch in der Frist-Kaskade (Zeilen 353-390) abgebildet
  - Notiz: Sehr seltener Fall (Zwangslizenz Art. 40d PatG). Anders als Befund 1 wird lit. d NIRGENDS im Ausgabetext offengelegt; ein Nutzer würde die 30-Tage-Frist ungewarnt übernehmen.
- **[NIEDRIG · abdeckungsluecke]** Art. 100 Abs. 2 lit. d BGG — Beschwerdefrist 10 Tage bei Entscheiden des Bundespatentgerichts über die Erteilung einer (Zwangs-)Lizenz nach Art. 40d PatG
  - Norm: Art. 100 Abs. 2 lit. d BGG (SR 173.110, Konsolidierung 20260401): 'Die Beschwerdefrist beträgt zehn Tage: ... d. bei Entscheiden des Bundespatentgerichts über die Erteilung einer Lizenz nach Artikel 40d des Patentgesetzes'
  - Erwartet: Für den (zugegeben sehr engen) Fall einer Zwangslizenz-Erteilung durch das Bundespatentgericht wäre die 10-Tage-Frist einschlägig
  - Ist: Die Engine bietet keinen Input für diesen Sonderfall; ein solcher Entscheid liefe in den 30-Tage-Grundsatz (Art. 100 Abs. 1). Ebenso ist die streitwertunabhängige Ausnahme Art. 74 Abs. 2 lit. e (Bundespatentgericht) nur als Hinweistext, nicht als Eingabepfad modelliert.
  - Notiz: Sehr wahrscheinlich bewusste Scope-Grenze: die Engine modelliert den Bundespatentgericht-Pfad durchgehend nicht (weder Frist Abs. 2 lit. d noch Streitwert-Ausnahme Abs. 2 lit. e als Input) — kein Wertfehler an einem modellierten Wert, sondern eine kohärent nicht abgedeckte Nische. Alle modellierten Werte sind korrekt. Nur der Vollständigkeit halber gemeldet.

### `src/data/tarif/typen.ts`  (5)

- **[MITTEL · wertfehler]** BGer-Gerichtsgebühr bei nicht vermögensrechtlicher GlG-/BehiG-Streitigkeit (berechneProzesskosten, Zweig instanz='bundesgericht': reduziert = !nv && …)
  - Norm: Art. 65 Abs. 4 lit. b und d BGG (SR 173.110), «Sie beträgt 200–1000 Franken und wird NICHT nach dem Streitwert bemessen in Streitigkeiten: … b. über Diskriminierungen auf Grund des Geschlechts; … d. nach den Artikeln 7 und 8 BehiG» — https://www.fedlex.admin.ch/eli/cc/2006/218/de, Konsolidierung in Kraft seit 1.4.2026 (XML cc/2006/218/20260401)
  - Erwartet: CHF 200–1000 (Abs. 4 ist streitwertUNabhängig formuliert und als lex specialis auch ohne Vermögensinteresse einschlägig; gerade BehiG-Diskriminierungsklagen sind typischerweise nicht vermögensrechtlich)
  - Ist: CHF 200–5000 (Engine priorisiert den nv-Zweig → BGER_GERICHTSKOSTEN_OHNE_VERMOEGEN, Quelle «Art. 65 Abs. 3 lit. a BGG»); empirisch reproduziert für gleichstellung und behindertengleichstellung mit nichtVermoegensrechtlich=true
  - Notiz: Obergrenze 5× überzeichnet in genau der typischen BehiG-Konstellation. Für vermögensrechtliche Fälle ist der reduziert-Katalog korrekt (inkl. 30 000-Grenze lit. c, inklusiv).
- **[MITTEL · hinweistext]** Handelsgericht-Hinweistext: «Kein Schlichtungsverfahren (Art. 198 lit. f ZPO)» (prozesskosten.ts Z. 249)
  - Norm: Art. 198 lit. f ZPO i.d.F. seit 1.1.2025 (BG 17.3.2023, AS 2023 491): Entfall nur noch «bei Streitigkeiten, für die nach Artikel 7 dieses Gesetzes eine einzige kantonale Instanz zuständig ist»; für Art.-5/6/8-Streitigkeiten neu Art. 199 Abs. 3 ZPO: «kann die klagende Partei die Klage direkt beim Gericht einreichen» — https://www.fedlex.admin.ch/eli/cc/2010/262/de, Konsolidierung in Kraft seit 1.7.2026 (XML cc/2010/262/20260701)
  - Erwartet: Zitat Art. 199 Abs. 3 ZPO (Wahlrecht zur Direktklage bei Handelsgerichts-Streitigkeiten nach Art. 6), nicht Art. 198 lit. f; «kein Schlichtungsverfahren» ist seit 1.1.2025 kein zwingender Entfall mehr
  - Ist: Hinweis zitiert Art. 198 lit. f ZPO und behauptet zwingenden Entfall — beides entspricht der vor 1.1.2025 geltenden Fassung
  - Notiz: Nur Hinweistext, keine Beträge betroffen; Weiterzugs-Aussage (Art. 75 Abs. 2 lit. b BGG) und Tarif-Wahl bleiben korrekt.
- **[NIEDRIG · hinweistext]** Konstellation phase='schlichtung' + materie='gewaltschutz'
  - Norm: Art. 198 lit. a^bis ZPO (seit 1.7.2020, AS 2019 2273): «Das Schlichtungsverfahren entfällt … bei Klagen wegen Gewalt, Drohungen oder Nachstellungen nach Artikel 28b ZGB oder betreffend eine elektronische Überwachung nach Artikel 28c ZGB» — https://www.fedlex.admin.ch/eli/cc/2010/262/de, Stand 1.7.2026
  - Erwartet: Kein Preis-Output ohne Warnung — die Konstellation existiert rechtlich nicht (Schlichtungsverfahren entfällt von Gesetzes wegen)
  - Ist: Engine liefert kommentarlos eine kostenpflichtige Schlichtungsgebühr-Spanne (ZH nv: CHF 100–850), keiner der 6 Hinweise erwähnt Art. 198 lit. a^bis
  - Notiz: Kein falscher Betrag im real möglichen Verfahren, aber irreführungsanfällig, falls die UI die Kombination anbietet.
- **[NIEDRIG · hinweistext]** Fehlender Art.-115-Vorbehalt bei den Kostenlos-Ausgaben von prozesskosten.ts
  - Norm: Art. 115 Abs. 1 ZPO (Kostenauflage bei bös-/mutwilliger Prozessführung «auch in den unentgeltlichen Verfahren») und Abs. 2 (bei Streitigkeiten nach Art. 114 lit. f Kostenauflage an die unterliegende Partei, wenn ein Verbot nach Art. 28b ZGB oder eine elektronische Überwachung nach Art. 28c ZGB angeordnet wird) — https://www.fedlex.admin.ch/eli/cc/2010/262/de, Stand 1.7.2026
  - Erwartet: Kostenlos-Befund mit Vorbehalt Art. 115 Abs. 1 (generell) bzw. Abs. 2 (Gewaltschutz) — wie es src/lib/zustaendigkeit.ts Z. 561/576 bereits korrekt formuliert
  - Ist: gerichtskostenKostenlos()/hinweise in prozesskosten.ts geben «keine Kosten» ohne jeden Art.-115-Vorbehalt aus (empirisch: gewaltschutz/entscheid OHNE 115-Hinweis)
  - Notiz: §8-Ehrlichkeits-Lücke + §5-Asymmetrie (dieselbe Rechtsregel steht in zustaendigkeit.ts, fehlt hier).
- **[NIEDRIG · wertfehler]** Materie-Label 'miete_pacht' = «Miete/Pacht von Wohn-/Geschäftsräumen»
  - Norm: Art. 113 Abs. 2 lit. c ZPO: «aus Miete und Pacht von Wohn- und Geschäftsräumen SOWIE AUS LANDWIRTSCHAFTLICHER PACHT» — https://www.fedlex.admin.ch/eli/cc/2010/262/de, Stand 1.7.2026
  - Erwartet: Landwirtschaftliche Pacht als kostenlose Schlichtungs-Materie abbildbar (eigene Zeile oder Label-Erweiterung)
  - Ist: Label und kostenlosGrund nennen nur Wohn-/Geschäftsräume; die landwirtschaftliche Pacht ist im Materie-Katalog nicht erkennbar/wählbar

### `src/data/tarif/bundesgericht.ts`  (4)

- **[MITTEL · abdeckungsluecke]** Gerichtsgebühr BGer bei nicht vermögensrechtlicher Gleichstellungs- oder BehiG-Streitigkeit (src/lib/prozesskosten.ts:196: reduziert = !nv && …)
  - Norm: Art. 65 Abs. 4 lit. b und d BGG, SR 173.110, https://www.fedlex.admin.ch/eli/cc/2006/218/de (XML-Konsolidierung eli/cc/2006/218/20260401), Stand 1.4.2026: «Sie beträgt 200–1000 Franken und wird nicht nach dem Streitwert bemessen in Streitigkeiten: … b. über Diskriminierungen auf Grund des Geschlechts; … d. nach den Artikeln 7 und 8 des Behindertengleichstellungsgesetzes» — OHNE Vermögens-/Streitwert-Bedingung (nur lit. c trägt eine); ebenso Tarif SR 173.110.210.1 Ziff. 2
  - Erwartet: CHF 200–1'000 (Abs. 4 ist lex specialis zu Abs. 3 lit. a; gilt unabhängig vom Vermögensinteresse — gerade BehiG-Art.-7/8-Klagen sind typischerweise nicht vermögensrechtlich)
  - Ist: CHF 200–5'000 (Engine wählt wegen `!nv` den OHNE_VERMOEGEN-Rahmen Art. 65 Abs. 3 lit. a; empirisch reproduziert: materie=gleichstellung/behindertengleichstellung + nv=true + Instanz BGer → GK von=200 bis=5000). Kombination im UI erreichbar (nv-Checkbox lässt Materie-Select stehen). Kein Test deckt den Fall
  - Notiz: Nur die Rahmen-Obergrenze ist 5× überhöht (keine Punktwert-Ausgabe); Datendatei bundesgericht.ts selbst korrekt — Fehler in der Zuordnungslogik. Für arbeit+nv ist der Ausschluss dagegen normgetreu (lit. c verlangt Streitwert ≤ 30'000). Sozialversicherungsleistungen (lit. a) sind als Materie nicht modelliert (ZPO-Zivilrechtsweg) — vertretbare Scope-Grenze.
- **[NIEDRIG · abdeckungsluecke]** Parteientschädigung Klageverfahren (Reglement Art. 5) nirgends kodiert — Engine kennt nur den Beschwerdetarif Art. 4
  - Norm: Art. 5 Reglement über die Parteientschädigung, SR 173.110.210.3, https://www.fedlex.admin.ch/eli/cc/2006/839/de, Stand 1.1.2007: eigener, durchwegs höherer Streitwerttarif für Klageverfahren (bis 20'000: 1'800–6'000 … über 5 Mio: 40'000 / 2 Prozent)
  - Erwartet: Für Direktklagen ans BGer (Art. 120 BGG, Klageverfahren) gälte Art. 5 (z. B. bis 20'000: 1'800–6'000 statt 600–4'000)
  - Ist: Nicht abgebildet; die Instanz ist im UI aber ausdrücklich als «Beschwerde ans Bundesgericht» beschriftet (Art. 65/68 BGG), Art. 4 dafür korrekt
  - Notiz: Bewusste/vertretbare Scope-Grenze (Prozesskosten-Cockpit modelliert den Rechtsmittelzug), kein falscher Wert im abgedeckten Bereich. Nebenbefund zum Auftragstext: die Etikettierung von Art. 65 Abs. 4 BGG als «vereinfachtes Verfahren» im Prüfauftrag ist unzutreffend — es ist eine materiebezogene Reduktion; die Engine benennt es korrekt («Reduzierter Ansatz, streitwertunabhängig»).
- **[NIEDRIG · abdeckungsluecke]** BGER_PARTEIENTSCHAEDIGUNG deckt nur Art. 4 (Beschwerdeverfahren); Art. 5 (Klageverfahren, BGer als einzige Instanz nach Art. 120 BGG) nicht modelliert
  - Norm: SR 173.110.210.3 Art. 5 (Streitwerttarif für Klageverfahren): bis 20'000 → 1'800–6'000; 20'000–50'000 → 3'000–10'000; 50'000–100'000 → 5'000–15'000; 100'000–500'000 → 8'000–30'000; 500'000–1 Mio → 10'000–40'000; 1–2 Mio → 16'000–60'000; 2–5 Mio → 24'000–100'000; über 5 Mio → 40'000 / 2 Prozent
  - Erwartet: Für Klageverfahren die höheren Art.-5-Rahmen (rund doppelte Ansätze), oder explizite UI-Beschränkung auf Beschwerdeverfahren
  - Ist: Nur die Art.-4-Beschwerde-Staffel vorhanden; artikel-Feld = 'Art. 68 BGG / Reglement Art. 4', Code-Kommentar 'Beschwerdeverfahren'
  - Notiz: Bewusst gescopt und im Dossier (Abschnitt C) offengelegt; Klageverfahren vor BGer ist selten (Art. 120 BGG). Kein Wertfehler, nur Nichtabdeckung. Empfehlung: falls das Cockpit je Klageverfahren anbietet, Art.-5-Datensatz ergänzen; sonst UI-Label 'Beschwerdeverfahren' verdeutlichen.
- **[NIEDRIG · abdeckungsluecke]** BGER_PARTEIENTSCHAEDIGUNG deckt nur das Beschwerdeverfahren (Reglement Art. 4) ab; das Klageverfahren (Art. 5) fehlt
  - Norm: Reglement über die Parteientschädigung vor dem Bundesgericht, SR 173.110.210.3, Art. 5 (Streitwerttarif für Klageverfahren), https://www.fedlex.admin.ch/eli/cc/2006/839/de, Stand 27.12.2006
  - Erwartet: Für Direktprozesse/Klageverfahren vor BGer (Art. 120 BGG) gilt der eigene, höhere Tarif Art. 5: bis 20'000 → 1'800–6'000; 20'000–50'000 → 3'000–10'000; 50'000–100'000 → 5'000–15'000; 100'000–500'000 → 8'000–30'000; 500'000–1'000'000 → 10'000–40'000; 1'000'000–2'000'000 → 16'000–60'000; 2'000'000–5'000'000 → 24'000–100'000; über 5'000'000 → 40'000 + 2 Prozent
  - Ist: Nur der Art.-4-Beschwerdetarif ist als Konstante vorhanden (min. 600–4'000 … über 5 Mio 20'000 + 1%); ein Klageverfahren-Tarif existiert im File nicht
  - Notiz: Scope ist im Code deklariert (Kommentar: 'Beschwerdeverfahren (Reglement Art. 4)') und BGer-Klageverfahren sind selten — daher niedrig. Kein Wertfehler: die vorhandenen Art.-4-Werte sind korrekt. Nur zu ergänzen, falls Klageverfahren abgedeckt werden sollen.

### `src/data/tarif/gerichtskosten.ts`  (4)

- **[MITTEL · wertfehler]** NE: fehlende Rundung «à la dizaine inférieure» (Art. 12/13) in den Prozent-Bändern
  - Norm: Art. 12 Abs. 1 letzter Satz LTFrais, RSN 164.1: «L'émolument est arrondi à la dizaine inférieure.» — https://rsn.ne.ch/DATA/program/books/rsne/htm/164.1.htm (Teneur selon L du 24.1.2023, in Kraft 1.4.2023)
  - Erwartet: SW 12'345 → 13 % = 1'604.85 → abgerundet 1'600; SW 30'001 → 4'000.03 → 4'000; SW 25'555 → 3'322.15 → 3'320
  - Ist: Engine (staffel_sockel_prozent, round2) liefert 1'604.85 / 4'000.03 / 3'322.15 — keine Abrundung auf die untere Zehnerstelle
  - Notiz: Systematische Überzeichnung bis 9.99 CHF in allen SW-abhängigen NE-Bändern (>10'000). Deterministische Engine gibt einen Punktwert aus, der so nie verfügt würde. Fix-Idee (NICHT umgesetzt): Rundungsfeld je Regel/Band im Staffel-Primitiv.
- **[MITTEL · hinweistext]** VD: stand '1.9.2019' + quelleUrl lexfind tolv/105539 = eingefrorene Alt-Fassung
  - Norm: TFJC BLV 270.11.5, aktuelle Fassung «en vigueur dès le 01.01.2025» (Zwischenfassungen 1.5.2022, 1.5.2024) — https://prestations.vd.ch/pub/blv-publication/actes/consolide/270.11.5 (BLV, abgerufen 2.7.2026)
  - Erwartet: stand = 1.1.2025; quelleUrl auf die geltende BLV-Konsolidierung (lexfind tolv/105539 ist heute «version passée» 1.9.2019)
  - Ist: gerichtskosten.ts VD: stand: '1.9.2019', quelleUrl: https://www.lexfind.ch/tolv/105539/fr
  - Notiz: Alle Art.-18-Werte sind in der Fassung au 1.1.2025 UNVERÄNDERT (3'750/7'000/9'500/11'500/15'500+1,5 % >500k, max 300'000 gesamt — Engine-Deckel-Semantik verifiziert korrekt als Gesamtdeckel) → kein Rechenfehler, aber §7-Zitat-Ausnahme (c) verletzt: Link zeigt nicht auf die geltende Fassung; Stand-Drift unentdeckt.
- **[NIEDRIG · wertfehler]** BE: Bandgrenze bei exakt SW 10'000 (Art. 38 lit. a vs. lit. b)
  - Norm: Art. 38 Abs. 1 VKD, BSG 161.12 (Version in Kraft seit 1.5.2026): lit. a «weniger als 10'000 Franken: 300 bis 2'500 Taxpunkte», lit. b «10'000 bis 30'000 Franken: 900 bis 7'500 Taxpunkte» — https://www.belex.sites.be.ch/app/de/texts_of_law/161.12
  - Erwartet: SW = 10'000 → Rahmen 900–7'500 (lit. a gilt nur strikt UNTER 10'000)
  - Ist: Engine (grenzeChf: 10000, Auswahl basisChf <= grenzeChf) → Rahmen 300–2'500 bei exakt 10'000 (vite-node-Lauf)
  - Notiz: Off-by-one nur am exakten Grenzwert; ab 10'001 korrekt. Die übrigen BE-Grenzen (30'000/100'000/500'000/1 Mio/2 Mio) sind im Normtext selbst überlappend formuliert («10'000 bis 30'000» + «30'000 bis 100'000») — dort ist die inklusive Engine-Wahl vertretbar.
- **[NIEDRIG · hinweistext]** ZH: Hinweis-Text zu § 4 Abs. 2 (Ermässigungs-Grenze)
  - Norm: § 4 Abs. 2 GebV OG, LS 211.11 (Nachtrag 087, in Kraft 1.1.2015): «kann … ermässigt ODER um bis zu einem Drittel, in Ausnahmefällen bis auf das Doppelte, erhöht werden» — https://www.zh.ch/de/politik-staat/gesetze-beschluesse/gesetzessammlung/zhlex-ls/erlass-211_11-2010_09_08-2011_01_01-087.html
  - Erwartet: Ermässigung ohne betragliche Grenze; nur die ERHÖHUNG ist auf ⅓ (ausnahmsweise Doppeltes) begrenzt
  - Ist: hinweis: «nach § 4 Abs. 2 um bis zu ⅓ (ausnahmsweise aufs Doppelte) erhöh-/ermässigbar» — suggeriert, die ⅓-Grenze gelte auch für die Ermässigung
  - Notiz: Reiner Anzeigetext, keine Rechenwirkung (kein Modifikator wird automatisch angewendet). Ebenfalls kosmetisch: NE-erlassName «Loi sur les tarifs des frais» statt amtlich «Loi fixant le tarif des frais, des émoluments de chancellerie et des dépens en matière civile, pénale et administrative (LTFrais)».

### `src/data/schkgFeiertage.ts`  (3)

- **[MITTEL · norm-anker]** Preset «doppelaufruf» (schkgPresets.ts:134): Norm-Anker «Art. 141 SchKG»
  - Norm: Art. 142 Abs. 1 SchKG (SR 281.1, Stand 1.1.2026, https://www.fedlex.admin.ch/eli/cc/11/529_488_529/de): «…kann der Grundpfandgläubiger innert zehn Tagen nach Zustellung des Lastenverzeichnisses den Aufruf sowohl mit als auch ohne die Last verlangen.» Art. 141 SchKG regelt dagegen die Aussetzung der Versteigerung bei streitigem Lastenverzeichnis-Anspruch (am XML verifiziert).
  - Erwartet: Doppelaufruf-Begehren – 10 Tage ab Zustellung Lastenverzeichnis, Norm = Art. 142 SchKG
  - Ist: Frist (10 Tage) und Auslöser korrekt, aber norm: 'Art. 141 SchKG' — falscher Artikel als einziger Norm-Anker
  - Notiz: Klasse Norm-Anker-Fehler (§7/D1: jeder Rechtswert mit korrekter Norm). Rechenausgabe selbst unschädlich.
- **[MITTEL · abdeckungsluecke]** Preset «teilnahme_pfaendung» (schkgPresets.ts:94): «Teilnahme an Pfändung (Anschluss) – 30 Tage», Norm «Art. 110/111 SchKG»
  - Norm: Art. 110 Abs. 1 SchKG: 30 Tage (Gläubiger mit Fortsetzungsbegehren); Art. 111 Abs. 1 SchKG: «An der Pfändung können ohne vorgängige Betreibung innert 40 Tagen nach ihrem Vollzug teilnehmen: der Ehegatte…» (SR 281.1, Stand 1.1.2026, https://www.fedlex.admin.ch/eli/cc/11/529_488_529/de, am XML verifiziert)
  - Erwartet: Zwei getrennte Fristregimes: Art. 110 = 30 Tage; privilegierter Anschluss Art. 111 = 40 Tage (dazu Bestreitung 10 Tage / Klage 20 Tage, Art. 111 Abs. 4–5)
  - Ist: Ein Preset mit 30 Tagen unter Sammelzitat «Art. 110/111» — der 40-Tage-Anschluss nach Art. 111 fehlt bzw. wird mit 30 Tagen suggeriert
  - Notiz: §4-Regime-Vermengung: Label «Anschluss» ist gerade der Terminus des Art.-111-Privilegs. Für den Handelnden konservativ (30<40), aber wer das Anschluss-Fenster der Gegenseite beurteilt, unterschätzt es um 10 Tage.
- **[NIEDRIG · wertfehler]** berechneSchkgFrist, fristnatur 'wartefrist' (schkgFristen.ts:246): Wochenend-/Feiertags-Normalisierung VOR dem +1-Folgetag
  - Norm: Art. 88 Abs. 1 SchKG i.V.m. Art. 31 SchKG / Art. 142 Abs. 3 ZPO (SR 272, Stand 1.7.2026, https://www.fedlex.admin.ch/eli/cc/2010/262/de): Abs. 3 verschiebt nur das Ende einer HANDLUNGSfrist auf den nächsten Werktag; eine Wartefrist läuft auch an Sa/So/Feiertagen ab (h.M.), frühester Handlungstag = 21. Tag nach Zustellung
  - Erwartet: Zustellung ZB Mo 01.06.2026 → 20-Tage-Wartefrist läuft So 21.06.2026 ab → frühestes zulässiges Fortsetzungsbegehren Mo 22.06.2026
  - Ist: Engine: rechnerisches Ende So 21.06. → erst Werktags-Verschiebung auf Mo 22.06., dann +1 → «frühestens 23.06.2026» (empirisch reproduziert, Test T6)
  - Notiz: Immer nur SPÄTER als nötig (konservativ, keine Rechtsgefahr; gilt analog bei Wartefrist-Ende in Betreibungsferien). Wochentags-Ablauf ist exakt (Ende Mo 22.06. → 23.06. = 21.+1 korrekt normalisiert? nein: Ende Mo 22.06. → +1 = 23.06. = korrekt der 21. Tag +1 bei 20-Tage-Zählung ab dies a quo). Falls gewollt konservativ: als Annahme offenlegen (§8).

### `src/data/tarif/schlichtung.ts`  (3)

- **[MITTEL · hinweistext]** GE: hinweis «Re-Verifikation 21.6.: kein +20 %-Zuschlag im Artikel» + fehlende Abbildung des Mehrparteien-Zuschlags (schlichtung.ts:242–248)
  - Norm: Art. 13 RTFMC (rsGE E 1 05.10, Partie II, Titre I, Chapitre I «Dispositions communes»): «En cas de pluralité de demandeurs ou de défendeurs, les émoluments sont majorés de 20%» — https://silgeneve.ch/legis/data/rsg_e1_05p10.htm, Stand: dernières modifications 1.7.2025
  - Erwartet: Der +20%-Zuschlag ist NICHT gestrichen: Art. 13 steht weiterhin im geltenden Text und ist eine gemeinsame Bestimmung des Titre I, dem auch Chapitre II «Emoluments de conciliation» (Art. 15/16) untersteht — systematisch erfasst er auch die Schlichtungsgebühr. Beispiel: 2 Beklagte, Streitwert 20'000 → amtlich 100 + 20% = CHF 120.
  - Ist: Engine liefert deterministisch 100/200 ohne Mehrparteien-Pfad; der hinweis behauptet pauschal «kein +20 %-Zuschlag» (korrekt wäre nur: «nicht in Art. 15; Art. 13 Dispositions communes bleibt vorbehalten»).
  - Notiz: Bedingter Zuschlag (nur bei Parteienmehrheit; Engine kennt keinen Parteien-Input). Kernproblem ist der irreführende hinweis-Satz — die Audit-Frage «+20 % gestrichen?» ist klar mit NEIN zu beantworten. Minimal-Fix: hinweis präzisieren und Art.-13-Vorbehalt offenlegen (§8).
- **[NIEDRIG · hinweistext]** VS: regel = rahmen 50–500 als Anzeige für jeden Streitwert (schlichtung.ts:224)
  - Norm: Art. 15 Abs. 1 lit. a/b LTar (SGS/VS 173.8): citation 50–100, séance 120–250; Abs. 2: 60–500 — https://lex.vs.ch/app/de/texts_of_law/173.8 (PDF api/de|fr/versions/3360), Stand 1.1.2025, DE=FR wortgleich
  - Erwartet: Normalfall (Vorladung + Sitzung): CHF 170–350; nur Abs.-2-Fälle (Streitwert ≤ 2'000 / Entscheidvorschlag) 60–500; nur Vorladung 50–100.
  - Ist: Umschlag-Rahmen 50–500 über den ganzen Artikel; die Teil-Bänder stehen korrekt und vollständig im hinweis (120–250 ist drin — der frühere Audit-A4-Fehler 60–120 ist behoben).
  - Notiz: Bewusste Umschlag-Modellierung mit Offenlegung (Audit-Fix 21.6.); Untergrenze des Normalfalls (170) wird in der Rahmen-Anzeige unterschritten. Kein Wertfehler, Anzeige-Genauigkeit.
- **[NIEDRIG · abdeckungsluecke]** ZPO-Vorschalter: Materie-Abdeckung lit. d (prozesskosten.ts:163)
  - Norm: Art. 113 Abs. 2 lit. d ZPO (SR 272): «aus dem Arbeitsverhältnis SOWIE NACH DEM ARBEITSVERMITTLUNGSGESETZ … bis zu einem Streitwert von 30 000 Franken» — https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2010/262/20260701/de/html/fedlex-data-admin-ch-eli-cc-2010-262-20260701-de-html.html, Stand 1.7.2026
  - Erwartet: Kostenfreiheit umfasst auch Streitigkeiten nach dem Arbeitsvermittlungsgesetz (AVG, SR 823.11) bis 30'000.
  - Ist: Nur materie 'arbeit' («Arbeitsverhältnis») wählbar; AVG-Streitigkeiten sind als Materie nicht abgebildet.
  - Notiz: Abdeckungslücke im Eingabe-Enum, kein falscher Wert; der Grenzwert selbst ist korrekt (siehe clean).

### `src/data/tarif/parteientschaedigung.ts`  (3)

- **[MITTEL · hinweistext]** ZH hinweis «§ 9 summarisch ⅖–⅕» (parteientschaedigung.ts Zeile 62)
  - Norm: § 9 AnwGebV ZH (LS 215.3), Stand 1.1.2015 — amtliches zhlex-PDF https://www.notes.zh.ch/appl/zhlex_r.nsf/WebView/B43729FFE159A1E3C1257D9500280016/$File/215.3_8.9.10_87.pdf
  - Erwartet: «Im summarischen Verfahren wird die Gebühr in der Regel auf zwei Drittel bis einen Fünftel ermässigt» → ⅔–⅕
  - Ist: Anzeige-Hinweis behauptet «⅖–⅕»
  - Notiz: Reiner Anzeige-Text (fliesst nicht in die Berechnung), aber falscher Rechtswert am oberen Rand der Spanne (⅖ statt ⅔). Fix: «⅔–⅕».
- **[MITTEL · wertfehler]** UR kriterien + kriterienNorm «Art. 3 GGebV i.V.m. Art. 2 GGebR» (Zeilen 104–105)
  - Norm: Art. 3 Abs. 1 vs. Art. 19 Abs. 1 GGebV (RB 2.3231, Stand 1.1.2026) — https://rechtsbuch.ur.ch/app/de/texts_of_law/2.3231 (PDF Version 1128)
  - Erwartet: Bemessungskriterien der ANWALTSentschädigung stehen in Art. 19 Abs. 1 GGebV: Zeitaufwand, Bedeutung der Sache für die Partei (persönlich/wirtschaftlich), Schwierigkeit der Sache, Umfang und Art der Bemühungen (i.V.m. Art. 2 GGebR)
  - Ist: Engine zeigt die Kriterien des Art. 3 Abs. 1 GGebV («Aufwand», «Anzahl der Verhandlungen», «Umfang der Beweisführung», «Schwierigkeit von Sachverhalt und Rechtsfragen») — das sind die Kriterien für die GERICHTSGEBÜHR (Aufwand der Gerichtsbehörde), nicht für die Parteientschädigung
  - Notiz: Rechenstaffel unberührt (steht korrekt in Art. 28 GGebR). Zusatz-Currency: GGebV wurde per 1.1.2026 revidiert (u.a. Erlasstitel, Art. 19 geändert; Beschluss 27.8.2025) — Zitat bei Fix gleich auf neue Fassung stellen. GGebR RB 2.3232 selbst ist unverändert aktuell (Version seit 1.10.2023, per LexWork-API 2.7.2026 bestätigt).
- **[NIEDRIG · hinweistext]** SG hinweis-Etikett «Maximaltarif» (Zeile 298)
  - Norm: Art. 2/3/17 HonO SG (sGS 963.75, Stand 1.1.2019) https://www.gesetzessammlung.sg.ch/app/de/texts_of_law/963.75; Art. 30/31 AnwG (sGS 963.70)
  - Erwartet: HonO ist ein VERBINDLICHER Tarif (Art. 2: bindet Gericht/Behörde/Rechtsvertretung) um ein «mittleres Honorar», das nach Art. 17 um bis zu 50 % über-/unterschritten werden kann (+ Zuschläge Art. 18); weder HonO noch AnwG bezeichnen die Ansätze als Höchst-/Maximaltarif
  - Ist: Hinweis nennt den Tarif «Maximaltarif»
  - Notiz: Kein Rechenwert betroffen; Etikett im Wortlaut nicht belegt und wegen Art. 17/18 (Überschreitung möglich) irreführend — streichen oder durch «mittleres Honorar ±50 % (Art. 17)» ersetzen (steht dort bereits).

### `src/lib/gewaehrleistung.ts`  (3)

- **[MITTEL · wertfehler]** verj.jahre = 3, teilzwingend = false, vereinbartUnwirksam = false (Werkvertrag, unbeweglich, NEU, vereinbarteVerjaehrungJahre=3, sia118=true)
  - Norm: Art. 371 Abs. 3 OR nF (AS 2025 270, in Kraft 1.1.2026, Fedlex 20260101): «Die Verjährungsfrist von fünf Jahren kann nicht zu Lasten des Bestellers abgeändert werden.»
  - Erwartet: jahre=5, teilzwingend=true, vereinbartUnwirksam=true — die vereinbarte 3-Jahres-Verkürzung ist unwirksam, auch wenn SIA 118 vereinbart ist (SIA-118-AGB können die teilzwingende gesetzliche Untergrenze nicht derogieren)
  - Ist: jahre=3, teilzwingend=false, Warnung «Zulässige vertragliche Verkürzung» — die unwirksame Verkürzung wird als gültig ausgegeben; Verjährungsende 2 Jahre zu früh (kann fälschlich «verjährt» anzeigen)
  - Notiz: Zeile 243: `teilzwingend = neu && jahre === 5 && !sia`. Das `!sia` schaltet die teilzwingende 5-Jahres-Mindestdauer aus, sobald sia118 gesetzt ist. Für unbewegliche/integrierte Werke gilt Art. 371 Abs. 3 aber unabhängig von SIA 118. Gegenprobe: identischer Fall OHNE sia118 liefert korrekt jahre=5/unwirksam (Fall A). Trigger: sia118=true + vereinbarteVerjaehrungJahre<5 auf unbeweglichem/integriertem Werk unter neuem Recht.
- **[MITTEL · norm-anker]** rechtsstand=alt: vereinbarte 3-Jahres-Frist wird auf jahre=5 erhöht, vereinbartUnwirksam=true (Grundstück, Vertrag 2024, vereinbart 3 J, Ende 2027)
  - Norm: AS 2025 270 (eli/oc/2025/270): enthält KEINE Übergangsbestimmung (nur OR-/ZGB-Art.-839-Änderungen + Inkrafttreten 1.1.2026). Auffangregel Art. 1 SchlT ZGB = Nichtrückwirkung; der Code zitiert Art. 1 SchlT ZGB in Schritt 1 selbst für die Nichtrückwirkung der Rügefrist.
  - Erwartet: Für Altverträge bleibt die unter altem (dispositivem) Recht gültig vereinbarte kürzere Frist bestehen (jahre=3, keine Unwirksamkeit) — die neue teilzwingende 5-Jahres-Untergrenze erfasst mangels Übergangsbestimmung die Vertragsgültigkeit von Altverträgen nicht (Art. 1 SchlT ZGB).
  - Ist: Engine erklärt die Vereinbarung als «unwirksam (Art. 219a/371 Abs. 3 OR i.V.m. Übergangsrecht)» und rechnet 5 Jahre — stützt eine rückwirkende Vertragsungültigkeit auf ein «Übergangsrecht», das im Erlass nicht existiert (verifiziert am AS-Wortlaut).
  - Notiz: Zeilen 271-280. Die Rückwirkung der teilzwingenden Mindestdauer auf die Gültigkeit einer Altvertrags-Abrede ist bestenfalls umstritten (allenfalls Art. 49 SchlT ZGB für gesetzliche Fristlängen, nicht für Vertragsgültigkeit) und wird hier als definitive «ist unwirksam» mit einem fabrizierten «i.V.m. Übergangsrecht»-Anker ausgegeben. §7/§8: kein tragender Norm-Anker → nicht als feststehend darstellen (mindestens als umstritten/offen kennzeichnen).
- **[NIEDRIG · abdeckungsluecke]** ruege.art = tage60 (kein sia) bei Werkvertrag unbeweglich + sia118=true, neues Recht
  - Norm: Art. 367 Abs. 1bis OR (60 Tage, zwingend) vs. SIA-118 Art. 172 (2-Jahres-Garantie-/Rügefrist)
  - Erwartet: Für das unbewegliche Werk — den Kern-Anwendungsfall der SIA 118 — sollte die vereinbarte 2-Jahres-Garantie-/Rügefrist zumindest zusätzlich sichtbar sein; die zwingende 60-Tage-Frist ist nur die Untergrenze, nicht die vereinbarte Ordnung.
  - Ist: Da `sechzig` (Zeilen 136-140) unter neuem Recht bei jedem unbeweglichen/integrierten Werk zuerst greift, ist der SIA-Zweig (Zeilen 166-176) für genau diese Werke unerreichbar; ausgegeben wird nur «Mängelrüge bis +60 Tage», die SIA-Garantiefrist entfällt stillschweigend.
  - Notiz: Vertretbar, weil 60 Tage die zwingende Untergrenze sind und die SIA-118-Kompatibilität bereits per Warnung offengelegt wird; dennoch wird die vereinbarte SIA-Rügeordnung im Kern-Use-Case nicht angezeigt. Verifiziert: Fall «Werk unbeweglich SIA118 NEU» → ruege.art=tage60.

### `src/data/tarif/nicht-vermoegensrechtlich.ts`  (3)

- **[MITTEL · wertfehler]** AG PARTEIENTSCHAEDIGUNG_NV Stundenansatz (formel_extern-Hinweis: 'CHF 185–250 (unentgeltlich 150)')
  - Norm: AG AnwT SAR 291.150 § 9 Abs. 2bis/3bis, geltende Fassung i.K. 1.1.2024 (v3625)
  - Erwartet: § 9 Abs. 2bis: Stundenansatz i.d.R. Fr. 240, in einfachen Fällen bis Fr. 200, in schwierigen bis Fr. 270; § 9 Abs. 3bis (amtliche Verteidigung/unentgeltlich): i.d.R. Fr. 220 (bis 200)
  - Ist: Code führt 'Stundenansatz § 9: CHF 185–250 (unentgeltlich 150)' — sowohl Rahmen (185–250) als auch unentgeltlich-Wert (150) weichen von der geltenden Fassung ab (veralteter Stand)
  - Notiz: Bereits als verifiziert:'recherche' geflaggt (kein Rechenwert, reiner formel_extern-Hinweistext). Korrekt wären 200–270 (i.d.R. 240) bzw. amtlich 220. Zusätzlich ist § 9 amtlich 'Bemessung in Strafsachen'; als Zeitaufwand-Proxy für n.-verm. Zivilsachen vertretbar, aber die Zahlen sind stale.
- **[NIEDRIG · hinweistext]** Stand-Datum mehrerer NV-Einträge (Provenienz §7 Zitat-Ausnahme (a))
  - Norm: OW GebOR GDB 134.15 (geltende Fassung i.K. 1.3.2015, v1793); NW PKoG NG 261.2 (i.K. 1.1.2016, v1288); GL GS III A/5 (i.K. 1.1.2026, v2630)
  - Erwartet: stand = In-Kraft-Datum der geltenden Konsolidierung
  - Ist: Code führt stand='1.1.2011' für OW/NW (GERICHTSKOSTEN+PE+Schlichtung) und GL, obwohl die geltende amtliche Fassung deutlich neuer ist. Die Franken-Rahmen selbst sind inhaltlich alle korrekt (OW 800–10000, NW 300–10000, GL höchstens 20000).
  - Notiz: Nur Provenienz/Stand-Feld veraltet, keine Wertabweichung; §7(a) verlangt aktuelles In-Kraft-Datum. Betrifft auch Einträge mit stand='geltende Fassung' (korrekt) vs. hart '1.1.2011'.
- **[NIEDRIG · norm-anker]** JU PARTEIENTSCHAEDIGUNG_NV quelleUrl + Stundentarif 270 (formel_extern)
  - Norm: zitiert: Ordonnance fixant les honoraires RSJU 188.61 (Art. 6/7)
  - Erwartet: quelleUrl muss die zitierte Ordonnance 188.61 auflösen; Stundentarif 270/Std (unentgeltlich ~180) amtlich belegbar
  - Ist: quelleUrl viewdocument.html?id=30030 löst (über rsju Htdocs/Files/v/30030.pdf) auf 'Loi sur les émoluments (LEmol)' RSJU 176.11 auf, NICHT auf die zitierte Ordonnance 188.61; der Stundentarif 270/Std konnte in diesem Durchgang nicht aus der amtlichen 188.61 bestätigt werden
  - Notiz: PLAUSIBEL, nicht abschließend bestätigt (id->Htdocs-Mapping war bei JU-GK 34172 korrekt, hier deutet es auf falsche Verlinkung). 'recherche'-geflaggt. Ebenfalls unbestätigt geblieben: JU-Punktwert CHF 1.05 (GK-NV 315/6300 = 300–6000 Punkte × 1.05) — die Punkt-Spannen 300–6000 (Art. 20 lit. a) und Schlichtung 200–1000 (Art. 21 lit. b) sind amtlich bestätigt, nur der Multiplikator 1.05 ist ein datierter Parameter außerhalb des Décrets.

### `src/lib/erbFristen.ts`  (3)

- **[MITTEL · hinweistext]** Hinweis ungueltigkeit_boesglaeubig (30 J, Art. 521 Abs. 2 ZGB), Zeile 105 – zusätzlich als Warnung Zeile 191
  - Norm: Art. 519 Abs. 1 Ziff. 2 ZGB / Art. 520 ZGB (SR 210, Konsolidierung 20260701)
  - Erwartet: Art. 519 Abs. 1 Ziff. 2 = 'mangelhafter Wille' (Willensmangel). Der Formmangel ist NICHT Ziff. 2, sondern ein eigener Ungültigkeitsgrund in Art. 520 ZGB ('II. Bei Formmangel'). Die 30-Jahres-Frist (Art. 521 Abs. 2) ist auf Verfügungsunfähigkeit (Ziff. 1) und Rechtswidrigkeit/Unsittlichkeit (Ziff. 3) beschränkt – ausgeschlossen sind sowohl Willensmangel (Ziff. 2) ALS AUCH Formmangel (Art. 520).
  - Ist: Hinweis lautet '...(Art. 519 Abs. 1 Ziff. 1 und 3 ZGB) – NICHT beim Formmangel (Ziff. 2).' Damit wird Ziff. 2 fälschlich als 'Formmangel' bezeichnet; tatsächlich ist Ziff. 2 der Willensmangel und der Formmangel steht in Art. 520. Falsche Norm-Zuordnung im nutzersichtbaren Rechtshinweis.
  - Notiz: Die praktische Schlussfolgerung (30-J-Frist gilt hier nicht) ist für beide Gründe zufällig richtig, aber die Norm-Aussage 'Formmangel = Ziff. 2' ist sachlich falsch. Fix: 'NICHT beim Willensmangel (Art. 519 Abs. 1 Ziff. 2) und nicht beim Formmangel (Art. 520 ZGB)'. Warnung Zeile 191 ('nicht beim Formmangel') ist für sich korrekt, aber unvollständig (unterschlägt den Ausschluss des Willensmangels).
- **[NIEDRIG · norm-anker]** ausschlagung_gesetzlich (3 Monate) + ausschlagung_eingesetzt (3 Monate), Zeilen 60-70
  - Norm: Art. 567 Abs. 1 vs. Abs. 2 ZGB (SR 210, Konsolidierung 20260701)
  - Erwartet: Die Fristdauer '3 Monate' steht in Art. 567 ABS. 1 ('Die Frist zur Ausschlagung beträgt drei Monate'); Art. 567 Abs. 2 regelt nur den Fristbeginn. Norm-Anker für die 3-Monats-Länge = Art. 567 Abs. 1 (bzw. Art. 567 gesamt).
  - Ist: Beide Presets führen als einzigen Norm-Anker 'Art. 567 Abs. 2 ZGB'. Der Rechenweg zeigt 'Frist 3 Monat(e) ab: ... (Art. 567 Abs. 2 ZGB)' – wer die 3-Monats-Dauer gegen Abs. 2 prüft, findet dort nur den Fristbeginn.
  - Notiz: Länge korrekt (3 Monate), nur Absatz-Anker imprecise. Bei ausschlagung_eingesetzt trifft der Abs.-2-Anker den Trigger korrekt, deckt aber die Länge nicht. Empfehlung: 'Art. 567 ZGB' oder 'Art. 567 Abs. 1 und 2 ZGB'.
- **[NIEDRIG · abdeckungsluecke]** herabsetzung_absolut_verfuegung / herabsetzung_absolut_lebzeitig (10 J, Art. 533 Abs. 1 ZGB), Zeilen 111-120
  - Norm: Art. 533 Abs. 2 ZGB (SR 210, Konsolidierung 20260701)
  - Erwartet: Art. 533 Abs. 2 setzt einen abweichenden Fristbeginn: 'Ist durch Ungültigerklärung einer späteren Verfügung eine frühere gültig geworden, so beginnen die Fristen mit diesem Zeitpunkte.' In dieser Konstellation läuft die 1-/10-Jahres-Frist nicht ab Eröffnung/Tod, sondern ab Rechtskraft der Ungültigerklärung.
  - Ist: Der Katalog modelliert nur die Standard-Trigger (Eröffnung der letztwilligen Verfügung / Tod); der Sonder-Fristbeginn nach Art. 533 Abs. 2 fehlt und ist auch nicht als Warnung offengelegt.
  - Notiz: Enger Sonderfall (wiederauflebende frühere Verfügung). Kein Fristwert falsch; nur nicht abgedeckt. Optionaler §8-Hinweis genügt.

### `src/data/zpoFeiertage.ts`  (3)

- **[MITTEL · norm-anker]** Preset doppelaufruf: 'Doppelaufruf-Begehren – 10 Tage'
  - Norm: Art. 142 Abs. 1 SchKG (Doppelaufruf; 'innert zehn Tagen nach Zustellung des Lastenverzeichnisses'). Art. 141 SchKG regelt den Aufschub der Verwertung bei streitigem Lastenverzeichnis-Anspruch – NICHT den Doppelaufruf.
  - Erwartet: norm: 'Art. 142 Abs. 1 SchKG'
  - Ist: norm: 'Art. 141 SchKG' (schkgPresets.ts Zeile 134)
  - Notiz: Fristwert (10 Tage) und Rechenverhalten korrekt; nur der Artikelverweis ist um eins verschoben. Amtlich verifiziert: SCHKG.json art_142 Abs.1/2 = Doppelaufruf mit 10-Tage-Frist; art_141 = 'Versteigerung aussetzen' bei streitigem Anspruch. Ein Nutzer, der den zitierten Art. 141 nachschlägt, findet die falsche Bestimmung (verstösst gegen §13/D1: Wert mit korrekter Norm).
- **[MITTEL · norm-anker]** Preset teilnahme_pfaendung: 'Teilnahme an Pfändung (Anschluss) – 30 Tage'
  - Norm: Art. 110 Abs. 1 SchKG = 30 Tage (ordentliche Anschlusspfändung). Art. 111 Abs. 1 SchKG = 40 Tage (privilegierter Anschluss ohne vorgängige Betreibung, Ehegatte/Kinder etc.) – andere Frist, andere Institution.
  - Erwartet: Anker nur 'Art. 110 Abs. 1 SchKG' für den 30-Tage-Wert (bzw. Art. 111 als eigenes 40-Tage-Preset)
  - Ist: norm: 'Art. 110/111 SchKG' mit laenge 30 (schkgPresets.ts Zeile 94)
  - Notiz: Amtlich verifiziert: art_110 Abs.1 '30 Tagen', art_111 Abs.1 '40 Tagen'. Die Sammelzitierung 'Art. 110/111' unter einem einzigen 30-Tage-Wert konflatiert zwei verschieden lange Fristen; Abdeckungslücken-Aspekt: die 40-Tage-Frist des privilegierten Anschlusses (Art. 111) ist nirgends als Preset abgebildet und würde bei diesem Preset fälschlich mit 30 Tagen gerechnet.
- **[NIEDRIG · hinweistext]** Rechenweg Schritt 1 (generischer Text) für Monatsfristen
  - Norm: Art. 142 Abs. 2 ZPO i.V.m. BGE 150 III 367 (Praxisänderung 13.8.2024): bei Monats-/Jahresfristen beginnt die Frist am Tag des fristauslösenden Ereignisses (Zustelltag) zu laufen – der Zustelltag zählt hier gerade mit.
  - Erwartet: Für Monats-/Jahresfristen Hinweis, dass der Zustelltag der Anlauftag ist (nicht 'zählt nicht mit')
  - Ist: schkgFristen.ts Zeile 116-118: Schritt-1-Text sagt pauschal 'Der Tag der Zustellung wird nicht mitgezählt (Art. 31 SchKG i.V.m. Art. 142 Abs. 1 ZPO)', auch bei Monatsfristen
  - Notiz: ERGEBNIS IST KORREKT: diesAQuo wird für Kalenderfristen = Ereignistag gesetzt und addMonths(ereignis,N) trifft exakt den gleichbezeichneten Tag gemäss BGE 150 III 367 (Repro F: 31.1.->28.2. korrekt; Repro E/G korrekt). Nur der generische Begründungssatz (Tagesfrist-Regel Abs.1) ist bei Monatsfristen leicht ungenau formuliert; kein Wertfehler.

### `src/lib/kuendigungsfrist.ts`  (3)

- **[MITTEL · wertfehler]** abweichendeFristMonate = 0.5 (GAV, 1. Dienstjahr, ME=false): VB 2020-06-15, Zugang 2021-03-15 → Beendigung 2021-03-15 (0-Tage-Frist). Auch 1.5/2.5 Mt: der halbe Monat wird verschluckt (addMonths(2021-03-15, 1.5) = 2021-04-15 statt ~30.4.).
  - Norm: Art. 335c Abs. 2 OR (OR-Cache 20260101): «unter einen Monat dürfen sie jedoch nur durch Gesamtarbeitsvertrag und nur für das erste Dienstjahr herabgesetzt werden» — die sub-monatliche Frist ist der einzige gesetzlich vorgesehene <1-Monats-Fall; die UI (VorlageKuendigungArbeitgeber.tsx:162, input step=0.5) gibt genau solche Werte in die Engine.
  - Erwartet: Bei abweichendeFristMonate=0.5 im 1. DJ mit GAV eine echte Halbmonats-/2-Wochen-Frist (~15 Tage; ME=false ≈ 2021-03-30). Bei 1.5 Mt: 1 Monat + halber Monat.
  - Ist: date-fns addMonths trunkiert die Nachkommastelle (setMonth(month+0.5)→+0). fristLaufende = addMonths(zugang, 0.5) = Zugang selbst → ME=false: Ende = Zugang = 0-Tage-Frist; ME=true: zufällig Monatsende 31.3. Bei 1.5/2.5 wird der halbe Monat lautlos gedroppt. fristMonate wird zwar 0.5 angezeigt, aber das Beendigungsdatum ist falsch.
  - Notiz: Über die Arbeitgeber-Vorlage real erreichbar (Zahl-Input step=0.5 + GAV-Checkbox + 1.-DJ-Fall). Monate werden als einzige Zeiteinheit modelliert; der <1-Mt-GAV-Pfad (Code-Zweig existiert für diese Norm) und jede .5-Eingabe liefern ein rechtlich falsches Beendigungsdatum. Fix z. B. ganze Monate via addMonths + Rest als addDays(Bruchteil·Tage) ODER Nicht-Ganzzahlen ablehnen. NICHT gefixt/quittiert.
- **[MITTEL · wertfehler]** Probezeitkündigung 7 Tage: Zugang 2024-04-01 → Engine beendigungsdatum 2024-04-07; Zugang 2024-04-10 → 2024-04-16
  - Norm: Art. 335b Abs. 1 OR i.V.m. Art. 77 Abs. 1 Ziff. 3 OR (OR-Cache Stand 2026-01-01, https://www.fedlex.admin.ch/eli/cc/27/317_321_377/de#art_335_b)
  - Erwartet: Letzter Arbeitstag = Zugang + 7 Tage, da der Zugangstag nach Art. 77 Abs. 1 Ziff. 3 OR nicht mitgerechnet wird und 7 volle Tage laufen: 2024-04-08 bzw. 2024-04-17
  - Ist: Engine liefert Zugang + 6 Tage: 2024-04-07 bzw. 2024-04-16 (systematisch einen Tag zu früh; beendigungsdatum ist ausweislich der Monats-Fälle der letzte Arbeitstag, also gleiche Semantik wie z.B. 07-31)
  - Notiz: Betrifft JEDE Probezeitkündigung (der Probe-Pfad nutzt immer die Nicht-Monatsende-Berechnung). Gleiche Wurzel wie der monatsende=false-Befund: Endtermin wird als (Zugang+Frist)−1 Tag gebildet. Standard-Praxisbeispiel: Zugang Montag → Frist läuft ab Dienstag, endet folgenden Montag = Zugang+7.
- **[NIEDRIG · wertfehler]** Ordentliche Frist bei kuendigungsterminMonatsende=false: Zugang 2020-02-15, 1 Mt → Engine 2020-03-14; Zugang 2020-05-01, 1 Mt → Engine 2020-05-31
  - Norm: Art. 335c Abs. 1/2 OR i.V.m. Art. 77 Abs. 1 Ziff. 3 OR (OR-Cache Stand 2026-01-01, #art_335_c)
  - Erwartet: Letzter Arbeitstag = Tag, der durch seine Zahl dem Zugangstag entspricht, einen Monat später: 2020-03-15 bzw. 2020-06-01 (z.B. Zugang 15.3., 1 Mt ⇒ Ende 15.4.)
  - Ist: Engine liefert (Zugang + 1 Monat) − 1 Tag: 2020-03-14 bzw. 2020-05-31 — je einen Tag zu früh
  - Notiz: Nur bei abweichender Abrede ohne Monatsende-Terminus (Art. 335c Abs. 2). Im gesetzlichen Default (kuendigungsterminMonatsende=true) durch endOfMonth() maskiert und dort korrekt — auch bei Zugang am 1. (F1: 05-01→06-30) und am Monatsletzten (F5: 04-30→05-31).

### `src/data/mietTermine.ts`  (2)

- **[MITTEL · norm-anker]** ORTSUEBLICHE_TERMINE.GE = { typ: 'keine' } + Warnung «Genf kennt keine ortsüblichen Kündigungstermine»
  - Norm: Art. 266c OR (auf ortsüblichen Termin, sonst Ende dreimonatiger Mietdauer); Ortsgebrauch = Tatfrage
  - Erwartet: Mehrere Sekundärquellen (flatfox.ch «Résiliation: dates officielles», juriup.ch) nennen für Genf Quartals-Termine 31.3./30.6./30.9./(31.12.). Ortsgebrauch entweder belegt kodieren oder 'keine' mit amtlichem Beleg (Chambre des baux GE) absichern.
  - Ist: Code stuft GE als 'keine' ein → Rückfall auf gesetzliche Auffangregel (Ende einer dreimonatigen Mietdauer ab Mietbeginn) und behauptet in der Warnung faktisch, Genf habe keine ortsüblichen Termine. Bei nicht quartals-ausgerichtetem Mietbeginn (z.B. 15.1.) liefert die Auffangregel Termine (14.4./14.7. …), die von der behaupteten Genfer Praxis abweichen; Warntext wäre dann sachlich falsch.
  - Notiz: PLAUSIBEL, nicht CONFIRMED: kein amtlicher GE-Primärbeleg (ASLOCA-GE-Seite schweigt) — Sekundärquellen widersprechen dem Code. Bei quartals-ausgerichtetem Mietbeginn deckt sich das Ergebnis zufällig (Lauf GE Mietbeginn 1.1. → 30.6.). In-Code-Kommentar mahnt bereits «vor Produktiveinsatz gegen kantonale Praxis abgleichen».
- **[NIEDRIG · abdeckungsluecke]** ORTSUEBLICHE_TERMINE.VD = { typ: 'unbekannt', hinweis: '… 1. April / 1. Juli / 1. Oktober …' }
  - Norm: Art. 266c/266d OR; Ortsgebrauch Waadt
  - Erwartet: Mehrere Quellen (flatfox, juriup, guidesocial NE-Fiche) fassen VD/FR/VS/JU/NE einheitlich mit 31.3./30.6./30.9. zusammen; die Waadtländer Usanz «1er avril/1er juillet/1er octobre» (= Tag nach Quartalsende) ist dokumentiert. VD könnte belegt als monatsenden [3,6,9] (bzw. als Sonderusanz mit korrektem Datum) kodiert werden.
  - Ist: VD bleibt 'unbekannt' → gesetzliche Auffangregel + Warnung. Sicher (kein stiller Fehlwert), aber die identisch behandelten Nachbarkantone divergieren im Code (NE asserted [3,6,9], VD unbekannt) trotz gleicher Quellenlage — Abdeckungslücke.
  - Notiz: Kein Fehlwert: Engine warnt und rechnet konservativ. Nur bei nicht quartals-ausgerichtetem Mietbeginn weicht das Auffang-Ergebnis von der VD-Usanz ab.

### `src/data/lohnfortzahlungSkalen.ts`  (2)

- **[MITTEL · wertfehler]** Berner Skala: DJ12=5 Monate, DJ13=5, DJ14=5, DJ17=6, DJ18=6, DJ19=6 (Ist, per Engine-Lauf bestaetigt)
  - Norm: Art. 324a Abs. 2 OR, konkretisiert durch die etablierte Berner Skala (Gerichtspraxis): 10.-14. DJ = 4 Monate, 15.-19. DJ = 5 Monate, 20.-24. DJ = 6 Monate; bestaetigt zurich.ch (Lohnfortzahlung-krankheit), hr-onboarding.ch, bf-solutions.ch, magicheidi.ch
  - Erwartet: DJ12/13/14 -> 4 Monate; DJ15/16 -> 5 Monate; DJ17/18/19 -> 5 Monate; DJ20-24 -> 6 Monate
  - Ist: src/data/lohnfortzahlungSkalen.ts Z.49-50: dienstjahrVon:12,bis:16 -> 5 Monate; von:17,bis:null -> 6 Monate. Damit DJ12-14 um +1 Monat und DJ17-19 um +1 Monat ueberschaetzt; die 4-Monats-Bandbreite (10.-14. DJ) ist auf 10.-11. DJ verkuerzt, alle Baender nach oben verschoben. Betrifft die 19 der Berner Skala zugeordneten Kantone (BE, AG, AI, AR, FR, GE, GL, JU, LU, NE, NW, OW, SG, SO, SZ, TI, UR, VD, VS).
  - Notiz: Innerhalb des in der SHK-Tabelle belegten Bereichs (DJ1-11) ist die Berner Skala korrekt (DJ10/11 = 4 Monate bestaetigt). Die Fehler liegen ausschliesslich in der Fortschreibung ab DJ12, fuer die der Code eine Warnung 'nicht belegt (verifiziert:false)' ausgibt (lohnfortzahlung.ts Z.227-231) — der konkret ausgegebene Monatswert ist aber falsch und ueberschaetzt die Arbeitgeberpflicht. Korrektur: Baender auf 10.-14.=4, 15.-19.=5, 20.-24.=6 (ggf. 25.-29.=7) setzen.
- **[NIEDRIG · abdeckungsluecke]** Basler Skala DJ21+ = 6 Monate; Berner Skala DJ20+ = 6 Monate (Deckelung)
  - Norm: Art. 324a Abs. 2 OR / etablierte Skalen. Teil der Lehre (Streiff/von Kaenel, Arbeitsvertrag, Art. 324a) fuehrt die Baender fort: Basler 26.-30. DJ = 7 Monate, Berner 25.-29. DJ = 7 Monate (+1 Monat je 5 Jahre)
  - Erwartet: Fuer sehr lange Dienstverhaeltnisse (Basler ab DJ26, Berner ab DJ25) potentiell 7+ Monate
  - Ist: Beide Skalen sind bei 6 Monaten gedeckelt (SKALA_BASEL Z.30 von:21,bis:null; SKALA_BERN Z.50 von:17,bis:null). Fuer DJ26 (BS) und DJ25 (BE) liefert die Engine 6 Monate statt ggf. 7.
  - Notiz: Liegt komplett im geflaggten >11.-DJ-Bereich. Deckelung bei 6 Monaten ist teilweise vertretbar: zurich.ch und hr-onboarding.ch decken Berner/Basler ebenfalls bei 6 Monaten. Kein klarer Wertfehler, aber Unterschaetzung fuer seltene Langdienst-Faelle; bei Bedarf an Praezision fuer >20 DJ gegen kantonale Praxis/Streiff verifizieren.

### `zustaendigkeit.ts`  (2)

- **[MITTEL · norm-anker]** «Urteilsvorschlag» (Fahrplan Z.53)
  - Norm: Art. 210 ZPO Marginalie «Entscheidvorschlag» + Art. 202 Abs. 4 ZPO Fn. 133 («Ausdruck gemäss BG 17.3.2023, in Kraft 1.1.2025»)
  - Erwartet: Amtlicher/geltender Begriff = «Entscheidvorschlag» — die Revision 2023 hat den Ausdruck «Urteilsvorschlag» erlassweit durch «Entscheidvorschlag» ersetzt
  - Ist: Fahrplan-Text Z.53 verwendet den aufgehobenen Vorrevisions-Begriff «Urteilsvorschlag»; die Engine (zustaendigkeit.ts Z.495) und Fedlex verwenden korrekt «Entscheidvorschlag» → Inkonsistenz + veralteter Norm-Begriff. Auch der Schritt-Titel Z.56/60 unberührt.
  - Notiz: Norm-Anker Art. 210 ZPO selbst ist richtig, nur die Bezeichnung ist überholt. Auf «Entscheidvorschlag» ziehen (Stand 1.1.2025).
- **[NIEDRIG · norm-anker]** Auftrags-Prämisse «Art. 210 Abs. 1 lit. c bis 5000» ist veraltet — refutiert
  - Norm: Art. 210 Abs. 1 lit. c ZPO (SR 272), Fassung BG 17.3.2023 in Kraft 1.1.2025, AS 2023 491: «den übrigen vermögensrechtlichen Streitigkeiten bis zu einem Streitwert von 10 000 Franken»
  - Erwartet: Aktuelle Schwelle Entscheidvorschlag = CHF 10 000 (nicht 5000)
  - Ist: Engine zustaendigkeit.ts Z.50 ENTSCHEIDVORSCHLAG=10_000 mit Kommentar «Revision 2025: vorher 5'000» — der Wert ist KORREKT und aktuell; die im Auftrag genannten 5000 sind der aufgehobene Vorrevisions-Wert. Kein Wertfehler im Code.
  - Notiz: Ehrliche Widerlegung: hier ist der Code richtig, die Auftrags-Annahme falsch. Art. 212 Abs. 1 = 2000 stimmt in beiden. §7-Abweichung offengelegt.

### `src/data/zustaendigkeitKosten.ts`  (1)

- **[MITTEL · hinweistext]** SG — hinweis auf schlichtung/gericht/nichtVermoegensrechtlich: 'GKV in Vollzug nur bis 30.6.2026 — ab 1.7.2026 Nachfolgefassung prüfen!' (Z. 159, 161), 'GKV endet 30.6.2026' (Z. 160) + Header-Kommentar 'SG GKV endet 30.6.2026!' (Z. 15)
  - Norm: GKV sGS 941.12, current_version 3863 (II. Nachtrag vom 5.12.2025), in Vollzug seit 1.7.2026; LexWork-API texts_of_law/941.12 abrogated=false; Abruf 2.7.2026
  - Erwartet: Sunset-Hinweis am 2.7.2026 obsolet: Nachfolgefassung v3863 ist seit 1.7.2026 in Vollzug, sGS-Nummer unverändert, Beträge Art. 8/10/11 wortgleich zur Vorfassung → Hinweis entfernen bzw. auf 'Fassung 1.7.2026 (v3863) verifiziert' aktualisieren; erlass-Anker 'GKV ... sGS 941.12' bleibt korrekt
  - Ist: Datei warnt weiterhin, die GKV ende 30.6.2026 bzw. die Nachfolgefassung sei ab 1.7.2026 erst zu prüfen — am 2.7.2026 abgelaufen; der user-sichtbare gericht-Hinweis 'GKV endet 30.6.2026' stellt den weiterhin gültigen Tarif CHF 500–6'000 fälschlich als ausgelaufen dar
  - Notiz: KEIN Wertfehler und KEINE Abdeckungslücke: alle SG-Beträge unabhängig gegen die amtliche v3863-PDF geprüft und korrekt. Register bibliothek/register/parameter-verfall.md (Z. 61-93) hat die Currency bereits 1.7.2026 als aufgelöst dokumentiert; nur der Data-File-Hinweis + Header-Kommentar wurden nicht nachgezogen. stand '5.6.2026' könnte optional auf die v3863-Verifikation aktualisiert werden.

### `src/lib/gebvKosten.ts`  (4)

- **[NIEDRIG · abdeckungsluecke]** Art. 16 Abs. 4 — CHF 5 für Eintragung eines vor Ausfertigung des Zahlungsbefehls zurückgezogenen Betreibungsbegehrens (forderungsunabhängig)
  - Norm: Art. 16 Abs. 4 GebV SchKG (SR 281.35, Stand 1.1.2026)
  - Erwartet: Wählbarer Tatbestand «zurückgezogenes Begehren vor Ausfertigung» → CHF 5 fix
  - Ist: Nicht als Eingabeoption vorhanden; berechneBetreibungskosten kennt beim Zahlungsbefehl nur Grundgebühr + weitereAusfertigungen + zustellversuche
  - Notiz: Kein Wertfehler — der Tatbestand fehlt schlicht. Randfall; für einen Kostenrechner der Hauptschritte vertretbar, aber der amtliche CHF-5-Fixbetrag ist nicht abbildbar.
- **[NIEDRIG · abdeckungsluecke]** Art. 20 Abs. 4 — CHF 5 Protokollierung des Fortsetzungsbegehrens, das infolge Zahlung/Rückzug/Einstellung/Aufhebung zu keiner Pfändung führt
  - Norm: Art. 20 Abs. 4 GebV SchKG (SR 281.35, Stand 1.1.2026)
  - Erwartet: Pfändungs-Ausgang «keine Pfändung (erledigt vor Vollzug)» → CHF 5 fix
  - Ist: pfaendung.ausgang-Enum bietet nur 'vollzogen' | 'fruchtlos' | 'erfolglos'; der Abs.-4-Ausgang fehlt
  - Notiz: Kein Wertfehler; die drei vorhandenen Ausgänge (vollzogen=Staffel, fruchtlos=½ mind. 10, erfolglos=10) sind je korrekt gegen Abs. 1/2 verifiziert.
- **[NIEDRIG · abdeckungsluecke]** Art. 30 Abs. 7 — CHF 5 Eintragung des Verwertungsbegehrens, wenn Verwertung infolge Zahlung/Rückzug/Einstellung nicht durchgeführt wird
  - Norm: Art. 30 Abs. 7 GebV SchKG (SR 281.35, Stand 1.1.2026)
  - Erwartet: Verwertungs-Ausgang «nicht durchgeführt» → CHF 5 fix
  - Ist: berechneBetreibungskosten kennt bei verwertung nur Erlös bzw. keinErwerber; der Abs.-7-Fall (CHF 5) fehlt
  - Notiz: Kein Wertfehler. Konsistent mit den ebenfalls nicht abgebildeten Abs.-4-Restfixgebühren.
- **[NIEDRIG · hinweistext]** Rundung der Promille-Bänder (Art. 19 5‰, Art. 30 2‰) auf 2 Dezimalstellen (round2)
  - Norm: Art. 19 Abs. 1 / Art. 30 Abs. 1 GebV SchKG (SR 281.35)
  - Erwartet: GebV schreibt für diese Bänder keine Rundung vor; round2 kann rappengenaue, nicht 0.05-teilbare Beträge erzeugen (z. B. 5‰ von 1234.56 = CHF 6.17)
  - Ist: Math.round(n*100)/100 — Hauskonvention; ob amtlich auf 0.05 zu runden wäre, ist am Fundort bereits als offene Grundsatzfrage für David offengelegt (Kommentar Z. 35-38, HANDLUNGSPLAN A.4)
  - Notiz: Norm ist stumm zur Rundung; bereits im Code deklariert. Kein Widerspruch zur amtlichen Fassung, nur Konventionsfrage — nicht fixbedürftig ohne Davids Entscheid.

### `src/lib/sperrfristen.ts`  (3)

- **[NIEDRIG · abdeckungsluecke]** Arbeitnehmerkündigung: kategorische Ausgabe «Bei Arbeitnehmerkündigung keine Sperrfristen und keine Hemmung» (T6)
  - Norm: Art. 336d OR (SR 220, Fedlex Kons. 20260101): AN darf nach Probezeit nicht kündigen, wenn ein Vorgesetzter/AG unter den Voraussetzungen von Art. 336c Abs. 1 lit. a verhindert ist und der AN dessen Tätigkeit zu übernehmen hat; Abs. 2 erklärt Art. 336c Abs. 2 und 3 als entsprechend anwendbar
  - Erwartet: Für den (engen) 336d-Fall müsste die Aussage differenziert sein — bei AN-Kündigung existiert eine Sperrfrist-Konstellation (Vorgesetzter im Militärdienst, den der AN vertritt)
  - Ist: Engine schliesst 336c pauschal aus und erwähnt 336d nicht; der 336d-Tatbestand (Verhinderung eines Vorgesetzten) ist im Sperrereignis-Modell gar nicht abbildbar
  - Notiz: Praktisch seltener Randfall; die pauschale UI-Aussage ist jedoch zu absolut (§8). Empfehlung: Text auf «Art. 336c gilt nur für AG-Kündigungen; der eng begrenzte Sondertatbestand Art. 336d bleibt unberücksichtigt» präzisieren.
- **[NIEDRIG · hinweistext]** Krankheit: sperrtage.beansprucht (Art.-77-Zählung, ohne +1) vs. gehemmtTage (kalenderinklusiv, +1) weichen je Ereignis um 1 Tag ab (T4: beansprucht 15, gehemmt 16; T11: 10+9=19 vs. 21)
  - Norm: Art. 336c Abs. 1 lit. b i.V.m. Art. 77 OR (Anfangstag) und Abs. 2 (Hemmung um die Sperrfrist-Dauer)
  - Erwartet: Konsistente bzw. für den Nutzer erklärte Zählung — die gehemmt=16 (inklusive Standstill-Dauer) ist rechnerisch korrekt, aber der daneben angezeigte Zähler 15 kann verwirren
  - Ist: Zwei unterschiedliche, je für sich vertretbare Zählweisen (Kontingent-Verbrauch Art. 77 = 15; Frist-Standstill kalenderinklusiv = 16) werden ohne Erläuterung nebeneinander ausgewiesen
  - Notiz: KEIN Wertfehler: die gehemmt-Dauer (+N inklusive) ist als Standstill korrekt (mit 10-Tage-Frist-Gegenbeispiel bewiesen). Nur Anzeige-Klarheit — die Differenz kurz offenlegen.
- **[NIEDRIG · norm-anker]** B2-Wiederaufleben («zweite Konstellation»): Sperrfrist vor Jahrestag aufgebraucht, AUF dauert an → erneuter Unterbruch am Jahrestag mit neuem Kontingent (T9: 91 Hemmungstage, Folge-Intervall 2025-01-01–2025-04-01)
  - Norm: Art. 336c Abs. 1 lit. b und Abs. 2 OR; Engine zitiert BGE 133 III 517 «zweite Konstellation, zu verifizieren»
  - Erwartet: BGE 133 III 517 trägt gesichert die Hauptkonstellation (Kontingent-Upgrade bei DJ-Wechsel während laufender Frist); das Wiederaufleben nach bereits erschöpfter kürzerer Frist ist höchstrichterlich nicht gesichert
  - Ist: Engine rechnet das Wiederaufleben als gültige Hemmung, legt die Unsicherheit aber offen (Rechenweg C3a «zu verifizieren» + §8-Warnung bei Zugang im Folge-Intervall)
  - Notiz: Deklarierte, von David abgenommene fachliche Auslegung (10.6.2026) mit §8-Offenlegung — kein Wertfehler; nur Awareness, dass der Norm-Anker BGE 133 III 517 für diese zweite Konstellation nicht tragfest ist.

### `src/data/verfallTermine.generated.ts`  (3)

- **[NIEDRIG · hinweistext]** Task-Prämisse «ortsübliche Verfalltermine … speist Kündigungs-/Mietfristen»
  - Norm: Datei-Kommentar Z.3–4 («Tagesbezug erst in der Anzeige-Schicht») + Konsumenten-Grep (einziger Import: src/components/VerfallUebersicht.tsx; nichts in src/lib/)
  - Erwartet: Datei ist reine Anzeige-Datenquelle des Pflege-/Verfallskalenders (Methodik-Seite), speist keine Rechen-/Fristen-Engine
  - Ist: Bestätigt: display-only. Task-Charakterisierung als Frist-Input ist unzutreffend — für Severity-Triage relevant (kein Wert fliesst in eine Nutzer-Rechnung)
  - Notiz: Kein Bug in der Datei; Klarstellung des Risikoprofils gegenüber der Auftragsannahme.
- **[NIEDRIG · abdeckungsluecke]** parseZelle wählt das FRÜHESTE Datum aus allen Treffern (Form1 DD.MM.YYYY + Form2 Monat/Jahr), treffer.sort()[0]
  - Norm: scripts/verfall-parse.ts Z.38–52
  - Erwartet: Nur der Prüf-Termin der Zelle wird abgeleitet
  - Ist: Enthielte eine «Nächste Prüfung»-Zelle je einmal ein früheres (z.B. Nachfolge-)Datum UND einen späteren Prüfmonat, würde das frühere (falsche) gewählt. AKTUELL keine Live-Zelle mit Mehrfach-Datum betroffen → kein Wertfehler, nur latente Fragilität
  - Notiz: Freitext-«bis» ist davon nicht betroffen (eigener Regex greift nur das Datum nach «bis»).
- **[NIEDRIG · norm-anker]** GR Honorarverordnung (HV, BR 310.250) & BE EAV (BSG 168.711): «bis 31.12.2026» → 2026-12-31
  - Norm: OrdoLex-API current_version-Metadaten; Register-Doppelcheck 5.6.2026 (nicht Fedlex-Bundesquelle)
  - Erwartet: Unabhängige Live-Bestätigung der Sunset-Daten gegen die amtliche kantonale Fassung (fr.ch/be.ch)
  - Ist: In diesem Gegenprüfungs-Pass NICHT live gegen die Kantonsquelle nachgeprüft (Reminder-Datum, kein Rechenwert; Register trägt Stand 5.6.2026)
  - Notiz: Ehrlich offengelegt: Web-Verifikation der beiden kantonalen Reminder-Daten hier nicht durchgeführt, da display-only und geringes Risiko.

### `src/lib/streitwert.ts`  (2)

- **[NIEDRIG · abdeckungsluecke]** streitwertGrenzwerte() — fehlendes Regime «Berufung» (Zulässigkeitsschwelle CHF 10'000)
  - Norm: Art. 308 Abs. 2 ZPO (SR 272): «In vermögensrechtlichen Angelegenheiten ist die Berufung nur zulässig, wenn der Streitwert der zuletzt aufrechterhaltenen Rechtsbegehren mindestens 10 000 Franken beträgt.» — https://www.fedlex.admin.ch/eli/cc/2010/262/de, Stand 1.7.2026 (Filestore-XML 20260701, amtlich extrahiert)
  - Erwartet: Grenzwert-Liste mit drei Regimes: ZPO-Verfahrensart (30'000), Berufung ZPO (≥ 10'000), BGG-Beschwerde (15'000/30'000) — bei Streitwert 9'999 müsste sichtbar sein, dass auch die Berufung ausscheidet
  - Ist: Nur zwei Regimes (zpo-verfahrensart, bgg-beschwerde-zivil); die 10'000-Schwelle erscheint nirgends («Berufung» kommt in streitwert.ts und RechnerStreitwert.tsx nicht vor); Art. 308 Abs. 2 wird nur als Zeitpunkt-Annahme («zuletzt aufrechterhaltene Rechtsbegehren») zitiert
  - Notiz: Reine Abdeckungslücke, KEIN falscher Wert — alle ausgegebenen Werte/Schwellen sind korrekt. Nutzer, der die Rechtsmittel-Schwellen abliest, verpasst aber die Berufungsgrenze. Kein Fix vorgenommen (Auftrag: nur melden).
- **[NIEDRIG · hinweistext]** Kapitalwert bei bestimmter Dauer > 20 Jahre: z.B. 10 000 × 30 = 300 000
  - Norm: Art. 92 Abs. 1 u. 2 ZPO (SR 272): Abs. 2 setzt für ungewisse/unbeschränkte Dauer den Kapitalwert auf den 20-fachen Jahresbetrag
  - Erwartet: Warnung sollte offenlegen, dass die ungeschmälerte Summe (300 000) den ×20-Deckel für unbestimmte Dauer (200 000) ÜBERSTEIGT — nach h.L. (BSK/DIKE ZPO Art. 92) gilt der ×20-Wert als Obergrenze auch für lange bestimmte Dauern, sonst hätte die bestimmte Forderung einen höheren Streitwert als die unbeschränkte
  - Ist: Engine gibt 300 000 aus; die vorhandene Warnung (Zeile 97) thematisiert nur die Barwert-Abdiskontierung, NICHT die ×20-Deckelungsfrage
  - Notiz: Kein Wertfehler: die Summierung ist eine vertretbare Wortlaut-Lesart von «Kapitalwert» (Abs. 1) und wird bereits als «zu verifizieren» geflaggt (§8). Lücke ist nur, dass der Hinweis den bekannten Deckelungs-Einwand für Dauern >20 Jahre nicht nennt. Ergänzung: Warntext um die ×20-Cap-Frage erweitern.

### `(unklar)`  (2)

- **[NIEDRIG · hinweistext]** Art. 335c Abs. 3 OR — Verlängerung um nicht bezogene Urlaubstage: taggenau über den Monatsende-Termin hinaus (Zugang 15.3. + 2 Mt + 10 T. → 10.6.), keine Erstreckung auf das nächste Monatsende
  - Norm: Art. 335c Abs. 3 OR i.V.m. Art. 329g OR, https://www.fedlex.admin.ch/eli/cc/27/317_321_377/de (Konsolidierung 1.1.2026): «so wird die Kündigungsfrist um die noch nicht bezogenen Urlaubstage verlängert» — zur Termin-Frage schweigt das Gesetz
  - Erwartet: Rechtslage nicht höchstrichterlich entschieden: Teil der Lehre wendet Art. 336c Abs. 3 OR analog an (Erstreckung auf den nächstfolgenden Endtermin), Teil rechnet taggenau
  - Ist: Engine rechnet taggenau und legt die Annahme in den `annahmen` explizit offen (Quelle SHK-Abgleich dokumentiert am Fundort)
  - Notiz: Kein Rechenfehler — vertretbare, offengelegte Auslegungswahl; bei Monatsende-Analogie wäre das Ende später (nutzerfreundlich-konservativ ist die taggenaue Variante NICHT für den Arbeitnehmer). Für die spätere Abnahme-Welle vormerken.
- **[NIEDRIG · wertfehler]** Feiertagsmatrix (Endverschiebung Art. 142 Abs. 3 ZPO / Art. 78 OR / Art. 45 BGG): Datenbasis BJ/EJPD-Liste Stand 1.1.2011
  - Norm: BJ-Liste gestützt auf Art. 11 des Europäischen Übereinkommens über die Berechnung von Fristen, SR 0.221.122.3, https://www.fedlex.admin.ch/eli/cc/1983/905_905_905/de; massgeblich bleibt das jeweils aktuelle kantonale Feiertagsrecht
  - Erwartet: Aktuelles kantonales Feiertagsrecht je Gerichtsort (26 kantonale Erlasse, Stand 2026)
  - Ist: Matrix nach BJ-Liste 2011 (Doppelcheck 6.6.2026 dokumentiert, Stichproben hier alle korrekt inkl. bedingter Fussnoten-Tage); der 2011-Vorbehalt wird in Engine-Annahmen offengelegt
  - Notiz: Kein konkreter Fehler gefunden (alle 20 Stichproben inkl. NE-/UR-/AR-/AI-Fussnotenregeln und GL-Fahrts-Verschiebung 2026 korrekt); Rest-Risiko = seit 2011 geänderte kantonale Feiertagsgesetze — als Verfallsregister-Kandidat führen, nicht als Bug.

### `beurkundungZusatzkosten.ts`  (2)

- **[NIEDRIG · abdeckungsluecke]** VS Pfandsteuer satzProzent 0.2 (beurkundungZusatzkosten.ts:88) — reine Proportional-Berechnung wertChf*0,2% ohne Sockel/Band
  - Norm: Art. 16 al. 1 LDM (RS 643.1, état 01.01.2013): lit. a) 20 francs pour valeurs 1'001–20'000; lit. b) 0.2% dès 20'001
  - Erwartet: Pfandsummen 1'001–20'000 Fr.: fester Betrag 20 Fr. (lit. a). Erst ab 20'001 Fr. gilt 0,2% (lit. b). Unter 1'001 Fr.: fester Betrag (Art. 17).
  - Ist: Code rechnet 0,2% auf die gesamte Pfandsumme ohne Band/Sockel; fuer Pfandsummen 1'001–20'000 zu hoch (z.B. 20'000 Fr.: Code 40 Fr. statt gesetzlich 20 Fr., ~2x)
  - Notiz: Kantenfall: Schuldbriefe liegen meist ueber 20'000; Betrag ist Zusatzkosten-Anzeige. Zitat 'Art. 16 lit. b' ist korrekt fuer den 0,2%-Teil, aber lit.-a-Band + Art.-17-Sockel fehlen im Modell.
- **[NIEDRIG · abdeckungsluecke]** JU Pfandsteuer satzProzent 0.35 (beurkundungZusatzkosten.ts:84) — ohne Mindestbetrag
  - Norm: Art. 13 al. 1 RSJU 215.326.2: 'Les droits seront de 3,5 ‰ du montant ... et de 30 francs au moins'
  - Erwartet: Satz 3,5‰ (=0,35%, korrekt) MIT Mindestbetrag 30 Fr.
  - Ist: Code ohne 30-Fr.-Floor; fuer Pfandsummen unter ~CHF 8'571 wird der Mindestbetrag unterschritten (z.B. 5'000 Fr.: Code 18 Fr. statt 30 Fr.)
  - Notiz: Satzwert selbst sauber; nur der gesetzliche Sockel 30 Fr. fehlt. Analog VS-Sockel.

### `src/lib/bggVwvgFristen.ts`  (2)

- **[NIEDRIG · norm-anker]** BGG-Endverschiebung, annahmen-Text: «Endverschiebung nach Art. 45 Abs. 1 BGG: massgebend sind die Feiertage am Wohnsitz/Sitz der Partei» (Zeile 95 werktagNorm='Art. 45 Abs. 1 BGG' + Zeilen 149-152 annahmen-Satz)
  - Norm: Art. 45 BGG (SR 173.110): Abs. 1 = Werktagsverschiebung; Abs. 2 = «Massgebend ist das Recht des Kantons, in dem die Partei oder ihr Vertreter beziehungsweise ihre Vertreterin den Wohnsitz oder den Sitz hat.» (Fedlex Konsolidierung 20260401)
  - Erwartet: Die Wohnsitz/Sitz-Massgeblichkeit gehört zu Art. 45 Abs. 2 BGG; korrekt wäre «Art. 45 BGG» bzw. «Art. 45 Abs. 1 und 2 BGG» (Abs. 1 Werktag, Abs. 2 massgebendes kantonales Recht).
  - Ist: Der Satz mit der Wohnsitz/Sitz-Aussage wird ausschliesslich unter «Art. 45 Abs. 1 BGG» zitiert — der Absatz, der diese Aussage NICHT enthält (sie steht in Abs. 2). Undercitation/Fehl-Absatz.
  - Notiz: Kein Rechenfehler — das berechnete Fristende ist in allen Läufen korrekt. Reine Absatz-Präzision im Hinweistext. Kontrast VwVG: dort korrekt, weil Art. 20 Abs. 3 VwVG BEIDE Sätze (Werktag + Wohnsitz/Sitz) in EINEM Absatz enthält (amtlich verifiziert); bei BGG sind sie auf Abs. 1/Abs. 2 verteilt.
- **[NIEDRIG · norm-anker]** BGG-Zweig: normen=["Art. 46 Abs. 1 BGG","Art. 45 Abs. 1 BGG"] + annahme-Text «Endverschiebung nach Art. 45 Abs. 1 BGG: massgebend sind die Feiertage am Wohnsitz/Sitz der Partei»
  - Norm: Art. 45 BGG (SR 173.110, Konsolidierung 20260401): Abs. 1 = Werktagsverschiebung («Ist der letzte Tag der Frist ein Samstag, ein Sonntag oder ein … anerkannter Feiertag, so endet sie am nächstfolgenden Werktag»); Abs. 2 = «Massgebend ist das Recht des Kantons, in dem die Partei oder ihr Vertreter … den Wohnsitz oder den Sitz hat.» (am amtlichen Filestore-HTML als zwei getrennte Absätze verifiziert)
  - Erwartet: Die Wohnsitz/Sitz-Massgeblichkeit im BGG-Zweig unter Art. 45 Abs. 2 BGG zitieren (Abs. 1 trägt nur die Werktagsverschiebung). Anders als beim VwVG: dort steht beides zu Recht in Art. 20 Abs. 3 VwVG — die VwVG-Zitierung ist korrekt.
  - Ist: meta.werktagNorm='Art. 45 Abs. 1 BGG' wird sowohl in normen[] als auch im annahme-Satz verwendet und die Wohnsitz/Sitz-Aussage daran gehängt; Art. 45 Abs. 2 BGG wird nirgends genannt. Norm-Anker damit für die Kantons-/Wohnsitz-Massgeblichkeit im BGG-Zweig unvollständig (Verstoss gegen Daueranweisung «jeder Wert mit präzisem Norm-Anker»). Kein Datumsfehler — alle berechneten Fristenden bleiben korrekt.
  - Notiz: Fix betrifft nur Label/Hinweistext (REGIME.bgg.werktagNorm bzw. den annahme-String), nicht die Rechenlogik; golden-neutral prüfbar. VwVG-Seite nicht betroffen.

### `src/lib/notariatsgebuehrenGruendung.ts`  (2)

- **[NIEDRIG · abdeckungsluecke]** ZH Gründungsgebühr für revisionspflichtige/Publikumsgesellschaften (z. B. Kapital 10 Mio.)
  - Norm: NotGebV ZH (LS 243) Ziff. 4.4.3.1, Nachtrag 123, Stand 1.1.2024 — Rahmen «grössere Unternehmen Art. 727 Abs. 1 Ziff. 2/3 OR» 500–8000, «Publikumsgesellschaften Art. 727 Abs. 1 Ziff. 1 OR» 500–12000
  - Erwartet: 1‰, bei ordentlicher Revisionspflicht bis 8000 bzw. 12000 (z. B. 10 Mio. Kapital → bis 10'000)
  - Ist: Engine hart auf clamp(k*0.001, 500, 4000) → liefert bei 10 Mio. 4000, unabhängig vom Revisions-/Publikumsstatus (kein Eingabepfad dafür)
  - Notiz: Nur Randfall (neue Gesellschaften sind bei Gründung selten ordentlich revisionspflichtig); im hinweis offengelegt (§8). Der angezeigte Zahlenwert 4000 kann für den revisionspflichtigen Fall untertreiben. Übrige-Gesellschaften-Fall (Normalfall) ist byte-genau korrekt.
- **[NIEDRIG · abdeckungsluecke]** Emissionsabgabe-Bemessung in weitereKosten() (Formular-Pfad)
  - Norm: StG (SR 641.10) Art. 8 Abs. 1 i.V.m. Art. 6 Abs. 1 lit. h — Bemessung = Leistungen der Gesellschafter (Nennwert + Agio)
  - Erwartet: Basis inkl. Agio
  - Ist: weitereKosten() bemisst an übergebenem wertChf (=Geschäftswert/Kapital); enthält der Aufrufer kein Agio, wird die Abgabe zu tief. gruendungsunterlagen() nutzt korrekt das dedizierte Feld leistungenChf.
  - Notiz: Latente Eingabe-Semantik (UI-abhängig), keine Rechenfehler in der Engine selbst; hinweis nennt «Nennwert + Agio». Nur relevant, wenn Agio > 0 und der Aufrufer es nicht in wertChf einrechnet.

### `zustaendigkeitFahrplan.ts`  (2)

- **[NIEDRIG · norm-anker]** Fahrplan-Texte Z.51/53 nennen weder Schwellenwert (CHF 2000 / 10 000) noch Voraussetzung
  - Norm: Art. 212 Abs. 1 ZPO (bis 2000, «sofern die klagende Partei einen entsprechenden Antrag stellt») / Art. 210 Abs. 1 lit. a-c ZPO
  - Erwartet: §13 D1: jeder Rechtswert mit Norm + Betrag/Voraussetzung belegt; Schwellen direkt gegen ZPO-Wortlaut nachgezogen
  - Ist: Z.51 «Bei diesem Streitwert kann die Behörde auf Antrag sogar selbst entscheiden (Art. 212 ZPO)» und Z.53 «kann einen Entscheid-/Urteilsvorschlag unterbreiten (Art. 210 ZPO)» führen den blossen Artikel, aber keinen Betrag/keine Voraussetzung. Kein falscher Wert angezeigt (Datei zeigt keine Zahl), aber Norm-Beleg unvollständig; Betrag steht nur im Engine-Zwischenergebnis, nicht im Fahrplan.
- **[NIEDRIG · hinweistext]** «Parteien … bezeichnen» (Fahrplan Z.25)
  - Norm: Art. 202 Abs. 2 ZPO: «Im Schlichtungsgesuch sind die Gegenpartei, das Rechtsbegehren und der Streitgegenstand zu bezeichnen»
  - Erwartet: Zu bezeichnen ist die «Gegenpartei» (nicht «Parteien»)
  - Ist: Fahrplan Z.25 schreibt «Parteien, Rechtsbegehren und Streitgegenstand bezeichnen» — begrifflich unpräzis ggü. Wortlaut («Gegenpartei»). Geringfügig, kein Rechenwert.

### `src/lib/schkgZustaendigkeit.ts`  (2)

- **[NIEDRIG · norm-anker]** Forum-Normchip Rechtsöffnung: forum.normen = [{artikel:'Art. 84 SchKG'},{artikel:'Art. 251 ZPO'}] (Zeilen 174)
  - Norm: Art. 84 Abs. 1 SchKG (Richter des Betreibungsortes entscheidet über Rechtsöffnung); Art. 251 lit. a ZPO (summarisches Verfahren: Rechtsöffnungs-/Konkurs-/Arrest-/Nachlassgericht) — beide verbatim Fedlex 1.1.2026 / 1.7.2026
  - Erwartet: Chip mit Absatz/Litera-Granularität wie im Prosatext ('Art. 84 Abs. 1 SchKG', 'Art. 251 lit. a ZPO'), konsistent zur sonstigen Anker-Präzision der Engine (z.B. Art. 46 Abs. 1/2/4)
  - Ist: Die normen-Chips tragen nur 'Art. 84 SchKG' bzw. 'Art. 251 ZPO' ohne Abs./lit.; die richtige Granularität steht nur im forum.text-Prosatext. Der Bericht (schkgZustaendigkeitBericht) rendert forum.normen als Chip → geringere Präzision als der Fliesstext. Inhaltlich richtig, nur Anker weniger fein.
  - Notiz: Kein Zuständigkeits-/Wertfehler; das Forum (Gericht des Betreibungsortes, summarisch) ist korrekt. Reine Anker-Feinheit; Prosa trägt Abs. 1 / lit. a bereits.
- **[NIEDRIG · abdeckungsluecke]** schuldnerTyp-Enum deckt Art. 46 Abs. 3 (Gemeinderschaft) nicht ab (Zeilen 19-26, ORT_NORM 97-105)
  - Norm: Art. 46 Abs. 3 SchKG: 'Für die Schulden aus einer Gemeinderschaft kann in Ermangelung einer Vertretung jeder der Gemeinder am Orte der gemeinsamen wirtschaftlichen Tätigkeit betrieben werden.' (verbatim Fedlex 1.1.2026)
  - Erwartet: Vollständige Betreibungsort-Weichen des Art. 46; entweder eine Option für die Gemeinderschaft (Ort der gemeinsamen wirtschaftlichen Tätigkeit) oder eine bewusste Scope-Notiz
  - Ist: Kein SchkgSchuldnerTyp bildet die Gemeinderschaft nach Art. 46 Abs. 3 ab; dieser Betreibungsort ist in der Engine nicht wählbar. Auftrag nennt bewusst nur Abs. 1/2/4 → mutmasslich gewollter Scope, daher nur als Abdeckungs-Notiz.
  - Notiz: Nischenfall; wahrscheinlich intentionaler Scope (Auftrag listet Abs. 3 nicht). Kein Fehler an vorhandenen Werten.

### `src/lib/bruch.ts`  (1)

- **[NIEDRIG · wertfehler]** Warnungstext bei altrechtlichem Todesfall mit hängiger Scheidung und angekreuzt «472 erfüllt» (erbteilung.ts Z. 340–344)
  - Norm: Art. 472 ZGB aF (aufgehoben durch BG vom 5.10.1984, mit Wirkung seit 1.1.1988, AS 1986 122) bzw. Art. 472 nF (BG vom 18.12.2020, AS 2021 312, in Kraft seit 1.1.2023) i.V.m. Art. 15/16 SchlT ZGB; https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/24/233_245_233/20220101/de/html/fedlex-data-admin-ch-eli-cc-24-233_245_233-20220101-de-html-1.html; Stand aF-Konsolidierung 1.1.2022
  - Erwartet: Begründung: Art. 472 nF gilt erst für Todesfälle ab 1.1.2023, für aF-Todesfälle existiert kein Pflichtteilsverlust (Art. 472 aF aufgehoben) — unabhängig davon, ob die nF-Voraussetzungen erfüllt wären
  - Ist: Rechenwerte KORREKT (EG-PT bleibt 1/4, Kind-PT 3/8, verfügbar 3/8), aber Engine gibt zusätzlich die Warnung «Hängiges Scheidungsverfahren OHNE erfüllte Voraussetzungen von Art. 472 ZGB…» aus, obwohl der Nutzer die Voraussetzungen als erfüllt angegeben hat — sie widerspricht der gleichzeitig ausgegebenen (korrekten) Annahme aus Z. 246–252
  - Notiz: Reiner Begleittext-Widerspruch, keine Quote/kein CHF-Betrag betroffen; Fix-Vorschlag: Warnung Z. 340 zusätzlich an rechtsstand==='neu' knüpfen (bei alt trägt die Annahme die korrekte Begründung bereits)

### `src/lib/zustaendigkeit.ts`  (1)

- **[NIEDRIG · norm-anker]** Konsolidierungs-Stand im Datei-Kopf: '20250101' (Z.12-13), zusätzlich Inline-Anker 'Stand 20250101' (Z.345-346) und 'Fedlex-Cache 20250101 verifiziert' (Z.404)
  - Norm: §7-Provenienz / SR 272 ZPO — geltende Konsolidierung ist 20260701 (fedlex.data.admin.ch/eli/cc/2010/262/20260701), so auch gepinnt in scripts/fedlex-cache.sh Z.28
  - Erwartet: Stand-/Provenienz-Anker = 20260701 (die aktuell geltende, vom Repo gepinnte Konsolidierung), konsistent mit fedlex-cache.sh
  - Ist: Datei-Kopf und mehrere Inline-Kommentare zitieren noch 20250101 als Verifikationsbasis; der Code wurde gegen 20260701 nicht nachdokumentiert, obwohl fedlex-cache.sh bereits auf 20260701 re-gepinnt ist (Kommentar dort Z.25-27)
  - Notiz: KEIN Wertfehler: alle Schwellen sind unter 20260701 unverändert gültig (empirisch am Filestore-HTML verifiziert). Reine Stand-/Dokumentations-Drift der §7-Provenienz. Nicht nutzersichtbar (die user-seitigen Normverweise tragen nur 'Art. X ZPO' ohne Stand). Fix: Kopf-Kommentar + Inline-Stände auf 20260701 nachziehen; ggf. Notiz aus fedlex-cache.sh übernehmen (nur art_260a/b + art_314-Fussnote geändert, keine Engine-Werte).

### `src/lib/famStatusPresets.ts`  (1)

- **[NIEDRIG · hinweistext]** vaterschaft_mutter info: «bei bestehendem Kindesverhältnis zu einem anderen Mann läuft die Frist erst ab dessen Beseitigung (Abs. 2)»
  - Norm: Art. 263 Abs. 2 ZGB (SR 210, Stand 1.7.2026)
  - Erwartet: Abs. 2 gewährt eine EIGENSTÄNDIGE Rettungs-Jahresfrist «in jedem Fall innerhalb eines Jahres seit dem Tag, da es beseitigt ist» — die ordentliche Jahresfrist ab Geburt (Abs. 1 Ziff. 1) wird nicht suspendiert, sondern durch ein zusätzliches Fenster ergänzt.
  - Ist: Formulierung «läuft die Frist erst ab dessen Beseitigung» legt eine Suspendierung der ordentlichen Frist nahe.
  - Notiz: Vertretbare Vereinfachung, kein Rechtsfehler: für die Klage der Mutter ist der praktische Effekt nahezu identisch (vor Beseitigung meist keine Klagemöglichkeit). Nur sprachliche Präzisierung, falls gewünscht. Wert (1 Jahr) und Norm-Anker unverändert korrekt.

### `src/tests/normtext-vollstaendigkeit.test.ts`  (1)

- **[NIEDRIG · norm-anker]** quelleUrl-Host 'gesetzessammlungen.sg.ch' (2x) in src/tests/normtext-vollstaendigkeit.test.ts:288,311
  - Norm: Amtliche SG-Gesetzessammlung: Live-Host www.gesetzessammlung.sg.ch (empirisch HTTP 200); Plural-Variante liefert keine Antwort
  - Erwartet: https://www.gesetzessammlung.sg.ch (Singular; im Repo 1121x korrekt verwendet)
  - Ist: https://gesetzessammlungen.sg.ch (Plural, tot: curl 000). Nur in Testdatei als Fixture, NICHT nutzer-sichtbar
  - Notiz: Kein Produktions-/Nutzer-Link betroffen; reine Test-Fixture-Inkonsistenz gegenueber dem 1121x verwendeten Live-Host.

### `src/lib/emissionsabgabe.ts`  (1)

- **[NIEDRIG · hinweistext]** Code-Kommentar Z.5-8: Freibetrag als "(gefestigte ESTV-Praxis, Bundesstempelabgabe)" begründet
  - Norm: StG SR 641.10 Art. 6 Abs. 1 lit. h (cc/1974/11_11_11, Stand 1.1.2024)
  - Erwartet: Freibetrag-Charakter folgt unmittelbar aus dem Gesetzeswortlaut "soweit die Leistungen der Gesellschafter gesamthaft eine Million Franken nicht übersteigen" ("soweit" = nur übersteigender Teil steuerbar) — also black-letter law, nicht bloss Praxis
  - Ist: Kommentar rahmt die Freibetrag-Qualifikation primär als ESTV-Praxis; das untertreibt, dass sie sich direkt aus dem Normtext ergibt
  - Notiz: Reiner interner Code-Kommentar, KEINE Auswirkung auf berechnete Werte oder nutzersichtbaren Text. Rechenlogik selbst ist korrekt. Optional präzisieren.

### `erbFristen.ts`  (1)

- **[NIEDRIG · norm-anker]** erbgang.ts Zeile 'Ausschlagung der Erbschaft', normRef-Pill 'Art. 567 Abs. 2 ZGB' (aus Preset erbFristen.ts:64 geerbt)
  - Norm: Art. 567 ZGB: Abs. 1 'Die Frist zur Ausschlagung beträgt drei Monate.' (= die 3-Monats-DAUER, die das angezeigte Datum erzeugt); Abs. 2 = nur der Fristbeginn (Kenntnis vom Tod / amtliche Mitteilung)
  - Erwartet: Anker, der die für den angezeigten Rechtswert (3-Monats-Frist) massgebliche Norm trägt — 'Art. 567 ZGB' bzw. 'Art. 567 Abs. 1 und 2 ZGB' (Abs. 1 Dauer + Abs. 2 Beginn)
  - Ist: Pill zitiert nur 'Art. 567 Abs. 2 ZGB' — der Absatz, der die 3-Monats-Dauer NICHT enthält; wer den Link prüft, findet in Abs. 2 nur den Fristbeginn, nicht die '3 Monate'
  - Notiz: Kein Wert-/Datumsfehler: 15.03→15.06 (3 Mte) ist korrekt gerechnet und die annahmen-Zeile nennt Art. 567 Abs. 2 zutreffend für den Fristbeginn. Reine Anker-Präzision; Fix gehört in erbFristen.ts (Preset ausschlagung_gesetzlich/_eingesetzt), da der Spiegel den Anker via ausschlagung.preset.norm übernimmt. Verzahnt mit §13/D1 (jeder Rechtswert mit der ihn tragenden Norm).


---

## ERGEBNIS — Fix-Runde + unabhängiger Doppelcheck (2026-07-02, Opus)

Fix-Workflow (10 disjunkte Domänen-Agenten, Opus, read-verify-fix) → zentrale Verifikation (tsc/vitest/golden) → unabhängiger adversarialer Doppelcheck (7 Verifier, gegen Amtsquelle refutierend).

### Bilanz
- **Angewandt & bestätigt:** ~45 Fixes über 20 Dateien; **Doppelcheck 45 CONFIRMED / 0 REFUTED / 2 UNSURE** (beide non-blocking, s.u.).
- **Von den Fix-Agenten selbst widerlegt (nicht angewandt):** 17 Befunde.
- **Deferiert (§9-Ermessen / Feature-Lücke):** 27 (Fix-Runde) + 4 (zentrale Triage, s.u.).
- **Tore:** `tsc -b` grün · `vitest` 2958 grün · `eslint` grün · golden 201 Fälle byte-gleich (6 Fälle bewusst neu gesegnet). **Kein Push/Deploy (§9 offen für David).**

### Zentral zurückgerollt (Übergriff / doktrinell umstritten) → §9-Backlog
- **`verzugszins.ts` (voll):** «erster Zinstag = Folgetag für alle Fälle» redefinierte die Engine-Konvention und brach 12 Akzeptanztests — für einen NIEDRIG-Befund. Sauberer, testkonformer Redo nötig (nur `mahnung`↔`verfalltag`-Symmetrie + Art.-105-Abs.-1-Blocker), separat.
- **`streitwert.ts` Berufung-Regime (Art. 308 Abs. 2 ZPO):** korrekte, aber UI-Output-ändernde Abdeckungslücke → als §9-Feature statt blind gebaut.
- **`verjaehrung.ts` Einredeverzicht-Deckel (Art. 141):** «10 J ab Erklärung» vs. «ab Verjährungseintritt» doktrinell umstritten + Spannung zu `verifikation.ts`/BGE 132 III 226 → David entscheidet. Die **zwei HOCH-Verjährungs-Fixes bleiben** (Doppelcheck bestätigt).

### Tests nachgezogen (fachliche Änderung, §6.3 deklariert)
- `schkgZustaendigkeit.test.ts`: Anker-Präzision `Art. 84 SchKG` → `Art. 84 Abs. 1 SchKG`.
- `zustaendigkeit.test.ts` (×2): SG-GKV-Sunset `30.6.2026` → `1.7.2026 in Vollzug` (Nachfolgefassung v3863).

### Doppelcheck-Residuen (non-blocking Follow-ups)
- **`verjaehrung.ts`** Kommentar-Anker «BGE 114 II 335» war nicht positiv verifizierbar → auf «h.L. + einschlägiger BGE fachlich zu ergänzen» entschärft (nicht load-bearing; Wert steht auf «stets die zehnjährige»).
- **`notariat-grundbuch.ts` `GRUNDPFAND.SG`** (unveränderte Zeile) steht noch auf aufgehobenem 1998-Tarif (Nr. 11.01) — Konsistenz-Lücke zu den korrigierten SG-Kauf-Schwestern; separater Mini-Fix auf Nr. 21.01/21.02 empfohlen (keine Regression durch diese Runde).

### Angewandte & bestätigte Fixes (Auszug HOCH/MITTEL)
- `bggVwvgFristen.ts`: BGG-Werktagsverschiebung: die Wohnsitz/Sitz-Massgeblichkeit wird ausschliesslich unter 'Art. 45 Abs. 1 BGG' zi
- `zustaendigkeit.ts`: ZPO-Konsolidierungs-Stand-Drift: Datei-Kopf (Z.12) und zwei Inline-Anker (Z.345 'Stand 20250101', Z.404 'Fedle
- `erbFristen.ts`: erbFristen.ts (ungueltigkeit_boesglaeubig, 30 J): Hinweis + Warnung bezeichnen Art. 519 Abs. 1 Ziff. 2 ZGB fäl
- `erbFristen.ts`: erbFristen.ts (ausschlagung_gesetzlich + ausschlagung_eingesetzt): Beide Presets verankern die 3-Monats-Länge 
- `erbteilung.ts`: erbteilung.ts Z. 340–344 (Report unter bruch.ts gelistet; bruch.ts selbst ohne Defekt): Bei altrechtlichem Tod
- `schkgPresets.ts`: Preset «doppelaufruf» (schkgPresets.ts:134): einziger Norm-Anker 'Art. 141 SchKG' ist falsch – Art. 141 regelt
- `schkgPresets.ts`: Preset «teilnahme_pfaendung» (schkgPresets.ts:94): Sammelzitat 'Art. 110/111 SchKG' unter einem einzigen 30-Ta
- `schkgFristen.ts`: berechneSchkgFrist, fristnatur 'wartefrist' (schkgFristen.ts): Wochenend-/Feiertags-Normalisierung wurde VOR d
- `schkgZustaendigkeit.ts`: Forum-Normchips Rechtsöffnung (schkgZustaendigkeit.ts:174): Chips 'Art. 84 SchKG' / 'Art. 251 ZPO' ohne Abs./l
- `bgerRechtsweg.ts`: bgerRechtsweg: Verwaltungsweg liefert für vermögensrechtliche Staatshaftungs-/öff.-Personalrechtssachen pausch
- `prozesskosten.ts`: BGer-Gerichtsgebühr bei nicht-vermögensrechtl. Gleichstellungs-/BehiG-Streit: Engine wählte über den !nv-Riege
- `prozesskosten.ts`: Handelsgericht-Hinweis zitiert Art. 198 lit. f ZPO und behauptet zwingenden Entfall der Schlichtung (Fassung v
- `prozesskosten.ts`: Kostenlos-Ausgaben ohne Art.-115-Vorbehalt (§8-Ehrlichkeitslücke; zustaendigkeit.ts hat die Regel bereits)
- `prozesskosten.ts`: Gewaltschutz im Schlichtungsverfahren liefert kommentarlos eine Schlichtungsgebühr, obwohl Schlichtung von Ges
- `modifikatoren.ts`: TG Rechtsmittel-gk auf 1.0 neutralisiert; Kommentar behauptete zu Unrecht, ein 1.x-Zuschlag sei «im Wortlaut u
- `parteientschaedigung.ts`: ZH PE-Hinweis «§ 9 summarisch ⅖–⅕» (falscher oberer Rand)
- `parteientschaedigung.ts`: UR PE-Kriterien + kriterienNorm zeigen die Gerichtsgebühr-Kriterien (Art. 3 GGebV) statt der Anwaltsentschädig
- `parteientschaedigung.ts`: SG PE-Hinweis nennt den HonO-Tarif «Maximaltarif» (im Wortlaut unbelegt, irreführend wegen Art. 17/18 Überschr
- `schlichtung.ts`: GE Schlichtungs-Hinweis behauptet pauschal «kein +20 %-Zuschlag»
- `gerichtskosten.ts`: VD Gerichtskosten-Stand '1.9.2019' + lexfind-Link = eingefrorene Alt-Fassung (Art.-18-Werte unverändert)
- `gerichtskosten.ts`: ZH Gerichtskosten-Hinweis suggeriert, die ⅓-Grenze gelte auch für die Ermässigung
- `nicht-vermoegensrechtlich.ts`: AG PE-NV Stundenansatz «CHF 185–250 (unentgeltlich 150)» veraltet
- `nicht-vermoegensrechtlich.ts`: OW/NW/GL/GE NV-Einträge tragen hartes Provenienz-Stand '1.1.2011' statt In-Kraft-Datum der geltenden Fassung
- `zustaendigkeitKosten.ts`: SG-GKV-Sunset-Hinweise «endet 30.6.2026 / ab 1.7.2026 prüfen» am 2.7.2026 obsolet; nutzersichtbar wird der gül
- `verjaehrung.ts`: HOCH: Unterbrechung durch Urkunde/Urteil bei Zwei-Fristen-Regimes (delikt/delikt_person/vertrag_person/bereich
- `verjaehrung.ts`: HOCH: Klage-Unterbrechung — die absolute Frist lief während des hängigen Verfahrens ab, Engine meldete «Verjäh
- `verjaehrung.ts`: MITTEL: «Konservative Regel» kappte auch anerkennung/betreibungsakt an der absoluten Frist und behauptete im A
- `verjaehrung.ts`: MITTEL: Einredeverzicht — verzichtBis = Verjährungseintritt + N Jahre konnte die Höchstdauer von 10 Jahren AB 
- `verjaehrung.ts`: NIEDRIG: Einredeverzicht — der Bezugspunkt der 10-J-Höchstdauer (Erklärung vs. Verjährungseintritt vs. Beginn 
- `notariat-grundbuch.ts`: VS Grundbuchgebühr Eigentumsübertragung Kauf: Deckel falsch (min 50 / max 3000)
- `notariat-grundbuch.ts`: SG Grundbuch Kauf rechnet nach aufgehobenem Tarif (Nr. 10.01, Stand 3.2.1998; Knick 3 Mio, min100/max12500)
- `notariat-grundbuch.ts`: SG Notariat Grundstückkauf rechnet nach aufgehobenem Tarif (Nr. 60.01.01+0.2, 2014); Art.-5-Verdoppelung fehlt
- `beurkundung.ts`: SG Kapitalerhöhung (Nr. 60.14): lineare 0,08% statt Tranchen-Floor «je weitere volle 100'000»
- `beurkundung.ts`: SG Kapitalherabsetzung (Nr. 60.14): lineare 0,08% statt Tranchen-Floor
- `beurkundung.ts`: SG Fusion (Nr. 60.14): lineare 0,08% statt Tranchen-Floor
- `beurkundung.ts`: SG Stiftungserrichtung (Nr. 60.01): lineare 0,08% statt Tranchen-Floor, Rahmen 330–3850
- `notariat-grundbuch.ts`: BS Kauf-Beurkundung: Degressionsbänder >5 Mio (0,1%) und >10 Mio (0,075%) fehlen
- `notariat-grundbuch.ts`: SZ Notariat/Handänderung Nr. 1: -50%-Degression auf Mehrbetrag >10 Mio fehlt
- `notariat-grundbuch.ts`: SZ Grundpfand Nr. 2: -50%-Degression auf Mehrbetrag >8 Mio fehlt (Überhöhung bis ~15%)
- `notariat-grundbuch.ts`: TG Grundpfand-Gesamtposten ohne kombinierten Höchstbetrag (bei 10 Mio → 25'000)
- `beurkundung.ts`: ZH Kapitalherabsetzung/übrige gesellschaftsrechtl. Urkunden: fixer 0,5‰ statt Norm-Spanne 0,2–0,5‰ (§8 Schein-
- `beurkundungZusatzkosten.ts`: VD Pfandsteuer: Bemessungsbasis nicht auf volle 1000 abgerundet (512'345 → 1025 statt 1024)
- `beurkundungZusatzkosten.ts`: JU Pfandsteuer: gesetzlicher Mindestbetrag 30 Fr. fehlt (5000 → 18 statt 30)
- `beurkundungZusatzkosten.ts`: Emissionsabgabe bei Kapitalerhöhung: 1-Mio-Freibetrag wird je Vorgang auf isolierten Erhöhungsbetrag gewährt (
- `beurkundungZusatzkosten.ts`: Kopf-Kommentar Z.10: «Freigrenze 1 Mio» (Terminologie-Drift; ist Freibetrag)