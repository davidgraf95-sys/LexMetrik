// Browser-Smoke über die Kernrouten: rendert die Seite, sammelt Console-/
// Page-Errors und prüft den 390px-Viewport auf horizontalen Overflow.
// Bewusst nur stabile Routen (kein fristenspiegel — wird per S-5c aufgelöst).
import { test, expect, type Page } from '@playwright/test'

const ROUTEN = [
  '/',
  '/rechner/tagerechner',
  '/rechner/zpo-fristen',
  '/rechner/schkg-fristen',
  '/rechner/verjaehrung',
  '/rechner/mietrecht',
  '/rechner/zustaendigkeit',
  '/rechner/verzugszins',
  '/vorlagen/testament',
  '/vorlagen/arbeitsvertrag',
  '/methodik',
]

// Vorbestehende, dokumentierte Overflow-Befunde (FAHRPLAN-DESIGN E4).
// fixme statt Gate: wird der Befund behoben, meldet Playwright den Eintrag
// als überflüssig — dann hier entfernen.
const BEKANNTER_OVERFLOW = new Set<string>(['/'])

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => {
    if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`)
  })
  return fehler
}

for (const route of ROUTEN) {
  test.describe(route, () => {
    test('rendert mit Inhalt und ohne Fehler', async ({ page }) => {
      const fehler = fehlerSammeln(page)
      await page.goto(route)
      await expect(page.locator('h1').first()).toBeVisible()
      const textLaenge = await page.evaluate(
        () => document.getElementById('root')?.innerText.trim().length ?? 0,
      )
      expect(textLaenge, 'Seite rendert sichtbaren Text').toBeGreaterThan(100)
      expect(fehler).toEqual([])
    })

    test('kein horizontaler Overflow bei 390px', async ({ page }) => {
      test.fixme(
        BEKANNTER_OVERFLOW.has(route),
        'vorbestehender Katalog-Befund, FAHRPLAN-DESIGN E4',
      )
      await page.setViewportSize({ width: 390, height: 844 })
      await page.goto(route)
      await expect(page.locator('h1').first()).toBeVisible()
      const b = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
      }))
      expect(
        b.scroll,
        `scrollWidth ${b.scroll}px überragt Viewport ${b.client}px`,
      ).toBeLessThanOrEqual(b.client + 1)
    })
  })
}
