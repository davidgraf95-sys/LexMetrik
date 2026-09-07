# Zitatgraph-Warnungen — Fedlex ↔ LexMetrik-Verweiserkennung

> **Bericht, kein Tor.** Erzeugt von `npm run check:zitatgraph`, Exit stets 0,
> nicht Teil von `npm run gate`. Quelle: `messwerte/fedlex-zitatgraph.json`
> (amtliche `jolux:Citation`, DEU) gegen die Fassade `src/lib/fedlex`,
> angewandt auf die gespeicherten Normtext-Snapshots.

## Bekannte Rausch-Klassen — vor jeder Zeile mitlesen

**R1 · Fussnoten-Herkunft ist nicht unterscheidbar.** Fedlex führt Citations aus
dem Normtext UND aus den Fussnoten (Quellenverweise, AS-/BBl-Fundstellen) unter
demselben `citationFromReference`-eId; das Datenmodell trägt kein Merkmal, das
beide trennt (live geprüft 2.9.2026). LexMetrik speichert nur den Normtext —
jede Fussnoten-Citation MUSS hier als «nicht verlinkt» erscheinen. Ein
unbekannter, aber vermutlich erheblicher Teil der Zeilen unten gehört dazu.

**R2 · Ziel ausserhalb des Korpus** — der Leser könnte dort gar nicht verlinken;
separat gezählt, nicht in den Warnungen. **R3 · Absichtliche Zurückhaltung (§1)**
— wo das Ziel nicht deterministisch feststeht, verlinkt die Erkennung bewusst
nicht. **R4 · eId ohne Snapshot-Eintrag** (Anhänge, Übergangsrecht) — separat
gezählt.

**R5 · Verweis auf den GANZEN Erlass, ohne Artikelnummer.** Fedlex zählt auch
«… gilt zudem das Bundesgesetz vom 4. Oktober 1991 über das bäuerliche
Bodenrecht» (OR art_218) als Citation. LexMetriks Erkennung setzt durchweg an
einer Artikelnummer an — einen Erlass-Chip ohne Bestimmung kennt der Leser
nicht. Solche Kanten landen zwangsläufig in Klasse B; sie sind eine bewusste
Modell-Grenze, keine Lücke. Systematische Stichprobe von 10 Klasse-B-Zeilen
(2.9.2026): in KEINER steht eine «Artikel N …»-Stelle mit dem Zielkürzel im
Normtext (OR art_218 → BGBB, MVG art_79 → BVG, ZPO art_5 → FINIG …).

Eine Zeile ist damit ein **Prüfhinweis**, kein Fehlerbeleg.

## Zahlen

| Grösse | Wert |
|---|---|
| Erlasse im Graph | 227 |
| davon verglichen (Snapshot vorhanden) | 227 |
| Fedlex-Kanten vergleichbar (Ziel im Korpus, eId im Snapshot) | 3703 |
| davon vom Leser verlinkt | 2636 (71.2 %) |
| **A · Ziel erkannt, aber nicht verlinkt (N2 Form A)** | **3 (0.1 %)** |
| **B · Warnungen (Fedlex kennt Ziel, Leser erkennt es dort nicht)** | **1064 (28.7 %)** |
| R2 · Ziel ausserhalb des Korpus | 1689 |
| R4 · eId ohne Snapshot-Eintrag | 188 |
| Graph-Erlasse ohne Snapshot | 0 |

**Klasse A ist der belegte Rückstand**, Klasse B die offene Frage. In A nennt der
Normtext das Zielkürzel ausgeschrieben («Artikel N Absatz M KÜRZEL») und LexMetrik
erkennt es — bis W2·22 Z5 (2.9.2026) wurde der Link dort nur unterdrückt, seither
routet ihn `ausgeschriebeneVerweiseImText`; A ist damit von 824 auf 0 gefallen und
bleibt als Wächter gegen Rückfall und neue Zitierformen stehen. Der Gegenprüfungs-
Nachzug zu Z5 (2.9.2026) hat A bewusst wieder auf 3 gehoben: FIDLEV art_111, KKV
art_126_z_octies und FINIV art_93 zitieren das Ziel «in der Fassung vom …», also eine
AUFGEHOBENE Fassung — der Leser zeigt die geltende, in der die Zielbestimmung teils
gar nicht mehr existiert. Fedlex kennt die Kante trotzdem; hier ist A der RICHTIGE
Zustand, nicht ein Rückstand (Guard `historischeFassung`, positivliste.ts). In B mischen sich
R1 (Fussnoten) und R3 (absichtliche Zurückhaltung); B ist ohne Einzelprüfung
nicht auswertbar.

## Klasse A — erkannt, nicht verlinkt (Top 25)

| Erlass | SR | A | B | verlinkt |
|---|---|---|---|---|
| FIDLEV | 950.11 | 1 | 3 | 12 |
| KKV | 951.311 | 1 | 5 | 28 |
| FINIV | 954.11 | 1 | 6 | 36 |

### A · FIDLEV (SR 950.11) — 1 Stellen

- Fedlex kennt Ziel-SR 951.31 (KAG) aus eId `art_111`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.

### A · KKV (SR 951.311) — 1 Stellen

- Fedlex kennt Ziel-SR 951.312 (KKV-FINMA) aus eId `art_126_z_octies`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.

### A · FINIV (SR 954.11) — 1 Stellen

- Fedlex kennt Ziel-SR 951.31 (KAG) aus eId `art_93`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.

## Klasse B — Erlasse mit den meisten Warnungen (Top 25)

| Erlass | SR | B | A | verlinkt | R2 | R4 |
|---|---|---|---|---|---|---|
| ZPO | 272 | 30 | 0 | 47 | 22 | 1 |
| EOG | 834.1 | 25 | 0 | 28 | 15 | 0 |
| StPO | 312.0 | 22 | 0 | 40 | 33 | 3 |
| SchKG | 281.1 | 20 | 0 | 54 | 3 | 2 |
| KKV-FINMA | 951.312 | 20 | 0 | 20 | 8 | 11 |
| AHVV | 831.101 | 19 | 0 | 20 | 15 | 4 |
| ZEMIS-V | 142.513 | 18 | 0 | 23 | 38 | 4 |
| KVV | 832.102 | 17 | 0 | 22 | 34 | 4 |
| AsylG | 142.31 | 16 | 0 | 60 | 11 | 2 |
| BVG | 831.40 | 16 | 0 | 45 | 8 | 6 |
| KAG | 951.31 | 16 | 0 | 36 | 3 | 0 |
| ERV | 952.03 | 16 | 0 | 12 | 5 | 1 |
| ZGB | 210 | 15 | 0 | 20 | 12 | 9 |
| StGB | 311.0 | 15 | 0 | 36 | 40 | 0 |
| AIG | 142.20 | 14 | 0 | 83 | 26 | 0 |
| IVG | 831.20 | 14 | 0 | 93 | 11 | 6 |
| FINMAG | 956.1 | 14 | 0 | 16 | 5 | 0 |
| VZAE | 142.201 | 13 | 0 | 19 | 31 | 0 |
| BetmG | 812.121 | 13 | 0 | 12 | 9 | 0 |
| BPV | 172.220.111.3 | 12 | 0 | 21 | 12 | 0 |
| VStG | 642.21 | 12 | 0 | 20 | 2 | 0 |
| SVG | 741.01 | 12 | 0 | 9 | 23 | 0 |
| VZV | 741.51 | 12 | 0 | 18 | 24 | 2 |
| StBOG | 173.71 | 11 | 0 | 13 | 6 | 0 |
| StHG | 642.14 | 11 | 0 | 19 | 8 | 1 |

## Klasse B — einzelne Hinweise

Je Erlass höchstens 12 Zeilen; vollständige Kantenliste im Artefakt.

### B · ZPO (SR 272) — 30 Hinweise

- Fedlex kennt Ziel-SR 151.1 (GlG) aus eId `art_113`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 832.10 (KVG) aus eId `art_113`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 151.1 (GlG) aus eId `art_114`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 832.10 (KVG) aus eId `art_114`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 151.1 (GlG) aus eId `art_199`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 235.1 (DSG) aus eId `art_20`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 151.1 (GlG) aus eId `art_200`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 210 (ZGB) aus eId `art_21`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 151.1 (GlG) aus eId `art_210`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 151.1 (GlG) aus eId `art_243`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 832.10 (KVG) aus eId `art_243`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 171.10 (ParlG) aus eId `art_250`, Leser verlinkt dort nicht darauf.
- … 18 weitere.

### B · EOG (SR 834.1) — 25 Hinweise

- Fedlex kennt Ziel-SR 831.20 (IVG) aus eId `art_16_g`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 832.10 (KVG) aus eId `art_16_g`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 832.20 (UVG) aus eId `art_16_g`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 833.1 (MVG) aus eId `art_16_g`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 837.0 (AVIG) aus eId `art_16_g`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.20 (IVG) aus eId `art_16_m`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 832.10 (KVG) aus eId `art_16_m`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 832.20 (UVG) aus eId `art_16_m`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 833.1 (MVG) aus eId `art_16_m`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 837.0 (AVIG) aus eId `art_16_m`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.20 (IVG) aus eId `art_16_s`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 832.10 (KVG) aus eId `art_16_s`, Leser verlinkt dort nicht darauf.
- … 13 weitere.

### B · StPO (SR 312.0) — 22 Hinweise

- Fedlex kennt Ziel-SR 935.61 (BGFA) aus eId `art_127`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 211.222.338 (PAVO) aus eId `art_168`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 935.61 (BGFA) aus eId `art_171`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 311.0 (StGB) aus eId `art_23`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 311.0 (StGB) aus eId `art_258_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 311.0 (StGB) aus eId `art_258_b`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 935.61 (BGFA) aus eId `art_264`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 142.20 (AIG) aus eId `art_269`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 170.512 (PublG) aus eId `art_269`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 311.0 (StGB) aus eId `art_269`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 812.121 (BetmG) aus eId `art_269`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 812.21 (HMG) aus eId `art_269`, Leser verlinkt dort nicht darauf.
- … 10 weitere.

### B · SchKG (SR 281.1) — 20 Hinweise

- Fedlex kennt Ziel-SR 955.0 (GwG) aus eId `art_129`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 955.0 (GwG) aus eId `art_136`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 210 (ZGB) aus eId `art_158`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 173.110 (BGG) aus eId `art_19`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 211.231 (PartG) aus eId `art_219`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.10 (AHVG) aus eId `art_219`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.20 (IVG) aus eId `art_219`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 832.20 (UVG) aus eId `art_219`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 834.1 (EOG) aus eId `art_219`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 837.0 (AVIG) aus eId `art_219`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.275.12 (LugÜ) aus eId `art_271`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.275.12 (LugÜ) aus eId `art_279`, Leser verlinkt dort nicht darauf.
- … 8 weitere.

### B · KKV-FINMA (SR 951.312) — 20 Hinweise

- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_109`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 956.1 (FINMAG) aus eId `art_110`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 951.311 (KKV) aus eId `art_111`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 956.1 (FINMAG) aus eId `art_112`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 951.311 (KKV) aus eId `art_113`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 956.1 (FINMAG) aus eId `art_113`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 956.1 (FINMAG) aus eId `art_114`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_115`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 951.311 (KKV) aus eId `art_115`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 951.311 (KKV) aus eId `art_116`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 956.1 (FINMAG) aus eId `art_116`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 951.311 (KKV) aus eId `art_80`, Leser verlinkt dort nicht darauf.
- … 8 weitere.

### B · AHVV (SR 831.101) — 19 Hinweise

- Fedlex kennt Ziel-SR 210 (ZGB) aus eId `art_105`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_105`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 142.513 (ZEMIS-V) aus eId `art_133_bis`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.142.112.681 (FZA) aus eId `art_141_bis`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 235.1 (DSG) aus eId `art_141_septies`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 235.1 (DSG) aus eId `art_174`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 235.11 (DSV) aus eId `art_174`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 822.41 (EG zum FamZG) aus eId `art_211_ter`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.30 (ELG) aus eId `art_28`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 822.41 (EG zum FamZG) aus eId `art_34`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 822.41 (EG zum FamZG) aus eId `art_35`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 822.41 (EG zum FamZG) aus eId `art_41_bis`, Leser verlinkt dort nicht darauf.
- … 7 weitere.

### B · ZEMIS-V (SR 142.513) — 18 Hinweise

- Fedlex kennt Ziel-SR 142.20 (AIG) aus eId `art_10`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 351.1 (IRSG) aus eId `art_10`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 235.11 (DSV) aus eId `art_17`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.142.112.681 (FZA) aus eId `art_2`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.142.30 (GFK) aus eId `art_2`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.142.40 (Staatenlose) aus eId `art_2`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 141.0 (BüG) aus eId `art_2`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 142.20 (AIG) aus eId `art_2`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 142.31 (AsylG) aus eId `art_2`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 170.512 (PublG) aus eId `art_2`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 311.0 (StGB) aus eId `art_2`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 321.0 (MStG) aus eId `art_2`, Leser verlinkt dort nicht darauf.
- … 6 weitere.

### B · KVV (SR 832.102) — 17 Hinweise

- Fedlex kennt Ziel-SR 0.142.112.681 (FZA) aus eId `art_1`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 170.512 (PublG) aus eId `art_1`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 833.1 (MVG) aus eId `art_10_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 834.1 (EOG) aus eId `art_110`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 832.20 (UVG) aus eId `art_112`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 221.229.1 (VVG) aus eId `art_132`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.142.112.681 (FZA) aus eId `art_2`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 811.11 (Verordnung zum Gesundheitsgesetz) aus eId `art_31`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 811.11 (Verordnung zum Gesundheitsgesetz) aus eId `art_38`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 811.11 (Verordnung zum Gesundheitsgesetz) aus eId `art_40`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 811.11 (Verordnung zum Gesundheitsgesetz) aus eId `art_42`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 811.11 (Verordnung zum Gesundheitsgesetz) aus eId `art_44`, Leser verlinkt dort nicht darauf.
- … 5 weitere.

### B · AsylG (SR 142.31) — 16 Hinweise

- Fedlex kennt Ziel-SR 311.0 (StGB) aus eId `art_115`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 142.20 (AIG) aus eId `art_121`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 170.512 (PublG) aus eId `art_14`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.142.30 (GFK) aus eId `art_3`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.142.30 (GFK) aus eId `art_58`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.142.30 (GFK) aus eId `art_59`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 172.021 (VwVG) aus eId `art_6`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 173.110 (BGG) aus eId `art_6`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 173.32 (VGG) aus eId `art_6`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.142.30 (GFK) aus eId `art_63`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 142.20 (AIG) aus eId `art_63`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.142.30 (GFK) aus eId `art_64`, Leser verlinkt dort nicht darauf.
- … 4 weitere.

### B · BVG (SR 831.40) — 16 Hinweise

- Fedlex kennt Ziel-SR 830.1 (ATSG) aus eId `art_18`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.42 (FZG) aus eId `art_27`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_33_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_41`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.425 (FZV) aus eId `art_41`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.42 (FZG) aus eId `art_5`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 171.10 (ParlG) aus eId `art_52_e`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.42 (FZG) aus eId `art_53_e`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.42 (FZG) aus eId `art_57`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 170.32 (VG) aus eId `art_64`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.42 (FZG) aus eId `art_64_c`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.42 (FZG) aus eId `art_65`, Leser verlinkt dort nicht darauf.
- … 4 weitere.

### B · KAG (SR 951.31) — 16 Hinweise

- Fedlex kennt Ziel-SR 961.01 (VAG) aus eId `art_10`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_105`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_111`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_112`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 281.1 (SchKG) aus eId `art_137`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_14`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 172.021 (VwVG) aus eId `art_27`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_37`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_38`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_48`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 950.1 (FIDLEG) aus eId `art_51`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 950.1 (FIDLEG) aus eId `art_71`, Leser verlinkt dort nicht darauf.
- … 4 weitere.

### B · ERV (SR 952.03) — 16 Hinweise

- Fedlex kennt Ziel-SR 952.02 (BankV) aus eId `art_112`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 952.02 (BankV) aus eId `art_118`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 952.0 (BankG) aus eId `art_124`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 952.0 (BankG) aus eId `art_132`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 952.02 (BankV) aus eId `art_47_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 950.1 (FIDLEG) aus eId `art_47_c`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 955.0 (GwG) aus eId `art_47_c`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 958.1 (FinfraG) aus eId `art_47_c`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 952.02 (BankV) aus eId `art_58`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 952.02 (BankV) aus eId `art_59_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 952.02 (BankV) aus eId `art_5_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 952.02 (BankV) aus eId `art_66_a`, Leser verlinkt dort nicht darauf.
- … 4 weitere.

### B · ZGB (SR 210) — 15 Hinweise

- Fedlex kennt Ziel-SR 311.0 (StGB) aus eId `art_314_c`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 311.0 (StGB) aus eId `art_314_d`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 311.0 (StGB) aus eId `art_314_e`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 143.1 (VRPG) aus eId `art_43_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 143.1 (VRPG) aus eId `art_449_c`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 170.32 (VG) aus eId `art_46`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_514`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 211.412.11 (BGBB) aus eId `art_619`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 211.412.11 (BGBB) aus eId `art_654_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 211.412.11 (BGBB) aus eId `art_682_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 171.10 (ParlG) aus eId `art_69_b`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_7`, Leser verlinkt dort nicht darauf.
- … 3 weitere.

### B · StGB (SR 311.0) — 15 Hinweise

- Fedlex kennt Ziel-SR 171.10 (ParlG) aus eId `art_108`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 101 (BV) aus eId `art_265`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 101 (BV) aus eId `art_275`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 742.101 (EBG) aus eId `art_285`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 742.101 (EBG) aus eId `art_286`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.101 (EMRK) aus eId `art_3`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_321`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 171.10 (ParlG) aus eId `art_326_ter`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 235.1 (DSG) aus eId `art_352`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 170.32 (VG) aus eId `art_380_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.101 (EMRK) aus eId `art_5`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.101 (EMRK) aus eId `art_6`, Leser verlinkt dort nicht darauf.
- … 3 weitere.

### B · AIG (SR 142.20) — 14 Hinweise

- Fedlex kennt Ziel-SR 173.32 (VGG) aus eId `art_108_d_bis`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 172.021 (VwVG) aus eId `art_108_f_bis`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 172.021 (VwVG) aus eId `art_122_c`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.142.112.681 (FZA) aus eId `art_2`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.30 (ELG) aus eId `art_43`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.142.30 (GFK) aus eId `art_59`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.142.40 (Staatenlose) aus eId `art_59`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 143.1 (VRPG) aus eId `art_59_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 143.1 (VRPG) aus eId `art_59_b`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.142.112.681 (FZA) aus eId `art_61_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 142.31 (AsylG) aus eId `art_80`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.107 (KRK) aus eId `art_81`, Leser verlinkt dort nicht darauf.
- … 2 weitere.

### B · IVG (SR 831.20) — 14 Hinweise

- Fedlex kennt Ziel-SR 831.10 (AHVG) aus eId `art_11_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 171.10 (ParlG) aus eId `art_14_bis`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 172.056.1 (BöB) aus eId `art_21_quater`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 811.11 (Verordnung zum Gesundheitsgesetz) aus eId `art_26`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 830.1 (ATSG) aus eId `art_3`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 961.01 (VAG) aus eId `art_3_a_bis`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.42 (FZG) aus eId `art_3_b`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 961.01 (VAG) aus eId `art_3_b`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 170.512 (PublG) aus eId `art_3_c`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.42 (FZG) aus eId `art_68_bis`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 961.01 (VAG) aus eId `art_68_bis`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 171.10 (ParlG) aus eId `art_68_quater`, Leser verlinkt dort nicht darauf.
- … 2 weitere.

### B · FINMAG (SR 956.1) — 14 Hinweise

- Fedlex kennt Ziel-SR 221.229.1 (VVG) aus eId `art_1`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 950.1 (FIDLEG) aus eId `art_1`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 951.31 (KAG) aus eId `art_1`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 952.0 (BankG) aus eId `art_1`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 954.1 (FINIG) aus eId `art_1`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 955.0 (GwG) aus eId `art_1`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 958.1 (FinfraG) aus eId `art_1`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 961.01 (VAG) aus eId `art_1`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 951.31 (KAG) aus eId `art_15`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 955.0 (GwG) aus eId `art_15`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 958.1 (FinfraG) aus eId `art_15`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 170.32 (VG) aus eId `art_19`, Leser verlinkt dort nicht darauf.
- … 2 weitere.

### B · VZAE (SR 142.201) — 13 Hinweise

- Fedlex kennt Ziel-SR 0.142.112.681 (FZA) aus eId `art_19`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.142.112.681 (FZA) aus eId `art_19_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.142.112.681 (FZA) aus eId `art_20`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.142.112.681 (FZA) aus eId `art_20_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.30 (ELG) aus eId `art_25`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 142.312 (AsylV 2) aus eId `art_65`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.142.112.681 (FZA) aus eId `art_71_b`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 142.311 (AsylV 1) aus eId `art_74`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 142.312 (AsylV 2) aus eId `art_78`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 142.513 (ZEMIS-V) aus eId `art_87`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 170.512 (PublG) aus eId `art_87`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 142.314 (AsylV 3) aus eId `art_87_a`, Leser verlinkt dort nicht darauf.
- … 1 weitere.

### B · BetmG (SR 812.121) — 13 Hinweise

- Fedlex kennt Ziel-SR 811.11 (Verordnung zum Gesundheitsgesetz) aus eId `art_10`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 170.512 (PublG) aus eId `art_12`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 812.212.1 (AMBV) aus eId `art_12`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 170.512 (PublG) aus eId `art_16`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 812.212.1 (AMBV) aus eId `art_16`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 170.512 (PublG) aus eId `art_20`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 812.212.1 (AMBV) aus eId `art_20`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 641.201 (MWSTV) aus eId `art_27`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 313.0 (VStrR) aus eId `art_28_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 420.1 (Kulturförderungsgesetz) aus eId `art_3_j`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 170.512 (PublG) aus eId `art_9`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 811.11 (Verordnung zum Gesundheitsgesetz) aus eId `art_9`, Leser verlinkt dort nicht darauf.
- … 1 weitere.

### B · BPV (SR 172.220.111.3) — 12 Hinweise

- Fedlex kennt Ziel-SR 172.010.1 (RVOV) aus eId `art_1`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_1`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 412.10 (BBG) aus eId `art_1`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 822.31 (Gesetz über den Sonntagsverkauf) aus eId `art_1`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 170.32 (VG) aus eId `art_101`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.40 (BVG) aus eId `art_116_c`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.10 (AHVG) aus eId `art_116_l`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 830.1 (ATSG) aus eId `art_51`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 836.2 (FamZG) aus eId `art_51_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 836.21 (FamZV) aus eId `art_51_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 834.1 (EOG) aus eId `art_60`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 172.021 (VwVG) aus eId `art_98`, Leser verlinkt dort nicht darauf.

### B · VStG (SR 642.21) — 12 Hinweise

- Fedlex kennt Ziel-SR 951.31 (KAG) aus eId `art_10`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 951.31 (KAG) aus eId `art_11`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 221.229.1 (VVG) aus eId `art_19`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 951.31 (KAG) aus eId `art_26`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 951.31 (KAG) aus eId `art_27`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 173.110 (BGG) aus eId `art_36`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 951.31 (KAG) aus eId `art_4`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_5`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 951.31 (KAG) aus eId `art_5`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 313.0 (VStrR) aus eId `art_67`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.10 (AHVG) aus eId `art_8`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 831.20 (IVG) aus eId `art_8`, Leser verlinkt dort nicht darauf.

### B · SVG (SR 741.01) — 12 Hinweise

- Fedlex kennt Ziel-SR 741.11 (WBauV) aus eId `art_108`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 741.31 (VVV) aus eId `art_108`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_59`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_62`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 221.229.1 (VVG) aus eId `art_65`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_69`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_70`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 832.20 (UVG) aus eId `art_80`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 833.1 (MVG) aus eId `art_81`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 641.71 (CO2-Gesetz) aus eId `art_89_b`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 641.71 (CO2-Gesetz) aus eId `art_89_d`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 641.71 (CO2-Gesetz) aus eId `art_89_e`, Leser verlinkt dort nicht darauf.

### B · VZV (SR 741.51) — 12 Hinweise

- Fedlex kennt Ziel-SR 0.142.30 (GFK) aus eId `art_11`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 0.142.40 (Staatenlose) aus eId `art_11`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 142.20 (AIG) aus eId `art_11`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 143.11 (Vorläufige Verordnung zur Gewährleistung des Rechtswegs in Staatshaftungsverfahren) aus eId `art_11`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 741.31 (VVV) aus eId `art_116`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 741.11 (WBauV) aus eId `art_2`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 741.31 (VVV) aus eId `art_2`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 741.41 (VTS) aus eId `art_2`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 170.512 (PublG) aus eId `art_44`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 170.512 (PublG) aus eId `art_5_i`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 641.71 (CO2-Gesetz) aus eId `art_71`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 741.11 (WBauV) aus eId `art_79`, Leser verlinkt dort nicht darauf.

### B · StBOG (SR 173.71) — 11 Hinweise

- Fedlex kennt Ziel-SR 172.021 (VwVG) aus eId `art_31`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 313.0 (VStrR) aus eId `art_35`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 312.0 (StPO) aus eId `art_37`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 313.0 (VStrR) aus eId `art_37`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 351.1 (IRSG) aus eId `art_37`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 171.10 (ParlG) aus eId `art_39`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 172.021 (VwVG) aus eId `art_39`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 172.220.1 (BPG) aus eId `art_39`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 313.0 (VStrR) aus eId `art_39`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 171.10 (ParlG) aus eId `art_40`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 171.10 (ParlG) aus eId `art_53`, Leser verlinkt dort nicht darauf.

### B · StHG (SR 642.14) — 11 Hinweise

- Fedlex kennt Ziel-SR 171.10 (ParlG) aus eId `art_11`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 822.41 (EG zum FamZG) aus eId `art_11`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 232.14 (PatG) aus eId `art_24_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 232.16 (SortG) aus eId `art_24_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 812.21 (HMG) aus eId `art_24_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 420.1 (Kulturförderungsgesetz) aus eId `art_25_a`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 171.10 (ParlG) aus eId `art_35`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 221.229.1 (VVG) aus eId `art_7`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 951.31 (KAG) aus eId `art_7`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 220 (OR) aus eId `art_7_b`, Leser verlinkt dort nicht darauf.
- Fedlex kennt Ziel-SR 171.10 (ParlG) aus eId `art_9`, Leser verlinkt dort nicht darauf.
