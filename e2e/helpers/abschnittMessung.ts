// e2e/helpers/abschnittMessung.ts — Messkern für R8 «Nichts abgeschnitten»
// (W2·24-DESIGN-IDENTITAET, Prüfbefund 6.9.2026).
//
// Reine MESSWERKZEUGE, kein Fix. Jede Funktion liefert `RohFund[]` — die
// aufrufende Spec (`e2e/kein-abschnitt.e2e.ts`) filtert gegen die Allowlist,
// schreibt den JSON-Report und trägt die Assertion. Getrennt gehalten, damit
// die reine Geometrie-Logik unabhängig von Playwright-Testorganisation bleibt
// (§5 — eine Messstelle statt einer pro Kategorie-Test).
//
// KATEGORIEN (Auftrag R8, Abschnitt in w224-pruef-r2-funde.md):
//   a  scrollWidth > clientWidth ohne Scroll-Container mit Affordanz (lc-scrollrand-x)
//   b  text-overflow:ellipsis / -webkit-line-clamp OHNE title (self/Vorfahre)
//   c  Element verlässt den Viewport links/rechts (≥ 8 px), ungeklippt
//   d  Sprungziel #art-… liegt unter dem sticky Kopf
//   e  geöffnetes Menü/Dialog/Listbox/Popover ragt aus dem Viewport
//   f  Reiter-Text: Ellipsis schneidet mitten im Wort
//   g  <table> ohne scrollbaren Vorfahren
//   h  Wortmarke/Logo abgeschnitten oder ausserhalb
//
// TOLERANZEN: 2 px für Rundung (Kategorien a/b/g), 8 px für c (Auftrag nennt
// diese Zahl ausdrücklich — Sub-Pixel-Antialiasing wirft sonst Dauerrauschen).
import type { Page } from '@playwright/test'

export interface RohFund {
  kategorie: string
  selektor: string
  messwert: string
}

const TOL = 2
const TOL_VIEWPORT = 8

/** Die eine Geometrie-Sonde: Kategorien a, b, c, g, h in EINEM DOM-Durchlauf
 *  (kein Mehrfach-Scan derselben ~zigtausend Knoten pro Kategorie). */
export async function geometrieScan(page: Page): Promise<RohFund[]> {
  return page.evaluate(({ tol, tolViewport }) => {
    const funde: { kategorie: string; selektor: string; messwert: string }[] = []
    const grenzeRechts = document.documentElement.clientWidth

    function bezeichner(el: Element): string {
      const klasse = el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : ''
      const text = (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 40)
      return `${el.tagName.toLowerCase()}${klasse} «${text}»`
    }

    function sichtbar(el: Element): boolean {
      const cs = getComputedStyle(el)
      if (cs.display === 'none' || cs.visibility === 'hidden' || cs.visibility === 'collapse') return false
      const rect = el.getBoundingClientRect()
      return rect.width > 0 && rect.height > 0
    }

    /** Trägt irgendein Vorfahre (inkl. sich selbst) einen horizontalen
     *  Scroll-Container MIT Affordanz-Klasse? Dann ist das Element GEFASST. */
    function inAffordanziertemScroller(el: Element): boolean {
      let a: Element | null = el
      while (a && a !== document.body) {
        const cs = getComputedStyle(a)
        if ((cs.overflowX === 'auto' || cs.overflowX === 'scroll') && a.classList.contains('lc-scrollrand-x')) return true
        a = a.parentElement
      }
      return false
    }

    /** Trägt irgendein Vorfahre einen klippenden overflow-x (auto/scroll/hidden/clip)?
     *  Für Kategorie c: ein Element, das geklippt wird, "läuft" nicht sichtbar über. */
    function geklippt(el: Element): boolean {
      let a = el.parentElement
      while (a && a !== document.documentElement) {
        const ox = getComputedStyle(a).overflowX
        if (ox === 'auto' || ox === 'scroll' || ox === 'hidden' || ox === 'clip') return true
        a = a.parentElement
      }
      return false
    }

    function hatTitleAmVorfahren(el: Element): boolean {
      let a: Element | null = el
      while (a && a !== document.documentElement) {
        if (a.getAttribute('title')) return true
        a = a.parentElement
      }
      return false
    }

    const alle = document.querySelectorAll('body *')
    for (const el of alle) {
      const tag = el.tagName
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEMPLATE' || tag === 'svg' || el.namespaceURI?.includes('svg')) continue
      if (!sichtbar(el)) continue
      const cs = getComputedStyle(el)

      // ── a) scrollWidth > clientWidth ohne affordanzierten Scroller ─────────
      // NACHGEZOGEN (erster Lauf 6.9.2026): `clientWidth > 0` liess die
      // Screenreader-only-Technik (`.sr-only`: 1×1 px, `overflow: hidden`,
      // visuell nie sichtbar) als „Überlauf ohne Scroller" durchgehen — 5019
      // von 5384 Funden im ersten Durchlauf waren allein dieser eine Fehlton.
      // Ein 1×1-px-Kasten kann für sehende Nutzer nichts „abschneiden", das
      // je sichtbar war (R8 misst VISUELLE Kappung). Schwelle > 4 px statt
      // > 0 — real schmale, aber sichtbare Elemente (z. B. ein 6-px-Strich)
      // bleiben erfasst, die 1-px-A11y-Technik nicht mehr.
      const htmlEl = el as HTMLElement
      if (htmlEl.clientWidth > 4 && htmlEl.scrollWidth > htmlEl.clientWidth + tol) {
        if (!(cs.overflowX === 'auto' || cs.overflowX === 'scroll') || !el.classList.contains('lc-scrollrand-x')) {
          if (!inAffordanziertemScroller(el)) {
            // Kein Kind eines bereits gemeldeten Vorfahren-Überläufers doppelt melden.
            const elternUeberlauf = el.parentElement
              && (el.parentElement as HTMLElement).clientWidth > 4
              && (el.parentElement as HTMLElement).scrollWidth > (el.parentElement as HTMLElement).clientWidth + tol
              && !inAffordanziertemScroller(el.parentElement)
            if (!elternUeberlauf) {
              funde.push({
                kategorie: 'a-ueberlauf-ohne-scroller',
                selektor: bezeichner(el),
                messwert: `scrollWidth=${htmlEl.scrollWidth} clientWidth=${htmlEl.clientWidth}`,
              })
            }
          }
        }
      }

      // ── b) ellipsis/line-clamp ohne title ───────────────────────────────────
      const istLineClamp = cs.display === '-webkit-box' && cs.getPropertyValue('-webkit-line-clamp') !== 'none' && cs.getPropertyValue('-webkit-line-clamp') !== ''
      const istEllipsis = cs.textOverflow === 'ellipsis' && cs.overflow !== 'visible'
      if (istLineClamp || istEllipsis) {
        const truncated = istLineClamp
          ? htmlEl.scrollHeight > htmlEl.clientHeight + tol
          : htmlEl.scrollWidth > htmlEl.clientWidth + tol
        if (truncated && !hatTitleAmVorfahren(el)) {
          funde.push({
            kategorie: 'b-ellipsis-ohne-title',
            selektor: bezeichner(el),
            messwert: istLineClamp
              ? `line-clamp scrollHeight=${htmlEl.scrollHeight} clientHeight=${htmlEl.clientHeight}`
              : `ellipsis scrollWidth=${htmlEl.scrollWidth} clientWidth=${htmlEl.clientWidth}`,
          })
        }
      }

      // ── c) verlässt den Viewport links/rechts, ungeklippt ───────────────────
      const rect = el.getBoundingClientRect()
      if (rect.width > 0) {
        const ueberRechts = rect.right - grenzeRechts
        const ueberLinks = -rect.left
        if ((ueberRechts > tolViewport || ueberLinks > tolViewport) && !geklippt(el)) {
          funde.push({
            kategorie: 'c-verlaesst-viewport',
            selektor: bezeichner(el),
            messwert: `rechts=${Math.round(ueberRechts)}px links=${Math.round(ueberLinks)}px (Fenster ${grenzeRechts}px)`,
          })
        }
      }

      // ── g) <table> ohne scrollbaren Vorfahren ───────────────────────────────
      if (tag === 'TABLE' && htmlEl.scrollWidth > htmlEl.clientWidth + tol) {
        let a = el.parentElement
        let gefasst = false
        while (a && a !== document.documentElement) {
          const ox = getComputedStyle(a).overflowX
          if (ox === 'auto' || ox === 'scroll') { gefasst = true; break }
          a = a.parentElement
        }
        if (!gefasst) {
          funde.push({
            kategorie: 'g-tabelle-ohne-scroll',
            selektor: bezeichner(el),
            messwert: `scrollWidth=${htmlEl.scrollWidth} clientWidth=${htmlEl.clientWidth}`,
          })
        }
      }
    }

    // ── h) Wortmarke/Logo ────────────────────────────────────────────────────
    const marke = document.querySelector('header.sticky a[aria-label="LexMetrik – Startseite"]') as HTMLElement | null
    if (marke && sichtbar(marke)) {
      const r = marke.getBoundingClientRect()
      const ueberRechts = r.right - grenzeRechts
      const ueberLinks = -r.left
      if (marke.scrollWidth > marke.clientWidth + tol || ueberRechts > tolViewport || ueberLinks > tolViewport) {
        funde.push({
          kategorie: 'h-marke-abgeschnitten',
          selektor: bezeichner(marke),
          messwert: `scrollWidth=${marke.scrollWidth} clientWidth=${marke.clientWidth} rechts=${Math.round(ueberRechts)}px links=${Math.round(ueberLinks)}px`,
        })
      }
    }

    return funde
  }, { tol: TOL, tolViewport: TOL_VIEWPORT })
}

/** Kategorie f — Reiter-Text: schneidet die Ellipsis mitten im Wort?
 *  Scope bewusst auf Reiter/Tabs beschränkt (nicht jede gekappte Zeile app-weit
 *  — das deckt bereits Kategorie b; hier geht es um die Kürzel-Regel der
 *  Reiterleiste, Prüfbefund F6/R7). */
export async function reiterWortgrenzeScan(page: Page): Promise<RohFund[]> {
  return page.evaluate((tol) => {
    const funde: { kategorie: string; selektor: string; messwert: string }[] = []
    const knoten = document.querySelectorAll('[role="tab"], nav[aria-label="Offene Reiter"] a, nav[aria-label="Offene Reiter"] [data-reiter-aktiv]')
    for (const el of knoten) {
      const htmlEl = el as HTMLElement
      const cs = getComputedStyle(htmlEl)
      if (cs.display === 'none' || htmlEl.clientWidth === 0) continue
      if (htmlEl.scrollWidth <= htmlEl.clientWidth + tol) continue // nicht gekappt
      const text = (htmlEl.textContent ?? '').trim()
      if (text.length < 3) continue
      // Canvas-Messung mit dem tatsächlichen Font des Elements.
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) continue
      ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
      const ellipsisBreite = ctx.measureText('…').width
      const verfuegbar = htmlEl.clientWidth - ellipsisBreite
      let schnittIndex = text.length
      for (let i = 1; i <= text.length; i++) {
        if (ctx.measureText(text.slice(0, i)).width > verfuegbar) { schnittIndex = i - 1; break }
      }
      if (schnittIndex <= 0 || schnittIndex >= text.length) continue // ganz weg oder passt doch
      const vorZeichen = text[schnittIndex - 1]
      const naechstesZeichen = text[schnittIndex]
      const grenze = /[\s\-/.,]/
      // Mitten im Wort: weder das letzte sichtbare noch das nächste Zeichen
      // liegt an einer Wortgrenze.
      if (!grenze.test(vorZeichen) && !grenze.test(naechstesZeichen)) {
        const klasse = htmlEl.className && typeof htmlEl.className === 'string' ? '.' + htmlEl.className.trim().split(/\s+/)[0] : ''
        funde.push({
          kategorie: 'f-reiter-mitten-im-wort',
          selektor: `${htmlEl.tagName.toLowerCase()}${klasse} «${text.slice(0, 40)}»`,
          messwert: `Schnitt nach «${text.slice(0, schnittIndex)}» (Zeichen ${schnittIndex}/${text.length})`,
        })
      }
    }
    return funde
  }, TOL)
}

/** Kategorie d — Sprungziel `#art-…` liegt unter dem sticky Kopf.
 *  Springt per Hash-Navigation (wie ein echter Link), misst danach die
 *  Ziel-Oberkante gegen die sticky-Kopf-Unterkante. */
export async function sprungzielUnterKopf(page: Page, ankerId: string): Promise<RohFund[]> {
  await page.evaluate((id) => {
    window.location.hash = ''
    window.location.hash = id
  }, ankerId)
  await page.waitForTimeout(500) // Sprung + evtl. Scroll-Animation
  return page.evaluate((id) => {
    const funde: { kategorie: string; selektor: string; messwert: string }[] = []
    const ziel = document.getElementById(id)
    const kopf = document.querySelector('header.sticky')
    if (!ziel || !kopf) return funde
    const zielTop = ziel.getBoundingClientRect().top
    const kopfUnten = kopf.getBoundingClientRect().bottom
    if (zielTop < kopfUnten - 1) {
      funde.push({
        kategorie: 'd-sprungziel-unter-kopf',
        selektor: `#${id}`,
        messwert: `Ziel-Oberkante=${Math.round(zielTop)}px Kopf-Unterkante=${Math.round(kopfUnten)}px`,
      })
    }
    return funde
  }, ankerId)
}

/** Kategorie e — geöffnetes Menü/Dialog/Listbox/Popover ragt aus dem Viewport.
 *  Findet Trigger über aria-haspopup/aria-controls/aria-expanded, öffnet sie
 *  nacheinander, misst die geöffnete Fläche, schliesst wieder (Escape) bevor
 *  der nächste Trigger folgt. */
export async function popoverUeberlaufScan(page: Page): Promise<RohFund[]> {
  const funde: RohFund[] = []
  const triggerSelektor = '[aria-haspopup]:not([aria-haspopup="false"]), [aria-expanded]'
  const anzahl = await page.locator(triggerSelektor).count().catch(() => 0)
  const maxTrigger = Math.min(anzahl, 12) // Deckel gegen Laufzeit-Ausreisser auf dichten Seiten
  const START = Date.now()
  const ZEITBUDGET_MS = 15_000 // Deckel für die GANZE Seite — s. u. Robustheits-Nachtrag
  // ── NACHGEZOGEN (zweiter Lauf 6.9.2026) · EIN STARRER TRIGGER DARF NICHT DIE
  // GANZE SERIELLE DATEI KILLEN ────────────────────────────────────────────
  // `/gesetze/bund/OR — 320` riss das 30-s-Test-Timeout an `trigger.evaluate`
  // (Index 7) — auf dem inhaltsschweren OR (~75 000 DOM-Knoten, s.
  // `leserBereit.ts`) reicht ein einziger Trigger, dessen Index nach einem
  // vorherigen Klick auf ein ANDERES/entferntes Element zeigt (Re-Render
  // verschiebt die Trefferliste), um die ganze Datei zu töten — `mode:
  // 'serial'` übersprang danach 10 Folgetests INKLUSIVE des Berichts. Ein
  // Mess-Timeout darf nie den Bericht selbst verschlucken (§6.7 sinngemäss:
  // ein Werkzeug, das bei einem einzigen zickigen Trigger verstummt, ist
  // schlimmer als eines, das den Trigger überspringt). Fix: jede
  // Playwright-Aktion bekommt ein KURZES eigenes Timeout, jeder Trigger läuft
  // in einem eigenen try/catch (ein Fehler überspringt NUR ihn), und ein
  // Gesamtbudget pro Seite deckelt Ausreisser zusätzlich nach oben.
  for (let i = 0; i < maxTrigger; i++) {
    if (Date.now() - START > ZEITBUDGET_MS) break
    try {
      const trigger = page.locator(triggerSelektor).nth(i)
      if (!(await trigger.isVisible({ timeout: 2000 }).catch(() => false))) continue
      const label = await trigger.evaluate(
        (el) => el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 30) || el.tagName,
        undefined,
        { timeout: 3000 },
      )
      const warExpanded = await trigger.getAttribute('aria-expanded', { timeout: 2000 })
      if (warExpanded === 'true') continue // bereits offen (z. B. Dauer-Popover) — nicht fremd zuklappen
      await trigger.click({ timeout: 3000 })
      await page.waitForTimeout(200)
      await messenUndSchliessen(page, label, funde)
    } catch {
      continue // dieser Trigger ist das Problem, nicht die Messung der Seite
    }
  }
  return funde
}

async function messenUndSchliessen(page: Page, label: string, funde: RohFund[]): Promise<void> {
  const messung = await page.evaluate(() => {
    const grenzeRechts = document.documentElement.clientWidth
    const grenzeUnten = document.documentElement.clientHeight
    const ziele = document.querySelectorAll('[role="menu"], [role="dialog"], [role="listbox"], [popover]:popover-open, [data-state="open"]')
    const treffer: { selektor: string; messwert: string }[] = []
    for (const z of ziele) {
      const r = z.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) continue
      const rechts = r.right - grenzeRechts
      const links = -r.left
      const unten = r.bottom - grenzeUnten
      if (rechts > 4 || links > 4 || unten > 4) {
        const klasse = z.className && typeof z.className === 'string' ? '.' + z.className.trim().split(/\s+/)[0] : ''
        treffer.push({
          selektor: `${z.tagName.toLowerCase()}${klasse}`,
          messwert: `rechts=${Math.round(rechts)}px links=${Math.round(links)}px unten=${Math.round(unten)}px`,
        })
      }
    }
    return treffer
  })
  for (const m of messung) {
    funde.push({ kategorie: 'e-popover-ausserhalb', selektor: `Trigger «${label}» → ${m.selektor}`, messwert: m.messwert })
  }
  // Schliessen — Escape ist der app-weite Rückweg (mehrfach im Bestand belegt).
  await page.keyboard.press('Escape').catch(() => {})
  await page.waitForTimeout(100)
}
