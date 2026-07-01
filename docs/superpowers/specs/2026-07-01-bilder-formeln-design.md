# Bilder & Formeln im Bund-Normtext + SSV-Signal-Tabellen

**Stand:** 1.7.2026 · Worktree `normtext-bilder-formeln` · nur Bund · kein Deploy ohne §9-Ja.

## Problem
`entferneTags` (`scripts/normtext/extrahiere-fedlex.ts`) wirft `<img>` weg → **~455 amtliche
Bilder in 29 Gesetzen** verloren: Piktogramme (SSV Verkehrssignale, VTS, chem. Warnzeichen)
und **Formeln, die Fedlex als Bild liefert** (KKG-Zinsformel, DBG Art. 22, AVO). Folge u.a.:
die SSV-Signal-Kataloge (Anhang 2) sind leere Text-Tabellen — «schrecklich formatiert»
(Nr. + Name ohne das Signal-Bild; dazu Fedlex-`[tab]`-Spacer-Reste + verrutschte Spalten).

## Leitprinzip (David 1.7.): nachhaltig, wartbar, unkompliziert
Ein **einziges, flaches** Bild-Modell. Keine Rekonstruktion der willkürlichen Fedlex-Tabellen-
Spalten — die Kataloge werden ein **flaches Karten-Raster**. Download-Logik an EINER Stelle.

## Quell-Befunde (gemessen)
- Standalone: `<p class="bild"><img src="image/imageN.png">…</p>` (auch ohne class). `src` **relativ**
  zur HTML-URL; **kein `alt`**; teils `data-scaled-width/height`.
- Signal-Zelle: `<td><p class="bild"><img …></p><dl><dt><b>1.01</b></dt><dd>Rechtskurve (Art. 4)</dd></dl></td>`.
- Bild-URL: `<filestore-basis>/<eli>/<kons>/de/html/image/imageN.png` → **200 image/png** (betmkv/dbg/ssv/vts verifiziert).
- `[tab]` = Fedlex-Platzhalter `<span data-message="…TAB">[tab]</span>` → strippen (leer).

## Datenmodell (additiv, minimal)
Block (`ArtikelText.bloecke[]`) erhält zwei optionale Felder:
- `bild?: { datei: string; alt: string; formel?: boolean; breite?: number; hoehe?: number }`
  — ein Standalone-Bild/Formel. `datei` = lokaler Pfad `bilder/<erlass>/imageN.png`.
- `bildKacheln?: Array<{ datei?: string; alt?: string; nummer?: string; name?: string }>`
  — flache Kachel-Liste aus einer Piktogramm-Tabelle (Zelle → Karte; Text-Zelle ohne Bild = Karte nur mit Text).

**Regel Tabelle (präzisiert 1.7. — «beste Option?»-Gegencheck David):** `bildKacheln` **nur bei
reinen Piktogramm-Katalogen** — Tabelle, deren nicht-leere Zellen (fast) ALLE dem Signal-Muster
folgen (`<p class="bild"><img></p>` + optional `<dl class="man-template-tab-struktur…">` mit Nr/Name).
**Gemischte/Datentabellen** (z.B. SSV Anhang 3: Zeit-Tabelle + Illustration) bleiben `mehrspaltig`
(§1 — echte Datentabelle nicht zerstören); ihre Bilder werden dennoch als `bild`-Blöcke erfasst
(gehen nicht verloren). check:tabellen unberührt. **alt** = amtliche Bezeichnung, wo vorhanden
(«Signal: Rechtskurve»), sonst «Formel (amtliche Abbildung)» / generisch (§8, keine Erfindung).

## Schichten
1. **Extraktor** (`extrahiere-fedlex.ts`, rein, kein Netz): `<img>` erkennen, **relative** src +
   Masse + (Nr/Name bei Kacheln) erfassen; `[tab]`-Spacer strippen. Kein Bild fällt still weg.
2. **Generator** (`normtext-snapshot.ts`, I/O): je Erlass jede rel. src → absolute Filestore-URL
   (aus `eli`/`konsolidierung` des Cache-Eintrags), herunterladen nach `public/normtext/bilder/<name>/`,
   **sha** über die Bytes, `datei` auf lokalen Pfad setzen. **Idempotent** (existiert+sha gleich → skip).
   **Escape-Hatch:** Nicht-200 / Content-Type ≠ image/* → **Build-Fehler** (nie stilles Bild-Loch).
3. **Anzeige** (`src/components/normtext/`): `BildFigur` (`<figure>`, `loading=lazy`, feste
   `width/height` gegen CLS, Quell-Link, Formel-Beschriftung, ehrlicher alt §8) · `BildKacheln`
   (responsives CSS-Grid, §13-Tokens: Bild oben, Nr fett + Name darunter).

## Tore & Beweise
- **`check:bilder`** (neu, `check`-Kette): jede referenzierte `datei` existiert · sha stimmt ·
  **Containment**: Anzahl `<img>` im Cache = Anzahl erfasster Bilder je Erlass (nichts gedroppt).
- Neuer Block-Typ bricht den **Daten-Index** (`golden/normtext-snapshot.json`) → bewusster Re-Bless;
  **Engine-Golden byte-gleich** (Beweis Rechtslogik unberührt). `check:vollstaendigkeit`/`-tabellen`/
  `-struktur-konsistenz`/`-invarianten` grün.
- **Gegenprüfung** (Opus, Extraktion/Darstellung) + Playwright/Browser-Sicht: SSV + DBG/KKG/VTS.

## Commits (§14.2, Risiko-Klassen getrennt)
1. Extraktor + Generator + Daten-Regen + `check:bilder` (Daten). 2. Render `BildFigur`/`BildKacheln`
+ SSV (UI). 3. Doku/STRUKTUR. Nur Bund; Escape-Hatch dokumentiert; Formeln bleiben Bild (kein OCR, §8).
