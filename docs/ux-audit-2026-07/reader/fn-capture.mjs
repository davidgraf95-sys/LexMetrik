import { chromium } from '@playwright/test';
const BASE = 'https://lexmetrik.vercel.app';
const OUT = '/Users/david/Developer/LexMetrik/docs/ux-audit-2026-07/reader';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
// ZGB Art 65 has footnotes
await page.goto(BASE + '/gesetze/bund/ZGB#art-65', { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForSelector('[id^="art-"]', { timeout: 20000 }).catch(()=>{});
await page.waitForTimeout(1500);
// click the Fussnoten toggle
const btn = page.getByRole('button', { name: /Fussnoten/i }).first();
const before = await btn.isVisible().catch(()=>false);
if (before) { await btn.click().catch(()=>{}); await page.waitForTimeout(1200); }
await page.evaluate(()=>{ const el=document.getElementById('art-65'); if(el) el.scrollIntoView({block:'start'}); });
await page.waitForTimeout(1000);
await page.screenshot({ path: `${OUT}/zgb-fussnoten-on-desktop.png` });
console.log('fn toggle was visible:', before);
// report whether any sup/footnote markers exist in DOM
const info = await page.evaluate(()=>{
  const sup = document.querySelectorAll('[id^="art-"] sup, [id^="art-"] .fn, [id^="art-"] a[href^="#fn"]').length;
  return { supCount: sup };
});
console.log(JSON.stringify(info));
await browser.close();
