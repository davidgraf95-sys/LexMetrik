import { test, expect, type Page } from '@playwright/test';

// W2·5d G2a — Leser-Options-Leiste (Linien/Fussnoten/Verweise): reine data-*-/
// CSS-Toggles am <html>, persistent (localStorage) + Pre-Paint (main.tsx, CSP-
// konform ohne Inline-Script). Belegt R6 (Grundzustand = heutige Darstellung,
// Toggle rein CSS) und R9 (Fussnoten-«AUS» DÄMPFT, versteckt NIE — Ctrl+F/
// Screenreader/Print bleiben). Positiv UND negativ (AN sichtbar ↔ AUS reduziert).
//
// Der Reader liefert prerendertes Crawler-HTML → auf den Client-Takeover
// (#art-…) warten, bevor gemessen wird.

async function warteReader(page: Page, url: string, artId: string): Promise<void> {
  await page.goto(url);
  await expect(page.locator(`#${artId}`)).toBeVisible();
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(200);
}

/** Farbe/Breite/Padding der ersten gerenderten Guide-Kante über einem Artikel. */
async function guide(page: Page, artId: string) {
  return page.evaluate((id) => {
    let el: HTMLElement | null = document.getElementById(id)?.parentElement ?? null;
    while (el) {
      if (el.matches('section[data-normtext-linie]')) {
        const cs = getComputedStyle(el);
        if (cs.borderLeftStyle !== 'none' && parseFloat(cs.borderLeftWidth) > 0) {
          return { color: cs.borderLeftColor, width: cs.borderLeftWidth, padding: cs.paddingLeft };
        }
      }
      el = el.parentElement;
    }
    return null;
  }, artId);
}

test('Options-Leiste: drei role=switch, Grundzustand aria-checked=true + data-*=an', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/ZGB#art-684', 'art-684');
  const gruppe = page.locator('[aria-label="Darstellungsoptionen"]').first();
  await expect(gruppe).toBeVisible();
  await expect(gruppe.getByRole('switch')).toHaveCount(3); // ZGB geschachtelt → Linien sichtbar
  for (const name of ['Linien', 'Fussnoten', 'Verweise']) {
    await expect(gruppe.getByRole('switch', { name })).toHaveAttribute('aria-checked', 'true');
  }
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-linien', 'an');
  await expect(html).toHaveAttribute('data-fussnoten', 'an');
  await expect(html).toHaveAttribute('data-verweise', 'an');
});

test('Linien-Toggle: AN sichtbar → AUS transparent (Guide bleibt im DOM), persistiert über Reload', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/ZGB#art-684', 'art-684');

  // POSITIV: Grundzustand zeigt die Guide-Linie (nicht transparent).
  const an = await guide(page, 'art-684');
  expect(an, 'Guide-Kante im Grundzustand vorhanden').not.toBeNull();
  expect(an!.color).not.toBe('rgba(0, 0, 0, 0)');

  // NEGATIV: «Linien» AUS → Attribut gesetzt, Kante transparent, aber Element
  // (border-Breite > 0) BLEIBT — kein Textknoten bewegt, kein display-Wechsel.
  await page.getByRole('switch', { name: 'Linien' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-linien', 'aus');
  const aus = await guide(page, 'art-684');
  expect(aus, 'Guide-Container bleibt strukturell erhalten').not.toBeNull();
  expect(parseFloat(aus!.width)).toBeGreaterThan(0);
  expect(aus!.color).toBe('rgba(0, 0, 0, 0)'); // transparent
  expect(aus!.padding).toBe('0px'); // Einzug kollabiert (flach)

  // Persistenz + Pre-Paint: Reload stellt data-linien=aus wieder her.
  const ls = await page.evaluate(() => localStorage.getItem('lm.leser.optionen'));
  expect(ls).toContain('"linien":"aus"');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-linien', 'aus');
  await expect(page.locator('#art-684')).toBeVisible();
  const nachReload = await guide(page, 'art-684');
  expect(nachReload!.color).toBe('rgba(0, 0, 0, 0)'); // kein Flash: bleibt aus
});

test('Fussnoten-Toggle: AUS DÄMPFT die Marker, versteckt sie NIE (R9 — Ctrl+F/Screenreader)', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/OR#art-1', 'art-1');

  // Fussnoten-Apparat einschalten, damit die amtlichen Marker rendern (Apparat
  // ist Fedlex-treu default aus — DESIGN-REGLEMENT-NORMTEXT §4).
  await page.locator('button[title="Fussnoten ein-/ausblenden"]').first().click();
  const marker = page.locator('.lc-leser button[aria-label^="Fussnote"]').first();
  await expect(marker).toHaveCount(1);
  await marker.scrollIntoViewIfNeeded();

  // POSITIV: Grundzustand (data-fussnoten=an) → Marker voll sichtbar.
  expect(parseFloat(await marker.evaluate((el) => getComputedStyle(el).opacity))).toBeGreaterThan(0.9);

  // NEGATIV: «Fussnoten» AUS → gedämpft, ABER niemals display:none (R9).
  await page.getByRole('switch', { name: 'Fussnoten' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-fussnoten', 'aus');
  await marker.scrollIntoViewIfNeeded();
  expect(await marker.evaluate((el) => getComputedStyle(el).display)).not.toBe('none');
  expect(await marker.evaluate((el) => getComputedStyle(el).visibility)).not.toBe('hidden');
  expect(parseFloat(await marker.evaluate((el) => getComputedStyle(el).opacity))).toBeLessThan(1);
  // Der Marker-Text (die Fussnoten-Nummer) bleibt für Ctrl+F erhalten.
  expect((await marker.textContent())?.trim().length ?? 0).toBeGreaterThan(0);
});

test('Verweise-Toggle: AUS unterdrückt die (dotted) Link-Unterstreichung, der Link bleibt', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/OR#art-1', 'art-1');
  const link = page.locator('.lc-leser .decoration-dotted').first();
  const anzahl = await page.locator('.lc-leser .decoration-dotted').count();
  test.skip(anzahl === 0, 'kein Verweis-Link auf dieser Seite');

  await link.scrollIntoViewIfNeeded();
  // POSITIV: Grundzustand → :hover unterstreicht (heutiges Verhalten).
  await link.hover();
  expect(await link.evaluate((el) => getComputedStyle(el).textDecorationLine)).toContain('underline');

  // NEGATIV: «Verweise» AUS → keine Unterstreichung, aber Link (href/Klick) bleibt.
  await page.getByRole('switch', { name: 'Verweise' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-verweise', 'aus');
  await link.hover();
  expect(await link.evaluate((el) => getComputedStyle(el).textDecorationLine)).toBe('none');
});
