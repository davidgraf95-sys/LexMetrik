// ─── og:image-Generator (W1.10, SEO/A11y-Fahrplan) ──────────────────────────
//
// Erzeugt deterministisch die statische Social-Card public/og.png (1200×630)
// aus den Marken-Tokens (src/index.css :root). Wird NICHT bei jedem Build
// ausgeführt (Playwright-Abhängigkeit, deterministisches Artefakt) — nur neu
// laufen lassen, wenn sich Wortmarke/Claim/Marke ändern:
//   npm run og:bild
// Die Werte sind aus index.html (og:title/og:description) destilliert — kein
// neuer Rechtstext (Auftrags-Regel: fehlender Text → TODO(David)).
//
// ── W2·24-DESIGN-IDENTITAET R3-Nachzug (6.9.2026, Prüfer-Nebenfund) ─────────
// Die Card malte bis hierher die ALTE Marke: Messing-Verlauf als Kopfbalken,
// Versal-Overline mit weitem Tracking, Wortmarke mit goldenem «Metrik», Arial
// und Georgia. Das ist Zeichen für Zeichen die Signatur, die dieser Fahrplan
// ablöst — und weil das Vorschaubild in jedem Chat und jedem Suchergebnis VOR
// der Seite erscheint, hätte es den Umbau dementiert. Neu trägt es dasselbe
// System wie die Seite: Papier und Tinte, EINE Kante, die vier Registerfarben
// als Striche (die einzige Farbe des Hauses), Archivo für Bedienung/Meta und
// Literata für Gelesenes.
//
// SCHRIFTEN: `page.setContent` lädt kein relatives Asset (Dokument ist
// about:blank) — die beiden woff2 werden darum als data:-URI eingebettet.
// Quelle ist dieselbe npm-Version wie in der App (`@fontsource-variable/*`,
// package-lock-gepinnt), das Bild ist damit reproduzierbar; fehlt eine Datei,
// bricht das Skript hörbar ab, statt still auf eine Systemschrift zu fallen.
//
// Markenfarben bewusst als Literale gespiegelt (kein CSS-Var-Zugriff im
// Headless-Render): hell-Palette aus src/index.css :root, Stand 6.9.2026 —
// --paper #FBFBFB · --ink-900 #151515 · --ink-500 #696969 · --rule-soft #DADADA
// · --reg-g #1D4E89 · --reg-r #7A1F2B · --reg-m #2F7A3E · --reg-w #8F5E0E.
// Ändert sich ein Token, dieses Skript neu laufen lassen (der Kommentar sagt,
// welche Werte gemeint sind — die Card ist reine Bild-Spiegelung).
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_DESCRIPTION, SITE_KURZFORM } from '../src/lib/seo';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ZIEL = join(ROOT, 'public', 'og.png');

/** woff2 → data:-URI (die Card rendert ohne Server, s. Kopf). */
function schrift(pfad: string): string {
  const roh = readFileSync(join(ROOT, pfad)); // fehlt sie, wirft node hier — mit Pfad
  return `data:font/woff2;base64,${roh.toString('base64')}`;
}
const ARCHIVO = schrift('node_modules/@fontsource-variable/archivo/files/archivo-latin-wght-normal.woff2');
const LITERATA = schrift('node_modules/@fontsource-variable/literata/files/literata-latin-wght-normal.woff2');

// Quelle der Texte: src/lib/seo.ts (SSoT, §6) — Tagline = SITE_DESCRIPTION
// (W2·24-R3: `HERO_SUBLINE` ist mit der Sprach-Diät gestrichen; die Card zeigt
// jetzt denselben Bestands-Satz wie die meta description),
// Claim = SITE_KURZFORM. Bei Textänderung nur seo.ts pflegen und dieses Skript
// neu laufen lassen (npm run og:bild); die Card ist reine Bild-Spiegelung.
const HTML = `<!doctype html><html lang="de-CH"><head><meta charset="utf-8" /><style>
  @font-face { font-family: 'Archivo'; src: url('${ARCHIVO}') format('woff2'); font-weight: 100 900; }
  @font-face { font-family: 'Literata'; src: url('${LITERATA}') format('woff2'); font-weight: 200 900; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; }
  body { background: #FBFBFB; color: #151515; font-family: 'Archivo', Arial, sans-serif; }
  .frame { padding: 74px 88px 66px; height: 630px; display: flex; flex-direction: column; }
  /* Die vier Registerfarben als Striche — dasselbe Zeichen, das in der App die
     Marginalie jeder Zeile anschlägt. Keine Fläche, kein Verlauf. */
  .register { display: flex; gap: 10px; }
  .register span { display: block; width: 64px; height: 5px; }
  .wordmark { font-family: 'Literata', Georgia, serif; font-weight: 500; font-size: 104px;
              line-height: 1.05; letter-spacing: -0.015em; margin-top: 34px; }
  .tagline { font-family: 'Literata', Georgia, serif; font-size: 33px; line-height: 1.36;
             color: #151515; margin-top: 26px; max-width: 960px; }
  .rule { height: 1px; background: #DADADA; margin-top: auto; }
  .foot { display: flex; justify-content: space-between; align-items: baseline; margin-top: 24px;
          font-size: 23px; color: #696969; }
  .foot .url { color: #151515; font-weight: 500; }
</style></head><body>
  <div class="frame">
    <div class="register">
      <span style="background:#1D4E89"></span><span style="background:#7A1F2B"></span>
      <span style="background:#2F7A3E"></span><span style="background:#8F5E0E"></span>
    </div>
    <div class="wordmark">LexMetrik</div>
    <div class="tagline">${SITE_DESCRIPTION}</div>
    <div class="rule"></div>
    <div class="foot"><div class="url">lexmetrik.vercel.app</div><div class="claim">${SITE_KURZFORM}</div></div>
  </div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(HTML, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready); // ohne das rendert der Fallback
await page.screenshot({ path: ZIEL, clip: { x: 0, y: 0, width: 1200, height: 630 } });
await browser.close();
console.log(`OK  ${ZIEL} (1200×630)`);
