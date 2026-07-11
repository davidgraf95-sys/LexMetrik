# Fedlex-Portfolio Paket 4 — Kuratierte Staatsverträge SR 0.* (10.7.2026)

> §11-Ablage zum Bau von **Fedlex-Portfolio Paket 4** (letztes Paket; `FAHRPLAN-FEDLEX-PORTFOLIO.md §Paket 4`, ROADMAP W2·6). Königsweg = **bestehende konsolidierte `eli/cc`-Pipeline** (kein `eli/treaty`-Extraktor, kein neues Format/Skript). Quelle ausschliesslich amtlich (Fedlex-SPARQL + Filestore-HTML).

## 1. Quelle + Stand

- **Endpunkt:** `https://fedlex.data.admin.ch/sparqlendpoint` (SR→ELI, geltende Konsolidierung, kanonische html-N via `jolux:isExemplifiedBy`) + Filestore-HTML `…/filestore/…/eli/<eli>/<kons>/de/html/…`.
- **Stand/Abruf:** 10.7.2026. Currency-Arbiter bleibt `check:fedlex-versionen` (alle 9 Pins = neueste Konsolidierung, Exit 0).
- **Kein Dritt-Byte** (`droid-f/fedlex` nicht verwendet).

## 2. POC-Befund (Mess-POC vor Bau, §7/§0d)

**Frage:** Welche Kanten trägt der Graph für Verträge (Vertragsparteien? Ratifikationsstand? Inkrafttreten je Partei?) und liefert `eli/treaty` extrahierbares Markup?

**Antwort (empirisch):**
- Die **konsolidierten Staatsverträge liegen im `eli/cc`-Namespace** mit identischem Markup-Vertrag wie Bundesgesetze (`id="art_*"`, `srnummer`, Tabellen, `annex_*`) — der bestehende `extrahiere-fedlex.ts` trägt sie unverändert. `eli/treaty` wurde daher **nicht** gebraucht.
- Der SPARQL-Graph exponiert **keine** direkt verwertbare, strukturierte Kante «Vertragspartei/Ratifikation/Inkrafttreten je Staat». Diese Information steht als amtliche Tabelle «Geltungsbereich am …» (`<section id="scope_u1">`) IM konsolidierten Filestore-HTML — der **bestehende Extraktor erfasst diese `scope_*`-/`decl_*`-Sektion aber NICHT** (pre-existing korpusweit, s. §4a); sie bleibt über den amtlichen Live-Link erreichbar. **Kein separates Parteien-Datenmodell gebaut.**
- **html-N-Falle (wie P1-a) bestätigt:** `html-0` war bei **5/9** Erlassen STALE/nicht-kanonisch (der cache.sh-1..5-Fallback hätte html-0 akzeptiert). Kanonische html-N je Erlass via `isExemplifiedBy` gepinnt.
- **Currency-Falle (Apostille):** die naive «grösste dateApplicability ≤ heute»-Resolver-Abfrage lieferte 2016-07-06 (nur SPA-Shell); der Arbiter `check:fedlex-versionen` wies **2024-09-04** als geltend aus — unter dieser Fassung liefert Fedlex extrahierbares HTML (html-4). → Apostille ist **Snapshot**, nicht pdf-embed.

## 3. Triage-Ergebnis je Kandidat (deterministisch: Eingabe SR → Ausgabe Status)

**Gebaut (9, Rubrik International, rang 110–118):**

| Key | SR | ELI | geltende Kons | html-N (kanon.) | art_* | Anhang | Status |
|-----|-----|-----|-----|-----|-----|-----|-----|
| HKSUE96 | 0.211.231.011 | cc/2009/380 | 2026-01-19 | 0 | 63 | ja | snapshot |
| HUVUE | 0.211.213.02 | cc/1976/1559_1559_1559 | 2016-09-15 | **3** | 37 | – | snapshot |
| EAUE | 0.353.1 | cc/1967/814_854_850 | 2023-06-28 | **5** | 32 | – | snapshot |
| CMR | 0.741.611 | cc/1970/851_851_851 | 2021-02-10 | **3** | 51 | ja | snapshot |
| MONTREAL | 0.748.411 | cc/2005/566 | 2026-04-07 | 0 | 57 | – | snapshot |
| RBUE | 0.231.15 | cc/1993/2659_2659_2659 | 2024-06-06 | **2** | 47 | ja | snapshot |
| UNO_BRK | 0.109 | cc/2014/245 | 2026-05-01 | 0 | 50 | – | snapshot |
| ISTANBUL | 0.311.35 | cc/2018/168 | 2024-12-20 | **1** | 81 | ja | snapshot |
| APOSTILLE | 0.172.030.4 | cc/1973/348_347_349 | **2024-09-04** | **4** | 15 | ja | snapshot |

**Bewusst NICHT gebaut (Scope-Disziplin, §0-Mehrwert-Test / Finding 19 «auf 6–10 kürzen»):**

| Kandidat | SR | Grund |
|-----|-----|-----|
| ESÜ (Europ. Sorgerechtsübk.) | 0.211.230.01 | Grösstenteils durch HKsÜ 96 / Brüssel-Regime überholt → geringer Grenznutzen. |
| WÜD / WÜK (Wiener Übk. dipl./kons. Beziehungen) | 0.191.01 / 0.191.02 | Staatenimmunität = Nische für das allgemeine Kanzlei-Taschenmesser; später nachrüstbar. |
| DBA-DE (Doppelbesteuerung DE) | 0.672.913.62 | Höchstes Struktur-Risiko (10 Anhänge/Protokolle) UND Scope-Creep-Risiko über ~100 DBA — gehört in ein kohärentes eigenes DBA-Paket, nicht opportunistisch einzeln. |
| EPÜ 2000 (Europ. Patentübk.) | 0.232.142.2 | Fedlex liefert **keine** extrahierbare Fassung UND **kein** PDF/A (nur ~9 KB SPA-Shell) → nur `nur-live-link` möglich = unter «gleiche Qualität»-Schwelle, kein In-App-Mehrwert. |

## 4. Regel / Geltungsbereich / Besonderheiten

- **HUVUE (SR 0.211.213.02)** ist das **Haager Übereinkommen VOM 2. Oktober 1973** über Anerkennung/Vollstreckung von Unterhaltsentscheidungen (nicht das 2007er — der Auftrags-Startlisten-Label war ungenau; §7-Abweichung offengelegt, Titel gemäss amtlichem H1 gesetzt).
- **Schlussformel / Testimonium** («Zu Urkund dessen haben die … Bevollmächtigten dieses Übereinkommen unterschrieben», `<p class="schlussint">`) ist **nicht-normative Unterzeichnungs-Boilerplate** ohne `art_`-Anker → bewusst in `check:p-klassen` `BEWUSST_IGNORIERT` dokumentiert (kein neues Format, Paket-4-Vorgabe; über den Live-Link zur amtlichen Fassung einsehbar).
### 4a. Bekannte korpusweite Grenze — Geltungsbereich (`scope_*`) + Schweizer Vorbehalte/Erklärungen (`decl_*`) (NICHT stumm, L0)

**Befund der adversarialen Gegenprüfung (10.7.2026, unabhängiger Opus):** Der bestehende
Fedlex-Extraktor (`scripts/normtext/extrahiere-fedlex.ts`, `alleArtikelTokens` +
`alleAnhangAnker` + `alleSchlussteilAnker`) erfasst den **`<div id="annex">`-Anhang** (Protokolle,
Muster-Formulare — via `annex_*`), aber **nicht** die separaten `<div id="scope">`-Sektionen:
- **`scope_u1` «Geltungsbereich am …»** (Vertragsstaaten · Ratifikation/Beitritt/Nachfolge · Inkrafttreten je Partei) — in allen 9 vorhanden;
- **`decl_u2`/`decl_u3` «Vorbehalte und Erklärungen (Schweiz)»** — in HKsÜ 96, EAUe, Apostille (für die CH normativ).

**Das ist eine PRE-EXISTING, KORPUSWEITE Extraktor-Eigenschaft, kein Paket-4-Regress:** die
**18 bereits deployten** Staatsverträge (CISG, GFK, KRK inkl. dessen Schweizer Vorbehalten,
Staatenlose …) droppen `scope_*`/`decl_*` **byte-identisch** (empirisch verifiziert: KRK-
Snapshot auf `main` enthält weder «Vorbehalte und Erklärungen» noch «Geltungsbereich am»). Meine
9 Verträge sind mit dem **akzeptierten, deployten Korpus-Standard konsistent**.

**Warum hier nicht gefixt:** Die Erfassung verlangt eine Änderung am **Kern-Extraktor
`scripts/normtext/extrahiere-fedlex.ts`** (neuer `<div id="scope">`-Scanner analog `alleAnhangAnker`),
die auf **alle 27** Verträge durchschlägt (je eigener Golden-Diff + eigene Gegenprüfung) — eine
eigene normtext-Bau-Einheit, **ausserhalb Paket 4** (und der Extraktor steht diese Session
unter Änderungs-Sperre). **Nicht stumm (L0/§8):** die vollständige geltende Fassung inkl.
Geltungsbereich UND Schweizer Vorbehalten ist über den in der UI sichtbaren **amtlichen
Live-Link (§7c)** ein Klick entfernt; der Snapshot ist nie die massgebliche Fassung.

**Backlog (angedockt):** korpusweiter Extraktor-Ausbau «Geltungsbereich `scope_*` + Vorbehalte
`decl_*` je Staatsvertrag erfassen» → `FAHRPLAN-INTERNATIONAL-VOLLTEXT.md` (Abschnitt «OFFEN —
Extraktor-Ausbau Geltungsbereich/Vorbehalte»).

- **Anhänge/Protokolle** (`annex_*`, z. B. CMR Unterzeichnungsprotokoll, Apostille Muster-Formular inkl. mehrspaltiger Tabelle) werden vollständig erfasst (L0 für den Anhang-Teil erfüllt).

## 5. Pflegebedarf (datierte Parameter → Verfallsregister)

- Currency je Pin: `check:fedlex-versionen` (Cron-Arbiter). Künftige Konsolidierungen landen automatisch im `parameter-verfall.md`-AUTO-Block (`gen:fedlex-wiedervorlage`); die 9 tragen den «geltend geprüft am …»-Chip (`currency.json`).
- **Rest-Lücke (ehrlich, §8):** Beitritts-/Ratifikations-Updates ohne neue Konsolidierung (Geltungsbereich-Stand) spiegelt Fedlex teils verzögert; massgeblich bleibt der amtliche Live-Link.

## 6. Abnahme-Status

- **Erstrecherche + zweifache Verifikation:** POC-Messung (Bau-Session) + unabhängige adversariale Gegenprüfung (Opus, frischer Kontext, gegen Fedlex-Filestore-HTML) — Tor `check:gegenpruefung`.
- **Fachliche Abnahme durch David: ausstehend** (Zeitsperre bis 1.12.2026). Kein `verified: true` gesetzt.
