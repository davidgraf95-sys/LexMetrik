# JoelNiklaus/SwissLegalTranslations (SwiLTra-Bench) — Erstrecherche

**Abnahme-Status: Erstrecherche** (Sidequest David 16.7.2026; Kern-Behauptungen doppelt belegt: README/Dataset-Card + Code-Datei bzw. `gh api /license`). Keine Übernahme in Code/Stammdaten ohne fachliche Abnahme (§7). Schwester-Dossier: [omnilex-ai-und-kaggle-legal-ir-2026-07-16.md](omnilex-ai-und-kaggle-legal-ir-2026-07-16.md).

**Quelle + Stand (Abruf 16.7.2026):**
- Repo: <https://github.com/JoelNiklaus/SwissLegalTranslations> — Python, ★7, letzter Push 4.3.2025, `size:69 KB` (Code-only, keine Daten im Repo).
- Paper: SwiLTra-Bench (Niklaus et al. 2025), <https://arxiv.org/abs/2503.01372> (Paper-Lizenz **CC-BY-4.0**).
- Erzeugte HF-Datasets: `fedlex/SwissLawTranslations` (Beispielcode im laws-README), Sammel-Benchmark `joelniklaus/SwiLTra-Bench` (>180k aligned pairs; gated/401).
- Autor: Joel Niklaus (bekannt aus Memory `LexFind-clex-Quelle` / `OpenCaseLaw-Quellen`); **gefördert vom Schweizer Bundesgericht** (laut Dataset-Card).

## Was ist das Repo

Sammel-Repo mit **Python-Code, der Datensätze für Schweizer Rechts-Übersetzungen generiert** (Grundlage des SwiLTra-Bench-Benchmarks für LLM-Übersetzung). Drei Strecken: `laws/` (Bundeserlasse), `decision-summaries/` (BGE-Regesten), `press-releases/` (Medienmitteilungen) — jeweils parallel in DE/FR/IT (+RM/EN bei Gesetzen). Es enthält **keine Daten**, nur die Aufbereitungs-Skripte; die Rohtexte stammen aus amtlichen Quellen (Fedlex/BGer).

## Lizenz — mit Beleg (doppelt/dreifach geprüft)

- **Repo-CODE: KEINE Lizenz** → damit **default urheberrechtlich geschützt («all rights reserved»)**, kein Nutzungsrecht eingeräumt. Belege: (1) `gh api repos/JoelNiklaus/SwissLegalTranslations/license` → **HTTP 404 Not Found**; (2) Repo-Tree HEAD listet nur `.gitignore, README.md, requirements.txt, utils.py` + 3 Ordner — **keine LICENSE-Datei**; (3) API-Metadaten `license: null`. **Konsequenz:** Code nur als **Blaupause/Ideen-Steinbruch lesen**, NICHT als Dependency übernehmen oder wörtlich kopieren; Methodik selbst nachbauen.
- **Dataset-Lizenz:** Dataset-Card `fedlex/SwissLawTranslations` führt License = **«[More Information Needed]»** (unspezifiziert). Paper CC-BY-4.0. **Konsequenz nach Doktrin:** irrelevant für uns — die Card sagt explizit «No additional annotations beyond the official translations provided by Swiss authorities», d. h. **keine eigene Aufbereitungsschicht auf den Texten**; die Texte sind amtliche Fedlex-Übersetzungen = **URG-frei (Art. 5 URG)**. Wir beziehen sie **direkt von Fedlex** (tun wir bereits), nicht aus dem HF-Datensatz. Anders als `rcds/swiss_citation_extraction` (CC-BY-SA-Annotation) gibt es hier **keine virale Schicht**.

## Technische Befunde (Code doppelt gesichtet)

1. **`laws/sparql_download.py`** — eine **Fedlex-SPARQL-Query** (`https://fedlex.data.admin.ch/de-CH/sparql`, jolux-Ontologie) für **alle aktuell in Kraft stehenden konsolidierten Bundeserlasse**: filtert `jolux:Consolidation` auf `dateApplicability <= now < dateEndApplicability`, holt HTML-`fileUrl` je Sprache. Kommentar im Code: «Replace DEU with FRA, ITA, ENG, ROH to download the other files» → **Sprachumschaltung ist nur ein Filter-Tausch** (`language/DEU` → FRA/ITA/ROH/ENG). Stand der Query: 27.8.2024.
2. **`laws/prepare_dataset.py`** — parst die konsolidierte Fedlex-**HTML** mit BeautifulSoup: `<article id="art_X">` → `artNr`, `<h6>` → `artTitle`, `<p class="absatz">` + `<sup>` → `parNr`/`parText`; **`<sup>`-Fussnoten werden entfernt**, Text **NFKC-normalisiert**. Erzeugt drei Granularitäten (law/article/paragraph).
3. **Alignment-Methodik (der eigentliche Wert):** Die Mehrsprachen-Ausrichtung ist **KEIN ML-Alignment**, sondern ein **struktureller Join** über Fedlex-eigene IDs: `combine_rows(...)` pivotiert auf `group_cols = [rsNr, artNr, parNr]` × `language`. Weil Fedlex jede Sprachfassung mit **identischer `art_X`-Struktur** publiziert, ergibt sich **artikel- und absatzgenaues DE/FR/IT/RM/EN-Alignment gratis** — reiner Join, keine Übersetzungserkennung nötig.

## Abgleich mit LexMetriks bestehender Pipeline

- LexMetrik nutzt Fedlex-SPARQL bereits (`scripts/normtext/pdf-quellen-generieren.ts`, jolux) — aber **aktuell DEU-only** (`SPRACHE_DEU`-Konstante). FR/IT-Erfassung (**M15 / G29**) und der mehrsprachige DE/FR/IT-Normvergleich (**W2·6**, ROADMAP «DE/FR/IT ~95–99 % ausgerichtet → schaltet M15») sind **geplant, aber nicht gebaut**.
- Damit ist SwissLegalTranslations **kein Ersatz** (unsere HTML-Extraktion/Darstellung ist deutlich weiter, Kanton-fähig, mit Toren `check:fedlex-versionen`/`check:paritaet`), sondern eine **passgenaue Blaupause für die noch offene Mehrsprachen-Welle**: der `rsNr+artNr(+parNr)`-Join auf identische Fedlex-Struktur ist genau die Alignment-Mechanik, die M15/W2·6 braucht.

## Verdikt je Fund + Andock-Punkt

- **F1 — Alignment-Methodik (struktureller Join `rsNr+artNr+parNr` über identische Fedlex-`art_X`-IDs): BRINGT ETWAS (Blaupause).** Andock: **M15 (Sprachverfügbarkeit DE/FR/IT, G29)** in `FAHRPLAN-NORMTEXT-DARSTELLUNG.md` und **W2·6 mehrsprachiger Normvergleich / DE/FR/IT-Knoten-Diff** (ROADMAP). Erspart die Alignment-Konzeptarbeit: kein ML, nur Sprachfilter-Tausch + Join. Selbst nachbauen (Code hat keine Lizenz).
- **F2 — SPARQL-Query-Muster für FR/IT/RM/EN-Konsolidierungen: NICE-TO-KNOW.** Wir haben die DEU-Query schon; der Beleg, dass ein blosser `language`-Filter-Tausch die anderen Sprachen liefert, verkürzt die M15-Vorarbeit. Query-Muster ist funktionale Tatsache gegen die amtliche Quelle (Fedlex), Nachbau unbedenklich.
- **F3 — HTML-Parse-Details (`art_X`/`p.absatz`/`<sup>`-Fussnoten-Strip, NFKC): NICE-TO-KNOW.** Bestätigt/ergänzt unsere Extraktions-Heuristiken (Memory `Gesetze-Rendering-Lektionen`); als Cross-Check der eigenen Parser nützlich.
- **`decision-summaries/` (BGE-Regesten) + `press-releases/`: NICE-TO-KNOW.** DE/FR/IT-Regesten könnten für die Rechtsprechungs-Verzahnung interessant sein (Memory `A18 BGE-Regeste nach Sprachen → W2·6-B`), aber Rohtexte via BGer/amtliche Quelle, nicht via HF.
- **HF-Datensätze als Daten-Bezug: IRRELEVANT** (Doktrin: Texte immer von Fedlex/BGer direkt; hier ohnehin URG-freie Amtstexte).

## Lizenz-Risiken (Zusammenfassung)

- **Code = all rights reserved** (keine LICENSE) → nur Blaupause, **nicht** kopieren/als Dependency ziehen. Grösstes zu beachtendes Risiko dieses Fundes.
- Daten = amtliche Fedlex-Übersetzungen (URG-frei), keine virale Aufbereitungsschicht → Daten-Bezug unbedenklich, aber **direkt von Fedlex** (nicht aus dem HF-Mirror).

## Pflegebedarf

Keine datierten Rechtsparameter → **kein** Verfallsregister-Eintrag. Die SPARQL-Query im Repo hat Stand 27.8.2024; bei M15-Umsetzung eigene Query gegen Live-Fedlex fahren (Currency via `check:fedlex-versionen`).
