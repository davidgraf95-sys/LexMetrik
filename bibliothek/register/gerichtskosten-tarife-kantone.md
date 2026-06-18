# Register — Kantonale Gerichtskosten-Tarife (Zivil, erstinstanzlich, vermögensrechtlich)

**Erstellt:** 14.6.2026 · **Quelle der Erhebung:** Ultra-Recherche-Workflows
(je Kanton Recherche + unabhängige Verifikation am amtlichen Erlass).
**Geltungsbereich je Eintrag:** Entscheidgebühr/Grundgebühr im erstinstanzlichen
ordentlichen vermögensrechtlichen Zivilverfahren, nach Streitwert.
**Status:** Erstrecherche, amtlich (doppelt) verifiziert; **fachliche Abnahme
David ausstehend (§7)** — nichts trägt `geprüft`. Bundesrechtliche Grundlage:
[[prozesskosten-zpo-95-96]] (Art. 95/96/113/114 ZPO).

`REGEL` = `TarifRegel`-Kodierung für `src/lib/tarif/staffel.ts` (Infinity =
`1000000000000`). Diese Datei ist die durable Persistenz der Recherche und die
Vorlage für `src/data/tarif/gerichtskosten.ts`.

> **⚠ Bereinigung vor dem Code-Encoding (am Ende dokumentiert):** Mehrere
> Einträge tragen für die OFFENE Obergrenze (%-Tail des Tarifs) noch
> Platzhalter-Zahlen oder `null` — diese sind KEINE amtlichen Werte und werden
> beim Encoding durch eine ehrliche Lösung ersetzt (siehe Abschnitt «Cleanup»).

---

## Deutschschweiz

### ZH — GebV OG (LS 211.11), § 4 Abs. 1 · Stand 1.1.2015 (Nachtr. 087)
- Quelle: https://www.zh.ch/de/politik-staat/gesetze-beschluesse/gesetzessammlung/zhlex-ls/erlass-211_11-2010_09_08-2011_01_01-087.html
- Typ: **deterministisch (Grundgebühr, vor Modulation § 4 Abs. 2)**
- REGEL: `{"typ":"staffel_sockel_prozent","baender":[{"bisChf":1000,"sockelChf":0,"abChf":0,"prozent":25,"minChf":150},{"bisChf":5000,"sockelChf":250,"abChf":1000,"prozent":20},{"bisChf":20000,"sockelChf":1050,"abChf":5000,"prozent":14},{"bisChf":80000,"sockelChf":3150,"abChf":20000,"prozent":8},{"bisChf":300000,"sockelChf":7950,"abChf":80000,"prozent":4},{"bisChf":1000000,"sockelChf":16750,"abChf":300000,"prozent":2},{"bisChf":10000000,"sockelChf":30750,"abChf":1000000,"prozent":1},{"bisChf":1000000000000,"sockelChf":120750,"abChf":10000000,"prozent":0.5}]}`
- Kostenlos: bundesrechtlich Art. 113/114 ZPO.

### BE — Verfahrenskostendekret VKD (BSG 161.12), Art. 36/38 · Stand 1.5.2026
- Quelle: https://www.belex.sites.be.ch/app/de/texts_of_law/161.12
- Typ: **Ermessensrahmen je Band** (Agent kodierte als einfachen `rahmen`; Bänder aus Wortlaut → beim Encoding zu `staffel_rahmen`):
  - <10'000 → 300–2'500 · 10'000–30'000 → 900–7'500 (Art. 38, vereinfacht)
  - 30'000–100'000 → 1'000–20'000 · 100'000–500'000 → 4'000–36'000 · 500'000–1 Mio → 8'000–60'000 · 1–2 Mio → 12'000–120'000 · **≥2 Mio → 0,5–7 % des Streitwerts** (%-Tail)
- Kostenlos: Art. 113/114 ZPO; Abs. 2 Miet-/Arbeitsrecht Mindestgebühr unterschreitbar.

### LU — JusKV (SRL 265), § 5 · Stand 1.1.2026
- Quelle: https://srl.lu.ch/app/de/texts_of_law/265
- Typ: **Ermessensrahmen je Band** (→ `staffel_rahmen`):
  - bis 50'000 → 1'500–5'000 · 50'000–100'000 → 2'500–8'000 · 100'000–200'000 → 5'000–12'000 · 200'000–500'000 → 7'500–25'000 · 500'000–1 Mio → 10'000–40'000 · 1–5 Mio → 30'000–125'000 · 5–10 Mio → 50'000–250'000 · **>10 Mio → 1–2,5 %** (%-Tail)
- Kostenlos: Art. 113/114 ZPO.

### AG — Gebührendekret GebührD (SAR 662.110), § 7 Abs. 1 · Stand 1.7.2024  ⚠ bestaetigt=false (Erlass-Korrektur VKD→GebührD; Werte vom Verifizierer bestätigt)
- Quelle: https://gesetzessammlungen.ag.ch/app/de/texts_of_law/662.110
- Typ: **deterministisch (Fix + % vom Gesamtstreitwert)** → `staffel_voll_prozent`:
- REGEL: `{"typ":"staffel_voll_prozent","baender":[{"bisChf":6500,"fixChf":900,"prozent":11},{"bisChf":13000,"fixChf":1160,"prozent":7},{"bisChf":52000,"fixChf":1290,"prozent":6},{"bisChf":100000,"fixChf":770,"prozent":7},{"bisChf":200000,"fixChf":4270,"prozent":3.5},{"bisChf":400000,"fixChf":6870,"prozent":2.2},{"bisChf":800000,"fixChf":9670,"prozent":1.5},{"bisChf":1600000,"fixChf":13670,"prozent":1},{"bisChf":3300000,"fixChf":21670,"prozent":0.5},{"bisChf":1000000000000,"fixChf":28270,"prozent":0.3}]}`
- verifiziert: einfach (Re-Verifikation des GebührD-Wortlauts vor Abnahme empfohlen). Kostenlos: Art. 113/114 ZPO.

_(Tranche 1, Fortsetzung — übrige Deutschschweizer Kantone:)_

### BS — Reglement über die Gerichtsgebühren (GGR, SG 154.810), § 5 · Stand Reglement v. 11.9.2017 → `staffel_rahmen`
- Quelle: https://www.gesetzessammlung.bs.ch/app/de/texts_of_law/154.810
- Bänder (§ 5 Abs. 1): bis 10'000 → 200–1'000 · bis 30'000 → 1'000–3'000 · bis 100'000 → 3'000–6'000 · bis 500'000 → 6'000–20'000 · bis 1 Mio → 20'000–30'000 · bis 5 Mio → 30'000–60'000 · **>5 Mio → 0,5–1,5 %, mind. 60'000**. §§ 15–17 modifizierbar. Kostenlos: Art. 113/114 ZPO.

### SO — Gebührentarif GT (BGS 615.11), § 145 · Stand 1.3.2026 → `staffel_rahmen`
- Quelle: https://bgs.so.ch/app/de/texts_of_law/615.11
- Bänder: bis 30'000 → 200–4'000 · 30'001–50'000 → 600–5'500 · 50'001–100'000 → 800–8'000 · 100'001–200'000 → 1'200–13'000 · 200'001–500'000 → 1'800–25'000 · 500'001–1 Mio → 2'500–50'000 · **>1 Mio → Max + bis 1 %** (%-Tail). Kostenlos: Art. 113/114 ZPO.

### TG — VGG (RB 638.1), § 11 Abs. 1 · Stand 1.1.2022 → `staffel_rahmen`
- Quelle: https://www.rechtsbuch.tg.ch/app/de/texts_of_law/638.1
- Bänder: <30'000 → 200–3'000 (Einzelrichter § 8) · 30'000–100'000 → 1'000–4'000 · 100'000–500'000 → 2'000–8'000 · 500'000–1 Mio → 7'000–15'000 · **>1 Mio → 1–3 %** (%-Tail). Kostenlos: Art. 113/114 ZPO.

### BL — GebT (SGS 170.31), § 8 Abs. 1 lit. f · Stand 1.1.2021 → `staffel_rahmen`
- Quelle: https://bl.clex.ch/app/de/texts_of_law/170.31
- Bänder: bis 10'000 → 200–1'500 · bis 30'000 → 500–3'000 · bis 100'000 → 1'500–10'000 · ab 100'001 → 2'000–30'000. Kostenlos: Art. 113/114 ZPO.

### SG — GKV (sGS 941.12), Art. 10/11 · Stand 1.3.2012 (Folgefassung 1.7.2026 wortgleich) ⚠ Verfall 30.6.2026
- Quelle: https://www.gesetzessammlung.sg.ch/app/de/texts_of_law/941.12
- Typ: **reiner Rahmen** 500–6'000 (Kollegialgericht; Einzelrichter 500–5'000); Art. 11 streitwertabhängige %-DECKE (keine Punktberechnung). REGEL: `{"typ":"rahmen","vonChf":500,"bisChf":6000}`. Kostenlos: Art. 113/114 ZPO.

### SZ — GebO (SRSZ 173.111), § 33 Ziff. 4/6 · Stand 1.1.2026
- Quelle: https://www.sz.ch/public/upload/assets/32452/173_111.pdf
- Typ: **reiner Rahmen** (nicht streitwert-gestaffelt) 100–100'000 (ordentlich; Einzelrichter 100–50'000). REGEL: `{"typ":"rahmen","vonChf":100,"bisChf":100000}`. Kostenlos: Art. 113/114 ZPO.

### GR — VGZ (BR 320.210), Art. 3 · Stand 1.1.2025
- Quelle: https://www.gr-lex.gr.ch/app/de/texts_of_law/320.210
- Typ: **reiner Rahmen** (Pauschale, keine Streitwert-Staffel) 3'000–30'000 (besonders aufwendig bis 100'000). REGEL: `{"typ":"rahmen","vonChf":3000,"bisChf":30000}`. Kostenlos: Art. 113/114 ZPO.

### ZG — KoV OG (BGS 161.7), § 11 Abs. 1 · Stand 1.1.2026 → `staffel_rahmen`
- Quelle: https://bgs.zg.ch/app/de/texts_of_law/161.7
- Bänder: bis 1'000 → 100–200 · 1'000–3'000 → 220–540 · 3'000–5'000 → 540–800 · 5'000–10'000 → 800–1'400 · 10'000–20'000 → 1'400–2'400 · 20'000–50'000 → 2'400–4'000 · 50'000–100'000 → 4'000–6'000 · 100'000–200'000 → 6'000–10'000 · 200'000–500'000 → 10'000–17'500 · 500'000–1 Mio → 17'500–25'000 · 1–5 Mio → 25'000–60'000 · **>5 Mio → ab 60'000 / 1,2 %** (%-Tail). Kostenlos: Art. 113/114 ZPO.

### UR — GGebR (RB 2.3232), Art. 5/6 · Stand 1.10.2023 → `staffel_rahmen`
- Quelle: https://rechtsbuch.ur.ch/api/de/versions/1050/pdf_file
- Bänder: <10'000 → 300–2'500 · 10'000–30'000 → 1'000–5'000 · 30'000–100'000 → 2'000–12'000 · 100'000–500'000 → 4'000–30'000 · 500'000–1 Mio → 10'000–40'000 · **>1 Mio → 1–4 %, mind. 20'000** (%-Tail; Platzhalter maxChf bereinigen). Kostenlos: Art. 113/114 ZPO.

### OW — Gebührenordnung für die Rechtspflege (GebOR, GDB 134.15) · Stand **1.3.2015** → `staffel_rahmen`  ✅ behoben 16.6.2026
- Quelle: https://gdb.ow.ch/app/de/texts_of_law/134.15 · `artikel`: **Art. 12** (Kantonsgericht, ordentl. Verfahren; bis 30'000 Art. 9 Kantonsgerichtspräsidium / vereinfachtes Verfahren). Früher fälschlich «Art. 7» (aufgehoben) · «Stand 1.1.2011». Details: `bibliothek/normen/kantonale-tarif-zitat-befunde.md` Befund 2.
- Bänder: bis 30'000 → 100–3'000 (Art. 9 Ziff. 2 lit. a) · 30'000–50'000 → 1'500–5'000 · 50'000–100'000 → 2'000–6'000 · 100'000–350'000 → 2'500–10'500 · **>350'000 → 3'000 bis 3 % des Streitwerts** (Art. 12 Abs. 1 Ziff. 4 — Platzhalter `maxChf: null` ersetzt durch `maxProzent: 3`). Kostenlos: Art. 113/114 ZPO.

### NW — PKoG (NG 261.2), Art. 7 · Stand 1.1.2016 → `staffel_rahmen`  ⚠ Top-Band null
- Quelle: https://gesetze.nw.ch/app/de/texts_of_law/261.2
- Bänder: bis 5'000 → 200–1'500 · 5'000–10'000 → 600–2'400 · 10'000–30'000 → 1'000–3'200 · 30'000–60'000 → 1'500–4'000 · 60'000–150'000 → 2'500–6'000 · 150'000–300'000 → 3'000–9'000 · **>300'000 → 2–3,5 % des Streitwerts** (Top-Band war null → bereinigen). Kostenlos: Art. 113/114 ZPO.

### GL — ZSPKoV (GS III A/5) · Stand 1.1.2026 → `staffel_rahmen`  ⚠ Platzhalter maxChf
- Quelle: https://gesetze.gl.ch/api/de/versions/2630/pdf_file
- Bänder: bis 30'000 → 200–5'000 · 30'000–100'000 → 500–10'000 · 100'000–500'000 → 1'000–25'000 · 500'000–1 Mio → 2'000–40'000 · **>1 Mio → 4'000–? (%-Tail; Platzhalter 4e10 bereinigen)**. Schlichtung 100–800 (Art. 2). Kostenlos: Art. 113/114 ZPO.

### SH — Justizgesetz JG (SHR 173.200), Art. 83/81 · Stand 1.5.2026 → `staffel_rahmen`  ⚠ Platzhalter maxChf
- Quelle: https://rechtsbuch.sh.ch/app/de/texts_of_law/173.200
- Bänder: bis 2'000 → 100–1'000 · 2'000–30'000 → 200–10'000 · 30'000–100'000 → 500–25'000 · 100'000–500'000 → 1'000–50'000 · 500'000–2 Mio → 2'000–100'000 · **>2 Mio → ab 10'000 (%-Tail; Platzhalter bereinigen)**. Art. 83 Abs. 1: nur «wenn Verfahren nicht kostenlos» (→ Art. 113/114 ZPO).

### AR — Gebührenordnung (bGS 233.3), Art. 17/20 · Stand 1.12.2017
- Quelle: https://ar.clex.ch/app/de/texts_of_law/233.3
- Typ: **Rahmen + Streitwert-Multiplikator** (komplex): Grundrahmen 100–5'000; Art. 20: >50k–100k ×2 (max 10'000), >100k–250k ×3 (max 15'000), je +250k +100 %, besonders aufwendig ×4. REGEL (Basis): `{"typ":"rahmen","vonChf":100,"bisChf":5000}` + Multiplikator-Hinweis. Kostenlos: Art. 113/114 ZPO; Art. 8 Einschreibgebühr-Befreiung.

### AI — GGV (173.810), Art. 11/15 · Stand 1.1.2024
- Quelle: https://ai.clex.ch/api/de/versions/2244/pdf_file
- Typ: **Rahmen + Streitwert-Decke** (wie AR/SG): Bezirksgericht-Kollegium 500–6'000; Art. 15 Decke >50k–100k auf 200 %, >100k–250k 300 %, je +250k +100 %; Höchstrahmen Art. 45 GOG (90'000, ×4 = 360'000, LIK-indexiert). REGEL (Basis): `{"typ":"rahmen","vonChf":500,"bisChf":6000}`. Kostenlos: Art. 113/114 ZPO.

---

## Romandie & Tessin

### FR — Règlement sur la justice RJ (RSF 130.11), Art. 20/21 · Stand 1.12.2025
- Quelle: https://bdlf.fr.ch/app/fr/texts_of_law/130.11
- Typ: **einheitlicher Rahmen** 100–500'000 (unabhängig vom Streitwert; ×2 bis max 1 Mio bei Schwierigkeit). Interne nicht publizierte «échelle». REGEL: `{"typ":"rahmen","vonChf":100,"bisChf":500000}`. Kostenlos: Art. 113/114 ZPO; Arbeit (prud'hommes) Art. 22.

### TI — Legge sulla tariffa giudiziaria LTG (RL 178.200), Art. 7 · Stand 10.2.2015 → `staffel_rahmen`  ⚠ Platzhalter maxChf
- Quelle: https://m3.ti.ch/CAN/RLeggi/public/index.php/raccolta-leggi/pdfatto/atto/137
- Bänder: bis 30'000 → 500–4'000 · 30'000–50'000 → 2'500–5'000 · 50'000–100'000 → 3'000–8'000 · 100'000–200'000 → 5'000–12'000 · 200'000–500'000 → 8'000–20'000 · 500'000–1 Mio → 15'000–40'000 · 1–2 Mio → 25'000–60'000 · 2–5 Mio → 35'000–80'000 · 5–10 Mio → 55'000–100'000 · **>10 Mio → ab 75'000 (%-Tail; Platzhalter bereinigen)**. Kostenlos: Art. 113/114 ZPO.

### VD — Tarif des frais judiciaires civils TFJC (BLV 270.11.5), Art. 17 · Stand 1.9.2019
- Quelle: https://www.lexfind.ch/tolv/105539/fr
- Typ: **deterministisch (Stufen-Sockel, oben + 1,5 % gedeckelt)** → `staffel_sockel_prozent`:
- REGEL: `{"typ":"staffel_sockel_prozent","baender":[{"bisChf":30000,"sockelChf":3750,"abChf":0,"prozent":0},{"bisChf":100000,"sockelChf":7000,"abChf":30000,"prozent":0},{"bisChf":250000,"sockelChf":9500,"abChf":100000,"prozent":0},{"bisChf":500000,"sockelChf":11500,"abChf":250000,"prozent":0},{"bisChf":1000000000000,"sockelChf":15500,"abChf":500000,"prozent":1.5,"maxChf":300000}]}`  ⚠ Sockel-Stufen mit prozent:0 sind PUNKTwerte — fachlich prüfen, ob TFJC Art. 17 wirklich feste Beträge je Stufe vorsieht (oder ein Rahmen). **Re-Verifikation empfohlen.**
- Kostenlos: Art. 113/114/119 VI ZPO; Friedensrichter befreit.

### VS — Gebührentarif GTar/LTar (SR 173.8), Art. 16 · Stand 1.1.2025 → `staffel_rahmen`
- Quelle: https://lex.vs.ch/app/de/texts_of_law/173.8
- REGEL: `{"typ":"staffel_rahmen","baender":[{"grenzeChf":2000,"minChf":180,"maxChf":1200},{"grenzeChf":8000,"minChf":650,"maxChf":1800},{"grenzeChf":20000,"minChf":900,"maxChf":3600},{"grenzeChf":50000,"minChf":1800,"maxChf":6000},{"grenzeChf":100000,"minChf":2700,"maxChf":9600},{"grenzeChf":200000,"minChf":4500,"maxChf":18000},{"grenzeChf":500000,"minChf":9000,"maxChf":42000},{"grenzeChf":1000000,"minChf":18000,"maxChf":60000},{"grenzeChf":1000000000000,"minChf":27000,"maxChf":120000}]}` (Top-Band fester Rahmen — plausibel). Kostenlos: Art. 113/114 ZPO.

### NE — Loi sur les tarifs des frais LTFrais (RSN 164.1), Art. 12 · Stand 1.4.2023
- Quelle: https://rsn.ne.ch/DATA/program/books/RSN2024/20245/htm/164.1.htm
- Typ: **gemischt (feste Beträge unten, % oben)** → `staffel_sockel_prozent` (Agent-Kodierung; ⚠ fachlich prüfen, v.a. Band 13 % ab 10'000 und % auf Gesamtwert vs. Überschuss):
- REGEL: `{"typ":"staffel_sockel_prozent","baender":[{"bisChf":2000,"sockelChf":500,"abChf":0,"prozent":0},{"bisChf":5000,"sockelChf":900,"abChf":0,"prozent":0},{"bisChf":8000,"sockelChf":1000,"abChf":0,"prozent":0},{"bisChf":10000,"sockelChf":1200,"abChf":0,"prozent":0},{"bisChf":30000,"sockelChf":0,"abChf":0,"prozent":13},{"bisChf":100000,"sockelChf":4000,"abChf":30000,"prozent":3},{"bisChf":1000000,"sockelChf":6500,"abChf":100000,"prozent":3},{"bisChf":1000000000000,"sockelChf":0,"abChf":0,"prozent":4,"maxChf":300000}]}`  **Re-Verifikation empfohlen.**
- Kostenlos: Art. 113/114 ZPO.

### GE — Règlement RTFMC (rsGE E 1 05.10), Art. 17 · Stand 1.7.2025 → `staffel_rahmen`
- Quelle: https://silgeneve.ch/legis/data/rsg_e1_05p10.htm
- REGEL: `{"typ":"staffel_rahmen","baender":[{"grenzeChf":10000,"minChf":200,"maxChf":2000},{"grenzeChf":30000,"minChf":1000,"maxChf":3000},{"grenzeChf":100000,"minChf":2000,"maxChf":8000},{"grenzeChf":1000000,"minChf":5000,"maxChf":30000},{"grenzeChf":10000000,"minChf":20000,"maxChf":100000},{"grenzeChf":1000000000000,"minChf":100000,"maxChf":200000}]}`. Kostenlos: prud'hommes ≤30k, Mietgericht, Art. 113/114 ZPO.

### JU — Décret RSJU 176.511, Art. 19 · Stand 1.1.2025 → `staffel_rahmen`
- Quelle: https://rsju.jura.ch/fr/viewdocument.html?idn=20021&id=34172&download=1
- REGEL: `{"typ":"staffel_rahmen","baender":[{"grenzeChf":3000,"minChf":168,"maxChf":1050},{"grenzeChf":10000,"minChf":630,"maxChf":5250},{"grenzeChf":30000,"minChf":1470,"maxChf":14700},{"grenzeChf":50000,"minChf":3150,"maxChf":21000},{"grenzeChf":100000,"minChf":4200,"maxChf":31500},{"grenzeChf":500000,"minChf":5250,"maxChf":52500},{"grenzeChf":1000000,"minChf":10500,"maxChf":84000},{"grenzeChf":1000000000000,"minChf":15750,"maxChf":157500}]}`. Kostenlos: Art. 113/114 ZPO; Cour des assurances/constitutionnelle gratuit.

---

## Cleanup vor dem Code-Encoding (zwingend, §1/§2/§8)

1. **Platzhalter-Obergrenzen ersetzen** (keine amtlichen Werte): OW (`maxChf 3e10`),
   GL (`4e10`), NW (Top-Band `null`), UR/SH/TI (`maxChf 1e15`). Lösung: das offene
   Top-Band als `staffel_rahmen` mit **ehrlichem** Rahmen schliessen — wo der Tarif
   oben einen %-Satz vorsieht (NW 2–3,5 %, UR 1–4 %, SO/TG/ZG/BE/LU %-Tail), wird
   der Betrag NICHT erfunden: Top-Band auf den letzten bezifferten Rahmen + Feld
   `obenProzent`/`obenHinweis` (Engine gibt dort die %-Formel als Hinweis aus).
2. **`rahmen`→`staffel_rahmen` heben** für BE/LU/SO/TG/BL (Bänder oben dokumentiert,
   beim Encoding strukturieren) — praxistauglicher als ein pauschaler Gesamtrahmen.
3. **Re-Verifikation vor Abnahme:** AG (bestaetigt=false, Erlass-Korrektur),
   VD (prozent:0-Stufen = feste Beträge? Rahmen vs. Punkt), NE (gemischte %-Logik).
4. **Reine Rahmen** (kein Streitwert-Bezug): SZ, GR, FR, AR-Basis, AI-Basis,
   SG — bleiben `rahmen`; AR/AI/SG zusätzlich mit Streitwert-Decke (Hinweis).
5. Jede Datei trägt im Code `quelleUrl`, `erlassNr`, `stand`, `artikel`,
   `verifiziert` und (für `staffel`-Typen) die nachgerechneten Stützstellen als Test.
