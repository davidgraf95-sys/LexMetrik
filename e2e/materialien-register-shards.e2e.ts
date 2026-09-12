// @shard-gruppe: 3
import { test, expect } from '@playwright/test'
import { fehlerSammeln } from './helpers/fehlerSammeln'

// ─── Deckel-Reserven vor ZH: die Register-Projektionen bleiben getrennt ──────
//
// Seit dem 12.9.2026 liegt das Materialien-Register in drei Dateien (Messung:
// bibliothek/materialien/2026-09-12-register-deckel-messung.md). Der Gewinn steht
// und fällt damit, WELCHE davon ein Browser tatsächlich zieht — und das ist keine
// Eigenschaft, die ein Unit-Test sieht: sie entsteht erst aus Lade-Pfad, Locale
// und Komponenten-Effekt zusammen. Ohne diese Sonde könnte ein späterer Griff nach
// `titelFr` im deutschen Pfad die 83,7 KB still zurückholen (§15).
//
// Gezählt werden Netzwerk-Abrufe, nicht Bildschirminhalt: die Zahl ist der Beleg.

async function zaehleRegisterAbrufe(page: import('@playwright/test').Page, ziel: string) {
  const abrufe: string[] = []
  page.on('request', (r) => {
    const u = new URL(r.url()).pathname
    if (u.startsWith('/materialien/register')) abrufe.push(u)
  })
  await page.goto(ziel)
  return abrufe
}

test('Deutscher Lesefluss: Kern-Register ja, FR/IT-Titel und Provenienz nein', async ({ page }) => {
  const fehler = fehlerSammeln(page)
  const abrufe = await zaehleRegisterAbrufe(page, '/materialien')
  await expect(page.getByRole('heading', { name: /Materialien/, level: 1 })).toBeVisible()
  // Die Liste ist da (der Kern trägt Titel und Behörde) …
  await expect(page.getByRole('link', { name: /Umstrukturierungen/ }).first()).toBeVisible()
  // … und genau EIN Register-Abruf, nämlich der Kern.
  expect(abrufe.filter((u) => u === '/materialien/register.json').length,
    `Kern-Register genau einmal; gezählt: ${abrufe.join(', ')}`).toBe(1)
  expect(abrufe.filter((u) => u.includes('register-i18n')),
    'FR/IT-Titel gehören NICHT in den deutschen Lesefluss (§15)').toEqual([])
  expect(abrufe.filter((u) => u.includes('register-provenienz')),
    'Provenienz (sha, Verfahrensketten) ist kein Browser-Kanal').toEqual([])
  expect(fehler, `Konsolen-/Seitenfehler:\n${fehler.join('\n')}`).toEqual([])
})

test('Kontext-Panel auf Französisch: FR/IT-Titel werden nachgeladen, Provenienz nie', async ({ page }) => {
  const fehler = fehlerSammeln(page)
  await page.addInitScript(() => { localStorage.setItem('lexmetrik.locale', 'fr') })
  const abrufe = await zaehleRegisterAbrufe(page, '/gesetze/international/EMRK')
  // Das Kontext-Panel dieser Seite fragt Botschaften/Vernehmlassungen an; erst dieser
  // Weg zieht die Übersetzungen — eine Datei mehr, nicht der alte Monolith zurück.
  await expect.poll(() => abrufe.filter((u) => u.includes('register-i18n')).length,
    { message: `FR-Panel muss die Übersetzungen holen; gezählt: ${abrufe.join(', ')}` })
    .toBeGreaterThan(0)
  expect(abrufe.filter((u) => u.includes('register-i18n')).length,
    'genau einmal je Session (gecachte Promise)').toBe(1)
  expect(abrufe.filter((u) => u.includes('register-provenienz')),
    'Provenienz bleibt auch auf FR/IT draussen').toEqual([])
  expect(fehler, `Konsolen-/Seitenfehler:\n${fehler.join('\n')}`).toEqual([])
})
