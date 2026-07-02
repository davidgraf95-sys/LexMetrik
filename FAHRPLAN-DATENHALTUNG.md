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

## 1. Architektur

```
amtliche Quellen (Fedlex-HTML/XML · bger.ch · LexWork · voilaj-Parquet als Seed)
    │  bestehende Adapter (unverändert die Extraktions-Wahrheit)
    ▼
daten/lexmetrik.db  (libSQL/SQLite; generator-erzeugt, gitignored; Manifest committed)
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

## 3. Schema-Skizze (IDs = bestehende Keys, additiv)

- `erlasse(key, ebene, sr, titel, stand, quelle_url, fassungs_token, abgerufen, status)`
- `artikel(erlass_key, art_id, artikel, marg, bloecke_json, sha, …)` — `bloecke_json` trägt
  exakt die heutige `NormSnapshot.bloecke`-Form (Projektion = Re-Serialisierung, byte-gleich)
- `entscheide(id, ecli, gericht, kanton, nummer, bge_referenz, datum, sprache, leitcharakter,
  kuratierung, bestand, regeste_json, abschnitte_json, quelle, quelle_url, fassungs_token, sha, abgerufen)`
- `zitat_kanten(von_id, nach_id, konfidenz, quelle)` · `norm_kanten(entscheid_id, norm_key, art, quelle)`
- `materialien(…)` analog `MaterialRegistereintrag`
- FTS5-Virtualtabellen `fts_artikel`, `fts_entscheide` (external content, unicode61 rd=2)
- Jede Inhalts-Tabelle trägt §7 (a)–(d) als Spalten; keine Personen-Felder (Anonymisierungs-
  Invariante aus FAHRPLAN-RECHTSPRECHUNG §9.2 gilt fort).

## 4. Tore

- **`check:paritaet`** (neu, offline, in `check`-Kette): erzeugt die Projektion frisch aus
  `daten/lexmetrik.db` und vergleicht **byte-gleich** gegen die committeten
  `public/{normtext,rechtsprechung,materialien}/**/*.json`. In E0/E1 zusätzlich Doppellauf:
  alter Direktpfad vs. DB-Projektion byte-gleich. Exit 1 bei jedem Byte-Diff.
- **`check:datenhaltung`** (Drift): committetes Dump-Manifest == frisch berechnet; Tabellen-
  Invarianten (Zeilenzahlen ≥ Projektion, keine Orphans, §7-Spalten non-null, ECLI-Form).
- **Bestehende Tore bleiben Arbiter:** `check:normtext`, `check:entscheide` (+BUDGET für die
  committete Projektion), `check:fedlex-versionen`, `check:invarianten`, `golden:vergleich`
  (golden pinnt weiterhin die Inhalts-shas — DB ändert daran NICHTS).
- **`check:perf-budget` = Abnahme-Kriterium** jeder Etappe mit UI-Anteil (Edge-Suche/Long-Tail
  dürfen den kritischen Pfad nicht belasten; lazy, §15).
- Risiko-Pfad-Globs in `scripts/gegenpruefung/kern.ts` um `scripts/datenhaltung/**` +
  `daten/**`-Manifest erweitern (Extraktion/Projektion = Risiko-Pfad, QS-GP Pflicht).

## 5. Etappen (jede mit Tor; nie Big-Bang)

- **E0 · Fundament + Reverse-Befüllung (golden-neutral).** `scripts/datenhaltung/{schema.sql,
  ingest.ts, projektion.ts, check-paritaet.ts}`; DB wird aus den **bestehenden committeten
  JSONs** befüllt (JSON→DB→JSON-Roundtrip). DoD: `check:paritaet` grün über alle Dateien;
  kein anderes Tor berührt. Aufwand M.
- **E1 · Generator-Flip.** `normtext-snapshot.ts`/`normtext-entscheide.ts` schreiben Zeilen in
  die DB, Projektion erzeugt `public/*.json`; ≥3 Doppelläufe (alter Pfad vs. Projektion)
  byte-gleich, dann alter Direkt-Schreibpfad entfernt (eigener §6-Schritt). Ab hier gilt §7
  Build-Regel 6 bindend. Risiko-Pfad ⇒ Gegenprüfung. Aufwand M.
- **E2 · POC-Scheibe + Edge-Suche.** Scheibe = **alle amtlichen BGE (Volltext in DB; committete
  Projektion bleibt nur das kuratierte Schaufenster) + alle 218 Bund-Gesetze**. Turso-Replika +
  Read-only-Edge-Funktion `api/suche` (Drosselung, kein Write-Token im Client, §8-Offenlegung
  „Suchbegriffe verlassen den Browser" analog `FAHRPLAN-ENTSCHEIDSUCHE-AUSBAU.md` §1); neue
  Treffergruppe in `universalSuche`, statischer Index bleibt Fallback. DoD: Suchtreffer-Stichprobe
  gegen amtliche Quelle gegengeprüft; perf-budget grün.
- **E3 · BGer-Massen-Import (26×-Slot!).** voilaj-Parquet konsumieren (bger ~191k), Dedup
  `make_canonical_key`, `kuratierung:'maschinell'`, amtlicher bger.ch-Link je Zeile; DB-only
  (nicht nach `public/` projiziert); Long-Tail-Route `/rechtsprechung/:key` fällt bei
  nicht-erfassten Keys auf on-demand-Edge-Fetch zurück (§15.6). **Konkurriert um den freien
  26×-Slot mit W3·12 — Reihenfolge = Davids Entscheid.** = PLAN-OCL-ABBAU W12/F2.
- **E4 · Zitat-Graph.** 8,7M+11,9M Kanten in `zitat_kanten`/`norm_kanten`; topisches
  in-degree-Ranking (W3-Muster); Plausibilitäts-Checks als DB-Invarianten; UI-Panels
  (erfasst = build-time-Projektion, Masse = Edge). Ersetzt „Leitfall-Gewichte aus 342".
- **E5 · Kantone/Erweiterung** — nachgelagert, hängt an W3·12/W11-Schema-Entscheid.

## 6. Betrieb (Import-Läufer ausserhalb Vercel)

Ingest/Projektion laufen **lokal oder als GitHub-Actions-Workflow** (Cron → Ingest → Tore →
Auto-PR, **kein** Auto-Deploy §9) — nie in Vercel-Builds (7,5-GB-Parquet, Laufzeit).
`daten/lexmetrik.db` gitignored; committed werden nur: JSON-Projektion (wie heute),
Dump-Manifest, Golden. Turso-Sync per CLI aus dem Läufer; Tokens nur in CI/Vercel-Env, nie im
Client.

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
weit jenseits Gratis-Tiers → E3 bewusst BGer-only, Vollkorpus wäre eigenes Kostenthema; voilaj =
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

**Prozess-Freigaben (bleiben bei David, §9/Plan):** (4) Branch push/PR erst auf Davids §9-Ja
(vorher `npm run gate`) — bis dahin liegt er isoliert. (5) Code-Bau E0 startet erst auf Davids
ausdrückliche Freigabe (empfohlen als nächster Schritt: golden-neutral, Lernphase-konform).
