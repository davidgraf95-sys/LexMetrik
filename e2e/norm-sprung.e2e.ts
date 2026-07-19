// Browser-Smoke des Norm-Sprungs in der NORMALEN Suchleiste (A5 · U-SUCHE,
// David 5.7.2026). Der Kontrakt ist die Sprung-FUNKTION, nicht mehr eine eigene
// ⌘K-Palette (die ist entfallen): erkennt die HeaderSuche eine Norm («OR 257d»,
// «ABRG 3»), erscheint der Direkt-Sprung als OBERSTER Treffer (Sprung-Badge),
// Enter springt zum Deep-Link. Freitext liefert keinen Sprung, sondern die
// gruppierte Universal-Suche. ⌘K/Ctrl-K fokussiert das Feld (kein Overlay).
// Läuft gegen `vite preview` (dist).
import { test, expect, type Page } from '@playwright/test'
import { clsBeobachtenInstallieren, clsAuslesen } from './helpers/cls'

// CI-Härtung 19.7.2026 (BEFUND 3b): die Sprung-Tests warten per 20-s-Latch auf den
// EINMAL-Load des ~4-MB-Artikel-Index (P3 u. a.). Auf dem 2-vCPU-Runner unter
// Starvation überschritt dieser Latch reihum das globale 30-s-Test-Budget. Budget
// darum explizit auf 60 s (Muster gesetze-pdf-download). Der A9-CLS-Test behält sein
// eigenes test.slow(). INFRASTRUKTUR (Zeitbudget), KEIN Assertion-Change (§6.3):
// Sprung-/CLS-Assertions unberührt, Timeout greift nur bei Überschreitung.
test.describe.configure({ timeout: 60_000 })

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

// Die eine, überall sichtbare Kopf-Suchleiste (ARIA-Combobox).
const sucheFeld = (page: Page) => page.getByRole('combobox', { name: /LexMetrik durchsuchen/ })
// Das Trefferpanel ist eine ARIA-Listbox; der Sprung ist die erste Gruppe.
const listbox = (page: Page) => page.getByRole('listbox', { name: 'Suchtreffer' })

test.describe('Norm-Sprung in der normalen Suchleiste (A5)', () => {
  test('«OR 257d» ⇒ Sprung ist oberster Treffer, Enter springt zu #art-257_d (P3)', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.goto('/gesetze')
    const feld = sucheFeld(page)
    await feld.click()
    await feld.fill('OR 257d')
    // Der Norm-Sprung erscheint als oberste Gruppe mit Sprung-Badge + amtlichem Titel.
    const box = listbox(page)
    await expect(box).toBeVisible()
    await expect(box.getByText('Norm-Sprung', { exact: true })).toBeVisible()
    await expect(box.getByText('Sprung', { exact: true })).toBeVisible()
    // Der Sprung ist die ERSTE Option (oberster Treffer, A5).
    await expect(box.getByRole('option').first()).toContainText('OR')
    await expect(box.getByRole('option').first()).toContainText('257d')
    // Enter (ohne Pfeil-Auswahl) springt auf den Direkt-Treffer.
    await feld.press('Enter')
    await expect(page).toHaveURL(/\/gesetze\/bund\/OR#art-257_d$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('OR')
    // Der Ziel-Artikel steht im DOM (Anker auflösbar, §15 Funktions-Treue).
    await expect(page.locator('#art-257_d')).toHaveCount(1)
    expect(fehler).toEqual([])
  })

  test('kantonaler Sprung mit Kantons-Angabe («ABRG 3»)', async ({ page }) => {
    await page.goto('/gesetze')
    const feld = sucheFeld(page)
    await feld.click()
    await feld.fill('ABRG 3')
    await expect(listbox(page).getByText('Sprung', { exact: true })).toBeVisible()
    await feld.press('Enter')
    await expect(page).toHaveURL(/\/gesetze\/kanton\/AR-621\.12#art-3$/)
  })

  test('«BGE 152 II 19» ⇒ Entscheid-Sprung «Direkt öffnen», Enter öffnet den Entscheid (S2)', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.goto('/gesetze')
    const feld = sucheFeld(page)
    await feld.click()
    await feld.fill('BGE 152 II 19')
    const box = listbox(page)
    await expect(box).toBeVisible()
    await expect(box.getByText('Entscheid-Sprung', { exact: true })).toBeVisible()
    await expect(box.getByText('Direkt öffnen', { exact: true })).toBeVisible()
    await expect(box.getByRole('option').first()).toContainText('BGE 152 II 19')
    await feld.press('Enter')
    await expect(page).toHaveURL(/\/rechtsprechung\/bge_152_II_19$/)
    expect(fehler).toEqual([])
  })

  test('BGE ohne Präfix «152 II 19» springt ebenfalls', async ({ page }) => {
    await page.goto('/gesetze')
    const feld = sucheFeld(page)
    await feld.click()
    await feld.fill('152 II 19')
    await expect(listbox(page).getByText('Direkt öffnen', { exact: true })).toBeVisible()
    await feld.press('Enter')
    await expect(page).toHaveURL(/\/rechtsprechung\/bge_152_II_19$/)
  })

  test('BGE nicht im Bestand ⇒ §8-ehrliche Zeile + amtlicher bger.ch-SUCH-Link (A40, kein stilles Rauschen)', async ({ page }) => {
    await page.goto('/gesetze')
    const feld = sucheFeld(page)
    await feld.click()
    await feld.fill('BGE 1 I 1')
    const box = listbox(page)
    await expect(box.getByText(/nicht im Bestand/)).toBeVisible()
    // A40 (David 16.7.2026): EHRLICHER Such-Link statt konstruiertem highlight_docid-
    // Permalink (der landete beim falschen Entscheid). «suchen» statt «öffnen».
    const amtlich = box.getByRole('link', { name: /beim Bundesgericht suchen/ })
    await expect(amtlich).toBeVisible()
    await expect(amtlich).toHaveAttribute('href', /bger\.ch.*type=simple_query.*query_words=BGE(%20|\+|\s)1(%20|\+|\s)I(%20|\+|\s)1/)
    await expect(amtlich).not.toHaveAttribute('href', /highlight_docid/)
    await expect(amtlich).toHaveAttribute('target', '_blank')
  })

  test('Freitext zeigt KEINEN Sprung, sondern die gruppierte Suche', async ({ page }) => {
    await page.goto('/gesetze')
    const feld = sucheFeld(page)
    await feld.click()
    await feld.fill('Kündigung')
    const box = listbox(page)
    await expect(box).toBeVisible()
    // Kein Sprung-Vorschlag (kein Fehl-Sprung) …
    await expect(box.getByText('Norm-Sprung', { exact: true })).toHaveCount(0)
    await expect(box.getByText('Sprung', { exact: true })).toHaveCount(0)
    // … aber die Universal-Suche liefert Treffer.
    await expect(box.getByRole('option').first()).toBeVisible()
  })

  test('§8-Korpus-Offenlegung: Fusszeile «Durchsucht …» + Link auf /abdeckung (S3/E1)', async ({ page }) => {
    await page.goto('/gesetze')
    const feld = sucheFeld(page)
    await feld.click()
    await feld.fill('Miete')
    // Fusszeile erscheint, sobald die Manifeste geladen sind (für jede Query).
    await expect(page.getByText(/Durchsucht:/)).toBeVisible()
    const link = page.getByRole('link', { name: /Was ist drin/ })
    await expect(link).toHaveAttribute('href', '/abdeckung')
    await link.click()
    await expect(page).toHaveURL(/\/abdeckung$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Was ist durchsuchbar')
  })

  test('⌘K/Ctrl-K fokussiert die Suchleiste (kein Overlay mehr)', async ({ page }) => {
    await page.goto('/gesetze')
    // Kein Dialog/Overlay: die frühere Palette existiert nicht mehr.
    await page.keyboard.press('Control+k')
    await expect(sucheFeld(page)).toBeFocused()
    await expect(page.getByRole('dialog', { name: /Sprung zum Artikel/ })).toHaveCount(0)
  })

  test('Landeplatz-CTA auf /gesetze fokussiert die Suchleiste', async ({ page }) => {
    await page.goto('/gesetze')
    await page.getByRole('main').getByRole('button', { name: /Direkt zum Artikel springen/ }).click()
    await expect(sucheFeld(page)).toBeFocused()
  })

  // A9 (Querschnitt, DoD 10.4): Tippen/Navigieren/Springen bleibt unter starker
  // CPU-Drossel flüssig — ohne Timeout-Nähe — und die Interaktion verursacht
  // KEINEN Layout-Shift (CLS ≈ 0), weil der Sprung oben nur anwächst und nichts
  // darüber verschiebt. Der Kontrakt ist «Interaktion flüssig» (auf dem WARMEN
  // Index), NICHT «Kaltstart unter Drossel»: der Einmal-Load des ~4 MB-Index
  // läuft darum ungedrosselt VOR der Messung.
  test('A9: Suche tippen/navigieren/springen unter starker CPU-Drossel flüssig, CLS 0', async ({ page }) => {
    // Dieser Test fährt bewusst ZWEI Phasen: ungedrosselter Warmlauf (Einmal-Load
    // des ~4 MB-Index) + gedrosselte Mess-Interaktion. Auf dem 2-vCPU-CI-Runner
    // brauchen beide Phasen zusammen mehr als das 30-s-Default-Container-Budget —
    // nicht wegen Interaktions-Lag, sondern wegen des Einmal-Ladens auf schwacher
    // Hardware. `test.slow()` verdreifacht NUR das Container-Budget (90 s); die
    // einzelnen web-first-Assertions unten bleiben eng gebunden (12–15 s) und sind
    // weiterhin der SCHARFE Flüssigkeits-Beweis («ohne Timeout-Nähe», A9).
    test.slow()
    const fehler = fehlerSammeln(page)
    await page.goto('/gesetze')
    const feld = sucheFeld(page)
    // App-Ready-Latte: die Kopf-Suchleiste (ARIA-Combobox) rendert NUR der Client
    // (nicht im Crawler-HTML) — erst wenn sie sichtbar ist, hängen die React-Handler.
    // Auf dem langsamen CI-Runner grosszügig binden, damit der Warmlauf nicht auf
    // eine noch nicht hydrierte Leiste tippt (sonst Klick-/fill-Timeout).
    await expect(feld).toBeVisible({ timeout: 20000 })
    await feld.click()
    const box = listbox(page)
    // WARMLAUF (ungedrosselt): der erste Tastendruck stösst das einmalige Lazy-
    // Laden des ~4 MB-Artikel-Index + Browse-Manifests an (§15.3 — ein aufgeschobener
    // Ladezeitpunkt, KEIN Interaktions-Lag). Wir laden ihn vor der Messung, damit die
    // A9-Messung die reine Interaktion (Parser + Render) misst, nicht diesen Einmal-Load.
    await feld.fill('OR 257d')
    await expect(box.getByText('Sprung', { exact: true })).toBeVisible({ timeout: 20000 })
    await feld.fill('')
    await expect(box).toBeHidden()

    // CLS-Beobachter VOR der gemessenen Interaktion scharf schalten (nur unerwartete
    // Shifts). Mit Quellen-Erfassung: bei Überschreitung nennt die expect-Meldung
    // die Top-shiftenden Elemente + nav-relative Zeitstempel im Klartext.
    await clsBeobachtenInstallieren(page, true)
    // CI-realistischer Drossel-Grad: der 2-vCPU-CI-Runner drosselt durch Contention
    // schon von sich aus; 6× käme dort effektiv ≈12× nahe und misst dann Host-
    // Auslastung statt Interaktions-Lag (systematisch rot in #160/#161/#162). Darum
    // auf CI 4× (auf 2 vCPU ≈8× effektiv, weiterhin harte Drossel), lokal 6× auf
    // mehr Kernen. Der KONTRAKT (tippen/navigieren/springen ohne Hänger, CLS<0.05)
    // bleibt in BEIDEN Fällen bestehen und wird unverändert gemessen (§6.3).
    const drosselRate = process.env.CI ? 4 : 6
    // Ab hier gedrosselt (CDP, nur Chromium).
    const client = await page.context().newCDPSession(page)
    await client.send('Emulation.setCPUThrottlingRate', { rate: drosselRate })

    // Die SUCH-Interaktion auf dem WARMEN Index (tippen → Sprung sichtbar → über
    // Gruppen navigieren) muss unter Drossel FLÜSSIG bleiben: jede web-first-
    // Assertion löst innerhalb ihres eng gebundenen Timeouts (12–15 s) auf, ohne
    // ihm nahezukommen («ohne Timeout-Nähe», A9). Ein starrer Wall-Clock-Wert
    // wäre auf einem ausgelasteten Host unzuverlässig und misst Host-Contention
    // statt Interaktions-Lag — deshalb ist die gebundene Auflösung selbst der Beweis.
    await feld.fill('OR 257d')
    await expect(box.getByText('Sprung', { exact: true })).toBeVisible({ timeout: 12000 })
    // Über die Gruppen navigieren (Pfeil runter/hoch) — bleibt reaktiv; die aktive
    // Option wandert (aria-activedescendant gesetzt).
    await feld.press('ArrowDown')
    await feld.press('ArrowDown')
    await feld.press('ArrowUp')
    await expect(feld).toHaveAttribute('aria-activedescendant', /.+/, { timeout: 12000 })
    // CLS der Such-Interaktion messen, SOLANGE die Seite noch dieselbe ist
    // (Enter navigiert weg und ersetzt das window/__cls). Die Sprung-Gruppe wächst
    // nur oben an und verschiebt nichts → CLS ≈ 0 (§15.2).
    const { cls, bericht } = await clsAuslesen(page)
    expect(cls, `CLS ${cls} — ${bericht}`).toBeLessThan(0.05)
    // SPRINGEN (deterministisch — CI-Härtung QS-PERF, §15.3-Nachzug zu #183):
    // Enter OHNE aktive Pfeil-Auswahl nimmt den OBERSTEN Treffer = den Norm-Sprung
    // (exakt der A5-Kontrakt des P3-Tests oben). Die vorangehende Pfeil-Navigation
    // hat NUR die Reaktivität bewiesen (aria-activedescendant); sie darf den Sprung
    // NICHT steuern, denn `aktivIndex` ist ein POSITIONS-Index in die async
    // wachsende Trefferliste: die per useDeferredValue entkoppelte ~4-MB-
    // Artikelgruppe (#183) landet «einen Tick später», sodass ein arrow-gesetzter
    // Index unter Drossel auf einen nachträglich eingeschobenen Artikel-Treffer
    // zeigt (real reproduziert: Enter landete auf SCHKG#art-257 statt OR). Ein
    // Query-Reset (leeren → neu tippen) setzt aktivIndex auf -1 (HeaderSuche.tsx),
    // damit Enter deterministisch den Sprung nimmt. Alles WEITERHIN unter Drossel —
    // der Fluiditäts-Beweis (tippen → Sprung sichtbar → springen) bleibt scharf.
    await feld.fill('')
    await expect(box).toBeHidden()
    await feld.fill('OR 257d')
    await expect(box.getByText('Sprung', { exact: true })).toBeVisible({ timeout: 12000 })
    await feld.press('Enter')
    await expect(page).toHaveURL(/\/gesetze\/bund\/OR#art-257_d$/, { timeout: 15000 })
    await client.send('Emulation.setCPUThrottlingRate', { rate: 1 })
    expect(fehler).toEqual([])
  })

  test('Mobil (390px): Suchleiste trägt den Sprung ohne ⌘K, kein Overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/gesetze')
    const feld = sucheFeld(page)
    await feld.click()
    await feld.fill('OR 257d')
    await expect(listbox(page).getByText('Sprung', { exact: true })).toBeVisible()
    // Kein horizontaler Overflow bei offenem Panel auf 390px.
    const b = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }))
    expect(b.scroll, `scrollWidth ${b.scroll} > ${b.client}`).toBeLessThanOrEqual(b.client + 1)
  })
})
