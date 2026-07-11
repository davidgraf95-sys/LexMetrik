import { test, expect } from '@playwright/test';

// R4 (W2·5d G1 / DESIGN-REGLEMENT-NORMTEXT §Linien-Kanon Regel 1): der Gliederungs-
// Guide stapelt sich NICHT — pro Artikel rendert HÖCHSTENS EINE vertikale
// Guide-Linie, egal wie tief er verschachtelt ist (früher: bis ~6 gestapelte
// border-l = «Barcode/Gleisbett», ZGB Art. 684 / OR Art. 319). Tiefe trägt der
// Einzug, nicht eine zweite Linie.
//
// Gemessen wird marker-scoped: nur `section[data-normtext-linie]`-Vorfahren mit
// tatsächlich gerenderter linker Kante zählen (Chrome-/Brass-/Tabellen-Borders
// tragen keinen Marker und bleiben aussen vor). Der Reader liefert prerendertes
// HTML → erst auf den Client-Takeover (#art-…) warten.

async function guideKanten(page: import('@playwright/test').Page, artId: string): Promise<number> {
  return page.evaluate((id) => {
    const art = document.getElementById(id);
    if (!art) return -1;
    let n = 0;
    let el: HTMLElement | null = art.parentElement;
    while (el) {
      if (el.matches('section[data-normtext-linie]')) {
        const cs = getComputedStyle(el);
        if (cs.borderLeftStyle !== 'none' && parseFloat(cs.borderLeftWidth) > 0) n++;
      }
      el = el.parentElement;
    }
    return n;
  }, artId);
}

// Zählt nur die SICHTBAREN Guide-Kanten (nicht-transparente border-Farbe) über
// einem Artikel — für den Aufbau-Default (U-LINIEN/A8).
async function sichtbareGuides(page: import('@playwright/test').Page, artId: string): Promise<number> {
  return page.evaluate((id) => {
    const art = document.getElementById(id);
    if (!art) return -1;
    let n = 0;
    let el: HTMLElement | null = art.parentElement;
    while (el) {
      if (el.matches('section[data-normtext-linie]')) {
        const cs = getComputedStyle(el);
        if (cs.borderLeftStyle !== 'none' && parseFloat(cs.borderLeftWidth) > 0 && cs.borderLeftColor !== 'rgba(0, 0, 0, 0)') n++;
      }
      el = el.parentElement;
    }
    return n;
  }, artId);
}

test('ZGB Art. 684: höchstens EINE Guide-Linie trotz tiefer Schachtelung', async ({ page }) => {
  await page.goto('/gesetze/bund/ZGB#art-684');
  await expect(page.locator('#art-684')).toBeVisible();
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(300);
  const n = await guideKanten(page, 'art-684');
  expect(n, 'art-684 gefunden').toBeGreaterThanOrEqual(0);
  expect(n, `Guide-Kanten um Art. 684 (${n}) muss ≤ 1 sein`).toBeLessThanOrEqual(1);
});

test('OR Art. 319: höchstens EINE Guide-Linie', async ({ page }) => {
  await page.goto('/gesetze/bund/OR#art-319');
  await expect(page.locator('#art-319')).toBeVisible();
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(300);
  const n = await guideKanten(page, 'art-319');
  expect(n, `Guide-Kanten um Art. 319 (${n}) muss ≤ 1 sein`).toBeLessThanOrEqual(1);
});

// U-LINIEN/A8 + V2·L-3 — der Aufbau-Default heilt Davids Befund («zgb sehr viele,
// arg fast keine»); L-3 (David 10.7., Umkehr #161) dreht den Auto-Default der
// tiefen Kodifikationen: ZGB zeigt jetzt seinen EINEN Guide (deklarierte
// Verdikt-Änderung, §6.3 — die Tiefe deckelt nicht mehr, ruhig ist allein
// «dichte < 2»). POSITIV ZGB + ArG sichtbar, NEGATIV der dichte-arme STG bleibt
// ruhig — alles bei WEITERHIN ≤ 1 Guide-Stapel (R4-Invariante).
test('ZGB Art. 684: im Auto-Default GENAU EINE sichtbare Guide-Linie (V2·L-3, tiefe Kodifikation zeigt ihren Guide)', async ({ page }) => {
  await page.goto('/gesetze/bund/ZGB#art-684');
  await expect(page.locator('#art-684')).toBeVisible();
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(300);
  expect(await guideKanten(page, 'art-684'), 'R4: ≤ 1 Guide-Stapel').toBeLessThanOrEqual(1);
  expect(await sichtbareGuides(page, 'art-684'), 'ZGB (L-3): sein EINER Guide ist sichtbar').toBe(1);
});

test('STG Art. 10: im Auto-Default KEINE sichtbare Guide-Linie (dichte < 2 bleibt ruhig, L-3)', async ({ page }) => {
  await page.goto('/gesetze/bund/STG#art-10');
  await expect(page.locator('#art-10')).toBeVisible();
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(300);
  expect(await guideKanten(page, 'art-10'), 'R4: ≤ 1 Guide-Stapel').toBeLessThanOrEqual(1);
  expect(await sichtbareGuides(page, 'art-10'), 'STG (dichte 1): keine sichtbare Guide-Linie').toBe(0);
});

test('ArG Art. 9: im Auto-Default GENAU EINE sichtbare Guide-Linie (flaches Gesetz zeigt seine Ebene)', async ({ page }) => {
  await page.goto('/gesetze/bund/ARG#art-9');
  await expect(page.locator('#art-9')).toBeVisible();
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(300);
  expect(await guideKanten(page, 'art-9'), 'R4: ≤ 1 Guide-Stapel').toBeLessThanOrEqual(1);
  expect(await sichtbareGuides(page, 'art-9'), 'ArG: seine EINE Gliederungsebene ist sichtbar').toBe(1);
});
