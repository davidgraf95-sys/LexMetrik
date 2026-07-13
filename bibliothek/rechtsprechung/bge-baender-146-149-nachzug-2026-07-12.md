# BGE-Korpus — Band-Nachzug 146–149 (Jahrgänge 2020–2023)

**Auftrag David 12.7.2026:** «bge bis 2020 integrieren» + «alles doppelt
verifizieren». Bau-Strang W2·6 (RISIKOPFAD Datenextraktion).

## 1 Quelle + Stand

- **Identität + Volltext/Auszug:** OpenCaseLaw-API `https://mcp.opencaselaw.ch/api`
  (Court `bge`), keyed-Lookups über den bestehenden Adapter
  `scripts/normtext/adapter-entscheide.ts` (`holeBgeLeitentscheid` = A2-Merge aus
  amtlichem Sammlungs-Auszug + unterliegendem bger-Urteil).
- **aza↔BGE-Bindung + Urteilsdatum (AMTLICH):** bger.ch clir **Urteilskopf**
  (`parseClirUrteilskopf`, DE-Seite; nennt das EIGENE Az. + «vom <Datum>» direkt
  vor der Regeste, auch in fr/it-Köpfen «du 1er septembre 2021»). Fallbacks:
  OCL-Feld `docket_number_2` → Kopf-Regex. Begründung: Gegenprüfungs-Runde 1.
- **Dreisprachige Regeste (A18/§7-Zitat-Ausnahme):** amtliche Publikation
  **bger.ch clir** (`atf://<band>:de|fr|it`), strukturbasiert
  (`scripts/normtext/clir-regeste.ts`) — Regestenkopf + Textabsätze je
  Sprachfassung, STRIKT DE→FR→IT. Keine Wortraten.
- **Stand:** Abruf 2026-07-12. Massgeblich bleibt die amtliche Fassung
  (bger.ch-Live-Link je Entscheid und je Sprachfassung, §7/§8).

## 2 Regel (deterministisch)

- **Enumeration band-basiert + sprachvollständig** (`enumeriereBgeBaender`):
  die `bge`-Sammlung je Sprache **de, fr, it** compact durchpaginieren, nach Band
  aus `citation_string_de` filtern, je Fundstelle EIN Record (Familie
  `bge_BGE_*` bevorzugt — trägt `docket_number_2` + meist echte Daten;
  Alt-Familie `bge_<cit>` nur als Fallback). **Zwei Quirk-Befunde:**
  - **Q1 Bandjahr-Quirk:** OCL-`decision_date` ist bei etlichen BGE Platzhalter/
    Streuwert → `date_from`-Enumeration verlöre ~8 % still.
  - **Sprachfilter-Falle (Gegenprüfung R1, Befund 3):** `language=de` liess
    **247 fr/it-BGE** der Bände 146–149 still fehlen (541 statt 788).
- **Additiv (§6):** `--additiv --bge-baender=…` lädt den committeten Bestand
  byte-treu, ergänzt NUR fehlende BGE der Zielbände, clir-Regeste nur für Neue.
- **Datum:** Volltext-Merge → echtes Urteilsdatum (OCL bger-Record, gegen clir
  verifiziert); Auszug-only → clir-Urteilskopf-Datum, sonst deklarierter
  Bandjahr-Platzhalter `<band+1874>-01-01` (Gegenprüfung R1, Befund 1: OCL-Daten
  der Auszüge waren 31/31 falsch).
- **Kollisions-Quarantäne + Inversions-Schutz (§8):** unverändert (aza-Key-
  Dublette → Auszug; Volltext < 85 % des Auszugs → kein Merge).

## 3 Geltungsbereich + Mengen (amtliche Sammlung, unique Fundstellen, ALLE Sprachen)

| Band | Jahrgang | BGE (band-basiert, de+fr+it) | Status |
|---|---|---|---|
| 146 | 2020 | 168 | PR-A |
| 147 | 2021 | 236 | PR-A |
| 148 | 2022 | 198 | PR-B |
| 149 | 2023 | 186 | PR-B |
| **Σ** | 2020–2023 | **788** | |

Ausbau band-weise (Datenmenge/Crawl-Risiko): **PR-A = 146+147 (404)**,
**PR-B = 148+149 (384)**. BUDGET_MB 35 → 100 (Ist nach Vollausbau ~78 MB).

## 4 Gegenprüfungs-Historie (Davids Auflage «alles doppelt verifizieren»)

- **Runde 1 (Opus, 12.7.2026): `widerlegt`.** 14 Stichproben zeichengenau gegen
  bger.ch clir (Regeste DE/FR/IT quellentreu ✓), aber: **(1)** 31/31 Auszug-Daten
  falsch (Streudaten statt Urteilsdatum), **(2)** 2 aza-Fehlzuordnungen (146 V 185
  → 9C_177/2017 statt 9C_584/2019; 146 II 304 → 1C_345/2014 statt 1C_22/2019 —
  in den Erwägungen zitierte Präjudizien), **(3)** echte BGE fehlten still
  (146 IV 36, 147 III 463 u.a. — fr/it-Sprachfilter-Falle).
- **Fixes:** amtlicher clir-Urteilskopf als primäre aza-/Datums-Quelle
  (`parseClirUrteilskopf` + Fixtures/Unit-Tests) · Sprachrelax + de/fr/it-
  Enumeration · Auszug-Datum aus clir bzw. Bandjahr-Platzhalter. Alle 5
  Befund-Fälle der Runde 1 im Smoke exakt auf die amtlichen Werte verifiziert.
- **Runde 2 (volle neue Runde):** Verdikt siehe Gegenprüfungs-Register +
  Commit-Trailer.

## 5 Pflegebedarf

- BGE-Bände sind abgeschlossen → kein Currency-Drift; neue Bände (150+) über
  denselben `--bge-baender`-Pfad.
- clir-Roh-HTML gecacht (`daten/cache/clir-regeste`, gitignored) → Re-Parse ohne
  Re-Crawl.

## 6 Abnahme-Status

Erstextraktion + unabhängige adversariale Gegenprüfung (2 Runden, Opus).
Fachliche Inhalts-Abnahme bleibt David (Status-Marker «maschinell», §8).
