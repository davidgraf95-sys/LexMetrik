import { test, expect } from '@playwright/test';

// R4 (W2·5d G1 / DESIGN-REGLEMENT-NORMTEXT §Linien-Kanon Regel 1): der Gliederungs-
// Guide stapelt sich NICHT — pro Artikel rendert HÖCHSTENS EINE vertikale
// Guide-Linie, egal wie tief er verschachtelt ist (früher: bis ~6 gestapelte
// border-l = «Barcode/Gleisbett», ZGB Art. 684 / OR Art. 319). Tiefe trägt der
// Einzug, nicht eine zweite Linie.
//
// Gemessen wird marker-scoped: nur `section[data-normtext-linie]`-Vorfahren mit
// tatsächlich gerenderter linker Kante zählen (Chrome-/Brass-/Tabellen-Borders
// tragen keinen Marker und bleiben aussen vor). Der Reader liefert prerendertes
// HTML → erst auf den Client-Takeover (#art-…) warten.

async function guideKanten(page: import('@playwright/test').Page, artId: string): Promise<number> {
  return page.evaluate((id) => {
    const art = document.getElementById(id);
    if (!art) return -1;
    let n = 0;
    let el: HTMLElement | null = art.parentElement;
    while (el) {
      if (el.matches('section[data-normtext-linie]')) {
        const cs = getComputedStyle(el);
        if (cs.borderLeftStyle !== 'none' && parseFloat(cs.borderLeftWidth) > 0) n++;
      }
      el = el.parentElement;
    }
    return n;
  }, artId);
}

test('ZGB Art. 684: höchstens EINE Guide-Linie trotz tiefer Schachtelung', async ({ page }) => {
  await page.goto('/gesetze/bund/ZGB#art-684');
  await expect(page.locator('#art-684')).toBeVisible();
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(300);
  const n = await guideKanten(page, 'art-684');
  expect(n, 'art-684 gefunden').toBeGreaterThanOrEqual(0);
  expect(n, `Guide-Kanten um Art. 684 (${n}) muss ≤ 1 sein`).toBeLessThanOrEqual(1);
});

test('OR Art. 319: höchstens EINE Guide-Linie', async ({ page }) => {
  await page.goto('/gesetze/bund/OR#art-319');
  await expect(page.locator('#art-319')).toBeVisible();
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(300);
  const n = await guideKanten(page, 'art-319');
  expect(n, `Guide-Kanten um Art. 319 (${n}) muss ≤ 1 sein`).toBeLessThanOrEqual(1);
});
