// Browser-Smoke-Suite (e2e/): prüft im echten Chromium, was die node-Suite
// nicht sehen kann — Renderfehler, Console-Errors, Mobil-Overflow. Läuft
// gegen `vite preview` (gebautes dist/), in der CI nach dem Build-Schritt.
// Specs heissen *.e2e.ts, damit Vitest sie nicht aufsammelt.
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  // Auf langsamen CI-Runnern überschreiten einzelne Web-First-Assertions den
  // Playwright-Default (5000 ms) — z. B. wenn ein content-visibility-Artikelbody
  // nach Wieder-Aufklappen neu rendert. Lokal < 5 s; auf CI sporadisch rot. Das
  // Assertion-Zeitbudget grosszügig auf 10 s heben (greift nur bei Überschreitung,
  // verlangsamt grüne Tests nicht) — Assertions inhaltlich unverändert (§6.3).
  expect: { timeout: 10_000 },
  use: {
    baseURL: 'http://localhost:4317',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --port 4317 --strictPort',
    url: 'http://localhost:4317',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
})
