// @shard-gruppe: 3
// ═══ W2·24 R13 · DIE REITERLEISTE ALS BROWSER-REITERBAND ════════════════════
//
// Die Prüfrunde R13 (7.9.2026, `scratchpad/w224-r13-befunde.md`) hat die Leiste
// gegen die Browser-Norm gemessen und zwölf Befunde erhoben. Diese Datei
// bewacht die neun, die R13 gebaut hat; die Nummern sind die des Befundes.
//
// ROT ZU BEKOMMEN (§6.7 — je Massnahme einmal gegen den Vorstand `a60dd7f75`
// gefahren, 7.9.2026; die Messwerte des Befundes stehen als Erwartung im Test):
//   R13-2  `Reiter.tsx`: `shrink-0` an der Reiter-Hülle wiederherstellen ⇒
//          @1440 `scrollWidth 1476 > clientWidth 1355`, der letzte Reiter als
//          «Z» an der Kante.
//   R13-1  `Reiterleiste.tsx`: den «N offen»-Knopf wieder nur bei Überlauf
//          zeigen ⇒ @390 rechte Kante des aktiven Reiters 312 bei clientWidth
//          253.
//   R13-3  `ueberlauf.fensterStart`: den alten Slot-Tausch einsetzen ⇒ beim
//          Wechsel #14 → #15 fällt «ArG» aus dem Streifen.
//   R13-4  `Reiter.tsx`: `{stelle !== null && …}` zurück ⇒ der ZGB-Reiter
//          trägt 60 px leeren Platzhalter und misst 137 statt 93 px.
//   R13-5  `Reiterleiste.tsx`: das `onContextMenu` am Streifen entfernen ⇒
//          `[role=menu]` bleibt 0.
//   R13-6  den Eintrag «Alle schliessen» aus `menueEintraege` streichen.
//   R13-9  den Eintrag «Adresse kopieren» streichen.
//   R13-7  `aria-keyshortcuts`/`kuerzel` am Reiter entfernen.
//   R13-8  `Alt+9` wieder auf `ordnung[8]` legen ⇒ landet auf dem NEUNTEN.
import { test, expect, type Page } from '@playwright/test'

const STREIFEN = '[data-reiter-streifen]'
const START = '/kontakt'

const OR = '/gesetze/bund/OR#art-336_c'
const BGE = '/rechtsprechung/bge_146_III_1'
const RECHNER = '/rechner/zpo-fristen'
const VORLAGE = '/vorlagen/arbeitsvertrag'
/** Acht realistische Reiter — das Kanzlei-Szenario aus R11, aufgefüllt auf die
 *  Zahl, bei der die feste Grenze `SICHTBAR_MAX = 8` bis R13 gerade noch nicht
 *  griff und der Überlauf darum stumm war. */
const ACHT = [OR, BGE, RECHNER, VORLAGE, '/gesetze/bund/ZGB', '/gesetze/bund/ZPO',
  '/gesetze/bund/StGB', '/gesetze/bund/URG']
const FUENFZEHN = ['/gesetze/bund/OR', '/gesetze/bund/ZGB', '/gesetze/bund/ZPO',
  '/gesetze/bund/StGB', '/gesetze/bund/SchKG', '/gesetze/bund/BV', '/gesetze/bund/DSG',
  '/gesetze/bund/ArG', '/gesetze/bund/URG', '/gesetze/bund/StPO', '/gesetze/bund/BGG',
  '/gesetze/bund/VwVG', '/gesetze/bund/IPRG', '/gesetze/bund/KKG', '/gesetze/bund/KVG']

test.describe.configure({ timeout: 120_000 })

async function seed(page: Page, tabs: string[], ziel = START): Promise<void> {
  await page.goto(START)
  await page.evaluate((t) => {
    localStorage.setItem('lexmetrik-tabs', JSON.stringify(t.map((path) => ({ path }))))
  }, tabs)
  await page.goto(ziel)
  if (tabs.length > 0) {
    await expect(page.locator(`${STREIFEN} [data-reiter-schluessel]`).first()).toBeVisible({ timeout: 45_000 })
  }
  // Die Beschriftungen kommen aus lazy geladenen Manifesten nach und ändern die
  // Reiterbreiten; erst danach steht das gemessene Fenster.
  await page.waitForTimeout(1500)
}

/** Rohmasse des Streifens — genau die Grössen, die der Befund gemessen hat. */
const masse = (page: Page) => page.evaluate(() => {
  const s = document.querySelector('[data-reiter-streifen]')!
  const k = [...s.querySelectorAll<HTMLElement>('[data-reiter-schluessel]')]
  const a = s.querySelector<HTMLElement>('[data-reiter-aktiv="true"]')
  return {
    scrollW: s.scrollWidth,
    clientW: s.clientWidth,
    fenster: s.getAttribute('data-reiter-fenster'),
    sichtbar: k.map((e) => e.getAttribute('data-reiter-schluessel')!),
    letzteKante: k.length ? Math.round(k[k.length - 1].offsetLeft + k[k.length - 1].offsetWidth) : 0,
    aktivRechts: a ? Math.round(a.offsetLeft + a.offsetWidth) : null,
  }
})

const gespeichert = (page: Page) => page.evaluate(() =>
  (JSON.parse(localStorage.getItem('lexmetrik-tabs') ?? '[]') as { path: string }[]).map((t) => t.path))

// ═══ R13-2 · KEIN REITER WIRD STUMM ANGESCHNITTEN ═══════════════════════════
//
// GEMESSEN am Vorstand: @1440 mit diesen acht Reitern `scrollWidth 1476 >
// clientWidth 1355`, sieben von acht im Bild, «+N» NICHT sichtbar (der Überlauf
// hing an der festen Zahl 9) — und der Scrollbalken ist per CSS unsichtbar. Der
// achte Reiter stand als «Z» an der Kante, ohne ein einziges Zeichen dafür.
test.describe('R13-2 — Überlauf aus der gemessenen Breite', () => {
  for (const [w, h] of [[1440, 900], [1024, 800], [390, 844]] as const) {
    test(`@${w}: die Reiter passen ganz ins Bild, der Rest steht im Blatt`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h })
      await seed(page, ACHT, '/gesetze/bund/URG')
      const m = await masse(page)
      expect(m.scrollW, `@${w} darf nicht überlaufen (Vorstand: 1476 > 1355)`)
        .toBeLessThanOrEqual(m.clientW + 1)
      expect(m.letzteKante, 'kein Reiter wird angeschnitten').toBeLessThanOrEqual(m.clientW + 1)
      expect(m.sichtbar.length).toBeGreaterThan(0)
      // Fenster-Buchführung: sichtbar + versteckt = Speicher, nie weniger.
      const [start, anzahl, gesamt] = (m.fenster ?? '').split('/').map(Number)
      expect(gesamt).toBe(ACHT.length)
      expect(anzahl).toBe(m.sichtbar.length)
      expect(start + anzahl).toBeLessThanOrEqual(gesamt)
      // Wird gekappt, MUSS der Weg zum Rest sichtbar sein.
      const blatt = page.getByRole('button', { name: `Alle ${ACHT.length} offenen Reiter` })
      await expect(blatt).toBeVisible()
      if (anzahl < gesamt) await expect(blatt).toHaveText(`+${gesamt - anzahl}`)
    })
  }
})

// ═══ R13-1 · DER AKTIVE REITER IST IMMER GANZ IM BILD ═══════════════════════
//
// GEMESSEN am Vorstand @390 mit acht Reitern, aktiv = letzter: `scrollLeft 785`
// statt der nötigen 843, rechte Kante des aktiven Reiters 312 bei `clientWidth
// 253` — «URG» stand als «U» am Rand, auch nach einem Reload. Ursache war der
// «8 offen»-Knopf, der den Streifen NACH der Rechnung um ~58 px verschmälerte.
test('R13-1 — @390 steht der aktive Reiter vollständig im Streifen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await seed(page, ACHT, '/gesetze/bund/URG')
  const m = await masse(page)
  expect(m.aktivRechts, 'der aktive Reiter muss im Bild enden (Vorstand: 312 bei 253)')
    .not.toBeNull()
  expect(m.aktivRechts!).toBeLessThanOrEqual(m.clientW + 1)
  expect(m.sichtbar).toContain('/gesetze/bund/URG')
})

// ═══ R13-3 · DAS FENSTER BEWEGT SICH, ES TAUSCHT NICHT ══════════════════════
//
// GEMESSEN am Vorstand: 15 Reiter, aktiv #14 ⇒ sichtbar [OR, ZGB, ZPO, StGB,
// SchKG, BV, DSG, ARG*]; dann aktiv #15 ⇒ ARG verschwand aus dem Streifen. Der
// aktive Reiter wurde in Slot 8 GETAUSCHT — die Leiste zeigte eine
// Nachbarschaft, die es im Speicher nicht gibt.
test('R13-3 — die sichtbaren Reiter sind immer eine zusammenhängende Teilfolge', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await seed(page, FUENFZEHN, '/gesetze/bund/KKG')
  const speicher = await gespeichert(page)
  const teilfolge = (sichtbar: string[]) => {
    const i = speicher.findIndex((p) => p.split('#')[0] === sichtbar[0])
    expect(i, 'der erste sichtbare Reiter muss im Speicher stehen').toBeGreaterThanOrEqual(0)
    expect(speicher.slice(i, i + sichtbar.length).map((p) => p.split('#')[0])).toEqual(sichtbar)
  }

  const vorher = await masse(page)
  teilfolge(vorher.sichtbar)
  expect(vorher.sichtbar).toContain('/gesetze/bund/KKG')

  await page.goto('/gesetze/bund/KVG')
  await expect(page.locator(`${STREIFEN} [data-reiter-aktiv="true"]`)).toBeVisible({ timeout: 45_000 })
  await page.waitForTimeout(1000)
  const nachher = await masse(page)
  teilfolge(nachher.sichtbar)
  expect(nachher.sichtbar).toContain('/gesetze/bund/KVG')
  // Der Nachbar bleibt Nachbar: ArG darf nicht verschwinden, nur weil ein
  // Reiter weiter hinten aktiv wurde — das war der Befund.
  const start = (s: string | null) => Number((s ?? '0/0/0').split('/')[0])
  expect(start(nachher.fenster) - start(vorher.fenster),
    'das Fenster rückt um höchstens einen Platz nach').toBeLessThanOrEqual(1)
})

// ═══ R13-4 · KEIN 60-PX-LOCH OHNE LESESTELLUNG ══════════════════════════════
//
// GEMESSEN am Vorstand: `.rl-stelle` mit leerem `textContent`, Breite 60 px,
// ZGB-Reiter 137 px (mit «Art. 336c» misst OR 148 px). Entscheide und Rechner
// hatten den Platzhalter gar nicht — drei verschiedene Textanfänge in einer
// Zeile.
test('R13-4 — ein Gesetzes-Reiter ohne Lesestellung reserviert keinen Platz', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await seed(page, ['/gesetze/bund/ZGB', BGE])
  const m = await page.evaluate(() => {
    const el = document.querySelector<HTMLElement>('[data-reiter-schluessel="/gesetze/bund/ZGB"]')!
    const st = el.querySelector<HTMLElement>('.rl-stelle')
    return {
      stelleBreite: st ? Math.round(st.getBoundingClientRect().width) : 0,
      reiterBreite: Math.round(el.offsetWidth),
    }
  })
  expect(m.stelleBreite, 'kein leerer Platzhalter (Vorstand: 60 px)').toBe(0)
  expect(m.reiterBreite, 'der Reiter misst seinen Inhalt (Vorstand: 137 px)').toBeLessThan(110)
})

// ═══ R13-5 · DIE RÜCKFAHRKARTE LIEGT DA, WO MAN SIE SUCHT ═══════════════════
//
// GEMESSEN am Vorstand: nach dem Schliessen des letzten Reiters standen 0
// Reiter, der Ring hielt drei Einträge — und der Rechtsklick auf den Leerraum
// ergab `[role=menu]` = 0. Zurück kam man nur mit Alt+⇧+T, mit der Maus gar
// nicht.
test('R13-5 — Rechtsklick auf den Leerraum bietet «Wieder öffnen» an', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await seed(page, [OR, BGE], OR)
  for (const s of ['/gesetze/bund/OR', BGE]) {
    await page.locator(`[data-reiter-schluessel="${s}"] button[aria-label*="schliessen"]`).first().click()
    await page.waitForTimeout(300)
  }
  await expect(page.locator(`${STREIFEN} [data-reiter-schluessel]`)).toHaveCount(0)

  const kasten = (await page.locator(STREIFEN).boundingBox())!
  await page.mouse.click(kasten.x + kasten.width - 40, kasten.y + kasten.height / 2, { button: 'right' })
  const menue = page.locator('[role=menu]')
  await expect(menue).toHaveCount(1)
  await expect(menue.getByRole('menuitem', { name: /Wieder öffnen/ })).toBeVisible()
  await expect(menue.getByRole('menuitem', { name: 'Neuer Reiter' })).toBeVisible()

  await menue.getByRole('menuitem', { name: /Wieder öffnen/ }).click()
  await expect(page.locator(`${STREIFEN} [data-reiter-schluessel]`)).toHaveCount(1)
})

// ═══ R13-6/R13-9 · WAS IM REITER-MENÜ FEHLTE ════════════════════════════════
//
// GEMESSEN am Vorstand @1440 mit drei Reitern: der Blatt-Knopf war `md:hidden`
// (Breite 0) und «Alle schliessen» stand ausschliesslich im Blatt — am Desktop
// also nirgends. Und das Menü kannte kein «Adresse kopieren», obwohl die App
// den Weg hat (`LinkTeilenButton`).
test.describe('R13-6/R13-9 — «Alle schliessen» und «Adresse kopieren» am Reiter', () => {
  test('«Alle schliessen» steht am Desktop im Reiter-Menü und wirkt', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await seed(page, [OR, BGE, RECHNER])
    await page.locator('[data-reiter-schluessel="/gesetze/bund/OR"]').click({ button: 'right' })
    const menue = page.locator('[role=menu]')
    await expect(menue.getByRole('menuitem', { name: 'Alle schliessen' })).toBeVisible()
    await menue.getByRole('menuitem', { name: 'Alle schliessen' }).click()
    await expect(page.locator(`${STREIFEN} [data-reiter-schluessel]`)).toHaveCount(0)
    expect(await gespeichert(page)).toEqual([])
  })

  test('«Adresse kopieren» legt die kanonische Adresse in die Zwischenablage', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.setViewportSize({ width: 1440, height: 900 })
    await seed(page, [OR, BGE])
    await page.locator(`[data-reiter-schluessel="${BGE}"]`).click({ button: 'right' })
    await page.getByRole('menuitem', { name: 'Adresse kopieren' }).click()
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toContain(BGE)
  })
})

// ═══ R13-7/R13-8 · DIE TASTATURWEGE SIND ABLESBAR UND VOLLSTÄNDIG ═══════════
//
// GEMESSEN am Vorstand: 0 × `aria-keyshortcuts` in der ganzen Leiste, kein
// Alt-Weg im `title` — und `Alt+9` sprang auf den NEUNTEN Reiter, womit bei 15
// Reitern alles ab #10 per Tastatur unerreichbar war.
test.describe('R13-7/R13-8 — Tastatur', () => {
  test('jeder erreichbare Reiter nennt sein Kürzel — im title und für ARIA', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await seed(page, FUENFZEHN.slice(0, 4), '/gesetze/bund/OR')
    const dritter = page.locator('[data-reiter-schluessel="/gesetze/bund/ZPO"]')
    await expect(dritter).toHaveAttribute('title', /Alt\+3/)
    await expect(dritter.locator('button').first()).toHaveAttribute('aria-keyshortcuts', 'Alt+3')
    const letzter = page.locator('[data-reiter-schluessel="/gesetze/bund/StGB"]')
    await expect(letzter.locator('button').first()).toHaveAttribute('aria-keyshortcuts', /Alt\+9/)
  })

  test('Alt+9 springt auf den LETZTEN Reiter, Alt+Bild↓/↑ blättert zyklisch', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await seed(page, FUENFZEHN.slice(0, 12), '/gesetze/bund/OR')
    // GEWARTET WIRD AUF DIE LEISTE, NICHT AUF DIE ADRESSE: die Leser-Route lädt
    // ihren Chunk nach, die URL steht darum vor dem Re-Render der Leiste. Wer
    // nur die URL abfragt, drückt die nächste Taste gegen den ALTEN aktiven
    // Reiter — gemessen 7.9.2026 (Alt+Bild↑ landete auf BGG statt VwVG).
    // Kleinschreibung im Vergleich: der Reiter-Schlüssel folgt der Adresse, und
    // die Route liefert den Erlass-Key nach einer Navigation in seiner
    // kanonischen Schreibung (`VWVG`), während der Speicher die geseedete trägt.
    // Geprüft wird hier die REIHENFOLGE, nicht die Schreibweise.
    const aktiv = async () => (await page.locator(`${STREIFEN} [data-reiter-aktiv="true"]`)
      .getAttribute('data-reiter-schluessel'))?.toLowerCase()
    await page.keyboard.press('Alt+9')
    await expect.poll(aktiv).toBe('/gesetze/bund/vwvg')
    // Vom letzten einen weiter = wieder der erste (Umlauf, Browser-Norm).
    await page.keyboard.press('Alt+PageDown')
    await expect.poll(aktiv).toBe('/gesetze/bund/or')
    await page.keyboard.press('Alt+PageUp')
    await expect.poll(aktiv).toBe('/gesetze/bund/vwvg')
  })

  test('das Blatt führt die Kürzel-Liste — sonst lernt sie niemand', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await seed(page, [OR, BGE, RECHNER])
    await page.getByRole('button', { name: 'Alle 3 offenen Reiter' }).click()
    const blatt = page.getByRole('dialog', { name: 'Alle geöffneten Reiter' })
    await expect(blatt.getByText('Alt+9', { exact: true })).toBeVisible()
    await expect(blatt.getByText('zum letzten Reiter')).toBeVisible()
    // Was der Browser abfängt, wird NICHT versprochen (§8).
    await expect(blatt.getByText('Ctrl+Tab')).toHaveCount(0)
  })
})
