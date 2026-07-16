// A31a (David-Befund 16.7.2026 Ziff. 3): Die SR-Fussnote 667 in ZGB Art. 798a
// gehört INLINE in den Fliesstext nach «1991» (so rendert Fedlex), nicht an die
// Artikelebene/Marginalie. fn 666 («Eingefügt durch …») bleibt an der Marginalie.
// Prüft das am echten ZGB-Reader (gebautes dist via vite preview).
import { test, expect } from '@playwright/test'

test('ZGB 798a: fn 667 steht INLINE im Fliesstext-Absatz, fn 666 bleibt Artikelebene', async ({ page }) => {
  await page.goto('/gesetze/bund/ZGB')
  // Zielartikel sichtbar machen (content-visibility → in den Viewport scrollen).
  await page.goto('/gesetze/bund/ZGB#art-798_a')
  const art = page.locator('#art-798_a')
  await expect(art).toBeVisible()
  await art.scrollIntoViewIfNeeded()

  const fn666 = art.getByRole('button', { name: 'Fussnote 666' })
  const fn667 = art.getByRole('button', { name: 'Fussnote 667' })
  await expect(fn666).toBeVisible()
  await expect(fn667).toBeVisible()

  // fn 667 sitzt im FLIESSTEXT-Absatz (dem <p>, das mit «Für die Verpfändung»
  // beginnt) — eindeutig, nicht der Fussnoten-Apparat, der denselben Wortlaut zitiert.
  const fliessAbsatz = art.locator('p', { hasText: 'Für die Verpfändung' })
  await expect(fliessAbsatz).toHaveCount(1)
  await expect(fliessAbsatz.getByRole('button', { name: 'Fussnote 667' })).toHaveCount(1)
  // fn 666 sitzt NICHT im Fliesstext-Absatz (sondern an der Marginalie/Artikelkopf).
  await expect(fliessAbsatz.getByRole('button', { name: 'Fussnote 666' })).toHaveCount(0)

  // Positionsbeleg: fn 667 rendert NACH dem Wort «1991» im selben Absatz.
  const boxWort = await fliessAbsatz.evaluate((el) => {
    const t = el.textContent ?? ''
    return t.includes('1991') && t.includes('bäuerliche Bodenrecht')
  })
  expect(boxWort, 'Fliesstext trägt «1991» und «bäuerliche Bodenrecht»').toBeTruthy()
})

// A43 (David-Befund 16.7.): Die Fussnoten-Reihenfolge im Apparat folgt der
// Fedlex-Dokumentreihenfolge (laufende Nummer). Bei SchKG Art. 56 gehört die
// Randtitel-/Section-Fussnote 95 («III. Geschlossene Zeiten …», steht ÜBER dem
// Artikel) VOR die artikel-eigenen 96–98 — vorher wurde sie ans Ende gehängt.
test('SchKG 56: Fussnoten-Apparat in Fedlex-Reihenfolge (95 vor 96–98)', async ({ page }) => {
  await page.goto('/gesetze/bund/SCHKG#art-56')
  const art = page.locator('#art-56')
  await expect(art).toBeVisible()
  await art.scrollIntoViewIfNeeded()
  const order = await art.locator('[data-fn-apparat]').evaluate((el) =>
    [...el.querySelectorAll('p')].map((p) => p.querySelector('.num')?.textContent?.trim()).filter(Boolean),
  )
  expect(order).toEqual(['95', '96', '97', '98'])
})

