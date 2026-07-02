# Fahrplan — entscheidsuche voll ausschöpfen (Teil-B-Ausbau)

**Auftrag David (24.6.2026):** Den vollen Mehrwert von entscheidsuche
(`https://mcp.entscheidsuche.ch/` + darunterliegende API) für LexMetrik heben.
Dieser Plan priorisiert die noch ungenutzten Hebel und gibt je Phase konkrete
Dateien, Tore und Risiken. **Reiner Plan — nichts hier ist umgesetzt** (§9).

## 0. Ausgangslage (Stand 24.6.2026)

- **Genutzt:** Cross-Check serverseitig über den MCP (deckte Rubrum-Daten-Bug auf);
  **B2 Live-Volltextsuche** über `entscheidsuche.ch/_search.php` — aber nur minimal
  (`query_string` + Relevanz/Datum-Sort + erste 20 Treffer).
- **§7-Vertrag (empirisch verifiziert):**
  - MCP `/mcp`: stateless JSON-RPC, keine Auth; Tools `search`,
    `search_by_case_number`, `fetch_document`, `list_hierarchy`, `list_facets`,
    `server_info`. **Browser-untauglich** (POST mit `Origin` → 403). → Nur
    **serverseitig/Build-Zeit** nutzbar.
  - `entscheidsuche.ch/_search.php`: CORS `*`, browser-tauglich, ES-Query-DSL;
    `_source`: `date`, `title{de/fr/it}`, `abstract{de/fr/it}`, `reference[]`,
    `hierarchy[]`, `canton`, `attachment.content_url`, `id`. → **Browser-Feature.**
  - ES-Backend `entscheidsuche.pansoft.de:9200` (CORS `*`), `facets_url`
    `entscheidsuche.ch/docs/Facetten.json` (Facetten-Baum) — CORS vor Nutzung prüfen.

## 1. Leitplanken (verbindlich)

- **§2:** Live-Recherche ist **Discovery, keine Engine.** Keine deterministische
  Rechtslogik mit Live-Daten; Engines/golden bleiben unberührt.
- **§8:** Externe Treffer immer als **nicht kuratiert** markieren, amtlicher Link
  je Treffer; **opt-in** und offengelegt, dass Suchbegriffe an entscheidsuche.ch
  gehen (Berufsgeheimnis).
- **§3/§5:** reine Query-Bauer/Mapper in `src/lib/rechtsprechung/livesuche.ts`
  (SSoT), Komponenten rein darstellend; serverseitige Ingestion in `scripts/`.
- **Browser → `_search.php` · Server/Build-Zeit → MCP bzw. ES-Bulk** (MCP 403 im
  Browser ist die harte Architektur-Grenze).
- **§9:** kein Push/Deploy ohne Davids Ja. **Abnahme-Zeitsperre bis 1.12.2026**
  beachten: Ingestion mit `kuratierung:'maschinell'`, keine fachliche Abnahme nötig.

## 2. Phasen (priorisiert nach Wert ÷ Aufwand ÷ Risiko)

### P1 — Live-Suche reif machen (Browser, `_search.php`, geringes Risiko) ★ zuerst
Den grössten Sofort-Nutzen aus B2 holen.
- **Facetten-/Filter-Navigation:** Gericht/Kanton/Kammer + Sprache als Filter.
  Quelle: ES-`aggregations` via `_search.php` ODER `Facetten.json` (CORS prüfen);
  Hierarchie-IDs in die Query als `filter`-Terme. UI: schlanke Filterleiste an der
  bestehenden `LiveSuche`-Komponente.
- **Paginierung:** `from`/`search_after` + „mehr laden" (heute nur 20).
- **Sprachfilter de/fr/it** (heute keiner).
- **Treffer-Detail:** `attachment.content_url` ist verlinkt; optional Inline-Vorschau.
- Dateien: `src/lib/rechtsprechung/livesuche.ts` (Query-Bauer um Filter/Pagination
  erweitern, rein + Tests), `src/components/rechtsprechung/LiveSuche.tsx`.
- Tore: tsc/lint/Tests (reiner Query-Bauer), Playwright hell/dunkel/mobil,
  §8-Marker, kein Engine-/golden-Bezug.
- Risiko: ES-/Facetten-Vertrag instabil → defensiv mappen, ehrlicher Fehlerzustand.

### P2 — Direktzugriff per Geschäftsnummer (Browser, gering)
- `search_by_case_number`-Äquivalent über `_search.php` (Phrasen-Query): Eingabe
  „BGE 150 III 1" / „4A_123/2024" → direkt öffnen.
- Zweitnutzen: **Zitat-Verifikation** — im Reader/GesetzLeser genannte Entscheide
  gegen den Live-Bestand prüfen (Existenz/Fundstelle), §7.
- Dateien: `livesuche.ts` (+ `sucheNachAktenzeichen`), kleine UI im `/rechtsprechung`-Kopf.

### P3 — Norm↔Entscheid live (Burggraben, mittel)
- Im `GesetzLeser`/Norm-Kontext „Rechtsprechung zu Art. X — auch live im ganzen
  CH-Korpus" via `_search.php` (Query auf Normzitat). Ergänzt den lokalen
  `norm-index.json`, ohne ihn zu ersetzen.
- §8: lokal-kuratiert vs. live-extern klar getrennt darstellen.
- Dateien: `livesuche.ts` (Norm-Query), Einbindung in `GesetzLeser.tsx`/`NormText`.

### P4 — Neueste-Entscheide-Feed (Startseite, gering–mittel)
- `NewsHeader` der Startseite live-augmentieren via `sort=date` (heute offen, weil
  „verifizierter API-Vertrag" fehlte — der liegt nun vor).
- §2: nur Anzeige; §8: extern markiert, Link amtlich.
- Dateien: `src/components/start/NewsHeader.tsx`, `livesuche.ts`.

### P5 — Breiten-Ingestion künftiger Entscheide (Server/Build-Zeit, GROSS, höheres Risiko)

> **QS-DATA-Nachtrag (2.7.2026):** P5-Senke ist das DB-Artefakt (E3, `FAHRPLAN-DATENHALTUNG.md`), nicht direkt `public/rechtsprechung/`; die Such-Achse wird langfristig **selbst gehostet** (Edge-Suche E2 über die eigene DB) — P1–P4 (`_search.php`-Live-Suche) bleiben als Zweitkanal/Fallback.
- Korpus über die 265 kuratierten BGE hinaus (alle Instanzen, Kantone,
  BGer-only, fr/it). **Serverseitig** über den MCP (kein 403) bzw. ES-Bulk/
  HF-Parquet als Backfill.
- Architektur golden-schonend: eigener Baum `public/rechtsprechung/`,
  `quelle:'entscheidsuche'`, `kuratierung:'maschinell'`, Drift-Token, §7-Provenienz.
- Pipeline an bestehendes `adapter-entscheide.ts`/`entscheide-schreiben.ts` andocken;
  Dedup über Geschäftsnummer (BGE erscheint in beiden DBs).
- Tore: `check:entscheide`, Wort-Invarianten, golden byte-gleich (Gesetze unberührt).
- Risiko: Datenmenge/Qualität, Regeste-Lizenz (Graustufe Art. 5 URG), Excerpt-Last
  → klein starten, klare Kuratierungs-Achse.

### P6 — Korpusweiter Build-Zeit-Cross-Check (Server, gering, hoher Wert)
- Den MCP serverseitig als **Verifikations-Tor über den GANZEN Bestand** einsetzen
  (nicht nur 4 Repro): Regeste/Rubrum/Daten-Drift gegen entscheidsuche prüfen,
  als `check:`-Schritt. Hätte den Rubrum-Bug früher gefangen.
- Dateien: `scripts/normtext/check-entscheide-netz.ts` (neu), in `check:netz`.

## 3. Reihenfolge & Abhängigkeiten

P1 → P2 → (P4 ‖ P3) → P6 → P5. P1–P4 sind reine Browser-Display-Features (schnell,
golden-neutral, ohne Davids Fachzeit). P5 ist der grosse, separat zu entscheidende
Daten-Ausbau; P6 ist ein günstiges Qualitäts-Tor, das vor P5 stehen sollte.

## 4. Offene Verifikationspunkte (vor Bau prüfen)

- Facetten-Quelle browser-CORS (`Facetten.json` bzw. ES-`aggregations`).
- Rate-Limits/Fair-Use von `_search.php` (Debounce, Caching, „mehr laden" statt
  Auto-Feuern).
- Lizenz/Nutzungsbedingungen entscheidsuche (Open Data) für gespeicherte Inhalte (P5).
