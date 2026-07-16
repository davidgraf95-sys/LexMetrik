// E3/A34 (David 16.7.2026, ANMERKUNGEN Ziff. 6) — Split-View des Gesetz-Lesers:
//  Bug 1: Öffnet man aus dem Gesetz einen verlinkten BGE im Split-View, sprang das
//         Gesetz-Pane auf den FRÜHER angeklickten Artikel zurück (Scroll-Verlust,
//         §15 Funktions-Treue «Split-View-Pane-Zustand»). Ursache: der Seed-Hash-
//         Sprung feuerte beim imPane-Wechsel erneut und las den alten `#art-`-Hash.
//  Bug 2: Im Split-View gab es «keine Möglichkeit mehr, die Ansicht zu ändern» —
//         das «Ansicht»-Menü lag im ErlassLeserKopf, der mit dem Text wegscrollt.
//         Es lebt jetzt in der pane-lokalen STICKY Such-/Gliederungs-Leiste.
// Läuft gegen `vite preview` (dist). Reine UI-Einheit (golden-neutral).
import { test, expect, type Page } from '@playwright/test'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

// Split-View aus dem Gesetz heraus öffnen: ⧉ (nebeneinander öffnen) an der
// Leitfall-Zeile eines Artikels. Gibt die Pane-Scrollposition + Artikel-Offsets
// zurück, damit die Tests die Lese-Erhaltung messen können.
async function oeffneBgeDaneben(page: Page, artId: string) {
  const art = page.locator(`#${artId}`)
  await expect(async () => {
    await art.scrollIntoViewIfNeeded()
    await expect(art.getByRole('button', { name: /nebeneinander öffnen/ }).first()).toBeVisible({ timeout: 2000 })
  }).toPass({ timeout: 20_000 })
  await art.getByRole('button', { name: /nebeneinander öffnen/ }).first().click()
  await expect(page.locator('[data-pane="sekundaer"]')).toBeVisible({ timeout: 10_000 })
}

// ── Bug 1: kein Rücksprung auf den früher angeklickten Artikel ────────────────
test('A34/Bug1 (≥lg): Split-View öffnen erhält die Leseposition, springt NICHT auf den früheren Artikel', async ({ page }) => {
  const fehler = fehlerSammeln(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  // Früher Artikel als aktiver `#art-`-Hash (Deep-Link springt dorthin) …
  await page.goto('/gesetze/bund/ZGB#art-1')
  await expect(page.locator('#art-1')).toBeAttached()
  // … dann weit nach unten zu Art. 684 lesen (Hash bleibt #art-1).
  const ziel = page.locator('#art-684')
  await ziel.scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)
  const scrollVor = await page.evaluate(() => window.scrollY)
  expect(scrollVor).toBeGreaterThan(5000) // wirklich tief im Erlass
  // BGE daneben öffnen → Gesetz wird Primär-Pane.
  await oeffneBgeDaneben(page, 'art-684')
  await page.waitForTimeout(1200)
  const info = await page.evaluate(() => {
    const p = document.querySelector('[data-pane="primaer"]') as HTMLElement | null
    const el1 = p?.querySelector('#art-1') as HTMLElement | null
    const pr = p?.getBoundingClientRect()
    return {
      scrollTop: p?.scrollTop ?? -1,
      // Abstand von Art. 1 zur oberen Lese-Bezugslinie (~5rem=80px). Beim Bug
      // stand Art. 1 dort (≈56px); nach dem Fix ist er weit oberhalb (negativ gross).
      top1: el1 && pr ? Math.round(el1.getBoundingClientRect().top - pr.top) : null,
    }
  })
  // (a) Der übergebene Scroll (Fenster → Pane-Container) bleibt erhalten — NICHT
  //     auf die kurze Kopf-Höhe (~750px = Art. 1) zurückgesetzt.
  expect(Math.abs(info.scrollTop - scrollVor)).toBeLessThan(400)
  // (b) Art. 1 steht NICHT an der oberen Lese-Bezugslinie (kein Rücksprung).
  expect(info.top1 === null || info.top1 < -1000).toBeTruthy()
  expect(fehler).toEqual([])
})

// ── Bug 2: «Ansicht»-Menü im Split-View dauerhaft erreichbar ──────────────────
test('A34/Bug2 (≥lg): «Ansicht»-Menü im Split-View bleibt beim Scrollen sichtbar und schaltet', async ({ page }) => {
  const fehler = fehlerSammeln(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/gesetze/bund/ZGB#art-684')
  await oeffneBgeDaneben(page, 'art-684')
  const primaer = page.locator('[data-pane="primaer"]')
  // Gesetz-Pane mitten in den Text scrollen (Lesen).
  await page.evaluate(() => { const p = document.querySelector('[data-pane="primaer"]') as HTMLElement; p.scrollTop = 4000 })
  await page.waitForTimeout(400)
  // Der «Ansicht»-Trigger sitzt in der pane-lokalen sticky Leiste → weiterhin im
  // sichtbaren Pane-Ausschnitt (nicht mit dem Kopf weggescrollt).
  const ansicht = primaer.getByRole('button', { name: 'Ansicht', exact: true }).first()
  await expect(ansicht).toBeVisible()
  const imBlick = await ansicht.evaluate((el) => {
    const p = el.closest('[data-pane="primaer"]') as HTMLElement
    const pr = p.getBoundingClientRect(); const r = el.getBoundingClientRect()
    return r.top >= pr.top - 2 && r.bottom <= pr.bottom + 2
  })
  expect(imBlick).toBe(true)
  // Es schaltet auch wirklich: Menü öffnen und den «Fussnoten»-Schalter umlegen —
  // Beweis über den globalen Options-State (<html data-fussnoten>, leserOptionen.ts),
  // den das Menü treibt (unabhängig davon, ob das Panel nach dem Klick offen bleibt).
  await ansicht.click()
  await expect(primaer.getByRole('group', { name: 'Darstellungsoptionen' })).toBeVisible()
  const vorher = await page.evaluate(() => document.documentElement.getAttribute('data-fussnoten') ?? 'an')
  await primaer.getByRole('switch', { name: /Fussnoten/ }).first().click()
  await expect.poll(() => page.evaluate(() => document.documentElement.getAttribute('data-fussnoten') ?? 'an'))
    .toBe(vorher === 'aus' ? 'an' : 'aus')
  expect(fehler).toEqual([])
})
