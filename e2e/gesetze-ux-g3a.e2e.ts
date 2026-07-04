import { test, expect, type Page } from '@playwright/test';

// W2·5d G3a — Per-Grundart-Darstellung im Gesetzes-Reader (FAHRPLAN §2.2):
// erlassTyp-Kopf-Label, grundart-abhängiger Linien-Default (K11, data-grundart),
// KANTON §-Label (⑥, Anker bleibt #art-/R8), LIVE_VERWEIS-Verweiskarte (⑧).
// Reine Darstellung (§3) — die Grundart kommt zur Laufzeit aus dem Register
// (SSoT, §5), NICHT aus der BrowseErlass. Reader = prerendertes Crawler-HTML →
// auf den Client-Takeover warten, bevor geprüft wird.
async function warteKopf(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await expect(page.locator('.lc-leser > header, header').first()).toBeVisible({ timeout: 20000 });
}
async function warteReader(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await expect(page.locator('[aria-label="Darstellungsoptionen"]').first()).toBeVisible({ timeout: 20000 });
}

/** Border-Left-Farbe der ersten Guide-Kante über einem Artikel (oder null). */
async function guideFarbe(page: Page, artId: string): Promise<string | null> {
  return page.evaluate((id) => {
    let el: HTMLElement | null = document.getElementById(id)?.parentElement ?? null;
    while (el) {
      if (el.matches('section[data-normtext-linie]')) {
        const cs = getComputedStyle(el);
        if (cs.borderLeftStyle !== 'none' && parseFloat(cs.borderLeftWidth) > 0) return cs.borderLeftColor;
      }
      el = el.parentElement;
    }
    return null;
  }, artId);
}

// ── erlassTyp-Kopf-Label (§5.1, behebt «Verordnung als Bundesgesetz») ──────────
test('Kopf-Label: Verordnung wird als «Verordnung» betitelt, nicht «Bundesgesetz» (VMWG)', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/VMWG');
  const header = page.locator('.lc-leser > header');
  const overline = header.locator('.lc-overline').first();
  await expect(overline).toContainText('Verordnung');
  await expect(overline).not.toContainText('Bundesgesetz');
});

test('Kopf-Label: Gesetz bleibt «Bundesgesetz» (OR)', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/OR');
  await expect(page.locator('.lc-leser > header .lc-overline').first()).toContainText('Bundesgesetz');
});

// ── K11: grundart-abhängiger Linien-Default (data-grundart am .lc-leser) ───────
test('K11: KODIFIKATION zeigt den Guide im Auto-Default (ZGB)', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/ZGB#art-684');
  await expect(page.locator('.lc-leser')).toHaveAttribute('data-grundart', 'KODIFIKATION');
  await expect(page.locator('html')).toHaveAttribute('data-linien', 'auto');
  await expect(page.locator('#art-684')).toBeVisible({ timeout: 20000 });
  const farbe = await guideFarbe(page, 'art-684');
  expect(farbe, 'KODIFIKATION-Guide vorhanden').not.toBeNull();
  expect(farbe).not.toBe('rgba(0, 0, 0, 0)'); // sichtbar (nicht transparent)
});

test('K11: flachere Grundart blendet den Guide im Auto-Default aus (BV, STANDARD_ERLASS)', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BV#art-8');
  await expect(page.locator('.lc-leser')).toHaveAttribute('data-grundart', 'STANDARD_ERLASS');
  await expect(page.locator('#art-8')).toBeVisible({ timeout: 20000 });
  const farbe = await guideFarbe(page, 'art-8');
  expect(farbe, 'Guide-Container existiert (border-Breite bleibt)').not.toBeNull();
  expect(farbe).toBe('rgba(0, 0, 0, 0)'); // auto + non-KODIFIKATION → transparent
});

// ── ⑥ KANTON §-Label: sichtbares «§ N», Anker bleibt #art- (R8) ────────────────
test('KANTON §-Label: Body zeigt «§», Kopf zählt «Paragraphen», Anker bleibt #art- (AG-291.150)', async ({ page }) => {
  await warteReader(page, '/gesetze/kanton/AG-291.150');
  await expect(page.locator('.lc-leser')).toHaveAttribute('data-grundart', 'KANTON');
  // Sichtbares Bestimmungs-Label beginnt mit «§» (aus dem amtlichen Snapshot).
  const artLink = page.locator('.lc-leser article[id^="art-"] a.num[href^="#art-"]').first();
  await expect(artLink).toContainText('§');
  // KRITISCH (R8): der Anker-id bleibt art-<token> (opak), NIE par-.
  const ersteArt = page.locator('.lc-leser article[id^="art-"]').first();
  const id = await ersteArt.getAttribute('id');
  expect(id).toMatch(/^art-/);
  // Kopf-Zähl-Substantiv «Paragraphen» statt «Artikel».
  await expect(page.locator('.lc-leser > header').getByText(/\d+\s+Paragraphen/)).toBeVisible();
});

// ── ⑧ LIVE_VERWEIS: ehrliche Verweiskarte statt Fehlerseite (DSGVO) ────────────
test('LIVE_VERWEIS: Verweiskarte mit amtlichem Live-Link + ehrlichem Hinweis, keine Fehlerseite (DSGVO)', async ({ page }) => {
  await warteKopf(page, '/gesetze/bund/DSGVO');
  // Ehrlicher §8-Hinweis + prominenter amtlicher Link; KEINE «nicht verfügbar»-Fehlerseite.
  await expect(page.getByText(/nicht als In-App-Volltext gehostet/i)).toBeVisible();
  await expect(page.getByRole('link', { name: /Amtliche Fassung öffnen/i })).toBeVisible();
  await expect(page.getByText(/nicht als Volltext verfügbar/i)).toHaveCount(0);
});
