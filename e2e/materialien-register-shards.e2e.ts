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

// ── Auflage der Gegenprüfung #802: der Rückfall ist sichtbar ─────────────────
//
// Das Kontext-Panel mit Botschaften hängt an Bestandsdaten, die sich ändern dürfen;
// die Sonde stellt sie deshalb selbst — ein Eintrag, an EMRK gebunden, wie die
// Unit-Tests ihn stellen. Geprüft wird die FLÄCHE, nicht die Bibliothek: steht der
// Hinweis da, und trägt der deutsche Titel `lang="de"`.
const REGISTER_MIT_BOTSCHAFT = {
  erzeugt: '2026-09-12',
  materialien: [{
    key: 'BOTSCHAFT-SONDE-1', behoerde: 'BR', behoerdeName: 'Bundesrat (Botschaften)',
    behoerdeKuerzel: 'BR', doktyp: 'botschaft', doktypLabel: 'Botschaft',
    titel: 'Botschaft zur Sonde', nummer: '25.999', rechtsgebiet: 'international',
    sprache: 'de', status: 'nur-live-link',
    quelleUrl: 'https://www.fedlex.admin.ch/eli/fga/2025/999/de',
    stand: '2025-01-01', rang: 1, normKeys: ['EMRK'], hinweis: null,
  }],
}

async function stelleRegister(page: import('@playwright/test').Page, i18nOk: boolean) {
  await page.route('**/materialien/register.json', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(REGISTER_MIT_BOTSCHAFT) }))
  await page.route('**/materialien/register-i18n.json', (route) => (i18nOk
    ? route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ erzeugt: '2026-09-12', titel: { 'BOTSCHAFT-SONDE-1': { fr: 'Message de la sonde' } } }) })
    : route.fulfill({ status: 404, contentType: 'application/json', body: '{}' })))
  await page.addInitScript(() => { localStorage.setItem('lexmetrik.locale', 'fr') })
}

test('FR + Übersetzungen nicht erreichbar: sichtbarer Hinweis, Titel als deutsch ausgezeichnet', async ({ page }) => {
  await stelleRegister(page, false)
  await page.goto('/gesetze/international/EMRK')
  const titel = page.getByText('Botschaft zur Sonde')
  await expect(titel).toBeVisible()
  // Der amtliche deutsche Titel bleibt stehen (§8) — aber als deutsch ausgezeichnet,
  // damit Vorlese-Software ihn nicht französisch spricht.
  await expect(titel).toHaveAttribute('lang', 'de')
  // … und die Fläche sagt im Kanon-Ton, dass ein Abruf fehlgeschlagen ist.
  const hinweis = page.locator('[data-titel-rueckfall="botschaften"]')
  await expect(hinweis).toBeVisible()
  await expect(hinweis).toContainText('Die Übersetzung der Titel konnte nicht geladen werden')
})

test('FR + Übersetzungen erreichbar: übersetzter Titel, kein Hinweis, kein lang-Attribut', async ({ page }) => {
  await stelleRegister(page, true)
  await page.goto('/gesetze/international/EMRK')
  const titel = page.getByText('Message de la sonde')
  await expect(titel).toBeVisible()
  await expect(titel).not.toHaveAttribute('lang', 'de')
  await expect(page.locator('[data-titel-rueckfall="botschaften"]')).toHaveCount(0)
})
