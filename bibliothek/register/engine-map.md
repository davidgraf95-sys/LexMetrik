# Engine-Map — Code-Modul ↔ Wissens-Grundlage ↔ Status

**Angelegt 7.6.2026** (Bibliotheks-Audit): §11 verlangt engine-orientierte
Ablage — diese Map ist der Rückweg: *Welches Dossier trägt welches Modul,
und wie weit ist es?* Pflege: Wer ein Modul baut/ändert, führt seine Zeile
nach. Status-Vokabular = Katalog (`entwurf`/`geprüft`) + «Dossier only».

## Fristen & Daten

| Modul (src/lib/) | Grundlage (bibliothek/) | Stand |
|---|---|---|
| fristenEngine.ts · datumsUtils.ts | normen/feiertage-kantone-bj.md (Matrix, Doppelcheck 26/26) · register/quellen-register.md (Caches) | entwurf; Feiertage je Kanton vor «geprüft» gegen kantonales Recht |
| zpoFristen.ts (+zpoPresets) | normen/normtexte-zpo-zustaendigkeit.md · recherche/zpo-kosten-streitwert.md · normen/zpo-fristen-bk-abgleich.md (BK-Zweitabgleich 10.6.2026: 29/31 ✓) | entwurf; BK-Befunde B-1+B-2 **UMGESETZT 10.6.2026 (Ja David)**; B-3 (Jahresfristen-Streit) bewusst offen via [UNGEKLÄRT]-Warnung |
| schkgFristen.ts (+schkgPresets) | normen/schkg-zustaendigkeit-regelwerk.md | entwurf; Art.-63-Doppelfix 6.6.2026 |
| erbFristen.ts | recherche/erbrecht-ausbau.md · normen/erbrecht-regelwerk.md | entwurf |
| fristenspiegel/ | recherche/fristenspiegel-konzept.md | entwurf (Orchestrierer über Engines) |
| allgemeineFrist.ts · sperrfristen.ts · kuendigungsfrist.ts · lohnfortzahlung.ts | recherche/arbeitsrecht-rechner.md (+kuendigungs-masken) · normen/arbeitsrecht-shk-abgleich.md (SHK-Zweitabgleich 10.6.2026: 58/66 ✓, Skalen SECO-belegt) | entwurf; SHK-Befunde B1–B6 ALLE **UMGESETZT 10.6.2026 (Ja David)** — Abgleich vollständig abgearbeitet |

## Zuständigkeit & Rechtsmittel

| Modul | Grundlage | Stand |
|---|---|---|
| zustaendigkeit.ts · zustaendigkeitFahrplan.ts | normen/zpo-zustaendigkeit-regelwerk.md · normen/zustaendigkeit-engine-verifikation.md · behoerden/gerichtsbehoerden-kantone.md (+GOG) | entwurf; Bug-Check 4b (8 Fixes) + Ultra-Review 7.6. |
| bestimmeRechtsmittel (in zustaendigkeit.ts) | recherche/bgg-beschwerde-engine.md · behoerden/rechtsmittel-spruchkoerper-kantone.md | entwurf; BGG Stufe 2 offen (Plan B.8) |
| schkgZustaendigkeit.ts | normen/schkg-zustaendigkeit-regelwerk.md · recherche/schkg-existenzminimum-vorlagen.md | entwurf |
| data/betreibungsaemter.ts + data/betreibung/ (Amts-Finder) | behoerden/betreibungskreise-kantone.md | entwurf; GEBAUT 7.6.2026 (Etappen 1–3: 10 Einheitsämter + 130 Kreis-Ämter in 13 Kt., Gemeinde-Karten 11 Kt.; LU/AG/SG Verzeichnis-Link §8) |
| strafZustaendigkeit.ts · strafRechtsmittel.ts | normen/stpo-zustaendigkeit-regelwerk.md · recherche/stpo-rechtsmittel.md | entwurf (Rechtsmittel teilverdrahtet) |

## Beträge & Quoten

| Modul | Grundlage | Stand |
|---|---|---|
| verzugszins.ts · teuerung.ts | (Normen direkt; LIK: Verfallsregister) · normen/verzugszins-praejudizien-abgleich.md (Präjudizien-Abgleich 10.6.2026: Hauptpfad ✓) | entwurf; alle 4 Abgleich-Befunde + Register-Hygiene **UMGESETZT 10.6.2026 (Ja David)** |
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
| klageVereinfacht.ts · schlichtungsgesuchBs.ts | behoerden/schlichtungs*-Dossiers · gerichtsadressen · recherche/ordentliche-klage-rechtsbegehren.md (Rechtsbegehren-Bausteine + 7 Härtungs-Kandidaten KV, 10.6.2026) | entwurf |
| gruendungsunterlagen.ts (Checklisten) | recherche/gesellschaftsgruendung.md · gmbh-gruendung.md · ag-gruendung.md | entwurf (Bug-Checks bestanden) |
| gruendungGmbhDokumente.ts | recherche/gruendungsdokumente-wortlaute.md · **muster/** (MANIFEST) · behoerden/notariate-kantone.md | entwurf; 2× reviewt 7.6. |
| gruendungAgDokumente.ts | dito + recherche/ag-gruendung-amtliche-vorlagen.md (**FAHRPLAN-AG-GRUENDUNG.md läuft!**) · recherche/ag-gruendung-musterabgleich.md (Zweitabgleich am Original 10.6.2026: 0 neu/0 Abweichung; Befunde B1–B8 UMGESETZT 10.6.2026, Ja David) | **in Umbau** (Etappen 0–5) |
| kapitalerhoehung.ts | recherche/kapitalerhoehung-wortlaute.md · muster/ke-* | entwurf; 2× reviewt 7.6.; Stufe 2 = Plan 9c-OFFEN |
| notariate.ts | behoerden/notariate-kantone.md | entwurf; UR/AI/BL vor Abnahme |
| behoerden.ts | behoerden/* (Vollerfassungen) | je Adresse `stand`-Feld |

## Daten/Infra

| Modul | Grundlage | Stand |
|---|---|---|
| fedlex.ts + scripts/fedlex-cache.sh | register/quellen-register.md (Pins) | gepflegt; bei jedem neuen Gesetz Pin + Pflicht-Anker |
| startseiteConfig.ts (Katalog) | recherche/INDEX.md (geplant-Cluster) | SSoT §5; Zählung im Test |
| bge.ts | rechtsprechung/bge-register.md | entwurf; Teil-Regex-Fix 7.6. |
| data/handelsregisteraemter.ts | behoerden/handelsregisteraemter-kantone.md | entwurf; verdrahtet 10.6.2026 (G3.4), zefix-Abgleich offen |

## Dossier-only & Abnahme-Blocker (G4.1, Stand 10.6.2026)

**Dossier-only** (Wissen liegt geordnet vor, ist aber NICHT verdrahtet — Bau-
Kandidaten nach G1-Rangliste, §0a beachten):

| Dossier | Inhalt | Verdrahtungs-Ziel |
|---|---|---|
| kosten/gerichtsgebuehren-kantone (Tiefenerfassung 26/26) · kosten/anwaltstarife-kantone.md | kantonale Kosten-/Tarifrahmen, zweifach geprüft | `prozesskosten` (Lücken-Rang 1) |
| recherche/bgg-beschwerde-engine.md (Decision Tree A–F) | BGG-Fristen/Zulässigkeit Stufe 2 | `bgg-fristen` (Rang 2; §0a) |
| ~~behoerden/handelsregisteraemter-kantone.md~~ | HR-Ämter 26 Kt. (zefix-Abgleich offen) | VERDRAHTET 10.6.2026 → `src/data/handelsregisteraemter.ts` (AG-/KE-Mappe) |
| kosten/notariatstarife-gruendung-kantone.md | Beurkundungstarife (ZH-123/SG offen) | teilverdrahtet (`notariatsgebuehrenGruendung.ts`) |
| recherche/zwei-kategorien-kapitalmodell (AG) · GmbH-G-Dossiers (G0/G2) | §0a-GESPERRT (David) | — |
| normen/erbrecht-regelwerk.md (Ausgleichung/Herabsetzung) | Regelwerk liegt | `erb-ausgleichung` (Rang 8) |

**Abnahme-Blocker** (verhindern `geprüft` quer durch die Engines):

1. **Feiertagsverzeichnis**: BJ-Doppelcheck 26/26 ✓, aber je Kanton noch
   nicht am kantonalen Erlass verifiziert (Verfallsregister «offen») —
   blockiert ALLE Fristen-Engines.
2. **GebV-Revision AS 2025 630** (15a/15b eSchKG): Diff erfasst, amtliche
   Verifikation vor Abnahme `betreibungskosten`/`gebvKosten.ts`.
3. **VMWG 19a** (seit 1.10.2025): mietvertrag.ts-Fundstelle korrigiert
   (`ed4365b`), fachliche Abnahme offen.
4. **Notariate UR/AI/BL** + **ZH-Nachtrag 123 / SG-«volle»-Lesart**
   (Tarife): vor Abnahme der Gründungs-Masken.
5. **Behörden-Stammdaten** (`stand`-Felder): je Adresse vor «geprüft»
   gegenprüfen (Strafgerichte: Erstrecherche, Doppelcheck offen).
6. **0 Abnahme-Protokolle**: `abnahme/<id>.md` existiert für kein Werkzeug —
   Gate `abnahmeGate.test.ts` ist scharf; Reihenfolge = KATALOG-ROADMAP A.
