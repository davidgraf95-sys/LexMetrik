# Norm-Vorschau — Volltext-Snapshot-System (Bund + Kantone)

**Erstellt:** 16.6.2026, Auftrag David (Feature «Popup mit Gesetzestext statt
Weiterleitung», dann «erstelle Regel für künftigen Build» + «nochmals Bibliothek
pflegen»). Dokumentiert das gebaute Snapshot-/Popover-System als Wissensablage
(§11) und die verbindliche Build-Regel (CLAUDE.md §7).
**Status:** ZWEIFACH GEPRÜFT (Extraktion + zwei unabhängige adversariale
Bug-Check-Durchgänge + Drift-/Vollständigkeits-Checks grün) · fachliche Abnahme
David offen (§7) — Branch `feat/normtext-popup`, ungepusht.

**Quellen:**

| Quelle | Art | Stand/Abruf |
|---|---|---|
| Fedlex Filestore-HTML (konsolidierte Fassungen), je ELI/Konsolidierung in `scripts/fedlex-cache.sh` gepinnt | amtlich (Bund), `id="art_*"`-Anker | Konsolidierungen wie gepinnt; alle via `check:fedlex-versionen` als «aktuell» bestätigt 16.6.2026 |
| LexWork-API `https://<host>/api/{de\|fr}/texts_of_law/{id}` (18+ Kantone: belex/clex/srl/gdb/bgs/bdlf/gesetzessammlung/gr-lex/rechtsbuch/lex.vs …) | amtlich (Kanton), JSON `text_of_law.selected_version.xhtml_tol` | `current_version`; Abruf 16.6.2026 |

---

## Was es ist

Beim Klick auf einen Normverweis (Bund-Norm-Chip oder kantonale Tarif-Quelle)
öffnet ein Popover den **Volltext des einschlägigen Artikels** statt sofort
extern weiterzuleiten; die zitierte Stelle (Absatz/lit./Ziff.) ist markiert,
Fuss zeigt «In Kraft seit» + Live-Link zur geltenden Fassung. Architektur:

- **Build-time-Snapshots** (`scripts/normtext-snapshot.ts`, `npm run normtext`)
  → statische JSON unter `public/normtext/{bund,kanton}/` (+ Kanton-Manifest
  `index.json`, Key = quelleUrl).
- **Client-Loader** (`src/lib/normtext/laden.ts`) lädt lazy je Datei (nie im
  Bundle); **`NormPopover`** rendert; Trigger = `NormChip` (Bund, via
  `bundRef.ts`/`fedlex.ts`) bzw. `KantonArtikelTrigger` (Kanton, via
  `KantonQuelleLink.tsx`). Progressive Enhancement: ohne Snapshot ehrlicher
  Fallback (Live-Link), Prerender/PDF/Golden unverändert.

## Datenmodell (`src/lib/normtext/typen.ts`)

`NormSnapshot{ id, ebene, quelle, erlass, artikel, artikelLabel, bloecke, stand,
quelleUrl, abgerufen, fassungsToken, sha }`; `bloecke: { absatz, text, items?:
{marke,text}[] }`. `items` = lit. (Bund, aus `<dl><dt>/<dd>`) bzw. Ziff. (Kanton,
aus `enumeration_item`-Tabellen ODER inline `1. …`). `stand` = In-Kraft-Datum der
geltenden Fassung. `fassungsToken` = Konsolidierung (Bund) bzw. `version_uid`
(Kanton) — Drift-Anker. `sha` über Text + items.

## Abdeckung (Stand 16.6.2026)

- **Bund: 5760 Artikel / 18 Gesetze** — VOLLABDEKUNG (jedes `<article>` der
  gepinnten Konsolidierung, nicht nur zitierte). OR 1603, ZGB 1099, ZPO 426,
  StPO 478, StGB 477, SchKG 400, BGG 139, ArG 83, HRegV/KVV/… Rest.
- **Kantone: ~178 Snapshots / 19 Kantone** über den EINEN LexWork-Adapter
  (zitierte Tarif-Artikel je Erlass; inkl. vollständiger Ziffern + Gebühren-
  tabellen).

## Genuine Lücken (kein Snapshot — ehrlicher Fallback, §8)

Vom Vollständigkeits-Check (`check:vollstaendigkeit`) als GENUIN bestätigt:
- **nurPdf** (`structured_document_id: null`, kein strukturierter Text): SG 941.12,
  SG 914.5, OW 210.32, AR 153.2.
- **API-404** (lawId-Pfad existiert nicht): SH 273.100 → Tarif-Daten-`erlassNr`
  prüfen.
- **Token nicht im Erlass**: OW 134.15 art_7 (aufgehoben), LU 228 §29 (Erlass hat
  nur §§ 1–20 — verdächtige Tarif-Zitatstelle, separat prüfen).
- **Nicht-LexWork**: NW 265.51; sowie generell ZH (zhlex), UR/SZ-PDF (lexfind),
  TI/VD/NE/GE/JU (Eigenformate) — bleiben Live-Link bis ein Adapter existiert.

## Build-Regel (verbindlich — CLAUDE.md §7, Detail FAHRPLAN-GESETZESTEXT-POPUP.md)

Snapshots NUR via `npm run normtext -- --datum=$(date +%F)`, nie von Hand. Muster:
(1) Vollabdeckung aller Artikel je Erlass; (2) Aufzählungen (lit./Ziff.) als items
vollständig; (3) immer die GELTENDE Fassung (Bund: gepinnte+verifizierte
Konsolidierung; Kanton: `current_version`/`version_uid`); (4) Provenienz je Eintrag
(§7 Zitat-Ausnahme); (5) Drift-Tor `check:normtext`(-netz) grün. Neue Quelle =
browserloser Adapter (Fetch + strukturierte Extraktion + Drift-Token), kein
Headless-Browser, kein Pro-Kanton-Scraping.

## Verifikation & Pflege

- **Drift/In-Kraft:** `check:fedlex-versionen` (Bund-Konsolidierungen) +
  `check:normtext-netz` (Kanton `version_uid` live == gespeichert) — 16.6.2026:
  alle Pins aktuell, Kanton-Drift 0.
- **Vollständigkeit:** `check:vollstaendigkeit` (Bund-Extraktion 1:1 zur Cache-HTML;
  Kanton-Zitate via Laufzeit-Auflösung quelleUrl+token; Inhalts-Sanity; Manifest).
- **Bug-Check 16.6.2026 (2 unabhängige Agenten):** behoben — Fussnoten-Reste im
  Kanton-Text, Token-Normalisierung `1a`, In-Kraft-Datum (de + fr «en vigueur
  depuis»), Tabellen-Extraktion, präzise Einzel-Item-Markierung, `Abs.-bis/ter`-
  Parsing, lit/Ziff-Wortgrenze, Vollständigkeits-Check auf Laufzeit-Auflösung.
- **Pflege:** Rechtsänderung → Drift-Check rot → `npm run normtext` neu; Pins in
  `fedlex-cache.sh` + `register/quellen-register.md` nachführen.
