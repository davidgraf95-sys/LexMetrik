# Kantonale Systematik — Top-Level-Sachgebiete (Labels + Bezugsquelle)

**Erstellt:** 23.6.2026 (Auftrag David: übersichtlichere Darstellung der Gesetze je
Kanton → Gliederung nach amtlicher Systematik). · **Abrufdatum: 23.6.2026** ·
**Status: ZWEIFACH GEPRÜFT** (amtliche clex/LexWork-API + unabhängige Gegenprüfung
durch 3 Recherche-Agenten gegen die amtlichen Sammlungen; Abnahme David ausstehend).

## Quelle (deterministisch, nicht hardcodiert)

Die Top-Level-Sachgebiete je Kanton kommen aus der amtlichen clex/LexWork-API:
`GET https://<host>/api/de/systematic_categories`
→ `[{ systematic_category: { systematic_number, name, children:[…] } }, …]` (voller
Baum). Der Generator `scripts/normtext/kanton-systematik-run.ts` flacht den Baum zu
`public/normtext/kanton-systematik.json` ab (`{roots, index}` je Kanton); die UI
ordnet via Längster-Präfix-Match (`sachgruppe()`), §2/§7. **lexfind.ch** hat eine
harmonisierte „Schweizerische Systematik"-Ansicht, aber KEINE offene API dafür
(SPA, Endpunkte 404) — Strukturquelle ist der per-Kanton-clex-Backend, den lexfind
selbst rendert.

## Befund: drei Schema-Familien (NICHT einheitlich, kein Pauschal-Mapping)

1. **Einfaches Dezimalschema 1–9** (erste Ziffer = Sachgebiet): AG, AI*, AR, BE,
   BL, BS, FR, GR, NW, OW, SG, SH, SO, TG, VS. *AI nutzt Hunderter (100…900).
   **ABER Labels je Kanton verschieden** — Beispiele:
   - BS/AR/BE/Standard: **6 = Finanzen**, 3 = Strafrecht.
   - **BL Sonderfall: 3 = Finanzen, 5 = Volkswirtschaft, 9 = Gesundheit** (NICHT verwechseln!).
   - **SG: 9 = Zivil-/Strafrecht/Rechtspflege, 8 = Finanzen** (Sachgebiete anders gereiht).
2. **UR**: Top-Level `1/2/3/9` + `10/20/…/70` (keine 4–8). Präfix-Match nötig
   (40.1111 → 40, nicht 4).
3. **ZG**: zusätzlich `10 Verpflichtungskredite`. Präfix-Match nötig.

**Sonderfälle ohne reines Ziffernschema (bei Import gesondert behandeln):**
- **GL**: römische Ziffern I–IX + Buchstaben (`GS IV G/3/1`) — Ziffern-Präfix-Match
  greift NICHT; aktuell neutraler Fallback. Sonderregel nötig, sobald GL importiert.
- **LU**: 9 „Bände"; SRL-Nummer ist nicht garantiert leitziffer-treu — Band-Zuordnung
  nötig, sobald LU importiert.
- Nicht-clex-Kantone (ZH, GE, NE, JU, SZ, TI, VD): kein `systematic_categories` →
  neutraler Fallback „Bereich N" bis Tier-C-Anbindung.

## Pflegebedarf / Abnahme

Labels stammen direkt aus der amtlichen API (re-generierbar) → kein manueller
Drift. Stand der Daten = Abruf 23.6.2026. Schema-Flags GL/LU vor deren Import
auflösen. Vollständige per-Kanton-Ziffer→Titel-Listen: in der erzeugten
`public/normtext/kanton-systematik.json` (SSoT). Ergänzt
[kantons-tier-karte.md](kantons-tier-karte.md).
