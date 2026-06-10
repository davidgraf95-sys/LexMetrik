import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // .claude: Agent-Worktrees (isolierte Arbeitskopien) nicht mitlinten —
  // sonst kippen Läufe durch halbfertige Stände fremder Sessions (6.6.2026).
  globalIgnores(['dist', '.claude']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  // §2 Determinismus mechanisch gesperrt (FAHRPLAN-GRUNDLAGEN G2/A2): in der
  // Logikschicht src/lib/** sind Date.now(), Math.random() und arg-loses
  // new Date() verboten — gleiche Eingabe muss gleiche Ausgabe geben;
  // Stichtage/Zufall sind als Eingabe zu führen. Ausnahme src/lib/pdf/**:
  // der Erstellungs-Zeitstempel im PDF-Kopf ist Darstellung, nicht
  // Rechtslogik (die Engine-Ergebnisse stehen dort bereits fest).
  {
    files: ['src/lib/**/*.{ts,tsx}'],
    ignores: ['src/lib/pdf/**'],
    rules: {
      'no-restricted-properties': ['error',
        { object: 'Date', property: 'now', message: '§2 Determinismus: kein Date.now() in src/lib — Stichtag als Eingabe führen.' },
        { object: 'Math', property: 'random', message: '§2 Determinismus: kein Math.random() in src/lib.' },
        { object: 'performance', property: 'now', message: '§2 Determinismus: kein performance.now() in src/lib.' },
      ],
      'no-restricted-syntax': ['error',
        { selector: 'NewExpression[callee.name="Date"][arguments.length=0]', message: '§2 Determinismus: arg-loses new Date() in src/lib — Datum als Eingabe führen.' },
        { selector: 'CallExpression[callee.name="Date"]', message: '§2 Determinismus: Date() als Funktionsaufruf liefert die aktuelle Zeit — in src/lib verboten.' },
      ],
    },
  },
])
