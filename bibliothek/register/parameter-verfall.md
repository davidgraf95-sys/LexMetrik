# Parameter-Verfallsregister

Alle **datierten Parameter** im Code: Werte, die sich ausserhalb des Repos ändern
und darum regelmässig geprüft werden müssen. Wer einen neuen datierten Wert
verdrahtet, trägt ihn HIER ein (mit Fundstelle, Stand, Prüfrhythmus).

Stand des Registers: 7.6.2026 (Bibliotheks-Audit: 6 Gründungs-/Notariats-
Kandidaten nachgetragen, die in den Dossiers nur als «Verfallsregister-
Kandidat» markiert waren).

| Parameter | Fundstelle | Wert / Stand | Prüfrhythmus | Nächste Prüfung |
|---|---|---|---|---|
| Hypothekarischer Referenzzinssatz | `src/lib/vorlagen/mietvertrag.ts` (`MV_PARAMETER.referenzzinssatz`) | 1.25 % (Stand 2.6.2026) | **quartalsweise** (referenzzinssatz.admin.ch) | Anfang Sept. 2026 |
| MWST-Normalsatz | `src/lib/vorlagen/mietvertrag.ts` (`MV_PARAMETER.mwstSatz`) | 8.1 % (seit 1.1.2024) | bei Satzänderung | — |
| MWST-Normalsatz (Prozesskosten-Cockpit, MwSt auf Parteientschädigung) | `src/data/tarif/typen.ts` (`MWST_NORMALSATZ_PROZENT`) | 8.1 % (seit 1.1.2024, Art. 25 I MWSTG) | bei Satzänderung — **zusammen mit der Mietvertrags-Kopie pflegen** | — |
| Kantonale Mindestlöhne | `src/lib/vorlagen/arbeitsvertrag.ts` (`AV_MINDESTLOEHNE`) | je Eintrag datiert | **jährlich** (Indexierung per 1.1.) | Jan. 2027 |
| Formularpflicht-Kantone (Mietzins) | `src/lib/vorlagen/mietvertrag.ts` (`MV_FORMULARPFLICHT`) | BWO 4.2.2026 | jährlich; **BE ändert dynamisch per 1.11.2026** | **1.11.2026 (BE!)** |
| LIK-Indexreihen | `src/data/likReihe.ts` (`LIK_REIHEN`, bis `LIK_LETZTER_MONAT`) | bis 2026-05 (BFS, abgerufen 5.6.2026) | monatlich/bei Bedarf — `scripts/lik-reihe-generieren.py` | bei Nutzerbedarf |
| Feiertagsverzeichnis (EJPD) | `src/data/zpoFeiertage.ts` | BJ-Liste Stand 2011; **Doppelcheck 26/26 am 6.6.2026** (7 Korrekturen + Fussnotenregeln → `normen/feiertage-kantone-bj.md`) | je Kanton gegen geltendes kantonales Recht vor «geprüft»; bei neuer BJ-Publikation Matrix neu abgleichen | offen (kantonale Erlasse) |
| BWO-Verzeichnis Miet-Schlichtungsbehörden | noch nicht verdrahtet (Bibliothek: `schlichtungsbehoerden-kantone.md`) | PDF-Stand 13.02.2026 | **jährlich** | Feb. 2027 |
| Behörden-Stammdaten | `src/lib/vorlagen/behoerden.ts` | je Adresse `stand`-Feld (BS: 5.6.2026) | vor jeder «geprüft»-Hebung; sonst jährlich | — |
| Fedlex-Konsolidierungsstände | `bibliothek/register/quellen-register.md` | je Gesetz dokumentiert | bei Rechtsänderungen (AS-Publikationen) | bei neuen Aufträgen |
| Beurkundungs-/Beglaubigungs-Hinweise (Kantone, Richtwerte CHF) | `src/lib/vorlagen/vorsorgeauftrag.ts` (`beurkundungsHinweis`) | dokumentierte Beispiele, 5.6.2026 | jährlich, niedrige Priorität | — |
| Verzugszins-Sätze (gesetzlich 5 %) | `src/lib/…verzugszins` | gesetzlich fix (Art. 104 OR) | nur bei Gesetzesänderung | — |
| HReg-Gebühren (Neueintragung 420/280/210 …) | `src/lib/gruendungsunterlagen.ts` + Masken-/Mappen-Texte | GebV-HReg-Anhang @ 1.1.2021 (einzige Konsolidierung, Cache) | **jährlich** (Verordnungs-Pauschalen) | Jan. 2027 |
| Zulässige Fremdwährungen Kapital (GBP/EUR/USD/JPY) | Gates/Hinweise `gruendungsunterlagen.ts` + Dokumentmappen | Anhang 3 HRegV @ 1.1.2025 (Cache verbatim) | bei HRegV-Änderung (BR-Kompetenz) | mit nächstem HRegV-Pin |
| Emissionsabgabe (1 %, Freibetrag CHF 1 Mio.) | `gruendungsunterlagen.ts` (`emissionsabgabe`, `EMISSIONSABGABE_FREIBETRAG_CHF`) | Art. 6 Abs. 1 lit. h / 8 Abs. 1 StG @ 1.1.2024 (Cache) | jährlich — **politisch volatil** (Abschaffungs-Vorlagen) | Jan. 2027 |
| MWST-Pflicht-Schwellen (100k; 150k gemeinnützig) | nur Dossier (`recherche/gesellschaftsgruendung.md` Teil 5) — NICHT verdrahtet | ESTV-Abruf 6.6.2026; MWSTG-Cache-Verifikation offen | jährlich + zwingend vor Verdrahtung | vor Verdrahtung |
| Notariats-Anlaufstellen je Kanton (inkl. Listen-PDFs) | `src/lib/notariate.ts` ↔ `behoerden/notariate-kantone.md` | URLs geprüft 7.6.2026; Listen-Stände SZ 4/2026 · OW 5/2026 · NE 1/2026 · GE 6/2025; **UR/AI/BL verifiziert 7.6.2026 (System amtlich; Personenlisten teils nur offline)** | **jährlich**; UR/AI/BL vorab klären | **UR/AI/BL: vor Abnahme** · Listen: Juni 2027 |
| Gesetzgebungs-Monitoring: «kleine BGG-Revision» | `bestimmeRechtsmittel` (Art. 74/100/46-Behauptungen) ← `normen/zustaendigkeit-engine-verifikation.md` | Botschaft 5.12.2025, parlamentarisches Stadium (Stand 6.6.2026, bj.admin.ch); **BGG-Kons. 1.4.2026 war NICHT diese Revision** (Energierecht AS 2026 99, geprüft 7.6.2026) | bei AS-Publikation: Art. 74/100/46 neu prüfen | bei Inkrafttreten |
| Fedlex-Re-Pins terminiert: ZGB+ZPO 1.7.2026 **VOLLZOGEN 1.7.2026** (AS 2026 94/16); StGB 12.6.2026 (AS 2026 231) **VOLLZOGEN 12.6.2026** | `scripts/fedlex-cache.sh` ← `normen/fedlex-pin-nachverifikation-2026-06.md` | **ZGB→20260701/html-1** (FALLE: n=0 ist STALE ohne AS 2026 94 art_302 — nur html-1 kanonisch; 6 Anker byte-identisch, Inventar 1099→1099). **ZPO→20260701/no-suffix** (14 Anker operativ byte-identisch, art_314 nur Fussnoten-Reklassifikation; neu art_260a/b). Volltext-Snapshots + Struktur + Manifest gezielt regeneriert (`--erlass=zgb,zpo`), Engine-golden byte-gleich, adversarial QS-GP. `check:caches`/`check:zitate` grün 1.7.2026 | einmalig je Stichtag (`check:caches`+`check:zitate`+ggf. `normtext --erlass`) | Jan. 2027 |
| HG-Bestand & internationale Spruchkörper (Art. 6 IV lit. c ZPO) | `zustaendigkeit.ts` (HG-Weichen) ← dito | ZH/BE/AG/SG, Stand 6.6.2026 | bei kantonaler Errichtung nachführen | — |
| AHV/IV/EO Selbständige (Satz, sinkende Skala) + Bundes-Verzugszinsen | nur Dossiers (`gesellschaftsgruendung.md` Teil 5; `recherche/INDEX.md`-Nachträge) — nicht verdrahtet | 10,0 % / Skala < CHF 60'500 (Merkblatt 2.02, 2026); EFD 4,0 % | **jährlich** + vor Verdrahtung | Jan. 2027 |
| Amtliche Muster-Suiten (Statuten/Urkunden/Erklärungen/KE) | `bibliothek/muster/` (MANIFEST.md) ← Bausteine der 3 Dokumentmappen | ZH 26.7.2024 · SG «…2023» · GL undatiert · EHRA 1.4.2017 (ÜBERHOLT, nur Referenz) | bei OR-/HRegV-Rechtsänderung neu abrufen + Baustein-Abgleich | mit nächstem OR-Pin |
| Notariatstarife AG-Gründung (Beurkundung Errichtungsakt) je Kanton | nur Dossier (`kosten/notariatstarife-gruendung-kantone.md`) — NICHT verdrahtet | ZH NotGebV LS 243 (Nachtrag-123-Beleg offen) · BE GebVN 169.81 @ 1.3.2022 (Anhang 4) · LU BeurkGebV 258 @ 1.1.2022 (§ 37) · SG GebT 821.5 @ **1.1.2026** (Nr. 60.13) · BS Notariatstarif 292.400 @ 1.7.2016 (Ziff. 33) · AG Dekret 295.250 @ 1.1.2025 (**Gründung NICHT tarifiert → Aufwand**); alle netto, + MWST 8,1 % | jährlich + vor Verdrahtung; **AG nicht deterministisch (Aufwand)**; ZH-123-Verifikation zwingend vor «geprüft» | **ZH-123 + SG-MWST: vor Abnahme** |
| Handelsregisterämter-Adressen 26 Kt. | `src/data/handelsregisteraemter.ts` ↔ `behoerden/handelsregisteraemter-kantone.md` (verdrahtet 10.6.2026, HrAmtHinweis) | amtliche kantonale Behördenseiten, Abruf 7.6.2026 (zefix-REST-API der EHRA: 401, Abgleich offen) | jährlich; **ZG-Adresse (Umzug 10/2025) prüfen**; zefix-Abgleich sobald API-Zugang | ZG + zefix: vor Abnahme |
| **ZH-Betreibungskreis-Reorganisation** (56 → 34 oder 18 Kreise) | nur Dossier (`behoerden/betreibungskreise-kantone.md`) — nicht verdrahtet | RR-Beschluss/Vernehmlassung 5.11.2025, NOCH NICHT in Kraft; aktuell massgeblich: Ämterliste Betreibungsinspektorat | **halbjährlich** bis Inkrafttreten; danach Ämterliste + ZH-Zuordnung komplett neu erfassen | Jan. 2027 |
| Betreibungsämter-Stammdaten 26 Kt. (130 Kreis-Ämter in 13 Kt. + 10 Einheitsämter, Gemeinde-Karten 11 Kt.) | `src/data/betreibungsaemter.ts` + `src/data/betreibung/aemterKantone.json` ↔ `behoerden/betreibungskreise-kantone.md` — **VERDRAHTET 7.6.2026 (Etappen 1–3)** | Extraktion + adversariale Stichproben 7.6.2026; gemeindescharf: ZH/FR/SO/AR/GR/TG/TI/VD/ZG/UR/SZ. **Verzeichnis-Link (keine belastbare Liste, §8): LU** (gerichte.lu.ch→Verbands-Plattform, Fusionen) · **AG** (~14/19 Kreise, Verbands-URL tot) · **SG** (Negativbefund: kein amtl. Verzeichnis) · **ZG-PDF Stand 2/2023** (jüngste amtl. Gesamtliste) · **BE: «Avenir Berne romande» (Moutier 1.1.2026 → Jura/Biel-Umzüge bis ~2029)** | **jährlich**; ZH bei Kreis-Reorganisation KOMPLETT neu; ZG-PDF + AG/LU bei amtlicher Gesamtliste nachziehen | Jan. 2027 (ZH halbjährlich, s. eigene Zeile) |
| ZH-Merkblatt-/Formular-Stände AG-Gründung einzeln (Checklisten + Merkblatt Neueintragung + Opting-out 11.12.2024 · formelle Anforderungen 7.1.2025 · Lex-Koller 1.1.2025 · VR-Pflichten 3.12.2025 · private Register 17.2.2026) | Gates/Checklisten in `gruendungsunterlagen.ts`, Bausteine `gruendungAgDokumente.ts` (D13/D17/D20/D21/D23/D24, `AE11_opting_out`, `LEXKOLLER_SCHEMA`) ← `recherche/ag-gruendung-musterabgleich.md` (Zweitabgleich 10.6.2026) | je Dokument datiert (s. links); ergänzt die Suite-Zeile oben (nur 26.7.2024) | bei OR-/HRegV-Rechtsänderung neu abrufen + Baustein-Abgleich | mit nächstem OR-Pin |
| MWST-Normalsatz in «zzgl. MwSt.»-Rechtsbegehren-Bausteinen | nur Dossier (`recherche/ordentliche-klage-rechtsbegehren.md` § 2 R6) — NICHT verdrahtet; Quellen nennen überholte 7,7 %/8 %, Dossier beziffert bewusst NIE (Engine soll parametrisieren: heute 8,1 %, s. MWST-Zeile oben) | 10.6.2026 | jährlich + zwingend vor Bau der Vorlage «ordentliche Klage» | vor Verdrahtung |
| BGer-Praxis Vermieter-Klage Mietzinserhöhung = Feststellungsklage (4A_616/2020) als Begehren-Weiche | nur Dossier (`recherche/ordentliche-klage-rechtsbegehren.md` § 4.4) — nicht verdrahtet | Urteil 6.5.2021 (via Privatquelle 2022) | bei Miet-Dossier-Pflege / neuem BGE | vor Verdrahtung |
| Zulässigkeit abstraktes Erbteilungs-Begehren unter eidg. ZPO (BGer offen) | nur Dossier (`recherche/ordentliche-klage-rechtsbegehren.md` § 4.5) | Quellen-Stand 2017/2018 | vor Bau einer Erbteilungs-Klage-Vorlage neu prüfen | vor Verdrahtung |
| Streitwert-Formeln Miete (3-Jahres-Sperrfrist BGE 137 III 389 · 20×-Regel Art. 92 II ZPO) + Ordnungsbussen Art. 343 I lit. b/c (5000/1000) | nur Dossier (`recherche/ordentliche-klage-rechtsbegehren.md` § 4.4, § 2 R14) — nicht verdrahtet | ZPO-Cache **20260701** / BGE — beim ZPO-Re-Pin 1.7.2026 verifiziert: Fristen-/Zuständigkeits-Anker (142–148, 314, 321, 92 II i.V.m. 2–94a) byte-identisch, Dossier-Werte unverändert | erneut vor Verdrahtung / bei nächstem ZPO-Re-Pin | vor Verdrahtung |

<!-- AUTO fedlex-wiedervorlage -->

## Künftige Fedlex-Konsolidierungen (datierte Wiedervorlage, P1-c)

Maschinell aus dem amtlichen Fedlex-SPARQL-Graphen (`dateApplicability` >
Laufdatum) je Bund-Volltext-Erlass geerntet — Fedlex führt künftige Fassungen
bereits im Triplestore. Jede Zeile ist eine angekündigte künftige Fassung; am
genannten Tag `scripts/fedlex-cache.sh` neu pinnen + §7-Verifikation. Massgeblich
bleibt stets die amtliche Quelle. NICHT von Hand editieren — Block wird von
`npm run gen:fedlex-wiedervorlage` regeneriert. Stand des Laufs: 2026-07-05.

| Erlass (künftige Fassung) | Fundstelle | Aktuell gepinnt | Rhythmus | Nächste Prüfung |
|---|---|---|---|---|
| Künftige Fassung BüV (SR 141.01) | `scripts/fedlex-cache.sh` (BUEV) | gepinnt 9.7.2019 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.8.2026 |
| Künftige Fassung ZEMIS-V (SR 142.513) | `scripts/fedlex-cache.sh` (ZEMIS_V) | gepinnt 12.6.2026 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.8.2026 |
| Künftige Fassung FZV (SR 831.425) | `scripts/fedlex-cache.sh` (FZV) | gepinnt 1.3.2024 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.8.2026 |
| Künftige Fassung BVV 2 (SR 831.441.1) | `scripts/fedlex-cache.sh` (BVV_2) | gepinnt 1.1.2025 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.8.2026 |
| Künftige Fassung KVV (SR 832.102) | `scripts/fedlex-cache.sh` (KVV) | gepinnt 1.7.2026 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.8.2026 |
| Künftige Fassung KLV (SR 832.112.31) | `scripts/fedlex-cache.sh` (KLV) | gepinnt 1.7.2026 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.8.2026 |
| Künftige Fassung AVIV (SR 837.02) | `scripts/fedlex-cache.sh` (AVIV) | gepinnt 1.1.2026 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.8.2026 |
| Künftige Fassung OR (SR 220) | `scripts/fedlex-cache.sh` (OR) | gepinnt 1.1.2026 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.10.2026 |
| Künftige Fassung StGB (SR 311.0) | `scripts/fedlex-cache.sh` (STGB) | gepinnt 12.6.2026 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.10.2026 |
| Künftige Fassung BBG (SR 412.10) | `scripts/fedlex-cache.sh` (BBG) | gepinnt 1.3.2025 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.10.2026 |
| Künftige Fassung FIDLEG (SR 950.1) | `scripts/fedlex-cache.sh` (FIDLEG) | gepinnt 1.3.2024 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.10.2026 |
| Künftige Fassung KAG (SR 951.31) | `scripts/fedlex-cache.sh` (KAG) | gepinnt 1.3.2024 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.10.2026 |
| Künftige Fassung BankG (SR 952.0) | `scripts/fedlex-cache.sh` (BANKG) | gepinnt 1.1.2024 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.10.2026 |
| Künftige Fassung FINIG (SR 954.1) | `scripts/fedlex-cache.sh` (FINIG) | gepinnt 1.3.2024 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.10.2026 |
| Künftige Fassung GwG (SR 955.0) | `scripts/fedlex-cache.sh` (GWG) | gepinnt 1.3.2024 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.10.2026 |
| Künftige Fassung BEG (SR 957.1) | `scripts/fedlex-cache.sh` (BEG) | gepinnt 1.1.2023 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.10.2026 |
| Künftige Fassung ChemRRV (SR 814.81) | `scripts/fedlex-cache.sh` (CHEMRRV) | gepinnt 1.1.2026 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.12.2026 |
| Künftige Fassung AIG (SR 142.20) | `scripts/fedlex-cache.sh` (AIG) | gepinnt 12.6.2026 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.1.2027 |
| Künftige Fassung AsylG (SR 142.31) | `scripts/fedlex-cache.sh` (ASYLG) | gepinnt 12.6.2026 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.1.2027 |
| Künftige Fassung VG (SR 170.32) | `scripts/fedlex-cache.sh` (VG) | gepinnt 15.6.2025 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.1.2027 |
| Künftige Fassung RVOV (SR 172.010.1) | `scripts/fedlex-cache.sh` (RVOV) | gepinnt 1.3.2026 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.1.2027 |
| Künftige Fassung VwVG (SR 172.021) | `scripts/fedlex-cache.sh` (VWVG) | gepinnt 1.7.2022 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.1.2027 |
| Künftige Fassung BPG (SR 172.220.1) | `scripts/fedlex-cache.sh` (BPG) | gepinnt 1.1.2024 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.1.2027 |
| Künftige Fassung BPV (SR 172.220.111.3) | `scripts/fedlex-cache.sh` (BPV) | gepinnt 1.7.2026 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.1.2027 |
| Künftige Fassung VGG (SR 173.32) | `scripts/fedlex-cache.sh` (VGG) | gepinnt 12.6.2026 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.1.2027 |
| Künftige Fassung MSchV (SR 232.111) | `scripts/fedlex-cache.sh` (MSCHV) | gepinnt 1.7.2025 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.1.2027 |
| Künftige Fassung DesV (SR 232.121) | `scripts/fedlex-cache.sh` (DESV) | gepinnt 1.7.2025 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.1.2027 |
| Künftige Fassung PatG (SR 232.14) | `scripts/fedlex-cache.sh` (PATG) | gepinnt 1.7.2025 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.1.2027 |
| Künftige Fassung MWSTV (SR 641.201) | `scripts/fedlex-cache.sh` (MWSTV) | gepinnt 1.1.2025 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.1.2027 |
| Künftige Fassung EnG (SR 730.0) | `scripts/fedlex-cache.sh` (ENG) | gepinnt 1.4.2026 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.1.2027 |
| Künftige Fassung VZV (SR 741.51) | `scripts/fedlex-cache.sh` (VZV) | gepinnt 1.1.2026 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.1.2027 |
| Künftige Fassung EBG (SR 742.101) | `scripts/fedlex-cache.sh` (EBG) | gepinnt 1.1.2026 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.1.2027 |
| Künftige Fassung HMG (SR 812.21) | `scripts/fedlex-cache.sh` (HMG) | gepinnt 1.1.2025 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.1.2027 |
| Künftige Fassung IVG (SR 831.20) | `scripts/fedlex-cache.sh` (IVG) | gepinnt 1.1.2026 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.1.2027 |
| Künftige Fassung BankV (SR 952.02) | `scripts/fedlex-cache.sh` (BANKV) | gepinnt 1.1.2025 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.1.2027 |
| Künftige Fassung ERV (SR 952.03) | `scripts/fedlex-cache.sh` (ERV) | gepinnt 24.1.2025 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.1.2027 |
| Künftige Fassung FINMAG (SR 956.1) | `scripts/fedlex-cache.sh` (FINMAG) | gepinnt 1.4.2025 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.1.2027 |
| Künftige Fassung FINMA-GebV (SR 956.122) | `scripts/fedlex-cache.sh` (FINMA_GEBV) | gepinnt 1.3.2024 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.1.2027 |
| Künftige Fassung BVV 3 (SR 831.461.3) | `scripts/fedlex-cache.sh` (BVV3) | gepinnt 1.1.2025 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.6.2027 |
| Künftige Fassung BVG (SR 831.40) | `scripts/fedlex-cache.sh` (BVG) | gepinnt 1.1.2025 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 26.9.2027 |
| Künftige Fassung GSchV (SR 814.201) | `scripts/fedlex-cache.sh` (GSCHV) | gepinnt 1.12.2025 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.1.2028 |
| Künftige Fassung KVG (SR 832.10) | `scripts/fedlex-cache.sh` (KVG) | gepinnt 1.7.2026 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.1.2028 |
| Künftige Fassung EOV (SR 834.11) | `scripts/fedlex-cache.sh` (EOV) | gepinnt 1.6.2026 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.1.2028 |
| Künftige Fassung FAV (SR 784.101.2) | `scripts/fedlex-cache.sh` (FAV) | gepinnt 15.8.2024 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.7.2028 |
| Künftige Fassung BV (SR 101) | `scripts/fedlex-cache.sh` (BV) | gepinnt 3.3.2024 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.1.2029 |
| Künftige Fassung DBG (SR 642.11) | `scripts/fedlex-cache.sh` (DBG) | gepinnt 1.1.2026 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.1.2029 |
| Künftige Fassung StHG (SR 642.14) | `scripts/fedlex-cache.sh` (STHG) | gepinnt 1.1.2025 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.1.2029 |
| Künftige Fassung ELG (SR 831.30) | `scripts/fedlex-cache.sh` (ELG) | gepinnt 1.1.2026 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.1.2029 |
| Künftige Fassung FinfraG (SR 958.1) | `scripts/fedlex-cache.sh` (FINFRAG) | gepinnt 1.2.2024 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.1.2029 |
| Künftige Fassung BetmG (SR 812.121) | `scripts/fedlex-cache.sh` (BETMG) | gepinnt 1.9.2023 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.8.2029 |
| Künftige Fassung VRV (SR 741.11) | `scripts/fedlex-cache.sh` (VRV) | gepinnt 1.7.2026 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.1.2031 |
| Künftige Fassung VTS (SR 741.41) | `scripts/fedlex-cache.sh` (VTS) | gepinnt 1.7.2026 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.1.2031 |
| Künftige Fassung GlG (SR 151.1) | `scripts/fedlex-cache.sh` (GLG) | gepinnt 1.7.2020 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.7.2032 |
| Künftige Fassung VKL (SR 832.104) | `scripts/fedlex-cache.sh` (VKL) | gepinnt 1.6.2025 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.7.2032 |
| Künftige Fassung AHVG (SR 831.10) | `scripts/fedlex-cache.sh` (AHVG) | gepinnt 1.1.2026 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.1.2034 |
| Künftige Fassung AHVV (SR 831.101) | `scripts/fedlex-cache.sh` (AHVV) | gepinnt 1.1.2026 | einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7) | 1.1.2034 |

<!-- /AUTO fedlex-wiedervorlage -->

## Konventionen

1. Jeder datierte Wert trägt im Code ein `stand`-Feld oder einen datierten Kommentar.
2. Hinweise an Nutzer («quartalsweise prüfen») gehören zusätzlich in die UI, wo der
   Wert wirkt (Vorbild: Referenzzins-Hinweis im Mietvertrag).
3. Verfallene Prüfungen sind ein Deploy-Hindernis für die betroffene Vorlage, kein
   stiller Weiterbetrieb (§8).

## NE: Umzug Tribunal régional Montagnes/Val-de-Ruz (Sommer 2026)
- **Was:** TR La Chaux-de-Fonds zieht von Av. Léopold-Robert 10 auf
  **Av. Léopold-Robert 63** (Postgebäude); Akteneinsicht 27.4.–27.5.2026
  gesperrt; «Umzug im Sommer 2026». NICHT das Tribunal cantonal!
- **Prüfen:** ab Juli 2026 auf ne.ch, vor jeder Stammdaten-Übernahme NE.
- **Quelle:** ne.ch/Presse (Doppelcheck-Durchgang 5.6.2026).

## Terminierte Nachfolgefassungen kantonaler Kosten-Erlasse (✓2-Befund 5.6.2026)
- **SG Gerichtskostenverordnung (GKV, sGS 941.12): Nachfolgefassung seit 1.7.2026 in Vollzug — AUFGELÖST + verifiziert 1.7.2026.**
  Nachtrag vom 5.12.2025 (nGS 2026-001), LexWork `current_version` 3863. Art. 10
  (Entscheidgebühren-Rahmen Fr. 500.– bis Fr. 6000.–) und Art. 11 (Streitwert-%-
  Decke: über 50k→höchstens 200 %, über 100k→300 %, je weitere 250k→je +100 %)
  sind **wortgleich zur Vorfassung** → Rechner-Werte (`gerichtskosten.ts` SG)
  unverändert korrekt. Verifiziert gegen die amtliche in-Kraft-Fassung
  (`gesetzessammlung.sg.ch/api/de/versions/3863/pdf_file`, pdfjs-Extraktion Art. 10/11,
  1.7.2026). Nächste periodische Prüfung: Juni 2027 (kein publizierter Sunset).
- **GR Honorarverordnung (HV, BR 310.250): bis 31.12.2026** (Nachfolge 1.1.2027).
- **BE EAV (BSG 168.711, amtliche Anwälte): bis 31.12.2026** (Nachfolge 1.1.2027).
- Quelle: OrdoLex-API `current_version`-Metadaten (Doppelcheck 5.6.2026).

## GebV SchKG (SR 281.35) — ~~Konsolidierung 1.1.2026 nur signiert~~ KORRIGIERT (S8, 7.6.2026)
- ~~«HTML-Manifestation nicht publiziert (nur signiertes PDF)»~~ — **widerlegt
  7.6.2026:** Das Filestore-HTML der Konsolidierung 20260101 existiert, nur
  OHNE das übliche «-N»-Suffix im Dateinamen; seither reproduzierbar gepinnt
  (`fedlex-cache.sh`, Eintrag `gebv_schkg`, Anker art_16/art_15_a geprüft).
- Bereits 6.6.2026 hatte die Kostenrechner-Recherche dieselbe Fundstelle
  (Voll-Diff 2022↔2026: nur Art. 15a/15b geändert) — dieser Registerblock
  hinkte hinterher. Der UI-Vorbehalt in zustaendigkeitKosten kann nach
  Davids Abnahme des Kostenrechner-Dossiers fallen.

## SG GKV — DIVERGENZ zum Sunset 30.6.2026 — AUFGELÖST 1.7.2026
Am 5./6.6.2026 fand die Gebühren-Tiefenerfassung im damals publizierten
konsolidierten Text KEINE Sunset-Klausel und keine publizierte Nachfolge; die
OrdoLex-Metadaten «in Vollzug bis 30. Juni 2026» blieben als Vorbehalt stehen.
**Auflösung 1.7.2026:** Die LexWork-API führt seit heute `current_version` 3863
«Aktuelle Fassung in Vollzug seit: 01.07.2026 (Erlassdatum 05.12.2025)» — die
Nachfolge existierte real (Nachtrag 5.12.2025, nGS 2026-001), war am 6.6. nur
noch nicht in der Konsolidierung sichtbar. Art. 10/11 sind wortgleich zur
Vorfassung (s. Abschnitt «Terminierte Nachfolgefassungen» oben) → die Rechner-
Werte (`zustaendigkeitKosten.SG` / `gerichtskosten.ts`) bleiben unverändert
korrekt; der UI-Vorbehalt kann unabhängig davon nach Davids Abnahme fallen.

## FR Bezirksgericht Saane — PROVISORISCHE Adresse (Re-Audit 6.6.2026)
Route d'Englisberg 13, 1763 Granges-Paccot ist ein Provisorium (Umzug
April 2026, Dauer ~2 Jahre; vorher Route des Arsenaux 17). → ca. Anfang
2028 Rückzug/Definitivum prüfen.

