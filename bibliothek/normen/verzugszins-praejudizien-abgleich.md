# Abgleich Präjudizienbuch OR (Art. 104) ↔ Verzugszins-Engine

**Erstellt:** 10.6.2026 · Auftrag David, Wissens-Verwertung «Legal Calc
Knowledge» (lokale Quellensammlung) — Abgleich der Kommentierung zu
Art. 104 OR gegen `src/lib/verzugszins.ts` und das BGE-Register
`src/data/verifikation.ts`.

**Status:** ERSTRECHERCHE

**Quellen + Stand:**

- **PRIVATE Quelle (Praxis-Schicht, NICHT amtlicher Beleg, S3):**
  Göksu, in: Gauch/Stöckli (Hrsg.), Präjudizienbuch OR — Die
  Rechtsprechung des Bundesgerichts (1875–2023), 11. Aufl., Schulthess
  2025, Art. 104, S. 404–407 (ISBN 978-3-7255-9812-0). Lokale
  Privatkopie: `bibliothek/quellen/legal-calc-knowledge/Präjudizienbuch
  OR, Art. 104.pdf` (gitignored, nicht wiederbeschaffungs-garantiert;
  Text per PDFKit extrahiert, 10.6.2026). Urheberrechtlich geschützt —
  hier nur Fundstellen + eigene Formulierungen, keine
  Wortlaut-Übernahmen.
- **Amtlich/zitierfähig:** Die im Dossier genannten BGE mit amtlicher
  Fundstelle (Band/Seite, z. B. BGE 130 III 591) bzw. BGer-Urteile mit
  Aktenzeichen sind zitierfähig; amtliche Abruforte bger.ch /
  relevancy.bger.ch. Eine eigene amtliche Nachverifikation der einzelnen
  Erwägungen fand in diesem Durchgang NICHT statt (deshalb Status
  ERSTRECHERCHE; `verifiziert: false` im Register bleibt unberührt).
- **Normtext:** OR SR 220, Fedlex, Konsolidierung 20260101; Anker
  `art_104` ist im Quellen-Register als empirisch geprüft geführt
  (`register/quellen-register.md`, Stand 5.6.2026).

**Geprüfter Code (nur gelesen, auftragsgemäss KEINE Änderung):**
`src/lib/verzugszins.ts` (330 Zeilen, vollständig) ·
`src/data/verifikation.ts` (Block «Verzugszins (Art. 104 OR)», Z. 83–124).

**Hinweis S7:** Der INDEX-Eintrag für dieses Dossier steht aus —
der Auftrag verbot ausdrücklich jede Änderung an bestehenden Dateien
(inkl. INDEX). Beim nächsten Bibliotheks-Commit nachziehen, sonst
schlägt `scripts/bibliothek-check.sh` an.

---

## A. Regel-Abgleich (deterministisch, Eingabe → Ausgabe)

### R1 — Gesetzlicher Satz 5 % (Abs. 1)

**Regel:** Eingabe ohne `zinssatzProzent` → Engine rechnet mit 5 %/Jahr.
**Quelle:** Abs. 1; die gesetzliche Fixierung nimmt bewusst keine
Rücksicht auf die Marktlage (BGE 138 III 746 E. 6.2); die 5 % sind eine
gesetzliche Schadenspauschale, richterliche Schätzung nach Art. 42
Abs. 2 OR nur in engen Grenzen (BGer 4C.459/2004 E. 3.1).
**Verdikt: Engine korrekt** — Default 5 (`verzugszins.ts` Z. 107),
Schritt 3 zitiert Art. 104 Abs. 1 (Z. 181).

### R2 — Dispositivität von Abs. 1 (höherer ODER tieferer Satz vereinbar)

**Regel:** `satzGrund='gesetzlich'` + Satz ≠ 5 → Rechnung mit dem
eingegebenen Satz, aber Warnung «dispositiv, abweichender Satz bedarf
einer Grundlage».
**Quelle:** Abs. 1 ist dispositiv; auch ein tieferer Verzugszins ist
vereinbar (BGE 117 V 349 E. 3b; BGE 119 V 131 E. a: reglementarische
4 % zulässig).
**Verdikt: Engine korrekt** — Warnung Z. 292, Rechtsprechungs-Verweis
BGE 117 V 349 in Schritt 3 (Z. 188). Register-Aussage zu
`BGE_117_V_349` deckt sich mit der Quelle.

### R3 — Voraussetzungen: Fälligkeit + Inverzugsetzung, kein Schadens-/Verschuldensnachweis

**Regel:** Engine verlangt keinen Schadens-/Verschuldens-Input; Schritt 1
sagt dies ausdrücklich.
**Quelle:** Fälligkeit und Inverzugsetzung als Voraussetzungen
(BGE 130 III 591 E. 3; BGer 4C.22/2003 E. 3.2); kein Schadens- oder
Verschuldensnachweis nötig (BGer 4C.22/2003 E. 3.1); Bestand und Höhe
des Gläubigerschadens werden im Umfang von Abs. 1–3 fingiert
(BGE 123 III 241 E. 4b).
**Verdikt: Engine korrekt** — Schritt 1 (Z. 147–152) mit
BGE 130 III 591.
**Zitatpräzision (NIEDRIG, kein Rechenfehler):** Die Register-Aussage zu
`BGE_130_III_591` bündelt beide Teilaussagen; das Element «kein
Schaden-/Verschuldensnachweis» stützt die Quelle primär auf
BGer 4C.22/2003 E. 3.1. Bei nächster Registerpflege Aufteilung erwägen.

### R4 — Verzugszins nur auf geschuldeten Beträgen

**Regel:** `kapital ≤ 0` → Status `kein_anspruch`, Warnung mit Verweis
BGer 4A_117/2014.
**Quelle:** Kein Verzugszins auf Beträgen, die der Gläubiger zwar
verlangt, die ihm aber nicht zustehen (BGer 4A_117/2014 E. 3.3).
**Verdikt: Engine korrekt** — Validierung Z. 123–130.
**BEFUND (NIEDRIG, Register-Hygiene):** `verifikation.ts` Z. 104 führt
`BGer_4A_117_2014` als «RESERVE … noch unreferenziert», obwohl
`verzugszins.ts` Z. 127 das Aktenzeichen als Fliesstext-String zitiert
(am `rechtsprechung()`-Helper vorbei). Kommentar überholt bzw. Verweis
umgeht das Register — bei nächster Code-Session bereinigen.

### R5 — Zinsbeginn bei Mahnung

**Regel:** `beginnTyp='mahnung'` → erster Zinstag = Eingabedatum
(= Tag des ZUGANGS der Mahnung); Tage = Stichtag − erster Zinstag.
**Quelle:** Verzugszins ab dem Tag, an dem der Schuldner die Mahnung
erhalten hat.
**Verdikt: Engine korrekt** — Z. 134, 160 («ab Erhalt der Mahnung»).
UI-seitig muss die Eingabe das Zugangs-, nicht das Versanddatum sein;
der Rechenweg-Text sagt das.

### R6 — Zinsbeginn bei Klageeinleitung

**Regel:** `beginnTyp='klage'` → erster Zinstag = Eingabedatum
(= Zustellung der Klage/Widerklage).
**Quelle:** BGer 4A_282/2017 E. 5 (Zustellung von Klage bzw. Widerklage
als Beginn).
**Verdikt: Engine korrekt** — Z. 159, Verweis Z. 171. Register-Aussage
zu `BGer_4A_282_2017` von der Quelle gedeckt.

### R7 — Zinsbeginn bei bestimmtem Verfalltag (Verzug ohne Mahnung)

**Regel:** `beginnTyp='verfalltag'` → Verzug ohne Mahnung; erster
Zinstag = Folgetag des Verfalltags (`addDays(+1)`, Z. 134).
**Quelle:** Tritt Verzug ohne Mahnung ein, läuft der Zins umgehend
(BGer 4A_58/2019 E. 4.1).
**Verdikt: Engine korrekt** — «umgehend» ist in der Quelle nicht
tagesgenau; die Engine-Konvention (Verzug nach unbenütztem Ablauf des
Verfalltags → Zins ab Folgetag) widerspricht ihr nicht und ist als
Annahme offengelegt (Z. 296).
**Dokumentierte Normverweis-Differenz (kein Befund):** Das
Präjudizienbuch setzt an dieser Stelle die Normklammer «Art. 108
Ziff. 1»; die Engine begründet den mahnungslosen Verzug seit dem
deklarierten Audit-Fix vom 6.6.2026 mit Art. 102 Abs. 2 OR
(Code-Kommentar Z. 164–167). Die Engine-Lesart deckt sich mit dem
Normtext (Art. 102 Abs. 2: Verfalltag → Verzug ohne Mahnung; Art. 108
betrifft die Entbehrlichkeit der NACHFRIST beim Rücktritt). Abweichung
von der Privatquelle hiermit offengelegt (§7); Rechenergebnis ist
identisch, betroffen ist nur die zitierte Norm.

### R8 — Höherer vertraglicher Zins (Abs. 2)

**Regel:** `satzGrund='vertraglich'` + Satz X → Rechnung mit X %, Verweis
Art. 104 Abs. 2 + BGE 137 III 453, Warnung «Beweislast beim Gläubiger».
**Quelle:** War die Schuld vor Verzug höher als 5 % verzinst, gilt der
vertragliche Satz auch für die Verzugszinsen (BGE 137 III 453 E. 5.1);
Beweislast für die Vereinbarung beim Gläubiger (BGer 4A_69/2018
E. 7.1.1); keine richterliche Ermässigung, pönales Element
(BGE 130 III 312 E. 7.1).
**Verdikt: Engine korrekt** für Satz > 5 — Z. 175–189, 290. Die Engine
ermässigt nie (konform mit BGE 130 III 312); Register-Aussage zu
`BGE_137_III_453` gedeckt.
**BEFUND (NIEDRIG):** Bei `satzGrund='vertraglich'` und Satz **< 5 %**
zitiert der Rechenweg unverändert Art. 104 Abs. 2 (Z. 175–178) — Abs. 2
erfasst nur HÖHERE Zinsen. Ein tieferer vereinbarter Verzugszins ist
zwar zulässig, ruht aber auf der Dispositivität von Abs. 1
(BGE 117 V 349 E. 3b), nicht auf Abs. 2. Zahl korrekt, Normklammer im
Rechenweg falsch. Fundstelle: `verzugszins.ts` Z. 175 (ternärer
`satzNormen`-Ausdruck ohne Fallunterscheidung nach Satzhöhe).

### R9 — Kaufmännischer Verkehr / Bankdiskonto (Abs. 3)

**Regel:** `satzGrund='kaufmaennisch'` + Satz X → Rechnung mit X %;
Rechenweg-Text «nur im objektiv kaufmännischen Verkehr, soweit der
übliche Bankdiskonto (Privatdiskontsatz) 5 % übersteigt»; Warnung
«Privatdiskontsatz am Zahlungsort nachzuweisen». Die Engine berechnet
den Diskontsatz NICHT selbst (deterministisch sauber: der Satz ist
Tatfrage und nachzuweisen).
**Quelle:** Anwendungsbereich objektiv kaufmännisch — das Geschäft muss
in unmittelbarem Zusammenhang mit der umsatzbezogenen Tätigkeit BEIDER
Parteien stehen, blosse subjektive Kaufmannseigenschaft genügt nicht
(BGE 122 III 53 E. b); «üblicher Bankdiskonto» = Privatdiskontsatz,
nicht Kontokorrent-Zinssatz (BGE 116 II 140 E. 5).
**Verdikt: Engine korrekt** — Z. 180, 187, 291; Register-Aussage zu
`BGE_116_II_140` gedeckt.
**BEFUND (MITTEL):** Keine Plausibilisierung für
`satzGrund='kaufmaennisch'` mit Satz **≤ 5 %**: Abs. 3 greift nur,
SOWEIT der Diskonto 5 % übersteigt; bei Eingabe z. B. 4 % rechnet die
Engine kommentarlos mit 4 % (Z. 175–189), obwohl Abs. 1 dem Gläubiger
mindestens 5 % garantiert — das Ergebnis unterschreitet dann still das
gesetzliche Minimum. Inkonsequent zur bestehenden Guard-Logik: für
`gesetzlich` ≠ 5 % existiert eine Warnung (Z. 292), für
`kaufmaennisch` ≤ 5 % nicht. Empfehlung (künftige Code-Session):
analoge Warnung ergänzen.

### R10 — Zinseszinsverbot

**Regel:** Aufgelaufene Zinsen werden in keinem Segment Zinsbasis;
Zinsbasis ist stets nur `kapital` (Z. 224); separater Topf
`aufgelaufeneZinsen` (Z. 215, 226).
**Quelle:** Zinsen wachsen linear auf dem Kapital an; auch im Prozess
sind keine Zinseszinsen zuzusprechen (BGer 4A_514/2007 E. 4.3).
**Verdikt: Engine korrekt** — Mechanik Z. 212–263; Warnung Z. 287
(Art. 105 Abs. 3 OR); Register-Aussage zu `BGer_4A_514_2007` gedeckt.

### R11 — Teilzahlungs-Anrechnung Zinsen vor Kapital (Art. 85 OR)

**Regel:** Teilzahlung → zuerst Tilgung der aufgelaufenen Zinsen, dann
Kapital (Z. 236–251).
**Quelle (Stütze aus dem Beispiel-Teil):** Anrechenbarkeit von Zahlungen
des Haftpflichtversicherers auf bereits fällige Zinsen
(BGE 113 II 323 E. 8).
**Verdikt: Engine korrekt** — die Quelle bestätigt die
Anrechnungsrichtung; primäre Normgrundlage bleibt Art. 85 OR (von der
Engine zitiert, Z. 249).

### R12 — Verzugszins auf rückständige Zinsen (Art. 105 Abs. 1 OR)

**Regel:** Flag `rueckstaendigeZinsforderung` → Warnung «Verzugszins erst
ab Betreibung/Klage; Verzugsbeginn diesem Datum anpassen» (Z. 293).
**Quelle:** **Negativbefund (S5):** Die Kommentierung zu Art. 104
enthält dazu NICHTS (Standort wäre die Kommentierung zu Art. 105, die
in der Privatkopie fehlt). Die Engine-Aussage bleibt allein auf den
Normtext von Art. 105 Abs. 1 gestützt — aus dieser Quelle weder
bestätigt noch widerlegt.
**Verdikt:** kein Abgleich möglich; kein Widerspruch.

### R13 — Abgrenzung Schadenszins / Verzugszins

**Quelle:** Verzugszins und Schadenszins erfüllen funktional denselben
Zweck (pauschalierter Ausgleich der Kapitalentbehrung,
BGE 130 III 591 E. 4 [S. 599]; BGE 123 III 241 E. b); sie können NICHT
kumuliert werden (BGE 122 III 53 E. a); auf dem aufgelaufenen
Schadenszinsbetrag sind Verzugszinsen NICHT geschuldet, auch nicht ab
Urteilstag (BGE 130 III 591 [S. 599]; eingehend BGE 131 III 12
E. 9.3/9.4).
**Engine-Stand:** `verzugszins.ts` enthält KEINEN Hinweis auf das
Kumulationsverbot; ein Schadenszins-Rechner existiert nicht (Katalog
`startseiteConfig.ts` Z. 783–791: `schadenszins` mit Status `geplant`,
Beschreibung «vom Schadenseintritt bis zur Zahlung» — deckt sich mit
der Funktion gemäss Rechtsprechung).
**BEFUND (MITTEL, fehlender Warnhinweis):** Wer den Verzugszins-Rechner
auf eine Schadenersatzforderung anwendet, die bereits Schadenszins
trägt, erhält keine Warnung, dass (a) beide Zinsen nicht kumulierbar
sind und (b) auf dem Schadenszinsbetrag kein Verzugszins läuft. Eine
zusätzliche Standard-Warnung (analog Z. 284–289) wäre billig und
verhindert einen realistischen Praxisfehler. Zugleich
**Bauspezifikations-Input** für den geplanten Schadenszins-Rechner.
**Negativbefund (S5):** Der genaue Beginn des Schadenszinses («ab dem
Zeitpunkt, in dem sich der Schaden auswirkt» / schädigendes Ereignis)
ist in dieser Quelle nicht ausformuliert; im Beispiel-Teil immerhin:
Wiederherstellungskosten erst ab tatsächlicher Aufwendung zu verzinsen
(BGE 70 II 85 E. 6). Für den Bau des Schadenszins-Rechners ist eine
eigene Recherche (BGE 130 III 591 E. 4 amtlich; Lehre) nötig.

### R14 — Tageszähl-Methode

**Regel:** Engine bietet act/365 (Default), act/360, 30E/360 und warnt,
dass Art. 104 die Tageszählung nicht vorgibt (Z. 285).
**Quelle:** **Negativbefund (S5):** Die Kommentierung äussert sich an
keiner Stelle zur Tageszähl-Konvention — das Schweigen der Quelle
stützt die Engine-Warnung («zwingende bundesgerichtliche Methode nicht
belegt»).
**Verdikt: Engine korrekt** (ehrliche Offenlegung der methodischen
Annahme, §8).

### R15 — Geltungsbereich öffentliches Recht

**Quelle:** Der Verzugszins-Grundsatz gilt als allgemeiner
Rechtsgrundsatz auch für öffentlich-rechtliche Geldforderungen;
Ausnahme Sozialversicherung (nur bei gesetzlicher Grundlage oder
besonderen Umständen; BGE 119 V 78); der 5 %-Satz von Abs. 1 ist im
öffentlichen Recht NICHT anwendbar — massgebend ist ein marktangepasster
Satz (BGE 85 I 180 E. 4); Berufsvorsorge: 5 % bei fehlender
reglementarischer Grundlage (BGE 127 V 377 [S. 390]).
**Engine-Stand:** Kein Geltungsbereichs-Hinweis; der Rechner ist im
Katalog als privatrechtlich verortet (`rechtsbereich: 'privat'`).
**BEFUND (NIEDRIG):** Eine Warnung «für öffentlich-rechtliche
Forderungen gilt der 5 %-Satz nicht ohne Weiteres» fehlt; wegen der
klaren privatrechtlichen Verortung nur niedrige Dringlichkeit.

---

## B. Register-Abgleich (`src/data/verifikation.ts`, Block Art. 104)

Alle **8** registrierten Entscheide zu Art. 104 kommen im
Präjudizienbuch vor; die Register-Aussagen sind inhaltlich gedeckt
(eigene Stichprobe gegen die Fundstellenangaben der Quelle):

| Register-ID | Quelle (Fundstelle gem. Präjudizienbuch) | Deckung |
|---|---|---|
| BGE_130_III_591 | E. 3 (S. 596), E. 4 (S. 598 f.) | gedeckt; Bündelungs-Hinweis R3 |
| BGer_4A_514_2007 | E. 4.3 | gedeckt |
| BGer_4A_282_2017 | E. 5 | gedeckt |
| BGer_4A_58_2019 | E. 4.1 | gedeckt; Normklammer-Differenz R7 |
| BGer_4A_117_2014 | E. 3.3 | gedeckt; Hygiene-Befund R4 |
| BGE_117_V_349 | E. 3b (S. 350) | gedeckt |
| BGE_137_III_453 | E. 5.1 (S. 454 f.) | gedeckt |
| BGE_116_II_140 | E. 5 (S. 140 f.) | gedeckt |

Die Deckung durch eine PRIVATE Quelle ersetzt die amtliche Verifikation
nicht (`verifiziert: false` bleibt korrekt, §7/§8); sie ist aber ein
unabhängiger Zweitbeleg für die Aussagen-Formulierungen.

**Nachregistrierungs-Kandidaten** (im Buch tragend, im Register fehlend;
NUR Kandidatenliste, kein Code-Eingriff in dieser Session):
BGer 4A_69/2018 E. 7.1.1 (Beweislast höherer Satz) ·
BGE 122 III 53 (objektiv kaufmännischer Verkehr; Kumulationsverbot) ·
BGE 130 III 312 E. 7.1 (keine richterliche Ermässigung, pönales
Element) · BGE 131 III 12 E. 9.3/9.4 (kein Verzugszins auf
aufgerechnetem Schadenszins) · BGE 113 II 323 E. 8 (Anrechnung auf
fällige Zinsen) · BGE 138 III 746 E. 6.2 (Marktlage irrelevant) ·
BGE 143 III 206 E. 7.2 (Verzugszins auf Kostenvorschuss zur
Mängelbeseitigung, Werkvertrag).

---

## C. Nicht engine-relevante Quellen-Inhalte (Wissensreserve)

Ohne Entsprechung in der Engine und ohne Handlungsbedarf für den
Rechner (Vollständigkeit nach S5): selbständige Einklagbarkeit der
Verzugszinse (BGE 58 II 411 E. 6) und möglicher konkludenter Erlass bei
Einklagung nur der Hauptforderung (BGE 52 II 215 E. 5) · Verzugszinsen
sind kein massgebender Lohn nach AHVG (BGE 120 III 163) [Fundstelle
gemäss Quelle; Band-Nr. bei amtlicher Nachprüfung verifizieren] ·
Negativzins ist kein Zins im Rechtssinn (BGE 145 III 241 E. 3.3) ·
Verjährung der Verzugszinsforderung (BGE 129 V 345 E. 4.2.1) ·
Beispielfälle Rz 4 (u. a. vinkulierte Namenaktien BGE 120 II 259;
Erbschaftsgläubiger während Ausschlagungsfrist BGE 41 III 63;
Versicherungssumme BGE 88 II 111 E. 7; güterrechtliche Forderung
BGE 116 II 225 E. 5) · Abgrenzung zum Ausgleichszins bei Rückerstattung
eines Minderungsbetrags (BGer 4C.7/2005 E. 3.3).

---

## D. Ergebnis-Zusammenfassung

**15 Regel-/Themenkomplexe geprüft.** Davon:

- **10 «Engine korrekt»** mit Code-Fundstelle (R1, R2, R3, R4, R5, R6,
  R7, R8 [Hauptfall], R10, R11, R14);
- **2 ohne Abgleichsmöglichkeit** aus dieser Quelle, kein Widerspruch
  (R12 Art. 105 Abs. 1; R13-Teilfrage Schadenszins-Beginn) —
  Negativbefunde dokumentiert;
- **4 BEFUNDE**, kein einziger davon ein Rechenfehler im Hauptpfad:
  - **MITTEL (R9):** keine Warnung bei `kaufmaennisch` mit Satz ≤ 5 %
    (Ergebnis kann still unter das 5 %-Minimum von Abs. 1 fallen) —
    `verzugszins.ts` Z. 175–189.
  - **MITTEL (R13):** fehlender Warnhinweis Kumulationsverbot
    Schadenszins/Verzugszins + kein Verzugszins auf Schadenszinsbetrag
    (BGE 122 III 53; BGE 131 III 12) — zugleich Bauspezifikations-Input
    für den geplanten `schadenszins`-Rechner.
  - **NIEDRIG (R8):** bei vertraglichem Satz < 5 % falsche Normklammer
    (Abs. 2 statt Dispositivität von Abs. 1) — Z. 175.
  - **NIEDRIG (R4/Register):** `BGer_4A_117_2014` als «unreferenziert»
    markiert, wird aber in Z. 127 als String zitiert; zudem
    Zitatpräzisions-Hinweis R3 und Geltungsbereichs-Hinweis R15
    (NIEDRIG).

**Kein Widerspruch der Quelle zu einer Engine-Rechenregel gefunden.**
Die dokumentierte Normverweis-Differenz (R7: Buch «Art. 108 Ziff. 1» vs.
Engine «Art. 102 Abs. 2») geht nach Normtext-Lage zugunsten der Engine
aus. Keine neuen datierten Parameter → kein Verfallsregister-Eintrag
nötig (S6).
