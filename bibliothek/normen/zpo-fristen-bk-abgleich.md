# ZPO-Fristen (Art. 142–147) — Abgleich Berner Kommentar gegen Fristen-Engine

**Erstellt:** 10.6.2026, Auftrag David (Wissens-Verwertung Ablage «Legal Calc
Knowledge»: BK-Kommentierung Art. 142–147 ZPO gegen `src/lib/zpoFristen.ts`
und `src/lib/fristenEngine.ts` prüfen).
**Status:** ERSTRECHERCHE (Abgleich einfach belegt; alle 14 Golden-Sonden
empirisch gegen die Engine gerechnet, Lauf 10.6.2026 via `vite-node`).

**Quellen:**

- **PRIVAT (Praxis-Schicht, lokale Kopie):** FREI Nina J., Berner Kommentar
  ZPO, 2. Aufl. 2026 (Stämpfli, ISBN 978-3-7272-2210-8), Art. 142–147 ZPO,
  S. 1819–1902 — 7 PDFs unter
  `bibliothek/quellen/legal-calc-knowledge/Fristenrechner ZPO/` (gitignored,
  nicht wiederbeschaffungs-garantiert; Zitate unten als «BK Art. X N y»).
  Keine Wortlaut-Übernahmen aus dem Kommentar (Urheberrecht) — alle Regeln
  eigenformuliert.
- **AMTLICH (Beleg):** ZPO SR 272, Fedlex-Pin Konsolidierung **20250101**
  (enthält Revision 2025) gemäss
  [quellen-register.md](../register/quellen-register.md); Normtexte Art.
  142–147 im BK-PDF dreisprachig abgedruckt und mit dem gepinnten Stand
  deckungsgleich (Stichprobe Art. 142 Abs. 1bis, 143 Abs. 1bis, 145 Abs. 4 —
  alles Revision-2025-Fassungen).
- **Rechtsprechung:** nur via BK referenziert (SEKUNDÄR, nicht an der
  amtlichen Sammlung gegengeprüft): BGer 5A_691/2023 v. 13.8.2024
  (Praxisänderung Monatsfristen), BGE 139 III 78, BGE 138 III 615,
  BGer 4A_387/2023, BGer 5A_976/2021.

**Geprüfter Code-Stand:** `src/lib/zpoFristen.ts` (284 Z.),
`src/lib/fristenEngine.ts` (191 Z.), `src/data/zpoFeiertage.ts` (194 Z.),
jeweils Arbeitskopie vom 10.6.2026 (Zeilenangaben beziehen sich darauf).

---

## Ergebnis-Übersicht

| Bereich | Regeln geprüft | korrekt | Befunde |
|---|---|---|---|
| Art. 142 (Beginn/Berechnung) | 10 | 10 | — |
| Art. 143 (Einhaltung) | 4 | 3 | B-2 (NIEDRIG, Hinweistext) |
| Art. 144 (Erstreckung) | 4 | 4 | — |
| Art. 145 (Stillstand) | 7 | 7 | — |
| Art. 146 (Wirkungen Stillstand) | 5 | 4 | B-1 (MITTEL, nur Mindermeinungs-Modus) |
| Art. 147 (Säumnis) | 1 | 1 | — |
| Querschnitt | — | — | B-3 (NIEDRIG, Jahresfristen — bereits offengelegt) |

**31 Regeln geprüft, 29 korrekt, 1 Berechnungsbefund (nur opt-in-Modus),
1 Textbefund, 1 dokumentierter Dissens.** Geltungsgrenzen s. Schluss.

---

## Art. 142 — Fristbeginn und -berechnung

### R-142.1 Tagesfristen: Beginn am Folgetag (Abs. 1)

- Regel: Ereignis/Zustellung am Tag T → erster gezählter Tag T+1, auch wenn
  T+1 Sa/So/Feiertag ist; Sa/So/Feiertage im Lauf zählen mit (BK Art. 142
  N 7, S. 1825; N 9, S. 1828; N 14, S. 1830).
- Engine: `fristendeTage` startet bei `addDays(ereignis, 1)` und zählt jeden
  Tag (`fristenEngine.ts:73–91`); keine Werktagsfilterung im Lauf.
- **Verdikt: Engine korrekt** (fristenEngine.ts:79–88).

### R-142.2 Zustellung gewöhnliche Post an arbeitsfreiem Tag (Abs. 1bis)

- Regel: Zustellung per gewöhnlicher Post (A-/B-Post, A-Post Plus) an
  Sa/So/anerkanntem Feiertag am Gerichtsort → Mitteilung gilt als am
  nächsten Werktag erfolgt; gilt nach BK für ALLE Fristarten, nicht nur
  Tagesfristen (BK Art. 142 N 8b–8c, S. 1827 f.). Bei Zustellung gegen
  Empfangsbestätigung keine Korrektur.
- Engine: `ereignisKorrigiert` schiebt nur bei
  `zustellart === 'gewoehnliche_post'` auf den nächsten Werktag
  (`zpoFristen.ts:72–79`) und wird VOR der Einheiten-Verzweigung angewandt
  (`zpoFristen.ts:112`) → wirkt auch auf Monats-/Wochen-/Jahresfristen.
- Sonde 10: gewöhnliche Post Sa 13.7.2024 → massgeblich Mo 15.7. ✓
- **Verdikt: Engine korrekt** (zpoFristen.ts:72–79, 112).

### R-142.3 Monatsfristen: Ereignistag massgeblich (Abs. 2, Praxisänderung)

- Regel: Seit BGer 5A_691/2023 (Praxisänderung) gilt Abs. 1 NUR für
  Tagesfristen; bei Monatsfristen (und nach BK-Autorin analog Wochen-/
  Jahresfristen) ist der Ereignistag selbst der dies a quo, Ende am
  gleichbezeichneten Tag. BK-Beispiel: Klagebewilligung erhalten 19.8. →
  Klagefrist endet 19.11. (BK Art. 142 N 5c–5g, S. 1823–1825; N 7b, S. 1826).
- Engine: Default-Modus `bundesgericht` → `fristendeKalender` mit
  `beginnFolgetag = false` (`zpoFristen.ts:138`; `fristenEngine.ts:113–122`).
- Sonde 2: 19.8.2024 + 3 Monate → 19.11.2024 ✓
- **Verdikt: Engine korrekt** (zpoFristen.ts:138; fristenEngine.ts:95–122).
  Mindermeinung als opt-in mit [UMSTRITTEN]-Warnung und BGer-Zitat
  (zpoFristen.ts:224–226) — deckt sich mit dem im BK referierten
  Lehre-Dissens (BK Art. 142 N 5f, S. 1825). Zum Stillstand-Randfall des
  Mindermeinungs-Modus s. **B-1**.

### R-142.4 Fehlender gleichbezeichneter Tag → Monatsletzter (Abs. 2 Satz 2)

- Regel: 31.1. + 1 Monat → 28./29.2.; 31.1. + 3 Monate → 30.4. (BK Art. 142
  N 12, S. 1828 f.).
- Engine: date-fns `addMonths`/`addYears` klemmen auf den Monatsletzten
  (`fristenEngine.ts:95–102`).
- Sonde 6: 31.1.2025 + 1 Monat → 28.2.2025 ✓
- **Verdikt: Engine korrekt** (fristenEngine.ts:98–99).

### R-142.5 Wochenfristen: gleicher Wochentag

- Regel: Zustellung Fr 13.9. + 1 Woche → Fr 20.9. (Art. 4 Abs. 1 EuFrÜb;
  BK Art. 142 N 13, S. 1829).
- Engine: `addDays(ref, 7·N)` ab Ereignistag (`fristenEngine.ts:97`).
- Sonde 7: 13.9.2024 + 1 Woche → 20.9.2024 ✓
- **Verdikt: Engine korrekt** (fristenEngine.ts:97).

### R-142.6 Jahresfristen: Schaltjahr-Klemmung

- Regel: Zustellung 29.2.2024 + 1 Jahr → 28.2.2025 (BK Art. 142 N 13,
  S. 1829).
- Sonde 8: ✓ (`addYears`-Klemmung, fristenEngine.ts:99).
- **Verdikt: Engine korrekt.**

### R-142.7 Fristende an Sa/So/Feiertag → nächster Werktag (Abs. 3)

- Regel: Gilt für ALLE Fristen, nur für das ENDE (nicht Beginn/Lauf);
  Feiertage des **Gerichtsorts** massgeblich, nicht des Partei-/
  Vertreterwohnsitzes (anders Art. 45 Abs. 2 BGG) (BK Art. 142 N 14–15,
  S. 1829 f.).
- Engine: `normalisiereEnde` schiebt vorwärts auf den nächsten Werktag
  (`fristenEngine.ts:180–191`); Feiertagsprüfung über `input.kanton` =
  Gerichtsort (`zpoFristen.ts:156`, Annahme explizit `zpoFristen.ts:245`).
- **Verdikt: Engine korrekt** (fristenEngine.ts:184–190; zpoFristen.ts:156).

### R-142.8 Kumulation Abs. 3 + Art. 145 Abs. 1

- Regel: Fällt das (ggf. werktagsverschobene) Ende in eine
  Stillstandsperiode, greifen Abs. 3 und Art. 145 Abs. 1 kumulativ.
  BK-Beispiel: Tagesfrist läuft Sa 13.7. ab → Ende erst 16.8. (BK Art. 142
  N 14a, S. 1830).
- Engine: `normalisiereEnde`-Schleife `ruhen_weiter` prüft abwechselnd
  Periode und Arbeitsfreiheit bis stabil (`fristenEngine.ts:184–190`).
- Sonde 1: 20-Tage-Frist ab 23.6.2024, rechnerisches Ende Sa 13.7.2024 →
  16.8.2024 ✓ (exakt das BK-Beispiel).
- **Verdikt: Engine korrekt** (fristenEngine.ts:184–190).

### R-142.9 Feiertags-Unsicherheit → Wiederherstellungs-Hinweis

- Regel: BJ-/EuFrÜb-Liste (Stand 2011) ist bloss deklaratorisch; massgeblich
  ist das aktuelle kantonale Recht; bei Unklarheit regelmässig nur leichtes
  Verschulden → Wiederherstellung Art. 148 (BK Art. 142 N 16–17,
  S. 1830 ff., inkl. Hinweis auf den Fehlentscheid BGer 4A_538/2023 zu
  Allerheiligen/AG).
- Engine: Verifikationsvorbehalt als ständige Warnung mit Art.-148-Hinweis
  (`zpoFristen.ts:229`); Datenbasis + Vorbehalt dokumentiert in
  [feiertage-kantone-bj.md](feiertage-kantone-bj.md) und
  `zpoFeiertage.ts:60–83`.
- **Verdikt: Engine korrekt / Vorbehalt deckungsgleich mit BK-Kritik.**

### R-142.10 Zustellfiktion (Art. 138 Abs. 3 lit. a, Hilfsgrösse)

- Regel: Nicht abgeholtes Einschreiben gilt am 7. Tag nach erfolglosem
  Zustellversuch als zugestellt, unabhängig vom Wochentag; Art. 142 Abs. 3
  ist auf die Abholfrist NICHT anwendbar (BK Art. 142 N 8, S. 1826 f.,
  und N 14a, S. 1830, je mit BGer 5A_976/2021 bzw. 5A_61/2022).
- Engine: `zustellfiktion` = +7 Kalendertage ohne jede Normalisierung
  (`zpoFristen.ts:282–284`).
- **Verdikt: Engine korrekt** (zpoFristen.ts:282–284).

---

## Art. 143 — Einhaltung der Frist

Der Rechner rechnet hier nicht, er informiert (Rechenweg-Schritt
«Fristwahrung», `zpoFristen.ts:232–236`). Abgleich der Aussagen:

### R-143.1 Expeditionsprinzip, 24.00 Uhr

- Regel: Eingabe bis 24.00 Uhr des letzten Tages dem Gericht eingereicht
  oder zuhanden des Gerichts der Schweizerischen Post (auch My Post 24,
  Briefkasteneinwurf) übergeben; Beweislast für Rechtzeitigkeit bei der
  Partei, Beweismass Sicherheit (BK Art. 143 N 1, S. 1835; N 6–8,
  S. 1837 f.; N 23, S. 1855 f.).
- Engine-Hinweistext: Expeditionsprinzip, 24.00 Uhr, Beweislast genannt
  (`zpoFristen.ts:234`); Ablauf 24.00 Uhr zusätzlich als Annahme
  (`zpoFristen.ts:247`).
- **Verdikt: Engine korrekt** (zpoFristen.ts:232–236), mit Lücke **B-2**.

### R-143.2 Unzuständiges schweizerisches Gericht (Abs. 1bis, neu 2025)

- Regel: Innert Frist irrtümlich beim unzuständigen schweizerischen Gericht
  eingereichte Eingaben gelten als rechtzeitig; Weiterleitung von Amtes
  wegen (BK Art. 143 N 16b, S. 1843 f.; N 16aa, S. 1852: Datum der
  Ersteinreichung zählt).
- Engine-Hinweistext nennt Abs. 1bis (`zpoFristen.ts:234`).
- **Verdikt: Engine korrekt** (Hinweis-Ebene; Details wie Irrtums-Begriff
  sind nicht regelfähig — Lehre laut BK N 16h–16j tief gespalten).

### R-143.3 Elektronische Eingabe (Abs. 2)

- Regel: Massgeblich ist die Quittung der anerkannten Zustellplattform über
  den Abschluss aller partei­seitigen Übermittlungsschritte; ohne Quittung
  keine Fristwahrung, selbst bei nachweisbar rechtzeitiger Aufgabe (BK
  Art. 143 N 13, S. 1840 f.).
- Engine-Hinweistext: «Elektronisch: Quittung der Zustellplattform (Abs. 2)»
  (`zpoFristen.ts:234`).
- **Verdikt: Engine korrekt** (Hinweis-Ebene).

### R-143.4 Zahlungen (Abs. 3)

- Regel: Betrag bis zum letzten Tag am Postschalter einbezahlt ODER einem
  schweizerischen Post-/Bankkonto belastet; Zahlungsauftrag mit Valuta am
  letzten Tag genügt NICHT (BK Art. 143 N 17–20, S. 1853 ff.).
- Engine: nicht abgebildet (weder Rechenpfad noch Hinweis).
- **Verdikt: bewusste Geltungsgrenze**, s. Schlussabschnitt (der Rechner
  bestimmt Fristenden; die Zahlungsmodalität ändert das Fristende nicht).

---

## Art. 144 — Erstreckung

### R-144.1 Gesetzliche Fristen nicht erstreckbar (Abs. 1)

- Regel: Keine Erstreckung; bei Versäumnis nur Wiederherstellung Art. 148
  (BK Art. 144 N 4–5, S. 1861 f.).
- Engine: Erstreckungs-Input wird nur bei `fristnatur === 'gerichtlich'`
  verarbeitet (`zpoFristen.ts:167`); Warnung + Rechenwegschritt für
  gesetzliche Fristen (`zpoFristen.ts:192–198`).
- **Verdikt: Engine korrekt** (zpoFristen.ts:167, 192–198).

### R-144.2 Gerichtliche Fristen: zureichende Gründe, Gesuch vor Ablauf (Abs. 2)

- Regel: Gesuch muss vor Fristablauf (bis 24.00 Uhr des letzten Tages)
  GESTELLT sein (Eintreffen beim Gericht nicht nötig); kein Anspruch,
  Ermessen (BK Art. 144 N 8, S. 1862 f.; N 12, S. 1865).
- Engine-Warnung formuliert genau das (`zpoFristen.ts:200`).
- **Verdikt: Engine korrekt** (zpoFristen.ts:200–205).

### R-144.3 Lauf der erstreckten Frist

- Regel: Erstreckung in Tagen/Wochen läuft ab dem Tag nach dem letzten Tag
  der ursprünglichen Frist (einschliesslich einer allfälligen
  Sa/So/Feiertags-Verlängerung nach Art. 142 Abs. 3); Art. 142 Abs. 1 findet
  keine Anwendung; verlängert die laufende Frist, begründet keine neue
  (BK Art. 144 N 15, S. 1867).
- Engine: Start `addDays(diesAdQuem, 1)` ab dem NORMALISIERTEN Ende — exakt
  die BK-Lesart («allenfalls verlängert durch Sa/So/Feiertage»); kein
  zusätzlicher Folgetag (`zpoFristen.ts:169–171`).
- Sonde 13: Frist-Ende Fr 13.9.2024, +10 Tage → 23.9.2024 (So 22.9. wäre
  Roh-Ende, Werktagsverschiebung Mo) ✓
- **Verdikt: Engine korrekt** (zpoFristen.ts:166–187).

### R-144.4 Gerichtsferien erfassen erstreckte Fristen

- Regel: Stillstand gilt auch für Nachfristen und erstreckte Fristen
  (BK Art. 145 N 11, S. 1875; Art. 146 N 1, S. 1882).
- Engine: Erstreckungs-Zählung überspringt Stillstandstage, Endergebnis wird
  normalisiert (`zpoFristen.ts:172–181`).
- **Verdikt: Engine korrekt** (zpoFristen.ts:172–181).

---

## Art. 145 — Fristenstillstand

### R-145.1 Perioden (Abs. 1)

- Regel: (a) 7. Tag vor bis und mit 7. Tag nach OsterSONNTAG = 15 Tage
  (So vor Ostern bis So nach Ostern); (b) 15.7.–15.8. = 32 Tage;
  (c) 18.12.–2.1. = 16 Tage; Eckdaten zählen mit, auch wenn Sa/So/Feiertag;
  abschliessend, keine kantonalen Zusätze (BK Art. 145 N 4–5, S. 1873 f.).
- Engine: `stillstandsperioden` exakt diese drei Perioden, Ostersonntag via
  Computus (`zpoFeiertage.ts:29–39`, `7–23`); Periodendauern im
  Code-Kommentar 15/32/16 Tage.
- **Verdikt: Engine korrekt** (zpoFeiertage.ts:29–39).

### R-145.2 Hemmung laufender Tagesfristen

- Regel: Letzter Tag vor dem Stillstand zählt noch; nächster Zähltag ist der
  erste Tag nach dem Stillstand (Hemmung, keine Unterbrechung — die Frist
  beginnt nicht neu). BK-Beispiel: Zustellung 15.12. → Tage 1–2 am 16./17.12.,
  Ruhen, Tag 3 am 3.1. (BK Art. 145 N 7, S. 1874; Art. 146 N 3, S. 1882).
- Engine: `fristendeTage` zählt geschlossene Tage nicht mit, setzt die
  Zählung danach fort (`fristenEngine.ts:81–89` mit `ruhenZaehlung`).
- Sonde 3: Zustellung 15.12.2024, 30 Tage → 30.1.2025 ✓ (16.12. = Tag 1,
  3.1. = Tag 3, 30.1. = Tag 30).
- **Verdikt: Engine korrekt** (fristenEngine.ts:81–89).

### R-145.3 Zustellung WÄHREND des Stillstands, Tagesfristen (Art. 146 Abs. 1)

- Regel: Zustellung im Stillstand ist zulässig; der Fristenlauf beginnt am
  ersten Tag nach Ende des Stillstands (Aufschub). BK-Beispiel: Zustellung
  10.8. → Fristbeginn 16.8. (BK Art. 145 N 7, S. 1874; Art. 146 N 5,
  S. 1883; Botschaft-Beispiel).
- Engine: Folgetags-Cursor überspringt alle Stillstandstage, erster
  gezählter Tag = erster Tag nach Periodenende (`fristenEngine.ts:81–89`).
- Sonde 4: Zustellung 10.8.2024, 10 Tage → dies a quo 16.8., Ende 26.8.
  (25.8. = So → Mo) ✓
- **Verdikt: Engine korrekt** (fristenEngine.ts:81–89).

### R-145.4 Monats-/Wochenfristen und Stillstand (kein BGG-Vorbehalt)

- Regel: Anders als Art. 46 BGG beschränkt die ZPO den Stillstand nicht auf
  Tagesfristen → auch Monats-/Wochenfristen stehen still. Methode: Ende nach
  Art. 142 Abs. 2 bestimmen, dann die Stillstandstage hinzuzählen (15/32/16),
  wenn das so ermittelte Datum in oder nach den Gerichtsferien liegt
  (BK Art. 145 N 8, S. 1874 f.; Art. 146 N 6b, S. 1883 f.).
- Engine: kumulative Verlängerung um die volle Periodendauer für jede
  Periode mit Beginn nach dem dies a quo und vor/auf dem (laufend
  verlängerten) Ende (`fristenEngine.ts:124–144`); mehrere Perioden
  kumulativ (BK Art. 146 N 6c, S. 1884) durch die Schleife abgedeckt.
- Sonde 9: Zustellung 20.6.2024 + 1 Monat → naiv 20.7. (im Stillstand),
  +32 Tage → 21.8.2024 ✓
- **Verdikt: Engine korrekt** (fristenEngine.ts:124–144). Randfall des
  Mindermeinungs-Modus: **B-1**.

### R-145.5 Zustellung WÄHREND des Stillstands, Monatsfristen

- Regel (BK ausdrücklich als strittig markiert): Frist beginnt um 24.00 Uhr
  des LETZTEN Stillstandstags (15.8. / 2.1. / 7. Tag nach Ostern) und endet
  am gleichbezeichneten Tag — BK-Beispiel Klagebewilligung: Ende 15.11.
  bzw. 2.4. (BK Art. 145 N 8, S. 1874 f.; Art. 146 N 6b, S. 1883 f.,
  je KuKo-Linie).
- Engine: Ereignis in Periode → dies a quo = Periodenende, gleichbezeichneter
  Tag ab dort (`fristenEngine.ts:113–117`); Rechenweg legt die
  Art.-146-Begründung offen (`zpoFristen.ts:147`).
- Sonde 5: Zustellung 20.12.2024 + 3 Monate → dies a quo 2.1.2025, Ende
  2.4.2025 ✓ (BK-Beispiel «2. April»).
- **Verdikt: Engine korrekt im Sinne der BK-/KuKo-Linie**; der Punkt ist in
  der Lehre strittig (BK markiert ihn selbst so) — Engine folgt der vom BK
  vertretenen Auffassung.

### R-145.6 Ausnahmen (Abs. 2) und Verfahrens-Mapping

- Regel: Kein Stillstand im Schlichtungs- und im summarischen Verfahren,
  einschliesslich der Rechtsmittelfristen gegen summarische Entscheide
  (BGE 139 III 78; BGer 4A_387/2023; BK Art. 145 N 13–13a, S. 1875 ff.).
  ABER Stillstand gilt: im ordentlichen, vereinfachten und (nicht-summarischen)
  familienrechtlichen Verfahren (Abs. 2 e contrario, BK N 13) sowie für die
  Klagefrist nach erteilter Klagebewilligung, Art. 209 Abs. 3/4 — gehört zum
  gerichtlichen Verfahren (BGE 138 III 615; BK Art. 145 N 14, S. 1876).
- Engine: `STILLSTAND_GILT`-Map deckungsgleich — ordentlich/vereinfacht/
  familienrecht/klagefrist_klagebewilligung = true; schlichtung/summarisch/
  rechtsmittel_summarisch = false (`zpoFristen.ts:38–46`).
- **Verdikt: Engine korrekt** (zpoFristen.ts:38–46).

### R-145.7 Hinweispflicht als Gültigkeitsvorschrift (Abs. 3)

- Regel: Fehlt der Hinweis auf die Nichtgeltung des Stillstands, stehen die
  Fristen gleichwohl still (BGE 139 III 78; BK Art. 145 N 16, S. 1877 f.) —
  der Hinweis muss mit der konkreten Fristansetzung erfolgen.
- Engine: Input `gerichtshinweisStillstand` (Default true); bei `false` gilt
  der Stillstand trotz Abs.-2-Verfahren, mit eigenem Rechenwegschritt und
  BGE-Zitat (`zpoFristen.ts:97–109`); umgekehrt Dauer-Warnung, dass die
  Nichtgeltung den Hinweis voraussetzt (`zpoFristen.ts:209–216`).
- Sonden 11/12: summarisch ohne Hinweis → dies a quo 16.8. (Stillstand
  wirkt); mit Hinweis → 11.8. ✓
- **Verdikt: Engine korrekt** (zpoFristen.ts:97–109, 209–216).

---

## Art. 146 — Wirkungen des Stillstands

### R-146.1 Erster Tag nach Stillstand darf Sa/So/Feiertag sein

- Regel: Ob der erste wieder zählende Tag arbeitsfrei ist, spielt keine
  Rolle — relevant nur für den LETZTEN Tag (BK Art. 145 N 7, S. 1874;
  Art. 146 N 4, S. 1882).
- Engine: Lauf-Zählung kennt keine Werktagsfilter; nur `normalisiereEnde`
  verschiebt (`fristenEngine.ts:81–89` vs. `180–191`).
- **Verdikt: Engine korrekt.**

### R-146.2 Aufschub bei Zustellung im Stillstand

→ geprüft unter R-145.3 (Tagesfristen) und R-145.5 (Monatsfristen); Engine
korrekt; Norm-Zitierung der Engine (Art. 146 Abs. 1 für den
dies-a-quo-Aufschub, `zpoFristen.ts:32, 147`) deckt sich mit der
BK-Systematik.

### R-146.3 Kombination Abs. 1 + Art. 142 Abs. 3 + Art. 145 Abs. 1

- Regel: Werktagsverschiebung und Stillstand werden kombiniert bzw. bei
  mehreren Perioden kumulativ angewandt (BK Art. 146 N 6c, S. 1884).
- Engine: Endnormalisierungs-Schleife iteriert Periode→Werktag→Periode bis
  Fixpunkt (`fristenEngine.ts:184–190`); Kalenderfrist-Verlängerung iteriert
  über alle berührten Perioden (`fristenEngine.ts:128–143`).
- **Verdikt: Engine korrekt** (Sonde 1 deckt die Kombination ab).

### R-146.4 Abs. 2 (keine Verhandlungen) 

- Reine Termin-Norm, vom Fristenrechner nicht zu rechnen — Geltungsgrenze,
  kein Modellierungsbedarf (BK Art. 146 N 7–9, S. 1884 f.).

---

## Art. 147 — Säumnis

### R-147.1 Scope-Abgrenzung des Rechners

- Regel: Säumnisfolge = Weiterführung des Verfahrens ohne die versäumte
  Handlung, Präklusion ohne Nachfrist und ohne Säumnis-Zwischenverfahren;
  zahlreiche Spezialnormen (Nachfristen Art. 101 Abs. 3, 223 Abs. 1 usw.);
  Hinweis nach Abs. 3 ist Voraussetzung der Präklusivwirkung (BK Art. 147
  N 7, S. 1890; N 29, S. 1900).
- Engine: rechnet bewusst keine Säumnisfolgen; expliziter Rechenwegschritt
  «bestimmt nur das Fristende … Bei Säumnis: Art. 147; Wiederherstellung:
  Art. 148» (`zpoFristen.ts:237–241`).
- **Verdikt: Engine korrekt** (ehrliche Scope-Abgrenzung statt
  Schein-Modellierung; vgl. §8 CLAUDE.md). Art. 148 wird im BK-Bestand
  (Art. 142–147) nur per Verweis behandelt — kein eigener Abgleich möglich;
  die Engine nutzt Art. 148 nur als Hinweis (`zpoFristen.ts:193, 229, 239`),
  was mit den BK-Verweisen (leichtes Verschulden bei Feiertags-Unklarheit,
  Art. 142 N 17) übereinstimmt.

---

## BEFUNDE

### B-1 (Grad MITTEL) — Mindermeinungs-Modus verliert die Stillstandsverlängerung, wenn der Folgetag exakt der erste Stillstandstag ist

- **Code-Fundstelle:** `fristenEngine.ts:133` — die Kandidaten-Bedingung
  `isAfter(p.von, ref)` ist STRIKT; im Mindermeinungs-Modus ist
  `ref = diesAQuo + 1` (`fristenEngine.ts:119–120`, Aufruf
  `zpoFristen.ts:138`). Fällt dieser Folgetag genau auf den Periodenbeginn
  (15.7., 18.12., 7. Tag vor Ostersonntag), wird die Periode weder über die
  dies-a-quo-Verschiebung (`fristenEngine.ts:114–117` prüft nur das
  EREIGNIS, nicht `ref`) noch über die Kandidaten-Schleife erfasst.
- **Empirischer Beleg (Sonden 10.6.2026):** Zustellung 14.7.2024 + 1 Monat:
  BGer-Modus 16.9.2024, Mindermeinungs-Modus **16.8.2024** — der Modus, der
  konstruktionsgemäss einen Tag MEHR geben soll, liefert ein um einen Monat
  früheres Ende. Ebenso 17.12.2024 + 1 Monat: BGer-Modus 3.2.2025,
  Mindermeinung **20.1.2025**.
- **Kommentar-Fundstelle:** BK Art. 145 N 7–8 (S. 1874 f.) und Art. 146
  N 6b (S. 1883 f.): die Hemmung gilt für alle Fristarten und unabhängig
  davon, wie der Fristbeginn bestimmt wird; eine Lesart, bei der die
  Folgetags-These die Sommerferien-Verlängerung eliminiert, vertritt
  niemand.
- **Tragweite:** nur der opt-in-Modus `mindermeinung` (UI-Default ist
  `bundesgericht`), nur 3 Auslösetage pro Jahr; Fehlrichtung «zu früh»
  (kein Säumnisrisiko für Nutzer, aber falscher Ausweis). Fix-Skizze:
  Kandidaten-Bedingung auf `>= ref` stellen oder die
  dies-a-quo-Periodenprüfung auf `ref` statt `ereignis` beziehen — mit
  Golden-Vergleich nach §6 (BGer-Modus-Ausgaben müssen byte-gleich bleiben).
  **Kein Code-Eingriff in dieser Session (Auftrags-Verbot).**

### B-2 (Grad NIEDRIG) — Fristwahrungs-Hinweis nennt die diplomatische/konsularische Vertretung nicht

- **Code-Fundstelle:** `zpoFristen.ts:234` — der Rechenwegschritt
  «Fristwahrung (Art. 143 ZPO)» nennt Gericht, Schweizerische Post,
  elektronische Eingabe und Abs. 1bis, nicht aber die Übergabe an eine
  schweizerische diplomatische oder konsularische Vertretung.
- **Kommentar-Fundstelle:** BK Art. 143 N 10–11 (S. 1838 f.): dritte
  fristwahrende Übergabestelle nach Abs. 1; steht nicht nur
  Auslandsansässigen offen, sondern auch ferien-/geschäftshalber im Ausland
  weilenden Parteien.
- **Tragweite:** reiner Informationstext, keine Berechnungswirkung; für
  Nutzer im Ausland aber praktisch relevant. Ergänzung des Hinweistexts
  empfohlen (ein Halbsatz).

### B-3 (Grad NIEDRIG, bereits offengelegt) — Jahresfristen × Gerichtsferien: Engine folgt der extensiven Lehre-Linie

- **Code-Fundstelle:** `fristenEngine.ts:124–144` wendet die
  Stillstandsverlängerung auf ALLE Kalender-Einheiten an, also auch
  Jahresfristen; `zpoFristen.ts:219–221` warnt dazu [UNGEKLÄRT].
- **Kommentar-Fundstelle:** BK Art. 145 N 8 a. E. (S. 1875): nach
  KuKo-Linie bleiben Gerichtsferien bei Jahresfristen unberücksichtigt
  (nur kein Ende IN den Ferien); BK Art. 146 N 6b (S. 1884) referiert
  dagegen DIKE-TANNER mit +63 Tagen pro Jahr — exakt das Engine-Verhalten.
  Die BK-Autorin entscheidet den Streit nicht.
- **Tragweite:** Engine rechnet die längere Variante UND warnt — Ausweis ist
  ehrlich (§8); kein Korrekturbedarf, aber Befund festhalten: sollte die
  Rechtsprechung die KuKo-Linie bestätigen, wäre die Verlängerung für
  `einheit === 'jahre'` zu deaktivieren (Endverschiebung aus den Ferien
  hinaus bliebe).

---

## Negativbefunde / Geltungsgrenzen (S5)

Geprüft und als **bewusste, korrekte Auslassungen** eingestuft (kein
Fehler, kein stiller Verzicht):

1. **Materielle Klagefristen** (Art. 75/521/533 ZGB usw.): unterstehen den
   Art. 142 ff. NICHT (kein Stillstand, keine Erstreckung/Wiederherstellung;
   BK Art. 142 N 2, S. 1821; Art. 144 N 6, S. 1862). Der ZPO-Rechner bietet
   keine solche Fristart an → korrekt; ein künftiger Rechner für materielle
   Klagefristen dürfte diese Engine NICHT wiederverwenden (§4: getrennte
   Regimes).
2. **Mehrfach-Erstreckungen:** BK Art. 142 N 14 (S. 1829 f.) — bei mehreren
   Erstreckungen läuft die Frist über zwischenzeitliche Sa/So/Feiertag-Enden
   ohne Verschiebung weiter (Verschiebung nur am letzten Ende). Die Engine
   bildet genau EINE Erstreckung ab (`zpoFristen.ts:167`); für diese (= die
   letzte) ist das Verhalten korrekt. Ketten-Erstreckungen sind kein Input —
   Geltungsgrenze, im UI nicht angeboten.
3. **Richterlich auf ein Kalenderdatum gesetzte Fristen** (BK Art. 145 N 9,
   S. 1875: Ende im Stillstand → erster Tag danach): die Engine nimmt nur
   Dauer-Fristen (Länge + Einheit) entgegen, keine Datums-Fristen —
   Geltungsgrenze.
4. **Art. 145 Abs. 4 (Klagen nach SchKG / Beschwerde Aufsichtsbehörde,
   neu 2025):** kein eigener Verfahrens-Typ im ZPO-Rechner. Materiell
   gedeckt: SchKG-Klagen vor Gericht folgen dem ZPO-Stillstand (Auswahl
   «ordentlich»), Rechtsöffnung u. ä. sind summarische Verfahren (Auswahl
   «summarisch» → kein Stillstand, deckt sich mit der BK-Schlussfolgerung,
   BK Art. 145 N 18–19, S. 1878 f.; Streitstand zu Art.-251-Summarsachen
   dort offen). Betreibungsamtliche Fristen laufen über die separate
   SchKG-Strategie (`fristenEngine.ts:160–177`, Art. 63 SchKG) — nicht
   Gegenstand dieses Abgleichs.
5. **Art. 143 Abs. 3 (Zahlungen)** und **Beweisfragen der Fristwahrung**
   (Poststempel-Vermutung, Zeugen, Video): nicht regelfähig im Sinn eines
   deterministischen Rechners bzw. ohne Einfluss auf das Fristende —
   Geltungsgrenze (R-143.4).
6. **Art. 142 Abs. 1bis bei nicht fristauslösenden Sendungen:** BK Art. 142
   N 8b (S. 1827) erwartet einen kleinen Anwendungsbereich (Verfügungen/
   Entscheide gehen nicht per gewöhnlicher Post). Die Engine bietet die
   Zustellart trotzdem an — kein Fehler, grosszügigere Abdeckung.
7. **BK-Druckfehler-Verdacht ohne Engine-Relevanz:** BK Art. 142 N 14a
   (S. 1830) nennt als Beispiel den «Samstag, dem 13.7.» mit Ende 16.8. —
   die Sonde bestätigt, dass die Engine dieses Beispiel exakt reproduziert
   (Jahr 2024).
8. **Verfallsregister:** keine neuen datierten Parameter aus diesem
   Abgleich (die BJ-Feiertagsliste ist bereits über
   [feiertage-kantone-bj.md](feiertage-kantone-bj.md) registriert; der BK
   ist Praxis-Schicht, kein änderbarer Rechtsparameter).

---

## Empirische Sonden (Reproduktion)

14 + 6 Sonden, gerechnet 10.6.2026 mit `npx vite-node` gegen
`berechneFrist` (Arbeitsskript flüchtig in /tmp, hier vollständig als
Eingabe→Ausgabe dokumentiert; Kanton ZH):

| # | Eingabe | Engine-Ausgabe (Ende) | BK-Erwartung | OK |
|---|---|---|---|---|
| 1 | 23.6.2024, 20 T, ordentlich | 16.8.2024 | 16.8. (N 14a) | ✓ |
| 2 | 19.8.2024, 3 M | 19.11.2024 | 19.11. (N 5g) | ✓ |
| 3 | 15.12.2024, 30 T | 30.1.2025 | Tag 3 = 3.1. (145 N 7) | ✓ |
| 4 | 10.8.2024, 10 T | dies a quo 16.8., Ende 26.8. | Beginn 16.8. (145 N 7) | ✓ |
| 5 | 20.12.2024, 3 M | dies a quo 2.1., Ende 2.4.2025 | 2.4. (146 N 6b) | ✓ |
| 6 | 31.1.2025, 1 M | 28.2.2025 | Monatsletzter (N 12) | ✓ |
| 7 | Fr 13.9.2024, 1 W | Fr 20.9.2024 | gleicher Wochentag (N 13) | ✓ |
| 8 | 29.2.2024, 1 J (schlichtung) | 28.2.2025 | 28.2.2025 (N 13) | ✓ |
| 9 | 20.6.2024, 1 M | 21.8.2024 | naiv 20.7. + 32 T (145 N 8) | ✓ |
| 10 | Sa 13.7.2024, gewöhnl. Post, 10 T | massgeblich 15.7., Ende 26.8. | Abs. 1bis + 146 I | ✓ |
| 11 | 10.8.2024, 10 T, summarisch, OHNE Hinweis | dies a quo 16.8. | Stillstand gilt (BGE 139 III 78) | ✓ |
| 12 | 10.8.2024, 10 T, summarisch, mit Hinweis | dies a quo 11.8., Ende 20.8. | kein Stillstand | ✓ |
| 13 | 3.9.2024, 10 T gerichtlich + Erstreckung 10 T | Ende 13.9., erstreckt 23.9. | ab Folgetag, Abs. 3 (144 N 15) | ✓ |
| 14 | 19.8.2024, 3 M, Mindermeinung | 20.11.2024 | +1 Tag ggü. BGer | ✓ |
| B1a | 14.7.2024, 1 M, BGer-Modus | 16.9.2024 | 14.8. + 32 T → 16.9. | ✓ |
| B1b | 14.7.2024, 1 M, Mindermeinung | **16.8.2024** | ≥ 16.9. erwartet | **✗ B-1** |
| B1c | 17.12.2024, 1 M, Mindermeinung | **20.1.2025** | ~3.2./4.2. erwartet | **✗ B-1** |
| B1d | 17.12.2024, 1 M, BGer-Modus | 3.2.2025 | 17.1. + 16 T → 2.2. (So) → 3.2. | ✓ |
| B1e | 15.7.2024, 1 M, BGer-Modus | dies a quo 15.8., Ende 16.9. | 15.9. (So) → 16.9. (146 N 6b) | ✓ |

---

## Folgearbeit (Vorschlag, nicht Teil dieses Auftrags)

1. **B-1 fixen** (fristenEngine.ts:133 bzw. 114–117), danach
   `npm run golden:vergleich` — BGer-Modus muss byte-gleich bleiben; neue
   Regressionstests für die drei Auslösetage × Mindermeinung.
2. **B-2**: Halbsatz «oder einer schweizerischen diplomatischen oder
   konsularischen Vertretung» im Hinweistext ergänzen (zpoFristen.ts:234).
3. INDEX-Eintrag für dieses Dossier nachführen (S7) — in dieser Session
   per Auftrags-Verbot ausgelassen.
4. Status-Hebung auf ZWEIFACH GEPRÜFT erst nach unabhängigem adversarialem
   Durchgang (S2), idealerweise gegen einen zweiten Kommentar (KuKo/BSK).

---

## Umsetzung (10.6.2026, Ja David — deklarierte fachliche Änderungen)

B-1 MITTEL umgesetzt: Kandidaten-Bedingung in `fristenEngine.ts` neu
`p.von ≥ ref` (statt strikt >) — der Mindermeinungs-Modus verliert die
Stillstandsverlängerung am Stillstands-Folgetag nicht mehr (Sonden:
14.7.2024 + 1 Mt. neu 16.9.2024 statt 16.8.; 17.12.2024 + 1 Mt. neu
3.2.2025 statt 20.1.). Im BGer-Modus ist `p.von = ref` unerreichbar
(dies-a-quo-Verschiebung ans Periodenende) — Golden 88/88: kein einziges
Datum verändert, byte-Beweis der Verhaltensneutralität ausserhalb des
Modus. B-2 NIEDRIG umgesetzt: Fristwahrungs-Hinweis nennt die
schweizerische diplomatische/konsularische Vertretung (Abs. 1) inkl.
Geltung für vorübergehend im Ausland Weilende; Golden-Textdiff in allen
zpo-Fällen deklariert regeneriert. 4 neue Tests. B-3 bleibt bewusst
offen ([UNGEKLÄRT]-Warnung genügt, §8).
