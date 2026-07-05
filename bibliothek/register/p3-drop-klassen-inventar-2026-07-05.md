# P3 — Korpusweite `<p>`-Klassen-Drop-Inventur (Bund-Extraktor)

**Erstellt:** 2026-07-05 · **Stand:** 2026-07-05 · **Status:** zweifach geprüft
(Extraktor-Regen + unabhängige adversariale Gegenprüfung, QS-GP W2·5b) ·
**Schritt:** ROADMAP W2·5b «L0-Extraktor-Härtung», Posten P3
· **Quelle:** alle gepinnten Bund-Filestore-HTMLs (`scripts/fedlex-cache.sh`, 218
Erlasse, 24 602 Artikel) · **Reproduzierbar:** `npx vite-node
scripts/normtext/p3-drop-inventar.ts` (Ground-Truth: Extraktor-Output vs.
`<p>`-Textcontainment) · **Tor:** `check:p-klassen`
(`scripts/normtext/check-p-klassen.ts`).

## Frage

Der Fedlex-Extraktor (`extrahiere-fedlex.ts`) matcht Absätze über eine
Regex-Alternation (`<p class="…absatz…">`, führendes Ziffern-`<sup>`, `<p>` vor
`<dl>`, `<table>`, Bild-`<p>`). Jedes **top-level `<p>` im Artikelkörper, das
KEINE Alternative trifft, wird STILL verworfen.** Referenzfall: OR art_361/362
listen die (un)abdingbaren Vorschriften als flache `<p class="man-template-tab-krpr">`
— 89 Zeilen, die stumm fehlten.

## Inventar der Drop-Klassen (semantischer Leit-Token) + Verdikt

| Klasse (Leit-Token) | Vorkommen | Erlasse | Verdikt | Beleg |
|---|---|---|---|---|
| `man-template-tab-krpr` (standalone, nicht in `<table>`) | 89 (OR) + 8 (VRV) | or, vrv | **EXTRAHIEREN** → Text-Block | OR 361/362 = normativer Vorschriften-Katalog; VRV = redakt. Verweis-Noten «* Vgl. Art. …». Beide amtlicher Artikelkörper-Text (§1/§8). Neue alt7 im Block-Loop. |
| `referenz` (bare) | 347 | atsv, fzv, bankv, finiv, finfrav, argv5 | **EXTRAHIEREN** → `grundlage` | Identischer Trägernorm-Verweis `(Art. N Gesetz)` wie `man-template-referenz` (G23/M8), nur schlanke Klasse. Regex `\bman-template-referenz\b`→`\breferenz\b` (matcht beide). |
| `inkrafttreten` (+`man-space-before-20`) | 58 | ~58 Erlasse | **BEWUSST IGNORIEREN** | Fedlex-Schlussformel «Datum des Inkrafttretens: …» = Vollzugs-Metadaten; In-Kraft-Datum steht bereits in Provenienz-Spalte `stand` (§7). Trailing-Ziffer = AS-Fussnote. Kein Artikel-Normtext. |
| `absatz8pt` / `absatz09pt` / `absatzkurs` | ~10 | svg, mschg, ivg, wag, mg, parlg, vzv, ohg, uvpv | **DEFERIERT (dokumentiert)** | Präsentations-Absatz-Varianten, die die wortgebundene alt1 (`\babsatz\b`, JS-`\b` zählt Ziffern als Wortzeichen) NICHT trifft. Inhalt gemischt: Inkrafttreten-Kleindruck-Datumslisten (svg art_108) UND vereinzelt Sondertext (**ParlG art_3 Amtseid**, **UVPV art_13 Abs. 3/4**). Saubere Extraktion braucht eigene Behandlung (Absatz-Nr in `<span>`-Wrapper, `<sup><br></sup>`-Artefakte) → eigener Folgeschritt. **Bekannte Rest-Lücke, NICHT mehr still.** |
| `abstand1seite` | 1 | gebv_schkg | **BEWUSST IGNORIEREN** | Leerer Layout-Abstandshalter, kein Textinhalt. |
| `bild` (ohne `<img>`) | 1 | gbv (art_34i) | **DEFERIERT (dokumentiert)** | Als MathML/Text gesetzte Gebührenformel (Einzelfall). Formel-als-Text braucht eigene Behandlung. Bekannte Rest-Lücke. |
| `man-font-style-italic` (standalone) | wenige | betmkv u.a. | **BEWUSST IGNORIEREN** | Kursive Editorial-/Aufgehoben-Note («… <fn>»), kein tragender Normsatz. |
| `man-template-tab-kpf` (nach Tabellen-Strip) | wenige | vrv u.a. | **BEWUSST IGNORIEREN** | Tabellen-Kopf-Zelle; über den Tabellen-/`mehrspaltig`-Pfad erfasst bzw. leer (nested-table-Strip-Artefakt). |
| `man-template-tab-utit*` (kosmet. Zwischen-Titel) | 31 (bv), 8 (schkg/parlg) | bv, schkg, parlg | **BEWUSST IGNORIEREN** | Darstellungs-Überschrift (z.B. SchKG art_219 «Erste/Zweite/Dritte Klasse»). Verifiziert: die materiellen Forderungs-Kataloge sind als `items`-Gruppen in Reihenfolge VOLLSTÄNDIG erfasst; der Rang = Gruppen-Ordnung. Bloßer Titel ist kein eigener Normsatz. |

Nicht als Drop gewertet (False Positives der Containment-Heuristik): nummerierte
`absatz`-Blöcke (Extraktor entfernt die führende Absatz-Nr) und Tabellen-Zellen
(über den `<table>`-Pfad erfasst) — durch `\babsatz\b`-Prüfung bzw. Tabellen-
Ausschnitt im Tor korrekt behandelt.

## «Laut»-Mechanismus (Tor `check:p-klassen`)

Das Tor scannt alle Artikelkörper, schneidet echte Tabellen/`<dl>` weg, prüft je
top-level classed-`<p>`, ob es eine Extraktor-Alternative trifft (mirror der
`\babsatz\b`/`\breferenz\b`/`man-template-tab-krpr`/Bild/`<sup>`/`<dl>`-Logik).
Nicht erfasste `<p>` werden auf ihren Leit-Token normalisiert und gegen das
eingefrorene Manifest `BEWUSST_IGNORIERT` geprüft. **Jeder NEUE, unentschiedene
Klassentyp (Fedlex-Template-Drift/Currency) bricht das Tor** — kein `<p>` kann je
wieder STILL Normtext verlieren, ohne eine dokumentierte Entscheidung.

## Wort-Coverage-Delta (Regen 9 Erlasse)

- OR: +89 Text-Blöcke, +4 713 Zeichen (art_361/362 Vorschriften-Katalog).
- VRV: +8 Text-Blöcke, +409 Zeichen (Verweis-Noten).
- atsv/fzv/bankv/finiv/finfrav/argv5: +1/+5/+89/+92/+146/+15 `grundlage`-Felder.
- SSV: −CSS-Junk (5 Kachel-Namen bereinigt), Signal-Inhalt vollständig erhalten.
- **Coverage auf normativem Text steigt streng; SSV entfernt nur Nicht-Normtext.**
