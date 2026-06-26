// Regressionsschutz für die einheitliche Randtitel-Formatierung (Auftrag 6a,
// David 26.6.2026): Randtitel-Stufen werden je ABSOLUTER Gliederungstiefe
// formatiert, nicht je Position im angezeigten Delta. Vorher flippte dieselbe
// Stufe (z. B. «II. Handlungsfähigkeit») zwischen fett (als Blatt) und klein
// (als Vorfahre). Diese Tests prüfen die Invariante glyph-agnostisch am echten
// ZGB-Reader: pro Randtitel-Stapel ist der Stil monoton mit der Tiefe, und es
// gibt nur die drei definierten Stil-Stufen (margStufeStil).
import { test, expect } from '@playwright/test'

async function margStapel(page: import('@playwright/test').Page) {
  await page.goto('/gesetze/bund/ZGB')
  await expect(page.locator('a[href="#art-11"]').first()).toBeVisible()
  return page.evaluate(() => {
    const stapel = [...document.querySelectorAll('div.font-serif.leading-snug')].filter((d) =>
      d.className.includes('space-y-0.5'),
    )
    return stapel.map((s) =>
      [...s.children].map((c) => {
        const cs = getComputedStyle(c as Element)
        return {
          text: (c.textContent ?? '').trim().slice(0, 30),
          size: parseFloat(cs.fontSize),
          weight: parseInt(cs.fontWeight, 10),
        }
      }),
    )
  })
}

test('Randtitel-Stufen sind je Tiefe monoton (tiefer ≥ prominenter)', async ({ page }) => {
  const stapel = await margStapel(page)
  expect(stapel.length, 'ZGB hat Randtitel-Stapel').toBeGreaterThan(5)
  for (const zeilen of stapel) {
    for (let i = 1; i < zeilen.length; i++) {
      // tiefere Stufe nie kleiner / leichter als die darüberliegende
      expect(zeilen[i].size, `Stapel ${JSON.stringify(zeilen.map((z) => z.text))}`).toBeGreaterThanOrEqual(
        zeilen[i - 1].size,
      )
      expect(zeilen[i].weight).toBeGreaterThanOrEqual(zeilen[i - 1].weight)
    }
  }
})

test('Genau drei definierte Randtitel-Stil-Stufen, kein Fett-Flip', async ({ page }) => {
  const stapel = await margStapel(page)
  const stile = new Set(stapel.flat().map((z) => `${z.size}/${z.weight}`))
  // margStufeStil definiert genau drei Stufen (14/500, 14/500-mixed, 16/600);
  // Grösse×Gewicht ergibt zwei bzw. drei distinkte Paare — nie mehr.
  expect(stile.size, `gefundene Stile: ${[...stile].join(', ')}`).toBeLessThanOrEqual(3)
  // Es MUSS sowohl eine ruhige (14px) als auch die prominente (16px) Stufe geben.
  expect([...stile].some((s) => s.startsWith('14'))).toBe(true)
  expect([...stile].some((s) => s.startsWith('16'))).toBe(true)
})
