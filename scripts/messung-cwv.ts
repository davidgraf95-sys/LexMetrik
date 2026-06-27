// ─── CWV-Messung am Indexierungs-Hebel (W1.11, SEO/A11y-Fahrplan) ────────────
//
// Misst LCP, Transfer-Volumen und Request-Zahl der neu prerenderten
// Detailseiten — besonders der schwersten (OR ~1.7 MB, ZGB ~1.1 MB), die seit
// W1.1 indexierbar ausgeliefert werden. Zweck: belegen, ob render-then-replace
// (statisches HTML im #root) trotz grossem JSON-Nachladen eine gute LCP liefert,
// und ob W2.8 (Payload-Splitting) dringlich ist.
//
// BEWUSST KEIN harter Build-Gate: Timing ist umgebungsabhängig (CPU-Last,
// Cache) → ein flakiger Schwellen-Gate widerspräche §2 (Determinismus). Dies
// ist Mess-Infrastruktur (Strang B), die David/eine Session auf Abruf fährt:
//   npm run build && npm run messung:cwv
// Ergebnis als Tabelle (stdout) + Baseline-Eintrag in bibliothek/seo/.
import { chromium } from '@playwright/test';
import { execSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 4319; // eigener Port, kollidiert nicht mit e2e (4317)
const BASIS = `http://localhost:${PORT}`;

if (!existsSync(join(ROOT, 'dist', 'index.html'))) {
  console.error('dist/ fehlt — erst `npm run build` laufen lassen.');
  process.exit(1);
}

// Repräsentative Seiten: leicht (Startseite/Rechner), Detail-Hebel (Entscheid,
// kleiner Erlass) und die zwei schwersten Erlasse (LCP-Risiko-Kandidaten).
const ZIELE: Array<{ pfad: string; label: string }> = [
  { pfad: '/', label: 'Startseite' },
  { pfad: '/rechner/verzugszins', label: 'Rechner (verzugszins)' },
  { pfad: '/gesetze/bund/OR', label: 'Erlass OR (~1.7 MB, schwerster)' },
  { pfad: '/gesetze/bund/ZGB', label: 'Erlass ZGB (~1.1 MB)' },
  { pfad: '/gesetze/bund/GEBV_HREG', label: 'Erlass GebV-HReg (klein)' },
  { pfad: '/rechtsprechung/bger_1B_278_2022', label: 'Entscheid (BGer)' },
];

interface Messwert { label: string; pfad: string; lcpMs: number; domMs: number; transferKb: number; requests: number }

async function miss(): Promise<Messwert[]> {
  const browser = await chromium.launch();
  const ergebnisse: Messwert[] = [];
  try {
    for (const z of ZIELE) {
      const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      // LCP wird NICHT von getEntriesByType geliefert — Observer VOR dem Laden
      // registrieren (buffered) und den letzten Kandidaten in window halten.
      await page.addInitScript(() => {
        (window as unknown as { __lcp: number }).__lcp = 0;
        new PerformanceObserver((list) => {
          const e = list.getEntries().at(-1);
          if (e) (window as unknown as { __lcp: number }).__lcp = Math.round(e.startTime);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      });
      await page.goto(BASIS + z.pfad, { waitUntil: 'load' });
      // kurze Ruhe, damit der LCP-Kandidat steht.
      await page.waitForTimeout(600);
      const m = await page.evaluate(() => {
        const lcpMs = (window as unknown as { __lcp: number }).__lcp ?? 0;
        const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
        const res = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        const bytes = (nav?.transferSize ?? 0) + res.reduce((n, r) => n + (r.transferSize || r.encodedBodySize || 0), 0);
        return {
          lcpMs,
          domMs: Math.round(nav?.domContentLoadedEventEnd ?? 0),
          transferKb: Math.round(bytes / 1024),
          requests: res.length + 1,
        };
      });
      ergebnisse.push({ label: z.label, pfad: z.pfad, ...m });
      await page.close();
    }
  } finally {
    await browser.close();
  }
  return ergebnisse;
}

function tabelle(rows: Messwert[]): string {
  const kopf = '| Seite | Pfad | LCP (ms) | DOMContentLoaded (ms) | Transfer (KB) | Requests |';
  const trenn = '|---|---|--:|--:|--:|--:|';
  const zeilen = rows.map((r) => `| ${r.label} | \`${r.pfad}\` | ${r.lcpMs} | ${r.domMs} | ${r.transferKb} | ${r.requests} |`);
  return [kopf, trenn, ...zeilen].join('\n');
}

// vite preview gegen dist/ starten
const server = spawn('npm', ['run', 'preview', '--', '--port', String(PORT), '--strictPort'], {
  cwd: ROOT, stdio: 'ignore',
});
try {
  // Auf den Server warten
  const start = performance.now();
  let bereit = false;
  while (performance.now() - start < 30_000) {
    try {
      const r = await fetch(BASIS + '/');
      if (r.ok) { bereit = true; break; }
    } catch { /* noch nicht oben */ }
    await new Promise((res) => setTimeout(res, 300));
  }
  if (!bereit) throw new Error('vite preview kam nicht hoch (30s).');

  const rows = await miss();
  const tab = tabelle(rows);
  console.log('\nCWV-Messung (lokal, vite preview):\n');
  console.log(tab);

  const head = execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim();
  const ordner = join(ROOT, 'bibliothek', 'seo');
  mkdirSync(ordner, { recursive: true });
  const doc = `# CWV-Baseline (W1.11) — Indexierungs-Hebel

> Mess-Infrastruktur (Strang B, kein harter Gate). Lokal mit \`vite preview\`
> gegen \`dist/\` gemessen — absolute ms sind umgebungsabhängig, aussagekräftig
> ist der **relative** Vergleich (schwere vs. leichte Seite) und der Trend nach
> W2.8 (Payload-Splitting). Erneut messen: \`npm run build && npm run messung:cwv\`.

- **Stand (Commit):** \`${head}\`
- **Methode:** Chromium headless, viewport 1280×900, \`waitUntil:'load'\` + 600 ms
  Ruhe; LCP = letzter \`largest-contentful-paint\`-Eintrag; Transfer = Summe der
  Resource-/Navigation-\`transferSize\`.

${tab}

## Lesehilfe

- **render-then-replace:** Die Detailseiten liefern den Artikel-Volltext bereits
  im statischen \`#root\` (Prerender) → LCP sollte auch bei OR/ZGB durch den
  sofort gemalten Text getragen sein, **unabhängig** vom grossen JSON-Nachladen.
- **Transfer** der schweren Erlasse zeigt das W2.8-Splitting-Potenzial (das JSON
  wird für die Client-Hydration nachgeladen, nicht für den ersten Paint).
- Auffällige LCP-Regression an OR/ZGB → W2.8 vorziehen.
`;
  writeFileSync(join(ordner, 'cwv-baseline.md'), doc);
  console.log(`\nOK  bibliothek/seo/cwv-baseline.md (Stand ${head})`);
} finally {
  server.kill();
}
