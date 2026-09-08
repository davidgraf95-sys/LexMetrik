# VPS-Neubewertung 8.9.2026 (Auftrag David: «eruier nochmals, was genau der beste VPS ist»)

**Erstellt:** 8.9.2026, Auftrag David 8.9.2026 («eruier nochmals, was genau der beste VPS ist»
— Neuprüfung des Juli-Dossiers gegen inzwischen gemessene Anforderungen aus
`fahrplaene/FAHRPLAN-DATENHALTUNG.md` §13/§14 und `bibliothek/betrieb/ci-minuten-sparplan-2026-09-08.md` §3).
**Status:** ERSTRECHERCHE (Preisrecherche, keine Gegenprüfung nötig — kein Risikopfad, kein Bezug zu
Rechtslogik/Rechtsdaten).

**Quellen:** netcup.com/en/server/root-server und /vps (Abruf 8.9.2026) · docs.hetzner.com Preisrunde
15.6.2026 · hetzner.com/storage/storage-box · contabo.com/en/vps · ovhcloud.com/de/vps ·
infoswitch.fr (Jan 2026, Infomaniak) · eucloudcost.com (17.8.2026, Exoscale) · costgoat (5.9.2026,
Hetzner-Cloud-Drittaggregator, da hetzner.com die Preistabellen JS-rendert) · docs.github.com
(Self-hosted-Runner-Warnung für öffentliche Repos) · frankfurter.dev (Kurs EUR→CHF 0.9405, Abruf
8.9.2026, Vortagesstand). Vollständige Kandidaten-, Bewertungs- und Ranglisten-Tabellen samt allen
Einzelbelegen: Rohbericht des Recherche-Unteragenten, hier vollständig übernommen unten.

---

## 1 Anforderungsprofil mit Zahlen

| # | Anforderung | Gemessene Grundlage | Mindestmass |
|---|---|---|---|
| a1 | `rechtsprechung.db` heiss | **466 MiB** (`daten/rechtsprechung.db`, lokal gemessen 8.9.) + `normtext.db` 186 MiB | — |
| a2 | cold-FTS `fts_entscheide_masse` | **«58-GB-Klasse»**, 195 342 Entscheide (FAHRPLAN-DATENHALTUNG §14) | **≥ 200 GB NVMe** |
| a3 | Zitatgraph E4 | 8,7 Mio Kanten / 1,4 Mio Zeilen | im FTS-Budget enthalten |
| a4 | RAM als Page-Cache | Arbeitsmenge einer FTS5-`MATCH` = Doclists der Suchterme, **nicht** die 58 GB | **≥ 32 GB**, 64 GB = Komfort |
| a5 | NVMe-IOPS | FTS5-Doclist-Lesen = wahlfreie 4-K-Reads | **NVMe zwingend**, kein SATA/«SSD» |
| b1 | Runner-Klasse (Referenz) | GitHub-Runner öffentl. Repo = **4 vCPU / 16 GB / 14 GB SSD**; darauf sind die 5.47 min Median je Shard gemessen | — |
| b2 | 4 Shards parallel (M3) | `playwright.config.ts:65` `workers:1`; je Job 1 Chromium + `preview`-Node + `npm ci` | **8–16 vCPU / 16–32 GB** |
| b3 | Job-Deckel | 25 min hart (ci.yml) — Untertaktung wird **rot**, nicht langsam | Reserve nötig |
| b4 | Disk je Job | node_modules **805 MB** + dist **738 MB** (gemessen) + Playwright-Cache 534 MB (geteilt) | ~7 GB für 4 Jobs |
| c | Backup-Zweitziel + Fassungs-Archiv | 50–100 GB, wachsend | **+ 100 GB**, besser getrennter Host |
| d | Laienbetrieb | SSH-Key, Ubuntu LTS, `unattended-upgrades`, `ufw`, Rescue, Snapshots | Snapshot + Rescue im Preis |
| e | Standort/Recht | amtlich-öffentliche Daten, **keine** Personendaten-Bindung; Latenz ZH; Support DE | DE/AT genügt |

**Zu (a4) ehrlich:** die 58 GB müssen **nicht** in den RAM. FTS5 liest je Anfrage nur die Doclists der
Suchbegriffe; 32 GB decken die heisse Arbeitsmenge (466 MiB Entscheid-Tabelle + Doclist-Hot-Set) mit
Reserve. 64 GB ist Komfort, kein Muss — und bei netcup ein späteres Upgrade.

## 2 Kandidaten, live 8.9.2026 (Netto = für CH massgeblich)

| Anbieter · Produkt | vCPU | dediziert? | RAM | NVMe | Traffic | €/Mt netto | ≈CHF/Mt | Setup | Laufzeit | Standort | Quelle (Abruf 8.9.) |
|---|---:|---|---:|---:|---|---:|---:|---:|---|---|---|
| **netcup RS 4000 G12** | 12 | **ja** (EPYC 9645) | 32 GB DDR5 | **1 TB** | 2,5 Gbit/s | **33.55** (39.92 inkl. DE-MwSt) | **31.55** | 0 | 1 od. 12 Mt | NUE/VIE/AMS | netcup.com/en/server/root-server |
| netcup RS 8000 G12 | 16 | ja | 64 GB | 2 TB | 2,5 Gbit/s | 59.97 (71.36 inkl.) | 56.40 | 0 | 1 od. 12 Mt | NUE/VIE/AMS | ebd. |
| netcup RS 2000 G12 | 8 | ja | 16 GB | 512 GB | 2,5 Gbit/s | 18.01 (21.43 inkl.) | 16.94 | 0 | 1/12 Mt | NUE/VIE | ebd. |
| netcup VPS 4000 G12 | 12 | **nein** (shared) | 32 GB | 1 TB | — | 27.23 (32.41 inkl.) | 25.61 | 0 | 12 Mt/stdl. | NUE/VIE | netcup.com/en/server/vps |
| Hetzner **CCX33** | 8 | ja | 32 GB | 240 GB | 30 TB | **138.49** | 130.25 | 0 | stündlich | NBG/HEL | costgoat 5.9.26 + Preisrunde 15.6.26 |
| Hetzner **AX41-1-LTD** (dediz. Blech) | 6C/12T Ryzen 5 3600 | ja | 64 GB DDR4 | 2×512 GB (RAID1 → 512) | unlimitiert | **57.30** | 53.89 | **0** | monatlich | FSN/HEL | docs.hetzner.com/…/price-adjustment |
| Hetzner AX42-1 | 8C Ryzen 7 PRO 8700GE | ja | 64 GB DDR5 ECC | 2×512 GB | unlimitiert | 97.30 | 91.51 | 49 | monatlich | FSN/HEL | ebd. |
| Hetzner CX53 (shared) | 16 | nein | 32 GB | 320 GB | 20 TB | 29.49 | 27.73 | 0 | stündlich | NBG/FSN/HEL | costgoat 5.9.26 |
| Hetzner CX43 (shared) | 8 | nein | 16 GB | 160 GB | 20 TB | 15.99 | 15.04 | 0 | stündlich | NBG/FSN/HEL | ebd. |
| Hetzner Storage Box BX11 / BX21 | — | — | — | 1 TB / 5 TB | unlimitiert | 3.20 / 10.90 | 3.01 / 10.25 | 0 | keine | DE/FI | hetzner.com/storage/storage-box + whtop |
| Contabo Cloud VPS 16 | 16 | **nein** | 64 GB | 500 GB **SSD** | «unlimitiert», Port 1 Gbit | 37.00 *inkl. MwSt, Aktion 24 Mt* | 34.80 | 0 | 1 Mt | DE u. a. | contabo.com/en/vps |
| OVH VPS-4 (2027-Linie) | 8 | nein | 24 GB | 200 GB | 3 Gbit/s | 23.75 *inkl. MwSt* | 22.34 | 0 | monatlich | EU (DE/FR) | ovhcloud.com/de/vps |
| Infomaniak VPS Cloud L | 4 | nein | 8 GB | 80 GB | unlimitiert | 36.00 | 33.86 | 0 | monatlich | **Genf/ZH** | infoswitch.fr (Jan 2026) |
| Exoscale «Huge» + 1 TB Block | 8 | ja | 32 GB | 1 TB Block | 0,020 €/GB egress | 272.54 + 102.00 = **374.54** | 352.25 | 0 | sekundengenau | **CH-GVA-2** | eucloudcost.com (17.8.26) |
| Hostpoint / cyon | — | — | — | — | — | — | — | — | — | CH | **kein unmanaged VPS** (hosttest/webtesten 2026) |

Kurs 0.9405; Zeilen ohne Vermerk = **netto**. Contabo/OVH-Zeilen sind Brutto-Angaben der Anbieterseite.

## 3 Bewertung Anforderung × Kandidat

| | a (Serving 32 GB/≥200 GB NVMe) | b (4 Shards) | c (Backup 100 GB) | d (Snapshot/Rescue/LTS) | e (Standort/Support DE) | Preis |
|---|---|---|---|---|---|---|
| **netcup RS 4000 G12** | **erfüllt, gross** (1 TB) | knapp (12 dediz. Kerne, aber teilt mit Serving) | **erfüllt** (Rest ~900 GB) | erfüllt (Snapshots inkl., Rescue, SCM) | erfüllt (NUE/VIE, DE-Support) | **bester** |
| netcup RS 8000 G12 | erfüllt, sehr gross | **erfüllt** (16 Kerne/64 GB) | erfüllt | erfüllt | erfüllt | +€26/Mt |
| Hetzner AX41-1-LTD | **knapp** (512 GB nutzbar bei 58-GB-FTS + Archiv eng) | erfüllt (64 GB) | knapp | erfüllt | erfüllt | +€24/Mt |
| Hetzner CCX33 | **nein** (240 GB Disk) | erfüllt | nein | erfüllt (Backup 20 %) | erfüllt | 4× netcup |
| Hetzner CX53 | knapp (320 GB, shared vCPU) | knapp (shared) | nein | erfüllt | erfüllt | günstig |
| Contabo VPS 16 | **nein** (500 GB **SSD**, shared, gedrosselter Port) | unklar (Überbuchungs-Ruf) | knapp | teils | erfüllt | günstig |
| OVH VPS-4 | **nein** (24 GB / 200 GB) | nein | nein | erfüllt (tägl. Backup inkl.) | erfüllt | günstig |
| Infomaniak VPS Cloud | **nein** (max. 8 GB in dieser Linie) | nein | nein | erfüllt | **best** (CH, DE-Support) | teuer je GB |
| Exoscale | erfüllt | erfüllt | erfüllt | erfüllt | **best** (CH) | **11× netcup** |
| Hostpoint/cyon | **nein** (kein Root-Zugang) | nein | nein | — | best | — |

## 4 Rangliste (Passung × Preis)

1. **netcup RS 4000 G12** — einziger Kandidat, der a+c+d+e vollständig und mit Puffer zum tiefsten Preis trägt.
2. **netcup RS 8000 G12** — dasselbe, plus Reserve für b (Runner) und 64 GB RAM; +€26.42/Mt netto.
3. **Hetzner AX41-1-LTD** — echtes Blech, 64 GB, kein Setup; scheitert an **512 GB** nutzbarem NVMe (58-GB-FTS + Archiv + Backup passen nur ohne Wachstum) und ist «Limited» = Bestandsabhängig.
4. Hetzner CX53 als **separater Runner-Rechner** (nicht als Serving-Host).
5. Alles Übrige: entweder zu klein (OVH, Infomaniak-VPS, CCX33-Disk), zu teuer (Exoscale, CCX-Linie nach der Runde vom 15.6.2026) oder qualitativ unsicher (Contabo: shared vCPU, SATA-SSD, gedrosselter Port).

## 5 Empfehlung

**netcup RS 4000 G12 · 12 dedizierte Kerne / 32 GB DDR5 / 1 TB NVMe · €33.55 netto ≈ CHF 31.55 /Mt,
kein Setup, 1-Monats-Laufzeit, Standort Nürnberg.** — **Das Juli-Verdikt wird bestätigt**, und zwar
belastbarer als im Juli: der Preis ist seit 17.7.2026 **unverändert** (netcups eigene Preisrunde vom
19.3./1.5.2026 war zum Juli-Abruf bereits eingerechnet), während der Hauptkonkurrent Hetzner am
**15.6.2026 die CCX-Cloud um Faktor 2,2–2,7 und die Dedizierten neu strukturiert** hat. Der Abstand hat
sich also **vergrössert**, nicht verkleinert.

**Alternative, falls ausverkauft oder falls der Runner mit drauf soll:** **netcup RS 8000 G12** —
16 Kerne / 64 GB / 2 TB, €59.97 netto ≈ CHF 56.40. Zweitalternative ohne netcup:
**Hetzner AX41-1-LTD** (€57.30 netto, 0 Setup) — dann aber **Storage Box BX11** (1 TB, €3.20) als
Archiv-/Backup-Ziel dazu, weil 512 GB lokal zu knapp sind.

**Backup-Drittziel (unabhängig vom Serving-Host, dringend empfohlen):** Hetzner **Storage Box BX11**,
1 TB, **€3.20 netto ≈ CHF 3.01/Mt**, rsync/BorgBackup/Restic über SSH, 10 Snapshots inkl., DE oder FI.
Ein Backup auf demselben Host wie die Produktion ist kein Backup.

## 6 Ein Server oder zwei? (Runner-Frage)

**Der Runner gehört heute NICHT auf den VPS — und der Grund ist nicht Last, sondern Sicherheit.**
Das Repo ist **öffentlich**. GitHub schreibt dazu: *«We recommend that you only use self-hosted runners
with private repositories … forks of your public repository can potentially run dangerous code on your
self-hosted runner machine»* (docs.github.com, Abruf 8.9.2026). Ein Self-hosted-Runner neben der
Produktions-DB auf demselben Host wäre genau dieses Muster. Solange das Repo öffentlich ist, sind die
Actions-Minuten ohnehin **gratis und unbegrenzt** (`ci-minuten-sparplan` §3) — der Runner löst dann gar
kein Problem.

**Wird das Repo privat geschaltet**, gilt: (i) Fremd-PR-Risiko entfällt, (ii) der Runner spart die im
Sparplan gerechneten ~273 $/Mt. Dann drei Wege, nach Robustheit geordnet:

| Weg | Kosten/Mt | Wirkung auf das Serving | Urteil |
|---|---|---|---|
| Runner bleibt auf Davids Mac | 0 | keine | **einfachster Start** — Mac muss laufen |
| **zweiter kleiner Host** (netcup RS 2000 G12 CHF 16.94 · oder Hetzner CX53 CHF 27.73) | +17–28 | **keine** — echte Isolation | **empfohlen, sobald privat** |
| alles auf einem RS 8000 G12 | +25 ggü. RS 4000 | 4 Shards × Chromium ziehen 25 min lang 8–16 Kerne → FTS-Latenz-Spitzen | nur mit `cpuset`/`systemd`-Quota |

Vier parallele Shards brauchen realistisch **8–16 vCPU / 16–32 GB / ~7 GB Disk** (Rechnung: GitHubs
Referenz ist 4 vCPU/16 GB je Job; je Job laufen 1 Chromium mit `workers:1`, ein `preview`-Node und
`npm ci`; node_modules 805 MB + dist 738 MB gemessen). Der 25-min-Job-Deckel ist hart — wer zu klein
dimensioniert, bekommt **rote** Shards, keine langsamen.

## 7 Was nicht live verifizierbar war (offen)

- **Netto-Abrechnung für CH-Kunden** bei netcup/Hetzner: plausibel (Leistungsort ausserhalb EU), aber
  auf keiner Anbieterseite amtlich bestätigt gefunden. **Offen** — vor der Bestellung im Bestellprozess
  mit CH-Adresse prüfen; ggf. Schweizer Bezugsteuer 8,1 %.
- **Hetzner-Cloud-Preise** stammen aus Dritt-Aggregatoren (costgoat 5.9.2026, northflank, eucloudcost
  17.8.2026) — hetzner.com rendert die Preistabellen per JavaScript und gab sie nicht heraus. Die
  Dedizierten-Preise sind dagegen aus Hetzners **eigener** Doku (`docs.hetzner.com/…/price-adjustment`).
  Eine Suchmaschinen-Zusammenfassung nannte CCX33 = €48.49; das ist der **Vor-Juni-Stand** und falsch.
- **Infomaniak/Exoscale**: Preisseiten JS-gerendert; Zahlen aus infoswitch.fr (Jan 2026) bzw.
  eucloudcost (17.8.2026). Beide fallen ohnehin an der Grösse bzw. am Preis, das Risiko ist folgenlos.
- **Latenz Nürnberg → Zürich nicht gemessen.** Erfahrungsgrössenordnung 8–12 ms gegen 4–6 ms ab Genf;
  gegen die Dauer einer kalten FTS5-Abfrage ist der Unterschied Rauschen — aber es ist eine Schätzung,
  kein Messwert.
- **netcup-Upgradepfad RS 4000 → RS 8000** ohne Neuinstallation: im Juli-Dossier behauptet, heute nicht
  erneut verifiziert. Offen.
- **Weitere netcup-Preisrunde**: netcup hat 2026 bereits einmal erhöht (19.3. neu / 1.5. Bestand,
  +18,5 %/+24,3 %) und begründet das mit der Speicherkrise. Eine erneute Runde ist nicht
  ausgeschlossen; die 1-Monats-Laufzeit ist deshalb der richtige Start, nicht die 12-Monats-Bindung.

## 8 Entscheid David 8.9.2026

Wörtlich: «also beste option wie ich es lese ist ein mac mini und der netcup RS 4000 G12 server» ·
«ich werde nächsten sonntag den server bestellen» (= Sonntag 13.9.2026). Präzisierung der
orchestrierenden Session (bestätigt): ein Mac mini als **Prüfrechner** ist NUR sinnvoll, wenn «Repo
privat» geschaltet wird, und braucht dann eine Linux-Umgebung (z. B. OrbStack) wegen abweichender
Linux-Schriftmetriken gegenüber macOS. Die Hetzner Storage Box BX11 als anbieterfremdes Backup-Ziel
ist **Pflicht** (ein Backup auf demselben Host wie die Produktion zählt nicht als Backup, s. Ziff. 5).
Laufzeit 1 Monat, **kein** Jahresrabatt — Begründung s. Ziff. 7 (Preisrunden-Historie 2026).
