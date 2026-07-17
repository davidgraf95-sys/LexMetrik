# FAHRPLAN Gesetzes-UX — Darstellungs-Reglement, Leser-Kopf, Übersichten, Klassifikation

Stand: 4.7.2026 · Auftrag David «Gesetzesdarstellung & UX». Leitlinie: **User
Experience, State-of-the-Art-Webdesign — Fedlex ist die Mindestlatte, nicht die
Decke.** Methode David (wörtlich): «erruierst du was es für verschiedene
grundarten gibt, klassifizierst die erlasse und machst für jedes einzelne die
passende designvorschrift».

Diese Datei ist die **einzige Detailquelle** (§14) für den ROADMAP-Schritt
`W2·5d` (Abschnitt 8). Sie ist Bau-Spec: Opus baut ohne Rückfragen aus ihr. Das
Verbindliche ist der Code/die Daten; alle Werte binden an bestehende Tokens
(`src/index.css`, `tailwind.config.js`) — neue Tokens nur, wo heute ein
**untokenisierter/arbitrary** Wert steht (namentlich ausgewiesen und empirisch
belegt).

Evidenz-Anhang (nicht nochmal hier aufgeführt): Ist-Aufnahme + Fedlex-Messwerte
+ SotA-Patterns + Grundarten-Klassifikation liegen in
`docs/ux-audit-2026-07/` (`reader/`, `uebersichten/`, `fedlex/`,
`erlass-klassifikation.json`, `reader/measure.mjs`). Die Kritik-Runde
(Abschnitt 0) ist zusätzlich am Code verifiziert (Datei:Zeile in der Konsequenz-
Spalte).

---

## 0 · Kritik-Einarbeitung (Council-/Review-Runde, verifiziert)

Zwei unabhängige adversariale Durchgänge auf die Entwurfs-Spec. Jeder Befund ist
gegen den Code geprüft (Grep-Beleg). **Kein Befund wurde als unbegründet
verworfen** — alle vier Blocker/Wichtig-Punkte sind empirisch bestätigt, die
Nice-Punkte sind tragfähige Scope-/Ehrlichkeits-Korrekturen. Ein Punkt (K14) ist
reine Bestätigung ohne Änderungsbedarf.

| # | Befund (verkürzt) | Verdikt | Konsequenz in dieser Spec (Beleg) |
|---|---|---|---|
| **K1** | Haupt-«Ist»: Guide sei *untokenisiert / opak / gemessen gray-200 / §13-F7-Verstoss*. | **berechtigt — empirisch widerlegt** | `grep gray-200\|e5e7eb` in `src/pages/gesetz-leser`+`src/components/normtext` = **0 Treffer**; `--line:color-mix(in srgb,var(--ink-900) 10%,transparent)` (`index.css:49`, dunkel 14% `:157`), Guide = `border-l border-line/60` (`inhalt.tsx:851`) → schon tokenisiert/transparent. **D-A + ROADMAP-Text als reiner Semantik-Refactor umgeschrieben** (4 Ad-hoc-Opazitäten → 3 benannte Rollen, max 1 Guide). Alle «opak/untokenisiert/F7-Bug/gray-200»-Behauptungen gestrichen; Token-Zielwerte an das **reale** `--line` (10%/14%) gemessen, nicht an ein Phantom. |
| **K2** | Kanton-Anker `#par-12` bricht Prerender/Golden/Reader-Regex/geteilte Deep-Links (§15 Funktions-Treue). | **berechtigt — Blocker** | `id=art-${artikel}` universell (`parts.tsx:183`), Copy-Link `#art-` (`:168`), Reader-Regex `/^#art-(.+)$/` (`inhalt.tsx:453/510`), Scroll-Spy `replace(/^art-/…)` (`:571`). **Anker bleibt ÜBERALL `#art-<token>` (opak)**, nur das **sichtbare Label** wird «§ 12». Optionaler `par-`-Alias nur mit Regex-Erweiterung `/^#(art\|par)-(.+)$/` UND Weiter-Auflösung alter `#art-`-Links. Trennung Label≠Anker explizit in §1.2⑥ + R8. |
| **K3** | G2 behauptet «golden byte-gleich», bündelt aber DOM-ändernde Arbeit (Fussnoten-Fix, Kopf-Merge, Sticky-opak). R6 gilt nur für reine `data-*`-Toggles. | **berechtigt — wichtig** | **G2 gesplittet: G2a** (Toggles/Persistenz/Pre-Paint = byte-gleich, R6 gilt) + **G2b** (Fussnoten-Render-Fix + Kopf-Merge + Sticky-opak + Sticky-Kontextkopf + «Zitat kopieren» = golden-**ändernd**, Neu-Abnahme). |
| **K4** | Gemeldeter «Fussnoten-`sup`-Count = 0»-Bug ist vermutlich Mess-Artefakt. | **berechtigt — bestätigt** | Marker existiert als `<button class="num align-super" aria-label="Fussnote N">` (`ArtikelBody.tsx:98`), **nicht** `<sup>`/`a[href^=#fn]`. §2.1 umformuliert: **erst Selektor prüfen**, nicht blind «Bug» fixen; der Toggle schaltet die vorhandenen Button-Marker. |
| **K5** | Fussnoten-Toggle «AUS» versteckt amtliche Substanz ohne Sichtbarkeits-Wächter (§8) — stille Substanz-Unsichtbarkeit. | **berechtigt — wichtig** | Neuer **Sichtbarkeits-Wächter** in §2.1/§2.2 + R9: «AUS» **dimmt** die Marke oder behält eine minimale Affordanz (dezente Ziffer), **nie `display:none`**; Fussnotentext liegt ohnehin dauerhaft im DOM (`#fn-…`, `ArtikelBody.tsx:90`). |
| **K6** | `bestimmungsEtikett` aus Heuristik-Signal `paragrafZaehlung` steuert ein zitat-nahes Label; falsches Signal ⇒ falsch zitierte Fundstelle. | **berechtigt — wichtig** | Seed-Wert wird als **`entwurf` (§8)** markiert bis Kanton-Verifikation gegen die amtliche Quelle (Kantone sind intern konsistent). `check:grundart` prüft **Präsenz + Konsistenz**, nicht Richtigkeit; das Etikett wird **nicht** als geprüftes Zitat-Label ausgeliefert, solange nur heuristisch (§4.2). |
| **K7** | R1/`check:linien-kanon` zu breit — flaggt/verbiegt ~30 legitime Chrome-`border-line` (Such-Boxen, Buttons, Drawer, Nav, Fussnoten-Tooltip, Tabellen-Aussenboxen). | **berechtigt — bestätigt** | Chrome-Borders belegt: `ArtikelBody.tsx:102/198/280/328/359`, `inhalt.tsx:704/725/730/946/949/957/990/992`. **R1 auf STRUKTURELLE Normtext-Container eingeschränkt** (Marker `data-normtext-linie` / Allowlist), Chrome-Borders + Brass-Links + Tabellen-Aussenbox ausdrücklich **erlaubt**; Tabellen-Aussenbox bekommt eine definierte Tabellen-Rolle (§1.3 R1). |
| **K8** | Rechtsgebiets-Kuration (§3.4/G6) nicht ehrlich bezifferbar, ist ein Fachurteil und kollidiert mit der Abnahme-Zeitsperre bis 1.12.2026. | **berechtigt — Blocker** | G6 = **«Gerüst jetzt, Vollkuration später»**: Startumfang hart auf **6–8 Querschnitts-Themen** begrenzt, nur für Querschnitts-Erlasse; einwertige Grund-Zuordnung aus dem **schon vorhandenen** Register-Feld `rechtsgebiet` auto-geseedet, nur die mehrwertige Delta ist Handarbeit; Vollkuration als eigener niedrigprioritärer Strang, der Davids Beleg **erst nach** der Zeitsperre erhält; Tor tolerant («unzugeordnet» = zulässig). |
| **K9** | G3 mischt Risiko-Klassen (reine Darstellung + Anhang/Tarif-**Extraktion**) in einem PR — §14 Ziff. 2; «2 Sessions» unterschätzt (annex_* ist Grossvorhaben). | **berechtigt — Blocker** | **G3 gesplittet: G3a** (reine Grundart-Darstellung: Etikett/Präambel/PDF-Rahmen/Live-Karte/Lesespalte — golden byte-gleich-Ziel, `gegenpruefung: n/a`) + **G3b** (Anhang-Block + Tarif-Anhang→echte Tabelle als eigener **Risiko-Pfad**, `check:gegenpruefung`, gekoppelt an `FAHRPLAN-TARIF-TABELLEN-STUFE2.md` + den `annex_*`-Plan aus `FAHRPLAN-NORMTEXT-DARSTELLUNG.md`, **mehrere Sessions**). |
| **K10** | Command-Palette als SotA-Neubau überzeichnet — Artikel-Fuzzy-Suche existiert (`useUniversalSuche`/`artikelVolltext.ts`); Doppel-Index-Risiko. | **berechtigt — Präzisierung** | §3.2 als **«globaler Cmd/Ctrl-K-Einstieg + Norm-Query-Parser auf der BESTEHENDEN `artikelVolltext`-Quelle»** neu gefasst; **kein zweiter Index**. Das Neue — Parser «Art. 336c OR» → `#art_`-Deep-Link — als expliziter Akzeptanzpunkt, empirisch zu verifizieren. |
| **K11** | Default «Gliederungs-Linien AUS» für den 80%-Fall im tiefen Kodex fraglich; «ruhig» ist ästhetisch, nicht getestet. | **berechtigt — messbare Annahme** | Default **grundart-abhängig**: flacher Erlass → AUS, **KODIFIKATION → 1 Guide AN** (§2.1). Als **messbare Annahme** markiert (A/B gegen die Referenz-Erlasse in `docs/ux-audit-2026-07/reader`), nicht als Fakt. |
| **K12** | Fehlende SotA-Lese-Patterns: (a) persistenter Sticky-Section-Kontextkopf «Buch › Titel › Art. N»; (b) «Artikel mit Zitat kopieren» (billig, Provenienz liegt vor). | **berechtigt — Aufnahme** | Beide in **G2b** aufgenommen: Sticky-Kontextkopf auf der vorhandenen Scroll-Spy-Infra (`inhalt.tsx:571`); «Zitat kopieren» = Wortlaut + amtliche Fundstelle + Stand (§7 a–d liegt vor), DOM-neutral. |
| **K13** | Kollisions-Attribution falsch: nur V1c/V1b (W2·7-VZUI) berührt `parts.tsx`; M5 (W2·6a-MAT) = `KontextPanel`, **nicht** `parts.tsx`; V1a ist schon gemergt. | **berechtigt — bestätigt** | §5/§8-@meta korrigiert: **harte `parts.tsx`-Kette nur gegen V1c/V1b**; M5 = reine `KontextPanel`-Kollision (nur G2 betroffen); **V1a (#118/#121/#122) als erledigt** vermerkt. |
| **K14** | Reassurance: Typo/Linien-Reform kollidiert **nicht** mit den V1a-Verzahnungs-Elementen (`KantenChip`=Brass, ausser R1-Scope); CLS-0-Claim hält (`content-visibility` real). | **bestätigend — keine Änderung** | Nur bestätigt: `KantenChip` liegt in `src/components/verzahnung/` (ausser R1-Scope), Brass ist eigene Sprache (§1.1/4). Auflage: Sequenzierung V1c/V1b → G1–G3 (oder Worktree+Rebase) und **Pre-Paint-Inline-Script vor dem ersten Paint** einhalten (kein Marker/Guide-Flash). |

---

## 1 · Architektur-Entscheid: WOHIN das Reglement gehört

David formuliert «ein eigenes Domänen-Reglement `DESIGN-REGLEMENT-GESETZE.md`».
**Es existiert bereits `DESIGN-REGLEMENT-NORMTEXT.md`** (Stand 28.6., Dach =
`DESIGN-REGLEMENT.md`, gebunden über CLAUDE.md §13). Eine fünfte, konkurrierende
Reglement-Datei verstiesse gegen §14 Ziff. 1 (**nie zweiter Einstieg**) und
gegen «Regelmässig aufräumen».

**Entscheid (Design-Architekt, zur Bestätigung an Fable/David):** Der Inhalt
landet **als neue Teile in `DESIGN-REGLEMENT-NORMTEXT.md`**, dessen
Geltungsbereich von «Bundesgesetze/Verordnungen» auf **alle Gesetze (Bund +
Kanton + International)** verbreitert wird. Kopfzeile dort anpassen; optional
Datei zu `DESIGN-REGLEMENT-GESETZE.md` umbenennen (ein `git mv` + Dach-Verweis
in `DESIGN-REGLEMENT.md` nachziehen), falls David den Namen will — inhaltlich
identisch. **Diese FAHRPLAN-Datei trägt die Spec; die PRs G1/G3a falten sie ins
Reglement.** Der Rest des Dokuments spricht neutral vom «Gesetzes-Reglement».

---

## 2 · Darstellungs-Reglement Gesetze

### 2.1 · Gemeinsames visuelles Dach (gilt für ALLE Grundarten)

Prinzip (aus Fedlex-Messung + SotA doppelt belegt): **Ruhe durch Reduktion.
Hierarchie über Typo-Abstufung + Einzug, NICHT über Linien.** Linien sind
Feinlinien, kein Gestaltungsmittel. Der Fliesstext ist der Held; die Struktur
flüstert (Gegen-Lehre zu Fedlex: dort «schreit die Struktur, der Rechtstext
flüstert»).

#### D-A · EINE Linien-Sprache (Linien-Kanon) — Semantik-Refactor, kein Bug-Fix

**Klarstellung nach Kritik K1:** Es gibt **keinen** untokenisierten/opaken
`gray-200`-Guide. Der Guide ist bereits `border-l border-line/60`
(`inhalt.tsx:851`); `--line` ist tokenisiert und transparent
(`color-mix(in srgb, var(--ink-900) 10%, transparent)`, hell `index.css:49` /
dunkel 14% `:157`). Was über weissem Papier zufällig wie `rgb(229,229,229)`
aussieht, ist die **Render-Erscheinung** dieses transparenten Tokens — kein
`F7`-Verstoss.

**Der reale Befund** ist ein **Semantik-Problem**, nicht ein Farb-Bug:
1. Für strukturgleiche Trenner werden **vier** Ad-hoc-Opazitäten desselben
   `--line` frei gewählt (Artikel `/70`, Sektion voll|`/50`, Gruppierung `/60`,
   Tabellenzeile `/60`, Fussnoten `/50`, Kopf voll) — nicht benannt, nicht
   begründet.
2. Bis zu 6 parallele 1px-Linien **stapeln** sich (ZGB Art. 684 / OR Art. 319)
   → «Barcode/Gleisbett».

**Soll — genau DREI benannte Linien-Rollen, sonst keine.** Die Werte werden am
**bestehenden** `--line` gemessen (nicht an einem Phantom): Artikel-Trenner und
Guide behalten die heutige Feinheit (≈10%/14%), der oberste Struktur-Trenner
darf eine Spur kräftiger sein. Alle in `src/index.css` `:root` **und**
`html.dark`:

```css
/* :root (hell) — gemessen am bestehenden --line (10%) */
--guide-gliederung: color-mix(in srgb, var(--ink-900) 10%, transparent);
--rule-artikel:     color-mix(in srgb, var(--ink-900) 10%, transparent);
--rule-struktur:    color-mix(in srgb, var(--ink-900) 14%, transparent);
/* html.dark — helle Tinte auf Dunkel wirkt feiner, darum etwas kräftiger */
--guide-gliederung: color-mix(in srgb, var(--ink-900) 14%, transparent);
--rule-artikel:     color-mix(in srgb, var(--ink-900) 14%, transparent);
--rule-struktur:    color-mix(in srgb, var(--ink-900) 20%, transparent);
```

In `tailwind.config.js` unter `colors` ergänzen:
`guide: 'var(--guide-gliederung)'`, `rule: { artikel: 'var(--rule-artikel)',
struktur: 'var(--rule-struktur)' }`. (Diese Tokens **ersetzen** die 4 Ad-hoc-
Opazitäten in den strukturellen Normtext-Containern — nicht die Chrome-Borders,
siehe K7/R1.)

| Rolle | Token/Klasse | Wo (strukturell) | Ersetzt heute |
|---|---|---|---|
| **Artikel-Trenner** (zwischen Art. N und N+1) | `border-t border-rule-artikel` | `parts.tsx:184` | `border-line/70` |
| **Struktur-Trenner** (oberste Sektionen: Teil/Titel/Abschnitt) | `border-t border-rule-struktur` | `parts.tsx:367` (ebene≤1) | `border-line` voll / `/50` |
| **Gliederungs-Guide** (vertikale Tiefen-Linie) | `border-l border-guide` | `inhalt.tsx:851` (renderSektion) | `border-line/60` |

**Harte Regeln der Linien-Sprache:**
1. **Höchstens EINE vertikale Guide-Linie gleichzeitig.** Tiefe > 1 wird über
   **Einzug** getragen, nie über eine zweite parallele Linie. (Killt das
   Gleisbett; Fedlex-AVOID «flache Hierarchie nur über Schriftgrösse» und unser
   Barcode-Befund zugleich.)
2. Innere Sektionen (ebene ≥ 2) und randtitel-promotete Knoten («A.», «II.»)
   tragen **keine** Horizontal-Linie (schon so in `parts.tsx:367` — bleibt).
3. Strukturelle Tabellen-**Zeilen**trenner (`ArtikelBody.tsx:202/298/343/361`)
   nutzen `border-rule-artikel`. Die **Aussenbox** einer Tabelle
   (`ArtikelBody.tsx:198/280/328/359`) ist **Chrome**, nicht Struktur → sie
   bekommt die dokumentierte Rolle `border-rule-struktur` (oder bleibt
   `border-line`, siehe R1-Allowlist) — sie ist **nicht** verboten.
4. Brass-Kanten (`border-l-4 border-brass-500` = Ziel-/Zitat-Hervorhebung) und
   Brass-Links (Fussnoten-Tooltip `[&_a]:text-brass-700`, `ArtikelBody.tsx:102`)
   sind eine **eigene, dokumentierte** Sprache (Interaktion/Sprungziel), **nie**
   mit der Linien-Sprache vermischt — bleiben.

#### D-B · Typo-Skala fürs Lesen (konkrete Werte)

Fedlex misst 14px/lh 1.5 sans, `#454545`, Flatterrand, ~115 ch (zu breit). SotA:
Body ≥ 16px, Zeilenmass ~66 ch, lh 1.5–1.6. **Unser 18px/1.6 Serif ist bereits
über Fedlex** — der Fehler ist die **Zeilenlänge** (Body läuft auf arbitrary
`max-w-[52rem]`/`[56rem]`, `inhalt.tsx:1043`; mobil bis **~16 ch**).

| Element | Token (bestehend) | Soll-Wert | Ist-Fehler |
|---|---|---|---|
| Fliesstext | `text-body-l` + `font-serif` | 18px / lh 1.6 | ok (lh 1.625→1.6 vereinheitlichen) |
| **Lesespalten-Breite** | **`max-w-reading` (40rem)** | 40rem ≈ 66–71 ch | **arbitrary `max-w-[52rem]/[56rem]` (`inhalt.tsx:1043`) → auf `max-w-reading`** |
| Textausrichtung | — | `text-left` (Flatterrand) | ok (nie Blocksatz) |
| Textfarbe Fliesstext | `text-ink-800` | gedämpft (Fedlex-Lehre) | heute ink-900 rein → auf **ink-800** |
| Artikelnummer | `.num` + `text-base font-bold` | 16px mono | ok |
| Randtitel/Sachüberschrift | `margStufeStil` (serif) | siehe D-C | ok |
| Gliederungs-Titel (Sektion) | `text-h2/h3/body-l/base` je ebene | max h2 (25.6px) | ok — moderater als Fedlex 29px |

Silbentrennungs-Fix (mobil «Ge-werbes», «übermässi-gen»): sobald die Lesespalte
`max-w-reading` respektiert und der Einzug mobil kollabiert (D-D), verschwindet
das ~16-ch-Problem. Zusätzlich `hyphens: manual` (nicht `auto`) auf dem
Normtext-Body — deutsche Auto-Silbentrennung an schmalen Spalten ist der
sichtbare Treiber.

#### D-C · Randtitel-Hierarchie (ZGB-Härtefall)

`margStufeStil` (`helpers.tsx:119`) bleibt die eine Quelle, aber die Tiefe wird
**typografisch** getragen (Gewicht/Grösse), der Guide zeigt **nur die eine**
aktuelle Verschachtelung. Regel: Blatt (Sachüberschrift) `text-base
font-semibold text-ink-800`; oberste Marginalie `uppercase tracking-wide
text-ink-500`; dazwischen `text-ink-600`. **Kein** hängender-Einzug-Bruch bei
mehrzeiligen Randtiteln (Fedlex-AVOID «1. Im / Allgemeinen»): `text-indent`-
Schutz — die Fortsetzungszeile rückt auf die Titel-Startspalte ein
(`padding-left` + `text-indent: -1em` am Randtitel-Container).

#### D-D · Weissraum-Rhythmus + Einzug-Skala

Artikel-Abstand `mt-7 pt-7` (28px, `parts.tsx:184`) bleibt. Sektions-Abstände
`mt-8/6/5/4` je ebene bleiben. **Neu: Einzug-Skala** ersetzt die
Linien-pro-Ebene. Ein Token in `tailwind.config.js` `spacing`:
`einzug: '1.25rem'` (20px/Stufe). Desktop: Tiefe *n* → `padding-left: n ×
einzug` (gedeckelt bei 3 Stufen = 60px), **eine** Guide links.
**Mobil (< 640px / Container `@`): Einzug kollabiert auf 0**, Guide bleibt als
einzelne 1px-Linie am Spaltenrand (statt 5 Linien × ~24px = 120px Fraß). Das ist
der Kern-Fix des Mobil-Kernproblems. **CLS 0:** der Einzug ist `padding`, die
Guide `border` darauf — Umschalten/Kollabieren bewegt keinen Textknoten
(bestätigt K14).

#### D-E · Hierarchie-Prinzip (Rangfolge, verbindlich)

> **Typo (Gewicht/Grösse) > Einzug > eine dezente Guide-Linie.** Farbe/Boxen nie.
> Struktur ordnet sich dem Fliesstext unter, nie umgekehrt.

---

### 2.2 · Designvorschrift JE GRUNDART

Steuergrösse = **`grundart`** (neues Register-Feld, Abschnitt 5). Jede Grundart
nennt ihren Referenz-Erlass als Sichtprobe. Was nicht genannt ist, folgt dem
Dach (2.1).

**① KODIFIKATION** — Referenz **ZGB** (`docs/ux-audit-2026-07/reader/zgb-684-*`)
- Tiefe Hierarchie (Teil › Titel › Kapitel › Abschnitt). Navigator/TOC-Baum
  **persistent** (Scroll-Spy, G2b). Guide + Einzug-Skala streng nach D-D:
  **max 1 Guide, mobil Einzug 0** — behebt Art. 684 (5 Linien → 1).
- **Default: 1 Guide AN** (K11 — tiefer Kodex braucht Orientierung).
- Schlusstitel/UeB (`disp_*`) als eigener abgesetzter Struktur-Block.
- Sichtprobe-Ziel Art. 684 mobil: ≥ 40 ch/Zeile (heute ~16).

**② STANDARD_ERLASS** — Referenz **BV**
- Der Normalfall. Guide **nur** bei Tiefe 2–3, sonst gar nicht. `max-w-reading`.
- **Default: Linien AUS** (flach genug).

**③ ERLASS_MIT_ANHANG** — Referenz **VZV** (+ 8 Kodifikationen-mit-Anhang:
ZPO/StPO/ParlG/VTS/KVV/BVG/IVG/AHVG)
- Anhänge (`annex_*`) als **eigener, klar abgesetzter Block** NACH dem
  Dispositiv, eigene Überschrift «Anhang N» (Struktur-Trenner), im TOC verlinkt.
  **→ Rendering in G3b (Risiko-Pfad), nicht G3a.**
- Tabellen als **echte `<table>`** in `lc-scroll-x`, Bilder/Formeln als `<img>`
  in Bild-Kachel. Verzahnt mit `FAHRPLAN-TARIF-TABELLEN-STUFE2.md` + dem
  `annex_*`-Plan aus `FAHRPLAN-NORMTEXT-DARSTELLUNG.md`.

**④ FLACHER_KURZERLASS** — Referenz **VMWG** (`vmwg-desktop.png`)
- Heute: KEIN Gliederungsbaum, KEIN Linien-Schalter, **volle Breite ~59 ch**.
  Soll: **`max-w-reading` trotzdem** (Lesespalte gilt IMMER). Schlichte
  Artikelliste, kein Guide (Default AUS). Kopf-Options-Leiste konsistent
  (Linien-Toggle sauber ausgeblendet mit Begründung, nicht «fehlt einfach»).

**⑤ STAATSVERTRAG** — Referenz **LugÜ** (`lugue-intl-*`; + 6 mit Anhang: HKÜ/
FZA/HAdoptÜ/ICAO-Übk./Staatenlose)
- **Präambel** (`preface`/`preamble`) als eigener ruhiger Block über Art. 1,
  serif, ohne Nummerierung. Protokolle/Zusatzabkommen als abgesetzte
  Struktur-Sektionen. Anhänge wie ③ (→ G3b).
- Kopf-Label **«Staatsvertrag»** (nicht «Bundesgesetz» — `erlassTyp`-Feld, §5).
- Mobil-Fix Langtitel (8 Zeilen): Langtitel **kollabierbar** (`line-clamp-2` +
  «… mehr»), Rubrik-Route korrekt (`International`, nicht `/bund/`).

**⑥ KANTON** — Referenz **AG-291.150** (`kanton-zh-*`)
- **§- vs. Art.-Zählung** über Signal `paragrafZaehlung` → neues Etikett-Feld
  `bestimmungsEtikett: 'art' | 'paragraf'` (§5). **Nur das sichtbare Label**
  wird «§ 12» (Body/Marke/Print).
- **KRITISCH (K2) — Anker ≠ Label:** Der Anker-`id` bleibt **überall**
  `#art-<token>` (opakes Token, nicht semantisch) — Prerender/Golden/Reader-
  Regex/geteilte Deep-Links dürfen nicht brechen (§15 Funktions-Treue). Ein
  `#par-`-**Alias** ist nur zulässig, wenn die Reader-Regex auf
  `/^#(art|par)-(.+)$/` erweitert wird **und** alte `#art-`-Links weiter
  aufgelöst werden (siehe R8). Standard: **kein** neuer Anker, nur neues Label.
- **§-Etikett nur als `entwurf` (K6):** Das aus der Heuristik `paragrafZaehlung`
  abgeleitete Etikett wird pro Kanton gegen die amtliche Quelle verifiziert,
  bevor es als geprüftes Zitat gilt; bis dahin `status: entwurf` (§8).
- Flache Gliederung → Guide meist entfällt (Default AUS). Randtitel je
  Bestimmung wie D-C.
- **Tarif-Anhang als echte Tabelle** (heute Fliesstext) — wie ③, **→ G3b**.
- Kopf-Label «Kanton XX · Gesetz|Verordnung» (`erlassTyp`-Feld).

**⑦ PDF_EMBED** — Referenz **EMRK**
- iframe-Rahmen `rounded-lg border border-rule-struktur` (heute `border-line`),
  konsistenter Kopf + `⬇ PDF herunterladen`-Chip. Das PDF **ist** die amtliche
  Fassung (§7/§8, kein Extraktionsrisiko). Kein Body-Reglement anwendbar.

**⑧ LIVE_VERWEIS** — Referenz **DSGVO**
- Verweiskarte statt Render: prominenter amtlicher `quelleUrl`-Link, `stand`,
  ehrlicher Hinweis (§8) «nicht als In-App-Volltext gehostet». Kein Body.

> **«Einheitliche Regeln, keine Gleichmacherei» (David):** Alle Grundarten
> teilen Dach 2.1 (Linien-Sprache, Lesespalte, Typo-Skala, Weissraum). Sie
> **unterscheiden sich nur dort, wo die Erlass-Struktur es erzwingt** (Präambel,
> Anhang, §-Etikett, PDF-Rahmen). Die Vorschrift ist pro Grundart *bestimmt*,
> nicht *frei*.

---

### 2.3 · Maschinell prüfbare Regeln (Lint / Test / Tor)

| # | Regel | Mechanik | Ort |
|---|---|---|---|
| R1 | **Nur STRUKTURELLE Normtext-Container** (Artikel-/Sektions-Trenner + vertikaler Guide, markiert per `data-normtext-linie` bzw. Allowlist) nutzen ausschliesslich die 3 Linien-Klassen (`border-rule-artikel`, `-struktur`, `border-guide`) — kein Ad-hoc `border-line/\d+` **an diesen Containern**. **Chrome-Borders** (Such-Boxen/Buttons/Drawer/Nav/Tooltip/Tabellen-Aussenbox) und **Brass**-Sprache sind ausdrücklich ausgenommen (K7). | ESLint-Regel (custom, marker-scoped) + gezieltes Tor `check:linien-kanon` | `scripts/check-linien-kanon.mjs` |
| R2 | Normtext-Body nutzt **keine** arbitrary `max-w-[…]`; nur `max-w-reading`/`max-w-content`. | ESLint `no-restricted-syntax` auf `className` | `eslint.config.js` |
| R3 | Jeder `snapshot`-Register-Eintrag hat `grundart` gesetzt (§5). | Test | `src/tests/normtext-register.test.ts` |
| R4 | Guide-Verschachtelung rendert **≤ 1** `border-l`-Ebene pro Artikel (kein Stapel). | DOM-Test (Playwright, ZGB Art. 684) | `e2e/` neuer Spec |
| R5 | Lesespalte misst ≤ 75 ch auf 1440px **und** ≥ 40 ch auf 390px (Referenz-Erlasse). | Playwright-Messung (reuse `measure.mjs`) | `e2e/leser-lesemass.spec.ts` |
| R6 | **Nur für G2a:** die reinen `data-*`-Options-Toggles ändern **kein** DOM/HTML (nur CSS). Golden byte-gleich. | `golden:vergleich` + Reader-Smoke | bestehende Kette |
| R7 | `check:perf-budget` bleibt grün (CLS 0, `content-visibility` unberührt). | bestehendes Tor | §15 |
| R8 | **Anker-Invariante (K2):** jeder Artikel-`id` bleibt `art-<token>`; die Reader-Regex akzeptiert `art-` (und, falls Alias, zusätzlich `par-`); **jeder alte `#art-`-Hash löst weiter auf.** | DOM-Test + Regex-Test (Kanton-Erlass) | `e2e/` + `inhalt`-Test |
| R9 | **Fussnoten-Wächter (K5):** Toggle «AUS» setzt den Marker **nie** `display:none`; Fussnotentext bleibt im DOM (`#fn-…`) und über Ctrl-F/Print/Screenreader erreichbar. | DOM-Test (Toggle-Zustand) | `e2e/` |

---

## 3 · Leser-Kopf: Options-Leiste

### 3.1 · Umfang (David nennt 3; keine Wucherung)

Genau die drei von David genannten Toggles **plus** Wiederverwendung der schon
existierenden globalen Schriftgrösse — **keine** zusätzlichen Regler:

| Toggle | Steuert (nur visuell) | Default | Begründung Default |
|---|---|---|---|
| **Gliederungs-Linien** | Sichtbarkeit der vertikalen Guide + Einzug-Guide | **grundart-abhängig** (KODIFIKATION AN, sonst AUS) | K11 — tiefer Kodex braucht Orientierung; flacher Erlass ist ohne Guide ruhiger. **Als messbare Annahme markiert.** |
| **Fussnoten** | Sichtbarkeit/Dämpfung der Marker (¹²³) + Panel | **AN** | Fussnoten sind **amtliche Substanz** (§7/§8) — Default sichtbar. «AUS» **dämpft** nur (K5/R9), versteckt nie. |
| **Verweise-Links** | Link-Dekoration (dotted underline) auf ELI-/internen Chips | **AN** | dezent (`decoration-dotted`), substanznah; «AUS» schaltet nur die Unterstreichung, Anker bleibt. |

**Bewusst NICHT als Toggle:** Schriftgrösse (existiert global in der Topbar —
im Reader-Kopf nur ein dezenter Verweis, nicht duplizieren) · Randtitel (amtliche
Substanz §8, ein «aus» würde Inhalt verstecken → verboten) · Zeilenabstand/
Serif-Umschalter (Regler-Wust; Lese-Optimum ist fix in D-B, iA-Writer-Lehre).

**Fussnoten-Klarstellung (K4):** Der gemeldete «`sup`-Count = 0» ist ein
**Selektor-Artefakt** — die Marker existieren als `<button class="num
align-super" aria-label="Fussnote N">` (`ArtikelBody.tsx:98`), nicht als `<sup>`/
`a[href^=#fn]`. **Erst den Selektor prüfen**, dann den Toggle an die vorhandenen
Button-Marker binden — keinen «Bug» blind fixen.

### 3.2 · Verhalten (§15-Treue, Persistenz, a11y)

- **Nur visuell (G2a).** Jeder Toggle setzt eine Klasse auf einem Wrapper
  (`<html>` oder Reader-Root): `data-linien`, `data-fussnoten`, `data-verweise`.
  **Das DOM ändert sich NIE.** Marker/Chips/Guides sind immer im HTML; die
  Toggles blenden sie per CSS aus (bzw. **dämpfen** — Fussnoten nie
  `display:none`, K5/R9). → Ctrl+F, `#art_`/`#fn`-Anker, Print/PDF, Screenreader,
  Golden **byte-gleich** (R6). Reine Darstellung (§3) ⇒ `gegenpruefung: n/a`.
- **CLS 0** (§15): Guide-Aus reserviert keinen Platz neu — Einzug ist `padding`,
  Guide `border` darauf; Umschalten bewegt nichts.
- **Persistenz:** localStorage-Key `lm.leser.optionen`. Anwendung **vor dem
  ersten Paint** über ein Mini-Inline-Script im `index.html`-Head (analog Theme),
  das die `data-*`-Attribute am `<html>` setzt → kein Flash, kein
  Hydration-Mismatch (§15 Regel 5, bestätigt K14). Schreibzugriffe gebündelt.
- **a11y:** Toggles sind echte `<button role="switch" aria-pressed>`, sichtbar
  beschriftet, tastaturbedienbar, Fokus über Outline (§13/F3). Kontrast ≥ 4.5:1
  / Nicht-Text ≥ 3:1 (F2).

### 3.3 · Golden-**ändernde** Kopf-Arbeit (G2b, Neu-Abnahme)

Diese Teile ändern das gerenderte HTML — sie sind **nicht** byte-gleich (K3) und
laufen als eigener Teilschritt mit Neu-Abnahme des Golden:
- **Kopf-Zusammenführung:** die zwei duplizierten Kopf-Blöcke
  (`inhalt.tsx:889–924` snapshot vs. `:704–717` pdf-embed) zu **einer**
  Kopf-Komponente, die die Options-Leiste **für alle Grundarten gleich** trägt.
- **Fussnoten-Render-Fix** (nach Selektor-Prüfung, K4), falls tatsächlich Marker
  fehlen.
- **Sticky-Kopf opak** (heute halbtransparent → Normtext scheint durch).
- **Sticky-Section-Kontextkopf (K12a):** «Buch 2 › Titel 3 › Art. N» aus der
  vorhandenen Scroll-Spy-Infra (`inhalt.tsx:571`) — stärkeres Orientierungs-
  Pattern als der reine TOC-Scroll-Spy.
- **«Artikel mit Zitat kopieren» (K12b):** Wortlaut + amtliche Fundstelle +
  Stand (Provenienz §7 a–d liegt vor) — DOM-neutral im Kopf.
- **Mobil:** Options-Leiste in ein «Ansicht»-Popover; Breadcrumb/Aktiv-Label/
  Stand nicht in eine Zeile quetschen; «Gliederung & Suche»-FAB nicht über den
  Textanfang legen.

---

## 4 · Übersichten Bund + Kantone

### 4.1 · Einstieg /gesetze (Dreifach-Redundanz auflösen)

Ist: dieselbe Trichotomie (Bund/Kantone/International) **dreimal** übereinander
(Breadcrumb-Kapitälchen + Tab-Leiste + Sidebar). Soll: **eine** Steuerung — drei
gleichwertige **Einstiegskacheln** mit je Kurz-Statistik; Breadcrumb-Kapitälchen
und Sidebar-Dopplung entfallen auf der Einstiegsebene (Sidebar zeigt Kontext
erst NACH Säulen-Wahl). Kein stiller Default auf «Bund» — neutraler Landeplatz +
prominente Artikel-Suche (4.2).

### 4.2 · Suche-zum-Artikel in ≤ 2 Interaktionen (Cmd/Ctrl-K, KEIN Neu-Index)

**Präzisierung nach K10:** Die Artikel-scharfe Fuzzy-Suche **existiert bereits**
(`useUniversalSuche` → `lib/suche/artikelVolltext.ts`, ~4 MB Lazy-Index, Tor
`check:suchindex`). Neu ist **nicht** die Suche, sondern:
- ein **globaler Cmd/Ctrl-K-Einstieg** (Command-Palette-Rahmen, tastatur-/
  screenreader-bedienbar, Recent Items zuerst), und
- ein **Norm-Query-Parser**: «`Art. 336c OR`» / «`ZGB 684`» / «`VMWG`» →
  auflösen zu `#art_`-Deep-Link, Enter springt direkt. = 1× tippen + Enter ≤ 2.

**Kein zweiter Index** — der Parser sitzt auf der bestehenden
`artikelVolltext`-Quelle. Akzeptanzpunkt (empirisch zu verifizieren): Abk. +
Artikel → korrekter Deep-Link für Bund **und** Kanton. Das Browsen (Bund 2 /
Kanton 4 Klicks) bleibt als Pfad, ist aber nicht mehr der einzige Weg.

### 4.3 · Kantons-Seite entrümpeln (Davids «sehr unübersichtlich»)

1. **Mengen-Asymmetrie erklären:** Kontext-Zeile über dem Raster «Erfasst sind
   die in LexMetrik verwendeten Erlasse — nicht die vollständige kantonale
   Sammlung» (§8). Killt das Misstrauen «Zürich nur 3 Erlasse?».
2. **Sortieren/Filtern** auf dem 26er-Raster: Alphabet / Erlass-Zahl / Region.
3. **Landkarte** default sichtbar (heute zugeklappt) — gleichwertiger Einstieg
   neben dem Raster.
4. **Ordnung vereinheitlichen:** Sidebar (föderal) und Pill-Leiste
   (alphabetisch) widersprechen sich → **überall alphabetisch**, Standesordnung
   höchstens als optionale Sortierung.
5. **Roh-Code-Buckets fixen:** ZH «Bereich LS», AR «bGS Bereich bGS» — interne
   Kürzel lecken in die UI. Klartext-Sachgebiet-Mapping (Fallback «Weitere»);
   wo kein amtliches Sachgebiet vorliegt, ehrlich «nicht systematisiert».
6. **Mobil:** Kantonsvollnamen nicht abschneiden; Karte höher/zweizeiliger Name.

### 4.4 · Rechtsgebiets-Sicht (zweite Gliederung — «Gerüst jetzt», K8)

**Ehrlich beziffert nach K8** (kollidiert sonst mit der Abnahme-Zeitsperre bis
1.12.2026): kein Voll-Kuratierungs-Versprechen. Zwei Ebenen:

- **Auto-Grundgerüst (jetzt baubar, kein Fachurteil):** einwertige Zuordnung aus
  dem **schon vorhandenen** Register-Feld `rechtsgebiet` (privat/öffentlich/…)
  auto-geseedet. Deckt das ganze Korpus grob ab, ohne Davids Fachzeit.
- **Querschnitts-Delta (Handarbeit, klein):** ein **kuratiertes, mehrwertiges**
  Feld `rechtsgebietThema?: string[]` (§5) — Startumfang **hart auf 6–8
  Querschnitts-Themen** begrenzt (Arbeit / Miete / Vertrag / Gesellschaft /
  Familie / …), **nur** für die Querschnitts-Erlasse (OR erscheint in mehreren).
  Seed-Datei `src/lib/normtext/rechtsgebiet-thema.ts` (Klartext-Labels +
  Reihenfolge), Norm-Verankerung wo eng (z. B. «OR Art. 319–362»).
- **Vollkuration = eigener niedrigprioritärer Strang** *nach* der Zeitsperre —
  bekommt Davids fachlichen Beleg erst dann. Bis dahin `status: entwurf` (§8).
- **Verzahnung:** jedes Thema verlinkt in `FAHRPLAN-MATERIALIEN-VERZAHNUNG.md`
  und `FAHRPLAN-RECHTSPRECHUNG.md` (Burggraben Norm ↔ Werkzeug ↔ Entscheid).
- **Tor tolerant:** «unzugeordnet» ist ein **zulässiger Default**, nicht rot;
  der Test flaggt nur stille Regressionen, nie die bewusste Null.

---

## 5 · Klassifikation produktiv machen

`docs/ux-audit-2026-07/erlass-klassifikation.json` (1460 Erlasse, 8 Grundarten,
je `signale.paragrafZaehlung`) wird **Datengrundlage im Register**, nicht nur
Audit-Artefakt.

### 5.1 · Register-Felder (`src/lib/normtext/register.ts`, `ErlassRegistereintrag`)

```ts
export type Grundart =
  | 'KODIFIKATION' | 'STANDARD_ERLASS' | 'ERLASS_MIT_ANHANG'
  | 'FLACHER_KURZERLASS' | 'STAATSVERTRAG' | 'KANTON'
  | 'PDF_EMBED' | 'LIVE_VERWEIS';

export type ErlassTyp =
  | 'gesetz' | 'verordnung' | 'staatsvertrag' | 'verfassung' | 'sonstiges';

export interface ErlassRegistereintrag {
  // … bestehend …
  /** Render-dominante Grundart (Abschnitt 2.2). Pflicht für snapshot/pdf-embed. */
  grundart: Grundart;
  /** Behebt den Heuristik-Bug (Verordnung als «Bundesgesetz» betitelt,
   *  inhalt.tsx:890–892). Kopf-Label leitet sich daraus ab, nicht aus
   *  rechtsgebiet+ebene. */
  erlassTyp?: ErlassTyp;
  /** Nur KANTON: Bestimmungs-Etikett aus Signal `paragrafZaehlung`. Default 'art'.
   *  NUR sichtbares Label — NIE der Anker (K2). Bis Kanton-Verifikation entwurf (K6). */
  bestimmungsEtikett?: 'art' | 'paragraf';
  /** Kuratierte thematische Achse (Abschnitt 4.4), mehrwertig, entwurf bis Abnahme. */
  rechtsgebietThema?: string[];
}
```

- **Seed:** `scripts/normtext/seed-grundart.mjs` liest
  `erlass-klassifikation.json`, matcht per `key`, schreibt `grundart` (+
  `erlassTyp`/`bestimmungsEtikett` wo ableitbar). Grenzfälle (JSON
  `grenzfaelle`) explizit: StPO/SchKG = KODIFIKATION;
  ZPO/StPO/ParlG/VTS/KVV/BVG/IVG/AHVG = KODIFIKATION **mit** Anhang-Rendering.
- **Kopf-Label** in der zusammengeführten Kopf-Komponente (G2b) aus `erlassTyp`
  + `ebene`/`kanton`, nicht mehr heuristisch.

### 5.2 · Pflichtfeld + Tor

- `grundart` ist **Pflicht** für neue `snapshot`/`pdf-embed`-Einträge
  (TypeScript: nicht-optional).
- **Tor `check:grundart`** (in `normtext-register.test.ts`, Kette `npm run
  gate`) prüft **Präsenz + Konsistenz** (K6): rot, wenn ein Eintrag ohne
  `grundart` existiert **oder** eine `grundart` zu einem `status` passt, der sie
  ausschliesst (z. B. `LIVE_VERWEIS` mit vorhandenem Snapshot). **Das Tor prüft
  NICHT die inhaltliche Richtigkeit von `bestimmungsEtikett`** — das §-vs-Art.-
  Etikett wird pro Kanton gegen die amtliche Quelle verifiziert und bleibt
  `entwurf` (§8), bis diese Abnahme vorliegt.

---

## 6 · Etappierung (PR-grosse Schritte)

**Kollisions-Sequenzierung (§14/§12, korrigiert nach K13):**
- **`parts.tsx`-Kette:** nur **V1c/V1b (W2·7-VZUI)** berühren `parts.tsx`.
  G1/G2/G3a/G3b unten fassen dieselbe Datei an → **hart sequenzieren gegen
  V1c/V1b** (nie zwei Sessions in `parts.tsx`).
- **`KontextPanel`:** nur **M5 (W2·6a-MAT)** kollidiert dort — betrifft **nur
  G2** (evtl. KontextPanel), **nicht** die `parts.tsx`-Kette.
- **V1a** (Verzahnungs-Chips) ist **bereits gemergt** (#118/#121/#122);
  `KantenChip` liegt in `src/components/verzahnung/` (ausser R1-Scope, Brass) →
  keine Linien-Kollision (K14).
- G0/G4/G5/G6 sind kollisionsarm und können vorlaufen.

| PR | Inhalt | Dateien (Kollision) | Aufwand | Golden/Gegenprüfung |
|---|---|---|---|---|
| **G0** | Klassifikation → Register-Felder `grundart`/`erlassTyp`/`bestimmungsEtikett`; Seed-Skript; Tor `check:grundart`. | `register.ts`, `scripts/normtext/seed-grundart.mjs`, `normtext-register.test.ts` — **keine** parts.tsx | ½–1 Session | golden byte-gleich (Daten, kein Render); `gegenpruefung: n/a` |
| **G1** ✅ | Linien-Sprache (3 Rollen-Tokens), `max-w-reading`-Fix, Einzug-Skala, Typo/hyphens-Fix, Randtitel-Einzug. Reglement-Falt ins DESIGN-REGLEMENT-NORMTEXT.md. Tore R1 (marker-scoped)/R2/R4/R5. | `index.css`, `tailwind.config.js`, **`parts.tsx`**, **`inhalt.tsx`**, `ArtikelBody.tsx`, `helpers.tsx` | 1–1½ Session | **Golden ändert** (Klassen) → neu abnehmen; `gegenpruefung: n/a — reine Darstellung §3`; Visual-Review Desktop+Mobil |

> **Ausführungsvermerk G1 (4.7.2026, Opus, PR feat/gesetzes-ux-g1):** Gebaut wie
> spezifiziert. **Korrektur zur Golden-Erwartung:** der Reader liegt NICHT in der
> Engine-Golden-Matrix (`scripts/golden-outputs.ts` rendert keine
> Normtext-Komponenten) → `golden:vergleich` blieb **IDENTISCH** (byte-gleich,
> keine Re-Segnung nötig, stärker als «neu abnehmen»). Die Wortlaut-Invarianz
> wurde stattdessen **empirisch** belegt: gerenderte Prosa (p/li/Sektion/Randtitel)
> auf ZGB/OR/VMWG vorher (origin/main) vs. nachher **byte-gleich** (1 041 006 /
> 1 618 181 / 34 543 Zeichen identisch) — nur Klassen/Attribute geändert.
> **Entscheidungen im Ermessensspielraum:** (a) Struktur-Trenner nur ebene ≤ 1;
> die frühere feine ebene-2-Linie (`border-line/50`) **entfernt** (numerierte
> Regel 2 «innere Sektionen keine Horizontal-Linie» schlägt die Tabellen-
> Annotation). (b) Guide nur bei tiefe === 1 (max 1), Einzug trägt die Tiefe;
> Umschalter steuert Guide+Einzug gemeinsam (aus = flach, wie bisher). (c)
> «Kopf-voll»-Header-Borders + Weitere-Erlasse-Nav bleiben Chrome `border-line`
> (Rahmen, nicht Hierarchie). **Offengelegte §7/§8-Abweichung R5:** «≥ 40 ch @ 390»
> ist mit der amtstreuen Absatznummer-Rinne (`pl-9`) + 18px-Serife am 390px-
> Viewport physikalisch nicht erreichbar (nach Shell-Steg px-5 + pl-9 bleiben
> ~314px Text → ~32–34 ch; 40 ch bräuchten ~392px, breiter als der Viewport, oder
> Schrift < 16px / Schrumpfen der Absatznummer-Rinne — alles ausserhalb G1). Der
> gemessene Ist ist ~32–34 ch (2× der ~16-ch-Basis, Barcode 5→1 Linien behoben);
> R5-Mobil-Floor daher auf ≥ 30 ch gesetzt + strikt kein H-Overflow @ 390. Alle
> Tore R1/R2/R4/R5 positiv UND negativ (Rot-Auslösung) bewiesen; voller `npm run
> gate` grün, `npm run test:e2e` 123/123. **Bewusst NICHT** (§7-Scope): keine
> Options-Leiste (G2a), kein Kopf-Umbau (G2b), keine Grundart-Verzweigung (G3a),
> keine Anhang-/Tarif-Extraktion (G3b).
| **G2a** | Options-Leiste (Linien/Fussnoten/Verweise) als reine `data-*`-Toggles, localStorage + Pre-Paint; R6/R9. | **`inhalt.tsx`**, `index.html`-Head | 1 Session | **golden byte-gleich** (R6, Toggles = CSS); Reader-Smoke (Ctrl+F/Anker/Print/Fussnote) |

> **Ausführungsvermerk G2a (4.7.2026, Opus, PR feat/gesetzes-ux-g2a):** Gebaut.
> Store + Leiste in `src/pages/gesetz-leser/leserOptionen.ts` (+ `LeserOptionenLeiste.tsx`),
> CSS-Toggles in `src/index.css` (auf `.lc-leser` gescopt), verdrahtet in `inhalt.tsx`
> (Kopf) + `main.tsx` (Pre-Paint). **Pre-Paint CSP-konform:** das `index.html`-Head-
> Inline-Script aus §3.2 ist an der Prod-CSP (`script-src 'self'`, vercel.json) NICHT
> möglich — die Repo-Mechanik wendet Thema/Schriftskala imperativ in `main.tsx` an
> (kein Inline-Script); G2a folgt exakt diesem Muster (`wendeLeserOptionenAn()` vor
> `createRoot`), setzt `data-linien/-fussnoten/-verweise` ans `<html>`. Kein Flash: die
> data-* sind vor dem ersten React-Paint gesetzt; das prerenderte Crawler-HTML
> (`erlassVolltextHtml`, seo-detail.ts) trägt ohnehin weder Guide noch Marker/Chips.
> **Pane-Scope:** Attribute **global** am `<html>` ⇒ Haupt-Reader UND jedes Split-View-
> Pane folgen einer Wahl; Umschalten = imperatives Attribut-Update + nur die
> Switch-Buttons rendern neu (useSyncExternalStore), der Artikelbaum NIE (§15). **R6
> byte-gleich:** `golden:vergleich` IDENTISCH (201 Fälle); der Linien-Toggle ersetzt
> die frühere `gruppierungslinienAn`-React-State-Verzweigung durch IMMER-emittierte
> Guide-/Einzug-Klassen (Markup byte-gleich zum bisherigen Default AN) + CSS-Ausblenden.
> **R9 (Fussnoten):** `data-fussnoten="aus"` DÄMPFT die Marker (`opacity`/`color`), NIE
> `display:none` — e2e prüft `display≠none` + `opacity<1` + Marker-Text erhalten
> (Ctrl+F). **Entscheidungen im Ermessensspielraum:** (a) **Linien-Default global AN**
> statt grundart-abhängig (K11) — `grundart` liegt NICHT auf der Laufzeit-`BrowseErlass`
> (nur Register/`GRUNDART_SEED`); es ins Browse-Manifest zu ziehen ist eine G0-nahe
> Datenänderung ausserhalb der byte-gleichen G2a-UI, und §3.1 markiert den grundart-
> Default selbst als unverifizierte «messbare Annahme». AN-für-alle = heutige
> Darstellung exakt = byte-gleich. **→ grundart-abhängiger Default vertagt (G2b/G3a,
> wo grundart ohnehin in den Kopf einzieht).** (b) **Fussnoten-Options-Toggle koexistiert
> mit dem bestehenden Apparat-Schalter** (Such-Leiste, `fussnotenAuf`, Default AUS): die
> §3.1-Fassung «Marker immer im DOM, Default AN» erfordert die Marker-Render-Fix, die
> §3.3 explizit **G2b** zuweist (und widerspricht der autoritativen DESIGN-REGLEMENT-
> Regel «Fussnoten-Apparat default aus ist korrekt»). G2a liefert darum den byte-
> gleichen CSS-Dämpf-Toggle; die Unifizierung der zwei Fussnoten-Bedienungen läuft mit
> der G2b-Kopf-Zusammenführung. (c) **Verweise-«AUS»** unterdrückt die (heute nur
> auf `:hover` sichtbare) dotted-Unterstreichung der `.decoration-dotted`-Verweis-Links;
> Farbe/Anker/Funktion bleiben (§3.1). Alle Tore grün (`npm run gate` GRÜN,
> `golden:vergleich` IDENTISCH, `check:linien-kanon` grün); e2e `leser-optionen`
> (4 Fälle, R6/R9 positiv+negativ + Persistenz/Reload) + 8 bestehende Leser-/9-Punkte-
> Specs regressionsfrei (55 e2e grün gesamt geprüft). Visual-Review Desktop 1280 +
> Mobil 390: Leiste konsistent (lc-chip), kein H-Overflow @390, Linien/Fussnoten/
> Verweise sichtbar schaltend. **Bewusst NICHT** (G2a-Scope): kein Kopf-Umbau, kein
> Marker-Render-Fix, keine Grundart-Verzweigung (alles G2b/G3a).
| **G2b** ✅ | Kopf-Zusammenführung (2 Blöcke → 1), Fussnoten-Render-Fix (nach Selektor-Prüfung), Sticky-Kopf opak, Sticky-Section-Kontextkopf, «Zitat kopieren». | **`inhalt.tsx`**, **`parts.tsx`**, evtl. `KontextPanel` | 1 Session | **Golden ändert** → neu abnehmen; Reader-Smoke |

> **Ausführungsvermerk G2b (4.7.2026, Opus, Worktree `feat/gesetzes-ux-g2b`):**
> Gebaut nach §3.3. **Kopf-Zusammenführung:** die zwei duplizierten `<header>`-Blöcke
> (Snapshot `inhalt.tsx` + pdf-embed) sind zu EINER Komponente `ErlassLeserKopf`
> (`parts.tsx`) zusammengeführt — Overline + Titel (Doppel-Suffix-Entschärfung + neu
> `overflow-wrap/hyphens` am Titel für Langtitel/mobil) + Meta-Zeile (SR · [N Artikel]
> · Stand · geltende Fassung) + grundart-spezifische Aktionen als `aktionen`-Slot. Der
> Snapshot-Kopf trägt die Options-Leiste; der pdf-embed-Kopf NICHT (Linien/Fussnoten/
> Verweise wären am eingebetteten PDF tote Steuerelemente, §13 F4). **Kopf-Label bleibt
> heutige Herleitung** — der `erlassTyp`-Label-Wechsel (`Staatsvertrag`/`Kanton XX ·
> Gesetz`) ist G3a und `erlassTyp` liegt nicht auf der Laufzeit-`BrowseErlass`.
> **Fussnoten-Befund (K4, empirisch bestätigt):** die Marker existieren als
> `<button class="num align-super" aria-label="Fussnote N">` (`ArtikelBody.tsx` FnRef) —
> KEIN «sup-count=0»-Bug. Der reale Befund war die **Doppel-Bedienung**: alter
> `fussnotenAuf`-React-Schalter (Such-Leiste, Default AUS, gatete das *Rendern*) neben
> dem G2a-`data-fussnoten`-CSS-Toggle (Default AN, *dämpfte* nur). **Fussnoten-
> Unifizierungs-Entscheid (der bewusst offen gelassene G2a-Punkt):** aufgelöst zu
> **EINER** Bedienung. Marker + Apparat (Artikelfuss-Fussnoten, Kopf-Fussnoten,
> Sektions-Fussnoten, Aufhebungsnotiz) rendern jetzt **IMMER im DOM** (nur an `artOffen`
> gebunden), der alte `fussnotenAuf`-State + sein Such-Leisten-Knopf sind **entfernt**;
> die Prominenz steuert allein der `data-fussnoten`-CSS-Toggle der Options-Leiste
> (`[data-fn-apparat]` dämpft die Apparat-Blöcke mit). **Default = AN.** *Begründung:*
> R9 verlangt «Marker/Text IMMER im DOM» (Ctrl+F/Print/Screenreader, §15-Funktions-
> Treue) — das ist mit «Default AUS = nicht gerendert» (Alt-Zustand) unvereinbar; das
> reglementarische Ziel `§4c` (DESIGN-REGLEMENT-NORMTEXT: «Default = an für alle drei»,
> «AUS dämpft, versteckt nie») UND §3.1 («Fussnoten sind amtliche Substanz → Default
> sichtbar») setzen die Default-Frage klar auf **AN**. Die historische Notiz «Fussnoten-
> Apparat per Default aus (ist korrekt)» ist damit **abgelöst** — sie entstand vor dem
> Options-/Always-in-DOM-Modell; sie beizubehalten würde R9 wieder brechen (Text nicht
> Ctrl+F-bar). **Sticky-Section-Kontextkopf (K12a):** neue Komponente `SektionKontextKopf`
> zeigt «Titel › Abschnitt › Art. N» aus der VORHANDENEN Scroll-Spy-State (`aktivIds`/
> `aktArtikel` — KEIN neuer IntersectionObserver, keine Scroll-Listener-Kaskade); nur im
> 2-Spalten-Lesemodus (Suche lebt dann in der TOC-Spalte → kein Sticky-Stapel), opak
> (`bg-paper`), CLS-neutral (feste Zeilenhöhe). **«Zitat kopieren» (K12b):** deterministisch
> `baueZitat()` (helpers, §5) = Fundstelle + SR + Stand, z. B. «Art. 8 BV, SR 101 (Stand
> 01.01.2000)»; Clipboard-API + aria-live-Bestätigung. Sitzt im Kontextkopf (aktueller
> Artikel) UND treibt die per-Artikel «Zitat»-Taste (die knappe `normZitat`-Form bleibt
> fürs Entscheid-Fundstellen-Matching unangetastet). **Sticky-Kopf opak:** die Reader-
> Sticky-Chrome (Inhalts-Kopf, Suchleiste, neuer Kontextkopf) ist durchgehend `bg-paper`
> (opak, kein Durchscheinen); die einzige Rest-Transluzenz ist die **globale Topbar**
> (`lc-glass` 96 %, Startseite-V3-App-Shell) — bewusst NICHT angefasst (site-weit, ausser
> Datei-/PR-Scope). **Golden-Behandlung:** wie G1 liegt der Reader NICHT in der Engine-
> Golden-Matrix → `golden:vergleich` blieb **IDENTISCH** (201 Fälle); die Wortlaut-
> Invarianz ist empirisch belegt (Prosa footnote-gestrippt ZGB/OR/VMWG vorher/nachher
> byte-gleich — G2b ändert nur ADDITIV Fussnoten-Sichtbarkeit + Kopf-/Kontext-Chrome, kein
> Wortlaut; Diff berührt weder `public/normtext` noch Extraktion/Prerender/`ArtikelBody`-
> Textlogik). **Flake-Härtung:** der Linien-Toggle-e2e zog von ZGB (~1277 Art., #684) auf
> BV (~232 Art., #8 mit Guide) um — @6×-CPU-Probe BV toggle≈1,3 s vs. ZGB≈4,1 s, Assertions
> unverändert scharf; R4-Tiefen-Referenz bleibt auf ZGB (`leser-linien-kanon`). **Tore:**
> voller `npm run gate` GRÜN (inkl. `check:plan` — stale W2·6a-MAT-Marker `status: ready`→
> `done` nachgezogen, M0–M5 gemergt), `golden:vergleich` IDENTISCH, `test:e2e` gegen dist
> 1 Worker grün (leser-optionen 4 + neu `leser-kopf-g2b` 3 + linien-kanon + lesemass).
> Visual-Review Desktop 1440 + Mobil 390 (ZGB Randtitel/Sticky/Kontextkopf, OR 319, VMWG
> Kurzerlass, MWSTG M5-Materialien intakt, EMRK pdf-embed): 0 H-Overflow. **Bewusst NICHT**
> (G2b-Scope): kein Mobil-«Ansicht»-Popover (die gewrappte Chip-Leiste ist @390 sauber +
> overflow-frei — empirisch, keine Not); keine Grundart-Verzweigung (G3a); keine globale
> Topbar-Opazität.
>
> **Ausführungsvermerk G3a (5.7.2026, Opus, Worktree `feat/gesetzes-ux-g3a`):**
> Gebaut nach §2.2. Reine Darstellung (§3) — **`gegenpruefung: n/a`**, und zwar
> literal: der Diff berührt **KEINEN** Risiko-Pfad (kein `src/lib/normtext/`, kein
> `public/normtext`, keine Extraktion/Engine), nur `src/pages/gesetz-leser/**` +
> `src/index.css` + e2e. **Laufzeit-Grundart-Anbindung (§5, die im G2a/G2b-Vermerk
> offene Frage):** die Grundart liegt bewusst NICHT auf der Laufzeit-`BrowseErlass`
> (byte-gleiche Snapshot-Projektion). Sie kommt zur Laufzeit aus der Klassifikation
> `GRUNDART_SEED` (`grundart.generated.ts`, SSoT §5) via neuem Read-Accessor
> `grundartMeta(key)` — bewusst in der **Darstellungsschicht** (`helpers.tsx`, neben
> `kopfOverline`), NICHT in `register.ts`: (a) kantonale Erlasse stehen gar nicht im
> `ERLASS_REGISTER` (nur der Seed deckt Bund UND Kanton ab — ein `ERLASS_BY_KEY`-
> Lookup über das Register hätte alle 1231 Kantone verfehlt, empirisch im e2e
> aufgefallen), (b) es bleibt ein reiner Label-Wähler ohne Rechtsinhalt, darum
> gehört er NICHT in den gegenpruefungs-pflichtigen `src/lib/normtext`-Layer — so
> bleibt der `check:gegenpruefung`-Arbiter für echte Rechtsinhalts-Diffs scharf.
> **①④ FLACHER_KURZERLASS (VMWG):** Lesespalte lag durch G1 bereits hart auf
> `max-w-reading`; der Linien-Toggle ist bei fehlender Gliederung sauber
> ausgeblendet (`zeigeLinien`). Kein weiterer Eingriff nötig — empirisch bestätigt.
> **⑤ STAATSVERTRAG (LugÜ):** Präambel rendert bereits über `ErlassKopfBlock`
> (`kopf.praeambel`); Kopf-Label jetzt «Staatsvertrag» statt «International /
> Staatsverträge» (erlassTyp). **⑥ KANTON §-Label:** Befund (§7 «verifizieren»):
> das sichtbare «§ N» steht **schon im Snapshot-`artikelLabel`** (Extraktion) — Body/
> Marke/Print/Zitat rendern es also bereits. Der register-`bestimmungsEtikett`-Wert
> steuert damit nur noch das **synthetische Zähl-Substantiv im Kopf**: «N Paragraphen»
> statt «N Artikel» (775 §-Kantone). Anker-`id` bleibt **überall** `art-<token>`
> (R8, e2e-belegt) — kein `par-`. **⑦ PDF_EMBED (EMRK):** iframe-Rahmen
> `border-line`→`border-rule-struktur` (Linien-Kanon). **⑧ LIVE_VERWEIS (DSGVO):**
> die 9 `nur-live-link`-Erlasse zeigten bisher die «nicht verfügbar»-Fehlerseite →
> jetzt eine ehrliche **Verweiskarte** (§8: prominenter amtlicher Live-Link + Stand +
> «nicht als In-App-Volltext gehostet»), + `KontextPanel`. **erlassTyp-Kopf-Label
> (der aus G2b hierher übergebene Punkt, §5.1):** `kopfOverline()` leitet die Overline
> aus `erlassTyp` ab statt aus der «ebene»-Heuristik, die JEDE Bund-Norm «Bundesgesetz»
> nannte — **103 Verordnungen** (VMWG/GBV/VZV …) heissen jetzt korrekt «Verordnung»,
> BV «Bundesverfassung», 18 Staatsverträge «Staatsvertrag»; Kanton «Kanton XX ·
> Gesetz|Verordnung» (Sachgebiet-Fallback bei neutralem Typ, N13 erhalten).
> **K11-Entscheid (grundart-abhängiger Linien-Default, der aus G2a hierher vertagte
> Punkt) — DATENBASIERT UMGESETZT:** §3.1 spezifiziert ihn (KODIFIKATION AN, sonst
> AUS). Realisiert als **Tri-State `data-linien`** mit neuem Default **`auto`**
> (`leserOptionen.ts`): im Auto-Zustand wertet CSS die **Grundart** aus (`data-grundart`
> am `.lc-leser`-Root, §5) — nur `:not([data-grundart="KODIFIKATION"])` blendet den
> EINEN Guide + Einzug aus; ein expliziter Nutzer-Klick setzt global `an`/`aus` und
> übersteuert. *Warum tri-state statt Default-Flip:* der binäre G2a-Toggle ist global
> persistiert und wird VOR der Grundart-Kenntnis am `<html>` gesetzt; ein echter
> **Per-Erlass-Default MIT Nutzer-Override** braucht zwingend drei Zustände. Der
> Schalter zeigt den **effektiven** Zustand ehrlich (§8, `linienAutoAn`-Prop). CLS 0
> (nur border/padding), Prosa unberührt. Der 80 %-Flachfall war ohnehin guide-frei
> (keine Sektionen); der Effekt greift genau bei den strukturierten Nicht-Kodifikationen
> (BV etc. → Guide-Default aus). **Golden/Wortlaut:** Reader nicht in der Engine-Matrix
> → `golden:vergleich` **IDENTISCH (201)**; `check:normtext`/`check:struktur-konsistenz`
> grün; **empirischer Prosa-Byte-Beweis** gegen einen frischen `origin/main`-Build:
> die `<article>`-Prosa von ZGB (1277)/OR (1686)/VMWG (32)/BV (232)/AG-291.150 (19,
> Kanton) ist byte-identisch (sha16 gleich). **Tore:** 24/25 gate-Sub-Checks GRÜN
> inkl. `check:gegenpruefung` (kein Risiko-Pfad) / `check:grundart` / `check:linien-kanon`
> / golden / normtext / struktur-konsistenz; einziger roter Sub-Check
> `check:vollstaendigkeit` ist **environment-/netz-bedingt und identisch rot auf
> `origin/main`** (Live-`quelleUrl`-Auflösung offline). `test:e2e` gegen dist 1 Worker:
> neuer Spec `gesetze-ux-g3a` (6) grün + `leser-optionen`/`leser-kopf-g2b`/
> `leser-linien-kanon` angepasst/grün. Visual-Review Desktop 1440 + Mobil 390 je
> Grundart (ZGB Guide AN, VMWG «Verordnung», AG «19 Paragraphen»/«§ 6», LugÜ
> «Staatsvertrag»+Präambel, EMRK PDF-Rahmen, DSGVO Verweiskarte) — Currency-Chips/
> Sticky/Optionen intakt, **0 H-Overflow ausser LugÜ mobil**: dessen Vertragsstaaten-
> Ratifikations-**Tabelle** läuft @390 über — **pre-existing** (baseline `origin/main`
> byte-/pixel-identisch, scrollW 790 beide), aus `ArtikelBody` (unberührt) und
> **G3b-Scope** (Anhang/Tabellen-Risiko-Pfad), NICHT G3a. **Bewusst NICHT (G3a-Scope):**
> Anhang-Block/Tabellen-Scroll (③/⑤ → G3b); Staatsvertrag-Langtitel-Collapse (mobil
> ⑤; die 8-Zeilen-Titel wrappen ohne H-Overflow, kein Blocker) offen für einen
> späteren Feinschliff.

> **AUSGEFÜHRT 5.7.2026 — G3b Schritt 2 · Anhang-Block-Rendering ③/⑤ (reine
> Darstellung, Worktree `feat/g3b-anhang-rendering`).** Die annex-EXTRAKTION lief
> in M13; DIESE Einheit stellt die vorhandenen `annex_*`/`lvl_*`-Daten dar —
> **`gegenpruefung: n/a` literal** (keine Risiko-Datei geändert: nur
> `src/pages/gesetz-leser/**` + `src/components/normtext/ArtikelBody.tsx` +
> e2e; `check:gegenpruefung` grün «keine Risiko-Datei»). **③ ERLASS_MIT_ANHANG:**
> Anhänge (`annex_*`) rendern jetzt als **eigenständig erkennbare, klar abgesetzte
> Blöcke** — Struktur-Trenner (`border-rule-struktur` + mehr Weissraum statt des
> feinen Artikel-Trenners) und «Anhang N» als **Struktur-Überschrift** (font-display
> `text-h3` statt `num`/Artikelnummer); `data-anhang`-Marker; Anker bleibt `#art-`
> (R8). Ziffer-Zwischentitel via bestehendem `titel`-Block (M13). Delimitation über
> **Typo + Struktur-Trenner** (Linien-Kanon «Ruhe durch Reduktion» — bewusst KEINE
> Farb-/Box-Sprache; «echte `<table>`» aus der Spec bleibt zurückgestellt, weil die
> Tabellen im shared `<p>`-Kontext liegen und der Umbau die Popover-Golden bräche —
> stattdessen overflow-x-Container erfüllt, s. u.). **⑤ STAATSVERTRAG (LugÜ):**
> Protokolle (`lvl_*`) rendern über denselben `istAnhang`-Pfad als abgesetzte
> Blöcke («Protokoll 1 über …» als Struktur-Überschrift); Präambel bleibt via
> `ErlassKopfBlock` (G3a). **LugÜ-Mobil-Overflow (scrollW 790 @390) GEFIXT —
> Ursache empirisch anders als im G3a-Report vermutet:** NICHT die Tabelle (die
> scrollt in ihrem `overflow-x-auto`-Container), sondern der **Bereich-Badge der
> Anhang-Sektion** in `SektionKopf` — er setzte sich aus Anhang-/Protokoll-Lang-
> Labels («Protokoll 1 über … – Vorbehalte und Erklärungen», 770px) zusammen und
> war `shrink-0` → sprengte @390 die Seite. Fix: reine Anhang-Sektionen unterdrücken
> den (sinnlosen) Bereich-Badge; generisch trägt der Badge jetzt `min-w-0` +
> Umbruch statt `shrink-0`. **Tabellen im overflow-x-Container** (③): die beiden
> Mehrspalten-Renderer (`KanonischeTabelle`/`LegacyMehrspaltigeTabelle`) tragen
> `lc-scroll-x` und die innere `table` wächst auf `min-w-full w-max` → breite
> Tabellen SCROLLEN seitlich statt Zellen vertikal Zeichen-für-Zeichen zu
> zerquetschen (Ratifikations-Tabelle + Kanton-Tarife strikt besser; baseline
> zerquetschte «V-e-r-t-r-a-g-s-…»). **Wortlaut-Byte-Beweis:** gerenderte Prosa
> (Artikel + Anhänge) GSchV/ChemRRV/LugÜ/ZGB byte-identisch gegen `origin/main`-
> Build (nur Klassen/Markup geändert). **Tore:** voller `npm run gate` GRÜN (inkl.
> golden/`check:linien-kanon`/`check:tabellen`/`check:struktur-konsistenz`/
> `check:gegenpruefung`); `test:e2e` gegen dist (1 Worker) grün + neuer Spec
> `gesetze-ux-g3b-anhang` (5). **Visual-Review Desktop 1440 + Mobil 390:** GSchV-
> Anhang (Tabellen), ChemRRV (tiefe `lvl_`-Stufen), LugÜ (Protokolle +
> Ratifikations-Tabelle) — 0 H-Overflow @390. **Offen (G3b):** Tarif-Anhang→echte-
> Tabelle-Klasse B/C (Extraktion, `FAHRPLAN-TARIF-TABELLEN-STUFE2.md`).

| **G3a** | Per-Grundart-**Darstellung**: §-Label (KANTON, Anker bleibt `#art-`/R8), Präambel/Protokolle (⑤), PDF-Rahmen (⑦), Live-Verweiskarte (⑧), Kurzerlass-Lesespalte (④). | **`parts.tsx`**, **`inhalt.tsx`**, `register.ts` | 1½ Session | **Golden ändert** → neu; `gegenpruefung: n/a — reine Darstellung` |
| **G3b** | **Risiko-Pfad:** Anhang-Block (③/⑤) + Tarif-Anhang → echte Tabelle. Gekoppelt an `FAHRPLAN-TARIF-TABELLEN-STUFE2.md` + `annex_*`-Plan. | `ArtikelBody.tsx`, Extraktions-Skripte, `register.ts` | **mehrere Sessions** | **`check:gegenpruefung` zwingend** (Extraktion!); golden neu |
| **G4** | Einstieg /gesetze (3 Kacheln, Dopplung raus) + Cmd/Ctrl-K-Rahmen + Norm-Query-Parser (KEIN Neu-Index). | `src/pages/gesetze/*` (nicht Leser) | 1–1½ Session | kein Normtext; UI-Test + Parser-Akzeptanz |
| **G5** ✅ | Kantons-Seite: Kontext-Zeile, Sortier/Filter, Karte default, Ordnung vereinheitlichen, Roh-Code→Klartext, Mobil-Namen. | Kantons-Übersicht-Komponenten, Systematik-Mapping | 1½ Session | kein Normtext; UI-Test |
| **G6** ✅ | Rechtsgebiets-Sicht: Auto-Grundgerüst aus `rechtsgebiet` + Querschnitts-Delta (6–8 Themen), Themen-View, Verzahnung, tolerantes Tor. **Vollkuration = späterer Strang.** | `register.ts`, `rechtsgebiet-thema.ts`, Themen-Seite | 1–1½ Session (Gerüst) | Datenfeld; Querschnitts-Beleg (§7), `status: entwurf` |

**Reihenfolge:** **G0 → G1 → G2a → G2b → G3a → G3b** (harte Kette, gemeinsame
Dateien; G0 unblockt die Grundart-Verzweigung; G3b als eigener Risiko-Pfad
zuletzt). **G4, G5, G6** kollisionsarm parallel/dazwischen (G6 nach G0). Gegen
V1c/V1b: diese **vor** G1 abschliessen **oder** G1–G3a in Worktree
(`.claude/worktrees/`) isolieren und nach V1c/V1b rebasen — nie gleichzeitig in
`parts.tsx`. M5 nur gegen G2 (KontextPanel) beachten.

**Ausführungsvermerk G4 (4.7.2026, Worktree `feat/gesetzes-ux-g4`, kollisionsarm — kein `parts.tsx`/`inhalt.tsx`/`register.ts`):** Gebaut nach §4.1/§4.2. **Landeplatz** in `src/pages/Gesetze.tsx`: neutraler Einstieg mit drei gleichwertigen Kacheln (`Einstieg`-Komponente, Live-Statistik aus dem Manifest, NICHT dok-zahl-gekoppelt) + prominentem Sprung-CTA; Segment/Tab-Panel erst nach `?ebene=`-Wahl, neutrale Overline; alle Deep-Links erhalten. **Cmd/Ctrl-K-Palette** `src/components/suche/BefehlsPalette.tsx` (global in `Shell.tsx`, lazy §15, Mobil-Knopf in `Topbar.tsx`) auf dem **deterministischen Parser** `src/lib/suche/normQuery.ts` — bewusst in `src/lib/suche/` statt `src/lib/normtext/` platziert, damit er nicht als Risiko-Pfad (`check:gegenpruefung`) fehlklassifiziert wird (er trägt keinen Rechtsinhalt); Token-Ableitung kongruent `passus.ts`; KEIN neuer Index. **Grammatik (matcht):** `[Art./Artikel/§/Par.] <Nr>[Buchstabe][bis/ter/…]` + Kürzel (Anfang ODER Ende, 1–3 Tokens für Mehrwort-/Zahl-Kürzel), reines Kürzel → Erlass-Sprung, `Abs./lit./Ziff./röm.`-Zusatz toleriert (Anker bleibt artikel-scharf), Kollision Bund-bevorzugt, Kanton-Code disambiguiert. **Matcht NICHT (→ Suche):** Freitext ohne Kürzel, Kürzel+Fremdwort, unbekanntes Kürzel, reine Zahl/röm. Ziffer, leer. **Grenzen:** §-Anker bleibt `#art-` (K2/R8 gewahrt — der Parser erzeugt nie `#par-`); Sidebar-Kontext-Umschaltung (§4.1 Satz «Sidebar erst nach Wahl») ausserhalb des Datei-Scopes belassen (geteilte Nav). Tore: voller `gate` grün, `golden:vergleich` 201 byte-gleich, 29 Unit + 6 e2e. §4.3 (G5)/§4.4 (G6) nicht Teil dieser Etappe.

**Ausführungsvermerk G5 (4.7.2026, Worktree `feat/gesetzes-ux-g5`, kollisionsarm — kein `parts.tsx`/`inhalt.tsx`/`register.ts`):** Alle 6 §4.3-Punkte gebaut in `src/pages/Gesetze.tsx` (neue Komponenten `KantonAuswahl`/`KantonKachel`). **(1)** Kontext-Zeile «Erfasst sind die in LexMetrik verwendeten kantonalen Erlasse — nicht die vollständige kantonale Gesetzessammlung» über der Auswahl (§8). **(2)** Sortier-Umschalter **Alphabet/Erlass-Zahl/Region**; Klartext-Mapping-Quelle für «Region» = neue **`src/data/grossregionen.ts`** (amtliche BFS-Grossregionen, 7 Regionen West→Ost, jeder der 26 Kt. genau einmal, verifiziert gegen die BFS-Standardgliederung — keine erfundene Zuordnung), Region-Sicht mit Zwischenüberschriften. **(3)** Sicht-Umschalter **Karte | Liste** (Default **Karte**, direkt sichtbar) ersetzt das zugeklappte `<details>` — behebt N8 zugleich (Karte verdrängt die Liste nicht mehr, gleichwertige Sichten). **(4)** Ordnung vereinheitlicht: **Sidebar-Kantone alphabetisch nach Vollname** (Label = Vollname) statt föderaler Standesordnung (`navigation.ts`, `navigation.test.ts` nachgezogen); Nachbar-Pill bleibt code-alphabetisch (Sekundär-Schnellwechsel). **(5)** Roh-Code→Klartext: Sammlungs-Kürzel-Buckets (ZH «LS», AR «bGS», …) → **ein ehrlicher «Nicht systematisiert»-Block** ohne Roh-Code-Badge (§8); amtliche Sachgebiete unverändert (BS BaB/BeE/RiE… behalten Badge+Name, **DOM byte-identisch**); der Roh-Code bleibt je Erlass an der systematischen Nummer sichtbar. **Klartext-Mapping-Quelle Roh-Code:** die amtliche Kanton-Systematik (`public/normtext/kanton-systematik.json` via `topTitel`); **bewusst Roh-Code (als «Nicht systematisiert» gebündelt) geblieben**, wo kein amtliches Sachgebiet vorliegt — Kantone **ohne** Systematik-Daten (ZH/GE/JU/NE/SZ/TI/VD) und Streu-Erlasse mit Sammlungs-Präfix; die Klartext-Expansion der Sammlungs-Kürzel (LS→Loseblattsammlung) wurde NICHT erfunden (§8 «nie raten»). **(6)** Mobil-Vollnamen: Raster-Kacheln ohne `truncate` (Name umbricht, Code weicht per flex-wrap aus). **Risiko-Pfad-Disziplin:** die Amtlich-Prüfung (`!!sys?.roots.find(...)`) bleibt bewusst inline in `Gesetze.tsx`, NICHT in `src/lib/normtext/systematik.ts` (Risiko-Pfad kern.ts:67) → `check:gegenpruefung` grün ohne Quittung, `gegenpruefung: n/a — reine Darstellung §3`. **Aufräumen (§5):** lokales `KANTON_NAMEN`-Duplikat durch Import aus `data/tarif/typen` ersetzt. Deep-Links (`?ebene=kanton`/`?kt=`) unverändert. **Tore:** voller `gate` GRÜN, **`golden:vergleich` IDENTISCH**, 8 Unit + 6 e2e (`gesetze-kanton-g5`), volle Suite **139/139**; Visual-Review Desktop 1440 + Mobil 390 (Alle-Karte/Liste/Region/Erlass-Zahl + ZH/AR/BS, 0 Overflow). **Bewusst NICHT (G5-Scope):** Reader-`topTitel`-Anzeige (`inhalt.tsx`, V1c/V1b-Zone), G2b/G6.

---

**Ausführungsvermerk G6 (5.7.2026, Opus, Worktree `feat/gesetzes-ux-g6`, kollisionsarm — kein `parts.tsx`/`inhalt.tsx`):** Die Rechtsgebiets-Sicht als **Gerüst** (§4.4/K8) gebaut, in genau zwei Ebenen. **(1) Auto-Grundgerüst:** die schon deklarierte `rechtsgebiet`-Achse (7 `GEBIETE`) wird in der Sicht nur gruppiert (aufklappbare Gebiets-Blöcke, `ErlassZeile`-Wiederverwendung) — deckt JEDEN Bund-Erlass, kein Fachurteil, kein neuer Code in der Logikschicht. **(2) Querschnitts-Delta:** neue SSoT-Datei **`src/lib/normtext/rechtsgebiet-thema.ts`** mit **8 kuratierten Praxisfeldern** (Arbeit / Miete & Pacht / Vertrag & Haftung / Gesellschaft & Handel / Familie & Erbrecht / Sachenrecht & Grundeigentum / Zwangsvollstreckung & Insolvenz / Steuern & Abgaben), die quer durch die Grundgerüst-Gebiete schneiden (Arbeit zieht OR-Privatrecht **und** ArG/AVIG/BVG aus «sozial-abgaben»; Sachenrecht ZGB **und** BewG/RPG aus «öffentlich»). Enge Bereiche mit Norm-Verankerung + **funktionierendem Deep-Link** (OR Art. 319–362 → `#art-319`, ZGB Art. 641–977 → `#art-641`; Anker bleibt `art-<token>`, K2/R8 gewahrt — der Parser erzeugt nie `#par-`). Je Thema **`status: 'entwurf'`** (§8, Fachbeleg nach Abnahme-Zeitsperre) und **Verzahnung** (Norm ↔ Werkzeug ↔ Entscheid): Rechner-Slugs aus `calculators.ts` + `/rechtsprechung?rg=<gebiet>`. **View:** `src/components/normtext/RechtsgebietSicht.tsx` (+ `RechtsgebietEinstieg`-Landeplatz-Kachel); vierte Tür `?ansicht=rechtsgebiet` neben den drei Ebenen-Kacheln, «← Übersicht» zurück. **Bewusste Abweichung von Spec §5.1 (offengelegt, §5):** das Feld `rechtsgebietThema?: string[]` je Register-Eintrag wurde **nicht** eingeführt — die Themen-Mitgliedschaft lebt an EINER Stelle (Thema → Erlasse) in `rechtsgebiet-thema.ts`; ein zweites abgeleitetes Feld je Eintrag wäre eine zweite Wahrheit. `register.ts` blieb **unangetastet** (additiv-frei, sauber gegen die Fedlex-P1-a/b-Kette). **Querschnitt = Bund** (dort ist `rechtsgebiet` je Erlass deklariert, §7); kantonale Erlasse bleiben über den Kantone-Einstieg nach amtlicher Systematik erschlossen — ihr Gebiet ist Default, wird hier nicht als zweite Klassifikation vorgetäuscht (§8). **Tolerantes Tor** `src/tests/rechtsgebiet-thema.test.ts` (9 Fälle, in `npm test`/`gate`): Mitglieds-Schlüssel müssen Bund-Register-Einträge sein, Werkzeug-Slugs müssen existieren, 6–8 Themen, §7-Beleg je Thema **und** je Mitglied, Anker nur mit Spanne; **Abdeckung wird beziffert (40 von 229 Bund-Erlassen thematisiert), aber Voll-Abdeckung NIE erzwungen** — «unzugeordnet» ist ein zulässiger Default (nur ein unterer Regressions-Wächter ≥ 20 gegen stilles Ausdünnen). **§7-Belegpflicht + Gegenprüfung:** jede Zeile trägt SR-Nummer/Artikelbereich; die 6 OR/ZGB-Bereichsgrenzen + 21 SR-Nummern wurden per **unabhängiger Gegenprüfung** (Opus, frischer Kontext, gegen das **Fedlex-AKN-XML** OR 2026-01-01 / ZGB 2026-07-01) geprüft. **Die Erstfassung wurde WIDERLEGT:** der OR-Span des Themas «Gesellschaft & Handel» endete bei Art. 964 und liess damit das **Wertpapier-/Wechsel-/Checkrecht (Fünfte Abteilung OR Art. 965–1186)** aus → **gefixt** auf `Art. 530–1186` (+ Label/Beleg «Wertpapierrecht»); die einfache Gesellschaft (530–551, formal noch «einzelne Vertragsverhältnisse») bleibt bewusst dem Handelsthema zugeordnet (dokumentiert, keine OR-Partition). Nachverifikation gegen dieselbe Quelle → **`gegenpruefung: bestanden`** (Modus Klassifikation; Datei liegt bewusst in `src/lib/normtext/`, weil sie Erlass-Fakten trägt — echte Gegenprüfung statt Umgehung). Tore: `golden:vergleich` **IDENTISCH (201)**, `tsc`/`test`/`lint`/`build`/`check:grundart`/`check:linien-kanon` grün, neuer e2e `gesetze-rechtsgebiet-g6` (2) + Landeplatz/Kanton-Regressionen (`gesetze`/`gesetze-kanton-g5`/`befehlspalette`) grün; Visual-Review Desktop 1440 + Mobil 390 (0 Overflow, e2e-verifiziert), Deep-Link `#art-319` scrollt real. **Nach Rebase auf `#144` (P1-a Currency-Lauf, schloss die Fedlex-Snapshot-Drift) voller `npm run gate` GRÜN (25/25)** — `check:vollstaendigkeit` grün, `check:gegenpruefung` grün (Nachweis quittiert). **Bewusst NICHT (G6-Scope):** keine Vollkuration/keine neuen Zuordnungen ohne Beleg (§8, K8), kein Kanton-Querschnitt, kein zweites Register-Feld, keine Reader-Berührung.

## 7 · Bewusst NICHT (Scope-Grenzen)

- **Keine** Virtualisierung/Windowing des Normtexts (§15 Regel 1) — voller DOM
  bleibt; Guide/Einzug ändern nur CSS.
- **Kein** neuer Anker-`id` (`par-`) als Standard (K2) — Label ≠ Anker; ein
  `par-`-Alias nur mit Regex-Erweiterung + Weiter-Auflösung alter `#art-`-Links.
- **Kein** zweiter Suchindex (K10) — Cmd/Ctrl-K sitzt auf `artikelVolltext`.
- **Kein** Serif-/Zeilenabstand-Regler, kein OpenDyslexic in dieser Welle.
- **Kein** neues Reglement-File by default (Abschnitt 1).
- **Keine** Änderung an Extraktion/Snapshot-Inhalt (§1/§7) — reine Darstellung;
  **Ausnahme G3b**, wo `check:gegenpruefung` zwingend läuft.
- **Keine** Vollkuration der Rechtsgebiets-Themen jetzt (K8) — Gerüst jetzt,
  Fachbeleg nach der Abnahme-Zeitsperre.
- **Kein** Lesbarkeits-Score als Gütesiegel (§13/A4).

---

## 8 · ROADMAP-Schritt-Text (zum Einfügen in ROADMAP.md, Welle 2)

```
  <!-- @meta id: W2·5d · status: ready · of: ja · blocker: null · dep: [W2·5c] · kollision: [src/pages/gesetz-leser/parts.tsx, src/pages/gesetz-leser/inhalt.tsx, src/components/normtext/ArtikelBody.tsx, src/lib/normtext/register.ts] · seq-hart: [W2·7-VZUI(parts.tsx)] · seq-weich: [W2·6a-MAT/M5(KontextPanel, nur G2)] · worktree: ja · 26x: nein · fahrplan: FAHRPLAN-GESETZES-UX.md -->
- **W2·5d — Gesetzes-UX & Darstellungs-Reglement** *(GESETZES-UX)*. Auftrag David
  4.7.: UX/Lesbarkeit des Gesetz-Lesers auf State-of-the-Art heben (Fedlex =
  Mindestlatte). **EINE Linien-Sprache** (3 benannte Rollen `--guide-gliederung`/
  `--rule-artikel`/`--rule-struktur` statt 4 Ad-hoc-Opazitäten; max 1 Guide,
  Tiefe über Einzug — Semantik-Refactor, kein Farb-Bug), Lesespalte hart auf
  `max-w-reading` (Mobil-Fix ~16→≥40 ch), **Leser-Kopf Options-Leiste**
  (Linien/Fussnoten/Verweise; Fussnoten-«AUS» dämpft nur, versteckt keine
  amtliche Substanz; §15 nur-visuell/golden byte-gleich in G2a), **je Grundart
  eine Designvorschrift** (8 Grundarten aus `erlass-klassifikation.json` →
  Register-Feld `grundart`, Pflicht + Tor `check:grundart`; Kanton-§-Label ≠
  Anker: `#art-` bleibt). Übersichten Bund/Kanton entrümpelt + Cmd/Ctrl-K-Einstieg
  auf dem BESTEHENDEN Suchindex (Artikel in ≤2 Interaktionen) +
  **Rechtsgebiets-Sicht als Gerüst** (Auto-Grundgerüst jetzt, Vollkuration nach
  Abnahme-Zeitsperre). **Sequenzieren:** hart gegen V1c/V1b (parts.tsx), weich
  gegen M5 (KontextPanel, nur G2); V1a erledigt. Etappen G0/G1/G2a/G2b/G3a/G3b/
  G4/G5/G6, Tore `check:grundart`/`check:linien-kanon`/`e2e/leser-lesemass` +
  bestehendes `check:perf-budget`; G3b (Anhang/Tarif-Extraktion) ist Risiko-Pfad
  mit `check:gegenpruefung`. Detail: **`FAHRPLAN-GESETZES-UX.md`**.
```

@meta-Erläuterung: `dep: [W2·5c]` (Startseite-V3 fertig, teilt Kopf-/Token-
Fläche), `worktree: ja` (Kollision parts.tsx/inhalt.tsx mit V1c/V1b),
`26x: nein` (kein 26×-Asset). Trailer je Commit: `Roadmap: W2·5d` (+
`Gegenpruefung: …` nur bei G3b-Anhang/Tarif).

---

## 9 · Opus-Bauauftrag — erster PR (G0)

Baue **G0** aus `FAHRPLAN-GESETZES-UX.md` §5 + §6: ziehe die 8 Grundarten aus
`docs/ux-audit-2026-07/erlass-klassifikation.json` (1460 Einträge, inkl.
`signale.paragrafZaehlung` und `grenzfaelle`) in das Register
`src/lib/normtext/register.ts` als Felder `grundart` (Pflicht für snapshot/
pdf-embed), `erlassTyp` und — nur für KANTON — `bestimmungsEtikett`, wobei das
§-vs-Art.-Etikett ausschliesslich ein **sichtbares Label** ist und die Anker-
`id` überall `art-<token>` bleibt (§1.2⑥/R8, K2) und der geseedete Etikett-Wert
`status: entwurf` trägt, bis er pro Kanton gegen die amtliche Quelle verifiziert
ist (K6). Schreibe das Seed-Skript `scripts/normtext/seed-grundart.mjs`
(Match per `key`, Grenzfälle StPO/SchKG=KODIFIKATION, ZPO/StPO/ParlG/VTS/KVV/BVG/
IVG/AHVG=KODIFIKATION-mit-Anhang) und das Tor `check:grundart` in
`src/tests/normtext-register.test.ts`, das **nur Präsenz + Konsistenz** prüft
(nicht die inhaltliche Richtigkeit des Etiketts) und in `npm run gate` hängt.
G0 berührt **nicht** `parts.tsx`/`inhalt.tsx`, ist damit kollisionsfrei zur
V1c/V1b-Kette und muss **golden byte-gleich** bleiben (reine Daten, kein Render;
Trailer `Roadmap: W2·5d`, `Gegenpruefung: n/a — reine Prüflogik`). Belege: die
Klassifikation + Grenzfälle in `docs/ux-audit-2026-07/erlass-klassifikation.json`
und `docs/ux-audit-2026-07/klassifiziere-erlasse.mjs`; die Anker-Invariante ist
am Code verifiziert (`parts.tsx:183`, `inhalt.tsx:453/510/571`).

---
---

## 10 · Anmerkungs-Welle A1–A18 (David, 5.7.2026) — revidierte Bau-Spec

**Quelle (WÖRTLICH massgeblich):** Davids Anmerkungen zur Gesetzesdarstellung,
Sammlung 5.7.2026 — im Repo persistiert als
[`docs/ux-audit-2026-07/ANMERKUNGEN-DAVID-2026-07-05.md`](docs/ux-audit-2026-07/ANMERKUNGEN-DAVID-2026-07-05.md)
(per Pathspec committet, §12 Ziff. 2; die ursprüngliche Job-tmp-Ablage ist flüchtig
und zählt nicht als Quelle §14). Die Datei endet mit «(weitere Anmerkungen folgen)»
→ **dieser Abschnitt fixiert den Stand A1–A18 (5.7. 13:02)**; Nachzügler erhalten
neue A-Nummern und werden additiv eingeordnet, nie stillschweigend hier eingefaltet.

**Status:** **David-Go erteilt 5.7.2026 im Chat** («führe es gleich aus. run till
dry») — Bau freigegeben; A3/A5-Defaults = primäre Lesart, von David nicht
widersprochen (die 10.6-Go-Fragen sind damit BEANTWORTET, s. u.). Ausführung als
Opus-Einheiten (Daueranweisung Modellwahl); Fable orchestriert nur.

**Basis-Stand (Orchestrator verifiziert 5.7. am Code + an den Ausführungs­vermerken
in §6):** Plan-Einbau #130 + **G0–G6 sind GEMERGT** auf `origin/main` (Stand
`19fdf311`): G0 #132, **G1 #135**, **G2a #136**, **G2b #141**, **G3a #143**, G3b
Schritt 1 #147 / Schritt 2 #148+#149, G4 #137, G5 #138, G6 #145 — je mit
Ausführungsvermerk in §6 dieses Fahrplans (G1 Z.493, G2a Z.520, G2b Z.561, G3a
Z.618, G4 Z.738, G5 Z.740, G6 Z.744, G3b Z.609/625) und golden byte-gleich
(`golden:vergleich` IDENTISCH 201). Das ROADMAP-@meta `status: ready` ist insofern
stale (alle Etappen-Zeilen G0–G6 in §6 gelten als ✅). **→ Die §10-Einheiten
ÜBERARBEITEN gemergte Etappen, sie bauen sie nicht neu (Detail KO1).**

### 10.0 · Kritik-Einarbeitung (Ultracode-Runde 5.7., Verdikt je Befund)

Drei adversariale Linsen (david-treue, repo-realitaet, kollision-risiko) auf den
Synthese-Entwurf, plus die Orchestrator-Korrektur der stale Entwurfs-Basis (KO1).
Jeder Befund mit Verdikt; Verworfenes explizit.

| # | Linse | Befund (verkürzt) | Verdikt | Konsequenz in diesem Abschnitt |
|---|---|---|---|---|
| **KO1** | **Orchestrator-Korrektur** | **Entwurfs-Basis war stale.** Der Synthese-Entwurf las einen VERALTETEN Checkout und behauptete teils, G1/G2a/G2b/G3a seien «noch nicht gebaut» (U-LINIEN «G1 einfalten, kein Nachbau»; KB3 beschreibt `fussnotenAuf` als React-Conditional-Rendering mit DOM-Entfernung). Am echten `origin/main` (`19fdf311`) sind **G0–G6 GEMERGT** (#132/#135/#136/#141/#143/#145/#147/#148/#149; Ausführungsvermerke §6). | **berechtigt — richtiggestellt** | Basis-Stand oben korrigiert. **U-LINIEN = ÜBERARBEITUNG des gemergten G1-Kanons + K11** (nicht «einfalten»). **U-KOPF = UMBAU des gemergten G2a/G2b-Stands.** KB1/KB3-Verdikte unten entsprechend nachgezogen; P1 (10.2) neu gefasst. Bündelung + Davids Wortlaut bleiben unverändert. |
| **KA1** | david-treue | Die A1–A18-Sammlung EXISTIERT (`~/.claude/jobs/f331de94/tmp/…`, 5.7. 13:02) — die frühere «existiert nirgends»-Behauptung beruhte auf einer Suche ohne `~/.claude/jobs/`. | **berechtigt — Blocker aufgelöst** | Dieser Abschnitt ist auf Davids **tatsächlichem Wortlaut** gebaut (jedes A-Zitat aus der Datei). |
| **KA2** | david-treue | Root-Cause war der args-Übergabe-Bug des Workflow-Skripts (JSON-String statt Objekt) — NICHT «Datei nie geschrieben, David muss neu liefern». | **berechtigt** | Kein Zutun Davids nötig. Anmerkungen als **Repo-Datei** persistiert (erledigt) und hier als Quelle verankert. |
| **KA3** | david-treue | Die Lieferverweigerung war bei fehlender «WÖRTLICH massgeblich»-Quelle korrekt. | **bestätigend** | Prinzip bleibt: ohne Quelle kein Scope (§14.2/§7). |
| **KA4** | david-treue | A5 ist entscheidbar: normQuery in die NORMALE Suchleiste, Palette entfällt als eigenes UI (primäre Lesart). Restspannung: e2e `befehlspalette`-Spec, «/»-Shortcut-Koexistenz, Startseite-V3-Satz «HeaderSuche bleibt UNVERÄNDERT». | **berechtigt** | In **U-SUCHE** als Akzeptanzpunkte (10.2 P3); `FAHRPLAN-STARTSEITE-V3.md`-Vermerk wird beim Bau nachgezogen (deklarierte Spec-Änderung, David-Entscheid 5.7.). |
| **KA5** | david-treue | Datei endet offen («weitere Anmerkungen folgen») — «18» nicht blind hartkodieren. | **berechtigt** | Kopfzeile fixiert Stand 5.7. 13:02; Nachzügler = neue A-Nummern. |
| **KB1** | repo-realitaet | **Nicht nur G0**, sondern **G0–G6 sind gebaut + gemergt** (KO1); der Entwurf behandelte nur G0 als erledigt. ROADMAP-@meta `ready` ist stale. | **berechtigt — durch KO1 erweitert** | §6-Zeilen G0–G6 gelten als ✅. **A8 baut auf dem gemergten G1-Kanon + G0-grundart auf; A14/A15 auf G5/G6.** Keine Etappe wird neu geplant. |
| **KB2** | repo-realitaet | Transkript-/Job-Suche fehlte im Entwurf als Such-Ort. | **Hinweis — gegenstandslos** | Durch KA1 (Fund) erledigt; als Such-Protokoll-Lektion notiert. |
| **KB3** | repo-realitaet | Entwurf: `fussnotenAuf` sei React-Conditional-Rendering (Marker bei AUS aus dem DOM ENTFERNT). **Das ist der PRE-G2b-Stand — heute überholt.** Nach G2b (#141) sind Marker **+ Apparat IMMER im DOM** (nur an `artOffen` gebunden), der alte `fussnotenAuf`-React-Schalter ist **entfernt**; Prominenz steuert allein der `data-fussnoten`-CSS-Toggle: **AUS dämpft** (`opacity`/`color`), **NIE `display:none`** (`index.css:242–256`, R9/§8). | **stale — richtiggestellt (KO1)** | Für **U-KOPF** heisst das: A1 dreht den heutigen **CSS-Dämpfungs-Pfad** auf **verstecken** (Marker-`button[aria-label^="Fussnote"]` → aus dem visuellen Fluss; Apparat-Blöcke `[data-fn-apparat]` gemäss Entscheid), NICHT einen Conditional-Render umbauen. Die byte-gleich-Frage ist neu zu stellen (P1): sie hängt am **A4-Dropdown-Umbau** (Chip-Leiste → «Ansicht»-Dropdown = Markup-Änderung, mutmasslich G2b-Klasse), nicht an einem nicht mehr existenten Render-Zweig. |
| **KC1** | kollision-risiko | Live-Kollision W2·5d ↔ **laufende QS-PERF-Einheit** (`ArtikelBody.tsx`, Worktree `lm-qsperf`, #152). (W2·7-Klingen ist inzwischen GEMERGT #154 — nicht mehr live; s. KO1.) | **berechtigt** | **Kollisions-Precheck als Pflicht-Zeile jeder Einheit** (10.3): vor jedem Bau `git worktree list` + Datei-Abgleich; ArtikelBody-berührende Einheiten hart NACH QS-PERF; eigener Worktree zwingend. A2 baut fachlich auf QS-PERF auf (so Davids A2-Text). |
| **KC2** | kollision-risiko | `register.ts`/`src/lib/normtext`/`scripts/normtext` sind **Risiko-Pfade** (`check:gegenpruefung`-Liste) — register-berührende Etappen sind nicht «reine Darstellung». | **berechtigt** | Gegenprüfungs-Spalte in 10.2 pro Einheit explizit: Linker/Extraktion/Generator/Registerfeld ⇒ **gegenpruefung-pflichtig** (U-VERWEIS, U-PDF, U-REGESTE); reine CSS-/UI-Einheiten ⇒ `n/a` mit Begründung. `public/normtext`/`scripts/normtext`-berührende Läufe gegen die laufende **L0-Einheit** (`lm-l0`, extrahiere-fedlex) sequenzieren. |
| **KC3** | kollision-risiko | «Keine Datei seit …»-Suchbehauptung veraltet stündlich (Parallel-Sessions). | **Hinweis — gegenstandslos** | Durch KA1 ohne Handlungsbedarf; Lektion wie KB2. |
| **KC4** | kollision-risiko | Persistenz-Vorschlag `docs/ux-audit-2026-07/…` ist §12-verträglich, aber per **Pathspec committen**. | **berechtigt** | Erledigt: Datei liegt im Repo, per Pathspec committet. |
| **KC5** | kollision-risiko + repo-realitaet | Bestätigungen: Verweigerung §14-konform; zitierte Repo-Fakten (K10, Startseite-V3-Zeilen, Audit-Belege) stimmen; G0-Aufwand real belegt. | **bestätigend** | Keine Änderung. |

**Explizit VERWORFEN:**
- Die Entwurfs-Diagnose «Sammel-Datei wurde nie geschrieben; David muss sie erneut
  übergeben» — **falsch** (KA1/KA2): Datei existierte, der Bug lag in der
  args-Übergabe des Orchestrierungs-Skripts. Davids Zeit wird nicht beansprucht.
- Die Entwurfs-Prämisse «G1/G2a/G2b/G3a noch nicht gebaut» und die daraus
  abgeleiteten Formeln «G1 einfalten, kein Nachbau» / «`fussnotenAuf` =
  Conditional-Render mit DOM-Entfernung» — **stale/falsch** (KO1/KB1/KB3): alle
  Etappen sind gemergt; die §10-Einheiten überarbeiten sie.
- KB2/KC3 als **Handlungsbedarf** — durch den Fund gegenstandslos (nur als
  Such-Protokoll-Lektion behalten). Kein weiterer Befund verworfen.

### 10.1 · Bündelung A1–A18 → Bau-Einheiten (§14 Ziff. 2)

Bündelung nach Bau-Fläche + Risiko-Klasse (nie Rechtsinhalt/Extraktion mit reinem
UI in einer Einheit). Davids eigene Bündel-Hinweise («EINE Kopf-Einheit», «EINE
Such-Einheit», «EINE Übersichten-Einheit») sind übernommen.

| Einheit | Anmerkungen | Kern (Wortlaut-Anker) | Verhältnis zu §2–§7 |
|---|---|---|---|
| **U-LINIEN** | **A8** | Linien-Gliederung «komplett überarbeiten», Regeln **nach tatsächlichem Gesetzes-Aufbau** (Struktur-Sidecar: Tiefe/Ebenen/Artikel-Dichte), nicht nach grundart-Kategorie («zgb sehr viele, arg fast keine») | **ÜBERARBEITET den GEMERGTEN G1-Linien-Kanon (#135) + K11/G3a-Default (KO1)** — G1 (3 Rollen-Tokens, Einzug-Skala, `check:linien-kanon`) IST gebaut; A8 revidiert das *Regelwerk* «wann welche Linie» weg vom grundart-Kategorie-Default hin zu aufbau-basierten, deterministischen Regeln (Struktur-Sidecar). K11-Tri-State (Nutzer-Override) bleibt. Tor = Nachfolger von R4/`check:linien-kanon`; Regeln ins DESIGN-REGLEMENT-NORMTEXT §4b. Referenzfälle visuell beweisen: ZGB, OR, ArG, VMWG, kurzer Erlass, Kanton-§, Staatsvertrag. |
| **U-KOPF** | **A1 + A3 + A4** | A1 Fussnoten bei AUS **verschwinden statt abdunkeln** · A3 Positions-Leiste → **echte klickbare Breadcrumbs** (primäre Lesart, nav/aria, Mobil-Kürzung) · A4 Darstellungsoptionen als **«Ansicht»-Dropdown im Kopf** (Chip-Leiste entfällt) | **BAUT AUF dem GEMERGTEN G2a/G2b-Stand AUF (KO1).** Heute (nach G2b #141): EIN `ErlassLeserKopf` (`parts.tsx`), Fussnoten-Marker **+ Apparat IMMER im DOM**, `data-fussnoten`-CSS-Toggle **dämpft** (`index.css:242–256`); Sticky-`SektionKontextKopf` zeigt den Pfad als Textzeile (`parts.tsx:461`). **A1 überstimmt R9/K5** («dämpft nur») — deklarierte fachliche Änderung, David 5.7.: Marker bei AUS visuell **weg** (CSS von `opacity` → verstecken; Trade-off Ctrl-F/Screenreader betrifft NUR die Marker-Ziffern, Fussnotentext bleibt im DOM `[data-fn-apparat]`/`#fn-…`) + Print-Verhalten dokumentieren; R9-Tor + DESIGN-REGLEMENT-NORMTEXT §4c anpassen; e2e `leser-optionen` nachziehen. **A3** löst den `SektionKontextKopf` in klickbare Breadcrumbs auf. **A4** ersetzt die G2a-Chip-Leiste durch das in §3.3 vertagte «Ansicht»-Popover (jetzt Hauptbedienung; Persistenz-/Pre-Paint-Mechanik §3.2 bleibt darunter). Golden-Klasse per P1-Beweis. |
| **U-SUCHE** | **A5 + A6** | A5 normQuery-Parser **in die normale Suchleiste** (HeaderSuche/useUniversalSuche); Norm erkannt ⇒ Direkt-Sprung als oberster Treffer; **Palette entfällt als eigenes UI, ⌘K/Ctrl-K fokussiert die Suchleiste** (primäre Lesart) · A6 Treffer-Gruppierung nach Typ mit Relevanz-Rangfolge (Norm-Sprung → Gesetze/Artikel → Entscheide → Materialien → Werkzeuge) | **baut auf dem GEMERGTEN G4 auf (#137)** und ersetzt dessen §4.2-Palette-Teil: der deterministische Parser `src/lib/suche/normQuery.ts` existiert bereits; A5 verlagert ihn aus der `BefehlsPalette.tsx` (global in Shell) in die normale Suchleiste. K10 bleibt voll gültig: **kein Zweit-Index**, Parser sitzt auf `artikelVolltext` (E2-Edge-Suche = api/suche, abgegrenzt). Akzeptanzpunkte (KA4): e2e `befehlspalette`-Spec umbauen · Koexistenz mit geschütztem «/»-Shortcut (`tastatur.e2e`) · Startseite-V3-Satz «HeaderSuche bleibt UNVERÄNDERT» als überholte Spec-Zeile in `FAHRPLAN-STARTSEITE-V3.md` deklariert nachziehen. |
| **U-VERWEIS** | **A7 + A10 + A11 + A13** | A10 Plural-Linker «in den Artikeln A, B … und K» (MWSTG Art. 5 = 5 Links, Dativ/Fremdgesetz-Signal) · A11 Verweise in **Präambel/Ingress** (Genitiv-Map «der Bundesverfassung»→BV, kuratiert/deterministisch) · A7 Verweis-Popover strukturiert: Artikel-Wortlaut → massgebliche Entscheide → klar abgetrennt Materialien (bestehende Verzahnungs-Grammatik wiederverwenden) · A13 Materialien-Kanten klarer, artikelscharf zuerst, Erlass-Ebene dezenter | **neue Einheit nach G3a** (Linker-Fläche wie #134/N2b: `fedlex.ts`/NormText). **Risiko-Pfad** (Linker = Extraktions-Klasse): Regressionstest MWSTG Art. 5 verbatim + Negativfälle + Korpus-grep «Artikeln \d» in die Gegenprüfung. Darstellung (A7/A13): lazy, CLS 0, Popover kompakt (Top-n + Zähler), Wortfeld-Tor, Visual-Review-Pflicht (DSG 24 / DBG 65 / MWSTG). |
| **U-POSITION** | **A2 + A16 + A17** | A2 Scrollbalken-Proportionalität (Wurzel-Verdacht `content-visibility:auto` + zu kleine `contain-intrinsic-size: auto 320px`, `index.css:270`; Fix-Kandidaten: per-Artikel-Höhenschätzung aus Struktur-Sidecar / Höhen-Cache / Deaktivierung auf langen Gesetzen — §15: Funktions-Treue schlägt Tempo) · A16 Zurück landet **exakt** am Ausgangsort (anker-basiert: letzter sichtbarer Artikel + Offset; inkl. Split-View-Wechsel/Pane-Schliessen) · A17 Split-View öffnet **direkt an der Fundstelle** (Norm ⇒ Artikel+Passus; Entscheid ⇒ Erwägung via `ersteFundstelle`; Materialien ⇒ Ziffer; nie stumm falsch) | **neue Einheit**, eng verwandt (alle drei hängen an der Höhen-/Anker-Mechanik). **Hart NACH QS-PERF** (KC1; `ArtikelBody.tsx`/content-visibility-Fläche, Davids A2-Text verlangt das selbst). Kein Markup-Ziel → golden byte-gleich anstreben, empirisch prüfen; Split-View-e2e (Pane-History) grün halten. Testfälle: OR/ZGB Daumen-ans-Ende ⇒ letzter Artikel; OR Art. 5 → Verweis → Zurück = Art. 5 im Viewport; Cross-Erlass; jeder ⧉-Öffnungsweg. |
| **U-UEBERSICHT** | **A14 + A15** | A14 Kanton-Übersicht: lange Titel **umbrechen statt kappen** (@390 besonders) + **Relevanz-Sortierung** mit dokumentiertem deterministischem Kriterium (keine geratene Wichtigkeit; G5-Umschalter Alphabet/Erlass-Zahl/Region bleiben) · A15 **Gliederungs-Umschalter auf allen drei Säulen** Bund/Kantone/International: Relevanz · Systematisch · **Rechtsgebiet** (G6-Gerüst wird Gliederungs-Modus in JEDER Säule statt eigener vierter Tür); Wahl persistent, Deep-Links `?gliederung=` stabil | **erweitert den GEMERGTEN G5 (#138) + G6 (#145)** (G6-Grundgerüst `rechtsgebiet-thema.ts` bleibt wie in §4.4 begrenzt — K8-Zeitsperre unberührt; heute ist G6 «vierte Tür» `?ansicht=rechtsgebiet`, A15 macht daraus einen Modus je Säule). Kollisionsarm (Übersicht-Komponenten `src/pages/Gesetze.tsx`, nicht Leser); Bedien-Vokabular konsistent mit A4-Dropdown. Visual-Review ZH gross/AI klein, Desktop+Mobil. |
| **U-PDF** | **A12** | Download-Aktion lädt das **AMTLICHE PDF** der gepinnten Fassung — Bund: Fedlex-Manifestation via SPARQL `isExemplifiedBy` **build-time** (Suffix-Falle `-2` aus P1-a/b!), Kanton: LexWork-PDF, Staatsverträge: hinterlegte Quelle; Beschriftung ehrlich «Amtliches PDF (Fassung vom …)»; ohne amtliches PDF ⇒ Aktion weglassen (nie Schein-Amtlichkeit, §8) | **neue kleine Einheit.** Generator-/Registerfeld-Anteil ⇒ Risiko-Pfad-nah (KC2): PDF-URL in Pin-/Currency-Überwachung (`check:fedlex-versionen` deckt pdf-Pins seit P1-b), URL-Ermittlung mit Stichproben-Gegenprüfung. `scripts/normtext`-Berührung gegen laufende **L0-Einheit** (`lm-l0`) sequenzieren. Ist-Stand des heutigen Download/Print-Knopfs zuerst erheben. |
| **U-REGESTE** | **A18** | Amtliche BGE (272): Regeste **nach Sprachen sortiert** (DE→FR→IT, Struktur-/Marker-basiert, keine Wortraten-Heuristik; im Zweifel unverändert §1) | **✅ GEBAUT 5.7.2026** (Branch `feat/w26b-regeste-a18`, mit W2·6-B B1+B2). **Quell-Wahl §7:** die OCL-Rohregeste ist einsprachig+flach → EINZIGE strukturierte, dreisprachige amtliche Quelle = **bger.ch clir** (`atf://<band>:de|fr|it`, `<div id="regeste" lang>`); daraus Kopf(fett)+Absätze je Sprache, **strukturbasiert getrennt** (lang-Attribut, keine Wortraten) und **sortiert DE→FR→IT** — 272/272 BGE, 0 Lücken; additiv (`regeste.sprachfassungen`). `RegesteBlock.tsx` (DE prominent, FR/IT dezent einklappbar, `<details>` = A9-tastatur-/CLS-fest). Tor `check:entscheide` erzwingt Sortier-/Kopf-/clir-Quelle-Invariante. Risiko-Pfad ⇒ `check:gegenpruefung` **bestanden** (Opus-Zweitpass byte-genau vs. bger.ch). |
| **A9** | Querschnitt | «gut bedienbar und flüssig … auch auf schwächeren geräten» | **Kein Feature — DoD-Zeile in JEDEM Bau-Prompt** (10.4). |

### 10.2 · Verbindliche Prüf-/Beweispunkte je Einheit

- **P1 (U-KOPF, neu gefasst nach KO1/KB3):** Es gibt **keinen** `fussnotenAuf`-
  Conditional-Render-Pfad mehr — Marker + Apparat liegen seit G2b immer im DOM,
  AUS dämpft nur per CSS (`index.css:242–256`). Die Golden-Frage ist daher **nicht**
  «bleibt der Default-Render byte-gleich», sondern: **ändert der A4-Dropdown-Umbau
  (Chip-Leiste → «Ansicht»-Dropdown im `ErlassLeserKopf`) das Markup?** Vermutlich
  **ja** ⇒ die Einheit ist golden-**ändernd** (Neu-Abnahme wie G2b), das
  R6-Byte-Gleich-Versprechen gilt dann NUR für die reinen CSS-Toggle-Pfade
  (Linien/Verweise/Fussnoten-Sichtbarkeit). Die A1-CSS-Änderung selbst
  (Dämpfen → Verstecken) ist rein visuell; sie ist am Wortlaut-Byte-Vergleich
  (footnote-gestrippt) zu beweisen, nicht zu behaupten.
- **P2 (U-VERWEIS):** MWSTG Art. 5 verbatim = 5 Links (art_31/35/37/38/45 im
  Snapshot verifizieren); bounded Kette, nie über den Fliesstext hinaus;
  Fremdgesetz-Signal («…Artikeln 4 und 5 des StGB») korrekt geroutet;
  Präambel-Test an einem BV-zitierenden Ingress.
- **P3 (U-SUCHE):** Norm-Query «OR 257d» ⇒ oberster Treffer + Enter springt;
  Freitext unverändert; ⌘K fokussiert Suchleiste; «/»-Shortcut koexistiert;
  e2e-Suite (befehlspalette umgebaut, tastatur, HeaderSuche) voll grün.
- **P4 (U-POSITION):** OR/ZGB: Scroll-Daumen ans Ende ⇒ letzter Artikel sichtbar,
  Daumen-Position stabil; Zurück-Restoration exakt; ⧉-Fundstellen-Sprung je
  Öffnungsweg; Split-View-e2e grün.
- **P5 (U-PDF):** Stichprobe ≥10 Erlasse (Bund/Kanton/Staatsvertrag): geladenes
  PDF = amtliche gepinnte Fassung (Fassungsdatum im PDF gegen `stand` geprüft);
  Suffix-`-2`-Fall dabei.
- **P6 (U-LINIEN):** Referenzfälle aus 10.1 als Vorher/Nachher-Screenshots gegen
  den **gemergten G1-Kanon**; Regel-Tabelle («ab Tiefe ≥N ⇒ Guide», …) im
  Reglement + maschinelles Tor (Nachfolger `check:linien-kanon`).

### 10.3 · Reihenfolge + Kollisions-Sequenzierung (§12/§14, KC1)

**Pflicht-Precheck vor JEDER Einheit:** `git worktree list` + Datei-Abgleich gegen
die eigenen Kollisions-Dateien. Laufende Einheiten (Stand 5.7.): `lm-qsperf`
(QS-PERF #152: **ArtikelBody.tsx**, ArtikelLeser, vite.config) · `lm-l0` (W2·5b
L0: **scripts/normtext**, public/normtext/bund) · SG-Tarif (#155). **W2·7-Klingen
(#154) und W2·6a-MAT sind GEMERGT — nicht mehr live** (KO1). Eigener Worktree
zwingend (`worktree: ja`); nie zwei Sessions in derselben Datei.

**Harte Reader-Kette** (parts.tsx/inhalt.tsx/ArtikelBody.tsx — sequenziell, je eine
Einheit; Start erst nach Rebase auf den QS-PERF-Merge):

1. **U-LINIEN** (= Überarbeitung des gemergten G1-Kanons inkl. A8)
2. **U-KOPF** (= Umbau des gemergten G2a/G2b inkl. A1/A3/A4; P1 entscheidet Golden-Klasse)
3. **U-VERWEIS** (Risiko-Pfad, `check:gegenpruefung`)
4. **U-POSITION** (hart nach QS-PERF; fachlich auf dessen Stand aufbauend)

**Kollisionsarm parallel/dazwischen** (keine Leser-Dateien): **U-SUCHE**
(Suche-Komponenten; nach W2·5c-Stand) · **U-UEBERSICHT** (G5/G6-Fläche
`src/pages/Gesetze.tsx`) · **U-PDF** (Generator/Registerfeld; gegen `lm-l0`
sequenzieren). **U-REGESTE** läuft NICHT hier, sondern als Teil von W2·6-B B2.

**Aufwand (kalibriert an G0 = real 1 Session):** U-LINIEN 1–1½ · U-KOPF 1–1½ ·
U-SUCHE 1 · U-VERWEIS 1½ (inkl. Gegenprüfung) · U-POSITION 1–1½ · U-UEBERSICHT
1–1½ · U-PDF ½–1 · U-REGESTE in W2·6-B budgetiert.

### 10.4 · Querschnitt A9 — DoD-Zeile für jeden Bau-Prompt (wörtlich übernehmen)

> «Beweise Bedienbarkeit (Tastatur/Touch/aria, Tap-Ziele) und Flüssigkeit unter
> CPU-Throttle (Playwright `setCPUThrottlingRate 6`): Toggle-/Scroll-/Such-
> Interaktionen ohne spürbaren Lag, keine Long-Tasks-Kaskade, CLS 0;
> `check:perf-budget` bleibt grün — Schwellen dürfen nicht gerissen werden
> (§15; Tempo zählt nur bei grüner Treue).»

### 10.5 · Deklarierte Änderungen an §0–§7 dieses Fahrplans (David-Entscheide 5.7.)

- **R9/K5 überstimmt (A1):** Fussnoten-AUS **versteckt** die Marker (statt dämpfen).
  R9 wird zu: «AUS entfernt die Marker visuell; der Fussnotentext bleibt im DOM
  (`[data-fn-apparat]`/`#fn-…`); Print-Verhalten definiert; Trade-off im Reglement
  §4c dokumentiert.» Der heutige CSS-Dämpfungs-Pfad (`index.css:245`) wird umgestellt.
- **§3-Chip-Leiste ersetzt (A4):** Bedienung = «Ansicht»-Dropdown im Kopf; das in
  §3.3 vertagte Popover ist jetzt die Hauptbedienung. §3.1-Umfang (genau 3 Toggles,
  keine Wucherung) bleibt.
- **§4.2-Palette ersetzt (A5):** kein eigenes Palette-UI; Parser `normQuery.ts` in
  der HeaderSuche, ⌘K fokussiert sie. K10 (kein Zweit-Index) bleibt verbindlich.
- **G1-Linien-Regelwerk überarbeitet (A8):** aufbau-basierte Regeln statt
  grundart-Kategorie-Default; der gemergte G1-Kanon + K11-Tri-State bleiben Basis.
- **§7 Bewusst-NICHT ergänzt:** Kein eigenes Palette-UI mehr · kein Render-eigenes
  PDF als Download (nur amtliche PDFs, sonst keine Aktion) · Fussnoten-TEXT bleibt
  immer im DOM (nur Marker-Sichtbarkeit ist schaltbar) · Sprach-Heuristik über
  Wortraten für Regesten verboten (A18: nur Struktur/Marker, im Zweifel unverändert).

### 10.6 · Go-Status (5.7.2026 — BEANTWORTET)

1. **Go zur Anmerkungs-Welle:** **ERTEILT** (David im Chat 5.7.: «führe es gleich
   aus. run till dry»). Reihenfolge 10.3; Teil-Go je Einheit möglich (kollisionsarme
   Einheiten zuerst, während die Reader-Kette auf QS-PERF wartet).
2. **A3-Lesart:** Breadcrumbs = klickbare Auflösung der Positions-Leiste (primäre
   Lesart) — **gilt** (von David nicht widersprochen; Default = gebaut).
3. **A5-Lesart:** Palette entfällt als eigenes UI, ⌘K fokussiert die Suchleiste
   (primäre Lesart) — **gilt** (von David nicht widersprochen; Default = gebaut).

### 10.7 · Ausführungsvermerke der §10-Einheiten

**Ausführungsvermerk U-UEBERSICHT (A14 + A15, 5.7.2026, Opus, Worktree
`feat/u-uebersicht-a14-a15`, kollisionsarm — nur Übersicht-Fläche
`src/pages/Gesetze.tsx`, KEIN `parts.tsx`/`inhalt.tsx`/`ArtikelBody.tsx`;
`register.ts` unangetastet):** Beide Anmerkungen auf der gemergten G5/G6-Fläche
gebaut.

- **A14 Kanton-Übersicht.** (1) **Titel umbrechen statt kappen:** `SysZeile` (aus
  `Gesetze.tsx` nach `ErlassKarte.tsx` gezogen, geteilt) auf ein Drei-Spalten-Grid
  `grid-cols-[auto_minmax(0,1fr)_auto]` mit `break-words` umgestellt — der lange
  amtliche Titel läuft mehrzeilig, SR-Nr. und Meta bleiben auf der ersten
  Grundlinie; kein `truncate`, kein H-Overflow (@390 e2e-belegt, BS mit bis 521 Z.
  langen Vertrags-Titeln). (2) **Relevanz-Sortierung**, dokumentiert-deterministisch
  (§8, KEINE geratene Wichtigkeit): `src/lib/normtext/relevanz.ts`,
  **Kanton-Kriterium = «Kern-Erlass-Kategorie, dann Systematik»** — der
  Manifest-`rang` ist für Kantone einheitlich 0 (browse-manifest.ts) und darum
  unbrauchbar; an seine Stelle tritt eine dokumentierte, anker-feste Titel-/Kürzel-
  Klassifikation, die genau Davids genannte Kern-Erlasse zuerst zieht (Kantons­-
  verfassung → Einführungsgesetze → Gerichts-/Behördenorganisation → Steuer-/
  Gebührenrecht), danach die amtliche Systematik (Sachgebiets-Rang · SR-Vergleich).
  Die G5-Umschalter (Alphabet/Erlass-Zahl/Region) auf dem 26er-Kanton-Raster
  bleiben unberührt (sie ordnen die KANTONE, nicht die Erlasse).
- **A15 Gliederungs-Umschalter auf ALLEN drei Säulen** (Relevanz · Systematisch ·
  Rechtsgebiet), gemeinsamer `GliederungUmschalter` (role=group/aria-pressed,
  `src/components/normtext/GesetzeGliederung.tsx`). **Bund:** Relevanz =
  kuratierter Leitgesetz-`rang` (BV, Kern-Kodifikationen zuerst) · Systematisch =
  bestehende `BundSystematik` (Default, byte-gleich) · Rechtsgebiet = bestehende
  `RechtsgebietSicht` als **Modus** (nicht mehr nur die vierte Tür). **Kantone**
  (je gewähltem Kanton): Relevanz (A14) · Systematisch (`KantonSystematik`) ·
  Rechtsgebiet (nach Register-`rechtsgebiet`, §8-ehrlich, da kantonal meist
  Default). **International:** Relevanz · Systematisch (`InternationalRubriken`) ·
  Rechtsgebiet = **SR-0.*-Sachklassen** (amtliche Völkerrechts-Achse 0.1–0.9,
  EU-Recht als eigene Gruppe). **Persistenz:** `src/lib/normtext/gliederung.ts`,
  EINE Wahl für alle Säulen, Rangfolge URL `?gliederung=` → localStorage
  (`lm.gesetze.gliederung`) → Default `systematisch` (hält Prerender/Golden/e2e
  byte-gleich); Pre-Paint-Muster (synchrone Store-Lesung, kein Inline-Script).
- **URL-Kompatibilität (alle bestehenden Deep-Links erreichbar):** `?ebene=`,
  `?kt=`, `#sys-`, `?ansicht=rechtsgebiet` (G6-Tür bleibt unverändert, nur neu
  ALS Modus zusätzlich erreichbar), Default = Systematisch → `?ebene=kanton&kt=ZH`
  zeigt weiter «Nicht systematisiert», `?ebene=bund` weiter «Alle aufklappen»
  (e2e-belegt).
- **Gegenprüfung (KC2 — `src/lib/normtext/` ist Risiko-Pfad):** die SR-0.*-Klassen-
  Labels wurden per **unabhängiger Gegenprüfung** (Opus, frischer Kontext, gegen
  die amtliche Fedlex-SR-Systematik via SPARQL `legal-taxonomy id-systematique`,
  2026-07-05) geprüft. **Die Erstfassung wurde WIDERLEGT:** `0.5` war fälschlich
  «Landesverteidigung» (das ist die nationalrechtliche SR-Hauptklasse 5) →
  **gefixt auf «Krieg und Neutralität»** (belegt über 0.51/0.52); zusätzlich `0.2`
  «Zwangsvollstreckung»→«Vollstreckung» und `0.1`→«im Allgemeinen». Nachverifikation
  bestanden → `check:gegenpruefung` quittiert (Diff-Hash-gebunden). Sortier-/
  Persistenz-Logik selbst = reine Darstellung (§3), kein Rechtswert.
- **Tore:** voller `npm run gate` **GRÜN (25/25)**, `golden:vergleich` **IDENTISCH**,
  neue Unit `src/tests/relevanz.test.ts` (7) + neuer e2e `gesetze-uebersicht-u`
  (10, inkl. **A9 CPU-Throttle 6×**: Umschalten flüssig, keine Fehler), volle
  e2e-Suite **173/173** (Regressionen `gesetze`/`gesetze-kanton-g5`/
  `gesetze-rechtsgebiet-g6` grün, Kontrakte gewahrt). Visual-Review Desktop 1440 +
  Mobil 390 (Bund/International + Kantone ZH/AI/BS, 0 Overflow, Titel-Umbruch
  belegt). `playwright.config.ts` additiv env-`E2E_PORT` (Default 4317
  unverändert) für kollisionsfreie Parallel-Worktrees (§12).
- **Bewusst NICHT (U-UEBERSICHT-Scope):** keine Reader-Berührung (U-KOPF/U-LINIEN/
  U-POSITION getrennt) · keine neue Kuration im G6-Grundgerüst (K8-Zeitsperre
  unberührt) · `?ansicht=rechtsgebiet`-Tür bleibt bestehen (nicht entfernt, nur
  zusätzlich als Modus).

**Ausführungsvermerk U-SUCHE (A5 + A6) — AUSGEFÜHRT 5.7.2026.**

**Status: gebaut, Tore grün, PR mit armiertem Auto-Merge.** Worktree `lm-u-suche`
(`feat/u-suche-a5-a6`), Trailer `Roadmap: W2·5d`. `Gegenpruefung: n/a — reine
UI/Suche` (kein Risiko-Pfad berührt; `normQuery.ts` unverändert, kein Parser-
Eingriff nötig — die bestehende Auflösung deckt P3 vollständig).

**A5 — Norm-Sprung in der normalen Suchleiste (Integrations-Design):**
- Der Parser `src/lib/suche/normQuery.ts` bleibt UNVERÄNDERT. Er wird jetzt aus
  dem geteilten Hook `useUniversalSuche` gefahren: der Index (`baueNormIndex`)
  wird **einmal pro geladenem Gesetzes-Manifest** über die **schon geladenen**
  `gesetze` gebaut (K10 — **kein Zweit-Index**; keine zusätzliche Fetch-Quelle),
  `parseNormQuery(q, index)` läuft pro Query.
- Der Treffer wird als **erste Gruppe `sprung`** (`sprungGruppe()` in
  `src/lib/universalSuche.ts`) VOR die statischen Gruppen gehängt — dadurch ist er
  automatisch der oberste Eintrag der flachen Tastatur-Liste, **Enter springt**
  (ohne Sonderpfad; er ist `flach[0]`). Marke «Sprung» (`lc-badge-ok`) + amtlicher
  Titel als Untertitel + ↵-Affordanz (`SuchResultate`, `id==='sprung'`).
- **Palette entfernt:** `src/components/suche/BefehlsPalette.tsx` gelöscht; Shell
  ohne Palette-Zustand/Lazy-Mount; Topbar-Palette-Knopf entfernt. **⌘K/Ctrl-K UND
  «/» fokussieren die HeaderSuche** (Handler in `HeaderSuche.tsx` mit Feld-Ref,
  liest den Feldwert direkt vom DOM → kein stale-closure). Der /gesetze-Landeplatz-
  CTA fokussiert das Feld über `lm:suche-fokus` (vormals `lm:befehlspalette`).
  Mobil (kein ⌘K): das Feld reicht; das Dropdown ist auf < sm viewport-verankert
  (`fixed inset-x-2`) → lesbare Breite ohne Overflow (Verbesserung ggü. dem
  feldschmalen Header-Dropdown).

**A6 — Gruppierung nach Typ + Relevanz-Rangfolge (dokumentierte Regeln):**
- Reihenfolge in `sucheAlles` neu (fachliche Änderung, `universalSuche.test.ts`
  nachgezogen): **Norm-Sprung → Gesetze → Gesetzestext/Artikel → Rechtsprechung →
  Materialien → Rechner & Vorlagen → Fristen-Vorlagen** (Rechtsinhalte vor
  Werkzeugen; Online-Edge-Gruppe bleibt CLS-sicher zuunterst).
- **Innerhalb** jeder Gruppe unverändert die bestehende, je eigene Relevanz-
  Sortierung der Filter-Funktionen (K10 — keine neue Ranking-Logik): Gesetze/Artikel
  Titel- vor Volltext-Match, Rechtsprechung neueste zuerst, Materialien
  `vergleicheGlobal`. Je Gruppe Overline + Zähler (ausser Sprung), «alle n ansehen»
  via `mehrHref` (bestand). Tastatur-Navigation über alle Gruppen (flache Liste,
  `aria-activedescendant`); Enter = Primäraktion (Navigieren/Springen). **Keine
  Sekundär-Buttons (⧉/Kopieren) je Zeile** — sie wären nested-interactive in
  `role=option` (axe serious); bewusst weggelassen (David «ggf.»), a11y-sauber.

**P3-Beweis** (`e2e/norm-sprung.e2e.ts`, umgebaut aus `befehlspalette.e2e.ts` —
Kontrakt = Sprung-Funktion, nicht Palette-UI): «OR 257d» ⇒ Sprung ist oberster
Treffer, Enter → `/gesetze/bund/OR#art-257_d` (Anker im DOM); Kanton «ABRG 3» →
`/gesetze/kanton/AR-621.12#art-3`; Freitext «Kündigung» → kein Sprung, gruppierte
Suche. **A9** (`setCPUThrottlingRate 6`): Tippen/Navigieren flüssig (gebundene
web-first-Auflösung ohne Test-Timeout-Nähe), **CLS < 0.05**. **«/»-Koexistenz**
(`tastatur.e2e.ts`): ⌘K und «/» fokussieren dieselbe HeaderSuche, kein Overlay.
Voller `npm run gate` grün (golden byte-gleich, `check:*` inkl. `gegenpruefung`);
`test:e2e` gegen dist (1 Worker) grün.

- **U-LINIEN (A8) — GEBAUT (5.7.2026), PR `feat/u-linien-a8`.** Der Linien-Default
  ist von der grundart-Schublade (G3a/K11 «nur KODIFIKATION») auf ein AUFBAU-
  basiertes Regelwerk umgestellt: SSoT `src/pages/gesetz-leser/linienAufbau.ts`
  (`linienProfil`) leitet aus dem Struktur-Sidecar (Gliederungstiefe + Artikel-
  Dichte je Ebene) ab, ob und wo der EINE Guide erscheint. Regeln + empirische
  Schwellen (`TIEF_AB=3`, `DICHTE_MIN=2`; Korpus-Verteilung 1135 Sidecars via
  `scripts/linien-korpus-verteilung.mjs`) im **DESIGN-REGLEMENT-NORMTEXT
  §4b-A**. Reader: `renderSektion` nutzt `linien.guideEbene`, `.lc-leser` trägt
  `data-guide-auto`, `index.css` blendet den Guide bei tiefen Kodifikationen aus
  (Einzug bleibt, Rangfolge §4b). Tor `check:linien-kanon` zum Nachfolger von
  R1/R4 umgebaut (vite-node, importiert `linienProfil` → kein Drift; korpusweite
  Invarianten + Referenz-Verdikte positiv+negativ + Reader/CSS-Verdrahtung). e2e
  `leser-linien-kanon`/`gesetze-ux-g3a`/`leser-optionen` nachgezogen (ZGB ruhig,
  ArG sichtbar). **Davids A8-Befund geheilt:** ZGB (Tiefe 5) bleibt ruhig, ArG
  (Tiefe 2) bekommt seine Ebene sichtbar — P6-Referenzfälle Vorher/Nachher
  Desktop 1440 + Mobil 390 visuell + per computed-style verifiziert. Wortlaut +
  Engine-Golden byte-gleich (nur Klassen/Attribute). `data-grundart` bleibt als
  semantischer Marker. K11-Nutzer-Override (global an/aus) unberührt.

- **U-KOPF (A1 + A3 + A4) — GEBAUT (5.7.2026, Opus), PR `feat/u-kopf-a1-a3-a4`,
  Trailer `Roadmap: W2·5d`.** Worktree `lm-u-kopf`, kollisionsarm nach der
  Reader-Kette (U-LINIEN gemergt, QS-PERF-Fläche `ArtikelBody.tsx` nicht berührt).
  `Gegenpruefung: n/a — reine Darstellung` (keine `public/normtext`-Änderung; nur
  Komponenten + CSS). Commits A1 → A3 → A4 → Reglement → Doku.
  - **A1 — Fussnoten bei AUS VERSCHWINDEN (überstimmt R9/K5, David-Entscheid).**
    `index.css`: `data-fussnoten="aus"` schaltet Marker-Buttons
    (`button[aria-label^="Fussnote"]`), Marker-Cluster (`[data-fn-marker]`, neu an
    den drei Cluster-Wrappern in `parts.tsx` inkl. Komma-Trenner) und Apparat
    (`[data-fn-apparat]`) auf `display:none` statt `opacity/color`. Der
    Fussnotentext bleibt im DOM (`#fn-…`); Normtext nie betroffen (stets
    durchsuchbar); «AN» stellt alles wieder her. **Print folgt dem Toggle**;
    **CLS 0** (nutzer-initiierter Reflow, input-exkludiert — e2e-belegt via
    PerformanceObserver). Default AN = kein Regel-Match = byte-gleich (R6).
    R9-Tor = e2e `leser-optionen` (Assertions scharf: AUS ⇒ nicht sichtbar +
    display:none + Text bleibt im DOM, AN ⇒ wieder sichtbar).
    DESIGN-REGLEMENT §4c-Regel 4 + U-KOPF-Nachtrag nachgezogen.
  - **A3 — Positions-Leiste = echte Breadcrumbs.** `SektionKontextKopf` nimmt jetzt
    `glieder:{id,label}[]` + `onSpringe` statt `pfad:string[]`: `nav[aria-label]` >
    `ol`/`li`, jedes Glied ein Button → `springeZuSektion` (Klick-Ziel = Anfang der
    Gliederungsebene, konsistent mit dem TOC-Klick), letztes Glied
    `aria-current="location"`, tastaturbedienbar. Datenquelle bleibt die vorhandene
    Scroll-Spy-State (kein neuer Observer, §15). Mobil-/Overflow-Kürzung rein per
    CSS (`truncate` + `overflow-hidden` + mittlere Glieder `hidden sm:inline-flex`
    + «…»). Der Sticky-Positions-Kopf bleibt ein ≥ 1024px-2-Spalten-Feature.
  - **A4 — «Ansicht»-Dropdown im Kopf (Chip-Leiste entfällt).** Neue
    `LeserAnsichtMenu.tsx` (ersetzt `LeserOptionenLeiste.tsx`): ehrliche Disclosure
    (KEIN `role=menu` — Switches sind Formular-Steuerelemente), Trigger «Ansicht»
    mit `aria-expanded` + `aria-controls`, Panel = `role="group"
    aria-label="Darstellungsoptionen"` mit den drei `role="switch"`-Reihen.
    Fokus-Falle + Escape + Fokus-Rückgabe via `useDialogFokus`;
    pointerdown-ausserhalb schliesst; Panel absolut positioniert ⇒ kein
    Layout-Shift. Persistenz-/Pre-Paint-Mechanik (`leserOptionen.ts`, data-* am
    `<html>`) unverändert darunter. **pdf-embed** bleibt bewusst ohne
    Ansicht-Controls (keine toten Steuerelemente, G2b). Beide Reader-Instanzen
    (Einzel + Pane) teilen die Komponente.
  - **P1-Ergebnis (Golden-Klasse):** golden-**ändernd** wie vorhergesagt — das
    Kopf-Markup ändert sich (Dropdown-Umbau + Breadcrumb-`ol`/`li`), aber die
    Artikel-PROSA ist byte-gleich (kein `public/normtext`-Eingriff;
    `golden:vergleich` GRÜN = Engine/Vorlagen-Golden unberührt; alle
    `normtext`-Struktur-/Vollständigkeits-Tore grün). Die reinen CSS-Toggle-Pfade
    (A1-Verschwinden) sind rein visuell.
  - **Tore:** voller `npm run gate` GRÜN (tsc · vitest · golden · lint · check).
    `test:e2e` gegen dist (1 Worker, eigener Port): `leser-optionen`,
    `leser-kopf-g2b` (inkl. A4-a11y-Probe + A3-Breadcrumbs), neuer
    `leser-kopf-a9` (A9-Throttle CI?4:6, CLS 0, 0 Konsolenfehler), `a11y` (axe),
    `gesetze-ux-g3a/g3b`, `verzahnung` (Split-View) grün.

**Ausführungsvermerk U-VERWEIS (A7 + A10 + A11 + A13) — AUSGEFÜHRT 10.7.2026.**

**Status: gebaut, voller Gate GRÜN, Gegenprüfung in Runde 1 WIDERLEGT →
B1-Fix → Runde 2 BESTANDEN, PR mit armiertem Auto-Merge.** Worktree
`lm-u-verweis` (`feat/u-verweis-a7-a10-a11-a13`), Trailer `Roadmap: W2·5d`.
Risiko-Pfad Linker (Extraktions-Klasse) ⇒ unabhängige Gegenprüfung (Opus,
frischer Kontext, gegen amtliche Fedlex-Filestore-HTMLs + SPARQL).

- **Gegenprüfung (2 Runden).** Runde 1 (Opus, unabhängige Lesarten VOR dem
  Vergleich notiert; MWSTG 20250331 / BETMG 20230901 / ArG 20230901 amtlich
  geöffnet; SPARQL-titleShort-Belege inkl. Ambiguitätssuche Schengen-DSG):
  **WIDERLEGT** — Befund **B1**: eine durch «Buchstabe» unterbrochene
  Plural-«Absätze»-Wertliste liess «und N» als Artikel-Glied lecken
  (BETMG 8a ⇒ Falsch-Link «5»→Art. 5; FAV 44a; FinfraV 129 ×2 — 4 amtlich
  belegte Instanzen). **Fix:** Plural-Kontext der Passus-Kette wird über die
  Buchstabe-Gruppe hinweg gehalten; «und|oder N» ohne Passus-Wort ⇒ Wertliste
  (Komma/sowie bleiben Glied-Konnektoren); Verbatim-Regressionstests. Notizen
  ohne Widerlegungs-Rang: B2 Anaphern-Self («der Artikel 32 und 33» meint
  ATSG — bewusst akzeptierte Self-Grenze, dokumentiert), B3 Under-Link FUSG
  (erlassdatum im Sidecar fehlt ⇒ Ingress unverlinkt, §1-konservativ), B4
  theoretischer Klein-Adjektiv-Bypass (0 Live-Stellen), B5 Sidecar verliert
  bis/ter im ArG-Ingress-Kopf (Extraktor-Backlog, ausserhalb Diff). Runde 2
  über den korrigierten Diff: **BESTANDEN** (voller Re-Lauf:
  B1-Ziele amtlich verifiziert — BETMG 8a ⇒ [8, 11, 13, 19, 20], FAV 44a ⇒
  [7, 19, 24a], FinfraV 129 ⇒ [36, 37]; alle Runde-1-Vorbefunde unverändert;
  8 adversariale Angriffe gegen den Fix gescheitert; unabhängiger
  Voll-Korpus-Diff: −4 Glieder = exakt die Leaks, keine neuen/verschluckten).

- **A10 — Plural-Linker.** Neuer reiner Resolver `artikelnPluralVerweise`
  (fedlex.ts): Öffner «Artikeln N» / «die|der Artikel N, M …» (Letzteres nur bei
  ≥ 2 Gliedern oder Gesetz-Signal), Glieder einzeln verlinkt, Anzeige =
  Quelltext (§1). Bounded: Passus-Kette typ-treu (Singular-Keyword = genau EIN
  Wert — «Absatz 2, 34 und 114» lässt 34/114 Glieder sein; Plural/Abkürzung =
  Wertliste mit Glied-Kopf-Guard), Wort-Ende-Anker gegen Backtracking
  («38»→«3», «42octies»→«42o» gebannt). Auflösung: Gesetz-Signal am Ende
  (Klammer-Kürzel > Genitiv-Map > bare Kürzel) ⇒ fremd; §1-Unterdrückung bei
  unbekanntem Klammer-Kürzel/Fremdnamen/bare-Kürzel (BGSA-Korpus-Fund) /
  unparsebarem Glied; sonst Self via tokenMap (nur existierende Token).
  **P2-Beweis: MWSTG Art. 5 verbatim = GENAU 5 Links art_31/35/37/38/45**
  (Unit + SSR + e2e-DOM + Screenshot). Korpus: 2091 Regionen / 5183 Glieder
  (self 1304 · fremd 443 · unterdrückt 344).
- **A11 — Präambel/Ingress-Verweise.** Kuratierte, belegte `GENITIV_GESETZ`-Map
  (26 Einträge, «der Bundesverfassung»→BV …; generische Wendungen bewusst ohne
  Eintrag); `fremdRoutingFormB` akzeptiert die Genitiv-Form zusätzlich zur
  N2b-Klammer (Klammer autoritativ, hat Vorrang); Soft-Hyphen-Toleranz (U+00AD).
  `ErlassKopfBlock` rendert Präambel-Zeilen durch NormText (beide
  Reader-Instanzen; pdf-embed-Fallback linkt nur Fremdziele). **aBV-Schutz
  (Gegenprüfungs-Vorbereitung, §1):** Ingress-Verlinkung NUR bei Erlassdatum ≥
  2000 — Ingresse sind historisch, Erlasse vor 2000 zitieren die BV von 1874
  (ArG-Beleg; Fliesstext ungegated, dort amtlich nachgeführt: ASYLG 121a,
  RVOG 184).
- **A7 — Verweis-Popover strukturiert.** `VerweisKontext.tsx` im NormPopover:
  Wortlaut → Provenienz-Fuss → «Wird zitiert von · Massgebliche Entscheide» →
  abgetrennt «Legt aus · Amtliche Materialien» (Behörde · Doktyp — Titel ·
  Ziff. · Stand). Wiederverwendete Verzahnungs-Grammatik (KontextGruppe,
  StatusBadge, Richtungs-Label als Text); Daten = DIESELBEN erlass-lokalen
  Shards wie Artikel-Fuss/Kontext-Panel via neues `kontextFuerArtikel`/
  `materialienFuerArtikel` (kontext.ts, geteilte Promise-Caches §15.3). Kompakt
  Top-3 + Zähler + «Alle n»; ans ENDE des Popovers gehängt ⇒ CLS 0 by
  construction.
- **A13 — Materialien-Kanten klarer.** Kontext-Panel: artikelscharfe Kanten
  prominent zuerst (Sublabel/Behörde/Stand — bestand), reine Erlass-Ebene
  dezenter HINTER dem Zähler (`<details>` «n Dokumente auf Erlass-Ebene»);
  e2e materialien-m5 auf den neuen Kontrakt nachgezogen (deklarierte fachliche
  Änderung, Davids A13-Wortlaut). Visual-Review-Beweis DBG (KS 6a via Art. 65
  prominent, 76 Erlass-Ebene-Dokumente eingeklappt).
- **P2-Beweise einzeln:** MWSTG Art. 5 = 5 Links ✓ (e2e: GENAU 5, toHaveCount) ·
  bounded ✓ (Negativtests + «genannten Frankenbeträge» ausserhalb der Region) ·
  Fremdgesetz-Signal «…Artikeln 4 und 5 des StGB» ✓ (Unit + SSR) ·
  Präambel-Test ✓ (MWSTG Art. 130 BV Singular + DSG 95/97/122/173 Plural;
  aBV-Negativfall ArG) · Korpus-grep-Statistik ✓ (oben; in der Gegenprüfung
  nachvollzogen).
- **A9-DoD:** e2e `verweis-u` mit `setCPUThrottlingRate` (CI 4 / lokal 6) +
  `test.slow()`: Popover-Öffnen + Plural-Glied-Sprung ohne Lag (< 8 s Budget
  gedrosselt), CLS < 0.05 je Seite (input-frei, Interaktion gemessen); Esc
  schliesst; Tap-Ziele = normale Links/Buttons; `check:perf-budget` grün (im
  vollen `check`).
- **Tore:** voller `npm run gate` GRÜN (tsc · vitest 3617 · golden:vergleich
  IDENTISCH · lint · check 25er-Kette). **Golden-Klasse: Engine-Golden
  byte-gleich; Reader-Markup deklariert-ändernd** (neue <a>-Hüllen im
  prerenderten Artikel-/Ingress-Text — reine Anker-Hüllen, Wortlaut
  zeichenidentisch; kein `public/normtext`-Eingriff, kein daten-manifest).
  e2e-Vollsuite 188/188 (leser-kopf-a9-Flake einmal unter Parallel-Last,
  standalone + Wiederholung grün — bekannte Throttle-Flake-Klasse).
  Visual-Review Desktop 1440 + Mobil 390: MWSTG 5, MWSTG/DSG-Ingress, DBG-65-
  Kontext, Popover MWSTG-18 (Materialien) + OR-20 (Entscheide), 0 Overflow.
- **Bewusst NICHT (U-VERWEIS-Scope):** keine Scroll-/Anker-Mechanik (A16 =
  U-POSITION) · kein Fuzzy-Matching ausgeschriebener Namen ohne kuratierten
  Eintrag · keine aBV-Konkordanz-Map (Under-Link statt Rate-Link) · lat.
  Suffixe > sexies (septies/octies …) bleiben unverlinkt-unterdrückt
  (konsistent mit artikelToken; Extraktor-Backlog).

**Ausführungsvermerk U-POSITION (A2 + A16 + A17) — AUSGEFÜHRT 11.7.2026 (Opus).**

**Status: gebaut, voller Gate grün (nur der VORBESTEHENDE `check:plan`-Orphan
W3·14-Responsive-Defekte war rot — mit-reconciliert), e2e grün, PR mit armiertem
Auto-Merge.** Worktree `lm-u-position` (`feat/u-position-a2-a16-a17`), Trailer
`Roadmap: W2·5d`. Baut auf dem gemergten QS-PERF/#181/#183-Stand auf (parts.tsx-
Barrel, berechnungen.ts, CLS-Härtung), nicht dagegen. Reine Darstellung/Interaktion
⇒ `Gegenpruefung: n/a` (kein Linker/Extraktion/Rechnen, kein `public/normtext`).

- **A2 — Scrollbalken-Proportionalität.** Wurzel EMPIRISCH bestätigt: die
  `.nt-art-cv`-Klasse gab JEDEM Artikel denselben `contain-intrinsic-size: auto
  320px` (index.css) — ein 40-Absatz-Artikel und ein Einzeiler reservierten
  dieselbe Platzhalterhöhe, die Summe (Dokumenthöhe vor dem Rendern) wich stark
  von der Realität ab ⇒ Daumen-ans-Ende landete in der Gesetzes-Mitte, Höhe „lief
  weg". **Fix-Kandidat gewählt: per-Artikel-Höhenschätzung aus dem Snapshot**
  (`schaetzeArtikelHoehe`, berechnungen.ts: Absätze × Zeilenmass + Items +
  Tabellen; deterministisch, unit-getestet), inline als `contain-intrinsic-size`
  je `<article>` gesetzt (überschreibt den Flachwert). **Logikverlust-Bewertung:
  KEINER** — `content-visibility:auto` BLEIBT (Off-Screen spart Layout/Paint),
  jeder Knoten bleibt im DOM (Ctrl+F/Anker/Screenreader/Druck/SEO unberührt); nur
  der PLATZHALTER-Schätzwert wird inhalts-proportional statt konstant. Golden/
  Prerender unberührt (der String-Builder `erlassVolltextHtml` emittiert kein
  `nt-art-cv`; die Optimierung existiert nur im Client-Reader). `check:perf-budget`
  bleibt grün (content-visibility unverändert; genauere Schätzungen mindern eher
  Scroll-Anchoring-Sprünge). Deaktivierung auf langen Erlassen (Kandidat 3)
  VERWORFEN — hätte Tempo geopfert ohne Not; Höhen-Cache (Kandidat 2) überflüssig,
  da `auto` die echte Höhe nach erstem Render ohnehin merkt.
- **A16 — Zurück landet exakt am Ausgangsort (anker-basiert).** `scrollAnker.ts`
  (neu): Registry {Artikel-Token, Offset} je Reiter-Identität; ein passiver,
  rAF-entprellter Scroll-Listener im Reader hält den obersten sichtbaren Artikel +
  Offset fest (§15, kein setState). `App.tsx:ScrollWiederherstellung` nutzt für
  Leser-Reiter den Anker als Ziel — je Frame der bestehenden Konvergenz-Schleife
  gegen das AKTUELLE DOM aufgelöst (`aufloeseAnkerY`, `getElementById` → element-
  basiert, robust gegen die content-visibility-Höhenschätzung, Davids Hinweis);
  `scrollY` bleibt Fallback → jede Nicht-Leser-Route byte-gleich. Interne Verweise
  navigieren jetzt über den **Router** (echter History-Eintrag; der `letzteNavKey`-
  Effekt führt den Sprung aus) — ein MANUELLES `pushState` war der EMPIRISCH
  widerlegte Irrweg (desynchronisiert react-router ⇒ Zurück löste keinen Location-
  Wechsel/keinen Rück-Sprung aus, debug-belegt). NormPopover «Im Gesetz öffnen»
  wurde von Vollseiten-`<a>` auf SPA-`<Link>` umgestellt (deklarierte Änderung),
  damit der In-Memory-Anker das Verweis-Folgen überlebt ⇒ **Cross-Erlass
  AIG→StGB→zurück landet wieder an Art. 5**. Im PANE bleibt der direkte Sprung
  (eigene Pane-History unangetastet).
- **A17 — Split-View öffnet an der Fundstelle.** Der ⧉ legte den Pfad zwar MIT
  Fundstelle ab (readerLink `#art-token`, Leitfall/Kontext `?norm=`), aber die
  Reader lasen sie aus `window.location.hash` (= Haupt-URL, NICHT der Pane-Pfad)
  und brachen für Panes ab ⇒ Pane öffnete oben. Fix: Gesetz-Leser springt auch im
  sekundären Pane, Fundstelle aus der PANE-LOKALEN Location (`<Routes location>` →
  `useLocation`); EntscheidLeser liest den `?norm`-Guard + `#e`-Hash Pane-lokal
  (sonst brach ein Gesetz-Pane mit `#art-…` in der Haupt-URL den Erwägungs-Sprung
  fälschlich als „Hash gewinnt" ab). **Nie stumm falsch:** ohne auflösbare
  Fundstelle (`ersteFundstelle`→null) ehrlicher Dokumentanfang. Materialien haben
  keinen In-App-Volltext (nur-live-link, §8) ⇒ keine Ziffer-Fundstelle zum
  Anspringen, kein Falsch-Sprung möglich (n/a by Datenlage).
- **P4-Beweise einzeln (e2e `leser-position-u`, gegen dist):** A2 — OR: Scroll-
  Position bildet die Dokument-Position proportional ab (Top-Index bei 0.25/0.5/
  0.75 der Balkenhöhe monoton, Mitte≈Mitte; scrollHeight weit über dem 320px-Boden)
  ✓. A16 — Cross-Erlass AIG→StGB (Popover) → Zurück = Art. 5 im Viewport ✓; interner
  Verweis MWSTG Art. 5→31 → Zurück = Art. 5 im Viewport ✓. A17 — Norm-⧉ aus dem
  Entscheid öffnet das Pane an Art. 18 (nicht oben) ✓; Split-View-e2e (`verzahnung`,
  Pane-History) grün ✓. A9-DoD — Scroll unter CPU-Throttle (rate 4) flüssig, CLS 0
  (Tastatur-Scroll = echtes Input ⇒ content-visibility-Reflow input-exkludiert;
  der neue Anker-Listener erzeugt keinen unerwarteten Shift) ✓.
- **Golden-Klasse:** byte-gleich — alle Änderungen sind Client-Reader (inline
  `style`/Navigation/CSS-Kommentar); kein `public/normtext`, kein Daten-Manifest,
  kein `erlassVolltextHtml`-Eingriff. `golden:vergleich` IDENTISCH; `check:normtext`/
  `check:struktur-konsistenz` grün.
- **Tore:** voller `npm run gate` grün bis auf den VORBESTEHENDEN `check:plan`-
  Orphan `W3·14-Responsive-Defekte` (10.7.-Session hatte das @meta in der ROADMAP,
  aber nicht in `scripts/plan/inventar.ts` registriert) — im Doku-Commit mit-
  reconciliert (Inventar-Zeile ergänzt, §12-„fehlende Karte nachtragen"). Voll-e2e-
  Sweep 192/192 (die einmalige `norm-sprung`-A9-Flake unter Parallel-Last löst
  standalone grün — bekannte Throttle-Flake-Klasse, nicht auf U-POSITION-Fläche).
- **Bewusst NICHT (U-POSITION-Scope):** keine Pane-interne Per-History-Eintrag-
  Scroll-Restoration (Pane-`go`/`push`; Pane-eigene History unangetastet, Shell-
  scrollMerk deckt den Pane-Modus-Wechsel/-Schliessen wie bisher) · kein
  Sub-Artikel-Passus-Highlight über den bestehenden Artikel-Blink hinaus · keine
  Änderung an `window.scrollY`-Restoration für Nicht-Leser-Routen.
**Ausführungsvermerk U-PDF (A12) — AUSGEFÜHRT 11.7.2026 (Opus, Worktree
`feat/u-pdf-a12`, kollisionsarm — Kopf-Aktions-Slot + Generator/Registerfeld, KEIN
`inhalt.tsx`-Scroll-/Anker-Eingriff, `register.ts` unangetastet).**

- **Ist-Befund des alten Knopfs (Spec-Auflage «zuerst erheben»):** zwei Pfade. (1)
  `status:'pdf-embed'` (EMRK/NYÜ + kant. PDF) lieferte bereits das **amtliche**
  self-hosted PDF («⬇ PDF herunterladen» → `/normtext/pdf/*.pdf`) — korrekt, nur
  relabelt. (2) `status:'snapshot'` (Bund + Kanton Volltext) bot ein **render-
  eigenes `.txt`** (`baueErlassText`, client-Blob) — genau der von §10.5 verbotene
  «Schein-Download». **Behoben:** der Snapshot-Download lädt jetzt das amtliche PDF
  der gepinnten Fassung; wo keins existiert, entfällt die Aktion (§8, nie render-
  eigenes PDF). `baueErlassText`/`herunterladen()` ersatzlos entfernt (§5-Aufräumen).
- **Ermittlung (build-time, KEINE Client-SPARQL):** neuer Netz-Generator
  `scripts/normtext/pdf-quellen-generieren.ts` (`gen:pdf-quellen`) → Sidecar
  `public/normtext/pdf-quellen.json` ({key:{url,stand,quelle}}); `browse-manifest.ts`
  projiziert offline in `register.json` → **`BrowseErlass.pdfUrl/pdfStand`** (synchron
  am Erlass ⇒ **CLS 0**, §15/2, kein zweiter Async-Fetch).
  - **Bund:** Fedlex-`jolux:isExemplifiedBy` der pdf-a-Manifestation der Konsolidierung
    mit `dateApplicability` == gepinnte Fassung. Die **EXAKTE** Filestore-URL wird
    gelesen, nicht konstruiert — der Revisions-Suffix variiert real: (none)·-1·-2·-3·
    -4·-5·-12 (Verteilung 109/69/24/9/11/4/1 über 227 Erlasse). **Suffix-Falle `-2`
    (P1-a/b) damit gegenstandslos**: eine suffixlose Konstruktion hätte für 118/227
    die ÄLTERE Datei geladen (HTTP 200, kein 404). **227/227 Bund** aufgelöst (inkl. 9 P4-Staatsverträge nach additivem Rebase).
  - **Kanton:** LexWork `selected_version.pdf_link_tol`, nur bei Versions-Gleichstand
    (In-Kraft-Datum == snapshot.stand, sonst Drift ⇒ weglassen, §8). **1184/1231**
    (47 ehrlich ohne Aktion; 0 Netz-Fehler).
  - **Staatsvertrag/pdf-embed:** bestehendes self-hosted PDF (EMRK `-2` kanonisch,
    NYÜ suffixlos), nur ehrlich beschriftet.
- **Abdeckung:** **1411 Erlasse** mit amtlichem PDF (227 Bund + 1184 Kanton) +
  2 Staatsverträge; ehrlich ohne Aktion: 47 Kanton (Drift/kein PDF).
- **Beschriftung (§8):** eine Komponente `parts/AmtlichesPdf.tsx` — «⬇ Amtliches PDF
  (Fassung vom TT.MM.JJJJ)», `<a>` (Bund/Kanton neuer Tab; pdf-embed same-origin
  `download`), `aria-label` vollständig, `lc-chip`-24px-Tap-Ziel (WCAG 2.2 §2.5.8).
- **Drift/Pin-Überwachung (A12-Auflage):** neues Tor **`check:pdf-quellen`** (offline,
  in `check`/`gate`) bindet jede Bund-PDF-URL an den `fedlex-cache.sh`-Pin (URL-
  Konsolidierung == Pin-Konsolidierung == stand) + Projektions-Integrität register↔
  Sidecar + Coverage-Floor; **`check:pdf-quellen-netz`** (in `check:netz`) HEAD-prüft
  alle Bund-URLs + Kanton-Stichprobe auf `application/pdf`. `check:fedlex-versionen`
  bleibt Currency-Arbiter der Pins (grün: alle geltend, inkl. pdf-embed).
- **P5-Gegenprüfung (Risiko-Pfad, unabhängiger Opus-Pass, frischer Kontext, gegen
  Fedlex-SPARQL + Filestore-PDF + LexWork):** Stichprobe 12 (AIG·BBG = Suffix-`-2`;
  ZGB `-1`, OR `-4`, DSG none, BV `-3`; 3× Kanton AG; EMRK/NYÜ) — je unabhängig
  re-derivierte URL == gespeichert UND **Fassungsdatum im PDF gegen `stand`** geprüft;
  der `-2`-Fall gegen die suffixlose (ältere) Datei kontrastiert. **Verdikt:
  `bestanden`** (`gegenpruefung:ok` quittiert, Diff-gebunden).
- **A9-DoD:** e2e `gesetze-pdf-download` (Bund Fedlex-Filestore-Ziel + ehrliche
  «Fassung vom …» + `target=_blank` + aria + Tastaturfokus; Kanton LexWork-Ziel);
  `check:perf-budget` grün (CLS 0 — pdfUrl am Erlass, keine neue Async-Klasse).
- **Tore:** tsc · vitest (inkl. neuer `pdf-quellen.test.ts`) · golden:vergleich
  IDENTISCH · lint · build · e2e `gesetze-pdf-download` grün; `check:pdf-quellen`/
  `check:paritaet`/`check:gegenpruefung` grün. **Alle CI-gated Stufen grün** (CI-`ci.yml`
  fährt tsc/test/lint/build/golden/smoke/e2e/perf — NICHT die volle `check`-Kette).
  **EINZIGES lokales Rot: der VORBESTEHENDE `check:revisionen`** — der P4-Merge (#186,
  9 Staatsverträge) fügte 9 Bund-Snapshots OHNE Paket-5-Revisionen-Sidecar hinzu ⇒
  auf `origin/main` bereits rot (227 Bund vs. 218 Sidecars), **nicht dieser Diff, nicht
  CI-gated**; heilbar nur durch eine eigene Paket-5-Reconciliation (`normtext:revisionen`,
  Risiko-Pfad — bewusst NICHT in U-PDF gebündelt, §14.2). **Golden-Klasse: Engine-Golden
  byte-gleich** (kein `src/lib/vorlagen|tarif`-Eingriff); **register.json + daten-manifest
  additiv-ändernd** (neues Feld `pdfUrl/pdfStand`, `datenhaltung:manifest` nachgezogen).
- **Bewusst NICHT (U-PDF-Scope):** kein render-eigenes PDF (§10.5) · keine Client-
  SPARQL · keine Kopf-Slot-Umlayoutierung (A22-K-1/K-2 «in Kraft seit» + Fussnoten-
  Chip bleiben dem koordinierten V2-Kopf-PR, §10.8 A22 — U-PDF liefert nur den
  Download-Slot) · kein Bund-Self-Hosting (direkter amtlicher Filestore-Link ist
  ehrlicher + driftfrei; pdf-embed bleibt self-hosted wegen `X-Frame-Options`).

### 10.8 · Anmerkungs-Nachzug A19–A25 (David 10.7.2026) — Einordnung, Spec-Heimat V2

**Quelle (WÖRTLICH massgeblich):** Davids Anmerkungen 10.7.2026, im Repo persistiert
als [`docs/ux-audit-2026-07/ANMERKUNGEN-DAVID-2026-07-10.md`](docs/ux-audit-2026-07/ANMERKUNGEN-DAVID-2026-07-10.md)
(per Pathspec committet, §12 Ziff. 2, KA5-Muster). **Spec-Heimat = `FAHRPLAN-GESETZESDARSTELLUNG-V2.md`**
(Ultracode-Recherche 10.7., 17 Agenten, read-only + Fable-Verifikation): dort stehen
alle Befund-Root-Causes (§1), Massnahmen mit file:line-Belegen (§2), Entscheidungsliste
(§3), Reihenfolge/Kollisionen (§4). Dieser Abschnitt DUPLIZIERT die Spec NICHT — er
ordnet Davids Nachzug additiv als neue A-Nummern in das A1–A18-Muster ein (§14 Ziff. 2)
und verweist je Einheit auf die V2-Massnahme. **NUR PLAN — Bau erst mit separatem
David-Go** (anders als die A1–A18-Welle, deren Go am 5.7. erteilt wurde). Ausführung
als Opus-Einheiten; Fable orchestriert nur.

| Einheit | Anmerkungen | V2-Massnahme (Spec-Heimat) | Kern (Wortlaut-Anker) | Verhältnis zu §10 / Kollision |
|---|---|---|---|---|
| **A19 ✅ GEBAUT 10.7.** | Fussnoten VZG + Präambel-Extraktor (FN-1+Drop-Fix+FN-2, `feat/v2-fn1-fn2`; Drop-Fix breiter als geplant → Schlusstitel-Fussnoten korpusweit recovert, «OR/ZGB byte-gleich» galt NICHT, stattdessen strukturell nicht-regressions-bewiesen; Gegenprüfung Fedlex bestanden — Detail V2 §2 F1) | **FN-1 + FN-2 (+ Drop-Fix `disp_*`)**, V2 §2 F1 | «dort sind fussnoten nicht verklinkt im text» (VZG). Extraktor-Fallback: fnbck-leer ⇒ nr aus führendem `<sup>N</sup>` der Definition (matcht 226/226 VZG); Artikel-Regex um `disp_*/art_*` erweitern (17 verschluckte VZG-Noten); Präambel-Marker-Nummern je Kopf-Zeile erfassen (`KopfZeile.fnNrs`). | **Risiko-Pfad** (`scripts/normtext` + `kopf-extrahiere.ts` + Sidecars) ⇒ `check:gegenpruefung` Pflicht. **SOFORT startbar, kollisionsfrei** (kein `parts.tsx`/`inhalt.tsx`; Reader-Marker-Mechanik greift von selbst). Vorbedingung `fedlex-cache.sh` + «0 übersprungen»; abhängig von **Fedlex-P1-a/b**-Pin-Refresh. |
| **A20 ✅ GEBAUT 12.7.** (`feat/v2-fn3`) | Präambel-Fussnoten inline | **FN-3**, V2 §2 F1 | «präambeln haben auch keine verlinkten fussnoten». FnRef-Marker je Präambel-Zeile im `ErlassKopfBlock` (HINTER dem U-VERWEIS-A11-NormText-Element, `artikel="kopf"`) + Anker `fn-kopf-${nr}` am Kopf-Apparat. Daten additiv aus A19 (215 Erlasse / 555 Marker / 0 Orphans korpusweit); R9/§8-Sichtbarkeit (data-fn-marker/-apparat folgen dem Fussnoten-Toggle). Wirkt für OR sofort, für VZG nach A19. Gate voll grün, golden byte-gleich, e2e verweis-u FN-3-Block. | **HART NACH U-VERWEIS-Merge** (belegte `parts.tsx`-Kollision; baut auf dem A11-NormText-Unterbau auf). Reine Darstellung — **Gegenprüfung n/a** (kein Extraktor-Eingriff, kein Risiko-Pfad). |
| **A21** | Absatz-Zuordnung Alt-Form | **FN-4**, V2 §2 F1 | Absatz-Zuordnung für Alt-Form-Erlasse (VZG `absatz=null` ⇒ Marker am Absatz statt Artikelebene). | Bündelt mit A19-Regeneration; Risiko-Pfad-nah (Extraktions-Metadaten). |
| **A22 · K-2 ✅ GEBAUT 11.7.** (K-1/«in Kraft seit» = Datenteil, offen) | Kopf nützlicher + Fussnoten-Anwahl | **K-1 + K-2**, V2 §2 F2 | «der kopf des gesetzes nützlicher … fussnoten anwahl etc dort». K-1: «in Kraft seit …» in die Meta-Zeile (SPARQL `jolux:dateEntryInForce` an die Currency-Pipeline; 54 Erlassdatum-Lücken = Pin-Staleness, kein neuer Code). K-2: Fussnoten-Chip neben ◧Ansicht (Zähler N aus Sidecar; Toggle mit Apparat-Sprung, §8-ehrlich vor A19). | **NACH U-VERWEIS-Merge, in EINEM koordinierten Kopf-PR mit U-PDF** (Slot-Layout Ansicht·Fussnoten·Download nur einmal umbauen). K-1-Anteil (SPARQL/Currency) Risiko-Pfad-nah ⇒ Gegenprüfung. |
| **A23 ✅ GEBAUT 11.7.** | BGE-Steuerung Rubrik-Ansicht | **B-1 + B-2 (Kappung 5→10)**, V2 §2 F3 | «bei bundesgerichtsentscheiden … abwahl möglich … in rubrik ansicht. mit möglichkeit auswahl wie lange zurück bge». B-1: 4. Switch «Entscheide» (Default AN, CSS `data-leitfaelle`). B-2: Zeitraum «alle·20·10·5 J.» (Default alle) über `r.datum`; **Kappung `LEITFAELLE_SICHTBAR` 5 → 10** (David-Entscheid 10.7.). Store-Abo als Primitiv-Selektor (§15). | Golden-neutral (Leitfall-Zeile client-only). **Kollision `parts.tsx`/`inhalt.tsx` ⇒ nach U-VERWEIS-Merge** (V2 §4). Kein Datenbedarf. |
| **A24 · L-1+L-2 ✅ GEBAUT 11.7.** (L-3 offen, David/Council-Gate) | Liniengliederung reparieren | **L-1 + L-2 + L-3** (L-4 ✗), V2 §2 F4 | «funktioniert das mit der liniengliederung praktisch nicht». **L-1 ✅: Einzug-Cap 3→5 (`inhalt.tsx`, `tiefe<=5`) + Mobil-Token `einzug-mobil` (0.75rem statt Kollaps auf 0; `data-linien=aus` kollabiert weiter ALLE Ebenen).** **L-2 ✅: Guide-Ton 10 %/14 % → 18 %/24 % (= `--line-strong`, `--guide-gliederung`).** **L-3 (Auto-Default-Umkehr ZGB/OR, Umkehr #161): NICHT in feat/v2-l1-l2 gebaut — bleibt hinter David/Council-Gate.** L-4 (Ton-Bänder) ENTFÄLLT (David-Entscheid Farbe-nur-Referenzschicht). | Golden-neutral (reine Reader-CSS/TS), kein Datenbedarf, client-seitig. `check:linien-kanon` GRÜN unverändert (Aufbau-Regelwerk/Referenz-Verdikte unberührt — nur L-3 würde sie umstellen); DESIGN-REGLEMENT §4b (Guide-Ton + Einzug-Skala) nachgezogen. Playwright-Beleg Light+Dark Desktop+Mobil@390, CLS 0. |
| **A25** | Mehr Farben (Referenzschicht) | **C-1 + C-2 + C-3**, V2 §2 F5 | «gerne auch noch mit mehr farben». **Doktrin: Farbe NUR Referenz-/Verzahnungsschicht (Chips/Badges/Kopf), Normtext-Körper farbfrei** (David-Entscheid). C-1: KantenChip `kategorie`-Prop (norm=brass byte-id / entscheid=slate), StatusBadge Revisions-↻ → warn. C-2: Overline-Farbpunkte + Currency-Tonung (nach U-VERWEIS, im Kopf-PR). C-3: NormChip/Materialien (DEFER, U-VERWEIS-Kollision). | Golden-neutral (CSS/Token-only). **C-1 SOFORT startbar, kollisionsfrei** (KantenChip/StatusBadge/index.css). C-2/C-3 nach U-VERWEIS. Kontrast-Messung als Gate (slate auf paper dunkel 3.31 knapp). |
| **A26 ✅ GEBAUT 11.7.** | «Ansicht»-Dropdown in die immer sichtbare Leiste + Fussnoten-Auswahl ins Menü | **A26 (reines UI)**, Wortlaut `docs/ux-audit-2026-07/ANMERKUNGEN-DAVID-2026-07-11.md` | «ansichtsdropdown menu in … diese leiste integrieren `Gesetze › Bund › ZPO … Stand … ✕` … immer sichtbar wenn man im gesetz ist» + «fussnotenauswahl ebenfalls in dropdownmenu einfügen». (1) «Ansicht»-Dropdown wandert aus dem weggescrollenden `ErlassLeserKopf` in den IMMER sichtbaren **Inhalts-Kopf** (`InhaltsKopf.tsx`, sticky `top-16`) — via `KopfDaten.ansichtSlot` über den vorhandenen `meldeInhaltsKopf`-Kanal (Layer-Trennung; globaler `leserOptionen`-Store bleibt EINE Quelle §5). (2) Fussnoten-Chip (V2·K-2) geht als **Eintrag** ins Menü auf (Zähler N am `Fussnoten`-Schalter, Chip-Sprung entfällt bewusst). **Platzierung:** Einzelansicht NUR im Inhalts-Kopf (aus `ErlassLeserKopf` entfernt); Split-View (`imPane`) bleibt im `ErlassLeserKopf` (kein `PaneKopf`-Umbau/Stacking-Risiko), nie zwei Menüs gleichzeitig. **Mobil @390:** Icon-only-Trigger (◧, `aria-label`), Panel `absolute` (CLS 0), Inhalts-Kopf `z-30` (Panel über Inhalts-Sticky-Leisten). | **Präzisierung:** Davids «Leiste» = Inhalts-Kopf, NICHT der 2-Spalten-`SektionKontextKopf` (nur der Inhalts-Kopf ist in JEDER Layout-Variante immer sichtbar). Golden IDENTISCH (Reader-Chrome ausserhalb Golden-Scope). e2e `leser-kopf-g2b`/`-v2`/`-a9`/`leser-optionen`/`a11y`/`tastatur`/`smoke` grün (Dropdown-Ort + K-2-Fussnoten-Eintrag nachgezogen). **Gegenprüfung n/a** (reines UI). Roadmap W2·5d. |
| **A27 ✅ GEBAUT 12.7.** | Gliederungspfad-Zeile am Artikel entfernen | **A27 (reines UI)**, Wortlaut `docs/ux-audit-2026-07/ANMERKUNGEN-DAVID-2026-07-12.md` | «bei den gesetzen ist diese line nicht notwendig llgemeine Bestimmungen › Zuständigkeit der Gerichte und Ausstand › Örtliche Zuständigkeit › Allgemeine Bestimmungen › Art. 9 ZPO ⧉ Zitat». Der Sticky Section-Kontextkopf (`SektionKontextKopf`, 2-Spalten-Lesemodus) — tiefer In-Erlass-Gliederungspfad «Titel › … › Art. N» + «⧉ Zitat» — ist **komplett entfernt** (Komponente, `parts.tsx`-Export, `inhalt.tsx`-Nutzung + tote `baueZitat`/`sekLabelById`-Ableitungen). Seit **A26 (#198)** trägt der immer sichtbare Inhalts-Kopf die Orientierung → der zusätzliche Pfad war redundant. **Funktions-Treue (§15):** das «⧉ Zitat» war die Zitat-Kopieraktion (kein «Pane öffnen» — ⧉ = Chip-Dekor); dieselbe Kopieraktion mit identischem `baueZitat`-Voll-Zitat steht je Artikel in der Artikelnummer-Zeile (`ArtikelLeser`). Das echte Pane-⧉ (`oeffneDaneben`, Leitfall-Zeile) unberührt. | Golden IDENTISCH (Reader-Chrome ausserhalb Golden-Scope). e2e `leser-kopf-g2b` (3 Kontextkopf-Tests entfernt, Zitat-Test → Artikel-Knopf umgehängt) + `-a9` (CLS-0-Sprungschritt Breadcrumb → TOC-Gliederung umgehängt) nachgezogen; `check:linien-kanon`-READER-Liste um die gelöschte Datei bereinigt (kein Marker/Regel-Eingriff). Voller `npm run gate` grün, CLS 0. **Gegenprüfung n/a** (reines UI). Roadmap W2·5d. |
| **DEFER** | wortgenaue Marker | **FN-5 = M14/G14**, V2 §2 F1 | wortgenaue Inline-Position (Offset im Haupt-Snapshot) — einziger Pfad mit grossem golden-Haupt-Diff. | **Deferiert hinter QS-PERF/U-POSITION, separates David-Go** (Entscheid 10.7. Ziff. 4). |

**Deklarierte Überstimmungen (an Ort, wie §10.5):**

- **§3.1 / §10.5 «genau 3 Toggles» ist durch Davids Auftrag 10.7. ÜBERSTIMMT (A23):**
  der BGE-«Entscheide»-Switch ist der VIERTE Toggle im «Ansicht»-Dropdown (plus
  Zeitraum-Selektor). Der §3.1-Grundsatz «keine Wucherung» bleibt als Leitplanke; die
  konkrete Zahl «3» gilt nicht mehr. e2e `leser-optionen.e2e.ts:68` `toHaveCount(3)`→4
  ist deklarierter Teil des A23-PRs; Trigger-`title` des Menüs erweitern.
  **✅ VOLLZOGEN 11.7.2026 (koordinierter Kopf-PR `feat/v2-kopf-pr`):** 4. Toggle
  «Entscheide» + Zeitraum-Selektor gebaut, `toHaveCount(4)` deklariert, Trigger-title
  «… , Entscheide (mit Zeitraum)». Der Kopf-PR bündelt A22·K-2 (Fussnoten-Chip) +
  A23·B-1/B-2 + U-PDF-Slot-Layout (Ansicht·Fussnoten·Download, EINMALIG); K-1
  («in Kraft seit», SPARQL/Datenteil) und A20/A24/A25-Reste bleiben offen.
- **U-LINIEN-Vermerk nachgeführt (#161 «geheilt» vs. Re-Meldung 10.7.):** der
  A8/U-LINIEN-Ausführungsvermerk (§10.7, «Davids A8-Befund geheilt») bezog sich auf
  die aufbau-basierte Regel (ZGB ruhig / ArG sichtbar). David re-meldet die Linien am
  10.7. dennoch als «praktisch nicht funktionierend» — **das Delta ist kein Regress von
  U-LINIEN, sondern (a) der bewusste Auto-Default, der bei tiefen Kodifikationen
  (ZGB/OR, `strukturTiefe ≥3`) den Guide GANZ ausschaltet, und (b) der ~1.2:1-Kontrast
  des einen Guides** (V2 §1). A24/L-3 kehrt (a) um (Umkehr #161, David 10.7.
  freigegeben), L-2 hebt (b). Der «geheilt»-Vermerk bleibt für die Regel-Achse gültig,
  wird durch A24 aber um Default-Umkehr + Kontrast ergänzt (nicht widerrufen).

**Reihenfolge-/Kollisionsregeln (V2 §4, Kurzfassung — Detail in der Spec):**

1. **Sofort, parallel zu U-VERWEIS (belegt kollisionsfrei):** A19 (FN-1+Drop-Fix+FN-2,
   `scripts/normtext`+Sidecars) ‖ A25/C-1 (KantenChip/StatusBadge/index.css). Liefert
   Davids Hauptbefund (VZG-Marker) am schnellsten.
2. **Harte Regel:** KEINE Einheit, die `parts.tsx` oder `inhalt.tsx` berührt, vor dem
   **U-VERWEIS-Merge** (A20/A22/A23/A24/A25-C2 warten). Precheck vor jeder Einheit:
   `git worktree list` + `git diff main...<branch> --name-only` + `git diff HEAD`.
3. **Nach U-VERWEIS:** EIN koordinierter Kopf-PR (A22 K-2 + A23 B-1/B-2 + U-PDF-Slot)
   → A20/FN-3 → A24/L-1/L-2/L-3 → A25/C-2, danach C-3.
4. **Daten-Regenerationen bündeln:** A19/FN-1-Regeneration (22 Erlasse) und
   A22/K-1-Erlassdatum-Refresh (54 Sidecars) hängen BEIDE an frischen Pins ⇒ EIN
   Regenerationslauf nach **Fedlex-P1-a/b-Pin-Refresh**, EIN Diff-Audit (OR/ZGB/StGB/BV
   byte-gleich als Nicht-Regressions-Beweis). Vor jeder Regeneration `fedlex-cache.sh`
   + «0 übersprungen»-Kontrolle (sonst grüner No-op-Lauf).
5. **Deferiert:** FN-5/M14 hart nach QS-PERF (separates David-Go).

### 10.9 · A28 — Auto-Linien-Default korpusweit zurückgezogen (David 12.7.2026, Live-Feedback auf L-3)

**Quelle (WÖRTLICH massgeblich):** Davids Chat-Anmerkung 12.7.2026, im Repo persistiert
unter `docs/ux-audit-2026-07/ANMERKUNGEN-DAVID-2026-07-12.md`:

> «das mit den linien funktioniert überhaupt nicht»
>
> «also ist überhaupt nicht fördernd für die übersicht»

**Einordnung.** L-3 (Auto-Default-Umkehr, gebaut 11.7. als #207/PR — der Auto-Guide
wurde für dichte Erlasse AN geschaltet, inklusive der tiefen Kodifikationen ZGB/OR)
beruhte auf der THEORIE, ein einzelner Guide auf `guideEbene` sei die Gliederungshilfe,
die David sehen will. David hat das gestern LIVE an seinen eigenen Leit-Erlassen
gegengeprüft und die Prämisse klar falsifiziert: der aufgedrängte Guide fördert die
Übersicht nicht. **Daten schlagen Theorie** — statt weiter an der Dichte-Schwelle zu
drehen, wird der aufgedrängte Guide zurückgezogen.

**Entscheid A28 (gebaut 12.7., `feat/a28-linien-default`, Trailer `Roadmap: W2·5d`):**
Der Auto-Default wird **korpusweit AUS** gesetzt — `linienProfil().autoGuide = false`
für JEDEN Erlass (SSoT `src/pages/gesetz-leser/linienAufbau.ts`), `data-guide-auto` am
`.lc-leser`-Root ist stets `"aus"`. Kein Erlass drängt die Gliederungslinie mehr auf.

*Begründung der Wahl «korpusweit AUS» (statt Feinjustage):* David sagt nicht «bei ZGB
zu viel, bei ArG zu wenig» (das war A8, per Aufbau-Regel geheilt), sondern «funktioniert
überhaupt nicht» / «überhaupt nicht fördernd» — ein Total-Urteil über den aufgedrängten
Guide als Übersichts-Mittel. Jede verbleibende Auto-Heuristik (Dichte, Tiefe, Kategorie)
bliebe eine Wette gegen dieses Urteil. Der konservative, ehrliche Zustand ist: nicht
aufdrängen. Weitere Justage nur auf neues, positives David-Signal.

**Das FEATURE bleibt — nur das AUFDRÄNGEN endet.** Der K11-Tri-State-NUTZER-Schalter
«Linien» (`data-linien` an/aus/auto, global, `LeserAnsichtMenu`) ist voll funktionsfähig:
wer die Gliederungslinie will, klickt «Linien AN» und bekommt den EINEN Guide auf genau
`guideEbene`. `strukturTiefe`/`guideEbene`/`dichteAmGuide` bleiben voll berechnet (sie
steuern, WO der Guide sitzt und OB der Schalter erscheint — `zeigeLinien = guideEbene
!== null`). Nur der Auto-Default ist aus.

**Nachgezogen (Quelle = Davids Verdikt):**
- `check:linien-kanon` (B1-Invariante auf `!autoGuide` korpusweit; B2-Referenz-Verdikte
  ZGB/OR/ArG/BVV3/HKUE auf `autoGuide=false`, `guideEbene`/`strukturTiefe` weiter gegated
  als Verdrahtungs-Nachweis) — GRÜN, 1144 Sidecars, Auto-Guide AN: 0.
- e2e `leser-linien-kanon` (Auto-Default 0 sichtbare Guides bei ZGB/STG/ArG + neuer
  Override-Positiv-Fall «Linien AN» ⇒ genau 1 sichtbarer Guide, R4 ≤1 hält),
  `gesetze-ux-g3a` (STG/ArG Auto-Default transparent + ArG-Override-Positiv),
  `leser-optionen` (BGBM Linien-Default `aus`; BV Toggle-Zyklus auf A28 umgestellt).
- DESIGN-REGLEMENT-NORMTEXT §4b (Linien-Kanon-Comment index.css/leserOptionen.ts auf
  «Auto-Guide korpusweit aus, Feature via K11» nachgeführt).

Golden byte-gleich (reine Reader-CSS/TS, kein Datenpfad), CLS 0, A9-DoD erfüllt.
Gegenprüfung n/a (keine Rechen-/Extraktions-/Norm-Tarif-Berührung).

**A28-Alternativen-Skizze — Struktur-Übersicht in tiefen Gesetzen (NUR Doku, kein Bau).**
Anker = Davids Wortlaut «überhaupt nicht fördernd für die übersicht». Der zurückgezogene
Auto-Guide war EIN Mittel für Übersicht; er hat versagt. Belegbare Alternativen, die
Übersicht schaffen, ohne eine Linie in den Normtext-Körper zu zeichnen (Rangfolge §4b:
Typo > Einzug > Guide — die ersten drei liegen ÜBER dem Guide):

1. **Typo-Hierarchie der Zwischentitel.** Die Gliederungs-Überschriften (Teil/Titel/
   Kapitel/Abschnitt) tragen die Struktur über Schriftgrad/Gewicht/Laufweite/Abstand
   statt über eine vertikale Linie. Übersicht entsteht beim Scrollen aus dem Text selbst
   (kein Chrome). Beleg: §4b stellt Typo bereits an die Spitze der Rangfolge; heute sind
   die Zwischentitel-Stufen nur schwach differenziert. Risiko gering (reine Token/CSS,
   golden-nah zu prüfen). **ROI-Kandidat #1.**
2. **Sticky-Mini-Kontext (Breadcrumb der aktuellen Sektion).** Ein dünnes, sticky
   Kontext-Band unter dem Inhalts-Kopf zeigt IMMER, in welchem Teil/Titel/Abschnitt man
   gerade liest (via IntersectionObserver, den der Reader schon für den Live-Artikel
   führt). Übersicht = «wo bin ich», nicht «wie ist alles gegliedert». Beleg: A26 hat den
   IMMER sichtbaren Inhalts-Kopf bereits etabliert; `SektionKontextKopf` existiert (A27
   parallel — Kollision beachten). Mittleres Risiko (Sticky-Stacking, CLS).
3. **TOC-Scroll-Spy-Ausbau.** Das vorhandene `SektionBaumTOC` wird zum aktiven Navigator:
   die gerade sichtbare Sektion wird im Baum hervorgehoben + der Baum auto-scrollt mit.
   Übersicht = die Gliederung als eigene, dauerhaft sichtbare Spalte (Desktop) bzw.
   ausklappbar (Mobil) — getrennt vom Normtext-Körper. Beleg: `SektionBaumTOC.tsx` ist
   bereits im Linien-Kanon-READER-Set. Mittleres Risiko (Viewport-Sync, Mobil-Platz).
4. **Abschnitts-Rhythmus (vertikaler Weissraum-Takt).** Grössere, gestufte Abstände
   ZWISCHEN Gliederungsebenen (Teil ≫ Titel ≫ Abschnitt ≫ Artikel) geben dem Auge den
   Takt der Struktur, ohne eine einzige Linie. Übersicht = Rhythmus statt Markierung.
   Beleg: klassisches Gesetzblatt-Satzbild; rein `margin`/`padding`-Token, golden-nah,
   niedrigstes Risiko. Gut mit #1 kombinierbar.

Reihenfolge-Empfehlung (falls David eine Richtung freigibt): #1+#4 zuerst (billig,
golden-nah, körper-intern) → messen → dann #2/#3 (Chrome-Schicht, teurer). **Alle vier
sind Skizze; kein Bau ohne separaten David-Entscheid.**

### 10.10 · Anmerkungs-Nachzug A29–A40 (David 16.7.2026) — Einordnung + Bau-Go

**Quelle (WÖRTLICH massgeblich):** Davids Anmerkungen 16.7.2026, persistiert als
[`docs/ux-audit-2026-07/ANMERKUNGEN-DAVID-2026-07-16.md`](docs/ux-audit-2026-07/ANMERKUNGEN-DAVID-2026-07-16.md).
**Bau-Go liegt vor** (gleiche Session: «run till dry» + «und dann wie immer alles mit
opus bauen») — anders als beim §10.8-Nachzug ist dieser Batch sofort baubar.
Fable orchestriert, jede Einheit = Opus-Agent; Ultracode-Einsätze nach
`FAHRPLAN-TOKEN-OEKONOMIE.md` §5 T20 (A33 trägt ein explizites Ultracode-Opt-in).

| Einheit | A-Nr. (Anm.) | Kern (Wortlaut-Anker) | Risiko / Kollision |
|---|---|---|---|
| **E1** | **A29** (1) | BGE 147 III 121 hat im Original Regeste a UND b, LexMetrik zeigt nur a → Mehrfach-Regesten-Fall in der BGE-Extraktion, korpusweiter Sweep auf weitere betroffene Entscheide. | **Risiko-Pfad** (Rechtsprechungs-Extraktion) ⇒ `check:gegenpruefung` Pflicht. VOR W2·6-PR-B/PR-C (Fix muss vor der nächsten Regeneration drin sein). |
| **E2** | **A30+A31** (2, 3) | A30: Marginalien-Nummerierung mit Buchstaben; «bis»/«ter» bei 1bis etc. hochgestellt (Fedlex-Referenz). A31: Fussnoten-Marker in den Fliesstext; KEIN Abstand zwischen Artikelnummer/Marginalie und Fussnoten-Marker (Fedlex-Referenz); Abstands-Bug ZGB `#art-276` Abs. 1 (Fussnote reisst grossen Abstand zum Folgeabsatz). | Reader-Rendering, voraussichtlich golden-ändernd ⇒ deklarieren, Fedlex-Seitenvergleich als Beweis. Kollision `ArtikelBody.tsx`/Reader-CSS. |
| **E3** | **A34** (6) | Split-View: Klick auf verlinkten BGE lässt das Gesetz auf den früher angeklickten Artikel zurückspringen (Scroll-Verlust); zudem keine Möglichkeit mehr, die Ansicht im Split-View zu ändern (A26 liess das Menü bewusst im `ErlassLeserKopf` für `imPane` — Regression prüfen). | UI-Bug, golden-neutral; e2e-Beleg Pflicht. Kollision `inhalt.tsx`/Pane. |
| **E4** | **A32+A36** (4, 8) | A32: Kontextfenster am Gesetzes-Ende schwer sichtbar → attraktiver positionieren, evtl. unterhalb der Gliederung. A36: ZGB-Gliederungseintrag «Wortlaut der früheren Bestimmungen des sechsten Titels» aus der GLIEDERUNG entfernen — der Inhalt selbst bleibt erreichbar (§15-Treue: nur TOC-Kuration, kein Substanz-Drop). | UI, golden-neutral erwartet (TOC-Filter ggf. Sidecar-berührend → dann deklarieren). |
| **E5** | **A35+A40** (7, 11) | A35: Suchfenster von oberhalb der Gliederung in die Kopfzeile (zu Ansicht etc.); Suchtreffer im Text markieren («Vertrag» im OR gehighlighted). A40: «beim Bundesgericht öffnen ↗» für BGE 150 III 38 führt zum FALSCHEN Entscheid — Deep-Link (`highlight_docid`) empirisch verifizieren, Builder fixen oder ehrlicher Such-Query-Fallback. | UI + Link-Builder; A40 berührt Zitat-Treue (§7) ⇒ empirische Verifikation gegen bger.ch Pflicht. Kollision Kopfzeile mit E3 (sequenzieren). |
| **E6** | **A37** (9) | Gesetz bekommt mehr Platz; «Zitat»-Link sehr weit rechts; verfügbaren Platz nutzen, optimal über Bildschirmbreiten (390–1920+). | Layout, golden-neutral; Screenshot-Serie über Breiten als Beweis. Kollidiert mit E4/E5 (Spalten-Layout) ⇒ nach deren Merge. |
| **E7** | **A33** (5) | «Gliederung springt umher. Wenn man sich darin bewegt. Mit ultracode überprüfen und nützlichkeit verbessern.» → T20-Workflow-Audit des Scroll-Spy-/TOC-Verhaltens (mehrere Lenses, empirisch via Playwright), danach Fix-Einheit. | Explizites Ultracode-Opt-in Davids. Kollision `SektionBaumTOC`/Scroll-Spy mit E4 ⇒ sequenzieren. |
| **→ D-Kette** | **A38** (Nachtrag) | «mache die ganze lexmetrik webseite heller uns weisser» — übersteuert die Flächen-Ton-Zielwerte der Design-Wärme-Kette: D-5 Papier-Treppe mit hellerer/weisserer Basis; Wärme nur noch als Nuance (Tinte/Akzente), nicht als Flächen-Ton. | Heimat `FAHRPLAN-DESIGN-WAERME.md` (D-5); `check:farbwelt`-Zielwerte deklariert nachziehen; Kontrast-Tore (§13/F2) bleiben Arbiter. |
| **→ W2·6** | **A39** (10) | BGE 150 II 308 bei BGFA Art. 20 nicht verlinkt = Korpus-Lücke (Korpus endet bei Band 147), kein Verzahnungs-Bug → BGE-Nachzug PR-B (148/149) + **PR-C (150+151, soweit publiziert)**, Mechanik/Gegenprüfung wie #232. | Risiko-Pfad-Mechanik wie #232; NACH E1/A29. |

**Reihenfolge (Kollisions-Sequenzierung):** E1 (Risiko, datenseitig, unabhängig) ‖
E2 (Rendering) ‖ E3 (Pane) parallel in Worktrees → dann E4 → E5 → E6 → E7;
A38/D-Kette und A39/PR-B/PR-C laufen als eigene Stränge (andere Flächen).
Je Einheit gilt die A9-DoD-Zeile (§10.4) wörtlich; Risiko-Einheiten (E1, A39,
A40-Anteil) mit Gegenprüfungs-Quittung.


## 11 · Gesetze-Aufteilung Bund/Kantone V2 — «Erfassungsgrad-Staffel» (VERBINDLICHE Bau-Spec, 16.7.2026)

**Quelle (WÖRTLICH massgeblich):** David-Auftrag 16.7.2026 — «verbessere mit ultracode
und fable die aufteilung der gesetze kantonal und bund … sinnvoller und praxistauglicher
aufbau und man schnell relevantes findet». Methodik: 5 Empirie-Miner + 3 Entwürfe +
3-Linsen-Judge-Panel + Synthese.

**Herkunft:** Ultracode-Panel 16.7. (3 Entwürfe, 3 Judges). Sieger = «Erfassungsgrad-Staffel — ein Korpus, dichte-neutral gestaffelt», ergänzt um die einstimmigen Judge-Grafts (Named-Article-Garantie als vorgezogene Engine-Einheit, Treffer-Dedup + Kopfzeile, Scope-Chip, interne Rechtsgebiet-Kanonisierung, Mobil-Kollaps als DoD, /international-Kanonik nur als eigene Mini-Einheit). Empirie-Basis: ist-ia (H1–H5), Praxis-Friktions-Audit (12 Tasks, Reibungs-Ranking), Muster-Recherche (M1–M8), plan-bestand-Kollisionskarte.

**Kernidee (bindend):** Der Bestand ist die Wahrheit, die die Struktur tragen muss — BS 859 · AR 266 · Rest 1–7 Erlasse. Der **Erfassungsgrad** (Erlass-Zahl + konservatives Zustands-Wort) wird das ERSTE sichtbare Signal an jeder Kantons-Weiche; «kein Treffer» in einem dünnen Kanton wird als **Abdeckungslücke mit Weiterweg** gerendert, nie als Sackgasse. Die gebauten Säulen (G4), die Kantons-Entrümpelung (G5), das Rechtsgebiets-Gerüst (G6) und der Gliederungs-Umschalter (A15) bleiben unangetastet — der Entwurf ist **additiv** auf ein dicht bebautes Feld.

---

### 11.0 · Skalierungs-Invariante (Bau-Prinzip, gilt für JEDE Einheit dieses §)

Erfassungsgrad-Badges und der dichte-neutrale Kanton-Baustein sind **Dauerform, kein Sonderfall** für die heutige Asymmetrie. Füllt E3 morgen alle 26 Kantone: **es kippen nur Werte (Badges, Listen→Bäume), keine Struktur.** Jede Einheit muss in ihrem PR-Text belegen, dass sie diese Invariante hält (kein Code-Pfad «if kanton === 'BS'», keine hartkodierten Mengen ausser dokumentierten Schwellen in der SSoT §11.2).

### 11.1 · Ziel-IA (Seiten / Routen / Ebenen)

`[NEU]` = Neubau dieses §; alles Übrige ist GEBAUT und bleibt. **Alle bestehenden Deep-Links bleiben auflösbar** (Leitplanke E.4: `?gliederung=` / `?ebene=` / `?kt=` / `#sys-` / `?ansicht=rechtsgebiet`).

```
/gesetze — neutraler Landeplatz (G4 §4.1, unverändert: 3 Kacheln + Live-Statistik, KEIN stiller Bund-Default)
├─ Sprung-/Such-CTA → HeaderSuche (⌘K/Ctrl-K/«/», A5 — bleibt der EINE Suchpfad)
├─ [NEU IA-3] A–Z-/Kürzel-Register — Browse-Zwilling zum Norm-Sprung (Muster M6 gesetze-im-internet):
│     Buchstaben-Leiste + Titel/Kürzel-Filter, title-only auf dem BEREITS geladenen register.json
│     (1469 Erlasse) — KEIN zweiter Index (K10). Virtualisiert (§11.6-Perf).
├─ 3 Säulen-Kacheln (Live-Count aus Manifest, G4):
│   ├─ Bundesrecht (201 Erlasse / 23'974 Artikel)
│   ├─ Kantone (26) — [NEU IA-2] Erfassungsgrad-Kurzlegende auf der Kachel
│   └─ International (37) — Kanonik = diese Säule; /international bleibt Alias-Seite (§11.4, IA-6)
├─ 4. Kachel Rechtsgebiet (?ansicht=rechtsgebiet): bleibt UNVERÄNDERT sichtbar.
│     Demotion zur reinen Gliederungs-Option = David-Frage Y-A (§11.8) — NICHT autonom bauen.
├─ Lokales Filterfeld: [NEU IA-4] Scope-Label + Chip «auf alle Ebenen erweitern» (O5)
└─ Link «Abdeckung» → /abdeckung (Seite EXISTIERT: src/pages/Abdeckung.tsx — nur Verlinkung, K-2c)

?ebene=bund — unverändert (Systematisch default · Relevanz · Rechtsgebiet, A15/A14)
?ebene=international — unverändert (37 Erlasse, SR-0.*-Sachklassen)
?ebene=kanton
├─ Stufe A: 26er-Raster (Karte|Liste, G5) + [NEU IA-2] Erfassungsgrad-Badge je Kachel
│     (Zahl + Zustands-Wort; «keine Erlasse» im aria-label der SchweizKarte, O4)
│     Sortierung: Alphabet | Erlass-Zahl | Region (G5, unverändert) + [NEU] Erfassungsgrad.
│     DEFAULT bleibt unverändert — Umstellung auf Erlass-Zahl = David-Frage Y-B (§11.8).
└─ Stufe B (?kt=XX):
    ├─ [NEU IA-2] Erfassungs-Kopf: «n Erlasse erfasst — [vollständig|Auswahl|dünn]»
    │     + Link amtliche Sammlung des Kantons + Link /abdeckung (K-2c-Semantik §11.2)
    ├─ Schnellwechsel-Pills: [NEU IA-2] Erlass-Zahl-Badge an jeder der 26 Pills (M4:
    │     Asymmetrie an JEDER Kantons-Weiche sichtbar)
    ├─ Kanton MIT Systematik-Baum (19/26): Baum unverändert (3 Gliederungen, A15)
    └─ Kanton OHNE Baum / dünn (GE,JU,NE,SZ,TI,VD,ZH…): [NEU IA-2] dichte-neutraler Baustein =
          flache ehrliche Liste (0 Akkordeon-Ebenen) + K-2e-Hinweis «amtliche Systematik folgt»
          + Lücken-Hinweis mit Link lexfind/Amtsquelle. Null-Treffer im Kanton-Scope rendert
          IMMER die Abdeckungslücke («ZH: 3 Erlasse erfasst — Vollständigkeit: amtliche
          Sammlung/lexfind»), nie einen leeren Zustand (praxis #4/#11, Reibung 5).

Reader = /gesetze/{ebene}/{key}#art-… — getrennte harte Kette, in diesem § NICHT berührt
(Leitplanke E.1/§14.2; Anker bleibt IMMER #art-, NIE #par- — R8/K2).
/suche (S5, 12.7. gebaut) — bleibt unverändert bestehen, KEIN 301 (§11.7).
Sidebar-Kantonsliste: [NEU IA-7] Erlass-Zahl-Badges (geteilte Nav → eigene Einheit).
```

### 11.2 · Erfassungsgrad-Semantik (SSoT, konservativ-dreistufig — BINDEND)

Neue SSoT **`src/lib/normtext/erfassungsgrad.ts`** (eine Stelle, wie G6 es für Themen-Mitgliedschaft vorgemacht hat; Vorbild A14: «dokumentiert-deterministisch, §8, KEINE geratene Wichtigkeit»):

1. **`vollständig`** NUR wenn ein empirischer **Enumerations-Beleg** vorliegt (belegtes N der amtlichen Sammlung mit Datum + Quelle, im Code als Kommentar-Fakt dokumentiert) UND erfasst n ≥ N. Bindender plan-bestand-Wortlaut K-2c: *«N nur ausweisen, wo empirisch belegt (Enumerations-Fakt mit Datum), sonst weglassen.»* Heute qualifiziert bestenfalls BS — und auch BS erst NACH Beleg-Erhebung, sonst «Auswahl».
2. **`Auswahl`** wenn n ≥ 20 (dokumentierte, deterministische Roh-Schwelle — heute: AR 266, ggf. BS bis Beleg).
3. **`dünn`** wenn n < 20 (heute: 24 Kantone).
4. **NIE ein Prozentsatz ohne belegtes N.** Keine Wort-Ampel mit Werturteil («voll/Stichprobe») — nur die belegte Zahl + der konservative Zustandstext (Judge-Konsens; §8 «nie raten»).
5. Schwellen-Änderungen nur per Spec-Änderung an diesem §, nie ad hoc im Code.

**Gate-Folge:** `erfassungsgrad.ts` liegt unter `src/lib/normtext/` ⇒ **`check:gegenpruefung` Pflicht (KC2)** — IA-2 ist NICHT «reine UI» (Leitplanke E.6).

### 11.3 · Interaktions-Budgets je Praxis-Task (DoD-Artefakt)

Zählregel: 1 Interaktion = 1 Klick ODER 1 abgeschlossene Eingabe+Enter. Diese Tabelle ist **Abnahme-Artefakt** jeder Einheit (Judge-Graft: «Abnahme gegen reale Aufgaben statt Struktur-Schönheit») und wird als e2e-Walk automatisiert (§11.6).

| # | Praxis-Task (Audit 16.7.) | Weg nach V2 | Budget | Voraussetzung |
|---|---|---|---|---|
| 1/9 | Art. 336c OR / «OR 257d» nachschlagen | Norm-Sprung → Reader `#art-…` | **1** | **IA-1** (heute Fiktion: API liefert zitierende Artikel, `OR 257d` = 0 Treffer) |
| — | dito, Fallback ohne exakten Parser-Match | Ergebnisliste, Zielartikel OBEN | **2** | IA-1 |
| — | Erlass per Kürzel (OR), Kürzel bekannt | Norm-Sprung | **1** | gebaut (A5) |
| — | Erlass OHNE Kürzel-Kenntnis (H1) | A–Z-Register: Buchstabe → Titel | **2** | IA-3 (heute 3–4 + Scroll) |
| 5 | Thema Arbeitsrecht (Bund) | Rechtsgebiet-Gliederung → Bündel | **2** | gebaut (G6/A15) |
| 3 | BS Anwaltsgesetz | Suche «Anwaltsgesetz Basel» → Treffer | **2** | gebaut (Synonym-Brücke) |
| 4/11 | «Regelt ZH/BE etwas zu X?» | Kantone → ZH (Badge «3 · dünn») → ehrliche Liste + Lücken-Link | **2 bis ehrliche Antwort** | IA-2 (heute: Sackgasse, Reibung 5) |
| 10 | Datenschutz überblicken | Suche → dedupliziert + Kopfzeile «n Treffer, davon x Erlasse / y Artikel» | **2** | IA-1 (Dedup-Teil) |
| — | Kalt-Browse /gesetze → gelesener Bund-Erlass | Kachel → Systematik → Karte | **≤ 4** | gebaut (Regressions-Wächter: darf nicht schlechter werden) |

### 11.4 · Migrations- / Redirect-Regeln (bestehende Routen)

1. **Kein einziger 301 in diesem §.** Alle heutigen URLs bleiben mit identischem Inhalt auflösbar (Leitplanke E.4; hält alle bestehenden e2e-Assertions grün).
2. **`?ansicht=rechtsgebiet` (IA-5):** intern wird EIN kanonischer Zustand geführt (`?gliederung=rechtsgebiet`, A15-Mechanik); die Alt-URL bleibt auflösbarer Alias und darf beim Parse auf die kanonische Form normalisiert werden. Bindend A15: *«Tür bleibt zusätzlich erreichbar, NICHT entfernt.»* Beweis: `e2e/gesetze-uebersicht-u.e2e.ts:112` («?ansicht=rechtsgebiet (G6-Tür) bleibt erreichbar») und `e2e/gesetze-rechtsgebiet-g6.e2e.ts:62` bleiben grün; wo Assertions die URL-FORM statt Erreichbarkeit prüfen, Anpassung mit Begründung im PR deklarieren.
3. **`/international` (IA-6, Stufe 1):** Kanonik = Säule `?ebene=international`; `/international` bleibt voll funktionale Alias-Seite inkl. der 5 Hash-Anker (`src/lib/navigation.ts:132–136`: `#menschenrechte`, `#privat-zivil`, `#rechtshilfe`, `#schweiz-eu`, `#eu-verordnungen`). Stufe 1 = nur `rel=canonical` + Vereinheitlichung interner Links. **Stufe 2 (echter Redirect) NUR mit separatem David-Go** + Hash-Mapping aller 5 Anker + Deep-Link-Regressionstest (Judge-Graft G3; R-SCOPE-4: geteilte Nav ausserhalb `Gesetze.tsx`).
4. **`/suche` (S5):** bleibt. Erst am 12.7. gebaut (5 e2e-Tests in `suche-seite.e2e.ts`) — jeder 301-Vorstoss ist verworfen (§11.7).
5. **Reader-Routen** `/gesetze/{ebene}/{key}` + `#art-`-Anker: unberührt. Karten tragen weiter den nackten Basispfad (SEO/Mittelklick).
6. `/abdeckung`: bestehende Seite, wird nur verlinkt (kein Routen-Neubau).

### 11.5 · Etappierung — PR-grosse Bau-Einheiten (Opus baut, Fable orchestriert)

Je Einheit gilt die **A9-DoD-Zeile (§10.4) wörtlich** (CPU-Throttle 6×, CLS 0, `check:perf-budget` grün, Golden byte-gleich — Default `systematisch` hält Prerender/Golden byte-gleich, A15).

**IA-1 · Named-Article-Garantie + Dedup (Engine, VORGEZOGEN — höchste Einzelpriorität der Kampagne)**
- **Spec:** Für Norm-Queries («OR 336c», «Art. 336c OR», «336c OR») ist der **Zielartikel IMMER oberster Treffer der `sprung`-Gruppe** (A6-Rangfolge bleibt: Norm-Sprung → Gesetze/Artikel → Entscheide → Materialien → Werkzeuge); Enter = Direkt-Sprung in den Reader auf den kanonischen `#art-`-Anker (exakte Schreibweise = bestehende Reader-Anker, empirisch ablesen; NIE `#par-`, R8/K2). Greift der Parser nicht exakt: **Fallback in die Ergebnisliste MIT Zielartikel oben** — nie «0 Treffer» bei existierendem Artikel (heilt praxis #1/#9, Reibung 5+4). Quelle: bestehende `artikelVolltext`-Quelle über `src/lib/suche/normQuery.ts` — bindend K10: *«KEIN zweiter Suchindex.»*
- Im selben Engine-PR: **Treffer-Dedup** (Riehen-Doppel, `RiE`-Varianten) + **Ergebnis-Kopfzeile «n Treffer, davon x Erlasse / y Artikel»** (praxis #10).
- **Empirie VOR Bau (Pflicht):** Playwright-Klick-Test auf `/gesetze/bund/OR` + HeaderSuche («OR 336c», «OR 257d») — der Praxis-Befund war API-abgeleitet [UI-unbestätigt]; erst Repro, dann Fix.
- **Gates/Kollision:** Risiko-Pfad ⇒ `check:gegenpruefung` Pflicht (KC2). `suche-seite.e2e.ts` (5 Tests) muss grün bleiben. `/api/suche` wird auch vom Verzahnungs-Strang konsumiert (**laufende PRs: #232, W2·6 PR-B/PR-C**) — nach bzw. koordiniert mit #232-Merge starten. §10.10 **E5 (A35 Reader-Suchfenster)** ist eine ANDERE Fläche (Reader-Kopfzeile) — nicht mischen (§14.2), Wording abstimmen.

**IA-1 ✅ GEBAUT 16.7.2026 (Opus, Worktree `lm-ia1`, PR #264).** Diff eng auf die Query-Engine (`src/lib/suche/normQuery.ts`, `src/lib/universalSuche.ts`) + Suche-UI-Verdrahtung (`SuchResultate.tsx`) — Korpus/`/api/suche` NICHT berührt (koordiniert mit PR-B). **(1) Named-Article für FR/IT + SR:** ALIAS-Tabelle um 6 amtliche Kurztitel erweitert (CPP→StPO, Cst/Cost→BV, LDIP→IPRG, LTF→BGG, CPM→MStG — je SR-verankert, Beleg-Check 16.7.); NEU **SR-Nummer-Sprung** «SR 220»/«SR 312.0 Art. 5» (nur Bund, eindeutig, exakte + kollisionsfrei «.0»-gekürzte Form). Der Zielartikel bleibt oberster `sprung`-Treffer, Enter springt auf `#art-` (NIE `#par-`, R8/K2). **(2) Treffer-Dedup** (`dedupErlasse`, nur in der Suche): kollabiert titelgleiche Gemeinde-Doppel (RiE/BeE/BaB-Kopien desselben kantonalen Erlasses) deterministisch auf die kantonale Kern-Nummer — 12 Register-Dup-Gruppen, 0 kanton-/bund-übergreifend, kein Bundeskodex betroffen. **(3) Sichtbare Ergebnis-Kopfzeile** «n Treffer, davon x Erlasse / y Artikel» (praxis #10). **Beweise:** Interaktions-Zähl-Walks + Named-Article-Klick-Beweis (`e2e/gesetze-ia-v2-walks.e2e.ts`, «OR 336c»/«OR 257d»/Negativ-Fall — alle Budget 1, Zielartikel im Viewport); Regressions-Sets (`norm-sprung`/`suche-seite`/`a11y`/`tastatur`/`gesetze-uebersicht-u`/`-kanton-g5`/`-rechtsgebiet-g6`) grün; golden 209 byte-gleich; unit +38 Fälle (normQuery 54, universalSuche-Dedup 3). **Gegenprüfung bestanden** (eigene Re-Derivation 30/30 DE/FR/IT gegen echtes Manifest + unabh. Opus-Prüfer gegen Fedlex-SPARQL; Alias/SR/Dedup/Anker verifiziert). Fremd-rot dokumentiert: `check:materialien` (Vernehmlassungs-Stichdaten) + `check:bibliothek` (S7.3-Link in `werkzeuge/` aus PR #251) — beide unberührt vom IA-1-Diff. Roadmap W2·5d.

**IA-2 · Erfassungsgrad sichtbar (O4 + K-2c + K-2e — Übersicht-UI + SSoT §11.2)**
- Badges auf 26er-Raster (Karte + Liste) + Kachel-Legende auf /gesetze; `SchweizKarte.tsx`-aria-label inkl. «keine Erlasse» (O4; Achtung plan-bestand: role/aria/tabIndex existieren bereits, `SchweizKarte.tsx:64–71` — nur ergänzen); Erlass-Zahl-Badges an den 26 Schnellwechsel-Pills (Stufe B); Erfassungs-Kopf je `?kt=XX` (§11.1) mit Link amtliche Sammlung + `/abdeckung`; dichte-neutraler Baustein für baumlose/dünne Kantone inkl. Null-Treffer-als-Lücke; zusätzliche Sortier-Option «Erfassungsgrad» (Default unverändert, Y-B). K-2c-Überlappung mit der G5-Kontextzeile (§4.3 Punkt 1) auflösen, **nicht doppelt bauen**.
- **Gates/Kollision:** `src/lib/normtext/erfassungsgrad.ts` ⇒ `check:gegenpruefung` Pflicht. `gesetze-kanton-g5.e2e.ts` erweitern, nicht brechen. Flächen: `Gesetze.tsx`, `KantonAuswahl`, `SchweizKarte.tsx`, `ErlassKarte.tsx` — KEINE §10.10-Einheit (E1–E7) berührt diese Dateien, aber Worktree-Disziplin wegen paralleler Verzahnungs-PRs. Mobil: kollabierte Form Pflicht-DoD (§3.1 «keine Wucherung», S6-Anschluss).

**IA-3 · A–Z-/Kürzel-Register (Browse-Zwilling, M6)**
- Buchstaben-Leiste + title-only-Filter auf dem bereits client-geladenen `register.json` (kein zweiter Index, K10; kein Client-Kanton-Suchindex, K10/§15.3). **Virtualisierung/Lazy-je-Buchstabe Pflicht** (1469 Titel; R-PERF-5): CLS 0 unter CPU-Throttle 6×. Mobil kollabiert. Budget-Beweis: Erlass ohne Kürzel-Kenntnis in 2 Interaktionen (H1-Heilung).
- Reine UI ⇒ `gegenpruefung: n/a`. Kollision: `Gesetze.tsx` mit IA-2 ⇒ **nach IA-2** (gleiche Datei).

**IA-4 · Scope-Chip lokale Suche (O5-Rest)**
- Jedes lokale Browse-Filterfeld: Scope-Label («Filtert: Kanton BS») + Chip **«auf alle Ebenen erweitern»** (Default-Scope = aktive Ebene, 1 Klick weitet). Bindend O5/A5: die Sprung-Karte bleibt CTA auf die HeaderSuche — *«KEIN dritter Suchpfad»*, keine vierte Suchfläche. Reine UI, klein; nach IA-2/IA-3.

**IA-5 · Rechtsgebiet-Parameter-Kanonisierung (Mini-PR)** — §11.4 Ziff. 2. Reine UI. Die 4. Kachel bleibt unverändert.

**IA-6 · International-Kanonik Stufe 1 (Mini-PR, geteilte Nav)** — §11.4 Ziff. 3. **Eigener PR, NIE im Badge-PR** (R-SCOPE-4); Kollisionsabgleich mit FAHRPLAN-UI-NAVIGATION (O2 Sidebar-Konsistenz) vor Start; Deep-Link-Regressionstest (5 Anker + `a11y.e2e.ts`-Assertions) Pflicht.

**IA-7 · Sidebar-Kantonsliste-Badges (R4, Mini-PR, geteilte Nav)** — Erlass-Zahl an den 26 Sidebar-Links (`navigation.ts`), konsumiert `erfassungsgrad.ts` aus IA-2. Nach IA-2, abgestimmt mit O2; nicht mit IA-6 mischen.

**Sequenz:** IA-1 (Engine, gegengeprüft) ‖ IA-2 (UI) parallel in getrennten Worktrees → IA-3 → IA-4 ‖ IA-5 → IA-6 → IA-7. David-Fragen Y-A/Y-B (§11.8) blockieren nichts und werden parallel vorgelegt. IA-1 wartet auf #232-Merge (flaky-CI-Rerun läuft) bzw. koordiniert mit PR-B.

### 11.6 · Mess- / Beweis-Punkte (je Einheit im PR nachzuweisen)

1. **e2e-Task-Walks mit Interaktions-Zählung:** neue Datei `e2e/gesetze-ia-v2-walks.e2e.ts` — pro Zeile der §11.3-Tabelle ein Walk, der Klicks/Submits ZÄHLT und das Budget asserted. Die ausgefüllte Tabelle (Soll/Ist) ist Pflicht-Artefakt jedes IA-PRs.
2. **IA-1 Klick-Beweis:** Playwright: HeaderSuche «OR 336c» → Enter → URL trägt `/gesetze/bund/OR` + `#art-`-Anker, Zielartikel im Viewport; «OR 257d» analog; Negativ-Fall (Tippfehler) → Liste mit Zielartikel-nahen Treffern oben, nie Leerseite. Gegenprüfungs-Quittung (KC2).
3. **Sackgassen-Beweis (IA-2):** Kanton ZH, Query ohne Treffer → Lücken-Hinweis mit Erlass-Zahl + Link amtliche Quelle/lexfind sichtbar (e2e-Assertion).
4. **Determinismus-Beweis (IA-2):** Unit-Test `erfassungsgrad.ts` gegen fixen Manifest-Snapshot; «vollständig» erscheint NUR bei hinterlegtem Enumerations-Beleg (K-2c).
5. **Perf/CLS:** A9-DoD wörtlich (CPU-Throttle 6×, CLS 0, `check:perf-budget` grün) — kritisch bei IA-3 (1469 Titel) und IA-2 (26 Badges).
6. **Golden/Prerender:** Default `systematisch` bleibt byte-gleich (A15); `golden:vergleich` IDENTISCH; Übersicht ausserhalb Engine-Golden ⇒ empirischer Prosa-Byte-Beweis im PR.
7. **Regressions-Sets grün:** `gesetze-kanton-g5.e2e.ts`, `gesetze-uebersicht-u.e2e.ts`, `gesetze-rechtsgebiet-g6.e2e.ts`, `suche-seite.e2e.ts`, `a11y.e2e.ts`.
8. **a11y:** Badges nie nur Farbe (immer Text-Zahl + Zustands-Wort); aria-labels der SchweizKarte inkl. «keine Erlasse».
9. **Mobil-Beweis:** Screenshot @390 je Einheit — kollabierte Steuerleiste, keine Wucherung (§3.1).

### 11.7 · Scope-Grenzen — BEWUSST NICHT (verhindert Wiederkehr)

- **Kein Abriss des G4-Landeplatzes**, keine merged «Alle»-Default-Liste (erbt heute BS-859-Rauschen, bricht morgen an 26×-Skalierung + §15) — Panel-Verdikt gegen Entwurf 2; als Nordstern-Notiz archiviert, nicht bauen.
- **Kein 301 für `/suche`** (S5-Errungenschaft, 12.7.) und **kein 301 für `/international`** in diesem § (nur Kanonik Stufe 1, §11.4).
- **Kein zweiter Suchindex** (K10), kein Client-Kanton-Suchindex (K10/§15.3), **keine Command-Palette** (A5/§Z1), **kein `#par-`** (R8/K2).
- **Keine Wort-Ampel/Prozentsätze ohne belegtes N** (§8/K-2c, §11.2) — keine erfundene Systematik/Klartext-Expansion (§4.3 Punkt 5: *«§8 nie raten»*).
- **Keine Rechtsgebiets-Vollkuration** (K8 + Abnahme-Zeitsperre bis 1.12.2026); Querschnitts-Themen bleiben NUR Bund (G6).
- **Kein SektionKontextKopf-Revival** (A27), **Auto-Linien-Default bleibt AUS** (A28).
- **Keine 26×-Korpus-Assets:** K-G1…K-G5 bleiben E3/VPS-gegated — *«NICHT starten»* (FAHRPLAN-KANTONE §1-B).
- **Kein Reader-Umbau** in diesem § (getrennte harte Kette, Leitplanke E.1; die laufende §10.10-E-Reihe E1–E7 hat dort Vorfahrt).
- Kein neues Feld `rechtsgebietThema?` im Register (G6-Entscheid: keine zweite Wahrheit).

### 11.8 · David-Fragen (§Y-Verfahren — vorlegen, NICHT autonom bauen)

- **Y-A:** Rechtsgebiet-Sicht von 4. Einstiegskachel zu «nur Gliederungs-Modus» demoten? (grenzt an A15; Alias bleibt so oder so — nur die visuelle Herabstufung ist die Wette.)
- **Y-B:** Default-Sortierung des 26er-Rasters auf «Erlass-Zahl» (Inhalt zuerst) statt Alphabet?
- **Y-C:** `/international` Stufe 2 (echter Redirect mit Hash-Mapping) — erst nach Stufe-1-Betrieb.

### 11.9 · Bindende Entscheide (Zitat-Register aus plan-bestand — von JEDER Einheit zu respektieren)

1. §4.1/G4: *«KEIN stiller Default auf ‹Bund›, neutraler Landeplatz + prominente Artikel-Suche»* — Kacheln bleiben.
2. §4.2/K10 (mehrfach bekräftigt): *«KEIN zweiter Suchindex; Parser sitzt auf bestehender artikelVolltext-Quelle.»*
3. A5/§Z1: Palette gelöscht, ⌘K fokussiert HeaderSuche — *«Wiedereinführung nur mit neuem David-Entscheid.»*
4. R8/K2: *«Anker bleibt IMMER `#art-`, Parser erzeugt NIE `#par-`.»*
5. §4.3/G5 Punkt 5: ehrlicher «Nicht systematisiert»-Block, *«KEINE erfundene Klartext-Expansion (§8 ‹nie raten›)»* — der dichte-neutrale Baustein baut darauf, ersetzt es nicht.
6. §4.4/G6/K8: *«KEIN Voll-Kuratierungs-Versprechen»*, Querschnitt NUR Bund, «unzugeordnet» zulässig.
7. A14: Sortierungen *«DOKUMENTIERT-DETERMINISTISCH (§8, KEINE geratene Wichtigkeit)»* — Vorbild für §11.2-Schwellen.
8. A15: *«?ansicht=rechtsgebiet bleibt zusätzlich erreichbar, NICHT entfernt»*; *«Default `systematisch` hält Prerender/Golden byte-gleich»*; URL-Kompat `?ebene=`/`?kt=`/`#sys-` bindend.
9. K-2c: *«N nur ausweisen, wo empirisch belegt (Enumerations-Fakt mit Datum), sonst weglassen»* + nicht doppelt zur G5-Kontextzeile bauen.
10. K-2e: bei baumlosen Kantonen *«‹amtliche Systematik folgt› statt nur ‹Nicht systematisiert›»* (Daten-Nachzug = K-13).
11. Leitplanke E.1/§14.2: Übersichts-Fläche (`Gesetze.tsx` etc.) und Reader-Kette *«NICHT vermischen — Rechtsinhalt/Extraktion ≠ reines UI in einer Einheit»* ⇒ IA-1 (Engine) strikt getrennt von IA-2 (UI).
12. §3.1: *«keine Wucherung»* im Kopf/Steuerleiste (2× von David durchgesetzt) — Mobil-Kollaps ist DoD, nicht Kür.
13. Leitplanke E.6/KC2: sobald `src/lib/normtext`/`register.ts`/`scripts/normtext` berührt ⇒ `check:gegenpruefung` Pflicht (gilt für IA-1 und IA-2).
14. O4-Korrektur am Code: a11y-Kern der SchweizKarte existiert bereits (`SchweizKarte.tsx:64–71`) — *«Kartenrest nur nach Prod-Repro.»*
15. FAHRPLAN-KANTONE §1-B: alle 26×-Assets E3-gegated — *«NICHT starten.»*
