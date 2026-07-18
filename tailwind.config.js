import containerQueries from '@tailwindcss/container-queries';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: 'var(--ink-900)', 800: 'var(--ink-800)', 700: 'var(--ink-700)', 600: 'var(--ink-600)',
          500: 'var(--ink-500)', 400: 'var(--ink-400)', 300: 'var(--ink-300)',
        },
        line: { DEFAULT: 'var(--line)', strong: 'var(--line-strong)' },
        // Gesetzes-Reader Linien-Kanon (W2·5d G1): drei benannte Rollen der EINEN
        // Linien-Sprache — vertikaler Gliederungs-Guide, Artikel-Trenner (fein),
        // Struktur-Trenner (oberste Sektionen, eine Spur kräftiger). Nur im
        // Normtext-Reader verwendet; Chrome-Borders bleiben `border-line`.
        guide: 'var(--guide-gliederung)',
        rule: { artikel: 'var(--rule-artikel)', struktur: 'var(--rule-struktur)' },
        // raised/sunken ergänzt 7.6.2026: bg-paper-raised wurde in
        // FristenKalender/wizard bereits verwendet, war aber nie generiert
        // (stiller No-op — die Kreise/Flächen blieben transparent).
        paper: { DEFAULT: 'var(--paper)', raised: 'var(--paper-raised)', sunken: 'var(--paper-sunken)' },
        surface: { DEFAULT: 'var(--surface)', raised: 'var(--surface-raised)' },
        brass: {
          100: 'var(--brass-100)', 200: 'var(--brass-200)', 300: 'var(--brass-300)',
          400: 'var(--brass-400)', 500: 'var(--brass-500)', 600: 'var(--brass-600)',
          700: 'var(--brass-700)', 800: 'var(--brass-800)',
        },
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
      },
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
        overline: ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.12em' }],
        xs: ['0.75rem', { lineHeight: '1.4' }],
        'body-s': ['0.875rem', { lineHeight: '1.5' }],
        'body-l': ['1.125rem', { lineHeight: '1.6' }],
        h3: ['1.25rem', { lineHeight: '1.25' }],
        h2: ['1.6rem', { lineHeight: '1.15' }],
        h1: ['2rem', { lineHeight: '1.15' }],
        display: ['2.25rem', { lineHeight: '1.05' }],
        'display-l': ['2.75rem', { lineHeight: '1.05' }],
      },
      borderRadius: {
        sm: 'var(--radius-sm)', md: 'var(--radius-md)', lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)', '2xl': 'var(--radius-2xl)',
      },
      // D-1.7 Motion-Dedup: Literale auf die --dur-*-Token gemappt (Muster der
      // Nachbar-Keys ease/shadow) — index.css ist die EINE Motion-Quelle.
      transitionDuration: { fast: 'var(--dur-fast)', base: 'var(--dur-base)', slow: 'var(--dur-slow)', stage: 'var(--dur-stage)' },
      transitionTimingFunction: { DEFAULT: 'var(--ease)' },
      boxShadow: { sm: 'var(--shadow-sm)', md: 'var(--shadow-md)', lg: 'var(--shadow-lg)' },
      // `reading` (40rem ≈ 66–71 ch) = die knappe Standard-Lesespalte site-weit
      // (Verdikte, Leden). `normtext` (42rem ≈ 672px ≈ 70–72 ch) = die etwas
      // grosszügigere Lesespalte NUR des Gesetzes-Readers (E6/A37, David 16.7.2026:
      // «gib dem Gesetz mehr Platz … nutze den Platz der zur Verfügung steht»): die
      // Norm gewinnt Breite, bleibt aber mit Reserve unter der Fedlex-tauglichen
      // Lesbarkeits-Decke (≤ 75 ch, DESIGN-REGLEMENT-NORMTEXT §Typo-Skala /
      // leser-lesemass.e2e — empirisch ~70–72 ch, ≥ 3 ch Luft) und verletzt §13/2
      // nicht (Lesespalte, nie volle Fensterbreite). Beide zentriert (mx-auto),
      // damit die Restbreite der 2-Spalten-Zelle ausbalanciert statt rechts als
      // toter Steg liegt — dort trieb es zuvor den «Zitat»-Link weit nach rechts.
      maxWidth: { content: '70rem', reading: '40rem', normtext: '42rem' }, // content ≈ 1120px (Iteration 3: einheitlich schmalere Spalte)
      // Einzug-Skala des Gesetzes-Readers (W2·5d G1 / DESIGN-REGLEMENT-NORMTEXT
      // §Weissraum-Rhythmus): EINE Stufe = 20px. Tiefe wird über Einzug getragen
      // (V2·L-1: gedeckelt bei 5 Stufen statt 3 — tiefe Kodifikationen ZGB/OR
      // blieben zuvor ab Ebene 3 einzuglos gleich, die Verschachtelung war nicht
      // mehr lesbar). MOBIL kollabiert der Einzug NICHT mehr auf 0 (`einzug-mobil`
      // ~0.75rem, `pl-einzug-mobil sm:pl-einzug`) — die Verschachtelung bleibt
      // auch @390 flüsterleise sichtbar; die eine Guide bleibt am Spaltenrand.
      spacing: { einzug: '1.25rem', 'einzug-mobil': '0.75rem' },
      // CLS-Reservierungs-Tokens der Startseite (Startseite V3, §5): benannte
      // Mindesthöhen für die async-/localStorage-Module — Masse, keine Farben
      // (hell = dunkel). `modul-news` benennt den bisherigen Arbitrary-Wert der
      // News-Streifen-Reservierung; `modul-zuletzt` reserviert die Chip-Zeile
      // von «Zuletzt verwendet» (Fallback-Reservierung, FAHRPLAN §3 #5).
      minHeight: { 'modul-news': '12.5rem', 'modul-zuletzt': '4.5rem' },
    },
  },
  // Container-Queries (Split-View B-0b, Entscheid David 29.6.2026): erlaubt
  // @-Utilities (@xl:grid-cols-…), die auf die CONTAINER-Breite reagieren statt
  // auf den Viewport — Voraussetzung dafür, dass ein schmales Pane (B-1) nicht
  // weiter Vollbild-Layouts rendert. Reine Utility-Erweiterung; ungenutzt = kein
  // Effekt (noch keine @-Klasse vergeben → verhaltensneutral).
  plugins: [containerQueries],
};
