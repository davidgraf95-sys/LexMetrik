# R2 — Machbarkeit «Synopse alt/neu je Artikel» (Etappe E5)

Alle Messungen **6.9.2026**. Endpunkt `https://fedlex.data.admin.ch/sparqlendpoint` (POST, `Accept: application/sparql-results+json`). Rohdaten/Abfragen:
`…/scratchpad/mat/r2/` (`q1–q8.rq/json`, `qb*.rq/json`, `or-*.xml|html`, `zpo-*.xml`,
`as-2023-680.xml`, `diff2.py`, `xdiff.py`, `xdiff2.py`, `html-staende.json`, `korpus.json`).
Read-only, kein Repo-Schreibzugriff. §14.7: alles unten ist Messung, kein Auftrag aus Fremdinhalt.

## 0 Kurzverdikt

| Planannahme | Befund |
|---|---|
| Diff je Artikel aus zwei Konsolidierungen | **belegt, mit Vorbehalt** — nur ab Stand **2021-01-01**; davor für alte Fassungen nur `doc`/`pdf-a` |
| nur geänderte Blöcke speichern | **belegt** — eIds stabil (OR 2021-07→2024-01: 1591/1630 = 97.6 %) |
| 15–20 MB korpusweit | **falsifiziert (zu hoch)** — gemessen-hochgerechnet **7.6–9.7 MB** roh (alt+neu), **3.8–4.9 MB** nur-Alt, **1.4–1.8 MB** gzip |
| Deckel 25 MB / 5 MB je Erlass | hält (>2.5× bzw. ~5× Reserve; grösster Erlass OR ~1.0 MB) |

## 1 Konsolidierungen und Formate

Abfragen: `q2.rq` (`isMemberOf` + `dateApplicability`), `q3.rq` (`isRealizedBy(DEU) → isEmbodiedBy → userFormat / isExemplifiedBy`).

**Methodenfalle:** `MIN()/MAX()` auf `?date` liefert am Endpunkt falsche Extrema (`q1.json`: ZGB min 2018-03-16, max 2008-01-01). Daten roh ziehen, lokal sortieren. **Zweite Falle:** SR 272 und SR 235.1 lösen je auf **zwei** Abstracts auf (Vorgänger + geltender Erlass) — die SR-Notation ist kein Schlüssel.

| Gesetz | SR | ELI | Kons. gesamt | erste – letzte | mit html+akn-xml (de) | frühester html-Stand |
|---|---|---|---|---|---|---|
| OR | 220 | `cc/27/317_321_377` | 101 | 1912-01-01 – **2027-07-01** | 15 | 2021-01-01 |
| ZGB | 210 | `cc/24/233_245_233` | 70 | 1911-04-19 – 2026-07-01 | 11 | **2011-01-01**, dann Lücke bis 2021-01-01 |
| DSG (n) | 235.1 | `cc/2022/491` | 3 | 2023-09-01 – 2025-07-07 | 3 | 2023-09-01 |
| aDSG | 235.1 | `cc/1993/1945_1945_1945` | 14 | 1993-07-01 – 2019-03-01 | nicht im Korpus | — |
| ZPO | 272 | `cc/2010/262` | 17 | 2011-01-01 – 2026-07-01 | 7 | 2021-01-01 |
| SchKG | 281.1 | `cc/11/529_488_529` | 75 | 1876-01-01 – 2026-01-01 | 7 | 2019-01-01 |

**Formate je Konsolidierung (OR, vollständig, `q3.json`):** 1912–1999 **gar keine** Manifestation in de (46 der 101 Stände) · 2000-05-01 bis 2020-04-01 nur `doc`+`pdf-a` (2012-01-01 nur `pdf-a`) · **ab 2021-01-01** `docx`+`html`+`xml`(AKN)+`pdf-a`, `doc` läuft 2023 aus. Einzelne Manifestationen **ohne** `isExemplifiedBy` (OR 2013-05-28 `doc`/`pdf-a`, mehrere `pdf-x`) ⇒ OPTIONAL-Zweig ist Pflicht, sonst verschwinden Stände still.

**Ab wann html/xml für ALTE Konsolidierungen?** Korpusweit (227 Erlasse, `qb*.json`): **1369 (Erlass, Stand)-Paare mit html, davon nur 156 vor 2021-01-01** (1994:1 · 1997:1 · 2008:2 · 2009:2 · 2010:1 · 2011:4 · 2012:3 · 2013:4 · 2014:4 · 2015:5 · 2016:10 · 2017:11 · 2018:6 · 2019:30 · 2020:72). Der Grossteil davon sind **geltende** Fassungen unveränderter Erlasse; echte historische Alternativfassungen vor 2021 sind Ausnahmen (ZGB 2011-01-01, SchKG 2019-01-01/2020-10-20). html/xml je Erlass: Summe 1369, Median 5, Mittel 6.0, Max 30, **kein Erlass ohne html/xml**. ⇒ **Die Synopse deckt faktisch nur das Fenster ab 2021.**

## 2 Diff-Test OR 1.7.2021 vs. 1.1.2024

Beide Dateien kanonisch über `isExemplifiedBy` aufgelöst.

| Stand | html-N | html Bytes | sha256 (html) | xml Bytes |
|---|---|---|---|---|
| 2021-07-01 | html-15 | 2'315'767 | `ce9a73c437fa986ca3dac6f93d6b92d495b013936cf9a5c2c0b753663a6ac42e` | 1'903'780 |
| 2024-01-01 | html-23 | 2'505'355 | `f647a97b3b2ec3817a7d96bf4d41160126834fb3b6398503076e961cf63258aa` | 2'126'682 |

URLs: `…/eli/cc/27/317_321_377/20210701/de/html/fedlex-data-admin-ch-eli-cc-27-317_321_377-20210701-de-html-15.html` und `…/20240101/de/html/…-20240101-de-html-23.html` (je HTTP 200, `text/html`).

**eIds stabil?** Ja, und identisch in html (`<article id="art_336_c">`) wie akn-xml (`<article eId="art_336_c">`). 1630 → 1683 Artikel, **1591 stabil**, 39 nur alt, 92 nur neu. Die 39 sind fast durchwegs **Zusammenlegungen/Umnummerierungen**, keine Löschungen:
`art_627`+`art_628` → `art_627_628`; `art_671_a`+`art_671_b` → `art_671_a_671_b`;
`art_226_f` → `art_226_f_226_k`; dazu Übergangsbestimmungen (`disp_u10/…`, `disp_u15/…`).

**Art. 336c gegen die Fussnoten geprüft — stimmt.** alt: `a, b, c, c^bis, c^ter, d` · neu: `a, b, c, c^bis, c^ter, c^quater, c^quinquies, d`. Neu sind **c^ter** («zwischen dem Beginn des Urlaubs nach Artikel 329f Absatz 3 … längstens aber während drei Monaten ab dem Ende der Sperrfrist nach Buchstabe c») und **c^quinquies** («während des Urlaubs nach Artikel 329g»), beide mit Fussnote «Eingefügt durch Anhang Ziff. 1 des BG vom 17. März 2023 (Taggelder für den hinterlassenen Elternteil), in Kraft seit 1. Jan. 2024 (**AS 2023 680**; BBl 2022 2515, 2742)». Das alte `c^ter` (Betreuungsurlaub Art. 329i) heisst neu `c^quater`; die Fussnote sagt es: alt «Ursprünglich: Bst. c^bis» → neu «Ursprünglich: Bst. c^bis, dann c^ter».

**Falle A:** die Suffixe stehen in `<sup>` (`c<sup>ter</sup>`). Wer `<sup>` mit den Fussnoten-Verweisen wegwirft, macht aus fünf Litterae fünfmal «c». **Falle B:** Litterae verschieben sich. Ein buchstabenbasierter Diff meldet «c^ter geändert», obwohl der Text nur nach c^quater gewandert ist — Zuordnung über Wortlaut/Fussnote, nie über den Buchstaben.

## 3 Rauschen: der naive Diff ist unbrauchbar (gemessen)

Roher HTML-Blockvergleich OR 2021-07-01 → 2024-01-01: **575 von 1591 stabilen eIds «geändert» (36 %)** — falsch. Ursachen, je belegt:
1. **Fussnoten-Anker sind Dokument-Offsets.** `art_101`: `fn-d7e2528`→`fn-d7e2546`,
Anzeigenummer 44→46. Eine eingefügte Fussnote ändert **jeden** nachfolgenden Artikel.
2. **Generator-Typographie.** `art_13`: `<i>...</i>`→`…`; `art_240`: leeres `<sup>`.
3. **Weiche Trennstellen.** `art_963` «ü bertragen», `art_600` «Rich tigkeit», `art_53` «A rt. 53».

Nach Normalisierung (Fussnoten-Apparat + `fn-`-Verweise raus, `<sup>`-Inhalt **behalten**, U+00AD/U+200B/U+00A0/U+2011 auflösen, Leerzeichen kollabieren) bleibt das Signal:

| Schritt (akn-xml) | stabil | nur alt | nur neu | geändert | Payload alt+neu |
|---|---|---|---|---|---|
| OR 2021-01-01 → 2021-07-01 | 1622 | 0 | 8 | 10 | 30.2 kB |
| OR 2021-07-01 → 2022-01-01 | 1602 | 28 | 34 | 23 | 41.3 kB |
| OR 2022-01-01 → 2023-01-01 (Aktienrecht) | 1626 | 10 | 56 | **178** | **262.9 kB** |
| OR 2023-01-01 → 2024-01-01 | 1681 | 1 | 2 | 16 | 31.8 kB |
| OR 2024-01-01 → 2025-01-01 | 1683 | 0 | 2 | 6 | 11.9 kB |
| OR 2025-01-01 → 2026-01-01 | 1685 | 0 | 1 | 9 | 13.2 kB |
| **OR Summe 6 Schritte** | | | | | **391.3 kB** |
| ZPO 2021-01-01 → 2022-01-01 | 416 | 0 | 1 | 2 | 4.9 kB |
| ZPO 2022-01-01 → 2022-07-01 | 417 | 0 | 0 | 2 | 5.5 kB |
| ZPO 2022-07-01 → 2023-01-01 | 417 | 0 | 0 | 3 | 14.3 kB |
| ZPO 2023-01-01 → 2023-09-01 | 417 | 0 | 1 | 5 | 7.9 kB |
| ZPO 2023-09-01 → 2025-01-01 (ZPO-Revision) | 418 | 0 | 8 | **75** | **104.6 kB** |
| ZPO 2025-01-01 → 2026-07-01 | 426 | 0 | 2 | 1 | 1.8 kB |
| **ZPO Summe 6 Schritte** | | | | | **139.0 kB** |

html und akn-xml liefern **dieselben** eId-Zahlen (1591/39/92). xml ist ~15 % kleiner und hat mit `<authorialNote>` eine saubere Fussnotengrenze ⇒ **xml als Diff-Input, html als Anzeige-Input**.

## 4 Volumen korpusweit (Herleitung)

Basis: 227 Snapshots `public/normtext/bund/` (36.9 MB JSON, davon **11.62 MB reiner Normtext** = Σ `bloecke[].text` + `artikelLabel`), dazu je ELI die html-Stände aus SPARQL. **Diff-Schritte korpusweit = Σ (html-Stände − 1) = 1142** (1369 Stände / 227 Erlasse). Gemessener Payload-Anteil je Schritt: OR 391.3/(6×691) = **9.4 %**, ZPO 139.0/(6×122) = **19.0 %**, textgewichtet **q = 10.9 %**.

| Modell | Rechnung | alt+neu roh | nur Alt | gzip (Faktor 5.43, an `OR.json` gemessen: 1'902'794 → 350'294 B) |
|---|---|---|---|---|
| GROB (Fenster 2021–2027 in ~6 Sprüngen je Erlass, wie gemessen) | 0.652 × 11.62 MB | **7.58 MB** | 3.79 MB | 1.40 MB |
| FEIN (alle 1142 Einzelschritte) | Σ Schritte_e × 0.109 × Text_e | **9.71 MB** | 4.85 MB | 1.79 MB |

Grösste Erlasse (FEIN): OR 1.03 · CHEMRRV 0.56 · ZGB 0.48 · StGB 0.43 · VTS 0.36 MB. Vertrauensband q = 9…19 % ⇒ **8.0–17.0 MB**; auch der pessimistische Rand bleibt unter 25 MB. Wird nur die **Alt**-Fassung gespeichert (die Neu-Fassung ist die Alt-Fassung des Folgeschritts bzw. der geltende Snapshot), halbiert sich alles.

## 5 Alternative: Synopse aus dem AS-Änderungserlass (buzer-Ansatz)

Geprüft an **`eli/oc/2023/680`** (BG 17.3.2023, Taggelder hinterlassener Elternteil, iK 1.1.2024 — Quelle der Art.-336c-Änderung). Manifestationen (`q6.rq`): `docx`, `xml`, `html`, `pdf-a`, kein `-N`. XML geladen: **23'208 Bytes**,
`…/eli/oc/2023/680/de/xml/fedlex-data-admin-ch-eli-oc-2023-680-de-xml.xml`.

**Pro:** Ziel-Erlass maschinenlesbar —
`<num>1. Obligationenrecht<inline …><authorialNote><p><ref href="https://fedlex.data.admin.ch/eli/cc/27/317_321_377">SR <b>220</b></ref></p></authorialNote></inline></num>`;
neuer Wortlaut als sauberes AKN (`blockList/listIntroduction/item/num/p`) inkl. `c<sup>ter</sup>`.

**Contra (entscheidend):**
1. **Kein AKN-Änderungsvokabular.** Kein `<mod>`, keine `<quotedStructure>`, keine
`activeModifications`/`passiveModifications`. Elementinventar: `act, preface, preamble, mainBody, level, num, intro, content, table, tr, td, p, blockList, listIntroduction, item, authorialNote, ref, sup, i, b, s, br`.
2. **Der Änderungsbefehl ist Layout, nicht Semantik.** Zuordnung als Fliesstext in einer
Tabellenzelle: `<td><p>Art. 336c Abs.&nbsp;1 Bst. c<sup>ter</sup>–c<sup>quinquies</sup></p></td>`, neuer Text in der Folgezeile; **kein eId auf `art_336_c`**. Parsen dieser Überschriften ist Heuristik über eine offene Grammatik («–», «Abs.», «Bst.», «Ziff.», «Anhang», «Aufgehoben», «Gliederungstitel vor Art. …») ⇒ kollidiert mit **§2**, solange die Grammatik nicht als geschlossen bewiesen ist.
3. **Nur die NEUE Fassung, nie die alte.** Für die Alt-Spalte braucht man ohnehin die
Vor-Konsolidierung — der Ansatz **ersetzt** den Konsolidierungs-Diff nicht.

⇒ Nicht als Primärquelle. Wert als **Gegenprobe**: die AS-Fundstelle steht bereits im Fussnoten-Index des Repos (`public/normtext/historie/*.json`, 209 Erlasse, **26'686** datierte Ereignisse; `fassung` 14'354 · `eingefuegt` 8'605 · `aufgehoben` 2'637 · `berichtigt` 167 · u. a.).

## 6 §7-Merkmale für historische Konsolidierungen

**(a) Stand:** `jolux:dateApplicability`, amtlich und exakt. **(b) Quelle-URL:** Filestore über
`isExemplifiedBy` — **nie konstruieren**.

**(c) Live-Link je alter Fassung — existiert.** `https://www.fedlex.admin.ch/eli/cc/27/317_321_377/20210701/de` → HTTP 200, 77'151 B (Angular-Shell; für Menschen korrekt, maschinell nicht auslesbar).
`https://fedlex.data.admin.ch/eli/cc/27/317_321_377/20210701/de/html` → HTTP 200, aber Redirect
auf `/metadata?value=…`, **9'148 B Soft-404-Shell**. Fürs UI der `www.fedlex.admin.ch/eli/<ELI>/<YYYYMMDD>/de`-Link, für die Extraktion ausschliesslich der Filestore.

**(d) Drift — schwerste Falle.** Die Alias-URL **ohne** `-N` liefert für einen alten Stand **anderen Inhalt** als die kanonische Manifestation. OR **Stand 1.7.2021**:

| Variante | Bytes | Artikel | Befund |
|---|---|---|---|
| `…-20210701-de-html-15.html` (kanonisch) | 2'315'767 | 1630 | Referenz |
| `…-20210701-de-html.html` (Alias) | 2'171'598 | 1619 | Alt-Generation |
| `…-20210701-de-html-1.html` | 2'171'600 | 1619 | Alt-Generation |

Alias/`-1` ist eine DOCX-Erstkonversion (`<title>fedlex-…-20210701-de-docx-1</title>`, Kopf «Stand am 1. Juli 2021»), voller Soft-Hyphen («Arbeitsverhält­nis»). Gegen die kanonische Fassung: 1528 gemeinsame eIds, davon **1187 inhaltlich verschieden** — auch `art_336_c`. Wer den Alias nimmt, baut die Synopse gegen ein Phantom.

**Ändern sich alte Konsolidierungen nachträglich? Das Artefakt ja.** Die html-Generation je OR-Stand ist **nicht monoton**: 2021-01-01→html-5 · 2021-02-01→html-13 · 2021-05-01→html-19 · **2021-07-01→html-15** · 2022-01-01→html-26 · 2023-09-01→html-39 · **2024-01-01→html-23** · 2025-07-08→html-4 · 2026-10-01→html-2. Ein alter Stand kann also später neu erzeugt werden als ein jüngerer. `jolux:created`/`modified` sind auf der Manifestation **nicht gesetzt** (`q7.json`: alle leer) — kein amtliches Änderungsdatum. Ob dabei auch der *normalisierte Wortlaut* alter Stände korrigiert wird, ist mit einem Stichtag **nicht entscheidbar → offen**; Indiz: zwischen 2021 und 2024 wurde OR `art_64` «hiebei»→«hierbei» und `art_1004` «…kann der Inhaber»→«…kann der Inhaber:» geändert, ohne Fussnote — stille Redaktionskorrekturen.

**Drift-Prüfung:** (1) `isExemplifiedBy` je (ELI, Stand) neu auflösen — geändertes `-N` = Artefakt neu erzeugt; (2) `sha256` der Datei **und** je normalisiertem Artikel-Block halten (das Repo führt
`sha` je Artikel bereits im Snapshot, Feld `sha` in `public/normtext/bund/OR.json`); (3) **rot nur
bei abweichendem normalisiertem Text** — blosser `-N`-Wechsel bei gleichem Normtext ist Hinweis, sonst erzeugt die Generator-Typographie Dauerfehlalarm (§3).

## 7 Point-in-time: angekündigte künftige Konsolidierungen

**Ja, mit vollem Inhalt.** Korpusweit **57 html-Stände mit `dateApplicability` > 6.9.2026**; Jahresverteilung aller html-Stände: 2026:134 · 2027:35 · 2028:2 · 2029:4 · **2032:1**. Belege (6.9.2026 geladen, HTTP 200, echter Inhalt, keine Shell): **OR 2026-10-01**
`…-20261001-de-html-2.html` **2'679'264 B** · **OR 2027-07-01** `…-20270701-de-html-3.html`
**2'687'182 B** · **VwVG 2027-01-01** `…-cc-1969-737_757_755-20270101-de-html.html` **207'225 B**. Weitere per 2026-10-01: BankG, BBG, BBV, BEG, FIDLEG, FINIG, GwG, HRegV, KAG, RVOV, SSV, StGB, ZEMIS-V.

**§2b-Ergänzung, kein Nachführen:** Das Quellen-Register hält fest (Stand 7.6.2026, VwVG-Zeile) «20270101 existiert, HTML noch leer». Der Beleg bleibt zu seinem Datum stehen; **ergänzend** gemessen 6.9.2026: dieselbe Konsolidierung liefert 207'225 B Inhalt — Bestätigung der Regel «künftige Konsolidierungen füllen sich nach», kein Widerspruch.

Folge: Die Synopse funktioniert **vorwärts** («was ändert sich am 1.1.2027?») mit demselben Algorithmus — geltend ↔ angekündigt.

## 8 Empfohlener Bauweg

1. **Quelle** akn-xml über `isExemplifiedBy` je (ELI, Stand). Nie Alias, nie `-N` raten.
2. **Fenster** ab Stand 2021-01-01; im UI ehrlich ausweisen (§8), für ältere Fassungen nur der amtliche pdf-a-Link.
3. **Normalisierung vor dem Diff** (sonst 36 % Falschmeldungen), Rezept siehe §3.
4. **Diff-Einheit** `eId` des Artikels, darunter die bestehenden `bloecke` (Absatz/Item) des
Snapshot-Modells; Litterae-Verschiebung über den Wortlaut auflösen.
5. **Speichern** je Schritt nur die **Alt**-Fassung geänderter/entfallener Artikel ⇒ ~4–5 MB statt 8–10 MB.
6. **Tor/Gegenprobe** jeder Diff-Block muss auf ein Ereignis in `public/normtext/historie/<ERLASS>.json`
mit passendem Datum treffen; Blöcke ohne Ereignis werden gelistet, nicht verschwiegen (zugleich §6.7-Rot-Beweis: ein absichtlich falsch normalisierter Lauf muss die Fussnoten-Rauschartikel melden).
7. **Drift** `-N` + sha je Stand pinnen, Prüfung wie §6.

## 9 Offen / nicht belegt

- Retroaktive Korrektur des **Wortlauts** alter Konsolidierungen: mit einem Stichtag nicht messbar;
Klärung nur durch zweiten Abruf derselben (ELI, Stand, `-N`) nach Wochen + sha-Vergleich.
- q = 10.9 % ruht auf 12 Schritten in 2 Erlassen (OR, ZPO); für eine belastbare Deckel-Festlegung
5–8 weitere Erlasse verschiedener Grösse messen.
- Ob `pdf-a` der Vor-2021-Stände blockweise deterministisch extrahierbar ist (Voraussetzung für
eine Synopse vor 2021), wurde **nicht** geprüft.
- Der in `scripts/fedlex-sparql.ts` Z. 31 zitierte Skill `scraping-swiss-official-sources`
**existiert im Repo nicht** (`.claude/skills/` enthält 9 Skills, keinen davon). Toter Code-Kommentar-Verweis — Meldung, keine Änderung (read-only).
