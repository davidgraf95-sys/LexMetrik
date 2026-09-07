# FAHRPLAN — Design-Identität: nicht aussehen wie jede andere Claude-Seite (Auftrag David 5.9.2026)
<!-- @lagebild name: Design-Identität · zweck: LexMetrik bekommt eine eigene Farb- und Schrift-Handschrift, damit es nicht wie die übliche Creme-Gold-Juristenseite aussieht. -->

> **ROADMAP-Schritt:** `W2·24-DESIGN-IDENTITAET` (`feld: design`).
> **Anlass (David 5.9.2026):** legaldeadline.ch/methodik — «wahrscheinlich auch von claude erstellt
> und sieht sehr ähnlich aus, wie lexmetrik. was können wir machen um designtechnisch nicht so
> auszusehen?» · Entscheid David: «ja, leg den schritt an und mach die varianten nach der landung»
> (nach der Landung von `W2·23-STARTSEITE-V4`).

## §1 · Befund und Ziel (`W2·24-DESIGN-IDENTITAET`)

**Befund (ausgelesen 5.9.2026, legaldeadline.ch):** `--canvas #f7f5f0`, `--paper #fdfcfa`,
`--gold #8b6914`, `--navy #0a1220`, Inter, Overlines in Gold-Versalien mit weitem Tracking,
Brotkrumen, `--radius .75rem/1rem`, Schatten-Skala. LexMetrik: `--paper #FCFAF6`, `--brass-700
#826225`, `--ink-900 #1C1A15`, Geist, `.lc-overline` Versalien 0.12em, `rounded-2xl`-Karten.
**Dieselben drei Signaturen:** Creme+Gold · Gold-Versal-Etiketten · weiche Karten auf Pastell.

**Ziel:** Eine eigene, wiedererkennbare Handschrift, die die inhaltliche Tiefe (amtliche Quellen,
verzahnt) zeigt statt Rechner-Optik. Umsetzung als **Token-Tausch** in `src/index.css`
(`:root` + `html.dark`) und `tailwind.config.js`, ohne Komponenten-Umbau; flip-reversibel.

**Grenzen:** Kontrast-Tore (`check:farbwelt`, axe, APCA-Protokoll wie `abnahme/startseite-v3/
KONTRAST-PROTOKOLL.md`) grün; Normtext-Körper farbfrei (§13); keine Rohwerte in Komponenten;
Golden byte-gleich (Token-Schicht berührt keine Ausgaben); Schrift-Lizenzen offen (OFL) und
`check:lizenzen` grün; Bundle-Budget (`check:perf-budget`) für zusätzliche Webfonts prüfen.

## §2 · Die fünf Hebel (Vorschlag 5.9.2026, Reihenfolge = Wirkung)

1. **Farbwelt kippen:** kühles, fast weisses Papier; EINE tiefe Akzentfarbe aus der Schweizer
   Amtswelt (Kandidaten: dunkles Bundes-Rot · tiefes Tannengrün · Schiefer-Blau), sparsam als
   Linie/Aktivmarke; Grau-Tinte statt Braun-Tinte. Brass bleibt höchstens im Siegel.
2. **Etiketten ohne Versalien:** `.lc-overline` → kleine, nicht-versale Zeile (fett oder kursiv),
   Tracking normal. Ein Token/eine Klasse, wirkt site-weit.
3. **Kanten statt Kissen:** Radien auf `--radius-sm` (≤ 4 px), Trennung über Linien statt
   Flächen-Tönung; Schatten nur für schwebende Ebenen (Menüs, Dialoge).
4. **Text-Schrift mit Charakter:** Serife (OFL: Source Serif 4 · Literata · Newsreader) für
   Normtext und Entscheide (`DESIGN-REGLEMENT-NORMTEXT.md` nachziehen), Grotesk nur für
   Bedienelemente. Lesemass (CPL, Zeilenhöhe) neu messen.
5. **Ein Marken-Motiv:** Siegel + Skalenstrich als einziges wiederkehrendes Zeichen, in der
   neuen Akzentfarbe (Logo.tsx, Aktivmarke Sidebar).

## §3 · Vorgehen

1. **Varianten-Bilder (nach Landung W2·23):** drei Varianten (je Hebel 1 mit anderer
   Akzentfarbe, Hebel 2–3 überall gleich, Hebel 4 in zwei von drei) als Token-Overrides in einem
   Worktree; Screens «/» und ein Gesetzes-Leser @1440 hell + dunkel, @390 hell → `abnahme/
   design-identitaet/variante-{a,b,c}-*.png`. **David wählt** (Sichtentscheid, kein Jules).
2. **Umsetzung** der gewählten Variante: Token-Tausch, Kontrast-Protokoll, Reglement-Nachzug
   (`DESIGN-REGLEMENT.md` Token-Abschnitt, `.claude/rules/design.md`), `STRUKTUR.md`-Karte.
3. **Wächter:** `check:farbwelt`/`check:design-tokens` bleiben; kein neues Tor ohne Rot-Probe.

## §4 · Kollisionen

`W2·11-DESIGN` (Design-Wärme, geparkt) baut auf der Brass-Welt auf — wird durch diesen Schritt
inhaltlich abgelöst; bei Umsetzung Fahrplan-Wärme prüfen und Doppelungen in die Chronik.
`W2·19-DESIGN-KONSISTENZ` (gelandet 5.9.2026) hat `--z-*`/`--auf-sage` in `index.css` — additiv
respektieren.

## §5 · Freigabe David 6.9.2026 — Zielbild «Sammlung» (bindend für den Bau)

**Wortlaut David (6.9.2026):** «ja bau das, run till dry. achte darauf, dass alles sinn macht. bevor du
baust recherchiere nochmals was du dafür alles ändern musst damit es konsistent ist und dann lass
zwischen den runden einen ästhetikprüfer darüber schauen. es soll immer noch alles sinn machen mit
split screen usw. also überlege genau wie du es baust bevor du rein schiesst.»

**Referenzbild (massgeblich, statt Prosa):** `abnahme/design-identitaet/vorschlag-freigegeben.html`
(zwei Seiten: Startseite als Inhaltsverzeichnis, Gesetzesleser mit Bezügen am Rand). Bauen heisst:
die App auf dieses Bild bringen, nicht das Bild nachmalen — bestehende Bausteine, Engines, Daten,
Split-View-Mechanik bleiben; es ändert sich Darstellung (§3).

**System (aus dem Referenzbild):**
- Schrift: **Literata** (alles Gelesene: Normtext, Entscheide, Titel, Begrüssung) + **Archivo**
  (Bedienung, Marginalien, Meta) — beide OFL, self-hosted wie Geist heute (`@font-face`, kein
  Google-Fonts-Request zur Laufzeit; Budget `check:perf-budget` messen, Subsets latin/latin-ext).
  Geist/Geist Mono raus; Mono nur, wo es heute fachlich trägt (Rechenweg/Code), sonst Tabellenziffern.
- Farbe: Papier Weiss/Tinte fast Schwarz (hell) bzw. invertiert (dunkel); **vier stumpfe
  Registerfarben** als einzige Farbe: Gesetze `#1F3A5F`, Rechtsprechung `#7A1F2B`, Materialien
  `#4E6B3A`, Werkzeuge `#8A6A1F` (dunkel: aufgehellte Pendants). Brass verschwindet aus der
  Rollen-Schicht (`--accent-*` → Tinte bzw. Registerfarbe nach Domäne); Sage/Warn/Danger
  (Status-Semantik) bleiben. Kontrast AA nachweisen (`check:farbwelt`, axe).
- Form: Radien 0, keine Schatten ausser schwebende Ebenen (Menü, Dialog), kein `lc-glass`,
  Trennung über Linien (1 px `--rule-soft`, 2 px `--rule` für Kopfzeilen). Links unterstrichen.
  Overlines/Versal-Etiketten → normale kleine Grotesk-Zeilen (`.lc-overline` umdefinieren, nicht
  jeden Konsumenten anfassen; Versalien/Tracking weg).
- **Nachträge David 6.9.2026 (bindend, überschreiben Widersprechendes in diesem §):** Startseite
  nach dem Referenzbild «Pult» (`abnahme/design-identitaet/pult-freigegeben.html`: grosse
  Begrüssung, fünf Bereiche in einer Reihe, Zuletzt, schaltbare Module, kein eigenes Suchfeld —
  «nur oben reicht»); **Seitenleiste bleibt überall, auch auf «/»**, die Bereichs-Reiter im
  Titelblatt entfallen; Reiter in der Arbeitsleiste frei per Ziehen ordnen «analog Browser»;
  Registerfarben eine Stufe kräftiger, Rot dezent; Lesekomfort-Tokens nach Recherche (D12:
  warm getöntes Papier, Tinte ~14:1, Literata opsz + Gewicht 450); Übersichts-Köpfe ohne
  Erklärtext (D11). Vollständige Befund- und Entscheidliste: `abnahme/design-identitaet/`
  (Protokolle je Runde).
- Layout: Satzspiegel mit **Marginalienspalte links** (150 px) im Leser (auf «/» durch das Pult abgelöst); im
  Split-View/Pane fällt die Marginalie unter `@3xl/pane` in die Textspalte (Zeilenform), damit
  zwei Panes nebeneinander weiter Sinn ergeben. Titelblatt-Zeile (Marke · Bereichs-Reiter ·
  Ausgabe-Zeile) ersetzt die Glas-Topbar; Seitenleiste bleibt als Inhaltsverzeichnis im Leser und
  in den Bereichsübersichten, auf «/» entfällt sie (Reiter tragen die Bereiche).
- Sprache: keine Slogans, keine Nutzenversprechen («an einem Ort», «verzahnt» als Behauptung);
  Bezeichnungen, Zahlen mit Scope, Verben. Wikipedia «Signs of AI writing» als Negativliste.
- Bezüge im Leser als Randnotizen rechts (Entscheide · Materialien · Verweise · Rechnen) — aus
  der bestehenden Verzahnungs-Datenquelle, keine neue Logik.

**Runden (jede Runde: Bau → Ästhetik-Prüfer (read-only, Screens aus dem Worktree-Preview, hell +
dunkel, 1440 + 390, Split-View mit zwei Panes) → Nachbesserung; Landung EINE PR am Schluss):**
Die konkrete Rundenliste mit Dateien steht in §6 (Inventur-Ergebnis).

## §5a · Reiterleiste wie im Browser (Wunsch David 6.9.2026, gehört zu R2)

David: «analog zum browser die offenen tabs oben anstatt mit dem drei linien drop down» · «überlege
wie es maximal nützlich in der praxis ist». Zielbild (bestehende Mechanik `useTabs`/`usePaneLayout`/
`usePaneDnd`/Verlauf weiterverwenden, nur Sichtbarkeit und Bedienung):
1. Zwei Zeilen, zwei Bedeutungen: Titelblatt-Zeile = Bereiche (Navigation); darunter die
   **Arbeitsleiste** = offene Dokumente. Optisch verschieden (Reiter mit Registerfarben-Strich und
   Schliessen-×, Navigation nur unterstrichener Text).
2. Reiter-Beschriftung = kanonische Kurzform (`Art. 336c OR`, `BGE 152 V 52`, `Frist ZH`,
   Vorlagen-Name), voller Titel als `title`; Registerfarbe der Domäne als Strich.
3. Kein Reiter-Wildwuchs: Klick ersetzt den Inhalt des aktiven Reiters; neu nur per Mittelklick,
   Ctrl/⌘-Klick oder «in neuem Reiter» (bestehendes Verhalten prüfen, nicht verdoppeln).
4. Split-View aus der Leiste: Reiter in die zweite Hälfte ziehen (usePaneDnd) oder «daneben
   öffnen»; die Leiste zeigt, welcher Reiter links/rechts steht (zwei Aktiv-Marken).
5. Angeheftete Reiter (OR, ZGB, ZPO …) als schmale Kürzel-Reiter links; Überlauf ab ~8 Reitern:
   schmaler bis Kürzel, dann «+N»-Knopf mit Liste und Suche — nie stilles Schliessen.
6. Reiter überleben Neustart (localStorage, Lesestellung); «zuletzt geschlossen» aus dem Verlauf.
7. Tastatur: Alt+1…9 springt, Ctrl/⌘+W schliesst Reiter (nur wenn nicht der Browser es fängt —
   sonst Alt+W), Ctrl/⌘+Enter im Suchfeld öffnet in neuem Reiter.
8. Mobil: Leiste waagrecht scrollbar mit aktivem Reiter im Bild; ab 3 Reitern Knopf «N offen» →
   Blatt mit Liste. Die ☰-Schublade bleibt mobil die Bereichs-Navigation.
9. **Arbeitsmappe** (letzter Teil, nach R5, eigener Schritt falls Zeit fehlt): offene Reiter als
   benannte Mappe lokal speichern/öffnen, als Adresse teilbar (deterministisch, ohne Konto).

## §6 · Inventur und Rundenplan (Stand 6.9.2026)

Gemessen im Worktree `w2-24` (`grep -rl`, Datei-Zahlen, keine Vermutungen).

### (a) Konsumenten je Signatur

| Signatur | `src/` | `e2e/`+`src/tests/` | zentral umstellbar? |
|---|---|---|---|
| `*-brass-*`-Utilities | **202** | 2+15 | **ja** — `brass.100…800` (`tailwind.config.js:68`) sind reine `var(--brass-N)`-Blätter |
| `.lc-overline` | **141** | 5+4 | **ja** — eine Regel (`index.css:1060`: Mono, versal, `--tracking-overline`) |
| `rounded-*` (216) | **89** | 0+5 | **teilweise** — `borderRadius` (`tailwind.config.js:171`) mappt sm…2xl auf `--radius-*`; **`rounded-full` (46) NICHT** (TW-Default 9999px) |
| `.lc-glass` | **2** (Topbar, LesemodusOverlay) | 1+2 | **ja** — heute schon nur `background: var(--paper)` (`index.css:1917`) |
| `shadow-*` | **18** | — | nein (Utility-Ebene) |
| `font-display`/`text-display` | **28** | 1+3 | **ja** — `--font-display` (`index.css:443`) |
| `font-mono`/`.num` | **161** | — | **ja** — `--font-mono` (`:445`), `.num` (`:1044`) |
| `lc-card` 62 · `lc-chip` 70 · `lc-notice` 74 · `lc-tile` 27 · `lc-ziffern` 13 | — | — | **ja** — je eine `@layer components`-Regel |

### (b) Ein Ort vs. Konsumenten-Edits

Zentral (R1, ohne einen Konsumenten anzufassen): Papier/Tinte, ganze Brass-Skala, Radien
ausser `rounded-full`, Overline-Gestalt, Schriftfamilien, alle `.lc-*`-Rezepte, Rollen-Schicht
`--accent-*` (`tailwind.config.js:87`). Konsumenten-Edits braucht nur, was **Bedeutung** trägt:
Registerfarbe je Domäne (der Klassenname `brass-700` lügt danach — Umbenennung ist R5-Sweep,
keine Voraussetzung), `rounded-full`-Pillen, `shadow-*` an nicht-schwebenden Flächen,
Layout-Wechsel.

### (c) Split-View / Pane

`Pane.tsx:125` setzt `@container/pane` auf den Scroll-Container (Schwelle heute `@xl/pane`,
36 rem, `:145`); 76 Dateien lesen `/pane`. Eine Marginalienspalte (150 px + 36 px Rinne) bricht
unter ~52 rem Pane-Breite — also in jedem geteilten 1440er-Fenster. **Bauregel:**
`grid-template-columns: 150px minmax(0,1fr)` erst ab `@3xl/pane` (48 rem), darunter einspaltig
mit der Marginalie als vorangestellter Zeile (wie `max-width:820px` im Referenzbild).
`PaneKopf.tsx` bleibt Pane-Kopf; Titelblatt-Zeile = Fensterkrone (`Topbar`).

### (d) Seitenleiste

`Shell.tsx:375` rendert `Sidebar` auf **jeder** Route; nur `vorgabeEingeklappt` unterscheidet
(`:107`, eingeklappt im Gesetz-Leser) — auf «/» ist sie heute also da. «Auf / entfällt sie» =
Pfad-Bedingung in `Shell.tsx` + `useSeitenleiste`. Die mobile Schublade (`Shell.tsx:519–549`,
Portal + `useDialogFokus`) bleibt und trägt auf «/» die Bereichsliste weiter — sonst verlöre
Mobil die Navigation.

### (e) Bezüge-Datenquelle

`gesetz-leser/bezuegeLaden.ts` → `useBezuege(erlassKey)` liefert `bezuegeFuer(artikel)`,
`gesamt`, `klassenImErlass`, `histogramm`; sechs Konsumenten (u. a. `inhalt-zustand.tsx`,
`parts/ArtikelLeser.tsx`, `parts/BezuegeZeile.tsx`), und die Panels
`v3/Panel{Entscheide,Materialien,Aenderungen,Anwendung}.tsx` rendern dieselben Daten schon.
**Die Randnotiz-Spalte ist eine dritte Grid-Spalte über `bezuegeFuer(artikel)` — keine neue
Logik, kein neuer Ladepfad.**

### (f) Wächter, die rot werden (deklariert anzupassen)

**R1:** `scripts/farbwelt-tabellen.ts` (13 brass-Pflichtpaare ab :41 — Werte wechseln, neu
messen + Register-Paare) · `scripts/check-design-tokens.ts:70` `OVERLINE_DIM_RE` (Overline
nicht mehr versal) · `design-gruppenkopf-karten-c.test.ts:120,157` (zitiert
`border-color: var(--brass-400)` aus `index.css`) · `leser-typo-tokens.test.ts` +
`leser-schriftskala.test.ts` (Geist→Literata; auch R4) · `check:lizenzen`, `check:perf-budget`
(entry 30 KB) für die neuen Fonts.
**R2:** `design-r3b-chrome.test.ts:73,132,384,533,542,562` (Overline-Rezept, `rounded-lg`+
`shadow-lg`-Popover, brass-Hover) · `design-r2d-mobil-zustaende.test.ts:133,173,224,242`
(`rounded-full`, `shadow-lg`, zitierte `.lc-glass`-Regel) · `druck-fundstellen.test.ts:54,58`
+ `e2e/druck-fundstellen-z2.e2e.ts` (Druckregel hängt an `header.lc-glass` → **Name behalten**,
nur Rezept leeren) · `e2e/w223b-kopf-seitenleiste.e2e.ts`.
**R2/R3:** `design-r2c-bausteine.test.ts:73,103,153,171` (Literalketten `brass-800/700/500`,
`rounded-full`). **R5:** `design-r5-konsistenz.test.ts`, `design-konsistenz-chips-marken.test.tsx`.

### (g) Schriften

Heute: `src/main.tsx:6,7,11` lädt `@fontsource-variable/{geist,geist-mono,source-serif-4}`
(self-hosted via npm, **kein** `public/fonts/`, kein Google-Request); Fallback-Metriken sind
aus den echten woff2 **gemessen** (`scripts/gen-font-fallbacks.ts`, @capsizecss →
`index.css:12–48`). Neu gleicher Weg: `@fontsource-variable/literata` + `.../archivo`, beide
OFL. **Vor R1 per `npm view` prüfen**, ob die Variable-Pakete und Archivos `wdth`-Achse
existieren — sonst statische 400/500 + Literata-Italic. Fallbacks neu generieren
(Literata→Georgia/Liberation Serif, Archivo→Arial/Arimo), sonst CLS-Rückfall. Die drei alten
Pakete deinstallieren; `--font-mono` bleibt für Rechenweg/Code, `.num` wird
`font-variant-numeric: tabular-nums`.

### (h) Sprach-Diät — sichtbare Slogan-Strings

`src/lib/seo.ts`: `SITE_TITEL` («Schweizer Recht an einem Ort: …»), `SITE_DESCRIPTION`,
`SITE_OG_DESCRIPTION`, `HERO_SUBLINE` («miteinander verzahnt»), `VERTRAUENS_SATZ`,
`STATUS_SATZ`, `SITE_KURZFORM` + 12 `STATISCHE_SEITEN`-Beschreibungen (`:91–111`).
`start/RubrikKacheln.tsx:40,45,51,56` (vier `nutzen`-Sätze), `Hero.tsx:47,50`,
`VertrauensFuss.tsx`. **Grenze:** `<title>`/`description` sind SEO-Träger, an
`check:seo-index` gebunden — dort kürzen, nicht tilgen; die Tilgung gilt dem **sichtbaren** Text.

---

### Rundenplan

Reihenfolge wie vorgeschlagen — nach (b) kippt R1 allein 202+141+89 Dateien optisch, ohne
sie anzufassen. Einzige Abweichung zum Zielbild: `.lc-glass` wird **nicht entfernt/umbenannt**,
nur entkernt (Druck-Tor, (f)).

**Prüf-Fokus, je Runde gleich** (§5): @1440 hell+dunkel, @390 hell, Split-View mit zwei Panes.
Unten steht darum nur, *welche Routen* der Prüfer sieht.

**R1 · Grundschicht (ein Ort)** — Papier/Tinte, Registerfarben, Radien 0, Overline
entversalt, Literata/Archivo geladen.
*Dateien (6):* `src/index.css` · `tailwind.config.js` · `src/main.tsx` ·
`scripts/gen-font-fallbacks.ts` · `scripts/farbwelt-tabellen.ts` · `package.json`.
*TABU:* jede `.tsx` ausser `main.tsx`; Grid-/Layout-Änderungen.
*Wächter:* farbwelt-Tabellen · `OVERLINE_DIM_RE` · `leser-typo-tokens` · `leser-schriftskala` ·
`design-gruppenkopf-karten-c` · `check:lizenzen` · `check:perf-budget`.
*Fertig:* `check:seriell` grün, Golden byte-gleich, Kontrast-Protokoll neu erhoben (Muster
`abnahme/startseite-v3/KONTRAST-PROTOKOLL.md`).
*Routen:* «/» · `/gesetze/bund/OR` · `/rechner` · `/rechtsprechung` — Frage an den Prüfer:
wirkt es ohne Layout-Arbeit schon ruhig?

**R2 · Rahmen** — Titelblatt-Zeile mit Bereichs-Reitern statt Glas-Topbar, Seitenleiste
auf «/» weg, Pane-Kopf und Ausgabe-Zeile.
*Dateien (9, alle `src/components/layout/`):* Shell · Topbar · Sidebar · ReiterUebersicht ·
HeaderSuche · Logo · Footer · Pane · PaneKopf.
*TABU:* `src/pages/**`, `components/start/**`, `lc-glass` umbenennen, Schublade-Fokusfalle.
*Wächter:* `design-r3b-chrome` · `design-r2d-mobil-zustaende` · `druck-fundstellen`(+e2e) ·
`e2e/w223b-kopf-seitenleiste`.
*Fertig:* Tore grün, Schublade + Fokusfalle unverändert bedienbar.
*Routen:* «/» (ohne Seitenleiste) · `/gesetze` · Leser im Split — Frage: bricht der Kopf bei
zwei Panes, geht die Schublade @390 auf/zu?

**R3 · Startseite als Inhaltsverzeichnis + Sprach-Diät** — Marginalienspalte,
Register-Striche, Listen statt Kacheln; sichtbare Slogans weg.
*Dateien (~13):* `pages/Startseite.tsx` · `lib/startseiteModule.tsx` · `components/start/*`
(11) · `lib/seo.ts` (nur sichtbare Konstanten).
*TABU:* `startseiteConfig.ts` (Katalog = SSoT), Zähler-Generat, `check:seo-index`-Werte ohne
`index.html`-Nachzug.
*Wächter:* `design-r2c-bausteine` · `check:seo-index` · `check:zaehler`.
*Fertig:* Zahlen zahlgleich (Zähler-Tor), keine Kachel-Optik mehr.
*Routen:* «/» — auch als Inhalt eines Panes der Split-Ansicht.

**R4 · Gesetzesleser** — Literata-Satzspiegel, Randtitel links, Bezüge rechts.
*Dateien (~12):* `gesetz-leser/v3/{LeserRahmenV3,rahmenSpalten,LeserLesespalte,LeserKopf,
LeserSeitenleiste,leserGeometrie}` · `parts/{ArtikelLeser,BezuegeZeile,ErlassLeserKopf}` ·
`components/normtext/ArtikelBody.tsx` (nur Typo-Klassen) · `leserSchrift.ts` ·
`DESIGN-REGLEMENT-NORMTEXT.md`.
*TABU:* `bezuegeLaden.ts`, `bezugAuswahl.ts`, `gliederungsModell.ts`, jede Extraktions-,
Sprung- und Suchlogik, `normalisiereTarifText()`. **Keine neue Bezüge-Logik** ((e)).
*Wächter:* `leser-schriftskala` · `leser-typo-tokens` · `check:golden-normtext` (byte-gleich).
*Fertig:* CPL ≤ 75 gemessen, Golden byte-gleich, Bezüge-Spalte zeigt dieselben Kanten wie
das Panel.
*Routen:* `/gesetze/bund/OR#art-336_c` — Frage: fällt die Marginalie unter `@3xl/pane` sauber
in die Zeilenform?

**R5 · Rest-Sweep + Nachzug** — Übersichten, Rechner-Köpfe, Entscheid-Leser, Karten/Chips/
Notices; `rounded-full`-Pillen und `shadow-*` an nicht-schwebenden Flächen räumen;
Brass-Restbestände benennen.
*Dateien:* `layout/{InhaltsKopf,RechnerKopf,SeitenKopf,LeserKopfGeruest}.tsx` ·
`components/rechtsprechung/**` · `components/ui/**` · `DESIGN-REGLEMENT.md` (Token-Abschnitt) ·
`.claude/rules/design.md` · `STRUKTUR.md`-Karte · `bibliothek/` + `INDEX.md`.
*TABU:* Rechenlogik, Engines, Daten. *Wächter:* `design-r5-konsistenz` ·
`design-konsistenz-chips-marken` · `check:bibliothek` · `check:steuerdeckel`.
*Fertig:* kein `shadow-*` ausser Menü/Dialog/Popover; `check:seriell` + e2e grün;
Bibliothek-Eintrag steht. **Quellen:** `scratchpad/agy-design-w224.json` (Swiss-Style/
Farbpaletten, URLs, Abruf 5.9.2026) und `scratchpad/agy-nichtki.json` (Anti-KI-Sprache); die
Sonnet-Recherche zu Schrift/Lizenz ist **in Session erhoben, ohne Datei-Artefakt** — genau so
ausweisen, nicht als belegte Quelle führen.
*Routen:* Rundgang über alle sechs Bereiche.
