# Nachverifikation der 34 Tarif-Erlasse mit Fassungs-Drift (`check:tarif-drift`)

**Erstellt:** 6.9.2026 · Auftrag David: «mach die drift-nachverifikation der 34 erlasse» · **Status: ERSTRECHERCHE** (drei parallele Verifikations-Läufe, je Wert gegen die amtliche Fassung; nichts «geprüft» ohne Davids Abnahme, §7/§8) · **Quellen:** die LexWork-Portale der betroffenen Kantone (`belex.sites.be.ch`, `gesetzessammlung.bs.ch`, `bdlf.fr.ch`, `gesetzessammlung.sg.ch`, `rechtsbuch.tg.ch`, `bgs.zg.ch`, `bgs.so.ch`, `srl.lu.ch`, `gesetzessammlungen.ag.ch`, `rechtsbuch.sh.ch`, `gdb.ow.ch`, `gesetze.nw.ch`, `gesetze.gl.ch`, `lex.vs.ch`, `ar.clex.ch`), **Abruf 6.9.2026**.

## Warum dieses Dossier

Das Tor `check:tarif-drift` (W3-TARIF-STAND, 6.9.2026) meldete beim ersten
Lauf **92 Tarif-Einträge in 33 Erlassen**, deren hinterlegte Fassung von der
amtlich geltenden abweicht. Das Tor sagt nur «die zitierte Fassung ist
überholt» — nicht «die Zahl ist falsch». Dieses Dossier hält fest, was die
Nachverifikation jedes einzelnen Werts gegen die geltende Fassung ergeben hat.

## Zähler

| Gruppe | Erlasse | Einträge geprüft | GLEICH | ABWEICHUNG | UNKLAR |
|---|---|---|---|---|---|
| A — BE · BS · FR | 9 | 55 | 52 | 3 | 0 |
| B — SG · TG · ZG · SO · LU · AG · SH | 9 | 20 | 19 | 1 | 0 |
| C — OW · NW · GL · VS · AR | 10 | 28 | 26 | 2 | 1 |
| **Summe** | **28** | **103** | **97** | **6** | **1** |

*(Die Gruppen decken die 33 DRIFT-Erlasse ab; mehrfach gezählte Erlasse mit
zwei Stand-Schreibweisen erscheinen im Tor als getrennte Zeilen. «UNKLAR» ist
die DE/FR-Divergenz bei VS Art. 32, die im selben Eintrag steckt wie die dortige
ABWEICHUNG.)*

**Kernbefund: kein einziger Tarif-BETRAG ist durch die Fassungsdrift falsch
geworden.** Die 92 DRIFT-Meldungen waren Stand-/Pin-Nachführung (89), zwei
Fehlalarme aus falscher Erlass-Zuordnung (AG, SH) und ein einziger Fall, bei
dem eine echte Rechtsänderung die Werte überholt hatte (SG sGS 914.5,
Totalrevision 2015/Fassung 2020). Die übrigen fünf ABWEICHUNGEN stammen aus der
Nachverifikation selbst, nicht aus der Drift.

## Abweichungen (sechs)

| Fundstelle | Was | Norm |
|---|---|---|
| `src/data/tarif/notariat-grundbuch.ts` SG Grundpfand | minChf 100 → 200, maxChf 5000 → 4000; Nummern umnummeriert | sGS 914.5 Art. 10 Nr. 21.01 i.V.m. Art. 5 Abs. 1, Nr. 21.02 |
| `src/data/tarif/notariat-grundbuch.ts` GL Grundpfand | minChf 100 → 50 | GebT ZGB Art. 13 Abs. 2 Bst. a (GS III B/7/1) |
| `src/data/tarif/parteientschaedigung.ts` VS | Bandraster 11 → 25 Streitwertstufen | LTar Art. 32 Abs. 1 (SGS/VS 173.8) |
| `src/data/tarif/beurkundung.ts` FR AG-/GmbH-Gründung, Stiftung (3 Einträge) | zusätzliche Grundgebühr 200–1000 fehlte | RSF 261.16 Art. 4 Ziff. 5 lit. g |

## Entscheide, die bei David liegen

1. **VS LTar Art. 32 — zwei DE/FR-Divergenzen der amtlichen Fassung 3360.**
   Streitwert 300'001–350'000: DE «bis 24'000», FR «à 24'900». Streitwert
   900'001–1'000'000: DE «von 33'100», FR «de 33'300». Beide Sprachfassungen
   sind amtlich. Kodiert ist die französische — auf sie zeigt die hinterlegte
   `quelleUrl`. Zu entscheiden: welche Fassung gilt, und ob VS künftig
   durchgehend deutsch oder französisch zitiert wird.
2. **FR RSF 261.16 Art. 4 ch. 1 lit. b — Fehler in der amtlichen Quelle.**
   Die französische konsolidierte Fassung schreibt «70 ‰», die deutsche «7 ‰»;
   Annexe 1 (amtliche Betragstabelle) belegt 7 ‰. Kodiert ist 7 ‰. Zu
   entscheiden: ob der Kanton auf den Digitalisierungsfehler hingewiesen wird.
3. **FR RSF 261.16 Art. 5 ch. 12 (Auffangtatbestand).** Vier Einträge
   (Vorkaufsrecht, Vorsorgeauftrag, Kapitalherabsetzung, Schuldanerkennung)
   sind unter den Auffangtatbestand «alle Geschäfte, die in diesem Artikel
   nicht erwähnt sind: Fr. 50 bis 1500» subsumiert. Das ist Auslegung, nicht
   Wortlaut — gehört in die fachliche Abnahme.
4. **SG sGS 914.5 Art. 5 Abs. 1 — verdoppelt die Norm auch den RAHMEN?**
   Der Wortlaut sagt «die Gebührenansätze … werden verdoppelt», eine
   ausdrückliche Rahmen-Regel fehlt. Kodiert ist die Verdoppelung von Minimum
   UND Maximum (200–4000), wie es die Hausschreibweise derselben Datei beim
   AI-Eintrag bereits tut.
5. **GL zusammengesetzter Eintrag (Beurkundung + Eintrag).** Ob die
   Beurkundungskomponente (1,5 ‰, max. 500) eigenständig modelliert werden
   soll oder im Hinweis bleibt.

## Was daraus gebaut wurde

Phase 2 (6.9.2026, Branch `feat/w3-tarif-nachverifikation`): Stand/Pin-Nachzug
für 89 Einträge, Erlass-Zuordnung AG/SH korrigiert, die sechs Abweichungen
umgesetzt, Golden für 9 Fälle neu geschrieben, `check:tarif-drift` in die
Netz-Tor-Kette aufgenommen. Tor-Lauf danach: **aktuell 643 · DRIFT 0 ·
unklar 311 · unerreichbar 0**.

---

*Ab hier stehen die drei Verifikations-Berichte WÖRTLICH und ungekürzt — sie
sind die Belegkette (URL · Fassungs-Id · Wortlaut) für jede oben genannte
Feststellung.*

---

# W3-TARIF-NACHVERIFIKATION — Befund Gruppe A (BE · BS · FR)

Abruf aller amtlichen Fassungen: 6.9.2026, LexWork-APIs `belex.sites.be.ch`,
`gesetzessammlung.bs.ch`, `bdlf.fr.ch` (JSON `…/api/{lang}/texts_of_law/<nr>/versions/<id>`,
Feld `selected_version.xhtml_tol` = Volltext + Änderungsapparat; Anhänge als PDF
`…/api/{lang}/versions/<id>/annexes`). Tor-Läufe je Kanton am 6.9.2026 nackt:
BE 12 DRIFT / 38 Einträge · BS 14 / 34 · FR 18 / 40 — deckungsgleich mit dem
Sammellauf. Read-only, nichts im Repo geändert.

---

## BE BSG 154.21 — Verordnung über die Gebühren der Kantonsverwaltung (GebV), Anhang 4B Gebührentarif der Grundbuchämter
- Fassung amtlich: Version **3466**, in Kraft seit **2026-09-01** (Beschluss 24.06.2026), URL Fassung: https://www.belex.sites.be.ch/api/de/texts_of_law/154.21/versions/3466 · Anhänge-PDF https://www.belex.sites.be.ch/api/de/versions/3466/annexes · Anzeige https://www.belex.sites.be.ch/app/de/texts_of_law/154.21 — Abruf 6.9.2026. `abrogated: false`.
- Hinterlegt: stand «01.05.2026» (8 Einträge) bzw. «1.5.2026» (1 Eintrag), quelleUrl https://www.belex.sites.be.ch/app/de/texts_of_law/154.21
- Zwischenfassungen: 3355 (01.05.2026–31.07.2026) → 3380 (01.08.2026–31.08.2026) → 3466 (seit 01.09.2026). **Tarif-Artikel betroffen: nein.** Beleg Änderungsapparat: 04.03.2026/01.05.2026 «Anhang 05A Inhalt geändert» (26-010); 10.06.2026/01.08.2026 «Anhang 05A» + «Anhang 05B» (26-027); 24.06.2026/01.09.2026 «Art. 31 Titel», «Art. 32 Titel/Abs. 1/Abs. 2», «Art. 33 Titel/Abs. 1» (26-047, Datenschutzgebühren). **Anhang 04B trägt im Volltext den Kopf «(Stand 01.08.2020)»**, letzte Inhaltsänderung laut Änderungstabelle 24.06.2020/01.08.2020 (20-066). Art. 4 Abs. 2 (Taxpunktwert) unverändert: «Der Wert des Taxpunktes beträgt einen Franken.»
- Einträge (Datei:Zeile · artikel · regel heute):
  - src/data/tarif/grundbuch.ts:22 · Anhang 4B Ziff. 3.1.1 · fix 200 → **GLEICH** (amtlich «Die Gebühr für die Eintragung der Eigentümerin oder des Eigentümers beträgt für das erste Grundstück 200»; je weitere/r Erwerber/in 20, jedes weitere Grundstück 20)
  - src/data/tarif/notariat-grundbuch.ts:96 · Anhang 4B Ziff. 3.1.1 · fix 200 → **GLEICH** (gleiche Norm; −20 % elektronisch aus Ziff. 1.5.3 «Bei elektronischen Eingaben wird die Gebühr … um 20 Prozent reduziert» bestätigt)
  - src/data/tarif/grundbuch.ts:50 · Anhang 4B Ziff. 3.3.1–3.3.5 · fix 100 → **GLEICH** (3.3.1 lit. a «für die Eröffnung der Grundpfandrechtsbeziehung … 100», lit. b je belastetes Grundstück 20; 3.3.2 = 50; 3.3.3 a 20 / b 10; 3.3.5 = 30)
  - src/data/tarif/grundbuch.ts:78 · Anhang 4B Ziff. 3.2 lit. a/b · fix 100 → **GLEICH** (lit. a «für die Eröffnung, Änderung oder Ergänzung der Dienstbarkeit oder Grundlast im Grundbuch 100», lit. b 10)
  - src/data/tarif/grundbuch.ts:105 · Anhang 4B Ziff. 3.5 i.V.m. 3.2 und 3.1.1 · fix 310 → **GLEICH** (Rechnung amtlich gedeckt: Widmung Ziff. 3.5 «pro beteiligtes Grundstück 10» + Dienstbarkeit Ziff. 3.2 lit. a 100 + Eigentum Ziff. 3.1.1 200 = 310)
  - src/data/tarif/grundbuch.ts:131 · Anhang 4B Ziff. 3.4 lit. a/b · fix 50 → **GLEICH** (lit. a «für die Eröffnung, Änderung oder Ergänzung der Vor- oder Anmerkung im Grundbuch 50», lit. b 10)
  - src/data/tarif/grundbuch.ts:212 · Anhang 4B Ziff. 3.4 lit. a/b · fix 50 → **GLEICH** (dieselbe Norm, Anmerkung)
  - src/data/tarif/grundbuch.ts:159 · Anhang 4B Ziff. 2.1/2.2 · fix 100 → **GLEICH** (Ziff. 2.1 «Eröffnung oder Schliessung eines Grundstücks für eine Stockwerkeinheit 100»; Ziff. 2.2 = 50)
  - src/data/tarif/grundbuch.ts:237 · Anhang 4B Ziff. 1.6 · fix 0 → **GLEICH** (Ziff. 1.6 «Für die Löschung von Eintragungen, Vor- und Anmerkungen … sind keine Gebühren zu beziehen»)
- Vorschlag: **nur Stand nachziehen** — neuer stand-String «1.9.2026» (bzw. sauberer: «Anhang 4B Stand 1.8.2020, Erlass-Fassung 1.9.2026»); quelleUrl unverändert. Alternativ Pin auf https://www.belex.sites.be.ch/api/de/versions/3466/annexes.
- Vertrauen: **hoch** — Anhang 4B im amtlichen PDF Zeile für Zeile gelesen, Änderungsapparat schliesst eine Anhang-4B-Änderung seit 2020 aus.

---

## BE BSG 169.81 — Verordnung über die Notariatsgebühren (GebVN)
- Fassung amtlich: Version **2543**, in Kraft seit **2022-03-01** (Beschluss 02.02.2022), URL Fassung: https://www.belex.sites.be.ch/api/de/texts_of_law/169.81/versions/2543 · Anhänge https://www.belex.sites.be.ch/api/de/versions/2543/annexes — Abruf 6.9.2026. `abrogated: false`.
- Hinterlegt: stand «01.06.2021» (3 Einträge), quelleUrl https://www.belex.sites.be.ch/app/de/texts_of_law/169.81 · (die übrigen 17 GebVN-Einträge stehen bereits auf «01.03.2022» und sind grün)
- Zwischenfassungen: 2277 (01.06.2021–28.02.2022) → 2543 (seit 01.03.2022). **Tarif-Artikel betroffen: nein.** Änderungsapparat 22-010 ändert per 01.03.2022 ausschliesslich **Art. 21 Abs. 1** und **Art. 21 Abs. 6** — keine der drei Bestimmungen der Drift-Einträge.
- Einträge (Datei:Zeile · artikel · regel heute):
  - src/data/tarif/beurkundung.ts:472 · Art. 4 Abs. 3 i.V.m. Art. 3a Abs. 1; Art. 26 (Genossenschaftsgründung) · formel_extern, Stundenansatz CHF 400 → **GLEICH** (Art. 3a Abs. 1 amtlich «einen Stundenansatz zwischen 250 und 400 Franken»; Art. 4 Abs. 3 «Ist eine Beurkundung oder Leistung nicht tarifiert, beträgt die Gebühr nach gebotenem Zeitaufwand mindestens 300 Franken»; Art. 26 «mindestens 50 Franken»)
  - src/data/tarif/beurkundung.ts:498 · Art. 26 i.V.m. Art. 3a Abs. 1 (Statutenänderung) · formel_extern, CHF 400 → **GLEICH** (gleiche Wortlaute)
  - src/data/tarif/beurkundung.ts:525 · Art. 24 i.V.m. Anhang 4 (Fusion/Spaltung/Umwandlung) · rahmen 1000–27350 → **GLEICH** (Anhang 4 «zu Artikel 21 und Artikel 24 Absatz 2, 3 und 5», Kopf «(Stand 01.07.2006)»: Minimum «bis 200 000 → 1000», Maximum «20 000 000 → 27350»; Art. 24 Abs. 1 verweist für die übernommene Gesellschaft auf Art. 26)
- Vorschlag: **nur Stand nachziehen** — neuer stand-String «1.3.2022» (identisch mit den 17 grünen Geschwister-Einträgen, §5); quelleUrl unverändert.
- Vertrauen: **hoch** — Änderungsapparat nennt für die Fassung 2543 genau zwei geänderte Absätze, beide ausserhalb der zitierten Normen; Anhang 4 im amtlichen PDF gelesen.

---

## BS SG 154.810 — Reglement über die Gerichtsgebühren (GGR)
- Fassung amtlich: Version **5264**, «Vom 11. September 2017 (Stand 3. Juni 2021)», in Kraft seit **2021-06-03** (Beschluss 26.04.2021), URL Fassung: https://www.gesetzessammlung.bs.ch/api/de/texts_of_law/154.810/versions/5264 — Abruf 6.9.2026. `abrogated: false`.
- Hinterlegt: stand «11.9.2017» (3 Einträge) bzw. «Reglement v. 11.9.2017» (1 Eintrag) — das ist das **Beschlussdatum des Erlasses**, nicht eine überholte Fassung; quelleUrl https://www.gesetzessammlung.bs.ch/app/de/texts_of_law/154.810
- Zwischenfassungen: 4317 (01.01.2018–31.01.2019) → 4676 (01.02.2019–02.06.2021) → 5264 (seit 03.06.2021). **Tarif-Artikel betroffen: nein.** Änderungsapparat: 23.01.2019/01.02.2019 nur § 39 Abs. 2; 26.04.2021/03.06.2021 §§ 6, 18 Abs. 2, 29 Abs. 1 (Tabelle), 37a, 38. **§ 3 und § 5 stehen seit der Erstfassung unverändert.**
- Einträge (Datei:Zeile · artikel · regel heute):
  - src/data/tarif/gerichtskosten.ts:201 · § 5 · staffel_rahmen 10k:200–1000 / 30k:1000–3000 / 100k:3000–6000 / 500k:6000–20000 / 1M:20000–30000 / 5M:30000–60000 / darüber 0,5–1,5 % mind. 60000 → **GLEICH** (amtliche Tabelle § 5 Abs. 1 Wert für Wert identisch: «bis 10'000 | 200 bis 1'000 … über 5'000'000 | 0.5 % bis 1.5 % mind. 60'000»)
  - src/data/tarif/nicht-vermoegensrechtlich.ts:40 · § 5 Abs. 3 · rahmen 200–250000 → **GLEICH** («Bei nichtvermögensrechtlichen Streitigkeiten beträgt die Grundgebühr Fr. 200 bis Fr. 250'000.»)
  - src/data/tarif/nicht-vermoegensrechtlich.ts:108 · § 3 · rahmen 100–10000 → **GLEICH** (§ 3 Abs. 2 «Fr. 100 bis 30 % der Gebühr gemäss § 5 dieses Reglements, maximal aber Fr. 10'000»)
  - src/data/tarif/schlichtung.ts:116 · § 3 · rahmen 100–10000 → **GLEICH** (gleiche Norm; Abs. 3 für das Appellationsgericht parallel mit Bezug auf § 11)
- Vorschlag: **nur Stand nachziehen** — neuer stand-String «3.6.2021» für alle vier Einträge (die Variante «Reglement v. 11.9.2017» zusätzlich vereinheitlichen, §5); quelleUrl unverändert.
- Vertrauen: **hoch** — Volltext und beide Änderungstabellen gelesen; § 3/§ 5 nie geändert.

---

## BS SG 211.110 — Verordnung zum EG ZGB (VO EG ZGB), § 51 Grundbuchgebühren
- Fassung amtlich: Version **6585**, in Kraft seit **2025-05-01** (Beschluss 25.03.2025), URL Fassung: https://www.gesetzessammlung.bs.ch/api/de/texts_of_law/211.110/versions/6585 — Abruf 6.9.2026. `abrogated: false`.
- Hinterlegt: stand «1.9.2012» (8 Einträge) bzw. «15.8.2024» (1 Eintrag), quelleUrl https://www.gesetzessammlung.bs.ch/app/de/texts_of_law/211.110
- Zwischenfassungen: 2277 (01.09.2012–31.12.2012) → 4600 (2013–2019) → 4735 (2020–30.06.2024) → 6300 (01.07.2024–30.04.2025) → 6585 (seit 01.05.2025). **Tarif-Artikel betroffen: nein.** Änderungstabelle nach Artikel: § 51 Abs. 2, 4, 5, 6 zuletzt geändert **07.01.2003/19.01.2003**; per 01.05.2025 nur § 51 Abs. 1 lit. d (Zuschlag), Abs. 7 lit. e/g/h (Auszüge, Fotokopien, Adressen); per 01.07.2024 nur § 38.
- Einträge (Datei:Zeile · artikel · regel heute):
  - grundbuch.ts:24 · § 51 Ziff. 2 lit. a Satz 2 · promille 0,5 min 200 max 50000 → **GLEICH** («Bei Übergang durch Universalsukzession (z.B. bei Erbgang, Fusion) sowie bei Erbteilung, Vermächtnis und Kauf durch einen Erben an einer erbschaftsamtlichen Gant: ½‰ des Wertes bzw. Preises»; Min/Max aus Ziff. 1 lit. a «Die Minimalgebühr beträgt CHF 200 … höchstens CHF 50’000»)
  - notariat-grundbuch.ts:112 · § 51 (ordentliche Handänderung) · promille 1 min 200 max 50000 → **GLEICH** (Ziff. 2 lit. a Satz 1 «Handänderungen an Grundstücken: 1‰ des Wertes bzw. Preises»)
  - grundbuch.ts:52 · § 51 Ziff. 6 lit. a · promille 1 min 200 max 50000 → **GLEICH** («Eintragung und Erhöhung der Pfand- oder Grundlastsumme: 1‰ der Summe bzw. des Erhöhungsbetrages»)
  - grundbuch.ts:80 · § 51 Ziff. 4 lit. b · fix 100 → **GLEICH** («Andere Dienstbarkeiten: Eintragung und Änderung des Inhalts: CHF 100.»)
  - grundbuch.ts:107 · § 51 Ziff. 4 lit. a · promille 0,25 min 200 max 50000 → **GLEICH** («Selbständige und dauernde Rechte sowie unselbständige Baurechte: Begründung und flächenmässige Ausdehnung: ¼‰ vom Wert des belastenden Landes.»)
  - grundbuch.ts:133 · § 51 Ziff. 5 · fix 100 → **GLEICH** («Anmerkungen und Vormerkungen. Eintragung und Änderung: CHF 100.»)
  - grundbuch.ts:214 · § 51 Ziff. 5 · fix 100 → **GLEICH** (dieselbe Norm)
  - grundbuch.ts:161 · § 51 Ziff. 2 lit. b · promille 0,25 min 200 max 50000 → **GLEICH** («Begründung von Stockwerkeigentum: ¼‰ des Grundstückwertes einschliesslich des Wertes des zu errichtenden oder fertigzustellenden Gebäudes»)
  - grundbuch.ts:188 · § 51 Ziff. 1 lit. f · fix 100 → **GLEICH** («Anlegung einer Parzelle oder Eintragung eines Parzellenindexes: CHF 100. Löschung einer Parzelle: CHF 50.»)
- Vorschlag: **nur Stand nachziehen** — neuer stand-String «1.5.2025» für alle 9 Einträge; quelleUrl unverändert.
- Vertrauen: **hoch** — § 51 vollständig gelesen, Änderungshistorie je Absatz geprüft.

---

## BS SG 650.100 — Gesetz über die Handänderungssteuer
- Fassung amtlich: Version **2985**, «Vom 26. Juni 1996 (Stand 1. Juli 2014)», in Kraft seit **2014-07-01** (Beschluss 05.06.2013), URL Fassung: https://www.gesetzessammlung.bs.ch/api/de/texts_of_law/650.100/versions/2985 — Abruf 6.9.2026. `abrogated: false`.
- Hinterlegt: stand «2010», quelleUrl https://www.gesetzessammlung.bs.ch/app/de/texts_of_law/650.100
- Zwischenfassungen: 2048 (24.10.2010–30.06.2014) → 2985 (seit 01.07.2014). **Tarif-Artikel betroffen: nein** (§ 1 Abs. 2 trägt keine Änderungsmarke; geändert sind § 4 Abs. 1 lit. c/f–i, § 4 Abs. 2 lit. c/d, § 5 Abs. 1 lit. e/Abs. 2).
- Einträge (Datei:Zeile · artikel · regel heute):
  - notariat-grundbuch.ts:189 · § 1 Abs. 2 · promille 30 (= 3 %) → **GLEICH** («Der Steuersatz beträgt 3 Prozent.»). Hinweis-Angaben ebenfalls gedeckt: § 4 Abs. 2 «Die Handänderungssteuer wird zum Satze von 1,5 Prozent erhoben bei a) Erwerb eines ausschliesslich und während mindestens 6 Jahren dauernd selbstbewohnten Grundstücks; b) [Ersatzbeschaffung] …»; § 4 Abs. 1 lit. a/b/c Befreiung Nachkommen / Erbteilung / Ehegatten.
- Vorschlag: **nur Stand nachziehen** — neuer stand-String «1.7.2014»; quelleUrl unverändert.
- Vertrauen: **hoch**.

---

## FR RSF 130.11 — Règlement sur la justice (RJ)
- Fassung amtlich: Version **8306**, «du 30.11.2010 (version entrée en vigueur le 01.12.2025)», in Kraft seit **2025-12-01** (Beschluss 10.11.2025), URL Fassung: https://bdlf.fr.ch/api/fr/texts_of_law/130.11/versions/8306 — Abruf 6.9.2026. `abrogated: false`.
- Hinterlegt: stand «1.1.2018» (1 Eintrag, Parteientschädigung), quelleUrl https://bdlf.fr.ch/app/fr/texts_of_law/130.11 · (der Gerichtskosten-Eintrag gerichtskosten.ts:176 steht bereits auf «1.12.2025» und ist grün)
- Zwischenfassungen: 5899 (01.01.2018–31.01.2022) → 7246 (2022) → 7664 (2023–30.11.2025) → 8306 (seit 01.12.2025). **Tarif-Artikel betroffen: ja, aber ohne Betragswirkung.** Änderungstabelle nach Artikel: «Art. 64 al. 1, b) — modifié — 10.11.2025 — 01.12.2025 — 2025_085»; Art. 65 und Art. 66 zuletzt 22.06.2015/01.07.2015. Gegenlesen der Fassung 5899 zeigt die einzige Änderung: lit. b lautete «les affaires traitées en procédure simplifiée dont la valeur litigieuse ne dépasse pas 30'000 francs: indemnité maximale de 6000 francs», heute mit Einschub «**, à l'exception des procédures de divorce (art. 274 ss du code de procédure civile)**». Beträge 30'000 / 6000 unverändert.
- Einträge (Datei:Zeile · artikel · regel heute):
  - parteientschaedigung.ts:192 · Art. 64–66 · formel_extern «Honorar = Zeitaufwand × CHF 250, zzgl. streitwertabhängiger Zuschlag (Art. 66)» → **GLEICH** (Art. 65 «la fixation des honoraires dus à titre de dépens a lieu sur la base d'un tarif horaire de 250 francs»; Art. 66 al. 2 «les honoraires … sont majorés jusqu'à un maximum de 350 %»; Art. 64 al. 1 lit. b «indemnité maximale de 6000 francs»)
- Vorschlag: **nur Stand nachziehen** — neuer stand-String «1.12.2025» (dann identisch mit dem Gerichtskosten-Eintrag, §5); quelleUrl unverändert. **Zusätzlich empfohlen (kein Wert, sondern Vollständigkeit):** Hinweis «Pauschale ≤30k: max CHF 6000» um die seit 1.12.2025 geltende Ausnahme «ausser Scheidungsverfahren (Art. 274 ff. ZPO)» ergänzen.
- Vertrauen: **hoch** — Alt- und Neufassung von Art. 64 direkt verglichen.

---

## FR RSF 214.5.16 — Tarif des émoluments fixes du registre foncier
- Fassung amtlich: Version **8466**, «du 08.10.2018 (version entrée en vigueur le 01.12.2018)», in Kraft seit **2018-12-01**, URL Fassung: https://bdlf.fr.ch/api/fr/texts_of_law/214.5.16/versions/8466 — Abruf 6.9.2026. `abrogated: false`.
- Hinterlegt: stand «08.10.2018» (9 Einträge), quelleUrl https://bdlf.fr.ch/app/fr/texts_of_law/214.5.16
- Zwischenfassungen: **keine.** Die hinterlegte Angabe «08.10.2018» ist das **Beschlussdatum genau dieser geltenden Fassung**; der Tor-Befund ist hier ein reines Format-Artefakt (Beschluss- statt Inkraft-Datum). Tarif-Artikel betroffen: nein.
- Einträge (Datei:Zeile · artikel · regel heute):
  - grundbuch.ts:25 · Art. 2 al. 1 ch. 6 · fix 120 → **GLEICH** («Transfert de propriété ou inscription du ou de la propriétaire conformément à l'article 76 LRF: Fr. 120»)
  - grundbuch.ts:53 · Art. 2 al. 1 ch. 11 lit. a · fix 100 → **GLEICH** («pour l'inscription, l'extension, la division, la réunion, la novation …, par gage: Fr. 100»)
  - grundbuch.ts:81 · Art. 2 al. 1 ch. 10 lit. a · fix 50 → **GLEICH** («Servitudes ou charges foncières: pour l'inscription ou la modification, à titre d'émolument fixe: Fr. 50»)
  - grundbuch.ts:108 · Art. 2 al. 1 ch. 10 lit. a · fix 50 → **GLEICH** (dieselbe Norm)
  - grundbuch.ts:134 · Art. 2 al. 1 ch. 12 lit. a · fix 50 → **GLEICH** («Annotations et mentions (inscription ou modification): au titre d'émolument fixe: Fr. 50»)
  - grundbuch.ts:215 · Art. 2 al. 1 ch. 12 lit. a · fix 50 → **GLEICH** (dieselbe Norm)
  - grundbuch.ts:162 · Art. 2 al. 1 ch. 9 lit. a · fix 100 → **GLEICH** («Propriété par étages et copropriété immatriculée, pour la constitution ou la modification: pour le bien-fonds: Fr. 100»)
  - grundbuch.ts:189 · Art. 2 al. 1 ch. 13 lit. a · fix 30 → **GLEICH** («Verbaux: de routes, de division ou de modification, par immeuble touché ou radié: Fr. 30»)
  - grundbuch.ts:239 · ch. 11 lit. d / ch. 13 lit. a · rahmen 30–50 → **GLEICH** (ch. 11 lit. d «pour un dégrèvement … par gage: Fr. 50»; ch. 13 lit. a Fr. 30)
- Vorschlag: **nur Stand nachziehen** — stand-String «1.12.2018» (so steht es bereits bei notariat-grundbuch.ts:110, das grün ist — §5-Vereinheitlichung); quelleUrl unverändert.
- Vertrauen: **hoch** — Art. 2 vollständig gelesen, kein Änderungsapparat vorhanden (Erstfassung dieses Tarifs).

---

## FR RSF 261.16 — Tarif des émoluments des notaires
- Fassung amtlich: Version **8428**, «du 07.10.1986 (version entrée en vigueur le 01.07.2016)», in Kraft seit **2016-07-01** (Beschluss 28.06.2016), URL Fassung fr: https://bdlf.fr.ch/api/fr/texts_of_law/261.16/versions/8428 · de: https://bdlf.fr.ch/api/de/texts_of_law/261.16/versions/8428 · Annexe 1: https://bdlf.fr.ch/api/fr/versions/8428/annexes — Abruf 6.9.2026. `abrogated: false`.
- Hinterlegt: stand «7.10.1986» (18 Einträge in beurkundung.ts). **Nur 7 davon meldet das Tor als DRIFT** (Zeilen 35, 53, 75, 98, 204, 248, 350 — quelleUrl `…/app/fr/texts_of_law/261.16`); die übrigen 11 zeigen auf `https://bdlf.fr.ch/api/fr/versions/8428/pdf_file` und gelten als aktuell, weil die URL die geltende Fassung pinnt — der stand-String ist dort trotzdem irreführend.
- Zwischenfassungen: 3605 (01.11.1986–31.05.1993) → 1868 (01.06.1993–31.12.2006) → 47 (01.01.2007–30.06.2016) → 8428 (seit 01.07.2016). **Tarif-Artikel betroffen: ja** — Art. 4 wurde 27.04.1993, 07.11.2006 und **28.06.2016 (ROF 2016_091)** geändert; Annexe 1 zuletzt 27.04.1993. Der Repo-Inhalt bildet aber bereits die **geltende** Fassung ab (Art. 4 ch. 1bis existiert erst dort), der stand-String hinkt nur nach.
- Einträge (Datei:Zeile · artikel · regel heute) — amtliche Werte zuerst:
  - **Art. 4 ch. 1bis amtlich** (immobilienbezogen): bis 5000 = Fr. 150; 5k–20k 7 ‰; 20k–50k 5 ‰; 50k–200k 3 ‰; 200k–2M 2 ‰; 2M–5M 1 ‰; > 5M 0,5 ‰; «mais au maximum 10'000 francs».
    - beurkundung.ts:35 (Baurecht) · staffel_sockel_prozent 150/0,7/0,5/0,3/0,2/0,1/0,05, Sockel 150·255·405·855·4455·7455, max 10000 → **GLEICH** (Sockel nachgerechnet: 150+15 000·0,7 % = 255; +30 000·0,5 % = 405; +150 000·0,3 % = 855; +1,8 Mio·0,2 % = 4455; +3 Mio·0,1 % = 7455)
    - beurkundung.ts:75 (Dienstbarkeit/Nutzniessung/Wohnrecht) · identisch → **GLEICH**
    - beurkundung.ts:204 (Schenkung Grundstück) · identisch → **GLEICH**
  - **Art. 4 ch. 1 amtlich** (Ehevertrag, Erbteilung, Leibrente, Verpfründung …): bis 5000 = Fr. 150; 5k–20k 7 ‰; 20k–100k 5 ‰; 100k–1M 3 ‰; 1M–2M 2 ‰; 2M–5M 1 ‰; > 5M 0,5 ‰; max 10'000.
    - beurkundung.ts:177 (Ehe-/Vermögensvertrag) · Sockel 150·255·655·3355·5355·8355 → **GLEICH**
    - beurkundung.ts:248 (Verpfründung/Leibrente) · identisch → **GLEICH**
    - **Wichtiger Quell-Befund (§7):** Die **französische** konsolidierte Fassung schreibt in Art. 4 ch. 1 lit. b «plus, sur la tranche entre 5000 et 20'000 francs: **70 ‰**». Die **deutsche** Fassung derselben Version 8428 sagt «7 ‰», und **Annexe 1** (amtliche Betragstabelle zu Art. 4 ch. 1) weist für 20'000 den Betrag **255** und für 100'000 den Betrag **655** aus — das ist nur mit 7 ‰ vereinbar (150 + 15 000·0,7 % = 255). Die 70 ‰ in der französischen Fassung sind daher ein Redaktions-/Digitalisierungsfehler; die Repo-Kodierung mit 7 ‰ ist richtig. Keine Änderung nötig, aber belegwürdig.
  - **Art. 4 ch. 3 amtlich** (Grundpfandbestellung): bis 5000 = Fr. 100; 5k–50k 5 ‰; 50k–600k 2,5 ‰; 600k–2M 2 ‰; 2M–5M 0,75 ‰; > 5M 0,45 ‰; max 10'000.
    - beurkundung.ts:98 (Schuldbrief) · Sockel 100·325·1700·4500·6750 → **GLEICH** (nachgerechnet: 100+45 000·0,5 % = 325; +550 000·0,25 % = 1700; +1,4 Mio·0,2 % = 4500; +3 Mio·0,075 % = 6750)
  - **Art. 4 ch. 4 amtlich** (Bürgschaft): bis 10'000 = Fr. 50; je weitere Bürgschaft + Fr. 20; auf der Summe über 10'000 1,5 ‰; je weitere Bürgschaft + 0,5 ‰; max 1000.
    - beurkundung.ts:400 · staffel 50 / 0,15 % ab 10 000, max 1000 → **GLEICH**
  - **Art. 4 ch. 5 amtlich** (Errichtung, Kapitalerhöhung, Fusion, Umwandlung von Stiftung/AG/KmAG/GmbH, Statuten nicht inbegriffen): bis 50'000 = Fr. 500; 50k–100k 4 ‰; 100k–500k 3 ‰; 500k–1M 1 ‰; > 1M 0,5 ‰; max 12'000; **lit. g: «für Gründungsurkunden und -protokolle von Stiftungen, Aktiengesellschaften, Kommanditaktiengesellschaften und Gesellschaften mit beschränkter Haftung wird zusätzlich zu den obigen Beträgen eine Grundgebühr von 200 bis 1000 Franken erhoben»**.
    - beurkundung.ts:271 (AG-Gründung) · Sockel 500·500·700·1900·2400, max 12000 → **Staffel GLEICH**, aber **ABWEICHUNG (Unterdeckung)**: die zusätzliche Grundgebühr Fr. 200–1000 nach Art. 4 Ziff. 5 lit. g fehlt in `regel` und `hinweis`.
    - beurkundung.ts:299 (GmbH-Gründung) · identisch → **Staffel GLEICH**, dieselbe **ABWEICHUNG** (lit. g fehlt).
    - beurkundung.ts:372 (Stiftungserrichtung) · identisch → **Staffel GLEICH**, dieselbe **ABWEICHUNG** (lit. g fehlt).
    - beurkundung.ts:327 (Kapitalerhöhung) · identisch → **GLEICH** (lit. g gilt nur für Gründungsurkunden/-protokolle, hier zu Recht nicht angesetzt).
  - **Art. 5 amtlich**: ch. 1 «Öffentliches Testament, Erbvertrag: Fr. 100 bis 2000»; ch. 7 «Vollmacht: Fr. 25 bis 100»; ch. 12 «Alle Geschäfte, die in diesem Artikel nicht erwähnt sind …: Fr. 50 bis 1500».
    - beurkundung.ts:121 (Testament) · rahmen 100–2000 → **GLEICH**
    - beurkundung.ts:149 (Erbvertrag) · rahmen 100–2000 → **GLEICH**
    - beurkundung.ts:449 (Vollmacht/Procuration) · rahmen 25–100 → **GLEICH**
    - beurkundung.ts:53 (Vorkaufsrecht), :231 (Vorsorgeauftrag), :350 (Kapitalherabsetzung), :427 (Schuldanerkennung) · je rahmen 50–1500 → **GLEICH** (Auffangtatbestand ch. 12; die Subsumtionen sind vom Wortlaut gedeckt: ch. 1bis nennt nur «Kaufrecht mit Eigentumsübertragung» und «entgeltliche Kaufrechtsabtretung», ch. 5 nur «Errichtung, Kapitalerhöhung, Fusion oder Umwandlung»)
- Vorschlag: **Stand nachziehen** auf «1.7.2016» für alle 18 Einträge **und** die beiden quelleUrl-Konventionen vereinheitlichen (§5: entweder überall der Fassungs-Pin `…/api/fr/versions/8428/pdf_file` oder überall die Anzeige-URL) · **Wert ergänzen** bei beurkundung.ts:271, :299, :372 (Grundgebühr Art. 4 Ziff. 5 lit. g, Fr. 200–1000, zusätzlich).
- Vertrauen: **hoch** für die Beträge (französischer und deutscher Volltext plus Annexe-1-Betragstabelle gegengelesen); **mittel** für die Subsumtionen unter den Auffangtatbestand ch. 12 — die sind Auslegung, nicht Wortlaut, und sollten in der fachlichen Abnahme mitgeprüft werden.

---

## FR RSF 635.1.1 — Loi sur les droits de mutation et les droits sur les gages immobiliers (LDMG)
- Fassung amtlich: Version **8656**, «du 01.05.1996 (version entrée en vigueur le 01.03.2024)», in Kraft seit **2024-03-01** (Beschluss 24.11.2023), URL Fassung: https://bdlf.fr.ch/api/fr/texts_of_law/635.1.1/versions/8656 — Abruf 6.9.2026. `abrogated: false`.
- Hinterlegt: stand «1.1.2024», quelleUrl https://bdlf.fr.ch/app/fr/texts_of_law/635.1.1
- Zwischenfassungen: 7944 (01.01.2024–29.02.2024) → 8656 (seit 01.03.2024). **Tarif-Artikel betroffen: nein.** Einzige Änderung per 01.03.2024: «Art. 9 al. 1, l) — modifié — 24.11.2023 — 2023_113» (Befreiungskatalog).
- Einträge (Datei:Zeile · artikel · regel heute):
  - notariat-grundbuch.ts:187 · Art. 21 · promille 15 (= 1,5 %) → **GLEICH** («Art. 21 Transferts immobiliers – Droits de mutation. 1 Les droits de mutation sont prélevés au taux de 1,5 %.»). Hinweis gedeckt: Art. 22 al. 1 «Le taux des centimes additionnels ne peut excéder 100 % des droits de mutation» → effektiv bis 3,0 %; Art. 19a (Erstwohnung) reduziert die **Bemessungsgrundlage** um 500'000 (Gesamtpreis ≤ 1 Mio.) bzw. 250'000 (1'000'001–1'500'000), keine Reduktion darüber.
- Vorschlag: **nur Stand nachziehen** — neuer stand-String «1.3.2024»; quelleUrl unverändert.
- Vertrauen: **hoch**.

---

## Zusammenzug Gruppe A

| Erlass | Einträge geprüft | GLEICH | ABWEICHUNG | UNKLAR |
|---|---|---|---|---|
| BE BSG 154.21 / Anhang 4B | 9 | 9 | – | – |
| BE BSG 169.81 | 3 | 3 | – | – |
| BS SG 154.810 | 4 | 4 | – | – |
| BS SG 211.110 | 9 | 9 | – | – |
| BS SG 650.100 | 1 | 1 | – | – |
| FR RSF 130.11 | 1 | 1 | – (Hinweis-Ergänzung) | – |
| FR RSF 214.5.16 | 9 | 9 | – | – |
| FR RSF 261.16 | 18 (davon 7 im Tor-DRIFT) | 15 | 3 (Grundgebühr lit. g fehlt) | – |
| FR RSF 635.1.1 | 1 | 1 | – | – |
| **Summe** | **55** | **52** | **3** | **0** |

**Kein einziger Tarif-BETRAG der Gruppe A ist durch die Fassungsdrift falsch geworden.** Alle 45
Tor-DRIFT-Einträge sind reine Stand-/Pin-Nachführung. Die drei materiellen Befunde stammen aus der
Nachverifikation selbst, nicht aus der Drift:
1. FR RSF 261.16, beurkundung.ts:271/:299/:372 — Grundgebühr Fr. 200–1000 (Art. 4 Ziff. 5 lit. g) fehlt bei AG-, GmbH- und Stiftungsgründung.
2. FR RSF 130.11, parteientschaedigung.ts:192 — Hinweis nennt die seit 1.12.2025 geltende Ausnahme «ausser Scheidungsverfahren» nicht.
3. Amtliche Quelle selbst fehlerhaft: RSF 261.16 Art. 4 ch. 1 lit. b, französische Fassung «70 ‰» statt «7 ‰» (deutsche Fassung + Annexe 1 belegen 7 ‰).

---

# W3-TARIF-NACHVERIFIKATION — Befund Gruppe B (20 Einträge, Abruf 6.9.2026)

Methode: LexWork-API `…/api/de/texts_of_law/<nr>` je Erlass → `current_version`,
`old_versions`, `change_documents`; Volltext aus `xhtml_tol` (TG/ZG/SO/LU/AG/SH)
bzw. `versions/<id>/pdf_file` (SG, PyMuPDF-Extrakt). Alle Zeilennummern beziehen
sich auf `main` (Stand d9671d015), Dateien unter `/Users/david/Developer/LexMetrik/src/data/tarif/`.

---

## SG sGS 941.12 — Gerichtskostenverordnung (GKV)
- Fassung amtlich: Version 3863, in Kraft seit 2026-07-01 (Erlassdatum 05.12.2025), URL Fassung: https://www.gesetzessammlung.sg.ch/api/de/versions/3863/pdf_file (kanonisch: https://www.gesetzessammlung.sg.ch/app/de/texts_of_law/941.12), Abruf 6.9.2026
- Hinterlegt: stand «1.3.2012 (Folgefassung 1.7.2026 wortgleich)» bzw. «1.3.2012», quelleUrl https://www.gesetzessammlung.sg.ch/api/de/versions/2808/pdf_file (Version 2808 = Fassung 01.03.2012–30.06.2026, also **überholter Pin**)
- Zwischenfassungen: genau eine Änderung zwischen 2808 und 3863; Änderungsdokument «II. Nachtrag zur Gerichtskostenverordnung vom 5. Dezember 2025, sGS 941.12» (nGS 2026-001, Publikation 21.01.2026, https://www.gesetzessammlung.sg.ch/api/de/change_documents/file_dictionaries/2496/pdf_file). Tarif-Artikel betroffen: **nein** — der Nachtrag ändert ausschliesslich **Art. 30 (Prüfungsgebühr)**; Ziff. II lautet «[keine Änderung anderer Erlasse]». Damit ist die Repo-Behauptung «Folgefassung 1.7.2026 wortgleich» für Art. 4/8/10/11 **belegt** (nicht nur übernommen).
- Einträge:
  - `schlichtung.ts:158` · Art. 8 · rahmen 100–1000 (hinweis: Klagebewilligung 200–1000; Urteilsvorschlag/Entscheid 300–1000; Einigung/Säumnis/Rückzug 100–600) → **GLEICH**. Amtlich Art. 8 Abs. 1 V3863: «Erteilung der Klagebewilligung 200.– bis 1 000.–», «Urteilsvorschlag und Entscheid 300.– bis 1 000.–», «Einigung, Säumnis der klagenden Partei und Rückzug des Schlichtungsgesuchs 100.– bis 600.–».
  - `nicht-vermoegensrechtlich.ts:117` · Art. 8 · rahmen 100–1000 → **GLEICH** (gleiche Fundstelle).
  - `gerichtskosten.ts:267` · Art. 10 (i.V.m. Art. 11) · rahmen 500–6000, kriterienNorm Art. 4 Abs. 2 → **GLEICH**. Amtlich Art. 10 Ziff. 121 «Endentscheide und Zwischenentscheide 500.– bis 6 000.–» (Kollegialgericht), Ziff. 111 Einzelrichter «500.– bis 5 000.–»; Art. 11 Abs. 1: «über Fr. 50 000.– bis Fr. 100 000.– auf höchstens 200 Prozent», «über Fr. 100 000.– bis Fr. 250 000.– auf höchstens 300 Prozent», «je weiteren Fr. 250 000.– je weitere 100 Prozent»; Art. 4 Abs. 2 Bst. a–e wortgleich zu den hinterlegten Kriterien.
  - `nicht-vermoegensrechtlich.ts:45` · Art. 10 Ziff. 121 · rahmen 500–6000 → **GLEICH**.
- Vorschlag: nur Pin/Stand nachziehen — neuer stand-String «1.7.2026», neue quelleUrl `https://www.gesetzessammlung.sg.ch/api/de/versions/3863/pdf_file` (oder kanonisch `…/app/de/texts_of_law/941.12`). Der bisherige Pin auf Version 2808 zeigt auf eine **nicht mehr geltende** Fassung und verletzt damit §7 Bst. c (Live-Link auf die geltende Fassung); der Hinweis «Folgefassung wortgleich» kann als datierte Belegzeile («II. Nachtrag ändert nur Art. 30») erhalten bleiben.
- Vertrauen: hoch — Änderungsdokument im Wortlaut gelesen, alle vier Artikel in der geltenden Fassung nachgelesen.

## SG sGS 914.5 — V. über die Gebühren für Amtshandlungen der Grundbuchämter (GB-GebV)
- Fassung amtlich: Version 2935, in Kraft seit 2020-06-01 (Erlassdatum 24.03.2020), URL Fassung: https://www.gesetzessammlung.sg.ch/api/de/versions/2935/pdf_file, Abruf 6.9.2026
- Hinterlegt: stand «28.10.2014», quelleUrl https://www.gesetzessammlung.sg.ch/app/de/texts_of_law/914.5
- Zwischenfassungen: 2803 (28.10.2014–31.03.2016) → 2804 (01.04.2016–31.12.2019, **Totalrevision** «V. über die Gebühren … vom 10. November 2015») → 2806 (01.01.2020–31.05.2020) → 2935 (seit 01.06.2020). Tarif-Artikel betroffen: **ja** — die Fassung 2804 hat den Gebührentarif neu nummeriert (Nrn. 20.xx Eigentum, 21.xx Grundpfandrechte); die im Eintrag zitierten Nummern 11.01/11.01.01/60.01.02 existieren in der geltenden Fassung nicht mehr.
- Einträge:
  - `notariat-grundbuch.ts:160` (GRUNDPFAND) · «Nr. 11.01 / 11.01.01 / 60.01.02» · promille 2, min 100, max 5000; hinweis «Papier-Schuldbrief 1,5‰ (max. 3’000) / Register 1‰ (max. 2’000); Beurkundung verdoppelt» → **ABWEICHUNG**. Amtlich Art. 10 Nr. 21.01: «Errichtung oder Erhöhung eines Pfandrechts: 1 Promille der Pfandsumme bzw. des Erhöhungsbetrags, je Pfandrecht im Rahmen von 100.– bis 2000.–»; Art. 5 Abs. 1: «Für ein Rechtsgeschäft, das durch die Grundbuchverwalterin oder den Grundbuchverwalter öffentlich beurkundet wird, werden die Gebührenansätze dieses Erlasses über Eintragungen verdoppelt»; Art. 10 Nr. 21.02: «Ausfertigung des Papier-Schuldbriefs bei Errichtung, Umwandlung oder Zerlegung … 300.–».
    → Kombiniert (Beurkundung + Eintrag) amtlich: **2‰, Rahmen 200–4000** je Pfandrecht, zzgl. Fr. 300 nur bei Papier-Schuldbrief. Der Promillesatz 2 ist richtig; **minChf 100 statt 200 und maxChf 5000 statt 4000 sind falsch**. Kein Unterschied mehr zwischen Papier- und Register-Schuldbrief beim Satz (der hinweis mit «1,5‰ / 1‰» stammt aus dem 2014er Tarif). Vergleichs-Konvention derselben Datei: AI-Eintrag `notariat-grundbuch.ts:159` kodiert «1‰+1‰, je min 50/max 2000» als promille 2, min 100, max 4000 — also Verdoppelung von Min UND Max.
- Vorschlag: **Wert ändern** (`notariat-grundbuch.ts:160`): regel `{ typ: 'promille', promille: 2, minChf: 200, maxChf: 4000 }`; artikel → «Art. 10 Nr. 21.01 i.V.m. Art. 5 Abs. 1 (Verdoppelung); Nr. 21.02 Papier-Schuldbrief Fr. 300»; stand → «1.6.2020»; hinweis neu fassen. **Artikel umnummeriert** (alt Nr. 11.01/11.01.01/60.01.02 → neu Nr. 21.01/21.02). Fachliche Abnahme David nötig (§7), da Betragsänderung.
- Vertrauen: hoch für Satz/Nummern (amtliches PDF V2935 gelesen); mittel für die Frage, ob Art. 5 Abs. 1 den Rahmen mitverdoppelt — der Wortlaut «Gebührenansätze … verdoppelt» und die Hausschreibweise (AI/GR/AI-Zeilen) sprechen dafür, eine ausdrückliche Rahmen-Regel fehlt aber.

## TG RB 632.1 — Gesetz über die Gebühren und Gemengsteuern der Grundbuchämter und Notariate (GGG)
- Fassung amtlich: Version 2182, in Kraft seit 2016-01-01 (Beschlussdatum 22.04.2015), URL Fassung: https://www.rechtsbuch.tg.ch/api/de/versions/2182/pdf_file (kanonisch https://www.rechtsbuch.tg.ch/app/de/texts_of_law/632.1), Abruf 6.9.2026
- Hinterlegt: stand «1.4.1997» (= ursprüngliches Inkrafttreten), quelleUrl https://www.rechtsbuch.tg.ch/app/de/texts_of_law/632.1 (kanonisch, kein Versions-Pin)
- Zwischenfassungen: keine Angabe zu Zwischenversionen im API (`old_versions` leer); § 14 trägt den Änderungsstern `*`, die Ansätze der geltenden Fassung sind unten wörtlich belegt. Tarif-Artikel betroffen: **nein, im Ergebnis** — die geltenden Ansätze decken sich mit den hinterlegten Werten.
- Einträge:
  - `notariat-grundbuch.ts:78` (NOTARIAT) · § 14 Abs. 1 · promille 1, min 100, max 5000 → **GLEICH**. Amtlich: «Für die öffentliche Beurkundung von Verträgen über Rechte an Grundstücken wird 1 ‰ des Vertragswertes, mindestens Fr. 100, höchstens Fr. 5'000, erhoben.»
  - `notariat-grundbuch.ts:123` (GRUNDBUCH) · § 14 Abs. 2 Ziff. 1 · promille 4, min 100, max 20000 → **GLEICH**. Amtlich: «buchliche und ausserbuchliche Eigentumsänderungen … 4 ‰, mindestens Fr. 100, höchstens Fr. 20'000». Hinweis «Sonderfälle 1‰ (Erbgang/Ehegatten, max. 2’000)» gedeckt durch Ziff. 3 und Ziff. 4 (je «1 ‰, mindestens Fr. 100, höchstens Fr. 2'000»).
  - `notariat-grundbuch.ts:163` (GRUNDPFAND) · § 14 Abs. 1 / Abs. 2 Ziff. 11 · promille 2.5, min 200, max 15000 → **GLEICH**. Amtlich Ziff. 11: «Eintragung eines Grundpfandrechtes oder einer Pfandrechtserhöhung: 1½ ‰ der Pfandsumme, mindestens Fr. 100, höchstens Fr. 10'000»; zusammen mit Abs. 1 (1‰, 100–5'000) ergibt das 2,5‰, 200–15'000.
- Vorschlag: nur Pin/Stand nachziehen — neuer stand-String «1.1.2016», quelleUrl unverändert (kanonischer Link).
- Vertrauen: hoch — Volltext der geltenden Fassung (xhtml_tol) gelesen.

## TG RB 640.1 — Steuergesetz
- Fassung amtlich: Version 2929, in Kraft seit 2025-01-01 **bis 31.12.2028** (Beschlussdatum 19.02.2025), URL Fassung: https://www.rechtsbuch.tg.ch/app/de/texts_of_law/640.1, Abruf 6.9.2026
- Hinterlegt: stand «1.1.1993», quelleUrl https://www.rechtsbuch.tg.ch/app/de/texts_of_law/640.1
- Zwischenfassungen: zahlreiche (Steuergesetz), im API nicht einzeln ausgewertet; Tarif-Artikel betroffen: **nein** — § 140 der geltenden Fassung trägt den Ansatz unverändert.
- Einträge:
  - `notariat-grundbuch.ts:197` (HANDAENDERUNGSSTEUER) · § 140 Abs. 1 · promille 10 (= 1 %) → **GLEICH**. Amtlich § 140 Abs. 1: «Der Steuersatz beträgt 1 Prozent.» Hinweis «Befreiung Eltern–Nachkommen/Geschwister (§ 138)» gedeckt: § 138 Abs. 1 «… sowie Handänderungen zwischen Eltern und Nachkommen, Stief- oder Schwiegerkindern und zwischen Geschwistern sind von der Handänderungssteuer befreit» (der hinweis nennt Stief-/Schwiegerkinder nicht — Unvollständigkeit, kein Fehler).
- Vorschlag: nur Pin/Stand nachziehen — neuer stand-String «1.1.2025», quelleUrl unverändert. Zusatz: die geltende Fassung ist **befristet bis 31.12.2028**, das gehört ins Verfallsregister.
- Vertrauen: hoch.

## ZG BGS 161.7 — V. über die Kosten in der Zivil- und Strafrechtspflege (KoV OG)
- Fassung amtlich: Version 3033, in Kraft seit 2026-07-01 (Beschlussdatum 23.06.2026), URL Fassung: https://bgs.zg.ch/api/de/versions/3033/pdf_file (kanonisch https://bgs.zg.ch/app/de/texts_of_law/161.7), Abruf 6.9.2026
- Hinterlegt: stand «1.1.2026», quelleUrl https://bgs.zg.ch/app/de/texts_of_law/161.7
- Zwischenfassungen: 2963 (01.01.2026–30.06.2026) → 3033 (seit 01.07.2026), Änderungsdokument vom 25.06.2026 (https://bgs.zg.ch/api/de/change_documents/file_dictionaries/3259/pdf_file). Tarif-Artikel betroffen: **nein im Ergebnis** — §§ 3, 10, 11 der geltenden Fassung stimmen Wert für Wert mit den hinterlegten Daten überein (unten belegt).
- Einträge:
  - `schlichtung.ts:91` · § 10 · staffel_rahmen 1000:50–250 / 10'000:200–400 / 100'000:300–600 / ∞:500–1200 → **GLEICH**. Amtlich § 10 Abs. 1: «bis und mit 1000 → 50 bis 250; über 1000 bis und mit 10’000 → 200 bis 400; über 10’000 bis und mit 100’000 → 300 bis 600; über 100’000 → 500 bis 1200; in Prozessen ohne bestimmten Streitwert → 100 bis 800». Hinweis-Zuschlag gedeckt durch Abs. 2 («Zuschlag von Franken 100 bis 800»).
  - `nicht-vermoegensrechtlich.ts:105` · § 10 · rahmen 100–800 → **GLEICH** (Zeile «in Prozessen ohne bestimmten Streitwert 100 bis 800»).
  - `gerichtskosten.ts:154` · § 11 Abs. 1 · staffel_rahmen 12 Bänder (100–200 / 220–540 / 540–800 / 800–1400 / 1400–2400 / 2400–4000 / 4000–6000 / 6000–10'000 / 10'000–17'500 / 17'500–25'000 / 25'000–60'000 / ab 60'000 max 1,2 %) → **GLEICH**, Band für Band gegen die amtliche Tabelle geprüft; kriterienNorm § 3 Abs. 1 amtlich: «a) der Streitwert bzw. das tatsächliche Streitinteresse in Zivilverfahren; b) die Bedeutung des Falls; c) der Zeitaufwand und die Schwierigkeit des Falls.»
  - `nicht-vermoegensrechtlich.ts:37` · § 11 Abs. 2 · rahmen 150–12'000 → **GLEICH**. Amtlich: «Bei nicht vermögensrechtlichen Streitigkeiten beträgt die Entscheidgebühr Franken 150 bis 12’000.»
- Vorschlag: nur Pin/Stand nachziehen — neuer stand-String «1.7.2026», quelleUrl unverändert.
- Vertrauen: hoch.

## SO BGS 615.11 — Gebührentarif (GT)
- Fassung amtlich: Version 5606, in Kraft seit 2026-03-01 (Beschlussdatum 11.11.2025), URL Fassung: https://bgs.so.ch/api/de/versions/5606/pdf_file (kanonisch https://bgs.so.ch/app/de/texts_of_law/615.11), Abruf 6.9.2026
- Hinterlegt (nur die 4 DRIFT-Einträge): stand «1.1.2025», quelleUrl https://bgs.so.ch/app/de/texts_of_law/615.11
- Zwischenfassungen: 5527 (01.01.2025–31.12.2025) → 5605 (01.01.2026–28.02.2026) → 5606 (seit 01.03.2026); Änderungserlass «Änderung des Gebührentarifs (GT); Umsetzung Massnahmenplan 2» (11.11.2025). Tarif-Artikel betroffen: **nein im Ergebnis** — §§ 25 und 145 der geltenden Fassung tragen die hinterlegten Werte unverändert.
- Einträge:
  - `notariat-grundbuch.ts:57` (NOTARIAT) · § 25 Abs. 1 lit. a · rahmen 100–10'000 → **GLEICH**. Amtlich § 25 Abs. 1: «a) Kauf-, Tausch- und Schenkungsvertrag 100-10'000».
  - `notariat-grundbuch.ts:111` (GRUNDBUCH) · § 25 Abs. 1 lit. a · rahmen 100–10'000 → **GLEICH** (gleiche Fundstelle).
  - `notariat-grundbuch.ts:154` (GRUNDPFAND) · § 25 Abs. 1 lit. m · rahmen 20–10'000 → **GLEICH**. Amtlich: «m) in separater Urkunde begründete Errichtung oder Abänderung eines Grundpfandrechtes 20-10'000».
  - `nicht-vermoegensrechtlich.ts:39` · § 145 Abs. 3 · rahmen 200–20'000 → **GLEICH**. Amtlich § 145 Abs. 3: «Kann der Streitwert nicht beziffert werden, beträgt die Entscheidgebühr 200-20'000 Franken.»
  - (Ergänzend, nicht DRIFT, mitgeprüft: § 144 «Pauschalgebühr von 200-1'500 Franken» und § 145 Abs. 1/2-Bänder decken `schlichtung.ts:110` und `gerichtskosten.ts:185` — beide GLEICH.)
- Vorschlag: nur Pin/Stand nachziehen — neuer stand-String «1.3.2026» für die vier Einträge mit «1.1.2025», quelleUrl unverändert.
- Vertrauen: hoch.

## LU SRL Nr. 645 — Gesetz über die Handänderungssteuer (HStG)
- Fassung amtlich: Version 4351, in Kraft seit 2025-01-01 (Beschlussdatum 18.03.2024), URL Fassung: https://srl.lu.ch/api/de/versions/4351/pdf_file (kanonisch https://srl.lu.ch/app/de/texts_of_law/645), Abruf 6.9.2026
- Hinterlegt: stand «1.6.2013», quelleUrl https://srl.lu.ch/app/de/texts_of_law/645
- Zwischenfassungen: 1552 (01.06.2013–30.06.2014) → 2343 (01.07.2014–31.12.2017) → 3166 (01.01.2018–31.12.2019) → 3499 (01.01.2020–31.12.2024) → 4351 (seit 01.01.2025, via «Steuergesetz (StG)» vom 30.11.2024). Tarif-Artikel betroffen: **nein** — § 6 trägt keinen Änderungsstern und lautet unverändert.
- Einträge:
  - `notariat-grundbuch.ts:180` (HANDAENDERUNGSSTEUER) · § 6 · promille 15 (= 1,5 %) → **GLEICH**. Amtlich § 6 Abs. 1: «Die Handänderungssteuer beträgt 1½ Prozent des Handänderungswerts.» Hinweis gedeckt durch § 3 Abs. 1 Ziff. 2 (Ehegatten, eingetragene/Lebenspartner, Verwandte in auf- und absteigender Linie) und Ziff. 6 («Rechtsgeschäfte mit einem Handänderungswert von weniger als Fr. 20 000.–») — beides sind **selbständige** Befreiungsgründe; die hinweis-Formulierung «frei bei Ehegatten/gerader Linie **und** Wert < 20’000» liest sich fälschlich kumulativ.
- Vorschlag: nur Pin/Stand nachziehen — neuer stand-String «1.1.2025», quelleUrl unverändert; zusätzlich hinweis-Wortlaut «und» → «bzw.» (Klarstellung, kein Wertwechsel).
- Vertrauen: hoch.

## AG SAR 725.100 — Gesetz über die Grundbuchabgaben (GBAG) — **DRIFT ist Fehlalarm (falscher Erlass verlinkt)**
- Fassung amtlich: GBAG SAR 725.100 = Version 2796, in Kraft seit 2020-01-01; **massgeblich für diesen Eintrag ist aber SAR 725.110 (Dekret über die Grundbuchgebühren) = Version 3795, in Kraft seit 2018-01-01** (Beschlussdatum 27.06.2017), URL Fassung: https://gesetzessammlungen.ag.ch/api/de/versions/3795/pdf_file (kanonisch https://gesetzessammlungen.ag.ch/app/de/texts_of_law/725.110), Abruf 6.9.2026
- Hinterlegt: stand «2018-01-01», erlassNr «SAR 725.100», artikel «§ 13 Dekret über die Grundbuchgebühren (SAR 725.110)», quelleUrl https://gesetzessammlungen.ag.ch/app/de/texts_of_law/725.100
- Zwischenfassungen: für 725.110 keine seit 2018-01-01 (nur 1363 bis 31.12.2017, 481 bis 31.12.2011). Tarif-Artikel betroffen: **nein** — der hinterlegte Stand entspricht exakt der geltenden Fassung des zitierten Erlasses.
- Einträge:
  - `grundbuch.ts:209` · § 13 Dekret SAR 725.110 · fix CHF 40 → **GLEICH**. Amtlich § 13 (V3795): «Für die Einschreibung von Anmerkungen, die nicht Zugehör betreffen, beträgt die Gebühr Fr. 40.–.» Hinweis-Teil «Zugehör ½‰, min Fr. 50 / max Fr. 500 (§ 25 GBAG)» amtlich bestätigt (GBAG V2796 § 25 Abs. 1). **Zitatfehler im hinweis:** die Gebührenfreiheit der Löschungen steht in **§ 18** des Dekrets («Für die Löschung von Anmerkungen, Vormerkungen, Dienstbarkeiten und Grundlasten sind keine Gebühren zu entrichten»), nicht in § 16 (§ 16 = «Andere Vormerkungen», Fr. 40.–).
- Vorschlag: **Erlass-Zuordnung korrigieren** — erlassNr «SAR 725.110» (bzw. «SAR 725.110 i.V.m. 725.100»), quelleUrl auf `https://gesetzessammlungen.ag.ch/app/de/texts_of_law/725.110`; stand «2018-01-01» bleibt richtig. Zusätzlich hinweis «§16 Dekret» → «§18 Dekret». Werte unverändert. **Wurzelbefund fürs Tor:** solange quelleUrl und artikel auf verschiedene Erlasse zeigen, meldet `check:tarif-drift` einen Fehlalarm.
- Vertrauen: hoch.

## SH 221.101 (ergänzend 211.433) — Notariatsgebührenverordnung / Grundbuchgebührenverordnung — **DRIFT ist Fehlalarm (falscher Erlass verlinkt)**
- Fassung amtlich: Notariatsgebührenverordnung SHR 221.101 = Version 1125, in Kraft seit 2016-01-01; **massgeblich für diesen Eintrag ist aber SHR 211.433 (Grundbuchgebührenverordnung) = Version 1813, in Kraft seit 2011-01-01** (Beschlussdatum 21.12.2010), URL Fassung: https://rechtsbuch.sh.ch/api/de/versions/1813/pdf_file (kanonisch https://rechtsbuch.sh.ch/app/de/texts_of_law/211.433), Abruf 6.9.2026
- Hinterlegt: stand «01.01.2011», artikel «211.433 § 13 Abs. 1 Ziff. 4», quelleUrl https://rechtsbuch.sh.ch/app/de/texts_of_law/221.101
- Zwischenfassungen: für 211.433 seit 2011-01-01 keine (nur eine formlose Berichtigung vom 24.06.2024, Version 190). Tarif-Artikel betroffen: **nein**.
- Einträge:
  - `beurkundung.ts:85` (Dienstbarkeit) · 211.433 § 13 Abs. 1 Ziff. 4 · rahmen 50–500 → **GLEICH**. Amtlich § 13 Abs. 1 Ziff. 4 (V1813): «Dienstbarkeit, Grundlast (inkl. Änderung): Fr. 50.00 bis Fr. 500.00».
- Vorschlag: **Erlass-Zuordnung korrigieren** — für diesen Eintrag quelleUrl auf `https://rechtsbuch.sh.ch/app/de/texts_of_law/211.433` (der Artikel stammt aus 211.433, nicht aus 221.101); stand «01.01.2011» bleibt richtig. Werte unverändert. Gleicher Wurzelbefund wie AG.
- Vertrauen: hoch.

---

## Zähler Gruppe B
| Erlass | Einträge | GLEICH | ABWEICHUNG | UNKLAR |
|---|---|---|---|---|
| SG sGS 941.12 | 4 | 4 | 0 | 0 |
| SG sGS 914.5 | 1 | 0 | 1 | 0 |
| TG RB 632.1 | 3 | 3 | 0 | 0 |
| TG RB 640.1 | 1 | 1 | 0 | 0 |
| ZG BGS 161.7 | 4 | 4 | 0 | 0 |
| SO BGS 615.11 | 4 | 4 | 0 | 0 |
| LU SRL Nr. 645 | 1 | 1 | 0 | 0 |
| AG SAR 725.100 | 1 | 1 | 0 | 0 |
| SH 221.101 | 1 | 1 | 0 | 0 |
| **Summe** | **20** | **19** | **1** | **0** |

---

# W3-TARIF-NACHVERIFIKATION — Befund Gruppe C (OW · NW · GL · VS · AR)

Abruf aller Quellen: 6.9.2026, LexWork-API `/api/{de|fr}/texts_of_law/<nr>`
(Volltext aus `selected_version.xhtml_tol`, bei OW 210.32 aus dem Fassungs-PDF
`/api/de/versions/256/pdf_file`). Read-only, nichts im Repo geändert.

---

## OW GDB 210.32 — Verordnung über die Beurkundungsgebühren
- Fassung amtlich: Version **256**, in Kraft seit **2013-01-01** (Beschlussdatum 15.03.2012),
  URL Fassung: https://gdb.ow.ch/api/de/versions/256/pdf_file · Meta:
  https://gdb.ow.ch/api/de/texts_of_law/210.32 · Abruf 6.9.2026. `abrogated: false`.
- Hinterlegt: stand «2012-04-01» (16 Einträge) bzw. «1.4.2012» (1 Eintrag),
  quelleUrl https://gdb.ow.ch/app/de/texts_of_law/210.32
- Zwischenfassungen: **keine** — `old_versions: []`, `future_versions: []`; einziges
  `change_documents`-Dokument ist die Urfassung selbst (OGS 2012, 018 – ABl 2012, 483,
  «Verordnung über die Beurkundungsgebühren vom 15. März 2012»). Tarif-Artikel betroffen:
  **nein**. Die Drift ist ein reiner Stand-String-Artefakt: das Repo trägt das
  `enactment`-Datum (1.4.2012), das Portal das In-Kraft-Datum der (einzigen) Fassung (1.1.2013).
  Der Text ist derselbe.
- Einträge (Datei:Zeile · artikel · regel heute) — amtlicher Wert zuerst erhoben, dann verglichen:
  - `src/data/tarif/notariat-grundbuch.ts:37` · Art. 10 Ziff. 12 · Staffel 3‰/2‰/1‰ (300k/600k), min 600 → **GLEICH**
    (Ziff. 12: «3 ‰ der Vertragssumme bis Fr. 300 000.–, plus 2 ‰ vom Mehrbetrag bis Fr. 600 000.–, plus 1 ‰ vom Mehrbetrag über Fr. 600 000.–, mindestens 600.–»)
  - `src/data/tarif/beurkundung.ts:41` · Ziff. 20 i.V.m. Ziff. 12 (Baurecht) · dieselbe Staffel → **GLEICH** (Ziff. 20: «gemäss Ziff. 12»; Vertragssumme = Leistung des Bauberechtigten, 20-facher Betrag bei unbestimmter Zeit/>20 Jahre — im Hinweis korrekt abgebildet)
  - `src/data/tarif/beurkundung.ts:59` · Ziff. 26 lit. d (limitierte Vorkaufsrechte) · halbierte Staffel 1,5/1/0,5‰, min 300 → **GLEICH** (Ziff. 26 d: «die Hälfte der Gebühr gemäss Ziff. 12»; Halbierung auch des Mindestansatzes 600→300 ist Auslegung, im Hinweis offengelegt)
  - `src/data/tarif/beurkundung.ts:83` · Ziff. 16 (+17/19/21) · rahmen 200–1500 → **GLEICH** (Ziff. 16 «200.– bis 1 500.–»; Ziff. 17/19/21 je «200.– bis 800.–»)
  - `src/data/tarif/beurkundung.ts:104` · Ziff. 23 (Grundpfand) · 1,5/1/0,5‰, min 400 → **GLEICH** («1,5 ‰ von der Pfandsumme bis Fr. 300 000.–, plus 1 ‰ … plus 0,5 ‰ …, mindestens 400.–»; Reduktion ¼ bzw. max ½ im Hinweis)
  - `src/data/tarif/beurkundung.ts:157` · Ziff. 10 (Erbvertrag) · Sockel 500(–1800) + 1‰, max 20000 → **GLEICH** («Erbvertrag … 500.– bis 1 800.–, zuzüglich 1 ‰ des Verfügungswerts, höchstens insgesamt 20 000.–»)
  - `src/data/tarif/beurkundung.ts:185` · Ziff. 3 (Ehevertrag) · rahmen 500–1800 → **GLEICH**
  - `src/data/tarif/beurkundung.ts:212` · Ziff. 28 (Schenkung Grundstücke) · Staffel wie Ziff. 12 → **GLEICH** («Schenkung von Grundstücken · OR 243 · gemäss Ziff. 12»)
  - `src/data/tarif/beurkundung.ts:254` · Ziff. 30 (Verpfründung) · Staffel 3/2/1‰, min 600 → **GLEICH**
  - `src/data/tarif/beurkundung.ts:279` · Ziff. 31 lit. a (AG) · 3/2/1‰ bei 200k/500k, min 800, max 20000 → **GLEICH**
  - `src/data/tarif/beurkundung.ts:307` · Ziff. 32 (GmbH) · dieselbe Staffel → **GLEICH** («Gesellschaft mit beschränkter Haftung · OR 772 ff. · gemäss Ziff. 31»)
  - `src/data/tarif/beurkundung.ts:335` · Ziff. 31 lit. b (Kapitalerhöhung) · Staffel 31a → **GLEICH** (VR-Beschluss «gemäss Ziff. 31 Bst. a»; GV-Beschluss «200.– bis 1800.–», im Hinweis genannt)
  - `src/data/tarif/beurkundung.ts:356` · Ziff. 31 lit. c (Kapitalherabsetzung) · rahmen 300–2000 → **GLEICH**
  - `src/data/tarif/beurkundung.ts:380` · Ziff. 2 (Stiftung) · Sockel 500(–1800) + 1‰, max 20000 → **GLEICH**
  - `src/data/tarif/beurkundung.ts:408` · Ziff. 29 (Bürgschaft) · 1‰, min 250, max 1000 → **GLEICH**
  - `src/data/tarif/beurkundung.ts:433` · Ziff. 40 (Andere Urkunden) · rahmen 200–1800 → **GLEICH**
  - `src/data/tarif/beurkundung.ts:457` · Ziff. 1 (Beglaubigung) · fix 15 → **GLEICH** («für Beglaubigungen je Seite oder Unterschrift 15.–»)
- Vorschlag: **nur Pin/Stand nachziehen** — neuer stand-String «1.1.2013» (einheitlich für alle 17
  Einträge, ersetzt «2012-04-01»/«1.4.2012»); quelleUrl unverändert
  (https://gdb.ow.ch/app/de/texts_of_law/210.32).
- Vertrauen: **hoch** — einzige je publizierte Fassung, Volltext-PDF der geltenden Fassung Ziffer für Ziffer gelesen.

## OW GDB 134.15 — Gebührenordnung für die Rechtspflege (GebOR)
- Fassung amtlich: Version **1793**, in Kraft seit **2015-03-01** (Beschlussdatum 04.12.2014),
  URL: https://gdb.ow.ch/app/de/texts_of_law/134.15 (API https://gdb.ow.ch/api/de/texts_of_law/134.15), Abruf 6.9.2026.
- Hinterlegt: stand «1.1.2011», quelleUrl https://gdb.ow.ch/app/de/texts_of_law/134.15
- Zwischenfassungen: eine — Version 113, in Kraft 01.01.2011–28.02.2015; Änderung durch
  «Gesetz über die Anpassungen aufgrund der Evaluation der Justizreform vom 4. Dezember 2014»
  (OGS 2014, 052). Tarif-Artikel betroffen: **ja, formell** (Art. 8 trägt im Änderungsapparat den
  Stern `*`) — der Betrag ist in der geltenden Fassung aber identisch mit dem hinterlegten.
- Einträge:
  - `src/data/tarif/schlichtung.ts:66` · Art. 8 · rahmen 100–1000 → **GLEICH**:
    amtlich «Im Schlichtungs- und Entscheidverfahren betragen die Gebühren Fr. 100.– bis Fr. 1 000.–» (Art. 8 Abs. 1)
- Vorschlag: **nur Pin/Stand nachziehen** — stand «1.3.2015» (wie die übrigen OW-134.15-Einträge im Repo bereits tragen); quelleUrl unverändert.
- Vertrauen: **hoch** — Volltext der geltenden Fassung gelesen, Wortlaut zitiert.

## NW NG 261.2 — Prozesskostengesetz (PKoG)
- Fassung amtlich: Version **1288**, in Kraft seit **2016-01-01** (Beschlussdatum 27.05.2015),
  URL: https://gesetze.nw.ch/app/de/texts_of_law/261.2, Abruf 6.9.2026.
- Hinterlegt: stand «1.1.2011», quelleUrl https://gesetze.nw.ch/app/de/texts_of_law/261.2
- Zwischenfassungen: eine Vorgängerfassung (id 89, Urfassung vom 19.10.2011, in Kraft seit 01.01.2012,
  formlos berichtigt 01.07.2024); `change_documents` leer. Tarif-Artikel betroffen: **nein** (Art. 6 ohne Änderungsstern).
  Nebenbefund: der hinterlegte Stand «1.1.2011» liegt sogar VOR dem Erlassdatum (19.10.2011) — er war schon bisher falsch.
- Einträge:
  - `src/data/tarif/schlichtung.ts:73` · Art. 6 · Staffel 100–300 / 200–500 / 300–700 → **GLEICH**:
    amtlich Art. 6 Abs. 1 «bis Fr. 5'000.–: Fr. 100.– bis Fr. 300.–; über Fr. 5'000.– bis Fr. 30'000.–: Fr. 200.– bis Fr. 500.–; über Fr. 30'000.–: Fr. 300.– bis Fr. 700.–»; Abs. 3 «kann sie die Gebühr bis um die Hälfte erhöhen» (= Hinweis).
- Vorschlag: **nur Pin/Stand nachziehen** — stand «1.1.2016» (identisch mit dem NW-Eintrag in `gerichtskosten.ts:122`); quelleUrl unverändert.
- Vertrauen: **hoch**.

## NW NG 521.1 — Steuergesetz (StG)
- Fassung amtlich: Version **1468**, in Kraft seit **2026-01-01** (Beschlussdatum 02.12.2025),
  URL: https://gesetze.nw.ch/app/de/texts_of_law/521.1, Abruf 6.9.2026.
- Hinterlegt: stand «1.1.2001», quelleUrl https://gesetze.nw.ch/app/de/texts_of_law/521.1
- Zwischenfassungen: viele (u. a. 1337 für 2025, 1231, 1107 für 2023–2024 …); letzte Änderung
  «Verordnung zur Änderung des Gesetzes über die Steuern …» vom 02.12.2025 (NG 2026-007).
  Tarif-Artikel betroffen: **nein** — Art. 140 trägt keinen Änderungsstern; geändert im Umfeld
  ist nur Art. 139 Abs. 1 Ziff. 5 (Umstrukturierungen, Steuerbefreiung), was den Satz nicht berührt.
- Einträge:
  - `src/data/tarif/notariat-grundbuch.ts:184` · Art. 140 · promille 10 (= 1 %) → **GLEICH**:
    amtlich Art. 140 Abs. 1 «Der feste Steuersatz beträgt ein Prozent des Handänderungswertes gemäss Art. 138.»
    Befreiungen laut Hinweis (Erbgang, Ehegatten, Eltern/Kinder) durch Art. 139 Abs. 1 Ziff. 1–3 gedeckt.
- Vorschlag: **nur Pin/Stand nachziehen** — stand «1.1.2026»; quelleUrl unverändert.
- Vertrauen: **hoch**.

## GL GS III A/5 — Zivil- und Strafprozesskostenverordnung
- Fassung amtlich: Version **2630**, in Kraft seit **2026-01-01** (Beschlussdatum 18.02.2026),
  URL: https://gesetze.gl.ch/app/de/texts_of_law/III-A.5, Abruf 6.9.2026.
- Hinterlegt: stand «1.1.2011», quelleUrl https://gesetze.gl.ch/app/de/texts_of_law/III-A.5
- Zwischenfassungen: eine — Version 709, in Kraft 01.01.2011–31.12.2025. Änderungserlass
  **SBE 2026 08** vom 18.02.2026 (https://gesetze.gl.ch/api/de/change_documents/file_dictionaries/709/pdf_file),
  Wortlaut: «Art. 7 Abs. 1 … II. Keine anderen Erlasse geändert.» Tarif-Artikel betroffen: **nein** —
  geändert wurde ausschliesslich Art. 7 Abs. 1 (Strafuntersuchungsverfahren), nicht Art. 2.
- Einträge:
  - `src/data/tarif/schlichtung.ts:84` · Art. 2 · rahmen 100–800 → **GLEICH**:
    amtlich Art. 2 Abs. 1 «Im Schlichtungsverfahren beträgt die Pauschalgebühr 100 bis 800 Franken.»
- Vorschlag: **nur Pin/Stand nachziehen** — stand «1.1.2026» (wie `nicht-vermoegensrechtlich.ts:104` bereits trägt); quelleUrl unverändert.
- Vertrauen: **hoch** — Änderungsdokument der einzigen Zwischenänderung im Wortlaut geprüft.

## GL GS III B/7/1 — Verordnung über die Gebühren im Zivilrecht (GebT ZGB)
- Fassung amtlich: Version **2628**, in Kraft seit **2026-01-01** (Beschlussdatum 18.02.2026),
  URL: https://gesetze.gl.ch/app/de/texts_of_law/III-B.7.1 (Repo-Form: …/texts_of_law/III%20B%2F7%2F1), Abruf 6.9.2026.
- Hinterlegt: stand «1.1.2022», quelleUrl https://gesetze.gl.ch/app/de/texts_of_law/III%20B%2F7%2F1
- Zwischenfassungen: 2272 (01.01.2022–31.12.2025), davor 2085 (2020), 1876 (2016). Änderungserlass
  **SBE 2026 06** vom 18.02.2026 (https://gesetze.gl.ch/api/de/change_documents/file_dictionaries/707/pdf_file),
  Wortlaut: geändert wird «Art. 14 Abs. 1 — Beglaubigungen und Bescheinigungen» (Apostille 35 Fr.,
  Legalisation 30 Fr., einfache Beglaubigung 25 Fr.), «II. Keine anderen Erlasse geändert.»
  Tarif-Artikel betroffen: **nein** (Art. 13 unverändert).
- Einträge:
  - `src/data/tarif/notariat-grundbuch.ts:108` · Art. 13 Abs. 1 Bst. a · promille 3,5, min 100 → **GLEICH**:
    amtlich Art. 13 Abs. 1 Bst. a «Übertragung von Grundeigentum: 3,5 ‰ des Erwerbspreises oder höheren Steuerwerts (Ausnahmen: Bst. b–e), mind. 100 Fr.»
- Vorschlag: **nur Pin/Stand nachziehen** — stand «1.1.2026» (deckungsgleich mit den GL-Einträgen in `grundbuch.ts`); quelleUrl unverändert.
- Vertrauen: **hoch**.

## GL «GS III B/3/2 / III B/7/1» — Beurkundungstarif + GebT ZGB (zusammengesetzter Eintrag)
- Fassung amtlich: für III B/7/1 Version **2628**, in Kraft seit **2026-01-01** (s. o.);
  für III B/3/2 Version **1322**, in Kraft seit **2009-01-01** (Beschlussdatum 26.11.2008),
  URL https://gesetze.gl.ch/app/de/texts_of_law/III%20B%2F3%2F2 — dort keine Zwischenfassung (`old_versions: []`). Abruf 6.9.2026.
- Hinterlegt: stand «1.1.2022», quelleUrl https://gesetze.gl.ch/app/de/texts_of_law/III%20B%2F7%2F1
- Zwischenfassungen: wie III B/7/1 oben; Tarif-Artikel betroffen: **nein**.
- Einträge:
  - `src/data/tarif/notariat-grundbuch.ts:151` · «Art. A1-1 Ziff. 7.1 / Art. 13 Abs. 2 Bst. a» · promille 3, **minChf 100** →
    **ABWEICHUNG (Mindestbetrag)**: amtlich GebT ZGB Art. 13 Abs. 2 Bst. a «Errichtung oder Erhöhung eines
    Grundpfandrechtes: 3 ‰ der Pfandsumme bzw. des Erhöhungsbetrages, **mind. 50 Fr.**»; amtlich
    III B/3/2 Anhang Ziff. 7.1 «Errichtung …: 1,5‰ der Pfandsumme, mind. 50 max. 500 Fr.».
    Der kodierte Mindestbetrag 100 ist an keiner der beiden Normen belegt; er ergibt sich nur als
    Summe der beiden Einzelminima (50 + 50). Zugleich bildet die Regel nur den 3‰-Eintragsteil ab,
    obwohl der Hinweis beide Komponenten nennt («Beurkundung 1,5‰ (max. 500) + Eintrag 3‰») —
    die Gesamtlast beträgt bis 500 Fr. Pfandsumme-abhängig 4,5 ‰, nicht 3 ‰.
    Vergleichseintrag im Repo, der die Norm allein korrekt trägt: `src/data/tarif/grundbuch.ts:55` (promille 3, minChf **50**).
- Vorschlag: **Wert prüfen/ändern** (fachlicher Entscheid David): entweder minChf auf 50 senken und den
  Beurkundungsteil separat modellieren, oder den zusammengesetzten Eintrag als solchen dokumentieren
  (Sockel 100 = 50+50) — zusätzlich Stand nachziehen auf «1.1.2026».
- Vertrauen: **hoch** für die Normwerte, **mittel** für die Frage, welche Modellierung gewollt ist (kein Rechenlogik-Kontext geprüft).

## VS SGS/VS 173.8 — Gesetz betreffend den Tarif der Kosten und Entschädigungen (GTar/LTar)
- Fassung amtlich: Version **3360**, in Kraft seit **2025-01-01** (Beschlussdatum 16.11.2023),
  URL: https://lex.vs.ch/app/de/texts_of_law/173.8, Abruf 6.9.2026.
- Hinterlegt: stand «1.1.2018», quelleUrl https://lex.vs.ch/app/de/texts_of_law/173.8
- Zwischenfassungen: u. a. 3205 (01.01.2023–31.12.2024), 3025, 3024 (01.05.2022–31.12.2022);
  Änderungen RO/AGS 2024-094 und 2024-095 («Gesetz über die Änderungen … aufgrund der Änderung der ZPO»).
  Tarif-Artikel betroffen: **ja, formell** — Art. 15 Abs. 1 lit. a/b und Abs. 2 sowie Art. 17 Abs. 1
  tragen den Änderungsstern `*`; die Beträge der geltenden Fassung sind unten direkt erhoben.
- Einträge:
  - `src/data/tarif/nicht-vermoegensrechtlich.ts:51` · Art. 17 · rahmen 280–9600 → **GLEICH**:
    «Für nicht geldwerte Streitigkeiten des ordentlichen oder vereinfachten Verfahrens belaufen sich die Gebühren auf 280 bis 9'600 Franken.» (Art. 17 Abs. 1)
  - `src/data/tarif/nicht-vermoegensrechtlich.ts:87` · Art. 34 · rahmen 1100–11000 → **GLEICH**:
    «Bei anderen Streitigkeiten und Zivilsachen wird das Honorar auf 1'100 bis 11'000 Franken festgesetzt.» (Art. 34 Abs. 1)
  - `src/data/tarif/nicht-vermoegensrechtlich.ts:123` · Art. 15 · rahmen 60–500 → **GLEICH (Zahl)**, aber
    **Hinweis falsch zugeordnet**: 60–500 ist Art. 15 **Abs. 2** («Für vermögensrechtliche Streitigkeiten,
    deren Streitwert 2'000 Franken nicht übersteigt, und für Entscheidvorschläge wird eine Gebühr von 60 bis
    500 Franken erhoben»), nicht «Citation + séance» — das ist Art. 15 Abs. 1 lit. a (50–100) + lit. b (120–250),
    zusammen 170–350. Der Parallel-Eintrag `src/data/tarif/schlichtung.ts:219` beschreibt beides korrekt
    (rahmen 50–500, stand 1.1.2025) — die beiden Einträge widersprechen einander in der Begründung.
- Vorschlag: **Pin/Stand nachziehen** — stand «1.1.2025» für alle drei Einträge; quelleUrl unverändert.
  Zusätzlich Hinweis-Text bei `nicht-vermoegensrechtlich.ts:123` auf Art. 15 Abs. 2 korrigieren (Wert bleibt).
- Vertrauen: **hoch** für Art. 17/34, **hoch** für die Zahl bei Art. 15, **mittel** für die Frage, welcher
  Absatz im Rechner gemeint sein soll (fachlicher Entscheid).

## VS SR 173.8 — Gebührentarif (LTar), Parteientschädigung
- Fassung amtlich: Version **3360**, in Kraft seit **2025-01-01**;
  URL DE https://lex.vs.ch/app/de/texts_of_law/173.8 · URL FR https://lex.vs.ch/app/fr/texts_of_law/173.8, Abruf 6.9.2026.
- Hinterlegt: stand «1.1.2018», quelleUrl https://lex.vs.ch/app/fr/texts_of_law/173.8
- Zwischenfassungen: wie oben (3205/3025/3024 …); Tarif-Artikel betroffen: **unklar** — Art. 32 selbst trägt
  keinen Absatz-Stern, die Tabellenzeilen sind im xhtml nicht einzeln markiert.
- Einträge:
  - `src/data/tarif/parteientschaedigung.ts:398` · Art. 32 (i.V.m. Art. 27/28) · 11-bändige Staffel →
    **ABWEICHUNG (zwei Punkte)**:
    1. **Band 900'001–1'000'000: Sprachfassungen der amtlichen Quelle widersprechen sich.**
       DE (Version 3360): «von 33'100 bis 41'200 Franken» · FR (Version 3360): «de 33'300 à 41'200 francs».
       Das Repo trägt 33'300 (= FR, passend zur hinterlegten `quelleUrl` /fr/). Kein Repo-Fehler, aber ein
       **Quellenkonflikt**, der nicht durch Nachziehen des Stands verschwindet → **UNKLAR**, David-Entscheid
       (VS ist zweisprachig; beide Fassungen sind amtlich).
    2. **Bandraster gröber als der Tarif.** Die amtliche Tabelle hat 22 Streitwertstufen, die Regel 11.
       In den weggelassenen Stufen liegt der kodierte Rahmen ÜBER dem amtlichen, z. B.
       Streitwert 30'001–40'000: amtlich «von 4'700 bis 6'800 Franken», kodiert (Band bis 50'000) 5'800–8'200;
       Streitwert 50'001–60'000: amtlich «von 6'800 bis 9'200 Franken», kodiert (Band bis 100'000) 9'900–13'300;
       Streitwert 100'001–150'000: amtlich «von 11'100 bis 15'400 Franken», kodiert (Band bis 200'000) 12'800–17'600;
       Streitwert 500'001–600'000: amtlich «von 24'500 bis 30'800 Franken», kodiert (Band bis 1'000'000) 33'300–41'200.
       Alle übrigen kodierten Stufen (≤2000, 2001–10'000, 10'001–15'000, 15'001–20'000, 20'001–30'000,
       40'001–50'000, 90'001–100'000, 150'001–200'000, 450'001–500'000, >1 Mio 3,3 % max 140'000) sind **GLEICH**.
- Vorschlag: **Wert ändern** (fehlende Zwischenbänder ergänzen — 22 statt 11 Stufen) **und** Stand nachziehen
  auf «1.1.2025»; Sprachkonflikt 33'100/33'300 gesondert entscheiden.
- Vertrauen: **hoch** für die erhobenen Werte (beide Sprachfassungen der geltenden Version gelesen),
  **mittel** für die Einordnung des Bandrasters (bewusste Vergröberung oder Fehler ist nicht dokumentiert).

## AR bGS 233.3 — Verordnung über die Rechtskosten und Entschädigungen in der Zivil- und Strafrechtspflege (Gebührenordnung)
- Fassung amtlich: Version **1197**, in Kraft seit **2017-12-01** (Beschlussdatum 25.09.2017),
  URL: https://ar.clex.ch/app/de/texts_of_law/233.3, Abruf 6.9.2026. `abrogated: false`.
- Hinterlegt: stand «15.6.1981 (geltende Fassung)», quelleUrl https://ar.clex.ch/app/de/texts_of_law/233.3
- Zwischenfassungen: 983 (01.01.2016–30.11.2017), 444 (01.01.2004–31.12.2015); Urfassung vom 15.06.1981,
  in Kraft seit 01.07.1981. Tarif-Artikel betroffen: **ja, formell** (Art. 13 trägt den Änderungsstern `*`);
  die Beträge der geltenden Fassung sind identisch mit dem hinterlegten Wert.
- Einträge:
  - `src/data/tarif/schlichtung.ts:144` · Art. 13 · rahmen 50–200 → **GLEICH**:
    amtlich Art. 13 Abs. 1 «Der Vermittler stellt für die Durchführung eines Vermittlungsvorstands oder für
    einen Kostenspruch eine Gebühr von Fr. 50.– bis Fr. 200.– in Rechnung.»; Abs. 2 «für jede weitere
    aufgewendete Stunde Fr. 100.–»; Abs. 3 «Bei einem Streitwert von Fr. 100 000.– und mehr können die
    Ansätze verdoppelt werden.» — der Hinweis im Repo deckt sich damit vollständig.
- Vorschlag: **nur Pin/Stand nachziehen** — stand «1.12.2017» (der bisherige String nennt das Erlassdatum
  1981, nicht die geltende Fassung; identisch mit `gerichtskosten.ts:249`); quelleUrl unverändert.
- Vertrauen: **hoch**.

---

## Nebenbefunde ausserhalb der 28 zugewiesenen Einträge (nicht Auftragsgegenstand, gemeldet nach §17)
- `src/data/tarif/beurkundung.ts:536` (OW, stand «01.01.2013», vom Tor als aktuell gewertet):
  artikel/hinweis ordnen Ziff. 35 lit. a die Staffel «gemäss Ziff. 31 Bst. a» zu. Amtlich (Version 256):
  Ziff. 35 lit. a «des übertragenden Rechtsträgers: **500.– bis 2000.–**»; erst lit. b («des übernehmenden
  Rechtsträgers ohne Kapitalerhöhung, berechnet auf dem zufliessenden Aktivenüberschuss, mindestens 800.–,
  höchstens insgesamt 20 000.–») verweist auf Ziff. 31 Bst. a. Die kodierte Regel entspricht lit. b, das
  Etikett lit. a → mutmasslich falsche Zuordnung, eigener Prüfschritt nötig.
- `src/data/tarif/schlichtung.ts:219` (VS, stand 1.1.2025, rahmen 50–500) und
  `src/data/tarif/nicht-vermoegensrechtlich.ts:123` (VS, rahmen 60–500) beziehen sich beide auf Art. 15 LTar,
  begründen aber verschiedene Untergrenzen mit demselben Hinweis-Baustein (§5 Single Source of Truth).
