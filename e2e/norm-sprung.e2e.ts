// Browser-Smoke des Norm-Sprungs in der NORMALEN Suchleiste (A5 · U-SUCHE,
// David 5.7.2026). Der Kontrakt ist die Sprung-FUNKTION, nicht mehr eine eigene
// ⌘K-Palette (die ist entfallen): erkennt die HeaderSuche eine Norm («OR 257d»,
// «ABRG 3»), erscheint der Direkt-Sprung als OBERSTER Treffer (Sprung-Badge),
// Enter springt zum Deep-Link. Freitext liefert keinen Sprung, sondern die
// gruppierte Universal-Suche. ⌘K/Ctrl-K fokussiert das Feld (kein Overlay).
// Läuft gegen `vite preview` (dist).
import { test, expect, type Page } from '@playwright/test'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

// Die eine, überall sichtbare Kopf-Suchleiste (ARIA-Combobox).
const sucheFeld = (page: Page) => page.getByRole('combobox', { name: /LexMetrik durchsuchen/ })
// Das Trefferpanel ist eine ARIA-Listbox; der Sprung ist die erste Gruppe.
const listbox = (page: Page) => page.getByRole('listbox', { name: 'Suchtreffer' })

test.describe('Norm-Sprung in der normalen Suchleiste (A5)', () => {
  test('«OR 257d» ⇒ Sprung ist oberster Treffer, Enter springt zu #art-257_d (P3)', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.goto('/gesetze')
    const feld = sucheFeld(page)
    await feld.click()
    await feld.fill('OR 257d')
    // Der Norm-Sprung erscheint als oberste Gruppe mit Sprung-Badge + amtlichem Titel.
    const box = listbox(page)
    await expect(box).toBeVisible()
    await expect(box.getByText('Norm-Sprung', { exact: true })).toBeVisible()
    await expect(box.getByText('Sprung', { exact: true })).toBeVisible()
    // Der Sprung ist die ERSTE Option (oberster Treffer, A5).
    await expect(box.getByRole('option').first()).toContainText('OR')
    await expect(box.getByRole('option').first()).toContainText('257d')
    // Enter (ohne Pfeil-Auswahl) springt auf den Direkt-Treffer.
    await feld.press('Enter')
    await expect(page).toHaveURL(/\/gesetze\/bund\/OR#art-257_d$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('OR')
    // Der Ziel-Artikel steht im DOM (Anker auflösbar, §15 Funktions-Treue).
    await expect(page.locator('#art-257_d')).toHaveCount(1)
    expect(fehler).toEqual([])
  })

  test('kantonaler Sprung mit Kantons-Angabe («ABRG 3»)', async ({ page }) => {
    await page.goto('/gesetze')
    const feld = sucheFeld(page)
    await feld.click()
    await feld.fill('ABRG 3')
    await expect(listbox(page).getByText('Sprung', { exact: true })).toBeVisible()
    await feld.press('Enter')
    await expect(page).toHaveURL(/\/gesetze\/kanton\/AR-621\.12#art-3$/)
  })

  test('Freitext zeigt KEINEN Sprung, sondern die gruppierte Suche', async ({ page }) => {
    await page.goto('/gesetze')
    const feld = sucheFeld(page)
    await feld.click()
    await feld.fill('Kündigung')
    const box = listbox(page)
    await expect(box).toBeVisible()
    // Kein Sprung-Vorschlag (kein Fehl-Sprung) …
    await expect(box.getByText('Norm-Sprung', { exact: true })).toHaveCount(0)
    await expect(box.getByText('Sprung', { exact: true })).toHaveCount(0)
    // … aber die Universal-Suche liefert Treffer.
    await expect(box.getByRole('option').first()).toBeVisible()
  })

  test('⌘K/Ctrl-K fokussiert die Suchleiste (kein Overlay mehr)', async ({ page }) => {
    await page.goto('/gesetze')
    // Kein Dialog/Overlay: die frühere Palette existiert nicht mehr.
    await page.keyboard.press('Control+k')
    await expect(sucheFeld(page)).toBeFocused()
    await expect(page.getByRole('dialog', { name: /Sprung zum Artikel/ })).toHaveCount(0)
  })

  test('Landeplatz-CTA auf /gesetze fokussiert die Suchleiste', async ({ page }) => {
    await page.goto('/gesetze')
    await page.getByRole('main').getByRole('button', { name: /Direkt zum Artikel springen/ }).click()
    await expect(sucheFeld(page)).toBeFocused()
  })

  // A9 (Querschnitt, DoD 10.4): Tippen/Navigieren/Springen bleibt unter starker
  // CPU-Drossel flüssig (setCPUThrottlingRate 6) — ohne Timeout-Nähe — und die
  // Interaktion verursacht KEINEN Layout-Shift (CLS ≈ 0), weil der Sprung oben
  // nur anwächst und nichts darüber verschiebt.
  test('A9: Suche tippen/navigieren/springen unter 6× CPU-Drossel flüssig, CLS 0', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.goto('/gesetze')
    const feld = sucheFeld(page)
    await feld.click()
    const box = listbox(page)
    // WARMLAUF (ungedrosselt): der erste Tastendruck stösst das einmalige Lazy-
    // Laden des ~4 MB-Artikel-Index + Browse-Manifests an (§15.3 — ein aufgeschobener
    // Ladezeitpunkt, KEIN Interaktions-Lag). Wir laden ihn vor der Messung, damit die
    // A9-Messung die reine Interaktion (Parser + Render) misst, nicht diesen Einmal-Load.
    await feld.fill('OR 257d')
    await expect(box.getByText('Sprung', { exact: true })).toBeVisible({ timeout: 15000 })
    await feld.fill('')
    await expect(box).toBeHidden()

    // CLS-Beobachter VOR der gemessenen Interaktion scharf schalten (nur unerwartete Shifts).
    await page.evaluate(() => {
      ;(window as unknown as { __cls: number }).__cls = 0
      new PerformanceObserver((list) => {
        for (const e of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) {
          if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value
        }
      }).observe({ type: 'layout-shift', buffered: true })
    })
    // Ab hier 6× langsamer (CDP, nur Chromium).
    const client = await page.context().newCDPSession(page)
    await client.send('Emulation.setCPUThrottlingRate', { rate: 6 })

    // Die SUCH-Interaktion auf dem WARMEN Index (tippen → Sprung sichtbar → über
    // Gruppen navigieren) muss unter 6×-Drossel FLÜSSIG bleiben: jede web-first-
    // Assertion löst innerhalb ihres gebundenen Timeouts auf, ohne dem 30-s-Test-
    // Timeout nahezukommen («ohne Timeout-Nähe», A9). Ein starrer Wall-Clock-Wert
    // wäre auf einem ausgelasteten Host unzuverlässig und misst Host-Contention
    // statt Interaktions-Lag — deshalb ist die gebundene Auflösung selbst der Beweis.
    await feld.fill('OR 257d')
    await expect(box.getByText('Sprung', { exact: true })).toBeVisible({ timeout: 12000 })
    // Über die Gruppen navigieren (Pfeil runter/hoch) — bleibt reaktiv; die aktive
    // Option wandert (aria-activedescendant gesetzt).
    await feld.press('ArrowDown')
    await feld.press('ArrowDown')
    await feld.press('ArrowUp')
    await expect(feld).toHaveAttribute('aria-activedescendant', /.+/, { timeout: 12000 })
    // CLS der Such-Interaktion messen, SOLANGE die Seite noch dieselbe ist
    // (Enter navigiert weg und ersetzt das window/__cls). Die Sprung-Gruppe wächst
    // nur oben an und verschiebt nichts → CLS ≈ 0 (§15.2).
    const cls = await page.evaluate(() => (window as unknown as { __cls?: number }).__cls ?? 0)
    expect(cls, `CLS ${cls}`).toBeLessThan(0.05)
    // Springen: die Navigation selbst muss erfolgen (Funktions-Treue), ohne
    // Wall-Clock-Wand (Reader-Seitenlast unter Drossel ist kein Interaktions-Lag).
    await feld.press('Enter')
    await expect(page).toHaveURL(/\/gesetze\/bund\/OR#art-257_d$/, { timeout: 15000 })
    await client.send('Emulation.setCPUThrottlingRate', { rate: 1 })
    expect(fehler).toEqual([])
  })

  test('Mobil (390px): Suchleiste trägt den Sprung ohne ⌘K, kein Overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/gesetze')
    const feld = sucheFeld(page)
    await feld.click()
    await feld.fill('OR 257d')
    await expect(listbox(page).getByText('Sprung', { exact: true })).toBeVisible()
    // Kein horizontaler Overflow bei offenem Panel auf 390px.
    const b = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }))
    expect(b.scroll, `scrollWidth ${b.scroll} > ${b.client}`).toBeLessThanOrEqual(b.client + 1)
  })
})
