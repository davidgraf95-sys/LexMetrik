# Cluster «Strafrecht & Strafprozess» — Recherche-Dossier

**Erstellt:** 6.6.2026 · **Autor:** Recherche-Agent (Auftrag David)
**Wortlaut-Quellen:**
- **StGB** SR 311.0 — Cache `/tmp/stgb.html`, **seit 7.6.2026 reproduzierbar
  gepinnt** in `scripts/fedlex-cache.sh` (ELI `cc/54/757_781_799`,
  Konsolidierung **20260101**, html-2; Pflicht-Anker 30/97/98/101/109/333/389
  verifiziert). Verjährung Art. 97–101, 109; Antrag Art. 30–33; Übergang
  Art. 389; Anwendung AT Art. 333.
- **StPO** SR 312.0 — Cache `/tmp/stpo.html`, konsolidierte Fassung
  **«Stand am 1. Januar 2024»** (ELI `cc/2010/267`, Konsolidierung
  `20240101`; Revision BG 17.6.2022, AS 2023 468, in Kraft seit 1.1.2024).

**Status: Arbeitsgrundlage — NICHT fachlich abgenommen (CLAUDE.md §7/§8).**
Alle hier zitierten Wortlaute sind am Cache verifiziert (Abrufdatum
6.6.2026). BGE-Angaben sind als **[zu verifizieren]** markiert (kein Cache
für Rechtsprechung; vor Code-Übernahme rückprüfen). **Keine Repo-Datei
geändert ausser diesem Dossier.**

**Quellenlage (eine Zeile):** StGB-Normtexte vollständig am Cache; StPO
auf Stand 1.1.2024 — die **StPO-Revision wirkt sich auf Art. 354 (Einsprache
Privatklägerschaft) und das Haftrecht aus**, beide unten erfasst; spätere
Teilrevisionen (Stand Juni 2026) per WebSearch nicht zusätzlich geprüft →
**Verifikations-TODO V-0**.

**Verifikations-TODOs (Sammlung):**
- **V-0** StPO-Stand: gibt es zwischen 1.1.2024 und Juni 2026 eine weitere
  in Kraft getretene Änderung der Art. 89–94 / 224–229 / 354 / 396 / 399 /
  410 f.? (Cache nur 20240101 — vor Deploy gegen Fedlex-Aktualstand prüfen.)
- **V-1** Verjährungs-Höchststrafen-Mapping (Datenschicht, s. Rechner 1).
- **V-2** Haftverlängerung «Ausnahmefälle 6 Monate» Art. 227 Abs. 7 — exakter
  Wortlaut + h.M. zur Berechnung des 3-Monats-Laufs (ab Haftbeginn vs. ab
  letztem ZMG-Entscheid). [zu verifizieren]
- **V-3** «48h + 48h»-Kaskade der U-Haft: Praxis-Verständnis der zwei
  48-Stunden-Fristen (Art. 224 Abs. 2 StA-Antrag, Art. 226 Abs. 1
  ZMG-Entscheid) — Stunden- statt Tagesarithmetik.

---

## Methodische Vorbemerkung — was deterministisch geht und was nicht

Der Cluster zerfällt sauber in **deterministisch (§2-fähig)** und
**ermessensgeprägt (nur Gerüst)**:

| §2-fähig (feste Regel) | nur Gerüst / Weiche |
|---|---|
| Strafantragsfrist (3 Mt., Art. 31) | Höchststrafen-**Mapping** Delikt→Strafrahmen |
| Verfahrensfristen (10/20/90 T.) | Entschädigung/Genugtuung (Art. 429: Ermessen) |
| Haftfristen-Kaskaden (48h/3 Mt./4 T./3 T./5 T.) | Adhäsions-**Bezifferung** (Schaden = Tatfrage) |
| Verfolgungs-/Vollstreckungsverjährung **bei gegebenem Strafrahmen** | Subsumtion «welches Delikt?» |

**Kerneinsicht für den Verjährungsrechner:** Der Engpass ist **nicht** die
Fristarithmetik (trivial), sondern die Zuordnung *Delikt → angedrohte
Höchststrafe*. Ein vollständiger Deliktskatalog mit Strafrahmen ist eine
grosse, fehleranfällige Datenschicht und verträgt sich schlecht mit §2
(Subsumtion ist keine Rechenregel). **Lösungsoption (empfohlen): Der Nutzer
wählt den Strafrahmen / die Deliktskategorie, nicht das konkrete Delikt** —
mit kuratierter Kurzliste der häufigsten Delikte als Komfort-Vorauswahl
(reine Anzeigehilfe, nicht Rechenlogik). So bleibt die Engine §2-rein.

**Zweite Kerneinsicht (Fristarithmetik StGB ≠ StPO ≠ ZPO):**
- **StPO-Fristen** (Art. 90): Beginn Folgetag, Ende auf Sa/So/Feiertag →
  nächster Werktag, **massgebend Kanton des Wohnsitzes/Sitzes der Partei**
  (Art. 90 Abs. 2 Satz 3 — nicht des Gerichts!). **KEINE Gerichtsferien**
  (Art. 89 Abs. 2). → entspricht `OHNE_STILLSTAND` der `fristenEngine`,
  aber mit **anderem Kantons-Anknüpfungspunkt** als ZPO.
- **StGB-Verjährung** (Art. 98): Beginn am **Tag der Tat selbst** (nicht
  Folgetag!); Jahresfristen; **kein Ruhen, keine Unterbrechung** mehr
  (s. Rechner 1) — eigene, schlanke Arithmetik, **nicht** über `fristenEngine`.
- **Strafantragsfrist** (Art. 31): 3 Monate ab Kenntnis des Täters —
  Monatsfrist, keine Werktagsregel im StGB normiert (Art. 110 Abs. 6 StGB
  definiert Tag/Monat/Jahr).

---

## RECHNER 1 — Strafrechtliche Verjährung (Art. 97–101, 109 StGB)

### 1) Nutzerfrage
«Ist die Tat vom [Datum] heute noch verfolgbar — oder verjährt? Wann tritt
die Verfolgungsverjährung ein? (Bzw. bei rechtskräftiger Strafe: wann ist
die Vollstreckung verjährt?)»

### 2) Normbasis (Wortlaut verbatim, Cache /tmp/stgb.html)

**Art. 97 StGB — Verfolgungsverjährung, Fristen** (Fassung seit 1.1.2014):
> «¹ Die Strafverfolgung verjährt, wenn die für die Tat angedrohte
> **Höchststrafe**: a. lebenslängliche Freiheitsstrafe ist: in **30 Jahren**;
> b. eine Freiheitsstrafe von **mehr als drei Jahren** ist: in **15 Jahren**;
> c. eine Freiheitsstrafe von **drei Jahren** ist: in **10 Jahren**;
> d. eine **andere Strafe** ist: in **7 Jahren**.
> ² Bei sexuellen Handlungen mit Kindern (Art. 187) und Abhängigen (Art. 188)
> sowie bei Straftaten nach den Artikeln 111, 113, 122, 124, 182, 189–191,
> 195 und 197 Absatz 3, die sich gegen ein **Kind unter 16 Jahren** richten,
> dauert die Verfolgungsverjährung in jedem Fall **mindestens bis zum
> vollendeten 25. Lebensjahr des Opfers**.
> ³ Ist **vor Ablauf der Verjährungsfrist ein erstinstanzliches Urteil
> ergangen, so tritt die Verjährung nicht mehr ein.**»

**Art. 98 StGB — Beginn:**
> «Die Verjährung beginnt: a. mit dem **Tag, an dem der Täter die strafbare
> Tätigkeit ausführt**; b. wenn … zu verschiedenen Zeiten …, mit dem Tag der
> **letzten** Tätigkeit; c. wenn das strafbare Verhalten **dauert**, mit dem
> Tag, an dem dieses Verhalten **aufhört**.»

**Art. 99 StGB — Vollstreckungsverjährung, Fristen:**
> «¹ Die Strafen verjähren in: a. **30 Jahren** (lebenslänglich);
> b. **25 Jahren** (Freiheitsstrafe ≥ 10 J.); c. **20 Jahren** (≥ 5 und < 10 J.);
> d. **15 Jahren** (> 1 und < 5 J.); e. **5 Jahren** (andere Strafe).
> ² Die Verjährungsfrist einer Freiheitsstrafe **verlängert** sich:
> a. um die Zeit ununterbrochenen Vollzugs (auch anderer Strafe/Massnahme);
> b. um die Dauer der **Probezeit** bei bedingter Entlassung.»

**Art. 100 StGB — Beginn (Vollstreckung):**
> «Die Verjährung beginnt mit dem Tag, an dem das **Urteil rechtlich
> vollstreckbar** wird. Bei der bedingten Strafe oder beim vorausgehenden
> Vollzug einer Massnahme … mit dem Tag, an dem der Vollzug der Strafe
> **angeordnet** wird.»

**Art. 101 StGB — Unverjährbarkeit** (Auszug): Keine Verjährung für
Völkermord (264), Verbr. gg. Menschlichkeit (264a I/II), Kriegsverbrechen
(264c–264h), bestimmte Massengefährdungsverbrechen, sowie **schwere
Sexualdelikte (Art. 187 Ziff. 1, 189, 190, 191, 192 Abs. 1, 193 Abs. 1),
wenn sie an Kindern unter 12 Jahren begangen wurden**. Abs. 2: Wäre die
Verfolgung bei Anwendung 97/98 verjährt, **kann das Gericht die Strafe
mildern**. Abs. 3: zeitliche Geltungsregeln (1.1.1983 / 18.6.2010 / 30.11.2008).

**Art. 109 StGB — Übertretungen:**
> «Die Strafverfolgung und die Strafe verjähren in **drei Jahren**.»

**Wesentliche Negativ-Befunde am Cache (für §2 zentral):**
- **Kein Ruhen, keine Unterbrechung** der Verfolgungsverjährung mehr: Die
  Stichwörter «ruht», «Unterbruch», «Unterbrechung der
  Verfolgungsverjährung» kommen im StGB **nicht** vor. Seit der Revision
  2002/2014 gilt das **monistische** System: die Frist läuft schlicht ab,
  Stoppfaktor ist **nur** das erstinstanzliche Urteil (Art. 97 Abs. 3).
  → Die `verjaehrung.ts`-Mechanik (Stillstand/Unterbrechung des OR) ist
  hier **NICHT** anwendbar.
- **Art. 389 StGB (lex mitior, Übergang):** Neues, milderes
  Verjährungsrecht gilt rückwirkend; abgelaufene Zeit wird angerechnet
  (Abs. 2). → Übergangsfälle (Taten vor 1.1.2014 / vor 1.10.2002) brauchen
  Sonderbehandlung → Warnung statt Berechnung.
- **Art. 333 StGB:** Allgemeiner Teil (inkl. 97 ff.) gilt sinngemäss fürs
  Nebenstrafrecht, soweit dieses nichts anderes bestimmt → Spezialgesetze
  (SVG, BetmG) können abweichen → Weiche.

### 3) Regelwerk-Skizze
**Eingaben:** Modus (Verfolgung | Vollstreckung | Übertretung) · Tatdatum
bzw. Vollstreckbarkeits-/Anordnungsdatum (Art. 98/100) · **Strafrahmen**
(Auswahl: lebenslänglich | FS > 3 J. | FS = 3 J. | andere Strafe;
Übertretung separat) · Stichtag · ggf. «erstinstanzliches Urteil ergangen
am …» · Flags: Sexualdelikt-Minderjährige (97 Abs. 2), Opfer-Geburtsdatum,
Unverjährbarkeit-Katalog (101) · Dauerdelikt/Tatmehrheit (98 b/c).

**Regeln:**
1. Modus + Strafrahmen → Frist aus Tabelle (97 bzw. 99 bzw. 109).
2. Beginn (98 / 100) → +N Jahre, zahlengleicher Tag (Art. 110 Abs. 6:
   «Der Monat und das Jahr werden nach der Kalenderzeit berechnet» —
   **Beginntag zählt mit**, anders als OR Art. 132 — [zu verifizieren] für
   die genaue Tagesgrenze; h.M. Endpunkt = Vortag des zahlengleichen Tages).
3. Bei 97 Abs. 2: Sonderfrist = max(Regelfrist-Ende, 25. Geburtstag Opfer).
4. Bei 97 Abs. 3: erstinstanzliches Urteil vor Fristablauf → «verjährt
   nicht mehr» (harte Aussage).
5. Bei 101-Katalog: «unverjährbar» (harte Aussage, kein Datum).
6. Übergang (389): Tatdatum vor Stichdatum der jeweiligen Revision → Warnung.

**Ausgaben:** Verjährungsdatum (oder «verjährt nicht mehr» / «unverjährbar»),
verjährt-am-Stichtag (ja/nein), Rechenweg, Normverweise, Warnungen.

### 4) §2-Beurteilung
**§2-rein machbar** — sofern der **Strafrahmen Eingabe ist** (kein
Deliktskatalog-Lookup in der Engine). Mit Deliktskatalog wäre Subsumtion
nötig → §2-Verstoss. Empfehlung: Eingabe = Strafrahmen; optionale
Komfort-Vorauswahl häufiger Delikte als reine UI-Anzeige (kein
Recheneinfluss). Art. 97 Abs. 2 (25.-Geburtstag-Vergleich) ist
deterministisch, sobald Opfer-Geburtsdatum + Deliktszuordnung gegeben sind.

### 5) Datenbedarf
- **V-1: Höchststrafen-Mapping** (falls Komfort-Vorauswahl gewünscht):
  kuratierte Tabelle der häufigsten Delikte → Strafrahmen-Kategorie. Klein
  halten (z. B. 20–30 Tatbestände), **als Anzeigehilfe deklariert**, nicht
  als abschliessend. Jeder Eintrag am StGB-Cache verifizierbar (Strafdrohung
  im Tatbestand). Alternativ ganz weglassen.
- Feiertagsdaten **nicht** nötig (StGB-Jahresfristen kennen keine
  Werktagsregel; nur Kalenderarithmetik, Art. 110 Abs. 6).

### 6) Fallstricke
- **Beginn ≠ OR:** Art. 98 zählt den **Tattag mit** (anders als OR Art. 132
  «Beginntag zählt nicht»). Nicht die OR-Mechanik kopieren! [zu verifizieren]
  exakte Endpunkt-Konvention (BGE zur «Kalenderzeit» Art. 110 Abs. 6).
- **Dauer-/Seriendelikt** (98 b/c): Beginn erst mit letzter Handlung /
  Aufhören des Zustands → Nutzer muss das richtige Datum kennen (Tatfrage).
- **Kein Ruhen/Unterbrechung** — bewusst NICHT modellieren; nur 97 Abs. 3.
- **Lex mitior / Übergangsrecht** (389): Altfälle (vor 1.10.2002 galt
  Ruhen/Unterbrechung; vor 1.1.2014 kürzere Fristen) → Warnung, kein
  automatisches Ergebnis. **Praxis-Fallstrick:** 7-Jahres-Frist galt früher
  als 5 Jahre — Übergang relevant. [zu verifizieren]
- **Spezialgesetze** (Art. 333): SVG/BetmG eigene Fristen → Weiche/Warnung.
- **Vollstreckungsverjährung** (99 Abs. 2): Verlängerung um Vollzugs-/
  Probezeit ist u. U. nicht datenmässig erfassbar → annahmegestützt.

### 7) Aufwand & Wiederverwendung
**Aufwand: M.** Eigene schlanke Engine `strafverjaehrung.ts` (Jahres-
Kalenderarithmetik, Tabellen 97/99/109). **NICHT** `verjaehrung.ts`
wiederverwenden (OR-Stillstand/Unterbrechung passt fachlich nicht — §1/§4:
keine Fusion). Datums-Hilfen aus `datumsUtils.ts`. Form über
`fristenEngine` **nur** falls Werktagsregel doch einschlägig — nach
Recherche **nicht** der Fall. UI: bestehende Rechner-Form-Muster.

---

## RECHNER 2 — Strafantragsfrist (Art. 30–33 StGB)

### 1) Nutzerfrage
«Bis wann muss ich Strafantrag stellen? Läuft die 3-Monats-Frist schon?»

### 2) Normbasis (Cache /tmp/stgb.html)
**Art. 31 StGB — Antragsfrist:**
> «Das Antragsrecht erlischt nach Ablauf von **drei Monaten**. Die Frist
> beginnt mit dem **Tag, an welchem der antragsberechtigten Person der Täter
> bekannt wird**.»

**Art. 30 — Antragsrecht** (jede verletzte Person; gesetzl. Vertreter/KESB;
urteilsfähige Minderjährige selbst; bei Tod Angehörige; Verzicht endgültig).
**Art. 32 — Unteilbarkeit** (Antrag gegen einen Beteiligten → alle verfolgt).
**Art. 33 — Rückzug** (möglich bis Urteil 2. kant. Instanz; nicht
wiederholbar; Rückzug gilt für alle Beschuldigten; Einspruch des
Beschuldigten möglich).
**Form (StPO Art. 304):** schriftlich oder mündlich zu Protokoll bei
Polizei/StA/Übertretungsstrafbehörde; Verzicht/Rückzug gleiche Form.

### 3) Regelwerk-Skizze
Eingabe: Kenntnisdatum des Täters · Stichtag. Regel: +3 Monate ab
Kenntnistag (Monatsfrist, zahlengleicher Tag; Beginn-Konvention Art. 110
Abs. 6 [zu verifizieren] — h.M.: Kenntnistag zählt mit, Ende am Vortag des
zahlengleichen Tages 3 Monate später; keine StGB-Werktagsregel — aber bei
prozessualer Einreichung greift StPO Art. 90 Abs. 2? [zu verifizieren:
Verhältnis materielle Antragsfrist ↔ StPO-Werktagsregel — h.M. wohl
KEINE Verschiebung, da materiellrechtliche Frist]). Ausgabe: letztes
Antragsdatum, abgelaufen ja/nein.

### 4) §2-Beurteilung
**§2-rein.** Reine Monatsarithmetik. Kenntniszeitpunkt ist Tatfrage →
als Eingabe übernehmen, annahmegestützt deklarieren (wie `verjaehrung.ts`
es bei Kenntnisregimes tut).

### 5) Datenbedarf
Keiner (keine Feiertage, falls materiellrechtliche Frist; sonst minimal).

### 6) Fallstricke
- **Werktagsregel-Frage** (s. o.) — sauber recherchieren/offenlegen.
- **Mehrere Antragsberechtigte / Mittäter** (Art. 32 Unteilbarkeit): die
  Frist läuft pro Berechtigtem ab dessen Kenntnis — Engine rechnet pro
  Person, Unteilbarkeit als Warnhinweis.
- **Dauerdelikt:** Kenntnis vom Andauern — Beginn-Tatfrage.
- Bereits in der Straf-Engine als Fahrplan-Frist abgebildet
  (`strafZustaendigkeit.ts`, Z. 160): «3 Monate ab … Täter kennt», Art. 31
  StGB. Der eigene Rechner ergänzt die **konkrete Datumsberechnung**.

### 7) Aufwand & Wiederverwendung
**Aufwand: S.** Dünne Engine oder Erweiterung; Monatsarithmetik aus
`datumsUtils`. Kann mit Rechner 1 ein Modul «StGB-Fristen» bilden
(getrennte Engines, gemeinsame UI). Form-Pill Art. 31/304 bereits in der
Straf-Engine verifiziert.

---

## RECHNER 3 — Strafverfahrensfristen (StPO)

### 1) Nutzerfrage
«Ich habe einen Strafbefehl / ein Urteil / einen Entscheid erhalten — bis
wann kann ich Einsprache / Beschwerde / Berufung / Revision erheben?»

### 2) Normbasis (Cache /tmp/stpo.html, Stand 1.1.2024)

**Art. 89 — Allgemeine Bestimmungen:**
> «¹ Gesetzliche Fristen können nicht erstreckt werden. ² **Im Strafverfahren
> gibt es keine Gerichtsferien.**»

**Art. 90 — Beginn und Berechnung:**
> «¹ Fristen, die durch eine Mitteilung oder den Eintritt eines Ereignisses
> ausgelöst werden, beginnen **am folgenden Tag** zu laufen. ² Fällt der
> letzte Tag … auf einen Samstag, Sonntag oder … anerkannten Feiertag, so
> endet sie am **nächstfolgenden Werktag**. **Massgebend ist das Recht des
> Kantons, in dem die Partei oder ihr Rechtsbeistand den Wohnsitz oder den
> Sitz hat.**»

**Art. 354 Abs. 1 — Einsprache Strafbefehl:** «innert **10 Tagen**
schriftlich» bei der StA; berechtigt u. a. beschuldigte Person, **neu (Rev.
1.1.2024) die Privatklägerschaft** (lit. abis), weitere Betroffene.
**Abs. 1bis (neu 2024):** Privatklägerschaft kann **die Sanktion nicht**
anfechten. Abs. 2: Einsprache begründen — **ausgenommen die der
beschuldigten Person**. Abs. 3: ohne gültige Einsprache → rechtskräftiges
Urteil. **Folgen:** Art. 355 (StA: neue Beweise → festhalten/einstellen/
neuer Strafbefehl/Anklage; **Säumnis an Einvernahme → Rückzugsfiktion**,
Abs. 2); Art. 356 (Gericht entscheidet über Gültigkeit; **Fernbleiben in HV
→ Rückzugsfiktion**, Abs. 4).

**Art. 396 Abs. 1 — Beschwerde:** «innert **10 Tagen** schriftlich und
begründet bei der Beschwerdeinstanz». Abs. 2: Rechtsverweigerung/-verzögerung
**fristlos**.

**Art. 399 — Berufung:** Abs. 1 **Anmeldung** beim erstinstanzlichen Gericht
«innert **10 Tagen** seit Eröffnung des Urteils schriftlich oder mündlich zu
Protokoll». Abs. 3 **Berufungserklärung** beim Berufungsgericht «innert
**20 Tagen** seit der Zustellung des begründeten Urteils» (mit Pflichtangaben
Abs. 3 a–c, Teilanfechtung Abs. 4).

**Art. 411 Abs. 2 — Revision:** Gesuche nach Art. 410 Abs. 1 lit. b und
Abs. 2 «innert **90 Tagen** nach Kenntnisnahme»; «**in den übrigen Fällen
… an keine Frist gebunden**».

**Wiederherstellung (Art. 94):** versäumte Frist + erheblicher
unersetzlicher Rechtsverlust + glaubhaft kein Verschulden; Gesuch **innert
30 Tagen nach Wegfall des Säumnisgrundes** schriftlich+begründet bei der
zuständigen Behörde; versäumte Handlung **gleichzeitig nachholen**.

### 3) Regelwerk-Skizze
Eingaben: Rechtsmittel-Typ · Eröffnungs-/Zustellungsdatum · Kanton von
**Wohnsitz/Sitz der Partei oder des Rechtsbeistands** (Art. 90 Abs. 2!) ·
Stichtag. Regeln: Tagesfrist, Beginn Folgetag (Art. 90 Abs. 1), Ende auf
Sa/So/Feiertag → nächster Werktag, **KEINE Gerichtsferien** (Art. 89 Abs. 2).
Berufung: zwei verkettete Fristen (10 T. Anmeldung ab Eröffnung → 20 T.
Erklärung ab Zustellung begründetes Urteil). Ausgaben: letztes
Einreichdatum je Frist; Wiederherstellungs-Hinweis (Art. 94).

### 4) §2-Beurteilung
**§2-rein.** Identische Mechanik wie `OHNE_STILLSTAND` der `fristenEngine`,
ABER **anderer Kantons-Anknüpfungspunkt** als ZPO (Partei-/Vertreter-Wohnsitz
statt Gerichtsort) und **kein Stillstand** (zwingend — Art. 89 Abs. 2).

### 5) Datenbedarf
Feiertage je Kanton — **bereits vorhanden** (`zpoFeiertage.ts`, algorithmisch/
Computus, keine Jahresklippe). Anknüpfung am Partei-Kanton verdrahten.

### 6) Fallstricke
- **KEINE Gerichtsferien/Stillstand** (Art. 89 Abs. 2) — der häufigste
  Laienirrtum (ZPO Art. 145 kennt Stillstand, StPO nicht!). Muss in UI
  prominent stehen. **`fristenEngine` zwingend mit `OHNE_STILLSTAND`
  aufrufen** — nie eine ZPO-Stillstand-Strategie.
- **Kantons-Anknüpfung Art. 90 Abs. 2 Satz 3:** Wohnsitz/Sitz der Partei
  bzw. des Rechtsbeistands — **nicht** der Behördensitz. Abweichung von
  `zpoFristen`! Eigenes Eingabefeld.
- **Berufung zweistufig:** Verwechslung Anmeldung (10 T. ab Eröffnung) vs.
  Erklärung (20 T. ab **Zustellung des begründeten** Urteils) — zwei
  verschiedene Auslöseereignisse.
- **Revision teils fristlos** (Art. 411 Abs. 2 Satz 2) — nur 410 I lit. b /
  II tragen die 90-Tage-Frist; ehrlich offenlegen statt eine Frist erfinden.
- **Einreichung Art. 91:** Postaufgabe am letzten Tag genügt; bei
  Inhaftierten Übergabe an Anstaltsleitung; elektronisch Quittungszeitpunkt
  — als Hinweis, nicht als Rechenfaktor.

### 7) Aufwand & Wiederverwendung
**Aufwand: M.** Engine `stpoFristen.ts` analog `zpoFristen.ts`, aber dünn:
nutzt `fristenEngine` + `OHNE_STILLSTAND` + `zpoFeiertage`. **Achtung
§1/§6:** kein Refactoring von `zpoFristen` zur Fusion — eigener
Anknüpfungspunkt = eigene Engine. UI: bestehendes Fristen-Form-Muster
(`ZpoFristenForm` als Vorbild). Mapping Rechtsmittel→Frist als kleine
verifizierte Tabelle (354/396/399/411 + 94).

---

## RECHNER 4 — Haftfristen (StPO Art. 224–229, Rev. 1.1.2024)

### 1) Nutzerfrage
«Welche Fristen gelten in der Untersuchungs-/Sicherheitshaft? Bis wann muss
die StA den Haftantrag stellen, bis wann entscheidet das ZMG, wann ist
Haftverlängerung/-entlassung zu beantragen?»

### 2) Normbasis (Cache /tmp/stpo.html, Stand 1.1.2024)

**Art. 224 Abs. 2 — Haftantrag StA:** befragt unverzüglich; bei bestätigtem
Tatverdacht/Haftgründen beantragt sie dem ZMG U-Haft/Ersatzmassnahme
«unverzüglich, **spätestens aber innert 48 Stunden seit der Festnahme**»
(schriftlich, kurz begründet, wesentliche Akten).

**Art. 226 Abs. 1 — ZMG-Entscheid:** «entscheidet unverzüglich, **spätestens
aber innert 48 Stunden nach Eingang des Antrags**.» (→ Kaskade **48h
Festnahme→Antrag + 48h Antrag→Entscheid**.) Abs. 4: ZMG kann Höchstdauer
festlegen / Untersuchungshandlungen anweisen / Ersatzmassnahmen.

**Art. 227 — Haftverlängerungsgesuch:** Abs. 1: bei Ablauf der vom ZMG
gesetzten Dauer; hat das ZMG keine Dauer beschränkt, Gesuch **vor Ablauf von
3 Monaten Haft**. Abs. 2: StA reicht Gesuch **spätestens 4 Tage vor Ablauf**
ein. Abs. 3: beschuldigte Person Stellungnahme **innert 3 Tagen**. Abs. 5:
ZMG entscheidet **innert 5 Tagen** nach Eingang Stellungnahme/Fristablauf.
Abs. 7: Verlängerung **jeweils längstens 3 Monate, in Ausnahmefällen
längstens 6 Monate**.

**Art. 228 — Haftentlassungsgesuch:** Abs. 1 jederzeit schriftlich/mündlich
zu Protokoll, kurz begründet. Abs. 2: StA leitet (wenn sie nicht entspricht)
**spätestens 3 Tage nach Eingang** mit Stellungnahme ans ZMG weiter. Abs. 3:
beschuldigte Person Replik **innert 3 Tagen**. Abs. 4: ZMG entscheidet
**innert 5 Tagen** nach Replik/Fristablauf. Abs. 5: ZMG kann **Sperrfrist
längstens 1 Monat** für neue Gesuche setzen.

**Art. 229 — Sicherheitshaft:** auf schriftliches StA-Gesuch; nach
Anklageerhebung führt das erstinstanzliche Gericht sinngemäss ein
Haftverfahren (Verweise: ohne Vor-Haft → Art. 225/226; mit Vor-Haft →
Art. 227). **Art. 230:** Entlassung aus Sicherheitshaft im erstinstanzlichen
Verfahren.

**Revisionsbefund 1.1.2024:** Art. 225 trägt die Revisionsfussnote (BG
17.6.2022, in Kraft 1.1.2024 — schriftliches Verfahren bei Verzicht auf
Verhandlung). Die **Fristen 48h/3 Mt./4 T./3 T./5 T./1 Mt. sind im
Cache-Stand 20240101 so abgebildet** und gegenüber der Erstfassung in der
Struktur stabil; **V-2/V-3** zur exakten Berechnungsmethode der 48h-Kaskade
und der 6-Monats-Ausnahme.

### 3) Regelwerk-Skizze
Eingaben: Phase (U-Haft Anordnung | Verlängerung | Entlassungsgesuch |
Sicherheitshaft) · Festnahme-/Eingangs-Datum-Uhrzeit (für 48h) ·
Haftbeginn/letzter ZMG-Entscheid (für 3-Mt.-Lauf). Regeln: Stundenfristen
(48h+48h) als **Stunden**-Arithmetik (nicht Werktage!); Tagesfristen
(4/3/5 T., 3-Mt.) — **StPO Art. 90 mit Art. 89 (keine Ferien)**, Werktagsregel
am Ende. Ausgaben: Frist-Übersicht/«Countdown» je Phase, kritische Fristen
markiert.

### 4) §2-Beurteilung
**§2-rein für die Fristberechnung.** Heikel: 48h sind **Stunden**, keine
Tage — separate Arithmetik, **nicht** `fristenEngine` (die rechnet in
Tagen). Ob Sa/So/Feiertag die 48h-Frist beeinflussen: **[zu verifizieren]**
(h.M.: Stundenfrist läuft durch; Art. 90 Abs. 2 Werktagsregel gilt für
Tagesfristen). Die 6-Monats-Ausnahme (227 Abs. 7) ist Ermessen → als Option/
Warnung, nicht automatisch.

### 5) Datenbedarf
Feiertage (`zpoFeiertage`) nur für die Tagesfristen. Behördentyp ZMG je
Kanton — Namen variieren (Art. 14 Organisationshoheit, vgl.
`stpo-zustaendigkeit-regelwerk.md` Art. 14); ggf. aus Stammdaten, sonst
generisch «Zwangsmassnahmengericht».

### 6) Fallstricke
- **Zwei verschiedene Zeiteinheiten** (Stunden vs. Tage) — nicht vermischen.
- **48h+48h-Kaskade:** zwei Fristen mit zwei Auslösern (Festnahme;
  Antragseingang) — Praxis-Verständnis [V-3].
- **3-Monats-Lauf** (227 Abs. 1): ab Haftbeginn, wenn ZMG keine Dauer
  setzte; sonst ab gesetzter Dauer — Eingabe-Weiche.
- **6-Monats-Ausnahme** (227 Abs. 7): Ermessen — kein Automatik-Datum.
- **Revision 2024** beachten (Art. 225 schriftliches Verfahren) — wirkt auf
  Verfahrensbeschrieb, nicht auf die Fristzahlen.
- Sehr kurze, kritische Fristen → in der UI unmissverständlich als
  «Orientierung, keine Rechtsberatung» kennzeichnen (§8).

### 7) Aufwand & Wiederverwendung
**Aufwand: M–L.** Engine `haftfristen.ts`: Tagesfristen über `fristenEngine`/
`OHNE_STILLSTAND`, **Stundenfristen eigene Hilfsfunktion**. UI eher
Übersichts-/Countdown-Darstellung als klassischer Einzelfrist-Rechner.
Behörden-Stammdaten ggf. aus `staatsanwaltschaften.ts`-Muster (ZMG-Liste
fehlt noch → Datenlücke).

---

## RECHNER 5 — Örtliche Zuständigkeit Strafverfahren [LIVE — nur Lücken]

Bereits gebaut: `src/lib/strafZustaendigkeit.ts` (Decision-Tree Art. 31–42
StPO, Forum/Kaskade/Beteiligung/Tatmehrheit, Bundesgerichtsbarkeit 23/24,
Behördentyp 16/17/357), gespeist aus `staatsanwaltschaften.ts` (26 Kt. +
BA) und `bibliothek/normen/stpo-zustaendigkeit-regelwerk.md` (13/13 Proben ✓).

**Identifizierte Lücken (Empfehlung):**
- **ZMG-Stammdaten fehlen** (Behördennamen/-adressen je Kanton) — für
  Rechner 4 nötig; aktuell nur StA erfasst.
- **Übertretungsstrafbehörden** (Art. 17) je Kanton: im Behörden-Dossier
  vorhanden (`strafbehoerden-kantone.md`), aber nicht als eigene
  Code-Stammdaten ausgewiesen — für korrekte Behördennennung bei
  Übertretungen relevant.
- **Sachliche Zuständigkeit** (Einzelgericht-Schwelle Art. 19 Abs. 2, Rev.
  2024) im Engine-Output nicht abgebildet — optionaler Ausbau.
- Sonst keine Lücke erkennbar; die Engine ist vertieft (Oberholzer 2026).

---

## VORLAGEN

Plattform vorhanden (`assemble(schema, antworten)` rein/deterministisch;
Renderer PDF+DOCX+Text aus EINER Quelle; Wizard-Rahmen). Eine neue Vorlage
liefert nur Schema + Schritte + Gates (STRUKTUR.md). Form bestimmt
Exportformat (§8).

### V-A · Strafanzeige (Art. 301 StPO)
**Nutzerfrage:** «Wie zeige ich eine Straftat formgerecht an?»
**Norm (Cache):** Art. 301 Abs. 1: jede Person, schriftlich oder mündlich
bei einer Strafverfolgungsbehörde; Abs. 1bis Protokoll-Bestätigung; Abs. 3:
ohne Geschädigten-/Privatkläger-Stellung **keine weitergehenden
Verfahrensrechte**. **§2/§8:** formfrei → schriftliche Vorlage zulässig
(PDF+DOCX). Inhalt: Anzeigeerstatter, Sachverhalt, Beteiligte, Beweismittel,
Antrag auf Mitteilung (Abs. 2). **Aufwand: S.** Wiederverwendung:
Vorlagen-Engine + Behördenwahl über `staatsanwaltschaften.ts` (analog
Schlichtungs-Behördenwahl). Verknüpfung mit Rechner 5 (Forum-CTA).

### V-B · Strafantrag (Art. 30/31 StGB, Art. 304 StPO)
**Norm (Cache):** Art. 304 Abs. 1 schriftlich oder mündlich zu Protokoll;
ausdrücklicher Bestrafungswille (Art. 30 «die Bestrafung … beantragen»);
3-Mt.-Frist (Art. 31, → Rechner 2). **§2/§8:** schriftlich zulässig
(PDF+DOCX); Gate: Antragsberechtigung (Art. 30) + Fristhinweis. **Aufwand: S.**
Wiederverwendung wie V-A; **Datum-Vorberechnung aus Rechner 2 prefillbar**.

### V-C · Einsprache Strafbefehl (Art. 354–356 StPO)
**Norm (Cache):** Art. 354 Abs. 1 «innert 10 Tagen schriftlich» bei der StA;
Abs. 2: Einsprache der **beschuldigten Person braucht keine Begründung**
(andere schon); Abs. 3 Rechtskraft ohne Einsprache; Folgen 355/356
(Rückzugsfiktionen bei Säumnis). **§2/§8:** Schriftform zwingend → PDF+DOCX;
**Gate Frist 10 Tage** (→ Rechner 3 prefillbar); Adressat = StA des
Strafbefehls. **Aufwand: S–M.** Wiederverwendung: Vorlagen-Engine +
Fristprüfung; Warnhinweis Rückzugsfiktion bei Fernbleiben.

### V-D · Akteneinsichtsgesuch (Art. 101/102/107 StPO)
**Norm (Cache):** Art. 101 Abs. 1 Parteien «spätestens nach der ersten
Einvernahme … und der Erhebung der übrigen wichtigsten Beweise» (Vorbehalt
108); Abs. 2/3 andere Behörden/Dritte mit Interesse. Art. 102: VL
entscheidet; Einsicht am Sitz, Rechtsbeiständen i. d. R. Zustellung; Kopien
gegen Gebühr. Art. 107 Abs. 1 lit. a: Akteneinsicht als Teilgehalt des
rechtlichen Gehörs. **§2/§8:** Schriftform sinnvoll → PDF+DOCX; Gate
Parteistellung. **Aufwand: S.** Wiederverwendung: Vorlagen-Engine; Verweis
auf Einschränkungen Art. 108 als Warnung.

### V-E · Entschädigungs-/Genugtuungsbegehren [GERÜST] (Art. 429 ff. StPO)
**Norm (Cache):** Art. 429 Abs. 1: bei Freispruch/Einstellung Anspruch auf
a) Entschädigung Aufwendungen (Anwaltstarif), b) wirtschaftliche Einbussen,
c) **Genugtuung** bei besonders schwerer Verletzung der persönlichen
Verhältnisse (insb. Freiheitsentzug). Abs. 2: Prüfung von Amtes wegen;
Aufforderung zur Bezifferung/Belegung. **§2-Beurteilung: NUR GERÜST** —
Höhe ist **Ermessen** (Tagespauschalen Genugtuung sind richterlich/
praxisgeprägt, keine feste Rechenregel) → strukturierte Eingabe-Hilfe
(Haftdauer, Aufwand, Einbussen) + Textgerüst, **keine Betragsberechnung**.
**Aufwand: M.** Wiederverwendung: Vorlagen-Engine; Anwaltstarif-Dossier
(`kosten/anwaltstarife-kantone.md`) als Hinweis, nicht als Automatik.

### V-F · Adhäsionsklage / Zivilklage im Strafverfahren [GERÜST] (Art. 122 ff.)
**Norm (Cache):** Art. 122 Abs. 1: geschädigte Person macht Zivilansprüche
adhäsionsweise als Privatklägerschaft geltend; Abs. 3 Rechtshängigkeit mit
Erklärung (Art. 119 Abs. 2 lit. b). Art. 123: Forderung **nach Möglichkeit
beziffern** + kurz begründen (Beweismittel); Bezifferung/Begründung innert
der von der VL nach Art. 331 Abs. 2 gesetzten Frist (Fassung 1.1.2024).
**§2-Beurteilung: NUR GERÜST** — Schadensbezifferung = Tatfrage → strukturierte
Erfassung der Posten + Textgerüst, keine Schadensberechnung. **Aufwand: M.**
Wiederverwendung: Vorlagen-Engine; Bezug zur Privatkläger-Konstituierung
(Art. 118 f., bereits in `strafZustaendigkeit.ts`-Fahrplan erwähnt).

---

## Priorisierte Bau-Reihenfolge (Empfehlung)

1. **Rechner 3 — StPO-Verfahrensfristen** (höchster Nutzen, §2-rein, kleinste
   neue Logik; nutzt `fristenEngine`+`OHNE_STILLSTAND`; kritisch: Einsprache
   10 Tage). Aufwand M.
2. **Vorlage V-C Einsprache Strafbefehl** (häufigster Realfall; koppelt an
   Rechner 3; Schriftform → PDF+DOCX). Aufwand S–M.
3. **Rechner 2 — Strafantragsfrist** + **Vorlage V-B Strafantrag** (klein,
   §2-rein, prefill-koppelbar; Norm bereits in Engine verifiziert). Aufwand S.
4. **Vorlage V-A Strafanzeige** + **V-D Akteneinsicht** (formfrei/einfach,
   Behördenwahl wiederverwendbar). Aufwand S.
5. **Rechner 1 — Strafrechtliche Verjährung** (Strafrahmen-als-Eingabe-Modell;
   eigene Engine; Übergangs-/lex-mitior-Warnungen sauber). Aufwand M.
6. **Rechner 4 — Haftfristen** (Stunden+Tage; ZMG-Stammdaten-Lücke schliessen;
   Revision-2024-Hinweise). Aufwand M–L.
7. **Gerüst-Vorlagen V-E / V-F** (Ermessen/Tatfrage → bewusst zuletzt, nur
   strukturiertes Gerüst, kein Rechenversprechen). Aufwand je M.

**Wiederverwendungs-Karte:** `fristenEngine`+`OHNE_STILLSTAND` (R3/R4 Tage —
**nie** mit Stillstand!) · `zpoFeiertage` (R3/R4) · `datumsUtils` (R1/R2) ·
`strafZustaendigkeit.ts`+`staatsanwaltschaften.ts` (Forum/Behörde für
Vorlagen-Adressat) · Vorlagen-Engine + Wizard-Rahmen (alle Vorlagen).
**Eigene Engines (keine Fusion, §1/§4):** `strafverjaehrung.ts`,
`stpoFristen.ts`, `haftfristen.ts` — der StGB-Verjährungs-Mechanismus
(kein Ruhen/Unterbrechung) und der StPO-Kantons-Anknüpfungspunkt (Partei
statt Gericht) vertragen keine Wiederverwendung von `verjaehrung.ts` bzw.
`zpoFristen.ts`.
