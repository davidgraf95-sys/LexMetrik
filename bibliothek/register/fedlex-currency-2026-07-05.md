# Fedlex-Currency-Lauf 5.7.2026 — Paket 1 · P1-a + P1-b (QS-CURRENCY)

Ausführungsbeleg (§11) zum Datenlauf, der die 18 überholten Bund-Snapshots + 2
PDF-Embeds auf die geltende Fassung hebt und das parser-blinde Monitoring-Loch
schliesst. Branch `feat/fedlex-p1-ab`. Alle Daten aus der amtlichen Quelle
(Fedlex SPARQL `dateApplicability` als Currency-Arbiter + Filestore-Inhalts-Sonde).

## P1-b — Monitoring dicht (der dauerhafte Hebel)

- **Regex-Fix** `scripts/fedlex-pins.ts`: `([a-z_]+)` → `([a-z0-9_]+)`. Die 11
  Ziffern-Namen-Pins (asylv1/2/3, argv1..5, bvv_2, bvv3, co2_gesetz) waren
  parser-blind — sie sahen überwacht aus, waren es aber nicht. `check:fedlex-versionen`
  sieht jetzt 207→**218** cache.sh-Pins.
- **Parser-Selbsttest** `src/tests/fedlex-pins.test.ts`: geparste Pins == cache.sh-
  Datenzeilen (unabhängige Gegen-Regex), Ziffern-Namen präsent, Namen eindeutig.
- **Coverage-Assertion** (offline, `check:normtext`; reine Logik `drift-logik.ts`
  `pruefeCoverage`/`fedlexEliAusUrl`, Tests in `normtext-drift.test.ts`): jeder
  Register-Eintrag bund/snapshot mit Fedlex-ELI braucht einen cache.sh-Pin; jedes
  pdf-embed einen PDF_EMBED_QUELLEN-Eintrag. Rot bei jedem künftigen ungepinnten
  Volltext. (218 bund-Snapshots ↔ 218 Pins, deckungsgleich.)
- **PDF-Embed-Pins ins Versions-Monitoring** `fedlex-versionen-pruefen.ts`:
  `lesePdfEmbedPins()` (EMRK/NYÜ aus PDF_EMBED_QUELLEN) in dieselbe SPARQL-
  Currency-Prüfung gemergt; `lesePins()`-Signatur unverändert.

## P1-a — Stale-Liste (empirisch am 5.7.2026, via fixem Monitor) und Re-Pins

18 Snapshots (name · alt→neu Konsolidierung · html-N SPARQL-kanonisch via isExemplifiedBy):

| Erlass | SR | alt | neu | html-N | alt→neu Artikel |
|---|---|---|---|---|---|
| kvg | 832.10 | 2026-01-01 | 2026-07-01 | 0 | 149→154 (+5) |
| kvv | 832.102 | 2026-01-01 | 2026-07-01 | 1 | 263→273 (+10) |
| svg | 741.01 | 2025-04-01 | 2026-07-01 | 0 | 160→168 (+9−1) |
| rpg | 700 | 2026-04-01 | 2026-07-01 | 2 | 62→69 (+7) |
| klv | 832.112.31 | 2026-05-11 | 2026-07-01 | 8 | 105→105 |
| vrv | 741.11 | 2026-04-01 | 2026-07-01 | 8 | 118→118 (+1−1) |
| ssv | 741.21 | 2025-07-01 | 2026-07-01 | 14 | 139→148 (+9) |
| rpv | 700.1 | 2026-05-20 | 2026-07-01 | 2 | 75→89 (+15−1) |
| argv2 | 822.112 | 2025-12-01 | 2026-02-01 | 0 | 73→74 (+1) |
| asylv1 | 142.311 | 2026-01-01 | 2026-06-12 | 0 | 97→99 (+2) |
| asylv2 | 142.312 | 2022-01-01 | 2026-06-12 | 0 | 101→101 (+5−5) |
| asylv3 | 142.314 | 2024-06-01 | 2026-06-12 | 0 | 34→51 (+17) |
| vts | 741.41 | 2026-04-30 | 2026-07-01 | 0 | 292→292 |
| mepv | 812.213 | 2023-11-01 | 2026-07-01 | 1 | 122→122 |
| bpv | 172.220.111.3 | 2026-01-01 | 2026-07-01 | 0 | 198→199 (+1) |
| vil | 748.131.1 | 2024-01-01 | 2026-07-01 | 0 | 112→112 (+1−1) |
| fdv | 784.101.1 | 2026-03-01 | 2026-07-01 | 0 | 155→157 (+2) |
| icao | 0.748.0 | 2025-11-27 | 2026-06-12 | 1 | 99→99 |

2 PDF-Embeds (`src/lib/normtext/pdf-embed.ts`):

| Erlass | SR | alt | neu | pdf-a |
|---|---|---|---|---|
| EMRK | 0.101 | 2005-03-23 | 2022-09-16 | Suffix `-2` (kanonisch; suffixlos = älterer Re-Issue, 540 kB/PDF-1.4 vs. 445 kB/PDF-1.7) |
| NYÜ | 0.277.12 | 2020-02-07 | 2026-05-06 | suffixlos (kanonisch) |

### Artikel-Diff — Gesamt +85 Artikel, 9 eId-Renames/Regroups 1:1, 0 echter Verlust

Die 9 „entfernten" Tokens sind belegte eId-Renames/Bereichs-Zusammenfassungen, je
mit erhaltenem (oder amtlich geändertem) Inhalt:

- **SVG** `disp_u2_art_108` → `art_108`: identischer Übergangsbest.-Text (vertrauensärztl.
  Untersuchung nach altem Recht) — Fedlex reorganisierte die Schlussbest.-Struktur.
- **VRV** `annex_I_I` → `annex_II`: Annex-eId-Normalisierung, gleicher Anhang.
- **RPV** `annex_u1` → `annex_3` (Art. 52a Abs. 5, gleicher Text) + zwei NEUE Anhänge
  `annex_1`/`annex_2` (Art. 25b/25e Stabilisierungsziele — die neuen art_25a-g).
- **ASYLV2** Bereichs-Regroups `8→8_9, 13__15_→13_15, 42→42_43, 69→70 (beide „Aufgehoben"),
  79→79_80`: kombinierte „Art. X–Y"-Überschriften, gleiche Rechtstext-Abdeckung.
- **VIL** `27_b_bis` → `27_bbis`: eId-Format-Normalisierung + **reale Amtsänderung**
  (Meldeempfänger kant. Vermessungsaufsicht → swisstopo).

**VRV-Sonderbefund:** die ~99 „geänderten" VRV-Artikel sind überwiegend U+00AD-
Soft-Hyphen-Bereinigung (die geltende N=8-Fassung trägt keine Trenn-Weichzeichen
mehr; alte N=0-Fassung tat es) — kosmetische Quell-Bereinigung, kein Sachinhalt.

**SSV-Bilder:** die neue Konsolidierung nummeriert ihre Signal-Bilder neu — 61 alte
verwaiste Bilder purgiert, 57 neue geladen (`check:bilder` grün).

## Mechanik-Bugs, die der Datenlauf aufdeckte (mit-gefixt)

1. **Golden-`--erlass`-Merge** (`normtext-snapshot.ts`): die alte `erlassFilter ? true`-
   Regel behielt die ALTEN Golden-Keys der regenerierten Erlasse → 9 Phantom-Keys
   (`disp_u2_art_108`, `annex_I_I`, `annex_u1`, `art_27_b_bis`, ASYLV2-Bereiche). Jetzt
   werden nur die regenerierten Erlasse verworfen + frisch ersetzt (purgiert gelöschte
   Artikel korrekt). Golden 55185→55261 (+76 = Netto-Artikel-Zuwachs, konsistent).
2. **check:pdf `--netz`-Currency** (`check-pdf.ts`): notation-Join × `LIMIT 300` =
   Partial-Result-Falle (EMRK geltend fälschlich 20050323, NYÜ 20200207) →
   ELI-ConsolidationAbstract-Query (wie check:fedlex-versionen), kein Join, kein LIMIT.
3. **check-invarianten-Register**: ASYLV2 art_41 Abs. 2 Formel (`PB = …`) in der
   geltenden Fassung als `<dl>`-Spacer serialisiert (marke «[tab]», Formeltext im
   Item-Text erhalten; Alt-Stand hatte marke «p») → als Expected-Fail registriert.

## Tore

`check:fedlex-versionen` Exit 0 (0 stale; 218 cache.sh + 2 pdf-embed) · `check:pdf`
offline+netz grün · `check:normtext` (Coverage: ok) · `check:struktur-konsistenz` ·
`check:vollstaendigkeit` · `check:tabellen` · `check:invarianten` (24/24 bekannte
[tab]) · `check:bilder` (451 Referenzen) · `check:verfall` · `check:paritaet` (2966
byte-gleich, currency.json gedeckt) · engine `golden:vergleich` 201 byte-gleich ·
`tsc` clean · neue vitest grün.

## Gegenprüfung (unabhängiger Adversarial-Zweitpass) — BESTANDEN

Unabhängiger Opus-Agent, frischer Kontext, gegen Live-Fedlex-SPARQL + frisch
re-gefetchtes Filestore-HTML/PDF (Skill `gegenpruefung`). Verdikt-Hash (Risiko-Diff
Branch↔`origin/main`, 64 Risiko-Dateien): `00868867ab0d96b5…`.

- **(a) Currency:** PASS — alle 20 Pins == grösstes `dateApplicability` ≤ heute;
  Zukunfts-Fallen korrekt gemieden (kvv/klv 2026-08-01, kvg 2028-01-01, vrv/vts
  2031-01-01, bpv 2027-01-01 NICHT genommen).
- **(b) html-N:** PASS — `isExemplifiedBy` für 10 Erlasse; klv=8, vrv=8, ssv=14
  bestätigt; alle 18 HTML echt (korrekte `srnummer`, kein Casemates-Shell).
- **(c) Inventar:** PASS — Anker-Set-Diff JSON↔HTML über alle 18 = **2379 Tokens,
  0 fehlend, 0 überzählig**. Alle 9 Renames belegt; die ASYLV2-Bereichs-Anker
  (8_9/13_15/…) stehen **im amtlichen HTML selbst** (echte Quell-Gruppierung, kein
  Verlust); `bis`/`ter`-Unterartikel erhalten.
- **(d) Wortlaut:** PASS — KVG/RPG/ASYLV3-Stichproben byte-genau gegen amtliches
  HTML; kein Footnote-Leak (KVG art_40-Fussnote korrekt NICHT im Body).
- **(e) VRV Soft-Hyphen:** PASS — 636× U+00AD entfernt, 0 hinzugefügt; Rest =
  ~24 echte Quell-Änderungen (art_7 neu gefasst u.a.), verbatim quell-belegt.
- **(f) Tabellen/Fussnoten:** PASS — KLV art_13-Tabelle 14 Zeilen vollständig;
  SSV mehrspaltig 6→12, Bilder 20→116 (Verbesserung, keine Regression).
- **(g) PDF-Embeds:** PASS — EMRK kanonisch `-2` (sha == Index == Datei); suffixlos
  = anderer älterer Re-Issue; NYÜ suffixlos kanonisch; beide echte 12-Seiten-PDF.

**Verdikt: BESTANDEN** (0 Widerlegungen für den geprüften Diff).

### Vorbestehende Extraktor-Grenzen (KEINE Regression — vom Prüfer via `git show
65e47c56^` als identisch im ALT-Stand belegt; separater Härtungs-Backlog):
- **VTS art_123 Abs. 3**: Text nach der Notausstiege-Formel fällt weg (Formel-Adjazenz).
- **SSV art_24**: Signal-Beschreibungen nach Signal-Bildern gedroppt (Bild-Adjazenz).
- **VRV `annex_I`/`annex_II`**: «…»-Platzhalter (VRV-Anhänge nie befüllt, vorbestehend).
Diese sind NICHT durch den Currency-Lauf verursacht; Fix = eigener Extraktor-Batch
(Formel-/Signalbild-/Randtitel-Adjazenz).
