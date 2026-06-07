# Engine-Map — Code-Modul ↔ Wissens-Grundlage ↔ Status

**Angelegt 7.6.2026** (Bibliotheks-Audit): §11 verlangt engine-orientierte
Ablage — diese Map ist der Rückweg: *Welches Dossier trägt welches Modul,
und wie weit ist es?* Pflege: Wer ein Modul baut/ändert, führt seine Zeile
nach. Status-Vokabular = Katalog (`entwurf`/`geprüft`) + «Dossier only».

## Fristen & Daten

| Modul (src/lib/) | Grundlage (bibliothek/) | Stand |
|---|---|---|
| fristenEngine.ts · datumsUtils.ts | normen/feiertage-kantone-bj.md (Matrix, Doppelcheck 26/26) · register/quellen-register.md (Caches) | entwurf; Feiertage je Kanton vor «geprüft» gegen kantonales Recht |
| zpoFristen.ts (+zpoPresets) | normen/normtexte-zpo-zustaendigkeit.md · recherche/zpo-kosten-streitwert.md | entwurf |
| schkgFristen.ts (+schkgPresets) | normen/schkg-zustaendigkeit-regelwerk.md | entwurf; Art.-63-Doppelfix 6.6.2026 |
| erbFristen.ts | recherche/erbrecht-ausbau.md · normen/erbrecht-regelwerk.md | entwurf |
| fristenspiegel/ | recherche/fristenspiegel-konzept.md | entwurf (Orchestrierer über Engines) |
| allgemeineFrist.ts · sperrfristen.ts · kuendigungsfrist.ts · lohnfortzahlung.ts | recherche/arbeitsrecht-rechner.md (+kuendigungs-masken) | entwurf |

## Zuständigkeit & Rechtsmittel

| Modul | Grundlage | Stand |
|---|---|---|
| zustaendigkeit.ts · zustaendigkeitFahrplan.ts | normen/zpo-zustaendigkeit-regelwerk.md · normen/zustaendigkeit-engine-verifikation.md · behoerden/gerichtsbehoerden-kantone.md (+GOG) | entwurf; Bug-Check 4b (8 Fixes) + Ultra-Review 7.6. |
| bestimmeRechtsmittel (in zustaendigkeit.ts) | recherche/bgg-beschwerde-engine.md · behoerden/rechtsmittel-spruchkoerper-kantone.md | entwurf; BGG Stufe 2 offen (Plan B.8) |
| schkgZustaendigkeit.ts | normen/schkg-zustaendigkeit-regelwerk.md · recherche/schkg-existenzminimum-vorlagen.md | entwurf |
| strafZustaendigkeit.ts · strafRechtsmittel.ts | normen/stpo-zustaendigkeit-regelwerk.md · recherche/stpo-rechtsmittel.md | entwurf (Rechtsmittel teilverdrahtet) |

## Beträge & Quoten

| Modul | Grundlage | Stand |
|---|---|---|
| verzugszins.ts · teuerung.ts | (Normen direkt; LIK: Verfallsregister) | entwurf |
| erbteilung.ts | normen/erbrecht-regelwerk.md | entwurf; CHF-Beträge seit 7.6. in der Engine (§3) |
| streitwert.ts | recherche/zpo-kosten-streitwert.md | entwurf (gebaut 7.6.) |
| gebvKosten.ts | recherche/gebv-schkg-kostenrechner.md · kosten/ | entwurf (gebaut 7.6.); GebV-Revision AS 2025 630 vor Abnahme (Plan C.13a) |
| gewaehrleistung.ts · bruch.ts | (Normen direkt) | entwurf |

## Vorlagen-Plattform (vorlagen/)

| Modul | Grundlage | Stand |
|---|---|---|
| engine.ts · formatvorlagen.ts · Renderer (Pdf/Docx/Text) | 3 Grundlagen-Berichte 5.6.2026 (Formatvorlagen) | entwurf; HOCH-2-Nummerierungs- + Striche-Fix 7.6. |
| testament/pv/vorsorgeauftrag/vollmacht | je Grundlagen-Bericht 5.6.2026 | entwurf |
| arbeitsvertrag · kuendigung*.ts | recherche/arbeitsrecht-vorlagen.md · **kuendigungs-masken.md (Bauspez)** | entwurf (Familie komplett 6.6.) |
| mietvertrag.ts (+Untermiete) | Gutachten Mietvertrag 5.6. · recherche/untermietvertrag.md · recherche/mietrecht-ausbau.md | entwurf; VMWG-19a vor Abnahme (Plan C.13) |
| klageVereinfacht.ts · schlichtungsgesuchBs.ts | behoerden/schlichtungs*-Dossiers · gerichtsadressen | entwurf |
| gruendungsunterlagen.ts (Checklisten) | recherche/gesellschaftsgruendung.md · gmbh-gruendung.md · ag-gruendung.md | entwurf (Bug-Checks bestanden) |
| gruendungGmbhDokumente.ts | recherche/gruendungsdokumente-wortlaute.md · **muster/** (MANIFEST) · behoerden/notariate-kantone.md | entwurf; 2× reviewt 7.6. |
| gruendungAgDokumente.ts | dito + recherche/ag-gruendung-amtliche-vorlagen.md (**FAHRPLAN-AG-GRUENDUNG.md läuft!**) | **in Umbau** (Etappen 0–5) |
| kapitalerhoehung.ts | recherche/kapitalerhoehung-wortlaute.md · muster/ke-* | entwurf; 2× reviewt 7.6.; Stufe 2 = Plan 9c-OFFEN |
| notariate.ts | behoerden/notariate-kantone.md | entwurf; UR/AI/BL vor Abnahme |
| behoerden.ts | behoerden/* (Vollerfassungen) | je Adresse `stand`-Feld |

## Daten/Infra

| Modul | Grundlage | Stand |
|---|---|---|
| fedlex.ts + scripts/fedlex-cache.sh | register/quellen-register.md (Pins) | gepflegt; bei jedem neuen Gesetz Pin + Pflicht-Anker |
| startseiteConfig.ts (Katalog) | recherche/INDEX.md (geplant-Cluster) | SSoT §5; Zählung im Test |
| bge.ts | rechtsprechung/bge-register.md | entwurf; Teil-Regex-Fix 7.6. |
