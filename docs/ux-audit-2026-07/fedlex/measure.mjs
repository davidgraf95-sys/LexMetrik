import { chromium } from 'playwright';

const OUT = '/Users/david/Developer/LexMetrik/docs/ux-audit-2026-07/fedlex';

const targets = [
  { name: 'zgb', url: 'https://www.fedlex.admin.ch/eli/cc/24/233_245_233/de', label: 'ZGB' },
  { name: 'or',  url: 'https://www.fedlex.admin.ch/eli/cc/27/317_321_377/de', label: 'OR' },
  { name: 'sr0', url: 'https://www.fedlex.admin.ch/eli/cc/1934/438_461_460/de', label: 'SR 0.* Staatsvertrag (Auslieferung?)' },
];

function px(v){ return v; }

const measure = () => {
  const results = {};
  const get = (el) => {
    if (!el) return null;
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return {
      tag: el.tagName,
      cls: el.className && typeof el.className === 'string' ? el.className.slice(0,120) : '',
      fontFamily: cs.fontFamily,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      lineHeight: cs.lineHeight,
      color: cs.color,
      background: cs.backgroundColor,
      marginTop: cs.marginTop,
      marginBottom: cs.marginBottom,
      paddingLeft: cs.paddingLeft,
      textIndent: cs.textIndent,
      textAlign: cs.textAlign,
      letterSpacing: cs.letterSpacing,
      maxWidth: cs.maxWidth,
      width: Math.round(rect.width),
      borderLeft: cs.borderLeft,
      fontStyle: cs.fontStyle,
    };
  };

  // Body / html base
  results.html = get(document.documentElement);
  results.body = get(document.body);

  // Find the main content container by heuristics: article, main, .content
  const main = document.querySelector('main') || document.querySelector('article') || document.body;
  results.main = get(main);
  results.mainWidthPx = Math.round(main.getBoundingClientRect().width);

  // Paragraphs of law text - collect a sample
  const paras = Array.from(main.querySelectorAll('p')).filter(p => p.textContent.trim().length > 40);
  results.paraCount = paras.length;
  if (paras[0]) {
    results.paraFirst = get(paras[0]);
    results.paraFirstText = paras[0].textContent.trim().slice(0,160);
    // estimate chars per line: width / avg char width. Use canvas measure.
    const cs = getComputedStyle(paras[0]);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const sample = 'abcdefghijklmnopqrstuvwxyz etaoinshrdlu die und der';
    const w = ctx.measureText(sample).width / sample.length;
    const contentWidth = paras[0].getBoundingClientRect().width
      - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    results.avgCharWidthPx = Math.round(w*100)/100;
    results.estCharsPerLine = Math.round(contentWidth / w);
    results.paraContentWidthPx = Math.round(contentWidth);
  }

  // margin between consecutive paragraphs (gap)
  if (paras[0] && paras[1]) {
    const r0 = paras[0].getBoundingClientRect();
    const r1 = paras[1].getBoundingClientRect();
    results.paraGapPx = Math.round(r1.top - r0.bottom);
  }

  // Headings hierarchy: collect h1-h6 and any element that looks like a title
  const headings = Array.from(main.querySelectorAll('h1,h2,h3,h4,h5,h6')).slice(0,12).map(h => ({
    ...get(h), text: h.textContent.trim().slice(0,70)
  }));
  results.headings = headings;

  // Marginal titles / article numbers: look for elements with typical class names
  const candidates = ['.srNummer', '.marginNote', '.marginTitle', '.artNr', '[class*=margin]', '[class*=heading]', '.noteAbsatz'];
  results.namedCandidates = {};
  for (const sel of candidates) {
    const el = main.querySelector(sel);
    if (el) results.namedCandidates[sel] = { ...get(el), text: el.textContent.trim().slice(0,60) };
  }

  // Footnotes: find sup or footnote refs and the footnote block
  const sup = main.querySelector('sup, a[href*="fn"], .footnote, [class*=footnote], [class*=fussnote]');
  if (sup) results.footnoteRef = { ...get(sup), text: sup.textContent.trim().slice(0,40) };

  // Links color
  const link = main.querySelector('a[href]');
  if (link) results.link = { ...get(link), text: link.textContent.trim().slice(0,40) };

  return results;
};

const browser = await chromium.launch();
const out = {};
for (const t of targets) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1600 }, deviceScaleFactor: 2 });
  try {
    await page.goto(t.url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2500);
    const data = await page.evaluate(measure);
    out[t.name] = { url: t.url, label: t.label, title: await page.title(), data };
    // full page screenshot of top
    await page.screenshot({ path: `${OUT}/${t.name}-top.png` });
  } catch (e) {
    out[t.name] = { url: t.url, error: String(e) };
  }
  await page.close();
}
await browser.close();
import fs from 'fs';
fs.writeFileSync(`${OUT}/measurements.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
