// G6 (W2·5d) — Rechtsgebiets-Sicht als «Gerüst»: die zweite Gliederung quer zum
// Bund-Korpus (Querschnitts-Themen + Auto-Grundgerüst). Prüft Rendern, Deep-Link,
// tolerante Abdeckungs-Angabe, Verzahnung, Rückweg — ohne Console-Fehler/Overflow.
import { test, expect, type Page } from '@playwright/test'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => {
    if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`)
  })
  return fehler
}

test.describe('/gesetze — Rechtsgebiets-Sicht (G6)', () => {
  test('vierte Tür öffnet Querschnitts-Themen + Grundgerüst, Deep-Link, Rückweg', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.goto('/gesetze')
    const main = page.getByRole('main')

    // Der Landeplatz trägt die vierte Tür NEBEN den drei Ebenen-Kacheln.
    const tuer = main.getByRole('button', { name: /Nach Rechtsgebiet & Thema/ })
    await expect(tuer).toBeVisible()
    await tuer.click()
    await expect(page).toHaveURL(/ansicht=rechtsgebiet/)

    // Beide Ebenen der Sicht sind da: das kuratierte Delta + das Grundgerüst.
    await expect(main.getByRole('heading', { name: 'Querschnitts-Themen' })).toBeVisible()
    await expect(main.getByRole('heading', { name: 'Grundgerüst nach Rechtsgebiet' })).toBeVisible()

    // Ein Thema (Arbeit) rendert mit Entwurf-Marke (§8-Ehrlichkeit).
    const arbeit = main.getByRole('heading', { name: 'Arbeit', level: 3 })
    await expect(arbeit).toBeVisible()

    // Enger Bereich = Deep-Link auf den ersten Artikel (Anker bleibt #art-…, K2/R8).
    const orSpanne = main.getByRole('link', { name: /Art\. 319–362/ }).first()
    await expect(orSpanne).toHaveAttribute('href', /\/gesetze\/bund\/OR#art-319/)

    // Verzahnung: das Thema Arbeit verweist auf einen Rechner + die Rechtsprechung.
    await expect(main.getByRole('link', { name: /Kündigung & Fristen im Arbeitsverhältnis/ }).first())
      .toHaveAttribute('href', /\/rechner\/kuendigung/)
    await expect(main.getByRole('link', { name: /Rechtsprechung · Privatrecht/ }).first())
      .toHaveAttribute('href', /\/rechtsprechung\?rg=privat/)

    // Tolerante Abdeckung (§4.4): ehrlich beziffert, nie «vollständig» behauptet.
    await expect(main.getByText(/einem Querschnitts-Thema\s+zugeordnet/)).toBeVisible()

    // Grundgerüst-Gruppe aufklappen zeigt Erlasse (deckt auch unzugeordnete).
    await main.getByText('Privatrecht', { exact: true }).first().click()
    await expect(main.getByRole('link', { name: /Obligationenrecht/ }).first()).toBeVisible()

    // Rückweg zum Landeplatz.
    await main.getByRole('button', { name: '← Übersicht' }).click()
    await expect(page).not.toHaveURL(/ansicht=rechtsgebiet/)
    await expect(main.getByRole('button', { name: /Bundesrecht/ })).toBeVisible()

    expect(fehler).toEqual([])
  })

  test('kein horizontaler Overflow bei 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/gesetze?ansicht=rechtsgebiet')
    await expect(page.getByRole('heading', { name: 'Querschnitts-Themen' })).toBeVisible()
    const b = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }))
    expect(b.scroll, `scrollWidth ${b.scroll} > ${b.client}`).toBeLessThanOrEqual(b.client + 1)
  })
})
