# Recherche-Dossier — Cluster «Erbrecht-Ausbau»

**Erstellt:** 6.6.2026 · **Bearbeiter:** Recherche-Agent (LexMetrik)
**Wortlaut-Quelle:** Fedlex SR 210 (ZGB), lokaler Cache `/tmp/zgb.html`,
Konsolidierungsstand empirisch **«1.1.2026»** (post-Erbrechtsrevision, BG vom
18.12.2020, AS 2021 312, i.K. 1.1.2023). Die ZGB-Wortlaute sind bereits im
**zweifach geprüften** Regelwerk `bibliothek/normen/erbrecht-regelwerk.md`
(Teil 1–3, Status «ZWEIFACH GEPRÜFT» 5./6.6.2026) verbatim erfasst — dieses
Dossier baut darauf auf und zitiert daraus; es wurde **kein** neuer
Fedlex-Abruf nötig (alle Zielartikel 567/568/580 ff./521/533/600/626–634
liegen im Regelwerk verbatim vor).

**Quellenlage:** ZGB-Wortlaut = [Primär, geprüft im Regelwerk]. BGE/Lehre =
**[Sekundär, zu verifizieren]**. Kantonale Beurkundungs-/Erbgangsbehörden =
teilweise in App (`vorsorgeauftrag.ts:beurkundungsHinweis`,
`bibliothek/behoerden/erbgangsbehoerden-kantone.md`), nicht abschliessend.

**Fachliche Abnahme durch David ausstehend (§7).** Dieses Dossier ändert keine
Engine; es ist Bau-Vorbereitung.

## Verifikations-TODOs (vor Implementierung / `verified:true`)
1. **[zu verifizieren] BGE zu Art. 533 «Kenntnis der Rechtsverletzung»** —
   relativer Fristbeginn setzt Kenntnis der *Verletzung* (nicht bloss des
   Todes) voraus; massgebliche Leitentscheide an amtl. Sammlung prüfen.
2. **[zu verifizieren] Art. 634 Grundstück-Sonderfall** — ob für Zuweisung
   eines Grundstücks im Teilungsvertrag öffentliche Beurkundung nötig ist
   (h.L./Praxis: Schriftform genügt für den Teilungsvertrag selbst; siehe
   Item 8). Wortlaut Art. 634 kennt **keine** Beurkundungspflicht.
3. **[zu verifizieren] Art. 494 Abs.-Zählung** — Auftrag nennt «494 Abs. 3
   Anfechtung lebzeitiger Schenkungen»; das Regelwerk (Teil 2) erfasst den
   2023 revidierten Anfechtungsmechanismus als **Art. 494 Abs. 2**.
   Abs.-Nummer am Cache nachschlagen (Abweichung offenlegen, §7).
4. **[zu verifizieren] BGE 151 III 81 / Art. 55 SchlT** (bereits in
   `beurkundungsHinweis` zitiert) — für Erbvertrag/öff. Testament wiederverwenden.

## Priorisierte Bau-Reihenfolge (Begründung in den Items)
1. **Erb-Fristen-Rechner** (Item 4–7) — höchste Wiederverwendung
   (`fristenEngine.ts` + Muster `allgemeineFrist.ts`), geringstes Rechtsrisiko,
   1/10/30- und 3-Monats-Muster sind hart kodierbar. **Aufwand S–M.**
2. **Vorlagen Erbverzicht / Erbteilungsvereinbarung-Gerüst** (Item 10/11) —
   `vorlagen/engine.ts` + `testament.ts`-Muster direkt nutzbar; Erbteilungs-
   vereinbarung ist die einzige formfreie (Schriftform!) → exportfähig.
   **Aufwand M.**
3. **Vorlagen öff. Testament / Erbvertrag** (Item 8/9) — nur
   Vorbereitungs-Entwurf + Checkliste (Export-Sperre `ausgabeArt:'entwurf'`),
   da Beurkundung zwingend. **Aufwand M.**
4. **Ausgleichungs-Rechner** (Item 1–3) — fachlich anspruchsvollster Teil
   (Bewertungszeitpunkt-Differenz 630/617, Wahlrecht 628, Vermutungen), eigene
   Engine `ausgleichung.ts`, Integration/Anbau an `erbteilung.ts`. **Aufwand L.**

---

# RECHNER 1 — Ausgleichung (Art. 626–632 ZGB)

## Item 1 — Nutzerfrage
«Mein Vater hat zu Lebzeiten meinem Bruder CHF 200'000 für den Hauskauf
gegeben und mir nichts. Müssen wir das bei der Teilung berücksichtigen, und
wie viel bekomme ich am Ende mehr?»

## Item 1 — Normbasis (Stand 2026, Wortlaut aus Regelwerk Teil 3)
- **Art. 626 Abs. 1:** «Die **gesetzlichen Erben** sind gegenseitig
  verpflichtet, **alles zur Ausgleichung zu bringen, was ihnen der Erblasser
  bei Lebzeiten auf Anrechnung an ihren Erbanteil zugewendet hat**.»
- **Art. 626 Abs. 2 (Zuwendungskatalog + Vermutung):** Was der Erblasser
  **Nachkommen** als **Heiratsgut, Ausstattung, Vermögensabtretung,
  Schulderlass u.dgl.** zuwendet, unterliegt der Ausgleichung, **sofern nicht
  ausdrücklich das Gegenteil verfügt** (= gesetzliche Ausgleichungsvermutung
  für Nachkommen; Dispens nur durch ausdrückliche Erlassanordnung).
- **Art. 628 (Wahlrecht):** Einwerfung **in Natur** (Realkollation) ODER
  **Anrechnung dem Werte nach** (Idealkollation), nach Wahl des Erben — auch
  bei Übersteigen des Erbanteils; Vorbehalt abweichender Anordnungen +
  Herabsetzung.
- **Art. 629 (Übermass):** Übersteigt die Zuwendung den Erbteil, ist der
  Überschuss nur auszugleichen, wenn **keine Begünstigungsabsicht**;
  Begünstigung wird **bei üblichen Heiratsausstattungen vermutet**.
- **Art. 630 (Wertbestimmung — ZENTRAL):** «Die Ausgleichung erfolgt nach dem
  **Werte der Zuwendungen zur Zeit des Erbganges** oder, wenn die Sache vorher
  veräussert worden ist, nach dem dafür **erzielten Erlös**.» → **Verkehrswert
  im Zeitpunkt des Erbgangs (Todesdatum, Art. 537), NICHT der seinerzeitige
  Zuwendungsbetrag.**
- **Art. 631 (Erziehungs-/Ausbildungskosten):** Nur ausgleichungspflichtig,
  **soweit das übliche Mass übersteigend**; angemessener Vorausbezug für noch
  in Ausbildung stehende / gebrechliche Kinder vorbehalten.
- **Art. 632 (Gelegenheitsgeschenke):** **Übliche** Gelegenheitsgeschenke
  unterliegen **nicht** der Ausgleichung.
- **Art. 627:** Ausgleichungspflicht der Nachkommen auch bei Eintritt; bei
  Wegfall eines Erben geht die Pflicht auf die eintretenden Erben über.
- **Abgrenzung Bewertung:** Art. 630 (Ausgleichung = Erbgang) ≠ **Art. 617**
  (Anrechnung von **Grundstücken bei der Teilung = Verkehrswert im
  Teilungszeitpunkt**). Diese zwei Zeitpunkte dürfen **nicht** vermischt
  werden (Regelwerk Teil 3, Z. 503/508 ausdrücklich).
- *Keine* Revisions-2023-Marker auf 626–632 (Erbgang/Teilung blieb
  unverändert; revidiert wurden Pflichtteile 470 f. und Herabsetzung 522/532).

## Item 2 — Regelwerk-/Baustein-Skizze mit Beispielrechnung
**Eigene Engine `src/lib/ausgleichung.ts`** (nicht in `erbteilung.ts`
fusionieren, §4). Reine Funktion, alle Quoten als `Bruch` (`bruch.ts`),
CHF-Beträge erst am Schluss.

**Algorithmus (Idealkollation, Art. 628 Var. 2 als Default):**
1. **Reiner Nachlass** `N` (Todeszeitpunkt) — aus `erbteilung.ts`-Vorstufe
   oder direkt eingegeben.
2. **Ausgleichungsmasse** je ausgleichungspflichtigem Vorempfang: Wert **zur
   Zeit des Erbgangs** (Art. 630) erfassen (Eingabe; Engine rechnet nicht den
   Verkehrswert, sondern verlangt den Erbgangswert als Input — §2, keine
   Schätzung). Filter: Gelegenheitsgeschenke (632) und übliche
   Erziehungskosten (631) werden NICHT eingeworfen.
3. **Teilungsmasse** `T = N + Σ ausgleichungspflichtige Vorempfänge`.
4. **Erbteil je Erbe** `= T × gesetzliche Quote` (Quote aus `erbteilung.ts`
   `verteileQuoten`).
5. **Anrechnung:** vom rechnerischen Erbteil des begünstigten Erben wird sein
   Vorempfang **abgezogen**; sein realer Anspruch aus dem Nachlass `N` ist
   `Erbteil − Vorempfang`. Die anderen Erben erhalten ihren vollen Erbteil aus
   `N`.
6. **Übermass (Art. 629):** Ist `Vorempfang > Erbteil`, muss der Überschuss
   nur zurückgegeben werden, wenn keine Begünstigungsabsicht (Input-Flag, da
   nicht regelbasiert feststellbar → §2/§8 Warnung; Vermutung bei üblicher
   Heiratsausstattung als Default-Hinweis).

**Beispielrechnung (deterministisch, mit Zahlen):**
Erblasser †, 2 Kinder (A, B). Reiner Nachlass `N = CHF 400'000`. Vorempfang B
(Vermögensabtretung Hauskauf), **Verkehrswert im Erbgang = CHF 200'000**
(Art. 630). Keine abweichende Verfügung → ausgleichungspflichtig (Art. 626
Abs. 2).
- Teilungsmasse `T = 400'000 + 200'000 = 600'000`.
- Quote je Kind = `1/2` (Art. 457). Rechnerischer Erbteil je Kind
  = `600'000 × 1/2 = 300'000`.
- A erhält aus dem Nachlass: `300'000` (kein Vorempfang).
- B erhält aus dem Nachlass: `300'000 − 200'000 = 100'000`.
- Probe: `A 300'000 + B 100'000 = 400'000 = N`. ✓
- **Antwort auf Item-1-Frage:** A bekommt CHF 300'000 statt CHF 200'000 (ohne
  Ausgleichung wären es je 200'000) → **CHF 100'000 mehr**.

**Übermass-Variante (Art. 629):** Vorempfang B = CHF 500'000, `N = 400'000`.
`T = 900'000`, Erbteil je = `450'000`. B hat 500'000 erhalten → 50'000 über
seinem Erbteil. Ohne Begünstigungsabsicht müsste B 50'000 zurückbringen
(Realausgleich); A erhielte dann 450'000. Mit Begünstigungsabsicht: B behält,
A erhält nur den Nachlass `400'000`, kann aber bei Pflichtteilsverletzung
herabsetzen (Art. 522/532 → Brücke zur künftigen Herabsetzungs-Engine).

**Formel-Skizze (`bruch.ts`):**
```
T (CHF)         = N + Σ vorempfang_i.erbgangswert     // ausgleichungspflichtige
erbteil_i (CHF) = (quote_i.z / quote_i.n) * T          // quote_i: Bruch
anspruch_i      = erbteil_i - vorempfang_i             // aus Nachlass N
// Realkollation (628): vorempfang als CHF zurück in N, dann anteilig (Bruch).
```
Quoten exakt als `Bruch` (`mulB`, `divB`); CHF-Konversion erst beim
Ergebnistext, identisch zur bestehenden `erbteilung.ts`-Konvention
(`erbteilung.ts:341`).

## Item 3 (zu Rechner 1) — §2-Beurteilung
**Regelbasiert umsetzbar** — aber MIT scharfer Trennung:
- **Deterministisch/aufnehmbar:** Hinzurechnung zur Teilungsmasse, Anrechnung,
  Quotenarithmetik, Filter 631/632, Übergangsmasse — alles feste Regeln.
- **NICHT aufnehmbar (§2, Input-Flag + Warnung):** Verkehrswert der Sache im
  Erbgangszeitpunkt (Art. 630 — Schätzung, kein Rechenschritt → Nutzer gibt
  ihn ein), Begünstigungsabsicht (Art. 629), «übliches Mass» bei
  Erziehungskosten (631), «übliche» Gelegenheitsgeschenke (632), Dispens-
  Auslegung (626 II «ausdrücklich»). Diese als boolesche/Wert-Inputs, nie
  geschätzt. Das deckt sich mit der bestehenden Selbstdeklaration in
  `erbteilung.ts:309` («Ausgleichung … hier nicht modelliert»).

## Datenbedarf (Rechner 1)
- Reiner Nachlass `N` (oder Übernahme aus `erbteilung.ts`-Güterrechtsvorstufe).
- Pro Vorempfang: Empfänger (Nachkomme?), Erbgangswert (Art. 630), Typ
  (Heiratsgut/Ausstattung/Vermögensabtretung/Schulderlass/Erziehungskosten/
  Gelegenheitsgeschenk), Dispens ja/nein (626 II), Begünstigungsabsicht bei
  Übermass (629). Keine kantonalen Daten nötig.

## Fallstricke (Rechner 1)
- **Bewertungszeitpunkt 630 vs. 617** — häufigster Fehler: Vorempfang zum
  *seinerzeitigen* Betrag statt zum Erbgangswert einwerfen. Engine muss das im
  Label explizit machen («Wert zur Zeit des Erbgangs, Art. 630»).
- **626 II nur für Nachkommen**: Ehegatte ist NICHT von Gesetzes wegen
  ausgleichungspflichtig (nur bei ausdrücklicher Anordnung nach 626 I).
- **Ausgleichung ≠ Herabsetzung**: Ausgleichung verschiebt die Teilung unter
  Erben; Herabsetzung (522/532) schützt Pflichtteile gegen Dritte. Trennen.
- **Querverbindung Art. 579** (5-Jahres-Rückgriff bei Ausschlagung eines
  zahlungsunfähigen Erblassers) nutzt denselben Vorempfangs-Begriff —
  nicht verschmelzen, nur verlinken.
- **[zu verifizieren]** Ausgleichung bei Eintritt (Art. 627): Enkel, die für
  ein vorverstorbenes Kind eintreten, müssen dessen Vorempfänge ausgleichen.

## Aufwand + Wiederverwendung (Rechner 1)
**Aufwand L.** Wiederverwendung: `bruch.ts` (vollständig), `erbteilung.ts`
`verteileQuoten`/`gueterrecht` (Quoten + Nachlass-Vorstufe — ggf. Refactor zu
exportierter Hilfsfunktion, verhaltensneutral §6), `types/erbrecht.ts`,
Ergebnis-/Rechenweg-Struktur (`Rechenschritt`, `Normverweis`). Katalog-Slot
**existiert** (`startseiteConfig.ts:455 'erb-ausgleichung', status:'geplant',
norms:[]`) → nur Status/Norms/href ergänzen.

---

# RECHNER 2 — Erb-Fristen

## Item 4 — Nutzerfrage
«Mein Onkel ist am 10. März 2026 gestorben und war überschuldet. Bis wann kann
ich die Erbschaft ausschlagen, und bis wann kann ich ein öffentliches Inventar
verlangen?»

## Item 5 — Normbasis (Stand 2026, Wortlaut aus Regelwerk Teil 2/3)
**Ausschlagung & Inventar (Erbgang):**
- **Art. 567:** Ausschlagungsfrist **3 Monate**. Beginn: **gesetzliche Erben**
  = Kenntnis vom Tod (sofern nicht nachweisbar später Kenntnis vom Erbfall);
  **eingesetzte Erben** = Zugang der **amtlichen Mitteilung** der Verfügung.
- **Art. 568:** Bei Sicherungs-Inventar (553) beginnt die 3-Monats-Frist **für
  alle Erben** mit **Mitteilung des Inventarabschlusses** (alternativer,
  einheitlicher Beginn).
- **Art. 569:** Transmission — Erbenerben: 3 Monate ab Kenntnis vom Anfall,
  frühestens Ablauf der eigenen Frist.
- **Art. 576:** Fristverlängerung/neue Frist durch zuständige Behörde aus
  wichtigen Gründen.
- **Art. 580:** Öffentliches Inventar — Begehren **binnen 1 Monat** (Form wie
  Ausschlagung), gilt für alle Erben.
- **Art. 587/588:** Nach Inventarabschluss Erklärung **binnen 1 Monat**;
  Schweigen = Annahme unter öffentlichem Inventar.
- **Art. 566 Abs. 2:** Überschuldung amtlich festgestellt/offenkundig →
  Ausschlagung **vermutet** (relevant für Item-4-Fall: ggf. keine aktive
  Erklärung nötig).
- Weitere Erbgangs-Fristen (Synthese Regelwerk Teil 3 Tab. 8): 553 (2 Mt.
  Sicherungs-Inventar), 557 (1 Mt. Testamentseröffnung), 559 (1 Mt. Erbenschein
  frühestens), 574/575 (1 Mt. Ehegatte/nachfolgende Erben), 578 (6 Mt.
  Anfechtung), 594 (3 Mt. amtl. Liquidation auf Gläubigerbegehren).

**Klagefristen (Verfügungen, Regelwerk Teil 2 Tab. E) — 1/10/30-Muster:**
- **Art. 521 Ungültigkeitsklage:** **1 Jahr** ab Kenntnis von Verfügung UND
  Ungültigkeitsgrund / **10 Jahre** absolut ab **Eröffnung der Verfügung** /
  **30 Jahre** gegen Bösgläubige **nur** bei Gründen 519 Ziff. 1+3
  (Verfügungsunfähigkeit/Rechtswidrigkeit/Unsittlichkeit), **NICHT bei
  Formmangel** / Einrede **unverjährbar** (Abs. 3).
- **Art. 533 Herabsetzungsklage:** **1 Jahr** ab Kenntnis der Verletzung der
  Pflichtteilsrechte / **10 Jahre** absolut — bei **letztwilligen Verfügungen
  ab Eröffnung**, bei **anderen Zuwendungen ab Tod** / Einrede unverjährbar.
- **Art. 600 Erbschaftsklage:** **1 Jahr** ab Kenntnis (Besitz + besseres
  Recht) / **10 Jahre** ab Tod oder Eröffnung / **30 Jahre** gegen
  Bösgläubige (stets).
- **Art. 601 Vermächtnisklage:** einheitlich **10 Jahre** ab Mitteilung der
  Verfügung oder späterer Fälligkeit.
- Sonderfristen: 508 (14 Tage Verfall mündl. Verfügung), 517 (14 Tage WV-
  Annahme, Schweigen = Annahme), 637 (1 Jahr Gewährleistung), 639 (5 Jahre
  Solidarhaftung), 497/527 Ziff. 3 (5-Jahres-Linien, materielle Schranke).

## Item 6 — Regelwerk-/Baustein-Skizze (Trigger-Ereignisse exakt)
**Eigene dünne Engine `src/lib/erbFristen.ts`**, andockt an `fristenEngine.ts`
(`fristendeKalender` mit `OHNE_STILLSTAND`) — exakt das Muster von
`allgemeineFrist.ts` (keine Gerichtsferien/Stillstände im materiellen
Erbrecht). Datenmodell: **fester Frist-Katalog** (deklarative Tabelle), Nutzer
wählt Tatbestand + gibt **Trigger-Datum** ein.

**Frist-Katalog (Auszug, jede Zeile = Eintrag):**
| key | Frist | Einheit | Trigger (dies a quo) | Norm | beginnFolgetag |
|---|---|---|---|---|---|
| ausschlagung_gesetzl | 3 | monate | Kenntnis vom Tod | 567 | ja |
| ausschlagung_eingesetzt | 3 | monate | Zugang amtl. Mitteilung Verfügung | 567 | ja |
| ausschlagung_inventar | 3 | monate | Mitteilung Inventarabschluss | 568 | ja |
| oeff_inventar_begehren | 1 | monate | wie Ausschlagung | 580 | ja |
| erklaerung_nach_inventar | 1 | monate | Inventarabschluss | 587 | ja |
| ungueltigkeit_relativ | 1 | jahre | Kenntnis Verfügung+Grund | 521 I | nein¹ |
| ungueltigkeit_absolut | 10 | jahre | Eröffnung der Verfügung | 521 I | nein¹ |
| ungueltigkeit_boesgl | 30 | jahre | Eröffnung (nur 519 Z.1+3) | 521 II | nein¹ |
| herabsetzung_relativ | 1 | jahre | Kenntnis Rechtsverletzung | 533 I | nein¹ |
| herabsetzung_abs_test | 10 | jahre | Eröffnung Verfügung | 533 I | nein¹ |
| herabsetzung_abs_lebzeit | 10 | jahre | Tod des Erblassers | 533 I | nein¹ |
| erbschaftsklage_relativ | 1 | jahre | Kenntnis Besitz+besseres Recht | 600 I | nein¹ |
| erbschaftsklage_boesgl | 30 | jahre | Tod/Eröffnung | 600 II | nein¹ |
| vermaechtnisklage | 10 | jahre | Mitteilung/Fälligkeit | 601 | nein¹ |

¹ *Fristbeginn-Konvention für die Verjährungs-/Verwirkungsfristen am
Erbrecht ist VOR Implementierung zu fixieren (Tag des Ereignisses
mitzählen?) — [zu verifizieren], h.L. behandelt 521/533/600 als
Verwirkungsfristen; Berechnung an `allgemeineFrist.ts`-Logik (gleichbezeichneter
Tag) angleichen und Annahme offenlegen (§8).*

**Einrede-Unverjährbarkeit (521 III, 533 III):** eigenes Flag, KEINE
Fristberechnung — Ausgabe «einredeweise jederzeit geltend zu machen».
**30-Jahre-Differenzierung 521:** nur bei 519 Ziff. 1+3, nicht Formmangel —
diese Differenz darf NICHT mit 600 «vereinheitlicht» werden (§1/§4;
Regelwerk-Designhinweis Teil 2 Z. 375).

**Beispiel (Item-4-Fall):** Tod 10.3.2026, gesetzlicher Erbe, Kenntnis am
Todestag. Ausschlagung (567): `fristendeKalender(2026-03-10, 'monate', 3,
OHNE_STILLSTAND, true)` → **10.6.2026**. Öffentliches Inventar (580): 1 Monat →
**10.4.2026**. (Bei amtlich festgestellter Überschuldung gilt zusätzlich die
Ausschlagungsvermutung Art. 566 II — Hinweis ausgeben.)

## Item 7 (zu Rechner 2) — §2-Beurteilung
**Voll regelbasiert** — die Fristarithmetik ist deterministisch und die
Triggerdaten gibt der Nutzer ein; **kein** Date.now() in der Rechenlogik. Die
*Qualifikation* des Trigger-Ereignisses (wann «Kenntnis»? gesetzlicher vs.
eingesetzter Erbe? Bösgläubigkeit?) ist Rechtsfrage → als
Auswahl/Eingabe + Warnung, nie Heuristik. Konform §2/§8.

## Datenbedarf (Rechner 2)
- Pro Frist: Trigger-Datum (ISO). Keine kantonalen Daten für die Berechnung;
  optional Verweis auf zuständige Erbschaftsbehörde aus
  `bibliothek/behoerden/erbgangsbehoerden-kantone.md` (Ausschlagung/Inventar
  sind bei der kantonalen Behörde anzubringen, Art. 570/580). Feiertags-
  Verschiebung am Behördensitz: kantonale Feiertage über `data/zpoFeiertage.ts`
  (wie `allgemeineFrist.ts`), als optionaler Toggle.

## Fallstricke (Rechner 2)
- **567-Fristbeginn unterschiedlich**: gesetzliche Erben (Kenntnis vom Tod)
  vs. eingesetzte Erben (amtl. Mitteilung der Verfügung) — als **zwei
  Katalogeinträge** führen, nicht zusammenlegen.
- **568 überschreibt 567**: Liegt ein Sicherungs-Inventar vor, gilt für ALLE
  der einheitliche Beginn (Inventarabschluss) — Engine muss diesen Vorrang
  abbilden (Auswahl «Sicherungs-Inventar aufgenommen?»).
- **533 absoluter Beginn doppelt**: Testament = Eröffnung, lebzeitige
  Zuwendung = Tod — zwei Einträge.
- **521 30-J. nur 519 Z.1+3**: Formmangel-Fälle dürfen die 30-Jahre-Frist
  nicht erhalten.
- **[zu verifizieren] BGE zu 533 «Kenntnis der Verletzung»** — relativer
  Beginn nicht mit Todeskenntnis verwechseln (Verifikations-TODO 1).
- Verjährung vs. Verwirkung (h.L. Verwirkung bei 521/533) — Hinweis, dass
  Einrede unverjährbar bleibt.

## Aufwand + Wiederverwendung (Rechner 2)
**Aufwand S–M.** Wiederverwendung sehr hoch: `fristenEngine.ts`
(`fristendeKalender`/`fristendeTage`, `OHNE_STILLSTAND`), Muster
`allgemeineFrist.ts` (Andock-Engine, Rechenweg-Protokoll, Verschiebe-Schleife),
`data/zpoFeiertage.ts`, `FristenKalender.tsx` (Visualisierung), `types/legal.ts`.
**Kein** neuer Katalog-Slot vorhanden → in `startseiteConfig.ts` ergänzen
(Rechtsgebiet «Erbrecht», `modus:'rechner'`, `art:'frist'`).

---

# VORLAGEN

Alle Vorlagen nutzen `vorlagen/engine.ts` (`assemble`, `Baustein`,
`includeIf`, `ausgabeArt`) + das `testament.ts`-Muster (Gates, Defaults,
`zusammenstellen`). Form bestimmt das Exportformat (§8):
- Beurkundungspflicht (512, 499 ff., 495) → `ausgabeArt:'entwurf'`
  (Vorbereitungs-Entwurf für die Urkundsperson, Wasserzeichen, **Export-Sperre
  als gültiges Dokument**) — wie `vorsorgeauftrag.ts` im `oeffentlich_beurkundet`-
  Modus (V14-Baustein + `beurkundungsHinweis`).
- Nur Schriftform (634) → exportfähig (`ausgabeArt:'abschrift'`/`'fertig'`).

## Item 8 — Öffentliches Testament (Art. 499–504)
**Nutzerfrage:** «Ich will mein Testament beim Notar beurkunden lassen — was
muss ich vorbereiten und wie läuft die Beurkundung ab?»

**Normbasis (Regelwerk Teil 2):** Art. 498 (Numerus clausus der Formen),
**499** (vor Beamter/Notar/Urkundsperson + **2 Zeugen**), **500**
(Selbstlesungsvariante: Erblasser teilt Willen mit → Urkunde → Erblasser liest
+ unterschreibt → Beamter datiert/unterschreibt), **501** (Zeugen-Bestätigung
unmittelbar danach; Zeugen müssen Inhalt **nicht** kennen), **502**
(Vorlesungsvariante: ohne eigenes Lesen/Unterschreiben — Beamter liest vor
Zeugen vor), **503** (Ausschlüsse: nicht handlungsfähig, schreib-/leseunkundig,
Verwandte gerader Linie/Geschwister/deren Ehegatten + Ehegatte des Erblassers
weder Beamter noch Zeuge; Begünstigungsverbot), **504** (kantonale
Aufbewahrung).

**Baustein-Skizze:** **§8 — nur Vorbereitungs-Dokument + Checkliste, KEIN
unterschriftsreifer Text** (`ausgabeArt:'entwurf'`). Bausteine: Personalien,
Erbeinsetzung/Vermächtnisse/WV (wie testament.ts C03/C04/C09 wiederverwenden),
**Checkliste**: 2 Zeugen erforderlich (499); Zeugen-/Beamten-Ausschlüsse (503);
Wahl Selbstlesung (500/501) vs. Vorlesung (502); Aufbewahrung (504);
Beurkundung erfolgt durch die Urkundsperson → Schlussbaustein wie
`vorsorgeauftrag.ts:V14` («Ort/Datum/Unterschriften bei der Beurkundung»). +
`beurkundungsHinweis(kanton)` einbinden.

**§2-Beurteilung:** regelbasiert nur als Entwurf/Checkliste; der eigentliche
Beurkundungsakt ist nicht generierbar → korrekt als `'entwurf'` mit
Export-Sperre. Konform.
**Datenbedarf:** kantonale Urkundsperson — bereits in
`beurkundungsHinweis()` (ZH/BE/TI/SG/TG/AR/AI/SZ + Default Art. 55 SchlT /
**[zu verifizieren] BGE 151 III 81**).
**Fallstricke:** 503-Ausschlüsse (begünstigte Zeugen → Teilnichtigkeit nach
520 Abs. 2); Zeugen müssen Verfügungsfähigkeit bestätigen (501).
**Aufwand M.** Katalog-Slot existiert (`oeffentliches-testament`,
`status:'geplant'`, Z. 898).

## Item 9 — Erbvertrag (Art. 512)
**Nutzerfrage:** «Wir wollen einen Erbvertrag schliessen — welche Form gilt,
und bindet er mich auch bei späteren Schenkungen?»

**Normbasis:** **Art. 512:** Form der **öffentlichen letztwilligen Verfügung**;
die Vertragschliessenden erklären **gleichzeitig** dem Beamten ihren Willen und
unterschreiben **vor ihm und 2 Zeugen** (= alle gleichzeitig). **Art. 468**
(18 Jahre + ggf. Zustimmung bei umfassender Beistandschaft). **Bindungswirkung
vs. Testament:** Erbvertrag ist **bindend** (nicht frei widerruflich wie das
Testament nach 509). **Art. 494 (Revision 2023):** lebzeitige Verfügungsfreiheit
trotz Erbvertrag, aber **Anfechtungsrecht** des Begünstigten gegen aushöhlende
Verfügungen/Schenkungen (ausser übliche Gelegenheitsgeschenke), soweit
unvereinbar + nicht vorbehalten. **Auftrag nennt «494 Abs. 3»; Regelwerk
erfasst dies als Art. 494 Abs. 2 → Verifikations-TODO 3 (Abs.-Nummer am Cache
prüfen, §7).** Aufhebung: 513 (schriftl. Übereinkunft; einseitig bei
Enterbungsgrund), 514 (Rücktritt OR), 515 (Vorversterben).

**Baustein-Skizze:** `ausgabeArt:'entwurf'` (Beurkundung zwingend, **keine
Export-Freigabe**). Parteien-Ingress (Format `'vertrag'`),
erbvertragliche Bindung, Vorbehalts-Klausel zu lebzeitigen Verfügungen (494
Abs. 2 — schützt vor späterem Anfechtungsstreit), Checkliste: 2 Zeugen +
**Gleichzeitigkeit** (512), 18 Jahre (468), Beurkundung durch Urkundsperson.

**§2-Beurteilung:** nur Entwurf; Bindungswirkung/Anfechtung sind
Beratungsfragen → Hinweise, kein generierter Verzicht. Konform §8.
**Datenbedarf:** kantonale Urkundsperson (`beurkundungsHinweis`).
**Fallstricke:** **Gleichzeitigkeit** der Erklärung (512) — anders als beim
öff. Testament; 494-Anfechtung als Revisions-2023-Punkt markieren;
Erbvertrag ≠ widerrufliches Testament.
**Aufwand M.** Katalog-Slot existiert (`erbvertrag`, `status:'geplant'`, Z. 906).

## Item 10 — Erbverzichtsvertrag (Art. 495–497)
**Nutzerfrage:** «Ich will als Kind auf mein Erbe verzichten (gegen Abfindung
oder unentgeltlich) — geht das, und gilt das auch für meine Kinder?»

**Normbasis:** **Art. 495:** Erbverzichtvertrag/Erbauskauf; Verzichtender fällt
beim Erbgang **ausser Betracht**; **wirkt mangels anderer Anordnung auch
gegenüber den Nachkommen** des Verzichtenden (Auftrag: «495 Abs. 3»).
**Form: öffentliche Beurkundung** (Erbvertrag, Art. 512 i.V.m. 468 ff. —
Verzicht ist Erbvertrag). **Art. 496** (lediger Anfall; Vermutung zugunsten
gemeinsamen nächsten Stammes). **Art. 497** (Haftung bei Zahlungsunfähigkeit
des Erblassers: Gegenleistung der **letzten 5 Jahre** vor Tod, soweit noch
bereichert — materielle Haftungsschranke, keine Verjährung). Abgrenzung:
**Erbverzicht (unentgeltlich) vs. Erbauskauf (gegen Abfindung)**; Abfindung
unterliegt Hinzurechnung/Herabsetzung (527 Ziff. 2).

**Baustein-Skizze:** `ausgabeArt:'entwurf'` (Beurkundung zwingend).
Parteien (Erblasser + Verzichtender), Verzichtsklausel, Option
entgeltlich/unentgeltlich (Abfindungsbetrag-Baustein `includeIf`),
Wirkung-auf-Nachkommen-Klausel (495 Abs. 3 — Default: erstreckt sich; mit
Opt-out-Baustein), Checkliste Beurkundung + Zeugen.

**§2-Beurteilung:** Entwurf, regelbasiert; 497-Haftung als Hinweis.
**Datenbedarf:** kantonale Urkundsperson.
**Fallstricke:** Wirkung auf Nachkommen (495 III) muss bewusst gewählt werden;
entgeltlicher Auskauf → Herabsetzungsrisiko (527); 5-Jahres-Haftung (497).
**Aufwand M.** **Kein** Katalog-Slot → neu anlegen (`erbverzicht`,
`modus:'vorlage'`, `tier:'pro'`, `status:'geplant'`).

## Item 11 — Erbteilungsvereinbarung [Gerüst] (Art. 634)
**Nutzerfrage:** «Wir Erben sind uns einig, wie wir den Nachlass aufteilen —
wie halten wir das rechtsgültig fest, und müssen wir zum Notar?»

**Normbasis:** **Art. 634:** Teilungsvertrag wird verbindlich mit
Aufstellung/Entgegennahme der Lose oder Vertragsschluss; **bedarf der
schriftlichen Form** (= einzige formfreie Erb-Vorlage des Clusters →
**exportfähig**!). Teilungsregeln: **607** (Teilungsfreiheit), **610**
(Mitteilungspflicht, Schuldentilgung vor Teilung), **611** (Losbildung),
**612/613** (unteilbare/zusammengehörige Sachen), **614** (Anrechnung von
Forderungen des Erblassers gegen einen Erben), **617** (Grundstücke zum
**Verkehrswert im Teilungszeitpunkt** anrechnen). **635** (Abtretung von
Erbanteilen: Schriftform). Nachhaftung: **637** (1 J. Gewährleistung), **639**
(5 J. Solidarhaftung).

**Grundstück-Sonderfall (Auftrag: «634 Abs. 2 vs. Praxis — klären!»):** Der
Wortlaut Art. 634 verlangt **nur Schriftform** und kennt **keine**
Beurkundungspflicht — auch nicht für Grundstücke (anders als der
Grundstückkauf, Art. 657 ZGB). H.L./Praxis: der **Teilungsvertrag** als solcher
ist auch bei Grundstücken **schriftlich gültig**; die grundbuchliche Eintragung
erfolgt gestützt darauf. **[zu verifizieren] (Verifikations-TODO 2)** —
abweichende kantonale Grundbuchpraxis / Lehrmeinungen offenlegen, im Zweifel
Beurkundungs-Hinweis als Warnung, nicht als Export-Sperre.

**Baustein-Skizze [Gerüst]:** Format `'vertrag'`, `ausgabeArt:'abschrift'`
oder `'fertig'` (Schriftform genügt). Parteien (alle Erben), Bezeichnung des
Nachlasses, **Anrechnungswerte** (617: Grundstücke Verkehrswert
Teilungszeitpunkt — als Eingabe, nicht geschätzt §2), Zuweisung der
Gegenstände/Lose (611), Ausgleichszahlungen, Saldoklausel, Schriftform-
Bestätigung (634). Grundstück-Baustein mit Warnung zur Beurkundungs-/Grundbuch-
frage.

**§2-Beurteilung:** Schriftform → **einzige voll exportfähige** Erb-Vorlage des
Clusters. Anrechnungswerte/Ausgleichszahlungen werden **eingegeben**, nicht
berechnet (oder optional aus Ausgleichungs-Rechner Item 1 übernommen → später).
Konform §2.
**Datenbedarf:** keine zwingenden kantonalen Daten; bei Grundstück Hinweis auf
Grundbuchamt/Beurkundung (kantonal, [zu verifizieren]).
**Fallstricke:** 617-Bewertungszeitpunkt (Teilung) ≠ 630 (Erbgang, Ausgleichung)
— NICHT vermischen; 639 5-Jahres-Solidarhaftung als Hinweis; Saldoklausel
ersetzt keine Gläubigerzustimmung (639).
**Aufwand M (Gerüst).** Wiederverwendung: `vorlagen/engine.ts`,
`testament.ts`-Muster, Format `'vertrag'` (wie klageVereinfacht/Mietvertrag).
**Kein** Katalog-Slot → neu (`erbteilungsvereinbarung`, exportfähig,
`tier:'pro'`).

---

## Wiederverwendungs-Matrix (gesamt)
| Baustein/Engine | Rechner Ausgleichung | Erb-Fristen | Vorlagen |
|---|---|---|---|
| `bruch.ts` | ✓ (Kern) | – | – |
| `erbteilung.ts` (`verteileQuoten`,`gueterrecht`) | ✓ (Refactor §6) | – | – |
| `fristenEngine.ts` + `OHNE_STILLSTAND` | – | ✓ (Kern) | – |
| Muster `allgemeineFrist.ts` | – | ✓ | – |
| `data/zpoFeiertage.ts`, `FristenKalender.tsx` | – | ✓ | – |
| `vorlagen/engine.ts` (`assemble`) | – | – | ✓ (alle) |
| `testament.ts`-Muster (Gates, `zusammenstellen`) | – | – | ✓ (alle) |
| `vorsorgeauftrag.ts:beurkundungsHinweis` + V14 | – | – | ✓ (öff. Test., Erbvertrag, Verzicht) |
| `bibliothek/behoerden/erbgangsbehoerden-kantone.md` | – | ✓ (Hinweis) | ✓ (Beurkundung) |
| `types/erbrecht.ts`, `types/legal.ts` | ✓ | ✓ | – |

## Katalog-Status (`startseiteConfig.ts`)
- **Vorhanden, `geplant`:** `erb-ausgleichung` (Z. 455), `oeffentliches-testament`
  (Z. 898), `erbvertrag` (Z. 906).
- **Neu anzulegen:** Erb-Fristen-Rechner, `erbverzicht`,
  `erbteilungsvereinbarung`.
