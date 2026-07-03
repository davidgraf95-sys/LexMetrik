# Fedlex-Currency-Lauf 2026-07-03 — Paket 1 (QS-CURRENCY, P0)

**Auftrag:** FAHRPLAN-FEDLEX-PORTFOLIO §Paket 1 (P1-a Datenlauf + P1-b Monitoring-Härtung), freigegeben von David 3.7.2026.
**Methode:** Frischer Ist-Befund via `check:fedlex-versionen` (SPARQL, amtlicher Endpoint) am 3.7.2026 — dem Gap-Report vom 2.7. nicht blind gefolgt; Befund deckungsgleich. Je Erlass: geltende Konsolidierung = grösste `jolux:dateApplicability` ≤ 2026-07-03 **und** kanonische DE-HTML-Manifestation via `jolux:isExemplifiedBy` (html-N nie geraten). Quellen ausschliesslich amtlich (fedlex.data.admin.ch SPARQL + Filestore); Dritt-Repos nicht verwendet.

## 1. P1-b — Monitoring-Härtung (der dauerhafte Hebel)

1. **Pin-Parser-Regex-Fix** `scripts/fedlex-pins.ts`: Namensgruppe `([a-z_]+)` → `([a-z0-9_]+)`. Befund bestätigt: **11 Ziffern-Namen-Pins waren parser-blind** (asylv1/2/3, argv1–5, bvv_2, bvv3, co2_gesetz) — sie *sahen* gepinnt aus, waren aber für `check:fedlex-versionen` unsichtbar. Nach Fix: 207 → **218 überwachte Pins**. Selbsttest `src/tests/fedlex-pins.test.ts` (geparste Pins == Roh-Zeilen der cache.sh + Ziffern-Namen-Regressionsanker + Eindeutigkeit).
2. **Pin-Coverage-Assertion** (neu, offline in `check:normtext`/`scripts/normtext/check-drift.ts` Prüfung 2b): jeder Register-Eintrag `ebene='bund' ∧ status='snapshot'` MUSS einen cache.sh-Pin tragen — sonst rot. **Negativ-Test bestanden** (kvg-Pin temporär entfernt → Tor rot mit Klartext-Meldung).
3. **`check:pdf-netz`-Currency-Query-Fix** (`scripts/normtext/check-pdf.ts`): die alte notation-Join-Query lieferte ein kartesisches Produkt und wurde vom `LIMIT 300` **still abgeschnitten** — die neuesten Konsolidierungs-Daten fehlten, der 21 Jahre alte EMRK-Pin (20050323) bestand **fälschlich grün** (Partial-Result-Falle). Neu: direkt über das ELI-Abstract (`SELECT DISTINCT ?date WHERE { ?c jolux:isMemberOf <eli> ; jolux:dateApplicability ?date }`), wie `fedlex-versionen-pruefen.ts`. Nachweis: mit Fix meldete das Tor sofort `EMRK ÜBERHOLT (geltend 20220916)` + `NYUE ÜBERHOLT (geltend 20260506)`.
4. **Gegenprüfungs-Glob** `scripts/gegenpruefung/kern.ts`: `istRisikoPfad()` um Präfix `scripts/fedlex-` erweitert (cache.sh-/Pin-Parser-Edits triggerten das Tor vorher nicht); Tests in `src/tests/gegenpruefung.test.ts` ergänzt.

## 2. P1-a — Datenlauf: 18 Snapshots + 2 PDF-Embeds nachgezogen

Frischer Stale-Befund 3.7.2026 (nach Regex-Fix, 218 Pins): **18 ÜBERHOLT** — identisch mit Gap-Report-Klassen 2a+2b. Je Erlass alt→neu (Konsolidierung, html-N SPARQL-kanonisch) und Artikel-Delta (Snapshot-`art_*`-Einträge alt→neu; **kein Artikel-Verlust**, alle «entfernt» sind belegte eId-Renames mit 1:1-Ersatz):

| Erlass | SR | Pin alt → neu | html-N | Artikel alt→neu | Delta-Begründung (amtlich) |
|---|---|---|---|---|---|
| KVG | 832.10 | 20260101 → 20260701 | 0 | 149→154 | neu 46a, 54a–c, 56a (Kostenziele-Rev.) |
| KVV | 832.102 | 20260101 → 20260701 | **1** | 263→273 | neu 59c bis/ter/quater, 59d bis, 75a–f |
| KLV | 832.112.31 | 20260511 → 20260701 | **8** | 105→105 | nur Textänderungen |
| SVG | 741.01 | 20250401 → 20260701 | 0 | 160→168 | neu 25a–h; disp_u2/art_108 → art_108 (eId-Move, Text erhalten) |
| VRV | 741.11 | 20260401 → 20260701 | **8** | 118→118 | annex_I_I → annex_II (eId-Rename) |
| SSV | 741.21 | 20250701 → 20260701 | **14** | 139→148 | neu 54b/54c/72b/87a/87b/89a/89b/103a/117e; Bild-Satz erneuert |
| VTS | 741.41 | 20260430 → 20260701 | 0 | 292→292 | nur Textänderungen |
| RPG | 700 | 20260401 → 20260701 | **2** | 62→69 | neu 5a, 8c, 8d, 18bis, 24f, 38b, 38c |
| RPV | 700.1 | 20260520 → 20260701 | **2** | 75→89 | neu 25a–g, 33a, 43b–e; annex_u1 → annex_1/2/3 |
| BPV | 172.220.111.3 | 20260101 → 20260701 | 0 | 198→199 | neu 116n (Übergangsbestimmung) |
| VIL | 748.131.1 | 20240101 → 20260701 | 0 | 112→112 | art_27_b_bis → art_27_bbis (eId-Respelling) |
| FDV | 784.101.1 | 20260301 → 20260701 | 0 | 155→157 | neu 28a, 108e |
| MepV | 812.213 | 20231101 → 20260701 | **1** | 122→122 | nur Textänderungen |
| ArGV 2 | 822.112 | 20251201 → 20260201 | 0 | 73→74 | neu 48b |
| AsylV 1 | 142.311 | 20260101 → 20260612 | 0 | 97→99 | neu 20b bis, 53c |
| AsylV 2 | 142.312 | 20220101 → 20260612 | 0 | 101→101 | eId-Reshuffle: disp_N→disp_uN, Merge-Schreibweisen (art_13__15_→art_13_15 u.a.); Text erhalten |
| AsylV 3 | 142.314 | 20240601 → 20260612 | 0 | 34→51 | neu 1l, 6c/6d, 10a–i, 11d/11e, 14a + annex_1/annex_2 |
| ICAO-Übk. | 0.748.0 | 20251127 → 20260612 | **1** | 99→99 | nur Textänderungen |

**PDF-Embeds** (`src/lib/normtext/pdf-embed.ts`, Refetch via `normtext:pdf`):
- **EMRK** (SR 0.101): 20050323 → **20220916** (Prot. Nr. 15). Kanonische pdf-a-Manifestation trägt Suffix **`-2`** (neues Feld `pdfN`); die suffixlose URL liefert 200 mit einem **älteren Re-Issue** — Falle dokumentiert am Feld.
- **NYÜ** (SR 0.277.12): 20200207 → **20260506** (suffixlos SPARQL-kanonisch).

**html-N-Erkenntnis (load-bearing):** klv=8, vrv=8, **ssv=14** liegen AUSSERHALB des cache.sh-Fallback-Bereichs (-1…-5) — ohne SPARQL-`isExemplifiedBy`-Auflösung wäre der Lauf dort blind gescheitert oder auf einer falschen Variante gelandet.

## 3. Verifikation (korpus-werkstatt-Muster)

- **Artikel-Diff vor Re-Extraktion:** je Erlass altes + neues Quell-HTML geladen, `id="(art|annex|disp|lvl)_*"`-Inventare verglichen (Abschnitt 2). Kein stiller Drop; alle Entfernungen sind eId-Renames mit nachgewiesenem 1:1-Ersatz.
- **Update-Tor «nur Ziel geändert»:** Regeneration `npm run normtext -- --nur=bund --datum=2026-07-03`; von 218 Bund-Dateien trugen **exakt die 18 Ziel-Erlasse** echte Änderungen, 200 reine `erzeugt`/`abgerufen`-Datum-Churn → zurückgesetzt (Commit-Hygiene).
- **Wortlaut-Stichproben:** 54 Artikel (je Erlass 3: Anfang / geänderter Bereich / Ende), Block- und Item-Texte als Containment gegen das kanonische Quell-HTML: **54/54 enthalten**. Einziger Abgleichs-Rest: Quadratmeter-Exponent wird korpusweit als «m 2» transportiert (bestehendes Extraktor-Verhalten, ~20 committete Altstellen, keine Regression dieses Laufs).
- **Engine-verdrahtete Artikel** (Quellen-Register): KVG art_7/62/64a und KVV art_94/99/100 absatzweise diff-verifiziert — materiell **identisch**; einzig redaktionell «des Gesetzes»→«KVG» (KVV 94 III, 100 III–IV; Verweisziel Art. 7 KVG unverändert) + Fussnoten-Neunummerierung. Keine Engine-Wirkung.
- **Neuer bekannter Quell-Artefakt:** AsylV 2 art_41 trägt in der Fedlex-Quelle selbst `<span data-message="E40S10-TAB">[tab]</span>` vor der Pauschalbeitrags-Formel → als Expected-Fail registriert (`ARTEFAKT_ERWARTET`, jetzt 24 Stellen/14 Artikel); Formel + Legende vollständig extrahiert.
- **Bilder:** SSV-Bildsatz erneuert (verwaiste Alt-Bilder entfernt, neue committet); `check:bilder` grün (451 Referenzen, 441 Dateien, sha-geprüft).
- **Tore:** `check:fedlex-versionen` **GRÜN (218 Pins, 0 stale, 56 künftige als HINWEIS)** · `check:pdf`/`check:pdf-netz` grün · `check:normtext` (inkl. neuer Coverage-Assertion) · `check:tabellen` · `check:invarianten` · `check:struktur-konsistenz` · `check:vollstaendigkeit` · `check:bilder` · `check:suchindex` · `check:paritaet` + `check:datenhaltung` (Manifest regeneriert) · `golden:vergleich` **byte-gleich (201 Fälle)** · tsc/vitest (3075 passed)/lint/build grün.
- **Adversariale Gegenprüfung (QS-GP):** 3 + 1 unabhängige Opus-Agents (frischer Kontext) gegen die amtliche Quelle — Verdikt siehe `bibliothek/register/gegenpruefung-register.md` (Eintrag 3.7.2026).

## 3b. F2-Folgefix aus der Gegenprüfung — Ordinal-Vokabular bis «decies»

Die Gegenprüfung (Batch B) fand als strukturellen Befund F2: der Extraktor kannte lateinische Absatz-/Marker-Ordinalia nur bis «quinquies» — Absätze wie BPV art_116_m 3sexies/3septies erhielten `absatz:null` (Nummer leakte in den Text; gleiche Klasse wie der historische bis/ter-Verlust). **Fix im selben Batch:** alle 13 Alternationen in `scripts/normtext/extrahiere-fedlex.ts` + `SUFFIX_LEAK_RE` auf `…|sexies|septies|octies|novies|decies` erweitert. Wirkung (Regeneration, jede Stelle am amtlichen Quell-HTML verifiziert):

- **BPV art_116_m:** Absatzfolge 1…3sexies/3septies/4 vollständig gelabelt.
- **ELG art_10** (1sexies/1septies) + **VZAE art_87** (1sexies): Label statt Text-Leak.
- **FINMA_GEBV art_3** («asexies») + **HMG art_4** (asexies/asepties/aocties/anovies/adecies): Listen-Marker korrekt statt 5× «a».
- **VSTG art_5: zwei vorher KOMPLETT GEDROPPTE Absätze wiederhergestellt** — 1sexies (Reserven aus Kapitaleinlagen/Gratisaktien) + 1septies (Kapitalband Art. 653s ff. OR); Blockzahl 6→8. Echter Inhaltsverlust im Altbestand, durch den Fix geheilt (Quelle: cc/1966/371_385_384/20250101, `<sup>1sexies</sup>`/`<sup>1septies</sup>` im Filestore-HTML belegt).

Kollateral: genau 5 Erlasse ausserhalb des Currency-Batches geändert (ELG/FINMA_GEBV/HMG/VSTG/VZAE), alle Feld-für-Feld diff-geprüft (nur die Ordinal-Stellen + Datum). Eigener adversarialer Zweitpass auf dieses Delta (4. Opus-Agent).

## 4. Pflegebedarf / Grenzen (S5/S6, ehrlich)

- **56 künftige Fassungen** (Fedlex-Triplestore, > 2026-07-03) sind der Re-Extraktions-Horizont → **P1-c offen** (datierte Wiedervorlage im Verfallsregister, `FAHRPLAN-FEDLEX-PORTFOLIO.md` §Paket 1); bis dahin meldet `check:fedlex-versionen` sie als HINWEIS je Lauf.
- **P1-d offen** (Currency-Chips im Reader + `currency.json`).
- **Konsolidierung trailt die AS:** ein per heute in Kraft getretenes AS-Amendment kann noch unkonsolidiert sein (STALE-PENDING via RSS-OC nicht geprüft — bekannte Grenze, Backlog).
- **Nebenbefund Gegenprüfung (pre-existing, nicht dieser Lauf):** ASYLV2 art_41 Legenden-Marken speichern `p/d/f/j` statt `PB/PE/DE/DB/FE/FB/JA/JT` (Zweibuchstaben-Variablen mit Subskript kollabieren) — Bestand schon in HEAD; Folge-Fix-Kandidat Extraktor. Positiv: dieser Lauf hat die Pauschalbeitrags-Formel selbst REPARIERT (HEAD hatte das führende «P» als Listenmarke verschluckt).
- **Vorbestehende Extraktor-Quirks (Gegenprüfung Batch A; old==new byte-identisch, KEINE Regression dieses Laufs; Backlog):** KVG art_18 Absatz-Labels «2sexies/2septies» in den Textkörper gemergt (Label-Erkennung endet bei quinquies) · VRV art_18/19 Quell-Fussnotenzeichen `*`/`*)` inline · Exponenten «cm³» als «cm 3» (korpusweit, vgl. m²-Befund) · KLV art_5 Quell-`[tab]` als Ziffer-10-Marke (Rechtstext vollständig).
- Abnahme-Status: **zweifach geprüft** (maschinell + adversariale Gegenprüfung); fachliche Abnahme durch David steht aus (Zeitsperre, §8 — kein `verified`).
