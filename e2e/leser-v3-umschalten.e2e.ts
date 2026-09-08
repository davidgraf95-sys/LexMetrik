// @shard-gruppe: 1
// Ansicht-Menü im Leser: D1 (bedingtes Angebot des Vermerke-Schalters) und
// B3 (aria-controls erst, wenn das Panel wirklich da ist).
//
// GELÖSCHT 21.8.2026 (H5): die Fälle (a), (a2), (b), (c) dieser Datei
// prüften FL-6 «Umschalten V1↔V3 verliert nichts» — den `?leser=v1`-Rückweg
// und den geteilten Options-Store beim Hüllenwechsel. Mit der Ist-Hülle
// fällt der Rückweg selbst; es gibt nichts mehr, wohin man umschalten
// könnte. Verbleiben (a3) und (b2), umbenannt — sie prüften schon vorher
// ausschliesslich V3-eigenes Verhalten, ohne je nach V1 zu wechseln.
import { test, expect } from '@playwright/test'
import { fehlerSammeln } from './helpers/fehlerSammeln'
import { SCHALTER_ROLLE, VERMERKE_SCHALTER_NAME, WAHL_ROLLE } from './helpers/leserBeschriftung';

test.describe('Ansicht-Menü — D1/B3', () => {
  // ── D1 (S1-Rest, gebaut im H3-Nachzug 17.8.2026) ──────────────────────────
  // «Änderungsvermerke» wird nur ANGEBOTEN, wenn der Erlass Vermerke trägt.
  // V3 zieht dieselbe Funktion `bieteAenderungsvermerkeSchalter` aus
  // `../berechnungen`, die die frühere Ist-Hülle ebenfalls zog (§5) — Regel,
  // drei Zustände und Korpus-Messung stehen dort und in
  // `src/tests/aenderungsvermerke-schalter.test.ts`.
  test('D1: «Änderungsvermerke» nur bei Erlassen, die Vermerke tragen', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    const panel = page.locator('[data-v3-ansicht-panel]')
    const oeffne = async (pfad: string) => {
      await page.goto(pfad)
      await expect(page.locator('[data-leser-v3="rahmen"]')).toBeVisible({ timeout: 20_000 })
      // Vorbedingung: die Artikel sind da. Sonst prüfte die Sonde den
      // Lade-Zustand, in dem die Funktion bewusst KONSERVATIV anbietet
      // (`erlassGeladen === false`, Herleitung in `../berechnungen`) — und
      // wäre je nach Laufzeit einmal grün und einmal rot.
      await expect(page.locator('#art-1')).toBeVisible({ timeout: 20_000 })
      await page.locator('[data-v3-ansicht]').click()
      await expect(panel).toBeVisible()
    }

    // ── §6.3-DEKLARATION (D35-F3, Entscheid David 7.9.2026) ─────────────────
    // Die Aussage des Falls ist unverändert («die Historie-Bedienung erscheint
    // NUR an Erlassen, die Vermerke tragen»); ihr Griff ist neu: aus zwei
    // Checkboxen ist EINE Radiogruppe mit drei Stellungen geworden. Die
    // Rechtsprechungs-Checkbox bleibt, was sie war.
    //
    // WAS SICH FACHLICH ÄNDERT — und warum das richtig ist: auf einem Erlass
    // OHNE Klassifikation fällt jetzt die GANZE Wahl weg, nicht nur ihre
    // «Fassung»-Stellung. Bis 7.9. blieb dort der Fussnoten-Schalter stehen,
    // weil er die 16 klassenlosen Fussnoten wirklich ausblendete; genau dieses
    // Ausblenden gibt es nicht mehr (verlustfrei). Drei Stellungen mit
    // identischer Wirkung anzubieten wäre das tote Steuerelement, das D1
    // abgeschafft hat (§8).
    //
    // ── §6.3-DEKLARATION (D35-F2, Entscheid David 7.9.2026) ─────────────────
    // Die EINE `menuitemcheckbox` war «Rechtsprechung im Kopf». Sie ist mit
    // Variante A ersatzlos gefallen; an ihrer Stelle stehen die FÜNF Schalter
    // der Rubriken-Wahl. Die Aussage des Falls bleibt Wort für Wort dieselbe —
    // die Historie-Bedienung erscheint nur an Erlassen mit Vermerken, und der
    // Rest des Menüs steht unabhängig davon —, nur die Zahl der Nachbarn
    // wechselt von 1 auf 5. Sie ist bewusst als LITERAL geprüft und nicht aus
    // `FUSS_RUBRIKEN` abgeleitet: ein Wächter, der seine Erwartung aus dem
    // Prüfling zieht, prüft nichts (§6.7).

    // POSITIV — StPO: 187 von 283 Fussnoten sind `kl:'A'`, dazu ein
    // Historie-Shard. Die Wahl steht vollzählig, dazu die eine Checkbox.
    await oeffne('/gesetze/bund/STPO')
    await expect(panel.getByRole(WAHL_ROLLE, { name: VERMERKE_SCHALTER_NAME })).toHaveCount(1)
    await expect(panel.getByRole(WAHL_ROLLE)).toHaveCount(3)
    // §6.3-DEKLARATION (D40, 7.9.2026): SECHS Rubriken-Schalter — «Fassung» ist
    // dazugekommen (David: «und wieso ist fassung nicht auch unten am
    // artikel?»). Die Aussage bleibt: die Wahl steht vollzählig.
    await expect(panel.getByRole(SCHALTER_ROLLE)).toHaveCount(6)

    // NEGATIV 1 — BS-640.100 (StG BS): 16 Fussnoten, KEINE klassifiziert, kein
    // Historie-Shard. Keine Wahl; die sechs Rubriken-Schalter bleiben.
    await oeffne('/gesetze/kanton/BS-640.100')
    await expect(panel.getByRole(WAHL_ROLLE)).toHaveCount(0)
    await expect(panel.getByRole(SCHALTER_ROLLE)).toHaveCount(6)
    // §8: nichts weggeblendet — es gibt hier wirklich keine Fassungs-Zeile …
    await expect(page.locator('[data-historie-zeile]')).toHaveCount(0)
    // … und die 16 klassenlosen Fussnoten stehen vollständig da (verlustfrei).
    await expect(page.locator('.lc-leser [data-fn-apparat]').first()).toBeVisible()

    // NEGATIV 2 — ZH-211.11: gar KEIN Struktur-Sidecar (404 → `null`). Der
    // zweideutige `null`-Fall, an dem eine naive Fassung scheitert: bei
    // geladenem Erlass heisst kein Sidecar «keine Fussnoten, also auch keine
    // Vermerke». Er zählt Paragraphen, nicht Artikel — darum eigener Anker.
    await page.goto('/gesetze/kanton/ZH-211.11')
    await expect(page.locator('[data-leser-v3="rahmen"]')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('.lc-leser article').first()).toBeVisible({ timeout: 20_000 })
    await page.locator('[data-v3-ansicht]').click()
    await expect(panel).toBeVisible()
    await expect(panel.getByRole(WAHL_ROLLE)).toHaveCount(0)
    await expect(panel.getByRole(SCHALTER_ROLLE)).toHaveCount(6)

    expect(fehler, fehler.join('\n')).toEqual([])
  })

  test('B3: Ansicht-Öffner trägt `aria-controls` erst, wenn das Panel wirklich da ist', async ({ page }) => {
    // Bug-Check 16.8.2026: der Öffner trug `aria-controls` auch im Ruhezustand,
    // in dem das Panel gar nicht gerendert wird — eine Id-Referenz ins Leere
    // (axe `aria-valid-attr-value`; ein Screenreader bietet einen Sprung an,
    // der nirgends landet, §8). Geprüft wird der VERTRAG in beiden Zuständen,
    // nicht nur die Abwesenheit des Attributs: im offenen Zustand muss die
    // referenzierte Id auch wirklich existieren, sonst wäre «weg damit» ein
    // Fix, der die Verbindung ganz zerstört.
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/gesetze/bund/BGFA')
    await expect(page.locator('[data-leser-v3="rahmen"]')).toBeVisible({ timeout: 20_000 })

    const oeffner = page.locator('[data-v3-ansicht]')
    await expect(oeffner).toHaveAttribute('aria-expanded', 'false')
    await expect(oeffner).not.toHaveAttribute('aria-controls', /./)

    await oeffner.click()
    await expect(page.locator('[data-v3-ansicht-panel]')).toBeVisible()
    await expect(oeffner).toHaveAttribute('aria-expanded', 'true')
    const ziel = await oeffner.getAttribute('aria-controls')
    expect(ziel, 'offen ohne aria-controls — die Verbindung fehlt ganz').toBeTruthy()
    await expect(
      page.locator(`[id="${ziel}"]`),
      `aria-controls zeigt auf «${ziel}» — kein solches Element im DOM`,
    ).toHaveCount(1)

    expect(fehler).toEqual([])
  })
})
