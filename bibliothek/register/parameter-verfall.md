# Parameter-Verfallsregister

Alle **datierten Parameter** im Code: Werte, die sich ausserhalb des Repos ändern
und darum regelmässig geprüft werden müssen. Wer einen neuen datierten Wert
verdrahtet, trägt ihn HIER ein (mit Fundstelle, Stand, Prüfrhythmus).

Stand des Registers: 5.6.2026.

| Parameter | Fundstelle | Wert / Stand | Prüfrhythmus | Nächste Prüfung |
|---|---|---|---|---|
| Hypothekarischer Referenzzinssatz | `src/lib/vorlagen/mietvertrag.ts` (`MV_PARAMETER.referenzzinssatz`) | 1.25 % (Stand 2.6.2026) | **quartalsweise** (referenzzinssatz.admin.ch) | Anfang Sept. 2026 |
| MWST-Normalsatz | `src/lib/vorlagen/mietvertrag.ts` (`MV_PARAMETER.mwstSatz`) | 8.1 % (seit 1.1.2024) | bei Satzänderung | — |
| Kantonale Mindestlöhne | `src/lib/vorlagen/arbeitsvertrag.ts` (`AV_MINDESTLOEHNE`) | je Eintrag datiert | **jährlich** (Indexierung per 1.1.) | Jan. 2027 |
| Formularpflicht-Kantone (Mietzins) | `src/lib/vorlagen/mietvertrag.ts` (`MV_FORMULARPFLICHT`) | BWO 4.2.2026 | jährlich; **BE ändert dynamisch per 1.11.2026** | **1.11.2026 (BE!)** |
| LIK-Indexreihen | `src/data/likReihe.ts` (`LIK_REIHEN`, bis `LIK_LETZTER_MONAT`) | bis 2026-05 (BFS, abgerufen 5.6.2026) | monatlich/bei Bedarf — `scripts/lik-reihe-generieren.py` | bei Nutzerbedarf |
| Feiertagsverzeichnis (EJPD) | `src/data/zpoFeiertage.ts` | Stand 2011 (veraltbar, kantonales Recht massgeblich) | bei Gelegenheit / je Kanton vor «geprüft» | offen |
| BWO-Verzeichnis Miet-Schlichtungsbehörden | noch nicht verdrahtet (Bibliothek: `schlichtungsbehoerden-kantone.md`) | PDF-Stand 13.02.2026 | **jährlich** | Feb. 2027 |
| Behörden-Stammdaten | `src/lib/vorlagen/behoerden.ts` | je Adresse `stand`-Feld (BS: 5.6.2026) | vor jeder «geprüft»-Hebung; sonst jährlich | — |
| Fedlex-Konsolidierungsstände | `bibliothek/register/quellen-register.md` | je Gesetz dokumentiert | bei Rechtsänderungen (AS-Publikationen) | bei neuen Aufträgen |
| Beurkundungs-/Beglaubigungs-Hinweise (Kantone, Richtwerte CHF) | `src/lib/vorlagen/vorsorgeauftrag.ts` (`beurkundungsHinweis`) | dokumentierte Beispiele, 5.6.2026 | jährlich, niedrige Priorität | — |
| Verzugszins-Sätze (gesetzlich 5 %) | `src/lib/…verzugszins` | gesetzlich fix (Art. 104 OR) | nur bei Gesetzesänderung | — |

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

