# Artikel-Stabilitäts-Report (QS-DATA E1) — Struktur-Basis

- **Quelle/Stand:** committete Bund-Snapshots `public/normtext/bund/*.json` (Stand 2026-06-30),
  reverse-ingestiert ins Zielschema `artikel`/`erlass_fassungen` (Spalten-Weg, E1).
- **Erzeugt:** 2026-07-03 · read-only, kein Tor (`npm run datenhaltung:stabilitaet`).
- **Abnahme-Status:** Erstmessung (maschinell), keine Fachabnahme.

## Ehrliche Grenze (§8)

Der Fassungs-Diff aus FAHRPLAN-DATENHALTUNG §3.3 Stufe 3 (Anteil `art_id`s
**stabil / verändert / verschwunden** über die letzten N Revisionen) ist in E1 **NICHT
messbar**: je Erlass liegt **genau EINE Fassung** in `erlass_fassungen` vor
(max. Fassungen je Erlass = **1**). Der Historie-Rohstoff
(Fedlex-Portfolio Paket 5 → `erlass_fassungen`) speist erst ab einem späteren
Ingest-Zyklus. Dieser Report misst darum nur die **Struktur-Basis**, gegen die
künftige Fassungen den Diff rechnen.

## Struktur-Basis (Messung 2026-07-03)

| Kennzahl | Wert |
|---|---|
| Erlasse (Bund, Fassungen mit Ziel-Zeilen) | 218 |
| Artikel-Zeilen (`art_id` gesamt) | 24858 |
| davon Haupttext (`art_*`) | 24191 |
| davon Schlussteil (`disp_*`) | 277 |
| davon Anhang (`annex_*`) | 338 |
| Artikel mit Delegationsnorm (`grundlage`) | 1497 |
| `art_id` je Erlass — min / median / max | 12 / 79 / 1686 |

### Grösste Erlasse (art_id-Zahl)

| Erlass | art_id |
|---|---|
| OR | 1686 |
| ZGB | 1277 |
| STPO | 480 |
| STGB | 477 |
| ZPO | 430 |
| SCHKG | 404 |
| AHVV | 311 |
| AVO | 305 |
| MSTP | 299 |
| MSTG | 298 |
| VTS | 292 |
| KVV | 263 |

## Baseline für spätere Diffs

- Jede `art_id` je Erlass ist der Anker: eine **neue Fassung** vergleicht ihre
  `art_id`-Menge + je Artikel den `sha` (Umzugs-Erkennung, §3.3 Stufe 2) gegen
  diese Basis → stabil (sha gleich) / verändert (sha ≠) / verschwunden (art_id fehlt).
- Der Mechanismus steht (Spalten `art_id` + `sha` befüllt); es fehlt allein die
  zweite Fassung. Sobald `erlass_fassungen` > 1 Fassung je Erlass trägt, liefert
  dieselbe Query die echten Stabilitäts-Quoten.
