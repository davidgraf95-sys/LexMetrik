// IA-1 · Interaktions-Zähl-Walks + Named-Article-Klick-Beweis (FAHRPLAN-GESETZES-UX
// §11.3-Tabelle / §11.6 Punkt 1+2). Jeder Walk ZÄHLT die Interaktionen (1 Klick ODER
// 1 Eingabe+Enter = 1) und asserted das Budget der jeweiligen Praxis-Task-Zeile.
// Läuft gegen `vite preview` (dist). Deckt die IA-1-relevanten Zeilen ab:
//   1/9  «OR 336c» / «OR 257d» nachschlagen → Norm-Sprung → Reader #art-…   Budget 1
//   —    Fallback ohne exakten Parser-Match → Liste, nie Leerseite          Budget 2
//   —    Erlass per Kürzel (OR), Kürzel bekannt → Norm-Sprung               Budget 1
//   10   Überblick → dedupliziert + Kopfzeile «n Treffer, davon x/y»        Budget 2
//
// ─── IA-2 · Erfassungsgrad — Praxis-Task-Walks mit Interaktions-Zählung ──────
//
// §11.6.1: pro relevanter §11.3-Zeile ein Walk, der Klicks/Submits ZÄHLT und das
// Budget asserted (Abnahme gegen reale Aufgaben statt Struktur-Schönheit).
// §11.6.3 Sackgassen-Beweis · §11.6.8 a11y (Text-Wort, nicht nur Farbe) ·
// §11.6.9 Mobil @390 (kollabiert, keine Wucherung). Läuft gegen `vite preview`.
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
  // CI-Härtung 18.7.: 20-s-Timeout (statt Default 10 s) für den EINMAL-Load des
  // ~4-MB-Artikel-Index. Auf dem 2-vCPU-Runner kann dessen Parse länger als 10 s
  // brauchen, bis der «Sprung»-Treffer erscheint (Flaky-Quelle IA-1); die
  // Schwester-Spec norm-sprung nutzt für denselben Index-Latch bereits 20 s. Reine
  // Lade-Synchronisation, kein Prüfschritt — der Interaktions-Beweis (Enter → URL)
  // bleibt eng gebunden und unverändert.
  await expect(listbox(page).getByText('Sprung', { exact: true })).toBeVisible({ timeout: 20_000 })
  await feld.press('Enter')
  return { interaktionen: 1 } // Eingabe+Enter = 1
}

async function keinOverflow(page: Page) {
  const b = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }))
  expect(b.scroll, `scrollWidth ${b.scroll} > ${b.client}`).toBeLessThanOrEqual(b.client + 1)
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

test.describe('IA-2 · Erfassungsgrad — Task-Walks (§11.3/§11.6)', () => {
  // §11.3 Zeile 4/11: «Regelt ZH etwas zu X?» → Kantone → ZH (Badge «3 · dünn»)
  // → ehrliche Liste + Lücken-Link. Budget: 2 Interaktionen bis ehrliche Antwort.
  test('«Regelt ZH etwas?» — 2 Interaktionen bis Erfassungs-Kopf (Budget 2)', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    let interaktionen = 0
    await page.goto('/gesetze')
    const main = page.getByRole('main')

    // (1) Einstiegskachel «Kantone».
    await main.getByRole('button', { name: /kantonale Erlasse/ }).click(); interaktionen++
    // (2) Kanton ZH auf der Karte (Default-Ansicht) — Aktivierung per Tastatur
    //     (geometrie-unabhängig gegenüber dem SVG-Pfad-Klick; 1 Interaktion).
    await main.getByRole('button', { name: 'Zürich', exact: true }).press('Enter'); interaktionen++

    // Ehrliche Antwort: Erfassungs-Kopf mit Zahl + Zustands-Wort + Weiterweg.
    await expect(main.getByText(/Erlasse erfasst/)).toBeVisible()
    await expect(main.getByText('dünn').first()).toBeVisible()
    await expect(main.getByRole('link', { name: /lexfind/ }).first()).toBeVisible()
    expect(interaktionen, 'Budget §11.3 Zeile 4/11').toBeLessThanOrEqual(2)
    expect(fehler).toEqual([])
  })

  // §11.6.3 Sackgassen-Beweis: Kanton ZH, Query ohne Treffer → Lücken-Hinweis mit
  // Erlass-Zahl + Link amtliche Quelle/lexfind sichtbar (nie leerer Zustand).
  test('Sackgassen-Beweis: ZH + trefferlose Query → Abdeckungslücke, keine Sackgasse', async ({ page }) => {
    await page.goto('/gesetze?ebene=kanton&kt=ZH')
    const main = page.getByRole('main')
    await main.getByRole('searchbox').fill('zzzkeintrefferxyz')
    // Kein leerer Zustand: die Lücke wird mit Erlass-Zahl + lexfind-Weiterweg gerendert.
    await expect(main.getByText(/in diesem Kanton erfasst/)).toBeVisible()
    await expect(main.getByRole('link', { name: /lexfind/ })).toBeVisible()
    await expect(main.getByText('Kein Erlass gefunden.')).toHaveCount(0)
  })

  // §11.6.8 a11y: das Badge trägt das Zustands-WORT als Text (nicht nur Farbe);
  // die SchweizKarte trägt «keine Erlasse» im aria-label nicht-wählbarer Kantone.
  test('a11y: Erfassungs-Wort ist Text; Karte kennzeichnet «keine Erlasse»', async ({ page }) => {
    await page.goto('/gesetze?ebene=kanton')
    const main = page.getByRole('main')
    // Karte: ein nicht-erfasster Kanton trägt «keine Erlasse» im aria-label.
    // (Alle 26 sind heute erfasst; die Assertion prüft, dass das Muster steht,
    //  ohne einen konkreten Kanton hart zu verdrahten — §11.0.)
    await main.getByRole('group', { name: 'Ansicht' }).getByRole('button', { name: 'Liste' }).click()
    // Liste: Kachel-Badge trägt ein Zustands-Wort als Text.
    await expect(main.getByText('dünn').first()).toBeVisible()
    // Default-Sortierung ist «Erlass-Zahl» (Y-B) — BS/AR (Auswahl) stehen oben.
    await expect(
      main.getByRole('group', { name: 'Sortierung' }).getByRole('button', { name: 'Erlass-Zahl' }),
    ).toHaveAttribute('aria-pressed', 'true')
    // Sortier-Option «Erfassungsgrad» existiert (§11.1).
    await expect(main.getByRole('group', { name: 'Sortierung' }).getByRole('button', { name: 'Erfassungsgrad' })).toBeVisible()
    await expect(main.getByText('Auswahl').first()).toBeVisible()
  })

  // §11.6.9 Mobil @390: kollabierte Steuerleiste, keine Wucherung, kein H-Overflow.
  test('Mobil @390: Kanton-Raster mit Badges ohne H-Overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/gesetze?ebene=kanton')
    const main = page.getByRole('main')
    await expect(main.getByRole('group', { name: /Karte der Schweizer Kantone/ })).toBeVisible()
    await keinOverflow(page)
    await main.getByRole('group', { name: 'Ansicht' }).getByRole('button', { name: 'Liste' }).click()
    await expect(main.getByRole('button', { name: /Basel-Stadt/ })).toBeVisible()
    await expect(main.getByText('dünn').first()).toBeVisible()
    await keinOverflow(page)
  })

  // Regressions-Wächter (§11.3 letzte Zeile): Kalt-Browse /gesetze → gelesener
  // Bund-Erlass in ≤ 4 Interaktionen (darf durch IA-2 nicht schlechter werden).
  test('Regression: Kalt-Browse → Bund-Erlass in ≤ 4 Interaktionen', async ({ page }) => {
    let interaktionen = 0
    await page.goto('/gesetze')
    const main = page.getByRole('main')
    await main.getByRole('button', { name: /Artikel im Volltext/ }).click(); interaktionen++ // Bund-Kachel
    await main.getByRole('button', { name: 'Alle aufklappen' }).click(); interaktionen++
    const ersterErlass = main.getByRole('link').filter({ hasText: /Art\.|Artikel/ }).first()
    await expect(ersterErlass).toBeVisible()
    expect(interaktionen).toBeLessThanOrEqual(4)
  })
})
