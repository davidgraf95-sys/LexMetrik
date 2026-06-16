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

## Befund 2 — OW gerichtskosten.ts (BEHOBEN 16.6.2026 — Art. 12)

**Datei:** `src/data/tarif/gerichtskosten.ts`, OW-Eintrag  
**Erlass:** GebOR (GDB 134.15), geltende Fassung in Kraft seit **1.3.2015** (Beschluss 4.12.2014, version_uid 4ad430f1…)  
**Befund:** Zitierter `Art. 7` GebOR ist in der geltenden Fassung **aufgehoben**. Die kodierte `regel` mischte das erste Band aus Art. 9 (Kantonsgerichtspräsidium) mit den höheren Bändern aus Art. 12 (Kantonsgericht).

**Fachliche Bestimmung (delegiert, «finde es selbst heraus»):**
Der Prozesskosten-Rechner bildet die **erstinstanzliche Entscheidgebühr im ordentlichen vermögensrechtlichen Zivilverfahren** ab (Verfahrensart-Modifikatoren liegen separat). Massgebend ist daher **Art. 12 GebOR (Kantonsgericht als Kollegialgericht)**:
- **Art. 35 GOG OW** (GDB 134.1, Stand 1.4.2022): «Das Kantonsgericht beurteilt als erste Instanz die Zivilstreitigkeiten, die nicht dem Kantonsgerichtspräsidium oder dem Obergericht zugewiesen sind» → ordentliches Verfahren.
- **Art. 34 GOG OW** weist dem Kantonsgerichtspräsidium (Einzelrichter) das **vereinfachte und summarische Verfahren** zu. Das vereinfachte Verfahren gilt nach **Art. 243 ZPO** bis Streitwert 30'000 → Gebühr **Art. 9** GebOR.
- Folge: Art. 12 Abs. 1 GebOR kennt **kein Band unter 30'000** (beginnt bei «über 30 000.– bis 50 000.–»). Das Band 0–30'000 ist materiell das vereinfachte Verfahren vor dem Präsidium → Art. 9 Ziff. 2 lit. a (100–3'000). Der Tarif-Eintrag bildet daher Art. 12 (ab >30'000) mit dem Art.-9-Band für ≤30'000 ab.

**Verifizierter Wortlaut Art. 12 Abs. 1 GebOR** (LexWork gdb.ow.ch/api/de/texts_of_law/134.15, Abruf 16.6.2026; doppelt geholt, byte-gleich):
1. über 30 000.– bis 50 000.–: **1 500.– bis 5 000.–**
2. über 50 000.– bis 100 000.–: **2 000.– bis 6 000.–**
3. über 100 000.– bis 350 000.–: **2 500.– bis 10 500.–**
4. über 350 000.–: **3 000.– bis 3 % des Streitwerts**

**Fix:**
- `artikel`: `'Art. 7'` → `'Art. 12 (Kantonsgericht; bis 30 000 Art. 9 Kantonsgerichtspräsidium)'`
- `stand`: `'1.1.2011'` → `'1.3.2015'` (geltendes Inkrafttreten)
- `regel`: Bänder ≥30'000 unverändert (sie entsprachen bereits Art. 12). EINE Wertänderung: das oberste Band trug zuvor den Platzhalter `maxChf: null` («oberer Rahmen nach Tarif, nicht abschliessend erhoben») → ersetzt durch den verifizierten %-Tail **`maxProzent: 3`** (Art. 12 Abs. 1 Ziff. 4: «3 000.– bis 3 % des Streitwerts»). `minChf: 3000` bleibt. Erstes Band (100–3'000) als Art. 9 Ziff. 2 lit. a kommentiert.
- `BEKANNTE_LUECKEN`-Eintrag `kanton/OW/134.15/art_7` entfernt (Art. 7 wird nicht mehr zitiert).

**Beleg / Snapshot:** `public/normtext/kanton/OW-134.15.json` enthält `art_12` mit der vollständigen Staffel (stand 2015-03-01), `artikelLabel` neu. Engine-Stützpunkte (`berechneProzesskosten` OW, phase entscheid): 20'000→100–3'000; 50'000→1'500–5'000; 100'000→2'000–6'000; 350'000→2'500–10'500; 500'000→3'000–15'000; 1'000'000→3'000–30'000 — deckt sich exakt mit Art. 12 / Art. 9.

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
| OW gerichtskosten Art. 7 aufgehoben | gerichtskosten.ts | **BEHOBEN 16.6.** | Art. 12 (Kantonsgericht, ordentl. Verf.); ≤30'000 Art. 9; stand 1.3.2015; %-Tail 3 % statt Platzhalter; Snapshot art_12 |
| SH schlichtung/nv Art. 109 totes Recht | schlichtung.ts:131, nicht-vermoegensrechtlich.ts:104 | **OFFEN** | Entscheid David: Art. 82 JG (CHF 100–1000 statt 50–300) |
