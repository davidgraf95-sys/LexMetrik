# Recherche-Dossier — Cluster «OR-Vertragsvorlagen»

| Feld | Wert |
|---|---|
| **Titel** | OR-Vertragsvorlagen: Darlehen · Kaufvertrag · Mahnung · Inverzugsetzung · Schuldanerkennung · Vergleich |
| **Datum** | 6.6.2026 |
| **Rechtsstand OR** | konsolidierte Fassung, Cache `/tmp/or.html` (Stand 1.1.2026) |
| **Bauform-Referenz** | `src/lib/vorlagen/arbeitsvertrag.ts` + `engine.ts` (Bausteine / `includeIf`-Gates / `ausgabeArt` / `format`) |
| **Verzahnung** | `src/lib/verzugszins.ts` (Mahnung/Inverzugsetzung), `src/lib/schkgZustaendigkeit.ts` + `src/lib/schkgFristen.ts` (Schuldanerkennung → Rechtsöffnung) |
| **Quellenlage** | OR-Anker 17/82/102/104/107/137/184/185/199/210/313/318 empirisch gegen Cache geprüft ✓ · KKG/VKKG via Web (Fedlex SR 221.214.1 / 221.214.11, admin.ch) · ZGB 715 via Web |
| **Status** | Erstrecherche (einfach belegt). Übernahme in Engines erst nach fachlicher Abnahme durch David (§7). |

## Verifikations-TODOs (vor produktivem Einsatz)

- [ ] **VKKG-Höchstzinssatz** (datierter Parameter, Verfallsregister!): ab 1.1.2026 **10 % Barkredit / 12 % Überziehungs-/Kartenkredit** (vorher 11 %/13 %), gesenkt vom EJPD nach SARON-Mechanismus der VKKG. Jährliche Anpassung möglich → **ins `bibliothek/register/parameter-verfall.md` aufnehmen**, vor jedem Jahreswechsel prüfen. Amtliche Fundstelle des aktuellen Satzes (admin.ch-Medienmitteilung 403 beim Fetch — Sekundärquelle cash.ch/sgv-usam.ch) noch durch Fedlex-VKKG-Text gegenfixieren.
- [ ] BGE-Belege durchwegs als **[zu verifizieren]** markiert (Saldoklausel-Reichweite, Schuldanerkennung-Auslegung, Eigentumsvorbehalt-Praxis) — vor `verified:true` am Cache/BGer abgleichen.
- [ ] **ZGB 715** (Eigentumsvorbehalt) liegt NICHT im OR-Cache (Sachenrecht, SR 210) — separat gegen ZGB-Fedlex-HTML verifizieren, falls Kaufvertrag-Vorlage diese Klausel anbietet.
- [ ] KKG-Artikelketten (7/9/14/15/16) gegen Fedlex SR 221.214.1 verbatim nachziehen (bisher Web-Sekundärquellen + UZH-Lehrmaterial für Art. 7 Abs. 1 lit. e).

---

## Vorab: Korrekturen am Auftrag (§7 — abweichen und offenlegen)

1. **«Eigentumsvorbehalt 715»** im Auftrag suggeriert OR 715. Falsch: Art. **715 OR** regelt die VR-Sitzungseinberufung (geprüft am Cache). Der Eigentumsvorbehalt mit konstitutivem **Registereintrag beim Betreibungsamt am Wohnsitz des Erwerbers** ist **Art. 715 ZGB** (+ EigVV, SR 211.413.1). Im Dossier durchgehend als ZGB 715 geführt.
2. **«SchKG 82» / «provisorischer Rechtsöffnungstitel»** — Auftrag nennt bei der Schuldanerkennung «82 SchKG». Korrekt: provisorische Rechtsöffnung = **Art. 82 SchKG**. Achtung Verwechslungsfalle: **Art. 82 OR** ist die Einrede des nicht erfüllten Vertrags (Zug-um-Zug) — NICHT zitieren.
3. **VKKG-Satz**: Auftrag «11 %/13 %?» ist der bis 31.12.2025 geltende Stand. Aktuell **10 %/12 % ab 1.1.2026**.
4. **KKG-Widerruf**: Auftrag «Widerruf 16» korrekt (Art. 16 KKG) — **Frist 14 Tage** (nicht mehr 7; revidierter Stand).

---

# (1) Darlehensvertrag (Art. 312 ff. OR)

**1. Nutzerfrage.** «Ich leihe / erhalte Geld — wie halte ich Betrag, Zins, Rückzahlung und Kündigung rechtssicher fest, und wann gilt zwingend das Konsumkreditgesetz?»

**2. Normbasis + Form.**
- Art. 312 OR (Begriff), **313 OR** (Zins **nur wenn verabredet** im gewöhnlichen Verkehr; im kaufmännischen Verkehr auch ohne Abrede — Cache verifiziert), 314 (Zinsfuss-Vermutung; **Zinseszinsverbot** Abs. 3), 315 (Verjährung Aushändigung 6 Mt.), 318 OR (mangels Termin/Kündigungsfrist Rückzahlung **innert 6 Wochen** ab erster Aufforderung — Cache verifiziert).
- Formfrei nach OR → **`ausgabeArt: 'fertig'`**, `format: 'vertrag'`. **ABER:** bei KKG-Anwendbarkeit Schriftform zwingend (Art. 9 KKG) und Nichtigkeit bei Verstoss (Art. 15 KKG).

**3. Baustein-Skizze.**
- Pflicht: Parteien · Darlehensbetrag/Auszahlung · Rückzahlungsmodalität (Termin / Kündigungsfrist / Auffälligkeit) · Schlussformel · Unterschriften.
- Optional: Zinssatz-Baustein (`includeIf zins=true`; ohne diesen Baustein **zinslos** nach 313!) · Sicherheiten · Verzugsregelung (Verweis Art. 104 → verzugszins.ts) · Verwendungszweck.
- **GATES:**
  - **G-KKG (Kern!)** — Verdachtskaskade, alle Bedingungen kumulativ:
    - Kreditgeber handelt **gewerblich** (Art. 2 KKG) UND Kreditnehmer ist **Konsument/in** (privat, nicht beruflich) UND Betrag **CHF 500–80'000** (Art. 7 Abs. 1 lit. e KKG, UZH-Lehrmaterial bestätigt) → **KKG anwendbar**.
    - Folge → **Sperre/Warnung**: «Diese Vorlage deckt KEINEN Konsumkredit ab. Es gelten zwingend: Schriftform mit Pflichtinhalt (Art. 9 KKG), Höchstzinssatz (Art. 14 KKG; VKKG aktuell 10 %/12 %), 14-tägiges Widerrufsrecht (Art. 16 KKG), Kreditfähigkeitsprüfung (Art. 22/28 ff. KKG). Verstoss = Nichtigkeit, Konsument schuldet weder Zins noch Kosten (Art. 15 KKG).» → empfohlen: **Blocker** statt stiller Erzeugung.
    - Privatdarlehen zwischen Privaten (kein gewerblicher Geber) → KKG **nicht** anwendbar (Art. 1/2 KKG) → Vorlage zulässig, aber Hinweis aufnehmen.
  - **G-Zins-Wucher** — vereinbarter Zins ohne KKG: Hinweis auf Art. 21 OR (Übervorteilung) und kantonale Wucher-/strafrechtliche Grenzen (Art. 157 StGB); keine harte OR-Zinsobergrenze ausserhalb KKG → **Warnung, kein Blocker** (zu verifizieren, ob Engine eine Orientierungsschwelle setzt).
  - **G-Kündigung** — wenn weder Termin noch Kündigungsfrist gewählt: Baustein, der die **6-Wochen-Regel (Art. 318 OR)** ausdrücklich abbildet (sonst Überraschung).

**4. §2-Beurteilung.** Klar regelbasiert. Zins/Kündigung/KKG-Gate sind deterministische `includeIf`/Schwellen-Entscheide. KKG-Schwellen sind feste Zahlen (500/80'000); VKKG-Satz ist datierter Stammwert. **Geeignet.**

**5. Datenbedarf.** VKKG-Höchstzinssatz (Verfallsregister, jährlich). KKG-Schwellen (stabil). Keine kantonalen Daten.

**6. Fallstricke.** Zinslosigkeit als Default (313 — Nutzer erwartet oft Zins). Zinseszinsverbot (314 III). KKG-Umgehungsverbot (Stückelung, Strohmann). 6-Wochen-Frist überrascht bei «Rückzahlung auf Verlangen». BGE zur KKG-Gewerbsmässigkeit [zu verifizieren].

**7. Aufwand & Wiederverwendung.** **L** (KKG-Gate ist anspruchsvoll). Wiederverwendung: Engine-Muster, verzugszins.ts (Verzugsklausel), Verfallsregister (VKKG).

---

# (2) Einfacher Kaufvertrag — Mobilien (Art. 184 ff. OR)

**1. Nutzerfrage.** «Ich kaufe/verkaufe eine bewegliche Sache — wie halte ich Kaufgegenstand, Preis, Übergabe, Gefahrübergang und Gewährleistung fest?»

**2. Normbasis + Form.**
- Art. 184 (Begriff), **185 OR** (Nutzen/Gefahr gehen — vorbehältlich besonderer Verhältnisse/Abrede — **mit Vertragsabschluss** auf den Erwerber über; Gattungssache: Ausscheidung/Versandübergabe nötig — Cache verifiziert; dispositiv, kritikwürdig, abdingbar), 187 (Fahrniskauf), 197 ff. (Gewährleistung), **199 OR** (Wegbedingung der Gewährspflicht ungültig bei arglistigem Verschweigen — Cache verifiziert), **210 OR** (Verjährung 2 J. / 5 J. Bauwerk; **Abs. 4: Verkürzung ungültig bei Verbrauchsgütern für persönlichen/familiären Gebrauch, Verkäufer gewerblich → min. 2 J. / 1 J. gebraucht** — Cache verifiziert).
- Formfrei → **`ausgabeArt: 'fertig'`**, `format: 'vertrag'`.

**3. Baustein-Skizze.**
- Pflicht: Parteien · Kaufgegenstand (Bestimmtheit) · Kaufpreis · Übergabe/Erfüllung · Unterschriften.
- Optional: **Gefahrübergang-Klausel** (185 abweichend, z. B. erst mit Übergabe — Empfehlung) · **Gewährleistung** (Zusicherung / Wegbedingung / «gekauft wie besehen») · **Eigentumsvorbehalt** (Art. 715 **ZGB**!) · Zahlungsmodalität (Raten → Verweis Verzug) · Mängelrügefrist (201).
- **GATES:**
  - **G-Verbrauchsgüter (210 IV)** — wenn Verkäufer gewerblich UND Käufer Konsument UND Sache für persönlichen/familiären Gebrauch → Wegbedingung/Verkürzung der Gewährleistung **unter 2 J. (gebraucht 1 J.) blockieren** (Art. 210 Abs. 4 OR).
  - **G-Arglist (199)** — Hinweis: Freizeichnung wirkungslos bei arglistig verschwiegenen Mängeln; Baustein «wie besehen» mit diesem Vorbehalt versehen.
  - **G-Eigentumsvorbehalt** — wenn gewählt: **Warnung**, dass der Eigentumsvorbehalt nur mit **konstitutivem Eintrag im Eigentumsvorbehaltsregister beim Betreibungsamt am Wohnsitz des Erwerbers** wirksam ist (Art. 715 ZGB; EigVV SR 211.413.1) und bei Wohnsitzwechsel des Erwerbers dahinfallen kann — die Vertragsklausel allein genügt nicht. [ZGB-Anker noch verifizieren]
  - **G-Liegenschaft** — falls «Grundstück» o. ä. erfasst: **Blocker** (öffentliche Beurkundung Art. 216 OR; nicht von dieser Mobilien-Vorlage gedeckt).

**4. §2-Beurteilung.** Regelbasiert; Gates sind diskrete Verbraucher-/Arglist-/Form-Entscheide. **Geeignet.**

**5. Datenbedarf.** Keine datierten Parameter / keine kantonalen Daten.

**6. Fallstricke.** 185 dispositive Default-Gefahr beim Käufer ab Abschluss (oft unerwartet) → Klausel empfehlen. Verbrauchsgüter-Sonderregeln (210 IV). Eigentumsvorbehalt-Register als reine Vertragsklausel unwirksam. BGE zur Mängelrüge/Genehmigung [zu verifizieren].

**7. Aufwand & Wiederverwendung.** **M**. Wiederverwendung: Engine-Muster; Verzug-Klausel (verzugszins.ts) bei Ratenkauf.

---

# (3) Mahnung (Art. 102 Abs. 1 OR) — kostenlos / `free`

**1. Nutzerfrage.** «Mein Schuldner zahlt nicht — wie setze ich ihn rechtsgültig in Verzug?»

**2. Normbasis + Form.**
- **Art. 102 Abs. 1 OR** (fällige Verbindlichkeit + Mahnung → Verzug; Abs. 2: Verfalltag macht Mahnung entbehrlich — Cache verifiziert), **104 OR** (Verzugszins 5 %; höher vertraglich — Cache verifiziert).
- Schreiben → **`format: 'eingabe'`**, **`ausgabeArt: 'fertig'`** (kein Formzwang; KEIN zentrierter Dokumenttitel — vgl. engine.ts Brief-Anatomie).

**3. Baustein-Skizze.**
- Pflicht: Absender · Adressat · Datum · Betreff · **bestimmte Forderung** (Betrag, Rechtsgrund/Rechnung) · **Zahlungsfristsetzung** · **Verzugsfolgen-Androhung (Verzugszins Art. 104)** · Schlussformel/Unterschrift.
- Optional: Verweis Rechnungsnummer/Vertrag · Hinweis weitere Schritte (Betreibung).
- **GATES:**
  - **G-Fälligkeit** — Hinweis: Mahnung setzt **Fälligkeit** voraus (102 I).
  - **G-Mahngebühren** — wenn Mahngebühr erfasst: **Warnung**, dass Mahngebühren **ohne vertragliche Grundlage nicht geschuldet** sind (nur Verzugszins nach 104 von Gesetzes wegen).
  - **G-Verfalltag** — wenn Verfalltag vereinbart war: Hinweis, dass Verzug bereits ohne Mahnung eingetreten ist (102 II) → ggf. Inverzugsetzung/Direktbetreibung statt Mahnung.

**4. §2-Beurteilung.** Vollständig regelbasiert. **Geeignet.**

**5. Datenbedarf.** Gesetzlicher Verzugszins 5 % (Art. 104 I, stabil). Keine datierten/kantonalen Daten. (Datum-/Fristlogik liefert `verzugszins.ts`.)

**6. Fallstricke.** Mahnung ≠ Betreibung. Keine automatischen Mahngebühren. Bei Verfalltag ist Mahnung überflüssig.

**7. Aufwand & Wiederverwendung.** **S**. Starke Verzahnung mit **verzugszins.ts** (Zinsbeginn = Mahnungsdatum, `beginnTyp:'mahnung'`).

---

# (4) Inverzugsetzung mit Nachfrist (Art. 102/107 OR) — `free`

**1. Nutzerfrage.** «Der Schuldner einer Gegenleistung ist im Verzug — wie setze ich eine Nachfrist und kündige meine Wahlrechte (Rücktritt/Schadenersatz) an?»

**2. Normbasis + Form.** Abgrenzung zur Mahnung: Mahnung = blosse Inverzugsetzung (102). Die **Inverzugsetzung mit Nachfrist** zielt auf die **Wahlrechte bei zweiseitigen Verträgen (Art. 107 OR)**: angemessene Nachfrist + nach deren Ablauf Wahl (a) Erfüllung + Verspätungsschaden, (b) Verzicht + Nichterfüllungsschaden, (c) Rücktritt — **Verzicht/Rücktritt nur bei unverzüglicher Erklärung** (Cache verifiziert). Art. 108 (Nachfrist entbehrlich). → `format: 'eingabe'`, `ausgabeArt: 'fertig'`.

**3. Baustein-Skizze.**
- Pflicht: Adressblock · Bezug auf Vertrag/Leistung · Feststellung Verzug · **angemessene Nachfristansetzung** · **präzise Rechtsfolgen-Belehrung nach 107 II** (Wahlrechtsandrohung als eigene Bausteine) · Unterschrift.
- Optional: bereits jetzt erklärte Wahl (Baustein je Variante a/b/c — `includeIf wahl=...`) · Hinweis 108 (Entbehrlichkeit).
- **GATES:**
  - **G-Zweiseitigkeit** — 107 setzt **zweiseitigen Vertrag** voraus; bei reiner Geldforderung → Verweis auf Mahnung/Betreibung (Blocker oder Weiche zur Mahnungs-Vorlage).
  - **G-Wahlrecht** — wenn Verzicht/Rücktritt gewählt: Hinweis, dass die Erklärung **unverzüglich** nach Fristablauf erfolgen muss (107 II) — sonst nur Erfüllung+Schaden.
  - **G-Nachfristlänge** — «angemessen» als unbestimmter Begriff → **Hinweis** (keine fixe Zahl), 108-Ausnahmen offenlegen.

**4. §2-Beurteilung.** Regelbasiert (Bausteinwahl je Rechtsfolge). Die «Angemessenheit» der Frist bleibt Nutzereingabe + Hinweis (kein LLM). **Geeignet.**

**5. Datenbedarf.** Keine.

**6. Fallstricke.** Verwechslung mit Mahnung. Unterlassene unverzügliche Erklärung verwirkt Rücktritt. 108-Konstellationen.

**7. Aufwand & Wiederverwendung.** **M**. Teilt Brief-Bausteine mit der Mahnung; ggf. gemeinsames Schreiben-Gerüst (§10).

---

# (5) Schuldanerkennung (Art. 17 OR)

**1. Nutzerfrage.** «Mein Schuldner soll die Schuld schriftlich anerkennen — wie wird das Dokument zugleich Betreibungstitel und stoppt die Verjährung?»

**2. Normbasis + Form.**
- **Art. 17 OR** (Schuldbekenntnis gültig **auch ohne Verpflichtungsgrund** → abstrakt; kausal mit Grundangabe — Cache verifiziert), Art. 18 II (Simulationseinrede gegenüber gutgläubigem Dritten ausgeschlossen).
- **SchKG-Optimierung:** Eine **unterzeichnete** Schuldanerkennung ist **provisorischer Rechtsöffnungstitel (Art. 82 SchKG)**. → Unterschrift zwingend hervorheben.
- **Verjährung:** **Art. 137 OR** — Unterbrechung lässt Frist neu laufen; **Abs. 2: Anerkennung durch Ausstellung einer URKUNDE → neue Frist stets 10 Jahre** (Cache verifiziert). Ohne Urkunde nur Neubeginn der ursprünglichen Frist.
- Schriftform ratsam (für 82 SchKG + 137 II) → `format: 'eingabe'`/`vertrag`, **`ausgabeArt: 'fertig'`**; Unterschrift load-bearing.

**3. Baustein-Skizze.**
- Pflicht: Schuldner-/Gläubigerbezeichnung · **bestimmter Betrag** · (optional) Rechtsgrund (kausal) vs. abstrakt · Datum · **eigenhändige Unterschrift des Schuldners**.
- Optional: Zins-/Fälligkeitsabrede · Ratenplan · Verzicht auf Einreden (heikel) · Saldoklausel.
- **GATES:**
  - **G-Unterschrift/Bestimmtheit** — **Warnung**, dass nur die unterschriebene, betragsmässig bestimmte Anerkennung als provisorischer Rechtsöffnungstitel (82 SchKG) taugt; Verweis-Möglichkeit auf `schkgZustaendigkeit.ts`/`schkgFristen.ts` (Betreibungsort, Rechtsöffnungs-/Aberkennungsfristen).
  - **G-Urkunde/Verjährung** — Hinweis: 10-Jahres-Neustart nur bei Anerkennung durch **Urkunde** (137 II).
  - **G-Blanko/abstrakt** — **Warnung** vor Blanko-/abstrakter Anerkennung ohne Grund (Beweis-/Missbrauchsrisiko; Schuldner kann Grundverhältnis-Einreden erschweren) — Disclosure, kein Blocker.

**4. §2-Beurteilung.** Regelbasiert (abstrakt/kausal als Variante, Klauseln als `includeIf`). **Geeignet.**

**5. Datenbedarf.** Keine datierten Parameter. Verweis auf SchKG-Stammdaten (bestehend).

**6. Fallstricke.** Blanko-Risiken; fehlende Unterschrift entwertet 82 SchKG; ohne Urkunde kein 10-Jahres-Neustart; Einredeverzicht-Klauseln teils unwirksam [zu verifizieren BGE].

**7. Aufwand & Wiederverwendung.** **M**. Hohe Verzahnung mit SchKG-Modulen (Rechtsöffnung/Verjährung).

---

# (6) Vergleichsvereinbarung — Gerüst (aussergerichtlich)

**1. Nutzerfrage.** «Wir wollen einen Streit aussergerichtlich beilegen — wie formulieren wir gegenseitiges Nachgeben, Saldoklausel und Kostenregelung verbindlich?»

**2. Normbasis + Form.** Innominat-/Vergleichsvertrag (OR AT, kein eigener Titel); Abgrenzung **Prozessvergleich (Art. 241 ZPO** — Rechtskraft-/Vollstreckungswirkung, gehört vor Gericht). Aussergerichtlicher Vergleich = gewöhnlicher Vertrag, formfrei (Art. 11 OR), KEIN Rechtsöffnungstitel per se. → `format: 'vertrag'`, **`ausgabeArt: 'fertig'`**.

**3. Baustein-Skizze (Gerüst).**
- Pflicht: Parteien · **Streitgegenstand/Ausgangslage** · **gegenseitiges Nachgeben** (konkrete Zugeständnisse) · **Erledigungs-/Saldoklausel** · Kostenregelung · Unterschriften.
- Optional: Ratenzahlung + Verfallklausel · Schuldanerkennung-Verweis (→ 82 SchKG) · Vertraulichkeit · Verzugsfolgen.
- **GATES:**
  - **G-Saldoreichweite** — **Warnung**: Reichweite der Saldoklausel präzisieren (nur strittige Punkte vs. «per Saldo aller Ansprüche»); zu weite Klauseln erfassen ungewollt unbekannte Ansprüche [BGE zu verifizieren].
  - **G-Prozessvergleich-Abgrenzung** — Hinweis: aussergerichtlich → kein Vollstreckungstitel; für Vollstreckbarkeit Prozessvergleich (241 ZPO) bzw. Schuldanerkennung-Baustein.
  - **G-Form bei beurkundungspflichtigem Inhalt** — wenn Vergleich Grundstück/erbrechtliche Ansprüche o. ä. einbezieht: **Warnung/Blocker** (Formzwang).

**4. §2-Beurteilung.** Als **Gerüst** regelbasiert; materielle Zugeständnisse sind reine Nutzereingaben (kein LLM). **Geeignet, niedrigste Priorität** (offenste Norm).

**5. Datenbedarf.** Keine.

**6. Fallstricke.** Saldoklausel-Überschuss; fehlende Vollstreckbarkeit; Formzwang bei besonderem Inhalt.

**7. Aufwand & Wiederverwendung.** **M–L** (offene Struktur). Wiederverwendung: Engine-Muster, Schuldanerkennungs-Baustein, ZPO-Verweise.

---

## Priorisierte Bau-Reihenfolge

1. **Mahnung** (S; verzugszins.ts vorhanden — schneller Mehrwert).
2. **Schuldanerkennung** (M; SchKG-Module vorhanden, hoher Nutzwert 82 SchKG / 137 II).
3. **Inverzugsetzung** (M; teilt Brief-Gerüst mit Mahnung).
4. **Darlehensvertrag** (L; KKG-Gate ist der Aufwandstreiber, aber zentral).
5. **Kaufvertrag Mobilien** (M; ZGB-715-Verifikation nötig).
6. **Vergleichsvereinbarung** (Gerüst, niedrigste Priorität).

---

## Quellen

- OR konsolidiert: Cache `/tmp/or.html` (Stand 1.1.2026), Anker `art_17/82/102/104/107/137/184/185/199/210/313/318` geprüft.
- VKKG-Höchstzinssatz ab 1.1.2026 (10 %/12 %): admin.ch / cash.ch / sgv-usam.ch (Medienmitteilung EJPD) — Primärtext Fedlex VKKG SR 221.214.11 noch nachzuziehen.
- KKG Art. 7/9/14/15/16: Fedlex SR 221.214.1; UZH ELT (Art. 7 Abs. 1 lit. e CHF 500–80'000); weka.ch.
- Eigentumsvorbehalt Art. 715 ZGB + EigVV (SR 211.413.1): Betreibungsinspektorat ZH / Justiz GR / lawbrary.
