import { test, expect, type Page } from '@playwright/test';

// W2·5d G2b — Kopf-Zusammenführung + Sticky Section-Kontextkopf + «Zitat kopieren».
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

test('Sticky Section-Kontextkopf: zeigt Standort + «Zitat kopieren» (Desktop 2-Spalten)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await warteReader(page, '/gesetze/bund/BV');
  const kopf = page.locator('[data-kontext-kopf]');
  await expect(kopf).toBeVisible();
  // Trägt die «Zitat kopieren»-Aktion (aria-Label mit deterministischem Zitat).
  const zitatBtn = kopf.getByRole('button', { name: /Zitat kopieren:/ });
  await expect(zitatBtn).toBeVisible();
});

// W2·5d U-KOPF/A3 (David 5.7.2026): die Positions-Zeile ist zu ECHTEN,
// klickbaren Breadcrumbs aufgelöst — nav > ol/li, jedes Glied ein Button, das
// letzte Glied trägt aria-current="location", ein Klick springt zur Ebene.
test('A3 Breadcrumbs: klickbare nav mit aria-current; Klick auf oberstes Glied springt zur Ebene', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await warteReader(page, '/gesetze/bund/BV#art-8');
  await page.locator('#art-8').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500); // Scroll-Spy den aktiven Pfad/Artikel setzen lassen
  const nav = page.locator('[data-kontext-kopf] nav[aria-label="Standort im Erlass"]');
  await expect(nav).toBeVisible();
  // Breadcrumb-Glieder sind echte Buttons (klickbar UND tastaturbedienbar).
  const glieder = nav.getByRole('button');
  await expect(glieder.first()).toBeVisible();
  await glieder.first().focus();
  expect(await glieder.first().evaluate((el) => el === document.activeElement)).toBe(true);
  // Genau EIN Glied trägt aria-current="location" (die aktuelle Position = Artikel).
  await expect(nav.locator('li[aria-current="location"]')).toHaveCount(1);
  // Klick auf das oberste Breadcrumb-Glied springt zu dessen Sektion → die Seite
  // scrollt nach oben (art-8 liegt tiefer als die oberste Gliederungsebene).
  const vorher = await page.evaluate(() => window.scrollY);
  await glieder.first().click();
  await page.waitForTimeout(600);
  const nachher = await page.evaluate(() => window.scrollY);
  expect(nachher).toBeLessThan(vorher);
});

// A3 Overflow-Schutz: der Sticky-Positions-Kopf ist ein ≥1024px-2-Spalten-Feature
// (mobil gibt es — wie bisher — keine Sticky-Positionsleiste). An seiner schmalsten
// Render-Breite (1024) darf der Breadcrumb-Pfad nie horizontal überlaufen: die
// Label truncaten, die nav ist overflow-hidden, mittlere Glieder kollabieren
// defensiv per `hidden sm:inline-flex`.
test('A3 Breadcrumbs @1024: Pfad läuft nicht über (truncate + overflow-hidden)', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await warteReader(page, '/gesetze/bund/BV#art-8');
  await page.locator('#art-8').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await expect(page.locator('[data-kontext-kopf] nav[aria-label="Standort im Erlass"]')).toBeVisible();
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow).toBe(false);
});

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
  await page.waitForTimeout(400); // Scroll-Spy den aktiven Artikel setzen lassen
  const kopf = page.locator('[data-kontext-kopf]');
  await kopf.getByRole('button', { name: /Zitat kopieren:/ }).click();
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  // Deterministisches Format: «… BV, SR 101 (Stand dd.mm.yyyy)».
  expect(clip).toContain('BV');
  expect(clip).toContain('SR 101');
  expect(clip).toMatch(/\(Stand \d{2}\.\d{2}\.\d{4}\)/);
});
