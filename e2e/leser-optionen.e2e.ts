import { test, expect, type Page } from '@playwright/test';

// W2·5d G2a — Leser-Options-Leiste (Linien/Fussnoten/Verweise): reine data-*-/
// CSS-Toggles am <html>, persistent (localStorage) + Pre-Paint (main.tsx, CSP-
// konform ohne Inline-Script). Belegt R6 (Grundzustand = heutige Darstellung,
// Toggle rein CSS) und R9 (Fussnoten-«AUS» DÄMPFT, versteckt NIE — Ctrl+F/
// Screenreader/Print bleiben). Positiv UND negativ (AN sichtbar ↔ AUS reduziert).
//
// Der Reader liefert prerendertes Crawler-HTML → auf den Client-Takeover warten
// (die Options-Leiste existiert NUR im React-DOM = App-Ready-Marker), bevor
// geklickt wird. Erlass-Wahl: die Toggle-Semantik ist seitengrössen-unabhängig
// (Attribut + CSS) — Fussnoten/Verweise laufen darum auf dem KLEINEN BGBM
// (~22 KB Snapshot, 25 Fussnoten-Marker, 62 Verweis-Links), NICHT auf dem
// 1686-Artikel-OR: dessen Voll-Re-Render (Apparat-Toggle) + Ganzseiten-Style-
// Recalc starvten den gedrosselten CI-Runner ins 30s-Test-Timeout (CI-Befund
// 4.7.2026, Run 28711156193 — lokal auch mit 20×-CPU-Throttle nicht
// reproduzierbar).
//
// W2·5d G2b (Flake-Härtung): der Linien-Toggle lief bisher auf dem grossen ZGB
// (~1277 Art., #art-684 tief) und war am gedrosselten Runner nahe dem Timeout.
// Er zieht auf den kleinen, ABER geschachtelten Erlass BV (~232 Art., #art-8 mit
// Guide über tiefe===1) um — @6×-CPU-Throttle-Probe: BV ready≈1,0 s / toggle≈1,3 s
// vs. ZGB ready≈2,5 s / toggle≈4,1 s (≈3× schneller), Assertions unverändert
// scharf (Guide sichtbar → transparent, Element bleibt, Einzug kollabiert). Die
// R4-TIEFEN-Referenz (≤1 Guide-Stapel, ZGB Art. 684) bleibt CI-fest in
// `leser-linien-kanon.e2e.ts`.

async function warteReader(page: Page, url: string, artId: string): Promise<void> {
  await page.goto(url);
  // App-Ready: die Leiste rendert nur der Client (nicht im Crawler-HTML) —
  // erst danach hängen die React-Handler an den Switches.
  await expect(page.locator('[aria-label="Darstellungsoptionen"]').first()).toBeVisible({ timeout: 20000 });
  await expect(page.locator(`#${artId}`)).toBeVisible({ timeout: 20000 });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(200);
}

/** Farbe/Breite/Padding der ersten gerenderten Guide-Kante über einem Artikel. */
async function guide(page: Page, artId: string) {
  return page.evaluate((id) => {
    let el: HTMLElement | null = document.getElementById(id)?.parentElement ?? null;
    while (el) {
      if (el.matches('section[data-normtext-linie]')) {
        const cs = getComputedStyle(el);
        if (cs.borderLeftStyle !== 'none' && parseFloat(cs.borderLeftWidth) > 0) {
          return { color: cs.borderLeftColor, width: cs.borderLeftWidth, padding: cs.paddingLeft };
        }
      }
      el = el.parentElement;
    }
    return null;
  }, artId);
}

test('Options-Leiste: drei role=switch; Fussnoten/Verweise an, Linien-Default aufbau-basiert (auto, U-LINIEN/A8)', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BGBM', 'art-1');
  const gruppe = page.locator('[aria-label="Darstellungsoptionen"]').first();
  await expect(gruppe).toBeVisible();
  await expect(gruppe.getByRole('switch')).toHaveCount(3); // BGBM geschachtelt → Linien sichtbar
  // W2·5d U-LINIEN/A8: Linien-Default ist 'auto' — AUFBAU-basiert (nicht mehr die
  // grundart-Schublade K11). BGBM ist ein flacher Kurzerlass mit EINER Gliederungs-
  // ebene → der Guide macht diese Ebene sichtbar (autoGuide), der Schalter zeigt
  // ehrlich «an» (§8). Fussnoten/Verweise bleiben unverändert an (R6-No-op).
  await expect(page.locator('.lc-leser').first()).toHaveAttribute('data-guide-auto', 'an');
  await expect(gruppe.getByRole('switch', { name: 'Linien' })).toHaveAttribute('aria-checked', 'true');
  for (const name of ['Fussnoten', 'Verweise']) {
    await expect(gruppe.getByRole('switch', { name })).toHaveAttribute('aria-checked', 'true');
  }
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-linien', 'auto');
  await expect(html).toHaveAttribute('data-fussnoten', 'an');
  await expect(html).toHaveAttribute('data-verweise', 'an');
});

test('Linien-Toggle: explizit AN sichtbar → AUS transparent (Guide bleibt im DOM), persistiert über Reload', async ({ page }) => {
  // BV ist eine tiefe Struktur (Gliederungstiefe 3) → im Auto-Default (U-LINIEN/A8)
  // bleibt der Guide ruhig aus (data-guide-auto="aus"); der Container mit border-
  // Breite BLEIBT aber im DOM. Ein expliziter Klick setzt den globalen Zustand und
  // übersteuert den Aufbau-Default.
  await warteReader(page, '/gesetze/bund/BV#art-8', 'art-8');
  await expect(page.locator('html')).toHaveAttribute('data-linien', 'auto');
  await expect(page.locator('.lc-leser').first()).toHaveAttribute('data-guide-auto', 'aus');
  const autoAus = await guide(page, 'art-8');
  expect(autoAus, 'Guide-Container existiert (auch im Auto-Default)').not.toBeNull();
  expect(parseFloat(autoAus!.width)).toBeGreaterThan(0);
  expect(autoAus!.color).toBe('rgba(0, 0, 0, 0)'); // auto + tiefe Kodifikation → transparent (ruhig)

  // POSITIV: «Linien» explizit AN → Kante sichtbar (nicht transparent).
  await page.getByRole('switch', { name: 'Linien' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-linien', 'an');
  const an = await guide(page, 'art-8');
  expect(an!.color).not.toBe('rgba(0, 0, 0, 0)');

  // NEGATIV: «Linien» AUS → Attribut gesetzt, Kante transparent, aber Element
  // (border-Breite > 0) BLEIBT — kein Textknoten bewegt, kein display-Wechsel.
  await page.getByRole('switch', { name: 'Linien' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-linien', 'aus');
  const aus = await guide(page, 'art-8');
  expect(aus, 'Guide-Container bleibt strukturell erhalten').not.toBeNull();
  expect(parseFloat(aus!.width)).toBeGreaterThan(0);
  expect(aus!.color).toBe('rgba(0, 0, 0, 0)'); // transparent
  expect(aus!.padding).toBe('0px'); // Einzug kollabiert (flach)

  // Persistenz + Pre-Paint: Reload stellt data-linien=aus wieder her.
  const ls = await page.evaluate(() => localStorage.getItem('lm.leser.optionen'));
  expect(ls).toContain('"linien":"aus"');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-linien', 'aus');
  await expect(page.locator('#art-8')).toBeVisible();
  const nachReload = await guide(page, 'art-8');
  expect(nachReload!.color).toBe('rgba(0, 0, 0, 0)'); // kein Flash: bleibt aus
});

test('Fussnoten-Toggle: Marker liegen IMMER im DOM (G2b), AUS DÄMPFT sie NIE display:none (R9)', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BGBM', 'art-1');

  // W2·5d G2b (Fussnoten-Unifizierung): der alte «Fussnoten ein-/ausblenden»-
  // Apparat-Schalter ist entfallen — die Marker rendern jetzt IMMER (amtliche
  // Substanz bleibt im DOM, Ctrl+F/Print/Screenreader). EINE Bedienung = der
  // Options-Toggle unten; er DÄMPFT nur (R9), rendert/entfernt nichts.
  const marker = page.locator('.lc-leser button[aria-label^="Fussnote"]').first();
  await expect(marker).toBeVisible({ timeout: 15000 });
  await marker.scrollIntoViewIfNeeded();

  // POSITIV: Grundzustand (data-fussnoten=an) → Marker voll sichtbar.
  expect(parseFloat(await marker.evaluate((el) => getComputedStyle(el).opacity))).toBeGreaterThan(0.9);

  // NEGATIV: «Fussnoten» AUS → gedämpft, ABER niemals display:none (R9).
  await page.getByRole('switch', { name: 'Fussnoten' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-fussnoten', 'aus');
  await marker.scrollIntoViewIfNeeded();
  expect(await marker.evaluate((el) => getComputedStyle(el).display)).not.toBe('none');
  expect(await marker.evaluate((el) => getComputedStyle(el).visibility)).not.toBe('hidden');
  expect(parseFloat(await marker.evaluate((el) => getComputedStyle(el).opacity))).toBeLessThan(1);
  // Der Marker-Text (die Fussnoten-Nummer) bleibt für Ctrl+F erhalten.
  expect((await marker.textContent())?.trim().length ?? 0).toBeGreaterThan(0);
});

test('Verweise-Toggle: AUS unterdrückt die (dotted) Link-Unterstreichung, der Link bleibt', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BGBM', 'art-1');
  const link = page.locator('.lc-leser .decoration-dotted').first();
  const anzahl = await page.locator('.lc-leser .decoration-dotted').count();
  test.skip(anzahl === 0, 'kein Verweis-Link auf dieser Seite');

  await link.scrollIntoViewIfNeeded();
  // POSITIV: Grundzustand → :hover unterstreicht (heutiges Verhalten).
  await link.hover();
  expect(await link.evaluate((el) => getComputedStyle(el).textDecorationLine)).toContain('underline');

  // NEGATIV: «Verweise» AUS → keine Unterstreichung, aber Link (href/Klick) bleibt.
  await page.getByRole('switch', { name: 'Verweise' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-verweise', 'aus');
  await link.hover();
  expect(await link.evaluate((el) => getComputedStyle(el).textDecorationLine)).toBe('none');
});
