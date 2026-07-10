# Botschaften des Bundesrates — Entstehungsgeschichte je Bund-Erlass (Paket 2, W2·6)

> §11-Ablage zum Bau vom 10.7.2026 (Fedlex-Portfolio Paket 2, «Vorzeige-Paket»).
> Go David 10.7.2026 («go zu allem»; Reihenfolge 1→2→5→3→4, Paket 1 gebaut).

## 1. Quelle + Stand

- **Amtliche Quelle:** Fedlex-SPARQL-Endpoint `https://fedlex.data.admin.ch/sparqlendpoint`
  (POST, `application/x-www-form-urlencoded`, `Accept: application/sparql-results+json`).
  Sicht-/Live-Link je Botschaft: `https://www.fedlex.admin.ch/eli/fga/<jahr>/<num>/de`
  (fga = Feuille fédérale / Bundesblatt). Curia-Deep-Link: parlament.ch/Curia-Vista.
- **Nie** Dritt-Repo `droid-f/fedlex` (CC BY-NC-SA).
- **Abrufdatum:** 10.7.2026. **Stand je Eintrag:** Botschafts-Datum (`jolux:dateDocument`).

## 2. Regel (deterministisch) — die Reverse-Kette

Je SR (Grundmenge = 218 Bund-Volltext-Erlasse, `register.json` ebene=bund & status=snapshot):

```
?tax   skos:notation "<SR>"^^<…/notation-type/id-systematique>   # TYPISIERT (sonst Timeout)
?oc    jolux:classifiedByTaxonomyEntry ?tax ;
       jolux:legalResourceFamilyType <…/resource-family/oc>       # oc (AS/RO), NICHT cc
?proj  jolux:hasResultingLegalResource ?oc ;
       jolux:draftHasLegislativeTask ?event                       # DIREKTE Kante
?event jolux:legislativeTaskHasResultingLegalResource ?botschaft
?botschaft jolux:typeDocument <…/resource-type/23>                # «Botschaft des Bundesrates»
```

Metadaten: `?botschaft jolux:dateDocument` (Datum), `isRealizedBy`→`jolux:title` je Sprache
(DEU/FRA/ITA), `?proj jolux:parliamentDraftId` (Curia-Nr.), `?oc` (AS-Erlass, → Paket-5-Join).

**Zwei Fallen empirisch belegt + vermieden:**
1. **UNION-Falle** (700-statt-alle) → VALUES-Batching (55er-Batches).
2. **STRSTARTS-Falle:** der Original-Spec-Filter `FILTER(STRSTARTS(STR(?event),STR(?proj)))`
   ist ein lexikalischer Präfix-Join = ~1,5 s/SR (60-SR-Batch = 117 s, Timeout-Risiko).
   Die **direkte Graph-Kante `?proj jolux:draftHasLegislativeTask ?event`** liefert
   dieselbe Menge (60-SR-Batch: 482 rows / 147 Botschaften, byte-gleich) in **446 ms —
   260× schneller.** Ganzes Korpus (218 SR) in 2,6 s.

**Determinismus-Härtung (§2):** Eine Botschaft kann MEHREREN Projekt-Knoten zugeordnet sein
(live belegt: `fga/2016/467` → `proj/2016/0065` + `0066`). `projEli`/Curia werden deterministisch
aus dem **kleinsten** proj-URI gewählt (nicht «erste Bindung» = reihenfolge-abhängig). Zwei
Läufe byte-identisch verifiziert.

## 3. Geltungsbereich, Füllraten, Ausnahmen

- **401 Botschaften** über die 218 Volltext-Erlasse. **97/218 Erlasse** haben ≥1 Botschaft;
  die übrigen 121 sind überwiegend **Verordnungen** (Bundesrats-Verordnungen haben keine
  parlamentarische Botschaft) sowie Pre-2000-/Pa.Iv.-Erlasse → ehrlicher Leerzustand (§8).
- **Füllraten (korpusweit):** Datum 401/401 (100 %), Titel DE/FR/IT je 401/401 (100 %),
  Curia 400/401 (99,8 % — die eine ohne Curia ist eine Alt-fga 1999 ohne `parliamentDraftId`).
- **Datumsspanne** 1999-03-31 … 2025-03-21. Strukturierte Verknüpfung verlässlich **ab ~2000**
  (digitaler Projekt-Graph) — Grenze im UI-hinweis benannt.
- **Mantelerlasse:** 27 Botschaften tragen mehrere `normKeys` (unter jedem betroffenen SR gelistet).

## 4. Datenmodell + Join-Felder (Finding 1, P0)

Je Eintrag (`MaterialRegistereintrag`, behoerde `BR`, doktyp `botschaft`, status `nur-live-link`):
`key` = `BOTSCHAFT-<jahr>-<fga-num>` (fga-URI-intrinsisch, rebuild-fest + dedupe-korrekt — bewusste
Abweichung vom Spec-`<KÜRZEL>`-Format, weil Kürzel bei Mantelerlassen instabil wäre, Finding 9);
`titel`/`titelFr`/`titelIt` (amtlich, nie umformuliert); `nummer` = Curia; `quelleUrl`; `stand`;
`normKeys` (auto); `rechtsgebiet` geerbt vom prominentesten normKey (kleinster rang);
**`projEli` + `ocUris` + `botschaftDate`** für den Paket-5-Join; `artAnker?` (Moat-Hebel 2, leer).

- **Speicherweg:** Botschaften NICHT im in-Bundle `MATERIAL_REGISTER` (§15 Bundle-Kosten),
  sondern build-zeitlich via `ALLE_MATERIALIEN` in die lazy `register.json`-Projektion gemerged.
  Auflösung im Reader: `botschaftenFuerNorm` (Norm→Botschaften-Index, einmal je Manifest gebaut).
- **UI (Bridge B1, Moat-Hebel 1):** «Entstehungsgeschichte»-Gruppe IM bestehenden `KontextPanel`
  (Norm-Kontext-Bus) — Genese + Anwendung (Entscheide) + Auslegung (Materialien) + Werkzeuge an
  EINER norm-verankerten Stelle, kein Parallel-Silo. Alle 3 Panel-Instanzen (Haupt + 2 Panes).

## 5. Pflegebedarf

- **Drift-Tor `check:botschaften-netz`** (in `check:netz`): stratifizierte Stichprobe live gegen
  den Projekt-Graphen; Referenz DSG→2. Rot ⇒ Generator neu laufen (nie Auto-Fix).
- **Regenerieren:** `npm run materialien:botschaften -- --datum=$(date +%F)` → dann
  `npm run materialien -- --datum=$(date +%F)` (register.json) → `npm run datenhaltung:manifest`.
- store-raw je SR unter `bibliothek/materialien/botschaften-raw/<SR>.json` (Re-Parse ohne Re-Crawl).

## 6. Abnahme-Status

Erstbau + adversariale Gegenprüfung (unabhängiger Opus, frischer Kontext, gegen amtliche
Fedlex-SPARQL/fedlex.admin.ch/parlament.ch): **BESTANDEN** (10.7.2026). Der Prüfer querierte
unabhängig quer und fand keinen Fehler in Zuordnung/Datum/Curia/Join-Feld:
DSG→2 (17.059+03.016) bestätigt; **AVIG=10 korrekt** (die «11»-Behauptung des Bauplans war ein
Overcount, kein stiller Drop); 18-Erlass-Stichprobe deckungsgleich, für 7 Erlasse (STGB 23 · KVG 18 ·
BGG 4 · AHVG 13 · OR 13 · DSG 2 · AVIG 10) exakte fga-Mengengleichheit (onlyGen=∅, onlyIndep=∅);
3 Mantelerlasse als real bestätigt (kein Join-Artefakt); 5 echte Gesetze mit 0 Botschaften
(JStPO/VStrR/PUEG/PRG/VG) = echte Fedlex-Graph-Lücken, kein Generator-Drop; Join-Felder 401/401
(`stand==botschaftDate`, `projEli`, `ocUris` je vollständig, ocUris amtlich als echte oc-Erlasse
belegt); Titel zeichengenau (Guillemets/Apostroph/Akzente nicht ASCII-gefaltet). Zwei Nicht-Defekt-
Beobachtungen: Curia-Format-Varianz (`1999.093`/`zu 13.075`/`09.095-2`) = treue `parliamentDraftId`-
Wiedergabe; 1 Botschaft ohne Curia (Graph hat keine) — beide korrekt.
Fachliche Abnahme durch David steht aus (Zeitsperre bis 1.12.2026); Status `nur-live-link` = kein
gehosteter Inhalt, massgeblich bleibt stets die amtliche Quelle (§8).
