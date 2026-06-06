# Strafbefehlsverfahren (Art. 352–357 StPO) — Recherche-Dossier

**Erstellt:** 6.6.2026 · **Autor:** Recherche-Agent (Auftrag David)
**Zweck:** Grundlage für (a) einen Wegweiser/Checklisten-Baustein, (b) die Vorlage
«Einsprache gegen Strafbefehl» (geplante Karte `einsprache` in `startseiteConfig.ts`,
Status `geplant`) und (c) die Verzahnung mit den Fristen-/Rechtsmittel-Engines.

**Wortlaut-Quellen:**
- **StPO** SR 312.0 — Cache `/tmp/stpo.html`, konsolidierte Fassung **«Stand am
  1. Januar 2024»** (ELI `cc/2010/267`, Konsolidierung `20240101`). Anker
  `id="art_X"` (Art. 352a → `art_352_a`). Abrufdatum 6.6.2026, Wortlaute verbatim
  am Cache extrahiert.

**Status: Arbeitsgrundlage — NICHT fachlich abgenommen (CLAUDE.md §7/§8).** Alle
Normtext-Kerne sind verbatim am Cache verifiziert. BGE-/EGMR-Leitlinien sind als
**[zu verifizieren]** markiert (kein Rechtsprechungs-Cache; per WebSearch
6.6.2026 lokalisiert, nicht aus Primärquelle gegengeprüft). **Keine Repo-Datei
geändert ausser diesem Dossier.**

**Quellenlage (eine Zeile):** Art. 352–357 StPO und die Zustell-Regeln (Art. 85,
87, 88) sind am Cache (Stand 1.1.2024) vollständig erfasst; die StPO-Revision
1.1.2024 betrifft das Strafbefehlsverfahren **textlich** an drei Stellen — **Art.
352a NEU** (Einvernahmepflicht bei zu verbüssender Freiheitsstrafe), **Art. 353
Abs. 2/3** (Zivilforderungen mit Streitwertgrenze CHF 30 000; neue Eröffnungsregel
Abs. 3) und **Art. 354 lit. abis / Abs. 1bis** (Einsprache der Privatklägerschaft,
ohne Sanktionsanfechtung).

**Vorarbeiten, auf die dieses Dossier aufbaut (statt zu duplizieren):**
- `bibliothek/recherche/stpo-rechtsmittel.md` **TEIL 2** (Einsprache 354–356 im
  Rechtsmittelsystem; Abgrenzung Einsprache ↔ Beschwerde/Berufung) und **TEIL 5**
  (Fristen-Preset-Tabelle, u. a. `einsprache_strafbefehl`). Hier NICHT erneut
  hergeleitet — referenziert.
- `bibliothek/recherche/strafrecht-cluster.md` **RECHNER 3** (StPO-Fristmechanik
  Art. 89/90/94, `OHNE_STILLSTAND`, Kantons-Anknüpfung = Partei-Wohnsitz) und
  **VORLAGE V-C** (Erstskizze Einsprache). Fristarithmetik dort, hier nur Trigger.
- `src/lib/strafRechtsmittel.ts` — **frisch gebaute** Engine
  `bestimmeStrafRechtsmittel`, **Einsprache-Zweig** (`case 'strafbefehl'`,
  Z. 135–154): liefert bereits Einsprachefrist, Begründungspflicht-Weiche,
  Rückzugsfiktion-Warnung, kein-Devolutiveffekt-Hinweis. Die Vorlage baut **darauf
  auf** (Wiederverwendung, nicht Duplikat).
- `src/lib/strafZustaendigkeit.ts` — Output-Vokabular `StrafNorm`/`StrafSchritt`/
  `StrafFrist`; `staatsanwaltschaften.ts`-Anbindung als Behörden-Datenschicht-Muster.
- `src/lib/vorlagen/engine.ts` (`assemble`, `VorlageSchema`/`Baustein`/`includeIf`),
  `src/data/staatsanwaltschaften.ts` (26 Kt., `Staatsanwaltschaft`-Record),
  `src/lib/vorlagen/schlichtungsgesuchBs.ts` als **Bauform-Vorbild** (Eingabe →
  PDF+DOCX, Behörden-Block, deterministische Bausteine).

**Verifikations-TODOs (Sammlung, vor `verified:true`/Deploy):**
- **V-0 (Stand nach 1.1.2024):** Cache ist 20240101. WebSearch 6.6.2026 bestätigt
  die drei Revisionspunkte (352a, 353, 354) als per 1.1.2024 in Kraft (AS 2023
  468); **keine** spätere in Kraft getretene Teilrevision der Art. 352–357 bis
  Juni 2026 gefunden. Dennoch vor Deploy gegen Fedlex-Aktualstand prüfen.
- **V-1 (Art. 352a — Reichweite «zu verbüssende Freiheitsstrafe»):** Einvernahme
  nur bei **zu VERBÜSSENDER** (= unbedingter/teilbedingter vollziehbarer) FS,
  nicht bei jeder Geldstrafe/Busse. Auslegungsfragen (bedingte FS? Widerruf? FS
  durch Umwandlung?) in Lehre umstritten — vor Engine-Übernahme h.M. prüfen.
  Quelle: forumpoenale «Die Einvernahmepflicht nach Art. 352a StPO – Auslegeordnung».
  **[zu verifizieren]**
- **V-2 (Rückzugsfiktion 355 Abs. 2 / 356 Abs. 4):** BGE 140 IV 82 (und 6B_152/2013):
  Die Fiktion gilt nur **verfassungskonform** als **widerlegbare Vermutung** —
  Rückzug nur, wenn die Person tatsächliche Kenntnis von Termin/Erscheinungspflicht
  UND den Säumnisfolgen hatte und in Kenntnis der Rechtslage auf Rechtsschutz
  verzichtet. Restriktive Auslegung. Vor Übernahme h.M./neuere BGE prüfen.
  **[zu verifizieren]**
- **V-3 (Zustellfiktion Art. 85 Abs. 4 lit. a):** 7-Tage-Fiktion bei nicht
  abgeholter eingeschriebener Sendung — Voraussetzung «sofern die Person mit einer
  Zustellung rechnen musste» (Prozessrechtsverhältnis). Genaues Verhältnis zur
  ZPO-Zustellfiktion und zur Fristberechnung am Cache abgesichert; BGE zur
  «Rechnen-Müssen»-Schwelle (laufendes Verfahren) als Praxis-Hinweis. **[zu verif.]**
- **V-4 (Übersetzung/Dolmetsch Art. 68; EGMR):** Strafbefehl in nicht verstandener
  Sprache + Zustellfiktion = Praxis-Fallstrick; EGMR-Bezug (faires Verfahren) nur
  als Warnhinweis, kein Automatismus. **[zu verifizieren]**

---

## 1 · VORAUSSETZUNGEN (Art. 352, Art. 352a NEU)

**Art. 352 — Voraussetzungen** (verbatim, Cache):
> «¹ Hat die beschuldigte Person im Vorverfahren den **Sachverhalt eingestanden**
> oder ist dieser **anderweitig ausreichend geklärt**, so erlässt die Staats-
> anwaltschaft einen Strafbefehl, wenn sie, **unter Einrechnung einer allfällig zu
> widerrufenden bedingten Strafe oder bedingten Entlassung**, eine der folgenden
> Strafen für ausreichend hält: a. eine **Busse**; b. eine **Geldstrafe von
> höchstens 180 Tagessätzen**; c. … [lit. c **aufgehoben** per 1.1.2018, Sanktionen-
> rechtsrevision]; d. eine **Freiheitsstrafe von höchstens 6 Monaten**.
> ² Jede dieser Strafen kann mit einer **Massnahme nach den Artikeln 66 und 67e–73
> StGB** verbunden werden. ³ Strafen nach Absatz 1 **Buchstaben b–d können
> miteinander verbunden werden, sofern die insgesamt ausgesprochene Strafe einer
> Freiheitsstrafe von höchstens 6 Monaten entspricht. Eine Verbindung mit Busse ist
> immer möglich.»**

**Befunde (§2-relevant):**
- **Sanktionsgrenzen wörtlich:** Busse (unbegrenzt nach Tatbestand) · Geldstrafe
  **≤ 180 Tagessätze** · Freiheitsstrafe **≤ 6 Monate**. (Anders als ein
  verbreiteter Laienirrtum: Freiheitsstrafe IST im Strafbefehl möglich, aber nur
  bis 6 Monate.) Die alte **lit. c (gemeinnützige Arbeit) ist seit 1.1.2018
  aufgehoben** — nicht mehr aufführen.
- **Kombinationsregel (Abs. 3):** Geldstrafe + FS (+ ggf. Massnahme) nur, wenn die
  **Gesamtstrafe ≤ 6 Monate FS-Äquivalent**; **Verbindung mit Busse immer möglich**.
- **«Unter Einrechnung» (Abs. 1):** Ein zu widerrufender bedingter Strafrest /
  bedingte Entlassung zählt **mit** in die 6-Monats-/180-TS-Grenze.
- **Verhältnis Geständnis / ausreichend geklärt:** **alternativ** («eingestanden
  ODER anderweitig ausreichend geklärt»). Ein Geständnis ist **keine zwingende
  Voraussetzung**; genügt eine ausreichend erstellte Beweislage. → Engine/UI:
  **kein** Geständnis-Gate, aber Hinweis, dass der Sachverhalt erstellt sein muss.

**Art. 352a — Einvernahme (NEU, eingefügt durch BG vom 17. Juni 2022, in Kraft seit
1.1.2024; AS 2023 468)** (verbatim, Cache):
> «Ist zu erwarten, dass der Strafbefehl eine **zu verbüssende Freiheitsstrafe** zur
> Folge hat, so führt die Staatsanwaltschaft eine **Einvernahme** der beschuldigten
> Person durch.»

**Befund:** **Anwesenheits-/Einvernahmepflicht** ab Erwartung einer **zu
verbüssenden** (vollziehbaren) Freiheitsstrafe — Reaktion auf die EGMR-/Gehörs-
Kritik am Strafbefehlsverfahren. **Nur** bei zu verbüssender FS, nicht bei
Geldstrafe/Busse oder rein bedingter FS (Reichweite umstritten → **V-1**). Für die
UI: Warnhinweis «Bei (drohender) unbedingter Freiheitsstrafe ist die persönliche
Einvernahme zwingend (Art. 352a StPO)» — relevant als Gültigkeitsmangel-Argument
in der Einsprache.

---

## 2 · INHALT / FORM / ERÖFFNUNG des Strafbefehls (Art. 353)

**Art. 353 — Inhalt und Eröffnung** (verbatim, Cache):
> «¹ Der Strafbefehl enthält: a. die **Bezeichnung der verfügenden Behörde**;
> b. die **Bezeichnung der beschuldigten Person**; c. den **Sachverhalt**, welcher
> der beschuldigten Person zur Last gelegt wird; d. die dadurch erfüllten **Straf-
> tatbestände**; e. die **Sanktion**; f. den kurz begründeten **Widerruf** einer
> bedingt ausgesprochenen Sanktion oder einer bedingten Entlassung; fbis. die
> **Löschfrist für ein allfällig bestehendes DNA-Profil** [eingefügt 1.8.2023];
> g. die **Kosten- und Entschädigungsfolgen**; h. die Bezeichnung **beschlag-
> nahmter Gegenstände und Vermögenswerte**, die freigegeben oder eingezogen werden;
> i. den **Hinweis auf die Möglichkeit der Einsprache und die Folgen einer
> unterbliebenen Einsprache**; j. **Ort und Datum** der Ausstellung; k. die
> **Unterschrift** der ausstellenden Person.
> ² Die Staatsanwaltschaft kann im Strafbefehlsverfahren über **Zivilforderungen**
> entscheiden, soweit diese von der beschuldigten Person **anerkannt** sind oder
> sofern: a. deren **Beurteilung ohne weitere Beweiserhebungen möglich** ist; und
> b. der **Streitwert 30 000 Franken nicht übersteigt**. [Fassung 1.1.2024]
> ³ Der Strafbefehl wird den Personen und Behörden, die **zur Einsprache befugt**
> sind, **unverzüglich schriftlich eröffnet**.» [Fassung 1.1.2024]

**Befunde:**
- **Pflichtangaben-Katalog lit. a–k** (plus fbis) — vollständig; **lit. i** (Hinweis
  auf Einsprache + Folgen) ist die **Rechtsmittelbelehrung**; fehlt sie/ist sie
  falsch, kann das (verfassungskonform) gegen die Zustellfiktion/Rechtskraft
  sprechen → Praxis-Argument (Teil 7).
- **Zivilforderungen Abs. 2 (rev. 1.1.2024):** Entscheid nur bei **Anerkennung**
  durch die beschuldigte Person ODER (kumulativ a + b) **liquide** Beurteilung
  ohne weitere Beweise UND **Streitwert ≤ CHF 30 000**. Sonst Verweis auf den
  Zivilweg. → Engine/Vorlage: Zivilpunkt-Anfechtung nur in diesen Grenzen relevant.
- **Eröffnung Abs. 3:** **schriftlich**, **unverzüglich**, an die **Einsprache-
  befugten** (= beschuldigte Person, Privatklägerschaft, weitere Betroffene, ggf.
  Ober-/Generalstaatsanwaltschaft, vgl. Art. 354).

**Zustellung (Art. 85–88) — eigene StPO-Regel, NICHT die ZPO-Fiktion:**

**Art. 85 — Form / Zustellung** (verbatim, Auszug):
> «² Die Zustellung erfolgt durch **eingeschriebene Postsendung** oder auf andere
> Weise gegen Empfangsbestätigung … ³ Sie ist erfolgt, wenn die Sendung von der
> Adressatin/dem Adressaten oder von einer angestellten oder im gleichen Haushalt
> lebenden, mindestens 16 Jahre alten Person **entgegengenommen** wurde. … ⁴ Sie
> gilt **zudem als erfolgt: a.** bei einer eingeschriebenen Postsendung, die **nicht
> abgeholt** worden ist: **am siebten Tag nach dem erfolglosen Zustellungsversuch,
> sofern die Person mit einer Zustellung rechnen musste**; b. bei persönlicher
> Zustellung, wenn die Annahme verweigert wird …: am Tag der Weigerung.»

**Art. 87 Abs. 3:** Zustellung an die Partei mit Rechtsbeistand erfolgt **rechts-
gültig an den Rechtsbeistand**. **Art. 88 Abs. 4:** «**Einstellungsverfügungen und
Strafbefehle gelten auch ohne Veröffentlichung als zugestellt.**»

**Befund / Verzahnung (V-3):** Die **7-Tage-Zustellfiktion** (Art. 85 Abs. 4 lit. a)
ist die **StPO-eigene** Regel — sie ist **als Bauform** vergleichbar mit
`zustellfiktion()` in `zpoFristen`, aber **eigenständig** (eigener Wortlaut,
Voraussetzung «mit Zustellung rechnen musste»). **Nicht fusionieren** (§1/§4): Der
Fristrechner für die Einsprache muss als **Trigger** wahlweise die *tatsächliche
Entgegennahme* (Abs. 3) oder die *7-Tage-Fiktion* (Abs. 4) anbieten — als
Eingabe-Weiche, nicht automatisch. Art. 88 Abs. 4 sperrt die Annahme, ein nicht
publizierter Strafbefehl sei «nie zugestellt».

---

## 3 · EINSPRACHE (Art. 354)

**Art. 354 — Einsprache** (verbatim, Fassung 1.1.2024, Cache):
> «¹ Gegen den Strafbefehl können bei der **Staatsanwaltschaft** innert **10 Tagen
> schriftlich** Einsprache erheben: a. die **beschuldigte Person**; abis. die
> **Privatklägerschaft**; b. **weitere Betroffene**; c. soweit vorgesehen die
> **Ober- oder Generalstaatsanwaltschaft** des Bundes oder des betreffenden Kantons
> im jeweiligen eidgenössischen oder kantonalen Verfahren.
> 1bis Die **Privatklägerschaft kann einen Strafbefehl hinsichtlich der
> ausgesprochenen Sanktion nicht anfechten.** [eingefügt 1.1.2024]
> ² Die Einsprachen sind **zu begründen; ausgenommen ist die Einsprache der
> beschuldigten Person.** ³ Ohne gültige Einsprache wird der Strafbefehl zum
> **rechtskräftigen Urteil.**»

**Befunde:**
- **Legitimierte (Abs. 1 lit. a–c + abis):** beschuldigte Person · Privatkläger-
  schaft (NEU 2024) · weitere Betroffene · Ober-/Generalstaatsanwaltschaft (soweit
  vorgesehen).
- **Frist 10 Tage, schriftlich**, **bei der Staatsanwaltschaft** (kein
  Devolutiveffekt; die StA bleibt zunächst Herrin des Verfahrens).
- **Begründungspflicht-Ausnahme (Abs. 2):** **Nur die beschuldigte Person** muss
  NICHT begründen; alle übrigen schon. → Engine-Gate
  `begruendungspflicht = (legitimierter !== beschuldigte_person)` (ist in
  `strafRechtsmittel.ts` Z. 136–138 bereits umgesetzt).
- **Privatklägerschaft / Sanktion (Abs. 1bis):** Einspracherecht, aber **keine
  Anfechtung der Sanktion** (spiegelt Art. 382 Abs. 2) — Hard-Stop in der Engine
  (`strafRechtsmittel.ts` Z. 96–106).
- **Wirkung (Abs. 3):** Eine **gültige** Einsprache verhindert den Eintritt der
  Rechtskraft; **ohne** gültige Einsprache wird der Strafbefehl zum
  **rechtskräftigen Urteil**. (Keine «aufschiebende Wirkung» im technischen Sinn —
  der Strafbefehl wird schlicht nicht rechtskräftig.)

---

## 4 · VERFAHREN NACH EINSPRACHE (Art. 355)

**Art. 355 — Verfahren bei Einsprache** (verbatim, Cache):
> «¹ Wird Einsprache erhoben, so **nimmt die Staatsanwaltschaft die weiteren
> Beweise ab**, die zur Beurteilung der Einsprache erforderlich sind. ² Bleibt eine
> Einsprache erhebende Person trotz Vorladung einer **Einvernahme unentschuldigt
> fern**, so gilt ihre **Einsprache als zurückgezogen.** ³ Nach Abnahme der Beweise
> **entscheidet die Staatsanwaltschaft, ob sie: a.** am Strafbefehl **festhält**;
> b. das Verfahren **einstellt**; c. einen **neuen Strafbefehl** erlässt; d.
> **Anklage** beim erstinstanzlichen Gericht erhebt.»

**Befunde:**
- **Vier Optionen der StA (Abs. 3 lit. a–d):** festhalten · einstellen · neuer
  Strafbefehl · Anklage.
- **Rückzugsfiktion (Abs. 2):** unentschuldigtes Fernbleiben von der **Einvernahme**
  → Einsprache gilt als zurückgezogen (→ Strafbefehl rechtskräftig).
- **Praxis/Verfassungskonformität (V-2) [zu verifizieren]:** BGE 140 IV 82 (und
  6B_152/2013, 28.5.2013): Die Rückzugsfiktion ist **verfassungskonform** nur als
  **widerlegbare Vermutung** zu verstehen — Rückzug nur, wenn das Gesamtverhalten
  auf einen bewussten Verzicht auf Rechtsschutz schliessen lässt und die Person
  **tatsächliche Kenntnis** von Termin, Erscheinungspflicht und Säumnisfolgen
  hatte. → UI: Warn-Pill «Rückzugsfiktion — aber Rechtsprechung restriktiv» (nicht
  als Automatik-Rechtsfolge behaupten, §8).

---

## 5 · HAUPTVERHANDLUNG / GERICHT (Art. 356)

**Art. 356 — Verfahren vor dem erstinstanzlichen Gericht** (verbatim, Cache):
> «¹ Entschliesst sich die Staatsanwaltschaft, am Strafbefehl festzuhalten, so
> überweist sie die Akten unverzüglich dem erstinstanzlichen Gericht … **Der
> Strafbefehl gilt als Anklageschrift.** ² Das erstinstanzliche Gericht entscheidet
> über die **Gültigkeit des Strafbefehls und der Einsprache.** ³ Die Einsprache
> kann **bis zum Abschluss der Parteivorträge zurückgezogen** werden. ⁴ Bleibt die
> Einsprache erhebende Person der **Hauptverhandlung unentschuldigt fern** und lässt
> sie sich auch nicht vertreten, so gilt ihre **Einsprache als zurückgezogen.**
> ⁵ Ist der Strafbefehl **ungültig**, so hebt das Gericht ihn auf und **weist den
> Fall … an die Staatsanwaltschaft zurück.** ⁶ Bezieht sich die Einsprache **nur
> auf die Kosten und Entschädigungen oder weitere Nebenfolgen**, so entscheidet das
> Gericht in einem **schriftlichen Verfahren**, es sei denn, die Einsprache erhebende
> Person verlange ausdrücklich eine Verhandlung. ⁷ Sind gegen mehrere Personen
> Strafbefehle … zum gleichen Sachverhalt erlassen worden, so ist **Artikel 392
> sinngemäss anwendbar.**»

**Befunde:**
- **Strafbefehl = Anklageschrift (Abs. 1).** Erst der nach Festhalten ergehende
  **Urteilsspruch des Gerichts** ist dann **berufungsfähig** (Art. 398) — die
  Einsprache selbst ist KEINE Berufung (Abgrenzung, s. stpo-rechtsmittel.md Teil 2).
- **Gültigkeitsprüfung (Abs. 2/5):** Gericht prüft Gültigkeit von **Strafbefehl
  UND Einsprache**; ungültiger Strafbefehl → Aufhebung + Rückweisung an die StA.
- **Rückzugsfiktion HV (Abs. 4):** unentschuldigtes Fernbleiben **und** keine
  Vertretung → Einsprache gilt als zurückgezogen (gleiche Praxis-Restriktion wie
  Abs. 355 II, BGE 140 IV 82, V-2).
- **Übertretungen / Nebenfolgen (Abs. 6):** Bei Einsprache **nur** zu Kosten/
  Entschädigungen/Nebenfolgen → **schriftliches Verfahren** (ausser ausdrückliches
  Verlangen einer Verhandlung). (Es gibt keinen eigenen «Abs. zu Übertretungen» im
  Sinn der Auftragsfrage — Übertretungen laufen über Art. 357.)

---

## 6 · ÜBERTRETUNGSSTRAFVERFAHREN (Art. 357)

**Art. 357 — Übertretungsstrafverfahren** (verbatim, Cache):
> «¹ Die zur Verfolgung und Beurteilung von **Übertretungen eingesetzten
> Verwaltungsbehörden** haben die **Befugnisse der Staatsanwaltschaft.** ² Das
> Verfahren richtet sich **sinngemäss nach den Vorschriften über das Strafbefehls-
> verfahren.** ³ Ist der Übertretungstatbestand nicht erfüllt, so stellt die
> Übertretungsstrafbehörde das Verfahren mit einer kurz begründeten Verfügung ein.
> ⁴ Ist der … Sachverhalt … als Verbrechen oder Vergehen strafbar, so überweist sie
> den Fall der Staatsanwaltschaft.»

**Befund:** **Sinngemässe Geltung** des Strafbefehlsverfahrens → gegen den
**Übertretungs-Strafbefehl** der Übertretungsstrafbehörde besteht ebenfalls die
**Einsprache** (10 Tage, Art. 354 i. V. m. 357 Abs. 2). Adressat ist dann die
**Übertretungsstrafbehörde** (kantonal unterschiedlich; Art. 17 StPO). → Vorlage:
Behördenfeld muss auch «Übertretungsstrafbehörde» zulassen (vgl.
`strafZustaendigkeit.ts` behoerdeTyp; ZMG-/Übertretungsbehörden-Stammdaten sind
laut `strafrecht-cluster.md` R5 noch eine Datenlücke → manuelle Eingabe als
Fallback).

---

## 7 · PRAXIS-KRITIK & FALLSTRICKE (für UI-Warnungen, §8)

1. **Zustellfiktions-Falle (Art. 85 Abs. 4 lit. a):** Die 10-Tage-Frist läuft **auch
   bei Nichtabholung** der eingeschriebenen Sendung — am **7. Tag nach dem
   erfolglosen Zustellungsversuch** beginnt die Frist zu laufen (sofern man mit
   Zustellung rechnen musste). Häufigster Fristverlust. → prominente UI-Warnung;
   im Fristrechner als Trigger-Weiche (Entgegennahme vs. 7-Tage-Fiktion). [V-3]
2. **Rückzugsfiktionen (Art. 355 II / 356 IV):** Fernbleiben von Einvernahme/HV →
   Einsprache «weg», Strafbefehl rechtskräftig. Aber Rechtsprechung restriktiv
   (widerlegbare Vermutung, Kenntnis-Erfordernis, BGE 140 IV 82). [V-2]
3. **Dolmetsch/Übersetzung (Art. 68; EGMR):** Strafbefehl in nicht verstandener
   Sprache + Zustellfiktion = Gehörsproblem; mögliches Argument gegen Rechtskraft.
   Nur als Warnhinweis, kein Automatismus. [V-4]
4. **Strafbefehl gegen Abwesende / Auslandwohnsitz (Art. 87 Abs. 2):** Pflicht zur
   Bezeichnung eines Zustellungsdomizils in der Schweiz; sonst öffentliche
   Bekanntmachung (Art. 88) — Frist läuft ab Veröffentlichung.
5. **Einvernahmepflicht bei FS (Art. 352a):** Fehlt die Einvernahme trotz zu
   verbüssender Freiheitsstrafe, ist das ein **Gültigkeitsmangel** → Argument in
   der Einsprache (Gericht prüft Gültigkeit, Art. 356 Abs. 2). [V-1]
6. **Zivilpunkt nur bei Anerkennung/liquid + ≤ CHF 30 000 (Art. 353 Abs. 2):**
   Darüber hinaus kein Zivilentscheid im Strafbefehl → Privatklägerschaft auf
   Zivilweg; Sanktionsanfechtung der Privatklägerschaft generell ausgeschlossen
   (Art. 354 Abs. 1bis).
7. **Kein Fristenstillstand (Art. 89 Abs. 2):** Die StPO kennt **keine
   Gerichtsferien** — die 10-Tage-Frist läuft auch über Ostern/Sommer/Weihnachten.
   (Verzahnung: `OHNE_STILLSTAND`, vgl. strafrecht-cluster.md R3.)

---

## 8 · VORLAGEN-SKIZZE «Einsprache gegen Strafbefehl» (Karte `einsprache`)

**Status der Karte:** existiert in `startseiteConfig.ts` (id `einsprache`, modus
`vorlage`, art `eingabe`, tier `pro`, rechtsbereich `straf`, Titel «Einsprache
(Straf-/Verwaltungsbefehl)», status `geplant`). Diese Recherche füllt sie.

**Form/§8:** **Schriftform zwingend** (Art. 354 Abs. 1) → Exportformate **PDF +
DOCX** (analog `schlichtungsgesuchBs.ts`; `ausgabeArt` wie Schlichtungsgesuch =
«eingabe»). Keine Eigenhändigkeit nötig (Schriftlichkeit genügt; Unterschrift als
Baustein).

**Bausteine (deterministisch, `assemble`):**
- **Absender** (Name/Adresse der einsprechenden Person; bei Vertretung Rechtsbeistand
  → Art. 87 Abs. 3 Hinweis).
- **Adressat = Staatsanwaltschaft** des Strafbefehls (Datenschicht
  `staatsanwaltschaften.ts`, Kantonsauswahl; Fallback freie Eingabe; bei
  Übertretung «Übertretungsstrafbehörde», Art. 357).
- **Verfahrensbezug:** Verfahrens-/Geschäftsnummer, **Datum des Strafbefehls**,
  **Datum der Zustellung/Entgegennahme** (Trigger für Fristrechner).
- **Erklärung der Einsprache** (fester Kern: «Gegen den Strafbefehl vom … erhebe
  ich hiermit innert Frist **Einsprache**.»).
- **Begründung** — `includeIf` rolle ≠ beschuldigte_person **Pflicht** (Art. 354
  Abs. 2); für die beschuldigte Person **optional** («keine Begründung nötig, aber
  möglich»).
- **Anträge / Umfang** optional (Vollumfänglich / nur Sanktion [Hinweis: für
  Privatklägerschaft gesperrt, Art. 354 Abs. 1bis] / nur Kosten-Nebenfolgen →
  Art. 356 Abs. 6 schriftliches Verfahren).
- **Beweisanträge** optional (Art. 355 Abs. 1).
- **Frist-/Zustellnachweis-Hinweis** (Track-&-Trace-Beleg empfohlen; Postaufgabe am
  letzten Tag genügt, Art. 91).
- **Ort/Datum/Unterschrift** (eigenhändig auf dem Ausdruck).

**Gates / Weichen:**
- **10-Tage-Frist-Verzahnung** (Pflicht-Gate): Trigger-Datum → `stpoFristen.ts`
  (geplant) bzw. der Einsprache-Preset (`einsprache_strafbefehl`, stpo-rechtsmittel.md
  Teil 5). Anzeige des letzten Einreichdatums + Warnung «keine Gerichtsferien».
- **Begründungspflicht-Gate** für Nicht-Beschuldigte (Art. 354 Abs. 2) —
  Logik **bereits** in `strafRechtsmittel.ts` (Einsprache-Zweig) vorhanden →
  wiederverwenden, nicht neu kodieren.
- **Privatklägerschaft-Sanktions-Stop** (Art. 354 Abs. 1bis) — ebenfalls schon in
  der Engine (Hard-Stop) abgebildet.
- **Rückzugsfiktion-Warnung** (Art. 355 II / 356 IV) als fester Disclaimer-Baustein.

**ausgabeArt:** «eingabe» (PDF+DOCX), identisch zum Schlichtungsgesuch-Muster.

---

## 9 · §2-Beurteilung · Wiederverwendung · Aufwand · Bau-Reihenfolge

**§2-Beurteilung:**
- **§2-rein:** Einsprachefrist (10 T.), Begründungspflicht-Gate, Privatkläger-
  Sanktions-Stop, Trigger-Logik, PDF/DOCX-Assemble — alles deterministisch aus den
  Eingaben.
- **Weichen/Gates (Tatfrage, §8 — NICHT automatisch):** «mit Zustellung rechnen
  müssen» (85 IV), Reichweite Art. 352a «zu verbüssende FS», Widerlegung der
  Rückzugsfiktion (140 IV 82), Liquidität/Anerkennung des Zivilpunkts (353 II),
  Gültigkeit des Strafbefehls (356 II). Diese als Ja/Nein-Hinweis an die
  fachkundige Person, kein Rechen-Automatismus.

**Wiederverwendung (KEINE Fusion, §1/§4):**
- **`strafRechtsmittel.ts` Einsprache-Zweig** (`case 'strafbefehl'`): liefert
  Einsprachefrist, Begründungs-Weiche, Rückzugsfiktion-/Devolutiv-Hinweise,
  Privatkläger-Stop. Die Vorlage ruft das Ergebnis als **Inhaltsquelle** für die
  Warn-/Frist-Bausteine ab (SSoT, §5) — Rechtsregeln nicht doppelt pflegen.
- **`fristenEngine` + `OHNE_STILLSTAND`** und **`stpoFristen.ts`** (geplant, R3)
  für das letzte Einreichdatum; Kantons-Anknüpfung = **Partei-Wohnsitz** (Art. 90
  Abs. 2), nicht Behördensitz.
- **Vorlagen-Engine** (`assemble`, `VorlageSchema`/`Baustein`/`includeIf`) +
  **Renderer** (`vorlagenPdf.ts`/`vorlagenDocx.ts`) + Wizard-Rahmen.
- **Datenschicht `staatsanwaltschaften.ts`** für den Adressat-Block (26 Kt. + BA).
  Übertretungsstrafbehörden-Stammdaten fehlen (Datenlücke, vgl. R5) → manuelle
  Eingabe als Fallback.
- **Bauform-Vorbild:** `schlichtungsgesuchBs.ts` (Behörden-Block, PDF+DOCX,
  deterministische Bausteine, `ausgabeArt`).

**Aufwand:**
- **Vorlage «Einsprache gegen Strafbefehl»:** **Aufwand S–M.** Reines
  Bausteine-Schema + Behördenwahl + Frist-/Begründungs-Gates; Rechtslogik liegt
  bereits in `strafRechtsmittel.ts`. Heikel ist nur die saubere Trigger-Weiche
  (Entgegennahme vs. 7-Tage-Fiktion) und das Begründungs-Gate.
- **Wegweiser/Checklisten-Baustein** (Voraussetzungen → Inhalt → Einsprache →
  Verfahren → Fallstricke): **Aufwand S** (Anzeige-Schicht; speist sich aus diesem
  Dossier + Engine-Output).

**Verifikations-TODOs vor Deploy:** V-0 (Aktualstand Fedlex), V-1 (352a-Reichweite),
V-2 (Rückzugsfiktion-Praxis), V-3 (Zustellfiktion «rechnen müssen»), V-4
(Übersetzung/EGMR). Norm-`verified:true` und Status «geprüft» erst nach Davids
fachlicher Abnahme (§7).

**Priorisierte Bau-Reihenfolge:**
1. **`stpoFristen.ts`** (Fundament, falls noch nicht gebaut; R3, `OHNE_STILLSTAND`,
   Partei-Kanton) — liefert den Frist-Rechner für die Einsprache.
2. **Vorlage «Einsprache gegen Strafbefehl»** (Karte `einsprache` füllen):
   Schema + Bausteine + Gates; Frist-Verzahnung an #1, Rechtslogik aus
   `strafRechtsmittel.ts` (Einsprache-Zweig), Adressat aus `staatsanwaltschaften.ts`.
3. **Wegweiser/Checklisten-Baustein** (Anzeige) als Beiwerk zur Vorlage und zum
   Straf-Rechtsmittel-Rechner.

---

## Belege / Quellen

- **Wortlaut (primär):** Fedlex-Cache `/tmp/stpo.html`, Konsolidierung 20240101
  (SR 312.0), Anker `art_352`, `art_352_a`, `art_353`, `art_354`, `art_355`,
  `art_356`, `art_357`, `art_85`, `art_87`, `art_88` — verbatim extrahiert 6.6.2026.
- **Revision 1.1.2024 (BG vom 17.6.2022, AS 2023 468, BBl 2019 6697):** im Cache
  belegte Fussnoten zu Art. 352a (eingefügt), Art. 353 Abs. 2/3 (Fassung), Art. 354
  lit. abis / Abs. 1bis (eingefügt). Art. 353 fbis (DNA-Löschfrist) eingefügt durch
  BG vom 17.12.2021 (AS 2023 309), in Kraft 1.8.2023. Art. 352 lit. c aufgehoben
  per 1.1.2018 (Sanktionenrechtsrevision, AS 2016 1249).
- **WebSearch 6.6.2026 [zu verifizieren]:** Art. 352a Einvernahmepflicht (forumpoenale
  «Die Einvernahmepflicht nach Art. 352a StPO – eine Auslegeordnung»; Kellerhals-
  Carrard / Wehrenberg Newsletter zur StPO-Revision); Rückzugsfiktion als
  widerlegbare Vermutung (BGE 140 IV 82; 6B_152/2013; strafprozess.ch «Von der
  Rückzugsfiktion zur widerlegbaren Vermutung»). Nicht aus Primärquelle gegengeprüft.

**Hinweis zur Belastbarkeit (§7/§8):** Alle Normtext-Kerne sind verbatim am Cache.
Mehrere Punkte (Zustellfiktion-Voraussetzung, 352a-Reichweite, Rückzugsfiktion-
Widerlegung, Zivilpunkt-Liquidität) verlangen juristische Subsumtion → in
Engine/Vorlage als Ja/Nein-Gate, nicht automatisch. **`verified: true` / Status
«geprüft» setzt Davids Abnahme voraus.** **Keine Repo-Datei wurde geändert ausser
diesem Dossier.**
