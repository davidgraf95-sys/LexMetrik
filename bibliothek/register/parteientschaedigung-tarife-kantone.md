# Register — Kantonale Parteientschädigung / Anwaltshonorar-Tarife (Zivil, erstinstanzlich)

**Erstellt:** 14.6.2026 · **Quelle:** Ultra-Recherche-Workflow (je Kanton
Recherche + unabhängige Verifikation am amtlichen Erlass). **Geltungsbereich:**
Grundhonorar/Parteientschädigung im erstinstanzlichen ordentlichen
vermögensrechtlichen Zivilverfahren, nach Streitwert (Art. 95 III / Art. 96 ZPO).
**Status:** Erstrecherche, amtlich (doppelt) verifiziert; **Abnahme David
ausstehend (§7)**. Grundlage: [[prozesskosten-zpo-95-96]].

**Querschnitt (Art. 113 Abs. 1 ZPO):** Im **Schlichtungsverfahren wird KEINE
Parteientschädigung** gesprochen — in JEDEM Kanton (Bundesrecht). Mehrere Tarife
bestätigen das ausdrücklich (z. B. VD Art. 2 al. 2 TDC). Engine-Folge: bei
`verfahrensphase = schlichtung` → Parteientschädigung = 0.

`REGEL` = `TarifRegel` für `src/lib/tarif/staffel.ts`. Diese Datei ist die
durable Persistenz; Vorlage für `src/data/tarif/parteientschaedigung.ts`.

> **Re-Verifikation 14.6.2026 ABGESCHLOSSEN** (Workflow `wibiq1gbs`): SZ, GL,
> SH, GR amtlich nachgeprüft und bestätigt — GL/SH/GR = aufwandbasiert (kein
> Streitwert-Tarif, `formel_extern`), SZ = `staffel_rahmen` mit den unten
> ausgeschriebenen Bändern (§ 8 GebT verbatim) + %-Tail >1 Mio = 1–3,5 %.
> Ebenso re-verifiziert: AG/SG/AI = Prozent vom Gesamtwert (`staffel_voll_prozent`).
> Damit alle 26 doppelt verifiziert. Platzhalter-Obergrenzen sind im Code durch
> `minProzent/maxProzent` (%-Tail) bzw. ehrliche offene Grenzen ersetzt.

---

## Deterministische Honorar-Staffeln (berechenbar)

### ZH — AnwGebV (LS 215.3), § 4 Abs. 1 · Stand 1.1.2015
- Quelle: https://www.zh.ch/de/politik-staat/gesetze-beschluesse/gesetzessammlung/zhlex-ls/erlass-215_3-2010_09_08-2011_01_01-087.html
- REGEL: `{"typ":"staffel_sockel_prozent","baender":[{"bisChf":5000,"sockelChf":0,"abChf":0,"prozent":25,"minChf":100},{"bisChf":10000,"sockelChf":1250,"abChf":5000,"prozent":23},{"bisChf":20000,"sockelChf":2400,"abChf":10000,"prozent":15},{"bisChf":40000,"sockelChf":3900,"abChf":20000,"prozent":11},{"bisChf":80000,"sockelChf":6100,"abChf":40000,"prozent":9},{"bisChf":160000,"sockelChf":9700,"abChf":80000,"prozent":6},{"bisChf":300000,"sockelChf":14500,"abChf":160000,"prozent":3.5},{"bisChf":600000,"sockelChf":19400,"abChf":300000,"prozent":2},{"bisChf":1000000,"sockelChf":25400,"abChf":600000,"prozent":1.5},{"bisChf":4000000,"sockelChf":31400,"abChf":1000000,"prozent":1},{"bisChf":10000000,"sockelChf":61400,"abChf":4000000,"prozent":0.75},{"bisChf":1000000000000,"sockelChf":106400,"abChf":10000000,"prozent":0.5}]}` (Grundgebühr; § 4 II ±⅓; § 9 summarisch ⅖–⅕).

### ZG — V. Anwaltskosten (BGS 163.4), § 3 · Stand 1.1.2026 — **identisch zur ZH-Skala**
- Quelle: https://bgs.zg.ch/app/de/texts_of_law/163.4
- REGEL: wie ZH (Bänder identisch, `minChf` Band 1 = 200). § 3 III ±⅓.

### GE — RTFMC (rsGE E 1 05.10), Art. 84 · Stand 1.7.2025 — **ZH-Skala + Art. 85 ±10 %**
- Quelle: https://silgeneve.ch/legis/data/rsg_e1_05p10.htm
- REGEL: wie ZH-Skala (sockel_prozent identisch). Art. 85 al. 1 ±10 %; nicht vermögensrechtlich 600–18'000.

### AG — Anwaltstarif AnwT (SAR 291.150), § 3 Abs. 1 · Stand 1.1.2024
- Quelle: https://gesetzessammlungen.ag.ch/app/de/texts_of_law/291.150
- REGEL: `{"typ":"staffel_sockel_prozent","baender":[{"bisChf":6160,"sockelChf":1110,"abChf":0,"prozent":22},{"bisChf":12300,"sockelChf":1230,"abChf":0,"prozent":20},{"bisChf":24600,"sockelChf":1850,"abChf":0,"prozent":15},{"bisChf":49300,"sockelChf":2590,"abChf":0,"prozent":12},{"bisChf":98600,"sockelChf":4070,"abChf":0,"prozent":9},{"bisChf":184800,"sockelChf":6530,"abChf":0,"prozent":6.4},{"bisChf":369600,"sockelChf":10230,"abChf":0,"prozent":4.4},{"bisChf":739200,"sockelChf":14300,"abChf":0,"prozent":3.3},{"bisChf":1478400,"sockelChf":20240,"abChf":0,"prozent":2.5},{"bisChf":3080000,"sockelChf":29040,"abChf":0,"prozent":1.9},{"bisChf":6160000,"sockelChf":44440,"abChf":0,"prozent":1.4},{"bisChf":1000000000000,"sockelChf":69080,"abChf":0,"prozent":1}]}` ⚠ Prozent auf Gesamtwert (abChf:0) — Agent-Modellierung; **fachlich prüfen** ob marginal oder voll. § 3 II reduziert summarisch.

### SG — HonO (sGS 963.75), Art. 14 · Stand 1.1.2019 — mittleres Honorar, % auf Gesamtwert
- Quelle: https://www.gesetzessammlung.sg.ch/app/de/texts_of_law/963.75
- REGEL: `{"typ":"staffel_sockel_prozent","baender":[{"bisChf":10000,"sockelChf":800,"abChf":0,"prozent":26},{"bisChf":30000,"sockelChf":2000,"abChf":0,"prozent":14},{"bisChf":100000,"sockelChf":3500,"abChf":0,"prozent":9},{"bisChf":500000,"sockelChf":9200,"abChf":0,"prozent":3.3},{"bisChf":1000000,"sockelChf":12700,"abChf":0,"prozent":2.6},{"bisChf":2000000,"sockelChf":15700,"abChf":0,"prozent":2.3},{"bisChf":1000000000000,"sockelChf":41700,"abChf":0,"prozent":1}]}` (Art. 17 ±50 %; Art. 15 +20 %; Art. 16 summarisch 10–60 %). ⚠ % auf Gesamtwert — fachlich prüfen.

### AI — AnwHV (GS 177.410), Art. 10 · Stand 1.1.2024 — wie AR, % auf Gesamtwert
- Quelle: https://ai.clex.ch/app/de/texts_of_law/177.410
- REGEL: `staffel_sockel_prozent` Bänder bis5000=500+30%, bis20000=1230+15.4%, bis50000=1850+12.3%, bis100000=3600+8.8%, bis500000=9100+3.3%, bis1Mio=12600+2.6%, bis2Mio=15600+2.3%, darüber=37600+1.2% (abChf:0). Art. 13 ±¼. ⚠ % auf Gesamtwert.

### AR — Honorarordnung (bGS 145.53), Art. 9 · Stand 1.1.2019
- Quelle: https://ar.clex.ch/app/de/texts_of_law/145.53
- REGEL: `{"typ":"staffel_voll_prozent","baender":[{"bisChf":5000,"fixChf":500,"prozent":30},{"bisChf":20000,"fixChf":1230,"prozent":15.4},{"bisChf":50000,"fixChf":1850,"prozent":12.3},{"bisChf":100000,"fixChf":3600,"prozent":8.8},{"bisChf":500000,"fixChf":9100,"prozent":3.3},{"bisChf":1000000,"fixChf":12600,"prozent":2.6},{"bisChf":2000000,"fixChf":15600,"prozent":2.3},{"bisChf":1000000000000,"fixChf":37600,"prozent":1.2}]}` (Art. 11 ±¼; Art. 10 summarisch 10–50 %).

---

## Ermessensrahmen je Streitwert-Band (`staffel_rahmen`)

- **BE** — PKV (BSG 168.811), Art. 5 · 1.1.2012 — Bänder bis8000=100–3000 · bis20000=1500–7900 · bis50000=3200–15700 · bis100000=3900–23700 · bis300000=7900–35400 · bis600000=11800–49200 · bis1Mio=19700–59000 · bis2Mio=38500–78700 · **>2 Mio bis 3,8 %** ⚠. Quelle: https://www.belex.sites.be.ch/app/de/texts_of_law/168.811
- **LU** — JusKV (SRL 265) § 31 = **75–150 % der Gerichtsgebühr** · 1.1.2026 — Bänder s. Rohdaten ⚠ Top null. Quelle: https://srl.lu.ch/app/de/texts_of_law/265
- **UR** — GGebR (RB 2.3232) · 1.10.2023 — bis5000=500–2500 · bis20000=1000–6000 · bis50000=3000–10000 · bis100000=3500–15000 · bis500000=5000–30000 · **>500k 1,5–4 %** ⚠. Quelle: https://rechtsbuch.ur.ch/app/de/texts_of_law/2.3232
- **OW** — GebOR (GDB 134.15) Art. 35 · 1.3.2015 — bis30000=500–7000 · bis50000=1000–9000 · bis100000=3000–11000 · bis200000=5000–13500 · bis500000=6000–17500 · **>500k ⚠ Platzhalter**. Quelle: https://gdb.ow.ch/app/de/texts_of_law/134.15
- **NW** — PKoG (NG 261.2) Art. 42 · 1.1.2016 — bis2000=200–1300 · bis5000=800–2600 · bis10000=1300–4000 · bis40000=2000–8000 · bis100000=4000–13000 · bis200000=6500–21000 · bis500000=10000–40000 · bis1.5Mio=15000–60000 · **>1.5 Mio 2–4 %** ⚠ null. Quelle: https://gesetze.nw.ch/app/de/texts_of_law/261.2
- **BS** — Honorarordnung HO (SG 291.400) § 5 · 23.5.2024 — bis1000=100–500 · bis5000=500–1000 · bis10000=1000–2000 · bis30000=2000–3000 · bis100000=4500–10000 · bis500000=10000–30000 · bis1Mio=30000–50000 · bis5Mio=50000–100000 · **>5 Mio 1–3 %** ⚠ null. § 5 II −⅓ vereinfacht >30k; § 4 Schlichtung max ⅓. Quelle: https://www.gesetzessammlung.bs.ch/app/de/texts_of_law/291.400
- **BL** — Tarifordnung (SGS 178.112) § 7 · 1.1.2014 — bis2000=350–750 · bis5000=675–1500 · bis10000=1500–2400 · bis20000=2250–3600 · bis50000=3300–6450 · bis100000=6000–10500 · bis200000=9750–17250 · bis500000=16500–34500 · bis1Mio=33000–55500 · bis2Mio=52500–82500 · **>2 Mio 75000 + max 2 %** ⚠. Quelle: https://bl.clex.ch/app/de/texts_of_law/178.112
- **TG** — Honorartarif (RB 176.31) § 5 · 1.1.2025 — bis2000=200–1000 · bis5000=1000–2000 · bis10000=2000–3000 · bis30000=3000–5000 · bis100000=5000–10000 · bis500000=10000–30000 · bis2Mio=30000–60000 · **>2 Mio 60000+** ⚠. Quelle: https://www.rechtsbuch.tg.ch/app/de/texts_of_law/176.31
- **VD** — TDC (BLV 270.11.6) · 1.5.2019 — bis30000=1000–9000 · bis100000=3000–15000 · bis250000=6000–25000 · bis500000=9000–40000 · bis1Mio=12000–60000 · bis2Mio=16000–80000 · bis5Mio=20000–100000 · **>5 Mio 40000+** ⚠. Art. 2 al.2: keine dépens in Schlichtung. Quelle: https://www.lexfind.ch/tolv/135783/fr
- **VS** — LTar (SR 173.8) Art. 32/28 · 1.1.2018 — feinstufige Bänder (s. Rohdaten), **>1 Mio 3,3 %, max 140000**. Quelle: https://lex.vs.ch/app/fr/texts_of_law/173.8
- **NE** — LTFrais (RSN 164.1) · 1.4.2023 — Höchstbeträge je Band (min 0/„jusqu'à") bis8000=2500 · bis20000=5000 · bis50000=10000 · bis100000=15000 · bis200000=25000 · bis500000=35000 · bis1Mio=45000 · bis2Mio=55000 · **>2 Mio bis 3 %** ⚠. Quelle: https://rsn.ne.ch/DATA/program/books/RSN2024/20245/htm/164.1.htm
- **JU** — Tarif (RSJU 188.61) Art. 7 · 1.9.2015 — bis2000=100–1530 · bis5000=800–2900 · bis10000=1200–4800 · bis20000=1900–7700 · bis50000=2900–15300 · bis100000=3800–22900 · bis300000=7700–34300 · bis600000=11500–48000 · bis1Mio=19000–57000 · bis2Mio=29000–76000 · **>2 Mio bis 3,8 %** ⚠. Quelle: https://rsju.jura.ch/fr/viewdocument.html?idn=20028&id=27021&download=1
- **TI** — RL 178.310 Art. 11 · 29.5.2026 — **%-Rahmen vom Streitwert** je Band (bis20000=15–25 % · bis50000=10–20 % · bis100000=8–15 % · bis500000=6–9 % · bis1Mio=4–6 % · bis2Mio=3–5 % · bis5Mio=2–4 % · >5Mio=2 %) → eigener Berechnungstyp nötig (Prozent-Spanne × Streitwert). Quelle: https://m3.ti.ch/CAN/RLeggi/public/index.php/raccolta-leggi/pdfatto/atto/141

---

## Aufwandbasiert (kein Streitwert-Tarif → `formel_extern`)

- **FR** — RJ (RSF 130.11) Art. 65/66 · 1.1.2018 — Stundenansatz CHF 250 + streitwertabhängige *majoration* (max 350 %); Pauschale Art. 64 (≤30k: max 6000). Quelle: https://bdlf.fr.ch/app/fr/texts_of_law/130.11
- **SO** — GT (BGS 615.11) § 160 · 1.3.2026 — Aufwand × Stundenansatz 230–330 (uR 180). Quelle: https://bgs.so.ch/app/de/texts_of_law/615.11
- **GR** — HV (BR 310.250) Art. 2/3 · Stand 1.1.2011 · re-verifiziert ✓ 14.6.2026 — Stundenansatz 210–270 + Interessenwertzuschlag (>1 Mio max 2 %). Quelle: https://www.gr-lex.gr.ch/app/de/texts_of_law/310.250
- **GL** — EG ZPO (GS III C/1) Art. 20 · re-verifiziert ✓ 14.6.2026 — reines Ermessen (kein vom OG erlassener Tarif); Art. 20 III: Arbeit ≤30k keine Parteientschädigung. Quelle: https://gesetze.gl.ch/app/de/texts_of_law/III-C.1
- **SH** — JG (SHR 173.200) Art. 86 · re-verifiziert ✓ 14.6.2026 — kein Streitwert-Tarif; Ermessen nach effektivem Aufwand (HonV 173.811: 200/Std). Quelle: https://rechtsbuch.sh.ch/app/de/texts_of_law/173.200

**SZ — Gebührentarif für Rechtsanwälte (SRSZ 280.411), § 8 · Stand 1.1.2015 · re-verifiziert ✓ 14.6.2026** (`staffel_rahmen`, kein aufwandbasierter Tarif): <2'000 nach Zeitaufwand (Ansatz 180–220, höchstens 1'500) · 2'000–4'000 → 440–1'650 · 4'001–10'000 → 500–2'000 · 10'001–20'000 → 1'100–3'300 · 20'001–50'000 → 1'650–6'600 · 50'001–100'000 → 3'300–9'250 · 100'001–1 Mio → 5'500–39'600 · **>1 Mio → 1–3,5 % des Streitwerts** (§ 8 GebT verbatim bestätigt). Quelle: https://www.sz.ch/public/upload/assets/5862/280_411.pdf

---

## Cleanup vor Code-Encoding (zwingend)
1. **Platzhalter-Obergrenzen / null-Top-Bänder** (UR, SZ, OW, BE, JU, NW, NE, BS, LU): %-Tail ehrlich als Hinweis, kein erfundener Frankenbetrag.
2. **TI** braucht einen Prozent-Spannen-Typ (min/max % × Streitwert) — neues Primitiv-Muster oder als `staffel_rahmen` mit vorab gerechneten min/max je Band.
3. **% auf Gesamtwert vs. marginal** (AG/SG/AI): Agent-Modellierung fachlich prüfen.
4. **Re-Verifikation:** SZ, GL, SH, GR — **ABGESCHLOSSEN 14.6.2026** (Workflow `wibiq1gbs`, am amtlichen Wortlaut bestätigt).
5. **Art. 113 Abs. 1 ZPO** als harter Engine-Vorschalter: Schlichtung → Parteientschädigung 0.
6. Jede Datei: `quelleUrl`, `erlassNr`, `stand`, `artikel`, `verifiziert`, Stützstellen-Test (deterministische Typen).
