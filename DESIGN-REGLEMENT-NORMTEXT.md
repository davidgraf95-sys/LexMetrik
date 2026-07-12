# Design-Reglement Normtext — die Gesetzesdarstellung von LexMetrik

Stand: 28.6.2026, erweitert 4.7.2026 (W2·5d G1). Auftrag David: «baue ein
fundiertes Regelwerk für die Darstellung von Bundesgesetzen und Verordnungen; es
soll mindestens die Qualitätserfordernisse von Fedlex haben». Geltungsbereich
**erweitert auf alle Gesetze (Bund + Kanton + International)**: **die Anzeige von
Gesetzes-/Normtext** im Gesetzleser (`src/pages/gesetz-leser/*`,
`src/components/normtext/*`, `src/lib/normtext/*`) und die Extraktion, die ihn
speist (`scripts/normtext*`). Detail-/Bau-Spec der UX-Reform:
`FAHRPLAN-GESETZES-UX.md`.

Dieses Reglement hängt unter `DESIGN-REGLEMENT.md` (Dach) und konkretisiert es
für den Normtext — parallel zu `-RECHNER`, `-RECHTSPRECHUNG`, `-VORLAGEN`. Bei
Konflikt gewinnt dieses Reglement *innerhalb der Gesetzesdarstellung*; alles
andere folgt dem Dach. **Das Verbindliche ist der Code/die Daten** — dieses
Reglement erfindet keine Magic-Numbers, es bindet an bestehende Tokens und hält
das *Warum* + die Soll-Werte fest.

Evidenz: das Fedlex-Datenmodell selbst (gecachte amtliche Konsolidierungs-HTMLs
unter `/tmp/*.html`, Struktur `div#preface` / `div#preamble` / `article` /
`div.dispositions` / `div.annex` / `div.footnotes`) sowie das
Vollständigkeits-Audit `AUDIT-FEDLEX-DARSTELLUNG-2026-06-28.md` (33 Lücken
bestätigt). Umbau-Plan: `FAHRPLAN-NORMTEXT-DARSTELLUNG.md`.

---

## L0 · Leitsatz (steht über allem)

> **LexMetrik bietet eine Gesetzesdarstellung, die *gleich fundiert* ist wie
> Fedlex — kein Informationsverlust, amtstreu — aber *nützlicher und
> praxistauglicher* als Fedlex und andere Konkurrenten.**

Daraus folgt die Tiefen-Steuerung jeder Entscheidung:

1. **Fedlex ist die Untergrenze der Fundiertheit, nicht das Ziel.** Was Fedlex
   für einen Erlass zeigt, *muss* bei uns abbildbar sein (oder ehrlich als
   «nicht abgebildet» markiert — nie still weggelassen).
2. **Bei der Darstellung dürfen/sollen wir Fedlex übertreffen** — ruhigeres
   Schriftbild, lückenloser Sprung-Index, interne Verzahnung (Norm→Norm), aber
   nie auf Kosten der Amtstreue.
3. **Reihenfolge der Tiefe:** zuerst was die Norm *fundierter/korrekter/
   vollständiger* macht, dann *Nutzen-Vorsprung*, zuletzt Kosmetik.

---

## §1 · Wortlaut ist unantastbar (oberste Invariante)

- Der **amtliche Wortlaut wird nie verändert** — wir normalisieren nur die
  *Darstellung* (Einzug, Marker-Position, Strich-Logik, Abstände).
- Eine Darstellungs-/Extraktions-Änderung, die den Sinn verschiebt, ist ein
  Bug, kein Feature. **Falsche Zitate sind schlimmer als gar keine.** Beispiel:
  verlorene Verschachtelungstiefe einer Aufzählung (Ziff. oben / lit. unten)
  erzeugt falsche Fundstellen → §1-Verletzung, höchste Priorität.
- **Plausibel-falsche interne Links sind schlimmer als tote.** Ein Verweis, der
  auf den falschen Artikel zeigt (z. B. VO-Selbstverweis statt Trägergesetz),
  wird unterdrückt, bevor er falsch verlinkt wird.

## §2 · Vollständigkeit gegen Fedlex (Fundiertheits-Floor)

Ein Bundeserlass besteht aus mehr als seinen Artikeln. Folgende Fedlex-Regionen
**gehören zur Norm** und dürfen nicht still fehlen:

| Region | Fedlex-Element | Status-Soll |
|---|---|---|
| Erlass-Kopf | `div#preface` (SR-Nr, Titel, **Erlassdatum «vom …»**, Stand, Kopf-Fussnoten) | abbilden |
| Ingress/Präambel | `div#preamble` (Erlassformel «… beschliesst:/verordnet:», bei BV materielle Präambel) + deren Fussnoten | abbilden |
| Artikel | `article` (Absätze, Aufzählungen mit **korrekter Verschachtelung**, Tabellen, Bilder/Formeln) | abbilden |
| Schluss-/Übergangsbest. | `div.dispositions` (datierte UeB-Blöcke; ZGB-Schlusstitel = 178 Art.) | abbilden *(B2)* |
| Anhänge | `div.annex` (Anhang 1, 2 … mit Tabellen/Verzeichnissen) | abbilden *(B2)* |
| Fussnoten-Apparat | `div.footnotes` (Quell-/Änderungsvermerke, AS/BBl-Zitate, **Hervorhebungen**) | abbilden |

**Markier-Pflicht (§8):** Was wir (noch) nicht abbilden, wird sichtbar als
solches markiert — nie als Vollständigkeit ausgegeben.

## §3 · EINE Quelle (Snapshot + Sidecar)

- Der **Normtext-Index** (`golden/normtext-snapshot.json` / `public/normtext/
  bund/*.json`) ist die *eine* Quelle des Wortlauts. Keine zweite Wortlaut-Quelle.
- **Anreicherungen, die den Wortlaut nicht verändern** (Erlass-Kopf/Ingress,
  Fussnoten-Hervorhebung, Wort-Offsets der Marker), liegen als **Sidecar** neben
  dem Index → der Index bleibt byte-gleich. Nur echter Normtext-Zuwachs
  (Verschachtelungstiefe, Tabellen-Köpfe, Bilder, doppelte-ID, neue
  Schluss-/Anhang-Einträge) verändert den Index **bewusst**.

## §4 · Darstellungsregeln (wo wir Fedlex erreichen + übertreffen)

- **Gliederung/Sprung-Index lückenlos.** Der TOC zeigt **alle** Randtitel einer
  Ebene — auch Blatt-Knoten ohne Unterknoten (Fedlex-Übertreffer: keine
  löchrige Buchstabenfolge wie «B, C, E»; ZGB-Einleitung muss A–E zeigen). Die
  Wurzel (`randtitelKnoten`) speist TOC **und** Fliesstext-Überschrift — Blatt-
  Randtitel im TOC nie mit der Artikel-eigenen Sachüberschrift doppeln.
- **Zusammengehörigkeit einheitlich.** Die Gruppierungs-Striche (zeigen, dass
  Artikel zusammengehören) folgen *einer* Logik — gleicher Strich überall, kein
  Mal-ja-mal-nein zwischen Knoten- und Blatt-Randtiteln. **(David 29.6.):** die
  Striche müssen **bei jedem Bund-Gesetz** vorhanden sein (Quelle: `<section …/lvl_…>`
  + `aria-level`, OR-Wurzel `part_`) — heute fehlen sie bei einigen. Zusätzlich ein
  **An/Aus-Umschalter pro Gesetz** (zustandslos), ob die Striche angezeigt werden.
- **Einheitliche linke Textkante.** Der Einzug ist gleich, ob ein Artikel
  nummerierte Absätze hat oder nur einen Block (`absatz=null`) — keine
  springende Textkante zwischen Artikeln.
- **Aufgehobene Artikel: schlicht statt verspielt.** Ein voll aufgehobener
  Artikel zeigt als **dezente, immer sichtbare Statuszeile «· aufgehoben»** seinen
  Zustand (das *ist* der Artikelzustand, §2). Die amtliche **Aufhebungs-Zitatzeile**
  («Aufgehoben durch … [AS …]») ist eine Änderungs-Fussnote und steht — wie jede
  andere Fussnote — **hinter dem Fussnoten-Schalter, erst auf Klick** (Entscheid
  David 29.6.: einheitliches Fussnoten-Verhalten; vorher war sie bei Aufhebungen
  als einzige standardmässig offen). Kein eigener Accordion-Apparat je Artikel —
  derselbe Schalter wie überall. Ruhig, aber vollständig.
- **Fussnoten wie Fedlex.** Platzierung + Abstand folgen dem Fedlex-Ist
  (einheitlich, kein Mal-Abstand-mal-keiner); Hervorhebungen (fett/kursiv) im
  Fussnotentext bleiben erhalten.
- **Änderungsstatus ruhig.** Der Änderungsvermerk je Bestimmung («Eingefügt
  durch / Fassung gemäss / in Kraft seit / AS …») bleibt **hinter dem Fussnoten-
  Schalter** (David-Entscheid 28.6.: ruhiges Schriftbild > Oberflächen-
  Fundiertheit; der Inhalt ist da, auf Klick). **Einheitlich (David 29.6.):** auch
  die *Aufhebungs*-Zitatzeile («Aufgehoben durch … AS …») steht hinter dem Schalter;
  einzig die **Statuszeile «· aufgehoben»** bleibt immer sichtbar (sie *ist* der
  Artikelzustand, nicht die Fussnote).

### §4a · Suche, Gliederung & Tabellen (QA-Sweep David 29.6.2026)

Detailplan: `FAHRPLAN-GESETZESDARSTELLUNG-BUND.md` (M4/M5/M7/M8/M10).

- **Suche ↔ Gliederung responsiv (M4/M5/M7).** Über alle Breakpoints: die Gliederung
  darf das **Suchfeld und die gefundenen Artikel nicht verdecken** (schmaler Viewport →
  Drawer/Overlay statt Überlagerung). Gliederung + Suche schliessen **kompakt an den
  Header** an (keine lose Lücke). Nach einer Suche springt der Treffer **vollständig
  sichtbar** an — nie unter den Sticky-Header geschoben/oben abgeschnitten (Scroll-Offset).
- **Treffer-Hervorhebung (M8).** Der im Gesetzes-Suchfeld gesuchte Begriff wird **im
  Normtext markiert** (sichtbares Highlight), nicht nur per Sprung angezeigt.
- **Tabellen-Layout (M10, → Tabellen-Regelwerk T-C/T-D).** Renderer ist **dumme Projektion**
  von `spalten.length`; Ausrichtung folgt dem **Spaltentyp** (Text/Bereich links,
  Zahl/Betrag rechts mit `tabular-nums`), **einheitlich pro Spalte** — kein zellweises
  Alternieren. Staffel-Spanne erscheint als **eine** linksbündige Zelle («über 100 bis
  500»), keine Phantom-Leerspalte. Mobil seitlich scrollbar (Zahlen brechen nicht um),
  ARIA-Tabellensemantik vollständig (Kopf↔Zelle), Kontrast/Fokus über Tokens (§13/F).
  Tausender-Apostroph/Währung sind **Anzeige**, nie im Snapshot (§7).

### §4b · Linien-Kanon & Lese-Typografie (W2·5d G1, 4.7.2026)

Leitprinzip (aus Fedlex-Messung + SotA doppelt belegt): **Ruhe durch Reduktion.
Hierarchie über Typo-Abstufung + Einzug, NICHT über Linien.** Der Fliesstext ist
der Held; die Struktur flüstert (Gegen-Lehre zu Fedlex, wo «die Struktur schreit,
der Rechtstext flüstert»). Rangfolge verbindlich: **Typo (Gewicht/Grösse) >
Einzug > eine dezente Guide-Linie. Farbe/Boxen nie.**

**EINE Linien-Sprache — genau DREI benannte Rollen, sonst keine.** Vorher wurden
für strukturgleiche Trenner 4–6 Ad-hoc-Opazitäten desselben `--line` frei gewählt
(Artikel `/70`, Sektion voll|`/50`, Guide `/60`, Tabellenzeile/Fussnoten `/50–60`)
und bis zu ~6 parallele 1px-Linien stapelten sich («Barcode/Gleisbett», ZGB
Art. 684 / OR Art. 319). Neu (Tokens in `src/index.css` `:root` **und**
`html.dark`, abgebildet in `tailwind.config.js`):

| Rolle | Klasse | CSS-Var (hell / dunkel) | Wo (strukturell) |
|---|---|---|---|
| **Gliederungs-Guide** (vertikale Tiefen-Linie) | `border-l border-guide` | `--guide-gliederung` (18 % / 24 %, = `--line-strong`; V2·L-2 von 10 %/14 % angehoben — der Guide war praktisch unsichtbar; NICHT höher, sonst wäre die Deko die dunkelste Linie, F2 nimmt Deko von 3:1 aus) | `renderSektion` (nur `linien.guideEbene`, aufbau-basiert — §4b-A) |
| **Artikel-Trenner** (fein) | `border-t border-rule-artikel` | `--rule-artikel` (10 % / 14 %) | Artikel-Kopf, Tabellenzeilen, Fussnoten-Trenner |
| **Struktur-Trenner** (oberste Sektionen Teil/Titel/Abschnitt, eine Spur kräftiger) | `border-t/-b border-rule-struktur` | `--rule-struktur` (14 % / 20 %) | Sektionskopf ebene ≤ 1, Ingress |

Harte Regeln:
1. **Höchstens EINE vertikale Guide-Linie gleichzeitig** — genau die aufbau-
   abhängige Ebene (`linien.guideEbene`, §4b-A) trägt den Guide; grössere Tiefe
   wird über **Einzug** getragen, nie über eine zweite parallele Linie.
2. **Innere Sektionen (ebene ≥ 2) und randtitel-promotete Knoten** («A.», «II.»)
   tragen **keine** Horizontal-Linie (die frühere feine ebene-2-Linie entfällt);
   ihre Tiefe trägt Typo + Einzug.
3. **Marker-Scope + Chrome-Ausnahme:** die drei Rollen gelten NUR an den mit
   `data-normtext-linie` markierten strukturellen Containern. Chrome-Borders
   (Such-Boxen, Buttons, Drawer, Nav, Fussnoten-Popover, Tabellen-**Aussenbox**)
   und die **Brass**-Sprache (Ziel-/Zitat-Kanten, Fussnoten-Links) sind eine
   eigene, ausdrücklich ausgenommene Sprache — sie bleiben `border-line` bzw.
   Brass, nie mit der Linien-Sprache vermischt.

**Einzug-Skala & Weissraum-Rhythmus.** Token `einzug` (`tailwind.config.js
spacing`, 20px/Stufe): Desktop Tiefe *n* → `n × einzug`, **gedeckelt bei 5 Stufen**
(V2·L-1 von 3 angehoben — tiefe Kodifikationen ZGB/OR verloren ab Ebene 3 die
sichtbare Verschachtelung, David-Befund «Liniengliederung funktioniert praktisch
nicht»). **Mobil kollabiert der Einzug NICHT mehr auf 0**, sondern trägt ein
kleineres `einzug-mobil` (~0.75rem, `pl-einzug-mobil sm:pl-einzug`) — die
Verschachtelung bleibt auch @390 flüsterleise lesbar; die eine Guide bleibt als
einzelne 1px-Linie am Spaltenrand. **CLS 0:** Einzug = `padding`, Guide = `border`
darauf → Umschalten/Kollabieren bewegt keinen Textknoten. `data-linien="aus"`
kollabiert den Einzug weiterhin über ALLE Ebenen auf 0 (`padding-left:0`).

**Lese-Typografie.** Lesespalte **hart auf `max-w-reading` (40rem ≈ 66–71 ch)**,
nie arbitrary `max-w-[…rem]` (R2). Fliesstext 18px Serif (über Fedlex 14px),
gedämpft `text-ink-800`, Flatterrand (nie Blocksatz). **`hyphens: manual`** (nicht
`auto`) auf dem Normtext-Body — die deutsche Auto-Silbentrennung an schmalen
Spalten war der sichtbare «Ge-werbes»-Treiber; `[overflow-wrap:anywhere]` bleibt
der Overflow-Schutz für lange Komposita. **Randtitel-Hierarchie:** Blatt/Sach-
überschrift `font-semibold text-ink-800`, oberste Marginalie `uppercase
tracking-wide text-ink-500`, dazwischen `text-ink-600`; mehrzeilige Randtitel mit
**Hänge-Einzug-Schutz** (`text-indent:-1em` + `pl-[1em]`) gegen den Fedlex-AVOID
«1. Im / Allgemeinen».

**Maschinell gegated:** R1 `check:linien-kanon` (marker-scoped, in `npm run gate`),
R2 eslint (`no-restricted-syntax` gegen arbitrary `max-w-[…rem]` im Reader), R4/R5
als Playwright-e2e (≤ 1 Guide je Artikel; Lesemass ≤ 75 ch @ 1440 / kein
horizontaler Overflow @ 390). **`golden/lexmetrik-golden.json` bleibt byte-gleich**
(der Reader liegt nicht in der Engine-Golden-Matrix); der amtliche **Wortlaut ist
unangetastet** (§1, Text-Extraktion vorher/nachher byte-gleich) — geändert sind
ausschliesslich Klassen/Attribute.

### §4b-A · Linien-Aufbau-Regelwerk (W2·5d U-LINIEN / A8, 5.7.2026)

**Wann zeigt der Reader den vertikalen Gliederungs-Guide? — nach dem TATSÄCHLICHEN
Aufbau des Erlasses, NICHT nach seiner grundart-Kategorie.** Davids Anmerkung A8:
«Liniengliederungsdarstellung … regeln festlegen wie es wann angezeigt wird JE NACH
AUFBAU GESETZ. zgb bspw. sehr viele aber arg fast keine aktuell.» Der frühere
G3a/K11-Default war kategorie-basiert (nur `grundart==='KODIFIKATION'` zeigte den
Guide) — genau die gerügte Inkonsistenz: das tiefe **ZGB** ertrank in Linien, das
flache **ArG** bekam gar keine. Neu leitet **SSoT `src/pages/gesetz-leser/linienAufbau.ts`
(`linienProfil`)** den Default aus dem Struktur-Sidecar ab (Gliederungstiefe +
Artikel-Dichte je Ebene). Der K11-Tri-State-**Nutzer-Override** (`data-linien`
an/aus, global) bleibt unangetastet — hier geht es allein um den AUTO-Default.

**Profil je Erlass** (`linienProfil`): `strukturTiefe` = max. Gliederungs-
Verschachtelung; `guideEbene` = Sektions-tiefe, die den EINEN Guide trägt (`null` =
flache Artikelliste); `dichteAmGuide` = Median Artikel je Sektion auf `guideEbene`;
`autoGuide` = zeigt der Guide im Auto-Default? Der Reader schreibt `autoGuide` als
`data-guide-auto="an|aus"` an den `.lc-leser`-Root; CSS wertet es aus. **V2·A28
(David 12.7.2026): `autoGuide` ist korpusweit `false` — `data-guide-auto` ist stets
`"aus"`.**

| Aufbau (`strukturTiefe`) | `guideEbene` | Auto-Default | Wirkung |
|---|---|---|---|
| **0** (flache Artikelliste, z. B. VMWG, Kanton-§) | `null` | — | Kein Guide möglich; Artikel trennt der feine Artikel-Trenner. |
| **1** (eine Gliederungsebene, z. B. Kurzerlass, Staatsvertrag) | 0 | **AUS** (A28) | Kein aufgedrängter Guide; Nutzer-«an» zeigt die EINE Ebene auf `guideEbene 0`. |
| **2** (zwei Ebenen, z. B. ArG) | 1 | **AUS** (A28) | Kein aufgedrängter Guide; Nutzer-«an» zeigt die innere Gruppierung auf `guideEbene 1`. |
| **≥ 3** (tiefe Kodifikation, z. B. BV, OR, ZGB) | 1 | **AUS** (A28) | Kein aufgedrängter Guide; Nutzer-«an» zeigt den EINEN Guide auf `guideEbene 1` (≤ 1 Guide-Stapel, kein Barcode; die tieferen Ebenen tragen ihre Tiefe über Einzug + Typo). |

**Auto-Default-RÜCKZUG (V2·A28, David 12.7.2026, Live-Feedback auf L-3/#207).** L-3
(gebaut 11.7.) hatte den Auto-Guide für dichte Erlasse AN geschaltet (inkl. ZGB/OR),
gestützt auf die Theorie, ein einzelner Guide auf `guideEbene` sei die hilfreiche
Gliederungshilfe. David hat das **live verworfen**: *«das mit den linien funktioniert
überhaupt nicht»* / *«also ist überhaupt nicht fördernd für die übersicht»* (Wortlaut
`docs/ux-audit-2026-07/ANMERKUNGEN-DAVID-2026-07-12.md`). Das ist ein Total-Urteil
über den aufgedrängten Guide, kein Schwellwert-Feedback. Konsequenz: der Auto-Default
wird **korpusweit zurückgezogen** — `autoGuide = false` für JEDEN Erlass. Der Reader
drängt die Gliederungslinie nie auf.

**Das FEATURE bleibt — nur das Aufdrängen endet.** Der K11-Tri-State-Nutzer-Schalter
«Linien» (`data-linien` an/aus/auto, global) ist voll funktionsfähig: ein Klick
«Linien AN» zeigt den EINEN Guide auf `guideEbene`. `strukturTiefe`/`guideEbene`/
`dichteAmGuide` bleiben voll berechnet (sie steuern, WO der Guide sitzt und OB der
Schalter erscheint — `zeigeLinien = guideEbene !== null`). `DICHTE_MIN`/`TIEF_AB`
bleiben nur noch Diagnose-/Doku-Schwellen (deckeln nichts mehr am Auto-Default).

**Warum «korpusweit AUS» statt Feinjustage:** Davids Urteil ist ein Grundsatz-Nein
zum aufgedrängten Guide. Jede verbleibende Auto-Heuristik (Dichte/Tiefe/Kategorie)
bliebe eine Wette gegen dieses Urteil. Der konservative Zustand ist: nicht aufdrängen.
Weitere Justage nur auf neues, positives David-Signal. Alternativen für echte
Struktur-Übersicht (Typo-Hierarchie · Sticky-Mini-Kontext · TOC-Scroll-Spy ·
Abschnitts-Rhythmus) sind in `FAHRPLAN-GESETZES-UX.md §10.9` skizziert (nur Doku).

**Referenz-Verdikte** (im Tor gegated): ZGB (Tiefe 5) → **Auto-Guide AUS** · OR
(Tiefe 4) → **AUS** · ArG (Tiefe 2) → **AUS** · VMWG (Tiefe 0) → **kein Guide** ·
Kurzerlass/Staatsvertrag (Tiefe 1) → **AUS**. `guideEbene`/`strukturTiefe` bleiben
gegated (Nutzer-«an» trifft denselben Ort).

**Maschinell gegated:** `check:linien-kanon` (Nachfolger von R1/R4, in `npm run
gate`) importiert dieselbe `linienProfil`-Funktion, beweist die korpusweiten
Invarianten (`autoGuide` korpusweit `false`) + die Referenz-Verdikte + die
Reader-/CSS-Verdrahtung (kein Drift); e2e `gesetze-ux-g3a`/`leser-optionen`/
`leser-linien-kanon` beweisen das gerenderte Ergebnis (Auto-Default 0 sichtbare
Guides; Nutzer-«an» ⇒ genau 1 Guide, ≤ 1 Guide-Stapel).
**Wortlaut byte-gleich** (nur Klassen/Attribute), Engine-Golden byte-gleich.

### §4b-B · Farb-Wörterbuch der Referenzschicht (W2·5d V2·C-1, 10.7.2026, David «go zu allem»)

Grundsatz (David 10.7.2026): **Farbe NUR auf der Referenz-/Verzahnungsschicht**
(Chips, Badges, Kopf) — der **Normtext-Körper bleibt farbfrei** (Rangfolge §4b:
Typo > Einzug > Guide; kein Ton im Lesefluss). Das Wörterbuch ist EIN Entscheid je
Farbe — kein Ton trägt zwei Bedeutungen:

| Ton | Bedeutung (die EINE) | Trägt sie |
| --- | --- | --- |
| **brass** (Messing) | Marke / Hervorhebung / Wortlaut-Referenz. Kein Rechtsstatus-Urteil. | Norm-KantenChip-Tick (`kategorie='norm'`, Default), ★-Leitentscheid-Glyph, Verweis-Links, Verweise-Overline-Punkt (`lc-punkt`, V2·C-2 — auf `--paper` in brass-600, s. u.), NormChip (Pillen-Default inkl. `hover:border-brass-400`, V2·C-3), Familien-Punkt der Norm-Gruppen (`punkt='norm'` an `KontextGruppe`, V2·C-3) |
| **slate** | **Neutraler Referenz-/Sekundärton** — maschinell/prozedural, ohne Wertung. Kein Rechtsstatus-Urteil, insbesondere **NICHT** «ungeprüft/in Vorbereitung». | Rechtsprechungs-KantenChip-Tick (`kategorie='entscheid'`: Leitfälle + zitierte Entscheide), Leitfälle-Overline-Punkt (`lc-punkt-entscheid`, V2·C-2), soft-Badges «maschinell»/«nur Verweis» (`lc-badge-soft`), Familien-Punkt der Entscheid-Gruppen (`punkt='entscheid'`, V2·C-3) |
| **warn** | Echter Fassungs-/Sachvorbehalt (eine Warnung, keine Ampel-Wertung des Entscheids). | Revisions-↻-Glyph (`glyphTon: text-warn-700`), Currency-Chip-Tick «nächste Fassung ab …» (`lc-chip-vorbehalt`, V2·C-2 — angekündigt, noch nicht in Kraft) |
| **sage** | **Materialien-Familie** (Botschaften/Vernehmlassungen/amtliche Soft-Law-Publikationen — kein Gesetzesrang) + Currency «geltend geprüft am … (maschinell)» — beides neutrale, maschinell-bibliografische Einordnung, KEIN Rechtsstatus-Urteil («(maschinell)»-Wording bleibt tragend, §7/§8). | Currency-Chip-Tick `lc-chip-geltend` (V2·C-2), Familien-Punkt der Materialien-Gruppen (`lc-punkt-material` via `punkt='material'`, V2·C-3: Entstehungsgeschichte/Botschaften, Vernehmlassungen, Amtliche Materialien) |

**slate-Doppelbelegung aufgelöst (David-Entscheid §3 Ziff. 3):** slate war latent
sowohl «Rechtsprechungs-Kante» als auch «ungeprüft/in-Vorbereitung-Status». Fixiert:
slate bedeutet ausschliesslich **neutrale, maschinell-prozedurale Referenzinformation
ohne Wertung** — beide Vorkommen (Entscheid-Chip UND soft-Badge) teilen genau diese
eine Semantik. Der einzige quasi-Status-Gebrauch (Revision) wandert nach **warn** und
verlässt damit slate. brass bleibt die Marke/Hervorhebung, nie ein Rechtsstatus (R16).

**Anatomie unverändert (§6/R6):** Die `kategorie`-Prop am `KantenChip` tauscht NUR
den Tick (`border-left-color`) und die Hover-Utilities; Form/Token/Grösse bleiben →
**CLS 0**, keine Layout-Verschiebung. Der Default `'norm'` emittiert die unveränderte
brass-Klassenzeile ⇒ Grundzustand **byte-gleich** (`golden:vergleich` IDENTISCH; die
zitierten Normen im KontextPanel bleiben brass). Kontrast als Gate gemessen
(WCAG 1.4.11 ≥ 3:1 für den Tick, 1.4.3 ≥ 4.5:1 für Glyphen): slate-500-Tick **4.81**
hell / **3.47** dunkel; warn-700-↻ **5.24** / **9.43**; brass-700-★ **4.91** / **10.48**.
`--slate-500` wird in `html.dark` bewusst NICHT überschrieben (Tick-Kontrast bleibt
gehalten). **Gegated:** `verzahnung.test` (Default byte-identisch, Entscheid-Slate,
↻-warn), Golden byte-gleich. **D-3-Neu-Messung (12.7.2026, color-mix srgb→oklab):
alle drei Referenzpaare UNVERÄNDERT** (Voll-Token auf solidem `--well`, kein
color-mix im Pfad); Details + `-bg`-Verschiebung in `DESIGN-REGLEMENT.md` §F2b.

**V2·C-2 (Farb-Wörterbuch Teil 2, 11.7.2026, David «go zu allem») — zwei weitere
Bausteine, gleiche Anatomie-Disziplin (nur Tick/Punkt-Farbe, CLS 0):**

1. **Overline-Farbpunkte** ordnen die Referenzzeilen ihrer Farbfamilie zu:
   «Leitfälle» trägt den slate-Punkt (`lc-punkt-entscheid` = Rechtsprechung, deckt
   sich mit dem Entscheid-Chip-Tick), «Verweise» den brass-Punkt (`lc-punkt` = Norm).
   Der Punkt ist **redundant zum daneben stehenden Wortlabel** (`aria-hidden`, Farbe
   trägt NIE allein, §13/F2) und sitzt auf `--paper` statt `--well` — darum brass-**600**
   (nicht -500 wie der Chip-Tick auf well), damit die Füllung ≥3:1 hält.
2. **Currency-Chip-Tonung** gibt dem Fedlex-Freshness-Beweis Status-Semantik über den
   Tick: sage «geltend geprüft am … (maschinell)» (`lc-chip-geltend`) — neutral,
   maschinell, **kein Rechtsstatus-Urteil**; warn «nächste Fassung ab …»
   (`lc-chip-vorbehalt`) — echter Fassungsvorbehalt (angekündigt, noch nicht in
   Kraft). Das «(maschinell)»-Wortfeld bleibt tragend (§7/§8: keine
   fachliche-Abnahme-Suggestion). `--sage-500`/`--warn-500` in `html.dark` bewusst
   NICHT überschrieben.

Kontrast als Gate gemessen (WCAG 1.4.11 ≥3:1, Light+Dark, Desktop+Mobil@390,
Playwright): slate-Leitfälle-Punkt **5.21** hell / **3.31** dunkel; brass-600-
Verweise-Punkt **3.71** / **11.74**; sage-geltend-Tick **4.14** / **4.03**;
warn-vorbehalt-Tick **3.02** / **5.52** — alle ≥ Schwelle. **Gegated:**
`v2-c2-farbwoerterbuch.test` (Leitfälle-slate-Punkt, geltend-sage + «(maschinell)» +
kein «gegengeprüft/verifiziert», vorbehalt-warn, leer ⇒ kein toter Marker), Golden
byte-gleich. Gegenprüfung n/a (reines UI).

**V2·C-3 (Farb-Wörterbuch ABSCHLUSS, 11.7.2026) — das Wörterbuch ist damit
komplett; jede weitere Farbträger-Erweiterung MUSS sich in eine der vier Zeilen
oben einordnen (EIN Entscheid je Farbe), sonst neuer David-Entscheid:**

1. **Materialien-Familie = sage:** die Referenzgruppen-Überschriften
   (`KontextGruppe`, `punkt`-Prop `'norm'|'entscheid'|'material'`) tragen den
   Familien-Punkt ihrer Farbfamilie — Materialien-Gruppen (Entstehungsgeschichte/
   Botschaften, Vernehmlassungen, Amtliche Materialien; auch VerweisKontext) den
   **sage**-Punkt (`lc-punkt-material`), Entscheid-Gruppen slate, Norm-Gruppen
   brass. Ohne `punkt`-Prop KEIN Punkt (Werkzeuge/Revisionen bleiben neutral).
   Redundant zum Gruppentitel (`aria-hidden`, Farbe trägt NIE allein, §13/F2);
   `--sage-500` in `html.dark` bewusst NICHT überschrieben.
2. **NormChip-Verweisfarbe:** der Pillen-Default (`CHIP_LINK_CLASS`) trägt neu
   `hover:border-brass-400` — vorher der EINZIGE Norm-Chip ohne den brass-
   Hover-Border; jetzt EINE brass-Hover-Anatomie für die ganze Norm-Familie
   (KantenChip 'norm', rechtsprechung/NormChip, MassgebendeGesetze, NormChip).
   SSR-Assertions (`normLinkSsr.test`) deklariert nachgezogen (§6.3).

Kontrast als Gate gemessen (WCAG 1.4.11 ≥3:1, Light+Dark, Desktop+Mobil@390,
Playwright, auf `--paper`): sage-Punkt **4.48** hell / **3.84** dunkel;
slate-Punkt **5.21** / **3.31**; brass-600-Punkt **3.71** / **11.74** — alle
≥ Schwelle. CLS 0 (Punkt inline im Gruppen-h3, kein separater async-Mount;
Chip-Änderung hover-only). **Gegated:** `v2-c3-farbwoerterbuch.test` (Familien-
Punkt je Kategorie + Fremdfamilien-Ausschluss + neutral ohne Prop + NormChip-
brass-Hover), Golden byte-gleich. Gegenprüfung n/a (reines UI). §7-Befund
offengelegt: die frühere Annahme «0 lc-chip im prerenderten HTML» stimmt für
Rechner-/Vorlagen-Routen nicht (NormChip ist dort prerendert) — unschädlich,
Prerender wird je Deploy neu gebaut.

### §4c · Leser-Darstellungsoptionen (W2·5d G2a, 4.7.2026; U-KOPF/A1+A4, 5.7.2026; V2·B-1/B-2/K-2, 11.7.2026)

**V2-Nachtrag (David 10.7.2026, überstimmt «genau drei Toggles»):** es sind jetzt
**vier** persistente, rein visuelle Umschalter im «Ansicht»-Dropdown — **Linien ·
Fussnoten · Verweise · Entscheide** — plus ein JS-Filter **Zeitraum** und, im
aktionen-Slot, ein prominenter **Fussnoten-Chip**. Die «genau drei»-Fassung von
§3.1/§10.5 (UX) ist damit ausdrücklich überstimmt (A22/A23). Details am Ende von §4c.

Die ursprünglich drei persistenten, **rein visuellen** Lese-Umschalter (Auftrag
David): **Linien** (Gliederungs-Guide + Einzug), **Fussnoten** (Marker +
Apparat sichtbar/verschwunden), **Verweise** (Verweis-Link-Unterstreichung). Sie
liegen seit U-KOPF/A4 (David 5.7.2026) in **einem «Ansicht»-Dropdown im aktionen-
Slot des `ErlassLeserKopf`** (die frühere G2a-Chip-Leiste entfällt; Details im
U-KOPF-Nachtrag unten). Verbindliche Bau-Regeln:

1. **Mechanik = `data-*`-Attribut am `<html>` + CSS, kein React-State im
   Artikel-Baum.** Store `src/pages/gesetz-leser/leserOptionen.ts` setzt
   `data-linien/-fussnoten/-verweise` **imperativ** (Vorbild `components/thema.ts`);
   Umschalten rendert nur die Switch-Buttons neu, nie die Artikelliste (§15). Die
   CSS-Regeln stehen in `src/index.css`, **auf `.lc-leser` gescopt** (nur der
   Reader, nicht das Norm-Popover der Rechner).
2. **Pre-Paint CSP-konform.** Angewandt in `main.tsx` VOR `createRoot` (analog
   Thema/Schriftskala) — **kein Inline-Script** (`script-src 'self'`, vercel.json
   verbietet es). Persistenz in localStorage `lm.leser.optionen`.
3. **Default = 'an' für alle drei = heutige Darstellung** ⇒ `data-*="an"` ist ein
   CSS-No-op ⇒ Grundzustand **byte-gleich** (R6, `golden:vergleich` IDENTISCH). Die
   Guide-/Einzug-Klassen werden IMMER emittiert; `data-linien="aus"` blendet sie
   per CSS aus (der frühere React-State-Umschalter entfällt).
4. **Fussnoten-«AUS» lässt Marker + Apparat VERSCHWINDEN** (U-KOPF/A1, David
   5.7.2026 — überstimmt die frühere R9-Dämpfungs-Regel; s. U-KOPF-Nachtrag).
   `display:none` am Marker-Cluster (`button[aria-label^="Fussnote"]`,
   `[data-fn-marker]`) und am Apparat (`[data-fn-apparat]`); der Fussnotentext
   bleibt im DOM (`#fn-…`), «AN» stellt alles wieder her. Der **Normtext** ist NIE
   betroffen und bleibt stets durchsuchbar. **Verweise-«AUS»** unterdrückt nur die
   Unterstreichung; Farbe und Anker/Funktion bleiben.
5. **Global ⇒ beide Reader-Instanzen** (Einzelansicht + jedes Split-View-Pane)
   folgen einer Wahl ohne Re-Render. a11y: echte `role="switch" aria-checked`,
   sichtbarer Fokus über die globale `:focus-visible`-Outline.

**Gegated:** e2e `leser-optionen` (R6 + A1-Verschwinden positiv+negativ + CLS 0 +
Persistenz/Reload) + `leser-kopf-a9` (A9-Throttle) + `golden:vergleich` byte-gleich.

**G2b-Ergänzung (4.7.2026) — Fussnoten-Unifizierung umgesetzt:** Es gibt jetzt
**EINE** Fussnoten-Bedienung: der `data-fussnoten`-Options-Toggle. Der frühere
`fussnotenAuf`-React-Schalter (Such-Leiste) ist **entfernt**. Marker UND Apparat
(Artikelfuss-/Kopf-/Sektions-Fussnoten, Aufhebungsnotiz) liegen **IMMER im DOM**
(nur an `artOffen` gebunden). **Default AN.** Der **Linien**-Default ist mit
U-LINIEN/A8 aufbau-basiert festgelegt (§4b-A) — er löst den zwischenzeitlich
grundart-abhängigen G3a/K11-Default ab.

**U-KOPF-Nachtrag (5.7.2026, David-Entscheide) — deklarierte fachliche Änderungen:**

- **A1 — Fussnoten-«AUS» = VERSCHWINDEN (überstimmt R9/K5).** Davids Entscheid
  («die fussnoten sollen nicht abdunkeln wenn nicht angewählt sondern
  verschwinden») ersetzt die frühere Regel «AUS dämpft nur, versteckt nie». Neue
  R9: **«AUS» entfernt Marker + Apparat visuell** (`display:none` an
  `button[aria-label^="Fussnote"]`, `[data-fn-marker]`, `[data-fn-apparat]`); der
  **Fussnotentext bleibt im DOM** (`#fn-…`-Quellblöcke), «AN» stellt Sicht + Ctrl+F
  vollständig wieder her. **Trade-off** (bewusst, David): die Marker-Ziffern +
  Apparat-Texte verlassen bei AUS Ctrl+F/Screenreader — **NUR sie, nie der
  Normtext** (die amtliche Substanz des Artikels ist unberührt und stets
  durchsuchbar). **Print-Verhalten: folgt dem Toggle** — bei AUS wird der Apparat
  auch im Ausdruck weggelassen (`display:none` wirkt in `@media print`
  gleichermassen); bei AN wird er gedruckt. **CLS:** der Toggle ist
  nutzer-initiiert ⇒ der Reflow liegt binnen 500 ms nach dem Klick
  (input-exkludiert) ⇒ kein CLS-Beitrag (e2e-belegt). Default AN emittiert keine
  Regel ⇒ byte-gleich (R6).
- **A4 — «Ansicht»-Dropdown statt Chip-Leiste.** Die drei Switches liegen in einem
  Dropdown im aktionen-Slot des `ErlassLeserKopf` (`LeserAnsichtMenu.tsx`). **A11y:
  ehrliche Disclosure, KEIN `role=menu`** (Switches sind Formular-Steuerelemente —
  ein Menü verspräche eine Pfeiltasten-Bedienung, die es nicht gibt; gleiche Lehre
  wie `SprachUmschalter`): Trigger «Ansicht» mit `aria-expanded` + `aria-controls`,
  Panel = `role="group" aria-label="Darstellungsoptionen"`. **Fokus-Falle + Escape +
  Fokus-Rückgabe** an den Auslöser via `useDialogFokus`; pointerdown-ausserhalb
  schliesst. Panel **absolut positioniert ⇒ kein Layout-Shift der Seite**.
  Persistenz-/Pre-Paint-Mechanik unverändert darunter. **pdf-embed** trägt bewusst
  KEIN Ansicht-Dropdown (keine toten Steuerelemente, G2b/§13 F4).
- **A3 — Positions-Leiste = echte Breadcrumbs.** Der Sticky-`SektionKontextKopf`
  ist zu klickbaren Breadcrumbs aufgelöst (`nav[aria-label]` > `ol`/`li`, jedes
  Glied ein Button → `springeZuSektion`, letztes Glied `aria-current="location"`).
  Datenquelle bleibt die vorhandene Scroll-Spy-State (kein neuer Observer, §15).
  Overflow-/Mobil-Kürzung rein per CSS (Label `truncate`, `nav` `overflow-hidden`,
  mittlere Glieder `hidden sm:inline-flex` + «…»-Platzhalter). Der Sticky-Positions-
  Kopf bleibt — wie bisher — ein **≥ 1024px-2-Spalten-Feature** (mobil keine
  Positionsleiste).

**V2-Nachtrag (David 10.7.2026 «go zu allem», koordinierter Kopf-PR 11.7.2026) —
deklarierte Erweiterungen (überstimmen «genau drei Toggles»):**

- **B-1 — 4. Toggle «Entscheide» (Default AN).** Blendet die verlinkten BGE-Leitfall-
  Zeilen aus — **reine Referenzschicht, der Normtext ist NIE betroffen.** Mechanik =
  data-* + CSS wie die anderen Toggles: `leserOptionen.ts`-Feld `leitfaelle`,
  `html[data-leitfaelle="aus"] .lc-leser [data-leitfall-zeile]{display:none}`
  (Marker `data-leitfall-zeile` an `LeitfallZeile`). Default 'an' ⇒ CSS-No-op ⇒
  byte-gleich (R6); kein React-Re-Render (§15).
- **B-2 — Zeitraum-Filter «alle · 20 · 10 · 5 J.» (Default alle).** KEIN data-*-
  Toggle, sondern JS-Filter der client-only-`LeitfallZeile` über `r.datum` (jahr-
  genau, Q1/Bandjahr-sicher; unparsbares Datum konservativ behalten, §8) VOR der
  Sichtbarkeits-Kappung (`LEITFAELLE_SICHTBAR` 5→**10**, David 10.7.). Abo über
  **Primitiv-Selektor `useLeitfallZeitraum()`** (nur der String ⇒ Zeilen rendern nur
  bei echter Zeitraum-Änderung, nicht bei jedem anderen Toggle — §15-Zusage bewiesen).
  §8: eine voll weggefilterte Zeile verschwindet NICHT kommentarlos, sondern zeigt
  «n ältere ausgeblendet · alle zeigen» (klickbar). A11y: `role="group"`, Buttons mit
  `aria-pressed` (kein `radiogroup` → keine unerfüllte Pfeiltasten-Erwartung).
- **K-2 — Fussnoten-Chip im aktionen-Slot (`LeserFussnotenChip`).** Prominentes
  KOPF-SIGNAL «❡ N Fussnoten» (N = Summe der Sidecar-Fussnoten) UND **echter Toggle**
  (aria-pressed) auf denselben `fussnoten`-Wert wie der Dropdown-Schalter; beim
  **Einschalten** springt er zum Apparat (erst einschalten, dann `scrollIntoView` des
  ersten `[data-fn-marker]` — nie in ein display:none-Ziel). `N===0`/Sidecar noch
  nicht geladen ⇒ kein Chip (CLS-schonend, e2e-gemessen CLS 0).
- **Slot-Layout (U-PDF, EINMALIG):** Reihenfolge **Ansicht · Fussnoten · In neuem
  Reiter · Download**; das Ansicht-Dropdown öffnet mobil-sicher rechtsbündig
  (`right-0 sm:left-0`).

## §5 · Verzahnung (der Burggraben, Fedlex-Übertreffer)

- **Norm → Norm intern.** Ein SR-Verweis in Fussnote/Fliesstext, dessen
  Zielerlass wir im Volltext haben, verlinkt **intern** auf den LexMetrik-Leser
  (`/gesetze/bund/<KEY>#art_<N>`) — man bleibt im Werkzeug. Nur wo wir den
  Erlass nicht haben, bleibt der **Fedlex-Link als ehrlicher Fallback**.
- **Quelle für «haben wir den Erlass?»** ist das Register (§3, eine Quelle) —
  kein zweiter Pfad.
- **Stand-Transparenz (§8).** Solange nur ein Geltungsstand existiert (bis
  Versionierung, B3), kann der intern gezeigte Stand vom zitierten abweichen →
  der Stand wird transparent markiert, nicht stillschweigend gleichgesetzt.

### §5a · Inline-Verweis-Linker: Plural, Präambel, Popover-Struktur (W2·5d U-VERWEIS / A7+A10+A11+A13, 10.7.2026)

1. **Plural-Aufzählungen werden gliedweise verlinkt (A10).** Die Öffner
   «Artikeln N …» (Dativ-Plural) und «die|der Artikel N, M …» (Letzteres nur bei
   ≥ 2 Gliedern oder Gesetz-Signal) zerlegt `artikelnPluralVerweise` (fedlex.ts)
   deterministisch in Einzel-Glieder; jedes Glied ist ein eigener Link, die
   Anzeige bleibt der exakte Quelltext (§1). **Bounded:** die Passus-Kette ist
   typ-treu (SINGULAR-Schlüsselwort «Absatz/Buchstabe/Ziffer/Satz» = genau EIN
   Wert; Plural-Form und Abkürzungen = Wertliste mit Glied-Kopf-Guard); die Kette
   bricht an allem, was kein «Konnektor + Zahl» ist — nie über den Fliesstext
   hinaus (Referenzfall MWSTG Art. 5 = genau 5 Links art_31/35/37/38/45).
2. **Auflösungs-Modi mit §1-Vorrang.** Gesetz-Signal am Aufzählungs-Ende
   (Rangfolge: Klammer-Kürzel ∈ FEDLEX > kuratierter Genitiv-Kurztitel > bare
   Kürzel ∈ FEDLEX) ⇒ alle Glieder aufs Fremdgesetz. UNTERDRÜCKT (kein Link, nie
   ein geratener) wird bei: unbekanntem Klammer-Kürzel («(Code civil)»),
   unauflösbarem ausgeschriebenem Fremdnamen («des Bundesgesetzes vom …»),
   unbekanntem bare Kürzel («BGSA»), nicht parsebarem Glied («42octies»). Ohne
   Signal = Self; Self-Glieder linken nur, wenn das Token im eigenen Erlass
   existiert (§8, kein toter Link).
3. **Genitiv-Map ist KURATIERT, nie generisch (A11).** `GENITIV_GESETZ`
   (fedlex.ts) enthält nur eindeutige amtliche Kurztitel-Genitive («der
   Bundesverfassung»→BV, «des Strafgesetzbuches»→StGB …), jeder Eintrag gegen den
   amtlichen Kurztitel belegt; generische Wendungen («des Bundesgesetzes», «der
   Verordnung») bleiben BEWUSST ohne Eintrag. Soft-Hyphens (U+00AD) der
   Fedlex-Texte werden toleriert.
4. **aBV-Schutz im Ingress (A11, §1).** Der Ingress ist historisch (wird amtlich
   nie nachgeführt): Erlasse vor 2000 zitieren dort die BV von 1874 — «Artikel 26
   der Bundesverfassung» im ArG (1964) meint aBV 26, nicht die heutige
   Eigentumsgarantie. Präambel-Zeilen laufen darum NUR bei parsebarem Erlassdatum
   ≥ 2000 durch den Linker (`ingressVerlinkbar`, parts.tsx); sonst reiner Text.
   Artikel-FLIESSTEXT ist ungegated (BV-Zitate werden dort bei Revisionen
   amtlich nachgeführt; Belege ASYLG 121a, RVOG 184).
5. **Verweis-Popover ist strukturiert (A7):** Artikel-Wortlaut → Provenienz-Fuss
   (§7 a–d) → «Wird zitiert von · Massgebliche Entscheide» → klar abgetrennt
   «Legt aus · Amtliche Materialien» (`VerweisKontext`, wiederverwendete
   Verzahnungs-Grammatik: KontextGruppe-Hülle, Richtungs-Label als Text,
   StatusBadge-Vokabular). Kompakt Top-3 + Zähler + «Alle n»-Link; lazy aus den
   erlass-lokalen Shards (geteilte Promise-Caches, §15.3); ANS ENDE des Popovers
   angehängt ⇒ CLS 0 by construction.
6. **Materialien-Dichte-Regel (A13):** artikelscharfe Kanten prominent zuerst
   (Fundstellen-Sublabel, Behörden-Kürzel, Dokument-Stand); reine
   Erlass-Ebene-Kanten dezenter hinter dem Zähler («n Dokumente auf
   Erlass-Ebene», `<details>` — tastatur-/CLS-fest). Keine Chip-Wüste.

**Gegated:** Unit `fedlex.test.ts` (Plural-Grammatik + Negativfälle + Genitiv-Map)
+ `normText.test.tsx` (SSR-Linkmengen, MWSTG-Regressionsfall) + `verweis-kontext.test.ts`
+ e2e `verweis-u` (P2-Beweise, A9-Throttle, aBV-Negativfall) — Risiko-Pfad ⇒
`check:gegenpruefung`.

## §6 · Verweis-Ziele werden nicht geraten

Linkziele kommen aus dem, was Fedlex tatsächlich kodiert / aus dem Register —
**nie aus einer Render-Zeit-Heuristik**, die «Artikel N» reflexhaft auf den
gerade gelesenen Erlass auflöst. In einer Verordnung verweist «Artikel N» fast
immer aufs **Trägergesetz** (BGerR → BGG), nicht auf sich selbst. Bis das
positive Trägergesetz-Routing als verifizierte Datenaufgabe steht, werden
falsche Selbstverweise **unterdrückt** (§1: lieber kein Link als ein falscher).

## §7 · Golden-Regel (zwei Welten strikt trennen)

- **`golden/lexmetrik-golden.json` (Engine/Rechtslogik) ist TABU** und muss über
  den *ganzen* Batch **byte-gleich** bleiben (`golden:vergleich` = IDENTISCH =
  Beweis, dass die Rechtslogik unberührt ist). **Bricht er, ist man versehentlich
  in eine Engine gelaufen → sofort STOPP, nie das Tor aufweichen.**
- **`golden/normtext-snapshot.json` (Daten-Index)** wird bei bewusstem Normtext-
  Zuwachs **regeneriert und neu gesegnet** (self-consistent sha, kein externer
  Erwartungswert) — **mit adversarialer Gegenprüfung** und **genau einer**
  Re-Segnung pro Batch (alle golden-brechenden Änderungen zuerst landen, dann ein
  Regen-Block, dann ein Pathspec-Commit; `--stat`-Dateizahl gegen die add-Liste).
- **Sidecar-Anreicherungen (§3) brechen den Index nicht** → bleiben byte-gleich.

## §8 · Keine stillen Lücken

Jede nicht abgebildete Information ist **sichtbar markiert** (z. B. «maschinell»,
«nicht abgebildet», «Stand abweichend»). Kein `verified`/«vollständig» ohne
Deckung. Bilder, die wir als Bild zeigen (math. Formeln liefert Fedlex als
Bild), bleiben Bild — kein erfundenes OCR/LaTeX, ehrlich dokumentiert.

---

## Was bewusst NICHT gilt (Audit-widerlegt)

Diese im Audit geprüften Punkte sind **kein** Defizit und werden **nicht**
gebaut: Titel-`<br>`-Plättung, Absatz-`<p>`-in-`<table>`-Verschlucken, «Fussnoten-
Apparat per Default aus» (galt bis W2·5d — **abgelöst durch die G2b-Fussnoten-
Unifizierung §4c: Marker/Apparat liegen jetzt immer im DOM, Default AN; «AUS»
lässt sie seit U-KOPF/A1 VERSCHWINDEN (display:none), der Normtext bleibt stets
durchsuchbar**), volle
`rowspan`-Logik (rowspan/verschachtelte
Tabelle → ehrlicher Text-Fallback), «N.—»-Spacing,
`art-`-vs-`art_`-Anker, «Deeplink vom Renderer verworfen» (wird genutzt). Details:
`AUDIT-FEDLEX-DARSTELLUNG-2026-06-28.md`, Abschnitt «Widerlegt».

> **Korrektur 29.6.2026 (verifiziert gg. Filestore-HTML):** Der Audit-Schluss
> «`<th>`-Tabellen brauchen kein `colspan` (Kopf+Daten tragen dasselbe)» ist an
> **GebV SchKG Art. 20 falsifiziert** — dort trägt **nur der Kopf** `colspan="3"`,
> die 6 Datenzellen sind colspan-los → Kopf 2 ≠ Zeile 6 = zerrissen. Neue Regel:
> `colspan` wird in **beiden** Markup-Varianten expandiert und die Staffel-Spanne zu
> einer logischen Zelle verdichtet (Tabellen-Regelwerk T-A2/T-A3/T-A6 in
> `FAHRPLAN-GESETZESDARSTELLUNG-BUND.md`). Nur `rowspan`/Verschachtelung bleibt Fallback.
