# Spike: pagefind (1.5.2, MIT) vs. Produkt-Suchindex — QS-VERWENDEN V8

**Stand:** 2.9.2026.
**Anlass:** Fremdquellen-Sichtung 2.9.2026 (`fremdquellen-sichtung-2026-09-02.md`, Rangliste #11) — Frage «führen die prerenderten Seiten den vollen Artikeltext, und schlägt pagefind den heutigen fixen Vorab-Download-Suchindex?». Wegwerf-Worktree, kein Commit in Produktcode; Korpus `npm run build` auf main-Stand (2766c8dd7), 1566 Erlass-Detailseiten.
**Regel:** deterministisch soweit gemessen — Bau-/Ausgabegrössen und Playwright-Netzwerkmitschnitte, keine Schätzung ausser explizit markiert («grobe Skalierung»).
**Geltung/Ausnahmen:** Messung einmalig, n=5 Such-Queries (nicht repräsentativ, aber strukturell erklärt) gegen `scripts/suche-eval-gold.json`; Vergleichs-Baseline `npm run eval:suche` (Produktionspipeline) dokumentiert und Stand 2.9.2026 datiert.
**Pflegebedarf:** keiner — reine Messnotiz, kein Code im Repo, kein Snapshot mit Drift-Pflicht.
**Abnahme-Status:** entwurf (Recherche/Spike, keine fachliche Abnahme nötig).

**Verdikt:** **nicht ersetzen; als Kanton-Volltext-Ergänzung nur mit Scoping/Gewichtung/Re-Ranking, Aufwand mittel, §5-Spannung** (zwei Suchpfade parallel — Single Source of Truth).

---

## 1. Vorfrage: trägt das prerenderte HTML den vollen Artikeltext?

JA, für Bund UND Kanton. `<article><h2>Art. 336c</h2><p>…</p></article>` je
Artikel, kein `id`-Attribut am `<article>` (nur `<h2>`-Text). Stichprobe:

| Datei | Grösse | `<article>`-Zahl |
|---|---:|---:|
| bund/OR.html | 937 KB | Volltext bestätigt (Art. 336c inkl. Militär-/Zivildienst-Passus wörtlich vorhanden) |
| bund/ZGB.html | 608 KB | — |
| bund/STGB.html | 327 KB | — |
| kanton/ZH-230.5.html | 10 KB | 3 (kleines Gesetz) |
| kanton/BS-771.310.html | 10 KB | 5 |
| kanton/AR-956.111.html | 9 KB | 10 |
| kanton/ZH-131.1.html (KV) | 87 KB | 182 |

Konsequenz: pagefind kann direkt gegen `dist/gesetze/**` bauen, auch für
Kanton — dafür ist der JSON-Generator nicht nötig. Kein `data-pagefind-body`
nötig für Vollständigkeit, aber ohne Scoping indexiert pagefind auch
Nav/Header/Footer jeder Seite (Rauschen) und — bei Lauf gegen ganzes `dist`
— auch Rechner/Vorlagen/Entscheide/Materialien.

## 2. Bau-Zeit, Grösse

`npx pagefind@1 --site dist --output-subdir _pagefind` (ganze Seite, 8307
Seiten inkl. Rechner/Vorlagen/Entscheide/Materialien): 22 s Pagefind-Lauf
(39.6 s total inkl. npx-Fetch), Output 151 MB (fragment 84 MB, index 66 MB).

Scoped auf `dist/gesetze` (1593 Seiten Bund+Kanton+International,
93 269 Wörter): 3.4 s Lauf, Output **24 MB** auf Platte (fragment 13 MB,
index 11 MB) — unkomprimiert, kein Pre-Gzip (Server müsste komprimieren).

**Architektur-Unterschied zum FlexSearch-Ansatz:** pagefind lädt NICHT den
ganzen Index vorab, sondern nur wasm (71 KB) + Entry-JSON + die für die
Anfrage relevanten Index-/Fragment-Chunks. Gemessen (Playwright, echter
Browser, roh unkomprimiert, lokal ohne Gzip) für 5 Beispiel-Queries aus
`scripts/suche-eval-gold.json`:

| Query | geladene Bytes (roh) | Chunks |
|---|---:|---:|
| „Art. 336c OR" | 634 KB | 3× index + 3× fragment (1 Fragment 211 KB = ganze BPV-Seite) |
| „Art. 8 ZGB" | 140 KB | 2× index + 5× fragment |
| „Kündigung während Schwangerschaft" | 204 KB | 3× index + 5× fragment |
| „Frist Mängelrüge Kauf" | 130 KB | 3× index, 0 fragment (1 Treffer) |
| „Wann ist Notwehr erlaubt" | 232 KB | 3× index + 1× fragment (72 KB) |

Grössenordnung 130–630 KB roh pro Suchanfrage (gzip real vermutlich
60–300 KB) — verglichen mit dem heutigen FIXEN Vorab-Download von
5 311 KB gzip (Bund) bzw. 9 974 KB gzip (Bund+Kanton, gemessen 1.9.2026,
`such-index-generieren.ts` Z. 56–61). Das ist der eigentliche Wert von
pagefind: Kanton würde NICHT linear den Erst-Download aufblähen, weil
Chunks erst bei Bedarf geladen werden.

## 3. Trefferqualität (Top-1/Top-5, Seiten-Granularität — pagefind kennt

keine Artikel-Ebene ohne eigene id-Anker):

| Query | Klasse | Erwartet | pagefind Top-1 | Top-5 |
|---|---|---|---|---|
| Art. 336c OR | normzitat | bund/OR | BPG (falsch) | Rang 3 OK |
| Art. 8 ZGB | normzitat | bund/ZGB | kanton/ZH-230 EG-ZGB (falsch) | **kein Treffer** |
| Kündigung während Schwangerschaft | umgangssprache | bund/OR | kanton/BS-RiE 162.100 (Personalordnung, falsch) | **kein Treffer** |
| Frist Mängelrüge Kauf | umgangssprache | bund/OR | bund/OR **OK** (einziger Treffer) | OK |
| Wann ist Notwehr erlaubt | umgangssprache | bund/STGB | bund/STGB **OK** (einziger Treffer) | OK |

Top-1 (Seiten-Ebene) 2/5, Top-5 3/5 — bei nur n=5, nicht repräsentativ,
aber die zwei Fehlschläge sind strukturell, nicht zufällig: pagefind
gewichtet Bund nicht höher als Kanton und kennt keine Norm-Zitat-Syntax
(„Art. X Gesetz" wird zu drei Volltext-Tokens „art"/„8"/„zgb" — kurze
kantonale EG-Erlasse mit „ZGB" im Titel schlagen die 608-KB-ZGB-Seite in
der Dichte). Bei „Kündigung während Schwangerschaft" rankt pagefind
Basler Personalrecht (Staatspersonal) vor dem einschlägigen OR — fachlich
irreführend für eine Rechts-Plattform.

**Vergleich mit dokumentiertem Produkt-Baseline** (`npm run eval:suche`,
Artikel-Ebene, echte Produktions-Pipeline inkl. Norm-Sprung-Parser):

| Klasse | n | Recall@1 | MRR |
|---|--:|--:|--:|
| normzitat | 18 | **0.944** | 0.944 |
| umgangssprache | 17 | 0.176 | 0.208 |
| bge | 18 | 0.833 | 0.833 |
| stichwort | 16 | 0.500 | 0.586 |

Der entscheidende Befund: **normzitat** (der für Juristen häufigste
Anfragetyp, „Art. X Gesetz") liegt im Produkt bei 94.4 % Recall@1, weil er
NICHT über Volltextsuche läuft, sondern über einen deterministischen
Regex-Parser (`normQuery.ts`, ebenen-/index-unabhängig). Reines pagefind
(ohne diesen Parser) verfehlte in der Stichprobe genau diesen Kanal bereits
bei 2 von 2 Beispielen im Top-5-Fenster teilweise/ganz. Bei
**umgangssprache** ist auch das Produkt schwach (17.6 % Recall@1) — dort ist
der Abstand zu pagefind (Seiten-Ebene) kleiner, aber pagefind riskiert
sachfremde Kanton-Treffer vor Bundesrecht, das Produkt liefert bei Fehlschlag
wenigstens „nichts", keine falsche Antwort.

## 4. Vergleich Grösse Bund heute vs. pagefind; Kanton-Kosten-Schätzung

- Heute (statisch, Vorab-Download): Bund 5 311 KB gzip · Bund+Kanton
  9 974 KB gzip · Kanton-Anteil 4 663 KB gzip (46.8 %) — Quelle:
  `scripts/such-index-generieren.ts` Kommentar Z. 56-61, Stand 1.9.2026.
- pagefind (Platz auf Platte, unkomprimiert): Bund allein ≈ 3.4 MB
  (227/1593 Seiten-Anteil an 24 MB, grobe Skalierung) · Bund+Kanton+Intl
  24 MB. Aber: das ist NICHT das, was ein Nutzer lädt — pro Anfrage nur
  130–630 KB roh (s. o.), UNABHÄNGIG davon ob Kanton mit indexiert ist,
  weil nur die für die Anfrage relevanten Chunks geholt werden. Grösster
  gemessener Single-Fragment-Ausreisser: 211 KB (ganze BPV-Seite als ein
  Fragment) — Risiko: sehr grosse Erlasse (OR 937 KB) erzeugen grosse
  Einzel-Fragmente, die bei Treffer voll geladen werden.

## Verdikt

**Weder ersetzen noch blind ergänzen — nur mit erheblichem Zusatzaufwand
brauchbar, und dann nur als Volltext-ERGÄNZUNG neben dem bestehenden
Norm-Sprung-Parser, nie als dessen Ersatz.**

- **Nicht ersetzen:** der wichtigste Kanal (Norm-Zitat, 94.4 % Recall@1)
  ist ein deterministischer Parser, kein Volltextindex — pagefind kann
  ihn nicht abbilden und würde ihn ohne Weiteres verschlechtern (Kanton
  vor Bund, keine SR-Nummer-/Alias-Auflösung CO=OR/CC=ZGB/CP=StGB/
  LDIP=IPRG, keine bis/ter-Varianten-Logik).
- **Ergänzen (Kanton-Volltext) ist die einzige plausible Nische:** die
  Lazy-Chunk-Architektur löst genau das Problem, das zur Kanton-Streichung
  führte (fixer 4.66-MiB-gzip-Erst-Download). Voraussetzung für
  brauchbare Qualität: (a) `data-pagefind-body` auf den Artikel-Container
  scopen (Nav/Header/Footer raus), (b) `data-pagefind-weight`/Filter
  Bund>Kanton, (c) `id`-Attribute auf jedem `<article>` ergänzen für
  Artikel-Deep-Links (heute fehlt das), (d) eigener
  Ranking-Layer/Re-Ranking on top, weil pagefind selbst keine
  Domain-Synonyme/Gewichtung kennt. Das ist kein Config-Flip, sondern ein
  Bau-Schritt mit Frontend-Integration (zweite Suchbibliothek neben
  FlexSearch, §5-Konflikt: "Single Source of Truth" — zwei Suchpfade
  parallel pflegen).
- **Aufwand:** mittel — Erlass-Renderer um `id`/`data-pagefind-*`
  erweitern, Build-Schritt (`npx pagefind`) in `npm run build` einhängen,
  neue UI-Komponente für Kanton-Fallback-Suche, Qualitätssicherung gegen
  das Gold-Set aufbauen (aktuell existiert kein pagefind-Adapter für
  `suche-eval.ts`).
- **Risiken:** (1) Ranking-Qualität wie gemessen unterlegen ohne Tuning;
  (2) zwei Suchlogiken im Produkt (§5-Spannung); (3) grosse
  Einzel-Erlasse (OR) erzeugen grosse Fragment-Downloads bei Treffer;
  (4) kein Determinismus-Nachweis wie bei FlexSearch+eigener Ranking-Fn
  (§2) — pagefind-Ranking ist Bibliotheks-intern, nicht auditierbar wie
  `artikelRanking.ts`.

Kein Bau ausgelöst — reine Messnotiz.
