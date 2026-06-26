// Layout-Regressionsschutz für den Schnellrechner-Kalender der Startseite
// (Auftrag David 26.6.2026 «füllt nicht alles aus»): der kompakte Kalender
// klebte als feste 12.5rem-Kachel links in seiner Karte und liess rechts
// Leerraum. Fix: Monate zentriert + fraktional wachsend (kompakt-Pfad in
// src/components/FristenKalender.tsx). Diese Tests sichern die Absicht ab,
// ohne pixelgenau zu sein: Monate sind zentriert UND füllen einen
// wesentlichen Anteil der Kartenbreite. Der Nicht-kompakt-Pfad der sechs
// Fristen-Formulare ist unberührt (Änderungen sind hinter `kompakt` gegated).
import { test, expect } from '@playwright/test'

// Misst die Monats-Flex-Reihe im Kalender: justify-content + Füllgrad.
async function kalenderMass(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const karten = [...document.querySelectorAll('div.lc-card')].filter((k) =>
      k.textContent?.includes('Fristenlauf'),
    )
    // innerste Karte (die Kalender-Karte selbst), nicht die Schnellrechner-Hülle
    const karte = karten.sort(
      (a, b) => a.getBoundingClientRect().width - b.getBoundingClientRect().width,
    )[0]
    if (!karte) return null
    const flex = [...karte.querySelectorAll('div')].find(
      (d) =>
        d.className.includes('flex-wrap') &&
        [...d.children].some((c) => c.querySelector('.grid')),
    )
    if (!flex) return null
    const monate = [...flex.children].filter((c) => c.querySelector('.grid'))
    const monateW = monate.reduce((s, m) => s + m.getBoundingClientRect().width, 0)
    return {
      justify: getComputedStyle(flex).justifyContent,
      monatAnzahl: monate.length,
      fuellgrad: monateW / flex.getBoundingClientRect().width,
    }
  })
}

test('kompakter Kalender ist zentriert und füllt seine Karte', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1200 })
  await page.goto('/')
  await expect(page.getByText('Fristenlauf', { exact: true })).toBeVisible()
  const m = await kalenderMass(page)
  expect(m, 'Kalender-Reihe gefunden').not.toBeNull()
  expect(m!.monatAnzahl, 'mindestens ein Monat gerendert').toBeGreaterThanOrEqual(1)
  expect(m!.justify, 'Monate zentriert (kompakt)').toBe('center')
  // Füllgrad: die Monate decken einen wesentlichen Teil der Reihe ab statt
  // links zu kleben (vorher konnte ein einzelner 12.5rem-Monat < 40 % füllen).
  expect(m!.fuellgrad, 'Monate füllen einen wesentlichen Anteil').toBeGreaterThan(0.55)
})

test('kompakter Kalender ohne Overflow bei 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await expect(page.getByText('Fristenlauf', { exact: true })).toBeVisible()
  const b = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }))
  expect(b.scroll, `scrollWidth ${b.scroll} ≤ ${b.client}`).toBeLessThanOrEqual(b.client + 1)
})
