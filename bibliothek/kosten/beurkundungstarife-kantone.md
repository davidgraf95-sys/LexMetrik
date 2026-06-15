# Beurkundungstarife (Notariatsgebühren) je Geschäftsart — alle 26 Kantone

**Erstellt:** 15.6.2026 · **Status: ERSTRECHERCHE, doppelt verifiziert** (find + unabhängiger Doppelcheck-Pass je Kanton am amtlichen Originaltext). FAHRPLAN-BEURKUNDUNGS-AUSBAU B-2/B-3. Daueranweisung David: jede Angabe mit amtlichem Erlass + Artikel + Stand; nichts trägt «geprüft» ohne Davids Abnahme (§7/§8).

**Methodik:** Workflow `beurkundungstarife-research` (26 Kantone × Pipeline find→Doppelcheck, 52 Agenten). Je Kanton der einschlägige Notariats-/Beurkundungstarif in der neusten konsolidierten Fassung (abrogated/future_versions geprüft). Promillesätze deterministisch (mit Min/Max); Rahmen-/Aufwandtarife (freies Notariat) ehrlich als Spanne bzw. «nach Vereinbarung». Doppelcheck-Korrektur: **GE Bürgschaft = 1‰ (nicht 1 %)**, Min 100 / Max 500 (Art. 26 REmNot).

**Engine-Korrekturen (fachlicher Drittcheck 15.6.2026 gegen Originaltext):** Wert-Geschäfte (Schenkung, AG-/GmbH-Gründung, Kapitalerhöhung, Stiftung) in Staffel-Kantonen (LU, OW, NW, FR, BS, AG, VD u. a.) sind **degressive Staffeln, kein Flach-Promille** — in der Engine darum als ehrliche Spanne (Rahmen min–max) statt überhöhtem Flachsatz kodiert (§2/§8); Flach-Promille-Kantone (ZH, SZ, SG, GR, TG) behalten den deterministischen Satz. TG Schenkung = allg. 1‰ (§ 14 Abs. 1 GGG), nicht der § 16-Aufwandtarif. Die Matrix unten gibt die Roh-Rechercheangaben wieder; `data/tarif/beurkundung.ts` setzt diese Korrekturen um.

**Kern-Befund:** In Kantonen mit allgemeinem wertbasiertem Tarif (ZH, SZ, SG, GR, TG flach; UR, OW, NW, FR, BE, TI, VD, VS, NE, GE, JU als Staffel = Grundstückkauf-Tarif) bestimmt die Geschäftsart nur den Geschäftswert. Kantone ohne universellen Werttarif (LU, GL, ZG, SO, BS, BL, SH, AR, AI, AG) tarifieren tatbestandsweise (Sondersatz/Fix/Aufwand). Engine `lib/beurkundung.ts`, Daten `data/tarif/beurkundung.ts`.


## ZH — Zürich (amtsnotariat)
- **Erlass:** Notariatsgebührenverordnung (NotGebV) (LS 243), Stand Konsolidierte Fassung NB 123, Stand 01.01.2024 (Erlass vom 9. März 2009, in Kraft seit 1. Juli 2009; nicht aufgehoben)
- **Quelle:** https://www.zh.ch/de/politik-staat/gesetze-beschluesse/gesetzessammlung/zhlex-ls/erlass-243-2009_03_09-2009_07_01-123.html
- **Genereller Werttarif:** promille — Anhang Ziff. 1.1.1 (Grundstückswesen) als wertbasierter Kern; allgemeine Auffangnorm Anhang Ziff. 4.6 fuer nicht eigens genannte Willenserklaerungen
- **Doppelcheck:** bestätigt

| Geschäftsart | Behandlung | Regel | Artikel | Konfidenz |
|---|---|---|---|---|
| grundstueckkauf | sondersatz | 1‰ min 100 | Anhang Ziff. 1.1.1 | hoch |
| dienstbarkeit | sondersatz | 1‰ min 150 max 1000 | Anhang Ziff. 1.4.1.1 / 2.4.1 | hoch |
| schenkung | genereller_werttarif | 1‰ min 200 max 15000 | Anhang Ziff. 4.6 (bzw. 1.1.1 bei Grundstueck) | mittel |
| erbvertrag | fix | Rahmen 300–7500 | Anhang Ziff. 4.3.3 | hoch |
| ehevertrag | fix | Rahmen 200–5000 | Anhang Ziff. 4.2.1 | hoch |
| testament | fix | Rahmen 200–5000 | Anhang Ziff. 4.3.2 | hoch |
| vorsorgeauftrag | aufwand | nach Aufwand | Anhang Ziff. 4.2.3 | hoch |
| vollmacht | fix | Rahmen 20–250 | Anhang Ziff. 4.5.1 | hoch |
| ag_gruendung | sondersatz | 1‰ min 500 max 5000 | Anhang Ziff. 4.4.3.1 | hoch |
| gmbh_gruendung | sondersatz | 1‰ min 500 max 5000 | Anhang Ziff. 4.4.3.1 | hoch |
| kapitalerhoehung | sondersatz | 1‰ min 500 max 5000 | Anhang Ziff. 4.4.3.1 | hoch |
| stiftung | sondersatz | 1‰ min 300 | Anhang Ziff. 4.1 | hoch |
| buergschaft | sondersatz | 0.5‰ min 100 max 500 | Anhang Ziff. 4.4.1 | hoch |
| schuldanerkennung | genereller_werttarif | 1‰ min 200 max 15000 | Anhang Ziff. 4.6 | mittel |

## BE — Bern (freies)
- **Erlass:** Verordnung über die Notariatsgebühren (GebVN) (BSG 169.81), Stand 01.03.2022 (konsolidierte Fassung, Version 2543; Beschluss 02.02.2022)
- **Quelle:** https://www.belex.sites.be.ch/app/de/texts_of_law/169.81
- **Genereller Werttarif:** rahmen — Art. 1a Abs. 1, Art. 2 i.V.m. Anhang 1 (gestaffelter Rahmentarif)
- **Doppelcheck:** bestätigt

| Geschäftsart | Behandlung | Regel | Artikel | Konfidenz |
|---|---|---|---|---|
| grundstueckkauf | genereller_werttarif | Rahmen 715–30825 | Art. 13 i.V.m. Anhang 1 | hoch |
| dienstbarkeit | aufwand | nach Aufwand | Art. 17 | hoch |
| schenkung | offen | — | kein eigener Tatbestand; ggf. Art. 4 Abs. 3 / Art. | tief |
| erbvertrag | aufwand | nach Aufwand | Art. 9 | hoch |
| ehevertrag | aufwand | nach Aufwand | Art. 8 Abs. 1 (und Abs. 2) | hoch |
| testament | aufwand | nach Aufwand | Art. 9 | hoch |
| vorsorgeauftrag | aufwand | nach Aufwand | Art. 8a | hoch |
| vollmacht | offen | — | Art. 27 (Beglaubigung) bzw. Art. 30 (Beurkundung) | tief |
| ag_gruendung | sondersatz | Rahmen 150–27350 | Art. 21 Abs. 1 i.V.m. Anhang 4 | hoch |
| gmbh_gruendung | sondersatz | Rahmen 150–27350 | Art. 21 Abs. 1 i.V.m. Anhang 4 | hoch |
| kapitalerhoehung | sondersatz | — | Art. 21 Abs. 2 (AG) / Abs. 4 (GmbH) i.V.m. Anhang  | hoch |
| stiftung | genereller_werttarif | Rahmen 715–30825 | Art. 7 i.V.m. Anhang 1 | hoch |
| buergschaft | aufwand | nach Aufwand | Art. 19 | hoch |
| schuldanerkennung | offen | — | kein eigener Tatbestand; ggf. Art. 30 / Art. 4 Abs | tief |

## LU — Luzern (amtsnotariat)
- **Erlass:** Verordnung über die Beurkundungsgebühren (BeurkGebV) (SRL 258), Stand 1. Januar 2022 (Beschluss 23.11.2021, G 2021-082), in Kraft, nicht aufgehoben
- **Quelle:** https://srl.lu.ch/api/de/versions/3870/pdf_file_with_annexes
- **Genereller Werttarif:** keiner (tatbestandsweise)
- **Doppelcheck:** bestätigt

| Geschäftsart | Behandlung | Regel | Artikel | Konfidenz |
|---|---|---|---|---|
| grundstueckkauf | sondersatz | 3‰ min 500 max 15750 | § 21 Abs. 1 | hoch |
| dienstbarkeit | aufwand | Rahmen 200–5000 | § 26 | hoch |
| schenkung | sondersatz | 3‰ min 200 max 15750 | § 21 Abs. 1 (Grundstücke); § 33; § 49 (Fahrnis/Ver | mittel |
| erbvertrag | aufwand | Rahmen 500–5000 | § 19 Abs. 1 | hoch |
| ehevertrag | aufwand | Rahmen 500–3000 | § 16 Abs. 1 | hoch |
| testament | aufwand | Rahmen 500–5000 | § 19 Abs. 1 | hoch |
| vorsorgeauftrag | aufwand | Rahmen 100–3000 | § 18a | hoch |
| vollmacht | fix | fix 30 | § 11 Abs. 1 (Beglaubigung); § 49 (Beurkundung) | mittel |
| ag_gruendung | sondersatz | 3‰ min 1000 max 11750 | § 37 Abs. 1 | hoch |
| gmbh_gruendung | sondersatz | 3‰ min 1000 max 11750 | § 42 Abs. 1 i.V.m. § 37 | hoch |
| kapitalerhoehung | sondersatz | 3‰ min 500 max 11750 | § 38 (AG); § 42 Abs. 1 (GmbH) i.V.m. § 37 | hoch |
| stiftung | aufwand | Rahmen 500–3000 | § 15 Abs. 1 | hoch |
| buergschaft | sondersatz | 2‰ min 300 max 1000 | § 35 Abs. 1 | hoch |
| schuldanerkennung | offen | 2‰ min 100 max 4600 | § 49 bzw. § 50 (kein eigener Tatbestand) | tief |

## UR — Uri (freies)
- **Erlass:** Notariatstarif der Urner Notarinnen und Notare (Verbands-/Konventionaltarif des Urner Anwalts- und Notarenverbandes) (kein amtlicher RB-Nr. (privater Verbandstarif; nicht in der kantonalen Rechtssammlung publiziert); teils zitiert als urilaw RB 9.2311), Stand vom 25. März 2014, Stand/letzte Änderung 17. März 2015 (weiterhin die auf urilaw.ch publizierte geltende Fassung, Abruf 15.06.2026)
- **Quelle:** https://www.urilaw.ch/fileadmin/user_upload/documents/Notariatstarif-Uri.pdf
- **Genereller Werttarif:** staffel — Ziff. 5 (Grundgebühr Tarif A) i.V.m. Ziff. 5.2; Begrenzungen Ziff. 8.3/8.4
- **Doppelcheck:** bestätigt

| Geschäftsart | Behandlung | Regel | Artikel | Konfidenz |
|---|---|---|---|---|
| grundstueckkauf | genereller_werttarif | Rahmen 500–30000 | Ziff. 5.1 Bst. c i.V.m. Ziff. 5.2 | hoch |
| dienstbarkeit | fix | fix 500 | Ziff. 7 Bst. h | hoch |
| schenkung | genereller_werttarif | Rahmen 500–30000 | Ziff. 5.1 Bst. e i.V.m. Ziff. 5.2 | hoch |
| erbvertrag | fix | fix 750 | Ziff. 7 Bst. d | hoch |
| ehevertrag | fix | fix 750 | Ziff. 7 Bst. b | hoch |
| testament | fix | fix 750 | Ziff. 7 Bst. c | hoch |
| vorsorgeauftrag | fix | fix 750 | Ziff. 7 Bst. a | hoch |
| vollmacht | fix | fix 40 | Ziff. 9.1 (Beglaubigung Unterschrift) | mittel |
| ag_gruendung | genereller_werttarif | Rahmen 500–30000 | Ziff. 5.1 Bst. g i.V.m. Ziff. 5.2 | hoch |
| gmbh_gruendung | genereller_werttarif | Rahmen 500–30000 | Ziff. 5.1 Bst. g i.V.m. Ziff. 5.2 | hoch |
| kapitalerhoehung | genereller_werttarif | Rahmen 500–30000 | Ziff. 5.1 Bst. g i.V.m. Ziff. 5.2 | hoch |
| stiftung | genereller_werttarif | Rahmen 500–30000 | Ziff. 5.1 Bst. g i.V.m. Ziff. 5.2 | hoch |
| buergschaft | genereller_werttarif | Rahmen 500–30000 | Ziff. 5.1 Bst. f i.V.m. Ziff. 5.2 | hoch |
| schuldanerkennung | offen | — | kein ausdruecklicher Tatbestand (weder Ziff. 5.1 n | tief |

## SZ — Schwyz (amtsnotariat)
- **Erlass:** Gebührentarif für Notare und Grundbuchverwalter sowie freiberufliche Urkundspersonen (SRSZ 213.512), Stand SRSZ 1.2.2021; letzte Änderung 19. Mai 2020, in Kraft seit 1. Juli 2020 (PDF regeneriert 20.8.2025)
- **Quelle:** https://www.sz.ch/public/upload/assets/7361/213_512.pdf
- **Genereller Werttarif:** promille — § 5 Abs. 1 Nr. 1
- **Doppelcheck:** bestätigt

| Geschäftsart | Behandlung | Regel | Artikel | Konfidenz |
|---|---|---|---|---|
| grundstueckkauf | genereller_werttarif | 0.9‰ max 13500 | § 5 Abs. 1 Nr. 1 | hoch |
| dienstbarkeit | genereller_werttarif | 0.9‰ max 13500 | § 5 Abs. 1 Nr. 1 | hoch |
| schenkung | offen | — | § 5 Abs. 1 Nr. 1 / Nr. 3 / Nr. 13 | mittel |
| erbvertrag | fix | Rahmen 60–800 | § 5 Abs. 1 Nr. 7 | hoch |
| ehevertrag | fix | Rahmen 60–800 | § 5 Abs. 1 Nr. 7 | hoch |
| testament | fix | Rahmen 60–800 | § 5 Abs. 1 Nr. 7 | hoch |
| vorsorgeauftrag | fix | Rahmen 60–800 | § 5 Abs. 1 Nr. 7 | hoch |
| vollmacht | fix | Rahmen 6–20 | § 5 Abs. 1 Nr. 3 | mittel |
| ag_gruendung | fix | Rahmen 200–1300 | § 5 Abs. 1 Nr. 8 | hoch |
| gmbh_gruendung | fix | Rahmen 200–1300 | § 5 Abs. 1 Nr. 8 | hoch |
| kapitalerhoehung | fix | Rahmen 100–1000 | § 5 Abs. 1 Nr. 9 | hoch |
| stiftung | fix | Rahmen 200–1300 | § 5 Abs. 1 Nr. 8 | mittel |
| buergschaft | sondersatz | 0.5‰ min 50 max 1000 | § 5 Abs. 1 Nr. 10 | hoch |
| schuldanerkennung | offen | — | § 5 Abs. 1 Nr. 3 / Nr. 13 | mittel |

## OW — Obwalden (freies)
- **Erlass:** Verordnung über die Beurkundungsgebühren (GDB 210.32), Stand In Kraft seit 1. April 2012; Art. 10 Ziff. 6 (Vorsorgeauftrag) seit 1. Januar 2013 (Beschluss Kantonsrat vom 15. März 2012, OGS 2012, 18)
- **Quelle:** https://gdb.ow.ch/app/de/texts_of_law/210.32
- **Genereller Werttarif:** staffel — Art. 10 Ziff. 12 (Verträge auf Eigentumsübertragung, Kauf/Schenkung/Tausch)
- **Doppelcheck:** bestätigt

| Geschäftsart | Behandlung | Regel | Artikel | Konfidenz |
|---|---|---|---|---|
| grundstueckkauf | genereller_werttarif | 3‰ min 600 | Art. 10 Ziff. 26 lit. a (OR 216/1) i.V.m. Ziff. 12 | hoch |
| dienstbarkeit | fix | Rahmen 200–1500 | Art. 10 Ziff. 16 (Grunddienstbarkeit, ZGB 732); Zi | hoch |
| schenkung | genereller_werttarif | 3‰ min 600 | Art. 10 Ziff. 12 sowie Ziff. 28 (Schenkung von Gru | hoch |
| erbvertrag | sondersatz | 1‰ min 500 max 20000 | Art. 10 Ziff. 10 (ZGB 512) | hoch |
| ehevertrag | fix | Rahmen 500–1800 | Art. 10 Ziff. 3 (ZGB 181) | hoch |
| testament | sondersatz | 1‰ min 500 max 20000 | Art. 10 Ziff. 9 (ZGB 499) | hoch |
| vorsorgeauftrag | fix | Rahmen 300–1000 | Art. 10 Ziff. 6 (ZGB 361) | hoch |
| vollmacht | fix | fix 15 | Art. 10 Ziff. 1 (Beglaubigung) | hoch |
| ag_gruendung | sondersatz | 3‰ min 800 max 20000 | Art. 10 Ziff. 31 lit. a (OR 620 ff./764 ff.) | hoch |
| gmbh_gruendung | sondersatz | 3‰ min 800 max 20000 | Art. 10 Ziff. 32 (OR 772 ff.) i.V.m. Ziff. 31 | hoch |
| kapitalerhoehung | sondersatz | 3‰ min 800 max 20000 | Art. 10 Ziff. 31 lit. b (OR 650 ff.) | hoch |
| stiftung | sondersatz | 1‰ min 500 max 20000 | Art. 10 Ziff. 2 (ZGB 81) | hoch |
| buergschaft | sondersatz | 1‰ min 250 max 1000 | Art. 10 Ziff. 29 (OR 493) | hoch |
| schuldanerkennung | offen | Rahmen 200–1800 | Art. 10 (kein eigener Tatbestand); allenfalls Ziff | tief |

## NW — Nidwalden (amtsnotariat)
- **Erlass:** Verordnung über die Beurkundungsgebühren (Beurkundungsgebührenverordnung, BeurkGebV) (268.12), Stand 01.01.2016
- **Quelle:** https://gesetze.nw.ch/app/de/texts_of_law/268.12
- **Genereller Werttarif:** staffel — § 20 (Übertragungen von Grundeigentum); §§ 4, 7 für Bemessungsgrundsätze
- **Doppelcheck:** bestätigt

| Geschäftsart | Behandlung | Regel | Artikel | Konfidenz |
|---|---|---|---|---|
| grundstueckkauf | genereller_werttarif | 2.5‰ min 300 | § 20 Abs. 1 | hoch |
| dienstbarkeit | fix | Rahmen 300–1000 | § 24 (Nutzniessung), § 25 (Wohnrecht), § 26a (ande | hoch |
| schenkung | fix | Rahmen 200–800 | § 32; (für Grundstücke § 20) | mittel |
| erbvertrag | sondersatz | 3‰ min 400 | § 18 Abs. 3 i.V.m. Abs. 1 | hoch |
| ehevertrag | fix | Rahmen 350–3000 | § 15 | hoch |
| testament | sondersatz | 3‰ min 400 | § 18 Abs. 1 | hoch |
| vorsorgeauftrag | fix | Rahmen 300–1000 | § 17a | hoch |
| vollmacht | fix | fix 25 | § 49 (Beglaubigung Unterschrift); § 47 (beurkundun | mittel |
| ag_gruendung | sondersatz | 3‰ min 1000 | § 36 Ziff. 1 | hoch |
| gmbh_gruendung | sondersatz | 3‰ min 1000 | § 41 Abs. 1 i.V.m. § 36 | hoch |
| kapitalerhoehung | sondersatz | 3‰ min 300 | § 37 (AG) / § 41 Abs. 1 i.V.m. § 37 (GmbH) | hoch |
| stiftung | fix | Rahmen 250–3000 | § 14 | hoch |
| buergschaft | sondersatz | 1.5‰ min 250 max 1000 | § 34 Abs. 1 | hoch |
| schuldanerkennung | offen | Rahmen 200–2000 | kein spezifischer Tatbestand; ggf. § 47 oder § 48 | tief |

## GL — Glarus (amtsnotariat)
- **Erlass:** Verordnung über Beurkundung und Beglaubigung mit Gebührentarif (GS III B/3/2), Stand 26.11.2008, in Kraft seit 01.01.2009 (geltende Erstfassung, nicht aufgehoben, keine Folgeversionen)
- **Quelle:** https://gesetze.gl.ch/app/de/texts_of_law/III%20B%2F3%2F2
- **Genereller Werttarif:** keiner (tatbestandsweise)
- **Doppelcheck:** bestätigt

| Geschäftsart | Behandlung | Regel | Artikel | Konfidenz |
|---|---|---|---|---|
| grundstueckkauf | sondersatz | 3‰ min 400 | Art. A1-1 Nr. 1 (Ziff. 1.1-1.4) | hoch |
| dienstbarkeit | fix | Rahmen 200–1000 | Art. A1-1 Nr. 5 | hoch |
| schenkung | fix | Rahmen 100–1000 | Art. A1-1 Nr. 1 (bei Grundstück) bzw. Art. A1-3 (s | mittel |
| erbvertrag | fix | Rahmen 100–1000 | Art. A1-3 | mittel |
| ehevertrag | fix | Rahmen 100–1000 | Art. A1-3 | mittel |
| testament | fix | Rahmen 100–1000 | Art. A1-3 | mittel |
| vorsorgeauftrag | fix | Rahmen 100–1000 | Art. A1-3 | mittel |
| vollmacht | fix | Rahmen 15–1000 | Art. A1-5 Nr. 1 (Beglaubigung) bzw. Art. A1-3 (Beu | hoch |
| ag_gruendung | fix | Rahmen 100–1000 | Art. A1-3 | mittel |
| gmbh_gruendung | fix | Rahmen 100–1000 | Art. A1-3 | mittel |
| kapitalerhoehung | fix | Rahmen 100–1000 | Art. A1-3 | mittel |
| stiftung | fix | Rahmen 100–1000 | Art. A1-3 | mittel |
| buergschaft | sondersatz | 0.5‰ min 300 max 1500 | Art. A1-2 Nr. 8 (Ziff. 8.1-8.3) | hoch |
| schuldanerkennung | fix | Rahmen 100–1000 | Art. A1-3 | mittel |

## ZG — Zug (amtsnotariat)
- **Erlass:** Kantonsratsbeschluss über die Gebühren in Verwaltungs- und Zivilsachen (Verwaltungsgebührentarif) (641.1), Stand 5.6.2025 / in Kraft seit 22.8.2025 (konsolidierte Fassung, geltend)
- **Quelle:** https://bgs.zg.ch/app/de/texts_of_law/641.1
- **Genereller Werttarif:** keiner (tatbestandsweise)
- **Doppelcheck:** bestätigt

| Geschäftsart | Behandlung | Regel | Artikel | Konfidenz |
|---|---|---|---|---|
| grundstueckkauf | fix | Rahmen 300–4000 | § 9 Nr. 89 | hoch |
| dienstbarkeit | fix | Rahmen 300–4000 | § 9 Nr. 89ter | hoch |
| schenkung | offen | — | § 9 (kein eigener Tatbestand); evtl. Nr. 89 (bei G | tief |
| erbvertrag | fix | Rahmen 300–4000 | § 9 Nr. 88 | hoch |
| ehevertrag | fix | Rahmen 300–4000 | § 9 Nr. 86 | hoch |
| testament | fix | Rahmen 300–4000 | § 9 Nr. 88 | hoch |
| vorsorgeauftrag | fix | Rahmen 200–2000 | § 9 Nr. 86quater | hoch |
| vollmacht | fix | Rahmen 100–500 | § 9 Nr. 91 (bzw. Nr. 95 für Unterschriftsbeglaubig | mittel |
| ag_gruendung | fix | Rahmen 400–15000 | § 9 Nr. 90 | hoch |
| gmbh_gruendung | fix | Rahmen 400–15000 | § 9 Nr. 90 | hoch |
| kapitalerhoehung | fix | Rahmen 400–15000 | § 9 Nr. 90 | mittel |
| stiftung | fix | Rahmen 500–4000 | § 9 Nr. 85 | hoch |
| buergschaft | fix | Rahmen 100–500 | § 9 Nr. 91 | hoch |
| schuldanerkennung | offen | — | § 9 (kein eigener Tatbestand); subsidiär Nr. 94 od | tief |

## FR — Freiburg (freies)
- **Erlass:** Tarif des émoluments des notaires (RSF 261.16), Stand Version en vigueur dès le 01.07.2016 (dernière modification de l'art. 4 adoptée le 28.06.2016, ROF 2016_091); acte de base du 07.10.1986. Erlass nicht aufgehoben (aktiv).
- **Quelle:** https://bdlf.fr.ch/api/fr/versions/8428/pdf_file
- **Genereller Werttarif:** staffel — Art. 4 ch. 1bis (i.V.m. Art. 3 für die massgebende Summe)
- **Doppelcheck:** bestätigt

| Geschäftsart | Behandlung | Regel | Artikel | Konfidenz |
|---|---|---|---|---|
| grundstueckkauf | genereller_werttarif | Rahmen 150–10000 | Art. 4 ch. 1bis i.V.m. Art. 3 | hoch |
| dienstbarkeit | genereller_werttarif | Rahmen 150–10000 | Art. 4 ch. 1bis | hoch |
| schenkung | genereller_werttarif | Rahmen 150–10000 | Art. 4 ch. 1bis; sonst Art. 5 ch. 12 | mittel |
| erbvertrag | sondersatz | Rahmen 100–10000 | Art. 4 ch. 1 bzw. Art. 5 ch. 1 | hoch |
| ehevertrag | sondersatz | Rahmen 150–10000 | Art. 4 ch. 1 i.V.m. Art. 3 | hoch |
| testament | fix | Rahmen 100–2000 | Art. 5 ch. 1 | hoch |
| vorsorgeauftrag | aufwand | Rahmen 50–1500 | Art. 5 ch. 12 | mittel |
| vollmacht | fix | fix 25 | Art. 5 ch. 7 (Procuration); Art. 5 ch. 8 (Légalisa | hoch |
| ag_gruendung | sondersatz | Rahmen 500–12000 | Art. 4 ch. 5 | hoch |
| gmbh_gruendung | sondersatz | Rahmen 500–12000 | Art. 4 ch. 5 | hoch |
| kapitalerhoehung | sondersatz | Rahmen 500–12000 | Art. 4 ch. 5 | hoch |
| stiftung | sondersatz | Rahmen 500–12000 | Art. 4 ch. 5 | hoch |
| buergschaft | sondersatz | 1.5‰ min 50 max 1000 | Art. 4 ch. 4 | hoch |
| schuldanerkennung | aufwand | Rahmen 50–1500 | Art. 5 ch. 12 | mittel |

## SO — Solothurn (amtsnotariat)
- **Erlass:** Gebührentarif (GT) (BGS 615.11), Stand 1. März 2026 (Beschluss 11. November 2025); Erlassdatum 8. März 2016
- **Quelle:** https://bgs.so.ch/app/de/texts_of_law/615.11
- **Genereller Werttarif:** keiner (tatbestandsweise)
- **Doppelcheck:** bestätigt

| Geschäftsart | Behandlung | Regel | Artikel | Konfidenz |
|---|---|---|---|---|
| grundstueckkauf | sondersatz | Rahmen 100–10000 | § 25 lit. a GT | hoch |
| dienstbarkeit | sondersatz | Rahmen 100–10000 | § 25 lit. g und lit. h GT | hoch |
| schenkung | sondersatz | Rahmen 100–10000 | § 25 lit. a GT | hoch |
| erbvertrag | sondersatz | Rahmen 200–6000 | § 24 lit. a GT | hoch |
| ehevertrag | sondersatz | Rahmen 300–3000 | § 23 lit. b GT | hoch |
| testament | sondersatz | Rahmen 200–6000 | § 24 lit. a GT | hoch |
| vorsorgeauftrag | offen | Rahmen 10–2000 | § 27 lit. c GT (Auffangtatbestand) | tief |
| vollmacht | offen | fix 20 | § 27 lit. a bzw. lit. c GT | tief |
| ag_gruendung | sondersatz | Rahmen 500–10000 | § 26 lit. c GT | hoch |
| gmbh_gruendung | sondersatz | Rahmen 500–10000 | § 26 lit. c GT | hoch |
| kapitalerhoehung | sondersatz | Rahmen 500–10000 | § 26 lit. c GT | mittel |
| stiftung | sondersatz | Rahmen 300–3000 | § 22 lit. a GT | hoch |
| buergschaft | sondersatz | Rahmen 100–1000 | § 26 lit. a GT | hoch |
| schuldanerkennung | offen | Rahmen 10–2000 | § 27 lit. c GT (Auffangtatbestand); ggf. § 25 lit. | tief |

## BS — Basel-Stadt (freies)
- **Erlass:** Verordnung über den Notariatstarif (SG 292.400), Stand 1. Juli 2016 (Beschluss 28.06.2016); Erlass vom 19.06.2001, nicht aufgehoben
- **Quelle:** https://www.gesetzessammlung.bs.ch/app/de/texts_of_law/292.400
- **Genereller Werttarif:** keiner (tatbestandsweise)
- **Doppelcheck:** bestätigt

| Geschäftsart | Behandlung | Regel | Artikel | Konfidenz |
|---|---|---|---|---|
| grundstueckkauf | sondersatz | 2.5‰ min 500 max 50000 | § 11 Ziff. 17 i.V.m. § 8 Abs. 4 | hoch |
| dienstbarkeit | fix | Rahmen 200–1000 | § 11 Ziff. 22 (Dienstbarkeit), Ziff. 23 (Nutzniess | hoch |
| schenkung | sondersatz | 2.5‰ min 200 max 50000 | § 11 Ziff. 17 (Grundstück) bzw. Ziff. 42 (übrige) | mittel |
| erbvertrag | fix | Rahmen 400–2000 | § 11 Ziff. 8 i.V.m. Ziff. 2 | hoch |
| ehevertrag | fix | Rahmen 400–2000 | § 11 Ziff. 2 | hoch |
| testament | fix | Rahmen 400–2000 | § 11 Ziff. 7 i.V.m. Ziff. 2 | hoch |
| vorsorgeauftrag | fix | Rahmen 200–1000 | § 11 Ziff. 5 | hoch |
| vollmacht | aufwand | fix 15 | § 11 Ziff. 42 (Beurkundung) bzw. Ziff. 39 (Beglaub | hoch |
| ag_gruendung | sondersatz | 2.4‰ min 750 max 50000 | § 11 Ziff. 33 lit. a | hoch |
| gmbh_gruendung | sondersatz | 2.4‰ min 750 max 50000 | § 11 Ziff. 33 lit. a | hoch |
| kapitalerhoehung | sondersatz | Rahmen 1500–37500 | § 11 Ziff. 33 lit. c | hoch |
| stiftung | sondersatz | 1.5‰ min 400 max 2000 | § 11 Ziff. 1 | hoch |
| buergschaft | fix | Rahmen 200–2000 | § 11 Ziff. 31 | hoch |
| schuldanerkennung | aufwand | nach Aufwand | § 11 Ziff. 42 (Auffangtatbestand); ggf. Ziff. 36a  | mittel |

## BL — Basel-Landschaft (freies)
- **Erlass:** Verordnung über die Notariatsgebühren (NotGebV) (SGS 217.13), Stand 1.11.2012 (Erlass vom 23.10.2012, in Kraft seit 1.11.2012; keine Aufhebung/Folgeversionen)
- **Quelle:** https://bl.clex.ch/app/de/texts_of_law/217.13
- **Genereller Werttarif:** keiner (tatbestandsweise)
- **Doppelcheck:** bestätigt

| Geschäftsart | Behandlung | Regel | Artikel | Konfidenz |
|---|---|---|---|---|
| grundstueckkauf | aufwand | Rahmen 800–2500 | §9 Abs. 1 lit. d (i.V.m. Abs. 2, §8) | hoch |
| dienstbarkeit | aufwand | Rahmen 500–1600 | §9 Abs. 1 lit. e | hoch |
| schenkung | offen | — | §8 Abs. 1 (subsidiär) | mittel |
| erbvertrag | aufwand | Rahmen 500–1700 | §9 Abs. 1 lit. a | hoch |
| ehevertrag | aufwand | Rahmen 500–1700 | §9 Abs. 1 lit. a | hoch |
| testament | aufwand | Rahmen 400–1500 | §9 Abs. 1 lit. b | hoch |
| vorsorgeauftrag | aufwand | Rahmen 180–260 | §8 Abs. 1 (subsidiär) | mittel |
| vollmacht | fix | fix 20 | §10 Abs. 1 lit. c (Beglaubigung); §8 (Beurkundung) | mittel |
| ag_gruendung | aufwand | Rahmen 700–2000 | §9 Abs. 1 lit. c | hoch |
| gmbh_gruendung | aufwand | Rahmen 700–2000 | §9 Abs. 1 lit. c | hoch |
| kapitalerhoehung | aufwand | Rahmen 180–260 | §8 Abs. 1 (subsidiär) | mittel |
| stiftung | offen | Rahmen 180–260 | §8 Abs. 1 (subsidiär) | tief |
| buergschaft | fix | fix 250 | §10 Abs. 1 lit. b; sonst §8 | mittel |
| schuldanerkennung | offen | Rahmen 180–260 | §8 Abs. 1 (subsidiär) | tief |

## SH — Schaffhausen (amtsnotariat)
- **Erlass:** Verordnung über die Gebühren für öffentliche Beurkundungen (Notariatsgebührenverordnung); ergänzend für grundbuchliche Beurkundungen die Grundbuchgebührenverordnung (SHR 211.433) (221.101 (ergänzend 211.433)), Stand 221.101: Stand 1.1.2016 (Version 1125); 211.433: Stand 1.1.2011 (Version 1813)
- **Quelle:** https://rechtsbuch.sh.ch/api/de/texts_of_law/221.101
- **Genereller Werttarif:** keiner (tatbestandsweise)
- **Doppelcheck:** bestätigt

| Geschäftsart | Behandlung | Regel | Artikel | Konfidenz |
|---|---|---|---|---|
| grundstueckkauf | sondersatz | 1‰ min 50 | 211.433 § 13 Abs. 1 Ziff. 1 (Grundbuchgebührenvero | hoch |
| dienstbarkeit | fix | Rahmen 50–500 | 211.433 § 13 Abs. 1 Ziff. 4 | hoch |
| schenkung | aufwand | Rahmen 100–10000 | 221.101 § 1 Abs. 1 Ziff. 5 i.V.m. § 3 | mittel |
| erbvertrag | aufwand | Rahmen 100–10000 | 221.101 § 1 Abs. 1 Ziff. 5 i.V.m. § 3 | mittel |
| ehevertrag | aufwand | Rahmen 100–10000 | 221.101 § 1 Abs. 1 Ziff. 5 i.V.m. § 3 | mittel |
| testament | aufwand | Rahmen 100–10000 | 221.101 § 1 Abs. 1 Ziff. 5 i.V.m. § 3 | mittel |
| vorsorgeauftrag | aufwand | Rahmen 100–10000 | 221.101 § 1 Abs. 1 Ziff. 5 i.V.m. § 3 | mittel |
| vollmacht | aufwand | Rahmen 15–10000 | 221.101 § 1 Abs. 1 Ziff. 5; Beglaubigung 211.433 § | mittel |
| ag_gruendung | sondersatz | 2‰ min 800 max 10000 | 221.101 § 1 Abs. 1 Ziff. 2 Bst. a | hoch |
| gmbh_gruendung | sondersatz | 2‰ min 800 max 10000 | 221.101 § 1 Abs. 1 Ziff. 2 Bst. a | hoch |
| kapitalerhoehung | sondersatz | 2‰ min 800 max 10000 | 221.101 § 1 Abs. 1 Ziff. 2 Bst. a | hoch |
| stiftung | sondersatz | 2‰ min 500 max 10000 | 221.101 § 1 Abs. 1 Ziff. 1 | hoch |
| buergschaft | sondersatz | 2‰ min 100 max 500 | 221.101 § 1 Abs. 1 Ziff. 3 | hoch |
| schuldanerkennung | aufwand | Rahmen 100–10000 | 221.101 § 1 Abs. 1 Ziff. 5 i.V.m. § 3 | mittel |

## AR — Appenzell A.Rh. (amtsnotariat)
- **Erlass:** Gesetz über die Gebühren der Gemeinden (Gebührentarif für die Gemeinden) (bGS 153.2), Stand 1. Januar 2018 (Beschluss 20. März 2017; Erlass vom 26. Februar 2001)
- **Quelle:** https://ar.clex.ch/api/de/versions/1203/pdf_file
- **Genereller Werttarif:** keiner (tatbestandsweise)
- **Doppelcheck:** bestätigt

| Geschäftsart | Behandlung | Regel | Artikel | Konfidenz |
|---|---|---|---|---|
| grundstueckkauf | sondersatz | 1‰ min 200 max 4000 | Art. 12 Ziff. 8.1 lit. a | hoch |
| dienstbarkeit | fix | Rahmen 50–4000 | Art. 12 Ziff. 8.3 | hoch |
| schenkung | sondersatz | 1‰ min 50 max 4000 | Art. 12 Ziff. 8.1 lit. a; subsidiaer Ziff. 5.10 | mittel |
| erbvertrag | fix | Rahmen 50–500 | Art. 12 Ziff. 5.5 | hoch |
| ehevertrag | fix | Rahmen 50–500 | Art. 12 Ziff. 5.2 | hoch |
| testament | fix | Rahmen 50–500 | Art. 12 Ziff. 5.4 | hoch |
| vorsorgeauftrag | fix | Rahmen 50–500 | Art. 12 Ziff. 5.10 (Auffanggebuehr) | mittel |
| vollmacht | fix | Rahmen 5–500 | Art. 12 Ziff. 6 (Beglaubigung) bzw. Ziff. 5.10 (Be | mittel |
| ag_gruendung | sondersatz | — | Art. 12 Ziff. 5.8 lit. a | hoch |
| gmbh_gruendung | sondersatz | — | Art. 12 Ziff. 5.8 lit. a | hoch |
| kapitalerhoehung | sondersatz | 0.25‰ min 250 | Art. 12 Ziff. 5.8 lit. b | hoch |
| stiftung | sondersatz | 1‰ min 100 max 2000 | Art. 12 Ziff. 5.1 | hoch |
| buergschaft | fix | Rahmen 20–100 | Art. 12 Ziff. 5.7 | hoch |
| schuldanerkennung | fix | Rahmen 50–500 | Art. 12 Ziff. 5.10 (Auffanggebuehr) | mittel |

## AI — Appenzell I.Rh. (amtsnotariat)
- **Erlass:** Gebührentarif (GebT) (GS 172.513), Stand 2026-01-01
- **Quelle:** https://ai.clex.ch/app/de/texts_of_law/172.513
- **Genereller Werttarif:** keiner (tatbestandsweise)
- **Doppelcheck:** bestätigt

| Geschäftsart | Behandlung | Regel | Artikel | Konfidenz |
|---|---|---|---|---|
| grundstueckkauf | sondersatz | 1‰ min 60 | Art. 14 Abs. 2 Ziff. 1 GebT | hoch |
| dienstbarkeit | fix | Rahmen 100–2000 | Art. 14 Abs. 2 Ziff. 8 GebT | hoch |
| schenkung | sondersatz | 1‰ min 60 | Art. 14 Abs. 2 Ziff. 1 GebT (Grundstück) bzw. Art. | mittel |
| erbvertrag | fix | Rahmen 350–3000 | Art. 14 Abs. 1 Ziff. 5 GebT | hoch |
| ehevertrag | fix | Rahmen 250–2000 | Art. 14 Abs. 1 Ziff. 1 GebT | hoch |
| testament | fix | Rahmen 250–2000 | Art. 14 Abs. 1 Ziff. 3 GebT | hoch |
| vorsorgeauftrag | fix | Rahmen 200–2000 | Art. 14 Abs. 1 Ziff. 2 GebT | hoch |
| vollmacht | fix | fix 20 | Art. 6 Abs. 1 Ziff. 1 GebT (Beglaubigung) bzw. Art | mittel |
| ag_gruendung | fix | Rahmen 400–4000 | Art. 14 Abs. 3 Ziff. 1 GebT | hoch |
| gmbh_gruendung | fix | Rahmen 400–4000 | Art. 14 Abs. 3 Ziff. 1 GebT | hoch |
| kapitalerhoehung | fix | Rahmen 300–4000 | Art. 14 Abs. 3 Ziff. 2 GebT | hoch |
| stiftung | fix | Rahmen 400–4000 | Art. 14 Abs. 3 Ziff. 7 GebT | hoch |
| buergschaft | sondersatz | 1‰ | Art. 14 Abs. 4 Ziff. 2 GebT | hoch |
| schuldanerkennung | fix | Rahmen 20–200 | Art. 14 Abs. 4 Ziff. 4 GebT | mittel |

## SG — St. Gallen (amtsnotariat)
- **Erlass:** Verordnung über die Gebühren für Amtshandlungen der Grundbuchämter und für die Durchführung von Grundstückschätzungen (GB-GebV) — für grundstücksbezogene Beurkundungen; ergänzt durch Gebührentarif für die Kantons- und Gemeindeverwaltung (GebT), Abschnitt III «Beurkundungen und Beglaubigungen», für die übrigen öffentlichen Beurkundungen (914.5 (GB-GebV); 821.5 (GebT)), Stand GB-GebV (sGS 914.5): Stand 1. Juni 2020 (Erlass 10.11.2015). GebT (sGS 821.5): Stand 1. Januar 2026 (XXVI. Nachtrag, RRB 9.12.2025)
- **Quelle:** https://www.gesetzessammlung.sg.ch/api/de/versions/2935/pdf_file_with_annexes
- **Genereller Werttarif:** promille — GB-GebV (sGS 914.5) Art. 5 Abs. 1 i.V.m. Art. 8 Nr. 20.01
- **Doppelcheck:** bestätigt

| Geschäftsart | Behandlung | Regel | Artikel | Konfidenz |
|---|---|---|---|---|
| grundstueckkauf | genereller_werttarif | 2‰ min 200 max 10000 | GB-GebV (sGS 914.5) Art. 5 Abs. 1 i.V.m. Art. 8 Nr | hoch |
| dienstbarkeit | sondersatz | 2‰ min 150 max 10000 | GB-GebV (sGS 914.5) Art. 11 Nr. 22.01 / 22.04 i.V. | hoch |
| schenkung | genereller_werttarif | 2‰ min 200 max 10000 | GB-GebV (sGS 914.5) Art. 7/Art. 8 (Grundstückssche | mittel |
| erbvertrag | fix | Rahmen 330–1650 | GebT (sGS 821.5) Abschnitt III, Nr. 60.07 | hoch |
| ehevertrag | fix | Rahmen 220–1650 | GebT (sGS 821.5) Nr. 60.02.01/02/03 | hoch |
| testament | fix | Rahmen 110–1100 | GebT (sGS 821.5) Nr. 60.06 | hoch |
| vorsorgeauftrag | fix | Rahmen 110–1100 | GebT (sGS 821.5) Nr. 60.05.01 | hoch |
| vollmacht | fix | Rahmen 15–50 | GebT (sGS 821.5) Abschnitt III.B (Beglaubigungen)  | hoch |
| ag_gruendung | sondersatz | Rahmen 385–15000 | GebT (sGS 821.5) Nr. 60.13 | hoch |
| gmbh_gruendung | sondersatz | Rahmen 385–15000 | GebT (sGS 821.5) Nr. 60.13 (i.V.m. 60.13–18, Art.  | hoch |
| kapitalerhoehung | sondersatz | Rahmen 385–15000 | GebT (sGS 821.5) Nr. 60.14 | hoch |
| stiftung | sondersatz | Rahmen 330–3850 | GebT (sGS 821.5) Nr. 60.01 | hoch |
| buergschaft | sondersatz | 0.5‰ min 50 max 400 | GebT (sGS 821.5) Nr. 60.11 | hoch |
| schuldanerkennung | offen | — | GebT (sGS 821.5) Abschnitt III — kein ausdrücklich | tief |

## GR — Graubünden (freies)
- **Erlass:** Verordnung über die Notariatsgebühren (NotGebV) (BR 210.370), Stand 1. Januar 2024 (Beschluss 19.12.2023)
- **Quelle:** https://www.gr-lex.gr.ch/api/de/versions/3348/pdf_file
- **Genereller Werttarif:** promille — Art. 16 Abs. 1 lit. a NotGebV (Sachenrecht/Beurkundung)
- **Doppelcheck:** bestätigt

| Geschäftsart | Behandlung | Regel | Artikel | Konfidenz |
|---|---|---|---|---|
| grundstueckkauf | genereller_werttarif | 1‰ min 100 max 15000 | Art. 16 Abs. 1 lit. a i.V.m. Art. 14, 15 NotGebV | hoch |
| dienstbarkeit | sondersatz | 1‰ min 100 max 15000 | Art. 16 Abs. 1 lit. n NotGebV | hoch |
| schenkung | aufwand | nach Aufwand | Art. 7 Abs. 1 NotGebV (bzw. Art. 16 lit. a bei Gru | mittel |
| erbvertrag | sondersatz | 1‰ min 500 max 15000 | Art. 13 Abs. 1 lit. b NotGebV | hoch |
| ehevertrag | sondersatz | 1‰ min 500 max 15000 | Art. 12 Abs. 1 lit. a NotGebV | hoch |
| testament | sondersatz | 1‰ min 300 max 15000 | Art. 13 Abs. 1 lit. a NotGebV | hoch |
| vorsorgeauftrag | fix | fix 200 | Art. 12 Abs. 1 lit. d NotGebV | hoch |
| vollmacht | fix | fix 30 | Art. 10 Abs. 1 lit. a NotGebV (Beglaubigung); Beur | mittel |
| ag_gruendung | sondersatz | 1‰ min 1000 | Art. 17 Abs. 1 lit. a NotGebV | hoch |
| gmbh_gruendung | sondersatz | 1‰ min 500 | Art. 18 Abs. 1 lit. a NotGebV | hoch |
| kapitalerhoehung | sondersatz | 1‰ min 500 | Art. 17 Abs. 1 lit. c (AG) bzw. Art. 18 Abs. 1 lit | hoch |
| stiftung | sondersatz | 1‰ min 500 | Art. 11 Abs. 1 lit. a/b NotGebV | hoch |
| buergschaft | sondersatz | 1‰ min 100 max 5000 | Art. 19 Abs. 1 lit. c NotGebV | hoch |
| schuldanerkennung | fix | fix 200 | Art. 19a Abs. 1 lit. a NotGebV (vollstreckbare öff | mittel |

## AG — Aargau (freies)
- **Erlass:** Dekret über den Notariatstarif (SAR 295.250), Stand 01.01.2025 (Version in Kraft seit 01.01.2025, Beschluss 02.07.2024; Erstfassung vom 30.08.2011)
- **Quelle:** https://gesetzessammlungen.ag.ch/api/de/texts_of_law/295.250
- **Genereller Werttarif:** keiner (tatbestandsweise)
- **Doppelcheck:** bestätigt

| Geschäftsart | Behandlung | Regel | Artikel | Konfidenz |
|---|---|---|---|---|
| grundstueckkauf | sondersatz | 4‰ min 300 max 20000 | § 2 Abs. 1 (i.V.m. Abs. 2) | hoch |
| dienstbarkeit | aufwand | nach Aufwand | § 1 (Aufwandtarif); arg. e § 2 (Promilletarif nur  | mittel |
| schenkung | aufwand | nach Aufwand | § 1 (Aufwandtarif) | mittel |
| erbvertrag | aufwand | nach Aufwand | § 1 (Aufwandtarif) | hoch |
| ehevertrag | aufwand | nach Aufwand | § 1 (Aufwandtarif) | hoch |
| testament | aufwand | nach Aufwand | § 1 (Aufwandtarif) | hoch |
| vorsorgeauftrag | aufwand | nach Aufwand | § 1 (Aufwandtarif) | hoch |
| vollmacht | fix | fix 20 | § 6 Abs. 1 lit. a (Beglaubigung) bzw. § 1 (Aufwand | hoch |
| ag_gruendung | aufwand | nach Aufwand | § 1 (Aufwandtarif) | hoch |
| gmbh_gruendung | aufwand | nach Aufwand | § 1 (Aufwandtarif) | hoch |
| kapitalerhoehung | aufwand | nach Aufwand | § 1 (Aufwandtarif) | hoch |
| stiftung | aufwand | nach Aufwand | § 1 (Aufwandtarif) | hoch |
| buergschaft | aufwand | nach Aufwand | § 1 (Aufwandtarif) | hoch |
| schuldanerkennung | aufwand | nach Aufwand | § 1 (Aufwandtarif); ggf. § 3 wenn grundpfandgesich | mittel |

## TG — Thurgau (amtsnotariat)
- **Erlass:** Gesetz über die Gebühren und Gemengsteuern der Grundbuchämter und Notariate (GGG) (RB 632.1), Stand 01.01.2016 (Beschluss 22.04.2015; vom 20.11.1996)
- **Quelle:** https://www.rechtsbuch.tg.ch/api/de/texts_of_law/632.1
- **Genereller Werttarif:** promille — § 14 Abs. 1 GGG
- **Doppelcheck:** bestätigt

| Geschäftsart | Behandlung | Regel | Artikel | Konfidenz |
|---|---|---|---|---|
| grundstueckkauf | genereller_werttarif | 1‰ min 100 max 5000 | § 14 Abs. 1 GGG | hoch |
| dienstbarkeit | genereller_werttarif | 1‰ min 100 max 5000 | § 14 Abs. 1 GGG (Beurkundung); § 14 Abs. 2 Ziff. 1 | hoch |
| schenkung | aufwand | Rahmen 200–10000 | § 16 GGG | hoch |
| erbvertrag | aufwand | Rahmen 200–10000 | § 16 GGG | hoch |
| ehevertrag | aufwand | Rahmen 200–10000 | § 16 GGG | hoch |
| testament | aufwand | Rahmen 200–10000 | § 16 GGG | hoch |
| vorsorgeauftrag | aufwand | Rahmen 200–10000 | § 16 GGG | mittel |
| vollmacht | aufwand | Rahmen 200–10000 | § 16 GGG; § 7/§ 19 GGG (Beglaubigung) | mittel |
| ag_gruendung | aufwand | Rahmen 200–10000 | § 16 GGG | hoch |
| gmbh_gruendung | aufwand | Rahmen 200–10000 | § 16 GGG | hoch |
| kapitalerhoehung | aufwand | Rahmen 200–10000 | § 16 GGG | hoch |
| stiftung | aufwand | Rahmen 200–10000 | § 16 GGG | hoch |
| buergschaft | aufwand | Rahmen 200–10000 | § 16 GGG | hoch |
| schuldanerkennung | aufwand | Rahmen 200–10000 | § 16 GGG | hoch |

## TI — Tessin (freies)
- **Erlass:** Legge sulla tariffa notarile (del 26 novembre 2013) (RL 952.300), Stand In Kraft seit 1.7.2015 (BU 2015, 169); konsolidierte Fassung, keine späteren Änderungen gefunden. Abgerufen 15.6.2026.
- **Quelle:** https://m3.ti.ch/CAN/RLeggi/public/index.php/raccolta-leggi/pdfatto/atto/148
- **Genereller Werttarif:** staffel — Art. 5 cpv. 1 (i.V.m. Art. 2 u. Art. 3)
- **Doppelcheck:** bestätigt

| Geschäftsart | Behandlung | Regel | Artikel | Konfidenz |
|---|---|---|---|---|
| grundstueckkauf | genereller_werttarif | — | Art. 5 cpv. 1 i.V.m. Art. 3 lit. a | hoch |
| dienstbarkeit | genereller_werttarif | — | Art. 3 lit. h i.V.m. Art. 5 / bzw. Art. 9 lit. e | hoch |
| schenkung | genereller_werttarif | — | Art. 5 cpv. 1 i.V.m. Art. 3 lit. b | hoch |
| erbvertrag | fix | fix 10000 | Art. 9 lit. a | hoch |
| ehevertrag | fix | fix 10000 | Art. 9 lit. a | hoch |
| testament | fix | fix 10000 | Art. 9 lit. a | hoch |
| vorsorgeauftrag | fix | fix 500 | Art. 9 lit. h (analog Art. 26) | tief |
| vollmacht | fix | fix 500 | Art. 9 lit. h (Errichtung) bzw. Art. 17 (Unterschr | hoch |
| ag_gruendung | genereller_werttarif | — | Art. 5 cpv. 1 i.V.m. Art. 3 lit. l | hoch |
| gmbh_gruendung | genereller_werttarif | — | Art. 5 cpv. 1 i.V.m. Art. 3 lit. l | hoch |
| kapitalerhoehung | genereller_werttarif | — | Art. 5 cpv. 1 i.V.m. Art. 3 lit. l | hoch |
| stiftung | fix | fix 3000 | Art. 9 lit. i | hoch |
| buergschaft | sondersatz | — | Art. 6 i.V.m. Art. 5 cpv. 1 u. Art. 3 lit. i | hoch |
| schuldanerkennung | genereller_werttarif | — | Art. 5 cpv. 1 i.V.m. Art. 3 lit. a (bzw. Art. 6 be | mittel |

## VD — Waadt (freies)
- **Erlass:** Tarif des honoraires dus aux notaires pour des opérations ministérielles (TNo) (BLV 178.11.2), Stand Etat au 01.03.2016 (version actuelle en vigueur, dateAbrogation: null; dernière modification Modif. 3 du 20.01.2016, e.v. 01.03.2016)
- **Quelle:** https://prestations.vd.ch/pub/blv-publication/actes/consolide/178.11.2?id=26c09c57-9d81-4ec3-a442-e33bc904027b
- **Genereller Werttarif:** staffel — Art. 14 al. 1 TNo (barème de base) i.V.m. Art. 6 et Art. 7
- **Doppelcheck:** bestätigt

| Geschäftsart | Behandlung | Regel | Artikel | Konfidenz |
|---|---|---|---|---|
| grundstueckkauf | genereller_werttarif | — | Art. 14 al. 1 TNo (acte à exécution immédiate, 100 | hoch |
| dienstbarkeit | fix | Rahmen 100–2000 | Art. 23 TNo (autres servitudes: droits d'habitatio | hoch |
| schenkung | genereller_werttarif | — | Art. 6 al. 1 ch. 1 TNo i.V.m. Art. 14 (resp. Art.  | mittel |
| erbvertrag | sondersatz | 0.5‰ min 100 max 2000 | Art. 12 TNo (actes à cause de mort) | hoch |
| ehevertrag | sondersatz | 0.5‰ min 100 max 2000 | Art. 11 TNo (contrats de mariage) | hoch |
| testament | sondersatz | 0.5‰ min 100 max 2000 | Art. 12 TNo (actes à cause de mort) | hoch |
| vorsorgeauftrag | offen | — | Art. 2 TNo (renvoi art. 118 LNo) – pas de disposit | tief |
| vollmacht | fix | Rahmen 20–500 | Art. 30 TNo (procuration instrumentée en brevet);  | hoch |
| ag_gruendung | sondersatz | 3‰ min 200 max 2000 | Art. 26 TNo (sociétés de capitaux) | hoch |
| gmbh_gruendung | sondersatz | 3‰ min 200 max 2000 | Art. 26 TNo (sociétés de capitaux, incl. Sàrl) | hoch |
| kapitalerhoehung | sondersatz | 3‰ min 200 max 2000 | Art. 26 al. 1 et al. 3 TNo | hoch |
| stiftung | sondersatz | 3‰ min 200 max 2000 | Art. 9 TNo (renvoi à l'art. 26) | hoch |
| buergschaft | sondersatz | — | Art. 25 TNo (cautionnements) | hoch |
| schuldanerkennung | sondersatz | Rahmen 300–3000 | Art. 32a TNo (titre authentique exécutoire) si cla | mittel |

## VS — Wallis (freies)
- **Erlass:** Règlement fixant le tarif des émoluments et des débours des notaires (178.104), Stand 26.11.2008 (état 01.01.2011)
- **Quelle:** https://lex.vs.ch/api/fr/versions/1413/pdf_file
- **Genereller Werttarif:** staffel — Art. 13 al. 1 i.V.m. Art. 11 und Art. 12
- **Doppelcheck:** bestätigt

| Geschäftsart | Behandlung | Regel | Artikel | Konfidenz |
|---|---|---|---|---|
| grundstueckkauf | genereller_werttarif | — | Art. 11 al. 1 lit. d ch. 1 (acte de vente immobili | hoch |
| dienstbarkeit | genereller_werttarif | — | Art. 11 al. 1 lit. c ch. 3 (servitudes art. 731 CC | hoch |
| schenkung | genereller_werttarif | — | Art. 11 al. 1 lit. d ch. 5 (donation/promesse de d | mittel |
| erbvertrag | fix | Rahmen 200–3000 | Art. 16 al. 1 lit. c ch. 2 (pacte successoral, art | hoch |
| ehevertrag | fix | Rahmen 200–2000 | Art. 16 al. 1 lit. b ch. 1 (contrat de mariage et  | hoch |
| testament | fix | Rahmen 200–3000 | Art. 16 al. 1 lit. c ch. 1 (testament public, art. | hoch |
| vorsorgeauftrag | offen | — | - | tief |
| vollmacht | fix | fix 30 | Art. 16 al. 1 lit. i ch. 12 / ch. 13 (procuration) | hoch |
| ag_gruendung | genereller_werttarif | — | Art. 11 al. 1 lit. e ch. 1 (acte constitutif SA, a | hoch |
| gmbh_gruendung | genereller_werttarif | — | Art. 11 al. 1 lit. e ch. 4 (acte constitutif SARL, | hoch |
| kapitalerhoehung | genereller_werttarif | — | Art. 11 al. 1 lit. e ch. 2 (PV CA: augmentation or | mittel |
| stiftung | genereller_werttarif | — | Art. 11 al. 1 lit. a (constitution d'une fondation | hoch |
| buergschaft | sondersatz | 2‰ min 200 max 1000 | Art. 14 al. 3 (cautionnement et promesse de cautio | hoch |
| schuldanerkennung | offen | — | - | tief |

## NE — Neuenburg (freies)
- **Erlass:** Arrêté fixant le tarif des émoluments des notaires (RSN 166.31), Stand Etat au 13 mai 2015 (en vigueur depuis le 1er juillet 2012; Art. 14 dans sa teneur selon A du 13 mai 2015, FO 2015 No 20)
- **Quelle:** https://rsn.ne.ch/DATA/program/books/RSN2015/20154/htm/16631.htm
- **Genereller Werttarif:** staffel — Art. 7 (Base de l'émolument) i.V.m. Art. 14 ch. 54 (Vente immobilière)
- **Doppelcheck:** bestätigt

| Geschäftsart | Behandlung | Regel | Artikel | Konfidenz |
|---|---|---|---|---|
| grundstueckkauf | genereller_werttarif | Rahmen 800–10000 | Art. 14 ch. 54 (Vente immobilière) | hoch |
| dienstbarkeit | sondersatz | Rahmen 150–500 | Art. 14 ch. 38 (Servitude), ch. 39 (Usufruit), ch. | hoch |
| schenkung | offen | — | Art. 14 ch. 71 (nur Donation immobilière); sonst A | mittel |
| erbvertrag | sondersatz | Rahmen 150–2000 | Art. 14 ch. 19 (Pacte successoral); ch. 20 | hoch |
| ehevertrag | sondersatz | Rahmen 150–2000 | Art. 14 ch. 15 (Contrat de mariage) | hoch |
| testament | sondersatz | Rahmen 150–2000 | Art. 14 ch. 17 (Testament public) | hoch |
| vorsorgeauftrag | offen | — | Art. 10 (Analogie); kein eigener Tatbestand | tief |
| vollmacht | sondersatz | fix 20 | Art. 14 ch. 1 (Légalisation de signature); ch. 52  | hoch |
| ag_gruendung | sondersatz | 5‰ min 500 max 11800 | Art. 14 ch. 81 lit. A ch. 1 (constitution de la so | hoch |
| gmbh_gruendung | sondersatz | 5‰ min 500 max 11800 | Art. 14 ch. 82 lit. a i.V.m. ch. 81 (par analogie) | hoch |
| kapitalerhoehung | sondersatz | 5‰ min 500 max 11800 | Art. 14 ch. 81 lit. A ch. 2 (augmentation ou dimin | hoch |
| stiftung | sondersatz | Rahmen 150–2000 | Art. 14 ch. 9 (Acte constitutif ou modificatif d'u | hoch |
| buergschaft | sondersatz | 1.5‰ min 250 max 1000 | Art. 14 ch. 73 (Cautionnement) | hoch |
| schuldanerkennung | offen | — | Art. 14 ch. 44 al. 2 (nur in Grundpfand-Akt einges | mittel |

## GE — Genf (freies)
- **Erlass:** Règlement sur les émoluments des notaires (REmNot) (RSG E 6 05.03), Stand État au 30 avril 2015 (in Kraft, nicht aufgehoben)
- **Quelle:** https://silgeneve.ch/legis/program/books/rsg/htm/rsg_e6_05p03.htm
- **Genereller Werttarif:** staffel — Art. 10 al. 1 REmNot
- **Doppelcheck:** Korrekturen übernommen (1)

| Geschäftsart | Behandlung | Regel | Artikel | Konfidenz |
|---|---|---|---|---|
| grundstueckkauf | genereller_werttarif | — | Art. 10 al. 1 REmNot | hoch |
| dienstbarkeit | fix | fix 500 | Art. 17 REmNot | hoch |
| schenkung | genereller_werttarif | — | Art. 10 al. 1 REmNot | mittel |
| erbvertrag | fix | Rahmen 200–2000 | Art. 18 al. 1 (und al. 2) REmNot | hoch |
| ehevertrag | fix | Rahmen 200–2000 | Art. 18 al. 1 REmNot | hoch |
| testament | fix | Rahmen 200–2000 | Art. 18 al. 1 REmNot | hoch |
| vorsorgeauftrag | offen | — | — | tief |
| vollmacht | fix | Rahmen 15–100 | Art. 29 REmNot | mittel |
| ag_gruendung | sondersatz | — | Art. 25 al. 1 et al. 2 REmNot | hoch |
| gmbh_gruendung | sondersatz | — | Art. 25 al. 1 et al. 2 REmNot | hoch |
| kapitalerhoehung | sondersatz | — | Art. 25 al. 2 REmNot | mittel |
| stiftung | sondersatz | — | Art. 25 al. 1 et al. 2 REmNot | mittel |
| buergschaft | sondersatz | Rahmen 100–500 | Art. 26 REmNot | hoch |
| schuldanerkennung | offen | — | — | tief |

## JU — Jura (freies)
- **Erlass:** Décret concernant les émoluments des notaires du 6 décembre 1978 (RSJU 189.61), Stand État au 01.01.2007 (en vigueur); letzte materielle Änderungen: Dekret 22.9.2004 (Art. 9, in Kraft 1.1.2005) und Anpassung Partnerschaftsgesetz (Art. 12, in Kraft 1.1.2007)
- **Quelle:** https://rsju.jura.ch/fr/viewdocument.html?idn=20029&id=37829&download=1
- **Genereller Werttarif:** staffel — Art. 9 al. 1
- **Doppelcheck:** bestätigt

| Geschäftsart | Behandlung | Regel | Artikel | Konfidenz |
|---|---|---|---|---|
| grundstueckkauf | genereller_werttarif | Rahmen 200–15000 | Art. 9 al. 1 | hoch |
| dienstbarkeit | offen | — | Art. 3 i.V.m. Art. 9 / Art. 6 | mittel |
| schenkung | offen | — | Art. 3 / Art. 9 (bei Liegenschaftsschenkung) / Art | mittel |
| erbvertrag | sondersatz | Rahmen 200–2000 | Art. 12 al. 1 | hoch |
| ehevertrag | sondersatz | Rahmen 200–2000 | Art. 12 al. 1 u. 3 | hoch |
| testament | sondersatz | Rahmen 200–2000 | Art. 12 al. 1 | hoch |
| vorsorgeauftrag | offen | — | Art. 3 i.V.m. Art. 6 / Art. 18 | tief |
| vollmacht | fix | — | Art. 18 al. 1 | mittel |
| ag_gruendung | sondersatz | — | Art. 16 al. 1 | hoch |
| gmbh_gruendung | sondersatz | — | Art. 16 al. 1 | hoch |
| kapitalerhoehung | sondersatz | — | Art. 16 al. 2 | hoch |
| stiftung | sondersatz | — | Art. 16 al. 1 | hoch |
| buergschaft | sondersatz | 1‰ min 10 max 200 | Art. 11 al. 1 | hoch |
| schuldanerkennung | offen | — | Art. 3 / Art. 10 (bei Grundpfand) / Art. 6 | tief |

---
**Pflegebedarf (Verfallskandidaten):** kantonale Tarife mit datiertem Stand; bei Tarifrevision nachführen. **Abnahme-Status:** Erstrecherche, doppelt verifiziert — Davids Wort-für-Wort-Abnahme ausstehend.
