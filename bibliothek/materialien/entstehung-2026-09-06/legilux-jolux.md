# Recherche: Legilux/Casemates als Vorbild für "Entstehung am Artikel"
Abrufdatum: 6.9.2026 (WebSearch/WebFetch/curl, ~28 Abrufe, read-only)

## 1. Legilux — UI-Muster

**a) Konsolidierte Fassung = eigene URL je Stichtag (übernehmbar)**
- `.../consolide/<YYYYMMDD>` ist eine eigene, adressierbare Ressource, kein
  reiner Client-Slider. Beispiele:
  https://legilux.public.lu/eli/etat/leg/loi/2018/08/01/a686/consolide/20251226
  (Titel lt. Suchtreffer: "Version consolidée applicable au 26/12/2025"),
  Code civil: https://legilux.public.lu/eli/etat/leg/code/civil/20200101.
  Disclaimer lt. Snippet: "version consolidée = document sans valeur
  légale" — Formel für unsere Synopse übernehmbar (§8).
- WebFetch auf die Seite selbst zeigte nur das JS-Grundgerüst (Angular/React
  SPA) — Artikel-Liste/Buttons NICHT direkt aus dem Markup verifizierbar,
  nur aus Suchtreffer-Snippets erschlossen. **Offen**: exaktes Layout der
  Artikel-Änderungshistorie im UI.

**b) Statische Amtsblatt-HTML zeigt sauberen Artikel-Baum**
- https://data.legilux.public.lu/file/eli-etat-leg-loi-2018-08-01-a686-jo-fr-html.html
  (kein JS nötig, vollständig lesbar). Titre I–III, Kapitel, Art. 1–77,
  Inline-Verweise auf EU-VO 2016/679 und das abgelöste Gesetz v. 2.8.2002.
  Fussnote "Doc. parl. 7184; sess. ord. 2016-2017 et 2017-2018" steht als
  **reiner Text, nicht als Hyperlink** zu chd.lu. Ob andere Legilux-Seiten
  Doc.-parl.-Nummern klickbar zu chd.lu-Dossiers verlinken, wurde NICHT
  gefunden — **offen**.

**c) "Modifié par"/Impact-Relationen im Datenmodell bestätigt, UI offen**
- Jede Änderung ist ein eigenes `LegalResourceImpact`-Objekt (Typ, Datum,
  Ziel-/Quelldokument) — siehe SPARQL unten. Ob Legilux dies im Frontend als
  sichtbare Liste je Artikel zeigt, war per WebFetch nicht zu verifizieren
  (JS-Gerüst). **Offen.**

## 2. SPARQL-Endpunkt data.legilux.public.lu — GETESTET, funktioniert

`POST https://data.legilux.public.lu/sparqlendpoint` (Virtuoso, HTTP 200,
`Accept: application/sparql-results+json`). Bestätigte jolux-Properties:
- `jolux:dateApplicability` — **63'346 Tripel** im Graph, exakt derselbe
  Name wie bei Fedlex.
- `jolux:legalResourceImpactHasType`, `impactFromLegalResource`,
  `impactToLegalResource`, `legalResourceImpactHasDateEntryInForce`,
  `impactConsolidatedBy(Expression)` — live abgefragt, funktioniert.
- `jolux:draftHasTask` (NICHT `draftHasLegislativeTask`) mit Beispielwerten
  wie `.../eli/dl/pl/2023/3/evenement/dept/1` (`pl`=projet de loi).
- `jolux:legislativeTaskType` — Abfrage: **0 Treffer**, Property entweder
  anders benannt (`jolux:eventType` existiert im Prädikat-Verzeichnis) oder
  nicht befüllt. **Nicht bestätigt.**
- Weitere vorhandene Prädikate (nur aus generischer Liste, nicht einzeln
  gegengeprüft): `hasOpinion`, `hasResultingDraftDocument`,
  `foreseesModificationOf`, `notificationEntryInForceDate`.
- **Fazit:** gleiche jolux-Ontologie, viele identische Property-Namen
  (`dateApplicability`, Impact-Struktur), aber NICHT 1:1 — Property-Namen
  müssen je System einzeln geprüft werden (§7), nicht von LU auf CH
  übertragen.

## 3. Casemates/JOLux — Hersteller und Doku

- Eigentümer: **SCL** (Service Central de Législation, Luxemburg).
  Implementierung: Firma **SWORD**. Spezifikation/Projektleitung: **Sparna**
  (sparna.fr) — Lastenheft, funktionale Architektur, Aufsicht über SWORD.
  Projektstart 1.1.2017. Stack lt. Sparna: FRBR-OO, RDF, ElasticSearch,
  SPARQL, ELI + schema.org.
  (Quellen: interoperabilite.public.lu/fr/actions-produits/legilux-casemates.html,
  sparna.fr/en/references/government-of-luxembourg)
- Lizenzmodell lt. interoperabilite.public.lu wörtlich: **"closed open
  source"** — kein klassisches Open-Source-Repo für den Kern.
- Internationale Verbreitung: **Schweiz kaufte Casemates/Komponenten im
  Dezember 2019** (Basis von Fedlex), **Italien im Mai 2021**.
- JOLux-Doku offiziell für CH: https://swiss.github.io/fedlex-jolux/introduction.html
  (© Bundeskanzlei, Repo `swiss/fedlex-jolux`), Abschnitte Abstraction
  Levels, Drafts, Impacts, History/Changes/Citations, SPARQL-Beispiele,
  JupyterLite-Tutorial. **Erwähnt weder Casemates noch Luxemburg** —
  eigenständig geschrieben.
- LU-seitig existiert `data.legilux.public.lu/home/models` ("Modèle de
  données JOLux"), Inhalt per WebFetch nicht verifizierbar (JS-Seite).
  **Offen**, ob OWL-Download vorhanden. Kein Changelog zur Ontologie
  gefunden (weder LU noch CH) — **offen**.

## 4. GitHub-Funde (jolux, legilux, casemates, "fedlex sparql", "ELI legislation switzerland")

Relevanteste Neufunde:
1. **sparna-git/sparnatural-legilux-casemates** — Sparnatural-Visual-Query-
   Builder für Legilux/Casemates-SPARQL (config.ttl, Query-Templates,
   YASGUI). Query-UI, **kein** Fassungsvergleich/Materialien-Feature —
   nützlich als Recherche-Werkzeug, nicht als Endnutzer-UI-Vorbild.
2. **swiss/fedlex-jolux** (1★, Push 20.3.2026) — Quellcode der offiziellen
   CH-JOLux-Doku-Site, direkt als Property-Referenz brauchbar.
3. **matematicsolutions/lu-eli-mcp** + **ch-eli-mcp** (Aug 2026, selber
   Autor) — MCP-Server für ELI-Ressourcen LU bzw. CH parallel; als
   URI-Schema-Vergleich brauchbar, kein UI/Feature-Fund.

Geringe/keine Relevanz (Vollständigkeit): SFHAJJI/lex-corpus-lu-legilux
(Korpus-Dump), Ansvar-Systems/Luxembourg-law-mcp, pepe57/Luxembourg-law-mcp,
JayTheSkier/fedlex-connector, malkreide/fedlex-mcp, mindful-bio/mcp-fedlex,
OpenHelvetia/mcp-fedlex-oh, legalgian/fedlex-sr-mcp — reine API/MCP-Wrapper
ohne erkennbare Fassungsvergleich/Materialien-Logik (nur Metadaten geprüft).
GitHub-Suche "ELI legislation switzerland": **0 Treffer**. Suche "casemates"
(15 Treffer) fast komplett thematisch fremd (Namensgleichheit, z.B.
Krankenhaus-App "CaseMate") — **für unseren Plan bedeutungslos**.

## 5. EU-Vergleich (EUR-Lex/CELLAR/ELI) — ein Absatz

EUR-Lex nutzt für konsolidierte Rechtsakte dasselbe ELI-Muster: Stichtag im
URI (`.../eli/{typedoc}/{year}/{nr}/{start-date}`), strukturell identisch zu
Legilux `.../consolide/<YYYYMMDD>` und Fedlex `.../de/YYYYMMDD`. Übernehmbar:
Link **"Show all versions"** am Rand einer konsolidierten Fassung → Liste
aller historischen Stichtage (Quelle: eur-lex.europa.eu/collection/eu-law/consleg.html,
.../content/online-learning/eurlex-content/exploring-a-consolidated-text.html).
Gleicher Disclaimer wie Legilux: konsolidierte Texte "ohne Rechtswirkung,
nur Dokumentation" (passt zu §8). Artikelspezifische JOLux/CELLAR-Properties
bei EUR-Lex nicht recherchiert (ausserhalb Budget) — **offen**.

## Offene Punkte
- Visuelles Layout der Legilux-Artikelseite (Timeline, Änderungshistorie je
  Artikel) — JS verhinderte Verifikation, nur aus Snippets erschlossen.
- Ob "Doc. parl."-Referenzen irgendwo klickbar zu chd.lu führen.
- Inhalt data.legilux.public.lu/home/models (OWL-Download ja/nein).
- `jolux:legislativeTaskType` in LU-Graph nicht nachweisbar.
