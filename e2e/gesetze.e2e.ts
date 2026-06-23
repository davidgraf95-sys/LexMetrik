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
    // Auf den Hauptinhalt scopen: die Seitenleiste trägt dieselben Begriffe, ist
    // aber je nach Breakpoint ausgeblendet → ein ungescoptes .first() träfe ein
    // hidden-Element. Privatrecht ist standardOffen → OR-Volltitel sichtbar.
    const inhalt = page.getByRole('main')
    await expect(inhalt.getByRole('link', { name: /Obligationenrecht/ }).first()).toBeVisible()
    await expect(inhalt.getByText('Privatrecht', { exact: false }).first()).toBeVisible()
    expect(fehler).toEqual([])
  })

  test('Kantone-Tab zeigt das Kantonsraster', async ({ page }) => {
    await page.goto('/gesetze')
    await page.getByRole('tab', { name: 'Kantone' }).click()
    // Das Auswahlraster zeigt je Kanton eine Karte (Wappen + Vollname + Zähler);
    // der frühere reine «BE»-Code-Knopf existiert in dieser Form nicht mehr.
    await expect(page.getByRole('main').getByRole('button', { name: /Bern/ })).toBeVisible()
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
    await page.getByRole('main').getByRole('link', { name: /Obligationenrecht/ }).first().click()
    await expect(page).toHaveURL(/\/gesetze\/bund\/OR/)
    // Kopf + Inhaltsverzeichnis + Artikel 1 (erstes Band offen)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('OR')
    await expect(page.getByText('Gliederung', { exact: true })).toBeVisible()
    await expect(page.locator('#art-1')).toContainText('Willensäusserung')
    // Standort beim Scrollen: der Scroll-Spy markiert die aktive Gliederung im
    // Inhaltsverzeichnis (data-toc-aktiv); der amtliche Randtitel je Artikel steht
    // in der Marginalspalte am Artikel. (Frühere Variante zeigte beides im sticky
    // Running-Header; aktuelles Design = TOC-Markierung + Marginalspalte.)
    await page.evaluate(() => window.scrollTo(0, 1200))
    await expect(page.locator('[data-toc-aktiv]').first()).toBeVisible()
    // In-Gesetz-Suche filtert
    await page.getByRole('searchbox', { name: 'Im Gesetz suchen' }).fill('Willensäusserung')
    await expect(page.getByText(/Treffer für/)).toBeVisible()
    expect(fehler).toEqual([])
  })

  // Regression (BS-Audit 23.6.2026, S13): lange Komposita in Aufzählungen
  // sprengten auf 390px den Reader (~25px H-Overflow im Steuergesetz). Nach dem
  // min-w-0 + overflow-wrap-Fix darf KEIN horizontaler Overflow mehr auftreten.
  test('Reader ohne horizontalen Overflow bei 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/gesetze/kanton/BS-640.100')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    // Erster Artikel-Absatz sichtbar (Inhalt gerendert).
    await expect(page.locator('article').first()).toBeVisible()
    const b = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }))
    expect(b.scroll, `scrollWidth ${b.scroll} > ${b.client}`).toBeLessThanOrEqual(b.client + 1)
  })

  // Regression: flacher Fallback (Erlass OHNE Gliederung/Struktur) darf die Lese-
  // spalte NICHT kollabieren. Vorher landete der einzige Grid-Inhalt in der 16rem-
  // TOC-Spalte → Body ~0 → ein Wort pro Zeile («alles verzogen»).
  test('flacher Reader (ohne TOC) behält volle Lesebreite', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1280, height: 1000 })
    await page.goto('/gesetze/kanton/ZH-243')
    const ersterAbsatz = page.locator('article p').first()
    await expect(ersterAbsatz).toBeVisible()
    const breite = (await ersterAbsatz.boundingBox())?.width ?? 0
    // Kollabiert wären ~115px; gesund ist die Lesespalte deutlich breiter.
    expect(breite).toBeGreaterThan(360)
    // Kein TOC bei fehlender Gliederung.
    await expect(page.getByText('Gliederung', { exact: true })).toHaveCount(0)
    expect(fehler).toEqual([])
  })
})
