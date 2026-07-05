import { test, expect, type Page } from '@playwright/test';

// W2·5d G3b — Anhang-Rendering (③ ERLASS_MIT_ANHANG + ⑤ STAATSVERTRAG-Protokolle),
// FAHRPLAN-GESETZES-UX.md §2.2. Reine Darstellung (§3): Anhänge (`annex_*`) und
// Staatsvertrags-Protokolle (`lvl_*`, LugÜ) rendern als eigenständig erkennbare,
// klar abgesetzte Blöcke (Struktur-Trenner + Struktur-Überschrift «Anhang N»/
// «Protokoll N …»), Tabellen in einem overflow-x-Container ohne Seiten-H-Overflow.
// Reader = prerendertes Crawler-HTML → auf den Client-Takeover warten.
async function warteReader(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await expect(page.locator('[aria-label="Darstellungsoptionen"]').first()).toBeVisible({ timeout: 20000 });
}

// ── ③ GSchV: Anhang als abgesetzter Block mit «Anhang N»-Struktur-Überschrift ──
test('③ GSchV: Anhänge rendern als abgesetzte data-anhang-Blöcke mit «Anhang N»-Überschrift', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/GSCHV');
  // Anhang-Block existiert (eigenständig erkennbar am data-anhang-Marker) …
  const anhang = page.locator('.lc-leser article[data-anhang]');
  await expect(anhang.first()).toBeVisible({ timeout: 20000 });
  expect(await anhang.count()).toBeGreaterThanOrEqual(9);
  // … der Anker bleibt #art-<token> (R8, kein neuer Anker-Namespace) …
  const ersterAnhang = page.locator('#art-annex_1');
  await expect(ersterAnhang).toHaveAttribute('data-anhang', '');
  // … und trägt «Anhang 1» als verlinkte Struktur-Überschrift (Accessible Name).
  await expect(ersterAnhang.getByRole('link', { name: /^Anhang 1$/ })).toBeVisible();
});

test('③ GSchV: die «Anhänge»-Sektion ist im Gliederungs-TOC verlinkt', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/GSCHV');
  // «Anhänge» als eigene Top-Sektion in der Gliederung (Struktur-Trenner, im TOC).
  await expect(page.locator('[data-toc]').getByRole('button', { name: /Anhänge/ }).first()).toBeVisible({ timeout: 20000 });
});

// ── ⑤ LugÜ: Protokolle als abgesetzte Struktur-Sektionen ──────────────────────
test('⑤ LugÜ: Protokolle (lvl_*) rendern als abgesetzte data-anhang-Blöcke', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/LUGUE');
  const protokoll = page.locator('#art-lvl_d1141e112');
  await expect(protokoll).toBeVisible({ timeout: 20000 });
  await expect(protokoll).toHaveAttribute('data-anhang', '');
  await expect(protokoll.getByRole('link', { name: /^Protokoll 1 über/ })).toBeVisible();
});

// ── ⑤ LugÜ Ratifikations-Tabelle: overflow-x-Container, KEIN Seiten-H-Overflow ─
test('⑤ LugÜ @390: Ratifikations-Tabelle scrollt im Container, kein Seiten-H-Overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await warteReader(page, '/gesetze/bund/LUGUE');
  // Die Ratifikations-Tabelle sitzt in einem seitlich scrollbaren overflow-x-Container.
  const tabelle = page.locator('[data-mehrspaltig][role="group"]').first();
  await expect(tabelle).toBeVisible({ timeout: 20000 });
  const overflowX = await tabelle.evaluate((el) => getComputedStyle(el).overflowX);
  expect(['auto', 'scroll']).toContain(overflowX);
  // KRITISCH (G3b-Overflow-Fix): die Seite läuft @390 NICHT horizontal über
  // (baseline war scrollWidth 790 — der Bereich-Badge der Anhang-Sektion).
  const doc = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  expect(doc.sw, 'kein horizontaler Seiten-Overflow @390').toBeLessThanOrEqual(doc.cw + 1);
});

// ── ⑤ LugÜ @1440: ebenfalls kein H-Overflow (Desktop-Regression) ──────────────
test('⑤ LugÜ @1440: kein horizontaler Seiten-Overflow', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await warteReader(page, '/gesetze/bund/LUGUE');
  await expect(page.locator('article[data-anhang]').first()).toBeVisible({ timeout: 20000 });
  const doc = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  expect(doc.sw).toBeLessThanOrEqual(doc.cw + 1);
});
