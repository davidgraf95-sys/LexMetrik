# Design-Reglement (Dach) — die site-weiten Gestaltungsregeln von Lexmetrik

Stand: 25.6.2026 (Auftrag David: «die Erkenntnisse aus der Legal-Design-
Recherche sollen ins Projekt einfliessen — daraus Design-Regeln erstellen, die
für die ganze Webseite gelten»). Geltungsbereich: **die gesamte Webseite** —
jede Seite, jede Komponente, jeder generierte Text, jeder Output.

Dieses Reglement ist die **Dach-Schicht** über den drei domänenspezifischen
Reglementen. Die hängen darunter und konkretisieren es für ihren Bereich:

- `DESIGN-REGLEMENT-RECHNER.md` — Aufbau jeder Rechner-/Engine-UI
- `DESIGN-REGLEMENT-RECHTSPRECHUNG.md` — Schriftbild der Entscheid-Anzeige
- `DESIGN-REGLEMENT-VORLAGEN.md` — Schriftbild der Dokument-Outputs
- `DESIGN-REGLEMENT-NORMTEXT.md` — Gesetzesdarstellung (≥ Fedlex-Fundiertheit)

Bei Konflikt gewinnt das speziellere Reglement *innerhalb seiner Domäne*; alles
andere folgt diesem Dach. Neue Domänen-Reglemente verweisen zurück hierher.

**Das Verbindliche ist der Code.** Tokens leben in `src/index.css` (`:root`,
«Designsystem §2») und `tailwind.config.js` (Typo-Skala, Farben, Raster, Radien,
Motion). Dieses Reglement **erfindet keine neuen Magic-Numbers** — es bindet an
die bestehenden Tokens und hält das *Warum* + die Soll-Werte fest.

---

## Woher die Regeln kommen (Evidenzlage)

Grundlage ist eine doppelt-verifizierte Recherche (25.6.2026, 22 Quellen,
adversarial gegengeprüft — 25/25 Claims bestätigt). Tragende Quellen:

- **Margaret Hagan, *Law By Design* / Stanford Legal Design Lab** — 6 Kern-
  prinzipien, Design-Haltungen (Users at the Center, Going Visual, Build to
  Think). [lawbydesign.co, law.stanford.edu/legal-design-lab]
- **Martinez/Mollica/Gibson 2024 (MIT TedLab, ~225 Mio.-Wörter-Korpus) +
  Masson & Waldron 1994** — *empirisch* belegte, behebbare Verständlichkeits-
  Hemmer; Nutzen für Laien **und** Juristen. [tedlab.mit.edu, Wiley acp.2350080107]
- **Arbel & Becher 2024 (J. Empirical Legal Studies)** — Lesbarkeits-Formeln
  sind unzuverlässig/manipulierbar (bis 4,6 Schuljahre Differenz). [Wiley jels.12400]
- **Passera/Haapio/Barton + WorldCC Contract Design Pattern Library** — Muster
  für verständliche Verträge. [contract-design.worldcc.foundation]

**Ehrlicher Vorbehalt (gilt für das ganze Reglement):** Fast alle *empirischen*
Belege stammen aus dem US-/englischsprachigen Raum. Die Übertragung auf das
Schweizer DE/FR/IT-Recht ist **plausible Inferenz, nicht direkt getestet** —
deutsche Rechtssprache hat eigene Hemmer (Komposita, Nominalstil), die nicht
untersucht wurden. Die *Prinzipien* (Hierarchie, Visualität, Aktiv-Sprache,
Quellentransparenz) sind übertragbar; bei DACH-spezifischen Detailentscheiden
gilt: im Zweifel an echtem Verständnis prüfen, nicht aus US-Daten ableiten.
Schliessen der Lücke = eigener Folge-Auftrag (CH/Fedlex-fokussierte Recherche).

---

## A · Sprache & Verständlichkeit (härteste Evidenz)

Gilt für **jeden Text**, den Lexmetrik produziert oder anzeigt: UI-Microcopy,
Erklärtexte, Tooltips, generierte Verträge/Vorlagen, Verdikte, Fehlermeldungen.

**A1 — Schachtelsätze auflösen.** Keine zentralen Einbettungen (eine Klausel,
die Subjekt und Verb/Objekt auseinanderreisst). Subjekt–Verb–Objekt zusammen-
halten; Einschübe in eigene Sätze auslagern. *(Stärkster Einzelbefund: center-
embedding ist der messbar grösste Verarbeitungs-Hemmer, Martinez 2024.)*

**A2 — Aktiv, kurz, ohne Versalienblock.** Aktiv statt Passiv. Lange Sätze
teilen. **Kein ALL-CAPS-Fliesstext** — Versalien nur als kurze Overline/Label
(`text-overline`-Token). Fachjargon nur mit Erklärung beim ersten Auftreten
(Tooltip/Klammer/Glossar), nicht unerklärt.

**A3 — Klarheit ist Qualität, kein Laien-Rabatt.** Verständliche Sprache nützt
Fach **und** Laie; Juristen lehnen Legalese selbst ab und bewerten klare
Verträge als gleich durchsetzbar, aber besser (PNAS 2023). → Verständlichkeit
gegenüber der anwaltlichen Zielgruppe **nicht** als Qualitätsverlust behandeln.
Kein doppeltes Schreiben («Fachversion» vs. «Laienversion») als Ausrede für
unklare Fachtexte — Klarheit gilt für beide.

**A4 — Kein Lesbarkeits-Score als Gütesiegel.** Lexmetrik zeigt **keine**
Flesch-/Grade-Level-Scores als Verständlichkeits-Beweis an (Formeln sind
manipulierbar, Arbel 2024). Wenn Verständlichkeit belegt werden soll, dann über
echtes Verständnis (Nutzertest/Paraphrase), nie über eine Formel.

**A5 — Verständlichkeit strukturell, nicht deklarativ.** Kein «einfach erklärt»-
Etikett ohne dass die Struktur es einlöst. Top-down-Versprechen wirken nachweis-
lich kaum (Martinez 2024) — die Vereinfachung gehört in die Generatoren/Templates
und Komponenten, nicht aufs Label.

---

## B · Informations-Darstellung (Hierarchie & Visualität)

Gilt für die Darstellung von Gesetzen, Normtexten, Rechtsprechung, Rechner-
Ergebnissen und allen längeren Inhalten.

**B1 — Verdikt zuerst, Herleitung auf Abruf.** Die Kernaussage/das Resultat
steht oben; Begründung und Detail sind aufklappbar/darunter. *(Hagan: «Bird's
Eye View that Swoops In»; deckt sich mit der Rechner-Leitidee, hier site-weit
hochgezogen.)*

**B2 — Feste Typo-Skala, gesetzte Lesespalte.** Nur die Skala aus
`tailwind.config.js` (micro · xs · body-s · base · body-l · h3 · h2 · h1 ·
display). **Nicht** die Tailwind-Defaults `text-sm`/`text-lg` (fremde Zeilen-
höhen) und **keine** Arbitrary-Sizes `text-[…px]`. Langer Fliesstext bekommt
eine bewusste Lesespalte (`max-w-reading` ≈ 40rem); volle Fensterbreite für
Fliesstext ist verboten. *(Die typografisch schwachen amtlichen Anzeigen
(bger.ch: Times, volle Breite) sind genau der leicht erreichbare Vorsprung.)*

**B3 — Klare visuelle Hierarchie, ein Icon-System, vier Status-Familien.**
Inhalt scanbar gliedern (Überschriften-Hierarchie, Abstand, nicht Textwüste).
Icons/Symbole **zusätzlich** zum Text (nie als alleiniger Bedeutungsträger).
Genau **ein** Icon-Set. Status ausschliesslich über die vier definierten
Familien `sage/slate/warn/danger` — **keine** Ad-hoc-Farben (`text-red-…`,
`bg-green-…`, Hex in className).

**B4 — Prozesse als Pfad visualisieren.** Verfahrenswege (Vertragsabschluss,
Rechtsweg, Beurkundung), Rechner-Logik und Wizards als sichtbarer Schritt-für-
Schritt-Pfad mit Start-/Endpunkt (Hagans Brettspiel-Metapher) — nicht als
Prosa-Absatz. Stepper/Journey vor Fliesstext.

---

## C · Produkt-UX (Hagans Prinzipien, site-weit)

**C1 — Überblick → Drilldown durchgängig.** Vom Cockpit/Startseite führt jeder
Pfad per Drilldown ins Detail und wieder zurück; nie eine Sackgasse, nie ein
Detail ohne Kontext-Anker.

**C2 — Simpel vorne, smart hinten.** Komplexe Logik (Tarife, Normketten) bleibt
hinten; die Oberfläche bleibt simpel. Konkret: **ein leeres Formular zeigt keine
Fehler** — Validierung erst nach erster Eingabe/Interaktion (Davids Grundsatz,
hier verbindlich für die ganze Seite).

**C3 — Den Nutzer befähigen.** UI macht den Nutzer schlauer: «Worum geht es →
was gebe ich ein → was gilt → **warum** gilt es → was nehme ich mit». Der
Warum-Layer (Norm, Herleitung) ist überall erreichbar, nicht nur das Resultat.

**C4 — Modi statt Einheitszwang.** Wo sinnvoll mehrere Sichten/Modi anbieten
(nüchtern ↔ modern, Hell/Dunkel; perspektivisch Fach ↔ Laie) statt eine
erzwungene Darstellung.

---

## D · Vertrauen & Quellentransparenz

**D1 — Jeder Rechtswert mit Norm + Link + Stand.** Jede angezeigte rechtliche
Zahl/Aussage trägt ihren Normbezug (Artikel/§), eine Quelle/einen Link und den
Stand/das Datum. Verbindlich site-weit (deckt Davids Daueranweisung «jeden Wert
mit konkreter Norm + Link + Stand»). Trust entsteht aus Belegbarkeit.

**D2 — Konsistenz als Trust-Signal.** Ein einheitliches Interface signalisiert
Sorgfalt. Darum: **keine Magic-Numbers**, keine Ad-hoc-Abstände/-Farben/-Grössen
in Komponenten — alles über Tokens. Inkonsistenz liest sich als Nachlässigkeit
und untergräbt das Vertrauen ins juristische Produkt.

**D3 — Ehrlich über Stand und Unsicherheit.** Status-Marker (`recherche` /
geprüft) bleiben sichtbar; nichts wird als «geprüft» dargestellt, was es nicht
ist (Lernphase-Strategie bis zur Abnahme-Welle). Lieber sichtbare Lücke als
Schein-Sicherheit.

---

## E · Methode & Governance

**E1 — Regeln in Code erzwingen, nicht nur beschreiben.** Wo eine Regel
maschinell prüfbar ist (verbotene Klassen, Token-Pflicht), gehört sie in
ESLint/Tests/Gates — nicht nur in dieses .md. Das .md hält das Warum; der Code
hält die Regel.

**E2 — CH-Evidenz-Lücke respektieren.** Siehe Vorbehalt oben. Regeln aus
US-Evidenz sind für DE/FR/IT Inferenz; DACH-spezifische Entscheide an echtem
Verständnis prüfen.

**E3 — Mehrsprachigkeit als Designvariable.** DE/FR/IT haben unterschiedliche
Textlängen; Layouts müssen flexen (keine fixen Breiten, die nur für Deutsch
passen), sobald Lexmetrik mehrsprachig wächst.

---

## F · UI-Design (visuell & interaktiv)

Gegründet auf doppelt-verifizierte UI-Design-Recherche (25.6.2026,
`docs/recherche-ui-design-2026-06-25.md`; IBM Carbon, Atlassian, Material 3,
W3C WCAG 2.2, Nielsen Norman Group, Stanford/Fogg) **und** das ultracode-
Struktur-Audit. Prinzipien übernehmen, nicht Hersteller-Pixel dogmatisch.

**F1 — Abstand & Raster aus Tokens, gestuft nach Dichte.** Spacing nur aus der
Mass-Skala (`--space-*`/Tailwind), keine Ad-hoc-Pixel. Dichte ist ein bewusster
Hebel: kompakt-aber-scanbar ist für Lexmetrik richtig (dicht ⇒ wirkt seriöser/
fokussierter). Gruppierung über Weissraum/Nähe **vor** Linien/Rahmen.
Beschriftete Eingaben grosszügig im Gutter, Text nie in den Gutter hängen.

**F2 — Kontrast nach WCAG 2.2 (Pflicht, maschinell zu prüfen).** Text ≥ 4.5:1
(AA), grosser/fetter Text ≥ 3:1; **Nicht-Text — UI-Komponenten, Zustände, Icons,
Input-Borders, Fokus — ≥ 3:1** gegen die Nachbarfarbe. Wo erreichbar 7:1 (AAA)
für tragenden Text (Trust). Gilt **in Hell- UND Dunkelmodus** (Parität). Disabled/
Deko/Logo ausgenommen.

**F3 — Sichtbarer Fokus über Outline, nicht Farbe allein.** Jede fokussierbare
Komponente trägt einen sichtbaren Tastatur-Fokus: ≥ 2px-Perimeter, ≥ 3:1
Change-of-Contrast fokussiert↔unfokussiert. Kein `outline:none` ohne
gleichwertigen Ersatz; kein Fokus, der nur die Farbe wechselt.

**F4 — Vollständige Zustands-Matrix.** Jede interaktive Komponente bedient
*alle* Zustände: default · hover · focus-visible · active · **disabled ·
loading · selected** — plus **empty- und error-State** der Sicht. Kein Zustand
fehlt still. (Verzahnt mit C2: leeres Formular zeigt noch keinen Fehler.)

**F5 — Zwei Typografie-Register.** «Produktiv» (kompakt, Sans) für Rechner/
Generatoren/Tabellen/UI; «expressiv/Lese» (Lese-Serif, ruhige Lesespalte) nur
für Gesetzes-/Rechtsprechungs-Volltext. Expressive Lesestile gehören NICHT in
die Produkt-UI. Beide aus der einen verdichteten Skala (Block B2).

**F6 — Politur & Fehlerfreiheit sind Trust, nicht Kosmetik.** Sichtbare
Kleinfehler — Typos, tote Links, **stille No-op-Klassen**, inkonsistente
Abstände — senken die Glaubwürdigkeit messbar (Prominence × Interpretation).
Für ein Rechts-Werkzeug ist visuelle Disziplin ein Vertrauens-Mechanismus.

**F7 — Token-Disziplin site-weit, ohne Leichen.** Keine toten Tokens/`lc-*`-
Klassen. **Jede `bg-*`/`text-*`/`border-*`/`ring-*`-Farbe muss in
`tailwind.config.js` existieren** — sonst rendert das Utility stumm nichts
(Befund-Klasse brass-300/50). Kein Ad-hoc-Inline-Style für Farbe/Abstand/Grösse,
wo Token/Utility existiert (datengetriebene Inline-Werte — Timelines, Karten-
Fill — sind ausgenommen). Dark-Mode-Parität ist Teil jeder Farb-Entscheidung.

**F8 — Motion zurückhaltend.** Mechanisch-präzise, kein Overshoot (Token-
Kurven/-Dauern); `prefers-reduced-motion` wird respektiert (Base-Reset).

**F2b — Farbwelt-Sollwerte (Mess-Tor `check:farbwelt`, FAHRPLAN-DESIGN-WAERME
D-0).** F2 wird maschinell erzwungen: `scripts/check-farbwelt.ts` parst die
`:root`- und `html.dark`-Token aus `src/index.css` (Werte) gegen die Name→`var()`-
Abbildung in `tailwind.config.js` (No-op-Wächter, F7) und misst deterministisch
(§2, kein Netz/keine Uhr) WCAG-Kontrast hell UND dunkel. Das Tor läuft in
`check:seriell` → `check-parallel` → `gate` (nicht in CI-Workflows — Aufnahme
prüft der Orchestrator separat). Vier Klassen:

1. **WCAG-Pflichtpaare (harter FAIL):** Text ≥ 4.5:1, Nicht-Text/Zustände ≥ 3:1 —
   je hell+dunkel. Quelle sind die dokumentierten Paar-Listen der CSS-Kommentare
   (ink-600/500-Basistext, `--placeholder`, brass-700-Text, brass-800/brass-100,
   Status-Badge-Text auf `-bg`, `--focus`-Ring, `lc-akzent-*`-Oberkanten).
2. **Referenzwerte (harter FAIL bei Drift > ±0.06 — C-1/C-2/C-3, §4b-B):**
   dokumentierte Zahlen dürfen nie stillschweigend falsch werden (D3/F6). Bei
   Verschiebung neu messen und HIER + in `DESIGN-REGLEMENT-NORMTEXT §4b-B`
   nachziehen:

   | Rolle | Tick/Text auf `--well` | hell | dunkel |
   |---|---|---|---|
   | C-1 `lc-chip-entscheid` | slate-500 | 4.81 | 3.47 |
   | C-2 Currency-Chip warn | warn-700 | 5.24 | 9.43 |
   | C-3 brass-Tick | brass-700 | 4.91 | 10.48 |

   Fixpunkt (unantastbar, FAHRPLAN Fixpunkt 1): `--paper` hell `#FAF8F2` /
   dunkel `#16150F`.
3. **Bekannte Risse (WARNUNG + FAIL nur bei Verschlechterung — D-1-Input):**
   heute unter der Schwelle liegende Paare als Baseline-Guard, damit das Tor auf
   dem IST-Stand grün ist, ohne die Risse zu verstecken:
   `ink-500/well` hell 4.48 (Ziel 4.5, D-4) · `danger-500/paper` dunkel 2.72
   (Ziel 3.0, D-1.3, Direkt-Nicht-Text — der Linien-Ton nutzt bereits danger-700).
4. **OKLCH-Struktur:** Flächen-L-Leiter `well < paper < surface < paper-raised`
   je Modus (harter FAIL — Erhebungs-Logik). Hue-Drift je Familie ≤ 8° +
   L-Monotonie der Rampen sowie Chroma-Dämpfung Akzent (dunkel C ≤ hell −10 %) =
   **Erstlauf-WARNUNG** (Sollwerte legen erst D-4/D-5 fest, dann scharf).
   **APCA-Spalte NUR beratend** (Lc), nie Fail — WCAG 2.2 bleibt das Gate.

**F2b-Nachtrag D-3 (12.7.2026) — color-mix `in srgb` → `in oklab` (Befund 36,
FAHRPLAN-DESIGN-WAERME D-3).** Alle 19 `color-mix`-Rezepte in `src/index.css`
interpolieren in **oklab** (srgb frisst bei 10–18 %-Tönungen Farbigkeit —
Status-Flächen wurden grauer/kälter als das Rezept verspricht). Neu gemessen
(deterministisch, culori, hell+dunkel):

- **Referenzwerte C-1/C-2/C-3 (Tabelle oben): UNVERÄNDERT** — alle drei Paare
  sind Voll-Token auf dem soliden `--well`, kein color-mix im Pfad
  (vorher = nachher: 4.81/3.47 · 5.24/9.43 · 4.91/10.48).
- **Mixe mit `transparent` (15 der 19 Stellen — Haarlinien `--line`/
  `--line-strong`/`--guide-gliederung`/`--rule-*`, `lc-glass`, Badge-Outlines,
  Schraffur, brass-Unterstreichung): gerendert BYTE-IDENTISCH** — bei
  premultiplied alpha trägt der transparente Endpunkt kein Farbgewicht, die
  Interpolation ist raumunabhängig.
- **Sichtbar verschieben sich NUR die vier `-bg`-Flächen** (wärmer/chromatischer,
  Text = `-700` bleibt überall ≥ 5.1:1):

  | Rezept | hell alt→neu | K(-700) alt→neu | dunkel alt→neu | K(-700) alt→neu |
  |---|---|---|---|---|
  | `--sage-bg` | `#EBEBE3`→`#EAEBE2` | 5.81→5.77 | `#23271C`→`#22251B` | 8.25→8.44 |
  | `--slate-bg` | `#EAEAE5`→`#E9E9E5` | 6.58→6.52 | `#222421`→`#21231F` | 7.63→7.77 |
  | `--warn-bg` | `#F4EBDC`→`#F5EBDE` | 5.11→5.12 | `#352711`→`#312515` | 7.12→7.32 |
  | `--danger-bg` | `#F0E5DF`→`#F2E5DD` | 7.55→7.54 | `#2E1D15`→`#2C1D15` | 6.67→6.68 |

  `lc-badge-entwurf`-Text (warn-700 auf transparenter Fläche): 5.87/5.67 hell ·
  8.47/9.00 dunkel (surface/paper) — unberührt vom Raumwechsel.
  Alle 46 farbwelt-Pflichtpaare bleiben ≥ Schwellen; kein Guard musste bewegt
  werden. Neue Rezepte schreiben `color-mix(in oklab, …)`; `in srgb` ist für
  Farb-Rezepte nicht mehr zulässig (Ausnahme: keine bekannt).

## G · Rollen, Farb-Wörterbuch & Wärme-Architektur (D-2-Nachträge)

Deklarierte §13-Nachträge aus FAHRPLAN-DESIGN-WAERME **D-2** (Rollen-Alias-
Schicht). Grundsatz der Schicht: **Rollen vor Stufen** — Komponenten greifen
eine wertidentische Rolle (`--accent-*`, `…-solid/-text`, `--ok-*`; in
`tailwind.config.js` als `accent-*`/`ok-*`/`…-solid`/`…-text` exportiert), nie
die nackte Basis-Stufe. Eine spätere Farb-Rekalibrierung (D-4/D-5) wird damit
ein reiner `:root`-Eingriff. Basis-Stufen (`brass-700`, `sage-500`, …) sind für
**neue** Komponenten privat; Bestand migriert opportunistisch (kein Riesen-Diff).

**a — Brass ist Signal, nicht Tapete.** Grosse Messing-Flächen bleiben dem
semantisch Massgeblichen vorbehalten (Marke/Wortlaut-Referenz, §4b-B). Abnahme-
Ritual je Kernseite: **Squint-Test** — kneift man die Augen zu, darf Brass nur
dort leuchten, wo es Bedeutung trägt, nicht als flächige Einfärbung.

**b — Ton vor Schatten.** Erhebung primär über Flächenton (`--paper`→`--surface`
→`--paper-raised`) + 1px `--line`; Schatten ist **sekundär**, erst ab
«schwebend» (Dropdown/Popover/Modal). Kein Schatten-Verbot (das `lc-card`-
Doppelsignal bleibt), aber die Regel: **Tiefe = Stufe + Border, nie Schatten
allein.**

**c — Temperatur-Dramaturgie.** Fläche→Temperatur trägt das Wörterbuch: **warm
empfangen** (Startseite/Rubriken), **neutral-kühl prüfen** (Entscheid/Rechner/
Fristen). Der Temperatur-Kontrast ist Feature, kein Fehler; Signaturen (gravierte
Brass-Linie, Regeste-Box) sind katalogisierter Motiv-Rhythmus, keine Tapete.

**d — Reinweiss-Invariante (im Gate).** Kein `#FFFFFF`/`bg-white` als Lese-/
Arbeitsfläche — Papier ist warm (`--paper*`/`--surface*`); `--paper-raised` deckt
nur kleine erhabene Flächen. **Maschinell erzwungen** in `check:design-tokens`
(bg-white/text-white/…-white + `#fff`/`#ffffff` im Inline-Style, negativ-
kontrolliert). Dokumentierte Ausnahmen: `@media print` (`body #fff`) und
`text-paper` auf ink-Buttons — beide in `src/index.css`, ausserhalb des
Komponenten-Scopes des Gates.

**e — Zwei-Stimmen-Regel (grep-auditiert).** Serif (`--font-serif`) trägt
**ausschliesslich** zitierfähigen Quelltext (Normtext, Entscheidtext, Regesten,
Erlass-Kopf); Sans (`--font-sans`) alles Interaktive; Mono nur Zahlen/
Aktenzeichen. Audit 12.7.2026 (`grep font-serif src/`): alle 15 Fundstellen
liegen im Gesetzes-Reader (`gesetz-leser/*`) und der Rechtsprechung
(`RegesteBlock`/`EntscheidBody`/`EntscheidKarte`) — **null** Produkt-UI. Keine
dritte Schrift (§15). Regel erfüllt, keine Code-Änderung nötig.

**f — Linien unter der Tinte, Textur-NEIN.** Struktur-/Haarlinien sind immer
schwächer als der ink-600-Sekundärtext und laufen nur über die color-mix-Tokens
(`--line`, `--line-strong`, `--rule-*`, `--guide-gliederung`). Explizites **NEIN**
zu Papier-Texturen/Noise-Overlays (auch §15 Performance).

**g — Wärme-Architektur (der EINE Steuerhebel).** Wärme wird ausschliesslich
über die `--paper`/`--ink`-Basiswerte + die color-mix-Rezepte gesteuert; **nie**
flächen-lokale Warmtöne, **kein** dritter (Sepia-)Modus. Änderungspfad:
`--paper`/`--ink-900` verschieben, alles andere folgt aus den Rezepten.

**h — Navy-Fussnote.** `slate` bleibt der neutrale Entscheid-/Referenz-
Semantikton (§4b-B), **nie** eine Markenfläche. Die Identität wird nicht Richtung
Kanzlei-Navy «abgesichert» — brass bleibt die Marke.

**i — Werkstoff- vs. Zustandsfarbe (F1, aufgelöst).** `sage` war doppelt belegt
(Materialien-Kennfarbe **und** ok/Live-Zustand). Aufgelöst: die Zustands-Rolle
**`--ok-*`** (wertidentisch zu sage, semantisch getrennt) trägt Status; die drei
namentlichen Sites `lc-badge-ok`/`lc-live`/`lc-termin-ring` sind darauf migriert
(§4b-B-i). `sage` bleibt Materialien-Familie + bibliografische Currency
(`lc-punkt-material`, `lc-chip-geltend`). Eine Status-Einfärbung ist damit nicht
mehr zweideutig.

**j — Interaktions-Zustände (F5).** Wärme-Verhalten von hover/active/selected
folgt EINER Regel: **eine Flexoki-Stufe «tiefer»** (mehr Chroma, weniger
Lightness) — die Rollen `--accent-hover`/`--accent-bg-hover` kapseln das.
Verhindert Patchwork bei künftigen Interaktions-Feinschliffen.

## Audit: Stand der Webseite gegen dieses Reglement

Code-Audit 25.6.2026 (adversarial, read-only). Gesamtbild: **Die Webseite
erfüllt das Reglement schon weitgehend** — Token-Disziplin bei Farben/Abständen,
Lesespalte, Status-Familien, leeres-Formular-Muster, Icon-Set, Überblick→
Drilldown und ALL-CAPS sind sauber. Die Lücken sind eng umrissen: **Typografie-
Magic-Numbers in den Leser-Komponenten**, **fehlende maschinelle Erzwingung**
(E1) und **Stand/Link nicht an jedem Einzelwert** (D1).

**Nachtrag 25.6. (Umsetzung, Auftrag «1–5 machen»):** #1–#4 umgesetzt — Off-
Scale-Typo byte-identisch auf `--fs-*`-Tokens (B2/D2), `fontSize:'10px'`→
`text-micro` (#3), und die Token-Schranke `check:design-tokens` ist scharf
(E1, in `npm run check`/gate). #5 (D1) wurde verifiziert und ist **bereits
erfüllt** (typ-erzwungene `TarifQuelle`) — keine Änderung, da Erfinden von
Provenienz §7 verletzt hätte. B2/D2/E1 sind damit maschinell abgesichert.

| Regel | Status | Kern-Beleg | Befund |
|---|---|---|---|
| A1/A3 Sprache (UI) | n. i. Code prüfbar | — | Manuell/Stichprobe; siehe A2b |
| A2 kein ALL-CAPS-Block | ✅ erfüllt | `ui.tsx:395` (13× uppercase, alle Labels) | Nur Overlines/Badges in Versalien |
| A2b generierte Texte | 🟡 teilweise (Stichprobe) | `arbeitsvertrag.ts:245,287`; `handelsreisendenvertrag.ts` | Vereinzelt lange Schachtelsätze + Passiv; teils gesetzesnah gewollt |
| A4 kein Lesbarkeits-Score | ✅ erfüllt | (keine Score-Anzeige gefunden) | Wird nirgends als Gütesiegel gezeigt |
| B1 Verdikt zuerst | ✅ erfüllt | Rechner-Reglement R1 | Site-weit gelebt |
| B2 Typo-Skala | 🟡 teilweise | `GesetzLeser.tsx:144–233`; `EntscheidBody.tsx:16` | Skala überwiegend genutzt (`text-xs` gültig), aber Leser brechen sie: 22× `text-[…rem]` + 6× `text-sm/base` + 7× inline `fontSize` |
| B2b Lesespalte | ✅ erfüllt | 38× `max-w-reading` | Fliesstext in 40rem; einzige Ausnahme bewusst das 2-spaltige Normtext-Layout |
| B3 Status-Farben | ✅ erfüllt | `tailwind.config.js:22–26`, 0 Ad-hoc | Kein red/green/amber/Hex/rgb in tsx; Inline nur `var(--…)` |
| B3b Icon-System | ✅ erfüllt (kl. Mischung) | `src/components/Icon.tsx` | Eigen-Set, keine Fremdlib; nur UI-Chrome nutzt Unicode-Glyphen (✕/☰/▾) |
| C1 Überblick→Drilldown | ✅ erfüllt | `Startseite.tsx` + `src/components/start/*` | Cockpit → Detailseiten |
| C2 leeres Formular ohne Fehler | ✅ erfüllt | `ui.tsx:372` `BeruehrtRahmen`, `:392` `FehlerBox` | Fehler erst nach «berührt»; 15 Forms gewrappt |
| C3 Warum-Layer | ✅ erfüllt | Rechner-Reglement R | «Was gilt → warum» durchgängig |
| D1 Norm + Link + Stand | ✅ erfüllt (verifiziert 25.6.) | `prozesskosten.ts:98-103` `TarifQuelle` (stand/quelleUrl = Pflicht) | Tarif-/Rechenwerte tragen Quelle+Stand+Link **typ-erzwungen**; bare `norm`-Zitate sind NormLinks, die die Provenienz des verlinkten Erlasses erben (kein Duplikat nötig). Audit-Heuristik (51 vs 750) war by-design, kein echter Mangel. |
| D2 keine Magic-Numbers | 🟡 teilweise | `ErgebnisAnzeige.tsx:137` (`fontSize:'10px'`) | Farben/Abstände token-rein; Restmenge = die Typo-Magic-Numbers aus B2 |
| D3 Status-Marker ehrlich | ✅ erfüllt | `verified` 177× in `src/lib` | Recherche/geprüft sichtbar |
| E1 in Code erzwungen | 🟠 offen | `eslint.config.js` (nur §2-Determinismus) | KEINE Schranke gegen `text-sm`/Arbitrary-`text-[…]`/Ad-hoc-Farben — B2/D2 sind reine Disziplin |
| E2 CH-Evidenz-Vorbehalt | ✅ erfüllt | dieses Reglement | Explizit markiert |
| E3 Mehrsprachigkeit | n. i. Code prüfbar | — | Erst relevant bei DE/FR/IT-Ausbau |

### Offene Punkte (separate Freigabe — in diesem Durchgang NICHT umgesetzt)

1. **E1-Schranke bauen** — ESLint-Regel (`no-restricted-syntax` für
   className-Literale) + ggf. Gate-Test gegen `text-sm`/`text-lg`/
   `text-[…px|rem]`/Ad-hoc-Farben. Macht B2/D2 aus Disziplin zu Erzwingung;
   `eslint.config.js` hat das Muster (Determinismus-Block) schon.
2. **`GesetzLeser.tsx` auf Skala ziehen** — `:144,145,148,160,182,186,221,233`
   (`text-[1.3rem]…[0.6rem]`) + `text-sm` `:231,520,751`. Nutzerwählbare
   Lesegrösse (`--rsp-fs`) als Token/CSS-Var dokumentieren, freie Headings auf
   die Skala.
3. **`ErgebnisAnzeige.tsx:137`** — `fontSize:'10px'` liegt UNTER `micro` (11px);
   auf `text-micro` o. ä. heben.
4. **`EntscheidBody.tsx:16,48,112` + `EntscheidLeser.tsx:243,363`** — off-scale
   `text-[…rem]`; wenn nutzerwählbar, als CSS-Var dokumentieren statt frei.
5. ~~D1 Stand+Link nachziehen~~ — **verifiziert 25.6., bereits erfüllt, keine
   Änderung (§7).** Die Audit-Kandidaten prozesskosten/grundbuchgebuehren tragen
   `stand`+`quelleUrl` **typ-erzwungen** (`TarifQuelle`, nicht-optional →
   `prozesskosten.ts:98-103`, gerendert in `grundbuchgebuehren.ts:114-123`). Die
   Korpus-Metrik (norm 750× vs stand 51×) ist by-design: `norm`-Zitate sind
   NormLinks auf den in-app-Erlass (mit eigenem Stand), kein dupliziertes
   stand/url nötig. Provenienz zu erfinden wäre ein §7-Verstoss — daher bewusst
   keine Code-Änderung. (Ein echter D1-Sweep über ALLE Engines bliebe ein
   separater, verifiziert-zu-belegender Auftrag — nichts Fabrizierbares.)

> Reine Disziplin-Befunde (A2b) und domänenbedingte Ausnahmen (2-spaltiges
> Normtext-Layout, Druckbild-`em`-Grössen in `vorschauStil.ts`) sind bewusst
> KEINE Pflicht-Fixes, sondern dokumentierte, vertretbare Abweichungen.
