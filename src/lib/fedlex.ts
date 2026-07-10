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
  // ── Punkt 12 Batch 3 (25.6.2026): Promotion nur-live-link-Stub → Volltext ──
  SortG: 'https://www.fedlex.admin.ch/eli/cc/1977/862_862_862/de', // SR 232.16, Kons. 20110101
  PRG: 'https://www.fedlex.admin.ch/eli/cc/1993/3152_3152_3152/de', // SR 944.3, Kons. 20210820
  BEG: 'https://www.fedlex.admin.ch/eli/cc/2009/450/de', // SR 957.1, Kons. 20230101
  MStG: 'https://www.fedlex.admin.ch/eli/cc/43/359_375_369/de', // SR 321.0, Kons. 20260608
  MStP: 'https://www.fedlex.admin.ch/eli/cc/1979/1059_1059_1059/de', // SR 322.1, Kons. 20240701
  IRSG: 'https://www.fedlex.admin.ch/eli/cc/1982/846_846_846/de', // SR 351.1, Kons. 20240101
  MVG: 'https://www.fedlex.admin.ch/eli/cc/1993/3043_3043_3043/de', // SR 833.1, Kons. 20240101
  EnG: 'https://www.fedlex.admin.ch/eli/cc/2017/762/de', // SR 730.0, Kons. 20260401
  'CO2-Gesetz': 'https://www.fedlex.admin.ch/eli/cc/2012/855/de', // SR 641.71, Kons. 20250101
  EpG: 'https://www.fedlex.admin.ch/eli/cc/2015/297/de', // SR 818.101, Kons. 20250801
  TxG: 'https://www.fedlex.admin.ch/eli/cc/2007/279/de', // SR 810.21, Kons. 20210201
  LMG: 'https://www.fedlex.admin.ch/eli/cc/2017/62/de', // SR 817.0, Kons. 20241001
  LFG: 'https://www.fedlex.admin.ch/eli/cc/1950/471_491_479/de', // SR 748.0, Kons. 20260101
  EBG: 'https://www.fedlex.admin.ch/eli/cc/1958/335_341_347/de', // SR 742.101, Kons. 20260101
  FMG: 'https://www.fedlex.admin.ch/eli/cc/1997/2187_2187_2187/de', // SR 784.10, Kons. 20260601
  MG: 'https://www.fedlex.admin.ch/eli/cc/1995/4093_4093_4093/de', // SR 510.10, Kons. 20260601
  ZStV: 'https://www.fedlex.admin.ch/eli/cc/2004/362/de', // SR 211.112.2, Kons. 20250601
  THG: 'https://www.fedlex.admin.ch/eli/cc/1996/1725_1725_1725/de', // SR 946.51, Kons. 20230901
  BGBM: 'https://www.fedlex.admin.ch/eli/cc/1996/1738_1738_1738/de', // SR 943.02, Kons. 20250101
  // ── Punkt 12 Batch 3 (25.6.2026): kuratierte zentrale Bundes-VERORDNUNGEN ──
  MSchV: 'https://www.fedlex.admin.ch/eli/cc/1993/296_296_296/de', // SR 232.111, Kons. 20250701
  PatV: 'https://www.fedlex.admin.ch/eli/cc/1977/2027_2027_2027/de', // SR 232.141, Kons. 20250701
  DesV: 'https://www.fedlex.admin.ch/eli/cc/2002/183/de', // SR 232.121, Kons. 20250701
  URV: 'https://www.fedlex.admin.ch/eli/cc/1993/1821_1821_1821/de', // SR 231.11, Kons. 20250701
  TGBV: 'https://www.fedlex.admin.ch/eli/cc/2013/3/de', // SR 211.432.11, Kons. 20240101
  BKV: 'https://www.fedlex.admin.ch/eli/cc/1993/1363_1363_1363/de', // SR 642.118.1, Kons. 20260101
  ZentV: 'https://www.fedlex.admin.ch/eli/cc/2002/29/de', // SR 360.1, Kons. 20230901
  VKKG: 'https://www.fedlex.admin.ch/eli/cc/2002/594/de', // SR 221.214.11, Kons. 20210701
  'ArGV 5': 'https://www.fedlex.admin.ch/eli/cc/2007/692/de', // SR 822.115, Kons. 20240401
  VVK: 'https://www.fedlex.admin.ch/eli/cc/2007/101/de', // SR 832.105, Kons. 20230101
  VKL: 'https://www.fedlex.admin.ch/eli/cc/2002/418/de', // SR 832.104, Kons. 20250601
  VFV: 'https://www.fedlex.admin.ch/eli/cc/1961/419_429_439/de', // SR 831.111, Kons. 20250101
  BBV: 'https://www.fedlex.admin.ch/eli/cc/2003/748/de', // SR 412.101, Kons. 20250301
  BMV: 'https://www.fedlex.admin.ch/eli/cc/2009/423/de', // SR 412.103.1, Kons. 20160823
  'ZEMIS-V': 'https://www.fedlex.admin.ch/eli/cc/2006/303/de', // SR 142.513, Kons. 20260612
  AdoV: 'https://www.fedlex.admin.ch/eli/cc/2011/505/de', // SR 211.221.36, Kons. 20230123
  RDV: 'https://www.fedlex.admin.ch/eli/cc/2012/713/de', // SR 143.5, Kons. 20251101
  ZAV: 'https://www.fedlex.admin.ch/eli/cc/2008/760/de', // SR 364.3, Kons. 20230101
  AkkBV: 'https://www.fedlex.admin.ch/eli/cc/1996/1904_1904_1904/de', // SR 946.512, Kons. 20250101
  'FinfraV-FINMA': 'https://www.fedlex.admin.ch/eli/cc/2015/855/de', // SR 958.111, Kons. 20230201
  'FINMA-GebV': 'https://www.fedlex.admin.ch/eli/cc/2008/749/de', // SR 956.122, Kons. 20240301
  'KKV-FINMA': 'https://www.fedlex.admin.ch/eli/cc/2014/707/de', // SR 951.312, Kons. 20210101
  NBV: 'https://www.fedlex.admin.ch/eli/cc/2004/233/de', // SR 951.131, Kons. 20240701
  PAVO: 'https://www.fedlex.admin.ch/eli/cc/1977/1931_1931_1931/de', // SR 211.222.338, Kons. 20230123
  VGR: 'https://www.fedlex.admin.ch/eli/cc/2008/320/de', // SR 173.320.1, Kons. 20230601
  SKV: 'https://www.fedlex.admin.ch/eli/cc/2007/296/de', // SR 741.013, Kons. 20260101
  VVV: 'https://www.fedlex.admin.ch/eli/cc/1959/1271_1321_1317/de', // SR 741.31, Kons. 20260101
  VIL: 'https://www.fedlex.admin.ch/eli/cc/1994/3050_3050_3050/de', // SR 748.131.1, Kons. 20240101
  FDV: 'https://www.fedlex.admin.ch/eli/cc/2007/166/de', // SR 784.101.1, Kons. 20260301
  FAV: 'https://www.fedlex.admin.ch/eli/cc/2016/24/de', // SR 784.101.2, Kons. 20240815
  UVPV: 'https://www.fedlex.admin.ch/eli/cc/1988/1931_1931_1931/de', // SR 814.011, Kons. 20250101
  ChemRRV: 'https://www.fedlex.admin.ch/eli/cc/2005/478/de', // SR 814.81, Kons. 20260101
  VeVA: 'https://www.fedlex.admin.ch/eli/cc/2005/551/de', // SR 814.610, Kons. 20250801
  VGV: 'https://www.fedlex.admin.ch/eli/cc/2000/299/de', // SR 814.621, Kons. 20220101
  // ── International: Staatsverträge SR 0.* (Volltext-Promotion 25.6.2026) ──
  CISG: 'https://www.fedlex.admin.ch/eli/cc/1991/307_307_307/de', // SR 0.221.211.1
  LUGUE: 'https://www.fedlex.admin.ch/eli/cc/2010/801/de', // SR 0.275.12
  HZUE: 'https://www.fedlex.admin.ch/eli/cc/1994/2809_2809_2809/de', // SR 0.274.131
  HBEWUE: 'https://www.fedlex.admin.ch/eli/cc/1994/2824_2824_2824/de', // SR 0.274.132
  HKUE: 'https://www.fedlex.admin.ch/eli/cc/1983/1694_1694_1694/de', // SR 0.211.230.02
  FZA: 'https://www.fedlex.admin.ch/eli/cc/2002/243/de', // SR 0.142.112.681
  VRK: 'https://www.fedlex.admin.ch/eli/cc/1990/1112_1112_1112/de', // SR 0.111
  UNO_PAKT_II: 'https://www.fedlex.admin.ch/eli/cc/1993/750_750_750/de', // SR 0.103.2
  // ── International P2 (25.6.2026): weitere Staatsverträge SR 0.* ──
  UNO_PAKT_I: 'https://www.fedlex.admin.ch/eli/cc/1993/725_725_725/de', // SR 0.103.1
  KRK: 'https://www.fedlex.admin.ch/eli/cc/1998/2055_2055_2055/de', // SR 0.107
  CEDAW: 'https://www.fedlex.admin.ch/eli/cc/1999/239/de', // SR 0.108
  UNO_ANTIFOLTER: 'https://www.fedlex.admin.ch/eli/cc/1987/1307_1307_1307/de', // SR 0.105
  HEUE: 'https://www.fedlex.admin.ch/eli/cc/2009/381/de', // SR 0.211.232.1
  HAUE: 'https://www.fedlex.admin.ch/eli/cc/2003/99/de', // SR 0.211.221.311
  PVUE: 'https://www.fedlex.admin.ch/eli/cc/1970/620_620_620/de', // SR 0.232.04
  ICAO: 'https://www.fedlex.admin.ch/eli/cc/63/1377_1378_1381/de', // SR 0.748.0
  STAATENLOSE: 'https://www.fedlex.admin.ch/eli/cc/1972/2320_2374_2150/de', // SR 0.142.40
  GFK: 'https://www.fedlex.admin.ch/eli/cc/1955/443_461_469/de', // SR 0.142.30
} as const;

export type FedlexGesetz = keyof typeof FEDLEX;

// Anker '#art_<nummer>'. Buchstaben-Artikel nutzen das Fedlex-Unterstrich-
// Format: 335c → #art_335_c, 334bis → #art_334_bis (empirisch gegen die
// id="art_…"-Anker des konsolidierten Filestore-HTML, Stand 20250101,
// verifiziert – Varianten ohne Unterstrich existieren dort NICHT).
// Spannen-/Folgeverweise (–, f., ff.) verlinken den führenden Artikel.
// Audit 5.6.2026: auch Kombi-Anker Buchstabe+lat. Suffix abgedeckt —
// im OR real: 329gbis/663bbis/697hbis → art_329_g_bis (Form n_b_suffix).
const SUFFIX = /^(\d+)([a-z])?(bis|ter|quater|quinquies|sexies)?$/;

// Artikelnummer → Fedlex-Anker-Token («335c»→«335_c», «334bis»→«334_bis»,
// «49abis»→«49_a_bis», «329gbis»→«329_g_bis»). EINE Ableitung (§5), von fedlexUrl
// UND der Fremdgesetz-Aufzählungs-Verlinkung (fremdRoutingFormB) genutzt — die
// Buchstabe+«bis»-Zerlegung wird nicht dupliziert (die bekannte \b-Backtracking-
// Falle «[a-z]? frisst das b von bis» ist hier über die SUFFIX-Alternation gebannt).
export function artikelToken(nummer: string | number): string {
  return String(nummer).toLowerCase().replace(/\s+/g, '')
    .replace(SUFFIX, (_, n, b, suf) => [n, b, suf].filter(Boolean).join('_'));
}

export function fedlexUrl(gesetz: FedlexGesetz, artikel: string | number): string {
  return `${FEDLEX[gesetz]}#art_${artikelToken(artikel)}`;
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
    ?? (Object.keys(FEDLEX) as FedlexGesetz[]).find((g) => new RegExp(`(^|\\s)${g.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`).test(bereinigt))
    ?? null;
}

// ─── Kuratierte Genitiv-Namen → Fedlex-Kürzel (A10/A11, David 5.7.2026) ──────
//
// Präambeln/Ingresse UND Fliesstext nennen Fremdgesetze oft mit AUSGESCHRIEBENEM
// Namen OHNE Klammer-Kürzel («gestützt auf Artikel 130 der Bundesverfassung»;
// «nach den Artikeln 4 und 5 des Strafgesetzbuches»). N2b erkennt nur die
// «(KÜRZEL)»-Form; diese DETERMINISTISCHE, kuratierte Genitiv-Map ergänzt die
// ausgeschriebene Kurztitel-Form. §1-Grenze: NUR eindeutige amtliche Kurztitel-
// Genitive — generische Wendungen («des Bundesgesetzes über …», «der Verordnung»)
// bleiben bewusst OHNE Eintrag (⇒ Link-Unterdrückung, nie ein geratenes Ziel).
// Jeder Eintrag ist gegen den amtlichen Kurztitel des Ziel-Erlasses (struktur-
// Sidecar `kopf.titel`) belegt (Verifikation 2026-07-10, §7).
const GENITIV_GESETZ: ReadonlyArray<readonly [string, FedlexGesetz]> = [
  ['Bundesverfassung', 'BV'],
  ['Strafgesetzbuches', 'StGB'], ['Strafgesetzbuchs', 'StGB'],
  ['Militärstrafgesetzes', 'MStG'],
  ['Zivilgesetzbuches', 'ZGB'], ['Zivilgesetzbuchs', 'ZGB'],
  ['Obligationenrechts', 'OR'],
  ['Strafprozessordnung', 'StPO'],
  ['Zivilprozessordnung', 'ZPO'],
  ['Bundesgerichtsgesetzes', 'BGG'],
  ['Verwaltungsgerichtsgesetzes', 'VGG'],
  ['Umweltschutzgesetzes', 'USG'],
  ['Gewässerschutzgesetzes', 'GSCHG'],
  ['Asylgesetzes', 'ASYLG'],
  ['Strassenverkehrsgesetzes', 'SVG'],
  ['Arbeitsgesetzes', 'ArG'],
  ['Datenschutzgesetzes', 'DSG'],
  ['Berufsbildungsgesetzes', 'BBG'],
  ['Versicherungsvertragsgesetzes', 'VVG'],
  ['Freizügigkeitsgesetzes', 'FZG'],
  ['Lebensmittelgesetzes', 'LMG'],
  ['Fusionsgesetzes', 'FusG'],
  ['Bundespersonalgesetzes', 'BPG'],
  ['Unfallversicherungsgesetzes', 'UVG'],
  ['Mehrwertsteuergesetzes', 'MWSTG'],
  ['Kartellgesetzes', 'KG'],
];
const GENITIV_BY_NAME = new Map<string, FedlexGesetz>(GENITIV_GESETZ);
// Für die Regex-Alternation: längste zuerst (kein Präfix frisst einen längeren
// Namen), escaped. Fedlex-HTML trägt in langen Wörtern SOFT HYPHENS (U+00AD,
// z. B. «Zivilgesetz­bu­ches») — zwischen den Buchstaben wird darum
// optional ­ toleriert (reine Anzeige-Trennstelle, kein Inhalt).
const GENITIV_NAMEN_ESC = [...GENITIV_GESETZ]
  .map(([n]) => n)
  .sort((a, b) => b.length - a.length)
  .map((n) => n.split('').map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('­?'));

/** Kuratierter ausgeschriebener Genitiv-Name → Fedlex-Kürzel (exakter Treffer;
 *  Soft-Hyphens U+00AD werden vor dem Lookup entfernt — reine Trennstellen). */
export function erkenneGenitivGesetz(name: string): FedlexGesetz | null {
  return GENITIV_BY_NAME.get(name.replace(/­/g, '').trim()) ?? null;
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
  const m = text.match(/^Art\.\s*(\d+[a-z]?(?:bis|ter|quater|quinquies|sexies)?)\b/);
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
  'Art\\.\\s*\\d+[a-z]?(?:bis|ter|quater|quinquies|sexies)?' +
    '(?:\\s+(?:Abs\\.|lit\\.|Bst\\.|Ziff\\.|Ziffer|Satz)\\s*(?:\\d+[a-z]?(?:bis|ter|quater|quinquies|sexies)?|[a-z]))*' +
    '\\s+(?:' + NORM_NAMEN_ESC.join('|') + ')\\b',
  'g',
);

// ─── N2 (Bündel N): Fremdgesetz-Erkennung nach einem bare «Artikel N» ────────
//
// Der Inline-Auto-Linker (NormText.restMitIntern) macht ein bare «Artikel N» zum
// Sprung-Link auf DEN AKTUELLEN Erlass. Nennt der Verweis aber ein anderes Gesetz
// («Artikel 1a Absatz 1 Buchstabe c AHVG» in der AHVV → AHVG, nicht AHVV), wäre
// der Self-Link falsch (§1). NORM_IM_TEXT erfasst nur die ABGEKÜRZTE Zitatform
// («Art. N Abs. X GESETZ»); die AUSGESCHRIEBENE Form («Artikel N Absatz X …
// GESETZ», 727 Fälle im Bund-Korpus) fällt durch. Dieser Erkenner deckt beide
// Schreibweisen ab und liefert das erkannte Fremdgesetz-Kürzel — deterministisch
// aus DERSELBEN FEDLEX-Kürzelliste (§5), kein Raten: das Kürzel IST das genannte
// Ziel. Verbraucher (restMitIntern) unterdrückt bei Treffer ≠ eigenem Erlass den
// falschen Self-Link (David-Entscheid 28.6.: «lieber kein Link als ein falscher»;
// das genaue Fremdgesetz-Routing bleibt eine eigene, verifizierte Datenaufgabe).
//
// Bounded: die Passus-Kette akzeptiert nur bekannte Zitat-Tokens + Werte (Zahl/
// Buchstabe/Bereich), läuft also NIE über Fliesstext oder ein zweites «Artikel»
// hinaus — «Artikel 6 Absatz 2 und die Bestimmungen des OR» matcht NICHT (nach
// «Absatz 2» folgt «und …», kein Gesetz-Kürzel) und bleibt ein Self-Link.
// Artikelnummer im Fliesstext. Suffix-Alternation ZUERST (bis|ter|…) VOR dem
// blossen Buchstaben — sonst frisst das greedy `[a-z]?` in einem UNGEANKERTEN
// Scan (matchAll) das «b» von «bis» und «266bis» zerfällt zu «266b» (die \b-
// Backtracking-Falle; ein `(?![0-9a-z])`-Anker wie in ART_INTERN würde sie zwar
// heilen, die alternationsbasierte Form ist aber auch ohne Anker korrekt und wird
// hier global gescannt).
const N2_ARTNR = '\\d+(?:bis|ter|quater|quinquies|sexies|[a-z](?:bis|ter|quater|quinquies|sexies)?)?';
const N2_PASSUS = '(?:Abs(?:atz|ätze|\\.)|Buchstaben?|Bst\\.|lit\\.|Ziff(?:ern?|\\.)|Satz|Sätze)';
const N2_WERT = '(?:' + N2_ARTNR + '|[a-z]|[ivxl]+)';
const N2_KONN = '(?:[–-]|und|oder|bis|,|sowie)';
const FREMDGESETZ_NACH_ARTIKEL = new RegExp(
  '^\\s+' +
    // weitere Artikelnummern im selben Verweis («1a oder 2 …», «25–31 …»)
    '(?:' + N2_KONN + '\\s*' + N2_ARTNR + '\\s*)*' +
    // Passus-Kette (Absatz/Buchstabe/Ziffer/Satz, aus- oder abgeschrieben) + Werte
    '(?:' + N2_PASSUS + '\\s+' + N2_WERT + '(?:\\s*' + N2_KONN + '\\s*' + N2_WERT + ')*\\s+)*' +
    // optionale Präposition vor dem Gesetzesnamen («des IVG», «der ZPO»)
    '(?:(?:des|der|über|vom)\\s+)?' +
    '(' + NORM_NAMEN_ESC.join('|') + ')\\b',
);

/**
 * Prüft, ob der Text UNMITTELBAR nach einem bare «Artikel N» eine Zitat-
 * Fortsetzung ist, die auf ein benanntes Bundesgesetz-Kürzel endet (aus- oder
 * abgeschrieben). Gibt das Kürzel zurück (Verweis auf JENES Gesetz) oder null.
 */
export function fremdgesetzNachArtikel(restNachArtikel: string): FedlexGesetz | null {
  const m = FREMDGESETZ_NACH_ARTIKEL.exec(restNachArtikel);
  return m ? erkenneFedlexGesetz(m[1]) : null;
}

// ─── N2b (Bündel N): AUSGESCHRIEBENER Fremdgesetz-Name mit Klammer-Kürzel ─────
//
// PROBLEM (Bug David 4.7.2026, AIG Art. 5 Abs. 1 lit. d): «… nach Artikel 66a
// oder 66abis des Strafgesetzbuchs (StGB) oder Artikel 49a oder 49abis des
// Militärstrafgesetzes vom 13. Juni 1927 (MStG) …». fremdgesetzNachArtikel (N2)
// erkennt das Fremdgesetz nur am KÜRZEL aus der NORM_NAMEN-Liste («… Buchstabe c
// AHVG»), NICHT an der ausgeschriebenen Genitiv-Form mit Klammer-Kürzel. Folge:
// «Artikel 49a» fiel auf den Self-Linker zurück und verlinkte ZUFÄLLIG AIG art_49_a
// (existiert), «Artikel 66a» blieb link-los (AIG hat kein art_66_a), die
// Aufzählungs-Glieder «66abis»/«49abis» nie verlinkt.
//
// FIX: Das DETERMINISTISCHE Signal ist das Klammer-Kürzel «(KÜRZEL)» mit
// KÜRZEL ∈ FEDLEX, unmittelbar hinter dem ausgeschriebenen Gesetzesnamen (Datums-
// Einschub «vom 13. Juni 1927» toleriert). KEIN Fuzzy-Matching ausgeschriebener
// Namen OHNE Klammer-Kürzel (§1: lieber kein Link als ein plausibel-falscher) —
// das Kürzel in der Klammer IST das genannte Ziel, kein Raten. Erkannt wird die
// GANZE «Artikel N [oder M …] des <Name> (KÜRZEL)»-Einheit; jede Artikelnummer
// (auch die Aufzählungs-Glieder) wird EINZELN auf das Fremdgesetz geroutet — analog
// zur Ketten-Propagierung (normVerweiseImText).
//
// Bewusste Grenze: die ABGEKÜRZTE Genitiv-Form OHNE Klammer («… des IVG») bleibt
// die Domäne von fremdgesetzNachArtikel (N2, Unterdrückung des Self-Links) — hier
// unverändert. N2b greift nur additiv bei vorhandenem Klammer-Kürzel.

// Ein Wort des ausgeschriebenen Gesetzesnamens: grossgeschriebenes Wort, Datums-
// Zahl («13.», «1927») oder amtliche Namens-Bindewörter (kleingeschrieben, aber
// Teil offizieller Titel: «über», «vom», «für» …). Der Name muss mit einem GROSS-
// geschriebenen Wort BEGINNEN und wird zwingend vom «(KÜRZEL)» abgeschlossen —
// ohne diese Klammer matcht die Einheit NICHT (deterministischer Anker).
const N2_NAME_WORT = '(?:[A-ZÄÖÜ][A-Za-zÄÖÜäöüß.\\-]*|\\d{1,4}\\.?|vom|von|über|und|der|die|das|des|für|zur|zum|im|in|zu|den|betreffend)';
const N2_NAME_RUN = '[A-ZÄÖÜ][A-Za-zÄÖÜäöüß.\\-]*(?:\\s+' + N2_NAME_WORT + '){0,14}';
const FREMD_FORM_B = new RegExp(
  '^(\\s*)' +
    // 2: Aufzählungs-Schwanz (weitere Artikelnummern «oder 66abis», «25–31»)
    '((?:' + N2_KONN + '\\s*' + N2_ARTNR + '\\s*)*)' +
    // Passus-Kette (Absatz/Buchstabe/Ziffer/Satz) — Werte werden NICHT verlinkt
    '(?:' + N2_PASSUS + '\\s+' + N2_WERT + '(?:\\s*' + N2_KONN + '\\s*' + N2_WERT + ')*\\s+)*' +
    // Präposition + Gesetzes-Signal, zwei Formen:
    '(?:des|der|über|vom)\\s+(?:' +
      // 3: ausgeschriebener Name + Klammer-Kürzel (∈ FEDLEX) — die Klammer ist
      //    das autoritative Signal (auch ein UNBEKANNTES «(Code civil)» bindet
      //    hier und unterdrückt jeden Link, §1).
      N2_NAME_RUN + '\\s*\\((' + NORM_NAMEN_ESC.join('|') + ')\\)' +
      // 4: kuratierter Genitiv-Kurztitel OHNE Klammer («der Bundesverfassung»);
      //    greift NUR, wenn KEINE Klammer folgt (sonst gilt die Klammer, s. o.).
      '|(' + GENITIV_NAMEN_ESC.join('|') + ')\\b(?!\\s*\\()' +
    ')',
);
const N2_ARTNR_RE = new RegExp(N2_ARTNR, 'g');

/** Ein auf ein Fremdgesetz geroutetes Aufzählungs-Glied. */
export interface FremdRoutingGlied {
  /** true = erstes Glied; Anzeige = «Artikel N» aus dem Aufrufer-Kontext (m[0]),
   *  Offsets sind dann −1 (nicht im `rest`-Text). */
  erst: boolean;
  /** rohe Artikelnummer («66a», «66abis») — Anzeige der Aufzählungs-Glieder. */
  roh: string;
  /** Start-/End-Offset im `rest`-Text (erst: −1). */
  start: number;
  end: number;
  /** Auflösbarer Verweis-Text mit Kürzel, z. B. «Art. 66abis StGB». */
  artikel: string;
  /** false ⇒ als reiner Text darstellen (Ziel-Token existiert nicht → kein Link). */
  linkbar: boolean;
}

/**
 * Erkennt UNMITTELBAR nach einem bare «Artikel N» die ausgeschriebene Fremdgesetz-
 * Form mit Klammer-Kürzel und routet JEDE genannte Artikelnummer (die erste +
 * alle Aufzählungs-Glieder) auf das Fremdgesetz. Rein deterministisch (§2): das
 * Kürzel stammt aus der FEDLEX-Liste, die Token-Ableitung aus artikelToken.
 *
 * @param rest        Text NACH «Artikel N» (beginnt i. d. R. mit Whitespace).
 * @param ersteNummer die Nummer des vorangehenden «Artikel N» (m[1]), z. B. «66a».
 * @param zielTokenExistiert optionales Prädikat: existiert das Ziel-Token im
 *        Fremd-Erlass? Fehlt es (false), wird das Glied NICHT verlinkt (§1, nie
 *        raten). Ohne Prädikat linken alle erkannten Glieder (Fedlex-Deep-Link /
 *        In-Reader-Popover über NormChip — die etablierte Fremdverweis-Darstellung).
 * @returns {gesetz, glieder, regionEnd} oder null (kein Klammer-Kürzel-Signal).
 *          `regionEnd` = Offset in `rest` hinter dem «(KÜRZEL)» (Aufrufer setzt
 *          den Cursor hinter die ganze Einheit).
 */
export function fremdRoutingFormB(
  rest: string,
  ersteNummer: string,
  zielTokenExistiert?: (gesetz: FedlexGesetz, token: string) => boolean,
): { gesetz: FedlexGesetz; glieder: FremdRoutingGlied[]; regionEnd: number } | null {
  const m = FREMD_FORM_B.exec(rest);
  if (!m) return null;
  // m[3] = Klammer-Kürzel (∈ FEDLEX), m[4] = kuratierter Genitiv-Kurztitel.
  const gesetz = m[3] ? erkenneFedlexGesetz(m[3]) : m[4] ? erkenneGenitivGesetz(m[4]) : null;
  if (!gesetz) return null; // Kein auflösbares Signal → kein Link (§1)
  const linkbar = (roh: string): boolean =>
    zielTokenExistiert ? zielTokenExistiert(gesetz, artikelToken(roh)) : true;
  const gliedFuer = (erst: boolean, roh: string, start: number, end: number): FremdRoutingGlied => ({
    erst, roh, start, end, artikel: `Art. ${roh} ${gesetz}`, linkbar: linkbar(roh),
  });
  const glieder: FremdRoutingGlied[] = [gliedFuer(true, ersteNummer, -1, -1)];
  // Aufzählungs-Glieder aus dem Schwanz (Gruppe 2) — mit Offset im `rest`-Text.
  const schwanz = m[2];
  const schwanzStart = m[1].length; // führender Whitespace (Gruppe 1)
  for (const am of schwanz.matchAll(N2_ARTNR_RE)) {
    const start = schwanzStart + am.index;
    glieder.push(gliedFuer(false, am[0], start, start + am[0].length));
  }
  return { gesetz, glieder, regionEnd: m[0].length };
}

// ─── Ketten-Verweise: «Art. A i.V.m. Art. B GESETZ» ──────────────────────────
//
// PROBLEM (Referenz BGE 151 III 377, Auftrag David 3.7.2026): In einer
// Verweis-Kette trägt nur das LETZTE Glied das Gesetzeskürzel («Art. 684 i.V.m.
// Art. 679 ZGB»). NORM_IM_TEXT findet nur dieses letzte, voll zitierte Glied;
// die vorangehenden bare «Art. N» blieben unverlinkt, obwohl sie DASSELBE
// Gesetz meinen (juristische Drafting-Konvention: das Kürzel am Ketten-Ende gilt
// für alle Glieder).
//
// FIX: Das Kürzel des Ketten-Endes wird auf die vorangehenden bare Glieder
// PROPAGIERT und jedes Glied einzeln verlinkt. §1-Vorsicht (lieber ein Glied
// unverlinkt als falsch verlinkt):
//   · Propagiert wird NUR über echte Ketten-Konnektoren (i.V.m. / in Verbindung
//     mit / und / sowie / Komma) und nur auf BARE «Art. N»-Glieder OHNE eigenes
//     Kürzel. Trägt ein Glied ein EIGENES Kürzel («Art. 5 OR und Art. 6 ZGB»),
//     ist es ein separates Zitat und wird NICHT umgehängt.
//   · Die Kette bricht an allem, was kein Konnektor+Glied ist: Semikolon,
//     BGE-/Urteil-Zitate, Satzgrenzen, Präpositionen («der Verordnung»),
//     fremdes Kürzel dazwischen.
//   · «f./ff.» und Abs./lit./Ziff.-Zusätze brechen die Kette NICHT (Teil des
//     Glieds).
// Die Anzeige bleibt zeichenidentisch (§1): das Glied zeigt genau seinen
// Quelltext, nur das AUFLÖSUNGS-Ziel erhält das propagierte Kürzel.

/** Ein aufgelöster Norm-Verweis im Fliesstext (Anker ODER propagiertes Ketten-Glied). */
export interface NormVerweisSpan {
  /** Start-Offset im Quelltext. */
  start: number;
  /** End-Offset im Quelltext (exklusiv). */
  end: number;
  /** Anzeigetext = exakter Quelltext-Ausschnitt (zeichenidentisch, §1). */
  anzeige: string;
  /** Auflösbarer Verweis-Text (mit Kürzel), z. B. 'Art. 684 ZGB' — Ziel der Auflösung. */
  artikel: string;
  /** true = Kürzel aus dem Ketten-Ende propagiert (nicht im Quelltext des Glieds). */
  propagiert: boolean;
}

// Ketten-Glied (bare «Art. N [Abs./lit./Ziff./Satz …] [f./ff.]») OHNE Kürzel.
const KETTE_ART = 'Art\\.\\s*\\d+[a-z]?(?:bis|ter|quater|quinquies|sexies)?';
const KETTE_PASSUS =
  '(?:\\s+(?:Abs\\.|lit\\.|Bst\\.|Ziff\\.|Ziffer|Satz)\\s*(?:\\d+[a-z]?(?:bis|ter|quater|quinquies|sexies)?|[a-z]))*';
const KETTE_FOLGE = '(?:\\s+ff?\\.)?';
const KETTE_GLIED = `${KETTE_ART}${KETTE_PASSUS}${KETTE_FOLGE}`;
// Ketten-Konnektoren (NICHT Semikolon — der bricht die Kette bewusst).
const KETTE_KONNEKTOR = '(?:i\\.\\s?V\\.\\s?m\\.|in Verbindung mit|und|sowie|,)';
// Ein bare Glied UNMITTELBAR vor dem Anker: «GLIED <KONNEKTOR>» am Text-Ende.
const GLIED_VOR_KONNEKTOR = new RegExp(`(${KETTE_GLIED})\\s*(?:${KETTE_KONNEKTOR})\\s*$`);

/**
 * Alle auflösbaren Bund-Norm-Verweise eines Fliesstexts — die von NORM_IM_TEXT
 * gefundenen voll zitierten Anker PLUS die per Ketten-Regel propagierten bare
 * Glieder. Reine, deterministische Funktion (§2): EINE Wahrheit der Ketten-Regel
 * für Renderer (NormText) und Fundstellen-Suche (Rechtsprechung).
 *
 * Die zurückgegebenen Spans sind nach `start` sortiert und überschneidungsfrei.
 * Für Nicht-Ketten-Text ist die Anker-Menge identisch zu `matchAll(NORM_IM_TEXT)`
 * (gleicher Filter `fedlexLinkFuerArtikel != null`) — additiv, kein Verhalt-Bruch.
 */
export function normVerweiseImText(text: string): NormVerweisSpan[] {
  const spans: NormVerweisSpan[] = [];
  for (const m of text.matchAll(NORM_IM_TEXT)) {
    const roh = m[0];
    // Nur verlinken, was der eine Resolver wirklich auflöst (kein toter Link, §8).
    if (fedlexLinkFuerArtikel(roh) == null) continue;
    const start = m.index;
    spans.push({ start, end: start + roh.length, anzeige: roh, artikel: roh, propagiert: false });
    // Kürzel des Anker-Endes → auf vorangehende bare Glieder propagieren.
    const kuerzel = erkenneFedlexGesetz(roh);
    if (!kuerzel) continue;
    let grenze = start;
    for (;;) {
      const mm = GLIED_VOR_KONNEKTOR.exec(text.slice(0, grenze));
      if (!mm) break;
      const gliedStart = mm.index;
      const gliedText = mm[1];
      // Synthese: Glied-Text + propagiertes Kürzel = auflösbarer Verweis. Die
      // Anzeige bleibt der reine Glied-Text (zeichenidentisch, §1).
      spans.push({
        start: gliedStart,
        end: gliedStart + gliedText.length,
        anzeige: gliedText,
        artikel: `${gliedText} ${kuerzel}`,
        propagiert: true,
      });
      grenze = gliedStart;
    }
  }
  // Sortieren + defensiv überschneidungsfrei halten (Anker/Glieder aus mehreren
  // matchAll-Runden). Bei einer (theoretischen) Überschneidung gewinnt der frühere
  // Span; überlappende werden verworfen — nie doppelt oder verschachtelt verlinken.
  spans.sort((a, b) => a.start - b.start || b.end - a.end);
  const rein: NormVerweisSpan[] = [];
  let letztesEnde = -1;
  for (const s of spans) {
    if (s.start < letztesEnde) continue;
    rein.push(s);
    letztesEnde = s.end;
  }
  return rein;
}

// ─── A10 (Bug David 5.7.2026, MWSTG Art. 5): PLURAL-Aufzählung «in den Artikeln
//     N, M … und K» ────────────────────────────────────────────────────────────
//
// PROBLEM: MWSTG art_5 = «… die Anpassung der in den Artikeln 31 Absatz 2
// Buchstabe c, 35 Absatz 1bis Buchstabe b, 37 Absatz 1, 38 Absatz 1 und 45 Absatz
// 2 Buchstabe b genannten Frankenbeträge …». Der bare Inline-Linker matcht nur das
// SINGULAR «Artikel N» (ART_INTERN) — die Dativ-Plural-Form «Artikeln» + die
// Aufzählungsglieder blieben allesamt link-los (0 Links, obwohl alle 5 Ziele
// Self-Artikel sind).
//
// FIX: Diese reine, deterministische Funktion (§2) erkennt die Plural-Öffner
// «Artikeln» / «die|der Artikel» und zerlegt die anschliessende Aufzählung in ihre
// einzelnen Artikel-Glieder. Sie löst NICHT selbst auf (das braucht den Erlass-
// Kontext), sondern liefert je Region:
//   · `glieder`  — die einzelnen Artikelnummern mit Offset (Anzeige = Quelltext);
//   · `fremd`    — endet die Aufzählung auf ein auflösbares Gesetz-Signal
//                  («… des StGB», «… (ZGB)», «… der Bundesverfassung»), zeigen ALLE
//                  Glieder auf JENES Gesetz;
//   · `unterdruecken` — endet sie auf einen NICHT auflösbaren Fremdnamen
//                  («… des Bundesgesetzes über …»), wird NICHT verlinkt (§1, nie
//                  ein geratener Self-Link auf ein fremdes Gesetz);
//   · sonst (kein Gesetz-Signal, «… genannten Frankenbeträge») ⇒ Self (der Aufrufer
//     verlinkt jedes Glied, dessen Token im eigenen Erlass existiert).
//
// §1-Vorsicht (bounded, nie über den Fliesstext hinaus): ein Glied-Kopf ist nur
// eine Zahl, die am Aufzählungs-Anfang steht ODER einem Konnektor folgt; die
// Passus-Kette konsumiert typ-treue Werte (Buchstabe→Buchstaben, Absatz/Ziffer/
// Satz→Zahlen) und gibt eine Zahl frei, sobald ihr ein Passus-Wort folgt (= nächster
// Glied-Kopf). Die Kette bricht an allem, was kein «Konnektor + Zahl» ist.

/** Ein Glied einer Plural-Aufzählung (Offsets in den übergebenen Gesamttext). */
export interface PluralGlied {
  /** rohe Artikelnummer («31», «45», «66abis»). */
  roh: string;
  start: number;
  end: number;
}

/** Eine erkannte «Artikeln …»-Region mit Auflösungs-Modus. */
export interface PluralRegion {
  /** Start-Offset des ÖFFNERS («Artikeln» / «die Artikel») — für Überlapp-Schutz
   *  gegen den Singular-Linker (ART_INTERN matcht «Artikel 22» im Öffner). */
  oeffnerStart: number;
  /** Start-Offset des ersten Glieds im Gesamttext. */
  start: number;
  /** End-Offset der ganzen Einheit (hinter dem Gesetz-Signal, falls vorhanden). */
  end: number;
  glieder: PluralGlied[];
  /** Aufgelöstes Fremdgesetz (alle Glieder zeigen dorthin) oder null (Self/Unterdr.). */
  fremd: FedlexGesetz | null;
  /** true ⇒ NICHT verlinken (unauflösbarer Fremdname am Ende, §1). */
  unterdruecken: boolean;
}

// Öffner: die unzweideutige Dativ-Plural-Form «Artikeln» (immer), sowie «die|der
// Artikel» (nur wenn ≥2 Glieder ODER ein Gesetz-Signal folgen — sonst überlässt
// die Region das einzelne «Artikel N» dem bewährten Singular-Pfad).
const PLURAL_OEFFNER = /\b(Artikeln|(?:die|der)\s+Artikel)\s+(?=\d)/g;
// Glied-Nummer mit Wort-Ende-Anker: ein Suffix ausserhalb der bekannten Liste
// («42octies») darf NICHT als «42o» an-gematcht werden — dann lieber gar kein
// Glied (die Region wird unten §1-unterdrückt), nie ein falsches Ziel.
const P_ARTNR_RE = /^\d+(?:bis|ter|quater|quinquies|sexies|[a-z](?:bis|ter|quater|quinquies|sexies)?)?(?![0-9a-zäöü])/;
// Passus-Schlüsselwörter, getrennt nach Wert-Typ (Zahl vs. Buchstabe) UND nach
// Numerus: die SINGULAR-Form («Absatz 2») nimmt nach amtlicher Drafting-Konvention
// genau EINEN Wert — eine folgende Zahl ist der nächste Glied-Kopf («… 31 Absatz 2,
// 34 und 114 der Bundesverfassung» = Artikel 34/114, nicht Absätze). Nur die
// PLURAL-Form («Absätze 1 und 2») und die numerus-ambigen Abkürzungen (Abs./Ziff.)
// nehmen eine Wertliste — dort schützt der (?!\s+KW)-Guard den nächsten Glied-Kopf.
const P_KW_NUM_SG = '(?:Absatz|Ziffer|Satz)';
const P_KW_NUM_PL = '(?:Absätze|Ziffern|Sätze|Abs\\.|Ziff\\.)';
const P_KW_LET_SG = '(?:Buchstabe)';
const P_KW_LET_PL = '(?:Buchstaben|Bst\\.|lit\\.)';
const P_KW_ANY = '(?:Abs(?:atz|ätze|\\.)|Ziff(?:ern?|\\.)|Sätze|Satz|Buchstaben?|Bst\\.|lit\\.)';
// Werte MIT Wort-Ende-Anker: ohne ihn degradiert «38» im Backtracking zu «3»
// (der (?!\s+KW)-Guard weist «38 Absatz» ab, die Engine kürzt dann den \d+-Match) —
// ein voll geankertes «38» kann nicht partiell matchen, der Guard bricht sauber ab.
const P_NUM = '\\d+(?:bis|ter|quater|quinquies|sexies)?(?![0-9a-zäöü])';
const P_LET = '[a-z](?:bis|ter|quater|quinquies|sexies)?(?![0-9a-zäöü])';
const P_KONN = '(?:,|und|oder|sowie|bis|[–-])';
const PASSUS_GRUPPE_RE = new RegExp(
  '^\\s+(?:' +
    P_KW_NUM_PL + '\\s+' + P_NUM + '(?:\\s*' + P_KONN + '\\s*' + P_NUM + '(?!\\s+' + P_KW_ANY + '))*' +
    '|' + P_KW_NUM_SG + '\\s+' + P_NUM +
    '|' + P_KW_LET_PL + '\\s+' + P_LET + '(?:\\s*' + P_KONN + '\\s*' + P_LET + ')*' +
    '|' + P_KW_LET_SG + '\\s+' + P_LET +
  ')',
);
// Konnektor zwischen zwei Gliedern, gefolgt von einer Zahl (nächster Glied-Kopf).
const P_KONN_ZAHL_RE = new RegExp('^\\s*' + P_KONN + '\\s*(?=\\d)');
// Gesetz-Signal am Ende der Aufzählung. g1 = Klammer-Kürzel (∈ FEDLEX, autoritativ),
// g2 = kuratierter Genitiv-Kurztitel (nur ohne folgende Klammer), g3 = bare Kürzel
// (∈ FEDLEX, mit/ohne «des/der»).
const P_SIGNAL_RE = new RegExp(
  '^\\s*(?:' +
    '(?:(?:des|der|über|vom)\\s+' + N2_NAME_RUN + '\\s*)?\\((' + NORM_NAMEN_ESC.join('|') + ')\\)' +
    '|(?:des|der|über|vom)\\s+(' + GENITIV_NAMEN_ESC.join('|') + ')\\b(?!\\s*\\()' +
    '|(?:des|der|über|vom)\\s+(' + NORM_NAMEN_ESC.join('|') + ')\\b' +
    '|(' + NORM_NAMEN_ESC.join('|') + ')\\b' +
  ')',
);
// Unauflösbarer Fremdname am Aufzählungs-Ende («des Bundesgesetzes über …», «der
// Verordnung …») → §1-Unterdrückung (kein geratener Self-Link).
const P_FREMD_UNAUFL_RE = /^\s*(?:des|der|über|vom)\s+[A-ZÄÖÜ]/;
// Unbekanntes bare KÜRZEL direkt nach der Aufzählung («… Artikeln 2 und 3 BGSA»,
// BGSA ∉ FEDLEX): Fremdgesetz-Signal, das wir nicht auflösen können → §1-
// Unterdrückung, nie ein falscher Self-Link (Korpus-Fund AHVV art 34; dieselbe
// Muster-Regel wie M12 im Singular-Linker: ≥2 Grossbuchstaben oder Binnen-
// Grossbuchstabe). Gewöhnliche grossgeschriebene Substantive («… Beiträge»)
// matchen NICHT (nur EIN führender Grossbuchstabe).
const P_FREMD_KUERZEL_RE = /^\s*(?:[A-ZÄÖÜ]{2,}|[A-ZÄÖÜ][a-zäöü]*[A-ZÄÖÜ]\w*)/;

// Erkennt, ob die NÄCHSTE Passus-Gruppe mit einem PLURAL-Zahl-Schlüsselwort
// («Absätze/Ziffern/Sätze/Abs./Ziff.») beginnt — die Alternation in
// PASSUS_GRUPPE_RE probiert die Plural-Branch zuerst, der Präfix-Test ist also
// äquivalent zur Frage «hat die Plural-Branch gematcht».
const P_KW_NUM_PL_RE = new RegExp('^\\s+' + P_KW_NUM_PL);
// B1 (Gegenprüfungs-Befund 10.7.2026): Fortsetzungs-Wert einer UNTERBROCHENEN
// Plural-Wertliste — «und|oder N» OHNE folgendes Passus-Wort.
const P_PLURAL_FORTSATZ_RE = new RegExp('^\\s*(?:und|oder)\\s+' + P_NUM + '(?!\\s+' + P_KW_ANY + ')');

function konsumierePassusKette(text: string, pos: number): { pos: number; pluralNum: boolean } {
  let pluralNum = false;
  for (;;) {
    const rest = text.slice(pos);
    const m = PASSUS_GRUPPE_RE.exec(rest);
    if (!m) return { pos, pluralNum };
    if (P_KW_NUM_PL_RE.test(rest)) pluralNum = true;
    pos += m[0].length;
  }
}

/**
 * Alle Plural-Aufzählungs-Regionen eines Fliesstexts (A10). Rein/deterministisch
 * (§2). Regionen sind nach `start` sortiert und überschneidungsfrei.
 */
export function artikelnPluralVerweise(text: string): PluralRegion[] {
  const regionen: PluralRegion[] = [];
  let grenze = -1; // Ende der zuletzt akzeptierten Region (Überschneidungs-Schutz)
  for (const oeff of text.matchAll(PLURAL_OEFFNER)) {
    const start = oeff.index + oeff[0].length; // erstes Glied (Lookahead \d)
    if (start < grenze) continue;
    const istArtikeln = oeff[1] === 'Artikeln';
    // Glieder konsumieren.
    const glieder: PluralGlied[] = [];
    let pos = start;
    for (;;) {
      const am = P_ARTNR_RE.exec(text.slice(pos));
      if (!am) break;
      glieder.push({ roh: am[0], start: pos, end: pos + am[0].length });
      pos += am[0].length;
      const kette = konsumierePassusKette(text, pos);
      pos = kette.pos;
      // B1 (Gegenprüfungs-Befund 10.7.2026, BETMG 8a/FAV 44a/FinfraV 129): nach
      // einer PLURAL-«Absätze/Ziffern»-Gruppe gehört ein «und|oder N» OHNE
      // folgendes Passus-Wort weiter zur WERTLISTE — auch wenn eine «Buchstabe»-
      // Gruppe dazwischen lag: «Artikeln 8 Absätze 1 Buchstabe d und 5, 11» =
      // Art. 8 (Abs. 1 lit. d und Abs. 5), dann Art. 11. Ohne diese Regel würde
      // «5» als Artikel-Glied verlinkt (Falsch-Ziel). Komma/sowie/Bereich bleiben
      // Glied-Konnektoren (§1-sichere Seite: Under-Link statt Falsch-Link).
      while (kette.pluralNum) {
        const vm = P_PLURAL_FORTSATZ_RE.exec(text.slice(pos));
        if (!vm) break;
        pos += vm[0].length;
        const k2 = konsumierePassusKette(text, pos);
        pos = k2.pos;
      }
      const cm = P_KONN_ZAHL_RE.exec(text.slice(pos));
      if (!cm) break;
      pos += cm[0].length;
    }
    if (glieder.length === 0) continue;
    // Gesetz-Signal am Ende.
    const rest = text.slice(pos);
    const sm = P_SIGNAL_RE.exec(rest);
    let fremd: FedlexGesetz | null = null;
    let unterdruecken = false;
    let end = pos;
    if (sm) {
      const kuerzel = sm[1] ?? sm[3] ?? sm[4];
      fremd = sm[2] ? erkenneGenitivGesetz(sm[2]) : kuerzel ? erkenneFedlexGesetz(kuerzel) : null;
      if (fremd) end = pos + sm[0].length;
      else unterdruecken = true; // Klammer-Kürzel ∉ FEDLEX → nie ein Falsch-Ziel (§1)
    } else if (P_FREMD_UNAUFL_RE.test(rest) || P_FREMD_KUERZEL_RE.test(rest) || /^\d/.test(rest)) {
      // «des <unbekannter Fremdname>», ein unbekanntes bare KÜRZEL («… BGSA»)
      // ODER eine abgebrochene Aufzählung (nächstes Zeichen ist eine Zahl = ein
      // nicht parsebares Glied wie «42octies») — das Ziel ist nicht sicher
      // bestimmbar → kein Link (§1).
      unterdruecken = true;
    }
    // «die|der Artikel»-Öffner nur bei echter Aufzählung ODER Gesetz-Signal
    // übernehmen — ein einzelnes «Artikel N» bleibt sonst dem Singular-Pfad.
    if (!istArtikeln && glieder.length < 2 && !fremd && !unterdruecken) continue;
    regionen.push({ oeffnerStart: oeff.index, start, end, glieder, fremd, unterdruecken });
    grenze = end;
  }
  return regionen;
}
