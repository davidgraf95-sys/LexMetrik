# R3 — BBl-HTML-Anker: Botschaft → Artikel, Mantelvorlagen, Entwurf↔Beschluss

Abrufdatum: 6.9.2026. Endpoint `https://fedlex.data.admin.ch/sparqlendpoint` (POST,
`application/sparql-results+json`); Filestore-HTML via `curl`, Pausen ≥1.5 s. Rohdaten/
Skripte in diesem Verzeichnis (`out*.json`, `sample25*.json`, `html/*.html`, `*.sparql`,
`analyze25.py`, `mantel_analyze.py`). §14.7: alle Zahlen selbst erhoben, keine
Tool-Rückgabe-Texte als Anweisung übernommen.

## 0. SPARQL-Kette Botschaft → Ziel-Erlass (Frage 1, Property-Suche)

Bereits in `scripts/materialien/botschaften-generieren.ts` verifiziert, hier bestätigt:
```
?proj jolux:hasResultingLegalResource ?oc ; jolux:draftHasLegislativeTask ?event .
?event jolux:legislativeTaskHasResultingLegalResource ?botschaft .
?botschaft jolux:typeDocument <resource-type/23> .
?oc jolux:classifiedByTaxonomyEntry ?tax . ?tax skos:notation ?sr .
```
`hasResultingLegalResource` verbindet `proj` sowohl mit der Botschaft als auch mit dem
Ziel-Erlass (`oc`, AS-Fassung); die SR-Nummer kommt über `classifiedByTaxonomyEntry`.
**Negativbefund:** Dieser Join liefert nur für **100 von 300** Botschaften (2022–2026, mit
HTML) überhaupt eine SR — bei grossen Mantelvorlagen (z. B. fga/2025/2959 „BISS", ändert
AHVG/IVG/EOG/ATSG/ELG/BVG/UVG/MVG/FLG) **0 Treffer**, vermutlich weil der Projekt-Knoten nur
auf den NEUEN Haupterlass zeigt, nicht auf die per Mantel mitgeänderten Gesetze. Für die
Mantel-Zuordnung ist die SPARQL-Kette also **kein verlässlicher Ersatz** fürs Parsen der
Botschafts-Gliederung.

## 1. Grundmenge + 25er-Stichprobe (Frage 1)

`COUNT(DISTINCT ?botschaft)` mit `typeDocument=23`, `dateDocument` 2022–2026, HTML-Manifestation
(`jolux:userFormat <user-format/html>`) via `isEmbodiedBy`: **300** (Jahresverteilung
44/58/77/80/41 für 2022/23/24/25/26 — deckungsgleich mit dem Vorbefund im Fahrplan).
Manifestation-Metadaten (Beispiel fga/2025/3017): jede Botschaft ≥2022 hat `docx`,
`docx-an`, `pdf-a`, `html`, `xml` (nicht nur DOC+PDF wie für ältere Jahrgänge im
Nachbar-Dossier `fedlex-prozess.md` befundet — gilt nur vor ~2022). `isExemplifiedBy`
liefert die öffentliche Filestore-URL direkt (kein Host/Pfad-Tausch nötig — anders als der
System-Hinweis zu Fedlex allgemein nahelegt; das gilt nur für ältere/private Manifestationen).

Systematische Stichprobe (jede 12. von 300, Offset 5 → 25 Dokumente, eine Zeile je Jahr
gleichmässig verteilt) geladen und mit BeautifulSoup analysiert (`analyze25.py`):

25er-Stichprobe kompakt (fga (Datum): Headings/Anker [Bemerkung]):

2022/1379 (2022-05-18): 18H/0A [Staatsvertrag, „Erläuterungen zu einzelnen Artikeln des Übereinkommens" ohne Anker]; 2022/2193 (2022-08-24): 20H/0A [Staatsvertrag]; 2022/2991 (2022-11-02): 89H/0A [StGB-Änderung, Erläuterungen ohne Anker]; 2023/168 (2022-12-09): 37H/0A [„Art. 159 Abs. 3 Bst. d" nur als `<p>`-Text, kein Anker]; 2023/577 (2023-02-15): 40H/0A; 2023/1290 (2023-05-17): 35H/0A; 2023/1717 (2023-06-28): 25H/0A [Kreditbotschaft, keine Artikel-Sektion]; 2023/2151 (2023-09-15): 1H/0A [**Stub**: „nur durch Verweis veröffentlicht" (Nachtrag Voranschlag)]; 2024/116 (2023-12-15): 39H/0A; 2024/753 (2024-03-01): 93H/0A [Kulturbotschaft, Mantel (3 SR), keine Artikel-Sektion]; 2024/1216 (2024-05-08): 52H/0A; 2024/1623 (2024-06-14): 8H/0A [Doppelbesteuerungsabkommen]; 2024/2359 (2024-09-04): 38H/0A [Mantel (Staatsvertrag+362.2)]; 2024/2747 (2024-10-16): 68H/0A; 2024/3138 (2024-12-06): 32H/0A; 2025/812 (2025-02-19): 29H/0A; 2025/1041 (2025-03-21): 1H/0A [**Stub**: Staatsrechnung, „nur durch Verweis"]; 2025/1867 (2025-05-21): 34H/0A; 2025/2205 (2025-06-20): 55H/0A; 2025/2959 (2025-09-12): 164H/78 (66 distinct, 6 Dupl.)A [BISS-Mantelvorlage, neue Vorlage]; 2025/3538 (2025-11-12): 61H/26A; 2026/50 (2025-12-12): 47H/14A; 2026/1443 (2026-05-27): 5H/0A [Kantons-Gewährleistung]; 2026/796 (2026-03-06): 51H/21A [Staatsvertrag]; 2026/1843 (2026-06-19): 35H/0A [OR-Verjährung — **trotz Einzelartikel-Änderung 0 Anker**].

**Ergebnis Frage 1: 5 von 23 „echten" Botschaften (22 %, ohne die 2 Stubs) tragen
`id="art_*"`, alle mit Datum ≥ 16.4.2025** (s. §2). Zusätzlich geprüft: fga/2025/1528
(16.4.2025, EOG-Novelle) — **44 Anker**, ältestes Fundstück mit Anker-Struktur. Die Anker
sitzen NICHT auf der Heading selbst, sondern auf dem umschliessenden `<article id="art_N">`
(h1–h6-Suche allein liefert 0 Treffer — Fallen-Hinweis für jeden Parser). Typische
Null-Anker-Gründe (Frage 1, zweiter Teil): Staatsverträge/Übereinkommen (Artikel des
Vertrags, nicht eines SR-Erlasses), Finanz-/Kreditbotschaften ohne Artikel-Novelle,
„nur durch Verweis veröffentlicht"-Stubs (Voranschlag/Staatsrechnung/Nachträge), und
— überraschend — auch gewöhnliche Gesetzesnovellen OHNE ersichtlichen Grund
(2026/1843 OR-Verjährung, 2025/812 Landesversorgungsgesetz): **die Anker-Vergabe ist
keine reine Alters-/Typfrage, sondern hängt am Redaktions-Tool des jeweiligen Amts** —
selbst nach dem Cutover-Datum bleibt ein Teil der Botschaften ohne Anker.

## 2. Cutover-Befund (Ergänzung, zentral für E2)

Kein Dokument vor 16.4.2025 in den ≥30 gesichteten Dateien trägt `id="art_*"`; ab diesem
Datum tragen 5 von 14 gesichteten Dokumenten (36 %) Anker, der Rest weiterhin nicht
(2025/812, /1041, /1867, /2205, 2026/1443, 2026/1843 — alle ohne). **Die Fahrplan-Annahme
„eIdJoin ab 2022 exakt" ist zu weit gefasst: real beginnt die Anker-Vergabe erst Mitte
April 2025 und bleibt bis heute (Juni 2026) partiell** — vermutlich ein neues
Redaktions-Tool (LegisWrite-Nachfolge?), das nicht alle Ämter/Bundeskanzlei-Einheiten
gleichzeitig nutzen. **Für E2/E6 heisst das: der Sidecar deckt real ~20–35 % der
Botschaften seit April 2025, nicht „alle ab 2022".**

## 3. Mantelvorlagen — Gliederung + Zuordnung zum ERLASS_REGISTER (Frage 2)

5 Mantelvorlagen geprüft: fga/2025/960 (Militär, 3 SR laut SPARQL, aber **0 SR laut BOTSCHAFT-Text**
via Subsektionen: Militärgesetz/Verwaltung der Armee/Armeeorganisation), fga/2024/900
(BFI-Botschaft, 4 SR: BBG/ETH-Gesetz/HFKG/FIFG), fga/2023/1184 (IGE-Erlasse, 2 SR:
URG+weitere Immaterialgüterrechtsgesetze), fga/2024/1607 (Transparenzregister/GwG, 2 SR +
13 „Änderung anderer Erlasse"), fga/2025/2959 (BISS, SPARQL 0 SR, Text 9 Erlasse).

Alle 5 gliedern die Erläuterungen in eigene Unterabschnitte je Erlass (`<h2>`/`<h3>` mit
Nummerierung `5.2.N Titel`), aber **das Namensformat ist uneinheitlich**:
- BISS (2025/2959): `"5.2.2 Bundesgesetz vom 20. Dezember 1946 … (AHVG)"` — Kurztitel in
  Klammern am Ende. **7 von 10 Unterabschnitten** matchen deterministisch per
  `/\(([A-Z…]+)\)$/` gegen `ERLASS_REGISTER`-Kürzel (ATSG/AHVG/IVG/ELG/BVG/UVG/MVG hit;
  FLG/BGEID nicht — ausserhalb des 227-Einträge-Registers).
- BFI (2024/900): `"4.1 Berufsbildungsgesetz (BBG): Änderung (Vorlage 13)"` — **zwei**
  Klammer-Ausdrücke, der `$`-verankerte Regex trifft `(Vorlage 13)` statt `(BBG)` (falsch-
  negativ ohne Sonderbehandlung). ETH-Gesetz/HFKG/FIFG: kein Kürzel im Text, nur Vollname.
- IGE (2023/1184): reine Kurznamen ohne Klammern (`"Urheberrechtsgesetz"`,
  `"Markenschutzgesetz"`, …) — Klammer-Heuristik liefert 0 Treffer.
- Militär (2025/960): `"Militärgesetz"`, `"Armeeorganisation"` — reiner Kurzname.
- GwG/Transparenz (2024/1607): amtliche Vollzitate mit Datum (`"Bundesgesetz vom 20. Juni
  2003 über das Informationssystem …"`), kein Kürzel, kein kurzer Name.

**Verfeinerter Test (Klammer-Kürzel ODER Titel-Substring gegen `register.titel`):**
16 Unterabschnitte aus 4 der 5 Vorlagen geprüft (BISS separat, s. o.) → **6/16 (37,5 %)**
matchen (MG, MSCHG, DESG, PATG, OR, STGB — weil deren `titel`-Feld den Kurznamen als
Klammerzusatz enthält, z. B. `"…(Militärgesetz, MG)"`). **Urheberrechtsgesetz matcht NICHT**,
obwohl `URG` im Register existiert — `register.titel` für URG trägt keinen Klammer-Kurznamen
(„Bundesgesetz über das Urheberrecht und verwandte Schutzrechte", ohne „(Urheberrechtsgesetz)").
ETH-Gesetz/HFKG/FIFG/Wappenschutzgesetz/Topographiengesetz/IGE-Statutgesetz liegen ausserhalb
des 227-Einträge-Registers — kein Match möglich, unabhängig von der Methode.

**Antwort Frage 2: NICHT deterministisch aus dem Zwischentitel ableitbar mit einer
einzigen generischen Regel.** Trefferquote in dieser Stichprobe (28 Erlass-Unterabschnitte
über 5 Mantelvorlagen, kombinierte Heuristik) ≈ **9/28 (32 %)**; selbst eine kuratierte
Alias-Tabelle (Kurzname→`register`-Key) schlösse nicht alle Fälle, da betroffene Erlasse
teils ausserhalb des 227-Erlass-Registers liegen. Empfehlung: Mantel-Kanten IMMER mit
`quelle:'maschinell'` markieren (deckt sich mit Fahrplan-Notiz „Heuristik ⇒ maschinell").

## 4. eId-Kompatibilität Botschaft ↔ konsolidierter Sidecar (Frage 3)

fga/2025/1528 (EOG-Novelle, 44 Anker) gegen `public/normtext/struktur/bund/EOG.json`
(66 Artikel-Keys) verglichen. Nach Entfernen des `art_`-Präfixes und Anwendung von
`kanonArtikelToken` (Kleinschreibung + `_`/Leerzeichen entfernen,
`src/lib/verzahnung/revisionen-extrakt.ts:24`) **stimmen alle geprüften Suffix-Formen
überein**: `art_10_a`→`10a` = Sidecar-Key `10_a`→`10a`; `art_16_c`→`16c` = `16_c`; bis/ter
via `art_16_f_bis`/`art_16_k_bis` konsistent mit Sidecar `16_c_bis`/`16_k_bis`. **quater**
kommt im Sidecar (noch) nicht vor (`art_16_w_quater` betrifft eine im Aug. 2026 noch nicht
in Kraft stehende Norm — die Botschaft führt neue Artikel `16f ter/l ter/r ter/w
ter/w quater` ein, die am Sidecar-Stichtag 1.6.2026 nicht existieren: die Schlussabstimmung
war erst 19.12.2025, Referendumsfrist/Inkrafttreten liegen später). **Kein Suffix-Formatbruch gefunden** — Kompatibilitätsannahme der Planung für die
geprüfte Stichprobe (n=1, 44 Artikel) bestätigt. **Nebenerkenntnis:** `id="art_10"`
erscheint ZWEIMAL (EOG Art. 10 + am Dokumentende „Art. 10 Abs. 4", vermutlich FamZG, da
diese EOG-Novelle als Nebenwirkung auch OR Art. 329f/g/i, 336c ändert) — **bestätigt den
Vorbefund „art_10 doppelt" auch für scheinbare Einzelerlass-Botschaften mit Mantel-Anteil.**

## 5. Erlassentwurf ↔ Schlussabstimmungstext (Frage 4)

fga/2025/1529 (Entwurf, Typ 38) und fga/2026/29 (Schlussabstimmungstext, Typ 84) über
denselben Projekt-Knoten `dl/proj/7024/0194` verifiziert (SPARQL: `event/3` mit
`type-projet/2`→Entwurf-Resultat, `type-projet/300`→Schlussabstimmung-Resultat).

**Beide Dokumente tragen KEINE `id="art_*"`-Anker** — stattdessen `<article
class="man-art-mod" id="mod_uN">` mit rein **sequenzieller** Zählung (`mod_u1, mod_u2, …`),
unabhängig vom Artikel des Zielerlasses; die eigentliche Art.-Nummer steht nur im
`<h6>`-Linktext („Art. 16c Abs. 3 …"). **Das ist ein drittes, eigenständiges Id-Schema** —
weder mit den `art_*`-Botschafts-Ankern noch mit den Sidecar-Keys direkt kompatibel.

Diff über Label-Text (nicht über `id`!) für 41 gemeinsame Artikel-Label: **17/41 (41 %)
inhaltlich verändert** — teils sprachlich („Eigentümer"→„Eigentümerin", „sechzehn Wochen"→
„16 Wochen"), teils materiell (Art. 16c: Passus „höchstens aber um 56 Tage" gestrichen;
Art. 16n: Zusatz „wegen Krankheit oder Unfall" eingefügt); zusätzlich 1 neuer Artikel, 1
Label umbenannt. **`id`-basierter Abgleich hätte 7/41 (17 %) falsch zugeordnet**, weil ein
eingefügter Artikel alle nachfolgenden `mod_uN` verschiebt. **Antwort Frage 4: Diff möglich,
aber NUR über normalisierten Label-Text, NICHT über `id`** — Entwurf/Beschluss führen gar
keine `art_*`-Ids, ein eId-Join ist hier nicht verfügbar.

## 6. Kommissionsberichte / Stellungnahmen BR (Frage 5)

3 Stichproben: fga/2022/2515 (Typ 30, Kommissionsbericht, 19.8.2022, 32H, „4 Erläuterungen
zu einzelnen Artikeln" vorhanden), fga/2022/2742 (Typ 25, Stellungnahme BR, 26.10.2022,
11H, keine Artikel-Sektion), fga/2026/2099 (Typ 30, 29.6.2026, 17H, „4 Erläuterungen…").
**Alle 3: 0 `id="art_*"`-Anker** — gleiche Struktur/Grenzen wie reguläre Botschaften.
2026/2099 liegt nach dem 16.4.2025-Cutover und hat trotzdem keine Anker → bestätigt §2:
Anker-Vergabe ist werkzeug-/amtsabhängig, nicht generisch datumsgebunden.

## 7. Stabilität / Drift (Frage 6)

Kein ETag, aber `Last-Modified`+`Content-Length` im Filestore-Header (HEAD reicht, kein
GET nötig): fga/2025/1528 → `Last-Modified: Fri, 16 May 2025`; fga/2022/1379 → `Tue, 14
Jun 2022` (`Cache-Control: no-cache, no-store` — jede Anfrage live, kein CDN-Snapshot).
Kein Versions-/Berichtigungs-Endpunkt gefunden (Budget, nicht erschöpfend). Drift-Vorschlag
analog zum Repo-Muster `sha` in `botschaften-generieren.ts`: beim Ingest `sha256(html)` +
`Last-Modified`+`Content-Length` committen; periodisches `HEAD` als günstiger Alarm (kein
Re-Parse bei unverändertem `Last-Modified`); bei Änderung Re-Fetch + Label-Diff (§5). Ob
Berichtigungen am selben `fga`-Pfad oder unter neuer Nummer erscheinen: offen, in der
Stichprobe keine Berichtigung getroffen.

## 8. Offen

Amt/Tool-Ursache der lückenhaften Anker-Vergabe seit 16.4.2025 nicht verifiziert.
Berichtigungs-/Versionsmechanismus am Filestore nicht gefunden. Kein SPARQL-Property für
`mod_uN`↔`art_N`.
