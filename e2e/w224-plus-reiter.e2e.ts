// @shard-gruppe: 2
// ═══ D19 · «+»-KNOPF ERZEUGT EINEN NEUEN REITER (David 6.9.2026) ════════════
//
// David wörtlich: «in der tab zeile oben soll man mit plus einen neuen reiter
// erzeugen können». Browser-Vorbild: ein «+» am Ende der Arbeitsleiste legt
// einen LEEREN Reiter an (Kurzform «Neuer Reiter»), macht ihn aktiv, zeigt «/»
// und schickt den Fokus in die Kopf-Suche. Die erste Navigation/Suche füllt
// GENAU diesen Reiter — die D7-Regel «Navigation ersetzt den aktiven Reiter»
// (§5a Ziff. 3) greift dafür unverändert, weil `TabTracker.tsx` den leeren
// Reiter trotz Pfad «/» als aktiv führt (D7 kennt sonst KEINEN Reiter für die
// Startseite). Höchstens EIN leerer Reiter gleichzeitig: ein zweiter Klick auf
// «+» aktiviert den bestehenden.
//
// ROT ZU BEKOMMEN (§6.7 — beide Fälle einmal gefahren, 6.9.2026):
//   (a) `lib/tabs.neuerLeererReiter` entfernen ⇒ der Klick auf «+» tut nichts,
//       kein Reiter entsteht.
//   (b) den D19-Zweig in `TabTracker.tsx` (`hatLeerenReiter`) entfernen ⇒ die
//       Suche aus dem leeren Reiter legt einen ZWEITEN Reiter an, statt ihn zu
//       füllen — der zweite Fall unten («Suche füllt DENSELBEN Reiter») wird
//       rot (2 Reiter statt 1).
import { test, expect, type Page } from '@playwright/test'
import { warteAufSuchindex } from './helpers/warteAufSuchindex'

const REITER = 'nav[aria-label="Offene Reiter"]'
const aktiv = (page: Page) => page.locator(`${REITER} [data-reiter-aktiv="true"]`)
// `exact: true`: sobald der leere Reiter existiert, tragen auch SEIN eigener
// Reiter-Knopf («Reiter 1: Neuer Reiter») und sein Schliess-✕ («Reiter «Neuer
// Reiter» schliessen») die Zeichenkette «Neuer Reiter» als TEIL ihres
// Accessible Name — Playwrights Substring-Vergleich fände dann drei Treffer
// statt des einen «+»-Knopfs.
const plusKnopf = (page: Page) => page.locator(REITER).getByRole('button', { name: 'Neuer Reiter', exact: true })
const kopfFeld = (page: Page) => page.getByRole('combobox', { name: /LexMetrik durchsuchen/ })

/** Die gespeicherte Reiter-Liste — die Wahrheit, die auch den Neustart übersteht. */
const tabs = (page: Page) => page.evaluate(() =>
  JSON.parse(localStorage.getItem('lexmetrik-tabs') ?? '[]') as { path: string; leer?: boolean }[])

test.describe.configure({ timeout: 60_000 })

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  // Startroute BEWUSST ohne eigenen Reiter (analog w224-reiter-umordnen-d16):
  // sonst legte der TabTracker beim Laden bereits einen Reiter an und die
  // «genau 1 Reiter»-Messung unten wäre verfälscht.
  await page.goto('/kontakt')
  await expect(plusKnopf(page)).toBeVisible()
})

test('Klick auf «+» legt einen leeren, aktiven Reiter an und schickt den Fokus in die Kopf-Suche', async ({ page }) => {
  await plusKnopf(page).click()
  await expect(page).toHaveURL(/\/$/)
  expect(await tabs(page)).toEqual([{ path: '/', leer: true }])
  await expect(aktiv(page)).toContainText('Neuer Reiter')
  await expect(kopfFeld(page)).toBeFocused()
})

test('Suche füllt DENSELBEN Reiter — kein zweiter, die Zahl bleibt', async ({ page }) => {
  await plusKnopf(page).click()
  const feld = kopfFeld(page)
  await expect(feld).toBeFocused()
  await feld.fill('OR 257d')
  await expect(page.getByRole('listbox', { name: 'Suchtreffer' })).toBeVisible()
  // §17-Wurzelfix (Fixer 1h, offener Punkt «Aus Fixer 1e»): `aufTaste` in
  // HeaderSuche.tsx navigiert auf Enter erst, wenn `allesGeladen` true ist —
  // vorher wartete dieser Test dafür auf die Playwright-Standarduhr (10 s),
  // nicht auf den Index-Zustand selbst. Auf den Index warten, DANN Enter.
  await warteAufSuchindex(page)
  await feld.press('Enter')
  await expect(page).toHaveURL(/\/gesetze\/bund\/OR#art-257_d$/)
  // Genau EIN Reiter — der leere ist gefüllt, nicht verdoppelt.
  const t = await tabs(page)
  expect(t.length).toBe(1)
  expect(t[0].leer).toBeUndefined()
  await expect(aktiv(page)).toContainText('257d OR')
})

test('zweiter Klick auf «+» aktiviert den bestehenden leeren Reiter statt einen zweiten anzulegen', async ({ page }) => {
  await plusKnopf(page).click()
  expect(await tabs(page)).toEqual([{ path: '/', leer: true }])
  await plusKnopf(page).click()
  expect(await tabs(page)).toEqual([{ path: '/', leer: true }])
})

test('Alt+T legt denselben leeren Reiter an wie der Klick', async ({ page }) => {
  await page.keyboard.press('Alt+T')
  await expect(page).toHaveURL(/\/$/)
  expect(await tabs(page)).toEqual([{ path: '/', leer: true }])
  await expect(kopfFeld(page)).toBeFocused()
})

test('Reload: der leere Reiter übersteht den Neustart', async ({ page }) => {
  await plusKnopf(page).click()
  await page.reload()
  await expect(plusKnopf(page)).toBeVisible()
  await expect(aktiv(page)).toContainText('Neuer Reiter')
  expect(await tabs(page)).toEqual([{ path: '/', leer: true }])
})
