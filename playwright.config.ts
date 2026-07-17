// Browser-Smoke-Suite (e2e/): prüft im echten Chromium, was die node-Suite
// nicht sehen kann — Renderfehler, Console-Errors, Mobil-Overflow. Läuft
// gegen `vite preview` (gebautes dist/), in der CI nach dem Build-Schritt.
// Specs heissen *.e2e.ts, damit Vitest sie nicht aufsammelt.
import { defineConfig } from '@playwright/test'

// Port env-konfigurierbar (Default 4317, CI unverändert): erlaubt parallelen
// Worktree-Sessions (§12) je einen eigenen preview-Port ohne Kollision, ohne den
// Standard zu ändern.
const E2E_PORT = process.env.E2E_PORT ?? '4317'

// Bekannt schwere Specs (Forensik 17.7.): erhalten via Projekt-Override ein
// 60-s-Timeout statt der globalen 30 s (Begründung unten bei `projects`).
const SCHWERE_SPECS = ['**/a11y.e2e.ts', '**/leser-linien-kanon.e2e.ts']

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Auf dem 2-Kern-CI-Runner konkurrierten mehrere parallele Worker um EINEN
  // vite-preview-Server samt schwerer Reader-Seite → CPU-Aushungerung, einzelne
  // Klicks blockierten bis zum 30-s-Test-Timeout (lokal selbst bei 8× CPU-Drossel
  // < 1 s, 0 Konsolenfehler — also Contention, kein Code-Defekt). Auf CI darum
  // 1 Worker (sequenziell, stabil); lokal volle Parallelität.
  workers: process.env.CI ? 1 : undefined,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  // Auf langsamen CI-Runnern überschreiten einzelne Web-First-Assertions den
  // Playwright-Default (5000 ms) — z. B. wenn ein content-visibility-Artikelbody
  // nach Wieder-Aufklappen neu rendert. Lokal < 5 s; auf CI sporadisch rot. Das
  // Assertion-Zeitbudget grosszügig auf 10 s heben (greift nur bei Überschreitung,
  // verlangsamt grüne Tests nicht) — Assertions inhaltlich unverändert (§6.3).
  expect: { timeout: 10_000 },
  use: {
    baseURL: `http://localhost:${E2E_PORT}`,
    trace: 'retain-on-failure',
  },
  // ── Test-Timeout-Politik (O-3.3, CPU-Drossel-Forensik 17.7.) ───────────────
  // Der globale Test-Timeout bleibt bei Playwrights Default (30 s). Unter CPU-
  // Last auf dem 2-Kern-Free-Runner rissen aber die axe-schweren a11y-Specs
  // (a11y.e2e.ts:174/192) und der tief geschachtelte ZGB-684-Reader
  // (leser-linien-kanon.e2e.ts:105) reihum genau dieses 30-s-Budget — lokal
  // 6/6 grün in ~12–19 s, also Contention, kein Code-Defekt. Sharding senkt die
  // Contention, hebt sie aber nicht sicher unter 30 s; darum laufen genau diese
  // Dateien im Projekt «schwer» mit 60 s Budget, alle übrigen bleiben bei 30 s.
  // Das ist INFRASTRUKTUR (Zeitbudget), KEIN Assertion-Change (§6.3): kein
  // `expect` und kein Prüf-Schritt wird berührt, der Timeout greift nur bei
  // Überschreitung und verlangsamt grüne Tests nicht. Sharding (`--shard`)
  // verteilt über beide Projekte hinweg, bleibt also unberührt.
  projects: [
    {
      name: 'schwer',
      testMatch: SCHWERE_SPECS,
      timeout: 60_000,
    },
    {
      name: 'chromium',
      testIgnore: SCHWERE_SPECS,
      timeout: 30_000,
    },
  ],
  webServer: {
    command: `npm run preview -- --port ${E2E_PORT} --strictPort`,
    url: `http://localhost:${E2E_PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
})
