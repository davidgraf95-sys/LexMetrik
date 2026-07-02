# Fedlex Coverage- & Currency-Gap-Report — Bund

**Stand:** 2026-07-02 · **Methode:** SPARQL-Sweep (`fedlex.data.admin.ch/sparqlendpoint`, `jolux:dateApplicability`) über alle 229 Bund-Erlasse des Normtext-Registers, `dateApplicability ≤ heute` = geltende Fassung, verglichen mit unserem `fassungsToken`/Pin.

> **Quellen-Hygiene:** Der Report ist **SPARQL-nativ** (amtliche Quelle). Das Dritt-Repo `droid-f/fedlex` (CC BY-NC-SA) wurde **nicht** als Datenquelle verwendet — nur die freien Fakten (SR-Inventar) wären daraus zulässig; hier nicht nötig. Kein fremdes Byte fliesst ins Produkt.

## 1. Coverage — keine unbeabsichtigten Lücken

218 von 229 Bund-Erlassen als Volltext (`snapshot`). Die 11 Nicht-Volltexte sind **bewusst** Stubs (EU-Verordnungen ohne CH-Amtsvolltext + Staatsverträge als PDF-Embed):

| Kürzel | SR | Status | Titel |
|---|---|---|---|
| PrHG | 221.112.944 | nur-live-link | Bundesgesetz vom 18. Juni 1993 über die Produkte |
| EMRK | 0.101 | pdf-embed | Konvention vom 4. November 1950 zum Schutze der  |
| DSGVO | None | nur-live-link | Verordnung (EU) 2016/679 (Datenschutz-Grundveror |
| DSA | None | nur-live-link | Verordnung (EU) 2022/2065 über einen Binnenmarkt |
| DMA | None | nur-live-link | Verordnung (EU) 2022/1925 über bestreitbare und  |
| KI-VO | None | nur-live-link | Verordnung (EU) 2024/1689 zur Festlegung harmoni |
| MiCA | None | nur-live-link | Verordnung (EU) 2023/1114 über Märkte für Krypto |
| Rom I | None | nur-live-link | Verordnung (EG) Nr. 593/2008 über das auf vertra |
| Rom II | None | nur-live-link | Verordnung (EG) Nr. 864/2007 über das auf ausser |
| Brüssel Ia | None | nur-live-link | Verordnung (EU) Nr. 1215/2012 über die gerichtli |
| NYÜ | 0.277.12 | pdf-embed | Übereinkommen vom 10. Juni 1958 über die Anerken |

**Verdikt:** Coverage vollständig; kein Volltext-Erlass fehlt versehentlich. Fedlex ist Bund-only — die 1231 Kantons-Erlasse sind hier nicht Gegenstand.

## 2. Staleness — 20 Erlasse mit neuerer geltender Fassung  ⚠️ AKTIONABEL

Fedlex führt für diese Erlasse eine **neuere in Kraft stehende Konsolidierung** als unser Snapshot. Ursache: der Halbjahres-Zyklus (viele Erlasse revidieren per 1.1. / 1.7.) ist gelandet.

### 2a. Blinde Flecken — 6 stale UND nicht gepinnt (Cron `check:fedlex-versionen` sieht sie strukturell NICHT)

| Kürzel | SR | unser Stand | Fedlex geltend | Status |
|---|---|---|---|---|
| EMRK | 0.101 | 2005-03-23 | 2022-09-16 | pdf-embed |
| NYÜ | 0.277.12 | 2020-02-07 | 2026-05-06 | pdf-embed |
| AsylV 1 | 142.311 | 2026-01-01 | 2026-06-12 | snapshot |
| AsylV 2 | 142.312 | 2022-01-01 | 2026-06-12 | snapshot |
| AsylV 3 | 142.314 | 2024-06-01 | 2026-06-12 | snapshot |
| ArGV 2 | 822.112 | 2025-12-01 | 2026-02-01 | snapshot |

### 2b. Gepinnt & überholt — 14 (Cron sollte diese bereits als ÜBERHOLT/Exit-1 melden; Pins per Juli-2026 nachführen)

| Kürzel | SR | unser Stand | Fedlex geltend |
|---|---|---|---|
| ICAO-Übk. | 0.748.0 | 2025-11-27 | 2026-06-12 |
| BPV | 172.220.111.3 | 2026-01-01 | 2026-07-01 |
| RPG | 700 | 2026-04-01 | 2026-07-01 |
| RPV | 700.1 | 2026-05-20 | 2026-07-01 |
| SVG | 741.01 | 2025-04-01 | 2026-07-01 |
| VRV | 741.11 | 2026-04-01 | 2026-07-01 |
| SSV | 741.21 | 2025-07-01 | 2026-07-01 |
| VTS | 741.41 | 2026-04-30 | 2026-07-01 |
| VIL | 748.131.1 | 2024-01-01 | 2026-07-01 |
| FDV | 784.101.1 | 2026-03-01 | 2026-07-01 |
| MepV | 812.213 | 2023-11-01 | 2026-07-01 |
| KVG | 832.10 | 2026-01-01 | 2026-07-01 |
| KVV | 832.102 | 2026-01-01 | 2026-07-01 |
| KLV | 832.112.31 | 2026-05-11 | 2026-07-01 |

## 3. Angekündigte künftige Fassungen — 56 (Staleness-TTL / Re-Extraktions-Horizont)

Fedlex hat bereits future-dated Konsolidierungen im Triplestore. Je Erlass das **nächste** Inkrafttreten > heute — Wiedervorlage zum Nachziehen des Volltexts:

| ab | Kürzel | SR | unser Stand |
|---|---|---|---|
| 2026-08-01 | BüV | 141.01 | 2019-07-09 |
| 2026-08-01 | ZEMIS-V | 142.513 | 2026-06-12 |
| 2026-08-01 | KVV | 832.102 | 2026-01-01 |
| 2026-08-01 | BVV 2 | 831.441.1 | 2025-01-01 |
| 2026-08-01 | AVIV | 837.02 | 2026-01-01 |
| 2026-08-01 | KLV | 832.112.31 | 2026-05-11 |
| 2026-08-01 | FZV | 831.425 | 2024-03-01 |
| 2026-10-01 | OR | 220 | 2026-01-01 |
| 2026-10-01 | BEG | 957.1 | 2023-01-01 |
| 2026-10-01 | StGB | 311.0 | 2026-06-12 |
| 2026-10-01 | BBG | 412.10 | 2025-03-01 |
| 2026-10-01 | GwG | 955.0 | 2024-03-01 |
| 2026-10-01 | BankG | 952.0 | 2024-01-01 |
| 2026-10-01 | FIDLEG | 950.1 | 2024-03-01 |
| 2026-10-01 | KAG | 951.31 | 2024-03-01 |
| 2026-10-01 | FINIG | 954.1 | 2024-03-01 |
| 2026-12-01 | ChemRRV | 814.81 | 2026-01-01 |
| 2027-01-01 | PatG | 232.14 | 2025-07-01 |
| 2027-01-01 | MSchV | 232.111 | 2025-07-01 |
| 2027-01-01 | DesV | 232.121 | 2025-07-01 |
| 2027-01-01 | VwVG | 172.021 | 2022-07-01 |
| 2027-01-01 | VGG | 173.32 | 2026-06-12 |
| 2027-01-01 | VG | 170.32 | 2025-06-15 |
| 2027-01-01 | BPG | 172.220.1 | 2024-01-01 |
| 2027-01-01 | AIG | 142.20 | 2026-06-12 |
| 2027-01-01 | AsylG | 142.31 | 2026-06-12 |
| 2027-01-01 | FINMAG | 956.1 | 2025-04-01 |
| 2027-01-01 | HMG | 812.21 | 2025-01-01 |
| 2027-01-01 | VZV | 741.51 | 2026-01-01 |
| 2027-01-01 | BankV | 952.02 | 2025-01-01 |
| 2027-01-01 | ERV | 952.03 | 2025-01-24 |
| 2027-01-01 | BPV | 172.220.111.3 | 2026-01-01 |
| 2027-01-01 | RVOV | 172.010.1 | 2026-03-01 |
| 2027-01-01 | EnG | 730.0 | 2026-04-01 |
| 2027-01-01 | EBG | 742.101 | 2026-01-01 |
| 2027-01-01 | FINMA-GebV | 956.122 | 2024-03-01 |
| 2027-01-01 | IVG | 831.20 | 2026-01-01 |
| 2027-01-01 | MWSTV | 641.201 | 2025-01-01 |
| 2027-06-01 | BVV 3 | 831.461.3 | 2025-01-01 |
| 2027-09-26 | BVG | 831.40 | 2025-01-01 |
| 2028-01-01 | GSchV | 814.201 | 2025-12-01 |
| 2028-01-01 | KVG | 832.10 | 2026-01-01 |
| 2028-01-01 | EOV | 834.11 | 2026-06-01 |
| 2028-07-01 | FAV | 784.101.2 | 2024-08-15 |
| 2029-01-01 | BV | 101 | 2024-03-03 |
| 2029-01-01 | FinfraG | 958.1 | 2024-02-01 |
| 2029-01-01 | DBG | 642.11 | 2026-01-01 |
| 2029-01-01 | StHG | 642.14 | 2025-01-01 |
| 2029-01-01 | ELG | 831.30 | 2026-01-01 |
| 2029-08-01 | BetmG | 812.121 | 2023-09-01 |
| 2031-01-01 | VRV | 741.11 | 2026-04-01 |
| 2031-01-01 | VTS | 741.41 | 2026-04-30 |
| 2032-07-01 | GlG | 151.1 | 2020-07-01 |
| 2032-07-01 | VKL | 832.104 | 2025-06-01 |
| 2034-01-01 | AHVG | 831.10 | 2026-01-01 |
| 2034-01-01 | AHVV | 831.101 | 2026-01-01 |

## 4. Fulltext ausserhalb der Cron-Überwachung — 11 Volltexte ohne Pin

Diese Erlasse sind als Volltext ausgeliefert, stehen aber **nicht** in `fedlex-cache.sh` → keine automatische Currency-Warnung. Kandidaten zum Pinnen:

AsylV 1 (SR 142.311), AsylV 2 (SR 142.312), AsylV 3 (SR 142.314), CO2-Gesetz (SR 641.71), BVV 2 (SR 831.441.1), ArGV 1 (SR 822.111), BVV 3 (SR 831.461.3), ArGV 2 (SR 822.112), ArGV 3 (SR 822.113), ArGV 4 (SR 822.114), ArGV 5 (SR 822.115)

## 5. Methode & Reproduzierbarkeit

- **Population:** `public/normtext/register.json` → `ebene == bund` (229 Erlasse).
- **ELI-Ableitung:** `quelleUrl` → Abstract-ELI (Sprach-Suffix entfernt).
- **SPARQL:** `?c jolux:isMemberOf <abstract> ; jolux:dateApplicability ?date` in Batches à 60; geltend = `max(date ≤ 2026-07-02)`, künftig = `min(date > 2026-07-02)`.
- **Pins:** `scripts/fedlex-cache.sh` (Format `name|eli|YYYYMMDD|…`), 207 Pins.
- **Alle 229 ELIs** lieferten SPARQL-Treffer (0 Fehltreffer → keine kaputten Quell-URLs).

**Ehrliche Einschränkungen:**
- `dateApplicability` ist der Currency-Arbiter, aber die **Konsolidierung trailt die AS** — ein per 2026-07-02 in Kraft getretenes AS-Amendment kann noch nicht konsolidiert sein (STALE-PENDING via RSS-OC, hier nicht geprüft).
- Staleness heisst «neuere Fassung existiert», **nicht** dass sich für uns relevante Artikel geändert haben — vor Re-Extraktion Artikel-Diff.
- Report ist eine **Momentaufnahme**; die laufende Wahrheit bleibt `check:fedlex-versionen` (Pins) — dieser Report ergänzt um die 6 ungepinnten blinden Flecken.
