# Recherche-Dossier — Cluster «Öffentliches Recht»: Verwaltung · Steuer · Sozialversicherung

**Titel:** Rechner-Spezifikationen für 10 geplante Cluster-Rechner (Verwaltungs-,
Steuer-, Sozialversicherungs- und Spezialfristen).
**Datum:** 6.6.2026 · **Bearbeiter:** Recherche-Agent (Auftrag David)
**Status:** EINFACH belegt (Erstrecherche). Kein zweiter adversarialer Durchgang.
Übernahme in Engines/Stammdaten erst nach fachlicher Abnahme durch David (§7/§8).

**Quellenlage:**
- VwVG-Kerntext (Art. 20–24, 30, 50, 52) am Cache `/tmp/vwvg.html` (Fedlex-Filestore,
  ELI `cc/1969/737_757_755/20210101`) **verbatim verifiziert** ✓.
- Datierte Parameter (AHV-Sätze 2026, Bundessteuer-Zinssätze 2026, Schwellenwerte
  2026/27) per Web (admin.ch / kantonale amtliche Quellen, Juni 2026).
- Übrige Normanker (ATSG, DSG, DBG, StHG, VStG, BöB/IVöB, AIG/AsylG) per Websuche
  belegt, **NOCH NICHT** am Fedlex-Filestore-HTML gegengeprüft.

**Verifikations-TODOs (vor jedem «geprüft»):**
1. ATSG / DSG / DSV / DBG / StHG / VStG / VStV / BöB / IVöB / AIG / AsylG je am
   Fedlex-Filestore-HTML verankern (Anker-Format `art_xxx`, sprachunabhängig),
   analog vorhandenen Caches (or.html, zpo.html …). Neue Caches anlegen.
2. Schwellenwerte-Tabelle 2026/27 IVöB am amtlichen INÖB/BPUK-PDF gegenprüfen
   (cantonal-Tabelle hier aus BL-PDF extrahiert; **BöB-Bund-Werte unten nur
   Erinnerungswerte — am BöB Anhang 4 belegen!**).
3. Bundessteuer-Zinssatz-VO (SR 631.014) Stand 1.1.2026 am Verordnungstext belegen
   (4.0 % bestätigen) + Frage klären, ob VStG-Verzugszins (Art. 16 Abs. 2 VStG)
   tatsächlich dieser VO folgt (Recherche sagt ja, seit 1.1.2022 — **früher fix 5 %
   per separater VO; der Auftrag nennt «5 %?» — das ist VERALTET**).

---

## Reuse-Inventar (was schon da ist)

| Baustein | Pfad | Nutzbar für |
|---|---|---|
| Generische Fristen-Engine (Tage/Wochen/Monate/Jahre, dies a quo Folgetag, Endnormalisierung) | `src/lib/fristenEngine.ts` | ALLE Fristen-Rechner unten |
| Stillstand-Strategie (`Stillstand`-Interface, `ruhen_weiter`/`nur_werktag`/`verlaengerung_3wt`) | `src/lib/fristenEngine.ts` | VwVG-Stillstand 22a, ATSG-Stillstand 38 IV |
| Feiertags-/Werktagslogik je Kanton | `src/data/zpoFeiertage.ts` (`istArbeitsfreierTag`, `naechsterWerktag`) | Werktagsverschiebung Art. 20 III VwVG |
| Preset-Katalog-Bauform (`PRESETS`, `PHASEN`, Felder key/label/norm/einheit/laenge/hinweis) | `src/lib/zpoPresets.ts`, `src/lib/schkgPresets.ts` | Alle Preset-Kataloge unten (VwVG, ATSG, Ausländerrecht) |
| Dünne Engine auf fristenEngine (Vorbild) | `src/lib/allgemeineFrist.ts` | Vorlage für vwvgFrist.ts, atsgFrist.ts |
| Verfallsregister | `bibliothek/register/parameter-verfall.md` | Pflicht-Einträge unten |

**Wichtige Erkenntnis:** Die drei VwVG-Stillstandsperioden (Art. 22a Abs. 1) sind
**identisch** mit den ZPO-Gerichtsferien, die `fristenEngine`/`zpoFeiertage` bereits
kennen: (a) 7. Tag vor bis 7. Tag nach Ostern, (b) **15. Juli bis und mit 15. August**
(Achtung: Wortlaut ohne «dem» vor 15. August), (c) 18. Dezember bis und mit 2. Januar.
→ Eine VwVG-Stillstand-Strategie kann die bestehende Perioden-Berechnung
wiederverwenden; nur die Ausnahmen (Abs. 2/3: gilt nicht in best. Verfahren) sind
neu zu parametrisieren. **§4 beachten: eigene Engine je Rechtsgebiet — geteilt wird
nur die Datums-/Perioden-Infrastruktur, nie die materielle Stillstand-Regel.**

---

## Priorisierte Bau-Reihenfolge (Quick-Wins zuerst)

1. **(1) Verwaltungsfristen VwVG** — Quick-Win, Engine fast geschenkt (S).
2. **(8) ATSG-Fristen** — wie VwVG, eigener Preset-Katalog (S).
3. **(3) Vergaberecht Beschwerdefristen** — 20 Tage ohne Stillstand, Schwellenwert-
   Tabelle als Daten (S–M; Tabelle ist Datenpflege + Verfallsregister).
4. **(9) Datenschutz-Fristen + Vorlagen** — 30-Tage-Frist + EDÖB-Mustervorlage (S–M).
5. **(4) Steuerfristen + Verjährung DBG/StHG** — deterministisch, aber Verjährungs-
   Logik (Stillstand/Unterbrechung) anspruchsvoll (M).
6. **(5) Verrechnungssteuer** — 3-Jahres-Verwirkung + datierter Zinssatz (M).
7. **(10) Ausländerrecht-Fristen** — Preset-Katalog vieler Spezialfristen (M).
8. **(7) AHV-Beiträge** — sinkende Skala + jährlicher Verfall (M, Daten-lastig).
9. **(2) Bau-/Planungsfristen kantonal** — Pilot 2–3 Kantone (M–L, kantonal).
10. **(6) Grundstückgewinn-/Handänderungssteuer** — 26 Tarife → Backlog/Pilot (L).

---

## (1) Verwaltungsfristen VwVG — QUICK-WIN

1. **Nutzerfrage:** «Ich habe eine Verfügung am [Datum] erhalten — bis wann muss
   ich Einsprache/Beschwerde erheben? Greift der Fristenstillstand?»
2. **Normbasis (SR 172.021, Stand 1.1.2021, Cache verifiziert ✓):**
   - Art. 20 Abs. 1: Tagesfrist beginnt am Tag **nach** Mitteilung (dies a quo).
   - Art. 20 Abs. 2bis: Abholfiktion (eingeschrieben → 7. Tag nach erfolglosem
     Zustellversuch gilt als zugestellt). **Wichtig für UI-Eingabe.**
   - Art. 20 Abs. 3: Ende auf Sa/So/Feiertag → nächster Werktag.
   - Art. 21: Wahrung durch Übergabe an CH-Post/Vertretung am letzten Tag.
   - Art. 22 Abs. 1: **gesetzliche Frist nicht erstreckbar**; Abs. 2: behördliche Frist
     erstreckbar (vor Ablauf, zureichende Gründe).
   - **Art. 22a Abs. 1 (Stillstand!):** gesetzl./behördl. Tagesfristen stehen still
     (a) 7. Tag vor–7. Tag nach Ostern; (b) 15. Juli–15. August; (c) 18. Dez.–2. Jan.
     Abs. 2/3: gilt **nicht** in bestimmten Verfahren (z. B. Submission via Art. 56
     BöB; provisorischer Rechtsschutz; Wechselbetreibung) — Ausnahmekatalog prüfen.
   - Art. 24: **Wiederherstellung** — Gesuch innert 30 Tagen nach Wegfall des
     Hindernisses + Nachholen der Handlung; unverschuldetes Hindernis.
   - Art. 50 Abs. 1: **Beschwerdefrist 30 Tage** ab Eröffnung. Abs. 2: Rechts-
     verweigerung/-verzögerung jederzeit.
   - Einsprache: keine einheitliche VwVG-Frist — meist 30 Tage in den Spezial-
     erlassen (z. B. DBG 132); VwVG-Beschwerde = 30 Tage Standard.
   - VGG-Fristen: BVGer wendet VwVG-Fristen an (Art. 37 VGG).
3. **Regelwerk-Skizze:**
   - Eingaben: Eröffnungsdatum (oder Zustellfiktionsdatum), Fristtyp (Preset),
     Fristlänge (aus Preset), Verfahrenstyp (Stillstand ja/nein), Kanton (Feiertage).
   - Regeln: dies a quo = Folgetag (Art. 20 I); Stillstand herausschneiden wenn
     anwendbar (`Stillstand`-Strategie `ruhen_weiter` mit VwVG-Perioden);
     Endnormalisierung Werktag (Art. 20 III).
   - Ausgaben: Fristende, gehemmte Tage, Werktagsverschiebung-Hinweis, Wahrungs-
     hinweis (Art. 21), Erstreckbarkeit (Art. 22), Wiederherstellungs-Hinweis (24).
   - **Preset-Katalog (analog zpoPresets):** `beschwerde_vwvg` (30 T., Art. 50),
     `einsprache_30` (30 T.), `wiederherstellung` (30 T., Art. 24, ab Hinderniswegfall),
     `behoerdlich_erstreckbar` (Dauer vom Nutzer, Art. 22 II), `vgg_beschwerde`.
4. **§2-Beurteilung:** **Deterministisch** — voll regelbasiert. Stillstand-Ausnahmen
   als Flag pro Preset; keine Schätzung.
5. **Datenbedarf + Verfallsregister:** Keine externen datierten Werte (reine Regeln).
   Feiertagsverzeichnis (`zpoFeiertage.ts`, Stand 2011) wie bei ZPO-Rechnern —
   Verfallsregister-Eintrag besteht bereits.
6. **Fallstricke:** Zustellfiktion (7-Tage-Regel) muss als separate Eingabe geführt
   werden, sonst falsches dies a quo. Stillstand greift NUR bei Tagesfristen
   (nicht Monats-/Jahresfristen). Einspracheverfahren ist spezialgesetzlich — keine
   generische «VwVG-Einsprachefrist» behaupten.
7. **Aufwand:** **S.** Wiederverwendung: fristenEngine + Stillstand-Strategie +
   zpoFeiertage + Preset-Bauform — ~90 % vorhanden.

---

## (8) ATSG-Fristen — QUICK-WIN

1. **Nutzerfrage:** «Bis wann Einsprache/Beschwerde gegen den Versicherungs-
   entscheid? Wann verjährt mein Nachzahlungs-/Rückforderungsanspruch?»
2. **Normbasis (SR 830.1):**
   - Art. 52 Abs. 1: **Einsprache 30 Tage** (gegen Verfügung, ausser
     prozessleitende/Zwischenverfügungen).
   - Art. 60 Abs. 1: **Beschwerde 30 Tage** ans kantonale Versicherungsgericht;
     Art. 56: Beschwerderecht (auch bei Nichterlass Einspracheentscheid).
   - Art. 38: Fristberechnung (Abs. 1 dies a quo Folgetag; Abs. 3 Werktag);
     **Abs. 4: Fristenstillstand** (gleiche drei Perioden wie VwVG/ZPO).
   - Art. 24 Abs. 1: Nachzahlung — Anspruch **erlischt 5 Jahre** nach Ende des
     Monats/Jahres (Verwirkung).
   - Art. 25: **Rückerstattung** unrechtmässig bezogener Leistungen (Erlass bei
     gutem Glauben + grosser Härte); Fristen Abs. 2 (1 Jahr/5 Jahre — am Text prüfen).
3. **Regelwerk-Skizze:** wie VwVG; eigener Preset-Katalog (`einsprache_atsg`,
   `beschwerde_atsg`, `wiederherstellung_atsg`); Verwirkungs-Block (5 Jahre,
   Jahres-/Monatsfrist-Engine) separat.
4. **§2-Beurteilung:** **Deterministisch.** Stillstand 38 IV = eigene Strategie mit
   den drei Perioden.
5. **Datenbedarf/Verfall:** keine externen Werte.
6. **Fallstricke:** ATSG gilt NICHT für alle Sozialversicherungen einheitlich (BVG,
   Teile AHV-Beiträge ausgenommen) — Geltungsbereich Art. 1/2 + Verweisnormen je
   Einzelgesetz beachten. Rückforderungsfristen (25 II) genauer Wortlaut prüfen.
7. **Aufwand:** **S.** Wiederverwendung wie (1).

---

## (3) Vergaberechtliche Beschwerdefristen + Schwellenwerte

1. **Nutzerfrage:** «Frist für Beschwerde gegen den Zuschlag? Welches Verfahren
   ist bei diesem Auftragswert obligatorisch?»
2. **Normbasis (BöB SR 172.056.1, IVöB 2019):**
   - **Art. 56 Abs. 1 BöB: Beschwerde 20 Tage** seit Eröffnung der Verfügung
     (verifiziert ✓ via Fedlex-Filestore).
   - **Art. 56 Abs. 2 BöB: KEIN Fristenstillstand** — VwVG/BGG-Stillstand-Regeln
     finden auf Vergabeverfahren **keine Anwendung** (verifiziert ✓). Frist läuft
     durch Ostern/Sommer/Weihnachten!
   - **Art. 54 BöB: keine aufschiebende Wirkung** von Gesetzes wegen; Gericht kann
     sie auf Gesuch (im Staatsvertragsbereich) erteilen (verifiziert ✓). → Vertrag
     darf erst nach Ablauf/Entscheid geschlossen werden (Stillhalte-Wirkung faktisch
     über aufschiebende Wirkung, nicht über fixe «Stillstandsfrist» wie EU-Standstill).
   - IVöB 2019: kantonale Beschwerdefrist analog (i. d. R. 20 Tage; je Kanton ans
     EG/Einführungsrecht prüfen — IVöB regelt Frist, kantonales Verfahrensrecht ergänzt).
3. **Regelwerk-Skizze:**
   - **Teil A Fristenrechner:** Eingabe Eröffnungsdatum → 20 Tage, **Stillstand-
     Strategie `OHNE_STILLSTAND`** (nur Werktagsverschiebung Art. 20 III analog /
     allgemeine Fristregeln). Preset `beschwerde_boeb` (20 T.), `beschwerde_ivoeb`.
   - **Teil B Verfahrenswahl (Schwellenwert-Tabelle):** Eingabe Auftragswert +
     Auftragsart (Bauhaupt/Baunebengewerbe/Lieferung/Dienstleistung) + Auftraggeber
     (Bund / Kanton-Gemeinde / Sektor) → Ausgabe: freihändig / Einladung / offen-
     selektiv + Staatsvertragsbereich ja/nein.
4. **§2-Beurteilung:** Fristenrechner **deterministisch**. Schwellenwert-Tabelle
   **parametrisiert** (Datentabelle, je Erlassstand datiert).
5. **Datenbedarf + VERFALLSREGISTER-Eintrag (Schwellenwerte-VO!):**

   **IVöB 2019 — Schwellenwerte 2026/2027 (CHF, gegenüber 2025 UNVERÄNDERT;
   extrahiert aus amtlichem BL-PDF, Stand 2026/27):**

   *Staatsvertragsbereich (WTO/GPA) — ab diesem Wert greift offenes/selektives Verfahren zwingend:*
   | Auftraggeber | Bauarbeiten (Gesamtwert) | Lieferungen | Dienstleistungen |
   |---|---|---|---|
   | Kantone, Gemeinden, Bezirke | 8'700'000 | 350'000 | 350'000 |
   | Sektoren (Wasser/Energie/Verkehr/Telekom) | 8'700'000 | 700'000 | 700'000 |

   *Nicht-Staatsvertragsbereich (Kap. 4 IVöB / kantonale Verfahrensschwellen):*
   | Auftragsart | offen/selektiv obligatorisch ab | Einladung zulässig bis | freihändig zulässig bis |
   |---|---|---|---|
   | Bauhauptgewerbe | 500'000 | 500'000 | 300'000 |
   | Baunebengewerbe | 250'000 | 250'000 | 150'000 |
   | Lieferungen | 250'000 | 250'000 | 150'000 |
   | Dienstleistungen | 250'000 | 250'000 | 150'000 |

   **BöB (Bund) — ERINNERUNGSWERTE, am BöB Anhang 4 belegen (NICHT verifiziert):**
   Staatsvertragsbereich grob: Lieferungen/Dienstleistungen ~CHF 230'000,
   Bauwerke CHF 8'700'000 (Bau-Wert via KBOB bestätigt); freihändig unter
   CHF 150'000 (Güter/DL) bzw. CHF 300'000 (Bau). **→ Vor Übernahme zwingend am
   Anhang 4 BöB + KBOB-Tabelle 2026/27 prüfen.**

   **Verfallsregister-Eintrag (NEU):** «Schwellenwerte BöB/IVöB — Periode 2026/2027,
   Prüfrhythmus **zweijährlich** (INÖB/Bundesrat revidieren alle 2 J. nach WTO-
   Verpflichtungen), **nächste Prüfung Ende 2027** (Werte 2028/29).»
6. **Fallstricke:** Kein Stillstand (häufiger Praxisfehler!). 20 ≠ 30 Tage (Unterschied
   zu VwVG/ATSG). Bau-«Gesamtwert» vs. Einzelgewerk (Bagatellklausel Art. 16 BöB).
   IVöB-2001-Kantone können abweichen (auslaufend, aber nicht überall abgelöst).
7. **Aufwand:** **S** (Frist) **+ M** (Tabelle als gepflegte Daten). Wiederverwendung:
   fristenEngine + OHNE_STILLSTAND. Tabelle = neue Datenschicht analog Behörden-Stammdaten.

---

## (9) Datenschutz-Fristen + Vorlagen

1. **Nutzerfrage:** «Bis wann muss der Verantwortliche meine Auskunft erteilen?»
   + «Erstelle mir ein Auskunfts-/Löschungsbegehren.»
2. **Normbasis (DSG SR 235.1, in Kraft 1.9.2023; DSV SR 235.11):**
   - Art. 25 DSG: Auskunftsrecht. **Art. 25 Abs. 7 DSG / Art. 18 Abs. 1 DSV:
     Auskunft innert 30 Tagen** (Verlängerung möglich mit Mitteilung). **Achtung:
     Frist steht in Art. 18 DSV, NICHT «Art. 25 DSV» wie im Auftrag vermutet.**
   - Art. 32 DSG: Berichtigung/Löschung; Art. 28 DSG: Datenherausgabe/-übertragung.
3. **Regelwerk-Skizze:**
   - Fristenrechner: Eingang Begehren → 30 Tage (einfache Tagesfrist, Werktagsregel).
   - **Vorlagen (Bauform wie src/lib/vorlagen/):** «Auskunftsbegehren Art. 25 DSG»,
     «Löschungsbegehren Art. 32 DSG» — Schema mit Adressat, betroffene Person,
     Umfang, Frist-Hinweis (30 Tage), EDÖB-Beschwerdehinweis. EDÖB-Muster als Vorbild.
4. **§2-Beurteilung:** Fristenrechner **deterministisch**; Vorlagen **regelbasiert**
   (Formulartext, keine Schätzung) → §2-tauglich.
5. **Datenbedarf/Verfall:** keine datierten Werte; EDÖB-Mustertexte als Quelle.
6. **Fallstricke:** 30-Tage-Frist ist Soll/Regel, kann verlängert werden — UI darf
   keine «Verwirkung» suggerieren. Auskunft ist grundsätzlich kostenlos (Ausnahmen).
   Keine Rechtsberatung (§8).
7. **Aufwand:** **S** (Frist) **+ M** (2 Vorlagen auf Wizard-Rahmen).

---

## (4) Steuerfristen + steuerliche Verjährung (DBG/StHG)

1. **Nutzerfrage:** «Bis wann Einsprache gegen die Veranlagung? Ist mein Steuer-
   anspruch verjährt (Veranlagung/Bezug)?»
2. **Normbasis (DBG SR 642.11; StHG SR 642.14):**
   - Art. 132 Abs. 1 DBG: **Einsprache 30 Tage** ab Zustellung.
   - **Art. 120 DBG: Veranlagungsverjährung** — relativ **5 Jahre**, absolut
     **15 Jahre** (mit Stillstand/Unterbrechung Abs. 2/3).
   - **Art. 121 DBG: Bezugsverjährung** — relativ **5 Jahre**, absolut **10 Jahre**.
   - Art. 47 StHG: kantonale Pendants (Veranlagung 5/15, Bezug 5/10).
   - Kantonale Einreichefristen (Steuererklärung): rein kantonal → **nur Bundesrecht
     abbilden** (DBG), kantonale Abgabefristen NICHT generisch (Backlog/Pilot).
3. **Regelwerk-Skizze:**
   - Einsprache-Frist: 30 Tage (Tagesfrist; VwVG-Stillstand greift im Steuerrecht
     grds. NICHT — Spezialregelung beachten).
   - Verjährungs-Engine: Eingabe Entstehung/Veranlagungsjahr + Unterbrechungs-/
     Stillstand-Ereignisse → relative + absolute Frist (Jahres-Engine), Status
     «verjährt/läuft». Unterbrechung setzt relative Frist neu, absolute bleibt Deckel.
4. **§2-Beurteilung:** Einsprache-Frist **deterministisch**; Verjährung
   **deterministisch, aber komplex** (Unterbrechung/Stillstand als Eingaben — der
   Nutzer muss Ereignisse eingeben; Engine rechnet regelbasiert). Kantonale
   Abgabefristen → **Backlog/Pilot**.
5. **Datenbedarf/Verfall:** keine datierten Geldwerte; Normanker DBG/StHG am
   Filestore verifizieren (TODO).
6. **Fallstricke:** Stillstand der Verjährung (Art. 120 II DBG: u. a. während
   Einsprache-/Beschwerdeverfahren, Inventaraufnahme). Absolute Frist ist Deckel,
   nicht unterbrechbar. Einsprache-Frist NICHT mit VwVG-Stillstand verlängern.
7. **Aufwand:** **M.** Wiederverwendung: fristenEngine (Jahresfristen); Verjährungs-
   Logik teilweise mit bestehender `verjaehrung`-Engine vergleichbar (§4: NICHT
   fusionieren — eigene Steuer-Engine).

---

## (5) Verrechnungssteuer (VStG)

1. **Nutzerfrage:** «Bis wann kann ich die VST zurückfordern? Wie hoch ist der
   Verzugszins? Greift das Meldeverfahren?»
2. **Normbasis (VStG SR 642.21; VStV SR 642.211):**
   - Steuersatz **35 %** auf Erträgen beweglichen Kapitalvermögens (Art. 13).
   - **Art. 32 Abs. 1 VStG: Rückerstattungsanspruch erlischt nach 3 JAHREN
     (Verwirkung)** nach Ablauf des Kalenderjahres der Fälligkeit. **Kernfrist!**
   - Art. 16 Abs. 1 lit. c: Steuer **30 Tage nach Entstehung** fällig.
   - **Art. 16 Abs. 2: Verzugszins** — Satz vom EFD bestimmt. **NICHT mehr fix 5 %!**
     Seit 1.1.2022 variabel über die EFD-Zinssatz-VO (SR 631.014): 4 % (2022/23),
     4.75 % (2024), 4.5 % (2025), **4.0 % ab 1.1.2026** (zu verifizieren am VO-Text).
   - Meldeverfahren (Art. 20 VStG / VStV): statt Entrichtung Meldung der Leistung
     (v. a. Konzern/Dividenden) — Bewilligungs-/Fristregeln.
3. **Regelwerk-Skizze:** (a) Rückerstattungs-Verwirkungsrechner (3 J. ab Ende
   Fälligkeitsjahr); (b) Verzugszins-Rechner (Tage × Satz × Betrag/360 — Satz
   datiert); (c) optional Meldeverfahren-Checkliste.
4. **§2-Beurteilung:** **Deterministisch**, aber Verzugszinssatz ist **datierter
   Parameter** (jährlicher Verfall).
5. **Datenbedarf + VERFALLSREGISTER-Eintrag (NEU):** «VStG-Verzugszins (Art. 16 II,
   via EFD-VO SR 631.014) = 4.0 % (Stand 1.1.2026; 2025: 4.5 %), **jährlich prüfen**
   (admin.ch/ESTV/EFD-Mitteilung Q4), nächste Prüfung **Dez. 2026** (Satz 2027).»
   Hinweis: derselbe Satz gilt für direkte Bundessteuer, MWST u. a. → ggf. EINE
   datierte Stammdaten-Quelle (§5 SSoT) für «Bundessteuer-Zinssatz [Jahr]».
6. **Fallstricke:** 3-Jahres-Verwirkung ist KURZ und absolut (kein Stillstand wie
   bei DBG-Verjährung) — prominenter Warnhinweis. Verzugszinssatz-Verwechslung mit
   altem «5 %» (Auftrag) ist genau die Falle, die das Verfallsregister verhindert.
7. **Aufwand:** **M.** Wiederverwendung: fristenEngine (Jahresfrist); Verzugszins-
   Arithmetik ähnlich bestehendem OR-104-Verzugszins (aber datierter Satz statt fix 5 %).

---

## (7) AHV-Beiträge (AHVG/AHVV)

1. **Nutzerfrage:** «Wie hoch ist mein AHV/IV/EO-Beitrag (Arbeitnehmer/-geber,
   Selbständig, Nichterwerbstätig) für 2026?»
2. **Normbasis (AHVG SR 831.10; AHVV SR 831.101) — Werte 2026 (BSV, Web Juni 2026):**
   - **Arbeitnehmer/Arbeitgeber:** AHV/IV/EO total **10.6 %** (je 5.3 % AN/AG).
   - **Selbständigerwerbende:** Höchstsatz **10.0 %** (Einkommen ab CHF 60'500);
     **sinkende Skala** ab **5.371 %** (Einkommen CHF 10'100–17'600 aufwärts);
     **Mindestbeitrag CHF 530/Jahr** bei Einkommen ≤ CHF 10'100.
   - **Nichterwerbstätige:** Beitrag nach Vermögen + 20× Renteneinkommen;
     Min/Max-Beitrag (Tabellenwerte 2026 — exakte Skala am BSV-Merkblatt 2.03 / VO).
3. **Regelwerk-Skizze:** Eingaben Status + Einkommen (+ Vermögen/Rente bei NE) →
   Beitrag. Sinkende Skala + NE-Tabelle als **datierte Parametertabellen**.
4. **§2-Beurteilung:** **Parametrisiert/deterministisch** — Rechenregel fix, aber
   Sätze/Grenzen jährlich verfallend. NE-Tabelle ist die grösste Datenpflege.
5. **Datenbedarf + VERFALLSREGISTER-Eintrag (NEU):** «AHV/IV/EO-Beitragssätze +
   Skala + Min/Max (AHVG/AHVV, BSV-Merkblätter 2.01–2.03) Stand 2026: AN/AG 10.6 %,
   SE max 10.0 % / Skala ab 5.371 % / Mindestbeitrag CHF 530 / Grenze CHF 10'100,
   NE-Tabelle separat. **Jährlicher Verfall (1.1.), nächste Prüfung Jan. 2027.**»
6. **Fallstricke:** AN-Satz ≠ Gesamtsatz (10.6 % ist AN+AG zusammen; AN trägt 5.3 %).
   ALV separat (nicht in 10.6 % enthalten — Klarheit in UI). Selbständige: sinkende
   Skala ist abschnittsweise — exakte Stufen am Merkblatt 2.02 ziehen. Verwaltungs-
   kostenbeiträge der Ausgleichskasse zusätzlich.
7. **Aufwand:** **M** (SE-Rechner) bis **L** (NE-Tabelle vollständig). Wiederverwendung:
   keine Fristenlogik; eher Tarif-/Tabellen-Engine (neu).

---

## (10) Ausländerrecht-Fristen (AIG/AsylG)

1. **Nutzerfrage:** «Welche Frist gilt für meine Beschwerde/Einsprache im Ausländer-
   bzw. Asylverfahren?»
2. **Normbasis (AIG SR 142.20; AsylG SR 142.31):**
   - AIG: Beschwerde grds. **30 Tage** (VwVG/kantonales Recht); zahlreiche
     Spezialfristen (Verlängerung Aufenthalt, Wegweisung, Einreiseverbot).
   - AsylG: **beschleunigtes Verfahren — verkürzte Fristen** (z. B. Beschwerde
     **7 Arbeitstage** im beschleunigten/Dublin-Verfahren, Art. 108 AsylG;
     erweitertes Verfahren 30 Tage). **Arbeitstage ≠ Kalendertage — Sonderzählung!**
3. **Regelwerk-Skizze:** **Preset-Katalog** (analog zpoPresets) vieler Spezialfristen
   mit Feld «Zähleinheit» (Kalendertage vs. Arbeitstage) + Norm + Hinweis.
4. **§2-Beurteilung:** **Parametrisiert/deterministisch** als Preset-Katalog;
   Arbeitstags-Zählung braucht eigene Werktagsregel (fristenEngine ergänzbar).
5. **Datenbedarf/Verfall:** keine Geldwerte; Fristenkatalog am AIG/AsylG verifizieren.
6. **Fallstricke:** **Arbeitstage** im Asyl-Schnellverfahren (selten im CH-Recht!) —
   nicht mit Kalendertagen verwechseln. Stillstand im Asylverfahren teils
   ausgeschlossen. Materie politisch/schnelllebig → Stand-Datum prominent.
7. **Aufwand:** **M.** Wiederverwendung: Preset-Bauform + fristenEngine (Werktags-
   zählung für «Arbeitstage» ist neue Variante).

---

## (2) Bau-/Planungsrechtliche Fristen (KANTONAL) — Pilot

1. **Nutzerfrage:** «Einsprachefrist gegen ein Baugesuch / öffentliche Auflage in
   meinem Kanton?»
2. **Normbasis:** rein kantonal (PBG/BauG je Kanton). Exemplarisch:
   - **ZH** PBG: öffentliche Auflage 20 Tage (Einsprache/Rekurs prüfen).
   - **BE** BauG/BauV: Auflage 30 Tage (Einsprache).
   - **BS** BPG: Einsprachefrist während Publikation/Auflage.
   (Alle Werte **kantonal am geltenden konsolidierten Erlass via Erlasssammlungs-API
   ziehen** — Daueranweisung David; hier nur Richtung, NICHT belegt.)
3. **Regelwerk-Skizze:** je Kanton parametrisiert (Auflagedauer, Einsprachefrist,
   Werktagsregel je Kanton). Preset pro Kanton.
4. **§2-Beurteilung:** **Pilot** — §2-tauglich nur je Kanton parametrisiert.
   Empfehlung: **2–3 Pilotkantone (ZH/BE/BS)**, Rest Backlog.
5. **Datenbedarf:** kantonale Erlasse (konsolidiert, API), Auflagefristen je Kanton.
6. **Fallstricke:** Begriffe uneinheitlich (Einsprache/Einwendung/Rekurs); Beginn ab
   Publikation vs. Auflage; kantonale Feiertage. Hohe Pflegelast bei 26 Kantonen.
7. **Aufwand:** **M–L** (pro Kanton M). Wiederverwendung: fristenEngine + kantonale
   Feiertage + Preset-Bauform.

---

## (6) Grundstückgewinn-/Handänderungssteuer (KANTONAL) — Backlog/Pilot

1. **Nutzerfrage:** «Wie hoch ist meine Grundstückgewinn-/Handänderungssteuer?»
2. **Normbasis:** Grundstückgewinnsteuer kantonal harmonisiert dem Grundsatz nach
   (Art. 12 StHG), **Tarife/Besitzesdauer-Rabatte aber rein kantonal**;
   Handänderungssteuer ganz kantonal (einige Kantone erheben keine).
3. **Regelwerk-Skizze:** je Kanton Tarif + Besitzesdauer-Staffel + Ersatzbeschaffung.
4. **§2-Beurteilung:** **Backlog** (26 Tarife = sehr grosser Datenbedarf), allenfalls
   **Pilot 1–2 Kantone** als Machbarkeitsnachweis. Pro Kanton parametrisierbar, aber
   teuer in Pflege.
5. **Datenbedarf:** 26 kantonale Tarifwerke + Rabattskalen (konsolidiert, API) →
   bei Übernahme alle ins Verfallsregister (Tarifänderungen).
6. **Fallstricke:** Aufschubtatbestände (Ersatzbeschaffung, Erbgang), kommunale
   Zuschläge, unterschiedliche Bemessung (monistisch/dualistisch).
7. **Aufwand:** **L.** Wiederverwendung: Tarif-Engine-Muster (mit AHV-SE teilbar).

---

## Zusammenfassung Verfallsregister-Pflichteinträge (bei Umsetzung)

| Parameter | Wert/Stand | Rhythmus | Nächste Prüfung |
|---|---|---|---|
| Bundessteuer-Verzugs-/Vergütungszins (EFD-VO SR 631.014; gilt VST/dBSt/MWST) | 4.0 % (1.1.2026; 2025: 4.5 %) | jährlich (Q4-Mitteilung) | Dez. 2026 |
| AHV/IV/EO-Sätze + SE-Skala + NE-Tabelle (AHVG/AHVV, BSV) | 10.6 % AN/AG; SE 10.0 %/ab 5.371 %; Min CHF 530; Grenze CHF 10'100 | jährlich (1.1.) | Jan. 2027 |
| Schwellenwerte BöB/IVöB | 2026/2027 (unverändert ggü. 2025) | zweijährlich (WTO-Revision) | Ende 2027 |

(Bestehende Einträge — Referenzzins, MWST 8.1 %, Feiertage — bleiben unberührt.)
