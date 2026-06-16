# Kantonale Tarif-Zitat-Befunde (LU/OW/SH)

**Erstellt:** 16.6.2026  
**Auftrag:** David «weiter verbessern», Vorstufe Norm-Vorschau-Vollständigkeitstest  
**Status:** ZWEIFACH GEPRÜFT (live LexWork-API + Inhalts-Gegenprobe); Umsetzung der Wertänderungen offen für Davids Abnahme  
**Quellen:**
- LU SRL 258 (BeurkGebV): https://srl.lu.ch/app/de/texts_of_law/258
- LU SRL 228 (GBGT): https://srl.lu.ch/app/de/texts_of_law/228
- OW GDB 134.15 (GerichtsgebührenDecret): https://gdb.ow.ch/app/de/texts_of_law/134.15
- SH JG SHR 173.200 (Justizgesetz): https://rechtsbuch.sh.ch/app/de/texts_of_law/173.200 (version_uid ce466f93…)
- SH ZPO 1951 SHR 273.100: LexWork-API 404 (aufgehobenes Recht)

---

## Befund 1 — LU notariat-grundbuch.ts GRUNDPFAND (BEHOBEN 16.6.2026)

**Datei:** `src/data/tarif/notariat-grundbuch.ts`, GRUNDPFAND LU (~Z. 138)  
**Befund:** `quelleUrl` zeigte auf SRL 228 (`https://srl.lu.ch/app/de/texts_of_law/228`), obwohl `erlassNr: 'SRL 258 / 228'` und `artikel: '§ 29 / § 8'`. § 29 existiert NICHT in SRL 228 (GBGT, nur §§ 1–20), sondern in **SRL 258** (BeurkGebV).  
**Verifikation:**
- SRL 258 § 29 Abs. 1: «Bei der Errichtung eines Grundpfandes (Art. 799 ZGB) beträgt die Gebühr: a) 2 ‰ der Pfandsumme bis Fr. 500 000.–; b) plus 1,25 ‰ vom Mehrbetrag über Fr. 500 000.– bis Fr. 1 000 000.–; c) plus 0,75 ‰ vom Mehrbetrag über Fr. 1 000 000.– bis Fr. 5 000 000.–; d) plus 0,5 ‰ vom Mehrbetrag über Fr. 5 000 000.– bis Fr. 10 000 000.– [→ max. Fr. 7 125.–]; e) von der 10 Mio. Fr. übersteigenden Pfandsumme wird keine Gebühr erhoben.»
- SRL 228 § 8: Eintragungsgebühr 2‰ (GBGT) — weiterhin korrekt via `erlassNr`/`artikel`-Hinweis, kein eigenes Snapshot-Zitat nötig (§ 8 liegt in LU-228.json).  
**Fix (wertneutral):** `quelleUrl` auf `'https://srl.lu.ch/app/de/texts_of_law/258'` geändert. `erlassNr`, `artikel`, `hinweis`, `regel` unverändert. `BEKANNTE_LUECKEN`-Eintrag `kanton/LU/228/art_29` entfernt (war Workaround für den falschen Link; `kanton/LU/258/art_29` jetzt vollständig gesnapshottet). LU-258.json regeneriert; enthält art_29 mit Grundpfand-Text + Fr. 7 125-Beleg.

---

## Befund 2 — OW gerichtskosten.ts (OFFEN, fachlich — Entscheid David)

**Datei:** `src/data/tarif/gerichtskosten.ts`, OW-Eintrag (~Z. 45 ff., `artikel: 'Art. 7'`)  
**Erlass:** GDB 134.15 (Dekret über Gerichtsgebühren OW)  
**Befund:** Zitierter `Art. 7` in GDB 134.15 ist **aufgehoben** (als Einzelartikel). Das Snapshot-File `public/normtext/kanton/OW-134.15.json` enthält `art_8`, `art_35`, `art_12`, aber NICHT `art_7` — weil LexWork ihn nicht liefert; entsprechend in `BEKANNTE_LUECKEN` als `token-nicht-im-Erlass`.  
**Geltende Zivil-Entscheidgebühr OW:**
- **Art. 9** GDB 134.15: Einzelgericht / Kantonsgerichtspräsidium (Art. 34/80 GOG OW) — erstes Gebührenband
- **Art. 12** GDB 134.15: Kantonsgericht (Art. 35 GOG OW) — höhere Bänder  

Die kodierte `regel` mischt aktuell Bänder aus Art. 9 (erstes Band) + Art. 12 (Rest). Ob das sachlich zutrifft (gleiche Instanz / Kombination), ist fachlich zu klären.  
**Entscheid David nötig:** Welche Instanz(en) soll der OW-Eintrag abbilden? Band-Werte gegen Art. 9 bzw. Art. 12 prüfen. `artikel: 'Art. 7'` ist in jedem Fall zu ersetzen.  
**Keine Code-Änderung** ohne Davids Abnahme.

---

## Befund 3 — SH schlichtung.ts (~Z. 131) + nicht-vermoegensrechtlich.ts (~Z. 104) (OFFEN, fachlich — Entscheid David)

**Dateien:**  
- `src/data/tarif/schlichtung.ts`, SH-Eintrag (~Z. 131), zitiert `SHR 273.100 Art. 109`  
- `src/data/tarif/nicht-vermoegensrechtlich.ts`, SH-Eintrag (~Z. 104), zitiert ebenfalls `SHR 273.100 Art. 109`  

**Befund:** SHR 273.100 ist die **kantonale ZPO von 1951** — am 1.1.2011 mit Inkrafttreten der eidgenössischen ZPO aufgehoben. LexWork-API liefert HTTP 404; in `BEKANNTE_LUECKEN` als `fetch-404`. Art. 109 SHR 273.100 ist **totes Recht** (kein geltendes Zitat).  
**Geltende Norm (live verifiziert):** **Justizgesetz JG SHR 173.200, Art. 82** — Schlichtungspauschale, LexWork version_uid ce466f93…, in `public/normtext/kanton/SH-173.200.json` als `art_82` gesnapshottet und seit 16.6.2026 verdrahtet.

**WERTÄNDERUNG (Entscheid David):**
- Aktuell kodiert (aus der aufgehobenen 1951er-Norm): **CHF 50–300**
- Art. 82 JG SHR 173.200 (geltend): **CHF 100–1000**

Dies ist eine fachliche Änderung am Rechenergebnis — Schlichtungsgebühren SH würden sich nach oben verschieben. Keine Code-Änderung ohne Davids Abnahme.

**Hinweis:** Der SH-Gerichtskosten-Eintrag in `src/data/tarif/gerichtskosten.ts` (~Z. 193) zitiert SHR 173.200 Art. 83 — dieser ist KORREKT (kein Befund).

---

## Zusammenfassung

| Befund | Datei | Status | Aktion |
|--------|-------|--------|--------|
| LU GRUNDPFAND quelleUrl 228→258 | notariat-grundbuch.ts:138 | **BEHOBEN 16.6.** | wertneutral; Snapshot LU-258 art_29 erzeugt |
| OW gerichtskosten Art. 7 aufgehoben | gerichtskosten.ts | **OFFEN** | Entscheid David: Instanz + Art. 9/12 + Bandwerte |
| SH schlichtung/nv Art. 109 totes Recht | schlichtung.ts:131, nicht-vermoegensrechtlich.ts:104 | **OFFEN** | Entscheid David: Art. 82 JG (CHF 100–1000 statt 50–300) |
