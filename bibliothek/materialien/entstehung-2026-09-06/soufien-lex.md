# Recherche: Projekt "Lex" (Soufien Hajji, law.soufien.lu) — für "Entstehung am Artikel"
Abrufdatum: 2026-09-06. Quellen: GitHub API + raw.githubusercontent.com (User SFHAJJI),
1x WebFetch der Live-Seite. Klarname "Soufien Hajji" nur aus Domain/Handle-Konsistenz
geschlossen, nicht direkt aus GitHub-Profilfeld verifiziert (offen).

## 1. Repos (github.com/SFHAJJI, Stand pushed_at aus API)
| Repo | Sprache | Lizenz (LICENSE wörtlich) | Sterne | zuletzt gepusht | Rolle |
|---|---|---|---|---|---|
| `lex` | C#/.NET + TS-Web | **Apache License 2.0** (Volltext ab "Apache License, Version 2.0, January 2004") | 9 | 2026-09-06 | Engine: Extraktion, Index, MCP, Web-UI, Diff, Tests |
| `lex-articles` | Daten | **CC-BY-4.0** (Volltext) | 6 | 2026-08-26 | Konsumschicht: JSON/MD je Artikel, `catalog.json`, `SCHEMA.md` |
| `lex-corpus-lu-legilux` | Daten | CC-BY-4.0 | 5 | 2026-08-15 | Evidenz LU: verbatim AKN-XML, sha256, append-only |
| `lex-corpus-eu-eurlex` | Daten | CC-BY-4.0 | 5 | 2026-08-26 | Evidenz EU: Formex4/XHTML |
| `lex-git-lu` | generiert | CC-BY-4.0 | 3 | 2026-08-06 | Lens: 1 Commit je Gültigkeitsdatum |
| `lex-ops` | Shell | Apache-2.0 | 6 | 2026-08-31 | Ops/Deployment |

`lex`: erstellt 2026-07-31, 15.4 MB, 0 Forks — keine fremden Contributor sichtbar
(nicht per `git log` verifiziert, nur aus Fork-Zahl geschlossen).
**Lizenz-Verdikt: bestätigt** — Code Apache-2.0, Daten CC-BY-4.0, beide LICENSE-
Dateien beginnen exakt mit dem jeweiligen amtlichen Lizenztext.

## 2. Methode Artikel-Historie
Quelle: Akoma Ntoso 3.0 XML verbatim von Legilux (LU), Formex4/XHTML von Cellar
(EU) — kein HTML-Rendering-Diff. **Artikel-Identifikation:** publisher-geprägter
Anchor (AKN `id`-Attribut, z.B. `art_92`), nie neu vergeben (`AknLuProfile.cs`:
"publisher-minted anchors are reused, never re-minted"); Fallback `{type}_{ordinal}`
nur ohne Publisher-Anchor. Historie eines Artikels = alle Fassungen des Werks nach
demselben Anchor gefiltert/sortiert (`history.json`), **kein Fassungs-Diff zur
Erkennung**, Diff kommt erst für die Darstellung. Umnummerierung ("art_5→art_5bis")
mechanisch über **eindeutigen Text-Hash-Match** (Spec D46), nicht Ähnlichkeit.
Ordinal-Doppelschreibung FR "art_1er" vs. DE "art_1" separat behandelt
(`OrdinalArticleRetrievalTests.cs`).
Extraktionsprofile (`src/Lex.Derive/`): `AknLuProfile`/`V2`/`V3` (Artikel+Annex aus
AKN), `AknLuDocumentProfile` (Fallback: ganzer `<body>` als 1 Provision ohne
Artikelgrenzen), EU-Varianten `XhtmlEuProfile`/`TolerantHtmlEuProfile`. Format-Sniff
statt Dateiendung (`StructuredTextExtractor.Extract`). Profile sind versioniert und
für immer lauffähig (nie verändert, nur neu daneben).
**Normalisierung nur fürs Diff-Matching**, nie für Hash/Speicherung: `web/src/diff.ts`
`sameWord()` — Apostroph-/Gedankenstrich-/Leerzeichen-/Anführungszeichen-Varianten,
`œ→oe`, lowercase; angezeigt wird Original, gematchte Tokens in der **späteren**
Fassungsschreibung.
**Diff:** Wort-LCS (`lcsWords`), Eskalation auf Absatz-Ebene (`byParagraph`) ab
`CELL_CAP=4_000_000` LCS-Zellen (Praxisfall: AIFM-Gesetz Art.14, 1200→3500 Tokens).
**Prüfkette:** zwei Hashes je Fassung (`CorpusHashes.cs`): `body_sha256` = sha256 auf
verbatim Publisher-Bytes; `record_sha256` = sha256 auf kanonisches JSON der Version
**ohne das Hash-Feld selbst** (Feld auf null, dann serialisieren+hashen), Vergleich
zeitkonstant. `text_sha256` in `lex-articles` verkettet zurück auf `body_sha256` im
Evidenz-Repo (`examples/03_verify_hash_chain.py`).
**Volumen** (`catalog.json`, lex-articles, Stand 2026-09-06): 2'584 Werke, 7'826
Fassungen, 119'652 Anchors (LU dicht ab 2017 + kuratierter EU-Ausschnitt).

## 3. UI-Muster (WebFetch: `/lu-legilux/rgd-1998-08-03-n4/2018-05-23`, 17 Fassungen)
1. Stichtag: URL `/lu-legilux/<werk-id>/<DATUM>--<HASH>`, Banner «Point-in-time view
   as at 2018-05-23. This version has been superseded, it applied 2018-05-22 →
   2018-07-15.» + Link «Jump to the version in force today». Fassungsliste statt
   Datepicker.
2. Artikel-Liste: vollständiges Verzeichnis mit Ankern (`#art_1er`…`#art_1268`),
   Änderungszitat je Artikel («L. 13 mars 2009»-Stil) — direkte Mémorial-/chd.lu-
   Hyperlinks im Testausschnitt **nicht bestätigt**.
3. Diff: eigene Route `/lu-legilux/<werk-id>/diff/<HASH1>/<HASH2>`, Einstieg über
   «see exactly what changed next»; Inline-Wort-Diff (Fliesstext mit +/-), **keine**
   bestätigte Seite-an-Seite-Synopse alt/neu.

## 4. Übernehmbarkeit
**(a) Darstellung — übernehmbar ohne Code:** Stichtags-Banner-Text-Muster
(superseded, galt VON→BIS, Sprung zu heute); Datum-im-Pfad statt Query-Param;
eigene verlinkbare Diff-Route; Inline-Wort-Diff statt Zeilen-Diff für Gesetzestext.

**(b) Algorithmus — übernehmbar als Beschreibung (Sprachwechsel nötig):**
Publisher-Anchor statt Textähnlichkeit für Artikel-Identität über Fassungen —
direkt analog zu Fedlex-eIds (`art_N`); Umnummerierung über exakten Hash-Match
(passt zu §2 Determinismus); zwei getrennte Hashes (Bytes vs. kanonischer Record)
als Prüfketten-Muster (passt zu §7); Wort-LCS mit Absatz-Eskalation als
Performance-Vorlage für lange Artikel; Normalisierung nur fürs Matching, nie für
Hash/Speicherung als übertragbares Prinzip.

**(c) Code — nur `lex` (Apache-2.0) käme lizenzrechtlich in Frage.** Praktisch nur
`web/src/diff.ts` (reines TS, ~100 Zeilen, keine Fremd-Deps) ist 1:1 portierbar
(Attribution/NOTICE beachten); Rest ist C#/.NET (Extraktion/Index/MCP), passt
nicht zum LexMetrik-Stack.

**Was nicht 1:1 geht (Fedlex CH vs. Legilux LU):**
- Anchor-Format: Legilux AKN-**XML**-`id` vs. Fedlex AKN-**HTML**-`eId` (ab ca.
  2021) — Extraktionsprofil muss neu geschrieben werden, nicht übernommen.
- Konsolidierungs-Dichte "ab 2017 dicht, davor sparse" ist Legilux-spezifisch,
  für Fedlex/kantonales Recht separat zu prüfen.
- Sprachstruktur: LU zweisprachig FR/DE mit spezifischem Ordinal-Sonderfall
  (art_1 vs. art_1er); CH vierspr. DE/FR/IT/RM — eigene Prüfung nötig.
- Rechtsnatur: Legilux-Konsolidierungen sind laut Projekt **nicht amtlich**
  ("only the Journal officiel is authentic"); Fedlex-Konsolidierung ist die
  amtliche systematische Sammlung — unterschiedlicher Amtlichkeits-Status,
  relevant für §7/§8 (nicht das Legilux-Framing übernehmen).
- Lizenz der Rohdaten: Legilux-Bytes laut Projekt CC-BY; Schweizer Erlasse sind
  gemeinfrei nach Art. 5 URG (anderes Regime) — die sha256-Prüfketten-Methode
  ist lizenzunabhängig übernehmbar, die Lizenz-Aussage selbst nicht.

## Offen (nicht mit ≤25 Fetches geklärt)
Klarname-Verifikation; konkrete Diff-Farbcodes; ob eine Seite-an-Seite-Synopse
irgendwo im Produkt existiert (evtl. `/built`-Dossier, nicht geprüft); ob/wie
Mémorial-/chd.lu-Links im Produkt tatsächlich verlinkt sind; echte
Ein-Personen-Projekt-Bestätigung (nur aus 0-Forks geschlossen).
