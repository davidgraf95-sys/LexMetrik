// axe-core-Stichprobe (FAHRPLAN-DESIGN 3.7, Zielniveau WCAG 2.1 AA aus
// Etappe 3): Startseite (zu + mit offenem Register-Panel), ein Rechner
// (Tagerechner: DatumsFeld/FristenKalender — grösste A11y-Posten, auch mit
// offenem Kalender-Popover), eine Vorlage (Arbeitsvertrag: Wizard/
// SelectionGrid) und die Zuständigkeit (deckt die PLZ-Auswahl-Kacheln ab).
//
// Tor-Politik (§8): Verstösse mit Impact critical/serious brechen den Test;
// moderate/minor werden als Anhang dokumentiert (Abnahmegrundlage für David,
// abnahme/design-2026-06/BERICHT.md), gaten aber nicht. Bekannte, im Bericht
// begründete Befunde stehen in BEKANNTE_BEFUNDE (Muster BEKANNTER_OVERFLOW,
// smoke.e2e.ts) — nie still erweitern, immer mit Bericht-Eintrag.
import { test, expect, type Page, type TestInfo } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

// Ohne reduzierte Bewegung misst axe die lc-reveal-Einblendung mitten in der
// Animation (halbtransparenter Text → falsche Kontrast-Befunde, empirisch
// fg #78786f statt ink-500). Die CSS respektiert prefers-reduced-motion
// (index.css); test.use({reducedMotion}) griff hier nicht → explizit
// emulieren, VOR der Interaktion, die die Animation auslöst.
async function oeffnen(page: Page, url: string) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(url)
}

// Regel-IDs, die als bekannt/begründet NICHT gaten (je Prüfpunkt).
// Eintrag NUR mit zugehörigem Befund-Eintrag im BERICHT.md.
// - link-in-text-block: Inline-Links (brass-700) sind nur farblich vom
//   Fliesstext unterschieden — `no-underline` ist Markenentscheid; Hebung
//   (Unterstreichung o. Ä.) = Entscheid David (BERICHT.md B-2).
// - color-contrast (nur tagerechner): FristenKalender Sa/So/arbeitsfrei in
//   ink-400 = dokumentierter E3-Kompromiss (FAHRPLAN-DESIGN 3.5,
//   «Abschwächung ist Gestaltungsabsicht; Info zusätzlich in title+Legende»);
//   Hebung = Entscheid David (BERICHT.md B-1).
const BEKANNTE_BEFUNDE: Record<string, string[]> = {
  'startseite': ['link-in-text-block'],
  'startseite-register': ['link-in-text-block'],
  'tagerechner': ['link-in-text-block', 'color-contrast'],
  'tagerechner-kalender': ['link-in-text-block', 'color-contrast'],
  'vorlage-arbeitsvertrag': ['link-in-text-block'],
  'zustaendigkeit-plz-wahl': ['link-in-text-block'],
}

async function axePruefen(page: Page, testInfo: TestInfo, punkt: string) {
  const ergebnis = await new AxeBuilder({ page }).withTags(TAGS).analyze()
  const bekannt = new Set(BEKANNTE_BEFUNDE[punkt] ?? [])
  const schwer = ergebnis.violations.filter(
    (v) => (v.impact === 'critical' || v.impact === 'serious') && !bekannt.has(v.id),
  )
  const dokumentieren = ergebnis.violations.filter((v) => !schwer.includes(v))
  if (dokumentieren.length > 0) {
    await testInfo.attach(`${punkt}-befunde-dokumentiert.json`, {
      body: JSON.stringify(
        dokumentieren.map((v) => ({
          id: v.id, impact: v.impact, help: v.help,
          knoten: v.nodes.map((n) => n.target.join(' ')),
        })),
        null, 2,
      ),
      contentType: 'application/json',
    })
  }
  expect(
    schwer.map((v) => `${v.id} (${v.impact}): ${v.help} — ${v.nodes.length} Knoten, z. B. ${v.nodes[0]?.target.join(' ')} | ${(v.nodes[0]?.failureSummary ?? '').replace(/\n/g, ' ').slice(0, 200)}`),
    `axe ${punkt}: keine critical/serious-Verstösse`,
  ).toEqual([])
}

test('Startseite', async ({ page }, testInfo) => {
  await oeffnen(page, '/')
  await expect(page.locator('h1').first()).toBeVisible()
  await axePruefen(page, testInfo, 'startseite')
})

test('Startseite mit offenem Register-Panel', async ({ page }, testInfo) => {
  await oeffnen(page, '/')
  await page.getByRole('button', { name: /öffnen$/ }).first().click()
  await axePruefen(page, testInfo, 'startseite-register')
})

test('Tagerechner', async ({ page }, testInfo) => {
  await oeffnen(page, '/rechner/tagerechner')
  await expect(page.locator('h1').first()).toBeVisible()
  await axePruefen(page, testInfo, 'tagerechner')
})

test('Tagerechner mit offenem Kalender-Popover', async ({ page }, testInfo) => {
  await oeffnen(page, '/rechner/tagerechner')
  await page.getByRole('button', { name: 'Kalender öffnen' }).first().click()
  await expect(page.getByRole('dialog', { name: 'Kalender' })).toBeVisible()
  await axePruefen(page, testInfo, 'tagerechner-kalender')
})

test('Vorlage Arbeitsvertrag', async ({ page }, testInfo) => {
  await oeffnen(page, '/vorlagen/arbeitsvertrag')
  await expect(page.locator('h1').first()).toBeVisible()
  await axePruefen(page, testInfo, 'vorlage-arbeitsvertrag')
})

test('Zuständigkeit mit PLZ-Auswahl-Kacheln', async ({ page }, testInfo) => {
  await oeffnen(page, '/rechner/zustaendigkeit#schkg')
  await page.getByLabel('Postleitzahl des Betreibungsortes').fill('1041')
  await expect(page.getByRole('button', { name: /Bottens/ })).toBeVisible()
  await axePruefen(page, testInfo, 'zustaendigkeit-plz-wahl')
})
