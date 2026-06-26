// Browser-Smoke der Rubrik «Rechtsprechung»: Übersicht rendert + lädt das
// Manifest, Klick führt in den Reader (gegliederter Entscheid), keine Console-/
// Page-Errors, kein Mobil-Overflow. Läuft gegen `vite preview` (dist).
import { test, expect, type Page } from '@playwright/test'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

test.describe('/rechtsprechung — Übersicht', () => {
  test('rendert, lädt das Manifest, zeigt Entscheid-Karten ohne Fehler', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.goto('/rechtsprechung')
    await expect(page.getByRole('heading', { name: 'Rechtsprechung' }).first()).toBeVisible()
    // Manifest lädt clientseitig → mindestens eine Entscheid-Karte (Link in den Reader).
    await expect(page.locator('a[href^="/rechtsprechung/"]').first()).toBeVisible()
    await page.screenshot({ path: 'e2e-shots/rechtsprechung-uebersicht.png', fullPage: true })
    expect(fehler).toEqual([])
  })

  test('trennt Bund und Kantone (Segment + beschriftete Abschnitte)', async ({ page }) => {
    await page.goto('/rechtsprechung')
    // Segment-Schalter mit beiden Ebenen
    await expect(page.getByRole('button', { name: /Bundesgericht/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Kantone/ })).toBeVisible()
    // Beide beschrifteten Abschnitte erscheinen
    await expect(page.getByRole('heading', { name: /Bundesgericht/ })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Kantonale Gerichte/ })).toBeVisible()
  })

  test('kein horizontaler Overflow bei 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/rechtsprechung')
    await expect(page.getByRole('heading', { name: 'Rechtsprechung' }).first()).toBeVisible()
    await page.screenshot({ path: 'e2e-shots/rechtsprechung-mobil.png', fullPage: true })
    const b = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }))
    expect(b.scroll, `scrollWidth ${b.scroll} > ${b.client}`).toBeLessThanOrEqual(b.client + 1)
  })
})

test.describe('Verzahnung im Gesetzes-Reader', () => {
  test('BGG zeigt «Bundesgerichtsentscheide zu diesem Erlass»', async ({ page }) => {
    await page.goto('/gesetze/bund/BGG')
    await expect(page.getByText('Bundesgerichtsentscheide zu diesem Erlass', { exact: false })).toBeVisible()
    await page.screenshot({ path: 'e2e-shots/verzahnung-bgg.png', fullPage: false })
  })
})

test.describe('Reader (über Klick aus der Übersicht)', () => {
  test('öffnet einen Entscheid mit Kopf, Abschnitten und Provenienz', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.goto('/rechtsprechung')
    await page.locator('a[href^="/rechtsprechung/"]').first().click()
    await expect(page).toHaveURL(/\/rechtsprechung\/.+/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    // Gegliederte Lesesicht: mindestens die Erwägungen-Überschrift.
    await expect(page.getByText('Erwägungen', { exact: false }).first()).toBeVisible()
    // Provenienz-Fuss: Live-Link auf die amtliche Fassung.
    await expect(page.getByText('massgebliche Fassung', { exact: false })).toBeVisible()
    await page.screenshot({ path: 'e2e-shots/rechtsprechung-reader.png', fullPage: true })
    expect(fehler).toEqual([])
  })
})

test.describe('Leitentscheid — Ansichten «Amtlicher BGE-Auszug» ⟷ «Vollständiges Urteil»', () => {
  test('Default Auszug; Wechsel auf Vollständiges Urteil ändert den Body (§8)', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.goto('/rechtsprechung/bge_152_IV_14')
    await expect(page.getByRole('heading', { level: 1, name: /BGE 152 IV 14/ })).toBeVisible()

    const voll = page.getByRole('tab', { name: /Vollständiges Urteil/ })
    const auszug = page.getByRole('tab', { name: /Amtlicher BGE-Auszug/ })
    await expect(auszug).toBeVisible()
    await expect(voll).toBeVisible()
    // Leitentscheid ist Default-Ansicht (Regeste-forward).
    await expect(auszug).toHaveAttribute('aria-selected', 'true')
    const body = page.locator('article').first()
    const auszugText = (await body.innerText()).trim()
    expect(auszugText.length).toBeGreaterThan(100)

    await voll.click()
    await expect(voll).toHaveAttribute('aria-selected', 'true')
    const vollText = (await body.innerText()).trim()
    expect(vollText).not.toEqual(auszugText)

    await auszug.click()
    await expect(auszug).toHaveAttribute('aria-selected', 'true')
    expect((await body.innerText()).trim()).toEqual(auszugText)

    await page.screenshot({ path: 'e2e-shots/leitentscheid-ansichten.png', fullPage: true })
    expect(fehler).toEqual([])
  })

  test('Deep-Link ?ansicht=voll öffnet direkt die Voll-Ansicht', async ({ page }) => {
    await page.goto('/rechtsprechung/bge_152_IV_14?ansicht=voll')
    await expect(page.getByRole('tab', { name: /Vollständiges Urteil/ })).toHaveAttribute('aria-selected', 'true')
  })

  test('Übersicht führt vollständige Urteile als getrennte Einträge', async ({ page }) => {
    await page.goto('/rechtsprechung')
    await expect(page.getByRole('heading', { name: /Vollständige Urteile zu den Leitentscheiden/ })).toBeVisible()
    await expect(page.locator('a[href*="ansicht=voll"]').first()).toBeVisible()
  })
})
