// Browser-Smoke der /suche-Ergebnisseite (UI-NAV S5). Kontrakt: die im
// Header-Dropdown gekappten Gesetzestext-Treffer werden hier ungekappt
// zugänglich; der Deep-Link ?q= ist stabil/teilbar; die Inhaltstyp-Facette
// filtert; das Dropdown verlinkt «alle N →» hierher. Läuft gegen `vite preview`.
import { test, expect, type Page } from '@playwright/test'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

const sucheFeld = (page: Page) => page.getByRole('combobox', { name: /LexMetrik durchsuchen/ })

test.describe('/suche — Volltext-Ergebnisseite (S5)', () => {
  test('Deep-Link ?q=Miete: H1 «Suche», Gesetzestext-Gruppe ungekappt (mehr als das Dropdown)', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.goto('/suche?q=Miete')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Suche')
    // Die Gesetzestext-Gruppe erscheint und zeigt mietrechtliche OR-Artikel …
    const gesetzestext = page.getByRole('group', { name: 'Gesetzestext' })
    await expect(gesetzestext).toBeVisible()
    // … ungekappt: deutlich mehr als die 6 des Dropdowns (S5-Kernnutzen §8).
    const zeilen = gesetzestext.getByRole('listitem')
    await expect.poll(async () => zeilen.count()).toBeGreaterThan(6)
    // Der definitorische Artikel OR 253 ist unter den Treffern (S4-Ranking).
    await expect(gesetzestext.getByRole('link', { name: /Art\. 253 OR/ }).first()).toBeVisible()
    expect(fehler).toEqual([])
  })

  test('Inhaltstyp-Facette filtert auf eine Gruppe', async ({ page }) => {
    await page.goto('/suche?q=Miete')
    const facette = page.getByRole('group', { name: /Nach Inhaltstyp filtern/ })
    await expect(facette).toBeVisible()
    // Auf «Gesetzestext» filtern → nur diese Gruppe bleibt sichtbar (exact, sonst
    // matcht der Teilstring «Gesetze» auch die «Gesetzestext»-Gruppe).
    await facette.getByRole('button', { name: /^Gesetzestext/ }).click()
    await expect(page.getByRole('group', { name: 'Gesetzestext', exact: true })).toBeVisible()
    await expect(page.getByRole('group', { name: 'Gesetze', exact: true })).toHaveCount(0)
  })

  test('?q= ist stabil: Tippen spiegelt in die URL, Reload stellt die Query wieder her', async ({ page }) => {
    await page.goto('/suche')
    const feld = page.getByRole('searchbox', { name: /LexMetrik durchsuchen/ })
    await feld.fill('Verjährung')
    await expect(page).toHaveURL(/\/suche\?q=Verj/)
    await page.reload()
    await expect(page.getByRole('searchbox', { name: /LexMetrik durchsuchen/ })).toHaveValue('Verjährung')
  })

  test('Norm-Query auf /suche zeigt den Norm-Sprung', async ({ page }) => {
    await page.goto('/suche?q=OR%20257d')
    await expect(page.getByText('Norm-Sprung', { exact: true })).toBeVisible()
  })

  test('Header-Dropdown verlinkt «alle N →» auf /suche (Gesetzestext-Gruppe)', async ({ page }) => {
    await page.goto('/gesetze')
    const feld = sucheFeld(page)
    await feld.click()
    await feld.fill('Miete')
    const box = page.getByRole('listbox', { name: 'Suchtreffer' })
    await expect(box).toBeVisible()
    // Die Gesetzestext-Gruppe im Dropdown trägt jetzt einen «alle N →»-Link nach
    // /suche — bislang war sie die einzige Gruppe ohne «alle N»-Ziel (§8).
    const suchLink = box.locator('a[href^="/suche?q="]')
    await expect(suchLink.first()).toBeVisible()
    await suchLink.first().click()
    await expect(page).toHaveURL(/\/suche\?q=Miete/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Suche')
  })
})
