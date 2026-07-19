import { test, expect, type Page } from '@playwright/test';

// E5-Welle (David 16.7.2026, §10.10) — A35 · A40 · A41.
//
//  · A35: In-Gesetz-Suchfeld sitzt in der STICKY Kopfzeilen-Leiste (data-such-bar,
//         direkt unter dem Ansicht-tragenden Inhalts-Kopf), NICHT mehr «oberhalb
//         der Gliederung» in der TOC-Spalte; Suchtreffer werden im Text markiert
//         (CSS Custom Highlight API «lc-such-treffer»).
//  · A40: «beim Bundesgericht …»-Link eines Ausser-Bestand-BGE ist ein EHRLICHER
//         Such-Link (type=simple_query), KEIN konstruierter highlight_docid-Permalink
//         (der landete beim falschen Entscheid).
//  · A41: die Header-Suche (Topbar-Combobox) öffnet ihr Dropdown ÜBER der sticky
//         Gesetzes-Kopfzeile (Stacking/z-index) — nicht mehr dahinter.

// CI-Härtung 19.7.2026 (BEFUND 3b): der OR-Reader + In-Gesetz-Suche kettet mehrere
// 15–20-s-Latches (Artikel-Index-/Struktur-Load, Highlight). Auf dem 2-vCPU-Runner
// unter Starvation riss der A35-Highlight-Walk reihum das 30-s-Test-Budget. Budget
// explizit auf 60 s (Muster gesetze-pdf-download). INFRASTRUKTUR (Zeitbudget), KEIN
// Assertion-Change (§6.3): Highlight-/Stacking-Assertions unberührt.
test.describe.configure({ timeout: 60_000 });

const inGesetzSuche = (page: Page) => page.getByRole('searchbox', { name: 'Im Gesetz suchen' });
const headerFeld = (page: Page) => page.getByRole('combobox', { name: /LexMetrik durchsuchen/ });

test.describe('A35 — In-Gesetz-Suche in der Kopfzeile + Treffer-Highlight', () => {
  test('Suchfeld sitzt in der sticky Kopfzeilen-Leiste, NICHT in der Gliederungsspalte', async ({ page }) => {
    await page.goto('/gesetze/bund/OR');
    await expect(page.locator('#art-1')).toBeVisible({ timeout: 20000 });
    const suche = inGesetzSuche(page);
    await expect(suche).toBeVisible({ timeout: 20000 });
    // Genau EIN Suchfeld (kein Doppel aus TOC-Spalte + Leiste).
    await expect(suche).toHaveCount(1);
    // Das Feld liegt in der data-such-bar-Kopfzeilen-Leiste …
    await expect(suche.locator('xpath=ancestor::*[@data-such-bar]')).toHaveCount(1);
    // … und NICHT innerhalb der Gliederungsspalte (aside/[data-toc]).
    await expect(suche.locator('xpath=ancestor::aside')).toHaveCount(0);
  });

  test('«Vertrag» im OR wird im Treffertext gehighlighted (CSS Custom Highlight API)', async ({ page }) => {
    await page.goto('/gesetze/bund/OR');
    await expect(page.locator('#art-1')).toBeVisible({ timeout: 20000 });
    const suche = inGesetzSuche(page);
    await expect(suche).toBeVisible({ timeout: 20000 });
    await suche.fill('Vertrag');
    // Trefferliste steht.
    await expect(page.getByText(/Treffer für/)).toBeVisible({ timeout: 15000 });
    // Highlight-Menge ist gesetzt (Paint-Schicht, keine DOM-Mutation).
    await expect.poll(async () => page.evaluate(() => {
      const reg = (globalThis as unknown as { CSS?: { highlights?: Map<string, { size: number }> } }).CSS?.highlights;
      const hl = reg?.get('lc-such-treffer');
      return hl ? hl.size : 0;
    }), { timeout: 15000 }).toBeGreaterThan(0);
    // Suche leeren ⇒ Highlight verschwindet wieder (Cleanup).
    await suche.fill('');
    await expect.poll(async () => page.evaluate(() => {
      const reg = (globalThis as unknown as { CSS?: { highlights?: Map<string, unknown> } }).CSS?.highlights;
      return reg?.has('lc-such-treffer') ?? false;
    }), { timeout: 15000 }).toBe(false);
  });
});

test.describe('A41 — Header-Dropdown liegt über der Gesetzes-Kopfzeile', () => {
  test('Trefferdropdown der Topbar-Suche verdeckt die sticky Gesetzes-Kopfzeile (nicht umgekehrt)', async ({ page }) => {
    await page.goto('/gesetze/bund/OR');
    await expect(page.locator('#art-1')).toBeVisible({ timeout: 20000 });
    // Auf der Gesetzesseite ist der sticky Inhalts-Kopf (Breadcrumb + Ansicht) präsent.
    const feld = headerFeld(page);
    await feld.click();
    await feld.fill('OR');
    const listbox = page.getByRole('listbox', { name: 'Suchtreffer' });
    await expect(listbox).toBeVisible({ timeout: 15000 });
    // Ein Punkt im Überlappungsband (unter der 64px-Topbar, im 36px-Band des sticky
    // Inhalts-Kopfs) am horizontalen Zentrum des Dropdowns: das ZUOBERST getroffene
    // Element MUSS zum Dropdown/zur Listbox gehören, nicht zum Inhalts-Kopf.
    const obenAufDropdown = await page.evaluate(() => {
      const lb = document.querySelector('[role="listbox"][aria-label="Suchtreffer"]');
      if (!lb) return false;
      const r = lb.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = 88; // 64px Topbar + ~24px in den 36px-Kopf → Überlappungsband
      const stapel = document.elementsFromPoint(x, y);
      // Das oberste Element ist Teil des Dropdowns (Listbox oder deren Container).
      return stapel.length > 0 && !!stapel[0].closest('[role="search"]');
    });
    expect(obenAufDropdown).toBe(true);
  });
});

test.describe('A40 — ehrlicher amtlicher Such-Link statt falschem Permalink', () => {
  test('Ausser-Bestand-BGE «BGE 150 III 38» → simple_query-Suchlink, KEIN highlight_docid', async ({ page }) => {
    await page.goto('/gesetze');
    const feld = headerFeld(page);
    await feld.click();
    await feld.fill('BGE 150 III 38');
    // §8-ehrliche Zeile «nicht im Bestand» + amtlicher SUCH-Link.
    const link = page.getByRole('link', { name: /beim Bundesgericht suchen/ });
    await expect(link).toBeVisible({ timeout: 15000 });
    const href = await link.getAttribute('href');
    expect(href).toContain('type=simple_query');
    expect(href).not.toContain('highlight_docid');
  });
});
