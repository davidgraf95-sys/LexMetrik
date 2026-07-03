// Verzahnungs-UI V1a (W2·7-VZUI): die 5 Magic-Moment-Leitfälle aus
// FAHRPLAN-VERZAHNUNG-UI §4 + die Zusatzaufträge David 3.7.2026 (Fundstellen-
// Landung je Linkquelle, Popover-Verankerung am Link) + a11y-Stichprobe auf den
// neuen Flächen. Läuft gegen `vite preview` (dist).
import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// EIN Leitentscheid-aria-label an allen vier Fundorten (Magic Moment 4) —
// dieselbe Konstante wie in StatusBadge.tsx (Textgleichheit ist der Testinhalt).
const LEIT_ARIA = 'Leitentscheid — amtlich publizierter BGE'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

// ── MM1: Steuerbeamter auf Art. 16 DBG — Artikel/Erlass als Hub ──────────────
test('MM1: DBG-Fuss trägt ≥2 Kontextgruppen mit Overline + Zähler + Hinweis; CLS ≈ 0', async ({ page }) => {
  const fehler = fehlerSammeln(page)
  await page.goto('/gesetze/bund/DBG')
  await expect(page.locator('#art-16')).toBeAttached()
  // CLS-Probe des Erstaufbaus (§15.2): Layout-Shifts ohne Nutzereingabe aufsummieren.
  const cls = await page.evaluate(() => new Promise<number>((res) => {
    let sum = 0
    type LS = PerformanceEntry & { hadRecentInput: boolean; value: number }
    new PerformanceObserver((l) => { for (const e of l.getEntries() as LS[]) if (!e.hadRecentInput) sum += e.value })
      .observe({ type: 'layout-shift', buffered: true })
    setTimeout(() => res(sum), 1500)
  }))
  expect(cls).toBeLessThan(0.05)
  // Kontext-Panel am Erlass-Ende: Entscheide + Materialien + Werkzeuge.
  const kontext = page.locator('section[aria-labelledby="kontext-titel"]')
  await kontext.scrollIntoViewIfNeeded()
  const gruppen = kontext.locator('h3')
  await expect(gruppen.first()).toBeVisible({ timeout: 10_000 })
  expect(await gruppen.count()).toBeGreaterThanOrEqual(2)
  // Jede Gruppe: Zähler (num-Span in der Overline); Richtungs-/Herkunfts-Texte da.
  for (const g of await gruppen.all()) await expect(g.locator('.num')).toBeVisible()
  await expect(kontext.getByText('Wird zitiert von', { exact: false }).first()).toBeVisible()
  await expect(kontext.getByText('erfasste Entscheide', { exact: false }).first()).toBeVisible()
  await expect(kontext.getByText('Legt aus', { exact: false }).first()).toBeVisible()
  expect(fehler).toEqual([])
})

// ── MM2: Anwältin im Leitentscheid — beide Richtungen am Fuss, kein Gütesiegel ─
test('MM2: Entscheid-Fuss trägt «Zitierte Normen» artikelscharf; kein «gültig»/«geprüft»', async ({ page }) => {
  const fehler = fehlerSammeln(page)
  await page.goto('/rechtsprechung/bge_151_III_377')
  await expect(page.getByRole('heading', { level: 1, name: /151 III 377/ })).toBeVisible()
  const kontext = page.locator('section[aria-labelledby="kontext-titel"]')
  await kontext.scrollIntoViewIfNeeded()
  await expect(kontext.getByText('Zitierte Normen', { exact: false }).first()).toBeVisible({ timeout: 10_000 })
  // artikelscharfe Chips (Art.-Buttons) statt grober Erlass-Gruppe (§2.2):
  expect(await kontext.getByRole('button', { name: /^Art\./ }).count()).toBeGreaterThanOrEqual(2)
  await expect(kontext.getByText('Wendet an', { exact: false }).first()).toBeVisible()
  // §8-rote Linie: nirgends ein Gültigkeits-/Prüf-Siegel.
  const text = (await kontext.textContent()) ?? ''
  expect(text).not.toMatch(/gültig|geprüft|verifiziert/)
  expect(fehler).toEqual([])
})

// ── MM3: Gericht liest Entscheid, schlägt Norm daneben auf (Split-View) ───────
test('MM3 (≥lg): NormPopover-⧉ öffnet die Norm im Pane, der Entscheid bleibt offen', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/rechtsprechung/bge_152_V_52')
  await expect(page.getByRole('heading', { level: 1, name: /152 V 52/ })).toBeVisible()
  const link = page.getByRole('link', { name: 'Art. 18 UVG', exact: true }).first()
  await link.scrollIntoViewIfNeeded()
  const scrollVor = await page.evaluate(() => window.scrollY)
  await link.click()
  const dialog = page.locator('[role="dialog"]')
  await expect(dialog).toBeVisible()
  const daneben = dialog.getByRole('button', { name: /nebeneinander öffnen/ })
  await expect(daneben).toBeVisible()
  await daneben.click()
  // Pane offen (Split-View), Entscheid bleibt Hauptfenster + Lese-Position
  // erhalten: der Scroll wandert vom window in den PRIMÄR-Pane-Container
  // (Split-View-Architektur) — der Betrag bleibt derselbe.
  await expect(page.locator('[data-pane="sekundaer"]')).toBeVisible({ timeout: 10_000 })
  await expect(page.getByRole('heading', { level: 1, name: /152 V 52/ })).toBeVisible()
  const primaerScroll = await page.evaluate(() =>
    document.querySelector('[data-pane="primaer"]')?.scrollTop ?? -1)
  expect(Math.abs(primaerScroll - scrollVor)).toBeLessThan(150)
})

test('MM3 (Mobile): kein ⧉ im NormPopover unter lg', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/rechtsprechung/bge_152_V_52')
  const link = page.getByRole('link', { name: 'Art. 18 UVG', exact: true }).first()
  await link.scrollIntoViewIfNeeded()
  await link.click()
  const dialog = page.locator('[role="dialog"]')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button', { name: /nebeneinander öffnen/ })).toHaveCount(0)
})

// ── MM4: Studentin am ★ — EIN aria-label an allen vier Fundorten ─────────────
test('MM4: ★-aria-label textgleich in Reader, Panel, Leitfall-Zeile und Suche; Tooltip fokussier-/klickbar', async ({ page }) => {
  // (a) Reader-Kopf (Volltext-Badge, interaktiv): das aria-label trägt der
  // fokussierbare Begriff-Button selbst (accessible name, kein aria-label auf
  // role-losem Span — axe aria-prohibited-attr).
  await page.goto('/rechtsprechung/bge_151_III_377')
  const begriff = page.locator('header').getByRole('button', { name: LEIT_ARIA })
  await expect(begriff).toBeVisible()
  await begriff.click()
  await expect(page.getByRole('tooltip')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('tooltip')).toHaveCount(0)

  // (b) KontextPanel-Zeile (Glyph) am Gesetz.
  await page.goto('/gesetze/bund/ZGB')
  const kontext = page.locator('section[aria-labelledby="kontext-titel"]')
  await kontext.scrollIntoViewIfNeeded()
  await expect(kontext.locator(`[role="img"][aria-label="${LEIT_ARIA}"]`).first()).toBeVisible({ timeout: 10_000 })

  // (c) Leitfall-Zeile am Artikel (Glyph im KantenChip). Auf dem langsamen
  // CI-Runner racet der Hash-Sprung mit content-visibility — explizit zum
  // Artikel scrollen (erzwingt Render + idle-Shard-Load), wie im
  // Fundstellen-Test A; Assertion unverändert.
  await page.goto('/gesetze/bund/ZGB#art-684')
  const art = page.locator('#art-684')
  await art.scrollIntoViewIfNeeded()
  await expect(art.locator(`[role="img"][aria-label="${LEIT_ARIA}"]`).first()).toBeVisible({ timeout: 15_000 })

  // (d) Universal-Suche (Volltext-Badge im Treffer).
  await page.goto('/')
  await page.keyboard.press('/')
  await page.keyboard.type('152 II 19')
  await expect(page.locator(`[aria-label="${LEIT_ARIA}"]`).first()).toBeVisible({ timeout: 10_000 })
})

// ── MM5: Nutzer am Erlass-Ende — Top-Entscheide MIT Artikel-Sublabel ─────────
test('MM5: jeder OR-Panel-Entscheid trägt das «via Art. N»-Sublabel', async ({ page }) => {
  await page.goto('/gesetze/bund/OR')
  const kontext = page.locator('section[aria-labelledby="kontext-titel"]')
  await kontext.scrollIntoViewIfNeeded()
  const links = kontext.locator('a[href^="/rechtsprechung/"]:not([href^="/rechtsprechung?"])')
  await expect(links.first()).toBeVisible({ timeout: 10_000 })
  const texte = await links.allTextContents()
  const chips = texte.filter((t) => !/^Alle /.test(t))
  expect(chips.length).toBeGreaterThanOrEqual(5)
  for (const t of chips) expect(t).toMatch(/via Art\./)
})

// ── Fundstellen-Landung je Linkquelle (Zusatzauftrag David 3.7.2026) ──────────
test('Fundstelle A (Gesetz-Chip): ZGB Art. 684 → BGE 151 III 377 landet auf der Erwägung', async ({ page }) => {
  await page.goto('/gesetze/bund/ZGB#art-684')
  const art = page.locator('#art-684')
  const chip = art.locator('a[href*="bge_151_III_377"]').first()
  await chip.scrollIntoViewIfNeeded()
  await expect(chip).toBeVisible({ timeout: 15_000 })
  await expect(chip).toHaveAttribute('href', /norm=Art\.(%20|\+| )684(%20|\+| )ZGB/)
  await chip.click()
  // Referenzfall (David): die massgebliche Erwägung E. 2.3.1 («Art. 684 i.V.m.
  // Art. 679 ZGB») steht nach dem on-demand-Laden im Viewport.
  await expect(page.locator('#e-2-3-1')).toBeInViewport({ timeout: 15_000 })
})

test('Fundstelle B (Zitiert-Gruppe): ↳ E.-Sprung erreicht die zitierende Erwägung; Chip löst ins Korpus auf', async ({ page }) => {
  await page.goto('/rechtsprechung/bger_8C_559_2025')
  const kontext = page.locator('section[aria-labelledby="kontext-titel"]')
  await kontext.scrollIntoViewIfNeeded()
  await expect(kontext.getByText('Zitierte Entscheide', { exact: false }).first()).toBeVisible({ timeout: 10_000 })
  // Ehrlicher Zähler: «… davon n im Korpus» + Hinweissatz zum Rest.
  await expect(kontext.getByText(/davon\s+\d+\s+im\s*Korpus/).first()).toBeVisible()
  await expect(kontext.getByText('im Korpus (noch) nicht erfasst', { exact: false }).first()).toBeVisible()
  // Aufgelöster Treffer als Link-Chip (BGE 150 II 346) — kein grauer Nicht-Link.
  await expect(kontext.locator('a[href*="bge_150_II_346"]').first()).toBeVisible()
  // In-Text-Sprung zur zitierenden Stelle.
  const sprung = kontext.getByRole('button', { name: /zitierende.*springen/i }).first()
  await expect(sprung).toBeVisible()
  await sprung.click()
  await expect(page.locator('#e-1-1')).toBeInViewport({ timeout: 10_000 })
})

// ── Popover-Verankerung am Link (Zusatzauftrag David 3.7.2026) ────────────────
test('Popover öffnet AM Link (tief im Dokument), Seite scrollt nicht', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/rechtsprechung/bge_152_V_52')
  const link = page.getByRole('link', { name: 'Art. 18 UVG', exact: true }).first()
  await link.scrollIntoViewIfNeeded()
  const linkBox = (await link.boundingBox())!
  const scrollVor = await page.evaluate(() => window.scrollY)
  expect(scrollVor).toBeGreaterThan(500)   // wirklich tief im Dokument
  await link.click()
  const karte = page.locator('[role="dialog"]')
  await expect(karte).toBeVisible()
  const kBox = (await karte.boundingBox())!
  // Kein Seiten-Sprung beim Öffnen.
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollVor)
  // Vertikal unmittelbar unter ODER über dem Link (wenige px Toleranz).
  const vertikalNah = Math.min(
    Math.abs(kBox.y - (linkBox.y + linkBox.height)),
    Math.abs(kBox.y + kBox.height - linkBox.y),
  )
  expect(vertikalNah).toBeLessThanOrEqual(12)
  // Horizontal am Link (Überlappung bzw. Viewport-Klemmung angrenzend).
  expect(kBox.x).toBeLessThanOrEqual(linkBox.x + linkBox.width + 8)
  expect(kBox.x + kBox.width).toBeGreaterThanOrEqual(linkBox.x - 8)
})

// ── a11y-Stichprobe auf den neuen Verzahnungs-Flächen (axe, critical/serious) ─
for (const [name, url] of [
  ['entscheid-fuss', '/rechtsprechung/bge_151_III_377'],
  ['gesetz-panel-ZGB', '/gesetze/bund/ZGB'],
] as const) {
  test(`a11y: ${name} ohne critical/serious-Verstösse (Kontext-Bereich)`, async ({ page }) => {
    await page.addInitScript(() => { try { localStorage.setItem('lexmetrik-thema', 'hell') } catch { /* egal */ } })
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' })
    await page.goto(url)
    const kontext = page.locator('section[aria-labelledby="kontext-titel"]')
    await kontext.scrollIntoViewIfNeeded()
    await expect(kontext.locator('h3').first()).toBeVisible({ timeout: 10_000 })
    const ergebnis = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .include('section[aria-labelledby="kontext-titel"]')
      // Marken-Entscheid B-2 (BERICHT.md): Inline-Links ohne Unterstreichung.
      .disableRules(['link-in-text-block'])
      .analyze()
    const hart = ergebnis.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')
    expect(hart.map((v) => `${v.id}: ${v.nodes.length}×`)).toEqual([])
  })
}

// ── Mobil: neue Flächen ohne horizontalen Overflow (390px, §13-Schlussprüfpunkt) ─
for (const [name, url] of [
  ['gesetz-artikel', '/gesetze/bund/ZGB#art-684'],
  ['entscheid-fuss', '/rechtsprechung/bger_8C_559_2025'],
] as const) {
  test(`Mobil 390px: ${name} ohne horizontalen Overflow`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(url)
    const kontext = page.locator('section[aria-labelledby="kontext-titel"]')
    await kontext.scrollIntoViewIfNeeded().catch(() => {})
    await page.waitForTimeout(1500)
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(1)
  })
}
