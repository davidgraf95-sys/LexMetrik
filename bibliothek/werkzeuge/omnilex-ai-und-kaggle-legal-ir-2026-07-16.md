# Omnilex-AI (GitHub-Org) + Kaggle «LLM Agentic Legal Information Retrieval» — Erstrecherche

**Abnahme-Status: Erstrecherche** (Sidequest David 16.7.2026; einfach belegt, Kern-Behauptungen doppelt belegt README + Code/LICENSE bzw. HF-Dataset-Card). Keine Übernahme in Code/Stammdaten ohne fachliche Abnahme (§7).

**Quelle + Stand (Abruf 16.7.2026):**
- GitHub-Org: <https://github.com/Omnilex-AI> (3 öffentliche Repos)
- Starter-Repo: <https://github.com/Omnilex-AI/Omnilex-Agentic-Retrieval-Competition> (Apache-2.0, ★26, letzter Push 25.1.2026)
- API-Doc: <https://github.com/Omnilex-AI/ailegis-api-doc> (MIT, letzter Push 22.2.2026)
- Kaggle: <https://www.kaggle.com/competitions/llm-agentic-legal-information-retrieval>
- Firma: <https://omnilex.ai/en/> — Schweizer Legal-Tech, «AI workspace for legal professionals», Team aus ETH Zürich / EPFL-Spinoff, «Development partner of the Swiss Federal Chancellery»
- Datensätze (HuggingFace): LEXam `LEXam-Benchmark/LEXam` (**CC-BY-4.0**) · `rcds/swiss_citation_extraction` (**CC-BY-SA-4.0**)

## Was ist Omnilex

Schweizer Legal-AI-Produktfirma (kommerzielles Recherche-Tool «AI for legal practice», Zürich/EPFL-Umfeld). Sie hostet eine **Kaggle-Competition zu agentischer Rechts-Informationssuche über Schweizer Recht** und stellt das Starter-Repo + Auswertungs-Harness öffentlich unter Apache-2.0 bereit. Das Produkt selbst ist LLM-basiert (für LexMetrik irrelevant — LexMetrik-Produkt bleibt LLM-frei); relevant ist ausschliesslich die **Werkzeug-/Benchmark-Ebene** des Starter-Repos.

## Repo-Inventar (Org Omnilex-AI)

| Repo | Zweck | Stack | Lizenz | Aktivität | 1-Zeilen-Verdikt |
|---|---|---|---|---|---|
| `Omnilex-Agentic-Retrieval-Competition` | Kaggle-Starter: Zitat-Normalisierung, BM25-Retrieval, F1/MAP/NDCG-Scorer, Baseline-Notebooks | Python (llama-cpp, rank-bm25, pandas) | **Apache-2.0** (LICENSE-Datei bestätigt) | Push 25.1.2026, ★26 | **BRINGT ETWAS** (Ideen-Steinbruch Zitat-Regex + Retrieval-Eval-Harness) |
| `ailegis-api-doc` | Doku-Website der kommerziellen Omnilex-API | MDX | MIT | Push 22.2.2026, ★0 | **IRRELEVANT** (proprietäres LLM-Produkt, kein Korpus) |
| `.github` | Org-Profil | — | keine | Push 23.7.2025 | IRRELEVANT |

## Kaggle-Competition «LLM Agentic Legal Information Retrieval»

- **Veranstalter:** Omnilex (Kontakt `ari.jordan@omnilex.ai`, laut Repo-README).
- **Aufgabe:** Zu einer juristischen Frage (Query in Englisch) die korrekten **Schweizer Rechtsquellen** zitieren — Bundesgesetze (SR/Art.) und Bundesgerichtsentscheide (BGE). Primärmetrik **Macro-F1** über Zitat-Mengen (Sekundär: Micro-F1, MAP, NDCG@k). «Agentisch» = ReAct-Agent mit BM25-Suchwerkzeugen über den Korpus.
- **Korpus (aus `data/README.md` + `download_data.py`):**
  - `federal_laws.jsonl` — SR-Artikel (Beispiel-ID `sr_220_art_1`, Zitat «SR 220 Art. 1») — Quelle **Fedlex**.
  - `court_decisions.jsonl` — BGE (ID `bge_119_ii_449`, mit Regeste).
  - Query/Gold-Quellen: **LEXam** (Uni-Prüfungsfragen, Zitate per Regex extrahiert) + **`rcds/swiss_citation_extraction`** (Zitat-Annotation Token-Classification DE/FR/IT).
- **Zeitplan/Preise:** Auf den öffentlichen Seiten **nicht verifizierbar** (Kaggle-Overview/Rules sind JS-gerendert + reCAPTCHA; WebFetch lieferte nur den Titel). → **offen, nicht belegt** (§8).
- **Datenschema:** `train.csv` (query_id, query, gold_citations `;`-getrennt), `test.csv` (query_id, query — Gold verborgen), Submission (query_id, predicted_citations).

## Technische Befunde (Code doppelt gesichtet)

1. **Zitat-Normalizer** (`src/omnilex/citations/normalizer.py`, Apache-2.0) — Regex für BGE (`BGE 141 III 513 E. 5.3.1`, inkl. Konsiderationen dezimal/slash/range, FR `cons.`/DE `Erw.`) und Artikel-Zitate (`Art. 11 Abs. 2 OR`, DE/FR/IT-Absatz `Abs.`/`al.`/`cpv.`). Kanonisiert auf `Art. X [Abs. Y] BUCH`.
   - **Schwäche (ehrlich):** `_parse_law_abbrev` prüft Abkürzungen per naivem `if abbrev in raw_citation`-Substring über eine 600-KB-Liste → Fehlmatches (kurze Kürzel in Fremdwörtern) und O(n)-Scan. Nicht produktionsreif; Wert liegt in den **Regex-Mustern + der Abkürzungsliste**, nicht in der Matching-Logik.
2. **Abkürzungs-Mapping** `utils/abbrev-translations.json` (~600 KB, Apache-2.0) — SR-Nummer → Kürzel DE/FR/IT für die gesamte Systematische Rechtssammlung. Nützliche **Nachschlage-Tabelle**, aber selbst abgeleitet (nicht amtlich beglaubigt) → nur als Startliste, gegen Fedlex verifizieren.
3. **Evaluations-Harness** (`src/omnilex/evaluation/metrics.py` + `scorer.py`, Apache-2.0) — saubere, reine Implementierung von citation-F1 (Macro/Micro), Average Precision/MAP, NDCG@k über Zitat-Mengen. **Deterministisch, LLM-frei, gut testbar** (Tests im Repo). Direkt als Vorlage für eine LexMetrik-Retrieval-Güte-Messung verwendbar.
4. **Retrieval** (`bm25_index.py`, `tools.py`) — BM25 (`rank-bm25`) mit LangChain-artigen Such-Tools. Für LexMetrik nur Referenz; unsere Suche (`api/suche`, Turso) ist bereits weiter.

## Lizenz-Konsequenzen (Daueranweisung Lizenz-Doktrin)

- **Starter-Repo-Code: Apache-2.0** → als Dependency ODER Vorlage kompatibel (mit MIT/BSD/Apache LexMetrik-kompatibel). Übernahme von Regex-Mustern/Metriken zulässig, Copyright/NOTICE beachten. **Konsequenz:** grünes Licht als Ideen-Steinbruch/Vorlage.
- **LEXam: CC-BY-4.0** → nutzbar mit Namensnennung; keine ShareAlike-Virulenz. Enthält **Uni-Prüfungsfragen** (nicht amtliche Norm) — nur als **Benchmark/Query-Set** zur Messung der Suchgüte tauglich, **nie** als Produkt-Inhalt/Normquelle. **Konsequenz:** als externes Eval-Set OK; nicht in den Korpus.
- **`rcds/swiss_citation_extraction`: CC-BY-SA-4.0** → **ShareAlike ist viral**. Die zugrunde liegenden Gerichtstexte sind zwar URG-frei (Art. 5 URG), aber die **Annotations-/Extraktions-Schicht** ist CC-BY-SA. **Konsequenz nach LexMetrik-Doktrin:** wir übernehmen diese Annotationsschicht NICHT; Texte/Metadaten beziehen wir **immer von der Amtsquelle** (Fedlex/entscheidsuche/bger.ch). Nur als Referenz/Idee lesen.
- **Kaggle-Competition-Daten:** Kaggle-Competition-Datensätze sind i. d. R. **competition-use-only** (die exakte Rule konnte hier **nicht** verifiziert werden — reCAPTCHA). **Konsequenz:** irrelevant, weil wir die Kaggle-Daten gar nicht brauchen — die beiden Basis-Datasets liegen unabhängig auf HuggingFace mit den obigen CC-Lizenzen; der verborgene Test-Split ist ohnehin nicht öffentlich.

## Verdikt je Fund + Andock-Punkt

- **F1 — Retrieval-Eval-Harness (Apache-2.0): BRINGT ETWAS.** Andock: eine **LLM-freie Such-/Ranking-Güte-Messung** für `api/suche` (Turso, 55k Artikel + 342 BGE). Passt zur Memory `Lexmetrik-QS-DATA-Baustrecke` und zur Praxis-Direktive (Suchqualität = Kanzlei-Nutzen). Werkzeug-Ebene, kollidiert nicht mit §2 (kein LLM im Produkt).
- **F2 — Zitat-Regex + Abkürzungsliste (Apache-2.0): BRINGT ETWAS (als Steinbruch).** Andock: Zitations-/Verweis-Erkennung (BGE/BGer/Art.), relevant für **Verzahnung** (Memory `Lexmetrik-Verzahnung-UI`) und `Lexmetrik-OpenCaseLaw-Quellen` (Zitat-Regexes/ECLI). Nur Muster übernehmen, das naive Substring-Matching NICHT.
- **F3 — LEXam-Benchmark (CC-BY-4.0): NICE-TO-KNOW.** Potenzielles externes Query/Gold-Set zum Messen der Retrieval-Güte; mit Attribution nutzbar, nie in den Korpus.
- **F4 — BM25-Retrieval-Code: NICE-TO-KNOW.** Referenz; LexMetrik-Suche ist bereits weiter.
- **`ailegis-api-doc`, `.github`, omnilex.ai-Produkt: IRRELEVANT** (proprietäres LLM-Produkt, keine amtlichen Rohdaten).

## Pflegebedarf

Keine datierten Rechtsparameter → **kein** Verfallsregister-Eintrag. Falls F1/F3 je gebaut werden: LEXam-Version + Abruf-Datum als Provenienz festhalten; Kaggle-Zeitplan/Preise bleiben **offen** (nur mit Kaggle-Login verifizierbar).
