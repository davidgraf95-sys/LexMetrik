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

## Regel: Kantonales Gesetz nur als PDF (Auftrag David 17.6.2026)

«Wenn es ein kantonales Gesetz im PDF ist, dann erstelle Regel, wie du das
extrahierst und sinnvoll abspeicherst.» Verbindliches Vorgehen — eingereiht in
die Quellen-Priorität, NIE Hand-Editieren des Snapshots, NIE Headless-Browser:

**Quellen-Priorität je (Kanton, Erlass)** — die erste verfügbare gewinnt:
1. **LexWork-JSON** (`structured_document_id` vorhanden) → `adapter-lexwork.ts`.
2. **Word-Export-HTM** (NE/GE/TI-Variante) → `adapter-htm.ts`.
3. **Strukturiertes HTML** (z. B. TI m3.ti.ch `legge/num`) → eigener HTML-Pfad.
4. **PDF** (nur wenn 1–3 fehlen) → `adapter-pdf.ts` per **Profil** (siehe unten).
5. **Sonst** → ehrlicher Live-Link-Fallback (§8), KEIN geschätzter Text.

**PDF extrahieren (browserlos, Build-Zeit) — `adapter-pdf.ts`:**
- **Ein `PdfProfil` je Layout-Familie** (nicht je Erlass, wenn das Layout gleich
  ist): definiert URL-Ableitung (lawId → amtliche PDF-URL), die **Body-Spalten-x**
  (Marginalie/Sachtitel/Randnummer liegen LINKS davon und werden verworfen),
  Kopf-/Fusszeilen-Marker und den **Stand-Leser** (In-Kraft-/Fassungsdatum aus
  Kopf/Fuss). Vorhandene Profile: `sz | ti | vd | ju` — neues Layout = neues Profil.
- **pdfjs-Textitems** mit x/y/Höhe lesen; nach Body-Spalte filtern; Zeilen über
  y gruppieren; **Artikel** an `Art. N`/`§ N` segmentieren (§≡Art., `parsePassus`);
  **Absatz** = hochgestellte Ziffer (kleine Höhe) am Zeilenanfang; **Aufzählung**
  (`a. …` / `1. …`) als `items: {marke,text}[]`. Nichts abschneiden (Vollabdeckung).
- **Qualitäts-Tor:** Liefert das Profil für einen Erlass keine plausiblen Artikel
  (0 Treffer, zerrissene Spalten), wird NICHT gespeichert → Fallback (4→5). Lieber
  ehrlicher Link als falscher Volltext (§1/§8).

**Sinnvoll abspeichern** (identisch zu Bund/LexWork, ein `NormSnapshot` je Artikel):
- `bloecke` (Absätze + items), `artikelLabel` einheitlich (`§ N` / `Art. N`),
  aufgehobene Artikel als «aufgehoben»-Block (Konvention «…»).
- **Provenienz (§7-Zitat-Ausnahme):** `stand` (aus dem Profil-Stand-Leser),
  `quelleUrl` (amtliche PDF/Seite, im Popover als Live-Link sichtbar),
  `fassungsToken` + `sha` (über Text+items) als **Drift-Token**.
- Datei unter `public/normtext/kanton/`, Eintrag im Manifest `index.json`
  (quelleUrl → Datei) — automatisch durch den Generator, nie von Hand.

**Drift/Pflege:** `check:normtext-netz` re-fetcht das PDF und vergleicht den
Token; ändert der Kanton das PDF, wird der Check rot → `npm run normtext` neu.
Das Snapshot ist NIE die massgebliche Fassung — das ist die amtliche Quelle
(Live-Link, §8). **Abdeckungs-Log (kein stilles Cap):** der Generator listet am
Ende jede (Kanton, Erlass)-Kombination, die ohne Snapshot blieb, als Klartext.

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

## Darstellungs-Regeln Norm-Popover (`NormPopover.tsx`, Stand 17.6.2026)

Verbindliche, EINHEITLICHE Darstellung über ALLE Quelltypen (Bund-fedlex,
LexWork, HTM, PDF, Anhang-Tarif). Grundsatz (Freigabe David 17.6.2026): die
**Darstellung darf normalisiert werden, der WORTLAUT bleibt unangetastet** — es
wird nie ein Zeichen geändert/entfernt/umgestellt, nur PDF-bedingt fehlende
Trenn-Leerzeichen ergänzt bzw. Layout (Zeilen/Hervorhebung) gesetzt.

1. **Titel:** `artikelLabel` («Art. 335c» / «§ 4» / «Anhang Ziff. 2.2.1») + Erlass.
2. **Absätze:** in Quell-Reihenfolge, hochgestellte Absatznummer (¹²³…).
3. **Aufzählungen** (lit. Bund / Ziff. Kanton): eingerückte Liste mit Marke —
   einheitliches Markup, nur die Marke unterscheidet sich (§3/§5).
4. **Aufgehobene Stellen** (Snapshot trägt faithful nur «…»): gedämpftes
   «aufgehoben» (Absatz UND Item).
5. **Tarif-Staffeln** (PDF-Spalten verschmelzen zu einem Blob): zeilenweise je
   Band — (a) «über N …»-Staffeln, (b) «–<Wort>»-Anhang-Bänder. Eng getriggert
   (Fee-Marker + ≥2 Bänder), damit normale Absätze nie zerschnitten werden.
6. **Tarif-/Anhang-Text-Normalisierung** (`normalisiereTarifText`): NUR im
   Tarif-Kontext (gepunkteter Ziffer-Token ODER erkannte Staffel) werden vom PDF
   verschluckte Trenn-Leerzeichen ergänzt — Buchstabe↔Ziffer («Allgemeinen1.1.1»
   → «Allgemeinen 1.1.1») und ‰↔Ziffer («1‰4.1» → «1‰ 4.1»). Reguläre Artikel
   (Bund/LexWork, sauber extrahiert) werden NIE normalisiert.
7. **Datum IMMER `DD.MM.YYYY`** (`formatiereDatum`). Label nach Ebene:
   **Bund → «Fassung vom:»**, **Kanton → «In Kraft seit:»**.
8. **Hervorhebung:** die zitierte Stelle (Absatz, sonst genau das lit/Ziff-Item)
   wird markiert und ins Sichtfeld gescrollt.
9. **Fuss:** Live-Link «↗ geltende Fassung» (mit Text-Fragment auf die zitierte
   Stelle) + Disclaimer «massgeblich ist die amtliche Fassung».
10. **Bekannte Grenze:** PDF-Spalten-Verschränkung MIT Silbentrennung
    («Begrün-2.2.1, 2.2.2, dung») bleibt — eine Display-Regel kann das nicht von
    echten Hängestrich-Komposita («Kaufs-, Rückkaufs- und …») unterscheiden;
    vollständige Auflösung nur über spaltenbewusste Extraktion (offen, ZH-Anhang).

## M13 — Schlussteil (Schlusstitel/UeB/Schlussbestimmungen), Bund (30.6.2026)

**Quelle/Stand:** Fedlex-Filestore-HTML, gepinnte Konsolidierungen (ZGB
`cc/24/233_245_233`/20260101, OR `cc/27/317_321_377`/20260101, PatG/SchKG/SVG
analog `scripts/fedlex-cache.sh`). Abrufdatum 2026-06-29 (gleicher Fetch wie B1).

**Befund (Lücke):** Fedlex legt **neu-nummerierte Schluss-Divisionen** unter einem
EIGENEN Anker-Schema ab — `<article id="disp_uN/art_*">`, gewickelt in
`<div id="dispositions">` **ausserhalb `<main>`**. Diese Artikel beginnen mit
eigener Nummerierung (Art. 1, 2 …) und KOLLIDIEREN mit dem Haupttext (`art_1`).
Der digit-only-Enumerator `alleArtikelTokens` (`/id="art_(\d[\w]*)"/`) erfasste
sie nicht → sie fehlten komplett (ZGB 178, OR 83, PatG 9, SchKG 4, SVG 1 = **275**).

**Regel (deterministisch):**
1. **Enumerieren:** `alleSchlussteilAnker(html)` matcht `<article id="disp_uN/art_*">`
   in HTML-Reihenfolge (Doppelte → `__N`-Suffix wie Haupttext).
2. **Token-Namespace (Kollisions-Falle gelöst):** `ankerZuToken` bildet aus dem
   Anker ein dateiweit EINDEUTIGES Token: `art_335_c`→`335_c` (Haupttext, byte-gleich);
   `disp_u1/art_1`→`disp_u1_art_1` (`/`→`_`). So überschreibt der Schlusstitel-Art.1
   NIE den Haupttext-Art.1 (`id`, Golden-Key, Struktur-Sidecar, DOM-Anker alle disjunkt).
3. **Extrahieren:** `extrahiereArtikelAusAnker(html, anker)` — identische Block-
   Parserei wie Haupttext (Absatz/dl/Tabelle byte-gleich), nur das gesuchte
   `<article id>` unterscheidet sich. `extrahiereArtikel(token)` delegiert hierhin.
4. **Speichern (additiv):** an dieselben `eintraege[]` angehängt; `artikel`=Token,
   `artikelLabel`=`artikelLabel(reinerSuffix)` (Range «Art. 31–32» korrekt),
   `quelleUrl`=ECHTER Anker `#disp_u1/art_1`.
5. **Gruppieren:** Struktur-Sidecar (`struktur-extrahiere.ts`, ID-Regex um
   `(?:disp_uN/)?art_` geöffnet) liefert die Gliederung («Schlusstitel: Anwendungs-
   und Einführungsbestimmungen» u.ä.) — der gliederungsgetriebene Reader bildet
   daraus von selbst eine neue Top-Sektion. **Kein Renderer-Umbau.**

**Bewusste Abweichung vom B2-Plan (§7/§1):** KEINE neue Schema-Dimension
`NormSnapshotDatei.anhaenge[]` — die Schlussteil-Artikel SIND Artikel und werden
über den Token-Namespace + Sidecar in die bestehende Maschinerie integriert
(niedrigerer Blast-Radius: 0 Renderer-Änderung, Haupttext-Golden byte-gleich).
Re-Bless rein additiv: golden/normtext-snapshot.json +275 disp-Keys, **0 geändert,
0 entfernt** (Engine-Golden unberührt).

**Geltungsbereich/Ausnahmen:** disp-Divisionen sind selten — nur 5 Bund-Gesetze
(die meisten Schlussbestimmungen sind reguläre `art_` im Hauptteil, längst erfasst).
Divisionen je Gesetz: ZGB 2, OR 13, PatG/SchKG/SVG je 1. Range-Artikel
(`disp_u1/art_31_32`) und «aufgehoben»-Stellen («…») korrekt.

**Tore:** `check:vollstaendigkeit` erweitert (Schlussteil-Anker mitgeprüft,
kollisionsfreies Token verhindert Maskierung durch gleichnamigen Haupttext-Art.);
`check:normtext`-Drift additiv grün; neue Unit-Tests (Enumerator/Extraktor/Token/
Label/Vollständigkeit). Voll-Gate grün + Playwright-Sicht (ZGB 2 Div., OR 13 Div.).
**NEU `check:struktur-konsistenz`** (aus Gegenprüfung): prüft je Bund-Gesetz, dass
die Struktur-Sidecar-Schlüssel exakt den Snapshot-Token entsprechen (kein
verwaister/fehlender Schlüssel; `__N`-Doppelartikel ausgenommen). Hintergrund:
Snapshot und Struktur werden von ZWEI Generatoren gebaut; vorher konnte ein
vergessener `normtext:struktur`-Lauf das Sidecar STILL veralten lassen (real: OR
auf main — `219_a`/`226_*` ohne Gliederung). Das Tor hätte den OR-Drift ROT gefangen.

**Gegenprüfungs-Fix F1:** `ladeSnapshot` baute die Lookup-id fix als `…/art_<token>`
→ für jeden Schlusstitel-Zugriff (`disp_*`) still `null`. Jetzt namespace-bewusst.

**Pflegebedarf:** keine datierten Parameter (folgt der Fedlex-Konsolidierung
mit). **Offen (M13-Rest):** Anhänge `annex_*` (G18 Anhang-Tabellen + disp-Fussnoten
G13) — separater Pass, andere Risiko-Klasse (Tabellen/Formulare).

**Abnahme-Status:** maschinell verifiziert (Golden additiv, Gate grün, Sicht-
prüfung) + 1 adversariale Gegenprüfung; **fachliche Abnahme David offen.**
