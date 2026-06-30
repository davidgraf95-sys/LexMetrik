import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // html2canvas wird von jsPDF nur per dynamischem import() in der nie
      // aufgerufenen .html()-Methode geladen. Auf ein leeres Stub umbiegen, damit
      // der ~200 kB-Chunk nicht gebaut wird (reine Ladepfad-Änderung, CLAUDE.md §6.4).
      html2canvas: fileURLToPath(new URL('./src/lib/pdf/html2canvas-stub.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    // Die erschöpfenden Konstellations-Sweeps (prozesskosten/beurkundung/
    // fristenspiegel/schkgZustaendigkeit) laufen über die volle Kantons×Streitwert
    // ×Materie×Instanz×Verfahren-Matrix (Hunderttausende Iterationen je inkl.
    // PDF-Bericht). Lokal < 5 s, auf langsamen CI-Runnern überschritten sie aber
    // den Vitest-Default (5000 ms) → sporadisch «Test timed out» (kein echter
    // Fehler). Globales Zeitbudget grosszügig auf 30 s heben: das verlangsamt
    // schnelle Tests nicht (Timeout greift nur bei Überschreitung), macht die
    // legitim schweren Sweeps aber stabil — Assertions unverändert (§6.3).
    testTimeout: 30000,
    // Agent-Worktrees unter .claude/ nicht mittesten (sonst doppelte Suite
    // bzw. Fehlschläge aus halbfertigen Ständen fremder Sessions, 6.6.2026).
    exclude: ['**/node_modules/**', '**/dist/**', '**/.claude/**'],
  },
});
