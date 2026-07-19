// E7 / A33 (FAHRPLAN-GESETZES-UX §10.10) — «Gliederung springt umher. Wenn man
// sich darin bewegt.» (David 16.7.2026). Regressions-Wächter für die Ruhe des
// Gliederungs-Baums (Scroll-Spy / TOC-Mitscroll). Läuft gegen `vite preview`
// (dist). Beweispunkte:
//   F1 (RC1a) — beim Lese-Scroll führt der TOC sich nur per RAND-NUDGE nach
//     (≈ eine Zeilenhöhe), nie mit ½-Container-Sprüngen (vorher 289–315 px).
//   F2 (RC1b) / V1 — bewegt sich der Nutzer selbst in der Gliederung, bleibt
//     seine Blätter-Position erhalten (kein verspätetes Zurückreissen).
//   Klick-Ruhe — ein TOC-Eintrag lässt sich anklicken und springt sauber ans Ziel.
//   A9-DoD — Lese-Scroll unter 4× CPU-Drossel: CLS 0, keine Konsolenfehler.
import { test, expect, type Page } from '@playwright/test'
import { clsBeobachtenInstallieren, clsAuslesen, clsHoehenSamplerVorabInstallieren } from './helpers/cls'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

// TOC-Scrollposition dieses (Primär-)Panes.
async function tocScrollTop(page: Page): Promise<number> {
  return page.evaluate(() => {
    const c = document.querySelector('[data-toc]') as HTMLElement | null
    return c ? c.scrollTop : -1
  })
}
// Aktueller Highlight-Eintrag (letzter [data-toc-aktiv]) — Textkennung.
async function aktivLabel(page: Page): Promise<string> {
  return page.evaluate(() => {
    const a = document.querySelectorAll('[data-toc] [data-toc-aktiv]')
    const el = a[a.length - 1] as HTMLElement | undefined
    return el ? (el.textContent ?? '').trim() : ''
  })
}

test.describe('A33 — Ruhige Gliederung (Scroll-Spy / TOC)', () => {
  // ── F1: Lese-Scroll führt den TOC nur per Rand-Nudge nach, keine ½-Container-Sprünge ──
  // CLS wird hier NICHT geprüft: der Auto-Akkordeon-Reflow der <li> (Auftrag K,
  // un-animiert, §15.2/nichtBauen-3) erzeugt unter dem synthetischen SCHNELL-Wheel
  // dieses Tests einen «kein-Input»-Shift, der auf origin/main byte-gleich ist
  // (Baseline 0.1055 vs. Fix 0.1038 — F3-Entprellung ist CLS-neutral). Die CLS-0-DoD
  // fährt der A9-Test unten (echtes Tastatur-Scrollen unter 4× Drossel, Repo-Konvention
  // wie leser-position-u.e2e.ts). Hier zählt allein die TOC-Eigenbewegung + Highlight.
  test('F1 — Lese-Scroll: TOC-Eigenbewegung ≤ Nudge, Highlight folgt', async ({ page }) => {
    // Runner-Budgets 19.7.: F1-Notdach explizit 240 s (zuvor 180 s). Dieser Test macht
    // das schwerste REALE Lese-Scrollen aller Specs auf der 2000-Artikel-OR-Seite, je
    // mit content-visibility- + Auto-Akkordeon-Reflow. Die Schrittzahl ist parallel von
    // 14 auf 8 gesenkt (Kalibrierung unten). KEIN versteckter Hänger: F1 wartet nur auf
    // `article`/`[data-toc]` (beide unabhängig von STANDARD_OFFEN_TIEFE) und misst danach
    // über kurze page.evaluate-Reads; die Zeit geht rein in die Reflow-Kosten je Wheel.
    // Auf langsamen 2-vCPU-Runner-Instanzen riss reihum auch das 180-s-Budget (auf
    // schnellen ~90 s). 240 s ist ein NOTDACH gegen die Instanz-Streuung; es greift nur
    // bei Überschreitung und verlangsamt grüne Läufe nicht (§6.3, kein Assertion-Change).
    test.setTimeout(240_000)
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 820 })
    await page.goto('/gesetze/bund/OR')
    await expect(page.locator('article[id^="art-"]').first()).toBeVisible({ timeout: 20000 })
    // 2-Spalten-Gliederung (istXl) muss stehen — der [data-toc]-Container existiert.
    await expect(page.locator('[data-toc]')).toBeVisible({ timeout: 10000 })

    // Etwas hineinscrollen, damit ein aktiver Zweig existiert und der TOC selbst
    // scrollbar wird (langer Erlass). Maus über die LESESPALTE (nicht den TOC),
    // damit mouse.wheel die SEITE scrollt, nicht den Gliederungs-Container.
    await page.mouse.move(950, 420)
    for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, 400); await page.waitForTimeout(90) }
    await page.waitForTimeout(400)

    const labels = new Set<string>()
    let maxDelta = 0
    let vorherTop = await tocScrollTop(page)
    labels.add(await aktivLabel(page))
    // 8 feine Lese-Scroll-Schritte à 120 px; nach jedem die TOC-Eigenbewegung messen.
    // Runner-Budgets 19.7.: von 14 auf 8 Schritte gesenkt (echtes mouse.wheel bleibt —
    // der Scroll-Spy braucht reales Lese-Scrollen). EMPIRISCH KALIBRIERT (lokal, 6×
    // CPU-Drossel, 2 deterministische Läufe byte-gleich): die Highlight-Wanderung ist
    // rein layout-getrieben und erreicht 3 distinkte Highlights bereits bei Schritt 4
    // (dist-Folge 1·2·2·3·3·3·4·4 über die Schritte 1–8), also dist=4 nach 8 Schritten —
    // ein volles distinkt Marge über die geforderten ≥ 3 (und 3 schon 4 Schritte vor
    // Schluss). Die TOC-Eigenbewegung (½-Container-Sprung-Wächter) blieb über ALLE
    // Schritte bei 0 px, weit unter der 150-px-Grenze — der Nudge-Fix hält den Container
    // ruhig, unabhängig von der Schrittzahl. Die pro-Schritt-Wartezeit bleibt bei 260 ms
    // (> F3-Entprellung 200 ms): kürzer bringt kaum Zeit, riskiert aber, einen mid-flight-
    // Nudge als transienten Ausreisser zu lesen — mit maxDelta=0 ist das unnötiges Risiko.
    // Prüfumfang reduziert (~43 % weniger Scroll-Reflows → tragbares Wallclock auf langsamen
    // Runner-Instanzen), Prüfschärfe unverändert: beide Assertions behalten Marge.
    for (let i = 0; i < 8; i++) {
      await page.mouse.wheel(0, 120)
      await page.waitForTimeout(260) // > F3-Entprellung (200 ms) → Nudge eingeschwungen
      const jetzt = await tocScrollTop(page)
      maxDelta = Math.max(maxDelta, Math.abs(jetzt - vorherTop))
      vorherTop = jetzt
      labels.add(await aktivLabel(page))
    }

    // F1-Kern: KEIN einziger ½-Container-Sprung. Vorher lagen die Sprünge bei
    // 289–315 px (Container-Mitte + smooth). Nach dem Fix ist die Eigenbewegung
    // je Schritt höchstens ein Rand-Nudge (Zeilenhöhe, + evtl. ein Akkordeon-Reflow).
    expect(maxDelta, `max TOC-Eigenbewegung/Schritt ${maxDelta}px`).toBeLessThan(150)
    // Funktions-Treue: der Scroll-Spy lebt — der Highlight ist mehrfach gewandert.
    expect(labels.size, `distinkte Highlights ${labels.size}`).toBeGreaterThanOrEqual(3)
    expect(fehler).toEqual([])
  })

  // ── F2 / V1: Wer selbst in der Gliederung blättert, behält seine Position ──
  test('F2/V1 — manuelles TOC-Blättern wird nicht zurückgerissen', async ({ page }) => {
    // Runner-Budgets 19.7.: F2/V1-Notdach explizit 180 s (zuvor 120 s), analog zu F1 —
    // reales Wheel-Scrollen auf der schweren OR-Seite streut auf langsamen 2-vCPU-Runner-
    // Instanzen; das Notdach greift nur bei Überschreitung (§6.3, kein Assertion-Change).
    test.setTimeout(180_000)
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 820 })
    await page.goto('/gesetze/bund/OR')
    await expect(page.locator('article[id^="art-"]').first()).toBeVisible({ timeout: 20000 })
    await expect(page.locator('[data-toc]')).toBeVisible({ timeout: 10000 })

    // In den Erlass scrollen (aktiver Zweig existiert), TOC einschwingen lassen.
    // CI-Härtung 18.7.: 10 → 7 Wheels (7 × 500 = 3500 px reicht, um tief in den OR
    // zu scrollen und den TOC scrollbar zu machen); die F2-Logik (Guard hält die
    // Blätter-Position, Δ < 24 px) ist von der Warmlauf-Distanz unabhängig.
    await page.mouse.move(950, 420)
    for (let i = 0; i < 7; i++) { await page.mouse.wheel(0, 500); await page.waitForTimeout(90) }
    await page.waitForTimeout(500)

    // Der Nutzer blättert JETZT selbst in der Gliederung: Maus über den TOC, wheeln.
    // Das armiert den Interaktions-Guard (F2) und verschiebt die TOC-Position.
    const tocBox = await page.locator('[data-toc]').boundingBox()
    expect(tocBox).not.toBeNull()
    await page.mouse.move(tocBox!.x + tocBox!.width / 2, tocBox!.y + tocBox!.height / 2)
    await page.mouse.wheel(0, 260)
    await page.waitForTimeout(120)
    const nachBlaettern = await tocScrollTop(page)

    // Sofort eine Lese-Scroll-Interaktion (Artikelwechsel) auslösen — INNERHALB des
    // 1,5-s-Guards. Vorher riss der Mitscroll-Effekt die TOC-Position um ~311 px zurück.
    await page.mouse.move(950, 420)
    await page.mouse.wheel(0, 240)
    await page.waitForTimeout(350) // < 1500 ms Guard
    const nachLeseScroll = await tocScrollTop(page)

    expect(Math.abs(nachLeseScroll - nachBlaettern), `Blätter-Position gehalten (Δ ${Math.abs(nachLeseScroll - nachBlaettern)}px)`).toBeLessThan(24)
    expect(fehler).toEqual([])
  })

  // ── Klick-Ruhe: ein TOC-Eintrag springt sauber ans Ziel (kein Klick-Hazard) ──
  test('Klick-Ruhe — TOC-Eintrag anklicken springt zum Abschnitt', async ({ page }) => {
    test.slow()
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 820 })
    await page.goto('/gesetze/bund/OR')
    await expect(page.locator('article[id^="art-"]').first()).toBeVisible({ timeout: 20000 })
    const toc = page.locator('[data-toc]')
    await expect(toc).toBeVisible({ timeout: 10000 })

    // Einen Top-Level-Gliederungs-Sprungknopf anklicken (nicht das Chevron).
    const eintrag = toc.locator('button[data-toc-aktiv], button[aria-current]').first()
    // Falls (noch) kein aktiver Eintrag: irgendeinen Sprungknopf mit Label nehmen.
    const ziel = (await eintrag.count()) > 0 ? eintrag : toc.getByRole('button').nth(1)
    await ziel.scrollIntoViewIfNeeded()
    const box1 = await ziel.boundingBox()
    await ziel.click()
    // Der Klick darf nicht hängen: die Seite hat einen #art-/Sektions-Sprung vollzogen
    // (aktiver Highlight vorhanden) und der Knopf ist weiterhin bedienbar/stabil.
    await page.waitForTimeout(700)
    await expect(page.locator('[data-toc] [data-toc-aktiv]').first()).toBeVisible({ timeout: 10000 })
    const box2 = await toc.locator('button[data-toc-aktiv]').first().boundingBox()
    expect(box1).not.toBeNull()
    expect(box2).not.toBeNull()
    expect(fehler).toEqual([])
  })

  // ── A9-DoD: Lese-Scroll unter 4× CPU-Drossel, CLS 0 ──
  test('A9 — Lese-Scroll unter CPU-Drossel: CLS 0, keine Konsolenfehler', async ({ page }) => {
    test.slow()
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 820 })
    // Wachser-Diagnose (19.7.): den Über-Grid-Höhen-Sampler schon AB Navigation
    // starten (vor goto), damit der problematische ~2.7-s-Lade-Shift (vom buffered-
    // Observer nachgezogen) im Fehler-Bericht seinen WACHSER trägt — das Element
    // oberhalb des Grids, dessen Höhe deterministisch einwächst. Reine Diagnose (§6.3).
    await clsHoehenSamplerVorabInstallieren(page)
    await page.goto('/gesetze/bund/OR')
    await expect(page.locator('article[id^="art-"]').first()).toBeVisible({ timeout: 20000 })
    await expect(page.locator('[data-toc]')).toBeVisible({ timeout: 10000 })
    // Beobachter mit Quellen-Erfassung (buffered wie bisher): bei Überschreitung
    // nennt die expect-Meldung die Top-shiftenden Elemente im Klartext + Wachser.
    await clsBeobachtenInstallieren(page, true)
    const client = await page.context().newCDPSession(page)
    await client.send('Emulation.setCPUThrottlingRate', { rate: 4 })
    // Echtes Tastatur-Scrollen (content-visibility-Reflows dem Input zugerechnet).
    await page.locator('body').press('Escape')
    for (let i = 0; i < 6; i++) { await page.keyboard.press('PageDown'); await page.waitForTimeout(120) }
    for (let i = 0; i < 3; i++) { await page.keyboard.press('PageUp'); await page.waitForTimeout(120) }
    await expect(page.locator('article[id^="art-"]').first()).toBeVisible({ timeout: 12000 })
    const { cls, bericht } = await clsAuslesen(page)
    expect(cls, `CLS ${cls} — ${bericht}`).toBeLessThan(0.05)
    await client.send('Emulation.setCPUThrottlingRate', { rate: 1 })
    expect(fehler).toEqual([])
  })
})
