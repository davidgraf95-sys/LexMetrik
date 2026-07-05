// U-UEBERSICHT (W2·5d · A14 + A15) — Gliederungs-Umschalter auf allen drei
// Säulen (Relevanz · Systematisch · Rechtsgebiet), Kanton-Titelumbruch statt
// Kappen, Persistenz + Deep-Links, URL-Kompatibilität, Flüssigkeit @6×-Throttle
// (A9). Reine Darstellung (§3); läuft gegen `vite preview` (dist).
import { test, expect, type Page } from '@playwright/test'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

async function keinOverflow(page: Page) {
  const b = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }))
  expect(b.scroll, `scrollWidth ${b.scroll} > ${b.client}`).toBeLessThanOrEqual(b.client + 1)
}

test.describe('U-UEBERSICHT — Gliederungs-Umschalter (A15)', () => {
  test('Bund: Relevanz · Systematisch · Rechtsgebiet umschaltbar, URL trägt ?gliederung=', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.goto('/gesetze?ebene=bund')
    const main = page.getByRole('main')
    const gruppe = main.getByRole('group', { name: 'Gliederung' })
    await expect(gruppe).toBeVisible()

    // Default = Systematisch (die amtliche Systematik, byte-gleich zum Ist-Stand).
    await expect(gruppe.getByRole('button', { name: 'Systematisch' })).toHaveAttribute('aria-pressed', 'true')
    await expect(main.getByRole('button', { name: 'Alle aufklappen' })).toBeVisible()

    // Relevanz → flaches Gitter «die relevantesten zuerst» + Leitgesetze (BV) sichtbar.
    await gruppe.getByRole('button', { name: 'Relevanz' }).click()
    await expect(page).toHaveURL(/gliederung=relevanz/)
    await expect(main.getByText(/relevantesten Erlasse zuerst/)).toBeVisible()
    await expect(main.getByRole('link', { name: /Bundesverfassung/ }).first()).toBeVisible()

    // Rechtsgebiet → G6-Sicht (Querschnitts-Themen) als Modus in der Bund-Säule.
    await gruppe.getByRole('button', { name: 'Rechtsgebiet' }).click()
    await expect(page).toHaveURL(/gliederung=rechtsgebiet/)
    await expect(main.getByRole('heading', { name: 'Querschnitts-Themen' })).toBeVisible()

    expect(fehler).toEqual([])
  })

  test('International: Relevanz + SR-0.*-Rechtsgebiet-Gruppen', async ({ page }) => {
    await page.goto('/gesetze?ebene=international&gliederung=rechtsgebiet')
    const main = page.getByRole('main')
    await expect(main.getByText(/Völkerrechts-Sachachse/)).toBeVisible()
    // 0.1 «Internationales Recht — Allgemeines» (EMRK u.a.).
    await expect(main.getByRole('heading', { name: /Internationales Recht/ }).first()).toBeVisible()
    // Relevanz-Modus rendert ein Karten-Gitter.
    await main.getByRole('group', { name: 'Gliederung' }).getByRole('button', { name: 'Relevanz' }).click()
    await expect(main.getByText(/relevantesten Erlasse zuerst/)).toBeVisible()
  })

  test('Deep-Link setzt die Sicht direkt', async ({ page }) => {
    await page.goto('/gesetze?ebene=bund&gliederung=relevanz')
    const main = page.getByRole('main')
    await expect(main.getByRole('group', { name: 'Gliederung' }).getByRole('button', { name: 'Relevanz' }))
      .toHaveAttribute('aria-pressed', 'true')
    await expect(main.getByText(/relevantesten Erlasse zuerst/)).toBeVisible()
  })

  test('Persistenz: die geklickte Wahl gilt auf einer anderen Säule ohne ?gliederung=', async ({ page }) => {
    // Ein Klick persistiert (localStorage) — eine Wahl für alle drei Säulen (A15).
    await page.goto('/gesetze?ebene=bund')
    const main = page.getByRole('main')
    await main.getByRole('group', { name: 'Gliederung' }).getByRole('button', { name: 'Relevanz' }).click()
    await expect(main.getByText(/relevantesten Erlasse zuerst/)).toBeVisible()
    // Frische Navigation auf eine andere Säule OHNE Parameter → persistente Wahl gilt.
    await page.goto('/gesetze?ebene=international')
    await expect(main.getByRole('group', { name: 'Gliederung' }).getByRole('button', { name: 'Relevanz' }))
      .toHaveAttribute('aria-pressed', 'true')
  })
})

test.describe('U-UEBERSICHT — Kanton (A14: Relevanz + Titelumbruch)', () => {
  test('Relevanz-Sortierung; lange Titel umbrechen statt kappen (BS)', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.goto('/gesetze?ebene=kanton&kt=BS&gliederung=relevanz')
    const main = page.getByRole('main')
    await expect(main.getByText(/Kern-Erlasse zuerst/)).toBeVisible()

    // A14: der Titel wird NICHT einzeilig gekappt (kein `truncate`/white-space:nowrap).
    const zeile = main.locator('a[href^="/gesetze/kanton/BS-"]').first()
    await expect(zeile).toBeVisible()
    const titel = zeile.locator('span').nth(1)
    const ws = await titel.evaluate((el) => getComputedStyle(el).whiteSpace)
    expect(ws).not.toBe('nowrap')
    // Der Titel-Text ist nicht klippend abgeschnitten (Umbruch passt in die Spalte).
    const masse = await titel.evaluate((el) => ({ s: el.scrollWidth, c: el.clientWidth }))
    expect(masse.s, `Titel scrollWidth ${masse.s} > clientWidth ${masse.c} (gekappt statt umgebrochen)`)
      .toBeLessThanOrEqual(masse.c + 1)
    expect(fehler).toEqual([])
  })

  test('Kanton @390: kein H-Overflow in Relevanz und Rechtsgebiet', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/gesetze?ebene=kanton&kt=BS&gliederung=relevanz')
    await expect(page.getByRole('main').getByText(/Kern-Erlasse zuerst/)).toBeVisible()
    await keinOverflow(page)
    await page.getByRole('main').getByRole('group', { name: 'Gliederung' }).getByRole('button', { name: 'Rechtsgebiet' }).click()
    await expect(page.getByRole('main').getByText(/Nach Rechtsgebiet gruppiert/)).toBeVisible()
    await keinOverflow(page)
  })
})

test.describe('U-UEBERSICHT — URL-Kompatibilität (bestehende Deep-Links)', () => {
  test('?ansicht=rechtsgebiet (G6-Tür) bleibt erreichbar', async ({ page }) => {
    await page.goto('/gesetze?ansicht=rechtsgebiet')
    await expect(page.getByRole('heading', { name: 'Querschnitts-Themen' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Grundgerüst nach Rechtsgebiet' })).toBeVisible()
  })

  test('?ebene=kanton&kt=ZH bleibt Default Systematisch (Nicht systematisiert)', async ({ page }) => {
    await page.goto('/gesetze?ebene=kanton&kt=ZH')
    await expect(page.getByText('Nicht systematisiert').first()).toBeVisible()
  })

  test('?ebene=bund bleibt Default Systematisch (Alle aufklappen)', async ({ page }) => {
    await page.goto('/gesetze?ebene=bund')
    await expect(page.getByRole('main').getByRole('button', { name: 'Alle aufklappen' })).toBeVisible()
  })
})

test.describe('U-UEBERSICHT — A9 Flüssigkeit unter CPU-Throttle 6×', () => {
  test('Umschalten bleibt flüssig, ohne Fehler', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    const client = await page.context().newCDPSession(page)
    await client.send('Emulation.setCPUThrottlingRate', { rate: 6 })
    await page.goto('/gesetze?ebene=bund')
    const main = page.getByRole('main')
    const gruppe = main.getByRole('group', { name: 'Gliederung' })
    await expect(gruppe).toBeVisible()

    for (const [name, marke] of [
      ['Relevanz', /relevantesten Erlasse zuerst/],
      ['Rechtsgebiet', /Querschnitts-Themen/],
      ['Systematisch', /Alle aufklappen/],
    ] as const) {
      const t0 = Date.now()
      await gruppe.getByRole('button', { name }).click()
      if (name === 'Systematisch') {
        await expect(main.getByRole('button', { name: 'Alle aufklappen' })).toBeVisible({ timeout: 8000 })
      } else {
        await expect(main.getByText(marke).first()).toBeVisible({ timeout: 8000 })
      }
      // Grosszügiges Budget (6×-gedrosselt): der Umschalter reagiert ohne Hänger.
      expect(Date.now() - t0, `Umschalten «${name}» zu langsam`).toBeLessThan(6000)
    }
    await client.send('Emulation.setCPUThrottlingRate', { rate: 1 })
    expect(fehler).toEqual([])
  })
})
