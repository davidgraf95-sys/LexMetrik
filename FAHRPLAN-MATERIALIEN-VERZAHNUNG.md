# FAHRPLAN-MATERIALIEN-VERZAHNUNG — E6a Stufe 1 vorgezogen

**Auftrag:** David 3.7.2026 — «Fundament, dass zukünftige Materialien direkt verlinkt sind: Wegleitungen
SECO für ArG, EDÖB für DSG, ESTV für MWSTG usw.» Vorgezogen VOR VPS.
**Stufe 1 = Verweis-/Register-Ebene:** pro Dokument eine Index-Karte (Nr./Titel/Datum/Behörde/PDF- bzw.
HTML-Live-Link, §7 a–d) + Norm-Mapping als Kanten am Norm-Artikel. **KEINE Volltext-Einbettung.**
**Rahmen:** CLAUDE.md §5 SSoT, §7 Zitat-Ausnahme a–d, §8 Ehrlichkeit, §15 Performance;
FAHRPLAN-DATENHALTUNG §3.1 `soft_law`/§3.2 `norm_referenzen`/§5 E6/Weiche C;
FAHRPLAN-VERZAHNUNG-UI §1.0 `VerzahnungsKante`, §V3.

---

## §0 · Kritik-Einarbeitungs-Tabelle

Zwei unabhängige Kritiken (A = 14 Befunde, B = 10 Befunde) gegen die Erst-Spec. Verdikte nach
Repo-Verifikation; jede Konsequenz nennt den Ziel-Abschnitt.

| # | Befund (kurz) | Verdikt | Konsequenz |
|---|---|---|---|
| A1 | Normrevisions-Problem ungelöst: kein Fassungs-Abgleich Dokument-Stand ↔ Ziel-Norm (revDSG 1.9.2023, MWSTG-Teilrev 1.1.2025, SECO-Stände 2012–2025); Drift-Tokens überwachen nur die Quelle, nie die Ziel-Norm | **berechtigt (Blocker)** | Neu §2.4 Revisions-Invariante: Cutoff-Tabelle je erlass_key, Downgrade artikelscharf→Erlass-Ebene, UI-Stand-Anzeige + Staleness-Hinweis, Wortlaut «verweist auf … (Stand des Dokuments: …)»; Tor-erzwungen (§4) |
| A2/B1 | DDL ungültig: `COALESCE(…)` im PRIMARY KEY wirft in SQLite/node:sqlite «expressions prohibited» — M0 scheitert am ersten CREATE | **berechtigt (Blocker)** | §2.1: `artikel`/`fundstelle` als `TEXT NOT NULL DEFAULT ''` (`'' = Erlass-Ebene`, dokumentiert), nackter UNIQUE-Key |
| A3 | Scheinautorität: ALLE Kanten als `herkunft='amtlich'` zementiert, obwohl Q4-Seiten-Fallback selbst «Heuristik» heisst und Q3 «kuratiert» ist — widerspricht VZUI-§1.0-Pflichtfeld | **berechtigt (Blocker)** | §2.1/§3: `quelle` je Kante ehrlich `'amtlich'\|'kuratiert'\|'maschinell'`; Invariante erweitert; UI nutzt bestehende Badge-Regel (zusammengeführt mit B7) |
| B2 | Append-only-Historie ohne committeten Träger: `daten/*.db` ist gitignored + wegwerfbar; «galt damals» und die Append-only-Invariante haben in CI/frischem Clone keine Baseline; echter Live-Rebuild kann Entlistetes prinzipiell nicht reproduzieren; volatile quell_ids in client-gefetchtem register.json = §15-Leak | **berechtigt (Blocker)** | Neu §2.3 committetes Zustands-Manifest (`bibliothek/register/soft-law-zustand.jsonl` — unter `daten/` unmöglich, da Parent gitignored); Weiche C präzisiert: Rebuild = deterministisch aus (Zustands-Manifest + Snapshot), nie Live-Quelle allein; register.json schlank (nur gelistete, ohne Interna); Snapshot-Beleg ehrlich reduziert auf «sha+Metadaten committet, Roh-Substrat lokal» |
| A4 | §7 a–d falsch gemappt: echte Buchstaben = Stand / Quelle-URL / **im UI sichtbarer Live-Link** / **automatische Drift-Erkennung**; «abgerufen» ist kein §7-Buchstabe, (c) wurde gar nicht geprüft; DB-Dokumente erscheinen schon ab M1 im Browse | **berechtigt** | §4 Tor auf echte a–d präzisiert; M1-DoD: Playwright-Beweis, dass die MaterialLeser-Karte für DB-Dokumente den sichtbaren Live-Link rendert |
| A5 | Entlistete Dokumente: Projektions-/UI-Verhalten undefiniert → tote amtliche Links bzw. Massen-Entlistung bei Crawl-Bruch | **berechtigt** | §2.5: entlistet ⇒ aus BEIDEN Projektionen raus; Entlistung nur bei grünen Count-Gates desselben Laufs; Quoten-Schwelle im Tor |
| A6 | Q1-Drift per «Publiziert am»-Stichprobe erkennt In-place-Änderungen nicht gesampelter Ziffern nicht; publicationId-Wechsel bei jeder Änderung unbewiesen | **berechtigt** | §3 Q1: Arbiter = Hash über komplettes ToC-XHTML inkl. aller cipherKeyDates je Publikation (1 GET/Publikation); Stichprobe nur Zweitsignal |
| A7 | Wortfeld-Tor-Löcher: `src/pages/MaterialLeser.tsx` nicht im Grep-Pfad; Grep über JSON trifft verbatim übernommene AMTLICHE Titel (falsch ROT bzw. Zwang zum Umschreiben amtlicher Titel) | **berechtigt** | §4: Pfade + `src/pages/Material*.tsx`; in JSON nur EIGENE Felder greppen, amtliche titel/beschreibung als Zitat-Felder ausgenommen |
| A8 | `drift_token NOT NULL DEFAULT ''` sabotiert das eigene Tor (leerer Default besteht die Prüfung) | **berechtigt** | §2.1: DEFAULT gestrichen; Tor prüft nicht-leer für stand/quelle_url/abgerufen/drift_token |
| A9 | Geister-Anker-Validierung undefiniert für Kanten auf AUFGEHOBENE Artikel (real existierende Kommentierungen) | **berechtigt** | §2.4: deterministischer Downgrade auf Erlass-Ebene + Protokoll-Log, nie stummer Drop, nie Tor-ROT |
| A10 | Q3-ID-Stabilität unbelegt: EDÖB hat keine Nummern-Systematik, Titel-Slug ⇒ Titelretusche = falsche Entlistung + Duplikat | **berechtigt** | §3 Q3: Slug-Normalisierung + Alias-Tabelle (alt→neu) im Adapter; Tor warnt bei Entlisten+Neuanlegen mit hoher Titel-Ähnlichkeit |
| A11/B10c | `fundstelle_url` mit volatiler publicationId ⇒ Link-Fäulnis zwischen Snapshots + kompletter Shard-Churn je ESTV-Neuversion | **berechtigt** | §2.1/§3 Q1: Basis-URL-Indirektion (Basis je Dokument in `quell_ids`, Kante trägt Suffix; Projektion setzt zusammen); Ziffer-Link-Stichprobe (url_effective/Soft-404) ins Netz-Tor |
| A12 | ROADMAP-`dep: []` unehrlich: M5 hängt hart am V1a-Merge, nur Fliesstext bildet das ab | **berechtigt** | @meta: `dep: [W2·7-VZUI (nur M5)]` |
| A13 | quell_snapshot-BLOBs = Repo-Bloat in der «git-getrackten» DB | **teilweise — Prämisse falsch:** `daten/*.db` ist gitignored (verifiziert .gitignore Z. 59), es gibt keinen git-Bloat | Grössen-Disziplin trotzdem übernommen (§2.2: nur extrahiertes Substrat, gzip, DB-Budget im Tor); Beleg-Frage löst B2 |
| A14 | M2-Vollständigkeits-Gate kippt in Dauerrot (Korpus führt Aufgehobene, SECO hat dafür kein PDF) oder stille Ignore-Liste | **berechtigt** | §3 Q2: Gate = Korpus-Bestand MINUS aufgehoben-markierte MINUS begründete Ausnahmeliste (Datum+Grund); neue unerklärte Lücke ⇒ ROT |
| B3 | Key-Kollisionen bei ALLEN 4 Quellen, nicht nur Q4 (verifiziert: `ESTV-MWST-INFO-09`, `SECO-WEGL-ARG-*`, `EDOEB-LEITFADEN-DATABREACH/-TOM/…` existieren); Spec-Beispiele schrieben die Dubletten selbst fest | **berechtigt** | §2.6: Abgleich-Tabelle + 1:1-Tor für alle vier Adapter; bestehender MATERIAL_REGISTER-Key gewinnt; Dubletten-Tor via quelle_url-/Nummern-Match |
| B4 | VBGÖ ist nicht im Korpus (kein VBGOE.json, kein ERLASS_REGISTER-Key — verifiziert) → reisst das spec-eigene Geister-Anker-Tor | **berechtigt** | §1: VBGÖ aus Stufe-1-Scope gestrichen; §2.4 Regel für nicht-korpusierte Erlasse (DB ja, Projektion nein) |
| B5 | 300-KB-Shard-Budget bricht sicher am ERSTEN Testfall MWSTG (10⁴+ Kanten × lange URLs ≈ MB); «Folge-Entscheid» ist keine Eventualität | **berechtigt** | §2.2: JETZT entschieden — Kanten je (Dokument, Artikel) aggregiert (Ziffern-Liste als Feld) + Basis-URL-Indirektion + Bucket-Split ab M0 gebaut; im M1-Aufwand eingepreist |
| B6 | M1–M4 sind Prod-sichtbare Content-Releases (register.json wird live von Suche+Browse gefetcht; Auto-Merge + main=Prod) und brauchen `src/lib/materialien/{typen,register}.ts` (DoktypId/Labels); nicht registrierte Behörde/Doktyp verschwindet still aus Browse | **berechtigt** | §6: je Adapter-Etappe als Content-Release benannt (Lesbarkeits-/Perf-Stichprobe in DoD); @meta-Kollisionsliste ergänzt; §4 Tor «jedes DB-Dokument hat registrierte Behörde+Doktyp» |
| B7 | norm_referenzen weicht vom ENTSCHIEDENEN §3.2-Schema ab (zitat_key/roh_zitat/konfidenz/quelle fehlen) — bricht den Nordstern «EIN Query über alle Doktypen» | **berechtigt** | §2.1: §3.2-Spalten vollständig übernommen; `quelle`-Enum bewusst um `'amtlich'` erweitert (Nachtrag in FAHRPLAN-DATENHALTUNG §3.2 = M0-Posten); stand/abgerufen/fundstelle_url als additive Spalten |
| B8 | robots.txt `Disallow: /` auf www.gate.estv…: Vollcrawl + wiederkehrende Drift-Läufe sind ein Governance-Entscheid, kein «offener Punkt: keiner»; `check:netz` wird von keinem Workflow aufgerufen (normen-monitor.yml ruft Netz-Checks einzeln); Crawl dauert bei Concurrency 1–2 Stunden | **berechtigt** | §8: robots-Freigabe Q1 = expliziter David-Entscheid, M1 daran gated; §4: `check:materialien-netz` als eigener normen-monitor.yml-Step (M1-DoD); Crawl-Dauer in §6 ausgewiesen |
| B9 | Aufwand 5–7 Tage optimistisch: check-materialien.ts ist Hard-Assert `Manifest == MATERIAL_REGISTER` → Neubau, nicht «Erweiterung»; gegenpruefung-Läufe je Etappe; Shard-Split + Crawl-Dauer obendrauf | **berechtigt** | §6: M0 1½–2 T, M1 2–3 T, Summe ehrlich **7–10 Tage** |
| B10a | gen:zaehler zählt Materialien heute gar nicht — Pflicht wirkungslos | **berechtigt** | §4/§5: Pflicht-Lauf bleibt (billig, no-op ist harmlos); Zähler-Erweiterung um Materialien = expliziter M5-Posten, wenn die UI sie zeigt |
| B10b | `StatusBadge 'nur-verweis'` ist in V1a NICHT gebaut (VZUI: erst V3) — M5 baut die Variante selbst | **berechtigt** | §5.3: M5 baut die Variante (bewusster V3-Vorzug); eine Nachtragszeile in FAHRPLAN-VERZAHNUNG-UI §V3 = M5-Posten |
| B10d | Sequenz-Gate V1a verifiziert korrekt; `src/lib/kontext.ts` dort ebenfalls Sperrfläche («nur M5» im @meta korrekt) | **bestätigt** | kein Fix nötig |

---

## §1 · Scope-Entscheid

Aufnahme-Kriterium: Davids Beispiele haben Vorrang UND nur, was ein Live-POC als machbar bewies
(alle 4 POCs vom 3.7.2026: machbar).

| # | Quelle | Erlasse | Kanten-Granularität (ehrlich) | `quelle` je Kante |
|---|--------|---------|-------------------------------|-------------------|
| Q1 | **ESTV MWST-Webpublikationen** (`www.gate.estv.admin.ch/mwst-webpublikationen/`) | MWSTG, MWSTV | **Artikelscharf** — Fedlex-`#art_N`-Anker serverseitig in jeder Ziffer-Seite; Kante = Dokument+Ziffer→Artikel | `amtlich` (serverseitiger Anker) |
| Q2 | **SECO Wegleitung ArG/ArGV** (`seco.admin.ch/de/arbeitsgesetz`, `/de/wegleitung-argv-1`; ArGV 2–5 gleicher Parser) | ArG, ArGV 1 (ArGV 2–5 im selben Adapter, sobald Payload-Probe grün) | **Artikelscharf** — 1 PDF = 1 Artikel, Nummer deterministisch aus Nuxt-Payload/Dateiname | `amtlich` (amtliche Dateinamen-Systematik) |
| Q3 | **EDÖB Leitfäden/Merkblätter** (`edoeb.admin.ch/de/dokumentation-datenschutz`, `…-bgoe`, nur Sektion «Leitfäden und Merkblätter») | DSG, DSV, BGÖ (**VBGÖ gestrichen — nicht im Korpus, §0/B4**) | **Erlass-Ebene** + artikelscharf NUR wo der amtliche Titel den Artikel nennt; PDF-Volltext-Regex-Kanten = Stufe 2 | `kuratiert` (Erlass-Zuordnung); `amtlich` (Artikel aus amtlichem Titel) |
| Q4 | **ESTV KS/RS DBSt/VSt/Stempel** (`estv.admin.ch/de/kreisschreiben-…`, 3 Indexseiten) | DBG, VStG, StG | **Erlass-Ebene** (Suffix-Kaskade d/v/s/dv/dvs 76/94 → Beschreibung 3/94 → Seiten-Kontext 15/94) + artikelscharf für die 7/94 mit Art. im Titel | `amtlich` (Suffix/Beschreibung/Titel); `maschinell` (Seiten-Kontext-Fallback — Heuristik, ehrlich deklariert) |

**Stufe 2 (benannt, NICHT jetzt):** BSV (erst POC, Muster 1:1 wiederverwendbar), FINMA
(Reverse-Engineering-Bruchrisiko), SEM (HEAD-Falle, kein POC), fr/it-Achsen (unverifiziert),
PDF-Volltext-Kanten (Tier B, ~25–40 % Review), VBGÖ (erst Korpus-Aufnahme via korpus-werkstatt),
VPB (Quelle tot), Anzeige entlisteter Dokumente («galt damals»-UI).

---

## §2 · Datenmodell (`daten/soft-law.db` lokal + committeter Zustandsträger, Weiche C präzisiert)

### §2.1 DDL (gültiges SQLite, node:sqlite-kompatibel)

```sql
-- soft_law: §3.1-Schema (kategorie/doktyp/behoerde/titel/fundstelle/stand/quelle_url/abgerufen/sha)
-- + Stufe-1-Zusatzspalten:
ALTER TABLE soft_law ADD COLUMN status        TEXT NOT NULL DEFAULT 'gelistet'; -- 'gelistet'|'entlistet'
ALTER TABLE soft_law ADD COLUMN entlistet_am  TEXT;                             -- ISO
ALTER TABLE soft_law ADD COLUMN drift_token   TEXT NOT NULL;                    -- KEIN Default (§0/A8): Insert muss liefern
ALTER TABLE soft_law ADD COLUMN quell_ids     TEXT;                             -- JSON: volatile IDs + url_basis (Q1) — NIE Teil der ID
ALTER TABLE soft_law ADD COLUMN stand_quelle  TEXT;                             -- 'hub-label'|'pdf-text'|'pdf-meta'|'payload'|'toc' (§8)

-- Kanten: §3.2-Schema VOLLSTÄNDIG (Nordstern «EIN Query»), additive Spalten am Ende (§0/B7)
CREATE TABLE norm_referenzen (
  id             INTEGER PRIMARY KEY,
  quelldok_typ   TEXT NOT NULL,            -- 'soft_law'
  quelldok_id    TEXT NOT NULL,
  erlass_key     TEXT NOT NULL,            -- Register-Key, kanonisch, VERSIONSLOS
  artikel        TEXT NOT NULL DEFAULT '', -- '' = Erlass-Ebene (Projektion lässt Feld weg); KEIN COALESCE im Key (§0/A2)
  zitat_key      TEXT NOT NULL,            -- normalisierter Match-Key (normalisiere-zitat.ts)
  roh_zitat      TEXT NOT NULL,            -- Original: Fedlex-Anker-Href | Dateiname | Titel-String (Audit)
  konfidenz      TEXT NOT NULL,            -- 'regex-hoch'|'regex-niedrig'|'unresolved'
  quelle         TEXT NOT NULL,            -- 'amtlich'|'kuratiert'|'maschinell' — Enum-ERWEITERUNG um 'amtlich',
                                           -- Nachtrag in FAHRPLAN-DATENHALTUNG §3.2 = M0-Posten (§0/A3+B7)
  fundstelle     TEXT NOT NULL DEFAULT '', -- 'Ziff. 6.10' | ''
  fundstelle_url TEXT,                     -- RELATIV zur url_basis des Dokuments (Churn-Dämpfung §0/A11)
  stand          TEXT NOT NULL,            -- Stand der Quell-Seite/Version (§7 a)
  abgerufen      TEXT NOT NULL,
  UNIQUE (quelldok_typ, quelldok_id, erlass_key, artikel, zitat_key, fundstelle)
);
CREATE INDEX ix_normref_erlass ON norm_referenzen(erlass_key, artikel);
```

Semantik-Doku im Schema-Kommentar: `artikel=''`/`fundstelle=''` = Erlass-Ebene bzw. keine Ziffer;
Projektion normalisiert zu weggelassenem Feld. `quelle` mappt 1:1 auf `VerzahnungsKante.herkunft`.

### §2.2 Snapshots + Grössen-Disziplin

`quell_snapshot(quelle, abgerufen, sha, inhalt BLOB)` — `inhalt` = NUR das extrahierte Substrat
(`<main>`/Nuxt-Payload/ToC-XHTML), gzip-komprimiert (§0/A13). DB-Datei-Grössenbudget im Offline-Tor
(Warnschwelle 50 MB), damit Wachstum sichtbar gated ist. Die DB ist lokal (gitignored) — der
committete Beleg ist §2.3.

### §2.3 Committeter Zustandsträger (§0/B2 — Blocker-Fix)

`daten/*.db` ist gitignored und per Doktrin wegwerfbar; ein Re-Include unter dem ignorierten Parent
ist git-seitig unmöglich. Deshalb:

- **`bibliothek/register/soft-law-zustand.jsonl`** (committet, append-only, eine Zeile je
  Dokument-Zustandsänderung): id, status, entlistet_am, drift_token, quell_ids, sha, stand,
  stand_quelle, quelle_url, abgerufen + je Snapshot-Lauf eine Kopfzeile (quelle, abgerufen, indexSha).
- **Weiche C präzisiert:** Voll-Rebuild der DB = deterministisch aus (Zustands-Manifest + committete
  Projektionen + neuem Snapshot), **nie aus der Live-Quelle allein** (die Quelle löscht Entlistetes —
  ein Live-only-Rebuild könnte Historie prinzipiell nicht reproduzieren). `check:paritaet`-Reverse-Ingest
  (`ingestSoftLaw`) liest künftig register.json + Zustands-Manifest + Kanten-Shards.
- **Beleg-Anspruch ehrlich (§8):** «galt damals» = Zustands-Manifest (Metadaten+sha) + git-Historie
  der committeten Shards; das Roh-Substrat-BLOB ist lokales Best-effort, KEIN committeter Beweis.
- **register.json bleibt schlank:** nur `status='gelistet'`, ohne quell_ids/drift_token (client-gefetcht
  von Suche+Browse — §15, kein Interna-Leak).

### §2.4 Revisions- und Existenz-Invariante (§0/A1 — Blocker-Fix; + A9, B4)

- **Revisions-Cutoff-Tabelle** je erlass_key, kuratiert klein, im Projektions-Skript versioniert:
  `DSG: 2023-09-01`, `DSV: 2023-09-01`, `MWSTG: 2025-01-01 (Teilrev; nur für in der Teilrevision
  geänderte/neue Artikel — Artikel-Liste kuratiert)`, `MWSTV: 2025-01-01 (analog)`,
  `ArG/ArGV 1/BGÖ/DBG/VStG/StG: kein Gesamtrevisions-Cutoff (Eintrag 'kein-cutoff', begründet)`.
  Jede Zeile mit Norm + Fedlex-Link + Stand (Daueranweisung doppelt-verifizieren).
- **Regel:** artikelscharfe Kante NUR, wenn der massgebliche Dokument-/Ziffern-Stand ≥ Cutoff des
  erlass_key (bzw. der Artikel nicht in der kuratierten Revisions-Artikel-Liste liegt); sonst
  deterministischer **Downgrade auf Erlass-Ebene** (`artikel=''`) + Protokoll-Log. Tor-erzwungen (§4).
- **Aufgehobene/nicht-existente Artikel** (gegen Normtext-Korpus geprüft): Downgrade auf Erlass-Ebene
  + Log — nie stummer Drop, nie Tor-ROT (§0/A9); das Dokument existiert und bleibt relevant.
- **Nicht-korpusierte Erlasse** (z. B. VBGÖ): Kante darf in der DB liegen (Vorrat, ehrlich), die
  Projektion emittiert NUR Korpus-Erlasse; das Tor validiert die projizierten Shards gegen
  ERLASS_REGISTER (§0/B4).
- **UI-Ehrlichkeit (M5):** Dokument-Stand IMMER sichtbar am Chip/der Karte; wo der Korpus einen
  Fassungs-Stand des Ziel-Artikels hergibt und Dokument-Stand < letzte Artikel-Änderung:
  Staleness-Hinweis «Dokument älter als letzte Änderung des Artikels». Wortlaut nie «kommentiert
  Art. X», sondern **«verweist auf Art. X (Stand des Dokuments: YYYY)»**.

### §2.5 Entlistung (§0/A5)

Entlistet ⇒ standardmässig AUS beiden Projektionen (register.json + Shards) ausgeschlossen; Historie
lebt im Zustands-Manifest + git. Entlistung ist NUR zulässig, wenn die Count-Gates desselben Laufs
grün sind (schützt vor Massen-Entlistung durch Quell-Bruch/Redesign). Tor: entlistet-Quote je Lauf
≤ 10 % des Quell-Bestands, sonst ROT. Anzeige entlisteter Dokumente («entlistet am») = Stufe 2.

### §2.6 IDs + Key-Abgleich (§0/B3, A10)

IDs stabil aus der Nummern-Systematik, NIE aus volatilen Quell-IDs: `ESTV-MWST-MI-04`,
`SECO-WL-ARG-ART-9`, `ESTV-KS-DBG-50`. **Für ALLE vier Quellen gilt: existiert das Dokument bereits
im MATERIAL_REGISTER, übernimmt der Adapter dessen Key (bestehender Key gewinnt)** — verifizierte
Kollisionsfälle u. a. `ESTV-MWST-INFO-09`, `SECO-WEGL-ARG-12/-34/-5`, `EDOEB-LEITFADEN-DATABREACH/
-COOKIES/-REVDSG/-TOM`, `EDOEB-MERKBLATT-DSFA`. Abgleich-Tabelle je Adapter; Tor prüft 1:1 UND
Dubletten via quelle_url-/Nummern-Match, nicht nur Key-Gleichheit. Q3 ohne Nummern-Systematik:
normalisierter Titel-Slug (lowercase, Stoppwörter, DE-Basis) + manuelle Alias-Tabelle (alte ID→neue
ID); Tor warnt bei gleichzeitigem Entlisten+Neuanlegen mit hoher Titel-Ähnlichkeit.

### §2.7 Projektion (deterministisch, `scripts/materialien/soft-law-projektion.ts`)

1. `public/materialien/register.json` — Merge MATERIAL_REGISTER (TS bleibt SSoT der kuratierten
   Alt-Einträge) + DB-Dokumente (nur gelistete, schlank §2.3); sortiert, byte-stabil (2 Voll-Läufe →
   byte-identisch, kein `Date.now()`, `--datum` Pflicht).
2. `public/materialien/kanten/<ERLASS_KEY>.json` bzw. bei Überschreitung `…/<KEY>/<bucket>.json` —
   **Volumen-Entscheid JETZT (§0/B5):** Kanten werden je **(Dokument, Artikel)** aggregiert
   (Ziffern-Liste als Feld, nicht Kante je Ziffer — drückt ~5–10×); `fundstelle_url` relativ zur
   `url_basis` des Dokuments (einmal je Dokument, dämpft Churn+Bytes); **Bucket-Split-Mechanik wird
   in M0 GEBAUT** (nicht deferiert), Schwelle 300 KB roh je Datei — MWSTG wird sie realistisch
   reissen, das ist eingepreist. KontextPanel lädt weiterhin 1 Fetch je Erlass (Bucket-Index im
   Shard-Kopf).
3. Byte-Roundtrip der Projektionen in `dokument` → `check:paritaet`-Kette geschlossen.

Massen-Einträge gehen NICHT ins in-Bundle-TS-Register (§15); Kanten ausschliesslich über den
async-Shard. `gen:zaehler` läuft je Daten-Etappe (billig; zählt Materialien heute nicht —
Zähler-Erweiterung = M5-Posten, §0/B10a).

---

## §3 · Adapter (browserlos, §7 Build-Regel 5/6)

Ort: `scripts/materialien/adapter-{estv-mwst,seco,edoeb,estv-ks}.ts` + Orchestrator
`scripts/materialien/soft-law-snapshot.ts` (`npm run materialien:snapshot -- --datum=… --quelle=…`;
p-limit, deterministische Inventar-Reihenfolge). Muster `adapter-lexwork.ts`: Netz-Hülle getrennt
von pur-testbaren Extraktionsfunktionen; API-Vertrag als Kopfkommentar. Wiederverwendet:
`html-entities.ts`, `netz-retry.ts`, `lawid-safe.ts`, Drift-Muster `check-drift.ts`/`drift-logik.ts`.
Ergebnisvertrag: `{ dokumente: SoftLawDok[], kanten: NormRef[], indexSha, abgerufen }`, jedes
Dokument §7-a–d-fähig.

**Q1 ESTV-MWST** — GET-only, cookieless (POC): Inventar via `changedCiphers.xhtml` + Kurz-URLs
`/public/MI/{nr}` (302-Ziel = aktuelle publicationId → `quell_ids.url_basis`); je Publikation
`tableOfContent.xhtml` → je Knoten `cipherDisplay.xhtml` → Fedlex-Anker invertieren.
**Drift-Arbiter (§0/A6): Hash über das komplette ToC-XHTML inkl. aller cipherKeyDates je Publikation**
(1 GET/Publikation, robots-verträglich); Kurz-URL-302-Ziel + «Publiziert am»-Stichprobe nur
Zweitsignal. `fundstelle_url` = Suffix relativ zu `url_basis` (§0/A11); Ziffer-Link-Stichprobe
(url_effective, Soft-404 `search.xhtml?messageKey=…error` mit HTTP 200!) im Netz-Tor. Fallen wie
POC: Host `www.`gate…; `legalBasis.xhtml`/Facette nicht verwenden; publicationId/componentId nie
hartkodieren; **robots `Disallow: /` → Betrieb NUR nach Davids Freigabe (§8), Concurrency 1–2 +
Delay, identifizierender User-Agent, Crawl minimal; Voll-Snapshot dauert realistisch Stunden**;
Historie/Bilder = Stufe 2.

**Q2 SECO** — Nuxt-SSR-Payload parsen (`"url",size,"filename"`-Muster): filename→Artikelnummer
(`ArG-Artikel-(\d+)` / `ArGV1_art(\d+)`), originalDate = Stand (PER ARTIKEL verschieden, 2012–2025
→ artikelgranulare Drift + Revisions-Regel §2.4 greift je Dokument), fileservice-URL kanonisch.
Drift: originalDate + ETag/Last-Modified + URL-Wechsel als Signal. **Vollständigkeits-Gate (§0/A14):
Korpus-Artikelbestand MINUS als aufgehoben markierte Artikel MINUS explizite begründete
Ausnahmeliste im Adapter (je Eintrag Datum+Grund); neue unerklärte Lücke ⇒ ROT.** UUIDs je Lauf
frisch aus Payload; Existenz-Checks per GET.

**Q3 EDÖB** — Hub-HTML (`<main>`-Extraktion), Sektion «Leitfäden und Merkblätter» filtern; je
Dokument Titel|Datum-Label|DAM-URL verbatim. Erlass-Zuordnung kuratiert (DSG/DSV vs. BGÖ; **VBGÖ
gestrichen §0/B4**), `quelle='kuratiert'`; Artikel nur aus amtlichem Titel (`quelle='amtlich'`,
Revisions-Regel §2.4: Titel-Artikel vor 2023-09-01-Dokumenten ⇒ Downgrade). ID = Slug +
Alias-Tabelle (§2.6). Drift: Hub-Datumslabel + PDF-ETag/Last-Modified per GET/Range (Sitemap
unbrauchbar). `stand_quelle` je Dokument protokollieren; zwei Cookie-Dokumente nicht dedupen;
DAM-Token nie hardcoden.

**Q4 ESTV-KS/RS** — 3 SSR-Indexseiten (`a.download-item[href$=.pdf]` + Titel + Beschreibung);
Gesetz-Ebene: Suffix-Kaskade (76/94, `quelle='amtlich'`) → Beschreibung (3/94, `'amtlich'`) →
Seiten-Kontext (15/94, **`quelle='maschinell'`** — Heuristik ehrlich als solche, §0/A3). Dedupe per
URL (120→94, Quer-Listung = Mehrfach-Kanten); doktyp-Werte KS/Anhang/W-Serie/Mitteilung getrennt
(DoktypId-Union + Labels in `src/lib/materialien/typen.ts`/`register.ts` erweitern — §0/B6). Drift:
sha256/16 über 120 sortierte PDF-URLs (Baseline 2026-07-03: `6c362ffffd781641`) + ETag/Last-Modified
(In-place-Korrekturen beobachtet). Fehler NUR über Count-Gates (≥70/≥28/≥12) + Struktur-Probe.

---

## §4 · Tore

| Tor | Inhalt |
|---|---|
| `check:materialien` (**Neubau**, offline, in `gate`) | Heutiger Hard-Assert `Manifest == MATERIAL_REGISTER` wird zum Merge-Modell umgebaut (§0/B9). Prüft: Dreieck Zustands-Manifest→DB→Projektionen byte-konsistent (2-Lauf-Determinismus); **§7 a–d korrekt gemappt (§0/A4):** (a) `stand` nicht-leer, (b) `quelle_url` nicht-leer, (d) `drift_token` nicht-leer (kein Default-Schlupf, §0/A8) — (c) sichtbarer UI-Live-Link wird als M1-DoD per Playwright bewiesen, nicht offline prüfbar; `abgerufen` zusätzlich nicht-leer (Hygiene, KEIN §7-Surrogat); Shard-/Bucket-Budget ≤ 300 KB; `erlass_key`/`artikel` der PROJIZIERTEN Shards gegen ERLASS_REGISTER/Normtext-Korpus; **Revisions-Cutoff-Regel §2.4 erzwungen** (artikelscharfe Kante mit Stand < Cutoff ⇒ ROT); Downgrades geloggt, nie ROT; Key-Abgleich + Dubletten-Match (quelle_url/Nummer) für ALLE 4 Quellen; **jedes DB-Dokument hat registrierte Behörde+Doktyp** (kein stiller Browse-Drop, §0/B6); Append-only gegen Zustands-Manifest (kein id des Vorlaufs fehlt; entlistet ⇒ status+Datum, nie DELETE); entlistet-Quote ≤ 10 %/Lauf; `quelle` ∈ {'amtlich','kuratiert','maschinell'}; DB-Grössenbudget (§2.2). |
| `check:materialien-netz` (neu; in `check:netz` UND als **eigener Step in `normen-monitor.yml`** — §0/B8, sonst läuft Drift nie automatisch) | Drift je Quelle mit §3-Arbitern (Q1 ToC-Hash je Publikation + 302-Ziele; Q2 Payload-originalDate/URL-Set; Q3 Hub-Label+ETag GET/Range; Q4 Index-URL-Hash vs. Baseline) + Count-Gates + Soft-404 (`url_effective`, Content-Type) + Ziffer-Deep-Link-Stichprobe (§0/A11). Drift ⇒ ROT = «Snapshot neu ziehen», nie Auto-Fix. |
| `check:gegenpruefung` | Globs `scripts/materialien/**` + `public/materialien/*.json` + `public/materialien/kanten/**` in `scripts/gegenpruefung/kern.ts` — JETZT (M0). Jede Etappe endet mit gefahrenem Skill `gegenpruefung` + Quittung. |
| Wortfeld-Tor (in `check:materialien`) | Grep über `src/lib/materialien`, `src/components/kontext`, **`src/pages/Material*.tsx`** (§0/A7) = 0 «geprüft/gegengeprüft/verifiziert» in EIGENEN Nutzertexten; in den JSON-Projektionen NUR eigene Felder (hinweis/Labels/Badge-Texte) greppen — amtliche `titel`/`beschreibung` sind Zitat-Felder und ausgenommen (im Tor-Code dokumentiert; amtliche Titel werden NIE umgeschrieben). Erlaubt: «amtlich verlinkt», «von LexMetrik strukturiert erfasst», «verweist auf Art. X (Stand des Dokuments: YYYY)». |
| Bestehende Ketten | `check:paritaet` (Reverse-Ingest neu inkl. Zustands-Manifest, §2.3), `check:datenhaltung` (keine Orphans; quelle-Enum), `check:zaehler` nach `gen:zaehler`, Golden Normtext byte-gleich (E6a fasst `public/normtext/**` nicht an). |

---

## §5 · UI-Andocken (minimales Delta, Sequenz-Gate)

**Sequenz-Gate (hart, bestätigt §0/B10d):** UI-Delta = eigener PR **erst NACH Merge von V1a**
(`KontextPanel.tsx`/`parts.tsx`/**`src/lib/kontext.ts`** sind bis dahin Sperrfläche). M0–M4 laufen
davon unabhängig — **aber ehrlich benannt: jede Adapter-Etappe ist ein Prod-sichtbarer
Content-Release** (register.json wird live von `useUniversalSuche.ts` + `Materialien.tsx` gefetcht;
Auto-Merge + main=Prod ⇒ neue Dokumente erscheinen ab M1 in Suche+Browse, §0/B6 — DoD deckt das).

Delta (M5, ~½–1 Tag):
1. Async-Loader `kontextSoftLaw(normKeys)` in `src/lib/kontext.ts` nach `kontextEntscheide`-Muster
   (lazy fetch Shard/Buckets, max. 8 + «Alle n ansehen»); `VerzahnungsKante[]` mit
   `ziel.typ:'verwaltungsverordnung'`, `herkunft` = DB-`quelle` (amtlich/kuratiert/maschinell —
   Badge-Regel VZUI §1.2 markiert Abweichungen von 'amtlich').
2. Bestehende Gruppe «Amtliche Materialien» erweitern (Props, KEIN fünfter Block, KEIN
   Registry-Refactor); sync+async gemerged, dedupe per key; Fundstellen-Sublabel («via Art. 21» /
   «Ziff. 6.10»); **Dokument-Stand am Chip + Staleness-Hinweis §2.4**; Hinweiszeile «kein
   Gesetzesrang» bleibt.
3. **`StatusBadge`-Variante `'nur-verweis'` wird HIER GEBAUT** (bewusster V3-Vorzug; eine
   Nachtragszeile in FAHRPLAN-VERZAHNUNG-UI §V3 «vorgezogen durch E6a·M5» gehört zur M5-DoD —
   §0/B10b); auf der MaterialLeser-Karte, nicht am Chip (Dichte-Regel).
4. KEINE vierte `KontextTyp`-Ausprägung (Dokumente laufen im MaterialLeser, typ `'material'`);
   `'verwaltungsverordnung'` als Reader-Typ bleibt V3.
5. `gen:zaehler` inkl. Zähler-Erweiterung um Materialien (§0/B10a) + CLS 0 + a11y-aria-labels.

---

## §6 · Etappierung + Aufwand (ehrlich, §0/B9), je PR mit Toren

| Etappe | Inhalt | Tore/DoD | Aufwand |
|---|---|---|---|
| **M0 Fundament** | DDL §2.1, Zustands-Manifest §2.3 + `ingestSoftLaw`-Umbau, Projektion inkl. Aggregation+Bucket-Split §2.7, Cutoff-Tabelle §2.4, **`check:materialien`-NEUBAU** + Wortfeld-Tor, gegenpruefung-Globs, §3.2-Enum-Nachtrag in FAHRPLAN-DATENHALTUNG, npm-Scripts | gate grün, 2-Lauf-Byte-Beweis, gegenpruefung-Quittung | ~1½–2 Tage |
| **M1 Adapter ESTV-MWST** | Q1 komplett (ToC-Hash-Arbiter, url_basis-Indirektion, Anker-Invertierung); **Vorbedingung: Davids robots-Freigabe (§8)**; MWSTG-Bucket-Split real | `check:materialien(-netz)` grün, normen-monitor.yml-Step, **Playwright-Beweis sichtbarer Live-Link auf MaterialLeser-Karte (§7 c)**, Suche/Browse-Stichprobe mit +Masse (Content-Release!), gegenpruefung | ~2–3 Tage (Voll-Crawl dauert Stunden) |
| **M2 Adapter SECO** | Q2 ArG+ArGV 1, Payload-Parser, artikelgranulare Drift, Ausnahmeliste-Gate §3 | wie M1 (ohne robots-Punkt) | ~1 Tag |
| **M3 Adapter EDÖB** | Q3 (ohne VBGÖ), Slug+Alias, `stand_quelle`, Cutoff-Downgrade revDSG | wie M2 | ~½–1 Tag |
| **M4 Adapter ESTV-KS/RS** | Q4 + Key-Abgleich, quelle amtlich/maschinell, Count-Gates, Hash-Baseline, DoktypId-Erweiterung | wie M2 | ~1 Tag |
| **M5 UI-Delta** | §5, **erst nach V1a-Merge** | CLS 0, a11y, e2e-Stichprobe (Playwright via Bash), gen:zaehler+Erweiterung, VZUI-§V3-Nachtrag, §9 vor Deploy | ~½–1 Tag |

**Summe ehrlich: ~7–10 Tage** (inkl. gegenpruefung-Läufe je Etappe). M0→M1→M2→M3→M4 seriell (je 1 PR,
Auto-Merge bei grüner CI); M5 asynchron am V1a-Gate. Eigener Worktree (§12); Push/Deploy §9
(`deploy-check`-Skill).

**Ausführungsvermerk M0 (3.7.2026):** M0 gebaut und gemergt (Gegenprüfung bestanden — unabhängiger
Opus-Adversarial, 2 Linsen: alle 10 Cutoff-Norm-Fakten gegen Fedlex-SPARQL/ELI verifiziert, 0
Abweichungen; Logik-Adversarial ohne Drop/Leak/Fail-open, NUL-Delimiter-Kollisionshypothese
widerlegt). **Aus der Gegenprüfung in die ERSTE Adapter-Etappe (M1 ODER M2, je nachdem was zuerst
baut) übernommen:**
- **CI-Reproduzierbarkeit (Blocker der ersten Adapter-Etappe):** `check:materialien` überspringt
  die DB bei Abwesenheit — sobald das erste DB-Dokument gelistet ist, ginge die CI-Byte-Gleichheit
  rot. Fix: den «Zustands-Manifest ⇒ DB-Teil»-Wiederaufbau in den Tor-Pfad verdrahten (dbDocs aus
  soft-law-zustand.jsonl rekonstruieren; Kanten-Invarianten laufen weiter direkt auf den
  committeten Shards) ODER den DB-Teil der Byte-Gleichheit CI-fähig aus committeten Trägern speisen.
- **Härtungen bei erster DB-Anbindung:** (1) Shard-Sortierungen von `localeCompare` auf
  Code-Unit-Vergleich umstellen (ICU-Versions-Drift Dev↔CI); (2) `KEY_UNSICHER`-Check auch auf
  DB-/Zustands-Manifest-IDs erzwingen (Pfad-Sicherheit der Shard-Dateien); (3) ISO-Validierung
  `entlistet_am` + Plausibilität `stand` (Monat ≤ 12, Tag ≤ 31).

**Ausführungsvermerk M3 (4.7.2026):** M3 gebaut (Adapter `adapter-edoeb.ts`; DS-Hub Sektion
«Leitfäden und Merkblätter» → 8 neue DSG-Dokumente, BGÖ-Hub Sektion «Öffentlichkeitsprinzip
allgemein» → 2 neue BGOE-Dokumente; 10 Kanten Erlass-Ebene `quelle='kuratiert'`). Die M0-Vermerk-
Posten (CI-Rebuild aus JSONL, Code-Unit-Sort, KEY_UNSICHER auf DB-IDs, ISO-Validierung) waren
mit M2 (#127) bereits gelandet — verifiziert, nichts nachzutragen. **Eine offengelegte Abweichung
von §2.6/§3 Q3 (Begründung §15 Funktions-Treue):** die vier bereits KURATIERTEN Dokumente der
DS-Sektion (COOKIES/DATABREACH/TOM/DSFA) werden per Slug-Tabelle `KURIERT_BEKANNT` ÜBERSPRUNGEN
statt in die DB migriert — «bestehender Key gewinnt» wörtlich: der kuratierte Eintrag bleibt
massgeblich. Grund: die Norm-Kontext-Brücke (`materialienFuerNorm`) liest bis M5 NUR das
in-Bundle-`MATERIAL_REGISTER`; eine Migration hätte die vier bis zum M5-Async-Loader aus dem
Norm-Kontext-Panel entfernt (Prod-Regression). **Folge-Posten für M5:** Migration der vier in die
DB nachziehen (dann artikelscharf DATABREACH → Art. 24 DSG; DSFA → Art. 22/23 DSG mit
revDSG-Cutoff-Downgrade §2.4) — die Extraktions-/Downgrade-Mechanik ist gebaut und getestet,
sie greift ab Migration bzw. für künftige neue Dokumente mit Artikel im Titel. Zusätzlich M3:
Weiche-C-Seed `seedSoftLawDb` (DB-Rekonstruktion aus JSONL + committeten Shards vor dem Overlay
der gecrawlten Quelle — ein Ein-Quellen-Snapshot verliert die Kanten der übrigen Quellen nicht
mehr); EDÖB-Arbiter in `check:materialien-netz`; e2e `materialien-m3-edoeb.e2e.ts` (§7c-Beweis).

**Ausführungsvermerk M4 (4.7.2026):** M4 gebaut (Adapter `adapter-estv-ks.ts`; 3 Indexseiten
live 4.7.: dbst 77 / vst 32 / stempel 14 PDF-Anker → 95 distinkte URLs → **90 DB-Dokumente**
nach 4 kuratiert-Skips; **121 Kanten**: 108 `amtlich` [Suffix-Kaskade Stufe 1+2] · 13
`maschinell` [W-Serie/Merkblatt-Sonderfall via Seiten-Kontext, ehrlich §0/A3] · 0 artikelscharf).
Abweichungen/Deltas gegen die POC-Spec, offengelegt:
- **Live-Drift seit POC 3.7.:** 123 Anker/95 URLs statt 120/94 (ESTV hat zugelegt: neue
  KS-11a-Systematik `1-011a[-Anhang]-D-2026`); Kaskade live 79 Dateinamen-Suffix →
  1 Beschreibung → 15 Seiten-Kontext. Der spec-seitige Ein-Hash über die sortierte URL-Liste
  (Baseline `6c362ffffd781641`) ist durch den Manifest-Diff-Arbiter ERSETZT (jede URL-/Titel-/
  Datums-Änderung kippt den drift_token des einzelnen Dokuments — feiner als der Summen-Hash).
- **Artikelscharf live = 0 statt 7/94:** das einzige aktuelle Dokument mit Artikel im Titel
  (KS 6a «… Art. 65 DBG …») ist kuratiert-bekannt → übersprungen (§2.6 «bestehender Key
  gewinnt», gleiche M3-Begründung: Norm-Kontext-Brücke liest bis M5 nur das in-Bundle-Register).
  Die Titel-Artikel-Extraktion ist gebaut + getestet und greift ab M5-Migration/neuen Dokumenten.
- **ID-Systematik verfeinert (live erzwungen):** ESTV co-listet KS Nr. 26 doppelt (2009-Original
  + «Version vom 6.2.2024») → Versions-Titel bekommen `-V<JAHR>`-Suffix; KS-Beilagen tragen die
  Beilage in der Anzeige-Nummer («Nr. 45 · Anhang 1-1»), sonst risse das Dubletten-Tor
  (behoerde+nummer) am Haupt-KS (live gefangen bei KS 37 Anhang 1–5).
- **DoktypId-Union erweitert** (§0/B6): `ks-anhang` («KS-Anhang») + `weisung` («Weisung»,
  alte W-Serie) in `typen.ts`/`register.ts`; W-Datei mit «Kreisschreiben»-Titel (revidierte
  Version) → kreisschreiben. `stand` der W-Serie/Mitteilungen = Titel-Datum («vom DD.MM.YYYY»),
  nicht das Upload-Label. ESTV-KS-Arbiter in `check:materialien-netz`; e2e
  `materialien-m4-estv-ks.e2e.ts` (§7c-Beweis). **M5-Folge-Posten ergänzt:** Migration der 4
  kuratierten KS (analog EDÖB-Vierer) → dann artikelscharf KS 6a → Art. 65 DBG.

**Ausführungsvermerk M1 (4.7.2026):** M1 gebaut — **robots-Freigabe für www.gate.estv.admin.ch
durch David am 4.7.2026 im Chat ERTEILT und bestätigt** (§8-Governance-Punkt geschlossen); Betrieb
wie zugesagt: Concurrency 1–2, Delay zwischen allen Requests, identifizierender User-Agent.
Adapter `adapter-estv-mwst.ts` + reines Anker-Modul `fedlex-anker.ts` + ID-Systematik
`estv-mwst-ids.ts`. **Live-Empirie 4.7.:** Inventar = die ZWEI ToC-Menüs (taxInfos 22 MI +
sectorInfos 27 MBI; `changedCiphers.xhtml` ist POST/ViewState-getrieben und als GET-Inventar
unbrauchbar — Abweichung von §3 Q1 offengelegt); Kurz-URL-Systematik live bestätigt `MI/NN` UND
`MBI/NN` (302 → aktuelle publicationId; Zweitsignal + stabile `quelle_url` §7c); Glossar-Publikation
«Abkürzungen und Akronyme» (je Bereich 1, nummernlos) bewusst übersprungen. **Drift-Arbiter:**
Hash über das komplette ToC-XHTML je Publikation, ViewState-NORMALISIERT (volatil je Request —
zwei Fetches nach Normalisierung live byte-gleich; Roh-Hash wäre Dauer-Drift); die
Fahrplan-Formulierung «inkl. aller cipherKeyDates» ist live gegenstandslos (ToC trägt KEINE
cipherKeyDates, 0 Treffer) — Deckung über componentId-Wechsel im Baum, «Publiziert am»-Ziffer-
Stichprobe bleibt Zweitsignal im Netz-Tor. **Zahlen:** Voll-Crawl 3118 Requests/~2h10 (+71 GETs
MI-06-Nachcrawl, s. u.) → 48 Dokumente (22 MI − MI-09 kuratiert-übersprungen §2.6 + 27 MBI) ·
3375 Roh-Kanten (3373 amtlich via serverseitige Fedlex-Anker · 2 kuratiert = Publikationen ohne
Anker, Portal-Kontext→MWSTG) · projiziert 1739 aggregierte Kanten (1417 artikelscharf · 322
Erlass-Ebene · 3075 Ziffer-Fundstellen mit Deep-Link-Suffix) · **1186 Cutoff-Downgrades §2.4** ·
**MWSTG-Bucket-Split REAL** (Kopf + 2 Buckets ≤ 300 KB). **§2.4-Posten erledigt:**
Revisions-Artikel-Listen MWSTG (34 Artikel, AS 2024 438) + MWSTV (58, AS 2024 485) kuratiert,
DOPPELT erhoben (AS-`<mod>`-Ziele × Konsolidierungs-Fussnoten «in Kraft/mit Wirkung seit
1.1.2025»; MWSTV = Union, konservativ §1); die unabhängige Gegenprüfungs-Re-Derivation bestätigte
MWSTG exakt (34=34) und MWSTV mit `121_a` als einzigem (zulässig konservativem) Überschuss.
**Gegenprüfungs-Geschichte (2 Durchgänge, ehrlich):** Durchgang 1 (unabhängiger Opus-Adversarial
gegen Live-Quelle + Fedlex) **widerlegte** die Erstfassung — echter Anker-Drop in MI-06:
Publikationen mit Teil-Gliederung zählen Ziffern JE TEIL neu; der Kollisions-Merge («ältester
Stand gewinnt») zog Anker der 2025er-«Ziff. 1» (Teil I) in die gleichnamige ältere Ziffer, wo der
Cutoff sie wegdowngradete (Art. 45/21, componentId 1016932). Fix: Fundstellen tragen
**Teil-Kontext** («Teil I · Ziff. 1»), Rest-Kollisionen werden per « (n)»-Suffix UNTERSCHIEDEN,
nie gemergt (kein Verlust by construction); MI-06 einzeln neu gecrawlt (+71 GETs), 47 übrige
Dokumente offline aus den gespeicherten ToC-Substraten migriert; Durchgang 2 verifizierte den Fix.
**Weitere live erzwungene Fixes, offengelegt:** (1) undici-Pool-Hänger durch unkonsumierten
302-Body in der Kurz-URL-Prüfung → Body-Cancel; (2) **Pipeline-Härtung store-raw-VOR-load:**
Adapter-Ergebnis wird als `daten/soft-law-ergebnis-<quelle>.json` persistiert (Re-Ingest
`--aus-ergebnis` OHNE Crawl — ein Load-Bug kostete live einen kompletten 3118-Request-Crawl, nie
wieder; genau diese Ablage machte auch den Gegenprüfungs-Fix ohne Voll-Re-Crawl möglich);
(3) Quell-Lösch-Scope des Orchestrators über BEIDE Tabellen (verwaiste Seed-Kanten);
(4) **latenter M3-Seed-Bug gefixt:** `seedSoftLawDb` kollabierte Shard-Fundstellen auf
`zitat_key=''` — gleiche Ziffer-Labels verschiedener URLs/Stände rissen die UNIQUE-Constraint
(erst an der MWST-Dichte sichtbar); jetzt eindeutige `seed:<n>`-Keys (fliessen nicht in
Shard-Bytes, Re-Projektion bleibt byte-identisch — Tor beweist es). `stand_quelle`-Enum
+`'ziffer-datum'` (Dokument-Stand = jüngstes «Publiziert am»). ESTV-MWST-Arbiter in
`check:materialien-netz` (leichtes Inventar 1 GET/Publikation + Kurz-URL- +
Ziffer-Deep-Link-Stichprobe mit Publiziert-am-Abgleich). Tore grün (2-Lauf-Byte-Beweis,
Seed-Roundtrip, 116 e2e, §7c-Playwright-Beweis + Suche/Browse-Stichprobe). **M5-Folge-Posten
ergänzt:** Migration ESTV-MWST-INFO-09 (analog EDÖB/KS) — dann artikelscharfe Kanten auch für
MI 09; MWSTV-Konsolidierung 2027-01-01 ist bereits publiziert (künftige Fassung) → bei
Inkrafttreten Cutoff-Tabelle prüfen (Staleness-TTL-Vermerk aus Gegenprüfung Durchgang 1).

---

## §7 · Bewusst NICHT (Stufe 1)

- Keine Volltext-Einbettung (`MaterialStatus` bleibt `'nur-live-link'`; Stufe 2 nur mit
  §7-Ausnahme + Tier-B-Review-Budget ~25–40 %).
- Kein FINMA/SEM, kein BSV ohne POC, kein VPB, **kein VBGÖ** (nicht im Korpus, §0/B4).
- Keine KI-/heuristische Klassifikation als 'amtlich' — der einzige Heuristik-Fallback (Q4
  Seiten-Kontext) trägt `quelle='maschinell'` und wird im UI als solcher gebadged.
- Kein Registry-Refactor des KontextPanels, keine vierte `KontextTyp`-Ausprägung, kein neuer
  Gruppen-Block (V2/V3-Territorium; einzige bewusste V3-Vorleistung: `nur-verweis`-Badge-Variante).
- Keine PDF-Volltext-Zitat-Regexes (EDÖB-Artikel-Kanten aus PDF-Text = Stufe 2).
- Keine fr/it-Achse, keine künftigen Fassungen (Build-Regel 3), kein Headless-Browser.
- Keine UI-Anzeige entlisteter Dokumente (Historie nur DB/Manifest; «galt damals»-UI = Stufe 2).

---

## §8 · Offener Punkt für David (genau EINER)

**robots-Freigabe Q1:** `www.gate.estv.admin.ch` hat `robots.txt Disallow: /`. Geplant ist ein
minimaler, höflicher Crawl (Concurrency 1–2, Delay, identifizierender User-Agent, 1 ToC-GET +
1 GET/Ziffer, Drift-Läufe klein) einer amtlichen Publikationsplattform — das ist ein
Governance-Entscheid, kein technischer (§0/B8). **M1 startet erst nach Davids Ja**; M0 und M2–M4
sind davon unabhängig und sofort baubar.
