import { chromium } from '@playwright/test';

const BASIS = process.env.BASIS || 'http://localhost:4412';
const ROUTEN = [
  ['start', '/'],
  ['gesetze', '/gesetze'],
  ['erlassleser', '/gesetze/bund/OR'],
  ['rechtsprechung', '/rechtsprechung'],
  ['entscheid', '/rechtsprechung/bge-150-iii-89'],
  ['rechner', '/rechner/tage'],
  ['vorlage', '/vorlagen/kuendigung-arbeitgeber'],
  ['suche', '/suche?q=Frist'],
  ['einstellungen', '/einstellungen'],
  ['materialien', '/materialien'],
];

const MESS = () => {
  const REG = ['--reg-g','--reg-r','--reg-m','--reg-w'];
  const cs = getComputedStyle(document.documentElement);
  const werte = REG.map(v => cs.getPropertyValue(v).trim()).filter(Boolean);
  const norm = (s) => {
    const m = /^#([0-9a-f]{6})$/i.exec(s);
    if (!m) return s.toLowerCase().replace(/\s/g,'');
    const h = m[1];
    return `rgb(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)})`;
  };
  const ziel = new Set(werte.map(norm));
  const EIG = ['color','backgroundColor','borderTopColor','borderRightColor','borderBottomColor','borderLeftColor','outlineColor','textDecorationColor','caretColor'];
  const inReiter = (el) => !!el.closest('[data-reiterleiste],[data-app-seitenleiste],nav[aria-label*="Reiter"],[data-tabs]');
  const traeger = [];
  const alle = document.querySelectorAll('main *, main, header *');
  const h = window.innerHeight;
  for (const el of alle) {
    const r = el.getBoundingClientRect();
    if (r.top > h || r.bottom < 0 || r.width === 0 || r.height === 0) continue;
    if (inReiter(el)) continue;
    const st = getComputedStyle(el);
    let treffer = null;
    for (const e of EIG) { if (ziel.has(norm(st[e]||''))) { treffer = e; break; } }
    if (!treffer) {
      for (const pe of ['::before','::after']) {
        const p = getComputedStyle(el, pe);
        if (p.content && p.content !== 'none') {
          for (const e of ['backgroundColor','color','borderTopColor','borderLeftColor']) {
            if (ziel.has(norm(p[e]||''))) { treffer = pe+':'+e; break; }
          }
        }
        if (treffer) break;
      }
    }
    if (treffer) traeger.push(el.tagName.toLowerCase()+'.'+(el.className && el.className.baseVal===undefined ? String(el.className).split(' ').slice(0,2).join('.') : '')+' ['+treffer+']');
  }
  // Literata italic im ersten Bild
  let kursiv = 0;
  for (const el of document.querySelectorAll('main *, header *')) {
    const r = el.getBoundingClientRect();
    if (r.top > h || r.bottom < 0 || r.width === 0 || r.height === 0) continue;
    if (!el.textContent || !el.textContent.trim()) continue;
    const st = getComputedStyle(el);
    if (st.fontStyle === 'italic' && /literata/i.test(st.fontFamily)) kursiv++;
  }
  // Versal-Badges
  let versal = 0;
  for (const el of document.querySelectorAll('.lc-badge, [class*="lc-badge-"]')) {
    if (getComputedStyle(el).textTransform === 'uppercase') versal++;
  }
  // Kaesten im ersten Bild (gerahmte Chips/Kacheln)
  let kaesten = 0;
  for (const el of document.querySelectorAll('main .lc-chip, main .lc-badge, main .lc-wahl-kachel')) {
    const r = el.getBoundingClientRect();
    if (r.top > h || r.bottom < 0 || r.width === 0) continue;
    const st = getComputedStyle(el);
    const n = ['borderTopWidth','borderRightWidth','borderBottomWidth','borderLeftWidth'].filter(k => parseFloat(st[k]) > 0).length;
    if (n >= 3) kaesten++;
  }
  const ueberlauf = document.documentElement.scrollWidth > document.documentElement.clientWidth;
  return { traeger: traeger.length, proben: traeger.slice(0,6), kursiv, versal, kaesten, ueberlauf };
};

const b = await chromium.launch();
const zeilen = [];
for (const [modus, dunkel] of [['hell', false], ['dunkel', true]]) {
  for (const [w, hh] of [[1440, 900], [390, 844]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: hh }, colorScheme: dunkel ? 'dark' : 'light', deviceScaleFactor: 1 });
    const p = await ctx.newPage();
    for (const [name, pfad] of ROUTEN) {
      try {
        await p.goto(BASIS + pfad, { waitUntil: 'networkidle', timeout: 30000 });
      } catch { await p.goto(BASIS + pfad, { waitUntil: 'domcontentloaded', timeout: 30000 }); }
      await p.waitForTimeout(700);
      const r = await p.evaluate(MESS);
      zeilen.push({ route: name, modus, breite: w, ...r });
      if (process.env.SCREENS) {
        await p.screenshot({ path: `${process.env.SCREENS}/${process.env.PRAEFIX||'gb'}-${name}-${w}-${modus}.png` });
      }
    }
    await ctx.close();
  }
}
await b.close();
console.log(JSON.stringify(zeilen, null, 1));
