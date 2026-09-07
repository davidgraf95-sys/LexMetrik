# Design-Identität, Nicht-KI-Webdesign, Bildschirm-Lesbarkeit — Fremdagenten-Recherche 5./6.9.2026

**Erstellt:** 6.9.2026, Synthese-Session · **Anlass:** W2·24-DESIGN-IDENTITAET — drei
Recherche-Aufträge parallel an Gemini und Sonnet (Fremdagenten-Vergleich, Skill `auftrag`
Ziff. 6b), plus Davids Chat-Entscheide zu Farbe/Zielbild/Lesekomfort. **Status: einfach
belegt je Aussage (Quellenangabe pro Absatz)**, keine eigene Nachprüfung der Web-Fundstellen
in dieser Synthese-Session — vor Bau-Übernahme einzelner Werte gegen die Primärquelle
gegenprüfen (§7), insbesondere wo unten «unklar» oder «Divergenz» steht.

**Bau-Kontext (Davids Entscheide, wörtlich zitiert):**
- 5.9.2026: **«ich öffne alles»** — Council-Schalter V3 offen, alle drei Recherchen sind
  ergebnisoffen beauftragt.
- 6.9.2026: Freigabe Zielbild **«Sammlung»**.
- 6.9.2026: **«mach die farben eine stufe kräftiger»**, **«eventuell dezenter rot
  einsetzen»**.
- 6.9.2026: Freigabe Startseite **«Pult»** (R10, `scratchpad/pult-freigegeben.html`).
- 6.9.2026: Lesekomfort-Auftrag — **«in der alten version besser lesen … kontraste»**
  (D12, `w224-pruef-r2-funde.md` Abschnitt «D12»).

Diese Entscheide sind der Massstab, an dem die drei Recherchen unten zu lesen sind — die
Recherchen liefern Belege/Optionen, nicht den Entscheid selbst.

---

## 1. Design-Identität (Paletten, OFL-Schriften, Amts-Vorbilder)

**Auftrag:** Farb- und Schrift-Identität für ein Schweizer Rechtsportal finden, das sich
bewusst von KI-generierten Kanzlei-Templates (Creme/Gold, weiche Schatten) abgrenzt und auf
Amtlichkeit/Klarheit setzt.

**Quelle + Stand:**
- Gemini, 5.9.2026 (`scratchpad/agy-design-w224.json`, Feld `response`) — alle Aussagen mit
  Quelle+Abrufdatum+Status «belegt» versehen: Swiss Confederation Designsystem
  (github.com/swiss/designsystem), WebAIM-Kontrastrechner, Wikipedia International
  Typographic Style, Google Fonts (Inter/Lora/Public Sans/Merriweather), IBM Plex, Fedlex,
  admin.ch, legislation.gov.uk, bger.ch, sbb.ch, eur-lex.europa.eu, shadcn/ui-Themes
  (als Beobachtung von KI-Standard-Outputs).
- Sonnet: **keine Datei — in der Haupt-Session selbst erhoben**, nicht als eigenständiger
  Unteragenten-Lauf mit Transkript vorhanden. Dieser Abschnitt stützt sich daher allein auf
  die Gemini-Rückgabe; ein Sonnet-Gegencheck zu Paletten/OFL-Schriften steht aus.

**Regel deterministisch (abgeleitete Bau-Regeln):**
- Drei Palettenvorschläge, alle mit selbst gerechnetem Kontrastverhältnis (Tinte auf Papier
  14,5–17,6:1, Akzent auf Papier 4,86–6,3:1 — je AA/AAA je nach Verwendung): «Bundes-Standard»
  (Reinweiss/#1A1A1A/Schweizer Rot #DC0018), «Kantonale Nüchternheit» (#F8F9FA/#212529/Behörden-
  Blau #005A9C), «Alpine Sachlichkeit» (#FCFCFC/#0F172A/Teal #0F766E). Keine der drei enthält
  Creme/Gold.
- Schrift-Paarungen (UI-Grotesk + Lesetext-Serife), alle OFL/Open Source: Inter+Lora,
  Public Sans+Merriweather, IBM Plex Sans+IBM Plex Serif.
- Amts-Vorbilder mit konkretem Übernahme-Punkt: Fedlex (Tree-View, semantische Struktur),
  admin.ch/Designsystem Bund (Akzentfarbe sparsam, kaum Border-Radius), legislation.gov.uk
  («digitales Papier», hoher Kontrast, grosse Schrift), Bundesgericht (Verzicht auf
  Marketing-Elemente), SBB (striktes Raster, Whitespace statt Rahmenlinien), EUR-Lex
  (Farbcodierung für Fassungsstand, Sprachsynchronisation).
- Anti-Pattern-Liste KI-generierter Kanzleiseiten: Geist+verspielte-Serife-Mix, runde Karten
  mit weichen Schatten (Radius 12–16 px + Glow), Versal-Overlines in Akzentfarbe, Bento-Grids/
  Glassmorphismus, gedämpfte Kontraste (grau auf beige) trotz WCAG-Risiko.

**Geltung/Ausnahmen:** Die drei Paletten sind Optionen, kein Entscheid — LexMetrik führt
bereits ein eigenes Token-System (Papier/Tinte/Brass, `.claude/rules/design.md`), das seit
Startseite-V3 (`recherche/startseite-v3-design.md`) und R10/«Pult» weiterentwickelt wird;
diese Recherche liefert zusätzliche externe Vergleichspunkte, ersetzt aber keinen bereits
getroffenen Token-Entscheid. Die Anti-Pattern-Liste (Creme/Gold, Bento, Glow) deckt sich mit
Davids eigenem Befund «alte Version besser» (D12) nur teilweise — Gemini nennt Creme/Gold
explizit als zu vermeiden, während D12 die vormalige warme Papierfarbe gerade als lesbarer
belegt (Abschnitt 3 unten). Das ist kein Widerspruch: warmes, leicht getöntes Papier
(#FAF7F2) ist nicht dasselbe wie ein Creme/Gold-Boutique-Farbschema (Brass/Gold-Akzente) —
LexMetrik hat den Gold-Akzent bereits verworfen (R3-F2, `w224-pruef-r2-funde.md`), das warme
Papier bleibt als Lesbarkeits-Massnahme separat zu beurteilen.

**Pflegebedarf:** Keiner automatisiert — reine Konzeptquelle. Bei Palettenwahl gegen
`.claude/rules/design.md` + `check:farbwelt`/`check:design-tokens` abgleichen.

**Abnahme-Status:** Entscheid David, Bau W2·24. Diese Recherche ist Rohmaterial, keine
bindende Wahl — bindend ist, was tatsächlich in die Design-Tokens einfliesst und von David
abgenommen wird.

---

## 2. Nicht-KI-Webdesign (Merkmale, Gegenmittel, Referenzseiten, Typografie)

**Auftrag:** Merkmale, an denen man KI-generiertes Webdesign erkennt, Gegenmittel (Craft/
Editorial/Swiss Style), gelobte Referenzseiten, Typografie-Empfehlungen für lange Rechtstexte.

**Quelle + Stand:**
- Gemini, 5.9.2026 (`scratchpad/agy-nichtki.json`) — 10 KI-Merkmale + 10 Gegenmittel je mit
  Sammelquelle (Smashing Magazine, It's Nice That, UX Collective) und Status «belegt» ohne
  Einzel-URL je Punkt; 5 Referenzseiten mit URL (legislation.gov.uk, gov.uk Design System,
  Wikipedia-Redesign 2023, **NZZ**, Fedlex) — NZZ und Fedlex hier nur mit Bare-URL, ohne
  Fundstelle zur konkreten Behauptung («Erstklassigkeit durch Serifen» bleibt unbelegt);
  Typo-Empfehlungen mit Quelle Butterick's Practical Typography.
- Sonnet, 5./6.9.2026 (Session-Unteragent, Task-ID `a8b4b78ed7bae710a`, Transkript
  `agent-a8b4b78ed7bae710a.jsonl`, 44 Zeilen; extrahiert per Skript aus der letzten
  `assistant`-Nachricht) — 15 KI-Merkmale + 15 Gegenmittel, jede Zeile mit Einzelquelle
  (dev.to/alanwest, 925studios.co, Shuffle.dev, Wikipedia:Signs of AI writing,
  practicaltypography.com, design-system.service.gov.uk, nngroup.com); 5 Referenzseiten mit
  URL und explizitem Übernahme-Punkt; eigener Abschnitt «Offen/unklar» (Wikipedia-2023-Detail
  nicht gegengeprüft, **Creme/Gold als KI-Signal nicht gefunden** — nur Indigo/Violett-
  Gradient belegt, NZZ/Fedlex/Duden/Are.na/Typotheque/Readymag nicht mit eigener Quelle
  geprüft).
- Kennzahlen (Skill `auftrag` Ziff. 6b): Sonnet 35 849 Token / 125 s laut Auftragsvorgabe.

**Regel deterministisch (abgeleitete Bau-Regeln):**
- KI-Signale zu vermeiden: Gradient-Hero (Indigo/Cyan), Glassmorphism/Neon-Glow,
  Drei-Spalten-Feature-Kacheln als Standardlayout, «Inter überall», durchgängig runde Ecken,
  Motion ohne Absicht, Dark-Mode-Reflex, «AI slop»-Copy (Blähwörter, «not just X but Y»,
  «boasts a», vage Autoritätsberufung, Formel-Fazit-Absätze).
- Gegenmittel: bewusste Layout-Constraints statt vager Prompts, Swiss/International
  Typographic Style (striktes Grid, eine Schriftfamilie, linksbündig, Hierarchie über Grösse/
  Gewicht statt Farbe), Weissraum als Struktur nicht Lückenfüller, direkte Verben statt
  Umschreibungen, Sticky-ToC nur ohne Kollision mit Hauptnavigation, Marginalien als
  eigenständiges Druck-Pattern.
- Referenzseiten mit konkretem Übernahme-Punkt (Sonnet, mit URL): legislation.gov.uk
  (grössere Lesegrösse statt Verlauf/Bevel), GOV.UK Design System (eine Typoskala, eine
  Schrift), Wikipedia Vector 2022/2023 (begrenzte Zeilenbreite, ToC-Nutzung +45 % — Detail
  nicht selbst geprüft), Wikipedia:Signs of AI writing (Negativ-Checkliste für eigene Texte),
  NN/g ToC-Guide.
- Typo für Rechtstext: Zeilenlänge 45–90 Zeichen, Oldstyle-Ziffern im Fliesstext/tabellarisch
  nur in Tabellen, Serife mit Optical-Size-Achse (Source Serif 4, Newsreader, Spectral als
  Sonnet-Kandidaten — Literata separat in Abschnitt 3 vertieft).

**Geltung/Ausnahmen — Divergenz Sonnet/Gemini:**
- **Inter:** Gemini führt Inter in Design-Identität (Abschnitt 1) als Empfehlung für UI-
  Grotesk («sehr neutral, exzellente Lesbarkeit»); Sonnet führt «Schriftart praktisch immer
  Inter» in dieser Recherche explizit als **KI-Verwechslungssignal** (dev.to/alanwest). Beide
  Aussagen sind mit Quelle belegt und schliessen sich nicht gegenseitig aus — Inter ist
  neutral UND so verbreitet, dass sie als KI-Signal gelesen wird; für LexMetrik heisst das:
  Inter ist keine falsche Wahl, aber keine identitätsstiftende — wo eine erkennbare eigene
  Identität gewollt ist (Davids Zielbild «Sammlung»), spricht das gegen Inter als Leitschrift.
- **Creme/Gold als KI-Signal:** von Gemini in Design-Identität als Anti-Pattern behauptet
  («gedämpfte Kontraste … mag edel wirken»), von Sonnet in dieser Recherche ausdrücklich als
  **unbelegt** vermerkt («Keine Quelle explizit zu Creme/Gold … gefunden»). Für den Bau
  massgeblich: die Sonnet-Einschätzung, weil sie den fehlenden Beleg offenlegt statt ihn zu
  behaupten (§7-Grundsatz «verifizieren, nicht vertrauen»).
- **NZZ/Fedlex als Referenz:** Gemini nennt beide mit URL und Kurzbehauptung («Erstklassigkeit
  durch Serifen», «reine Dokumentenstrukturierung»), ohne Fundstelle zur konkreten Behauptung;
  Sonnet hat beide in seiner Runde nicht selbst mit Quelle geprüft und vermerkt das offen.
  Beide Fedlex-Nennungen (Design-Identität + hier) sind also **unabgeglichen belegt** — vor
  Übernahme als Referenz eine eigene kurze Sichtung von fedlex.admin.ch nachholen.

**Pflegebedarf:** Keiner automatisiert. Bei Copy-Texten gegen die Sprach-Diät-Runde R7
(`w224-pruef-r2-funde.md`) abgleichen — die dort erwähnte Wikipedia-Liste «Signs of AI
writing» ist dieselbe Quelle wie hier.

**Abnahme-Status:** Entscheid David, Bau W2·24.

---

## 3. Bildschirm-Lesbarkeit (Kontrast, Halation, Polarität, opsz, Gewicht, Werte)

**Auftrag:** Belege für D12 «Lesekomfort» — warum Maximalkontrast schwarz/weiss am
Bildschirm ermüdet und welche Token-Werte (Papier/Tinte, Schriftgewicht, opsz) das beheben.

**Quelle + Stand:**
- Gemini, 6.9.2026 (`scratchpad/agy-lesbarkeit.json`) — Halation/APCA (Andrew Somers,
  github.com/Myndex/SAPC-APCA), Positive-Polarity-Studie Piepenbrock/Buchner
  (pubmed.ncbi.nlm.nih.gov/24085816), Google-Fonts-Glossar (weight, optical_size),
  Butterick line-length, Literata/Newsreader/Source-Serif-4-Spezimen, NN/g dark-mode-Artikel —
  alle mit Status «belegt», eine Zeile («Laufweite im Dunkelmodus erhöhen») ausdrücklich als
  «unklar / Praxis-Erfahrungswert» markiert.
- Sonnet, 6.9.2026 (Session-Unteragent, Task-ID `a81b0d60468a9ad8a`, Transkript
  `agent-a81b0d60468a9ad8a.jsonl`, 58 Zeilen; extrahiert aus letzter `assistant`-Nachricht) —
  12 Einzelbelege je mit Primärquelle und teils **selbst nachgerechnetem** WCAG-Kontrast
  (GOV.UK 19,59:1, Wikipedia 16,13:1, NYT ≈12,08:1 — NYT-Hex nur aus Sekundärquelle, explizit
  «nicht primär verifiziert»); konkreter Zahlenvorschlag für Hell/Dunkel-Token; Abschnitt
  «Offene Punkte» mit 5 benannten Lücken.
- Kennzahlen: Sonnet 45 162 Token / 167 s laut Auftragsvorgabe.

**Regel deterministisch (die D12-Token-Werte, siehe `w224-pruef-r2-funde.md` Abschnitt
«D12» für den vollständigen Bau-Auftrag):**
- Maximalkontrast (~17:1, reines #000/#FFF) erzeugt Halation/Überstrahlung am Leuchtdisplay
  (APCA/Somers); Zielband für Langlese-Fliesstext ≈ 12–15:1 statt Maximum.
- Positive Polarität (dunkel auf hell) bleibt Standard — Piepenbrock/Buchner 2013 belegt sie
  gegenüber Dunkelmodus als Default, unabhängig vom Kontrastwert innerhalb des Zielbands.
- Leicht getöntes, warmes Papier (Gemini: #FCFAF6, Sonnet: #FAF7F2) senkt Blendung ohne
  Polaritäts-Verlust; Dunkelmodus nie Reinschwarz/Reinweiss.
- Token-Vorschlag Sonnet (selbst berechnet): Hell `--paper` #FAF7F2 / `--ink-900` #262320
  (14,6:1) / Sekundär `--ink-600` #5C5648 (6,8:1); Dunkel `--paper` #1B1917 / `--ink-900`
  #E4E0D8 (13,3:1) / Sekundär #A79E8C (6,6:1). Gemini nennt für Hell #FCFAF6/#1C1A15 (15,6:1)
  bzw. alternativ #F7F6F3/#222222 (13,3:1), für Dunkel #1A1A1A/#D4D4D4 (10,9:1) — beide Sätze
  liegen im selben Zielband, die konkreten Hex-Werte weichen aber leicht ab (Bau übernimmt
  die Sonnet-Werte, weil D12 diese bereits als Bau-Auftrag referenziert).
- Serifen am Bildschirm brauchen die opsz-Achse geladen (`font-optical-sizing: auto`) und
  etwas mehr Gewicht (450–500 statt 400), sonst «fressen» feine Striche weg (beide Quellen
  einig); Sonnet zusätzlich: prüfen, ob LexMetrik aktuell eine statische oder variable
  Font-Instanz lädt — das ist nur im Code, nicht per Web-Recherche zu klären.
- Zeilenlänge 60–75 Zeichen, Zeilenhöhe 1,5–1,7 (Sonnet-Konsens aus Sekundärquellen mit
  NN/g-Bezug — NN/g-Primärquelle selbst nicht direkt verifiziert, offen).

**Geltung/Ausnahmen:** Beide Agenten sind sich in der Kernaussage einig (reduzierter statt
maximaler Kontrast, warmes Papier, opsz+Gewicht) — keine Sachverhalts-Divergenz, nur
Hex-Wert-Rundungsunterschiede (s. o.). Ausnahme ausdrücklich benannt (Sonnet): GOV.UK und
Wikipedia widersprechen der «weniger Kontrast»-These für ihren eigenen Anwendungsfall
(Nachschlagen statt Langlesen) — die D12-Empfehlung gilt spezifisch für Langlese-Fliesstext
(Gesetzes-/Urteilslektüre im Leser), nicht als App-weite Universalregel; Übersichts-/
Navigationstext kann höheren Kontrast behalten. Kein A/B- oder Eyetracking-Beleg speziell für
juristische Referenztexte gefunden (Sonnet) — alle zitierten Studien betreffen allgemeines
Lesen/Proofreading/redaktionelle Texte.

**Pflegebedarf:** Bei Umsetzung `check:farbwelt` (Kontrastleiter + Registerfarben neu messen,
≥ 4.5 durchgängig), `check:design-tokens`, `leser-typo-tokens` (Tor deklarieren, noch nicht
gebaut lt. D12) und `check:perf-budget` (opsz-Achse +~58 KB) nachziehen — alle vier bereits
in D12 als Bau-Folge benannt.

**Abnahme-Status:** Entscheid David, Bau W2·24. D12 ist der bindende Bau-Auftrag; diese
Datei liefert dessen Quellen-Provenienz.

---

## Recherche-Vergleich Sonnet vs. Gemini (Zusammenfassung)

| Runde | Sonnet | Gemini | Befund |
|---|---|---|---|
| Nicht-KI-Webdesign | 35 849 Token / 125 s, 15+15 Punkte je mit Einzelquelle, offener Unklar-Abschnitt | Dauer unbekannt, 10+10 Punkte mit Sammelquelle statt Einzelbeleg, keine Unklar-Kennzeichnung | Sonnet feinkörniger belegt und ehrlicher über Lücken (Creme/Gold unbelegt vermerkt statt behauptet) |
| Bildschirm-Lesbarkeit | 45 162 Token / 167 s, 12 Punkte inkl. selbst nachgerechneter WCAG-Werte, 5 offene Punkte benannt | Dauer unbekannt, dieselben Kernstudien (Piepenbrock/Buchner, APCA), ein Punkt selbst als «unklar» markiert | Beide inhaltlich deckungsgleich (kein Sachverhaltsstreit), Sonnet mit mehr Eigenrechnung/Primärquellen-Traceability |
| Design-Identität | n/a — kein separater Unteragenten-Lauf, nur Haupt-Session-Wissen | Dauer unbekannt, 3 Paletten + 3 Schriftpaarungen + 6 Amts-Vorbilder, alle Status «belegt» | Kein Vergleich möglich; Gemini-Aussagen hier ungegengeprüft — Divergenz zur Sonnet-Nicht-KI-Runde bei «Inter» und «Creme/Gold» einzeln in Abschnitt 2 aufgelöst |
