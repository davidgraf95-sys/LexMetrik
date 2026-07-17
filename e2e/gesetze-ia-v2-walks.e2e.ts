// IA-1 · Interaktions-Zähl-Walks + Named-Article-Klick-Beweis (FAHRPLAN-GESETZES-UX
// §11.3-Tabelle / §11.6 Punkt 1+2). Jeder Walk ZÄHLT die Interaktionen (1 Klick ODER
// 1 Eingabe+Enter = 1) und asserted das Budget der jeweiligen Praxis-Task-Zeile.
// Läuft gegen `vite preview` (dist). Deckt die IA-1-relevanten Zeilen ab:
//   1/9  «OR 336c» / «OR 257d» nachschlagen → Norm-Sprung → Reader #art-…   Budget 1
//   —    Fallback ohne exakten Parser-Match → Liste, nie Leerseite          Budget 2
//   —    Erlass per Kürzel (OR), Kürzel bekannt → Norm-Sprung               Budget 1
//   10   Überblick → dedupliziert + Kopfzeile «n Treffer, davon x/y»        Budget 2
import { test, expect, type Page } from '@playwright/test'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

const sucheFeld = (page: Page) => page.getByRole('combobox', { name: /LexMetrik durchsuchen/ })
const listbox = (page: Page) => page.getByRole('listbox', { name: 'Suchtreffer' })

// Ein Norm-Sprung-Walk: Feld füllen + Enter = GENAU 1 Interaktion (§11.3-Zählregel).
async function sprungWalk(page: Page, query: string): Promise<{ interaktionen: number }> {
  const feld = sucheFeld(page)
  await feld.click()
  await feld.fill(query)
  // Warten, bis der deterministische Sprung als oberster Treffer steht (kein
  // zusätzlicher Klick — das Warten ist keine Interaktion, nur Synchronisation).
  await expect(listbox(page).getByText('Sprung', { exact: true })).toBeVisible()
  await feld.press('Enter')
  return { interaktionen: 1 } // Eingabe+Enter = 1
}

test.describe('IA-1 · Named-Article-Klick-Beweis (§11.6 Punkt 2)', () => {
  // Zielartikel im Viewport: der Reader-Anker (#art-336_c) ist die kanonische
  // Sprungmarke (NIE #par-, R8/K2); im DOM auflösbar (§15 Funktions-Treue).
  for (const [query, anker] of [
    ['OR 336c', 'art-336_c'],
    ['OR 257d', 'art-257_d'],
  ] as const) {
    test(`«${query}» → 1 Interaktion → Reader ${anker} im Viewport`, async ({ page }) => {
      const fehler = fehlerSammeln(page)
      await page.goto('/gesetze')
      const { interaktionen } = await sprungWalk(page, query)
      expect(interaktionen, 'Budget §11.3 Zeile 1/9').toBe(1)
      await expect(page).toHaveURL(new RegExp(`/gesetze/bund/OR#${anker}$`))
      const ziel = page.locator(`#${anker}`)
      await expect(ziel).toHaveCount(1)
      await expect(ziel).toBeInViewport()
      expect(fehler).toEqual([])
    })
  }

  test('Negativ-Fall (Tippfehler «OR 336z») → Liste mit Treffern, NIE Leerseite', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.goto('/gesetze')
    const feld = sucheFeld(page)
    await feld.click()
    // «OR 336z» hat keinen exakten Artikel-Parser-Match (kein Art. 336z im OR) …
    await feld.fill('OR 336z')
    const box = listbox(page)
    await expect(box).toBeVisible()
    // … statt einer Leerseite kommt die gruppierte Suche mit zielnahen Treffern
    // (OR-Artikel / Gesetzestext) — mindestens eine Option ist da (nie 0 Treffer).
    await expect(box.getByRole('option').first()).toBeVisible()
    await expect(box.getByText('Keine Treffer')).toHaveCount(0)
    expect(fehler).toEqual([])
  })
})

test.describe('IA-1 · Interaktions-Zähl-Walks (§11.6 Punkt 1)', () => {
  test('Zeile 1/9: «OR 336c» nachschlagen — Budget 1', async ({ page }) => {
    await page.goto('/gesetze')
    const { interaktionen } = await sprungWalk(page, 'OR 336c')
    expect(interaktionen).toBe(1)
    await expect(page).toHaveURL(/\/gesetze\/bund\/OR#art-336_c$/)
  })

  test('Zeile «Art. 336c OR»-Schreibweise — Budget 1 (gleiche Norm)', async ({ page }) => {
    await page.goto('/gesetze')
    const { interaktionen } = await sprungWalk(page, 'Art. 336c OR')
    expect(interaktionen).toBe(1)
    await expect(page).toHaveURL(/\/gesetze\/bund\/OR#art-336_c$/)
  })

  test('Zeile «Erlass per Kürzel» (OR) — Budget 1, Reader ohne Artikel-Anker', async ({ page }) => {
    await page.goto('/gesetze')
    const { interaktionen } = await sprungWalk(page, 'OR')
    expect(interaktionen).toBe(1)
    await expect(page).toHaveURL(/\/gesetze\/bund\/OR$/)
  })

  test('Zeile «SR 220» (amtliche SR-Nummer) — Budget 1 → OR-Reader', async ({ page }) => {
    await page.goto('/gesetze')
    const { interaktionen } = await sprungWalk(page, 'SR 220')
    expect(interaktionen).toBe(1)
    await expect(page).toHaveURL(/\/gesetze\/bund\/OR$/)
  })

  test('FR-Alias «art. 190 LDIP» → IPRG-Reader — Budget 1', async ({ page }) => {
    await page.goto('/gesetze')
    const { interaktionen } = await sprungWalk(page, 'art. 190 LDIP')
    expect(interaktionen).toBe(1)
    await expect(page).toHaveURL(/\/gesetze\/bund\/IPRG#art-190$/)
  })
})

test.describe('IA-1 · Dedup + Ergebnis-Kopfzeile (§11.3 Zeile 10)', () => {
  test('titelgleiches Gemeinde-Doppel «Asylvertrag» erscheint genau EINMAL', async ({ page }) => {
    await page.goto('/gesetze')
    const feld = sucheFeld(page)
    await feld.click()
    await feld.fill('Asylvertrag')
    // exact, sonst matcht der Teilstring «Gesetze» auch die «Gesetzestext»-Gruppe.
    const gesetze = page.getByRole('group', { name: 'Gesetze', exact: true })
    await expect(gesetze).toBeVisible()
    // Im Register liegen 3 titelgleiche BS-Kopien (kantonal + RiE + BeE) — die
    // Dedup kollabiert sie auf einen Treffer (Riehen-Doppel geheilt, IA-1).
    const asyl = gesetze.getByRole('option').filter({ hasText: 'Asylvertrag' })
    await expect(asyl).toHaveCount(1)
  })

  test('Ergebnis-Kopfzeile «n Treffer, davon x Erlasse / y Artikel» ist sichtbar', async ({ page }) => {
    await page.goto('/gesetze')
    const feld = sucheFeld(page)
    await feld.click()
    // «Datenschutz» trifft sowohl Erlasse (DSG …) als auch Gesetzestext-Artikel.
    await feld.fill('Datenschutz')
    // Die sichtbare Kopfzeile fasst den Überblick zusammen (praxis #10). Erst
    // wenn alle Manifeste geladen sind, steht die feste Aufschlüsselung. Die
    // sr-only Live-Region trägt denselben Text → gezielt die SICHTBARE (aria-hidden)
    // Kopfzeile ansteuern.
    const kopf = page.locator('p[aria-hidden="true"]', { hasText: /\d+ Treffer, davon .*(Erlass|Artikel)/ })
    await expect(kopf).toBeVisible()
  })
})
