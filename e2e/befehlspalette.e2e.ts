// Browser-Smoke der Befehls-/Sprung-Palette (Cmd/Ctrl-K · W2·5d G4). Prüft den
// Artikel-Sprung in ≤2 Interaktionen (öffnen → tippen + Enter), den Freitext-
// Fallback (kein Fehl-Sprung), den Mobil-Klick-Zugang und Esc. Läuft gegen
// `vite preview` (dist).
import { test, expect, type Page } from '@playwright/test'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

const dialogVon = (page: Page) => page.getByRole('dialog', { name: 'Suche und Sprung zum Artikel' })

// Palette über die Tastatur öffnen — ERST warten, bis React hydratisiert ist
// (der Landeplatz-CTA erscheint erst nach dem Manifest-Load), sonst rast der
// keydown dem window-Listener davon.
async function oeffnePerTaste(page: Page) {
  await page.getByRole('main').getByRole('button', { name: /Direkt zum Artikel springen/ }).waitFor()
  await page.keyboard.press('Control+k')
  await expect(dialogVon(page)).toBeVisible()
}

test.describe('Befehls-/Sprung-Palette (Cmd/Ctrl-K)', () => {
  test('Cmd/Ctrl-K → «OR 257d» → Enter springt direkt zu Art. 257d', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.goto('/gesetze')
    await oeffnePerTaste(page)
    const dialog = dialogVon(page)
    const feld = dialog.getByRole('combobox')
    await feld.fill('OR 257d')
    // Direktsprung-Vorschlag erscheint (Parser hat aufgelöst) — dann Enter.
    await expect(dialog.getByText('Sprung', { exact: true })).toBeVisible()
    await feld.press('Enter')
    await expect(page).toHaveURL(/\/gesetze\/bund\/OR#art-257_d$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('OR')
    // Der Ziel-Artikel steht im DOM (Anker auflösbar, §15 Funktions-Treue).
    await expect(page.locator('#art-257_d')).toHaveCount(1)
    expect(fehler).toEqual([])
  })

  test('kantonaler Sprung mit Kantons-Angabe («ABRG 3»)', async ({ page }) => {
    await page.goto('/gesetze')
    await oeffnePerTaste(page)
    const dialog = dialogVon(page)
    const feld = dialog.getByRole('combobox')
    await feld.fill('ABRG 3')
    await expect(dialog.getByText('Sprung', { exact: true })).toBeVisible()
    await feld.press('Enter')
    await expect(page).toHaveURL(/\/gesetze\/kanton\/AR-621\.12#art-3$/)
  })

  test('Freitext zeigt KEINEN Direktsprung, sondern die normale Suche', async ({ page }) => {
    await page.goto('/gesetze')
    await oeffnePerTaste(page)
    const dialog = dialogVon(page)
    await dialog.getByRole('combobox').fill('Kündigung')
    // Kein Sprung-Vorschlag (kein Fehl-Sprung) …
    await expect(dialog.getByText('Sprung', { exact: true })).toHaveCount(0)
    // … aber die Universal-Suche liefert Treffer.
    await expect(dialog.getByRole('listbox')).toBeVisible()
  })

  test('Esc schliesst die Palette', async ({ page }) => {
    await page.goto('/gesetze')
    await oeffnePerTaste(page)
    await page.keyboard.press('Escape')
    await expect(dialogVon(page)).toHaveCount(0)
  })

  test('Mobil: Topbar-Knopf öffnet die Palette (kein physisches Cmd-K)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/gesetze')
    await page.getByRole('button', { name: 'Befehle und Sprung zum Artikel öffnen' }).click()
    await expect(dialogVon(page)).toBeVisible()
    // Kein horizontaler Overflow bei offener Palette auf 390px.
    const b = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }))
    expect(b.scroll, `scrollWidth ${b.scroll} > ${b.client}`).toBeLessThanOrEqual(b.client + 1)
  })

  test('Landeplatz-CTA auf /gesetze öffnet die Palette', async ({ page }) => {
    await page.goto('/gesetze')
    await page.getByRole('main').getByRole('button', { name: /Direkt zum Artikel springen/ }).click()
    await expect(dialogVon(page)).toBeVisible()
  })
})
