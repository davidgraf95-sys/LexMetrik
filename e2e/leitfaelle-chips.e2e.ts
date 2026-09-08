// @shard-gruppe: 4
// Browser-Smoke der Rechtsprechungs-Auflistung am Artikel (FAHRPLAN-DATENHALTUNG
// §11.2, Weiche B). Läuft gegen `vite preview` (dist).
//
// GELÖSCHT 21.8.2026 (H5): die Fälle (a) «Artikel MIT Entscheiden zeigt die
// Auflistung», (b) «ohne Treffer/Facette steht am Artikelfuss NICHTS» und
// (d) «V3: Chip zeigt den Kurztext auf Hover + Tastatur» prüften den
// Ist-Hüllen-Artikelfuss (`[data-bezuege-zeile]`, `[data-rechtsprechung-menu]`,
// mit Pos. 12 aufgegeben). V3-Deckung stand bzw. steht: `leser-v3-panel-
// facetten` (a, Ort) + `leser-v3-panel-zaehler` (Zähler) für (a);
// `leser-v3-panel-nachzug` (f) für (b); `e2e/leser-v3-panel-kurztext.e2e.ts`
// (21.8.2026, §7b Pos. 3) für (d). Verbleibt: (c), hüllenneutral.
import { test, expect } from '@playwright/test'

test.describe('Rechtsprechungs-Auflistung im ArtikelLeser (OR)', () => {
  test('(c) vollständiger Normtext bleibt im DOM (Ctrl+F / §15.1)', async ({ page }) => {
    await page.goto('/gesetze/bund/OR')
    await expect(page.locator('#art-1')).toBeVisible()
    // Tiefe Artikel bleiben im DOM (content-visibility, kein Windowing) — die Chips
    // hängen sich nur an, sie entfernen nichts. Ein weit unten liegender Artikel und
    // die Gesamtzahl der Artikel-Knoten beweisen die Vollständigkeit.
    await expect(page.locator('#art-529')).toHaveCount(1)
    const artikelZahl = await page.locator('article[id^="art-"]').count()
    expect(artikelZahl).toBeGreaterThan(500)
  })
})
