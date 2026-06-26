// Regressionsschutz für die einheitliche Randtitel-Formatierung (Auftrag 6a,
// David 26.6.2026 «uneinheitliche Bold-Formatierung»). Zwei stabile Rollen
// (margStufeStil): das BLATT (unterste gezeigte Stufe = Sachüberschrift) ist
// immer prominent, die VORFAHREN sind ruhiger Kontext je absoluter Tiefe — so
// flippt kein Vorfahre («II. Handlungsfähigkeit») mehr zwischen den Artikeln.
// Diese Tests prüfen die Invariante glyph-agnostisch am echten ZGB-Reader.
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

test('Blatt (Sachüberschrift) ist je Stapel die prominenteste Stufe', async ({ page }) => {
  const stapel = await margStapel(page)
  expect(stapel.length, 'ZGB hat Randtitel-Stapel').toBeGreaterThan(5)
  for (const zeilen of stapel) {
    const blatt = zeilen[zeilen.length - 1]
    // Das Blatt (= die eigentliche Sachüberschrift) ist immer prominent
    // (16px / ≥600) — auch wenn der Stapel nur eine Stufe hat.
    expect(blatt.size, `Blatt ${JSON.stringify(blatt.text)}`).toBeGreaterThanOrEqual(16)
    expect(blatt.weight, `Blatt ${JSON.stringify(blatt.text)}`).toBeGreaterThanOrEqual(600)
    // Vorfahren sind ruhiger Kontext: nie grösser/schwerer als das Blatt und
    // nie selbst fett (kein zweiter «Titel» im Stapel).
    for (let i = 0; i < zeilen.length - 1; i++) {
      expect(zeilen[i].size, `Vorfahr ${JSON.stringify(zeilen[i].text)}`).toBeLessThan(blatt.size)
      expect(zeilen[i].weight, `Vorfahr ${JSON.stringify(zeilen[i].text)}`).toBeLessThan(600)
    }
  }
})

test('Höchstens drei definierte Randtitel-Stil-Stufen (kein Wildwuchs)', async ({ page }) => {
  const stapel = await margStapel(page)
  const stile = new Set(stapel.flat().map((z) => `${z.size}/${z.weight}`))
  // margStufeStil definiert genau drei Stufen: Blatt 16/600, Vorfahr-Abschnitt
  // 14/500, Vorfahr-tiefer 14/400 → höchstens drei distinkte (size,weight)-Paare.
  expect(stile.size, `gefundene Stile: ${[...stile].join(', ')}`).toBeLessThanOrEqual(3)
})
