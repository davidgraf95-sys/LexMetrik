import { test, expect, type Page } from '@playwright/test'

// ─── E6a·M5: Amtliche-Materialien-Delta in der Verzahnungs-UI ───────────────
// Prüft am gebauten dist: (1) die «Amtliche Materialien»-Gruppe am Gesetz-Fuss
// vereint kuratierte + async Soft-Law-Kanten mit Fundstellen-Sublabel + Stand;
// (2) der kuratierte Nachtrag DATABREACH → «via Art. 24»; (3) die
// nur-verweis-Badge auf der MaterialLeser-Karte; (4) kein Overflow @390, keine
// Konsolenfehler.

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

test('DSG-Reader: «Amtliche Materialien»-Gruppe mit kuratiertem Art.-Sublabel + Dokument-Stand', async ({ page }) => {
  const fehler = fehlerSammeln(page)
  await page.goto('/gesetze/bund/DSG')

  // Gruppen-Überschrift (Overline «Legt aus · Amtliche Materialien»).
  const gruppe = page.getByRole('heading', { name: /Amtliche Materialien/ })
  await expect(gruppe).toBeVisible({ timeout: 15000 })

  // Kuratierter M5-Nachtrag: DATABREACH → via Art. 24 (sync, in-Bundle).
  const dbLink = page.getByRole('link', { name: /Meldung von Datensicherheitsverletzungen/ })
  await expect(dbLink).toBeVisible()
  await expect(dbLink).toContainText('via Art. 24')
  await expect(dbLink).toContainText('Stand')

  expect(fehler, `Konsolen-/Seitenfehler:\n${fehler.join('\n')}`).toEqual([])
})

test('DSG-Reader @390: async Soft-Law-Dokument erscheint, kein horizontaler Overflow (§15)', async ({ page }) => {
  const fehler = fehlerSammeln(page)
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto('/gesetze/bund/DSG')

  // Ein per Adapter erfasstes EDÖB-DB-Dokument (nur im register.json + Shard, NICHT
  // im in-Bundle-Register) — beweist den async-Loader + Merge.
  await expect(
    page.getByRole('link', { name: /Anmeldeformulare(n)? für Mietwohnungen/ }),
  ).toBeVisible({ timeout: 15000 })

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow, `horizontaler Overflow ${overflow}px bei 390px`).toBeLessThanOrEqual(1)

  expect(fehler, `Konsolen-/Seitenfehler:\n${fehler.join('\n')}`).toEqual([])
})

test('MaterialLeser-Karte trägt die nur-verweis-Badge (V3-Vorzug E6a·M5)', async ({ page }) => {
  const fehler = fehlerSammeln(page)
  await page.goto('/materialien/EDOEB-LEITFADEN-DATABREACH')

  await expect(page.getByRole('heading', { name: /Meldung von Datensicherheitsverletzungen/ })).toBeVisible()
  // role="img" mit aria-label «nur Verweis …» (StatusBadge voll, ohne Glyph).
  await expect(page.getByRole('img', { name: /nur Verweis/ })).toBeVisible()
  // Der prominente amtliche Live-Link bleibt (§7c).
  await expect(page.getByRole('link', { name: /Zur amtlichen Fassung/ })).toBeVisible()

  expect(fehler, `Konsolen-/Seitenfehler:\n${fehler.join('\n')}`).toEqual([])
})
