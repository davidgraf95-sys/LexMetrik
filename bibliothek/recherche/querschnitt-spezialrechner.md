# Querschnitt & Spezialrechner — Recherche-Dossier

**Cluster:** Querschnitt & Spezialrechner (8 Items)
**Erstellt:** 6.6.2026
**Status:** Erstrecherche (einfach belegt) — fachliche Abnahme durch David ausstehend (§7/§8)
**Bezug:** KATALOG-ROADMAP.md (Sachenrecht / Immaterialgüterrecht / Querschnitts-Werkzeuge), STRUKTUR.md Backlog (Z. 424–429)

## Quellenlage

| Quelle | Stand | Verwendung |
|---|---|---|
| OR-Cache `/tmp/or.html` | Konsol. 1.1.2026 | Art. 40a–40g, 73, 104 verbatim geprüft ✓ |
| ZGB-Cache `/tmp/zgb.html` | Konsol. 1.1.2026 | Art. 837/839/840/841/961 verbatim geprüft ✓ |
| ZPO-Cache `/tmp/zpo.html` | Konsol. 1.1.2025 | Art. 209 (bereits in zpoPresets verdrahtet) |
| IGE-Richtlinien / Gebühren | 2026 / GebV-IGE | MSchG 31/35a, CHF 800 (Web, einfach belegt) |
| BGE 131 III 12 | 2004 | Schadenszins (Web + DFR, einfach belegt) |
| Web (KKG/VVG/MSchG) | Juni 2026 | Revisionsstände, Schwellen |

## Verifikations-TODOs (vor Code-Übernahme)

- [ ] **KKG Art. 7 / 16 verbatim** am Fedlex-Filestore prüfen (SR 221.214.1) — Filestore-URL liess sich im Cache-Lauf nicht auflösen (nur SPA-Shell); Schwellen CHF 500 / 80'000 / 3 Monate und Frist 14 Tage nur Web-belegt.
- [ ] **VVG Art. 2a/2b verbatim** (SR 221.229.1, Stand 1.1.2022) — Ausnahmen (Kollektiv-Personenvers., vorläufige Deckung, < 1 Monat Laufzeit) nur Web-belegt.
- [ ] **MSchG Art. 31/35a + GebV-IGE** verbatim (SR 232.11 / 232.148) — Gebühr CHF 800 für Widerspruch UND Löschung; Fristbeginn «Publikation Swissreg».
- [ ] **BGE 131 III 12 / Art. 73 OR** als Rechtsprechungs-Anker in `src/data/verifikation.ts` aufnehmen (Schadenszins-Satz 5%, kein Mahnungserfordernis, keine Kumulation mit Verzugszins).
- [ ] **«Vollendung der Arbeit» (Art. 839 Abs. 2 ZGB)** — Rechtsprechungslage zum Fristbeginn (geringfügige Restarbeiten/Garantiearbeiten zählen i. d. R. nicht) als Warnungstext, nicht als Berechnung. BGE-Anker recherchieren (z. B. BGE 102 II 206 / 125 III 113 — zu verifizieren).

## Wiederverwendbare Bausteine (Phase-0-Befund)

- **`fristenEngine.ts`** (`fristendeKalender`, `fristendeTage`, `OHNE_STILLSTAND`, `normalisiereEnde`) — fachneutrale Datums-Arithmetik. Basis für Items 1–5.
- **`allgemeineFrist.ts`** (`berechneAllgemeineFrist`, `RechenSchritt`, `.ics`-Export, Permalink) — dünne Hülle über der Engine; Vorbild für alle reinen Fristrechner. Items 1, 2, 5 docken hier an (Monatsfrist Item 1, 3-Monatsfrist Item 2, 14-Tage-Fristen Item 5).
- **`zpoFristen.ts` / `zpoPresets.ts`** — **Item 3 (Klagebewilligung Art. 209) ist BEREITS implementiert** (Presets `klagebewilligung` = 3 Monate, `klagefrist_miete` = 30 Tage Abs. 4). Hier nur Ausbau/Sichtbarkeit nötig, kein neuer Rechner.
- **`verzugszins.ts`** — event-basierte Segmentrechnung mit 5%/Jahr (Art. 104 OR), Methoden act365/act360/30E360. Item 4 (Schadenszins) ist eine **Variante** (anderer Fristbeginn, kein Mahnungserfordernis) — Engine-Muster wiederverwenden, NICHT fusionieren (§4).
- **`data/zpoFeiertage.ts` / `data/schkgFeiertage.ts`** (`stillstandsperioden`, `istArbeitsfreierTag`, Computus) — Datenbasis für Item 7.

---

## Item 1 — Bauhandwerkerpfandrecht (Eintragungsfrist)

**1) Nutzerfrage.** «Bis wann muss ich das Bauhandwerkerpfandrecht im Grundbuch eintragen lassen?» — Berechnung der 4-Monats-Frist ab Vollendung der Arbeit; Hinweis auf vorläufige Eintragung.

**2) Normbasis (geprüft am ZGB-Cache, Stand 1.1.2026).**
- **Art. 839 Abs. 2 ZGB:** «Die Eintragung hat bis spätestens **vier Monate nach der Vollendung der Arbeit** zu erfolgen.» (verbatim ✓)
- Art. 839 Abs. 1: frühester Beginn ab Verpflichtung zur Arbeitsleistung.
- Art. 839 Abs. 3: Eintragung nur bei anerkannter/gerichtlich festgestellter Pfandsumme; Abwendung durch hinreichende Sicherheit (+ 10 Jahre Verzugszins).
- Art. 961 Abs. 1 Ziff. 1 ZGB: **vorläufige Eintragung** (Vormerkung) zur Sicherung; Glaubhaftmachung genügt, Gericht entscheidet (Art. 961 Abs. 3) — praktisch das Mittel, um die 4-Monats-Frist zu wahren.
- Art. 837 Abs. 1 Ziff. 3 ZGB: Anspruchsberechtigte (Handwerker/Unternehmer, Material+Arbeit oder Arbeit allein); Abs. 2: Zustimmung des Eigentümers bei Mieter-/Pächterschuld; Abs. 3: kein Vorausverzicht (verbatim ✓).
- Art. 841 Abs. 3 ZGB: nach Anmerkung des Baubeginns nur noch Grundpfandverschreibungen bis Fristablauf.

**3) Regelwerk-Skizze.** Eingaben: Datum «Vollendung der Arbeit» (Pflichtfeld). Rechnung: 4-Monats-Frist = `fristendeKalender(vollendung, 'monate', 4, OHNE_STILLSTAND, false)` → gleichbezeichneter Tag, Monatsende-Klemmung (Art. 77-Mechanik der Engine), Endverschiebung auf Werktag via `normalisiereEnde`. Ausgabe: Fristende + Rechenweg + zwingender Warnblock.

**4) §2-Beurteilung.** Berechnung selbst ist **rein deterministisch** (fixe 4-Monats-Frist). Der **Fristbeginn «Vollendung» ist wertend** — das ist KEINE Engine-Aufgabe: «Vollendung» wird als Nutzereingabe entgegengenommen, NICHT vom Rechner bestimmt. Mit klarer Warnung (Punkt 6) §2-konform. Determinismus gewahrt.

**5) Datenbedarf.** Keine externen Stammdaten. Optional: zuständiges Grundbuchamt (nicht zwingend; eigenes Behörden-Dossier wäre L-Aufwand).

**6) Fallstricke.**
- **«Vollendung der Arbeit» ist der kritische, streitanfällige Punkt:** geringfügige Nachbesserungs-/Garantiearbeiten verschieben den Fristbeginn i. d. R. NICHT; abgrenzbare Zusatzbestellungen können neue Frist auslösen. → Prominenter Warnblock: «Bestimmen Sie das Vollendungsdatum nicht selbst rechtsverbindlich; im Zweifel früher (vorläufig) eintragen lassen.»
- Frist ist eine **Verwirkungsfrist** (kein Stillstand, keine Erstreckung, keine Wiederherstellung der Eintragung als solcher).
- Praxis: vorläufige Eintragung nach Art. 961 wahrt die Frist — die definitive kann später folgen (Hinweis, kein Rechenschritt).

**7) Aufwand / Wiederverwendung.** **S–M.** Dünne Hülle über `fristenEngine` analog `allgemeineFrist.ts`; Mehraufwand liegt in Warnungstexten + ZGB-Normverweisen. Hohe Wiederverwendung. **Quick-Win.**

---

## Item 2 — Markenwiderspruch (Widerspruchsfrist)

**1) Nutzerfrage.** «Bis wann kann ich gegen eine eingetragene Marke Widerspruch erheben?» — 3-Monats-Frist ab Swissreg-Publikation; dazu Gebühren-/Verfahrenshinweis. Optional Löschungsverfahren (Nichtgebrauch).

**2) Normbasis (Web, einfach belegt — Verbatim-TODO).**
- **MSchG Art. 31 Abs. 1/2:** Widerspruch schriftlich und begründet **innert drei Monaten nach der Veröffentlichung der Eintragung** beim IGE; Widerspruchsgebühr innert dieser Frist zu zahlen. Fristbeginn = Publikation in Swissreg.
- **MSchG Art. 35a/35b** + Art. 24a–24e MSchV: **Löschungsverfahren wegen Nichtgebrauchs** (Frist Art. 35a Abs. 2: frühestens 5 Jahre nach Eintragung/Widerspruchsfrist; Gebühr Art. 35a Abs. 3).
- **Gebühren (GebV-IGE):** Widerspruch CHF 800; Löschung Nichtgebrauch CHF 800 (Web, einfach belegt).

**3) Regelwerk-Skizze.** Eingabe: Publikationsdatum (Swissreg). Rechnung: `fristendeKalender(publikation, 'monate', 3, OHNE_STILLSTAND, false)` + Werktagsverschiebung. Ausgabe: Frist + Gebühren-/Verfahrens-Infoblock (IGE, Schriftlichkeit, Begründungs- und Gebührenpflicht innert Frist). Löschungsverfahren als separater Info-/Fristblock.

**4) §2-Beurteilung.** Berechnung deterministisch (fixe 3-Monats-Frist). Gebühren sind feste Stammdaten. **§2-konform.** Materielle Verwechslungsgefahr bleibt ausserhalb (kein Rechner dafür).

**5) Datenbedarf.** GebV-IGE-Gebührensätze als Stammdaten (CHF 800 / 800) — datiert führen (Parameter-Verfallsregister). Swissreg als Quelle des Publikationsdatums (kein API-Bedarf; Nutzereingabe).

**6) Fallstricke.**
- Frist ist **nicht erstreckbar** (Zulässigkeitsvoraussetzung); Gebühr muss INNERHALB der Frist eingehen, sonst gilt der Widerspruch als nicht erhoben.
- Fristbeginn = **Publikationsdatum in Swissreg**, nicht Eintragungs-/Hinterlegungsdatum.
- Gebühren datiert halten (GebV-IGE-Revisionen).

**7) Aufwand / Wiederverwendung.** **S.** Reiner Fristrechner über `fristenEngine` + Gebühren-Konstanten. **Quick-Win**, sobald Verbatim-Prüfung erfolgt.

---

## Item 3 — Klagebewilligung-Geltungsdauer (Art. 209 ZPO)

**1) Nutzerfrage.** «Wie lange ist meine Klagebewilligung gültig / bis wann muss ich Klage einreichen?»

**2) Normbasis (ZPO-Cache, in Engine geprüft).**
- **Art. 209 Abs. 3 ZPO:** Geltungsdauer **3 Monate** ab Eröffnung.
- **Art. 209 Abs. 4 ZPO:** **30 Tage** bei Miete/Pacht von Wohn-/Geschäftsräumen und landwirtschaftlicher Pacht.
- GlG-Fälle: Stillstand-Anwendbarkeit im Einzelfall (BGE 144 III 404 — bereits als Hinweis im Preset `klagefrist_glg`).

**3) Regelwerk-Skizze.** **BEREITS UMGESETZT** in `zpoPresets.ts`: Presets `klagebewilligung` (3 Monate, verfahren `schlichtung`), `klagefrist_miete` (30 Tage, Abs. 4), `klagefrist_glg`. Gerechnet wird über `zpoFristen.berechneFrist` (mit korrekter Stillstand-Behandlung: `klagefrist_klagebewilligung` im STILLSTAND_GILT-Mapping = true).

**4) §2-Beurteilung.** Deterministisch, integriert. **§2-konform.**

**5) Datenbedarf.** Keiner — vorhanden.

**6) Fallstricke.**
- **Miete-Sonderfall 30 Tage (Abs. 4)** darf nicht mit der 3-Monats-Regel vermischt werden — im Preset bereits getrennt; bei UI-Ausbau Trennung sichtbar halten (§1/§4).
- Stillstand: Schlichtungsverfahren kennt grundsätzlich keinen Stillstand (Art. 145 Abs. 2), die KLAGEFRIST nach Klagebewilligung gehört aber zum gerichtlichen Verfahren → Stillstand gilt (im Mapping korrekt abgebildet).

**7) Aufwand / Wiederverwendung.** **S (nur UI/Sichtbarkeit).** Kein neuer Rechner; ggf. eigener Katalog-Einstieg «Klagebewilligung» auf bestehende ZPO-Presets. **Quick-Win.**

---

## Item 4 — Schadenszins

**1) Nutzerfrage.** «Wie viel Zins kann ich auf meinen Schaden ab dem schädigenden Ereignis verlangen?» — Abgrenzung zum Verzugszins.

**2) Normbasis (Web + DFR, einfach belegt — Anker-TODO).**
- **Satz 5 %** (Praxis i. V. m. Art. 73 OR — die Suchergebnisse nennen Art. 73 OR, nicht Art. 104).
- **BGE 131 III 12:** Schadenszins läuft **ab dem Zeitpunkt, in dem das schädigende Ereignis sich finanziell auswirkt**, bis zum Zahlungstag. **Kein Mahnungserfordernis, kein Verzug** nötig (anders als Verzugszins). **Keine Kumulation** mit Verzugszins (gleiche Funktion). [Satz/Beginn zu verifizieren — Anker prüfen.]

**3) Regelwerk-Skizze.** Eingaben: Schadensbetrag, Datum «schädigendes Ereignis» (bzw. finanzielle Auswirkung), Endtag (Zahlung/Urteil), Methode. Rechnung: 5 %/Jahr vom Ereignistag bis Endtag — Engine-Muster von `verzugszins.ts` (Segmentrechnung, act365/act360/30E360) übernehmen, aber EIGENE Engine (`schadenszins.ts`), da Voraussetzungen und Fristbeginn rechtlich verschieden (§4 — keine Fusion).

**4) §2-Beurteilung.** Determinismus gewahrt, SOFERN das Ereignisdatum als Eingabe gilt (§2: «ab Eingabe-Datum»). Der Rechner bestimmt NICHT, wann der Schaden eingetreten/finanziell wirksam wurde — das ist wertend und bleibt Nutzereingabe. Mit dieser Grenze §2-konform.

**5) Datenbedarf.** Zinssatz 5 % als Konstante; BGE 131 III 12 + Art. 73 OR als Verifikations-Anker.

**6) Fallstricke.**
- **Abgrenzung Verzugszins ↔ Schadenszins ist die Kernbotschaft:** beide 5 %, aber Schadenszins ab Ereignis (ohne Mahnung), Verzugszins ab Inverzugsetzung. **Keine Doppelverzinsung** für denselben Zeitraum — Warnung zwingend.
- Fristbeginn «finanzielle Auswirkung» ist wertend → Eingabe + Hinweis.
- Norm-Grundlage prüfen: Art. 73 OR (Satz) vs. allgemeine Praxis — Anker sauber setzen ([zu verifizieren]).

**7) Aufwand / Wiederverwendung.** **M.** Engine-Muster aus `verzugszins.ts` wiederverwendbar; getrennte Engine + Abgrenzungs-Warnungen + Anker-Verifikation = Hauptaufwand.

---

## Item 5 — Widerruf / Konsumentenschutz (Aufklärungs-Rechner)

**1) Nutzerfrage.** «Kann ich diesen Vertrag widerrufen, und bis wann?» — über mehrere Vertragstypen hinweg; insbesondere die verbreitete Fehlannahme «Online-Kauf = 14 Tage Rückgaberecht».

**2) Normbasis.**
- **OR Art. 40a–40g (OR-Cache, verbatim ✓):**
  - Art. 40a: Geltung bei beweglichen Sachen/Dienstleistungen für persönl./famil. Gebrauch, Anbieter gewerblich, Leistung Kunde **> CHF 100**. Versicherungsverträge → VVG (Abs. 2bis); Finanzdienstleistungen ausgenommen (Abs. 2).
  - Art. 40b: Widerruf bei Angebot **am Arbeitsplatz/in Wohnräumen, in öffentl. Verkehrsmitteln/Strassen/Plätzen, an Werbeveranstaltung mit Ausflug, am Telefon** (lit. d, eingefügt per 1.1.2016).
  - Art. 40c: **Kein** Widerrufsrecht bei ausdrücklich gewünschten Verhandlungen oder Markt-/Messestand.
  - Art. 40d: Orientierungspflicht des Anbieters (Form/Frist/Adresse, datiert).
  - **Art. 40e Abs. 2: Widerrufsfrist 14 Tage**, Beginn sobald (a) Vertrag beantragt/angenommen UND (b) Kenntnis der Art.-40d-Angaben. Abs. 4: Postaufgabe am letzten Tag genügt. (Revision 2016: 7 → 14 Tage.)
  - **Wichtig: KEIN allgemeines Fernabsatz-/Online-Widerrufsrecht im CH-Recht** — der reine Online-/Versandkauf ist von Art. 40b NICHT erfasst (Aufklärungsfunktion!).
- **KKG Art. 16 (Web — Verbatim-TODO):** Widerruf Konsumkredit **14 Tage**, schriftlich, ab Erhalt der Vertragskopie. Geltungsbereich KKG (Art. 7): Kreditsumme **> CHF 500 und < CHF 80'000**, Laufzeit > 3 Monate (Web-belegt).
- **VVG Art. 2a/2b (Web — Verbatim-TODO, Revision 1.1.2022):** Widerruf Versicherungsvertrag **14 Tage**, schriftlich/textnachweisbar, ab Antrag/Annahme. Ausnahmen: Kollektiv-Personenversicherung, vorläufige Deckungszusagen, Laufzeit < 1 Monat.

**3) Regelwerk-Skizze.** Zweistufig: (a) **Aufklärungs-/Subsumtions-Wegweiser** (Auswahl Vertragstyp/Vertriebskanal → zeigt OB ein Widerrufsrecht besteht und auf welcher Norm; deckt insbesondere ab, dass reiner Online-Kauf KEIN Widerrufsrecht gibt). (b) **Fristrechner** für die zutreffende 14-Tage-Frist über `fristenEngine` (`fristendeTage(start, 14, ...)`), Beginn = Nutzereingabe (Vertragsschluss bzw. Kenntnis Art.-40d-Angaben / Erhalt Vertragskopie).

**4) §2-Beurteilung.** Die **Fristberechnung** ist deterministisch (fixe 14 Tage). Der **Wegweiser-Teil** ist regelbasiert, solange er nur kanalbasiert filtert (Telefon/Haustür → ja; Messestand/Online → nein) und KEINE Einzelfall-Subsumtion vornimmt. Backlog-Notiz (STRUKTUR.md Z. 427) «Konsumkredit-Widerruf — Anwendungsbereich klären» wird hiermit beantwortet: deterministisch umsetzbar, WENN als Aufklärungs-/Schwellen-Werkzeug (KKG-Schwellen sind feste Zahlen), nicht als Beratung. **§2-konform mit klaren Grenzen.**

**5) Datenbedarf.** Konstanten: OR-Schwelle CHF 100, Fristen 14 Tage; KKG-Schwellen 500/80'000, 3 Monate; VVG-Ausnahmenliste. Alle datiert führen (Revisionsstände).

**6) Fallstricke.**
- **Kernaufklärung: kein allgemeines Online-/Fernabsatz-Widerrufsrecht** in der Schweiz — die häufigste Nutzer-Fehlannahme. Muss prominent sein.
- OR-Schwelle ist seit Revision **CHF 100** (nicht der alte «Haustürgeschäft»-Begriff); Telefonverkauf seit 1.1.2016 erfasst; Frist seit 2016 **14** (nicht 7) Tage.
- Fristbeginn OR knüpft an **Kenntnis der Art.-40d-Angaben** (Beweislast Anbieter, Art. 40e Abs. 3) — wenn Aufklärung unterblieb, beginnt die Frist u. U. nicht/später. Als Hinweis, nicht als Berechnung.
- KKG nur innerhalb der Schwellen (500/80'000) und > 3 Monate Laufzeit.
- VVG-Ausnahmen (Kollektiv/vorläufige Deckung/< 1 Monat) abfragen.

**7) Aufwand / Wiederverwendung.** **M–L** (Fristteil S, Wegweiser-Logik + 3 Normregime + Verbatim-Prüfung treiben den Aufwand). Fristrechner nutzt `fristenEngine`; Wegweiser ist neue, aber regelbasierte Logik. Empfehlung: in zwei Schritten bauen (Fristrechner zuerst = Quick-Win, Wegweiser danach).

---

## Item 6 — IPRG-Wegweiser (internationale Zuständigkeit)

**1) Nutzerfrage.** «Ist überhaupt ein Schweizer Gericht zuständig, wenn ein Auslandsbezug besteht?» — Vorprüfung vor der innerstaatlichen Zuständigkeit (zustaendigkeit.ts).

**2) Normbasis.** IPRG (SR 291) + LugÜ (SR 0.275.12). Die ZPO-Zuständigkeitsengine kennt bereits eine «IPRG-Weiche» (s. `normen/zpo-zustaendigkeit-regelwerk.md`). Umfang IPRG/LugÜ ist gross und stark wertend (Wohnsitz/Niederlassung, Vereinbarungen, Sonderzuständigkeiten).

**3) Regelwerk-Skizze.** **Checkliste/Wegweiser**, kein Rechner: Auslandsbezug? → LugÜ-Staat? → besondere Gerichtsstände? → Verweis auf zuständige Spezialnormen + Hinweis «vertiefte Prüfung nötig». Reine Navigations-/Aufklärungshilfe.

**4) §2-Beurteilung.** Eine vollständige IPRG/LugÜ-Zuständigkeitsbestimmung ist **wertend und NICHT deterministisch abbildbar** → §2-Grenze. Zulässig nur als **Wegweiser-Checkliste**, die zur richtigen Norm/Frage führt, ohne ein Ergebnis zu behaupten.

**5) Datenbedarf.** LugÜ-Vertragsstaatenliste; IPRG-Sachgebiets-Mapping (Hinweis-Ebene).

**6) Fallstricke.** Gefahr der Scheinpräzision — klar als Vorprüfung/Checkliste kennzeichnen, kein «Zuständigkeit JA/NEIN».

**7) Aufwand / Wiederverwendung.** **M** (als Checkliste/Inhalt), **nicht** als Engine. Bestehende IPRG-Weiche der ZPO-Engine als Anknüpfung. Niedrige Priorität.

---

## Item 7 — Ferien-Checker + Friststillstand-Assistent

**1) Nutzerfrage.** «Ist Tag X ein Gerichts-/Betreibungsferientag bzw. fällt er in einen Stillstand?» / «Welche Stillstandsperioden gelten dieses Jahr?»

**2) Normbasis.** Art. 145 Abs. 1 ZPO (3 Gerichtsferien-Perioden), Art. 56/63 SchKG (Betreibungsferien/Rechtsstillstand) — bereits in `data/zpoFeiertage.ts` (`stillstandsperioden`, Computus) und `data/schkgFeiertage.ts` kodiert.

**3) Regelwerk-Skizze.** **Reine UI über vorhandener Logik:** Datum/Jahr eingeben → `stillstandsperioden(jahr)`, `stillstandsperiodeFuer(d)`, `istArbeitsfreierTag(d, kanton)` anzeigen. Kein neuer Rechenkern.

**4) §2-Beurteilung.** Deterministisch (alles bereits in der Datenebene). **§2-konform.** §3: lebt vollständig in der Darstellungsschicht über bestehenden Engines/Daten.

**5) Datenbedarf.** Keiner neu — `zpoFeiertage.ts`, `schkgFeiertage.ts`.

**6) Fallstricke.** Kantonale Feiertagsmatrix Stand 2011 (Verifikationsvorbehalt dort) — den bestehenden Vorbehalt in der UI weiterführen (§8). Gerichtsferien (ZPO) ≠ Betreibungsferien (SchKG) klar trennen.

**7) Aufwand / Wiederverwendung.** **S.** Maximale Wiederverwendung (nur Anzeige). **Quick-Win.**

---

## Item 8 — Checklisten / Mandatsaufnahme / Kostenblatt

**1) Nutzerfrage.** «Welche Angaben/Schritte brauche ich für mein Mandat?» / strukturierte Kostenübersicht.

**2) Normbasis.** Kein Rechtsrechner — Organisations-/Struktur-Werkzeuge. Speist sich aus vorhandenen Stammdaten.

**3) Regelwerk-Skizze (Struktur).**
- **Mandatsaufnahme-Formular:** strukturierte Erfassung (Parteien, Sachverhalt, Fristen) → kann erfasste Fristen an den Fristenrechner übergeben.
- **Kostenblatt-Export:** zieht aus `data/zustaendigkeitKosten.ts` (Schlichtungs-/Gerichtskosten), `kosten/anwaltstarife-kantone.md`, Gerichtskosten Bund/Kantone.
- **Checklisten:** statische, je Verfahren kuratierte Listen (z. B. Schlichtungsgesuch-Beilagen) — speisen aus den Vorlagen-Schemas.

**4) §2-Beurteilung.** Keine Rechtslogik mit Ergebnis → §2 nicht einschlägig, ABER: jede angezeigte Gebühr/Frist MUSS aus der bestehenden SSoT stammen (§5), keine fest verdrahteten Zahlen in der UI (§3).

**5) Datenbedarf (einfliessende bestehende Daten).** `zustaendigkeitKosten.ts`, `anwaltstarife-kantone.md`, `gerichtskosten-*`, `schlichtungsgebuehren-kantone.md`, Behörden-Stammdaten, Vorlagen-Schemas.

**6) Fallstricke.** Keine Zahlen duplizieren (§5); Status/Unsicherheiten der Quell-Daten mittragen (§8).

**7) Aufwand / Wiederverwendung.** **M.** Reine Aggregations-/Darstellungsschicht über vorhandenen Daten; kein neuer Rechtskern.

---

## Priorisierte Bau-Reihenfolge

| Prio | Item | Aufwand | Begründung |
|---|---|---|---|
| 1 | **3 Klagebewilligung** | S | Bereits in Engine — nur Sichtbarkeit/Einstieg. |
| 1 | **7 Ferien-/Stillstand-Assistent** | S | Reine UI über vorhandener Logik. |
| 2 | **1 Bauhandwerkerpfandrecht** | S–M | ZGB verbatim geprüft; dünne Hülle über `fristenEngine`. |
| 2 | **2 Markenwiderspruch** | S | Fristrechner + 2 Gebühren-Konstanten; nach Verbatim-Prüfung. |
| 3 | **5 Widerruf (Fristteil zuerst, dann Wegweiser)** | M–L | Hoher Aufklärungswert; 3 Normregime verbatim prüfen. |
| 3 | **4 Schadenszins** | M | Engine-Muster aus `verzugszins.ts`; Anker BGE 131 III 12. |
| 4 | **8 Checklisten/Mandat/Kostenblatt** | M | Aggregation, kein Rechtskern. |
| 5 | **6 IPRG-Wegweiser** | M | Nur Checkliste (§2-Grenze), niedrige Priorität. |

**Quick-Wins (sofort umsetzbar):** Items 3, 7, 1.
