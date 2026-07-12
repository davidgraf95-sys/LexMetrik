import { test, expect, type Page } from '@playwright/test';

// FAHRPLAN-GESETZESDARSTELLUNG-V2 — koordinierter Kopf-PR (A22/A23, David 10.7.2026):
//   · K-1  «in Kraft seit …» in der Meta-Zeile (Ur-Inkrafttreten, Fedlex
//          dateEntryInForce, build-time projiziert ⇒ CLS 0); nur Bund.
//   · K-2  Fussnoten-Chip im Kopf: Zähler N + echter Toggle (aria-pressed) +
//          Apparat-Sprung bei Einschalten; CLS 0 beim Toggle.
//   · B-1  «Entscheide»-Schalter im Ansicht-Dropdown blendet die BGE-Leitfall-
//          Zeilen aus (rein CSS via data-leitfaelle, kein Re-Render).
//   · B-2  Zeitraum-Wahl «alle · 20 · 10 · 5 J.» (Default alle), persistent.

async function warteReader(page: Page, url: string, artId: string): Promise<void> {
  await page.goto(url);
  await expect(page.getByRole('button', { name: 'Ansicht' }).first()).toBeVisible({ timeout: 20000 });
  await expect(page.locator(`#${artId}`)).toBeVisible({ timeout: 20000 });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(200);
}

async function ansichtOeffnen(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Ansicht' }).first().click();
  await expect(page.locator('[aria-label="Darstellungsoptionen"]').first()).toBeVisible();
}

test('K-1: «in Kraft seit» in der Meta-Zeile (Bund), nicht beim Kanton', async ({ page }) => {
  // Bund BGBM: Ur-Inkrafttreten 01.07.1996 (Fedlex dateEntryInForce), distinkt vom Stand.
  await warteReader(page, '/gesetze/bund/BGBM', 'art-1');
  const zeile = page.getByText(/in Kraft seit\s+01\.07\.1996/);
  await expect(zeile).toBeVisible({ timeout: 15000 });
});

test('K-2: Fussnoten-Chip im Kopf — Zähler + Toggle (aria-pressed), CLS 0 beim Umschalten', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BGBM', 'art-1');
  // Der Chip trägt einen Zähler (aria-label «N Fussnoten — …») und ist role=button
  // (der gleichnamige Dropdown-Schalter ist role=switch → wird nicht mitgefangen).
  const chip = page.getByRole('button', { name: /^\d+ Fussnoten/ });
  await expect(chip).toBeVisible({ timeout: 15000 });
  await expect(chip).toHaveAttribute('aria-pressed', 'true'); // Default: Fussnoten an

  const marker = page.locator('.lc-leser button[aria-label^="Fussnote"]').first();
  await expect(marker).toBeVisible();

  // CLS-Beobachter (nur künftige Shifts): der toggle-getriebene Reflow liegt binnen
  // 500 ms nach dem Klick (input-exkludiert) und darf 0 bleiben.
  await page.evaluate(() => {
    (window as unknown as { __cls: number }).__cls = 0;
    new PerformanceObserver((l) => {
      for (const e of l.getEntries() as PerformanceEntry[]) {
        const s = e as unknown as { value: number; hadRecentInput: boolean };
        if (!s.hadRecentInput) (window as unknown as { __cls: number }).__cls += s.value;
      }
    }).observe({ type: 'layout-shift' });
  });

  // AUS: Chip aria-pressed=false, data-fussnoten=aus, Marker verschwunden (display:none).
  await chip.click();
  await expect(chip).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('html')).toHaveAttribute('data-fussnoten', 'aus');
  await expect(marker).toBeHidden();

  // AN zurück: Marker wieder sichtbar (Wiederherstellung).
  await chip.click();
  await expect(chip).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('html')).toHaveAttribute('data-fussnoten', 'an');
  await expect(marker).toBeVisible();

  const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
  expect(cls, 'CLS über den Fussnoten-Chip-Toggle muss 0 sein').toBe(0);
});

// B-1/B-2 laufen bewusst auf dem KLEINEN ELG (~78 KB Snapshot, Leitfall-Shard mit
// BGE an Art. 10) statt auf dem 1686-Artikel-OR: dessen Client-Takeover starvte den
// gedrosselten 2-Kern-CI-Runner ins 30s-Timeout (CI-Run 29139277748, dieselbe Lehre
// wie leser-optionen → BGBM, CI-Befund 4.7.2026). Die Toggle-/Filter-Semantik ist
// seitengrössen-unabhängig (Attribut + CSS bzw. Store).
test('B-1: «Entscheide»-Schalter blendet die Leitfall-Zeilen aus (data-leitfaelle, kein Re-Render)', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/ELG', 'art-1');
  const art = page.locator('#art-10');
  await art.scrollIntoViewIfNeeded();
  const zeile = art.getByText('Leitfälle', { exact: true });
  await expect(zeile).toBeVisible({ timeout: 15000 });

  await ansichtOeffnen(page);
  const schalter = page.getByRole('switch', { name: 'Entscheide' });
  await expect(schalter).toHaveAttribute('aria-checked', 'true'); // Default an

  // AUS: html-Attribut gesetzt, Leitfall-Zeile per CSS ausgeblendet (Text bleibt im DOM).
  await schalter.click();
  await expect(page.locator('html')).toHaveAttribute('data-leitfaelle', 'aus');
  await expect(zeile).toBeHidden();

  // AN zurück: Zeile wieder sichtbar.
  await schalter.click();
  await expect(page.locator('html')).toHaveAttribute('data-leitfaelle', 'an');
  await expect(zeile).toBeVisible();
});

test('B-2: Zeitraum-Wahl «alle · 20 · 10 · 5 J.» — aria-pressed + Persistenz', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/ELG', 'art-1');
  await ansichtOeffnen(page);
  const gruppe = page.locator('[aria-label="Zeitraum der Entscheide"]');
  await expect(gruppe).toBeVisible();
  // Default: «alle» aktiv.
  await expect(gruppe.getByRole('button', { name: 'alle' })).toHaveAttribute('aria-pressed', 'true');

  // «5 J.» wählen → aktiv, «alle» nicht mehr; persistiert in localStorage.
  await gruppe.getByRole('button', { name: '5 J.' }).click();
  await expect(gruppe.getByRole('button', { name: '5 J.' })).toHaveAttribute('aria-pressed', 'true');
  await expect(gruppe.getByRole('button', { name: 'alle' })).toHaveAttribute('aria-pressed', 'false');
  const ls = await page.evaluate(() => localStorage.getItem('lm.leser.optionen'));
  expect(ls).toContain('"zeitraum":"5"');
});
