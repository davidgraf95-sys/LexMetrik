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
| Fedlex-Re-Pins terminiert: ZGB+ZPO 1.7.2026 (AS 2026 94/16); StGB 12.6.2026 (AS 2026 231) **VOLLZOGEN 12.6.2026** | `scripts/fedlex-cache.sh` ← `normen/fedlex-pin-nachverifikation-2026-06.md` | Voraus-Check 7.6.2026: KEINE zitierten Artikel betroffen — reine Re-Pins; StGB/ZPO-Dateien liegen als No-Suffix (n=0!). StGB am 12.6.2026 auf 20260612 gepinnt (Anker 477/477 stabil, zitierte Artikel normtext-identisch, nur Art. 354/357 geändert) | einmalig je Stichtag (`check:caches` + `check:zitate` danach) | 1.7.2026 |
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
| Streitwert-Formeln Miete (3-Jahres-Sperrfrist BGE 137 III 389 · 20×-Regel Art. 92 II ZPO) + Ordnungsbussen Art. 343 I lit. b/c (5000/1000) | nur Dossier (`recherche/ordentliche-klage-rechtsbegehren.md` § 4.4, § 2 R14) — nicht verdrahtet | ZPO-Cache 20250101 / BGE | bei ZPO-Re-Pin (nächster: 1.7.2026, s. Re-Pin-Zeile) | 1.7.2026 |

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
- **SG Gerichtskostenverordnung (GKV, sGS 941.12): in Vollzug BIS 30.6.2026**
  — ab 1.7.2026 gilt eine Nachfolgefassung → vor jeder Nutzung ab Juli 2026
  neu ziehen (Staffeln können ändern!).
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

## SG GKV — DIVERGENZ zum Sunset 30.6.2026 (6.6.2026)
Die Gebühren-Tiefenerfassung fand im aktuell publizierten konsolidierten
Text (gesetzessammlung.sg.ch 941.12) KEINE Sunset-Klausel und keine
publizierte Nachfolgefassung; der ✓2-Befund vom 5.6. («in Vollzug bis
30.6.2026», OrdoLex-Metadaten) bleibt als Vorbehalt stehen. → Am
1.7.2026 aktiv prüfen, welche Aussage zutrifft; bis dahin Hinweis in
zustaendigkeitKosten.SG unverändert lassen.

## FR Bezirksgericht Saane — PROVISORISCHE Adresse (Re-Audit 6.6.2026)
Route d'Englisberg 13, 1763 Granges-Paccot ist ein Provisorium (Umzug
April 2026, Dauer ~2 Jahre; vorher Route des Arsenaux 17). → ca. Anfang
2028 Rückzug/Definitivum prüfen.

