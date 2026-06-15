# Grundbuchgebühren je Eintragungsart — alle 26 Kantone

**Erstellt:** 15.6.2026 · **Status: ERSTRECHERCHE, doppelt verifiziert** (find + unabhängiger Doppelcheck je Kanton). FAHRPLAN-BEURKUNDUNGS-AUSBAU (Direktive David: «alle Arten von Grundbuchgebühren»). Daueranweisung: amtlicher Erlass + Artikel + Stand je Wert; nichts «geprüft» ohne Davids Abnahme (§7/§8).

**Methodik:** Workflow `grundbuchgebuehren-research` (26 Kt × Pipeline find→Doppelcheck, 52 Agenten). Getrennte Engine `lib/grundbuchgebuehren.ts`, Daten `data/tarif/grundbuch.ts`. **Gegenprobe:** die `eigentum_kauf`-Werte der Research reproduzieren unabhängig die bereits verifizierte GRUNDBUCH-Schicht. **Doppelcheck-Korrekturen übernommen:** BS Artikel-Unterverweise (§ 51 Abs. 2/4/5/6 statt «Abs. 5 Ziff. X»); ZH Gebührenerlass § 11 (nicht § 8); AI Löschung CHF 10 (Art. 11 Abs. 1 Ziff. 18/19.8).

**Engine-Korrektur (fachlicher Drittcheck 15.6.2026):** AG gewöhnliche Anmerkung = fix CHF 40 (§ 13 Dekret SAR 725.110); der 0,5‰-Satz gilt nur für die Anmerkung von Zugehör (§ 25 GBAG) — in `data/tarif/grundbuch.ts` als Fixbetrag kodiert.

**Hinweis:** In einzelnen Kantonen ist die «Grundbuchgebühr» faktisch eine Wertabgabe/Gemengsteuer (AG GBAG, TI LTORF). Notariats-/Beurkundungsgebühr, Handänderungssteuer, Auslagen und MwSt. sind separat.


## ZH — Zürich
- **Erlass:** Notariatsgebührenverordnung (NotGebV) (LS 243), Stand 1.1.2024 (Fassung 243-123, in Kraft seit 1.1.2024; geltend)
- **Quelle:** https://www.zh.ch/de/politik-staat/gesetze-beschluesse/gesetzessammlung/zhlex-ls/erlass-243-2009_03_09-2009_07_01-123.html
- **Doppelcheck:** Korrekturen übernommen (1)

| Eintragungsart | Behandlung | Regel | Artikel | Konf. |
|---|---|---|---|---|
| eigentum_kauf | promille | 1‰ min 100 | Anhang Ziff. 2.2.1 (i.V.m. § 1, § 6) | hoch |
| eigentum_erbgang | fix | fix 50 | Anhang Ziff. 2.2.5 (Erbfolge) | hoch |
| grundpfand | promille | 1‰ min 100 | Anhang Ziff. 2.3.1 (Eintragung/Erhöhung); 2.3. | hoch |
| dienstbarkeit | promille | 1‰ min 150 max 1000 | Anhang Ziff. 2.4.1 (Eintragung/Ausdehnung); 2. | hoch |
| vormerkung | staffel | 0.5‰ min 100 max 2500 | Anhang Ziff. 2.5.1 (Kaufs-/Vor-/Rückkaufsrecht | hoch |
| baurecht | rahmen | Rahmen 50–500 | Anhang Ziff. 2.1 (Aufnahme als Grundstück); 2. | mittel |
| stockwerkeigentum | rahmen | Rahmen 50–500 | Anhang Ziff. 2.1 (Aufnahme StWE-Anteil als Gru | mittel |
| parzellierung | rahmen | Rahmen 50–200 | Anhang Ziff. 2.6.1 (Mutationen); vgl. 2.2.2 (Q | hoch |
| anmerkung | rahmen | fix 50 | Anhang Ziff. 2.7.3 (Übrige Anmerkungen); 2.7.1 | hoch |
| loeschung | fix | fix 0 | § 4 lit. a NotGebV (Gebührenfreiheit); Vorbeha | hoch |

## BE — Bern
- **Erlass:** Verordnung über die Gebühren der Kantonsverwaltung (Gebührenverordnung, GebV), Anhang 4B: Gebührentarif der Grundbuchämter (BSG 154.21 (Anhang 154.21-A4B)), Stand In Kraft seit 01.05.2026 (Version 3355); Anhang 4B unverändert «Stand 01.08.2020». Erlass nicht aufgehoben, keine künftige Version anstehend.
- **Quelle:** https://www.belex.sites.be.ch/app/de/texts_of_law/154.21
- **Doppelcheck:** bestätigt

| Eintragungsart | Behandlung | Regel | Artikel | Konf. |
|---|---|---|---|---|
| eigentum_kauf | fix | fix 200 | Anhang 4B Ziff. 3.1.1 (i.V.m. Art. 4 Abs. 2 Ge | hoch |
| eigentum_erbgang | fix | fix 200 | Anhang 4B Ziff. 3.1.1 (analog Kauf) | hoch |
| grundpfand | fix | fix 100 | Anhang 4B Ziff. 3.3.1 (Eintragung), 3.3.2 (Änd | hoch |
| dienstbarkeit | fix | fix 100 | Anhang 4B Ziff. 3.2 (Bst. a und b) | hoch |
| vormerkung | fix | fix 50 | Anhang 4B Ziff. 3.4 (Bst. a und b) | hoch |
| baurecht | fix | fix 10 | Anhang 4B Ziff. 3.5 (Widmung) i.V.m. Ziff. 3.2 | mittel |
| stockwerkeigentum | fix | fix 100 | Anhang 4B Ziff. 2.1 / 2.2 (i.V.m. Ziff. 3.1 Ei | hoch |
| parzellierung | offen | — | Anhang 4B (keine eigene GB-Tarifposition); gru | mittel |
| anmerkung | fix | fix 50 | Anhang 4B Ziff. 3.4 (Bst. a und b) | hoch |
| loeschung | fix | fix 0 | Anhang 4B Ziff. 1.6 (Gebührenfreiheit) | hoch |

## LU — Luzern
- **Erlass:** Verordnung über die Grundbuchgebühren (Grundbuchgebührentarif, GBGT) (SRL Nr. 228), Stand Fassung vom 18.05.2015, Stand 01.01.2026 (geltend, nicht abrogiert; letzte Änderung Beschluss 11.11.2025 / G 2025-088, Inkrafttreten 01.01.2026)
- **Quelle:** https://srl.lu.ch/app/de/texts_of_law/228
- **Doppelcheck:** bestätigt

| Eintragungsart | Behandlung | Regel | Artikel | Konf. |
|---|---|---|---|---|
| eigentum_kauf | promille | 2‰ min 100 | § 2 Abs. 1 Ziff. 1 GBGT | hoch |
| eigentum_erbgang | promille | 1‰ min 100 max 5000 | § 2 Abs. 1 Ziff. 2 GBGT | hoch |
| grundpfand | promille | 2‰ min 50 | § 8 Abs. 1 Ziff. 1, 2, 4, 5 GBGT | hoch |
| dienstbarkeit | fix | fix 50 | § 6 Abs. 1 Ziff. 1, 2, 4, 5 GBGT | hoch |
| vormerkung | fix | fix 50 | § 11 Abs. 1 GBGT | hoch |
| baurecht | promille | 1‰ min 300 | § 7 Abs. 1 GBGT | hoch |
| stockwerkeigentum | promille | 0.5‰ min 500 max 20000 | § 3 Abs. 1 GBGT | hoch |
| parzellierung | fix | fix 50 | § 13 Abs. 1 Ziff. 1 GBGT (i.V.m. § 2 Abs. 1 Zi | mittel |
| anmerkung | fix | fix 50 | § 12 Abs. 1 GBGT | hoch |
| loeschung | fix | fix 0 | § 8 Ziff. 3; § 6 Ziff. 5; § 11 Ziff. 5; § 12 Z | hoch |

## UR — Uri
- **Erlass:** Grundbuchgebührentarif (Tarifordnung der Justizdirektion Uri vom 4. Dezember 2024) (gestützt auf RB 3.2521 (Gebührenreglement) Art. 8a und RB 9.3408 (Reglement über das Grundbuch) Art. 2 Abs. 2; der Tarif selbst ist eine Tarifordnung der Justizdirektion ohne eigene RB-Nummer), Stand in Kraft seit 1.1.2025 (Beschluss vom 4.12.2024); hebt den Grundbuchgebührentarif vom 1.1.2005 auf (Art. 14)
- **Quelle:** https://www.ur.ch/online-schalter/2127/download
- **Doppelcheck:** bestätigt

| Eintragungsart | Behandlung | Regel | Artikel | Konf. |
|---|---|---|---|---|
| eigentum_kauf | promille | 2‰ min 50 max 10000 | Art. 2 Abs. 1 und 3 Grundbuchgebührentarif (4. | hoch |
| eigentum_erbgang | fix | fix 50 | Art. 3 Abs. 1, 2 lit. d und 3 Grundbuchgebühre | hoch |
| grundpfand | promille | 2‰ min 70 max 10000 | Art. 5 Grundbuchgebührentarif (4.12.2024) | hoch |
| dienstbarkeit | fix | fix 40 | Art. 4 Abs. 1 und 2 Grundbuchgebührentarif (4. | hoch |
| vormerkung | fix | fix 40 | Art. 4 Abs. 1 und 2 Grundbuchgebührentarif (4. | hoch |
| baurecht | fix | fix 40 | Art. 4 (als Dienstbarkeit) bzw. Art. 12 lit. a | mittel |
| stockwerkeigentum | fix | fix 100 | Art. 12 lit. b (und lit. c) Grundbuchgebührent | hoch |
| parzellierung | fix | fix 100 | Art. 12 lit. a und lit. e Grundbuchgebührentar | hoch |
| anmerkung | fix | fix 40 | Art. 4 Abs. 1 und 2 Grundbuchgebührentarif (4. | hoch |
| loeschung | fix | fix 0 | Art. 4 Abs. 2 und Art. 7 Grundbuchgebührentari | hoch |

## SZ — Schwyz
- **Erlass:** Gebührentarif für Notare und Grundbuchverwalter sowie freiberufliche Urkundspersonen (SRSZ 213.512), Stand Konsolidierte Fassung SRSZ 1.2.2021 (letzte Änderung vom 19. Mai 2020, in Kraft seit 1. Juli 2020); PDF generiert 20.8.2025
- **Quelle:** https://www.sz.ch/public/upload/assets/7361/213_512.pdf
- **Doppelcheck:** bestätigt

| Eintragungsart | Behandlung | Regel | Artikel | Konf. |
|---|---|---|---|---|
| eigentum_kauf | promille | 0.9‰ max 13500 | § 5 Abs. 1 Nr. 1 (i.V.m. Nr. 5 für die reine G | hoch |
| eigentum_erbgang | rahmen | Rahmen 50–250 | § 5 Abs. 1 Nr. 1 (Spezialzeile Erbgang) | hoch |
| grundpfand | promille | 0.9‰ max 10350 | § 5 Abs. 1 Nr. 2 | hoch |
| dienstbarkeit | promille | 0.9‰ max 13500 | § 5 Abs. 1 Nr. 1 (Begründung dinglicher/persön | mittel |
| vormerkung | fix | fix 8 | § 5 Abs. 1 Nr. 5 | hoch |
| baurecht | offen | 0.9‰ max 13500 | § 5 Abs. 1 Nr. 1, Nr. 5, Nr. 6 | tief |
| stockwerkeigentum | promille | 0.9‰ max 13500 | § 5 Abs. 1 Nr. 1 (Sonderregel Stockwerkeigentu | hoch |
| parzellierung | fix | fix 60 | § 5 Abs. 1 Nr. 17 (i.V.m. Nr. 6) | mittel |
| anmerkung | fix | fix 8 | § 5 Abs. 1 Nr. 5 | hoch |
| loeschung | fix | fix 8 | § 5 Abs. 1 Nr. 5 | hoch |

## OW — Obwalden
- **Erlass:** Verordnung über die Grundbuchgebühren (Grundbuchgebührentarif) (GDB 213.61), Stand 01.01.2022 (Beschluss 28.10.2021, OGS 2021, 38; geltende konsolidierte Fassung, nicht aufgehoben)
- **Quelle:** https://gdb.ow.ch/app/de/texts_of_law/213.61
- **Doppelcheck:** bestätigt

| Eintragungsart | Behandlung | Regel | Artikel | Konf. |
|---|---|---|---|---|
| eigentum_kauf | staffel | 1.5‰ min 100 max 15000 | Art. 6 Abs. 1 | hoch |
| eigentum_erbgang | staffel | 1.5‰ min 100 max 15000 | Art. 6 Abs. 1 (i.V.m. Art. 5) | mittel |
| grundpfand | staffel | 2‰ min 80 max 10000 | Art. 12 Abs. 1 | hoch |
| dienstbarkeit | fix | fix 80 | Art. 10 Abs. 1-5 | hoch |
| vormerkung | fix | fix 150 | Art. 13 Abs. 1-6 | hoch |
| baurecht | staffel | 1.5‰ min 100 max 15000 | Art. 11 Abs. 1-3 (i.V.m. Art. 6 Abs. 1) | hoch |
| stockwerkeigentum | promille | 0.5‰ min 200 max 15000 | Art. 7 Abs. 1-4 | hoch |
| parzellierung | offen | fix 50 | Art. 15 / Art. 6 Abs. 2 (keine eigene Parzelli | mittel |
| anmerkung | fix | fix 80 | Art. 14 Abs. 1-4 | hoch |
| loeschung | fix | fix 0 | Art. 10 Abs. 5; Art. 12 Abs. 13; Art. 13 Abs.  | hoch |

## NW — Nidwalden
- **Erlass:** Verordnung zum Gesetz über die amtlichen Kosten (Gebührenverordnung, GebV) vom 20. Februar 2024, Anhang Gebührentarif Ziff. 2.6 (Grundbuchgesetzgebung, NG 214.1) (NG 265.51), Stand 1. Januar 2025 (in Kraft; konsolidierte Fassung, Beschluss 20.02.2024)
- **Quelle:** https://gesetze.nw.ch/app/de/texts_of_law/265.51
- **Doppelcheck:** bestätigt

| Eintragungsart | Behandlung | Regel | Artikel | Konf. |
|---|---|---|---|---|
| eigentum_kauf | promille | 1‰ min 200 max 8000 | GebV NG 265.51, Anhang Tarif-Nr. 2.6.1.1 | hoch |
| eigentum_erbgang | promille | 1‰ min 200 max 8000 | GebV NG 265.51, Anhang Tarif-Nr. 2.6.1.1 | hoch |
| grundpfand | promille | 2‰ min 100 max 8000 | GebV NG 265.51, Anhang Tarif-Nr. 2.6.3.1 | hoch |
| dienstbarkeit | fix | fix 50 | GebV NG 265.51, Anhang Tarif-Nr. 2.6.2.1 (Grun | hoch |
| vormerkung | fix | fix 200 | GebV NG 265.51, Anhang Tarif-Nr. 2.6.4.1 / 2.6 | hoch |
| baurecht | promille | 1‰ min 200 max 8000 | GebV NG 265.51, Anhang Tarif-Nr. 2.6.1.1 | hoch |
| stockwerkeigentum | promille | 0.5‰ min 200 max 8000 | GebV NG 265.51, Anhang Tarif-Nr. 2.6.1.3 | hoch |
| parzellierung | promille | 0.5‰ min 200 max 8000 | GebV NG 265.51, Anhang Tarif-Nr. 2.6.1.2 | hoch |
| anmerkung | fix | fix 30 | GebV NG 265.51, Anhang Tarif-Nr. 2.6.5 / 2.6.5 | hoch |
| loeschung | fix | fix 30 | GebV NG 265.51, Anhang Tarif-Nr. 2.6.6.2 / 2.6 | hoch |

## GL — Glarus
- **Erlass:** Verordnung über die Gebühren im Zivilrecht (Gebührentarif ZGB, GebT ZGB) (GS III B/7/1), Stand Vom 09.02.2022 (Stand 01.01.2026), nicht aufgehoben
- **Quelle:** https://gesetze.gl.ch/app/de/texts_of_law/III%20B%2F7%2F1
- **Doppelcheck:** bestätigt

| Eintragungsart | Behandlung | Regel | Artikel | Konf. |
|---|---|---|---|---|
| eigentum_kauf | promille | 3.5‰ min 100 | Art. 13 Abs. 1 Bst. a GebT ZGB | hoch |
| eigentum_erbgang | fix | 2‰ min 100 | Art. 13 Abs. 1 Bst. b (Erbgang) bzw. Bst. c (E | hoch |
| grundpfand | promille | 3‰ min 50 | Art. 13 Abs. 2 Bst. a GebT ZGB | hoch |
| dienstbarkeit | fix | fix 50 | Art. 13 Abs. 3 Bst. a GebT ZGB | hoch |
| vormerkung | fix | fix 50 | Art. 13 Abs. 4 Bst. a GebT ZGB | hoch |
| baurecht | fix | fix 50 | Art. 13 Abs. 1 Bst. k GebT ZGB | mittel |
| stockwerkeigentum | fix | fix 100 | Art. 13 Abs. 1 Bst. j GebT ZGB | hoch |
| parzellierung | fix | fix 100 | Art. 13 Abs. 1 Bst. i GebT ZGB | hoch |
| anmerkung | fix | fix 50 | Art. 13 Abs. 5 GebT ZGB | hoch |
| loeschung | fix | fix 0 | Art. 13 Abs. 7 GebT ZGB | hoch |

## ZG — Zug
- **Erlass:** Gesetz über den Gebührentarif im Grundbuchwesen (Grundbuchgebührentarif) (BGS 215.35), Stand Fassung vom 1.1.2019 (Erlass vom 27.9.2007, in Kraft seit 22.12.2007); geltende konsolidierte Fassung, nicht abrogiert
- **Quelle:** https://bgs.zg.ch/app/de/texts_of_law/215.35
- **Doppelcheck:** bestätigt

| Eintragungsart | Behandlung | Regel | Artikel | Konf. |
|---|---|---|---|---|
| eigentum_kauf | aufwand | nach Aufwand | §13, §14 lit. a Grundbuchgebührentarif (BGS 21 | hoch |
| eigentum_erbgang | aufwand | nach Aufwand | §13, §14 lit. a Grundbuchgebührentarif (BGS 21 | mittel |
| grundpfand | aufwand | nach Aufwand | §13, §14 lit. e Grundbuchgebührentarif (BGS 21 | hoch |
| dienstbarkeit | aufwand | nach Aufwand | §13, §14 lit. g Grundbuchgebührentarif (BGS 21 | hoch |
| vormerkung | aufwand | nach Aufwand | §13, §14 lit. f Grundbuchgebührentarif (BGS 21 | mittel |
| baurecht | aufwand | nach Aufwand | §13, §14 lit. d Grundbuchgebührentarif (BGS 21 | hoch |
| stockwerkeigentum | aufwand | nach Aufwand | §13, §14 lit. c Grundbuchgebührentarif (BGS 21 | hoch |
| parzellierung | aufwand | nach Aufwand | §13, §14 lit. b Grundbuchgebührentarif (BGS 21 | hoch |
| anmerkung | aufwand | nach Aufwand | §13 Grundbuchgebührentarif (BGS 215.35) | mittel |
| loeschung | offen | — | §5 Abs. 2, §13 Grundbuchgebührentarif (BGS 215 | tief |

## FR — Freiburg
- **Erlass:** Tarif des émoluments fixes du registre foncier (RSF 214.5.16), Stand Version en vigueur depuis le 01.12.2018 (adoptée le 08.10.2018); consolidée, non abrogée (état au 15.06.2026)
- **Quelle:** https://bdlf.fr.ch/app/fr/texts_of_law/214.5.16
- **Doppelcheck:** bestätigt

| Eintragungsart | Behandlung | Regel | Artikel | Konf. |
|---|---|---|---|---|
| eigentum_kauf | fix | fix 120 | Art. 2 al. 1 ch. 6 | hoch |
| eigentum_erbgang | fix | fix 120 | Art. 2 al. 1 ch. 6 (par analogie Art. 3) | hoch |
| grundpfand | fix | fix 100 | Art. 2 al. 1 ch. 11 | hoch |
| dienstbarkeit | fix | fix 50 | Art. 2 al. 1 ch. 10 | hoch |
| vormerkung | fix | fix 50 | Art. 2 al. 1 ch. 12 | hoch |
| baurecht | fix | fix 50 | Art. 2 al. 1 ch. 10 (servitude) / par analogie | mittel |
| stockwerkeigentum | fix | fix 100 | Art. 2 al. 1 ch. 9 | hoch |
| parzellierung | fix | fix 30 | Art. 2 al. 1 ch. 13 | hoch |
| anmerkung | fix | fix 50 | Art. 2 al. 1 ch. 12 | hoch |
| loeschung | fix | fix 50 | Art. 2 al. 1 ch. 10-13 (selon objet radié) | mittel |

## SO — Solothurn
- **Erlass:** Gebührentarif (GT) vom 8. März 2016 (BGS 615.11), Stand 01.03.2026 (geltende konsolidierte Fassung; nicht abrogiert, keine future_versions; Version-ID 5606)
- **Quelle:** https://bgs.so.ch/app/de/texts_of_law/615.11
- **Doppelcheck:** bestätigt

| Eintragungsart | Behandlung | Regel | Artikel | Konf. |
|---|---|---|---|---|
| eigentum_kauf | rahmen | Rahmen 100–10000 | GT § 25 Abs. 1 lit. a (BGS 615.11); Bemessung  | mittel |
| eigentum_erbgang | rahmen | Rahmen 100–10000 | GT § 24 Abs. 1 lit. h (Erbteilung mit Liquidat | mittel |
| grundpfand | rahmen | Rahmen 20–10000 | GT § 25 Abs. 1 lit. m (BGS 615.11) | mittel |
| dienstbarkeit | rahmen | Rahmen 100–10000 | GT § 25 Abs. 1 lit. h (BGS 615.11) | mittel |
| vormerkung | rahmen | Rahmen 100–10000 | GT § 25 Abs. 1 lit. h (Begründung vormerkbares | mittel |
| baurecht | rahmen | Rahmen 200–10000 | GT § 25 Abs. 1 lit. g (Begründung) bzw. lit. c | mittel |
| stockwerkeigentum | rahmen | Rahmen 1000–15000 | GT § 25 Abs. 1 lit. d (BGS 615.11) | mittel |
| parzellierung | rahmen | Rahmen 100–10000 | GT § 25 Abs. 1 lit. k (BGS 615.11) | mittel |
| anmerkung | offen | — | GT 615.11 (kein spezifischer §); allgemein § 3 | tief |
| loeschung | offen | — | GT 615.11 (keine allgemeine GB-Löschungsgebühr | tief |

## BS — Basel-Stadt
- **Erlass:** Verordnung zum Einführungsgesetz zum Schweizerischen Zivilgesetzbuch (VO EG ZGB), § 51 — Grundbuchgebühren (Gebührenordnung des Grundbuch- und Vermessungsamtes) (SG 211.110), Stand Aktuelle konsolidierte Fassung in Kraft seit 01.05.2025 (Beschlussdatum 25.03.2025); Erlass vom 09.12.1911. Nicht abrogiert, keine future_versions.
- **Quelle:** https://www.gesetzessammlung.bs.ch/app/de/texts_of_law/211.110
- **Doppelcheck:** Korrekturen übernommen (10)

| Eintragungsart | Behandlung | Regel | Artikel | Konf. |
|---|---|---|---|---|
| eigentum_kauf | promille | 1‰ min 200 max 50000 | § 51 Abs. 5 Ziff. 2 lit. a (Handänderung) | hoch |
| eigentum_erbgang | promille | 0.5‰ min 200 max 50000 | § 51 Abs. 5 Ziff. 2 lit. a (Handänderung, ermä | hoch |
| grundpfand | promille | 1‰ min 200 max 50000 | § 51 Abs. 5 Ziff. 6 lit. a (Pfandrechte und Gr | hoch |
| dienstbarkeit | fix | fix 100 | § 51 Abs. 5 Ziff. 4 lit. b (andere Dienstbarke | hoch |
| vormerkung | fix | fix 100 | § 51 Abs. 5 Ziff. 5 (Anmerkungen und Vormerkun | hoch |
| baurecht | promille | 0.25‰ min 200 max 50000 | § 51 Abs. 5 Ziff. 4 lit. a (selbständige/dauer | hoch |
| stockwerkeigentum | promille | 0.25‰ min 200 max 50000 | § 51 Abs. 5 Ziff. 3 (Stockwerkeigentum) | hoch |
| parzellierung | fix | fix 100 | § 51 Abs. 5 Ziff. 1 (Anlegung/Löschung eines G | hoch |
| anmerkung | fix | fix 100 | § 51 Abs. 5 Ziff. 5 (Anmerkungen und Vormerkun | hoch |
| loeschung | offen | — | § 51 Abs. 5 (keine eigene Löschungstarif-Posit | mittel |

## BL — Basel-Landschaft
- **Erlass:** Verordnung über die Gebühren zum Zivilrecht (GebV) (SGS 211.71), Stand Aktuelle Version in Kraft seit 01.01.2013 (Beschlussdatum 27.11.2012); Erlass vom 08.01.1991; nicht abrogiert; abgerufen 15.06.2026
- **Quelle:** https://bl.clex.ch/app/de/texts_of_law/211.71
- **Doppelcheck:** bestätigt

| Eintragungsart | Behandlung | Regel | Artikel | Konf. |
|---|---|---|---|---|
| eigentum_kauf | fix | fix 300 | § 16 Ziff. 1 Bst. d GebV (SGS 211.71) | hoch |
| eigentum_erbgang | fix | fix 300 | § 16 Ziff. 1 Bst. d GebV; vgl. § 15 (SGS 211.7 | hoch |
| grundpfand | fix | fix 300 | § 16 Ziff. 4 Bst. a GebV (SGS 211.71) | hoch |
| dienstbarkeit | fix | fix 100 | § 16 Ziff. 3 Bst. a GebV (SGS 211.71) | hoch |
| vormerkung | fix | fix 100 | § 16 Ziff. 6 Bst. a GebV (SGS 211.71) | hoch |
| baurecht | fix | fix 300 | § 16 Ziff. 1 Bst. f GebV (SGS 211.71) | hoch |
| stockwerkeigentum | fix | fix 300 | § 16 Ziff. 1 Bst. e GebV (SGS 211.71) | hoch |
| parzellierung | fix | fix 100 | § 16 Ziff. 1 Bst. b GebV (SGS 211.71) | hoch |
| anmerkung | fix | fix 100 | § 16 Ziff. 5 Bst. a GebV (SGS 211.71) | hoch |
| loeschung | fix | fix 100 | § 16 Ziff. 3 Bst. d / Ziff. 4 Bst. h / Ziff. 5 | hoch |

## SH — Schaffhausen
- **Erlass:** Grundbuchgebührenverordnung (SHR 211.433), Stand 1. Januar 2011 (konsolidierte Fassung; Stammerlass vom 13. Juni 2000, in Kraft 1. Juli 2000; letzte materielle Änderung V vom 23. Januar 2007, in Kraft 1. Januar 2007)
- **Quelle:** https://rechtsbuch.sh.ch/app/de/texts_of_law/211.433
- **Doppelcheck:** bestätigt

| Eintragungsart | Behandlung | Regel | Artikel | Konf. |
|---|---|---|---|---|
| eigentum_kauf | promille | 6‰ min 50 | § 14 Ziff. 1 (Eintragungsgebühr, allgemeine Ha | hoch |
| eigentum_erbgang | promille | 1‰ min 50 | § 14 Ziff. 3 (Eintragungsgebühr, Erbgang/güter | hoch |
| grundpfand | promille | 2‰ min 50 | § 15 Ziff. 1 (Eintragungsgebühr Grundpfandrech | hoch |
| dienstbarkeit | rahmen | Rahmen 100–1000 | § 16 Ziff. 10 (Begründung Dienstbarkeit/Grundl | hoch |
| vormerkung | promille | 0.5‰ min 50 max 500 | § 17 (Vormerkungsgebühren) | hoch |
| baurecht | rahmen | Rahmen 50–100 | § 16 Ziff. 4 i.V.m. § 12 (Grundstückaufnahme b | mittel |
| stockwerkeigentum | rahmen | Rahmen 200–1000 | § 16 Ziff. 3 (Begründung Stockwerkeigentum) | hoch |
| parzellierung | rahmen | Rahmen 10–100 | § 16 Ziff. 1, 4, 5 (Grenzänderung/Grundstückau | hoch |
| anmerkung | rahmen | Rahmen 20–100 | § 18 Ziff. 2 (Anmerkung öffentlich-rechtliche  | hoch |
| loeschung | rahmen | Rahmen 20–50 | § 15 Ziff. 2 / § 17 Ziff. 17 / § 16 Ziff. 12 / | hoch |

## AR — Appenzell A.Rh.
- **Erlass:** Gesetz über die Gebühren der Gemeinden (Gebührentarif für die Gemeinden) (bGS 153.2), Stand 1. Januar 2018 (Erlass vom 26. Februar 2001; letzte Änderung RRB/KRB 20.03.2017, in Kraft 01.01.2018; nicht aufgehoben, keine künftigen Fassungen)
- **Quelle:** https://ar.clex.ch/app/de/texts_of_law/153.2
- **Doppelcheck:** bestätigt

| Eintragungsart | Behandlung | Regel | Artikel | Konf. |
|---|---|---|---|---|
| eigentum_kauf | promille | 1‰ min 200 max 4000 | Art. 12 Ziff. 8.1 lit. a | hoch |
| eigentum_erbgang | promille | 0.5‰ min 100 max 2000 | Art. 12 Ziff. 8.1 lit. b | hoch |
| grundpfand | promille | 1‰ min 100 max 2000 | Art. 12 Ziff. 8.2 lit. a (mit abis, b) | hoch |
| dienstbarkeit | rahmen | Rahmen 50–4000 | Art. 12 Ziff. 8.3 lit. a-c | hoch |
| vormerkung | rahmen | Rahmen 50–2000 | Art. 12 Ziff. 8.4 lit. a-c | hoch |
| baurecht | offen | Rahmen 50–4000 | Art. 12 Ziff. 8.1 lit. d / 8.3 | mittel |
| stockwerkeigentum | rahmen | Rahmen 500–8000 | Art. 12 Ziff. 8.1 lit. e | hoch |
| parzellierung | rahmen | Rahmen 200–4000 | Art. 12 Ziff. 8.1 lit. d | hoch |
| anmerkung | rahmen | fix 50 | Art. 12 Ziff. 8.5 lit. a-c | hoch |
| loeschung | fix | fix 0 | Art. 12 Ziff. 8.7 | hoch |

## AI — Appenzell I.Rh.
- **Erlass:** Gebührentarif (GebT) (GS 172.513), Stand Fassung in Kraft seit 01.01.2026 (Beschluss vom 02.12.2025); Erlass vom 17.09.2019; nicht abrogiert
- **Quelle:** https://ai.clex.ch/app/de/texts_of_law/172.513
- **Doppelcheck:** Korrekturen übernommen (1)

| Eintragungsart | Behandlung | Regel | Artikel | Konf. |
|---|---|---|---|---|
| eigentum_kauf | promille | 1‰ min 100 | Art. 11 Abs. 1 Ziff. 1.1 und 1.2 GebT (GS 172. | hoch |
| eigentum_erbgang | fix | fix 100 | Art. 11 Abs. 1 Ziff. 2 GebT (GS 172.513) | hoch |
| grundpfand | promille | 1‰ min 50 max 2000 | Art. 11 Abs. 1 Ziff. 6.1 und 6.2 GebT (GS 172. | hoch |
| dienstbarkeit | rahmen | Rahmen 100–1000 | Art. 11 Abs. 1 Ziff. 15 GebT (GS 172.513) | hoch |
| vormerkung | rahmen | Rahmen 60–1000 | Art. 11 Abs. 1 Ziff. 19.1, 19.4-19.7 GebT (GS  | hoch |
| baurecht | aufwand | nach Aufwand | Art. 11 Abs. 3 i.V.m. Art. 2 GebT (GS 172.513) | tief |
| stockwerkeigentum | rahmen | Rahmen 500–5000 | Art. 11 Abs. 1 Ziff. 22.1 GebT (GS 172.513) | hoch |
| parzellierung | rahmen | Rahmen 200–2000 | Art. 11 Abs. 1 Ziff. 23.1 GebT (GS 172.513) | hoch |
| anmerkung | rahmen | Rahmen 60–400 | Art. 11 Abs. 1 Ziff. 20.1 und 20.3 GebT (GS 17 | hoch |
| loeschung | fix | fix 10 | Art. 11 Abs. 1 Ziff. 14.1/14.2 und 20.4 GebT ( | mittel |

## SG — St. Gallen
- **Erlass:** Verordnung über die Gebühren für Amtshandlungen der Grundbuchämter und für die Durchführung von Grundstückschätzungen (GB-GebV) (sGS 914.5), Stand Fassung vom 10. November 2015, Stand 1. Juni 2020 (nGS 2020-017); konsolidiert, nicht aufgehoben, keine future_versions
- **Quelle:** https://www.gesetzessammlung.sg.ch/app/de/texts_of_law/914.5
- **Doppelcheck:** bestätigt

| Eintragungsart | Behandlung | Regel | Artikel | Konf. |
|---|---|---|---|---|
| eigentum_kauf | promille | 2‰ min 200 max 10000 | Art. 8 GB-GebV, Tarif-Nr. 20.01 | hoch |
| eigentum_erbgang | promille | 1‰ min 200 max 1000 | Art. 8 GB-GebV, Tarif-Nr. 20.02.01 (Erbgang/Un | hoch |
| grundpfand | promille | 1‰ min 100 max 2000 | Art. 10 GB-GebV, Tarif-Nr. 21.01 | hoch |
| dienstbarkeit | rahmen | Rahmen 150–2000 | Art. 11 GB-GebV, Tarif-Nr. 22.04 (andere Diens | hoch |
| vormerkung | promille | 1.5‰ min 250 max 5000 | Art. 13 GB-GebV, Tarif-Nrn. 23.01-23.11 | hoch |
| baurecht | promille | 2‰ min 200 max 10000 | Art. 11 GB-GebV, Tarif-Nr. 22.01 (Begründung); | hoch |
| stockwerkeigentum | rahmen | Rahmen 500–3000 | Art. 16 GB-GebV, Tarif-Nr. 25.01 | hoch |
| parzellierung | rahmen | Rahmen 200–2000 | Art. 17 GB-GebV, Tarif-Nr. 26.01 (Grenzänderun | hoch |
| anmerkung | fix | fix 50 | Art. 14/15 GB-GebV, Tarif-Nrn. 24.01/24.02 | hoch |
| loeschung | fix | fix 0 | Art. 22 GB-GebV (Tarif-Abschnitt 4 Löschungen  | hoch |

## GR — Graubünden
- **Erlass:** Verordnung über die Gebühren der Grundbuchämter (BR 217.200), Stand In Kraft seit 1. Januar 2025 (Erlass vom 5.12.2000, Stand 1.1.2025; letzte Änderung Beschluss 04.04.2023, Art. 7 Abs. 2). Aktuelle konsolidierte Fassung, nicht abrogiert, keine future_versions.
- **Quelle:** https://www.gr-lex.gr.ch/app/de/texts_of_law/217.200
- **Doppelcheck:** bestätigt

| Eintragungsart | Behandlung | Regel | Artikel | Konf. |
|---|---|---|---|---|
| eigentum_kauf | promille | 1‰ min 50 max 15000 | Art. 13 Abs. 1 lit. a) BR 217.200 | hoch |
| eigentum_erbgang | promille | 0.5‰ min 50 max 7500 | Art. 13 Abs. 1 lit. b) BR 217.200 | hoch |
| grundpfand | promille | 1‰ min 50 max 15000 | Art. 13 Abs. 1 lit. j) BR 217.200 | hoch |
| dienstbarkeit | promille | 1‰ min 50 max 15000 | Art. 13 Abs. 1 lit. m) und m)' BR 217.200 | hoch |
| vormerkung | fix | fix 50 | Art. 14 Abs. 1 lit. a) und b) BR 217.200 | hoch |
| baurecht | promille | 1‰ min 50 max 15000 | Art. 13 Abs. 1 lit. h) BR 217.200 | hoch |
| stockwerkeigentum | promille | 1‰ min 50 max 15000 | Art. 13 Abs. 1 lit. h) BR 217.200 | hoch |
| parzellierung | rahmen | Rahmen 50–5000 | Art. 13 Abs. 1 lit. g) BR 217.200 | hoch |
| anmerkung | fix | fix 10 | Art. 14 Abs. 1 lit. b) BR 217.200 | hoch |
| loeschung | fix | fix 10 | Art. 15 BR 217.200 | hoch |

## AG — Aargau
- **Erlass:** Gesetz über die Grundbuchabgaben (GBAG) (SAR 725.100), Stand vom 07.05.1980, aktuelle konsolidierte Fassung in Kraft seit 01.01.2020 (Beschluss 19.11.2019); nicht abrogiert, keine künftige Version
- **Quelle:** https://gesetzessammlungen.ag.ch/app/de/texts_of_law/725.100
- **Doppelcheck:** bestätigt

| Eintragungsart | Behandlung | Regel | Artikel | Konf. |
|---|---|---|---|---|
| eigentum_kauf | promille | 4‰ min 100 | § 8 Abs. 1 GBAG | hoch |
| eigentum_erbgang | promille | 2‰ min 50 | § 15 GBAG | hoch |
| grundpfand | promille | 1.5‰ min 100 | § 23 Abs. 1 GBAG | hoch |
| dienstbarkeit | promille | 1‰ min 50 | § 29 GBAG | hoch |
| vormerkung | promille | 0.5‰ min 50 max 500 | §§ 26-28 GBAG | hoch |
| baurecht | promille | 2.5‰ min 100 | § 18 GBAG | hoch |
| stockwerkeigentum | promille | 2‰ | § 20 GBAG | hoch |
| parzellierung | promille | 1‰ min 50 | § 21 GBAG | hoch |
| anmerkung | promille | 0.5‰ min 50 max 500 | § 25 GBAG | mittel |
| loeschung | offen | — | GBAG (keine Bestimmung) | tief |

## TG — Thurgau
- **Erlass:** Gesetz über die Gebühren und Gemengsteuern der Grundbuchämter und Notariate (GGG) (RB 632.1), Stand vom 20.11.1996, Stand 01.01.2016 (geltende konsolidierte Fassung)
- **Quelle:** https://www.rechtsbuch.tg.ch/app/de/texts_of_law/632.1
- **Doppelcheck:** bestätigt

| Eintragungsart | Behandlung | Regel | Artikel | Konf. |
|---|---|---|---|---|
| eigentum_kauf | promille | 4‰ min 100 max 20000 | § 14 Abs. 2 Ziff. 1 GGG | hoch |
| eigentum_erbgang | promille | 1‰ min 100 max 2000 | § 14 Abs. 2 Ziff. 3 GGG | hoch |
| grundpfand | promille | 1.5‰ min 100 max 10000 | § 14 Abs. 2 Ziff. 11 GGG | hoch |
| dienstbarkeit | promille | 2‰ min 100 max 4000 | § 14 Abs. 2 Ziff. 15 GGG | hoch |
| vormerkung | promille | Rahmen 100–5000 | § 14 Abs. 2 Ziff. 16-19 GGG | hoch |
| baurecht | promille | 0.5‰ min 100 max 2500 | § 14 Abs. 2 Ziff. 10 GGG | mittel |
| stockwerkeigentum | promille | 0.5‰ min 100 max 2500 | § 14 Abs. 2 Ziff. 8 GGG | hoch |
| parzellierung | offen | — | § 14 Abs. 3 GGG (i.V.m. RR-Verordnung) | tief |
| anmerkung | offen | Rahmen 100–500 | § 14 Abs. 2 Ziff. 20 / Abs. 3 GGG | tief |
| loeschung | offen | — | § 14 Abs. 3 GGG | tief |

## TI — Tessin
- **Erlass:** Legge sulle tariffe per le operazioni nel Registro fondiario (LTORF) (216.200), Stand Konsolidierte Fassung vom 16.10.2006, letzte Änderung BU 2016, 447 (in Kraft seit 1.1.2017); Titel geändert per 10.2.2015 (BU 2015, 36). Geltende Fassung, nicht abrogiert.
- **Quelle:** https://m3.ti.ch/CAN/RLeggi/public/index.php/raccolta-leggi/pdfatto/atto/181
- **Doppelcheck:** bestätigt

| Eintragungsart | Behandlung | Regel | Artikel | Konf. |
|---|---|---|---|---|
| eigentum_kauf | promille | 11‰ | Art. 11 cpv. 1 lit. a/b LTORF | hoch |
| eigentum_erbgang | staffel | — | Art. 12, 13, 18 LTORF | hoch |
| grundpfand | promille | 7‰ | Art. 23, 25, 21, 22, 20, 26 LTORF | hoch |
| dienstbarkeit | rahmen | Rahmen 50–500 | Art. 19 LTORF | hoch |
| vormerkung | fix | fix 30 | Art. 18, 27 LTORF | hoch |
| baurecht | promille | 11‰ | Art. 19 cpv. 3 LTORF | hoch |
| stockwerkeigentum | fix | fix 100 | Art. 15 LTORF | hoch |
| parzellierung | fix | fix 150 | Art. 29, 16 LTORF | hoch |
| anmerkung | fix | fix 30 | Art. 18 LTORF | hoch |
| loeschung | fix | fix 30 | Art. 18, 20, 26 LTORF; Befreiungen Art. 36 | hoch |

## VD — Waadt
- **Erlass:** Loi du 9 octobre 2012 sur le registre foncier (LRF), Chapitre V Emoluments (art. 26-29), en lien avec le Règlement du 2 juillet 2014 fixant le tarif des émoluments du registre foncier (RE-RF) (BLV 211.61 (LRF) / BLV 211.61.1 (RE-RF)), Stand LRF (BLV 211.61): Fassung in Kraft seit 01.01.2018 (Aktuell). RE-RF (BLV 211.61.1): Fassung in Kraft seit 01.07.2014 (Aktuell).
- **Quelle:** https://www.lexfind.ch/tolv/210360/fr
- **Doppelcheck:** bestätigt

| Eintragungsart | Behandlung | Regel | Artikel | Konf. |
|---|---|---|---|---|
| eigentum_kauf | promille | 1.5‰ min 100 max 20000 | LRF (BLV 211.61) Art. 26 al. 1 u. 5 | hoch |
| eigentum_erbgang | promille | 0.75‰ min 100 max 20000 | LRF (BLV 211.61) Art. 27 al. 1 u. 2 | hoch |
| grundpfand | promille | 1.5‰ min 100 max 20000 | LRF (BLV 211.61) Art. 28; RE-RF (BLV 211.61.1) | hoch |
| dienstbarkeit | fix | fix 100 | RE-RF (BLV 211.61.1) Art. 4 | hoch |
| vormerkung | fix | fix 100 | RE-RF (BLV 211.61.1) Art. 4 | hoch |
| baurecht | fix | fix 200 | RE-RF (BLV 211.61.1) Art. 2 al. 1 lit. b | mittel |
| stockwerkeigentum | fix | fix 200 | RE-RF (BLV 211.61.1) Art. 2 al. 1 lit. b | mittel |
| parzellierung | fix | fix 200 | RE-RF (BLV 211.61.1) Art. 2 al. 1 lit. b | hoch |
| anmerkung | fix | fix 100 | RE-RF (BLV 211.61.1) Art. 4 | hoch |
| loeschung | fix | fix 100 | RE-RF (BLV 211.61.1) Art. 4 u. Art. 3 lit. b | mittel |

## VS — Wallis
- **Erlass:** Ordonnance cantonale sur le registre foncier (OcRF) / Kantonale Grundbuchverordnung (kGBV) (211.611), Stand 01.10.2025
- **Quelle:** https://lex.vs.ch/app/fr/texts_of_law/211.611
- **Doppelcheck:** bestätigt

| Eintragungsart | Behandlung | Regel | Artikel | Konf. |
|---|---|---|---|---|
| eigentum_kauf | promille | 2‰ min 100 max 5000 | Art. 32 Abs. 2 lit. a OcRF (211.611) | hoch |
| eigentum_erbgang | promille | 2‰ min 100 max 5000 | Art. 32 Abs. 2 lit. a OcRF (211.611) | mittel |
| grundpfand | promille | 1‰ min 100 max 2500 | Art. 32 Abs. 2 lit. b/c OcRF (211.611) | hoch |
| dienstbarkeit | fix | fix 100 | Art. 33 Abs. 2 lit. a Ziff. 3 OcRF (211.611) | hoch |
| vormerkung | fix | fix 50 | Art. 33 Abs. 2 lit. b Ziff. 2 OcRF (211.611) | hoch |
| baurecht | offen | — | Art. 32 Abs. 6 / Art. 33 Abs. 3 OcRF (211.611) | tief |
| stockwerkeigentum | fix | fix 100 | Art. 33 Abs. 2 lit. a Ziff. 2 u. lit. c Ziff.  | hoch |
| parzellierung | fix | fix 20 | Art. 33 Abs. 2 lit. c Ziff. 7 OcRF (211.611) | hoch |
| anmerkung | fix | fix 50 | Art. 33 Abs. 2 lit. b Ziff. 3 OcRF (211.611) | hoch |
| loeschung | fix | fix 20 | Art. 33 Abs. 2 lit. c Ziff. 2 OcRF (211.611) | hoch |

## NE — Neuenburg
- **Erlass:** Loi concernant le tarif des émoluments du registre foncier (LERF) du 25 janvier 1988, complétée par l'Arrêté concernant le tarif des émoluments fixes du registre foncier du 16 février 2005 (RSN 215.411.6 (loi) / RSN 215.411.60 (arrêté émoluments fixes)), Stand LERF: État au 1er janvier 2026 (dernière mod. L du 2 nov. 2021, effet 1.1.2022). Arrêté 215.411.60: État au 19 octobre 2015 (arrêté du 16 février 2005).
- **Quelle:** https://rsn.ne.ch/DATA/program/books/rsne/pdf/2154116.pdf
- **Doppelcheck:** bestätigt

| Eintragungsart | Behandlung | Regel | Artikel | Konf. |
|---|---|---|---|---|
| eigentum_kauf | promille | 1.5‰ min 50 max 40000 | LERF Art. 9 (RSN 215.411.6) + Arrêté Art. 12/1 | hoch |
| eigentum_erbgang | promille | 1.5‰ min 50 max 40000 | LERF Art. 9 Abs. 2 (RSN 215.411.6) + Arrêté Ar | hoch |
| grundpfand | promille | 2‰ min 50 max 40000 | LERF Art. 10 / Art. 11 (RSN 215.411.6) + Arrêt | hoch |
| dienstbarkeit | fix | fix 70 | Arrêté Art. 12 Abs. 1 lit. c / Art. 21 (RSN 21 | hoch |
| vormerkung | fix | fix 70 | Arrêté Art. 12 Abs. 1 lit. c (RSN 215.411.60) | hoch |
| baurecht | fix | fix 170 | Arrêté Art. 20 (RSN 215.411.60) | hoch |
| stockwerkeigentum | staffel | fix 140 | Arrêté Art. 14 (RSN 215.411.60) | hoch |
| parzellierung | fix | fix 10 | Arrêté Art. 13 / Art. 18 (RSN 215.411.60) | hoch |
| anmerkung | fix | fix 70 | Arrêté Art. 12 Abs. 1 lit. c (RSN 215.411.60) | hoch |
| loeschung | fix | fix 10 | Arrêté Art. 27 (RSN 215.411.60) | hoch |

## GE — Genf
- **Erlass:** Règlement sur le tarif des émoluments de l'office du registre foncier et de la direction de l'information du territoire (REmORFDIT) (RSG E 1 50.06), Stand Dernières modifications au 24 avril 2024 (en vigueur)
- **Quelle:** https://silgeneve.ch/legis/data/rsg_e1_50p06.htm
- **Doppelcheck:** bestätigt

| Eintragungsart | Behandlung | Regel | Artikel | Konf. |
|---|---|---|---|---|
| eigentum_kauf | promille | 2.1‰ max 40000 | Art. 3 al. 1 REmORFDIT | hoch |
| eigentum_erbgang | fix | fix 425 | Art. 3 al. 2 REmORFDIT | hoch |
| grundpfand | promille | 0.85‰ max 20000 | Art. 4 REmORFDIT | hoch |
| dienstbarkeit | fix | fix 255 | Art. 5 REmORFDIT | hoch |
| vormerkung | fix | fix 255 | Art. 6 REmORFDIT | hoch |
| baurecht | fix | fix 425 | Art. 2 REmORFDIT | hoch |
| stockwerkeigentum | fix | fix 1275 | Art. 2 REmORFDIT | hoch |
| parzellierung | fix | fix 1275 | Art. 2 REmORFDIT | hoch |
| anmerkung | fix | fix 255 | Art. 6 REmORFDIT | hoch |
| loeschung | fix | — | Art. 5 REmORFDIT (Dienstbarkeiten); Art. 4/6 s | mittel |

## JU — Jura
- **Erlass:** Décret fixant les émoluments du registre foncier (RSJU 176.331), Stand Fassung vom 24.3.2010, in Kraft seit 1.1.2011; konsolidierte geltende Fassung Stand 1.1.2017 (letzte Änderung Dekret vom 22.6.2016). Punktwert: CHF 1.05 ab 1.1.2025 (RSJU 176.210.12).
- **Quelle:** https://rsju.jura.ch/fr/viewdocument.html?idn=20021&id=37773&download=1
- **Doppelcheck:** bestätigt

| Eintragungsart | Behandlung | Regel | Artikel | Konf. |
|---|---|---|---|---|
| eigentum_kauf | promille | 1.5‰ min 42 max 10500 | Art. 6 (Chapitre II) | hoch |
| eigentum_erbgang | promille | 1.5‰ min 42 max 10500 | Art. 6 (Chapitre II) | hoch |
| grundpfand | promille | 1‰ min 42 max 10500 | Art. 7 (Chapitre II) | hoch |
| dienstbarkeit | fix | fix 31.5 | Art. 8 ch. 2 lit. a (Chapitre III) | hoch |
| vormerkung | fix | fix 42 | Art. 8 ch. 3 lit. a (Chapitre III) | hoch |
| baurecht | fix | fix 63 | Art. 8 ch. 1 lit. d + ch. 2 lit. a (Chapitre I | mittel |
| stockwerkeigentum | fix | fix 105 | Art. 8 ch. 1 lit. g + lit. h (Chapitre III) | hoch |
| parzellierung | fix | fix 21 | Art. 8 ch. 1 lit. e + lit. d (Chapitre III) | mittel |
| anmerkung | fix | fix 42 | Art. 8 ch. 3 lit. a (Chapitre III) | hoch |
| loeschung | fix | fix 21 | Art. 8 ch. 2-4 (Chapitre III) | hoch |

---
**Pflegebedarf:** kantonale Tarife mit datiertem Stand — bei Revision nachführen. **Abnahme-Status:** Erstrecherche, doppelt verifiziert; Davids Abnahme ausstehend.
