// Dossier: bibliothek/register/quellen-register.md
// ─── Fedlex-Verlinkung (verifizierte Anker) ───────────────────────────────
//
// Verifizierte Fedlex-Basis-URLs (Systematische Rechtssammlung, konsolidierte,
// in Kraft stehende Fassung, Sprache de). Kein ?version=-Parameter, damit der
// Link stets die geltende Fassung auflöst.
// SR 220 OR · SR 210 ZGB · SR 272 ZPO · SR 281.1 SchKG · SR 822.11 ArG ·
// SR 312.0 StPO · SR 172.021 VwVG

export const FEDLEX = {
  OR:    'https://www.fedlex.admin.ch/eli/cc/27/317_321_377/de',
  ZGB:   'https://www.fedlex.admin.ch/eli/cc/24/233_245_233/de',
  ZPO:   'https://www.fedlex.admin.ch/eli/cc/2010/262/de',
  SchKG: 'https://www.fedlex.admin.ch/eli/cc/11/529_488_529/de',
  // ArG: Anker art_9/art_12/art_13/art_46 empirisch gegen das konsolidierte
  // Filestore-HTML verifiziert (Konsolidierung 20230901; geprüft 5.6.2026).
  ArG:   'https://www.fedlex.admin.ch/eli/cc/1966/57_57_57/de',
  // VMWG SR 221.213.11 – ELI via Fedlex-SPARQL verifiziert; Anker art_16/17/
  // 19/19a empirisch am Filestore-HTML (Konsolidierung 20251001; 5.6.2026 —
  // diese Notiz war korrekt: die zwischenzeitliche «19a existiert nicht»-
  // Diskrepanz [5./6.6.] beruhte auf dem 20250101-Cache; aufgelöst 7.6.2026,
  // 20251001 liegt als n=0-Datei, jetzt regulär gepinnt).
  VMWG:  'https://www.fedlex.admin.ch/eli/cc/1990/835_835_835/de',
  // StPO SR 312.0 – Anker art_129 empirisch am Filestore-HTML verifiziert
  // (Konsolidierung 20240101; geprüft 5.6.2026, Vollmacht-Vorlage).
  StPO:  'https://www.fedlex.admin.ch/eli/cc/2010/267/de',
  // VwVG SR 172.021 – Anker art_11 empirisch am Filestore-HTML verifiziert
  // (Konsolidierung 20210101; geprüft 5.6.2026, Vollmacht-Vorlage).
  VwVG:  'https://www.fedlex.admin.ch/eli/cc/1969/737_757_755/de',
  // VVG SR 221.229.1 – Anker art_35_a/35_b/35_c sowie art_97/98 empirisch am
  // Filestore-HTML verifiziert (Konsolidierung 20240101 = neuste abrufbare;
  // geprüft 6.6.2026, Kündigungs-Maske 3: 35a halbzwingend [98], 35b/35c
  // absolut zwingend [97], Lebensversicherung ausgenommen [35a Abs. 3]).
  VVG:   'https://www.fedlex.admin.ch/eli/cc/24/719_735_717/de',
  // HRegV SR 221.411 – Anker art_20/24_a/43/44/45/71/72/117 empirisch am
  // Filestore-HTML verifiziert (Konsolidierung 20250101 = neuste abrufbare,
  // 1.7.2025/1.1.2026 existieren nicht; geprüft 6.6.2026, Gründungs-Masken;
  // Dossiers bibliothek/recherche/gesellschaftsgruendung.md + gmbh-/ag-…).
  HRegV: 'https://www.fedlex.admin.ch/eli/cc/2007/686/de',
  // GebV SchKG SR 281.35 — ELI via Fedlex-SPARQL verifiziert; Anker art_16/
  // 20/30/48 etc. empirisch am Filestore-HTML (Konsolidierung 20260101 =
  // neuste, keine künftige Fassung; geprüft 7.6.2026, Betreibungskosten-
  // Rechner; Dossier bibliothek/recherche/gebv-schkg-kostenrechner.md).
  GebVSchKG: 'https://www.fedlex.admin.ch/eli/cc/1996/2937_2937_2937/de',
  // BGG SR 173.110 — Cache gepinnt (fedlex-cache.sh, Konsolidierung 20260401);
  // Anker art_42–art_119 empirisch verifiziert (11.6.2026, BGer-Rechtsweg;
  // Dossier bibliothek/recherche/bgg-beschwerde-engine.md).
  BGG:   'https://www.fedlex.admin.ch/eli/cc/2006/218/de',
  // BGerR SR 173.110.131 — Cache gepinnt 11.6.2026 (Konsolidierung 20260201,
  // Filestore NUR ohne -N-Suffix); Anker art_33/34/35/35_a/36 zeichengenau
  // verifiziert (rechtsmittel-spruchkoerper-kantone.md §3).
  BGerR: 'https://www.fedlex.admin.ch/eli/cc/2006/834/de',
  // KVG SR 832.10 — Cache gepinnt 11.6.2026 (Konsolidierung 20260101 = neuste
  // echte, 202602–202606 nur SPA-Shell; Filestore OHNE -N-Suffix); Anker
  // art_7/62/64_a zeichengenau verifiziert (KVG-Preset Kündigungs-Maske 3;
  // Dossier bibliothek/recherche/kvg-grundversicherung-kuendigung.md).
  KVG:   'https://www.fedlex.admin.ch/eli/cc/1995/1328_1328_1328/de',
  // KVV SR 832.102 — Cache gepinnt 11.6.2026 (Konsolidierung 20260101, OHNE
  // -N-Suffix); Anker art_94/99/100 verifiziert (besondere Versicherungs-
  // formen: Wechsel nur auf Jahresende, Art. 94 Abs. 2 / 100 Abs. 3 KVV,
  // Fassung AS 2024 697).
  KVV:   'https://www.fedlex.admin.ch/eli/cc/1995/3867_3867_3867/de',
  // StGB SR 311.0 — Cache gepinnt (fedlex-cache.sh, Konsolidierung 20260612);
  // Anker art_30/97/98/101/109/333/389 (Antrag/Verjährung) extrahiert. Bisher
  // unerreichbar: Snapshot STGB.json existierte (Vollabdeckung), aber StGB war
  // nicht in FEDLEX → erkenneFedlexGesetz lieferte null. Kollisionsfrei zu StG:
  // Regex `(^|\s)KEY$` matcht «Art. 97 StGB» nur auf StGB (StGB endet nicht auf
  // « StG»). Reiner Screen-Pfad — der PDF-Erlasskatalog (pdf/normLinks.ts) ist
  // unberührt (eigene ERLASSE-Liste), Golden bleibt byte-gleich.
  StGB:  'https://www.fedlex.admin.ch/eli/cc/54/757_781_799/de',
  // StG SR 641.10 (Stempelabgaben) — Cache gepinnt (Konsolidierung 20240101);
  // Anker art_5/6/8 extrahiert. «Art. 8 StG» → 'StG' (nicht 'StGB').
  StG:   'https://www.fedlex.admin.ch/eli/cc/1974/11_11_11/de',
  // GebV-HReg SR 221.411.1 — Cache gepinnt (Konsolidierung 20210101); Anker
  // art_3/4/8 extrahiert (Handelsregister-Gebühren).
  GebVHReg: 'https://www.fedlex.admin.ch/eli/cc/2020/180/de',
  // ── Erweiterung 17.6.2026 (Auftrag David «jedes verwendete Gesetz in seiner
  // Gesamtheit abspeichern»): die übrigen im Produkt zitierten Bundesgesetze.
  // ELI + geltende Konsolidierung via Fedlex-SPARQL (latest dateApplicability
  // ≤ heute) ermittelt, Identität (SR-Nr.) + Pflicht-Anker am Filestore-HTML
  // empirisch verifiziert (§7). Snapshots: scripts/fedlex-cache.sh + normtext.
  // MWSTG SR 641.20 — eli cc/2009/615, Konsolidierung 20250331 (132 Anker).
  MWSTG: 'https://www.fedlex.admin.ch/eli/cc/2009/615/de',
  // URG SR 231.1 — eli cc/1993/1798_1798_1798, Konsolidierung 20250701 (113).
  URG: 'https://www.fedlex.admin.ch/eli/cc/1993/1798_1798_1798/de',
  // BewG (Lex Koller) SR 211.412.41 — eli cc/1984/1148_1148_1148, 20230701 (41).
  BewG: 'https://www.fedlex.admin.ch/eli/cc/1984/1148_1148_1148/de',
  // EOG SR 834.1 — eli cc/1952/1021_1046_1050, Konsolidierung 20260601 (66).
  EOG: 'https://www.fedlex.admin.ch/eli/cc/1952/1021_1046_1050/de',
  // SVG SR 741.01 — eli cc/1959/679_705_685, Konsolidierung 20250401 (159).
  SVG: 'https://www.fedlex.admin.ch/eli/cc/1959/679_705_685/de',
  // DSG (revDSG) SR 235.1 — eli cc/2022/491, Konsolidierung 20250707 (77).
  DSG: 'https://www.fedlex.admin.ch/eli/cc/2022/491/de',
  // BBG SR 412.10 — eli cc/2003/674, Konsolidierung 20250301 (76).
  BBG: 'https://www.fedlex.admin.ch/eli/cc/2003/674/de',
  // GBV (Grundbuchverordnung) SR 211.432.1 — eli cc/2011/667. Neuste mit
  // Filestore-HTML verfügbare Konsolidierung 20240101 (186 Anker); spätere
  // (2026-04-15) sind bei Fedlex nur als SPA-Shell vorhanden — Live-Link bleibt
  // massgeblich (§7/§8), Muster wie VMWG.
  GBV: 'https://www.fedlex.admin.ch/eli/cc/2011/667/de',
  // JStPO (Jugendstrafprozessordnung) SR 312.1 — eli cc/2010/226,
  // Konsolidierung 20250701 (54 Anker); kollisionsfrei zu StPO (endet auf «JStPO»).
  JStPO: 'https://www.fedlex.admin.ch/eli/cc/2010/226/de',
  // ── Volltext-Ausbau 19.6.2026: ELI + geltende Konsolidierung empirisch am
  //    Filestore-HTML verifiziert (n=0, alle Pflicht-Anker vorhanden); SR/Titel
  //    gegen Fedlex-SR-Register gegengeprüft (§7, [[immer-doppelt-verifizieren]]).
  BV:    'https://www.fedlex.admin.ch/eli/cc/1999/404/de', // SR 101, Kons. 20240303
  DBG:   'https://www.fedlex.admin.ch/eli/cc/1991/1184_1184_1184/de', // SR 642.11, Kons. 20260101
  VStG:  'https://www.fedlex.admin.ch/eli/cc/1966/371_385_384/de', // SR 642.21, Kons. 20250101
  KG:    'https://www.fedlex.admin.ch/eli/cc/1996/546_546_546/de', // SR 251, Kons. 20230701
  FusG:  'https://www.fedlex.admin.ch/eli/cc/2004/320/de', // SR 221.301, Kons. 20230101
  MSchG: 'https://www.fedlex.admin.ch/eli/cc/1993/274_274_274/de', // SR 232.11, Kons. 20250701
  UWG:   'https://www.fedlex.admin.ch/eli/cc/1988/223_223_223/de', // SR 241, Kons. 20250101
  PatG:  'https://www.fedlex.admin.ch/eli/cc/1955/871_893_899/de', // SR 232.14, Kons. 20250701
  // ── Volltext-Ausbau Bund 23.6.2026 (Promotion aus nur-live-link-Stubs; ELI/
  //    Konsolidierung via Fedlex-SPARQL geltend-verifiziert, art_1 am Filestore-
  //    HTML bestätigt, §7). ──
  PARTG: 'https://www.fedlex.admin.ch/eli/cc/2005/782/de', // SR 211.231, Kons. 20250101
  JSTG:  'https://www.fedlex.admin.ch/eli/cc/2006/551/de', // SR 311.1, Kons. 20250701
  // Ältere plain-<p><sup>-Markup-Erlasse — entsperrt durch den Extraktor-Fix 23.6.2026.
  IPRG:  'https://www.fedlex.admin.ch/eli/cc/1988/1776_1776_1776/de', // SR 291, Kons. 20260101
  BETMG: 'https://www.fedlex.admin.ch/eli/cc/1952/241_241_245/de', // SR 812.121, Kons. 20230901
  VSTRR: 'https://www.fedlex.admin.ch/eli/cc/1974/1857_1857_1857/de', // SR 313.0, Kons. 20230901
  // Batch 2 (23.6.2026) — klar aktuelle Konsolidierungen (Currency via check:fedlex-versionen).
  ATSG:  'https://www.fedlex.admin.ch/eli/cc/2002/510/de', // SR 830.1, Kons. 20240101
  BVG:   'https://www.fedlex.admin.ch/eli/cc/1983/797_797_797/de', // SR 831.40, Kons. 20250101
  UVG:   'https://www.fedlex.admin.ch/eli/cc/1982/1676_1676_1676/de', // SR 832.20, Kons. 20260101
  AVIG:  'https://www.fedlex.admin.ch/eli/cc/1982/2184_2184_2184/de', // SR 837.0, Kons. 20260101
  RPG:   'https://www.fedlex.admin.ch/eli/cc/1979/1573_1573_1573/de', // SR 700, Kons. 20260401
  USG:   'https://www.fedlex.admin.ch/eli/cc/1984/1122_1122_1122/de', // SR 814.01, Kons. 20260401
  VGG:   'https://www.fedlex.admin.ch/eli/cc/2006/352/de', // SR 173.32, Kons. 20260612
  BGFA:  'https://www.fedlex.admin.ch/eli/cc/2002/153/de', // SR 935.61, Kons. 20250701
  KKG:   'https://www.fedlex.admin.ch/eli/cc/2002/593/de', // SR 221.214.1, Kons. 20230901
  GWG:   'https://www.fedlex.admin.ch/eli/cc/1998/892_892_892/de', // SR 955.0, Kons. 20240301
  // Batch 3 (23.6.2026) — Konsolidierung via check:fedlex-versionen geltend-verifiziert.
  IVG:    'https://www.fedlex.admin.ch/eli/cc/1959/827_857_845/de', // SR 831.20
  FAMZG:  'https://www.fedlex.admin.ch/eli/cc/2008/51/de', // SR 836.2
  STHG:   'https://www.fedlex.admin.ch/eli/cc/1991/1256_1256_1256/de', // SR 642.14
  AIG:    'https://www.fedlex.admin.ch/eli/cc/2007/758/de', // SR 142.20
  ASYLG:  'https://www.fedlex.admin.ch/eli/cc/1999/358/de', // SR 142.31
  GLG:    'https://www.fedlex.admin.ch/eli/cc/1996/1498_1498_1498/de', // SR 151.1
  FINMAG: 'https://www.fedlex.admin.ch/eli/cc/2008/736/de', // SR 956.1
  BGBB:   'https://www.fedlex.admin.ch/eli/cc/1993/1410_1410_1410/de', // SR 211.412.11
  // Batch 4 (23.6.2026) — Konsolidierung via Filestore-HTML-Inhalts-Sonde gepinnt.
  AHVG:   'https://www.fedlex.admin.ch/eli/cc/63/837_843_843/de', // SR 831.10, Kons. 20260101
  BANKG:  'https://www.fedlex.admin.ch/eli/cc/51/117_121_129/de', // SR 952.0, Kons. 20240101
  HMG:    'https://www.fedlex.admin.ch/eli/cc/2001/422/de', // SR 812.21, Kons. 20250101
  // ── Punkt 12 Batch 1 (24.6.2026, Bund-Gesetze aus Davids Anwaltsprüfungs-
  //    Bookmark-Liste, Promotion aus nur-live-link-Stubs). ELI über die
  //    date-geordnete Taxonomie-Abfrage gewählt (Resolver gab für mehrere die
  //    REPEALTE Altfassung — rvog/stbog/desg/finig/wag/pueg), gegen
  //    check:fedlex-versionen (alle aktuell) + Filestore-HTML-Inhalts-Sonde
  //    (art_1 vorhanden) + den Titel der GEPINNTEN ELI doppelt verifiziert (§7).
  BUEG:    'https://www.fedlex.admin.ch/eli/cc/2016/404/de', // SR 141.0, Kons. 20230901
  BGOE:    'https://www.fedlex.admin.ch/eli/cc/2006/355/de', // SR 152.3, Kons. 20231101
  BPR:     'https://www.fedlex.admin.ch/eli/cc/1978/688_688_688/de', // SR 161.1, Kons. 20221023
  VG:      'https://www.fedlex.admin.ch/eli/cc/1958/1413_1483_1489/de', // SR 170.32, Kons. 20250615
  PUBLG:   'https://www.fedlex.admin.ch/eli/cc/2004/745/de', // SR 170.512, Kons. 20230901
  PARLG:   'https://www.fedlex.admin.ch/eli/cc/2003/510/de', // SR 171.10, Kons. 20260302
  RVOG:    'https://www.fedlex.admin.ch/eli/cc/1997/2022_2022_2022/de', // SR 172.010, Kons. 20250501
  BOEB:    'https://www.fedlex.admin.ch/eli/cc/2020/126/de', // SR 172.056.1, Kons. 20260101
  BPG:     'https://www.fedlex.admin.ch/eli/cc/2001/123/de', // SR 172.220.1, Kons. 20240101
  STBOG:   'https://www.fedlex.admin.ch/eli/cc/2010/444/de', // SR 173.71, Kons. 20240101
  DESG:    'https://www.fedlex.admin.ch/eli/cc/2002/226/de', // SR 232.12, Kons. 20250701
  OHG:     'https://www.fedlex.admin.ch/eli/cc/2008/232/de', // SR 312.5, Kons. 20250101
  NHG:     'https://www.fedlex.admin.ch/eli/cc/1966/1637_1694_1679/de', // SR 451, Kons. 20250801
  ENTG:    'https://www.fedlex.admin.ch/eli/cc/47/689_701_723/de', // SR 711, Kons. 20210101
  GSCHG:   'https://www.fedlex.admin.ch/eli/cc/1992/1860_1860_1860/de', // SR 814.20, Kons. 20250801
  ENTSG:   'https://www.fedlex.admin.ch/eli/cc/2003/231/de', // SR 823.20, Kons. 20240101
  ELG:     'https://www.fedlex.admin.ch/eli/cc/2007/804/de', // SR 831.30, Kons. 20260101
  FZG:     'https://www.fedlex.admin.ch/eli/cc/1994/2386_2386_2386/de', // SR 831.42, Kons. 20240101
  WAG:     'https://www.fedlex.admin.ch/eli/cc/1992/2521_2521_2521/de', // SR 921.0, Kons. 20250801
  PUEG:    'https://www.fedlex.admin.ch/eli/cc/1986/895_895_895/de', // SR 942.20, Kons. 20260508
  FIDLEG:  'https://www.fedlex.admin.ch/eli/cc/2019/758/de', // SR 950.1, Kons. 20240301
  KAG:     'https://www.fedlex.admin.ch/eli/cc/2006/822/de', // SR 951.31, Kons. 20240301
  FINIG:   'https://www.fedlex.admin.ch/eli/cc/2018/801/de', // SR 954.1, Kons. 20240301
  FINFRAG: 'https://www.fedlex.admin.ch/eli/cc/2015/853/de', // SR 958.1, Kons. 20240201
  // VAG: ACHTUNG html-Variante 1! Unter cc/2005/734/20240901 liegen ZWEI Erlasse —
  // html-0 = Agrar-Einfuhr-VO (SR 916.01), html-1 = VAG (SR 961.01). Bug-Check
  // 25.6.2026 fing den Fehlgriff (Snapshot trug zunächst die Agrar-VO); Cache-Tor
  // um SR-Identitäts-Sonde gehärtet (fedlex-cache.sh, 6. Feld = erwartete SR).
  VAG:     'https://www.fedlex.admin.ch/eli/cc/2005/734/de', // SR 961.01, Kons. 20240901 (html-1)
  // ── Punkt 12 Batch 2 (24.6.2026, Bund-VERORDNUNGEN, Promotion aus nur-live-
  //    link-Stubs). Geltende Konsolidierung via date-geordnete Taxonomie-Abfrage
  //    (Resolver lieferte für viele die REPEALTE Vorgänger-VO) + Filestore-HTML-
  //    Inhalts-Sonde (art_1 + Artikelzahl == Snapshot) doppelt verifiziert (§7). ──
  AHVV: 'https://www.fedlex.admin.ch/eli/cc/63/1185_1183_1185/de', // SR 831.101, Kons. 20260101
  IVV: 'https://www.fedlex.admin.ch/eli/cc/1961/29_29_29/de', // SR 831.201, Kons. 20250601
  ELV: 'https://www.fedlex.admin.ch/eli/cc/1971/37_37_37/de', // SR 831.301, Kons. 20250101
  'BVV 2': 'https://www.fedlex.admin.ch/eli/cc/1984/543_543_543/de', // SR 831.441.1, Kons. 20250101
  UVV: 'https://www.fedlex.admin.ch/eli/cc/1983/38_38_38/de', // SR 832.202, Kons. 20260101
  AVIV: 'https://www.fedlex.admin.ch/eli/cc/1983/1205_1205_1205/de', // SR 837.02, Kons. 20260101
  ATSV: 'https://www.fedlex.admin.ch/eli/cc/2002/569/de', // SR 830.11, Kons. 20240101
  KLV: 'https://www.fedlex.admin.ch/eli/cc/1995/4964_4964_4964/de', // SR 832.112.31, Kons. 20260511
  MWSTV: 'https://www.fedlex.admin.ch/eli/cc/2009/828/de', // SR 641.201, Kons. 20250101
  VStV: 'https://www.fedlex.admin.ch/eli/cc/1966/1585_1641_1624/de', // SR 642.211, Kons. 20250101
  VZAE: 'https://www.fedlex.admin.ch/eli/cc/2007/759/de', // SR 142.201, Kons. 20260612
  VRV: 'https://www.fedlex.admin.ch/eli/cc/1962/1364_1409_1420/de', // SR 741.11, Kons. 20260401
  VZV: 'https://www.fedlex.admin.ch/eli/cc/1976/2423_2423_2423/de', // SR 741.51, Kons. 20260101
  SSV: 'https://www.fedlex.admin.ch/eli/cc/1979/1961_1961_1961/de', // SR 741.21, Kons. 20250701
  DSV: 'https://www.fedlex.admin.ch/eli/cc/2022/568/de', // SR 235.11, Kons. 20251201
  'ArGV 1': 'https://www.fedlex.admin.ch/eli/cc/2000/243/de', // SR 822.111, Kons. 20240901
  BewV: 'https://www.fedlex.admin.ch/eli/cc/1984/1164_1164_1164/de', // SR 211.412.411, Kons. 20240301
  'BüV': 'https://www.fedlex.admin.ch/eli/cc/2016/405/de', // SR 141.01, Kons. 20190709
  FZV: 'https://www.fedlex.admin.ch/eli/cc/1994/2399_2399_2399/de', // SR 831.425, Kons. 20240301
  KOV: 'https://www.fedlex.admin.ch/eli/cc/27/751_749_771/de', // SR 281.32, Kons. 20210801
  RPV: 'https://www.fedlex.admin.ch/eli/cc/2000/310/de', // SR 700.1, Kons. 20260520
  VFRR: 'https://www.fedlex.admin.ch/eli/cc/1996/2877_2877_2877/de', // SR 281.31, Kons. 20160101
  'VöB': 'https://www.fedlex.admin.ch/eli/cc/2020/127/de', // SR 172.056.11, Kons. 20230901
  VZG: 'https://www.fedlex.admin.ch/eli/cc/36/425_433_469/de', // SR 281.42, Kons. 20120101
  'BVV 3': 'https://www.fedlex.admin.ch/eli/cc/1985/1778_1778_1778/de', // SR 831.461.3, Kons. 20250101
  MVV: 'https://www.fedlex.admin.ch/eli/cc/1993/3080_3080_3080/de', // SR 833.11, Kons. 20260101
  EOV: 'https://www.fedlex.admin.ch/eli/cc/2005/187/de', // SR 834.11, Kons. 20260601
  FamZV: 'https://www.fedlex.admin.ch/eli/cc/2008/52/de', // SR 836.21, Kons. 20250101
  'ArGV 2': 'https://www.fedlex.admin.ch/eli/cc/2000/244/de', // SR 822.112, Kons. 20251201
  'ArGV 3': 'https://www.fedlex.admin.ch/eli/cc/1993/2553_2553_2553/de', // SR 822.113, Kons. 20240901
  'ArGV 4': 'https://www.fedlex.admin.ch/eli/cc/1993/2564_2564_2564/de', // SR 822.114, Kons. 20150501
  VEV: 'https://www.fedlex.admin.ch/eli/cc/2018/493/de', // SR 142.204, Kons. 20260612
  VIntA: 'https://www.fedlex.admin.ch/eli/cc/2018/511/de', // SR 142.205, Kons. 20251201
  'AsylV 1': 'https://www.fedlex.admin.ch/eli/cc/1999/359/de', // SR 142.311, Kons. 20260101
  'AsylV 2': 'https://www.fedlex.admin.ch/eli/cc/1999/360/de', // SR 142.312, Kons. 20220101
  'AsylV 3': 'https://www.fedlex.admin.ch/eli/cc/1999/361/de', // SR 142.314, Kons. 20240601
  GSchV: 'https://www.fedlex.admin.ch/eli/cc/1998/2863_2863_2863/de', // SR 814.201, Kons. 20251201
  LRV: 'https://www.fedlex.admin.ch/eli/cc/1986/208_208_208/de', // SR 814.318.142.1, Kons. 20260101
  LSV: 'https://www.fedlex.admin.ch/eli/cc/1987/338_338_338/de', // SR 814.41, Kons. 20260401
  VVEA: 'https://www.fedlex.admin.ch/eli/cc/2015/891/de', // SR 814.600, Kons. 20260101
  ChemV: 'https://www.fedlex.admin.ch/eli/cc/2015/366/de', // SR 813.11, Kons. 20260424
  NHV: 'https://www.fedlex.admin.ch/eli/cc/1991/249_249_249/de', // SR 451.1, Kons. 20250801
  WaV: 'https://www.fedlex.admin.ch/eli/cc/1992/2538_2538_2538/de', // SR 921.01, Kons. 20250801
  VTS: 'https://www.fedlex.admin.ch/eli/cc/1995/4425_4425_4425/de', // SR 741.41, Kons. 20260430
  BankV: 'https://www.fedlex.admin.ch/eli/cc/2014/273/de', // SR 952.02, Kons. 20250101
  KKV: 'https://www.fedlex.admin.ch/eli/cc/2006/859/de', // SR 951.311, Kons. 20251125
  ERV: 'https://www.fedlex.admin.ch/eli/cc/2012/629/de', // SR 952.03, Kons. 20250124
  FINIV: 'https://www.fedlex.admin.ch/eli/cc/2019/763/de', // SR 954.11, Kons. 20250101
  FinfraV: 'https://www.fedlex.admin.ch/eli/cc/2015/854/de', // SR 958.11, Kons. 20250101
  FIDLEV: 'https://www.fedlex.admin.ch/eli/cc/2019/759/de', // SR 950.11, Kons. 20220101
  AVO: 'https://www.fedlex.admin.ch/eli/cc/2005/735/de', // SR 961.011, Kons. 20260226
  'GwV-FINMA': 'https://www.fedlex.admin.ch/eli/cc/2015/390/de', // SR 955.033.0, Kons. 20230101
  VAM: 'https://www.fedlex.admin.ch/eli/cc/2018/588/de', // SR 812.212.21, Kons. 20260101
  AMBV: 'https://www.fedlex.admin.ch/eli/cc/2018/786/de', // SR 812.212.1, Kons. 20250315
  MepV: 'https://www.fedlex.admin.ch/eli/cc/2020/552/de', // SR 812.213, Kons. 20231101
  EpV: 'https://www.fedlex.admin.ch/eli/cc/2015/298/de', // SR 818.101.1, Kons. 20250101
  BPV: 'https://www.fedlex.admin.ch/eli/cc/2001/319/de', // SR 172.220.111.3, Kons. 20260101
  RVOV: 'https://www.fedlex.admin.ch/eli/cc/1999/170/de', // SR 172.010.1, Kons. 20260301
  VGKE: 'https://www.fedlex.admin.ch/eli/cc/2008/321/de', // SR 173.320.2, Kons. 20100401
  BetmKV: 'https://www.fedlex.admin.ch/eli/cc/2011/362/de', // SR 812.121.1, Kons. 20230123
  QStV: 'https://www.fedlex.admin.ch/eli/cc/2018/274/de', // SR 642.118.2, Kons. 20250110
} as const;

export type FedlexGesetz = keyof typeof FEDLEX;

// Anker '#art_<nummer>'. Buchstaben-Artikel nutzen das Fedlex-Unterstrich-
// Format: 335c → #art_335_c, 334bis → #art_334_bis (empirisch gegen die
// id="art_…"-Anker des konsolidierten Filestore-HTML, Stand 20250101,
// verifiziert – Varianten ohne Unterstrich existieren dort NICHT).
// Spannen-/Folgeverweise (–, f., ff.) verlinken den führenden Artikel.
// Audit 5.6.2026: auch Kombi-Anker Buchstabe+lat. Suffix abgedeckt —
// im OR real: 329gbis/663bbis/697hbis → art_329_g_bis (Form n_b_suffix).
const SUFFIX = /^(\d+)([a-z])?(bis|ter|quater|quinquies)?$/;

export function fedlexUrl(gesetz: FedlexGesetz, artikel: string | number): string {
  const token = String(artikel).toLowerCase().replace(/\s+/g, '')
    .replace(SUFFIX, (_, n, b, suf) => [n, b, suf].filter(Boolean).join('_'));
  return `${FEDLEX[gesetz]}#art_${token}`;
}

// Mehrwort-Gesetzesnamen → Registry-Key. Nötig, weil der generische Matcher
// nur das LETZTE Token vergleicht: «Art. 16 GebV SchKG» endete sonst auf
// «SchKG» und verlinkte Art. 16 der HAUPT-SchKG (SR 281.1) statt der
// Gebührenverordnung (SR 281.35) — Code-Review-Befund #1, 7.6.2026.
// Aliase werden VOR dem Token-Match geprüft.
const MEHRWORT_ALIAS: ReadonlyArray<[string, FedlexGesetz]> = [
  ['GebV SchKG', 'GebVSchKG'],
];

// Erkennt das Gesetz eines Normverweis-Texts ('Art. 16 GebV SchKG' → 'GebVSchKG').
// Aliase werden VOR dem generischen Token-Match geprüft (Mehrwort-Namen, deren
// letztes Token sonst ein anderes Gesetz träfe). Unbekanntes Gesetz → null.
// Reiner Helfer (§5): einzige Quelle der Gesetz-Erkennung; von
// fedlexLinkFuerArtikel UND vom Norm-Snapshot-Resolver (normtext/bundRef)
// wiederverwendet — die Matching-Logik wird nicht dupliziert.
export function erkenneFedlexGesetz(text: string): FedlexGesetz | null {
  const bereinigt = text.trim();
  const alias = MEHRWORT_ALIAS.find(([name]) => bereinigt.endsWith(name));
  return alias?.[1]
    ?? (Object.keys(FEDLEX) as FedlexGesetz[]).find((g) => new RegExp(`(^|\\s)${g}$`).test(bereinigt))
    ?? null;
}

// Direktlink aus einem Normverweis-Text, z. B. 'Art. 335c Abs. 1 OR' →
// OR-Basis + #art_335_c. Absatz-/Ziffer-Angaben ändern den Anker nicht;
// massgeblich ist der führende Artikel.
//
// Fallback (Normentreue, nie auf geratene Anker verlinken):
// - Schlusstitel (SchlT): eigener Nummernkreis, Anker nicht deterministisch →
//   Gesetzes-Seite ohne Anker.
// - Unbekanntes Gesetz → null (kein Link).
export function fedlexLinkFuerArtikel(text: string): string | null {
  const gesetz = erkenneFedlexGesetz(text);
  if (!gesetz) return null;
  if (/\bSchlT\b/.test(text)) return FEDLEX[gesetz];
  // Bug-Check 10.6.2026 (NIEDRIG): Buchstabe UND lat. Suffix kombinierbar
  // (329gbis/663bbis/697hbis) — vorher matchte der Extraktor solche Artikel
  // gar nicht und lieferte die Gesetzes-URL ohne Anker.
  const m = text.match(/^Art\.\s*(\d+[a-z]?(?:bis|ter|quater|quinquies)?)\b/);
  return m ? fedlexUrl(gesetz, m[1]) : FEDLEX[gesetz];
}

// ─── Bund-Normverweise im Fliesstext finden (Inline-Auto-Linker) ───────────
//
// Globale Regex, die «Art. N[suffix] [Abs./lit./Ziff./Satz …] GESETZ»-Zitate in
// einem Anzeigetext findet — Schwester von RECHTSPRECHUNG_IM_TEXT (bge.ts) für
// Normen. Die Gesetzes-Namen kommen aus DIESER Datei (FEDLEX-Keys + Mehrwort-
// Alias), damit die Gesetz-Erkennung nicht dupliziert wird (§5): genau die
// Tokens, die erkenneFedlexGesetz am Zitat-Ende akzeptiert.
//
// Bewusst nur «Art.» (Bund), NICHT «§» — das kantonale «§ N» ist ohne Erlass-
// Kontext mehrdeutig und trifft im Code zahllose Nicht-Normen (CLAUDE.md-§-
// Prinzipien); kantonale Inline-Auflösung läuft über den Quelle-Kontext, nicht
// über einen blinden §-Regex.
//
// Die Passus-Kette (Abs./lit./Bst./Ziff./Satz) zwischen Artikel und Gesetz ist
// auf bekannte Zitat-Tokens beschränkt — so läuft der Match nie über einen
// Satz oder ein zweites «Art.» hinaus. Jeder Treffer wird vor dem Verlinken
// zusätzlich gegen fedlexLinkFuerArtikel validiert (kein toter Link).
const NORM_NAMEN_ESC = (['GebV SchKG', ...Object.keys(FEDLEX)] as string[])
  // Längste zuerst: «GebV SchKG» vor «SchKG», «StGB» vor «StG» (Suffix-Kollision).
  .sort((a, b) => b.length - a.length)
  .map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

export const NORM_IM_TEXT = new RegExp(
  'Art\\.\\s*\\d+[a-z]?(?:bis|ter|quater|quinquies)?' +
    '(?:\\s+(?:Abs\\.|lit\\.|Bst\\.|Ziff\\.|Ziffer|Satz)\\s*(?:\\d+[a-z]?(?:bis|ter|quater|quinquies)?|[a-z]))*' +
    '\\s+(?:' + NORM_NAMEN_ESC.join('|') + ')\\b',
  'g',
);
