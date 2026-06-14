# Recherche-Dossier — Prozesskosten (Art. 95/96 ZPO) + kantonale Tarife

**Erstellt:** 14.6.2026 · **Anlass:** Direktive David — Hauptmoat
Prozesskostenrechner (FAHRPLAN-PRODUKTAUSBAU-BURGGRABEN P1). Ausdrückliche
Auflagen David: (1) Engine nach **Art. 95 ZPO** gliedern (Gerichtskosten ↔
Parteientschädigung) und **Art. 96 ZPO** (kantonale Tarifkompetenz); (2) jeder
Tarif **mit amtlichem Link** zur Kostenverordnung/zum Gesetz; (3) zusätzlich das
**Anwaltshonorar-/Parteientschädigungs-Reglement** je Kanton; (4) **kostenlose
Verfahren** immer berücksichtigen; (5) bestehende Aggregationen zur
Gegenprüfung; (6) „von Anfang an richtig, doppelt prüfen".
**Status:** Erstrecherche, bundesrechtliche Grundlage amtlich verifiziert
(Fedlex-Filestore); kantonale Gerichtskosten Tranche 1 amtlich doppelt
verifiziert (Recherche + unabhängiger Re-Abruf je Kanton). **Fachliche Abnahme
durch David ausstehend (§7).**

---

## A. Bundesrechtliche Grundlage (§11 Ziff. 1) — Art. 95/96/98/113–116 ZPO

- **Erlass:** Schweizerische Zivilprozessordnung (ZPO), **SR 272**, ELI
  `eli/cc/2010/262`. **Konsolidierung 1.1.2025** (im Repo gepinnt:
  `scripts/fedlex-cache.sh`, `zpo`, html-1; 508 kB, Anker `art_95`/`art_96`/
  `art_98`/`art_113`–`art_116` empirisch vorhanden, abgerufen 14.6.2026).
- **Art. 96 i.d.F. der Revision «Verbesserung der Praxistauglichkeit und der
  Rechtsdurchsetzung»** vom 17.3.2023, **in Kraft seit 1.1.2025** (AS 2023 491);
  ebenso Art. 98 (Kostenvorschuss neu «höchstens die Hälfte» als Regel).

### Art. 95 — Begriffe (Wortlaut)
> ¹ Prozesskosten sind: a. die Gerichtskosten; b. die Parteientschädigung.
> ² Gerichtskosten sind: a. die Pauschalen für das Schlichtungsverfahren;
> b. die Pauschalen für den Entscheid (Entscheidgebühr); c. die Kosten der
> Beweisführung; d. die Kosten für die Übersetzung; e. die Kosten für die
> Vertretung des Kindes (Art. 299 und 300).
> ³ Als Parteientschädigung gilt: a. der Ersatz notwendiger Auslagen; b. die
> Kosten einer berufsmässigen Vertretung; c. in begründeten Fällen: eine
> angemessene Umtriebsentschädigung, wenn eine Partei nicht berufsmässig
> vertreten ist.

### Art. 96 — Tarife (Wortlaut)
> ¹ Die Kantone setzen die Tarife für die Prozesskosten fest. Vorbehalten
> bleibt die Gebührenregelung nach Artikel 16 Absatz 1 SchKG.
> ² Die Kantone können vorsehen, dass die Anwältin oder der Anwalt einen
> ausschliesslichen Anspruch auf die Honorare und Auslagen hat, die als
> Parteientschädigung gewährt werden.

### Art. 98 — Kostenvorschuss (für die Praxis relevant)
> ¹ Das Gericht und die Schlichtungsbehörde können von der klagenden Partei
> einen Vorschuss von **höchstens der Hälfte** der mutmasslichen Gerichtskosten
> verlangen. ² Vollen Vorschuss in: Art. 6 IV lit. c / Art. 8; Schlichtung;
> summarische Verfahren (Ausnahmen 248 lit. d, FamR 271/276/302/305);
> Rechtsmittel.

---

## B. Engine-Taxonomie (§11 Ziff. 2 — deterministisch)

Die Engine bildet Art. 95 ab — **Prozesskosten = Gerichtskosten +
Parteientschädigung**, je getrennt berechnet (regime-treu, §4):

1. **Gerichtskosten → Entscheidgebühr** (Art. 95 II lit. b): der kantonale
   Tarif nach Streitwert (Art. 96 I). Quelle + Regel je Kanton siehe §D.
   Andere Gerichtskosten-Posten (Beweis/Übersetzung/Kindesvertretung, lit. c–e)
   sind aufwandabhängig → **nicht deterministisch**, nur Hinweis.
2. **Parteientschädigung** (Art. 95 III): das kantonale Anwaltshonorar-/
   Tarif-Reglement (Art. 96 I). Eigene Datenschicht (Recherche separat, in
   Arbeit) — BS-Muster: Honorarordnung HO **SG 291.400**.
3. **Kostenvorschuss** (Art. 98): in der Regel ≤ ½ der mutmasslichen
   Gerichtskosten; voll in den dort genannten Verfahren → ableitbarer Hinweis.

**Determinismus-Ehrlichkeit (§2/§8):** Die meisten kantonalen Tarife sind
**Ermessensrahmen je Streitwert-Band** (Festsetzung nach Aufwand/Bedeutung/
Komplexität) — kein Punktwert. Nur ZH (§ 4 GebV OG: Sockel + % über Schwelle)
und AG (§ 7 GebührD: Fix + % vom Gesamtwert) sind als **Grundgebühr**
deterministisch berechenbar, und auch dort moduliert das Gericht innerhalb
gesetzlicher Grenzen. Die Engine gibt darum bei Rahmen-Tarifen die Spanne,
nie eine erfundene Zahl (Primitiv `src/lib/tarif/staffel.ts`: `staffel_rahmen`
vs. `staffel_sockel_prozent`/`staffel_voll_prozent`).

---

## C. Kostenlose / entschädigungsfreie Verfahren (§11 Ziff. 3) — Art. 113–116 ZPO

**Zentrale Unterscheidung Schlichtung ↔ Entscheidverfahren** (verbatim 1.1.2025):

| Materie | Schlichtung kostenlos (Art. 113 II) | Entscheid kostenlos (Art. 114) |
|---|---|---|
| Gleichstellungsgesetz (GlG) | ja (lit. a) | ja (lit. a) |
| Behindertengleichstellung (BehiG) | ja (lit. b) | ja (lit. b) |
| **Miete/Pacht Wohn-/Geschäftsräume + landw. Pacht** | **ja (lit. c)** | **NEIN** |
| Arbeit + AVG bis Streitwert **30 000** | ja (lit. d) | ja (lit. c) |
| Mitwirkungsgesetz | ja (lit. e) | ja (lit. d) |
| Zusatzversicherung zur sozialen KV | ja (lit. f) | ja (lit. e) |
| Gewaltschutz Art. 28b/28c ZGB | — | ja (lit. f) |
| Datenschutz (DSG) | ja (lit. g) | ja (lit. g) |

- **Art. 113 I:** Im Schlichtungsverfahren werden **keine Parteientschädigungen**
  gesprochen (Vorbehalt unentgeltliche Rechtsbeiständin/Rechtsbeistand).
- **Art. 115:** bös-/mutwillige Prozessführung → Gerichtskosten trotzdem;
  Gewaltschutz (114 lit. f) → der unterliegenden Partei auferlegbar, wenn ein
  Verbot/eine Überwachung nach Art. 28b/28c ZGB angeordnet wird.
- **Art. 116:** Kantone können **weitere** Kostenbefreiungen gewähren (→ je
  Kanton zu prüfen, Verfallskandidat).

**Engine-Folge:** Vorschalter VOR der Tarifberechnung. Eingaben `verfahrensphase`
(schlichtung/entscheid), `materie` und `streitwertCHF` (für die 30 000-Schwelle
bei Arbeit) bestimmen, ob überhaupt Gerichtskosten/Parteientschädigung anfallen.

---

## D. Kantonale Gerichtskosten-Tarife (Art. 96) — Tranche 1, amtlich verifiziert

Geltungsbereich je Eintrag: **Entscheidgebühr/Grundgebühr im erstinstanzlichen
ordentlichen vermögensrechtlichen Zivilverfahren, nach Streitwert.** Jeder
Eintrag doppelt verifiziert (Recherche + unabhängiger Re-Abruf der amtlichen
Quelle). Regeltyp = Kodierung im Primitiv.

| KT | Erlass (Nr.) | Art. | Stand | Typ | Amtliche Quelle |
|----|--------------|------|-------|-----|-----------------|
| ZH | GebV OG (LS 211.11) | § 4 I | 1.1.2015 (Nachtr. 087) | sockel_prozent (8 Bänder) | https://www.zh.ch/de/politik-staat/gesetze-beschluesse/gesetzessammlung/zhlex-ls/erlass-211_11-2010_09_08-2011_01_01-087.html |
| BE | Verfahrenskostendekret VKD (BSG 161.12) | Art. 36 (38) | 1.5.2026 | rahmen-staffel | https://www.belex.sites.be.ch/app/de/texts_of_law/161.12 |
| LU | Justiz-Kostenverordnung JusKV (SRL 265) | § 5 | 1.1.2026 | rahmen-staffel | https://srl.lu.ch/app/de/texts_of_law/265 |
| AG | Gebührendekret GebührD (SAR 662.110) | § 7 I | 1.7.2024 | voll_prozent (10 Bänder) | https://gesetzessammlungen.ag.ch/app/de/texts_of_law/662.110 |
| SG | Gerichtskostenverordnung GKV (sGS 941.12) | Art. 10/11 | 1.3.2012 (Folgefassung ab 1.7.2026 wortgleich) | rahmen | https://www.gesetzessammlung.sg.ch/app/de/texts_of_law/941.12 |
| SO | Gebührentarif GT (BGS 615.11) | § 145 | 1.3.2026 | rahmen-staffel | https://bgs.so.ch/app/de/texts_of_law/615.11 |
| TG | Verordnung Gerichtsgebühren VGG (RB 638.1) | § 11 I | 1.1.2022 | rahmen-staffel | https://www.rechtsbuch.tg.ch/app/de/texts_of_law/638.1 |
| BL | Gebührentarif GebT (SGS 170.31) | § 8 I lit. f | 1.1.2021 | rahmen-staffel | https://bl.clex.ch/app/de/texts_of_law/170.31 |
| BS | Reglement Gerichtsgebühren GGR (SG 154.810) | § 5 | Reglement v. 11.9.2017 | rahmen-staffel | https://www.gesetzessammlung.bs.ch/app/de/texts_of_law/154.810 |
| GR | V. Gerichtsgebühren Zivilverfahren VGZ (BR 320.210) | Art. 3 | 1.1.2025 | rahmen (Pauschale) | https://www.gr-lex.gr.ch/app/de/texts_of_law/320.210 |
| SZ | Gebührenordnung GebO (SRSZ 173.111) | § 33 Ziff. 4/6 | 1.1.2026 | rahmen | https://www.sz.ch/public/upload/assets/32452/173_111.pdf |
| ZG | Kostenverordnung Obergericht KoV OG (BGS 161.7) | § 11 I | 1.1.2026 | rahmen-staffel | https://bgs.zg.ch/app/de/texts_of_law/161.7 |

**Detail-Bänder** (von-bis je Streitwert-Band) sind im Datenmodul
`src/data/tarif/gerichtskosten.ts` kodiert (mit verbatim-Wortlaut-Verweis und
den drei amtlich nachgerechneten Stützstellen 5'000/50'000/500'000). ZH/AG
deterministische Grundgebühr, übrige Ermessensrahmen.

**Querschnitt-Befunde:**
- **Vergleichs-Aggregation als Gegenprüfung:** Stein-Wigger/Bachofner, «Das
  baselstädtische Reglement über die Gerichtsgebühren», BJM 2018 S. 93 ff.,
  enthält eine kantonsvergleichende Tabelle (BS/BL/AG/SO/FR/BE/ZH/GE/LU/SG/ZG) —
  deckt sich mit den hier amtlich extrahierten Rahmen (Gegenprobe bestanden).
  Maßgeblich bleibt stets der amtliche Erlass, nie die Sekundärquelle.
- **AG-Falle (Lektion):** Der zuerst zitierte VKD (SAR 221.150) ist **aufgehoben**
  (per 1.7.2024) und durch das **GebührD (SAR 662.110)** ersetzt — der
  Verifizierer hat das über `abrogated`/`future_versions` der amtlichen API
  gefangen. Bandwerte blieben identisch, einzig zwei Bänder zusammengelegt.
- **Rahmen-Tarife mit %-Decke/-Tail oben** (BE ≥2 Mio, LU >10 Mio, SO >1 Mio,
  TG >1 Mio, ZG >5 Mio, SG Art. 11): die bezifferten Bänder sind kodiert; der
  prozentuale obere Tail ist als Hinweis geführt (kein erfundener Punktwert).

---

## E. Parteientschädigung / Anwaltshonorar (Art. 95 III / Art. 96) — in Arbeit

Eigene Datenschicht; Recherche aller 26 Kantone läuft (BS-Muster:
Honorarordnung HO **SG 291.400**,
https://www.gesetzessammlung.bs.ch/app/de/texts_of_law/291.400). Ergänzung
dieses Dossiers nach Verifikation.

---

## F. Pflegebedarf (§11 Ziff. 4 — Verfallskandidaten)

- **SG GKV (sGS 941.12):** aktuelle Fassung in Vollzug **bis 30.6.2026**, ab
  1.7.2026 wortgleiche Folgefassung → **Re-Pin-Termin 1.7.2026**.
- **BE VKD:** Art. 36 II geändert per 1.5.2026 (Änderung 26-017) — beobachten.
- **ZPO Art. 96/98/113 f.:** Stand 1.1.2025 (Praxistauglichkeits-Revision) —
  stabil; künftige ZPO-Revisionen im Auge behalten.
- Kantonale Tarife generell: revisionsanfällig → jährlicher Abgleich, je Eintrag
  Stand-Datum gepflegt. Verfallsregister-Anschluss: B-P0b (CI-Gate).

## G. Abnahme-Status (§11 Ziff. 5)

Erstrecherche, bundesrechtlich amtlich verifiziert (Fedlex 1.1.2025), kantonal
Tranche 1 doppelt verifiziert. **Fachliche Abnahme durch David ausstehend.**
Nichts trägt `geprüft`.
