// @shard-gruppe: 5
// B7-N1 · LM-010/LM-015 — die abdunkelnde Fläche hinter den Menüfenstern des
// Lesers (Entscheid David 8.8.2026).
//
// ── WAS DER BEFUND SAGT UND WAS DAVON HEUTE NOCH GILT (Vintage-Regel §0.1) ───
// Gemessen 30.8.2026 am gebauten Stand @1440 auf `/gesetze/bund/OR`:
//  · LM-010 («Rechtsprechungs-Menü rund 460 px hoch, liegt über dem Text») ist
//    ÜBERHOLT — die Fläche ist seit H3/Ä60 kein aufgezogenes Menü mehr, sondern
//    eine eigene Layout-Spur NEBEN dem Text; sie erzeugt gar kein Overlay.
//  · LM-015 («Die Menüfenster haben keine abdunkelnde Fläche dahinter») war für
//    «Ansicht ▾» REPRODUZIERT: 240 × 199 px, deckendes `paper-raised`, z-40,
//    kein Scrim im DOM.
//
// ── DIE REGEL, DIE DIESE SPEC BEWACHT ───────────────────────────────────────
// DER SCRIM FOLGT DER FOKUS-FALLE, nicht der Fläche. «Ansicht ▾» läuft im Modus
// `popover` und fängt den Fokus (`useDialogFokus`) — es ist modal und sagt das
// jetzt auch. Das Rechtsprechungs-Panel läuft auf D im Modus `beiwerk`/`spalte`
// und fängt ihn bewusst NICHT (Ä52) — dort bleibt es beim Scrim-Verzicht. Beide
// Hälften stehen hier, sonst bewachte die Spec nur die eine Richtung.
//
// ── UND: DER SCRIM MUSS ABDUNKELN, IN BEIDEN THEMES ─────────────────────────
// `--ink-900` flippt mit dem Thema (hell `#201E16`, dunkel `#E9E7E2`). Ein
// `bg-ink-900/30` ist darum im Dunkelmodus ein HELLER Schleier — genau das stand
// bis zum 30.8.2026 im modalen Leser-Blatt (`LeserPanelZone`). Der Wächter
// prüft die Deckfarbe deshalb in BEIDEN Themes gegen denselben Wert: ein Scrim,
// der seine Farbe mit dem Thema wechselt, ist per Definition falsch.
// Läuft gegen `vite preview` (dist).
import { test, expect, type Page } from '@playwright/test'
import { fehlerSammeln } from './helpers/fehlerSammeln'

const SCRIM_FARBE = 'rgba(0, 0, 0, 0.3)'
// ── WURZEL-FIX (§17, W2·24-R6c 6.9.2026): NICHT MEHR DER OR ─────────────────
// Diese Datei lief auf `/gesetze/bund/OR` und riss reproduzierbar unter
// Parallel-Last an `leserBereit` («element(s) not found» nach 20 s), während
// jeder Fall einzeln grün war — 4 von 8 Fällen im 5-Worker-Lauf, 1 von 8 im
// seriellen (Nullprobe auf 2a18f97bb, also ÄLTER als R6c). Gemessen am
// Preview-Build: die OR-Seite liefert **8.75 MB** vorgerendertes HTML, BGBM
// **144 KB** — Faktor 60. Der Scrim ist erlass-neutral (er hängt am Menü, nicht
// am Gesetzestext), also kostet der Wechsel keine Aussage und nimmt der Datei
// ihre einzige Flake-Ursache. Dasselbe Argument und derselbe Erlass stehen seit
// dem 4.7.2026 in `e2e/leser-lesemass.e2e.ts` («BGBM … klein (~22 KB), trägt
// Marker UND Apparat — der grosse OR starvte den gedrosselten CI-Runner»).
// GEPRÜFT, dass BGBM alle vier Haken dieser Datei trägt (je 1×):
// `[data-leser-v3="rahmen"]`, `[data-v3-ansicht]`, `[data-v3-panel-oeffner]`,
// `[data-v3-panel-zaehler]`.
const PFAD = '/gesetze/bund/BGBM'

const ansichtOeffner = (page: Page) => page.locator('[data-v3-ansicht]')
const ansichtPanel = (page: Page) => page.locator('[data-v3-ansicht-panel]')
const ansichtScrim = (page: Page) => page.locator('[data-v3-ansicht-scrim]')

async function leserBereit(page: Page) {
  await page.goto(PFAD)
  await expect(page.locator('[data-leser-v3="rahmen"]')).toBeVisible({ timeout: 20_000 })
  await expect(page.locator('#art-1')).toBeVisible({ timeout: 20_000 })
}

test.describe('B7-N1 · Scrim hinter dem «Ansicht ▾»-Menü (LM-015)', () => {
  test('offen ⇒ vollflächiger Scrim; zu ⇒ keiner; Klick darauf schliesst', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await leserBereit(page)

    // Ruhezustand: kein Scrim (er darf nie stehenbleiben).
    await expect(ansichtScrim(page)).toHaveCount(0)

    await ansichtOeffner(page).click()
    await expect(ansichtPanel(page)).toBeVisible()
    await expect(ansichtScrim(page)).toHaveCount(1)

    // Vollflächig — ein Scrim, der nur ein Stück deckt, tritt nicht ab.
    const mass = await ansichtScrim(page).evaluate((el) => {
      const r = el.getBoundingClientRect()
      return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) }
    })
    expect(mass).toEqual({ w: 1440, h: 900, x: 0, y: 0 })

    // Klick auf die Abdunklung schliesst (vierte Geste neben Esc, Aussenklick,
    // Öffner) — er ist eigens verdrahtet, weil der Scrim im Portal ausserhalb
    // des `wrapRef` liegt, gegen das die Aussenklick-Prüfung misst.
    await ansichtScrim(page).click({ position: { x: 40, y: 700 } })
    await expect(ansichtPanel(page)).toHaveCount(0)
    await expect(ansichtScrim(page)).toHaveCount(0)

    expect(fehler).toEqual([])
  })

  test('Stapelordnung: unter dem klebenden Kopf, über dem Lesetext — Öffner und Menü bleiben scharf', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await leserBereit(page)
    await ansichtOeffner(page).click()
    await expect(ansichtScrim(page)).toHaveCount(1)

    const z = await page.evaluate(() => {
      const n = (sel: string) => document.querySelector(sel)
      const zi = (el: Element | null) => (el ? getComputedStyle(el).zIndex : null)
      return {
        scrim: zi(n('[data-v3-ansicht-scrim]')),
        kopf: zi(n('[data-v3-kopf]')),
        panel: zi(n('[data-v3-ansicht-panel]')),
      }
    })
    expect(z.scrim, 'Scrim ohne eigene Stapelstufe').not.toBeNull()
    // Der Kopf trägt Öffner UND Menü. Läge der Scrim darüber, dimmte er genau
    // den Bezug zum auslösenden Knopf weg, den LM-015 zusätzlich verlangt.
    expect(Number(z.scrim), `Scrim (${z.scrim}) muss UNTER dem Kopf (${z.kopf}) liegen`)
      .toBeLessThan(Number(z.kopf))

    // Und der eigentliche Zweck: der Punkt, an dem der Lesetext steht, gehört
    // beim Treffer-Test jetzt dem Scrim (Text tritt zurück).
    const treffer = await page.evaluate(() => {
      const el = document.elementFromPoint(300, 700)
      return el?.getAttribute('data-v3-ansicht-scrim') !== null ? 'scrim' : (el?.tagName ?? 'nichts')
    })
    expect(treffer, 'Der Lesetext liegt nicht hinter dem Scrim').toBe('scrim')
  })

  // ── DER FALL, DER DEN `ink-900`-FEHLER GEFANGEN HÄTTE ──────────────────────
  for (const thema of ['light', 'dark'] as const) {
    test(`Deckfarbe ist themenunabhängig und dunkelt ab — ${thema}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: thema })
      await page.setViewportSize({ width: 1440, height: 900 })
      await leserBereit(page)
      await ansichtOeffner(page).click()
      await expect(ansichtScrim(page)).toHaveCount(1)

      const farbe = await ansichtScrim(page).evaluate((el) => getComputedStyle(el).backgroundColor)
      expect(farbe, `Scrim-Farbe im Thema «${thema}» — ein Scrim, der mit dem Thema flippt, hellt in einem der beiden auf`)
        .toBe(SCRIM_FARBE)
    })
  }
})

test.describe('B7-N1 · Der modale Blatt-Scrim dunkelt auch im Dunkelmodus ab', () => {
  // Der Fehler, den das fängt: bis 30.8.2026 stand hier `bg-ink-900/30`.
  // `--ink-900` ist im Dunkelmodus `#E9E7E2` — der «Scrim» hellte dort auf.
  for (const thema of ['light', 'dark'] as const) {
    test(`@390 modales Blatt — Deckfarbe themenunabhängig (${thema})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: thema })
      await page.setViewportSize({ width: 390, height: 844 })
      await leserBereit(page)

      await page.locator('[data-v3-panel-oeffner]').first().click()
      await expect(page.locator('[data-v3-panel-modal="ja"]')).toBeVisible({ timeout: 20_000 })
      const scrim = page.locator('[data-v3-panel-scrim]')
      await expect(scrim).toHaveCount(1)
      expect(await scrim.evaluate((el) => getComputedStyle(el).backgroundColor),
        `Blatt-Scrim im Thema «${thema}»`).toBe(SCRIM_FARBE)
    })
  }
})

test.describe('B7-N1 · Ä52 bleibt unangetastet — Beiwerk bekommt KEINEN Scrim', () => {
  test('Rechtsprechungs-Panel @1440: kein Overlay, kein Scrim (der Lesetext bleibt lesbar)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await leserBereit(page)

    await page.locator('[data-v3-panel-oeffner]').first().click()
    await expect(page.locator('[data-v3-panel-form]')).toBeVisible({ timeout: 20_000 })

    // Die Zusage von `panelForm`/Ä52: nicht modal, also kein Scrim — weder der
    // eigene des Panels noch der des Ansicht-Menüs.
    await expect(page.locator('[data-v3-panel-modal="ja"]')).toHaveCount(0)
    await expect(ansichtScrim(page)).toHaveCount(0)
    const vollflaechig = await page.evaluate(() => [...document.querySelectorAll('div')]
      .filter((e) => {
        const c = getComputedStyle(e); const r = e.getBoundingClientRect()
        return c.position === 'fixed' && r.width >= innerWidth - 2 && r.height >= innerHeight - 2
          && c.backgroundColor !== 'rgba(0, 0, 0, 0)'
      }).length)
    expect(vollflaechig, 'Beiwerk-Panel hat wieder eine Vollflächen-Abdunklung (Ä52)').toBe(0)
  })
})
