import { chromium } from 'playwright';
import fs from 'fs';
const OUT = '/Users/david/Developer/LexMetrik/docs/ux-audit-2026-07/fedlex';

const browser = await chromium.launch();
const report = {};

async function analyze(name, url, anchors) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1400 }, deviceScaleFactor: 2 });
  const r = { url };
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2500);
    r.title = await page.title();

    // Structural analysis of the law-text column
    r.struct = await page.evaluate(() => {
      const out = {};
      // Find the actual text column: the element that directly contains article <p>s.
      const p = Array.from(document.querySelectorAll('p')).find(el => el.textContent.trim().length>40 && el.closest('main,article'));
      let col = p;
      // climb until width stabilizes as the reading column (parent much wider)
      const info = [];
      let cur = p;
      for (let i=0;i<8 && cur;i++){
        const cs = getComputedStyle(cur);
        const rect = cur.getBoundingClientRect();
        info.push({ tag: cur.tagName, cls: (cur.className||'').toString().slice(0,60),
          w: Math.round(rect.width), left: Math.round(rect.left),
          maxW: cs.maxWidth, ml: cs.marginLeft, mr: cs.marginRight, pl: cs.paddingLeft, pr: cs.paddingRight });
        cur = cur.parentElement;
      }
      out.ancestry = info;

      // Article container: find an element whose text starts with "Art. 1"
      const arts = Array.from(document.querySelectorAll('*')).filter(e => {
        const t = e.textContent.trim();
        return /^Art\.\s*1\b/.test(t) && t.length < 400 && e.children.length<=6;
      });
      if (arts[0]) out.articleHTML = arts[0].outerHTML.slice(0, 900);

      // Marginal title heuristics: elements near article heading with bold/italic
      const h6 = Array.from(document.querySelectorAll('h6')).find(h=>/^Art\./.test(h.textContent.trim()));
      if (h6) {
        const cs = getComputedStyle(h6);
        out.artHeading = { text: h6.textContent.trim(), fontSize: cs.fontSize, fontWeight: cs.fontWeight, color: cs.color, display: cs.display };
        // siblings / next elements
        let sib = h6.previousElementSibling;
        const before = [];
        for (let i=0;i<3 && sib;i++){ before.push({tag:sib.tagName, cls:(sib.className||'').toString().slice(0,40), text:sib.textContent.trim().slice(0,50), fw:getComputedStyle(sib).fontWeight, fst:getComputedStyle(sib).fontStyle}); sib=sib.previousElementSibling; }
        out.beforeArtHeading = before;
      }

      // Absatz number: superscripts inside law paragraphs at line start
      const supIn = Array.from(document.querySelectorAll('p sup')).slice(0,3).map(s=>{
        const cs=getComputedStyle(s); return {text:s.textContent.trim().slice(0,10), fontSize:cs.fontSize, color:cs.color, vAlign:cs.verticalAlign, top:cs.top};
      });
      out.absatzSups = supIn;

      // Footnote block at bottom
      const fnBlock = document.querySelector('[class*=footnote], [class*=fussnote], .fn, footer');
      if (fnBlock){ const cs=getComputedStyle(fnBlock); out.footnoteBlock={cls:(fnBlock.className||'').toString().slice(0,60), fontSize:cs.fontSize, color:cs.color, borderTop:cs.borderTop, text:fnBlock.textContent.trim().slice(0,120)}; }

      // background of page + text column
      out.bodyBg = getComputedStyle(document.body).backgroundColor;
      const main = document.querySelector('main');
      if (main) out.mainBg = getComputedStyle(main).backgroundColor;
      return out;
    });

    // Screenshots at anchors (search text and scroll)
    for (const a of anchors) {
      try {
        const loc = page.getByText(a.text, { exact: false }).first();
        await loc.scrollIntoViewIfNeeded({ timeout: 8000 });
        await page.waitForTimeout(600);
        await page.screenshot({ path: `${OUT}/${name}-${a.tag}.png` });
        r[`shot_${a.tag}`] = 'ok';
      } catch(e){ r[`shot_${a.tag}`] = 'fail: '+String(e).slice(0,80); }
    }
  } catch(e){ r.error = String(e); }
  await page.close();
  report[name] = r;
}

await analyze('zgb', 'https://www.fedlex.admin.ch/eli/cc/24/233_245_233/de', [
  { tag:'art1', text:'Anwendung des Rechts' },
  { tag:'art684', text:'übermässige Einwirkung' },
]);
await analyze('or', 'https://www.fedlex.admin.ch/eli/cc/27/317_321_377/de', [
  { tag:'art319', text:'Einzelarbeitsvertrag' },
]);
// SR 0.101 EMRK
await analyze('emrk', 'https://www.fedlex.admin.ch/eli/cc/1974/2151_2151_2151/de', [
  { tag:'art1', text:'Verpflichtung zur Achtung der Menschenrechte' },
]);

await browser.close();
fs.writeFileSync(`${OUT}/inspect.json`, JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
