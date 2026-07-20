# Bibliothek — Informationsgrundlagen für LexMetrik

Zentrale Ablage für recherchierte Grundlagen, Quellenregister und Arbeitsmaterial,
das (noch) nicht Code ist. Gliederung in Ordnern (siehe unten); Bestandszahl
NICHT hier hartkodiert (Kurzregel 5 unten — Ordnerinhalt/Tabellen sind die
Wahrheit, keine von Hand geschriebene Kopfzahl).
Verbindlich seit 6.6.2026: **CLAUDE.md §11** — jede Recherche mündet hier in eine
geordnete, engine-orientierte Übersichtsliste mit INDEX-Eintrag.
**Verbindliche Mindeststandards S1–S10: [STANDARDS.md](STANDARDS.md)** —
maschinell durchgesetzt via `bash scripts/bibliothek-check.sh` (Teil des
§9-Bug-Checks). Kurzregeln:

1. **Nur amtliche Quellen als Beleg**, immer mit URL und Abrufdatum (§7);
   kantonale Erlasse stets in der geltenden konsolidierten Fassung via
   Erlasssammlungs-API (`abrogated`/`future_versions` prüfen — Daueranweisung).
2. **Status ehrlich tragen:** zweifach geprüft (Erstrecherche + adversarialer
   Durchgang) · einfach belegt · offen. Übernahme in Engines/Stammdaten erst
   nach fachlicher Abnahme durch David.
3. **Unsicherheiten bleiben sichtbar** (§8) — nie weggeglättet.
4. **Datiertes datiert halten** → [Parameter-Verfallsregister](register/parameter-verfall.md).
5. **Hartkodierte Bestandszahlen (Dokumenten-/Dossier-Anzahl u. Ä.) nur generator-
   gepflegt oder gar nicht** — eine von Hand geschriebene Kopfzahl veraltet
   unbemerkt und wird selbst zur zweiten Wahrheit (§5); Ordnerinhalt/Tabelle
   sind die Wahrheit, nicht ihre Zählung im Fliesstext.

## Gliederung

```
bibliothek/
  register/    Quellen-Register (Fedlex-Stände) · Parameter-Verfallsregister · Engine-Map
  normen/      Regelwerke ZPO·SchKG·StPO·Erbrecht·Feiertage — die Engine-Grundlagen
  behoerden/   Gerichte · Schlichtung · Strafverfolgung · Erbgang · Notariate (je 26 Kantone)
  kosten/      Schlichtungsgebühren · Gerichtskosten Bund · Anwaltstarife
  recherche/   Dossiers zu geplanten Engines/Vorlagen → eigener INDEX.md dort
  muster/      Amtliche Vorlagen verbatim (.txt) + MANIFEST (Quellen-URLs/Stände)
  rechtsprechung/  Register aller zitierten Bundesgerichtsentscheide (Links + Fundorte)
  materialien/ Amtliche Ressourcen / Soft-Law (Behörden-Publikationen) — Rubrik «Materialien»
  normtext/    Volltext-Nebenprodukte (Änderungshistorie/Revisionen-Timeline, Rohdaten) zu den Bund-Erlassen
  seo/         Sichtbarkeit & Performance (CWV-Baseline, Indexierung)
  quellen/     Lokale Quellkopien aus Davids Ablagen (gitignored, Urheberrecht) — committet nur die Sichtung [SICHTUNG.md](quellen/SICHTUNG.md)
```

**Schnellster Einstieg beim Bauen:** [register/engine-map.md](register/engine-map.md)
— Code-Modul → tragende Dossiers → Bau-/Abnahme-Status (neu 7.6.2026).

**Recherche-Dossiers (27, Bau-Priorisierung):** [recherche/INDEX.md](recherche/INDEX.md) —
neu 6.6.2026: [gesellschaftsgruendung](recherche/gesellschaftsgruendung.md)
(Deep-Research, Dokumente je Rechtsform verbatim aus HRegV/OR + Notariats-Praxis)
+ Vertiefungen [gmbh-gruendung](recherche/gmbh-gruendung.md) (inkl. Bauspez.
Maske Gründungsunterlagen) und [ag-gruendung](recherche/ag-gruendung.md)
(inkl. Emissionsabgabe am neu gepinnten StG-Cache)

**Spruchkörper-Extraktion (Richter-Filter):** [rechtsprechung/besetzung-extraktion-2026-07-20.md](rechtsprechung/besetzung-extraktion-2026-07-20.md) —
Fundament des Richter-Filters (`R-RICHTER`, Block A): wie der amtliche Besetzungs-Block
aus BS-Rohdokumenten geschnitten und korpusweit zu Kanon-Slugs normalisiert wird.
Enthält die **Anonymisierungs-Grenze** als testbare Invariante (Leak-Scan korpusweit 0;
«Dr. med.» = legitimer Fachrichter, kein Ausschluss), vier belegte Korrekturen am
ursprünglichen Bauplan (Hidden-Spans, Voll-Vorname statt Initial, Absatz-Naht in
BEIDE Richtungen), die Abdeckungszahlen je Gericht und den Kollisions-Report
(false-merge/false-split) samt Alias-Tabelle. Abnahme-Status: Erstrecherche — die
fachliche Richtigkeit der Alias-Zusammenführungen ist Davids Abnahme.

**Rechtsprechungs-Register:** [rechtsprechung/bge-register.md](rechtsprechung/bge-register.md) —
alle 93 im Code zitierten BGE/BGer-Urteile mit amtlichem Link (URL-Schema §7-verifiziert
6.6.2026: ATF-Permalink bzw. AZA-Suche), Aussage, Code-Fundorten und Status; generiert
aus der SSoT `src/data/verifikation.ts` via `npx vite-node scripts/bge-register-generieren.ts`
(meldet Lücken — Stand: 0). Inhaltliche Abnahme der einzelnen Entscheide: David, offen.

**BGE-Leitentscheide-Import:** [rechtsprechung/bge-leitentscheide-import.md](rechtsprechung/bge-leitentscheide-import.md) —
Stufe 1 des Rechtsprechungs-Ausbaus (Auftrag David 23.6.2026): Import der amtlichen
BGE-Leitentscheide ab 2024 (265 dt., curated statt Routine) aus OpenCaseLaw (Court `bge`);
Quelle/Stand, Pipeline (`adapter-entscheide`/`normtext-entscheide`), Datum via aza-Cross-Fetch
+ Bandjahr-Fallback, Sachgebiet-Ableitung. Inhaltliche Einzelabnahme: David, offen.

**BGE-Band-Nachzug 146–149 (2020–2023):** [rechtsprechung/bge-baender-146-149-nachzug-2026-07-12.md](rechtsprechung/bge-baender-146-149-nachzug-2026-07-12.md) —
Auftrag David 12.7.2026 «bge bis 2020 integrieren» (W2·6): die vollständigen amtlichen
BGE-Bände 146–149 (**788** BGE, alle Sprachen) additiv zum Bestand, **band-basiert de/fr/it**
enumeriert (Q1-Bandjahr-Quirk + Sprachfilter-Falle: `language=de` verlöre 247 fr/it-BGE);
aza-Bindung + Urteilsdatum aus dem amtlichen clir-Urteilskopf (Fix nach Gegenprüfungs-R1
`widerlegt`), dreisprachige clir-Regeste (A18). Band-weise (PR-A 146+147 = 404, PR-B
148+149 = 384), BUDGET_MB 35→100. Quelle/Stand, Regel, Band-Zählungen, Gegenprüfungs-Historie.

**BGer-Korpus-Ausbau (Zitiergraph-Pfad):** [rechtsprechung/bger-korpus-ausbau-2026-06-26.md](rechtsprechung/bger-korpus-ausbau-2026-06-26.md) —
Ausbau auf 610 Entscheide (580 Bund + 30 kantonal, +240 BGer) via Default-`bger`-
Citation-Graph (Auftrag David 26.6.2026, §12-isoliert auf Branch
`rechtsprechung/mehr-bge-leitentscheide`). Quelle/Stand, Rebuild-Befehl, der echte
«sinnvoll»-Deckel `BUDGET_MB=20` (18.93 MB), Superset-Garantie gegen main, sowie die
offene Entscheidung amtliche BGE (`bge`) vs. Zitiergraph-BGer (`bger`). Mechanik
verifiziert (Gate grün); Einzelabnahme: David, offen.

**Rubrum-Darstellung + Daten-Befund:** [rechtsprechung/rubrum-darstellung-regelwerk.md](rechtsprechung/rubrum-darstellung-regelwerk.md) —
einheitlicher BGE-Detailseiten-Kopf (Auftrag David 24.6.2026, ultracode); Cross-Check
gegen entscheidsuche-mcp deckte auf, dass alle 178 gespeicherten Rubrum-Felder
Falsch-Positive (Erwägungs-Fragmente) waren; deterministisches Plausibilitäts-Tor
`rubrumFeldPlausibel` (Anzeige + Extraktion + Bestands-Reinigung), narrative
Vorinstanz-Anreicherung §1-bedingt verworfen. Abnahme David offen.

**entscheidsuche-Live-Suche (B2) + Sachverhalt-Gliederung:** [rechtsprechung/entscheidsuche-livesuche-und-sachverhalt.md](rechtsprechung/entscheidsuche-livesuche-und-sachverhalt.md) —
Teil B (Auftrag David 24.6.2026): Browser-Live-Suche über den ganzen CH-Korpus via
`entscheidsuche.ch/_search.php` (CORS-verifiziert; MCP browser-untauglich/403), opt-in
+ extern markiert (§2/§8); plus sichere Sachverhalt-Gliederung (nur Sub-Marker A.a/B.b,
sequenzvalidiert, 0 Fehl-Splits über 258 BGE) inkl. Bug-Check-MAJOR-Fix (Schluss-Namen).
Branch, nicht deployt; Abnahme David offen.

**Render-Noise-Sweep (B1, Steuer-Liste für A1/A2):** [rechtsprechung/render-noise-sweep-2026-06-27.md](rechtsprechung/render-noise-sweep-2026-06-27.md) —
adversarialer read-only Sweep über den ganzen Entscheid-Korpus (327 Snapshots, 27.6.2026,
JETZT-MACHEN §4.2). Befunde: Inline-Seitenmarker in **273** Entscheiden (261 Auszug + 16 VOLL,
korrigiert die Plan-Annahme «0 in abschnitte»); **4** FR-Bodies fälschlich `sprache:'de'`
(korrigiert «genau ein FR-Body»: 151_IV_357/152_II_75/152_II_98/152_I_105); 7 gekappte
Sachverhalte; **Fussnoten-Leak Heuristik = Falsch-Positiv** (41 «Fn.»-Treffer = Doktrin-Zitate),
nur 1 echter kantonaler Superscript-Leak; Regeste-Leak/verirrte Marken = 0. Priorisierte
Fix-Liste steuert A1/A2/A3. Kein Code-Fix; `verifiziert:false`, Abnahme David offen.

**Neue eidg. Gerichte (Auftrag 9, read-only):** [rechtsprechung/neue-gerichte-dossier-2026-06-27.md](rechtsprechung/neue-gerichte-dossier-2026-06-27.md) —
Dossier BVGer/BStGer/BPatGer (Nacht-Session 27.6.2026, ultracode-Fan-out, doppelt
verifiziert). Je Gericht: Publikationsart + Leitentscheid-Kriterium, Portal/entscheidsuche-
Spider (`CH_BVGer`/`CH_BSTG`/bpatger), Geschäftsnummer-Regex, Sprachen (FR/IT zwingend → A2),
Regel-Synthese (Aufnahme→Manifest→Darstellung am BGer-Muster) + neueste Kandidaten. Steuert den
späteren Bau (nach A2); KEIN Code. Abnahme David offen.

**Eidg. Gerichte BVGer/BStGer/BPatGer — Aufnahme/Bau (Auftrag 9, Batch 3):** [rechtsprechung/eidg-gerichte-aufnahme-2026-06-27.md](rechtsprechung/eidg-gerichte-aufnahme-2026-06-27.md) —
Umsetzung des Dossiers (27.6.2026). Befund: OCL führt alle drei als eigene `court`-Codes
(`bvger`/`bstger`/`bpatger`) → kein entscheidsuche-Scraper nötig. Additiver Build
(`--additiv --eidg=…`, kein Bestand-Drift), 15 Urteile (de 10/fr 3/it 2, erste IT im
Korpus), alle `routine` (Leitentscheid-Welle offen), Instanz-Achse + B2-Golden +8
Zellen. `verifiziert:false`, Abnahme David offen.

## Amtliche Ressourcen / Materialien

**Materialien-Rubrik P0 (Auftrag 5):** [materialien/amtliche-ressourcen-2026-06-27.md](materialien/amtliche-ressourcen-2026-06-27.md) —
Grundlage der neuen Rubrik «Materialien» (`src/lib/materialien/`, `/materialien`). 28 Behörden-
Publikationen (Soft-Law, kein Gesetzesrang) von 7 Bundesbehörden (ESTV·EDÖB·SECO·BSV·EHRA·FINMA·IGE),
alle `nur-live-link` (Erreichbarkeit 27.6.2026 geprüft). Beschaffungs-Regel (stabile Verzeichnis-
URL vs. Direkt-Link), Determinismus/Tor, normKeys-Verzahnung, Pflegebedarf, P1-Backlog (SEM/BAG).
Maschinell kuratiert; fachliche Abnahme David offen (Zeitsperre bis 1.12.2026).

**Botschaften / Entstehungsgeschichte (Fedlex-Portfolio Paket 2, W2·6):** [materialien/botschaften-2026-07-10.md](materialien/botschaften-2026-07-10.md) —
401 Botschaften des Bundesrates über die 218 Bund-Volltext-Erlasse, automatisch über den
Fedlex-Gesetzgebungs-Projekt-Graphen verknüpft (SPARQL-Reverse-Kette, `draftHasLegislativeTask`
statt STRSTARTS = 260× schneller). Behörde `BR`, Doktyp `botschaft`, `nur-live-link`; Join-Felder
`projEli/ocUris/botschaftDate` für Paket 5; im Norm-Kontext-Bus «Entstehungsgeschichte» (Bridge B1).
Drift-Tor `check:botschaften-netz`. Maschinell zugeordnet; fachliche Abnahme David offen.

**Änderungshistorie / Amtliche Sammlung (Fedlex-Portfolio Paket 5, W2·6-REV):** [normtext/revisionen-2026-07-10.md](normtext/revisionen-2026-07-10.md) —
je Bund-Volltext-Erlass eine «Änderungen / Revisionen»-Timeline (3108 AS/RO-Änderungs-Einträge über
218 Erlasse; SPARQL Pfad (b) über die SR-Taxonomie). RO-Fundstelle aus der oc-URI abgeleitet (100 %),
Botschafts-Join über `ocUris` (477), `nichtKonsolidiert`-Marker (Finding 4), Sammelerlass-Cross-Check
gegen Pfad (a) ab 2000 (1942 Marker). Sidecar `public/normtext/revisionen/<KEY>.json` (Übergangslösung
bis E1→`erlass_fassungen`); im Norm-Kontext-Bus «Änderungen / Revisionen» neben der Entstehungsgeschichte
(Bridge B1). Tore `check:revisionen`(-netz). Gegenprüfung bestanden; fachliche Abnahme David offen.

**Vernehmlassungen / Gesetzgebung in Arbeit (Fedlex-Portfolio Paket 3, W3·11):** [materialien/vernehmlassungen-2026-07-10.md](materialien/vernehmlassungen-2026-07-10.md) —
**POC MACHBAR** (deterministisch · Füllraten status/Titel 100 % / Frist 96,6 % · amtlich · Join 173/218).
822 Vernehmlassungsverfahren über die 218 Bund-Volltext-Erlasse, automatisch über den Fedlex-
Gesetzgebungs-Graphen (**direkte** `foreseenImpactToLegalResource`-Kante — einfacher als Paket 2).
Behörde `BUND`, Doktyp `vernehmlassung`, `nur-live-link`; amtliches Status-Vokabular 0–6 (laufend/
abgeschlossen/zurückgezogen), Frist aus `ConsultationPhase`; Reichweite ~2000–2026. Im Norm-Kontext-Bus
«Gesetzgebung in Arbeit» (laufend zuerst, «läuft bis {Frist}»). Currency: Netz-Tor
`check:vernehmlassungen-netz` + Offline-Assertion `laufend && fristEnde<heute ⇒ rot`. Maschinell
zugeordnet (grob bei Mantelvorlagen, §8); fachliche Abnahme David offen.

## register/ — fortlaufend gepflegt

| Dokument | Inhalt |
|---|---|
| [quellen-register.md](register/quellen-register.md) | Verifizierte Fedlex-Quellen (ELI, Konsolidierung, geprüfte Anker, Filestore-Muster) |
| [BS-RECHTSPRECHUNG-QUELLE-2026-07.md](register/BS-RECHTSPRECHUNG-QUELLE-2026-07.md) | **W2·6-BS** Amtliches BS-Rechtsprechungs-Portal (Findinfo/Omnis): URL-Templates + Fallen (GET-only, Template-Pflicht, Paging-Wrap, Windows-1252), Scope 2022+ (3'765 Dok., 42 datumlos), Count-Anker je Jahr, Delta-/Takedown-Regeln, Zahlenreport Vollimport 19.7.2026 |
| [p3-drop-klassen-inventar-2026-07-05.md](register/p3-drop-klassen-inventar-2026-07-05.md) | **W2·5b P3** Korpusweite `<p>`-Klassen-Drop-Inventur (218 Bund-Erlasse): welche `<p class>` der Extraktor still verwarf. Verdikt je Klasse (extrahieren: `man-template-tab-krpr`/OR 361-362 + bare `referenz`→grundlage; bewusst ignorieren: inkrafttreten/utit-Titel; deferiert: absatz-pt-Varianten/ParlG-Eid). Tor `check:p-klassen` friert das Vokabular ein |
| [poc-linkedom-tiefenzaehler-2026-07-05.md](register/poc-linkedom-tiefenzaehler-2026-07-05.md) | **W2·5b** linkedom-POC gegen die Regex-Tiefenzähler `findeDlEnde`/`findeDdEnde` (44 740 `<dl>`/`<dd>`-Grenzen, 0 Abweichungen) → Verdikt: Regex DOM-äquivalent, KEINE Migration (§7-Messung) |
| [e6a-quell-inventar-2026-07-03.md](register/e6a-quell-inventar-2026-07-03.md) | E6a-Quell-Inventar Verwaltungsverordnungen (9 Behörden, Probe-Fetches, Ranking: ESTV-MWST-HTML > ESTV-KS-PDF > BSV; VPB tot, Fallen dokumentiert) |
| [e4-lokal-2026-07-03.md](register/e4-lokal-2026-07-03.md) | **QS-DATA E4-Lokal** (Zitat-Graph → `norm_rangliste` + Oracle-Tor): Q4-law-code-Kanonisierung (DE/FR/IT→erlasse.key, SR-belegt, Abdeckung 35,2 %→78,4 %) · materialisierte topische In-degree (1 387 680 Zeilen, max gewicht 12 413 = BGE 133 II 249 @ BGG/106, idempotent) · **Oracle-Tor GRÜN 0 UNERKLÄRT** (462 identisch/284 erhöht/178 vintage-absent/7 erklärt-delta; Snapshot max BGE-Band 151) |
| [fedlex-gap-report-2026-07-02.md](register/fedlex-gap-report-2026-07-02.md) | **Fedlex Coverage-/Currency-Gap-Report Bund** (neu 2.7.2026, SPARQL-nativ): alle 229 Bund-Erlasse gegen `jolux:dateApplicability` — Coverage vollständig (218 Volltext, 11 bewusste Stubs); **20 stale** (neuere geltende Fassung, Juli-2026-Zyklus), davon **6 ungepinnte blinde Flecken** (AsylV 1/2/3, ArGV 2, EMRK, NYÜ — Cron `check:fedlex-versionen` sieht sie nicht) + 14 gepinnt-überholt; 56 angekündigte künftige Fassungen (Re-Extraktions-Horizont) + 11 Volltexte ohne Pin. Anlass: Analyse Dritt-Repo `droid-f/fedlex` (CC BY-NC-SA, nicht als Quelle genutzt) | Momentaufnahme; laufende Wahrheit bleibt `check:fedlex-versionen` |
| [fedlex-currency-2026-07-05.md](register/fedlex-currency-2026-07-05.md) | **Fedlex-Currency-Lauf 5.7.2026 — Paket 1 · P1-a + P1-b** (QS-CURRENCY): 18 überholte Bund-Snapshots + 2 PDF-Embeds (EMRK/NYÜ) auf die geltende Fassung; html-N SPARQL-kanonisch via `isExemplifiedBy` (klv/vrv=8, ssv=14); Artikel-Diff +85, 9 eId-Renames 1:1, 0 Verlust; Regex-Fix + Coverage-Assertion + PDF-Embed-Monitoring; `check:fedlex-versionen` Exit 0. Gegenprüfung bestanden. | Ausführungsbeleg §11 |
| [fedlex-staatsvertraege-2026-07-10.md](register/fedlex-staatsvertraege-2026-07-10.md) | **Fedlex-Portfolio Paket 4 — kuratierte Staatsverträge SR 0.*** (10.7.2026, W2·6, letztes Paket): 9 Verträge als Volltext (HKsÜ 96, HUVÜ 1973, EAUe, CMR, Montreal, RBÜ, UNO-BRK, Istanbul, Apostille) über die konsolidierte `eli/cc`-Pipeline (kein `eli/treaty`-Extraktor, kein neues Format). POC-Befund: Graph exponiert **keine** strukturierte Parteien-/Ratifikations-Kante → «Geltungsbereich»-Anhang verbatim als `annex_*`; html-0 bei 5/9 stale → kanonische html-N via `isExemplifiedBy` gepinnt; Apostille geltend 2024-09-04 (nicht 2016). 5 Kandidaten bewusst verworfen (ESÜ/WÜD/WÜK/DBA-DE/EPÜ). Gegenprüfung bestanden. | Ausführungsbeleg §11 |
| [fedlex-pin-kanonik-2026-07-11.md](register/fedlex-pin-kanonik-2026-07-11.md) | **Fedlex-Pin-Kanonik — Paket 1 · P1-a/b Querschnitts-Wurzel** (11.7.2026, W2·6): `fedlex-cache.sh` dockte bei **166/227** Pins an die nicht-kanonische Alias-URL (`…-de-html.html`) an → Alt-Generations-Dumps + Soft-404-Casemates-Shells. Alle html-N auf die registrierte `isExemplifiedBy`-Manifestation gehoben (`fedlex-manifest.ts`/`fedlex-repin-kanonik.ts`); **104 Snapshots + 130 Struktur-Sidecars** aus der kanonischen Fassung regeneriert (kein Parser-Eingriff → alle Diffs AMTLICH; OR-Kronjuwel-Korruption «2 e 3»→«2 und 3» geheilt; kein `art_`-Verlust). Neuer **Kanonik-Arbiter** in `check:fedlex-versionen` (html-N ≠ isExemplifiedBy ⇒ Exit 1) + cache.sh-Shell/Anker-Sonde + struktur-run «0 übersprungen». Gegenprüfung bestanden. | Ausführungsbeleg §11 |
| [parameter-verfall.md](register/parameter-verfall.md) | Datierte Parameter mit Prüfrhythmus — u. a. **SG GKV endet 30.6.2026**, GR HV/BE EAV 31.12.2026, NE-Umzug Sommer 2026, JU-Punktwert, BE-Formularpflicht 1.11.2026, Referenzzins; **neu 7.6.2026:** HReg-Gebühren · Fremdwährungsliste · Emissionsabgabe · MWST-Schwellen · Notariats-Listen (UR/AI/BL!) · Muster-Suiten |
| [engine-map.md](register/engine-map.md) | **Engine-Map** (neu 7.6.2026): jedes Code-Modul → tragende Dossiers/Stammdaten → Bau-/Abnahme-Status — der Rückweg zu §11 und die Checkliste je Abnahme |
| [he-entity-korrekturen-2026-07-03.md](register/he-entity-korrekturen-2026-07-03.md) | **`he`-Entity-Umstellung Divergenz-Analyse** (neu 3.7.2026, Nulltarif-Paket): `html-entities.ts` Hand-Tabelle (75) → `he.decode` (WHATWG 2231); vollständige Divergenz-Tabelle (4: `&nbsp;`/`&mu;` Sonderfälle behalten, `&ldquo;`/`&rdquo;` ASCII-Abflachung korrigiert), Sandbox-Doppellauf Bund 218 Erlasse aus gepinnten Caches **0-Byte-Diff** (golden-neutral), Korpus-Impact der Korrektur heute NULL |
| [B2-POC-2026-07-03.md](register/B2-POC-2026-07-03.md) | **B2-POC DuckDB vs. TS für den E3-Ingest-Pfad** (neu 3.7.2026, QS-DATA §6.2): voll-massstäbliche Messung an voilaj `e2a0b95b…` (195 342 Bundes-Entscheide + 8,7M/11,9M Kanten), je Arm 2 Läufe — **VERDIKT TS** nach der fixierten 3×-Regel (Bulk 1,55× / Pipeline 1,92×; RSS 2,1 vs. 5,5 GB); Auflösungsquoten-Baseline 0,823; NBSP-Divergenz JS-`\s`↔RE2; E3-Mechanik-Empfehlung (Row-Group-Batches, PRAGMAs, key_map-Resolve) |
| [e3-lokal-2026-07-03.md](register/e3-lokal-2026-07-03.md) | **E3-Lokal BGer-Massen-Import** (neu 3.7.2026, QS-DATA §5 E3, 26×-Slot): produktiver Bau von `daten/masse.db` (gitignored, ~5,8 GB) — entscheide **195 342** · zitat_kanten **8 529 050** (UNIQUE-Δ 168 014 = POC) · norm_referenzen **10 031 306**; Auflösungsquote **0,8245** (= POC 0,823, je match_type ausgewiesen); 2 Voll-Läufe → identisches Dump-Manifest (Weiche C); §7 non-null, `quelle_url` = bger.ch-`source_url` verbatim (100 %). Amtliche Gegenprüfung DOPPELT (Autor-5er-Stichprobe + unabhängiger Opus-Durchgang mit 400/400 Kanten-Proben, BESTANDEN): fand+fixte doppeltes «BGE BGE …» (~98 % BGE) + fabrizierte Zitierform bei 474 Docket-Müll-bge (→ NULL, §8) + dokumentierte voilaj-datum-Quirks (194 NULL, ~61 % Bandjahr-Platzhalter). VPS-Upload-Checkliste (cold-FTS/Read-API/Long-Tail = Serving-Schritt) |
| [stabilitaets-report-2026-07-03.md](register/stabilitaets-report-2026-07-03.md) | **QS-DATA E1 Artikel-Stabilitäts-Basis** (neu 3.7.2026, read-only, `npm run datenhaltung:stabilitaet`): Struktur-Basis der 218 Bund-Erlasse (24858 art_id) aus dem Zielschema; ehrliche Grenze §8 — echter Fassungs-Diff (stabil/verändert/verschwunden) erst ab >1 Fassung je Erlass messbar |
| [gerichtskosten-tarife-kantone.md](register/gerichtskosten-tarife-kantone.md) | **Kantonale Gerichtskosten-Tarife** (neu 14.6.2026): alle 26 Kantone Entscheidgebühr Zivil erstinstanzlich, amtlich doppelt verifiziert — TarifRegel + Link + Erlass + Stand + kostenlose-Verfahren-Hinweis (Art. 113/114 ZPO); Vorlage für `src/data/tarif/gerichtskosten.ts` |
| [parteientschaedigung-tarife-kantone.md](register/parteientschaedigung-tarife-kantone.md) | **Kantonale Parteientschädigung/Anwaltshonorar** (neu 14.6.2026): alle 26 Kantone, amtlich doppelt verifiziert (+ Re-Verif AG/SZ/GL/SH/GR) — TarifRegel + Link + Erlass + Stand; Querschnitt Art. 113 Abs. 1 ZPO (keine Parteientschädigung in Schlichtung) |
| [bemessungskriterien-tarife-kantone.md](register/bemessungskriterien-tarife-kantone.md) | **Bemessungskriterien der Prozesskosten-Tarife** (neu 1.7.2026, I4): je Kanton GK + PE die allgemeine Bemessungsnorm (wonach die Behörde innerhalb des Rahmens festsetzt) mit Kriterienliste + wörtlichem Beleg + confidence; Vorlage für `kriterien`/`kriterienNorm` auf `KantonalerTarif`. Strukturbefund: zitierte Norm = meist nur Streitwert-Staffel, Kriterien in allgemeiner Bestimmung. GR gk = keine Kriteriennorm; 4 Titel-Korrekturen an Altdaten |
| [kosten-modifikatoren-kantone.md](register/kosten-modifikatoren-kantone.md) | **Kosten-Modifikatoren** (neu 14.6.2026, Workflow wbqdyap3x): je Kanton Faktoren für Schlichtung · vereinfacht · summarisch · Rechtsmittel (GK + Parteientschädigung), je mit Norm; doppelt verifiziert. Vorlage Cockpit-Modifikatoren |
| [sonderkonstellationen-kantone.md](register/sonderkonstellationen-kantone.md) | **Kantonale Sonderkonstellationen** (neu 14.–15.6.2026, Workflow wi80t134r): 877 kostenrelevante Sonderregeln über 26 Kantone (Erhöhung/Reduktion, einkommensabhängig, Materie-Sondertarife, Streitgenossen, MwSt/Auslagen), je mit §/Artikel; doppelt verifiziert |
| [gegenpruefung-register.md](register/gegenpruefung-register.md) | **Gegenprüfungs-Register** (neu 1.7.2026, QS-GP): protokollierte adversariale Zweitdurchgänge je Snapshot/Engine — Datum · Diff-Hash · Verdikt · Quelle-Pin · Beleg; automatisch von `npm run gegenpruefung:ok` gepflegt, Türsteher des Tors `check:gegenpruefung` (in `npm run gate`). Design: `docs/superpowers/specs/2026-07-01-gegenpruefung-gate-design.md` |
| [QS-GP-KAMPAGNE-2026-07-02.md](register/QS-GP-KAMPAGNE-2026-07-02.md) | **QS-GP-Kampagne Alt-Rechen-Engines** (2.7.2026, Baustein d): rückwirkende adversariale Gegenprüfung aller Alt-Rechen-Engines gegen die amtliche Norm — 127 Rohbefunde/38 Dateien, ~45 Fixes angewandt (7-Verifier-Doppelcheck 45 CONFIRMED/0 REFUTED), 3 Übergriffe → §9-Backlog. Report + Outcomes + Follow-ups; Verdikte im [Gegenprüfungs-Register](register/gegenpruefung-register.md) |
| [AUDIT-TARIF-2026-06-17.md](register/AUDIT-TARIF-2026-06-17.md) | **Tarif-Rechen-Audit 17.6.2026** (aus `bibliothek/` nach `register/` verschoben, H-1): 4-Agenten-Fan-out gegen ~250 Tarif-Einträge/lokale Normtext-Snapshots, Mehrheit OK; Kategorie A = echte Wert-/Norm-Abweichungen **OFFEN (Entscheid David 17.6.2026: nur geflaggt, Fix später)**; B/C dokumentiert für späteren Durchgang. Nichts an der Rechen-`regel` geändert |
| [AUDIT-TORE-2026-07-20.md](register/AUDIT-TORE-2026-07-20.md) | **Tor-Wirksamkeits-Audit 20.7.2026** (QS-BASIS (c), Auftrag R1): welchen Toren zu trauen ist. 58 `check:*`, 36 in `check:seriell`, davon **12 im PR-Pfad** und **20 in keinem Workflow**. Jede Allowlist-Begründung mit **Sabotage-Probe** falsifiziert (Defekt einpflanzen → prüfen, ob der behauptete Ersatz-Arbiter rot wird; je byte-gleich zurückgebaut): **17 halten nicht, 2 sind keine Begründung, 1 hält** (`check:gegenpruefung`). Die 9× genannte Delegation an `fedlex-frische.yml` ist gegenstandslos — der Workflow fährt diese Tore gar nicht, lief genau **einmal** und scheiterte. Nebenbefund: `check:paritaet` prüft gegen die **eigene Ladung** (Roundtrip, kein Inhalts-Arbiter, §6 Ziff. 7 lit. a); `waechter.yml` hat 0 Läufe. Alle 20 Allowlist-Tore laufen unter `CI=1` in **10 s** grün → kein Kostenargument. `scripts/`: 211 Dateien, nur **2** wirklich unerreichbar (nicht ~99). **Kein Streich-Vorschlag** — keine Delegation bestand ihre Probe |
| [AUDIT-BUGS-2026-06-19.md](register/AUDIT-BUGS-2026-06-19.md) | **Bug-/Logik-Audit 19.6.2026** (aus `bibliothek/` nach `register/` verschoben, H-1): zweistufiger read-only-Review der gesamten Codebasis (~87 500 LOC), 7+8 Reviewer/Sweeps; HOCH/MITTEL-Befunde adversariell mit Repro belegt. Status je Befund im Dokument — **nicht pauschal «erledigt»**, Einzelstand nachschlagen |

## normen/ — Regelwerke (Engine-Grundlagen, Wortlaute verbatim)

| Dokument | Inhalt | Verifikation |
|---|---|---|
| [zpo-zustaendigkeit-regelwerk.md](normen/zpo-zustaendigkeit-regelwerk.md) | Art. 4–46 + Systematik (Bindungsgrade, HG-Revision 2025, perpetuatio fori, Art.-63-Rettung, IPRG-Weiche) mit Engine-Hinweisen | 17/17 Wortlaut-Proben am Cache ✓ |
| [zustaendigkeit-engine-verifikation.md](normen/zustaendigkeit-engine-verifikation.md) | Deep-Research-Vollverifikation von `zustaendigkeit.ts` (37 Behauptungs-Cluster, ZPO 20250101 + BGG 20250101 + BGE 133 III 393): **0 fristen-/ergebnisverfälschende Fehler**; Befunde B-1 Art. 113 II lit. g (DSG-Schlichtung kostenlos) und B-2 Art. 6 IV lit. c (internat. HG-Weiche) am 6.6.2026 umgesetzt | Kern zweifach (25 Claims à 3-0 adversarial) · Rest einfach belegt (6.6.2026) |
| [schkg-zustaendigkeit-regelwerk.md](normen/schkg-zustaendigkeit-regelwerk.md) | Betreibungsorte 46–55, Klage-Foren + Fristen (Aberkennung 20 T., Arrest-Kaskade), Gericht vs. Aufsicht; Synthese-Tabelle | Wortlaute verbatim Stand 1.1.2025 ✓ |
| [stpo-zustaendigkeit-regelwerk.md](normen/stpo-zustaendigkeit-regelwerk.md) | Behörden 12–18, Bund-Kataloge 23/24, Gerichtsstand 31–42 (Tatort/Prioritätsprinzip), Strafbefehl/abgekürzt (Rev. 2024); Decision-Tree | 13/13 substanzielle Proben ✓ |
| [erbrecht-regelwerk.md](normen/erbrecht-regelwerk.md) | 3 Teile: Erbfolge+Pflichtteile (Rev. 2023, Quoten-Synthesen beide Rechtsstände) · Verfügungen+Klagen (Fristen 521/533) · Erbgang+Teilung (22 Fristen, Ausgleichung 626 ff.); **Engine-Audits: erbteilung.ts + testament.ts bestanden** | 16/16 Wortlaut-Proben ✓ |
| [normtexte-zpo-zustaendigkeit.md](normen/normtexte-zpo-zustaendigkeit.md) | Wortlaut der 25 Schlüsselartikel (Erstbestand der Engine) | maschinell extrahiert |
| [lexwork-kantone-poc-19-verdikt.md](normen/lexwork-kantone-poc-19-verdikt.md) | **OpenCaseLaw Baustein 1** — empirisches 19-Kantone-LexWork-Verdikt (live 11.7.2026): 18/19 voll nutzbar, GL teilweise (Migration `gesetze.gl.ch`, `xhtml_tol`-Endpunkt tot → Currency-Befund); Kernbefund «Baustein 1 bereits gebaut+live» (Adapter/Discovery/1232 Snapshots/`check:normtext-netz`), kein Neubau; Gegenprüfung SO/AR-future/BS-abrogated bestanden | ZWEIFACH GEPRÜFT (11.7.2026) · Abnahme David offen |
| [fedlex-pin-nachverifikation-2026-06.md](normen/fedlex-pin-nachverifikation-2026-06.md) | §7-Nachverifikation der 5 überholten Pins (SchKG/StPO/VwVG/VMWG/BGG: Wortlaut-Diffs alt↔neu, Auslöser-Erlasse, Engine-Folgen — VMWG-19a-Auflösung!) + Voraus-Check StGB 12.6./ZGB+ZPO 1.7.2026 | zweifach (Diff-Agents + Nachextraktion) · Abnahme David offen |
| [zpo-fristen-bk-abgleich.md](normen/zpo-fristen-bk-abgleich.md) | Abgleich BK Art. 142–147 ZPO (Privatquelle) gegen `zpoFristen.ts`/`fristenEngine.ts`: 31 Regeln, 29 korrekt (19 empirische Sonden) — B-1 MITTEL Mindermeinungs-Modus verliert Stillstandsverlängerung am Stillstands-Folgetag · B-2/B-3 NIEDRIG | ERSTRECHERCHE (10.6.2026) · Befunde offen für David |
| [arbeitsrecht-shk-abgleich.md](normen/arbeitsrecht-shk-abgleich.md) | Abgleich SHK Art. 324a/b, 335c, 336c OR (Privatquelle) gegen `lohnfortzahlung.ts`/`kuendigungsfrist.ts`/`sperrfristen.ts`: 66 Regeln, 58 korrekt — **Skalen BS/BE/ZH byte-genau an SECO-Tabelle belegt**; B1 HOCH 335c III Vaterschafts-Resttage vom Monatsende-Rounding verschluckt · B2 HOCH 336c erneuter Unterbruch ab Dienstjahres-Jahrestag (BGE 133 III 517, 2. Konstellation) fehlt · 4 NIEDRIG | ERSTRECHERCHE (10.6.2026) · ALLE Befunde B1–B6 umgesetzt 10.6.2026 (Ja David) |
| [verzugszins-praejudizien-abgleich.md](normen/verzugszins-praejudizien-abgleich.md) | Abgleich Präjudizienbuch OR Art. 104 (11. Aufl. 2025, Privatquelle) gegen `verzugszins.ts`: 15 Komplexe, 10 korrekt, kein Rechenfehler im Hauptpfad — 2 MITTEL (kaufm. Satz ≤ 5 % ohne Warnung · Kumulationsverbot Schadens-/Verzugszins fehlt als Hinweis) · 2 NIEDRIG · §7-Abweichung Verfalltag (Buch: 108 Ziff. 1, Engine: 102 II — Engine gewinnt am Normtext) | ERSTRECHERCHE (10.6.2026) |
| [feiertage-kantone-bj.md](normen/feiertage-kantone-bj.md) | Feiertags-Matrix 26 Kantone (BJ-Verzeichnis SR 0.221.122.3, lit. a = lit. b) inkl. bedingter Tage (NE/UR/AR/AI-Fussnoten), Näfelser-Fahrt-Karwoche-Regel, offengelegte Annahmen | 26/26 Sektionen zweifach geprüft (Agent + Vollabgleich am PDF) ✓ |
| [norm-vorschau-snapshot-system.md](normen/norm-vorschau-snapshot-system.md) | **Volltext-Snapshot-System** (neu 16.6.2026): Popover mit Gesetzestext Bund (5760 Art./18 Gesetze, Vollabdeckung) + Kantone (LexWork-Adapter, 19 Kt.); Datenmodell, Build-Regel (CLAUDE.md §7), genuine Lücken, Drift-/Vollständigkeits-Checks; speist `public/normtext/` + NormPopover | ZWEIFACH GEPRÜFT (Extraktion + 2 Bug-Checks + Drift/Vollständigkeit grün); Abnahme David offen |
| [gesetzessammlung-rubrik-v.md](normen/gesetzessammlung-rubrik-v.md) | **Rubrik V «Gesetze»** (neu 17.6.2026): browsbare Gesetzessammlung über den Snapshots — Erlass-Register (SSoT Identität+Taxonomie) → generiertes `register.json` → Übersicht + Lesesicht (Sticky-TOC, zuklappbare Bänder, In-Gesetz-Suche, Querverweis-Autolink, Popover-Brücke); Speicher-/Darstellungsregeln, 7 Konsistenz-Tore, Wettbewerbs-Differenzierung | ERSTRECHERCHE (gate-grün, browser-verifiziert); Abnahme David offen |
| [kantonale-tarif-zitat-befunde.md](normen/kantonale-tarif-zitat-befunde.md) | **Kantonale Tarif-Zitat-Befunde LU/OW/SH + NE/GE** (16.–17.6.2026): Befunde aus Norm-Vorschau-Vollständigkeitstest — LU GRUNDPFAND quelleUrl 228→258 (BEHOBEN); OW GDB 134.15 Art. 7 aufgehoben (Art. 9/12, BEHOBEN); SH 273.100 Art. 109 totes Recht (JG 173.200 Art. 82, **BEHOBEN 16.6.**, Commit `b7587a51`, fachl. freigegeben David — Fundorte schlichtung.ts/nicht-vermoegensrechtlich.ts/zustaendigkeitKosten.ts:141); **+ 5 NE/GE-Zitatkorrekturen 17.6.2026 (alle wertneutral BEHOBEN): NE Art. 54/81→Art. 14 ch. (RSN 166.31 endet Art. 17, Chiffres in Art. 14); NE GRUNDPFAND Art. 44→Art. 10 (LERF); GE GRUNDPFAND Art. 16/84→Art. 4 al. 6 (REmORFDIT — RTFMC-Hypothese live widerlegt)** | ZWEIFACH GEPRÜFT (live htm-Quelle + Token-Auflösung); golden byte-gleich; generelle Rechtssicherheits-Abnahme bleibt Davids Sache |
| [informations-nutzung-gesetze-2026-07-17.md](normen/informations-nutzung-gesetze-2026-07-17.md) | **Informations-Nutzung der Gesetze — Lücken-Katalog** (Auftrag David 17.7.2026 «nutzen wir wirklich alle Informationen aus unseren Gesetzen?»; 2 Miner Quelle-vs-Pipeline, empirisch am Korpus 227 Bund/1232 Kanton). **Verdikt: Normtext-KÖRPER Bund nahezu erschöpfend genutzt**; systematische Lücken = **relationale + temporale Metadaten + Such-Abdeckung**. Tier 1: **G-REF** (externe amtliche ELI-Verweise via `entferneTags` verworfen; INTERNE Kanten existieren in der Quelle gar nicht = keine Lücke) · **G-HIST** (artikel-genaue Historie liegt nur als Fussnoten-Prosa, unstrukturiert; nur EIN Ur-Inkrafttreten je Erlass) · **G-SUCH** (Suchindex omittiert Fussnoten/Tabellen). Tier 2: G-EID (→§12/#280), G-PRERENDER, G-ANNEX-META, G-FORMEL-FLAG. Tier 3: Formel/Bild-Semantik + FR/IT + LugÜ + Kantonal-Asymmetrie (Quell-Grenzen). Intake §14 → FAHRPLAN-NORMTEXT/UI-NAVIGATION/SEO | ERSTRECHERCHE (17.7.2026, empirisch verifiziert); **Bau-GO je Kandidat ausstehend (David) — Extraktion = Risikopfad** |

## behoerden/ — Behördenlisten

### Zivil (Gerichte + Schlichtung) — ZWEIFACH GEPRÜFT
| Dokument | Inhalt | Befund 2. Durchgang |
|---|---|---|
| [gerichtsbehoerden-kantone.md](behoerden/gerichtsbehoerden-kantone.md) | Master-Liste Gerichte 26 Kantone | 0 Widerlegungen, 8/8 Stichproben; Nachtrag 10.6.: ZH alle 12 BG amtlich (BG ZH Briefpost PF 8036!); offen nur AR-Hausnr. |
| [gerichte-bund.md](behoerden/gerichte-bund.md) | BGer/BStGer/BVGer/BPatGer | 1 Korrektur (BVGer-PLZ 9023) eingearbeitet |
| [gog-gerichtsorganisation-kantone.md](behoerden/gog-gerichtsorganisation-kantone.md) | Behörde→GOG-Artikel + kantonale Zivil-Gebührenstaffeln | 15/15 Stichproben bestätigt |
| [rechtsmittel-spruchkoerper-kantone.md](behoerden/rechtsmittel-spruchkoerper-kantone.md) | Spruchkörper Berufung (Art. 308 ZPO) / Beschwerde (Art. 319 ZPO) je Kanton + BGerR Art. 33/34 (I./II. zivilrechtl. Abt.) — Verdrahtungs-Empfehlung obereInstanzen.ts | **Erstrecherche** (6.6.2026); deterministisch nach Rechtsmittel nur VD (+ ZG-Teil); Rest (B)/(A) ehrlich offen |
| [schlichtungsbehoerden-kantone.md](behoerden/schlichtungsbehoerden-kantone.md) | Schlichtungsbehörden 26 Kantone | 2 Re-Checks + Schiedsrichter (BL/SH/TI entschieden) |
| [schlichtungsbehoerden-zh-vollerfassung.md](behoerden/schlichtungsbehoerden-zh-vollerfassung.md) | ZH: 171 FR-Ämter + 12 Miet-Stellen + GlG; Stadt: PLZ→Stadtkreis-Automatik (12.6.2026) | Stichproben ✓ — speist die PLZ-Auflösung + Kreis-Automatik |
| [gebaeudeadressverzeichnis-adressaufloesung.md](recherche/gebaeudeadressverzeichnis-adressaufloesung.md) | Adress-Ausbau Stufen 1–3 (12.6.2026): swisstopo-Gebäudeadressverzeichnis + Stadt-ZH-Strassen + geo.admin-API — speist zhStrassen/strassenVerzeichnis/AdresseBundSuche | Erstrecherche, empirisch verifiziert; Wortlaute abgenommen 12.6.2026 |
| [schlichtungsbehoerden-sz-bl-so-zg-sh-lu-vollerfassung.md](behoerden/schlichtungsbehoerden-sz-bl-so-zg-sh-lu-vollerfassung.md) | Vollerfassung SZ/BL/SO/ZG/SH/LU | Konflikte entschieden; SZ teiloffen (JS-Karte) |
| [schlichtungsbehoerden-ti-vs-gr-vollerfassung.md](behoerden/schlichtungsbehoerden-ti-vs-gr-vollerfassung.md) | TI 38 Giudicature + 11 Miete-Uffici gemeindescharf (Art. 5 LALoc, 12.6.2026), VS-Systematik, GR 11 Vermittlerämter | TI-Miete verdrahtet (Register §51) |
| [schlichtungsaemter-gemeindezuordnung.md](behoerden/schlichtungsaemter-gemeindezuordnung.md) | Gemeinde→Amt für AG/SG/TG/FR/ZG/AI (+ SZ/BL teiloffen) — **Quelle der generierten PLZ→Amt-Daten** (scripts/plz-generieren.ts) | zweifach belegt; SZ/BL am 6.6.2026 GESCHLOSSEN (Itingen→Kreis 13; personengebundene Adressen → Verzeichnis-Fallback bleibt) |
| [gerichtsadressen-erstliste.md](behoerden/gerichtsadressen-erstliste.md) | Davids CSV (47) + Audit-Trail (21 ✓ / 26 abweichend) | abgeschlossen |
| [schlichtungsstellen-urls.md](behoerden/schlichtungsstellen-urls.md) | Direktlinks zu Schlichtungsstellen (48/85 WebFetch-verifiziert, 6.6.2026) | einfach belegt |

### Straf — ZWEIFACH GEPRÜFT
| Dokument | Inhalt | Befund 2. Durchgang |
|---|---|---|
| [strafbehoerden-kantone.md](behoerden/strafbehoerden-kantone.md) | Staatsanwaltschaften/Jugendanwaltschaften/Übertretungsbehörden 26 Kantone + Bund (BA/AB-BA), EG-StPO-Mapping | SZ-Korrektur (Schmiedgasse 21, JugA Bennau); ALLE Lücken geschlossen (AG-Hausnummern 6.6.; VD-Korrektur: Konstituierung in LMPu 173.21 Art. 3/4; VS LACPP Art. 6/7; JU → OJ statt LiCPP) |
| [strafgerichte-kantone.md](behoerden/strafgerichte-kantone.md) | Erstinstanzliche Strafgerichte 26 Kantone (Berufungsinstanzen aus obereInstanzen projiziert; BL amtlich Muttenz) | einfach belegt (6.6.2026) |

### SchKG (Betreibung) — ZWEIFACH GEPRÜFT
| Dokument | Inhalt | Befund 2. Durchgang |
|---|---|---|
| [betreibungskreise-kantone.md](behoerden/betreibungskreise-kantone.md) | Betreibungskreis-Systeme aller 26 Kantone (10 Einheitsamt · 10 Bezirks-/Regional · 2 Gemeinde · 4 gemischt) + Rechtsgrundlage, amtliches Verzeichnis, geprüfte Beispieladressen je Kanton; EasyGov-Finder-Analyse (kein offenes API, Negativbefund Bundes-Verzeichnis); **GEBAUT 7.6.2026**: `src/data/betreibungsaemter.ts` + Gemeinde-Auflösung `src/data/betreibung/` (Etappen 1–3: 10 Einheitsämter + 130 Kreis-Ämter in 13 Kt., Karten 11 Kt.; LU/AG/SG Verzeichnis-Link §8) im SchKG-Rechner | 52 Agents Recherche + 32 Agents Extraktion 7.6.2026 (je Kanton adversarial; Adress-Stichproben durchwegs bestätigt); TG-Zitate an geltender Fassung korrigiert; ZH-Reorganisation 56→34/18 in Vernehmlassung → Verfallsregister; Wortlaut-Lücken OW/FR (LexWork-Portale) markiert |

### Verwaltung — ZWEIFACH GEPRÜFT
| Dokument | Inhalt | Offen |
|---|---|---|
| [verwaltungsbehoerden-kantone.md](behoerden/verwaltungsbehoerden-kantone.md) | Wichtigste Verwaltungsbehörden je Kanton (VGer/Staatskanzlei/Steuer+Rekurs/StVA/Migration/SozVGer) — ALLE 26 Kantone (u. a. GR-Obergericht 1.1.2025, VD-Hermitage Juli 2025; JU: Cour des assurances eigenständig) | Doppelcheck ausstehend |

### Erbgang — ZWEIFACH GEPRÜFT
| Dokument | Inhalt | Befund 2. Durchgang |
|---|---|---|
| [erbgangsbehoerden-kantone.md](behoerden/erbgangsbehoerden-kantone.md) | Testamentseröffnung/Erbenschein/Ausschlagung je Kanton — 4 Grundmodelle + Aufgaben-Splits | 1 Korrektur (SO 6 Ämter, Breitenbach ergänzt); UR geschlossen (Gemeindemodell); ZH/BE/LU/GE/SG-§§ bestätigt |

### Notariat — ERSTRECHERCHE
| Dokument | Inhalt | Status |
|---|---|---|
| [notariate-kantone.md](behoerden/notariate-kantone.md) | Notariats-System + Anlaufstelle/Verzeichnis-Link je Kanton (wer beurkundet GmbH-/AG-Gründungen; Sonderregel SH: HRegA beurkundet selbst; keine örtliche Ausschliesslichkeit bei Gründungen) — Stammdaten-Quelle für `src/lib/notariate.ts` | Erstrecherche 7.6.2026 (Auftrag David); 23/26 URL-geprüft; UR/AI/BL unsicher markiert; Listen-PDFs datiert → Verfallsregister |

### Handelsregister — ERSTRECHERCHE
| Dokument | Inhalt | Status |
|---|---|---|
| [handelsregisteraemter-kantone.md](behoerden/handelsregisteraemter-kantone.md) | Adressdossier aller 26 kantonalen Handelsregisterämter: Amtsbezeichnung, Postadresse, PLZ/Ort, Telefon, E-Mail, amtliche Website je Kanton — je Eintrag Quelle + Abrufdatum 7.6.2026. Mehrfachstandorte offengelegt (VS 3 Arrondissements; TI Amt Biasca ≠ Sektion Bellinzona; SG Hauptsitz + Aussenstellen); Sitz ≠ Hauptort dokumentiert (BE Ostermundigen, BL Arlesheim, SO Klus-Balsthal, VD Moudon). Befund: kein Konkordat — OW/NW und AI/AR je eigenes Amt | Erstrecherche 7.6.2026 (Auftrag David); 26/26 Kantone; zefix-API (EHRA) 401 → amtliche kantonale Seiten als Quelle; 4 E-Mail-Lücken (LU/FR/AI/TG) ehrlich offen; zefix-Abgleich + Doppelcheck ausstehend |

## kosten/ — Tarife — ZWEIFACH GEPRÜFT

| Dokument | Inhalt | Befund 2. Durchgang |
|---|---|---|
| [schlichtungsgebuehren-kantone.md](kosten/schlichtungsgebuehren-kantone.md) | Schlichtungsgebühren 26 Kantone + Art.-113-Kopf — **Quelle von src/data/zustaendigkeitKosten.ts** | AG auf GebührD 662.110 korrigiert; Stichproben ✓ |
| [gerichtskosten-kantone.md](kosten/gerichtskosten-kantone.md) | TIEFENERFASSUNG: vollständige Zivil-Staffeln je Kanton (alle Bänder, summarisch, Rechtsmittel, Reduktionen, Vorschuss) — Teil A ZH–BL | einfach belegt; Teil B + Doppelcheck folgen |
| [gerichtskosten-bund.md](kosten/gerichtskosten-bund.md) | Tarife BGer/BVGer/BStGer/BPatGer wörtlich aus Fedlex | alle Stichproben wörtlich ✓, keine neueren Konsolidierungen |
| [anwaltstarife-kantone.md](kosten/anwaltstarife-kantone.md) | Anwaltstarife (Parteientschädigung/UR) 26 Kantone | GL-Tarif existiert doch (GS III I/5); UR-Staffel beschafft |
| [notariatstarife-gruendung-kantone.md](kosten/notariatstarife-gruendung-kantone.md) | **Notariatstarife für die Beurkundung der AG-Gründung** (Errichtungsakt), ZH/BE/AG/LU/SG/BS — Erlass+Stand je Kt (abrogated/future_versions API-geprüft), deterministische Gebührenregel (Promille/Staffel verbatim, Beispiel AK 100k), AG-Gründung in **AG nicht tarifiert → Aufwand** (ehrlich als Rahmen) | **ERSTRECHERCHE 7.6.2026** (Auftrag David §11/Punkt 11); ZH-Nachtrag-123 + SG-MWST + Agio offen; Engine NICHT geändert |
| [notariat-grundbuch-kantone.md](kosten/notariat-grundbuch-kantone.md) | **Notariats-, Grundbuch-, Grundpfand- & Handänderungssteuer-Tarife beim Grundstückkauf, alle 26 Kantone** — je Wert Erlass+Artikel+Link+Stand; Quelle von `src/data/tarif/notariat-grundbuch.ts` + `src/lib/notariatGrundbuch.ts` | **ERSTRECHERCHE 15.6.2026** (5-Cluster-Fan-out); Doppelcheck offen (GE ‰/%-Zeichen, JU Punktwert, VS Stufenmodus, ZG ESTV, BE Anhang-1-Staffel) |
| [grundbuchgebuehren-kantone.md](kosten/grundbuchgebuehren-kantone.md) | **Grundbuchgebühren je Eintragungsart, alle 26 Kantone** — 10 Eintragungsarten (Eigentum Kauf/Erbgang, Grundpfand, Dienstbarkeit, Vormerkung, Baurecht, Stockwerkeigentum, Parzellierung/Mutation, Anmerkung, Löschung) je Erlass+Artikel+Regel+Stand; Quelle von `src/data/tarif/grundbuch.ts` + `src/lib/grundbuchgebuehren.ts`; `eigentum_kauf`-Gegenprobe reproduziert die GRUNDBUCH-Schicht | **ERSTRECHERCHE 15.6.2026, doppelt verifiziert** (52 Agenten); Korrekturen BS Artikel / ZH § 11 / AI Löschung; Abnahme David ausstehend |
| [beurkundungstarife-kantone.md](kosten/beurkundungstarife-kantone.md) | **Beurkundungstarife (Notariatsgebühren) je Geschäftsart, alle 26 Kantone** — 14 Geschäftsarten (Testament, Erbvertrag, Ehevertrag, Schenkung, Vorsorgeauftrag, Vollmacht, AG/GmbH-Gründung, Kapitalerhöhung, Stiftung, Bürgschaft, Schuldanerkennung, Dienstbarkeit) je Erlass+Artikel+Regel+Stand; Quelle von `src/data/tarif/beurkundung.ts` + `src/lib/beurkundung.ts` | **ERSTRECHERCHE 15.6.2026, doppelt verifiziert** (Workflow find→Doppelcheck, 52 Agenten); Korrektur GE Bürgschaft 1‰; Abnahme David ausstehend |

## muster/ — amtliche Vorlagen, verbatim archiviert (NEU 7.6.2026)

51 Text-Extrakte amtlicher Original-Vorlagen (EHRA · HRegA ZH inkl.
Kapitalerhöhungs-Suite · SG · GL · AR/BE-Einzelstücke) — die verbatim-Basis
der Wortlaut-Dossiers, zuvor nur flüchtig in `/tmp`. Quellen-URLs, Stände
und Pflege-Regeln: [muster/MANIFEST.md](muster/MANIFEST.md). Stand-Überwachung
im Verfallsregister («Amtliche Muster-Suiten»).

## Verdrahtung in den Code (SSoT-Karte)

| Dossier | speist |
|---|---|
| zpo-zustaendigkeit-regelwerk | `src/lib/zustaendigkeit.ts` (örtlich/sachlich/Rechtsmittel) |
| schkg-zustaendigkeit-regelwerk | `src/lib/schkgZustaendigkeit.ts` (Rechtsweg «Betreibung», 6.6.2026) |
| stpo-zustaendigkeit-regelwerk | `src/lib/strafZustaendigkeit.ts` (Rechtsweg «Straf», 6.6.2026) |
| erbrecht-regelwerk (Audits) | bestätigt `src/lib/erbteilung.ts` + `vorlagen/testament.ts`; Ausbaupunkt `erb-ausgleichung` |
| feiertage-kantone-bj | `src/data/zpoFeiertage.ts` (istFeiertag/naechsterWerktag – alle Fristen-Engines) |
| gerichtsbehoerden + erstliste (Audit) | `src/data/obereInstanzen.ts` (Rechtsmittel) · `src/data/handelsgerichte.ts` (Art. 6 ZPO) |
| strafbehoerden-kantone | `src/data/staatsanwaltschaften.ts` (26 + Bundesanwaltschaft) |
| schlichtungsbehoerden-* + gemeindezuordnung | `src/data/schlichtungsstellen.ts` · `src/data/schlichtung/*` (PLZ→Amt) · Vorlage Schlichtungsgesuch (SgBehoerdenWahl) |
| schlichtungsgebuehren + gog (Zivil-Staffeln) | `src/data/zustaendigkeitKosten.ts` (Fahrplan-Kosten) |
| strafgerichte-kantone | `src/data/strafgerichte.ts` (Straf-Rechtsweg, 6.6.2026) |
| schlichtungsstellen-urls | `src/data/schlichtungsstellen.ts` (Direktlinks in der UI) |
| recherche/bgg-beschwerde-engine | `bestimmeRechtsmittel` in `src/lib/zustaendigkeit.ts` (Rechtsmittel-Umbau 6.6.2026: Objekt-/Verfahrens-/Vorinstanz-Weichen, Fristen Art. 100/46 BGG) |

## Werkzeuge

- [werkzeuge/omnilex-ai-und-kaggle-legal-ir-2026-07-16.md](werkzeuge/omnilex-ai-und-kaggle-legal-ir-2026-07-16.md) — **Erstrecherche 16.7.2026 (Sidequest):** GitHub-Org Omnilex-AI + Kaggle-Competition «LLM Agentic Legal Information Retrieval» (CH-Recht, BGE/SR-Zitate). Fund: Apache-2.0-Starter-Repo als Ideen-Steinbruch (Zitat-Regex/Abkürzungsliste) + LLM-freier Retrieval-Eval-Harness (F1/MAP/NDCG → Such-Güte für `api/suche`). Basis-Datasets LEXam (CC-BY-4.0) / swiss_citation_extraction (**CC-BY-SA-4.0, viral** → Annotationsschicht NICHT übernehmen, Texte immer von Amtsquelle). Verdikt: F1/F2 bringen etwas (Werkzeug-Ebene), Produkt bleibt LLM-frei. **F2 UMGESETZT 16.7. (Roadmap W2·7-VZUI):** 10 Zitat-Muster-Varianten (BGE-Pinpoint · verkettete Sub-Marker · Nr./Umlaut-Endung/Bereich/ff.-Liste/Mehrfach/ECLI/SR-Locator) in `src/lib/rechtsprechung/zitat-extraktion.ts`, Regex-Formen aus Apache-2.0-Steinbruch (nicht das naive Substring-Matching); Gegenprüfung bestanden (0 Phantom, 0 Entscheid-Verlust, +2931 Refs); Kanten-Regen wartet auf `fix/a29-regesten` — siehe Abschnitt «Ausbeute F2»
- [werkzeuge/swisslegaltranslations-2026-07-16.md](werkzeuge/swisslegaltranslations-2026-07-16.md) — **Erstrecherche 16.7.2026 (Sidequest):** `JoelNiklaus/SwissLegalTranslations` (SwiLTra-Bench), Code-Repo das DE/FR/IT/RM/EN-Rechtsübersetzungen aus **Fedlex** generiert. **Code hat KEINE Lizenz → all rights reserved (nur Blaupause, nicht kopieren)**; Daten = amtliche Fedlex-Übersetzungen (URG-frei, keine virale Schicht → direkt von Fedlex). Fund: artikel-/absatzgenaue Alignment-Methodik = struktureller Join `rsNr+artNr+parNr` über identische Fedlex-`art_X`-IDs (kein ML) → **Blaupause für M15 (DE/FR/IT, G29) + W2·6 mehrsprachiger Normvergleich**. Unsere Fedlex-SPARQL ist bislang DEU-only; Sprachumschaltung = Filter-Tausch. Verdikt: F1 bringt etwas (Blaupause), Daten irrelevant (haben Fedlex direkt)
- [werkzeuge/suche-eval-baseline-2026-07-16.md](werkzeuge/suche-eval-baseline-2026-07-16.md) — **Suchgüte-Eval-Baseline 16.7.2026 (advisory, kein Gate):** `scripts/suche-eval.ts` (`npm run eval:suche`) misst die ECHTE Produkt-Suche gegen 69 verifizierte Gold-Paare (Gold `scripts/suche-eval-gold.json`), deterministisch/LLM-frei, Recall@1/5/10·MRR·NDCG@10 je Klasse. Baseline: normzitat/bge 0.83 (Rang-1-Zitate stark), **umgangssprache Recall@10 0.18 = grösste Lücke** (Kompositum ≠ FlexSearch-forward-Präfix), stichwort 0.75; Nebenfund: FR/SR-Alias im Norm-Sprung unvollständig (Cst/LDIP)
- `scripts/fedlex-cache.sh` — konsolidierte Filestore-HTMLs nach /tmp + Anker-Prüfung
- `scripts/plz-generieren.ts` — amtliches PLZ-Register (swisstopo) + Gemeinde→Amt-Daten
- `scripts/golden-outputs.ts` — Golden-Protokoll der Engines (Fallzahl nicht hier hartkodiert, §Kurzregel 5 — aktueller Stand: [`golden/lexmetrik-golden.json`](../golden/lexmetrik-golden.json))
- `scripts/og-bild.ts` — Generator der Social-Card `public/og.png` (W1.10, `npm run og:bild`)
- `scripts/messung-cwv.ts` — CWV-Messung am Indexierungs-Hebel (W1.11, `npm run messung:cwv`)

## seo/ — Sichtbarkeit & Performance (Strang B, ohne David-Fachzeit)

- [CWV-Baseline (W1.11)](seo/cwv-baseline.md) — LCP/Transfer/Requests der prerenderten Detailseiten; Befund: render-then-replace trägt die LCP auch bei OR/ZGB (~1.7/1.1 MB), W2.8-Splitting für LCP nicht dringlich

## Verwandtes im Repo (nicht hier dupliziert)

- `src/lib/fedlex.ts` — verdrahtete Fedlex-Basis-URLs + Anker-Logik
- `src/data/verifikation.ts` — Rechtsprechungs-Register (BGE/BGer)
- `src/lib/vorlagen/behoerden.ts` — abgenommene Behörden-Stammdaten (BS)
- `STRUKTUR.md` — Gesamtstand · `KATALOG-ROADMAP.md` — Soll-Inventar
- [GlG-Schlichtungsstellen aller 26 Kantone](behoerden/glg-schlichtungsstellen-kantone.md) — Art. 200 Abs. 2 ZPO: je Kanton Norm WÖRTLICH + amtliche Stelle/Adresse (16 eigene · BE-Konzentration · GE/JU/VD Arbeitsgerichte · 7 ordentlich-paritätisch); Vollerhebung 11.6.2026, Abnahme ausstehend
- `recherche/zefix-api.md` — Zefix-REST-API + UID-Prüfziffer eCH-0097 für den UID-Lookup in Vorlagen (CORS/CSP, Felder, Handprobe; 11.6.2026)
