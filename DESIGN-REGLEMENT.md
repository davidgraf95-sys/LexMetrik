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

## Audit: Stand der Webseite gegen dieses Reglement

Code-Audit 25.6.2026 (adversarial, read-only). Gesamtbild: **Die Webseite
erfüllt das Reglement schon weitgehend** — Token-Disziplin bei Farben/Abständen,
Lesespalte, Status-Familien, leeres-Formular-Muster, Icon-Set, Überblick→
Drilldown und ALL-CAPS sind sauber. Die Lücken sind eng umrissen: **Typografie-
Magic-Numbers in den Leser-Komponenten**, **fehlende maschinelle Erzwingung**
(E1) und **Stand/Link nicht an jedem Einzelwert** (D1).

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
| D1 Norm + Link + Stand | 🟡 teilweise | `src/lib/`: `norm` 750× vs `stand` 51× / `quelleUrl` 21× | Norm-Anker fast durchgängig; Stand+Link nicht an jedem Tarif-/Rechenwert |
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
5. **D1 Stand+Link nachziehen** — Tarif-Engines ohne `stand`/`quelleUrl`
   (Kandidaten: prozesskosten, grundbuchgebuehren) an das Snapshot-Muster der
   Normtext-Schicht angleichen.

> Reine Disziplin-Befunde (A2b) und domänenbedingte Ausnahmen (2-spaltiges
> Normtext-Layout, Druckbild-`em`-Grössen in `vorschauStil.ts`) sind bewusst
> KEINE Pflicht-Fixes, sondern dokumentierte, vertretbare Abweichungen.
