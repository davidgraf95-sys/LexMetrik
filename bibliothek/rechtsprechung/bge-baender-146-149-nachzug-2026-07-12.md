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

## 7 Fortschreibung — Bände 150/151 + BGFA-Fix (PR-C, 18.7.2026)

Fortsetzung des Nachzugs über denselben Pfad (`--additiv --bge-baender=…`),
band-weise committet (COMMIT-FIRST, Netz-Stör-Lektion).

| Band | Jahrgang | enumeriert (de+fr+it) | vorher im Bestand | **neu erfasst** | Volltext/Auszug |
|---|---|---|---|---|---|
| 150 | 2024 | 199 | 96 | **103** | 103 / 0 |
| 151 | 2025 | 226 | 143 | **83** | 83 / 0 |
| **Σ** | | **425** | 239 | **186** | 186 / 0 |

- **Teilband-Verteilung (Korpus nach Nachzug):** 150 = I 22 · II 46 · III 43 ·
  IV 43 · V 45 (Σ 199); 151 = I 26 · II 65 · III 61 · IV 41 · V 33 (Σ 226).
  Neu Band 151: I+11 II+22 III+21 IV+18 V+11.
- **Vorbestand 150/151** stammt aus dem 2024+-Leitentscheid-Seed (`bge`,
  `date_from=2024`) — Band 150/151 waren also nie «gar nicht importiert», nur
  band-unvollständig. Der Nachzug schliesst die Lücken band-basiert (Q1-Quirk).
- **Sprachverteilung neu (150+151):** de 289 · fr 125 · it 11; **425/425
  dreisprachige clir-Regeste**, 0 Auszug-Quarantäne, 0 Degradation.
- **BGFA-ABK_REGISTER-Fix (Kernauftrag, ANMERKUNGEN-DAVID-2026-07-16 §10):**
  BGFA (SR 935.61, Anwaltsgesetz) war Register-Rubrik (`register.ts`), fehlte
  aber im `ABK_REGISTER` (`scripts/normtext/entscheide-mapping.ts`) → BGE, die
  BGFA zitieren, wurden im Norm-Index nicht mit der Gesetzesseite verzahnt.
  `BGFA: 'BGFA'` ergänzt. Neuer Shard `norm-index/BGFA.json`:
  `art 20 → 150 II 308` (Davids Referenzfall), `art 17 → 150 II 308 + 147 I 219`
  u.a. **Residuum (vorbestehend, korpusweit):** `ABK_REGISTER` mappt nur
  **deutsche** Abkürzungen — FR/IT-primäre Entscheide zitieren `LLCA`/`LDA`
  (BGFA), `CO` (OR), `LTF` (BGG) etc., die (wie das ganze Register) unverlinkt
  bleiben. 150 II 308 ist DE-primär und trägt die BGFA-Form → Davids Fall voll
  geschlossen; die FR/IT-Abkürzungs-Verlinkung ist eigener Backlog.
- **Determinismus:** Reload-Läufe byte-identisch (Fixpunkt bewiesen). Der
  additive Lauf hängt neue BGE ans Ende → `norm-index.json`-proNorm-Key-
  Reihenfolge war bau-pfad-abhängig; auf die kanonische Manifest-Reihenfolge
  (datum-desc) normalisiert (0 Membership-Änderung).
- **Gegenprüfung (Opus, 2 Linsen):** unabhängiger Sub-Agent zeichengenau gegen
  bger.ch clir (5 Stichproben de/fr/it, mehrteilige Regeste a/b, Enumerations-
  Grenzproben 150 II 566 / 150 III 423 / 151 II 934 amtlich abgesichert,
  Negativfall) + struktureller Zweit-Pass (0 Shell/Leak/Dup/Degradation).
  Verdikt `bestanden`.
- **Budget-Hinweis:** `check:entscheide` 98,30 MB bei `BUDGET_MB=100` — nur
  ~1,7 MB Reserve; ein Band-152-Nachzug erfordert Budget-Anhebung.
