import { test, expect, type Page } from '@playwright/test';

// W2·5d G2b — Kopf-Zusammenführung + Sticky Section-Kontextkopf + «Zitat kopieren».
// Der Reader liefert prerendertes Crawler-HTML → auf den Client-Takeover warten
// (die Options-Leiste existiert NUR im React-DOM), bevor geprüft wird. BV ist ein
// kleiner, ABER geschachtelter Erlass (Guide + 2-Spalten-Lesemodus) — CI-fest.
async function warteReader(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await expect(page.locator('[aria-label="Darstellungsoptionen"]').first()).toBeVisible({ timeout: 20000 });
  await expect(page.locator('#art-1').first()).toBeVisible({ timeout: 20000 });
}

test('Kopf-Zusammenführung: EIN <header> trägt Overline + Titel + Options-Leiste', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BV');
  // Genau EIN Leser-Kopf (kein duplizierter Block): der <header> mit der Overline.
  const header = page.locator('.lc-leser > header');
  await expect(header).toHaveCount(1);
  await expect(header.getByText('Bundesverfassung', { exact: false }).first()).toBeTruthy();
  // Die Options-Leiste sitzt IM Kopf (Kopf trägt sie für alle Grundarten gleich).
  await expect(header.locator('[aria-label="Darstellungsoptionen"]')).toBeVisible();
});

test('Sticky Section-Kontextkopf: zeigt Standort + «Zitat kopieren» (Desktop 2-Spalten)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await warteReader(page, '/gesetze/bund/BV');
  const kopf = page.locator('[data-kontext-kopf]');
  await expect(kopf).toBeVisible();
  // Trägt die «Zitat kopieren»-Aktion (aria-Label mit deterministischem Zitat).
  const zitatBtn = kopf.getByRole('button', { name: /Zitat kopieren:/ });
  await expect(zitatBtn).toBeVisible();
});

test('«Zitat kopieren»: deterministisches Zitat (Kürzel + SR + Stand) in die Zwischenablage', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.setViewportSize({ width: 1440, height: 900 });
  await warteReader(page, '/gesetze/bund/BV#art-8');
  await page.locator('#art-8').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400); // Scroll-Spy den aktiven Artikel setzen lassen
  const kopf = page.locator('[data-kontext-kopf]');
  await kopf.getByRole('button', { name: /Zitat kopieren:/ }).click();
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  // Deterministisches Format: «… BV, SR 101 (Stand dd.mm.yyyy)».
  expect(clip).toContain('BV');
  expect(clip).toContain('SR 101');
  expect(clip).toMatch(/\(Stand \d{2}\.\d{2}\.\d{4}\)/);
});
