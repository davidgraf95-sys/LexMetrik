import { test, expect, type Page } from '@playwright/test';

// E6/A37 (David 16.7.2026, §10.10) — «Ingesamt gib dem Gesetz mehr platz. Zitat
// Links ist auch sehr weit rechts. Nutze den Platz der zur Verfügung steht.
// Beachte aber verschiedene Bildschirmbreiten.»
//
// Ist-Befund vor E6: im 2-Spalten-Layout (istXl ≥ 1024) war die Lese-Zelle ~784px
// breit, der Fliesstext aber auf `max-w-reading` (640px) LINKS-bündig gedeckelt →
// ~144px toter Steg RECHTS. Die Artikel-Kopfzeile (Art. N · Zitat/Link) war NICHT
// gedeckelt und floss `ml-auto` bis an die Zell-Rechtskante → der «Zitat»-Link
// stand ~110–144px rechts NEBEN der Textkante, im Leerraum.
//
// Fix: die Lesespalte des Readers läuft auf `max-w-normtext` (42rem ≈ 672px ≈
// 70–72 ch, unter der ≤ 75-ch-Decke, s. leser-lesemass.e2e) und ist STETS
// zentriert (mx-auto). Kopfzeile UND Fliesstext teilen sich dieselbe Breite →
// «Zitat/Link» fluchtet bündig mit der rechten Textkante, die Restbreite der
// 2-Spalten-Zelle verteilt sich symmetrisch (kein einseitiger toter Steg).
//
// Der Reader liefert PRERENDERTES HTML, React ersetzt es nach dem Fetch
// (render-then-replace) → erst auf #art-1 warten.

const BREITEN = [390, 768, 1024, 1440, 1920] as const;

async function ladeReader(page: Page, key: string): Promise<void> {
  await page.goto(`/gesetze/bund/${key}`);
  await expect(page.locator('#art-1')).toBeVisible({ timeout: 20000 });
  await page.evaluate(() => document.fonts?.ready);
  await page.evaluate(() => window.scrollTo(0, 300));
  await page.waitForTimeout(300);
}

// Geometrie des ersten Artikels: rechte Kante der Zitat/Link-Aktionsgruppe (der
// `ml-auto`-Span, Elternknoten des «Zitat»-Knopfs) gegen die rechte Kante des
// Fliesstext-Blocks (`.max-w-normtext`) und die Lesespalte selbst.
async function ersterArtikelGeo(page: Page) {
  return page.evaluate(() => {
    const art = document.querySelector('article[id^="art-"]');
    if (!art) return null;
    const btn = Array.from(art.querySelectorAll('button')).find(
      (b) => (b.getAttribute('aria-label') ?? '').startsWith('Zitat kopieren'),
    );
    const gruppe = btn?.parentElement ?? null; // der ml-auto-Aktions-Span
    const body = art.querySelector('.max-w-normtext');
    const spalte = art.closest('.group\\/lese') ?? document.querySelector('[class*="group/lese"]');
    const R = (el: Element | null) => (el ? el.getBoundingClientRect() : null);
    const g = R(gruppe);
    const b = R(body);
    const s = R(spalte);
    if (!g || !b || !s) return null;
    return {
      gruppeRight: Math.round(g.right),
      textRight: Math.round(b.right),
      textWidth: Math.round(b.width),
      spalteLeft: Math.round(s.left),
      spalteRight: Math.round(s.right),
      maxWidth: getComputedStyle(spalte as Element).maxWidth,
    };
  });
}

test.describe('E6/A37 — Zitat-Link fluchtet mit der Textkante (kein toter Steg rechts)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  for (const key of ['OR', 'ZGB'] as const) {
    test(`${key}: «Zitat/Link»-Gruppe steht bündig zur rechten Textkante`, async ({ page }) => {
      await ladeReader(page, key);
      const geo = await ersterArtikelGeo(page);
      expect(geo, `${key}: Artikel-Geometrie messbar`).not.toBeNull();
      // Kernkorrektur A37: die Aktionsgruppe fliesst NICHT mehr weit rechts in den
      // Leerraum — ihre Rechtskante liegt praktisch auf der Textkante (früher
      // ~110–144px daneben). Toleranz klein (Sub-Pixel/Rundung).
      const diff = Math.abs(geo!.gruppeRight - geo!.textRight);
      expect(diff, `${key}: Zitat/Link-Rechtskante (${geo!.gruppeRight}) ≈ Textkante (${geo!.textRight}), Δ=${diff}px`).toBeLessThanOrEqual(4);
    });
  }

  test('OR: Lesespalte auf max-w-normtext (42rem) gedeckelt und in der 2-Spalten-Zelle zentriert', async ({ page }) => {
    await ladeReader(page, 'OR');
    const geo = await ersterArtikelGeo(page);
    expect(geo).not.toBeNull();
    // Token verankert (kein arbitrary max-w; §13/1): 42rem @ 16px-rem = 672px.
    expect(geo!.maxWidth, `Lesespalte max-width = ${geo!.maxWidth}`).toBe('672px');
    // Die Lesespalte NUTZT diese 672px auch tatsächlich (voll gedeckelt in der
    // 784px-Zelle) — 32px breiter als die knappe Standard-Lesespalte (reading
    // 40rem = 640px): die Norm hat Platz gewonnen. (Die Breite EINZELNER,
    // eingerückter Artikel liegt darunter — der Guide-Einzug pro Gliederungstiefe
    // zehrt von der Spaltenbreite; massgeblich ist die Spalte selbst.)
    const spalteBreite = geo!.spalteRight - geo!.spalteLeft;
    expect(spalteBreite, `Lesespalte-Breite ${spalteBreite}px = 672px`).toBe(672);
  });
});

test.describe('E6/A37 — kein horizontaler Overflow über die Bildschirmbreiten (390–1920)', () => {
  for (const width of BREITEN) {
    test(`OR @${width}px: kein H-Overflow, Norm sichtbar`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await ladeReader(page, 'OR');
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `OR @${width}: horizontaler Overflow ${overflow}px`).toBeLessThanOrEqual(1);
    });
  }
});
