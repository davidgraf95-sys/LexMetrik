# Lexmetrik — Katalog-Roadmap (Sicht nach Rechtsgebiet)

Geplante **Rechner und Vorlagen**, gegliedert nach Rechtsgebiet (beide Modi gemeinsam). Dies ist die Planungs-/Roadmap-Sicht. Die Live-App gliedert nach Output-Typ (Fristen / Beträge & Quoten / Zuständigkeit & Einordnung / Werkzeuge) mit Rechtsgebiet als Filter; diese Datei ist die fachliche Übersicht für die Planung.

**Legende:** `[live]` geschaltet · `(free)` Free-Stufe · `[Beurkundung]` öffentliche Beurkundung nötig · `[Gerüst]` nur strukturiertes Gerüst (Würdigungsanteil). Ohne Markierung: geplant, Pro.

## §0-Mehrwert-Test (Daueranweisung David 7.6.2026 — HANDLUNGSPLAN §0)

Geplant wird nur, was ein EIGENES Regime hat (Stillstand, Sonderunter-
brechung, abweichende Berechnungsregeln, eigene Tarif-/Datenschicht).
**Triage 7.6.2026 (Agent, Normen am Fedlex-Cache verbatim verifiziert):**

**GESTRICHEN (Tagerechner/bestehendes Werkzeug deckt ab):**
- *Strafverfahrensfristen* + *Haftfristen* — Art. 89 Abs. 2 StPO: «Im
  Strafverfahren gibt es keine Gerichtsferien»; Art. 90 = generische
  Mechanik (Davids Beispiel). → Tagerechner-Presets (Einsprache
  Strafbefehl 10 T., Berufung 20 T.).
- *Strafantragsfrist* (Rechner) — Art. 31 StGB: 3 Monate ab Kenntnis,
  kein Stillstand. → Tagerechner-Preset; die VORLAGE Strafantrag bleibt.
- *Bauhandwerkerpfandrecht* — Art. 839 Abs. 2 ZGB: 4 Monate ab
  Vollendung, fix. → Tagerechner-Preset.
- *Widerrufsrechte/Konsum* — Art. 40e Abs. 2 OR: 14 Tage, kein
  Sonderregime (Fristbeginn-Gate = Hinweis, kein Rechenregime).
  → Tagerechner-Preset mit Beginn-Notiz.
- *Inverzugsetzung* — Karten-Dublette der Mahnung (dasselbe Schreiben,
  Art. 102 OR). → Variante der Mahnungs-Vorlage.

**BLEIBT mit verifiziertem Eigen-Regime (Auswahl):** BGG-Fristen
(Art. 46 BGG eigener Stillstand + Ausnahmenkatalog) · Verwaltungs-/
Steuerverfahren (Art. 22a VwVG Stillstand nur Tagesfristen) ·
Sozialversicherung (Art. 38 Abs. 4 ATSG: Stillstand auch für
MONATS-Fristen — breiter als VwVG!) · strafrechtliche Verjährung
(Art. 97 ff. StGB strafrahmenabhängig, eigene Beginn-/Ruhensregeln).

**NACHVERIFIZIERT (7.6.2026 abends, Fedlex-Volltext):**
- *Markenwiderspruch* GESTRICHEN — MSchG 31 III: 3 MONATE ab
  Veröffentlichung; Art. 22a VwVG greift nur für TAGES-bestimmte
  Fristen → KEIN Stillstand; nicht erstreckbar, Weiterbehandlung
  ausgeschlossen (41 IV lit. c). → Tagerechner-Preset (Monatsfrist).
  ⚠ Fach-Falle für später: NIE die VwVG-Stillstand-Logik anwenden.
- *steuer-verjaehrung* BLEIBT (Korrektur der Erst-Triage!) — DBG 120/121
  verbatim: relativ 5 J. + ABSOLUT 15/10 J., abschliessende Stillstands-
  (Abs. 2) und NEUBEGINN-Gründe (Abs. 3); StHG 47 harmonisiert. Eigenes
  Regime, getrennt vom Verfahrensfristen-Rechner (§4).

**OFFEN (Regime-Recherche vor Bau/Streichung):** vergabe-fristen (22a II
VwVG nimmt Beschaffungen vom Stillstand AUS; kantonale IVöB-Lage) ·
baurecht-fristen (kantonale Sonderstillstände?) · schadenszins als
Verzugszins-Preset? · ferien-checker in ferien-assistent falten?

---

## Zivilprozess (ZPO) & Bundesgericht
**Rechner:** Verfahrens- & Rechtsmittelfristen `[live]` · Fristwiederherstellung · Beschwerde ans Bundesgericht · Streitwert · Gerichts-/Partei-/Betreibungskosten (kantonal) · Bundesgerichtsgebühren (BGer/BVGer/BStGer/BPatGer) · Kostenvorschuss · Sicherheit für die Parteientschädigung · Gerichtsstand (Zivil) · sachliche Zuständigkeit & Verfahrensart · Schlichtungspflicht · Rechtsmittelprüfung
**Vorlagen:** Schlichtungsgesuch · Klage (vereinfachtes Verfahren)

## Betreibung & Konkurs (SchKG)
**Rechner:** Betreibungs- & Konkursfristen `[live]` · Rechtsöffnungs-/Aberkennungs-/Kollokationsfristen · Arrest-Prosequierungsfristen · Existenzminimum & Pfändungsquote · Betreibungskosten
**Vorlagen:** Rechtsvorschlag · Rechtsöffnungsbegehren · Aberkennungsklage `[Gerüst]` · Arrestgesuch `[Gerüst]` · Beschwerde gegen Betreibungs-/Konkursämter `[Gerüst]`

## Arbeit (Arbeitsrecht)
**Rechner:** Kündigungs- & Sperrfristen `[live]` · Lohnfortzahlung (kantonale Skalen) `[live]` · Ferienanspruch · Ferienkürzung · anteiliger 13. Monatslohn · Überstunden- & Überzeitzuschlag · arbeitsrechtliche Entschädigungen & Zuschläge · Anfechtung missbräuchlicher Kündigung (Frist) · Massenentlassung (Konsultationsfristen)
**Vorlagen:** Arbeitsvertrag · Kündigung Arbeitgeber · Kündigung Arbeitnehmer `(free)` · Freistellung `[Gerüst]` · Verwarnung `[Gerüst]` · Arbeitszeugnis `[Gerüst]` · Aufhebungsvereinbarung `[Gerüst]`

## Miete (Mietrecht)
**Rechner:** Kündigung & Fristen im Mietrecht `[live]` · mietrechtliche Anfechtung & Erstreckung (Fristen) · Mietzinsanpassung (Referenzzins/Teuerung/Kosten)
**Vorlagen:** Mietvertrag (Wohnen)

## Vertrag & Forderung (OR)
**Rechner:** Verzugszins `[live]` `(free)` · Schadenszins (§0: evtl. Verzugszins-Preset, offen) · Verjährung `[live]` · Gewährleistung & Mängelrüge `[live]` — ~~Widerrufsrechte/Konsum~~ §0-gestrichen (Art. 40e II OR: 14 T. fix → Tagerechner-Preset)
**Vorlagen:** Darlehensvertrag · einfacher Kaufvertrag · Mahnung `(free)` (inkl. Variante Inverzugsetzung — Dublette §0-aufgelöst) · Schuldanerkennung · Vergleichsvereinbarung `[Gerüst]`

## Erbrecht
**Rechner:** Pflichtteil & verfügbare Quote `[live]` · Ausgleichung · Ausschlagung/Herabsetzung/Ungültigkeit (Fristen)
**Vorlagen:** Eigenhändiges Testament `(free)` · Öffentliches Testament `[Beurkundung]` · Erbvertrag `[Beurkundung]` · Erbverzichtsvertrag `[Beurkundung]` · Erbteilungsvereinbarung `[Gerüst]`

## Vorsorge & Erwachsenenschutz
**Rechner:** — (Nachlass-/Pflichtteilsplanung über den Erbrechts-Rechner)
**Vorlagen:** Vorsorgeauftrag `(free)` · Patientenverfügung `(free)` · Vollmacht (Anwalt · General · Spezial, EINE Maske) `[live]` `(free)`

## Familienrecht
**Rechner:** güterrechtliche Auseinandersetzung / Vorschlag · Vorsorgeausgleich (BVG) · familienrechtliche Fristen
**Vorlagen:** Trennungsvereinbarung `[Gerüst]` · Scheidungskonvention `[Gerüst]` · Elternvereinbarung `[Gerüst]`

## Gesellschaftsrecht
**Rechner:** Beteiligungs- & Stimmrechtsquoten · Liberierungsgrad · Kapitalverlust · Überschuldung · Kapitalerhöhung · Anfechtung von Gesellschaftsbeschlüssen (Frist) · Einberufungs- & Verantwortlichkeitsfristen
**Vorlagen:** GmbH-Gründung `[Beurkundung]` · AG-Gründung `[Beurkundung]` · Statuten · GV-/VR-Beschluss

## Strafrecht & Strafprozess (StGB/StPO)
**Rechner:** strafrechtliche Verjährung (Art. 97 ff. StGB, eigenes Regime) · örtliche Zuständigkeit im Strafverfahren `[live]` — ~~Strafverfahrens-/Haft-/Strafantragsfristen~~ §0-gestrichen (Art. 89 II StPO: keine Gerichtsferien → Tagerechner-Presets)
**Vorlagen:** Strafanzeige · Strafantrag · Einsprache gegen Strafbefehl · Akteneinsichtsgesuch · Entschädigungsbegehren `[Gerüst]` · Adhäsionsklage `[Gerüst]`

## Verwaltungsrecht
**Rechner:** Verwaltungsfristen (VwVG) · bau-/planungsrechtliche Fristen · vergaberechtliche Beschwerdefristen
**Vorlagen:** Einsprache (Verwaltung) · Rekurs `[Gerüst]` · Beschwerde

## Steuerrecht
**Rechner:** Steuerfristen · steuerrechtliche Verjährung · Verrechnungssteuer · Grundstückgewinn- & Handänderungssteuer (kantonal)
**Vorlagen:** —

## Sozialversicherungsrecht
**Rechner:** ATSG-Fristen · Leistungsverwirkung / Nachzahlung · AHV-Beiträge
**Vorlagen:** —

## Datenschutzrecht
**Rechner:** datenschutzrechtliche Fristen
**Vorlagen:** Auskunftsbegehren · Löschungsbegehren

## Ausländerrecht
**Rechner:** ausländer-/asylrechtliche Fristen
**Vorlagen:** —

## Weitere Rechtsgebiete
- **Immaterialgüterrecht** — ~~Markenwiderspruch~~ §0-gestrichen (MSchG 31 III: 3 Monate, KEIN 22a-Stillstand [monatsbestimmt!] → Tagerechner-Preset)
- **Sachenrecht** — ~~Bauhandwerkerpfandrecht~~ §0-gestrichen (Art. 839 II ZGB: 4 Monate fix → Tagerechner-Preset)
- **Übergreifend** — Rechner: Klagebewilligung (Geltungsdauer)

## Übergreifende Werkzeuge (keinem Rechtsgebiet zugeordnet)
Fristen- & Tagerechner `(free)` · Gerichts- & Betreibungsferien-Checker · Friststillstand- & Ferien-Assistent · Teuerungsrechner `(free)` · Checklisten · Mandatsaufnahme-Formular · Kostenblatt-Export

---

## Backlog (Ermessen — bewusst nicht im Katalog)
Kindes-/Ehegattenunterhalt · Bonus-Qualifikation · Mietzinsherabsetzung bei Mängeln · Konventionalstrafe-Herabsetzung · UVG-/IV-Leistungsbemessung · Schadenersatz/Genugtuung · Geldstrafen-Tagessatz · Konkurrenzverbot-Zulässigkeit
