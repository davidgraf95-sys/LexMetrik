# Recherche-Dossier — Cluster «ZPO/BGer Kosten & Verfahren»

**Erstellt:** 6.6.2026 · **Auftraggeber:** David · **Zweck:** Bau-Grundlage für
8 geplante Rechner (Streitwert, Prozesskosten kantonal, Bundesgerichtsgebühren,
Kostenvorschuss, Sicherheit Parteientschädigung, Fristwiederherstellung,
BGer-Fristen, Rechtsmittelprüfung erweitert).

**Recherchestand / Quellenlage:**
- ZPO-Wortlaute verbatim aus Filestore-Cache `/tmp/zpo.html`, Konsolidierung
  **20250101 (enthält Revision 2025, BG vom 17.3.2023, AS 2023 491)** — geprüft 6.6.2026.
- BGG-Wortlaute verbatim aus Filestore-Cache `/tmp/bgg.html` (Art. 46–53, 65, 74,
  75, 100, 113) — geprüft 6.6.2026.
- Bundes-Tarife (BGer/BVGer/BStGer/BPatGer): **bereits ZWEIFACH GEPRÜFT** in
  `bibliothek/kosten/gerichtskosten-bund.md` (5.6.2026). Hier NICHT dupliziert,
  nur referenziert.
- Kantonale Gerichts-/Schlichtungs-/Anwaltstarife: **bereits erfasst** in
  `bibliothek/kosten/gerichtskosten-kantone.md` (Teil A einfach belegt, Teil B +
  Doppelcheck offen), `schlichtungsgebuehren-kantone.md` (✓2),
  `anwaltstarife-kantone.md` (✓2). Hier NICHT dupliziert.

**WICHTIGE AUFTRAGS-KORREKTUREN (§7 — abweichen und offenlegen):**
1. **Art. 94a ZPO ist NICHT «Stufenklage», sondern «Verbandsklage».** Wortlaut
   am Cache: «Bei einer Verbandsklage setzt das Gericht den Streitwert … nach
   Ermessen fest …» (eingefügt Rev. 2025). Die **Stufenklage** hat keine eigene
   Streitwertnorm; ihr Streitwert folgt Art. 91 ZPO (Praxis/BGE, siehe §6).
   → Der Streitwert-Rechner muss Verbandsklage als **Ermessens-Weiche**
   behandeln (nicht berechenbar), nicht als ×20-Fall.
2. **Kostenvorschuss Art. 98 ZPO (Rev. 2025):** Auftrag korrekt — Grundregel
   neu «**höchstens der Hälfte** der mutmasslichen Gerichtskosten» (Abs. 1).
   Aber die volle Höhe (Abs. 2) gilt in VIER Fallgruppen, nicht nur Ausnahmen
   einzeln: lit. a (Art. 6 Abs. 4 lit. c / Art. 8), lit. b (Schlichtung),
   lit. c (summarisch, mit zwei Rück-Ausnahmen), lit. d (Rechtsmittelverfahren).
   → muss als Fall-Tabelle modelliert werden (siehe Rechner 4).
3. **Tarif BGer SR 173.110.210.1** ist Stand **1.1.2007** (keine neuere
   Konsolidierung) — die Beträge sind 2007er Rahmen, gelten aber weiter. Kein
   Verfallsdatum, aber im Register vermerken.

---

## VERIFIKATIONS-TODO-LISTE (vor «geprüft»-Hebung durch David)

- [ ] **BGE-Belege** in §6 jedes Rechners sind als [zu verifizieren] markiert —
      Originalentscheide gegen `src/data/verifikation.ts` prüfen.
- [ ] **Stufenklage-Streitwert**: BGE/Praxis (Gesamtinteresse vs. höchster
      Stufenwert) am Originalentscheid bestätigen [zu verifizieren].
- [ ] **Kantonale Gerichtskosten Teil B (SH–JU)** + adversarialer Doppelcheck
      Teil A in `gerichtskosten-kantone.md` (Status: einfach belegt) — Pflicht
      vor Bau des Rechners 2.
- [ ] **SG GKV sGS 941.12**: Sunset 30.6.2026 vs. publizierter Text ohne
      Sunset-Klausel — am 1.7.2026 aktiv klären (Parameter-Verfallsregister).
- [ ] **GebV SchKG SR 281.35** Konsolidierung 1.1.2026 nur signiertes PDF —
      relevant nur für Rechtsöffnungs-Vorschüsse, falls Rechner 2 SchKG-Summar
      einbezieht.
- [ ] **BGG-Tarif 210.1** auf neuere Konsolidierung prüfen (Stand 2007 — am
      Fedlex `future_versions` prüfen, vor Abnahme Rechner 3).
- [ ] **Art. 47/124 BGG** (richterliche Fristerstreckung / Revision BGer):
      Wortlaut Art. 124 BGG NICHT in diesem Dossier extrahiert — bei Bau
      Rechner 8 nachziehen.
- [ ] **Feiertage/Stillstand BGer**: Art. 46 BGG nennt feste Kalender-Daten
      (anders als ZPO Art. 145, das auf kantonale Feiertage zeigt) — Engine
      muss eigene Bundes-Stillstandsperioden führen (siehe Rechner 7).

---

# Rechner 1 — Streitwert (ZPO)

**1. Zweck.** Aus dem/den Rechtsbegehren den massgeblichen Streitwert bestimmen
(für Verfahrensart, Rechtsmittel, Kosten) — inkl. Kapitalisierung wiederkehrender
Leistungen, Klagenhäufung, Widerklage.

**2. Normbasis (ZPO, SR 272, Konsolidierung 20250101 = Rev. 2025).**
- **Art. 91 Grundsatz** — Streitwert nach Rechtsbegehren; Zinsen, laufende
  Verfahrenskosten, Publikationskosten und Eventualbegehren werden NICHT
  hinzugerechnet; nicht-bezifferte Begehren → Gericht setzt fest.
- **Art. 92 Wiederkehrende Nutzungen/Leistungen** — Kapitalwert; bei ungewisser
  oder unbeschränkter Dauer **zwanzigfacher Betrag** der einjährigen Leistung,
  bei Leibrenten der **Barwert**.
- **Art. 93 Streitgenossenschaft/Klagenhäufung** — Ansprüche werden
  **zusammengerechnet, sofern sie sich nicht gegenseitig ausschliessen**; bei
  einfacher Streitgenossenschaft bleibt die Verfahrensart trotz Zusammenrechnung
  erhalten (Abs. 2).
- **Art. 94 Widerklage** — Streitwert = **höheres** Rechtsbegehren (Abs. 1); für
  die **Prozesskosten** werden die Streitwerte zusammengerechnet, ausser sie
  schliessen sich aus (Abs. 2); **NEU Rev. 2025 Abs. 3**: Ist die Hauptklage eine
  **Teilklage**, werden die Prozesskosten ausschliesslich auf der Grundlage des
  Streitwerts der Hauptklage berechnet.
- **Art. 94a Verbandsklage (NEU Rev. 2025)** — Gericht setzt Streitwert nach
  Ermessen fest (Interesse der Angehörigen + Bedeutung des Falls). → KEINE Formel.

**3. Regelwerk-Skizze.**
Eingaben: pro Begehren { Typ: einmalig-beziffert | wiederkehrend | nicht-beziffert
| Naturalleistung; Betrag; bei wiederkehrend: Jahresbetrag + Dauer
(bestimmt/ungewiss/unbeschränkt/Leibrente) }; Konstellation { einfache
Streitgenossen ja/nein; Klagenhäufung; sich ausschliessend ja/nein; Widerklage
{Betrag, schliesst aus?}; Hauptklage ist Teilklage? }.

Deterministische Regeln:
- einmalig beziffert → Betrag (Art. 91; Zinsen/Kosten NICHT addieren).
- wiederkehrend, Dauer ungewiss/unbeschränkt → **Jahresbetrag × 20** (Art. 92 Abs. 1/2).
- wiederkehrend, Leibrente → Barwert (Eingabe nötig; NICHT berechenbar → Weiche).
- wiederkehrend, bestimmte Dauer → Kapitalwert = Summe der Leistungen
  (= Jahresbetrag × Jahre, ohne Diskontierung — Art. 92 Abs. 1 «Kapitalwert»;
  **[zu verifizieren]** ob ungeschmälerte Summe oder Barwert bei bestimmter Dauer).
- mehrere Begehren, NICHT ausschliessend → Summe (Art. 93 Abs. 1).
- mehrere Begehren, ausschliessend → höchster Einzelwert (kein Aufaddieren).
- nicht-beziffert / Naturalleistung / Verbandsklage → **Ermessens-Weiche**
  (Art. 91 Abs. 2 / 94a): Engine gibt KEINEN Wert aus, sondern Hinweis
  «Gericht setzt fest».
- Widerklage: massgeblicher Streitwert (Verfahren/Rechtsmittel) = max(Klage,
  Widerklage) (Art. 94 Abs. 1); für Kosten = Summe, ausser ausschliessend
  (Abs. 2); Hauptklage = Teilklage → Kosten nur auf Hauptklage-Streitwert
  (Abs. 3). → **Zwei getrennte Ausgaben** «Streitwert für Verfahren/Rechtsmittel»
  vs. «Kosten-Bemessungsgrundlage».

Ausgaben: massgeblicher Streitwert (Verfahren), Kosten-Bemessungsgrundlage,
Rechenweg mit Normverweisen; Warnungen bei jeder Ermessens-Weiche.

**4. §2-Beurteilung: TEILWEISE (Kern JA).** Die ×20-Regel, Zusammenrechnung,
Widerklage-max und Teilklage-Sonderregel sind hart regelbasiert → JA. Nicht
bezifferte Begehren, Leibrenten-Barwert, Verbandsklage, Stufenklage sind
**Ermessen** → als Weiche/Warnung ausweisen, NICHT schätzen (§2).

**5. Datenbedarf.** Keine kantonalen Parameter, keine datierten Werte. Nur
ZPO-Normtext (in Engine als Konstanten). Quelle: Fedlex ZPO SR 272.

**6. Fallstricke/Praxis.**
- «sich gegenseitig ausschliessen» (Art. 93/94) ist subsumtionsbedürftig →
  als Nutzer-Ja/Nein-Eingabe, nicht automatisch entscheiden.
- **Stufenklage**: kein eigener Streitwert-Artikel; nach Praxis bestimmt das
  Gesamtinteresse bzw. der höhere der gestuften Ansprüche den Streitwert
  [zu verifizieren] — Auftrag nannte fälschlich Art. 94a.
- Bei bestimmter Dauer ist strittig, ob blosse Summierung oder Barwert
  (Art. 92 «Kapitalwert») [zu verifizieren].
- Art. 91 Abs. 1: Zinsen NICHT addieren — häufiger Anfängerfehler.

**7. Aufwand S. Wiederverwendung:** speist `RECHTSMITTEL_SCHWELLEN`/
`ZPO_SCHWELLEN` in `src/lib/zustaendigkeit.ts` (Streitwert ist dort heute
Nutzereingabe; dieser Rechner liefert ihn vor). Eigene kleine reine Engine
`streitwert.ts`. Keine Fristen/Feiertage nötig.

---

# Rechner 2 — Prozesskosten / Gerichtskosten KANTONAL

**1. Zweck.** Dem Nutzer für seinen Kanton und Streitwert den **Gebührenrahmen**
(bzw. bei Formeltarifen den berechneten Wert) für Schlichtung und
erstinstanzlichen Entscheid sowie Rechtsmittel zeigen.

**2. Normbasis.**
- **Art. 95 ZPO** — Begriffe: Prozesskosten = Gerichtskosten + Parteientschädigung;
  Gerichtskosten = Schlichtungspauschale, Entscheidgebühr, Beweis-, Übersetzungs-,
  Kindesvertretungskosten.
- **Art. 96 ZPO (Rev. 2025)** — «Die **Kantone** setzen die Tarife … fest»
  (Vorbehalt Art. 16 Abs. 1 SchKG für Betreibungsgebühren). → Bundesrechtlich
  KEINE Beträge; alles kantonal.
- Kantonale Erlasse: vollständig erfasst in `bibliothek/kosten/
  gerichtskosten-kantone.md` (Teil A ZH–BL, alle Bänder/Formeln; Teil B + ✓2
  offen), `schlichtungsgebuehren-kantone.md` (✓2), `anwaltstarife-kantone.md` (✓2).

**3. Regelwerk-Skizze.**
Eingaben: Kanton, Streitwert (aus Rechner 1), Verfahren {ordentlich, vereinfacht,
summarisch, Rechtsöffnung, Rechtsmittel}, vermögensrechtlich ja/nein, ggf.
Reduktionstatbestände (Säumnis, Begründungsverzicht, gemeinsames Scheidungsbegehren).
Regeln je Kantonstyp:
- **Formel-Kantone** (ZH GebV OG § 4: Grenzsatzmethode; ZG analog) → exakter
  Betrag berechenbar (Sockel + % über Bandgrenze). DETERMINISTISCH.
- **Taxpunkt-Kantone** (BE VKD: 1 TP = CHF 1) → Rahmen pro Band.
- **Rahmen-Kantone** (Mehrheit) → CHF-Spanne pro Streitwertband (z. B. min–max);
  konkrete Festsetzung = Behördenermessen → **als Spanne ausweisen**.
- Summarisch: typ. Bruchteil (ZH § 8: ½–¾ der ordentlichen Gebühr).
- Rechtsmittel: meist «nach Vorinstanz, bemessen am noch Streitigen» (ZH § 12).
- Reduktionen/Zuschläge je Kanton (Säumnis bis ½, Begründungsverzicht auf ⅔, …).
Ausgaben: Schlichtungsgebühr-Rahmen, Entscheidgebühr (Betrag o. Spanne),
Rechtsmittelgebühr-Rahmen, anwendbarer Erlass + Link; Warnung «Behördenermessen».

**4. §2-Beurteilung: TEILWEISE.**
- Formel-/Taxpunkt-Kantone: **JA** (exakt parametrisierbar).
- Rahmen-Kantone: **als Spanne** ausweisbar (min/max sind hart) — die konkrete
  Festsetzung bleibt Ermessen → NICHT als Punktwert ausgeben. Konform §2/§8.
- → Parametrisierung pro Kanton zwingend (kein einheitliches Modell).

**5. Datenbedarf.** Vollständige Staffeln je Kanton (Teil B + ✓2 sind
**Vorbedingung**). Datierte Parameter im Verfallsregister: **SG GKV 30.6.2026**,
**GR HV 31.12.2026**, **BE EAV 31.12.2026**, JU-Punktwert (jährl. indexiert),
GebV SchKG 1.1.2026 (signiert). Quellen-URLs: pro Kanton in den kosten-Dossiers
und `src/data/erlassLinks.ts`.

**6. Fallstricke/Praxis.**
- **Nicht mit `zustaendigkeitKosten.ts` duplizieren** — dort sind Kurzrahmen für
  den Fahrplan; dieser Rechner ist die Tiefenstufe. SSoT-Frage: entweder
  `zustaendigkeitKosten.ts` ausbauen (volle Staffeln + Reduktionen) ODER neue
  Datendatei, die der Fahrplan-Kurzrahmen ableitet. **Empfehlung:** eine
  Staffel-Datendatei `gerichtsgebuehren/<KT>.ts`, aus der der Kurzrahmen
  generiert wird (§5 Single Source of Truth).
- Parteientschädigung (Anwaltstarife) ist eigener Block (`anwaltstarife-
  kantone.md`) — meist ebenfalls Rahmen/Ermessen.
- BS definiert Schlichtung relativ (% der Entscheidgebühr); SO/BL haben zwei
  Normen je Behördentyp → kantonsspezifische Logik.

**7. Aufwand L** (26 Kantone × mehrere Verfahren + Reduktionen; Datenpflege).
Wiederverwendung: `ZUSTAENDIGKEIT_KOSTEN` (Kurzrahmen), `erlassLinks.ts`,
Streitwert aus Rechner 1. **Vorbedingung: Teil B + Doppelcheck der Tiefenerfassung.**

---

# Rechner 3 — Bundesgerichtsgebühren (BGer + BVGer/BStGer/BPatGer)

**1. Zweck.** Gerichtsgebühren-Rahmen vor Bundesgerichten nach Streitwert/
Materie zeigen (BGer Beschwerde, BVGer, BStGer, BPatGer).

**2. Normbasis (alle ✓2 in `gerichtskosten-bund.md`).**
- **Art. 65 BGG** (SR 173.110, Stand 1.4.2026) — Abs. 3: ohne Vermögensinteresse
  200–5000; übrige 200–100 000. Abs. 4: 200–1000 (sozialvers./GlG/Arbeit bis SW
  30 000/BehiG). Abs. 5: Überschreitung höchstens aufs Doppelte (Abs. 3) bzw. bis
  10 000 (Abs. 4).
- **Tarif SR 173.110.210.1** (Stand 1.1.2007) — Streitwertstaffel mit 10 Bändern
  (0–10k → 200–5000 … über 10 Mio. → 20 000–100 000); ohne Vermögensinteresse
  200–5000; Art.-65-Abs.-4-Fälle 200–1000.
- **Parteientschädigung SR 173.110.210.3** (nicht 210.2 — Korrektur im Dossier!):
  Beschwerde-Honorar-Tarif (Art. 4), Klage-Tarif (Art. 5), ohne Vermögensinteresse
  600–18 000.
- **BVGer VGKE SR 173.320.2** (Art. 3/4 Staffeln; Stundenansätze Art. 10 200–400).
- **BStGer BStKR SR 173.713.162** (Stand 1.1.2026; Rahmenbeträge je Verfahrensstufe).
- **BPatGer KR-PatGer SR 173.413.2** (Streitwertstaffel Art. 1/5).

**3. Regelwerk-Skizze.** Eingaben: Gericht, Materie (mit/ohne Vermögensinteresse,
Spezialfall Art. 65 Abs. 4), Streitwert, Verfahrensstufe. Regel: Band-Lookup →
CHF-Spanne; Abs.-5-Überschreitungshinweis. Ausgaben: Gebühren-Spanne,
ggf. Parteientschädigungs-Spanne, Tarif + Link, Hinweis «Bemessung nach
Art. 65 Abs. 2 BGG (Umfang/Schwierigkeit/Prozessführung/finanzielle Lage)».

**4. §2-Beurteilung: JA (als Spanne).** Bänder/Beträge sind hart und
bundesweit einheitlich; konkrete Festsetzung ist Ermessen → Spanne ausweisen,
nicht Punktwert. Keine kantonale Parametrisierung. Sauberster §2-Kandidat des
Clusters.

**5. Datenbedarf.** Nur Bundestarife (in Engine als Konstanten); Verfalls-Check:
Tarif 210.1 Stand 2007 → bei Bau `future_versions` prüfen. URLs in
`gerichtskosten-bund.md`.

**6. Fallstricke.** Art. 65 Abs. 4 (Festbetrag 200–1000 STATT Streitwertstaffel)
ist eine eigene Weiche — leicht zu übersehen. BVGer/BStGer/BPatGer haben je
abweichende Staffeln (NICHT die BGer-Staffel kopieren). BStGer ist
streitwertUNabhängig (Strafe) — nur Rahmen je Stufe.

**7. Aufwand M.** Reine Konstanten-Engine `bundesgerichtsgebuehren.ts`; nutzt
Streitwert aus Rechner 1. Hohe Datenreife (✓2 vorhanden) → schnell, risikoarm.

---

# Rechner 4 — Kostenvorschuss (Art. 98 ZPO, Rev. 2025)

**1. Zweck.** Mutmasslichen Gerichtskostenvorschuss berechnen — Kernneuerung
Rev. 2025: grundsätzlich nur noch die **Hälfte**.

**2. Normbasis.** **Art. 98 ZPO** (Konsolidierung 20250101, Rev. 2025, AS 2023 491):
> Abs. 1: «Das Gericht und die Schlichtungsbehörde können von der klagenden
> Partei einen Vorschuss von **höchstens der Hälfte** der mutmasslichen
> Gerichtskosten verlangen.»
> Abs. 2: «Sie können einen Vorschuss bis zur Höhe der **gesamten** mutmasslichen
> Gerichtskosten verlangen in: a. Verfahren nach Art. 6 Abs. 4 lit. c und nach
> Art. 8; b. Schlichtungsverfahren; c. summarischen Verfahren **mit Ausnahme**
> der vorsorglichen Massnahmen nach Art. 248 lit. d und der familienrechtlichen
> Streitigkeiten nach Art. 271, 276, 302 und 305; d. Rechtsmittelverfahren.»
- **Art. 101 ZPO** — Frist zur Leistung; Nachfrist; **Nichteintreten** bei
  Säumnis (Abs. 3). (Vorsorgliche Massnahmen schon vor Sicherheit möglich, Abs. 2.)

**3. Regelwerk-Skizze.** Eingaben: mutmassliche Gerichtskosten (aus Rechner 2/3),
Verfahren {ordentlich/vereinfacht, summarisch (+ Unterfall vorsorgl. Art. 248
lit. d / Familienrecht 271/276/302/305), Schlichtung, Rechtsmittel, Art. 6 Abs. 4
lit. c / Art. 8}. Regel:
- Default → **0,5 × Gerichtskosten** (Abs. 1).
- Fällt das Verfahren unter Abs. 2 lit. a/b/d → **bis 1,0 × Gerichtskosten**.
- summarisch (lit. c) → **bis 1,0 ×**, ABER vorsorgl. Massnahmen Art. 248 lit. d
  und FamR 271/276/302/305 → zurück auf Abs. 1 (½).
Ausgaben: Vorschussbetrag bzw. -Spanne (½ … evtl. ganz), Normverweis, Hinweis
auf «kann» (Ermessen ob überhaupt/wie hoch) + Nachfrist/Nichteintreten (Art. 101).

**4. §2-Beurteilung: JA (Faktor regelbasiert).** Der **Faktor** (½ vs. bis 1/1)
ist hart aus Art. 98 ableitbar. Die mutmasslichen Gerichtskosten kommen aus
Rechner 2/3 (dort ggf. Spanne → Vorschuss als Spanne). «Kann» = Ermessen der
Behörde → als Höchstwert/Spanne + Hinweis ausweisen (§8).

**5. Datenbedarf.** Keine eigenen Parameter; abhängig von Rechner 2/3. ZPO-Norm
in Engine.

**6. Fallstricke.** Die ZWEI Rück-Ausnahmen in lit. c (Art. 248 lit. d;
271/276/302/305) sind leicht zu übersehen — sie ziehen den Vorschuss von «ganz»
auf «Hälfte» zurück. Schlichtung (lit. b) zählt zur vollen Höhe — gegenintuitiv.
Übergangsrecht: Art. 98 n.F. gilt für nach 1.1.2025 eingeleitete Verfahren
[zu verifizieren] — alte Fälle ½-Regel ggf. nicht.

**7. Aufwand S.** Kleine reine Engine `kostenvorschuss.ts`, hängt an Rechner 2/3.
Sinnvoll erst NACH Rechner 2/3 (braucht deren Output als Eingabe), aber als
Faktor-Logik isoliert baubar/testbar.

---

# Rechner 5 — Sicherheit für die Parteientschädigung (Art. 99–101 ZPO)

**1. Zweck.** Prüfen, ob die klagende Partei auf Antrag der Beklagten Sicherheit
(Kaution) leisten muss, und in welchen Verfahren das ausgeschlossen ist.

**2. Normbasis.**
- **Art. 99 ZPO** — Kautionsgründe Abs. 1: a. kein Wohnsitz/Sitz in CH; b.
  zahlungsunfähig (Konkurs/Nachlass/Verlustscheine); c. schuldet Prozesskosten
  aus früheren Verfahren; d. andere Gründe erheblicher Gefährdung. Abs. 2:
  notwendige Streitgenossenschaft → nur wenn bei ALLEN ein Grund vorliegt.
  Abs. 3 **Ausschluss**: a. vereinfachtes Verfahren (ausser vermögensrechtl.
  nach Art. 243 Abs. 1); b. Scheidungsverfahren; c. summarisches Verfahren
  (ausser Rechtsschutz in klaren Fällen, Art. 257); d. DSG-Streitigkeiten
  (SR 235.1, seit 1.9.2023).
- **Art. 101 ZPO** — Fristsetzung, Nachfrist, Nichteintreten (gemeinsam mit Vorschuss).

**3. Regelwerk-Skizze.** Eingaben: Verfahren (vereinfacht + vermögensrechtl.
Art. 243 Abs. 1?, Scheidung, summarisch + Art. 257?, DSG), Kautionsgrund (a–d),
notwendige Streitgenossenschaft (alle?). Regel: Ausschlusstatbestand Abs. 3 →
KEINE Sicherheit (Engine: «entfällt»). Sonst: liegt mind. ein Grund Abs. 1 vor →
auf Antrag Sicherheit; bei notw. Streitgenossen Abs. 2-Prüfung. Ausgaben:
ja/nein/auf-Antrag, einschlägiger Grund/Ausschluss, Normverweis, Hinweis
Antragserfordernis + Nichteintretensfolge (Art. 101).

**4. §2-Beurteilung: JA (Tatbestands-Subsumtion).** Gründe und Ausschlüsse sind
abschliessend und Ja/Nein-prüfbar. «Zahlungsunfähig erscheint» / «andere Gründe
erheblicher Gefährdung» (Abs. 1 lit. b/d) sind wertungsoffen → als
Nutzer-Ja/Nein + Hinweis, nicht automatisch bejahen. Kein Geldbetrag berechnet
(Höhe = mutmassliche Parteientschädigung, Ermessen) → Engine ist Prüf-/
Weichenrechner, kein Betragsrechner.

**5. Datenbedarf.** Nur ZPO-Norm. Keine kantonalen/datierten Parameter.

**6. Fallstricke.** Abs. 3 lit. a-Ausnahme (vereinfacht ABER vermögensrechtl.
Art. 243 Abs. 1 → doch Sicherheit) ist die Stolperstelle. Art. 257 (klare Fälle)
ist Rück-Ausnahme im Summarverfahren. Höhe der Kaution NICHT berechenbar.

**7. Aufwand S.** Reine Weichen-Engine `sicherheitParteientschaedigung.ts`;
Verfahrensart-Modell teilbar mit Rechner 4 (gemeinsame Verfahrens-Typologie).

---

# Rechner 6 — Fristwiederherstellung (Art. 148/149 ZPO)

**1. Zweck.** Prüfen, ob eine versäumte Frist/ein versäumter Termin
wiederhergestellt werden kann (Voraussetzungen, 10-Tage-Gesuchsfrist).

**2. Normbasis.**
- **Art. 148 ZPO** — Abs. 1: Nachfrist/erneute Vorladung, wenn Partei
  glaubhaft macht, dass sie **kein oder nur leichtes Verschulden** trifft.
  Abs. 2: Gesuch **innert 10 Tagen seit Wegfall des Säumnisgrundes**. Abs. 3:
  nach eröffnetem Entscheid nur innert **6 Monaten seit Rechtskraft**.
- **Art. 149 ZPO (Rev. 2025)** — Verfahren: Gegenpartei anhören; Gericht
  entscheidet **endgültig**, ausser die Verweigerung hätte definitiven
  Rechtsverlust zur Folge.

**3. Regelwerk-Skizze.** Eingaben: Verschuldensgrad (keins/leicht/mittel/grob),
Datum Wegfall Säumnisgrund, ob Entscheid eröffnet + Rechtskraftdatum.
Regeln (deterministisch):
- Verschulden > leicht → Wiederherstellung **ausgeschlossen** (Art. 148 Abs. 1).
- Gesuchsfrist = 10 Tage ab Wegfall (Fristberechnung via `zpoFristen`/
  `fristenEngine`!) → diesAdQuem berechnen; Warnung wenn überschritten.
- Wenn Entscheid eröffnet: zusätzlich 6-Monats-Schranke ab Rechtskraft prüfen.
Ausgaben: zulässig ja/nein/Frist-kritisch, Gesuchsfrist-Ende, 6-Monats-Schranke,
Normverweise, Hinweis «endgültiger Entscheid (Art. 149)».

**4. §2-Beurteilung: TEILWEISE (Fristen JA, Verschulden Ermessen).** Die
10-Tage- und 6-Monats-Fristen sind hart berechenbar (JA). «Kein/leichtes
Verschulden» ist wertungsoffen → Nutzer-Eingabe des Grades + Hinweis, dass
Gericht würdigt (§8). Engine berechnet Fristen + zeigt Voraussetzungs-Checkliste,
entscheidet das Verschulden NICHT.

**5. Datenbedarf.** Feiertage/Stillstand für die 10-Tage-Frist → bestehende
`zpoFeiertage`-Daten (kantonsabhängig). Keine neuen Parameter.

**6. Fallstricke.** «Wegfall des Säumnisgrundes» ist Tatfrage (Eingabe). 6-Monats-
Schranke ist absolute Grenze unabhängig vom Verschulden. Glaubhaftmachung ≠
Beweis. Stillstand gilt auch für die 10-Tage-Frist [zu verifizieren] —
über `zpoFristen` mit korrekter Verfahrensart abbilden.

**7. Aufwand S–M.** Engine `fristwiederherstellung.ts`; **nutzt `zpoFristen.ts`/
`fristenEngine.ts` direkt** für die 10-Tage- und 6-Monats-Berechnung (hohe
Wiederverwendung).

---

# Rechner 7 — BGer-Fristen-Rechner (BGG 46/47/48/100)

**1. Zweck.** Beschwerdefrist ans Bundesgericht berechnen (30/10/5/3 Tage),
inkl. Bundes-Stillstand und elektronischer Eingabe.

**2. Normbasis (BGG, SR 173.110, geprüft am Cache).**
- **Art. 46 Stillstand** — feste Daten: a. 7. Tag vor bis 7. Tag nach Ostern;
  b. **15. Juli–15. August**; c. **18. Dezember–2. Januar**. Abs. 2 Ausnahmen:
  aufschiebende Wirkung/vorsorgl. Massnahmen, Wechselbetreibung, Stimmrechtssachen,
  internat. Rechts-/Amtshilfe Straf/Steuer, öffentliche Beschaffungen.
- **Art. 47 Erstreckung** — gesetzliche Fristen NICHT erstreckbar; richterliche
  aus zureichenden Gründen (Gesuch vor Ablauf).
- **Art. 48 Einhaltung** — Expeditionsprinzip (Post/Vertretung am letzten Tag);
  **elektronisch**: massgeblich der Zeitpunkt der **Quittung** (alle
  Übermittlungsschritte abgeschlossen); Abs. 3 Eingabe bei Vorinstanz/unzuständiger
  Behörde wahrt Frist; Abs. 4 Vorschuss-/Sicherheitsfrist.
- **Art. 100 Beschwerdefristen** — Abs. 1 **30 Tage** ab vollständiger
  Ausfertigung; Abs. 2 **10 Tage** (SchKG-Aufsichtsbehörden; internat.
  Rechts-/Amtshilfe; Kindesrückführung HKÜ; BPatGer-Lizenz Art. 40d PatG);
  Abs. 3 **5 Tage** (SchKG-Wechselbetreibung; eidg. Abstimmungen); Abs. 4
  **3 Tage** (Nationalratswahlen); Abs. 5 interkantonale Kompetenzkonflikte;
  Abs. 7 Rechtsverweigerung/-verzögerung jederzeit.

**3. Regelwerk-Skizze.** Eingaben: Entscheidtyp (steuert 30/10/5/3 Tage),
Eröffnungsdatum (vollständige Ausfertigung), Materie (für Art.-46-Abs.-2-
Ausnahme), Eingabeart (Post/elektronisch). Regeln: Tagesfrist ab Folgetag der
Eröffnung; **Bundes-Stillstand** (Art. 46 Abs. 1) ruhen lassen, AUSSER
Abs.-2-Ausnahme; Ende auf Sa/So/Feiertag → nächster Werktag (Fristengesetz
SR 173.110.3). Ausgaben: diesAdQuem, Rechenweg, Stillstand-Hinweis, Hinweis
Expeditions-/Quittungsprinzip.

**4. §2-Beurteilung: JA.** Fristlängen, Stillstandsdaten und Ausnahmen sind hart.
Der Entscheidtyp (welche Fristlänge) ist Nutzer-Auswahl aus abschliessender Liste.

**5. Datenbedarf.** **Eigene Bundes-Stillstandsperioden** (Art. 46: fixe
Kalenderdaten, Ostern beweglich → Computus aus `datumsUtils`/`fristenEngine`
vorhanden). Feiertage Bundesebene (Fristengesetz SR 173.110.3 — im
quellen-register als «Link ohne Anker» vermerkt → Wortlaut noch ziehen).
Ostern-Berechnung: prüfen, ob `fristenEngine` bereits Computus liefert.

**6. Fallstricke.** ZPO-Stillstand (Art. 145, kantonale Feiertage,
verfahrensabhängig) ≠ BGG-Stillstand (Art. 46, fixe Bundesdaten,
materienabhängig). **NICHT** die ZPO-Feiertagsdaten verwenden. Elektronische
Eingabe: Quittungszeitpunkt, nicht Versandzeitpunkt. «Vollständige Ausfertigung»
als Fristauslöser (nicht Dispositiv-Eröffnung).

**7. Aufwand M.** Engine `bggFristen.ts`; **nutzt `fristenEngine.ts`** (generische
Stillstand-Strategie `Stillstand`/`fristendeTage`) mit eigener
Bundes-Stillstand-Konfiguration. Ostern-Computus aus bestehender Infrastruktur.

---

# Rechner 8 — Rechtsmittelprüfung erweitert (BGG)

**1. Zweck.** Bestehende Rechtsmittel-Weiche (`bestimmeRechtsmittel`) um die
Lücken ergänzen: Art. 75 BGG Vorinstanz-Ausnahmen, subsidiäre
Verfassungsbeschwerde (Art. 113 ff.), kantonale Revision (Art. 328 f. ZPO).

**2. Normbasis (am Cache geprüft).**
- **Art. 51 BGG** Streitwertberechnung BGer (parallel ZPO 91): Begehren vor
  Vorinstanz streitig (lit. a); nicht-Geldsumme → Ermessen (Abs. 2); Zinsen/
  Kosten/Parteientschädigung als Nebenrechte NICHT mitgezählt (Abs. 3);
  wiederkehrende Leistungen ungewiss/unbeschränkt **×20**, Leibrente Barwert (Abs. 4).
- **Art. 52 Zusammenrechnung**, **Art. 53 Widerklage** (Widerklage NICHT mit
  Hauptklage zusammengerechnet — Unterschied zu ZPO 94 Abs. 2 für Kosten!).
- **Art. 74 Streitwertgrenze** (15 000 Miete/Arbeit; 30 000 übrige; Abs. 2
  Ausnahmen a–e: Rechtsfrage grundsätzl. Bedeutung, einzige kant. Instanz,
  SchKG-Aufsicht, Konkurs-/Nachlassrichter, BPatGer).
- **Art. 75 Vorinstanzen** — letzte kantonale Instanz; Abs. 2 obere Gerichte als
  Rechtsmittelinstanz, AUSSER: a. einzige kant. Instanz; b. Fachgericht
  Handelssachen einzige Instanz; c. Direktklage SW ≥ 100 000 mit Zustimmung aller.
- **Art. 100 Fristen** (siehe Rechner 7).
- **Art. 113 BGG** — subsidiäre Verfassungsbeschwerde, soweit keine Beschwerde
  nach Art. 72–89 zulässig.
- **Art. 328/329 ZPO** — Revisionsgründe (Rev. 2025: NEU lit. d nachträglich
  entdeckter Ausstandsgrund; lit. c unwirksame Klageanerkennung/-rückzug/
  Vergleich) + Fristen: **90 Tage** seit Entdeckung (329 Abs. 1), absolut
  **10 Jahre** ab Rechtskraft (Abs. 2, ausser 328 Abs. 1 lit. b).

**3. Regelwerk-Skizze (Ergänzungen zur bestehenden Engine).** Heute deckt
`bestimmeRechtsmittel` (src/lib/zustaendigkeit.ts) ab: kantonal Berufung/Beschwerde
(308/319), BGer-Schwelle (74), einzige Instanz (5/74 Abs. 2/75 Abs. 2 lit. a).
**Lücken:** (a) Art. 75 Abs. 2 lit. b/c (Handelsgericht-/Direktklage-Vorinstanz)
explizit; (b) subsidiäre Verfassungsbeschwerde als eigener Ausgabezweig wenn
Schwelle verfehlt UND keine grundsätzliche Rechtsfrage; (c) Revisions-Weiche
(328/329) als Sonderrechtsbehelf mit 90-Tage-/10-Jahres-Frist.

**4. §2-Beurteilung: JA (Schwellen) / TEILWEISE (Ausnahmen).** Schwellen 15k/30k/
100k und Fristen sind hart. «Rechtsfrage von grundsätzlicher Bedeutung» (74 Abs. 2
lit. a) und Revisionsgründe sind wertungsoffen → als Weiche/Hinweis, nicht
automatisch bejahen (wie heute schon).

**5. Datenbedarf.** Nur Normtext; `RECHTSMITTEL_SCHWELLEN` bereits vorhanden
(15k/30k/10k Berufung). Ergänzen: Direktklage 100k (Art. 75 Abs. 2 lit. c),
Revisionsfristen 90 T / 10 J.

**6. Fallstricke.** Widerklage: für BGer-Streitwert NICHT zusammenrechnen
(Art. 53 — anders als Kosten nach ZPO 94 Abs. 2!) — getrennt von Rechner 1
modellieren. Subsidiäre VB ist nur Verfassungsrügen (Art. 116) → Hinweis, kein
Ersatz für ordentliche Beschwerde. Revision (328 ZPO) ist kein Rechtsmittel im
engen Sinn (eigene Frist/Instanz: «Gericht, das als letzte Instanz entschied»).

**7. Aufwand M.** Ausbau bestehender `bestimmeRechtsmittel`-Engine + neue
Revisions-Weiche; **hohe Wiederverwendung** (`RECHTSMITTEL_SCHWELLEN`,
`ZPO_SCHWELLEN`, `OBERE_INSTANZEN`, `handelsgerichte.ts`). Fristen ans
Bundesgericht via Rechner 7.

---

# PRIORISIERTE BAU-REIHENFOLGE (Cluster)

**1. Streitwert (Rechner 1) — zuerst.** S-Aufwand, reine Bundesnorm (✓ am Cache),
keine Datenpflege. Ist **Eingabe für fast alle anderen** (Kosten, Vorschuss,
Rechtsmittel, BGG-Streitwert). Liefert sofort Nutzen und entkoppelt die
Streitwert-Eingabe von der Zuständigkeits-Engine. Risikoarm.

**2. Bundesgerichtsgebühren (Rechner 3).** M-Aufwand, aber **Datenreife am
höchsten** (`gerichtskosten-bund.md` ✓2). Reine Konstanten, JA-§2, kein
kantonaler Daten-Blocker. Schneller, sauberer Gewinn vor dem grossen Kanton-Block.

**3. BGer-Fristen (Rechner 7).** M-Aufwand, eigenständig (kein Kanton-Daten-
Blocker), nutzt `fristenEngine`. Häufiger Praxisbedarf (30-Tage-Beschwerdefrist).
Liefert Frist-Baustein für Rechner 8.

**4. Rechtsmittelprüfung erweitert (Rechner 8).** Baut auf bestehender Engine +
Rechner 1 (Streitwert) + Rechner 7 (BGer-Frist); schliesst die im Auftrag
genannten Lücken (75 BGG, 113 ff., 328 ZPO).

**5. Fristwiederherstellung (Rechner 6).** S–M, nutzt `zpoFristen`; eigenständig,
kein Daten-Blocker. Gut parallel zu 7/8 baubar.

**6. Sicherheit Parteientschädigung (Rechner 5).** S, reine Weichen-Engine;
teilt Verfahrens-Typologie mit Rechner 4.

**7. Kostenvorschuss (Rechner 4).** S Faktor-Logik, aber **braucht Rechner 2/3
als Eingabe** (mutmassliche Gerichtskosten). Faktor-Engine isoliert vorab
baubar/testbar; produktiv sinnvoll nach 2/3.

**8. Prozesskosten kantonal (Rechner 2) — zuletzt / parallel als Daten-Track.**
L-Aufwand, **Vorbedingung: Teil B (SH–JU) + adversarialer Doppelcheck der
Tiefenerfassung** (`gerichtskosten-kantone.md` derzeit Teil A einfach belegt).
Höchstes Daten- und Verfallsrisiko (SG 30.6.2026 etc.). Datenarbeit jetzt
starten, Engine bauen, sobald ✓2 steht. Speist rückwirkend Rechner 4 mit
echten Gerichtskosten.

**Begründung der Reihenfolge:** zuerst die Bundesnorm-Rechner mit hoher
Datenreife und ohne kantonalen Blocker (1, 3, 7, 8), die sich gegenseitig
speisen; dann die kleinen Weichen-Rechner (5, 6); zuletzt der daten- und
verifikationsintensive kantonale Kostenblock (2) mit dem davon abhängigen
Vorschussrechner (4). So entsteht in jeder Stufe ein abgeschlossener, testbarer
Mehrwert, ohne auf offene Verifikationen zu warten (§6/§8).
