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
    await art41.scrollIntoViewIfNeeded()
    // Chips wachsen idle ein (requestIdleCallback). Die Zeile trägt die Overline
    // «Leitfälle» und einen Chip-Link auf den einschlägigen BGE (aus dem OR-Shard).
    await expect(art41.getByText('Leitfälle', { exact: true })).toBeVisible()
    await expect(art41.getByRole('link', { name: /BGE 152 III 7/ })).toBeVisible()
    // Der Chip führt in die Rechtsprechungs-Detailseite.
    await expect(art41.getByRole('link', { name: /BGE 152 III 7/ })).toHaveAttribute('href', /\/rechtsprechung\/bge_152_III_7/)
    expect(fehler).toEqual([])
  })

  test('(b) Artikel OHNE Leitfälle rendert KEINE leere Zeile', async ({ page }) => {
    await page.goto('/gesetze/bund/OR')
    const art2 = page.locator('#art-2')
    await art2.scrollIntoViewIfNeeded()
    // Warten bis die Chips generell geladen sind (art-41 als Anker), dann prüfen,
    // dass Art. 2 (ohne Treffer im Shard) KEINE «Leitfälle»-Overline trägt.
    await expect(page.locator('#art-41').getByText('Leitfälle', { exact: true })).toBeVisible()
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
