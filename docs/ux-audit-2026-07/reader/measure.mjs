import { chromium } from '@playwright/test';
const BASE = 'https://lexmetrik.vercel.app';
const browser = await chromium.launch();

async function measure(label, path, w) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForSelector('[id^="art-"]', { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const data = await page.evaluate(() => {
    const out = {};
    const px = v => Math.round(parseFloat(v) * 100) / 100;
    // reading column
    const art = document.querySelector('[id^="art-"]');
    if (art) {
      const r = art.getBoundingClientRect();
      out.artikelBox = { left: Math.round(r.left), width: Math.round(r.width) };
    }
    // a body paragraph: find longest <p> inside an article
    let bestP = null, bestLen = 0;
    document.querySelectorAll('[id^="art-"] p').forEach(p => {
      const t = (p.textContent||'').length;
      if (t > bestLen) { bestLen = t; bestP = p; }
    });
    if (bestP) {
      const cs = getComputedStyle(bestP);
      const r = bestP.getBoundingClientRect();
      out.bodyP = { fontSize: px(cs.fontSize), lineHeight: cs.lineHeight, fontFamily: cs.fontFamily.split(',')[0], width: Math.round(r.width), left: Math.round(r.left), color: cs.color };
      // approx chars per line: total chars / number of line boxes via range rects
      const range = document.createRange();
      range.selectNodeContents(bestP);
      const rects = range.getClientRects();
      out.bodyP.lineCount = rects.length;
      out.bodyP.charsPerLine = Math.round(bestLen / Math.max(1, rects.length));
    }
    // article number label
    const num = document.querySelector('[id^="art-"] .num');
    if (num) { const cs = getComputedStyle(num); out.artNum = { fontSize: px(cs.fontSize), fontFamily: cs.fontFamily.split(',')[0], color: cs.color, weight: cs.fontWeight }; }
    // guide lines: elements that render vertical hierarchy lines (border-left on nested containers)
    const bg = getComputedStyle(document.body).backgroundColor;
    out.bodyBg = bg;
    // count vertical border-left lines in the content area left region
    let borders = [];
    document.querySelectorAll('main *, [class*="lese"] *').forEach(el => {
      const cs = getComputedStyle(el);
      if (cs.borderLeftWidth !== '0px' && cs.borderLeftStyle !== 'none') {
        const r = el.getBoundingClientRect();
        if (r.height > 40) borders.push({ x: Math.round(r.left), w: cs.borderLeftWidth, color: cs.borderLeftColor });
      }
    });
    out.leftBorders = borders.slice(0, 12);
    return out;
  });
  console.log(`\n=== ${label} (${w}px) ${path} ===`);
  console.log(JSON.stringify(data, null, 1));
  await ctx.close();
}

await measure('ZGB-684', '/gesetze/bund/ZGB#art-684', 1440);
await measure('ZGB-684-mobile', '/gesetze/bund/ZGB#art-684', 390);
await measure('OR-319', '/gesetze/bund/OR#art-319', 1440);
await measure('VMWG', '/gesetze/bund/VMWG', 1440);
await measure('Kanton-ZH', '/gesetze/kanton/ZH-243', 1440);
await browser.close();
