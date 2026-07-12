import { test, expect, type Page } from '@playwright/test';

// W2·5d U-KOPF — A9-Querschnitt (Bedienbarkeit + Flüssigkeit unter CPU-Throttle).
// Beweist, dass die Kopf-Interaktionen (A4 «Ansicht»-Dropdown öffnen +
// Switches togglen, Gliederungs-/TOC-Sprung) auch gedrosselt ohne spürbaren Lag
// laufen und KEINEN Layout-Shift verursachen (CLS 0). Drossel wie #163:
// CI = 4× (2-Kern-Runner), lokal 6×. BV#art-8: klein, aber geschachtelt (Guide +
// 2-Spalten-Lesemodus mit TOC) → deckt die A-Punkte ab. A27: der In-Erlass-
// Kontextkopf/Breadcrumb ist entfernt, der Sprung-Schritt nutzt die TOC.
const DROSSEL = process.env.CI ? 4 : 6;

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });
  page.on('pageerror', (e) => fehler.push(String(e)));
  return fehler;
}

test('A9: «Ansicht»-Dropdown + Gliederungs-Sprung flüssig unter CPU-Throttle, CLS 0', async ({ page }) => {
  const fehler = fehlerSammeln(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  const client = await page.context().newCDPSession(page);
  await client.send('Emulation.setCPUThrottlingRate', { rate: DROSSEL });

  await page.goto('/gesetze/bund/BV#art-8');
  const trigger = page.getByRole('button', { name: 'Ansicht' }).first();
  await expect(trigger).toBeVisible({ timeout: 20000 });
  await expect(page.locator('#art-8')).toBeVisible({ timeout: 20000 });
  await page.locator('#art-8').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400); // Scroll-Spy den Pfad setzen lassen

  // CLS-Beobachter für den GESAMTEN Interaktionsfluss (nur künftige Shifts; jede
  // toggle-/klick-getriebene Verschiebung liegt binnen 500 ms nach Input =
  // input-exkludiert → darf 0 bleiben).
  await page.evaluate(() => {
    (window as unknown as { __cls: number }).__cls = 0;
    new PerformanceObserver((l) => {
      for (const e of l.getEntries() as PerformanceEntry[]) {
        const s = e as unknown as { value: number; hadRecentInput: boolean };
        if (!s.hadRecentInput) (window as unknown as { __cls: number }).__cls += s.value;
      }
    }).observe({ type: 'layout-shift' });
  });

  // A4: Dropdown öffnen (Budget grosszügig, gedrosselt).
  let t0 = Date.now();
  await trigger.click();
  const gruppe = page.locator('[aria-label="Darstellungsoptionen"]').first();
  await expect(gruppe).toBeVisible({ timeout: 8000 });
  expect(Date.now() - t0, 'Dropdown öffnen zu langsam').toBeLessThan(5000);

  // A4: die drei Switches togglen — jeder reagiert ohne Hänger.
  for (const name of ['Fussnoten', 'Linien', 'Verweise'] as const) {
    t0 = Date.now();
    const sw = gruppe.getByRole('switch', { name });
    const vorher = await sw.getAttribute('aria-checked');
    await sw.click();
    await expect(sw).not.toHaveAttribute('aria-checked', vorher ?? '', { timeout: 8000 });
    expect(Date.now() - t0, `Switch «${name}» zu langsam`).toBeLessThan(5000);
  }

  // Dropdown schliessen (Escape), dann Gliederungs-Sprung: TOC-Klick springt
  // flüssig (A27: der In-Erlass-Kontextkopf/Breadcrumb ist entfernt — der
  // verbliebene In-Seiten-Sprung ist die TOC-Gliederung, springeZuSektion).
  await page.keyboard.press('Escape');
  await expect(gruppe).toBeHidden();
  const glied = page.locator('[data-toc] [data-toc-aktiv]').first();
  await expect(glied).toBeVisible();
  t0 = Date.now();
  await glied.click();
  await page.waitForTimeout(600);
  expect(Date.now() - t0, 'Gliederungs-Sprung zu langsam').toBeLessThan(5000);

  await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });

  // CLS über den gesamten Fluss == 0.
  const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
  expect(cls, 'CLS über Dropdown/Toggle/Breadcrumb muss 0 sein').toBe(0);
  // Keine Konsolen-/Laufzeitfehler.
  expect(fehler).toEqual([]);
});
