# Fahrplan — Kantonale Entscheide korrekt abbilden (Recherche + Plan)

**Auftrag David (26.6.2026, Anw. 19):** Kantonale Entscheide sind aktuell sehr
falsch abgebildet. Untersuchen, wie die Kantone publizieren (allgemein + je
Kanton), Gemeinsamkeiten für maschinelle Übernahme finden; wo nicht möglich,
Plan für direkte PDF-/gesicherte Darstellung. **Dies ist ein Plan-Deliverable
(kein Code), passt in die Zeitsperre bis 1.12.2026 (Recherche/Plan/Status ohne
Davids Fachzeit).** Quellen-Recherche via zwei Web-Agenten (26.6.2026).

Anschluss an `FAHRPLAN-RECHTSPRECHUNG.md` (Kantone als P3+ budgetiert) und
`FAHRPLAN-ENTSCHEIDSUCHE-AUSBAU.md` (Facetten/Breiten-Ingestion). **Nicht
duplizieren** — dieser Plan konkretisiert nur die kantonale Beschaffung/Darstellung.

---

## 0. Ist-Zustand (warum «sehr falsch»)

Pilot: **5 Gerichte / 30 Entscheide** (`public/rechtsprechung/kanton/<KT>/<gericht>/*.json`,
AG/BE/GR/SG/ZH), gerendert über denselben Reader wie Bund. Belegte Defizite:

- **SG-Regesten echt-amtlich, aber als `regesteAmtlich:false` fehletikettiert** →
  UI untertreibt die Qualität (§8-Marker zu pessimistisch).
- **Uneinheitliche Regeste-Abdeckung** (GR/BE/AG ohne Regeste-Feld) → in der
  Übersicht erscheinen die meisten kantonalen Einträge mit Synth-Leitzeile.
- **`rubrum: null` durchgängig** → kein Gegenstand/Parteien/Vorinstanz-Kopf.
- **Kantonale Normen werden nicht verlinkt** (`fedlexLinkFuerArtikel` nur Bund) →
  tote Norm-Textstellen.
- **alle `leitcharakter:'routine'` / `kuratierung:'maschinell'`** → UI-Badge
  «ungeprüft», keine kantonalen Leitentscheide kuratiert.
- Bekannter Extraktions-Bug `152_I_105` (frz.).

Kernursache: zu kleiner Pilot + zu generische Übernahme, ohne die kantonale
Heterogenität (Vendor/Format/Metadaten) bewusst zu modellieren.

---

## 1. Wie publiziert wird — allgemein

- **Zentraler Hebel: entscheidsuche.ch** (gemeinnütziger Verein, Open Data).
  Aggregiert Bund **+ alle 26 Kantone**, alle Instanzen, DE/FR/IT. Pro Dokument
  **HTML + PDF + JSON-Metadaten** unter stabilem Pfadschema
  `entscheidsuche.ch/docs/<KT>_<Quelle>/…`. Freie Suche (`_search.php`,
  Elasticsearch), Sitemap, **MCP-Server** (`mcp.entscheidsuche.ch`, Build-Zeit,
  Browser-Origin 403), öffentliche Scrapy-Scraper (GitHub), **S3-Bulk**
  (eu-west-3) + `Spiderliste.xml`. Verwandt: **OpenCaseLaw** (950k+ Entscheide,
  Bulk-Parquet/HF, Zitationsgraph) — bereits unsere Primärquelle im Adapter.
- **Rechtsgrundlage:** Justizöffentlichkeit (Art. 30 Abs. 3 BV, BGE 147 I 407);
  Urteilstexte sind **amtliche Werke, nach Art. 5 URG nicht urheberrechtlich
  geschützt** → frei nutz-/verbreitbar. Aufbereitung/Metadaten + ToS einzelner
  Quellen separat zu prüfen.
- **Strukturelle Grenze (ehrlich kommunizieren, §8):** Die meisten Kantone
  publizieren nur eine **Auswahl** (2. Instanz selektiv, erstinstanzlich kaum),
  durchgängig **anonymisiert**. «Vollständigkeit» ist Quell-bedingt **nicht**
  erreichbar — kein behebbarer Bug.
- **Drei vor Architekturentscheid zu verifizierende Punkte:** (a) exakte
  Lizenz-Bezeichnung (CC BY-SA vs. nur Art.-5-URG-Gemeinfreiheit),
  (b) Belastbarkeit/Rate-Limits der entscheidsuche-Schnittstelle (keine offizielle
  SLA; agve.weblaw.ch lieferte 503 → Bot-Schutz wahrscheinlich),
  (c) **CORS** beim Direktabruf (unbestätigt → serverseitig/Build-Zeit, nie Client).

---

## 2. Gemeinsamkeiten — Vendor-Cluster (= maschinell übernehmbar)

Die kantonalen Originalportale sind meist JS-Apps **ohne offizielle API**, aber
sie laufen auf wenigen **Plattform-Familien**. Das ist die gesuchte
Gemeinsamkeit: **ein Adapter je Vendor** statt 26 Einzel-Scraper.

| Vendor/Software | Kantone (belegt) | Signatur |
|---|---|---|
| **Tribuna** (Delta Logic) | GR, BE, FR, JU | Pfad `tribunavtplus`/`tribunapublikation`; tokenisierte Download-URLs |
| **Findinfo/Weblaw** (Omnis `JURISWEB`) | VD, TI, NE, BS, SO, ZH-VG, AG, GL | `nph-omniscgi`, `OmnisLibrary=JURISWEB`, `Schema=<KT>_WEB` |
| **Swisslex-Hosting** | BL (`bl.swisslex.ch`, seit 8/2024) | swisslex-Subdomain |
| **Eigenentwicklung** | ZH (TYPO3 + 3 DBs), GE (`DECIS`), LU (LGVE), SG (TYPO3), VS (`JustSearch`/Nuxt) | — |
| **CMS statt Justizprodukt** | TG (Confluence + Scroll, Jahres-PDFs) | «Powered by Scroll Viewport» |

Muster: **Romandie + GR/BE → Tribuna; übrige Deutschschweiz + TI/NE → Findinfo.**
Tribuna- und Findinfo-Permalinks sind **session/token-basiert** (instabil) →
für stabile Verlinkung die **entscheidsuche.ch-`/docs/`-URLs** verwenden.

**Folgerung:** Nicht 26 Portale scrapen. Stattdessen **entscheidsuche.ch als
normalisierte Quelle** (JSON-Metadaten + PDF/HTML) nehmen; nur wo entscheidsuche
nachhinkt, gezielt den passenden **Vendor-Adapter** (Tribuna/Findinfo) ergänzen.

---

## 3. Maschinelle Übernahme — Zielarchitektur

1. **Beschaffung (Build-Zeit, serverseitig):** entscheidsuche-`_search.php` /
   S3-`/docs/` je Gerichtscode (`?filter=h@<code>`, z.B. `GR_VG_001`,
   `VD_TC_031`). Andockpunkt: bestehender `scripts/normtext-entscheide.ts`
   (`kantonKorpus()`), heute OpenCaseLaw — um die entscheidsuche-Quelle erweitern.
2. **Normalisierung (ein Schema):** entscheidsuche-JSON → `EntscheidSnapshot`
   (`src/lib/rechtsprechung/typen.ts`). Felder: Gericht, Aktenzeichen, Datum,
   Sprache, **Regeste** (wo vorhanden, korrekt als amtlich markieren — SG-Bug!),
   Normverweise, Volltext. Pro Quelle ein dünner **Vendor-Adapter** nur für die
   Eigenheiten (Tribuna-Token, Findinfo-Schema, GE-DECIS-Permalink).
3. **Reader-Grenze ehrlich markieren (§8):** Bund = strukturiert
   (SV/Erwägung/Dispositiv); Kanton = oft nur **Fliesstext**. Den Strukturgrad je
   Snapshot kennzeichnen, statt Struktur vorzutäuschen (bestehende Fallback-Marker
   in `EntscheidBody.tsx` beibehalten).
4. **Kantonaler Norm-Resolver:** `fedlexLinkFuerArtikel` ergänzen um kantonale
   Norm-Buckets (LexWork-Erlasse, die wir schon als Volltext führen) → kantonale
   Normverweise klickbar statt tot.
5. **Status/Kuratierung:** `kuratierung:'maschinell'` + Badge «ungeprüft» bleibt
   (Zeitsperre); kantonale Leitentscheide erst bei Davids Fachabnahme kuratieren.

---

## 4. PDF-/gesicherte Darstellung — Fallback (wo maschinell nicht tragfähig)

Für die **technisch sperrigen** Quellen bzw. wo Struktur-Extraktion unzuverlässig
ist, **nicht** Pseudo-Struktur erzeugen, sondern die amtliche Form zeigen:

- **PDF-embed-Pfad wiederverwenden** (existiert schon für EMRK,
  `GesetzLeser.tsx`-pdf-embed): amtliches Entscheid-PDF im `<iframe>` einbetten,
  mit Kopf (Gericht/Datum/Aktenzeichen), Provenienz, Download, Live-Link.
- **Sperrige Sonderfälle:** **TG** (Confluence-Jahres-Sammel-PDFs → nur als PDF
  verlinken, nicht parsen), **VS** (Nuxt-SPA → Headless/Build-Zeit oder PDF),
  **GR-Strukturbruch 2025** (KG+VG → Obergericht: Gerichtscodes neu mappen),
  **ZH** (drei getrennte DBs → drei Quellen). **GE** liefert als einziger saubere
  sprechende PDF-Permalinks → idealer PDF-Fallback-Pilot.
- Pro Eintrag ehrlicher Marker «als amtliches PDF dargestellt» (§8), nie als
  strukturierter Volltext ausgegeben.

---

## 5. Phasen (risikoarm, ohne Davids Fachzeit bis 1.12.2026)

- **P0 — Pilot-Reparatur (sofort, klein):** die 30 bestehenden Entscheide
  korrigieren: SG-Regeste-Fehletikett, kantonaler Norm-Resolver, `152_I_105`
  re-fetch. Reiner Daten-/Logik-Fix, keine Fachabnahme nötig.
- **P1 — entscheidsuche-Quelle + Verifikation:** die drei offenen Punkte (Lizenz,
  Limits, CORS) klären (ggf. Verein anschreiben); entscheidsuche-Adapter neben
  OpenCaseLaw; Trockenlauf für 2–3 Vendor-Cluster (Tribuna GR/BE, Findinfo VD/TI).
- **P2 — Breiten-Ingestion je Vendor:** Cluster-Adapter ausrollen, Normalisierung
  + Strukturgrad-Marker; Anonymisierungs-Stichprobe (DSG) **vor** Ausweitung.
- **P3 — PDF-Fallback** für TG/VS/GE u.a. über den embed-Pfad.
- **P4 — Kuratierung** kantonaler Leitentscheide → **erst mit Davids Fachzeit**
  (nach 1.12.2026, Abnahme-Warteschlange).

## 6. Risiken
- **R1 Anonymisierung:** Qualität variiert kantonal → eigene Plausibilitätsprüfung
  + DSG-/Haftungsbetrachtung; im Zweifel PDF-embed statt Re-Hosting.
- **R2 Schnittstellen-Stabilität:** keine offizielle SLA → Build-Zeit-Cache,
  Fair-Use, kein Client-Hämmern; Limits mit Verein klären.
- **R3 CORS:** unbestätigt → strikt serverseitig/Build-Zeit.
- **R4 Selektive Abdeckung:** strukturell, nicht behebbar → ehrlich kommunizieren,
  nie «vollständig» suggerieren.

## 7. Quellen
entscheidsuche.ch (UZH-Blog, GitHub `entscheidsuche/NeueScraper`,
`mcp.entscheidsuche.ch`, S3 `Spiderliste.xml`) · OpenCaseLaw (opencaselaw.ch, HF
Parquet) · Art. 5 URG · Art. 30 Abs. 3 BV / BGE 147 I 407 · Per-Kanton-Portale
(Tabelle Abschnitt 2/Recherche 26.6.2026) · Zenodo SJP/SCD (Bundesgericht).
Verlässlichkeit: Aggregations-/Open-Data-Charakter mehrfach belegt; **offen**
(vor Architekturentscheid verifizieren): exakte Lizenz, Rate-Limits, CORS.

**Abnahme-Status:** Erstrecherche (zwei unabhängige Web-Agenten); fachliche
Abnahme durch David ausstehend (Zeitsperre).
