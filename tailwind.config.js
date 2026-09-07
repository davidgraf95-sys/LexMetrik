import containerQueries from '@tailwindcss/container-queries';

// ─── Deckkraft-Fähigkeit der Token-Farben (DESIGN-D0, Fund B4 vom 8.8.2026) ──
// Tailwind 3 wendet den `/<alpha>`-Modifier nur an, wenn der Farbwert parsebar
// ist (`#F1E8D6`) oder eine Funktion bzw. `<alpha-value>`-Vorlage. Ein blosses
// `var(--brass-100)` ist beides nicht: `withAlphaValue()` liefert `undefined`,
// die Deklaration entfällt, die GANZE Regel wird verworfen — `bg-brass-100/70`
// & Co. rendern unsichtbar statt halbtransparent (belegt LM-156 / PR #472).
//
// Der Fix wickelt die BLÄTTER des Farbbaums in eine Funktion, ohne die Werte
// selbst anzufassen: eine Quelle bleibt die CSS-Variable in `src/index.css`
// (§5 — keine zweite Wahrheit als RGB-Kanal-Token, und die Dunkel-Umschaltung
// bleibt ein reiner :root-Eingriff). Der opake Fall gibt unverändert
// `var(--token)` zurück, damit alle bestehenden Utilities denselben Wert
// behalten (§6); nur der Modifier-Fall mischt. `color-mix(in oklab, C p%,
// transparent)` ist das Idiom, das `src/index.css` für `--line`/`--rule-*`
// bereits verwendet — also keine neue Browser-Anforderung.
// Bewacht von `check:design-tokens` Prüfung 3: sie kompiliert die real
// genutzten `/<alpha>`-Klassen und verlangt eine Regel mit abweichendem Wert.
/**
 * @param {Record<string, unknown>} baum Farbbaum mit `var(--token)`-Blättern.
 * @returns {Record<string, unknown>} derselbe Baum, Blätter deckkraft-fähig.
 */
function alphaFaehig(baum) {
  const um = (wert) => {
    if (wert && typeof wert === 'object')
      return Object.fromEntries(Object.entries(wert).map(([k, v]) => [k, um(v)]));
    if (typeof wert !== 'string' || !wert.startsWith('var(')) return wert;
    return ({ opacityVariable, opacityValue } = {}) =>
      // Opak: Utility ohne Modifier (Tailwind reicht dort die --tw-*-opacity-
      // Variable durch) bzw. ausdrücklich volle Deckkraft. Sonst anteilig.
      opacityVariable !== undefined || opacityValue === undefined || Number(opacityValue) === 1
        ? wert
        : `color-mix(in oklab, ${wert} calc(${opacityValue} * 100%), transparent)`;
  };
  return um(baum);
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: alphaFaehig({
        ink: {
          900: 'var(--ink-900)', 800: 'var(--ink-800)', 700: 'var(--ink-700)', 600: 'var(--ink-600)',
          500: 'var(--ink-500)', 400: 'var(--ink-400)', 300: 'var(--ink-300)',
        },
        line: { DEFAULT: 'var(--line)', strong: 'var(--line-strong)' },
        // Gesetzes-Reader Linien-Kanon (W2·5d G1): drei benannte Rollen der EINEN
        // Linien-Sprache — vertikaler Gliederungs-Guide, Artikel-Trenner (fein),
        // Struktur-Trenner (oberste Sektionen, eine Spur kräftiger). Nur im
        // Normtext-Reader verwendet; Chrome-Borders bleiben `border-line`.
        // W2·24-R1 ergänzt DEFAULT/soft: die zwei SOLIDEN Trennlinien des neuen
        // Bildes (1 px weich im Satzspiegel, 2 px hart unter der Titelblatt-Zeile)
        // — dieselbe `rule`-Familie, weil es dieselbe Sache ist: Trennung durch
        // Linie statt durch Fläche. Ein zweiter `rule:`-Schlüssel hätte diesen
        // hier still überschrieben (JS-Objektliteral, letzter gewinnt).
        rule: {
          DEFAULT: 'var(--rule)', soft: 'var(--rule-soft)',
          artikel: 'var(--rule-artikel)', struktur: 'var(--rule-struktur)',
        },
        // raised/sunken ergänzt 7.6.2026: bg-paper-raised wurde in
        // FristenKalender/wizard bereits verwendet, war aber nie generiert
        // (stiller No-op — die Kreise/Flächen blieben transparent).
        paper: { DEFAULT: 'var(--paper)', raised: 'var(--paper-raised)', sunken: 'var(--paper-sunken)' },
        // Kantonskarte (2B, 29.8.2026): Erfassungsgrad-Füllungen + Kante — Werte
        // in index.css; hier registriert, damit das Farbwelt-Tor sie als
        // Pflichtpaare prüfen kann (Bug-Check #568, §17).
        karte: {
          voll: 'var(--karte-voll)', auswahl: 'var(--karte-auswahl)',
          duenn: 'var(--karte-duenn)', leer: 'var(--karte-leer)',
          kante: 'var(--karte-kante)', marke: 'var(--karte-marke)',
        },
        surface: { DEFAULT: 'var(--surface)', raised: 'var(--surface-raised)' },
        brass: {
          100: 'var(--brass-100)', 200: 'var(--brass-200)', 300: 'var(--brass-300)',
          400: 'var(--brass-400)', 500: 'var(--brass-500)', 600: 'var(--brass-600)',
          700: 'var(--brass-700)', 800: 'var(--brass-800)',
        },
        // C2 (5.9.2026): Text AUF einer Gold-/Messing-Füllung braucht eine
        // Tinte, die NIE mit dem Thema flippt (D-1.8, `--auf-gold` speist sich
        // aus `--ink-fixed-dark`) — `text-ink-900` kippt im Dunkelmodus auf
        // hell und verfehlt dort die 4.5:1 (Beleg: VerzugszinsTimeline.tsx,
        // dort bislang nur per Inline-Style erreichbar; hier als Utility).
        // C2-Gegenstück: Text auf --ok-solid (flippt bewusst nicht) braucht die
        // STETS helle Tinte (--auf-sage, aus --ink-fixed-light gespeist).
        auf: { gold: 'var(--auf-gold)', sage: 'var(--auf-sage)' },
        // ── REGISTERFARBEN (W2·24-DESIGN-IDENTITAET R1, 6.9.2026) ───────────
        // Die vier Register der Sammlung — Gesetze · Rechtsprechung ·
        // Materialien · Werkzeuge. Werte in src/index.css (:root + html.dark).
        // Hier registriert, damit sie ab R2 als Utility greifbar sind UND das
        // Farbwelt-Tor sie als Pflichtpaare prüfen kann (sonst stiller No-op, F7).
        reg: { g: 'var(--reg-g)', r: 'var(--reg-r)', m: 'var(--reg-m)', w: 'var(--reg-w)' },
        // ── Rollen-Alias-Schicht (D-2, Radix-Muster) ──────────────────────
        // Wertidentische Rollen über den Basis-Skalen (Werte in src/index.css).
        // NEUE Komponenten greifen die Rolle (text-accent-text, bg-accent-bg,
        // border-accent-line …), nie die nackte Stufe (brass-700). Damit ist
        // eine Rekalibrierung (D-4/D-5) ein reiner :root-Eingriff. Die absichtl.
        // Dark-Brass-Inversion (Befund 9) trägt --accent-hover — kein Werte-Tausch.
        accent: {
          bg: 'var(--accent-bg)', 'bg-hover': 'var(--accent-bg-hover)',
          'line-decor': 'var(--accent-line-decor)', line: 'var(--accent-line)',
          solid: 'var(--accent-solid)', text: 'var(--accent-text)',
          'text-strong': 'var(--accent-text-strong)', hover: 'var(--accent-hover)',
        },
        // F1 (§4b-B-i): Zustands-Rolle «ok/geltend/live», wertidentisch zu sage,
        // aber semantisch getrennt von der Materialien-Kennfarbe sage.
        ok: { solid: 'var(--ok-solid)', text: 'var(--ok-text)', bg: 'var(--ok-bg)', line: 'var(--ok-line)' },
        // `line`-Stufen (D-1.3): Nicht-Text-Kanten/Balken greifen den
        // Linien-Alias (dunkel auf -700 gehoben), NIE -500 direkt (1.4.11).
        // `solid`/`text`-Rollen (D-2) analog zu accent — …-500/-700 als Rolle.
        sage: { 500: 'var(--sage-500)', 700: 'var(--sage-700)', bg: 'var(--sage-bg)', line: 'var(--sage-line)', solid: 'var(--sage-solid)', text: 'var(--sage-text)' },
        slate: { 500: 'var(--slate-500)', 700: 'var(--slate-700)', bg: 'var(--slate-bg)', line: 'var(--slate-line)', solid: 'var(--slate-solid)', text: 'var(--slate-text)' },
        well: 'var(--well)',
        warn: { 500: 'var(--warn-500)', 700: 'var(--warn-700)', bg: 'var(--warn-bg)', line: 'var(--warn-line)', solid: 'var(--warn-solid)', text: 'var(--warn-text)' },
        danger: { 500: 'var(--danger-500)', 700: 'var(--danger-700)', bg: 'var(--danger-bg)', line: 'var(--danger-line)', solid: 'var(--danger-solid)', text: 'var(--danger-text)' },
      }),
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      // Typo-Skala (vollständig): micro 11 · xs 12 · body-s 14 · base 16 ·
      // body-l 18 · h3 20 · h2 25.6 · h1 32 · display 36/44.
      // text-sm/text-lg (Tailwind-Defaults) NICHT verwenden — sie tragen
      // fremde Zeilenhöhen; body-s/body-l sind die Pendants mit System-lh.
      fontSize: {
        micro: ['0.6875rem', { lineHeight: '1.2' }],
        // W2·24-R1: die Overline ist entversalt — 12 px, Tracking normal
        // (Rezept .lc-overline in src/index.css; hier der Utility-Zwilling).
        overline: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0em' }],
        xs: ['0.75rem', { lineHeight: '1.4' }],
        'body-s': ['0.875rem', { lineHeight: '1.5' }],
        'body-l': ['1.125rem', { lineHeight: '1.6' }],
        h3: ['1.25rem', { lineHeight: '1.25' }],
        h2: ['1.6rem', { lineHeight: '1.15' }],
        h1: ['2rem', { lineHeight: '1.15' }],
        display: ['2.25rem', { lineHeight: '1.05' }],
        'display-l': ['2.75rem', { lineHeight: '1.05' }],
        // ── LESER-SATZSPIEGEL (W2·5m-LESER-V3 · S2, Pos. 19) ────────────────
        // Entscheid David 17.8.2026 am Bildbogen `docs/ux-audit-2026-07/reader/
        // leser-v3-s2/bogen.html` («v2 gefällt mir besser aber fussnoten
        // hochgestellt») ⇒ Variante **V2 «amtsnah kompakt»** aus FAHRPLAN-
        // LESER-V3 Kap. 8 / Design-Grundlage Kap. 2.4, mit der EINEN Abweichung
        // «Fussnotenmarke hochgestellt statt in runden Klammern» (die Marke ist
        // keine Grösse dieser Skala, sondern das em-relative Token `--fn-marke`
        // in index.css — sie MUSS relativ bleiben, damit sie dem Fliesstext und
        // dem Schriftregler folgt).
        //
        // Nur DREI Stufen treten neu ein, nicht die sieben der Grundlage
        // Kap. 2.2: `leser-titel`/`leser-h`/`leser-chrome`/`leser-mikro` wären
        // wertgleiche Zweitnamen für `h1`/`h2`/`body-s`/`overline` — ein zweiter
        // Name für denselben Wert ist genau die zweite Wahrheit, die §5
        // verbietet. `leser-art` (20 px Artikelnummer) ist bewusst NICHT
        // eingeführt: V2 sagt «Titelstufen unverändert», und die Artikelnummer
        // zu vergrössern hätte David am Bogen nicht gesehen (Ä7 wird über die
        // Randtitel-Seite gelöst, s. `helpers.tsx` margStufeStil).
        //
        //  · `leser-text` 18 px / lh 1.62 (bis R6c 17 px / 1.55) — Normtext-
        //    Fliesstext. Ersetzt das
        //    Paar `text-body-l leading-[1.65]` (18 px / 1.65) am Artikel-Körper:
        //    der rohe `leading-[…]`-Override fällt damit weg, die Zeilenhöhe
        //    gehört zur Stufe (Grundlage Kap. 8 Nr. 4 «kein fixer Leading-Wert
        //    über alle Grössen»). WCAG 1.4.8: lh 1.55 ≥ 1.5, Lesemass 42 rem.
        //  · `leser-rand` 13 px / lh 1.35 — Marginalie/Randtitel, Sans, label-2.
        //  · `leser-fn`   11 px / lh 1.45 — Fussnoten-Apparat am Artikelfuss
        //    (war `text-xs leading-normal` = 12 px / 1.5; Kap. 8 nennt als Ist
        //    `text-micro`, gemessen am Code war es `text-xs`).
        //    ZEILENHÖHE 1.3 → 1.45 (T3, Design-Qualitäts-Pass 29.8.2026,
        //    DEKLARIERTE fachliche Änderung, nicht Refactoring): die S2-V2-Spalte
        //    setzte 1.3 für eine SCHMALE Fussnotenspalte an; gebaut wurde der
        //    Apparat dann über die volle Lesespalte (gemessen @1440 am OR:
        //    640 px Kasten, 108 ch/Zeile). 1.3 auf 11 px über 108 ch heisst
        //    14.3 px Zeilenabstand bei 635 px Zeilenlänge — das Auge verliert
        //    beim Rücksprung die Zeile (Doppelsprung/Zeilenwiederholung). Der
        //    Apparat läuft seit T3 auf `max-w-kleintext` (26 rem ≈ 71 ch), also
        //    genau auf der Spalte, für die 1.3 gedacht war; 1.45 gibt der
        //    Feinschrift trotzdem die Luft, die WCAG 1.4.8 (≥ 1.5 für
        //    Fliesstext) für Blocktext verlangt — knapp darunter, weil der
        //    Apparat Referenz-, kein Lesetext ist. Die GRÖSSE bleibt
        //    unangetastet (0.6875 rem, Entscheid David 17.8.2026 am Bildbogen).
        // W2·24-R4 · ZEILENHÖHE 1.55 → 1.62 (deklarierte Typo-Änderung, kein
        // Refactoring). Das freigegebene Referenzbild (`abnahme/design-
        // identitaet/vorschlag-freigegeben.html`, `.norm { font-size:17px;
        // line-height:1.62 }`) setzt den Normtext im Satzspiegel auf 1.62; die
        // Grösse (17 px) bleibt unangetastet. Die Zahl muss HIER stehen und
        // kann nirgends sonst gesetzt werden: `src/tests/leser-typo-tokens.
        // test.ts` verbietet jedes `leading-…` am Fliesstext-Markup, weil die
        // Zeilenhöhe zur Stufe gehört (Grundlage Kap. 8 Nr. 4) — die Tabelle
        // dort ist mit derselben Änderung nachgezogen.
        // WCAG 1.4.8 unverändert eingehalten: 1.62 ≥ 1.5 (Zusage von
        // `e2e/leser-lesemass.e2e.ts`), das Zeilenmass rechnet nicht mit der
        // Zeilenhöhe und bleibt Zeichen für Zeichen, was es war.
        // W2·24-R6c · GRÖSSE 17 → 18 px (deklarierte Typo-Änderung, kein
        // Refactoring). D20 (c) verlangt «Lesetext 18 px»; R6b konnte die Zahl
        // nicht setzen, weil `src/index.css` dort TABU war und ein Alleingang an
        // der Basis den Schriftregler zerbrochen hätte (die Stufe «mittel» wäre
        // von 108 % auf 102 % kollabiert — Herleitung in `abnahme/design-
        // identitaet/R6-NACHZUG.md` §4). R6c setzt die Basis UND die drei
        // Reglerstufen in EINEM Zug: `index.css` (Block LESER-SCHRIFTSKALA) und
        // `pages/gesetz-leser/leserSchrift.ts` (`SCHRIFT_REM`) tragen dieselben
        // Faktoren 1.08 / 1.18 / 1.30 über der neuen Basis, die Anzeigewerte
        // bleiben 100 · 108 · 118 · 130 %. `src/tests/leser-schriftskala.test.ts`
        // hält die drei Orte gegeneinander.
        'leser-text': ['1.125rem', { lineHeight: '1.62' }],
        'leser-rand': ['0.8125rem', { lineHeight: '1.35' }],
        'leser-fn': ['0.6875rem', { lineHeight: '1.45' }],
      },
      borderRadius: {
        // DEFAULT (= die nackte Klasse `rounded`) liegt seit 31.8.2026 auf
        // demselben Token wie `rounded-sm` statt auf Tailwinds eigenem Default.
        // Beide Werte sind HEUTE 4 px — die Angleichung ist visuell wirkungslos
        // und rein latent. Sie schliesst aber die `rounded`-Fundstellen an die
        // Haus-Radius-Skala an: ohne sie liefe eine künftige Rekalibrierung von
        // --radius-sm an genau diesen Stellen still vorbei und die Kanten der
        // Seite würden zweierlei (§5, Design-Konsistenz E-Mitgedacht a).
        DEFAULT: 'var(--radius-sm)',
        sm: 'var(--radius-sm)', md: 'var(--radius-md)', lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)', '2xl': 'var(--radius-2xl)',
      },
      // D-1.7 Motion-Dedup: Literale auf die --dur-*-Token gemappt (Muster der
      // Nachbar-Keys ease/shadow) — index.css ist die EINE Motion-Quelle.
      transitionDuration: { fast: 'var(--dur-fast)', base: 'var(--dur-base)', slow: 'var(--dur-slow)', stage: 'var(--dur-stage)' },
      transitionTimingFunction: { DEFAULT: 'var(--ease)' },
      boxShadow: { sm: 'var(--shadow-sm)', md: 'var(--shadow-md)', lg: 'var(--shadow-lg)' },
      // Schichtungs-Skala (C3, 5.9.2026) — Rollen statt roher Zahlen, Werte
      // unverändert aus dem Bestand migriert (Herleitung + Reihenfolge in
      // src/index.css bei --z-base). `extend` lässt Tailwinds Default-Skala
      // (z-0/10/20/…) technisch weiter zu — Prüfung 5 in
      // check-design-tokens.ts verbietet ihre NEUE Verwendung im Quellbaum.
      zIndex: {
        base: 'var(--z-base)', sticky: 'var(--z-sticky)',
        'entscheid-sticky': 'var(--z-entscheid-sticky)',
        'reader-scrim': 'var(--z-reader-scrim)', 'reader-kopf': 'var(--z-reader-kopf)',
        'inhalt-kopf': 'var(--z-inhalt-kopf)', leiste: 'var(--z-leiste)',
        dropdown: 'var(--z-dropdown)', overlay: 'var(--z-overlay)', modal: 'var(--z-modal)',
      },
      // `reading` (40rem ≈ 66–71 ch) = die knappe Standard-Lesespalte site-weit
      // (Verdikte, Leden). `normtext` (42rem = 672px) = die etwas grosszügigere
      // Lesespalte NUR des Gesetzes-Readers (E6/A37, David 16.7.2026: «gib dem
      // Gesetz mehr Platz … nutze den Platz der zur Verfügung steht»): die Norm
      // gewinnt Breite und verletzt §13/2 nicht (Lesespalte, nie volle
      // Fensterbreite).
      //
      // ZEICHEN JE ZEILE — NEU GEMESSEN NACH S2 (Nachzug 17.8.2026, Arch-Prüfer 9).
      // Hier stand «≈ 70–72 ch … ≥ 3 ch Luft». Das galt für die alte 18-px-Stufe;
      // mit F3 = V2 (17 px) passt MEHR Text in dieselbe Breite. Gemessen @1440 mit
      // der Methode von `e2e/leser-lesemass.e2e.ts` (längster mehrzeiliger
      // Fliesstext-Absatz, Textlänge / Zeilenkisten):
      //   ZGB 68 · OR 71 · StPO 73 · VMWG 74 · StGB 77 ch
      // Die Hausdecke des DESIGN-REGLEMENT-NORMTEXT §Typo-Skala (≤ 75 ch) hat damit
      // NICHT mehr «≥ 3 ch Luft»: beim VMWG sind es 1 ch, und das StGB liegt mit
      // 77 ch DARÜBER (es steht nicht in der gegateten Erlass-Liste, s. die Notiz an
      // der Schwelle in `leser-lesemass.e2e.ts`). Die WCAG-Decke SC 1.4.8 (≤ 80 ch)
      // ist in allen gemessenen Fällen gehalten und wird an drei Breiten gegated.
      //
      // DER OFFENE PUNKT IST GESCHLOSSEN (Entscheid David 29.8.2026, Variante 1C).
      // Hier stand: «Ob das Lesemass für die 17-px-Stufe schmaler werden soll, ist
      // ein Design-Entscheid und liegt bei David (Vollzugsvermerk S2, offener
      // Punkt)». David hat entschieden: JA, aber nicht an diesem Token. Der
      // Textkörper bekommt einen eigenen, in ZEICHEN rechnenden Deckel
      // (`--leser-zeilenmass` ≈ 68 Zeichen, `src/index.css`), der neben dem
      // Pixel-Deckel `--leser-lesemass-max` steht; der schmalere gewinnt. Grund
      // für den zweiten Deckel statt einer kleineren Zahl HIER: `reading`/
      // `normtext` gelten site-weit bzw. auch für die Kopfzeile und skalieren
      // nicht mit dem Schriftregler — ein Zeichen-Deckel tut beides. Die Zahlen
      // oben bleiben als Messprotokoll der 45-rem-Stufe stehen; das IST-Zeilenmass
      // des Lesers steht in DESIGN-REGLEMENT-NORMTEXT §4b-C (67/66/66/64/63/56 ch).
      // Beide zentriert (mx-auto),
      // damit die Restbreite der 2-Spalten-Zelle ausbalanciert statt rechts als
      // toter Steg liegt — dort trieb es zuvor den «Zitat»-Link weit nach rechts.
      //
      // `kleintext` (24rem = 384px) = die Lesespalte der FEINSCHRIFT — Hinweise,
      // Fussnoten-Apparat, alles auf der micro-/xs-Stufe (0.6875–0.75rem).
      //
      // WARUM EINE ZWEITE ZAHL (T2/T3, Design-Qualitäts-Pass 29.8.2026): die
      // 80-ch-Decke (WCAG 2.2 SC 1.4.8, dieselbe wie beim Lesemass) ist eine
      // ZEICHEN-Decke, keine Pixel-Decke — sie skaliert mit der Schriftgrösse.
      // `reading` (40rem) hält sie auf der 18-px-Lead-Stufe (dort ~66–71 ch),
      // NICHT auf der 11-px-Stufe: dieselben 640 px tragen dort gemessen
      // 108 ch (Fussnoten-Apparat OR @1440) bzw. 163 ch (Hinweis
      // `/gesetze/bund/EMRK`). Eine Feinschrift auf `reading` zu setzen sähe
      // token-rein aus und verfehlte die Zusage; darum die zweite BENANNTE
      // Zahl statt eines Arbitrary-Werts am Fundort (D2).
      //
      // WOHER DIE 24: nicht geschätzt, sondern über die VERTEILUNG gewählt.
      // Gemessen wurden ALLE 743 mehrzeiligen Fussnoten-Absätze des OR @1440
      // (Methode `e2e/leser-lesemass.e2e.ts`, Textlänge / Zeilenkästen):
      //   ungedeckelt (640 px)   Median 68.5 · p90 94.3 · MAX 128.5 ch
      //   26 rem (416 px)        Median 66.0 · p90 72.0 · MAX  84.5 ch
      //   24 rem (384 px)        Median 63.0 · p90 69.5 · MAX  74.7 ch
      // Ein Deckel, der nur den Median hält, ist keiner: erst 24 rem bringt
      // AUCH die dichtesten Absätze (Abkürzungs- und Zahlenketten «AS 1959
      // 858; 1964 965 Ziff. I-II», ~4.8 px/ch statt 5.9) unter die 80. Der
      // EMRK-Hinweis liegt damit auf der xs-Stufe bei ~69 ch.
      maxWidth: { content: '70rem', reading: '40rem', normtext: '42rem', kleintext: '24rem' }, // content ≈ 1120px (Iteration 3: einheitlich schmalere Spalte)
      // ── DIE EINZUG-SKALA IST GESTRICHEN (Entscheid David 29.8.2026) ────────
      // Hier standen `spacing: { einzug: '1.25rem', 'einzug-mobil': '0.75rem' }`
      // — die Tiefen-Staffelung des Gesetzes-Lesers (W2·5d G1 / V2·L-1, 20 px je
      // Stufe, mobil 12 px, gedeckelt bei 5 Stufen). David 29.8.2026 im Wortlaut:
      // «wichtige änderung … im gesetz die staffelung aufzuheben. es soll alles
      // auf der selben höhe stehen. … analog zu fedlex». Der Wortlaut steht
      // seither auf EINER linken Kante; die Tiefe trägt allein die Zwischen-
      // Überschrift (§4b Rang 1 «Typo»).
      // Die Tokens hatten GENAU EINEN Verbraucher (`LeserLesespalte`), und der ist
      // fort — §17 «gestrichen statt bewacht», kein toter Token im Design-System.
      // Herleitung, Messreihe und Wächter: `pages/gesetz-leser/v3/
      // LeserLesespalte.tsx` (`renderSektion`) und DESIGN-REGLEMENT-NORMTEXT §4b.
      // CLS-Reservierungs-Tokens der Startseite (Startseite V3, §5): benannte
      // Mindesthöhen für die async-/localStorage-Module — Masse, keine Farben
      // (hell = dunkel). `modul-news` benennt den bisherigen Arbitrary-Wert der
      // News-Streifen-Reservierung; `modul-zuletzt` reserviert die Chip-Zeile
      // von «Zuletzt verwendet» (Fallback-Reservierung, FAHRPLAN §3 #5).
      // CLS-Reservierung des Leser-Kopf-Titels (§15.2, A9-Forensik 19.7.2026): der
      // lange «Kürzel — Volltitel» (OR) bricht mit der metrik-angepassten Fallback-
      // Schrift ('Geist Fallback', size-adjust 104.76% ⇒ ~5 % breiter) auf CI-Linux
      // ZWEIzeilig, mit dem geladenen Geist-Webfont EINzeilig. Der font-display-Swap
      // liess den <h1> so 74px↔37px springen und schob Meta/Ingress/Grid ~37px (auf
      // dem 2-vCPU-Runner voll gezählt, CLS ~0.10). `titel-2z` reserviert die
      // 2-Zeilen-Höhe (em-relativ ⇒ trägt text-h2 mobil UND text-h1 ab sm gleich;
      // Zeilenhöhe 1.15 ⇒ 2 Zeilen = 2.30em, +Puffer 2.35em): der Titelkasten bleibt
      // in BEIDEN Font-Zuständen gleich hoch → kein Swap-Shift. Reserviert nur Platz,
      // versteckt/kürzt nichts (§15/2); kürzere Titel gewinnen etwas Weissraum.
      // CLS-Reservierung der Fassungs-Zeile am Artikel-Fuss (§15.2, G-HIST-UI-
      // Forensik 20.7.2026): der Historie-Shard wird per requestIdleCallback
      // NACH dem ersten Artikel-Render geholt (§15/3) — die «Gilt seit»-Badge
      // wuchs damit in bereits sichtbare Artikel ein und schob alles darunter.
      // Gemessen auf /gesetze/bund/MWSTV#art-165 unter 6× CPU-Drossel: CLS 0.0227
      // gegen 0.0002 ohne die Zeile (94 Zeilen, jede exakt 24 px hoch — die Badge
      // ist immer EINE Chip-Zeile, die Timeline klappt nur auf ECHTEN Klick auf
      // ⇒ input-behaftet, CLS-exkludiert). `beiwerk` reserviert diese eine
      // Zeile am Slot, der ab dem ERSTEN Render steht: der Shard-Resolve füllt
      // reservierten Platz, statt Platz zu schaffen → kein Shift. Reserviert nur
      // Platz, versteckt/kürzt nichts (§15/2).
      // S2-UMBENENNUNG (W2·5m-LESER-V3, Pos. 13): der Token hiess `hist-zeile`
      // und ist jetzt `beiwerk` — er reserviert den BODEN DER BEIWERK-ZONE
      // (`[data-beiwerk]`, ArtikelLeser), nicht «eine Historie-Zeile». Der WERT
      // bleibt 1.5 rem, und das ist gemessen statt gerundet: die Chip-Zeile ist
      // exakt 24 px hoch (Sonde 17.8.2026 @1440, alle 480 Slots der StPO und
      // 1598 des OR identisch 24.00 px). Die Design-Grundlage Kap. 3 nennt für
      // die Zone 2.5 rem; das ist ABWEICHEND NICHT übernommen (§7): 40 px Boden
      // unter einer 24 px hohen Zeile hiesse 16 px Leerraum an jedem
      // reservierenden Artikel — also genau die Phantom-Lücke (Ä26), gegen die
      // dieselbe Etappe antritt. Ein Boden kann ohnehin nur Elemente auffangen,
      // die kleiner sind als er; der Fussnoten-Apparat misst gemessen 27–187 px
      // und wird von keinem Token-Wert höhenfest.
      // S2 · Ä26: die Reservierung wird nur noch dort gesetzt, wo überhaupt eine
      // Fassungs-Zeile eintreffen kann — und die Frage wird ARTIKELWEISE am
      // Datenmodell gestellt, nicht am Erlass: `fussAnzeige.length > 0 ||
      // historie` (ArtikelLeser.tsx). Der Generator baut Historie-Einträge nur
      // aus Artikel-Fussnoten, also kann ein fussnotenfreier Artikel nie einen
      // Eintrag bekommen (Invariante, 0 Gegenbeispiele in 24 511 Artikeln).
      // AUSDRÜCKLICH KEINE Ebenen-Weiche: `erlass.ebene === 'bund'` wäre ein
      // Erlass-Sonderpfad und liesse die Reserve unter jedem Bund-Artikel ohne
      // Fussnote stehen; der Rot-Beweis dazu steht im Vollzugsvermerk S2.
      // NACHZUG-KORREKTUR 17.8.2026 (Bug-Check B2 / Arch 1 / Ä65): hier stand
      // «`erlass.ebene === 'bund'` — 209 Shards im Korpus, alle Bund» und
      // beschrieb damit eine Weiche, die so nie gebaut wurde — Doku-Drift gegen
      // §5. Herleitung, Korpus-Messung (25 403 → 17 547 reservierende Artikel,
      // −31 %) und die verworfenen engeren Regeln stehen am Slot selbst
      // (ArtikelLeser.tsx), die Wirkung auf die Höhen-Schätzung in
      // `src/pages/gesetz-leser/berechnungen.ts`.
      // `inhalt-region` (Footer-CLS /gesetze, David 25.7.2026, §15.2): EIN
      // Rahmen um die drei exklusiven Inhalts-Zustände der Übersicht
      // (Landeplatz / Trefferregion / Ebenen-Panel) reserviert von Anfang an
      // gut eine Viewport-Höhe (100svh minus Kopf-Chrom ≈ 8rem) — der
      // Ergebnis-Swap beim Tippen/Löschen zieht den Footer damit nie in den
      // Viewport (Nullprobe 25.7.: FOOTER-Shift ~0.0496 unter Drossel 6×;
      // Beweis e2e/gesetze-footer-cls.e2e.ts). svh = kleinste Viewport-Höhe
      // (mobil stabil). Reserviert nur Platz, versteckt/kürzt nichts (§15.2).
      // `kopf-stand*` (W2·5m-LESER-V3 · S3, §15.2): die Zelle im Erlass-Kopf, die
      // Stand-Zeile UND Status-/Warnzeile trägt. Beide Aussagen treffen erst NACH
      // dem ersten Paint ein (Currency- bzw. Revisions-Sidecar) und sind
      // unterschiedlich lang — ohne Reservierung schiebt der Nachzügler den
      // Lesekörper nach unten. Genau dieser Shift wurde am 9.8.2026 gemessen
      // (CLS 0.0227, e2e/leser-kontext-e4), als die Warnung noch ein eigener
      // Block war. Die frühere Abwehr «beide Fassungen sind gleich lang» trägt
      // nicht mehr: F5 verlangt einen Klartextsatz mit Datum, rund dreimal so
      // lang wie der Grundhinweis. An ihre Stelle tritt eine feste Höhe.
      // WERTE GEMESSEN, nicht geschätzt (Playwright, e2e/leser-kopf-s3-belege;
      // Endzustand des ungünstigsten Erlasses je Fenster, Zeilenhöhe 16.5 px +
      // 4 px space-y-1), aufgerundet auf die nächste halbe Pixelstufe in rem:
      //   < 640   STPO 86.5 px (2 Zeilen Stand + 3 Zeilen Warnung) → 5.4375rem
      //   ≥ 640   STPO 70   px (2 + 2)                             → 4.375rem
      //   ≥ 768   OR   53.5 px (2 + 1 — OR hat die längste Stand-Zeile:
      //                         Inkrafttreten 1912 + Ausweis + Vorbehalt) → 3.375rem
      // OBERHALB 768 KEIN weiterer Schritt — Nachzug 16.8.2026, Prüferbefund:
      // ein `xl`-Schritt auf 2.3125rem (37 px) passte NUR zur Ist-Hülle, die ab
      // 1280 die volle Fensterbreite hat. Die V3-Hülle stellt den Kopf in eine
      // Spalte NEBEN der Seitenleiste; sie misst @1280 nur 656 px und deckelt
      // auch @1440/@1600 bei 752 px, wo OR weiterhin 53.5 px braucht. Der
      // xl-Schritt hätte dort bei jedem Nachschub 16.5 px Sprung erzeugt —
      // also genau den Shift, gegen den die Reservierung gebaut ist. 17 px
      // Reserve in der breiten Ist-Hülle sind der richtige Preis dafür, zumal
      // V3 mit H4 die Hauptroute wird. Gemessen in BEIDEN Hüllen (v1: 1280/1440
      // = 37 px bei 976/1072 px Spaltenbreite; v3: 53.5 px bei 656/752 px).
      // Reserviert nur Platz, versteckt/kürzt nichts (§15/2, §8: der volle
      // Wortlaut steht immer). In der Tailwind-Skala und NICHT als
      // `min-height`-Regel in index.css — das ist die Hausform für
      // Höhen-Reservierungen (`titel-2z`, `beiwerk`, `inhalt-region`), und
      // `src/tests/tap-ziel-token.test.ts` hält index.css frei von rohen
      // min-height-Zahlen (F9: dort gehört nur var(--tap-ziel) hin).
      minHeight: { 'modul-news': '12.5rem', 'modul-zuletzt': '4.5rem', 'titel-2z': '2.35em', beiwerk: '1.5rem', 'inhalt-region': 'calc(100svh - 8rem)', 'kopf-stand': '5.4375rem', 'kopf-stand-sm': '4.375rem', 'kopf-stand-md': '3.375rem' },
      // E4-Korrektur (David 25.7.2026): der frühere `toc-kontext`-33vh-Slot-
      // Token ist ERSATZLOS entfernt — er klemmte das Gliederungs-Sichtfenster
      // ein («aktuell schneidet es gliederung ab»). Das Kontext-Panel steht
      // jetzt im Fluss INNERHALB des [data-toc]-Scrollers (inhalt-volltext.tsx);
      // CLS bleibt 0, weil unter dem Panel im Scroller nichts steht (Einwachsen
      // vergrössert nur die Scrollhöhe — Beweis e2e/leser-kontext-e4.e2e.ts).
    },
  },
  // Container-Queries (Split-View B-0b, Entscheid David 29.6.2026): erlaubt
  // @-Utilities (@xl:grid-cols-…), die auf die CONTAINER-Breite reagieren statt
  // auf den Viewport — Voraussetzung dafür, dass ein schmales Pane (B-1) nicht
  // weiter Vollbild-Layouts rendert. Reine Utility-Erweiterung; ungenutzt = kein
  // Effekt (noch keine @-Klasse vergeben → verhaltensneutral).
  plugins: [containerQueries],
};
