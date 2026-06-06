# Arbeitsrecht-Rechner — Regelwerk & Bau-Recherche (Deep Research)

**Erstellt:** 6.6.2026 · **Auftrag:** Cluster «Arbeitsrecht-Rechner» (7 Rechner)
für den geplanten Katalogeintrag `arbeit-entschaedigung` (startseiteConfig.ts,
Status `geplant`) sowie Ausbau von `kuendigung-sperrfristen`.
**Wortlaut-Quellen:** Fedlex-Filestore SR 220 (OR), **konsolidiert 20260101**
(Cache `/tmp/or.html`, Abruf 6.6.2026) · SR 822.11 (ArG), **konsolidiert
20230901** (Cache `/tmp/arg.html`) · SR 151.1 (GlG), Art. 5 verbatim aus
FAO-Mirror (Fedlex-Filestore liefert nur SPA-Shell — siehe Verifikations-TODO).
**Status: Arbeitsgrundlage — NICHT abgenommen (§7/§8).** Alle Zitate verbatim
aus Cache, wo nicht anders vermerkt. BGE/Praxisangaben sind **[zu verifizieren]**.

---

## 0. Quellenlage & Verifikations-TODOs

| Norm | Cache/Quelle | Anker geprüft | Status |
|---|---|---|---|
| OR 321c, 329a–d, 329f–j, 335d–k, 336a/b, 337c, 339b/c | `/tmp/or.html` (20260101) | alle ✓ am Cache | Wortlaut verbatim |
| ArG 9, 12, 13 | `/tmp/arg.html` (20230901) | ✓ | Wortlaut verbatim |
| GlG Art. 5 | FAO-Mirror swi193010GER.pdf | — | **TODO: gegen Fedlex-Konsolidierung gegenprüfen** (Filestore lieferte nur SPA-Shell; Caps 3/6 ML bestätigt durch lexia.ch + arbeitsrecht-aktuell.ch 2025/26) |

**Offene Verifikations-TODOs (vor Abnahme):**
1. **GlG Art. 5 in Fedlex-Cache aufnehmen** — ELI cc/1996/1498_1498_1498; Filestore-HTML war nicht greifbar. Konsolidierungsdatum + Anker `art_5` empirisch bestätigen, dann in `scripts/fedlex-cache.sh` + `quellen-register.md` eintragen.
2. **Ferien-Rundung** = SECO-Empfehlung, keine Norm → §2-Konflikt (s. Rechner 1).
3. **BGE-Anker** für alle unten als [zu verifizieren] markierten Sätze (Gratifikation/13., 339b–BVG-Anrechnung, Ferien-in-Geld-Verbot Ausnahmen) gegen `src/data/verifikation.ts` ergänzen.
4. **13. Monatslohn** hat **keine** OR-Norm (Vertrags-/GAV-/Übungsrecht) → Engine muss Basis als Eingabe verlangen, darf nichts «schätzen» (§2).

---

## Rechner 1 — Ferienanspruch (Art. 329a/c OR)

**1) Nutzerfrage:** «Wie viele Ferientage stehen mir dieses Dienstjahr zu — auch bei Ein-/Austritt unter dem Jahr und bei Teilzeit?»

**2) Normbasis (verbatim, Cache OR 20260101):**
> Art. 329a Abs. 1: «Der Arbeitgeber hat dem Arbeitnehmer jedes Dienstjahr wenigstens **vier Wochen**, dem Arbeitnehmer **bis zum vollendeten 20. Altersjahr** wenigstens **fünf Wochen** Ferien zu gewähren.»
> Abs. 3: «Für ein **unvollständiges Dienstjahr** sind Ferien entsprechend der Dauer des Arbeitsverhältnisses im betreffenden Dienstjahr zu gewähren.»
> Art. 329c Abs. 1: «… wenigstens **zwei Ferienwochen müssen zusammenhängen**.»

Hinweis: 5 Wochen gelten bis zum **vollendeten 20. Altersjahr** (Alter, nicht «Jugendurlaub»). 4/5 Wochen sind gesetzliche **Mindestwerte**; vertraglich/GAV höher → Eingabe «Wochen pro Jahr».

**3) Regelwerk-Skizze:**
- Eingaben: Ferienwochen/Jahr (Default 4, ≤20 J. 5; vertraglich übersteuerbar), Bezugsjahr (Dienst- oder Kalenderjahr nach Vertrag), Eintritt/Austritt-Datum, Beschäftigungsgrad % (Teilzeit), Sollarbeitstage/Woche.
- Formel: `Jahresanspruch_Tage = Wochen × Tage_pro_Woche`. Pro rata: `× (anrechenbare Tage im Jahr / 360 bzw. 365)` resp. `× anteilige Monate / 12`. Teilzeit ist in `Tage_pro_Woche` bereits abgebildet (Tage-Methode); bei unregelmässiger Teilzeit Stunden-Methode als Variante.
- Ausgabe: **exakter Bruch** (via `bruch.ts`) + gerundeter Wert mit ausgewiesener Rundungsregel.

**Beispielrechnung:** 5 Wochen/Jahr, 5 Tage/Woche = 25 Tage. Austritt 30.4. → 25 × 4/12 = **8.33 Tage** (exakt 25/3). SECO-Rundung auf halbe Tage → 8.5 Tage.

**4) §2-Beurteilung (Rundung):** Die **Rundung ist KEINE Norm**, sondern SECO-Empfehlung («bis 0,24/0,74 abrunden, sonst auf halben Tag aufrunden») [zu verifizieren]. Determinismus-Lösung: **exakten Bruch als Primärausgabe** zeigen (eindeutig, §2-konform) und Rundung nur als **optionale, offengelegte Hilfsanzeige** mit wählbarer Regel (kaufm. / halbe Tage / ganze Tage aufgerundet) — nie eine Rundung still erzwingen. So bleibt die Engine rein deterministisch.

**5) Datenbedarf:** keine kantonalen Parameter. GAV-Vorbehalt (höhere Wochen). Tagebasis 360 vs. 365 als Eingabe-Option (beide in Praxis verbreitet → Nutzer entscheidet, Tool rechnet beide).

**6) Fallstricke:** «Ferien in Geld»-Verbot Art. 329d Abs. 2 (während laufendem AV nicht abgeltbar — nur bei Beendigung/unregelm. Teilzeit zulässig) → als Warnung. 5-Wochen-Grenze knüpft am Alter, nicht am Eintrittsjahr. Zwei-Wochen-Zusammenhang (329c) ist Bezugs-, keine Berechnungsregel.

**7) Aufwand:** **S–M.** Wiederverwendung: `bruch.ts` (exakte Quote), `datumsUtils` (`berechneDienstjahr`, Datumsdifferenzen). Eigene kleine Engine `ferien.ts`.

---

## Rechner 2 — Ferienkürzung (Art. 329b OR)

**1) Nutzerfrage:** «Darf der Arbeitgeber meine Ferien wegen Abwesenheit kürzen, und um wie viel?»

**2) Normbasis (verbatim, Cache):**
> Art. 329b Abs. 1: «Ist der Arbeitnehmer **durch sein Verschulden** während eines Dienstjahres insgesamt um **mehr als einen Monat** an der Arbeitsleistung verhindert, so kann der Arbeitgeber die Ferien **für jeden vollen Monat** der Verhinderung **um einen Zwölftel** kürzen.»
> Abs. 2: Bei **unverschuldeter** Verhinderung in der Person des AN (Krankheit, Unfall, gesetzliche Pflichten, öffentliches Amt, Jugendurlaub) und **nicht mehr als einem Monat** im Dienstjahr → **keine Kürzung** («**Karenzmonat**»).
> Abs. 3: **Keine Kürzung**, wenn: a. Arbeitnehmerin wegen **Schwangerschaft bis zu zwei Monate** verhindert; b. Mutterschaftsurlaub (329f); c. Urlaub anderer Elternteil (329g) bzw. Tod der Mutter (329g^bis); d. Betreuungsurlaub (329i); e. Adoptionsurlaub (329j).
> Abs. 4: GAV/NAV-Abweichung zulässig, wenn «im Ganzen mindestens gleichwertig».

**Wortlaut-Bestätigung Auftragsannahme:** Schwangerschaft = **2 Karenzmonate** (Abs. 3 lit. a) ✓. Die «neuen Urlaube» (329f–j) sind in Abs. 3 lit. b–e **explizit kürzungsfest** ✓ (Stand 20260101 inkl. 329g^bis Tod der Mutter).

**Dauern der Urlaube (für Plausibilisierung, Cache):** Mutterschaft ≥14 Wo (329f); Urlaub anderer Elternteil 2 Wo (329g); Tod Mutter 14 Wo (329g^bis); Betreuung max 14 Wo, pro Elternteil 7 Wo (329i); Adoption 2 Wo (329j).

**3) Regelwerk-Skizze:**
- Eingaben: Jahres-Ferienanspruch (aus Rechner 1), je Abwesenheit: Grund (verschuldet / unverschuldet-Person / Schwangerschaft / Urlaub-329f–j) + Dauer in Monaten/Tagen.
- Logik: (a) **verschuldet** → Kürzung 1/12 je **vollem** Verhinderungsmonat, erst **ab >1 Monat** (Abs. 1; der erste Monat zählt mit, sobald die Schwelle überschritten ist — Abgrenzung dokumentieren [zu verifizieren]). (b) **unverschuldet-Person**: erster Monat karenzfrei; ab dem **2. vollen Monat** Kürzung 1/12 je weiterem vollen Monat (h.L./Praxis [zu verifizieren]). (c) **Schwangerschaft**: 2 Monate karenzfrei. (d) **329f–j-Urlaube**: nie Kürzung.
- Ausgabe: gekürzter Anspruch (Bruch + gerundet), Kürzungsfaktor, je Abwesenheit ausgewiesen.

**Beispielrechnung:** 25 Tage/Jahr, unverschuldete Krankheit 4 volle Monate. Karenzmonat (Abs. 2 nur bei ≤1 Mt. ganz kürzungsfrei; bei >1 Mt. gilt 1 Karenzmonat) → kürzbar 3 Monate → 25 × (1 − 3/12) = 25 × 9/12 = **18.75 Tage**.

**4) §2-Beurteilung:** Voll deterministisch (feste 1/12-Quote, ganze Monate). **Achtung:** Die Behandlung des Karenzmonats bei verschuldeter vs. unverschuldeter Verhinderung ist die einzige Auslegungsfrage → als **explizite Regelvariante** mit Normverweis abbilden, nicht «schätzen».

**5) Datenbedarf:** keine kantonalen Parameter. GAV-Vorbehalt (Abs. 4 «gleichwertig»).

**6) Fallstricke:** «voller Monat» = je angefangener Monat zählt NICHT (nur volle). Mehrere Verhinderungen pro Jahr werden **addiert** («insgesamt»). Verschuldet/unverschuldet ist Sachverhalts-, keine Rechenfrage → Nutzer-Eingabe + Warnhinweis.

**7) Aufwand:** **M.** Wiederverwendung: `bruch.ts`, `datumsUtils`. Engine `ferienkuerzung.ts` (oder Teil von `ferien.ts`).

---

## Rechner 3 — Anteiliger 13. Monatslohn

**1) Nutzerfrage:** «Wie viel 13. Monatslohn steht mir bei Ein-/Austritt unter dem Jahr zu?»

**2) Normbasis:** **Kein gesetzlicher Anspruch.** Der 13. ML ist Lohn aus **Vertrag/GAV/betrieblicher Übung**; abzugrenzen von der **Gratifikation** (Art. 322d OR — Sondervergütung, pro-rata nur bei Vereinbarung, Abs. 2). [zu verifizieren — Praxis: 13. ML als fester Lohnbestandteil → pro-rata automatisch geschuldet; Gratifikation → pro-rata nur wenn verabredet.]

**3) Regelwerk-Skizze:**
- Eingaben: Jahresbetrag 13. ML (oder Monatslohn × Faktor), Basis-Typ (13. ML als Lohn / Gratifikation mit/ohne pro-rata-Abrede), Eintritt/Austritt, Beschäftigungsgrad.
- Formel: `13.ML_anteilig = Jahresbetrag × anrechenbare_Tage / 360 (bzw. Monate/12)`.
- Ausgabe: anteiliger Betrag (Bruch + CHF), Hinweis auf Vertrags-/GAV-Vorbehalt.

**Beispielrechnung:** Monatslohn 6 000, 13. ML = 6 000. Austritt 31.7. → 6 000 × 7/12 = **3 500 CHF**.

**4) §2-Beurteilung:** Deterministisch, **sobald Basis = Eingabe**. Die rechtliche Qualifikation (Lohn vs. Gratifikation, pro-rata-Abrede ja/nein) ist **Nutzer-Eingabe**, nicht Engine-Schätzung — sonst §2-Verstoss. Bei «Gratifikation ohne pro-rata-Abrede» → Ausgabe 0 + klarer Hinweis.

**5) Datenbedarf:** keine kantonalen Parameter. GAV-Vorbehalt zentral.

**6) Fallstricke:** **Gratifikation vs. 13. ML** ist der Hauptfallstrick (Art. 322d OR; bei sehr hohen Boni Akzessorietäts-Rechtsprechung [zu verifizieren, BGE]). Tagebasis 360/365 als Option.

**7) Aufwand:** **S.** Wiederverwendung: `bruch.ts`, `datumsUtils`. Klein; kann mit Rechner 1 die Pro-rata-Mechanik teilen (gemeinsames Helper-Modul, aber getrennte Engines/§4).

---

## Rechner 4 — Überstunden-/Überzeitzuschlag (OR 321c · ArG 13)

**1) Nutzerfrage:** «Bekomme ich für Mehrarbeit Zuschlag — und ist es Überstunde (OR) oder Überzeit (ArG)?»

**2) Normbasis (verbatim, Caches):**
> **OR 321c Abs. 3 (Überstunden):** «… Lohn …, der sich nach dem Normallohn samt einem **Zuschlag von mindestens einem Viertel** bemisst.» Abs. 2: Ausgleich durch **Freizeit gleicher Dauer** im Einverständnis möglich. **Abdingbar** durch schriftliche Abrede/NAV/GAV (Abs. 3) — Zuschlag wegbedingbar.
> **ArG 9 Abs. 1 (Höchstarbeitszeit):** «a. **45 Stunden** für … Büropersonal, technische und andere Angestellte … Verkaufspersonal in Grossbetrieben des Detailhandels; b. **50 Stunden** für alle übrigen Arbeitnehmer.»
> **ArG 12 (Überzeit):** Überschreiten der wöchentlichen Höchstarbeitszeit; max **2 Std/Tag**, jährlich max **170 Std** (45-h-Gruppe) bzw. **140 Std** (50-h-Gruppe).
> **ArG 13 Abs. 1 (Zuschlag):** «… Lohnzuschlag von **wenigstens 25 Prozent** …, **dem Büropersonal** … jedoch **nur für Überzeitarbeit, die 60 Stunden im Kalenderjahr übersteigt**.» Abs. 2: Ausgleich durch Freizeit gleicher Dauer → kein Zuschlag. **ArG 13 ist zwingend (nicht wegbedingbar).**

**3) Regelwerk-Skizze:**
- Eingaben: Mehrarbeit-Stunden, Stundenlohn (oder Monatslohn → Stundensatz), Personalkategorie (Büro/techn./Verkauf-Grossbetrieb vs. übrige), vereinbarte Soll-Arbeitszeit, ArG-anwendbar? (Geltungsbereich!), Freizeitausgleich vereinbart?, Überstunden-Zuschlag vertraglich wegbedungen?
- Logik-Weiche: (1) **Abgrenzung** — bis zur ArG-Höchstgrenze (45/50 h) = **Überstunde (OR 321c)**; darüber = **Überzeit (ArG 12/13)**. (2) Überstunde: Zuschlag 25 % nur, wenn nicht wegbedungen und kein Freizeitausgleich. (3) Überzeit: 25 % zwingend; **Büro/techn./Verkauf erst über 60 Std/Jahr**; kein Zuschlag bei Freizeitausgleich.
- Ausgabe: Einordnung Überstunde/Überzeit, geschuldeter Zuschlag CHF, Hinweis Höchstgrenzen (170/140 Std).

**Beispielrechnung:** Büroangestellte, 80 Std Mehrarbeit über 45 h/Woche, Stundensatz 40, kein Freizeitausgleich. → Überzeit ArG 13: erste 60 Std zuschlagsfrei, 20 Std × 40 × 1,25 = Zuschlagsanteil 20 × 40 × 0,25 = **200 CHF Zuschlag** (+ Grundlohn 20 × 40, soweit nicht ausbezahlt). Übrige AN (kein 60-h-Sockel): voller Zuschlag ab 1. Überzeitstunde.

**4) §2-Beurteilung:** Deterministisch. **Achtung Geltungsbereich:** ArG gilt nicht für alle (Art. 2–4 ArG; höhere leitende AN, Familienbetriebe etc.) → ArG-Anwendbarkeit als **Eingabe + Warnung**, nicht annehmen.

**5) Datenbedarf:** keine kantonalen Parameter. GAV-Vorbehalt (Überstunden-Zuschlag).

**6) Fallstricke:** **Überstunde ≠ Überzeit** (Hauptfallstrick). OR-Zuschlag **wegbedingbar**, ArG-Zuschlag **zwingend**. 60-Std-Sockel **nur** für Büro/techn./Verkauf-Grossbetrieb. Freizeitausgleich «gleicher Dauer» (nicht 1,25-fach).

**7) Aufwand:** **M–L** (Geltungsbereich + zwei Normebenen). Wiederverwendung: gering (eigene Engine `mehrarbeit.ts`); `bruch.ts` für exakte Stundenquoten.

---

## Rechner 5 — Arbeitsrechtliche Entschädigungen (Rahmen-Rechner)

**1) Nutzerfrage:** «Wie hoch kann meine Entschädigung sein bei missbräuchlicher / fristloser Kündigung / Diskriminierung / als Abgangsentschädigung?»

**2) Normbasis (verbatim, Caches/Mirror):**
> **OR 336a Abs. 2 (missbräuchlich):** Entschädigung «vom Richter unter Würdigung aller Umstände», «darf aber den Betrag nicht übersteigen, der dem Lohn … für **sechs Monate** entspricht.» Abs. 3: bei 336 Abs. 2 lit. c (Rachekündigung bei Massenentlassung-Konsultation) **max. 2 Monate**.
> **OR 337c Abs. 3 (ungerechtfertigt fristlos):** Entschädigung «nach freiem Ermessen»; «darf jedoch den Lohn … für **sechs Monate** nicht übersteigen.» (zusätzlich Abs. 1: Lohnersatz bis ordentliches Ende, abzgl. Anrechnung Abs. 2.)
> **OR 339b/c (Abgangsentschädigung):** 339b Abs. 1: ab **50 Jahren** und **20+ Dienstjahren**. 339c Abs. 1: Mindestbetrag = **2 Monatslöhne** (sofern nicht abweichend vereinbart); Abs. 2: ohne Abrede vom Richter, **max. 8 Monatslöhne**. Abs. 3: Herabsetzung/Wegfall bei Selbstkündigung ohne wichtigen Grund / berechtigt fristlos / Notlage AG.
> **GlG Art. 5 (Diskriminierung)** [Mirror, TODO Fedlex]: Abs. 4: Ablehnung Anstellung **max. 3 Monatslöhne** (Basis voraussichtlicher/tatsächlicher Lohn, Abs. 2); diskriminierende Kündigung **und** sexuelle Belästigung (Abs. 3, Basis schweizerischer **Durchschnittslohn**) **max. 6 Monatslöhne**.

**3) Regelwerk-Skizze:**
- Eingaben: Tatbestand (336a / 337c / 339b-c / GlG-Anstellung / GlG-Kündigung / GlG-Belästigung), Monatslohn (bzw. CH-Durchschnittslohn bei GlG-Belästigung), bei 339c: vereinbarte Höhe.
- Ausgabe: **Rahmen** Min–Max in Monatslöhnen + CHF, Normverweis, je Tatbestand.

**Beispiel:** Monatslohn 7 000, missbräuchliche Kündigung (336a) → Rahmen **0 bis 42 000 CHF** (0–6 ML). 339c ohne Abrede → **14 000 bis 56 000 CHF** (2–8 ML).

**4) §2-Beurteilung (Kernentscheid):** Die Höhe ist **richterliches Ermessen** — eine Punktschätzung wäre ein §2-Verstoss (Heuristik/Schätzung verboten). **Entscheid: RAHMEN-Ausgabe** (gesetzliche Unter-/Obergrenze in Monatslöhnen × Lohn), **keine** Schätzung des konkreten Betrags. Begründung: Die **Grenzen** sind feste Rechtsregeln (deterministisch, §1/§2-konform); der Punkt dazwischen ist gerade nicht regelbasiert. Tool liefert damit verlässlichen Rahmen + transparenten Hinweis «konkrete Höhe = Gerichtsermessen».

**5) Datenbedarf:** GlG-Belästigung braucht **CH-Durchschnittslohn** (datierter Parameter → `parameter-verfall.md`!). Sonst keine kantonalen Parameter. 339b/c: GAV/Vertrags-Abrede als Eingabe.

**6) Fallstricke:** **339b/c heute praktisch durch BVG ersetzt** — Art. 339d: BVG-Arbeitgeberleistungen werden **angerechnet**, Anspruch entfällt meist [zu verifizieren, BGE] → **prominente Warnung + optionale BVG-Anrechnungs-Eingabe** (339d), sonst irreführend hohe Ausgabe. 337c kombiniert **Lohnersatz (Abs. 1) + Pönale (Abs. 3)** — zwei getrennte Posten, nicht verwechseln. 336a Abs. 3 (2-ML-Deckel) nur für lit.-c-Fall.

**7) Aufwand:** **M.** Wiederverwendung: Lohn-Eingabe-Muster; `bruch.ts` nicht nötig (ganze ML-Faktoren). Eigene Engine `arbeitEntschaedigung.ts`. Speist `arbeit-entschaedigung` (startseiteConfig).

---

## Rechner 6 — Anfechtung missbräuchliche Kündigung: FRISTEN (Art. 336b OR)

**1) Nutzerfrage:** «Bis wann muss ich Einsprache erheben und klagen, um Entschädigung nach 336a zu verlangen?»

**2) Normbasis (verbatim, Cache):**
> Art. 336b Abs. 1: «Wer gestützt auf Artikel 336 und 336a eine Entschädigung geltend machen will, muss gegen die Kündigung **längstens bis zum Ende der Kündigungsfrist** beim Kündigenden **schriftlich Einsprache** erheben.»
> Abs. 2: «… Wird nicht **innert 180 Tagen nach Beendigung des Arbeitsverhältnisses** eine **Klage** anhängig gemacht, ist der Anspruch **verwirkt**.»

**3) Regelwerk-Skizze:**
- Eingaben: Kündigungszugang, Ende Kündigungsfrist (oder aus Rechner Kündigungsfrist), Beendigungsdatum AV.
- Ausgaben: (a) **Einsprache-Deadline** = Ende Kündigungsfrist (schriftlich, an Kündigende); (b) **Klage-Deadline** = Beendigung AV + **180 Tage** (Verwirkung); Warnung «Einsprache ist Klage-Voraussetzung».

**Beispiel:** Zugang 15.3., 2-Monats-Frist → Ende Kündigungsfrist 31.5. (= Einsprache-Deadline); Beendigung 31.5. → Klage bis **27.11.** (31.5. + 180 Tage).

**4) §2-Beurteilung:** Voll deterministisch (feste 180-Tage-Verwirkungsfrist). Keine Schätzung. Tagezählung nach OR-Konvention (Beginn am Tag nach Beendigung [zu verifizieren — Fristlauf OR 77]).

**5) Datenbedarf:** keine kantonalen Parameter (materielle Frist, kein Gerichtsferien-Stillstand).

**6) Fallstricke:** Einsprache ist **zwingende Voraussetzung** der Klage (Abs. 2 «gültig erfolgt»). Frist endet an Beendigung, nicht an Zugang. 180 Tage = **Verwirkung** (nicht Verjährung, keine Unterbrechung). Schriftform der Einsprache.

**7) Aufwand:** **S.** Wiederverwendung: **stark** — `kuendigungsfrist.ts` (Ende Kündigungsfrist), `datumsUtils`/`allgemeineFrist.ts` (Tageaddition, Werktag-Verschiebung), `fristenEngine.ts`-Muster. Passt in `kuendigung-sperrfristen`.

---

## Rechner 7 — Massenentlassung (Art. 335d–k OR)

**1) Nutzerfrage:** «Liegt eine Massenentlassung vor (Schwelle), welche Pflichten/Fristen gelten, und besteht Sozialplanpflicht?»

**2) Normbasis (verbatim, Cache):**
> **335d (Schwellen, 30-Tage-Fenster, betriebsbezogen):** ≥**10** AN in Betrieben **>20 und <100**; ≥**10 %** in Betrieben **100–<300**; ≥**30** in Betrieben **≥300**. (Gründe ohne Personenbezug.)
> **335e:** gilt auch für befristete AV, die vorzeitig enden; **nicht** bei Konkurs/Nachlass mit Vermögensabtretung.
> **335f:** **Konsultationspflicht** der AN-Vertretung/AN (Vorschläge ermöglichen; schriftliche Mindestangaben a–d); **Kopie an kantonales Arbeitsamt** (Abs. 4).
> **335g:** **schriftliche Anzeige** ans kantonale Arbeitsamt; **Abs. 4: AV endet 30 Tage nach Anzeige** ans Arbeitsamt (Sperrwirkung), ausser späterer vertraglicher/gesetzlicher Termin.
> **335h–k (Sozialplan):** Pflicht (335i) bei AG mit **üblicherweise ≥250 AN** **und** Absicht, **≥30 AN innert 30 Tagen** zu kündigen (Abs. 2: zeitlich verteilte Kündigungen aus gleichem Entscheid werden zusammengezählt); 335j: Schiedsgericht bei Nichteinigung; 335k: nicht im Konkurs/Nachlass.

**Auftrags-Bestätigung:** 30-Tage-Sperre = **335g Abs. 4** (nicht Abs. 3; Abs. 3 = Lösungssuche durch Arbeitsamt) ✓ korrigiert. Sozialplan ab **250 AN / 30 Entlassene** ✓.

**3) Regelwerk-Skizze:**
- Eingaben: Betriebsgrösse (i.d.R. beschäftigte AN), Zahl geplanter Kündigungen, 30-Tage-Fenster ja/nein, Anzeigedatum ans Arbeitsamt, Konkurs/Nachlass?
- Logik: (1) **Schwellen-Weiche** nach Betriebsgrösse → Massenentlassung ja/nein. (2) Pflichten-Checkliste (Konsultation 335f, Anzeige 335g, Kopie Arbeitsamt). (3) **Frist:** früheste Beendigung = Anzeige + 30 Tage (335g Abs. 4) bzw. spätere ordentliche Kündigungsfrist (Maximum). (4) **Sozialplan-Weiche** (≥250 AN ∧ ≥30 Kündigungen).
- Ausgabe: Schwelle erfüllt?, Pflichtenliste, früheste Beendigung, Sozialplanpflicht.

**Beispiel:** Betrieb 80 AN, 12 Kündigungen in 30 Tagen → **>20/<100 ⇒ Schwelle 10 ⇒ ja**. Konsultation + Anzeige nötig; AV endet frühestens 30 Tage nach Anzeige. Sozialplan: 80<250 ⇒ **keine** Pflicht.

**4) §2-Beurteilung:** Voll deterministisch (feste Schwellen/Fristen). Keine Schätzung. «in der Regel beschäftigte AN» ist Sachverhalt → Nutzer-Eingabe.

**5) Datenbedarf:** kantonales Arbeitsamt als Behörden-Stammdatum (Adresse) wäre Ausbaustufe (analog `behoerden/`-Dossiers) — **nicht** im MVP. Sonst keine kantonalen Rechen-Parameter.

**6) Fallstricke:** Schwelle ist **betriebs-** (nicht unternehmens-)bezogen; Prozent-Schwelle nur im Band 100–<300. 30-Tage-**Fenster** (Tatbestand) ≠ 30-Tage-**Sperre** (335g IV, Rechtsfolge) — zwei verschiedene 30-Tage-Grössen! Konkurs/Nachlass-Ausnahmen (335e/335k).

**7) Aufwand:** **M.** Wiederverwendung: `datumsUtils` (30-Tage-Frist), Schwellen-Tabellen-Muster aus Zuständigkeits-Engines; kombinierbar mit Kündigungsfrist (Maximum-Vergleich). Eigene Engine `massenentlassung.ts`.

---

## Wiederverwendungs-Karte (bestehende Bausteine, §10)

| Baustein | nutzt Rechner |
|---|---|
| `datumsUtils.berechneDienstjahr`, Datumsdifferenzen, `letzerTagDesMonats` | 1, 2, 6, 7 |
| `bruch.ts` (exakte Quoten, `fmtB`) | 1, 2, 3, 4 |
| `kuendigungsfrist.ts` (Ende Kündigungsfrist) | 6, 7 (Maximum-Vergleich) |
| `lohnfortzahlung.ts`/`lohnfortzahlungSkalen.ts` (Dienstjahr-/Skala-Muster) | Vorbild für Skalen-Eingaben (kein direkter Reuse) |
| `allgemeineFrist.ts` / `fristenEngine.ts` (Tageaddition, Werktag-Verschiebung) | 6 |
| `verifikation.ts` (BGE-Register) | alle (Normverweise/BGE) |
| Katalog `startseiteConfig.ts` (`arbeit-entschaedigung`, `kuendigung-sperrfristen`) | 5 bzw. 6/7 |

---

## Priorisierte Bau-Reihenfolge

1. **Rechner 6 (336b-Fristen)** — S, höchster Reuse (`kuendigungsfrist.ts`), reine Fristmechanik, sofort §2-sauber. Schnellster Mehrwert in bestehendem `kuendigung-sperrfristen`.
2. **Rechner 1 (Ferienanspruch)** — S–M, Basis für Rechner 2 + 3 (Pro-rata-Mechanik, `bruch.ts`).
3. **Rechner 3 (13. ML pro rata)** — S, teilt Pro-rata-Helper mit 1.
4. **Rechner 2 (Ferienkürzung)** — M, baut auf 1 auf.
5. **Rechner 5 (Entschädigungen, Rahmen)** — M, füllt `arbeit-entschaedigung`; vorher GlG-Fedlex-TODO + 339d/BVG-Warnung klären.
6. **Rechner 7 (Massenentlassung)** — M, eigenständige Schwellen-Engine.
7. **Rechner 4 (Mehrarbeit OR/ArG)** — M–L, höchste Komplexität (Geltungsbereich + zwei Normebenen) → zuletzt.

**Querschnitt vor Bau:** GlG Art. 5 in `fedlex-cache.sh`/`quellen-register.md` aufnehmen; BGE-Anker (Gratifikation, 339d-Anrechnung, Ferien-Rundung) in `verifikation.ts` ergänzen; CH-Durchschnittslohn (GlG) in `parameter-verfall.md` datieren.
