import { test, expect, type Page } from '@playwright/test';

// ─── W2·5d U-VERWEIS (A7 + A10 + A11 + A13) — Browser-Beweise ────────────────
// P2 (§10.2): (1) MWSTG Art. 5 verbatim = 5 Links (art_31/35/37/38/45);
// (2) bounded — kein Link über den Fliesstext hinaus; (3) Fremdgesetz-Signal
// geroutet; (4) Präambel-Test an BV-zitierenden Ingressen (Singular MWSTG +
// Plural ArG). A7: strukturiertes Verweis-Popover (Wortlaut → massgebliche
// Entscheide → klar abgetrennte Materialien). A9: Flüssigkeit unter CPU-Throttle
// (CI 4× / lokal 6×), CLS 0. Läuft gegen `vite preview` (dist).

const DROSSEL = process.env.CI ? 4 : 6;

// ELI-Diskriminator der BV (aus src/lib/fedlex.ts FEDLEX): SR 101.
const BV_ELI = '1999/404';

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = [];
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`));
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`); });
  return fehler;
}

test.describe('A10 — Plural-Linker «in den Artikeln …» (MWSTG Art. 5)', () => {
  test('MWSTG Art. 5: GENAU 5 interne Sprung-Links (31/35/37/38/45), bounded', async ({ page }) => {
    const fehler = fehlerSammeln(page);
    await page.goto('/gesetze/bund/MWSTG#art-5');
    const art5 = page.locator('#art-5');
    await expect(art5).toBeAttached();

    // Alle 5 Aufzählungs-Glieder als interne Self-Sprünge (Reader-Anker art-N).
    for (const n of ['31', '35', '37', '38', '45']) {
      const link = art5.locator(`a[href="/gesetze/bund/MWSTG#art-${n}"]`);
      await expect(link.first()).toBeVisible({ timeout: 10_000 });
      await expect(link.first()).toHaveText(n); // Anzeige = exakter Quelltext (§1)
    }
    // Bounded: GENAU 5 Verweis-Links im Artikeltext — «30 Prozent», Passus-Ketten
    // und der Fliesstext danach bleiben unverlinkt.
    await expect(art5.locator('p a[href^="/gesetze/bund/MWSTG#art-"]')).toHaveCount(5);

    // Klick auf ein Glied springt zum Zielartikel (Anker existiert im DOM).
    await art5.locator('a[href="/gesetze/bund/MWSTG#art-31"]').first().click();
    await expect(page.locator('#art-31')).toBeVisible({ timeout: 10_000 });

    await page.screenshot({ path: 'e2e-shots/verweis-u-mwstg5.png', fullPage: false });
    expect(fehler).toEqual([]);
  });
});

test.describe('A11 — Verweise in Präambel/Ingress', () => {
  test('MWSTG-Ingress: «Artikel 130 der Bundesverfassung» → BV art_130 (Genitiv-Map)', async ({ page }) => {
    const fehler = fehlerSammeln(page);
    await page.goto('/gesetze/bund/MWSTG');
    const ingress = page.locator('section[aria-label="Ingress"]');
    await expect(ingress).toBeVisible({ timeout: 15_000 });
    const bv130 = ingress.locator(`a[href*="${BV_ELI}"][href*="#art_130"]`);
    await expect(bv130.first()).toBeVisible({ timeout: 10_000 });
    await expect(bv130.first()).toHaveText(/Artikel\s*130/);
    expect(fehler).toEqual([]);
  });

  test('ArG-Ingress (Plural): «die Artikel 26, 31 Absatz 2, 34 … und 114 der Bundesverfassung» → BV-Glieder einzeln', async ({ page }) => {
    const fehler = fehlerSammeln(page);
    await page.goto('/gesetze/bund/ARG');
    const ingress = page.locator('section[aria-label="Ingress"]');
    await expect(ingress).toBeVisible({ timeout: 15_000 });
    // Erste + letzte Glieder der Aufzählung zeigen auf die BV.
    await expect(ingress.locator(`a[href*="${BV_ELI}"][href*="#art_26"]`).first()).toBeVisible({ timeout: 10_000 });
    await expect(ingress.locator(`a[href*="${BV_ELI}"][href*="#art_114"]`).first()).toBeVisible();
    // Der Öffner selbst («die Artikel») bleibt Text, nur die Nummern sind Anker.
    await page.screenshot({ path: 'e2e-shots/verweis-u-praeambel-arg.png', fullPage: false });
    expect(fehler).toEqual([]);
  });
});

test.describe('A7 — strukturiertes Verweis-Popover (Wortlaut → Entscheide → Materialien)', () => {
  test('MWSTV → «Art. 18 Abs. 2 MWSTG»: Popover mit Wortlaut + abgetrennten Materialien (Behörde · Stand)', async ({ page }) => {
    const fehler = fehlerSammeln(page);
    await page.goto('/gesetze/bund/MWSTV#art-165');
    const art = page.locator('#art-165');
    await expect(art).toBeAttached();
    const chip = art.getByRole('link', { name: /Art\. 18 Abs\. 2 MWSTG/ }).first();
    await expect(chip).toBeVisible({ timeout: 10_000 });
    await chip.click();

    const dialog = page.getByRole('dialog', { name: /Art\. 18 MWSTG/ });
    await expect(dialog).toBeVisible({ timeout: 10_000 });
    // (1) Artikel-Wortlaut + Provenienz-Fuss (§7 a–d).
    await expect(dialog.getByText('Norm-Vorschau')).toBeVisible();
    await expect(dialog.getByRole('link', { name: /geltende Fassung/ })).toBeVisible();
    // (3) klar abgetrennte Materialien-Gruppe (lazy) mit Behörden-Kürzel + Stand (A13).
    const matGruppe = dialog.getByRole('heading', { name: /Amtliche Materialien/ });
    await expect(matGruppe).toBeVisible({ timeout: 10_000 });
    await expect(dialog.getByText(/Legt aus/)).toBeVisible();
    await expect(dialog.getByText(/Stand \d{2}\.\d{2}\.\d{4}/).first()).toBeVisible();

    await page.screenshot({ path: 'e2e-shots/verweis-u-popover-materialien.png', fullPage: false });
    expect(fehler).toEqual([]);
  });

  test('SchKG → «Art. 20 OR»: Popover mit massgeblichen Entscheiden (Leitfall-Kanten)', async ({ page }) => {
    const fehler = fehlerSammeln(page);
    await page.goto('/gesetze/bund/SCHKG#art-312');
    const art = page.locator('#art-312');
    await expect(art).toBeAttached();
    const chip = art.getByRole('link', { name: /^Art\. 20 OR$/ }).first();
    await expect(chip).toBeVisible({ timeout: 10_000 });
    await chip.click();

    const dialog = page.getByRole('dialog', { name: /Art\. 20 OR/ });
    await expect(dialog).toBeVisible({ timeout: 10_000 });
    // (2) massgebliche Entscheide unter dem Wortlaut (Richtung als TEXT).
    await expect(dialog.getByRole('heading', { name: /Massgebliche Entscheide/ })).toBeVisible({ timeout: 10_000 });
    await expect(dialog.getByText(/Wird zitiert von/)).toBeVisible();
    // Entscheid-Zeile verlinkt in den Entscheid-Reader mit ?norm=-Fundstellen-Sprung.
    const eLink = dialog.locator('a[href*="/rechtsprechung/"][href*="norm="]').first();
    await expect(eLink).toBeVisible();

    // Esc schliesst das Popover (Tastatur-Bedienbarkeit, A9).
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    expect(fehler).toEqual([]);
  });
});

test.describe('A9 — Flüssigkeit unter CPU-Throttle + CLS 0', () => {
  test(`Popover-Öffnen + Plural-Sprung gedrosselt (${DROSSEL}×) ohne Lag, CLS < 0.05`, async ({ page }) => {
    test.slow();
    const fehler = fehlerSammeln(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    const client = await page.context().newCDPSession(page);
    await client.send('Emulation.setCPUThrottlingRate', { rate: DROSSEL });

    await page.goto('/gesetze/bund/MWSTV#art-165');
    const art = page.locator('#art-165');
    const chip = art.getByRole('link', { name: /Art\. 18 Abs\. 2 MWSTG/ }).first();
    await expect(chip).toBeVisible({ timeout: 20_000 });

    // CLS-Beobachter (nur input-freie Shifts zählen).
    await page.evaluate(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      new PerformanceObserver((l) => {
        for (const e of l.getEntries() as PerformanceEntry[]) {
          const s = e as unknown as { value: number; hadRecentInput: boolean };
          if (!s.hadRecentInput) (window as unknown as { __cls: number }).__cls += s.value;
        }
      }).observe({ type: 'layout-shift' });
    });

    // Popover öffnen: Wortlaut + lazy Materialien — ohne Hänger.
    let t0 = Date.now();
    await chip.click();
    const dialog = page.getByRole('dialog', { name: /Art\. 18 MWSTG/ });
    await expect(dialog).toBeVisible({ timeout: 15_000 });
    expect(Date.now() - t0, 'Popover öffnen zu langsam').toBeLessThan(8000);
    await expect(dialog.getByRole('heading', { name: /Amtliche Materialien/ })).toBeVisible({ timeout: 15_000 });
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();

    // CLS der ersten Seite VOR der Navigation sichern (window-State geht bei
    // goto verloren), auf der zweiten Seite den Beobachter neu installieren.
    const cls1 = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);

    // Plural-Glied-Sprung im MWSTG gedrosselt.
    await page.goto('/gesetze/bund/MWSTG#art-5');
    await page.evaluate(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      new PerformanceObserver((l) => {
        for (const e of l.getEntries() as PerformanceEntry[]) {
          const s = e as unknown as { value: number; hadRecentInput: boolean };
          if (!s.hadRecentInput) (window as unknown as { __cls: number }).__cls += s.value;
        }
      }).observe({ type: 'layout-shift' });
    });
    const glied = page.locator('#art-5').locator('a[href="/gesetze/bund/MWSTG#art-31"]').first();
    await expect(glied).toBeVisible({ timeout: 20_000 });
    t0 = Date.now();
    await glied.click();
    await expect(page.locator('#art-31')).toBeVisible({ timeout: 15_000 });
    expect(Date.now() - t0, 'Plural-Glied-Sprung zu langsam').toBeLessThan(8000);

    const cls2 = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
    expect(cls1, 'Layout-Shift Popover-Seite (input-frei)').toBeLessThan(0.05);
    expect(cls2, 'Layout-Shift Plural-Sprung-Seite (input-frei)').toBeLessThan(0.05);

    await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    expect(fehler).toEqual([]);
  });
});
