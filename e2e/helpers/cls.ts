// Diagnose-tauglicher CLS-Beobachter für die e2e-Specs (CI-Härtung 18.7.2026).
//
// Hintergrund: Auf den 2-vCPU-CI-Runnern messen die A9-Scroll/Throttle-Tests
// (leser-gliederung-a33, norm-sprung) stabil CLS ~0.10–0.113 (Budget 0.05),
// während dieselben Tests lokal 0.002–0.004 liefern — selbst unter 20×-Drossel.
// Die bisherige Inline-Messung nach `window.__cls` sagt aber NICHT, WELCHES
// Element auf dem Runner shiftet. Dieser Helfer zählt die CLS-Summe unverändert
// (nur input-freie Shifts, Mess-Semantik byte-gleich zur bisherigen Inline-
// Variante, §6.3), sammelt ZUSÄTZLICH je Shift die Quellen-Elemente
// (tagName+id+class), previousRect/currentRect (gerundet) und den nav-relativen
// Zeitstempel nach `window.__clsQuellen`. Bei Budget-Überschreitung nennt die
// expect-Meldung so im Klartext die Top-Quellen — der nächste rote CI-Lauf sagt
// direkt, was shiftet (Diagnose statt Rätselraten).
import type { Page } from '@playwright/test'

// Installiert den Beobachter im Seitenkontext. `buffered` bleibt dem Aufrufer
// überlassen, damit das Mess-Fenster byte-gleich zur bisherigen Inline-Messung
// der jeweiligen Spec bleibt (a33/norm-sprung nutzen `buffered: true`).
export async function clsBeobachtenInstallieren(page: Page, buffered: boolean): Promise<void> {
  await page.evaluate((buffered) => {
    interface Q { el: string; von: string; nach: string }
    interface S { wert: number; tMs: number; quellen: Q[] }
    const w = window as unknown as {
      __cls: number
      __clsQuellen: S[]
      __clsInstallMs: number
    }
    w.__cls = 0
    w.__clsQuellen = []
    w.__clsInstallMs = Math.round(performance.now())

    const rect = (r: DOMRectReadOnly | null | undefined): string =>
      r ? `${Math.round(r.x)},${Math.round(r.y)}·${Math.round(r.width)}×${Math.round(r.height)}` : '—'

    const nenne = (n: Node | null): string => {
      const el = n as Element | null
      if (!el || el.nodeType !== 1 || !el.tagName) return '(kein Element)'
      const tag = el.tagName.toLowerCase()
      const id = el.id ? `#${el.id}` : ''
      const klasse =
        typeof el.className === 'string' && el.className.trim()
          ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
          : ''
      return `${tag}${id}${klasse}`
    }

    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as unknown as {
        value: number
        hadRecentInput: boolean
        startTime: number
        sources?: { node: Node | null; previousRect: DOMRectReadOnly; currentRect: DOMRectReadOnly }[]
      }[]) {
        if (e.hadRecentInput) continue
        w.__cls += e.value
        const quellen = (e.sources ?? []).slice(0, 3).map((s) => ({
          el: nenne(s.node),
          von: rect(s.previousRect),
          nach: rect(s.currentRect),
        }))
        w.__clsQuellen.push({ wert: e.value, tMs: Math.round(e.startTime), quellen })
      }
    }).observe({ type: 'layout-shift', buffered })
  }, buffered)
}

// Liest CLS-Summe + einen kompakten, nach Shift-Beitrag sortierten Bericht der
// Top-Quellen (Top 5 Shifts, je bis 3 Quellen). Der `Beobachter@Xms`-Marker
// erlaubt es, Lade-Shifts (tMs < X, via `buffered` nachgezogen) von den durch
// die gemessene Interaktion ausgelösten Shifts (tMs > X) zu unterscheiden.
export async function clsAuslesen(page: Page): Promise<{ cls: number; bericht: string }> {
  return page.evaluate(() => {
    interface Q { el: string; von: string; nach: string }
    interface S { wert: number; tMs: number; quellen: Q[] }
    const w = window as unknown as {
      __cls?: number
      __clsQuellen?: S[]
      __clsInstallMs?: number
    }
    const cls = w.__cls ?? 0
    const shifts = (w.__clsQuellen ?? []).slice().sort((a, b) => b.wert - a.wert).slice(0, 5)
    if (shifts.length === 0) return { cls, bericht: '(keine Shift-Quellen erfasst)' }
    const install = w.__clsInstallMs ?? 0
    const zeilen = shifts.map((s) => {
      const els = s.quellen.length
        ? s.quellen.map((q) => `${q.el} ${q.von}→${q.nach}`).join('; ')
        : '(ohne Quelle)'
      return `Δ${s.wert.toFixed(4)} @${s.tMs}ms [${els}]`
    })
    return { cls, bericht: `Beobachter@${install}ms · Top-Quellen: ${zeilen.join(' || ')}` }
  })
}
