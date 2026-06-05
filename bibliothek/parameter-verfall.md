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
| Fedlex-Konsolidierungsstände | `bibliothek/quellen-register.md` | je Gesetz dokumentiert | bei Rechtsänderungen (AS-Publikationen) | bei neuen Aufträgen |
| Beurkundungs-/Beglaubigungs-Hinweise (Kantone, Richtwerte CHF) | `src/lib/vorlagen/vorsorgeauftrag.ts` (`beurkundungsHinweis`) | dokumentierte Beispiele, 5.6.2026 | jährlich, niedrige Priorität | — |
| Verzugszins-Sätze (gesetzlich 5 %) | `src/lib/…verzugszins` | gesetzlich fix (Art. 104 OR) | nur bei Gesetzesänderung | — |

## Konventionen

1. Jeder datierte Wert trägt im Code ein `stand`-Feld oder einen datierten Kommentar.
2. Hinweise an Nutzer («quartalsweise prüfen») gehören zusätzlich in die UI, wo der
   Wert wirkt (Vorbild: Referenzzins-Hinweis im Mietvertrag).
3. Verfallene Prüfungen sind ein Deploy-Hindernis für die betroffene Vorlage, kein
   stiller Weiterbetrieb (§8).
