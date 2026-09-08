# FAHRPLAN — Startseite V4 «Werkbank»: Einstieg mit Gesetzes-Schwerpunkt (Auftrag David 5.9.2026)
<!-- @lagebild name: Startseite V4 · zweck: Die Startseite zeigt auf einen Blick, was LexMetrik kann — verzahnte Gesetze und staatliche Informationen zuerst, Werkzeuge griffbereit, persönlich begrüsst. -->

> **ROADMAP-Schritt:** `W2·23-STARTSEITE-V4` (`feld: design`).
> **Auftrag David 5.9.2026 (wörtlich):** «deine aufgabe ist es die home seite nochmals komplett zu
> überarbeiten» · «ich öffne alles. du hast absolute frei bahn. es hatte früher mal verschiedene
> begrüssungen. das hat mir noch gefallen und es etwas persönlicher gemacht. du darfst auch kopf-
> und seitenliste überarbeiten. ansonsten bist du komplett frei. behalte einfach das endziel im
> auge; taschenmesser für juristen aber schwerpunkt verzahnte gesetze und alle staatlichen infos
> an einem ort.» · «run till dry».
>
> **Damit sind die Council-Schalter der V3-Spec (`archiv/FAHRPLAN-STARTSEITE-V3.md` §0) durch
> David ausdrücklich GEÖFFNET** (Chat 5.9.2026) — sie gelten nicht mehr als bindend. Was aus V3
> weiterlebt, steht hier ausdrücklich; was nicht hier steht, ist frei.

## §1 · Ziel und Grenzen (`W2·23-STARTSEITE-V4`)

**Ziel:** Die Startseite «/» erklärt auf dem ersten Bildschirm, was LexMetrik ist — **Schweizer
Recht an einem Ort: Gesetze von Bund und Kantonen, Bundesgerichtsentscheide und amtliche
Materialien, miteinander verzahnt** — und macht die drei häufigsten Handgriffe einer Kanzlei
(Norm öffnen · Entscheid finden · Frist rechnen) mit einem Zug erreichbar. Sie begrüsst
persönlich (Tageszeit, Schweizerdeutsch/Hochdeutsch gemischt) und belohnt Wiederkehrer
(«Zuletzt verwendet» oben). Kopf- und Seitenleiste werden auf dieselbe Ordnung gebracht.

**Grenzen (bindend):**
- §1/§3: reine Darstellungsschicht — keine Rechtslogik, keine Datenänderung. Rechner auf der
  Startseite hosten die **echten** Formulare/Engines (§5), nie eigene Rechenwege.
- §8: kein Absolutum, kein «geprüft»-Siegel, «KI-frei» nie als Badge — Vertrauen nur als
  gescopter Satz; Zähler nur mit Scope; Datumsangaben zum Korpus-Stand ehrlich (Stand-Felder
  aus `startseiteZaehler.generated.ts`).
- Nur amtliche Quellen; keine Marketing-Elemente (Testimonials, Fotos, CTA-Buttons in
  Werbe-Tonalität).
- Tokens statt Rohwerte (`.claude/rules/design.md`); keine neuen Farb-Tokens; Typo-Skala
  bleibt (`tailwind.config.js`). `src/index.css` nur **additiv in eigenen Zeilen** (Parallel-
  Session W2·19 fügt dort Z-Index-Tokens ein — Absprache 5.9.2026).
- Prerender: Module der Registry rendern synchron (kein Suspense, keine Lazy-Loader in
  `START_MODULE`); client-divergente Zeilen (Begrüssung, Datum, Zuletzt) hinter fixer Höhe mit
  begründetem `suppressHydrationWarning`. Kein Register-Import in den Startseiten-Chunk
  (`check:perf-budget`).
- Kein horizontaler Überlauf @390 px; CLS-Reservierung für async-Module bleibt.
- E2E-/Unit-Tests, die an die ALTE Anordnung koppeln (z. B. `schnellrechner-kalender.e2e.ts`
  an «Fristenlauf»/Kalender-DOM auf «/»), werden **im selben PR deklariert angepasst oder auf
  die Zielseite verschoben** — das ist eine fachlich gewollte Änderung, kein Refactoring (§6.3
  greift nicht; im Commit-Text benennen).

## §2 · Seitenaufbau «/» (Zielbild)

Container `max-w-content`, Sektionsabstand `space-y-10` → bewusst enger und dichter als V3
(`space-y-8`), damit mehr auf den ersten Bildschirm passt.

```
┌ Topbar (auf «/» OHNE Suchfeld — der Hero trägt die eine Suche) ─────────────┐
│ Sidebar (unverändert Ordnung: Gesetze · Rechtsprechung · Materialien · …)   │
├──────────────────────────── main ───────────────────────────────────────────┤
│ ╔══ HERO (bg-brass-100 rounded-2xl) ═══════════════════════════════════════╗ │
│ ║ «Guete Morge zäme.»  Samstag, 5. September 2026        (Begrüssungszeile)║ │
│ ║ H1  Schweizer Recht an einem Ort                        (text-display)   ║ │
│ ║ Subline: Gesetze von Bund und Kantonen, Bundesgerichts-Entscheide und    ║ │
│ ║   amtliche Materialien — miteinander verzahnt. Dazu Rechner und Vorlagen.║ │
│ ║ ┌ 🔍 UniversalSuche (gross, --control-h) ───────────────────────────────┐ ║ │
│ ║ └───────────────────────────────────────────────────────────────────────┘ ║ │
│ ║ Beispiele: [Art. 336c OR] [BGE 152 V 52] [Kündigungsfrist] [Prozesskosten]║ │
│ ╚══════════════════════════════════════════════════════════════════════════╝ │
│ ── ZULETZT VERWENDET (nur mit Einträgen; 1 Zeile Chips) ────────────────────  │
│ ── GESETZE · BUND UND KANTONE (Schwerpunkt-Block, eigene Sektion) ──────────  │
│ │ Bund: [OR][ZGB][BV][StGB][ZPO][StPO][SchKG][DBG][VwVG][BGG] · Alle 227 →  │
│ │ Kantone: 26 Chips (Kürzel), Zahl je Kanton sichtbar im Kanon der Sidebar  │
│ │   (IA-7-Badge-Optik), «Basel-Stadt 859 · Appenzell A.Rh. 266 · …»         │
│ │ International: Staatsverträge → /gesetze?ebene=international               │
│ │ Verzahnungs-Satz (§8-konform, konkret): «Jeder Artikel zeigt die Entscheide│
│ │   und Materialien, die ihn anwenden — und umgekehrt.»                      │
│ ── WERKZEUGE (kompakt, eine Reihe) ──────────────────────────────────────────  │
│ │ Frist in einer Zeile: [Datum] [Tage] [Kanton ▾] → Fristende  · Voll-Rechner│
│ │ daneben zwei Link-Karten: Prozesskosten · Zuständigkeit (zum Voll-Rechner) │
│ ── RECHTSPRECHUNG · MATERIALIEN · RECHNER · VORLAGEN (4 Kacheln, Zähler) ───  │
│ ── JÜNGSTE ENTSCHEIDE IM KORPUS (4–6 Karten) + Korpus-Stand-Zeile ──────────  │
│ │ «Gesetze Stand 5.9.2026 · Rechtsprechung Stand 17.6.2026 · Materialien …»  │
│ ── Vertrauens-Fuss (Methodik-Satz · Status-Satz · Rechtlicher Hinweis) ─────  │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Mobil ~390 px:** eine Spalte. Hero mit H1 `text-h1`, Suche volle Breite, Beispiel-Chips
2 Zeilen (Rest weg, kein Scroll-Streifen). Gesetze-Block: Bund-Chips umbrechend, Kantone als
umbrechende Chip-Wolke (26 × Kürzel passen in 3–4 Zeilen). Werkzeuge stapeln. Kacheln
1-spaltig als Zeilenform. Entscheide als Scroll-Streifen mit `lc-scrollrand-x`.

**Above the fold Desktop @1440×900:** Hero komplett + Kopf des Gesetze-Blocks sichtbar.

## §3 · Module (Verdikt je heutigem Modul, Registry `startseiteModule.tsx`)

| # | Modul | Verdikt | Auflagen |
|---|---|---|---|
| 1 | **Hero** | **UMBAUEN** | Begrüssungszeile (§4) ersetzt die Datums-Overline; H1 + Subline aus `seo.ts` (§5); UniversalSuche bleibt IM Hero (`role="search"` + `input[type=search]` erhalten — a11y-E2E); darunter 4–5 **Beispiel-Chips** (feste Links, deterministisch, kein Zufall): eine Norm, ein BGE, eine Rechner-Aufgabe, eine Vorlage. Brass-Wash bleibt die EINE warme Fläche. Keine Deko-SVG, kein Stagger-Reveal (LCP). |
| 2 | **UniversalSuche** | **BEHALTEN** | Placeholder konkreter: «Art. 336c OR · BGE 152 V 52 · Kündigungsfrist …»; Scope-Zeile bleibt. |
| 3 | **Schnellrechner** | **SCHRUMPFEN → «Werkzeuge»** | Der Tab-Kasten mit Kalender, 26 Kantons-Knöpfen und Ferien-Auswahl geht von «/» weg (Vollrechner `/rechner/tagerechner` trägt ihn bereits). Auf «/» bleibt ein **Ein-Zeilen-Fristenrechner**: Datum · Tage · Kanton (Select, Default aus `getStandardKanton()` — sichtbar als Wert) → Fristende, live, mit «Stillstand berücksichtigt»-Zeile falls einschlägig, Link zum Vollrechner. Er nutzt die **bestehende** `EinfacheFristForm`/Engine — bevorzugt über eine neue Darstellungs-Variante (`variante="zeile"`) der Form selbst, nicht über eine Kopie ihrer Logik (§5). Daneben zwei Link-Karten Prozesskosten · Zuständigkeit (kein eingebettetes Formular mehr). Der von W2·19 übergebene Befund «zweite, anders gestaltete Tab-Leiste bei Gebühren» (`Schnellrechner.tsx:56 vs :93`) erledigt sich damit durch Rückbau. `FristenKalender.tsx` wird, wenn kein Konsument bleibt, gelöscht oder auf `/rechner/tagerechner` weiterverwendet — nicht verwaist liegen lassen. |
| 4 | **Rubrik-Kacheln** | **UMBAUEN → 4 Kacheln** | Gesetze bekommt den eigenen Block (#8); die Landkarte zeigt Rechtsprechung · Materialien · Rechner · Vorlagen in Sidebar-Ordnung (weiter über `NAVIGATION` iteriert, Gesetze herausgefiltert), `ui/RubrikKachel` unverändert. Zähler/Wortlaut wie heute. |
| 5 | **Zuletzt verwendet** | **BEHALTEN, nach oben** | Position direkt unter dem Hero (Wiederkehrer-Effizienz). Unverändert: synchron aus localStorage, Erstbesuch = nichts. |
| 6 | **NewsHeader** | **UMBAUEN → «Jüngste Entscheide im Korpus»** | Ehrlicher Titel (kein «Neues», der Korpus endet ggf. Monate zurück); 4–6 Karten (MAX = 6), Datum-Gruppierung und `lc-scrollrand-x` bleiben; darunter EINE **Korpus-Stand-Zeile** über den geteilten Baustein `ui/KorpusStand.tsx` (liegt im Fahrplan-Commit bereit). ACHTUNG §8: die `stand*`-Felder sind das Datum der **Register-Erzeugung** (alle drei heute 2026-09-05), nicht das Datum des jüngsten Inhalts — Wortlaut darum «Register erzeugt am …», nie «Stand der Rechtsprechung». Das Datum des jüngsten Entscheids zeigen die Karten selbst (Datums-Gruppen). |
| 7 | **Vertrauens-Fuss** | **BEHALTEN, kompakter** | Beide Sätze + `lc-notice` bleiben; wo möglich in einer ruhigen Zeile/zwei Spalten. |
| 8 | **Gesetze-Block** | **NEU** (Schwerpunkt) | Eigene Sektion «Gesetze — Bund und Kantone» direkt nach Zuletzt: (a) Bund-Direktzugriff-Chips (heutige `GesetzeChips` + VwVG, BGG; Keys müssen im Register existieren — per `erlassPfadVonKey` wie heute), Link «Alle 227 Bundeserlasse →» mit Zähler aus `gesetzeBundVolltext`; (b) **Kantone**: 26 Chips mit Kürzel + Zahl aus `kantonErlassZahlen` in der IA-7-Optik der Sidebar (Zahl sichtbar, Zustands-Wort im Accessible Name, §8: «erfasst», nie «vollständig»), Ziel `/gesetze?ebene=kanton&kanton=XX` (Ziel-URL aus `navigation.ts`/Bestand ableiten, nie erfinden); (c) International → bestehendes Ziel; (d) ein Verzahnungs-Satz (Wortlaut §5). Zähler aus `startseiteZaehler.generated.ts` — kein Register-Import. |

## §4 · Begrüssung (Wunsch David: «verschiedene Begrüssungen … persönlicher»)

- Quelle: der frühere Pool aus `git show f2643c53e^:src/components/start/Begruessung.tsx`
  (Tageszeit-Pools 5–10 · 10–14 · 14–18 · 18–22 · 22–5 plus «immer»-Pool, Hochdeutsch und
  Schweizerdeutsch gemischt, dezent kanzlei-gefärbt). **Kuratieren, nicht 1:1 übernehmen:**
  Sprichwort-Fragmente («Der frühe Vogel …», «Schaffe, schaffe …») und alles, was nach
  Werbung oder Kalauer klingt, raus; Ziel ~15–25 Grüsse je Tageszeit, jeder ein ganzer Satz
  oder ein Gruss mit Punkt.
- Wahl: **zufällig je Seitenaufruf** aus dem Tageszeit-Pool + «immer»-Pool (Davids Wunsch
  «verschiedene»); §2-Determinismus betrifft Engines, nicht diese Darstellungszeile — im
  Code-Kommentar so begründen. Prerender: Build-Zeit-Wert, Client ersetzt hinter fixer
  Zeilenhöhe (`suppressHydrationWarning` mit Begründung, wie die heutige Datums-Overline).
- Form: eine Zeile über der H1 in `text-body-l font-display text-ink-800` (Gruss) und daneben
  das Datum `text-body-s text-ink-600`; auf Mobil zwei Zeilen. Keine tickende Uhr.
- Neue Datei `src/components/start/Begruessung.tsx` + Pool `src/lib/begruessungen.ts`;
  Unit-Test: jeder Pool nicht leer, keine Doppelungen, Tageszeit-Zuordnung deckt 0–23 ab.

## §5 · Wortlaut (SSoT `src/lib/seo.ts`; Tor `check:seo-index` spiegelt in `index.html`)

- `HERO_TITEL` → **«Schweizer Recht an einem Ort»**.
- `HERO_SUBLINE` → «Gesetze von Bund und Kantonen, Bundesgerichtsentscheide und amtliche
  Materialien — miteinander verzahnt, mit Stand und Link zur amtlichen Quelle. Dazu Rechner
  und Vorlagen für Fristen, Kosten und Eingaben.»
- `SITE_TITEL` → «LexMetrik — Schweizer Recht an einem Ort: Gesetze, Urteile, Rechner».
  `SITE_DESCRIPTION` sinngemäss nachziehen; `index.html` spiegeln; `check:seo-index` grün.
- Verzahnungs-Satz (Gesetze-Block): «Jeder Artikel zeigt die Entscheide und Materialien, die
  ihn anwenden — und jeder Entscheid die Normen, auf denen er beruht.» (§8: nur behaupten, was
  der Leser wirklich tut — vor dem Einbau am Leser prüfen und ggf. abschwächen.)
- Sektionstitel: «Gesetze — Bund und Kantone» · «Werkzeuge» · «Weitere Bereiche» ·
  «Jüngste Entscheide im Korpus». Kein «Neues», kein «geprüft».
- Vertrauens- und Status-Satz unverändert (bereits gescopt).

## §6 · Kopf- und Seitenleiste (Arbeitspaket B)

1. **Topbar auf «/» ohne Suchfeld** — der Hero trägt die eine Suche; auf allen anderen Routen
   unverändert. Tastatur: `/` und ⌘K fokussieren auf «/» die Hero-Suche (Handler-Ziel
   umleiten, kein zweiter Handler). Layout darf nicht springen (Platzhalter `flex-1`).
2. **Schriftregler «Ganze Seite A− 100 % A+» aus der Topbar nach `/einstellungen`** —
   dieselbe `SchriftgroessenRegler`-Komponente, derselbe Hook `useSchriftskala`; der
   Topbar-Streifen wird ruhiger (bleibt: Menü/Seitenleiste · Suche · Verlauf · Reiter · Thema
   · Sprache). Tests/E2E, die den Regler in der Topbar suchen, deklariert nachziehen.
3. **Seitenleiste**: Ordnung und Einträge bleiben. Neu ein **Fuss «Stand des Korpus»** in
   `text-micro` (Gesetze · Rechtsprechung · Materialien mit Datum aus
   `startseiteZaehler.generated.ts`) — dieselbe Wahrheit wie die Korpus-Stand-Zeile auf «/»
   (§5: EIN Baustein `ui/KorpusStand.tsx`, zwei Konsumenten). Auf Mobil in der Schublade
   ebenfalls.
4. Nichts anderes in `Shell.tsx` anfassen (Pane-/Split-View-Mechanik bleibt).

## §7 · Verifikation (Nachweis, nicht Behauptung)

- Tore: `npm run gate` (voll) grün; `check:seo-index`, `check:zaehler`, `check:design-tokens`,
  `check:perf-budget`, `check:plan` einzeln benannt im Bericht.
- `npm run build` + Playwright-Screens **aus dem Worktree** (`vite preview` im Worktree-cwd,
  nie der Haupt-Checkout): «/» @1440×900 hell + dunkel, @390×844 hell; `/einstellungen`
  @1440. Dateien im Scratchpad mit Paket-Kennung (`w223-*.png`).
- Kein horizontaler Überlauf @390 (`document.documentElement.scrollWidth <= 390`).
- axe (a11y.e2e) grün; genau ein `<h1>`; H2 je Sektion; Fokusreihenfolge Hero-Suche zuerst.
- CLS-Sichtprobe: Zuletzt/Entscheide reservieren wie heute.

## §8 · Kollisionen & Koordination (§12)

- Parallel-Session W2·19 (Branch `feat/w2-19-runde6-2026-09-05`): keine Startseiten-Dateien
  offen; `src/index.css` nur additiv in eigenen Zeilen (Absprache 5.9.2026). Landung dort in
  ~2 h; danach rebase.
- Jules-Tickets #722–#724 (Checkbox-Baustein) berühren `src/components/forms/**` —
  `EinfacheFristForm.tsx` gehört dazu: Änderungen dort minimal halten (neue Variante additiv),
  Konflikt beim Rebase erwartbar, dann Jules-Stand gewinnt und die Variante wird nachgezogen.
- Arbeitspaket A (Startseite) und B (Kopf-/Seitenleiste) laufen in getrennten Worktrees;
  gemeinsamer Baustein `ui/KorpusStand.tsx` wird von **A** gebaut, B konsumiert ihn nach
  Landung von A (oder legt ihn identisch an und A/B lösen beim Rebase auf einen).
