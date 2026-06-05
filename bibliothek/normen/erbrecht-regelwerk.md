# Erbrecht — Regelwerk (Deep Research, Grundlage für die geplanten Engines)

**Erstellt:** 5.6.2026 · **Wortlaut-Quelle:** Fedlex SR 210 (ZGB), Cache
/tmp/zgb.html — Konsolidierungsstand empirisch «1.1.2026», also POST-
Erbrechtsrevision (in Kraft 1.1.2023) · **Abrufdatum: 5.6.2026**
**Status: Arbeitsgrundlage — NICHT abgenommen; adversarialer Doppelcheck
folgt nach Eintreffen aller Teile.**

Gliederung: Teil 1 (gesetzliche Erbfolge + Pflichtteile, inkl. Engine-
Audit) · Teil 2 (Verfügungen + Klagen mit Fristen) · Teil 3 (Erbgang +
Teilung mit Fristen-/Behörden-Synthese). Kantonale Erbgangs-Behörden:
eigenes Dossier in behoerden/.

**KERNBEFUND Teil 1:** Engine-Audit src/lib/erbteilung.ts gegen den
verifizierten Wortlaut — ALLE Regeln BESTÄTIGT (Parentelen, 462-Quoten,
½/½-Pflichtteile nF, 472-Hypothetik, 473-Hinweis ½ nF, Übergangsrecht am
Todesdatum); der VERIFY-Vorbehalt im Engine-Kopf ist damit eingelöst
(fachliche Abnahme durch David weiterhin vorbehalten).

---

# ERBRECHT-REGELWERK Teil 1 — Gesetzliche Erbfolge + Pflichtteile (ZGB)

**Quelle:** Lokaler Fedlex-Cache `/tmp/zgb.html` (SR 210), Anker-Format `id="art_X"`.
**Konsolidierungsstand (empirisch festgestellt):** **„Stand am 1. Januar 2026"** — also **post-Erbrechtsrevision** (BG vom 18.12.2020, AS 2021 312, in Kraft seit 1.1.2023). Die Artikel 470, 471, 472, 473, 476 tragen jeweils die Fussnote „Fassung gemäss Ziff. I des BG vom 18. Dez. 2020 (Erbrecht), in Kraft seit 1. Jan. 2023".
**Abrufdatum:** 5.6.2026.
**Repealed-Befund:** Art. 461 (aufgehoben 1978), Art. 463–464 (aufgehoben 1988), Art. 465 (aufgehoben 1973) — bestätigt im Cache als „Aufgehoben"; daher fehlende Anker `art_463`/`art_464` (in den 462-Block integriert).

---

## 1. Gesetzliche Erben (Art. 457–466) — Parentelensystem

### Art. 457 — I. Nachkommen (1. Parentel)
**Wortlaut-Kern (verbatim):** „Die nächsten Erben eines Erblassers sind seine Nachkommen. / Die Kinder erben zu gleichen Teilen. / An die Stelle vorverstorbener Kinder treten ihre Nachkommen, und zwar in allen Graden nach Stämmen."
**Regel:** Kinder kopfgleich; Eintrittsprinzip (Repräsentation) zugunsten der Nachkommen vorverstorbener Kinder, stammweise in allen Graden.
**Engine-Hinweis:** Stammquote = Rest/Stammzahl, je Enkel = Stammquote/Enkelzahl — bestätigt umgesetzt.

### Art. 458 — II. Elterlicher Stamm (2. Parentel)
**Wortlaut-Kern:** „Hinterlässt der Erblasser keine Nachkommen, so gelangt die Erbschaft an den Stamm der Eltern. / Vater und Mutter erben nach Hälften. / An die Stelle von Vater oder Mutter, die vorverstorben sind, treten ihre Nachkommen … nach Stämmen. / Fehlt es an Nachkommen auf einer Seite, so fällt die ganze Erbschaft an die Erben der andern Seite."
**Regel:** Subsidiär zur 1. Parentel; Vater/Mutter je ½; Eintritt der Nachkommen (Geschwister, Nichten/Neffen); **Anwachsung** der ganzen Seite an die andere, wenn eine Seite leer ist.
**Abgrenzung:** Eintritt geht der Anwachsung vor (erst Nachkommen der Seite, dann Anwachsung).

### Art. 459 — III. Grosselterlicher Stamm (3. Parentel)
**Wortlaut-Kern:** Erbschaft an den Stamm der Grosseltern, wenn weder Nachkommen noch Erben des elterlichen Stammes; väterliche und mütterliche Seite je zur Hälfte; Eintritt der Nachkommen vorverstorbener Grosseltern nach Stämmen; gestufte Anwachsung (innerhalb der Seite, dann auf die andere Seite).
**Engine-Hinweis:** Engine fasst die 3. Parentel pauschal als „zusammen, Quote 1" und warnt explizit, dass die Binnenaufteilung nicht im Detail berechnet wird — bestätigt.

### Art. 460 — IV. Umfang der Erbberechtigung
**Wortlaut-Kern:** „Mit dem Stamm der Grosseltern hört die Erbberechtigung der Verwandten auf."
**Regel:** Verwandtenerbrecht endet mit der 3. Parentel (keine Urgrosseltern-Parentel als Erben; vgl. Art. 12a SchlT für Nutzniessungsrest).

### Art. 462 — B. Überlebende Ehegatten / eingetragene Partner:innen
**Wortlaut-Kern (verbatim, Litera vollständig):** „Überlebende Ehegatten und überlebende eingetragene Partnerinnen oder Partner erhalten: / 1. wenn sie mit Nachkommen zu teilen haben, **die Hälfte der Erbschaft**; / 2. wenn sie mit Erben des elterlichen Stammes zu teilen haben, **drei Viertel der Erbschaft**; / 3. wenn auch keine Erben des elterlichen Stammes vorhanden sind, **die ganze Erbschaft**."
**Regel:** Ehegatte/eingetragene:r Partner:in erbt parallel zur Verwandtenparentel mit festen Konkurrenzquoten; verdrängt die 3. Parentel vollständig (Ziff. 3).
**Engine-Hinweis:** `HALB` / `DREIVIERTEL` / `EINS` je nach Parentel — bestätigt; eingetragene Partner gleichgestellt.

### Art. 466 — D. Gemeinwesen
**Wortlaut-Kern:** „Hinterlässt der Erblasser keine Erben, so fällt die Erbschaft an den Kanton, in dem der Erblasser den letzten Wohnsitz gehabt hat, oder an die Gemeinde, die von der Gesetzgebung dieses Kantons als berechtigt bezeichnet wird."
**Regel:** Subsidiäres Heimfallrecht des Gemeinwesens (Kanton letzter Wohnsitz / kantonal bezeichnete Gemeinde).

---

## 2. Verfügungsfähigkeit (Art. 467–469)

### Art. 467 — A. Letztwillige Verfügung
**Wortlaut-Kern:** „Wer urteilsfähig ist und das 18. Altersjahr zurückgelegt hat, ist befugt, unter Beobachtung der gesetzlichen Schranken und Formen über sein Vermögen letztwillig zu verfügen."
**Regel:** Testierfähigkeit = Urteilsfähigkeit + vollendetes 18. Lebensjahr.

### Art. 468 — B. Erbvertrag
**Wortlaut-Kern:** „Wer urteilsfähig ist und das 18. Altersjahr zurückgelegt hat, kann als Erblasser einen Erbvertrag abschliessen. / Personen unter einer Beistandschaft, die den Abschluss eines Erbvertrags umfasst, bedürfen der Zustimmung ihres gesetzlichen Vertreters."
**Abgrenzung:** Erbvertrag verlangt (anders als das Testament) ebenfalls 18 Jahre; bei umfassender Beistandschaft Zustimmungserfordernis.

### Art. 469 — C. Mangelhafter Wille
**Wortlaut-Kern:** „Verfügungen, die der Erblasser unter dem Einfluss von Irrtum, arglistiger Täuschung, Drohung oder Zwang errichtet hat, sind ungültig. / Sie erlangen jedoch Gültigkeit, wenn sie der Erblasser nicht binnen Jahresfrist aufhebt, nachdem er von dem Irrtum oder von der Täuschung Kenntnis erhalten hat oder der Einfluss von Zwang oder Drohung weggefallen ist. / Enthält eine Verfügung einen offenbaren Irrtum in Bezug auf Personen oder Sachen … so ist die Verfügung in diesem Sinne richtig zu stellen."
**Regel:** Willensmängel → Ungültigkeit, heilbar durch Verstreichen der Jahresfrist; Richtigstellung bei offenbarem Irrtum (falsa demonstratio).

---

## 3. Verfügbare Quote + Pflichtteile (Art. 470–476) — REVISION 2023

### Art. 470 — A. Verfügbarer Teil / I. Umfang
**Wortlaut-Kern (nF, in Kraft seit 1.1.2023):** „Wer Nachkommen, den Ehegatten, die eingetragene Partnerin oder den eingetragenen Partner hinterlässt, kann bis zu deren Pflichtteil über sein Vermögen von Todes wegen verfügen. / Wer keine der genannten Erben hinterlässt, kann über sein ganzes Vermögen von Todes wegen verfügen."
**Revisions-Befund:** Der **Kreis der Pflichtteilsberechtigten ist jetzt abschliessend** Nachkommen + Ehegatte/eingetragene:r Partner:in. **Eltern fehlen** — der frühere elterliche Pflichtteil (aArt. 471 Ziff. 3) ist **gestrichen**.

### Art. 471 — II. Pflichtteil
**Wortlaut-Kern (nF):** „Der Pflichtteil beträgt **die Hälfte des gesetzlichen Erbanspruchs**."
**Vorher/Nachher (Revision 2023):**

| | Altes Recht (Tod ≤ 31.12.2022) | Neues Recht (Tod ≥ 1.1.2023) |
|---|---|---|
| Nachkommen | **¾** des gesetzlichen Erbanspruchs | **½** |
| Ehegatte/eingetr. Partner:in | ½ | ½ (unverändert) |
| Eltern | ½ | **kein Pflichtteil (gestrichen)** |

### Art. 472 — III. Verlust des Pflichtteils im Scheidungsverfahren
**Wortlaut-Kern (nF, verbatim, Litera vollständig):** „Ist beim Tod des Erblassers ein Scheidungsverfahren hängig, so verliert der überlebende Ehegatte seinen Pflichtteilsanspruch, wenn: / 1. das Verfahren auf gemeinsames Begehren eingeleitet oder nach den Vorschriften über die Scheidung auf gemeinsames Begehren fortgesetzt wurde; oder / 2. die Ehegatten mindestens zwei Jahre getrennt gelebt haben. / In einem solchen Fall gelten die Pflichtteile, wie wenn der Erblasser nicht verheiratet wäre. / Die Absätze 1 und 2 gelten bei Verfahren zur Auflösung einer eingetragenen Partnerschaft sinngemäss."
**Wichtige Abgrenzung:** Verloren geht nur der **Pflichtteilsschutz**, nicht das gesetzliche Erbrecht — ohne Verfügung von Todes wegen erbt der Noch-Ehegatte bis zur Rechtskraft der Scheidung weiter seinen gesetzlichen Anteil.

### Art. 473 — IV. Nutzniessung
**Wortlaut-Kern (nF):** „**Unabhängig von einer allfälligen Verfügung über den verfügbaren Teil** kann der Erblasser dem überlebenden Ehegatten … gegenüber den **gemeinsamen Nachkommen** die Nutzniessung am ganzen ihnen zufallenden Teil der Erbschaft zuwenden. / Diese Nutzniessung tritt an die Stelle des … neben diesen Nachkommen zustehenden gesetzlichen Erbrechts. **Neben dieser Nutzniessung beträgt der verfügbare Teil die Hälfte des Nachlasses.** / Heiratet der überlebende Ehegatte wieder oder begründet er eine eingetragene Partnerschaft, so entfällt die Nutzniessung auf jenem Teil … der nach den ordentlichen Bestimmungen über den Pflichtteil der Nachkommen nicht hätte mit der Nutzniessung belastet werden können."
**Revisions-Befund:** Kern-Neuerung der Revision: der verfügbare Teil **neben** der Nutzniessung beträgt jetzt **½** (altes Recht: ¼) — Folge der Halbierung des Nachkommen-Pflichtteils. Nur gegenüber **gemeinsamen** Nachkommen. Wegfall bei Wiederverheiratung (Abs. 3).

### Art. 474 — V. Berechnung des verfügbaren Teils / 1. Schuldenabzug
**Wortlaut-Kern:** Massgebend ist der Vermögensstand zur Zeit des Todes; abzuziehen sind Schulden des Erblassers, Begräbnis-, Siegelungs- und Inventarkosten sowie Unterhaltsansprüche der Hausgenossen für einen Monat.

### Art. 475 — 2. Zuwendungen unter Lebenden
**Wortlaut-Kern:** „Die Zuwendungen unter Lebenden werden insoweit zum Vermögen hinzugerechnet, als sie der Herabsetzungsklage unterstellt sind."
**Engine-Hinweis:** Hinzurechnung wird nicht berechnet — Engine warnt explizit (siehe Audit).

### Art. 476 — 3. Versicherung und gebundene Selbstvorsorge
**Wortlaut-Kern (nF):** Rückkaufswert eines auf den Tod gestellten Versicherungsanspruchs (inkl. gebundener Selbstvorsorge) zugunsten Dritter wird zum Todeszeitpunkt zum Vermögen hinzugerechnet; ebenso Ansprüche von Begünstigten aus gebundener Selbstvorsorge bei einer **Bankstiftung** (Säule 3a).

---

## 4. Enterbung (Art. 477–480)

### Art. 477 — I. Gründe
**Wortlaut-Kern (verbatim):** „Der Erblasser ist befugt, durch Verfügung von Todes wegen einem Erben den Pflichtteil zu entziehen: / 1. wenn der Erbe gegen den Erblasser oder gegen eine diesem nahe verbundene Person eine **schwere Straftat** begangen hat; / 2. wenn er gegenüber dem Erblasser oder einem von dessen Angehörigen die ihm obliegenden **familienrechtlichen Pflichten schwer verletzt** hat."
**Regel:** Strafenterbung (Vollentzug des Pflichtteils) nur aus diesen zwei Gründen.

### Art. 478 — II. Wirkung
**Wortlaut-Kern:** Enterbter nimmt weder an der Erbschaft teil noch kann er die Herabsetzungsklage erheben; sein Anteil fällt (ohne abweichende Verfügung) an die gesetzlichen Erben, „wie wenn der Enterbte den Erbfall nicht erlebt hätte"; **die Nachkommen des Enterbten behalten ihr Pflichtteilsrecht**.

### Art. 479 — III. Beweislast
**Wortlaut-Kern:** Enterbung nur gültig, wenn der Grund in der Verfügung angegeben ist; bei Anfechtung trägt der begünstigte Erbe die Beweislast für die Richtigkeit; misslingt der Beweis / fehlt der Grund, wird die Verfügung nur soweit aufrechterhalten, als sie sich mit dem Pflichtteil des Enterbten verträgt (Ausnahme: offenbarer Irrtum über den Grund).

### Art. 480 — IV. Enterbung eines Zahlungsunfähigen
**Wortlaut-Kern:** Bestehen Verlustscheine gegen einen Nachkommen, kann ihm der Erblasser **die Hälfte seines Pflichtteils** entziehen, wenn er sie dessen Kindern zuwendet; Wegfall auf Begehren, wenn bei Eröffnung keine Verlustscheine mehr bestehen oder deren Gesamtbetrag einen Viertel des Erbteils nicht übersteigt.

---

## Quoten-Synthese: Konkurrenz-Konstellationen (NEUES Recht, Tod ≥ 1.1.2023)

| Konkurrenz | Gesetzliche Quote (Art. 462/457–459) | Pflichtteilsfaktor (Art. 471 nF) | Pflichtteil | Verfügbare Quote |
|---|---|---|---|---|
| Ehegatte + Nachkommen | EG ½ · Nachk. ½ | EG ×½, Nachk. ×½ | EG ¼ · Nachk. ¼ → **Σ ½** | **½** |
| Nur Nachkommen | 1/1 | ×½ | **½** | **½** |
| Ehegatte + elterlicher Stamm | EG ¾ · Stamm ¼ | EG ×½, Stamm 0 | EG **⅜**, Eltern/Stamm 0 | **⅝** |
| Ehegatte + Eltern (beide leben) | EG ¾ · Eltern je ⅛ | EG ×½, Eltern 0 | **⅜** | **⅝** |
| Nur Eltern/elterlicher Stamm | 1/1 | 0 | **0** | **1/1** |
| Ehegatte allein (keine 1./2. Parentel) | 1/1 (Art. 462 Ziff. 3) | ×½ | **½** | **½** |
| Nur 3. Parentel (kein EG) | 1/1 | 0 | **0** | **1/1** |
| Keine Erben | — | — | — | Gemeinwesen (Art. 466) |

## Quoten-Synthese: ALTES Recht (Tod ≤ 31.12.2022, zum Vergleich)

| Konkurrenz | Gesetzliche Quote | Pflichtteilsfaktor (aArt. 471) | Pflichtteil | Verfügbare Quote |
|---|---|---|---|---|
| Ehegatte + Nachkommen | EG ½ · Nachk. ½ | EG ×½, Nachk. ×¾ | EG ¼ · Nachk. ⅜ → Σ **⅝** | **⅜** |
| Nur Nachkommen | 1/1 | ×¾ | **¾** | **¼** |
| Ehegatte + Eltern | EG ¾ · Eltern ¼ | EG ×½, Eltern ×½ | EG ⅜ · Eltern ⅛ → Σ **½** | **½** |
| Ehegatte allein | 1/1 | ×½ | **½** | **½** |

---

## 5. AUDIT-HOOK — Engine `/Users/david/Desktop/LegalCalc/src/lib/erbteilung.ts` (nur gelesen)

**Parentelensystem (Art. 457–459):** **BESTÄTIGT.** 1. Parentel mit Eintritt nach Stämmen und Enkel-Subverteilung (`stammQuote / s.enkel`); 2. Parentel mit Hälften, Eintritt und Anwachsung (`beideSeiten ? rest/2 : rest`, Z. 75–76 = Art. 458 Abs. 4); 3. Parentel pauschal mit Detail-Warnung. Korrekt umgesetzt.

**Art. 462-Quoten:** **BESTÄTIGT.** Ziff. 1 = ½ (Z. 53), Ziff. 2 = ¾ (Z. 72), Ziff. 3 = ganze Erbschaft mit Verdrängung der 3. Parentel (Z. 90–94). Eingetragene Partner gleichgestellt (Bezeichnung „Ehegatte/Partner"). Entspricht dem verifizierten Wortlaut exakt.

**Pflichtteile ½ / ½ (Art. 470/471 nF):** **BESTÄTIGT.** `ptFaktor` (Z. 107–112): Ehegatte ×½, Nachkommen neu ×½ / alt ×¾, Eltern nur im **alten** Recht ×½, neu 0; Geschwister/3. Parentel/Gemeinwesen 0. Stimmt mit der Revision (Eltern-Pflichtteil gestrichen, einheitlich ½) überein. Übergangsrecht über Todesdatum ≥ 2023-01-01 korrekt am Todesdatum (Art. 15/16 SchlT) festgemacht (Z. 192).

**Art. 472-Behandlung:** **BESTÄTIGT mit Hinweis.** Engine entzieht bei erfülltem Tatbestand nur den Pflichtteil des Ehegatten (Faktor 0, Z. 252) und berechnet die übrigen Pflichtteile „wie wenn der Erblasser nicht verheiratet wäre" über eine hypothetische Verteilung `verteileQuoten(input, false)` (Z. 233–239) — das entspricht Art. 472 Abs. 2 verbatim. Korrekt belassen wird das gesetzliche Erbrecht des Ehegatten (Warnung Z. 246, 317–320). Konform. *Hinweis (keine Abweichung):* Die Engine setzt die Tatbestandsprüfung (gemeinsames Begehren / ≥ 2 Jahre getrennt) als Input-Flag `scheidung472Erfuellt` voraus, prüft die Voraussetzungen also nicht selbst — methodisch sauber, da regelbasiert nicht abschliessend bestimmbar.

**Art. 473-Behandlung:** **BESTÄTIGT.** Engine berechnet die Nutzniessungslösung nicht, sondern gibt einen korrekten **Hinweis** nur bei Ehegatte + 1. Parentel + neues Recht (Z. 284–293): „daneben verfügbarer Teil = **½** des Nachlasses (Art. 473 Abs. 2 nF)", Wegfall bei Wiederverheiratung (Abs. 3), Beschränkung auf gemeinsame Nachkommen. Inhaltlich deckungsgleich mit dem verifizierten Wortlaut (½ ist der revidierte Wert — korrekt, nicht der alte ¼).

**Berechnungsmasse (Art. 474–476):** **BESTÄTIGT (bewusste Nicht-Berechnung, offengelegt).** Hinzurechnung lebzeitiger Zuwendungen (Art. 475), Versicherungs-/Säule-3a-Ansprüche (Art. 476), Schuldenabzug (Art. 474) und Herabsetzungsreihenfolge (Art. 532) werden nicht gerechnet, aber in `warnungen` explizit benannt (Z. 307–311). Entspricht §8 (Ehrlichkeit) — keine fachliche Abweichung.

**Gesamtbefund:** Keine inhaltliche **ABWEICHUNG** zwischen Engine und dem im Cache (Stand 1.1.2026) verifizierten Wortlaut. Alle geprüften Regeln (Parentelen, 462-Quoten, ½/½-Pflichtteile, 472, 473) sind **BESTÄTIGT**. Der `VERIFY`-Kommentar in Z. 12–13 („Wortlaut … vor Produktivschaltung endkontrollieren") ist mit diesem Abruf erfüllt: Art. 471 nF („Hälfte des gesetzlichen Erbanspruchs"), Art. 472 nF und Art. 473 Abs. 2 nF („verfügbare Teil die Hälfte des Nachlasses") stimmen wörtlich. Die Engine ist insoweit deploy-reif; die fachliche Abnahme (`verified: true`) bleibt David vorbehalten (§7).

**Relevante Datei:** `/Users/david/Desktop/LegalCalc/src/lib/erbteilung.ts`

---

## TEIL 2 — Verfügungen von Todes wegen + Klagen (Fristen)

# ZGB Erbrecht-Regelwerk Teil 2 — Verfügungen von Todes wegen + Klagen (Deep Research)

**Erstellt:** 5.6.2026 · **Wortlaut-Quelle:** lokaler Cache `/tmp/zgb.html` (Fedlex SR 210, ZGB), Anker-Format `id="art_X"` · **Abrufdatum: 5.6.2026**
**Rechtsstand: konsolidierte Fassung mit Erbrechtsrevision AS 2021 312 / BBl 2018 5813, in Kraft seit 1.1.2023.**
**Status: Arbeitsgrundlage für eine künftige Erbrechts-Engine — NICHT abgenommen (§7/§8 CLAUDE.md).** Alle BGE-Angaben sind **[Sekundär]**, solange nicht an der amtlichen Sammlung gegengeprüft. Diese Recherche ändert KEINE Repo-Dateien.

> **Revisions-Hinweis (Übersicht):** Im erfassten Bereich tragen den Fussnoten-Vermerk **«Fassung gemäss Ziff. I des BG vom 18. Dez. 2020 (Erbrecht), in Kraft seit 1.1.2023»** genau die Artikel **494, 522, 523, 529, 532**. Die Herabsetzungs-Systematik (522/523/532) und die Versicherungs-/Säule-3a-Einbeziehung (529) sind also **revidiert**; die Fristennormen **521, 533, 600** sind **unverändert** geblieben. Pflichtteils-Materie (470/471) ist Teil 1 und hier nicht erfasst — sie ist aber der Grund der 522/532-Neufassung (Wegfall Eltern-Pflichtteil, Reduktion Nachkommen-Pflichtteil auf ½).

---

## TEIL A — Verfügungsarten (Art. 481–497)

### Art. 481 — Grundsatz / Verfügungsfreiheit
**Wortlaut-Kern.** «Der Erblasser kann **in den Schranken der Verfügungsfreiheit** über sein Vermögen mit letztwilliger Verfügung oder mit Erbvertrag ganz oder teilweise verfügen.» Abs. 2: «Der Teil, über den er nicht verfügt hat, fällt an die **gesetzlichen Erben**.»
**Regel.** Zwei Verfügungsinstrumente (Testament / Erbvertrag), begrenzt durch die Pflichtteile (Art. 470 f.). Nicht verfügter Teil → gesetzliche Erbfolge.
**Abgrenzung.** Schranke = Pflichtteilsrecht; Verletzung führt nicht zur Nichtigkeit, sondern zur **Herabsetzung** (Art. 522). Bereits im Template als Default-Warnung umgesetzt (testament.ts Z. 79: Quoten <100 % → Hinweis auf Art. 481 Abs. 2).
**BGE.** Verfügungsfreiheit als Grundsatz, Pflichtteil als Ausnahme. **[Sekundär]**
**Engine-Hinweis.** Quoten-Plausibilität (Summe = 100 %; Restquote → gesetzliche Erben).

### Art. 482 — Auflagen und Bedingungen
**Wortlaut-Kern.** Auflagen/Bedingungen zulässig; Vollziehung kann jeder Interessierte verlangen. **«Unsittliche oder rechtswidrige»** Auflagen/Bedingungen **machen die Verfügung ungültig**. Bloss lästige/unsinnige gelten als nicht vorhanden. Abs. 4 (eingefügt 2003, Tierschutz): Tier-Zuwendung = Auflage zur tiergerechten Sorge.
**Regel.** Unsittlich/rechtswidrig = Ungültigkeitsgrund (Brücke zu Art. 519 Ziff. 3); lästig/unsinnig = ignoriert.
**Engine-Hinweis.** Freitext-Auflagen NICHT generieren (Unsittlichkeits-Risiko) — anwaltliche Beratung. Template enthält bewusst keine Auflagen-Bausteine.

### Art. 483 — Erbeinsetzung
**Wortlaut-Kern.** Einsetzung eines/mehrerer Erben für ganze Erbschaft oder Bruchteil. «Als Erbeinsetzung ist **jede Verfügung** zu betrachten, nach der ein Bedachter die Erbschaft insgesamt oder zu einem Bruchteil erhalten soll.»
**Abgrenzung zum Vermächtnis (484):** Erbe = Universalsukzession (Bruchteil/Quote, haftet für Schulden); Vermächtnisnehmer = Einzelanspruch (Sache/Betrag, kein Erbe). Auslegungsregel: Quote → Erbe; bestimmte Sache → Vermächtnis.
**Engine-Hinweis.** Template C03/C03b: Erben mit `quoteProzent`. Korrekt umgesetzt (norm: Art. 483).

### Art. 484–486 — Vermächtnis (Inhalt / Verpflichtung / Verhältnis zur Erbschaft)
**Wortlaut-Kern 484.** Vermögensvorteil **ohne Erbeinsetzung**: einzelne Sache, Nutzniessung, Leistungsauftrag an Erben, Schuldbefreiung. **Vindikationslegat-Schranke:** Vermacht der Erblasser eine bestimmte Sache, die sich **nicht in der Erbschaft vorfindet**, ist der Beschwerte (mangels anderen Willens) **nicht verpflichtet**.
**485.** Auslieferung im Zustand zur Zeit der **Eröffnung des Erbgangs**; ab dann Beschwerter wie Geschäftsführer ohne Auftrag (Aufwand/Verschlechterung).
**486.** Übersteigen die Vermächtnisse Erbschaft/Zuwendung/verfügbaren Teil → **verhältnismässige Herabsetzung**. Vorversterben/Erbunwürdigkeit/Ausschlagung des Beschwerten lässt Vermächtnis bestehen. Prälegat (Vermächtnis an gesetzl./eingesetzten Erben) auch bei Ausschlagung beanspruchbar.
**Engine-Hinweis.** Template C04/C04b: `gegenstand` als Freitext (Sache ODER Betrag). 484 Abs. 2 (Sache nicht im Nachlass) ist ein Beratungs-Hinweis, kein generierbarer Baustein.

### Art. 487 — Ersatzverfügung
**Wortlaut-Kern.** Erblasser kann Personen bezeichnen, denen Erbschaft/Vermächtnis **für den Fall des Vorabsterbens oder der Ausschlagung** zufallen soll.
**Abgrenzung zur Nacherbeneinsetzung (488):** Ersatz = *alternativ* (Erstbedachter erwirbt gar nicht); Nacherbe = *sukzessiv* (Vorerbe erwirbt, muss später ausliefern).
**Engine-Hinweis.** Template C05 (Erben/Vermächtnis-Ersatz): «nicht erleben oder ausschlagen» — Wortlaut deckungsgleich mit Art. 487. Korrekt.

### Art. 488–492 / 492a — Nacherbeneinsetzung ⚠️ Sicherungspflichten
**Wortlaut-Kern 488.** Vorerbe verpflichtet, Erbschaft dem Nacherben auszuliefern; dem Nacherben kann keine weitere Nacherbenpflicht auferlegt werden (**Verbot des Nach-Nacherben**). Gilt auch fürs Vermächtnis.
**489.** Auslieferungszeitpunkt = **Tod des Vorerben**, falls nicht anders bestimmt.
**490 (Sicherung — zentral).** «In **allen** Fällen der Nacherbeneinsetzung hat die zuständige Behörde die **Aufnahme eines Inventars** anzuordnen.» Auslieferung an Vorerben **nur gegen Sicherstellung** (bei Grundstücken: **Vormerkung der Auslieferungspflicht im Grundbuch**), sofern der Erblasser nicht ausdrücklich befreit hat. Keine Sicherstellung / Gefährdung der Anwartschaft → **Erbschaftsverwaltung**.
**491/492.** Vorerbe = Eigentümer unter Auslieferungspflicht. Nacherbe erwirbt, wenn er den Zeitpunkt erlebt; sonst bleibt es (mangels anderer Verfügung) beim Vorerben.
**492a (eingefügt 2013).** Nacherbeneinsetzung **auf den Überrest** bei dauernd urteilsunfähigem Nachkommen ohne eigene Nachkommen/Ehegatten; fällt von Gesetzes wegen dahin, wenn er urteilsfähig wird.
**Schranke (531):** Nacherbeneinsetzung gegenüber pflichtteilsberechtigtem Erben **im Umfang des Pflichtteils ungültig** (Ausnahme 492a).
**Engine-Hinweis.** Nacherbschaft **bewusst NICHT im Template** (testament.ts Z. 9–10: «Nacherbe … bewusst NICHT enthalten – dafür anwaltliche Beratung»). Korrekt: Inventar-/Sicherstellungs-/Grundbuchpflichten (490) sind nicht aus einem Formular generierbar.

### Art. 493 — Stiftung von Todes wegen
**Wortlaut-Kern.** Erblasser kann den **verfügbaren Teil** ganz/teilweise als Stiftung widmen; gültig nur bei Entsprechung der gesetzlichen Vorschriften (Art. 80 ff. ZGB).
**Engine-Hinweis.** Nicht generierbar (Organisation/Aufsicht). Beratungs-Verweis.

### Art. 494 — Erbeinsetzungs-/Vermächtnisvertrag ⚠️ Revision 2023
**Wortlaut-Kern.** Erbvertragliche Bindung, einem anderen/Dritten Erbschaft/Vermächtnis zu hinterlassen. **Abs. 2 (revidiert 2023):** Erblasser kann **frei** über sein Vermögen verfügen; Verfügungen von Todes wegen UND **Zuwendungen unter Lebenden** (ausser üblichen Gelegenheitsgeschenken) unterliegen jedoch der **Anfechtung**, soweit sie (1.) mit den erbvertraglichen Verpflichtungen unvereinbar sind, namentlich die Begünstigungen schmälern, UND (2.) im Erbvertrag nicht vorbehalten wurden.
**Regel/Revision.** Klarstellung der lebzeitigen Verfügungsfreiheit trotz Erbvertrag + **Anfechtungsrecht** des erbvertraglich Begünstigten gegen aushöhlende Schenkungen. Reaktion auf BGE 133 III 406 (Streit um Bindungswirkung). **[Sekundär]**
**Abgrenzung.** Bindender Erbvertrag ≠ jederzeit widerrufliches Testament (509).
**Engine-Hinweis.** Erbvertrag generell **nicht im Template** (Beurkundungspflicht 512 → kein eigenhändiges Format).

### Art. 495–497 — Erbverzicht / Erbauskauf ⚠️
**495 (Bedeutung).** «Der Erblasser kann mit einem Erben einen **Erbverzichtvertrag oder Erbauskauf** abschliessen. Der Verzichtende fällt beim Erbgang als Erbe **ausser Betracht**.» Erbverzicht wirkt mangels anderer Anordnung **auch gegenüber den Nachkommen** des Verzichtenden.
**496 (lediger Anfall).** Sind im Vertrag bestimmte Erben an die Stelle des Verzichtenden gesetzt und erwerben diese nicht → Verzicht fällt dahin. Verzicht zugunsten von Miterben: Vermutung, dass er nur gegenüber den Erben des **gemeinsamen nächsten Stammes** wirkt, nicht gegen entferntere.
**497 (Erbschaftsgläubiger).** Zahlungsunfähigkeit des Erblassers + Gläubiger ungedeckt → Verzichtender/seine Erben haftbar, soweit sie für den Verzicht **innerhalb der letzten 5 Jahre** vor dem Tod eine Gegenleistung erhielten und daraus noch bereichert sind.
**Abgrenzung.** **Erbverzicht (unentgeltlich) vs. Erbauskauf (gegen Abfindung)** — beim Auskauf: Abfindung unterliegt der Hinzurechnung/Herabsetzung (Art. 527 Ziff. 2). 5-Jahres-Frist (497) ist **materielle Haftungsschranke**, keine Verjährungsfrist.
**Engine-Hinweis.** Erbvertrag-Materie → Beurkundung. Für eine spätere Hinzurechnungs-/Herabsetzungs-Engine ist die 5-Jahres-Linie (497 / 527 Ziff. 3) relevant.

---

## TEIL B — Verfügungsformen (Art. 498–516)

### Art. 498 — Formen-Numerus-clausus
**Wortlaut-Kern.** Letztwillige Verfügung **entweder** mit öffentlicher Beurkundung **oder** eigenhändig **oder** durch mündliche Erklärung.
**Regel.** Drei abschliessende Testamentsformen. Erbvertrag separat (512).

### Art. 499–504 — Öffentliche Verfügung (Mitwirkung / Zeugen)
**499.** Vor Beamter/Notar/Urkundsperson (kant. Recht) **unter Mitwirkung zweier Zeugen**.
**500.** Erblasser teilt Willen mit → Beamter setzt Urkunde auf, gibt sie zu lesen → **Erblasser unterschreibt** → Beamter **datiert und unterschreibt**.
**501.** Erblasser erklärt **unmittelbar nach Datierung/Unterzeichnung** den zwei Zeugen (in Gegenwart des Beamten), er habe gelesen und die Urkunde enthalte seine Verfügung; Zeugen bestätigen mit Unterschrift die Erklärung + Verfügungsfähigkeit. Zeugen müssen **Inhalt nicht kennen**.
**502.** Variante **ohne Lesen/Unterschrift** des Erblassers: Beamter liest vor Zeugen vor, Erblasser bestätigt; Zeugen bezeugen zusätzlich das Vorlesen.
**503 (Ausschlüsse).** Nicht handlungsfähige Personen, Schreib-/Leseunkundige, **Verwandte in gerader Linie, Geschwister, deren Ehegatten und der Ehegatte** des Erblassers dürfen weder als Beamter noch als Zeugen mitwirken; mitwirkende Personen und ihre nahen Angehörigen **dürfen nicht bedacht werden** (vgl. 520 Abs. 2: nur diese Zuwendungen ungültig).
**504.** Kantone sorgen für Aufbewahrung (Original/Abschrift) bei Amtsstelle.
**Engine-Hinweis.** Öffentliche Verfügung = Notariatsakt, **nicht generierbar**. Konsequenz für §8 CLAUDE.md: nur die eigenhändige Form führt zu einem Export — die öffentliche Form wäre höchstens eine Checkliste.

### Art. 505 — Eigenhändige Verfügung ⚠️ AUDIT-HOOK
**Wortlaut-Kern (verbatim).** «Die eigenhändige letztwillige Verfügung ist **vom Erblasser von Anfang bis zu Ende mit Einschluss der Angabe von Jahr, Monat und Tag der Errichtung von Hand niederzuschreiben** sowie mit seiner **Unterschrift** zu versehen.» Abs. 2: Aufbewahrung bei Amtsstelle (offen/verschlossen) möglich (Fassung 1996).
**Drei zwingende Formelemente:** (1) vollständig **handschriftlich** (von Anfang bis Ende), (2) **Datum mit Jahr/Monat/Tag**, (3) **Unterschrift**.

**AUDIT-Ergebnis — deckt das bestehende Template `src/lib/vorlagen/testament.ts` die Formanforderungen?**
- **Handschriftlichkeit (Element 1):** Abgesichert über `ausgabeArt: 'abschrift'` (Z. 97) — «nie unterschriftsreif» — und Disclaimer Z. 98–101: «Nur die vollständig eigenhändig (von Hand) geschriebene, datierte und unterschriebene Fassung ist gültig (Art. 505 Abs. 1 ZGB).» **Korrekt umgesetzt** (§8: Formvorschrift bestimmt das Exportformat — kein druckfertiges PDF als gültiges Testament).
- **Datum Jahr/Monat/Tag (Element 2):** GATE-3 (Z. 63–66) blockiert fehlendes/unvollständiges Datum mit Verweis auf Art. 505 Abs. 1 / 520a. `datumErrichtung` ist Pflichtfeld (ISO). **Korrekt.** Der Hinweis in C12 (Z. 198), dass das Datum sicherheitshalber **von Hand** zu schreiben ist (Streit in der Lehre), ist sachlich richtig und vorbildlich offengelegt.
- **Unterschrift (Element 3):** C12 Schlussformel mit Unterschriftszeile + Rolle `unterschrift` (Z. 194–195). Da nur Abschrift ausgegeben wird, muss die Unterschrift ohnehin von Hand erfolgen. **Korrekt.**
- **Ort:** Korrekt als **optional/empfohlen** behandelt (Z. 44: «seit 1996 kein Gültigkeitserfordernis») — entspricht Art. 505 Abs. 1, der den Ort nicht (mehr) verlangt.
- **Testierfähigkeit (Vorfrage):** GATE-1 prüft Volljährigkeit (Art. 467) am Errichtungsdatum. Korrekt verortet (Urteilsfähigkeit i.S.v. Art. 16 ist nicht prüfbar → Warnung/Beratung).

**Fazit Audit:** Das Template deckt alle drei zwingenden Formelemente von Art. 505 vollständig und methodisch sauber (harte Gates für Datum/Volljährigkeit, Format-Restriktion für Handschriftlichkeit, transparenter Lehrstreit-Hinweis beim Datum). **Keine Formlücke gefunden.** Einzige denkbare Ergänzung wäre ein expliziter Hinweis, dass Korrekturen/Nachträge (z. B. nicht datierte Zusätze) die Eigenhändigkeit gefährden — derzeit nur implizit über die Abschrift-Logik abgedeckt.

### Art. 506–508 — Mündliche (Not-)Verfügung
**506.** Bei **ausserordentlichen Umständen** (nahe Todesgefahr, Verkehrssperre, Epidemien, Kriegsereignisse), wenn andere Formen verhindert: Erklärung **vor zwei Zeugen** mit Auftrag zur Beurkundung; gleiche Ausschlüsse wie bei öffentlicher Verfügung.
**507.** Zeugen verschriftlichen **sofort** (Ort/Jahr/Monat/Tag), unterschreiben, hinterlegen **ohne Verzug** bei Gerichtsbehörde (oder zu Protokoll); im Militärdienst kann Offizier ab Hauptmann die Gerichtsbehörde ersetzen.
**508 (Verlust der Gültigkeit).** Wird dem Erblasser eine andere Form wieder möglich, **verliert die mündliche Verfügung nach 14 Tagen** ihre Gültigkeit.
**Engine-Hinweis.** Nicht generierbar. **14-Tage-Verfallsfrist (508)** ggf. in der Fristen-Engine als Sonderfall.

### Art. 509–511 — Widerruf / Vernichtung / spätere Verfügung ⚠️ Vermutung
**509 (Widerruf).** Letztwillige Verfügung **jederzeit** in einer der Errichtungsformen widerrufbar, ganz oder teilweise.
**510 (Vernichtung).** Widerruf durch **Vernichtung der Urkunde**. Zufällige/fremdverschuldete Vernichtung → Verfügung verliert Gültigkeit, **soweit ihr Inhalt nicht genau und vollständig feststellbar** ist (Schadenersatz vorbehalten).
**511 (spätere Verfügung — Vermutungsregel ⚠️).** «Errichtet der Erblasser eine letztwillige Verfügung, **ohne eine früher errichtete ausdrücklich aufzuheben, so tritt sie an die Stelle der früheren**, soweit sie sich nicht **zweifellos als deren blosse Ergänzung** darstellt.» Abs. 2: Spätere unvereinbare Verfügung über eine **bestimmte Sache** hebt die frühere bezüglich dieser Sache auf.
**Regel.** Späteres Testament **ersetzt** (Vermutung), ergänzt nur, wenn «zweifellos». Konkludenter Widerruf bei unvereinbarer Einzelverfügung.
**Engine-Hinweis.** Genau hierauf zielt **C02_widerruf** (Template Z. 112–117, norm: Art. 509, 511, Default `widerruf: true`): der ausdrückliche Generalwiderruf neutralisiert die Auslegungsunsicherheit von Art. 511. **Methodisch korrekt** — der Default schützt vor ungewolltem Teil-Fortbestand alter Verfügungen.

### Art. 512 — Form des Erbvertrags
**Wortlaut-Kern.** Erbvertrag bedarf der **Form der öffentlichen letztwilligen Verfügung**. Vertragschliessende erklären **gleichzeitig** dem Beamten ihren Willen und unterschreiben vor ihm und **zwei Zeugen**.
**Engine-Hinweis.** Beurkundung zwingend → kein generierbares Format.

### Art. 513–515 — Aufhebung des Erbvertrags
**513.** Aufhebung **jederzeit durch schriftliche Übereinkunft**. **Einseitig** kann der Erblasser einen Erbeinsetzungs-/Vermächtnisvertrag aufheben, wenn der Bedachte sich nach Vertragsschluss eines **Enterbungsgrundes** schuldig macht (in Testamentsform).
**514.** Wer lebzeitige Leistungen aus Erbvertrag zu fordern hat und diese werden nicht erfüllt/sichergestellt → **Rücktritt** nach OR.
**515.** Vorversterben des Erben/Vermächtnisnehmers → Vertrag fällt dahin; ist der Erblasser aus dem Vertrag noch bereichert, können dessen Erben die Bereicherung herausverlangen.

### Art. 516 — Verfügungsbeschränkung
**Wortlaut-Kern.** Tritt nach Errichtung eine **Beschränkung der Verfügungsfreiheit** ein (z. B. neue Pflichtteilsberechtigte durch Heirat/Geburt), wird die Verfügung **nicht aufgehoben**, aber der **Herabsetzungsklage unterstellt**.
**Engine-Hinweis.** Brücke zu Art. 522 ff.: nachträglicher Pflichtteilskonflikt = Herabsetzung, nicht Ungültigkeit.

---

## TEIL C — Willensvollstrecker (Art. 517–518)

### Art. 517 — Erteilung / Annahme / Vergütung
**Wortlaut-Kern.** Erblasser kann in letztwilliger Verfügung **eine oder mehrere handlungsfähige Personen** mit der Vollstreckung beauftragen. Auftrag wird von Amtes wegen mitgeteilt; Annahme/Ablehnung **binnen 14 Tagen** ab Mitteilung, **Stillschweigen gilt als Annahme**. **Anspruch auf angemessene Vergütung.**
**Fristen-Relevanz:** 14-Tage-Erklärungsfrist (mit Schweigen = Annahme).

### Art. 518 — Inhalt des Auftrags / Stellung
**Wortlaut-Kern.** Soweit der Erblasser nichts anderes verfügt, stehen Willensvollstrecker **in den Rechten und Pflichten des amtlichen Erbschaftsverwalters**: Erbschaft verwalten, Schulden bezahlen, Vermächtnisse ausrichten, Teilung ausführen. Bei mehreren WV: **gemeinsame** Befugnis (vorbehältlich anderer Anordnung).
**Engine-Hinweis.** Template C09/C09b setzt Willensvollstrecker + Ersatz korrekt ein (norm: Art. 517 f.). Vergütungsregelung (angemessen) ist Auslegungs-/Beratungsfrage, kein Baustein.

---

## TEIL D — Klagen + Fristen

### Art. 519–521 — Ungültigkeitsklage ⚠️ Fristen 521
**519 (Gründe).** Auf erhobene Klage **ungültig**, wenn: (1.) Errichtung bei fehlender **Verfügungsfähigkeit**; (2.) aus **mangelhaftem Willen** (Irrtum/Täuschung/Drohung); (3.) **unsittlicher/rechtswidriger** Inhalt oder angefügte Bedingung. Aktivlegitimation: **jeder Erbe/Bedachte mit Interesse** an der Ungültigerklärung.
**520 (Formmangel).** Formmangel → auf Klage ungültig. Liegt der Mangel in der Mitwirkung bedachter Personen (vgl. 503) → **nur diese Zuwendungen** ungültig. Gleiche Klagebefugnis.
**520a (eigenhändige Verfügung, eingefügt 1996).** Fehlerhaftes/fehlendes **Jahr/Monat/Tag** → nur ungültig, wenn die Zeitangaben sich **nicht anders feststellen** lassen UND das Datum für Verfügungsfähigkeit, Reihenfolge mehrerer Verfügungen oder eine andere Gültigkeitsfrage **notwendig** ist. (Heilungs-/Relativierungsnorm — Hintergrund von GATE-3 im Template.)
**521 (Verjährung — Wortlaut verbatim).** «Die Ungültigkeitsklage **verjährt mit Ablauf eines Jahres**, von dem Zeitpunkt an gerechnet, da der Kläger **von der Verfügung und dem Ungültigkeitsgrund Kenntnis** erhalten hat, und in jedem Falle **mit Ablauf von zehn Jahren, vom Tage der Eröffnung der Verfügung** an gerechnet.» Abs. 2: Gegen einen **bösgläubigen** Bedachten verjährt sie bei Verfügungsunfähigkeit/Rechtswidrigkeit/Unsittlichkeit **erst mit Ablauf von 30 Jahren**. Abs. 3: «**Einredeweise** kann die Ungültigkeit einer Verfügung **jederzeit** geltend gemacht werden.»
**Fristen:** 1 Jahr (relativ, Kenntnis) / 10 Jahre (absolut, Eröffnung) / **30 Jahre gegen Bösgläubige** (nur Gründe 519 Ziff. 1+3, nicht Formmangel) / Einrede **unverjährbar**.
**BGE.** Es handelt sich um **Verwirkungs-/Verjährungsfristen** (h.L. Verwirkung); Anfechtungs-, nicht Nichtigkeitsklage (Verfügung bis zum Urteil gültig). **[Sekundär]**

### Art. 522–533 — Herabsetzungsklage ⚠️ Revision 2023
**522 (Grundsatz — revidiert 2023).** Erben, die **wertmässig weniger als ihren Pflichtteil** erhalten, können die Herabsetzung verlangen, **bis der Pflichtteil hergestellt** ist, und zwar von: **1. Erwerbungen gemäss gesetzlicher Erbfolge; 2. Zuwendungen von Todes wegen; 3. Zuwendungen unter Lebenden.** Abs. 2: Teilungsvorschriften-Auslegungsregel.
**523 (Pflichtteilsberechtigte — revidiert).** Unter pflichtteilsberechtigten Erben werden gesetzliche Erwerbungen und Zuwendungen von Todes wegen **im Verhältnis der den Pflichtteil übersteigenden Beträge** herabgesetzt.
**524 (Gläubiger/Konkursverwaltung).** Können bei Überschreitung des verfügbaren Teils zum Nachteil des Erben innerhalb dessen Frist selbst herabsetzen (auch gegen Enterbung).
**525 (Wirkung allgemein).** Herabsetzung für alle Eingesetzten/Bedachten **im gleichen Verhältnis** (vorbehältlich anderen Willens); Vermächtnisse eines beschwerten Bedachten verhältnismässig mit.
**526.** Unteilbare Einzelsache: Bedachter wählt Sache gegen Vergütung des Mehrbetrags oder verfügbaren Betrag.
**527 (lebzeitige Zuwendungen — Fälle ⚠️).** Der Herabsetzung unterliegen **wie Verfügungen von Todes wegen:** (1.) anrechenbare Zuwendungen (Heiratsgut, Ausstattung, Vermögensabtretung), soweit nicht ausgleichungspflichtig; (2.) **Erbabfindungen und Auskaufsbeträge** (→ Brücke zu 495/527); (3.) **frei widerrufliche Schenkungen** oder Schenkungen der **letzten 5 Jahre** vor dem Tod (ausser übliche Gelegenheitsgeschenke); (4.) **Entäusserungen zur offenbaren Umgehung** der Verfügungsbeschränkung.
**528 (Rückleistung).** Gutgläubiger nur bis zur **noch vorhandenen Bereicherung** zur Rückleistung verpflichtet.
**529 (Versicherung / Säule 3a — revidiert 2023 ⚠️).** Versicherungsansprüche auf den Tod des Erblassers **einschliesslich gebundener Selbstvorsorge (Säule 3a)**, zugunsten Dritter begründet/unentgeltlich übertragen, unterliegen der Herabsetzung **mit ihrem Rückkaufswert**. Abs. 2: Auch Ansprüche Begünstigter aus **gebundener Selbstvorsorge bei einer Bankstiftung** (3a-Konto). *Revision: ausdrückliche Einbeziehung der Säule 3a/Bankstiftung.*
**530 (Nutzniessung/Renten).** Übersteigt der Kapitalwert (nach mutmasslicher Dauer) den verfügbaren Teil → Erben verlangen verhältnismässige Herabsetzung **oder** Ablösung gegen Überlassung des verfügbaren Teils.
**531 (Nacherbeneinsetzung).** Gegenüber pflichtteilsberechtigtem Erben **im Umfang des Pflichtteils ungültig** (Ausnahme 492a).
**532 (Reihenfolge / Durchführung — revidiert 2023 ⚠️ verbatim).** «Der Herabsetzung unterliegen **wie folgt der Reihe nach**, bis der Pflichtteil hergestellt ist: 1. die **Erwerbungen gemäss der gesetzlichen Erbfolge**; 2. die **Zuwendungen von Todes wegen**; 3. die **Zuwendungen unter Lebenden**.» Abs. 2: Die Zuwendungen unter Lebenden werden ihrerseits der Reihe nach herabgesetzt: **1.** hinzurechnungspflichtige Zuwendungen aus **Ehe-/Vermögensvertrag**; **2.** frei widerrufliche Zuwendungen und **Leistungen aus gebundener Selbstvorsorge**, im gleichen Verhältnis; **3.** weitere Zuwendungen, **die späteren vor den früheren**.
> **Revisions-Kern 532:** Die *neue* dreistufige Reihenfolge (Abs. 1) und insbesondere die feinere Staffelung der lebzeitigen Zuwendungen (Abs. 2 — Ehevertrag → Säule 3a/widerrufliche → übrige rückwärts in der Zeit) ist die zentrale Änderung gegenüber der alten Fassung. Für eine Engine: **die spätere Zuwendung wird zuerst herabgesetzt** («die späteren vor den früheren»).
**533 (Verjährung — verbatim).** «Die Herabsetzungsklage **verjährt mit Ablauf eines Jahres** von dem Zeitpunkt an, da die Erben **von der Verletzung ihrer Rechte Kenntnis** erhalten haben, und in jedem Fall **mit Ablauf von zehn Jahren**, die bei **letztwilligen Verfügungen** von der **Eröffnung**, bei **anderen Zuwendungen** vom **Tode des Erblassers** an gerechnet werden.» Abs. 2: Wird durch Ungültigerklärung einer späteren Verfügung eine frühere gültig → Fristbeginn ab diesem Zeitpunkt. Abs. 3: «**Einredeweise** kann der Herabsetzungsanspruch **jederzeit** geltend gemacht werden.»
**Fristen 533:** 1 Jahr (Kenntnis der Rechtsverletzung) / 10 Jahre absolut (**Eröffnung** bei Testament; **Tod** bei lebzeitigen Zuwendungen) / Einrede **unverjährbar**.
**Engine-Hinweis.** Eine Herabsetzungs-Engine braucht: Pflichtteilsmasse (470 f. — Teil 1), Hinzurechnung (527/529, 5-Jahres-/Rückkaufswert-Regeln), **Reihenfolge-Algorithmus nach 532** (zweistufig). Hohe Komplexität → eigenständige Engine, nicht im Template.

### Art. 598–601 — Erbschaftsklage ⚠️ Fristen 600
**598.** Wer als gesetzlicher/eingesetzter Erbe ein **besseres Recht** an Erbschaft/Erbschaftssachen zu haben glaubt als der Besitzer, kann dies mit der **Erbschaftsklage (petitio hereditatis)** geltend machen. (Abs. 2 aufgehoben durch ZPO-Anhang, seit 1.1.2011.)
**599 (Wirkung).** Gutheissung → Herausgabe **nach den Besitzesregeln** (Art. 938 ff.); der Beklagte kann sich **nicht auf Ersitzung** berufen.
**600 (Verjährung — verbatim).** «Die Erbschaftsklage **verjährt** gegenüber einem **gutgläubigen** Beklagten mit Ablauf **eines Jahres**, von dem Zeitpunkt an, da der Kläger **von dem Besitz des Beklagten und von seinem eigenen besseren Recht Kenntnis** erhalten hat, in allen Fällen aber **mit Ablauf von zehn Jahren, vom Tode des Erblassers oder dem Zeitpunkte der Eröffnung** seiner letztwilligen Verfügung an.» Abs. 2: Gegenüber **bösgläubigem** Beklagten **stets 30 Jahre**.
**601 (Vermächtnisnehmer).** Klage des Vermächtnisnehmers **verjährt mit Ablauf von zehn Jahren**, von der **Mitteilung der Verfügung** oder vom späteren Fälligkeitszeitpunkt an.
**Fristen-Relevanz:** 600 = 1/10/30-Schema; 601 = einheitlich 10 Jahre.

---

## TEIL E — Fristen-Synthese-Tabelle (für künftige Erbrechts-Fristen-Engine)

| Klage / Recht | Frist | Beginn (dies a quo) | Norm |
|---|---|---|---|
| **Ungültigkeitsklage** (relativ) | **1 Jahr** | Kenntnis von Verfügung **und** Ungültigkeitsgrund | Art. 521 Abs. 1 |
| Ungültigkeitsklage (absolut) | **10 Jahre** | Eröffnung der Verfügung | Art. 521 Abs. 1 |
| Ungültigkeitsklage gegen **Bösgläubigen** (Gründe 519 Ziff. 1+3, nicht Formmangel) | **30 Jahre** | Eröffnung der Verfügung | Art. 521 Abs. 2 |
| Ungültigkeit **einredeweise** | unverjährbar / jederzeit | — | Art. 521 Abs. 3 |
| **Herabsetzungsklage** (relativ) | **1 Jahr** | Kenntnis der Verletzung der Pflichtteilsrechte | Art. 533 Abs. 1 |
| Herabsetzung (absolut, Testament) | **10 Jahre** | **Eröffnung** der letztwilligen Verfügung | Art. 533 Abs. 1 |
| Herabsetzung (absolut, lebzeitige Zuwendung) | **10 Jahre** | **Tod** des Erblassers | Art. 533 Abs. 1 |
| Herabsetzung bei nachträglich gültig gewordener früherer Verfügung | 1 J. / 10 J. | ab Ungültigerklärung der späteren Verfügung | Art. 533 Abs. 2 |
| Herabsetzung **einredeweise** | unverjährbar / jederzeit | — | Art. 533 Abs. 3 |
| **Erbschaftsklage** vs. Gutgläubiger (relativ) | **1 Jahr** | Kenntnis von Besitz des Beklagten + eigenem besseren Recht | Art. 600 Abs. 1 |
| Erbschaftsklage (absolut) | **10 Jahre** | Tod des Erblassers **oder** Eröffnung der Verfügung | Art. 600 Abs. 1 |
| Erbschaftsklage vs. **Bösgläubiger** | **30 Jahre** | (stets) Tod / Eröffnung | Art. 600 Abs. 2 |
| **Vermächtnisklage** | **10 Jahre** | Mitteilung der Verfügung oder spätere Fälligkeit | Art. 601 |
| Haftung Verzichtender bei Zahlungsunfähigkeit (materiell, keine Verj.) | Gegenleistung der **letzten 5 Jahre** | vor Tod des Erblassers | Art. 497 |
| Herabsetzbare **Schenkungen** (materielle Schranke) | **letzte 5 Jahre** vor Tod (+ frei widerrufliche zeitlos) | vor Tod | Art. 527 Ziff. 3 |
| **Annahmeerklärung Willensvollstrecker** (Schweigen = Annahme) | **14 Tage** | ab Mitteilung des Auftrags | Art. 517 Abs. 2 |
| Verfall der **mündlichen** (Not-)Verfügung | **14 Tage** | ab Wiedermöglichkeit anderer Form | Art. 508 |

**Engine-Designhinweise:**
1. Das **1/10/30-Muster** (relativ-Kenntnis / absolut / 30 J. gegen Bösgläubige) wiederholt sich in 521 und 600 → gemeinsames Fristen-Grundmuster (vgl. §4 CLAUDE.md: nur fachneutrale Infrastruktur teilen). **Aber:** die `Bösgläubig-30-Jahre`-Erweiterung gilt bei 521 **nur für Ziff. 1+3, nicht Formmangel** — diese Differenz muss erhalten bleiben, nicht „vereinheitlicht" werden.
2. Der **dies a quo** ist normabhängig: Ungültigkeit ab **Eröffnung der Verfügung**; Herabsetzung ab **Eröffnung (Testament) bzw. Tod (lebzeitige Zuwendung)** — getrennt führen.
3. **Einrede-Unverjährbarkeit** (521 III, 533 III) als eigenes Flag (keine Fristberechnung, sondern „jederzeit einredeweise").
4. 5-Jahres-Linien (497, 527 Ziff. 3) und 14-Tage-Fristen (508, 517) sind **materielle/prozessuale Sonderfristen**, nicht das 1/10/30-Muster — separat modellieren.

---

## Audit-Zusammenfassung (Template-Hook)
Die bestehende Vorlage `src/lib/vorlagen/testament.ts` (eigenhändiges Testament, Art. 505) **erfüllt alle drei zwingenden Formanforderungen** von Art. 505 ZGB: Handschriftlichkeit (über `ausgabeArt: 'abschrift'` + Disclaimer), vollständiges Datum (GATE-3, hart blockierend, gestützt auf 505 Abs. 1 / 520a) und Unterschrift (C12). Der Generalwiderruf (C02, Default `true`) adressiert korrekt die Vermutungsregel von Art. 511. Bewusste Auslassungen (Nacherbe/490, Nutzniessung/530, Enterbung, Stiftung/493, Erbvertrag/512) sind sachlich richtig, da diese entweder Beurkundung/Behördenmitwirkung erfordern oder nicht regelbasiert generierbar sind (§2/§8). **Keine Formlücke gefunden.** Optionale Verbesserung: expliziter Hinweis, dass nachträgliche, undatierte Zusätze die Eigenhändigkeit/Datierung gefährden.

## Quellen / Verifikationsstand
- **Wortlaut:** lokaler Cache `/tmp/zgb.html` (Fedlex SR 210), Anker `id="art_481"`…`id="art_601"`, verbatim extrahiert (1099 `art_`-Anker im Dokument; alle Zielartikel 481–533, 598–601 gefunden).
- **Revisionsmarker 2023** empirisch im Text bestätigt für **Art. 494, 522, 523, 529, 532** («Fassung gemäss Ziff. I des BG vom 18. Dez. 2020 (Erbrecht), in Kraft seit 1.1.2023, AS 2021 312 / BBl 2018 5813»). Fristennormen 521/533/600 **ohne** 2023-Marker → unverändert.
- **Alle BGE-/Lehrhinweise sind [Sekundär]** und vor einer `verified:true`-Setzung an der amtlichen Sammlung gegenzuprüfen (§7). Keine Repo-Datei wurde geändert.

---

## TEIL 3 — Erbgang + Teilung (Fristen-/Behörden-Synthese)

# ERBRECHT-REGELWERK Teil 3 — ERBGANG + TEILUNG (ZGB)

**Quelle:** `/tmp/zgb.html` (Fedlex SR 210, Schweizerisches Zivilgesetzbuch, **Stand 1. Januar 2026**). Abrufdatum 5.6.2026. Alle Wortlaut-Kerne verbatim aus dem Cache extrahiert; Fußnoten/Randtitel bereinigt. Revisionshinweise: Erbrechtsrevision BG 18.12.2020 (AS 2021 312, i.K. 1.1.2023) betrifft v.a. Pflichtteile (Teil 1/2 dieses Regelwerks), nicht den hier behandelten Erbgang/Teilungsabschnitt; Art. 537 f. in der Fassung des GestG (i.K. 1.1.2001).

---

## 1. Eröffnung des Erbganges (Art. 537–550)

| Art. | Wortlaut-Kern (verbatim) | Regel / Engine-Hinweis |
|---|---|---|
| **537** | «Der Erbgang wird durch den **Tod des Erblassers eröffnet**.» Lebzeitige Zuwendungen/Teilungen werden nach dem Stand der Erbschaft beim Tod berücksichtigt. | **Anknüpfungszeitpunkt = Todesdatum.** Engine: Todesdatum ist Fixpunkt für Rechtsstand, Bewertung, Fristbeginne. |
| **538** | «Die Eröffnung des Erbganges erfolgt für die Gesamtheit des Vermögens **am letzten Wohnsitze des Erblassers**.» (Abs. 2 aufgehoben, GestG.) | **Universalität am letzten Wohnsitz** → Grundlage für örtliche Behörden-/Gerichtszuständigkeit (Art. 28 ZPO). |
| **539** | Jedermann erbfähig, sofern nicht erbunfähig. Zuwendung an Personenmehrheit ohne Rechtspersönlichkeit → alle Zugehörigen bzw. Stiftung. | Erbfähigkeit. |
| **540** | **Erbunwürdig:** Ziff. 1 vorsätzliche/rechtswidrige Tötung o. Versuch; 2. Herbeiführung bleibender Verfügungsunfähigkeit; 3. Arglist/Zwang/Drohung bzgl. Verfügung; 4. vorsätzliche Beseitigung/Ungültigmachung einer Verfügung. **Verzeihung hebt Unwürdigkeit auf.** | Erbunwürdigkeit wirkt von Gesetzes wegen. |
| **541** | Unfähigkeit nur für den Unwürdigen selbst; **seine Nachkommen beerben, wie wenn er vorverstorben wäre**. | Repräsentation. |
| **542** | Erbe muss Erbgang in erbfähigem Zustand **erleben**. Stirbt er danach → Recht vererbt sich auf seine Erben (Erbenerben). | Kommorienten/Transmission. |
| **543** | Vermächtnisnehmer erwirbt Anspruch bei Erleben; Vorversterben → Vermächtnis fällt weg zugunsten des Beschwerten. | |
| **544** | **Kind ab Empfängnis erbfähig unter Vorbehalt Lebendgeburt.** Kindesschutzbehörde errichtet ggf. Beistandschaft. Totgeburt → fällt ausser Betracht. | Nasciturus. **Behörde: KESB.** |
| **545** | Nacherbeneinsetzung/Nachvermächtnis zugunsten noch nicht lebender Person; ohne genannten Vorerben → gesetzliche Erben als Vorerben. | |
| **546** | **Verschollenheit:** Erben/Bedachte leisten vor Auslieferung **Sicherheit**: **5 Jahre** (Verschwinden in hoher Todesgefahr, ab Auslieferung), **15 Jahre** (nachrichtlose Abwesenheit, ab letzter Nachricht), höchstens bis Erblasser 100 Jahre alt wäre. | **FRIST 5/15 J.** Engine-relevant. |
| **547** | Rückkehr/bessere Berechtigte → Herausgabe nach Besitzesregeln; gutgläubige Eingewiesene haften nur während Frist der Erbschaftsklage. | |
| **548** | Erbe verschwunden, Leben/Tod im Erbgangszeitpunkt unbeweisbar → Anteil unter amtliche Verwaltung. Antrag auf Verschollenerklärung: **1 Jahr** (hohe Todesgefahr) bzw. **5 Jahre** (letzte Nachricht) **beim Gericht**. | **FRIST 1/5 J., Behörde: Gericht.** |
| **549** | Wechselseitige Berufung auf bereits erwirkte Einweisung/Verschollenerklärung zwischen Miterben. | |
| **550** | **Verfahren von Amtes wegen:** nach **10 Jahren** amtl. Verwaltung oder Alter 100 → Verschollenerklärung von Amtes wegen auf Verlangen der zuständigen Behörde; nach Auskündungsfrist ohne Berechtigte → Vermögen an erbberechtigtes Gemeinwesen / Heimatkanton. | **FRIST 10 J. Behörde: zuständige Behörde / Gericht.** |
| **560** | **Erwerb von Gesetzes wegen:** «Die Erben **erwerben die Erbschaft als Ganzes mit dem Tode des Erblassers kraft Gesetzes**.» Forderungen, Eigentum, beschränkte dingliche Rechte, Besitz gehen ohne weiteres über; **Schulden werden persönliche Schulden der Erben**. Erwerb eingesetzter Erben auf Eröffnungszeitpunkt zurückbezogen. | **Universalsukzession + ipso-iure-Schuldenhaftung** — Kernbegründung für Ausschlagung/öffentl. Inventar/amtl. Liquidation als Haftungsbegrenzung. |

---

## 2. Sicherungsmassregeln (Art. 551–559)

| Art. | Wortlaut-Kern (verbatim) | Regel / Frist / Behörde |
|---|---|---|
| **551** | «Die **zuständige Behörde** hat **von Amtes wegen** die zur Sicherung des Erbganges nötigen Massregeln zu treffen.» Insbesondere: **Siegelung, Inventaraufnahme, Erbschaftsverwaltung, Eröffnung letztwilliger Verfügungen**. | **Behörde von Amtes wegen** — kantonal organisierte Erbschaftsbehörde am letzten Wohnsitz. |
| **552** | Siegelung wird angeordnet, soweit das **kantonale Recht** sie vorsieht. | Kantonal. |
| **553** | **Sicherungs-Inventar** angeordnet, wenn: 1. minderjähriger Erbe unter Vormundschaft; 2. Erbe dauernd ohne Vertretung abwesend; 3. ein Erbe oder die **Erwachsenenschutzbehörde** es verlangt; 4. volljähriger Erbe unter umfassender Beistandschaft. Nach kant. Recht, **i.d.R. binnen 2 Monaten seit dem Tod**. Kantonal erweiterbar. | **FRIST: 2 Monate (Ordnungsfrist). Behörde: zuständige Behörde / KESB.** |
| **554** | **Erbschaftsverwaltung** angeordnet: 1. Erbe dauernd ohne Vertretung abwesend (sofern Interessen es erfordern); 2. Erbrecht eines Ansprechers nicht genügend nachweisbar / Vorhandensein eines Erben ungewiss; 3. nicht alle Erben bekannt; 4. gesetzlich vorgesehene Sonderfälle. **Willensvollstrecker** → diesem Verwaltung übergeben. Bei vermögensumfassender Beistandschaft → Beistand. | Behörde ordnet an; ggf. Willensvollstrecker/Beistand. |
| **555** | Ungewissheit über (alle) Erben → **öffentliche Aufforderung, sich binnen Jahresfrist zu melden**. Keine Anmeldung + keine bekannten Erben → Erbschaft an erbberechtigtes Gemeinwesen (Vorbehalt Erbschaftsklage). | **FRIST: 1 Jahr (Rechnungsruf an Erben).** |
| **556** | **Einlieferungspflicht:** «Findet sich beim Tode des Erblassers eine letztwillige Verfügung vor, so ist sie der Behörde **unverweilt einzuliefern**, und zwar auch dann, wenn sie als ungültig erachtet wird.» Jeder Verwahrer/Finder bei **persönlicher Verantwortlichkeit** verpflichtet, sobald er vom Tod Kenntnis hat. Danach: einstweilige Überlassung an gesetzl. Erben oder Erbschaftsverwaltung. | **PFLICHT «unverweilt». Behörde: Einlieferungsbehörde (kantonal). Haftung bei Verletzung.** |
| **557** | **Testamentseröffnung:** «Die Verfügung … muss **binnen Monatsfrist nach der Einlieferung** von der zuständigen Behörde eröffnet werden.» Bekannte Erben werden vorgeladen. Mehrere Verfügungen: alle einliefern und eröffnen. | **FRIST: 1 Monat ab Einlieferung. Behörde: zuständige (Eröffnungs-)Behörde.** |
| **558** | Alle Beteiligten erhalten **auf Kosten der Erbschaft eine Abschrift**, soweit sie betroffen sind; Bedachte unbekannten Aufenthalts → öffentliche Auskündung. | Mitteilung. |
| **559** | **Erbenschein (Erbbescheinigung):** «**Nach Ablauf eines Monats seit der Mitteilung** an die Beteiligten wird den eingesetzten Erben, wenn die gesetzlichen Erben oder früher Bedachte deren Berechtigung **nicht ausdrücklich bestritten** haben, **auf ihr Verlangen** von der Behörde eine Bescheinigung darüber ausgestellt, dass sie **unter Vorbehalt der Ungültigkeits- und der Erbschaftsklage als Erben anerkannt** seien.» Zugleich Anweisung an Erbschaftsverwalter zur Auslieferung. | **ZENTRAL für die Praxis.** **FRIST: 1 Monat seit Mitteilung (Art. 558) + kein ausdrücklicher Einspruch.** **Voraussetzungen:** eingesetzte Erben, Fristablauf, keine Bestreitung. **Wirkung:** Legitimationsurkunde (Ausweis der Verfügungsbefugnis), nur provisorisch — Vorbehalt Ungültigkeits-/Erbschaftsklage; kein materieller Erbrechtsentscheid. **Behörde: zuständige (kantonale) Behörde am letzten Wohnsitz.** |

---

## 3. Ausschlagung (Art. 566–579)

| Art. | Wortlaut-Kern (verbatim) | Regel / Frist / Behörde |
|---|---|---|
| **566** | «Die gesetzlichen und die eingesetzten Erben haben die **Befugnis, die Erbschaft … auszuschlagen**.» **Abs. 2:** Ist die **Zahlungsunfähigkeit des Erblassers im Todeszeitpunkt amtlich festgestellt oder offenkundig, so wird die Ausschlagung vermutet.** | **Ausschlagungsvermutung bei Überschuldung** (keine aktive Erklärung nötig). |
| **567** | «Die **Frist zur Ausschlagung beträgt drei Monate**.» Beginn: **gesetzliche Erben** — Kenntnis vom Tod des Erblassers (sofern nicht nachweisbar später Kenntnis vom Erbfall); **eingesetzte Erben** — Zugang der **amtlichen Mitteilung** der Verfügung. | **FRIST: 3 Monate. Beginn je Erbe individuell (Kenntnis).** Kern der Engine. |
| **568** | Wurde ein **Sicherungs-Inventar** (Art. 553) aufgenommen, beginnt die 3-Monats-Frist **für alle Erben** mit dem Tag der **behördlichen Mitteilung des Inventarabschlusses**. | **Alternativer Fristbeginn (einheitlich für alle).** |
| **569** | Stirbt Erbe vor Ausschlagung/Annahme → Befugnis geht auf seine Erben über; Frist ab deren Kenntnis vom Anfall, frühestens mit Ablauf der eigenen Frist gegenüber ihrem Erblasser. Bei Ausschlagung mit Anfall an vorher nicht Berechtigte: Frist ab deren Kenntnis von der Ausschlagung. | Transmission der Ausschlagungsbefugnis. |
| **570** | **Form:** Erklärung **bei der zuständigen Behörde mündlich oder schriftlich**, **unbedingt und vorbehaltlos**. Behörde **führt ein Protokoll** über die Ausschlagungen. | **Behörde: zuständige (kantonale) Behörde — Entgegennahme + Protokoll.** |
| **571** | **Verwirkung:** Keine Ausschlagungserklärung innert Frist → **Erbschaft vorbehaltlos erworben**. **Einmischung** (Handlungen über blosse Verwaltung/Geschäftsfortgang hinaus) oder **Aneignung/Verheimlichung** von Erbschaftssachen → Erbe **kann nicht mehr ausschlagen**. | **Verwirkung durch Einmischung / Fristablauf.** |
| **572** | Ausschlagung eines Miterben (ohne Verfügung) → Anteil vererbt sich wie bei Nichterleben; bei Verfügung → an nächste gesetzliche Erben des Ausschlagenden (sofern kein anderer Wille). | Anwachsung/Eintritt. |
| **573** | **Ausschlagung aller nächsten gesetzlichen Erben → Liquidation durch das Konkursamt.** Überschuss nach Schuldendeckung an die Berechtigten, wie wenn keine Ausschlagung. | **Behörde: Konkursamt.** |
| **574** | Nachkommen schlagen aus → Behörde benachrichtigt überlebenden Ehegatten; **Annahme binnen Monatsfrist** möglich. | **FRIST: 1 Monat (Ehegatte).** |
| **575** | Ausschlagung zugunsten nachfolgender Erben: Anfrage an folgende Erben; ohne Annahmeerklärung **binnen Monatsfrist** → auch von ihnen ausgeschlagen. | **FRIST: 1 Monat.** |
| **576** | **Fristverlängerung:** «Aus wichtigen Gründen kann die **zuständige Behörde** … eine Fristverlängerung gewähren oder eine neue Frist ansetzen.» | Erstreckung der 3-Monats-Frist. |
| **577** | Ausschlagung eines Vermächtnisses → fällt zugunsten des Beschwerten weg (sofern kein anderer Wille). | |
| **578** | **Überschuldeter Erbe** schlägt zur Gläubigerbenachteiligung aus → Gläubiger/Konkursverwaltung können **binnen 6 Monaten anfechten**, wenn Forderungen nicht sichergestellt → **amtliche Liquidation**. | **FRIST: 6 Monate (Anfechtung). Behörde: amtl. Liquidation.** |
| **579** | **Haftungsfolge bei Ausschlagung:** Schlagen Erben eines **zahlungsunfähigen** Erblassers aus, haften sie dessen Gläubigern dennoch, soweit sie **innerhalb der letzten 5 Jahre vor dem Tod** ausgleichungspflichtige Vermögenswerte empfangen haben. Landesübliche Heiratsausstattung + Erziehungs-/Ausbildungskosten ausgenommen. Gutgläubige nur, soweit noch bereichert. | **FRIST/Rückgriffsperiode: 5 Jahre. Verknüpfung zu Ausgleichung (Art. 626 ff.).** |

---

## 4. Öffentliches Inventar (Art. 580–592)

| Art. | Wortlaut-Kern (verbatim) | Regel / Frist / Behörde |
|---|---|---|
| **580** | «Jeder Erbe, der die Befugnis hat, die Erbschaft auszuschlagen, ist berechtigt, ein **öffentliches Inventar** zu verlangen. Das Begehren muss **binnen Monatsfrist** in der gleichen Form wie die Ausschlagung bei der zuständigen Behörde angebracht werden.» Begehren eines Erben gilt für alle. | **FRIST: 1 Monat (Antrag). Behörde: zuständige (kantonale) Behörde.** |
| **581** | Errichtung durch zuständige Behörde nach kant. Recht: **Verzeichnis der Vermögenswerte und Schulden mit Schätzung**. Auskunftspflicht aller Wissensträger bei Verantwortlichkeit; Erben melden bekannte Schulden. | **Behörde: zuständige Behörde, kantonales Verfahren.** |
| **582** | **Rechnungsruf:** öffentliche Auskündung; Gläubiger und Schuldner (inkl. Bürgschaftsgläubiger) **melden binnen bestimmter Frist** Forderungen/Schulden an; Hinweis auf Folgen der Nichtanmeldung. **Frist ≥ 1 Monat ab erster Auskündung.** | **FRIST: mind. 1 Monat (Rechnungsruf).** |
| **583** | Forderungen/Schulden aus öffentlichen Büchern/Papieren von Amtes wegen aufgenommen; Anzeige an Schuldner/Gläubiger. | |
| **584** | Nach Auskündungsfrist: Inventar geschlossen, **mind. 1 Monat zur Einsicht aufgelegt**. Kosten von Erbschaft, sonst von den antragstellenden Erben. | **FRIST: 1 Monat Auflage.** |
| **585** | Während Inventar nur notwendige Verwaltungshandlungen; Geschäftsfortführung durch Erben → Miterben können Sicherstellung verlangen. | |
| **586** | **Betreibung für Schulden des Erblassers während des Inventars ausgeschlossen**; Prozesse (ausser dringende) ruhen — weder Fortsetzung noch Anhebung. | Betreibungs-/Prozesssperre. |
| **587** | **Erklärungsfrist:** «Nach Abschluss des Inventars wird jeder Erbe aufgefordert, sich **binnen Monatsfrist** über den Erwerb … zu erklären.» Behörde kann weitere Frist für Schätzungen/streitige Ansprüche einräumen. | **FRIST: 1 Monat (Erklärung).** |
| **588** | **Optionen** in der Frist: **ausschlagen / amtliche Liquidation verlangen / unter öffentlichem Inventar annehmen / vorbehaltlos annehmen**. **Keine Erklärung → Annahme unter öffentlichem Inventar** (gesetzliche Fiktion). | **Default bei Schweigen = Annahme u. öffentl. Inventar.** |
| **589** | **Wirkung:** Im Inventar verzeichnete Schulden + Vermögenswerte gehen über; Erwerb auf Eröffnung zurückbezogen; **für inventarisierte Schulden haftet der Erbe mit Erbschaft UND eigenem Vermögen**. | Haftung nach Inventar. |
| **590** | **Haftung ausser Inventar:** Für **nicht angemeldete** (versäumte) Forderungen **keine Haftung** (weder persönlich noch mit Erbschaft). Bei unverschuldeter Nichtanmeldung / trotz Anmeldung nicht aufgenommen → Haftung nur soweit aus Erbschaft bereichert. Pfandgesicherte Forderungen bleiben durchsetzbar. | **Haftungsbeschränkung = Kernwirkung.** |
| **591** | Bürgschaftsschulden gesondert aufgezeichnet; nur bis zum konkursmässigen Anteil geltend zu machen. | |
| **592** | Erbschaft an Gemeinwesen → von Amtes wegen Rechnungsruf; Haftung nur im Umfang der erworbenen Vermögenswerte. | |

---

## 5. Amtliche Liquidation (Art. 593–597) + Verhältnis zur konkursamtlichen

| Art. | Wortlaut-Kern (verbatim) | Regel / Frist / Behörde |
|---|---|---|
| **593** | Jeder Erbe kann **statt Ausschlagung/Annahme u. Inventar die amtliche Liquidation verlangen**. **Solange ein Miterbe die Annahme erklärt, ist dem Begehren keine Folge zu geben.** Bei amtl. Liquidation **keine Erbenhaftung für Erbschaftsschulden**. | **Erbenbegehren; Sperre bei Annahme eines Miterben.** |
| **594** | **Gläubigerbegehren:** begründete Besorgnis + keine Befriedigung/Sicherstellung → **binnen 3 Monaten ab Tod oder Eröffnung der Verfügung** amtl. Liquidation verlangen. Vermächtnisnehmer: vorsorgliche Sicherungsmassregeln. | **FRIST: 3 Monate (Gläubiger).** |
| **595** | Durchführung **durch die zuständige Behörde oder beauftragte Erbschaftsverwalter**; beginnt mit Inventar + Rechnungsruf; Verwalter unter Aufsicht der Behörde; **Beschwerde der Erben** an die Behörde. | **Behörde: zuständige Behörde + Aufsicht; Erbschaftsverwalter.** |
| **596** | **Ordentliche Liquidation:** laufende Geschäfte beenden, Verpflichtungen erfüllen, Forderungen einziehen, Vermächtnisse möglichst ausrichten, Rechte/Pflichten ggf. gerichtlich feststellen, Vermögen versilbern. **Grundstücksveräusserung durch öffentliche Versteigerung**, freihändig nur mit Zustimmung aller Erben. | |
| **597** | **Konkursamtliche Liquidation:** «Ist die Erbschaft **überschuldet**, so erfolgt die Liquidation **durch das Konkursamt nach den Vorschriften des Konkursrechtes**.» | **Abgrenzung: solvente Erbschaft → ordentliche amtl. Liquidation (Behörde/Verwalter); überschuldet → Konkursamt nach SchKG.** Vgl. Art. 573 (Ausschlagung aller) und Art. 578 II. |

---

## 6. Erbteilung (Art. 602–640) + Ausgleichung — mit Engine-Audit

| Art. | Wortlaut-Kern (verbatim) | Regel / Engine-Hinweis |
|---|---|---|
| **602** | **Erbengemeinschaft:** Bei mehreren Erben besteht bis zur Teilung eine **Gemeinschaft aller Rechte und Pflichten**; **Gesamteigentum**, gemeinsame Verfügung. Auf Begehren eines Miterben kann die **zuständige Behörde** eine **Erbenvertretung** bestellen. | Gesamthandsprinzip. **Behörde: Erbenvertreter-Bestellung.** |
| **604** | **Teilungsanspruch:** «Jeder Miterbe kann **zu beliebiger Zeit die Teilung** verlangen», soweit nicht durch Vertrag/Gesetz gebunden. **Gericht** kann vorübergehende Verschiebung anordnen, wenn sofortige Teilung den Wert erheblich schädigte. Miterben eines zahlungsunfähigen Erben: vorsorgliche Massregeln. | **Behörde: Gericht (Teilungsklage / Verschiebung).** |
| **607** | Gesetzliche und eingesetzte Erben teilen nach gleichen Grundsätzen; **freie Teilungsvereinbarung** zulässig; Auskunftspflicht der besitzenden/schuldenden Miterben. | Teilungsfreiheit. |
| **610** | Gleicher Anspruch aller auf die Gegenstände; umfassende **Mitteilungspflicht** über das Verhältnis zum Erblasser; jeder kann **Tilgung/Sicherstellung der Schulden vor der Teilung** verlangen. | |
| **611** | **Losbildung:** so viele Lose wie Erben/Erbstämme; bei Uneinigkeit bildet **die zuständige Behörde** die Lose; Verteilung nach Vereinbarung oder Losziehung. | **Behörde: Losbildung bei Streit.** |
| **612** | Wertmindernd teilbare Sache → ungeteilt einem Erben zuweisen; sonst **Verkauf** und Erlösteilung; auf Verlangen **Versteigerung** (öffentlich oder unter Erben — Behörde entscheidet). | |
| **613** | Zusammengehörige Gegenstände nicht trennen (bei Einspruch); Familienschriften/Erinnerungsstücke nicht veräussern (bei Widerspruch); sonst entscheidet die **zuständige Behörde**. | |
| **614** | **Forderungen des Erblassers gegen einen Erben** sind diesem bei der Teilung **anzurechnen**. | Anrechnung. |
| **617** | **Bewertung Grundstücke:** «Grundstücke sind den Erben zum **Verkehrswert** anzurechnen, der ihnen **im Zeitpunkt der Teilung** zukommt.» | **Anrechnungswert = Verkehrswert im Teilungszeitpunkt** (anders als Ausgleichungswert Art. 630). Engine-relevant für Zuweisung. |
| **626** | **AUSGLEICHUNG (Grundnorm):** «Die **gesetzlichen Erben** sind gegenseitig verpflichtet, **alles zur Ausgleichung zu bringen, was ihnen der Erblasser bei Lebzeiten auf Anrechnung an ihren Erbanteil zugewendet hat**.» **Abs. 2:** Was der Erblasser **Nachkommen** als **Heiratsgut, Ausstattung, Vermögensabtretung, Schulderlass u.dgl.** zugewendet hat, unterliegt der Ausgleichung, **sofern nicht ausdrücklich das Gegenteil verfügt** (Ausgleichungsvermutung für Nachkommen). | **Kern der Ausgleichung.** |
| **627** | Wegfall eines Erbenpflicht geht auf eintretende Erben über; Nachkommen ausgleichungspflichtig auch ohne Weitergabe der Zuwendung. | |
| **628** | **Wahlrecht: Einwerfung in Natur ODER Anrechnung dem Werte nach**, auch bei Übersteigen des Erbanteils. Vorbehalt: abweichende Anordnungen + Herabsetzungsansprüche. | |
| **629** | Überschuss über Erbanteil nur auszugleichen, wenn keine Begünstigungsabsicht; **Begünstigung vermutet bei üblichen Heiratsausstattungen**. | |
| **630** | **Ausgleichungswert:** «Die Ausgleichung erfolgt nach dem **Werte der Zuwendungen zur Zeit des Erbganges** oder, wenn die Sache vorher veräussert worden ist, nach dem dafür erzielten Erlös.» Verwendungen/Schaden/Früchte nach Besitzesregeln. | **Bewertungszeitpunkt = Erbgang (≠ Art. 617 Teilungszeitpunkt für Grundstückszuweisung).** Engine-kritische Unterscheidung. |
| **631** | **Erziehungs-/Ausbildungskosten** nur ausgleichungspflichtig, soweit übliches Mass übersteigend; angemessener **Vorausbezug** für noch in Ausbildung stehende / gebrechliche Kinder. | |
| **632** | **Übliche Gelegenheitsgeschenke** unterliegen **nicht** der Ausgleichung. | |
| **633** | **Aufgehoben.** | (kein Inhalt) |
| **634** | **Teilungsvertrag** wird verbindlich mit Aufstellung/Entgegennahme der Lose oder Vertragsschluss; **bedarf der schriftlichen Form**. | Formvorschrift. |
| **635** | Abtretung von Erbanteilen unter Miterben: **schriftliche Form**; mit Drittem → nur Anspruch auf zugewiesenen Anteil, kein Mitwirkungsrecht. | |
| **636** | Verträge über noch nicht angefallene Erbschaft ohne Mitwirkung/Zustimmung des Erblassers **nicht verbindlich**; Rückforderung erbrachter Leistungen. | |
| **637** | **Gewährleistung der Miterben** wie Käufer/Verkäufer; Bestand der Forderungen + Zahlungsfähigkeit des Schuldners (wie einfache Bürgen). **Verjährung: 1 Jahr** nach Teilung bzw. späterer Fälligkeit. | **FRIST: 1 Jahr (Gewährleistung).** |
| **638** | Anfechtung des Teilungsvertrags nach allgemeinen Vertragsregeln. | |
| **639** | **Solidarhaftung gegenüber Dritten:** Für Erblasserschulden haften Erben **auch nach der Teilung solidarisch mit ganzem Vermögen**, bis Gläubiger der Teilung/Übernahme zustimmen. **Verjährung: 5 Jahre** nach Teilung bzw. späterer Fälligkeit. | **FRIST: 5 Jahre (Solidarhaftung).** |
| **640** | **Rückgriff** unter Miterben für überzahlte Schulden; zunächst gegen den Übernehmer, sonst im Verhältnis der Erbanteile. | |

### Engine-Audit: `src/lib/erbteilung.ts` (NUR gelesen)

**Befund: Die bestehende Engine bildet die Ausgleichung NICHT ab — bestätigter offener Ausbaupunkt.**

- `erbteilung.ts` berechnet ausschliesslich: (1) güterrechtliche Vorstufe (`gueterrecht()`: Errungenschaftsbeteiligung/Gütertrennung/Gütergemeinschaft), (2) **gesetzliche Erbquoten** im Parentelsystem (Art. 457/458/459/462), (3) **Pflichtteile** (Art. 470/471, neu/alt via Übergangsrecht), (4) verfügbare Quote, (5) Hinweise (Art. 472, 473). Alle Ergebnisse als exakte Brüche.
- **Keine Ausgleichungslogik vorhanden.** Die Engine deklariert dies selbst explizit als Lücke — `erbteilung.ts:309`:
  > «Ausgleichung von Vorempfängen unter Nachkommen (Art. 626 ff. ZGB) kann die effektive Teilung verschieben und ist hier nicht modelliert.»
- Ebenso ungemodellt (Warnungen Z. 307–310): Realteilung einzelner Gegenstände, Hinzurechnungen (Art. 475/476), Herabsetzungsreihenfolge (Art. 532), internationale Sachverhalte.
- **Katalog-Bestätigung:** `startseiteConfig.ts:455–461` führt einen Rechner `erb-ausgleichung` («Erbrechtliche Ausgleichung & Güterrecht») mit **`status: 'geplant'`** und **`norms: []`** — d.h. konzeptuell vorgesehen, aber **noch nicht implementiert**. Es existiert **keine** `ausgleichung*.ts` Engine im `src/lib/`.
- **Fazit für Ausbau:** Eine Ausgleichungs-Engine müsste die in Art. 626–632 kodierten Regeln neu abbilden — insbesondere die **Bewertungszeitpunkt-Differenz** Art. 630 (Erbgang) vs. Art. 617 (Teilung), das Wahlrecht Art. 628, Begünstigungs-/Ausstattungsvermutungen (Art. 626 II, 629), Erziehungskosten (Art. 631), Gelegenheitsgeschenke (Art. 632) sowie die Querverbindung zu Art. 579 (5-Jahres-Rückgriffshaftung). Wegen §1/§4 CLAUDE.md als **eigenständige Engine** (nicht Fusion mit `erbteilung.ts`).

---

## 7. Behörden-Synthese (Aufgabe → Norm → kantonale Organisation)

Bundesrechtlicher Rahmen: **Art. 28 ZPO** regelt den Gerichtsstand für erbrechtliche **Klagen** (letzter Wohnsitz; Abs. 1 dispositiv). **Art. 28 Abs. 2 ZPO** stellt klar, dass für die **Massnahmen im Zusammenhang mit dem Erbgang** die **Behörde am letzten Wohnsitz zwingend zuständig** ist — die behördlichen Sicherungs-/Eröffnungsakte sind also bundesrechtlich am letzten Wohnsitz (Art. 538) verankert, ihre **Organisation überlässt das ZGB durchgehend dem kantonalen Recht** («zuständige Behörde», vgl. Art. 551, 581 «nach Vorschriften des kantonalen Rechtes»). Dies deckt sich mit `zustaendigkeit.ts:439`, das genau diese Abgrenzung (Klageweg ≠ Erbschaftsbehörde) bereits warnt.

| Aufgabe | Zuständige Stelle (Funktion) | Norm | Kantonale Organisation (Beispiele) |
|---|---|---|---|
| Sicherungsmassregeln von Amtes wegen (Siegelung, Inventar, Verwaltung, Eröffnung) | «zuständige Behörde» am letzten Wohnsitz | Art. 551, 538; Art. 28 Abs. 2 ZPO | kantonal: Erbschaftsamt / Erbschaftsbehörde / Bezirksgericht / Gemeinde / Notariat |
| Siegelung | nach kantonalem Recht | Art. 552 | kantonal: Friedensrichter/Gemeinde/Gericht — wo vorgesehen |
| Sicherungs-Inventar | zuständige Behörde (mit Bezug zur KESB/Erwachsenenschutzbehörde) | Art. 553 | kantonal: Erbschaftsbehörde; Auslöser KESB |
| Beistandschaft Nasciturus | Kindesschutzbehörde | Art. 544 | KESB |
| Erbschaftsverwaltung | zuständige Behörde; ggf. Willensvollstrecker/Beistand | Art. 554 | kantonal: Erbschaftsbehörde bestellt Verwalter |
| Aufforderung an unbekannte Erben (1 Jahr) | zuständige Behörde | Art. 555 | kantonal |
| **Einlieferung letztwilliger Verfügung** | Einlieferungsbehörde | Art. 556 | kantonal: Erbschaftsamt / Teilungsbehörde / Notariat |
| **Testamentseröffnung** (1 Mt.) | zuständige (Eröffnungs-)Behörde | Art. 557–558 | kantonal: Erbschaftsbehörde / Bezirksgericht / Notariat |
| **Erbenschein / Erbbescheinigung** | zuständige Behörde | Art. 559 | kantonal: Erbschaftsamt / Gericht / Notariat (je nach Kanton; «Erbgangsurkunde») |
| **Entgegennahme der Ausschlagung + Protokoll** | zuständige Behörde | Art. 570, 566; (Fristverlängerung Art. 576) | kantonal: Erbschaftsbehörde / Bezirksgericht / Friedensrichter |
| Liquidation bei Ausschlagung aller Erben | Konkursamt | Art. 573, 597 | Konkursamt (SchKG) |
| Öffentliches Inventar (Antrag, Rechnungsruf, Auflage) | zuständige Behörde | Art. 580–584 | kantonal: Erbschaftsamt / Bezirksgericht / Notariat |
| Amtliche Liquidation (ordentlich) | zuständige Behörde + Erbschaftsverwalter (unter Aufsicht) | Art. 595–596 | kantonal: Erbschaftsbehörde; Verwalter |
| Amtliche Liquidation bei Überschuldung | Konkursamt nach SchKG | Art. 597 | Konkursamt |
| Erbenvertretung / Losbildung / Streitentscheid bei Teilung | zuständige Behörde | Art. 602, 611, 612, 613 | kantonal: Erbschaftsbehörde / Teilungsbehörde |
| **Teilungsklage / Verschiebung** | **Gericht** am letzten Wohnsitz | Art. 604; Art. 28 ZPO | ordentliches Gericht (Klageweg) |
| Verschollenerklärung | Gericht | Art. 548, 550 | Gericht am letzten Wohnsitz |

---

## 8. Fristen-Synthese-Tabelle (für eine Erbgangs-Fristen-Engine)

| # | Handlung | Frist | Beginn (Anknüpfung) | Norm |
|---|---|---|---|---|
| 1 | Sicherungs-Inventar durchführen | **2 Monate** (Ordnungsfrist) | seit Tod des Erblassers | Art. 553 Abs. 2 |
| 2 | Anmeldung unbekannter Erben (Rechnungsruf an Erben) | **1 Jahr** | ab öffentlicher Aufforderung | Art. 555 |
| 3 | Testamentseröffnung durch Behörde | **1 Monat** | ab Einlieferung der Verfügung | Art. 557 |
| 4 | Erbenschein-Ausstellung frühestens (kein Einspruch) | **1 Monat** | seit Mitteilung an Beteiligte (Art. 558) | Art. 559 |
| 5 | **Ausschlagung** | **3 Monate** | je Erbe: gesetzl. = Kenntnis vom Tod; eingesetzt = amtl. Mitteilung der Verfügung | Art. 567 |
| 6 | Ausschlagung bei Sicherungs-Inventar | **3 Monate** | für ALLE: Mitteilung des Inventarabschlusses | Art. 568 |
| 7 | Ausschlagung durch Erbenerben (Transmission) | **3 Monate** | ab Kenntnis vom Anfall an ihren Erblasser; frühestens Ablauf eigener Frist | Art. 569 |
| 8 | Annahme durch Ehegatten (nach Ausschlagung der Nachkommen) | **1 Monat** | ab behördlicher Mitteilung | Art. 574 |
| 9 | Annahme durch nachfolgende Erben (Ausschlagung zu deren Gunsten) | **1 Monat** | ab Mitteilung der Ausschlagung | Art. 575 |
| 10 | Fristverlängerung / neue Frist Ausschlagung | (richterlich) | wichtige Gründe | Art. 576 |
| 11 | Anfechtung der gläubigerbenachteiligenden Ausschlagung | **6 Monate** | (durch Gläubiger/Konkursverwaltung) | Art. 578 |
| 12 | Haftung trotz Ausschlagung für Vorempfänge | **5 Jahre** (Rückgriffsperiode) | vor dem Tod empfangene ausgleichungspflichtige Werte | Art. 579 |
| 13 | Antrag öffentliches Inventar | **1 Monat** | wie Ausschlagungsfristbeginn (Form wie Ausschlagung) | Art. 580 |
| 14 | Rechnungsruf öffentl. Inventar (Anmeldefrist) | **mind. 1 Monat** | ab erster Auskündung | Art. 582 |
| 15 | Auflage des geschlossenen Inventars zur Einsicht | **mind. 1 Monat** | nach Inventarabschluss | Art. 584 |
| 16 | Erklärung des Erben über Erwerb (nach Inventar) | **1 Monat** (+ ggf. Erstreckung) | nach Inventarabschluss; Schweigen = Annahme u. öffentl. Inventar | Art. 587/588 |
| 17 | Amtliche Liquidation auf Gläubigerbegehren | **3 Monate** | ab Tod oder Eröffnung der Verfügung | Art. 594 |
| 18 | Verschollenerklärung — Antrag durch Anteilsberechtigte | **1 Jahr** (hohe Todesgefahr) / **5 Jahre** (letzte Nachricht) | ab Verschwinden bzw. letzter Nachricht | Art. 548 |
| 19 | Verschollenerklärung von Amtes wegen | **10 Jahre** amtl. Verwaltung (od. Alter 100) | ab Beginn amtl. Verwaltung | Art. 550 |
| 20 | Sicherheitsleistung Verschollenheit | **5 Jahre** / **15 Jahre** (max. bis Alter 100) | 5 J. ab Auslieferung / 15 J. ab letzter Nachricht | Art. 546 |
| 21 | Gewährleistungsklage unter Miterben (Verjährung) | **1 Jahr** | nach Teilung bzw. späterer Fälligkeit | Art. 637 |
| 22 | Solidarhaftung der Miterben für Erblasserschulden (Verjährung) | **5 Jahre** | nach Teilung bzw. späterer Fälligkeit | Art. 639 |

---

## Schlussbemerkungen / Verifikationshinweise (§7 CLAUDE.md)

- **Quelle empirisch geprüft:** Alle Artikel über Anker `id="art_X"` (im Cache als `<article id="art_X">`) verbatim extrahiert; Stand **1.1.2026**. Art. 538 Abs. 2 und Art. 633 sind **aufgehoben** (im Cache nur Fussnotenverweis, kein Sachinhalt) — korrekt so dargestellt.
- **Engine-Audit-Kernaussage:** Ausgleichung (Art. 626 ff.) ist **nicht** in `erbteilung.ts` modelliert (Engine deklariert die Lücke selbst, Z. 309) und im Katalog als `erb-ausgleichung` mit `status: 'geplant'` reserviert → **klarer offener Ausbaupunkt**, keine bestehende Implementierung.
- **Kantonale Behördenbezeichnungen** (Erbschaftsamt/-behörde, Teilungsbehörde, Notariat, Bezirksgericht, Friedensrichter) variieren je Kanton und sind im obigen Behörden-Raster als «kantonal: …» offengelegt, nicht abschliessend zugeordnet — vor produktiver Nutzung kantonal zu verifizieren (§8).
- **Relevante Repo-Dateien (nur gelesen):** `/Users/david/Desktop/LegalCalc/src/lib/erbteilung.ts`, `/Users/david/Desktop/LegalCalc/src/lib/zustaendigkeit.ts` (Art. 28 ZPO, Z. 148/199–202/439), `/Users/david/Desktop/LegalCalc/src/lib/startseiteConfig.ts` (Z. 455–461). Keine Dateien geändert.
