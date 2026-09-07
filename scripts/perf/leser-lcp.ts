// ─── Messung «wann steht die Überschrift» — LCP/TBT/CLS der Leserseiten ──────
//
// WOFÜR. `perf:leser` (Nachbardatei) misst, wann der Leser BEDIENBAR ist
// (`[data-v3-ansicht]` im DOM). Diese Sonde misst die drei Grössen, die der
// Leser SIEHT und die Google als Core Web Vitals bewertet — LCP, TBT, CLS —
// und dazu die eine Diagnose-Zahl, die den Befund vom 6.9.2026 erklärt:
// **wie lange blockiert der längste Task den Hauptthread**.
//
// ANLASS (David 6.9.2026: «kann es sein, dass gesetze länger brauchen zum laden
// als früher?»). Auf `/gesetze/bund/OR` stand der LCP unter CPU×4 bei ~14.8 s
// gegen ~0.4 s auf main — am 6.9.2026 als NICHT reproduzierbar erkannt (die
// Vor-Messung lief neben laufenden Builds; verschränkt gemessen liegen beide
// Stände gleichauf), s. PERF-LESER.md §2. Ursache-Kette ebenda.
//
// BEWUSST KEIN TOR (§6.7 andersherum: ein Tor, das nur streut, misst nichts).
// Timing ist last- und maschinenabhängig; die deterministische Zusicherung
// trägt der Unit-Wächter `src/lib/fedlex/spannen-weichtrenn.test.ts` (Muster-
// Identität, kein Uhrwert); Lighthouse-Latten liegen in `check:perf-lighthouse`. Dies hier ist Mess-Infrastruktur
// auf Abruf:
//
//   npm run build && npm run perf:leser-lcp -- --laeufe=3
//   npm run perf:leser-lcp -- --routen=/gesetze/bund/OR --ohne-fonts
//
// MESS-HYGIENE (Skill `perf`, «Mess-Hygiene für Hand-Messreihen»):
//   · jeder Lauf KALT — frischer Browser-Kontext + `Network.setCacheDisabled`
//     (ausser `--warm`: zweite Navigation im selben Kontext);
//   · die Drossel-Bedingung steht in der Kopfzeile jeder Tabelle, nie eine Zahl
//     ohne Bedingung (§0 Ziff. 3c);
//   · Median UND Einzelläufe, nie nur ein Einzelwert.
//
// TBT-FALLE (Befund 6.9.2026, hier behoben): ein `PerformanceObserver` auf
// `longtask` liefert OHNE `{buffered:true}` UND ohne Registrierung VOR dem
// ersten Skript der Seite **nichts** — die Messung meldete durchgehend 0 ms und
// sah damit genau den Defekt nicht, den sie suchte. Der Observer wird darum per
// `addInitScript` gesetzt, also vor jedem Seitenskript, und mit `buffered:true`.
import { chromium, type Browser, type CDPSession, type Page } from '@playwright/test';
import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const PORT = 4366; // eigener Port (e2e 4317, perf:leser 4333, kanton-profil 4331)
const BASIS = `http://localhost:${PORT}`;

const STANDARD_ROUTEN = [
  '/gesetze/bund/OR',
  '/gesetze/bund/OR#art-336_c',
  '/gesetze/bund/ZGB#art-457',
  '/gesetze',
  '/gesetze/kanton/BS-152.110',
];

interface Optionen {
  laeufe: number; cpu: number; routen: string[]; ohneFonts: boolean; warm: boolean;
  breite: number; hoehe: number;
}

function argumente(): Optionen {
  const a = process.argv.slice(2);
  const wert = (n: string): string | null => a.find((x) => x.startsWith(`--${n}=`))?.split('=').slice(1).join('=') ?? null;
  const routen = wert('routen');
  return {
    laeufe: Number(wert('laeufe') ?? 3),
    cpu: Number(wert('cpu') ?? 4),
    routen: routen ? routen.split(',') : STANDARD_ROUTEN,
    ohneFonts: a.includes('--ohne-fonts'),
    warm: a.includes('--warm'),
    breite: Number(wert('breite') ?? 390),
    hoehe: Number(wert('hoehe') ?? 844),
  };
}

/** Im Seitenkontext VOR jedem Seitenskript: Observer für LCP, CLS und Long Tasks. */
const SONDE = `(() => {
  const s = { lcp: 0, lcpGroesse: 0, cls: 0, fcp: 0, tasks: [] };
  window.__lmPerf = s;
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) { s.lcp = e.startTime; s.lcpGroesse = e.size; }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  } catch { /* nicht unterstützt */ }
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) s.cls += e.value;
    }).observe({ type: 'layout-shift', buffered: true });
  } catch { /* nicht unterstützt */ }
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) s.tasks.push([e.startTime, e.duration]);
    }).observe({ type: 'longtask', buffered: true });
  } catch { /* nicht unterstützt */ }
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (e.name === 'first-contentful-paint') s.fcp = e.startTime;
    }).observe({ type: 'paint', buffered: true });
  } catch { /* nicht unterstützt */ }
})();`;

interface Messwerte {
  lcp: number; lcpGroesse: number; fcp: number; cls: number;
  tbt: number; laengsterTask: number; taskSumme: number; anzahlTasks: number;
}

async function starteServer(): Promise<ChildProcess> {
  if (!existsSync(join(ROOT, 'dist', 'index.html'))) {
    console.error('dist/ fehlt — zuerst `npm run build`.');
    process.exit(1);
  }
  const kind = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    cwd: ROOT, stdio: 'ignore', detached: false,
  });
  for (let i = 0; i < 120; i++) {
    try {
      const r = await fetch(BASIS + '/');
      if (r.ok) return kind;
    } catch { /* noch nicht da */ }
    await new Promise((r) => setTimeout(r, 250));
  }
  kind.kill();
  throw new Error('vite preview kam nicht hoch');
}

async function einLauf(browser: Browser, route: string, o: Optionen, wiederverwendet: Page | null): Promise<{ werte: Messwerte; seite: Page }> {
  const seite = wiederverwendet ?? await (async () => {
    const ctx = await browser.newContext({ viewport: { width: o.breite, height: o.hoehe } });
    const p = await ctx.newPage();
    await p.addInitScript(SONDE);
    if (o.ohneFonts) await p.route('**/*.woff2', (r) => r.abort());
    const cdp: CDPSession = await p.context().newCDPSession(p);
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: o.cpu });
    return p;
  })();

  await seite.goto(BASIS + route, { waitUntil: 'load', timeout: 90_000 });
  // Einschwingen: warten, bis 1.5 s lang KEIN Long Task mehr kommt (Deckel 45 s).
  await seite.waitForFunction(() => {
    const s = (window as unknown as { __lmPerf: { tasks: [number, number][] } }).__lmPerf;
    const letzte = s.tasks.at(-1);
    const ende = letzte ? letzte[0] + letzte[1] : 0;
    return performance.now() - ende > 1500;
  }, undefined, { timeout: 45_000 }).catch(() => { /* Deckel: nimm, was da ist */ });

  const werte = await seite.evaluate((): Messwerte => {
    const s = (window as unknown as { __lmPerf: { lcp: number; lcpGroesse: number; cls: number; fcp: number; tasks: [number, number][] } }).__lmPerf;
    const tasks = s.tasks;
    return {
      lcp: Math.round(s.lcp), lcpGroesse: s.lcpGroesse, fcp: Math.round(s.fcp),
      cls: Math.round(s.cls * 10_000) / 10_000,
      tbt: Math.round(tasks.reduce((a, [, d]) => a + Math.max(0, d - 50), 0)),
      laengsterTask: Math.round(tasks.reduce((a, [, d]) => Math.max(a, d), 0)),
      taskSumme: Math.round(tasks.reduce((a, [, d]) => a + d, 0)),
      anzahlTasks: tasks.length,
    };
  });
  return { werte, seite };
}

const median = (xs: number[]): number => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : Math.round((s[s.length / 2 - 1] + s[s.length / 2]) / 2);
};

async function main(): Promise<void> {
  const o = argumente();
  const server = await starteServer();
  const browser = await chromium.launch();
  console.log(`\nBedingung: ${o.breite}×${o.hoehe}, CPU×${o.cpu}, Netz ungedrosselt, ${o.warm ? 'WARM (2. Navigation)' : 'kalt (frischer Kontext)'}${o.ohneFonts ? ', WEBFONTS BLOCKIERT' : ''}, n=${o.laeufe}, dist/-Preview @${PORT}`);
  console.log('Route                              |    LCP |    FCP |    TBT | längster |    CLS | LCP-Grösse');
  console.log('-----------------------------------|--------|--------|--------|----------|--------|-----------');
  try {
    for (const route of o.routen) {
      const alle: Messwerte[] = [];
      let seite: Page | null = null;
      for (let i = 0; i < o.laeufe; i++) {
        const r = await einLauf(browser, route, o, o.warm ? seite : null);
        alle.push(r.werte);
        if (o.warm) { seite = r.seite; } else { await r.seite.context().close(); }
      }
      if (seite) await seite.context().close();
      const m = (f: (w: Messwerte) => number): number => median(alle.map(f));
      const spanne = (f: (w: Messwerte) => number): string => {
        const xs = alle.map(f);
        return `${Math.min(...xs)}–${Math.max(...xs)}`;
      };
      console.log(
        `${route.padEnd(34)} | ${String(m((w) => w.lcp)).padStart(6)} | ${String(m((w) => w.fcp)).padStart(6)} | `
        + `${String(m((w) => w.tbt)).padStart(6)} | ${String(m((w) => w.laengsterTask)).padStart(8)} | `
        + `${String(m((w) => w.cls)).padStart(6)} | ${String(m((w) => w.lcpGroesse)).padStart(9)}`,
      );
      console.log(`  Spannen: LCP ${spanne((w) => w.lcp)} · TBT ${spanne((w) => w.tbt)} · längster ${spanne((w) => w.laengsterTask)} · CLS ${spanne((w) => w.cls)}`);
    }
  } finally {
    await browser.close();
    server.kill();
  }
}

void main();
