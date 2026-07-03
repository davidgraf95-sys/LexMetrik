import { chromium } from '@playwright/test';

const BASE = 'https://lexmetrik.vercel.app';
const OUT = '/Users/david/Developer/LexMetrik/docs/ux-audit-2026-07/reader';

const targets = [
  { name: 'zgb-top',    path: '/gesetze/bund/ZGB' },
  { name: 'zgb-684',    path: '/gesetze/bund/ZGB', hash: '#art-684' },
  { name: 'zgb-fn',     path: '/gesetze/bund/ZGB', hash: '#art-124_a' },
  { name: 'or-319',     path: '/gesetze/bund/OR', hash: '#art-319' },
  { name: 'vmwg',       path: '/gesetze/bund/VMWG' },
  { name: 'lugue-intl', path: '/gesetze/bund/LUGUE' },
  { name: 'kanton-zh',  path: '/gesetze/kanton/ZH-243' },
];

const viewports = [
  { tag: 'desktop', w: 1440, h: 900 },
  { tag: 'mobile',  w: 390,  h: 844 },
];

const browser = await chromium.launch();
for (const vp of viewports) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  for (const t of targets) {
    const url = BASE + t.path + (t.hash || '');
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
      // wait for article content
      await page.waitForSelector('[id^="art-"]', { timeout: 20000 }).catch(() => {});
      await page.waitForTimeout(1800);
      if (t.hash) {
        // ensure hash scroll applied
        await page.evaluate((h) => {
          const el = document.getElementById(h.slice(1));
          if (el) el.scrollIntoView({ block: 'start' });
        }, t.hash);
        await page.waitForTimeout(1200);
      }
      const file = `${OUT}/${t.name}-${vp.tag}.png`;
      await page.screenshot({ path: file });
      console.log('OK', file);
    } catch (e) {
      console.log('FAIL', t.name, vp.tag, e.message);
    }
  }
  await ctx.close();
}
await browser.close();
console.log('DONE');
