import { test, expect, type Page } from '@playwright/test';

// W2·5d G2b — Kopf-Zusammenführung + «Zitat kopieren» (A27: Sticky Section-
// Kontextkopf entfernt — Orientierung im Inhalts-Kopf, Zitat je Artikel).
// Der Reader liefert prerendertes Crawler-HTML → auf den Client-Takeover warten
// (die Options-Leiste existiert NUR im React-DOM), bevor geprüft wird. BV ist ein
// kleiner, ABER geschachtelter Erlass (Guide + 2-Spalten-Lesemodus) — CI-fest.
async function warteReader(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await expect(page.getByRole('button', { name: 'Ansicht' }).first()).toBeVisible({ timeout: 20000 });
  await expect(page.locator('#art-1').first()).toBeVisible({ timeout: 20000 });
}

test('Kopf-Zusammenführung + A26: EIN <header> (Overline/Titel), «Ansicht»-Dropdown in der immer sichtbaren Positionsleiste', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BV');
  // Genau EIN Leser-Kopf (kein duplizierter Block): der <header> mit der Overline.
  const header = page.locator('.lc-leser > header');
  await expect(header).toHaveCount(1);
  await expect(header.getByText('Bundesverfassung', { exact: false }).first()).toBeTruthy();
  // A26 (David 11.7.2026): das «Ansicht»-Dropdown ist AUS dem weggescrollenden
  // Erlass-Kopf in die IMMER sichtbare Positions-/Kontextleiste (Inhalts-Kopf mit
  // Brotkrümel) gewandert — damit die Darstellungsoptionen jederzeit erreichbar
  // sind, während man im Gesetz ist. Im Kopf steht es daher nicht mehr.
  await expect(header.getByRole('button', { name: 'Ansicht' })).toHaveCount(0);
  const leiste = page.locator('div.sticky', { has: page.locator('nav[aria-label="Brotkrümel"]') });
  const ansicht = leiste.getByRole('button', { name: 'Ansicht' });
  await expect(ansicht).toBeVisible();
  await expect(ansicht).toHaveAttribute('aria-expanded', 'false');
  await ansicht.click();
  await expect(ansicht).toHaveAttribute('aria-expanded', 'true');
  await expect(leiste.locator('[aria-label="Darstellungsoptionen"]')).toBeVisible();
});

// U-KOPF/A4 a11y: das «Ansicht»-Dropdown ist eine ehrliche Disclosure (kein
// role=menu) mit Fokus-Falle, Escape-Schliessen und Fokus-Rückgabe an den
// Auslöser (useDialogFokus). Der Trigger trägt aria-expanded + aria-controls.
test('A4 «Ansicht»-Dropdown: Öffnen fokussiert den Inhalt, Escape schliesst + gibt Fokus zurück', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BV');
  const trigger = page.getByRole('button', { name: 'Ansicht' }).first();
  await expect(trigger).toHaveAttribute('aria-controls', /.+/);
  await trigger.click();
  const gruppe = page.locator('[aria-label="Darstellungsoptionen"]').first();
  await expect(gruppe).toBeVisible();
  // Fokus ist beim Öffnen in das Panel gewandert (erstes fokussierbares Element).
  const fokusImPanel = await page.evaluate(() => {
    const g = document.querySelector('[aria-label="Darstellungsoptionen"]');
    return g != null && g.contains(document.activeElement);
  });
  expect(fokusImPanel).toBe(true);
  // Escape schliesst und gibt den Fokus an den Auslöser zurück.
  await page.keyboard.press('Escape');
  await expect(gruppe).toBeHidden();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(await trigger.evaluate((el) => el === document.activeElement)).toBe(true);
});

// A27 (David 12.7.2026): die Tests des Sticky Section-Kontextkopfs (Standort-
// Anzeige, klickbare A3-Breadcrumbs, @1024-Overflow-Schutz) sind entfernt — die
// Komponente wurde gestrichen. Die Orientierung trägt seit A26 der immer
// sichtbare Inhalts-Kopf (siehe Test oben: nav[aria-label="Brotkrümel"]); die
// «Zitat kopieren»-Aktion lebt je Artikel im ArtikelLeser (unten geprüft).

// P1-d — Currency-Chips im Leser-Kopf (Moat-Hebel 3). Der Chip steht schon im
// prerenderten Kopf (CLS=0) UND im React-Kopf (geteilte Komponente ErlassLeserKopf,
// beide Leser-Instanzen). BV ist aktuell + hat eine künftige Fassung → beide Chips;
// BKV ist aktuell ohne künftige Fassung → nur der geprüft-Chip.
test('Currency-Chips: «geltend geprüft am … (maschinell)» + «nächste Fassung ab …» (BV)', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BV');
  const header = page.locator('.lc-leser > header');
  await expect(header.getByText(/geltend geprüft am \d{2}\.\d{2}\.\d{4} \(maschinell\)/)).toBeVisible();
  await expect(header.getByText(/nächste Fassung ab \d{2}\.\d{2}\.\d{4}/)).toBeVisible();
  // §8: kein «gültig»/«verifiziert» als eigenes Wort ausserhalb der zugelassenen Formel.
  await expect(header.getByText(/\bgültig\b/)).toHaveCount(0);
  await expect(header.getByText(/\bverifiziert\b/)).toHaveCount(0);
});

test('Currency-Chip: nur geprüft-Chip ohne künftige Fassung (BKV)', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BKV');
  const header = page.locator('.lc-leser > header');
  await expect(header.getByText(/geltend geprüft am \d{2}\.\d{2}\.\d{4} \(maschinell\)/)).toBeVisible();
  await expect(header.getByText(/nächste Fassung ab/)).toHaveCount(0);
});

test('Currency-Chips brechen mobil @390 um — kein horizontaler Seiten-Overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await warteReader(page, '/gesetze/bund/BV');
  await expect(page.locator('.lc-leser > header').getByText(/geltend geprüft am/)).toBeVisible();
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow).toBe(false);
});

test('«Zitat kopieren»: deterministisches Zitat (Kürzel + SR + Stand) in die Zwischenablage', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.setViewportSize({ width: 1440, height: 900 });
  await warteReader(page, '/gesetze/bund/BV#art-8');
  await page.locator('#art-8').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  // A27: die «Zitat kopieren»-Aktion steht je Artikel in der Artikelnummer-Zeile
  // (ArtikelLeser) — identisches baueZitat-Voll-Zitat wie zuvor im Kontextkopf.
  await page.locator('#art-8').getByRole('button', { name: /Zitat kopieren:/ }).click();
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  // Deterministisches Format: «… BV, SR 101 (Stand dd.mm.yyyy)».
  expect(clip).toContain('BV');
  expect(clip).toContain('SR 101');
  expect(clip).toMatch(/\(Stand \d{2}\.\d{2}\.\d{4}\)/);
});
