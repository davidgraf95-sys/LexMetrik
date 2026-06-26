import { test, expect } from '@playwright/test';

// Visuelle + funktionale Verifikation der 9 Gesetze-UX-Punkte (Auftrag David
// 26.6.2026). Screenshots landen unter test-results/ux9/ zur Sichtprüfung.
const SHOT = '/private/tmp/claude-501/-Users-david/b109e112-2abc-41f2-9de0-8156251c0959/scratchpad';

test.describe('Gesetze-UX 9 Punkte', () => {
  test('P4: Gliederung/Randtitel steht VOR der Artikelnummer (Fedlex-Reihenfolge)', async ({ page }) => {
    await page.goto('/gesetze/bund/OR');
    const art = page.locator('#art-1');
    await expect(art).toBeVisible();
    // DOM-Reihenfolge: der Randtitel («Im Allgemeinen») kommt VOR «Art. 1».
    const reihenfolge = await art.evaluate((el) => {
      const txt = el.textContent ?? '';
      return { randIdx: txt.indexOf('Im Allgemeinen'), artIdx: txt.indexOf('Art. 1') };
    });
    expect(reihenfolge.randIdx).toBeGreaterThanOrEqual(0);
    expect(reihenfolge.artIdx).toBeGreaterThan(reihenfolge.randIdx);
  });

  test('Einklappen analog Fedlex: Artikel-Body klappt zu, Überschrift+Nummer bleiben', async ({ page }) => {
    await page.goto('/gesetze/bund/OR');
    const art = page.locator('#art-1');
    await expect(art).toContainText('Willensäusserung'); // Body sichtbar
    await art.getByRole('button', { name: 'Artikel einklappen' }).click();
    // Body weg, aber Artikelnummer + Randtitel bleiben sichtbar (Fedlex-treu).
    await expect(art.getByText(/durch übereinstimmende/i)).toHaveCount(0);
    await expect(art.getByText('Art. 1')).toBeVisible();
    await expect(art.getByText('Im Allgemeinen')).toBeVisible();
    // Wieder aufklappen.
    await art.getByRole('button', { name: 'Artikel ausklappen' }).click();
    await expect(art).toContainText('Willensäusserung');
  });

  test('P9: Gliederung markiert aktive Sektion beim Scrollen (Scroll-Spy)', async ({ page }) => {
    await page.goto('/gesetze/bund/OR');
    await expect(page.locator('#art-1')).toBeVisible();
    // Tief scrollen → ein aktiver TOC-Eintrag muss existieren.
    await page.evaluate(() => window.scrollTo(0, 2500));
    await page.waitForTimeout(400);
    await expect(page.locator('[data-toc-aktiv]').first()).toBeVisible();
  });

  test('P3/B: Reiter-Übersicht im Header, gruppiert (Gesetze→Bund)', async ({ page }) => {
    // Zwei Gesetze öffnen → Reiter entstehen.
    await page.goto('/gesetze/bund/OR');
    await expect(page.locator('#art-1')).toBeVisible();
    await page.goto('/gesetze/bund/ZGB');
    await expect(page.locator('article').first()).toBeVisible();
    // Übersicht aus der TOPBAR öffnen (Trigger trägt aria-label «Alle geöffneten Reiter»).
    await page.getByRole('button', { name: 'Alle geöffneten Reiter' }).click();
    const dialog = page.getByRole('dialog', { name: 'Alle geöffneten Reiter' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Gesetze', { exact: true })).toBeVisible();
    await expect(dialog.getByText('Bund', { exact: true })).toBeVisible();
    await page.screenshot({ path: `${SHOT}/p3-panel-header.png` });
  });

  test('Such-Bug: Suchleiste bleibt nach Aktivieren im Bild (nicht nach oben raus)', async ({ page }) => {
    await page.goto('/gesetze/bund/OR');
    await expect(page.locator('#art-1')).toBeVisible();
    // Tief scrollen, dann suchen → vor dem Fix rutschte der sticky-Container raus.
    await page.evaluate(() => window.scrollTo(0, 4000));
    await page.waitForTimeout(150);
    const suche = page.getByRole('searchbox', { name: 'Im Gesetz suchen' });
    await suche.fill('Vertrag');
    await page.waitForTimeout(300);
    await expect(suche).toBeInViewport();
  });

  test('Screenshots Desktop hell + dunkel', async ({ page }) => {
    await page.goto('/gesetze/bund/OR');
    await expect(page.locator('#art-1')).toBeVisible();
    await page.screenshot({ path: `${SHOT}/leser-desktop-hell.png`, fullPage: false });
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.reload();
    await expect(page.locator('#art-1')).toBeVisible();
    await page.screenshot({ path: `${SHOT}/leser-desktop-dunkel.png`, fullPage: false });
  });

  test('C: aktueller Artikel wird bei KANTONALEM Gesetz verfolgt (Reiter-Anker)', async ({ page }) => {
    await page.goto('/gesetze/kanton/BS-640.100');
    await expect(page.locator('article').first()).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 3000));
    await page.waitForTimeout(600);
    // Der geteilte Observer muss den Reiter-Pfad in localStorage mit #art-… aktualisiert haben.
    const hatAnker = await page.evaluate(() => {
      const roh = localStorage.getItem('lexmetrik-tabs');
      if (!roh) return false;
      const tabs = JSON.parse(roh) as Array<{ path: string }>;
      return tabs.some((t) => t.path.includes('/gesetze/kanton/BS-640.100') && t.path.includes('#art-'));
    });
    expect(hatAnker).toBe(true);
  });

  test('H: Absatzmarker 2bis/2ter verschieben den Text nicht (ZGB Art. 61)', async ({ page }) => {
    await page.goto('/gesetze/bund/ZGB#art-61');
    await expect(page.locator('#art-61')).toBeVisible();
    await page.waitForTimeout(300);
    await page.locator('#art-61').screenshot({ path: `${SHOT}/h-zgb-art61.png` });
  });

  test('Screenshot Mobil', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/gesetze/bund/OR');
    await expect(page.locator('#art-1')).toBeVisible();
    await page.screenshot({ path: `${SHOT}/leser-mobil-hell.png`, fullPage: false });
  });
});
