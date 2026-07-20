# FAHRPLAN-DATENHALTUNG — DB als die EINE Wahrheit, Projektion, Massen-Korpus, Edge-Suche

> **Rolle (§14):** Detailquelle zu `ROADMAP.md` → Querschnitt **QS-DATA** + Bau-Schritt
> **W2·6-DATA**. Nie zweiter Einstieg. **Council-Entscheid 2.7.2026** (Richtung entschieden,
> nicht mehr offen); löst die drei „DAVID-ENTSCHEID"-Punkte aus `PLAN-OCL-ABBAU.md`
> (§AUSFÜHRUNGS-STAND + §OFFENE PUNKTE: Zitations-Graph 8,7M · Parquet als Volltext-Quelle ·
> Breiten-Korpus) auf. Fable plant, Opus baut. Trailer `Roadmap: QS-DATA`.

## 0. Entschiedene Richtung (bindend)

1. **DB = Single Source of Truth (§5)** für die Korpus-Inhalte (Normtext Bund → später Kantone,
   Rechtsprechung, Materialien). `public/*.json` + prerenderte Seiten werden **Projektion aus der
   DB** — nicht parallel gepflegt. Kein „Zwei-Wahrheiten"-Bruch.
2. **Andockpunkt: eine Schicht UNTER dem heutigen Generator.** Die bestehenden Adapter
   (`scripts/normtext/extrahiere-fedlex.ts`, `adapter-lexwork.ts`, `adapter-entscheide.ts`,
   Materialien-Generatoren) bleiben die Extraktions-Wahrheit; sie schreiben künftig Zeilen ins
   DB-Artefakt, eine Projektions-Schicht erzeugt daraus `public/*.json` **byte-gleich** zum
   heutigen Output (Golden-Byte-Paritäts-Tor). Prerender (`scripts/prerender.ts`) liest weiter
   nur die JSON-Projektion → Prerender-Parität folgt aus JSON-Parität.
3. **Quelle Massen-Korpus:** HF `voilaj/swiss-caselaw` (CC0-Parquet) **konsumieren**, nicht
   scrapen (Scraper-Verdikt `FAHRPLAN-OPENCASELAW-QUELLEN.md` §SCRAPER-VERDIKT bleibt NEIN);
   bger.ch/Fedlex bleiben amtlicher Arbiter (Art. 5 URG ist die Rechtsquelle, CC0 nur
   Aggregator-Zusage; sichtbarer amtlicher Link je Eintrag, §7 a–d).
4. **Doktrin-Deckung:** §2 betrifft Rechen-Engines, nicht Inhalts-Speicherung. §7-Zitat-Ausnahme
   (a)–(d) gilt zeilenweise. §15 verlangt Inhaltsvollständigkeit — prerendertes Schaufenster
   bleibt; Long-Tail on-demand nach §15.6. Einziger Doktrin-Eingriff = §7 Build-Regel 6.
5. **Prinzipien:** Treue vor Tempo · inkrementell, nie Big-Bang · POC-first mit Paritäts-Tor ·
   Leitprinzip 4 (Massen-Import = 26×-Asset) · stört keinen anderen Strang (OCL-Abbau ist auf
   main konsolidiert; W2·5b-Worktrees via §12 koordinieren — Kollisionsfläche
   `normtext-snapshot.ts`/`public/normtext/**`).

**NORDSTERN-Umfang (David 2.7.2026; präzisiert 3.7.2026: DIE EINE Anlaufplattform für JEDEN
Rechtsanwender — Gerichte, Steuerbehörden, Ämter/Verwaltung, Studierende, Notariate, Treuhänder;
die Verzahnung Norm↔Entscheid↔Material↔VerwVO ist Organisationsprinzip des GANZEN Plans, kein
Einzelfeature):** LexMetrik soll **jegliche amtlichen Materialien von Bund UND
allen 26 Kantonen übersichtlich darstellen** — alle Doktypen in EINER Datenbank:
- **Gesetze/Erlasse** (Bund + Kantone) — bestehend, wird Projektion aus der DB (E1)
- **Rechtsprechung** (alle Gerichte, **≥ voilaj-Vollkorpus ~991k**) — E3 (BGer) + E5 (Kantone)
- **Verwaltungsverordnungen / amtliche Praxis** (Kreisschreiben ESTV/BSV/FINMA/SEM, Weisungen,
  Merkblätter, Praxisfestlegungen) — E6
- **Materialien** (Botschaften/BBl, Parlamentsdebatten/Amtliches Bulletin, Vernehmlassungen,
  Staatsverträge) — E6, überschneidet `FAHRPLAN-FEDLEX-PORTFOLIO.md`

Das ist die «alle amtlichen Quellen»-Vision als EIN Datastore. Die Architektur trägt das **ohne
Umbau** (DB=Quelle skaliert additiv: je Quelle/Doktyp EIN Adapter, mehr Zeilen; gemeinsames
Schema + Norm-Verzahnung). Es ist ein **mehrjähriges, gestaffeltes** Vorhaben (nie Big-Bang);
Hosting-Kosten wachsen moderat mit dem Umfang (§9); **Status-Marker** machen die ungeprüfte Masse
ehrlich nutzbar (§8). Der POC (BGE + Bund-Gesetze) ist nur der Einstieg, nicht die Grenze.

**Kern-Anforderungen (David 2.7.2026):**
- **Selbst gehostet.** Serving/Betrieb auf **eigener Infrastruktur** (portables SQLite-Artefakt +
  FTS5 auf eigenem Server/VPS, z. B. libSQL-Server oder schlichte Read-API); **keine erzwungene
  Vendor-Bindung** — Turso o. ä. nur optionale Bequemlichkeit, nie Voraussetzung. Das Artefakt ist
  überall lauffähig; Anbieterwechsel = Datei umziehen.
- **Immer auf geltendem Stand.** Die DB trägt stets die **aktuelle amtliche Fassung**: robuste
  Update-Pipeline (voller Rebuild/Delta wie voilaj) + **Drift-Tore gegen die amtliche Quelle**
  (`check:*-netz`, `check:fedlex-versionen`, `content_hash`-Verfügbarkeit) — **kein stilles
  Veralten**; erkannter Drift = rot + automatischer Nachlauf. Aktualität ist load-bearing, nicht
  Kür.
- **Transparent wiedergegeben, mit Fundstelle.** LexMetrik zeigt an **jedem** Dokument sichtbar:
  die **amtliche Fundstelle/Zitierung** (SR-Nr., BGE-/BGer-Zitat, ECLI, BBl/AS-Fundstelle),
  **Stand/Abrufdatum**, **amtliche Quelle-URL (Live-Link)**, **Verifikations-Status** (geprüft /
  automatisch übernommen) und **Aktualitäts-Marker** (zuletzt gegen Quelle geprüft; ggf. „Quelle
  geändert"). §7 (a)–(d) + §8 — nie wegglätten, nie Ungeprüftes als geprüft ausgeben.
- **Historie, sofern verfügbar.** Wo die amtliche Quelle frühere Fassungen führt (v. a. Fedlex:
  konsolidierte Erlass-Versionen über die Zeit via ELI-Datum; AS-Änderungshistorie), hält die DB
  die **zeitversionierten Fassungen** (`gueltig_von`/`gueltig_bis` je Version) → Nutzer sehen „was
  galt an Datum X" + Änderungsverlauf. Entscheide sind unveränderlich (keine Historie nötig);
  Gesetze/Verwaltungsverordnungen nicht. Best-effort: fehlt die Quelle-Historie, wird nur die
  geltende Fassung geführt (ehrlich markiert).

## 0bis. Bestehender Verzahnungs-Bestand (wird erweitert, nicht neu gebaut)

Die Verzahnung läuft heute schon, JSON-basiert: **`src/lib/kontext.ts`** (Norm↔Entscheid↔Material-
Auflösung: `kontextSync`/`kontextEntscheide`/`normenFuer`/`materialienFuer` — §5 EINE Stelle) ·
**`src/components/kontext/KontextPanel.tsx`** (B3-Panel in allen drei Readern) ·
**`src/lib/rechtsprechung/norm-index.ts`** (`proNorm`/`proNormArtikel`, `LeitfallRef.gewicht` — das
build-time «Zitat-Graph light») · **`src/lib/rechtsprechung/zitat-extraktion.ts`** (byte-genau OCLs
Graph, `PLAN-OCL-ABBAU.md` §W12-Beleg). **E4 fügt NUR die Massen-Kanten (`zitat_kanten`/`norm_kanten`)
für die Edge-Query-Ebene hinzu; die build-time-Projektion für erfasste Panels bleibt `norm-index.ts`.**
E6a hängt den vierten Doktyp an DENSELBEN Bus (Code-Folgeaufgabe s. §5 E6).

## 1. Architektur

```
amtliche Quellen (Fedlex-HTML/XML · bger.ch · LexWork · voilaj-Parquet als Seed)
    │  bestehende Adapter (unverändert die Extraktions-Wahrheit)
    ▼
daten/*.db je Doktyp — normtext·rechtsprechung·soft-law (§2.2; libSQL/SQLite; generator-erzeugt, gitignored; Manifest committed)
    │ ① Projektion (deterministisch)          │ ② Replika-Sync (Turso)
    ▼                                          ▼
public/normtext|rechtsprechung|materialien   Edge-Query (Suche über die Masse,
*.json  → prerenderte Seiten (wie heute)     Long-Tail on-demand, Zitat-Graph)
```

- **Render-Pfade:** (a) kuratiertes Schaufenster = committete JSON-Projektion + Prerender
  (unverändert, §15-inhaltsvollständig, offline-fähig); (b) Long-Tail = SPA-Route lädt den
  vollen Datensatz on-demand über eine Read-only-Edge-Funktion (`api/…`), rendert mit den
  bestehenden Reader-Komponenten, §15.6 + ehrlicher Fallback (amtlicher Link) wenn Edge down.
- **Suche:** statischer FlexSearch-Index (Bund, 16 MiB) bleibt als Offline-Fallback; die
  **Edge-Suche über die Masse** (FTS5 `unicode61 remove_diacritics 2`) kommt als zusätzliche,
  §8-markierte Treffergruppe in die EINE bestehende Suche (`universalSuche`).
- **Zitat-Graph:** Kanten-Tabellen (decision→decision, decision→norm/art) leben NUR in der DB
  (~90 MB Quelle); Panels der erfassten Entscheide bekommen build-time-Projektionen, die Masse
  läuft über Edge-Query. Kanten sind maschinell (§8-Marker) + laufen durch die deterministischen
  OCL-Verifikations-Checks (docket_year_plausibility, publication_before_decision …).
- **Partitionierung + «ATTACH nur im Läufer» (Fundament-Plan §2.2; Invariante §4):** je Doktyp EINE
  DB-Datei (`normtext.db`/`rechtsprechung.db`/`soft-law.db` statt Monolith — unterschiedliche
  Rebuild-Kadenz + kleinerer Atomic-Swap-Footprint + Blast-Radius-Isolation; Kanten-Tabellen leben bei
  ihrer Quell-Seite). Cross-DB-`ATTACH` ist **ausschliesslich Import-/Enrichment-Werkzeug auf dem
  Self-Host, nie Lesepfad**: jede Laufzeit-Query (Edge wie SPA) trifft genau EINE DB-Datei (Kontext-Panel
  liest `norm_referenzen`, Ranking liest die materialisierte `norm_rangliste`, §3.2). So hängt keine
  Nordstern-Query an Edge-ATTACH-Verfügbarkeit; die Regel ist explizite Invariante in `check:datenhaltung`
  (§4, Grep über den API-Code).

## 2. Single-Source-Artefakt: Turso/libSQL vs. Neon — Verdikt libSQL

| Kriterium | Turso/libSQL (SQLite) | Neon (Postgres) |
|---|---|---|
| Generator-erzeugtes, lokal baubares EIN-Datei-Artefakt (§7/6) | ✅ `.db`-Datei, offline baubar, versionierbar | ❌ nur gehosteter Zustand |
| Determinismus/Parität prüfbar | ✅ kanonischer Dump + Projektions-Byte-Parität | ⚠️ nur über Export-Umweg |
| FTS DE/FR/IT diakritik-insensitiv | ✅ FTS5 `unicode61 remove_diacritics 2` | ⚠️ tsvector-Konfig je Sprache |
| Edge-Read aus statischer Vercel-SPA | ✅ HTTP-API/Edge-kompatibel, Embedded Replica | ✅ serverless, aber schwerer |
| Rollback = Artefakt austauschen | ✅ Datei ersetzen / Replika neu syncen | ⚠️ Migrations-Zustand |
| Kostenrahmen POC (≈1–5 GB) | ✅ | ✅ |

**Verdikt:** libSQL/SQLite als Artefakt, Turso nur als Hosting des Read-Replikas für Edge-Queries.
Neon verworfen: kein lokal reproduzierbares Artefakt → wäre selbst eine zweite Wahrheit.
**Determinismus-Ehrlichkeit:** SQLite-**Rohbytes** sind nicht verlässlich reproduzierbar
(Page-Layout/Version) → Parität wird NIE auf `.db`-Bytes geprüft, sondern auf (a) der
JSON-Projektion (byte-gleich) und (b) einem kanonischen, sortierten Dump-Manifest
(Tabellen→Zeilenzahl→sha über kanonisch serialisierte Zeilen), committed als Drift-Anker.

**Validierung durch die Quelle (verifiziert 2.7.2026):** `voilaj/swiss-caselaw` selbst läuft auf
**SQLite + FTS5 + Parquet** (täglicher Voll-Rebuild mit atomic swap; MCP-Server + HF-Parquet als
Auslieferung) — der Autor des grössten CH-Rechtsprechungs-Korpus nutzt exakt diese Architektur
(Artefakt · Volltext-Engine · Rebuild-Swap). Unabhängige Bestätigung der Wahl; kein Postgres/DuckDB.

## 3. Kanonisches Datenmodell (schema.sql-reif; ersetzt die frühere Schema-Skizze)

> **Ersetzt die frühere «Schema-Skizze (IDs = bestehende Keys, additiv)» (Fundament-Plan §1, 3.7.2026).**
> Die alte Feld-Skizze geht hier vollständig auf — dieselben Entitäten (`erlasse`/`artikel`/`entscheide`/
> `zitat_kanten`/`norm_kanten`/`materialien`/`verwaltungsverordnung`/`erlass_fassungen`/FTS), nur
> schema.sql-reif ausformuliert und um die Match-Key-Kanten korrigiert (Gegenprüfung 3.7.2026). IDs =
> bestehende Keys (`erlass.key`, `entscheid.id`), Feldnamen = 1:1 der bestehenden TS-Interfaces
> (`NormSnapshot`/`EntscheidSnapshot`/`MaterialRegistereintrag`) — kein Design-Delta bei den Entitäten,
> nur bei den Kanten. **Zwei Invarianten der Alt-Skizze gelten unverändert fort:** (i) keine Personen-
> Felder (Anonymisierungs-Invariante aus `FAHRPLAN-RECHTSPRECHUNG.md` §9.2) · (ii) jede Inhalts-Tabelle
> trägt §7 (a)–(d) als Spalten + die sichtbaren **Fundstelle-Felder** je Doktyp (`sr`, `bge_referenz`/
> `ecli`, BBl-/AS-`fundstelle`) für die Zitierung (§0-Transparenz).

### 3.1 Entitäts-Tabellen

```sql
-- ERLASSE: Identität, versionslos. §7 a–d hängt an der Fassung, nicht hier.
CREATE TABLE erlasse (
  key          TEXT PRIMARY KEY,         -- 'OR', 'ZH-PBG', … (bestehende Register-Keys)
  ebene        TEXT NOT NULL,            -- 'bund' | 'kanton'
  kanton       TEXT,                     -- NULL bei Bund
  sr           TEXT,                     -- Fundstelle Bund: SR-Nummer
  abkuerzung   TEXT NOT NULL,
  titel        TEXT NOT NULL,
  rechtsgebiet TEXT NOT NULL,            -- bestehende Rechtsgebiet-Achse
  status       TEXT NOT NULL             -- 'snapshot' | 'pdf-embed' | 'nur-live-link' (ErlassStatus)
);

-- ERLASS_FASSUNGEN: DIE Historie-Tabelle («was galt an Datum X»). EIN Modell,
-- kein paralleler Revisions-Sidecar (Vereinheitlichung mit Fedlex-Portfolio Paket 5, §4.4).
CREATE TABLE erlass_fassungen (
  erlass_key     TEXT NOT NULL REFERENCES erlasse(key),
  fassungs_token TEXT NOT NULL,          -- Fedlex-Konsolidierungs-Token / LexWork version_uid
  gueltig_von    TEXT NOT NULL,          -- ISO-Datum (jolux:dateEntryInForce)
  gueltig_bis    TEXT,                   -- NULL = geltende Fassung
  stand          TEXT NOT NULL,          -- §7(a)
  quelle_url     TEXT NOT NULL,          -- §7(b), ELI-URL mit Datum
  as_fundstelle  TEXT,                   -- AS-Nr. der Änderung (historicalId)
  abgerufen      TEXT NOT NULL,
  sha            TEXT NOT NULL,
  PRIMARY KEY (erlass_key, fassungs_token)
);
-- Schema-Rückkopplung Paket 5 / W2·6-REV (§0b Regel 4, 10.7.2026): die «Änderungen /
-- Revisionen»-Timeline (Fedlex Pfad (b): oc-Änderungserlasse je SR) ist die Vor-E1-
-- Übergangsform als File-Sidecar public/normtext/revisionen/<KEY>.json. Zielsenke ist
-- GENAU DIESE Tabelle `erlass_fassungen` (§5 «nie zwei Wahrheiten»; KEIN separates
-- `erlass_revisionen`): je oc-Erlass eine Fassungs-Zeile mit gueltig_von=dateEntryInForce,
-- as_fundstelle=«AS <jahr> <num>» (aus der oc-URI abgeleitet, da jolux:historicalId am
-- oc-Knoten leer ist — POC 10.7.). Zusatz-Felder, die der Sidecar heute trägt und die E1
-- ergänzen muss: `botschaft_key` (ocUri-Join zu materialien, Finding 1), `nicht_konsolidiert`
-- (dateEntryInForce > Korpus-Stand, Finding 4), `art` ('aenderung'|'sammelerlass-marker' für
-- Mantelerlass-Lücken aus dem Pfad-(a)-Cross-Check). Beim E1-Flip nur den Writer umhängen.

-- ARTIKEL: hängt an einer Fassung. bloecke_json = exakt heutige NormSnapshot.bloecke-Form
-- (Projektion = Re-Serialisierung, byte-gleich; kein Feld-Remapping).
CREATE TABLE artikel (
  erlass_key     TEXT NOT NULL,
  fassungs_token TEXT NOT NULL,
  art_id         TEXT NOT NULL,          -- 'art_41', 'disp_u1_art_1', 'annex_…'
  artikel        TEXT NOT NULL,          -- Anzeige-Nummer '41', '52bis'
  marg           TEXT,
  bloecke_json   TEXT NOT NULL,
  sha            TEXT NOT NULL,          -- trägt auch die Umzugs-Erkennung (§3.3)
  PRIMARY KEY (erlass_key, fassungs_token, art_id),
  FOREIGN KEY (erlass_key, fassungs_token) REFERENCES erlass_fassungen(erlass_key, fassungs_token)
);

-- ENTSCHEIDE: unveränderlich, keine Historie (§0 bestätigt).
-- NEU (Gegenprüfung): normalisierte Match-Keys ALS SPALTEN + Indizes — der Resolve-Pass (§3.1/§5 E4)
-- wird damit indexierter Equi-Join statt O(n·m)-Stringmatching über 8,7M×991k.
CREATE TABLE entscheide (
  id            TEXT PRIMARY KEY,        -- bestehender kanonischer Key
  ecli          TEXT,                    -- Fundstelle 1
  ecli_key      TEXT,                    -- normalisiert (Kleinschreibung, ohne Trenner-Varianz)
  gericht       TEXT NOT NULL,
  kanton        TEXT,
  nummer        TEXT NOT NULL,           -- Dossier-/Geschäftsnummer, Fundstelle 2
  bge_referenz  TEXT,                    -- 'BGE 150 III 423' (Anzeige-Form)
  bge_key       TEXT,                    -- normalisiert '150-III-423' (Match-Form)
  datum         TEXT NOT NULL,
  sprache       TEXT NOT NULL,
  leitcharakter INTEGER NOT NULL DEFAULT 0,
  kuratierung   TEXT NOT NULL,           -- 'kuratiert' | 'maschinell' (§8-Status-Marker)
  regeste_json  TEXT,
  abschnitte_json TEXT,                  -- lineare Abschnitte (regeste/sachverhalt/erwaegung/dispositiv)
  quelle        TEXT NOT NULL,           -- 'bger.ch' | 'voilaj-parquet' | …
  quelle_url    TEXT NOT NULL,           -- amtlicher Live-Link, §7(b)(c)
  abgerufen     TEXT NOT NULL,
  sha           TEXT NOT NULL
);
CREATE INDEX ix_entscheide_ecli  ON entscheide(ecli_key);
CREATE INDEX ix_entscheide_bge   ON entscheide(bge_key);
CREATE INDEX ix_entscheide_datum ON entscheide(gericht, datum);

-- SOFT-LAW: Materialien + Verwaltungsverordnungen in EINER Tabelle. Der bestehende Code
-- (src/lib/materialien/typen.ts) führt beide BEREITS in einem Schema (MaterialRegistereintrag,
-- doktyp 'kreisschreiben' = 1 von 11 Werten) — die DB folgt dem Code, nicht der E6-Prosa.
-- (Entschieden, keine Council-Weiche mehr — Begründung §10.)
CREATE TABLE soft_law (
  id         TEXT PRIMARY KEY,
  kategorie  TEXT NOT NULL,              -- 'material' | 'verwaltungsverordnung'
  doktyp     TEXT NOT NULL,              -- 'botschaft' | 'kreisschreiben' | 'vernehmlassung' | …
  behoerde   TEXT NOT NULL,              -- 'Bundesrat' | 'ESTV' | 'FINMA' | …
  titel      TEXT NOT NULL,
  fundstelle TEXT,                       -- BBl-/AS-Fundstelle bzw. KS-Nummer (§0-Transparenz)
  stand      TEXT NOT NULL,
  quelle_url TEXT NOT NULL,
  abgerufen  TEXT NOT NULL,
  sha        TEXT
  -- E6b-Rückkopplung (Fedlex-Portfolio Paket 3, W3·11, gebaut 10.7.2026): Vernehmlassungen
  -- (doktyp='vernehmlassung', behoerde='BUND') tragen additiv den mutablen Verfahrens-Zustand.
  -- Vor E1 als Datei-Feld MaterialRegistereintrag.vernehmlassung{status,fristStart,fristEnde,projEli};
  -- ab E6b als Spalten: vern_status TEXT, frist_start TEXT, frist_ende TEXT, proj_eli TEXT.
  -- Currency-Arbiter bleibt check:vernehmlassungen-netz + Offline-Assertion laufend&&fristEnde<heute.
);

-- FTS5 (external content, unicode61 remove_diacritics 2) — hot/cold-Split §11.5:
CREATE VIRTUAL TABLE fts_artikel USING fts5(text, content='artikel', tokenize='unicode61 remove_diacritics 2');
CREATE VIRTUAL TABLE fts_entscheide_schaufenster USING fts5(…);  -- kuratiert, edge-replika-fähig
CREATE VIRTUAL TABLE fts_entscheide_masse USING fts5(…);         -- server-only, NIE embedded
```

**Ein geteiltes TS-Modul `normalisiere-zitat.ts`** (neu, klein) definiert die Match-Key-Kanonisierung
(Whitespace, Interpunktion, Trenner, bis/ter-Suffixe) EINMAL — Adapter, Bulk-Pfad und Resolve-Pass
importieren dieselbe Funktion. Ohne diese eine Wahrheit divergieren Schreib- und Match-Seite (genau die
vom Rohstring-UNIQUE gerissene Falle, s. §3.2). **`erlass_fassungen` ist DAS Historie-Modell**
(Konflikt-Auflösung mit `FAHRPLAN-FEDLEX-PORTFOLIO.md` Paket 5 nach der §5-Doktrin «nie zwei Wahrheiten»:
der dortige Sidecar `revisionen/<KEY>.json` ist nur zulässige Übergangslösung — schreibt ab E1 in
`erlass_fassungen`, Sidecar wird Projektion; Fundstellen-Rohstoff jolux:dateEntryInForce / AS-historicalId
ist deckungsgleich und speist zusätzlich die Stabilitäts-Messung §3.3).

### 3.2 Verzahnungs-Kanten (das Rückgrat)

**Entschieden: EIN generischer Referenz-Typ `norm_referenzen`** (verallgemeinert und ersetzt das frühere
`norm_kanten` der Alt-Skizze) **statt drei Doktyp-Tabellen.** Das «Was betrifft Art. X»-Panel — der
Nordstern-Anker — bleibt EIN Query über alle Doktypen; jeder neue Doktyp (E6, künftige) ist eine neue
`quelldok_typ`-Ausprägung, kein Schema-Umbau. Kosten ehrlich: keine DB-FK auf `quelldok_id` → Integrität
wird App-Invariante in `check:datenhaltung` (keine Orphans je Typ). Der Code folgt bereits diesem Muster
(`MaterialRegistereintrag`); Bestätigung, keine offene Weiche (§10).

**Korrektur (Gegenprüfung): normalisierter Match-Key in den UNIQUE-Key, Rohstring als Nebenspalte.** Der
Rohstring variiert bei maschineller Masse minimal (Whitespace/Punkt/Umbruch) — mit `roh_zitat` im UNIQUE
explodiert die Tabelle in Quasi-Duplikate und der Idempotenz-Anker ist wertlos. Der Rohstring bleibt
trotzdem IMMER persistiert (Audit + Re-Resolve), nur nicht identitätsstiftend.

```sql
-- Norm ↔ (Entscheid | Material | VerwVO) — verallgemeinert das frühere norm_kanten
CREATE TABLE norm_referenzen (
  id           INTEGER PRIMARY KEY,
  quelldok_typ TEXT NOT NULL,            -- 'entscheid' | 'material' | 'verwaltungsverordnung'
  quelldok_id  TEXT NOT NULL,
  erlass_key   TEXT NOT NULL,            -- VERSIONSLOS (Regel 1, mit Umzugs-Gate §3.3)
  artikel      TEXT,                     -- '41', '52bis'; NULL = nur Erlass-Ebene
  zitat_key    TEXT NOT NULL,            -- normalisierter Match-Key (normalisiere-zitat.ts)
  roh_zitat    TEXT NOT NULL,            -- Originalstring, Nebenspalte (Audit + Re-Resolve)
  konfidenz    TEXT NOT NULL,            -- 'regex-hoch' | 'regex-niedrig' | 'unresolved'
  quelle       TEXT NOT NULL,            -- 'maschinell' | 'kuratiert' | 'amtlich' (§8)
  UNIQUE (quelldok_typ, quelldok_id, erlass_key, artikel, zitat_key)
);
CREATE INDEX ix_normref_norm ON norm_referenzen(erlass_key, artikel);   -- «was betrifft Art. X»
CREATE INDEX ix_normref_dok  ON norm_referenzen(quelldok_typ, quelldok_id);

-- Entscheid ↔ Entscheid (Zitat-Graph)
CREATE TABLE zitat_kanten (
  id             INTEGER PRIMARY KEY,
  von_id         TEXT NOT NULL REFERENCES entscheide(id),
  nach_id        TEXT,                   -- NULL = (noch) nicht im Korpus auflösbar
  ziel_key       TEXT NOT NULL,          -- normalisierter Match-Key ('150-III-423' | ECLI-Key)
  nach_zitierung TEXT NOT NULL,          -- Rohstring 'BGE 140 III 16', Nebenspalte
  konfidenz      TEXT NOT NULL,
  quelle         TEXT NOT NULL,
  UNIQUE (von_id, ziel_key)              -- Idempotenz-Anker für Re-Resolve
);
CREATE INDEX ix_zitat_von        ON zitat_kanten(von_id);
CREATE INDEX ix_zitat_nach       ON zitat_kanten(nach_id);
CREATE INDEX ix_zitat_unresolved ON zitat_kanten(ziel_key) WHERE nach_id IS NULL;  -- Resolve-Pass-Arbeitsindex

-- MATERIALISIERTES RANKING (Korrektur, Gegenprüfung): das In-degree-«gewicht» je
-- (erlass_key, artikel, entscheid) wird vom Enrichment-Pass SERVERSEITIG berechnet und hier
-- materialisiert. Die Edge liest EINE Tabelle in EINER DB — nie Cross-DB-ATTACH zur Laufzeit.
CREATE TABLE norm_rangliste (
  erlass_key   TEXT NOT NULL,
  artikel      TEXT,
  entscheid_id TEXT NOT NULL,
  gewicht      INTEGER NOT NULL,
  PRIMARY KEY (erlass_key, artikel, entscheid_id)
);
```

> **Enum-Nachtrag (E6a·M0, FAHRPLAN-MATERIALIEN-VERZAHNUNG §2.1):** `'amtlich'` ergänzt durch E6a (serverseitige amtliche Anker/Systematik — z. B. Fedlex-`#art_N`-Anker in ESTV-MWST-Ziffern, amtliche SECO-Dateinamen-Systematik), zusätzlich zu `'maschinell' | 'kuratiert'`.

**Drei festgezogene Kanten-Regeln:**

1. **Kanten sind versionslos** (`erlass_key+artikel`, kein `fassungs_token`): 11,9M Kanten bei jeder
   neuen Erlass-Fassung umzuschreiben ist nicht tragbar. «Welche Fassung galt am Entscheiddatum» wird zur
   Renderzeit über `erlass_fassungen` + Entscheiddatum aufgelöst. Aber: die Stabilitäts-Annahme wird
   gemessen statt behauptet, und Artikel-*Umzüge* werden explizit gegated — §3.3. Versionslos bleibt
   richtig; ungegated versionslos wäre eine stille Zwei-Wahrheiten-Quelle gewesen.
2. **Rohstring immer behalten** (`roh_zitat`/`nach_zitierung`): beim gestaffelten Import (E3→E5, nie
   Big-Bang) ist Auflösung zwingend unvollständig; ohne Rohstring kann ein späterer Import das Zitat nie
   nachziehen. Der Graph muss sich selbst heilen können. Identität trägt aber der Match-Key, nie der
   Rohstring.
3. **Konfidenz ehrlich tragen** (§8): voilaj selbst löst nicht alles auf. `unresolved` ist ein legitimer
   Zustand, nie wegglätten; Auflösungsquote wird Tor-Metrik (§4).

**Vorhandener Rohstoff:** `scripts/normtext/adapter-entscheide.ts` (Z. 345–426) berechnet
`zitierteNormen`/`normKeys`/`zitierteEntscheide` bereits per Regex — für die Kanten-Tabellen ist kein
neuer Extraktions-Code nötig, nur ein anderer Schreibpfad (Tabellenzeile statt JSON-Array) plus die
Kanonisierung aus `normalisiere-zitat.ts`. Die Embedded-Arrays in den Entscheid-JSONs bleiben als
Projektion für das Schaufenster unverändert (Byte-Parität).

### 3.3 Dreistufiger Fassungs-Diff (Umzugs-Gate zur Versionslos-Regel)

Versionslose Kanten (§3.2 Regel 1) sparen die 11,9M Umschreibungen je Fassung, dürfen aber keine *stillen*
Zwei-Wahrheiten erzeugen, wenn ein Artikel umzieht (Inhalt verschoben, Nummer formal weiter existent —
OR/ZGB-Renumerierungen, bis/ter). Darum bei jedem neuen `erlass_fassungen`-Eintrag ein dreistufiger Diff
(die `artikel.sha`-Spalte trägt Stufe 2 gratis):

1. **Verschwundene `art_id`s** → betroffene Kanten auf `konfidenz='regex-niedrig'` + Report (wie bisher).
2. **Inhaltlich veränderte Artikel** (sha-Diff alt↔neu je `art_id`) → betroffene Kanten in einen
   **Umzugs-Report**; das Panel rendert für solche Kanten den §8-Hinweis «zitiert Fassung vom
   ‹Entscheiddatum›» statt stillschweigender Gegenwarts-Suggestion (Renderzeit-Logik über
   `erlass_fassungen` — keine Kanten-Umschreibung, das Versionslos-Prinzip bleibt).
3. **Stabilitäts-Messung statt Behauptung (E1):** «Artikelnummern weit überwiegend stabil» wird empirisch
   beziffert (Anteil `art_id`s stabil/verändert/verschwunden über die letzten N Revisionen von OR/ZGB/StGB;
   Rohstoff = Fedlex-Portfolio-Paket-5-Historie). Liegt die Umzugsquote materiell höher als angenommen, ist
   eine kleine kuratierte `artikel_umzuege`-Mapping-Tabelle (alt→neu je Fassungswechsel) der benannte
   Eskalationspfad — als Option dokumentiert, nicht vorab gebaut (Überbau-Verbot).

## 4. Tore

- **`check:paritaet`** (neu, offline, in `check`-Kette): erzeugt die Projektion frisch aus
  den `daten/*.db`-Artefakten (je Doktyp, §2.2) und vergleicht **byte-gleich** gegen die committeten
  `public/{normtext,rechtsprechung,materialien}/**/*.json`. In E0/E1 zusätzlich Doppellauf:
  alter Direktpfad vs. DB-Projektion byte-gleich. Exit 1 bei jedem Byte-Diff.
- **`check:datenhaltung`** (Drift): committetes Dump-Manifest == frisch berechnet; Tabellen-
  Invarianten (Zeilenzahlen ≥ Projektion, keine Orphans, §7-Spalten non-null, ECLI-Form).
  **Ergänzt 3.7.2026 (Fundament-Plan §7.2) — vier neue Invarianten:**
  1. **Auflösungsquoten-Baseline** — Anteil `zitat_kanten` mit `nach_id NOT NULL` + Anteil
     `norm_referenzen` mit `konfidenz != 'unresolved'`, je als committete Baseline im Dump-Manifest;
     sinkt die Quote unter Baseline → rot (der Enrichment-Pass kann nicht still veralten, §5 E4).
  2. **Kanten-Orphans je Typ** — `norm_referenzen.quelldok_id` ohne Ziel-Dokument bzw.
     `zitat_kanten.von_id` ohne Entscheid = rot (ersetzt die fehlende DB-FK auf `quelldok_id`, §3.2);
     zusätzlich Match-Key-Befüllung (`ecli_key`/`bge_key`/`zitat_key`/`ziel_key` non-null wo erwartet).
  3. **Fassungs-Diff (verschwunden UND umgezogen via sha)** — bei jedem neuen `erlass_fassungen`-
     Eintrag der dreistufige Diff aus §3.3 (verschwundene `art_id`s → `regex-niedrig`; sha-veränderte
     `art_id`s → Umzugs-Report); ein nicht abgearbeiteter Umzugs-Report ist rot.
  4. **«ATTACH nur im Läufer»** — Grep über den API-/Edge-Code (`api/**`): kein Cross-DB-`ATTACH` im
     Lesepfad; jede Laufzeit-Query trifft genau EINE DB-Datei (§1 Partitionierung). Verletzung = rot.
- **Bestehende Tore bleiben Arbiter:** `check:normtext`, `check:entscheide` (+BUDGET für die
  committete Projektion), `check:fedlex-versionen`, `check:invarianten`, `golden:vergleich`
  (golden pinnt weiterhin die Inhalts-shas — DB ändert daran NICHTS).
- **`check:perf-budget` = Abnahme-Kriterium** jeder Etappe mit UI-Anteil (Edge-Suche/Long-Tail
  dürfen den kritischen Pfad nicht belasten; lazy, §15).
- **Abnahme-Posten «Vercel-Grenzen» (verifiziert 3.7.2026, Fundament-Plan §2.1):** der
  Schaufenster/Masse-Split ist von zwei harten Vercel-Wänden **erzwungen**, nicht gewählt — jede
  Etappe mit Prerender-/Edge-Anteil misst gegen sie: **16 000 Build-Output-Dateien** hart (Prerender-
  für-alles unmöglich; heute 56 Routen, Luft bis ~10k — Schaufenster bleibt im Zehntausender-Bereich)
  · **4,5 MB Function-Payload** hart (Edge-API `api/suche`/Long-Tail muss ab E2 paginieren/streamen,
  sonst reisst eine Bulk-Trefferliste mit vollem `abschnitte_json` mit 500). Grenzüberschreitung im
  Payload-Grenz-Test (bewusst grosse Antwort → paginiert, nie 500) ist ein E2-DoD.
- Risiko-Pfad-Globs in `scripts/gegenpruefung/kern.ts` um `scripts/datenhaltung/**` +
  `daten/**`-Manifest erweitern (Extraktion/Projektion = Risiko-Pfad, QS-GP Pflicht), sowie
  **`scripts/materialien/**` + `public/materialien/*.json`** (E6b-Adapter = derselbe Risikotyp
  Extraktion; Lücke live gegen `kern.ts` Risiko-Prädikat verifiziert 3.7.2026). **Stand 3.7.:
  `scripts/datenhaltung/**` + `daten/**` + `daten-manifest.json` + `scripts/normtext-snapshot.ts`
  ERLEDIGT mit E1 (`kern.ts`, Test in `gegenpruefung.test.ts`); `scripts/materialien/**` +
  `public/materialien/*.json` bleibt offen (kommt mit E6b).**

## 5. Etappen (jede mit Tor; nie Big-Bang)

> **Vertieft 3.7.2026 (Fundament-Plan §5/§6/§7.3).** Jede Etappe trägt jetzt **TOR/DoD explizit**,
> so dass eine frische Opus-Session autonom Schritt für Schritt bauen kann. Die ursprünglichen
> Etappen-Definitionen bleiben je Bullet vollständig stehen; die «Vertiefung»-Blöcke sind additiv.
> **Import-Reihenfolge (§6, bindend)** gibt die Sequenz vor; Regel: strukturiert/homogen/klein zuerst,
> PDF-lastig/heterogen/gross zuletzt, nie zwei 26×-Assets parallel.

- **E0 · Fundament + Reverse-Befüllung (golden-neutral).** `scripts/datenhaltung/{schema.sql,
  ingest.ts, projektion.ts, check-paritaet.ts}`; DB wird aus den **bestehenden committeten
  JSONs** befüllt (JSON→DB→JSON-Roundtrip). DoD: `check:paritaet` grün über alle Dateien;
  kein anderes Tor berührt. Aufwand M.
  - **[x] TEIL-ERLEDIGT 2.7.2026 (PR #80/81, `ad065c03`, main):** Bund-Normtext (218 Dateien)
    byte-gleich DB↔JSON, `check:paritaet` grün in der Gate-Kette, doppelt verifiziert.
  - **Vertiefung → «E0+» (Ausdehnung, nächster Bau-Schritt; TOR/DoD explizit):**
    1. **`schema.sql` legt JETZT die vollständigen Ziel-Tabellen an** (§3: `erlasse`,
       `erlass_fassungen`, `artikel`, `entscheide` inkl. `ecli_key`/`bge_key`-Match-Spalten + Indizes,
       `soft_law`, sowie die **leeren** `norm_referenzen`/`zitat_kanten`/`norm_rangliste` + Match-Key-
       Spalten). Leere Tabellen kosten nichts; eine Nachmigration bei 11,9M Zeilen ist teuer. Blob-
       Tabellen laufen parallel bis E1. **Partitionierung ab JETZT (§1/§2.2, kein Nachmigrations-
       Risiko): E0+ schreibt direkt je Doktyp** — `daten/normtext.db` · `daten/rechtsprechung.db` ·
       `daten/soft-law.db`; das E0-Einzelartefakt `daten/lexmetrik.db` entfällt ersatzlos
       (gitignored, Neuerzeugung billig — genau darum wird jetzt umgestellt, nicht später).
    2. **`normalisiere-zitat.ts` entsteht hier** (klein, testbar OHNE DB) — die eine Match-Key-
       Kanonisierung für Adapter, Bulk-Pfad und Resolve-Pass (§3.1).
    3. **Reverse-Ingest ausdehnen** (`ingest.ts` heute Bund-only): Kanton-Normtext (1231 Erlass-JSONs;
       mit `index.json` = 1232 committete Dateien, empirisch belegt 3.7.2026 gegen
       `public/normtext/kanton/`),
       bereits committet — **kein 26×-Slot**: Leitprinzip 4 meint neuen Massenimport, nicht Reverse-
       Befüllung committeter Daten) → Rechtsprechung (Zahl aus `register.json` nehmen) →
       `register.json`/`norm-index.json` (Trailing-Newline-Falle nachbilden) → Materialien;
       `check:paritaet`-Allowlist erweitern.
    - **TOR/DoD E0+:** `check:paritaet` grün über ALLE Dateiklassen (inkl. Trailing-Newline-
      Nachbildung); Unit-Tests der Kanonisierung grün; kein anderes Tor berührt (golden-neutral).
      Erst dann ist E0 komplett und E1 startklar. Mikro-Stand `BACKLOG-AUDIT-WERKZEUGE-2026-07.md`
      §DB-Strang.
- **E1 · Generator-Flip.** `normtext-snapshot.ts`/`normtext-entscheide.ts` schreiben Zeilen in
  die DB, Projektion erzeugt `public/*.json`; ≥3 Doppelläufe (alter Pfad vs. Projektion)
  byte-gleich, dann alter Direkt-Schreibpfad entfernt (eigener §6-Schritt). Ab hier gilt §7
  Build-Regel 6 bindend. Risiko-Pfad ⇒ Gegenprüfung. Aufwand M.
  - **Vertiefung (TOR/DoD explizit):** Flip **direkt auf das Spalten-Zielschema** (§3), kein
    Zwischen-Umbau. `erlass_fassungen` wird ab hier von den Adaptern befüllt (Historie-
    Vereinheitlichung §3.1/§4.4 vorher entschieden). **Neu: Artikel-Stabilitäts-Messung (§3.3
    Stufe 3) läuft als Report mit** (Anteil `art_id`s stabil/verändert/verschwunden über die
    letzten N OR/ZGB/StGB-Revisionen). **TOR/DoD:** ≥3 Doppelläufe byte-gleich; `check:datenhaltung`
    (Dump-Manifest) neu grün; Stabilitäts-Report liegt vor; `check:gegenpruefung` bestanden.
  - **[x] ERLEDIGT 3.7.2026 (Bund-Erlasse) — PR `feat/qs-data-e1-flip`. VORBEHALT: der alte
    Direkt-Schreibpfad (`stabelesJson`) bleibt bestehen — er läuft als Doppellauf-Wächter
    parallel zur Projektion; sein Entfernen ist ein eigener §6-Schritt (nächster Bau).**
    Umgesetzt: (1) `scripts/datenhaltung/erlass-rows.ts` — EINE Wahrheit `schreibeErlass()`
    (NormSnapshot[] → Zeilen in `erlasse`/`erlass_fassungen`/`artikel`, Spalten-Weg) +
    `projiziereErlass()` (Zeilen → byte-gleiche `public/*.json`-Form). Schema-Zusatz an `artikel`:
    `ord`/`artikel_label`/`grundlage`/`quelle_url` (die Anzeige-Spalten, die §3-Skizze auf die
    Projektion hin ergänzt — sonst keine Byte-Parität). (2) Generator-Flip `normtext-snapshot.ts`
    (Bund-Loop): schreibt Zeilen in eine in-memory-Ziel-DB, `public` kommt aus der **Projektion**,
    ein Wächter bricht bei `projektion ≠ direktpfad` hart ab. (3) Reverse-Ingest `ingestNormtextZiel`
    füllt `daten/normtext.db` (durabel) + speist Dump-Manifest. (4) Tor **`check:datenhaltung`**
    (Manifest-Determinismus + Drift gegen committetes `daten-manifest.json` + Invarianten: keine
    Orphans, §7-Spalten non-null, «ATTACH nur im Läufer»). (5) Stabilitäts-Report
    `bibliothek/register/stabilitaets-report-2026-07-03.md` (ehrliche Grenze: EINE Fassung je Erlass
    → nur Struktur-Basis messbar). **Byte-Beweis:** 3 Doppelläufe (Reverse-Ingest-Weg, ohne Netz,
    ohne public-Änderung) alt==neu==committet byte-gleich über 218 Erlasse / 24858 Artikel, Gesamt-sha
    stabil. `check:paritaet` unverändert 1796, golden byte-gleich, `check:gegenpruefung` bestanden.
    **Kanton-Normtext + Rechtsprechung/Materialien bleiben (noch) Blob-Weg** (nicht in diesem Slot).
  - **[x] ERLEDIGT 3.7.2026 — E1-Rest A (alter Direkt-Schreibpfad entfernt, §6-Schritt) + Nebendateien-
    Ingest, Branch `feat/qs-data-e1-rest`.** Vorbedingung «≥3 grüne Doppelläufe» war erfüllt (E1-Karte).
    (A) Der Bund-Loop (`normtext-snapshot.ts`) schreibt `public/normtext/bund/*.json` jetzt
    AUSSCHLIESSLICH aus der DB-Projektion (`projiziereErlass`); der `stabelesJson`-Direktweg für diese
    Dateien und der inline-`projJson≠direktJson`-Abbruch sind entfernt (die DB ist die EINE Wahrheit,
    §5/§7 Build-Regel 6). `doppellauf.ts` auf den load-bearing Vergleich **«Projektion == committet»**
    umgebaut; die frühere «alter Direktpfad»-Referenz ist ehrlich als historisch dokumentiert (mit einer
    billigen Zweitkontrolle «committet ist bereits kanonisch»). Verhaltensneutral: der Generator erzeugt
    byte-gleiche Dateien (der non-empty-Zweig schrieb schon vorher `projJson`; entfernt wurde nur der
    Abbruch-Wächter, nie ein Schreibweg). **Byte-Beweis ohne `public/**`-Diff:** 3 Doppelläufe
    Projektion==committet über 218 Erlasse / 24858 Artikel, Gesamt-sha `62d7e4f0…` stabil. (B)
    **Nebendateien-Ingest (Paritäts-Vollabdeckung):** `confidence.json` · `kanton-systematik.json` ·
    `pdf-index.json` (3) + `struktur/**` (1135, Bund+Kanton) neu im `dokument`-Byte-Roundtrip → jede
    committete `public/normtext/**/*.json` hat jetzt eine Paritäts-Klasse (`public/rechtsprechung/**`
    war schon vollständig). `check:paritaet` **1796 → 2934** (neue Klassen `Normtext-Seitendateien 3` ·
    `Normtext-Struktur 1135`); `daten-manifest.json` regeneriert (normtext.db `dokument` 2→1140). Alle
    Tore grün (golden byte-gleich 201, `check:datenhaltung`, tsc/lint/test 3040/build 57 Routen,
    `check:plan`); **adversariale Gegenprüfung bestanden** (unabhängiger Opus-Durchgang: keine
    Schreibpfad-Divergenz in irgendeinem Pfad, Paritäts-Vollabdeckung enumeriert). **Offen bleibt
    E1-Rest B** (Kanton-Normtext-Flip; späterer Schritt) + `scripts/materialien/**`-Globs (mit E6b).
  - **[x] ERLEDIGT 3.7.2026 — E1-Rest B (Kanton-Normtext-Flip), Branch `feat/qs-data-e1-rest-b`.**
    Die vier Kanton-Loops (`erzeugeKantonsSnapshots`/`erzeugeHtmSnapshots`/`erzeugeZhPdfSnapshots`/
    `erzeugePdfSnapshots` in `normtext-snapshot.ts`) schreiben `public/normtext/kanton/*.json` jetzt
    AUSSCHLIESSLICH aus der DB-Projektion (`flipKantonErlass` in `generator-flip.ts` →
    `schreibeErlass`/`projiziereErlass`); der `stabelesJson`-Direktweg ist in allen vier Loops
    entfernt (dynamischer Import wie beim Bund-Flip → vitest lädt nie `node:sqlite`).
    **Feld-Mapping-Entscheid SCHLÜSSEL ≠ QUELLE (in `erlass-rows.ts` dokumentiert, EINE Datei, keine
    zweite Wahrheit):** erlasse-PK `key` = Dateiname-Stamm == Register-PK (`AG-291.150`, Bindestrich);
    byte-tragende `NormSnapshot.quelle` (2. id-Segment) = Kantonskürzel (`AG`) == Spalte
    `erlasse.kanton`; `art_id` = alles nach `kanton/AG/` (mit Schrägstrich, `291.150/art_4` — Bund
    bleibt `art_11`); `fassungs_token` = LexWork `version_uid` bzw. `quelleHash` (HTM/ZH/PDF), wie im
    Snapshot; Kanton-Randtitel `titel` → Spalte `marg` → Projektion exakt zwischen `artikelLabel`
    und `bloecke` (Bund nutzt dieselbe Position exklusiv für `grundlage` — der ebenenweise
    Ausschluss ist empirisch über alle 1449 Dateien belegt; Bund-Bytes unverändert, da key==quelle).
    `ingestNormtextZiel` reverse-ingestet jetzt Bund UND Kanton (Identität aus dem committeten
    Register, §5 SSoT); der Blob-Reverse-Ingest läuft parallel weiter (Entfernen = späterer Schritt).
    **Byte-Beweis ohne `public/**`-Diff:** `doppellauf.ts` auf Bund+Kanton erweitert (netzfreier
    Reverse-Weg: committete JSONs → Ziel-Tabellen → Projektion, derselbe Codepfad wie der Generator;
    kein Erlass ausgeklammert — alle 1231 Kanton-Dateien im Lauf) — **3 Läufe Projektion==committet
    über 1449 Dateien (Bund 218 · Kanton 1231) / 55244 Artikel, Gesamt-sha stabil `bd22118d…`**;
    p-limit(4)-Nebenläufigkeit widerlegt als Einflussgrösse (betrifft nur Fetches; Projektion liest
    `ORDER BY ord`, DB-Schreibreihenfolge über Dateien hinweg ist für die Per-Datei-Bytes unsichtbar).
    `daten-manifest.json` regeneriert: erlasse/erlass_fassungen 218→**1449**, artikel 24858→**55244**.
    Tore grün (`check:paritaet` **2953 unverändert** · `check:datenhaltung` [0 Orphans, §7-Spalten
    non-null auch Kanton, Manifest 2× deterministisch] · golden 201 byte-gleich · tsc/lint/
    test 3071 [+6 Kanton-Flip-Tests: Bindestrich-Schlüssel FR-…-de/TI-ti-…, marg-Position,
    quelle≠kanton-Wächter]/build 1449 Erlass-Seiten · `check:plan` · `check:normtext` offline);
    **adversariale Gegenprüfung bestanden** (unabhängiger Opus-Durchgang: `diff -r`
    Projektion==committet EXIT 0 in beide Richtungen auch gegen die echten `public/`-Dateien;
    Randfälle FR-130.11-de/TI-ti-125101/BS-111.100/AG-662.110-mehrspaltig/JU-PDF-Merge sauber;
    Stichprobe AG-291.150 §1/§3 gegen die amtliche LexWork-API inhaltstreu, live-`version_uid` ==
    `fassungsToken`). **Offen bleibt nur noch** `scripts/materialien/**`-Globs (mit E6b) +
    Blob-Ingest-Rückbau (nach E2-Stabilisierung).
- **E2 · POC-Scheibe + Edge-Suche.** Scheibe = **alle amtlichen BGE (Volltext in DB; committete
  Projektion bleibt nur das kuratierte Schaufenster) + alle 218 Bund-Gesetze**. Turso-Replika +
  Read-only-Edge-Funktion `api/suche` (Drosselung, kein Write-Token im Client, §8-Offenlegung
  „Suchbegriffe verlassen den Browser" analog `FAHRPLAN-ENTSCHEIDSUCHE-AUSBAU.md` §1); neue
  Treffergruppe in `universalSuche`, statischer Index bleibt Fallback. DoD: Suchtreffer-Stichprobe
  gegen amtliche Quelle gegengeprüft; perf-budget grün.
  - **Vertiefung — drei Architektur-Fixierungen VOR Bau (TOR/DoD explizit):**
    1. **hot/cold-FTS-Grenze festziehen (§11):** hot = kuratierte BGE + alle Bund-Gesetze (< 1 GB →
       Turso-Embedded-Replica edge-fähig) = der E2-POC-Zuschnitt; cold = der 58-GB-Vollkorpus-Index
       bleibt server-only.
    2. **Pagination/Streaming by design** (4,5-MB-Payload-Wand, §4) — nie Notfall-Fix.
    3. **Ein-Renderer-Leitplanke als DoD** (§11.1): Schaufenster (prerendert) und Masse (on-demand
       Edge) rendern mit **DERSELBEN Reader-Komponente** je Doktyp. Performance darf nur das **Laden**
       spalten (§15.3 lazy/off-critical-path · §15.6 on-demand bleibt inhaltsvollständig — voller Text
       im DOM/Ctrl+F, `#art_`-Anker, Print/PDF, Provenienz §7 a–d, ehrlicher Lade-/Fehlerzustand mit
       amtlichem Live-Link), **nie die Komponente** — sonst entsteht schleichend eine «abgespeckte
       Massen-Darstellung» (Logikverlust). Die künftige **Long-Tail-Route** `/rechtsprechung/:key`
       (E3, §5 E3-Block: Fallback auf on-demand-Edge-Fetch bei nicht-prerenderten Keys) MUSS dieselbe
       Reader-Komponente wie das Schaufenster mounten; ein zweiter «Massen-Reader» ist verboten.
    - **Turso erst jetzt provisionieren** (Entscheid 10.3 unverändert). **TOR/DoD:** Suchtreffer-
      Stichprobe gegen amtliche Quelle; `check:perf-budget`; Payload-Grenz-Test (bewusst grosse
      Antwort → paginiert, nie 500).
  - **E2-Vorarbeiten ✅ (W2·6-DATA, 3.7.2026, ohne Turso).** Alles gebaut, was OHNE die
    Turso-Provisionierung (David-Handschritt) geht: (1) **hot-FTS build-time** in
    `datenhaltung:build` — `fts_artikel` (external content über `artikel`, Text aus `bloecke_json`,
    24858 Zeilen) in `daten/normtext.db`; `fts_entscheide_schaufenster` (standalone, 342
    Schaufenster aus den Blob-Einträgen) in `daten/rechtsprechung.db`; Tokenizer exakt
    `unicode61 remove_diacritics 2` (diakritik-insensitiv DE/FR/IT verifiziert). `fts_entscheide_masse`
    nur als Schema-Kommentar (cold, E3). **HOT-Replika 178,41 MiB / 1024 MiB Budget → OK**
    (normtext.db 139,42 · rechtsprechung.db 38,99). FTS-Schatten empirisch bit-stabil (2 Builds
    identisch), aber aus dem Dump-Manifest **ausgeklammert** (nur Quell-Tabellen tragen den
    Determinismus-Beweis; FTS = rebuildbare, plattformabhängige Ableitung — `manifest.ts`/`tabellen()`).
    (2) **Such-Query-Modul** `scripts/datenhaltung/suche.ts` (`sucheArtikel`/`sucheEntscheide`,
    bm25 + snippet, **Pagination by design** Default-Limit 20/Max 50, Antwort NIE mit Volltext —
    nur id/titel/snippet/fundstelle) + Unit-Tests inkl. Payload-Grenz-Test (Antwort << 4,5 MB).
    (3) **`api/suche.ts`** — read-only Edge-Funktion, dependency-frei (Turso-HTTP `/v2/pipeline`),
    ohne Env-Vars **ehrlicher 503** (Client-Index bleibt Fallback, §8); Query-Logik mit (2) GETEILT
    (§5).
  - **E2-Anbindung ✅ (W2·6-DATA, 3.7.2026).** Die Edge-Suche hängt als zusätzliche §8-markierte
    Treffergruppe **«Volltext-Suche (online)»** im EINEN Suchweg (`universalSuche`), nicht als
    zweites Silo (§11.3 b): neues Modul `src/lib/suche/onlineVolltext.ts` (debounced Fetch auf
    `/api/suche?q=…&limit=10`, AbortController ~4 s, Antwort→SuchTreffer, interne URL-Bildung aus
    der Fundstelle — Artikel `/gesetze/bund/<key>#art-<artikel>` wie `artikelVolltext.ts`,
    Entscheid `/rechtsprechung/<id>` wie `entscheidGruppe`); eingebunden im geteilten Hook
    `useUniversalSuche` (fliesst dadurch in BEIDE Wrapper — Header + Hero — ohne die Wrapper
    anzufassen), §8-Offenlegung «Suchbegriffe verlassen dafür den Browser» einmalig unter dem
    Gruppentitel (`SuchResultate`). **Ehrliches Degradieren (§8):** 503/502/Netz/Timeout **und**
    200-mit-leerer-Antwort → Gruppe erscheint GAR NICHT; Feature-Detection-Cache (nach Ausfall
    ~5 min nicht erneut hämmern, dann wieder). Unit-Tests: 200/503/Netz/Timeout/<3-Zeichen +
    URL-Bildung. Manueller Beweis gegen die Prod-Edge 3.7.2026: `api/suche?q=verjaehrung` liefert
    **HTTP 200 mit leerer Antwort** (Turso provisioniert, Hot-Daten-Sync ausstehend) → die
    Degradation macht die Gruppe unsichtbar, statischer Index trägt weiter. **E2 KOMPLETT ✅
    3.7.2026 — Hot-Daten geladen + LIVE-Beweis:** Prod-`api/suche` liefert Treffer über 55 244
    Artikel (Bund+Kanton, Fedlex-Anker-Links) + 342 BGE (bger.ch-Links, Highlight-Snippets),
    Diakritik live (FTS-Smoke «verjahrung» = 158). Sync-Läufer `datenhaltung:turso-sync`
    (Voll-Rebuild Weiche C, remote contentless-FTS). *Residuum (nicht blockierend):
    `check:perf-budget`-Lauf mit aktiver Online-Gruppe + Payload-Grenz-Test gegen die echte Edge.*
- **E3 · BGer-Massen-Import (26×-Slot!).** voilaj-Parquet konsumieren (bger ~191k), Dedup
  `make_canonical_key`, `kuratierung:'maschinell'`, amtlicher bger.ch-Link je Zeile; DB-only
  (nicht nach `public/` projiziert); Long-Tail-Route `/rechtsprechung/:key` fällt bei
  nicht-erfassten Keys auf on-demand-Edge-Fetch zurück (§15.6). **Konkurriert um den freien
  26×-Slot mit W3·12 — Reihenfolge = Davids Entscheid.** = PLAN-OCL-ABBAU W12/F2.
  - **Vorbedingungen (harte Gates VOR Bau):**
    1. **[x] B2-POC inkl. Resolve-Pass-Messung (§6.2, Audit-1-B2) — ERLEDIGT 3.7.2026, VERDIKT TS**
       (`hyparquet` + `better-sqlite3`; DuckDB verworfen: Bulk 1,55× / Pipeline 1,92× < 3×, TS
       scheitert nicht — Detail §6.2 + `bibliothek/register/B2-POC-2026-07-03.md`; dort auch die
       bewährte E3-Mechanik: Row-Group-Streaming, PRAGMAs, Indizes nach Bulk, key_map-Resolve).
    2. **VPS-Angebot gegen die Posten-Tabelle (§6.3)** — reales Anbieter-Angebot (≥ 350 GB NVMe /
       ≥ 32 GB RAM), Kosten-POC, kein Bauchgefühl.
  - **Vertiefung:** `norm_referenzen` läuft MIT dem Import (entscheid-lokal, Regex schon im Adapter);
    Long-Tail-URLs sofort (Entscheid 10.2); `kuratierung='maschinell'` + amtlicher Link je Zeile.
    **TOR/DoD:** `check:datenhaltung`-Invarianten (Orphans, §7-Spalten non-null, ECLI-Form, Match-Key-
    Befüllung, OCL-Plausibilität, «ATTACH nur im Läufer»); amtliche Stichproben-Gegenprüfung;
    `check:perf-budget`.
  - **[x] LOKAL ERLEDIGT 3.7.2026 — E3-Lokal-Bau (Branch `feat/qs-data-e3-lokal`, 26×-Slot ÜBERNOMMEN).**
    Produktiver Massen-Import gebaut + verifiziert; Serving folgt separat auf dem VPS (David bestellt).
    Neue Repo-TS (alle mit der EINEN Kanonisierung `normalisiere-zitat.ts`, node:sqlite wie der
    Rest des Strangs — nicht better-sqlite3): `masse-mapping.ts` (reine Mapping-/Manifest-Bausteine
    + Unit-Tests OHNE Parquet) · `masse-schema.ts` · `masse-ingest.ts` (Row-Group-Streaming, PRAGMAs,
    GROUP-BY-Dedup, Load-then-index — B2-POC-Mechanik) · `resolve-zitate.ts` (idempotenter
    Enrichment-Pass + Quoten-Report) · `masse-invarianten.ts` (OCL-Plausibilität + Dump-Manifest).
    **Ergebnis (`daten/masse.db`, gitignored, ~5,79 GB):** entscheide **195 342** (Dedup Δ 0) ·
    zitat_kanten **8 529 050** (UNIQUE-Dedup Δ 168 014, = POC) · norm_referenzen **10 031 306**
    (Artikel-Ebene UNIQUE, Δ 1 871 698). **Auflösungsquote 0,8245** (= POC-Baseline 0,823; je
    match_type bge_bare 1,000 · bge_norm 0,993 · docket_norm 0,815 · bge_pincite 0,020). §7 non-null,
    Match-Keys befüllt, nach_id-Orphans 0. **2 Voll-Läufe → identisches Manifest** (Weiche C
    Voll-Rebuild-Determinismus). **Amtliche Gegenprüfung doppelt** (Autor 5 Stichproben + unabhängiger
    Opus-Durchgang mit eigenen Stichproben + 400/400 Kanten-Orientierungs-Proben, Verdikt BESTANDEN):
    fand + fixte zwei Anzeige-Bugs (doppeltes «BGE BGE …» ~98 % der BGE; fabrizierte Zitierform bei
    474 Docket-Müll-bge → jetzt NULL statt erfunden, §8) + dokumentierte voilaj-Quell-Quirks
    (194 bge ohne datum; ~61 % bge mit Bandjahr-Platzhalter `JJJJ-01-01` — **UI darf das nie als
    Urteilsdatum zeigen**; IVG/LAI-law-code-Kanonisierung = E4-Aufgabe). `quelle_url` =
    Parquet-`source_url` verbatim (100 % bger.ch-Domains).
    Bericht `bibliothek/register/e3-lokal-2026-07-03.md`. **OFFEN (VPS-Schritt):** Datei-rsync +
    cold-FTS `fts_entscheide_masse` (58-GB-Klasse, NICHT lokal) + Read-API + Long-Tail-Route
    `/rechtsprechung/:key` (on-demand-Edge-Fallback, §15.6) + VPS-Angebot (Vorbedingung 2).
- **E4 · Zitat-Graph.** ✅ **LOKAL FERTIG (3.7.2026, Bericht `bibliothek/register/e4-lokal-2026-07-03.md`).**
  Q4-law-code-Kanonisierung (`erlass-kanon.ts`, DE/FR/IT→`erlasse.key`, SR-belegt, Abdeckung 35,2 %→78,4 %) +
  `baue-rangliste.ts` (materialisierte topische In-degree, 1 387 680 Zeilen, max gewicht 12 413 = BGE 133 II
  249 @ BGG/106, idempotent byte-stabil, ~18 s) + **Oracle-Tor GRÜN 0 UNERKLÄRT**
  (`check-rangliste-oracle.ts`: 462 identisch/284 korrekt-erhöht/178 vintage-absent/7 erklärt-delta — jede
  Abweichung belegt). **OFFEN (nachgelagert):** UI-Panels für die Masse (braucht Edge/VPS, §15/`check:perf-budget`)
  + Läufer-Integration (`norm_rangliste`-Rebuild nach jedem `resolve-zitate`, VPS-Checkliste §9(5)). Doku unten
  bleibt als Konzept-Referenz.
- **E4 · Zitat-Graph (Konzept-Referenz).** 8,7M+11,9M Kanten in `zitat_kanten`/`norm_kanten`; topisches
  in-degree-Ranking (W3-Muster); Plausibilitäts-Checks als DB-Invarianten; UI-Panels
  (erfasst = build-time-Projektion, Masse = Edge). Ersetzt „Leitfall-Gewichte aus 342".
  - **Vertiefung — vom Einmal-Schritt zum wiederholbaren Enrichment-Pass (TOR/DoD explizit):**
    `resolve-zitate.ts`, **idempotent** über `UNIQUE(von_id, ziel_key)`, als **indexierter Equi-Join**
    (`UPDATE zitat_kanten SET nach_id = e.id FROM entscheide e WHERE nach_id IS NULL AND ziel_key IN
    (e.bge_key, e.ecli_key)`, getragen von `ix_zitat_unresolved` + `ix_entscheide_bge`/`_ecli`) — läuft
    nach JEDEM Ingest-Zyklus und schreibt anschliessend **`norm_rangliste` neu** (materialisiertes
    In-degree-Ranking, **topische In-degree, KEIN globaler PageRank** — Bestandsentscheidung aus
    `norm-index.ts` wird portiert, nicht neu konzipiert). Der Graph heilt sich selbst (Nie-Big-Bang-
    Doktrin). **Oracle-Tor:** `norm_rangliste` == heutige `gewicht`-Werte für die erfassten Entscheide
    (ausser wo mehr Korpus die Zahl korrekt erhöht). **TOR/DoD:** Auflösungsquoten-Baseline im Dump-
    Manifest (`check:datenhaltung`); Oracle-Vergleich; Resolve-Laufzeit unter POC-Rahmen; UI-Panels
    unter `check:perf-budget`.
    **Vorbedingung aus der E3-Gegenprüfung (Q4, 3.7.2026): law-code-Kanonisierung.** Die voilaj-
    `law_code`s sind mehrsprachig unkanonisiert (IVG/LAI, UVG/LAA/LAINF = derselbe Erlass als
    getrennte `erlass_key`-Zeilen in `norm_referenzen`) — VOR dem `norm_rangliste`-Rebuild braucht
    es ein Mapping law_code→Register-`erlass.key` (DE-kanonisch, FR/IT-Aliase; kleine kuratierte
    Tabelle + `normalisiere-zitat.ts`-Anbindung), sonst zersplittert das In-degree-Ranking je
    Sprache. Ebenso dort einplanen: bge_pincite-Auflösung via Band+Abteilung+Seitenbereich-Lookup
    (0,88M Kanten, E3-Quote nur 0,02) und die **Q1-Datums-Semantik** (bge-Bandjahr-Platzhalter
    `JJJJ-01-01` — jede UI/Query, die nach Entscheiddatum sortiert/filtert, muss das kennen).
- **E5 · Kantone/Erweiterung** — nachgelagert, hängt an W3·12/W11-Schema-Entscheid. **E3+E5 zusammen
  = voilaj-Vollkorpus** (BGer erste Tranche in E3, restliche Bundes-/Kantons-Gerichte hier); Ziel-
  Umfang §0.
  - **Vertiefung (TOR/DoD explizit):** Enrichment-Pass läuft erneut (Graph heilt sich); Quellen-
    Entscheid (voilaj-Parquet dünn → evtl. zweiter Adapter-Typ) erst nach E3-Erfahrung, per Messung
    (Messung vor Migration). **TOR/DoD:** wie E3 + Auflösungsquoten-Metrik darf nicht sinken.
- **E6 · Weitere amtliche Doktypen — Verwaltungsverordnungen + Materialien.** **(a)** Amtliche Praxis-Dokumente
  (ESTV/BSV/FINMA/SEM u. a. — meist PDF auf den Ämter-Sites, **NICHT in voilaj**) via eigenen
  browserlosen Adapter (§7 Quell-Wahl-zuerst: Format/Endpunkt je Amt empirisch erheben) als neuer
  Doktyp `verwaltungsverordnung` in dieselbe DB; Norm↔KS-Verzahnung analog Norm↔Entscheid. Amtliche
  Quelle bleibt Arbiter, §7 (a)–(d) je Eintrag, Anonymisierung meist n/a (keine Personendaten).
  Quell-Inventar zuerst; nachgelagert zu E3/E4. **(b) Materialien** — Botschaften/BBl,
  Parlamentsdebatten/Amtliches Bulletin (parlament.ch/Curia Vista), Vernehmlassungen,
  Staatsverträge — Doktyp `material`; überschneidet `FAHRPLAN-FEDLEX-PORTFOLIO.md`, das ab E1 in die
  DB speist. (Verwaltungsverordnungen/KS = eigene Ämter-Quellen, nicht Fedlex.)
  - **Vertiefung (TOR/DoD explizit):** `soft_law` (EINE Tabelle, §3.1) + generisches `norm_referenzen`
    ⇒ **kein Schema-Umbau**, nur neuer `quelldok_typ` + Register→Manifest→Check-Dreieck kopieren
    (dritte Instanz existiert: `check-materialien.ts`). Kontext-Panel zeigt neue Doktypen ohne Query-
    Änderung. Materialien via Fedlex-SPARQL ab E1 andockbar, VerwVO via Ämter-Adapter nach Quell-
    Inventar; kann ab E1 parallel zu E3–E5 laufen (eigene Quellen, eigene DB-Datei). **Code-Folgeaufgabe
    (verifiziert 3.7.2026):** `KontextTyp` in `src/lib/kontext.ts` kennt heute nur
    `'norm'|'entscheid'|'material'` — E6a braucht die vierte Ausprägung `'verwaltungsverordnung'` +
    Anschluss in `KontextPanel.tsx`, sonst zeigt kein Reader Kreisschreiben zur betroffenen Norm (der
    Nordstern-Satz «ein Kreisschreiben zeigt, welche Norm es auslegt» hängt an dieser einen Erweiterung).
    **TOR/DoD:** Doktyp-eigenes `check:*`-Dreieck; `check:paritaet` für die kuratierte Projektion;
    Kanten-Invarianten (`check:datenhaltung`).
  - **E6a Stufe 1 vorgezogen (David 3.7.2026) — Detailquelle `FAHRPLAN-MATERIALIEN-VERZAHNUNG.md`**
    (ROADMAP-Schritt `W2·6a-MAT`): baut genau dieses Fundament auf Verweis-/Register-Ebene (4
    POC-bewiesene Quellen ESTV-MWST/SECO/EDÖB/ESTV-KS, `soft_law` §3.1 + `norm_referenzen` §3.2 mit
    `quelle`-Enum +`'amtlich'`, committeter Zustandsträger `bibliothek/register/soft-law-zustand.jsonl`,
    Revisions-Cutoff-Invariante, `check:materialien`-Neubau). Die dortige Etappierung (M0 Fundament →
    M1–M4 Adapter → M5 UI-Delta) und die §0-Kritik-Einarbeitung sind massgeblich; hier nur der
    Andockpunkt.

**Querlaufend ab E1:** Import-Läufer (§6.1) schrittweise scharf schalten (erst Alarm→Hand, ab E3
Auto-PR für Maschinelles). Der Fassungs-Diff-Check (§3.3) hängt am Läufer, nicht an einer Etappe.
Risiko-Pfad-Globs (`scripts/datenhaltung/**`, `daten/**`) in `gegenpruefung/kern.ts` — s. §4.

## 6. Betrieb (Import-Läufer ausserhalb Vercel)

Ingest/Projektion laufen **lokal oder als GitHub-Actions-Workflow** (Cron → Ingest → Tore →
Auto-PR, **kein** Auto-Deploy §9) — nie in Vercel-Builds (7,5-GB-Parquet, Laufzeit). Fetch-Schleifen
(`normtext-snapshot.ts`, `check-drift.ts --netz`) mit **`p-limit`** (Concurrency 4–8; I/O-bound,
Faktor ~Concurrency — Audit-1-ADOPT); der Merge bleibt `sort()` → Determinismus §2 unverändert.
`daten/*.db` gitignored (je Doktyp, §2.2); committed werden nur: JSON-Projektion (wie heute),
Dump-Manifest, Golden. Tokens/Secrets nur serverseitig, nie im Client.

**Selbst gehostet (Anforderung §0):** Serving auf **eigener Infrastruktur** — eigener Server/VPS mit
dem SQLite-Artefakt + FTS5 (libSQL-Server oder schlanke Read-only-API); Vercel ruft diese eigene
API read-only auf. Turso nur *optionale* gehostete Bequemlichkeit, nie Abhängigkeit; das Artefakt
ist portabel (Anbieterwechsel = Datei umziehen). **Aktualitäts-Läufer** (Cron auf eigenem Server /
GitHub-Actions): reingest → Drift-Tore → atomic Artefakt-Swap → Manifest-Commit → **`npm run gen:zaehler`**
(Startseiten-Zähler «n Erlasse/Entscheide» sind buildzeit-generiert; ohne Regen wird `check:zaehler`
rot — gilt für JEDE Korpus-Erweiterung: Fedlex-Currency, E3-Serving, E5/E6); erkannter
Quell-Drift **alarmiert**, statt still zu veralten.

### 6.1 Import-Läufer — Zweiteilung nach Herkunft (kuratiert = Handschritt, maschinell = Auto)

Ausbau des §6-Solls zum konkreten Läufer: **Cron → Drift-Erkennung → Re-Extraktion → Tore
(paritaet/datenhaltung/normtext/invarianten inkl. Fassungs-Diff §3.3) → Enrichment-Pass +
`norm_rangliste`-Rebuild → atomic Artefakt-Swap → Dump-Manifest-Commit → `gen:zaehler` → Auto-PR.** Harte Grenze
(Doktrin): **Auto-PR ja, Auto-Merge eines Rechtstext-Updates NEIN** — kuratierte Normtext-Re-Extraktion
bleibt gegengeprüfter **Handschritt**. Für **maschinelle Masse** (`kuratierung='maschinell'`, §8-markiert)
ist **Auto-Merge nach grünen Toren** vertretbar. Zwei Herkünfte, EIN Artefakt:
- **Amtliche Quelle → bestehende TS-Adapter → DB-Zeilen** (§7 Build-Regel 6): Adapter bleiben die
  Extraktions-Wahrheit (nur sie stellen §7 a–d je Zeile her). Unverändert.
- **Massen-Seed (voilaj-Parquet) → Bulk-Pfad → Zeilen mit `kuratierung='maschinell'`** + amtlichem
  bger.ch-Link je Zeile. voilaj = Beschleuniger, nie Arbiter; amtliche Stichproben-Gegenprüfung Pflicht
  (Zirkelschluss-Warnung: voilaj = OCL-Output).

### 6.2 B2-POC (DuckDB vs. TS) — messbar definiert, zwei Aufgaben

Kein Vorentscheid. POC-Design (Audit-1-B2):
1. **Bulk:** 7,5-GB-Parquet lesen, `make_canonical_key`-Dedup, 991k Zeilen + Kanten nach SQLite schreiben.
2. **Resolve:** voller `resolve-zitate.ts`-Pass über den kompletten Kanten-Bestand (8,7M × 991k) via Match-Keys.

Messgrössen: Laufzeit je Aufgabe (**Zielrahmen Resolve: Minuten, nicht Stunden** — sonst Match-Key-Design
nachbessern BEVOR E3 startet), Peak-RAM, Code-Komplexität, **Determinismus** (zwei Läufe → identisches
Dump-Manifest). TS-Baseline = `hyparquet` + `better-sqlite3`. **Entscheidungsregel vorab fixiert: DuckDB
nur, wenn ≥ 3× schneller ODER TS an RAM/Robustheit scheitert** — sonst gewinnt «eine Sprache im Ops-Pfad».
Gegenindiz: voilaj selbst nutzt SQLite+FTS5, kein DuckDB. **Messfrage, kein Council-Thema.** Abgrenzung:
betrifft NUR den Ingest-Transform-Weg; das §2-Artefakt-Verdikt (libSQL) bleibt entschieden.

**[x] POC DURCHGEFÜHRT 3.7.2026 — VERDIKT: TS** (Detail + Mess-Tabelle:
**`bibliothek/register/B2-POC-2026-07-03.md`**). Voll-massstäblich gemessen (voilaj-Revision
`e2a0b95b…`: 195 342 Bundes-Entscheide + der KOMPLETTE Graph 8,7M Zitat- + 11,9M Norm-Kanten;
je Arm 2 Läufe, beide Arme bitgleich-deterministisch): Bulk DuckDB **1,55×**, Pipeline gesamt
**1,92×** schneller — unter der 3×-Schwelle; die Resolve-Teilaufgabe isoliert 3,65× (ehrlich
ausgewiesen), trägt den Ein-Pfad-Entscheid nicht (Else-Zweig der Regel: DuckDB-nur-für-Resolve
= per Konstruktion zwei Sprachen). TS scheitert NICHT an RAM/Robustheit — im Gegenteil:
Peak-RSS TS 2,1 GB vs. DuckDB 5,5 GB; der DuckDB-Arm brauchte better-sqlite3 ohnehin
(sqlite-Extension kann keine Indizes auf attached SQLite bauen) und eine SQL-Zweitimplementierung
der Kanonisierung, die empirisch divergierte (NBSP: JS-`\s` matcht U+00A0, RE2-`\s` nicht —
1/8,7M Kanten; Beleg für §3.1 «EINE Kanonisierung, nie zweitimplementieren»). **Zielrahmen klar
erfüllt: TS-Resolve 32–38 SEKUNDEN.** Auflösungsquoten-Baseline Bund-Zuschnitt **0,823**
(bge_bare 1,000 · bge_norm 0,992 · docket_norm 0,808 · bge_pincite 0,038 — Binnenseiten-Zitate,
E4-Option Seitenbereich-Lookup). E3-Vorbedingung 1 damit erfüllt; vor E3 offen nur noch
Vorbedingung 2 (VPS-Angebot, §6.3). Parquet-Arbeitskopie liegt als E3-Rohstoff in `daten/poc/`.

### 6.3 Selbst-Hosting-Dimensionierung + Kosten (Posten einzeln — vertieft §9)

Vollausbau-Rechnung, **Posten einzeln** (Indizes zählen SEPARAT; FTS5-Merge peakt schlimmer als das
×2-Milchmädchen):

| Posten | Grösse |
|---|---|
| Rohtext (Tabellen) | ~24 GB |
| FTS-Vollindex | ~58 GB |
| Kanten (8,7M + 11,9M Zeilen) | ~2–4 GB |
| Kanten-/Match-Key-Indizes (`ix_normref_norm` bei 11,9M Zeilen allein mehrere GB) | ~4–8 GB |
| `norm_rangliste` + Manifeste | ~1–2 GB |
| Parquet-Arbeitskopie | ~8 GB |
| **Voll-Rebuild-Spitze** (atomic swap, FTS5-Merge-Peak eingerechnet) | **transient ~200–250 GB** |

**Ziel-Dimensionierung: dedizierter VPS mit ≥ 350 GB NVMe und ≥ 32 GB RAM** — 16 GB ist FTS5-Build-
*Untergrenze*, nicht Ziel; bei 58 GB Index ist die RAM-Reserve billiger als ein abgebrochener Merge.
Real (Hetzner/OVH) **~25–50 €/Monat** — oberer Rand der bisherigen Schätzung, ehrlich benannt. **Pflicht
vor E3-Freigabe: konkretes Anbieter-Angebot gegen diese Posten-Tabelle** (Kosten-POC, kein Bauchgefühl).
Gestaffelt bleibt gestaffelt: E0/E1 kostenlos lokal, E2 klein (Turso-Free/Hot-Replika), Kosten wachsen
erst mit E3.

### 6.4 Import-Reihenfolge (bindend, konsolidiert — Fundament-Plan §4.5)

Prinzip: strukturiert/homogen/klein zuerst; PDF-lastig/heterogen/gross zuletzt; nie zwei 26×-Assets parallel.

1. **Fedlex-Paket 1 (Currency-Fix, 20 stale Erlasse)** — einziger aktiver Treuedefekt, keine DB-
   Abhängigkeit, läuft VOR/NEBEN allem (**RUHT bis Davids Freigabe**, Gesetze-Update ruht).
2. **E0+ Ausdehnung Reverse-Ingest:** Kanton-Normtext (1231 Erlass-JSONs; mit `index.json` = 1232 committete Dateien, empirisch 3.7.2026, committet — **kein 26×-Slot**) →
   Rechtsprechung (Zahl aus `register.json`) → `register.json`/`norm-index.json` (Trailing-Newline) →
   Materialien.
3. **E1 Generator-Flip** auf das Zielschema (§3), inkl. `erlass_fassungen` + Stabilitäts-Messung (§3.3).
4. **B2-POC (beide Aufgaben) → E3 BGer-Masse** (~191k, 26×-Slot, «E3 vor W3·12» steht) — `norm_referenzen`
   läuft mit. Vorbedingungen: POC + VPS-Angebot (§6.3).
5. **E4 Zitat-Graph** = erster voller Enrichment-Pass + `norm_rangliste` + Panels + Oracle-Tor.
6. **E5 Kantons-Gerichte** (Quelle offen: Parquet dünn → evtl. zweiter Adapter-Typ; erst nach E4-
   Erfahrung, Messung vor Migration).
7. **E6 Soft-Law** — **E6a VORGEZOGEN (David 3.7.2026)**: Quell-Inventar (Kreisschreiben ESTV/BSV/FINMA/SEM — Ämter/Formate/Endpunkte nach §7 Quell-Wahl) startet SOFORT parallel; Adapter-Bau als Bahn-A-Nebengleis nach dem E3/E4-Aufbau, kein 26×-Slot. (Materialien via Fedlex-SPARQL ab E1 andockbar, VerwVO via Ämter-Adapter nach Quell-
   Inventar) — kann ab E1 parallel zu 4–6 laufen (eigene Quellen, eigene DB-Datei).

## 7. Sicherheits-/Rollback-Konzept

- **Statik trägt immer:** die committete Projektion bleibt vollständig funktionsfähig ohne
  DB/Edge (Site heute = Fallback von morgen). Edge-Features hinter Feature-Flag; Ausfall ⇒
  ehrlicher Zustand + amtlicher Link (§8), nie leere Lüge.
- **Flip reversibel:** E1 behält den alten Direktpfad bis 3 grüne Doppelläufe; Revert = ein
  Commit. DB jederzeit aus Quellen reproduzierbar (sie ist Artefakt, die amtliche Quelle bleibt
  Master).
- **Kein stiller Drift:** jede Projektions-Differenz ist `check:paritaet`-rot; jede
  Quell-Differenz bleibt Sache der bestehenden Netz-Tore.

## 8. Verhältnis zu den anderen Fahrplänen

| Plan | Verhältnis |
|---|---|
| `PLAN-OCL-ABBAU.md` | W12/F2 + die drei David-Entscheide gehen in E3/E4 auf; W1–W10 unverändert |
| `FAHRPLAN-RECHTSPRECHUNG.md` | §6.5-Budget-Stufen + §8.4-Stufe-C + P2/P3-Mengengrenzen werden durch DB/Edge abgelöst; Schema/Reader/Tore bleiben |
| `FAHRPLAN-ENTSCHEIDSUCHE-AUSBAU.md` | P5-Senke = DB (E3); Live-Suche P1–P4 bleiben, langfristig ergänzt durch eigene Edge-Suche (E2) |
| `FAHRPLAN-FEDLEX-PORTFOLIO.md` | Paket 1 (Currency) speist ab E1 die DB; Projektion identisch |
| `FAHRPLAN-RECHTSSAMMLUNG.md` P4 / `FAHRPLAN-PERFORMANCE.md` | Client-FlexSearch bleibt Fallback; 16-MiB-Worker-Punkt evtl. hinfällig; perf-budget = Abnahme-Tor |
| `FAHRPLAN-GESETZE-IMPORT-3TIER.md` / W3·12 | Kantons-Breite später in dieselbe DB; 26×-Reihenfolge vs. E3 = David |
| `FAHRPLAN-NORMTEXT-DARSTELLUNG.md` (AKN Phase 1) | orthogonal: AKN ändert die Adapter-Quelle, DB die Senke; eId/ELI-Spalten vorbereitet |

## 9. Ehrliche Grenzen / Risiken

Voll-Korpus 991k: der Quell-FTS5-Index ist **~58 GB** (empirisch, voilaj) neben ~24 GB Text ⇒
weit jenseits Gratis-Tiers. **Ziel ist der Vollkorpus + weitere Doktypen (§0)** → der 58-GB-Index
ist Teil des Endausbaus, nicht ausgeschlossen; am Vollausbau fallen **reale, aber moderate
Hosting-Kosten** an (Self-Host-VPS oder Turso-Bezahlplan, ~einstellig bis zweistellig $/Monat
— **präzisiert 3.7.2026, §6.3: realistischer Rahmen ~25–50 €/Monat** (oberer Rand, ehrlich benannt),
mit **transienter Voll-Rebuild-Disk-Spitze ~200–250 GB** und Ziel-VPS **≥ 350 GB NVMe / ≥ 32 GB RAM**;
Indizes zählen als eigene Posten),
**gestaffelt** eingeführt (E0–E2 gratis, Kosten wachsen mit dem Nutzen); BGer ist nur die erste
Tranche (E3), nicht die Grenze; voilaj =
OCL-Output (Zirkelschluss-Warnung aus PLAN-OCL-ABBAU: Match beweist Port-Treue, nicht
Korrektheit) → amtliche Stichproben-Gegenprüfung Pflicht; Edge-Query öffnet erstmals einen
Laufzeit-Server-Pfad (bisher 100 % statisch) → strikt read-only, non-load-bearing, Fallback
immer statisch; Turso-Vendor-Risiko begrenzt (Artefakt ist portable SQLite-Datei).

## 10. Entscheide (2.7.2026 festgezogen; Prozess-Freigaben bei David)

1. **26×-Reihenfolge: E3 (BGer-Masse) ZUERST**, W3·12 (Kantone) danach. Grund: die DB-Motivation
   kommt von der Rechtsprechungs-Masse; voilaj liefert ~191k BGer konsumfertig, während die Kantone
   der ungelöste LexFind-3-Tier-Schmerz sind — die frische Pipeline zuerst am sauberen, hochwertigen
   Fall beweisen; W3·12 erbt danach die fertige Senke.
2. **Long-Tail-URLs: mit E3 öffnen (progressiv), NICHT auf E4 warten.** Jeder Entscheid bekommt
   sofort seine on-demand-gerenderte, §15-Regel-6-inhaltsvollständige Seite (Volltext + Regeste +
   zitierte Normen + amtlicher Link); der Zitat-Graph (E4) reichert diese Seiten später an, ohne sie
   zu blockieren. Der Flagship-Wert darf nicht an einem Nice-to-have hängen.
3. **Turso/Billing: aufgeschoben bis kurz vor E2.** E0/E1 sind rein lokal + kostenfrei; erst die
   Edge-Suche (E2) braucht das gehostete Replika — nicht früher provisionieren/zahlen.

**Prozess-Freigaben (nachgezogen 3.7.2026 auf §9 Weg 1):** (4) ~~Branch push/PR erst auf Davids
§9-Ja~~ → **Push/PR/Auto-Merge stehend freigegeben** («immer ja zum push» + Merge=Deploy-Entscheid,
CLAUDE.md §9); die Sorgfalt (`npm run gate`, Golden, Bug-Check) gilt VOR dem Merge. (5) Code-Bau
E0 ✅ freigegeben + gebaut (2.7.); **E0+/E1/B2-POC/E2-Vorarbeiten laufen autonom** — Stopp-Punkte
bleiben: Turso-Provisionierung (E2 live), VPS-Angebot/Kosten-Ok (vor E3), Fedlex-Paket-1-Freigabe,
fachliche Abnahme (ab Dez).

**Weichen-Entscheide (David 3.7.2026 — die zwei echten Weichen des Fundament-Plan-§8-Sets sind
ENTSCHIEDEN, nicht mehr offen):**

- **(6) Weiche B — Kontext-Daten-Skalierung = HYBRID.** «Was betrifft Art. X» bei 11,9M Kanten wird
  ausgeliefert als **Schaufenster-Chips aus geshardeter Projektion** (offline-treu, CDN-cachebar) +
  **Masse-Anteil per Edge** nachgeladen mit ehrlicher **«+n weitere (online)»-Kante**. Weder reines
  build-time-Sharding (11,9M Kanten passen nie in committete Shards) noch reine Edge-Query
  (Offline-Treue-Verlust). Greift VOR jedem Korpus-Wachstum und vor dem W2-Chips-Ausrollen;
  Fallback-Pflicht §7/§8 (Edge down → statischer Anteil + amtlicher Link).
- **(7) Weiche C — Rebuild-Modell = VOLL-REBUILD.** Determinismus-beweisbar (zwei Läufe → identisches
  Manifest, voilaj-Muster; hält die Doppelläufe-Doktrin). Preis: die **~200–250-GB-Disk-Spitze** (§6.3)
  — bewusst als **Preis der Beweisbarkeit** akzeptiert; der Kosten-POC (reales Anbieter-Angebot gegen
  §6.3) liefert die Zahl vor E3-Freigabe. Delta-Update verworfen (schwächerer Determinismus-Beweis, nur
  inkrementeller Manifest-Vergleich).
- **(8) Bestätigungs-Posten (angenommen, kein offener Entscheid — Veto-Gelegenheit war benannt):**
  generisches `norm_referenzen` + EINE `soft_law`-Tabelle (§3.1/§3.2) — der Code folgt bereits
  `MaterialRegistereintrag`, der Preis (FK-Integrität wandert in `check:datenhaltung`) ist benannt und
  akzeptiert, die Nordstern-Query verlangt es. Ebenso die Ziel-Tabellen-Anlage in E0+ (leere Tabellen
  kosten nichts, Nachmigration bei Millionen Zeilen ist teuer). *Aus dem Council gewandert, weil gesetzt:*
  hot/cold-Grenze «alle BGE + Bund-Gesetze» (folgt aus Replika-Grösse < 1 GB, §11.5) · DB-je-Doktyp
  (folgt aus Rebuild-Kadenz + Blast-Radius, §1 Partitionierung). *Ebenfalls keine Council-Frage (Messfrage/beantwortet):*
  DuckDB-vs-TS (§6.2, vorab fixierte Regel) · Historie-Modell (`erlass_fassungen`, §3.1/§4.4) · «ein
  Renderer?» (3 Reader + 1 Kontext-Layer, §11.1).

## 11. Darstellung (drei Reader + EIN Kontext-Layer)

> **UI-Grammatik der Verzahnung** (Chips/Badges/Gruppen/⧉) detailliert `FAHRPLAN-VERZAHNUNG-UI.md`
> (ROADMAP **W2·7-VZUI**, David 3.7.2026); die §11.2-Leitfälle-Chips werden dort konsumiert/
> vereinheitlicht, der Weiche-B-Masse-Anteil ist dessen V2.

> **Neu 3.7.2026 (Fundament-Plan §5).** Die Darstellung ist Teil des Fundaments: sie verdrahtet das
> bestehende Datenmodell (§0bis) sichtbar und macht die Verzahnung für Nicht-Juristen auffindbar.

### 11.1 «Ein Renderer» richtig verstanden

Kein universeller Renderer über Doktypen: die drei Reader (`GesetzLeser`/`EntscheidLeser`/`MaterialLeser`)
spiegeln strukturell verschiedene Inhaltsmodelle (Artikelbaum vs. lineare Abschnitte vs. Metadaten+Live-
Link) — Vereinheitlichung wäre die verbotene Fehlklasse (CLAUDE.md §1/§4) auf Darstellungsebene. «Ein
Renderer» heisst zweierlei, beides Leitplanke, kein Neubau:
1. **EIN geteilter Verzahnungs-Layer:** `src/lib/kontext.ts` + `KontextPanel.tsx` bedienen bereits alle
   drei Reader identisch (inkl. Split-View «⧉ daneben öffnen») — erweitern, nie duplizieren. Jeder neue
   Doktyp (E6) dockt hier an (Code-Folgeaufgabe §5 E6: `KontextTyp` vierte Ausprägung
   `'verwaltungsverordnung'`).
2. **EIN Ladeweg-agnostischer Reader je Doktyp:** Schaufenster (prerendert) und Masse (on-demand Edge)
   rendern mit derselben Komponente — Performance darf nur das Laden spalten (§15.3/15.6), nie die
   Komponente. Leitplanke explizit in E2/E3-DoD (§5), sonst entsteht schleichend eine «abgespeckte
   Massen-Darstellung».

### 11.2 Der billigste grosse Gewinn: totes Datenmodell verdrahten

`norm-index.ts` trägt bereits `proNormArtikel` + `rechtsprechungFuerArtikel()` (Artikel-genau, mit
`gewicht`) — von keiner UI-Komponente konsumiert. Bau-Schritt (klein, DB-unabhängig): `ArtikelLeser`
(`gesetz-leser/parts.tsx`) bekommt eine **«Leitfälle zu diesem Artikel»-Chip-Zeile** analog der
bestehenden «Verweise»-Zeile, mit «⧉ daneben öffnen». §15-Pflicht: lazy je Artikel, CLS-Mindesthöhe,
kein Eager-Korpus-Fetch. Für Kanten aus dem Umzugs-Report (§3.3) trägt der Chip den Fassungs-Hinweis.
Timing hängt an Weiche B (§10 (6)); als früher Sichtbarkeits-Beweis der Verzahnung hoch-ROI.

**✅ GEBAUT 3.7.2026 (Branch `feat/leitfaelle-chips`, W2·6-DATA — Schaufenster-Anteil live).**
Der Schaufenster-Teil von Weiche B ist umgesetzt: (1) der Generator (`entscheide-schreiben.ts`
`baueShards`) projiziert `proNormArtikel` **zusätzlich je Erlass** nach
`public/rechtsprechung/norm-index/<ERLASS>.json` (19 Shards, nur Erlasse mit Artikel-Treffern; Token
als Schlüssel, `REGISTERKEY/`-Präfix im Dateinamen) — EINE Quelle, das grosse `norm-index.json` bleibt
unverändert. Neue Paritäts-Klasse **Leitfall-Shards** (`ingest.ts` Dokument-Roundtrip + `check:paritaet`-
Zähler + `daten-manifest.json` neu gepinnt); `check:entscheide` beweist zusätzlich Shard-Vereinigung ==
`proNormArtikel`. (2) `norm-index.ts` `ladeLeitfallShard`/`leitfaelleFuerArtikel` laden den Shard des
Erlasses **lazy, Promise-cachend** (nie das 536-KB-Gesamt-JSON eager, §15.3). (3) `ArtikelLeser`
zeigt die Chip-Zeile (Top 5 nach `gewicht` + «+n weitere», Chip → `/rechtsprechung/:key` + «⧉ daneben
öffnen» aus dem Split-View-Muster), idle-geladen am Artikel-Fuss; ohne Treffer **keine leere Zeile**
(Verweise-Muster, dokumentiert). **Offen (Masse-Anteil):** der `«+n weitere (online)»`-Edge-Anteil
kommt erst mit **E2-live** (Turso provisioniert) — Erweiterungspunkt in `LeitfallZeile` markiert, NICHT
gebaut. Der Umzugs-Report-Fassungs-Hinweis (§3.3) folgt mit den entsprechenden Kanten.

### 11.3 Auffindbarkeit für Nicht-Juristen (Nordstern-Zielgruppe)

Der Nordstern-Nutzer (Amt, Studierende: «Kreisschreiben zu Art. 8 ZGB») hat heute keinen EINEN Einstieg.
Zwei Bausteine, beide aus dem Fundament ableitbar:
(a) **Die Norm-Seite ist der Hub** — das «Was betrifft diesen Artikel»-Panel (Entscheide/Materialien/
VerwVO/Werkzeuge) macht den Artikel zur Anlaufstelle; Laien navigieren Gesetz→Artikel→alles Weitere, ohne
Doktyp-Vorwissen.
(b) **E2-Edge-Suche als zusätzliche Treffergruppe in der EINEN bestehenden `universalSuche`** (kein
viertes Such-Silo), §8-Offenlegung «Suchbegriffe verlassen den Browser», statischer Index bleibt Offline-
Fallback. Cross-Korpus-FTS: E2-hot zuerst, Masse-cold ab E3 dazuschaltbar.

### 11.4 TS-fix vs. build-time (nicht verhandelbar, explizit)

- **TS-fix (Laufzeit):** alle Reader/Panels/Split-View, `kontext.ts`, `entry-server.tsx`, `prerender.ts`,
  Byte-Paritäts-Serialisierung (`JSON.stringify(obj, null, 2)`-Semantik). Sprache ändert sich NIE; bei
  Weiche B ändert sich nur die Datenquelle.
- **Build-time (Generator-Domäne, DB-Pipeline):** Erzeugung von `norm-index`/Registern/Shards als
  Projektion aus der DB (byte-gleich, §7 Build-Regel 6 ii); `seo-detail.ts`-Builder bleiben deterministische
  TS-String-Builder. SEO-Verzahnung (W5): statische Zuordnungen (Werkzeuge/Materialien) darf der Prerender
  mitrendern, Entscheid-Panels bleiben client-seitig (zu volatil, sonst Prerender-Lawine je Korpus-Update);
  JSON-LD/Sitemap decken den Crawler-Fall. Kein Council nötig.

### 11.5 FTS hot/cold (Such-/Darstellungsgrenze, in E2 festgezogen)

- **Hot** (`fts_entscheide_schaufenster` + `fts_artikel`): kuratierte BGE + alle Bund-Gesetze, < 1 GB →
  als Turso-Embedded-Replica edge-fähig. Das IST der E2-POC-Zuschnitt.
- **Cold** (`fts_entscheide_masse`): der 58-GB-Vollkorpus-Index bleibt ausschliesslich serverseitig auf dem
  Self-Host-VPS, nie embedded, nur per Read-API.

---

## 12. Datenhaltungs-Optimierung + Heiss/Kalt-Grenze (§14-Intake David 20.7.2026)

Verortet in `ROADMAP.md` unter **`QS-BASIS` (d)**; **Bau-Strang ist `W2·6-DATA`** (E4-Nachbarschaft).
Dieser Abschnitt ist die Detailquelle dazu. *Der Punkt war im ersten Intake-Durchgang verloren gegangen
und wurde durch die adversariale Prüfung von PR #315 wiedergefunden — er wird darum hier ausdrücklich
und dauerhaft festgehalten.*

### 12.1 Vier technische Posten

**(a) Inkrementeller Sync.** Heute schiebt jeder Lauf den Vollbestand. **Vorsicht, gemessene Falle:**
Bei #313 wurde inkrementell **bewusst verworfen** — `fts_artikel` ist *contentless* und über `rowid`
gekoppelt, Delta-Inserts invalidieren den Index **still**. Ein inkrementeller Sync muss dieses Problem
zuerst lösen, sonst tauscht er einen sichtbaren Zeitverbrauch gegen einen unsichtbaren Datenverlust.
Der atomare Schatten-Tabellen-Tausch aus #313 ist die Referenz, gegen die jede Alternative antritt.

**(b) contentless-FTS.** `content=''` statt external content **dort, wo der Rohtext ohnehin im
Serving-Store liegt** — spart Duplikat-Speicher im 1-GB-Budget. Auflage: Genau prüfen, welche Queries
Snippets brauchen; contentless kann keine Snippets rekonstruieren.

**(c) Index-Strategie.** Nicht raten, **messen**: welche Spalten tragen die realen Query-Pfade aus
`api/suche`? Jeder Index kostet Platz im knappsten Budget des Systems.

**(d) Heiss/Kalt-Grenze** → eigener Abschnitt 12.2, weil es **kein technischer**, sondern ein
Produkt-/Ehrlichkeits-Entscheid ist.

### 12.2 Heiss/Kalt-Grenze — **DAVID-GATE**

**Die Zahl, die den Entscheid erzwingt:** 195 000 Massen-Entscheide passen **nie** in die 1-GB-Turso-
Replika. Budget-Ist am 20.7.2026: **652 / 1024 MiB (64 %)** — und das bei nur **5093** kuratierten
Entscheiden. Es gibt keine Kompression, die diese Lücke schliesst; die Grenze ist strukturell.

**Die eigentliche Frage ist darum keine technische, sondern §8:**
> **Was darf die Suche behaupten, wenn der Long-Tail kalt liegt?**

Drei Optionen, alle vertretbar, mit verschiedenen Kosten:

| Option | Was der Nutzer erlebt | Preis |
|---|---|---|
| **Schweigen** | Long-Tail existiert für die Suche nicht | stille Falsch-Negative — **abzulehnen** |
| **Ausweisen** | «nur kuratierter Korpus durchsucht (5093 von 195 000)» | ehrlich, aber sichtbar begrenzt |
| **Kalt nachladen** | vollständige Treffer, spürbare Latenz | braucht VPS-Serving (E3), teurer |

**Warum das nicht agentenseitig entschieden wird:** Ein stiller Teiltreffer wäre exakt der Fehler aus
PR #313 in neuer Form — dort servierte `api/suche` einen halben Gesetzesindex und **null** Entscheide,
**ohne je rot zu werden**. Die Wahl zwischen «ehrlich begrenzt» und «vollständig aber langsam» ist eine
Produktentscheidung mit Haftungsbezug (ein Jurist, der glaubt, vollständig gesucht zu haben, ist
schlechter dran als einer, der die Grenze kennt). **Entscheid gehört David; bis dahin nicht
implementieren.**

### 12.3 Abhängigkeiten
(a)–(c) sind **frei baubar, ohne VPS**. Die Umsetzung von 12.2 hängt in der Variante «kalt nachladen»
am David-Gate `vps-bestellung-david` (E3-Serving, Abschnitt 5/E3). Die Varianten «ausweisen» und
«schweigen» brauchen keinen VPS — aber trotzdem Davids Entscheid, weil sie festlegen, was das Produkt
über seine eigene Vollständigkeit sagt.
