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
| **G1** | Linien-Sprache (3 Rollen-Tokens), `max-w-reading`-Fix, Einzug-Skala, Typo/hyphens-Fix, Randtitel-Einzug. Reglement-Falt ins DESIGN-REGLEMENT-NORMTEXT.md. Tore R1 (marker-scoped)/R2/R4/R5. | `index.css`, `tailwind.config.js`, **`parts.tsx`**, **`inhalt.tsx`**, `ArtikelBody.tsx`, `helpers.tsx` | 1–1½ Session | **Golden ändert** (Klassen) → neu abnehmen; `gegenpruefung: n/a — reine Darstellung §3`; Visual-Review Desktop+Mobil |
| **G2a** | Options-Leiste (Linien/Fussnoten/Verweise) als reine `data-*`-Toggles, localStorage + Pre-Paint; R6/R9. | **`inhalt.tsx`**, `index.html`-Head | 1 Session | **golden byte-gleich** (R6, Toggles = CSS); Reader-Smoke (Ctrl+F/Anker/Print/Fussnote) |
| **G2b** | Kopf-Zusammenführung (2 Blöcke → 1), Fussnoten-Render-Fix (nach Selektor-Prüfung), Sticky-Kopf opak, Sticky-Section-Kontextkopf, «Zitat kopieren». | **`inhalt.tsx`**, **`parts.tsx`**, evtl. `KontextPanel` | 1 Session | **Golden ändert** → neu abnehmen; Reader-Smoke |
| **G3a** | Per-Grundart-**Darstellung**: §-Label (KANTON, Anker bleibt `#art-`/R8), Präambel/Protokolle (⑤), PDF-Rahmen (⑦), Live-Verweiskarte (⑧), Kurzerlass-Lesespalte (④). | **`parts.tsx`**, **`inhalt.tsx`**, `register.ts` | 1½ Session | **Golden ändert** → neu; `gegenpruefung: n/a — reine Darstellung` |
| **G3b** | **Risiko-Pfad:** Anhang-Block (③/⑤) + Tarif-Anhang → echte Tabelle. Gekoppelt an `FAHRPLAN-TARIF-TABELLEN-STUFE2.md` + `annex_*`-Plan. | `ArtikelBody.tsx`, Extraktions-Skripte, `register.ts` | **mehrere Sessions** | **`check:gegenpruefung` zwingend** (Extraktion!); golden neu |
| **G4** | Einstieg /gesetze (3 Kacheln, Dopplung raus) + Cmd/Ctrl-K-Rahmen + Norm-Query-Parser (KEIN Neu-Index). | `src/pages/gesetze/*` (nicht Leser) | 1–1½ Session | kein Normtext; UI-Test + Parser-Akzeptanz |
| **G5** | Kantons-Seite: Kontext-Zeile, Sortier/Filter, Karte default, Ordnung vereinheitlichen, Roh-Code→Klartext, Mobil-Namen. | Kantons-Übersicht-Komponenten, Systematik-Mapping | 1½ Session | kein Normtext; UI-Test |
| **G6** | Rechtsgebiets-Sicht: Auto-Grundgerüst aus `rechtsgebiet` + Querschnitts-Delta (6–8 Themen), Themen-View, Verzahnung, tolerantes Tor. **Vollkuration = späterer Strang.** | `register.ts`, `rechtsgebiet-thema.ts`, Themen-Seite | 1–1½ Session (Gerüst) | Datenfeld; Querschnitts-Beleg (§7), `status: entwurf` |

**Reihenfolge:** **G0 → G1 → G2a → G2b → G3a → G3b** (harte Kette, gemeinsame
Dateien; G0 unblockt die Grundart-Verzweigung; G3b als eigener Risiko-Pfad
zuletzt). **G4, G5, G6** kollisionsarm parallel/dazwischen (G6 nach G0). Gegen
V1c/V1b: diese **vor** G1 abschliessen **oder** G1–G3a in Worktree
(`.claude/worktrees/`) isolieren und nach V1c/V1b rebasen — nie gleichzeitig in
`parts.tsx`. M5 nur gegen G2 (KontextPanel) beachten.

---

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
