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

_(Bericht ausstehend.)_

---

## TEIL 3 — Erbgang + Teilung (Fristen-/Behörden-Synthese)

_(Bericht ausstehend.)_
