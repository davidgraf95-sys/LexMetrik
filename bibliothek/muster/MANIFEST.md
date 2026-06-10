# Muster-Quellsammlung — amtliche Vorlagen, verbatim geparst (.txt)

**Angelegt 7.6.2026** (Bibliotheks-Audit, Auftrag David «Library nützlicher
machen»): Die Wortlaut-Dossiers
[gruendungsdokumente-wortlaute](../recherche/gruendungsdokumente-wortlaute.md)
und [kapitalerhoehung-wortlaute](../recherche/kapitalerhoehung-wortlaute.md)
stützten sich auf `/tmp/muster/*` — **flüchtig** (überlebt keinen Neustart)
und nicht garantiert wiederbeschaffbar (amtliche URLs ändern). Darum liegen
die Text-Extrakte (textutil/pymupdf aus den Original-DOCX/PDF) jetzt HIER;
die Originale sind über die URLs unten beziehbar.

**Status:** Roh-Quellmaterial (KEINE LexMetrik-Inhalte; Urheber = jeweilige
Ämter). Abruf aller Quellen: **6./7.6.2026**, HTTP 200, sofern nicht anders
vermerkt. Verwendungs-Belege je Baustein stehen in den Dossiers.

## EHRA (Bund) — Stand 1.4.2017, inhaltlich ÜBERHOLT (nur Referenz!)

| Datei | Quelle |
|---|---|
| gmbh-ohne-kommentar.txt | bj.admin.ch `/dam/bj/de/data/wirtschaft/gesetzgebung/archiv/gmbh/gmbh-musterstatuten-ohne-kommentar.doc.download.doc/gmbh-musterstatuten-ohne-kommentar-d.doc` |
| gmbh-tabelle-mit-kommentar.txt | bj.admin.ch `…/archiv/gmbh/musterstatuten-tabelle.pdf.download.pdf/musterstatuten-tabelle-d.pdf` |

Negativbefund: **AG-Musterstatuten existieren beim EHRA nicht** (404-Proben
+ Archivseite, 7.6.2026); Kantone sind zuständig.

## HRegA Zürich — Vorlagen-Suite Stand 26.7.2024
Basis: `https://www.zh.ch/content/dam/zhweb/bilder-dokumente/themen/wirtschaft-arbeit/handelsregister/`

| Datei | Pfad-Suffix |
|---|---|
| zh-gmbh-statuten-lang/-kurz.txt | `gmbh/gmbh_vorlage_statuten_lang.docx` / `…_kurz.docx` |
| zh-ag-statuten-lang/-kurz.txt | `aktiengesellschaft/ag_vorlage_statuten_lang.docx` / `…_kurz.docx` |
| zh-gmbh-wahlannahme-gf.txt · zh-ag-wahlannahme-vr.txt | `gmbh/gmbh_vorlage_wahlannahme_gf.docx` · `aktiengesellschaft/ag_vorlage_wahlannahme_vr.docx` |
| zh-gmbh-/zh-ag-domizilannahmeerklaerung.txt | `gmbh/gmbh_vorlage_domizilannahmeerklaerung.docx` · `aktiengesellschaft/ag_vorlage_domizilannahmeerklaerung.docx` |
| zh-ag-protokoll-vr-konstituierung.txt | `aktiengesellschaft/ag_vorlage_protokoll_vr.docx` |
| zh-hrega-gmbh-/-ag-urkunde-gruendung-bar.txt | `gmbh/gmbh_vorlage_urkunde_gruendung_bar.docx` · `aktiengesellschaft/ag_vorlage_urkunde_gruendung_bar.docx` |
| zh-gmbh-gruendung-1person-bar.txt · zh-gmbh-gruendung-mehrere-bar.txt | notariate-zh.ch `/sites/default/files/2025-07/13.4_GmbH_Gruendung (eine Person) bar.docx` · `…13.1_GmbH_Gruendung_mehrere_Personen_bar_20240726.docx` (byte-identisch mit HRegA-Fassung) |
| zh-ag-gruendung-1person-bar.txt · zh-ag-gruendung-bar-chf.txt | notariate-zh.ch `…/3.5_AG_Gruendung (eine Person) bar.docx` · `…/3.1_AG_Gruendung_bar_in_CHF_20240726.docx` |

## HRegA Zürich / Notariate ZH — AG-Gründungs-Suite, Nacharchivierung 10.6.2026 (B2)

Extrakte (textutil/pymupdf, 10.6.2026) aus der lokalen Ablage
`bibliothek/quellen/legal-calc-knowledge/Gründung AG/` (gitignored;
md5-Inventar und Duplikat-Nachweis im Dossier
[ag-gruendung-musterabgleich](../recherche/ag-gruendung-musterabgleich.md)).
Die `ag_*`-/`allg_*`-Dateinamen sind identisch mit den Pfad-Suffixen der
ZH-Basis oben (`aktiengesellschaft/` bzw. `rechtsformuebergreifend/` für
`allg_*`; Abruf der Web-Originale 6./7.6.2026, HTTP 200 — Beleg im
Musterabgleich-Dossier). Für die Notariats-Textvorlagen 3.2/3.4 ist KEINE
amtliche Einzel-URL dokumentiert (Quelle: Ablage David; sie liegen im
notariate-zh.ch-Ordner `/sites/default/files/2025-07/` der oben belegten
3.1/3.5, dort nicht eigens abgerufen).

| Datei | Quelle | Stand |
|---|---|---|
| zh-ag-gruendung-bar-fremdwaehrung.txt | Notariate ZH Textvorlage 3.2 (`3.2_AG_Gruendung_bar_in_Fremdwaehrung_20240726.docx`) — Einzel-URL nicht dokumentiert | 26.7.2024 |
| zh-ag-gruendung-qualifiziert.txt | Notariate ZH Textvorlage 3.3, byte-identisch mit `aktiengesellschaft/ag_vorlage_urkunde_gruendung_qualifiziert.docx` | 26.7.2024 |
| zh-ag-gruendungs-nachtrag.txt | Notariate ZH Textvorlage 3.4 (`3.4_AG_Gruendungs-Nachtrag.docx`) — Einzel-URL nicht dokumentiert | undatiert |
| zh-ag-anmeldung-neueintragung.txt | `aktiengesellschaft/ag_anmeldung_neueintragung.docx` | undatiert |
| zh-ag-vertrag-se-einfach/-geschaeft.txt | `aktiengesellschaft/ag_vorlage_vertrag_se_einfach.docx` / `…_geschaeft.docx` | Suite 26.7.2024 |
| zh-ag-gruendungsbericht-se-einfach/-geschaeft.txt | `aktiengesellschaft/ag_vorlage_gruendungsbericht_se_einfach.docx` / `…_geschaeft.docx` | Suite 26.7.2024 |
| zh-ag-muster-vertrag-se-einfach/-geschaeft.txt · zh-ag-muster-gruendungsbericht-se-einfach/-geschaeft.txt · zh-ag-muster-protokoll-vr.txt (ausgefüllte Beispiele «Brinkmann Lux AG») | `aktiengesellschaft/ag_muster_vertrag_se_einfach.pdf` / `…_geschaeft.pdf` · `…ag_muster_gruendungsbericht_se_einfach.pdf` / `…_geschaeft.pdf` · `…ag_muster_protokoll_vr.pdf` | PDF-Metadaten 10.–11.12.2024 |
| zh-ag-muster-wahlannahme-vr.txt (ausgefülltes Beispiel) | `aktiengesellschaft/ag_muster_wahlannahme_vr.pdf` | PDF-Metadaten 30.7.2024 |
| zh-ag-checkliste-mindestinhalt-statuten.txt · zh-ag-checkliste-minimalanforderungen-errichtungsakt.txt · zh-ag-checkliste-neueintragung.txt | `aktiengesellschaft/ag_checkliste_mindestinhalt_statuten.pdf` · `…minimalanforderungen_errichtungsakt.pdf` · `…neueintragung.pdf` | 11.12.2024 (im PDF) |
| zh-ag-merkblatt-neueintragung.txt | `aktiengesellschaft/ag_merkblatt_neueintragung.pdf` | 11.12.2024 |
| zh-ag-merkblatt-gesetzl-pflichten-vr.txt | `aktiengesellschaft/ag_merkblatt_gesetzl_pflichten_vr.pdf` | 3.12.2025 |
| zh-allg-merkblatt-formelle-anforderungen-handelsregisterbelege.txt | `rechtsformuebergreifend/allg_merkblatt_formelle_anforderungen_handelsregisterbelege.pdf` | 7.1.2025 |
| zh-allg-merkblatt-achtung-vor-privaten-registern.txt | `rechtsformuebergreifend/allg_merkblatt_achtung_vor_privaten_registern.pdf` | 17.2.2026 |
| zh-allg-merkblatt-kmu-erklaerung-opting-out.txt | `rechtsformuebergreifend/allg_merkblatt_kmu_erklaerung_opting_out.pdf` (= «div-zh-kmu-erklaerung-optingout» unten, Abruf 6./7.6.2026) | 11.12.2024 |
| zh-allg-formular-lex-koller-erklaerung.txt | `rechtsformuebergreifend/allg_formular_lex_koller_erklaerung.pdf` (Datei-interner Name `allg_formular_lex_friedrich_erklaerung`) | 1.1.2025 |

Damit sind alle 30 eindeutigen Payloads der AG-Gründungs-Ablage als
Text-Extrakt archiviert (7 bereits oben, 23 hier; 9 byte-identische
Duplikatpaare nur einmal).

## HRegA Zürich — Kapitalerhöhung (ke-zh-*)
Gleiche Basis; Übersichten `…/kapitalerhoehung-eintragen.html` (AG) bzw. `…/gmbh/kapitalerhoehung-bar-eintragen.html`.

| Datei | Pfad-Suffix |
|---|---|
| ke-zh-urkunde-gv-ag.txt | `aktiengesellschaft/ag_vorlage_urkunde_gv_ord_kapitalerhöhung.docx` |
| ke-zh-urkunde-vr-ag.txt | `aktiengesellschaft/ag_vorlage_urkunde_vr_ord_kapitalerhöhung_bar.docx` |
| ke-zh-kapitalerhoehungsbericht-ag.txt | `aktiengesellschaft/ag_vorlage_kapitalerhoehungsbericht_bar.docx` |
| ke-zh-anmeldung-aenderung-ag.txt | `aktiengesellschaft/ag_anmeldung_aenderung.docx` (generisch, kein KE-Spezialformular) |
| ke-zh-urkunde-gsv-gmbh.txt · ke-zh-urkunde-gf-gmbh.txt | `gmbh/gmbh_vorlage_urkunde_gsv_kapitalerhoehung.docx` · `…_gf_….docx` |
| ke-zh-anmeldung-aenderung-gmbh.txt | `gmbh/gmbh_anmeldung_aenderung.docx` |
| (nur PDF, nicht als txt) Checkliste KE AG · Muster Bericht/Zeichnungsschein | `ag_checkliste_ordentliche_kapitalerhoehung.pdf` · `ag_muster_kapitalerhoehungsbericht_bar.pdf` · `ag_muster_kapitalerhoehung_zeichnungsschein.pdf` |

## Amt für HReg und Notariate St. Gallen (Ordner «…änderung2023»/«ag-änderung»)
Basis: `https://www.sg.ch/content/dam/sgch/recht/handelsregister-notariate/` (Umlaute prozentkodiert)

| Datei | Pfad-Suffix |
|---|---|
| sg-gmbh-langversion/-kurzversion.txt | `gmbh-änderung2023/Musterstatuten GmbH (Lang-/Kurzversion).docx` |
| sg-ag-langversion/-kurzversion-vinkulierung/-minimalversion.txt | `ag-änderung/Musterstatuten AG (…).docx` |
| div-sg-errichtungsakt-gmbh-/-ag-gruendung.txt | `gmbh-neueintragung2023/öffentliche Urkunde, Gründung mit Barliberierung.docx` · `ag-neueintragung/…` |
| div-sg-zeichnungsschein-ag-gruendung/-kapitalerhoehung.txt | `ag-neueintragung/Zeichnungsschein mit Vollmacht (Gründung).docx` · `ag-änderung/Zeichnungsschein (Kapitalerhöhung).docx` |
| div-sg-wahlannahmeerklaerung.txt · div-sg-domizilhaltererklaerung.txt | `formulare-und-vorlagen2023/Vorlage Wahlannahmeerklärung allgemein.docx` · `…Domizilhaltererklärung.docx` |
| ke-sg-urkunde-gv-/-vr-ag.txt · ke-sg-kapitalerhoehungsbericht-ag.txt | `ag-änderung/öffentliche Urkunde, ordentliche Kapitalerhöhung, Generalversammlung/Verwaltungsrat.docx` · `Kapitalerhöhungsbericht AG.docx` |
| ke-sg-urkunde-gesellschafterversammlung-/-geschaeftsfuehrung-gmbh.txt · ke-sg-kapitalerhoehungsbericht-gmbh.txt | `gmbh-änderung2023/öffentliche Urkunde, Kapitalerhöhung, …` · `Kapitalerhöhungsbericht GmbH.docx` |
| (nur PDF) sg-lex-koller-erklaerung · div-sg-revisionsverzicht-optingout · div-sg-merkblätter | `formulare-und-vorlagen2023/Formular Lex Koller-Erklärung.pdf` · `…Verzicht auf Revision.pdf` · Merkblatt-Ordner |

## HReg Glarus
| Datei | Quelle |
|---|---|
| gl-gmbh-statuten-lang/-kurz.txt | gl.ch `/public/upload/assets/51011/…lang.docx` / `…/50078/…Kurzversion.docx` |
| gl-ag-statuten-lang/-kurz.txt | gl.ch `…/50103/…lang.docx` / `…/50102/…Kurzversion.docx` |

## Diverse (div-*)
| Datei | Quelle |
|---|---|
| div-zh-zeichnungsschein-ag-vorlage.txt | zh.ch `aktiengesellschaft/ag_vorlage_kapitalerhoehung_zeichnungsschein.docx` |
| div-zh-anmeldung-neueintragung-gmbh.txt | zh.ch `gmbh/gmbh_anmeldung_neueintragung.docx` |
| div-zh-errichtungsakt-/wahlannahme-/domizil-…txt | = ZH-Suite oben (Zweitabruf des div-Sweeps) |
| (nur PDF) div-zh-kmu-erklaerung-optingout · div-zh-merkblatt-neueintragung-gmbh · div-zh-zeichnungsschein-ag-muster | zh.ch `rechtsformuebergreifend/allg_merkblatt_kmu_erklaerung_opting_out.pdf` u. a. |
| (nur PDF) div-ar-zeichnungsschein-ag-vollmacht | ar.ch `…/327_-_AG_ZS_Vollmacht_KapErhoehung.pdf` |
| (nur PDF) div-be-merkblatt-neueintragung-ag · div-be-formular-aenderung-gmbh | hra.dij.be.ch |

## Pflege
Stände im [Parameter-Verfallsregister](../register/parameter-verfall.md)
(«Amtliche Muster-Suiten»). Bei Neuabruf: Datei ersetzen, Abrufdatum hier
nachführen, betroffene Dossier-Bausteine gegen den neuen Wortlaut prüfen.
