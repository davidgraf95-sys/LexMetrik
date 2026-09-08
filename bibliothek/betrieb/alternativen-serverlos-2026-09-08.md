# Serverlose Alternativen zum VPS 8.9.2026 (Auftrag David: «gibt es keine anderen Techniken?»)

**Erstellt:** 8.9.2026, Auftrag David 8.9.2026 («gibt es keine anderen Techniken?», im Anschluss an
die VPS-Neubewertung — Gegenrechnung serverloser/gemanagter Wege gegen den VPS-Weg A).
**Status:** ERSTRECHERCHE (Preisrecherche, keine Gegenprüfung nötig — kein Risikopfad, kein Bezug zu
Rechtslogik/Rechtsdaten).

**Quellen:** meilisearch.com/pricing · typesense.org/pricing · support.algolia.com (Record-Limit) ·
elastic.co/pricing/serverless-search · coralogix.com/guides/opensearch · cubeapm.com (AWS OpenSearch) ·
vercel.com/docs/vercel-blob/usage-and-pricing · egresscost.com (Cloudflare R2/Backblaze) ·
backblaze.com/cloud-storage/pricing · hetzner.com/storage/storage-box · infomaniak.com/en/swiss-backup/prices
(Preisrunde 1.1.2026) · fly.io/docs/about/pricing · railway.com/pricing · render.com/pricing ·
turso.tech/pricing · uibakery.io/flexprice (Supabase-Preistabelle 2026) · prisma.io/blog + checkthat.ai
(Neon 2026). Kurse Abruf 8.9.2026 (Vortagesstand): EUR→CHF 0.9405, USD→CHF 0.80924 (frankfurter.dev).
Referenz A = netcup RS 4000 G12, CHF 31.55/Mt (`bibliothek/betrieb/vps-auswahl-2026-09-08.md`, dort
verifiziert). Unsere Mengen: 195 342 BGE, Rohtext ~5,8 GB, FTS5-Index «58-GB-Klasse», Zitatgraph
8,7 Mio Kanten/1,4 Mio Zeilen (relational, klein), 195k JSON-Langschwanz-Dateien ~6 GB, Backups
~100 GB wachsend.

---

## 1 Weg B — Suchdienst (Kernstück)

| Dienst | Passt unsere Grösse? | Preis für uns | Beleg (Abruf 8.9.2026) |
|---|---|---|---|
| **Meilisearch Cloud** | Build-Plan-Limit 100k Docs < unsere 195k → **Pro/Ressourcen-Plan zwingend**. Kein öffentlicher Rechner-Output für GB-Klasse unserer Grösse erhältlich (Formular „describe your business"). | **unklar** — Anker: Usage-Plan Beispiel 100k Docs/50k Suchen = $30/Mt; XS-Ressource (0,5 vCPU/1 GB) = $23/Mt — beides zu klein für 195k Volltext-Dokumente. Reale Zahl nur per Sales-Kontakt. | meilisearch.com/pricing |
| **Typesense Cloud** | Index liegt **komplett im RAM** (Herstelleraussage); 5,8 GB Rohtext → Index-Overhead typ. 1,5–2×, also grob 9–16 GB RAM-Cluster nötig. | **unklar/grob geschätzt** — kleinste Stufe 0,5 GB RAM = $21,60/Mt (2 Burst-vCPU); reale Grösse/Preis nur über JS-Rechner (`typesense.org/pricing/calculator`), nicht scrapebar. Lineare Hochrechnung wäre Kaffeesatz — nicht verwendet. | typesense.org/pricing (Calculator nicht live lesbar) |
| **Algolia** | **Nein ohne Umbau**: Record-Grenze 100 KB max / **10 KB Ø** (bezahlt); ein BGE-Volltext ist oft > 10 KB → **Chunking der Urteile in Absätze zwingend**, das ist eine Architekturänderung, kein Config-Flip. | Rechenbeispiel bei Chunking (Annahme: Ø 5 Chunks/Urteil → ~1 Mio Records): 1 Mio Records × $0,40/1000 = **$400/Mt** nur Records, plus $0,50/1000 Suchanfragen. | support.algolia.com (Record-Limit) + Meilisearch-Blog „algolia-pricing" (Preistabelle 2026) |
| **Elastic Cloud Serverless / OpenSearch Serverless** | Serverless-Modell mit OCU-Mindestgebühr, „die die meisten Teams überrascht" (Coralogix 2026). Für eine 58-GB-Klasse braucht es mehrere OCU dauerhaft. | **unklar** — Elastic Serverless Search $0,09/VCU-h + $0,047/GB Storage nennbar, aber Mindest-OCU-Zahl für unsere Last nicht live verifizierbar. Nicht-serverless AWS-Einstieg (t3.small.search, ~2 GB RAM) ~$25/Mt — für 58 GB deutlich zu klein, reale Instanz (z. B. r6g.xlarge-Klasse) nicht live bepreist gefunden. | elastic.co/pricing/serverless-search, coralogix.com/guides/opensearch, cubeapm.com (AWS OpenSearch) |

**Gemeinsamer Befund für alle vier:** keiner liefert live einen belastbaren Endpreis für unsere
konkrete GB-Klasse ohne Sales-Kontakt oder JS-Rechner — das ist selbst ein Signal: Such-SaaS ist für
Mengen unserer Grösse **nicht im Self-Service-Preisband**, sondern verhandelt.

## 2 Objektspeicher für 195k JSON-Dateien (~6 GB) — Weg B, Baustein 2

| Dienst | Preis für 6 GB | Egress | Integration mit Vercel | Beleg |
|---|---|---|---|---|
| **Vercel Blob** | 6 GB × $0,023 = **$0,14/Mt** (≈ CHF 0,11) | $0,05/GB, zählt **nicht** ins 1-TB-Bandbreitenkontingent | **nativ** — selbes Konto, kein neuer Anbieter, Vercel-Edge liefert direkt aus | vercel.com/docs/vercel-blob/usage-and-pricing |
| **Cloudflare R2** | 6 GB × $0,015 = **$0,09/Mt**; erste 10 GB gratis → **$0** | **gratis** (Kernmerkmal) | braucht **Worker/eigene Domain** vor Vercel — zusätzlicher Anbieter, aber CH-nahe PoPs | egresscost.com/cloudflare, filebase.com (2026) |
| **Backblaze B2** | 6 GB × $0,006 = **$0,036/Mt**; 10 GB gratis → **$0** | frei bis 3× Speichermenge/Mt, danach $0,01/GB | braucht CDN davor (Cloudflare/bunny) für spürbaren Effekt — ein Hop mehr als R2 | backblaze.com/cloud-storage/pricing |

Bei 6 GB ist der **Preis bei allen dreien Rauschen** (< CHF 0,15/Mt). Entscheidend ist Integrationsaufwand:
Vercel Blob = null neuer Vertrag; R2/B2 = neuer Account + Auslieferungsweg, dafür dauerhaft gratis-Egress.

## 3 Backup-Ziel für ~100 GB (unabhängig vom gewählten Weg)

| Ziel | Preis/Mt für 100 GB | Zugriff | Standort | Beleg |
|---|---|---|---|---|
| **Hetzner Storage Box BX11** (1 TB) | CHF 3,01 (bereits im VPS-Dossier verifiziert) | rsync/SFTP/BorgBackup nativ | DE/FI | vps-Dossier §2 |
| **Backblaze B2** | 100 GB × $0,006 = $0,60 (≈ CHF 0,49) | S3-kompatible API / rclone, **kein natives SSH-rsync** | US/EU (wählbar) | backblaze.com/cloud-storage/pricing |
| **Cloudflare R2** | 100 GB × $0,015 = $1,50 (≈ CHF 1,21) | S3-API/rclone, kein natives SSH | global (Cloudflare-Netz) | egresscost.com |
| **Infomaniak Swiss Backup** | ab CHF 2,40/Mt (200-GB-Stufe, deckt 100 GB) | SFTP/WebDAV/rsync je nach Protokoll | **Schweiz** | infomaniak.com/en/swiss-backup/prices (Preisrunde 1.1.2026) |

Alle vier sind für 100 GB **einstellig bis CHF 3/Mt** — Backup-Kosten sind in keinem der vier Wege
das Problem. Infomaniak ist der einzige CH-Standort; Storage Box ist am günstigsten mit nativem rsync.

## 4 Weg C — «VPS light» (Fly.io / Railway / Render)

| Anbieter | Passende Maschine | Preis Compute | + Volume (60–100 GB) | Summe/Mt | Beleg |
|---|---|---|---|---|---|
| **Fly.io** | `performance-2x` 16 GB RAM (Comfort-Ziel aus VPS-Dossier a4) | $126,72 | 100 GB × $0,15 = $15 | **$141,72 ≈ CHF 114,70** | fly.io/docs/about/pricing |
| Fly.io (Sparvariante) | `shared-cpu-8x` 8 GB | $47,32 | 100 GB × $0,15 = $15 | $62,32 ≈ CHF 50,44 | ebd. |
| **Railway** | usage-basiert: 24/7 Reservierung ~4 vCPU/8 GB als Dauerlast | 4×$20 + 8×$10 = $160 | 100 GB × $0,15 = $15 | **$175 ≈ CHF 141,60** | railway.com/pricing |
| **Render** | Compute-Stufe für ≥8 GB RAM (Preisband $7–$450 nach Grösse, Mitte geschätzt) | ~$85–250 (unklar, kein Fixtarif für 8 GB genannt) | 100 GB × $0,25 = $25 | **grob $110–275 ≈ CHF 89–223** | render.com/pricing |

Alle drei liegen **2–7× über netcup** für vergleichbare RAM/Disk-Grössen, und keiner liefert
Snapshot/Rescue-System inklusive (VPS-Dossier d) — der Betriebsaufwand für einen Laien ist **gleich
hoch wie beim VPS** (eigenes Linux, eigene Backups, eigene Updates), nur zu einem höheren Preis und mit
plattformspezifischem Deploy-Modell (Fly Machines API, Railway-Nix-Builder, Render-Blueprints) als
zusätzlichem Lock-in obendrauf. Das ist der schlechteste Kompromiss der vier Wege.

## 5 Weg D — Turso/Postgres bezahlt

| Anbieter | Plan für ~58–60 GB | Preis/Mt | Beleg |
|---|---|---|---|
| **Turso Pro** | 50 GB inkl. + 8–10 GB Overage à $0,45/GB | Pro $416,58 + ~$4,50 Overage = **$421 ≈ CHF 341** | turso.tech/pricing |
| **Turso Scaler** | 24 GB inkl. — **reicht für unsere 58 GB nicht** | $24,92 (zu klein) | ebd. |
| **Supabase Pro (Postgres)** | 8 GB inkl. + 52 GB × $0,125/GB Overage | $25 + $6,50 = **$31,50 ≈ CHF 25,50** (+ Compute-Add-on je nach Last, nicht mitgerechnet) | uibakery.io/flexprice (Supabase-Preistabelle 2026) |
| **Neon** | Storage $0,35/GB × 58 GB = $20,30 + Compute $0,106/CU-h (Launch), nutzungsabhängig | Storage **$20,30**, Compute grob $10–30 je nach Last → **≈ $30–50 ≈ CHF 24–40** | prisma.io/blog, checkthat.ai (Neon 2026) |

Supabase/Neon liegen preislich **überraschend nah an netcup** (CHF 25–40 vs. CHF 31,55) — aber das ist
nur der Datenbank-Teil. Beide sind **Postgres**, nicht SQLite-FTS5: Volltextsuche liefe über
`tsvector`/`ts_rank`, nicht FTS5 `MATCH` mit unseren eigenen Ranking-Feldern `m/n/g/tb/f`. Das ist ein
**Umbau der Rechenlogik der Suche**, keine Konfigurationsänderung — der Gold-Testsatz
(`suche-eval-gold`, R@1 0,623 / NDCG@10 0,668) müsste nach dem Umbau neu gemessen werden; ein
Postgres-`ts_rank` hält die Baseline **nicht automatisch**. Turso Pro ist bei unserer Grösse schlicht zu
teuer (10× netcup).

## 6 Zitatgraph (8,7 Mio Kanten/1,4 Mio Zeilen) — pro Weg möglich?

Der Graph selbst ist klein (wenige hundert MB als Kantentabelle) — die 58-GB-Frage betrifft nur den
FTS-Volltext. Kein Such-SaaS (Meilisearch/Typesense/Algolia/Elastic) ist eine Graph-/Relationen-DB für
Traversierung — bei Weg B bräuchte man **zusätzlich** eine relationale DB für den Graphen (heute schon
Turso — bliebe unverändert). Bei Weg C/D (eigener Host bzw. Postgres) läuft der Graph **in derselben
DB** wie heute bzw. als Postgres-Tabelle — dort **ja, ohne Zusatzdienst**.

## 7 Gesamtvergleich

| Weg | CHF/Mt (unsere Menge) | Betriebsaufwand Laie | Abhängigkeit/Lock-in | Code-Änderung | Suchqualität-Risiko | Zitatgraph |
|---|---|---|---|---|---|---|
| **A VPS netcup** | **31,55** | mittel (SSH, Updates, Backups selbst) — aber Snapshot/Rescue inklusive | gering (Standard-Linux, portabel) | **keine** (FTS5 bleibt) | keins (Baseline bereits erreicht) | ja, unverändert |
| **B Suchdienst+R2+StorageBox** | **unklar, real eher $150–450+** (Suchdienst-Anteil dominiert, s. §1) + < CHF 5 Objekt/Backup | gering für Suche (SaaS), aber **neuer Umbau + 2–3 neue Konten** (Suchdienst, R2, Backup) | **hoch** — Ranking-DSL, API, Abrechnungsmodell des Anbieters | **gross**: Ranking `m/n/g/tb/f` in fremder Such-DSL nachbauen, Chunking bei Algolia zwingend | **hoch** — Baseline muss in Fremd-Engine neu erreicht werden, ungetestet | **nein** — Graph bleibt separat (z. B. weiter Turso) |
| **C VPS light (Fly/Railway/Render)** | **50–275**, 2–7× netcup | **gleich hoch wie A** (eigenes Linux) + Plattform-Deploy-Modell zusätzlich lernen | mittel-hoch (Fly-Machines-API/Railway-Builder als Lock-in, kein Standard-SSH-Rescue) | keine (FTS5 bleibt) | keins | ja, unverändert |
| **D Turso/Postgres bezahlt** | Turso Pro **341** (zu teuer) · Supabase/Neon **25–40** (günstig, aber…) | gering (Managed Postgres) | mittel (Postgres-Ökosystem statt SQLite) | **gross**: FTS5→Postgres-FTS, Ranking-Felder portieren | **hoch** — `ts_rank` ≠ BM25+Zusatzfelder, Baseline unbewiesen | ja, in derselben DB |

## 8 Verdikt

**Weg A (netcup-VPS) bleibt der beste Weg für uns.** Er ist der einzige, der die 58-GB-FTS5-Suche mit
den eigenen Ranking-Feldern **ohne Code-Änderung und ohne Suchqualitäts-Risiko** trägt — und dazu noch
der günstigste (CHF 31,55 vs. mindestens CHF 50 bei Weg C, geschätzt CHF 150+ bei Weg B, CHF 25–40 nur
bei Weg D **falls** die Suchlogik komplett auf Postgres umgebaut und der Gold-Testsatz neu bestätigt
wird — ein Risiko ohne Preisvorteil, der diesen Umbau rechtfertigt). Weg D (Supabase/Neon) ist
preislich der einzige ernsthafte Herausforderer, scheitert aber am Aufwand: FTS5→Postgres ist ein
Umbau der Rechenlogik, nicht der Infrastruktur, und würde §1/§2 (Korrektheit, Determinismus) einen
unbewiesenen Zwischenschritt aufbürden, ohne dass Geld gespart würde. Weg C ist in jeder Dimension
schlechter als A. Weg B ist für Volltextsuche über 195k lange Rechtstexte mit eigenem Ranking
**architektonisch der am wenigsten passende** Weg — Objektspeicher (R2/Vercel Blob) und Backup
(Storage Box/Infomaniak) sind dagegen in jedem Szenario Pfennigbeträge und ergänzen A sinnvoll,
unabhängig von der Suchfrage.

**Offen geblieben:** exakte Endpreise für unsere Datengrösse bei Meilisearch Pro, Typesense-Cluster und
Elastic/OpenSearch Serverless (alle drei nur per Sales-Kontakt/JS-Rechner, nicht live scrapbar) — die
Grössenordnung (deutlich über netcup) ist aber aus den öffentlichen Ankerpreisen klar ablesbar. Render-
Compute-Preis für die passende 8-GB-Stufe war nicht als Fixtarif auffindbar, nur als Preisband.
