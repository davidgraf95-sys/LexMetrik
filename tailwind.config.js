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
        sage: { 500: 'var(--sage-500)', 700: 'var(--sage-700)', bg: 'var(--sage-bg)' },
        slate: { 500: 'var(--slate-500)', 700: 'var(--slate-700)', bg: 'var(--slate-bg)' },
        well: 'var(--well)',
        warn: { 500: 'var(--warn-500)', 700: 'var(--warn-700)', bg: 'var(--warn-bg)' },
        danger: { 500: 'var(--danger-500)', 700: 'var(--danger-700)', bg: 'var(--danger-bg)' },
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
      transitionDuration: { fast: '120ms', base: '160ms', slow: '220ms', stage: '420ms' },
      transitionTimingFunction: { DEFAULT: 'var(--ease)' },
      boxShadow: { sm: 'var(--shadow-sm)', md: 'var(--shadow-md)', lg: 'var(--shadow-lg)' },
      maxWidth: { content: '70rem', reading: '40rem' }, // content ≈ 1120px (Iteration 3: einheitlich schmalere Spalte)
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
