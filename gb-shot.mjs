import { chromium } from '@playwright/test';
const B = 'http://localhost:4412';
const ZIEL = process.env.ZIEL;
const P = process.env.PRAEFIX;
const L = [
  ['erlassleser', '/gesetze/bund/OR', 1440, 900, 'light'],
  ['rechtsprechung', '/rechtsprechung', 1440, 900, 'light'],
  ['entscheid', '/rechtsprechung/ag_gerichte_HOR_2024_19', 1440, 900, 'dark'],
  ['rechner', '/rechner/tagerechner', 1440, 900, 'light'],
  ['vorlage', '/vorlagen/kuendigung-arbeitgeber', 1440, 900, 'light'],
  ['gesetze', '/gesetze', 390, 844, 'light'],
];
const b = await chromium.launch();
for (const [n, pfad, w, h, s] of L) {
  const c = await b.newContext({ viewport: { width: w, height: h }, colorScheme: s, deviceScaleFactor: 1 });
  const p = await c.newPage();
  try { await p.goto(B + pfad, { waitUntil: 'networkidle', timeout: 30000 }); }
  catch { await p.goto(B + pfad, { waitUntil: 'domcontentloaded' }); }
  await p.waitForTimeout(900);
  await p.screenshot({ path: `${ZIEL}/${P}-${n}-${w}-${s === 'dark' ? 'dunkel' : 'hell'}.png` });
  await c.close();
}
await b.close();
console.log('ok');
