# Gerichtsgebühren bei NICHT VERMÖGENSRECHTLICHEN Zivilstreitigkeiten — 26 Kantone + Bund

**Erstellt:** 6.6.2026 · **Abrufdatum:** 6.6.2026 · **Status: einfach belegt
(Beträge wörtlich übernommen aus der zweifach/einfach belegten Tiefenerfassung
`bibliothek/kosten/gerichtskosten-kantone.md` Teil A+B und `…/gerichtskosten-bund.md`;
Bundes-Overlay BGG/ZPO am Fedlex-Volltext bestätigt). Adversarialer Doppelcheck
der NICHT-vermögensrechtlichen Sonderrahmen AUSSTEHEND — siehe §5 Verifikations-TODO.**

Auftrag David: Gerichtsgebühren bei nicht vermögensrechtlichen Zivilstreitigkeiten
(Scheidung, Persönlichkeit, Gewaltschutz, Kindesbelange …). Die bestehende
Tiefenerfassung deckt primär die **streitwertabhängigen** Staffeln ab; dieses
Dossier zieht die **separaten nicht-vermögensrechtlichen Rahmen/Pauschalen** je
Kanton heraus, schichtet die **bundesrechtlichen Kostenfreiheits-Overlays** ab und
skizziert die Code-Integration.

**Methode (§7/§8):** Keine Beträge erfunden. Wo der kantonale Erlass **keinen
separaten** nicht-vermögensrechtlichen Rahmen kennt (Auffangklausel / «unbestimmter
Streitwert» / Ermessensformel), ist das wörtlich ausgewiesen. Quellen-URLs = die
amtlich geprüften Links aus `src/data/erlassLinks.ts` (in der Tiefenerfassung
verlinkt). Alle Beträge in CHF, soweit nicht anders bezeichnet (BE = Taxpunkte
à CHF 1; JU = Punkte à CHF 1.05 ab 1.1.2025).

---

## 1. Bundesrechtliche Overlays ZUERST (Bund vor Kanton prüfen)

Bei nicht vermögensrechtlichen Streitigkeiten greifen mehrere **bundesrechtliche
Overrides**, die die kantonalen Rahmen ganz oder teilweise verdrängen. Die Engine
muss diese **vor** der kantonalen Rahmen-Ausgabe prüfen.

### 1.1 Art. 113/114 ZPO — Kostenfreiheit (bundesrechtlicher Override)

| Norm | Wirkung | Anwendungsfälle (nicht vermögensr. relevant) |
|---|---|---|
| **Art. 113 Abs. 2 ZPO** | KEINE Gerichtskosten im **Schlichtungsverfahren** | lit. a GlG · lit. abis Gewaltschutz (Art. 28b ZGB) · lit. c Miete Wohn-/Geschäftsraum · lit. d Arbeit bis CHF 30'000 · lit. e Klagen nach BehiG |
| **Art. 114 ZPO** | KEINE Gerichtskosten im **Entscheidverfahren** | lit. a GlG · lit. c Arbeit bis CHF 30'000 · lit. d Klagen nach BehiG · **lit. f Gewaltschutz nach Art. 28b/28c ZGB** |

**Befund zur Engine (`src/lib/zustaendigkeit.ts`):**
- **Art. 113 Abs. 2 ZPO (Schlichtung kostenlos)** ist abgebildet (Z. 375–388):
  GlG (`glgBetroffen`), Miete (`istMiete`), Arbeit ≤ CHF 30'000. Gewaltschutz
  (lit. abis) ist dort bewusst **gegenstandslos**, weil die Schlichtung beim
  Gewaltschutz ohnehin entfällt (Art. 198 lit. abis ZPO).
- **Art. 114 lit. f ZPO (Gewaltschutz — keine Gerichtskosten im Entscheidverfahren)**
  ist abgebildet (Z. 473–474): Warnung *«Im Entscheidverfahren werden keine
  Gerichtskosten gesprochen (Art. 114 lit. f ZPO); die Parteientschädigung bleibt
  vorbehalten.»* → **Override für Gewaltschutz ist im Code bereits berücksichtigt.**
- **LÜCKE (für die neue Erweiterung):** Art. 114 lit. a/c/d (GlG, Arbeit ≤ 30'000,
  BehiG) führen ebenfalls zu **Kostenfreiheit im ENTSCHEIDverfahren** — das ist im
  Code bisher nur für die *Schlichtung* (Art. 113) gespiegelt, nicht für das
  Entscheidverfahren. Bei einer Gebühren-Ausgabe (neues Feld
  `nichtVermoegensrechtlich`) muss die Engine bei `glgBetroffen` / Arbeit ≤ 30'000 /
  BehiG den **kantonalen Rahmen auf CHF 0 überschreiben** (Art. 114 ZPO), analog zur
  bestehenden `kostenlos`-Logik. (Siehe §4.)

> **Reihenfolge der Prüfung (Engine):** (1) Art. 114 ZPO → CHF 0? · (2) sonst
> kantonaler nicht-vermögensrechtlicher Rahmen. · Für das BGer separat: Art. 65 BGG.

### 1.2 Bundesgericht — Art. 65 BGG + Tarif (nicht vermögensrechtlich)

Quelle: `bibliothek/kosten/gerichtskosten-bund.md` (zweifach geprüft, Fedlex-Volltext).

- **Art. 65 Abs. 3 lit. a BGG** (SR 173.110, Stand 1.4.2026): Streitigkeiten **ohne
  Vermögensinteresse** → Gerichtsgebühr **200–5'000 Franken**.
- **Art. 65 Abs. 4 BGG:** **200–1'000 Franken** (nicht nach Streitwert) bei
  Sozialversicherungsleistungen, Diskriminierung aufgrund des Geschlechts,
  Arbeitsverhältnis bis Streitwert 30'000 sowie Klagen nach Art. 7/8 BehiG.
- **Art. 65 Abs. 5 BGG:** Überschreitung der Höchstbeträge aus besonderen Gründen,
  höchstens auf das **Doppelte** (Abs. 3) bzw. bis 10'000 (Abs. 4).
- **Tarif SR 173.110.210.1 Ziff. 2:** ohne Vermögensinteresse **200–5'000**;
  Fälle nach Art. 65 Abs. 4 BGG **200–1'000**.
- **Parteientschädigung SR 173.110.210.3 Art. 6:** Streitsachen ohne Vermögens­
  interesse **600–18'000**.

### 1.3 BVGer (zur Vollständigkeit, nicht-zivil)

VGKE Art. 3 (SR 173.320.2): ohne Vermögensinteresse — einzelrichterlich **200–3'000**,
übrige Fälle **200–5'000**. (Verwaltungsgerichtlich; für Zivil nicht einschlägig,
aber als Bundes-Overlay-Übersicht hier geführt.)

---

## 2. JE KANTON (26) — nicht vermögensrechtlicher Rahmen + Sonderrahmen Familie

Alle Angaben aus `bibliothek/kosten/gerichtskosten-kantone.md` (Teil A: ZH–BL;
Teil B: SH–JU), wörtlich, mit §/Art.-Anker. «Familie» = ausgewiesener Sonderrahmen
für Scheidung/Eheschutz/familienrechtliche Verfahren (sonst: kein separater Rahmen).

### ZH — GebV OG (LS 211.11)
- **Nicht vermögensr. (§ 5):** i.d.R. **CHF 300 – 13'000**, nach tatsächlichem
  Streitinteresse / Zeitaufwand / Schwierigkeit.
- **Familie (§ 6):** Scheidung auf gemeinsames Begehren / Eheschutz: Reduktion **bis
  zur Hälfte** (auf den Grundtarif). Summarisch (§ 8): ½–¾ der ordentlichen Gebühr.

### BE — VKD (BSG 161.12), Taxpunkte à CHF 1
- **Nicht vermögensr. ordentlich (Art. 37):** **200 – 10'000 TP**;
  vereinfacht (Art. 39): **200 – 7'500 TP**; Berufung nicht vermögensr. (Art. 45):
  **200 – 12'000 TP**.
- **Familie/Scheidung (Art. 41):** **600 – 12'000 TP** (summarisches Verfahren Art. 40:
  100–20'000 TP).

### LU — JusKV (SRL 265)
- **Nicht vermögensr. ordentlich (§ 5 Abs. 1):** **CHF 1'000 – 12'000**;
  vereinfacht (§ 6): **500 – 5'000**; summarisch (§ 7): **300 – 4'000**.
- **Familie (§ 8):** eigener Familienrecht-Abschnitt (Rahmen über § 8).

### UR — GGebR (RB 2.3232)
- **Nicht vermögensr. ordentlich (Art. 5 Abs. 1):** **CHF 200 – 10'000**;
  vereinfacht (Art. 6): **200 – 5'000**.
- **Familie (Art. 8):** familienrechtliche Verfahren inkl. Summarverfahren
  **CHF 500 – 10'000**.

### SZ — GebO (SRSZ 173.111)
- **KEIN separater nicht-vermögensrechtlicher Rahmen** und keine Streitwert-Staffel.
  Läuft über die **Instanz-Rahmen** (Einzelrichter § 33: 100–50'000; Bezirksgericht
  § 33: 100–100'000), Bemessung nach **Bedeutung/Zeitaufwand** (§ 3, max. CHF 180/Std.).
- **Familie:** kein eigener Rahmen — innerhalb der Instanz-Rahmen. *(Offener Punkt:
  effektive Höhe rein bemessungsabhängig, nicht tariflich gebändert.)*

### OW — GebOR (GDB 134.15)
- **Nicht vermögensr. / familienrechtlich — eigene Zeile in jeder Instanz-Staffel:**
  Einzelrichter (Art. 9) **CHF 100 – 5'000**; Kantonsgericht Kollegial (Art. 12)
  **CHF 800 – 10'000** (Güterrecht > 50'000 → Streitwert-Ansätze hinzu);
  Obergericht Beschwerde (Art. 14) **200 – 5'000**.
- **Familie:** «ohne Vermögensinteressen / familienrechtlich» ist die **gleiche**
  ausgewiesene Zeile (s.o.) — Familie = nicht-vermögensr. Rahmen.

### NW — PKoG (NG 261.2)
- **Nicht vermögensr. / ohne bestimmbaren SW (Art. 7 Abs. 2):** **CHF 300 – 10'000**.
- **Familie (Art. 7 Abs. 3):** eigener Abschnitt; **Scheidung 800 – 4'000** u.a.

### GL — Kosten-VO (GS III A/5)
- **Nicht vermögensr. (Art. 3 Abs. 2):** **höchstens CHF 20'000** (Obergrenze; keine
  Untergrenze normiert — Bemessung Art. 1). Summarisch: höchstens die Hälfte.
- **Familie:** kein eigener Rahmen — über Art. 3.

### ZG — KoV OG (BGS 161.7)
- **Nicht vermögensr. (§ 11 Abs. 2):** **CHF 150 – 12'000**.
- **Familie (§ 13):** **CHF 1'600 – 12'000** (summarisch bis halbiert).

### FR — JR (SGF 130.11)
- **KEIN separater publizierter nicht-vermögensrechtlicher Rahmen.** Es gelten die
  **weiten Gericht-Rahmen** (Zivilgericht Art. 20: **100 – 500'000**, verdoppelbar;
  Kantonsgericht Art. 19: 100 – 200'000). Die Streitwert-Abstufung erstellt das
  Kantonsgericht intern (Art. 21 JR — nicht als BDLF-Erlass publiziert).
- **Familie:** kein eigener Rahmen. *(Offener Punkt wie in der Tiefenerfassung.)*

### SO — GT (BGS 615.11)
- **Nicht bezifferbarer SW / nicht vermögensr. (§ 145 Abs. 3):** **CHF 200 – 20'000**.
  Eine § 145-Staffel gilt für **alle Instanzen**.
- **Familie:** kein gesonderter Rahmen — über § 145 Abs. 3.

### BS — GGR (SG 154.810)
- **Nicht vermögensr. (§ 5 Abs. 3):** **CHF 200 – 250'000** (weitester kantonaler
  Rahmen!).
- **Familie (§ 10):** Eheschutz **300 – 2'000** (aufwendig bis 10'000).

### BL — GebT (SGS 170.31)
- **Unbestimmter SW (§ 8 Abs. 1 lit. g):** **CHF 200 – 30'000**.
- **Familie — eigene Zeilen:** Eheschutz/Partnerschaftsschutz (lit. h) **CHF 200 – 3'000**;
  **Ehescheidung/-ungültigkeit/-trennung/Partnerschaftsauflösung (lit. i) CHF 200 – 15'000.**

### SH — Justizgesetz (SHR 173.200), Fassung ab 1.5.2026
- **Nicht vermögensr. (Art. 81 Abs. 2):** **KEIN eigener Bandrahmen** — «es wird vom
  tatsächlichen Streitinteresse ausgegangen … nach Ermessen … die Vorschriften über
  den Streitwert gelten sinngemäss» → **Tarif Art. 83 sinngemäss**.
- **Familie:** kein eigener Rahmen — über Art. 83 sinngemäss.
- *Korrektur (Tiefenerfassung): Gebühren stehen im Justizgesetz, nicht in einer
  «Kostenverordnung 2003» (= Luzern, Fehlzuordnung).*

### AR — Gebührenordnung (bGS 233.3)
- **KEIN separater nicht-vermögensrechtlicher Rahmen.** Bemessung nach
  Bedeutung/Zeitaufwand (Art. 4) **innerhalb der Behörden-Rahmen** (Einzelrichter KG
  Art. 14: 30–1'500; Kantonsgericht Kollegial Art. 17: 100–5'000).
- **Familie — ausdrücklich:** **Scheidung CHF 500 – 6'000** (Art. 14 Einzelrichter KG;
  Obergericht Art. 16 ebenfalls 500–6'000).

### AI — Verordnung über die Gebühren der Gerichte (GS 173.810), ab 1.1.2024
- **KEIN separater nicht-vermögensrechtlicher Rahmen.** Bemessung im Rahmen nach
  Bedeutung/Aufwand (Art. 2): Einzelrichter (Art. 10) **300 – 5'000**; Bezirksgericht
  Kollegial (Art. 11) **500 – 6'000**; Rechtsmittel (Art. 13) **800 – 8'000**.
- **Familie:** kein eigener Rahmen.

### SG — Gerichtskostenverordnung (sGS 941.12)
- **KEIN separater nicht-vermögensrechtlicher Rahmen.** Bemessung im Rahmen (Art. 4):
  Kreisgericht End-/Zwischenentscheide **500 – 6'000** (Einzelrichter 500–5'000);
  Kantonsgericht (Art. 10 Ziff. 2) Kammer **800 – 8'000**.
- **Familie:** kein eigener Rahmen.
- *Verfall: GKV laut OrdoLex «in Vollzug bis 30.6.2026» — Divergenz im publizierten
  Text (keine Sunset-Klausel auffindbar). Ab 1.7.2026 prüfen (Verfallsregister).*

### GR — VGZ (BR 320.210), neue VO vom 2.1.2025
- **KEIN separater nicht-vermögensrechtlicher Rahmen.** Zuordnung über Verfahrenstyp:
  ordentlich (Art. 3) **3'000 – 30'000**; vereinfacht (Art. 4) **1'000 – 8'000**.
- **Familie (Art. 6):** ehe-/kindesrechtliche Verfahren — Einzelrichter **1'000 – 5'000**;
  Kollegialgericht **3'000 – 8'000**.

### AG — Gebührendekret (SAR 662.110), Stand 1.7.2024
- **Nicht vermögensr. (§ 7 Abs. 2):** **CHF 500 – 10'000**.
- **Familie:** kein gesonderter Rahmen (über § 7 Abs. 2 / Streitwert-Formel § 7 Abs. 1).

### TG — VGG (RB 638.1)
- **Nicht vermögensr. (§ 11 Ziff. 2):** **CHF 300 – 5'000** (soweit nicht Ziff. 1 nach
  vermögensrechtlichen Ansprüchen anwendbar).
- **Familie:** kein eigener Rahmen — über § 11 Ziff. 2.

### TI — LTG (RL 178.200)
- **Nicht vermögensr. = unbestimmter Streitwert / Scheidung (Art. 7 cpv. 2):**
  **CHF 250 – 20'000.** (Summarisch Art. 9: la metà; vereinfacht Art. 8: la metà.)
- **Familie:** Scheidung ist **ausdrücklich** in Art. 7 cpv. 2 erfasst (250–20'000).

### VD — TFJC (BLV 270.11.5)
- **Nicht vermögensr. (litiges non patrimoniaux):** ordentlich (Art. 21)
  **CHF 3'750 – 300'000**; vereinfacht (Art. 26) **360 – 200'000**; Berufung nicht
  vermögensr. (Art. 64) **800 – 6'000** (bis SW 30'000).
- **Familie:** kein separater Tarifartikel — über Art. 21/26 (non patrimonial).

### VS — LTar (RS/VS 173.8)
- **Nicht vermögensr. (Art. 17):** **CHF 280 – 9'600** (ordentlich/vereinfacht); gilt
  auch für **Abänderung Scheidung/Trennung/Unterhalt**; bei Scheidung **mit
  Güterrecht** zusätzlich Streitwert-Tarif Art. 16.
- **Familie:** Art. 17 (Abänderung Scheidung/Trennung/Unterhalt) — s.o.

### NE — LTFrais (RSN 164.1), état 1.4.2023
- **Non patrimonial (Art. 12 al. 2bis):** **CHF 500 – 50'000.**
- **Familie — eigene Formel (Art. 16/17):** Divorce **2,5–4 % du revenu + 2,5–4 ‰ de
  la fortune, min. 600**; gemeinsames Begehren mit vollständiger Einigung (Art. 18)
  **1,3 % / 1,3 ‰, min. 400 / max. 2'000.** *(Einkommens-/vermögensabhängige Formel —
  kein fixer Rahmen!)*

### GE — RTFMC (rsGE E 1 05.10), Stand 1.7.2025
- **Causes non pécuniaires (Art. 18):** **CHF 200 – 50'000.**
- **Familie:** kein gesonderter Tarifartikel — über Art. 18 (non pécuniaire).

### JU — Décret (RSJU 176.511), Punkt = CHF 1.05 (ab 1.1.2025)
- **Sans valeur litigieuse (Art. 20):** juge civil **300 – 6'000 Punkte**
  (≈ CHF 315 – 6'300); Tribunal des baux/prud'hommes 120–2'200; Cour civile
  1'500–36'000.
- **Familie:** kein eigener Punkte-Rahmen — über Art. 20 (sans valeur litigieuse).

---

## 3. SYNTHESE-TABELLE (26 Kantone)

| Kanton | Erlass + § (nicht vermögensr.) | Rahmen nicht-vermögensr. | Sonderrahmen Familie/Scheidung | Stand | Offene Punkte |
|---|---|---|---|---|---|
| ZH | GebV OG § 5 (LS 211.11) | 300 – 13'000 | § 6: Scheidung/Eheschutz bis ½ reduziert | 6.6.2026 | — |
| BE | VKD Art. 37 (BSG 161.12) | 200 – 10'000 TP | Art. 41: 600 – 12'000 TP | 6.6.2026 | — |
| LU | JusKV § 5 Abs. 1 (SRL 265) | 1'000 – 12'000 | § 8 Familienrecht | 6.6.2026 | Familien-Detailbeträge § 8 nachziehen |
| UR | GGebR Art. 5 Abs. 1 (RB 2.3232) | 200 – 10'000 | Art. 8: 500 – 10'000 | 6.6.2026 | — |
| SZ | GebO § 33 (SRSZ 173.111) | **kein eigener Rahmen** (Instanz-Rahmen, Bemessung § 3) | kein eigener Rahmen | 6.6.2026 | rein bemessungsabhängig (§ 3, max. 180/Std.) |
| OW | GebOR Art. 9/12/14 (GDB 134.15) | 100 – 5'000 (EinzelR) / 800 – 10'000 (KG) | = nicht-vermögensr. Zeile (Familie identisch) | 6.6.2026 | — |
| NW | PKoG Art. 7 Abs. 2 (NG 261.2) | 300 – 10'000 | Art. 7 Abs. 3: Scheidung 800 – 4'000 | 6.6.2026 | — |
| GL | Kosten-VO Art. 3 Abs. 2 (GS III A/5) | höchstens 20'000 (keine Untergrenze) | kein eigener Rahmen | 6.6.2026 | Untergrenze nur via Bemessung Art. 1 |
| ZG | KoV OG § 11 Abs. 2 (BGS 161.7) | 150 – 12'000 | § 13: 1'600 – 12'000 | 6.6.2026 | — |
| FR | JR Art. 20 (SGF 130.11) | **kein eigener Rahmen** (Gericht-Rahmen 100 – 500'000) | kein eigener Rahmen | 6.6.2026 | KG-Abstufung (Art. 21) nicht publiziert |
| SO | GT § 145 Abs. 3 (BGS 615.11) | 200 – 20'000 | kein eigener Rahmen | 6.6.2026 | — |
| BS | GGR § 5 Abs. 3 (SG 154.810) | 200 – 250'000 | § 10: Eheschutz 300 – 2'000 (bis 10'000) | 6.6.2026 | — |
| BL | GebT § 8 Abs. 1 lit. g (SGS 170.31) | 200 – 30'000 | lit. h Eheschutz 200 – 3'000 · lit. i Scheidung 200 – 15'000 | 6.6.2026 | — |
| SH | JG Art. 81 Abs. 2 (SHR 173.200) | **kein eigener Rahmen** (Streitinteresse n. Ermessen; Art. 83 sinngemäss) | kein eigener Rahmen | 6.6.2026 (ab 1.5.2026) | — |
| AR | GebO Art. 4/14/17 (bGS 233.3) | **kein eigener Rahmen** (Bemessung im Behörden-Rahmen) | **Scheidung 500 – 6'000** (Art. 14/16) | 6.6.2026 | — |
| AI | GGV Art. 2/10/11 (GS 173.810) | **kein eigener Rahmen** (300 – 6'000 Bemessung) | kein eigener Rahmen | 6.6.2026 | — |
| SG | GKV Art. 4/10 (sGS 941.12) | **kein eigener Rahmen** (500 – 6'000 Bemessung) | kein eigener Rahmen | 6.6.2026 | **GKV-Sunset 30.6.2026 prüfen** |
| GR | VGZ Art. 3/4 (BR 320.210) | **kein eigener Rahmen** (Verfahrenstyp) | Art. 6: ehe-/kindesr. 1'000 – 8'000 | 6.6.2026 (VO 2.1.2025) | — |
| AG | GebührD § 7 Abs. 2 (SAR 662.110) | 500 – 10'000 | kein eigener Rahmen | 6.6.2026 | — |
| TG | VGG § 11 Ziff. 2 (RB 638.1) | 300 – 5'000 | kein eigener Rahmen | 6.6.2026 | — |
| TI | LTG Art. 7 cpv. 2 (RL 178.200) | 250 – 20'000 | Scheidung in Art. 7 cpv. 2 erfasst | 6.6.2026 | — |
| VD | TFJC Art. 21/26/64 (BLV 270.11.5) | 3'750 – 300'000 (ord.) / 360 – 200'000 (vereinf.) | über Art. 21/26 (non patrimonial) | 6.6.2026 | — |
| VS | LTar Art. 17 (RS/VS 173.8) | 280 – 9'600 | Art. 17 (Abänderung Scheid./Unterhalt); + Art. 16 b. Güterrecht | 6.6.2026 (état 1.1.2018) | spätere Teilrevisionen nicht abgeglichen |
| NE | LTFrais Art. 12 al. 2bis (RSN 164.1) | 500 – 50'000 | **Formel** Art. 16/17: 2,5–4 % Einkommen + 2,5–4 ‰ Vermögen, min. 600 | 6.6.2026 (état 1.4.2023) | Familien-Formel nicht als Rahmen abbildbar |
| GE | RTFMC Art. 18 (rsGE E 1 05.10) | 200 – 50'000 | über Art. 18 | 6.6.2026 (Stand 1.7.2025) | — |
| JU | Décret Art. 20 (RSJU 176.511) | 300 – 6'000 Punkte (≈ 315 – 6'300) | über Art. 20 | 6.6.2026 | Punktwert 1.05 zwingend einrechnen |
| **Bund/BGer** | Art. 65 Abs. 3 lit. a BGG + Tarif Ziff. 2 | **200 – 5'000** (Abs. 4: 200 – 1'000) | — | 1.4.2026 | zweifach geprüft |

**Quartett ohne separaten Rahmen** (nur Auffang/Bemessung): **SZ, FR, SH, AR, AI,
SG, GR** — bei diesen ist der nicht-vermögensr. Betrag NICHT tariflich gebändert,
sondern Ergebnis der allgemeinen Bemessungsregel. → Engine darf hier **keinen
Zahlenrahmen suggerieren**, sondern den Bemessungs-/Instanz-Rahmen + Hinweis zeigen.

---

## 4. §2-BEURTEILUNG: Rechner-Tauglichkeit & Code-Integration

**Determinismus (§2):** Die nicht-vermögensrechtliche Gebühr ist **reines
Behörden-Ermessen** innerhalb eines Rahmens (oder — bei NE — eine einkommens-/
vermögensabhängige Formel). Eine **Berechnung** ist nicht deterministisch möglich.
Zulässig ist ausschliesslich die **RAHMEN-Ausgabe** (min/max + Erlass), genau wie
die bestehende `gericht`-Zeile in `zustaendigkeitKosten.ts`. Kein Punktwert, kein
„konkreter Betrag".

**Integration (Skizze — KEINE Code-Änderung in diesem Auftrag):**

Erweiterung von `KantonKosten` in `src/data/zustaendigkeitKosten.ts` um ein
**optionales** Feld (analog zur bestehenden `gericht`-Zeile), z.B.:

```ts
export interface KantonKosten {
  stand: string;
  schlichtung: KostenRahmen;
  gericht: KostenRahmen;                       // streitwertabhängig (bestehend)
  nichtVermoegensrechtlich?: KostenRahmen;     // NEU: separater Rahmen ODER
                                               //      Auffang-Hinweis (SZ/FR/SH/AR/AI/SG/GR)
  familie?: KostenRahmen;                      // NEU (optional): eigener Familien-/
                                               //      Scheidungsrahmen, wo ausgewiesen
}
```

- Wo **kein separater Rahmen** existiert (SZ, FR, SH, AR, AI, SG, GR): `text`
  beschreibend setzen («kein eigener Rahmen — Bemessung im Instanz-/Verfahrensrahmen
  X–Y nach §…») statt eines erfundenen Zahlenrahmens (§8).
- Wo **Familie als Formel** vorliegt (NE): `familie.text` als wörtliche Formel-
  Beschreibung («2,5–4 % Einkommen + 2,5–4 ‰ Vermögen, min. 600»), **nicht** als
  Rahmen — die UI darf das nicht als rechenbar darstellen.

**Engine-Override (Bund vor Kanton, §1):** Vor Ausgabe des kantonalen Rahmens muss
`src/lib/zustaendigkeit.ts` prüfen:
- **Gewaltschutz** (`istGewaltschutz`, bereits vorhanden) → Entscheidverfahren CHF 0
  (Art. 114 lit. f ZPO; Warnung existiert bereits Z. 473–474).
- **GlG** (`glgBetroffen`) / **Arbeit ≤ 30'000** / **BehiG** → Entscheidverfahren CHF 0
  (Art. 114 lit. a/c/d ZPO). **Diese Override-Logik fehlt bisher für das
  Entscheidverfahren** (nur Schlichtung Art. 113 ist gespiegelt) → in einem eigenen,
  deklarierten fachlichen Schritt nachrüsten, **bevor** das Feld `nichtVermoegens-
  rechtlich` in der UI angezeigt wird.
- **BGer:** separate Ausgabe Art. 65 Abs. 3 lit. a / Abs. 4 BGG (200–5'000 / 200–1'000).

**Verfallsregister-Einträge (neu vorzumerken, sobald Code verdrahtet):**
- `zustaendigkeitKosten.<Kt>.nichtVermoegensrechtlich` — gleicher Prüfrhythmus wie
  die bestehende `gericht`-Zeile (jährlich + bei Rechtsänderung).
- **NE Familien-Formel (Art. 16/17 LTFrais):** Prozent-/Promille-Sätze sind datierte
  Parameter → ins Verfallsregister, wenn verdrahtet.
- **JU Punktwert 1.05** (ab 1.1.2025): bereits im Code/Register für `gericht`; gilt
  identisch für `nichtVermoegensrechtlich`.
- **SG GKV-Sunset 30.6.2026:** bereits im Register; betrifft auch den nicht-
  vermögensr. Bemessungsrahmen.

---

## 5. Verifikations-TODOs (Doppelcheck-Plan analog Teil A/B)

Alle nicht-vermögensrechtlichen Sonderrahmen sind **einfach belegt** (aus der
Tiefenerfassung übernommen, die ihrerseits für die Streitwert-Staffeln einfach
belegt ist; Bund zweifach). Vor «geprüft» (§7) erforderlich:

1. **Familien-Sonderrahmen wörtlich am Volltext gegenprüfen** (höchste Priorität,
   da im Auftrag zentral): ZH § 6, BE Art. 41, LU § 8 (Detailbeträge noch ziehen!),
   UR Art. 8, NW Art. 7 Abs. 3, ZG § 13, BS § 10, **BL lit. h/i**, GR Art. 6,
   AR Art. 14/16, VS Art. 17, **NE Art. 16/17 (Formel — exakte %/‰ und min/max)**.
2. **Auffang-Kantone (SZ, FR, SH, AR, AI, SG, GR):** bestätigen, dass wirklich KEIN
   separater nicht-vermögensr. Rahmen existiert (Negativ-Befund am Volltext sichern,
   damit die UI ehrlich «kein eigener Rahmen» zeigt).
3. **Art. 114 ZPO Entscheidverfahren-Override (GlG/Arbeit/BehiG):** am Fedlex-Volltext
   Art. 114 lit. a/c/d bestätigen und die Code-Lücke (§4) schliessen.
4. **GL § 3 Abs. 2 Untergrenze:** prüfen, ob wirklich nur «höchstens 20'000» ohne
   Untergrenze (Bemessung Art. 1) — UI darf keine Untergrenze erfinden.
5. **SG-Sunset & VS-Teilrevisionen:** offene Punkte aus dem Verfallsregister vor
   Übernahme der SG/VS-Rahmen abarbeiten.
6. **BGer Art. 65 Abs. 4 Abgrenzung:** klarstellen, dass die 200–1'000-Spanne nur für
   den dort genannten Katalog (Sozialvers./GlG-Diskriminierung/Arbeit ≤ 30'000/BehiG)
   gilt, nicht generell für «nicht vermögensrechtlich».

---

### Erfasste Erlasse / Quellen
- `bibliothek/kosten/gerichtskosten-kantone.md` (Teil A ZH–BL, Teil B SH–JU) — alle
  nicht-vermögensr. Rahmen und Familien-Sonderrahmen (URLs dort verlinkt).
- `bibliothek/kosten/gerichtskosten-bund.md` — Art. 65 BGG + Tarife (zweifach geprüft).
- `src/data/zustaendigkeitKosten.ts` — bestehende Kurzrahmen (Erweiterungsbasis).
- `src/lib/zustaendigkeit.ts` Z. 375–388 (Art. 113 Schlichtung), Z. 473–474
  (Art. 114 lit. f Gewaltschutz) — Bund-Overlay teilweise vorhanden.
- `bibliothek/register/parameter-verfall.md` — SG-Sunset, JU-Punktwert, VS-Stand.
