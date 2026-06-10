# Fahrplan Praxistauglichkeit (erstellt 6.6.2026, Auftrag David)

**Ziel:** Technische Optimierung der BESTEHENDEN Engines/Rechner für den
anwaltlichen Alltag — kein neuer Rechtsinhalt, nur Verwertbarkeit, Verkettung
und Ergonomie (§3: alles Darstellungs-/Infrastrukturschicht; §6: jede Etappe
verhaltensneutral für die Rechenergebnisse, golden-gesichert).

**Grundlage:** Feature-Inventur über alle 13 gebauten Rechner (Gap-Matrix,
6.6.2026). Stärken heute: PDF-Bericht universell (13/13) · Datums-Ergonomie
geteilt (DatumsFeld mit Heute-Knopf, 13/13) · Warnhinweise 11/13. Die Lücken
sind QUERSCHNITTE — also §10-Rahmenarbeit, kein Einzelbau.

## Etappe 1 — Andocken, was schon existiert (klein, sofort)

1.1 **Kalender-Export (.ics) überall** — heute NUR im Tagerechner, aber
    `icsFuerFrist()` (allgemeineFrist.ts) ist bereits generisch (RFC 5545,
    Vorfrist-Alarm). Andocken an: ZPO-Fristen, SchKG-Fristen, Kündigung/
    Sperrfristen, Mietrecht, Verjährung, Gewährleistung, Erb-Fristen.
    → Frist landet mit einem Klick im Outlook/Kalender der Kanzlei.

1.2 **Aktenzeichen-/Mandatsfeld** — `ErgebnisAnzeige`/`Berechnungsergebnis`
    kennen `aktenzeichen` bereits (ungenutzt!). Ein optionales Feld je Form
    + Durchreiche in den PDF-Kopf. → Jeder Rechenbericht ist dem Dossier
    zuordenbar (Aktenablage).

1.3 **Permalink/Teilen überall** — Codec-Muster `fristQueryKodieren/Lesen`
    (Tagerechner) je Rechner nachziehen. → Fall als Link speichern, an
    Kolleg:innen schicken, in die Akte legen.

## Etappe 2 — Verketten (mittel)

2.1 **Prefill-Brücken generalisieren** — Muster sgPrefill existiert.
    Prioritäre Brücken: (a) Rechtsmittel-Fahrplan → ZPO-Fristenrechner mit
    VORBEFÜLLTEM Preset (Berufung/Beschwerde, 30/10 Tage, summarisch-Flag)
    statt des heutigen nackten Links; (b) Zuständigkeits-Wizard →
    klage-vereinfacht (Prefill-Brücke fehlt, Logik-Check-Befund);
    (c) Kündigungs-Maske 1b ↔ Sperrfristen-Rechner (gleiche Eingaben).

2.2 **Kopierbarer Begründungs-Absatz** («für die Rechtsschrift») — fehlt in
    ALLEN 13 Rechnern: ein kopierfertiger Fliesstext-Absatz mit Normzitaten
    («Die Berufungsfrist von 30 Tagen [Art. 311 Abs. 1 ZPO] begann am … und
    endet unter Berücksichtigung des Stillstands [Art. 145 …] am …»).
    Geteilte Komponente; der Text speist sich aus dem ohnehin vorhandenen
    Rechenweg — KEINE neue Rechtslogik, reine Formulierung aus Engine-Daten.
    Konventionen-Linter läuft darüber (SSoT-Texte).

## Etappe 3 — Fristenspiegel (gross, konzeptionell zuerst)

3.1 **Mehrere Fristen aus EINEM Ereignis** — der Praxis-Klassiker: eine
    Urteilszustellung löst parallel Berufungs-/Beschwerdefrist, allfällige
    Anschluss- und Kostenvorschuss-Fristen aus; eine Kündigungszustellung
    löst Einsprache- (336b), Anfechtungs- (273) und Klagefristen aus.
    Ansatz existiert (SchKG dual Wartefrist/Verwirkung; Kündigung+Lohn
    kombiniert). Vorgehen: erst Konzept als Dossier (§11), dann generischer
    «Fristenspiegel»-Rahmen (§10), dann je Rechtsgebiet andocken.

## Leitplanken

- Jede Etappe: Golden-Outputs vorher/nachher identisch (Rechenergebnisse
  unverändert), volle Suite, Lint mit echtem Exit-Code.
- Keine Schätzungen, keine neuen Rechtsregeln — §2 bleibt unangetastet.
- Reihenfolge im Zweifel: erst der geteilte Rahmen, dann das Andocken (§10).
- Dieses Dokument wird hier gepflegt; Stand in STRUKTUR.md spiegeln.

## Status

- [x] 1.1 .ics überall (7 Rechner) — erledigt 6.6.2026
- [x] 1.2 Aktenzeichen → PDF (14 Formen) — erledigt 6.6.2026
- [x] 1.3 Permalink (alle 13 Rechner) — erledigt 6.6.2026
- [x] 2.1 Prefill-Brücken a/b/c — erledigt 6.6.2026
- [x] 2.2 Begründungs-Absatz (geteilte Komponente, 13 Rechner) — erledigt 6.6.2026
- [x] 3.1a Fristenspiegel-KONZEPT — Dossier `bibliothek/recherche/
      fristenspiegel-konzept.md` (6.6.2026, normverifiziert: 311/312/313/
      314/321/145/209/239 ZPO · 74/88 SchKG · 273/336b OR · 354 StPO ·
      100/46 BGG · 567/580/521/533 ZGB). Kernbefund: Orchestrierer über
      BESTEHENDE Engines/Presets (§5) — 6/7 Ereignisse abgedeckt, einzige
      Lücke 336b (2 Preset-Zeilen, Aufwand S). Empfehlung: eigener Rechner
      /rechner/fristenspiegel; Datenmodell FristenspiegelDef; Sammel-.ics
      additiv (icsSammel neben icsFuerFrist).
- [x] 3.1b RAHMEN + PILOT A.4 — erledigt 6.6.2026 nachts:
      `lib/fristenspiegel/` (typen.ts + vermieterkuendigung.ts als reiner
      mietrecht-Konsument, EIN Engine-Aufruf) · `icsSammel()` (n VEVENTs in
      EINEM VCALENDAR; Einzel-Export per Anker-Test BYTE-identisch) ·
      eigener Rechner `/rechner/fristenspiegel` (Katalog-Karte «Übergreifende
      Werkzeuge», Szenarien-Roadmap auf der Karte) · FSP_LINK_SPEC
      (Permalink/Brücken-Ziel) · 12 Tests inkl. Konzept-Golden-Beweis
      «Spiegel-Datum == direktes Engine-Resultat» über 6 Fälle + 26 Kantone ×
      4 Kündigungsarten; Pilot-Annahme bewiesen (Art.-273-Daten unabhängig
      von der Termin-Quelle). Erstreckungs-Ausschluss 257d/257f als
      «ausgeschlossen»-Zeile (Art. 272a); Formgültigkeit/befristetes
      Verhältnis offengelegt (§8).
- [x] 3.1c **A.1 Zivilentscheid** — erledigt 6.6.2026 nachts (`d60ee0a`):
      Weiche aus `bestimmeRechtsmittel` (KEINE Schwelle dupliziert; Divergenz-
      Schutz-Test Norm-Pille ⊂ Weiche-Text), Datum aus `berechneFrist` mit den
      Brücken-2.1a-Parametern; Dispositiv-Vorstufe (Art. 239: Begründungs-
      Frist mit exakt den zpoPresets-Parametern, Rechtsmittel dann bewusst
      OHNE Datum, §1); Anschlussberufung 314 I ausgeschlossen / 313 Hinweis
      «anderer Auslöser»; BGer abgesetzte Folgestufe. 18 Spiegel-Tests.
- [x] 3.1d KOMPLETT — erledigt 6.6.2026 spätnachts (`866bf43`, `54c585b`,
      Brücken-Commit):
      · A.2 Zahlungsbefehl: RV + Art.-88-DUAL aus EINEM schkgPreset (zwei
        Zeilen; Wartefrist «frühestens ab», Verwirkung mit offengelegter,
        bewusst NICHT gerechneter Abs.-2-Hemmung); Rechtsöffnung/Aberkennung
        Folgestufe; Wechselbetreibung abgegrenzt (Art. 56 Ziff. 2)
      · A.7 Klagebewilligung: Miete/Pacht-Weiche wählt das Preset (209 III/IV);
        Prosekutions-Stillstand-Vorbehalt durchgereicht
      · A.6 Erbgang: Ausschlagung (gesetzlich/eingesetzt) + öff. Inventar am
        gleichen Trigger; Ungültigkeit/Herabsetzung NUR Hinweis (Multi-Trigger)
      · A.3 AG-Kündigung: Anker = Beendigungsdatum (Eingabe/Brücke);
        Einsprache = Anker selbst, 336b-II-Klage 180 T als BEDINGTE Zeile
        (§2-Gate); Werktags-Verschiebung konservativ NICHT unterstellt
        (Dossier-TODO D.2/3), Warnung «vorher wahren»
      · BRÜCKEN: Mietrechner (Vermieter+Raum) «Im Fristenspiegel öffnen →»
        vorbefüllt · Sperrfristen-Rechner (AG, beendigungISO) «336b-Fristen
        im Fristenspiegel →»
      · A.5 Strafbefehl bewusst ausgeklammert (Dossier: Single-Frist →
        Direktlink statt Spiegel). 23 Spiegel-Tests, alle Preset-Parameter-
        Identitäten erzwungen; Suite 898, Golden 65/65.

**ETAPPEN 1–3 DAMIT VOLLSTÄNDIG.** Pflege: neue Ereignisse folgen dem
Konzept-Dossier (§11) und dem Quelle-Muster in lib/fristenspiegel/.
