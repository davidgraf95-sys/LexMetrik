# Recherche-Dossier — GebV-SchKG-Kostenrechner (Betreibungskosten)

**Erstellt:** 6.6.2026 (spätnachts) · **Anlass:** Quick-Win B.9; Davids Auftrag
«zuerst deep research, dass sicher alles stimmt» vor dem Bau.
**Status:** Erstrecherche, amtlich verifiziert (Filestore-Doppelabgleich
2022↔2026); Sekundärbelege siehe §F. **Fachliche Abnahme durch David
ausstehend (§7).**

---

## A. Quelle + Stand (§11 Ziff. 1)

- **Erlass:** Gebührenverordnung vom 23. September 1996 zum SchKG
  (GebV SchKG), **SR 281.35**, ELI `eli/cc/1996/2937_2937_2937`.
- **Geltende Konsolidierung: 1.1.2026** — **seit 7.6.2026 reproduzierbar gepinnt**
  in `scripts/fedlex-cache.sh` (`gebv_schkg`; Spezialfall: Filestore-Datei OHNE
  «-N»-Suffix); als Filestore-HTML verfügbar
  (`…/20260101/de/html/…`, abgerufen 6.6.2026). Die frühere Annahme
  «nur signiertes PDF publiziert» ist überholt.
- **Keine künftigen Fassungen** angekündigt (SPARQL `dateApplicability`,
  vollständige Konsolidierungsliste: 1997/1998/2011/2016-01/2016-02/2019/
  2022/2026; abgerufen 6.6.2026).
- **Empirischer Doppelabgleich:** ALLE 66 Artikel der Stände 20220101 und
  20260101 maschinell gediffte (whitespace-/soft-hyphen-blind). **Echte
  Textänderungen NUR in Art. 15a und 15b** (eSchKG-Verbund); alles andere
  sind entfernte weiche Trennzeichen und Fussnoten-Renummerierung.

### KORREKTUR gegenüber `schkg-existenzminimum-vorlagen.md` (§7-Offenlegung)

Das dortige Item 2 löste den AS-2025-630-Vorbehalt mit der Begründung auf,
AS 2025 630 betreffe «die SchKG-Änderung Art. 8a (Auskunftssperre)». **Das
ist falsch:** `eli/oc/2025/630` ist bei Fedlex unter **SR 281.35**
klassifiziert und ist die **Änderung der GebV SchKG vom 15.10.2025**
(Bundesrat; AS publiziert 22.10.2025; in Kraft 1.1.2026). Sie ändert
ausschliesslich:

- **Art. 15a Abs. 1:** eSchKG-Gebühr des BJ gegenüber dem Betreibungsamt
  neu pauschal **60 Rappen pro Begehren** (vorher Staffel 1.–/–.90/–.80/–.70
  nach Begehrensvolumen).
- **Art. 15b Abs. 1/2:** Beitritt/Zugang eSchKG-Verbund einmalig **400**
  (vorher 500); jährliche Erneuerung **140** (logischer Teilnehmer) bzw.
  **380** (physischer) statt pauschal 200.

**Folge fürs Produkt:** unverändert — beide Artikel betreffen den internen
eSchKG-Verbund (Amts-/Teilnehmergebühren), nicht die Kosten je
Betreibungsschritt. Das RESULTAT des alten Dossiers («Rechner-Staffeln
unverändert») stimmt; nur seine Begründung war eine Verwechslung.

---

## B. Tarif-Register — Wert für Wert am 1.1.2026-HTML verifiziert (§11 Ziff. 2)

Alle Beträge wörtlich aus `fedlex-data-admin-ch-eli-cc-1996-2937_2937_2937-
20260101-de-html.html` (Abruf 6.6.2026); identisch mit Stand 1.1.2022.

### B.1 Fixe Staffeln (deterministisch → Punktwert-Ausgabe zulässig, §2)

**Art. 16 Zahlungsbefehl** (Erlass + doppelte Ausfertigung + Eintragung +
Zustellung; Bemessung nach der Forderung):
| Forderung CHF | Gebühr CHF |
|---|---|
| bis 100 | 7 |
| über 100 bis 500 | 20 |
| über 500 bis 1 000 | 40 |
| über 1 000 bis 10 000 | 60 |
| über 10 000 bis 100 000 | 90 |
| über 100 000 bis 1 000 000 | 190 |
| über 1 000 000 | 400 |
- Abs. 2: jede **weitere** doppelte Ausfertigung = **½** der Gebühr.
- Abs. 3: **CHF 7 je Zustellungsversuch** je Zahlungsbefehl.
- Abs. 4: Eintragung eines **vor Ausfertigung zurückgezogenen**
  Betreibungsbegehrens: **CHF 5** (forderungsunabhängig).

**Art. 20 Vollzug der Pfändung** (inkl. Pfändungsurkunde; nach Forderung):
| Forderung CHF | Gebühr CHF |
|---|---|
| bis 100 | 10 |
| über 100 bis 500 | 25 |
| über 500 bis 1 000 | 45 |
| über 1 000 bis 10 000 | 65 |
| über 10 000 bis 100 000 | 90 |
| über 100 000 bis 1 000 000 | 190 |
| über 1 000 000 | 400 |
- Abs. 2: fruchtlose Pfändung **½, mind. CHF 10**; erfolgloser
  Pfändungsversuch **CHF 10**.
- Abs. 3: Vollzug > 1 Stunde: **+CHF 40 je weitere halbe Stunde**.
- Abs. 4: Protokollierung eines erledigten Fortsetzungsbegehrens (Zahlung/
  Rückzug/Einstellung/Aufhebung ohne Pfändung): **CHF 5**.

**Art. 30 Versteigerung/Freihandverkauf/Ausverkauf** (nach Zuschlagspreis/
Kaufpreis/Erlös):
| Betrag CHF | Gebühr |
|---|---|
| bis 500 | 10 |
| über 500 bis 1 000 | 50 |
| über 1 000 bis 10 000 | 100 |
| über 10 000 bis 100 000 | 200 |
| über 100 000 | **2 ‰** |
- Abs. 3: Gebühr **nie höher als der erzielte Erlös** (Kappung!).
- Abs. 4: ohne Erwerber: nach **Schätzungswert, ½, max. CHF 1 000**.
- Abs. 5: > 1 Stunde: **+CHF 40 je weitere halbe Stunde**.
- Abs. 7: Eintragung eines erledigten Verwertungsbegehrens: **CHF 5**.

**Konkurs:** Art. 44 Feststellung Konkursmasse **CHF 50 je halbe Stunde**
(lit. a–e) · Art. 45 Gläubigerversammlung nach Inventar-Aktiven: bis
500 000 = **400**, darüber **1 000** · Art. 46 Abs. 1: **20** je
Forderungsprüfung/Kollokation (lit. a), **20** Eigentumsanspruch-Verfügung
(lit. b), je **200** Schlussrechnung/Verteilungsplan/Schlussbericht
(+**50**/weitere halbe Std. über 1 Std., lit. c), **20** Abtretung
Art. 260 (lit. d).

**Nebengebühren:** Art. 9 Schriftstücke **8/Seite** (bis 20 Ausf.),
**4/Seite** ab der 21.; Abs. 1bis: > 1 Std. **+40/halbe Std.**; Abs. 3
Fotokopien **2/Kopie** (Kann); Abs. 4 Formular-Ausfüllen **bis 5** (Kann) ·
Art. 10bis Abhol-Aufforderungsschreiben **8** · Art. 12 Akteneinsicht/
Auskunft **9** (+40/halbe Std. über ½ Std.; schriftlich zusätzlich
Art. 9) · Art. 12a schriftlicher Registerauszug **17** pauschal ·
Art. 12b Gesuch Art. 8a Abs. 3 lit. d SchKG **40** pauschal ·
Art. 19 Einzahlung/Überweisung: bis 1 000 = **5**, darüber **5 ‰ max.
500**; Auslagen der Überweisung zulasten des Gläubigers (Abs. 3) ·
Art. 22 Abs. 2 Vormerkung Pfändungs-Teilnahme ohne Ergänzung **6**.

**Gebührenfrei (UI-relevant!):** Art. 18 **Rechtsvorschlag** ·
Art. 41 Rückzugs-Protokollierung/Verlustschein-Löschung · Art. 9 Abs. 2
Schriftstücke im Geldverkehr/Aktenexemplare · Art. 12 Abs. 1 Satz 2
Vorlegung von Forderungstiteln.

### B.2 Rahmengebühren (Ermessen → NUR Bandbreite ausgeben, §2)

- **Art. 48 Entscheidgebühr betreibungsrechtliche Summarsachen**
  (Art. 251 ZPO; greift u. a. für Rechtsöffnung), nach Streitwert:
  bis 1 000: **40–150** · bis 10 000: **50–300** · bis 100 000: **60–500** ·
  bis 1 Mio.: **70–2 000** · über 1 Mio.: **500–4 000**.
  Abs. 2: Exequatur-Entscheid (Art. 271 Abs. 3 SchKG) **max. 1 000**.
- **Art. 52** Konkurseröffnung: nicht streitig **40–200**, streitig
  **50–500** · **Art. 53** andere Verfügungen Konkursgericht (im 2026-HTML
  unverändert) · **Art. 54** Nachlassstundung **200–2 500**, in besonderen
  Fällen **bis 5 000**.
- **Art. 61** Rechtsmittel-Entscheid: **max. 1,5×** der Vorinstanz-Gebühr.
- **Art. 1 Abs. 2** nicht tarifierte Verrichtungen: **bis 150** (Kann).
- **Art. 47** anspruchsvolle Konkursverfahren: Aufsichtsbehörde setzt fest.

### B.3 Bemessungs-/Anwendungsregeln (decision-tree-fähig)

1. **Art. 6:** Bemisst sich die Gebühr nach der in Betreibung gesetzten
   Forderung, fallen **nicht bezifferte Zinsen ausser Betracht** →
   Bemessungsgrösse = bezifferte Forderung (inkl. bezifferter aufgelaufener
   Zinsen, sofern im Begehren beziffert).
2. **Art. 13:** Auslagen (Post, Sachverständige, Polizei, Bankspesen)
   **effektiv**, kein Tarif → im Rechner NUR Hinweis, nie Betrag.
3. **Kostenvorschuss/Tragung:** Art. 68 SchKG — Gläubiger schiesst vor,
   Schuldner trägt (Gebühren werden dem Schuldner überwälzt; Vorschuss von
   den Zahlungen vorab erhoben). [Sekundärbeleg §F]
4. **Abschliesslichkeit:** Die GebV regelt die Gebühren bundesrechtlich
   abschliessend (Art. 1 Abs. 1; Art. 1 Abs. 2 nur für nicht tarifierte
   Verrichtungen) — **keine kantonalen Betreibungsamts-Tarife**.
   [Sekundärbeleg §F]
5. **MWST:** [offen — §F]

---

## C. Regelwerk-Skizze Rechner (Eingabe → Ausgabe)

Eingaben: Verfahrensschritt (Mehrfachwahl) + Bemessungsgrösse:
- Zahlungsbefehl (Forderung; Optionen: weitere Ausfertigungen n,
  Zustellversuche n) → Art. 16-Staffel + n×½-Staffel + n×7.
- Pfändungsvollzug (Forderung; Weichen fruchtlos/erfolglos) → Art. 20.
- Verwertung (Erlös/Schätzwert; Weiche «kein Erwerber») → Art. 30 inkl.
  Erlös-Kappung Abs. 3.
- Einzahlung/Überweisung (Summe) → Art. 19.
- Konkurs-Schritte (Stunden, Aktiven, n Forderungen) → Art. 44–46.
- Entscheidgebühren (Streitwert) → Art. 48/52/54 als BANDBREITE.
Ausgaben: Gebühr je Schritt + Summe der Punktwerte (Bandbreiten getrennt
als «zusätzlich möglich: X–Y») + Gebührenfrei-Hinweise (Art. 18!) +
Auslagen-Hinweis (Art. 13) + Überwälzungs-Hinweis (Art. 68 SchKG).

**§2-Schnitt:** B.1 = Punktwerte · B.2 = nur Bandbreiten · Auslagen = nie.

---

## D. Pflegebedarf (§11 Ziff. 4)

- Beträge seit 1.1.2022 unverändert (Rechner-Tatbestände); letzte
  betragsändernde Revision der Rechner-Tatbestände: V vom 28.4.2021
  (AS 2021 259, in Kraft 1.1.2022). KEIN datierter Parameter →
  **kein Verfallsregister-Eintrag nötig**; Prüfanlass nur bei neuer
  AS-Publikation zu SR 281.35 (Fedlex-Konsolidierungsliste).
- Verfallsregister-ALTLAST «GebV SchKG 1.1.2026 prüfen»: durch dieses
  Dossier ERLEDIGT (Art. 15a/15b-Befund oben).

## E. Abnahme-Status (§11 Ziff. 5)

- Amtliche Verifikation: **zweifach** (Filestore-HTML 20220101 ↔ 20260101
  maschinell gediffte + Werte einzeln extrahiert; AS 2025 630 im Original
  gelesen).
- Sekundärbelege: §F (Deep-Research-Bericht).
- Fachliche Abnahme David: **ausstehend** — insbesondere C-Regelwerk und
  die UI-Formulierungen («fruchtlos», «Kappung», Überwälzung).

## F. Sekundärbelege & offene Fragen

**Selbst amtlich nachgezogen (7.6.2026, Caches):**
- **Art. 68 SchKG verbatim** (`/tmp/schkg.html`): «Der Schuldner trägt die
  Betreibungskosten. Dieselben sind vom Gläubiger vorzuschiessen. Wenn der
  Vorschuss nicht geleistet ist, kann das Betreibungsamt … die
  Betreibungshandlung einstweilen unterlassen.» Abs. 2: «Der Gläubiger ist
  berechtigt, von den Zahlungen des Schuldners die Betreibungskosten vorab
  zu erheben.» → UI-Hinweis exakt so formulierbar.
- **MWST:** Die GebV SchKG enthält KEINE Mehrwertsteuer-Bestimmung
  (Volltextsuche 20260101-HTML: 0 Treffer). Betreibungsgebühren sind
  hoheitliche Abgaben; eine MWST-Aufrechnung ist in der GebV nicht
  vorgesehen. [Steuerliche Einordnung (Art. 18 MWSTG hoheitlich): als
  Lehre/Praxis-Punkt zu verifizieren — der Rechner behauptet dazu NICHTS.]
- **Abschliesslichkeit:** Art. 1 Abs. 1 verbatim («Diese Verordnung regelt
  die Gebühren und Entschädigungen der Ämter, Behörden und übrigen
  Organe …»); kantonale Zusatztarife für GebV-Verrichtungen sind nicht
  vorgesehen; Auffangnorm ist Art. 1 Abs. 2 (bis 150, Bund).

**Deep-Research-Bericht (eingegangen 7.6.2026; 99 Agents, adversariale
3-Stimmen-Verifikation; Kernbefunde je 3:0 bestätigt):**
- ALLE Kerntarife (Art. 9/12/13/16/20/30/44/45/46/48/52/54) unabhängig
  zweitbelegt (signierte Fedlex-PDF-A 20220101+20260101, Lawbrary-Mirror,
  Betreibungsinspektorat ZH) — deckungsgleich mit §B.
- **Die echte Art.-8a-SchKG-Änderung ist AS 2025 522** (BG vom 21.3.2025,
  Nichtbekanntgabe von Betreibungseinträgen, nur SR 281.1, keine
  CHF-Beträge; in Kraft 1.1.2026) — die alte Dossier-Begründung hatte
  AS 2025 522 und AS 2025 630 verwechselt (§A bestätigt).
- Alte eSchKG-Werte vor der Änderung: Beitritt 500 / jährlich 200 /
  1.00–0.70 je Begehren → neu 400 / 140 / 380 / 0.60 (für den Rechner
  irrelevant, dokumentiert der Vollständigkeit halber).
- **Praxis-Fallstrick:** Kantonale Übersichten (z. B. SG) publizieren
  Beträge INKLUSIVE Zustell-Porti (Art. 13 + 16) — je ~CHF 14 höher als
  die reine Art.-16-Gebühr. Der Rechner gibt die GebV-Gebühr aus und
  weist Porti als Auslagen-Hinweis aus (nie als Betrag).
- Adversarial VERWORFEN wurden u. a. halluzinierte alternative
  Art.-48-Staffeln aus KI-Suchzusammenfassungen — massgebend bleibt
  ausschliesslich der Fedlex-Verbatim-Text (§B).
- Offen geblieben (auch im Bericht): MWST-Einordnung (s. o. — Rechner
  behauptet nichts) sowie Rand-Tatbestände (Art. 27 Mitteilungen,
  doppelter ZB Miete, Konkursandrohungs-Zustellung) — v1-Scope §C
  kommt ohne sie aus; bei Ausbau nachziehen.
