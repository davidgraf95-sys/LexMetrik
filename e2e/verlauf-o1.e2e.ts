// Browser-Smoke der Verlauf-Initiative (UI-NAV O1). Prüft die zwei neuen
// Zugänge auf DERSELBEN localStorage-Verlauf-Quelle (§5):
//   1. ⌘K-/Fokus-Leerzustand der Kopf-Suche zeigt «Zuletzt geöffnet» + Einstiege.
//   2. Der Topbar-«Verlauf» öffnet ein Panel mit den zuletzt geöffneten Inhalten,
//      chronologisch gruppiert, §8-ehrlich «Nur auf diesem Gerät», mit «leeren».
// Läuft gegen `vite preview` (dist). Rechner-Routen tracken synchron (Label aus
// dem Shell-Bundle) → deterministisch ohne Manifest-Wartezeit.
import { test, expect, type Page } from '@playwright/test'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

const sucheFeld = (page: Page) => page.getByRole('combobox', { name: /LexMetrik durchsuchen/ })
const verlaufKnopf = (page: Page) => page.getByRole('button', { name: /Verlauf – zuletzt geöffnet/ })

// Baut einen Verlauf aus zwei Rechner-Besuchen auf (synchrones Tracking).
async function verlaufAufbauen(page: Page) {
  await page.goto('/rechner/tagerechner')
  await expect(page.locator('h1').first()).toBeVisible()
  await page.goto('/rechner/verjaehrung')
  await expect(page.locator('h1').first()).toBeVisible()
}

test.describe('UI-NAV O1 — Verlauf-Initiative', () => {
  test('⌘K-Leerzustand zeigt «Zuletzt geöffnet» + kuratierte Einstiege', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await verlaufAufbauen(page)

    // Feld leer fokussieren → Leerzustand statt Treffer. Auf den Such-Bereich
    // scopen (der Rubrik-Name «Gesetze» steht auch in der Seitenleiste).
    const suchBereich = page.getByRole('search').filter({ has: sucheFeld(page) })
    await sucheFeld(page).click()
    await expect(suchBereich.getByText('Zuletzt geöffnet', { exact: true })).toBeVisible()
    await expect(suchBereich.getByText('Einstieg', { exact: true })).toBeVisible()

    // Ein kuratierter Einstieg navigiert in die Rubrik.
    await suchBereich.getByRole('link', { name: 'Gesetze', exact: true }).click()
    await expect(page).toHaveURL(/\/gesetze$/)
    expect(fehler).toEqual([])
  })

  test('Topbar-Verlauf: Panel mit Einträgen, §8-Hinweis und «leeren»', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await verlaufAufbauen(page)

    // Der Verlauf-Trigger erscheint (nach Mount) und öffnet das Dialog-Panel.
    const knopf = verlaufKnopf(page)
    await expect(knopf).toBeVisible()
    await knopf.click()
    const panel = page.getByRole('dialog', { name: /Verlauf – zuletzt geöffnet/ })
    await expect(panel).toBeVisible()
    await expect(panel.getByText('Heute', { exact: true })).toBeVisible()
    // §8-Ehrlichkeit: rein lokal.
    await expect(panel.getByText('Nur auf diesem Gerät', { exact: true })).toBeVisible()

    // Ein Verlauf-Eintrag navigiert zum Ziel.
    await panel.getByRole('button', { name: /Verjährung/i }).first().click()
    await expect(page).toHaveURL(/\/rechner\/verjaehrung$/)

    // «Verlauf leeren» entfernt den Trigger (nichts mehr zu zeigen).
    await verlaufKnopf(page).click()
    await page.getByRole('button', { name: 'Verlauf leeren', exact: true }).click()
    await expect(verlaufKnopf(page)).toHaveCount(0)
    expect(fehler).toEqual([])
  })
})
