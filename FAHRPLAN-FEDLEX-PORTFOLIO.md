# FAHRPLAN-FEDLEX-PORTFOLIO — Nützliche Fedlex-Datenarten für LexMetrik

> **Rolle dieses Dokuments:** Detailquelle (§14) zu den ROADMAP-Schritten, die am Ende je Paket benannt sind. **Kein** zweiter Einstieg. **Fable plant, Opus baut** — jedes Paket ist Risiko-Pfad (Extraktion/Norm) → `check:gegenpruefung` Pflicht (§14 DoD), §7-Verifikation, §9-Deploy nur mit Davids Ja.
> **Quellen-Hygiene (für ALLE Pakete):** ausschliesslich die amtliche Fedlex-Stelle — SPARQL `https://fedlex.data.admin.ch/sparqlendpoint` (POST, `Accept: application/sparql-results+json`, `curl --data-urlencode`) + Filestore-HTML. **Nie** das Dritt-Repo `droid-f/fedlex` (CC BY-NC-SA, kommerziell verboten). Kein fremdes Byte fliesst ins Produkt.
>
> Status: Plan (2.7.2026), noch kein Code. §14-Intake (ROADMAP-Verlinkung) erfolgt erst mit Davids Freigabe je Paket.

---

## 0. Portfolio-Überblick

Fedlex ist die **Gesetzgebungs-Datenbank** des Bundes (Erlasse, Materialien, Verfahren, Staatsverträge) — **nicht** Rechtsprechung. Sechs Datenarten sind für LexMetrik verwertbar; fünf davon bauen, eine ist bewusst ausserhalb des Scopes.

| # | Paket | Wert | Machbarkeit (heute) | Aufwand | Priorität |
|---|-------|------|---------------------|---------|-----------|
| **1** | **Gesetze-Currency & Coverage** (20 stale aktualisieren + Monitoring-Lücke schliessen + 56 künftige als Wiedervorlage) | **Hoch** — Kernversprechen «immer geltende Fassung» (§7 Build-Regel 3); heute liefern wir 20 veraltete Erlasse aus | **Belegt** — Gap-Report fertig (`fedlex-gap-report-2026-07-02.md`); Pipeline (`normtext`/`fedlex-cache.sh`/`check:fedlex-versionen`) existiert | **M** (Datenlauf + kleiner Tor-Umbau) | **P0** |
| **2** | **Botschaften / Bundesblatt** (Entstehungsgeschichte je Gesetz) | **Hoch** — neue Klinge «amtliche Materialien», Burggraben Norm↔Gesetzesgeschichte; kein Wettbewerber verzahnt das | **Belegt** — SPARQL-Reverse-Kette getestet (AVIG→11, DSG→2); Materialien-Modell trägt es fast unverändert | **M–L** (neuer Datentyp + Pipeline + UI-Abschnitt) | **P1** |
| **5** | **Änderungshistorie / Amtliche Sammlung** (Revisions-Timeline je Gesetz: welche AS/RO-Erlasse haben es wann geändert) | **Hoch** — Schwester zu Paket 2; Botschaft = Genese-Absicht, AS-Erlass = die tatsächliche Änderung → zusammen volle Gesetzes-Geschichte | **Belegt** — live getestet (DSG 235.1): Pfad über `classifiedByTaxonomyEntry` + `dateEntryInForce` liefert Änderungs-Erlasse mit Datum, Titel, RO-Fundstelle, Botschafts-Verzahnung | **M–L** (teilt Paket-2-Pipeline) | **P1.5** |
| **3** | **Vernehmlassungen** (`eli/dl/proj`, ~2000) | **Mittel** — «was kommt»-Vorschau, ergänzt Gesetzgebungs-Tracking (W3·11) | **Teilweise offen** — Projekt-Graph-Andockung plausibel (gleiche `?proj`), aber **nicht** end-to-end getestet; POC nötig | **L** (nach Botschaften-Pipeline günstiger) | **P2** |
| **4** | **Staatsverträge** (`eli/treaty`, ~18 500) | **Mittel-niedrig** — punktuelle Lücken der International-Rubrik (wir haben 18 Volltext + 2 PDF) | **Teilweise offen** — `eli/treaty` ≠ `eli/cc`-Markup; kuratierte Auswahl statt Masse; POC je Kandidat | **S–M** (kuratiert, kein Bulk) | **P3** |
| **6** | **Rechtsprechung** | — | **Nicht in Fedlex** | — | **Out of scope** (OpenCaseLaw/bger, W2·6) |

**Empfohlene Reihenfolge (Wert × Machbarkeit × Aufwand): 1 → 2 → 5 → 3 → 4.** Paket 1 heilt einen **aktiven Treuedefekt** (wir liefern Veraltetes) bei belegter Pipeline und geringstem Aufwand → zuerst. Paket 2 ist das Vorzeige-Paket mit belegter Machbarkeit und hohem Neuwert → als Nächstes. Paket 5 folgt **unmittelbar auf 2** (erbt dessen Pipeline, Currency-Daten liegen schon vor, komplettiert die volle Gesetzes-Geschichte). Paket 3 erbt ebenfalls die Graph-Pipeline, Machbarkeit erst per POC → vierte Stelle. Paket 4 ist kuratierte Feinarbeit mit dem geringsten Grenznutzen → zuletzt.

---

## Paket 1 — Gesetze-Currency & Coverage (P0)

**Ziel:** Kein Erlass wird veraltet ausgeliefert, und keine Currency-Lücke bleibt strukturell unsichtbar. **Nicht-Ziel:** neue Erlasse aufnehmen (Coverage ist laut Report vollständig — 218/229 Volltext, 11 bewusste Stubs).

**Grundlage:** `bibliothek/register/fedlex-gap-report-2026-07-02.md` (bereits erhoben). Drei Befund-Klassen → drei Arbeitsschritte:

### P1-a · Die 20 stale Erlasse aktualisieren (Datenlauf)
- **14 gepinnt-überholt** (RPG, SVG, VRV, SSV, VTS, KVG, KVV, KLV, BPV, RPV, VIL, FDV, MepV, ICAO-Übk. 0.748.0): in `scripts/fedlex-cache.sh` den Konsolidierungs-Stand auf die geltende Fassung (meist `20260701`) neu pinnen, **Anker/Wortlaute neu verifizieren** (§7), dann `npm run normtext -- --datum=$(date +%F)` regenerieren.
- **6 blinde Flecken** (AsylV 1/2/3 = SR 142.311/312/314, ArGV 2 = 822.112, EMRK 0.101, NYÜ 0.277.12): dieselbe Aktualisierung; die 2 PDF-Embeds (EMRK/NYÜ) über `scripts/normtext/pdf-fetch.ts` (neuer `kons`-Wert in `src/lib/normtext/pdf-embed.ts` → `PDF_EMBED_QUELLEN`).
- **Vor** jeder Re-Extraktion: Artikel-Diff («neuere Fassung» ≠ «für uns relevante Artikel geändert»). Golden byte-gleich für unveränderte Teile; verhaltensändernde Text-Änderung ist erwartet und wird als solche gegated.

### P1-b · Monitoring-Lücke schliessen (Tor-Härtung — der eigentliche Hebel)
Der Cron `check:fedlex-versionen` sieht **nur gepinnte** ELIs (`scripts/fedlex-pins.ts` parst `fedlex-cache.sh`). **11 Volltexte ohne Pin** (AsylV 1/2/3, CO2-Gesetz, BVV 2, ArGV 1–5) sind strukturell unsichtbar.
- **Fix:** alle 11 in `fedlex-cache.sh` pinnen (Format `name|eli|YYYYMMDD|html-N|anker|sr`).
- **Zusätzliche Absicherung (empfohlen):** eine **Coverage-Assertion** im Tor — «jeder `snapshot`-Bund-Erlass mit ELI-`quelleUrl` hat einen Pin». So kann künftig kein Volltext ohne Pin durchrutschen. Das ist der dauerhafte Wächter, nicht der Einmal-Lauf.

### P1-c · 56 künftige Fassungen als Wiedervorlage (Verfallsregister)
Fedlex hat 56 future-dated Konsolidierungen im Triplestore (z. B. OR ab 2026-10-01, StGB ab 2026-10-01) — **kein Fehler, sondern Re-Extraktions-Horizont**.
- **Fix:** je Erlass das nächste In-Kraft-Datum > heute als **Verfallsregister-Eintrag** (§11 Pflegebedarf) andocken an das bestehende Drift-/Verfall-System (`scripts/verfall-*.ts`, `check:verfall`). Mehrwert = datierte Wiedervorlage statt flüchtiger Warnung.

**Betroffene Dateien:** `scripts/fedlex-cache.sh` · `scripts/fedlex-pins.ts` · `scripts/fedlex-versionen-pruefen.ts` · `src/lib/normtext/pdf-embed.ts` · `scripts/normtext/pdf-fetch.ts` · `public/normtext/bund/*.json` (regeneriert) · `public/normtext/register.json` (regeneriert) · Verfallsregister.

**Tore:** bestehend `check:normtext`, `check:normtext-netz`, `check:fedlex-versionen`, `check:tabellen`, `check:invarianten`, `golden:vergleich`; **neu** die Coverage-Assertion. **Gegenprüfung (Risiko-Pfad):** adversarialer Zweitpass je re-extrahiertem Erlass gegen die Filestore-HTML-Quelle — die teuersten Bugs (Tabellen-Drop, Footnote-Leak, `bis`/`ter`-Verlust) sassen real hier.

**Aufwand grob:** P1-a ~1 Datenlauf-Session (Artikel-Diff je Erlass = Zeitfresser) · P1-b ~0,5 Session · P1-c ~0,5 Session. **Gesamt M.**

**§14-Intake:** neuer Querschnitt **`QS-CURRENCY`** im Querschnitt-Band der `ROADMAP.md` (begleitende Korpus-Pflege). Kein 26×-Bezug. **Trailer:** `Roadmap: QS-CURRENCY` + `Gegenpruefung: …`.

---

## Paket 2 — Botschaften / Bundesblatt (P1, Vorzeige-Paket)

### Ziel & Nicht-Ziel
**Ziel:** Auf jeder Bund-Gesetzesseite ein Abschnitt **«Entstehungsgeschichte»** mit den zugehörigen Botschaften des Bundesrats — Datum, Titel, Fedlex-Volltext-Link, Parlaments-/Curia-Nummer (→ parlament.ch). Kernwert = **automatische Verknüpfung Gesetz→Botschaft** über den Gesetzgebungs-Projekt-Graphen (kein Anbieter verzahnt Norm + Gesetzesgeschichte + Rechner an einer Stelle).

**Nicht-Ziel (P1):** kein eigener Text-Snapshot (Live-Link genügt); keine Botschaften zu Gesetzen ohne eigenen Volltext; keine Pre-2000-Botschaften (gescannte PDFs ohne Projekt-Link); keine Ratsdebatten (nur Deep-Link).

### P1-Umfang (scharf)
Nur Botschaften zu den **Bund-Erlassen mit Volltext-Snapshot** (`register.json`, `ebene==bund`, `status=='snapshot'` — 218 Erlasse, alle mit `sr`). Status **`nur-live-link`** (kein gehosteter Inhalt → kein §7-Extraktionsrisiko, keine Davids-Fachzeit → zeitsperre-konform). `normKeys` **automatisch** aus dem Taxonomie-Join.

### Phasen
- **P1 — Live-Link + Auto-Verknüpfung** (dieser Umfang): Pipeline + Register-Erweiterung + «Entstehungsgeschichte»-Abschnitt.
- **P2 (optional, später)** — Volltext-Snapshot einzelner Schlüssel-Botschaften: nur mit voller §7-Zitat-Ausnahme (a–d). Botschafts-HTML nutzt **dieselben CSS-Klassen** wie Fedlex-Gesetze → `scripts/normtext/extrahiere-fedlex.ts` wiederverwendbar. Braucht Davids Abnahme → **[D]**, geparkt bis nach 1.12.2026.
- **P3 (optional)** — UI-Ausbau: Filter nach Botschaftstyp, Curia-Verlauf, Zeitstrahl.

### Datenpipeline (konkret)
**Neues Skript:** `scripts/materialien/botschaften-generieren.ts` (Muster: `scripts/normtext/bund-stubs-generieren.ts`). Ausgabe: `src/lib/materialien/botschaften.generated.ts` (analog `bund-stubs.generated.ts`), gemerged ins `MATERIAL_REGISTER`. Nie von Hand editieren.

**Idempotenter Ablauf** `fetch → store-raw → parse → load`:
1. **Reverse-Query je Volltext-SR** (getestet):
   ```
   ?tax skos:notation "235.1"^^<.../notation-type/id-systematique>   # SR → Taxonomie (TYPISIERT! sonst Timeout)
   ?oc  jolux:classifiedByTaxonomyEntry ?tax ; jolux:legalResourceFamilyType <.../resource-family/oc>
   ?proj jolux:hasResultingLegalResource ?oc
   ?event jolux:legislativeTaskHasResultingLegalResource ?botschaft
   FILTER(STRSTARTS(STR(?event), STR(?proj)))
   ?botschaft jolux:typeDocument <.../resource-type/23>              # "Botschaft des Bundesrates"
   ```
   Kette geht **zwingend über `eli/oc`** (nicht `eli/cc`); `impactFromLegalResource` war Sackgasse. Batchen wie `fedlex-versionen-pruefen.ts` (VALUES-Liste), `--datum` aus Shell (§2, kein `Date.now`).
2. **Je Botschaft:** Datum, Titel, Curia-/Geschäftsnummer, Datei-URL via `jolux:isExemplifiedBy` (PDF/HTML/XML/DOCX; DE/FR/IT). Für P1 die HTML- oder PDF-Fedlex-URL als `quelleUrl`.
3. **store-raw:** SPARQL-Rohantwort je SR nach `bibliothek/materialien/botschaften-raw/<SR>.json` (Reproduzierbarkeit §11).
4. **load:** generierte Einträge deterministisch in `botschaften.generated.ts`.

**Feld-Mapping auf `MaterialRegistereintrag`:**
- `key` — stabil + URL-sicher, z. B. `BOTSCHAFT-DSG-17059` (Fallback ohne Curia: Datum). Muss `KEY_UNSICHER`-Regex bestehen.
- `behoerde` — **neuer `BehoerdeId` `'BR'`** (Bundesrat) in `typen.ts` + `BEHOERDEN` in `register.ts`.
- `doktyp` — **neuer `DoktypId` `'botschaft'`** (label «Botschaft») in `typen.ts` + `DOKTYPEN`.
- `titel` — amtlicher Botschafts-Titel aus SPARQL.
- `nummer` — Curia-/Geschäftsnummer (z. B. «17.059»); `null` wenn keine.
- `rechtsgebiet` — **geerbt vom verknüpften Erlass** (`ERLASS_REGISTER[normKey].rechtsgebiet`), nicht geraten (§2).
- `sprache` — `'de'`; FR/IT im `hinweis`.
- `status` — `'nur-live-link'` (P1-Zwang).
- `quelleUrl` — Fedlex-Botschafts-URL (HTML/PDF); Pflicht http(s), §7c.
- `stand` — Botschafts-Datum (ISO); Tor prüft «nicht in Zukunft».
- `rang` — Datum absteigend → jüngste Botschaft zuerst.
- `normKeys` — **automatisch** = Erlass-Keys, deren SR-Join diese Botschaft ergab (Mantelerlasse unter **jedem** betroffenen SR — Feature).
- `hinweis` — Provenienz/Ehrlichkeit («Automatisch über den Fedlex-Projekt-Graphen zugeordnet; maschinell, fachlich nicht geprüft.»).
- `sha` — `shaEintrag()`-Muster über die Identitätsfelder inkl. `normKeys` = Drift-/Currency-Token.

**`-N.pdf`-Mehrteiler:** für P1 (Live-Link) HTML-Fassung oder Sammel-PDF als `quelleUrl`, Mehrteiligkeit im `hinweis`.

### Betroffene Dateien
- **neu:** `scripts/materialien/botschaften-generieren.ts` · `src/lib/materialien/botschaften.generated.ts` · `bibliothek/materialien/botschaften-raw/*.json` · `bibliothek/materialien/botschaften-<datum>.md` (§11 + INDEX).
- **erweitert:** `src/lib/materialien/typen.ts` · `src/lib/materialien/register.ts` · `package.json` (Script `materialien:botschaften`) · `public/materialien/register.json` (regeneriert).
- **UI:** «Entstehungsgeschichte»-Abschnitt.

### UI / Design (§13)
**Andockpunkt:** `src/pages/gesetz-leser/inhalt.tsx` rendert bereits `<KontextPanel typ="norm" …/>` am Leseende (Z. 706/1041). **Empfohlen (A):** eigener Abschnitt **«Entstehungsgeschichte»** neben dem KontextPanel — semantisch getrennt von «Materialien, die auslegen» (Botschaften = Genese, nicht Auslegung); Auflösung `botschaftenFuerNorm(key)` (Filter `doktyp==='botschaft'`), Reihenfolge Datum absteigend. Alternative (B): weitere Gruppe im `KontextPanel` (billiger, aber vermischt Genese/Auslegung). Tokens statt Magic-Numbers (§13.1), Lesespalte `max-w-reading` (§13.2), Status-Marker «maschinell zugeordnet / amtliche Quelle massgeblich» (§8). DE-Link in P1; FR/IT im Hinweis.

### Verifikations-Tore & Gegenprüfung
- **Bestehend:** `check:materialien` prüft mit — key-Eindeutigkeit/URL-Sicherheit, `quelleUrl` http(s), `stand` ISO & nicht-zukünftig, `normKeys` ⊆ `ERLASS_REGISTER`, committetes `register.json` == frischer Build, P1-Status-Zwang.
- **Neu:** Botschaften-Netz-Tor (Reverse-Join-Drift, analog `check:fedlex-versionen`); Test für `botschaftenFuerNorm` (nur `botschaft`, Datum-absteigend). Ggf. Gegenprüfungs-Globs (`scripts/gegenpruefung/kern.ts`) um `scripts/materialien/**` + `public/materialien/*.json` erweitern.
- **Adversariale Gegenprüfung (Pflicht, §14/QS-GP):** unabhängiger Opus-Agent, Auftrag **widerlegen** — (a) gehört die Botschaft wirklich zum Gesetz? (Stichprobe ≥15 stratifiziert, gegen fedlex.admin.ch/parlament.ch); (b) falsch-positive Sammelerlasse; (c) Vollständigkeit an Referenzfällen (AVIG→11 1999–2023, DSG→17.059+2003); (d) Pre-2000-Ehrlichkeit (kein stummes «keine»). Dann `npm run gegenpruefung:ok`.

### Grenzen (ehrlich)
Automatische Zuordnung nur **~2000+**; ~6800 Botschaften total (P1 nur die zu 218 Volltext-Erlassen); frische Erlasse evtl. noch ohne Verknüpfung (Hinweis, nicht «keine»); Sammelerlasse unter jedem betroffenen SR (kennzeichnen).

**Aufwand grob:** Pipeline+Generator ~1 Session · Register/Typen + UI ~1 Session · Gegenprüfung + Tore ~0,5 Session. **Gesamt M–L.**

**§14-Intake:** ROADMAP-Schritt **W2·6** («Konsultieren-Klingen»), Unterpunkt «Entstehungsgeschichte / Botschaften», Detailquelle = dieser FAHRPLAN (bzw. ausgekoppelt `FAHRPLAN-MATERIALIEN-BOTSCHAFTEN.md`, verlinkt aus W2·6, damit **QS-PH** nicht rot). Kein 26×, kein Worktree. **Trailer:** `Roadmap: W2·6` + `Gegenpruefung: …`.

---

## Paket 5 — Änderungshistorie / Amtliche Sammlung (P1.5)

**Ziel:** Auf der Gesetzesseite ein Abschnitt **«Änderungen / Revisionen»** — welche Änderungserlasse (AS/RO, `eli/oc`) haben dieses Gesetz wann geändert, mit In-Kraft-Datum, Titel, RO-Fundstelle und Link zum AS-Text. Das ist die **Schwester zur «Entstehungsgeschichte» (Paket 2)**: Botschaft = Genese-*Absicht*, AS-Erlass = die *tatsächliche* Änderung; zusammen = die volle Gesetzes-Geschichte an einer Stelle (Burggraben). **Nicht-Ziel (P1):** kein Volltext-Snapshot des Änderungserlasses (Live-Link auf den AS-Text genügt); keine Artikel-für-Artikel-Diff-Darstellung (das ist der intertemporale Fassungsvergleich, W3·10 «Normfassungs-/Geltungsstand-Prüfer», separat).

### Machbarkeit — belegt (live getestet an DSG SR 235.1)

Zwei Kandidatenpfade geprüft; **Pfad (b) ist der verlässliche, dublettenfreie Lieferant** der «wann wurde was geändert»-Liste:

- **Pfad (a) — Konsolidierungs-Versionen:** `?cons jolux:isMemberOf <abstract> ; jolux:dateApplicability ?date`. Gibt die vollständige Liste der *Geltungsstände* (DSG-Alt-Abstract: 14 Daten 1993–2019). **ABER:** die `Consolidation` trägt **keinen** Link auf den auslösenden Erlass (kein `generationCause`/Trigger-Edge — live verifiziert) → kein Titel, keine AS-Fundstelle. Zudem ist sie **an einen Abstract gebunden**: die Totalrevision DSG 2020 erzeugt einen **neuen** Abstract (`cc/2022/491`) → Pfad (a) sieht die Historie über die Totalrevision hinweg **nicht** zusammenhängend. **= identisch mit den Daten, die der Gap-Report §3 schon hat** (Currency), nicht mehr.

- **Pfad (b) — Erlasse über die SR-Taxonomie (empfohlen):**
  ```sparql
  PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>
  PREFIX skos:  <http://www.w3.org/2004/02/skos/core#>
  SELECT ?oc ?dateForce ?dateDoc ?roId ?botschaftDate (SAMPLE(?t) AS ?titel) WHERE {
    ?tax skos:notation "235.1"^^<https://fedlex.data.admin.ch/vocabulary/notation-type/id-systematique> .
    ?oc jolux:classifiedByTaxonomyEntry ?tax ;
        jolux:legalResourceFamilyType <https://fedlex.data.admin.ch/vocabulary/resource-family/oc> ;
        jolux:dateEntryInForce ?dateForce .
    OPTIONAL { ?oc jolux:dateDocument   ?dateDoc . }
    OPTIONAL { ?oc jolux:historicalId   ?roId . }         # "RO 2019 625" = AS-Fundstelle
    OPTIONAL { ?oc jolux:botschaftDate  ?botschaftDate . } # Verzahnung → Paket 2
    OPTIONAL { ?oc jolux:isRealizedBy ?e . ?e jolux:title ?t . }
  }
  GROUP BY ?oc ?dateForce ?dateDoc ?roId ?botschaftDate
  ORDER BY DESC(?dateForce)
  ```
  Getestet: DSG → die Änderungs-**Erlasse** mit `dateEntryInForce` (1993-07-01 … 2025-07-07), jeder mit `dateDocument` (Erlass-Datum), **`historicalId` = RO-Fundstelle** (z. B. «RO 2019 625»), **`botschaftDate`** (Botschafts-Datum → direkte Verzahnung zu Paket 2) und `eli/oc`-Link zum AS-Text. **Spannt die Totalrevision** (Alt-DSG `oc/1993/1945` + Neu-DSG `oc/2022/491` liegen beide unter Taxonomie `5993`). Dubletten (die `cc`-Abstracts selbst) werden per `legalResourceFamilyType = …/resource-family/oc` **herausgefiltert**; Sprach-Realisierungen kollabieren über `GROUP BY ?oc`.

**Ehrliche Grenze (Vollständigkeit):** Pfad (b) listet nur Erlasse, die **primär** unter dieser SR klassifiziert sind. Änderungen, die über **Mantel-/Sammelerlasse anderer SR** eingebracht wurden, tauchen bei (b) **nicht** auf (sie erzeugen einen Geltungsstand, den nur Pfad (a) als Datum sieht) — es gibt **keine** saubere «amends»-Kante in den Abstract (live geprüft: reverse-Edges sind nur `isMemberOf`/`foreseenImpactToLegalResource(2)`/`subdivisionIsPartOf`, kein vollständiger Änderungs-Graph). **Umgang:** Pfad (b) ist die Timeline; **Cross-Check gegen Pfad (a)** (dessen Konsolidierungs-Daten der Gap-Report bereits hat): wo (a) *mehr* Geltungsstände als (b) Erlasse zeigt, gab es eine Mantelerlass-Änderung → ehrlicher Marker «weitere Änderung über einen Sammelerlass — siehe amtliche Sammlung» statt stiller Lücke (§8).

**Historische Reichweite:** strukturierte Verknüpfung mit `botschaftDate`/`historicalId` verlässlich **ab ~2000** (digitale AS). Ältere Erlasse sind als `eli/oc` mit RO-Fundstelle vorhanden (DSG bis `oc/1993`), aber ohne durchgehende Botschafts-Verknüpfung; Konsolidierung reicht bis zur Erstpublikation (Alt-DSG 1993). Grenze im UI benennen.

### Abgrenzung / Verzahnung
- **vs. Paket 1 (Currency):** Paket 1 beantwortet «welche **eine** geltende Fassung liefern wir?» (Pfad-a-Daten, für die Extraktions-Aktualität). Paket 5 beantwortet «welche Änderungen gab es über die **Zeit**?» (Pfad-b-Erlasse, als Lese-Feature). Gleiche Rohdaten-Ecke, anderer Zweck — **kein Doppel-Build:** Paket 5 nutzt die Konsolidierungs-Daten aus dem Gap-Report für den Vollständigkeits-Cross-Check.
- **vs. Paket 2 (Botschaften):** komplementär. Jeder AS-Änderungseintrag **verlinkt seine Botschaft** über `botschaftDate` bzw. den gemeinsamen `?proj`-Knoten (gleiche Kette) → im Reader stehen «Entstehungsgeschichte» (Botschaften) und «Änderungen/Revisionen» (AS-Erlasse) nebeneinander, gegenseitig verlinkt.

### Datenmodell / UI — Empfehlung: erlass-eigene Revisions-Timeline (NICHT Materialien-Doktyp)

**Empfehlung:** eine **erlass-eigene «Änderungen / Revisionen»-Timeline** als Sidecar am Normtext, **nicht** ein Materialien-Doktyp. Begründung: (1) AS-Änderungserlasse sind **kein browsbares Standalone-Korpus** — niemand blättert «alle AS-Erlasse»; sie werden immer im Kontext *eines* Gesetzes gelesen. (2) Als Materialien-Einträge würden hunderte fast identischer AS-Zeilen die Materialien-Übersicht fluten. (3) Die Daten sind eine reine **Build-time-Projektion aus dem Graphen, keyed nach SR** → am besten als Sidecar `public/normtext/revisionen/<KEY>.json` (oder ein `revisionen-index.json`), lazy vom Reader geladen — analog zum Norm→Entscheid-Index. **Alternative (ehrlich):** will David die AS-Erlasse *auch* durchsuchbar/browsbar, ginge ein Materialien-`doktyp: 'as-erlass'` (wie Botschaften mit `BehoerdeId 'BR'`) — für P1 **nicht empfohlen** (Flut + kein Browse-Bedarf).

**UI:** Abschnitt «Änderungen / Revisionen» in `src/pages/gesetz-leser/inhalt.tsx`, direkt neben «Entstehungsgeschichte» (beide am Leseende, über/neben dem `KontextPanel`). Je Eintrag: In-Kraft-Datum · Titel · RO-Fundstelle · AS-Live-Link · «Botschaft ansehen»-Verweis (wenn vorhanden). **Reihenfolge: Datum absteigend.** Status-Marker (§8): «maschinell aus dem amtlichen Fedlex-Graphen; massgeblich bleibt die amtliche Sammlung» + Vollständigkeits-Hinweis bei Mantelerlass-Lücken. Sprachwahl DE/FR/IT über die `isRealizedBy`-Realisierungen.

### P1-Umfang
Für die **218 Bund-Volltext-Erlasse** (`register.json`, `ebene==bund`, `status=='snapshot'`) je eine Revisions-Timeline aus Pfad (b), Status = Live-Link (kein AS-Volltext-Snapshot). `botschaftKey` automatisch verknüpft, wo Paket 2 den Eintrag kennt.

### Betroffene Dateien
- **neu:** `scripts/normtext/revisionen-generieren.ts` (Muster: der Paket-2-Generator / `bund-stubs-generieren.ts`; SPARQL Pfad (b) je SR + Cross-Check gegen Pfad-a-Daten) · `public/normtext/revisionen/*.json` bzw. `revisionen-index.json` · `bibliothek/normtext/revisionen-raw/*.json` (store-raw, §11).
- **neu (Lese-Brücke):** `revisionenFuerNorm(key)` in `src/lib/normtext/werkzeuge.ts` (oder `revisionen.ts`), sortiert Datum absteigend, verknüpft Botschaft.
- **erweitert:** `src/pages/gesetz-leser/inhalt.tsx` (Abschnitt) · ggf. `src/lib/kontext.ts` (falls ins Kontext-Modell integriert) · `package.json` (Script `normtext:revisionen`).

### Tore & Gegenprüfung
- **Neu:** `check:revisionen` (offline) — committetes Sidecar == frischer Build (Determinismus §2), key-/Datums-/URL-Validität, `botschaftKey` verweist nur auf existierende Paket-2-Einträge (kein toter Cross-Link, §8); **Netz-Tor** (Drift): Pfad-b-Query stichprobenweise nachfahren + Vollständigkeits-Cross-Check gegen Pfad (a).
- **Gegenprüfung (Pflicht §14, Risiko-Pfad):** unabhängiger Opus-Zweitpass, Auftrag **widerlegen** — Stichproben: (a) gehört der AS-Erlass wirklich zu diesem Gesetz (gegen die amtliche AS-Seite / RO-Fundstelle)? (b) stimmt das In-Kraft-Datum mit der amtlichen Fassung? (c) sind Mantelerlass-Lücken korrekt als «weitere Änderung über Sammelerlass» markiert statt verschwiegen? (d) Referenzfall DSG: Timeline enthält Alt- **und** Neu-DSG über die Totalrevision hinweg. `npm run gegenpruefung:ok` erst nach bestandenem Pass. **Quelle immer die amtliche Fedlex-Stelle** (SPARQL + AS-Filestore); **nie** `droid-f/fedlex`.

### Aufwand grob
Generator (Pfad b + Cross-Check, Paket-2-Pipeline geerbt) ~1 Session · Sidecar-Store + Reader-Abschnitt + Botschafts-Verzahnung ~1 Session · Tore + Gegenprüfung ~0,5 Session. **Gesamt M–L**, deutlich günstiger **nach** Paket 2.

### §14-Intake
ROADMAP **W2·6** (Konsultieren-Klingen, Schwester zu W2·6-BOT), Detailquelle `FAHRPLAN-FEDLEX-PORTFOLIO.md`. Kein 26×-Bezug, kein Worktree.
`<!-- @meta id: W2·6-REV · status: ready · of: ja · blocker: null · dep: [W2·6-BOT] · kollision: [] · worktree: nein · 26x: nein · fahrplan: FAHRPLAN-FEDLEX-PORTFOLIO.md -->`
**Trailer:** `Roadmap: W2·6` + `Gegenpruefung: …`.

---

## Paket 3 — Vernehmlassungen (P2)

**Wert:** «was kommt»-Vorschau (Anhörungen vor dem Parlament) — komplettiert die Konsultieren-Klinge **W3·11** (Gesetzgebungs-Tracking).

**Machbarkeit (teilweise offen — ehrlich):** Vernehmlassungen liegen unter `eli/dl/proj` (~2000). Die Projekt-Graph-Verknüpfung zum Gesetz ist **plausibel dieselbe** wie bei Botschaften (der `?proj`-Knoten trägt beide als `legislativeTask`-Ereignisse), **aber nicht end-to-end getestet**. **Vor Bau:** POC (§7 Quell-Wahl) — SPARQL-Probe, ob ein Vernehmlassungs-`event` am selben `?proj` hängt und sich per SR rückwärts auflöst. Erst wenn belegt bauen, sonst als Grenze dokumentieren.

**P1-Umfang (falls POC grün):** Vernehmlassungen zu unseren Volltext-Erlassen als Materialien-Typ `doktyp: 'vernehmlassung'`, Status `nur-live-link`. **Erbt die Botschaften-Pipeline** (`botschaften-generieren.ts` → generischer `projekt-graph-generieren.ts` mit `typeDocument`-Parameter) → billiger nach Paket 2.

**Grenze:** laufende vs. abgeschlossene Verfahren — Currency-Frage (welche noch offen?) braucht Datum-Feld + Wiedervorlage, sonst Liste toter Alt-Anhörungen. Im POC mitprüfen.

**Aufwand grob:** POC ~0,5 Session; Bau (POC grün, Pipeline geerbt) ~1 Session. **Gesamt L.**

**§14-Intake:** ROADMAP-Schritt **W3·11**. **Trailer:** `Roadmap: W3·11` + `Gegenpruefung: …`.

---

## Paket 4 — Staatsverträge (P3)

**Wert:** punktuelle Ergänzung der International-Rubrik. **Ist-Stand:** bereits 20 SR-0.* (18 Volltext inkl. CISG/LugÜ/FZA/HKÜ/UNO-Pakte + 2 PDF-Embeds EMRK/NYÜ) + 8 EU-Verordnungen (EUR-Lex-Links). Grenznutzen weiterer Verträge **niedrig-mittel**.

**Machbarkeit (teilweise offen):** `eli/treaty` (~18 500) ist ein **anderer Namespace als `eli/cc`** mit potenziell anderem Markup. Ob `eli/treaty` dieselben `<article id="art_*">`-Strukturen liefert, ist **nicht verifiziert**. **Kein Bulk** — 18 500 Verträge sind zu 99 % kanzlei-irrelevant.

**P1-Umfang:** **kuratierte Auswahl** praxisrelevanter, heute fehlender Verträge (Kandidaten-Recherche nötig). Je Kandidat **POC-Fetch** (§7): extrahierbares HTML → `snapshot`; nur SPA-Shell → `pdf-embed` (wie EMRK/NYÜ); sonst `nur-live-link`. Andockpunkt `bund-stubs-generieren.ts` bzw. `pdf-embed.ts`.

**Abgrenzung:** Staatsverträge haben oft **keine artikelweise Konsolidierung**; Geltungsbereich/Vorbehalte je Vertragsstaat bildet die Norm-Snapshot-Struktur nicht ab — im Zweifel `pdf-embed` statt fehleranfälligem Struktur-Extrakt.

**Aufwand grob:** Recherche + POC ~0,5 Session; Bau je Handvoll ~0,5–1 Session. **Gesamt S–M.**

**§14-Intake:** ROADMAP-Schritt **W2·6**/**W3·13**, Detailquelle bestehende `FAHRPLAN-INTERNATIONAL-VOLLTEXT.md` (dort verlinken, kein neuer FAHRPLAN). **Trailer:** `Roadmap: W2·6` + `Gegenpruefung: …`.

---

## Paket 6 — Was Fedlex NICHT hergibt (ehrliche Abgrenzung)

**Rechtsprechung ist NICHT in Fedlex.** Fedlex = **nur Gesetzgebung** (Erlasse, Materialien, Verfahren, Staatsverträge). Bundesgerichts-/kantonale Entscheide kommen aus **OpenCaseLaw / bger.ch / entscheidsuche.ch** und sind bereits eigener Strang (ROADMAP **W2·6**, `FAHRPLAN-RECHTSPRECHUNG.md`, `FAHRPLAN-OPENCASELAW-QUELLEN.md`) — **hier ausserhalb des Scopes.** Ebenfalls nicht Fedlex: EU-Recht (EUR-Lex → `international-extern.ts`), kantonale Erlasse (LexWork/lexfind), Parlaments-Ratsdebatten (parlament.ch/Curia → nur Deep-Link).

---

## Priorisierte Gesamt-Reihenfolge

1. **Paket 1 — Currency/Coverage** `[P0, QS-CURRENCY]` — heilt aktiven Treuedefekt, Pipeline belegt, Aufwand M.
2. **Paket 2 — Botschaften** `[P1, W2·6]` — Vorzeige-Paket, Machbarkeit belegt, hoher Neuwert, Aufwand M–L.
3. **Paket 5 — Änderungshistorie / Amtliche Sammlung** `[P1.5, W2·6-REV]` — Schwester zu Paket 2, erbt dessen Pipeline, Machbarkeit belegt (DSG live), Aufwand M–L. Komplettiert mit Paket 2 die volle Gesetzes-Geschichte.
4. **Paket 3 — Vernehmlassungen** `[P2, W3·11]` — erbt Paket-2-Pipeline, Machbarkeit erst per POC, Aufwand L.
5. **Paket 4 — Staatsverträge** `[P3, W2·6/W3·13]` — kuratierte Feinarbeit, geringster Grenznutzen, Aufwand S–M.

**Querschnitt für alle:** amtliche Fedlex-Quelle only · Opus baut (Risiko-Pfad → `check:gegenpruefung` Pflicht) · §7-Verifikation · §9-Deploy nur mit Davids Ja · je Paket §14-Intake gesetzt.

---

## Offene Entscheidungen für David

1. **Live-Link vs. Snapshot (Botschaften).** Empfehlung: P1 **`nur-live-link`** (kein §7-Risiko, keine Fachzeit, zeitsperre-konform); Volltext-Snapshot erst P2 → **[D]** bis 1.12.2026.
2. **Nur vorhandene Gesetze vs. alle (Botschaften).** Empfehlung: P1-Grenze «nur die 218 Volltext-Erlasse» halten.
3. **Umgang mit Pre-2000.** Empfehlung: Lücke transparent als Hinweis ausweisen (nicht stumm weglassen).
4. **Behörden-Taxonomie für den Bundesrat.** Empfehlung: gleicher Namespace mit neuem Doktyp `botschaft` + eigener «Entstehungsgeschichte»-UI-Sektion (minimaler Umbau, klare Trennung).
5. **Currency-Coverage-Assertion (Paket 1).** Empfehlung: **hart** blockieren (Exit 1), wenn ein Volltext-Erlass keinen Pin hat — genau die Blindstelle, die den Report nötig machte.
