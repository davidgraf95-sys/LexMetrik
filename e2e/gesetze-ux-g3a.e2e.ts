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
  await expect(page.getByRole('button', { name: 'Ansicht' }).first()).toBeVisible({ timeout: 20000 });
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

// CI-Härtung (§194-Muster, QS-PERF): der 935-KB/1686-Artikel-OR starvte den
// gedrosselten 2-Kern-Runner nahe an die 20-s-warteReader-Latte (16–19 s lokal
// unter Contention). Die Kopf-Label-Semantik («Bundesgesetz» für grundart GESETZ)
// ist seitengrössen-unabhängig → Umzug auf das kleine ELG (~50 KB), ebenfalls ein
// Bundesgesetz. Der OR-Fall bleibt im Linien-Kanon-Tor (check:linien-kanon) gegated.
test('Kopf-Label: Gesetz bleibt «Bundesgesetz» (ELG)', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/ELG');
  await expect(page.locator('.lc-leser > header .lc-overline').first()).toContainText('Bundesgesetz');
});

// ── V2·A28: Auto-Guide korpusweit AUS (Davids Live-Verdikt) ────────────────────
// David hat die L-3-Einheit (#207, Auto-Guide AN für dichte Erlasse) live verworfen:
// «das mit den linien funktioniert überhaupt nicht» / «also ist überhaupt nicht
// fördernd für die übersicht». Der Auto-Default ist darum korpusweit zurückgezogen:
// data-guide-auto ist stets "aus", KEIN Erlass drängt die Linie auf. Das FEATURE
// bleibt: der explizite K11-Schalter «Linien AN» zeigt den EINEN Guide wieder.
// NEGATIV: der Auto-Default lässt den Guide auch beim flachen ArG transparent;
// POSITIV: der Nutzer-Override 'an' macht ihn sichtbar (auf `guideEbene`).
test('V2·A28: STG bleibt im Auto-Default RUHIG (Guide transparent, korpusweit aus)', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/STG#art-10');
  await expect(page.locator('.lc-leser')).toHaveAttribute('data-guide-auto', 'aus');
  await expect(page.locator('html')).toHaveAttribute('data-linien', 'auto');
  await expect(page.locator('#art-10')).toBeVisible({ timeout: 20000 });
  const farbe = await guideFarbe(page, 'art-10');
  expect(farbe, 'Guide-Container bleibt strukturell im DOM').not.toBeNull();
  expect(farbe).toBe('rgba(0, 0, 0, 0)'); // A28: Auto-Guide korpusweit aus
});

test('V2·A28: ArG-Guide im Auto-Default AUS (transparent), Nutzer-Override «an» zeigt ihn wieder', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/ARG#art-9');
  // Auto-Default: korpusweit aus (auch das flache Gesetz drängt die Linie nicht auf).
  await expect(page.locator('.lc-leser')).toHaveAttribute('data-guide-auto', 'aus');
  await expect(page.locator('#art-9')).toBeVisible({ timeout: 20000 });
  const autoFarbe = await guideFarbe(page, 'art-9');
  expect(autoFarbe, 'Guide-Container bleibt strukturell im DOM').not.toBeNull();
  expect(autoFarbe).toBe('rgba(0, 0, 0, 0)'); // A28: kein aufgedrängter Guide
  // POSITIV: das FEATURE bleibt — expliziter K11-Schalter «Linien AN» zeigt den
  // EINEN Guide auf `guideEbene` wieder (data-linien="an" übersteuert global).
  await page.getByRole('button', { name: 'Ansicht' }).first().click();
  await page.getByRole('switch', { name: 'Linien' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-linien', 'an');
  const anFarbe = await guideFarbe(page, 'art-9');
  expect(anFarbe, 'ArG-Guide vorhanden').not.toBeNull();
  expect(anFarbe).not.toBe('rgba(0, 0, 0, 0)'); // Nutzer-«an» → Ebene sichtbar
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
