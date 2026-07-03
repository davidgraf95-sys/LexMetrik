// Browser-Smoke der «Leitfälle zu diesem Artikel»-Chips (FAHRPLAN-DATENHALTUNG
// §11.2, Weiche B): lazy aus dem erlass-lokalen Shard geladen. Prüft (a) ein Artikel
// MIT Leitfällen zeigt die Chips + Entscheid-Link, (b) ein Artikel OHNE rendert KEINE
// leere Zeile, (c) der vollständige Normtext bleibt im DOM (Ctrl+F, §15.1), keine
// Console-/Page-Errors. Läuft gegen `vite preview` (dist).
import { test, expect, type Page } from '@playwright/test'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

test.describe('Leitfälle-Chips im ArtikelLeser (OR)', () => {
  test('(a) Artikel MIT Leitfällen zeigt die Chips + Entscheid-Link', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.goto('/gesetze/bund/OR')
    const art41 = page.locator('#art-41')
    // Chips laden in Viewport-Nähe (Sichtbarkeits-Laden, W2·7-VZUI). Während der
    // Hydration DRIFTET der Artikel (Nachbarn wachsen von Platzhalter- auf
    // Realhöhe) — ein einzelner programmatischer Scroll kann ihn verlieren, ein
    // Leser hält ihn im Blick: Scroll+Sichtprüfung als Poll bis zum Settle.
    await expect(async () => {
      await art41.scrollIntoViewIfNeeded()
      await expect(art41.getByText('Leitfälle', { exact: true })).toBeVisible({ timeout: 2000 })
    }).toPass({ timeout: 20_000 })
    await expect(art41.getByRole('link', { name: /BGE 152 III 7/ })).toBeVisible()
    // Der Chip führt in die Rechtsprechungs-Detailseite.
    await expect(art41.getByRole('link', { name: /BGE 152 III 7/ })).toHaveAttribute('href', /\/rechtsprechung\/bge_152_III_7/)
    expect(fehler).toEqual([])
  })

  test('(b) Artikel OHNE Leitfälle rendert KEINE leere Zeile', async ({ page }) => {
    await page.goto('/gesetze/bund/OR')
    // Chips laden in Viewport-Nähe (Sichtbarkeits-Laden, W2·7-VZUI): erst den
    // Anker-Artikel MIT Treffern ansteuern (beweist Shard geladen + Zeile da) …
    const art41 = page.locator('#art-41')
    await expect(async () => {
      await art41.scrollIntoViewIfNeeded()
      await expect(art41.getByText('Leitfälle', { exact: true })).toBeVisible({ timeout: 2000 })
    }).toPass({ timeout: 20_000 })
    // … dann Art. 2 (ohne Treffer im Shard): in Sicht bringen, kurz laden lassen,
    // KEINE «Leitfälle»-Overline (keine leere Zeile, §15.2).
    const art2 = page.locator('#art-2')
    await art2.scrollIntoViewIfNeeded()
    await page.waitForTimeout(1500)
    await expect(art2.getByText('Leitfälle', { exact: true })).toHaveCount(0)
  })

  test('(c) vollständiger Normtext bleibt im DOM (Ctrl+F / §15.1)', async ({ page }) => {
    await page.goto('/gesetze/bund/OR')
    await expect(page.locator('#art-1')).toBeVisible()
    // Tiefe Artikel bleiben im DOM (content-visibility, kein Windowing) — die Chips
    // hängen sich nur an, sie entfernen nichts. Ein weit unten liegender Artikel und
    // die Gesamtzahl der Artikel-Knoten beweisen die Vollständigkeit.
    await expect(page.locator('#art-529')).toHaveCount(1)
    const artikelZahl = await page.locator('article[id^="art-"]').count()
    expect(artikelZahl).toBeGreaterThan(500)
  })
})
