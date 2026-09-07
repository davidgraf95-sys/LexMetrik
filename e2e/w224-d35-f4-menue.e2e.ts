// @shard-gruppe: 6
// ═══ W2·24 · D35-F4 — DIE EINE MENÜ-ANATOMIE, AM GEBAUTEN STAND ════════════
//
// BEFUND (gemessen 7.9.2026 am Vorstand `091e38ae5`, Ansicht-Menü des Lesers,
// OR #art-336_c, @1440 hell):
//   · Die vier Zeilen massen 38 / 38 / 37 / 52 px. Die 37 war die letzte
//     Schalterzeile (ihr fehlte die trennende Haarlinie), die 52 der
//     Schriftregler.
//   · Der AUS-Zustand rendert nur einen LEEREN Hakenplatz — einziger
//     sichtbarer Unterschied ist die Tintenstufe. Davids Bild dazu:
//     «Fussnoten»/«Fassung» lesen sich wie Rubriken, nicht wie Schalter.
//   · Der Schriftregler sass in einem 135 × 35 px grossen Kasten mit eigener
//     Kante (`border-line`) und eigener Fläche (`--surface`).
//   · Die Fläche des Menüs lag @1440 bei x 952–1256, die Lesespalte bei
//     553–1195.
// Die Zahlen bleiben stehen, was auch immer später gemessen wird (§0 Ziff. 2b).
//
// ROT ZU BEKOMMEN (§6.7 — einmal gegen den Vorstand gefahren, Protokoll
// `abnahme/design-identitaet/D35-F4-MENUE.md`): `ui/Menue.tsx` auf den leeren
// Hakenplatz zurück, `.lc-menu-zeile` wieder mit `border-bottom` + `:last-child`
// statt `min-height`, `SchriftgroessenRegler` zurück in die Pille — dann
// scheitern «gleiche Zeilenhöhe», «Aus-Zustand hat eine Form» und «Regler ohne
// Rahmen/Eigenfläche» zusammen.
import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe.configure({ timeout: 120_000 })

const ERLASS = '/gesetze/bund/OR#art-336_c'

/** Leser laden und das Ansicht-Menü aufziehen. */
async function ansichtAuf(page: Page, w: number, h: number): Promise<void> {
  await page.setViewportSize({ width: w, height: h })
  await page.goto(ERLASS)
  await expect(page.locator('[data-v3-kopf]')).toBeVisible({ timeout: 45_000 })
  await page.waitForTimeout(1200)
  await page.locator('[data-v3-ansicht]').first().click()
  await expect(page.locator('[data-v3-ansicht-panel]')).toBeVisible({ timeout: 30_000 })
}

/** Alle Zeilen des Menüs — Schalter, Knopfzeilen UND Reglerzeile. */
const ZEILEN = '[data-v3-ansicht-panel] .lc-menu-zeile, [data-v3-ansicht-panel] .lc-menu-regler'

test.describe('D35-F4 — jede Menüzeile ist gleich hoch', () => {
  for (const [w, h] of [[1440, 900], [390, 844]] as const) {
    test(`@${w}: alle Zeilen ±1 px gleich`, async ({ page }) => {
      await ansichtAuf(page, w, h)
      const hoehen = await page.locator(ZEILEN).evaluateAll(
        (els) => els.map((e) => Math.round(e.getBoundingClientRect().height)),
      )
      expect(hoehen.length, 'das Menü trägt Zeilen').toBeGreaterThanOrEqual(3)
      const min = Math.min(...hoehen)
      const max = Math.max(...hoehen)
      expect(max - min, `Zeilenhöhen: ${hoehen.join(' / ')}`).toBeLessThanOrEqual(1)
    })
  }
})

test.describe('D35-F4 — der Aus-Zustand ist eine Form, keine Tintenstufe', () => {
  test('@1440: jeder Schalter zeigt seine Marke in BEIDEN Stellungen', async ({ page }) => {
    await ansichtAuf(page, 1440, 900)
    const marken = async () => page.locator('[data-v3-ansicht-panel] [role="menuitemcheckbox"]').evaluateAll(
      (els) => els.map((e) => {
        const m = e.querySelector<HTMLElement>('[data-menu-marke]')
        const r = m?.getBoundingClientRect()
        return {
          an: e.getAttribute('aria-checked'),
          da: !!m,
          b: Math.round(r?.width ?? 0),
          hh: Math.round(r?.height ?? 0),
          kante: m ? getComputedStyle(m).borderTopWidth : '',
        }
      }),
    )
    const vorher = await marken()
    expect(vorher.length, 'Schalter im Ansicht-Menü').toBeGreaterThanOrEqual(2)
    for (const m of vorher) {
      expect(m.da, `Marke vorhanden (aria-checked=${m.an})`).toBe(true)
      expect(m.b, `Markenbreite (aria-checked=${m.an})`).toBeGreaterThanOrEqual(10)
      expect(m.hh, `Markenhöhe (aria-checked=${m.an})`).toBeGreaterThanOrEqual(10)
      expect(m.kante, `Markenkante (aria-checked=${m.an})`).toBe('1px')
    }
    // Umlegen — die Form bleibt, nur ihre Füllung wechselt. Genau das war der
    // Befund: vorher verschwand im Aus-Zustand ALLES ausser der Tintenstufe.
    const erster = page.locator('[data-v3-ansicht-panel] [role="menuitemcheckbox"]').first()
    const stand = await erster.getAttribute('aria-checked')
    await erster.click()
    await expect(erster).toHaveAttribute('aria-checked', stand === 'true' ? 'false' : 'true')
    const nachher = await marken()
    for (const m of nachher) {
      expect(m.da, 'Marke auch nach dem Umlegen').toBe(true)
      expect(m.b).toBeGreaterThanOrEqual(10)
    }
    expect(nachher[0].an).not.toBe(vorher[0].an)
  })
})

test.describe('D35-F4 — der Schriftregler ist eine Zeile, kein Kasten', () => {
  test('@1440: keine eigene Kante, keine eigene Fläche', async ({ page }) => {
    await ansichtAuf(page, 1440, 900)
    const m = await page.locator('[data-v3-ansicht-panel] span:has(> [data-v3-schrift="kleiner"])').evaluate((el) => {
      const s = getComputedStyle(el)
      return {
        oben: s.borderTopWidth, unten: s.borderBottomWidth,
        links: s.borderLeftWidth, rechts: s.borderRightWidth,
        grund: s.backgroundColor,
        radius: s.borderTopLeftRadius,
      }
    })
    expect([m.oben, m.unten, m.links, m.rechts].join('/'), 'Rahmen des Reglers').toBe('0px/0px/0px/0px')
    // «Keine Eigenfläche» heisst: durchsichtig — der Grund ist das Papier des
    // Menüs, nicht eine zweite Stufe darüber (F0.6/F0.9).
    expect(m.grund, 'Grund des Reglers').toMatch(/rgba\(0, 0, 0, 0\)|transparent/)
    expect(m.radius, 'Radius des Reglers').toBe('0px')
  })
})

test.describe('D35-F4 — das Menü bleibt im Fenster und deckt mit Papier', () => {
  for (const [w, h] of [[1440, 900], [390, 844]] as const) {
    test(`@${w}: ≤ 320 px breit, ganz im Fenster, undurchsichtig`, async ({ page }) => {
      await ansichtAuf(page, w, h)
      const m = await page.locator('[data-v3-ansicht-panel]').evaluate((el) => {
        const r = el.getBoundingClientRect()
        const s = getComputedStyle(el)
        return {
          b: Math.round(r.width), l: Math.round(r.left), re: Math.round(r.right),
          o: Math.round(r.top), u: Math.round(r.bottom),
          fenster: window.innerWidth, hoch: window.innerHeight,
          grund: s.backgroundColor, kante: s.borderTopWidth,
        }
      })
      expect(m.b, 'Menübreite').toBeLessThanOrEqual(320)
      expect(m.l, 'linke Kante im Fenster').toBeGreaterThanOrEqual(0)
      expect(m.re, 'rechte Kante im Fenster').toBeLessThanOrEqual(m.fenster)
      expect(m.o, 'obere Kante im Fenster').toBeGreaterThanOrEqual(0)
      // Papier + 1 px Linie: der Grund ist deckend (kein `rgba(…, <1)`), die
      // Trennung zum Lesetext trägt die Haarlinie.
      expect(m.grund, 'Grund des Menüs').not.toMatch(/rgba\([^)]*,\s*0(?:\.\d+)?\)$/)
      expect(m.kante, 'Kante des Menüs').toBe('1px')
    })
  }
})

test.describe('D35-F4 — a11y des aufgezogenen Menüs', () => {
  test('@1440: keine axe-Verstösse im Ansicht-Menü', async ({ page }) => {
    await ansichtAuf(page, 1440, 900)
    const ergebnis = await new AxeBuilder({ page })
      .include('[data-v3-ansicht-panel]')
      .analyze()
    const schwer = ergebnis.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')
    expect(schwer.map((v) => `${v.id} (${v.impact}): ${v.nodes.length}`), 'axe').toEqual([])
  })

  test('@1440: Rollen und Tastatur bleiben, wie D4 sie gesetzt hat', async ({ page }) => {
    await ansichtAuf(page, 1440, 900)
    const panel = page.locator('[data-v3-ansicht-menue]')
    await expect(panel).toHaveAttribute('role', 'menu')
    expect(await page.locator('[role="menuitemcheckbox"]').count()).toBeGreaterThanOrEqual(2)
    await page.keyboard.press('ArrowDown')
    const fokus1 = await page.evaluate(() => document.activeElement?.textContent?.trim() ?? '')
    await page.keyboard.press('ArrowDown')
    const fokus2 = await page.evaluate(() => document.activeElement?.textContent?.trim() ?? '')
    expect(fokus1, 'Pfeiltaste bewegt den Fokus').not.toBe(fokus2)
    await page.keyboard.press('Escape')
    await expect(page.locator('[data-v3-ansicht-panel]')).toHaveCount(0)
  })
})
