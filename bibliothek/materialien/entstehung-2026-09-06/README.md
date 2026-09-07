# Entstehung am Artikel — Recherche-Runde 6.9.2026

**Anlass:** David 6.9.2026: «Materialien und Wegleitungen maximal sinnvoll
verzahnen, Gesetzgebungsprozess verständlich machen.» Sieben Sonnet-Berichte
(read-only, Live-Abfragen 6.9.2026) plus zwei ungeprüfte Gemini-Zweitmeinungen
in diesem Ordner, wörtlich kopiert. **Bau-Spec:**
`fahrplaene/FAHRPLAN-MATERIALIEN-VERZAHNUNG.md` §11 (parallel angelegt),
Roadmap-Schritte W2·6c-ENTSTEHUNG-*.

## Befunde je Bericht

- **`curia-vista.md`** — OData-V3 `ws.parlament.ch/odata.svc/`, No-Auth, 49
  Entitäten (`Business`, `Objective`, `Vote`, `Voting`, `Transcript` u.a.).
  `Objective` ist der Join-Pfad Botschaft→Schlussabstimmung→Referendumsfrist.
  Harte Server-Paginierung bei 1000 Sätzen unabhängig von `$top`.
- **`fedlex-prozess.md`** — SPARQL-Endpoint, jolux-Ontologie, Prozesskette
  via `type-projet`-Vokabular: 7299 Botschaften, 4931 Beschlüsse, 1868
  Referendumsfristen, 629 Abstimmungstermine. BBl-Volltext nur DOC/PDF-A,
  kein XML/HTML im Graph selbst.
- **`kantone-zh-bs.md`** — ZH: CKAN-Geschäftsdatenbank ohne Lizenzfeld, kein
  ZH-Lex-API-Materialien-Link (Negativbefund). BS: reichhaltiger, CC BY 4.0,
  Datensätze 100311/100313/100515f./100354f. mit `signatur_ges` als
  Join-Schlüssel Geschäft↔Dokument↔Gesetzesänderung.
- **`bund-wegleitungen.md`** — Landkarte Wegleitungen/Kreisschreiben (SEM,
  BJ, BAZG, SECO, IGE u.a.); kein Gesamtkatalog auf opendata.swiss, BSV mit
  stabilster Versionierung (Top-8-Priorität für Verzahnung).
- **`nutzersicht-vorbilder.md`** — Rangliste nach Nutzen×Machbarkeit: (1)
  Prozess-Timeline je Erlass vollständig deterministisch, (2) artikelscharfe
  Botschaftsstellen deterministisch **nur ab BBl 2022**, davor null.
  URG-Frage geklärt (kein Hindernis).
- **`vorbilder-github.md`** — Kein CH-Projekt rekonstruiert Botschaft→
  Kommission→Ratsdebatte→Abstimmung→Inkraftsetzung pro Artikel (bestätigte
  Lücke = Chance). Fünf Vorbilder für Datenmodell/UI, u.a.
  legislation.gov.uk (Artikel-Version↔Änderungs-Effekt via URI).
- **`buzer.md`** — Kommerzielles Konsolidierungsportal DE: Point-in-Time-URL
  je Paragraphenfassung, Absatz-/satzgenaue Synopse alt/neu als UI-Vorbild;
  kein Bulk-Export, Lizenz der aufbereiteten Daten nicht auffindbar.
- **`gemini-curia.md` / `gemini-vorbilder.md`** (Zweitquelle, ungeprüft) —
  siehe Vergleichszeile in `fahrplaene/FAHRPLAN-FREMDAGENTEN.md`
  («Recherche-Vergleich Sonnet vs. Gemini», 6.9.2026): Gemini lieferte kein
  eigenes Datenmodell/Join (nicht abgefragt), zwei Zulieferer-Hinweise
  (metaodi/swissparlpy, api.openparldata.ch) als einziger Mehrwert.

## Absagen (empirisch geprüft, nicht nur vermutet)

- **Amtliches Bulletin je Artikel** — `Transcript` hat kein Artikel-Feld,
  nur Freitext; nicht ohne Heuristik verknüpfbar (`nutzersicht-vorbilder.md`).
- **Referendum aus dem Fedlex-Graph** — nur 13 „Ergebnis"-Events, kein
  Kantons-Ständemehr, kein Ja/Nein-Anteil im Graph (`fedlex-prozess.md`).
- **Erläuternde Berichte zu Verordnungen** — kein Fedlex-Doktyp gefunden,
  kein Hebel im Graph (`fedlex-prozess.md`, `nutzersicht-vorbilder.md`).
- **Vernehmlassungs-Ergebnisberichte** — kein Doktyp im Fedlex-Vokabular,
  liegen nur als PDF an der Verfahrensseite (`nutzersicht-vorbilder.md`).

## Fallen

- **Fedlex-JS-Shell:** normale Fetches liefern nur das Gerüst, nicht den
  Graph-Inhalt — SPARQL/REST direkt ansprechen (`fedlex-prozess.md`).
- **BBl-Dateiname ohne `-N`-Suffix:** Namensmuster bricht je nach Jahrgang,
  vor Gebrauch empirisch prüfen (`nutzersicht-vorbilder.md`).
- **Kein `isExemplifiedBy` für BBl:** die erwartete Property existiert nicht;
  Verknüpfung läuft über andere Relationen (`fedlex-prozess.md`).
- **OData-Sprachfilter:** `Language eq 'DE'` liefert bei `Subject`/
  `MeaningYes` teils französische Werte zurück — Falle belegt
  (`nutzersicht-vorbilder.md`, `curia-vista.md`).
- **1000er-Paging:** `$top` grösser als 1000 wird von `ws.parlament.ch`
  serverseitig gekappt, unabhängig vom Parameterwert (`curia-vista.md`).
- **`type-projet`-Namensraum:** `legislative-task-type` existiert nicht,
  korrekt ist `type-projet` (`fedlex-prozess.md`).

## Lizenz-Auflagen

- **Curia Vista:** Quellenangabe zwingend als «Parlamentsdienste der
  Bundesversammlung, Bern», inhaltliches Änderungsverbot, Abrufdatum zu
  dokumentieren — strenger als reine URG-Freiheit (`curia-vista.md` §2,
  wörtliches Zitat der amtlichen Seite, Abruf 6.9.2026).
- **Art. 5 Abs. 1 lit. c URG:** einschlägig für Botschaften und Amtliches
  Bulletin als amtliche Dokumente — kein Urheberrechtshindernis, aber die
  Curia-Vista-Zusatzpflicht bleibt zu beachten (`bund-wegleitungen.md`
  §„Rechtslage URG Art. 5").
- **BS-Datensätze:** CC BY 4.0 (`kantone-zh-bs.md` §2). **ZH:** Lizenzfeld
  im CKAN-Metadatum leer, nicht als frei anzunehmen.

## Status

**Maschinell recherchiert, fachliche Abnahme David offen.** Kein Repo-Code
wurde durch diese Runde geändert — reine Wissensablage nach §11. Weiterbau
nur gegen die Bau-Spec `fahrplaene/FAHRPLAN-MATERIALIEN-VERZAHNUNG.md` §11
und mit erneuter Norm-Verifikation nach §7 vor jeder Übernahme in Code.

## Tiefen-Runden (6.9.2026, nach der Erst-Runde; Plan-Optimierung vor dem Bau)

| Datei | Frage | Kernbefund |
|---|---|---|
| [R1-fussnoten-zensus.md](materialien/entstehung-2026-09-06/R1-fussnoten-zensus.md) | tragen die Sidecar-Fussnoten die Kette Artikel→AS→BBl korpusweit? | ja (31 176 Fussnoten, 80,6 % oc, 42,5 % +fga, 62 % unter Artikel-Ebene); Teilmengen-Tor gegen SPARQL-Revisionen hält nicht (12,6–40 %); **G-HIST existiert** (`public/normtext/historie/`) |
| [R2-synopse-machbarkeit.md](materialien/entstehung-2026-09-06/R2-synopse-machbarkeit.md) | Synopse alt/neu aus Konsolidierungen? | ja, aber HTML nur ab Stand 1.1.2021; 3,8–9,7 MB; kein `<mod>` im AS-XML; Alias-URL = Phantom; naiver Diff 36 % Falschtreffer; 57 künftige Stände bis 2032 |
| [R3-bbl-anker.md](materialien/entstehung-2026-09-06/R3-bbl-anker.md) | Artikel-Anker im Bundesblatt-HTML? | nur 22 % der Botschaften, keine vor 16.4.2025; Mantel-Zuordnung 32 %; Entwurf/Beschluss-Ids `mod_uN` verrutschen |
| [R4-curia-tiefenprobe.md](materialien/entstehung-2026-09-06/R4-curia-tiefenprobe.md) | Parlament je Geschäft aus Curia Vista? | NR-Stimmen mit 2 Requests; SR ohne Einzelstimmen; `Resolution` via `Bill`; 385 Curia-Nrn., 100 %/92 % Abdeckung; `Modified` nach Migration wertlos |
| [R5-architektur.md](materialien/entstehung-2026-09-06/R5-architektur.md) | wie passt es in den Code? | E2 ohne neuen Parser; E3 = Erweiterung `ArtikelHistorie.tsx` im bestehenden Slot; `check:perf-budget` zählt feste Liste; E3 kollidiert mit `w2-24-r4-leser`/`w2-24-r6` |
| [gemini-synopse.md](materialien/entstehung-2026-09-06/gemini-synopse.md) | Zweitquelle Gemini | zwei Kernaussagen von R2 widerlegt |

Ergebnis: Spec §11 Fassung 2 in `fahrplaene/FAHRPLAN-MATERIALIEN-VERZAHNUNG.md`; Korrektur-Log §11.10.

**Korrektur (Kritik A3, 6.9.2026, Ergänzung nach §2b):** R1 §3c «fga-Altformat 0/16 328» ist falsifiziert — 2 938 von 16 328 fga-Links (18,0 %) tragen das Altformat `eli/fga/JJJJ/3_964_951_873`; nur 338 von 770 fga-Keys der Historie-Shards liegen im Botschaften-Register (34 % der Ereignisse). Kritiken: [KRITIK-A.md](materialien/entstehung-2026-09-06/KRITIK-A.md), [KRITIK-B.md](materialien/entstehung-2026-09-06/KRITIK-B.md); Einarbeitung: Fahrplan §11.0.

**Nachtrag 6.9.2026 (abends), Legilux/JOLux (Auftrag David nach Steiger-Legal-Beitrag 2021):** [legilux-jolux.md](materialien/entstehung-2026-09-06/legilux-jolux.md) — Casemates gehört dem SCL Luxemburg (Implementation SWORD, Spezifikation Sparna, «closed open source», kein Kern-Repo; CH-Kauf 12/2019, IT 5/2021 ⇒ verwandte, nicht identische JOLux-Instanzen: LU `draftHasTask` statt `draftHasLegislativeTask`, `legislativeTaskType` dort 0 Treffer — Property-Namen je System verifizieren, nie übertragen). Übernehmbar: konsolidierte Fassung als eigene URL je Stichtag (`…/consolide/<YYYYMMDD>`, EUR-Lex analog mit ELI-Datum + «Show all versions»), Disclaimer «version consolidée sans valeur légale» für die Synopse (§8), statisches Amtsblatt-HTML als JS-freier Fallback. Parlaments-Referenz «Doc. parl. 7184» in LU nur Text, kein Link. GitHub: `sparna-git/sparnatural-legilux-casemates` (Query-UI), `swiss/fedlex-jolux` (Quelle der amtlichen CH-Doku), `matematicsolutions/lu-eli-mcp`/`ch-eli-mcp` (URI-Schema-Vergleich); Rest Wrapper ohne Fassungs-/Materialien-Logik. Kein Einfluss auf §11-Etappen; Stichtags-URL-Muster als Kandidat für den späteren Zeitreise-Umschalter (F2).

**Nachtrag 6.9.2026 (abends), private Luxemburger Plattformen (Frage David):** [luxemburg-privat.md](materialien/entstehung-2026-09-06/luxemburg-privat.md) — Legitech/LexNow, Strada lex (Larcier), vLex, Wolters Kluwer, Promoculture: alle kostenpflichtig, keine belegte Artikel-Synopse; Lux.memorial (KI, CC-BY); Ansvar `Luxembourg-law-mcp` (archiviert 7/2026, keine Versionierung). **Stärkster Fund: «Lex» law.soufien.lu** (Ein-Personen-Projekt, SFHAJJI), vertieft in [soufien-lex.md](materialien/entstehung-2026-09-06/soufien-lex.md): Kern-Repo `lex` Apache-2.0 (C#/.NET + TS-Web), Daten-Repos CC-BY-4.0, erstellt 31.7.2026, Push 6.9.2026. Methode: Artikel-Identität über die amtlichen AKN-Anker (`art_92`) über Fassungen hinweg — **kein Zwei-Fassungen-Diff zur Erkennung**, Umnummerierung per exaktem Text-Hash, zwei SHA-256 (Bytes / kanonisches JSON ohne eigenes Hash-Feld) als Prüfkette, Wort-LCS-Diff mit Absatz-Eskalation, **Normalisierung nur fürs Matching, nie für Hash/Speicherung**, Profile versioniert statt geändert. UI: Stichtag im URL-Pfad, Banner «galt von–bis» + Sprung zur geltenden Fassung, verlinkbare Diff-Route mit Inline-Wort-Diff (Seite-an-Seite unklar). Verdikt: Darstellung und Algorithmen als Beschreibung übernehmbar (passt zu §2/§7); Code nur `web/src/diff.ts` (TS) portierbar, Rest fremder Stack; nicht 1:1: Legilux AKN-XML mit `id` vs. Fedlex AKN-HTML mit `eId` ab 2021, LU-Konsolidierung nicht amtlich (Fedlex schon), FR/DE-Ordinalproblem. Konsequenz für Spec §11.6 (E5): Normalisierungsregel «nur fürs Matching» und Hash-Kette als Muster übernommen.

**Nachtrag 6.9.2026 (spät), Lex-Architekturdossier (Auftrag David «schau dir genau das an: github.com/SFHAJJI/SFHAJJI»):** [sfhajji-lex-dossier.md](materialien/entstehung-2026-09-06/sfhajji-lex-dossier.md) — Soufien Hajji (Luxemburg, `hireable: true`, Lex = «personal project, unaffiliated», Ein-Personen-Portfolio seit 31.7.2026, 0 Forks; nie als Quelle/Abhängigkeit, nur Ideengeber). Fünf Übernahmen in Spec §11.6/§11.7: (1) **Determinismus-Wächter** «Shard ändert sich ohne Quell-Hash-Änderung ⇒ rot» (trennt Parser-Drift von Gesetzesänderung, §7 d); (2) **versioniertes, nie editiertes Normalisierungsprofil** (`entstehung-norm/1`, Verbesserung = `/2` daneben); (3) **`validity_conflict` als sichtbarer Zustand** (Fussnoten-Ereignis ↔ beobachtete Textänderung); (4) **D53-Speicherform** (distinkte Textzustände je eId + Intervalle) in E5.0 mitmessen; (5) **Deckungs-Seite** «was wir nicht haben» aus `entstehung-deckung.json`; Ereignis-Schlüssel `datum + oc-ELI` statt Listenindex (122 Gleichtags-Fälle). Zwei Unterschiede: unsere amtliche Fussnoten-Kausalachse (Lex hat für LU keine; Historie dort = beobachtete Textänderung ab ~2017) und Amtlichkeit (Legilux-Konsolidierung nicht authentisch ⇒ signierte Manifeste/Key Vault nötig; für uns Overkill, Live-Link auf amtliche Quelle genügt). Lex' Golden läuft `continue-on-error` («review evidence, never a gate»), Rot-Beweis-Harness dort «planned, not built» — unser §6.7 ist weiter. Volumenzahlen von Lex widersprüchlich (2 652/7 022 vs. 2 584/7 826) — nichts ungeprüft übernehmen. Offen: D1–D84 vollständig nur in `docs/lex-spec-v4.md` (134 KB).
