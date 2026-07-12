# Kantonale Tarif-Zitat-Befunde (LU/OW/SH)

**Erstellt:** 16.6.2026  
**Auftrag:** David «weiter verbessern», Vorstufe Norm-Vorschau-Vollständigkeitstest  
**Status:** ZWEIFACH GEPRÜFT (live LexWork-API + Inhalts-Gegenprobe); alle 3 Befunde (LU/OW/SH) BEHOBEN (SH zuletzt 16.6.2026, Commit `b7587a51`, fachl. freigegeben David) — je Fundort verifizieren, generelle Rechtssicherheits-Abnahme des Katalogs bleibt Davids Sache (Zeitsperre)  
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

## Befund 3 — SH schlichtung.ts (Z. 130–141) + nicht-vermoegensrechtlich.ts (Z. 110–114) + zustaendigkeitKosten.ts (Z. 141) — BEHOBEN 16.6.2026 (§7, fachl. freigegeben David)

**Dateien:**
- `src/data/tarif/schlichtung.ts`, SH-Eintrag (Z. 130–141), zitierte vormals `SHR 273.100 Art. 109`
- `src/data/tarif/nicht-vermoegensrechtlich.ts`, SH-Eintrag (Z. 110–114, `SCHLICHTUNG_NV`), zitierte ebenfalls `SHR 273.100 Art. 109`
- **dritte Fundstelle (Beleg-Härte-Nachtrag):** `src/data/zustaendigkeitKosten.ts:141` (SH-Eintrag im UI-Kurztext-Register, dieselbe Wertänderung)

**Befund:** SHR 273.100 war die **kantonale ZPO von 1951** — am 1.1.2011 mit Inkrafttreten der eidgenössischen ZPO aufgehoben. LexWork-API liefert HTTP 404; in `BEKANNTE_LUECKEN` als `fetch-404`. Art. 109 SHR 273.100 war **totes Recht** (kein geltendes Zitat).
**Geltende Norm (live verifiziert):** **Justizgesetz JG SHR 173.200, Art. 82** — Schlichtungspauschale, LexWork version_uid ce466f93…, in `public/normtext/kanton/SH-173.200.json` als `art_82` gesnapshottet und seit 16.6.2026 verdrahtet.

**WERTÄNDERUNG UMGESETZT (fachlich freigegeben David, 16.6.2026):**
- Vormals kodiert (aus der aufgehobenen 1951er-Norm): CHF 50–300
- **Jetzt kodiert, Art. 82 JG SHR 173.200 (geltend): CHF 100–1000**

**Beleg-Zitat (Code-Kommentar `schlichtung.ts` Z. 131–136):**
> «Korrektur 16.6.2026 (§7, fachl. freigegeben David): bisher zitierte kantonale
> ZPO «SHR 273.100 Art. 109» (1951) wurde am 1.1.2011 mit der eidg. ZPO
> aufgehoben (totes Recht, LexWork-API 404). Geltend ist Art. 82 Justizgesetz
> (JG): «Im Schlichtungsverfahren beträgt die Pauschalgebühr Fr. 100.00 bis
> Fr. 1'000.00, wenn das Verfahren nicht kostenlos ist.» Quelle:
> rechtsbuch.sh.ch JG 173.200, version_uid ce466f93…, i.K. 1.5.2026.»

**Commit:** `b7587a51` — «fix(tarif): SH Schlichtung auf geltendes JG SHR 173.200 Art. 82 (100–1000; totes ZPO-273.100 ersetzt)». Analoger Korrekturvermerk in `nicht-vermoegensrechtlich.ts` Z. 110–113 (SCHLICHTUNG_NV, gleicher Commit-Kontext).

**Hinweis:** Der SH-Gerichtskosten-Eintrag in `src/data/tarif/gerichtskosten.ts` (~Z. 193) zitiert SHR 173.200 Art. 83 — dieser ist KORREKT (kein Befund, unverändert).

---

## Zusammenfassung

| Befund | Datei | Status | Aktion |
|--------|-------|--------|--------|
| LU GRUNDPFAND quelleUrl 228→258 | notariat-grundbuch.ts:138 | **BEHOBEN 16.6.** | wertneutral; Snapshot LU-258 art_29 erzeugt |
| OW gerichtskosten Art. 7 aufgehoben | gerichtskosten.ts | **BEHOBEN 16.6.** | Art. 12 (Kantonsgericht, ordentl. Verf.); ≤30'000 Art. 9; stand 1.3.2015; %-Tail 3 % statt Platzhalter; Snapshot art_12 |
| SH schlichtung/nv/zustaendigkeitKosten Art. 109 totes Recht | schlichtung.ts:130–141, nicht-vermoegensrechtlich.ts:110–114, zustaendigkeitKosten.ts:141 | **BEHOBEN 16.6.** (Commit `b7587a51`) | Art. 82 JG (CHF 100–1000 statt 50–300), fachl. freigegeben David |

---

# NE/GE-Tarif-Zitatkorrekturen (5 tote Tokens, BEHOBEN 17.6.2026)

**Auftrag:** David — 5 Tarif-Zitate in `src/data/tarif/` lösten nicht auf (falsche Artikel-Nummer/falscher Erlass). NUR das Zitat korrigieren (`artikel`/`erlassNr`/`quelleUrl`), wertneutral (`regel`/Berechnung unangetastet). Jede Korrektur live gegengeprüft.
**Status:** ZWEIFACH GEPRÜFT (Live-WebFetch der amtlichen htm-Quelle + Token-Auflösung gegen den Snapshot via `check:vollstaendigkeit`). Wertneutral (`golden:vergleich` byte-gleich). Abnahme David offen.
**Quellen (Live-Abruf 17.6.2026):**
- NE Tarif notaires RSN 166.31: https://rsn.ne.ch/DATA/program/books/RSN2015/20154/htm/16631.htm
- NE LERF RSN 215.411.6: https://rsn.ne.ch/DATA/program/books/RSN2016/20163/htm/2154116.htm
- GE REmORFDIT RSG E 1 50.06: https://silgeneve.ch/legis/data/rsg_e1_50p06.htm
- GE REmNot RSG E 6 05.03: https://silgeneve.ch/legis/program/books/rsg/htm/rsg_e6_05p03.htm
- GE LDE RSG D 3 30: https://silgeneve.ch/legis/data/rsg_d3_30.htm
- GE RTFMC RSG E 1 05.10 (zur Widerlegung der Bug-Check-Hypothese): https://silgeneve.ch/legis/data/rsg_e1_05p10.htm

## Fall 1 — NOTARIAT NE «Art. 54» → «Art. 14 ch. 54» (notariat-grundbuch.ts ~Z. 83)
**Befund:** RSN 166.31 endet bei **Art. 17** (Entrée en vigueur); ein «Art. 54» existiert nicht. Die Gebühren-Chiffres 1–82 stehen alle in **Art. 14**.
**Live-Beleg:** Art. 14 ch. 54 = «Vente immobilière: jusqu'à 100.000 francs 800 francs; de 100.001 à 200.000 francs 1.100 francs …» (Staffel bis 10.000 fr.). Konsistent mit beurkundung.ts (verwendet bereits «Art. 14 ch. 54»).
**Fix:** `artikel: 'Art. 54'` → `'Art. 14 ch. 54'` (+ Hinweis um «Vente immobilière» ergänzt). `regel`/quelleUrl unverändert. parsePassus → Token **art_14** (in NE-16631.json vorhanden) → **löst auf**.

## Fall 2 — beurkundung.ts NE «Art. 81 lit. B/C» → «Art. 14 ch. 81 lit. B/C» (beurkundung.ts ~Z. 492, 520)
**Befund:** Die Statutenänderungs-/Umstrukturierungs-Einträge zitierten bare «Art. 81» (Token 81), das in RSN 166.31 als Artikel nicht existiert. ch. 81 ist ein Chiffre von **Art. 14**.
**Live-Beleg:** Art. 14 ch. 81 «Société anonyme et société en commandite par actions», Unterteilungen lit. A (Kapital-Operation), lit. B «Procès-verbal d'assemblée générale dans les autres cas: de 300 à 2500 francs», lit. C «Fusion, scission, transformation et transfert de patrimoine». Alle Unterteile von ch. 81 innerhalb Art. 14.
**Fix:** beide `artikel` auf «Art. 14 ch. 81 lit. B» bzw. «Art. 14 ch. 81 lit. C» (+ ch. 82 für Sàrl); Hinweise analog. `regel` unverändert. Token **art_14** → **löst auf**. (Die Schwester-Einträge ch. 81 lit. A standen bereits korrekt.)

## Fall 3 — GRUNDPFAND NE «Art. 44 / Art. 10» → «Art. 10» (notariat-grundbuch.ts ~Z. 159)
**Befund:** Verkettetes Zitat «Art. 44 / Art. 10» an der LERF-quelleUrl (2154116.htm). «Art. 44» ist KEIN LERF-Artikel (LERF endet bei **Art. 13**); es war als **Chiffre 44 von Art. 14 RSN 166.31** (Beurkundung gage immobilier) gemeint. Der htm-Adapter UND das Laufzeit-Popover binden ALLE `/`-Tokens an die EINE quelleUrl → Token 44 gegen LERF unauflösbar; das Popover zeigt nur den ERSTEN Token (war 44 → tot).
**Live-Beleg:**
- LERF Art. 10: «Pour toute inscription et augmentation de gage immobilier … 2‰ jusqu'à 2 millions de francs et 1,5‰ sur l'excédent; minimum 50 francs.» = die kodierte `regel` (promille 2, minChf 50).
- RSN 166.31 Art. 14 ch. 44 = «Constitution d'un droit de gage immobilier (hypothèque, cédule hypothécaire, lettre de rente)» (Pauschalstaffel 500–4'700 fr.).
**Fix:** `erlassNr: 'RSN 215.411.6 / 166.31'` (LERF voran = quelleUrl), `artikel: 'Art. 10'` (LERF, kodierter Eintrag). Beurkundung (RSN 166.31 Art. 14 ch. 44) in den Hinweis. `regel`/quelleUrl unverändert. Token **art_10** (in NE-2154116.json vorhanden) → **löst auf**.

## Fall 4 — GRUNDPFAND GE «Art. 16 / Art. 4 al. 6 / Art. 84» → «Art. 4 al. 6» (notariat-grundbuch.ts ~Z. 160)
**Befund:** Verkettetes Drei-Erlass-Zitat an der REmORFDIT-quelleUrl (rsg_e1_50p06.htm). «Art. 16» und «Art. 84» existieren dort NICHT (rsg_e1_50p06 endet bei **Art. 13**). Die **Bug-Check-Hypothese (RTFMC rsg_e1_05p10) ist WIDERLEGT**: RTFMC Art. 16 = forfaitäre Schlichtungspauschale, Art. 84 = Parteientschädigung — beides hat mit Grundpfand nichts zu tun. Die Token gehören zu DREI verschiedenen Erlassen:
**Live-Beleg:**
- Art. 16 = **REmNot RSG E 6 05.03**: «Pour constituer ou augmenter des gages immobiliers, l'émolument est fixé … 5‰ jusqu'à 200 000 francs, … au minimum 100 francs» (5‰ degressiv) → Beurkundung.
- Art. 4 al. 6 = **REmORFDIT RSG E 1 50.06**: gage 0,085 % (max. 20'000/gage) → Eintrag (= quelleUrl).
- Art. 84 = **LDE RSG D 3 30**: «droit de 0,65% sur le montant des sommes dues en vertu de reconnaissances de dette …» → Registrierungssteuer.
**Fix:** `erlassNr: 'RSG E 1 50.06 / E 6 05.03 / D 3 30'` (REmORFDIT voran = quelleUrl), `artikel: 'Art. 4 al. 6'` (REmORFDIT, registre-foncier-Émolument). Beurkundung (E 6 05.03 Art. 16) und LDE-Steuer (D 3 30 Art. 84) in den Hinweis. `regel` (promille 6.5 = Summe) unverändert. Token **art_4** (in GE-rsg_e1_50p06.json vorhanden) → **löst auf**.

## Lücken-Liste & Tore
- `BEKANNTE_LUECKEN_HTMZH` (check-vollstaendigkeit.ts): die jetzt aufgelösten Einträge entfernt — `kanton/NE/16631/art_54`, `…/art_81`, `kanton/NE/2154116/art_44`, `kanton/GE/rsg_e1_50p06/art_16`, `…/art_84`. Die Arrêté-Lücken (NE/2154116 art_14/18/20/21/27, anderer Erlass RSN 215.411.60) bleiben unverändert gültig.
- Tore grün: `tsc -b` 0 · `vitest` 1939 grün · `golden:vergleich` 187 byte-gleich · `lint` ok · `check:vollstaendigkeit`/`check:normtext`/`check:bibliothek` grün · `npm run gate` (voll) GRÜN.
- Keine Wertänderung nötig — alle fünf Korrekturen wertneutral umsetzbar (keine «fachlich offen für David» aus diesem Auftrag; einzig die GE-Bug-Check-Hypothese musste live korrigiert werden).

| Fall | Datei | alt → neu | löst auf? |
|------|-------|-----------|-----------|
| 1 | notariat-grundbuch.ts (NOTARIAT NE) | `Art. 54` → `Art. 14 ch. 54` | ✅ art_14 |
| 2 | beurkundung.ts (NE, 2×) | `Art. 81 lit. B/C` → `Art. 14 ch. 81 lit. B/C` | ✅ art_14 |
| 3 | notariat-grundbuch.ts (GRUNDPFAND NE) | `Art. 44 / Art. 10` → `Art. 10` (erlassNr LERF voran) | ✅ art_10 |
| 4 | notariat-grundbuch.ts (GRUNDPFAND GE) | `Art. 16 / Art. 4 al. 6 / Art. 84` → `Art. 4 al. 6` (erlassNr REmORFDIT voran) | ✅ art_4 |
