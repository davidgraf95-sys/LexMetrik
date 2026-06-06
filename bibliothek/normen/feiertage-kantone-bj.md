# Gesetzliche Feiertage je Kanton (BJ-Verzeichnis) – Regelwerk für die Fristen-Engines

**Speist:** `src/data/zpoFeiertage.ts` (`istFeiertag`/`istArbeitsfreierTag`/`naechsterWerktag`)
– massgebend für die Endverschiebung Art. 142 Abs. 3 ZPO, Art. 31 SchKG und die
3-Werktage-Zählung Art. 63 SchKG (`nthWerktagNach`).

**Quelle:** BJ/EJPD, «Gesetzliche Feiertage und Tage, die in der Schweiz wie
gesetzliche Feiertage behandelt werden», Verzeichnis nach Art. 11 des Europäischen
Übereinkommens vom 16.5.1972 über die Berechnung von Fristen (SR 0.221.122.3),
**Stand 1.1.2011** – alle 26 Sektionen am 6.6.2026 zeilenweise extrahiert und gegen
die Code-Matrix abgeglichen (Doppelcheck-Auftrag David).
URL: https://www.bj.admin.ch/dam/bj/de/data/publiservice/service/zivilprozessrecht/kant-feiertage.pdf.download.pdf/kant-feiertage-dfi.pdf

**Status: zweifach geprüft** (unabhängiger Recherche-Agent + eigener
Vollabgleich am PDF-Text). Fachliche Abnahme durch David ausstehend.

## Grundsätze (deterministische Regeln)

1. **lit. a = lit. b:** «Wie gesetzliche Feiertage behandelte» Tage (lit. b der
   BJ-Liste) zählen für die Fristverschiebung gleich wie anerkannte (lit. a) –
   beide fallen unter das Übereinkommen. Der Code unterscheidet nicht.
2. **Bundesweit kraft Bundesrechts:** 1. August (Art. 110 Abs. 3 BV) – steht in
   keiner Kantonsliste, gilt überall. Neujahr/Auffahrt/Weihnachten listen alle
   Kantone selbst.
3. **Bedingte Feiertage** (BJ-Fussnoten, im Code als `giltImJahr`):
   – **NE:** 2.1. und 26.12. sind NUR Feiertage, wenn der 1.1. bzw. 25.12. ein
     **Sonntag** ist (Fn. 10).
   – **UR/AR/AI:** der 26.12. ENTFÄLLT, wenn der 25.12. auf **Montag oder
     Freitag** fällt (Fn. 1/7/9).
4. **Bewegliche Spezialtage:**
   – **GL Näfelser Fahrt:** 1. Donnerstag im April; fällt er in die Karwoche
     (= Gründonnerstag, Ostern −3), **+1 Woche** (amtlich gl.ch; 2026: 9.4.
     statt 2.4.).
   – **GE Jeûne genevois:** Donnerstag nach dem 1. Sonntag im September.
   – **VD Lundi du Jeûne fédéral:** Montag nach dem 3. Sonntag im September.

## Matrix (X = lit. a · b = lit. b · Fussnoten in Klammern)

| Tag | ZH | BE | LU | UR | SZ | OW | NW | GL | ZG | FR | SO | BS | BL | SH | AR | AI | SG | GR | AG | TG | TI | VD | VS | NE | GE | JU |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Berchtoldstag 2.1. | X | X | X | – | – | b | b | b | b | b | b | – | – | b | – | – | b | – | X | X | – | X | b | (10) | – | X |
| Dreikönige 6.1. | – | – | – | X | X | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | X | – | – | – | – | – |
| 1. März | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | X | – | – |
| Josephstag 19.3. | – | – | – | X | X | – | X | – | – | – | (G) | – | – | – | – | – | – | – | – | – | X | – | X | – | – | – |
| Karfreitag | X | X | X | X | X | X | X | X | X | X | X | X | X | X | X | X | X | b | X | X | – | X | – | X | X | X |
| Ostermontag | X | X | X | X | X | b | b | X | b | b | b(4) | X | X | X | X | X | X | X | X | X | X | X | b | – | X | X |
| Näfelser Fahrt | – | – | – | – | – | – | – | X | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| 1. Mai | X | – | – | – | – | – | – | – | – | – | (½) | X | X | X | – | – | – | – | X | X | X | – | – | X | – | X |
| Auffahrt | X | X | X | X | X | X | X | X | X | X | X | X | X | X | X | X | X | X | X | X | X | X | X | X | X | X |
| Pfingstmontag | X | X | X | X | X | b | b | X | b | b | b(4) | X | X | X | X | X | X | X | X | X | X | X | b | – | X | **X** |
| Fronleichnam | – | – | X | X | X | X | X | – | X | X(2) | X(3) | – | – | – | – | X | – | – | X | – | X | – | X | (L) | – | X |
| 23. Juni | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | X |
| Peter & Paul 29.6. | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | X | – | – | – | – | – |
| M. Himmelfahrt 15.8. | – | – | X | X | X | X | X | – | X | X(2) | X(3) | – | – | – | – | X | – | – | X | – | X | – | X | – | – | X |
| Jeûne genevois | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | X | – |
| Lundi du Jeûne | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | X | – | – | – | – |
| Mauritiustag 22.9. | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | X(8) | – | – | – | – | – | – | – | – | – | – |
| Bruder Klaus 25.9. | – | – | – | – | – | X | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – |
| Allerheiligen 1.11. | – | – | X | X | X | X | X | **X** | X | X(2) | X(3) | – | – | – | – | X | X | – | X | – | X | – | X | – | – | X |
| M. Empfängnis 8.12. | – | – | X | X | X | X | X | – | X | **X(2)** | – | – | – | – | – | X | – | X(†) | X | – | X | – | X | – | – | – |
| Stephanstag 26.12. | X | X | X | (1) | X | b | b | **X** | b | b | b(4) | X | X | X | (7) | (9) | X | X | X | X | X | – | **b** | (10) | – | – |
| 31. Dezember | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | – | X | – |

(†) GR führt Mariä Empfängnis NICHT (BJ Ziff. 18) – Spalteneintrag «–» wäre
korrekt; im Code ist GR nicht enthalten. ✓ *(Tabellenzelle zur Sicherheit
doppelt geprüft: BJ GR = nur Neujahr/Ostermontag/Auffahrt/Pfingstmontag/
Weihnachten/Stephanstag + Karfreitag lit. b – keine katholischen Tage
kantonsweit.)*

Fussnoten der BJ-Liste:
(1)/(7)/(9) Stephanstag entfällt, wenn Weihnachten Mo/Fr ist · (2) ausser
21 Gemeinden des FR-Seebezirks · (3) ausser Bezirk Bucheggberg ·
(4) nur in einzelnen SO-Gemeinden anerkannt · (½) SO: 1. Mai erst ab 12.00 Uhr ·
(8) nur innerer Landesteil AI · (10) NE: nur wenn 1.1./25.12. Sonntage ·
(G) SO-Josephstag nur in 8 Gemeinden · (L) NE-Fronleichnam nur Le Landeron.

## Code-Abbildung und bewusste Annahmen (offengelegt, §8)

- **Kantonsweit geführt trotz Teilgebiets-Fussnote** (konservativ, zugunsten
  der Fristverschiebung): FR-Tage mit Fn. 2 (Seebezirk), SO-Tage mit Fn. 3/4
  (Bucheggberg/einzelne Gemeinden), AI-Mauritiustag (innerer Landesteil –
  der Gerichtsort Appenzell liegt darin).
- **Bewusst WEGGELASSEN:** SO-1.-Mai (halber Tag ab 12 Uhr macht den Tag
  nicht arbeitsfrei) · SO-Josephstag und -Patrozinien (nur einzelne
  Gemeinden) · NE-Fronleichnam (nur Le Landeron).
- **Korrigiert am 6.6.2026** (vorher falsch im Code): LU-Berchtoldstag,
  GL-Allerheiligen, GL- und VS-Stephanstag, JU-Pfingstmontag,
  FR-Mariä-Empfängnis, AI-Mauritiustag, NE/UR/AR/AI-Bedingungen,
  Näfelser-Fahrt-Karwoche-Regel.

## Pflegebedarf / Verifikations-TODO

- Die BJ-Liste trägt **Stand 1.1.2011**; rechtlich massgebend ist das aktuelle
  kantonale Feiertagsrecht. TODO (offen): Stichproben gegen die geltenden
  kantonalen Ruhetags-/Feiertagserlasse ziehen (Daueranweisung: amtliche
  Erlasssammlungs-APIs, `abrogated` prüfen). Bekannte Spannung: AG regelt
  konfessionelle Tage heute bezirks-/gemeindeweise; die BJ-Liste führt sie
  kantonsweit – Code folgt der BJ-Liste (für Art. 142 Abs. 3 massgebender
  Katalog), Abweichung offengelegt.
- Kein datierter Parameter (keine Verfallsregister-Pflicht), aber bei jeder
  neuen BJ-Publikation: Matrix neu abgleichen.

## Quellen

- BJ-Verzeichnis (PDF, Stand 1.1.2011): s. oben – Volltext-Extrakt am 6.6.2026.
- Näfelser Fahrt amtlich: https://www.gl.ch/public-newsroom.html/31/newsroomnews/14237/title/n%C3%A4felser-fahrt (2026: 9. April) ·
  Regel: https://www.ferienwiki.ch/feiertage/naefelser-fahrt
- SECO-Anhang «Feiertage Schweiz» (Art. 20a ArG) als Plausibilitäts-Querquelle.
