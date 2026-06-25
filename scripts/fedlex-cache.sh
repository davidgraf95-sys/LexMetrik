#!/usr/bin/env bash
# ─── Fedlex-Cache: konsolidierte Filestore-HTMLs laden + Anker prüfen ────────
#
# Reproduzierbare §7-Verifikation: lädt die konsolidierten Fassungen der von
# LexMetrik verwendeten Gesetze nach /tmp (Caches überleben Neustarts nicht)
# und prüft das Anker-Inventar. Konsolidierungsdaten = die im Quellen-Register
# (bibliothek/register/quellen-register.md) dokumentierten, verifizierten Stände —
# bei Rechtsänderungen dort UND hier nachführen.
#
# Aufruf:  bash scripts/fedlex-cache.sh
set -u

BASIS="https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli"

# gesetz|eli|konsolidierung|html-N|pflicht-anker (kommagetrennt)
EINTRAEGE=(
  "or|cc/27/317_321_377|20260101|4|art_11,art_32,art_77,art_104,art_216,art_324_a,art_335_c,art_336_c,art_396,art_493|220"
  "zgb|cc/24/233_245_233|20260101|4|art_19_c,art_360,art_361,art_370,art_467,art_505|210"
  # ZPO-Anker um die Rechtsmittel-Artikel erweitert (Umbau 6.6.2026).
  "zpo|cc/2010/262|20250101|1|art_4,art_6,art_68,art_145,art_197,art_198,art_199,art_210,art_212,art_243,art_308,art_314,art_319,art_321|272"
  # SchKG-Anker um die Zuständigkeits-Karten-Pillen erweitert (Katalog-Split 6.6.2026).
  # Re-Pin 20250101→20260101 (§7-Nachverifikation 7.6.2026): alle engine-
  # tragenden Artikel (46–53, 56, 63, 83–88, 166, 174, 250, 271–280) body-
  # identisch; einzige Normänderung Art. 230 (10→20 T., nicht verdrahtet),
  # neu art_222a (nicht verdrahtet). Anker +88/+166 (Verwirkungsfristen-Drift).
  "schkg|cc/11/529_488_529|20260101|1|art_17,art_46,art_56,art_63,art_84,art_88,art_166,art_272|281.1"
  "arg|cc/1966/57_57_57|20230901|1|art_9,art_12,art_13,art_46|822.11"
  # VMWG: Re-Pin 20250101→20251001 (§7-Nachverifikation 7.6.2026). Die alte
  # «nur SPA-Shell»-Annahme war FALSCH — die Datei liegt OHNE «-N»-Suffix
  # (n=0, Muster GebV SchKG). art_19_a existiert seit 1.10.2025 (V 21.3.2025,
  # AS 2025 191): Staffel-Mitteilung neu in 19a, Index-Teil bleibt in 19 II;
  # Art. 16/17 byte-identisch zu 20250101 (Teuerungs-Engine unberührt).
  "vmwg|cc/1990/835_835_835|20251001|0|art_16,art_17,art_19,art_19_a|221.213.11"
  # StPO-Anker um die Straf-Zuständigkeits-Pillen erweitert (6.6.2026).
  # Re-Pin 20240101→20250401 (§7-Nachverifikation 7.6.2026, Auslöser AS 2025
  # 178 [USG, nur Art. 269]): Gerichtsstands-Kaskade 31–42, Fristen/Wege
  # 301/354–357/381–402/410 f. wortidentisch; einzig Art. 393 I lit. c neu
  # gefasst (Sexualstrafrecht-Rev., AS 2024 27) — nur Fundstellen-Zitat.
  "stpo|cc/2010/267|20250401|1|art_31,art_129,art_301,art_379|312.0"
  # Re-Pin 20210101→20220701 (§7-Nachverifikation 7.6.2026): Art. 11/20
  # byte-identisch; einzige Änderung Art. 66 II lit. d (EGMR, AS 2022 289).
  # Künftige Konsolidierung 20270101 existiert, HTML noch leer — NICHT pinnen.
  "vwvg|cc/1969/737_757_755|20220701|1|art_11|172.021"
  # BGG: bisher Ad-hoc-Cache — seit 6.6.2026 reproduzierbar gepinnt (html-1
  # empirisch bestätigt; Grundlage bestimmeRechtsmittel + Dossier
  # bibliothek/recherche/bgg-beschwerde-engine.md).
  # Re-Pin 20250101→20260401 (§7-Nachverifikation 7.6.2026, Auslöser AS 2026
  # 99 = energierechtl. Beschleunigungserlass): nur Art. 83 z-bis/z-ter,
  # 117 II, 132b (Wasserkraft — nicht verdrahtet); ALLE engine-tragenden
  # Artikel (45–47, 51, 74, 75, 92 f., 98, 100, 113 ff.) wortidentisch.
  # ACHTUNG: Das ist NICHT die «kleine BGG-Revision» (Botschaft 5.12.2025) —
  # deren Monitoring im Verfallsregister bleibt offen!
  "bgg|cc/2006/218|20260401|1|art_45,art_46,art_74,art_75,art_93,art_98,art_100,art_113|173.110"
  # BGerR (Reglement für das Bundesgericht, SR 173.110.131): gepinnt 11.6.2026
  # für die Abteilungs-Auskunft (BGer-Rechtsweg-Ausbau; Vorverifikation
  # 7.6.2026 im Dossier behoerden/rechtsmittel-spruchkoerper-kantone.md §3 —
  # ELI cc/2006/834, Konsolidierung 1.2.2026, Filestore NUR ohne -N-Suffix;
  # seit 1.2.2026 ZWEI strafrechtliche Abteilungen Art. 35/35a, AS 2025 856).
  "bgerr|cc/2006/834|20260201|0|art_33,art_34,art_35,art_35_a,art_36|173.110.131"
  # VVG: gepinnt 6.6.2026 (html-2!, 200 kB; Kündigungs-Maske 3 — 35a/b/c
  # + Zwingend-Kataloge 97/98 am Wortlaut verifiziert).
  "vvg|cc/24/719_735_717|20240101|2|art_35_a,art_35_b,art_35_c,art_97,art_98|221.229.1"
  # HRegV: gepinnt 6.6.2026 (Gründungs-Masken GmbH/AG; 20250101 = neuste
  # greifbare Konsolidierung, 1.7.2025/1.1.2026 liefern nur die SPA-Shell).
  # Beleg-Artikel 43/44/71/72 + Form (18/20/21/22/23/24a) + Domizil 117.
  "hregv|cc/2007/686|20250101|1|art_18,art_20,art_21,art_22,art_23,art_24_a,art_43,art_44,art_45,art_71,art_72,art_117|221.411"
  # GebV-HReg: gepinnt 6.6.2026 (HReg-Gebühren, Anhang Ziff. 1.3 = CHF 420;
  # ELI via SPARQL aufgelöst, 20210101 = einzige Konsolidierung; nur ~30 kB!).
  "gebv_hreg|cc/2020/180|20210101|1|art_3,art_4,art_8|221.411.1"
  # GebV SchKG: gepinnt 7.6.2026 (Bibliotheks-Standard S3-Nachzug — der
  # Betreibungskosten-Rechner nutzte einen Ad-hoc-Cache; ELI lt. Dossier
  # gebv-schkg-kostenrechner.md, Konsolidierung 1.1.2026).
  "gebv_schkg|cc/1996/2937_2937_2937|20260101|0|art_16,art_15_a|281.35"
  # StGB: gepinnt 7.6.2026 (S3-Nachzug — strafrecht-cluster.md nutzte einen
  # Ad-hoc-Cache ohne dokumentiertes ELI; Verjährung 97 ff., Antrag 30 ff.).
  # Re-Pin 20260101→20260612 (terminiert, vollzogen 12.6.2026): AS 2026 231
  # (Eurodac/Schengen) ändert nur Art. 354/357 (nicht verdrahtet); alle
  # zitierten Artikel normtext-identisch, Anker-Inventar 477/477 stabil;
  # neue Datei liegt OHNE -N-Suffix (n=0, Muster GebV SchKG).
  "stgb|cc/54/757_781_799|20260612|0|art_30,art_97,art_98,art_101,art_109,art_333,art_389|311.0"
  # StG: gepinnt 6.6.2026 (Emissionsabgabe in den Gründungs-Masken:
  # Art. 8 Abs. 1 = 1 %, Art. 6 Abs. 1 lit. h = Freibetrag 1 Mio.;
  # 20240101 = neuste Konsolidierung).
  "stg|cc/1974/11_11_11|20240101|1|art_5,art_6,art_8|641.10"
  # KVG: gepinnt 11.6.2026 (KVG-Preset der Kündigungs-Maske 3 — Art. 7
  # Wechsel des Versicherers, Art. 64a Abs. 6 Ausstands-Sperre; 20260101 =
  # neuste echte Konsolidierung, 202602–202606 liefern nur die SPA-Shell;
  # Datei OHNE -N-Suffix. Dossier kvg-grundversicherung-kuendigung.md).
  "kvg|cc/1995/1328_1328_1328|20260101|0|art_7,art_62,art_64_a|832.10"
  # KVV: gepinnt 11.6.2026 (besondere Versicherungsformen: Art. 94 Abs. 2 /
  # Art. 100 Abs. 3 — Wechsel nur auf Jahresende, Fassung AS 2024 697).
  "kvv|cc/1995/3867_3867_3867|20260101|0|art_94,art_99,art_100|832.102"
  # ── Erweiterung 17.6.2026 (jedes zitierte Bundesgesetz mit Volltext-Snapshot,
  # Auftrag David). ELI + geltende Konsolidierung via Fedlex-SPARQL ermittelt,
  # SR-Nr. + Pflicht-Anker am Filestore-HTML empirisch verifiziert (§7). Alle n=0.
  "mwstg|cc/2009/615|20250331|0|art_22,art_26|641.20"
  "urg|cc/1993/1798_1798_1798|20250701|0|art_17|231.1"
  "bewg|cc/1984/1148_1148_1148|20230701|0|art_2,art_5,art_18|211.412.41"
  "eog|cc/1952/1021_1046_1050|20260601|0|art_16_c|834.1"
  "svg|cc/1959/679_705_685|20250401|0|art_65|741.01"
  "dsg|cc/2022/491|20250707|0|art_25|235.1"
  "bbg|cc/2003/674|20250301|0|art_14|412.10"
  # GBV/JStPO ergänzt 17.6.2026. GBV: neuste Konsolidierung MIT Filestore-HTML
  # ist 20240101 (spätere nur SPA-Shell, Live-Link massgeblich, Muster VMWG).
  "gbv|cc/2011/667|20240101|0|art_86|211.432.1"
  "jstpo|cc/2010/226|20250701|0|art_10|312.1"
  # ── Volltext-Ausbau 19.6.2026 (Batch «wichtigste»): ELI/Konsolidierung/n=0
  #    empirisch am Filestore-HTML verifiziert, alle Pflicht-Anker vorhanden. ──
  "bv|cc/1999/404|20240303|0|art_1,art_5,art_8,art_36,art_190|101"
  "dbg|cc/1991/1184_1184_1184|20260101|0|art_1,art_16,art_33,art_125,art_205|642.11"
  "vstg|cc/1966/371_385_384|20250101|0|art_1,art_4,art_13,art_21,art_61|642.21"
  "kg|cc/1996/546_546_546|20230701|0|art_1,art_4,art_5,art_7,art_30|251"
  "fusg|cc/2004/320|20230101|0|art_1,art_3,art_29,art_69|221.301"
  "mschg|cc/1993/274_274_274|20250701|0|art_1,art_3,art_13,art_30|232.11"
  "uwg|cc/1988/223_223_223|20250101|0|art_1,art_2,art_3,art_23|241"
  "patg|cc/1955/871_893_899|20250701|0|art_1,art_3,art_8,art_66|232.14"
  # ── Volltext-Ausbau Bund 23.6.2026 (Promotion aus nur-live-link-Stubs;
  #    Konsolidierung via ELI-Resolver/SPARQL geltend-verifiziert, art_1 am
  #    Filestore-HTML bestätigt, §7). NUR Erlasse, die der bestehende Extraktor
  #    (class="absatz"-Markup) sauber erfasst — IPRG/BetmG/VStrR (ältere
  #    plain-<p>-Intros vor <dl>) brauchen erst einen verifizierten Parser-Fix. ──
  "partg|cc/2005/782|20250101|0|art_1|211.231"
  "jstg|cc/2006/551|20250701|0|art_1|311.1"
  "iprg|cc/1988/1776_1776_1776|20260101|0|art_1|291"
  "betmg|cc/1952/241_241_245|20230901|0|art_1|812.121"
  "vstrr|cc/1974/1857_1857_1857|20230901|0|art_1|313.0"
  # ── Volltext-Ausbau Bund Batch 2 (23.6.2026) — klar aktuelle Konsolidierungen
  #    (≥2023, SPARQL-geltend); Currency zusätzlich via check:fedlex-versionen. ──
  "atsg|cc/2002/510|20240101|0|art_1|830.1"
  "bvg|cc/1983/797_797_797|20250101|0|art_1|831.40"
  "uvg|cc/1982/1676_1676_1676|20260101|0|art_1|832.20"
  "avig|cc/1982/2184_2184_2184|20260101|0|art_1|837.0"
  "rpg|cc/1979/1573_1573_1573|20260401|0|art_1|700"
  "usg|cc/1984/1122_1122_1122|20260401|0|art_1|814.01"
  "vgg|cc/2006/352|20260612|0|art_1|173.32"
  "bgfa|cc/2002/153|20250701|0|art_1|935.61"
  "kkg|cc/2002/593|20230901|0|art_1|221.214.1"
  "gwg|cc/1998/892_892_892|20240301|0|art_1|955.0"
  # ── Batch 3 (23.6.2026) — Resolver-Daten; Currency via check:fedlex-versionen korrigiert. ──
  "ivg|cc/1959/827_857_845|20260101|0|art_1|831.20"
  "famzg|cc/2008/51|20260101|0|art_1|836.2"
  "sthg|cc/1991/1256_1256_1256|20250101|0|art_1|642.14"
  "aig|cc/2007/758|20260612|0|art_1|142.20"
  "asylg|cc/1999/358|20260612|0|art_1|142.31"
  "glg|cc/1996/1498_1498_1498|20200701|0|art_1|151.1"
  "finmag|cc/2008/736|20250401|0|art_1|956.1"
  "bgbb|cc/1993/1410_1410_1410|20140101|0|art_1|211.412.11"
  # ── Batch 4 (23.6.2026) — korrekte Konsolidierung via Filestore-HTML-Sonde
  #    (ELI-Resolver gab hier veraltete/HTML-lose Daten; neueste MIT HTML gepinnt). ──
  "ahvg|cc/63/837_843_843|20260101|0|art_1|831.10"
  "bankg|cc/51/117_121_129|20240101|0|art_1|952.0"
  "hmg|cc/2001/422|20250101|0|art_1|812.21"
  # ── Punkt 12 Batch 1 (24.6.2026) — Bund-Gesetze aus Davids Anwaltsprüfungs-
  #    Bookmark-Liste, Promotion aus nur-live-link-Stubs. ELI/Konsolidierung via
  #    Resolver, danach gegen check:fedlex-versionen + Filestore-HTML-Sonde
  #    korrigiert (art_1 + Stichproben empirisch verifiziert, §7). ──
  "bueg|cc/2016/404|20230901|0|art_1|141.0"
  "bgoe|cc/2006/355|20231101|0|art_1|152.3"
  "bpr|cc/1978/688_688_688|20221023|0|art_1|161.1"
  "vg|cc/1958/1413_1483_1489|20250615|0|art_1|170.32"
  "publg|cc/2004/745|20230901|0|art_1|170.512"
  "parlg|cc/2003/510|20260302|0|art_1|171.10"
  "rvog|cc/1997/2022_2022_2022|20250501|0|art_1|172.010"
  "boeb|cc/2020/126|20260101|0|art_1|172.056.1"
  "bpg|cc/2001/123|20240101|0|art_1|172.220.1"
  "stbog|cc/2010/444|20240101|0|art_1|173.71"
  "desg|cc/2002/226|20250701|0|art_1|232.12"
  "ohg|cc/2008/232|20250101|0|art_1|312.5"
  "nhg|cc/1966/1637_1694_1679|20250801|0|art_1|451"
  "entg|cc/47/689_701_723|20210101|0|art_1|711"
  "gschg|cc/1992/1860_1860_1860|20250801|0|art_1|814.20"
  "entsg|cc/2003/231|20240101|0|art_1|823.20"
  "elg|cc/2007/804|20260101|0|art_1|831.30"
  "fzg|cc/1994/2386_2386_2386|20240101|0|art_1|831.42"
  "wag|cc/1992/2521_2521_2521|20250801|0|art_1|921.0"
  "pueg|cc/1986/895_895_895|20260508|0|art_1|942.20"
  "fidleg|cc/2019/758|20240301|0|art_1|950.1"
  "kag|cc/2006/822|20240301|0|art_1|951.31"
  "finig|cc/2018/801|20240301|0|art_1|954.1"
  "finfrag|cc/2015/853|20240201|0|art_1|958.1"
  "vag|cc/2005/734|20240901|1|art_1|961.01"
  # ── Punkt 12 Batch 2 (24.6.2026, Bund-VERORDNUNGEN Volltext, Promotion aus
  #    nur-live-link). ELI/Konsolidierung via date-geordnete Taxonomie-Abfrage
  #    (Resolver gab vielfach die REPEALTE Vorgänger-VO — geltende Konsolidierung
  #    gewählt, gegen check:fedlex-versionen) + Filestore-HTML-Inhalts-Sonde
  #    (art_1 + Artikelzahl == Snapshot) + SR-Kollisions-Tor (6. Feld) verifiziert (§7). ──
  "ahvv|cc/63/1185_1183_1185|20260101|0|art_1|831.101"
  "ivv|cc/1961/29_29_29|20250601|0|art_1|831.201"
  "elv|cc/1971/37_37_37|20250101|0|art_1|831.301"
  "bvv_2|cc/1984/543_543_543|20250101|0|art_1|831.441.1"
  "uvv|cc/1983/38_38_38|20260101|0|art_1|832.202"
  "aviv|cc/1983/1205_1205_1205|20260101|0|art_1|837.02"
  "atsv|cc/2002/569|20240101|0|art_1|830.11"
  "klv|cc/1995/4964_4964_4964|20260511|0|art_1|832.112.31"
  "mwstv|cc/2009/828|20250101|0|art_1|641.201"
  "vstv|cc/1966/1585_1641_1624|20250101|0|art_1|642.211"
  "vzae|cc/2007/759|20260612|0|art_1|142.201"
  "vrv|cc/1962/1364_1409_1420|20260401|0|art_1|741.11"
  "vzv|cc/1976/2423_2423_2423|20260101|0|art_1|741.51"
  "ssv|cc/1979/1961_1961_1961|20250701|0|art_1|741.21"
  "dsv|cc/2022/568|20251201|0|art_1|235.11"
  "argv1|cc/2000/243|20240901|0|art_1|822.111"
  "bewv|cc/1984/1164_1164_1164|20240301|0|art_1|211.412.411"
  "buev|cc/2016/405|20190709|0|art_1|141.01"
  "fzv|cc/1994/2399_2399_2399|20240301|0|art_1|831.425"
  "kov|cc/27/751_749_771|20210801|0|art_1|281.32"
  "rpv|cc/2000/310|20260520|0|art_1|700.1"
  "vbb|cc/1996/2877_2877_2877|20160101|0|art_1|281.31"
  "voeb|cc/2020/127|20230901|0|art_1|172.056.11"
  "vzg|cc/36/425_433_469|20120101|0|art_1|281.42"
  "bvv3|cc/1985/1778_1778_1778|20250101|0|art_1|831.461.3"
  "mvv|cc/1993/3080_3080_3080|20260101|0|art_1|833.11"
  "eov|cc/2005/187|20260601|0|art_1|834.11"
  "famzv|cc/2008/52|20250101|0|art_1|836.21"
  "argv2|cc/2000/244|20251201|0|art_1|822.112"
  "argv3|cc/1993/2553_2553_2553|20240901|0|art_1|822.113"
  "argv4|cc/1993/2564_2564_2564|20150501|0|art_1|822.114"
  "vev|cc/2018/493|20260612|0|art_1|142.204"
  "vinta|cc/2018/511|20251201|0|art_1|142.205"
  "asylv1|cc/1999/359|20260101|0|art_1|142.311"
  "asylv2|cc/1999/360|20220101|0|art_1|142.312"
  "asylv3|cc/1999/361|20240601|0|art_1|142.314"
  "gschv|cc/1998/2863_2863_2863|20251201|0|art_1|814.201"
  "lrv|cc/1986/208_208_208|20260101|0|art_1|814.318.142.1"
  "lsv|cc/1987/338_338_338|20260401|0|art_1|814.41"
  "vvea|cc/2015/891|20260101|0|art_1|814.600"
  "chemv|cc/2015/366|20260424|0|art_1|813.11"
  "nhv|cc/1991/249_249_249|20250801|0|art_1|451.1"
  "wav|cc/1992/2538_2538_2538|20250801|0|art_1|921.01"
  "vts|cc/1995/4425_4425_4425|20260430|0|art_1|741.41"
  "bankv|cc/2014/273|20250101|0|art_1|952.02"
  "kkv|cc/2006/859|20251125|0|art_1|951.311"
  "erv|cc/2012/629|20250124|0|art_1|952.03"
  "finiv|cc/2019/763|20250101|0|art_1|954.11"
  "finfrav|cc/2015/854|20250101|0|art_1|958.11"
  "fidlev|cc/2019/759|20220101|0|art_1|950.11"
  "avo|cc/2005/735|20260226|0|art_1|961.011"
  "gwv_finma|cc/2015/390|20230101|0|art_1|955.033.0"
  "vam|cc/2018/588|20260101|0|art_1|812.212.21"
  "ambv|cc/2018/786|20250315|0|art_1|812.212.1"
  "mepv|cc/2020/552|20231101|0|art_1|812.213"
  "epv|cc/2015/298|20250101|0|art_1|818.101.1"
  "bpv|cc/2001/319|20260101|0|art_1|172.220.111.3"
  "rvov|cc/1999/170|20260301|0|art_1|172.010.1"
  "vgke|cc/2008/321|20100401|0|art_1|173.320.2"
  "betmkv|cc/2011/362|20230123|0|art_1|812.121.1"
  "qstv|cc/2018/274|20250110|0|art_1|642.118.2"
  # ── Punkt 12 Batch 3 (25.6.2026): Promotion nur-live-link-Stub → Volltext ──
  #    (16 Gesetze + ZStV; geltende Konsolidierung + SR-Sonde je Pin geprüft).
  "sortg|cc/1977/862_862_862|20110101|0|art_1|232.16"
  "prg|cc/1993/3152_3152_3152|20210820|0|art_1|944.3"
  "beg|cc/2009/450|20230101|0|art_1|957.1"
  "mstg|cc/43/359_375_369|20260608|0|art_1|321.0"
  "mstp|cc/1979/1059_1059_1059|20240701|0|art_1|322.1"
  "irsg|cc/1982/846_846_846|20240101|0|art_1|351.1"
  "mvg|cc/1993/3043_3043_3043|20240101|0|art_1|833.1"
  "eng|cc/2017/762|20260401|0|art_1|730.0"
  "co2_gesetz|cc/2012/855|20250101|0|art_1|641.71"
  "epg|cc/2015/297|20250801|0|art_1|818.101"
  "txg|cc/2007/279|20210201|0|art_1|810.21"
  "lmg|cc/2017/62|20241001|0|art_1|817.0"
  "lfg|cc/1950/471_491_479|20260101|0|art_1|748.0"
  "ebg|cc/1958/335_341_347|20260101|0|art_1|742.101"
  "fmg|cc/1997/2187_2187_2187|20260601|0|art_1|784.10"
  "mg|cc/1995/4093_4093_4093|20260601|0|art_1|510.10"
  "zstv|cc/2004/362|20250601|0|art_1|211.112.2"
  "thg|cc/1996/1725_1725_1725|20230901|0|art_1|946.51"
  "bgbm|cc/1996/1738_1738_1738|20250101|0|art_1|943.02"
  # ── Punkt 12 Batch 3 (25.6.2026): kuratierte zentrale Bundes-VERORDNUNGEN ──
  #    (geltende Konsolidierung via date-geordnete Taxonomie + SR-Sonde geprüft;
  #    repealte Vorgänger-ELIs des einfachen Resolvers verworfen.)
  "mschv|cc/1993/296_296_296|20250701|0|art_1|232.111"
  "patv|cc/1977/2027_2027_2027|20250701|0|art_1|232.141"
  "desv|cc/2002/183|20250701|0|art_1|232.121"
  "urv|cc/1993/1821_1821_1821|20250701|0|art_1|231.11"
  "tgbv|cc/2013/3|20240101|0|art_1|211.432.11"
  "bkv|cc/1993/1363_1363_1363|20260101|0|art_1|642.118.1"
  "zentv|cc/2002/29|20230901|0|art_1|360.1"
  "vkkg|cc/2002/594|20210701|0|art_1|221.214.11"
  "argv5|cc/2007/692|20240401|0|art_1|822.115"
  "vvk|cc/2007/101|20230101|0|art_1|832.105"
  "vkl|cc/2002/418|20250601|0|art_1|832.104"
  "vfv|cc/1961/419_429_439|20250101|0|art_1|831.111"
  "bbv|cc/2003/748|20250301|0|art_1|412.101"
  "bmv|cc/2009/423|20160823|0|art_1|412.103.1"
  "zemis_v|cc/2006/303|20260612|0|art_1|142.513"
  "adov|cc/2011/505|20230123|0|art_1|211.221.36"
  "rdv|cc/2012/713|20251101|0|art_1|143.5"
  "zavv|cc/2008/760|20230101|0|art_1|364.3"
  "akkbv|cc/1996/1904_1904_1904|20250101|0|art_1|946.512"
  "finfrav_finma|cc/2015/855|20230201|0|art_1|958.111"
  "finma_gebv|cc/2008/749|20240301|0|art_1|956.122"
  "kkv_finma|cc/2014/707|20210101|0|art_1|951.312"
  "nbv|cc/2004/233|20240701|0|art_1|951.131"
  "pavo|cc/1977/1931_1931_1931|20230123|0|art_1|211.222.338"
  "vgr|cc/2008/320|20230601|0|art_1|173.320.1"
  "skv|cc/2007/296|20260101|0|art_1|741.013"
  "vvv|cc/1959/1271_1321_1317|20260101|0|art_1|741.31"
  "vil|cc/1994/3050_3050_3050|20240101|0|art_1|748.131.1"
  "fdv|cc/2007/166|20260301|0|art_1|784.101.1"
  "fav|cc/2016/24|20240815|0|art_1|784.101.2"
  "uvpv|cc/1988/1931_1931_1931|20250101|0|art_1|814.011"
  "chemrrv|cc/2005/478|20260101|0|art_1|814.81"
  "veva|cc/2005/551|20250801|0|art_1|814.610"
  "vgvp|cc/2000/299|20220101|0|art_1|814.621"
  # ── International: Staatsverträge SR 0.* als Volltext (Auftrag David 25.6.2026) ──
  # ELI/Konsolidierung via fedlex:eli aufgelöst; SR-Sonde + art_1-Anker verifizieren je Vertrag.
  "cisg|cc/1991/307_307_307|20260522|0|art_1|0.221.211.1"
  "lugue|cc/2010/801|20160408|0|art_1|0.275.12"
  "hzue|cc/1994/2809_2809_2809|20230612|0|art_1|0.274.131"
  "hbewue|cc/1994/2824_2824_2824|20260101|0|art_1|0.274.132"
  "hkue|cc/1983/1694_1694_1694|20240613|0|art_1|0.211.230.02"
  "fza|cc/2002/243|20201215|0|art_1|0.142.112.681"
  "vrk|cc/1990/1112_1112_1112|20200508|0|art_1|0.111"
  "uno_pakt_ii|cc/1993/750_750_750|20220509|0|art_1|0.103.2"
  # ── International P2 (25.6.2026): weitere Staatsverträge SR 0.* als Volltext.
  # ELI/Kons via SPARQL + Filestore-HTML-Gehalt (art_-Anker) je Vertrag verifiziert.
  "uno_pakt_i|cc/1993/725_725_725|20241128|0|art_1|0.103.1"
  "krk|cc/1998/2055_2055_2055|20260612|0|art_1|0.107"
  "cedaw|cc/1999/239|20230419|0|art_1|0.108"
  "uno_antifolter|cc/1987/1307_1307_1307|20260528|0|art_1|0.105"
  "heue|cc/2009/381|20230509|0|art_1|0.211.232.1"
  "haue|cc/2003/99|20250507|0|art_1|0.211.221.311"
  "pvue|cc/1970/620_620_620|20240109|0|art_1|0.232.04"
  "icao|cc/63/1377_1378_1381|20251127|0|art_1|0.748.0"
  "staatenlose|cc/1972/2320_2374_2150|20260522|0|art_1|0.142.40"
  "gfk|cc/1955/443_461_469|20120614|0|art_1|0.142.30"
)

fehler=0
for e in "${EINTRAEGE[@]}"; do
  # 6. Feld (sr) ist OPTIONAL: trägt es eine SR-Nummer, prüft das Tor die im
  # HTML eingebettete <p class="srnummer">NNN</p> gegen die erwartete SR. Das
  # fängt die Erlass-KOLLISIONS-Klasse (richtige ELI/Konsolidierung + richtiger
  # art_-Anker, aber FALSCHER Erlass unter dieser html-Variante) — entdeckt
  # 25.6.2026 an VAG: cc/2005/734/20240901 html-0 = Agrar-Einfuhr-VO (SR 916.01),
  # html-1 = VAG (SR 961.01); das art_1-Tor allein war blind dafür. Fehlt das
  # Feld (Altbestand), läuft die Prüfung wie bisher (rückwärtskompatibel, §6).
  IFS='|' read -r name eli kons n anker sr <<<"$e"
  datei="/tmp/${name}.html"
  pfad="${eli//\//-}"
  # n=0: Datei OHNE «-N»-Suffix (Spezialfall GebV SchKG, festgestellt 7.6.2026)
  if [ "$n" = "0" ]; then
    url="${BASIS}/${eli}/${kons}/de/html/fedlex-data-admin-ch-eli-${pfad}-${kons}-de-html.html"
  else
    url="${BASIS}/${eli}/${kons}/de/html/fedlex-data-admin-ch-eli-${pfad}-${kons}-de-html-${n}.html"
  fi
  code=$(curl -s -o "$datei" -w "%{http_code}" "$url")
  groesse=$(wc -c < "$datei" | tr -d ' ')
  # Schwelle 20 kB: SPA-Shell/Fehlerseiten sind ~9 kB bzw. ~77 kB OHNE Anker —
  # die Anker-Prüfung unten fängt grosse Blindgänger; kleinster echter Cache
  # ist die GebV-HReg mit ~30 kB (darum nicht mehr 40 kB).
  if [ "$code" != "200" ] || [ "$groesse" -lt 20000 ]; then
    # Fallback: andere html-N-Varianten probieren
    ok=""
    for alt in 1 2 3 4 5; do
      url="${BASIS}/${eli}/${kons}/de/html/fedlex-data-admin-ch-eli-${pfad}-${kons}-de-html-${alt}.html"
      code=$(curl -s -o "$datei" -w "%{http_code}" "$url")
      groesse=$(wc -c < "$datei" | tr -d ' ')
      if [ "$code" = "200" ] && [ "$groesse" -gt 20000 ]; then ok="ja"; break; fi
    done
    if [ -z "$ok" ]; then
      echo "FEHLER  ${name}: kein Filestore-HTML gefunden (Konsolidierung ${kons} prüfen!)"
      fehler=$((fehler+1)); continue
    fi
  fi
  fehlend=""
  IFS=',' read -ra LISTE <<<"$anker"
  for a in "${LISTE[@]}"; do
    if ! grep -q "id=\"${a}\"" "$datei"; then fehlend="${fehlend} ${a}"; fi
  done
  # SR-Identitäts-Sonde (Erlass-Kollisions-Tor): nur wenn eine erwartete SR
  # angegeben ist. Fedlex bettet die SR als <p class="srnummer">NNN</p> ein.
  sr_problem=""
  if [ -n "${sr:-}" ]; then
    if ! grep -qE "class=\"srnummer[^\"]*\"[^>]*>[[:space:]]*${sr//./\\.}[[:space:]]*<" "$datei"; then
      gefunden=$(grep -oE 'class="srnummer[^"]*"[^>]*>[[:space:]]*[0-9.]+' "$datei" | grep -oE '[0-9.]+$' | head -1)
      sr_problem=" FALSCHER ERLASS: erwartet SR ${sr}, HTML trägt SR ${gefunden:-?}"
    fi
  fi
  if [ -n "$fehlend" ] || [ -n "$sr_problem" ]; then
    echo "FEHLER  ${name} (${kons}, ${groesse} B):${fehlend:+ fehlende Anker:${fehlend}}${sr_problem}"
    fehler=$((fehler+1))
  else
    echo "OK      ${name} (${kons}) → ${datei} (${groesse} B), ${#LISTE[@]} Anker${sr:+ + SR ${sr}} geprüft"
  fi
done

if [ "$fehler" -gt 0 ]; then
  echo; echo "${fehler} Gesetz(e) mit Problemen — Konsolidierungsstände im Quellen-Register prüfen."
  exit 1
fi
echo; echo "Alle Caches aktuell, alle Pflicht-Anker vorhanden."
