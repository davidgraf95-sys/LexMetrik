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
| Notariats-Anlaufstellen je Kanton (inkl. Listen-PDFs) | `src/lib/notariate.ts` ↔ `behoerden/notariate-kantone.md` | URLs geprüft 7.6.2026; Listen-Stände SZ 4/2026 · OW 5/2026 · NE 1/2026 · GE 6/2025; **UR/AI/BL unverifiziert** | **jährlich**; UR/AI/BL vorab klären | **UR/AI/BL: vor Abnahme** · Listen: Juni 2027 |
| Amtliche Muster-Suiten (Statuten/Urkunden/Erklärungen/KE) | `bibliothek/muster/` (MANIFEST.md) ← Bausteine der 3 Dokumentmappen | ZH 26.7.2024 · SG «…2023» · GL undatiert · EHRA 1.4.2017 (ÜBERHOLT, nur Referenz) | bei OR-/HRegV-Rechtsänderung neu abrufen + Baustein-Abgleich | mit nächstem OR-Pin |

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

## GebV SchKG (SR 281.35) — Konsolidierung 1.1.2026 nur signiert (6.6.2026)
- Die Engine-Staffel «Gebühr Zahlungsbefehl» (src/lib/schkgZustaendigkeit.ts,
  Art. 16 Abs. 1) ist am Filestore-HTML **Stand 1.1.2022** verifiziert.
- Es EXISTIERT eine Konsolidierung per **1.1.2026** (Änderung AS 2025/630),
  deren HTML-Manifestation nicht publiziert ist (nur signiertes PDF, JS-Shell).
  → Beträge VOR fachlicher Abnahme am signierten PDF gegenprüfen; UI weist
  den Vorbehalt aus. Prüfweg: Filestore cc/1996/2937_2937_2937/20260101.

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

