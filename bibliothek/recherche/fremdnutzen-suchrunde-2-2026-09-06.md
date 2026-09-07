# Fremdnutzen-Suchrunde 2 (6.9.2026) — amtliche Rechner als Orakel · amtliche Sprachdaten · Bedienmuster der Gesetzesportale

**Erstellt:** 6.9.2026, Auftrag David («können wir sonst noch von fremden sachen profitieren?» → Vorschlag dreier noch nie abgesuchter Richtungen, Freigabe «ok»). Drei parallele read-only-Recherchen (Sonnet, Belegpflicht per URL/Abrufdatum und `gh api`; Gemini nach der Messung vom 5.9. bewusst nicht eingesetzt). Gemeinsamer Kontext-Auftrag im Session-Scratchpad; LexMetrik-Code unberührt.
**Status:** ERSTRECHERCHE (Abruf aller Quellen 6.9.2026; Portale teils nur über Sekundärquellen, wo Bot-Schutz den Abruf blockierte — je Fund vermerkt; keine fachliche Abnahme nötig, kein Rechtsinhalt).
**Quellen:** je Abschnitt inline (URL + Abrufdatum 6.9.2026). Vorgänger: [Rules-as-Code-Sichtung 5.9.2026](rules-as-code-sichtung-2026-09-05.md), [Fremdquellen-Sichtung 2.9.2026](fremdquellen-sichtung-2026-09-02.md).

---

## 0. Ergebnis in fünf Sätzen

Richtung 1 ist im Kern ein Negativbefund: kein Kanton und nicht das Bundesgericht betreibt einen interaktiven amtlichen Gebührenrechner; als Golden-Quellen bleiben zwei amtliche Excel-Dateien (Kantonsgericht Wallis 2025, Steuerrekursgericht Zürich 2019), datierte HTML-Tabellen (Notariat SG) und die Tariferlasse selbst. Richtung 2 liefert eine amtliche Terminologie-Quelle (TERMDAT über LINDAS-SPARQL, Lizenz noch zu klären), einen MIT-lizenzierten Stemmer für DE/FR/IT und die noch unbelegte Vorfrage, ob Fedlex-Artikelkennungen sprachübergreifend identisch sind. Richtung 3 ergibt zwölf Bedienmuster, von denen acht im Plan schon stehen und drei neu aufgenommen werden (Nachbar-Artikel-Pfeile, Rohdaten-Link je Erlass, Fassungs-Diff-Tab). Für den elektronischen Rechtsverkehr (BEKJ) gibt es noch keine publizierte Formatvorgabe, für Fedlex und Bundesgericht keinen Zotero-Translator. Direkt nutzbar ohne Vorfrage: die Wallis-Excel als Golden, die SG-Tabelle, der Stemmer; alles andere trägt eine Klärung (Lizenz TERMDAT, eId-Konsistenz) vor sich her.

## 1. Amtliche Online-Rechner und Tabellen als Prüf-Orakel (Richtung 1)

**Hypothese widerlegt:** Es gibt keinen amtlichen Web-Rechner mit URL-Parametern, den man automatisiert gegen unsere Engines laufen lassen könnte. Private Rechner (gerichtskostenrechner.ch, Betreiber Durchblick Consultancy BV; verzugszinsrechner.ch u. a.) sind nach §7 keine Quelle.

| # | Fund | Träger · Stand | Eignung |
|---|---|---|---|
| 1 | **Kantonsgericht Wallis — Calcul des frais de justice** (Excel), vs.ch/de/web/tribunaux/calcul-des-frais-de-justice | amtlich · Datei aktualisiert 7.2.2025 (zweite Datei 2010) · keine Nutzungsbedingungen genannt | **mittel–hoch als Golden VS**, Formel in der Datei noch nicht geöffnet |
| 2 | **Steuerrekursgericht ZH — Gebührenrechner** (Excel), strgzh.ch/hilfsmittel/gebuehrenrechner | amtlich · Dateiname Juni 2019 | mittel; gegen heutige Norm prüfen, bevor Werte übernommen werden |
| 3 | **Amtsnotariate SG — Gebührentabelle** (HTML), sg.ch/recht/handelsregister-notariate/amtsnotariate/gebuehren.html | amtlich · «letzte Aktualisierung 27.3.2026», Rechtsgrundlage genannt, MWST 8,1 % inkl. | **hoch als Golden SG-Notariat** |
| 4 | **Tarif Gerichtsgebühren Bundesgericht** SR 173.110.210.1, fedlex.admin.ch/eli/cc/2006/837/de | Bund | hoch, Tabelle statt Rechner (ist bei uns vermutlich bereits Quelle von `bundesgericht.ts` — abgleichen) |
| 5 | **Existenzminimum-Richtlinien** — AG (PDF, ag.ch), LU (steuerbuch.lu.ch), SG (sg.ch/recht/gerichte), TG (betreibungsamt.tg.ch), ZG (PDF **Stand 2010**), BE (Verband schkg-be.ch); Zentralverband betreibung-konkurs.ch ist ein Verein, nicht Behörde | kantonal amtlich, KBK-Richtlinien nur quasi-amtlich | hoch als Stammdaten für die geplante Karte `existenzminimum` (`status: geplant`), je Kanton Stand prüfen (ZG-Drift) |

**Kanton × Rechnertyp:** Gerichtskosten nur Gesetzestext in 24 Kantonen, Excel in VS, unverifizierte PDF-Formulare ZH (gerichte-zh.ch, Abruf scheiterte); Schlichtung/Parteientschädigung/Grundbuch: nirgends ein amtlicher Rechner. Nicht einzeln geprüft: Existenzminimum in BS/BL/GE/VD/TI/FR und den Kleinkantonen; notariate-zh.ch (Behörde oder Verband?).

## 2. Amtliche Sprach- und Terminologiedaten (Richtung 2)

| # | Fund | Beleg | Nutzen / Einordnung |
|---|---|---|---|
| 1 | **TERMDAT** (Bundeskanzlei), ~400 000 Einträge DE/FR/IT/RM/EN; als Linked Data: SPARQL `register.ld.admin.ch/query/`, Graph `lindas.admin.ch/fch/termdat`, JSON-LD/Turtle | register.ld.admin.ch/.well-known/dataset/termdat, termdat.bk.admin.ch | Glossar, Such-Synonyme, FR/IT-Begriffe. **Lizenz nicht ausgewiesen** (nur admin.ch-AGB) → vor Bulk-Übernahme klären; kein TBX-Export für Dritte |
| 2 | **Fedlex dreisprachig** — Akoma-Ntoso mit `eId` je Artikel seit 30.5.2022 | github.com/swiss/fedlex-jolux (Lizenz `null`), fedlex.data.admin.ch/sparqlendpoint | **Vorfrage offen:** sind `eId` in DE/FR/IT identisch? Ohne Beleg kein FR/IT-Leser-Alignment. Erst per SPARQL/AKN an einem Erlass (z. B. OR) prüfen |
| 3 | **BGE-Regesten** amtlich dreisprachig, Volltexte nicht; **kein ECLI** in der Schweiz | bger.ch FAQ 38 | Paralleltext nur für Leitentscheide; Rechtsprechungs-Register könnte FR/IT-Regesten führen |
| 4 | **Amtliche Wortlisten:** GTR Stand 5.6.2026 (bk.admin.ch, PDF) mit Abkürzungsverzeichnis; GR-Rechtsbuch dreisprachig (gr-lex.gr.ch), BE zweisprachig gleichwertig (BELEX) | bk.admin.ch, gr.ch, sta.be.ch | GTR-Abkürzungen: Abgleich mit `abk-aliase.generated.ts`; GR/BE als erste mehrsprachige Kantone. VS/FR/GE/VD/TI/NE/JU nicht einzeln geprüft |
| 5 | **Forschungs-Korpora** `rcds/*` auf Hugging Face (swiss_legislation, swiss_leading_decisions, swiss_judgment_prediction, swiss_doc2doc_ir …), Lizenz laut Snippet CC-BY-4.0 | huggingface.co (Datensatzkarten nicht einzeln abgerufen) | nur Testdaten für Zitat-Erkennung/Alignment, nie Quelle; Lizenz je Karte vor Nutzung prüfen |
| 6 | **Stemmer JS:** `MrRefactoring/multilingual-stemmer` (MIT, Wasm, 34 Sprachen, Push 3.8.2026, 11★) · `node-snowball` (MIT) · `snowball-stemmers` (ISC); `lunr-languages` MPL-1.1, Push 2019 → meiden | npm, gh api | **direkt verwendbar** für DE/FR/IT-Stemming in der Korpus-Suche; Wirkung erst gegen `suche-eval-gold` messen |

## 3. Bedienmuster reifer Gesetzesportale (Richtung 3)

Live abgerufen: Légifrance, legislation.gov.uk, gesetze-im-internet.de, dejure.org, buzer.de, RIS AT, Canada Justice Laws, EUR-Lex. Nur Sekundärquellen (Bot-Schutz 403): AustLII, legislation.govt.nz. Nicht auswertbar (JS-Seiten): Fedlex, lexfind.ch.

| # | Muster | Beleg | Plan-Stand LexMetrik |
|---|---|---|---|
| 1 | Vor/Zurück-Pfeile zum Nachbarartikel | gesetze-im-internet, dejure, buzer | **neu** → `W2·5m-LESER-V3` |
| 2 | Änderungs-Timeline je Artikel mit Stichdaten | legislation.gov.uk «Timeline of Changes» | gedeckt: `W2·5l-NORMTEXT-B2` M16 |
| 3 | Rechtsprechung direkt am Artikel | dejure (§ 90 BGB: 475 Entscheide) | gedeckt: `W2·7-VZUI` |
| 4 | «Cited by / Noteup» | AustLII (Sekundärquelle) | gedeckt: `W2·22-VERWEIS-FEDLEX` |
| 5 | Zitiervorschlag mit Copy-Button, Permalink/ELI | dejure, EUR-Lex | gedeckt: `W2·8` Zitat-Export + Zitierstil GTR |
| 6 | Point-in-time-Datumsauswahl | Légifrance ChronoLégi, Canada «Previous Versions», RIS «Fassung vom» | gedeckt: M16 |
| 7 | Gliederungs-Sidebar auf/zu | Légifrance, EUR-Lex | vorhanden (Leser-V3 H1) |
| 8 | Randtitel als eigenes Element | Canada «Marginal note» | vorhanden (AKN `<heading>`) |
| 9 | Fassungsvergleich als Diff-Tab | Légifrance «Comparer les versions» (einziges Portal mit echtem Diff) | **neu** (UI-Anteil zu M16) → `W2·5m-LESER-V3` |
| 10 | Mehrsprachige Nebeneinander-Ansicht | EUR-Lex «Multilingual display» | **neu** → `W3-AUSBAU` FR/IT, gekoppelt an die eId-Vorfrage (§2 #2) |
| 11 | Alle Formate je Erlass (XML/AKN/RDF/PDF) | legislation.gov.uk «Print Options» | **neu** als Rohdaten-Link je Erlass → `W2·5m-LESER-V3` (§7-Transparenz) |
| 12 | Änderungs-Abo je Erlass | buzer.de | gedeckt durch Atom-Feed (`QS-VERWENDEN` V5); Abo je Erlass bräuchte Server → nicht übernommen |

**Nebenfrage A — BEKJ/justitia.swiss:** Teil-Inkraftsetzung 1.10.2025, Plattform frühestens 1.7.2028, Pflicht für berufsmässige Akteure spätestens Mitte 2032 (justitia40.ch Merkblatt Mai 2026). **Keine publizierte PDF/A-Version, eCH-Nummer oder Metadaten-Vorgabe** für Eingaben auf den öffentlichen Seiten; eCH-0164/0175 sind generisch. Folge: Vorlagen-Export nicht an eine Formatvorgabe binden, Wiedervorlage bleibt.
**Nebenfrage B — Zotero:** kein Translator für fedlex.admin.ch/bger.ch im Repo `zotero/translators`; PR #2752 (fedlex + lexfind) seit 23.11.2021 offen, gescheitert am US-zentrischen Feldschema und an lexfind als JS-Seite. Eigenbau-Schätzung (unbelegt): fedlex 1–3 Tage MVP, bger 3–5 Tage plus Pflege. Open-Source-Status von legislation.gov.uk, AustLII, EUR-Lex nicht belegt.

## 4. Konsequenz (Roadmap-Zeilen, 6.9.2026)

- `W3-TARIF-STAND`: amtliche Golden-Quellen (VS-Excel 2025, SG-Notariatstabelle, BGer-Tarif) als Gegenprobe im Tor.
- `W3-AUSBAU`: Existenzminimum-Rechner aus kantonalen Richtlinien; FR/IT-Parallelansicht mit eId-Vorfrage und TERMDAT-Lizenzklärung.
- `W2·5m-LESER-V3`: Nachbar-Artikel-Pfeile, Rohdaten-Link je Erlass, Fassungs-Diff-Tab (UI zu M16).
- `W2·8`: Zotero-Translator fedlex/bger als Eigenbau-Los; PDF/A-Zeile mit BEKJ-Stand ergänzt.
- `QS-KORPUS`: HF-Korpora `rcds/*` als Testdaten für die Zitat-Extraktion (nach Lizenzprüfung je Karte).
- Suche-Band (Ideen-Zeile): DE/FR/IT-Stemming + TERMDAT-Synonyme, erst gemessen gegen `suche-eval-gold`.

## 5. Offen / wartet auf David

- TERMDAT-Weiterverwendungslizenz: anfragen oder auf Einzel-Lookups beschränken? (Klärung technisch-rechtlich, Empfehlung: kurze Anfrage an die Bundeskanzlei, sonst nur Einzelabfrage.)
- Ob FR/IT-Ausbau vor oder nach dem Zielbild Gesetzesleser kommt — bestimmt, ob die eId-Vorfrage jetzt geprüft wird.
