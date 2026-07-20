import { test, expect, type Page } from '@playwright/test';
import { clsBeobachtenInstallieren, clsAuslesen, clsHoehenSamplerVorabInstallieren } from './helpers/cls';

// G-HIST-UI — «Gilt seit»-Badge + aufklappbare Fassungs-Timeline aus dem erlass-
// lokalen Historie-Shard (public/normtext/historie/<KEY>.json, G-HIST #286).
//   · Badge zeigt das In-Kraft-Datum der aktuellen Fassung eines Artikels mit
//     bekannter Historie (BGBM Art. 2 → «Gilt seit 01.01.2025»).
//   · Timeline klappt auf und listet die amtlichen Fassungs-Ereignisse.
//   · Artikel ohne Historie-Eintrag (BGBM Art. 6) → KEIN Badge (§8).
//   · Erlass ohne Shard (CISG, Staatsvertrag) → nirgends ein Badge.
//   · CLS: Timeline-Aufklappen (echter Input) verursacht keinen Shift; der
//     Badge-Einwuchs am Artikel-Fuss hält das Lade-CLS im Budget (§15.2).

async function warteReader(page: Page, url: string, artId: string): Promise<void> {
  await page.goto(url);
  await expect(page.getByRole('button', { name: 'Ansicht' }).first()).toBeVisible({ timeout: 20000 });
  await expect(page.locator(`#${artId}`)).toBeVisible({ timeout: 20000 });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(200);
}

test('Badge zeigt das In-Kraft-Datum der aktuellen Fassung (BGBM Art. 2)', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BGBM', 'art-2');
  const art = page.locator('#art-2');
  await art.scrollIntoViewIfNeeded();
  const zeile = art.locator('[data-historie-zeile]');
  // Der Badge wächst mit dem idle-Shard-Resolve ein (below-fold).
  await expect(zeile).toBeVisible({ timeout: 15000 });
  await expect(zeile.getByText('Fassung', { exact: true })).toBeVisible();
  await expect(zeile.getByRole('button', { name: /Gilt seit\s+01\.01\.2025/ })).toBeVisible();
});

test('Timeline klappt auf und listet Fassungs-Ereignisse; Aufklappen ohne CLS', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BGBM', 'art-2');
  const art = page.locator('#art-2');
  await art.scrollIntoViewIfNeeded();
  const badge = art.getByRole('button', { name: /Gilt seit/ });
  await expect(badge).toBeVisible({ timeout: 15000 });
  await expect(badge).toHaveAttribute('aria-expanded', 'false');

  // CLS-Beobachter NUR für den Toggle (input-exkludiert → muss 0 bleiben, wie K-2).
  await page.evaluate(() => {
    (window as unknown as { __cls: number }).__cls = 0;
    new PerformanceObserver((l) => {
      for (const e of l.getEntries() as PerformanceEntry[]) {
        const s = e as unknown as { value: number; hadRecentInput: boolean };
        if (!s.hadRecentInput) (window as unknown as { __cls: number }).__cls += s.value;
      }
    }).observe({ type: 'layout-shift' });
  });

  await badge.click();
  await expect(badge).toHaveAttribute('aria-expanded', 'true');
  // Aufgeklappte Timeline: die Ereignis-Liste ist da und trägt ≥1 datierten Eintrag.
  const liste = art.locator('ol[id^="hist-"]');
  await expect(liste).toBeVisible();
  await expect(liste.locator('li').first()).toBeVisible();
  await expect(liste.getByText(/in Kraft seit\s+01\.01\.2025/).first()).toBeVisible();

  // Wieder einklappen.
  await badge.click();
  await expect(badge).toHaveAttribute('aria-expanded', 'false');
  await expect(liste).toBeHidden();

  const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
  expect(cls, 'CLS über das Timeline-Auf-/Zuklappen muss 0 sein').toBe(0);
});

test('Artikel ohne Historie-Eintrag zeigt kein Badge (BGBM Art. 6)', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BGBM', 'art-6');
  const art = page.locator('#art-6');
  await art.scrollIntoViewIfNeeded();
  // Shard ist geladen (Art. 2 hat ein Badge), aber Art. 6 trägt keinen Eintrag.
  await expect(page.locator('#art-2 [data-historie-zeile]')).toBeVisible({ timeout: 15000 });
  await expect(art.locator('[data-historie-zeile]')).toHaveCount(0);
});

test('Erlass ohne Historie-Shard zeigt nirgends ein Badge (CISG)', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/CISG', 'art-1');
  // Kurz warten, damit ein etwaiger (hier 404-) Shard-Fetch sicher durch ist.
  await page.waitForTimeout(1500);
  await expect(page.locator('[data-historie-zeile]')).toHaveCount(0);
});

test('Lade-CLS mit Badge-Einwuchs bleibt im Budget (§15.2)', async ({ page }) => {
  await clsHoehenSamplerVorabInstallieren(page);
  await page.goto('/gesetze/bund/BGBM');
  await clsBeobachtenInstallieren(page, true);
  await expect(page.getByRole('button', { name: 'Ansicht' }).first()).toBeVisible({ timeout: 20000 });
  await expect(page.locator('#art-1')).toBeVisible({ timeout: 20000 });
  await page.evaluate(() => document.fonts?.ready);
  // Badge idle-eingewachsen abwarten, damit sein Beitrag mitgemessen ist.
  await expect(page.locator('#art-1 [data-historie-zeile]')).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(400);
  const { cls, bericht } = await clsAuslesen(page);
  // Budget wie der Lighthouse-perf-budget-Gate (0.05); der Badge sitzt below-fold
  // am Artikel-Fuss und darf das erste Viewport nicht merklich verschieben.
  expect(cls, `Lade-CLS über Budget — ${bericht}`).toBeLessThan(0.05);
});
