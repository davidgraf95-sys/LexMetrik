/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: 'var(--ink-900)', 700: 'var(--ink-700)', 600: 'var(--ink-600)',
          500: 'var(--ink-500)', 400: 'var(--ink-400)', 300: 'var(--ink-300)',
        },
        line: { DEFAULT: 'var(--line)', strong: 'var(--line-strong)' },
        paper: 'var(--paper)',
        surface: { DEFAULT: 'var(--surface)', raised: 'var(--surface-raised)' },
        brass: {
          100: 'var(--brass-100)', 200: 'var(--brass-200)', 400: 'var(--brass-400)',
          500: 'var(--brass-500)', 600: 'var(--brass-600)', 700: 'var(--brass-700)',
        },
        sage: { 500: 'var(--sage-500)', 700: 'var(--sage-700)', bg: 'var(--sage-bg)' },
        warn: { 500: 'var(--warn-500)', 700: 'var(--warn-700)', bg: 'var(--warn-bg)' },
        danger: { 500: 'var(--danger-500)', 700: 'var(--danger-700)', bg: 'var(--danger-bg)' },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        overline: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.08em' }],
        'body-s': ['0.875rem', { lineHeight: '1.5' }],
        'body-l': ['1.125rem', { lineHeight: '1.6' }],
        h3: ['1.375rem', { lineHeight: '1.25' }],
        h2: ['1.75rem', { lineHeight: '1.15' }],
        h1: ['2.25rem', { lineHeight: '1.1' }],
        display: ['3rem', { lineHeight: '1.05' }],
        'num-xl': ['2.75rem', { lineHeight: '1.0' }],
      },
      borderRadius: { sm: 'var(--radius-sm)', md: 'var(--radius-md)', lg: 'var(--radius-lg)' },
      boxShadow: { sm: 'var(--shadow-sm)', md: 'var(--shadow-md)', lg: 'var(--shadow-lg)' },
      maxWidth: { content: '72rem', reading: '40rem' },
    },
  },
  plugins: [],
};
