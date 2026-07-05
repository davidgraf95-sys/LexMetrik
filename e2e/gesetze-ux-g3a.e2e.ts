import { test, expect, type Page } from '@playwright/test';

// W2·5d G3a — Per-Grundart-Darstellung im Gesetzes-Reader (FAHRPLAN §2.2):
// erlassTyp-Kopf-Label, aufbau-abhängiger Linien-Default (U-LINIEN/A8, data-guide-auto),
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

// ── U-LINIEN/A8: AUFBAU-abhängiger Linien-Default (data-guide-auto am .lc-leser) ─
// Davids A8-Befund («zgb sehr viele, arg fast keine») geheilt: der Auto-Default
// folgt dem TATSÄCHLICHEN Aufbau, nicht der grundart-Schublade. NEGATIV: die tiefe
// Kodifikation bleibt ruhig; POSITIV: das flache Gesetz zeigt seine Ebene.
test('U-LINIEN: tiefe Kodifikation ZGB bleibt im Auto-Default RUHIG (Guide transparent)', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/ZGB#art-684');
  await expect(page.locator('.lc-leser')).toHaveAttribute('data-guide-auto', 'aus');
  await expect(page.locator('html')).toHaveAttribute('data-linien', 'auto');
  await expect(page.locator('#art-684')).toBeVisible({ timeout: 20000 });
  const farbe = await guideFarbe(page, 'art-684');
  expect(farbe, 'Guide-Container bleibt strukturell im DOM').not.toBeNull();
  expect(farbe).toBe('rgba(0, 0, 0, 0)'); // tiefe Kodifikation → ruhig, Guide unsichtbar
});

test('U-LINIEN: flaches Gesetz ArG zeigt seine Ebene im Auto-Default (Guide sichtbar)', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/ARG#art-9');
  await expect(page.locator('.lc-leser')).toHaveAttribute('data-guide-auto', 'an');
  await expect(page.locator('#art-9')).toBeVisible({ timeout: 20000 });
  const farbe = await guideFarbe(page, 'art-9');
  expect(farbe, 'ArG-Guide vorhanden').not.toBeNull();
  expect(farbe).not.toBe('rgba(0, 0, 0, 0)'); // flaches Gesetz → Ebene sichtbar
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
