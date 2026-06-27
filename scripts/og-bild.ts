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
// Markenfarben bewusst als Literale gespiegelt (kein CSS-Var-Zugriff im
// Headless-Render): hell-Palette aus src/index.css :root.
import { chromium } from '@playwright/test';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ZIEL = join(ROOT, 'public', 'og.png');

// Quelle der Texte: index.html (og:title kurz / og:description). Hier als
// Card-Komposition; bei Textänderung dort UND hier nachführen (§5-Hinweis:
// der maßgebliche Social-Text bleibt index.html, dies ist die Bild-Spiegelung).
const HTML = `<!doctype html><html lang="de-CH"><head><meta charset="utf-8" /><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; }
  body { background: #FAF8F2; color: #1A1A17; font-family: Georgia, "Times New Roman", serif; }
  .topbar { height: 8px; background: linear-gradient(90deg, #826225 0%, #B08D4A 55%, #DDC9A0 100%); }
  .frame { padding: 70px 84px; height: 622px; display: flex; flex-direction: column; }
  .overline { font-family: Arial, Helvetica, sans-serif; font-size: 19px; letter-spacing: 0.16em; text-transform: uppercase; color: #826225; font-weight: 700; }
  .wordmark { font-family: Arial, Helvetica, sans-serif; font-weight: 800; font-size: 116px; line-height: 1.0; letter-spacing: -0.02em; color: #1A1A17; margin-top: 26px; }
  .wordmark .metrik { color: #826225; }
  .tagline { font-size: 38px; line-height: 1.32; color: #2A2A25; margin-top: 30px; max-width: 940px; }
  .rule { height: 2px; background: #54544B; opacity: 0.18; margin-top: auto; }
  .foot { display: flex; justify-content: space-between; align-items: baseline; margin-top: 26px; }
  .url { font-family: Arial, Helvetica, sans-serif; font-size: 26px; font-weight: 700; color: #1A1A17; }
  .claim { font-family: Arial, Helvetica, sans-serif; font-size: 23px; color: #6E6E64; }
</style></head><body>
  <div class="topbar"></div>
  <div class="frame">
    <div class="overline">Schweizer Recht · regelbasiert</div>
    <div class="wordmark">Lex<span class="metrik">Metrik</span></div>
    <div class="tagline">Fristen, Beträge und Zuständigkeiten berechnen — Rechtsdokumente aus geprüften Bausteinen erstellen. Jede Norm direkt mit dem Gesetzestext verlinkt.</div>
    <div class="rule"></div>
    <div class="foot"><div class="url">lexmetrik.vercel.app</div><div class="claim">Feste Regeln statt Sprachmodell</div></div>
  </div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(HTML, { waitUntil: 'load' });
await page.screenshot({ path: ZIEL, clip: { x: 0, y: 0, width: 1200, height: 630 } });
await browser.close();
console.log(`OK  ${ZIEL} (1200×630)`);
