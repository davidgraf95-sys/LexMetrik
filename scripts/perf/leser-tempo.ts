// ─── Messung «Zeit bis bedienbar» der Leserseiten (QS-PERF) ──────────────────
//
// WOFÜR. Der ROADMAP-Schritt `QS-PERF` misst nicht Bundle-Bytes (das tut
// `check:perf-budget`) und nicht Lighthouse (das tut `check:perf-lighthouse`),
// sondern die eine Zahl, die der Jurist spürt: **wann ist der Leser bedienbar?**
// Anlass ist der Befund vom 17.8.2026 (OR 8,4–17,2 s, Nullprobe 6/6 rot,
// `fahrplaene/FAHRPLAN-PERFORMANCE.md` §1-N2) und das Kanton-Profil vom
// 31.8.2026 (`bibliothek/seo/kanton-reader-profil-2026-08-31.md`).
//
// BEWUSST KEIN TOR (§2/§6.7). Timing ist maschinen- und lastabhängig; eine
// Schwelle darauf wäre flakig und würde die Messung deckeln statt die Ladekosten
// senken. Dies ist Mess-Infrastruktur auf Abruf:
//
//   npm run build && npm run perf:leser -- --laeufe=5 --cpu=4 --netz=4g
//   npm run perf:leser -- --wasserfall --route=/gesetze/bund/OR
//
// MESSGRÖSSEN (beide über einen Init-Script-MutationObserver, also ohne
// Polling-Kosten im Messpfad):
//   · `bedienbar` — `[data-v3-ansicht]` im DOM. Exakt die Bedingung, gegen die
//     neun Leser-Specs warten (`e2e/helpers/leserBereit.ts`): der Ansicht-Öffner
//     steht NICHT im Prerender-HTML, existiert also erst nach dem Client-Render.
//   · `artikel`  — erstes `article[id^="art-"]`. Der vom React-Leser gerenderte
//     Artikel (Prerender liefert `<article>` ohne id). Dieselbe Messgrösse wie
//     im Kanton-Reader-Profil, damit die Reihen vergleichbar bleiben.
//
// MESS-HYGIENE (Skill `perf`, «Mess-Hygiene für Hand-Messreihen»):
//   · jeder Lauf KALT — frischer Browser-Kontext + `Network.setCacheDisabled`;
//   · Drossel-Bedingung steht in der Kopfzeile jeder Tabelle, nie eine Zahl ohne
//     Bedingung (§0 Ziff. 3c);
//   · Median + Einzelläufe werden ausgegeben, nie nur ein Einzelwert.
import { chromium, type Browser, type CDPSession, type Page } from '@playwright/test';
import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const PORT = 4333; // eigener Port (e2e 4317, messung:cwv 4319, kanton-profil 4331)
const BASIS = `http://localhost:${PORT}`;

const NETZE = {
  aus: null,
  '4g': { downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8, latency: 150 },
  '3g': { downloadThroughput: (400 * 1024) / 8, uploadThroughput: (400 * 1024) / 8, latency: 400 },
} as const;
type NetzName = keyof typeof NETZE;

interface Optionen { laeufe: number; cpu: number; netz: NetzName; routen: string[]; wasserfall: boolean }

const STANDARD_ROUTEN = [
  '/gesetze/bund/OR',
  '/gesetze/bund/ZGB',
  '/gesetze/bund/StGB',
  '/gesetze/kanton/BS-154.100',
];

function argumente(): Optionen {
  const a = process.argv.slice(2);
  const wert = (name: string): string | null => {
    const t = a.find((x) => x.startsWith(`--${name}=`));
    return t ? t.slice(name.length + 3) : null;
  };
  const routen = a.filter((x) => x.startsWith('--route=')).map((x) => x.slice(8));
  const netz = (wert('netz') ?? 'aus') as NetzName;
  if (!(netz in NETZE)) { console.error(`--netz muss aus/4g/3g sein, war "${netz}"`); process.exit(2); }
  return {
    laeufe: Number(wert('laeufe') ?? 3),
    cpu: Number(wert('cpu') ?? 1),
    netz,
    routen: routen.length ? routen : STANDARD_ROUTEN,
    wasserfall: a.includes('--wasserfall'),
  };
}

/** Init-Script: hält die Zeitpunkte fest, an denen die zwei Marker erstmals im
 *  DOM stehen. MutationObserver statt Polling — Polling würde unter CPU-Drossel
 *  die Messung selbst verzerren (Skill `perf`, Mess-Hygiene Ziff. 2). */
const MARKER_SCRIPT = `
(() => {
  const w = window; w.__lmTempo = { bedienbar: null, artikel: null };
  const pruefe = () => {
    const t = w.__lmTempo;
    if (t.bedienbar === null && document.querySelector('[data-v3-ansicht]')) t.bedienbar = performance.now();
    if (t.artikel === null && document.querySelector('article[id^="art-"]')) t.artikel = performance.now();
    return t.bedienbar !== null && t.artikel !== null;
  };
  const start = () => {
    if (pruefe()) return;
    const mo = new MutationObserver(() => { if (pruefe()) mo.disconnect(); });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  };
  if (document.documentElement) start();
  else document.addEventListener('readystatechange', start, { once: true });
})();
`;

interface Lauf { bedienbar: number | null; artikel: number | null; fcp: number | null }

interface Drossel { cpu: number; netz: NetzName }

async function drosseln(cdp: CDPSession, d: Drossel): Promise<void> {
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  const netz = NETZE[d.netz];
  if (netz) await cdp.send('Network.emulateNetworkConditions', { offline: false, ...netz });
  if (d.cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: d.cpu });
}

async function einLauf(browser: Browser, o: Optionen, route: string): Promise<Lauf> {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page: Page = await ctx.newPage();
  await page.addInitScript(MARKER_SCRIPT);
  const cdp = await ctx.newCDPSession(page);
  await drosseln(cdp, o);

  await page.goto(`${BASIS}${route}`, { waitUntil: 'commit' });
  try {
    await page.waitForFunction(
      () => {
        const t = (window as unknown as { __lmTempo: Lauf }).__lmTempo;
        return t.bedienbar !== null && t.artikel !== null;
      },
      undefined, { timeout: 180000 },
    );
  } catch { /* Zeitüberschreitung → null-Werte, im Bericht als «—» sichtbar */ }
  const t = await page.evaluate(() => {
    const w = window as unknown as { __lmTempo: { bedienbar: number | null; artikel: number | null } };
    const fcp = performance.getEntriesByName('first-contentful-paint')[0];
    return { ...w.__lmTempo, fcp: fcp ? fcp.startTime : null };
  });
  await ctx.close();
  return t;
}

/** Wasserfall EINER Route: welche Bytes liegen vor dem Marker auf dem Pfad? */
async function wasserfall(browser: Browser, o: Optionen, route: string): Promise<void> {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.addInitScript(MARKER_SCRIPT);
  const cdp = await ctx.newCDPSession(page);

  // CDP statt PerformanceResourceTiming: Resource-Timing legt den Eintrag erst
  // BEI ABSCHLUSS an und übersieht damit genau die Downloads, die beim Marker
  // noch laufen (Lehre aus dem Kanton-Reader-Profil, 31.8.2026).
  const req = new Map<string, { url: string; start: number; ende: number | null; bytes: number }>();
  let t0 = 0;
  cdp.on('Network.requestWillBeSent', (e) => {
    if (!t0) t0 = e.timestamp;
    req.set(e.requestId, { url: e.request.url, start: (e.timestamp - t0) * 1000, ende: null, bytes: 0 });
  });
  cdp.on('Network.loadingFinished', (e) => {
    const r = req.get(e.requestId);
    if (r) { r.ende = (e.timestamp - t0) * 1000; r.bytes = e.encodedDataLength; }
  });
  await drosseln(cdp, o);

  await page.goto(`${BASIS}${route}`, { waitUntil: 'commit' });
  try {
    await page.waitForFunction(
      () => (window as unknown as { __lmTempo: Lauf }).__lmTempo.bedienbar !== null,
      undefined, { timeout: 180000 },
    );
  } catch { /* siehe oben */ }
  const marker = await page.evaluate(() => (window as unknown as { __lmTempo: Lauf }).__lmTempo);
  const zeilen = [...req.values()].sort((a, b) => a.start - b.start);
  console.log(`\n## Wasserfall ${route} — ${bedingung(o)}`);
  console.log(`Marker: bedienbar ${fmt(marker.bedienbar)} ms · erster Artikel ${fmt(marker.artikel)} ms\n`);
  console.log('| von → bis (ms) | KB | Ressource |');
  console.log('|---|--:|---|');
  for (const r of zeilen) {
    const kb = (r.bytes / 1024).toFixed(1);
    const bis = r.ende === null ? '**läuft beim Marker noch**' : Math.round(r.ende).toString();
    console.log(`| ${Math.round(r.start)} → ${bis} | ${kb} | ${r.url.replace(BASIS, '')} |`);
  }
  await ctx.close();
}

const fmt = (n: number | null) => (n === null ? '—' : Math.round(n).toString());
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};
const bedingung = (o: Optionen) =>
  `${o.cpu}× CPU · Netz ${o.netz === 'aus' ? 'ungedrosselt' : o.netz} · je Lauf kalt (frischer Kontext, Cache aus)`;

async function main(): Promise<void> {
  const o = argumente();
  if (!existsSync(join(ROOT, 'dist', 'index.html'))) {
    console.error('dist/ fehlt — erst `npm run build` laufen lassen.');
    process.exit(1);
  }
  const server: ChildProcess = spawn(
    'npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'],
    { cwd: ROOT, stdio: 'ignore' },
  );
  const browser = await chromium.launch();
  try {
    // Auf den Server warten, ohne feste Wartezeit (die wäre Rateraum, nicht Messung).
    for (let i = 0; i < 80; i++) {
      try { const r = await fetch(BASIS); if (r.ok) break; } catch { /* noch nicht da */ }
      await new Promise((r) => setTimeout(r, 250));
    }
    if (o.wasserfall) {
      for (const route of o.routen) await wasserfall(browser, o, route);
      return;
    }
    console.log(`\n## Zeit bis bedienbar — ${bedingung(o)}, n=${o.laeufe}\n`);
    console.log('| Route | bedienbar Median | Einzelläufe (ms) | erster Artikel Median | FCP Median |');
    console.log('|---|--:|---|--:|--:|');
    for (const route of o.routen) {
      const laeufe: Lauf[] = [];
      for (let i = 0; i < o.laeufe; i++) laeufe.push(await einLauf(browser, o, route));
      const b = laeufe.map((l) => l.bedienbar).filter((x): x is number => x !== null);
      const a = laeufe.map((l) => l.artikel).filter((x): x is number => x !== null);
      const f = laeufe.map((l) => l.fcp).filter((x): x is number => x !== null);
      const einzeln = laeufe.map((l) => fmt(l.bedienbar)).join(' · ');
      console.log(`| \`${route}\` | **${b.length ? Math.round(median(b)) : '—'}** | ${einzeln} | ${a.length ? Math.round(median(a)) : '—'} | ${f.length ? Math.round(median(f)) : '—'} |`);
    }
  } finally {
    await browser.close();
    server.kill();
  }
}

void main();
