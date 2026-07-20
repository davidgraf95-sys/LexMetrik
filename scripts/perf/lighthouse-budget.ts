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
//
// BEWUSST bei 3 belassen (Befund 20.7.2026). Naheliegend wäre, gegen die unten
// belegte Streuung einfach mehr Läufe zu mitteln — ein Probelauf mit RUNS=5 in
// CI zeigt aber, dass das **nicht** funktioniert, weil dieses Script EINE
// Chrome-Instanz für ALLE Läufe BEIDER Seiten teilt: die Instanz driftet über
// die Läufe, und die zuletzt gemessene Seite erbt die Drift. Gemessen mit
// RUNS=5 sprang die Startseite (misst als zweite, nach allen OR-Läufen) von
// historisch 143–237 ms TBT auf **1543 ms**, und OR-LCP von ~3.5 s auf 11.3 s —
// ohne jede Änderung am App-Code. Mehr Läufe machen die Messung hier also nicht
// ruhiger, sondern die späteren Werte schlechter.
//
// Der saubere Weg ist Chrome-Isolation je Lauf (frische Instanz), erst danach
// wird ein höheres RUNS sinnvoll. Das ist eine **Änderung des Messregimes** —
// sie verschiebt die absoluten Werte und entwertet die 27-Lauf-Historie, gegen
// die die Schwellen unten kalibriert sind. Darum NICHT in dieser Einheit
// (§14.2: nicht über-bündeln); als eigener, neu kalibrierter Schritt notiert:
// ROADMAP → QS-PERF «Chrome-Isolation je Lighthouse-Lauf + Neukalibrierung».
const RUNS = Number(process.env.PERF_RUNS ?? (process.env.CI ? 3 : 1));

type Schwelle = {
  clsMax: number;   // Cumulative Layout Shift (geräteunabhängig — der harte Regressions-Fänger)
  lcpMax: number;   // Largest Contentful Paint (ms) — CPU-abhängig, grosszügiger Deckel
  tbtMax: number;   // Total Blocking Time (ms)
  ttiMax: number;   // Time To Interactive (ms)
  scoreMin: number; // Performance-Score 0..100
};

// ── Schwellen-Kalibrierung (NEU 20.7.2026, empirisch gegen 27 CI-Läufe) ─────
//
// Binding ist der **CI-Runner** (dort läuft das Tor), nicht die lokale Maschine.
//
// Die alte Kalibrierung (5.7.2026) notierte als CI-Ist «OR TBT ~2.3 s» und setzte
// den Deckel auf 4000 ms — gedachte Kopffreiheit ~74 %. Dieses Ist ist seither
// still veraltet: gemessen über die 27 CI-Läufe vom 19./20.7.2026 (jeder Wert
// bereits ein Median aus 3) liegt TBT/OR bei
//
//   min 2262 · Median 3527 · Mittel 3555 · max 5094 ms · sd ≈ 687 ms
//   (nur main-Pushes: Mittel 3821 · max 5094 · sd ≈ 812 — main-Läufe sind
//    systematisch langsamer, weil beim Push mehr Jobs um denselben 2-vCPU-Runner
//    konkurrieren; dieselbe Runner-Starvation wie bei den e2e-Shards.)
//
// Der Deckel 4000 lag damit nur z ≈ +0.65 über dem Mittel ⇒ rechnerisch ~26 %
// Rot-durch-Rauschen; beobachtet 4/27 aller Läufe und 3/10 der main-Läufe rot.
// Ein Tor, das auf main jeden dritten Lauf grundlos rot wirft, misst nicht mehr
// die Software, sondern die Runner-Auslastung — und erzieht zum Rerun-Reflex,
// der echte Regressionen mit durchwinkt (§8).
//
// Beleg, dass es NICHT am Code liegt (der eigentliche Kontrollversuch):
//   • main bae8dff1 — ein **reiner Dokumentations-Commit** (docs/roadmap, keine
//     Code-Zeile) — mass 5094 ms und war ROT. Derselbe Inhalt auf seinem
//     PR-Branch: 3653 und 3830 ms, beide grün. Spanne 1441 ms bei identischem Code.
//   • main 4f363fd0 mass 4537 ms ROT — ebenfalls VOR dem G-HIST-UI-Merge (#305).
//   • Der #305-Branch selbst (2588ef31) mass 3527 ms — den Median aller Läufe,
//     grün. Erst der Merge-Commit desselben Codes (50ffd6ae) mass 5007 ms.
//   • Lokale A/B-Messung (Apple Silicon, Mobil-Preset, je Median aus 7):
//     Vor-#305 (464cfbf4) 815 ms · mit #305 (50ffd6ae) 828 ms ⇒ **+13 ms
//     = +1.6 %**, auf CI-Niveau hochgerechnet ~+56 ms. #305 ist damit ~1/20 der
//     beobachteten Streuung und erklärt den Ausschlag nicht.
//
// Konsequenz — die Schärfe wandert dorthin, wo Signal ist, statt pauschal zu
// lockern:
//   • TBT/OR 4000 → 4800 ms, kalibriert gegen genau diese Verteilung:
//     4800 liegt bei z ≈ +1.8 (Mittel 3555 + 1.8·687) ⇒ erwartete Rot-durch-
//     Rauschen-Quote fällt von ~26 % auf ~3.5 % (auf main-Pushes von ~30 % auf
//     ~12 %). Fängt weiterhin jede echte Regression ab ~+1200 ms — die
//     Grössenordnung, die §15/3-Verstösse («Suchindex in den kritischen Pfad»)
//     erzeugen —, aber nicht mehr die blosse Runner-Auslastung. Der Deckel
//     bleibt damit unter dem beobachteten Maximum (5094 ms): er ist gelockert,
//     nicht ausgeschaltet.
//   • CLS/OR 0.15 → 0.05 und Start 0.10 → 0.05 (GEGENGEWICHT, Verschärfung).
//     CLS ist die deterministische, geräteunabhängige Metrik und laut §15.2 «der
//     eigentliche Regressions-Fänger» — beobachtet über dieselben 27 Läufe aber
//     nur 0.004–0.008 auf OR (Start 0.002). Ein Deckel von 0.15 ist das 19- bis
//     37-Fache des Ist und fängt faktisch nichts. 0.05 ist ~6× über dem
//     beobachteten Maximum, also flake-sicher, und deckt sich mit dem Budget, das
//     die CLS-e2e-Specs (verweis-u, gesetze-historie-badge) bereits fahren.
//     Ehrliche Grenze (§8): die #305-CLS-Regression hätte auch dieser Deckel
//     nicht gefangen — sie trat nur auf einer **Anker-Deeplink**-URL auf
//     (/gesetze/bund/MWSTV#art-165), die dieses Tor nicht misst; gefangen hat sie
//     die e2e-Spec. Die Verschärfung stellt die Deckel-Disziplin wieder her, sie
//     ersetzt die Deeplink-Specs nicht.
//   • LCP/TTI/Score hängen wie TBT an CPU+Netz → bewusst grosszügige Deckel.
// Nächster Schritt (nicht in dieser Einheit): eine Anker-Deeplink-URL als dritte
// Messseite aufnehmen, damit der CLS-Deckel die Klasse Spät-Einwuchs auch dort sieht.
const SCHWELLEN: Record<string, { url: string; label: string; s: Schwelle }> = {
  or: {
    url: `${BASE}/gesetze/bund/OR`,
    label: '/gesetze/bund/OR (≈930 KB HTML)',
    s: { clsMax: 0.05, lcpMax: 12000, tbtMax: 4800, ttiMax: 14000, scoreMin: 25 },
  },
  start: {
    url: `${BASE}/`,
    label: 'Startseite',
    s: { clsMax: 0.05, lcpMax: 11000, tbtMax: 1500, ttiMax: 12000, scoreMin: 40 },
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
// Die Einzelwerte werden mitgedruckt (Diagnose, ändert nichts am Verdikt): nur so
// ist im CI-Log unterscheidbar, ob ein roter Median echte Last ist oder ein über
// die Läufe driftender Messaufbau (siehe RUNS-Kommentar oben) — sonst diskutiert
// die nächste Session wieder über eine einzelne Zahl ohne Streuung (§8).
async function messe(url: string, port: number): Promise<Metrik> {
  const laeufe: Metrik[] = [];
  for (let i = 0; i < RUNS; i++) laeufe.push(await einLauf(url, port));
  console.log(`    Einzelläufe TBT: ${laeufe.map((m) => Math.round(m.tbt)).join(' · ')} ms`
    + `  |  LCP: ${laeufe.map((m) => (m.lcp / 1000).toFixed(1)).join(' · ')} s`);
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
