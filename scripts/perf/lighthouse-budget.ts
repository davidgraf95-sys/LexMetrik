// scripts/perf/lighthouse-budget.ts — Lighthouse-Metrik-Schranken des QS-PERF-Tors.
//
// Ergänzt den Chrome-freien Bundle-Teil (scripts/check-perf-budget.ts) um die in
// CLAUDE.md §15 / FAHRPLAN-PERFORMANCE.md geforderten Lighthouse-Schranken:
// CLS/LCP/TBT/TTI/Score auf `/gesetze/bund/OR` (die schwerste Leser-Seite) + der
// Startseite, gemessen im **Lighthouse-Mobil-Preset** (= 4× CPU-Drosselung +
// langsames 4G — exakt das im Audit 30.6.2026 gemessene Worst-Case-Geräteprofil).
//
// Bewusst NICHT im schnellen `npm run gate` (der nicht baut). Es liest ein
// bereits gebautes `dist/` und startet dafür `vite preview` selbst — es gehört
// in den DEPLOY-/CI-Pfad NACH `npm run build` und NACH den Treue-Toren
// (golden/normtext/struktur-konsistenz/suchindex + Reader-e2e). Die
// Gegenkopplung (§15: «Tempo zählt nur, wenn die Treue grün bleibt») wird durch
// die CI-Schritt-Reihenfolge erzwungen: laufen die Treue-Tore rot, bricht der
// Job, bevor dieses Script überhaupt startet.
//
// Chrome-Auflösung (CI reproduzierbar): CHROME_PATH → Playwright-Chromium
// (in CI ohnehin installiert) → chrome-launcher-Default (lokal System-Chrome).
//
// Schwellen sind **Regressions-Deckel mit Kopffreiheit über dem Ist** (siehe
// SCHWELLEN unten), nicht das Endziel — der erste Eintritt soll Rückschritte
// fangen, nicht sofort rot sein. Verschärfung ist dokumentierter Folgeschritt.

import { spawn, type ChildProcess } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const requireCJS = createRequire(import.meta.url);

// ── Konfiguration ──────────────────────────────────────────────────────────

const PORT = Number(process.env.PERF_PORT ?? 4319);
const BASE = process.env.PERF_BASE_URL ?? `http://localhost:${PORT}`;
const MESSEN_NUR = process.argv.includes('--messen'); // nur messen + drucken, keine Assertion
// Lighthouse-Einzelläufe streuen auf einem geteilten CI-Runner stark (v. a. TBT/
// Score/CLS unter der 4×-CPU-Drossel). Darum je Seite N Läufe → **Median** je
// Metrik (der Standard-Ansatz von Lighthouse-CI gegen Ausreisser-Flake). CI: 3,
// lokal 1 (schnell). Override über PERF_RUNS.
const RUNS = Number(process.env.PERF_RUNS ?? (process.env.CI ? 3 : 1));

type Schwelle = {
  clsMax: number;   // Cumulative Layout Shift (geräteunabhängig — der harte Regressions-Fänger)
  lcpMax: number;   // Largest Contentful Paint (ms) — CPU-abhängig, grosszügiger Deckel
  tbtMax: number;   // Total Blocking Time (ms)
  ttiMax: number;   // Time To Interactive (ms)
  scoreMin: number; // Performance-Score 0..100
};

// Ist-Werte (lokal, dist gebaut, Mobil-Preset) siehe PR-Beschreibung; Schwellen
// = Ist + ehrliche Kopffreiheit (CLS eng, CPU-Metriken weit, weil der CI-Runner
// langsamer ist als die lokale Messmaschine).
// Binding ist der **CI-Runner** (dort läuft das Tor), nicht die lokale Maschine.
// Beobachtet (2-Kern-GitHub-Runner, Median-Kalibrierlauf 5.7.2026, Mobil-Preset):
//   OR     Score ~38 / CLS ~0.098 / LCP 7.6 s / TBT ~2.3 s / TTI 7.6 s
//   Start  Score ~72 / CLS 0.000  / LCP 6.4 s / TBT ~0.2 s / TTI 6.4 s
// (lokal, Apple Silicon, war OR CLS 0.005 / TBT 0.5 s — der langsame Runner
// legt unter der 4×-CPU-Drossel echten Spät-Shift + Blocking-Time offen.)
// Schwellen = beobachtetes CI-Ist + ehrliche Kopffreiheit gegen Rest-Streuung.
//   • CLS: OR 0.15 (fängt die alte 0.64-Regression mit Marge; FAHRPLAN-Eintritt war
//     0.25 → Ziel 0.10 — 0.15 ist der ehrliche erste Staffel-Schritt), Start 0.10
//     (dort stabil 0.000). CLS ist der eigentliche Regressions-Fänger.
//   • LCP/TBT/TTI/Score hängen an CPU+Netz → grosszügige Deckel (fangen grobe
//     Rückschritte wie «16-MiB-Suchindex in den kritischen Pfad», flaken nicht).
// Verschärfung = dokumentierter Folgeschritt nach breiterer CI-Baseline.
const SCHWELLEN: Record<string, { url: string; label: string; s: Schwelle }> = {
  or: {
    url: `${BASE}/gesetze/bund/OR`,
    label: '/gesetze/bund/OR (≈930 KB HTML)',
    s: { clsMax: 0.15, lcpMax: 12000, tbtMax: 4000, ttiMax: 14000, scoreMin: 25 },
  },
  start: {
    url: `${BASE}/`,
    label: 'Startseite',
    s: { clsMax: 0.10, lcpMax: 11000, tbtMax: 1500, ttiMax: 12000, scoreMin: 40 },
  },
};

// ── Preview-Server (falls nicht via PERF_BASE_URL extern gestellt) ───────────

async function warteAufPort(url: string, timeoutMs = 30_000): Promise<void> {
  const bis = Date.now() + timeoutMs;
  while (Date.now() < bis) {
    try {
      const r = await fetch(url, { method: 'HEAD' });
      if (r.ok || r.status === 404) return; // Server antwortet (404 = SPA-Route ok)
    } catch { /* noch nicht oben */ }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`Preview-Server unter ${url} nicht erreichbar (Timeout ${timeoutMs} ms).`);
}

async function startePreview(): Promise<ChildProcess> {
  const p = spawn('npm', ['run', 'preview', '--', '--port', String(PORT), '--strictPort'], {
    cwd: process.cwd(),
    stdio: 'ignore',
    detached: false,
  });
  await warteAufPort(BASE);
  return p;
}

// ── Chrome-Auflösung ─────────────────────────────────────────────────────────

function chromePfad(): string | undefined {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  try {
    // Playwright-Chromium (in CI installiert) — hält die Messumgebung reproduzierbar.
    const { chromium } = requireCJS('@playwright/test');
    const p = chromium.executablePath();
    if (p && existsSync(p)) return p;
  } catch { /* Playwright nicht auflösbar → chrome-launcher-Default */ }
  return undefined; // chrome-launcher findet System-Chrome
}

// ── Lighthouse-Lauf ──────────────────────────────────────────────────────────

type Metrik = { cls: number; lcp: number; tbt: number; tti: number; score: number };

const median = (xs: number[]): number => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

async function einLauf(url: string, port: number): Promise<Metrik> {
  // Default = Mobil-Preset: cpuSlowdownMultiplier 4 + langsames 4G (das Audit-Profil).
  const runner = await lighthouse(url, {
    port,
    output: 'json',
    logLevel: 'error',
    onlyCategories: ['performance'],
  });
  if (!runner) throw new Error(`Lighthouse lieferte kein Ergebnis für ${url}.`);
  const lhr = runner.lhr;
  const num = (id: string): number => Number(lhr.audits[id]?.numericValue ?? NaN);
  return {
    cls: num('cumulative-layout-shift'),
    lcp: num('largest-contentful-paint'),
    tbt: num('total-blocking-time'),
    tti: num('interactive'),
    score: Math.round((lhr.categories.performance?.score ?? 0) * 100),
  };
}

// N Läufe → Median je Metrik (Ausreisser-Flake auf geteiltem CI-Runner dämpfen).
async function messe(url: string, port: number): Promise<Metrik> {
  const laeufe: Metrik[] = [];
  for (let i = 0; i < RUNS; i++) laeufe.push(await einLauf(url, port));
  return {
    cls: median(laeufe.map((m) => m.cls)),
    lcp: median(laeufe.map((m) => m.lcp)),
    tbt: median(laeufe.map((m) => m.tbt)),
    tti: median(laeufe.map((m) => m.tti)),
    score: median(laeufe.map((m) => m.score)),
  };
}

// ── Hauptlauf ────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  if (!existsSync(join(process.cwd(), 'dist', 'index.html'))) {
    console.error('check:perf-lighthouse — dist/ fehlt. Zuerst `npm run build`.');
    process.exit(1);
  }

  let preview: ChildProcess | undefined;
  let chrome: chromeLauncher.LaunchedChrome | undefined;
  const fehler: string[] = [];
  const bericht: Record<string, Metrik> = {};

  try {
    if (!process.env.PERF_BASE_URL) preview = await startePreview();
    chrome = await chromeLauncher.launch({
      chromePath: chromePfad(),
      chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
    });

    console.log(`check:perf-lighthouse — Lighthouse-Mobil (4× CPU + langsames 4G), Median aus ${RUNS} ${RUNS === 1 ? 'Lauf' : 'Läufen'}:`);
    for (const [key, { url, label, s }] of Object.entries(SCHWELLEN)) {
      const m = await messe(url, chrome.port);
      bericht[key] = m;
      console.log(
        `  ${label}\n` +
        `    Score ${m.score} (≥ ${s.scoreMin})  ` +
        `CLS ${m.cls.toFixed(3)} (≤ ${s.clsMax})  ` +
        `LCP ${(m.lcp / 1000).toFixed(2)} s (≤ ${(s.lcpMax / 1000).toFixed(1)} s)  ` +
        `TBT ${Math.round(m.tbt)} ms (≤ ${s.tbtMax})  ` +
        `TTI ${(m.tti / 1000).toFixed(2)} s (≤ ${(s.ttiMax / 1000).toFixed(1)} s)`,
      );
      if (!MESSEN_NUR) {
        if (m.cls > s.clsMax) fehler.push(`${label}: CLS ${m.cls.toFixed(3)} > ${s.clsMax} (Layout-Sprung — §15/2, höchste Prio).`);
        if (m.lcp > s.lcpMax) fehler.push(`${label}: LCP ${(m.lcp / 1000).toFixed(2)} s > ${(s.lcpMax / 1000).toFixed(1)} s.`);
        if (m.tbt > s.tbtMax) fehler.push(`${label}: TBT ${Math.round(m.tbt)} ms > ${s.tbtMax} ms.`);
        if (m.tti > s.ttiMax) fehler.push(`${label}: TTI ${(m.tti / 1000).toFixed(2)} s > ${(s.ttiMax / 1000).toFixed(1)} s.`);
        if (m.score < s.scoreMin) fehler.push(`${label}: Score ${m.score} < ${s.scoreMin}.`);
      }
    }

    // Bericht persistieren (Diagnose/Trend, nicht committet).
    const outDir = join(process.cwd(), 'dist', '_perf');
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, 'lighthouse.json'), JSON.stringify(bericht, null, 2));
  } finally {
    if (chrome) await chrome.kill();
    if (preview) preview.kill('SIGTERM');
  }

  if (MESSEN_NUR) {
    console.log('check:perf-lighthouse — nur Messung (keine Assertion).');
    return;
  }
  if (fehler.length) {
    console.error('\ncheck:perf-lighthouse ROT:');
    for (const f of fehler) console.error(`  ✗ ${f}`);
    process.exit(1);
  }
  console.log('check:perf-lighthouse GRÜN — Metrik-Schranken (CLS/LCP/TBT/TTI/Score) eingehalten.');
}

main().catch((e) => {
  console.error('check:perf-lighthouse — Fehler:', e instanceof Error ? e.message : e);
  process.exit(1);
});
