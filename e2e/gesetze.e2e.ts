// Browser-Smoke der Rubrik V «Gesetze»: Übersicht rendert + lädt das Manifest,
// Klick führt in die Lesesicht (Volltext + TOC + In-Gesetz-Suche), keine
// Console-/Page-Errors, kein Mobil-Overflow. Läuft gegen `vite preview` (dist).
import { test, expect, type Page } from '@playwright/test'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => {
    if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`)
  })
  return fehler
}

test.describe('/gesetze — Übersicht', () => {
  test('rendert, lädt das Register, zeigt Erlass-Karten ohne Fehler', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.goto('/gesetze')
    await expect(page.getByRole('heading', { name: 'Schweizer Gesetzessammlung' })).toBeVisible()
    // Manifest lädt clientseitig → Karten erscheinen (OR-Volltitel als Anker).
    await expect(page.getByRole('link', { name: /Obligationenrecht/ }).first()).toBeVisible()
    // Rechtsgebiet-Gruppen
    await expect(page.getByText('Privatrecht', { exact: false }).first()).toBeVisible()
    expect(fehler).toEqual([])
  })

  test('Kantone-Tab zeigt das Kantonsraster', async ({ page }) => {
    await page.goto('/gesetze')
    await page.getByRole('tab', { name: 'Kantone' }).click()
    await expect(page.getByRole('button', { name: 'BE', exact: true })).toBeVisible()
  })

  test('kein horizontaler Overflow bei 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/gesetze')
    await expect(page.getByRole('heading', { name: 'Schweizer Gesetzessammlung' })).toBeVisible()
    const b = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }))
    expect(b.scroll, `scrollWidth ${b.scroll} > ${b.client}`).toBeLessThanOrEqual(b.client + 1)
  })
})

test.describe('Lesesicht (über Klick aus der Übersicht)', () => {
  test('OR öffnet mit Volltext, TOC und funktionierender In-Gesetz-Suche', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.goto('/gesetze')
    await page.getByRole('link', { name: /Obligationenrecht/ }).first().click()
    await expect(page).toHaveURL(/\/gesetze\/bund\/OR/)
    // Kopf + Inhaltsverzeichnis + Artikel 1 (erstes Band offen)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('OR')
    await expect(page.getByText('Inhalt', { exact: true })).toBeVisible()
    await expect(page.locator('#art-1')).toContainText('Willensäusserung')
    // In-Gesetz-Suche filtert
    await page.getByRole('searchbox', { name: 'Im Gesetz suchen' }).fill('Willensäusserung')
    await expect(page.getByText(/Treffer für/)).toBeVisible()
    expect(fehler).toEqual([])
  })
})
