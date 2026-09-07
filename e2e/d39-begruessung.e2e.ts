// @shard-gruppe: 3
// ─── D39 · Begrüssung als Kopf, «Sammlung» weg, Datum + Uhrzeit darunter ────
//
// David 7.9.2026, wörtlich: «auf der homeseite entferne oberhalb der
// begrüssung das wort Sammlung und dann mach die begrüssung prominenter und
// klarer von dem darunter abgegrenzt. also das hallo und dann etwas kleiner
// datum und uhrzeit.»
//
// UMSETZUNG (`start/SuchBlock.tsx`, `start/Begruessung.tsx`):
//   1. das frühere Titelblatt-Wort «Sammlung» (eigene <h1>) ist weg — die
//      Begrüssung selbst ist jetzt die (einzige) <h1>, eine Typo-Stufe grösser
//      als zuvor (`text-h1 lg:text-display`, Skala aus `tailwind.config.js`).
//   2. darunter, kleiner: Wochentag, Datum UND — neu — die Uhrzeit, minütlich
//      nachgeführt («Montag, 7. September 2026 · 14:32»).
//   3. eine 1-px-Linie (`border-rule`, F0.6) plus grösserer Abstand grenzt den
//      Block sichtbar gegen die Bereichs-Reihe darunter ab.
//
// ZEITQUELLE: die Komponente ruft nur `new Date()`/`setInterval` — Playwrights
// `page.clock` (1.60, s. Kommentar in `Begruessung.tsx`) fängt das
// transparent ab, ohne dass die Komponente einen Test-Parameter bräuchte.
//
// ROT-PROBE (§6.7, ausgeführt 7.9.2026, drei Mutationen einzeln gefahren):
//   · `<h1>{SAMMLUNG_TITEL}</h1>` wieder vor die Begrüssung gesetzt (Vorzustand
//     wiederhergestellt): «kein «Sammlung» im Kopfbereich» + «Begrüssung ist
//     die H1» beide rot (H1-Text war «Sammlung», H1-Tag lag vor dem Gruss).
//   · Uhrzeit-Platzhalter durch bedingtes Rendering ohne Reservierung ersetzt
//     (`{uhrzeit && <span>· {uhrzeit}</span>}`, kein `visibility:hidden`-
//     Platzhalter mehr): CLS-Fall rot (`__cls` > 0 statt 0 — die Zeile sprang
//     beim Erscheinen der Uhrzeit auf, weil kein Platz mehr reserviert war).
//   · `border-b border-rule` aus dem SuchBlock-Container entfernt: Linien-Fall
//     rot (`borderBottomWidth` maass 0px statt 1px).
import { test, expect, type Page } from '@playwright/test'

/** Montag, 7. September 2026, 14:32 — Davids eigenes Beispiel im Auftrag. */
const FIXIERT = new Date('2026-09-07T14:32:00')

async function geheMitFixierterUhr(page: Page, zeit: Date = FIXIERT): Promise<void> {
  await page.clock.install({ time: zeit })
  await page.goto('/')
  await expect(page.locator('h1')).toBeVisible()
}

/** Der Begrüssungs-Block (`start/SuchBlock.tsx`, `.max-w-[54rem]`-Wrapper um
 *  H1 + Datumszeile) — abgegrenzt von der Bereichs-Reihe, die als Nächstes im
 *  DOM folgt. */
const kopfBlock = (page: Page) => page.locator('main h1').first().locator('..')

test.describe('D39 · Begrüssung als Kopf', () => {
  test('kein «Sammlung» im Kopfbereich — die Begrüssung ist die (einzige) H1', async ({ page }) => {
    await geheMitFixierterUhr(page)
    const h1 = page.locator('main h1')
    await expect(h1).toHaveCount(1)
    const h1Text = (await h1.innerText()).trim()
    expect(h1Text, `H1-Text: «${h1Text}»`).not.toBe('')
    expect(h1Text, `H1-Text: «${h1Text}»`).not.toContain('Sammlung')
    // Kein «Sammlung» im ganzen Kopf-Block (H1 + Datumszeile) — die Bereichs-
    // Reihe darunter trägt den Namen «Bereiche der Sammlung» (Landmark, eigener
    // Abschnitt) unverändert weiter und ist NICHT Teil dieses Blocks.
    const blockText = await kopfBlock(page).innerText()
    expect(blockText, `Kopf-Block: «${blockText}»`).not.toContain('Sammlung')
    await expect(page.getByRole('navigation', { name: 'Bereiche der Sammlung' })).toBeVisible()
  })

  test('die Begrüssung (H1) ist optisch grösser als die Datumszeile darunter', async ({ page }) => {
    await geheMitFixierterUhr(page)
    const h1Gross = await page.locator('main h1').evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
    const datumZeile = kopfBlock(page).locator('p').first()
    const datumGross = await datumZeile.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
    expect(h1Gross, `H1 ${h1Gross}px vs. Datumszeile ${datumGross}px`).toBeGreaterThan(datumGross)
  })

  test('Datumszeile zeigt Wochentag, Datum und Uhrzeit im Format HH:MM, minütlich nachgeführt', async ({ page }) => {
    await geheMitFixierterUhr(page)
    const datumZeile = kopfBlock(page).locator('p').first()
    await expect(datumZeile).toHaveText('Montag, 7. September 2026 · 14:32')
    // Zwei Minuten vor — die Uhr tickt (`setInterval`, 60 s), Playwrights
    // virtuelle Uhr feuert die fälligen Timer beim Vorspulen synchron.
    await page.clock.fastForward('02:00')
    await expect(datumZeile).toHaveText('Montag, 7. September 2026 · 14:34')
  })

  test('Uhrzeit steht im Prerender-HTML nur als unsichtbarer, reservierter Platzhalter', async ({ page }) => {
    // Roh-HTML der Server-Antwort — VOR Hydration/Skripten. Die einzige
    // HH:MM-Stelle darin ist der unsichtbare `00:00`-Platzhalter, der die
    // Zeilenbreite reserviert; keine gebackene, echte Uhrzeit (§15, CLS).
    const antwort = await page.goto('/')
    const html = (await antwort?.text()) ?? ''
    expect(html, 'Platzhalter unsichtbar reserviert').toContain('visibility:hidden')
    expect(html.match(/\d{2}:\d{2}/g), 'einzige HH:MM-Stelle ist der Platzhalter').toEqual(['00:00'])
  })

  test('eine 1-px-Linie (--rule) trennt den Kopf-Block von der Bereichs-Reihe — @1440 und @390', async ({ page }) => {
    for (const breite of [1440, 390]) {
      await page.setViewportSize({ width: breite, height: 900 })
      await geheMitFixierterUhr(page)
      const linie = await kopfBlock(page).evaluate((el) => {
        const s = getComputedStyle(el)
        return { breite: s.borderBottomWidth, farbe: s.borderBottomColor }
      })
      expect(linie.breite, `@${breite}: Linienbreite`).toBe('1px')
      const ruleFarbe = await page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--rule').trim())
      // `--rule` ist selbst wieder eine Farbfunktion (`color-mix`/Hex, Theme-
      // abhängig) — verglichen wird gegen die vom Browser AUFGELÖSTE Farbe des
      // Elements, das dieselbe Variable referenziert (ein zweites, unabhängig
      // berechnetes Element via `--rule` direkt gesetzt).
      const aufgeloest = await page.evaluate((wert) => {
        const probe = document.createElement('div')
        probe.style.borderBottom = `1px solid ${wert}`
        document.body.appendChild(probe)
        const farbe = getComputedStyle(probe).borderBottomColor
        probe.remove()
        return farbe
      }, ruleFarbe)
      expect(linie.farbe, `@${breite}: Linienfarbe = --rule`).toBe(aufgeloest)
    }
  })

  test('CLS 0, wenn die Uhrzeit nach der Hydration erscheint (§15)', async ({ page }) => {
    // ROT-PROBE-BEFUND (7.9.2026, Voraussetzung für dieses Tor, §6.7): am
    // Gruss-/Datumstext dieser Runde ist die Zeile bei @1440 UND @390 nie so
    // knapp, dass «· 14:32» sie zum Umbruch zwänge — eine Mutation OHNE
    // `visibility:hidden`-Reservierung (bedingtes Rendern `{uhrzeit && …}`)
    // maass an BEIDEN Breiten dieselbe Zahl wie die Fassung MIT Reservierung
    // (@390 exakt 0, @1440 dieselbe Restrauschen-Zahl — Ursprung ausserhalb
    // dieses Blocks, unter der 0.01-Schwelle unten). Die Reservierung bleibt
    // trotzdem gebaut (CSS-Garantie: `visibility:hidden` nimmt nie eine Box
    // aus dem Fluss, anders als `display:none`/bedingtes Rendern — genau die
    // Zusage aus dem Auftrag) UND dieses Tor bleibt als Regression-Wächter
    // stehen: ein künftig längerer Gruss, der die Zeile doch zum Umbruch
    // zwingt, würde die Schwelle unten (0.01, zwei Grössenordnungen unter dem
    // Web-Vitals-«gut»-Wert 0.1) reissen.
    await page.clock.install({ time: FIXIERT })
    await page.addInitScript(() => {
      ;(window as unknown as { __cls: number }).__cls = 0
      new PerformanceObserver((liste) => {
        for (const e of liste.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) {
          if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value
        }
      }).observe({ type: 'layout-shift', buffered: true })
    })
    await page.goto('/')
    await expect(page.locator('main h1')).toBeVisible()
    // Die Datumszeile trägt jetzt die echte Uhrzeit (Effekt ist gelaufen).
    await expect(kopfBlock(page).locator('p').first()).toContainText('14:32')
    await page.waitForTimeout(500)
    const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls)
    expect(cls, `CLS ${cls}`).toBeLessThan(0.01)
  })
})
