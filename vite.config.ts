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
    // Agent-Worktrees unter .claude/ nicht mittesten (sonst doppelte Suite
    // bzw. Fehlschläge aus halbfertigen Ständen fremder Sessions, 6.6.2026).
    exclude: ['**/node_modules/**', '**/dist/**', '**/.claude/**'],
  },
});
