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
| **Gliederungs-Guide** (vertikale Tiefen-Linie) | `border-l border-guide` | `--guide-gliederung` (10 % / 14 %) | `renderSektion` (nur `linien.guideEbene`, aufbau-basiert — §4b-A) |
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
spacing`, 20px/Stufe): Desktop Tiefe *n* → `n × einzug`, gedeckelt bei 3 Stufen;
**mobil kollabiert der Einzug** (`pl-0 sm:pl-einzug`), die eine Guide bleibt als
einzelne 1px-Linie am Spaltenrand (statt ~5 Linien × ~24px). **CLS 0:** Einzug =
`padding`, Guide = `border` darauf → Umschalten/Kollabieren bewegt keinen
Textknoten.

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
`data-guide-auto="an|aus"` an den `.lc-leser`-Root; CSS wertet es aus.

| Aufbau (`strukturTiefe`) | `guideEbene` | Auto-Default | Wirkung |
|---|---|---|---|
| **0** (flache Artikelliste, z. B. VMWG, Kanton-§) | `null` | — | Kein Guide; Artikel trennt der feine Artikel-Trenner. |
| **1** (eine Gliederungsebene, z. B. Kurzerlass, Staatsvertrag) | 0 | **AN** (Dichte ≥ 2) | Die EINE Ebene wird sichtbar («flache Ebene sichtbar»). |
| **2** (zwei Ebenen, z. B. ArG) | 1 | **AN** (Dichte ≥ 2) | Guide auf der inneren Gruppierung; die äussere trägt Typo + Struktur-Trenner. |
| **≥ 3** (tiefe Kodifikation, z. B. BV, OR, ZGB) | 1 | **AUS** | Guide unsichtbar, **Einzug bleibt** — die vielen Ebenen ertrinken nicht (Rangfolge §4b: Typo > Einzug > Guide). |

**Zusatz-Boden:** bei `dichteAmGuide ≤ 1` (Median 1 Artikel je geführter Sektion)
bleibt `autoGuide` **AUS** — der Guide wäre sonst ein Per-Artikel-Barcode statt
einer Gruppierung.

**Empirische Schwellen-Herleitung** (`node scripts/linien-korpus-verteilung.mjs`,
1135 Sidecar-Erlasse). Gliederungstiefe-Verteilung: `Tiefe 0: 900 (79 %) · 1: 64 ·
2: 98 · 3: 58 · 4: 12 · 5: 3`. Der Bruch liegt sichtbar zwischen «flach/mittel»
(≤ 2 Ebenen) und «tiefe Kodifikation» (≥ 3): ab drei gleichzeitig sichtbaren
Überschriften-Ebenen trägt die Typo-Staffel + der horizontale Struktur-Trenner + der
Einzug die Hierarchie bereits vollständig — ein zusätzlicher vertikaler Strich je
Sektion wird zum «Barcode» (ZGB Art. 684 / OR Art. 319, der Ur-Befund von R4).
Daraus die Schwellen `TIEF_AB = 3`, `DICHTE_MIN = 2` (`LINIEN_SCHWELLEN`). Ergebnis:
153 Erlasse zeigen den Guide im Auto-Default (flache/mittlere Gesetze); die 73 tiefen
Kodifikationen bleiben ruhig.

**Referenz-Verdikte** (im Tor gegated, positiv+negativ): ZGB (Tiefe 5) → **ruhig** ·
OR (Tiefe 4) → **ruhig** · ArG (Tiefe 2) → **Guide auf Ebene 1 sichtbar** · VMWG
(Tiefe 0) → **kein Guide** · Kurzerlass/Staatsvertrag (Tiefe 1) → **Guide auf
Ebene 0 sichtbar**.

**Maschinell gegated:** `check:linien-kanon` (Nachfolger von R1/R4, in `npm run
gate`) importiert dieselbe `linienProfil`-Funktion, beweist die korpusweiten
Invarianten + die Referenz-Verdikte + die Reader-/CSS-Verdrahtung (kein Drift);
e2e `leser-linien-kanon`/`gesetze-ux-g3a`/`leser-optionen` beweisen das gerenderte
Ergebnis (ZGB ruhig, ArG sichtbar, ≤ 1 Guide-Stapel). **Wortlaut byte-gleich** (nur
Klassen/Attribute), Engine-Golden byte-gleich.

### §4c · Leser-Options-Leiste (W2·5d G2a, 4.7.2026)

Drei persistente, **rein visuelle** Lese-Umschalter im Reader-Kopf (genau drei,
keine Wucherung, Auftrag David): **Linien** (Gliederungs-Guide + Einzug),
**Fussnoten** (Marker-Prominenz), **Verweise** (Verweis-Link-Unterstreichung).
Verbindliche Bau-Regeln:

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
4. **Fussnoten-«AUS» DÄMPFT, versteckt NIE** (R9/§8): nur `color`/`opacity`, nie
   `display:none` — der Marker + der Fussnotentext bleiben im DOM, per Ctrl+F/
   Print/Screenreader erreichbar. **Verweise-«AUS»** unterdrückt nur die
   Unterstreichung; Farbe und Anker/Funktion bleiben.
5. **Global ⇒ beide Reader-Instanzen** (Einzelansicht + jedes Split-View-Pane)
   folgen einer Wahl ohne Re-Render. a11y: echte `role="switch" aria-checked`,
   sichtbarer Fokus über die globale `:focus-visible`-Outline.

**Gegated:** e2e `leser-optionen` (R6/R9 positiv+negativ + Persistenz/Reload) +
`golden:vergleich` byte-gleich.

**G2b-Ergänzung (4.7.2026) — Fussnoten-Unifizierung umgesetzt:** Es gibt jetzt
**EINE** Fussnoten-Bedienung: der `data-fussnoten`-Options-Toggle. Der frühere
`fussnotenAuf`-React-Schalter (Such-Leiste) ist **entfernt**. Marker UND Apparat
(Artikelfuss-/Kopf-/Sektions-Fussnoten, Aufhebungsnotiz) liegen **IMMER im DOM**
(nur an `artOffen` gebunden) — «AUS» dämpft rein per CSS (`[data-fn-apparat]`),
versteckt nie (R9). **Default AN**, weil R9 «immer im DOM» (Ctrl+F/Print/Screen-
reader, §15-Funktions-Treue) mit «Default aus = nicht gerendert» unvereinbar ist
und §3.1 die amtliche Substanz auf sichtbar setzt — die frühere Regel «Apparat per
Default aus» ist damit für den options-getriebenen Reader abgelöst (siehe unten).
Der **Linien**-Default ist mit U-LINIEN/A8 aufbau-basiert festgelegt (§4b-A) — er löst
den zwischenzeitlich grundart-abhängigen G3a/K11-Default ab.

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
Unifizierung §4c: Marker/Apparat liegen jetzt immer im DOM, Default AN, «AUS»
dämpft nur; R9-Funktions-Treue schlägt die alte Default-aus-Regel**), volle
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
