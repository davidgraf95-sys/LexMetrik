# R1 — Fussnoten-Zensus Bund-Struktur-Sidecars (Änderungskette Artikel→Datum→oc→fga)

Repo: /Users/david/Developer/LexMetrik (main, read-only). Skripte:
- zensus.py (Session-Scratchpad, nicht archiviert) (Kernzahlen, Formulierungs-Familien, naive Same-Date-Diff-OC)
- zensus2.py (Session-Scratchpad, nicht archiviert) (präzise Same-Date-Diff-OC via AS-Label-Match)
- deckung.py (Session-Scratchpad, nicht archiviert) (Deckungsprobe gegen revisionen-raw)

## 1. Kernzahlen (`python3 zensus.py`, 227 Sidecars `public/normtext/struktur/bund/*.json`)

- Erlasse: 227
- Artikel gesamt: 25 403
- Fussnoten gesamt: 31 176
- Fussnoten mit ≥1 oc-Link: 25 135 (80,6 %)
- Fussnoten mit oc UND fga: 13 261 (42,5 %)
- Fussnoten NUR fga (kein oc): 48
- Fussnoten ohne jeden Link: 908 (2,9 %) — reine Prosa (Terminologie, Ursprünglich-Hinweise, SR-freie Bezeichnungs-Fussnoten)
- Fussnoten mit «Berichtigt/Berichtigung» im Text: 54
- Fussnoten mit `absatz`/`item` gesetzt (Granularität unter Artikel): 19 341 (62,0 %)
- Fussnoten auf Artikel-Ebene (`absatz`=`item`=null): 11 835 (38,0 %)

## 2. Formulierungs-Familien (Regex-Zensus, Zählung je Fussnote, Mehrfachtreffer möglich)

| Familie | Treffer | Beispiel |
|---|---|---|
| «Fassung gemäss … in Kraft seit» | 11 817 | ADOV Art.5, AHVG Art.1 |
| «Eingefügt durch» | 8 439 | AHVG Art.1/3 |
| «Aufgehoben durch» | 2 553 | AHVG Art.3 |
| «mit Wirkung seit» | 2 593 | AHVG Art.3 |
| «in Kraft vom … bis …» (befristet) | 59 | AHVG Art.39/34bis |
| «Ursprünglich …» | 273 | AHVG Art.41/154 |
| Sammelerlass «Anhang Ziff. N des …» | 2 496 | AHVG Art.1/5 |
| «Berichtigt/Berichtigung» | 169 | AHVV Art.9/30 |
| «Bereinigt» | 5 | AVO Art.21, ICAO Art.48 |
| «trat(en)/tritt … in Kraft» | 12 | AHVG Art.154, AVIG Art.120b |
| **sonstige** (kein Muster oben getroffen) | 8 921 | ADOV Art.9 («bis 31.12.2012 «Vormundschaftsbehörde»»), ADOV Art.11 («SR 311.0») |

Wichtig: «sonstige» (8 921) ist eine PRO-FUSSNOTE-Metrik meines Zensus, NICHT direkt vergleichbar
mit der «Rest-Familie 46 Artikel» aus dem Dossier — letztere zählt PRO-ARTIKEL, ob **irgendeine**
Fussnote des Artikels ein vom Parser `revisionen-extrakt.ts` erkanntes Datum liefert. Ein Grossteil
meiner «sonstigen» 8 921 Fussnoten sind gar keine Änderungs-Fussnoten (Terminologie-/SR-Verweis-
/Bezeichnungs-Hinweise ohne Trigger-Wort) — kein Parser-Defekt, sondern korrekt nicht-datierbare Prosa.

**Vergleich mit `revisionen-extrakt.ts`:** Der Parser erkennt exakt die 3 Trigger «in Kraft seit» /
«mit Wirkung seit» / «in Kraft vom» (TRIGGER_RE, Zeile 76) — das deckt die Familien 1–5 UND 7
(Sammelerlass, da dessen Text ebenfalls «…, in Kraft seit» enthält) strukturell ab, ABER: er
extrahiert nur `{iso, as}` aus dem TEXT per Regex (AS_RE) — er liest **niemals** `fn.links[]`
(oc-/fga-URLs) aus. Die geplante Änderungskette Artikel→Datum→**oc-ELI**→**fga-ELI** ist mit dem
heutigen Parser NICHT abbildbar, auch wenn das Text-Pattern erkannt wird — die AS-Fundstelle bleibt
ein String («AS 2004 5085»), nie ein Link-Objekt.

**Zensus-Dossier `bibliothek/normtext/artikel-revisionen-fussnotenformen-2026-07-26.md`:** Stand
26.7.2026, Korpus damals 202 Erlasse/31 145 Fussnoten (heute 227/31 176 — Korpus ist seither
gewachsen, +25 Erlasse/+31 Fussnoten netto). Die dort dokumentierte Rest-Familie (46 Artikel, 11
Varianten: «, Kraft seit» ohne «in», «trat(en)/tritt … an X in Kraft», «In Kraft seit»
Satzanfang, «in Kraft <Datum>» ohne «seit», «mitWirkung seit» ohne Blank, «in Kraft getreten am»,
«mit Wirkung am», Einzelfälle) ist eine PLAUSIBLE, aber NICHT in dieser Session nachgezählte Zahl
(Korpus-Drift seit 26.7. macht eine Wiederholung fällig, wie im Dossier selbst unter §4
Pflegebedarf verlangt — noch nicht getan).

## 3. Sonderfälle

**a) Zwei verschiedene oc-Erlasse am selben Inkraft-Datum im selben Artikel** — naive Zählung
(jeder oc-Link im Fussnoten-Array pauschal jedem im Text gefundenen Datum zugeordnet) ergab 3 005
Fälle — **methodisch verzerrt** (überzählt, weil ein Fussnotentext mit mehreren Klauseln/Daten
alle seine Links jedem Datum zuschlug). Präzise Nachprüfung (`zensus2.py`, AS-Label→Link-Match wie
im echten Parser-Vorbild) ergibt **122 echte Fälle** korpusweit, u. a. bestätigt das genannte
Beispiel **OR Art. 336c, 1.7.2021** (`eli/oc/2020/799` + `eli/oc/2021/288`). Weitere Beispiele:
AHVG Art.1/64 (1.1.2003, zwei ATSG-Begleiterlasse), AIG Art.103c (12.6.2026, DREI oc-Erlasse am
selben Datum), AIG Art.109a (drei oc-Erlasse, zweimal). Die 122 sind eine Untergrenze (Skript
prüft nur Fälle mit klarem AS-Label-Match; Sammelerlass-Ketten mit BBl-only-Referenz o. Ä. bleiben
unentdeckt).

**b) Fussnoten mit mehreren fga-Links** (Botschaft + Stellungnahme o. Ä.): 2 498 von 31 176
Fussnoten (8,0 %) tragen ≥2 fga-Links; 16 328 fga-Links gesamt.

**c) fga-Link-Format-Anomalien:** 0 von 16 328 fga-Links weichen vom Muster `eli/fga/JJJJ/N` ab
— das im Auftrag genannte Altformat (`2_551_574_494`) kommt im AKTUELLEN 227-Erlass-Bund-Korpus
NICHT vor. Entweder ist das Altformat bereits vollständig bereinigt/repiniert, oder es betrifft nur
Kantons-Korpus/andere Quellen ausserhalb dieses Sidecar-Bestands — in dieser Session nicht
weiterverfolgt (offen).

## 4. Deckungsprobe gegen `bibliothek/normtext/revisionen-raw/<KEY>.json` (5 Erlasse)

`revisionen-raw` = SPARQL-Rohantwort (`bBindings` = primär-SR-klassifizierte oc-Änderungserlasse,
Stand 10.7.2026, dokumentiert in `bibliothek/normtext/revisionen-2026-07-10.md`).

| Erlass | raw oc-Erlasse | Fussnoten-distinct-oc | davon in raw | Anteil | fehlend |
|---|---|---|---|---|---|
| OR | 30 | 174 | 22 | **12,6 %** | 152 |
| ZGB | 40 | 100 | 36 | **36,0 %** | 64 |
| DSG | 7 | 5 | 2 | **40,0 %** | 3 |
| ZPO | 9 | 31 | 8 | **25,8 %** | 23 |
| SchKG | 16 | 68 | 12 | **17,6 %** | 56 |

**Die geplante Tor-Bedingung `fussnote.oc ⊆ revisionen(erlass)` HÄLT NICHT** — Deckung liegt bei
12,6–40,0 %, nicht bei den für ein hartes Tor nötigen ~100 %. Zwei Ursachen identifiziert:

1. **Dokumentierter Scope-Unterschied** (`revisionen-2026-07-10.md` §3, «Mantel-/Sammelerlass-
   Lücke»): Pfad (b) der SPARQL-Abfrage listet nur oc-Erlasse, die PRIMÄR unter der Ziel-SR
   klassifiziert sind. Änderungen über Mantel-/Sammelerlasse anderer SR (Fussnoten-Familie
   «Anhang Ziff. N des BG …», 2 496 Treffer korpusweit) fallen NICHT als eigener oc-Eintrag in
   `bBindings`, sondern höchstens als datumsloser «Sammelerlass-Marker» in Pfad (a). Nachgezählt
   für OR: von den 510 fehlenden Fussnoten-Vorkommen (dedupliziert 152 oc-Werte) enthalten 218
   (42,7 %) das Wort «Anhang» — erklärt gut ein Drittel der Lücke.
2. **Unerklärter Rest (~57 % der Fehltreffer bei OR):** direkte, nicht-Sammelerlass-Änderungen
   («Ziff. I/II des BG vom …») fehlen ebenfalls in `bBindings`, z. B. `eli/oc/1984/778` (OR Art.49,
   «Fassung gemäss Ziff. II 1 des BG vom 16. Dez. 1983»). Zusatzbefund: `raw/OR.json` bBindings
   beginnen erst bei Jahr **2001** — von den 116 Fussnoten-oc-Werten vor 2001 ist nur **1** in raw
   enthalten; selbst NACH 2001 sind nur 21/58 (36 %) gedeckt. Ob das ein SPARQL-Zeitfenster-
   Artefakt, ein veralteter Snapshot (Stand 10.7.2026 vs. seither gewachsenes Sidecar-Korpus) oder
   eine echte Klassifikations-Lücke ist, wurde in dieser Session NICHT abschliessend geklärt
   (offen — Root-Cause-Analyse wäre eigener Recherche-Auftrag).

Fazit §4: Die Tor-Bedingung braucht entweder (a) eine erweiterte SPARQL-Abfrage ohne Primär-SR-
Filter/Zeitfenster-Lücke, oder (b) eine bewusste Ausnahme-Liste (Sammelerlass-Fälle) plus Klärung
der Vor-2001-Lücke, bevor sie als hartes Rot-Tor scharf geschaltet wird.

## 5. ROADMAP-Behauptung M15 (Zeile 205) — TEILWEISE FALSCH lokalisiert

Zitat ROADMAP: «AKN `<authorialNote>`-refs … werden in `adapter-htm.ts` heute gestrippt».

**Befund:** Die Bund-Haupttext-Erzeugung (`public/normtext/bund/OR.json`, über
`scripts/normtext-snapshot.ts` → `extrahiereArtikel` aus `scripts/normtext/extrahiere-fedlex.ts`)
strippt die Fussnoten-Marker NICHT in `adapter-htm.ts`, sondern in `extrahiere-fedlex.ts` selbst:

- `entferneFussnotenSups()` (Zeile 74–77): entfernt `<sup><a href=…>NNN</a></sup>`-Marker aus dem
  Artikel-Fliesstext.
- Zeile 126–132: der komplette Fussnoten-Apparat (`<div class="footnotes">…`) wird vor der
  Artikel-Extraktion abgeschnitten («Apparat steht am Artikelende»).

`adapter-htm.ts`s `bereinige()` (Zeile 101 ff.) ist ein STRUKTURELL ähnlicher, aber SEPARATER
Strip-Pfad für einen anderen Quelltyp — cantonal-taugliche MS-Word-HTML-Seiten (`_ftn`-Anker,
`MsoFootnoteReference`-Spans, `Javascript:MyDocumentNote`), aufgerufen über `holeHtm()` in
`scripts/normtext-snapshot.ts` Zeile 39/698–700 für kantonale HTM-Quellen — NICHT im
Bund-Fedlex-Codepfad. Zusätzlich ist die Quelle kein rohes AKN-XML mit `<authorialNote>`-Tag,
sondern das gerenderte Fedlex-Filestore-HTML (`<sup><a>`-Muster) — die ROADMAP-Formulierung
vermischt AKN-Terminologie mit der tatsächlichen HTML-Scraping-Pipeline.

**Zweiter Teil der Behauptung (Struktur-Sidecar unberührt) — BESTÄTIGT:** `struktur-run.ts` →
`fussnoten-extrahiere.ts` (`extrahiereFussnoten`) liest DIESELBE Quelle, behält aber Marker, Text,
Links (oc/fga), `absatz`/`item`/`pos`/`kl` — das ist exakt das Schema, das dieser Zensus oben
ausgewertet hat. Die Ist-Aussage «Sidecar trägt die Links, Haupttext nicht» ist korrekt; nur der
Dateiname im Beleg ist falsch.

**Korrektur für Roadmap-Pflege:** `AKN <authorialNote>`-Strip findet in `scripts/normtext/
extrahiere-fedlex.ts` (Funktionen `entferneFussnotenSups`, Zeile 74; Footnotes-Div-Schnitt, Zeile
126–132) statt, NICHT in `adapter-htm.ts`.

## 6. Revisions-Shard-Generator (Stand heute)

- **Skript:** `scripts/verzahnung/extrahiere-artikel-revisionen.ts` (`npm run gen:artikel-revisionen`,
  Drift-Tor `npm run check:artikel-revisionen`).
- **Quelle:** liest NUR `public/normtext/struktur/bund/*.json` (`doc.artikel`), ruft
  `baueRevisionProArtikel()` aus `src/lib/verzahnung/revisionen-extrakt.ts` auf.
- **Ausgabeschema je Erlass** (`public/verzahnung/artikel-revisionen/<KEY>.json`):
  `{ erlass: string, proArtikel: Record<token, { iso: string, as: string }> }` — NUR Artikel MIT
  datiertem Beleg, sortierte Tokens.
- **Grösse:** 202 Shard-Dateien, gesamt 1,1 MB (`du -sh public/verzahnung/artikel-revisionen/`);
  OR.json = 25 600 Bytes, 543 Artikel mit Revision. Beispiel-Eintrag OR Art.13:
  `{"iso":"2005-01-01","as":"AS 2004 5085"}`.
- **Was fehlt für die Änderungskarte:**
  - **oc-ELI** (z. B. `eli/oc/2004/788`) — nicht enthalten, nur der textuell abgeleitete
    Fundstellen-String `as`.
  - **fga-ELI** (Botschaft) — komplett fehlt; kein Feld dafür vorgesehen.
  - **Absatz/Buchstabe-Granularität** — der Shard aggregiert auf Artikel-Ebene (max über alle
    Fussnoten); die Sidecar-Fussnoten selbst tragen `absatz`/`item` (62,0 % der Fussnoten,
    s. Ziff. 1), das geht beim Shard-Bau verloren.
  - **Erlass-Titel** — Shard trägt nur den Register-Key (`OR`), keinen Klartext-Titel.
  - **Mehrfach-Ereignisse je Artikel** — der Shard behält nur das MAXIMUM-Datum (`baueRevisionProArtikel`),
    nicht die volle Kette aller historischen Änderungen (das leistet bereits, orthogonal, der G-HIST-
    Parser `src/lib/normtext/historie-parse.ts` + `scripts/normtext/historie-generieren.ts` — DER
    erfasst pro Segment `typ`, `datum`, `wirkung`, **`quellen: FnLink[]`** (Label+URL, also oc/fga
    bereits als Link-Objekt!) sowie `absatz`/`item`. Dieser Parser ist die naheliegende Basis für
    E2, nicht `revisionen-extrakt.ts`, das nur das Schluss-Datum je Artikel kennt und Links nie anfasst).

## Bewertung Planannahme + E2-Bedarf (siehe Kurzantwort)

Skript-Nachweise: alle Zahlen oben reproduzierbar über die drei genannten Python-Skripte im
Scratchpad (`zensus.py`, `zensus2.py`, `deckung.py`), Rohdaten `zensus_result.json` im selben
Ordner. Keine Repo-Datei verändert.
