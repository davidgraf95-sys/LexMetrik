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
- [ ] 3.1c Andocken weiterer Ereignisse: A.1 Zivilentscheid (zpoPresets,
      Streitwert/summarisch-Weichen, Folgestufe BGer abgesetzt) →
      A.2 Zahlungsbefehl (Dual Wartefrist/Verwirkung) → A.6 Erbgang
      (Multi-Trigger) / A.7 Klagebewilligung → A.3 AG-Kündigung zuletzt
      (erst 336b-Presets als Quick-Win; §2-Gate: 336b-II-Klagefrist nur als
      BEDINGTE Zeile). Brücke «In den Fristenspiegel» aus dem Mietrechner
      (fristenspiegelLink existiert).
