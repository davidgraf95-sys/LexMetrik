// Browser-Smoke der Normrevisions-Ehrlichkeit (FAHRPLAN-VERZAHNUNG-UI §V1c):
// hängt ein alter Entscheid an einer SEIT DEM ENTSCHEID revidierten Norm, trägt der
// Leitfall-Chip einen ↻-Marker mit Revisionsdatum + AS-Fundstelle (aria-label).
// Beweist zugleich, dass die Klassifikation TEMPORAL ist (nicht «jede revidierte
// Norm»): ein Entscheid NACH der letzten Textänderung bleibt UI-still ('gleich').
// getByRole matcht das aria-label, nicht den sichtbaren Glyph (CI-Lektion #124).
// Läuft gegen `vite preview` (dist).
import { test, expect, type Page } from '@playwright/test'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

test.describe('Normrevisions-Badge im ArtikelLeser (AIG)', () => {
  test('(a) Entscheid VOR der Revision → ↻-Badge mit Revisionsdatum + AS-Fundstelle', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.goto('/gesetze/bund/AIG')
    const art5 = page.locator('#art-5')
    await art5.scrollIntoViewIfNeeded()
    // Der (einzige) Leitfall BGE 151 I 248 (Urteil 30.10.2024) hängt an Art. 5 AIG,
    // der seit dem Entscheid revidiert wurde → der Entscheid legt eine ältere Fassung aus.
    // P1-a/b Kanonik-Re-Pin (11.7.2026, amtlich deklariert): die kanonische
    // isExemplifiedBy-Fassung (kons 20260612) trägt an Art. 5 die NEUERE Fussnote
    // «in Kraft seit 12. Juni 2026» (AS 2026 231, Eurodac/Schengen) — der alte
    // Alias-Dump endete bei 15.6.2025 (AS 2025 346). max(«in Kraft seit») = 12.06.2026;
    // die Temporal-Semantik (Urteil 30.10.2024 < Revision) bleibt unverändert.
    await expect(art5.getByRole('link', { name: /BGE 151 I 248/ })).toBeVisible()
    // ↻-Marker: role=img, aria-label aus dem StatusBadge-Vokabular + Instanz-Detail
    // (Revisionsdatum + AS-Fundstelle, §7-Provenienz). aria-label ist der Matcher.
    const badge = art5.getByRole('img', { name: /Norm seit dem Entscheid revidiert/ })
    await expect(badge).toBeVisible()
    await expect(badge).toHaveAttribute('aria-label', /in Kraft seit 12\.06\.2026/)
    await expect(badge).toHaveAttribute('aria-label', /AS 2026 231/)
    expect(fehler).toEqual([])
  })

  test('(b) Entscheid NACH der Revision → kein Badge (gleich, UI-still)', async ({ page }) => {
    await page.goto('/gesetze/bund/AIG')
    const art34 = page.locator('#art-34')
    await art34.scrollIntoViewIfNeeded()
    // Art. 34 AIG wurde 2019 zuletzt revidiert; sein Leitfall (Urteil 19.2.2021)
    // datiert DANACH → dieselbe Fassung → bewusst KEIN Badge (kein «noch aktuell»-
    // Siegel, R16). Der Leitfall-Chip erscheint, der ↻-Marker aber nicht.
    await expect(art34.getByRole('link', { name: /2C_1060\/2020/ })).toBeVisible()
    await expect(art34.getByRole('img', { name: /Norm seit dem Entscheid revidiert/ })).toHaveCount(0)
  })

  test('(c) vollständiger Normtext bleibt im DOM (Ctrl+F / §15.1)', async ({ page }) => {
    await page.goto('/gesetze/bund/AIG')
    await expect(page.locator('#art-1')).toBeVisible()
    const artikelZahl = await page.locator('article[id^="art-"]').count()
    expect(artikelZahl).toBeGreaterThan(100)
  })
})
