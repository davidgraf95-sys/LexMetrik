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
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
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
