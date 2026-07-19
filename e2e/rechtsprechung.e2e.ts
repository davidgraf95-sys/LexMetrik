// Browser-Smoke der Rubrik «Rechtsprechung»: Übersicht rendert + lädt das
// Manifest, Klick führt in den Reader (gegliederter Entscheid), keine Console-/
// Page-Errors, kein Mobil-Overflow. Läuft gegen `vite preview` (dist).
import { test, expect, type Page } from '@playwright/test'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

test.describe('/rechtsprechung — Übersicht', () => {
  test('rendert, lädt das Manifest, zeigt Entscheid-Karten ohne Fehler', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.goto('/rechtsprechung')
    await expect(page.getByRole('heading', { name: 'Rechtsprechung' }).first()).toBeVisible()
    // Manifest lädt clientseitig → mindestens eine Entscheid-Karte (Link in den Reader).
    await expect(page.locator('a[href^="/rechtsprechung/"]').first()).toBeVisible()
    await page.screenshot({ path: 'e2e-shots/rechtsprechung-uebersicht.png', fullPage: true })
    expect(fehler).toEqual([])
  })

  test('trennt Bund und Kantone über die Gemeinwesen-Achse', async ({ page }) => {
    // Rechtsprechung-Redesign (Leitentscheide-first): die Trennung Bund/Kantone
    // läuft über die Gemeinwesen-Filter-Achse (Alle · Bund · Kantone · <Kantone>,
    // EntscheidFilter.tsx), nicht mehr über zwei feste Abschnitte. (Locator 28.6.
    // an die deployte Achse nachgezogen: Chip heisst «Bund», nicht «Bundesgericht».)
    await page.goto('/rechtsprechung')
    // Die Facetten-Chips tragen einen a11y-aria-label «Gemeinwesen: <Text> (<n>)»
    // (Batch 2, EntscheidFilter.tsx:35), der den Accessible Name bildet — darum
    // Regex auf das Achsen-Label statt exaktem Chip-Text (sonst matcht der Name nie).
    const bund = page.getByRole('button', { name: /^Gemeinwesen: Bund \(\d+\)$/ })
    const kantone = page.getByRole('button', { name: /^Gemeinwesen: Kantone \(\d+\)$/ })
    await expect(bund).toBeVisible()
    await expect(kantone).toBeVisible()
    // Auf «Kantone» wechseln → die Liste zeigt weiterhin Entscheid-Links.
    await kantone.click()
    await expect(page.locator('a[href^="/rechtsprechung/"]').first()).toBeVisible()
  })

  test('kein horizontaler Overflow bei 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/rechtsprechung')
    await expect(page.getByRole('heading', { name: 'Rechtsprechung' }).first()).toBeVisible()
    await page.screenshot({ path: 'e2e-shots/rechtsprechung-mobil.png', fullPage: true })
    const b = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }))
    expect(b.scroll, `scrollWidth ${b.scroll} > ${b.client}`).toBeLessThanOrEqual(b.client + 1)
  })
})

test.describe('Verzahnung im Gesetzes-Reader', () => {
  test('BGG zeigt im Kontext-Panel die «Bundesgerichtsentscheide»-Gruppe', async ({ page }) => {
    // Verzahnung läuft jetzt über das einheitliche B3-Kontext-Panel (Norm ↔
    // Entscheid ↔ Material ↔ Werkzeug, KontextPanel.tsx) — die Entscheid-Gruppe
    // trägt den Titel «Bundesgerichtsentscheide». (Locator 28.6. an das deployte
    // B3-Panel nachgezogen; vorher stand-alone «… zu diesem Erlass».)
    await page.goto('/gesetze/bund/BGG')
    await expect(page.getByText('Bundesgerichtsentscheide', { exact: false }).first()).toBeVisible()
    await page.screenshot({ path: 'e2e-shots/verzahnung-bgg.png', fullPage: false })
  })
})

test.describe('Reader (über Klick aus der Übersicht)', () => {
  test('öffnet einen Entscheid mit Kopf, Abschnitten und Provenienz', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.goto('/rechtsprechung')
    await page.locator('a[href^="/rechtsprechung/"]').first().click()
    await expect(page).toHaveURL(/\/rechtsprechung\/.+/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    // Gegliederte Lesesicht: mindestens die Erwägungen-Überschrift.
    await expect(page.getByText('Erwägungen', { exact: false }).first()).toBeVisible()
    // Provenienz-Fuss: Live-Link auf die amtliche Fassung (kommt im Reader
    // mehrfach vor — Kopf-Link + Hinweis im Body, daher .first()).
    await expect(page.getByText('massgebliche Fassung', { exact: false }).first()).toBeVisible()
    await page.screenshot({ path: 'e2e-shots/rechtsprechung-reader.png', fullPage: true })
    expect(fehler).toEqual([])
  })
})

// ── BS-Tranche (W2·6-BS, Block B): amtliches Portal rechtsprechung.gerichte.bs.ch ──
// Fixe Keys aus dem committeten Register (Daten-Commit Block A; ein Delta-Lauf
// ersetzt Keys nie, er ergänzt/entfernt nur bei amtlichem Takedown — dann Test
// bewusst rot = Signal). CLS-Messung: e2e/helpers/cls.ts existiert auf origin/main
// NICHT → gemäss Block-B-Auftrag dokumentiert statt gemessen (Folge-Einheit, wenn
// der Helper landet); der §15.2-CLS-Schutz läuft weiter über check:perf-budget.
test.describe('Kanton BS — Register-Facette und Reader', () => {
  test('Facette «Gemeinwesen: BS» filtert; Liste bleibt DOM-gedeckelt («Weitere anzeigen»)', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.goto('/rechtsprechung')
    const bs = page.getByRole('button', { name: /^Gemeinwesen: BS \(\d+\)$/ })
    await expect(bs).toBeVisible()
    await bs.click()
    // Gefilterte Liste zeigt BS-Entscheide (Key-Präfix bs_…).
    await expect(page.locator('a[href^="/rechtsprechung/bs_"]').first()).toBeVisible()
    // DOM-Deckel (§7.1, axe-Timeout-Lektion): trotz Tausender BS-Treffer werden je
    // Sektion max. 100 Zeilen GERENDERT; der Rest hängt am «Weitere anzeigen»-Knopf.
    const gerendert = await page.locator('a[href^="/rechtsprechung/"]').count()
    expect(gerendert, `DOM-Deckel verletzt: ${gerendert} gerenderte Entscheid-Links`).toBeLessThanOrEqual(400)
    const mehr = page.getByRole('button', { name: /Weitere anzeigen/ }).first()
    await expect(mehr).toBeVisible()
    await mehr.click()
    const nachher = await page.locator('a[href^="/rechtsprechung/"]').count()
    expect(nachher).toBeGreaterThan(gerendert)
    await page.screenshot({ path: '.scratch/bs-uebersicht-facette.png', fullPage: false })
    expect(fehler).toEqual([])
  })

  test('BS-Entscheid rendert: Kopf, Erwägungs-Sprunganker, maschinell-Badge, amtlicher Quell-Link (§8)', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.goto('/rechtsprechung/bs_appellationsgericht_AUS.2026.54')
    await expect(page.getByRole('heading', { level: 1, name: /AUS\.2026\.54/ })).toBeVisible()
    // Breadcrumb-Ebene «Kanton BS» (Inhalts-Kopf).
    await expect(page.getByText('Kanton BS', { exact: true }).first()).toBeVisible()
    // §8-Ehrlichkeit: maschinell-Badge sichtbar.
    await expect(page.getByText('maschinell', { exact: true }).first()).toBeVisible()
    // Sprung-Navigation: «Erwägungen»-Chip führt zum Anker (Ziel existiert).
    await page.getByRole('navigation', { name: 'Abschnitte' }).getByText('Erwägungen').click()
    await expect(page.locator('#abschnitt-erwaegung')).toBeVisible()
    // Amtlicher Live-Link auf das BS-Portal (massgebliche Fassung) mit Dokument-Key.
    const href = await page.locator('a[href*="rechtsprechung.gerichte.bs.ch"]').first().getAttribute('href')
    expect(href).toContain('Aufruf=getMarkupDocument')
    // Provenienz-Fuss: Quelle-Label der BS-Datenbank (Block-A-Guard §7.1).
    await expect(page.getByText(/Rechtsprechungs-Datenbank der Gerichte Basel-Stadt/).first()).toBeVisible()
    await page.screenshot({ path: '.scratch/bs-reader.png', fullPage: true })
    expect(fehler).toEqual([])
  })

  test('datumloser BS-Entscheid: Platzhalter nie als Datum; Erstpublikation + Sekundärnummer im Kopf (§7.2)', async ({ page }) => {
    await page.goto('/rechtsprechung/bs_appellationsgericht_BES.2025.17')
    await expect(page.getByRole('heading', { level: 1, name: /BES\.2025\.17/ })).toBeVisible()
    await expect(page.getByText('Entscheiddatum nicht publiziert').first()).toBeVisible()
    await expect(page.getByText(/Erstpublikation/).first()).toBeVisible()
    // Parallele Geschäftsnummer «(AG.2025.474)» im Meta-Kopf.
    await expect(page.getByText('(AG.2025.474)').first()).toBeVisible()
    // Kein fingiertes «Urteil vom 01.01.2025» im Kopf (Body-Text bleibt aussen vor).
    await expect(page.locator('header').getByText(/Urteil vom/)).toHaveCount(0)
    await page.screenshot({ path: '.scratch/bs-reader-datumlos.png', fullPage: false })
  })

  test('langer BS-Entscheid: kein horizontaler Overflow bei 390px (Mobil, Tabellen)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    // SB.2018.46 = grösstes BS-Dokument im Bestand (Strafurteil mit Tabellen).
    await page.goto('/rechtsprechung/bs_appellationsgericht_SB.2018.46')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.locator('#abschnitt-erwaegung')).toBeAttached()
    const b = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }))
    expect(b.scroll, `scrollWidth ${b.scroll} > ${b.client}`).toBeLessThanOrEqual(b.client + 1)
    await page.screenshot({ path: '.scratch/bs-reader-mobil.png', fullPage: false })
  })

  test('mehrteiliges Urteil (Nummerierungs-Restarts): keine React-Key-Errors, keine doppelten Anker-IDs (R7)', async ({ page }) => {
    // SB.2018.46 startet die amtliche Erwägungs-Nummerierung mehrfach neu
    // (tops 1,2,4,5,1,2,3,1,…) — vor dem Fix: 16 console.errors «two children
    // with the same key» + 34 doppelte DOM-IDs (#e-1 5×), Pin-Cite mehrdeutig.
    const fehler = fehlerSammeln(page)
    await page.goto('/rechtsprechung/bs_appellationsgericht_SB.2018.46')
    await expect(page.locator('#abschnitt-erwaegung')).toBeAttached()
    // Alle Anker-IDs im Dokument eindeutig (Pin-Cite-Permalinks, R7).
    const doppelte = await page.evaluate(() => {
      const alle = [...document.querySelectorAll('[id]')].map((el) => el.id)
      const gesehen = new Set<string>(); const dupl = new Set<string>()
      for (const id of alle) { if (gesehen.has(id)) dupl.add(id); gesehen.add(id) }
      return [...dupl]
    })
    expect(doppelte, `doppelte DOM-IDs: ${doppelte.join(', ')}`).toEqual([])
    // Wiederholungs-Lauf trägt das -wN-Suffix und ist als Sprungziel vorhanden.
    await expect(page.locator('#e-1-w2')).toBeAttached()
    expect(fehler).toEqual([])
  })

  test('BS-Karte/-Zeile: amtlicher Betreff ehrlich etikettiert, nie als Regeste (§8)', async ({ page }) => {
    await page.goto('/rechtsprechung')
    await page.getByRole('button', { name: /^Gemeinwesen: BS \(\d+\)$/ }).click()
    // Listen-Dichte (Default): Betreff-Marker in der Metazeile sichtbar.
    await expect(page.getByText('amtl. Betreff').first()).toBeVisible()
  })
})

test.describe('Leitentscheid — Ansichten «Amtlicher BGE-Auszug» ⟷ «Vollständiges Urteil»', () => {
  test('Default Auszug; Wechsel auf Vollständiges Urteil ändert den Body (§8)', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.goto('/rechtsprechung/bge_152_IV_14')
    await expect(page.getByRole('heading', { level: 1, name: /BGE 152 IV 14/ })).toBeVisible()

    const voll = page.getByRole('tab', { name: /Vollständiges Urteil/ })
    const auszug = page.getByRole('tab', { name: /Amtlicher BGE-Auszug/ })
    await expect(auszug).toBeVisible()
    await expect(voll).toBeVisible()
    // Leitentscheid ist Default-Ansicht (Regeste-forward).
    await expect(auszug).toHaveAttribute('aria-selected', 'true')
    const body = page.locator('article').first()
    const auszugText = (await body.innerText()).trim()
    expect(auszugText.length).toBeGreaterThan(100)

    await voll.click()
    await expect(voll).toHaveAttribute('aria-selected', 'true')
    const vollText = (await body.innerText()).trim()
    expect(vollText).not.toEqual(auszugText)

    await auszug.click()
    await expect(auszug).toHaveAttribute('aria-selected', 'true')
    expect((await body.innerText()).trim()).toEqual(auszugText)

    await page.screenshot({ path: 'e2e-shots/leitentscheid-ansichten.png', fullPage: true })
    expect(fehler).toEqual([])
  })

  test('Deep-Link ?ansicht=voll öffnet direkt die Voll-Ansicht', async ({ page }) => {
    await page.goto('/rechtsprechung/bge_152_IV_14?ansicht=voll')
    await expect(page.getByRole('tab', { name: /Vollständiges Urteil/ })).toHaveAttribute('aria-selected', 'true')
  })

  test('Übersicht führt vollständige Urteile als getrennte Einträge', async ({ page }) => {
    await page.goto('/rechtsprechung')
    await expect(page.getByRole('heading', { name: /Vollständige Urteile zu den Leitentscheiden/ })).toBeVisible()
    await expect(page.locator('a[href*="ansicht=voll"]').first()).toBeVisible()
  })
})
